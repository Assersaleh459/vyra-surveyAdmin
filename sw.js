const CACHE = 'vyra-app-v1';
const URLS = [
  '/vyra-survey/app.html',
  '/vyra-survey/manifest.json',
  '/vyra-survey/icons/icon-192.png',
  '/vyra-survey/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(URLS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for Firebase, cache fallback for app shell
  if(e.request.url.includes('firebase') || e.request.url.includes('googleapis')){
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(
      fetch(e.request)
        .then(r => { 
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
