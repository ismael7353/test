import { useEffect, useState } from 'react'
import { fetchReviews, saveReview } from '../api/extra'
import Avatar from './Avatar'
import Icon from './Icon'

function StarRating({ rating, size = 14 }) {
  return (
    <span className="stars-static" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => <Icon key={i} name="star" size={size} filled={i < rating} />)}
    </span>
  )
}

export default function Reviews({ shop, user }) {
  const [list, setList] = useState([])
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const load = () => fetchReviews(shop.id).then(setList).catch(() => {})
  useEffect(() => { load() }, [shop.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const avg = list.length ? (list.reduce((a, x) => a + x.rating, 0) / list.length).toFixed(1) : null

  async function send(e) {
    e.preventDefault()
    try { await saveReview(shop.id, rating, text.trim()); setText(''); setMsg('Merci pour votre avis.'); load() } catch (er) { setMsg(er.message) }
  }
  return (
    <div className="card pad">
      <h2>Avis {avg && <span className="mu">· <Icon name="star" size={14} filled /> {avg} ({list.length})</span>}</h2>
      {user && user.id !== shop.owner_id && (
        <form onSubmit={send}>
          <div className="stars">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)} aria-label={`${n} étoiles`} aria-pressed={n === rating}><Icon name="star" size={22} filled={n <= rating} /></button>)}</div>
          <input value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Votre expérience avec cette boutique (facultatif)" />
          <button className="pri">Publier mon avis</button>
          {msg && <p className="mu">{msg}</p>}
        </form>
      )}
      {list.length === 0 && <p className="mu">Aucun avis pour le moment.</p>}
      {list.map((r) => (
        <div key={r.id} className="row cmt ord">
          <Avatar url={r.author?.avatar_url} name={r.author?.username || 'Client'} size={34} />
          <div><b>{r.author?.username || 'Client'}</b> <StarRating rating={r.rating} />{r.body && <div>{r.body}</div>}</div>
        </div>
      ))}
    </div>
  )
}
