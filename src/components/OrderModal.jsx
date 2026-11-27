import { useState } from 'react'
import { placeOrder } from '../api/orders'
import Icon from './Icon'
import { facebookLink, whatsappLink } from '../lib/format'

export default function OrderModal({ post, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', qty: 1 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contactFallback, setContactFallback] = useState(false)
  const contacts = [
    ...(post.shop.whatsapp?.trim()
      ? [{ id: 'whatsapp', label: 'WhatsApp', icon: 'phone' }]
      : []),
    ...(facebookLink(post.shop.facebook_url)
      ? [{ id: 'facebook', label: 'Facebook', icon: 'facebook' }]
      : []),
  ]
  const [channel, setChannel] = useState(contacts[0]?.id || '')
  const selectedContact = contacts.find((contact) => contact.id === channel)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (!selectedContact) {
      setError('Le vendeur n’a renseigné aucun moyen de contact.')
      return
    }

    setBusy(true)
    setError('')
    const message = `Bonjour, je commande ${form.qty} × ${post.title}. Nom : ${form.name}, tél : ${form.phone}`
    const contactUrl = selectedContact.id === 'whatsapp'
      ? whatsappLink(post.shop.whatsapp, message)
      : facebookLink(post.shop.facebook_url)
    const contactWindow = window.open('about:blank', '_blank')
    if (contactWindow) contactWindow.opener = null

    try {
      await placeOrder({ postId: post.id, name: form.name, phone: form.phone, qty: Number(form.qty) })
    } catch (err) {
      contactWindow?.close()
      setError(`L’enregistrement de la commande n’a pas pu être confirmé. ${err.message}`)
      setContactFallback(true)
      setBusy(false)
      return
    }

    try {
      if (contactWindow && !contactWindow.closed) {
        contactWindow.location.href = contactUrl
        onClose(true)
        return
      }
    } catch {
      contactWindow?.close()
    }
    setSubmitted(true)
    setBusy(false)
  }

  return (
    <div className="modal" onClick={(event) => {
      if (event.target === event.currentTarget && !busy) onClose(false)
    }}>
      <form className="card pad" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Commander</h2>
        <div className="mu">{post.title}</div>
        {submitted ? (
          <>
            <p role="status">Votre demande est enregistrée. Vous pouvez maintenant contacter le vendeur.</p>
            <div className="row sp">
              <button type="button" onClick={() => onClose(true)}>Terminer</button>
              <a className="btn pri" href={selectedContact.id === 'whatsapp'
                ? whatsappLink(post.shop.whatsapp, `Bonjour, je commande ${form.qty} × ${post.title}. Nom : ${form.name}, tél : ${form.phone}`)
                : facebookLink(post.shop.facebook_url)} target="_blank" rel="noopener noreferrer">
                Ouvrir {selectedContact.label}
              </a>
            </div>
          </>
        ) : (
          <>
            <p className="mu">Choisissez où contacter le vendeur. Votre demande sera enregistrée avant l’ouverture du service choisi.</p>
            {contacts.length > 1 && (
              <fieldset className="contact-choices">
                <legend>Continuer avec</legend>
                {contacts.map((contact) => (
                  <label key={contact.id} className={`contact-option${channel === contact.id ? ' is-selected' : ''}`}>
                    <input type="radio" name="contact-channel" value={contact.id} checked={channel === contact.id} onChange={() => setChannel(contact.id)} />
                    <span className={`contact-option-icon is-${contact.id}`}><Icon name={contact.icon} /></span>
                    <span className="contact-option-copy"><b>{contact.label}</b><small>Ouvrir la conversation</small></span>
                  </label>
                ))}
              </fieldset>
            )}
            {contacts.length === 1 && <p className="mu">Seul {contacts[0].label} est configuré pour cette boutique.</p>}
            <label>Votre nom</label>
            <input required value={form.name} onChange={set('name')} />
            <label>Votre téléphone</label>
            <input required type="tel" value={form.phone} onChange={set('phone')} />
            <label>Quantité</label>
            <input type="number" min="1" max={post.stock} value={form.qty} onChange={set('qty')} />
            {contacts.length === 0 && <p className="error">Le vendeur n’a renseigné aucun moyen de contact.</p>}
            {error && <p className="error" role="alert">{error}</p>}
            {contactFallback && selectedContact && (
              <a className="btn pri block" href={selectedContact.id === 'whatsapp'
                ? whatsappLink(post.shop.whatsapp, `Bonjour, je commande ${form.qty} × ${post.title}. Nom : ${form.name}, tél : ${form.phone}`)
                : facebookLink(post.shop.facebook_url)} target="_blank" rel="noopener noreferrer">
                Continuer quand même sur {selectedContact.label}
              </a>
            )}
            <div className="row sp">
              <button type="button" disabled={busy} onClick={() => onClose(false)}>Annuler</button>
              <button className="pri" disabled={busy || !selectedContact}>
                {busy ? 'Envoi…' : `Envoyer la demande${selectedContact ? ` sur ${selectedContact.label}` : ''}`}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
