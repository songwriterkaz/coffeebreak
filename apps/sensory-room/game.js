/* Coffeebreak Sensory Room game. Free to play. Saves on this device only. No network calls. */
(function () {
  var SR = window.SR;
  var KEY = 'cb-sensory-room-v2';
  var SHOP_URL = '../../stores/sensory-shop/';
  var SLOTS = [
    { id: 'c1', zone: 'ceiling', x: 20, y: 9 }, { id: 'c2', zone: 'ceiling', x: 50, y: 9 }, { id: 'c3', zone: 'ceiling', x: 80, y: 9 },
    { id: 'w1', zone: 'wall', x: 13, y: 36 }, { id: 'w2', zone: 'wall', x: 38, y: 36 }, { id: 'w3', zone: 'wall', x: 62, y: 36 }, { id: 'w4', zone: 'wall', x: 87, y: 36 },
    { id: 'f1', zone: 'floor', x: 13, y: 68 }, { id: 'f2', zone: 'floor', x: 38, y: 68 }, { id: 'f3', zone: 'floor', x: 62, y: 68 }, { id: 'f4', zone: 'floor', x: 87, y: 68 },
    { id: 'f5', zone: 'floor', x: 25, y: 87 }, { id: 'f6', zone: 'floor', x: 50, y: 87 }, { id: 'f7', zone: 'floor', x: 75, y: 87 }
  ];
  var PAINTS = [
    { id: 'night', hex: '#3b2a6b' }, { id: 'ocean', hex: '#1f4a6b' }, { id: 'forest', hex: '#22503f' },
    { id: 'blush', hex: '#6b2a55' }, { id: 'sand', hex: '#6b5a3a' }, { id: 'charcoal', hex: '#2b2b36' }
  ];
  var BADGES = [
    { id: 'first', name: 'First glow' }, { id: 'fibre', name: 'Fibre optic fan' }, { id: 'bubbles', name: 'Bubble friend' },
    { id: 'calm', name: 'Calm designer' }, { id: 'full', name: 'Full room' }, { id: 'stars3', name: 'Three star host' }, { id: 'all', name: 'Every visitor welcomed' }
  ];

  function itemById(id) { for (var i = 0; i < SR.ITEMS.length; i++) if (SR.ITEMS[i].id === id) return SR.ITEMS[i]; return null; }
  function placed() {
    var out = [];
    SLOTS.forEach(function (s) { var p = st.room[s.id]; if (p) out.push({ slot: s.id, p: p, item: itemById(p.id) }); });
    return out.filter(function (x) { return x.item; });
  }
  function has(id) { return placed().some(function (x) { return x.item.id === id; }); }
  function hasTag(t) { return placed().some(function (x) { return x.item.tags.indexOf(t) >= 0; }); }
  function countTag(t) { return placed().filter(function (x) { return x.item.tags.indexOf(t) >= 0; }).length; }
  function fibreColours() { return placed().filter(function (x) { return x.item.kind === 'fibre' || x.item.kind === 'bubble'; }).map(function (x) { return x.p.color; }); }
  function anyOn(kind) { return placed().some(function (x) { return x.item.kind === kind && x.p.on; }); }

  function comfort() {
    var cats = ['light', 'seat', 'touch', 'sound', 'movement', 'pressure', 'quiet'];
    var n = cats.filter(hasTag).length;
    var score = n * 12;
    if (st.calm) score += 6;
    if (st.bright <= 75) score += 5;
    if (st.vol <= 60) score += 5;
    var count = placed().length;
    if (count > 11) score -= (count - 11) * 6;
    return Math.max(0, Math.min(100, score));
  }

  var VISITORS = [
    { name: 'Ava', face: '#4cb8ff', says: 'I like soft blue light and somewhere cosy to sit.',
      needs: [['A fibre optic light set to blue', function () { return placed().some(function (x) { return x.item.kind === 'fibre' && x.p.color === 'blue'; }); }],
        ['A beanbag', function () { return has('beanbag'); }]],
      bonus: ['Not too busy: 6 items or fewer', function () { return placed().length <= 6; }] },
    { name: 'Leo', face: '#5cf0a0', says: 'I love bubbles and gentle sounds, not loud ones.',
      needs: [['A bubble tube', function () { return has('bubble-tube'); }], ['A rain sound tube', function () { return has('rain-tube'); }], ['Quiet headphones on the wall', function () { return has('headphones'); }]],
      bonus: ['Volume at 50 or lower', function () { return st.vol <= 50; }] },
    { name: 'Sam', face: '#ffcf5c', says: 'I like to move, swing and land on something soft.',
      needs: [['A swing', function () { return has('sensory-swing') || has('pod-swing'); }], ['A soft crash pad', function () { return has('crash-pad'); }], ['Tactile floor stones', function () { return has('tactile-stones'); }]],
      bonus: ['Both a sensory swing and a pod swing', function () { return has('sensory-swing') && has('pod-swing'); }] },
    { name: 'Priya', face: '#ff5cc0', says: 'I like things to touch and keep my hands busy.',
      needs: [['Tactile wall panels', function () { return has('tactile-panels'); }], ['A fidget wall', function () { return has('fidget-wall'); }], ['A quiet fidget basket', function () { return has('fidget-basket'); }]],
      bonus: ['Something glowing to look at too', function () { return hasTag('light'); }] },
    { name: 'Joe', face: '#b07cff', says: 'Low light, a starry sky and soft music please.',
      needs: [['Stars switched on in the ceiling', function () { return anyOn('stars'); }], ['A galaxy projector playing', function () { return anyOn('galaxy'); }], ['A weighted blanket', function () { return has('weighted-blanket'); }], ['Brightness at 60 or lower', function () { return st.bright <= 60; }]],
      bonus: ['Calm mode on', function () { return st.calm; }] },
    { name: 'Maya', face: '#ff8cc8', says: 'Fibre optics everywhere, in lots of colours, but nothing flashing.',
      needs: [['Three fibre optic lights', function () { return placed().filter(function (x) { return x.item.kind === 'fibre'; }).length >= 3; }], ['At least three different colours', function () { var c = {}; fibreColours().forEach(function (k) { c[k] = 1; }); return Object.keys(c).length >= 3; }]],
      bonus: ['One set to slow rainbow', function () { return fibreColours().indexOf('rainbow') >= 0; }] },
    { name: 'Noah', face: '#5cc8c8', says: 'I need a quiet corner with a heavy blanket and a calm wall colour.',
      needs: [['A weighted blanket or lap pad', function () { return has('weighted-blanket') || has('lap-pad'); }], ['Quiet headphones', function () { return has('headphones'); }], ['Ocean, forest or charcoal walls', function () { return ['ocean', 'forest', 'charcoal'].indexOf(st.paint) >= 0; }], ['Calm mode on', function () { return st.calm; }]],
      bonus: ['Volume at 30 or lower', function () { return st.vol <= 30; }] },
    { name: 'Big makeover', face: '#ff3caa', says: 'Design a room everyone can enjoy, with something on the ceiling, wall and floor.',
      needs: [['Something on the ceiling', function () { return placed().some(function (x) { return x.slot.charAt(0) === 'c'; }); }], ['Something on the wall', function () { return placed().some(function (x) { return x.slot.charAt(0) === 'w'; }); }], ['At least 9 items', function () { return placed().length >= 9; }], ['Comfort 80 or more', function () { return comfort() >= 80; }]],
      bonus: ['Comfort 95 or more', function () { return comfort() >= 95; }] }
  ];

  var defaults = { coins: 250, room: { w2: { id: 'fibre-waterfall', color: 'pink', on: true, gift: true } }, paint: 'night', calm: false, vol: 60, bright: 85, music: false, level: 0, stars: {}, badges: {}, day: '', earned: 0, ver: 2 };
  var st = load();
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
    var out = JSON.parse(JSON.stringify(defaults));
    if (s && typeof s === 'object') Object.keys(out).forEach(function (k) { if (s[k] !== undefined) out[k] = s[k]; });
    if (!s) {
      try { if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) out.calm = true; } catch (e) {}
    }
    return out;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }

  var $ = function (id) { return document.getElementById(id); };
  var sel = null, zoneFilter = 'all', msgTimer = null;

  function msg(t) {
    $('msg').textContent = t;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(function () { $('msg').textContent = ''; }, 5000);
  }
  function coinsUI() { $('coins').textContent = st.coins + ' coins'; }

  /* ---------- audio: all soft, no sudden loud sounds ---------- */
  var ac = null, master = null, musicNodes = null, quietUntil = 0;
  function audio() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    setVol();
    return ac;
  }
  function setVol() {
    if (!master) return;
    var v = st.vol / 100 * (st.calm ? 0.5 : 1) * 0.5;
    if (Date.now() < quietUntil) v *= 0.15;
    master.gain.setTargetAtTime(v, ac.currentTime, 0.3);
  }
  function tone(freq, dur, type, gain, when, glide) {
    var a = audio(); if (!a || st.vol === 0) return;
    var t = a.currentTime + (when || 0);
    var o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
    f.type = 'lowpass'; f.frequency.value = 1800;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, t + Math.min(0.08, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, fc, gain) {
    var a = audio(); if (!a || st.vol === 0) return;
    var len = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    src.buffer = b; f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = 0.7;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master); src.start(t);
  }
  var SFX = {
    chime: function () { [523, 659, 784].forEach(function (f, i) { tone(f, 1.6, 'sine', 0.12, i * 0.18); }); },
    bubble: function () { for (var i = 0; i < 6; i++) tone(260 + Math.random() * 260, 0.22, 'sine', 0.14, i * 0.16 + Math.random() * 0.05, 1.8); },
    rain: function () { noise(3.2, 2600, 0.35); for (var i = 0; i < 10; i++) tone(1400 + Math.random() * 900, 0.08, 'sine', 0.04, Math.random() * 2.8); },
    click: function () { tone(700, 0.06, 'triangle', 0.08); tone(900, 0.06, 'triangle', 0.06, 0.12); },
    whoosh: function () { noise(1.6, 500, 0.25); },
    cosy: function () { tone(196, 1.2, 'sine', 0.12); tone(247, 1.2, 'sine', 0.08, 0.1); },
    sparkle: function () { [880, 1046, 1318, 1568].forEach(function (f, i) { tone(f, 1.2, 'sine', 0.05, i * 0.25); }); },
    coins: function () { tone(660, 0.3, 'sine', 0.1); tone(990, 0.5, 'sine', 0.1, 0.15); }
  };
  function startMusic() {
    var a = audio(); if (!a || musicNodes) return;
    var g = a.createGain(); g.gain.value = 0.0001; g.connect(master);
    g.gain.setTargetAtTime(0.18, a.currentTime, 2);
    var chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]];
    var oscs = [0, 1, 2].map(function (i) { var o = a.createOscillator(); o.type = 'sine'; o.frequency.value = chords[0][i]; o.connect(g); o.start(); return o; });
    var idx = 0;
    var timer = setInterval(function () { idx = (idx + 1) % chords.length; oscs.forEach(function (o, i) { o.frequency.setTargetAtTime(chords[idx][i], a.currentTime, 1.5); }); }, 8000);
    musicNodes = { g: g, oscs: oscs, timer: timer };
  }
  function stopMusic() {
    if (!musicNodes) return;
    var m = musicNodes; musicNodes = null; clearInterval(m.timer);
    m.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.8);
    setTimeout(function () { m.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} }); }, 3000);
  }
  function musicWanted() { return st.music || anyOn('galaxy'); }
  function syncMusic() { if (musicWanted() && ac) startMusic(); else stopMusic(); }

  /* ---------- rendering ---------- */
  function art(item, p) {
    var svg = SR.ART[item.id](SR.hexOf(p.color), p.on !== false);
    if (p.color === 'rainbow') svg = svg.replace('<g>', '<g class="rainbow">');
    return svg;
  }
  function renderRoom() {
    var box = $('slots'); box.replaceChildren();
    SLOTS.forEach(function (s) {
      var p = st.room[s.id], item = p && itemById(p.id);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot ' + (item ? 'full' : 'empty');
      b.style.left = s.x + '%'; b.style.top = s.y + '%';
      b.dataset.slot = s.id;
      if (item) {
        b.innerHTML = art(item, p);
        b.setAttribute('aria-label', item.name);
        if (item.tall) { b.classList.add('tall'); b.style.transform = 'translate(-50%,-78%)'; }
      } else {
        var can = sel && itemById(sel).zone === s.zone;
        if (can) b.classList.add('target');
        b.setAttribute('aria-label', 'Empty ' + s.zone + ' spot');
        if (!can) b.tabIndex = -1;
      }
      b.addEventListener('click', function () { onSlot(s); });
      box.appendChild(b);
    });
    var cols = fibreColours().map(SR.hexOf);
    $('glow').style.background = cols.length ? cols.slice(0, 4).map(function (c, i) {
      var pos = ['20% 30%', '80% 30%', '30% 80%', '75% 80%'][i];
      return 'radial-gradient(circle at ' + pos + ',' + c + 'aa,transparent 60%)';
    }).join(',') : 'none';
    $('stars').classList.toggle('on', anyOn('stars') || anyOn('galaxy'));
    $('galaxy').classList.toggle('on', anyOn('galaxy'));
    $('dim').style.opacity = String((100 - st.bright) / 100 * 0.7);
    var paint = PAINTS.filter(function (x) { return x.id === st.paint; })[0] || PAINTS[0];
    document.documentElement.style.setProperty('--wall', paint.hex);
    document.body.classList.toggle('calm', !!st.calm);
    coinsUI();
  }
  function buildStars() {
    var s = $('stars');
    for (var i = 0; i < 34; i++) {
      var d = document.createElement('i');
      d.style.left = (Math.random() * 98) + '%'; d.style.top = (Math.random() * 95) + '%';
      d.style.animationDelay = '-' + (Math.random() * 6).toFixed(2) + 's';
      if (i % 3 === 0) { d.style.width = d.style.height = '3px'; }
      s.appendChild(d);
    }
  }
  function renderPalette() {
    var pal = $('palette'); pal.replaceChildren();
    SR.ITEMS.filter(function (it) { return zoneFilter === 'all' || it.zone === zoneFilter; }).forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'pal' + (sel === it.id ? ' sel' : '');
      b.innerHTML = SR.ART[it.id]('#ff5cc0', true) + '<span>' + it.name + '</span><span class="cost">' + it.coin + ' coins</span><small>' + it.zone + '</small>';
      b.setAttribute('aria-pressed', sel === it.id ? 'true' : 'false');
      b.addEventListener('click', function () {
        sel = sel === it.id ? null : it.id;
        if (sel) {
          var free = SLOTS.some(function (s) { return s.zone === it.zone && !st.room[s.id]; });
          msg(free ? 'Tap a glowing ' + it.zone + ' spot to place the ' + it.name.toLowerCase() + '.' : 'Every ' + it.zone + ' spot is full. Tap an item in the room to put it away first.');
          $('stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        renderPalette(); renderRoom();
      });
      pal.appendChild(b);
    });
  }

  function onSlot(s) {
    var p = st.room[s.id];
    if (p) { interact(s, p); return; }
    if (!sel) return;
    var it = itemById(sel);
    if (it.zone !== s.zone) return;
    if (st.coins < it.coin) { msg('You need ' + it.coin + ' coins. Welcome visitors in the Visitors tab to earn more.'); return; }
    st.coins -= it.coin;
    st.room[s.id] = { id: it.id, color: it.kind === 'fibre' || it.kind === 'bubble' ? 'pink' : (it.kind === 'cosy' || it.kind === 'swing' ? 'purple' : 'blue'), on: true };
    sel = null;
    award('first');
    if (it.kind === 'fibre') award('fibre');
    if (it.kind === 'bubble') award('bubbles');
    if (placed().length >= 12) award('full');
    save(); renderRoom(); renderPalette(); renderVisitor();
    playFor(it, st.room[s.id], true);
    msg(it.name + ' placed. ' + it.desc);
    syncMusic();
  }

  function cycleColour(p) {
    var ids = SR.COLORS.map(function (c) { return c.id; });
    p.color = ids[(ids.indexOf(p.color) + 1) % ids.length];
  }
  function playFor(it, p, quiet) {
    switch (it.kind) {
      case 'fibre': SFX.chime(); break;
      case 'bubble': SFX.bubble(); break;
      case 'stars': SFX.sparkle(); break;
      case 'galaxy': SFX.sparkle(); break;
      case 'rain': SFX.rain(); break;
      case 'fidget': case 'sequin': case 'stones': SFX.click(); break;
      case 'swing': SFX.whoosh(); break;
      case 'cosy': SFX.cosy(); break;
      case 'quiet': if (!quiet) { quietUntil = Date.now() + 15000; setVol(); setTimeout(setVol, 15100); } break;
    }
  }
  function interact(s, p) {
    var it = itemById(p.id);
    var note = '';
    if (it.kind === 'fibre' || it.kind === 'bubble' || it.kind === 'sequin' || it.kind === 'rain') { cycleColour(p); note = 'Colour: ' + SR.COLORS.filter(function (c) { return c.id === p.color; })[0].name + '.'; }
    else if (it.kind === 'stars' || it.kind === 'galaxy') { p.on = !p.on; note = p.on ? 'Switched on. It fades in slowly.' : 'Switched off.'; }
    else if (it.kind === 'quiet') note = 'Room sound turned down for 15 seconds.';
    else if (it.kind === 'cosy' || it.kind === 'swing') { cycleColour(p); if (p.color === 'rainbow') cycleColour(p); note = 'Fabric colour changed.'; }
    else note = it.desc;
    playFor(it, p, false);
    var el = document.querySelector('.slot[data-slot="' + s.id + '"]');
    if (el && it.kind === 'swing') { el.querySelector('.sway') && (el.querySelector('.sway').style.animationDuration = '2.6s'); }
    save(); renderRoom(); renderVisitor(); syncMusic();
    openSheet(s, p, note);
  }

  function openSheet(s, p, note) {
    var it = itemById(p.id), shop = SR.SHOP[it.shop];
    $('sheetTitle').textContent = it.name;
    $('sheetText').textContent = note + ' ' + it.desc;
    var btns = $('sheetBtns'); btns.replaceChildren();
    if (['fibre', 'bubble', 'sequin', 'rain', 'cosy', 'swing'].indexOf(it.kind) >= 0) {
      SR.COLORS.forEach(function (c) {
        if ((it.kind === 'cosy' || it.kind === 'swing') && c.id === 'rainbow') return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'sw';
        b.style.background = c.id === 'rainbow' ? 'linear-gradient(135deg,#ff5cc0,#ffcf5c,#5cf0a0,#4cb8ff,#b07cff)' : c.hex;
        b.setAttribute('aria-label', c.name);
        b.addEventListener('click', function () { p.color = c.id; playFor(it, p, true); save(); renderRoom(); renderVisitor(); $('sheetText').textContent = 'Colour: ' + c.name + '. ' + it.desc; });
        btns.appendChild(b);
      });
    }
    var real = document.createElement('a');
    real.href = SHOP_URL + '#item-' + it.shop;
    real.textContent = 'Get the real one, US$' + shop.price;
    real.className = 'getreal';
    var away = document.createElement('button'); away.type = 'button'; away.className = 'ghost';
    var back = p.gift ? 0 : it.coin;
    away.textContent = back ? 'Put away (+' + back + ' coins)' : 'Put away (welcome gift)';
    away.addEventListener('click', function () { delete st.room[s.id]; st.coins += back; save(); closeSheet(); renderRoom(); renderVisitor(); syncMusic(); msg(it.name + ' put away.' + (back ? ' Coins returned.' : '')); });
    var close = document.createElement('button'); close.type = 'button'; close.textContent = 'Done';
    close.addEventListener('click', closeSheet);
    btns.append(real, away, close);
    $('sheet').hidden = false;
  }
  function closeSheet() { $('sheet').hidden = true; }

  /* ---------- visitors, coins and badges ---------- */
  function award(id) {
    if (st.badges[id]) return;
    st.badges[id] = Date.now();
    var b = BADGES.filter(function (x) { return x.id === id; })[0];
    setTimeout(function () { msg('New badge: ' + b.name + '.'); }, 900);
    renderBadges();
  }
  function evalVisitor(i) {
    var v = VISITORS[i];
    var res = v.needs.map(function (n) { return { text: n[0], ok: !!n[1]() }; });
    var all = res.every(function (r) { return r.ok; });
    var c = comfort();
    var stars = all ? 1 + (c >= 60 ? 1 : 0) + (v.bonus[1]() ? 1 : 0) : 0;
    return { res: res, all: all, comfort: c, stars: stars, bonusOk: !!v.bonus[1]() };
  }
  function faceSvg(col) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="' + col + '"/><circle cx="36" cy="44" r="5" fill="#2a1640"/><circle cx="64" cy="44" r="5" fill="#2a1640"/><path d="M34 62 Q50 76 66 62" stroke="#2a1640" stroke-width="5" fill="none" stroke-linecap="round"/></svg>';
  }
  function renderVisitor() {
    var i = Math.min(st.level, VISITORS.length - 1), v = VISITORS[i], e = evalVisitor(i);
    var card = $('visitorCard'); card.replaceChildren();
    var face = document.createElement('div'); face.className = 'face'; face.innerHTML = faceSvg(v.face);
    var h = document.createElement('h3'); h.textContent = 'Visitor ' + (i + 1) + ': ' + v.name;
    var q = document.createElement('p'); q.textContent = '"' + v.says + '"';
    var ul = document.createElement('ul');
    e.res.forEach(function (r) { var li = document.createElement('li'); li.className = r.ok ? 'ok' : 'no'; li.textContent = r.text; ul.appendChild(li); });
    var bl = document.createElement('li'); bl.className = e.bonusOk ? 'ok' : 'no'; bl.textContent = 'Bonus star: ' + v.bonus[0]; ul.appendChild(bl);
    var cl = document.createElement('li'); cl.className = e.comfort >= 60 ? 'ok' : 'no'; cl.textContent = 'Bonus star: room comfort 60 or more'; ul.appendChild(cl);
    var m = document.createElement('div'); m.className = 'meter'; m.innerHTML = '<i style="width:' + e.comfort + '%"></i>';
    var ct = document.createElement('p'); ct.textContent = 'Room comfort: ' + e.comfort + ' out of 100. Mix light, seats, touch, sound, movement, pressure and quiet.';
    var best = st.stars[i] || 0;
    var bt = document.createElement('button'); bt.type = 'button'; bt.id = 'inviteBtn';
    bt.textContent = 'Invite ' + v.name + (best ? ' again (best ' + best + ' of 3 stars)' : '');
    bt.addEventListener('click', function () { invite(i); });
    card.append(face, h, q, ul, m, ct, bt);
    var list = $('levelList'); list.replaceChildren();
    VISITORS.forEach(function (vv, k) {
      var b = document.createElement('button'); b.type = 'button';
      var unlocked = k <= maxUnlocked();
      b.textContent = (k + 1) + '. ' + vv.name + ' ' + (st.stars[k] ? '\u2605'.repeat(st.stars[k]) : '');
      b.disabled = !unlocked;
      if (k === i) b.className = 'cur';
      b.addEventListener('click', function () { st.level = k; save(); renderVisitor(); });
      list.appendChild(b);
    });
  }
  function maxUnlocked() { var k = 0; while (k < VISITORS.length - 1 && st.stars[k]) k++; return k; }
  function invite(i) {
    var e = evalVisitor(i), v = VISITORS[i];
    if (!e.all) { msg(v.name + ' would like a few more things first. Check the list.'); SFX.cosy(); return; }
    var prev = st.stars[i] || 0, reward = 0;
    if (e.stars > prev) { reward = (e.stars - prev) * 50 + (prev === 0 ? 30 : 0); st.stars[i] = e.stars; }
    st.coins += reward; st.earned += reward;
    if (st.calm) award('calm');
    if (e.stars === 3) award('stars3');
    if (VISITORS.every(function (_, k) { return st.stars[k]; })) award('all');
    if (i === st.level && i < VISITORS.length - 1) st.level = i + 1;
    save(); SFX.coins(); renderRoom(); renderVisitor();
    msg(v.name + ' enjoyed the room: ' + e.stars + ' of 3 stars.' + (reward ? ' You earned ' + reward + ' coins.' : ' Beat your best stars to earn more coins.'));
  }
  function renderBadges() {
    var b = $('badges'); b.replaceChildren();
    BADGES.forEach(function (x) { var s = document.createElement('span'); s.className = 'badge' + (st.badges[x.id] ? ' got' : ''); s.textContent = x.name; b.appendChild(s); });
  }
  function renderReal() {
    var box = $('realList'); box.replaceChildren(); var seen = {};
    SR.ITEMS.forEach(function (it) {
      if (seen[it.shop]) return; seen[it.shop] = 1;
      var s = SR.SHOP[it.shop];
      var a = document.createElement('a'); a.className = 'real'; a.href = SHOP_URL + '#item-' + it.shop;
      a.innerHTML = '<span></span><b></b>'; a.firstChild.textContent = s.name; a.lastChild.textContent = 'US$' + s.price;
      box.appendChild(a);
    });
  }

  /* ---------- settings ---------- */
  function bindSettings() {
    var calm = $('calmToggle'), vol = $('vol'), br = $('bright'), mu = $('musicToggle');
    calm.checked = !!st.calm; vol.value = st.vol; br.value = st.bright; mu.checked = !!st.music;
    $('volV').textContent = st.vol; $('brightV').textContent = st.bright;
    calm.addEventListener('change', function () {
      st.calm = calm.checked;
      if (st.calm) { if (st.vol > 40) st.vol = 40; if (st.bright > 60) st.bright = 60; vol.value = st.vol; br.value = st.bright; $('volV').textContent = st.vol; $('brightV').textContent = st.bright; }
      save(); setVol(); renderRoom(); renderVisitor(); msg(st.calm ? 'Calm mode on: softer colours, slower movement and quieter sound.' : 'Calm mode off.');
    });
    vol.addEventListener('input', function () { st.vol = +vol.value; $('volV').textContent = st.vol; save(); setVol(); renderVisitor(); });
    br.addEventListener('input', function () { st.bright = +br.value; $('brightV').textContent = st.bright; save(); renderRoom(); renderVisitor(); });
    mu.addEventListener('change', function () { st.music = mu.checked; save(); audio(); syncMusic(); });
    var pb = $('paints');
    PAINTS.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.style.background = p.hex; b.setAttribute('aria-label', p.id + ' wall');
      if (st.paint === p.id) b.className = 'on';
      b.addEventListener('click', function () { st.paint = p.id; save(); Array.prototype.forEach.call(pb.children, function (c) { c.className = ''; }); b.className = 'on'; renderRoom(); renderVisitor(); });
      pb.appendChild(b);
    });
    $('resetBtn').addEventListener('click', function () {
      if (!window.confirm('Start a new room? Your items go back and your coins stay.')) return;
      placed().forEach(function (x) { if (!x.p.gift) st.coins += x.item.coin; });
      st.room = {}; save(); renderRoom(); renderVisitor(); syncMusic();
    });
  }

  function tabs() {
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.tabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        document.querySelectorAll('.tabp').forEach(function (p) { p.classList.toggle('on', p.id === 'tab-' + b.dataset.tab); });
        if (b.dataset.tab === 'visitor') renderVisitor();
      });
    });
    document.querySelectorAll('.zones button').forEach(function (b) {
      b.addEventListener('click', function () {
        zoneFilter = b.dataset.zone;
        document.querySelectorAll('.zones button').forEach(function (x) { x.classList.toggle('on', x === b); });
        renderPalette();
      });
    });
  }

  function daily() {
    var d = new Date(), key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    if (st.day !== key) { var first = !st.day; st.day = key; if (!first) { st.coins += 40; setTimeout(function () { msg('Welcome back. Daily bonus: 40 coins.'); }, 600); } save(); }
  }
  setInterval(function () {
    if (document.hidden || !placed().length) return;
    var add = Math.min(5, Math.floor(comfort() / 20));
    if (add > 0) { st.coins += add; st.earned += add; save(); coinsUI(); }
  }, 45000);

  function start() {
    $('startCalm').checked = !!st.calm;
    $('playBtn').addEventListener('click', function () {
      st.calm = $('startCalm').checked; $('calmToggle').checked = st.calm;
      save(); $('start').hidden = true; audio(); syncMusic(); renderRoom();
      msg(st.earned || Object.keys(st.stars).length ? 'Welcome back to your room.' : 'Your room starts with a fibre optic waterfall. Tap it to change colour, then build from the list below.');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  }

  buildStars(); tabs(); bindSettings(); daily(); renderPalette(); renderRoom(); renderVisitor(); renderBadges(); renderReal(); start();
  window.CBSensoryRoom = { state: function () { return JSON.parse(JSON.stringify(st)); }, comfort: comfort };
})();
