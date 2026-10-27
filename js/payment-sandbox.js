(function () {
  const create = document.getElementById('create'), check = document.getElementById('check');
  const checkout = document.getElementById('checkout'), status = document.getElementById('status');
  let sessionId = '';
  const request = (path, options) => LMSPlatformAPI.request('/api/payments/sandbox' + path, options);
  request('/config').then(data => {
    document.getElementById('config').textContent = 'TEST — Integration: ' + data.integrationId + ' | iFrame: ' + data.iframeId + ' | ١ جنيه تجريبي';
    create.disabled = false;
  }).catch(error => { document.getElementById('config').textContent = error.message + ' — تأكد من تسجيل الدخول بحساب أدمن.'; });
  create.addEventListener('click', async () => {
    create.disabled = true; checkout.hidden = true; check.hidden = true; sessionId = '';
    status.textContent = 'جاري إنشاء الجلسة…';
    try {
      const data = await request('/create', { method: 'POST', body: '{}' });
      const url = new URL(data.checkoutUrl);
      if (url.origin !== 'https://accept.paymob.com' || !/^\/api\/acceptance\/iframes\/\d+$/.test(url.pathname)) throw Error('رابط الدفع غير صالح.');
      sessionId = data.sessionId;
      checkout.href = url.href; checkout.hidden = false; check.hidden = false;
      status.textContent = 'افتح صفحة الدفع، ثم ارجع واضغط «تحقق من نتيجة الدفع».';
    } catch (error) { status.textContent = error.message; }
    finally { create.disabled = false; }
  });
  check.addEventListener('click', async () => {
    if (!sessionId) return;
    check.disabled = true;
    try {
      const data = await request('/' + encodeURIComponent(sessionId) + '/status');
      status.textContent = data.session.status === 'paid' ? 'نجح الدفع التجريبي ووصل تأكيد Paymob للسيرفر. لم يتم تفعيل كورس أو تسجيل بيع حقيقي.' : data.session.status === 'failed' ? 'لم تنجح عملية الاختبار.' : 'في انتظار تأكيد Paymob. أعد التحقق بعد إكمال الدفع.';
    } catch (error) { status.textContent = error.message; }
    finally { check.disabled = false; }
  });
})();
