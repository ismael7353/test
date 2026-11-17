import { useState } from 'react'
import { createShop } from '../../api/shops'

export default function CreateShopForm({ userId, onCreated }) {
  const [form, setForm] = useState({ name: '', slug: '', whatsapp: '', city: '', bio: '' })
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const locate = () =>
    navigator.geolocation.getCurrentPosition((p) =>
      setCoords({ lat: p.coords.latitude, lng: p.coords.longitude })
    )

  async function submit(e) {
    e.preventDefault()
    try {
      await createShop(userId, { ...form, ...coords })
      onCreated()
    } catch (err) {
      setError(err.message.includes('slug') ? 'Ce lien est déjà pris ou invalide.' : err.message)
    }
  }

  return (
    <form className="card pad" onSubmit={submit}>
      <h2>Créer ma boutique</h2>
      <label>Nom de la boutique</label>
      <input required value={form.name} onChange={set('name')} />
      <label>Adresse du lien (minuscules, chiffres, tirets)</label>
      <input required pattern="[a-z0-9\-]{3,30}" value={form.slug} onChange={set('slug')} />
      <label>Numéro WhatsApp (ex : 261340000000)</label>
      <input required value={form.whatsapp} onChange={set('whatsapp')} />
      <label>Ville</label>
      <input value={form.city} onChange={set('city')} />
      <label>Description</label>
      <textarea value={form.bio} onChange={set('bio')} />
      {error && <p className="error">{error}</p>}
      <div className="row sp">
        <button type="button" onClick={locate}>
          {coords ? 'Position enregistrée' : 'Utiliser ma position'}
        </button>
        <button className="pri">Ouvrir ma boutique</button>
      </div>
    </form>
  )
}
