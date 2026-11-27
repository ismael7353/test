import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { fetchConversation, fetchMessages, sendMessage, subscribe } from '../api/chat'
import { uploadPublic } from '../api/social'
import Avatar from '../components/Avatar'
import ContactLinks from '../components/ContactLinks'
import FilePicker from '../components/FilePicker'
import Icon from '../components/Icon'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'
import { compressImage } from '../lib/image'

export default function ChatPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const { user, loading } = useSession()
  const [conv, setConv] = useState(undefined)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState(state?.draft || '')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const end = useRef(null)
  const textInput = useRef(null)

  const add = (m) => setMsgs((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]))
  useEffect(() => {
    if (!user) return
    fetchConversation(id).then(setConv).catch(() => setConv(null))
    fetchMessages(id).then(setMsgs)
    return subscribe(id, add)
  }, [id, user])
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs])
  useEffect(() => {
    const root = document.documentElement
    const viewport = window.visualViewport
    const updateViewport = () => {
      root.style.setProperty('--chat-viewport-height', `${Math.round(viewport?.height || window.innerHeight)}px`)
      root.style.setProperty('--chat-viewport-offset', `${Math.round(viewport?.offsetTop || 0)}px`)
    }
    const resizeViewport = () => {
      updateViewport()
      if (document.activeElement === textInput.current) {
        requestAnimationFrame(() => end.current?.scrollIntoView({ block: 'end' }))
      }
    }

    updateViewport()
    viewport?.addEventListener('resize', resizeViewport)
    viewport?.addEventListener('scroll', updateViewport)
    window.addEventListener('resize', resizeViewport)
    return () => {
      viewport?.removeEventListener('resize', resizeViewport)
      viewport?.removeEventListener('scroll', updateViewport)
      window.removeEventListener('resize', resizeViewport)
      root.style.removeProperty('--chat-viewport-height')
      root.style.removeProperty('--chat-viewport-offset')
    }
  }, [])

  if (loading || (user && conv === undefined)) return <PageLoading label="Chargement de la conversation…" />
  if (!user) return <Navigate to="/login" replace />
  if (!conv) return <div className="card pad">Conversation introuvable.</div>

  const mine = conv.shop.owner_id === user.id
  const peer = mine ? { name: conv.buyer?.username || 'Client', url: conv.buyer?.avatar_url } : { name: conv.shop.name, url: conv.shop.avatar_url }

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setError('')
    setSending(true)
    try { add(await sendMessage(id, { body: text.trim() })); setText('') } catch (er) { setError(er.message) } finally { setSending(false) }
  }
  async function photo(e) {
    const f = e.target.files[0]
    if (!f) return
    setError('')
    setUploadingPhoto(true)
    try { add(await sendMessage(id, { image_url: await uploadPublic(await compressImage(f)) })) } catch (er) { setError(er.message) } finally { setUploadingPhoto(false) }
  }

  return (
    <div className="chat-page">
      <section className="chat">
        <header className="row chat-head">
          <Link className="chat-back" to="/messages" aria-label="Retour aux messages"><Icon name="arrow-left" /></Link>
          <Avatar url={peer.url} name={peer.name} size={40} />
          <div className="chat-peer">
            <b>{mine ? peer.name : <Link to={`/shop/${conv.shop.slug}`}>{peer.name}</Link>}</b>
            <span>Conversation privée</span>
          </div>
          {!mine && <ContactLinks shop={conv.shop} className="chat-contact-actions" />}
        </header>
        <div className="chat-body" role="log" aria-label="Messages" aria-live="polite">
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
        {error && <p className="error chat-error" role="alert">{error}</p>}
        <form className="chat-form" onSubmit={send}>
          <FilePicker
            accept="image/*"
            onChange={photo}
            title="Joindre une photo"
            icon="camera"
            disabled={uploadingPhoto || sending}
            className="icon-only chat-photo"
          />
          <input ref={textInput} type="text" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder="Écrivez un message…" aria-label="Votre message" autoComplete="off" />
          <button className="pri chat-send" disabled={sending || uploadingPhoto || !text.trim()} aria-label={sending ? 'Envoi en cours' : 'Envoyer'}>
            <Icon name="send" /><span className="chat-send-label">{sending ? 'Envoi…' : 'Envoyer'}</span>
          </button>
        </form>
      </section>
    </div>
  )
}
