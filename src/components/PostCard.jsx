import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { openConversation } from '../api/chat'
import { reportPost, setFav as saveFav } from '../api/extra'
import { setLike } from '../api/social'
import { useSession } from '../hooks/useSession'
import useRelativeTime from '../hooks/useRelativeTime'
import { fmtKm, getPos, km } from '../lib/geo'
import { finalPrice, formatAr } from '../lib/format'
import Avatar from './Avatar'
import Comments from './Comments'
import ContactLinks from './ContactLinks'
import Icon from './Icon'
import LiveBadge from './LiveBadge'
import OrderModal from './OrderModal'
import VideoPlayer from './VideoPlayer'

export default function PostCard({ post, onOrdered }) {
  const nav = useNavigate()
  const { user } = useSession()
  const [ordering, setOrdering] = useState(false)
  const [openingChat, setOpeningChat] = useState(false)
  const [chatError, setChatError] = useState('')
  const [open, setOpen] = useState(false)
  const [liked, setLiked] = useState(!!post.liked)
  const [likes, setLikes] = useState(post.likes?.[0]?.count ?? 0)
  const [fav, setFavState] = useState(!!post.fav)
  const [cc, setCc] = useState(post.comments?.[0]?.count ?? 0)
  const publishedAt = useRelativeTime(post.created_at)
  const { shop } = post
  const here = getPos()
  const dist = here && shop.lat != null ? fmtKm(km(here, [shop.lat, shop.lng])) : null

  async function toggleLike() {
    if (!user) return nav('/login')
    const on = !liked
    setLiked(on); setLikes((n) => n + (on ? 1 : -1))
    try { await setLike(post.id, on) } catch { setLiked(!on); setLikes((n) => n + (on ? -1 : 1)) }
  }
  async function toggleFav() {
    if (!user) return nav('/login')
    const on = !fav
    setFavState(on)
    try { await saveFav(post.id, on) } catch { setFavState(!on) }
  }
  async function report() {
    if (!user) return nav('/login')
    const reason = window.prompt('Pourquoi signalez-vous cette publication ? (arnaque, contenu inapproprié…)')
    if (reason?.trim()) { try { await reportPost(post.id, reason.trim()); alert('Merci, signalement envoyé.') } catch { /* ignore */ } }
  }
  async function chat() {
    setChatError('')
    if (!user) {
      nav('/login', { state: { message: 'Connectez-vous avec un compte acheteur pour discuter avec le vendeur.' } })
      return
    }
    if (user.id === shop.owner_id) {
      setChatError('Utilisez un compte acheteur différent pour discuter avec votre boutique.')
      return
    }

    setOpeningChat(true)
    try {
      const conversationId = await openConversation(shop.id)
      nav(`/messages/${conversationId}`, { state: { draft: `Bonjour, je suis intéressé par « ${post.title} ».` } })
    } catch (error) {
      setChatError(error.message || 'Impossible d’ouvrir la discussion. Réessayez.')
    } finally {
      setOpeningChat(false)
    }
  }
  const share = () => {
    const url = `${location.origin}/post/${post.id}`
    if (navigator.share) navigator.share({ title: post.title, url }).catch(() => {})
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`, '_blank')
  }

  const hasVideo = !!post.video_url
  const outOfStock = post.stock < 1

  return (
    <article className="card post pc">
      <header className="pc-head">
        <Link to={`/shop/${shop.slug}`} className="pc-shop">
          <Avatar url={shop.avatar_url} name={shop.name} size={40} />
          <span className="pc-shop-text">
            <span className="pc-shop-name">
              <b>{shop.name}</b>
              {shop.verified && <span className="pc-verified" role="img" aria-label="Boutique vérifiée" title="Boutique vérifiée"><Icon name="check" size={12} strokeWidth={3} /></span>}
            </span>
            <small><time dateTime={post.created_at}>{publishedAt}</time>{shop.city && ` · ${shop.city}`}{dist && ` · ${dist}`}</small>
          </span>
        </Link>
        <button className="icon" aria-label={fav ? 'Retirer des enregistrés' : 'Enregistrer'} aria-pressed={fav} onClick={toggleFav}><Icon name="bookmark" filled={fav} /></button>
        <button className="icon" aria-label="Signaler" onClick={report}><Icon name="flag" /></button>
      </header>

      {hasVideo
        ? <div className="pc-media"><VideoPlayer post={post} /></div>
        : post.image_url && (
          <Link to={`/post/${post.id}`} className="pc-media" tabIndex={-1} aria-hidden="true">
            <img src={post.image_url} alt="" loading="lazy" decoding="async" />
          </Link>
        )}

      <div className="pc-body">
        <LiveBadge shop={shop} />
        <Link to={`/post/${post.id}`} className="pc-title">{post.title}</Link>
        <div className="pc-price">
          <b>{formatAr(finalPrice(post))}</b>
          {post.promo_percent > 0 && <><s>{formatAr(post.price)}</s><span className="tag">-{post.promo_percent}%</span></>}
          <small className={outOfStock ? 'is-out' : ''}>{outOfStock ? 'Épuisé' : `${post.stock} en stock`}</small>
        </div>
        {post.description && <p className="pc-desc clamp">{post.description}</p>}
      </div>

      <div className="pc-foot">
        <div className="pc-social">
          <button className={liked ? 'on' : ''} aria-pressed={liked} aria-label="J’aime" onClick={toggleLike}><Icon name="heart" filled={liked} /><span>{likes}</span></button>
          <button aria-label="Commentaires" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="comment" /><span>{cc}</span></button>
          <button aria-label="Partager" onClick={share}><Icon name="share" /></button>
          <ContactLinks shop={shop} message={`Bonjour, je suis intéressé par « ${post.title} » : ${location.origin}/post/${post.id}`} />
        </div>
        <div className="pc-buy">
          <button disabled={openingChat} onClick={chat}>{openingChat ? 'Ouverture…' : 'Discuter'}</button>
          <button className="pri" disabled={outOfStock} onClick={() => setOrdering(true)}>Commander</button>
        </div>
      </div>
      {chatError && <p className="error pc-error" role="alert">{chatError}</p>}
      {open && <Comments postId={post.id} user={user} onAdd={() => setCc((n) => n + 1)} />}

      {ordering && <OrderModal post={post} onClose={(done) => { setOrdering(false); if (done) onOrdered?.() }} />}
    </article>
  )
}
