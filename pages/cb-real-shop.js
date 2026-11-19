/* Coffeebreak real shop panel for games.
   Reads <script type="application/json" id="cb-real-shop-data"> and opens a panel of item cards
   when any element with data-cb-real-shop is pressed. Links go to live Coffeebreak store pages,
   where checkout is the shared PayID cart (eBay items check out on eBay). Drawn icons only, no photos. */
(function () {
  if (window.CBRealShop) return;
  var data = null, box = null, lastFocus = null;
  function read() {
    if (data) return data;
    var el = document.getElementById('cb-real-shop-data');
    try { data = JSON.parse(el ? el.textContent : 'null'); } catch (e) { data = null; }
    return data;
  }
  function css() {
    if (document.getElementById('cb-real-shop-css')) return;
    var s = document.createElement('style'); s.id = 'cb-real-shop-css';
    s.textContent = '#cb-real-shop{position:fixed;inset:0;z-index:2147483647;background:rgba(20,8,30,.6);display:flex;align-items:flex-end;justify-content:center;font:15px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
      '#cb-real-shop[hidden]{display:none}' +
      '#cb-real-shop .crs-box{background:#fff7fb;color:#3a1830;width:min(760px,100%);max-height:86vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px 16px 22px;box-shadow:0 -6px 24px rgba(0,0,0,.3)}' +
      '@media(min-width:700px){#cb-real-shop{align-items:center}#cb-real-shop .crs-box{border-radius:18px}}' +
      '#cb-real-shop .crs-head{display:flex;align-items:center;gap:10px;margin:0 0 6px}#cb-real-shop .crs-head img{width:44px;height:44px;border-radius:50%;object-fit:cover;background:#fff}' +
      '#cb-real-shop h2{margin:0;font-size:1.2rem;flex:1;color:#7a1d56}#cb-real-shop .crs-x{min-width:44px;min-height:44px;border:0;border-radius:12px;background:#f3d6e6;color:#3a1830;font:700 15px system-ui,sans-serif;cursor:pointer}' +
      '#cb-real-shop .crs-note{margin:0 0 12px;color:#6a4560;font-size:.92rem}' +
      '#cb-real-shop .crs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}' +
      '#cb-real-shop .crs-card{display:flex;flex-direction:column;gap:4px;background:#fff;border:1px solid #f0cfe0;border-radius:14px;padding:10px;color:inherit;text-decoration:none}' +
      '#cb-real-shop .crs-card:hover,#cb-real-shop .crs-card:focus-visible{border-color:#d6336c;outline:2px solid #d6336c33}' +
      '#cb-real-shop .crs-art{height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:34px;background:linear-gradient(135deg,#ffe0f0,#e6dcff)}' +
      '#cb-real-shop .crs-name{font-weight:700}#cb-real-shop .crs-price{font-weight:800;color:#b0245e}#cb-real-shop .crs-store{font-size:.85rem;color:#6a4560}' +
      '#cb-real-shop .crs-go{margin-top:auto;font-weight:700;color:#d6336c}' +
      '#cb-real-shop .crs-foot{margin:12px 0 0;font-size:.8rem;color:#6a4560}#cb-real-shop .crs-foot a{color:#b0245e}';
    document.head.appendChild(s);
  }
  function build() {
    var d = read(); if (!d || !d.items) return null;
    css();
    box = document.createElement('div'); box.id = 'cb-real-shop'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'crs-title');
    var inner = document.createElement('div'); inner.className = 'crs-box';
    var head = document.createElement('div'); head.className = 'crs-head';
    if (d.logo) { var lg = document.createElement('img'); lg.src = d.logo; lg.alt = 'Coffeebreak logo'; head.appendChild(lg); }
    var h = document.createElement('h2'); h.id = 'crs-title'; h.textContent = d.title || 'Real things from Coffeebreak'; head.appendChild(h);
    var x = document.createElement('button'); x.type = 'button'; x.className = 'crs-x'; x.textContent = 'Close'; x.addEventListener('click', close); head.appendChild(x);
    inner.appendChild(head);
    if (d.note) { var n = document.createElement('p'); n.className = 'crs-note'; n.textContent = d.note; inner.appendChild(n); }
    var grid = document.createElement('div'); grid.className = 'crs-grid';
    d.items.forEach(function (it) {
      var a = document.createElement('a'); a.className = 'crs-card'; a.href = it.url; a.target = '_blank'; a.rel = 'noopener';
      a.setAttribute('data-crs-store', it.store || '');
      var art = document.createElement('div'); art.className = 'crs-art'; art.setAttribute('aria-hidden', 'true'); art.textContent = it.icon || '\u2615';
      if (it.bg) art.style.background = it.bg;
      var nm = document.createElement('div'); nm.className = 'crs-name'; nm.textContent = it.name;
      var pr = document.createElement('div'); pr.className = 'crs-price'; pr.textContent = it.price || '';
      var st = document.createElement('div'); st.className = 'crs-store'; st.textContent = (it.store || '') + (it.checkout ? ' \u00b7 ' + it.checkout : '');
      var go = document.createElement('div'); go.className = 'crs-go'; go.textContent = it.cta || 'View in the store';
      a.append(art, nm, pr, st, go);
      if (it.why) { var w = document.createElement('div'); w.className = 'crs-store'; w.textContent = it.why; a.insertBefore(w, go); }
      grid.appendChild(a);
    });
    inner.appendChild(grid);
    var f = document.createElement('p'); f.className = 'crs-foot';
    f.textContent = (d.foot || 'Prices as shown in each store. Real items are optional; the game stays free to play.') + ' ';
    inner.appendChild(f);
    box.appendChild(inner);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Escape') close(); });
    box.addEventListener('keyup', function (e) { e.stopPropagation(); });
    document.body.appendChild(box);
    return box;
  }
  function open() {
    if (!box && !build()) return;
    lastFocus = document.activeElement; document.body.appendChild(box); box.hidden = false;
    var x = box.querySelector('.crs-x'); if (x) x.focus();
  }
  function close() { if (!box) return; box.hidden = true; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-cb-real-shop]') : null;
    if (!t) return; e.preventDefault(); open();
  });
  window.CBRealShop = { open: open, close: close, isOpen: function () { return !!box && !box.hidden; } };
})();
