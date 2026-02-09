/* ============================================
   King's Quest: The Enchanted Isle
   Service Worker - Offline PWA support
   ============================================ */

const CACHE_NAME = 'kq-enchanted-isle-v8';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/graphics.js',
  './js/engine.js',
  './js/world.js',
  './js/account.js',
  './js/app.js',
  './manifest.json',
];

// Install: pre-cache all static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: purge old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for navigation/app assets,
// cache-first for everything else
self.addEventListener('fetch', (e) => {
  const { request } = e;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (e.g. Google Fonts)
  if (!request.url.startsWith(self.location.origin)) {
    e.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => {
      // Background revalidation: update the cache for next load
      const networkFetch = fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);

      // Return cached immediately if available, otherwise wait for network
      return cached || networkFetch || caches.match('./index.html');
    })
  );
});
