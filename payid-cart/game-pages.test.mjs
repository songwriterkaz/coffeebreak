import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const game = require('./game-cart.js');
const loader = readFileSync(new URL('./store-loader.js', import.meta.url), 'utf8');
const root = new URL('..', import.meta.url);

function page(rel) {
  return readFileSync(new URL('../' + rel, import.meta.url), 'utf8');
}

test('every in-repo game page mounts the shared PayID cart', () => {
  const pages = game.listGamePages(root.pathname);
  assert.ok(pages.length >= 150, 'expected the game inventory, got ' + pages.length);
  const priced = { AUD: 0, USD: 0, gap: 0 };
  for (const rel of pages) {
    const html = page(rel);
    assert.match(html, /<!--cb-game-cart-start-->/, rel);
    assert.match(html, /id="cb-game-cart-data"/, rel);
    assert.match(html, new RegExp(game.assetPrefix(rel).replace(/\./g, '\\.') + 'cart\\.js'), rel);
    assert.match(html, /payid-cart\/game-cart\.js/, rel);
    assert.match(html, /payid-cart\/game-mount\.js/, rel);
    assert.match(html, /apps\/cb-static-checkout\.js/, rel);
    const block = html.match(/<!--cb-game-cart-start-->([\s\S]*?)<!--cb-game-cart-end-->/);
    assert.ok(block, rel);
    assert.equal(block[1].includes('!'), false, rel);
    assert.doesNotMatch(block[1], /headspace|paypal|gumroad|payhip|ko-fi|itch\.io|stripe/i, rel);
    const data = JSON.parse(block[1].match(/<script type="application\/json" id="cb-game-cart-data">([\s\S]*?)<\/script>/)[1]);
    const offer = game.attachFoodPrizes(game.readOffer(html, rel));
    assert.equal(data.currency, offer.currency, rel);
    assert.deepEqual(data.items, offer.items, rel);
    if (offer.currency) {
      assert.ok(offer.items.some((item) => item.kind === 'food'), rel);
      assert.ok(offer.items.some((item) => item.kind === 'prize'), rel);
    }
    if (!offer.currency) priced.gap += 1;
    else priced[offer.currency] += 1;
    assert.match(html, /https:\/\/www\.tesla\.com/, rel);
    assert.match(html, /https:\/\/www\.starlink\.com/, rel);
    assert.match(html, /youtube\.com/, rel);
    assert.match(html, /Report a problem|cbreport\.js/, rel);
    assert.match(html, /third-party/i, rel);
    assert.match(html, /cb-logo|logo/i, rel);
    assert.doesNotMatch(html, /gumroad\.com|payhip\.com|ko-fi\.com|href="#pending"|store pending|headspace/i, rel);
    assert.doesNotMatch(html, /<form\b[^>]*paypal/i, rel);
    assert.doesNotMatch(html, /<a\b[^>]*href=["'][^"']*itch\.io/i, rel);
    assert.doesNotMatch(html, /<a\b[^>]*href=["'][^"']*(?:paypal\.com|stripe\.com|buy\.stripe)/i, rel);
    assert.doesNotMatch(html, /<button\b[^>]*>[^<]*(?:I've paid|I have paid)/i, rel);
    assert.doesNotMatch(html, /C\.trophy\('member'\)/, rel);
  }
  assert.ok(priced.USD + priced.AUD > 0);
  console.log('GAME CARTS pages=' + pages.length + ' aud=' + priced.AUD + ' usd=' + priced.USD + ' gap=' + priced.gap);
});

test('representative games keep published prices and owner access', () => {
  const arcade = game.readOffer(page('canva-games/index.html'), 'canva-games/index.html');
  assert.equal(arcade.currency, 'AUD');
  assert.equal(arcade.items[0].amount, '5.00');
  const drag = game.readOffer(page('mens-games/drag-race/index.html'), 'mens-games/drag-race/index.html');
  assert.equal(drag.currency, 'USD');
  assert.equal(drag.items[0].amount, '10.00');
  const banana = game.readOffer(page('pin-the-condom-on-the-banana/index.html'), 'pin-the-condom-on-the-banana/index.html');
  assert.equal(banana.currency, 'USD');
  assert.equal(banana.items[0].amount, '10.00');
  const latte = page('apps/latte-lantern-haunt/index.html');
  assert.match(latte, /Owner copy free for Karen/);
  assert.match(page('apps/rooftop-kick-goals-buy/index.html'), /\$10 USD/);
  assert.equal(readFileSync(new URL('../shoes/cb-pay.js', import.meta.url), 'utf8'), loader);
  assert.equal(readFileSync(new URL('../apps/flowers/cb-pay.js', import.meta.url), 'utf8'), loader);
  const park = page('apps/park-builder/index.html');
  assert.match(park, /<!--cb-game-cart-start-->/);
  assert.match(park, /park-orders\.js/);
  assert.match(park, /Food & prizes/);
  assert.doesNotMatch(park, /doordash|woolworths|coles|ubereats|menulog|instacart|deliveroo/i);
});


test('paid apps and stores mount the shared PayID cart, and directories drop Gumroad wording', () => {
  const apps = game.listAppPages(root.pathname);
  assert.ok(apps.length >= 20, 'expected app and store pages, got ' + apps.length);
  assert.equal(apps.some((rel) => /autism-planner/.test(rel)), false);
  for (const rel of apps) {
    const html = page(rel);
    assert.match(html, /<!--cb-game-cart-start-->/, rel);
    assert.doesNotMatch(html, /gumroad\.com|payhip\.com|ko-fi\.com/i, rel);
    const data = JSON.parse(html.match(/<script type="application\/json" id="cb-game-cart-data">([\s\S]*?)<\/script>/)[1]);
    assert.ok(data.items && data.items.length, rel);
    if (data.currency === 'USD') {
      data.items.forEach((item) => {
        if (item.amount != null) assert.ok(Number(item.amount) >= 10, rel + ' ' + item.id);
      });
    }
  }
  const yellow = page('yellow-pages/index.html');
  const needed = page('apps/what-i-need-now/index.html');
  const dataFile = readFileSync(new URL('../yellow-pages/data.json', import.meta.url), 'utf8');
  for (const [name, text] of [['yellow-pages', yellow], ['what-i-need-now', needed], ['data.json', dataFile]]) {
    assert.doesNotMatch(text, /gumroad/i, name);
    assert.doesNotMatch(text, /Snack Proud/i, name);
  }
  assert.match(needed, /PayID checkout/);
  const planner = page('apps/autism-planner/index.html');
  assert.doesNotMatch(planner, /cb-game-cart-start/);
  assert.doesNotMatch(planner, /\$10/);
});

