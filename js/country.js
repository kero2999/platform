/* QuadraLevel Country Layer — selection, persistence and lightweight UI. */
(function (global) {
  const STORAGE_KEY = "ql_country_code_v1";
  const USER_STORAGE_PREFIX = "ql_country_code_user_";
  const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
  const FALLBACKS = {
    EG: { countryCode: "EG", countryName: "مصر", dialect: "العربية المصرية", currency: "EGP", currencySymbol: "جنيه", phoneCode: "+20", locale: "ar-EG", uiMessages: { start: "يلا نبدأ", askMentor: "اسأل المينتور", quizReady: "جاهز تختبر نفسك؟", dashboard: "لوحتي", quiz: "الاختبار", mentorContext: "اسأل عن هذا الفصل", mentorOpen: "افتح المحادثة" } },
    AE: { countryCode: "AE", countryName: "الإمارات", dialect: "العربية الإماراتية", currency: "AED", currencySymbol: "درهم", phoneCode: "+971", locale: "ar-AE", uiMessages: { start: "يلا نبدأ", askMentor: "اسأل المينتور", quizReady: "جاهز تختبر نفسك؟", dashboard: "لوحتي", quiz: "الاختبار", mentorContext: "اسأل عن هذا الفصل", mentorOpen: "افتح المحادثة" } },
    SA: { countryCode: "SA", countryName: "السعودية", dialect: "العربية السعودية", currency: "SAR", currencySymbol: "ريال", phoneCode: "+966", locale: "ar-SA", uiMessages: { start: "خلنا نبدأ", askMentor: "اسأل المينتور", quizReady: "جاهز تختبر نفسك؟", dashboard: "لوحتي", quiz: "الاختبار", mentorContext: "اسأل عن هذا الفصل", mentorOpen: "افتح المحادثة" } },
  };
  let countryList = null;
  let activeProfile = null;

  function valid(code) {
    const normalized = String(code || "").trim().toUpperCase();
    return COUNTRY_CODE_PATTERN.test(normalized) ? normalized : "";
  }

  function userStorageKey() {
    try {
      const user = global.LMSAuth && global.LMSAuth.currentUser ? global.LMSAuth.currentUser() : null;
      return user && user.id ? USER_STORAGE_PREFIX + String(user.id) : STORAGE_KEY;
    } catch (e) { return STORAGE_KEY; }
  }

  function readCode(key) {
    try { return valid(localStorage.getItem(key)); } catch (e) { return ""; }
  }

  function localCode() {
    const scoped = readCode(userStorageKey());
    if (scoped) return scoped;
    return userStorageKey() === STORAGE_KEY ? "" : readCode(STORAGE_KEY);
  }

  function saveLocal(code) {
    const normalized = valid(code);
    if (!normalized) return;
    try { localStorage.setItem(userStorageKey(), normalized); } catch (e) { /* optional */ }
  }

  function clearGuestCode() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* optional */ }
  }

  function profileFor(code) {
    const normalized = valid(code) || "EG";
    const source = (countryList || []).find((item) => valid(item.countryCode) === normalized) || FALLBACKS[normalized];
    return source ? JSON.parse(JSON.stringify(source)) : JSON.parse(JSON.stringify(FALLBACKS.EG));
  }

  function applyProfile(profile) {
    if (!profile) return;
    activeProfile = profile;
    document.documentElement.dataset.countryCode = profile.countryCode;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    global.dispatchEvent(new CustomEvent("qlcountrychange", { detail: profile }));
    if (global.LMSUi && typeof global.LMSUi.renderUserChip === "function") document.querySelectorAll("#userChipHolder").forEach((node) => global.LMSUi.renderUserChip(node));
  }

  async function loadCountries() {
    if (countryList) return countryList;
    try {
      if (global.LMSPlatformAPI) {
        const data = await global.LMSPlatformAPI.getCountries();
        countryList = Array.isArray(data.countries) && data.countries.length ? data.countries : Object.values(FALLBACKS);
      } else {
        countryList = Object.values(FALLBACKS);
      }
    } catch (error) {
      countryList = Object.values(FALLBACKS);
    }
    return countryList;
  }

  async function syncRemote() {
    if (!global.LMSAuth || !global.LMSAuth.isRemote() || !global.LMSAuth.isLoggedIn() || !global.LMSPlatformAPI) return { selected: false, countryCode: localCode() || "EG" };
    try {
      const data = await global.LMSPlatformAPI.getMyCountry();
      if (data && data.selected && valid(data.countryCode)) {
        saveLocal(data.countryCode);
        clearGuestCode();
        return { selected: true, countryCode: valid(data.countryCode) };
      }
      return { selected: false, countryCode: localCode() || "EG" };
    } catch (error) {
      return { selected: Boolean(localCode()), countryCode: localCode() || "EG" };
    }
  }

  async function syncAfterAuth() {
    if (!global.LMSAuth || !global.LMSAuth.isRemote() || !global.LMSAuth.isLoggedIn() || !global.LMSPlatformAPI) return profileFor(localCode() || "EG");
    await loadCountries();
    const current = await syncRemote();
    if (!current.selected && localCode()) {
      try {
        const saved = await global.LMSPlatformAPI.saveMyCountry(localCode());
        if (valid(saved.country?.countryCode)) saveLocal(saved.country.countryCode);
        clearGuestCode();
      } catch (error) {
        // The next protected page will retry; do not block authentication on preference sync.
      }
    }
    const profile = profileFor(localCode() || current.countryCode || "EG");
    applyProfile(profile);
    return profile;
  }

  function closePicker() {
    const modal = document.getElementById("ql-country-picker");
    if (modal) modal.remove();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function injectPickerStyle() {
    if (document.getElementById("ql-country-picker-style")) return;
    const style = document.createElement("style");
    style.id = "ql-country-picker-style";
    style.textContent = "#ql-country-picker{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;padding:20px;background:rgba(5,10,18,.72);backdrop-filter:blur(10px)}#ql-country-picker .ql-country-card{width:min(520px,100%);padding:28px;border:1px solid rgba(201,168,106,.42);border-radius:26px;background:var(--surface,#171719);color:var(--text,#fff);box-shadow:0 24px 80px rgba(0,0,0,.35);animation:qlCountryIn .18s cubic-bezier(.23,1,.32,1)}#ql-country-picker h2{margin:0 0 8px;font-size:1.35rem;font-weight:900}#ql-country-picker p{margin:0 0 20px;color:var(--text-faint,#aaa);line-height:1.8;font-size:.88rem}#ql-country-picker .ql-country-options{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}#ql-country-picker button{font:inherit;cursor:pointer}#ql-country-picker .ql-country-option{min-height:86px;padding:12px;border:1px solid var(--border,#333);border-radius:16px;background:var(--surface-strong,#222);color:var(--text,#fff);transition:transform .16s,border-color .16s,background .16s}.ql-country-option:hover,.ql-country-option:focus-visible{transform:translateY(-2px);border-color:var(--gold,#c9a86a);background:rgba(201,168,106,.1);outline:none}.ql-country-option strong{display:block;font-size:.95rem;margin-bottom:5px}.ql-country-option small{display:block;color:var(--text-faint,#aaa);font-size:.75rem}.ql-country-skip{margin-top:16px;border:0;background:transparent;color:var(--text-faint,#aaa);text-decoration:underline;font-size:.78rem}#ql-country-picker.ql-country-required .ql-country-skip{display:none}@keyframes qlCountryIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}@media(max-width:540px){#ql-country-picker .ql-country-options{grid-template-columns:1fr}.ql-country-option{text-align:right}}";
    document.head.appendChild(style);
  }

  async function showPicker(options) {
    const opts = options || {};
    await loadCountries();
    closePicker();
    injectPickerStyle();
    const modal = document.createElement("div");
    modal.id = "ql-country-picker";
    if (opts.required) modal.classList.add("ql-country-required");
    const cards = countryList.map((country) => '<button type="button" class="ql-country-option" data-country="' + escapeHtml(country.countryCode) + '"><strong>' + escapeHtml(country.countryName) + '</strong><small>' + escapeHtml(country.currency + " · " + country.dialect) + '</small></button>').join("");
    modal.innerHTML = '<section class="ql-country-card" role="dialog" aria-modal="true" aria-labelledby="ql-country-title"><h2 id="ql-country-title">اختار بلدك</h2><p>هنستخدم اختيارك عشان نعرض أمثلة ولهجة وعملة مناسبة لسوقك. تقدر تغيّر الاختيار من الإعدادات في أي وقت.</p><div class="ql-country-options">' + cards + '</div><button type="button" class="ql-country-skip">اختيار مصر كإعداد افتراضي مؤقتًا</button></section>';
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-country]").forEach((button) => button.addEventListener("click", async () => {
      const code = valid(button.dataset.country);
      if (!code) return;
      button.disabled = true;
      try {
        if (global.LMSAuth?.isRemote?.() && global.LMSAuth.isLoggedIn() && global.LMSPlatformAPI) {
          await global.LMSPlatformAPI.saveMyCountry(code);
          clearGuestCode();
        }
        saveLocal(code);
        applyProfile(profileFor(code));
        closePicker();
        if (typeof opts.onSelect === "function") opts.onSelect(profileFor(code));
      } catch (error) {
        button.disabled = false;
        if (global.LMSUi) global.LMSUi.showToast(error.message || "تعذر حفظ الدولة حاليًا.");
      }
    }));
    modal.querySelector(".ql-country-skip").addEventListener("click", () => {
      saveLocal("EG");
      applyProfile(profileFor("EG"));
      closePicker();
      if (typeof opts.onSelect === "function") opts.onSelect(profileFor("EG"));
    });
  }

  async function ensure(options) {
    const opts = options || {};
    await loadCountries();
    const remote = await syncRemote();
    const code = remote.selected ? remote.countryCode : (localCode() || "");
    if (code) {
      const profile = profileFor(code);
      applyProfile(profile);
      return { selected: true, profile };
    }
    if (opts.showPicker !== false) await showPicker({ required: Boolean(opts.required), onSelect: opts.onSelect });
    const fallbackCode = localCode() || "EG";
    const profile = profileFor(fallbackCode);
    applyProfile(profile);
    return { selected: Boolean(localCode()), profile };
  }

  async function change() {
    await showPicker({ required: true });
  }

  global.LMSCountry = {
    storageKey: STORAGE_KEY,
    valid,
    getCode: () => localCode(),
    getProfile: () => activeProfile || profileFor(localCode() || "EG"),
    loadCountries,
    ensure,
    change,
    syncAfterAuth,
    setLocal: (code) => { saveLocal(code); applyProfile(profileFor(code)); },
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body?.dataset.countryGate === "true") ensure({ showPicker: true });
  });
})(window);
