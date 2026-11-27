import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { fetchConversations } from '../api/chat'
import Avatar from '../components/Avatar'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'

export default function MessagesPage() {
  const { user, loading } = useSession()
  const [list, setList] = useState(null)
  useEffect(() => { if (user) fetchConversations().then(setList).catch(() => setList([])) }, [user])

  if (loading) return <PageLoading label="Chargement de vos messages…" />
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="card">
      <h2 className="pad" style={{ margin: 0 }}>Messages</h2>
      {list === null && <PageLoading label="Chargement des conversations…" compact />}
      {list?.length === 0 && <p className="mu pad">Aucune discussion. Touchez « Discuter » sous une publication pour contacter un vendeur.</p>}
      {list?.map((c) => {
        const mine = c.shop.owner_id === user.id
        const name = mine ? c.buyer?.username || 'Client' : c.shop.name
        return (
          <Link key={c.id} to={`/messages/${c.id}`} className="row ord">
            <Avatar url={mine ? c.buyer?.avatar_url : c.shop.avatar_url} name={name} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <b>{name}</b>
              <div className="mu clamp" style={{ WebkitLineClamp: 1 }}>{c.last_text || 'Nouvelle discussion'}</div>
            </div>
            <span className="mu">{new Date(c.last_message_at).toLocaleDateString('fr-FR')}</span>
          </Link>
        )
      })}
    </div>
  )
}
