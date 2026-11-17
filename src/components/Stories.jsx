import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStoryGroups } from '../api/stories'
import Avatar from './Avatar'
import Icon from './Icon'

export function StoryViewer({ groups, start, onClose }) {
  const [pos, setPos] = useState(start)
  const g = groups[pos.g], s = g.items[pos.i]
  const next = useCallback(() => {
    if (pos.i < g.items.length - 1) setPos({ g: pos.g, i: pos.i + 1 })
    else if (pos.g < groups.length - 1) setPos({ g: pos.g + 1, i: 0 })
    else onClose()
  }, [g.items.length, groups.length, onClose, pos])
  const prev = useCallback(() => {
    if (pos.i > 0) setPos({ g: pos.g, i: pos.i - 1 })
    else if (pos.g > 0) {
      const previousGroup = pos.g - 1
      setPos({ g: previousGroup, i: groups[previousGroup].items.length - 1 })
    }
  }, [groups, pos])

  useEffect(() => {
    if (s.media_type === 'video') return
    const t = setTimeout(next, 5000)
    return () => clearTimeout(t)
  }, [next, s.id, s.media_type])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.target instanceof HTMLVideoElement || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [next, onClose, prev])

  return (
    <div className="sv" role="dialog" aria-modal="true" aria-label={`Stories de ${g.shop.name}`}>
      <button className="sv-close" onClick={onClose} aria-label="Fermer les stories"><Icon name="close" /></button>
      <div className="sv-stage">
        <div className="sv-bars">{g.items.map((x, i) => <i key={x.id} className={`${i < pos.i ? 'done' : i === pos.i ? 'cur' : ''}${i === pos.i && s.media_type === 'video' ? ' video' : ''}`} />)}</div>
        <div className="sv-head row">
          <Avatar url={g.shop.avatar_url} name={g.shop.name} size={36} />
          <Link to={`/shop/${g.shop.slug}`} onClick={onClose}><b>{g.shop.name}</b></Link>
        </div>
        {s.media_type === 'video'
          ? <video key={s.id} className="sv-media" src={s.media_url} autoPlay playsInline controls onEnded={next} />
          : <img key={s.id} className="sv-media" src={s.media_url} alt={s.caption || `Story de ${g.shop.name}`} />}
        {s.caption && <p className="sv-cap">{s.caption}</p>}
        <button className="sv-zone l" onClick={prev} aria-label="Story précédente" />
        <button className="sv-zone r" onClick={next} aria-label="Story suivante" />
        <button className="sv-nav prev" onClick={prev} aria-label="Story précédente">‹</button>
        <button className="sv-nav next" onClick={next} aria-label="Story suivante">›</button>
      </div>
    </div>
  )
}

export default function Stories() {
  const [groups, setGroups] = useState([])
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')

  const loadStories = useCallback(async () => {
    setError('')
    try {
      setGroups(await fetchStoryGroups())
    } catch (loadError) {
      setError(loadError.message || 'Impossible de charger les stories.')
    }
  }, [])

  useEffect(() => { loadStories() }, [loadStories])

  if (error) return <div className="stories-error" role="alert"><span>Les stories ne sont pas disponibles pour le moment.</span><button onClick={loadStories}>Réessayer</button></div>
  if (!groups.length) return null

  return (
    <>
      <div className="stories">
        {groups.map((g, gi) => (
          <button key={g.shop.id} className="story" aria-label={`Revoir les stories de ${g.shop.name}`} title={`Revoir les stories de ${g.shop.name}`} onClick={() => setOpen({ g: gi, i: 0 })}>
            <span className="story-avatar-wrap">
              <span className="ring"><Avatar url={g.shop.avatar_url} name={g.shop.name} size={56} /></span>
              {g.items.length > 1 && <span className="story-count" aria-label={`${g.items.length} stories`}>{g.items.length}</span>}
            </span>
            <span>{g.shop.name}</span>
          </button>
        ))}
      </div>
      {open && <StoryViewer groups={groups} start={open} onClose={() => setOpen(null)} />}
    </>
  )
}
