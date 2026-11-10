import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const cart = require('./cart.js');
const loader = readFileSync(new URL('./store-loader.js', import.meta.url), 'utf8');

function seqRng(start = 3) {
  let n = start;
  return () => {
    n += 1;
    return ((n * 173) % 997) / 997;
  };
}

test('catalogue totals keep the original currency and do not verify payment', () => {
  const view = cart.catalogueCheckout(
    [{ id: 'shoe', name: 'Sample shoe', amount: 89.95, qty: 2 }],
    { currency: 'AUD', storeId: 'shoes', fulfilmentVerified: false, rng: seqRng() }
  );
  assert.equal(view.ok, true);
  assert.equal(view.currency, 'AUD');
  assert.equal(view.totalMinor, 17990);
  assert.equal(view.totalLabel, '179.90');
  assert.equal(view.requestsPayment, false);
  assert.equal(view.paid, false);
  assert.equal(view.confirmed, false);
  const again = cart.catalogueCheckout(
    [{ id: 'shoe', name: 'Sample shoe', amount: 89.95, qty: 2 }],
    { currency: 'AUD', storeId: 'shoes', fulfilmentVerified: false, previous: { snapshotKey: view.snapshotKey, reference: view.reference }, rng: seqRng() }
  );
  assert.equal(again.reference, view.reference);
  const changed = cart.catalogueCheckout(
    [{ id: 'shoe', name: 'Sample shoe', amount: 89.95, qty: 3 }],
    { currency: 'AUD', storeId: 'shoes', fulfilmentVerified: false, previous: { snapshotKey: view.snapshotKey, reference: view.reference }, rng: seqRng(40) }
  );
  assert.notEqual(changed.snapshotKey, view.snapshotKey);
  assert.notEqual(changed.reference, view.reference);
});

test('USD catalogue prices are not relabelled or requested as PayID', () => {
  const view = cart.catalogueCheckout(
    [{ id: 'usd', name: 'Kept price', amount: '19.95', qty: 1 }],
    { currency: 'usd', storeId: 'shop', mode: 'manual-aud', fulfilmentVerified: true, rng: seqRng() }
  );
  assert.equal(view.currency, 'USD');
  assert.equal(view.totalLabel, '19.95');
  assert.equal(view.audAmountMinor, null);
  assert.equal(view.requestsPayment, false);
  assert.equal(view.mode, 'quote-before-transfer');
  const bad = cart.catalogueCheckout([{ name: 'X', amount: 1, qty: 1 }], { currency: 'US$', storeId: 'shop' });
  assert.equal(bad.ok, false);
  assert.equal(bad.requestsPayment, false);
  assert.equal(bad.paid, false);
});

test('mount URLs resolve for root and apps storefronts', () => {
  assert.equal(
    cart.payidMountUrl('https://songwriterkaz.github.io/coffeebreak/shoes/cb-pay.js'),
    'https://songwriterkaz.github.io/coffeebreak/payid-cart/mount.js'
  );
  assert.equal(
    cart.payidMountUrl('https://songwriterkaz.github.io/coffeebreak/apps/flowers/cb-pay.js'),
    'https://songwriterkaz.github.io/coffeebreak/payid-cart/mount.js'
  );
  assert.equal(
    cart.payidMountUrl('https://songwriterkaz.github.io/coffeebreak/apps/foo/shop/cb-pay.js'),
    'https://songwriterkaz.github.io/coffeebreak/payid-cart/mount.js'
  );
  assert.equal(
    cart.payidMountUrl('https://songwriterkaz.github.io/coffeebreak/apps/gametarot/assets/cb-pay.js'),
    'https://songwriterkaz.github.io/coffeebreak/payid-cart/mount.js'
  );
});

test('two representative stores use the shared loader and keep published prices', () => {
  for (const dir of ['shoes', 'apps/flowers']) {
    const pay = readFileSync(new URL('../' + dir + '/cb-pay.js', import.meta.url), 'utf8');
    assert.equal(pay, loader);
    assert.doesNotMatch(pay, /paypal|stripe|gumroad/i);
    const html = readFileSync(new URL('../' + dir + '/index.html', import.meta.url), 'utf8');
    assert.match(html, /<script src="cb-pay\.js"><\/script>/);
    const products = readFileSync(new URL('../' + dir + '/products.js', import.meta.url), 'utf8');
    const sells = [...products.matchAll(/"sell":\s*(\d+(?:\.\d+)?)/g)].map((m) => Number(m[1]));
    assert.ok(sells.length > 0);
    for (const sell of sells) {
      const view = cart.catalogueCheckout(
        [{ id: 'p', name: 'Item', amount: sell, qty: 1 }],
        { currency: 'AUD', storeId: dir, fulfilmentVerified: false, rng: seqRng() }
      );
      assert.equal(view.currency, 'AUD');
      assert.equal(view.requestsPayment, false);
      assert.equal(view.paid, false);
      assert.equal(view.totalLabel, sell.toFixed(2));
    }
  }
  const mount = readFileSync(new URL('./mount.js', import.meta.url), 'utf8');
  assert.match(mount, /MutationObserver/);
  assert.match(mount, /Payment is not requested/);
  assert.doesNotMatch(mount, /I have paid|payment confirmed|order sent/i);
  assert.match(mount, /fulfilmentVerified:\s*false/);
  assert.doesNotMatch(mount, /fulfilmentVerified:\s*true/);
  assert.doesNotMatch(mount, /fetch\s*\(|paypal|stripe/i);
});

test('school coffee totals use the cart core and purchases stay closed', () => {
  const src = readFileSync(new URL('../school-bookings/coffee.js', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../school-bookings/index.html', import.meta.url), 'utf8');
  assert.match(src, /CoffeebreakCart\.lineMinor/);
  assert.match(src, /CoffeebreakCart\.sumMinor/);
  assert.match(src, /No order was saved/);
  assert.match(src, /Payment not taken/);
  assert.doesNotMatch(src, /S\.coffee\.orders\.push/);
  assert.match(page, /src="\.\.\/payid-cart\/cart\.js"/);
  const oat = cart.dollarsToMinor(4.5) + cart.dollarsToMinor(0.8);
  assert.equal(cart.lineMinor(oat, 2), 1060);
  assert.equal(cart.formatMinor(1060), '10.60');
  const menu = [...src.matchAll(/p:\[([0-9.,]+)\]/g)].map((m) => m[1].split(',').map(Number));
  const extras = [...src.matchAll(/\['[^']+',([0-9.]+)\]/g)].map((m) => Number(m[1]));
  assert.ok(menu.length >= 7);
  for (const price of menu.flat().concat(extras)) {
    assert.equal(cart.formatMinor(cart.dollarsToMinor(price)), price.toFixed(2));
  }
});

test('coverage counts this milestone and leaves the other catalogues alone', () => {
  const found = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (name === '.git' || name === 'node_modules') continue;
      const path = dir + '/' + name;
      if (name === 'cb-pay.js') found.push(path.slice(2));
      else if (statSync(path).isDirectory()) walk(path);
    }
  }
  walk('.');
  const integrated = found.filter((path) => readFileSync(path, 'utf8') === loader);
  const legacy = found.filter((path) => !integrated.includes(path));
  assert.deepEqual(integrated.sort(), ['apps/flowers/cb-pay.js', 'shoes/cb-pay.js']);
  assert.ok(legacy.length > 0);
  assert.equal(found.some((path) => path.includes('vintage-midwife-bags')), false);
  assert.equal(legacy.some((path) => path.includes('social/')), false);
  console.log('COVERAGE integrated=' + integrated.length + ' legacy=' + legacy.length + ' school=gated');
});
