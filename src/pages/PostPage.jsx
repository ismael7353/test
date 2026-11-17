import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPostById } from '../api/posts'
import LiveBadge from '../components/LiveBadge'
import OrderModal from '../components/OrderModal'
import { finalPrice, formatAr, whatsappLink } from '../lib/format'

export default function PostPage() {
  const { id } = useParams()
  const [post, setPost] = useState(undefined) // undefined = chargement, null = introuvable
  const [ordering, setOrdering] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = () => fetchPostById(id).then(setPost).catch(() => setPost(null))
  useEffect(() => { setPost(undefined); load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function share() {
    const url = window.location.href
    if (navigator.share) return navigator.share({ title: post.title, url }).catch(() => {})
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  if (post === undefined) return <p className="mu">Chargement…</p>
  if (post === null) return <div className="card pad">Publication introuvable.</div>

  const { shop } = post
  return (
    <article className="card detail">
      {post.image_url && <img src={post.image_url} alt={post.title} decoding="async" />}
      <div className="pad">
        <h2>{post.title}</h2>
        <div>
          <span className="price">{formatAr(finalPrice(post))}</span>
          {post.promo_percent > 0 && (
            <>
              <span className="old">{formatAr(post.price)}</span>{' '}
              <span className="tag">-{post.promo_percent}%</span>
            </>
          )}
        </div>
        <div className="mu" style={{ margin: '4px 0 12px' }}>
          {post.stock > 0 ? `${post.stock} en stock` : 'Épuisé'}
          {!post.is_published && ' · Masquée (visible par vous seulement)'}
        </div>
        <p style={{ whiteSpace: 'pre-wrap' }}>{post.description}</p>

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <button className="pri" disabled={post.stock < 1} onClick={() => setOrdering(true)}>Commander</button>
          <a className="btn" href={whatsappLink(shop.whatsapp, `Bonjour, une question sur : ${post.title}`)} target="_blank" rel="noreferrer">
            Poser une question
          </a>
          <button onClick={share}>{copied ? 'Lien copié' : 'Partager'}</button>
        </div>
      </div>

      <div className="pad row" style={{ borderTop: '1px solid var(--bd)' }}>
        <div className="av">{shop.name[0]}</div>
        <div style={{ flex: 1 }}>
          <Link to={`/shop/${shop.slug}`}><b>{shop.name}</b></Link>
          <div className="mu">{shop.city}</div>
        </div>
        <LiveBadge shop={shop} />
      </div>

      {ordering && (
        <OrderModal post={post} onClose={(done) => { setOrdering(false); if (done) load() }} />
      )}
    </article>
  )
}
