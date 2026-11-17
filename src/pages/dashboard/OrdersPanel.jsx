import { fetchOrders, updateOrder } from '../../api/orders'
import Pagination from '../../components/Pagination'
import { usePaginated } from '../../hooks/usePaginated'

const STATUSES = ['nouveau', 'paye', 'livre', 'annule']
const METHODS = ['mvola', 'orange', 'airtel', 'cash']

export default function OrdersPanel({ shop }) {
  const { items, total, page, setPage, reload } = usePaginated(
    (p) => fetchOrders({ shopId: shop.id, page: p }),
    [shop.id]
  )

  const update = async (id, patch) => {
    await updateOrder(id, patch)
    reload()
  }

  return (
    <div className="card">
      <div className="pad"><h2>Commandes ({total})</h2></div>
      {items.length === 0 && <div className="ord mu">Aucune commande pour le moment.</div>}

      {items.map((order) => (
        <div className="ord" key={order.id}>
          <div className="row sp">
            <b>{order.customer_name} · {order.customer_phone}</b>
            <span className="tag">{order.status}</span>
          </div>
          <div className="mu">{order.qty} × {order.post?.title || 'Produit supprimé'}</div>
          <div className="grid">
            <select value={order.status} onChange={(e) => update(order.id, { status: e.target.value })}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={order.pay_method || ''} onChange={(e) => update(order.id, { pay_method: e.target.value || null })}>
              <option value="">Paiement…</option>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <input
            defaultValue={order.pay_ref || ''}
            placeholder="Référence de la transaction"
            onBlur={(e) => e.target.value !== (order.pay_ref || '') && update(order.id, { pay_ref: e.target.value })}
          />
        </div>
      ))}
      <Pagination page={page} total={total} onChange={setPage} />
    </div>
  )
}
