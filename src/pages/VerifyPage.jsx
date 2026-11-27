import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resendAuthCode, verifyAuthCode } from '../api/auth'
import { clearPendingVerification, readPendingVerification } from '../lib/authFlow'

function description(purpose, kind) {
  if (purpose === 'recovery') return 'Confirmez votre numéro pour choisir un nouveau mot de passe.'
  if (purpose === 'email_change') return 'Confirmez la nouvelle adresse e-mail pour l’ajouter à votre compte.'
  if (purpose === 'phone_change') return 'Confirmez le numéro pour l’utiliser avec votre mot de passe.'
  return `Saisissez le code envoyé par ${kind === 'email' ? 'e-mail' : 'SMS'} pour activer votre compte.`
}

export default function VerifyPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const request = state || readPendingVerification()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)

  if (!request?.identifier || !request?.kind || !request?.purpose || !request?.verifyType) {
    return (
      <section className="card pad auth">
        <div className="auth-head">
          <h2>Vérification du compte</h2>
          <p className="mu">Cette demande a expiré ou n’est plus disponible.</p>
        </div>
        <Link className="btn block" to="/login">Retour à la connexion</Link>
      </section>
    )
  }

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      const { user } = await verifyAuthCode(request.identifier, code, request.verifyType)
      clearPendingVerification()
      if (request.purpose === 'recovery') {
        navigate('/reset-password', { replace: true })
      } else if (request.purpose === 'email_change' || request.purpose === 'phone_change') {
        navigate('/profile', {
          replace: true,
          state: { message: 'Coordonnée vérifiée et ajoutée à votre compte.' },
        })
      } else if (request.purpose === 'signup') {
        navigate('/complete-account', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      setMessage(error.message || 'Code invalide ou expiré. Vérifiez le code reçu et réessayez.')
    } finally {
      setBusy(false)
    }
  }

  async function resend() {
    setMessage('')
    setResending(true)
    try {
      await resendAuthCode(request.identifier, request.verifyType, request.purpose)
      setMessage('Un nouveau code a été envoyé.')
    } catch (error) {
      setMessage(error.message || 'Impossible de renvoyer le code pour le moment.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form className="card pad auth" onSubmit={submit}>
      <div className="auth-head">
        <h2>Vérifiez votre identifiant</h2>
        <p className="mu">{description(request.purpose, request.kind)}</p>
        <p className="auth-destination">{request.identifier}</p>
      </div>

      <label htmlFor="verification-code">Code de vérification</label>
      <input
        id="verification-code"
        className="auth-code-input"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{4,6}"
        minLength={4}
        maxLength={6}
        required
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
      />

      {message && <p className="mu auth-message" role="status">{message}</p>}
      <button className="pri block" disabled={busy || resending}>
        {busy ? 'Vérification…' : 'Confirmer le code'}
      </button>
      <button type="button" className="auth-text-button" disabled={busy || resending} onClick={resend}>
        {resending ? 'Envoi…' : 'Renvoyer le code'}
      </button>
      <Link className="auth-back-link" to="/login">Utiliser un autre identifiant</Link>
    </form>
  )
}
