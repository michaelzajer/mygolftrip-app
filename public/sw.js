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