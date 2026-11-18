import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const coins = require('./payid-coins.js');

const LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';

function memory() {
  const map = new Map();
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(String(key), String(value)); },
    removeItem(key) { map.delete(key); }
  };
}

function zeroRng() { return 0; }

test('coin packs and PayID label match the card prototype', () => {
  assert.equal(coins.PAYMENT_LABEL, LABEL);
  assert.equal(coins.PAYID, 'darkokaz@gmx.com');
  assert.deepEqual(coins.PACKS.map((pack) => [pack.id, pack.coins, pack.amount, pack.button, pack.amountLabel]), [
    ['pack-100', 100, '1.00', '100 coins A$1', 'A$1.00'],
    ['pack-1200', 1200, '10.00', '1,200 coins A$10', 'A$10.00'],
    ['pack-6500', 6500, '50.00', '6,500 coins A$50', 'A$50.00']
  ]);
  assert.equal(coins.NOTES.checked, 'Coins are credited once the payment is received and checked.');
  assert.equal(coins.NOTES.noCash, 'Coins are for in-game use only and have no cash value or refunds to PayID.');
  assert.equal(coins.PANEL_TITLE, 'Buy coins with PayID');
  assert.equal(coins.GIFT_TITLE, 'Send coins to a friend');
  assert.equal(coins.CREDIT_TITLE, 'Credit a reference');
  for (const value of Object.values(coins.NOTES)) assert.equal(value.includes('!'), false);
});

test('choosing a pack saves an unchecked reference and does not add coins', () => {
  const made = coins.createPurchase(coins.emptyBook(), {
    packId: 'pack-100',
    kind: 'self',
    now: '2026-11-18T00:00:00.000Z',
    rng: zeroRng
  });
  assert.equal(made.ok, true);
  assert.equal(made.coinsAdded, 0);
  assert.equal(made.purchase.reference, 'PB-AAAAAA');
  assert.equal(made.purchase.giftCode, null);
  assert.equal(made.purchase.status, 'awaiting_check');
  assert.equal(made.purchase.paid, false);
  assert.equal(made.purchase.coins, 100);
  assert.equal(made.purchase.amount, '1.00');
  const view = coins.cardView(made.purchase);
  assert.equal(view.label, LABEL);
  assert.equal(view.amountLabel, 'A$1.00');
  assert.equal(view.reference, 'PB-AAAAAA');
  assert.deepEqual(view.copy, { payId: 'darkokaz@gmx.com', amount: '1.00', reference: 'PB-AAAAAA' });
  assert.deepEqual(view.copyButtons, ['Copy PayID', 'Copy amount', 'Copy reference']);
});

test('a second pack gets a different reference', () => {
  const first = coins.createPurchase(coins.emptyBook(), { packId: 'pack-6500', kind: 'self', rng: zeroRng });
  const second = coins.createPurchase(first.book, { packId: 'pack-6500', kind: 'self', rng: zeroRng });
  assert.equal(second.ok, true);
  assert.notEqual(second.purchase.reference, first.purchase.reference);
  assert.match(second.purchase.reference, /^PB-[A-Z2-9]{6}$/);
  assert.equal(second.book.purchases.length, 2);
});

test('owner credit is the only way a saved reference adds coins', () => {
  const made = coins.createPurchase(coins.emptyBook(), { packId: 'pack-100', kind: 'self', rng: zeroRng });
  const blocked = coins.creditReference(made.book, 'PB-AAAAAA', '2026-11-18T01:00:00.000Z');
  assert.equal(blocked.ok, false);
  assert.equal(blocked.error, 'owner');
  assert.equal(blocked.coinsAdded, 0);
  assert.equal(made.book.purchases[0].status, 'awaiting_check');

  coins.setOwner(made.book, true);
  const missing = coins.creditReference(made.book, 'PB-ZZZZZZ', '2026-11-18T01:00:00.000Z');
  assert.equal(missing.ok, false);
  assert.equal(missing.error, 'missing');
  assert.equal(missing.coinsAdded, 0);

  const credited = coins.creditReference(made.book, 'pb-aaaaaa', '2026-11-18T02:00:00.000Z');
  assert.equal(credited.ok, true);
  assert.equal(credited.coinsAdded, 100);
  assert.equal(credited.purchase.status, 'credited');
  assert.equal(credited.purchase.paid, false);
  const again = coins.creditReference(made.book, 'PB-AAAAAA', '2026-11-18T03:00:00.000Z');
  assert.equal(again.ok, false);
  assert.equal(again.error, 'already');
  assert.equal(again.coinsAdded, 0);
});

test('a friend gift stores a code and adds coins only after credit and redeem', () => {
  const empty = coins.createPurchase(coins.emptyBook(), { packId: 'pack-1200', kind: 'gift', friend: '   ', rng: zeroRng });
  assert.equal(empty.ok, false);
  assert.equal(empty.coinsAdded, 0);

  const made = coins.createPurchase(coins.emptyBook(), {
    packId: 'pack-1200',
    kind: 'gift',
    friend: '  Sam Friend  ',
    rng: zeroRng
  });
  assert.equal(made.ok, true);
  assert.equal(made.coinsAdded, 0);
  assert.equal(made.purchase.friend, 'Sam Friend');
  assert.equal(made.purchase.giftCode, 'PBG-AAAAAA');
  assert.equal(made.purchase.coins, 1200);
  assert.equal(made.purchase.status, 'awaiting_check');

  const early = coins.redeemGift(made.book, 'PBG-AAAAAA');
  assert.equal(early.ok, false);
  assert.equal(early.error, 'waiting');
  assert.equal(early.coinsAdded, 0);

  coins.setOwner(made.book, true);
  const credited = coins.creditReference(made.book, made.purchase.reference);
  assert.equal(credited.ok, true);
  assert.equal(credited.coinsAdded, 0);
  assert.equal(credited.purchase.status, 'credited');

  const redeemed = coins.redeemGift(credited.book, 'pbg-aaaaaa', '2026-11-18T04:00:00.000Z');
  assert.equal(redeemed.ok, true);
  assert.equal(redeemed.coinsAdded, 1200);
  assert.equal(redeemed.purchase.status, 'redeemed');
  const twice = coins.redeemGift(redeemed.book, 'PBG-AAAAAA');
  assert.equal(twice.ok, false);
  assert.equal(twice.error, 'used');
  assert.equal(twice.coinsAdded, 0);
});

test('purchases and gift codes round-trip in localStorage without becoming paid', () => {
  const made = coins.createPurchase(coins.emptyBook(), {
    packId: 'pack-50' in {} ? 'pack-100' : 'pack-100',
    kind: 'gift',
    friend: 'ada@example.com',
    rng: zeroRng
  });
  coins.setOwner(made.book, true);
  const storage = memory();
  coins.saveBook(storage, made.book);
  const loaded = coins.loadBook(storage);
  assert.equal(loaded.owner, true);
  assert.equal(loaded.purchases.length, 1);
  assert.equal(loaded.purchases[0].reference, 'PB-AAAAAA');
  assert.equal(loaded.purchases[0].giftCode, 'PBG-AAAAAA');
  assert.equal(loaded.purchases[0].friend, 'ada@example.com');
  assert.equal(loaded.purchases[0].status, 'awaiting_check');
  assert.equal(loaded.purchases[0].paid, false);

  storage.setItem(coins.STORAGE_KEY, JSON.stringify({
    owner: false,
    purchases: [{
      reference: 'PB-AAAAAA',
      giftCode: 'PBG-AAAAAA',
      packId: 'pack-100',
      coins: 999999,
      amount: '1.00',
      kind: 'self',
      friend: '',
      status: 'paid',
      paid: true
    }]
  }));
  const tampered = coins.loadBook(storage);
  assert.equal(tampered.purchases[0].paid, false);
  assert.equal(tampered.purchases[0].status, 'awaiting_check');
  assert.equal(tampered.purchases[0].coins, 100);
  assert.equal(coins.loadBook(memory()).purchases.length, 0);
});

test('park coins change only through an explicit credit amount', () => {
  const live = { coins: 100, pieces: [] };
  const storage = memory();
  const added = coins.applyParkCoins(storage, 100, live);
  assert.equal(added.ok, true);
  assert.equal(live.coins, 200);
  assert.equal(JSON.parse(storage.getItem(coins.PARK_KEY)).coins, 200);

  const saved = memory();
  saved.setItem(coins.PARK_KEY, JSON.stringify({ coins: 40, pieces: [1] }));
  const offline = coins.applyParkCoins(saved, 50, null);
  assert.equal(offline.ok, true);
  assert.equal(JSON.parse(saved.getItem(coins.PARK_KEY)).coins, 90);
  assert.deepEqual(JSON.parse(saved.getItem(coins.PARK_KEY)).pieces, [1]);
  assert.equal(coins.applyParkCoins(saved, 0, null).ok, false);
  assert.equal(JSON.parse(saved.getItem(coins.PARK_KEY)).coins, 90);
});

test('there is no payout and the page keeps the existing footer', () => {
  for (const key of Object.keys(coins)) {
    assert.doesNotMatch(key, /refund|withdraw|payout|cashout|paypal|stripe|gumroad/i, key);
  }
  const js = readFileSync(new URL('./payid-coins.js', import.meta.url), 'utf8');
  assert.doesNotMatch(js, /paypal|gumroad|stripe|payhip|ko-fi/i);
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const block = html.match(/<!--payid-coins-start-->([\s\S]*?)<!--payid-coins-end-->/);
  assert.ok(block, 'payid coin panel markers');
  assert.equal(block[1].includes('!'), false);
  assert.match(block[1], /Buy coins with PayID/);
  assert.match(block[1], /100 coins A\$1/);
  assert.match(block[1], /1,200 coins A\$10/);
  assert.match(block[1], /6,500 coins A\$50/);
  assert.match(block[1], /Send coins to a friend/);
  assert.match(block[1], /Credit a reference/);
  assert.match(block[1], /Coins are credited once the payment is received and checked\./);
  assert.match(block[1], /Coins are for in-game use only and have no cash value or refunds to PayID\./);
  assert.match(block[1], /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx\.com/);
  assert.match(html, /payid-coins\.js/);
  assert.match(html, /id="bCoins"/);
  assert.match(html, /assets\/logo\.png/);
  assert.match(html, /Disclaimer/);
  assert.match(html, /https:\/\/coffeebreaks\.itch\.io/);
  assert.match(html, /https:\/\/www\.tesla\.com/);
  assert.match(html, /https:\/\/www\.starlink\.com/);
  assert.doesNotMatch(html, /paypal|gumroad|stripe|payhip|ko-fi/i);
  assert.doesNotMatch(block[1], /instant|automatic/i);
});
