/* Cache Coffee Mail's static files so a return visit does not download them again. */
const CACHE = 'cb-coffee-mail-1';
const ASSETS = [
  './',
  './index.html',
  './cb-logo.png',
  './cbreport.js',
  '../mail-signature-pen/mail-routing.mjs'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

function isAsset(url) {
  const path = url.pathname;
  return path.endsWith('/coffee-mail/') ||
    path.endsWith('/coffee-mail/index.html') ||
    path.endsWith('/coffee-mail/cb-logo.png') ||
    path.endsWith('/coffee-mail/cbreport.js') ||
    path.endsWith('/mail-signature-pen/mail-routing.mjs');
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !isAsset(url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) {
      network.catch(() => {});
      return cached;
    }
    return network;
  })());
});
