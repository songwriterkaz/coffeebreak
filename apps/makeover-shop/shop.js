(function () {
  var PRICE = 10;
  var PAY_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var PAYID = 'darkokaz@gmx.com';
  var STORAGE_KEY = 'cb-makeover-shop-cart-v1';
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  var LOOKS = {
    hair: [
      { id: 'waves', emoji: '🌊', name: 'Soft waves' },
      { id: 'bob', emoji: '💇', name: 'Sleek bob' },
      { id: 'braid', emoji: '👑', name: 'Braided crown' },
      { id: 'curls', emoji: '🌀', name: 'Curly volume' },
      { id: 'crop', emoji: '✂️', name: 'Short crop' },
      { id: 'wig', emoji: '🍒', name: 'Cherry wig' }
    ],
    makeup: [
      { id: 'glow', emoji: '✨', name: 'Bare glow' },
      { id: 'red', emoji: '💋', name: 'Classic red lip' },
      { id: 'smoky', emoji: '🌙', name: 'Smoky eye' },
      { id: 'latte', emoji: '☕', name: 'Latte shimmer' },
      { id: 'freckles', emoji: '🌞', name: 'Sun freckles' }
    ],
    outfit: [
      { id: 'dress', emoji: '👗', name: 'Cafe dress' },
      { id: 'blazer', emoji: '🧥', name: 'Tailored blazer' },
      { id: 'denim', emoji: '👢', name: 'Denim and boots' },
      { id: 'satin', emoji: '🎀', name: 'Satin slip' },
      { id: 'rock', emoji: '🎸', name: 'Rockabilly skirt' }
    ]
  };

  var BOOKED = 'Booked in the Newcastle/Hunter area. The appointment time is confirmed by email after the PayID payment is received.';
  var SERVICES = [
    { id: 'svc-hair', kind: 'service', price: 10, emoji: '💇', name: 'Hair styling session', blurb: 'Blow-dry, waves, braids or a smooth finish. A styling session, not a medical treatment. ' + BOOKED },
    { id: 'svc-makeup', kind: 'service', price: 10, emoji: '💄', name: 'Makeup look', blurb: 'A full makeup look for the day, a photo or a night out. Colour stays on the skin. ' + BOOKED },
    { id: 'svc-makeup-visit', kind: 'service', price: 150, emoji: '💋', name: 'In-person makeup makeover', blurb: 'A makeup makeover with you there. Colour stays on the skin. ' + BOOKED },
    { id: 'svc-hair-makeup-visit', kind: 'service', price: 280, emoji: '✨', name: 'In-person hair and makeup makeover', blurb: 'Hair styling and a makeup makeover in one visit. ' + BOOKED },
    { id: 'svc-nails', kind: 'service', price: 10, emoji: '💅', name: 'Nail colour and care', blurb: 'Shape, buff and colour. Cosmetic only, with no piercing, cosmetic tattoo or injectables. ' + BOOKED },
    { id: 'svc-wardrobe', kind: 'service', price: 10, emoji: '👗', name: 'Wardrobe outfit makeover', blurb: 'A one-look outfit session with pieces, fit and a simple styling plan. ' + BOOKED },
    { id: 'svc-wig', kind: 'service', price: 10, emoji: '🎀', name: 'Wig fit and style', blurb: 'Pick a wig from the shop and have it fitted and styled for you. ' + BOOKED }
  ];

  var PRODUCTS = [
    { id: 'prd-wig-day', kind: 'product', price: 45, emoji: '👩', name: 'Everyday soft wig', blurb: 'A soft everyday wig in a natural shade, ready to wear.' },
    { id: 'prd-wig-party', kind: 'product', price: 45, emoji: '🎉', name: 'Party colour wig', blurb: 'A bright party wig for a night out or a costume look.' },
    { id: 'prd-wig-realistic', kind: 'product', price: 10000, emoji: '👱', name: 'Realistic Blonde Moving Wig', blurb: 'Realistic, lifelike hair that moves when touched.', href: '../wig-3d/' },
    { id: 'prd-makeup', kind: 'product', price: 35, emoji: '💄', name: 'Makeup kit', blurb: 'Colour pots and brushes for one complete look.' },
    { id: 'prd-clips', kind: 'product', price: 15, emoji: '📎', name: 'Hair clips', blurb: 'A set of light hair clips for finishing a style.' },
    { id: 'prd-scrunchies', kind: 'product', price: 15, emoji: '🎀', name: 'Scrunchies', blurb: 'Soft scrunchies for tying hair without a heavy kit.' },
    { id: 'prd-ties', kind: 'product', price: 15, emoji: '🪢', name: 'Hair ties', blurb: 'A pack of light hair ties.' },
    { id: 'prd-press-ons', kind: 'product', price: 15, emoji: '💅', name: 'Press-on nails', blurb: 'Press-on nails. They sit on the nail and do not pierce the skin.' },
    { id: 'prd-outfit', kind: 'product', price: 10, emoji: '🧥', name: 'Outfit makeover kit', blurb: 'A coordinated outfit bundle for one new look.' },
    { id: 'prd-accessories', kind: 'product', price: 15, emoji: '👜', name: 'Light accessory bundle', blurb: 'Clip-on earrings, a scarf and a bag charm. Nothing pierces the skin.' },
    { id: 'prd-voucher-10', kind: 'product', price: 10, emoji: '🎁', name: 'Makeover gift voucher US$10', blurb: 'A US$10 voucher for a service or product in this shop.' },
    { id: 'prd-voucher-50', kind: 'product', price: 50, emoji: '🎁', name: 'Makeover gift voucher US$50', blurb: 'A US$50 voucher for a service or product in this shop.' },
    { id: 'prd-voucher-150', kind: 'product', price: 150, emoji: '🎁', name: 'Makeover gift voucher US$150', blurb: 'A US$150 voucher for a service or product in this shop.' }
  ];

  var choice = { hair: LOOKS.hair[0].id, makeup: LOOKS.makeup[0].id, outfit: LOOKS.outfit[0].id };
  var cart = [];
  var lastSnapshot = '';
  var lastRef = '';

  function $(id) { return document.getElementById(id); }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function grouped(text) {
    var bits = String(text).split('.');
    bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return bits.join('.');
  }

  function money(amount) {
    return 'US$' + grouped(amount.toFixed(2));
  }

  function priceTag(amount) {
    return 'US$' + grouped(amount % 1 === 0 ? String(amount) : amount.toFixed(2));
  }

  function findLook(group, id) {
    var list = LOOKS[group];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  function lookSummary() {
    var hair = findLook('hair', choice.hair);
    var makeup = findLook('makeup', choice.makeup);
    var outfit = findLook('outfit', choice.outfit);
    return hair.name + ', ' + makeup.name.toLowerCase() + ', and ' + outfit.name.toLowerCase() + '.';
  }

  function lookItem() {
    var hair = findLook('hair', choice.hair);
    var makeup = findLook('makeup', choice.makeup);
    var outfit = findLook('outfit', choice.outfit);
    return {
      id: 'look-' + hair.id + '-' + makeup.id + '-' + outfit.id,
      kind: 'service',
      price: 10,
      emoji: hair.emoji,
      name: 'Try a look: ' + hair.name + ' / ' + makeup.name + ' / ' + outfit.name
    };
  }

  function qtyOf() {
    var n = 0;
    for (var i = 0; i < cart.length; i++) n += cart[i].qty;
    return n;
  }

  function linePrice(line) {
    return line.price;
  }

  function total() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) sum += cart[i].qty * linePrice(cart[i]);
    return sum;
  }

  function hasService() {
    for (var i = 0; i < cart.length; i++) if (cart[i].kind === 'service') return true;
    return false;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.map(function (line) {
        return { id: line.id, name: line.name, kind: line.kind, emoji: line.emoji, qty: line.qty, price: line.price };
      })));
    } catch (err) {}
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return;
      cart = raw.filter(function (line) {
        return line && typeof line.id === 'string' && typeof line.name === 'string' && line.qty >= 1 && line.qty <= 20;
      }).map(function (line) {
        var known = catalogById(line.id);
        var price = known ? known.price : (String(line.id).indexOf('look-') === 0 ? PRICE : null);
        if (price == null) return null;
        return {
          id: known ? known.id : line.id,
          name: known ? known.name : line.name,
          kind: known ? known.kind : 'service',
          emoji: known ? known.emoji : (line.emoji || '✨'),
          qty: line.qty,
          price: price
        };
      }).filter(Boolean);
    } catch (err) {
      cart = [];
    }
  }

  function hidePay() {
    $('pay-panel').hidden = true;
    lastSnapshot = '';
  }

  function add(item) {
    var found = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].id === item.id) found = cart[i];
    if (found) {
      if (found.qty >= 20) return;
      found.qty += 1;
    } else {
      cart.push({ id: item.id, name: item.name, kind: item.kind, emoji: item.emoji, qty: 1, price: item.price });
    }
    hidePay();
    save();
    renderCart();
  }

  function setQty(id, qty) {
    cart = cart.filter(function (line) {
      if (line.id !== id) return true;
      if (qty < 1) return false;
      line.qty = Math.min(20, qty);
      return true;
    });
    hidePay();
    save();
    renderCart();
  }

  function renderChoices(group, hostId) {
    var host = $(hostId);
    host.innerHTML = LOOKS[group].map(function (opt) {
      var on = choice[group] === opt.id;
      return '<button type="button" class="choice" data-group="' + group + '" data-id="' + opt.id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + opt.emoji + ' ' + escapeHtml(opt.name) + '</button>';
    }).join('');
  }

  function renderLook() {
    var hair = findLook('hair', choice.hair);
    var makeup = findLook('makeup', choice.makeup);
    var outfit = findLook('outfit', choice.outfit);
    $('stage-hair').textContent = hair.emoji;
    $('stage-face').textContent = makeup.emoji;
    $('stage-outfit').textContent = outfit.emoji;
    $('look-summary').textContent = lookSummary();
    renderChoices('hair', 'hair-choices');
    renderChoices('makeup', 'makeup-choices');
    renderChoices('outfit', 'outfit-choices');
  }

  function renderCatalog(list, hostId) {
    $(hostId).innerHTML = list.map(function (item) {
      var title = escapeHtml(item.name);
      if (item.href) title = '<a href="' + escapeHtml(item.href) + '">' + title + '</a>';
      return '<article class="item">' +
        '<span class="badge">' + (item.kind === 'service' ? 'Service' : 'Product') + '</span>' +
        '<span class="emoji" aria-hidden="true">' + item.emoji + '</span>' +
        '<h3>' + title + '</h3>' +
        '<p>' + escapeHtml(item.blurb) + '</p>' +
        '<p class="price">' + priceTag(item.price) + '</p>' +
        '<button type="button" class="btn" data-add="' + item.id + '">Add to cart</button>' +
        '</article>';
    }).join('');
  }

  function renderCart() {
    var empty = $('cart-empty');
    var list = $('cart-lines');
    var totalRow = $('cart-total');
    var count = qtyOf();
    $('dock-count').textContent = String(count);
    $('dock-total').textContent = money(total());
    if (!cart.length) {
      empty.hidden = false;
      list.innerHTML = '';
      totalRow.hidden = true;
      return;
    }
    empty.hidden = true;
    totalRow.hidden = false;
    $('cart-total-value').textContent = money(total());
    list.innerHTML = cart.map(function (line) {
      return '<li><span>' + escapeHtml(line.emoji) + ' ' + escapeHtml(line.name) + ' · ' + money(line.qty * linePrice(line)) + '</span>' +
        '<span class="qty"><button type="button" data-qty="' + line.id + '" data-delta="-1" aria-label="Fewer ' + escapeHtml(line.name) + '">−</button>' +
        '<span>' + line.qty + '</span>' +
        '<button type="button" data-qty="' + line.id + '" data-delta="1" aria-label="More ' + escapeHtml(line.name) + '">+</button></span></li>';
    }).join('');
  }

  function catalogById(id) {
    var all = SERVICES.concat(PRODUCTS);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }

  function mintRef() {
    var bytes = new Uint32Array(6);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (var i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * ALPHABET.length);
    var out = 'CBMO-';
    for (var n = 0; n < bytes.length; n++) out += ALPHABET.charAt(bytes[n] % ALPHABET.length);
    return out;
  }

  function buyer() {
    return {
      name: $('buyer-name').value.trim(),
      email: $('buyer-email').value.trim(),
      notes: $('buyer-notes').value.trim()
    };
  }

  function snapshot(info) {
    return JSON.stringify({
      lines: cart.map(function (line) { return { id: line.id, qty: line.qty }; }),
      name: info.name,
      email: info.email,
      notes: info.notes
    });
  }

  function showError(message) {
    var el = $('form-error');
    el.hidden = !message;
    el.textContent = message || '';
  }

  function showPay(info) {
    var key = snapshot(info);
    if (key !== lastSnapshot) {
      lastSnapshot = key;
      lastRef = mintRef();
    }
    $('pay-amount').textContent = money(total());
    $('pay-ref').textContent = lastRef;
    var notes = info.notes || 'None';
    var lines = cart.map(function (line) {
      return '<li>' + line.qty + ' × ' + escapeHtml(line.name) + ' — ' + money(line.qty * linePrice(line)) + '</li>';
    }).join('');
    $('pay-booking').hidden = !hasService();
    $('pay-details').innerHTML =
      '<dt>Name</dt><dd>' + escapeHtml(info.name) + '</dd>' +
      '<dt>Email</dt><dd>' + escapeHtml(info.email) + '</dd>' +
      '<dt>Order notes</dt><dd>' + escapeHtml(notes) + '</dd>' +
      '<dt>Order</dt><dd><ul>' + lines + '</ul></dd>';
    $('pay-panel').hidden = false;
    $('copy-status').textContent = '';
    $('pay-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function copyText(value, label) {
    function done(ok) {
      $('copy-status').textContent = ok ? (label + ' copied.') : (label + ': ' + value);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
    } else done(false);
  }

  document.addEventListener('click', function (event) {
    var choiceBtn = event.target.closest('.choice');
    if (choiceBtn) {
      choice[choiceBtn.getAttribute('data-group')] = choiceBtn.getAttribute('data-id');
      renderLook();
      return;
    }
    var addBtn = event.target.closest('[data-add]');
    if (addBtn) {
      var item = catalogById(addBtn.getAttribute('data-add'));
      if (item) add(item);
      return;
    }
    var qtyBtn = event.target.closest('[data-qty]');
    if (qtyBtn) {
      var id = qtyBtn.getAttribute('data-qty');
      var delta = Number(qtyBtn.getAttribute('data-delta'));
      var line = null;
      for (var i = 0; i < cart.length; i++) if (cart[i].id === id) line = cart[i];
      if (line) setQty(id, line.qty + delta);
    }
  });

  $('add-look').addEventListener('click', function () { add(lookItem()); });

  $('checkout-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var info = buyer();
    if (!cart.length) {
      showError('Add a look, a service or a product before checkout.');
      return;
    }
    if (!info.name || !info.email || $('buyer-email').validity.typeMismatch) {
      showError('Enter your name and a valid email.');
      return;
    }
    showError('');
    showPay(info);
  });

  $('copy-payid').addEventListener('click', function () { copyText(PAYID, 'PayID'); });
  $('copy-ref').addEventListener('click', function () { copyText(lastRef, 'Reference'); });
  $('copy-amount').addEventListener('click', function () { copyText(money(total()), 'Amount'); });

  load();
  renderCatalog(SERVICES, 'services');
  renderCatalog(PRODUCTS, 'products');
  renderLook();
  renderCart();

  window.MakeoverShop = {
    PRICE: PRICE,
    PAY_LABEL: PAY_LABEL,
    catalog: SERVICES.concat(PRODUCTS)
  };
})();
