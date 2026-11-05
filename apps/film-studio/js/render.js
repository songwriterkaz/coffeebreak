'use strict';
(function(CB){
  const S = CB.S;
  const LOOKS = {
    none: { name: 'No look', f: '' },
    warm: { name: 'Warm film', f: 'sepia(0.25) saturate(1.2) contrast(1.08) hue-rotate(-8deg)' },
    cool: { name: 'Cool teal', f: 'saturate(1.1) contrast(1.1) hue-rotate(12deg) brightness(0.98)' },
    bw: { name: 'Black and white', f: 'grayscale(1) contrast(1.15)' },
    vintage: { name: 'Vintage', f: 'sepia(0.45) contrast(0.92) brightness(1.05) saturate(0.85)', vig: 0.45 },
    pink: { name: 'Pink glow', f: 'sepia(0.2) hue-rotate(-35deg) saturate(1.5) brightness(1.07)' },
    cine: { name: 'Cinematic', f: 'contrast(1.2) saturate(0.9) brightness(0.96)', vig: 0.55, bars: true }
  };
  CB.LOOKS = LOOKS;
  CB.FONTS = [
    ['Poppins, Arial, sans-serif', 'Poppins'], ['Montserrat, Arial, sans-serif', 'Montserrat'], ['Oswald, Impact, sans-serif', 'Oswald'],
    ['"Bebas Neue", Impact, sans-serif', 'Bebas Neue (titles)'], ['Cinzel, Georgia, serif', 'Cinzel (epic serif)'], ['"Playfair Display", Georgia, serif', 'Playfair Display'],
    ['"Great Vibes", "Brush Script MT", cursive', 'Great Vibes (script)'], ['Pacifico, "Brush Script MT", cursive', 'Pacifico'],
    ['"Special Elite", "Courier New", monospace', 'Typewriter'], ['"Courier Prime", "Courier New", monospace', 'Courier Prime (script)'],
    ['Arial, Helvetica, sans-serif', 'Arial'], ['Georgia, serif', 'Georgia'], ['Impact, Haettenschweiler, sans-serif', 'Impact'],
    ['"Courier New", monospace', 'Courier'], ['"Trebuchet MS", sans-serif', 'Trebuchet'],
    ['"Brush Script MT", "Pacifico", cursive', 'Script'], ['"Comic Sans MS", "Comic Neue", cursive', 'Comic'], ['"Times New Roman", serif', 'Times']
  ];
  CB.preloadFonts = function () {
    const fam = ['Poppins', 'Montserrat', 'Oswald', 'Bebas Neue', 'Cinzel', 'Playfair Display', 'Great Vibes', 'Pacifico', 'Special Elite', 'Courier Prime'];
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const jobs = []; fam.forEach(f => { jobs.push(document.fonts.load('400 24px "' + f + '"')); jobs.push(document.fonts.load('700 24px "' + f + '"')); });
    return Promise.all(jobs.map(j => j.catch(() => 0)));
  };
  const hasFilter = (function () { try { return 'filter' in document.createElement('canvas').getContext('2d'); } catch (e) { return false; } })();

  // ---------- video element pool ----------
  const els = new Map();
  CB.releaseVideos = function (all) {
    els.forEach((el, id) => { if (all || !CB.clipById(id)) { try { el.pause(); el.removeAttribute('src'); el.load(); } catch (e) {} els.delete(id); } });
  };
  function videoEl(c) {
    let el = els.get(c.id); const a = CB.assetOf(c);
    if (!a || !a.url) return null;
    if (el && el._url !== a.url) { try { el.pause(); } catch (e) {} els.delete(c.id); el = null; }
    if (!el) {
      el = document.createElement('video'); el.muted = true; el.playsInline = true; el.preload = 'auto'; el.crossOrigin = 'anonymous';
      el._url = a.url; el.src = a.url; el._want = -1; els.set(c.id, el);
    }
    return el;
  }
  CB.videoEl = videoEl;
  CB.prepareVideos = async function (t0) {
    const list = S.p.clips.filter(c => c.type === 'video');
    await Promise.all(list.map(c => new Promise(res => {
      const el = videoEl(c); if (!el) return res();
      if (el.readyState >= 2) return res();
      const f = () => res(); el.addEventListener('loadeddata', f, { once: true }); setTimeout(res, 4000);
    })));
  };
  // Keep elements near the playhead in sync with the clock.
  function syncVideos(t, playing) {
    for (const c of S.p.clips) {
      if (c.type !== 'video') continue;
      const near = t >= c.start - 1.5 && t < c.start + c.dur + 0.3;
      if (!near) { const e = els.get(c.id); if (e && !e.paused) e.pause(); continue; }
      const el = videoEl(c); if (!el) continue;
      const active = t >= c.start && t < c.start + c.dur;
      const sp = c.speed || 1;
      const want = Math.max(0, Math.min((el.duration || 1e9) - 0.02, c.in + Math.max(0, t - c.start) * sp));
      if (el.playbackRate !== sp) { try { el.playbackRate = sp; } catch (e) {} }
      if (playing && active) {
        if (Math.abs(el.currentTime - want) > 0.3) { el.currentTime = want; }
        if (el.paused) { const pr = el.play(); if (pr && pr.catch) pr.catch(() => {}); }
      } else {
        if (!el.paused) el.pause();
        const w = active ? want : Math.max(0, c.in);
        if (Math.abs(el.currentTime - w) > 0.03 && Math.abs(el._want - w) > 0.001) { el._want = w; try { el.currentTime = w; } catch (e) {} }
      }
    }
  }
  CB.syncVideos = syncVideos;

  // ---------- compositing ----------
  function filterFor(c) {
    const look = LOOKS[c.look || 'none'] || LOOKS.none;
    const b = c.bright == null ? 100 : c.bright, ct = c.contrast == null ? 100 : c.contrast, s = c.sat == null ? 100 : c.sat;
    let f = '';
    if (b !== 100) f += 'brightness(' + b + '%) ';
    if (ct !== 100) f += 'contrast(' + ct + '%) ';
    if (s !== 100) f += 'saturate(' + s + '%) ';
    return (f + look.f).trim() || 'none';
  }
  function alphaFor(c, t) {
    const u = t - c.start, r = c.start + c.dur - t, d = Math.max(0.05, Math.min(c.transDur || 0.5, c.dur / 2));
    let a = c.opacity == null ? 1 : c.opacity;
    const tr = c.trans || 'none';
    if (tr === 'fade-in') a *= Math.min(1, u / d);
    else if (tr === 'fade-out') a *= Math.min(1, r / d);
    else if (tr === 'fade' || tr === 'dissolve') a *= Math.min(1, u / d, r / d);
    return Math.max(0, Math.min(1, a));
  }
  function drawSource(ctx, W, H, src, sw, sh, c, t) {
    const fit = c.fit || 'cover';
    let z = c.zoom || 1, px = c.panX || 0, py = c.panY || 0;
    if (c.zoomEnd && c.zoomEnd !== z || c.panXEnd != null && c.panXEnd !== px || c.panYEnd != null && c.panYEnd !== py) {
      let u = Math.max(0, Math.min(1, (t - c.start) / Math.max(0.05, c.dur))); u = u * u * (3 - 2 * u);
      z = z + ((c.zoomEnd || z) - z) * u; px = px + ((c.panXEnd == null ? px : c.panXEnd) - px) * u; py = py + ((c.panYEnd == null ? py : c.panYEnd) - py) * u;
    }
    const sc = (fit === 'contain' ? Math.min(W / sw, H / sh) : Math.max(W / sw, H / sh)) * z;
    const dw = sw * sc, dh = sh * sc;
    const cx = W / 2 + px * W / 2, cy = H / 2 + py * H / 2;
    ctx.drawImage(src, cx - dw / 2, cy - dh / 2, dw, dh);
  }
  function drawText(ctx, W, H, c, alpha, t) {
    const tx = c.text || {}; const px = Math.max(4, (tx.size || 60) * H / 720);
    const fam = tx.font || CB.FONTS[0][0];
    const fnt = (k, sz) => (tx.italic ? 'italic ' : '') + (k ? 'bold ' : (tx.bold ? 'bold ' : '')) + sz + 'px ' + fam;
    ctx.save();
    ctx.textBaseline = 'middle';
    const sp = (tx.spacing || 0) / 100 * px;
    const setSp = (v) => { if ('letterSpacing' in ctx) ctx.letterSpacing = v + 'px'; };
    const prep = (l) => tx.caps ? l.toUpperCase() : l;
    // build line records
    const raw = String(tx.text || '').split('\n');
    const recs = raw.map(l => {
      if (/^#\s/.test(l)) return { t: prep(l.slice(2)), head: true, h: px * 1.5 };
      if (l.trim() === '') return { t: '', gap: true, h: px * 0.7 };
      const m = l.split(/\s*\|\s*/); if (m.length === 2) return { a: prep(m[0]), b: prep(m[1]), h: px * 1.3 };
      return { t: prep(l), h: px * 1.22 };
    });
    const blockH = recs.reduce((s, r) => s + r.h, 0);
    let y0;
    const xpos = (tx.x == null ? 50 : tx.x) / 100 * W;
    if (tx.roll) {
      const u = Math.max(0, Math.min(1, (t - c.start) / Math.max(0.1, c.dur)));
      y0 = H + px - u * (H + blockH + px * 2);
    } else y0 = (tx.y == null ? 50 : tx.y) / 100 * H - blockH / 2;
    const align = tx.roll ? 'center' : (tx.align || 'center');
    let mw = 0;
    if (tx.bg && !tx.roll) { recs.forEach(r => { ctx.font = fnt(r.head, r.head ? px * 1.3 : px); setSp(sp); mw = Math.max(mw, r.a ? ctx.measureText(r.a + '    ' + r.b).width : ctx.measureText(r.t || '').width); });
      const pad = px * 0.35; let bx = xpos - mw / 2; if (align === 'left') bx = xpos; else if (align === 'right') bx = xpos - mw;
      ctx.fillStyle = tx.bgColor || '#d6336f'; ctx.globalAlpha *= 0.9;
      const r = px * 0.2, x = bx - pad, y = y0 - pad / 2, w = mw + pad * 2, h = blockH + pad;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); ctx.globalAlpha = alpha; }
    if (tx.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = px * 0.18; ctx.shadowOffsetY = px * 0.04; }
    const put = (str, x, y, al) => {
      ctx.textAlign = al; const xx = al === 'center' ? x + sp / 2 : al === 'right' ? x + sp : x;
      if (tx.outline) { ctx.lineWidth = Math.max(2, px * 0.12); ctx.strokeStyle = tx.outlineColor || '#3a1030'; ctx.lineJoin = 'round'; ctx.strokeText(str, xx, y); }
      ctx.fillStyle = tx.color || '#ffffff'; ctx.fillText(str, xx, y);
    };
    let y = y0;
    for (const r of recs) {
      const cy = y + r.h / 2; y += r.h;
      if (r.gap || cy < -px * 2 || cy > H + px * 2) continue;
      if (r.a !== undefined) {
        ctx.font = fnt(false, px); setSp(sp);
        const gap = px * 0.7; put(r.a, xpos - gap, cy, 'right'); put(r.b, xpos + gap, cy, 'left');
      } else if (r.head) { ctx.font = fnt(true, px * 1.3); setSp(sp * 1.4 + px * 0.06); put(r.t, xpos, cy, align); }
      else { ctx.font = fnt(false, px); setSp(sp); put(r.t, xpos, cy, align); }
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.restore();
  }
  function vignette(ctx, W, H, k) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + k + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function drawClip(ctx, W, H, c, t) {
    const alpha = alphaFor(c, t); if (alpha <= 0.001) return;
    ctx.save();
    if (c.trans === 'fade') { const a0 = alpha / (c.opacity == null ? 1 : c.opacity); if (a0 < 1) { ctx.globalAlpha = 1 - a0; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); } }
    ctx.globalAlpha = alpha;
    const look = LOOKS[c.look || 'none'] || LOOKS.none;
    if (c.type === 'video' || c.type === 'image') {
      let src = null, sw = 0, sh = 0;
      const a = CB.assetOf(c);
      if (c.type === 'image' && a && a.img) { src = a.img; sw = a.w; sh = a.h; }
      else if (c.type === 'video') {
        const el = els.get(c.id) || videoEl(c);
        if (el && el.readyState >= 2 && el.videoWidth) { src = el; sw = el.videoWidth; sh = el.videoHeight; }
      }
      if (src) {
        const f = filterFor(c);
        if (hasFilter && f !== 'none') ctx.filter = f;
        drawSource(ctx, W, H, src, sw, sh, c, t);
        ctx.filter = 'none';
        if (look.vig) vignette(ctx, W, H, look.vig);
        if (look.bars) { ctx.fillStyle = '#000'; const bh = H * 0.1; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh); }
      } else if (a && (a.missing || a.bad)) { ctx.fillStyle = '#331326'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ff7fb0'; ctx.font = (H / 24) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Media missing: ' + a.name, W / 2, H / 2); }
    } else if (c.type === 'color') {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c.color || '#2a1523'); g.addColorStop(1, c.color2 || c.color || '#2a1523');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const f = filterFor(c);
    } else if (c.type === 'text') {
      drawText(ctx, W, H, c, alpha, t);
    }
    ctx.restore();
  }
  CB.drawFrame = function (ctx, W, H, t) {
    ctx.save(); ctx.globalAlpha = 1; ctx.filter = 'none';
    ctx.fillStyle = S.p.bg || '#000'; ctx.fillRect(0, 0, W, H);
    const vt = S.p.tracks.filter(x => x.type === 'v');
    for (let i = vt.length - 1; i >= 0; i--) {
      const tr = vt[i]; if (tr.hide) continue;
      for (const c of S.p.clips) if (c.track === tr.id && t >= c.start && t < c.start + c.dur) drawClip(ctx, W, H, c, t);
    }
    if (S.p.watermark) {
      const px = Math.max(10, H * 0.032), m = px * 0.8;
      ctx.font = 'bold ' + px + 'px Poppins, Arial, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      const logo = CB.logoImg;
      let x = W - m;
      ctx.globalAlpha = 0.8; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = px * 0.3;
      ctx.fillStyle = '#ffd6e6'; ctx.fillText('coffeebreaks.itch.io', x, H - m);
      if (logo && logo.complete && logo.naturalWidth) { const w = ctx.measureText('coffeebreaks.itch.io').width; ctx.drawImage(logo, x - w - px * 1.5, H - m - px * 1.2, px * 1.2, px * 1.2); }
    }
    ctx.restore();
  };

  // ---------- playback clock ----------
  let nodes = [], ctxStart = 0, from = 0, extraDests = [];
  CB.clock = {
    now() { return S.playing ? Math.max(from, from + (CB.audio.ctx().currentTime - ctxStart)) : S.t; }
  };
  async function prime() {
    // build shifted buffers before playing so there is no stutter
    S.p.clips.forEach(c => { if (c.type === 'video' || c.type === 'audio') CB.audio.bufferFor(c); });
  }
  CB.play = async function (opts) {
    if (S.playing) return;
    opts = opts || {};
    await CB.audio.resume();
    const total = CB.total(); if (total <= 0) { CB.toast('Add something to the timeline first'); return; }
    if (S.t >= total - 0.05) S.t = 0;
    await prime();
    const c = CB.audio.ctx();
    from = S.t; ctxStart = c.currentTime + 0.12; extraDests = opts.dests || [];
    nodes = CB.audio.schedule(S.p.clips, S.p.tracks, from, ctxStart, [CB.audio.master].concat(extraDests));
    S.playing = true; CB.emit('transport');
  };
  CB.pause = function () {
    if (!S.playing) return;
    S.t = CB.clock.now(); S.playing = false;
    CB.audio.stopNodes(nodes); nodes = [];
    CB.syncVideos(S.t, false); CB.emit('transport');
  };
  CB.reschedule = function () {
    if (!S.playing) return;
    const t = CB.clock.now(); CB.audio.stopNodes(nodes);
    const c = CB.audio.ctx(); from = t; ctxStart = c.currentTime + 0.05;
    nodes = CB.audio.schedule(S.p.clips, S.p.tracks, from, ctxStart, [CB.audio.master].concat(extraDests));
  };
  CB.seek = function (t) {
    t = Math.max(0, t);
    const was = S.playing;
    if (was) { S.t = t; CB.audio.stopNodes(nodes); nodes = []; S.playing = false; }
    S.t = t;
    if (was) { CB.play(); }
    CB.emit('seek');
  };
  CB.togglePlay = function () { S.playing ? CB.pause() : CB.play(); };

  // main preview loop
  const cv = () => CB.$('#preview');
  CB.sizePreview = function () {
    const d = CB.dims(720), c = cv(); if (c.width !== d.W || c.height !== d.H) { c.width = d.W; c.height = d.H; }
    const wrap = CB.$('#stageWrap'); wrap.style.setProperty('--ar', d.W + ' / ' + d.H); wrap.style.setProperty('--arn', (d.W / d.H).toFixed(4));
  };
  CB.loop = function () {
    const c = cv(); const ctx = c.getContext('2d');
    let last = -1;
    const frame = () => {
      if (S.exporting) { requestAnimationFrame(frame); return; }
      if (S.playing) {
        const t = CB.clock.now(); S.t = t;
        if (!S.exporting && t >= CB.total()) { CB.pause(); S.t = CB.total(); }
      }
      CB.syncVideos(S.t, S.playing);
      CB.renderFrame(ctx, c.width, c.height, S.t, CB.previewGrader());
      if (S.t !== last || S.playing) { CB.emit('time'); last = S.t; }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  CB.logoImg = new Image(); CB.logoImg.src = 'favicon.png';
})(window.CB);
