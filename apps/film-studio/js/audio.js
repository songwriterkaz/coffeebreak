'use strict';
(function(CB){
  let ac = null, master = null;
  CB.audio = {
    ctx() {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        ac = new AC({ latencyHint: 'interactive' });
        master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
        CB.audio.master = master;
      }
      return ac;
    },
    async resume() { const c = CB.audio.ctx(); if (c.state !== 'running') { try { await c.resume(); } catch (e) {} } return c; },
    setVolume(v) { CB.audio.ctx(); master.gain.value = v; },
    async decode(arrayBuffer) {
      const c = CB.audio.ctx();
      try { return await c.decodeAudioData(arrayBuffer); } catch (e) { return null; }
    },
    peaks(buf, perSec) {
      perSec = perSec || 50;
      const n = Math.max(1, Math.ceil(buf.duration * perSec)), out = new Float32Array(n);
      const ch = buf.getChannelData(0), step = Math.max(1, Math.floor(buf.sampleRate / perSec));
      for (let i = 0; i < n; i++) {
        let mx = 0; const s = i * step, e = Math.min(ch.length, s + step), skip = Math.max(1, ((e - s) / 40) | 0);
        for (let j = s; j < e; j += skip) { const v = Math.abs(ch[j]); if (v > mx) mx = v; }
        out[i] = mx;
      }
      return out;
    },
    // Voice converter: pitch shift that keeps the length (two crossfading read heads).
    pitchShift(buf, semis) {
      const c = CB.audio.ctx(), ratio = Math.pow(2, semis / 12);
      const out = c.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
      const G = Math.round(buf.sampleRate * 0.06);
      for (let ch = 0; ch < buf.numberOfChannels; ch++) {
        const x = buf.getChannelData(ch), y = out.getChannelData(ch), n = x.length;
        let p = 0; const dp = (1 - ratio) / G;
        for (let i = 0; i < n; i++) {
          p += dp; p -= Math.floor(p);
          const p2 = (p + 0.5) % 1;
          const d1 = p * G, d2 = p2 * G;
          const w1 = Math.sin(Math.PI * p), w2 = Math.sin(Math.PI * p2);
          const a = rd(x, i - d1, n), b = rd(x, i - d2, n);
          y[i] = a * w1 * w1 + b * w2 * w2;
        }
      }
      return out;
    },
    voiceSemis(c) {
      if (!c.voice || c.voice === 'off') return 0;
      const s = (c.voiceStr == null ? 50 : c.voiceStr) / 100;
      return (c.voice === 'female' ? 1 : -1) * s * 6;
    },
    wantSemis(c) {
      let st = CB.audio.voiceSemis(c);
      if (c.keepPitch && c.speed && c.speed !== 1) st -= 12 * Math.log2(c.speed);
      return Math.round(st * 10) / 10;
    },
    // returns the buffer to play for a clip (shifted if the voice converter or keep-pitch is on)
    bufferFor(c) {
      const a = CB.assetOf(c); if (!a || !a.buffer) return null;
      const st = CB.audio.wantSemis(c);
      if (Math.abs(st) < 0.05) return a.buffer;
      a.shifted = a.shifted || {};
      const k = st.toFixed(1);
      if (!a.shifted[k]) a.shifted[k] = CB.audio.pitchShift(a.buffer, st);
      return a.shifted[k];
    },
    // Schedule every audio-carrying clip. Returns nodes so they can be stopped.
    schedule(clips, tracks, fromT, ctxStart, dests) {
      const c = CB.audio.ctx(), nodes = [];
      const muted = new Set(tracks.filter(t => t.mute).map(t => t.id));
      for (const clip of clips) {
        if (clip.type !== 'video' && clip.type !== 'audio') continue;
        if (muted.has(clip.track)) continue;
        const buf = CB.audio.bufferFor(clip); if (!buf) continue;
        const cs = clip.start, ce = clip.start + clip.dur;
        if (ce <= fromT + 0.001) continue;
        const skip = Math.max(0, fromT - cs), t0 = cs + skip;
        const when = ctxStart + Math.max(0, cs - fromT);
        const sp = clip.speed || 1;
        const off = clip.in + skip * sp, durSrc = (clip.dur - skip) * sp;
        if (off >= buf.duration) continue;
        const src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = sp;
        const g = c.createGain();
        const vol = (clip.vol == null ? 1 : clip.vol);
        const fi = Math.min(clip.fadeIn || 0, clip.dur / 2), fo = Math.min(clip.fadeOut || 0, clip.dur / 2);
        const lvl = (t) => vol * Math.min(1, fi > 0 ? (t - cs) / fi : 1, fo > 0 ? (ce - t) / fo : 1);
        const at = (t) => when + (t - t0);
        g.gain.setValueAtTime(Math.max(0, lvl(t0)), when);
        if (fi > 0 && cs + fi > t0) g.gain.linearRampToValueAtTime(vol, at(cs + fi));
        if (fo > 0 && ce - fo > Math.max(t0, cs + fi)) g.gain.setValueAtTime(vol, at(ce - fo));
        if (fo > 0) g.gain.linearRampToValueAtTime(0, at(ce)); else g.gain.setValueAtTime(vol, at(ce));
        let last = src;
        if (clip.voice && clip.voice !== 'off') {
          const f = c.createBiquadFilter(), s = (clip.voiceStr == null ? 50 : clip.voiceStr) / 100;
          if (clip.voice === 'female') { f.type = 'highshelf'; f.frequency.value = 2800; f.gain.value = 4 * s; }
          else { f.type = 'lowshelf'; f.frequency.value = 220; f.gain.value = 5 * s; }
          src.connect(f); last = f;
        }
        last.connect(g); dests.forEach(d => g.connect(d));
        try { src.start(when, off, Math.max(0.01, durSrc)); } catch (e) { continue; }
        nodes.push(src, g);
      }
      return nodes;
    },
    stopNodes(nodes) { (nodes || []).forEach(n => { try { if (n.stop) n.stop(); n.disconnect(); } catch (e) {} }); }
  };
  function rd(x, pos, n) {
    if (pos < 0) return 0;
    const i = pos | 0, f = pos - i; if (i >= n - 1) return x[n - 1] || 0;
    return x[i] * (1 - f) + x[i + 1] * f;
  }
})(window.CB);
