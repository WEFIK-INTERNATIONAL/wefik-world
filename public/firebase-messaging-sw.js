// Firebase Cloud Messaging Service Worker (Phase 9 Spec)
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase inside the Service Worker
const firebaseConfig = {
  apiKey: "placeholder_api_key",
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder_project_id",
  storageBucket: "placeholder.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Wefik World Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'New product update or order confirmation.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: payload.data?.url || '/dashboard'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
