import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isUsernameLoginEmail, signOut, updateAccountEmail, updateUsernameForCurrentUser } from '../api/auth'
import { fetchMyShop, updateShop } from '../api/shops'
import { fetchProfile, saveProfile, uploadPublic } from '../api/social'
import Avatar from '../components/Avatar'
import FilePicker from '../components/FilePicker'
import ImageCropModal from '../components/ImageCropModal'
import { useSession } from '../hooks/useSession'
import { persistVerification } from '../lib/authFlow'
import { disablePush, enablePush, getPushState, pushSupported } from '../lib/push'
import { compressImage } from '../lib/image'
import { facebookLink } from '../lib/format'
import PageLoading from '../components/PageLoading'
import ShopLocationPicker from '../components/ShopLocationPicker'

export default function ProfilePage() {
  const { user, loading } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [p, setP] = useState(null)
  const [shop, setShop] = useState(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [initialUsername, setInitialUsername] = useState('')
  const [avatarCropFile, setAvatarCropFile] = useState(null)
  const [msg, setMsg] = useState(location.state?.message || '')
  const [saving, setSaving] = useState(false)
  const [pushState, setPushState] = useState({ supported: false, subscribed: false, permission: 'unsupported' })
  const [pushBusy, setPushBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    setAccountEmail(isUsernameLoginEmail(user.email) ? '' : user.email || '')
    fetchProfile(user.id).then((x) => {
      const profile = x || { id: user.id }
      setP(profile)
      setInitialUsername(profile.username || '')
    }).catch((error) => setMsg(error.message || 'Impossible de charger votre profil.'))
    fetchMyShop(user.id).then(setShop)
    getPushState().then(setPushState).catch(() => {})
  }, [user])

  if (loading) return <PageLoading label="Chargement de votre profil…" />
  if (!user) return <Navigate to="/login" replace />
  if (!p) return <PageLoading label="Chargement de votre profil…" />

  const currentEmail = isUsernameLoginEmail(user.email) ? '' : (user.email || '').toLowerCase()
  const field = (obj, set) => (k) => ({ value: obj[k] || '', onChange: (e) => set({ ...obj, [k]: e.target.value }) })
  const pick = (obj, set, k) => async (e) => {
    const f = e.target.files[0]
    if (!f) return
    try { set({ ...obj, [k]: await uploadPublic(await compressImage(f)) }) } catch (er) { setMsg(er.message) }
  }
  function chooseAvatar(e) {
    const file = e.target.files[0]
    if (file) setAvatarCropFile(file)
  }
  async function saveCroppedAvatar(file) {
    const url = await uploadPublic(await compressImage(file))
    setP((current) => ({ ...current, avatar_url: url }))
    setShop((current) => current ? ({ ...current, avatar_url: url }) : current)
    setAvatarCropFile(null)
  }
  async function togglePush() {
    setPushBusy(true)
    setMsg('')
    try {
      if (pushState.subscribed) {
        await disablePush(user.id)
        setMsg('Notifications désactivées sur cet appareil.')
      } else {
        await enablePush(user.id)
        setMsg('Notifications activées sur cet appareil.')
      }
      setPushState(await getPushState())
    } catch (error) {
      setMsg(error.message || 'Impossible de modifier les notifications.')
      setPushState(await getPushState().catch(() => pushState))
    } finally {
      setPushBusy(false)
    }
  }
  async function save(e) {
    e.preventDefault()
    setMsg('')
    const nextEmail = accountEmail.trim().toLowerCase()
    if (currentEmail && !nextEmail) {
      setMsg('Un e-mail utilisé pour la connexion ne peut pas être supprimé ici.')
      return
    }
    const emailChanged = nextEmail !== currentEmail
    if (shop) {
      const facebookUrl = (shop.facebook_url || '').trim()
      if (facebookUrl && !facebookLink(facebookUrl)) {
        setMsg('Saisissez un lien de profil Facebook valide.')
        return
      }
      if (!shop.whatsapp?.trim() && !facebookUrl) {
        setMsg('Ajoutez au moins un moyen de contact : WhatsApp ou Facebook.')
        return
      }
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
      const nextUsername = (p.username || '').trim()
      if (nextUsername && nextUsername !== initialUsername) {
        const savedUsername = await updateUsernameForCurrentUser(nextUsername)
        setP((current) => ({ ...current, username: savedUsername }))
        setInitialUsername(savedUsername)
      }
      if (shop) await updateShop(shop.id, {
        name: shop.name,
        bio: shop.bio,
        city: shop.city,
        whatsapp: shop.whatsapp.trim() || null,
        facebook_url: facebookLink(shop.facebook_url),
        avatar_url: p.avatar_url || null,
        cover_url: shop.cover_url,
        lat: shop.lat == null ? null : Number(shop.lat),
        lng: shop.lng == null ? null : Number(shop.lng),
      })

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
      setMsg('Profil enregistré.')
    } catch (er) {
      setMsg(er.message || 'Impossible d’enregistrer le profil.')
    } finally {
      setSaving(false)
    }
  }
  const f = field(p, setP), g = shop && field(shop, setShop)
  return (
    <>
    <form onSubmit={save}>
      <div className="card pad">
        <h2>Mon profil</h2>
        <div className="grid" style={{ marginBottom: 10 }}>
          <Link className="btn" to="/orders">Mes commandes</Link>
          <Link className="btn" to="/saved">Enregistrés</Link>
        </div>
        {p.is_admin && <Link className="btn block" to="/admin">Administration</Link>}
        <section className="card pad" aria-labelledby="push-settings-title" style={{ marginTop: 14 }}>
          <h3 id="push-settings-title" style={{ marginTop: 0 }}>Notifications sur Android</h3>
          <p className="mu">Recevez une alerte lorsque vous avez un nouveau message, une commande ou une interaction, même lorsque Vendeo est fermé.</p>
          {!pushSupported()
            ? <p className="mu" role="status">Les notifications push nécessitent un site HTTPS, un navigateur compatible et la clé VAPID publique configurée.</p>
            : <><p className="mu" role="status">{pushState.subscribed ? 'Cet appareil est abonné aux notifications.' : pushState.permission === 'denied' ? 'Les notifications sont bloquées dans les paramètres du navigateur.' : 'Les notifications ne sont pas encore activées sur cet appareil.'}</p>
              <button type="button" className={pushState.subscribed ? 'block' : 'pri block'} disabled={pushBusy || pushState.permission === 'denied'} onClick={togglePush}>
                {pushBusy ? 'Mise à jour…' : pushState.subscribed ? 'Désactiver les notifications sur cet appareil' : 'Activer les notifications sur cet appareil'}
              </button></>}
        </section>
        <div className="row">
          <Avatar url={p.avatar_url} name={p.username || 'Client'} size={72} />
          <FilePicker
            accept="image/*"
            onChange={chooseAvatar}
            title="Changer la photo"
            description="Recadrez pour un rendu soigné."
            icon="camera"
            className="profile-avatar-picker"
          />
        </div>
        <label>Pseudo public</label>
        {p.username
          ? <input required minLength={3} maxLength={30} autoComplete="username" {...f('username')} />
          : <Link className="btn block" to="/complete-account">Choisir mon pseudo public</Link>}
        {p.username && <p className="mu auth-note">Ce pseudo est visible publiquement. Connectez-vous avec votre e-mail ou votre téléphone.</p>}
        <label>Téléphone de contact (facultatif)</label><input type="tel" autoComplete="tel" {...f('phone')} />
        <p className="mu auth-note">Ce numéro de contact est indépendant de l’e-mail ou du téléphone de connexion.</p>
        <label>E-mail du compte (facultatif)</label>
        <input type="email" autoComplete="email" readOnly={Boolean(currentEmail)} value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} />
        <p className="mu auth-note">
          {currentEmail
            ? 'Cet e-mail vérifié sert à vous connecter et à récupérer votre mot de passe.'
            : 'Ajoutez et confirmez un e-mail pour pouvoir aussi vous connecter avec celui-ci et récupérer votre mot de passe.'}
        </p>
        <label>Bio</label><textarea rows="3" maxLength={200} placeholder="Parlez de vous en quelques mots" {...f('bio')} />
      </div>

      {shop && (
        <div className="card shop-head">
          <div className="cover" style={shop.cover_url ? { backgroundImage: `url(${shop.cover_url})` } : undefined} />
          <div className="pad">
            <h2>Ma boutique</h2>
            <p className="mu auth-note">La photo de votre profil est également utilisée comme photo de votre boutique. Vous n’avez qu’une seule photo à gérer.</p>
            <div className="row" style={{ flexWrap: 'wrap' }}>
              <FilePicker accept="image/*" onChange={pick(shop, setShop, 'cover_url')} title="Photo de couverture" icon="image" className="is-compact" />
            </div>
            <label>Nom de la boutique</label><input required {...g('name')} />
            <label>Ville / quartier</label><input {...g('city')} />
            <label>WhatsApp</label><input type="tel" placeholder="261340000000" {...g('whatsapp')} />
            <label>Lien du profil Facebook</label><input type="url" placeholder="https://www.facebook.com/votre.profil" {...g('facebook_url')} />
            <p className="mu auth-note">Ajoutez les deux pour laisser le choix à vos clients. Au moins un moyen de contact est nécessaire.</p>
            <label>Description</label><textarea rows="3" {...g('bio')} />
            <ShopLocationPicker lat={shop.lat} lng={shop.lng} onChange={(point) => setShop((current) => ({ ...current, ...point }))} />
          </div>
        </div>
      )}
      {msg && <p className="mu" role="status">{msg}</p>}
      <button className="pri block" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
      <button type="button" className="block" onClick={signOut}>Déconnexion</button>
    </form>
    {avatarCropFile && <ImageCropModal file={avatarCropFile} onApply={saveCroppedAvatar} onCancel={() => setAvatarCropFile(null)} />}
    </>
  )
}
