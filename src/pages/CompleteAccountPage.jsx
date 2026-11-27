import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { setUsernameForCurrentUser, signOut } from '../api/auth'
import { fetchProfile } from '../api/social'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'

export default function CompleteAccountPage() {
  const { user, loading } = useSession()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(undefined)
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchProfile(user.id)
      .then(setProfile)
      .catch((error) => {
        setMessage(error.message || 'Impossible de charger votre profil.')
        setProfile(null)
      })
  }, [user])

  if (loading) return <PageLoading label="Vérification du compte…" />
  if (!user) return <Navigate to="/login" replace />
  if (profile === undefined) return <PageLoading label="Chargement du compte…" />
  if (profile?.username) return <Navigate to={'/'} replace />

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      await setUsernameForCurrentUser(username)
      navigate('/', { replace: true })
    } catch (error) {
      setMessage(error.message || 'Impossible d’enregistrer ce pseudo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card pad auth" onSubmit={submit}>
      <div className="auth-head">
        <h2>Choisissez votre pseudo public</h2>
        <p className="mu">Votre pseudo sera affiché sur Vendeo. Utilisez votre e-mail ou votre téléphone pour vous connecter.</p>
      </div>
      {profile && <p className="mu auth-note">Vous pourrez le modifier plus tard dans votre profil.</p>}
      <label htmlFor="account-username">Pseudo public</label>
      <input
        id="account-username"
        required
        minLength={3}
        maxLength={30}
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="rakoto.jean"
      />
      <p className="mu auth-note">3 à 30 caractères : lettres sans accent, chiffres, point, tiret ou soulignement.</p>
      {message && <p className="mu auth-message" role="alert">{message}</p>}
      <button className="pri block" disabled={busy || !profile}>{busy ? 'Enregistrement…' : 'Enregistrer mon pseudo'}</button>
      <button type="button" className="auth-text-button" onClick={signOut}>Déconnexion</button>
    </form>
  )
}
