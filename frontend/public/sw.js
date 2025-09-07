// Service Worker for GRRAS Solutions - Performance Optimization

const CACHE_NAME = 'grras-v1.0';
const STATIC_CACHE = 'grras-static-v1.0';
const DYNAMIC_CACHE = 'grras-dynamic-v1.0';
const IMAGE_CACHE = 'grras-images-v1.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap',
  'https://customer-assets.emergentagent.com/job_2e9520f3-9067-4211-887e-0bb17ff4e323/artifacts/ym8un6i1_white%20logo.png'
];

// Assets to cache on first visit
const CACHE_ON_VISIT = [
  '/courses',
  '/about',
  '/contact',
  '/placements',
  '/blog',
  '/testimonials',
  '/admissions'
];

// Cache strategies
const CACHE_STRATEGIES = {
  'cache-first': ['fonts.googleapis.com', 'fonts.gstatic.com'],
  'network-first': ['api/'],
  'stale-while-revalidate': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg']
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(err => console.log('Service Worker: Cache failed', err))
  );
  
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== IMAGE_CACHE) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and webpack-dev-server requests
  if (url.protocol === 'chrome-extension:' || url.hostname === 'localhost') return;
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Static assets - Cache First
    if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Fonts - Cache First
    if (CACHE_STRATEGIES['cache-first'].some(pattern => url.hostname.includes(pattern))) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Images - Stale While Revalidate
    if (CACHE_STRATEGIES['stale-while-revalidate'].some(ext => url.pathname.includes(ext))) {
      return await staleWhileRevalidate(request, IMAGE_CACHE);
    }
    
    // API requests - Network First
    if (CACHE_STRATEGIES['network-first'].some(pattern => url.pathname.includes(pattern))) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Navigation requests - Network First with cache fallback
    if (request.mode === 'navigate') {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Default - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Service Worker: Fetch failed', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('Service Worker: Background sync triggered');
  // Handle offline form submissions, etc.
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('GRRAS Solutions', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('https://www.grras.tech')
  );
});

// Cache management - Clean up old entries
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanupCache();
  }
});

async function cleanupCache() {
  const caches = await caches.keys();
  
  for (const cacheName of caches) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    if (requests.length > 100) { // Keep cache size reasonable
      const oldRequests = requests.slice(0, requests.length - 50);
      for (const request of oldRequests) {
        await cache.delete(request);
      }
    }
  }
}

// Log performance metrics
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LOG_PERFORMANCE') {
    console.log('Performance metrics:', event.data.metrics);
  }
});

console.log('Service Worker: Registered successfully');