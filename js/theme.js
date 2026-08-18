/* =========================================================
   LMSTheme — dark / light mode toggle
   ========================================================= */
(function (global) {
  const THEME_KEY = "lms_theme_v1";

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll("[data-theme-icon]").forEach((el) => {
      el.className =
        "fas " + (theme === "dark" ? "fa-moon" : "fa-sun") + " ";
      el.setAttribute("data-theme-icon", "");
    });
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#ffffff");
    }
  }

  function toggleTheme() {
    applyTheme(getTheme() === "dark" ? "light" : "dark");
  }

  function initTheme() {
    applyTheme(getTheme());
  }

  global.LMSTheme = { getTheme, applyTheme, toggleTheme, initTheme };
  initTheme();
})(window);
