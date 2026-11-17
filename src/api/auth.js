import { supabase } from '../lib/supabase'

const unwrap = ({ data, error }) => {
  if (error) throw error
  return data
}

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

export const signUpWithIdentifier = async (identifier, password, meta = {}) => {
  const parsed = parseIdentifier(identifier)
  const credentials = parsed.kind === 'email'
    ? { email: parsed.value, password }
    : { phone: parsed.value, password }
  const options = {
    data: { ...meta, phone: parsed.kind === 'phone' ? parsed.value : '' },
    ...(parsed.kind === 'phone' ? { channel: 'sms' } : {}),
  }
  const data = unwrap(await supabase.auth.signUp({ ...credentials, options }))
  return { ...data, identifier: parsed.value, kind: parsed.kind }
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

export const signInWithProvider = (provider) =>
  supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/login` },
  }).then(unwrap)

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

export const updateAccountPhone = (phone) => {
  const parsed = parseIdentifier(phone)
  if (parsed.kind !== 'phone') throw new Error('Saisissez un numéro de téléphone valide.')
  return supabase.auth.updateUser({ phone: parsed.value }).then(unwrap)
}

export const updatePassword = (password) =>
  supabase.auth.updateUser({ password }).then(unwrap)

export const signOut = () => supabase.auth.signOut().then(unwrap)
