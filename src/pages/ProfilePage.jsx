import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { parseIdentifier, signOut, updateAccountEmail, updateAccountPhone } from '../api/auth'
import { fetchMyShop, updateShop } from '../api/shops'
import { fetchProfile, saveProfile, uploadPublic } from '../api/social'
import Avatar from '../components/Avatar'
import { useSession } from '../hooks/useSession'
import { persistVerification } from '../lib/authFlow'
import { enablePush, pushSupported } from '../lib/push'
import { compressImage } from '../lib/image'

export default function ProfilePage() {
  const { user, loading } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [p, setP] = useState(null)
  const [shop, setShop] = useState(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [initialPhone, setInitialPhone] = useState('')
  const [msg, setMsg] = useState(location.state?.message || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setAccountEmail(user.email || '')
    fetchProfile(user.id).then((x) => {
      const profile = x || { id: user.id }
      setP(profile)
      setInitialPhone(profile.phone || '')
    }).catch((error) => setMsg(error.message || 'Impossible de charger votre profil.'))
    fetchMyShop(user.id).then(setShop)
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!p) return <p className="mu">Chargement…</p>

  const field = (obj, set) => (k) => ({ value: obj[k] || '', onChange: (e) => set({ ...obj, [k]: e.target.value }) })
  const pick = (obj, set, k) => async (e) => {
    const f = e.target.files[0]
    if (!f) return
    try { set({ ...obj, [k]: await uploadPublic(await compressImage(f)) }) } catch (er) { setMsg(er.message) }
  }
  async function save(e) {
    e.preventDefault()
    setMsg('')
    const nextEmail = accountEmail.trim().toLowerCase()
    const currentEmail = (user.email || '').toLowerCase()
    if (currentEmail && !nextEmail) {
      setMsg('Un e-mail utilisé pour la connexion ne peut pas être supprimé ici.')
      return
    }
    if (user.phone && !p.phone?.trim()) {
      setMsg('Le numéro utilisé pour la connexion ne peut pas être supprimé ici.')
      return
    }

    let phoneIdentifier = ''
    try {
      if (p.phone?.trim()) {
        const parsed = parseIdentifier(p.phone)
        if (parsed.kind !== 'phone') throw new Error('Saisissez un numéro de téléphone valide.')
        phoneIdentifier = parsed.value
      }
    } catch (error) {
      setMsg(error.message)
      return
    }
    const emailChanged = nextEmail !== currentEmail
    const phoneEdited = (p.phone || '').trim() !== initialPhone.trim()
    const phoneChanged = Boolean(phoneEdited && phoneIdentifier && phoneIdentifier !== (user.phone || ''))
    if (emailChanged && phoneChanged) {
      setMsg('Pour votre sécurité, modifiez et vérifiez une seule coordonnée à la fois.')
      return
    }

    setSaving(true)
    try {
      await saveProfile({
        id: user.id,
        full_name: p.full_name,
        phone: p.phone,
        bio: p.bio,
        avatar_url: p.avatar_url,
      })
      if (shop) await updateShop(shop.id, { name: shop.name, bio: shop.bio, city: shop.city, whatsapp: shop.whatsapp, avatar_url: shop.avatar_url, cover_url: shop.cover_url })

      if (emailChanged) {
        await updateAccountEmail(nextEmail)
        const request = {
          identifier: nextEmail,
          kind: 'email',
          purpose: 'email_change',
          verifyType: 'email_change',
        }
        persistVerification(request)
        navigate('/verify', { state: request })
        return
      }
      if (phoneChanged) {
        await updateAccountPhone(phoneIdentifier)
        const request = {
          identifier: phoneIdentifier,
          kind: 'phone',
          purpose: 'phone_change',
          verifyType: 'phone_change',
        }
        persistVerification(request)
        navigate('/verify', { state: request })
        return
      }
      setMsg('Profil enregistré.')
    } catch (er) {
      setMsg(er.message || 'Impossible d’enregistrer le profil.')
    } finally {
      setSaving(false)
    }
  }
  const f = field(p, setP), g = shop && field(shop, setShop)
  let phoneNeedsVerification = false
  if (p.phone?.trim()) {
    try {
      const parsed = parseIdentifier(p.phone)
      phoneNeedsVerification = parsed.kind === 'phone' && parsed.value !== (user.phone || '')
    } catch {
      phoneNeedsVerification = false
    }
  }

  async function verifyPhone() {
    setMsg('')
    setSaving(true)
    try {
      const parsed = parseIdentifier(p.phone)
      if (parsed.kind !== 'phone') throw new Error('Saisissez un numéro de téléphone valide.')
      await updateAccountPhone(parsed.value)
      const request = {
        identifier: parsed.value,
        kind: 'phone',
        purpose: 'phone_change',
        verifyType: 'phone_change',
      }
      persistVerification(request)
      navigate('/verify', { state: request })
    } catch (error) {
      setMsg(error.message || 'Impossible d’envoyer le code de vérification.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save}>
      <div className="card pad">
        <h2>Mon profil</h2>
        <div className="grid" style={{ marginBottom: 10 }}>
          <Link className="btn" to="/orders">Mes commandes</Link>
          <Link className="btn" to="/saved">Enregistrés</Link>
        </div>
        {p.is_admin && <Link className="btn block" to="/admin">Administration</Link>}
        {pushSupported() && <button type="button" className="block" onClick={() => enablePush().then(() => setMsg('Notifications push activées.')).catch((er) => setMsg(er.message))}>Activer les notifications push</button>}
        <div className="row">
          <Avatar url={p.avatar_url} name={p.full_name || user.email || user.phone} size={72} />
          <label className="btn">Changer la photo<input type="file" accept="image/*" hidden onChange={pick(p, setP, 'avatar_url')} /></label>
        </div>
        <label>Nom complet</label><input {...f('full_name')} />
        <label>Téléphone de connexion ou de contact</label><input type="tel" autoComplete="tel" {...f('phone')} />
        {phoneNeedsVerification && <button type="button" className="auth-text-button" disabled={saving} onClick={verifyPhone}>Vérifier ce numéro pour la connexion</button>}
        <label>E-mail de récupération</label>
        <input type="email" autoComplete="email" readOnly={Boolean(user.email)} value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} />
        <p className="mu auth-note">
          {user.email
            ? 'Cet e-mail est votre identifiant de connexion.'
            : 'Ajoutez un e-mail pour faciliter la récupération du compte ; il sera confirmé avant activation.'}
        </p>
        <label>Bio</label><textarea rows="3" maxLength={200} placeholder="Parlez de vous en quelques mots" {...f('bio')} />
      </div>

      {shop && (
        <div className="card shop-head">
          <div className="cover" style={shop.cover_url ? { backgroundImage: `url(${shop.cover_url})` } : undefined} />
          <div className="pad">
            <h2>Ma boutique</h2>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <Avatar url={shop.avatar_url} name={shop.name} size={72} />
              <label className="btn">Logo<input type="file" accept="image/*" hidden onChange={pick(shop, setShop, 'avatar_url')} /></label>
              <label className="btn">Photo de couverture<input type="file" accept="image/*" hidden onChange={pick(shop, setShop, 'cover_url')} /></label>
            </div>
            <label>Nom de la boutique</label><input required {...g('name')} />
            <label>Ville / quartier</label><input {...g('city')} />
            <label>WhatsApp</label><input required {...g('whatsapp')} />
            <label>Description</label><textarea rows="3" {...g('bio')} />
          </div>
        </div>
      )}
      {msg && <p className="mu" role="status">{msg}</p>}
      <button className="pri block" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      <button type="button" className="block" onClick={signOut}>Déconnexion</button>
    </form>
  )
}
