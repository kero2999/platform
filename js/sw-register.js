if ("serviceWorker" in navigator && !location.pathname.startsWith("/api/content/")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(function (registration) { return registration.update(); })
      .catch(function (err) {
        console.warn("SW registration failed:", err);
      });
  });
}
