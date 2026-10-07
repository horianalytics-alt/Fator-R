self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Let the browser do its default thing
  // This minimal fetch handler is enough to pass the PWA install requirement
});
