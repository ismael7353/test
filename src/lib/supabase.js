import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Variables manquantes : créez frontend/.env avec VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY, puis relancez npm run dev.'
  )
}

function isPublicSupabaseKey(value) {
  if (value.startsWith('sb_publishable_')) return true
  const payload = value.split('.')[1]
  if (!payload) return false

  try {
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(encoded + '='.repeat((4 - (encoded.length % 4)) % 4)))
    return claims.role === 'anon'
  } catch {
    return false
  }
}

if (!isPublicSupabaseKey(key)) {
  throw new Error('Clé Supabase non publique détectée. Utilisez uniquement une clé publishable ou anon côté frontend.')
}

const clientKey = Symbol.for('vendeo.supabase.client')
const supabase = globalThis[clientKey] || (globalThis[clientKey] = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
}))

export { supabase }
