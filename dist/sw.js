/**
 * Service Worker - Extrato & Gestão Financeira PWA
 * Offline-first caching with Stale-While-Revalidate strategy
 */

const CACHE_NAME = 'extrato-gestao-v1';

const STATIC_PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/apple-touch-icon.svg',
];

// Install event - Precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial error:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - Network-First for HTML/Navigations, Cache-First/Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or chrome-extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // 1. Navigation / HTML requests -> Network First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to index.html for SPA routes
          const fallback = await caches.match('/index.html');
          if (fallback) {
            return fallback;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Extrato Fin Offline</title></head><body style="font-family:sans-serif;text-align:center;padding:40px;background:#EDE8DC;color:#141A15;"><h1>Modo Offline</h1><p>Conecte-se à internet para carregar atualizações.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts) -> Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails, cachedResponse will be returned
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
