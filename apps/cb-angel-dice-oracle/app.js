/*! Coffeebreak Connecting with Angels — Dice Oracle Board (original content). */
(function () {
  'use strict';

  var SECTIONS = [
    { id: 'love', label: 'Love', color: '#f7b6d2', emoji: '💗' },
    { id: 'guidance', label: 'Guidance', color: '#c9b6f2', emoji: '🕊️' },
    { id: 'healing', label: 'Healing', color: '#b6e5d8', emoji: '🌿' },
    { id: 'abundance', label: 'Abundance', color: '#f5e6b8', emoji: '✨' },
    { id: 'protection', label: 'Protection', color: '#b8d4f5', emoji: '🛡️' },
    { id: 'purpose', label: 'Purpose', color: '#e8c9f5', emoji: '🌟' },
    { id: 'courage', label: 'Courage', color: '#f5c9b8', emoji: '🔥' },
    { id: 'peace', label: 'Peace', color: '#d4e8f5', emoji: '🌙' },
    { id: 'clarity', label: 'Clarity', color: '#e8f5d4', emoji: '💎' },
    { id: 'gratitude', label: 'Gratitude', color: '#f5e8c9', emoji: '🙏' },
    { id: 'hope', label: 'Hope', color: '#f5d4e8', emoji: '🌈' },
    { id: 'beginnings', label: 'New Beginnings', color: '#d4f5e8', emoji: '🌱' }
  ];

  // Original Coffeebreak angels — not based on any third-party deck.
  var ANGELS = {
    love: [
      { name: 'Lumara Softwing', msg: 'Warmth is already moving toward you. Soften your grip and let care arrive in its own gentle time.', affirm: 'I open my heart to love that feels safe and true.' },
      { name: 'Rosa Dawnveil', msg: 'Someone’s kindness is closer than it looks. Notice the small gestures — they are the real language of love.', affirm: 'I notice and receive love in quiet, everyday ways.' }
    ],
    guidance: [
      { name: 'Seren Vale', msg: 'You already know the next kind step. Trust the quiet nudge more than the loud worry.', affirm: 'I listen for the soft yes inside me.' },
      { name: 'Elowen Pathlight', msg: 'Ask for a sign you can actually use today — then take one simple action that matches it.', affirm: 'Guidance becomes clear when I take one honest step.' }
    ],
    healing: [
      { name: 'Mira Gentlewaters', msg: 'Rest is not giving up. Let your body and heart catch up with each other.', affirm: 'I allow rest to restore me.' },
      { name: 'Aurelia Balm', msg: 'What hurt is allowed to soften. You do not have to rush the mend.', affirm: 'Healing can be slow and still be real.' }
    ],
    abundance: [
      { name: 'Golda Harvestglow', msg: 'There is more than enough room for good things. Make a little space and watch what fills it.', affirm: 'I welcome enoughness into my day.' },
      { name: 'Cassia Starpetal', msg: 'Abundance likes gratitude. Name three true gifts already in your hands.', affirm: 'I count what I have and invite more good in.' }
    ],
    protection: [
      { name: 'Solen Heartkeep', msg: 'Your boundaries are sacred light. It is kind to keep what drains you outside the circle.', affirm: 'I protect my peace with clear, gentle edges.' },
      { name: 'Briar Shieldbloom', msg: 'You are held. Walk where you feel steady, and leave what is not yours to carry.', affirm: 'I am safe to choose what stays and what goes.' }
    ],
    purpose: [
      { name: 'Nova Lifespark', msg: 'Your purpose is not a single job title — it is how you leave people feeling.', affirm: 'I live my purpose in small, honest acts.' },
      { name: 'Thalen Truecourse', msg: 'Follow the work that makes time feel lighter. That is a compass, not a coincidence.', affirm: 'I trust the path that energises me.' }
    ],
    courage: [
      { name: 'Kael Brightember', msg: 'Courage is often quiet. Speak the true sentence you have been holding back.', affirm: 'I am brave enough for one honest word.' },
      { name: 'Freya Lionlight', msg: 'Fear can ride along, but it does not get to drive. Take the next inch forward.', affirm: 'I move forward even when I feel unsure.' }
    ],
    peace: [
      { name: 'Silva Moonrest', msg: 'Peace begins in the breath you are taking now. Soften your shoulders and come home to this moment.', affirm: 'I choose calm in this breath.' },
      { name: 'Iona Stillpond', msg: 'You do not have to solve everything tonight. Stillness is allowed.', affirm: 'I let peace hold what I cannot fix yet.' }
    ],
    clarity: [
      { name: 'Crystal Farseeing', msg: 'Write the question down. Clarity likes ink more than swirling thoughts.', affirm: 'I make space for clear answers.' },
      { name: 'Liora Clearsky', msg: 'What would this look like if it were simple? Start there.', affirm: 'I choose the simplest true path.' }
    ],
    gratitude: [
      { name: 'Blessa Thankflight', msg: 'Name one ordinary miracle from today. Gratitude multiplies what it notices.', affirm: 'I am thankful for what is already here.' },
      { name: 'Pax Offeringwing', msg: 'Give thanks before you ask. It changes the whole conversation.', affirm: 'My gratitude opens new doors.' }
    ],
    hope: [
      { name: 'Iris Afterrain', msg: 'A brighter stretch is forming. Keep a small light on for what is coming.', affirm: 'I keep hope lit, even in grey weather.' },
      { name: 'Haven Dayrise', msg: 'Tomorrow does not have to be perfect to be better. Let hope be practical.', affirm: 'I believe a kinder day is possible.' }
    ],
    beginnings: [
      { name: 'Sprout Firstlight', msg: 'Beginnings love tiny seeds. Start with five honest minutes.', affirm: 'I begin softly and steadily.' },
      { name: 'Dawn Featherstep', msg: 'You do not need the whole map. You only need the first welcoming door.', affirm: 'I step into new beginnings with soft courage.' }
    ]
  };

  var SPREAD_LABELS = {
    1: ['Single light'],
    2: ['Path', 'Gift'],
    3: ['Past', 'Present', 'Next step']
  };

  var JKEY = 'cb_angel_dice_journal';
  var DEMO_KEY = 'cb_angel_dice_demo_rolls';
  var MODE = (document.body && document.body.dataset && document.body.dataset.mode) || 'full';
  var DEMO_LIMIT = 3;

  var state = {
    chime: true,
    lastReading: null,
    rolling: false
  };

  function $(id) { return document.getElementById(id); }

  function fairInt(max) {
    // crypto.getRandomValues — unbiased for max up to 256
    if (max <= 0) return 0;
    var buf = new Uint32Array(1);
    var limit = Math.floor(0x100000000 / max) * max;
    var x;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % max;
  }

  function pickSection() {
    return SECTIONS[fairInt(SECTIONS.length)];
  }

  function pickAngel(sectionId) {
    var list = ANGELS[sectionId] || ANGELS.guidance;
    return list[fairInt(list.length)];
  }

  function loadJournal() {
    try {
      var raw = localStorage.getItem(JKEY);
      if (!raw) return [];
      var d = JSON.parse(raw);
      return Array.isArray(d) ? d : (d.entries || []);
    } catch (e) { return []; }
  }

  function saveJournal(entries) {
    try {
      localStorage.setItem(JKEY, JSON.stringify({ v: 1, entries: entries.slice(-300) }));
      return true;
    } catch (e) { return false; }
  }

  function demoRollsUsed() {
    try { return parseInt(localStorage.getItem(DEMO_KEY) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function bumpDemoRoll() {
    try { localStorage.setItem(DEMO_KEY, String(demoRollsUsed() + 1)); } catch (e) {}
  }

  /* ---- Board drawing ---- */
  function drawBoard() {
    var canvas = $('board');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 8;
    ctx.clearRect(0, 0, W, H);

    // soft disc
    var g = ctx.createRadialGradient(cx, cy - 40, 20, cx, cy, R);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#fff5f8');
    g.addColorStop(1, '#f3e7ff');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    var n = SECTIONS.length;
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
      var a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R - 4, a0, a1);
      ctx.closePath();
      ctx.fillStyle = SECTIONS[i].color + '99';
      ctx.fill();
      ctx.strokeStyle = '#d4a84b88';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      var mid = (a0 + a1) / 2;
      var tx = cx + Math.cos(mid) * (R * 0.68);
      var ty = cy + Math.sin(mid) * (R * 0.68);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillStyle = '#5a3a55';
      ctx.font = 'bold 11px system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(SECTIONS[i].emoji + ' ' + SECTIONS[i].label, 0, 0);
      ctx.restore();
    }

    // centre medallion
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#fffefb';
    ctx.fill();
    ctx.strokeStyle = '#d4a84b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#9a5a2a';
    ctx.font = 'bold 13px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANGELS', cx, cy - 4);
    ctx.font = '11px system-ui,sans-serif';
    ctx.fillStyle = '#9a7590';
    ctx.fillText('ask · roll · receive', cx, cy + 12);

    // little feather marks
    ctx.strokeStyle = '#d4a84b66';
    ctx.lineWidth = 1;
    for (var f = 0; f < 8; f++) {
      var fa = (f / 8) * Math.PI * 2;
      var fx = cx + Math.cos(fa) * (R * 0.92);
      var fy = cy + Math.sin(fa) * (R * 0.92);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx + Math.cos(fa) * 10, fy + Math.sin(fa) * 10, fx + Math.cos(fa + 0.4) * 14, fy + Math.sin(fa + 0.4) * 14);
      ctx.stroke();
    }
  }

  /* ---- Dice UI ---- */
  function makeDieEl(face) {
    var el = document.createElement('div');
    el.className = 'die';
    var pips = [1, 2, 3, 4, 5, 6];
    for (var i = 0; i < 6; i++) {
      var faceEl = document.createElement('div');
      faceEl.className = 'face f' + (i + 1);
      faceEl.textContent = pips[i];
      el.appendChild(faceEl);
    }
    setDieFace(el, face || 1);
    return el;
  }

  // Map face 1..6 to CSS 3D rotation showing that face front
  var FACE_ROT = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateX(0deg) rotateY(-90deg)',
    3: 'rotateX(0deg) rotateY(180deg)',
    4: 'rotateX(0deg) rotateY(90deg)',
    5: 'rotateX(-90deg) rotateY(0deg)',
    6: 'rotateX(90deg) rotateY(0deg)'
  };

  function setDieFace(el, face) {
    el.style.transform = FACE_ROT[face] || FACE_ROT[1];
    el.dataset.face = String(face);
  }

  function playChime() {
    if (!state.chime) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = playChime._ctx || (playChime._ctx = new AC());
      var now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach(function (freq, i) {
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.02 + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.1 + i * 0.1);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.12);
        o.stop(now + 1.3 + i * 0.1);
      });
    } catch (e) {}
  }

  function renderResult(reading) {
    var box = $('result');
    if (!box) return;
    box.hidden = false;
    var html = '<h3>Your reading</h3>';
    if (reading.question) html += '<p class="muted"><b>Question:</b> ' + escapeHtml(reading.question) + '</p>';
    reading.dice.forEach(function (d, i) {
      html += '<div style="margin:10px 0;padding:10px;border-radius:12px;background:' + d.section.color + '55">';
      html += '<div class="meta">' + escapeHtml(d.role) + ' · die showed ' + d.face + ' · landed on <b>' + escapeHtml(d.section.label) + '</b> ' + d.section.emoji + '</div>';
      html += '<div class="angel-name">' + escapeHtml(d.angel.name) + '</div>';
      html += '<p>' + escapeHtml(d.angel.msg) + '</p>';
      html += '<div class="affirm">“' + escapeHtml(d.angel.affirm) + '”</div>';
      html += '</div>';
    });
    box.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function roll() {
    if (state.rolling) return;
    if (MODE === 'demo') {
      var used = demoRollsUsed();
      if (used >= DEMO_LIMIT) {
        $('rollStatus').textContent = 'Demo limit reached (3 rolls). Open the full free version or the buy page.';
        $('btnRoll').disabled = true;
        return;
      }
    }

    var n = parseInt(($('spread') || {}).value || '2', 10);
    if (![1, 2, 3].includes(n)) n = 2;
    var q = (($('question') || {}).value || '').trim();
    var roles = SPREAD_LABELS[n];
    var tray = $('diceTray');
    tray.innerHTML = '';
    state.rolling = true;
    $('btnRoll').disabled = true;
    $('rollStatus').textContent = 'Rolling with a fair secure random…';

    var diceEls = [];
    var faces = [];
    var picks = [];
    for (var i = 0; i < n; i++) {
      var face = fairInt(6) + 1;
      faces.push(face);
      var section = pickSection();
      var angel = pickAngel(section.id);
      picks.push({ face: face, section: section, angel: angel, role: roles[i] });
      var el = makeDieEl(1);
      el.classList.add('rolling');
      tray.appendChild(el);
      diceEls.push(el);
    }
    playChime();

    setTimeout(function () {
      diceEls.forEach(function (el, i) {
        el.classList.remove('rolling');
        setDieFace(el, faces[i]);
      });
      var reading = {
        id: 'ar_' + Date.now().toString(36) + '_' + fairInt(1e6).toString(36),
        ts: Date.now(),
        date: new Date().toISOString(),
        question: q,
        spread: n,
        dice: picks
      };
      state.lastReading = reading;
      renderResult(reading);
      state.rolling = false;
      $('btnRoll').disabled = false;
      $('btnSaveLocal').disabled = false;
      $('btnSaveGhost').disabled = false;
      if (MODE === 'demo') {
        bumpDemoRoll();
        var left = DEMO_LIMIT - demoRollsUsed();
        $('rollStatus').textContent = left > 0
          ? ('Demo rolls left: ' + left)
          : 'Demo limit reached (3 rolls). Open the full free version for unlimited rolls.';
        if (left <= 0) $('btnRoll').disabled = true;
      } else {
        $('rollStatus').textContent = 'Reading ready. Save it if you like.';
      }
    }, 950);
  }

  function readingSummary(r) {
    return (r.dice || []).map(function (d) {
      return d.role + ': ' + d.section.label + ' — ' + d.angel.name + ' — ' + d.angel.msg;
    }).join('\n');
  }

  function saveLocal() {
    if (!state.lastReading) return;
    var list = loadJournal();
    list.push(state.lastReading);
    var ok = saveJournal(list);
    $('saveStatus').textContent = ok ? 'Saved to Angel journal on this device.' : 'Could not save (storage full).';
    renderJournal();
  }

  function saveGhost() {
    if (!state.lastReading) return;
    if (!window.CBGhostJournal || !CBGhostJournal.saveFromApp) {
      $('saveStatus').textContent = 'Ghost Journal helper not loaded.';
      return;
    }
    var r = state.lastReading;
    var readings = (r.dice || []).map(function (d) {
      return d.section.label + ' · ' + d.angel.name;
    }).join(' | ');
    var notes = (r.question ? 'Q: ' + r.question + '\n\n' : '') + readingSummary(r) +
      '\n\nAffirmations:\n' + (r.dice || []).map(function (d) { return '• ' + d.angel.affirm; }).join('\n');
    var saved = CBGhostJournal.saveFromApp(
      'Connecting with Angels Dice Oracle',
      readings,
      notes,
      '',
      { date: r.date }
    );
    $('saveStatus').textContent = saved
      ? 'Also saved to Ghost Investigation Journal (Angels tab).'
      : 'Could not write to Ghost Journal (storage full).';
  }

  function renderJournal() {
    var list = loadJournal().slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    var q = (($('jq') || {}).value || '').trim().toLowerCase();
    if (q) {
      list = list.filter(function (e) {
        var hay = [e.question, readingSummary(e)].join(' ').toLowerCase();
        return hay.indexOf(q) >= 0;
      });
    }
    var box = $('journalList');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<p class="muted" style="text-align:center;padding:20px">No angel readings saved yet.</p>';
      return;
    }
    box.innerHTML = list.map(function (e) {
      var when = e.date ? new Date(e.date).toLocaleString() : '';
      var bits = (e.dice || []).map(function (d) {
        return '<div><b>' + escapeHtml(d.role) + '</b> — ' + escapeHtml(d.section.label) + ': <i>' + escapeHtml(d.angel.name) + '</i><br>' + escapeHtml(d.angel.msg) + '</div>';
      }).join('');
      return '<div class="journal-entry"><h4>' + escapeHtml(e.question || '(no question)') + '</h4><div class="meta">' + escapeHtml(when) + ' · ' + (e.spread || '?') + '-dice</div>' + bits + '</div>';
    }).join('');
  }

  function setTab(name) {
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === name);
    });
    document.querySelectorAll('.panel').forEach(function (p) {
      p.classList.toggle('on', p.id === 'panel-' + name);
    });
    if (name === 'journal') renderJournal();
  }

  function init() {
    drawBoard();
    // show one die at rest
    var tray = $('diceTray');
    if (tray) {
      tray.appendChild(makeDieEl(1));
      tray.appendChild(makeDieEl(3));
    }
    $('btnRoll') && $('btnRoll').addEventListener('click', roll);
    $('btnChime') && $('btnChime').addEventListener('click', function () {
      state.chime = !state.chime;
      $('btnChime').textContent = 'Chime: ' + (state.chime ? 'on' : 'off');
    });
    $('btnSaveLocal') && $('btnSaveLocal').addEventListener('click', saveLocal);
    $('btnSaveGhost') && $('btnSaveGhost').addEventListener('click', saveGhost);
    $('btnSearchJ') && $('btnSearchJ').addEventListener('click', renderJournal);
    $('btnExportJ') && $('btnExportJ').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify({ v: 1, app: 'Connecting with Angels Dice Oracle', entries: loadJournal() }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cb-angel-dice-journal.json';
      a.click();
    });
    $('btnClearJ') && $('btnClearJ').addEventListener('click', function () {
      if (confirm('Clear all angel journal readings on this device?')) {
        saveJournal([]);
        renderJournal();
      }
    });
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.tab); });
    });

    if (MODE === 'demo') {
      var left = DEMO_LIMIT - demoRollsUsed();
      $('rollStatus').textContent = left > 0
        ? ('Free demo — ' + left + ' roll' + (left === 1 ? '' : 's') + ' left')
        : 'Demo limit reached. Open the full free version.';
      if (left <= 0 && $('btnRoll')) $('btnRoll').disabled = true;
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
