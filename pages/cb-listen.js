/* Coffeebreak music links: a small section just above the footer. Idempotent. */
(function(){
  if (window.__CB_LISTEN__) return;
  window.__CB_LISTEN__ = 1;
  try { if (window.top !== window.self) return; } catch (e) { return; }

  var YT = 'https://www.youtube.com/@coffeebreakTVSERIES';
  var SHORTS = 'https://www.youtube.com/@coffeebreakTVSERIES/shorts';
  var SPOTIFY = 'https://open.spotify.com/artist/05R0I9sslP9GnbSg6KzEr7';
  var APPLE = 'https://music.apple.com/au/artist/karen-obrien/535470355';

  function floating(el){
    for (var e = el; e && e !== document.body; e = e.parentElement) {
      var pos = getComputedStyle(e).position;
      if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') return true;
    }
    return false;
  }

  function findFooter(){
    var footers = document.querySelectorAll('footer');
    var i, f;
    for (i = 0; i < footers.length; i++) {
      f = footers[i];
      if (floating(f)) continue;
      if (f.querySelector('a[href*="tesla.com"], a[href*="starlink.com"]')) return f;
    }
    for (i = 0; i < footers.length; i++) {
      f = footers[i];
      if (floating(f) || f.id === 'cb-game-legal') continue;
      if (/disclaimer/i.test(f.textContent || '')) return f;
    }
    for (i = 0; i < footers.length; i++) {
      f = footers[i];
      if (floating(f) || f.id === 'cb-game-legal') continue;
      return f;
    }
    return null;
  }

  function link(href, label){
    var a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = label;
    return a;
  }

  function sep(){
    return document.createTextNode(' \u00b7 ');
  }

  function inject(){
    if (!document.body || document.getElementById('cb-listen')) return;
    var host = findFooter();
    var box = document.createElement('section');
    box.id = 'cb-listen';
    box.setAttribute('aria-label', 'Listen to Coffeebreak music');
    box.style.cssText = 'display:block;box-sizing:border-box;width:100%;flex:0 0 100%;clear:both;max-width:820px;margin:16px auto 8px;padding:8px 12px;font:14px/1.45 system-ui,sans-serif;text-align:center;color:inherit;position:static;';

    var title = document.createElement('p');
    title.style.cssText = 'margin:0 0 6px;font-weight:700';
    title.textContent = 'Listen to Coffeebreak music';
    box.appendChild(title);

    var links = document.createElement('p');
    links.style.cssText = 'margin:0';
    links.appendChild(link(YT, 'YouTube'));
    links.appendChild(sep());
    links.appendChild(link(SHORTS, 'Healing Prayer Shorts'));
    links.appendChild(sep());
    links.appendChild(link(SPOTIFY, 'Spotify'));
    links.appendChild(sep());
    links.appendChild(link(APPLE, 'Apple Music'));
    box.appendChild(links);

    if (host && host.parentNode) host.parentNode.insertBefore(box, host);
    else document.body.appendChild(box);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();
