const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('browser page creates session, opens validated provider URL, displays webhook status, sends no tracking', async () => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(fs.readFileSync(path.resolve(__dirname, '../payment-sandbox.html'), 'utf8'), { url: 'https://www.quadralevel.com/payment-sandbox.html', runScripts: 'outside-only' });
  const calls = [];
  dom.window.LMSPlatformAPI = { request: async (url) => { calls.push(url); return url.endsWith('/config') ? { integrationId: 5851430, iframeId: 1068624 } : url.endsWith('/create') ? { sessionId: 'test-session', checkoutUrl: 'https://accept.paymob.com/api/acceptance/iframes/1068624?payment_token=mock' } : { session: { status: 'paid' } }; } };
  dom.window.eval(fs.readFileSync(path.resolve(__dirname, '../js/payment-sandbox.js'), 'utf8'));
  await new Promise(resolve => setImmediate(resolve));
  const doc = dom.window.document;
  assert.equal(doc.getElementById('create').disabled, false);
  doc.getElementById('create').click(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(doc.getElementById('checkout').hidden, false);
  doc.getElementById('check').click(); await new Promise(resolve => setImmediate(resolve));
  assert.ok(doc.getElementById('status').textContent.includes('وصل تأكيد Paymob'));
  assert.equal(calls.length, 3); dom.window.close();
});
