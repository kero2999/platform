(function (global) {
  const VISITOR_KEY = "ql_audit_visitor_v1";
  function visitorId() {
    let value = localStorage.getItem(VISITOR_KEY);
    if (!value) {
      value = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VISITOR_KEY, value);
    }
    return value;
  }
  function sendPageView() {
    const base = global.LMS_CONFIG?.API_BASE || global.API_BASE || "";
    if (!base || !location.pathname || navigator.doNotTrack === "1") return;
    fetch(`${base}/api/events/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ path: location.pathname + location.search, title: document.title, referrer: document.referrer, visitorId: visitorId() }),
    }).catch(() => {});
  }
  global.QLActivity = { sendPageView };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", sendPageView, { once: true });
  else sendPageView();
})(window);
