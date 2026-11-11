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
    const block = html.match(/<!--cb-game-cart-start-->([\s\S]*?)<!--cb-game-cart-end-->/);
    assert.ok(block, rel);
    assert.equal(block[1].includes('!'), false, rel);
    assert.doesNotMatch(block[1], /headspace|paypal|gumroad|payhip|ko-fi/i, rel);
    const data = JSON.parse(block[1].match(/<script type="application\/json" id="cb-game-cart-data">([\s\S]*?)<\/script>/)[1]);
    const offer = game.readOffer(html, rel);
    assert.equal(data.currency, offer.currency, rel);
    assert.deepEqual(data.items, offer.items, rel);
    if (!offer.currency) priced.gap += 1;
    else priced[offer.currency] += 1;
    assert.match(html, /https:\/\/www\.tesla\.com/, rel);
    assert.match(html, /https:\/\/www\.starlink\.com/, rel);
    assert.match(html, /Report a problem|cbreport\.js/, rel);
    assert.match(html, /third-party/i, rel);
    assert.doesNotMatch(html, /gumroad\.com|payhip\.com|ko-fi\.com|href="#pending"|store pending/i, rel);
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
  assert.equal(banana.items[0].amount, null);
  assert.match(banana.items[0].gap, /Price coming soon/);
  const latte = page('apps/latte-lantern-haunt/index.html');
  assert.match(latte, /Owner copy free for Karen/);
  assert.match(page('apps/rooftop-kick-goals-buy/index.html'), /\$10 USD/);
  assert.equal(readFileSync(new URL('../shoes/cb-pay.js', import.meta.url), 'utf8'), loader);
  assert.equal(readFileSync(new URL('../apps/flowers/cb-pay.js', import.meta.url), 'utf8'), loader);
});
