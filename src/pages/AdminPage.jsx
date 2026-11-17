import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'
import { formatAr } from '../lib/format'

const TABS = { overview: ['Aperçu', 'admin_overview'], payments: ['Paiements', 'admin_payments'], reports: ['Signalements', 'admin_reports'], shops: ['Boutiques', 'admin_shops'] }
const LABELS = { users: 'Utilisateurs', shops: 'Boutiques', posts: 'Publications', orders: 'Commandes', pro: 'Boutiques Pro', pending: 'Paiements à valider', reports: 'Signalements', revenue: 'Revenus' }

export default function AdminPage() {
  const { user, loading } = useSession()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [denied, setDenied] = useState(false)
  const load = () => { setData(null); supabase.rpc(TABS[tab][1]).then(({ data: d, error }) => (error ? setDenied(true) : setData(d))) }
  useEffect(() => { if (user) load() }, [user, tab]) // eslint-disable-line react-hooks/exhaustive-deps
  const act = (fn, args) => supabase.rpc(fn, args).then(load)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (denied) return <div className="card pad">Accès réservé à l’administrateur.</div>

  return (
    <>
      <h2>Administration</h2>
      <div className="seg">{Object.entries(TABS).map(([k, [l]]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {!data && <p className="mu">Chargement…</p>}
      {tab === 'overview' && data && <div className="card pad stats">{Object.entries(data).map(([k, v]) => <div key={k}><b>{k === 'revenue' ? formatAr(v) : v}</b><span className="mu">{LABELS[k]}</span></div>)}</div>}
      {tab === 'payments' && data && (data.length === 0 ? <div className="card pad">Aucun paiement en attente.</div> : data.map((p) => (
        <div key={p.id} className="card pad">
          <b>{p.shop}</b> · {formatAr(p.amount)} · {p.months} mois
          <div className="mu">{p.method} · tél. {p.sender_phone} · réf. {p.ref}</div>
          <div className="grid" style={{ marginTop: 8 }}>
            <button className="pri" onClick={() => act('admin_decide', { p_id: p.id, p_ok: true })}>Valider</button>
            <button onClick={() => act('admin_decide', { p_id: p.id, p_ok: false })}>Refuser</button>
          </div>
        </div>
      )))}
      {tab === 'reports' && data && (data.length === 0 ? <div className="card pad">Aucun signalement.</div> : data.map((r) => (
        <div key={r.id} className="card pad">
          <b>{r.title || 'Publication supprimée'}</b> <span className="mu">{r.shop}</span>
          <p>{r.reason}</p>
          <div className="grid">
            <button onClick={() => act('admin_resolve_report', { p_id: r.id, p_delete: true })}>Supprimer la publication</button>
            <button onClick={() => act('admin_resolve_report', { p_id: r.id, p_delete: false })}>Ignorer</button>
          </div>
        </div>
      )))}
      {tab === 'shops' && data && data.map((s) => (
        <div key={s.id} className="card pad row sp">
          <div><b>{s.name}</b>{s.plan === 'pro' && new Date(s.plan_until) > new Date() && <span className="tag" style={{ marginLeft: 6 }}>Pro</span>}<div className="mu">{s.city} · /{s.slug}</div></div>
          <button className={s.verified ? '' : 'pri'} onClick={() => act('admin_set_verified', { p_id: s.id, p_v: !s.verified })}>{s.verified ? 'Retirer le badge' : 'Vérifier'}</button>
        </div>
      ))}
    </>
  )
}
