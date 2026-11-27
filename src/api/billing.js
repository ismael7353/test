import { supabase } from '../lib/supabase'
import { ok } from './ok'

// Tarifs affichés dans l’application. Le paiement et l’activation sont confirmés
// manuellement par l’équipe Vendeo après échange avec le vendeur sur WhatsApp.
export const PRICES = { 1: 15000, 3: 40000, 12: 144000 } // Ar

export const startTrial = (shop_id) =>
  supabase.rpc('start_trial', { p_shop: shop_id }).then(ok)

export const requestPlanContact = (shop_id, months) =>
  supabase.rpc('request_plan_contact', { p_shop: shop_id, p_months: months }).then(ok)
