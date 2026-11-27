import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  parseIdentifier,
  requestPasswordReset,
  signInWithIdentifier,
  signUpWithIdentifier,
} from '../api/auth'
import { useSession } from '../hooks/useSession'
import { persistVerification } from '../lib/authFlow'

export default function LoginPage() {
  const { user } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState({ fullName: '', identifier: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState(location.state?.message || '')
  const [busy, setBusy] = useState(false)
  const [authInProgress, setAuthInProgress] = useState(false)

  if (user && !authInProgress) return <Navigate to={'/'} replace />
  const isSignin = mode === 'signin'
  const isForgot = mode === 'forgot'
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    if (mode === 'signup' && form.password !== form.confirm) {
      setMessage('Les mots de passe ne sont pas identiques.')
      return
    }

    setBusy(true)
    if (!isForgot) setAuthInProgress(true)
    let keepCurrentRoute = false
    try {
      if (isForgot) {
        const parsed = parseIdentifier(form.identifier)
        await requestPasswordReset(parsed.value)
        if (parsed.kind === 'email') {
          setMessage('Si un compte correspond à cette adresse, un lien de réinitialisation sera envoyé.')
        } else {
          const request = {
            identifier: parsed.value,
            kind: 'phone',
            purpose: 'recovery',
            verifyType: 'sms',
          }
          persistVerification(request)
          keepCurrentRoute = true
          navigate('/verify', { state: request })
        }
        return
      }

      if (isSignin) {
        await signInWithIdentifier(form.identifier, form.password)
        keepCurrentRoute = true
        navigate('/', { replace: true })
        return
      }

      const parsed = parseIdentifier(form.identifier)
      await signUpWithIdentifier(parsed.value, form.password, {
        full_name: form.fullName,
      })
      keepCurrentRoute = true
      navigate('/', { replace: true, state: { message: 'Votre compte Vendeо est prêt.' } })
    } catch (error) {
      setMessage(error.message || 'Impossible de continuer. Réessayez.')
    } finally {
      if (!keepCurrentRoute) setAuthInProgress(false)
      setBusy(false)
    }
  }

  function changeMode(next) {
    setMode(next)
    setMessage('')
  }

  return (
    <form className="card pad auth" onSubmit={submit}>
      <div className="auth-head">
        <h2>{isForgot ? 'Réinitialiser le mot de passe' : isSignin ? 'Connexion à Vendeo' : 'Créer votre compte'}</h2>
        <p className="mu">
          {isForgot
            ? 'Entrez l’e-mail ou le numéro de téléphone associé à votre compte.'
            : isSignin
              ? 'Connectez-vous avec l’e-mail ou le numéro de téléphone utilisés à l’inscription.'
              : 'Créez votre compte avec quatre informations. Aucune confirmation par code.'}
        </p>
      </div>

      {!isForgot && (
        <div className="seg">
          <button type="button" className={!isSignin ? 'on' : ''} onClick={() => changeMode('signup')}>Créer un compte</button>
          <button type="button" className={isSignin ? 'on' : ''} onClick={() => changeMode('signin')}>Connexion</button>
        </div>
      )}

      {mode === 'signup' && (
        <>
          <label>Nom et prénom</label>
          <input
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={form.fullName}
            onChange={set('fullName')}
            placeholder="Ex. Jean Rakoto"
          />
          <label>Adresse e-mail ou numéro de téléphone</label>
          <input
            type="text"
            required
            autoComplete={form.identifier.includes('@') ? 'email' : 'tel'}
            value={form.identifier}
            onChange={set('identifier')}
            placeholder="nom@exemple.com ou +261 34 00 000 00"
          />
        </>
      )}

      {(isSignin || isForgot) && (
        <>
          <label>E-mail ou téléphone</label>
          <input
            type="text"
            required
            autoComplete={form.identifier.includes('@') ? 'email' : 'tel'}
            value={form.identifier}
            onChange={set('identifier')}
            placeholder="E-mail ou +261 34 00 000 00"
          />
        </>
      )}

      {!isForgot && (
        <>
          <label>Mot de passe</label>
          <input
            type={show ? 'text' : 'password'}
            minLength={mode === 'signup' ? 8 : 6}
            maxLength={128}
            required
            autoComplete={isSignin ? 'current-password' : 'new-password'}
            value={form.password}
            onChange={set('password')}
          />
          {mode === 'signup' && (
            <>
              <label>Confirmer le mot de passe</label>
              <input
                type={show ? 'text' : 'password'}
                minLength={8}
                maxLength={128}
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={set('confirm')}
              />
            </>
          )}
          <label className="row auth-show-password">
            <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} />
            Afficher le mot de passe
          </label>
        </>
      )}

      {message && <p className="mu auth-message" role="alert">{message}</p>}
      <button className="pri block" disabled={busy}>
        {busy
          ? 'Veuillez patienter…'
          : isForgot
            ? 'Envoyer les instructions'
            : isSignin
              ? 'Se connecter'
              : 'Créer mon compte'}
      </button>
      {isSignin && <button type="button" className="auth-text-button" onClick={() => changeMode('forgot')}>Mot de passe oublié ?</button>}
      {isForgot && <button type="button" className="auth-text-button" onClick={() => changeMode('signin')}>Retour à la connexion</button>}
      {mode === 'signup' && <p className="mu auth-note">Votre compte est créé immédiatement. Aucun code de confirmation n’est demandé.</p>}
    </form>
  )
}
