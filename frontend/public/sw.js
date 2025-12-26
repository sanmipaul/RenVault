// Service Worker for Push Notifications
const CACHE_NAME = 'renvault-notifications-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.data || {},
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});

self.addEventListener('message', (event) => {
  console.log('Service Worker message received:', event.data);
});