/* Coffeebreak Vocal Social: shared song feed (Cloudflare Worker + D1 + KV) around the in-browser singer. */
(function () {
  'use strict';
  var API = (window.CB_VS_API || '').replace(/\/+$/, '');
  var LOCAL = 'cb-vocal-social-v2';
  var OLD = 'cb-vocal-social-v1';
  var UNLOCK_KEY = 'cb-payid-unlock:apps/vocal-social';
  var FREE_GENS = 1;
  var AVATARS = 12;

  var local = { token: '', profile: null, email: '', usedGens: 0, owner: false };
  var state = { mode: 'trending', posts: [], draft: null, remixOf: null, current: null, played: {}, autoplay: false, observer: null, loading: false, done: false };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function status(t) { var s = $('vs-status'); if (s) s.textContent = t || ''; }

  /* ---------- local storage ---------- */
  function loadLocal() {
    try { var raw = JSON.parse(localStorage.getItem(LOCAL) || 'null'); if (raw) Object.assign(local, raw); } catch (e) {}
    try {
      var old = JSON.parse(localStorage.getItem(OLD) || 'null');
      if (old && old.profile) {
        if (!local.usedGens && old.usedGens) local.usedGens = old.usedGens;
        if (!local.email && old.profile.email) local.email = old.profile.email;
        if (!local.oldName && old.profile.name && old.profile.name !== 'Guest') local.oldName = old.profile.name;
      }
    } catch (e) {}
  }
  function saveLocal() { try { localStorage.setItem(LOCAL, JSON.stringify(local)); } catch (e) {} }

  function normName(n) { return String(n || '').trim().toLowerCase().replace(/[’']/g, "'"); }
  function isOwner() {
    var n = normName(local.profile && local.profile.name) || normName(local.oldName);
    var e = String(local.email || '').trim().toLowerCase();
    return n === "karen o'brien" || n === 'karen obrien' || e === 'darkokaz@gmx.com';
  }
  function isUnlocked() { if (isOwner()) return true; try { return !!localStorage.getItem(UNLOCK_KEY); } catch (e) { return false; } }
  function canGenerate() { return isUnlocked() || (local.usedGens || 0) < FREE_GENS; }
  function accessNote() {
    if (isOwner()) return 'Owner copy is on for Karen on this device. Making songs is free for you here.';
    if (isUnlocked()) return 'This device is unlocked for the full app. Payment was not verified by this page.';
    var left = Math.max(0, FREE_GENS - (local.usedGens || 0));
    if (left) return 'You can make ' + left + ' song as a free preview. The full app is US$10 via the PayID cart. Listening, posting, likes and comments are free.';
    return 'The free preview song has been used. Unlock song making for US$10 via the PayID cart. Listening, posting, likes and comments stay free.';
  }

  /* ---------- API ---------- */
  function api(path, opts) {
    opts = opts || {};
    var headers = opts.headers || {};
    if (local.token) headers.Authorization = 'Bearer ' + local.token;
    var body = opts.body;
    if (body && !(body instanceof FormData) && typeof body !== 'string') { body = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
    return fetch(API + path, { method: opts.method || 'GET', headers: headers, body: body }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) { var err = new Error(j.error || ('The server said ' + r.status + '.')); err.status = r.status; throw err; }
        return j;
      });
    }, function () { throw new Error('Could not reach Vocal Social. Check your internet connection.'); });
  }

  /* ---------- generated art ---------- */
  function hash(s) { var n = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { n ^= s.charCodeAt(i); n = Math.imul(n, 16777619) >>> 0; } return n; }
  var PALETTES = [['#ff4f9a', '#7b2ff7'], ['#ff8a5c', '#ff2e7e'], ['#00c2a8', '#3a47d5'], ['#f9d423', '#ff4e50'], ['#8e2de2', '#ff6fd8'], ['#43cea2', '#185a9d'], ['#fc466b', '#3f5efb'], ['#f7971e', '#ffd200'], ['#c471f5', '#fa71cd'], ['#12c2e9', '#f64f59'], ['#ee0979', '#ff6a00'], ['#4776e6', '#8e54e9']];
  function avatarIndex(a, id) { var m = /^a:(\d+)$/.exec(a || ''); return m ? (+m[1] % AVATARS) : hash(id) % AVATARS; }
  var svgSeq = 0;
  function avatarSvg(i, size) {
    var p = PALETTES[i % PALETTES.length]; var h = hash('av' + i); var gid = 'cbg' + (++svgSeq);
    var shapes = '';
    for (var k = 0; k < 3; k++) {
      var x = 10 + ((h >>> (k * 5)) % 44), y = 10 + ((h >>> (k * 7 + 2)) % 44), r = 8 + ((h >>> (k * 3 + 1)) % 14);
      shapes += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" fill-opacity="' + (0.18 + k * 0.1).toFixed(2) + '"/>';
    }
    var note = (i % 3 === 0) ? '<path d="M38 18v20.5a6 6 0 1 1-3-5.2V22l-10 2.5v16a6 6 0 1 1-3-5.2V20z" fill="#fff" fill-opacity=".9"/>' : (i % 3 === 1 ? '<path d="M32 16a8 8 0 0 1 8 8v9a8 8 0 0 1-16 0v-9a8 8 0 0 1 8-8zm-13 17h3a10 10 0 0 0 20 0h3a13 13 0 0 1-11.5 12.9V50h-3v-4.1A13 13 0 0 1 19 33z" fill="#fff" fill-opacity=".9"/>' : '<path d="M20 40c4-14 20-14 24 0M24 28a3 3 0 1 0 0 .1M40 28a3 3 0 1 0 0 .1" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round"/>');
    return '<svg viewBox="0 0 64 64" width="' + size + '" height="' + size + '" aria-hidden="true"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#' + gid + ')"/>' + shapes + note + '</svg>';
  }
  function avatarNode(author, size) {
    var s = el('span', 'avatar'); s.style.width = s.style.height = (size || 44) + 'px';
    s.innerHTML = avatarSvg(avatarIndex(author && author.avatar, author && author.id), size || 44);
    return s;
  }
  function artBackground(id) {
    var h = hash(id); var p = PALETTES[h % PALETTES.length]; var q = PALETTES[(h >>> 4) % PALETTES.length];
    return 'radial-gradient(circle at ' + (h % 80 + 10) + '% ' + ((h >>> 3) % 60 + 10) + '%, ' + q[0] + 'cc, transparent 55%), radial-gradient(circle at ' + ((h >>> 6) % 80 + 10) + '% ' + ((h >>> 9) % 50 + 45) + '%, ' + q[1] + 'aa, transparent 50%), linear-gradient(160deg, ' + p[0] + ', ' + p[1] + ')';
  }

  /* ---------- time ---------- */
  function ago(t) {
    var s = Math.max(1, (Date.now() - t) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm'; if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 604800) return Math.floor(s / 86400) + 'd';
    return new Date(t).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  }
  function commentsLabel(n) { return n === 1 ? '1 comment' : fmtCount(n) + ' comments'; }
  function fmtCount(n) { n = +n || 0; return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n); }

  /* ---------- icons ---------- */
  var ICON = {
    heart: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.8 1.2 5.4 3 1.6-1.8 3.3-3 5.4-3 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>',
    remix: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M17 3l4 4-4 4V8H8a3 3 0 0 0-3 3v1H3v-1a5 5 0 0 1 5-5h9zM7 21l-4-4 4-4v3h9a3 3 0 0 0 3-3v-1h2v1a5 5 0 0 1-5 5H7z"/></svg>',
    share: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M14 4l7 7-7 7v-4c-5 0-8.5 1.5-11 5 1-5 4-10 11-11z"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 3h2v18H5zM8 4h10l-2 4 2 4H8z"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="38" height="38"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" width="38" height="38"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
  };

  /* ---------- waveform ---------- */
  function drawWave(canvas, peaks, progress) {
    var ctx = canvas.getContext('2d'); var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    peaks = peaks && peaks.length ? peaks : new Array(48).fill(0.3);
    var n = peaks.length, bw = w / n;
    for (var i = 0; i < n; i++) {
      var v = Math.max(0.06, Math.min(1, peaks[i])); var bh = v * (h - 6);
      ctx.fillStyle = (i / n) < (progress || 0) ? '#ffffff' : 'rgba(255,255,255,0.45)';
      var x = i * bw + bw * 0.18, y = (h - bh) / 2, ww = bw * 0.64, r = Math.min(ww / 2, 3);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, ww, bh, r); else ctx.rect(x, y, ww, bh);
      ctx.fill();
    }
  }
  function peaksOf(buffer, n) {
    var d = buffer.getChannelData(0); var step = Math.floor(d.length / n) || 1; var out = []; var max = 1e-6;
    for (var i = 0; i < n; i++) { var s = 0; for (var j = i * step; j < Math.min(d.length, (i + 1) * step); j += 4) s = Math.max(s, Math.abs(d[j])); out.push(s); max = Math.max(max, s); }
    return out.map(function (v) { return Math.round(Math.pow(v / max, 0.8) * 100) / 100; });
  }

  /* ---------- player (one shared audio element) ---------- */
  var player = null;
  function setupPlayer() {
    player = $('player');
    player.addEventListener('timeupdate', paintProgress);
    player.addEventListener('ended', function () { setPlaying(false); });
    player.addEventListener('pause', function () { setPlaying(false); });
    player.addEventListener('play', function () { setPlaying(true); });
  }
  function paintProgress() {
    var cur = state.current; if (!cur || !cur.canvas) return;
    var p = player.duration ? player.currentTime / player.duration : 0;
    drawWave(cur.canvas, cur.peaks, p);
  }
  function setPlaying(on) {
    var cur = state.current; if (!cur || !cur.button) return;
    cur.button.innerHTML = on ? ICON.pause : ICON.play;
    cur.button.setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (cur.card) cur.card.classList.toggle('playing', on);
  }
  function playItem(item, src, postId) {
    if (state.current && state.current !== item) { setPlaying(false); if (state.current.canvas) drawWave(state.current.canvas, state.current.peaks, 0); }
    if (state.current === item && player.src && !player.paused) { player.pause(); return; }
    if (state.current !== item || player.getAttribute('data-src') !== src) { player.src = src; player.setAttribute('data-src', src); }
    state.current = item;
    var pr = player.play();
    state.autoplay = true;
    if (pr && pr.catch) pr.catch(function () { state.autoplay = false; setPlaying(false); });
    if (postId && !state.played[postId]) { state.played[postId] = 1; api('/api/posts/' + postId + '/play', { method: 'POST' }).catch(function () {}); }
  }

  /* ---------- account ---------- */
  function ensureAccount(reason) {
    if (local.token) return Promise.resolve(local.profile);
    return new Promise(function (resolve, reject) {
      var body = el('div');
      body.appendChild(el('p', 'hint small', (reason || 'Pick a name to join Vocal Social.') + ' No email or photo needed.'));
      var l1 = el('label', null, 'Display name'); var nm = el('input'); nm.maxLength = 40; nm.value = local.oldName || ''; l1.appendChild(nm);
      var l2 = el('label', null, 'Handle'); var hd = el('input'); hd.maxLength = 20; hd.placeholder = 'letters, numbers and _'; l2.appendChild(hd);
      nm.addEventListener('input', function () { if (!hd.dataset.touched) hd.value = nm.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20); });
      hd.addEventListener('input', function () { hd.dataset.touched = '1'; });
      var pick = el('div', 'avatar-pick'); var chosen = Math.floor(Math.random() * AVATARS);
      renderAvatarPick(pick, chosen, function (i) { chosen = i; });
      var msg = el('p', 'status');
      var go = el('button', 'btn', 'Join'); go.type = 'button';
      go.addEventListener('click', function () {
        go.disabled = true; msg.textContent = 'Making your profile.';
        api('/api/profiles', { method: 'POST', body: { name: nm.value, handle: hd.value, avatar: 'a:' + chosen } }).then(function (j) {
          local.token = j.token; local.profile = j.profile; saveLocal(); closeSheet(); renderNav(); resolve(j.profile);
        }, function (err) { go.disabled = false; msg.textContent = err.message; });
      });
      body.append(l1, l2, el('p', 'field-label', 'Avatar'), pick, go, msg);
      openSheet('Join Vocal Social', body, function () { reject(new Error('You need a profile for that.')); });
      setTimeout(function () { nm.focus(); }, 50);
    });
  }
  function renderAvatarPick(box, chosen, onPick) {
    box.replaceChildren();
    for (var i = 0; i < AVATARS; i++) {
      (function (i) {
        var b = el('button', 'av-opt'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(i === chosen)); b.setAttribute('aria-label', 'Avatar ' + (i + 1));
        b.innerHTML = avatarSvg(i, 48);
        b.addEventListener('click', function () { box.querySelectorAll('.av-opt').forEach(function (x) { x.setAttribute('aria-checked', 'false'); }); b.setAttribute('aria-checked', 'true'); onPick(i); });
        box.appendChild(b);
      })(i);
    }
  }

  /* ---------- sheet ---------- */
  var sheetOnClose = null;
  function openSheet(title, body, onClose) {
    $('sheet-title').textContent = title; $('sheet-body').replaceChildren(body); $('sheet').hidden = false; sheetOnClose = onClose || null;
    document.body.classList.add('sheet-open');
  }
  function closeSheet(cancelled) {
    $('sheet').hidden = true; document.body.classList.remove('sheet-open');
    var f = sheetOnClose; sheetOnClose = null; if (cancelled && f) f();
  }

  /* ---------- routing ---------- */
  function route() {
    var hash = (location.hash || '#feed').replace(/^#/, '');
    var i = hash.indexOf('='); var name = i < 0 ? hash : hash.slice(0, i); var arg = i < 0 ? '' : decodeURIComponent(hash.slice(i + 1));
    if (name === 'post' && arg) { showView('feed'); openFeed(state.mode, arg); return; }
    if (name === 'u' && arg) { showView('profile'); renderProfile(arg); return; }
    if (name === 'make' && arg) { applyShareMake(arg); showView('make'); return; }
    if (name === 'remix' && arg) { showView('make'); startRemix(arg); return; }
    if (['make', 'feed', 'people', 'me'].indexOf(name) < 0) name = 'feed';
    showView(name);
    if (name === 'feed') openFeed(state.mode);
    if (name === 'people') renderPeople();
    if (name === 'me') renderMe();
  }
  function showView(name) {
    ['make', 'feed', 'people', 'me', 'profile'].forEach(function (id) { var v = $('view-' + id); if (v) v.hidden = id !== name; });
    document.querySelectorAll('nav.tabs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === name); });
    if (name !== 'feed' && player && !player.paused) player.pause();
  }
  function renderNav() {
    var me = document.querySelector('nav.tabs a[data-r="me"]');
    if (me) me.textContent = local.profile ? '@' + local.profile.handle : 'Me';
  }

  /* ---------- feed ---------- */
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('.feed-modes .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.mode === mode)); });
  }
  function openFeed(mode, focusId) {
    setMode(mode || 'trending');
    var reel = $('reel'); reel.replaceChildren(); reel.scrollTop = 0;
    state.posts = []; state.done = false;
    var loading = el('div', 'reel-empty', 'Loading songs.'); reel.appendChild(loading);
    var first = focusId ? api('/api/posts/' + encodeURIComponent(focusId)).then(function (j) { return j.post; }, function (err) { status(err.message); return null; }) : Promise.resolve(null);
    first.then(function (focus) {
      return loadMore().then(function () {
        loading.remove();
        if (focus) {
          state.posts = state.posts.filter(function (p) { return p.id !== focus.id; });
          reel.replaceChildren(); state.posts.unshift(focus);
          state.posts.forEach(function (p) { reel.appendChild(clipCard(p)); });
        }
        if (!state.posts.length) {
          var empty = el('div', 'reel-empty');
          empty.appendChild(el('p', null, state.mode === 'following' ? (local.token ? 'No songs from people you follow yet. Find people on the People tab.' : 'Join and follow people to fill this feed.') : 'No songs yet. Be the first.'));
          var mk = el('a', 'btn', 'Make a song'); mk.href = '#make'; empty.appendChild(mk);
          reel.appendChild(empty);
        }
        observe();
      });
    });
  }
  function loadMore() {
    if (state.loading || state.done) return Promise.resolve();
    state.loading = true;
    var last = state.posts[state.posts.length - 1];
    var q = '/api/feed?mode=' + state.mode + (last && state.mode !== 'trending' ? '&before=' + last.created : '');
    return api(q).then(function (j) {
      var have = {}; state.posts.forEach(function (p) { have[p.id] = 1; });
      var fresh = (j.posts || []).filter(function (p) { return !have[p.id]; });
      if (!fresh.length || state.mode === 'trending') state.done = true;
      var reel = $('reel');
      fresh.forEach(function (p) { state.posts.push(p); reel.appendChild(clipCard(p)); });
      observe();
    }, function (err) { status(err.message); }).then(function () { state.loading = false; });
  }
  function observe() {
    if (!('IntersectionObserver' in window)) return;
    if (state.observer) state.observer.disconnect();
    state.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio > 0.7) {
          var card = en.target; var idx = +card.dataset.index;
          if (state.autoplay && card._item && state.current !== card._item) playItem(card._item, card._item.src, card.dataset.id);
          if (idx >= state.posts.length - 3) loadMore();
        }
      });
    }, { root: $('reel'), threshold: [0.7] });
    document.querySelectorAll('#reel .clip').forEach(function (c, i) { c.dataset.index = i; state.observer.observe(c); });
  }

  function clipCard(post) {
    var card = el('article', 'clip'); card.dataset.id = post.id; card.id = 'post-' + post.id;
    card.style.background = artBackground(post.id);
    var shade = el('div', 'clip-shade'); card.appendChild(shade);

    var top = el('div', 'clip-top');
    top.appendChild(el('span', 'tag', [post.genre, post.mood].filter(Boolean).join(' · ') || 'Song'));
    if (post.remixOf) {
      var rm = el('a', 'tag remix-of', 'Remix of ' + post.remixOf.title + (post.remixOf.handle ? ' by @' + post.remixOf.handle : ''));
      rm.href = '#post=' + encodeURIComponent(post.remixOf.id); top.appendChild(rm);
    }
    card.appendChild(top);

    var mid = el('div', 'clip-mid');
    var play = el('button', 'play-big'); play.type = 'button'; play.innerHTML = ICON.play; play.setAttribute('aria-label', 'Play ' + post.title);
    mid.appendChild(play);
    var lyr = el('p', 'clip-lyrics', String(post.lyrics || '').split(/\n/).slice(0, 4).join('\n'));
    mid.appendChild(lyr);
    card.appendChild(mid);

    var bottom = el('div', 'clip-bottom');
    var who = el('a', 'clip-who'); who.href = '#u=' + encodeURIComponent(post.author.handle);
    who.appendChild(avatarNode(post.author, 40));
    var wn = el('span'); wn.appendChild(el('b', null, post.author.name)); wn.appendChild(el('small', null, '@' + post.author.handle + ' · ' + ago(post.created)));
    who.appendChild(wn);
    bottom.appendChild(who);
    bottom.appendChild(el('h3', 'clip-title', post.title));
    var canvas = el('canvas', 'wave'); canvas.width = 600; canvas.height = 56; canvas.setAttribute('aria-hidden', 'true');
    bottom.appendChild(canvas);
    var stats = el('p', 'clip-stats', fmtCount(post.plays) + ' plays' + (post.duration ? ' · ' + Math.round(post.duration) + 's' : ''));
    bottom.appendChild(stats);
    card.appendChild(bottom);

    var rail = el('div', 'rail');
    function railBtn(icon, label, count, on) {
      var b = el('button', 'rail-btn' + (on ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-label', label);
      b.innerHTML = icon; var c = el('span', 'n', count == null ? '' : fmtCount(count)); b.appendChild(c); rail.appendChild(b); return b;
    }
    var like = railBtn(ICON.heart, 'Like', post.likes, post.liked);
    var com = railBtn(ICON.chat, 'Comments', post.comments);
    var rmx = railBtn(ICON.remix, 'Remix, sing your own take', post.remixes);
    var shr = railBtn(ICON.share, 'Share', null); shr.querySelector('.n').textContent = 'Share';
    var rep = railBtn(ICON.flag, 'Report', null); rep.classList.add('small');
    card.appendChild(rail);

    var item = { card: card, canvas: canvas, peaks: post.peaks, button: play, src: post.audio };
    card._item = item;
    drawWave(canvas, post.peaks, 0);
    play.addEventListener('click', function () { playItem(item, post.audio, post.id); });
    canvas.addEventListener('click', function (ev) {
      if (state.current !== item) { playItem(item, post.audio, post.id); return; }
      var r = canvas.getBoundingClientRect(); if (player.duration) player.currentTime = player.duration * ((ev.clientX - r.left) / r.width);
    });
    var lastTap = 0;
    mid.addEventListener('click', function (ev) {
      if (ev.target.closest('.play-big')) return;
      var t = Date.now(); if (t - lastTap < 320 && !post.liked) doLike(); lastTap = t;
    });
    function doLike() {
      ensureAccount('Join to like songs.').then(function () {
        return api('/api/posts/' + post.id + '/like', { method: 'POST' });
      }).then(function (j) {
        post.liked = j.liked; post.likes = j.likes; like.classList.toggle('on', j.liked); like.querySelector('.n').textContent = fmtCount(j.likes);
        if (j.liked) { like.classList.remove('pop'); void like.offsetWidth; like.classList.add('pop'); }
      }).catch(function (err) { if (err) status(err.message); });
    }
    like.addEventListener('click', doLike);
    com.addEventListener('click', function () { openComments(post, com); });
    rmx.addEventListener('click', function () { location.hash = '#remix=' + encodeURIComponent(post.id); });
    shr.addEventListener('click', function () { sharePost(post); });
    rep.addEventListener('click', function () { report('post', post.id, post.title); });
    return card;
  }

  function postUrl(id) { return location.origin + location.pathname + '#post=' + encodeURIComponent(id); }
  function sharePost(post) {
    var url = postUrl(post.id);
    var data = { title: post.title + ' on Coffeebreak Vocal Social', text: 'Listen to ' + post.title + ' by @' + post.author.handle, url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    copy(url).then(function () { status('Share link copied. Anyone with it can listen.'); }, function () { status('Share link: ' + url); });
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) { try { var t = el('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); res(); } catch (e) { rej(e); } });
  }

  function report(type, id, what) {
    var body = el('div');
    body.appendChild(el('p', 'hint small', 'Tell us what is wrong with ' + (what ? '"' + what + '"' : 'this') + '. Several reports hide it automatically.'));
    var reasons = ['Swearing or hate', 'Adult or sexual content', 'Bullying', 'Spam', 'Someone else\'s work', 'Something else'];
    var sel = el('select'); reasons.forEach(function (r) { var o = el('option', null, r); sel.appendChild(o); });
    var lab = el('label', null, 'Reason'); lab.appendChild(sel);
    var msg = el('p', 'status');
    var go = el('button', 'btn', 'Send report'); go.type = 'button';
    go.addEventListener('click', function () {
      ensureAccount('Join to send a report.').then(function () {
        return api('/api/report', { method: 'POST', body: { type: type, id: id, reason: sel.value } });
      }).then(function (j) { closeSheet(); status(j.message || 'Report sent.'); }, function (err) { msg.textContent = err.message; });
    });
    body.append(lab, go, msg);
    openSheet('Report', body);
  }

  function openComments(post, btn) {
    var body = el('div', 'comments-sheet');
    var list = el('ul', 'comments'); list.appendChild(el('li', 'hint small', 'Loading comments.'));
    var form = el('form', 'comment-form');
    var input = el('input'); input.type = 'text'; input.maxLength = 280; input.placeholder = 'Add a kind comment'; input.setAttribute('aria-label', 'Comment');
    var send = el('button', 'btn', 'Send'); send.type = 'submit';
    form.append(input, send);
    var msg = el('p', 'status');
    body.append(list, form, msg);
    openSheet(commentsLabel(post.comments), body);
    function row(c) {
      var li = el('li');
      var a = el('a', 'c-who'); a.href = '#u=' + encodeURIComponent(c.author.handle); a.appendChild(avatarNode(c.author, 30));
      a.addEventListener('click', function () { closeSheet(); });
      var t = el('div', 'c-text'); t.appendChild(el('b', null, c.author.name + ' ')); t.appendChild(el('small', null, '@' + c.author.handle + ' · ' + ago(c.created)));
      t.appendChild(el('p', null, c.text));
      var rp = el('button', 'link-btn', 'Report'); rp.type = 'button'; rp.addEventListener('click', function () { report('comment', c.id, 'this comment'); });
      t.appendChild(rp);
      li.append(a, t); return li;
    }
    api('/api/posts/' + post.id + '/comments').then(function (j) {
      list.replaceChildren();
      if (!j.comments.length) list.appendChild(el('li', 'hint small', 'No comments yet. Say something kind.'));
      j.comments.forEach(function (c) { list.appendChild(row(c)); });
    }, function (err) { list.replaceChildren(el('li', 'hint small', err.message)); });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var text = input.value.trim(); if (!text) return;
      send.disabled = true;
      ensureAccount('Join to comment.').then(function () {
        return api('/api/posts/' + post.id + '/comments', { method: 'POST', body: { text: text } });
      }).then(function (j) {
        if (list.firstChild && list.firstChild.classList && list.firstChild.classList.contains('hint')) list.replaceChildren();
        list.appendChild(row(j.comment)); input.value = ''; msg.textContent = '';
        post.comments += 1; if (btn) btn.querySelector('.n').textContent = fmtCount(post.comments);
        if (!$('sheet').hidden) $('sheet-title').textContent = commentsLabel(post.comments);
      }, function (err) { msg.textContent = err.message; if ($('sheet').hidden) openComments(post, btn); }).then(function () { send.disabled = false; });
    });
  }

  /* ---------- profile ---------- */
  function followButton(userId, following, onChange) {
    var b = el('button', 'btn' + (following ? ' quiet' : ''), following ? 'Following' : 'Follow'); b.type = 'button';
    if (local.profile && local.profile.id === userId) { b.textContent = 'You'; b.disabled = true; b.className = 'btn quiet'; return b; }
    b.addEventListener('click', function () {
      ensureAccount('Join to follow singers.').then(function () { return api('/api/follow/' + userId, { method: 'POST' }); }).then(function (j) {
        b.textContent = j.following ? 'Following' : 'Follow'; b.className = 'btn' + (j.following ? ' quiet' : ''); if (onChange) onChange(j);
      }).catch(function (err) { if (err) status(err.message); });
    });
    return b;
  }
  function renderProfile(handle) {
    var box = $('profile-box'); box.replaceChildren(el('p', 'hint', 'Loading profile.'));
    api('/api/profiles/' + encodeURIComponent(handle)).then(function (j) {
      var p = j.profile; box.replaceChildren();
      var head = el('div', 'profile-head');
      head.appendChild(avatarNode(p, 88));
      var info = el('div'); info.appendChild(el('h2', null, p.name)); info.appendChild(el('p', 'meta', '@' + p.handle));
      if (p.bio) info.appendChild(el('p', 'bio', p.bio));
      head.appendChild(info); box.appendChild(head);
      var stats = el('div', 'profile-stats');
      function stat(n, l) { var s = el('div'); s.appendChild(el('b', null, fmtCount(n))); s.appendChild(el('span', null, l)); stats.appendChild(s); return s; }
      stat(p.posts, 'songs'); var fol = stat(p.followers, 'followers'); stat(p.following, 'following'); stat(p.likes, 'likes');
      box.appendChild(stats);
      var acts = el('div', 'row actions');
      acts.appendChild(followButton(p.id, p.youFollow, function (r) { fol.querySelector('b').textContent = fmtCount(r.followers); }));
      var sh = el('button', 'btn quiet', 'Share profile'); sh.type = 'button';
      sh.addEventListener('click', function () { var u = location.origin + location.pathname + '#u=' + encodeURIComponent(p.handle); if (navigator.share) navigator.share({ title: p.name + ' on Vocal Social', url: u }).catch(function () {}); else copy(u).then(function () { status('Profile link copied.'); }); });
      acts.appendChild(sh);
      if (!(local.profile && local.profile.id === p.id)) { var rp = el('button', 'btn quiet', 'Report'); rp.type = 'button'; rp.addEventListener('click', function () { report('profile', p.id, p.name); }); acts.appendChild(rp); }
      box.appendChild(acts);
      var grid = el('div', 'grid');
      if (!j.posts.length) grid.appendChild(el('p', 'hint', 'No songs yet.'));
      j.posts.forEach(function (post) {
        var t = el('a', 'tile'); t.href = '#post=' + encodeURIComponent(post.id); t.style.background = artBackground(post.id);
        t.appendChild(el('b', null, post.title)); t.appendChild(el('span', null, '▶ ' + fmtCount(post.plays) + ' · ♥ ' + fmtCount(post.likes)));
        grid.appendChild(t);
      });
      box.appendChild(grid);
    }, function (err) { box.replaceChildren(el('p', 'hint', err.message)); });
  }

  var peopleTimer = 0;
  function renderPeople() {
    var q = ($('people-q').value || '').trim();
    var list = $('people-list'); list.replaceChildren(el('p', 'hint small', 'Loading.'));
    api('/api/people' + (q ? '?q=' + encodeURIComponent(q) : '')).then(function (j) {
      list.replaceChildren();
      if (!j.people.length) list.appendChild(el('p', 'hint', q ? 'No one matches that.' : 'No singers have posted yet.'));
      j.people.forEach(function (u) {
        var row = el('div', 'person');
        var a = el('a', 'person-link'); a.href = '#u=' + encodeURIComponent(u.handle); a.appendChild(avatarNode(u, 48));
        var t = el('span'); t.appendChild(el('b', null, u.name)); t.appendChild(el('small', null, '@' + u.handle + ' · ' + fmtCount(u.followers) + ' followers · ' + fmtCount(u.posts) + ' songs'));
        a.appendChild(t); row.appendChild(a);
        row.appendChild(followButton(u.id, u.youFollow));
        list.appendChild(row);
      });
    }, function (err) { list.replaceChildren(el('p', 'hint', err.message)); });
  }

  var meAvatar = 0;
  function renderMe() {
    var p = local.profile;
    var sum = $('me-summary'); sum.replaceChildren();
    if (p) {
      var a = el('a', 'person-link'); a.href = '#u=' + encodeURIComponent(p.handle); a.appendChild(avatarNode(p, 56));
      var t = el('span'); t.appendChild(el('b', null, p.name)); t.appendChild(el('small', null, '@' + p.handle + ' · view your public profile')); a.appendChild(t); sum.appendChild(a);
      api('/api/me').then(function (j) { local.profile = j.profile; saveLocal(); renderNav(); }).catch(function (err) { if (err.status === 401) { local.token = ''; local.profile = null; saveLocal(); renderNav(); } });
    } else {
      sum.appendChild(el('p', 'hint', 'You have not joined yet. Save a profile to post, like, comment and follow. No email or photo needed.'));
    }
    $('prof-name').value = p ? p.name : (local.oldName || '');
    $('prof-handle').value = p ? p.handle : '';
    $('prof-bio').value = p ? (p.bio || '') : '';
    $('prof-email').value = local.email || '';
    meAvatar = p ? avatarIndex(p.avatar, p.id) : 0;
    renderAvatarPick($('avatar-pick'), meAvatar, function (i) { meAvatar = i; });
    $('access-note').textContent = accessNote();
  }
  function saveProfile() {
    local.email = ($('prof-email').value || '').trim(); saveLocal();
    var data = { name: $('prof-name').value, handle: $('prof-handle').value, bio: $('prof-bio').value, avatar: 'a:' + meAvatar };
    var req = local.token ? api('/api/me', { method: 'PATCH', body: data }) : api('/api/profiles', { method: 'POST', body: data });
    req.then(function (j) {
      if (j.token) local.token = j.token;
      local.profile = j.profile; saveLocal(); renderNav(); renderMe();
      status(isOwner() ? 'Profile saved. The owner copy is on for this device.' : 'Profile saved.');
    }, function (err) { status(err.message); });
  }

  /* ---------- make ---------- */
  function waitForEngine() {
    if (window.CBSongs && window.CBCore) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var n = 0; var t = setInterval(function () { n++; if (window.CBSongs && window.CBCore) { clearInterval(t); resolve(); } else if (n > 100) { clearInterval(t); reject(new Error('The song engine did not load.')); } }, 100);
    });
  }
  function fillStyleSelects() {
    var C = window.CBCore; if (!C) return;
    $('genre').innerHTML = C.GENRES.map(function (g) { return '<option' + (g === 'Pop' ? ' selected' : '') + '>' + g + '</option>'; }).join('');
    $('mood').innerHTML = C.MOODS.map(function (m) { return '<option' + (m === 'Happy' ? ' selected' : '') + '>' + m + '</option>'; }).join('');
  }
  function applyShareMake(payload) {
    try {
      var json = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))));
      if (json.lyrics) $('lyrics').value = json.lyrics; if (json.genre) $('genre').value = json.genre; if (json.mood) $('mood').value = json.mood;
      if (json.title) $('title').value = json.title; if (json.bpm) $('bpm').value = json.bpm; if (json.desc) $('desc').value = json.desc;
      status('Lyrics and style were loaded from a share link. Press Create song to sing them.');
    } catch (err) { status('That share link could not be read.'); }
  }
  function startRemix(id) {
    api('/api/posts/' + encodeURIComponent(id)).then(function (j) {
      var p = j.post; state.remixOf = p;
      $('lyrics').value = p.lyrics || ''; $('title').value = (p.title || 'Song') + ' (my take)';
      if (p.genre) $('genre').value = p.genre; if (p.mood) $('mood').value = p.mood;
      var b = $('remix-banner'); b.hidden = false; b.replaceChildren();
      b.appendChild(el('span', null, 'Remixing "' + p.title + '" by @' + p.author.handle + '. Change the words, style or voice and make it your own.'));
      var x = el('button', 'link-btn', 'Cancel remix'); x.type = 'button'; x.addEventListener('click', function () { state.remixOf = null; b.hidden = true; });
      b.appendChild(x);
      status('');
    }, function (err) { status(err.message); });
  }

  async function onGenerate() {
    if (!canGenerate()) { status(accessNote()); location.hash = '#me'; return; }
    var lyrics = ($('lyrics').value || '').trim();
    try { await waitForEngine(); } catch (err) { status(err.message); return; }
    if (window.CBCore.wordsOf(lyrics).length < 2) { status('Write at least two words to sing.'); return; }
    var btn = $('btn-generate'); btn.disabled = true; btn.textContent = 'Singing.';
    status('Getting the singer ready.');
    try {
      if (window.AC) try { window.AC(); } catch (e) {}
      window.CB_NEURAL_VOICE = $('voice').value;
      var meta = await window.CBSongs.create({
        lyrics: lyrics, genre: $('genre').value, mood: $('mood').value,
        bpm: $('bpm').value ? Number($('bpm').value) : undefined,
        title: ($('title').value || '').trim(), description: ($('desc').value || '').trim(),
        autoplay: false, vocalLevel: 1.3, bandLevel: 0.5, onStatus: status
      });
      status('Mixing the vocal with the band.');
      var mix = await window.CBSongs.mixWav(meta.id);
      var ctx = window.AC ? window.AC() : new (window.AudioContext || window.webkitAudioContext)();
      var buf = await ctx.decodeAudioData(mix.bytes.slice(0));
      if (!isUnlocked()) { local.usedGens = (local.usedGens || 0) + 1; saveLocal(); }
      if (state.draft && state.draft.url) URL.revokeObjectURL(state.draft.url);
      var wavBlob = new Blob([mix.bytes], { type: 'audio/wav' });
      state.draft = {
        songId: meta.id, title: mix.title || meta.title, lyrics: lyrics, summary: mix.summary || meta.summary || '',
        genre: $('genre').value, mood: $('mood').value, bpm: $('bpm').value || '', duration: buf.duration,
        peaks: peaksOf(buf, 64), buffer: buf, wav: wavBlob, url: URL.createObjectURL(wavBlob), vocal: meta.vocal || null
      };
      var d = $('draft'); d.hidden = false;
      $('draft-art').style.background = artBackground(meta.id);
      $('draft-meta').textContent = (state.draft.title || 'Song') + ' · ' + (state.draft.summary || '');
      var item = { card: $('draft-art'), canvas: $('draft-wave'), peaks: state.draft.peaks, button: $('draft-play'), src: state.draft.url };
      state.draftItem = item; $('draft-play').innerHTML = ICON.play;
      drawWave(item.canvas, item.peaks, 0);
      status('Your song is ready. Play it, then post it to Vocal Social so everyone can hear it.');
      d.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      if (window.console) console.error(err);
      status(err.message || 'The song could not be made.');
    } finally { btn.disabled = false; btn.textContent = 'Create song'; }
  }
  function downloadDraft() {
    if (!state.draft) return;
    var a = el('a'); a.href = state.draft.url; a.download = String(state.draft.title || 'song').replace(/[^\w]+/g, '-').slice(0, 40) + '.wav';
    document.body.appendChild(a); a.click(); a.remove();
  }
  async function toMp3(buffer) {
    var sr = 44100;
    var off = new OfflineAudioContext(1, Math.ceil(buffer.duration * sr), sr);
    var src = off.createBufferSource(); src.buffer = buffer; src.connect(off.destination); src.start();
    var mono = await off.startRendering();
    if (typeof window.encodeMP3 === 'function') return await window.encodeMP3(mono, 90, 112);
    throw new Error('The MP3 encoder did not load, so the song cannot be posted from this browser.');
  }
  async function onPost() {
    if (!state.draft) return;
    var btn = $('btn-post');
    try { await ensureAccount('Join to post your song.'); } catch (err) { status(err.message); return; }
    btn.disabled = true; status('Getting the song ready to post.');
    try {
      var mp3 = await toMp3(state.draft.buffer);
      if (mp3.size > 4 * 1024 * 1024) throw new Error('This song is too long to post. Try shorter lyrics.');
      var form = new FormData();
      form.append('meta', JSON.stringify({
        title: state.draft.title, lyrics: state.draft.lyrics, genre: state.draft.genre, mood: state.draft.mood, bpm: state.draft.bpm,
        summary: state.draft.summary, duration: state.draft.duration, peaks: state.draft.peaks, remixOf: state.remixOf ? state.remixOf.id : null
      }));
      form.append('audio', mp3, 'song.mp3');
      status('Posting.');
      var j = await api('/api/posts', { method: 'POST', body: form });
      state.remixOf = null; $('remix-banner').hidden = true;
      status('Posted. Everyone on Vocal Social can hear it now.');
      setMode('latest');
      location.hash = '#post=' + encodeURIComponent(j.post.id);
    } catch (err) { status(err.message); }
    finally { btn.disabled = false; }
  }

  function bind() {
    $('btn-generate').addEventListener('click', function () { onGenerate(); });
    $('btn-download').addEventListener('click', downloadDraft);
    $('btn-post').addEventListener('click', onPost);
    $('draft-play').addEventListener('click', function () { if (state.draftItem) playItem(state.draftItem, state.draftItem.src, null); });
    $('btn-save-profile').addEventListener('click', saveProfile);
    $('sheet-close').addEventListener('click', function () { closeSheet(true); });
    $('sheet').addEventListener('click', function (ev) { if (ev.target === $('sheet')) closeSheet(true); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !$('sheet').hidden) closeSheet(true); });
    document.querySelectorAll('.feed-modes .chip').forEach(function (c) {
      c.addEventListener('click', function () { if (location.hash.indexOf('#post=') === 0) history.replaceState(null, '', '#feed'); openFeed(c.dataset.mode); });
    });
    $('people-q').addEventListener('input', function () { clearTimeout(peopleTimer); peopleTimer = setTimeout(renderPeople, 300); });
    window.addEventListener('hashchange', route);
    window.addEventListener('cb-payid-unlock', function () { status('This device is unlocked for the full app. Payment was not verified by this page.'); $('access-note').textContent = accessNote(); });
  }

  loadLocal();
  setupPlayer();
  bind();
  renderNav();
  route();
  waitForEngine().then(function () { fillStyleSelects(); if (/^#(make=|remix=)/.test(location.hash)) route(); }).catch(function (err) { if (!location.hash || location.hash.indexOf('#make') === 0) status(err.message); });
})();
