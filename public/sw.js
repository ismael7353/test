const C = 'vendeo-v1'
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(['/', '/icon-192.png']))); self.skipWaiting() })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))))
  self.clients.claim()
})
// Réseau d'abord (contenu toujours à jour), cache en secours hors-ligne. Les appels Supabase ne sont pas touchés.
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res })
    .catch(() => caches.match(r).then((m) => m || caches.match('/'))))
})

// Notifications push
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {}
  e.waitUntil(self.registration.showNotification(d.title || 'Vendeo', { body: d.body, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: d.url || '/' } }))
})
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.matchAll({ type: 'window' }).then((l) => (l[0] ? l[0].focus().then((c) => c.navigate(e.notification.data.url)) : clients.openWindow(e.notification.data.url))))
})
