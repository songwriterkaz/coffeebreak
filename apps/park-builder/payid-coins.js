/* Park Builder PayID coins. Records stay in this browser. Nothing is marked paid by itself. */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ParkPayIdCoins = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
    else api.mount(document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  var PAYMENT_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var PAYID = 'darkokaz@gmx.com';
  var STORAGE_KEY = 'coffeebreakParkBuilder_payidCoins_v1';
  var PARK_KEY = 'coffeebreakParkBuilder_v1';
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var PACKS = [
    { id: 'pack-100', coins: 100, amount: '1.00', button: '100 coins A$1', amountLabel: 'A$1.00' },
    { id: 'pack-1200', coins: 1200, amount: '10.00', button: '1,200 coins A$10', amountLabel: 'A$10.00' },
    { id: 'pack-6500', coins: 6500, amount: '50.00', button: '6,500 coins A$50', amountLabel: 'A$50.00' }
  ];
  var NOTES = {
    checked: 'Coins are credited once the payment is received and checked.',
    noCash: 'Coins are for in-game use only and have no cash value or refunds to PayID.'
  };
  var PANEL_TITLE = 'Buy coins with PayID';
  var GIFT_TITLE = 'Send coins to a friend';
  var CREDIT_TITLE = 'Credit a reference';

  function packById(id) {
    for (var i = 0; i < PACKS.length; i++) if (PACKS[i].id === id) return PACKS[i];
    return null;
  }

  function emptyBook() {
    return { owner: false, purchases: [] };
  }

  function defaultRng() {
    var cryptoObj = globalThis.crypto;
    if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
      var buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      return buf[0] / 4294967296;
    }
    return Math.random();
  }

  function mint(prefix, rng, attempt) {
    var out = prefix;
    var shift = attempt || 0;
    for (var i = 0; i < 6; i++) {
      var roll = Number(typeof rng === 'function' ? rng() : 0);
      if (Number.isFinite(roll) === false || roll < 0) roll = 0;
      var index = (Math.floor(roll * ALPHABET.length) + shift) % ALPHABET.length;
      if (index < 0) index = 0;
      out += ALPHABET.charAt(index);
    }
    return out;
  }

  function taken(book, field, code) {
    for (var i = 0; i < book.purchases.length; i++) {
      if (book.purchases[i][field] === code) return true;
    }
    return false;
  }

  function mintUnique(book, field, prefix, rng) {
    for (var attempt = 0; attempt < ALPHABET.length; attempt++) {
      var code = mint(prefix, rng, attempt);
      if (taken(book, field, code) === false) return code;
    }
    return mint(prefix, rng, book.purchases.length + ALPHABET.length);
  }

  function cleanPurchase(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var pack = packById(raw.packId);
    if (!pack) return null;
    var reference = String(raw.reference || '').trim().toUpperCase();
    if (/^PB-[A-Z2-9]{6}$/.test(reference) === false) return null;
    var kind = raw.kind === 'gift' ? 'gift' : (raw.kind === 'self' ? 'self' : '');
    if (!kind) return null;
    var friend = String(raw.friend || '').trim().slice(0, 80);
    var giftCode = raw.giftCode == null ? null : String(raw.giftCode).trim().toUpperCase();
    if (kind === 'gift') {
      if (!friend) return null;
      if (!giftCode || /^PBG-[A-Z2-9]{6}$/.test(giftCode) === false) return null;
    } else {
      giftCode = null;
      friend = '';
    }
    var status = 'awaiting_check';
    if (raw.paid !== true && raw.status === 'credited') status = 'credited';
    if (raw.paid !== true && raw.status === 'redeemed' && kind === 'gift') status = 'redeemed';
    return {
      reference: reference,
      giftCode: giftCode,
      packId: pack.id,
      coins: pack.coins,
      amount: pack.amount,
      kind: kind,
      friend: friend,
      status: status,
      paid: false,
      createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
      creditedAt: typeof raw.creditedAt === 'string' ? raw.creditedAt : null,
      redeemedAt: typeof raw.redeemedAt === 'string' ? raw.redeemedAt : null
    };
  }

  function normalizeBook(book) {
    var out = emptyBook();
    if (!book || typeof book !== 'object') return out;
    out.owner = book.owner === true;
    var list = Array.isArray(book.purchases) ? book.purchases : [];
    for (var i = 0; i < list.length; i++) {
      var clean = cleanPurchase(list[i]);
      if (clean) out.purchases.push(clean);
    }
    return out;
  }

  function createPurchase(book, options) {
    options = options || {};
    book = book && Array.isArray(book.purchases) ? book : emptyBook();
    var pack = packById(options.packId);
    if (!pack) return { ok: false, error: 'pack', book: book, purchase: null, coinsAdded: 0 };
    var kind = options.kind === 'gift' ? 'gift' : (options.kind === 'self' ? 'self' : '');
    if (!kind) return { ok: false, error: 'kind', book: book, purchase: null, coinsAdded: 0 };
    var friend = String(options.friend || '').trim().slice(0, 80);
    if (kind === 'gift' && !friend) return { ok: false, error: 'friend', book: book, purchase: null, coinsAdded: 0 };
    var rng = typeof options.rng === 'function' ? options.rng : defaultRng;
    var purchase = {
      reference: mintUnique(book, 'reference', 'PB-', rng),
      giftCode: kind === 'gift' ? mintUnique(book, 'giftCode', 'PBG-', rng) : null,
      packId: pack.id,
      coins: pack.coins,
      amount: pack.amount,
      kind: kind,
      friend: kind === 'gift' ? friend : '',
      status: 'awaiting_check',
      paid: false,
      createdAt: options.now || new Date().toISOString(),
      creditedAt: null,
      redeemedAt: null
    };
    book.purchases.push(purchase);
    return { ok: true, error: '', book: book, purchase: purchase, coinsAdded: 0 };
  }

  function findBy(book, field, code) {
    var wanted = String(code || '').trim().toUpperCase();
    for (var i = 0; i < book.purchases.length; i++) {
      if (book.purchases[i][field] === wanted) return book.purchases[i];
    }
    return null;
  }

  function setOwner(book, on) {
    book.owner = on === true;
    return book;
  }

  function creditReference(book, reference, now) {
    book = book && Array.isArray(book.purchases) ? book : emptyBook();
    if (book.owner !== true) return { ok: false, error: 'owner', book: book, purchase: null, coinsAdded: 0 };
    var found = findBy(book, 'reference', reference);
    if (!found) return { ok: false, error: 'missing', book: book, purchase: null, coinsAdded: 0 };
    if (found.status !== 'awaiting_check') return { ok: false, error: 'already', book: book, purchase: found, coinsAdded: 0 };
    found.status = 'credited';
    found.creditedAt = now || new Date().toISOString();
    found.paid = false;
    return { ok: true, error: '', book: book, purchase: found, coinsAdded: found.kind === 'gift' ? 0 : found.coins };
  }

  function redeemGift(book, code, now) {
    book = book && Array.isArray(book.purchases) ? book : emptyBook();
    var found = findBy(book, 'giftCode', code);
    if (!found) return { ok: false, error: 'missing', book: book, purchase: null, coinsAdded: 0 };
    if (found.status === 'redeemed') return { ok: false, error: 'used', book: book, purchase: found, coinsAdded: 0 };
    if (found.status !== 'credited' || found.kind !== 'gift') return { ok: false, error: 'waiting', book: book, purchase: found, coinsAdded: 0 };
    found.status = 'redeemed';
    found.redeemedAt = now || new Date().toISOString();
    found.paid = false;
    return { ok: true, error: '', book: book, purchase: found, coinsAdded: found.coins };
  }

  function saveBook(storage, book) {
    var safe = normalizeBook(book);
    storage.setItem(STORAGE_KEY, JSON.stringify(safe));
    return safe;
  }

  function loadBook(storage) {
    try {
      var text = storage.getItem(STORAGE_KEY);
      if (!text) return emptyBook();
      return normalizeBook(JSON.parse(text));
    } catch (err) {
      return emptyBook();
    }
  }

  function applyParkCoins(storage, amount, liveState) {
    if (Number.isSafeInteger(amount) === false || amount < 1) return { ok: false, coins: null };
    if (liveState && typeof liveState === 'object' && typeof liveState.coins === 'number') {
      liveState.coins += amount;
      try { storage.setItem(PARK_KEY, JSON.stringify(liveState)); } catch (err) {}
      return { ok: true, coins: liveState.coins };
    }
    var state = null;
    try {
      var raw = JSON.parse(storage.getItem(PARK_KEY) || 'null');
      if (raw && typeof raw === 'object' && Array.isArray(raw) === false) state = raw;
    } catch (err) { state = null; }
    if (!state) state = { coins: 100 };
    if (typeof state.coins !== 'number' || Number.isFinite(state.coins) === false) state.coins = 100;
    state.coins += amount;
    storage.setItem(PARK_KEY, JSON.stringify(state));
    return { ok: true, coins: state.coins };
  }

  function cardView(purchase) {
    var pack = packById(purchase.packId);
    return {
      label: PAYMENT_LABEL,
      amountLabel: pack.amountLabel,
      reference: purchase.reference,
      payId: PAYID,
      copy: { payId: PAYID, amount: pack.amount, reference: purchase.reference },
      copyButtons: ['Copy PayID', 'Copy amount', 'Copy reference']
    };
  }

  function statusText(purchase) {
    if (purchase.status === 'credited' && purchase.kind === 'gift') return 'payment checked, gift code ready to redeem';
    if (purchase.status === 'credited') return 'credited on this device';
    if (purchase.status === 'redeemed') return 'gift code redeemed';
    return 'waiting for the payment to be checked';
  }

  function mount(doc) {
    var section = doc.getElementById('payidCoins');
    if (!section || section.dataset.ready === '1') return;
    section.dataset.ready = '1';
    var storage = null;
    try { storage = root.localStorage; } catch (err) { storage = null; }
    if (!storage) return;

    function book() { return loadBook(storage); }

    function liveState() {
      var game = root.__game;
      return game && game.state ? game.state : null;
    }

    function showCoins(total) {
      var el = doc.getElementById('coins');
      if (el && typeof total === 'number') el.textContent = total + ' coins';
    }

    function give(amount) {
      var added = applyParkCoins(storage, amount, liveState());
      if (added.ok) showCoins(added.coins);
      return added;
    }

    function paintSaved() {
      var el = doc.getElementById('payidSaved');
      if (!el) return;
      var current = book();
      el.replaceChildren();
      if (!current.purchases.length) {
        var empty = doc.createElement('p');
        empty.textContent = 'No references saved in this browser yet.';
        el.appendChild(empty);
        return;
      }
      current.purchases.forEach(function (purchase) {
        var pack = packById(purchase.packId);
        var row = doc.createElement('p');
        var text = purchase.reference + ' · ' + purchase.coins + ' coins · ' + pack.amountLabel + ' · ' + statusText(purchase);
        if (purchase.kind === 'gift') text += ' · gift for ' + purchase.friend + ' · code ' + purchase.giftCode;
        row.textContent = text;
        el.appendChild(row);
      });
    }

    function copyValue(value) {
      if (!value) return;
      if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        root.navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
      } else fallbackCopy(value);
    }

    function fallbackCopy(value) {
      var input = doc.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      doc.body.appendChild(input);
      input.select();
      try { doc.execCommand('copy'); } catch (err) {}
      doc.body.removeChild(input);
    }

    function copyButton(text, value) {
      var button = doc.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.addEventListener('click', function () {
        copyValue(value);
        button.textContent = 'Copied';
        setTimeout(function () { button.textContent = text; }, 1200);
      });
      return button;
    }

    function showCard(purchase) {
      var card = doc.getElementById('payidCard');
      if (!card) return;
      var view = cardView(purchase);
      card.className = 'payid-card';
      card.hidden = false;
      card.replaceChildren();
      var label = doc.createElement('p');
      label.className = 'payid-label';
      label.textContent = view.label;
      var amount = doc.createElement('p');
      amount.textContent = 'Amount: ' + view.amountLabel;
      var ref = doc.createElement('p');
      ref.textContent = 'Reference: ' + view.reference;
      card.append(label, amount, ref, copyButton('Copy PayID', view.copy.payId), copyButton('Copy amount', view.copy.amount), copyButton('Copy reference', view.copy.reference));
      var note = doc.createElement('p');
      note.textContent = NOTES.checked + ' ' + NOTES.noCash;
      card.appendChild(note);
      if (purchase.giftCode) {
        var gift = doc.createElement('p');
        gift.textContent = 'Gift code: ' + purchase.giftCode;
        var share = doc.createElement('p');
        share.textContent = 'Share this gift code. Coins are added when the payment is checked and the friend redeems the code on this device.';
        card.append(gift, share, copyButton('Copy gift code', purchase.giftCode));
      }
    }

    section.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('button[data-pack]') : null;
      if (!button || section.contains(button) === false) return;
      var kind = button.getAttribute('data-kind');
      var friend = '';
      var friendMsg = doc.getElementById('payidFriendMsg');
      if (kind === 'gift') {
        var field = doc.getElementById('payidFriend');
        friend = field ? field.value : '';
      }
      var current = book();
      var made = createPurchase(current, { packId: button.getAttribute('data-pack'), kind: kind, friend: friend });
      if (made.ok === false) {
        if (friendMsg) friendMsg.textContent = 'Enter the friend name or email before choosing a pack.';
        return;
      }
      if (friendMsg) friendMsg.textContent = '';
      saveBook(storage, made.book);
      showCard(made.purchase);
      paintSaved();
    });

    var ownerToggle = doc.getElementById('payidOwnerToggle');
    var ownerBox = doc.getElementById('payidOwnerBox');
    function syncOwner() {
      var current = book();
      if (ownerToggle) ownerToggle.checked = current.owner === true;
      if (ownerBox) ownerBox.hidden = current.owner !== true;
    }
    if (ownerToggle) {
      ownerToggle.addEventListener('change', function () {
        var current = book();
        setOwner(current, ownerToggle.checked === true);
        saveBook(storage, current);
        syncOwner();
      });
    }

    var creditBtn = doc.getElementById('payidCreditBtn');
    if (creditBtn) {
      creditBtn.addEventListener('click', function () {
        var input = doc.getElementById('payidCreditRef');
        var msg = doc.getElementById('payidCreditMsg');
        var current = book();
        var result = creditReference(current, input ? input.value : '');
        saveBook(storage, result.book);
        if (result.ok && result.coinsAdded > 0) give(result.coinsAdded);
        paintSaved();
        if (!msg) return;
        if (result.ok && result.purchase.kind === 'gift') {
          msg.textContent = 'Reference ' + result.purchase.reference + ' credited. Gift code ' + result.purchase.giftCode + ' can now be redeemed on this device.';
        } else if (result.ok) {
          msg.textContent = 'Reference ' + result.purchase.reference + ' credited. ' + result.coinsAdded + ' coins were added for in-game use.';
        } else if (result.error === 'missing') {
          msg.textContent = 'No purchase with that reference is saved in this browser.';
        } else if (result.error === 'already') {
          msg.textContent = 'That reference was already credited.';
        } else {
          msg.textContent = 'Turn on owner tools before crediting a reference.';
        }
      });
    }

    var redeemBtn = doc.getElementById('payidRedeemBtn');
    if (redeemBtn) {
      redeemBtn.addEventListener('click', function () {
        var input = doc.getElementById('payidRedeemCode');
        var msg = doc.getElementById('payidRedeemMsg');
        var current = book();
        var result = redeemGift(current, input ? input.value : '');
        saveBook(storage, result.book);
        if (result.ok && result.coinsAdded > 0) give(result.coinsAdded);
        paintSaved();
        if (!msg) return;
        if (result.ok) msg.textContent = 'Gift code redeemed. ' + result.coinsAdded + ' coins were added for in-game use.';
        else if (result.error === 'used') msg.textContent = 'That gift code was already used.';
        else if (result.error === 'missing') msg.textContent = 'That gift code is not saved in this browser.';
        else msg.textContent = 'That gift code is waiting for the payment to be checked.';
      });
    }

    var coinsBtn = doc.getElementById('bCoins');
    if (coinsBtn) {
      coinsBtn.addEventListener('click', function () {
        var start = doc.getElementById('start');
        var dock = doc.getElementById('payidCoinsDock');
        var playing = start && start.style.display === 'none';
        if (playing === false || !dock) {
          section.scrollIntoView({ block: 'start' });
          return;
        }
        if (section.parentNode !== dock) dock.appendChild(section);
        var panels = doc.querySelectorAll('.panel');
        var open = dock.classList.contains('show');
        for (var i = 0; i < panels.length; i++) panels[i].classList.remove('show');
        if (open === false) dock.classList.add('show');
      });
    }

    syncOwner();
    paintSaved();
  }

  return {
    PAYMENT_LABEL: PAYMENT_LABEL,
    PAYID: PAYID,
    STORAGE_KEY: STORAGE_KEY,
    PARK_KEY: PARK_KEY,
    PACKS: PACKS,
    NOTES: NOTES,
    PANEL_TITLE: PANEL_TITLE,
    GIFT_TITLE: GIFT_TITLE,
    CREDIT_TITLE: CREDIT_TITLE,
    emptyBook: emptyBook,
    createPurchase: createPurchase,
    setOwner: setOwner,
    creditReference: creditReference,
    redeemGift: redeemGift,
    saveBook: saveBook,
    loadBook: loadBook,
    applyParkCoins: applyParkCoins,
    cardView: cardView,
    mount: mount
  };
});
