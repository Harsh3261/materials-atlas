// Materials Atlas service worker — KILL-SWITCH build (v116, 2026-11-22).
// Diagnostic step 1 for the iOS Safari crash-loop (first load works, every SW-controlled reload crashes):
// this worker removes the Atlas's own caches and unregisters itself. It intercepts nothing, so every load comes
// straight from the network. Offline support is rebuilt in step 2 once the crash is confirmed gone.
// Only caches named materials-atlas-* are deleted: the SPC Tools caches share this github.io origin.
const CACHE = 'materials-atlas-v116-killswitch';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.indexOf('materials-atlas') === 0).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});
