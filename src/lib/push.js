import { ok } from '../api/ok'
import { supabase } from './supabase'

const KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function toBytes(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

export function pushSupported() {
  return Boolean(KEY) && window.isSecureContext && 'serviceWorker' in navigator &&
    'PushManager' in window && 'Notification' in window
}

export async function getPushState() {
  if (!pushSupported()) return { supported: false, permission: 'unsupported', subscribed: false }
  const permission = Notification.permission
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return { supported: true, permission, subscribed: Boolean(subscription) }
}

export async function enablePush(userId) {
  if (!userId) throw new Error('Connectez-vous pour activer les notifications.')
  if (!pushSupported()) throw new Error('Les notifications ne sont pas disponibles. Vérifiez le HTTPS et la configuration VAPID.')
  if (Notification.permission === 'denied') throw new Error('Les notifications sont bloquées. Autorisez-les dans les paramètres du navigateur Android.')
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('Autorisation des notifications non accordée.')

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription() ||
    await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(KEY) })
  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Impossible de récupérer les informations de cet appareil.')
  }
  ok(await supabase.from('push_subscriptions').upsert({
    endpoint: json.endpoint,
    user_id: userId,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    user_agent: navigator.userAgent.slice(0, 500),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' }))
  return true
}

export async function disablePush(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  if (userId) ok(await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint).eq('user_id', userId))
  await subscription.unsubscribe()
}
