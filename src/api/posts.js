import { supabase } from '../lib/supabase'
import { PAGE_SIZE, rangeFor } from './pagination'
import { getPos } from '../lib/geo'
import { fetchMyFavs, followedShopIds } from './extra'
import { fetchMyLikes } from './social'

export const SELECT = '*, shop:shops(id, name, slug, city, whatsapp, facebook_url, owner_id, is_live, live_url, avatar_url, plan, plan_until, verified, lat, lng), likes(count), comments(count)'

// Tri disponible : [colonne, ordre croissant ?]
const SORTS = {
  recent: ['created_at', false],
  price_asc: ['price', true],
  price_desc: ['price', false],
  promo: ['promo_percent', false],
  near: ['created_at', false],
}

/**
 * Publications paginées.
 * onlyPublished=false pour le tableau de bord du vendeur.
 * search / sort / promoOnly pour les filtres de l'accueil.
 */
export async function fetchPosts({
  page = 0, shopId, onlyPublished = true, search = '', sort = 'recent', promoOnly = false, category = 'all', following = false,
}) {
  let nearIds = null
  const pos = getPos()
  if (sort === 'near' && pos) {
    const { data: r, error: e } = await supabase.rpc('nearby_posts', { p_lat: pos[0], p_lng: pos[1], p_limit: PAGE_SIZE, p_offset: page * PAGE_SIZE })
    if (e) throw e
    nearIds = r.map((x) => x.id)
    if (!nearIds.length) return { items: [], total: 0 }
  }
  const [column, ascending] = SORTS[sort] ?? SORTS.recent
  let query = supabase
    .from('posts')
    .select(SELECT, { count: 'exact' })
    .order(column, { ascending })
    .order('created_at', { ascending: false })

  if (onlyPublished) query = query.eq('is_published', true)
  if (shopId) query = query.eq('shop_id', shopId)
  if (promoOnly) query = query.gt('promo_percent', 0)
  if (category && category !== 'all') query = query.eq('category', category)
  if (following) {
    const ids = await followedShopIds()
    if (!ids.length) return { items: [], total: 0 }
    query = query.in('shop_id', ids)
  }
  const term = search.trim().replace(/[%,()*\\]/g, ' ').replace(/\s+/g, ' ')
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`)

  query = nearIds ? query.in('id', nearIds) : query.range(...rangeFor(page))
  const { data, count, error } = await query
  if (error) throw error
  const ids = data.map((p) => p.id)
  const [liked, favs] = await Promise.all([fetchMyLikes(ids), fetchMyFavs(ids)])
  const items = data.map((p) => ({ ...p, liked: liked.has(p.id), fav: favs.has(p.id) }))
  if (nearIds) {
    const rank = new Map(nearIds.map((id, i) => [id, i]))
    items.sort((a, b) => rank.get(a.id) - rank.get(b.id))
    return { items, total: nearIds.length === PAGE_SIZE ? (page + 1) * PAGE_SIZE + 1 : page * PAGE_SIZE + nearIds.length }
  }
  return { items, total: count ?? 0 }
}

export async function fetchPostById(id) {
  const { data, error } = await supabase.from('posts').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

// L'image est déjà compressée côté navigateur ; cache d'un an pour ne pas la retélécharger.
async function uploadImage(file) {
  const { data: { user } } = await supabase.auth.getUser()
  const path = `${user.id}/${Date.now()}-${file.name.replace(/\W/g, '_')}`
  const { error } = await supabase.storage.from('posts').upload(path, file, { cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('posts').getPublicUrl(path).data.publicUrl
}

const toRow = (values) => ({
  title: values.title.trim(),
  description: values.description,
  price: Number(values.price),
  promo_percent: Number(values.promo_percent),
  stock: Number(values.stock),
  category: values.category || 'autre',
  video_url: values.video_url || null,
  is_published: values.is_published,
})

/** Retourne l'id de la publication créée. */
export async function createPost(shopId, values, imageFile) {
  const image_url = imageFile ? await uploadImage(imageFile) : null
  const { data, error } = await supabase
    .from('posts').insert({ ...toRow(values), shop_id: shopId, image_url }).select('id').single()
  if (error) throw error
  return data.id
}

/** L'image n'est remplacée que si une nouvelle est fournie. */
export async function updatePost(id, values, imageFile) {
  const patch = toRow(values)
  if (imageFile) patch.image_url = await uploadImage(imageFile)
  const { error } = await supabase.from('posts').update(patch).eq('id', id)
  if (error) throw error
  return id
}

export async function setPostPublished(id, isPublished) {
  const { error } = await supabase.from('posts').update({ is_published: isPublished }).eq('id', id)
  if (error) throw error
}

export async function deletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

export async function fetchSaved() {
  const { data, error } = await supabase.from('favorites').select(`post:posts(${SELECT})`).order('post_id').limit(50)
  if (error) throw error
  return data.map((r) => r.post).filter(Boolean)
}

export async function fetchFeatured() {
  const { data, error } = await supabase.from('posts')
    .select('id, title, image_url, price, promo_percent, shop:shops!inner(name, slug, plan, plan_until)')
    .eq('is_published', true).eq('shop.plan', 'pro').gt('shop.plan_until', new Date().toISOString())
    .order('created_at', { ascending: false }).limit(8)
  if (error) throw error
  return data
}
