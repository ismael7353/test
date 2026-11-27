import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updatePassword } from '../api/auth'
import PageLoading from '../components/PageLoading'
import { useSession } from '../hooks/useSession'

export default function ResetPasswordPage() {
  const { user, loading } = useSession()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    if (password !== confirm) {
      setMessage('Les mots de passe ne sont pas identiques.')
      return
    }

    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (error) {
      setMessage(error.message || 'Impossible de modifier le mot de passe. Demandez un nouveau lien.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoading label="Vérification de votre lien…" />
  if (done) {
    return (
      <section className="card pad auth">
        <div className="auth-head">
          <h2>Mot de passe modifié</h2>
          <p className="mu">Votre compte est prêt à être utilisé.</p>
        </div>
        <Link className="btn pri block" to={user ? '/profile' : '/login'}>Continuer</Link>
      </section>
    )
  }
  if (!user) {
    return (
      <section className="card pad auth">
        <div className="auth-head">
          <h2>Lien non valide ou expiré</h2>
          <p className="mu">Demandez un nouveau lien de réinitialisation pour continuer.</p>
        </div>
        <Link className="btn pri block" to="/login">Retour à la connexion</Link>
      </section>
    )
  }

  return (
    <form className="card pad auth" onSubmit={submit}>
      <div className="auth-head">
        <h2>Choisir un nouveau mot de passe</h2>
        <p className="mu">Utilisez au moins 8 caractères.</p>
      </div>
      <label htmlFor="new-password">Nouveau mot de passe</label>
      <input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
      <label htmlFor="confirm-password">Confirmer le mot de passe</label>
      <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
      {message && <p className="mu auth-message" role="alert">{message}</p>}
      <button className="pri block" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer le mot de passe'}</button>
    </form>
  )
}
