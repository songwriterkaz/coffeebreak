'use strict';
(function(CB){
  const KEY = 'cbfs_project_v1';
  const S = CB.S = {
    p: null,            // project
    assets: new Map(),  // id -> asset (runtime, includes blob/url/buffer)
    sel: null,          // selected clip id
    t: 0,               // playhead (s)
    playing: false,
    pps: 80,            // pixels per second
    snap: true,
    undo: [], redo: [],
    dirty: false, lastKey: null, lastT: 0,
    exporting: false
  };
  const listeners = [];
  CB.on = (fn) => listeners.push(fn);
  CB.emit = (what) => listeners.forEach(f => { try { f(what); } catch (e) { console.error(e); } });

  CB.newProject = function () {
    return {
      v: 1, name: 'My Film', aspect: '16:9', fps: 30, watermark: false, bg: '#000000', grade: CB.defaultGrade(),
      tracks: [
        { id: 'V2', type: 'v', name: 'Video 2', mute: false, hide: false },
        { id: 'V1', type: 'v', name: 'Video 1', mute: false, hide: false },
        { id: 'A1', type: 'a', name: 'Audio 1', mute: false },
        { id: 'A2', type: 'a', name: 'Audio 2', mute: false }
      ],
      clips: [], assets: []
    };
  };
  S.p = CB.newProject();

  CB.assetOf = (c) => c && c.assetId ? S.assets.get(c.assetId) : null;
  CB.clipById = (id) => S.p.clips.find(c => c.id === id);
  CB.selClip = () => S.sel ? CB.clipById(S.sel) : null;
  CB.trackById = (id) => S.p.tracks.find(t => t.id === id);
  CB.total = function () { let m = 0; for (const c of S.p.clips) m = Math.max(m, c.start + c.dur); return m; };
  CB.ASPECTS = [['16:9', '16:9 YouTube', 16 / 9], ['9:16', '9:16 TikTok / Reels', 9 / 16], ['1:1', '1:1 Square', 1], ['4:3', '4:3 Classic', 4 / 3], ['1.85:1', '1.85:1 Cinema flat', 1.85], ['2.39:1', '2.39:1 Cinemascope', 2.39]];
  CB.aspectRatio = function () { const a = CB.ASPECTS.find(x => x[0] === S.p.aspect); return a ? a[2] : 16 / 9; };
  CB.LONG = { 360: 640, 480: 854, 720: 1280, 1080: 1920, 1440: 2560, 2160: 3840 };
  CB.dims = function (res) {
    const long = CB.LONG[res] || 1280, r = CB.aspectRatio(), ev = (x) => Math.max(2, Math.round(x / 2) * 2);
    if (S.p.aspect === '1:1') { const s = ev(long * 9 / 16); return { W: s, H: s }; }
    if (r >= 1) return { W: ev(long), H: ev(long / r) };
    return { W: ev(long * r), H: ev(long) };
  };

  // ---------- undo / redo ----------
  function snapshot() { return JSON.stringify({ tracks: S.p.tracks, clips: S.p.clips, aspect: S.p.aspect, watermark: S.p.watermark, bg: S.p.bg, name: S.p.name, grade: S.p.grade }); }
  CB.pushUndo = function () { S.undo.push(snapshot()); if (S.undo.length > 120) S.undo.shift(); S.redo = []; };
  CB.mutate = function (fn, key) {
    const now = performance.now();
    if (!key || key !== S.lastKey || now - S.lastT > 1200) CB.pushUndo();
    S.lastKey = key || null; S.lastT = now;
    fn(); CB.changed();
  };
  function restore(js) {
    const o = JSON.parse(js);
    Object.assign(S.p, { tracks: o.tracks, clips: o.clips, aspect: o.aspect, watermark: o.watermark, bg: o.bg, name: o.name, grade: CB.mergeGrade(o.grade) });
    if (S.sel && !CB.clipById(S.sel)) S.sel = null;
    S.lastKey = null; CB.changed(true);
  }
  CB.undo = function () { if (!S.undo.length) return; S.redo.push(snapshot()); restore(S.undo.pop()); };
  CB.redo = function () { if (!S.redo.length) return; S.undo.push(snapshot()); restore(S.redo.pop()); };
  CB.changed = function (full) {
    S.dirty = true; CB.emit(full ? 'full' : 'change'); scheduleSave();
    if (S.playing && CB.reschedule) CB.reschedule();
  };

  // ---------- clips ----------
  CB.trackType = (id) => { const t = CB.trackById(id); return t ? t.type : 'v'; };
  CB.fitsTrack = (clip, trackId) => (clip.type === 'audio') === (CB.trackType(trackId) === 'a');
  CB.freeStart = function (clip, trackId, want, ignoreId) {
    // find nearest start where clip (dur) does not overlap anything on trackId
    const others = S.p.clips.filter(c => c.track === trackId && c.id !== (ignoreId || clip.id)).sort((a, b) => a.start - b.start);
    const d = clip.dur; want = Math.max(0, want);
    const ok = (s) => s >= -1e-6 && others.every(o => s + d <= o.start + 1e-6 || s >= o.start + o.dur - 1e-6);
    if (ok(want)) return want;
    const cands = [0];
    others.forEach(o => { cands.push(o.start + o.dur); cands.push(o.start - d); });
    let best = null;
    cands.filter(ok).forEach(s => { if (best === null || Math.abs(s - want) < Math.abs(best - want)) best = s; });
    return best === null ? want : Math.max(0, best);
  };
  CB.addClip = function (clip, opts) {
    opts = opts || {};
    clip.id = clip.id || CB.uid('c');
    const base = { start: 0, dur: 5, in: 0, speed: 1, vol: 1, fadeIn: 0, fadeOut: 0, trans: 'none', transDur: 0.5, bright: 100, contrast: 100, sat: 100, look: 'none', zoom: 1, panX: 0, panY: 0, opacity: 1, fit: 'cover', voice: 'off', voiceStr: 50, keepPitch: false };
    clip = Object.assign(base, clip);
    if (!clip.track) clip.track = defaultTrack(clip);
    clip.start = opts.exact ? clip.start : CB.freeStart(clip, clip.track, clip.start);
    S.p.clips.push(clip);
    return clip;
  };
  function defaultTrack(clip) {
    if (clip.type === 'audio') { const a = S.p.tracks.filter(t => t.type === 'a'); return (a[0] || {}).id; }
    const sel = CB.selClip(); const v = S.p.tracks.filter(t => t.type === 'v');
    if (clip.type === 'text') return v[0].id;
    return (v[v.length - 1] || v[0]).id;
  }
  CB.defaultTrack = defaultTrack;
  CB.splitAt = function (t) {
    t = t == null ? S.t : t;
    let list = [];
    const sc = CB.selClip();
    if (sc && t > sc.start + 0.02 && t < sc.start + sc.dur - 0.02) list = [sc];
    else list = S.p.clips.filter(c => t > c.start + 0.02 && t < c.start + c.dur - 0.02);
    if (!list.length) { CB.toast('Move the playhead over a clip to split it'); return; }
    CB.mutate(() => {
      list.forEach(c => {
        const left = t - c.start, right = c.start + c.dur - t;
        const n = JSON.parse(JSON.stringify(c)); n.id = CB.uid('c');
        n.start = t; n.dur = right; n.in = c.in + left * (c.speed || 1); n.trans = (c.trans === 'fade' || c.trans === 'dissolve' || c.trans === 'fade-out') ? (c.trans === 'fade-out' ? 'fade-out' : 'none') : 'none';
        n.fadeIn = 0;
        c.dur = left; c.fadeOut = 0;
        if (c.trans === 'fade' || c.trans === 'dissolve') c.trans = 'fade-in';
        if (c.trans === 'fade-out') c.trans = 'none';
        S.p.clips.push(n);
      });
    });
    CB.toast('Split');
  };
  CB.deleteSel = function (ripple) {
    const c = CB.selClip(); if (!c) { CB.toast('Select a clip first'); return; }
    CB.mutate(() => {
      S.p.clips = S.p.clips.filter(x => x.id !== c.id);
      if (ripple) S.p.clips.forEach(x => { if (x.track === c.track && x.start >= c.start + c.dur - 1e-6) x.start = Math.max(0, x.start - c.dur); });
      S.sel = null;
    });
  };
  CB.duplicateSel = function () {
    const c = CB.selClip(); if (!c) return;
    CB.mutate(() => { const n = JSON.parse(JSON.stringify(c)); n.id = CB.uid('c'); n.start = c.start + c.dur; n.start = CB.freeStart(n, n.track, n.start); S.p.clips.push(n); S.sel = n.id; });
  };
  CB.addTrack = function (type) {
    const n = S.p.tracks.filter(t => t.type === type).length;
    if (n >= 4) { CB.toast('That is the most tracks for now'); return; }
    CB.mutate(() => {
      let k = 1; while (CB.trackById((type === 'v' ? 'V' : 'A') + k)) k++;
      const t = { id: (type === 'v' ? 'V' : 'A') + k, type, name: (type === 'v' ? 'Video ' : 'Audio ') + k, mute: false, hide: false };
      if (type === 'v') S.p.tracks.unshift(t); else S.p.tracks.push(t);
    });
  };

  // ---------- media ----------
  const kindOf = (f) => {
    const t = (f.type || '').toLowerCase(), n = (f.name || '').toLowerCase();
    if (t.startsWith('video/') || /\.(mp4|mov|m4v|webm|mkv)$/.test(n)) return 'video';
    if (t.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac)$/.test(n)) return 'audio';
    if (t.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(n)) return 'image';
    return null;
  };
  function loadVideoMeta(url) {
    return new Promise(res => {
      const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = url;
      const done = (ok) => res(ok ? v : null);
      v.onloadeddata = () => done(true); v.onerror = () => done(false); setTimeout(() => done(v.readyState >= 1), 8000);
    });
  }
  function thumbFrom(el, w, h) {
    const c = document.createElement('canvas'); c.width = 96; c.height = Math.max(20, Math.round(96 * h / w));
    try { c.getContext('2d').drawImage(el, 0, 0, c.width, c.height); } catch (e) {}
    return c;
  }
  CB.fillAsset = async function (a, blob) {
    a.blob = blob; a.url = URL.createObjectURL(blob);
    if (a.kind === 'image') {
      const img = new Image(); img.src = a.url;
      await new Promise((r) => { img.onload = r; img.onerror = r; });
      a.img = img; a.w = img.naturalWidth || 1; a.h = img.naturalHeight || 1; a.duration = 0; a.thumb = thumbFrom(img, a.w, a.h);
    } else if (a.kind === 'video') {
      const v = await loadVideoMeta(a.url);
      if (!v) { a.bad = true; a.w = 16; a.h = 9; a.duration = 5; }
      else {
        a.w = v.videoWidth || 16; a.h = v.videoHeight || 9; a.duration = isFinite(v.duration) ? v.duration : 5;
        try { v.currentTime = Math.min(0.3, a.duration / 2); await new Promise(r => { v.onseeked = r; setTimeout(r, 1500); }); } catch (e) {}
        a.thumb = thumbFrom(v, a.w, a.h);
      }
      if (blob.size < 400 * 1024 * 1024) {
        const buf = await CB.audio.decode(await blob.arrayBuffer());
        if (buf) { a.buffer = buf; a.peaks = CB.audio.peaks(buf); }
      }
    } else if (a.kind === 'audio') {
      const buf = await CB.audio.decode(await blob.arrayBuffer());
      if (buf) { a.buffer = buf; a.peaks = CB.audio.peaks(buf); a.duration = buf.duration; } else { a.bad = true; a.duration = 1; }
    }
    a.missing = false;
    return a;
  };
  CB.importFiles = async function (files, opts) {
    opts = opts || {};
    const out = [];
    for (const f of Array.from(files)) {
      const kind = kindOf(f);
      if (!kind) { CB.toast('Skipped ' + f.name + ' (not video, audio or a picture)'); continue; }
      // relink a missing asset with the same name
      let a = Array.from(S.assets.values()).find(x => x.missing && x.name === f.name);
      if (!a) { a = { id: CB.uid('a'), name: f.name, kind, size: f.size }; S.assets.set(a.id, a); }
      CB.toast('Importing ' + f.name + '...', 6000);
      try { await CB.fillAsset(a, f); } catch (e) { console.error(e); a.bad = true; }
      if (a.bad) CB.toast('Could not read ' + f.name + '. Try MP4, WebM, MP3 or WAV.', 5000);
      CB.idb.put('assets', a.id, { id: a.id, name: a.name, kind: a.kind, blob: f });
      out.push(a);
      CB.emit('media');
    }
    S.p.assets = Array.from(S.assets.values()).map(metaOf);
    scheduleSave();
    if (out.length && !opts.quiet) CB.toast('Imported ' + out.length + ' file' + (out.length > 1 ? 's' : ''));
    return out;
  };
  const metaOf = (a) => ({ id: a.id, name: a.name, kind: a.kind, duration: a.duration, w: a.w, h: a.h, src: a.src || null, size: a.size || 0, charKey: !!a.charKey });
  CB.metaOf = metaOf;
  CB.addAssetClip = function (a, startAt, trackId, extra) {
    const clip = { type: a.kind, assetId: a.id, start: startAt == null ? S.t : startAt, label: a.name };
    if (a.kind === 'image') { clip.dur = 5; clip.in = 0; clip.fit = 'cover'; }
    else { clip.dur = Math.max(0.2, a.duration || 5); }
    if (trackId) clip.track = trackId;
    Object.assign(clip, extra || {});
    let c;
    CB.mutate(() => { c = CB.addClip(clip); S.sel = c.id; });
    return c;
  };
  // default characters / remote assets (src url)
  CB.assetFromUrl = async function (id, name, url) {
    let a = S.assets.get(id); if (a && !a.missing) return a;
    a = a || { id, name, kind: 'image', src: url }; a.src = url; S.assets.set(id, a);
    const blob = await (await fetch(url)).blob();
    await CB.fillAsset(a, blob); S.p.assets = Array.from(S.assets.values()).map(metaOf);
    CB.emit('media'); return a;
  };

  // ---------- save / load ----------
  let saveT = null;
  function scheduleSave() {
    S.dirty = true; setSaveLabel('Saving...');
    clearTimeout(saveT); saveT = setTimeout(CB.autosave, 700);
  }
  function setSaveLabel(t) { const e = CB.$('#saveState'); if (e) e.textContent = t; }
  CB.projectJSON = function () {
    S.p.assets = Array.from(S.assets.values()).map(metaOf);
    return JSON.stringify(Object.assign({}, S.p, { playhead: S.t, pps: S.pps }));
  };
  CB.autosave = function () {
    try {
      const js = CB.projectJSON();
      localStorage.setItem(KEY, js);
      const now = Date.now();
      if (now - (CB._lastBackup || 0) > 30000) {
        CB._lastBackup = now;
        let b = []; try { b = JSON.parse(localStorage.getItem(KEY + '_backups') || '[]'); } catch (e) {}
        b.push({ t: now, name: S.p.name, js }); while (b.length > 5 || JSON.stringify(b).length > 3e6) b.shift();
        localStorage.setItem(KEY + '_backups', JSON.stringify(b));
      }
      CB.idb.put('kv', 'project', js);
      S.dirty = false; setSaveLabel('Saved');
    } catch (e) { console.error(e); setSaveLabel('Not saved'); CB.toast('Could not auto-save here. Use Save to download a copy.', 5000); }
  };
  CB.loadProject = async function (js, opts) {
    opts = opts || {};
    const o = typeof js === 'string' ? JSON.parse(js) : js;
    const p = Object.assign(CB.newProject(), o);
    delete p.playhead; delete p.pps; p.grade = CB.mergeGrade(o.grade);
    // keep arrays valid
    p.tracks = (p.tracks && p.tracks.length) ? p.tracks : CB.newProject().tracks;
    p.clips = p.clips || [];
    S.p = p; S.sel = null; S.undo = []; S.redo = []; S.t = Math.min(o.playhead || 0, CB.total()); if (o.pps) S.pps = o.pps;
    S.assets.forEach(a => { try { URL.revokeObjectURL(a.url); } catch (e) {} });
    CB.releaseVideos && CB.releaseVideos(true);
    S.assets = new Map();
    let missing = 0;
    for (const m of (o.assets || [])) {
      const a = Object.assign({}, m, { missing: false });
      S.assets.set(a.id, a);
      try {
        if (m.src) { await CB.fillAsset(a, await (await fetch(m.src)).blob()); }
        else {
          const rec = await CB.idb.get('assets', m.id);
          if (rec && rec.blob) await CB.fillAsset(a, rec.blob); else { a.missing = true; missing++; }
        }
      } catch (e) { a.missing = true; missing++; }
    }
    p.assets = Array.from(S.assets.values()).map(metaOf);
    CB.emit('full'); CB.emit('media');
    if (missing && !opts.quiet) CB.toast(missing + ' media file' + (missing > 1 ? 's are' : ' is') + ' missing. Import them again and they reconnect by name.', 7000);
    return missing;
  };
  CB.restoreLast = async function () {
    let js = localStorage.getItem(KEY);
    if (!js) js = await CB.idb.get('kv', 'project');
    if (!js) return false;
    try { await CB.loadProject(js, { quiet: false }); return true; } catch (e) { console.error(e); return false; }
  };
  CB.backups = function () { try { return JSON.parse(localStorage.getItem(KEY + '_backups') || '[]'); } catch (e) { return []; } };
  CB.downloadProject = function () {
    CB.autosave();
    CB.download(new Blob([CB.projectJSON()], { type: 'application/json' }), CB.safeName(S.p.name) + '.coffeebreak-film.json');
  };
})(window.CB);
