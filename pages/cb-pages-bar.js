/* Coffeebreak Pages top bar — idempotent */
(function(){
  if (window.__CB_PAGES_BAR__) return;
  window.__CB_PAGES_BAR__ = 1;
  if (document.getElementById('cb-pages-topbar')) return;
  function inject(){
    if (document.getElementById('cb-pages-topbar')) return;
    var bar = document.createElement('div');
    bar.id = 'cb-pages-topbar';
    bar.setAttribute('data-cb-pages-bar','1');
    bar.innerHTML = '<a href="https://songwriterkaz.github.io/coffeebreak/pages/" style="color:inherit;text-decoration:none;font-weight:700">📒 Coffeebreak Pages</a>'
      + '<span style="opacity:.75;margin:0 8px">·</span>'
      + '<a href="https://songwriterkaz.github.io/coffeebreak/" style="color:inherit;text-decoration:none">Hub</a>';
    bar.style.cssText = 'position:sticky;top:0;z-index:99999;display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding:6px 10px;font:600 13px/1.3 system-ui,sans-serif;background:#f6e27a;color:#2a2208;border-bottom:2px solid #2a2208;box-shadow:0 2px 0 rgba(0,0,0,.08)';
    if (!document.body) return;
    document.body.insertBefore(bar, document.body.firstChild);
    document.documentElement.style.scrollPaddingTop = '36px';
  }
  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();

/* Load the shared verse-of-the-day footer line */
(function(){
  if (window.__CB_VERSE__ || document.getElementById('cb-verse-script')) return;
  var s = document.createElement('script');
  s.id = 'cb-verse-script';
  s.src = 'https://songwriterkaz.github.io/coffeebreak/pages/cb-verse.js';
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();

/* Load the shared Listen to Coffeebreak music section */
(function(){
  if (window.__CB_LISTEN__ || document.getElementById('cb-listen-script')) return;
  var s = document.createElement('script');
  s.id = 'cb-listen-script';
  s.src = 'https://songwriterkaz.github.io/coffeebreak/pages/cb-listen.js';
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();

/* Load the shared GoFundMe donation link */
(function(){
  if (window.__CB_GOFUNDME__ || document.getElementById('cb-gofundme-script')) return;
  var s = document.createElement('script');
  s.id = 'cb-gofundme-script';
  s.src = 'https://songwriterkaz.github.io/coffeebreak/pages/cb-gofundme.js';
  s.defer = true;
  (document.head || document.documentElement).appendChild(s);
})();
