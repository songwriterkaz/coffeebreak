/* Searchable tool browser for Coffeebreak Sung Song. Each open tool runs a real result. */
(function () {
  var T = window.CBSungTools;
  if (!T) return;

  function css() {
    if (document.getElementById('cb-tools-css')) return;
    var style = document.createElement('style');
    style.id = 'cb-tools-css';
    style.textContent = '#cb-tools{font:16px/1.45 Georgia,serif;color:#3a1028;background:#fff;border:1px solid #f3c1da;border-radius:16px;padding:16px;margin:16px 0}' +
      '#cb-tools h2{margin:0 0 8px;font-size:1.25rem}#cb-tools input,#cb-tools button{font:inherit}' +
      '#cb-tools input{width:100%;box-sizing:border-box;padding:8px;border-radius:10px;border:1px solid #e48ab3}' +
      '#cb-tools button{background:#c2185b;color:#fff;border:0;border-radius:999px;padding:8px 14px;cursor:pointer;margin:6px 6px 0 0}' +
      '#cb-tools .chip{background:#fff;color:#a01455;border:1px solid #e48ab3}#cb-tools .chip.on{background:#c2185b;color:#fff}' +
      '#cb-tools .row{padding:8px;margin:6px 0;background:#fff7fb;border-radius:10px;cursor:pointer}' +
      '#cb-tools .out{margin-top:10px;padding:10px;background:#fff7fb;border-radius:10px}' +
      '#cb-tools .fine{font-size:13px;color:#6d3554}';
    document.head.appendChild(style);
  }

  function audioCtx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!window.__cbSungAC) window.__cbSungAC = new AC();
    return window.__cbSungAC;
  }

  function ensureGraph(audio) {
    var ctx = audioCtx();
    if (!ctx || !audio) return null;
    if (!audio._cbGraph) {
      var src = ctx.createMediaElementSource(audio);
      var filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = 1000;
      filter.gain.value = 0;
      filter.Q.value = 1;
      src.connect(filter);
      filter.connect(ctx.destination);
      audio._cbGraph = { src: src, filter: filter };
    }
    return audio._cbGraph;
  }

  function playTone(hz, filter) {
    var ctx = audioCtx();
    if (!ctx) return 'Web Audio is not available in this browser.';
    ctx.resume();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.frequency.value = hz;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain);
    if (filter) {
      var bq = ctx.createBiquadFilter();
      bq.type = filter.filter || 'peaking';
      bq.frequency.value = filter.frequency;
      bq.gain.value = filter.gain;
      bq.Q.value = filter.q || 1;
      gain.connect(bq);
      bq.connect(ctx.destination);
    } else gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
    return 'Played ' + Math.round(hz) + ' Hz.';
  }

  var metroTimer = null;
  function stopMetro() {
    if (metroTimer) { clearInterval(metroTimer); metroTimer = null; }
  }
  function startMetro(bpm, beats) {
    stopMetro();
    var ctx = audioCtx();
    if (!ctx) return 'Web Audio is not available in this browser.';
    ctx.resume();
    var step = 0;
    function click() {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.frequency.value = step % beats === 0 ? 1400 : 900;
      gain.gain.value = 0.2;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      step++;
    }
    click();
    metroTimer = setInterval(click, 60000 / bpm);
    return 'Metronome running at ' + bpm + ' BPM.';
  }

  function apply(out, status) {
    var action = out.action || {};
    if (action.type === 'style' || action.type === 'style-add') {
      var box = document.getElementById('cb-sung-style');
      if (!box) { status.textContent = 'The style box is not on this page.'; return; }
      box.value = action.type === 'style-add' && box.value ? (box.value + ', ' + action.style) : action.style;
      status.textContent = 'Style box updated.';
      return;
    }
    if (action.type === 'seconds') {
      var sec = document.getElementById('cb-sung-seconds');
      if (!sec) { status.textContent = 'The length box is not on this page.'; return; }
      sec.value = String(action.seconds);
      status.textContent = 'Length set to ' + action.seconds + ' seconds.';
      return;
    }
    if (action.type === 'tempo') {
      status.textContent = 'Delay is ' + out.proof.ms + ' ms at ' + action.bpm + ' BPM.';
      return;
    }
    if (action.type === 'eq') {
      var audio = document.getElementById('cb-sung-audio');
      if (audio && audio.src) {
        var graph = ensureGraph(audio);
        if (graph) {
          audioCtx().resume();
          graph.filter.type = action.filter;
          graph.filter.frequency.value = action.frequency;
          graph.filter.gain.value = action.gain;
          graph.filter.Q.value = action.q;
          status.textContent = 'Filter applied to the current song: ' + action.frequency + ' Hz, ' + action.gain + ' dB.';
          return;
        }
      }
      status.textContent = playTone(440, action);
      return;
    }
    if (action.type === 'metronome') {
      if (metroTimer) { stopMetro(); status.textContent = 'Metronome stopped.'; return; }
      status.textContent = startMetro(action.bpm, action.beats);
      return;
    }
    if (action.type === 'tone') {
      status.textContent = playTone(action.hz);
      return;
    }
    status.textContent = out.text;
  }

  function mount() {
    css();
    var host = document.getElementById('cb-tools');
    if (!host) {
      host = document.createElement('section');
      host.id = 'cb-tools';
      var main = document.querySelector('main') || document.body;
      main.appendChild(host);
    }
    if (host.dataset.ready) return;
    host.dataset.ready = '1';
    host.innerHTML = '<h2>Tools</h2>' +
      '<p class="fine" id="cb-tool-count"></p>' +
      '<label for="cb-tool-search">Search tools</label>' +
      '<input id="cb-tool-search" type="search" aria-label="Search tools" placeholder="Try transpose, rhyme, delay, pop">' +
      '<div id="cb-tool-cats"></div>' +
      '<div id="cb-tool-list"></div>' +
      '<div class="out" id="cb-tool-out"><p class="fine">Open a tool to see its result. The count is the real number of tools.</p></div>';
    var cat = 'all';
    var countEl = host.querySelector('#cb-tool-count');
    var listEl = host.querySelector('#cb-tool-list');
    var outEl = host.querySelector('#cb-tool-out');
    var searchEl = host.querySelector('#cb-tool-search');

    function commas(n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function drawCats() {
      var bar = host.querySelector('#cb-tool-cats');
      bar.innerHTML = '';
      [{ id: 'all', name: 'All' }].concat(T.CATS).forEach(function (item) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (cat === item.id ? ' on' : '');
        b.textContent = item.name;
        b.onclick = function () { cat = item.id; draw(); };
        bar.appendChild(b);
      });
    }

    function draw() {
      var found = T.search(searchEl.value, cat, 40);
      countEl.textContent = commas(found.matched) + ' of ' + commas(found.total) + ' tools';
      listEl.innerHTML = '';
      if (!found.items.length) {
        var empty = document.createElement('p');
        empty.className = 'fine';
        empty.textContent = 'No tools match that search.';
        listEl.appendChild(empty);
        return;
      }
      found.items.forEach(function (tool) {
        var row = document.createElement('div');
        row.className = 'row';
        row.tabIndex = 0;
        var title = document.createElement('b');
        title.textContent = tool.name;
        var meta = document.createElement('div');
        meta.className = 'fine';
        meta.textContent = tool.catName + ' · ' + tool.id;
        row.append(title, meta);
        row.onclick = function () { open(tool); };
        row.onkeydown = function (ev) { if (ev.key === 'Enter') open(tool); };
        listEl.appendChild(row);
      });
      if (found.matched > found.items.length) {
        var more = document.createElement('p');
        more.className = 'fine';
        more.textContent = 'Showing the first ' + found.items.length + ' matches. Refine the search to see others.';
        listEl.appendChild(more);
      }
      drawCats();
    }

    function open(tool) {
      var result = T.run(tool);
      outEl.innerHTML = '';
      var h = document.createElement('h3');
      h.textContent = result.name;
      var p = document.createElement('p');
      p.id = 'cb-tool-result';
      p.textContent = result.text;
      outEl.append(h, p);
      if (result.action) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'cb-tool-apply';
        var labels = { style: 'Use this style', 'style-add': 'Add chords to the style box', seconds: 'Use this length', tempo: 'Show the delay', eq: 'Apply or preview this filter', metronome: 'Start or stop metronome', tone: 'Play the target pitch' };
        btn.textContent = labels[result.action.type] || 'Use this result';
        var status = document.createElement('p');
        status.className = 'fine';
        status.id = 'cb-tool-status';
        btn.onclick = function () { apply(result, status); if (result.action.type === 'metronome') btn.textContent = metroTimer ? 'Stop metronome' : 'Start metronome'; };
        outEl.append(btn, status);
      }
    }

    searchEl.oninput = draw;
    draw();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
