import { supabase } from '../lib/supabase'

const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

export function normalizeUsername(username) {
  if (typeof username !== 'string') {
    throw new Error('Saisissez un pseudo.')
  }
  const value = username.trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(value)) {
    throw new Error('Le pseudo doit contenir 3 à 30 caractères : lettres sans accent, chiffres, point, tiret ou soulignement.')
  }
  return value
}

export const isUsernameLoginEmail = (email) =>
  typeof email === 'string' && email.endsWith('@login.vendeo.invalid')

export function parseIdentifier(identifier) {
  const value = identifier.trim()
  if (!value) throw new Error('Saisissez un e-mail ou un numéro de téléphone.')

  if (value.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Saisissez une adresse e-mail valide.')
    }
    return { kind: 'email', value: value.toLowerCase() }
  }

  const digits = value.replace(/\D/g, '')
  let international
  if (value.startsWith('+')) international = `+${digits}`
  else if (digits.startsWith('00')) international = `+${digits.slice(2)}`
  else if (digits.startsWith('261')) international = `+${digits}`
  else if (digits.startsWith('0')) international = `+261${digits.slice(1)}`
  else if (digits.length === 9) international = `+261${digits}`
  else throw new Error('Saisissez un numéro avec son indicatif, par exemple +261 34 00 000 00.')

  if (!/^\+[1-9]\d{7,14}$/.test(international)) {
    throw new Error('Ce numéro de téléphone ne semble pas valide.')
  }
  return { kind: 'phone', value: international }
}

export const signInWithIdentifier = (identifier, password) => {
  const parsed = parseIdentifier(identifier)
  const credentials = parsed.kind === 'email'
    ? { email: parsed.value, password }
    : { phone: parsed.value, password }
  return supabase.auth.signInWithPassword(credentials).then(unwrap)
}

export async function signUpWithIdentifier(identifier, password, meta = {}) {
  const parsed = parseIdentifier(identifier)
  const fullName = String(meta.full_name || '').trim().replace(/\s+/g, ' ')
  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error('Saisissez votre nom et prénom (2 à 80 caractères).')
  }

  const options = {
    data: {
      full_name: fullName,
      account_type: 'buyer',
      phone: parsed.kind === 'phone' ? parsed.value : '',
    },
  }
  const credentials = parsed.kind === 'email'
    ? { email: parsed.value, password, options }
    : { phone: parsed.value, password, options }
  const result = unwrap(await supabase.auth.signUp(credentials))

  // Vendeо uses password-only signup: Supabase must have email/phone
  // confirmations disabled so signUp returns an authenticated session.
  if (!result.session) {
    throw new Error('La confirmation est encore activée dans Supabase. Désactivez « Confirm email » (et « Confirm phone » si vous autorisez les numéros), puis réessayez. Aucun code ne doit être demandé à l’inscription.')
  }
  return result
}

export async function setUsernameForCurrentUser(username) {
  const normalized = normalizeUsername(username)
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Connectez-vous pour choisir un pseudo.')

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: normalized })
    .eq('id', authData.user.id)
    .is('username', null)
    .select('username')
    .maybeSingle()
  if (error) {
    if (error.code === '23505') throw new Error('Ce pseudo est déjà utilisé. Choisissez-en un autre.')
    throw error
  }
  if (!data) throw new Error('Ce compte a déjà un pseudo. Rechargez votre profil.')
  return data.username
}

export async function updateUsernameForCurrentUser(username) {
  const normalized = normalizeUsername(username)
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!authData.user) throw new Error('Connectez-vous pour modifier votre pseudo.')

  const { data, error } = await supabase
    .from('profiles')
    .update({ username: normalized })
    .eq('id', authData.user.id)
    .select('username')
    .single()
  if (error) {
    if (error.code === '23505') throw new Error('Ce pseudo est déjà utilisé. Choisissez-en un autre.')
    throw error
  }
  return data.username
}

export const verifyAuthCode = (identifier, token, type) => {
  const parsed = parseIdentifier(identifier)
  const credentials = parsed.kind === 'email'
    ? { email: parsed.value, token, type }
    : { phone: parsed.value, token, type }
  return supabase.auth.verifyOtp(credentials).then(unwrap)
}

export const resendAuthCode = (identifier, type, purpose) => {
  const parsed = parseIdentifier(identifier)
  if (purpose === 'signup') {
    const credentials = parsed.kind === 'email'
      ? { type: 'signup', email: parsed.value }
      : { type: 'sms', phone: parsed.value }
    return supabase.auth.resend(credentials).then(unwrap)
  }
  if (purpose === 'email_change' || purpose === 'phone_change') {
    const credentials = parsed.kind === 'email'
      ? { type: 'email_change', email: parsed.value }
      : { type: 'phone_change', phone: parsed.value }
    return supabase.auth.resend(credentials).then(unwrap)
  }

  if (type === 'email' || type === 'sms') {
    const credentials = parsed.kind === 'email'
      ? { email: parsed.value, options: { shouldCreateUser: false } }
      : { phone: parsed.value, options: { shouldCreateUser: false, channel: 'sms' } }
    return supabase.auth.signInWithOtp(credentials).then(unwrap)
  }
  throw new Error('Impossible de renvoyer ce code.')
}

export const requestPasswordReset = async (identifier) => {
  const parsed = parseIdentifier(identifier)
  if (parsed.kind === 'email') {
    return unwrap(await supabase.auth.resetPasswordForEmail(parsed.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    }))
  }

  return unwrap(await supabase.auth.signInWithOtp({
    phone: parsed.value,
    options: { shouldCreateUser: false, channel: 'sms' },
  }))
}

export const updateAccountEmail = (email) =>
  supabase.auth.updateUser({ email: email.trim().toLowerCase() }, {
    emailRedirectTo: `${window.location.origin}/profile`,
  }).then(unwrap)

export const updatePassword = (password) =>
  supabase.auth.updateUser({ password }).then(unwrap)

export const signOut = () => supabase.auth.signOut().then(unwrap)
