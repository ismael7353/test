import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PRICES } from '../api/billing'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'
import { formatAr } from '../lib/format'
import PageLoading from '../components/PageLoading'

const TABS = {
  overview: ['Aperçu', 'admin_overview'],
  plan_requests: ['Demandes Pro', 'admin_plan_requests'],
  payments: ['Paiements', 'admin_payments'],
  reports: ['Signalements', 'admin_reports'],
  shops: ['Boutiques', 'admin_shops'],
}
const LABELS = { users: 'Utilisateurs', shops: 'Boutiques', posts: 'Publications', orders: 'Commandes', pro: 'Boutiques Pro', pending: 'Paiements à valider', plan_requests_pending: 'Demandes Pro WhatsApp', reports: 'Signalements', revenue: 'Revenus' }
const REQUEST_STATUSES = { pending: 'À traiter', paid: 'Payé · Pro activé', rejected: 'Refusé' }

export default function AdminPage() {
  const { user, loading } = useSession()
  const [tab, setTab] = useState('overview')
  const [data, setData] = useState(null)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')
  const [requestEdits, setRequestEdits] = useState({})
  const [savingRequest, setSavingRequest] = useState('')

  async function load() {
    setData(null)
    setError('')
    try {
      const { data: result, error: resultError } = await supabase.rpc(TABS[tab][1])
      if (resultError) {
        if (resultError.message?.includes('INTERDIT')) setDenied(true)
        else setError(resultError.message || 'Impossible de charger les données.')
        return
      }
      setDenied(false)
      setRequestEdits({})
      setData(result)
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les données.')
    }
  }

  useEffect(() => { if (user) load() }, [user, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  async function act(fn, args) {
    setError('')
    try {
      const { error: actionError } = await supabase.rpc(fn, args)
      if (actionError) throw actionError
      await load()
    } catch (actionError) {
      setError(actionError.message || 'Impossible d’effectuer cette action.')
    }
  }

  async function savePlanRequest(request) {
    const edit = requestEdits[request.id] || { status: request.status, months: request.months }
    setSavingRequest(request.id)
    setError('')
    try {
      const { error: actionError } = await supabase.rpc('admin_update_plan_request', {
        p_id: request.id,
        p_status: edit.status,
        p_months: Number(edit.months),
      })
      if (actionError) throw actionError
      await load()
    } catch (actionError) {
      setError(actionError.message || 'Impossible de mettre à jour cette demande.')
    } finally {
      setSavingRequest('')
    }
  }

  if (loading) return <PageLoading label="Vérification de votre accès…" />
  if (!user) return <Navigate to="/login" replace />
  if (denied) return <div className="card pad">Accès réservé à l’administrateur.</div>

  return (
    <>
      <div className="row sp">
        <h2>Administration</h2>
        <button type="button" onClick={load}>Actualiser</button>
      </div>
      <div className="seg">{Object.entries(TABS).map(([key, [label]]) => <button key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
      {error && <p className="card pad auth-message" role="alert">{error}</p>}
      {!data && !error && <PageLoading label="Chargement des données…" compact />}
      {tab === 'overview' && data && <div className="card pad stats">{Object.entries(data).map(([key, value]) => <div key={key}><b>{key === 'revenue' ? formatAr(value) : value}</b><span className="mu">{LABELS[key]}</span></div>)}</div>}
      {tab === 'plan_requests' && data && (data.length === 0 ? <div className="card pad">Aucune demande Pro pour le moment.</div> : data.map((request) => {
        const edit = requestEdits[request.id] || { status: request.status, months: request.months }
        return (
          <div key={request.id} className="card pad">
            <div className="row sp">
              <div>
                <b>{request.shop}</b> <span className="tag">{REQUEST_STATUSES[request.status] || request.status}</span>
                <div className="mu">
                  {request.owner_username ? `@${request.owner_username} · ` : ''}
                  {request.city || 'Ville non renseignée'}
                  {request.shop_whatsapp ? ` · WhatsApp : ${request.shop_whatsapp}` : ''}
                </div>
                <div className="mu">Réf. {request.id}</div>
              </div>
              <div className="mu">{new Date(request.created_at).toLocaleString('fr-FR')}</div>
            </div>
            <p>Offre demandée : {request.months} mois · {formatAr(request.amount)}</p>
            {request.status === 'paid' && request.plan_until && <p className="mu">Pro actif jusqu’au {new Date(request.plan_until).toLocaleDateString('fr-FR')}</p>}
            <div className="grid">
              <label>
                Statut
                <select
                  value={edit.status}
                  disabled={request.status === 'paid' || savingRequest === request.id}
                  onChange={(event) => setRequestEdits((current) => ({ ...current, [request.id]: { ...edit, status: event.target.value } }))}
                >
                  {Object.entries(REQUEST_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                Durée / tarif
                <select
                  value={edit.months}
                  disabled={savingRequest === request.id}
                  onChange={(event) => setRequestEdits((current) => ({ ...current, [request.id]: { ...edit, months: Number(event.target.value) } }))}
                >
                  {[1, 3, 12].map((months) => <option key={months} value={months}>{months} mois · {formatAr(PRICES[months])}</option>)}
                </select>
              </label>
            </div>
            <p className="mu auth-note">Confirmer le paiement active Pro. La durée peut être ajustée ici, même après activation.</p>
            <button className="pri" disabled={savingRequest === request.id} onClick={() => savePlanRequest(request)}>
              {savingRequest === request.id ? 'Enregistrement…' : 'Enregistrer la demande'}
            </button>
          </div>
        )
      }))}
      {tab === 'payments' && data && (data.length === 0 ? <div className="card pad">Aucun paiement en attente.</div> : data.map((payment) => (
        <div key={payment.id} className="card pad">
          <b>{payment.shop}</b> · {formatAr(payment.amount)} · {payment.months} mois
          <div className="mu">{payment.method} · tél. {payment.sender_phone} · réf. {payment.ref}</div>
          <div className="grid" style={{ marginTop: 8 }}>
            <button className="pri" onClick={() => act('admin_decide', { p_id: payment.id, p_ok: true })}>Valider</button>
            <button onClick={() => act('admin_decide', { p_id: payment.id, p_ok: false })}>Refuser</button>
          </div>
        </div>
      )))}
      {tab === 'reports' && data && (data.length === 0 ? <div className="card pad">Aucun signalement.</div> : data.map((report) => (
        <div key={report.id} className="card pad">
          <b>{report.title || 'Publication supprimée'}</b> <span className="mu">{report.shop}</span>
          <p>{report.reason}</p>
          <div className="grid">
            <button onClick={() => act('admin_resolve_report', { p_id: report.id, p_delete: true })}>Supprimer la publication</button>
            <button onClick={() => act('admin_resolve_report', { p_id: report.id, p_delete: false })}>Ignorer</button>
          </div>
        </div>
      )))}
      {tab === 'shops' && data && data.map((shop) => (
        <div key={shop.id} className="card pad row sp">
          <div><b>{shop.name}</b>{shop.plan === 'pro' && new Date(shop.plan_until) > new Date() && <span className="tag" style={{ marginLeft: 6 }}>Pro</span>}<div className="mu">{shop.city} · /{shop.slug}</div></div>
          <button className={shop.verified ? '' : 'pri'} onClick={() => act('admin_set_verified', { p_id: shop.id, p_v: !shop.verified })}>{shop.verified ? 'Retirer le badge' : 'Vérifier'}</button>
        </div>
      ))}
    </>
  )
}
