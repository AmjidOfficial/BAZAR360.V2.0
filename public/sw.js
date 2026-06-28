const CACHE_NAME = 'bazar360-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/auto_choice_logo_1781509565476.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  try {
    const url = new URL(event.request.url);

    // Skip Firestore, Firebase Auth, Google OAuth, and chrome-extensions
    if (
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('securetoken.googleapis.com') ||
      url.pathname.includes('chrome-extension')
    ) {
      return;
    }

    const isSameOrigin = url.origin === self.location.origin;
    const isImage = event.request.destination === 'image' || 
                    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i) || 
                    url.hostname.includes('googleusercontent.com') || 
                    url.hostname.includes('jsdelivr.net');

    if (isSameOrigin || isImage) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // For images, serve directly from cache to maximize loading speed and offline capabilities
            if (isImage) {
              return cachedResponse;
            }
            
            // For static files (JS/CSS/HTML), serve from cache and fetch-update in the background (stale-while-revalidate)
            fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            }).catch(() => {});
            
            return cachedResponse;
          }

          // Cache miss: fetch from network
          return fetch(event.request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Dynamically cache successful responses
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          }).catch(() => {
            // If offline and navigating to a page, fall back to index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
        })
      );
    }
  } catch (err) {
    // Fail-safe wrapper for unusual/relative request URLs
    console.warn('SW fetch intercept error:', err);
  }
});
