/* In-page game cart. Uses CoffeebreakGameCart and CoffeebreakCart. It does not mark a payment received. */
(function () {
  var G = window.CoffeebreakGameCart;
  var C = window.CoffeebreakCart;
  if (!G || !C) return;

  function boot() {
    var section = document.getElementById('cb-game-cart');
    var dataEl = document.getElementById('cb-game-cart-data');
    if (!section || !dataEl || section.dataset.ready === '1') return;
    section.dataset.ready = '1';
    var data = {};
    try { data = JSON.parse(dataEl.textContent || '{}'); } catch (err) { data = {}; }
    var session = G.createSession({
      storeId: section.getAttribute('data-store') || data.storeId || 'game',
      currency: data.currency || null,
      items: data.items || []
    });
    var storage = null;
    try { storage = window.localStorage; } catch (err) { storage = null; }
    var key = 'cb-payid-game-' + String(session.storeId).replace(/\W/g, '');
    if (storage && session.currency) {
      var restored = C.restore(storage, key);
      if (restored && restored.lines) {
        session.lines = restored.lines.filter(function (line) {
          return session.items.some(function (item) { return item.id === line.id && item.amount != null && G.isSellableName(item.name); });
        });
        session.previous = restored;
        session.customerClaimsPaid = restored.customerClaimsPaid === true;
      }
    }

    var style = document.createElement('style');
    style.textContent = '#cb-game-cart-toggle,#cb-game-cart-panel button,#cb-game-cart-panel a,#cb-game-open-cart{min-height:44px;min-width:44px}#cb-game-cart-toggle{position:fixed;left:12px;right:auto;bottom:16px;z-index:2147483646;background:#e8559a;color:#fff;border:0;border-radius:999px;padding:10px 16px;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer}#cb-game-cart-panel{position:fixed;left:12px;right:auto;bottom:76px;z-index:2147483646;width:min(420px,calc(100% - 24px));max-height:70vh;overflow:auto;background:#fff;color:#3a1f2c;border:2px solid #e8559a;border-radius:16px;padding:12px;font:15px/1.4 system-ui,sans-serif}#cb-game-open-cart{display:inline-block;margin:8px 0;background:#e8559a;color:#fff;border:0;border-radius:10px;padding:8px 12px;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer}#cb-game-cart-panel h2{margin:0 0 8px;font-size:1.1rem}#cb-game-cart-panel button{background:#e8559a;color:#fff;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer}#cb-game-cart-panel button.quiet{background:#fff;color:#b8336f;border:1px solid #e8559a}#cb-game-cart-panel a{color:#b8336f;font-weight:700}#cb-game-cart-panel .row{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:8px 0}#cb-game-cart-panel label{display:block;font-weight:700;margin-top:8px}#cb-game-cart-panel input{display:block;width:100%;min-height:44px;margin-top:4px;padding:8px 10px;border:1px solid #e8559a;border-radius:10px;font:inherit;box-sizing:border-box}';
    document.head.appendChild(style);

    var toggle = document.createElement('button');
    toggle.id = 'cb-game-cart-toggle';
    toggle.type = 'button';
    toggle.textContent = 'Cart';
    var panel = document.createElement('div');
    panel.id = 'cb-game-cart-panel';
    panel.hidden = true;
    toggle.addEventListener('click', function () {
      if (panel.hidden) openCart();
      else {
        panel.hidden = true;
        toggle.textContent = 'Cart';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    function persist() {
      if (!storage || !session.currency) return;
      var state = C.buildState({
        storeId: session.storeId,
        currency: session.currency,
        lines: session.lines,
        previous: session.previous,
        customerClaimsPaid: session.customerClaimsPaid === true
      });
      if (state.ok) {
        session.previous = state;
        C.persist(storage, key, state);
      }
    }

    function fallbackCopy(value) {
      var input = document.createElement('textarea');
      input.value = value;
      input.setAttribute('readonly', '');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(input);
    }

    function copyValue(value) {
      if (!value) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
      } else {
        fallbackCopy(value);
      }
    }

    function formatRateDate(value) {
      if (!value) return '';
      var parsed = new Date(value);
      if (isNaN(parsed.getTime())) return String(value);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return parsed.getDate() + ' ' + months[parsed.getMonth()] + ' ' + parsed.getFullYear();
    }

    function requestAudRate() {
      if (session.currency !== 'USD' || session.usdAudRate) return;
      if (session.rateTried) return;
      session.rateTried = true;
      var urls = [
        'https://api.frankfurter.app/latest?from=USD&to=AUD',
        'https://open.er-api.com/v6/latest/USD'
      ];
      function use(quote) {
        if (!quote || !(Number(quote.rate) > 0)) return false;
        session.usdAudRate = Number(quote.rate);
        session.exchangeRateDate = quote.date || '';
        paint();
        return true;
      }
      function fromBody(data) {
        if (data && data.rates && data.rates.AUD) {
          return { rate: Number(data.rates.AUD), date: data.date || data.time_last_update_utc || '' };
        }
        return null;
      }
      function next(i) {
        if (i >= urls.length) return;
        fetch(urls[i], { method: 'GET' }).then(function (res) { return res.json(); }).then(function (data) {
          if (!use(fromBody(data))) next(i + 1);
        }).catch(function () { next(i + 1); });
      }
      next(0);
    }

    function openCart() {
      panel.hidden = false;
      toggle.textContent = 'Close cart';
      toggle.setAttribute('aria-expanded', 'true');
      requestAudRate();
    }

    if (section && !document.getElementById('cb-game-open-cart')) {
      var openInPage = document.createElement('button');
      openInPage.id = 'cb-game-open-cart';
      openInPage.type = 'button';
      openInPage.textContent = 'Open cart';
      openInPage.addEventListener('click', openCart);
      section.appendChild(openInPage);
    }

    function lineButton(label, className, onClick) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      if (className) button.className = className;
      button.addEventListener('click', onClick);
      return button;
    }

    function labelledInput(labelText, name, value, opts) {
      opts = opts || {};
      var wrap = document.createElement('label');
      wrap.appendChild(document.createTextNode(labelText));
      var input = document.createElement('input');
      input.name = name;
      input.value = value == null ? '' : String(value);
      if (opts.type) input.type = opts.type;
      if (opts.readOnly) input.readOnly = true;
      if (opts.required) input.required = true;
      wrap.appendChild(input);
      return wrap;
    }

    function payStep(current) {
      requestAudRate();
      var wrap = document.createElement('div');
      wrap.id = 'cb-game-pay';
      var total = document.createElement('p');
      if (current.currency === 'AUD') {
        total.textContent = 'Total: ' + current.totalLabel + ' AUD';
      } else if (current.audTotalLabel) {
        total.textContent = 'Total: US$' + current.totalLabel + '. Transfer A$' + current.audTotalLabel + (current.exchangeRate ? ' (guide rate 1 USD = ' + Number(current.exchangeRate).toFixed(4) + ' AUD' + (current.exchangeRateDate ? ' on ' + formatRateDate(current.exchangeRateDate) : '') + '). Your bank may use a slightly different rate.' : '.');
      } else {
        total.textContent = 'Total: ' + current.totalLabel + ' ' + current.currency + '. Transfer the Australian dollar equivalent of that amount to the PayID. Your bank will convert it.';
      }
      var label = document.createElement('p');
      label.textContent = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
      var ref = document.createElement('p');
      ref.textContent = current.reference ? 'Reference: ' + current.reference : 'Add a priced item to mint a reference.';
      var stepsHead = document.createElement('p');
      stepsHead.textContent = 'How to pay';
      var steps = document.createElement('ol');
      ['Open your banking app.', 'Send the Australian dollar amount to that PayID.', 'Put the order reference in the payment description.'].forEach(function (text) {
        var item = document.createElement('li');
        item.textContent = text;
        steps.appendChild(item);
      });
      var hint = document.createElement('p');
      hint.textContent = G.PAY_HINT;
      wrap.append(total, label, ref, stepsHead, steps, hint);
      (current.notices || []).forEach(function (text) {
        if (/not delivered to the merchant|does not calculate an Australian dollar amount|This page does not move money/i.test(text)) return;
        var note = document.createElement('p');
        note.textContent = text;
        wrap.appendChild(note);
      });
      var copies = C.copyFields(current);
      var amountLabel = current.audTotalLabel && current.currency !== 'AUD' ? 'Copy AUD amount' : 'Copy amount';
      wrap.append(
        copyButton(amountLabel, copies.amount),
        copyButton('Copy PayID', copies.payId),
        copyButton('Copy reference', copies.reference)
      );
      var form = document.createElement('form');
      form.id = 'cb-game-order';
      form.noValidate = true;
      var honey = document.createElement('input');
      honey.name = '_honey';
      honey.tabIndex = -1;
      honey.autocomplete = 'off';
      honey.setAttribute('aria-hidden', 'true');
      honey.style.position = 'absolute';
      honey.style.left = '-9999px';
      var itemsText = session.lines.map(function (line) {
        return line.qty + ' x ' + line.name;
      }).join(', ');
      var physical = session.lines.some(function (line) {
        return G.isPhysicalItem(line, session.storeId);
      });
      form.append(
        honey,
        labelledInput('Name', 'name', session.customerName || '', { required: true }),
        labelledInput('Email', 'email', session.customerEmail || '', { type: 'email', required: true })
      );
      if (physical) {
        var shipNote = document.createElement('p');
        shipNote.textContent = 'Fulfilment starts after the PayID lands.';
        form.append(
          shipNote,
          labelledInput('Delivery address', 'address', session.customerAddress || '', { required: true }),
          labelledInput('Phone', 'phone', session.customerPhone || '', { type: 'tel', required: true })
        );
      }
      form.append(
        labelledInput('Items', 'items', itemsText, { readOnly: true }),
        labelledInput('Total', 'total', current.audTotalLabel && current.currency !== 'AUD' ? current.totalLabel + ' ' + current.currency + ' (transfer ' + current.audTotalLabel + ' AUD)' : current.totalLabel + ' ' + current.currency, { readOnly: true }),
        labelledInput('Reference', 'reference', current.reference || '', { readOnly: true })
      );
      var submit = document.createElement('button');
      submit.type = 'submit';
      submit.textContent = 'Place order';
      var status = document.createElement('p');
      status.id = 'cb-game-order-status';
      status.textContent = session.orderNotice || '';
      form.append(submit, status);
      form.addEventListener('input', function () {
        session.customerName = form.elements.name.value;
        session.customerEmail = form.elements.email.value;
        if (form.elements.address) session.customerAddress = form.elements.address.value;
        if (form.elements.phone) session.customerPhone = form.elements.phone.value;
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (honey.value) return;
        var name = form.elements.name.value.trim();
        var email = form.elements.email.value.trim();
        var address = form.elements.address ? form.elements.address.value.trim() : '';
        var phone = form.elements.phone ? form.elements.phone.value.trim() : '';
        session.customerName = name;
        session.customerEmail = email;
        session.customerAddress = address;
        session.customerPhone = phone;
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          session.orderNotice = 'Add your name and a valid email.';
          status.textContent = session.orderNotice;
          return;
        }
        if (physical && (!address || !phone)) {
          session.orderNotice = 'Add your delivery name, address and phone.';
          status.textContent = session.orderNotice;
          return;
        }
        var fields = G.orderFields({
          name: name,
          email: email,
          address: address,
          phone: phone,
          lines: session.lines,
          total: current.totalLabel,
          currency: current.currency,
          audTotal: current.audTotalLabel || '',
          reference: current.reference
        });
        session.customerClaimsPaid = false;
        session.orderNotice = 'Order reference: ' + (current.reference || '') + '. Payment is pending and is not verified. Karen will send access once the PayID lands.';
        status.textContent = session.orderNotice;
        persist();
        var baseNotice = session.orderNotice;
        function showMailFallback(notice) {
          var draft = G.orderMailto(fields);
          session.orderNotice = notice + ' You can email the order with the link below.';
          status.textContent = session.orderNotice;
          if (!wrap.querySelector('#cb-game-order-mail')) {
            var mail = document.createElement('a');
            mail.id = 'cb-game-order-mail';
            mail.href = draft.href;
            mail.textContent = 'Email this order';
            wrap.appendChild(mail);
          }
          try { window.location.href = draft.href; } catch (err) {}
        }
        fetch(G.ordersEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(fields)
        }).then(function (res) { return res.json().then(function (body) { return { res: res, body: body }; }).catch(function () { return { res: res, body: null }; }); }).then(function (result) {
          var body = result.body || {};
          var ok = body.success === true || body.success === 'true';
          if (ok) {
            session.orderNotice = baseNotice + ' Order details were handed to the mailbox.';
            status.textContent = session.orderNotice;
          } else {
            showMailFallback(baseNotice + ' The mailbox did not accept the order details yet.');
          }
        }).catch(function () {
          showMailFallback(baseNotice + ' The mailbox did not accept the order details yet.');
        });
      });
      var draftLink = document.createElement('a');
      draftLink.id = 'cb-game-order-mail-draft';
      draftLink.href = G.orderMailto({
        name: session.customerName || '',
        email: session.customerEmail || '',
        address: session.customerAddress || '',
        phone: session.customerPhone || '',
        lines: session.lines,
        total: current.totalLabel,
        currency: current.currency,
        audTotal: current.audTotalLabel || '',
        reference: current.reference
      }).href;
      draftLink.textContent = 'Email this order';
      wrap.appendChild(form);
      wrap.appendChild(draftLink);
      return wrap;
    }

    function paint() {
      var current = G.view(session);
      panel.replaceChildren();
      var heading = document.createElement('h2');
      heading.textContent = 'Coffeebreak cart';
      panel.appendChild(heading);

      function renderItem(item) {
        var row = document.createElement('div');
        row.className = 'row';
        var info = document.createElement('div');
        var name = document.createElement('strong');
        name.textContent = item.name;
        var price = document.createElement('div');
        price.textContent = G.priceLabel(item);
        info.append(name, price);
        row.appendChild(info);
        if (item.amount != null && G.isSellableName(item.name)) {
          row.appendChild(lineButton('Add to cart', '', function () {
            G.add(session, item.id);
            persist();
            paint();
          }));
        }
        panel.appendChild(row);
      }
      session.items.filter(function (item) { return item.kind !== 'food' && item.kind !== 'prize'; }).forEach(renderItem);
      var extras = session.items.filter(function (item) { return item.kind === 'food' || item.kind === 'prize'; });
      if (extras.length) {
        var extraHead = document.createElement('h2');
        extraHead.textContent = 'Real food & prizes';
        panel.appendChild(extraHead);
        extras.forEach(renderItem);
      }

      var lines = document.createElement('div');
      if (!session.lines.length) {
        var empty = document.createElement('p');
        empty.textContent = 'Your cart is empty.';
        lines.appendChild(empty);
      } else {
        session.lines.forEach(function (line) {
          var row = document.createElement('div');
          row.className = 'row';
          var info = document.createElement('div');
          var name = document.createElement('strong');
          name.textContent = line.name;
          var meta = document.createElement('div');
          meta.textContent = line.qty + ' x ' + C.formatMinor(line.unitMinor) + ' ' + (session.currency || '');
          info.append(name, meta);
          var qty = document.createElement('div');
          qty.append(
            lineButton('Reduce quantity', 'quiet', function () {
              if (line.qty <= 1) G.remove(session, line.id);
              else G.setQty(session, line.id, line.qty - 1);
              persist();
              paint();
            }),
            lineButton('Increase quantity', 'quiet', function () {
              G.setQty(session, line.id, line.qty + 1);
              persist();
              paint();
            }),
            lineButton('Remove', 'quiet', function () {
              G.remove(session, line.id);
              persist();
              paint();
            })
          );
          row.append(info, qty);
          lines.appendChild(row);
        });
      }
      panel.appendChild(lines);

      if (!session.lines.length) session.showPay = false;
      var payable = session.lines.length && session.currency && current.mode !== 'gap' && current.mode !== 'enquiry-only' && current.mode !== 'gated' && current.mode !== 'demo';
      if (current.mode === 'gap' || !session.currency) {
        var gap = document.createElement('p');
        gap.textContent = current.gap || G.GAP;
        panel.appendChild(gap);
      } else if (payable) {
        var checkout = document.createElement('button');
        checkout.type = 'button';
        checkout.id = 'cb-game-checkout';
        checkout.textContent = 'Checkout';
        checkout.addEventListener('click', function () {
          session.showPay = true;
          paint();
        });
        panel.appendChild(checkout);
        if (session.showPay) panel.appendChild(payStep(current));
      }
      var report = document.createElement('p');
      var reportLink = document.createElement('a');
      reportLink.href = 'mailto:coffeebreakhq@mail.grokbot.com?subject=Coffeebreak%20game%20report';
      reportLink.textContent = 'Report a problem';
      report.appendChild(reportLink);
      panel.appendChild(report);
    }

    function copyButton(text, value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiet';
      button.textContent = text;
      button.disabled = !value;
      button.addEventListener('click', function () {
        copyValue(value);
      });
      return button;
    }

    paint();
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
    window.CBGameCart = {
      add: function (id) {
        var result = G.add(session, id);
        persist();
        paint();
        openCart();
        return result;
      },
      open: openCart,
      items: function () { return session.items; }
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
