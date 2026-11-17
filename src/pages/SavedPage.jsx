import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { fetchSaved } from '../api/posts'
import PostCard from '../components/PostCard'
import Icon from '../components/Icon'
import { useSession } from '../hooks/useSession'

export default function SavedPage() {
  const { user, loading } = useSession()
  const [list, setList] = useState(null)
  useEffect(() => { if (user) fetchSaved().then(setList).catch(() => setList([])) }, [user])
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <h2>Enregistrés</h2>
      {list === null && <p className="mu">Chargement…</p>}
      {list?.length === 0 && <div className="card pad empty">Utilisez <Icon name="bookmark" size={15} /> sur une publication pour la retrouver ici.</div>}
      {list?.map((p) => <PostCard key={p.id} post={{ ...p, fav: true }} />)}
    </>
  )
}
