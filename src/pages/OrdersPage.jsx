import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchMyOrders } from '../api/extra'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'
import { formatAr } from '../lib/format'

const STATUS = { nouveau: 'Envoyée', paye: 'Payée', livre: 'Livrée', annule: 'Annulée' }

export default function OrdersPage() {
  const { user, loading } = useSession()
  const [list, setList] = useState(null)
  useEffect(() => { if (user) fetchMyOrders().then(setList).catch(() => setList([])) }, [user])
  if (loading) return <PageLoading label="Chargement de vos commandes…" />
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="card">
      <h2 className="pad" style={{ margin: 0 }}>Mes commandes</h2>
      {list === null && <PageLoading label="Chargement des commandes…" compact />}
      {list?.length === 0 && <p className="mu pad">Aucune commande. Connecté, vos prochaines commandes apparaîtront ici.</p>}
      {list?.map((o) => (
        <div key={o.id} className="row sp ord">
          <div>
            <b>{o.post?.title || 'Produit supprimé'}</b> × {o.qty}
            <div className="mu">{o.shop && <Link to={`/shop/${o.shop.slug}`}>{o.shop.name}</Link>} · {new Date(o.created_at).toLocaleDateString('fr-FR')}{o.post && ` · ${formatAr(o.post.price * o.qty)}`}</div>
          </div>
          <span className={`tag${o.status === 'annule' ? ' off' : ''}`}>{STATUS[o.status]}</span>
        </div>
      ))}
    </div>
  )
}
