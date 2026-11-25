import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loader = readFileSync(new URL('./store-loader.js', import.meta.url), 'utf8');
const pay = readFileSync(new URL('../apps/coffeeshop-web/cb-pay.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../apps/coffeeshop-web/index.html', import.meta.url), 'utf8');
const config = readFileSync(new URL('../apps/coffeeshop-web/config.js', import.meta.url), 'utf8');
const supplier = readFileSync(new URL('../apps/coffeeshop-web/supplier-config.js', import.meta.url), 'utf8');
const mount = readFileSync(new URL('./mount.js', import.meta.url), 'utf8');

test('coffee shop checkout is the shared enquiry loader', () => {
  assert.equal(pay, loader);
  assert.match(page, /<script src="cb-pay\.js"><\/script>/);
  assert.match(config, /CURRENCY:"AUD"/);
  assert.match(supplier, /approved:\s*false/);
  assert.doesNotMatch(pay, /cbpaid|paypal\.com|formsubmit/i);
  assert.match(mount, /fulfilmentVerified:\s*false/);
  assert.match(page, /Payment is not requested/);
  assert.doesNotMatch(page, /Secure checkout/);
});
