/* Store checkout panel. Enquiry only until fulfilment is verified. No network calls. */
(function () {
  var C = window.CoffeebreakCart;
  if (!C) return;

  function mount(el, opts) {
    if (typeof el === 'string') el = document.getElementById(el);
    if (!el) return;
    opts = opts || {};
    var storeId = (document.body && document.body.dataset && document.body.dataset.store) || 'store';
    var key = 'cb-payid-enquiry-' + String(storeId).replace(/\W/g, '');

    function readPrev() {
      try { return JSON.parse(localStorage.getItem(key) || 'null'); }
      catch (err) { return null; }
    }

    var lastKey = null;
    function paint() {
      var items = [];
      try { items = (opts.getItems && opts.getItems()) || []; }
      catch (err) { items = []; }
      var view = C.catalogueCheckout(items, {
        currency: opts.currency || 'AUD',
        storeId: storeId,
        fulfilmentVerified: false,
        previous: readPrev()
      });
      var viewKey = (view.ok ? view.snapshotKey : view.error) || '';
      if (lastKey === viewKey) return;
      lastKey = viewKey;
      try {
        localStorage.setItem(key, JSON.stringify({
          snapshotKey: view.snapshotKey || '',
          reference: view.reference || null,
          paid: false,
          confirmed: false,
          status: 'draft'
        }));
      } catch (err) {}
      el.replaceChildren();
      var box = document.createElement('div');
      var note = document.createElement('p');
      if (!view.ok) {
        note.textContent = view.error === 'unsupported-currency'
          ? 'This currency is not supported here. No payment is requested.'
          : 'This cart total could not be read. No payment is requested.';
        box.appendChild(note);
        el.appendChild(box);
        return;
      }
      note.textContent = view.currency === 'AUD'
        ? 'Payment is not requested. Stock and fulfilment are not confirmed, so this page does not ask for a transfer.'
        : 'Prices stay in ' + view.currency + '. This page does not calculate an Australian dollar amount and does not ask for a transfer.';
      var total = document.createElement('p');
      total.textContent = 'Total: ' + view.totalLabel + ' ' + view.currency;
      var ref = document.createElement('p');
      ref.textContent = view.reference ? ('Reference: ' + view.reference) : 'Add a priced item to mint a reference.';
      var label = document.createElement('p');
      label.textContent = C.PAYMENT_LABEL;
      var limit = document.createElement('p');
      limit.textContent = 'A saved cart stays in this browser. Opening an email draft does not send it. This page does not mark a payment as received.';
      box.append(note, total, ref, label, limit);
      var copies = C.copyFields(view);
      box.append(copyButton('Copy amount', copies.amount), copyButton('Copy PayID', copies.payId), copyButton('Copy reference', copies.reference));
      if (view.reference) {
        var draft = C.draftMailto(view);
        var mailNote = document.createElement('p');
        mailNote.textContent = draft.notice;
        var link = document.createElement('a');
        link.href = draft.href;
        link.textContent = 'Open email draft';
        box.append(mailNote, link);
      }
      el.appendChild(box);
    }

    function copyButton(text, value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.style.minHeight = '44px';
      button.disabled = !value;
      button.addEventListener('click', function () {
        if (!value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).catch(function () {});
      });
      return button;
    }

    paint();
    if (window.MutationObserver) {
      var obs = new MutationObserver(function () { paint(); });
      var lines = document.getElementById('lines');
      var tot = document.getElementById('tot');
      if (lines) obs.observe(lines, { childList: true, subtree: true, characterData: true });
      if (tot) obs.observe(tot, { childList: true, subtree: true, characterData: true });
    }
  }

  window.CBPay = {
    mount: mount,
    PAYID: C.PAYID,
    SOON: 'Price coming soon',
    label: function (n, cur) {
      return n == null ? 'Price coming soon' : '$' + (+n).toFixed(2) + ' ' + (cur || 'AUD');
    }
  };
})();
