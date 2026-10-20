// Ganti angka versi ini setiap kali kamu mengubah index.html, supaya HP memuat versi terbaru.
const CACHE = 'racerun-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
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
  const u = new URL(e.request.url);
  const allowed =
    u.origin === location.origin ||
    u.hostname === 'fonts.googleapis.com' ||
    u.hostname === 'fonts.gstatic.com';
  if (!allowed) return;

  e.respondWith(
    caches.match(e.request).then((hit) => {
      const net = fetch(e.request)
        .then((r) => {
          if (r && (r.ok || r.type === 'opaque')) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
