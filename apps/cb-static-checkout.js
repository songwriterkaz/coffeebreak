/* Shared PayID checkout for static Coffeebreak pages.
   No network calls. Never marks a payment as received. */
(function () {
  var C = window.CoffeebreakCart;
  var LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';

  function money(minor, currency) {
    var raw = C.formatMinor(minor);
    var bits = raw.split('.');
    bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var shown = bits.join('.');
    if (currency === 'AUD') return 'A$' + shown;
    if (currency === 'USD') return 'US$' + shown;
    return shown + ' ' + currency;
  }

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'class') node.className = attrs[key];
        else node.setAttribute(key, attrs[key]);
      });
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function readFields(root) {
    function val(name) {
      var node = root.querySelector('[name="' + name + '"]');
      return node ? node.value : '';
    }
    return { name: val('name'), email: val('email'), notes: val('notes') };
  }

  function mount(target, opts) {
    if (!C) {
      if (typeof target === 'string') target = document.getElementById(target);
      if (target) target.textContent = 'Checkout could not load. No payment is requested.';
      return { refresh: function () {} };
    }
    if (typeof target === 'string') target = document.getElementById(target);
    opts = opts || {};
    var storeId = opts.storeId || 'store';
    var currency = opts.currency || 'USD';
    var refKey = 'cb-static-ref-' + String(storeId).replace(/\W/g, '');

    function readPrev() {
      try { return JSON.parse(sessionStorage.getItem(refKey) || 'null'); }
      catch (err) { return null; }
    }
    function savePrev(view) {
      try {
        sessionStorage.setItem(refKey, JSON.stringify({
          snapshotKey: view.snapshotKey,
          reference: view.reference
        }));
      } catch (err) {}
    }

    function paint() {
      var kept = readFields(target);
      var items = [];
      try { items = (opts.getItems && opts.getItems()) || []; }
      catch (err) { items = []; }
      var lines = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        lines.push({
          id: String(item.id),
          name: String(item.name),
          unitMinor: C.dollarsToMinor(item.amount),
          qty: item.qty
        });
      }
      var built = C.buildState({
        storeId: storeId,
        currency: currency,
        lines: lines,
        previous: readPrev()
      });
      target.replaceChildren();
      target.appendChild(el('h2', { id: 'cart-title' }, 'Cart'));
      if (!built.ok) {
        target.appendChild(el('p', null, 'This cart could not be totalled. No payment is requested.'));
        return;
      }
      if (!built.lines.length) {
        target.appendChild(el('p', { id: 'cart-empty' }, 'Your cart is empty.'));
        return;
      }
      savePrev(built);
      var totalMinor = C.sumMinor(built.lines.map(function (line) {
        return C.lineMinor(line.unitMinor, line.qty);
      }));
      var list = el('ul', { id: 'cart-lines' });
      built.lines.forEach(function (line) {
        var row = el('li');
        row.appendChild(document.createTextNode(
          line.name + ' × ' + line.qty + ' · ' + money(C.lineMinor(line.unitMinor, line.qty), currency) + ' '
        ));
        var less = el('button', { type: 'button', class: 'btn alt' }, line.qty === 1 ? 'Remove' : '−');
        less.setAttribute('aria-label', (line.qty === 1 ? 'Remove ' : 'Fewer ') + line.name);
        less.addEventListener('click', function () {
          if (line.qty === 1) opts.onRemove(line.id);
          else opts.onQty(line.id, line.qty - 1);
        });
        var more = el('button', { type: 'button', class: 'btn alt' }, '+');
        more.setAttribute('aria-label', 'More ' + line.name);
        more.addEventListener('click', function () { opts.onQty(line.id, line.qty + 1); });
        row.appendChild(less);
        row.appendChild(document.createTextNode(' '));
        row.appendChild(more);
        list.appendChild(row);
      });
      target.appendChild(list);
      target.appendChild(el('p', { id: 'cb-cart-total' }, 'Total: ' + money(totalMinor, currency)));
      target.appendChild(el('p', { id: 'cb-pay-label' }, LABEL));
      target.appendChild(el('p', { id: 'cb-order-ref' }, 'Order reference: ' + built.reference));

      var how = el('div', { id: 'cb-pay-instructions' });
      how.appendChild(el('p', null, 'PayID instructions'));
      var steps = document.createElement('ol');
      [
        'Open your own banking app.',
        'Send ' + money(totalMinor, currency) + ' to PayID darkokaz@gmx.com (Teachers Mutual Bank).',
        'Put order reference ' + built.reference + ' in the payment description.'
      ].forEach(function (step) { steps.appendChild(el('li', null, step)); });
      how.appendChild(steps);
      how.appendChild(el('p', null, currency === 'USD'
        ? 'Prices on this page are in US dollars. This page does not convert them into Australian dollars.'
        : 'Prices on this page are in Australian dollars.'));
      how.appendChild(el('p', null, 'This page does not take card payments and does not check your bank. An order reference is a label for your transfer, not a receipt.'));
      target.appendChild(how);

      var form = el('form', { id: 'cb-checkout-form' });
      function field(title, input) {
        var label = el('label');
        label.appendChild(document.createTextNode(title));
        label.appendChild(input);
        return label;
      }
      var name = el('input', { name: 'name', autocomplete: 'name', required: 'required' });
      name.value = kept.name;
      form.appendChild(field('Name', name));
      var email = el('input', { name: 'email', type: 'email', autocomplete: 'email', required: 'required' });
      email.value = kept.email;
      form.appendChild(field('Email', email));
      var notes = el('textarea', { name: 'notes', maxlength: '500' });
      notes.value = kept.notes;
      form.appendChild(field('Notes', notes));
      form.appendChild(el('button', { type: 'submit', class: 'btn' }, 'Email this order'));
      var mailNote = el('p', { id: 'cb-mail-note' });
      form.appendChild(mailNote);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;
        var body = [
          opts.storeName || storeId,
          'Order reference: ' + built.reference,
          'Name: ' + name.value.trim(),
          'Email: ' + email.value.trim(),
          'Notes: ' + notes.value.trim(),
          'Currency: ' + currency,
          'Total: ' + C.formatMinor(totalMinor),
          LABEL,
          'This email is an order note. It is not proof of payment.',
          built.lines.map(function (line) {
            return line.qty + ' x ' + line.name + ' @ ' + C.formatMinor(line.unitMinor) + ' ' + currency;
          }).join('\n')
        ].join('\n');
        var href = 'mailto:darkokaz@gmx.com?subject='
          + encodeURIComponent((opts.storeName || 'Coffeebreak') + ' order ' + built.reference)
          + '&body=' + encodeURIComponent(body);
        mailNote.replaceChildren();
        mailNote.appendChild(document.createTextNode('Your email draft is ready. Opening it does not send the message and does not confirm payment.'));
        mailNote.appendChild(document.createElement('br'));
        var link = el('a', { id: 'cb-mailto', href: href }, 'Open the email draft');
        mailNote.appendChild(link);
      });
      target.appendChild(form);
    }

    paint();
    return { refresh: paint };
  }

  window.CBStaticCheckout = { mount: mount, LABEL: LABEL };
})();
