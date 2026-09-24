const CACHE_NAME = 'bsc-careerpath-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Skip non-http/https requests, API requests, and non-GET requests (POST, etc.)
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') ||
    (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://'))
  ) {
    return;
  }

  // Fast Navigation strategy with 2.5s network timeout and instant offline fallback
  if (event.request.mode === 'navigate' || event.request.url.endsWith('/') || event.request.url.endsWith('index.html')) {
    event.respondWith(
      (async () => {
        // 1. Kung disconnected / offline, mag-serve agad mula sa cache (0 ms)
        if (!navigator.onLine) {
          const cached = await caches.match(event.request) || await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
        }

        // 2. Kapag online, subukang kumuha sa network pero may 2.5s race timeout
        const fetchPromise = fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(async () => {
            return await caches.match(event.request) || await caches.match('/index.html') || await caches.match('/');
          });

        const timeoutPromise = new Promise((resolve) => {
          setTimeout(async () => {
            const cached = await caches.match(event.request) || await caches.match('/index.html') || await caches.match('/');
            if (cached) resolve(cached);
          }, 2500);
        });

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (result) return result;
        return await caches.match('/index.html') || await caches.match('/');
      })()
    );
    return;
  }

  // Use Cache-First strategy for other static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return networkResponse;
          })
          .catch(async (err) => {
            // FALLBACK: Kung offline at hindi nahanap ang partikular na hashed asset (hal. bagong JS/CSS),
            // subukang hanapin sa cache ang kahit anong kahalintulad na file.
            const url = new URL(event.request.url);
            if (url.pathname.includes('/assets/index-')) {
              const cache = await caches.open(CACHE_NAME);
              const keys = await cache.keys();
              
              // Hanapin ang tugmang file type (.js o .css)
              const isJS = url.pathname.endsWith('.js');
              const isCSS = url.pathname.endsWith('.css');
              
              for (const key of keys) {
                const keyUrl = new URL(key.url);
                if (keyUrl.pathname.includes('/assets/index-')) {
                  if ((isJS && keyUrl.pathname.endsWith('.js')) || (isCSS && keyUrl.pathname.endsWith('.css'))) {
                    console.log('SW Fallback: Serving cached asset:', key.url);
                    const cachedRes = await cache.match(key);
                    if (cachedRes) return cachedRes;
                  }
                }
              }
            }
            throw err;
          });
      })
  );
});
