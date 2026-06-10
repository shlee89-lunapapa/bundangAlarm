const CACHE_NAME = 'bundang-v4';
const CACHE_FILES = [
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

// 네트워크 우선, 실패 시 캐시 사용 대상
const NETWORK_FIRST = [
  'index.html',
  './',
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
  // GAS API는 캐시 안 함
  if (e.request.url.includes('script.google.com')) return;

  const url = new URL(e.request.url);
  const isNetworkFirst = NETWORK_FIRST.some(p => url.pathname.endsWith(p) || url.pathname === '/bundangAlarm/' || url.pathname === '/bundangAlarm/index.html');

  if (isNetworkFirst) {
    // index.html은 항상 네트워크 우선 → 최신 버전 보장
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // 성공하면 캐시 업데이트
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // 오프라인이면 캐시 사용
    );
  } else {
    // 나머지(사운드, 이미지 등)는 캐시 우선
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
