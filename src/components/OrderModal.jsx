import { useState } from 'react'
import { placeOrder } from '../api/orders'
import { whatsappLink } from '../lib/format'

export default function OrderModal({ post, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', qty: 1 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await placeOrder({ postId: post.id, name: form.name, phone: form.phone, qty: Number(form.qty) })
      const message = `Bonjour, je commande ${form.qty} × ${post.title}. Nom : ${form.name}, tél : ${form.phone}`
      window.open(whatsappLink(post.shop.whatsapp, message), '_blank')
      onClose(true)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="modal" onClick={() => onClose(false)}>
      <form className="card pad" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Commander</h2>
        <div className="mu">{post.title}</div>
        <label>Votre nom</label>
        <input required value={form.name} onChange={set('name')} />
        <label>Votre téléphone</label>
        <input required type="tel" value={form.phone} onChange={set('phone')} />
        <label>Quantité</label>
        <input type="number" min="1" max={post.stock} value={form.qty} onChange={set('qty')} />
        {error && <p className="error">{error}</p>}
        <div className="row sp">
          <button type="button" onClick={() => onClose(false)}>Annuler</button>
          <button className="pri" disabled={busy}>Envoyer sur WhatsApp</button>
        </div>
      </form>
    </div>
  )
}
