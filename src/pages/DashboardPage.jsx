import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { signOut } from '../api/auth'
import { fetchMyShop } from '../api/shops'
import { useSession } from '../hooks/useSession'
import { isPro } from '../lib/format'
import Icon from '../components/Icon'
import CreateShopForm from './dashboard/CreateShopForm'
import OrdersPanel from './dashboard/OrdersPanel'
import PostsPanel from './dashboard/PostsPanel'
import StatsPanel from './dashboard/StatsPanel'
import StoryComposer from './dashboard/StoryComposer'
import ShopSettings from './dashboard/ShopSettings'

function NoShop({ user, onCreated }) {
  const [sell, setSell] = useState(user.user_metadata?.account_type === 'seller')
  if (sell) return <CreateShopForm userId={user.id} onCreated={onCreated} />
  return (
    <div className="card pad">
      <h2>Compte acheteur</h2>
      <p className="mu">Suivez des boutiques, discutez avec les vendeurs et commandez en toute simplicité.</p>
      <div className="grid">
        <Link className="btn" to="/messages">Mes messages</Link>
        <Link className="btn" to="/profile">Mon profil</Link>
      </div>
      <button className="pri block" style={{ marginTop: 10 }} onClick={() => setSell(true)}>Devenir vendeur</button>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useSession()
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

  if (loading) return <p className="mu">Chargement…</p>
  if (!user) return <Navigate to="/login" replace />
  if (shopError) return <div className="card pad" role="alert"><p className="error">{shopError}</p><button className="pri" onClick={loadShop}>Réessayer</button></div>
  if (shop === undefined) return <p className="mu">Chargement…</p>
  if (shop === null) return <NoShop user={user} onCreated={loadShop} />

  const pro = isPro(shop)

  return (
    <div className="seller-dashboard">
      <ShopSettings shop={shop} onChange={loadShop} onSignOut={signOut} />
      <nav className="seller-nav" aria-label="Navigation du tableau de bord">
        <a href="#seller-overview">Vue d’ensemble</a>
        <a href="#seller-publications">Publications</a>
        <a href="#seller-orders">Commandes</a>
        <a href="#seller-stories">Stories</a>
      </nav>
      <div id="seller-overview" className="seller-overview">
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
          <Link className="btn" to="/premium">Pourquoi passer à Pro ?</Link>
        </div>
      </div>
      <StatsPanel shop={shop} />
      <div className="seller-sections">
        <section id="seller-publications" className="seller-section seller-publications"><PostsPanel shop={shop} /></section>
        <section id="seller-orders" className="seller-section seller-orders"><OrdersPanel shop={shop} /></section>
        <section id="seller-stories" className="seller-section seller-stories"><StoryComposer shop={shop} /></section>
      </div>
    </div>
  )
}
