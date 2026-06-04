const CACHE_NAME = 'bundang-v3';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './sounds/광역철도 도착음.mp3',
  './sounds/광역철도 출발음.mp3',
  './sounds/출입문 닫힘 경고음.mp3',
  './sounds/코레일 상행 진입음.mp3',
  './sounds/코레일 하행 진입음.mp3',
  './sounds/통과열차 진입음.mp3',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('script.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
