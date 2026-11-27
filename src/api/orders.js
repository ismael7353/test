import { supabase } from '../lib/supabase'
import { rangeFor } from './pagination'

const ERRORS = {
  STOCK_INSUFFISANT: 'Stock insuffisant pour cette quantité.',
  PRODUIT_INTROUVABLE: "Ce produit n'est plus disponible.",
}

/** Appelle la fonction SQL place_order (vérifie et décrémente le stock). */
export async function placeOrder({ postId, name, phone, qty }) {
  const { data, error } = await supabase.rpc('place_order', {
    p_post_id: postId, p_name: name, p_phone: phone, p_qty: qty,
  })
  if (error) {
    const code = Object.keys(ERRORS).find((c) => error.message.includes(c))
    throw new Error(code ? ERRORS[code] : 'Commande impossible, réessayez.')
  }
  return data
}

export async function fetchOrders({ shopId, page = 0 }) {
  const { data, count, error } = await supabase
    .from('orders')
    .select('*, post:posts(title)', { count: 'exact' })
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .range(...rangeFor(page))
  if (error) throw error
  return { items: data, total: count ?? 0 }
}

export async function updateOrder(id, patch) {
  const { error } = await supabase.from('orders').update(patch).eq('id', id)
  if (error) throw error
}
