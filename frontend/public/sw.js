/* HARVESTLINK AI — offline service worker (Part 3, Sec 11).
 * Network-first for navigations (with an app-shell fallback) and cache-first
 * only for immutable, content-hashed build assets, so the terminal keeps
 * working with zero connectivity without ever serving stale code.
 *
 * Dev bundles are NOT content-hashed: `/_next/static/chunks/main-app.js` and
 * friends keep the same URL while their contents change on every edit. Caching
 * those produces stale JavaScript or stale CSS against freshly rendered HTML,
 * which causes Next.js to fail loading stylesheets (resulting in unstyled Times New Roman
 * fallback layout) or throw hydration errors.
 *
 * When accessed via localhost or local IPs, this worker immediately self-unregisters
 * and drops all caches to prevent any interference with Next.js HMR and live compilation.
 */

const isDevHost =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname === '[::1]' ||
  self.location.hostname.endsWith('.local');

if (isDevHost) {
  self.addEventListener('install', () => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      self.registration
        .unregister()
        .then(() => {
          if (typeof caches !== 'undefined') {
            return caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
          }
        })
        .then(() => self.clients.claim())
    );
  });
  // Do NOT register a fetch listener on localhost so all network requests flow directly to Next.js dev server.
} else {
  const CACHE_NAME = 'harvestlink-v8';
  const APP_SHELL = ['/', '/farmer', '/buyer', '/fpo', '/manifest.json', '/icons/icon.svg'];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(APP_SHELL))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
        .then(() => self.clients.claim())
    );
  });

  /** Only content-hashed production build assets are safe to serve cache-first. */
  function isCacheableAsset(url) {
    if (!url.pathname.startsWith('/_next/static/')) return false;
    // HMR payloads and unhashed dev artifacts must never be cached.
    if (url.pathname.includes('/webpack/') || url.pathname.includes('hot-update')) return false;
    return true;
  }

  self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
      );
      return;
    }

    if (!isCacheableAsset(url)) return;

    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  });
}
