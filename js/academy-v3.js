/* Presentation only: shared identity and responsive disclosures; business flows are unchanged. */
(function () {
  'use strict';
  var controls = document.querySelectorAll('[data-academy-example]');
  var output = document.getElementById('academyExampleText');
  var examples = {
    feature: 'تجهيز الطلب خلال دقيقتين: وصف لطريقة الخدمة.',
    benefit: 'للعميل المستعجل: تأخذ مشروبك بسرعة وتكمل يومك بدون انتظار طويل.'
  };
  controls.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!output || !Object.prototype.hasOwnProperty.call(examples, button.dataset.academyExample)) return;
      controls.forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      output.textContent = examples[button.dataset.academyExample];
    });
  });
  var mobileLayout=window.matchMedia('(max-width:650px)');
  var journeySteps=document.querySelectorAll('.journey-step');
  function syncJourneyLayout(){journeySteps.forEach(function(step,index){step.open=!mobileLayout.matches||index===0;});}
  journeySteps.forEach(function(step){var summary=step.querySelector('summary');if(summary)summary.addEventListener('click',function(event){if(!mobileLayout.matches)event.preventDefault();});});
  syncJourneyLayout();
  if(mobileLayout.addEventListener)mobileLayout.addEventListener('change',syncJourneyLayout);
  else mobileLayout.addListener(syncJourneyLayout);
  document.querySelectorAll('.mobile-menu a').forEach(function(link){link.addEventListener('click',function(){var menu=link.closest('details');if(menu)menu.open=false;});});
  // Use the existing brand logo files and retain explicit theme choices.
  function syncLogos() {
    var dark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('.topbar .brand-logo').forEach(function (img) {
      img.src = '/images/' + (dark ? 'logo-platform-dark.png' : 'logo-platform-light.png');
      img.alt = 'Quadralevel';
      img.style.height = '35px';
      img.style.maxWidth = '145px';
    });
  }
  syncLogos();
  new MutationObserver(syncLogos).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduced.matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('academy-enter'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.home-proof,.how-it-works,.demo-card,.student-reviews,.faq-section').forEach(function (el) { observer.observe(el); });
  }
})();
