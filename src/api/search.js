import { supabase } from '../lib/supabase'
import { isPro } from '../lib/format'

const clean = (q) => q.trim().replace(/[%,()*\\]/g, ' ').replace(/\s+/g, ' ')

/** Boutiques dont le nom, le lien ou la ville correspond (Pro et vérifiées d'abord). */
export async function searchShops(q, limit = 5) {
  const s = clean(q)
  if (s.length < 2) return []
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, city, avatar_url, verified, plan, plan_until')
    .or(`name.ilike.%${s}%,slug.ilike.%${s}%,city.ilike.%${s}%`)
    .limit(limit * 2)
  if (error) throw error
  const score = (x) => (isPro(x) ? 2 : 0) + (x.verified ? 1 : 0)
  return data.sort((a, b) => score(b) - score(a)).slice(0, limit)
}

/** Suggestions de produits pendant la frappe (titres uniquement : requête légère). */
export async function suggestTitles(q, limit = 5) {
  const s = clean(q)
  if (s.length < 2) return []
  const { data, error } = await supabase
    .from('posts').select('id, title').eq('is_published', true)
    .ilike('title', `%${s}%`).order('created_at', { ascending: false }).limit(limit * 3)
  if (error) throw error
  const seen = new Set()
  return data.filter((p) => { const k = p.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true }).slice(0, limit)
}
