/* =========================================================
   LMSTrial — معاينة مجانية 10 دقائق بدون تسجيل كامل
   - تُستخدم مرة واحدة فقط لكل متصفح
   - عند الانتهاء: قفل كامل + توجيه لصفحة الاشتراك
   ========================================================= */
(function (global) {
  const TRIAL_KEY = "lms_trial_v1";
  const TRIAL_SECONDS = 600; // 10 دقائق

  function _read() {
    try {
      return JSON.parse(localStorage.getItem(TRIAL_KEY));
    } catch (e) {
      return null;
    }
  }

  function prepareTrial(name) {
    const existing = _read();
    if (existing) return existing;
    const data = { name: String(name || 'زائر').trim().slice(0,80), sessionId: 'tr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10) };
    localStorage.setItem(TRIAL_KEY, JSON.stringify(data));
    return data;
  }
  function startTrial(name) { prepareTrial(name); activateTrial(); return _read(); }
  function activateTrial() {
    const data = _read();
    if (!data || data.startAt) return;
    data.startAt = Date.now();
    localStorage.setItem(TRIAL_KEY, JSON.stringify(data));
    if (window.QuadraMeta) QuadraMeta.startTrial({slug:'marketing-launch',title:'Marketing Launch'}, 'local-trial-' + data.sessionId);
  }
  function getSessionId() {
    const t = _read();
    return t ? t.sessionId : null;
  }

  function getStatus() {
    const t = _read();
    if (!t) return { started: false, active: false, remaining: 0 };
    if (!t.startAt) return { started: true, pending: true, active: false, remaining: TRIAL_SECONDS, name: t.name };
    const elapsed = (Date.now() - t.startAt) / 1000;
    const remaining = Math.max(0, TRIAL_SECONDS - elapsed);
    return { started: true, active: remaining > 0, remaining: Math.floor(remaining), name: t.name };
  }

  function isTrialActive() {
    return getStatus().active;
  }

  function hasUsedTrial() {
    return _read() !== null;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function _injectStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function showExpiredOverlay() {
    if (document.getElementById("trial-expired-overlay")) return;
    _injectStyle(`
      #trial-expired-overlay{position:fixed;inset:0;z-index:99999;
        background:rgba(13,27,42,0.97);backdrop-filter:blur(10px);
        display:flex;align-items:center;justify-content:center;padding:24px;}
      #trial-expired-overlay .te-box{max-width:380px;text-align:center;color:#fff;font-family:'Tajawal',sans-serif;}
      #trial-expired-overlay i{font-size:2.6rem;color:#a9c7fa;margin-bottom:16px;display:block;}
      #trial-expired-overlay h2{font-size:1.3rem;font-weight:900;margin-bottom:10px;}
      #trial-expired-overlay p{color:rgba(255,255,255,0.7);font-size:0.9rem;margin-bottom:22px;line-height:1.7;}
      #trial-expired-overlay .btn-upgrade{display:inline-block;background:#2463cc;
        color:#fff;padding:13px 30px;border-radius:14px;font-weight:800;text-decoration:none;font-family:'Tajawal',sans-serif;}
    `);
    const overlay = document.createElement("div");
    overlay.id = "trial-expired-overlay";
    overlay.innerHTML =
      '<div class="te-box">' +
      '<i class="fas fa-lock"></i>' +
      "<h2>انتهت مدة المعاينة المجانية</h2>" +
      "<p>عجبك اللي شفته؟ اشترك الآن للوصول الكامل لكل الفصول والاختبارات والشهادة.</p>" +
      '<a href="/course/marketing-launch?purchase=1" class="btn-upgrade">شراء الكورس</a><p><a href="/course/marketing-launch" style="color:#c7dcff">العودة لتفاصيل الكورس</a></p>' +
      "</div>";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

  }

  function mountBadgeAndGuard() {
    // لو المستخدم مسجّل دخول بحساب كامل، تجاهل أي أثر قديم للمعاينة المجانية تمامًا
    if (window.LMSAuth && window.LMSAuth.isLoggedIn() && !/^\/preview\/?$/.test(location.pathname)) return;

    if (location.pathname === "/preview" || /\/ch1\.html$/.test(location.pathname)) activateTrial();
    const status = getStatus();
    if (!status.started) return; // مش زائر تجريبي، متعملش حاجة
    if (!status.active) {
      showExpiredOverlay();
      return;
    }

    _injectStyle(`
      #trial-badge{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:5000;
        background:rgba(13,27,42,0.95);border:1px solid #a9c7fa;color:#a9c7fa;
        padding:8px 18px;border-radius:20px;font-family:'Tajawal',sans-serif;font-weight:700;font-size:0.8rem;
        display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);white-space:nowrap;}
      #trial-badge.urgent{border-color:#ff5252;color:#ff5252;animation:trialPulse 1s infinite;}
      @keyframes trialPulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
      @media (max-width:640px){ #trial-badge{font-size:0.72rem;padding:6px 12px;top:8px;} }
    `);
    const badge = document.createElement("div");
    badge.id = "trial-badge";
    badge.innerHTML = '<i class="fas fa-clock"></i> <span id="trial-time"></span> — نسخة تجريبية';
    document.body.appendChild(badge);

    const timeEl = document.getElementById("trial-time");
    function tick() {
      const s = getStatus();
      if (!s.active) {
        clearInterval(timer);
        showExpiredOverlay();
        return;
      }
      timeEl.textContent = formatTime(s.remaining);
      if (s.remaining <= 60) badge.classList.add("urgent");
    }
    const timer = setInterval(tick, 1000);
    tick();
  }

  global.LMSTrial = {
    startTrial, prepareTrial, activateTrial,
    getStatus,
    isTrialActive,
    hasUsedTrial,
    getSessionId,
    mountBadgeAndGuard,
    TRIAL_SECONDS,
  };
})(window);
