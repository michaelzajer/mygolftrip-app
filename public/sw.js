const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/index.html', // The main entry point of your SPA
  '/static/css/main.1f32ea7c.css', // Main CSS file after build
  '/static/js/main.a12b1356.js', // Main JS file after build
  '/static/js/787.1c4e6cbb.chunk.js', // Additional JS chunks after build
  // Include other assets like images from the media folder if necessary
];

// Install event listener
self.addEventListener('install', event => {
  // Perform install steps: caching the assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event listener
self.addEventListener('activate', event => {
  // Clearing old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Takes control of the page immediately without waiting for reload
  self.clients.claim();
});

// Fetch event listener
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Bypass Firestore requests
  if (url.origin === 'https://firestore.googleapis.com') {
    return;
  }
  
  // For other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
  
      return fetch(event.request).then(response => {
        // Don't cache if it's not a GET request or if the response is not from our origin
        if (event.request.method !== 'GET' || !response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
  
        // Cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
  
        return response;
      });
    })
  );
});