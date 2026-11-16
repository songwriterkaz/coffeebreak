import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);

function api() {
  return require('./game-cart.js');
}

function seqRng(start = 2) {
  let n = start;
  return () => {
    n += 1;
    return ((n * 173) % 997) / 997;
  };
}

test('AUD game cart adds, changes quantity, removes, totals, and shows PayID instructions', () => {
  const game = api();
  const session = game.createSession({
    storeId: 'canva-games',
    currency: 'AUD',
    items: [{ id: 'arcade', name: 'Coffeebreak Arcade', amount: '5.00' }],
    rng: seqRng()
  });
  assert.equal(game.add(session, 'arcade').ok, true);
  assert.equal(session.lines[0].qty, 1);
  assert.equal(game.setQty(session, 'arcade', 3).ok, true);
  const view = game.view(session);
  assert.equal(view.ok, true);
  assert.equal(view.currency, 'AUD');
  assert.equal(view.totalLabel, '15.00');
  assert.equal(view.mode, 'manual-aud');
  assert.equal(view.requestsPayment, true);
  assert.equal(view.showTransferInstructions, true);
  assert.equal(view.paymentLabel, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.equal(view.paid, false);
  assert.equal(view.confirmed, false);
  assert.equal(view.bankVerified, false);
  assert.match(view.reference, /^CB[A-Z2-9]{14}$/);
  assert.equal(game.remove(session, 'arcade').length, 0);
  const empty = game.view(session);
  assert.equal(empty.requestsPayment, false);
  assert.equal(empty.totalLabel, '0.00');
  assert.equal(empty.reference, null);
});

test('USD game prices stay labelled in USD and show a guide Australian dollar transfer amount', () => {
  const game = api();
  const session = game.createSession({
    storeId: 'apps/rooftop-kick-goals-buy',
    currency: 'USD',
    items: [{ id: 'full', name: 'Rooftop Kick Goals', amount: '10.00' }],
    rng: seqRng(4)
  });
  game.add(session, 'full');
  game.setQty(session, 'full', 2);
  const listed = game.view(session);
  assert.equal(listed.currency, 'USD');
  assert.equal(listed.totalLabel, '20.00');
  assert.equal(listed.audAmountMinor, null);
  assert.equal(listed.requestsPayment, true);
  assert.equal(listed.showTransferInstructions, true);
  assert.equal(listed.mode, 'quote-before-transfer');
  assert.equal(listed.paymentLabel, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.equal(listed.paid, false);
  assert.equal(Object.hasOwn(listed, 'exchangeRate'), false);
  session.usdAudRate = 1.48;
  session.exchangeRateDate = '2026-11-16';
  const view = game.view(session);
  assert.equal(view.currency, 'USD');
  assert.equal(view.totalLabel, '20.00');
  assert.equal(view.audAmountMinor, 2960);
  assert.equal(view.audTotalLabel, '29.60');
  assert.equal(view.exchangeRate, 1.48);
  assert.equal(view.exchangeRateDate, '2026-11-16');
  assert.equal(view.requestsPayment, true);
  assert.equal(view.showTransferInstructions, true);
  assert.equal(view.paid, false);
  const quote = game.audQuote(2000, 'USD', 1.48, '2026-11-16');
  assert.equal(quote.audAmountMinor, 2960);
  assert.equal(quote.audTotalLabel, '29.60');
});

test('an unpriced game offer is sold at 10.00 USD and can be checked out', () => {
  const game = api();
  const offer = game.readOffer('<title>Pin the Condom on the Banana</title>', 'pin-the-condom-on-the-banana/index.html');
  assert.equal(offer.currency, 'USD');
  assert.equal(offer.items[0].amount, '10.00');
  assert.equal(offer.items[0].currency, 'USD');
  const session = game.createSession({
    storeId: offer.storeId,
    currency: offer.currency,
    items: offer.items,
    rng: seqRng(1)
  });
  assert.equal(game.priceLabel(session.items[0]), '10.00 USD');
  assert.equal(game.add(session, 'full').ok, true);
  const view = game.view(session);
  assert.equal(view.ok, true);
  assert.equal(view.currency, 'USD');
  assert.equal(view.totalLabel, '10.00');
  assert.equal(view.paymentLabel, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.match(view.reference, /^CB[A-Z2-9]{14}$/);
  assert.equal(view.paid, false);
});

test('a session with no price still cannot be checked out', () => {
  const game = api();
  const session = game.createSession({
    storeId: 'pin-the-condom-on-the-banana',
    currency: null,
    items: [{ id: 'full', name: 'Pin the Condom on the Banana', amount: null }],
    rng: seqRng(1)
  });
  assert.equal(game.priceLabel(session.items[0]), 'Price coming soon');
  assert.equal(game.add(session, 'full').ok, false);
  const view = game.view(session);
  assert.equal(view.lines.length, 0);
  assert.equal(view.requestsPayment, false);
  assert.equal(view.paid, false);
  assert.match(view.gap, /Price coming soon/);
  assert.match(view.gap, /No payment is requested/);
});

test('quantity bounds and a customer claim never mark the game paid', () => {
  const game = api();
  const session = game.createSession({
    storeId: 'mens-games/drag-race',
    currency: 'USD',
    items: [{ id: 'full', name: 'CB Muscle Drag full game', amount: '10.00' }],
    rng: seqRng(6)
  });
  game.add(session, 'full');
  const over = game.setQty(session, 'full', 21);
  assert.equal(over.ok, false);
  assert.equal(session.lines[0].qty, 1);
  session.customerClaimsPaid = true;
  const view = game.view(session);
  assert.equal(view.paid, false);
  assert.equal(view.confirmed, false);
  assert.equal(view.customerClaimsPaid, true);
  assert.notEqual(view.status, 'paid');
});

test('loot and paid-chance packs are not sold in the game cart', () => {
  const game = api();
  assert.equal(game.isSellableName('Mystery loot box'), false);
  assert.equal(game.isSellableName('Season pass'), true);
  const session = game.createSession({
    storeId: 'apps/street-brawl',
    currency: 'USD',
    items: [
      { id: 'skins', name: 'Premium skins', amount: '2.00' },
      { id: 'loot', name: 'Mystery loot box', amount: '5.00' }
    ],
    rng: seqRng(3)
  });
  assert.equal(game.add(session, 'loot').ok, false);
  assert.equal(game.add(session, 'skins').ok, true);
  assert.equal(session.lines.length, 1);
  assert.equal(session.lines[0].id, 'skins');
});

test('published game copy keeps its price and currency', () => {
  const game = api();
  assert.deepEqual(game.readOffer('<title>Coffeebreak Arcade</title><div class="price">Full version $5 AUD</div>', 'canva-games/index.html').items, [
    { id: 'full', name: 'Coffeebreak Arcade', amount: '5.00', currency: 'AUD' }
  ]);
  const mens = game.readOffer('<title>CB Muscle Drag</title><a>Buy full game $10</a>', 'mens-games/drag-race/index.html');
  assert.equal(mens.currency, 'USD');
  assert.equal(mens.items[0].amount, '10.00');
  assert.equal(mens.items[0].currency, 'USD');
  const buy = game.readOffer('<title>Buy Rooftop Kick Goals</title><p class="price">$10 USD</p>', 'apps/rooftop-kick-goals-buy/index.html');
  assert.equal(buy.currency, 'USD');
  assert.equal(buy.items[0].amount, '10.00');
  const bare = game.readOffer('<title>Coffeebreak Karaoke</title><p>Buy for $5 on this page.</p>', 'apps/karaoke/index.html');
  assert.equal(bare.currency, 'USD');
  assert.equal(bare.items[0].amount, '10.00');
  assert.equal(bare.items[0].currency, 'USD');
  const packs = game.readOffer(
    '<title>Coffeebreak Street Brawl</title><h3>Premium skins</h3><p><b>$2 USD</b></p><h3>Iron chin pack</h3><p><b>$3 USD</b></p>',
    'apps/street-brawl/index.html'
  );
  assert.equal(packs.currency, 'USD');
  assert.deepEqual(packs.items.map((item) => item.amount), ['2.00', '3.00']);
  const rebate = game.readOffer('<title>Coffee Card</title><p>pay $10 then claim $2 back</p>', 'coffee-card-game/index.html');
  assert.equal(rebate.currency, 'USD');
  assert.equal(rebate.items[0].amount, '10.00');
});

test('order details use the Formsubmit mailbox and never mark a payment verified', () => {
  const game = api();
  assert.equal(game.GAME_ORDERS_EMAIL, 'darkokaz@gmx.com');
  assert.equal(game.ordersEndpoint(), 'https://formsubmit.co/ajax/darkokaz@gmx.com');
  const fields = game.orderFields({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    lines: [{ id: 'full', name: 'Coffeebreak Darts', qty: 2 }],
    total: '20.00',
    currency: 'USD',
    reference: 'CBTESTREFERENCE1'
  });
  assert.equal(fields.name, 'Ada Lovelace');
  assert.equal(fields.email, 'ada@example.com');
  assert.equal(fields.items, '2 x Coffeebreak Darts');
  assert.equal(fields.total, '20.00 USD');
  assert.equal(fields.reference, 'CBTESTREFERENCE1');
  assert.equal(fields.payId, 'darkokaz@gmx.com');
  assert.equal(fields._captcha, 'false');
  assert.equal(fields._honey, '');
  assert.match(fields._subject, /CBTESTREFERENCE1/);
  const draft = game.orderMailto({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    address: '1 Test Street, Newcastle NSW 2300',
    phone: '0400000000',
    lines: [{ id: 'full', name: 'Coffeebreak Darts', qty: 2 }],
    total: '20.00',
    currency: 'USD',
    audTotal: '29.60',
    reference: 'CBTESTREFERENCE1'
  });
  assert.match(draft.href, /^mailto:darkokaz@gmx\.com\?/);
  assert.match(decodeURIComponent(draft.href), /Transfer: 29\.60 AUD/);
  assert.match(decodeURIComponent(draft.href), /PayID: darkokaz@gmx\.com/);
  assert.equal(JSON.stringify(fields).includes('verified'), false);
  const mount = readFileSync(new URL('./game-mount.js', import.meta.url), 'utf8');
  assert.match(mount, /cb-game-checkout/);
  assert.match(mount, /I've paid by PayID, unlock now/);
  assert.match(mount, /I've paid by PayID, confirm this order/);
  assert.match(mount, /honourClaim\(/);
  assert.match(mount, /unlockKey\(/);
  assert.match(mount, /ordersEndpoint\(\)/);
  assert.match(mount, /orderMailto\(/);
  assert.match(mount, /Email this order/);
  assert.match(mount, /Open cart/);
  assert.match(mount, /left:12px/);
  assert.match(mount, /2147483646/);
  assert.match(mount, /orderFields\(/);
  assert.match(mount, /labelledInput\('Name', 'name'/);
  assert.match(mount, /labelledInput\('Email', 'email'/);
  assert.match(mount, /labelledInput\('Delivery address', 'address'/);
  assert.match(mount, /labelledInput\('Phone', 'phone'/);
  assert.match(mount, /Real food & prizes/);
  assert.match(mount, /Fulfilment starts after the PayID lands/);
  assert.doesNotMatch(mount, /I have paid|payment confirmed|order sent|paid:\s*true|verified:\s*true/i);
  const digital = game.honourClaim({
    storeId: 'apps/darts',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    lines: [{ id: 'full', name: 'Coffeebreak Darts', qty: 1 }],
    total: '10.00',
    currency: 'USD',
    reference: 'CBTESTREFERENCE1'
  });
  assert.equal(digital.unlocked, true);
  assert.equal(digital.paid, false);
  assert.equal(digital.verified, false);
  assert.equal(digital.confirmed, false);
  assert.equal(digital.customerClaimsPaid, true);
  assert.equal(game.unlockKey('apps/darts'), 'cb-payid-unlock:apps/darts');
  const plush = game.honourClaim({
    storeId: 'apps/plush-hospital',
    lines: [{ id: 'pink-plush-doctor-1', name: 'Pink plush doctor', qty: 1 }],
    reference: 'CBPLUSHORDER0001'
  });
  assert.equal(plush.unlocked, false);
  assert.equal(plush.physical, true);
  assert.equal(plush.paid, false);
  const gameAndPlush = game.honourClaim({
    storeId: 'apps/plush-hospital',
    lines: [
      { id: 'pink-plush-doctor-1', name: 'Pink plush doctor', qty: 1 },
      { id: 'coffeebreak-plush-hospital-7', name: 'Coffeebreak Plush Hospital', qty: 1 }
    ],
    reference: 'CBMIXEDORDER0001'
  });
  assert.equal(gameAndPlush.unlocked, true);
  assert.equal(gameAndPlush.physical, true);
  assert.equal(gameAndPlush.paid, false);
});

test('added cart text has no exclamation mark, Headspace, PayPal, or Gumroad', () => {
  const game = api();
  const mount = readFileSync(new URL('./game-mount.js', import.meta.url), 'utf8');
  const src = readFileSync(new URL('./game-cart.js', import.meta.url), 'utf8');
  for (const text of game.UI_STRINGS) {
    assert.equal(text.includes('!'), false, text);
    assert.doesNotMatch(text, /headspace|paypal|gumroad|payhip|ko-fi/i);
  }
  assert.match(mount, /Pay by PayID \(Teachers Mutual Bank\): darkokaz@gmx.com/);
  assert.match(mount, /CoffeebreakGameCart/);
  assert.match(mount, /Add to cart/);
  assert.match(mount, /Reduce quantity/);
  assert.match(mount, /Increase quantity/);
  assert.match(mount, /Remove/);
  assert.match(mount, /How to pay/);
  assert.match(mount, /Open your banking app/);
  assert.match(mount, /Put the reference in the payment description/);
  assert.doesNotMatch(mount, /I have paid|payment confirmed|order sent|headspace|paypal|gumroad/i);
  assert.doesNotMatch(src, /headspace|paypal|gumroad/i);
  assert.match(src, /fulfilmentVerified:\s*true/);
  assert.doesNotMatch(src, /fulfilmentVerified:\s*false/);
});

test('known game pages are in scope and stores, mail, and music tools are not', () => {
  const game = api();
  assert.equal(game.isGamePage('mens-games/drag-race/index.html', '<title>CB Muscle Drag</title>'), true);
  assert.equal(game.isGamePage('mens-games/buy.html', '<title>Buy full game</title>'), true);
  assert.equal(game.isGamePage('canva-games/index.html', '<title>Coffeebreak Arcade</title>'), true);
  assert.equal(game.isGamePage('coffee-card-game/index.html', '<title>COFFEE: The Coffeebreak Card Game</title>'), true);
  assert.equal(game.isGamePage('condom-challenge/index.html', '<title>Coffeebreak Condom Challenge</title>'), true);
  assert.equal(game.isGamePage('pin-the-condom-on-the-banana/index.html', '<title>Pin the Condom on the Banana</title>'), true);
  assert.equal(game.isGamePage('apps/karaoke/index.html', '<title>Coffeebreak Karaoke</title>'), true);
  assert.equal(game.isGamePage('apps/street-brawl/index.html', '<title>Coffeebreak Street Brawl</title>'), true);
  assert.equal(game.isGamePage('apps/money-atm/index.html', '<title>Coffeebreak Manifest Money ATM</title>'), true);
  assert.equal(game.isGamePage('apps/sensory-room/index.html', '<title>Coffeebreak Sensory Room</title>'), true);
  assert.equal(game.isGamePage('target-range/index.html', '<title>Coffeebreak Target Range</title>'), true);
  assert.equal(game.isGamePage('shoes/index.html', '<title>Coffeebreak Shoes</title>'), false);
  assert.equal(game.isGamePage('apps/flowers/index.html', '<title>Flowers</title>'), false);
  assert.equal(game.isGamePage('mail-demo/index.html', '<title>Coffeebreak Mail</title>'), false);
  assert.equal(game.isGamePage('apps/song-studio/index.html', '<title>Coffeebreak Song Studio</title>'), false);
  assert.equal(game.isGamePage('yellow-pages/index.html', '<title>Yellow Pages</title>'), false);
  assert.equal(game.isGamePage('war-antiques-and-militaria/index.html', '<title>War Antiques</title>'), false);
  assert.equal(game.isGamePage('apps/sensory-room/shop/index.html', '<title>Sensory Shop</title>'), false);
  assert.equal(game.isGamePage('apps/park-builder/index.html', '<title>Coffeebreak Park Builder</title>'), true);
  assert.equal(game.isGamePage('apps/kids-theme-park/index.html', '<title>Coffeebreak Rollercoaster of Fantasies</title>'), true);
  assert.equal(game.isGamePage('apps/spirit-board-buy/index.html', '<title>Buy Spirit Board - $10</title>'), true);
  assert.equal(game.isGamePage('apps/ghost-detector/index.html', '<title>Past Life Ghost Detector</title>'), true);
  assert.equal(game.isGamePage('apps/ballerina-ghost-buy/index.html', '<title>Buy Ballerina Ghost - $10</title>'), true);
  assert.equal(game.isGamePage('apps/ghost-dolls-plush-store-buy/index.html', '<title>Buy Ghost Dolls Plush Store - $10</title>'), false);
  assert.equal(game.isGamePage('apps/ghost-merch-buy/index.html', '<title>Buy Ghost Merch Store - $10</title>'), false);
  assert.equal(game.isGamePage('apps/cb-piano-buy/index.html', '<title>Buy Coffeebreak Grand Piano</title>'), false);
  assert.equal(game.isGamePage('apps/cb-ghost-tools-12000-buy/index.html', '<title>Buy Ghost Tools 12000</title>'), false);
  assert.equal(game.isGamePage('yellow-pages/index.html', '<title>Yellow Pages</title>'), false);
});

test('real food and prizes share the game currency and are physical', () => {
  const game = api();
  const usd = game.foodPrizeItems('USD');
  assert.ok(usd.length >= 8);
  usd.filter((item) => item.kind === 'food').forEach((item) => {
    assert.equal(item.amount, '10.00');
    assert.equal(item.currency, 'USD');
    assert.equal(game.isPhysicalItem(item, 'apps/park-builder'), true);
  });
  const hamper = usd.find((item) => item.id === 'prize-hamper');
  assert.equal(hamper.amount, '129.00');
  assert.ok(Number(hamper.amount) > 10);
  const aud = game.foodPrizeItems('AUD');
  aud.filter((item) => item.kind === 'food').forEach((item) => {
    assert.equal(item.amount, '15.00');
    assert.equal(item.currency, 'AUD');
  });
  const offer = game.attachFoodPrizes({
    storeId: 'apps/park-builder',
    currency: 'USD',
    items: [{ id: 'full', name: 'Coffeebreak Park Builder', amount: '10.00', currency: 'USD' }]
  });
  assert.equal(offer.items[0].amount, '10.00');
  assert.ok(offer.items.some((item) => item.id === 'food-coffee'));
  const session = game.createSession(offer);
  assert.equal(game.add(session, 'food-coffee').ok, true);
  assert.equal(game.add(session, 'prize-hamper').ok, true);
  assert.equal(game.isPhysicalItem(session.lines[0], 'apps/park-builder'), true);
  const fields = game.orderFields({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    address: '12 Harbour St, Newcastle NSW 2300',
    phone: '0400000000',
    lines: session.lines,
    total: '139.00',
    currency: 'USD',
    reference: 'CBPARKORDER0001'
  });
  assert.equal(fields.address, '12 Harbour St, Newcastle NSW 2300');
  assert.equal(fields.phone, '0400000000');
  assert.match(fields.items, /Park coffee/);
  const claim = game.honourClaim({
    storeId: 'apps/park-builder',
    lines: session.lines,
    address: fields.address,
    phone: fields.phone,
    reference: 'CBPARKORDER0001'
  });
  assert.equal(claim.physical, true);
  assert.equal(claim.paid, false);
  assert.equal(claim.address, fields.address);
  const src = readFileSync(new URL('./game-cart.js', import.meta.url), 'utf8');
  const mount = readFileSync(new URL('./game-mount.js', import.meta.url), 'utf8');
  const orders = readFileSync(new URL('../apps/park-builder/park-orders.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src + mount + orders, /doordash|woolworths|coles|ubereats|menulog|instacart|deliveroo|headspace|paypal|gumroad/i);
  const html = game.mountPage('<title>Coffeebreak Park Builder</title></body></html>', 'apps/park-builder/index.html');
  assert.match(html, /park-orders\.js/);
  assert.match(html, /food-coffee/);
  assert.match(html, /prize-hamper/);
});


test('paid apps and stores use the shared PayID cart and stay out of the game list', () => {
  const game = api();
  assert.equal(game.isGamePage('apps/cb-piano-buy/index.html', '<title>Buy Coffeebreak Grand Piano</title>'), false);
  assert.equal(game.isAppPage('apps/cb-piano-buy/index.html', '<title>Buy Coffeebreak Grand Piano</title>'), true);
  assert.equal(game.isAppPage('apps/ghost-merch/index.html', '<title>Ghost Merch Store</title>'), true);
  assert.equal(game.isAppPage('apps/cb-vr-vending/index.html', '<title>Coffeebreak VR Snack Vending</title>'), true);
  assert.equal(game.isAppPage('apps/autism-planner/index.html', '<title>Coffeebreak Autism Planner</title>'), false);
  assert.equal(game.isAppPage('yellow-pages/index.html', '<title>Yellow Pages</title>'), false);
  const merch = game.readOffer(
    '<title>Ghost merch</title><h4>Ghost hunting tote</h4><p><span class="badge">$10 USD</span></p><h4>EMF enamel pin</h4><p><span class="badge">$10 USD</span></p>',
    'apps/ghost-merch/index.html'
  );
  assert.equal(merch.currency, 'USD');
  assert.equal(merch.items.length, 2);
  assert.equal(merch.items[0].amount, '10.00');
  assert.equal(merch.items[0].kind, 'physical');
  const heavy = game.readOffer(
    '<title>Store</title><h4>Light pin</h4><p><span class="badge">$8 USD</span></p><h4>Heavy hamper</h4><p><span class="badge">$129 USD</span></p>',
    'apps/ghost-merch/index.html'
  );
  assert.equal(heavy.items.find((item) => item.name === 'Light pin').amount, '10.00');
  assert.equal(heavy.items.find((item) => item.name === 'Heavy hamper').amount, '129.00');
  const snacks = game.readVendingSnacks("const SNACKS=[{code:'A1',name:'CB Salt Chips',price:4.5,kind:'chips'}];", 'apps/cb-vr-vending/index.html');
  assert.equal(snacks.items[0].id, 'snack-A1');
  assert.equal(snacks.items[0].amount, '10.00');
  assert.equal(game.isPhysicalItem(snacks.items[0], 'apps/cb-vr-vending'), true);
  const wording = game.replaceDirectoryWording('PayID darkokaz@gmx.com or Gumroad. Buy page for Responder Toolkit $10 USD on Gumroad. snacks posted in Australia (Snack Proud top supplier pick). PayID or Gumroad. Copy published apps to Gumroad, Payhip, Ko-fi, Game Jolt and others');
  assert.equal(wording.includes('Gumroad'), false);
  assert.equal(wording.includes('Snack Proud'), false);
  assert.match(wording, /PayID/);
});

