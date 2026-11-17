import { supabase } from '../lib/supabase'
import { ok } from './ok'

const me = async () => (await supabase.auth.getUser()).data.user

export async function fetchMyFavs(ids) {
  const u = await me()
  if (!u || !ids.length) return new Set()
  return new Set(ok(await supabase.from('favorites').select('post_id').in('post_id', ids).eq('user_id', u.id)).map((r) => r.post_id))
}
export const setFav = (post_id, on) =>
  (on ? supabase.from('favorites').insert({ post_id }) : supabase.from('favorites').delete().eq('post_id', post_id)).then(ok)

export async function followedShopIds() {
  const u = await me()
  return u ? ok(await supabase.from('follows').select('shop_id').eq('user_id', u.id)).map((r) => r.shop_id) : []
}
export const fetchReviews = (shop_id) =>
  supabase.from('reviews').select('*, author:profiles(full_name, avatar_url)').eq('shop_id', shop_id).order('created_at', { ascending: false }).limit(50).then(ok)
export const saveReview = (shop_id, rating, body) =>
  supabase.from('reviews').upsert({ shop_id, rating, body: body || null }, { onConflict: 'shop_id,user_id' }).then(ok)
export const reportPost = (post_id, reason) => supabase.from('reports').insert({ post_id, reason: reason.slice(0, 300) }).then(ok)

export const fetchNotifications = () => supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50).then(ok)
export const markAllRead = () => supabase.from('notifications').update({ read: true }).eq('read', false).then(ok)
export async function unreadCount() {
  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('read', false)
  return count ?? 0
}
export async function fetchMyOrders() {
  const u = await me()
  return supabase.from('orders').select('*, post:posts(title, image_url), shop:shops(name, slug)').eq('buyer_id', u.id).order('created_at', { ascending: false }).limit(50).then(ok)
}
export const bumpView = (id) => supabase.rpc('bump_shop_view', { p_id: id }).then(() => {})
