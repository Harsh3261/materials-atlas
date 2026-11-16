// Materials Atlas service worker — cache-first, offline capable.
// Bump CACHE on every published data/design change.
const CACHE = 'materials-atlas-v76-audit';
const ASSETS = ['./', './index.html', './manifest.json', './icon.svg', './vendor/pdf.min.js', './vendor/pdf.worker.min.js',
  './vendor/fonts.css', './vendor/fonts/barlow-latin-400-normal.woff2', './vendor/fonts/barlow-latin-400-italic.woff2', './vendor/fonts/barlow-latin-500-normal.woff2', './vendor/fonts/barlow-latin-600-normal.woff2', './vendor/fonts/barlow-latin-700-normal.woff2', './vendor/fonts/barlow-condensed-latin-500-normal.woff2', './vendor/fonts/barlow-condensed-latin-600-normal.woff2', './vendor/fonts/barlow-condensed-latin-700-normal.woff2', './vendor/fonts/barlow-semi-condensed-latin-600-normal.woff2', './vendor/fonts/jetbrains-mono-latin-400-normal.woff2', './vendor/fonts/jetbrains-mono-latin-500-normal.woff2', './vendor/fonts/jetbrains-mono-latin-700-normal.woff2'];
// Fonts are self-hosted (vendor/fonts, SIL OFL) so the offline app looks identical; latin-ext files cache on first use.
// vendor/pdf*.js (PDF cert reader) are pre-cached so PDF certs can be read offline.

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        if (new URL(e.request.url).origin === location.origin) {
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
