// Bumped from v1: the old fetch handler below was cache-first, which meant
// "/" (index.html) and everything else got cached forever on first launch
// and NEVER re-checked the network — every future app update kept showing
// the exact build that was installed the very first time, no matter how
// many times the app itself was rebuilt/reinstalled. Bumping the name
// forces any device still running the old v1 worker to install this one,
// whose activate handler purges the stale v1 cache.
const CACHE_NAME = 'sarki-sozlerim-v2';
const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/app-icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first, cache as a fallback: always serve the freshest copy of
  // the app so a new build/APK install is visible immediately. The cache is
  // only used when there's genuinely no network available, which is what
  // "offline support" actually needs — it should never be the reason a
  // rebuilt app looks unchanged.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('/'))
      )
  );
});
