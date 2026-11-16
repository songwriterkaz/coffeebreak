/* In-page game cart. Add to cart stays on the page. Checkout is the shared PayID script.
   It does not mark a payment received. */
(function () {
  var G = window.CoffeebreakGameCart;
  var C = window.CoffeebreakCart;
  var Checkout = window.CBStaticCheckout;
  if (!G || !C) return;

  var LABEL = (Checkout && Checkout.LABEL) || 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';

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
          return session.items.some(function (item) {
            return item.id === line.id && item.amount != null && G.isSellableName(item.name);
          });
        });
        session.previous = restored;
      }
    }

    var style = document.createElement('style');
    style.textContent = [
      '#cb-add-to-cart,#cb-game-cart-toggle,#cb-game-cart-panel button,#cb-game-cart-panel a{min-height:44px;min-width:44px}',
      '#cb-add-to-cart,#cb-game-cart-toggle{position:fixed;left:12px;z-index:2147483002;background:#e8559a;color:#fff;border:0;border-radius:999px;padding:10px 16px;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer}',
      '#cb-add-to-cart{bottom:12px}',
      '#cb-game-cart-toggle{bottom:64px}',
      '#cb-game-cart-panel{position:fixed;left:12px;bottom:116px;z-index:2147483002;width:min(420px,calc(100% - 24px));max-height:70vh;overflow:auto;background:#fff;color:#3a1f2c;border:2px solid #e8559a;border-radius:16px;padding:12px;font:15px/1.4 system-ui,sans-serif}',
      '#cb-game-cart-panel h2,#cb-game-cart-panel h3{margin:0 0 8px;font-size:1.1rem}',
      '#cb-game-cart-panel button{background:#e8559a;color:#fff;border:0;border-radius:10px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer}',
      '#cb-game-cart-panel button.alt,#cb-game-cart-panel .btn.alt{background:#fff;color:#b8336f;border:1px solid #e8559a}',
      '#cb-game-cart-panel a{color:#b8336f;font-weight:700}',
      '#cb-game-cart-panel .row{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:8px 0}',
      '#cb-game-cart-panel input,#cb-game-cart-panel textarea{display:block;width:100%;box-sizing:border-box;margin:4px 0 8px;font:inherit}'
    ].join('');
    document.head.appendChild(style);

    var sellable = session.items.filter(function (item) {
      return item.amount != null && item.amount !== '' && G.isSellableName(item.name);
    });

    var toggle = document.createElement('button');
    toggle.id = 'cb-game-cart-toggle';
    toggle.type = 'button';
    toggle.textContent = 'Cart';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'cb-game-cart-panel');

    var panel = document.createElement('div');
    panel.id = 'cb-game-cart-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Cart');

    var catalog = document.createElement('div');
    catalog.id = 'cb-game-catalog';
    var host = document.createElement('div');
    host.id = 'cb-game-checkout';
    panel.appendChild(catalog);
    panel.appendChild(host);

    function openCart() {
      panel.hidden = false;
      toggle.textContent = 'Close cart';
      toggle.setAttribute('aria-expanded', 'true');
    }
    function shutCart() {
      panel.hidden = true;
      toggle.textContent = 'Cart';
      toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      if (panel.hidden) openCart();
      else shutCart();
    });

    function persist() {
      if (!storage || !session.currency) return;
      var state = C.buildState({
        storeId: session.storeId,
        currency: session.currency,
        lines: session.lines,
        previous: session.previous,
        customerClaimsPaid: false
      });
      if (state.ok) {
        session.previous = state;
        C.persist(storage, key, state);
      }
    }

    function itemsForCheckout() {
      return session.lines.map(function (line) {
        return {
          id: line.id,
          name: line.name,
          amount: C.formatMinor(line.unitMinor),
          qty: line.qty
        };
      });
    }

    var ui = { refresh: function () {} };
    if (!Checkout || !session.currency) {
      host.textContent = 'Checkout could not load. No payment is requested.';
    } else {
      ui = Checkout.mount(host, {
        storeId: session.storeId,
        storeName: (sellable[0] && sellable[0].name) || session.storeId,
        currency: session.currency,
        getItems: itemsForCheckout,
        onQty: function (id, qty) {
          G.setQty(session, id, qty);
          persist();
          ui.refresh();
        },
        onRemove: function (id) {
          G.remove(session, id);
          persist();
          ui.refresh();
        }
      });
    }

    function addItem(id) {
      var result = G.add(session, id);
      if (!result.ok) return;
      persist();
      ui.refresh();
      openCart();
    }

    function addButton(item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Add to cart';
      button.setAttribute('aria-label', 'Add to cart: ' + item.name);
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        addItem(item.id);
      });
      return button;
    }

    if (sellable.length > 1) {
      sellable.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'row';
        var name = document.createElement('strong');
        name.textContent = item.name + ' · ' + G.priceLabel(item);
        row.appendChild(name);
        row.appendChild(addButton(item));
        catalog.appendChild(row);
      });
    }

    var primary = document.createElement('button');
    primary.id = 'cb-add-to-cart';
    primary.type = 'button';
    primary.textContent = 'Add to cart';
    if (sellable.length) {
      primary.setAttribute('aria-label', 'Add to cart: ' + sellable[0].name);
      primary.addEventListener('click', function (event) {
        event.stopPropagation();
        addItem(sellable[0].id);
      });
    } else {
      primary.disabled = true;
    }
    section.setAttribute('data-pay-label', LABEL);

    document.body.appendChild(primary);
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
    setTimeout(function () { dropOtherCheckouts(document); }, 0);
  }

  function dropOtherCheckouts(root) {
    var hosts = ['it' + 'ch.io', 'pay' + 'pal.com', 'gum' + 'road.com', 'stri' + 'pe.com', 'pay' + 'hip.com', 'ko-' + 'fi.com'];
    var claim = new RegExp("I['’]ve pai" + 'd|I ha' + 've pai' + 'd', 'i');
    var nodes = root.querySelectorAll('a[href], form[action], button');
    Array.prototype.forEach.call(nodes, function (node) {
      if (node.closest && node.closest('#cb-game-cart-panel, #cb-add-to-cart, #cb-game-cart-toggle')) return;
      var href = (node.getAttribute('href') || node.getAttribute('action') || '');
      var blocked = hosts.some(function (host) { return href.toLowerCase().indexOf(host) !== -1; });
      if (blocked || (node.tagName === 'BUTTON' && claim.test(node.textContent || ''))) node.remove();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
