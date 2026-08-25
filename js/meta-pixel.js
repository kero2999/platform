/* Quadra Level Meta Pixel — public ID only; never place access tokens here. */
(function (global, doc) {
  var config = global.siteConfig || {};
  var pixelId = String(config.metaPixelId || '').trim();
  var loaded = false;

  function validId(value) { return /^\d{10,20}$/.test(String(value || '')); }
  function load() {
    if (loaded || !validId(pixelId)) return false;
    loaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(global,doc,'script','https://connect.facebook.net/en_US/fbevents.js');
    global.fbq('init', pixelId);
    global.fbq('track', 'PageView');
    return true;
  }
  function track(eventName, params) {
    if (!load() || !global.fbq) return false;
    global.fbq('track', eventName, params || {});
    return true;
  }
  function viewContent(course) {
    var data = course || {};
    return track('ViewContent', {
      content_name: String(data.title || '').slice(0, 120),
      content_ids: data.slug ? [String(data.slug).slice(0, 100)] : [],
      content_type: 'product'
    });
  }
  function lead() { return track('Lead', { content_name: 'Quadra Level account registration' }); }
  function initiateCheckout(course) {
    var data = course || {};
    return track('InitiateCheckout', {
      content_ids: data.slug ? [String(data.slug).slice(0, 100)] : [],
      content_type: 'product',
      num_items: 1,
      value: Number(data.priceCents || 0) / 100,
      currency: String(data.currency || 'EGP').slice(0, 10)
    });
  }
  function purchase(course) {
    var data = course || {};
    return track('Purchase', {
      content_ids: data.slug ? [String(data.slug).slice(0, 100)] : [],
      content_type: 'product',
      value: Number(data.priceCents || 0) / 100,
      currency: String(data.currency || 'EGP').slice(0, 10)
    });
  }
  global.QuadraMeta = { load: load, track: track, viewContent: viewContent, lead: lead, initiateCheckout: initiateCheckout, purchase: purchase };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', load);
  else load();
})(window, document);
