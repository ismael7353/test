import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { signOut } from '../api/auth'
import { ensureShop, fetchMyShop } from '../api/shops'
import { useSession } from '../hooks/useSession'
import { isPro } from '../lib/format'
import Icon from '../components/Icon'
import PageLoading from '../components/PageLoading'
import OrdersPanel from './dashboard/OrdersPanel'
import PostsPanel from './dashboard/PostsPanel'
import StatsPanel from './dashboard/StatsPanel'
import StoryComposer from './dashboard/StoryComposer'
import ShopSettings from './dashboard/ShopSettings'

function NoShop({ user, onCreated }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function start() {
    setBusy(true); setError('')
    try { await ensureShop(user); onCreated() } catch (e) { setError(e.message || 'Impossible de créer votre espace.'); setBusy(false) }
  }
  return (
    <div className="card pad">
      <h2>Bienvenue sur Vendeo</h2>
      <p className="mu">Publiez, vendez, suivez des boutiques et discutez : tout se fait avec le même compte.</p>
      <div className="grid">
        <Link className="btn" to="/messages">Mes messages</Link>
        <Link className="btn" to="/profile">Mon profil</Link>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="pri block" style={{ marginTop: 10 }} disabled={busy} onClick={start}>{busy ? 'Création…' : 'Activer mon espace vendeur'}</button>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useSession()
  const navigate = useNavigate()
  const [shop, setShop] = useState(undefined) // undefined = chargement, null = pas encore de boutique
  const [shopError, setShopError] = useState('')

  const loadShop = useCallback(async () => {
    setShopError('')
    try {
      setShop(await fetchMyShop(user.id))
    } catch (error) {
      setShopError(error.message || 'Impossible de charger votre boutique.')
      setShop(undefined)
    }
  }, [user])
  useEffect(() => { if (user) loadShop() }, [user, loadShop])

  if (loading) return <PageLoading label="Vérification de votre compte…" />
  if (!user) return <Navigate to="/login" replace />
  if (shopError) return <div className="card pad" role="alert"><p className="error">{shopError}</p><button className="pri" onClick={loadShop}>Réessayer</button></div>
  if (shop === undefined) return <PageLoading label="Chargement de votre espace…" />
  if (shop === null) return <NoShop user={user} onCreated={() => navigate('/profile', { replace: true, state: { message: 'Espace vendeur activé. Ajoutez vos moyens de contact pour que les clients puissent vous joindre.' } })} />

  const pro = isPro(shop)

  return (
    <div className="seller-dashboard">
      <header className="seller-overview">
        <div className="seller-welcome">
          <div>
            <span className="eyebrow">ESPACE VENDEUR</span>
            <h1>Votre activité, en un coup d’œil.</h1>
            <p className="mu">Gérez votre boutique, vos produits et vos commandes depuis un seul endroit.</p>
          </div>
          <div className={`seller-plan ${pro ? 'is-pro' : ''}`}>
            <span className="seller-plan-mark"><Icon name={pro ? 'sparkle' : 'user'} /></span>
            <div><b>{pro ? 'Vendeo Pro' : 'Formule gratuite'}</b><span>{pro ? 'Visibilité et outils avancés actifs' : 'Jusqu’à 5 publications visibles'}</span></div>
            <Link to={pro ? '/premium' : '/plans'}>{pro ? 'Avantages Pro' : 'Découvrir Pro'} <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="seller-shortcuts">
          <Link className="btn pri" to="/publish"><span aria-hidden="true">＋</span> Ajouter un produit</Link>
          <Link className="btn" to={`/shop/${shop.slug}`}>Voir ma boutique <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <nav className="seller-nav" aria-label="Sections du tableau de bord">
        <a href="#seller-stats">Statistiques</a>
        <a href="#seller-shop-settings">Ma boutique</a>
        <a href="#seller-publications">Publications</a>
        <a href="#seller-orders">Commandes</a>
        <a href="#seller-stories">Stories</a>
      </nav>
      <section id="seller-stats" className="seller-anchor" aria-label="Statistiques de la boutique">
        <StatsPanel shop={shop} />
      </section>
      <section id="seller-shop-settings" className="seller-anchor">
        <ShopSettings shop={shop} onChange={loadShop} onSignOut={signOut} />
      </section>
      <div className="seller-sections">
        <section id="seller-publications" className="seller-section seller-publications"><PostsPanel shop={shop} /></section>
        <section id="seller-orders" className="seller-section seller-orders"><OrdersPanel shop={shop} /></section>
        <section id="seller-stories" className="seller-section seller-stories"><StoryComposer shop={shop} /></section>
      </div>
    </div>
  )
}
