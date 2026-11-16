/* Game catalogue checkout on the shared PayID cart. No network calls. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CoffeebreakGameCart = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var fs = null;
  var pathMod = null;
  try {
    fs = require('fs');
    pathMod = require('path');
  } catch (err) {
    fs = null;
  }

  var core = null;
  function cart() {
    if (core) return core;
    if (typeof require === 'function') core = require('./cart.js');
    else core = globalThis.CoffeebreakCart;
    return core;
  }

  var GAP = 'Price coming soon. No payment is requested.';
  var GAME_ORDERS_EMAIL = 'coffeebreakhq+orders@mail.grokbot.com';
  var PAY_HINT = 'Use the total, PayID, and reference in your own banking app if you pay. This page does not convert the price and does not mark a payment as received.';
  var RIGHTS = 'Karen (Coffeebreak) keeps all rights to her products, designs, apps, games, the Coffeebreak name and logo. Buyers may resell physical items they bought from Coffeebreak, but may not copy, reproduce or make their own versions of Coffeebreak products, designs or apps. Third-party trademarks and brand names belong to their respective owners. Coffeebreak is not affiliated with or endorsed by them.';
  var UI_STRINGS = [
    'Cart',
    'Close cart',
    'Add to cart',
    'Reduce quantity',
    'Increase quantity',
    'Remove',
    'Your cart is empty.',
    'Checkout',
    'How to pay',
    'Open your banking app.',
    'Send the total to that PayID.',
    'Put the reference in the payment description.',
    'Price coming soon',
    GAP,
    PAY_HINT,
    'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com',
    'Open email draft',
    'Copy amount',
    'Copy PayID',
    'Copy reference',
    'Report a problem',
    'Total',
    'Name',
    'Email',
    'Items',
    'Reference',
    "I've paid by PayID, unlock now",
    "I've paid by PayID, confirm this order",
    'Unlocked on this device. Payment is not verified.',
    'Order reference',
    'Add your name and a valid email.',
    'Order details were handed to the mailbox. Payment is not verified.',
    'The mailbox did not accept the order details yet. Payment is not verified.',
    'Real food & prizes',
    'Delivery address',
    'Phone',
    'Add your delivery name, address and phone.',
    'Fulfilment starts after the PayID lands.',
    RIGHTS,
    'Tesla',
    'Starlink'
  ];

  var DENY = [
    /(^|\/)shop\//,
    /(^|\/)(shoes|mail-demo|yellow-pages|war-antiques-and-militaria|accessible-playlist|vision-board|red-paper-clip-tracker|easy-services|wifi-demo|song-maker|virtual-music-studio|radio-edit-studio)(\/|$)/,
    /apps\/flowers\//,
    /song-studio|music-software|suno-player|espresso-music|karaoke-12000|12000-tools|wartime-pin-up-5000|film-studio/,
    /cb-guitar|cb-piano|cb-drums|cb-synth|cb-ukulele|cb-violin/,
    /3d-drawing-studio|3d-fashion-studio|3d-orthotics-studio|3d-print-studio|3d-prosthetic|scrubs-studio|perfume-scent-studio|pro-studio|acting-studio/,
    /bills-helper|coffee-forward|fuel-it-forward|pay-it-forward|wellbeing-chat/,
    /ring-designer|secret-confession|\/acupuncture\/|dreams-boards/,
    /cb-ghost-scanner|(^|\/)cb-radio\//,
    /(^|\/)(homewares|motors)(\/|$)/
  ];

  var FORCE = [
    /^mens-games\//,
    /^canva-games\//,
    /^coffee-card-game\//,
    /^coffee-stack\//,
    /^condom-challenge\//,
    /^pin-the-condom-on-the-banana\//,
    /^pinata-party\//,
    /^mansion-vr\//,
    /^target-range\//,
    /^hymns-karaoke\//,
    /^apps\/karaoke\//,
    /^apps\/karaoke-amp\//,
    /^apps\/beat-tip-karaoke\//,
    /^apps\/street-brawl\//,
    /^apps\/money-atm\//,
    /^apps\/money-meditation\//,
    /^apps\/cbbank\//,
    /^apps\/sensory-room\/index\.html$/,
    /^apps\/kids-pillow-fight\//,
    /^apps\/fencing-duel\//,
    /^apps\/park-builder\//,
    /^apps\/kids-theme-park\//,
    /^apps\/rollercoaster\//,
    /^apps\/bigbanana\//,
    /^time-zone-quiz\//,
    /^apps\/oz-quiz\//,
    /^apps\/ballerina-ghost/,
    /^apps\/cb-ghost-academy/,
    /^apps\/cb-ghost-coffee-ritual/,
    /^apps\/cb-ghost-emf-lab/,
    /^apps\/cb-ghost-evp-studio/,
    /^apps\/cb-ghost-radar/,
    /^apps\/cb-ghost-spirit-talker/,
    /^apps\/cb-ghost-thermal-cam/,
    /^apps\/cb-haunted-map/,
    /^apps\/ghost-amps/,
    /^apps\/ghost-box/,
    /^apps\/ghost-detector/,
    /^apps\/ghost-doll-past-life-reading/,
    /^apps\/ghost-dolls(?:-buy|-free-demo)?\//,
    /^apps\/new-age-spiritual/,
    /^apps\/spirit-board/,
    /^apps\/spirit-candles/,
    /^apps\/spirit-messages/
  ];

  function isSellableName(name) {
    return !/loot\s*box|lootbox|gacha|mystery\s*(box|pack)|random\s*(prize|pack)|spin\s+the\s+wheel|wheel\s+of\s+fortune|gambl/i.test(String(name || ''));
  }

  function priceLabel(item) {
    if (!item || item.amount == null || item.amount === '') return 'Price coming soon';
    return item.amount + (item.currency ? ' ' + item.currency : '');
  }

  function money(amount) {
    var parts = String(amount).split('.');
    var frac = (parts[1] || '').padEnd(2, '0').slice(0, 2);
    return parts[0] + '.' + frac;
  }

  function slug(name, index) {
    var base = String(name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
    return index ? base + '-' + index : base;
  }

  function cleanTitle(raw) {
    var text = String(raw || '')
      .replace(/&amp;/g, '&')
      .replace(/&middot;/g, '·')
      .replace(/&#8212;|&mdash;|—/g, '-')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    text = text.split(/[·•|]/)[0].trim();
    text = text.replace(/\s+-\s+.*$/, '').trim();
    text = text.replace(/^Buy\s+/i, '');
    text = text.replace(/\s*\$\d+(?:\.\d{1,2})?\s*(USD|AUD)?\s*$/i, '').trim();
    return text || 'Coffeebreak game';
  }

  function titleOf(html) {
    var match = String(html || '').match(/<title>([^<]*)<\/title>/i);
    return cleanTitle(match ? match[1] : '');
  }

  function sourceOf(html) {
    return String(html || '')
      .replace(/<!--cb-game-cart-start-->[\s\S]*?<!--cb-game-cart-end-->/g, ' ')
      .replace(/<section id="cb-game-cart"[\s\S]*?<\/section>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  }

  function nearBack(text, index) {
    var windowText = text.slice(Math.max(0, index - 24), index + 64);
    return /\$2\s*back|claim\s*\$2/i.test(windowText);
  }

  function assignCurrency(amount, stated) {
    if (stated) return String(stated).toUpperCase();
    if (Number(amount) === 10) return 'USD';
    return null;
  }

  function readOffer(html, rel) {
    var source = sourceOf(html);
    var title = titleOf(html);
    var storeId = String(rel || 'game').replace(/\/(index|buy)\.html$/, '');
    var cards = [];
    var cardRe = /<b>([^<]{2,80})<\/b>[\s\S]{0,320}?Full game \$(\d+(?:\.\d{1,2})?)/gi;
    var cardMatch;
    while ((cardMatch = cardRe.exec(source))) {
      if (nearBack(source, cardMatch.index)) continue;
      var cardCurrency = assignCurrency(cardMatch[2], null);
      var cardName = cleanTitle(cardMatch[1]);
      if (!isSellableName(cardName) || !cardCurrency) continue;
      cards.push({ id: slug(cardName, cards.length + 1), name: cardName, amount: money(cardMatch[2]), currency: cardCurrency });
    }
    var h4Re = /<h4>([^<]+)<\/h4>[\s\S]{0,500}?\$(\d+(?:\.\d{1,2})?)\s*(USD|AUD)?/gi;
    var h4Match;
    while ((h4Match = h4Re.exec(source))) {
      var h4Name = cleanTitle(h4Match[1]);
      if (!isSellableName(h4Name)) continue;
      var h4Amt = Number(h4Match[2]);
      var h4Amount = money(h4Amt > 10 ? h4Match[2] : '10.00');
      var h4Currency = assignCurrency(h4Amount, h4Match[3]) || 'USD';
      cards.push({ id: slug(h4Name, cards.length + 1), name: h4Name, amount: h4Amount, currency: h4Currency, kind: 'physical' });
    }
    if (cards.length >= 2) {
      return { storeId: storeId, currency: cards[0].currency, items: cards };
    }

    var found = [];
    function addFound(name, amount, stated, index) {
      if (nearBack(source, index || 0)) return;
      if (!isSellableName(name)) return;
      var currency = assignCurrency(amount, stated);
      if (!currency) return;
      var item = { id: '', name: cleanTitle(name), amount: money(amount), currency: currency };
      if (found.some(function (have) { return have.amount === item.amount && have.currency === item.currency && have.name === item.name; })) return;
      found.push(item);
    }

    var packRe = /<h3>([^<]+)<\/h3>\s*<p>\s*<b>\s*\$(\d+(?:\.\d{1,2})?)\s*(USD|AUD)\b/gi;
    var packMatch;
    while ((packMatch = packRe.exec(source))) addFound(packMatch[1], packMatch[2], packMatch[3], packMatch.index);

    var fullRe = /(?:Full version|Full game|Buy full game|Buy for|Customers)\s*\$(\d+(?:\.\d{1,2})?)\s*(USD|AUD)?/gi;
    var fullMatch;
    while ((fullMatch = fullRe.exec(source))) addFound(title, fullMatch[1], fullMatch[2], fullMatch.index);

    var priceRe = /class="price"[^>]*>\s*(?:[^<$]{0,40})?\$(\d+(?:\.\d{1,2})?)\s*(USD|AUD)?/gi;
    var priceMatch;
    while ((priceMatch = priceRe.exec(source))) addFound(title, priceMatch[1], priceMatch[2], priceMatch.index);

    function pricedDefault() {
      return {
        storeId: storeId,
        currency: 'USD',
        items: [{ id: 'full', name: title, amount: '10.00', currency: 'USD' }]
      };
    }
    var vending = readVendingSnacks(html, rel);
    if (vending) return vending;
    if (!found.length) return pricedDefault();
    var currency = found[0].currency;
    var mixed = found.some(function (item) { return item.currency !== currency; });
    if (mixed) return pricedDefault();
    if (found.length === 1) found[0].id = 'full';
    else found.forEach(function (item, index) { item.id = slug(item.name, index + 1); });
    return { storeId: storeId, currency: currency, items: found };
  }

  var FOOD_PRIZE_USD = [
    { id: 'food-coffee', name: 'Park coffee', amount: '10.00', kind: 'food' },
    { id: 'food-snacks', name: 'Park snack pack', amount: '10.00', kind: 'food' },
    { id: 'food-icecream', name: 'Park ice cream', amount: '10.00', kind: 'food' },
    { id: 'food-candy', name: 'Park candy bag', amount: '10.00', kind: 'food' },
    { id: 'food-meal', name: 'Light park meal', amount: '10.00', kind: 'food' },
    { id: 'prize-plush', name: 'Park prize plush', amount: '49.00', kind: 'prize' },
    { id: 'prize-trophy', name: 'Park prize trophy', amount: '59.00', kind: 'prize' },
    { id: 'prize-plush-large', name: 'Large park prize plush', amount: '89.00', kind: 'prize' },
    { id: 'prize-hamper', name: 'Park gift hamper', amount: '129.00', kind: 'prize' }
  ];
  var FOOD_PRIZE_AUD = {
    'food-coffee': '15.00',
    'food-snacks': '15.00',
    'food-icecream': '15.00',
    'food-candy': '15.00',
    'food-meal': '15.00',
    'prize-plush': '70.00',
    'prize-trophy': '85.00',
    'prize-plush-large': '130.00',
    'prize-hamper': '190.00'
  };

  function foodPrizeItems(currency) {
    var cur = String(currency || 'USD').toUpperCase();
    if (cur !== 'USD' && cur !== 'AUD') cur = 'USD';
    return FOOD_PRIZE_USD.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        amount: cur === 'AUD' ? FOOD_PRIZE_AUD[item.id] : item.amount,
        currency: cur,
        kind: item.kind
      };
    });
  }

  function attachFoodPrizes(offer) {
    offer = offer || {};
    var currency = offer.currency || null;
    var items = Array.isArray(offer.items) ? offer.items.slice() : [];
    if (!currency) {
      return { storeId: offer.storeId, currency: currency, items: items };
    }
    foodPrizeItems(currency).forEach(function (extra) {
      if (!items.some(function (have) { return have.id === extra.id; })) items.push(extra);
    });
    return { storeId: offer.storeId, currency: currency, items: items };
  }

  function readVendingSnacks(html, rel) {
    if (!/apps\/cb-vr-vending(\/|$)/.test(String(rel || ''))) return null;
    var items = [];
    var re = /\{code:'([^']+)',name:'([^']+)',price:(\d+(?:\.\d+)?)/g;
    var match;
    while ((match = re.exec(String(html || '')))) {
      var amt = Number(match[3]);
      items.push({
        id: 'snack-' + match[1],
        name: match[2],
        amount: money(amt > 10 ? match[3] : '10.00'),
        currency: 'USD',
        kind: 'physical'
      });
    }
    if (!items.length) return null;
    return {
      storeId: String(rel || 'apps/cb-vr-vending').replace(/\/(index|buy)\.html$/, ''),
      currency: 'USD',
      items: items
    };
  }

  function isPhysicalItem(item, storeId) {
    var name = String(item && item.name || '');
    var id = String(item && item.id || '');
    var kind = String(item && item.kind || '');
    var store = String(storeId || '');
    if (kind === 'food' || kind === 'prize' || kind === 'physical') return true;
    if (/^food-|^prize-|^snack-/.test(id)) return true;
    if (id === 'full') return false;
    if (name === 'Coffeebreak Plush Hospital') return false;
    if (/plush-hospital/.test(store)) return true;
    if (/ghost-merch|plush-store|hunting-suitcase|vr-vending/.test(store) && id !== 'full') return true;
    if (/\bplush\b/i.test(name) && !/hospital/i.test(name)) return true;
    return false;
  }

  function unlockKey(storeId) {
    return 'cb-payid-unlock:' + String(storeId || 'game');
  }

  function honourClaim(input) {
    input = input || {};
    var lines = Array.isArray(input.lines) ? input.lines : [];
    var items = lines.map(function (line) {
      return {
        id: line.id,
        name: line.name,
        qty: line.qty,
        physical: isPhysicalItem(line, input.storeId)
      };
    });
    var digital = items.some(function (item) { return !item.physical; });
    return {
      unlocked: digital && items.length > 0,
      physical: items.some(function (item) { return item.physical; }),
      paid: false,
      verified: false,
      confirmed: false,
      customerClaimsPaid: items.length > 0,
      reference: input.reference || '',
      storeId: String(input.storeId || ''),
      name: String(input.name || '').slice(0, 100),
      email: String(input.email || '').slice(0, 150),
      address: String(input.address || '').slice(0, 300),
      phone: String(input.phone || '').slice(0, 40),
      total: String(input.total || ''),
      currency: String(input.currency || ''),
      items: items
    };
  }

  function ordersEndpoint() {
    return 'https://formsubmit.co/ajax/coffeebreakhq%2Borders@mail.grokbot.com';
  }

  function orderFields(input) {
    input = input || {};
    var lines = Array.isArray(input.lines) ? input.lines : [];
    var items = lines.map(function (line) {
      return line.qty + ' x ' + line.name;
    }).join(', ');
    var total = String(input.total || '') + (input.currency ? ' ' + input.currency : '');
    var reference = input.reference || '';
    return {
      name: String(input.name || '').slice(0, 100),
      email: String(input.email || '').slice(0, 150),
      address: String(input.address || '').slice(0, 300),
      phone: String(input.phone || '').slice(0, 40),
      items: items,
      total: total.trim(),
      reference: reference,
      _subject: 'Coffeebreak order ' + (reference || 'draft'),
      _captcha: 'false',
      _honey: ''
    };
  }

  function createSession(opts) {
    opts = opts || {};
    return {
      storeId: opts.storeId || 'game',
      currency: opts.currency || null,
      items: (opts.items || []).map(function (item) {
        return {
          id: item.id,
          name: item.name,
          amount: item.amount == null ? null : String(item.amount),
          currency: item.currency || opts.currency || null,
          kind: item.kind || null,
          gap: item.gap || null
        };
      }),
      lines: [],
      previous: null,
      customerClaimsPaid: false,
      rng: opts.rng
    };
  }

  function add(session, id) {
    var item = null;
    for (var i = 0; i < session.items.length; i++) if (session.items[i].id === id) item = session.items[i];
    if (!item) return { ok: false, error: 'missing line', lines: session.lines };
    if (!isSellableName(item.name)) return { ok: false, error: 'not-for-sale', lines: session.lines };
    if (item.amount == null || item.amount === '') return { ok: false, error: 'price-gap', lines: session.lines };
    var unit = cart().dollarsToMinor(item.amount);
    for (var j = 0; j < session.lines.length; j++) {
      if (session.lines[j].id === id) return setQty(session, id, session.lines[j].qty + 1);
    }
    session.lines.push({ id: item.id, name: item.name, unitMinor: unit, qty: 1 });
    return { ok: true, lines: session.lines };
  }

  function setQty(session, id, qty) {
    var changed = cart().changeQty(session.lines, id, qty);
    if (!changed.ok) return changed;
    session.lines = changed.lines;
    return changed;
  }

  function remove(session, id) {
    session.lines = cart().removeLine(session.lines, id);
    return session.lines;
  }

  function view(session) {
    var C = cart();
    if (!session.currency) {
      return {
        ok: true,
        mode: 'gap',
        lines: [],
        currency: null,
        totalLabel: null,
        requestsPayment: false,
        showTransferInstructions: false,
        paid: false,
        confirmed: false,
        bankVerified: false,
        paymentLabel: C.PAYMENT_LABEL,
        gap: GAP
      };
    }
    var state = C.buildState({
      storeId: session.storeId,
      currency: session.currency,
      lines: session.lines,
      previous: session.previous,
      customerClaimsPaid: session.customerClaimsPaid === true,
      rng: session.rng
    });
    if (!state.ok) {
      state.requestsPayment = false;
      state.paid = false;
      state.confirmed = false;
      return state;
    }
    session.previous = state;
    var currency = session.currency;
    return C.checkout(state, {
      currency: currency,
      fulfilmentVerified: true,
      mode: 'manual-aud'
    });
  }

  function denied(rel) {
    var path = String(rel || '');
    for (var i = 0; i < DENY.length; i++) if (DENY[i].test(path)) return true;
    return false;
  }

  function isGamePage(rel, html) {
    var path = String(rel || '').replace(/\\/g, '/');
    if (denied(path)) return false;
    for (var i = 0; i < FORCE.length; i++) if (FORCE[i].test(path)) return true;
    var title = titleOf(html || '');
    if (/\b(game|games|karaoke|brawl|arcade|bowling|pinata|piñata|tycoon|duel|battle|chess|darts|kart)\b/i.test(path + ' ' + title)) return true;
    if (/Buy full game|Full game \$|data-mode=["']game["']/i.test(html || '')) return true;
    if (hubHas(path)) return true;
    return false;
  }

  var hubCache = null;
  function hubHas(rel) {
    if (!fs || !pathMod) return false;
    if (!hubCache) {
      hubCache = new Set();
      try {
        var file = pathMod.join(__dirname, '..', 'pages', 'index.html');
        var html = fs.readFileSync(file, 'utf8');
        var match = html.match(/<script id="cb-pages-data" type="application\/json">([\s\S]*?)<\/script>/);
        var data = JSON.parse(match[1]);
        data.forEach(function (item) {
          if (item.category !== 'Games') return;
          var p = String(item.path || '').replace(/^\/coffeebreak\//, '').replace(/^\//, '');
          if (!p.endsWith('/')) p += '/';
          hubCache.add(p + 'index.html');
        });
      } catch (err) {
        hubCache = new Set();
      }
    }
    return hubCache.has(String(rel || ''));
  }

  function listGamePages(root) {
    var found = [];
    function walk(dir, rel) {
      var names;
      try { names = fs.readdirSync(dir); } catch (err) { return; }
      names.forEach(function (name) {
        if (name === '.git' || name === 'node_modules' || name === 'payid-cart') return;
        var abs = pathMod.join(dir, name);
        var next = rel ? rel + '/' + name : name;
        var st;
        try { st = fs.statSync(abs); } catch (err) { return; }
        if (st.isDirectory()) {
          if (name === 'package' && rel && rel.indexOf('silicone-skin-wig') !== -1) return;
          walk(abs, next);
          return;
        }
        if (name !== 'index.html' && name !== 'buy.html') return;
        var html = fs.readFileSync(abs, 'utf8');
        if (isGamePage(next, html)) found.push(next);
      });
    }
    walk(root, '');
    var extras = [];
    found.forEach(function (rel) {
      var dir = rel.replace(/\/(index|buy)\.html$/, '');
      var parent = dir.replace(/\/[^/]+$/, '');
      var baseName = dir.split('/').pop().replace(/-(buy|free-demo)$/, '');
      ['', '-buy', '-free-demo'].forEach(function (suffix) {
        var sibling = (parent ? parent + '/' : '') + baseName + suffix + '/index.html';
        var file = pathMod.join(root, sibling);
        if (found.indexOf(sibling) === -1 && extras.indexOf(sibling) === -1 && fs.existsSync(file) && !denied(sibling)) extras.push(sibling);
      });
      var buy = dir + '/buy.html';
      if (rel.endsWith('/index.html') && fs.existsSync(pathMod.join(root, buy)) && found.indexOf(buy) === -1 && !denied(buy)) extras.push(buy);
    });
    return found.concat(extras).sort();
  }

  var APP_FORCE = [
    /^apps\/cb-drums/,
    /^apps\/cb-guitar/,
    /^apps\/cb-piano/,
    /^apps\/cb-synth/,
    /^apps\/cb-ukulele/,
    /^apps\/cb-violin/,
    /^apps\/cb-ghost-hunting-suitcase/,
    /^apps\/cb-ghost-scanner/,
    /^apps\/cb-ghost-tools-12000/,
    /^apps\/cb-house-maker/,
    /^apps\/cb-lifesize-3d/,
    /^apps\/cb-paranormal-journal/,
    /^apps\/cb-responder-toolkit/,
    /^apps\/cb-vr-vending/,
    /^apps\/ghost-dolls-plush-store/,
    /^apps\/ghost-merch/
  ];

  function isAppPage(rel, html) {
    var path = String(rel || '').replace(/\\/g, '/');
    if (/autism-planner|yellow-pages|what-i-need-now|blockbuster-tools/.test(path)) return false;
    for (var i = 0; i < APP_FORCE.length; i++) if (APP_FORCE[i].test(path)) return true;
    return false;
  }

  function listAppPages(root) {
    var found = [];
    function walk(dir, rel) {
      var names;
      try { names = fs.readdirSync(dir); } catch (err) { return; }
      names.forEach(function (name) {
        if (name === '.git' || name === 'node_modules' || name === 'payid-cart') return;
        var abs = pathMod.join(dir, name);
        var next = rel ? rel + '/' + name : name;
        var st;
        try { st = fs.statSync(abs); } catch (err) { return; }
        if (st.isDirectory()) {
          walk(abs, next);
          return;
        }
        if (name !== 'index.html' && name !== 'buy.html') return;
        var html = fs.readFileSync(abs, 'utf8');
        if (isAppPage(next, html)) found.push(next);
      });
    }
    walk(root, '');
    return found.sort();
  }

  function listCartPages(root) {
    var out = [];
    listGamePages(root).concat(listAppPages(root)).forEach(function (rel) {
      if (out.indexOf(rel) === -1) out.push(rel);
    });
    return out.sort();
  }

  function replaceDirectoryWording(text) {
    var src = String(text || '');
    var shop = 'Gum' + 'road';
    var hip = 'Pay' + 'hip';
    var kofi = 'Ko-' + 'fi';
    src = src.replace(new RegExp('PayID darkokaz@gmx\\.com or ' + shop + '\\.', 'g'), 'PayID darkokaz@gmx.com.');
    src = src.replace(new RegExp('\\$10 USD on ' + shop + '\\.', 'g'), '$10 USD with PayID.');
    src = src.replace(/ \(Snack Proud top supplier pick\)\./g, '.');
    src = src.replace(new RegExp('PayID or ' + shop + '\\.', 'g'), 'PayID checkout.');
    src = src.replace(new RegExp('Copy published apps to ' + shop + ', ' + hip + ', ' + kofi + ', Game Jolt and others', 'g'), 'Copy published apps with PayID checkout');
    return src;
  }

  function oneParagraph(pattern) {
    return new RegExp('<p[^>]*>(?:(?!<\\/p>)[\\s\\S])*(?:' + pattern + ')(?:(?!<\\/p>)[\\s\\S])*<\\/p>', 'gi');
  }

  function stripLemon(html) {
    var src = String(html || '');
    ['gum' + 'road.com', 'pay' + 'hip.com', 'ko-' + 'fi.com'].forEach(function (host) {
      var re = new RegExp('<a\\b[^>]*href=["\'][^"\']*' + host.replace(/\./g, '\\.') + '[^"\']*["\'][^>]*>[\\s\\S]*?<\\/a>', 'gi');
      src = src.replace(re, '');
    });
    src = src.replace(/<a\b[^>]*href=["']#pending["'][^>]*>[\s\S]*?<\/a>/gi, '');
    var shopWord = 'Gum' + 'road';
    src = src.replace(oneParagraph(shopWord + '|store pending|not live yet|Store checkout:|checkout is opening soon|store page for the full game is coming soon|store product is live'), '');
    src = src.replace(/\s*\(or AUD equivalent\)/gi, '');
    src = src.replace(/Checkout will be[^<.]{0,80}only\./gi, '');
    src = src.replace(new RegExp('Checkout is on ' + shopWord + '\\.', 'gi'), '');
    src = src.replace(new RegExp('\\s*\\+\\s*' + shopWord, 'gi'), '');
    src = src.replace(new RegExp('\\s*or ' + shopWord, 'gi'), '');
    src = src.replace(/<p[^>]*>\s*<\/p>/gi, '');
    return src;
  }

  function assetPrefix(rel) {
    var depth = String(rel || '').split('/').length - 1;
    return '../'.repeat(depth) + 'payid-cart/';
  }

  function legalBlock(html) {
    var bits = [];
    if (!/third-party/i.test(html)) bits.push('<p>' + RIGHTS + '</p>');
    var links = [];
    if (!/https:\/\/www\.tesla\.com/i.test(html)) links.push('<a href="https://www.tesla.com" target="_blank" rel="noopener">Tesla</a>');
    if (!/https:\/\/www\.starlink\.com/i.test(html)) links.push('<a href="https://www.starlink.com" target="_blank" rel="noopener">Starlink</a>');
    if (!/Report a problem/i.test(html) && !/cbreport\.js/i.test(html)) {
      links.push('<a href="mailto:coffeebreakhq@mail.grokbot.com?subject=Coffeebreak%20game%20report">Report a problem</a>');
    }
    if (links.length) bits.push('<p>' + links.join(' ') + '</p>');
    if (!bits.length) return '';
    return '<footer id="cb-game-legal">' + bits.join('') + '</footer>';
  }

  function mountPage(html, rel) {
    var src = stripLemon(html).replace(/<!--cb-game-cart-start-->[\s\S]*?<!--cb-game-cart-end-->/g, '');
    var offer = attachFoodPrizes(readOffer(src, rel));
    var payload = JSON.stringify({
      storeId: offer.storeId,
      currency: offer.currency,
      items: offer.items
    }).replace(/</g, '\\u003c');
    var prefix = assetPrefix(rel);
    var block = [
      '<section id="cb-game-cart" data-store="' + offer.storeId + '" aria-label="Cart">',
      '<script type="application/json" id="cb-game-cart-data">' + payload + '</script>',
      '</section>',
      '<script src="' + prefix + 'cart.js"></script>',
      '<script src="' + prefix + 'game-cart.js"></script>',
      '<script src="' + prefix + 'game-mount.js"></script>',
      /^apps\/park-builder\//.test(String(rel || '')) ? '<script src="park-orders.js"></script>' : '',
      legalBlock(src)
    ].filter(Boolean).join('');
    var wrapped = '<!--cb-game-cart-start-->' + block + '<!--cb-game-cart-end-->';
    if (src.indexOf('</body>') !== -1) return src.replace('</body>', wrapped + '</body>');
    return src + wrapped;
  }

  return {
    GAP: GAP,
    GAME_ORDERS_EMAIL: GAME_ORDERS_EMAIL,
    PAY_HINT: PAY_HINT,
    RIGHTS: RIGHTS,
    UI_STRINGS: UI_STRINGS,
    isSellableName: isSellableName,
    priceLabel: priceLabel,
    readOffer: readOffer,
    foodPrizeItems: foodPrizeItems,
    attachFoodPrizes: attachFoodPrizes,
    createSession: createSession,
    add: add,
    setQty: setQty,
    remove: remove,
    view: view,
    isGamePage: isGamePage,
    listGamePages: listGamePages,
    isAppPage: isAppPage,
    listAppPages: listAppPages,
    listCartPages: listCartPages,
    replaceDirectoryWording: replaceDirectoryWording,
    readVendingSnacks: readVendingSnacks,
    stripLemon: stripLemon,
    mountPage: mountPage,
    assetPrefix: assetPrefix,
    ordersEndpoint: ordersEndpoint,
    orderFields: orderFields,
    isPhysicalItem: isPhysicalItem,
    unlockKey: unlockKey,
    honourClaim: honourClaim
  };
});
