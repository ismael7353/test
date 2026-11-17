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
    .from('shops').select('id, name, slug, city, bio, whatsapp, is_live, lat, lng').not('lat', 'is', null)
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
