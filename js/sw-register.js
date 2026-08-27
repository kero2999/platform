if ("serviceWorker" in navigator && !location.pathname.startsWith("/api/content/")) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function (err) {
      console.warn("SW registration failed:", err);
    });
  });
}
