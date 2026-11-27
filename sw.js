// Materials Atlas service worker — v118 (2026-11-22), rebuilt after the iOS crash-loop investigation.
// - Install precaches only the small shell (page, manifest, icon). No fonts, no pdf.js, no OCR at install.
// - The page (navigations) is NETWORK-FIRST; the cached copy is used only when offline.
// - Fonts, pdf.js and OCR files are cached when first used (cache-first afterwards); the page also hands over the
//   vendor files it used before this worker controlled it (message "cache-used").
// - Cleanup touches only caches named materials-atlas-* (SPC Tools shares this github.io origin).
// - No clients.claim(): the worker takes over from the next load, never mid-page.
const CACHE = 'materials-atlas-v119-ui';
const SHELL = ['./index.html', './manifest.json', './icon.svg'];
const PAGE = new URL('./index.html', self.location).href;
const SCOPE = self.registration.scope;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((k) => k.indexOf('materials-atlas') === 0 && k !== CACHE).map((k) => caches.delete(k)))));
});
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'cache-used' || !Array.isArray(d.urls)) return;
  const urls = d.urls.filter((u) => typeof u === 'string' && u.indexOf(SCOPE) === 0).slice(0, 60);
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(urls.map((u) =>
    c.match(u).then((hit) => hit || fetch(u).then((res) => { if (res.ok && res.type === 'basic') return c.put(u, res); }).catch(() => {}))))));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.href.indexOf(SCOPE) !== 0) return;
  const isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);
  if (isPage || /manifest\.json$/.test(url.pathname)) {
    const key = isPage ? PAGE : req;
    e.respondWith(fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(key, copy))); }
      return res;
    }).catch(() => caches.match(key).then((hit) => hit || caches.match(PAGE))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy))); }
    return res;
  })));
});
