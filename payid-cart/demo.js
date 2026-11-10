/* Labelled demo for the PayID cart core. It does not send mail or take payment. */
(function () {
  var C = window.CoffeebreakCart;
  var KEY = 'cb-payid-cart-demo-v1';
  var CONFIG = { mode: 'demo', currency: 'AUD', demo: true, fulfilmentVerified: false };
  var CATALOG = [
    { id: 'demo-sticker', name: 'Demo sticker (not for sale)', unitMinor: 150 },
    { id: 'demo-card', name: 'Demo card (not for sale)', unitMinor: 250 },
    { id: 'demo-bookmark', name: 'Demo bookmark (not for sale)', unitMinor: 300 }
  ];
  var lines = [];
  var previous = null;
  var customerClaimsPaid = false;

  function store() {
    try { return window.localStorage; } catch (err) { return null; }
  }

  function load() {
    C.externalPaymentFlags({
      paid: new URLSearchParams(window.location.search).get('paid'),
      status: new URLSearchParams(window.location.search).get('status'),
      confirmed: new URLSearchParams(window.location.search).get('confirmed')
    });
    var saved = store();
    if (!saved) return;
    var restored = C.restore(saved, KEY);
    if (!restored) return;
    lines = restored.lines || [];
    previous = restored;
    customerClaimsPaid = restored.customerClaimsPaid === true;
  }

  function view() {
    var state = C.buildState({
      storeId: 'payid-cart-demo',
      currency: 'AUD',
      lines: lines,
      previous: previous,
      customerClaimsPaid: customerClaimsPaid
    });
    if (!state.ok) return state;
    previous = state;
    lines = state.lines;
    var result = CoffeebreakCart.checkout(state, CONFIG);
    var saved = store();
    if (saved) C.persist(saved, KEY, state);
    return result;
  }

  function el(id) { return document.getElementById(id); }

  function button(label, className, onClick) {
    var node = document.createElement('button');
    node.type = 'button';
    node.textContent = label;
    if (className) node.className = className;
    node.addEventListener('click', onClick);
    return node;
  }

  function render() {
    var current = view();
    var catalog = el('catalog');
    catalog.replaceChildren();
    CATALOG.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'card';
      var name = document.createElement('strong');
      name.textContent = item.name;
      var price = document.createElement('p');
      price.textContent = 'AUD ' + C.formatMinor(item.unitMinor) + ' each. Demo price only.';
      card.append(name, price, button('Add to cart', '', function () { addItem(item); }));
      catalog.append(card);
    });

    var list = el('lines');
    list.replaceChildren();
    if (!current.ok || !current.lines.length) {
      var empty = document.createElement('p');
      empty.textContent = 'Your cart is empty.';
      list.append(empty);
    } else {
      current.lines.forEach(function (line) {
        var card = document.createElement('div');
        card.className = 'card row';
        var info = document.createElement('div');
        var title = document.createElement('strong');
        title.textContent = line.name;
        var meta = document.createElement('p');
        meta.textContent = 'AUD ' + C.formatMinor(C.lineMinor(line.unitMinor, line.qty));
        info.append(title, meta);
        var qty = document.createElement('div');
        qty.className = 'qty';
        qty.append(
          button('Reduce quantity', 'quiet', function () { setQty(line, line.qty - 1); }),
          document.createTextNode(String(line.qty)),
          button('Increase quantity', 'quiet', function () { setQty(line, line.qty + 1); }),
          button('Remove', 'quiet', function () { remove(line.id); })
        );
        card.append(info, qty);
        list.append(card);
      });
    }

    el('total').textContent = current.ok ? ('Demo total AUD ' + current.totalLabel + '. Do not send a payment.') : 'Cart needs attention.';
    el('reference').textContent = current.reference ? ('Reference ' + current.reference) : 'Add a demo item to mint a reference.';
    var notices = el('notices');
    notices.replaceChildren();
    (current.notices || []).forEach(function (text) {
      var p = document.createElement('p');
      p.className = 'notice';
      p.textContent = text;
      notices.append(p);
    });
    el('status').textContent = current.customerClaimsPaid
      ? 'You reported a payment. It stays unverified until the merchant checks the bank receipt. This demo does not request a payment.'
      : 'Unverified. This demo does not request a payment.';

    var copies = C.copyFields(current);
    wireCopy('copy-amount', copies.amount);
    wireCopy('copy-payid', copies.payId);
    wireCopy('copy-reference', copies.reference);
    el('claim').disabled = !current.reference;
    var draft = current.reference ? C.draftMailto(current) : null;
    el('mail-note').textContent = draft ? draft.notice : 'An email draft appears after a demo item is in the cart. Opening it does not send email.';
    var mail = el('mail');
    if (draft) {
      mail.href = draft.href;
      mail.removeAttribute('aria-disabled');
    } else {
      mail.href = '#mail-note';
      mail.setAttribute('aria-disabled', 'true');
    }
  }

  function addItem(item) {
    var existing = lines.filter(function (line) { return line.id === item.id; })[0];
    if (existing) setQty(existing, existing.qty + 1);
    else {
      lines.push({ id: item.id, name: item.name, unitMinor: item.unitMinor, qty: 1 });
      render();
    }
  }

  function setQty(line, qty) {
    if (qty < 1) {
      remove(line.id);
      return;
    }
    var next = C.changeQty(lines, line.id, qty);
    if (!next.ok) return;
    lines = next.lines;
    render();
  }

  function remove(id) {
    lines = C.removeLine(lines, id);
    if (!lines.length) customerClaimsPaid = false;
    render();
  }

  function wireCopy(id, value) {
    var node = el(id);
    node.disabled = !value;
    node.onclick = function () {
      if (!value) return;
        var done = function () {
          el('status').textContent = 'Copied. The cart stays unverified, and this demo does not request a payment.';
        };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value); done(); });
      } else {
        fallbackCopy(value);
        done();
      }
    };
  }

  function fallbackCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }

  el('claim').addEventListener('click', function () {
    if (!lines.length) return;
    customerClaimsPaid = true;
    render();
  });

  el('download').addEventListener('click', function () {
    var current = view();
    var file = C.receiptDraft(current);
    var blob = new Blob([file.body], { type: file.type });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
  });

  load();
  render();
})();
