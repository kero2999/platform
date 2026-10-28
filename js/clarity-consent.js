/* Clarity is loaded only after a fresh authenticated, versioned opt-in.
   Unknown routes, query strings and embedded lesson pages fail closed. */
(function () {
  'use strict';
  if (window.QLReplay) return;
  const VERSION = '2026-10-28-replay-active.2';
  const NOTICE = '/legal/session-replay-active-20261028.html';
  const SIGNAL = 'ql_replay_choice_changed_v2';
  const TOKEN = 'lms_token_v1';
  let active = false, checking = false, banner = null, stopped = false;
  const token = () => { try { return localStorage.getItem(TOKEN) || ''; } catch (_) { return ''; } };
  const eligible = () => {
    if (window.top !== window.self) return false;
    if (location.search && !( /^\/dashboard(?:\.html)?(?:\/[a-z0-9-]+)?\/?$/.test(location.pathname) && location.search === '?view=results')) return false;
    return /^\/(?:index(?:\.html)?|courses(?:\.html)?|dashboard(?:\.html)?(?:\/[a-z0-9-]+)?)?\/?$/.test(location.pathname);
  };
  function stop() {
    stopped = true;
    if (active && window.clarity) {
      window.clarity('consentv2', { analytics_Storage: 'denied', ad_Storage: 'denied' });
      window.clarity('stop');
    }
    active = false;
  }
  function changed() {
    stop();
    try { localStorage.setItem(SIGNAL, String(Date.now())); } catch (_) {}
  }
  window.QLReplay = { stop, changed };
  function mask() {
    if (active && (!eligible() || document.querySelector('iframe'))) stop();
    document.documentElement.setAttribute('data-clarity-mask', 'true');
    document.querySelectorAll('[data-clarity-unmask]').forEach(el => el.removeAttribute('data-clarity-unmask'));
  }
  function start() {
    if (active || stopped || !eligible() || !token() || document.querySelector('iframe')) return;
    mask();
    // Whole-document masking is established before loading any third-party code.
    new MutationObserver(mask).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-clarity-unmask'] });
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    window.clarity('consentv2', { analytics_Storage: 'granted', ad_Storage: 'denied' });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.clarity.ms/tag/ywls0fzqdt';
    script.referrerPolicy = 'no-referrer';
    script.id = 'ql-clarity-recorder';
    active = true;
    document.head.appendChild(script);
    // Deliberately no identify(), account IDs, answers, URLs or free text events.
  }
  async function request(path, body) {
    const jwt = token();
    if (!jwt || typeof API_BASE_URL !== 'string' || !API_BASE_URL) throw Error('AUTH_REQUIRED');
    const response = await fetch(API_BASE_URL + path, {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: 'Bearer ' + jwt, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json();
    if (!response.ok || data.ok === false || jwt !== token()) throw Error('PREFERENCE_UNAVAILABLE');
    return data;
  }
  function prompt() {
    if (banner || document.getElementById('qlReplayChoice')) return;
    banner = document.createElement('section');
    banner.id = 'qlReplayChoice'; banner.dir = 'rtl';
    banner.setAttribute('aria-labelledby', 'qlReplayTitle');
    banner.style.cssText = 'position:fixed;inset-inline:16px;bottom:16px;max-width:650px;margin:auto;z-index:9999;background:#102c59;color:#fff;padding:22px;border:1px solid #5378aa;border-radius:18px;box-shadow:0 12px 45px #0005;font:16px/1.9 "IBM Plex Sans Arabic",sans-serif;max-height:80vh;overflow:auto';
    banner.innerHTML = '<h2 id="qlReplayTitle" style="font:700 20px/1.7 Alexandria,sans-serif;margin:0 0 8px">تساعدنا نحسّن تجربة المنصة؟</h2><p style="margin:0 0 10px">بموافقتك، Microsoft Clarity يسجّل النقر والتمرير والتنقل في الرئيسية وسوق الكورسات وصفحة التقدم فقط. نخفي النصوص والصور، ونستبعد الدخول والدفع والدروس والإجابات والمينتور. البيانات تُرسل إلى Microsoft وقد تُعالج خارج مصر.</p><a href="' + NOTICE + '" style="color:#b9d9ff;text-decoration:underline" target="_blank" rel="noopener">تفاصيل التسجيل والخصوصية</a><label style="display:flex;gap:10px;margin:12px 0"><input id="qlReplayAdult" type="checkbox" style="width:22px;height:22px;flex-shrink:0;margin-top:5px">أؤكد أن عمري 18 سنة فأكثر.</label><div style="display:flex;gap:12px;flex-wrap:wrap"><button id="qlReplayAccept" type="button" disabled>أوافق على التسجيل</button><button id="qlReplayDecline" type="button">لا أوافق</button></div><p id="qlReplayStatus" role="status" style="margin:8px 0 0">الاختيار اختياري؛ الرفض لا يؤثر على مشترياتك أو تقدمك. يمكنك سحبه من الإعدادات.</p>';
    document.body.appendChild(banner);
    const adult = banner.querySelector('#qlReplayAdult'), accept = banner.querySelector('#qlReplayAccept'), decline = banner.querySelector('#qlReplayDecline');
    [accept, decline].forEach(button => { button.style.cssText = 'font:inherit;padding:8px 16px;border-radius:10px;border:1px solid #b9d9ff;background:#fff;color:#102c59;cursor:pointer'; });
    adult.addEventListener('change', () => { accept.disabled = !adult.checked; });
    async function save(allowed) {
      if (allowed && !adult.checked) return;
      accept.disabled = true; decline.disabled = true;
      try {
        const data = await request('/api/auth/session-replay-consent', { allowed, adultConfirmed: allowed && adult.checked, noticeVersion: VERSION });
        if (!data.preference || data.preference.allowed !== allowed || data.preference.noticeVersion !== VERSION) throw Error('NOT_SAVED');
        try { localStorage.setItem(SIGNAL, String(Date.now())); } catch (_) {}
        banner.remove(); banner = null;
        if (allowed) start(); else stop();
      } catch (_) {
        banner.querySelector('#qlReplayStatus').textContent = 'تعذّر حفظ الاختيار. التسجيل لم يبدأ؛ حاول لاحقًا.';
        accept.disabled = !adult.checked; decline.disabled = false;
      }
    }
    accept.addEventListener('click', () => save(true));
    decline.addEventListener('click', () => save(false));
  }
  async function check() {
    if (checking || stopped) return;
    if (!eligible()) { stop(); return; }
    if (!token()) { stop(); return; }
    checking = true;
    try {
      const data = await request('/api/auth/me');
      const p = data.user && data.user.replayPreference;
      if (p && p.allowed === true && p.noticeVersion === VERSION) start();
      else {
        if (active) stop();
        if (!p || p.noticeVersion !== VERSION || !p.updatedAt) prompt();
      }
    } catch (_) { if (active) stop(); }
    finally { checking = false; }
  }
  window.addEventListener('storage', event => { if (event.key === SIGNAL || event.key === TOKEN || event.key === null) { stop(); if (banner) { banner.remove(); banner = null; } } });
  window.addEventListener('pagehide', stop);
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  document.addEventListener('click', event => {
    if (event.target.closest('[onclick*="logout"],#logoutBtn,[data-action="logout"]')) stop();
  }, true);
  function init() { check(); setInterval(check, 30000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
