/**
 * ZarooratSetu PWA - Service Worker
 * Cache-First with Network Fallback for reliable offline access.
 */

const CACHE_NAME = 'zaroorat-setu-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/content.js',
  './assets/js/prototype.js',
  './assets/js/app.js',
  './assets/data/content.js',
  './assets/data/sample-requests.js',
  './assets/images/logo.svg',
  './assets/images/favicon.svg',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/og-preview.png',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ZarooratSetu SW] Pre-caching offline shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[ZarooratSetu SW] Pre-caching warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ZarooratSetu SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache external fonts or icons if successful
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If offline and request is an HTML page, return cached index
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
