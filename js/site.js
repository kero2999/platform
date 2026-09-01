/* Shared public-page chrome for QuadraLevel. */
(function (global) {
  var config = global.siteConfig || {
    siteName: "QuadraLevel",
    email: "support@yourdomain.com",
    phone: "+20 XXX XXX XXXX",
    address: "مصر، المنيا، ملوي، دير البرشا",
    copyright: "© 2026 QuadraLevel. All Rights Reserved."
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;", "'":"&#39;", "\"":"&quot;"}[char];
    });
  }

  function isPlaceholder(value) {
    return !value || /yourdomain\.com|XXX|placeholder|غير محدد/i.test(String(value));
  }

  function contactValue(value, kind) {
    var safe = escapeHtml(value);
    if (isPlaceholder(value)) return '<span>' + safe + '</span>';
    if (kind === "email") return '<a href="mailto:' + encodeURIComponent(value) + '">' + safe + '</a>';
    if (kind === "phone") return '<a dir="ltr" href="tel:' + encodeURIComponent(value) + '">' + safe + '</a>';
    return '<span>' + safe + '</span>';
  }

  function renderFooter(container) {
    if (!container || container.dataset.siteFooterReady === "true") return;
    container.dataset.siteFooterReady = "true";
    container.innerHTML =
      '<footer class="public-footer" aria-label="تذييل الموقع">' +
        '<div class="public-footer-inner">' +
          '<section>' +
            '<div class="footer-brand">' + escapeHtml(config.siteName) + '</div>' +
            '<p>منصة تعليمية رقمية تساعدك على بناء مهارات عملية وتحويل المعرفة إلى خطوات قابلة للتطبيق.</p>' +
          '</section>' +
          '<section>' +
            '<h2>روابط سريعة</h2>' +
            '<div class="footer-links">' +
              '<a href="/courses">الكورسات</a>' +
              '<a href="/about">من نحن</a>' +
              '<a href="/contact">تواصل معنا</a>' +
            '</div>' +
          '</section>' +
          '<section>' +
            '<h2>السياسات</h2>' +
            '<div class="footer-links">' +
              '<a href="/privacy-policy">سياسة الخصوصية</a>' +
              '<a href="/shipping-policy">سياسة التوصيل والشحن</a>' +
              '<a href="/refund-policy">سياسة الاسترداد والإلغاء</a>' +
              '<a href="/terms">الشروط والأحكام</a>' +
            '</div>' +
          '</section>' +
          '<section>' +
            '<h2>تواصل معنا</h2>' +
            '<div class="footer-contact">' +
              '<div>' + contactValue(config.email, "email") + '</div>' +
              '<div>' + contactValue(config.phone, "phone") + '</div>' +
              '<div>' + contactValue(config.address, "address") + '</div>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="footer-bottom"><span>' + escapeHtml(config.copyright) + '</span></div>' +
      '</footer>';
  }

  function renderContactDetails() {
    document.querySelectorAll("[data-site-contact]").forEach(function (element) {
      var field = element.getAttribute("data-site-contact");
      element.innerHTML = contactValue(config[field] || "", field);
    });
  }

  function setupContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form || form.dataset.ready === "true") return;
    form.dataset.ready = "true";
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector("[data-form-status]");
      if (isPlaceholder(config.email)) {
        status.textContent = "لم يتم اعتماد بريد الدعم بعد. يرجى تحديثه من js/site-config.js قبل استخدام النموذج.";
        return;
      }
      var name = form.querySelector("[name=name]").value.trim();
      var sender = form.querySelector("[name=email]").value.trim();
      var message = form.querySelector("[name=message]").value.trim();
      var subject = encodeURIComponent("رسالة تواصل من " + name);
      var body = encodeURIComponent("الاسم: " + name + "\nالبريد: " + sender + "\n\n" + message);
      status.textContent = "سيتم فتح تطبيق البريد لإرسال رسالتك.";
      global.location.href = "mailto:" + config.email + "?subject=" + subject + "&body=" + body;
    });
  }

  function init() {
    document.querySelectorAll("[data-site-footer]").forEach(renderFooter);
    renderContactDetails();
    setupContactForm();
  }

  global.QuadraSite = { config: config, renderFooter: renderFooter, init: init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
