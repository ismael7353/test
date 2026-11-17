import { ok } from '../api/ok'
import { supabase } from './supabase'

const KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
const toBytes = (s) => Uint8Array.from(atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

export const pushSupported = () => !!KEY && 'serviceWorker' in navigator && 'PushManager' in window

export async function enablePush() {
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Notifications refusées dans le navigateur.')
  const reg = await navigator.serviceWorker.ready
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(KEY) }))
  const j = sub.toJSON()
  ok(await supabase.from('push_subscriptions').upsert({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' }))
}
