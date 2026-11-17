import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPost, updatePost } from '../api/posts'
import { uploadPublic } from '../api/social'
import { CATEGORIES } from '../lib/categories'
import { compressImage, formatSize } from '../lib/image'
import { isPro } from '../lib/format'

const EMPTY = { title: '', description: '', price: 0, promo_percent: 0, stock: 1, is_published: true, category: 'autre' }

/** Formulaire de création (sans `post`) ou de modification (avec `post`). */
export default function PostForm({ shop, post, onSaved }) {
  const [form, setForm] = useState(post ?? EMPTY)
  const [image, setImage] = useState(null)      // nouvelle image compressée
  const [info, setInfo] = useState('')
  const [preview, setPreview] = useState(post?.image_url ?? null)
  const [busy, setBusy] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [error, setError] = useState('')
  const pro = isPro(shop)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  useEffect(() => () => { if (image && preview) URL.revokeObjectURL(preview) }, [image, preview])

  async function pickImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    try {
      const small = await compressImage(file)
      setImage(small)
      setPreview(URL.createObjectURL(small))
      setInfo(`Image optimisée : ${formatSize(file.size)} → ${formatSize(small.size)}`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const id = post ? await updatePost(post.id, form, image) : await createPost(shop.id, form, image)
      onSaved(id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function pickVideo(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 25 * 1048576) return setError('Vidéo trop lourde (25 Mo maximum).')
    setError('')
    setUploadingVideo(true)
    setInfo('Envoi de la vidéo…')
    try {
      const url = await uploadPublic(file)
      setForm((value) => ({ ...value, video_url: url }))
      setInfo('Vidéo prête.')
    } catch (uploadError) {
      setError(uploadError.message || 'Impossible d’envoyer la vidéo.')
    } finally {
      setUploadingVideo(false)
    }
  }

  return (
    <form className="card pad" onSubmit={submit}>
      <h2>{post ? 'Modifier la publication' : 'Nouvelle publication'}</h2>

      <label>Photo</label>
      {preview && <img className="preview" src={preview} alt="Aperçu" />}
      <input type="file" accept="image/*" onChange={pickImage} />
      <p className="hint">{info || 'La photo est réduite automatiquement pour économiser les données.'}</p>

      <label>Titre</label>
      <input required maxLength="120" value={form.title} onChange={set('title')} />
      <label htmlFor="post-video">Vidéo (25 Mo maximum)</label>
      {form.video_url && (
        <div className="post-video-preview">
          <video className="vid" src={form.video_url} controls playsInline preload="metadata" />
          <button type="button" onClick={() => setForm((value) => ({ ...value, video_url: '' }))}>Retirer la vidéo</button>
        </div>
      )}
      <input id="post-video" type="file" accept="video/*" disabled={!pro || uploadingVideo || busy} onChange={pickVideo} />
      {!pro && <p className="premium-video-note">L’ajout de vidéos est réservé à Vendeo Pro. <Link to="/premium">Découvrir les avantages →</Link></p>}
      {!pro && form.video_url && <p className="premium-video-note" role="status">Retirez la vidéo pour enregistrer cette publication avec la formule gratuite.</p>}
      {uploadingVideo && <p className="mu" role="status">Envoi de la vidéo…</p>}
      <label>Catégorie</label>
      <select value={form.category || 'autre'} onChange={set('category')}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <label>Description</label>
      <textarea rows="4" value={form.description ?? ''} onChange={set('description')} />

      <div className="grid">
        <div>
          <label>Prix (Ar)</label>
          <input type="number" min="0" required value={form.price} onChange={set('price')} />
        </div>
        <div>
          <label>Promo (%)</label>
          <input type="number" min="0" max="90" value={form.promo_percent} onChange={set('promo_percent')} />
        </div>
      </div>
      <label>Stock</label>
      <input type="number" min="0" required value={form.stock} onChange={set('stock')} />

      <label className="row" style={{ marginBottom: 12 }}>
        <input type="checkbox" style={{ width: 'auto', margin: 0 }}
          checked={form.is_published}
          onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
        Visible par les clients
      </label>

      {error && <p className="error">{error}</p>}
      <button className="pri" disabled={busy || uploadingVideo || (!pro && !!form.video_url)} style={{ width: '100%' }}>
        {busy ? 'Envoi…' : !pro && form.video_url ? 'Retirez la vidéo pour enregistrer' : post ? 'Enregistrer' : 'Publier'}
      </button>
    </form>
  )
}
