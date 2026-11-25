/* Coffeebreak Vocal Social - 12,000 procedural vocal presets.
   Combinations of voice type, range, style, emotion, effect and pitch.
   Preview and singing use the in-browser Coffeebreak voice; effects are applied to the sung vocal.
*/
(function (root) {
  'use strict';

  var TYPES = ['Bright', 'Warm', 'Velvet', 'Edge'];
  var RANGES = ['Soprano', 'Alto', 'Tenor', 'Baritone'];
  var STYLES = ['Pop', 'Soul', 'Country', 'Rock', 'Jazz'];
  var EMOTIONS = ['Joyful', 'Tender', 'Fierce', 'Dreamy', 'Lonely'];
  var EFFECTS = ['Reverb', 'Echo', 'Harmony', 'Autotune', 'Whisper', 'Belt'];
  var PITCHES = ['Deep', 'Low', 'Natural', 'High', 'Lift'];
  var COUNT = TYPES.length * RANGES.length * STYLES.length * EMOTIONS.length * EFFECTS.length * PITCHES.length;
  var PAGE = 24;
  var STORE = 'cb-vocal-presets-v1';
  var PREVIEW_LYRICS = 'I love this song tonight';

  var RANGE_INFO = {
    Soprano: { gender: 'female', semi: 4, formant: 1.12 },
    Alto: { gender: 'female', semi: 0, formant: 1.02 },
    Tenor: { gender: 'male', semi: 0, formant: 0.92 },
    Baritone: { gender: 'male', semi: -3, formant: 0.84 }
  };
  var PITCH_SEMI = { Deep: -5, Low: -2, Natural: 0, High: 3, Lift: 5 };
  var TYPE_STYLE = {
    Bright: { formant: 1.06, vibrato: 0.85, breath: 0.7, scoop: 0.9, rd: 0, oq: 0.02 },
    Warm: { formant: 0.97, vibrato: 1.0, breath: 1.15, scoop: 1.0, rd: 0, oq: 0 },
    Velvet: { formant: 1.0, vibrato: 1.35, breath: 1.05, scoop: 1.1, rd: -0.05, oq: 0.04 },
    Edge: { formant: 0.95, vibrato: 0.55, breath: 0.5, scoop: 0.7, rd: 0.28, oq: -0.04 }
  };
  var EMOTION_STYLE = {
    Joyful: { vibrato: 1.2, breath: 0.9, scoop: 1.15, rd: 0.04, formant: 1.03 },
    Tender: { vibrato: 0.8, breath: 1.35, scoop: 0.75, rd: -0.08, formant: 1.01 },
    Fierce: { vibrato: 0.55, breath: 0.55, scoop: 0.6, rd: 0.22, formant: 0.98 },
    Dreamy: { vibrato: 1.4, breath: 1.2, scoop: 1.25, rd: -0.04, formant: 1.04 },
    Lonely: { vibrato: 0.9, breath: 1.3, scoop: 0.85, rd: -0.06, formant: 0.98 }
  };

  function dims() {
    return { types: TYPES, ranges: RANGES, styles: STYLES, emotions: EMOTIONS, effects: EFFECTS, pitches: PITCHES };
  }

  function presetAt(i) {
    i = i | 0;
    if (i < 0 || i >= COUNT) return null;
    var n = i;
    var pitchI = n % PITCHES.length; n = (n / PITCHES.length) | 0;
    var effectI = n % EFFECTS.length; n = (n / EFFECTS.length) | 0;
    var emotionI = n % EMOTIONS.length; n = (n / EMOTIONS.length) | 0;
    var styleI = n % STYLES.length; n = (n / STYLES.length) | 0;
    var rangeI = n % RANGES.length; n = (n / RANGES.length) | 0;
    var typeI = n % TYPES.length;
    var type = TYPES[typeI], range = RANGES[rangeI], style = STYLES[styleI];
    var emotion = EMOTIONS[emotionI], effect = EFFECTS[effectI], pitch = PITCHES[pitchI];
    var name = type + ' ' + range + ' ' + style + ' ' + emotion + ' ' + effect + ' ' + pitch;
    var ri = RANGE_INFO[range];
    return {
      id: i,
      name: name,
      type: type,
      range: range,
      style: style,
      emotion: emotion,
      effect: effect,
      pitch: pitch,
      gender: ri.gender,
      pitchSemi: (ri.semi || 0) + (PITCH_SEMI[pitch] || 0)
    };
  }

  function voiceStyle(p) {
    if (!p) return {};
    var a = TYPE_STYLE[p.type] || TYPE_STYLE.Warm;
    var b = EMOTION_STYLE[p.emotion] || EMOTION_STYLE.Joyful;
    var rf = (RANGE_INFO[p.range] || RANGE_INFO.Alto).formant;
    return {
      formant: a.formant * b.formant * rf,
      vibrato: a.vibrato * b.vibrato,
      breath: a.breath * b.breath,
      scoop: a.scoop * b.scoop,
      rd: a.rd + b.rd,
      oq: a.oq || 0
    };
  }

  var selectedId = -1;
  try {
    var saved = root && root.localStorage ? root.localStorage.getItem(STORE) : null;
    if (saved != null && saved !== '') {
      var n = +saved;
      if (n >= 0 && n < COUNT) selectedId = n | 0;
    }
  } catch (e) {}

  function getSelected() { return selectedId >= 0 ? presetAt(selectedId) : null; }
  function selectedName() { var p = getSelected(); return p ? p.name : ''; }
  function setSelected(id) {
    id = id | 0;
    if (id < 0 || id >= COUNT) return getSelected();
    selectedId = id;
    try { if (root && root.localStorage) root.localStorage.setItem(STORE, String(id)); } catch (e) {}
    return presetAt(selectedId);
  }

  function matches(p, q, filters) {
    if (!p) return false;
    filters = filters || {};
    if (filters.type && p.type !== filters.type) return false;
    if (filters.range && p.range !== filters.range) return false;
    if (filters.style && p.style !== filters.style) return false;
    if (filters.emotion && p.emotion !== filters.emotion) return false;
    if (filters.effect && p.effect !== filters.effect) return false;
    if (filters.pitch && p.pitch !== filters.pitch) return false;
    if (q) {
      var hay = p.name.toLowerCase();
      var parts = String(q).toLowerCase().trim().split(/\s+/).filter(Boolean);
      for (var i = 0; i < parts.length; i++) if (hay.indexOf(parts[i]) < 0) return false;
    }
    return true;
  }

  function search(q, filters, page) {
    page = Math.max(0, page | 0);
    var items = [];
    var total = 0;
    var start = page * PAGE;
    var end = start + PAGE;
    for (var i = 0; i < COUNT; i++) {
      var p = presetAt(i);
      if (!matches(p, q, filters)) continue;
      if (total >= start && total < end) items.push(p);
      total++;
    }
    var pages = Math.max(1, Math.ceil(total / PAGE));
    return { items: items, total: total, page: page, pages: pages, pageSize: PAGE };
  }

  function prepareScore(score, preset) {
    preset = preset || getSelected();
    if (!preset || !score || !score.notes) return score;
    var semi = preset.pitchSemi || 0;
    if (!semi) return score;
    for (var i = 0; i < score.notes.length; i++) {
      var n = score.notes[i];
      if (!n || n.rest) continue;
      if (n.pitch != null) n.pitch = +n.pitch + semi;
      if (n.p != null) n.p = +n.p + semi;
    }
    return score;
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function decodeWav(buf) {
    var view = new DataView(buf);
    if (view.byteLength < 44) throw new Error('That vocal could not be read.');
    var ch = view.getUint16(22, true);
    var sr = view.getUint32(24, true);
    var bps = view.getUint16(34, true);
    var off = 12;
    var dataOff = 44, dataLen = view.byteLength - 44;
    while (off + 8 <= view.byteLength) {
      var id = String.fromCharCode(view.getUint8(off), view.getUint8(off + 1), view.getUint8(off + 2), view.getUint8(off + 3));
      var size = view.getUint32(off + 4, true);
      if (id === 'data') { dataOff = off + 8; dataLen = size; break; }
      off += 8 + size + (size % 2);
    }
    var n = (dataLen / (bps / 8) / ch) | 0;
    var channels = [];
    for (var c = 0; c < ch; c++) channels[c] = new Float32Array(n);
    if (bps === 16) {
      for (var i = 0; i < n; i++) {
        for (var c2 = 0; c2 < ch; c2++) {
          var s = view.getInt16(dataOff + (i * ch + c2) * 2, true);
          channels[c2][i] = s / (s < 0 ? 32768 : 32767);
        }
      }
    } else {
      throw new Error('That vocal format cannot be used.');
    }
    return { channels: channels, sr: sr, ch: ch };
  }

  function encodeWav(channels, sr) {
    var ch = channels.length;
    var n = channels[0].length;
    var buf = new ArrayBuffer(44 + n * ch * 2);
    var v = new DataView(buf);
    function ws(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true);
    v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * ch * 2, true);
    for (var i = 0; i < n; i++) {
      for (var c = 0; c < ch; c++) {
        var s = clamp(channels[c][i], -1, 1);
        v.setInt16(44 + (i * ch + c) * 2, s < 0 ? s * 32768 : s * 32767, true);
      }
    }
    return buf;
  }

  function peakOf(channels) {
    var p = 1e-9;
    for (var c = 0; c < channels.length; c++) {
      var a = channels[c];
      for (var i = 0; i < a.length; i++) if (Math.abs(a[i]) > p) p = Math.abs(a[i]);
    }
    return p;
  }

  function normalize(channels, target) {
    var p = peakOf(channels);
    var g = (target || 0.89) / p;
    for (var c = 0; c < channels.length; c++) {
      var a = channels[c];
      for (var i = 0; i < a.length; i++) a[i] *= g;
    }
  }

  function biquad(type, freq, q, gainDb, sr) {
    var f0 = clamp(freq, 20, sr * 0.45);
    var A = Math.pow(10, (gainDb || 0) / 40);
    var w0 = 2 * Math.PI * f0 / sr;
    var cw = Math.cos(w0), sw = Math.sin(w0);
    var alpha = sw / (2 * Math.max(0.1, q || 0.7));
    var b0, b1, b2, a0, a1, a2;
    if (type === 'highpass') {
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else if (type === 'lowshelf') {
      var t = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) - (A - 1) * cw + t); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - t);
      a0 = (A + 1) + (A - 1) * cw + t; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - t;
    } else if (type === 'highshelf') {
      var t2 = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) + (A - 1) * cw + t2); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - t2);
      a0 = (A + 1) - (A - 1) * cw + t2; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - t2;
    } else {
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A;
    }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return function tick(x) {
      var y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    };
  }

  function applyFilter(channels, sr, type, freq, q, gainDb) {
    for (var c = 0; c < channels.length; c++) {
      var f = biquad(type, freq, q, gainDb, sr);
      var a = channels[c];
      for (var i = 0; i < a.length; i++) a[i] = f(a[i]);
    }
  }

  function lerpAt(a, pos) {
    if (pos <= 0) return a[0] || 0;
    if (pos >= a.length - 1) return a[a.length - 1] || 0;
    var i = pos | 0; var f = pos - i;
    return a[i] * (1 - f) + a[i + 1] * f;
  }

  function shiftChannel(src, semi) {
    var ratio = Math.pow(2, semi / 12);
    if (Math.abs(ratio - 1) < 0.0008) return src;
    var hop = 256, grain = 1024;
    var out = new Float32Array(src.length);
    var win = new Float32Array(grain);
    for (var w = 0; w < grain; w++) win[w] = 0.5 - 0.5 * Math.cos(2 * Math.PI * w / (grain - 1));
    var norm = new Float32Array(src.length);
    for (var t = -grain; t < src.length + grain; t += hop) {
      for (var i = 0; i < grain; i++) {
        var oi = t + i;
        if (oi < 0 || oi >= out.length) continue;
        var srcPos = t + (i - grain / 2) * ratio + grain / 2;
        var s = lerpAt(src, srcPos);
        out[oi] += s * win[i];
        norm[oi] += win[i];
      }
    }
    for (var k = 0; k < out.length; k++) if (norm[k] > 1e-6) out[k] /= norm[k];
    return out;
  }

  function copyChannels(channels) {
    var out = [];
    for (var c = 0; c < channels.length; c++) out[c] = new Float32Array(channels[c]);
    return out;
  }

  function toneEQ(channels, sr, p) {
    var typeBoost = { Bright: 3.2, Warm: -0.4, Velvet: 1.2, Edge: 2.4 };
    var lowBoost = { Bright: -2.0, Warm: 2.2, Velvet: 0.6, Edge: -1.2 };
    applyFilter(channels, sr, 'lowshelf', 180, 0.7, lowBoost[p.type] || 0);
    applyFilter(channels, sr, 'peaking', p.type === 'Bright' ? 3500 : 2800, 1.0, typeBoost[p.type] || 0);
    if (p.style === 'Pop') applyFilter(channels, sr, 'highshelf', 7000, 0.7, 2.0);
    if (p.style === 'Soul') applyFilter(channels, sr, 'peaking', 420, 0.9, 1.8);
    if (p.style === 'Country') applyFilter(channels, sr, 'peaking', 2200, 1.1, 2.4);
    if (p.style === 'Rock') applyFilter(channels, sr, 'peaking', 1800, 0.8, 2.8);
    if (p.style === 'Jazz') applyFilter(channels, sr, 'highshelf', 8000, 0.7, 1.6);
    if (p.emotion === 'Tender' || p.emotion === 'Lonely') applyFilter(channels, sr, 'lowshelf', 250, 0.7, -1.5);
    if (p.emotion === 'Fierce') applyFilter(channels, sr, 'peaking', 2400, 0.9, 2.6);
    if (p.emotion === 'Dreamy') applyFilter(channels, sr, 'highshelf', 6500, 0.7, 1.8);
  }

  function fxReverb(channels, sr, wet, decay) {
    wet = wet == null ? 0.34 : wet;
    decay = decay == null ? 0.72 : decay;
    var delays = [0.0179, 0.0263, 0.0317, 0.0409, 0.0531, 0.0677, 0.0793, 0.0971];
    var damp = Math.exp(-2 * Math.PI * 3800 / sr);
    for (var c = 0; c < channels.length; c++) {
      var src = channels[c];
      var n = src.length;
      var acc = new Float32Array(n);
      for (var d = 0; d < delays.length; d++) {
        var len = Math.max(2, Math.round((delays[d] + c * 0.0021) * sr));
        var buf = new Float32Array(len);
        var bi = 0, y = 0, lp = 0;
        for (var i = 0; i < n; i++) {
          y = buf[bi];
          lp = damp * lp + (1 - damp) * y;
          buf[bi] = src[i] + lp * decay;
          acc[i] += lp;
          bi++; if (bi >= len) bi = 0;
        }
      }
      var g = wet / delays.length;
      var dry = 1 - wet * 0.42;
      for (var k = 0; k < n; k++) src[k] = src[k] * dry + acc[k] * g;
    }
  }

  function fxEcho(channels, sr) {
    var delay = Math.round(0.29 * sr);
    var fb = 0.42;
    for (var c = 0; c < channels.length; c++) {
      var src = channels[c];
      var n = src.length;
      var off = c ? Math.round(0.03 * sr) : 0;
      var out = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var e = i >= delay + off ? out[i - delay - off] * fb : 0;
        var e2 = i >= delay * 2 + off ? src[i - delay * 2 - off] * fb * 0.45 : 0;
        out[i] = src[i] + e + e2;
      }
      channels[c] = out;
    }
  }

  function fxHarmony(channels, sr) {
    var lag = Math.max(1, Math.round(0.016 * sr));
    for (var c = 0; c < channels.length; c++) {
      var src = channels[c];
      var fifth = shiftChannel(src, 6.96);
      var third = shiftChannel(src, 3.9);
      var low = shiftChannel(src, -11.9);
      var out = new Float32Array(src.length);
      for (var i = 0; i < src.length; i++) {
        var h = i >= lag ? i - lag : 0;
        out[i] = src[i] * 0.7 + fifth[h] * 0.2 + third[h] * 0.15 + low[h] * 0.12;
      }
      channels[c] = out;
    }
  }

  function fxAutotune(channels, sr) {
    var hop = Math.max(64, Math.round(sr * 0.02));
    var grain = hop * 3;
    for (var c = 0; c < channels.length; c++) {
      var src = channels[c];
      var out = new Float32Array(src.length);
      var win = new Float32Array(grain);
      for (var w = 0; w < grain; w++) win[w] = 0.5 - 0.5 * Math.cos(2 * Math.PI * w / (grain - 1));
      var norm = new Float32Array(src.length);
      for (var t = 0; t < src.length; t += hop) {
        var slice = src.subarray(t, Math.min(src.length, t + grain));
        var period = 0, best = 0;
        var minL = Math.round(sr / 500), maxL = Math.round(sr / 80);
        maxL = Math.min(maxL, slice.length - 2);
        for (var lag = minL; lag < maxL; lag++) {
          var corr = 0;
          for (var k = 0; k + lag < slice.length; k += 2) corr += slice[k] * slice[k + lag];
          if (corr > best) { best = corr; period = lag; }
        }
        var ratio = 1;
        if (period > 0) {
          var hz = sr / period;
          var midi = 69 + 12 * Math.log(hz / 440) / Math.log(2);
          var snapped = Math.round(midi);
          ratio = Math.pow(2, (midi - snapped) / 12);
          ratio = clamp(ratio, 0.94, 1.06);
        }
        for (var i = 0; i < grain; i++) {
          var oi = t + i;
          if (oi >= out.length) break;
          var s = lerpAt(src, t + i * ratio);
          out[oi] += s * win[i];
          norm[oi] += win[i];
        }
      }
      for (var j = 0; j < out.length; j++) src[j] = norm[j] > 1e-6 ? out[j] / norm[j] : src[j];
      applyFilter(channels.slice(c, c + 1), sr, 'peaking', 1600, 1.1, 1.1);
    }
  }

  function fxWhisper(channels, sr, seed) {
    applyFilter(channels, sr, 'highpass', 700, 0.7, 0);
    applyFilter(channels, sr, 'lowshelf', 300, 0.7, -8);
    var s = (seed * 9973 + 13) >>> 0;
    function rnd() { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return (s / 4294967296) * 2 - 1; }
    for (var c = 0; c < channels.length; c++) {
      var a = channels[c];
      var env = 0;
      var atk = Math.exp(-1 / (sr * 0.01));
      var rel = Math.exp(-1 / (sr * 0.08));
      var lp = 0;
      for (var i = 0; i < a.length; i++) {
        var x = Math.abs(a[i]);
        env = x > env ? env * atk + x * (1 - atk) : env * rel + x * (1 - rel);
        var n = rnd();
        lp = lp * 0.6 + n * 0.4;
        a[i] = a[i] * 0.45 + lp * env * 0.85;
      }
    }
    applyFilter(channels, sr, 'highshelf', 6000, 0.7, 3.5);
  }

  function fxBelt(channels, sr) {
    applyFilter(channels, sr, 'peaking', 2800, 1.0, 4.8);
    applyFilter(channels, sr, 'lowshelf', 200, 0.7, 1.6);
    var th = 0.12, ratio = 3.2;
    for (var c = 0; c < channels.length; c++) {
      var a = channels[c];
      var env = 0;
      var atk = Math.exp(-1 / (sr * 0.005));
      var rel = Math.exp(-1 / (sr * 0.08));
      for (var i = 0; i < a.length; i++) {
        var x = a[i], ax = Math.abs(x);
        env = ax > env ? env * atk + ax * (1 - atk) : env * rel + ax * (1 - rel);
        var g = 1;
        if (env > th) g = (th + (env - th) / ratio) / env;
        var y = x * g * 1.35;
        a[i] = Math.tanh(y * 1.6) * 0.92;
      }
    }
  }

  function applyEffect(channels, sr, p) {
    if (p.effect === 'Reverb') fxReverb(channels, sr, p.emotion === 'Dreamy' ? 0.52 : 0.36, p.emotion === 'Dreamy' ? 0.9 : 0.84);
    else if (p.effect === 'Echo') fxEcho(channels, sr);
    else if (p.effect === 'Harmony') fxHarmony(channels, sr);
    else if (p.effect === 'Autotune') fxAutotune(channels, sr);
    else if (p.effect === 'Whisper') fxWhisper(channels, sr, p.id);
    else if (p.effect === 'Belt') fxBelt(channels, sr);
  }

  function processSungWav(bytes, preset) {
    preset = preset || getSelected();
    if (!preset || !bytes) return bytes;
    var wav = decodeWav(bytes);
    var channels = copyChannels(wav.channels);
    toneEQ(channels, wav.sr, preset);
    applyEffect(channels, wav.sr, preset);
    if (preset.effect !== 'Reverb') fxReverb(channels, wav.sr, 0.16, 0.62);
    normalize(channels, 0.89);
    return encodeWav(channels, wav.sr);
  }

  function processSungWavMaybe(bytes, opts) {
    var p = (opts && opts.vocalPreset) || getSelected();
    if (!p) return bytes;
    try { return processSungWav(bytes, p); } catch (err) { if (root && root.console) root.console.warn('vocal preset effect failed', err); return bytes; }
  }

  function previewScore(text, preset) {
    var words = String(text || PREVIEW_LYRICS).trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) words = PREVIEW_LYRICS.split(' ');
    var notes = [];
    var t = 0.06;
    var melody = [0, 2, 4, 5, 4, 2, 0, -2];
    for (var i = 0; i < words.length; i++) {
      var p = 62 + melody[i % melody.length];
      notes.push({ w: words[i], text: words[i], p: p, pitch: p, t: t, d: 0.34, duration: 0.34 });
      t += 0.38;
    }
    var score = { notes: notes, seconds: t + 0.25 };
    prepareScore(score, preset);
    return score;
  }

  function previewWav(preset, lyrics) {
    preset = preset || getSelected();
    if (!preset) throw new Error('Pick a vocal first.');
    var voice = root && root.CBVoice;
    if (!voice || typeof voice.sing !== 'function') throw new Error('The Coffeebreak voice is not ready yet.');
    var score = previewScore(lyrics || PREVIEW_LYRICS, preset);
    var wav = voice.sing(score, { seed: preset.id + 17, style: voiceStyle(preset) });
    if (!wav || wav.byteLength < 100) throw new Error('That vocal preview was silent.');
    return processSungWav(wav, preset);
  }

  var api = {
    COUNT: COUNT,
    PAGE: PAGE,
    PREVIEW_LYRICS: PREVIEW_LYRICS,
    dims: dims,
    presetAt: presetAt,
    search: search,
    getSelected: getSelected,
    setSelected: setSelected,
    selectedName: selectedName,
    voiceStyle: voiceStyle,
    prepareScore: prepareScore,
    processSungWav: processSungWav,
    processSungWavMaybe: processSungWavMaybe,
    previewScore: previewScore,
    previewWav: previewWav
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CBVocals = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
