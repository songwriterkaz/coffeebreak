/* Coffeebreak call assist v1 (2026-10-23)
   Drop-in reliability layer for the Coffeebreak phone web apps. It does not change any app screen or setting.
   What it adds:
   - a small status pill (bottom left) that opens a help and self-test panel
   - better ICE servers (STUN plus free TURN fallbacks) merged into every PeerJS and WebRTC connection,
     and the dead openrelay.metered.ca relay removed
   - automatic reconnect to the signalling server, with back-off, when the connection drops or the phone comes back online
   - a wake lock while a call is connected so the screen does not sleep
   - plain-language messages for microphone permission, no microphone, offline and failed connection problems
   - memory storage fallback when a browser blocks localStorage inside an embedded frame
   - optional offline support (a small service worker) when the app has none
   To use your own TURN relay, fill in EXTRA_ICE below. Nothing else needs editing. */
(function () {
  'use strict';
  if (window.__cbassist) return;
  var VERSION = 'assist-1.0';
  var A = window.__cbassist = { version: VERSION, state: 'starting', events: [] };
  function log(m) { A.events.push(new Date().toTimeString().slice(0, 8) + ' ' + m); if (A.events.length > 80) A.events.shift(); }

  /* ---------- storage safety: some browsers block localStorage inside an embedded frame and throw, which kills the whole app ---------- */
  ['localStorage', 'sessionStorage'].forEach(function (nm) {
    var ok = true;
    try { var st = window[nm]; st.setItem('__cbt', '1'); st.removeItem('__cbt'); } catch (e) { ok = false; }
    if (ok) return;
    var mem = {};
    var fake = {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; },
      clear: function () { mem = {}; },
      key: function (i) { return Object.keys(mem)[i] || null; }
    };
    Object.defineProperty(fake, 'length', { get: function () { return Object.keys(mem).length; } });
    try { Object.defineProperty(window, nm, { configurable: true, get: function () { return fake; } }); } catch (e2) {}
    log(nm + ' blocked, using memory storage');
  });

  /* ---------- settings you can edit ---------- */
  var EXTRA_ICE = [
    /* Example (get free credentials from a TURN provider and paste them here):
       { urls: ['turn:YOUR.TURN.HOST:3478', 'turns:YOUR.TURN.HOST:5349'], username: 'USER', credential: 'PASSWORD' } */
  ];
  var FREE_TURN = [
    /* Public free relay used as a best-effort fallback. Not guaranteed by anyone, so the app also works without it. */
    { urls: ['turn:freestun.net:3478', 'turns:freestun.net:5349'], username: 'free', credential: 'free' }
  ];
  var STUN = [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    { urls: 'stun:stun.cloudflare.com:3478' }
  ];
  var DEAD_RELAY = /openrelay\.metered\.ca/i;
  var SIGNAL_TEST_URL = 'https://0.peerjs.com/peerjs/id';

  /* ---------- state ---------- */
  var S = { online: navigator.onLine !== false, signal: 'idle', call: 'none', relay: 'unknown', lastError: '' };
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var inFrame = false; try { inFrame = window.top !== window.self; } catch (e) { inFrame = true; }
  var uiUpdate = function () {};
  function ready(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  function toast(msg) {
    log('toast: ' + msg);
    ready(function () {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.setAttribute('role', 'status');
        toastEl.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:52px;max-width:92vw;background:#1d120c;color:#fff;border:1px solid #ffd84d;border-radius:12px;padding:10px 14px;font:600 14px/1.35 system-ui,sans-serif;z-index:2147483600;display:none;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.4)';
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = msg; toastEl.style.display = 'block';
      clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.style.display = 'none'; }, 7000);
    });
  }

  /* ---------- ICE servers ---------- */
  function urlsOf(s) { var u = s && (s.urls || s.url); return u ? (Array.isArray(u) ? u : [u]) : []; }
  function mergeIce(cfg) {
    var out = {}; var k;
    for (k in (cfg || {})) out[k] = cfg[k];
    var list = (cfg && cfg.iceServers ? cfg.iceServers : []).filter(function (s) {
      return !urlsOf(s).some(function (u) { return DEAD_RELAY.test(u); });
    });
    var hasStun = list.some(function (s) { return urlsOf(s).some(function (u) { return /^stuns?:/i.test(u); }); });
    var hasTurn = list.some(function (s) { return urlsOf(s).some(function (u) { return /^turns?:/i.test(u); }); });
    if (!hasStun) list = list.concat(STUN);
    EXTRA_ICE.forEach(function (s) { list.push(s); hasTurn = true; });
    if (!hasTurn) list = list.concat(FREE_TURN);
    out.iceServers = list;
    if (out.iceCandidatePoolSize === undefined) out.iceCandidatePoolSize = 2;
    return out;
  }
  A.mergeIce = mergeIce;

  /* ---------- PeerJS: better ICE, reconnect, clear errors ---------- */
  var peers = [];
  function nudge() {
    peers.forEach(function (p) {
      try { if (!p.destroyed && p.disconnected) { log('reconnect (nudge)'); p.reconnect(); } } catch (e) {}
    });
  }
  function hookPeer(p) {
    peers.push(p);
    var tries = 0, timer = null;
    function schedule() {
      clearTimeout(timer);
      var d = Math.min(30000, 1500 * Math.pow(2, tries));
      timer = setTimeout(function () {
        if (p.destroyed || !p.disconnected) return;
        tries++;
        try { log('reconnect attempt ' + tries); p.reconnect(); } catch (e) {}
        if (tries < 12) schedule();
      }, d);
    }
    p.on('open', function (id) { tries = 0; clearTimeout(timer); S.signal = 'online'; S.lastError = ''; log('signalling open ' + id); uiUpdate(); });
    p.on('disconnected', function () {
      if (p.destroyed) return;
      S.signal = 'reconnecting'; log('signalling disconnected'); uiUpdate(); schedule();
    });
    p.on('close', function () { S.signal = 'offline'; log('peer closed'); uiUpdate(); });
    p.on('error', function (err) {
      var t = (err && err.type) || 'unknown';
      S.lastError = t + (err && err.message ? ': ' + err.message : '');
      log('peer error ' + S.lastError);
      if (t === 'network' || t === 'server-error' || t === 'socket-error' || t === 'socket-closed') {
        S.signal = 'reconnecting'; toast('Cannot reach the call service. Check your internet. Trying again.');
        if (p.disconnected && !p.destroyed) schedule();
      } else if (t === 'unavailable-id') toast('That ID is already in use. Close other copies of the app and reload.');
      else if (t === 'browser-incompatible') toast('This browser cannot make calls. Try Chrome or Safari.');
      else if (t === 'peer-unavailable') toast('That number is not online. Check the number and that the other person has the app open.');
      else if (t === 'webrtc') toast('The call could not be set up. Tap Connection for help.');
      uiUpdate();
    });
  }
  function wrapPeer(Orig) {
    if (typeof Orig !== 'function' || Orig.__cba) return Orig;
    var W = class extends Orig {
      constructor(a, b) {
        var id = a, opts = b, args;
        if (a && typeof a === 'object') { opts = a; id = undefined; }
        opts = Object.assign({}, opts || {});
        opts.config = mergeIce(opts.config);
        args = id === undefined ? [opts] : [id, opts];
        super(...args);
        S.signal = 'connecting'; log('Peer created');
        try { hookPeer(this); } catch (e) { log('hook failed ' + e); }
        uiUpdate();
      }
    };
    W.__cba = true;
    try { Object.defineProperty(W, 'name', { value: Orig.name || 'Peer' }); } catch (e) {}
    return W;
  }
  (function trapPeer() {
    var cur = window.Peer;
    if (cur) { window.Peer = wrapPeer(cur); return; }
    var val;
    try {
      Object.defineProperty(window, 'Peer', {
        configurable: true, enumerable: true,
        get: function () { return val; },
        set: function (v) { val = wrapPeer(v); }
      });
    } catch (e) { log('Peer trap failed ' + e); }
  })();

  /* ---------- watch every RTCPeerConnection ---------- */
  var pcs = [], wakeLock = null;
  function takeWake() {
    try {
      if (navigator.wakeLock && !wakeLock && document.visibilityState === 'visible') {
        navigator.wakeLock.request('screen').then(function (l) { wakeLock = l; l.addEventListener('release', function () { wakeLock = null; }); }, function () {});
      }
    } catch (e) {}
  }
  function dropWake() { try { if (wakeLock) wakeLock.release(); } catch (e) {} wakeLock = null; }
  function callState() {
    var live = pcs.filter(function (p) { return p.connectionState !== 'closed' && p.iceConnectionState !== 'closed'; });
    pcs = live;
    var ok = live.some(function (p) { return p.connectionState === 'connected' || p.iceConnectionState === 'connected' || p.iceConnectionState === 'completed'; });
    var trying = live.some(function (p) { return p.iceConnectionState === 'checking' || p.connectionState === 'connecting'; });
    var bad = live.some(function (p) { return p.connectionState === 'failed' || p.iceConnectionState === 'failed'; });
    var prev = S.call;
    S.call = ok ? 'connected' : bad ? 'failed' : trying ? 'connecting' : 'none';
    if (S.call === 'connected') takeWake(); else if (S.call !== 'connecting') dropWake();
    if (S.call === 'failed' && prev !== 'failed') toast('The call could not connect. Wi-Fi on both phones works best. Tap Connection for a test.');
    if (S.call !== prev) log('call ' + prev + ' to ' + S.call);
    uiUpdate();
  }
  function trackPc(p) {
    pcs.push(p);
    p.__cbc = { host: 0, srflx: 0, relay: 0 };
    p.addEventListener('iceconnectionstatechange', callState);
    p.addEventListener('connectionstatechange', callState);
    p.addEventListener('icecandidate', function (e) {
      var c = e.candidate && e.candidate.candidate; if (!c) return;
      var m = /typ (host|srflx|relay|prflx)/.exec(c); if (m && p.__cbc[m[1]] !== undefined) p.__cbc[m[1]]++;
    });
    p.addEventListener('icegatheringstatechange', function () {
      if (p.iceGatheringState === 'complete') S.relay = p.__cbc.relay > 0 ? 'yes' : 'no';
    });
  }
  var ORTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
  if (ORTC) {
    var WRTC = function (cfg, constraints) {
      var p = new ORTC(mergeIce(cfg), constraints);
      try { trackPc(p); } catch (e) {}
      return p;
    };
    WRTC.prototype = ORTC.prototype;
    try { Object.setPrototypeOf(WRTC, ORTC); } catch (e) {}
    window.RTCPeerConnection = WRTC;
    if (window.webkitRTCPeerConnection) window.webkitRTCPeerConnection = WRTC;
  }

  /* ---------- microphone ---------- */
  function micAdvice(err) {
    var n = (err && err.name) || '';
    var tail = inFrame ? ' If it still fails, open the app in its own tab.' : '';
    if (n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError') {
      return (isIOS ? 'Microphone is blocked. Go to Settings, Safari, Microphone, choose Ask or Allow, then reload.'
        : isAndroid ? 'Microphone is blocked. Tap the padlock next to the address, choose Permissions, allow Microphone, then reload.'
        : 'Microphone is blocked. Click the padlock in the address bar, allow Microphone, then reload.') + tail;
    }
    if (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'DevicesNotFoundError') return 'No microphone found. Plug in or turn on a microphone and try again.';
    if (n === 'NotReadableError' || n === 'AbortError' || n === 'TrackStartError') return 'The microphone is busy. Close other apps that use it and try again.';
    return 'Could not start the microphone. ' + (err && err.message ? err.message : '');
  }
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      var origGum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = function (c) {
        return origGum(c).catch(function (e) { S.lastError = 'microphone: ' + (e && e.name); toast(micAdvice(e)); uiUpdate(); throw e; });
      };
    }
  } catch (e) {}

  /* ---------- online and offline, coming back to the app ---------- */
  window.addEventListener('online', function () { S.online = true; log('online'); nudge(); uiUpdate(); });
  window.addEventListener('offline', function () { S.online = false; log('offline'); uiUpdate(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { nudge(); if (S.call === 'connected') takeWake(); }
  });

  /* ---------- self test ---------- */
  function withTimeout(pr, ms) { return Promise.race([pr, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timed out')); }, ms); })]); }
  async function runSelfTest(out) {
    var rows = []; A.lastReport = rows;
    function show(r) { rows.push(r); if (out) { var d = document.createElement('div'); d.style.cssText = 'margin:4px 0;color:' + (r.ok ? '#8dffb0' : '#ff9a9a'); d.textContent = (r.ok ? 'OK  ' : 'Problem  ') + r.name + ': ' + r.note; out.appendChild(d); } }
    async function step(name, fn) { try { var r = await fn(); show({ name: name, ok: r.ok, note: r.note }); } catch (e) { show({ name: name, ok: false, note: String(e && e.message || e) }); } }
    if (out) out.textContent = '';
    await step('Internet', function () { return { ok: navigator.onLine !== false, note: navigator.onLine !== false ? 'connected' : 'your device says it is offline' }; });
    await step('Browser', function () {
      var miss = [];
      if (!window.isSecureContext) miss.push('page is not secure (needs https)');
      if (!ORTC) miss.push('no WebRTC');
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) miss.push('no microphone access');
      return { ok: !miss.length, note: miss.length ? miss.join(', ') : 'supports calling' };
    });
    await step('Call service', async function () {
      var r = await withTimeout(fetch(SIGNAL_TEST_URL, { cache: 'no-store' }), 7000);
      return { ok: r.ok, note: r.ok ? 'reachable' : 'answered with status ' + r.status };
    });
    await step('Microphone', async function () {
      if (!(navigator.permissions && navigator.permissions.query)) return { ok: true, note: 'cannot check here, the app will ask when a call starts' };
      try { var q = await navigator.permissions.query({ name: 'microphone' }); return { ok: q.state !== 'denied', note: q.state === 'denied' ? micAdvice({ name: 'NotAllowedError' }) : 'permission is ' + q.state }; }
      catch (e) { return { ok: true, note: 'cannot check here, the app will ask when a call starts' }; }
    });
    await step('Network route', async function () {
      if (!ORTC) return { ok: false, note: 'WebRTC missing' };
      var pc = new ORTC(mergeIce({})), c = { host: 0, srflx: 0, relay: 0 };
      pc.createDataChannel('t');
      pc.onicecandidate = function (e) { var m = e.candidate && /typ (host|srflx|relay)/.exec(e.candidate.candidate); if (m) c[m[1]]++; };
      await pc.setLocalDescription(await pc.createOffer());
      await new Promise(function (res) { var t = setTimeout(res, 6000); pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } }); if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } });
      pc.close();
      S.relay = c.relay > 0 ? 'yes' : 'no'; uiUpdate();
      var note = 'host ' + c.host + ', public ' + c.srflx + ', relay ' + c.relay;
      if (c.relay > 0) return { ok: true, note: note + ' (calls across different networks should work)' };
      if (c.srflx > 0) return { ok: true, note: note + ' (same Wi-Fi and most networks work, strict mobile data may not)' };
      return { ok: c.host > 0, note: note + ' (only local calls on the same Wi-Fi are likely to work)' };
    });
    await step('This app', function () {
      var ps = peers.filter(function (p) { return !p.destroyed; });
      return { ok: S.signal === 'online' || !ps.length, note: 'status ' + S.signal + (ps.length ? ', id ' + (ps[ps.length - 1].id || 'none') : ', no call connection started yet') };
    });
    return rows;
  }
  A.selfTest = runSelfTest;

  /* ---------- user interface ---------- */
  var COL = { online: '#2ee66b', connecting: '#ffd84d', reconnecting: '#ffa43b', offline: '#ff5b5b', idle: '#9aa' };
  function label() {
    if (!S.online) return 'Offline';
    if (S.call === 'connected') return 'In call';
    if (S.call === 'connecting') return 'Calling';
    if (S.call === 'failed') return 'Call failed';
    return { online: 'Online', connecting: 'Connecting', reconnecting: 'Reconnecting', offline: 'Offline', idle: 'Ready' }[S.signal] || 'Ready';
  }
  ready(function () {
    var root = document.createElement('div');
    root.id = 'cbassist-root';
    root.style.cssText = 'position:fixed;right:3px;top:56%;z-index:2147483500;font:700 14px/1 system-ui,sans-serif;touch-action:none';
    var btn = document.createElement('button');
    btn.type = 'button'; btn.setAttribute('aria-label', 'Connection help and test');
    btn.style.cssText = 'width:26px;height:26px;padding:0;border-radius:50%;background:rgba(30,18,12,.82);color:#fff;border:3px solid #9aa;font:inherit;cursor:pointer;opacity:.75;display:flex;align-items:center;justify-content:center;box-sizing:border-box';
    btn.textContent = '?';
    var dot = btn, txt = { textContent: '' };
    root.appendChild(btn); document.body.appendChild(root);
    /* drag the button out of the way if it covers something */
    (function () {
      var sx, sy, ox, oy, moved = false, down = false;
      try { var sv = JSON.parse(localStorage.getItem('cba_pos') || 'null'); if (sv) { root.style.left = sv.l + 'px'; root.style.top = sv.t + 'px'; root.style.right = 'auto'; } } catch (e) {}
      btn.addEventListener('pointerdown', function (e) { down = true; moved = false; sx = e.clientX; sy = e.clientY; var r = root.getBoundingClientRect(); ox = r.left; oy = r.top; });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) moved = true;
        if (moved) { root.style.left = Math.max(0, Math.min(innerWidth - 30, ox + e.clientX - sx)) + 'px'; root.style.top = Math.max(0, Math.min(innerHeight - 30, oy + e.clientY - sy)) + 'px'; root.style.right = 'auto'; }
      });
      window.addEventListener('pointerup', function () {
        if (down && moved) { try { var r = root.getBoundingClientRect(); localStorage.setItem('cba_pos', JSON.stringify({ l: Math.round(r.left), t: Math.round(r.top) })); } catch (e) {} }
        down = false; setTimeout(function () { moved = false; }, 0);
      });
      btn.addEventListener('click', function (e) { if (moved) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    })();
    var offbar = document.createElement('div');
    offbar.style.cssText = 'position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;font:700 14px/1.3 system-ui,sans-serif;text-align:center;padding:6px 10px;z-index:2147483550;display:none';
    offbar.textContent = 'No internet connection. Calls will resume when you are back online.';
    document.body.appendChild(offbar);
    uiUpdate = function () {
      btn.style.borderColor = S.call === 'connected' ? '#2ee66b' : S.call === 'failed' ? '#ff5b5b' : (COL[S.online ? S.signal : 'offline'] || '#9aa');
      btn.title = 'Connection: ' + label(); btn.setAttribute('aria-label', 'Connection help and test. Status: ' + label());
      offbar.style.display = S.online ? 'none' : 'block';
    };
    uiUpdate();

    var panel;
    function openPanel() {
      if (panel) { panel.style.display = 'flex'; paintNow(); return; }
      panel = document.createElement('div'); panel.id = 'cbassist-panel';
      panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Help and connection test');
      panel.style.cssText = 'position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(0,0,0,.72);z-index:2147483640;display:flex;align-items:flex-end;justify-content:center';
      var card = document.createElement('div');
      card.style.cssText = 'background:#1d120c;color:#fff;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:18px 18px 0 0;padding:16px 16px 22px;font:400 15px/1.45 system-ui,sans-serif;border:1px solid #5a4030;box-sizing:border-box';
      var micTip = isIOS ? 'go to Settings, Safari, Microphone and choose Ask or Allow.' : isAndroid ? 'tap the padlock by the web address, then Permissions, then allow Microphone.' : 'click the padlock in the address bar and allow Microphone.';
      card.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px;color:#ffd84d">Help and connection test</b><button type="button" id="cba-x" aria-label="Close" style="background:none;border:0;color:#fff;font-size:26px;cursor:pointer;line-height:1">&times;</button></div>' +
        '<p style="margin:8px 0">Status: <b id="cba-st"></b></p>' +
        '<p id="cba-err" style="margin:6px 0;color:#ff9a9a"></p>' +
        '<button type="button" id="cba-run" style="background:#ffd84d;color:#2a1a12;border:0;border-radius:12px;padding:12px 16px;font:700 16px system-ui;width:100%;cursor:pointer">Run connection test</button>' +
        '<div id="cba-out" style="margin:10px 0;font-size:14px"></div>' +
        '<details open style="margin-top:8px"><summary style="font-weight:700;cursor:pointer">If calls do not work</summary><ol style="padding-left:20px;margin:6px 0">' +
        '<li>Allow the microphone when your phone asks. If you tapped Block, ' + micTip + '</li>' +
        '<li>Both phones need internet. Wi-Fi on both is the most reliable. Calls between different networks can fail on some mobile data plans.</li>' +
        '<li>Keep the app open and the screen on while waiting for a call. Phones pause web pages that are in the background.</li>' +
        '<li>Check the other person\'s call number is typed correctly and that they have the app open.</li>' +
        '<li>If the app sits inside a game page, use the full screen button or open the app in its own tab.</li>' +
        '<li>Still stuck: tap Run connection test, then Copy report, and send the report to Coffeebreak support.</li></ol></details>' +
        '<div style="display:flex;gap:8px;margin-top:10px"><button type="button" id="cba-copy" style="flex:1;background:#3a2a20;color:#fff;border:1px solid #777;border-radius:12px;padding:10px;font:600 14px system-ui;cursor:pointer">Copy report</button><button type="button" id="cba-reload" style="flex:1;background:#3a2a20;color:#fff;border:1px solid #777;border-radius:12px;padding:10px;font:600 14px system-ui;cursor:pointer">Reload app</button></div>' +
        '<p style="font-size:12px;color:#bbb;margin:12px 0 0">Call assist ' + VERSION + '</p>';
      panel.appendChild(card); document.body.appendChild(panel);
      var q = function (s) { return card.querySelector(s); };
      function paint() { q('#cba-st').textContent = label() + (S.relay === 'yes' ? ' · relay ready' : S.relay === 'no' ? ' · no relay' : ''); q('#cba-err').textContent = S.lastError || ''; }
      paintNow = paint;
      var oldUi = uiUpdate; uiUpdate = function () { oldUi(); if (panel && panel.style.display !== 'none') paint(); };
      paint();
      q('#cba-x').onclick = function () { panel.style.display = 'none'; };
      panel.addEventListener('click', function (e) { if (e.target === panel) panel.style.display = 'none'; });
      q('#cba-reload').onclick = function () { location.reload(); };
      q('#cba-run').onclick = async function () { q('#cba-run').disabled = true; await runSelfTest(q('#cba-out')); q('#cba-run').disabled = false; paint(); };
      q('#cba-copy').onclick = function () {
        var rep = 'Coffeebreak call assist report\n' + new Date().toString() + '\n' + location.href + '\nUA: ' + ua + '\nstate: ' + JSON.stringify(S) + '\n' +
          (A.lastReport || []).map(function (l) { return (l.ok ? 'OK ' : 'PROBLEM ') + l.name + ': ' + l.note; }).join('\n') + '\nevents:\n' + A.events.join('\n');
        var done = function () { toast('Report copied'); };
        try { navigator.clipboard.writeText(rep).then(done, function () { prompt('Copy this report', rep); }); } catch (e) { prompt('Copy this report', rep); }
      };
    }
    var paintNow = function () {};
    btn.onclick = openPanel;
    A.open = openPanel;
    A.state = 'ready';
  });

  /* ---------- offline support when the app has no service worker ---------- */
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
        navigator.serviceWorker.getRegistrations().then(function (regs) {
          if (regs.length) return;
          var s = document.querySelector('script[src$="cbassist.js"]'); var src = s ? s.src : '';
          if (!src) return;
          var sw = src.replace(/cbassist\.js(\?.*)?$/, 'cbassist-sw.js');
          fetch(sw, { method: 'HEAD' }).then(function (r) { if (r.ok) navigator.serviceWorker.register(sw).then(function () { log('offline cache on'); }, function () {}); }, function () {});
        });
      } catch (e) {}
    }, 4000);
  });
})();
