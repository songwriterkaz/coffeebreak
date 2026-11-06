(function () {
  'use strict';
  var FULL = !!window.CB_FULL;
  var BUY = window.CB_BUY || '../cb-responder-toolkit-buy/';
  var R = window.CBResponder;
  var tools = R.buildCatalogue(FULL);
  var filtered = tools.slice();
  var active = null;
  var catFilter = 'All';
  var cprTimer = null;
  var cprBpm = 110;
  var countdownTimer = null;

  var listEl = document.getElementById('toolList');
  var searchEl = document.getElementById('search');
  var countEl = document.getElementById('count');
  var panelTitle = document.getElementById('panelTitle');
  var panelBody = document.getElementById('panelBody');
  var chips = document.getElementById('chips');
  var lockNote = document.getElementById('lockNote');

  function unlocked(tool) {
    if (FULL) return true;
    var idx = tools.indexOf(tool);
    return idx >= 0 && idx < R.DEMO_UNLOCK;
  }

  function cats() {
    var set = {};
    tools.forEach(function (t) { set[t.cat] = 1; });
    return ['All'].concat(Object.keys(set).sort());
  }

  function renderChips() {
    chips.innerHTML = '';
    cats().forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (c === catFilter ? ' on' : '');
      b.textContent = c;
      b.onclick = function () { catFilter = c; applyFilter(); renderChips(); };
      chips.appendChild(b);
    });
  }

  function applyFilter() {
    var q = (searchEl.value || '').trim().toLowerCase();
    filtered = tools.filter(function (t) {
      if (catFilter !== 'All' && t.cat !== catFilter) return false;
      if (!q) return true;
      return (t.name + ' ' + t.cat + ' ' + (t.tags || []).join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    countEl.textContent = filtered.length.toLocaleString() + ' of ' + tools.length.toLocaleString() + ' tools';
    renderList();
  }

  function renderList() {
    listEl.innerHTML = '';
    var max = Math.min(filtered.length, 200);
    for (var i = 0; i < max; i++) {
      (function (t) {
        var d = document.createElement('div');
        d.className = 'tool' + (active && active.id === t.id ? ' on' : '');
        var lock = unlocked(t) ? '' : '<span class="lock">demo lock</span>';
        d.innerHTML = lock + '<b></b><span></span>';
        d.querySelector('b').textContent = t.name;
        d.querySelector('span').textContent = t.cat + ' · ' + t.kind;
        d.onclick = function () { openTool(t); };
        listEl.appendChild(d);
      })(filtered[i]);
    }
    if (filtered.length > max) {
      var more = document.createElement('div');
      more.className = 'notice';
      more.textContent = 'Showing first ' + max + ' matches. Refine search to narrow the list.';
      listEl.appendChild(more);
    }
  }

  function openTool(t) {
    active = t;
    renderList();
    panelTitle.textContent = t.name;
    if (!unlocked(t)) {
      lockNote.classList.remove('hidden');
      panelBody.innerHTML = '<div class="notice bad">This tool is locked in the free demo. The demo unlocks the first ' +
        R.DEMO_UNLOCK + ' core tools. <a class="btn" href="' + BUY + '">Get the full version $10 USD</a></div>';
      return;
    }
    lockNote.classList.add('hidden');
    stopCpr();
    stopCountdown();
    panelBody.innerHTML = '';
    var fn = panels[t.kind] || panels.checklist;
    fn(t);
  }

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d;
  }

  function medNotice() {
    return '<div class="notice bad"><b>Reference only.</b> Follow your local protocols, drug formularies and medical direction. ' +
      'This app is not a substitute for training or official clinical guidance. Confirm every dose and rate before use.</div>';
  }

  function numField(id, label, val, step) {
    return '<label for="' + id + '">' + label + '</label><input type="number" id="' + id + '" value="' + val + '"' +
      (step ? ' step="' + step + '"' : '') + '>';
  }

  var panels = {};

  panels.gcs = function (t) {
    var e0 = (t.meta && t.meta.e) || 4, v0 = (t.meta && t.meta.v) || 5, m0 = (t.meta && t.meta.m) || 6;
    panelBody.appendChild(el(medNotice() +
      '<div class="grid2">' +
      numField('gE', 'Eye (1-4)', e0) + numField('gV', 'Verbal (1-5)', v0) +
      numField('gM', 'Motor (1-6)', m0) + '</div>' +
      '<p class="small">E: 4 spontaneous, 3 to speech, 2 to pressure, 1 none. V: 5 orientated, 4 confused, 3 words, 2 sounds, 1 none. M: 6 obeys, 5 localises, 4 withdraws, 3 flexion, 2 extension, 1 none.</p>' +
      '<button id="gGo">Calculate GCS</button><div class="out" id="gOut"></div>'));
    document.getElementById('gGo').onclick = function () {
      try {
        var r = R.gcs(document.getElementById('gE').value, document.getElementById('gV').value, document.getElementById('gM').value);
        document.getElementById('gOut').innerHTML = 'GCS ' + r.total + ' <small>' + r.band + ' · E' + r.e + 'V' + r.v + 'M' + r.m + '</small>';
      } catch (err) { document.getElementById('gOut').textContent = String(err.message || err); }
    };
  };

  panels.apgar = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(medNotice() +
      '<div class="grid2">' +
      numField('aA', 'Appearance 0-2', m.a != null ? m.a : 2) +
      numField('aP', 'Pulse 0-2', m.p != null ? m.p : 2) +
      numField('aG', 'Grimace 0-2', m.g != null ? m.g : 2) +
      numField('aAc', 'Activity 0-2', m.ac != null ? m.ac : 2) +
      numField('aR', 'Respiration 0-2', m.r != null ? m.r : 2) +
      '</div><button id="aGo">Calculate APGAR</button><div class="out" id="aOut"></div>'));
    document.getElementById('aGo').onclick = function () {
      try {
        var r = R.apgar(
          document.getElementById('aA').value, document.getElementById('aP').value,
          document.getElementById('aG').value, document.getElementById('aAc').value,
          document.getElementById('aR').value);
        document.getElementById('aOut').innerHTML = 'APGAR ' + r.total + ' <small>' + r.band + '</small>';
      } catch (err) { document.getElementById('aOut').textContent = String(err.message || err); }
    };
  };

  panels.burns = function (t) {
    var parts = (t.meta && t.meta.parts) || {};
    var keys = Object.keys(R.NINES);
    var html = medNotice() + '<p class="small">Adult rule of nines. Tick regions involved (half = 0.5).</p><div class="grid2">';
    keys.forEach(function (k) {
      html += '<label><input type="checkbox" data-burn="' + k + '"' + (parts[k] ? ' checked' : '') + '> ' +
        k + ' (' + R.NINES[k] + '%)</label>';
    });
    html += '</div>' + numField('burnCustom', 'Extra % (optional)', 0, 0.5) +
      '<button id="bGo">Calculate TBSA</button><div class="out" id="bOut"></div>';
    panelBody.appendChild(el(html));
    document.getElementById('bGo').onclick = function () {
      var p = { custom: document.getElementById('burnCustom').value };
      panelBody.querySelectorAll('[data-burn]').forEach(function (c) { if (c.checked) p[c.getAttribute('data-burn')] = 1; });
      var tbsa = R.burnsTBSA(p);
      document.getElementById('bOut').innerHTML = tbsa + '% TBSA <small>Adult rule of nines estimate</small>';
    };
  };

  panels.parkland = function () {
    panelBody.appendChild(el(medNotice() +
      '<div class="grid2">' + numField('pKg', 'Patient weight (kg)', 70) + numField('pTBSA', 'TBSA %', 20) + '</div>' +
      '<p class="small">Parkland: 4 mL × kg × %TBSA crystalloid over 24 h from time of burn; half in first 8 h.</p>' +
      '<button id="pGo">Calculate</button><div class="out" id="pOut"></div>'));
    document.getElementById('pGo').onclick = function () {
      var r = R.parkland(+document.getElementById('pKg').value, +document.getElementById('pTBSA').value);
      document.getElementById('pOut').innerHTML = Math.round(r.totalMl) + ' mL / 24 h' +
        '<small>First 8 h: ' + Math.round(r.first8hMl) + ' mL · Next 16 h: ' + Math.round(r.next16hMl) + ' mL</small>';
    };
  };

  panels.drug = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(medNotice() +
      '<div class="grid2">' +
      numField('dMgkg', 'Protocol dose (mg/kg) — enter from YOUR protocol', m.mgkg != null ? m.mgkg : 1, 0.01) +
      numField('dKg', 'Weight (kg)', m.kg != null ? m.kg : 70) +
      numField('dConc', 'Concentration (mg/mL)', m.conc != null ? m.conc : 10, 0.1) +
      '</div><button id="dGo">Calculate dose</button><div class="out" id="dOut"></div>'));
    document.getElementById('dGo').onclick = function () {
      var r = R.drugDose(+document.getElementById('dMgkg').value, +document.getElementById('dKg').value, +document.getElementById('dConc').value);
      document.getElementById('dOut').innerHTML = r.doseMg.toFixed(3) + ' mg total' +
        '<small>Volume at stated concentration: ' + (r.volumeMl != null ? r.volumeMl.toFixed(3) + ' mL' : 'n/a') + '</small>';
    };
  };

  panels.drip = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(medNotice() +
      '<div class="grid2">' +
      numField('drVol', 'Volume (mL)', m.vol != null ? m.vol : 1000) +
      numField('drMin', 'Time (minutes)', m.min != null ? m.min : 60) +
      numField('drDf', 'Drop factor (gtt/mL)', m.df != null ? m.df : 20) +
      '</div><p class="small">Drops/min = (volume × drop factor) ÷ time in minutes.</p>' +
      '<button id="drGo">Calculate drip rate</button><div class="out" id="drOut"></div>'));
    document.getElementById('drGo').onclick = function () {
      try {
        var r = R.dripRate(+document.getElementById('drVol').value, +document.getElementById('drMin').value, +document.getElementById('drDf').value);
        document.getElementById('drOut').innerHTML = r.toFixed(1) + ' drops/min' +
          '<small>' + (r / 60).toFixed(2) + ' mL/min approximate</small>';
      } catch (err) { document.getElementById('drOut').textContent = String(err.message || err); }
    };
  };

  function stopCpr() { if (cprTimer) { clearInterval(cprTimer); cprTimer = null; } }
  panels.cpr = function (t) {
    cprBpm = (t.meta && t.meta.bpm) || 110;
    panelBody.appendChild(el(
      '<div class="notice">Adult CPR compression rate guidance commonly targets 100-120 / min. Follow your protocol.</div>' +
      '<div class="metronome" id="metro">--</div>' +
      '<div class="grid2">' + numField('cprBpm', 'Beats per minute', cprBpm) + '</div>' +
      '<div class="row"><button id="cprStart">Start</button><button class="ghost" id="cprStop">Stop</button></div>'));
    var metro = document.getElementById('metro');
    document.getElementById('cprStart').onclick = function () {
      stopCpr();
      cprBpm = +document.getElementById('cprBpm').value || 110;
      var ms = 60000 / cprBpm;
      var on = false;
      metro.textContent = cprBpm;
      cprTimer = setInterval(function () {
        on = !on;
        metro.classList.toggle('beat', on);
        if (on) metro.textContent = cprBpm;
      }, ms / 2);
    };
    document.getElementById('cprStop').onclick = stopCpr;
  };

  function stopCountdown() { if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; } }
  panels.timer = function (t) {
    var sec = (t.meta && t.meta.seconds) || 120;
    panelBody.appendChild(el(
      numField('tmSec', 'Seconds', sec) +
      '<div class="out" id="tmOut">' + sec + 's</div>' +
      '<div class="row"><button id="tmStart">Start</button><button class="ghost" id="tmStop">Stop</button><button class="ghost" id="tmReset">Reset</button></div>'));
    var left = sec;
    function show() { document.getElementById('tmOut').textContent = left + 's'; }
    document.getElementById('tmStart').onclick = function () {
      stopCountdown();
      left = +document.getElementById('tmSec').value || 0;
      show();
      countdownTimer = setInterval(function () {
        left -= 1;
        if (left <= 0) { left = 0; stopCountdown(); }
        show();
      }, 1000);
    };
    document.getElementById('tmStop').onclick = stopCountdown;
    document.getElementById('tmReset').onclick = function () {
      stopCountdown();
      left = +document.getElementById('tmSec').value || 0;
      show();
    };
  };

  panels.start = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(
      '<div class="notice">START (Simple Triage and Rapid Treatment) decision helper for mass casualty drill / reference.</div>' +
      '<label><input type="checkbox" id="sWalk"' + (m.walking ? ' checked' : '') + '> Able to walk</label>' +
      '<label><input type="checkbox" id="sBreath"' + (m.breathing !== false ? ' checked' : '') + '> Breathing</label>' +
      '<label><input type="checkbox" id="sAir"' + (m.airwayOpened ? ' checked' : '') + '> Airway opened</label>' +
      '<label><input type="checkbox" id="sBreath2"' + (m.breathingAfterAirway ? ' checked' : '') + '> Breathing after airway</label>' +
      numField('sRR', 'Respiratory rate / min', m.rr != null ? m.rr : 18) +
      '<label><input type="checkbox" id="sPerf"' + (m.perfusionBad ? ' checked' : '') + '> Poor perfusion (CRT &gt; 2 s or no radial)</label>' +
      '<label><input type="checkbox" id="sCmd"' + (m.followsCommands !== false ? ' checked' : '') + '> Follows simple commands</label>' +
      '<button id="sGo">Triage</button><div class="out" id="sOut"></div>'));
    document.getElementById('sGo').onclick = function () {
      var r = R.startTriage({
        walking: document.getElementById('sWalk').checked,
        breathing: document.getElementById('sBreath').checked,
        airwayOpened: document.getElementById('sAir').checked,
        breathingAfterAirway: document.getElementById('sBreath2').checked,
        rr: +document.getElementById('sRR').value,
        perfusionBad: document.getElementById('sPerf').checked,
        followsCommands: document.getElementById('sCmd').checked
      });
      document.getElementById('sOut').innerHTML = r.tag + ' <small>' + r.reason + ' · ' + r.color + '</small>';
    };
  };

  panels.friction = function (t) {
    var m = t.meta || {};
    var opts = R.HOSE_C.map(function (h) {
      return '<option value="' + h.c + '"' + (m.c === h.c ? ' selected' : '') + '>' + h.label + ' (C=' + h.c + ')</option>';
    }).join('');
    panelBody.appendChild(el(
      '<div class="notice">Friction loss ≈ C × (Q/100)² × (L/100) psi. Coefficients are common training values; confirm with your department tables.</div>' +
      '<label>Hose / C</label><select id="fC">' + opts + '</select>' +
      '<div class="grid2">' + numField('fQ', 'Flow (gpm)', m.q != null ? m.q : 150) + numField('fL', 'Length (ft)', m.L != null ? m.L : 200) + '</div>' +
      '<button id="fGo">Calculate FL</button><div class="out" id="fOut"></div>'));
    document.getElementById('fGo').onclick = function () {
      var fl = R.frictionLossPsi(+document.getElementById('fC').value, +document.getElementById('fQ').value, +document.getElementById('fL').value);
      document.getElementById('fOut').innerHTML = fl.toFixed(1) + ' psi FL' +
        '<small>' + (fl * 6.894757293).toFixed(1) + ' kPa</small>';
    };
  };

  panels.nozzle = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(
      '<div class="notice">Smooth-bore approximate flow: Q = 29.7 × d² × √NP (d inches, NP psi, Q gpm).</div>' +
      '<div class="grid2">' + numField('nD', 'Tip diameter (in)', m.d != null ? m.d : 1.125, 0.001) +
      numField('nNP', 'Nozzle pressure (psi)', m.np != null ? m.np : 50) + '</div>' +
      '<button id="nGo">Calculate flow</button><div class="out" id="nOut"></div>'));
    document.getElementById('nGo').onclick = function () {
      var q = R.nozzleFlowGpm(+document.getElementById('nD').value, +document.getElementById('nNP').value);
      document.getElementById('nOut').innerHTML = q.toFixed(1) + ' gpm' +
        '<small>' + (q * 3.785411784).toFixed(1) + ' L/min</small>';
    };
  };

  panels.pdp = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(
      '<div class="notice">PDP ≈ NP + FL + appliance ± elevation. Elevation rule of thumb: about 0.5 psi per foot of elevation gain.</div>' +
      '<div class="grid2">' +
      numField('pNP', 'Nozzle pressure (psi)', m.np != null ? m.np : 50) +
      numField('pFL', 'Friction loss (psi)', m.fl != null ? m.fl : 20) +
      numField('pApp', 'Appliance / other (psi)', 0) +
      numField('pEl', 'Elevation gain (ft)', m.elev != null ? m.elev : 0) +
      '</div><button id="pdGo">Calculate PDP</button><div class="out" id="pdOut"></div>'));
    document.getElementById('pdGo').onclick = function () {
      var p = R.pumpDischargePressure(
        +document.getElementById('pNP').value, +document.getElementById('pFL').value,
        +document.getElementById('pApp').value, +document.getElementById('pEl').value);
      document.getElementById('pdOut').innerHTML = p.toFixed(1) + ' psi PDP';
    };
  };

  panels.ladder = function (t) {
    var m = t.meta || {};
    panelBody.appendChild(el(
      '<div class="notice">Tip height = length × sin(angle). Common working angle for extension ladders is around 75°.</div>' +
      '<div class="grid2">' +
      numField('lLen', 'Ladder length (ft)', m.length != null ? m.length : 24) +
      numField('lAng', 'Angle (degrees)', m.angle != null ? m.angle : 75) +
      numField('lHt', 'Or desired tip height (ft)', 0) +
      '</div><div class="row"><button id="lGo">From angle</button><button class="ghost" id="lGo2">From height</button></div>' +
      '<div class="out" id="lOut"></div>'));
    document.getElementById('lGo').onclick = function () {
      var r = R.ladderTipHeight(+document.getElementById('lLen').value, +document.getElementById('lAng').value);
      document.getElementById('lOut').innerHTML = r.height.toFixed(1) + ' ft tip height' +
        '<small>Setback ≈ ' + r.setback.toFixed(1) + ' ft</small>';
    };
    document.getElementById('lGo2').onclick = function () {
      try {
        var r = R.ladderAngleFromHeight(+document.getElementById('lLen').value, +document.getElementById('lHt').value);
        document.getElementById('lOut').innerHTML = r.angleDeg.toFixed(1) + '°' +
          '<small>Setback ≈ ' + r.setback.toFixed(1) + ' ft</small>';
      } catch (err) { document.getElementById('lOut').textContent = String(err.message || err); }
    };
  };

  panels.un = function (t) {
    var un = t.meta && t.meta.un;
    var known = R.UN_NOTES.filter(function (u) { return !un || u[0] === un; });
    var html = '<div class="notice">Public identification notes only. Always use your current ERG / local hazmat guidance on scene.</div>';
    html += '<label>Find UN</label><input type="number" id="unQ" value="' + (un || '') + '" placeholder="e.g. 1203">';
    html += '<button id="unGo">Lookup</button><div id="unOut"></div>';
    panelBody.appendChild(el(html));
    function show(list) {
      if (!list.length) {
        document.getElementById('unOut').innerHTML = '<div class="notice">No built-in note for that number. Treat as unknown until you consult official references.</div>';
        return;
      }
      document.getElementById('unOut').innerHTML = '<table class="simple"><tr><th>UN</th><th>Name</th><th>Class</th></tr>' +
        list.map(function (u) { return '<tr><td>' + u[0] + '</td><td>' + u[1] + '</td><td>' + u[2] + '</td></tr>'; }).join('') +
        '</table>';
    }
    show(known.length ? known : R.UN_NOTES.slice(0, 12));
    document.getElementById('unGo').onclick = function () {
      var q = +document.getElementById('unQ').value;
      show(R.UN_NOTES.filter(function (u) { return u[0] === q; }));
    };
  };

  panels.phonetic = function () {
    panelBody.appendChild(el(
      '<label>Spell a word or callsign</label><input type="text" id="phIn" placeholder="Type text">' +
      '<button id="phGo">Spell</button><div class="out" id="phOut" style="font-size:1rem"></div>' +
      '<table class="simple"><tr><th>Letter</th><th>Word</th></tr>' +
      R.NATO.map(function (p) { return '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>'; }).join('') +
      '</table>'));
    document.getElementById('phGo').onclick = function () {
      var map = {};
      R.NATO.forEach(function (p) { map[p[0]] = p[1]; });
      var s = (document.getElementById('phIn').value || '').toUpperCase();
      var out = s.split('').map(function (ch) {
        if (map[ch]) return map[ch];
        if (ch === ' ') return '/';
        return ch;
      }).join(' · ');
      document.getElementById('phOut').textContent = out || '—';
    };
  };

  panels.units = function (t) {
    var m = t.meta || {};
    var dimOpts = R.UNIT_DIMS.map(function (d) {
      return '<option value="' + d.id + '"' + (m.dim === d.id ? ' selected' : '') + '>' + d.name + '</option>';
    }).join('');
    panelBody.appendChild(el(
      '<label>Dimension</label><select id="uDim">' + dimOpts + '</select>' +
      '<div class="grid2"><div><label>From</label><select id="uFrom"></select></div>' +
      '<div><label>To</label><select id="uTo"></select></div></div>' +
      numField('uVal', 'Value', 1, 'any') +
      '<button id="uGo">Convert</button><div class="out" id="uOut"></div>'));
    function fillUnits() {
      var dim = R.UNIT_DIMS.find(function (d) { return d.id === document.getElementById('uDim').value; });
      var f = document.getElementById('uFrom'), to = document.getElementById('uTo');
      f.innerHTML = to.innerHTML = dim.units.map(function (u) {
        return '<option value="' + u.id + '">' + u.n + '</option>';
      }).join('');
      if (m.from) f.value = m.from;
      if (m.to) to.value = m.to;
    }
    fillUnits();
    document.getElementById('uDim').onchange = fillUnits;
    document.getElementById('uGo').onclick = function () {
      try {
        var r = R.convertUnit(document.getElementById('uDim').value, +document.getElementById('uVal').value,
          document.getElementById('uFrom').value, document.getElementById('uTo').value);
        document.getElementById('uOut').textContent = (Math.round(r * 1e8) / 1e8) + '';
      } catch (err) { document.getElementById('uOut').textContent = String(err.message || err); }
    };
  };

  panels.checklist = function (t) {
    var title = (t.meta && t.meta.title) || t.name;
    var items = [
      'Confirm scene safety and PPE', 'State objectives aloud', 'Assign roles',
      'Check critical equipment', 'Confirm radio channel', 'Note time on',
      'Reassess after first actions', 'Document and hand over'
    ];
    var key = 'cb-rt-check-' + t.id;
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
    var html = '<p class="small">' + title + ' — ticks save on this device only.</p><div id="ckList">';
    items.forEach(function (it, i) {
      html += '<label><input type="checkbox" data-i="' + i + '"' + (saved[i] ? ' checked' : '') + '> ' + it + '</label>';
    });
    html += '</div><button class="ghost" id="ckClear">Clear ticks</button>';
    panelBody.appendChild(el(html));
    panelBody.querySelectorAll('#ckList input').forEach(function (c) {
      c.onchange = function () {
        var s = {};
        panelBody.querySelectorAll('#ckList input').forEach(function (x) { if (x.checked) s[x.getAttribute('data-i')] = 1; });
        localStorage.setItem(key, JSON.stringify(s));
      };
    });
    document.getElementById('ckClear').onclick = function () {
      localStorage.removeItem(key);
      openTool(t);
    };
  };

  function notesPanel(kind, t) {
    var key = 'cb-rt-' + kind + '-' + ((t.meta && t.meta.n) || t.id);
    var cur = '';
    try { cur = localStorage.getItem(key) || ''; } catch (e) {}
    panelBody.appendChild(el(
      '<p class="small">Saved only in this browser (offline capable). Not uploaded anywhere.</p>' +
      '<textarea id="noteArea">' + cur.replace(/</g, '&lt;') + '</textarea>' +
      '<div class="row"><button id="noteSave">Save</button><button class="ghost" id="noteClear">Clear</button></div>' +
      '<div class="notice ok hidden" id="noteOk">Saved on this device.</div>'));
    document.getElementById('noteSave').onclick = function () {
      localStorage.setItem(key, document.getElementById('noteArea').value);
      document.getElementById('noteOk').classList.remove('hidden');
    };
    document.getElementById('noteClear').onclick = function () {
      localStorage.removeItem(key);
      document.getElementById('noteArea').value = '';
    };
  }
  panels.log = function (t) { notesPanel('log', t); };
  panels.handover = function (t) { notesPanel('handover', t); };

  searchEl.addEventListener('input', applyFilter);
  renderChips();
  applyFilter();
  openTool(tools[0]);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
})();
