import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

test('cart module loads', () => {
  const cart = require('./cart.js');
  assert.equal(typeof cart.buildState, 'function');
  assert.equal(typeof cart.checkout, 'function');
  assert.equal(cart.PAYMENT_LABEL, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.equal(cart.PAYID, 'darkokaz@gmx.com');
  assert.equal(cart.ORDERS_EMAIL, 'darkokaz@gmx.com');
});

function cart() {
  return require('./cart.js');
}

function seqRng(start = 0) {
  let n = start;
  return () => {
    n += 1;
    return ((n * 173) % 997) / 997;
  };
}

test('decimal strings round half away from zero to minor units', () => {
  const { dollarsToMinor } = cart();
  assert.equal(dollarsToMinor('10.00'), 1000);
  assert.equal(dollarsToMinor('10.004'), 1000);
  assert.equal(dollarsToMinor('10.0049'), 1000);
  assert.equal(dollarsToMinor('10.005'), 1001);
  assert.equal(dollarsToMinor('1.235'), 124);
  assert.equal(dollarsToMinor('0.10'), 10);
  assert.equal(dollarsToMinor(4.5), 450);
  assert.equal(dollarsToMinor(0.1 + 0.2), 30);
  assert.throws(() => dollarsToMinor('-1.00'), /negative/);
  assert.throws(() => dollarsToMinor('10.00 USD'), /invalid amount/);
  assert.throws(() => dollarsToMinor(Number.NaN), /invalid amount/);
});

test('line totals stay in integer minor units', () => {
  const { lineMinor, sumMinor, formatMinor } = cart();
  assert.equal(lineMinor(10, 1) + lineMinor(20, 1), 30);
  assert.equal(lineMinor(450, 3), 1350);
  assert.equal(sumMinor([10, 20, 30]), 60);
  assert.equal(formatMinor(1350), '13.50');
  assert.equal(formatMinor(0), '0.00');
  assert.throws(() => lineMinor(Number.MAX_SAFE_INTEGER, 2), /too large/);
  assert.throws(() => lineMinor(10.5, 1), /integer/);
});

test('quantities are bounded and rejected without changing the cart', () => {
  const { buildState } = cart();
  const base = { storeId: 'demo', currency: 'AUD', rng: seqRng() };
  const line = { id: 'sticker', name: 'Demo sticker (not for sale)', unitMinor: 150, qty: 1 };
  const ok = buildState({ ...base, lines: [line] });
  assert.equal(ok.ok, true);
  assert.equal(ok.lines[0].qty, 1);
  const high = buildState({ ...base, lines: [{ ...line, qty: 21 }] });
  assert.equal(high.ok, false);
  assert.match(high.error, /quantity/);
  const zero = buildState({ ...base, lines: [{ ...line, qty: 0 }] });
  assert.equal(zero.ok, false);
  const fraction = buildState({ ...base, lines: [{ ...line, qty: 1.5 }] });
  assert.equal(fraction.ok, false);
  const added = cart().changeQty(ok.lines, 'sticker', 20);
  assert.equal(added.ok, true);
  assert.equal(added.lines[0].qty, 20);
  const over = cart().changeQty(added.lines, 'sticker', 21);
  assert.equal(over.ok, false);
  assert.equal(over.lines[0].qty, 20);
});

test('default reference mint works without an injected rng', () => {
  const { buildState } = cart();
  const line = { id: 'card', name: 'Demo card (not for sale)', unitMinor: 250, qty: 1 };
  const first = buildState({ storeId: 'demo', currency: 'AUD', lines: [line] });
  assert.equal(first.ok, true);
  assert.match(first.reference, /^CB[A-Z2-9]{14}$/);
  const same = buildState({ storeId: 'demo', currency: 'AUD', lines: [line], previous: first });
  assert.equal(same.reference, first.reference);
  const changed = buildState({
    storeId: 'demo',
    currency: 'AUD',
    lines: [{ ...line, qty: 2 }],
    previous: first
  });
  assert.match(changed.reference, /^CB[A-Z2-9]{14}$/);
  assert.notEqual(changed.reference, first.reference);
});

test('reference stays until the payable snapshot changes', () => {
  const { buildState } = cart();
  const lines = [{ id: 'card', name: 'Demo card (not for sale)', unitMinor: 250, qty: 2 }];
  const first = buildState({ storeId: 'demo', currency: 'AUD', lines, note: '', rng: seqRng(1) });
  const again = buildState({
    storeId: 'demo',
    currency: 'AUD',
    lines,
    note: 'gate code',
    previous: first,
    customerClaimsPaid: true,
    rng: seqRng(9)
  });
  assert.equal(again.reference, first.reference);
  assert.match(first.reference, /^CB[A-Z2-9]{14}$/);
  const changed = buildState({
    storeId: 'demo',
    currency: 'AUD',
    lines: [{ ...lines[0], qty: 3 }],
    previous: first,
    rng: seqRng(9)
  });
  assert.notEqual(changed.reference, first.reference);
  const empty = buildState({ storeId: 'demo', currency: 'AUD', lines: [], previous: first, rng: seqRng(3) });
  assert.equal(empty.ok, true);
  assert.equal(empty.reference, null);
});

test('customer, storage, and URL flags never verify payment', () => {
  const api = cart();
  const state = api.buildState({
    storeId: 'demo',
    currency: 'AUD',
    lines: [{ id: 'card', name: 'Demo card (not for sale)', unitMinor: 250, qty: 1 }],
    customerClaimsPaid: true,
    rng: seqRng(2)
  });
  const view = api.checkout(state, { currency: 'AUD', mode: 'manual-aud', fulfilmentVerified: true });
  assert.equal(view.paid, false);
  assert.equal(view.confirmed, false);
  assert.equal(view.bankVerified, false);
  assert.equal(view.customerClaimsPaid, true);
  assert.equal(view.status, 'customer_reported_unverified');
  assert.equal(view.requestsPayment, true);
  const flags = api.externalPaymentFlags({ paid: '1', status: 'paid', confirmed: 'yes' });
  assert.equal(flags.paid, false);
  assert.equal(flags.confirmed, false);
  const storage = new Map();
  const memory = {
    setItem: (k, v) => storage.set(k, v),
    getItem: (k) => (storage.has(k) ? storage.get(k) : null)
  };
  api.persist(memory, 'k', { ...state, paid: true, confirmed: true, status: 'paid' });
  const restored = api.restore(memory, 'k');
  assert.equal(restored.paid, false);
  assert.equal(restored.confirmed, false);
  assert.notEqual(restored.status, 'paid');
  memory.setItem('bad', '{');
  assert.equal(api.restore(memory, 'bad'), null);
  memory.setItem('marked', JSON.stringify({ paid: true, status: 'confirmed', lines: state.lines, storeId: 'demo', currency: 'AUD' }));
  const marked = api.restore(memory, 'marked');
  assert.equal(marked.paid, false);
  assert.equal(marked.confirmed, false);
});

test('manual AUD, quote, enquiry, gated, and demo stay in their lanes', () => {
  const api = cart();
  const lines = [{ id: 'sku', name: 'Kept price', unitMinor: 1995, qty: 1 }];
  const state = (currency) => api.buildState({ storeId: 'shop', currency, lines, rng: seqRng(4) });
  const manual = api.checkout(state('AUD'), { currency: 'AUD', mode: 'manual-aud', fulfilmentVerified: true });
  assert.equal(manual.mode, 'manual-aud');
  assert.equal(manual.requestsPayment, true);
  assert.equal(manual.showTransferInstructions, true);
  assert.equal(manual.audAmountMinor, 1995);
  assert.equal(manual.totalLabel, '19.95');
  assert.equal(manual.paymentLabel, api.PAYMENT_LABEL);
  const downgraded = api.checkout(state('AUD'), { currency: 'AUD', mode: 'manual-aud', fulfilmentVerified: false });
  assert.equal(downgraded.mode, 'enquiry-only');
  assert.equal(downgraded.requestsPayment, false);
  assert.equal(downgraded.showTransferInstructions, false);
  const quote = api.checkout(state('USD'), { currency: 'usd', mode: 'manual-aud', fulfilmentVerified: true });
  assert.equal(quote.mode, 'quote-before-transfer');
  assert.equal(quote.currency, 'USD');
  assert.equal(quote.totalMinor, 1995);
  assert.equal(quote.totalLabel, '19.95');
  assert.equal(quote.audAmountMinor, null);
  assert.equal(quote.requestsPayment, false);
  assert.equal(Object.hasOwn(quote, 'exchangeRate'), false);
  const enquiry = api.checkout(state('AUD'), { currency: 'AUD', mode: 'enquiry-only' });
  assert.equal(enquiry.requestsPayment, false);
  const gated = api.checkout(state('AUD'), { currency: 'AUD', mode: 'gated', fulfilmentVerified: true });
  assert.equal(gated.mode, 'gated');
  assert.equal(gated.requestsPayment, false);
  const demo = api.checkout(state('AUD'), { currency: 'AUD', mode: 'demo', demo: true, fulfilmentVerified: true });
  assert.equal(demo.mode, 'demo');
  assert.equal(demo.requestsPayment, false);
  assert.equal(demo.paid, false);
  const bad = api.checkout(state('AUD'), { currency: 'US$', mode: 'manual-aud', fulfilmentVerified: true });
  assert.equal(bad.ok, false);
  assert.equal(bad.error, 'unsupported-currency');
  assert.equal(bad.requestsPayment, false);
  assert.equal(bad.paid, false);
});

test('names are escaped and handoff does not send or deliver', () => {
  const api = cart();
  const nasty = '<img src=x onerror=alert(1)>';
  assert.equal(api.escapeHtml(nasty).includes('<'), false);
  assert.match(api.escapeHtml(nasty), /&lt;img/);
  const state = api.buildState({
    storeId: 'demo',
    currency: 'AUD',
    lines: [{ id: 'x', name: nasty, unitMinor: 100, qty: 1 }],
    rng: seqRng(5)
  });
  const view = api.checkout(state, { currency: 'AUD', mode: 'demo' });
  assert.match(api.renderLineHtml(view.lines[0]), /&lt;img/);
  assert.doesNotMatch(api.renderLineHtml(view.lines[0]), /<img/);
  const draft = api.draftMailto(view);
  assert.equal(draft.sent, false);
  assert.equal(draft.delivered, false);
  assert.equal(draft.href.startsWith('mailto:darkokaz@gmx.com?'), true);
  assert.equal(draft.href.includes(view.reference), true);
  assert.match(draft.notice, /does not send/i);
  assert.throws(() => api.draftMailto(view, { to: 'other@example.com' }), /published/);
  const file = api.receiptDraft(view);
  assert.equal(file.merchantDelivered, false);
  assert.match(file.body, /not proof of payment/i);
  assert.match(file.body, /darkokaz@gmx.com/);
  const copies = api.copyFields(view);
  assert.equal(copies.payId, 'darkokaz@gmx.com');
  assert.equal(copies.reference, view.reference);
  assert.equal(copies.amount, '1.00');
  for (const notice of view.notices) {
    assert.doesNotMatch(notice, /payment confirmed|order sent|email sent|marked paid/i);
  }
});

test('empty manual cart does not request payment', () => {
  const api = cart();
  const state = api.buildState({ storeId: 'shop', currency: 'AUD', lines: [], rng: seqRng(6) });
  const view = api.checkout(state, { currency: 'AUD', mode: 'manual-aud', fulfilmentVerified: true });
  assert.equal(view.requestsPayment, false);
  assert.equal(view.reference, null);
  assert.equal(view.totalMinor, 0);
  assert.equal(api.copyFields(view).reference, null);
});

test('demo page is labelled, local, and does not request money', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const demo = readFileSync(new URL('./demo.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('./demo.css', import.meta.url), 'utf8');
  assert.match(html, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx.com/);
  assert.match(html, /not for sale/i);
  assert.match(html, /Do not send a payment/i);
  assert.match(html, /https:\/\/www\.tesla\.com/);
  assert.match(html, /https:\/\/www\.starlink\.com/);
  assert.match(html, /cb-logo\.jpg/);
  assert.doesNotMatch(html.toLowerCase(), /headspace|paypal|gumroad|stripe/);
  assert.doesNotMatch(demo.toLowerCase(), /paypal|gumroad|stripe|bsb|card number/);
  assert.doesNotMatch(demo, /fetch\s*\(/);
  assert.match(demo, /CoffeebreakCart\.checkout/);
  assert.match(demo, /draftMailto/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(html, /viewport/);
});
