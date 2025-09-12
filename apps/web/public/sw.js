/**
 * RIA Management Software - Service Worker
 * 
 * Provides offline functionality, caching, and PWA capabilities
 * Based on Buoy's service worker patterns
 */

const CACHE_NAME = 'ria-cache-v1';
const STATIC_CACHE_NAME = 'ria-static-v1';
const DYNAMIC_CACHE_NAME = 'ria-dynamic-v1';
const API_CACHE_NAME = 'ria-api-v1';

// Files to cache immediately (critical app shell)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/js/',
];

// API routes to cache
const API_ROUTES = [
  '/api/auth',
  '/api/finance',
  '/api/tasks',
  '/api/library',
  '/api/uploads'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('RIA Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('RIA Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(Boolean));
      })
    ])
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('RIA Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== API_CACHE_NAME) {
              console.log('RIA Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

/**
 * Main request handler with caching strategies
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // API requests - network first with cache fallback
    if (pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request, API_CACHE_NAME);
    }
    
    // Static assets - cache first
    if (pathname.startsWith('/_next/static/') || 
        pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
      return await cacheFirstStrategy(request, STATIC_CACHE_NAME);
    }
    
    // HTML pages - stale while revalidate
    if (request.headers.get('accept')?.includes('text/html')) {
      return await staleWhileRevalidateStrategy(request, DYNAMIC_CACHE_NAME);
    }
    
    // Default to network first
    return await networkFirstStrategy(request, DYNAMIC_CACHE_NAME);
    
  } catch (error) {
    console.error('RIA Service Worker: Fetch error:', error);
    
    // Return offline page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return await getOfflinePage();
    }
    
    throw error;
  }
}

/**
 * Cache first strategy - check cache first, fallback to network
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  // Cache successful responses
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

/**
 * Network first strategy - try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    // Try network with timeout
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      )
    ]);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('RIA Service Worker: Network failed, trying cache:', error.message);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale while revalidate - return cache immediately, update in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Background fetch to update cache
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('RIA Service Worker: Background update failed:', error);
  });
  
  // Return cached version immediately or wait for network
  return cachedResponse || await networkResponsePromise;
}

/**
 * Get offline page
 */
async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const offlinePage = await cache.match('/offline');
  
  if (offlinePage) {
    return offlinePage;
  }
  
  // Fallback offline page
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RIA - Offline</title>
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container { max-width: 400px; padding: 2rem; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { margin: 0 0 1rem 0; }
        p { opacity: 0.9; line-height: 1.6; margin-bottom: 2rem; }
        .retry-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid white;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>You're Offline</h1>
        <p>RIA is temporarily unavailable. Some cached content may still be accessible. Please check your connection and try again.</p>
        <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store'
      }
    }
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('RIA Service Worker: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Handle background sync for offline actions
 */
async function handleBackgroundSync() {
  try {
    // Get queued offline actions from IndexedDB
    const queuedActions = await getQueuedActions();
    
    for (const action of queuedActions) {
      try {
        await executeQueuedAction(action);
        await removeQueuedAction(action.id);
      } catch (error) {
        console.error('RIA Service Worker: Failed to execute queued action:', error);
      }
    }
  } catch (error) {
    console.error('RIA Service Worker: Background sync failed:', error);
  }
}

/**
 * Get queued offline actions (placeholder - implement with IndexedDB)
 */
async function getQueuedActions() {
  // TODO: Implement IndexedDB integration for offline queue
  return [];
}

/**
 * Execute a queued offline action (placeholder)
 */
async function executeQueuedAction(action) {
  // TODO: Implement action execution
  console.log('Executing queued action:', action);
}

/**
 * Remove executed action from queue (placeholder)
 */
async function removeQueuedAction(actionId) {
  // TODO: Implement action removal
  console.log('Removing queued action:', actionId);
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    // Enhanced options for messaging notifications
    const options = {
      body: data.body || 'New notification from RIA',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'ria-notification',
      data: {
        ...data.data,
        threadId: data.threadId,
        messageId: data.messageId,
        userId: data.userId,
        type: data.type || 'message',
      },
      actions: data.actions || [
        { action: 'open', title: 'Open' },
        { action: 'mark_read', title: 'Mark as Read' }
      ],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'RIA', options)
    );
  } catch (error) {
    console.error('RIA Service Worker: Push notification error:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const data = event.notification.data || {};
  const action = event.action;
  
  // Handle specific actions
  if (action === 'mark_read' && data.messageId && data.threadId) {
    // Mark message as read via API
    event.waitUntil(
      fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: data.messageId,
          threadId: data.threadId,
        }),
      }).catch(error => {
        console.error('Failed to mark message as read:', error);
      })
    );
    return;
  }
  
  // Determine URL to open
  let urlToOpen = data.url || '/';
  
  if (data.type === 'message' && data.threadId) {
    urlToOpen = `/messaging/inbox/${data.threadId}`;
  } else if (data.threadId) {
    urlToOpen = `/messaging/direct/${data.threadId}`;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with messaging
        for (const client of clientList) {
          if (client.url.includes('/messaging') && 'focus' in client) {
            // Send message to navigate to specific thread
            client.postMessage({
              type: 'NAVIGATE_TO_THREAD',
              threadId: data.threadId,
              messageId: data.messageId,
            });
            return client.focus();
          }
        }
        
        // Open new window if no matching client found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('RIA Service Worker: Loaded successfully');