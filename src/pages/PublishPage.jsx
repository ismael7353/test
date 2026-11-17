import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { fetchPostById } from '../api/posts'
import { fetchMyShop } from '../api/shops'
import PostForm from '../components/PostForm'
import { useSession } from '../hooks/useSession'

/** /publish (création) et /publish/:id (modification). */
export default function PublishPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useSession()
  const [shop, setShop] = useState(undefined)
  const [post, setPost] = useState(id ? undefined : null)

  useEffect(() => { if (user) fetchMyShop(user.id).then(setShop) }, [user])
  useEffect(() => {
    if (id) fetchPostById(id).then(setPost).catch(() => setPost(null))
  }, [id])

  if (loading || (user && (shop === undefined || post === undefined))) return <p className="mu">Chargement…</p>
  if (!user) return <Navigate to="/login" replace />
  if (shop === null) {
    return (
      <div className="card pad">
        Créez d’abord votre boutique dans <Link to="/dashboard" style={{ color: 'var(--ac)' }}>Mon espace</Link>.
      </div>
    )
  }
  if (id && (!post || post.shop_id !== shop.id)) return <div className="card pad">Publication introuvable.</div>

  return <PostForm shop={shop} post={post} onSaved={(postId) => navigate(`/post/${postId}`)} />
}
