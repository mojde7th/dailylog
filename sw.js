/* Service worker.
   Strategy: network-first for our own files, cache only as a fallback.

   The obvious choice is cache-first, and that is what bit you: once app.js
   was in the cache the browser kept serving the old build forever, so new
   defaults and the today-date fix never appeared. Network-first means you
   always get the newest file when there is a connection, and the cache is
   only there for the aeroplane case. */

const CACHE = 'dailylog-v82';

const SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL).catch(() => c.addAll(['./index.html', './app.js'])))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', ev => {
  if (ev.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;                        // never touch the sync POST
  if (!req.url.startsWith(self.location.origin)) return;   // let Apps Script pass through

  ev.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
