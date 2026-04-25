const CACHE_NAME = 'cannon-roguelike-v1';
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
  './img/icon-512.png'
];

// Install event - caching assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event - cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serving from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
