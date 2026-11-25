/* KOB Country Music Record Store. Catalog titles come from the Coffeebreak radio and records lists. */
(function () {
  'use strict';
  var KEY = 'cb-kob-store-v1';
  var PRICE = 10;
  var SONGS = [
    ['Coffee Break', 'Coffeebreak Sessions'],
    ['Coffee', 'Coffeebreak Sessions'],
    ['Coffee Break Ride', 'Coffeebreak Sessions'],
    ['Coffeebreak', 'Coffeebreak Sessions'],
    ['Coffeebreak Moments', 'Coffeebreak Sessions'],
    ['Coffeebreak Grind', 'Coffeebreak Sessions'],
    ['Coffeebreak Car', 'Coffeebreak Sessions'],
    ['Coffeebreak Generator', 'Coffeebreak Sessions'],
    ['Coffeebreak After Dark', 'After Dark'],
    ["I'm Weak You Control My Body Now", 'After Dark'],
    ["KNEE DEEP x You're Already On Your Knees (Mashup)", 'After Dark'],
    ["That's My Naughty Girl (Hip Hop)", 'After Dark'],
    ['Sugar-Coated Fever', 'After Dark'],
    ['Talk Is Cheap', 'After Dark'],
    ['Cinnamon Candy', 'Candy Country'],
    ['Sweet Juices Cotton Candy', 'Candy Country'],
    ['Drip Drip Drip Country', 'Candy Country'],
    ['Kicking Marshmallows Up the Mud', 'Candy Country'],
    ['Fussell St', 'Candy Country'],
    ['A Delicious Disaster', 'Candy Country'],
    ['Restless Engine', 'Restless Engine'],
    ['Salsa Glitch', 'Restless Engine'],
    ['Thunder in My Hands', 'Restless Engine'],
    ["That's My Naughty Girl (Take 1)", 'Naughty Girl'],
    ["That's My Naughty Girl (Take 3)", 'Naughty Girl'],
    ["That's My Naughty Girl (Take 4)", 'Naughty Girl']
  ];
  var FORMATS = ['Single', 'Album', 'Vinyl', 'CD', 'Cassette', 'Merch', 'Bundle', 'Lyric Sheet'];
  var PHYSICAL = { Vinyl: 1, CD: 1, Cassette: 1, Merch: 1, 'Lyric Sheet': 1 };

  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  var products = [];
  SONGS.forEach(function (pair) {
    products.push({
      id: 'dig-' + slug(pair[0]),
      title: pair[0],
      album: pair[1],
      kind: 'Digital',
      format: 'Single',
      price: PRICE,
      note: 'Digital single. US$' + PRICE + '.'
    });
  });
  ['Coffeebreak Sessions', 'After Dark', 'Candy Country', 'Restless Engine', 'Naughty Girl'].forEach(function (album) {
    products.push({
      id: 'alb-' + slug(album),
      title: album,
      album: album,
      kind: 'Digital',
      format: 'Album',
      price: PRICE,
      note: 'Digital album. US$' + PRICE + '.'
    });
    products.push({
      id: 'bun-' + slug(album),
      title: album + ' bundle',
      album: album,
      kind: 'Physical',
      format: 'Bundle',
      price: PRICE,
      note: 'Pre-order. Album download plus a printed lyric sheet. US$' + PRICE + '.'
    });
  });
  SONGS.forEach(function (pair, i) {
    var format = ['Vinyl', 'CD', 'Cassette', 'Lyric Sheet', 'Merch'][i % 5];
    products.push({
      id: 'phy-' + slug(pair[0]) + '-' + slug(format),
      title: pair[0],
      album: pair[1],
      kind: 'Physical',
      format: format,
      price: PRICE,
      note: 'Pre-order. US$' + PRICE + '. Coffeebreak / KOB.'
    });
  });

  function load() {
    var s = { cart: [], wish: [], kind: '', format: '' };
    try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) Object.assign(s, raw); } catch (e) {}
    s.cart = Array.isArray(s.cart) ? s.cart : [];
    s.wish = Array.isArray(s.wish) ? s.wish : [];
    return s;
  }
  var state = load();
  function save() { localStorage.setItem(KEY, JSON.stringify({ cart: state.cart, wish: state.wish })); paintCounts(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function byId(id) { for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i]; return null; }
  function paintCounts() {
    document.getElementById('cart-n').textContent = String(state.cart.length);
    document.getElementById('wish-n').textContent = String(state.wish.length);
  }

  function visible() {
    var q = (document.getElementById('q').value || '').toLowerCase().trim();
    return products.filter(function (p) {
      if (state.kind && p.kind !== state.kind) return false;
      if (state.format && p.format !== state.format) return false;
      if (!q) return true;
      return (p.title + ' ' + p.album + ' ' + p.format + ' ' + p.kind).toLowerCase().indexOf(q) >= 0;
    });
  }
  function renderShelf() {
    var rows = visible();
    var box = document.getElementById('shelf');
    if (!rows.length) { box.innerHTML = '<p>No titles match that search.</p>'; return; }
    box.innerHTML = rows.map(function (p) {
      var wished = state.wish.indexOf(p.id) >= 0;
      return '<article class="item"><div class="disc">' + esc(p.format) + '</div><h3>' + esc(p.title) + '</h3><p>' + esc(p.album) + ' · ' + esc(p.kind) + '</p><p class="price">US$' + p.price.toFixed(2) + (p.kind === 'Physical' ? ' · pre-order' : '') + '</p><p>' + esc(p.note) + '</p><div class="row"><button type="button" class="btn" data-add="' + esc(p.id) + '">Add to cart</button><button type="button" class="btn quiet" data-wish="' + esc(p.id) + '">' + (wished ? 'In wishlist' : 'Wishlist') + '</button></div></article>';
    }).join('');
  }
  function renderFilters() {
    var bits = [{ id: '', label: 'All' }, { id: 'Digital', label: 'Digital' }, { id: 'Physical', label: 'Physical' }];
    var html = bits.map(function (b) {
      return '<button type="button" data-kind="' + b.id + '"' + (state.kind === b.id ? ' class="on"' : '') + '>' + b.label + '</button>';
    }).join('');
    html += FORMATS.map(function (f) {
      return '<button type="button" data-format="' + f + '"' + (state.format === f ? ' class="on"' : '') + '>' + f + '</button>';
    }).join('');
    document.getElementById('filters').innerHTML = html;
  }

  function openDrawer(mode) {
    var drawer = document.getElementById('drawer');
    drawer.hidden = false;
    document.getElementById('drawer-title').textContent = mode === 'wish' ? 'Wishlist' : 'Cart';
    var ids = mode === 'wish' ? state.wish : state.cart;
    var body = document.getElementById('drawer-body');
    if (!ids.length) { body.innerHTML = '<p>Nothing here yet.</p>'; return; }
    var total = 0;
    body.innerHTML = ids.map(function (id) {
      var p = byId(id);
      if (!p) return '';
      if (mode !== 'wish') total += p.price;
      return '<article class="item"><h3>' + esc(p.title) + '</h3><p>' + esc(p.format) + ' · ' + esc(p.kind) + ' · US$' + p.price.toFixed(2) + '</p><button type="button" class="btn quiet" data-remove="' + esc(id) + '" data-mode="' + mode + '">Remove</button></article>';
    }).join('');
    if (mode !== 'wish') {
      var ref = 'KOB' + String(state.cart.join('').length + 1000);
      body.innerHTML += '<section class="panel"><h2>Checkout</h2><p>Total <b>US$' + total.toFixed(2) + '</b></p><p>Pay by PayID (Teachers Mutual Bank): <b>darkokaz@gmx.com</b></p><p>Reference: <b>' + esc(ref) + '</b></p><p>This page does not confirm payment. Send the PayID with that reference, then email darkokaz@gmx.com if you want the order checked.</p></section>';
    }
  }

  document.getElementById('shelf').addEventListener('click', function (ev) {
    var add = ev.target.getAttribute && ev.target.getAttribute('data-add');
    var wish = ev.target.getAttribute && ev.target.getAttribute('data-wish');
    if (add) { if (state.cart.indexOf(add) < 0) state.cart.push(add); save(); openDrawer('cart'); }
    if (wish) {
      var i = state.wish.indexOf(wish);
      if (i >= 0) state.wish.splice(i, 1); else state.wish.push(wish);
      save(); renderShelf();
    }
  });
  document.getElementById('filters').addEventListener('click', function (ev) {
    if (ev.target.hasAttribute('data-kind')) { state.kind = ev.target.getAttribute('data-kind'); state.format = ''; }
    if (ev.target.hasAttribute('data-format')) { state.format = state.format === ev.target.getAttribute('data-format') ? '' : ev.target.getAttribute('data-format'); }
    renderFilters(); renderShelf();
  });
  document.getElementById('q').addEventListener('input', renderShelf);
  document.getElementById('open-cart').addEventListener('click', function () { openDrawer('cart'); });
  document.getElementById('open-wish').addEventListener('click', function () { openDrawer('wish'); });
  document.getElementById('drawer-close').addEventListener('click', function () { document.getElementById('drawer').hidden = true; });
  document.getElementById('drawer').addEventListener('click', function (ev) {
    if (ev.target.id === 'drawer') document.getElementById('drawer').hidden = true;
    var id = ev.target.getAttribute && ev.target.getAttribute('data-remove');
    if (!id) return;
    var mode = ev.target.getAttribute('data-mode');
    var list = mode === 'wish' ? state.wish : state.cart;
    var i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    save(); renderShelf(); openDrawer(mode);
  });
  document.getElementById('request-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var name = document.getElementById('req-name').value.trim();
    var song = document.getElementById('req-song').value.trim();
    var note = document.getElementById('req-note').value.trim();
    var body = 'Name: ' + name + '\nSong: ' + song + '\n\n' + note;
    location.href = 'mailto:darkokaz@gmx.com?subject=' + encodeURIComponent('KOB record store song request: ' + song) + '&body=' + encodeURIComponent(body);
  });

  renderFilters();
  renderShelf();
  paintCounts();
})();
