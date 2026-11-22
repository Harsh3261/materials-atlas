// Materials Atlas service worker — cache-first, offline capable.
// Bump CACHE on every published data/design change.
const CACHE = 'materials-atlas-v111-index';
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
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  // The page itself (and the manifest) are NETWORK-FIRST: an update shows on
  // the first reload when online; the cached copy is used only offline.
  const isPage = e.request.mode === 'navigate' || (sameOrigin && /\/(index\.html)?$|manifest\.json$/.test(url.pathname));
  if (isPage) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then((res) => {
        if (res.ok && sameOrigin) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }
  // Everything else (pdf.js, fonts, icons) is cache-first: it only changes with a CACHE bump.
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        const copy = res.clone();
        if (sameOrigin) caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      });
    })
  );
});
