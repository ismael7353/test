import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { openConversation } from '../api/chat'
import { reportPost, setFav as saveFav } from '../api/extra'
import { addComment, fetchComments, setLike } from '../api/social'
import { useSession } from '../hooks/useSession'
import useRelativeTime from '../hooks/useRelativeTime'
import { fmtKm, getPos, km } from '../lib/geo'
import { finalPrice, formatAr, isPro, whatsappLink } from '../lib/format'
import Avatar from './Avatar'
import Icon from './Icon'
import LiveBadge from './LiveBadge'
import OrderModal from './OrderModal'

function Comments({ postId, user, onAdd }) {
  const [list, setList] = useState(null)
  const [text, setText] = useState('')
  useEffect(() => { fetchComments(postId).then(setList).catch(() => setList([])) }, [postId])
  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const c = await addComment(postId, text.trim())
    setList((l) => [...l, c]); setText(''); onAdd()
  }
  return (
    <div className="cmts">
      {(list || []).map((c) => (
        <div key={c.id} className="row cmt">
          <Avatar url={c.author?.avatar_url} name={c.author?.full_name || 'C'} size={32} />
          <div className="bubble"><b>{c.author?.full_name || 'Client'}</b><div>{c.body}</div></div>
        </div>
      ))}
      {user ? (
        <form className="row" onSubmit={send}>
          <input value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Écrire un commentaire…" style={{ margin: 0 }} />
          <button className="pri">Envoyer</button>
        </form>
      ) : <Link to="/login" className="mu">Connectez-vous pour commenter</Link>}
    </div>
  )
}

export default function PostCard({ post, onOrdered }) {
  const nav = useNavigate()
  const { user } = useSession()
  const [ordering, setOrdering] = useState(false)
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
    if (!user) return nav('/login')
    if (user.id === shop.owner_id) return
    try { nav(`/messages/${await openConversation(shop.id)}`, { state: { draft: `Bonjour, je suis intéressé par « ${post.title} ».` } }) } catch { /* ignore */ }
  }
  const waUrl = whatsappLink(shop.whatsapp, `Bonjour, je suis intéressé par « ${post.title} » : ${location.origin}/post/${post.id}`)
  const share = () => {
    const url = `${location.origin}/post/${post.id}`
    if (navigator.share) navigator.share({ title: post.title, url }).catch(() => {})
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`, '_blank')
  }

  return (
    <article className="card post">
      <div className="pad row">
        <Avatar url={shop.avatar_url} name={shop.name} />
        <div style={{ flex: 1 }}>
          <Link to={`/shop/${shop.slug}`}><b>{shop.name}</b></Link>{isPro(shop) && <span className="tag" style={{ marginLeft: 6 }}>Pro</span>}{shop.verified && <span className="tag" style={{ marginLeft: 6 }}>Vérifié</span>}
          <div className="mu"><time dateTime={post.created_at}>{publishedAt}</time>{shop.city && ` · ${shop.city}`}{dist && ` · ${dist}`}</div>
        </div>
        <LiveBadge shop={shop} />
        <button className="icon" aria-label={fav ? 'Retirer des enregistrés' : 'Enregistrer'} onClick={toggleFav}><Icon name="bookmark" filled={fav} /></button>
        <button className="icon" aria-label="Signaler" onClick={report}><Icon name="flag" /></button>
      </div>

      <Link to={`/post/${post.id}`}>
        <div className="pad" style={{ paddingTop: 0 }}>
          <b>{post.title}</b>
          <div className="clamp">{post.description}</div>
        </div>
        {post.image_url && !post.video_url && <img src={post.image_url} alt={post.title} loading="lazy" decoding="async" />}
      </Link>

      {post.video_url && <video className="vid" src={post.video_url} controls playsInline preload="metadata" poster={post.image_url || undefined} />}
      <div className="pad row sp" style={{ flexWrap: 'wrap' }}>
        <div>
          <span className="price">{formatAr(finalPrice(post))}</span>
          {post.promo_percent > 0 && <><span className="old">{formatAr(post.price)}</span>{' '}<span className="tag">-{post.promo_percent}%</span></>}
          <div className="mu">{post.stock > 0 ? `${post.stock} en stock` : 'Épuisé'}</div>
        </div>
        <div className="row">
          <button onClick={chat}>Discuter</button>
          <button className="pri" disabled={post.stock < 1} onClick={() => setOrdering(true)}>Commander</button>
        </div>
      </div>

      <div className="actions">
        <button className={liked ? 'on' : ''} onClick={toggleLike}><Icon name="heart" filled={liked} /> J’aime{likes > 0 && ` · ${likes}`}</button>
        <button onClick={() => setOpen(!open)}>Commenter{cc > 0 && ` · ${cc}`}</button>
        <a className="btn" href={waUrl} target="_blank" rel="noreferrer">WhatsApp</a>
        <button onClick={share}>Partager</button>
      </div>
      {open && <Comments postId={post.id} user={user} onAdd={() => setCc((n) => n + 1)} />}

      {ordering && <OrderModal post={post} onClose={(done) => { setOrdering(false); if (done) onOrdered?.() }} />}
    </article>
  )
}
