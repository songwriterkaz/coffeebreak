/* Coffeebreak iOS-style code scanner and share card v1. No dependencies. Every step is inside try/catch.
   Files: cbscan-ios.js + cbscan-ios.css (+ optional jsQR for browsers without BarcodeDetector, such as iPhone Safari).
   API (window.CBScanIOS):
     open({parse, parsePaste, onConnect, onClose, icon, title, subtitle, jsqr, sound, haptic})
        parse(text) -> {name:'Mum'} or null     (null means "No usable code", the code is ignored)
        parsePaste(text) -> same, used by the paste box when the camera is not allowed (default: parse)
        onConnect(info, text) runs ONLY when the person taps the banner (or taps Add in the paste box)
        title(info) -> banner title (default 'Connect to ' + info.name), subtitle default 'WifiPhone'
     close()
     card(container, {text, name, sub, hint, qr, onShare}) -> {el, wrap, name, share, hint}   (the share-a-code card)
     qrCanvas(text, {size}) -> canvas (needs the global QRCode from qrcode.min.js)
     iconButton({label, onClick}) -> small QR icon button element for the home screen */
(function () {
  try {
    if (window.CBScanIOS) return;
    var d = document, NS = 'http://www.w3.org/2000/svg', SCRIPT = d.currentScript, cur = null;
    function el(t, c, txt) { var e = d.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
    function sv(t, a) { var e = d.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
    function html(c, h) { var e = d.createElement('span'); e.innerHTML = h; return e.firstChild; }
    var QR_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/></svg>';
    var SHARE_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
    var SUN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var X_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    var CH_ICON = '<svg class="cbsi-ch" width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 2l8 8-8 8"/></svg>';

    /* make sure the stylesheet is present */
    function ensureCss() {
      try {
        var ls = d.getElementsByTagName('link');
        for (var i = 0; i < ls.length; i++) if (/cbscan-ios\.css/.test(ls[i].getAttribute('href') || '')) return;
        var src = (SCRIPT && SCRIPT.src) || '', l = d.createElement('link');
        l.rel = 'stylesheet'; l.href = src ? src.replace(/cbscan-ios\.js.*$/, 'cbscan-ios.css') : 'cbscan-ios.css';
        d.head.appendChild(l);
      } catch (e) {}
    }
    ensureCss();

    /* ---------- QR drawing (share card) ---------- */
    function qrCanvas(text, o) {
      o = o || {};
      var c = d.createElement('canvas');
      try {
        var q = new QRCode(d.createElement('div'), { text: text, width: 64, height: 64, correctLevel: QRCode.CorrectLevel.M });
        var m = q._oQRCode, n = m.getModuleCount(), quiet = o.quiet == null ? 4 : o.quiet, tot = n + quiet * 2;
        var avail = o.size || Math.max(220, Math.min(380, (window.innerWidth || 390) - 82)), dpr = Math.min(window.devicePixelRatio || 1, 3);
        var px = Math.max(2, Math.floor(avail * dpr / tot)), size = px * tot;
        c.width = size; c.height = size; c.style.width = (size / dpr) + 'px'; c.style.height = (size / dpr) + 'px';
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#000';
        for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (m.isDark(r, k)) g.fillRect((k + quiet) * px, (r + quiet) * px, px, px);
        c.setAttribute('data-url', text);
      } catch (e) {}
      return c;
    }

    function card(container, o) {
      o = o || {};
      var r = {};
      try {
        var c = el('div', 'cbsi-card'); c.setAttribute('role', 'group'); c.setAttribute('aria-label', 'My code');
        var w = el('div', 'cbsi-qrw');
        if (o.qr) { [].concat(o.qr).forEach(function (n) { if (n) w.appendChild(n); }); }
        else if (o.text) w.appendChild(qrCanvas(o.text, o));
        var nm = el('div', 'cbsi-name', o.name || ''), sub = el('div', 'cbsi-sub', o.sub || 'WifiPhone');
        var sh = el('button', 'cbsi-share'); sh.type = 'button'; sh.innerHTML = SHARE_ICON + '<span>Share</span>';
        sh.addEventListener('click', function () { try { o.onShare && o.onShare(); } catch (e) {} });
        var hn = el('div', 'cbsi-hint'); hn.innerHTML = SUN_ICON; hn.appendChild(el('span', '', o.hint || 'Turn your brightness up for easier scanning'));
        c.appendChild(w); c.appendChild(nm); c.appendChild(sub); c.appendChild(sh); c.appendChild(hn);
        if (container) container.appendChild(c);
        r = { el: c, wrap: w, name: nm, sub: sub, share: sh, hint: hn };
      } catch (e) {}
      return r;
    }

    function iconButton(o) {
      o = o || {};
      var b = el('button', 'cbsi-iconbtn'); b.type = 'button'; b.setAttribute('aria-label', o.label || 'Code Scanner');
      b.innerHTML = QR_ICON; b.appendChild(el('span', '', o.label || 'Code Scanner'));
      b.addEventListener('click', function () { try { o.onClick && o.onClick(); } catch (e) {} });
      return b;
    }

    /* ---------- scanner ---------- */
    function roundedPath(p, rad) {
      var s = '', n = p.length;
      for (var i = 0; i < n; i++) {
        var a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n];
        var d1 = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, d2 = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1;
        var r1 = Math.min(rad, d1 / 3), r2 = Math.min(rad, d2 / 3);
        var p1 = [b[0] + (a[0] - b[0]) * r1 / d1, b[1] + (a[1] - b[1]) * r1 / d1];
        var p2 = [b[0] + (c[0] - b[0]) * r2 / d2, b[1] + (c[1] - b[1]) * r2 / d2];
        s += (i ? 'L' : 'M') + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'Q' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return s + 'Z';
    }

    function loadScript(src) {
      return new Promise(function (res, rej) {
        try {
          if (window.jsQR) return res();
          var s = d.createElement('script'); s.src = src; s.onload = function () { window.jsQR ? res() : rej(); }; s.onerror = rej; d.head.appendChild(s);
        } catch (e) { rej(e); }
      });
    }

    function open(o) {
      o = o || {};
      try { if (cur) cur.close(true); } catch (e) {}
      var S = { alive: true, stream: null, tgt: null, cur: null, text: '', info: null, lastSeen: 0, pillT: 0, busy: 0 };
      var root = el('div', 'cbsi'); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Code Scanner');
      var v = el('video', 'cbsi-v'); v.setAttribute('playsinline', ''); v.setAttribute('autoplay', ''); v.muted = true; v.setAttribute('muted', ''); v.setAttribute('webkit-playsinline', '');
      var top = el('div', 'cbsi-top'), x = el('button', 'cbsi-x'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = X_ICON;
      top.appendChild(x); top.appendChild(el('div', 'cbsi-tt', 'Code Scanner'));
      var br = el('div', 'cbsi-br'); for (var i = 0; i < 4; i++) br.appendChild(el('i'));
      var ol = sv('svg', { 'class': 'cbsi-ol', 'aria-hidden': 'true' }), path = sv('path', { d: '' }); ol.appendChild(path);
      var pill = el('div', 'cbsi-pill', 'No usable code'); pill.setAttribute('role', 'status');
      var bn = el('button', 'cbsi-banner'); bn.type = 'button';
      var ic;
      if (o.icon) { ic = d.createElement('img'); ic.className = 'cbsi-ic'; ic.alt = ''; ic.src = o.icon; ic.onerror = function () { ic.style.visibility = 'hidden'; }; }
      else { ic = el('span', 'cbsi-ic', 'W'); }
      var bt = el('span', 'cbsi-bt'), tt = el('span', 'cbsi-t', ''), ss = el('span', 'cbsi-s', o.subtitle || 'WifiPhone');
      bt.appendChild(tt); bt.appendChild(ss); bn.appendChild(ic); bn.appendChild(bt); bn.appendChild(html('', CH_ICON));
      bn.setAttribute('aria-live', 'polite');
      [v, top, br, ol, pill, bn].forEach(function (n) { root.appendChild(n); });
      d.body.appendChild(root);
      requestAnimationFrame(function () { root.classList.add('cbsi-on'); });

      function parse(t, paste) { try { var f = paste ? (o.parsePaste || o.parse) : o.parse; return f ? f(t) : null; } catch (e) { return null; } }
      function showPill() { try { pill.classList.add('cbsi-show'); clearTimeout(S.pillT); S.pillT = setTimeout(function () { pill.classList.remove('cbsi-show'); }, 1600); } catch (e) {} }
      function tick() { try { if (!S.alive) return; if (S.stream && !S.busy && v.videoWidth) { S.busy = 1; scan().then(function (r) { S.busy = 0; handle(r); }, function () { S.busy = 0; handle(null); }); } } catch (e) { S.busy = 0; } if (S.alive) S.timer = setTimeout(tick, 110); }
      var detector = null, jsOK = false, cv = d.createElement('canvas');
      function scan() {
        return new Promise(function (res) {
          var done = false;
          function js() {
            try {
              if (!jsOK || !window.jsQR) return res(null);
              var vw = v.videoWidth, vh = v.videoHeight, w = Math.min(640, vw), h = Math.round(vh * w / vw);
              cv.width = w; cv.height = h; var g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(v, 0, 0, w, h);
              var im = g.getImageData(0, 0, w, h), q = window.jsQR(im.data, w, h, { inversionAttempts: 'dontInvert' });
              if (!q) return res(null);
              var L = q.location, k = vw / w;
              res({ text: q.data, pts: [L.topLeftCorner, L.topRightCorner, L.bottomRightCorner, L.bottomLeftCorner].map(function (p) { return [p.x * k, p.y * k]; }) });
            } catch (e) { res(null); }
          }
          try {
            if (detector) {
              detector.detect(v).then(function (r) {
                if (r && r[0] && r[0].cornerPoints) return res({ text: r[0].rawValue, pts: r[0].cornerPoints.map(function (p) { return [p.x, p.y]; }) });
                js();
              }, js);
            } else js();
          } catch (e) { js(); }
        });
      }
      /* map a point in video pixels to the screen, same as object-fit: cover */
      function map(p) {
        var rw = root.clientWidth || innerWidth, rh = root.clientHeight || innerHeight, vw = v.videoWidth, vh = v.videoHeight;
        var sc = Math.max(rw / vw, rh / vh), ox = (rw - vw * sc) / 2, oy = (rh - vh * sc) / 2;
        return [p[0] * sc + ox, p[1] * sc + oy];
      }
      function centre(q) { var a = [0, 0]; q.forEach(function (p) { a[0] += p[0] / q.length; a[1] += p[1] / q.length; }); return a; }
      function hideAll() { S.text = ''; root.classList.remove('cbsi-has'); bn.classList.remove('cbsi-show'); }
      function handle(r) {
        try {
          var now = Date.now();
          if (!r || !r.text) { if (S.text && now - S.lastSeen > 1100) hideAll(); return; }
          var info = parse(r.text);
          if (!info) { showPill(); if (S.text) hideAll(); return; }
          S.lastSeen = now; S.tgt = r.pts.map(map);
          if (r.text !== S.text) {
            S.text = r.text; S.info = info;
            var c = centre(S.tgt); S.cur = S.tgt.map(function (p) { return [c[0] + (p[0] - c[0]) * 1.45, c[1] + (p[1] - c[1]) * 1.45]; });
            tt.textContent = (o.title ? o.title(info) : 'Connect to ' + (info.name || ''));
            root.classList.add('cbsi-has'); bn.classList.add('cbsi-show');
            if (o.haptic !== false) { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
            if (o.sound) tickSound();
          } else { root.classList.add('cbsi-has'); bn.classList.add('cbsi-show'); }
        } catch (e) {}
      }
      function frame() {
        try {
          if (!S.alive) return;
          if (S.tgt && S.cur) {
            for (var i = 0; i < 4; i++) { S.cur[i][0] += (S.tgt[i][0] - S.cur[i][0]) * 0.32; S.cur[i][1] += (S.tgt[i][1] - S.cur[i][1]) * 0.32; }
            var dd = roundedPath(S.cur, 16); path.setAttribute('d', dd);
            root.setAttribute('data-quad', JSON.stringify(S.tgt.map(function (p) { return [Math.round(p[0]), Math.round(p[1])]; })));
          }
        } catch (e) {}
        S.raf = requestAnimationFrame(frame);
      }
      var AC = null;
      function tickSound() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); var os = AC.createOscillator(), g = AC.createGain(); os.frequency.value = 1500; g.gain.value = .05; os.connect(g); g.connect(AC.destination); os.start(); os.stop(AC.currentTime + .05); } catch (e) {} }

      function denied(why) {
        try {
          if (root.querySelector('.cbsi-deny')) return;
          var p = el('div', 'cbsi-deny');
          p.appendChild(el('p', '', why || 'The camera is off or not allowed. You can paste a link or type a name here instead.'));
          var inp = el('input', 'cbsi-in'); inp.type = 'text'; inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('placeholder', 'Paste a link or type a name'); inp.setAttribute('aria-label', 'Paste a link or type a name');
          var go = el('button', 'cbsi-go', 'Add'); go.type = 'button'; var ms = el('div', 'cbsi-msg'); ms.setAttribute('role', 'status');
          function submit() {
            var t = (inp.value || '').trim(); if (!t) { ms.textContent = 'Please paste a link or type a name first.'; return; }
            var info = parse(t, true); if (!info) { ms.textContent = 'No usable code'; return; }
            try { o.onConnect && o.onConnect(info, t); } catch (e) {}
          }
          go.addEventListener('click', submit); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
          p.appendChild(inp); p.appendChild(go); p.appendChild(ms); root.appendChild(p);
          root.classList.remove('cbsi-has');
        } catch (e) {}
      }

      function stopStream() { try { S.stream && S.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} S.stream = null; try { v.srcObject = null; } catch (e) {} }
      S.close = function (silent) {
        try {
          if (!S.alive) return; S.alive = false; clearTimeout(S.timer); clearTimeout(S.pillT); try { cancelAnimationFrame(S.raf); } catch (e) {}
          stopStream(); d.removeEventListener('keydown', onKey, true); window.removeEventListener('pagehide', onHide);
          root.classList.remove('cbsi-on'); setTimeout(function () { try { root.remove(); } catch (e) {} }, 220);
          if (cur === S) cur = null;
          if (!silent) { try { o.onClose && o.onClose(); } catch (e) {} }
        } catch (e) {}
      };
      function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); S.close(); } }
      function onHide() { stopStream(); }
      d.addEventListener('keydown', onKey, true); window.addEventListener('pagehide', onHide);
      x.addEventListener('click', function () { S.close(); });
      bn.addEventListener('click', function () {
        try { var info = S.info, text = S.text; if (!info) return; o.onConnect && o.onConnect(info, text); } catch (e) {}
      });
      S.state = function () { return { text: S.text, info: S.info, quad: S.tgt, banner: tt.textContent, bannerShown: bn.classList.contains('cbsi-show'), outline: root.classList.contains('cbsi-has'), pill: pill.classList.contains('cbsi-show'), jsOK: jsOK, native: !!detector, video: [v.videoWidth, v.videoHeight] }; };
      cur = S;

      /* start the camera */
      (function start() {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return denied('This phone cannot open the camera here. You can paste a link or type a name instead.');
          navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(function (st) {
            if (!S.alive) { try { st.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} return; }
            S.stream = st; v.srcObject = st;
            try { var p = v.play(); p && p.catch && p.catch(function () {}); } catch (e) {}
            try { if ('BarcodeDetector' in window) detector = new window.BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { detector = null; }
            loadScript(o.jsqr || 'jsQR.js').then(function () { jsOK = true; }, function () { jsOK = false; if (!detector) denied('The scanner could not start on this phone. You can paste a link or type a name instead.'); });
            tick(); frame();
          }, function () { denied(); });
        } catch (e) { denied(); }
      })();
      return { close: S.close, state: S.state };
    }
    function close() { try { if (cur) cur.close(); } catch (e) {} }

    window.CBScanIOS = { open: open, close: close, card: card, qrCanvas: qrCanvas, iconButton: iconButton, version: 'cbsi-1.0', _state: function () { return cur ? cur.state() : null; } };
  } catch (e) {}
})();
