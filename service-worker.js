const CACHE_NAME = 'seni-explorer-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './service-worker.js',
  './game-data.yaml',
  './strings.yaml',
  './splash.jpg',
  './Copy_of_inovasi_2026.png',
  './images/start.png',
  './images/museum.png',
  './images/pudu.png',
  './images/jail.png',
  'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js',
  './js/constants.js',
  './js/state.js',
  './js/utils.js',
  './js/sound.js',
  './js/localization.js',
  './js/board.js',
  './js/animations.js',
  './js/gameLogic.js',
  './js/dataLoader.js',
  './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    ))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET' && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      }).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
