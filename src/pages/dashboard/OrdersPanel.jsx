import { useState } from 'react'
import { fetchOrders, updateOrder } from '../../api/orders'
import Pagination from '../../components/Pagination'
import { usePaginated } from '../../hooks/usePaginated'

const STATUSES = [
  ['nouveau', 'Nouvelle'],
  ['paye', 'Payée'],
  ['livre', 'Livrée'],
  ['annule', 'Annulée'],
]
const METHODS = [
  ['mvola', 'Mvola'],
  ['orange', 'Orange Money'],
  ['airtel', 'Airtel Money'],
  ['cash', 'Espèces'],
]
const STATUS_LABELS = Object.fromEntries(STATUSES)

export default function OrdersPanel({ shop }) {
  const { items, total, page, setPage, reload, loading, error } = usePaginated(
    (p) => fetchOrders({ shopId: shop.id, page: p }),
    [shop.id]
  )
  const [busyId, setBusyId] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [message, setMessage] = useState('')

  const update = async (id, patch) => {
    setBusyId(id)
    setUpdateError('')
    setMessage('')
    try {
      await updateOrder(id, patch)
      await reload()
      setMessage('Commande mise à jour.')
    } catch (error) {
      setUpdateError(error.message || 'Impossible de mettre à jour la commande.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="card seller-panel seller-orders-panel" aria-busy={loading || Boolean(busyId)}>
      <div className="seller-panel-heading">
        <div>
          <span className="eyebrow">VENTES</span>
          <h2>Commandes <span className="seller-count">{total}</span></h2>
          <p className="mu">Suivez le statut et le paiement de chaque commande.</p>
        </div>
      </div>

      {error && <div className="seller-order-feedback" role="alert">
        <span>{error.message || 'Impossible de charger les commandes.'}</span>
        <button type="button" onClick={reload}>Réessayer</button>
      </div>}
      {updateError && <p className="seller-order-feedback" role="alert">{updateError}</p>}
      {message && <p className="seller-order-feedback is-success" role="status">{message}</p>}
      {loading && items.length === 0 && <div className="seller-empty" role="status"><span className="spinner" />Chargement des commandes…</div>}
      {!loading && !error && items.length === 0 && <div className="seller-empty"><span aria-hidden="true">◇</span><b>Aucune commande pour le moment</b><p className="mu">Les nouvelles commandes apparaîtront ici.</p></div>}

      {items.map((order) => (
        <article className="ord seller-order" key={order.id}>
          <div className="seller-order-heading">
            <div>
              <b>{order.customer_name}</b>
              <span className="mu">{order.customer_phone}</span>
            </div>
            <span className={`tag order-status-tag status-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
          </div>
          <p className="seller-order-product">{order.qty} × {order.post?.title || 'Produit supprimé'}</p>
          <div className="grid seller-order-controls">
            <label>Statut
              <select aria-label={`Statut de la commande de ${order.customer_name}`} value={order.status} disabled={busyId === order.id} onChange={(e) => update(order.id, { status: e.target.value })}>
                {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Paiement
              <select aria-label={`Moyen de paiement de la commande de ${order.customer_name}`} value={order.pay_method || ''} disabled={busyId === order.id} onChange={(e) => update(order.id, { pay_method: e.target.value || null })}>
                <option value="">À préciser…</option>
                {METHODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <label className="seller-order-reference">Référence de transaction
            <input
              aria-label={`Référence de transaction pour ${order.customer_name}`}
              defaultValue={order.pay_ref || ''}
              placeholder="Ex. numéro de transaction"
              disabled={busyId === order.id}
              onBlur={(e) => e.target.value !== (order.pay_ref || '') && update(order.id, { pay_ref: e.target.value })}
            />
          </label>
          {busyId === order.id && <span className="mu" role="status">Enregistrement…</span>}
        </article>
      ))}
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  )
}
