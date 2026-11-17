import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  parseIdentifier,
  requestPasswordReset,
  signInWithIdentifier,
  signInWithProvider,
  signOut,
  signUpWithIdentifier,
} from '../api/auth'
import { useSession } from '../hooks/useSession'
import { persistVerification } from '../lib/authFlow'

export default function LoginPage() {
  const { user } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const oauthFailed = new URLSearchParams(location.search).has('error')
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState({ type: 'buyer', name: '', identifier: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState(location.state?.message || (oauthFailed ? 'La connexion sociale n’a pas abouti. Vérifiez la configuration du fournisseur puis réessayez.' : ''))
  const [busy, setBusy] = useState(false)
  const [busyProvider, setBusyProvider] = useState('')
  const [signupInProgress, setSignupInProgress] = useState(false)

  if (user && !signupInProgress) return <Navigate to={user.user_metadata?.account_type === 'seller' ? '/dashboard' : '/'} replace />
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
    if (mode === 'signup') setSignupInProgress(true)
    try {
      if (isForgot) {
        const parsed = parseIdentifier(form.identifier)
        await requestPasswordReset(parsed.value)
        if (parsed.kind === 'email') {
          setMessage('Si un compte correspond à cette adresse, un lien de réinitialisation va être envoyé.')
        } else {
          const request = {
            identifier: parsed.value,
            kind: parsed.kind,
            purpose: 'recovery',
            verifyType: 'sms',
          }
          persistVerification(request)
          navigate('/verify', { state: request })
        }
        return
      }

      if (isSignin) {
        await signInWithIdentifier(form.identifier, form.password)
        return
      }

      const data = await signUpWithIdentifier(form.identifier, form.password, {
        full_name: form.name.trim(),
        account_type: form.type,
      })
      if (data.session) {
        await signOut()
        setMessage('La vérification est désactivée pour ce fournisseur. Activez la confirmation par code dans Supabase puis réessayez.')
        return
      }

      const request = {
        identifier: data.identifier,
        kind: data.kind,
        purpose: 'signup',
        verifyType: data.kind === 'email' ? 'signup' : 'sms',
      }
      persistVerification(request)
      navigate('/verify', { state: request })
    } catch (error) {
      setMessage(error.message || 'Impossible de continuer. Réessayez.')
    } finally {
      setSignupInProgress(false)
      setBusy(false)
    }
  }

  async function social(provider) {
    setMessage('')
    setBusyProvider(provider)
    try {
      await signInWithProvider(provider)
    } catch (error) {
      setMessage(error.message || `Connexion ${provider} indisponible. Réessayez.`)
    } finally {
      setBusyProvider('')
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
            ? 'Entrez l’e-mail ou le téléphone associé à votre compte.'
            : isSignin
              ? 'Retrouvez vos boutiques, commandes et publications.'
              : 'Achetez ou vendez simplement avec un e-mail ou un téléphone.'}
        </p>
      </div>

      {!isForgot && (
        <>
          <div className="seg">
            <button type="button" className={!isSignin ? 'on' : ''} onClick={() => changeMode('signup')}>Créer un compte</button>
            <button type="button" className={isSignin ? 'on' : ''} onClick={() => changeMode('signin')}>Connexion</button>
          </div>

          <div className="auth-social">
            <button type="button" className="block" disabled={Boolean(busyProvider)} onClick={() => social('google')}>
              {busyProvider === 'google' ? 'Connexion…' : 'Continuer avec Google'}
            </button>
            <button type="button" className="block" disabled={Boolean(busyProvider)} onClick={() => social('facebook')}>
              {busyProvider === 'facebook' ? 'Connexion…' : 'Continuer avec Facebook'}
            </button>
          </div>
          <div className="or">ou avec un identifiant</div>
        </>
      )}

      {mode === 'signup' && (
        <>
          <label>Je crée un compte pour…</label>
          <div className="seg">
            <button type="button" className={form.type === 'buyer' ? 'on' : ''} onClick={() => setForm((current) => ({ ...current, type: 'buyer' }))}>Acheter</button>
            <button type="button" className={form.type === 'seller' ? 'on' : ''} onClick={() => setForm((current) => ({ ...current, type: 'seller' }))}>Vendre</button>
          </div>
          <label>Nom complet</label>
          <input required autoComplete="name" value={form.name} onChange={set('name')} placeholder="Rakoto Jean" />
        </>
      )}

      <label>E-mail ou numéro de téléphone</label>
      <input
        type="text"
        required
        autoComplete="username"
        inputMode={form.identifier.includes('@') ? 'email' : 'tel'}
        value={form.identifier}
        onChange={set('identifier')}
        placeholder="nom@exemple.com ou +261 34 00 000 00"
      />

      {!isForgot && (
        <>
          <label>Mot de passe</label>
          <input
            type={show ? 'text' : 'password'}
            minLength="6"
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
                minLength="6"
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
      <button className="pri block" disabled={busy || Boolean(busyProvider)}>
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
      {mode === 'signup' && <p className="mu auth-note">Un code à 6 chiffres sera envoyé pour vérifier votre identifiant.</p>}
    </form>
  )
}
