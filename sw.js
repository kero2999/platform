/* =========================================================
   Service Worker — يفعّل العمل بدون إنترنت بعد أول زيارة
   (يُسجَّل تلقائيًا من كل صفحة عبر js/sw-register.js)
   ========================================================= */
const CACHE_VERSION = "lms-cache-v51-chapter-open";

// Keep installation light. Cache other pages, fonts and images only when actually visited.
const APP_SHELL = [
  "css/shared.css",
  "css/academy-v3.css",
  "css/academy-v3-fonts.css",
  "js/theme.js",
  "js/config.js",
  "js/ui.js",
  "manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("lms-cache-") && k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache API responses: they can contain user identity, access, country, or pricing.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // Navigation pages must prefer the network so dashboard and course metadata never stay stale.
  if (url.origin === self.location.origin && (req.mode === "navigate" || url.pathname === "/dashboard.html" || url.pathname === "/learn.html" || url.pathname === "/quiz.html")) {
    event.respondWith(fetch(req).then((res) => {
      if (res && res.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(req, res.clone()));
      return res;
    }).catch(() => caches.match(req)));
    return;
  }

  // Same-origin: cache-first, fall back to network, then update cache.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const clone = res.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Cross-origin (fonts / icons CDN): stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
