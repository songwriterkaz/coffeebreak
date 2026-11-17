/* Coffeebreak PayID cart panel for a single digital app priced in US dollars.
   Uses window.CoffeebreakCart. This file does not move money. */
(function () {
  'use strict';
  function mount(el, opts) {
    var C = window.CoffeebreakCart;
    if (!C || !el) return;
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    opts = opts || {};
    var storeId = opts.storeId || (document.body && document.body.getAttribute('data-store')) || 'app';
    var item = {
      id: opts.id || storeId,
      name: opts.name || 'Coffeebreak app',
      unitMinor: typeof opts.unitMinor === 'number' ? opts.unitMinor : 1000
    };
    var currency = opts.currency || 'USD';
    var key = 'cb-payid-app-' + String(storeId).replace(/\W/g, '');
    var lines = [];
    var previous = null;
    var customerClaimsPaid = false;

    function storage() {
      try { return window.localStorage; } catch (err) { return null; }
    }

    function load() {
      var saved = storage();
      if (!saved) return;
      var restored = C.restore(saved, key);
      if (!restored) return;
      lines = restored.lines || [];
      previous = restored;
      customerClaimsPaid = restored.customerClaimsPaid === true;
    }

    function currentView() {
      var state = C.buildState({
        storeId: storeId,
        currency: currency,
        lines: lines,
        previous: previous,
        customerClaimsPaid: customerClaimsPaid
      });
      if (!state.ok) return state;
      previous = state;
      lines = state.lines;
      var view = C.checkout(state, {
        currency: currency,
        fulfilmentVerified: true
      });
      var saved = storage();
      if (saved) C.persist(saved, key, state);
      return view;
    }

    function btn(label, className, onClick, disabled) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (className) b.className = className;
      b.disabled = !!disabled;
      b.addEventListener('click', onClick);
      return b;
    }

    function p(text, className) {
      var n = document.createElement('p');
      if (className) n.className = className;
      n.textContent = text;
      return n;
    }

    function render() {
      var view = currentView();
      el.replaceChildren();
      el.classList.add('cb-cart');
      var title = document.createElement('h2');
      title.textContent = 'PayID cart';
      el.appendChild(title);
      el.appendChild(p(item.name + ' is US$' + C.formatMinor(item.unitMinor) + '.', 'cb-cart-lead'));

      var actions = document.createElement('div');
      actions.className = 'cb-cart-actions';
      var inCart = lines.some(function (line) { return line.id === item.id; });
      actions.appendChild(btn(inCart ? 'Already in cart' : 'Add to cart · US$10', 'cb-cart-add', function () {
        if (inCart) return;
        lines = lines.concat([{ id: item.id, name: item.name, unitMinor: item.unitMinor, qty: 1 }]);
        customerClaimsPaid = false;
        render();
      }, inCart));
      if (lines.length) {
        actions.appendChild(btn('Remove from cart', 'cb-cart-quiet', function () {
          lines = C.removeLine(lines, item.id);
          customerClaimsPaid = false;
          render();
        }));
      }
      el.appendChild(actions);

      if (!view.ok) {
        el.appendChild(p(view.error === 'unsupported-currency'
          ? 'This currency is not supported here. No payment is requested.'
          : 'This cart total could not be read. No payment is requested.'));
        return;
      }

      if (!lines.length) {
        el.appendChild(p('Your cart is empty.', 'cb-cart-muted'));
      } else {
        var list = document.createElement('ul');
        list.className = 'cb-cart-lines';
        view.lines.forEach(function (line) {
          var li = document.createElement('li');
          li.textContent = line.name + ' × ' + line.qty + ' · US$' + C.formatMinor(C.lineMinor(line.unitMinor, line.qty));
          list.appendChild(li);
        });
        el.appendChild(list);
      }

      el.appendChild(p('Total: US$' + view.totalLabel, 'cb-cart-total'));
      el.appendChild(p(view.reference ? ('Reference: ' + view.reference) : 'Add the app to mint a payment reference.', 'cb-cart-ref'));
      el.appendChild(p(C.PAYMENT_LABEL, 'cb-cart-payid'));
      el.appendChild(p('No PayPal. Prices stay in US dollars. This page does not convert the total into Australian dollars and does not move money. Copy the amount, PayID and reference into your own banking app. Karen checks the bank receipt before treating a transfer as received.', 'cb-cart-muted'));

      var copies = C.copyFields(view);
      var copyRow = document.createElement('div');
      copyRow.className = 'cb-cart-actions';
      copyRow.append(
        btn('Copy amount', 'cb-cart-quiet', function () { copyText(copies.amount); }, !copies.amount),
        btn('Copy PayID', 'cb-cart-quiet', function () { copyText(copies.payId); }, !copies.payId),
        btn('Copy reference', 'cb-cart-quiet', function () { copyText(copies.reference); }, !copies.reference)
      );
      el.appendChild(copyRow);

      if (view.reference) {
        var draft = C.draftMailto(view);
        el.appendChild(p(draft.notice, 'cb-cart-muted'));
        var mail = document.createElement('a');
        mail.href = draft.href;
        mail.textContent = 'Open email draft';
        el.appendChild(mail);
        el.appendChild(btn(customerClaimsPaid ? 'Payment reported (unverified)' : 'I have paid', 'cb-cart-quiet', function () {
          if (!view.reference) return;
          customerClaimsPaid = true;
          render();
        }, customerClaimsPaid));
        if (customerClaimsPaid) {
          el.appendChild(p('You reported a payment. It stays unverified until the bank receipt is checked.', 'cb-cart-muted'));
        }
        el.appendChild(btn('Download summary', 'cb-cart-quiet', function () {
          var file = C.receiptDraft(view);
          var blob = new Blob([file.body], { type: file.type });
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = file.filename;
          a.click();
        }));
      }

      (view.notices || []).forEach(function (text) {
        el.appendChild(p(text, 'cb-cart-notice'));
      });
    }

    function copyText(value) {
      if (!value) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).catch(function () {});
      }
    }

    load();
    render();
    return { render: render };
  }

  window.CBAppCart = { mount: mount };
})();
