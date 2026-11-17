import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatAr, isPro } from '../../lib/format'
import Icon from '../../components/Icon'

export default function StatsPanel({ shop }) {
  const [state, setState] = useState({ data: null, loading: true, error: '' })
  const pro = isPro(shop)
  const load = useCallback(async () => {
    setState({ data: null, loading: true, error: '' })
    try {
      const { data, error } = await supabase.rpc('shop_stats', { p_shop: shop.id })
      if (error) setState({ data: null, loading: false, error: error.message || 'Impossible de charger les statistiques.' })
      else setState({ data, loading: false, error: '' })
    } catch (error) {
      setState({ data: null, loading: false, error: error.message || 'Impossible de charger les statistiques.' })
    }
  }, [shop.id])

  useEffect(() => { if (pro) load() }, [load, pro])

  if (!pro) {
    return (
      <div className="card pad seller-stats-locked">
        <div><span className="eyebrow">PILOTEZ VOTRE ACTIVITÉ</span><h2>Des statistiques pour mieux vendre</h2><p className="mu">Vues, abonnés, interactions, commandes, chiffre d’affaires et produits préférés : retrouvez vos indicateurs clés avec Vendeo Pro.</p></div>
        <Link className="btn pri" to="/premium">Découvrir les avantages Pro →</Link>
      </div>
    )
  }
  if (state.loading) return <div className="card pad seller-stats-loading" role="status"><span className="spinner" />Chargement de vos statistiques…</div>
  if (state.error) return <div className="card pad" role="alert"><p className="error">{state.error}</p><button onClick={load}>Réessayer</button></div>

  const s = state.data
  if (!s) return <p className="card pad mu">Aucune statistique disponible.</p>
  const items = [['Vues', s.views], ['Abonnés', s.followers], ['J’aime', s.likes], ['Commentaires', s.comments], ['Commandes', s.orders], ['Note', s.rating ?? '–'], ['Chiffre d’affaires', formatAr(s.revenue)]]
  return (
    <div className="card pad seller-stats">
      <div className="seller-panel-heading"><div><span className="eyebrow">PERFORMANCE</span><h2>Vos statistiques</h2></div><Link className="seller-inline-link" to="/premium">Fonctionnalités Pro <Icon name="sparkle" size={14} /></Link></div>
      <div className="stats">{items.map(([k, v]) => <div key={k}><b>{v}</b><span className="mu">{k}</span></div>)}</div>
      {s.top?.length > 0 && <div className="seller-top-products"><h3 className="side-title">Publications les plus aimées</h3>{s.top.map((t) => <div key={t.title} className="row sp"><span className="clamp" style={{ WebkitLineClamp: 1 }}>{t.title}</span><span className="mu"><Icon name="heart" size={14} filled /> {t.likes}</span></div>)}</div>}
    </div>
  )
}
