/* Coffeebreak voluntary GoFundMe link. Donation only. Does not buy coins or items. */
(function () {
  if (window.__CB_GOFUNDME__) return;
  window.__CB_GOFUNDME__ = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }

  var URL = 'https://www.gofundme.com/f/help-our-family-through-multiple-health-crises-advocacy-st';
  var FOOTER_LABEL = 'Support Coffeebreak on GoFundMe';
  var GAME_LABEL = 'Donate on GoFundMe';
  var PAYID = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var EXTRA = {
    'park-builder': 1,
    'coffeebreak-pool': 1,
    'coffeebreak-pool-snacks': 1,
    'pink-pinball': 1,
    'tattoo-game': 1,
    'chess-thriller': 1,
    'prayer-games': 1,
    'projector-games': 1,
    'titanic-games': 1,
    'sparkrunners': 1,
    'dollhaunt': 1,
    'haunted-bunker': 1,
    'cup-day-game': 1,
    'critterchess': 1,
    'pink-bowling-arcade': 1,
    'haunted-mansion-3d': 1,
    'cb-haunted-map': 1,
    'latte-lantern-haunt': 1,
    'hauntedmansion': 1,
    'haunted-plushies-ghost-talker': 1,
    'haunted-doll': 1,
    'haunted-doll-shop': 1,
    'titanic-thriller': 1,
    'titanic-thriller-demo': 1
  };

  function inScope() {
    var path = location.pathname.replace(/\/index\.html$/i, '/');
    if (/\/apps\//.test(path)) return true;
    if (/\/coffeebreak\/?$/.test(path)) return true;
    if (path === '/' || path === '') return true;
    return false;
  }

  function pathIsGame(path) {
    var parts = path.split('/');
    var i, seg, base;
    for (i = 0; i < parts.length; i++) {
      seg = parts[i];
      if (!seg) continue;
      if (/-free-demo$/.test(seg)) return true;
      if (EXTRA[seg]) return true;
      if (/-buy$/.test(seg)) {
        base = seg.replace(/-buy$/, '');
        if (EXTRA[base] || /-free-demo$/.test(base)) return true;
      }
    }
    return false;
  }

  function isGame() {
    if (!/\/apps\//.test(location.pathname)) return false;
    if (pathIsGame(location.pathname)) return true;
    if (document.querySelector('script[data-kind="game"]')) return true;
    var scripts = document.querySelectorAll('script[src]');
    var i, src;
    for (i = 0; i < scripts.length; i++) {
      src = scripts[i].getAttribute('src') || '';
      if (/(^|\/)game\.js(\?|#|$)/.test(src)) return true;
    }
    return false;
  }

  function makeLink(label) {
    var a = document.createElement('a');
    a.href = URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    return a;
  }

  function findTeslaAnchor() {
    var links = document.querySelectorAll('a[href*="tesla.com"], a[href*="starlink.com"]');
    var i, a, best = null;
    for (i = 0; i < links.length; i++) {
      a = links[i];
      if (a.closest('#cb-gofundme, #cb-send-money, #cb-send-money-panel')) continue;
      if (a.closest('footer')) return a;
      if (!best) best = a;
    }
    return best;
  }

  function findFooter() {
    var footers = document.querySelectorAll('footer');
    var i, f, pos;
    for (i = 0; i < footers.length; i++) {
      f = footers[i];
      pos = window.getComputedStyle(f).position;
      if (pos === 'fixed' || pos === 'absolute') continue;
      if (f.querySelector('a[href*="tesla.com"], a[href*="starlink.com"]')) return f;
    }
    for (i = 0; i < footers.length; i++) {
      f = footers[i];
      pos = window.getComputedStyle(f).position;
      if (pos === 'fixed' || pos === 'absolute' || f.id === 'cb-game-legal') continue;
      return f;
    }
    return footers.length ? footers[0] : null;
  }

  function injectFooter() {
    if (!document.body || document.getElementById('cb-gofundme')) return;
    var wrap = document.createElement('p');
    wrap.id = 'cb-gofundme';
    wrap.style.cssText = 'margin:8px 0;text-align:center';
    var a = makeLink(FOOTER_LABEL);
    a.style.cssText = 'display:inline-block;margin:4px 0;padding:6px 12px;border-radius:999px;background:#c2185b;color:#fff;font:600 13px/1.2 system-ui,sans-serif;text-decoration:none';
    wrap.appendChild(a);

    var anchor = findTeslaAnchor();
    if (anchor) {
      var block = anchor;
      while (block.parentElement && block.parentElement !== document.body && !/^(FOOTER|DIV|SECTION|MAIN|HEADER|BODY)$/.test(block.parentElement.tagName)) {
        block = block.parentElement;
      }
      if (block.parentNode) {
        block.parentNode.insertBefore(wrap, block);
        return;
      }
    }
    var footer = findFooter();
    if (footer) footer.insertBefore(wrap, footer.firstChild);
    else document.body.appendChild(wrap);
  }

  function sellsCoins() {
    if (document.getElementById('buyBtn') || document.getElementById('buyScreen')) return true;
    var buttons = document.querySelectorAll('button, a');
    var i;
    for (i = 0; i < buttons.length; i++) {
      if (/buy coins/i.test(buttons[i].textContent || '')) return true;
    }
    return false;
  }

  function ensureCoinPayId() {
    if (!sellsCoins() || document.getElementById('cb-coin-payid')) return;
    if ((document.body.textContent || '').indexOf(PAYID) !== -1) return;
    var p = document.createElement('p');
    p.id = 'cb-coin-payid';
    p.textContent = PAYID;
    var screen = document.getElementById('buyScreen');
    var btn = document.getElementById('buyBtn');
    if (screen) screen.appendChild(p);
    else if (btn && btn.parentNode) btn.parentNode.insertBefore(p, btn.nextSibling);
  }

  function donateBlock() {
    var box = document.createElement('div');
    var note = document.createElement('p');
    note.style.cssText = 'margin:0 0 8px';
    note.textContent = 'Voluntary donation. This does not buy coins or items.';
    var a = makeLink(GAME_LABEL);
    a.style.cssText = 'display:inline-block;padding:6px 12px;border-radius:999px;background:#c2185b;color:#fff;font:600 13px/1.2 system-ui,sans-serif;text-decoration:none';
    box.appendChild(note);
    box.appendChild(a);
    return box;
  }

  function existingSendButton() {
    var buttons = document.querySelectorAll('button, [role="button"]');
    var i, t;
    for (i = 0; i < buttons.length; i++) {
      t = (buttons[i].textContent || '').replace(/\s+/g, ' ').trim();
      if (t === 'Send money') return buttons[i];
    }
    return null;
  }

  function mountSendMoney() {
    if (document.getElementById('cb-send-money-panel')) return;
    var existing = existingSendButton();
    var panel = document.createElement('div');
    panel.id = 'cb-send-money-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Send money');
    panel.hidden = true;
    panel.style.cssText = 'position:fixed;z-index:99990;max-width:min(320px,92vw);background:#fff;color:#4a1030;border:2px solid #c2185b;border-radius:14px;padding:12px;text-align:center;font:14px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18)';
    panel.appendChild(donateBlock());

    var btn = existing;
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'cb-send-money-btn';
      btn.textContent = 'Send money';
    }
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'cb-send-money-panel');
    if (!btn.dataset.cbSendBound) {
      btn.dataset.cbSendBound = '1';
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        panel.hidden = !panel.hidden;
        btn.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
      });
    }

    var bar = document.getElementById('bar');
    if (!existing && bar) bar.appendChild(btn);
    else if (!existing) {
      btn.style.cssText = 'position:fixed;top:46px;right:8px;z-index:99990;padding:6px 10px;border-radius:999px;border:0;background:#c2185b;color:#fff;font:600 13px/1.2 system-ui,sans-serif;cursor:pointer';
      document.body.appendChild(btn);
    }
    if (bar && (existing ? bar.contains(existing) : true) && bar.contains(btn)) {
      panel.style.left = '50%';
      panel.style.bottom = '78px';
      panel.style.transform = 'translateX(-50%)';
    } else {
      panel.style.top = '84px';
      panel.style.right = '8px';
    }
    document.body.appendChild(panel);
  }

  function start() {
    if (!inScope() || !document.body) return;
    injectFooter();
    if (!isGame()) return;
    mountSendMoney();
    ensureCoinPayId();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
