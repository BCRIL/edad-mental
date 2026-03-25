const CACHE_NAME = 'edad-mental-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/js/app.js',
  '/src/js/db.js',
  '/src/js/auth-google.js',
  '/src/styles/styles.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Fallback or offline behavior here
      });
      return cached || fetchPromise;
    })
  );
});
