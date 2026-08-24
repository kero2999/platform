/* =========================================================
   Service Worker — يفعّل العمل بدون إنترنت بعد أول زيارة
   (يُسجَّل تلقائيًا من كل صفحة عبر js/sw-register.js)
   ========================================================= */
const CACHE_VERSION = "lms-cache-v7";

const APP_SHELL = [
  "index.html",
  "about.html",
  "contact.html",
  "privacy-policy.html",
  "shipping-policy.html",
  "refund-policy.html",
  "terms.html",
  "dashboard.html",
  "courses.html",
  "course.html",
  "learn.html",
  "admin.html",
  "quiz.html",
  "certificate.html",
  "upgrade.html",
  "project.html",
  "verify-certificate.html",
  "ch1.html", "ch2.html", "ch3.html", "ch4.html", "ch5.html",
  "ch6.html", "ch7.html", "ch8.html", "ch9.html",
  "css/shared.css",
  "css/public.css",
  "js/config.js",
  "js/site-config.js",
  "js/site.js",
  "js/auth.js",
  "js/platform-api.js",
  "js/theme.js",
  "js/progress.js",
  "js/quiz-data.js",
  "js/search-data.js",
  "js/ui.js",
  "js/trial.js",
  "js/protect-content.js",
  "js/mentor.js",
  "js/sw-register.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "images/logo-platform-dark.png",
  "images/logo-platform-light.png",
  "images/logo-course-marketing-launch-dark.png",
  "images/logo-course-marketing-launch-light.png",
  "images/logo-mark.png",
  "images/course-marketing-launch.jpg",
  "images/course-marketing-growth.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

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
