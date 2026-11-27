import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { openConversation } from '../api/chat'
import { setFav as saveFav } from '../api/extra'
import { fetchPosts } from '../api/posts'
import { setLike } from '../api/social'
import Avatar from '../components/Avatar'
import Comments from '../components/Comments'
import Icon from '../components/Icon'
import OrderModal from '../components/OrderModal'
import { useSession } from '../hooks/useSession'
import useRelativeTime from '../hooks/useRelativeTime'
import { finalPrice, formatAr } from '../lib/format'

const TABS = [['all', 'Pour vous'], ['following', 'Abonnements']]

/** Charge les publications page par page ; la suite est demandée quand on approche de la fin. */
function useDiscoverFeed(following) {
  const [state, setState] = useState({ items: [], done: false, loading: true, error: false })
  const page = useRef(0)
  const busy = useRef(false)
  const gen = useRef(0)

  const load = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    const g = gen.current
    setState((s) => ({ ...s, loading: true, error: false }))
    try {
      const { items, total } = await fetchPosts({ page: page.current, following })
      if (g !== gen.current) return
      page.current += 1
      setState((s) => {
        const seen = new Set(s.items.map((p) => p.id))
        const all = [...s.items, ...items.filter((p) => !seen.has(p.id))]
        return { items: all, done: !items.length || all.length >= total, loading: false, error: false }
      })
    } catch {
      if (g === gen.current) setState((s) => ({ ...s, loading: false, error: true }))
    } finally {
      if (g === gen.current) busy.current = false
    }
  }, [following])

  const reload = useCallback(() => {
    gen.current += 1
    page.current = 0
    busy.current = false
    setState({ items: [], done: false, loading: true, error: false })
    load()
  }, [load])

  useEffect(() => { reload() }, [reload])
  return { ...state, load, reload }
}

function Slide({ post, active, muted, onToggleMute, onOrdered, onOpenComments, commentCount }) {
  const nav = useNavigate()
  const { user } = useSession()
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [fit, setFit] = useState('contain')
  const [mediaError, setMediaError] = useState(false)
  const [liked, setLiked] = useState(!!post.liked)
  const [likes, setLikes] = useState(post.likes?.[0]?.count ?? 0)
  const [fav, setFav] = useState(!!post.fav)
  const [ordering, setOrdering] = useState(false)
  const [chatBusy, setChatBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const publishedAt = useRelativeTime(post.created_at)
  const { shop } = post
  const hasVideo = !!post.video_url

  // Lecture automatique uniquement quand la publication est à l'écran.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active) {
      v.currentTime = 0
      setPaused(false)
      v.play().catch(() => setPaused(true))
    } else {
      v.pause()
    }
  }, [active])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play().then(() => setPaused(false)).catch(() => {}) } else { v.pause(); setPaused(true) }
  }

  const onMeta = (w, h) => setFit(h > w ? 'cover' : 'contain')

  async function toggleLike() {
    if (!user) return nav('/login')
    const on = !liked
    setLiked(on); setLikes((n) => n + (on ? 1 : -1))
    try { await setLike(post.id, on) } catch { setLiked(!on); setLikes((n) => n + (on ? -1 : 1)) }
  }
  async function toggleFav() {
    if (!user) return nav('/login')
    const on = !fav
    setFav(on)
    try { await saveFav(post.id, on) } catch { setFav(!on) }
  }
  function share() {
    const url = `${location.origin}/post/${post.id}`
    if (navigator.share) navigator.share({ title: post.title, url }).catch(() => {})
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${post.title} ${url}`)}`, '_blank')
  }
  async function chat() {
    setNotice('')
    if (!user) return nav('/login', { state: { message: 'Connectez-vous pour discuter avec le vendeur.' } })
    if (user.id === shop.owner_id) return setNotice('C’est votre propre boutique.')
    setChatBusy(true)
    try {
      const id = await openConversation(shop.id)
      nav(`/messages/${id}`, { state: { draft: `Bonjour, je suis intéressé par « ${post.title} ».` } })
    } catch (e) {
      setNotice(e.message || 'Impossible d’ouvrir la discussion.')
    } finally {
      setChatBusy(false)
    }
  }

  return (
    <section className="dx-slide" aria-label={post.title}>
      <div className="dx-stage">
        <div className="dx-media">
          {hasVideo && !mediaError ? (
            <>
              <video
                ref={videoRef}
                className={`dx-fill is-${fit}`}
                src={post.video_url}
                poster={post.image_url || undefined}
                muted={muted}
                loop
                playsInline
                preload={active ? 'auto' : 'metadata'}
                aria-label={`Vidéo : ${post.title}`}
                onLoadedMetadata={(e) => onMeta(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                onError={() => setMediaError(true)}
                onClick={togglePlay}
              />
              {paused && (
                <button type="button" className="dx-play" aria-label="Lecture" onClick={togglePlay}>
                  <Icon name="play" size={28} filled />
                </button>
              )}
              <button
                type="button"
                className="dx-mute"
                aria-label={muted ? 'Activer le son' : 'Couper le son'}
                onClick={onToggleMute}
              >
                <Icon name={muted ? 'volume-off' : 'volume-on'} size={20} />
              </button>
            </>
          ) : post.image_url ? (
            <img
              className={`dx-fill is-${fit}`}
              src={post.image_url}
              alt={post.title}
              loading={active ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={(e) => onMeta(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
            />
          ) : (
            <div className="dx-noimg"><b>{post.title}</b></div>
          )}
        </div>

        <div className="dx-info">
          <div className="dx-shop">
            <Link to={`/shop/${shop.slug}`} className="dx-shop-link">
              <Avatar url={shop.avatar_url} name={shop.name} size={36} />
              <span>
                <b>{shop.name}</b>
                <small>{[publishedAt, shop.city].filter(Boolean).join(' · ')}</small>
              </span>
            </Link>
            {shop.is_live && <span className="live">En direct</span>}
          </div>

          <h2 className="dx-title">{post.title}</h2>
          <p className="dx-price">
            <b>{formatAr(finalPrice(post))}</b>
            {post.promo_percent > 0 && <><s>{formatAr(post.price)}</s><span className="tag">-{post.promo_percent}%</span></>}
            <small>{post.stock > 0 ? `${post.stock} en stock` : 'Épuisé'}</small>
          </p>
          {post.description && <div className="dx-desc" tabIndex={0} aria-label="Description complète">{post.description}</div>}
          {notice && <p className="dx-notice" role="alert">{notice}</p>}

          <div className="dx-cta">
            <button type="button" disabled={chatBusy} onClick={chat}>{chatBusy ? 'Ouverture…' : 'Discuter'}</button>
            <button type="button" className="pri" disabled={post.stock < 1} onClick={() => setOrdering(true)}>Commander</button>
          </div>
        </div>

        <div className="dx-rail">
          <button type="button" className={liked ? 'on' : ''} aria-pressed={liked} aria-label="J’aime" onClick={toggleLike}>
            <Icon name="heart" size={26} filled={liked} /><span>{likes}</span>
          </button>
          <button type="button" aria-label="Commentaires" onClick={() => onOpenComments(post.id)}>
            <Icon name="comment" size={26} /><span>{commentCount}</span>
          </button>
          <button type="button" className={fav ? 'on' : ''} aria-pressed={fav} aria-label={fav ? 'Retirer des enregistrés' : 'Enregistrer'} onClick={toggleFav}>
            <Icon name="bookmark" size={26} filled={fav} /><span>Enregistrer</span>
          </button>
          <button type="button" aria-label="Partager" onClick={share}>
            <Icon name="share" size={26} /><span>Partager</span>
          </button>
        </div>
      </div>

      {ordering && <OrderModal post={post} onClose={(done) => { setOrdering(false); if (done) onOrdered?.() }} />}
    </section>
  )
}

export default function DiscoverPage() {
  const { user } = useSession()
  const [tab, setTab] = useState('all')
  const { items, done, loading, error, load, reload } = useDiscoverFeed(tab === 'following')
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [commentsFor, setCommentsFor] = useState(null)
  const [counts, setCounts] = useState({})
  const scroller = useRef(null)
  const slides = useRef([])

  // Publication visible = publication active.
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) setIndex(Number(e.target.dataset.i))
      })
    }, { root, threshold: [0.6] })
    slides.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [items.length])

  // Charger la suite avant d'arriver au bout.
  useEffect(() => {
    if (!done && !loading && !error && items.length && index >= items.length - 3) load()
  }, [index, items.length, done, loading, error, load])

  useEffect(() => { setIndex(0); scroller.current?.scrollTo({ top: 0 }) }, [tab])

  const go = useCallback((dir) => {
    const target = slides.current[Math.min(Math.max(index + dir, 0), items.length - 1)]
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [index, items.length])

  useEffect(() => {
    const onKey = (e) => {
      if (commentsFor || /input|textarea|select/i.test(e.target.tagName)) return
      if (e.key === 'ArrowDown') { e.preventDefault(); go(1) }
      if (e.key === 'ArrowUp') { e.preventDefault(); go(-1) }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [go, commentsFor])

  const commentCount = (p) => counts[p.id] ?? p.comments?.[0]?.count ?? 0

  return (
    <div className="dx">
      <div className="dx-tabs" role="tablist" aria-label="Fil">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      <div className="dx-scroll" ref={scroller}>
        {items.map((post, i) => (
          <div key={post.id} className="dx-item" data-i={i} ref={(el) => { slides.current[i] = el }}>
            {Math.abs(i - index) <= 1 && (
              <Slide
                post={post}
                active={i === index && !commentsFor}
                muted={muted}
                onToggleMute={() => setMuted((m) => !m)}
                onOrdered={reload}
                onOpenComments={setCommentsFor}
                commentCount={commentCount(post)}
              />
            )}
          </div>
        ))}

        {loading && items.length === 0 && <div className="dx-state" role="status">Chargement…</div>}
        {!loading && !error && items.length === 0 && (
          <div className="dx-state">
            <b>{tab === 'following' ? 'Aucun abonnement' : 'Aucune publication'}</b>
            <p>{tab === 'following' ? (user ? 'Abonnez-vous à des boutiques pour voir leurs publications ici.' : 'Connectez-vous pour suivre des boutiques.') : 'Revenez bientôt, les vendeurs publient chaque jour.'}</p>
            {tab === 'following' && !user && <Link to="/login" className="btn pri">Se connecter</Link>}
          </div>
        )}
        {error && (
          <div className="dx-state">
            <b>Chargement impossible</b>
            <button type="button" onClick={items.length ? load : reload}>Réessayer</button>
          </div>
        )}
        {done && items.length > 0 && (
          <div className="dx-item dx-end">
            <div className="dx-state">
              <b>Vous avez tout vu</b>
              <button type="button" onClick={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })}>Revenir au début</button>
            </div>
          </div>
        )}
      </div>

      <div className="dx-arrows">
        <button type="button" aria-label="Publication précédente" disabled={index === 0} onClick={() => go(-1)}><Icon name="chevron-up" size={22} /></button>
        <button type="button" aria-label="Publication suivante" disabled={index >= items.length - 1} onClick={() => go(1)}><Icon name="chevron-down" size={22} /></button>
      </div>

      {commentsFor && (
        <div className="dx-sheet-wrap" onClick={() => setCommentsFor(null)}>
          <div className="dx-sheet" role="dialog" aria-modal="true" aria-label="Commentaires" onClick={(e) => e.stopPropagation()}>
            <div className="dx-sheet-head">
              <b>Commentaires</b>
              <button type="button" className="icon" aria-label="Fermer" onClick={() => setCommentsFor(null)}><Icon name="close" /></button>
            </div>
            <Comments
              postId={commentsFor}
              user={user}
              onAdd={() => setCounts((c) => ({ ...c, [commentsFor]: (c[commentsFor] ?? items.find((p) => p.id === commentsFor)?.comments?.[0]?.count ?? 0) + 1 }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
