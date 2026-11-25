/* LyricLoop — a local lyric game. Progress stays in this browser. */
(function () {
  'use strict';
  var KEY = 'cb-lyricloop-v1';
  var APP_URL = 'https://songwriterkaz.github.io/coffeebreak/apps/lyricloop/';
  var LEVELS = [
    { name: 'Rookie', xp: 0 },
    { name: 'Rising Star', xp: 100 },
    { name: 'Hitmaker', xp: 300 },
    { name: 'Superstar', xp: 700 },
    { name: 'Legend', xp: 1500 }
  ];
  var QUESTS = [
    { id: 'lines', name: 'Write 4 lines' },
    { id: 'vocal', name: 'Record 1 vocal' },
    { id: 'chorus', name: 'Make a chorus' },
    { id: 'publish', name: 'Publish 1 song' },
    { id: 'mp3', name: 'Download 1 MP3' }
  ];
  var BADGES = [
    { id: 'four', name: 'First Four', need: 'Write four lines in a day' },
    { id: 'chorus', name: 'Chorus Key', need: 'Mark a chorus' },
    { id: 'mic', name: 'Mic Check', need: 'Sing a vocal' },
    { id: 'pub', name: 'On the Pad', need: 'Publish a song on this device' },
    { id: 'dl', name: 'Take Home', need: 'Download an MP3' },
    { id: 'week', name: 'Week Flame', need: 'A 7-day streak' },
    { id: 'legend', name: "Legend's Pen", need: 'Reach Legend' }
  ];
  var SHOP = [
    { id: 'pad', name: 'Pink neon pad', cost: 40, kind: 'cosmetic' },
    { id: 'ink', name: 'Gold ink', cost: 60, kind: 'cosmetic' },
    { id: 'star', name: 'Star frame', cost: 80, kind: 'cosmetic' },
    { id: 'porch', name: 'Porch night theme', cost: 100, kind: 'cosmetic' },
    { id: 'confetti', name: 'Confetti on wins', cost: 50, kind: 'cosmetic' }
  ];
  var STORY = [
    { title: 'Step 1 · The hook', prompt: 'Write one line someone would remember on a porch at dusk.' },
    { title: 'Step 2 · The picture', prompt: 'Add a line with a place you can see: a road, a kitchen, a river, a stage.' },
    { title: 'Step 3 · The turn', prompt: 'Write a line that changes the feeling. Keep it kind.' },
    { title: 'Step 4 · The chorus', prompt: 'Write two short lines you could sing twice. Then mark them as a chorus.' },
    { title: 'Step 5 · The last light', prompt: 'Close the song with one line, then publish it on this device.' }
  ];
  var RHYMES = {
    night: ['light', 'bright', 'flight', 'sight', 'write'],
    heart: ['start', 'part', 'art', 'spark', 'chart'],
    road: ['load', 'showed', 'glowed', 'mode'],
    rain: ['train', 'again', 'lane', 'remain'],
    song: ['long', 'strong', 'along', 'belong'],
    home: ['roam', 'stone', 'alone', 'known'],
    fire: ['higher', 'desire', 'wire'],
    dream: ['stream', 'gleam', 'beam'],
    love: ['above', 'glove', 'dove'],
    coffee: ['toffee', 'softly']
  };
  var PRACTICE = [
    { name: 'Porch Light (practice)', xp: 220 },
    { name: 'Night Kettle (practice)', xp: 140 },
    { name: 'Gold String (practice)', xp: 80 }
  ];

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function yesterday(day) {
    var p = day.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function load() {
    var s = {
      name: 'Player', xp: 0, coins: 20, energy: 6, day: today(), streak: 0, lastPlay: '',
      spun: '', quests: { day: today(), done: {} }, badges: [], owned: [], equipped: {},
      lyrics: '', chorus: false, journal: [], songs: [], vocalId: 0, scores: [], story: 0, msg: ''
    };
    try { var raw = JSON.parse(localStorage.getItem(KEY) || 'null'); if (raw) Object.assign(s, raw); } catch (e) {}
    if (!s.quests || s.quests.day !== today()) s.quests = { day: today(), done: {} };
    if (s.day !== today()) { s.energy = 6; s.day = today(); }
    if (!Array.isArray(s.badges)) s.badges = [];
    if (!Array.isArray(s.owned)) s.owned = [];
    if (!s.equipped) s.equipped = {};
    return s;
  }
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} paintStats(); }

  function levelOf(xp) {
    var cur = LEVELS[0], next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xp) cur = LEVELS[i];
      else { next = LEVELS[i]; break; }
    }
    var floor = cur.xp;
    var ceil = next ? next.xp : cur.xp;
    var pct = next ? Math.max(0, Math.min(100, ((xp - floor) / (ceil - floor)) * 100)) : 100;
    return { name: cur.name, next: next ? next.name : 'Legend', pct: pct, xp: xp };
  }
  function touchDay() {
    var d = today();
    if (state.lastPlay === d) return;
    state.streak = state.lastPlay === yesterday(d) ? (state.streak || 0) + 1 : 1;
    state.lastPlay = d;
    if (state.streak >= 7) grant('week');
  }
  function addXP(n, coins) {
    touchDay();
    state.xp += n;
    if (coins) state.coins += coins;
    if (state.xp >= 1500) grant('legend');
    save();
  }
  function grant(id) { if (state.badges.indexOf(id) < 0) state.badges.push(id); }
  function quest(id) {
    if (state.quests.done[id]) return false;
    state.quests.done[id] = true;
    addXP(25, 10);
    if (id === 'lines') grant('four');
    if (id === 'chorus') grant('chorus');
    if (id === 'vocal') grant('mic');
    if (id === 'publish') grant('pub');
    if (id === 'mp3') grant('dl');
    state.msg = 'Quest complete: +25 XP and +10 coins.';
    return true;
  }
  function spendEnergy() {
    if (state.energy < 1) return false;
    state.energy -= 1;
    touchDay();
    save();
    return true;
  }
  function linesOf(text) { return String(text || '').split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean); }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function paintStats() {
    var lv = levelOf(state.xp || 0);
    var el = $('stats');
    if (!el) return;
    el.innerHTML = '<div class="stat">Streak<b>' + (state.streak || 0) + ' day' + ((state.streak === 1) ? '' : 's') + '</b></div>' +
      '<div class="stat">XP<b>' + (state.xp || 0) + '</b></div>' +
      '<div class="stat">Level<b>' + esc(lv.name) + '</b></div>' +
      '<div class="stat">Coins<b>' + (state.coins || 0) + '</b></div>' +
      '<div class="stat">Energy<b>' + (state.energy || 0) + '/6</b></div>' +
      '<div class="bar" title="Progress to ' + esc(lv.next) + '"><span style="width:' + lv.pct + '%"></span></div>';
    document.body.classList.toggle('theme-porch', !!state.equipped.porch);
    document.body.classList.toggle('ink-gold', !!state.equipped.ink);
  }

  function viewName() {
    var h = (location.hash || '#home').slice(1);
    if (['home', 'pad', 'feed', 'journal', 'profile', 'vocals', 'downloads'].indexOf(h) < 0) return 'home';
    return h;
  }

  function render() {
    paintStats();
    document.querySelectorAll('.side a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-view') === viewName()); });
    var box = $('view');
    var fn = { home: viewHome, pad: viewPad, feed: viewFeed, journal: viewJournal, profile: viewProfile, vocals: viewVocals, downloads: viewDownloads }[viewName()];
    box.innerHTML = fn();
    box.focus();
    bind(box);
  }

  function viewHome() {
    var q = QUESTS.map(function (item) {
      var done = state.quests.done[item.id];
      return '<li class="quest' + (done ? ' done' : '') + '">' + esc(item.name) + (done ? ' · done' : ' · +25 XP, +10 coins') + '</li>';
    }).join('');
    var dots = '';
    for (var i = 1; i <= 7; i++) dots += '<span class="badge' + (state.streak >= i ? '' : ' off') + '">' + i + '</span>';
    var board = leaderboard().map(function (r, i) { return '<li>' + (i + 1) + '. ' + esc(r.name) + ' · ' + r.xp + ' XP</li>'; }).join('');
    var shop = SHOP.map(function (item) {
      var owned = state.owned.indexOf(item.id) >= 0;
      return '<p>' + esc(item.name) + ' · ' + item.cost + ' coins ' +
        (owned ? '<button type="button" class="btn quiet" data-act="equip" data-id="' + item.id + '">' + (state.equipped[item.id] ? 'Equipped' : 'Equip') + '</button>'
          : '<button type="button" class="btn" data-act="buy" data-id="' + item.id + '">Unlock with coins</button>') + '</p>';
    }).join('');
    var step = STORY[Math.min(state.story || 0, STORY.length - 1)];
    return '<section class="card"><h1>Game Home</h1><p>' + esc(state.msg || 'Write lyrics, sing them, and keep a streak on this device.') + '</p></section>' +
      '<section class="card"><h2>Daily Spin</h2><p>One spin each local day. Prizes are XP, coins or energy. Nothing is paid.</p>' +
      '<button type="button" class="btn gold" id="spin"' + (state.spun === today() ? ' disabled' : '') + '>' + (state.spun === today() ? 'Spun today' : 'Spin') + '</button> <span id="spin-out"></span></section>' +
      '<section class="card"><h2>Daily Quests</h2><ul>' + q + '</ul></section>' +
      '<section class="card"><h2>Streak tracker</h2><p>' + dots + '</p><p>' + (state.streak || 0) + ' day streak. Play or write once each day.</p></section>' +
      '<section class="card"><h2>Game modes</h2>' +
      '<p><b>Story Mode</b> — 5 steps. ' + esc(step.title) + ': ' + esc(step.prompt) + '</p>' +
      '<p class="row"><button type="button" class="btn" data-act="story">Continue story</button></p>' +
      '<p><b>Battle Mode</b> — 60 second lyric sprint. Costs 1 energy.</p>' +
      '<p class="row"><button type="button" class="btn" data-act="battle">Start battle</button></p>' +
      '<div id="mode-box"></div>' +
      '<p><b>Rhyme Rush</b> — 30 seconds. Costs 1 energy.</p>' +
      '<p class="row"><button type="button" class="btn" data-act="rush">Start Rhyme Rush</button></p></section>' +
      '<section class="card"><h2>Leaderboard</h2><p>Saved on this device. Practice names are not other people online.</p><ol>' + board + '</ol></section>' +
      '<section class="card"><h2>Coins shop</h2><p>Cosmetic unlocks only. Coins are earned in the game. There are no paid unlocks.</p>' + shop +
      '<p>Pay by PayID (Teachers Mutual Bank): <b>darkokaz@gmx.com</b>. A tip does not unlock frames, themes or songs.</p></section>';
  }

  function leaderboard() {
    var rows = PRACTICE.map(function (p) { return { name: p.name, xp: p.xp }; });
    rows.push({ name: (state.name || 'Player') + ' (you)', xp: state.xp || 0 });
    (state.scores || []).forEach(function (s) { rows.push({ name: (state.name || 'Player') + ' · ' + s.mode, xp: s.xp }); });
    rows.sort(function (a, b) { return b.xp - a.xp; });
    return rows.slice(0, 8);
  }

  function viewPad() {
    var pink = state.equipped.pad ? ' pad-pink' : '';
    return '<section class="card' + pink + '"><h1>Lyric Pad</h1><p>Four non-empty lines finish today\'s writing quest.</p>' +
      '<textarea id="lyrics" maxlength="2000">' + esc(state.lyrics || '') + '</textarea>' +
      '<p class="row"><button type="button" class="btn" data-act="save-lyrics">Save lines</button>' +
      '<button type="button" class="btn quiet" data-act="mark-chorus">Mark as chorus</button>' +
      '<button type="button" class="btn gold" data-act="publish">Publish on this device</button></p>' +
      '<p class="msg" id="pad-msg">' + (state.chorus ? 'Chorus marked.' : '') + '</p></section>';
  }

  function viewFeed() {
    var songs = (state.songs || []).map(function (s) {
      return '<article class="card"><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p><p>On this device · ' + esc(s.at) + (s.chorus ? ' · chorus' : '') + '</p></article>';
    }).join('');
    return '<section class="card"><h1>Feed</h1><p>Songs you publish stay in this browser. They are not sent to a shared feed.</p>' +
      (songs || '<p>Nothing published yet.</p>') + '</section>';
  }

  function viewJournal() {
    var items = (state.journal || []).map(function (j) { return '<article><b>' + esc(j.day) + '</b><p>' + esc(j.text) + '</p></article>'; }).join('');
    return '<section class="card"><h1>Journal</h1><textarea id="journal" maxlength="1000" placeholder="What did you write today?"></textarea>' +
      '<p><button type="button" class="btn" data-act="save-journal">Save journal</button></p>' + items + '</section>';
  }

  function viewProfile() {
    var badges = BADGES.map(function (b) {
      var on = state.badges.indexOf(b.id) >= 0;
      return '<span class="badge' + (on ? '' : ' off') + '">' + esc(b.name) + '</span>';
    }).join(' ');
    var frame = state.equipped.star ? ' frame-star' : '';
    return '<section class="card' + frame + '"><h1>Profile</h1>' +
      '<label>Name <input id="pname" maxlength="24" value="' + esc(state.name || 'Player') + '"></label>' +
      '<p><button type="button" class="btn" data-act="save-name">Save name</button></p>' +
      '<p>Level: ' + esc(levelOf(state.xp || 0).name) + ' · ' + (state.xp || 0) + ' XP</p>' +
      '<h2>7 badges</h2><p>' + badges + '</p></section>';
  }

  var vocPage = 0;
  function viewVocals() {
    var lib = window.CBVocals;
    if (!lib) return '<section class="card"><h1>Vocals Library</h1><p>The 12,000 presets did not load.</p></section>';
    var dims = lib.dims();
    function sel(id, arr) {
      return '<label>' + id + '<select id="f-' + id + '"><option value="">All</option>' + arr.map(function (v) { return '<option>' + esc(v) + '</option>'; }).join('') + '</select></label>';
    }
    var result = lib.search('', {}, vocPage);
    var cards = result.items.map(function (p) {
      var on = lib.getSelected() && lib.getSelected().id === p.id;
      return '<article class="' + (on ? 'on' : '') + '"><b>' + esc(p.name) + '</b><p>' + esc(p.range + ' · ' + p.effect) + '</p>' +
        '<button type="button" class="btn quiet" data-act="preview" data-id="' + p.id + '">Preview</button> ' +
        '<button type="button" class="btn" data-act="use" data-id="' + p.id + '">Use</button></article>';
    }).join('');
    return '<section class="card"><h1>Vocals Library</h1><p>12,000 presets from Vocal Social. Preview uses the in-browser Coffeebreak voice.</p>' +
      '<input id="vq" type="search" placeholder="Search name, style or effect">' +
      '<div class="row">' + sel('type', dims.types) + sel('range', dims.ranges) + sel('style', dims.styles) + sel('emotion', dims.emotions) + sel('effect', dims.effects) + sel('pitch', dims.pitches) + '</div>' +
      '<p>' + result.total + ' vocals · page ' + (result.page + 1) + ' of ' + result.pages + '</p>' +
      '<div class="voc">' + cards + '</div>' +
      '<p class="row"><button type="button" class="btn quiet" data-act="vprev">Previous</button><button type="button" class="btn quiet" data-act="vnext">Next</button></p>' +
      '<p class="msg" id="voc-msg"></p><audio id="voc-audio" controls></audio></section>';
  }

  function viewDownloads() {
    return '<section class="card"><h1>Download Center</h1><p>The QR code opens this app: ' + esc(APP_URL) + '</p>' +
      '<div class="row"><div><button type="button" class="btn" data-act="dl-txt">Download lyrics</button></div><div id="qr-txt" class="qr" aria-label="QR code for LyricLoop"></div></div>' +
      '<div class="row"><div><button type="button" class="btn" data-act="dl-wav">Download sung WAV</button></div><div id="qr-wav" class="qr"></div></div>' +
      '<div class="row"><div><button type="button" class="btn gold" data-act="dl-mp3">Download MP3</button></div><div id="qr-mp3" class="qr"></div></div>' +
      '<p class="msg" id="dl-msg">Sung audio uses the Coffeebreak voice in this browser, with the vocal preset you picked. Studio quality is the ACE-Step path in Coffeebreak Studio when that free engine answers; otherwise this voice is the fallback.</p>' +
      '<p class="row"><button type="button" class="btn quiet" data-act="studio">Try studio quality</button></p></section>';
  }

  function paintQR() {
    if (!window.QRCode) return;
    ['qr-txt', 'qr-wav', 'qr-mp3'].forEach(function (id) {
      var n = document.getElementById(id);
      if (!n || n.childNodes.length) return;
      try { new QRCode(n, { text: APP_URL, width: 96, height: 96, correctLevel: QRCode.CorrectLevel.M }); } catch (e) { n.textContent = APP_URL; }
    });
  }

  function filters() {
    function val(id) { var n = document.getElementById('f-' + id); return n ? n.value : ''; }
    return { type: val('type'), range: val('range'), style: val('style'), emotion: val('emotion'), effect: val('effect'), pitch: val('pitch') };
  }

  function bind(box) {
    paintQR();
    box.querySelectorAll('[data-act]').forEach(function (b) { b.addEventListener('click', onAct); });
    var lyrics = document.getElementById('lyrics');
    if (lyrics) lyrics.addEventListener('input', function () { state.lyrics = lyrics.value; });
  }

  function onAct(ev) {
    var act = ev.currentTarget.getAttribute('data-act');
    var id = ev.currentTarget.getAttribute('data-id');
    if (act === 'save-lyrics') {
      var box = document.getElementById('lyrics');
      state.lyrics = box ? box.value : state.lyrics;
      if (linesOf(state.lyrics).length >= 4) quest('lines');
      save();
      say('pad-msg', 'Saved on this device.');
    } else if (act === 'mark-chorus') {
      state.chorus = true;
      quest('chorus');
      save();
      say('pad-msg', 'Chorus marked.');
    } else if (act === 'publish') {
      var text = (document.getElementById('lyrics') ? document.getElementById('lyrics').value : state.lyrics || '').trim();
      if (linesOf(text).length < 1) { say('pad-msg', 'Write a line first.'); return; }
      state.lyrics = text;
      state.songs.unshift({ title: linesOf(text)[0].slice(0, 48), text: text, chorus: !!state.chorus, at: today() });
      if (state.songs.length > 40) state.songs.length = 40;
      if (state.story < 5 && state.story === 4) state.story = 5;
      quest('publish');
      save();
      location.hash = '#feed';
    } else if (act === 'save-journal') {
      var j = document.getElementById('journal');
      var t = j ? j.value.trim() : '';
      if (!t) return;
      state.journal.unshift({ day: today(), text: t.slice(0, 1000) });
      save(); render();
    } else if (act === 'save-name') {
      var n = document.getElementById('pname');
      state.name = (n && n.value.trim().slice(0, 24)) || 'Player';
      save(); render();
    } else if (act === 'buy') {
      var item = SHOP.filter(function (s) { return s.id === id; })[0];
      if (!item || state.owned.indexOf(id) >= 0) return;
      if (state.coins < item.cost) { state.msg = 'Not enough coins. Earn them from quests and modes.'; save(); render(); return; }
      state.coins -= item.cost;
      state.owned.push(id);
      state.equipped[id] = true;
      state.msg = item.name + ' is on. It is a look only.';
      save(); render();
    } else if (act === 'equip') {
      state.equipped[id] = !state.equipped[id];
      save(); render();
    } else if (act === 'story') {
      var step = STORY[Math.min(state.story || 0, 4)];
      state.lyrics = ((state.lyrics || '') + (state.lyrics ? '\n' : '') + step.prompt).slice(0, 2000);
      state.story = Math.min(5, (state.story || 0) + 1);
      touchDay();
      if (state.story >= 4) { state.chorus = true; quest('chorus'); }
      addXP(15, 0);
      state.msg = step.title + ' saved into the Lyric Pad.';
      save();
      location.hash = '#pad';
    } else if (act === 'battle') startBattle();
    else if (act === 'rush') startRush();
    else if (act === 'preview' || act === 'use') vocalAct(act, +id);
    else if (act === 'vprev') { vocPage = Math.max(0, vocPage - 1); render(); }
    else if (act === 'vnext') { vocPage += 1; render(); }
    else if (act === 'dl-txt') downloadText();
    else if (act === 'dl-wav') singDownload('wav');
    else if (act === 'dl-mp3') singDownload('mp3');
    else if (act === 'studio') studioTry();
  }

  var spinTimer = 0;
  document.addEventListener('click', function (ev) {
    if (ev.target && ev.target.id === 'spin') doSpin();
  });
  function doSpin() {
    if (state.spun === today()) return;
    var prizes = [
      { t: '+15 XP', xp: 15, coins: 0, energy: 0 },
      { t: '+10 coins', xp: 0, coins: 10, energy: 0 },
      { t: '+1 energy', xp: 0, coins: 0, energy: 1 },
      { t: '+20 XP and +5 coins', xp: 20, coins: 5, energy: 0 }
    ];
    var p = prizes[Math.floor(Math.random() * prizes.length)];
    state.spun = today();
    state.energy = Math.min(6, (state.energy || 0) + p.energy);
    addXP(p.xp, p.coins);
    state.msg = 'Daily spin: ' + p.t;
    save();
    var out = document.getElementById('spin-out');
    if (out) out.textContent = p.t;
    if (state.equipped.confetti) burst();
    render();
  }
  function burst() {
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('i');
      s.textContent = '✦';
      s.style.cssText = 'position:fixed;left:' + (40 + Math.random() * 40) + '%;top:30%;color:#ffd15c;font-style:normal;pointer-events:none';
      document.body.appendChild(s);
      (function (el, k) { setTimeout(function () { el.remove(); }, 600 + k * 40); })(s, i);
    }
  }

  var modeTimer = 0;
  function startBattle() {
    if (!spendEnergy()) { state.msg = 'Energy is empty. It refills tomorrow, or spin if you have not yet.'; save(); render(); return; }
    var host = document.getElementById('mode-box');
    if (!host) { location.hash = '#home'; return; }
    var left = 60;
    host.innerHTML = '<h3>Battle Mode</h3><p class="timer" id="clock">60</p><textarea id="sprint" placeholder="Write as many lines as you can"></textarea><p id="sprint-msg"></p>';
    clearInterval(modeTimer);
    modeTimer = setInterval(function () {
      left -= 1;
      var c = document.getElementById('clock');
      if (c) c.textContent = String(left);
      if (left <= 0) {
        clearInterval(modeTimer);
        var text = (document.getElementById('sprint') || {}).value || '';
        var n = linesOf(text);
        var xp = Math.min(80, n.length * 8);
        state.lyrics = (state.lyrics ? state.lyrics + '\n' : '') + text;
        if (n.length >= 4) quest('lines');
        state.scores.unshift({ mode: 'Battle ' + n.length + ' lines', xp: (state.xp || 0) + xp });
        addXP(xp, n.length);
        var m = document.getElementById('sprint-msg');
        if (m) m.textContent = n.length + ' lines · +' + xp + ' XP. Saved into the Lyric Pad.';
      }
    }, 1000);
  }
  function startRush() {
    if (!spendEnergy()) { state.msg = 'Energy is empty. It refills tomorrow, or spin if you have not yet.'; save(); render(); return; }
    var host = document.getElementById('mode-box');
    if (!host) return;
    var keys = Object.keys(RHYMES);
    var word = keys[Math.floor(Math.random() * keys.length)];
    var hits = 0;
    var left = 30;
    host.innerHTML = '<h3>Rhyme Rush</h3><p class="timer" id="clock">30</p><p>Rhyme with <b id="rword">' + esc(word) + '</b></p><input id="rhyme" autocomplete="off"><p id="sprint-msg"></p>';
    var input = document.getElementById('rhyme');
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var guess = input.value.trim().toLowerCase();
      input.value = '';
      if (RHYMES[word].indexOf(guess) >= 0) {
        hits += 1;
        word = keys[Math.floor(Math.random() * keys.length)];
        document.getElementById('rword').textContent = word;
      }
    });
    clearInterval(modeTimer);
    modeTimer = setInterval(function () {
      left -= 1;
      var c = document.getElementById('clock');
      if (c) c.textContent = String(left);
      if (left <= 0) {
        clearInterval(modeTimer);
        var xp = hits * 12;
        state.scores.unshift({ mode: 'Rhyme Rush ' + hits, xp: (state.xp || 0) + xp });
        addXP(xp, hits);
        var m = document.getElementById('sprint-msg');
        if (m) m.textContent = hits + ' rhymes · +' + xp + ' XP.';
      }
    }, 1000);
  }

  function vocalAct(act, id) {
    var lib = window.CBVocals;
    if (!lib) return;
    if (act === 'use') { lib.setSelected(id); state.vocalId = id; save(); render(); return; }
    try {
      var bytes = lib.previewWav(lib.presetAt(id), state.lyrics || lib.PREVIEW_LYRICS);
      playBytes(bytes);
      quest('vocal');
      say('voc-msg', 'Preview playing.');
    } catch (err) { say('voc-msg', err.message || 'That vocal could not play.'); }
  }
  function playBytes(bytes) {
    var blob = new Blob([bytes], { type: 'audio/wav' });
    var url = URL.createObjectURL(blob);
    var a = document.getElementById('voc-audio') || new Audio();
    a.src = url;
    var p = a.play && a.play();
    if (p && p.catch) p.catch(function () {});
    return blob;
  }
  function singBytes() {
    var lib = window.CBVocals;
    if (!lib || !window.CBVoice) throw new Error('The vocal engine is not on this page.');
    var preset = lib.getSelected() || lib.presetAt(state.vocalId || 0);
    lib.setSelected(preset.id);
    var text = (state.lyrics || '').trim() || lib.PREVIEW_LYRICS;
    return { bytes: lib.previewWav(preset, text), name: preset.name, text: text };
  }
  function fileName(ext) {
    var line = linesOf(state.lyrics)[0] || 'lyricloop';
    return line.replace(/[^\w]+/g, '-').slice(0, 40) + '.' + ext;
  }
  function saveBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function downloadText() {
    var text = state.lyrics || '';
    if (!text.trim()) { say('dl-msg', 'Write lyrics first.'); return; }
    saveBlob(new Blob([text], { type: 'text/plain' }), fileName('txt'));
  }
  async function singDownload(fmt) {
    var msg = document.getElementById('dl-msg');
    try {
      if (msg) msg.textContent = 'Singing in this browser.';
      var sung = singBytes();
      quest('vocal');
      if (fmt === 'wav') {
        saveBlob(new Blob([sung.bytes], { type: 'audio/wav' }), fileName('wav'));
        if (msg) msg.textContent = 'WAV saved · ' + sung.name;
        return;
      }
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var buf = await ctx.decodeAudioData(sung.bytes.slice(0));
      if (typeof window.encodeMP3 !== 'function') throw new Error('The MP3 encoder did not load. The WAV is still available.');
      var mp3 = await window.encodeMP3(buf, 0, 128);
      saveBlob(mp3, fileName('mp3'));
      quest('mp3');
      if (msg) msg.textContent = 'MP3 saved · ' + sung.name;
    } catch (err) {
      if (msg) msg.textContent = err.message || 'The download could not be made.';
    }
  }
  function studioTry() {
    var msg = document.getElementById('dl-msg');
    var lyrics = (state.lyrics || '').trim();
    if (!lyrics) { if (msg) msg.textContent = 'Write lyrics first. The in-browser voice can still sing the preview line.'; return; }
    if (!window.CBStudioQuality) { if (msg) msg.textContent = 'Studio quality is not on this page. Download the sung WAV from the in-browser voice.'; return; }
    if (msg) msg.textContent = 'Asking the same ACE-Step path as Coffeebreak Studio.';
    window.CBStudioQuality.sing(lyrics, 'country vocal, warm, 100 BPM', function (t) { if (msg) msg.textContent = t; }).then(function (made) {
      if (!msg) return;
      msg.textContent = 'Studio file ready from ' + (made.backend || 'ACE-Step') + '. If you would rather keep the in-browser voice, use Download sung WAV. ';
      var a = document.createElement('a');
      a.href = made.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Open the studio file';
      msg.appendChild(a);
    }, function (err) {
      if (msg) msg.textContent = 'Studio quality did not answer (' + (err.message || 'busy') + '). Download sung WAV uses the in-browser voice.';
    });
  }
  function say(id, text) { var n = document.getElementById(id); if (n) n.textContent = text; }

  document.getElementById('btn-full').addEventListener('click', function () {
    var root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) root.requestFullscreen();
    else if (document.exitFullscreen) document.exitFullscreen();
  });
  window.addEventListener('hashchange', render);
  render();
})();
