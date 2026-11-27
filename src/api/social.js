import { supabase } from '../lib/supabase'
import { ok } from './ok'

const me = async () => (await supabase.auth.getUser()).data.user

export async function fetchMyLikes(ids) {
  const user = await me()
  if (!user || !ids.length) return new Set()
  const rows = ok(await supabase.from('likes').select('post_id').in('post_id', ids).eq('user_id', user.id))
  return new Set(rows.map((r) => r.post_id))
}
export const setLike = (post_id, on) =>
  (on ? supabase.from('likes').insert({ post_id }) : supabase.from('likes').delete().eq('post_id', post_id)).then(ok)

export const fetchComments = (post_id) =>
  supabase.from('comments').select('*, author:profiles(username, avatar_url)').eq('post_id', post_id).order('created_at').then(ok)
export const addComment = (post_id, body) =>
  supabase.from('comments').insert({ post_id, body }).select('*, author:profiles(username, avatar_url)').single().then(ok)

export async function followInfo(shop_id) {
  const { count } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('shop_id', shop_id)
  const user = await me()
  let mine = false
  if (user) mine = !!(await supabase.from('follows').select('shop_id').eq('shop_id', shop_id).eq('user_id', user.id).maybeSingle()).data
  return { count: count ?? 0, mine }
}
export const setFollow = (shop_id, on) =>
  (on ? supabase.from('follows').insert({ shop_id }) : supabase.from('follows').delete().eq('shop_id', shop_id)).then(ok)

export const fetchProfile = (id) => supabase.from('profiles').select('*').eq('id', id).maybeSingle().then(ok)
export const saveProfile = (p) => supabase.from('profiles').upsert(p).then(ok)

export async function uploadPublic(file) {
  const user = await me()
  const path = `${user.id}/${Date.now()}-${file.name.replace(/\W/g, '_')}`
  const { error } = await supabase.storage.from('posts').upload(path, file, { cacheControl: '31536000' })
  if (error) throw error
  return supabase.storage.from('posts').getPublicUrl(path).data.publicUrl
}
