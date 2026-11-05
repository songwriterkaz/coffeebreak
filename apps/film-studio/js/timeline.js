'use strict';
(function(CB){
  const S = CB.S, RULER = 28;
  let TH = 52;
  const cv = () => CB.$('#tl'), sc = () => CB.$('#tlScroll');
  let dirty = true, drag = null, hoverCur = '', snapLine = null, dpr = 1;
  const COL = { video: ['#e0457f', '#a3265a'], image: ['#ff8fb8', '#c4527f'], audio: ['#8b5cf6', '#5b3aa8'], text: ['#f2b94a', '#a87a1f'], color: ['#7a6a8a', '#4c3f59'] };
  CB.tlDirty = () => { dirty = true; };
  const X = (t) => t * S.pps - sc().scrollLeft;
  const T = (x) => (x + sc().scrollLeft) / S.pps;
  const rowY = (i) => RULER + i * TH;

  CB.tlLayout = function () {
    const box = sc(), c = cv();
    dpr = window.devicePixelRatio || 1;
    TH = S.p.tracks.length > 5 ? 44 : 52;
    const w = Math.max(100, box.clientWidth), h = RULER + S.p.tracks.length * TH;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = w + 'px'; c.style.height = h + 'px'; }
    const total = Math.max(CB.total() + 12, w / S.pps);
    CB.$('#tlSpacer').style.width = Math.round(total * S.pps) + 'px';
    box.style.height = (h + 18) + 'px';
    buildHeads(); dirty = true;
  };
  function buildHeads() {
    const hd = CB.$('#tlHeads'); hd.style.paddingTop = RULER + 'px';
    hd.innerHTML = '';
    S.p.tracks.forEach(t => {
      const d = document.createElement('div'); d.className = 'th ' + t.type; d.style.height = TH + 'px';
      const tg = t.type === 'v' ? (t.hide ? 'Show this track' : 'Hide this track') : (t.mute ? 'Unmute this track' : 'Mute this track');
      const on = t.type === 'v' ? t.hide : t.mute;
      d.innerHTML = '<span class="tn">' + CB.esc(t.name) + '</span><button class="tm' + (on ? ' on' : '') + '" data-tip="' + tg + '" data-id="' + t.id + '" data-tip-pos="right">' + (t.type === 'v' ? (t.hide ? '&#9711;' : '&#128065;') : (t.mute ? 'M' : '&#9835;')) + '</button>';
      hd.appendChild(d);
    });
    CB.$$('.tm', hd).forEach(b => b.onclick = () => {
      const t = CB.trackById(b.dataset.id);
      CB.mutate(() => { if (t.type === 'v') t.hide = !t.hide; else t.mute = !t.mute; });
    });
  }
  function niceStep(pps) { const target = 90 / pps; for (const s of [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600]) if (s >= target) return s; return 600; }

  function drawWave(g, peaks, x, y, w, h, i0s, i1s, col) {
    // peaks at 50/s; i0s..i1s seconds range in source
    const per = 50; g.fillStyle = col; const mid = y + h / 2;
    const step = Math.max(1, Math.floor(w / 400));
    for (let px = 0; px < w; px += step) {
      const a = Math.floor((i0s + (i1s - i0s) * px / w) * per), b = Math.max(a + 1, Math.floor((i0s + (i1s - i0s) * (px + step) / w) * per));
      let m = 0; for (let k = a; k < b && k < peaks.length; k++) if (peaks[k] > m) m = peaks[k];
      const hh = Math.max(1, Math.min(1, m * 1.4) * h * 0.46);
      g.fillRect(x + px, mid - hh, step, hh * 2);
    }
  }
  function draw() {
    const c = cv(), g = c.getContext('2d'), w = c.width / dpr, h = c.height / dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h); g.fillStyle = '#1b1019'; g.fillRect(0, 0, w, h);
    const tracks = S.p.tracks;
    // rows
    tracks.forEach((t, i) => { g.fillStyle = i % 2 ? '#22131e' : '#26161f'; g.fillRect(0, rowY(i), w, TH); g.fillStyle = '#3a2433'; g.fillRect(0, rowY(i) + TH - 1, w, 1); });
    // ruler
    g.fillStyle = '#2a1824'; g.fillRect(0, 0, w, RULER);
    const step = niceStep(S.pps), t0 = Math.floor(T(0) / step) * step, t1 = T(w);
    g.font = '11px Poppins, Arial, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left';
    for (let t = t0; t <= t1 + step; t += step) {
      const x = X(t); g.fillStyle = '#6d4660'; g.fillRect(Math.round(x), RULER - 9, 1, 9);
      g.fillStyle = '#e8b5cc'; g.fillText(CB.fmt(t, step < 1 ? 1 : 0), x + 4, 11);
      for (let k = 1; k < 5; k++) { const xx = X(t + step * k / 5); g.fillStyle = '#4b3043'; g.fillRect(Math.round(xx), RULER - 5, 1, 5); }
    }
    // end of film marker
    const tot = CB.total(); if (tot > 0) { const xe = X(tot); g.fillStyle = 'rgba(255,127,176,.18)'; g.fillRect(xe, RULER, w - xe, h - RULER); }
    // clips
    for (const clip of S.p.clips) {
      const ti = tracks.findIndex(t => t.id === clip.track); if (ti < 0) continue;
      const x = X(clip.start), cw = clip.dur * S.pps, y = rowY(ti) + 3, hh = TH - 7;
      if (x + cw < -5 || x > w + 5) continue;
      const col = COL[clip.charId ? 'image' : clip.type] || COL.video;
      const sel = S.sel === clip.id;
      const a = CB.assetOf(clip);
      g.save(); g.beginPath(); rr(g, x, y, Math.max(2, cw), hh, 6); g.clip();
      const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
      g.fillStyle = gr; g.fillRect(x, y, cw, hh);
      if (a && a.thumb && (clip.type === 'video' || clip.type === 'image')) {
        const th = a.thumb, tw = hh * th.width / th.height; g.globalAlpha = 0.85;
        for (let px = 0; px < cw; px += tw) { if (x + px > w || x + px + tw < 0) continue; g.drawImage(th, x + px, y, Math.min(tw, cw - px) + 0.5, hh); }
        g.globalAlpha = 1;
      }
      if (a && a.peaks && (clip.type === 'audio' || clip.type === 'video')) {
        const sp = clip.speed || 1, ww = Math.min(cw, w + 400);
        const gx = Math.max(x, -200), gw = (x + cw) - gx;
        const s0 = clip.in + (gx - x) / S.pps * sp, s1 = clip.in + clip.dur * sp;
        if (clip.type === 'audio') drawWave(g, a.peaks, gx, y, gw, hh, s0, s1, 'rgba(255,255,255,.75)');
        else { g.fillStyle = 'rgba(20,6,16,.45)'; g.fillRect(x, y + hh - 16, cw, 16); drawWave(g, a.peaks, gx, y + hh - 16, gw, 16, s0, s1, 'rgba(255,214,230,.9)'); }
      }
      if (a && (a.missing || a.bad)) { g.fillStyle = 'rgba(20,0,10,.7)'; g.fillRect(x, y, cw, hh); }
      // fades / transitions
      g.fillStyle = 'rgba(0,0,0,.35)';
      const fi = (clip.type === 'audio' || clip.type === 'video') ? Math.min(clip.fadeIn || 0, clip.dur / 2) * S.pps : 0;
      const fo = (clip.type === 'audio' || clip.type === 'video') ? Math.min(clip.fadeOut || 0, clip.dur / 2) * S.pps : 0;
      if (fi > 1) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + fi, y); g.lineTo(x, y + hh); g.fill(); }
      if (fo > 1) { g.beginPath(); g.moveTo(x + cw, y); g.lineTo(x + cw - fo, y); g.lineTo(x + cw, y + hh); g.fill(); }
      const tr = clip.trans, td = Math.min(clip.transDur || 0.5, clip.dur / 2) * S.pps;
      g.fillStyle = 'rgba(255,255,255,.28)';
      if (tr === 'fade-in' || tr === 'fade' || tr === 'dissolve') { g.beginPath(); g.moveTo(x, y + hh); g.lineTo(x + td, y); g.lineTo(x, y); g.fill(); }
      if (tr === 'fade-out' || tr === 'fade' || tr === 'dissolve') { g.beginPath(); g.moveTo(x + cw, y + hh); g.lineTo(x + cw - td, y); g.lineTo(x + cw, y); g.fill(); }
      // label
      g.fillStyle = 'rgba(20,6,16,.55)'; g.fillRect(x, y, Math.min(cw, 150), 16);
      g.fillStyle = '#fff'; g.font = '600 11px Poppins, Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle';
      let lab = clip.type === 'text' ? ((clip.text && clip.text.text) || 'Text').replace(/\n/g, ' ') : (clip.label || (a && a.name) || clip.type);
      if (clip.voice && clip.voice !== 'off') lab += '  [' + (clip.voice === 'female' ? 'F' : 'M') + ' voice]';
      if ((clip.speed || 1) !== 1) lab += '  ' + clip.speed + 'x';
      g.save(); g.beginPath(); g.rect(x, y, cw, 16); g.clip(); g.fillText(lab, Math.max(x, 0) + 5, y + 8.5); g.restore();
      g.restore();
      g.lineWidth = sel ? 2.5 : 1; g.strokeStyle = sel ? '#ffffff' : 'rgba(255,255,255,.28)';
      g.beginPath(); rr(g, x + 0.5, y + 0.5, Math.max(2, cw) - 1, hh - 1, 6); g.stroke();
      if (sel && cw > 24) { g.fillStyle = '#fff'; g.fillRect(x + 1, y + hh / 2 - 9, 4, 18); g.fillRect(x + cw - 5, y + hh / 2 - 9, 4, 18); }
    }
    if (snapLine != null) { const sx = X(snapLine); g.fillStyle = '#ffe14a'; g.fillRect(Math.round(sx), RULER, 1, h - RULER); }
    // playhead
    const px = X(S.t);
    if (px > -10 && px < w + 10) {
      g.fillStyle = '#ff2f7e'; g.fillRect(Math.round(px) - 1, 0, 2, h);
      g.beginPath(); g.moveTo(px - 8, 0); g.lineTo(px + 8, 0); g.lineTo(px, 13); g.closePath(); g.fill();
    }
  }
  function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  function hit(x, y) {
    if (y < RULER) return { ruler: true };
    const ti = Math.floor((y - RULER) / TH); const tr = S.p.tracks[ti]; if (!tr) return {};
    const t = T(x), edge = (window._touch ? 16 : 8);
    for (let i = S.p.clips.length - 1; i >= 0; i--) {
      const c = S.p.clips[i]; if (c.track !== tr.id) continue;
      if (t >= c.start && t <= c.start + c.dur) {
        const x0 = X(c.start), x1 = X(c.start + c.dur);
        const m = (x1 - x0) < edge * 3 ? Math.min(edge, (x1 - x0) / 3) : edge;
        return { clip: c, zone: x - x0 < m ? 'L' : (x1 - x < m ? 'R' : 'M'), ti, track: tr };
      }
    }
    return { ti, track: tr, empty: true };
  }
  function snapTo(t, ignoreId, edgesToo) {
    if (!S.snap) { snapLine = null; return t; }
    const th = 8 / S.pps; let best = null, bd = th;
    const pts = [0, S.t];
    S.p.clips.forEach(c => { if (c.id !== ignoreId) { pts.push(c.start, c.start + c.dur); } });
    pts.forEach(p => { const d = Math.abs(p - t); if (d < bd) { bd = d; best = p; } });
    snapLine = best; return best == null ? t : best;
  }
  function srcLimit(c) { const a = CB.assetOf(c); return (c.type === 'video' || c.type === 'audio') && a && a.duration ? a.duration : Infinity; }

  function pdown(e) {
    window._touch = e.pointerType === 'touch';
    const r = cv().getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const h = hit(x, y); cv().setPointerCapture(e.pointerId);
    CB.audio.ctx();
    if (h.ruler) { drag = { mode: 'scrub' }; CB.seek(Math.max(0, snapTo(T(x), null))); return; }
    if (h.clip) {
      const c = h.clip; S.sel = c.id; CB.emit('select');
      drag = { mode: h.zone === 'L' ? 'trimL' : h.zone === 'R' ? 'trimR' : 'move', id: c.id, x0: e.clientX, y0: e.clientY, o: { start: c.start, dur: c.dur, in: c.in, track: c.track }, moved: false, off: T(x) - c.start };
      dirty = true; return;
    }
    S.sel = null; CB.emit('select');
    if (e.pointerType === 'touch') drag = { mode: 'pan', x0: e.clientX, sl: sc().scrollLeft, tap: true };
    else { drag = { mode: 'scrub' }; CB.seek(Math.max(0, T(x))); }
    dirty = true;
  }
  function pmove(e) {
    const r = cv().getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (!drag) {
      const h = hit(x, y); let cur = '';
      if (h.ruler) cur = 'ew-resize'; else if (h.clip) cur = h.zone === 'M' ? 'grab' : 'col-resize';
      if (cur !== hoverCur) { cv().style.cursor = cur; hoverCur = cur; }
      return;
    }
    if (drag.mode === 'scrub') { CB.seek(Math.max(0, snapTo(T(x), null))); return; }
    if (drag.mode === 'pan') { sc().scrollLeft = drag.sl - (e.clientX - drag.x0); if (Math.abs(e.clientX - drag.x0) > 4) drag.tap = false; return; }
    const c = CB.clipById(drag.id); if (!c) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved) { if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return; drag.moved = true; CB.pushUndo(); S.lastKey = null; }
    const dt = dx / S.pps, o = drag.o;
    if (drag.mode === 'move') {
      let ns = o.start + dt;
      const s1 = snapTo(ns, c.id), s2 = snapTo(ns + c.dur, c.id);
      const d1 = Math.abs(s1 - ns), d2 = Math.abs(s2 - (ns + c.dur));
      if (snapLine != null) { /* choose better */ }
      if (S.snap) { const a = snapTo(ns, c.id); const aLine = snapLine; const b = snapTo(ns + c.dur, c.id); const bLine = snapLine; if (aLine != null && (bLine == null || Math.abs(a - ns) <= Math.abs(b - (ns + c.dur)))) { ns = a; snapLine = aLine; } else if (bLine != null) { ns = b - c.dur; snapLine = bLine; } else snapLine = null; }
      const ti = Math.floor((y - RULER) / TH); const tr = S.p.tracks[CB.clamp(ti, 0, S.p.tracks.length - 1)];
      let track = c.track; if (tr && CB.fitsTrack(c, tr.id)) track = tr.id;
      ns = Math.max(0, ns);
      c.track = track; c.start = CB.freeStart(c, track, ns, c.id);
    } else if (drag.mode === 'trimL') {
      const end = o.start + o.dur; let ns = snapTo(o.start + dt, c.id);
      const sp = c.speed || 1;
      let minS = Math.max(0, o.start - o.in / sp);
      const prev = S.p.clips.filter(k => k.track === c.track && k.id !== c.id && k.start + k.dur <= o.start + 1e-6).sort((a, b) => b.start - a.start)[0];
      if (prev) minS = Math.max(minS, prev.start + prev.dur);
      if (c.type === 'text' || c.type === 'color' || c.type === 'image') minS = prev ? prev.start + prev.dur : 0;
      ns = CB.clamp(ns, minS, end - 0.1);
      c.start = ns; c.dur = end - ns; c.in = Math.max(0, o.in + (ns - o.start) * sp);
      if (c.type === 'text' || c.type === 'color' || c.type === 'image') c.in = 0;
    } else if (drag.mode === 'trimR') {
      let ne = snapTo(o.start + o.dur + dt, c.id); const sp = c.speed || 1;
      let maxE = o.start + (srcLimit(c) - c.in) / sp;
      const next = S.p.clips.filter(k => k.track === c.track && k.id !== c.id && k.start >= o.start + o.dur - 1e-6).sort((a, b) => a.start - b.start)[0];
      if (next) maxE = Math.min(maxE, next.start);
      ne = CB.clamp(ne, o.start + 0.1, maxE);
      c.dur = ne - o.start;
    }
    dirty = true; CB.emit('drag');
  }
  function pup(e) {
    if (drag && drag.mode === 'pan' && drag.tap) { const r = cv().getBoundingClientRect(); CB.seek(Math.max(0, T(e.clientX - r.left))); }
    if (drag && drag.moved) { S.dirty = true; CB.changed(); CB.emit('select'); }
    drag = null; snapLine = null; dirty = true;
  }
  CB.setZoom = function (pps, anchorT) {
    const box = sc(); const w = box.clientWidth;
    const a = anchorT == null ? S.t : anchorT; const ax = a * S.pps - box.scrollLeft;
    S.pps = CB.clamp(pps, 4, 600);
    CB.tlLayout();
    box.scrollLeft = Math.max(0, a * S.pps - Math.min(Math.max(ax, 40), w - 40));
    const z = CB.$('#tlZoom'); z.value = Math.round(100 * (Math.log(S.pps / 4) / Math.log(600 / 4)));
    dirty = true;
  };
  CB.fitZoom = function () { const w = sc().clientWidth - 30; const tot = Math.max(1, CB.total()); CB.setZoom(w / tot, 0); sc().scrollLeft = 0; };
  CB.revealPlayhead = function () {
    const box = sc(), x = S.t * S.pps;
    if (x < box.scrollLeft + 10 || x > box.scrollLeft + box.clientWidth - 40) box.scrollLeft = Math.max(0, x - box.clientWidth * 0.3);
  };

  // drop from media bin / characters
  CB.timelineDrop = async function (e) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-cbfs'); if (!raw) {
      if (e.dataTransfer.files && e.dataTransfer.files.length) { const as = await CB.importFiles(e.dataTransfer.files); as.forEach((a, i) => CB.addAssetClip(a, S.t)); }
      return;
    }
    const d = JSON.parse(raw), r = cv().getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    const h = hit(x, y); const t = Math.max(0, snapTo(T(x), null)); snapLine = null;
    let a;
    if (d.kind === 'asset') a = S.assets.get(d.id);
    else if (d.kind === 'char') a = await CB.charAsset(d.charId, d.outfit);
    if (!a) return;
    let track = h.track && ((a.kind === 'audio') === (h.track.type === 'a')) ? h.track.id : null;
    const extra = d.kind === 'char' ? CB.charClipExtra(d.charId, d.outfit) : null;
    CB.addAssetClip(a, t, track || (d.kind === 'char' ? CB.defaultTrackFor('char') : null), extra);
  };

  CB.initTimeline = function () {
    const c = cv(), box = sc();
    c.addEventListener('pointerdown', pdown); c.addEventListener('pointermove', pmove);
    c.addEventListener('pointerup', pup); c.addEventListener('pointercancel', pup);
    c.addEventListener('dragover', e => { e.preventDefault(); });
    c.addEventListener('drop', CB.timelineDrop);
    box.addEventListener('scroll', () => { dirty = true; });
    box.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) { e.preventDefault(); const r = c.getBoundingClientRect(); const t = T(e.clientX - r.left); CB.setZoom(S.pps * (e.deltaY < 0 ? 1.15 : 1 / 1.15), t); }
      else if (e.shiftKey || Math.abs(e.deltaX) < Math.abs(e.deltaY) && false) { }
    }, { passive: false });
    new ResizeObserver(() => CB.tlLayout()).observe(box);
    const tick = () => { if (dirty || S.playing) { dirty = false; if (S.playing) CB.revealPlayhead(); draw(); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    CB.on(w => { if (w === 'full' || w === 'change' || w === 'drag') { if (w !== 'drag') CB.tlLayout(); dirty = true; } else if (w === 'seek' || w === 'select' || w === 'time') dirty = true; });
  };
  CB.defaultTrackFor = function (kind) { const v = S.p.tracks.filter(t => t.type === 'v'); return kind === 'char' ? v[0].id : (v[v.length - 1] || v[0]).id; };
})(window.CB);
