const CACHE = "quanlinkun-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/particles.js",
  "./assets/js/data.js",
  "./assets/js/news.js",
  "./assets/js/app.js",
  "./assets/js/ielts.js",
  "./assets/js/vendor/mammoth.browser.min.js",
  "./assets/js/vendor/pdf.min.js",
  "./assets/js/vendor/pdf.worker.min.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 仅缓存同源资源（跨域 RSS 不缓存，保证离线时静态页可打开）
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      });
      return cached || network;
    })
  );
});
