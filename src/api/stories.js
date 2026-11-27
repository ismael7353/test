import { supabase } from '../lib/supabase'
import { ok } from './ok'

/** Stories actives regroupées par boutique : [{ shop, items }]. */
export async function fetchStoryGroups() {
  const rows = ok(await supabase.from('stories').select('*, shop:shops(id, name, slug, avatar_url)').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(120))
  const map = new Map()
  rows.forEach((r) => { if (!map.has(r.shop.id)) map.set(r.shop.id, { shop: r.shop, items: [] }); map.get(r.shop.id).items.push(r) })
  return [...map.values()].map((group) => ({ ...group, items: group.items.reverse() }))
}

export async function fetchShopStories(shopId) {
  return ok(await supabase.from('stories').select('*').eq('shop_id', shopId).gt('expires_at', new Date().toISOString()).order('created_at').limit(1000))
}

export const addStory = (shop_id, v) => supabase.from('stories').insert({ shop_id, ...v }).then(ok)
