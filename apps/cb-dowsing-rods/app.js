(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  // Glyphs around the board — fixed order, never randomised
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').concat(['YES', 'NO']);

  var state = {
    sensorsOn: false,
    hasOrientation: false,
    hasMotion: false,
    hasMag: false,
    beta: null,   // front-back tilt degrees
    gamma: null,  // left-right tilt degrees
    alpha: null,
    ax: 0, ay: 0, az: 0,
    mag: null,    // |B| microtesla if available
    magBase: null,
    leftAngle: -35,   // degrees from vertical, negative = out
    rightAngle: 35,
    cross: 0,         // 0 = fully open, 1 = fully crossed
    pointing: null,   // glyph index
    settledGlyph: null,
    settleMs: 0,
    writing: false,
    page: '',
    calYes: null,
    calNo: null,
    session: [],
    lastSample: '',
    recog: null
  };

  var CAL_KEY = 'cb_dowsing_cal';

  function loadCal() {
    try {
      var v = JSON.parse(localStorage.getItem(CAL_KEY) || 'null');
      if (v && typeof v.yes === 'number') state.calYes = v.yes;
      if (v && typeof v.no === 'number') state.calNo = v.no;
    } catch (e) {}
    paintCal();
  }
  function saveCal() {
    try { localStorage.setItem(CAL_KEY, JSON.stringify({ yes: state.calYes, no: state.calNo })); } catch (e) {}
    paintCal();
  }
  function paintCal() {
    $('calYes').textContent = state.calYes == null ? 'Not set' : ('cross ' + state.calYes.toFixed(2));
    $('calNo').textContent = state.calNo == null ? 'Not set' : ('cross ' + state.calNo.toFixed(2));
  }

  function setStatus(ok, msg) {
    var el = $('sensorStatus');
    el.className = 'status ' + (ok ? 'ok' : 'bad');
    el.textContent = msg;
  }

  function logSession(line) {
    state.session.push({ t: new Date().toISOString(), line: line });
    var box = $('sessionLog');
    var d = document.createElement('div');
    d.textContent = new Date().toLocaleTimeString() + ' · ' + line;
    box.prepend(d);
  }

  function sensorSnapshot() {
    var parts = [];
    if (state.beta != null) parts.push('β ' + state.beta.toFixed(1) + '°');
    if (state.gamma != null) parts.push('γ ' + state.gamma.toFixed(1) + '°');
    if (state.mag != null) parts.push('mag ' + state.mag.toFixed(1) + ' µT');
    parts.push('cross ' + state.cross.toFixed(2));
    if (state.pointing != null) parts.push('point ' + GLYPHS[state.pointing]);
    return parts.join(' · ');
  }

  // --- Sensor enable ---
  function onOrientation(e) {
    if (e.beta == null && e.gamma == null) return;
    state.hasOrientation = true;
    if (typeof e.beta === 'number') state.beta = e.beta;
    if (typeof e.gamma === 'number') state.gamma = e.gamma;
    if (typeof e.alpha === 'number') state.alpha = e.alpha;
    state.sensorsOn = true;
    updateFromSensors();
  }
  function onMotion(e) {
    var a = e.accelerationIncludingGravity || e.acceleration;
    if (!a) return;
    state.hasMotion = true;
    state.ax = a.x || 0; state.ay = a.y || 0; state.az = a.z || 0;
    // Derive tilt-like values from gravity if orientation missing
    if (!state.hasOrientation && (a.x != null || a.y != null || a.z != null)) {
      var x = a.x || 0, y = a.y || 0, z = a.z || 0;
      // approx gamma/beta from gravity vector
      state.gamma = Math.atan2(x, Math.sqrt(y * y + z * z)) * 180 / Math.PI;
      state.beta = Math.atan2(y, Math.sqrt(x * x + z * z)) * 180 / Math.PI;
      state.sensorsOn = true;
    }
    updateFromSensors();
  }

  function startMag() {
    try {
      if (!('Magnetometer' in window)) {
        $('sensorDetail').textContent = ( $('sensorDetail').textContent || '') + ' Magnetometer API not available in this browser.';
        return;
      }
      var mg = new Magnetometer({ frequency: 10 });
      mg.addEventListener('reading', function () {
        var m = Math.hypot(mg.x || 0, mg.y || 0, mg.z || 0);
        state.mag = m;
        if (state.magBase == null) state.magBase = m;
        state.hasMag = true;
        state.sensorsOn = true;
        updateFromSensors();
      });
      mg.addEventListener('error', function () {
        setStatus(state.hasOrientation || state.hasMotion, 'Magnetometer permission denied or unavailable. Tilt/motion still work if enabled.');
      });
      mg.start();
      $('sensorDetail').textContent = 'Magnetometer started. Move near metal or magnets to change the field.';
    } catch (err) {
      $('sensorDetail').textContent = 'Magnetometer could not start: ' + (err && err.message ? err.message : err);
    }
  }

  function enableSensors() {
    function bind() {
      window.addEventListener('deviceorientation', onOrientation, true);
      window.addEventListener('devicemotion', onMotion, true);
      setStatus(true, 'Listening for DeviceOrientation and DeviceMotion. Tilt the phone to move the rods.');
      $('sensorDetail').textContent = 'Waiting for the first real sensor sample…';
      // If nothing arrives in 3s, say so
      setTimeout(function () {
        if (!state.sensorsOn) {
          setStatus(false, 'No sensor data arrived. This device or browser may block orientation/motion (common on desktop and some iOS Safari settings). Open on a phone and allow motion access.');
        }
      }, 3000);
    }
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function (r) {
          if (r === 'granted') {
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
              DeviceMotionEvent.requestPermission().then(function () { bind(); }).catch(bind);
            } else bind();
          } else {
            setStatus(false, 'Motion permission was not granted. Rods cannot move without real sensors.');
          }
        }).catch(function (e) {
          setStatus(false, 'Could not request motion permission: ' + (e && e.message ? e.message : e));
        });
      } else {
        bind();
      }
    } catch (e) {
      setStatus(false, 'Sensors are not available in this browser.');
    }
  }

  /**
   * Map real sensor values → rod angles.
   * Absolutely no Math.random. Only orientation / motion / magnetometer.
   */
  function updateFromSensors() {
    if (state.beta == null && state.gamma == null && state.mag == null) return;

    var gamma = state.gamma || 0; // -90..90 typically
    var beta = state.beta || 0;

    // Mag delta: stronger field change pulls rods inward a little
    var magPull = 0;
    if (state.mag != null && state.magBase != null) {
      magPull = Math.max(-20, Math.min(20, (state.mag - state.magBase) * 0.35));
    }

    // Left rod: opens/closes with left tilt (negative gamma) + forward tilt
    // Right rod: mirrored
    // Cross increases when gamma near 0 and beta tips forward, or magPull positive
    var baseOpen = 48;
    var left = -baseOpen + gamma * 0.7 + beta * 0.25 + magPull * 0.5;
    var right = baseOpen + gamma * 0.7 - beta * 0.25 - magPull * 0.5;

    // Clamp to realistic L-rod swing
    left = Math.max(-70, Math.min(25, left));
    right = Math.max(-25, Math.min(70, right));

    state.leftAngle = left;
    state.rightAngle = right;

    // Cross metric: how much the tips meet (0 open … 1 crossed)
    // When left is near 0+ and right near 0-, they cross
    var tipGap = (right - left); // large when open, small/negative when crossed
    var cross = 1 - Math.max(0, Math.min(1, (tipGap + 20) / 100));
    state.cross = cross;

    // Pointing angle for letter board: use average swing + compass-like alpha if present
    var pointDeg;
    if (state.alpha != null && state.hasOrientation) {
      pointDeg = state.alpha; // 0..360
    } else {
      // Derive from gamma/beta vector
      pointDeg = (Math.atan2(gamma, beta) * 180 / Math.PI + 360) % 360;
    }
    // Mag can nudge the pointer when orientation alpha missing
    if (state.mag != null && state.alpha == null) {
      pointDeg = (pointDeg + (state.mag % 360)) % 360;
    }
    var idx = Math.floor((pointDeg / 360) * GLYPHS.length) % GLYPHS.length;
    state.pointing = idx;

    $('sensorBar').textContent = sensorSnapshot();
    $('pointLabel').textContent = 'Pointing: ' + GLYPHS[idx] + ' · cross ' + cross.toFixed(2);
    draw();
    maybeSettleWrite();
  }

  // --- Canvas: brass rods + letter board ---
  var canvas = $('rods');
  var ctx = canvas.getContext('2d');

  function draw() {
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H * 0.62;

    // Board ring + glyphs
    var R = Math.min(W, H) * 0.42;
    ctx.strokeStyle = '#1c7a35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 40, R, 0, Math.PI * 2);
    ctx.stroke();

    for (var i = 0; i < GLYPHS.length; i++) {
      var ang = (i / GLYPHS.length) * Math.PI * 2 - Math.PI / 2;
      var x = cx + Math.cos(ang) * R;
      var y = cy - 40 + Math.sin(ang) * R;
      var active = state.pointing === i;
      ctx.fillStyle = active ? '#39ff6a' : '#8fb89a';
      ctx.font = (active ? 'bold 13px' : '11px') + ' system-ui,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = active ? '#39ff6a' : 'transparent';
      ctx.shadowBlur = active ? 10 : 0;
      ctx.fillText(GLYPHS[i], x, y);
      ctx.shadowBlur = 0;
    }

    // Handles (grips) at bottom
    function rod(side, angleDeg) {
      var baseX = cx + side * 36;
      var baseY = cy + 20;
      var len = 170;
      var rad = (angleDeg - 90) * Math.PI / 180; // 0 deg = up
      // L-rod: long shaft then short tip
      var shaft = len * 0.72;
      var tip = len * 0.28;
      var mx = baseX + Math.cos(rad) * shaft;
      var my = baseY + Math.sin(rad) * shaft;
      // tip bends inward toward center
      var tipAng = rad + (side < 0 ? 0.9 : -0.9);
      var tx = mx + Math.cos(tipAng) * tip;
      var ty = my + Math.sin(tipAng) * tip;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // brass gradient look
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 7;
      ctx.shadowColor = '#c9a22788';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(mx, my);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = '#f0e0a0';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(mx, my);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      // grip
      ctx.fillStyle = '#5a4010';
      ctx.fillRect(baseX - 6, baseY - 4, 12, 28);
    }

    rod(-1, state.leftAngle);
    rod(1, state.rightAngle);

    // Cross indicator
    ctx.fillStyle = '#39ff6a';
    ctx.font = '12px ui-monospace,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.sensorsOn ? 'LIVE SENSORS' : 'WAITING FOR SENSORS', cx, 28);
  }

  // --- Yes/No from calibration ---
  function classifyYesNo() {
    if (state.calYes == null || state.calNo == null) return null;
    var c = state.cross;
    var dYes = Math.abs(c - state.calYes);
    var dNo = Math.abs(c - state.calNo);
    if (dYes === dNo) return 'UNCLEAR';
    return dYes < dNo ? 'YES' : 'NO';
  }

  function readAnswer() {
    if (!state.sensorsOn) {
      $('askResult').textContent = 'Sensors are not delivering data yet. Tap Enable phone sensors first.';
      $('answerBig').textContent = '—';
      return;
    }
    var q = ($('q').value || '').trim();
    if (!q) {
      $('askResult').textContent = 'Type or speak a question first.';
      return;
    }
    if (state.calYes == null || state.calNo == null) {
      $('askResult').textContent = 'Calibrate YES and NO first so answers come from your real rod positions.';
      return;
    }
    var ans = classifyYesNo();
    var snap = sensorSnapshot();
    $('answerBig').textContent = ans;
    $('askResult').textContent = 'Q: ' + q + ' → ' + ans + ' (from live cross ' + state.cross.toFixed(2) + ' vs YES ' + state.calYes.toFixed(2) + ' / NO ' + state.calNo.toFixed(2) + '). Sensors: ' + snap;
    logSession('Q: ' + q + ' → ' + ans + ' | ' + snap);
    // Auto-save this Q&A to ghost journal
    saveJournalEntry(
      'Yes/No via dowsing rods: ' + ans,
      'Question: ' + q + '\nAnswer: ' + ans + '\nSensors: ' + snap,
      { readings: 'cross=' + state.cross.toFixed(3) + '; ' + snap }
    );
  }

  // --- Speech ---
  function speakQuestion() {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      $('speechStatus').textContent = 'Speech recognition is not available in this browser. Type the question instead.';
      return;
    }
    try {
      if (state.recog) { try { state.recog.stop(); } catch (e) {} }
      var r = new SR();
      state.recog = r;
      r.lang = 'en-AU';
      r.interimResults = true;
      r.continuous = false;
      r.onstart = function () { $('speechStatus').textContent = 'Listening…'; $('btnSpeak').classList.add('on'); };
      r.onerror = function (e) {
        $('speechStatus').textContent = 'Mic/speech error: ' + (e.error || 'unknown') + '. You can still type.';
        $('btnSpeak').classList.remove('on');
      };
      r.onend = function () { $('btnSpeak').classList.remove('on'); $('speechStatus').textContent = 'Mic stopped.'; };
      r.onresult = function (ev) {
        var text = '';
        for (var i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
        $('q').value = text.trim();
        if (ev.results[ev.results.length - 1].isFinal) {
          $('speechStatus').textContent = 'Heard: ' + text.trim();
        }
      };
      r.start();
    } catch (e) {
      $('speechStatus').textContent = 'Could not start speech: ' + (e && e.message ? e.message : e);
    }
  }
  function stopSpeak() {
    try { if (state.recog) state.recog.stop(); } catch (e) {}
    $('btnSpeak').classList.remove('on');
  }

  // --- Spirit writing: only when rods settle on a glyph from real sensors ---
  var lastIdx = null;
  var holdStart = 0;
  var SETTLE_MS = 900;
  var COOLDOWN_MS = 700;
  var lastWriteAt = 0;

  function maybeSettleWrite() {
    if (!state.writing || !state.sensorsOn || state.pointing == null) return;
    var now = Date.now();
    if (state.pointing !== lastIdx) {
      lastIdx = state.pointing;
      holdStart = now;
      state.settledGlyph = null;
      $('writeStatus').textContent = 'Moving… pointing at ' + GLYPHS[state.pointing];
      return;
    }
    if (now - holdStart >= SETTLE_MS && now - lastWriteAt >= COOLDOWN_MS) {
      var g = GLYPHS[state.pointing];
      // Skip writing YES/NO words repeatedly as single tokens with spaces
      appendGlyph(g);
      lastWriteAt = now;
      holdStart = now; // require another settle
      var snap = sensorSnapshot();
      logSession('Spirit write: ' + g + ' | ' + snap);
      saveJournalEntry(
        'Spirit writing: ' + g,
        'Glyph from real rod position: ' + g + '\nSensors: ' + snap + '\nPage so far: ' + state.page.slice(-200),
        { readings: snap }
      );
      $('writeStatus').textContent = 'Wrote “' + g + '” from settled sensors (' + snap + ').';
    } else if (now - holdStart > 200) {
      $('writeStatus').textContent = 'Holding on ' + GLYPHS[state.pointing] + '… ' + Math.min(100, Math.round((now - holdStart) / SETTLE_MS * 100)) + '%';
    }
  }

  function appendGlyph(g) {
    if (g === 'YES' || g === 'NO') {
      if (state.page && !/\s$/.test(state.page)) state.page += ' ';
      state.page += g + ' ';
    } else {
      state.page += g;
    }
    paintPage();
  }
  function paintPage() {
    $('spiritPage').innerHTML = escapeHtml(state.page) + '<span class="cursor"></span>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // --- Ghost Journal ---
  function saveJournalEntry(readings, notes, extra) {
    extra = extra || {};
    try {
      if (!window.CBGhostJournal || !CBGhostJournal.saveFromApp) {
        $('saveStatus').textContent = 'Ghost Journal helper not loaded.';
        return false;
      }
      var loc = ($('loc').value || '').trim();
      CBGhostJournal.saveFromApp(
        'Coffeebreak Dowsing Rod Spirit Talker',
        readings,
        notes,
        loc,
        { date: new Date().toISOString() }
      );
      return true;
    } catch (e) {
      $('saveStatus').textContent = 'Could not save to Ghost Journal: ' + (e && e.message ? e.message : e);
      return false;
    }
  }

  function saveFullSession() {
    if (!state.session.length && !state.page) {
      $('saveStatus').textContent = 'Nothing to save yet — ask a question or write with the rods first.';
      return;
    }
    var notes = 'Session log:\n' + state.session.map(function (s) { return s.t + ' ' + s.line; }).join('\n');
    if (state.page) notes += '\n\nSpirit writing page:\n' + state.page;
    notes += '\n\nFinal sensors: ' + sensorSnapshot();
    var ok = saveJournalEntry(
      'Dowsing session · cross ' + state.cross.toFixed(2) + (state.page ? ' · page ' + state.page.length + ' chars' : ''),
      notes
    );
    $('saveStatus').textContent = ok
      ? 'Saved to Ghost Journal on this device. Open the journal to view, export or print.'
      : 'Save failed (storage full or helper missing).';
  }

  // --- Wire UI ---
  $('btnEnable').onclick = enableSensors;
  $('btnMag').onclick = startMag;
  $('btnCalYes').onclick = function () {
    if (!state.sensorsOn) { alert('Enable sensors and move the rods first.'); return; }
    state.calYes = state.cross;
    saveCal();
    logSession('Calibrated YES at cross ' + state.cross.toFixed(3) + ' | ' + sensorSnapshot());
  };
  $('btnCalNo').onclick = function () {
    if (!state.sensorsOn) { alert('Enable sensors and move the rods first.'); return; }
    state.calNo = state.cross;
    saveCal();
    logSession('Calibrated NO at cross ' + state.cross.toFixed(3) + ' | ' + sensorSnapshot());
  };
  $('btnClearCal').onclick = function () {
    state.calYes = state.calNo = null;
    try { localStorage.removeItem(CAL_KEY); } catch (e) {}
    paintCal();
  };
  $('btnAsk').onclick = readAnswer;
  $('btnSpeak').onclick = speakQuestion;
  $('btnStopSpeak').onclick = stopSpeak;
  $('btnWriteOn').onclick = function () {
    if (!state.sensorsOn) {
      $('writeStatus').textContent = 'Sensors are not on. Enable phone sensors first — writing only uses real rod positions.';
      return;
    }
    state.writing = true;
    holdStart = Date.now();
    lastIdx = state.pointing;
    $('btnWriteOn').classList.add('on');
    $('writeStatus').textContent = 'Spirit writing on. Hold still on a letter to write it.';
  };
  $('btnWriteOff').onclick = function () {
    state.writing = false;
    $('btnWriteOn').classList.remove('on');
    $('writeStatus').textContent = 'Writing paused.';
  };
  $('btnSpace').onclick = function () { state.page += ' '; paintPage(); };
  $('btnBack').onclick = function () {
    // remove last glyph carefully (YES/NO are 3/2 chars + space often)
    if (/\s?(YES|NO)\s?$/.test(state.page)) state.page = state.page.replace(/\s?(YES|NO)\s?$/, '');
    else state.page = state.page.slice(0, -1);
    paintPage();
  };
  $('btnClearWrite').onclick = function () {
    if (state.page && !confirm('Clear the spirit writing page?')) return;
    state.page = '';
    paintPage();
  };
  $('btnSave').onclick = saveFullSession;

  // Initial paint
  loadCal();
  paintPage();
  draw();
  setStatus(false, 'Sensors not started. Tap Enable phone sensors. On iPhone, allow Motion & Orientation access.');

  // Desktop fallback note — still no fake movement
  if (!('DeviceOrientationEvent' in window) && !('DeviceMotionEvent' in window) && !('Magnetometer' in window)) {
    setStatus(false, 'This browser exposes no orientation, motion or magnetometer APIs. Rods cannot move here. Try Chrome or Safari on a phone.');
  }

  function isAngelEntry(e) {
    var a = String((e && e.app) || '').toLowerCase();
    return a.indexOf('angel') >= 0;
  }
  function escapeAngel(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function renderAngelsTab() {
    var box = $('angelList');
    if (!box) return;
    var items = [];
    try {
      if (window.CBGhostJournal) items = CBGhostJournal.load().filter(isAngelEntry)
        .sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    } catch (e) {}
    if (!items.length) {
      box.textContent = 'No angel readings in Ghost Journal yet.';
      return;
    }
    box.innerHTML = items.map(function (e) {
      var when = '';
      try { when = new Date(e.ts || e.date).toLocaleString(); } catch (err) { when = e.date || ''; }
      return '<div style="margin:0 0 10px;padding-bottom:8px;border-bottom:1px solid #1c7a3533">' +
        '<b style="color:var(--g)">' + escapeAngel(e.app) + '</b><br>' +
        '<span class="muted">' + escapeAngel(when) + '</span><br>' +
        escapeAngel(e.readings || '') +
        (e.notes ? '<br><span class="muted">' + escapeAngel(String(e.notes).slice(0, 400)) + '</span>' : '') +
        '</div>';
    }).join('');
  }
  function setDowsingTab(name) {
    document.querySelectorAll('.tabs button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === name);
    });
    var rods = $('panel-rods');
    var ang = $('panel-angels');
    if (rods) rods.classList.toggle('on', name === 'rods');
    if (ang) ang.classList.toggle('on', name === 'angels');
    if (name === 'angels') renderAngelsTab();
  }
  if ($('tabRods')) $('tabRods').onclick = function () { setDowsingTab('rods'); };
  if ($('tabAngels')) $('tabAngels').onclick = function () { setDowsingTab('angels'); };
  if ($('btnRefreshAngels')) $('btnRefreshAngels').onclick = renderAngelsTab;
  try {
    var params = new URLSearchParams(location.search);
    if (params.get('tab') === 'angels') setDowsingTab('angels');
  } catch (e) {}

})();
