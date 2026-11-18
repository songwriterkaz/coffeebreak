/* Coffeebreak neural singer.
   Speaks each lyric word with the free, open Piper voice (MIT, runs in this browser with onnxruntime-web),
   then tunes and stretches each word to the melody with pitch-synchronous overlap-add (PSOLA).
   No paid service and no key. The voice model is downloaded once from Hugging Face and kept in the browser cache. */
(function (root) {
  'use strict';
  var ORT_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/';
  var PH_BASE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';
  var HF = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main/';
  var VOICES = {
    female: 'en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx',
    male: 'en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx'
  };
  var CACHE = 'cb-neural-voice-v1';
  var here = (function () {
    try { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^/]*$/, '') : ''; } catch (e) { return ''; }
  })();
  var sessions = {};

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    });
  }

  async function cachedBytes(url, onProgress) {
    var cache = null;
    try { cache = await caches.open(CACHE); var hit = await cache.match(url); if (hit) return await hit.arrayBuffer(); } catch (e) { cache = null; }
    var res = await fetch(url);
    if (!res.ok) throw new Error('Voice download failed (' + res.status + ').');
    var total = +(res.headers.get('Content-Length') || 0);
    var buf;
    if (res.body && res.body.getReader && onProgress) {
      var reader = res.body.getReader(); var chunks = []; var got = 0;
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        chunks.push(r.value); got += r.value.length;
        onProgress(got, total);
      }
      var all = new Uint8Array(got); var o = 0;
      chunks.forEach(function (c) { all.set(c, o); o += c.length; });
      buf = all.buffer;
    } else {
      buf = await res.arrayBuffer();
    }
    if (cache) { try { await cache.put(url, new Response(buf.slice(0), { headers: { 'Content-Type': 'application/octet-stream' } })); } catch (e) {} }
    return buf;
  }

  async function ready(kind, onStatus) {
    kind = VOICES[kind] ? kind : 'female';
    if (sessions[kind]) return sessions[kind];
    sessions[kind] = (async function () {
      if (!root.ort) await loadScript(ORT_BASE + 'ort.wasm.min.js');
      if (!root.createPiperPhonemize) await loadScript(here + 'piper-phonemize.js');
      var ort = root.ort;
      ort.env.wasm.wasmPaths = ORT_BASE;
      ort.env.wasm.numThreads = 1;
      var path = HF + VOICES[kind];
      var cfg = JSON.parse(new TextDecoder().decode(await cachedBytes(path + '.json')));
      var model = await cachedBytes(path, function (got, total) {
        if (onStatus && total) onStatus('Downloading the singing voice, ' + Math.round(got * 100 / total) + '%. This happens once per device.');
      });
      if (onStatus) onStatus('Warming up the singing voice.');
      var session = await ort.InferenceSession.create(model, { executionProviders: ['wasm'] });
      return { ort: ort, cfg: cfg, session: session, sr: cfg.audio.sample_rate };
    })();
    try { return await sessions[kind]; } catch (err) { sessions[kind] = null; throw err; }
  }

  function phonemeIds(text, cfg) {
    return new Promise(function (resolve, reject) {
      var done = false;
      root.createPiperPhonemize({
        print: function (data) { if (!done) { done = true; try { resolve(JSON.parse(data).phoneme_ids); } catch (e) { reject(e); } } },
        printErr: function (m) { if (!done && /error/i.test(String(m))) { done = true; reject(new Error(String(m))); } },
        locateFile: function (u) { return u.endsWith('.wasm') ? PH_BASE + '.wasm' : u.endsWith('.data') ? PH_BASE + '.data' : u; }
      }).then(function (mod) {
        mod.callMain(['-l', cfg.espeak.voice, '--input', JSON.stringify([{ text: text }]), '--espeak_data', '/espeak-ng-data']);
      }, reject);
    });
  }

  function splitWords(ids) {
    var inner = ids.slice(0);
    if (inner[0] === 1) inner = inner.slice(1);
    if (inner[0] === 0) inner = inner.slice(1);
    if (inner[inner.length - 1] === 2) inner = inner.slice(0, -1);
    var words = []; var cur = [];
    for (var i = 0; i < inner.length; i++) {
      if (inner[i] === 3) { if (cur.length) words.push(cur); cur = []; if (inner[i + 1] === 0) i++; continue; }
      cur.push(inner[i]);
    }
    if (cur.length) words.push(cur);
    return words.map(function (w) {
      w = w.filter(function (x, i) { return !(x === 0 && i === 0); });
      if (w[w.length - 1] !== 0) w.push(0);
      return [1, 0].concat(w, [2]);
    });
  }

  async function speak(v, ids, lengthScale) {
    var T = v.ort.Tensor;
    var inf = v.cfg.inference || {};
    var feeds = {
      input: new T('int64', BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
      input_lengths: new T('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
      scales: new T('float32', Float32Array.from([inf.noise_scale == null ? 0.667 : inf.noise_scale, lengthScale, inf.noise_w == null ? 0.8 : inf.noise_w]), [3])
    };
    if (v.cfg.speaker_id_map && Object.keys(v.cfg.speaker_id_map).length) feeds.sid = new T('int64', BigInt64Array.from([0n]), [1]);
    var out = await v.session.run(feeds);
    return Float32Array.from(out.output.data);
  }

  /* ---------- DSP ---------- */
  function trimSilence(x, sr) {
    var win = Math.round(sr * 0.01); var peak = 0;
    for (var i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
    var th = peak * 0.04; var a = 0; var b = x.length;
    while (a < x.length && Math.abs(x[a]) < th) a++;
    while (b > a && Math.abs(x[b - 1]) < th) b--;
    a = Math.max(0, a - win); b = Math.min(x.length, b + win * 2);
    return x.subarray(a, b);
  }

  function analyse(x, sr) {
    var hop = Math.round(sr * 0.005), W = Math.round(sr * 0.035);
    var minLag = Math.floor(sr / 450), maxLag = Math.ceil(sr / 75);
    var frames = []; var peak = 1e-9;
    for (var k = 0; k < x.length; k++) peak = Math.max(peak, Math.abs(x[k]));
    for (var c = 0; c < x.length; c += hop) {
      var s = Math.max(0, c - (W >> 1)), e = Math.min(x.length, s + W);
      var en = 0; for (var i = s; i < e; i++) en += x[i] * x[i];
      var rms = Math.sqrt(en / Math.max(1, e - s));
      var best = 0, bestLag = 0;
      if (rms > peak * 0.03 && e - s > maxLag + 8) {
        for (var lag = minLag; lag <= maxLag; lag++) {
          var num = 0, d1 = 0, d2 = 0;
          for (var j = s; j + lag < e; j++) { num += x[j] * x[j + lag]; d1 += x[j] * x[j]; d2 += x[j + lag] * x[j + lag]; }
          var r = num / Math.sqrt(d1 * d2 + 1e-12);
          if (r > best) { best = r; bestLag = lag; }
        }
      }
      frames.push({ c: c, voiced: best > 0.55, P: bestLag || Math.round(sr * 0.005) });
    }
    /* smooth voicing: remove isolated flips */
    for (var f = 1; f < frames.length - 1; f++) {
      if (frames[f - 1].voiced === frames[f + 1].voiced && frames[f].voiced !== frames[f - 1].voiced) {
        frames[f].voiced = frames[f - 1].voiced; if (frames[f].voiced) frames[f].P = frames[f - 1].P;
      }
    }
    return { hop: hop, frames: frames };
  }

  function frameAt(an, t) { var i = Math.max(0, Math.min(an.frames.length - 1, Math.round(t / an.hop))); return an.frames[i]; }

  function marks(x, an, sr) {
    var out = []; var t = 0;
    while (t < x.length) {
      var f = frameAt(an, t);
      if (f.voiced) {
        var P = f.P; var a = Math.round(t + 0.75 * P), b = Math.min(x.length - 1, Math.round(t + 1.25 * P));
        if (a >= x.length) break;
        var bi = a, bv = -1;
        for (var i = a; i <= b; i++) { if (x[i] > bv) { bv = x[i]; bi = i; } }
        if (!out.length || !out[out.length - 1].v) { /* first voiced mark: snap to local max */ bi = Math.round(t + P * 0.5); }
        out.push({ pos: bi, P: P, v: true }); t = bi;
      } else {
        var h = Math.round(sr * 0.005);
        out.push({ pos: Math.round(t + h), P: h, v: false }); t += h;
      }
    }
    return out;
  }

  /* Map output sample -> input sample, stretching voiced parts more than consonants. */
  function timeMap(an, inLen, outLen) {
    var V = 0, U = 0;
    an.frames.forEach(function (f) { if (f.voiced) V += an.hop; else U += an.hop; });
    var su = 1, sv;
    if (outLen <= U || V < an.hop * 2) { su = sv = outLen / Math.max(1, inLen); }
    else { sv = (outLen - U) / V; if (sv < 0.6) { su = sv = outLen / inLen; } }
    var outT = [0];
    an.frames.forEach(function (f) { outT.push(outT[outT.length - 1] + an.hop * (f.voiced ? sv : su)); });
    return function (to) {
      var lo = 0, hi = outT.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (outT[m] <= to) lo = m; else hi = m; }
      var span = outT[hi] - outT[lo] || 1;
      return Math.min(inLen - 1, (lo + (to - outT[lo]) / span) * an.hop);
    };
  }

  function psola(x, sr, outLen, f0At) {
    var an = analyse(x, sr);
    var mk = marks(x, an, sr);
    if (!mk.length) return new Float32Array(outLen);
    var map = timeMap(an, x.length, outLen);
    var y = new Float32Array(outLen + 2048);
    var t = 0; var mi = 0;
    while (t < outLen) {
      var tin = map(t);
      while (mi < mk.length - 1 && Math.abs(mk[mi + 1].pos - tin) <= Math.abs(mk[mi].pos - tin)) mi++;
      while (mi > 0 && Math.abs(mk[mi - 1].pos - tin) < Math.abs(mk[mi].pos - tin)) mi--;
      var m = mk[mi];
      var half = m.v ? m.P : m.P * 2;
      var gain = m.v ? 1 : 0.5;
      for (var k = -half; k < half; k++) {
        var si = m.pos + k, oi = Math.round(t) + k;
        if (si < 0 || si >= x.length || oi < 0 || oi >= y.length) continue;
        var w = 0.5 + 0.5 * Math.cos(Math.PI * k / half);
        y[oi] += x[si] * w * gain;
      }
      if (m.v) t += sr / f0At(t / sr); else t += m.P;
    }
    return y.subarray(0, outLen);
  }

  /* gentle vocal polish: high-pass, presence lift, soft saturation */
  function polish(y, sr) {
    var hp = 0, prev = 0, a = Math.exp(-2 * Math.PI * 90 / sr);
    for (var i = 0; i < y.length; i++) { var v = y[i]; hp = a * (hp + v - prev); prev = v; y[i] = Math.tanh(hp * 1.4) / 1.4; }
    return y;
  }

  function fold(p, lo, hi) { p = p | 0; while (p < lo) p += 12; while (p > hi) p -= 12; return p; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function encodeWav(mono, sr) {
    var n = mono.length; var buf = new ArrayBuffer(44 + n * 2); var v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) { var s = Math.max(-1, Math.min(1, mono[i])); v.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true); }
    return buf;
  }

  function cleanWord(w) { return String(w || '').replace(/[^A-Za-z0-9'’\-]/g, '').replace(/’/g, "'"); }

  /* score: { notes: [{text, pitch, duration, rest}] } from CBCore.buildScore */
  async function sing(score, opts) {
    opts = opts || {};
    var onStatus = opts.onStatus;
    var v = await ready(opts.voice || 'female', onStatus);
    var sr = v.sr;
    var lo = opts.voice === 'male' ? 45 : 57, hi = opts.voice === 'male' ? 62 : 74;
    var notes = (score && score.notes) || [];
    var sungNotes = notes.filter(function (n) { return !n.rest && cleanWord(n.text); });
    if (sungNotes.length < 1) throw new Error('Write at least two words to sing.');
    if (onStatus) onStatus('Reading the lyrics.');
    var ids = await phonemeIds(sungNotes.map(function (n) { return cleanWord(n.text); }).join(' '), v.cfg);
    var groups = splitWords(ids);
    if (groups.length !== sungNotes.length) {
      groups = [];
      for (var g = 0; g < sungNotes.length; g++) groups.push(splitWords(await phonemeIds(cleanWord(sungNotes[g].text), v.cfg))[0] || [1, 0, 2]);
    }
    var pieces = []; var gi = 0; var t = 0.35; var prevMidi = null;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      if (n.rest || !cleanWord(n.text)) { t += Math.max(0.12, +n.duration || 0.28); prevMidi = null; continue; }
      var wid = groups[gi++];
      if (onStatus) onStatus('Singing word ' + gi + ' of ' + sungNotes.length + '.');
      var target = Math.max(0.24, +n.duration || 0.4) * (opts.stretch || 1.25);
      var nph = Math.max(1, (wid.length - 3) / 2);
      var ls = Math.max(0.95, Math.min(1.9, target / (nph * 0.075)));
      var raw = trimSilence(await speak(v, wid, ls), sr);
      var dur = Math.max(target, raw.length / sr * 0.8);
      var midi = fold(n.pitch, lo, hi);
      var from = prevMidi == null ? midi - 1 : prevMidi;
      (function (midi, from) {
        var f0At = function (tt) {
          var glide = Math.min(1, tt / 0.07);
          var m = from + (midi - from) * (glide * glide * (3 - 2 * glide));
          var vib = tt > 0.22 ? 0.28 * Math.sin(2 * Math.PI * 5.4 * tt) * Math.min(1, (tt - 0.22) / 0.2) : 0;
          return hz(m + vib);
        };
        pieces.push({ t: t, y: psola(raw, sr, Math.round(dur * sr), f0At) });
      })(midi, from);
      prevMidi = midi;
      t += dur + 0.02;
      await new Promise(function (r) { setTimeout(r, 0); });
    }
    var total = Math.ceil((t + 1.2) * sr);
    var mix = new Float32Array(total);
    pieces.forEach(function (p) {
      var y = p.y; var s0 = Math.round(p.t * sr); var fade = Math.round(sr * 0.012);
      var rms = 0; for (var k = 0; k < y.length; k++) rms += y[k] * y[k]; rms = Math.sqrt(rms / Math.max(1, y.length)) || 1;
      var g = Math.min(4, 0.16 / rms);
      for (var k2 = 0; k2 < y.length && s0 + k2 < total; k2++) {
        var e = Math.min(1, k2 / fade, (y.length - k2) / fade);
        mix[s0 + k2] += y[k2] * g * e;
      }
    });
    polish(mix, sr);
    /* short slap and room so it sits like a sung vocal */
    var d1 = Math.round(sr * 0.11), d2 = Math.round(sr * 0.23);
    var wet = new Float32Array(total);
    for (var q = 0; q < total; q++) wet[q] = mix[q] + (q >= d1 ? 0.18 * wet[q - d1] : 0) + (q >= d2 ? 0.1 * mix[q - d2] : 0);
    var peak = 1e-9; for (var z = 0; z < total; z++) peak = Math.max(peak, Math.abs(wet[z]));
    var norm = 0.89 / peak; for (var z2 = 0; z2 < total; z2++) wet[z2] *= norm;
    return encodeWav(wet, sr);
  }

  var api = { sing: sing, ready: ready, name: 'Coffeebreak neural singer (Piper voice, tuned to the melody)' };
  root.CBNeuralSing = api;
})(typeof window !== 'undefined' ? window : globalThis);
