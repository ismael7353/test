import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { fetchConversation, fetchMessages, sendMessage, subscribe } from '../api/chat'
import { uploadPublic } from '../api/social'
import Avatar from '../components/Avatar'
import { useSession } from '../hooks/useSession'
import { whatsappLink } from '../lib/format'
import { compressImage } from '../lib/image'
import Icon from '../components/Icon'

export default function ChatPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { user, loading } = useSession()
  const [conv, setConv] = useState(undefined)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState(state?.draft || '')
  const [error, setError] = useState('')
  const end = useRef(null)

  const add = (m) => setMsgs((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]))
  useEffect(() => {
    if (!user) return
    fetchConversation(id).then(setConv).catch(() => setConv(null))
    fetchMessages(id).then(setMsgs)
    return subscribe(id, add)
  }, [id, user])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs])

  if (loading || (user && conv === undefined)) return <p className="mu">Chargement…</p>
  if (!user) return <Navigate to="/login" replace />
  if (!conv) return <div className="card pad">Conversation introuvable.</div>

  const mine = conv.shop.owner_id === user.id
  const peer = mine ? { name: conv.buyer?.full_name || 'Client', url: conv.buyer?.avatar_url } : { name: conv.shop.name, url: conv.shop.avatar_url }

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    try { add(await sendMessage(id, { body: text.trim() })); setText('') } catch (er) { setError(er.message) }
  }
  async function photo(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    try { add(await sendMessage(id, { image_url: await uploadPublic(await compressImage(f)) })) } catch (er) { setError(er.message) }
  }

  return (
    <div className="card chat">
      <div className="row chat-head">
        <Link to="/messages" aria-label="Retour">←</Link>
        <Avatar url={peer.url} name={peer.name} size={36} />
        <b style={{ flex: 1 }}>{mine ? peer.name : <Link to={`/shop/${conv.shop.slug}`}>{peer.name}</Link>}</b>
        {!mine && <a className="btn" href={whatsappLink(conv.shop.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a>}
      </div>
      <div className="chat-body">
        {msgs.length === 0 && <p className="mu" style={{ textAlign: 'center' }}>Écrivez votre premier message.</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`msg${m.sender_id === user.id ? ' me' : ''}`}>
            {m.image_url && <a href={m.image_url} target="_blank" rel="noreferrer"><img src={m.image_url} alt="Photo" loading="lazy" /></a>}
            {m.body}
            <small>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
          </div>
        ))}
        <div ref={end} />
      </div>
      {error && <p className="error" style={{ margin: '0 12px' }}>{error}</p>}
      <form className="chat-form" onSubmit={send}>
        <label className="btn chat-photo" aria-label="Envoyer une photo"><Icon name="camera" /><input type="file" accept="image/*" hidden onChange={photo} /></label>
        <input type="text" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Votre message…" />
        <button className="pri">Envoyer</button>
      </form>
    </div>
  )
}
