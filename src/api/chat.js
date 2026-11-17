import { supabase } from '../lib/supabase'
import { ok } from './ok'

const CONV = '*, shop:shops(name, slug, avatar_url, owner_id, whatsapp), buyer:profiles(full_name, avatar_url)'

export async function openConversation(shop_id) {
  const { data: { user } } = await supabase.auth.getUser()
  const old = (await supabase.from('conversations').select('id').eq('shop_id', shop_id).eq('buyer_id', user.id).maybeSingle()).data
  if (old) return old.id
  return ok(await supabase.from('conversations').insert({ shop_id }).select('id').single()).id
}
export const fetchConversations = () => supabase.from('conversations').select(CONV).order('last_message_at', { ascending: false }).then(ok)
export const fetchConversation = (id) => supabase.from('conversations').select(CONV).eq('id', id).maybeSingle().then(ok)
export const fetchMessages = (id) => supabase.from('messages').select('*').eq('conversation_id', id).order('created_at').limit(300).then(ok)
export const sendMessage = (conversation_id, { body, image_url }) =>
  supabase.from('messages').insert({ conversation_id, body: body || null, image_url: image_url || null }).select().single().then(ok)

/** Messages en temps réel ; retourne la fonction de désabonnement. */
export function subscribe(id, cb) {
  const ch = supabase.channel(`chat-${id}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (p) => cb(p.new))
    .subscribe()
  return () => supabase.removeChannel(ch)
}
