(function (global) {
  const CODE_KEY = "ql_affiliate_code_v1";
  const VISITOR_KEY = "ql_affiliate_visitor_v1";

  function safeCode(value) {
    const code = String(value || "").trim().toUpperCase();
    return /^[A-Z0-9_-]{3,40}$/.test(code) ? code : "";
  }

  function visitorKey() {
    let value = localStorage.getItem(VISITOR_KEY);
    if (!value) {
      value = (global.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
      localStorage.setItem(VISITOR_KEY, value);
    }
    return value;
  }

  function capture() {
    const params = new URLSearchParams(global.location.search || "");
    const code = safeCode(params.get("ref"));
    if (!code) return localStorage.getItem(CODE_KEY) || "";
    localStorage.setItem(CODE_KEY, code);
    if (typeof API_BASE_URL === "string" && API_BASE_URL) {
      fetch(API_BASE_URL + "/api/affiliates/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, visitorKey: visitorKey() }),
        keepalive: true,
      }).catch(function () {});
    }
    return code;
  }

  global.QuadraAffiliate = {
    capture,
    code: function () { return localStorage.getItem(CODE_KEY) || ""; },
  };
  capture();
})(window);
