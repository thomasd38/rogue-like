const CACHE_NAME = 'void-drifter-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './js/main.js',
  './js/game.js',
  './js/player.js',
  './js/enemy.js',
  './js/boss.js',
  './js/projectile.js',
  './js/upgrades.js',
  './js/input.js',
  './img/icon-512.png',
  './img/player.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
