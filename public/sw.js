const CACHE_NAME = 'vendeo-shell-v2'
const APP_SHELL = ['/', '/icon-192.png', '/icon-512.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Stratégie réseau d'abord. Les requêtes API et Supabase ne sont jamais mises en cache.
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/')) return
  event.respondWith(fetch(request).then((response) => {
    if (response.ok && (request.mode === 'navigate' || /\.(?:js|css|png|svg|webp|woff2?)$/i.test(url.pathname))) {
      const copy = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
    }
    return response
  }).catch(async () => {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.mode === 'navigate') return (await caches.match('/')) || new Response('Vendeo est temporairement hors ligne.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    return Response.error()
  }))
})

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = { body: event.data?.text() || '' } }
  const title = data.title || 'Vendeo'
  const options = {
    body: data.body || 'Vous avez une nouvelle notification.',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image,
    tag: data.tag || 'vendeo-notification',
    renotify: Boolean(data.tag),
    timestamp: data.timestamp || Date.now(),
    vibrate: [120, 60, 120],
    data: { url: data.url || '/', notificationId: data.notificationId || null },
    actions: [
      { action: 'open', title: 'Ouvrir Vendeo' },
      { action: 'close', title: 'Fermer' },
    ],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return
  event.waitUntil((async () => {
    const target = new URL(event.notification.data?.url || '/', self.location.origin)
    if (target.origin !== self.location.origin) target.href = self.location.origin + '/'
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) await client.navigate(target.href)
        return
      }
    }
    await self.clients.openWindow(target.href)
  })())
})

self.addEventListener('notificationclose', () => {})
