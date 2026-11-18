/* Real food and prize orders for Coffeebreak Park Builder. PayID checkout only. */
(function () {
  var FOOD_IDS = { FoodStall: true };
  var PRIZE_IDS = { GiftShop: true, PrizeStall: true };
  var RANGE = 16;

  function $(id) { return document.getElementById(id); }

  function toast(text) {
    var msg = $('msg');
    if (!msg) return;
    msg.textContent = text;
    msg.style.opacity = 1;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { msg.style.opacity = 0; }, 2200);
  }

  function nearestKind() {
    var game = window.__game;
    if (!game || !game.player || !game.placed) return null;
    var best = null, bd = RANGE;
    for (var i = 0; i < game.placed.length; i++) {
      var p = game.placed[i];
      var dd = p.group.position.distanceTo(game.player.position);
      if (dd < bd) { bd = dd; best = p; }
    }
    if (!best || !best.data) return null;
    if (FOOD_IDS[best.data.id]) return 'food';
    if (PRIZE_IDS[best.data.id]) return 'prize';
    return null;
  }

  function itemsFor(kind) {
    var cart = window.CBGameCart;
    if (!cart || !cart.items) return [];
    return (cart.items() || []).filter(function (item) {
      if (kind === 'food') return item.kind === 'food';
      if (kind === 'prize') return item.kind === 'prize';
      return item.kind === 'food' || item.kind === 'prize';
    });
  }

  function closePanel() {
    var el = $('parkOrders');
    if (el) el.classList.remove('show');
  }

  function render(kind) {
    var el = $('parkOrders');
    if (!el) return;
    el.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = kind === 'food' ? 'Order food' : kind === 'prize' ? 'Choose a prize' : 'Real food & prizes';
    el.appendChild(h);
    var note = document.createElement('p');
    note.style.cssText = 'width:100%;margin:0;font-weight:normal;font-size:13px;line-height:1.4';
    note.textContent = 'These are real items. They go in the PayID cart. Checkout collects delivery name, address and phone. Fulfilment starts after the PayID lands.';
    el.appendChild(note);
    var list = itemsFor(kind);
    list.forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'piece';
      b.innerHTML = item.name + '<small>' + (item.amount ? (item.currency + ' $' + item.amount) : '') + '</small>';
      b.addEventListener('click', function () {
        if (!window.CBGameCart || !window.CBGameCart.add) return toast('The cart is still loading');
        var result = window.CBGameCart.add(item.id);
        if (result && result.ok) toast(item.name + ' added to the cart');
        else toast('That item could not be added');
        closePanel();
      });
      el.appendChild(b);
    });
    var cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'alt';
    cartBtn.textContent = 'Open cart';
    cartBtn.addEventListener('click', function () {
      if (window.CBGameCart && window.CBGameCart.open) window.CBGameCart.open();
      closePanel();
    });
    el.appendChild(cartBtn);
    el.classList.add('show');
  }

  function boot() {
    var btn = $('bOrders');
    if (btn) {
      btn.addEventListener('click', function () {
        var kind = nearestKind();
        render(kind);
      });
    }
    setInterval(function () {
      var hint = $('orderHint');
      var kind = nearestKind();
      if (!hint) {
        var top = $('top');
        if (!top) return;
        hint = document.createElement('span');
        hint.id = 'orderHint';
        hint.className = 'pill';
        hint.style.display = 'none';
        hint.style.cursor = 'pointer';
        hint.addEventListener('click', function () { render(nearestKind()); });
        top.appendChild(hint);
      }
      if (kind === 'food') {
        hint.style.display = '';
        hint.textContent = 'Order food';
      } else if (kind === 'prize') {
        hint.style.display = '';
        hint.textContent = 'Choose a prize';
      } else {
        hint.style.display = 'none';
      }
    }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
