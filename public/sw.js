// GoConstruction OS · Service Worker v3
// Estrategia RED-PRIMERO: la app siempre baja la versión más nueva;
// el caché solo se usa sin conexión. Esto evita quedar pegado en
// una versión vieja de la app (causa de "no funciona nada").
const CACHE = 'goconstruction-os-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Nunca interceptar API ni otros orígenes.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) return;

  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(request, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(request).then(hit => hit || caches.match('/')))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const abierta = list.find(c => 'focus' in c);
      if (abierta) { abierta.navigate(url); return abierta.focus(); }
      return self.clients.openWindow(url);
    })
  );
});
