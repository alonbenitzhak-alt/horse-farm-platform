// Service Worker for StableOS PWA
// Handles offline support and caching strategy

const CACHE_NAME = 'stableos-v1';
const RUNTIME_CACHE = 'stableos-runtime-v1';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache static assets
  if (request.method === 'GET' && isStaticAsset(request.url)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(response => {
            if (response && response.status === 200) {
              const cache = caches.open(CACHE_NAME);
              cache.then(c => c.put(request, response.clone()));
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Network first for API calls, cache fallback
  if (request.method === 'GET' && isApiRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          try {
            if (response && response.status === 200 && response.clone) {
              const cache = caches.open(RUNTIME_CACHE);
              cache.then(c => c.put(request, response.clone()));
            }
          } catch (e) {
            console.error('Failed to cache response:', e);
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Default: try network, fallback to cache (skip POST, DELETE, auth requests)
  if (request.method === 'POST' || request.method === 'DELETE' || request.url.includes('auth')) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        try {
          if (response && response.status === 200 && response.clone) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
        } catch (e) {
          console.error('Failed to cache response:', e);
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/.test(url);
}

function isApiRequest(url) {
  return url.includes('/api') || url.includes('.supabase.co');
}

// Background sync for offline tasks
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  try {
    // Sync pending tasks when connection is restored
    const db = await openIndexedDB();
    const pendingTasks = await getPendingTasks(db);

    for (const task of pendingTasks) {
      await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    }

    // Clear pending tasks
    await clearPendingTasks(db);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Simple IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('stableos', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-tasks')) {
        db.createObjectStore('pending-tasks', { keyPath: 'id' });
      }
    };
  });
}

function getPendingTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-tasks'], 'readonly');
    const store = transaction.objectStore('pending-tasks');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function clearPendingTasks(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-tasks'], 'readwrite');
    const store = transaction.objectStore('pending-tasks');
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
