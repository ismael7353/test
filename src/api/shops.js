import { supabase } from '../lib/supabase'

export async function fetchShopBySlug(slug) {
  const { data, error } = await supabase.from('shops').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchMyShop(ownerId) {
  const { data, error } = await supabase.from('shops').select('*').eq('owner_id', ownerId).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchShopsWithLocation() {
  const { data, error } = await supabase
    .from('shops').select('id, name, slug, city, bio, whatsapp, facebook_url, is_live, lat, lng').not('lat', 'is', null)
  if (error) throw error
  return data
}

export async function createShop(ownerId, values) {
  const { error } = await supabase
    .from('shops').insert({ ...values, owner_id: ownerId, slug: values.slug.toLowerCase() })
  if (error) throw error
  await supabase.from('profiles').update({ account_type: 'seller' }).eq('id', ownerId)
}

export async function updateShop(id, patch) {
  const { error } = await supabase.from('shops').update(patch).eq('id', id)
  if (error) throw error
}

/** Boutiques actuellement en direct (colonnes minimales pour économiser les données). */
export async function fetchLiveShops(limit = 8) {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, city, live_url')
    .eq('is_live', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

const randomSuffix = () => Math.random().toString(36).slice(2, 6)

/** Retourne la boutique de l'utilisateur ; la crée automatiquement (nom = pseudo) à la première publication. */
export async function ensureShop(user) {
  const existing = await fetchMyShop(user.id)
  if (existing) return existing
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle()
  const name = profile?.username || 'vendeur'
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24) || 'boutique'
  for (let i = 0; i < 4; i++) {
    const slug = `${base}${i === 0 && base.length >= 3 ? '' : `-${randomSuffix()}`}`.slice(0, 30)
    const { error } = await supabase.from('shops').insert({ name, slug, owner_id: user.id })
    if (!error) { await supabase.from('profiles').update({ account_type: 'seller' }).eq('id', user.id); break }
    if (!/slug|duplicate|unique/i.test(error.message)) throw error
  }
  return fetchMyShop(user.id)
}
