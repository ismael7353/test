import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchNotifications, markAllRead } from '../api/extra'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'

export default function NotificationsPage() {
  const { user, loading } = useSession()
  const [list, setList] = useState(null)
  useEffect(() => { if (user) fetchNotifications().then((l) => { setList(l); markAllRead() }).catch(() => setList([])) }, [user])
  if (loading) return <PageLoading label="Chargement de vos notifications…" />
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="card">
      <h2 className="pad" style={{ margin: 0 }}>Notifications</h2>
      {list === null && <PageLoading label="Chargement des notifications…" compact />}
      {list?.length === 0 && <p className="mu pad">Rien pour le moment.</p>}
      {list?.map((n) => (
        <Link key={n.id} to={n.link || '/'} className="row sp ord" style={{ fontWeight: n.read ? 400 : 700 }}>
          <span>{n.text}</span><span className="mu">{new Date(n.created_at).toLocaleDateString('fr-FR')}</span>
        </Link>
      ))}
    </div>
  )
}
