import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PRICES, requestPlanContact, startTrial } from '../api/billing'
import { fetchMyShop } from '../api/shops'
import { useSession } from '../hooks/useSession'
import { formatAr, isPro } from '../lib/format'
import Icon from '../components/Icon'
import PageLoading from '../components/PageLoading'

const PERIODS = { 1: ['1 mois', ''], 3: ['3 mois', 'Économisez 11 %'], 12: ['12 mois', 'Économisez 20 %'] }
const FREE = [
  'Votre boutique et votre profil vendeur',
  'Jusqu’à 5 publications visibles',
  'Jusqu’à 3 stories actives',
  'Réception des commandes et messages',
  'Contact direct avec les clients sur WhatsApp',
]
const PRO = [
  'Publications illimitées pour présenter tout votre catalogue',
  'Publications vidéo pour des démonstrations plus convaincantes',
  'Stories illimitées pour rester visible chaque jour',
  'Statistiques détaillées : vues, abonnés, interactions et commandes',
  'Accès à la sélection « À la une » sur l’accueil',
  'Badge Pro qui valorise votre boutique',
  'Essai gratuit de 7 jours (si éligible)',
  'Support prioritaire',
]
const WHATSAPP_NUMBER = '261389807147'

function whatsappUrl(shop, months, requestId) {
  const period = PERIODS[months][0]
  const amount = formatAr(PRICES[months])
  const message = [
    'Bonjour Vendeo ! Je souhaite souscrire au plan Vendeo Pro.',
    `Boutique : ${shop.name}`,
    `Durée souhaitée : ${period}`,
    `Tarif affiché : ${amount}`,
    `Référence de demande : ${requestId}`,
    'Merci de m’indiquer les moyens de paiement.',
  ].join('\n')
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function PlansPage() {
  const { user, loading } = useSession()
  const [shop, setShop] = useState(undefined)
  const [months, setMonths] = useState(1)
  const [msg, setMsg] = useState('')
  const [startingTrial, setStartingTrial] = useState(false)
  const [requestingPlan, setRequestingPlan] = useState(false)
  const [shopError, setShopError] = useState('')

  const loadShop = () => {
    setShopError('')
    return fetchMyShop(user.id)
      .then(setShop)
      .catch((error) => {
        setShopError(error.message || 'Impossible de charger votre boutique.')
        setShop(null)
      })
  }
  useEffect(() => { if (user) loadShop() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || (user && shop === undefined)) return <PageLoading label="Chargement de vos offres…" />
  if (!user) return <Navigate to="/login" replace />
  if (shopError) return <div className="card pad" role="alert"><p className="error">{shopError}</p><button className="pri" onClick={loadShop}>Réessayer</button></div>
  if (!shop) return <div className="card pad"><h2>Créez votre boutique pour commencer</h2><p className="mu">Ouvrez votre espace vendeur avant de choisir une formule.</p><Link className="btn pri" to="/dashboard">Créer ma boutique</Link></div>

  const pro = isPro(shop)
  async function trial() {
    setStartingTrial(true)
    try { await startTrial(shop.id); await loadShop(); setMsg('Votre essai Pro a été activé.') }
    catch (er) { setMsg(er.message || 'Impossible de démarrer l’essai pour le moment.') }
    finally { setStartingTrial(false) }
  }

  async function contactForPlan() {
    setMsg('')
    setRequestingPlan(true)
    const whatsappWindow = window.open('about:blank', '_blank')
    if (whatsappWindow) whatsappWindow.opener = null
    try {
      const requestId = await requestPlanContact(shop.id, months)
      const url = whatsappUrl(shop, months, requestId)
      if (whatsappWindow) whatsappWindow.location.href = url
      else window.location.assign(url)
    } catch (error) {
      whatsappWindow?.close()
      setMsg(error.message || 'Impossible d’enregistrer votre demande. Réessayez.')
    } finally {
      setRequestingPlan(false)
    }
  }

  return (
    <div className="plans-page">
      <header className="plans-hero">
        <span className="eyebrow">FAITES GRANDIR VOTRE ACTIVITÉ</span>
        <h1>Votre boutique mérite<br />plus de visibilité.</h1>
        <p>Commencez gratuitement. Passez à Pro quand vous voulez accélérer vos ventes, publier sans limites et mieux comprendre vos clients.</p>
        {pro && <span className="tag">Pro actif jusqu’au {new Date(shop.plan_until).toLocaleDateString('fr-FR')}</span>}
      </header>

      {!pro && shop.plan_until === null && (
        <section className="trial-banner card pad">
          <div><span className="eyebrow">À DÉCOUVRIR</span><h2>7 jours de Vendeo Pro offerts</h2><p className="mu">Testez les fonctionnalités avancées avant de décider. Aucun paiement dans l’application.</p></div>
          <button className="pri" disabled={startingTrial} onClick={trial}>{startingTrial ? 'Activation…' : 'Activer mon essai gratuit'}</button>
        </section>
      )}

      <div className="plan-grid">
        <section className="card pad plan-card">
          <div className="plan-heading"><div><span className="eyebrow">POUR DÉMARRER</span><h2>Gratuit</h2></div>{!pro && <span className="tag">Votre formule</span>}</div>
          <div className="plan-price"><strong>0 Ar</strong><span className="mu">/ toujours</span></div>
          <p className="mu">Les essentiels pour ouvrir votre boutique et commencer à trouver vos premiers clients.</p>
          <ul className="feature-list">{FREE.map((f) => <li key={f}><span><Icon name="check" size={14} /></span>{f}</li>)}</ul>
          {!pro && <span className="current-plan">Vous utilisez cette formule</span>}
        </section>

        <section className="card pad plan-card plan-pro">
          <div className="pro-ribbon">POUR ALLER PLUS LOIN</div>
          <div className="plan-heading"><div><span className="eyebrow">DÉVELOPPEZ VOS VENTES</span><h2>Vendeo Pro <Icon className="pro-star" name="sparkle" size={20} /></h2></div>{pro && <span className="tag">Actif</span>}</div>
          <div className="plan-price"><strong>{formatAr(PRICES[1])}</strong><span className="mu">/ mois</span></div>
          <p className="mu">Plus de contenu, plus de visibilité et des outils pour piloter votre activité.</p>
          <ul className="feature-list">{PRO.map((f) => <li key={f}><span><Icon name="check" size={14} /></span>{f}</li>)}</ul>
          <Link className="plans-learn-more" to="/premium">Comprendre tous les avantages et la mise en avant →</Link>
          <div className="period-picker" aria-label="Durée de l’abonnement">
            {Object.entries(PERIODS).map(([m, [label, discount]]) => (
              <button type="button" key={m} className={months === Number(m) ? 'selected' : ''} aria-pressed={months === Number(m)} onClick={() => setMonths(Number(m))}>
                <b>{label}</b>{discount && <small>{discount}</small>}
              </button>
            ))}
          </div>
          <div className="selected-price"><span>Total pour {PERIODS[months][0].toLowerCase()}</span><strong>{formatAr(PRICES[months])}</strong></div>
          <button type="button" className="btn pri block whatsapp-cta" disabled={requestingPlan} onClick={contactForPlan}>
            <Icon name="message" /> {requestingPlan ? 'Enregistrement de la demande…' : 'Contacter Vendeo sur WhatsApp'}
          </button>
          <p className="tiny-note">Votre demande est enregistrée avant l’ouverture de WhatsApp. Le paiement et l’activation sont ensuite confirmés par notre équipe.</p>
        </section>
      </div>

      {msg && <p className="card pad" role="status">{msg}</p>}
      <section className="plan-help">
        <h2>Besoin d’aide pour choisir ?</h2>
        <p className="mu">Écrivez-nous : nous vous aiderons à choisir la formule adaptée à votre boutique.</p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour Vendeo, j’aimerais avoir des informations sur les offres.')}`} target="_blank" rel="noopener noreferrer">Discuter avec l’équipe Vendeo →</a>
      </section>
    </div>
  )
}
