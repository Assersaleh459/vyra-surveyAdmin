const CACHE = 'vyra-v25';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  // Do NOT skipWaiting here — wait for user to tap "Update"
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Listen for "Update" button tap from the app
self.addEventListener('message', e => {
  if(e.data && e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Never intercept external requests (Google, fonts, etc.)
  if(!url.startsWith(self.location.origin)) return;

  // Network first for HTML — always get fresh content
  if(url.endsWith('.html') || url.endsWith('/') || url === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for icons and static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
