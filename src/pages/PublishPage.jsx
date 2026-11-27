import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { fetchPostById } from '../api/posts'
import { ensureShop } from '../api/shops'
import PostForm from '../components/PostForm'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'

/** /publish (création) et /publish/:id (modification). */
export default function PublishPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading } = useSession()
  const [shop, setShop] = useState(undefined)
  const [post, setPost] = useState(id ? undefined : null)

  const [error, setError] = useState('')
  useEffect(() => { if (user) ensureShop(user).then(setShop).catch((e) => { setError(e.message || 'Impossible de préparer votre espace.'); setShop(null) }) }, [user])
  useEffect(() => {
    if (id) fetchPostById(id).then(setPost).catch(() => setPost(null))
  }, [id])

  if (loading || (user && (shop === undefined || post === undefined))) return <PageLoading label="Préparation de la publication…" />
  if (!user) return <Navigate to="/login" replace />
  if (shop === null) return <div className="card pad" role="alert"><p className="error">{error || 'Impossible de préparer votre espace.'}</p></div>
  if (id && (!post || post.shop_id !== shop.id)) return <div className="card pad">Publication introuvable.</div>

  return <PostForm shop={shop} post={post} onSaved={(postId) => navigate(`/post/${postId}`)} />
}
