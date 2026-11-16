/* Vendored from cb-voice/voice.js at fd9598478a53eb824fa14919b5074174448bb205 (Rename Coffeebreak Vocal Studio and sing with the shared in-browser voice). This copy is frozen so later shared-voice changes do not affect this app. */
/* Coffeebreak voice - a sung vocal made in the browser.
   LF glottal source, formants, human pitch, breath and reverb.
   No outside service is used.
*/
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CBVoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SR = 44100;

  const VOWELS = {
    i: [310, 2250, 2960, 3450],
    I: [400, 1980, 2560, 3300],
    e: [460, 1880, 2650, 3400],
    E: [560, 1700, 2500, 3400],
    a: [760, 1220, 2520, 3400],
    o: [500, 840, 2620, 3350],
    u: [350, 760, 2380, 3300],
    '@': [520, 1480, 2480, 3300],
    r: [480, 1180, 1580, 2800]
  };

  const BW = [80, 110, 150, 200];

  function midiHz(p) {
    return 440 * Math.pow(2, (p - 69) / 12);
  }

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function mulberry(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function vowelOf(word) {
    const w = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return ['@', '@'];
    if (/igh|ie$|ye$|y$/.test(w) && !/ey$/.test(w)) return ['a', 'i'];
    if (/ay|ai|ei|ey/.test(w)) return ['e', 'I'];
    if (/oy|oi/.test(w)) return ['o', 'I'];
    if (/(ow|ou|au)(?!gh)/.test(w) && !/ough/.test(w)) return ['a', 'u'];
    if (/oo|ew|ue|ui/.test(w)) return ['u', 'u'];
    if (/ee|ea/.test(w)) return ['i', 'i'];
    if (/oa|oe/.test(w)) return ['o', 'o'];
    if (/ar/.test(w)) return ['a', 'a'];
    if (/or|aw/.test(w)) return ['o', 'o'];
    if (/er|ir|ur|re$/.test(w)) return ['@', 'r'];
    if (/[aeiou][bcdfghjklmnpqrstvwxyz]e$/.test(w) && w.length > 2) {
      const q = w[w.length - 3];
      if (q === 'a') return ['e', 'I'];
      if (q === 'i') return ['i', 'i'];
      if (q === 'o') return ['o', 'u'];
      if (q === 'u') return ['u', 'u'];
    }
    const letters = w.match(/[aeiouy]/g);
    const last = letters ? letters[letters.length - 1] : '@';
    const map = { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', y: 'i' };
    const v = map[last] || '@';
    return [v, v];
  }

  function onsetOf(word) {
    const w = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return '';
    if (w.startsWith('ch')) return 'ch';
    if (w.startsWith('shr') || w.startsWith('sh')) return 'sh';
    if (w.startsWith('th')) return 'th';
    if (w.startsWith('ph') || w[0] === 'f') return 'f';
    if (w.startsWith('wh') || w[0] === 'w') return 'w';
    if (w[0] === 's' || (w[0] === 'c' && 'eiy'.indexOf(w[1] || '') >= 0)) return 's';
    if (w[0] === 'h') return 'h';
    if (w[0] === 'p') return 'p';
    if (w[0] === 't') return 't';
    if (w[0] === 'k' || w[0] === 'q' || (w[0] === 'c' && 'eiy'.indexOf(w[1] || '') < 0)) return 'k';
    if (w[0] === 'b') return 'b';
    if (w[0] === 'd') return 'd';
    if (w[0] === 'g') return 'g';
    if (w[0] === 'm' || w[0] === 'n') return 'nasal';
    if (w[0] === 'l') return 'l';
    if (w[0] === 'r') return 'r';
    if (w[0] === 'y') return 'y';
    if (w[0] === 'v' || w[0] === 'z') return 'vz';
    if (w[0] === 'j') return 'j';
    return '';
  }

  function codaOf(word) {
    const w = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return '';
    if (/ss$|s$|ce$|se$/.test(w) && !/ous$/.test(w)) return 's';
    if (/ch$/.test(w)) return 'ch';
    if (/sh$|ge$|dge$/.test(w)) return 'sh';
    if (/p$/.test(w)) return 'p';
    if (/t$/.test(w)) return 't';
    if (/k$|ck$|q$/.test(w)) return 'k';
    if (/[mn]$|ng$/.test(w)) return 'nasal';
    if (/[l]$/.test(w)) return 'l';
    return '';
  }

  function resonator(freq, bw, sr) {
    const st = { a1: 0, a2: 0, g: 1, y1: 0, y2: 0 };
    function set(f, b) {
      f = clamp(f, 40, sr * 0.45);
      b = clamp(b, 20, 800);
      const r = Math.exp(-Math.PI * b / sr);
      st.a1 = 2 * r * Math.cos(2 * Math.PI * f / sr);
      st.a2 = -r * r;
      st.g = 1 - r;
    }
    set(freq, bw);
    return {
      set: set,
      tick: function (x) {
        const y = st.g * x + st.a1 * st.y1 + st.a2 * st.y2;
        st.y2 = st.y1;
        st.y1 = y;
        return y;
      }
    };
  }

  function makeLF(te, tp, ta) {
    te = clamp(te, 0.45, 0.86);
    tp = clamp(tp, 0.22, te - 0.04);
    ta = clamp(ta, 0.01, 0.12);
    const w = Math.PI / tp;
    const eps = 1 / ta;
    const tret = 1 - te;
    const ed = Math.exp(-eps * tret);
    const retArea = -1 / eps + ed * tret / Math.max(1e-9, 1 - ed);
    function e0(a) {
      const s = Math.exp(a * te) * Math.sin(w * te);
      return Math.abs(s) < 1e-9 ? 0 : -1 / s;
    }
    function openArea(a) {
      const E0 = e0(a);
      const den = a * a + w * w;
      const atTe = Math.exp(a * te) * (a * Math.sin(w * te) - w * Math.cos(w * te));
      const at0 = -w;
      return E0 * (atTe - at0) / den;
    }
    let a = 3.2;
    for (let i = 0; i < 14; i++) {
      const f = openArea(a) + retArea;
      const da = 1e-4;
      const fp = (openArea(a + da) + retArea - f) / da;
      if (Math.abs(fp) < 1e-12) break;
      a -= f / fp;
      a = clamp(a, 0.15, 18);
    }
    const E0 = e0(a);
    const den = Math.max(1e-9, 1 - ed);
    return function lf(phase) {
      if (phase < 0) phase = 0;
      if (phase >= 1) phase -= Math.floor(phase);
      if (phase < te) return E0 * Math.exp(a * phase) * Math.sin(w * phase);
      return -(Math.exp(-eps * (phase - te)) - ed) / den;
    };
  }

  function encodeWav(left, right, sr) {
    const n = left.length;
    const ch = right ? 2 : 1;
    const data = n * ch * 2;
    const buf = new ArrayBuffer(44 + data);
    const v = new DataView(buf);
    function wstr(o, s) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    wstr(0, 'RIFF');
    v.setUint32(4, 36 + data, true);
    wstr(8, 'WAVE');
    wstr(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, ch, true);
    v.setUint32(24, sr, true);
    v.setUint32(28, sr * ch * 2, true);
    v.setUint16(32, ch * 2, true);
    v.setUint16(34, 16, true);
    wstr(36, 'data');
    v.setUint32(40, data, true);
    let o = 44;
    for (let i = 0; i < n; i++) {
      const l = clamp(left[i], -1, 1);
      v.setInt16(o, l < 0 ? l * 32768 : l * 32767, true);
      o += 2;
      if (ch === 2) {
        const r = clamp(right[i], -1, 1);
        v.setInt16(o, r < 0 ? r * 32768 : r * 32767, true);
        o += 2;
      }
    }
    return buf;
  }

  function decodeMono(arrayBuffer) {
    const v = new DataView(arrayBuffer);
    let offset = 12;
    let sr = 44100;
    let ch = 1;
    let bits = 16;
    let samples = new Float32Array(0);
    while (offset + 8 <= v.byteLength) {
      const id = String.fromCharCode(v.getUint8(offset), v.getUint8(offset + 1), v.getUint8(offset + 2), v.getUint8(offset + 3));
      const size = v.getUint32(offset + 4, true);
      if (id === 'fmt ') {
        ch = v.getUint16(offset + 10, true) || 1;
        sr = v.getUint32(offset + 12, true) || sr;
        bits = v.getUint16(offset + 22, true) || 16;
      }
      if (id === 'data') {
        const count = Math.floor(size / (bits / 8) / ch);
        samples = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          let s = 0;
          for (let c = 0; c < ch; c++) {
            const o = offset + 8 + (i * ch + c) * (bits / 8);
            s += bits === 16 ? v.getInt16(o, true) / 32768 : v.getFloat32(o, true);
          }
          samples[i] = s / ch;
        }
        break;
      }
      offset += 8 + size + (size & 1);
    }
    return { samples: samples, sampleRate: sr };
  }

  function peakOf(samples) {
    let p = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = Math.abs(samples[i]);
      if (a > p) p = a;
    }
    return p;
  }

  function detectPitch(samples, sr, minHz, maxHz) {
    minHz = minHz || 80;
    maxHz = maxHz || 900;
    const start = Math.floor(samples.length * 0.28);
    const end = Math.floor(samples.length * 0.78);
    const minLag = Math.max(2, Math.floor(sr / maxHz));
    const maxLag = Math.min(end - start - 2, Math.floor(sr / minHz));
    let best = 0;
    let bestLag = minLag;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      let norm = 0;
      for (let i = start; i + lag < end; i++) {
        sum += samples[i] * samples[i + lag];
        norm += samples[i] * samples[i];
      }
      const c = norm > 0 ? sum / norm : 0;
      if (c > best) {
        best = c;
        bestLag = lag;
      }
    }
    let lag = bestLag;
    if (lag > minLag && lag < maxLag) {
      const c0 = corrAt(samples, start, end, lag - 1);
      const c1 = corrAt(samples, start, end, lag);
      const c2 = corrAt(samples, start, end, lag + 1);
      const den = (c0 - 2 * c1 + c2);
      if (Math.abs(den) > 1e-9) lag = lag + (c0 - c2) / (2 * den);
    }
    return { hz: sr / lag, corr: best };
  }

  function corrAt(samples, start, end, lag) {
    let sum = 0;
    let norm = 0;
    for (let i = start; i + lag < end; i++) {
      sum += samples[i] * samples[i + lag];
      norm += samples[i] * samples[i];
    }
    return norm > 0 ? sum / norm : 0;
  }

  function makeCombs(sr) {
    const times = [0.0297, 0.0371, 0.0411, 0.0437, 0.0313, 0.0393, 0.0437, 0.0461];
    return times.map(function (t, i) {
      const n = Math.max(2, Math.round(t * sr));
      return { buf: new Float32Array(n), i: 0, fb: 0.74 + (i % 2) * 0.04, damp: 0.2, lp: 0 };
    });
  }

  function tickComb(c, x) {
    const y = c.buf[c.i];
    c.lp += c.damp * (y - c.lp);
    c.buf[c.i] = x + c.lp * c.fb;
    c.i++;
    if (c.i >= c.buf.length) c.i = 0;
    return y;
  }

  function makeAllpass(sr, time, g) {
    const n = Math.max(2, Math.round(time * sr));
    return { buf: new Float32Array(n), i: 0, g: g };
  }

  function tickAllpass(a, x) {
    const d = a.buf[a.i];
    const y = -a.g * x + d;
    a.buf[a.i] = x + a.g * d;
    a.i++;
    if (a.i >= a.buf.length) a.i = 0;
    return y;
  }


  function normalizeNotes(score) {
    const raw = (score && score.notes) || [];
    const out = [];
    let t = 0;
    for (let i = 0; i < raw.length; i++) {
      const n = raw[i] || {};
      const dur = n.d != null ? +n.d : +n.duration;
      const start = n.t != null ? +n.t : t;
      const pitch = n.p != null ? +n.p : +n.pitch;
      const word = n.w != null ? n.w : n.text;
      const rest = !!n.rest || !word || word === ' ';
      out.push({ w: word || '', p: pitch, t: start, d: dur, rest: rest });
      t = start + (dur > 0 ? dur : 0);
    }
    return out;
  }

  function formantsAt(vowel, t) {
    const pair = Array.isArray(vowel) ? vowel : [vowel, vowel];
    const a = VOWELS[pair[0]] || VOWELS['@'];
    const b = VOWELS[pair[1]] || a;
    const k = smooth(t);
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
  }

  function sing(score, opts) {
    opts = opts || {};
    const st = opts.style || {};
    const formant = st.formant > 0 ? +st.formant : 1;
    const vibScale = st.vibrato != null ? +st.vibrato : 1;
    const breathScale = st.breath != null ? +st.breath : 1;
    const scoopScale = st.scoop != null ? +st.scoop : 1;
    const rdBias = st.rd != null ? +st.rd : 0;
    const oqBias = st.oq != null ? +st.oq : 0;
    const sr = opts.sampleRate || SR;
    const notes = normalizeNotes(score);
    const tail = 1.55;
    const last = notes.length ? notes[notes.length - 1] : null;
    const scored = (score && score.seconds) || (last ? last.t + last.d : 2);
    const seconds = Math.max(0.4, scored) + tail;
    const n = Math.ceil(seconds * sr);
    const mono = new Float32Array(n);
    const rand = mulberry((opts.seed == null ? 17 : opts.seed) * 9973 + 13);
    const res = [0, 1, 2, 3].map(function (i) { return resonator(VOWELS['@'][i], BW[i], sr); });
    const singer = resonator(2850, 160, sr);
    const chest = resonator(520, 90, sr);
    const nasalRes = resonator(280, 70, sr);
    const sRes = resonator(6500, 1600, sr);
    const shRes = resonator(3200, 1400, sr);
    const tRes = resonator(4800, 1200, sr);
    const kRes = resonator(2100, 800, sr);
    const pRes = resonator(900, 500, sr);
    const combsL = makeCombs(sr);
    const combsR = makeCombs(sr * 1.013);
    const apL1 = makeAllpass(sr, 0.0051, 0.7);
    const apL2 = makeAllpass(sr, 0.0017, 0.7);
    const apR1 = makeAllpass(sr, 0.0057, 0.7);
    const apR2 = makeAllpass(sr, 0.0023, 0.7);

    let phase = 0;
    let prevHz = 0;
    let airLp = 0;
    let hpS = 0;

    function writeNoise(at, dur, amount, kind) {
      const startAt = Math.max(0, Math.floor(at * sr));
      const len = Math.max(1, Math.floor(dur * sr));
      const closure = kind === 't' ? 0.016 : kind === 'k' ? 0.02 : kind === 'p' ? 0.012 : kind === 'ch' ? 0.014 : 0;
      const closeN = Math.floor(closure * sr);
      for (let i = 0; i < len; i++) {
        const o = startAt + i;
        if (o >= n) break;
        if (i < closeN) continue;
        const u = (i - closeN) / Math.max(1, len - closeN);
        let env = Math.sin(Math.PI * Math.min(1, u * 1.2));
        if (kind === 't' || kind === 'k' || kind === 'p' || kind === 'b' || kind === 'd' || kind === 'g' || kind === 'ch') {
          env = Math.exp(-u / 0.18) * (u < 0.08 ? u / 0.08 : 1);
        }
        let x = rand() * 2 - 1;
        if (kind === 's') {
          x = sRes.tick(x);
          hpS += 0.22 * (x - hpS);
          x = x - hpS;
        } else if (kind === 'sh' || kind === 'ch') {
          x = shRes.tick(x);
          if (kind === 'ch') x = 0.65 * x + 0.35 * tRes.tick(rand() * 2 - 1);
        } else if (kind === 't') {
          x = tRes.tick(x);
        } else if (kind === 'k') {
          x = kRes.tick(x);
        } else if (kind === 'p' || kind === 'b') {
          x = pRes.tick(x) * 0.7 + (rand() * 2 - 1) * 0.3;
        } else if (kind === 'd') {
          x = tRes.tick(x) * 0.6 + pRes.tick(rand() * 2 - 1) * 0.4;
        } else if (kind === 'g') {
          x = kRes.tick(x) * 0.7 + pRes.tick(rand() * 2 - 1) * 0.3;
        } else if (kind === 'f' || kind === 'th' || kind === 'h') {
          airLp += 0.08 * (x - airLp);
          x = (x - airLp) * (kind === 'h' ? 0.7 : 0.85);
        }
        mono[o] += x * amount * env;
      }
    }

    const vot = { s: 0.055, sh: 0.06, ch: 0.05, t: 0.03, k: 0.036, p: 0.02, h: 0.04, f: 0.04, th: 0.035, b: 0.012, d: 0.014, g: 0.016 };

    for (let ni = 0; ni < notes.length; ni++) {
      const note = notes[ni];
      if (!note || note.rest || !(note.d > 0)) {
        if (note && note.d > 0.18) writeNoise(note.t + note.d * 0.15, Math.min(0.16, note.d * 0.35), 0.04, 'h');
        continue;
      }
      const word = note.w || 'la';
      const vow = vowelOf(word);
      const onset = onsetOf(word);
      const coda = codaOf(word);
      const phraseStart = ni === 0 || (notes[ni - 1] && notes[ni - 1].rest);
      const timing = (rand() - 0.5) * 0.022;
      const loud = 0.86 + rand() * 0.26;
      const start = Math.max(0, Math.floor((note.t + timing) * sr));
      const dur = Math.max(0.12, note.d * (0.97 + rand() * 0.06));
      const len = Math.max(1, Math.floor(dur * sr));
      const targetHz = midiHz(clamp(note.p, 48, 84));
      const fromHz = prevHz > 0 ? prevHz : targetHz * Math.pow(2, -0.06);
      const leap = Math.abs(Math.log2(targetHz / Math.max(70, fromHz)));
      const glideT = clamp(0.05 + leap * 0.08, 0.05, 0.18);
      const scoopCents = ((phraseStart || leap > 0.08 ? 50 : 28) + rand() * 35) * scoopScale;
      const scoopT = 0.05 + rand() * 0.035;
      const vibDelay = 0.17 + rand() * 0.13;
      const vibGrow = 0.32 + rand() * 0.28;
      const vibRate0 = 5.05 + rand() * 0.75;
      const vibDepth0 = (0.017 + rand() * 0.012) * Math.max(0, vibScale);
      const vibRateJit = 0.12 + rand() * 0.1;
      const vibDepthJit = 0.18 + rand() * 0.12;
      const vibPhase = rand() * Math.PI * 2;
      const rateWanderPh = rand() * Math.PI * 2;
      const depthWanderPh = rand() * Math.PI * 2;
      const fall = (ni === notes.length - 1 || (notes[ni + 1] && notes[ni + 1].rest)) ? 0.02 : 0.006;
      const oq = 0.58 + rand() * 0.08 + oqBias;
      const rd = 1.05 + rand() * 0.35 + rdBias;
      const lf = makeLF(oq, oq * (0.62 + rand() * 0.06), clamp(0.018 * rd, 0.014, 0.06));
      let drift = (rand() - 0.5) * 4;
      const driftTau = 0.32 + rand() * 0.22;
      const driftSig = 9;
      let jit = 1;
      let shim = 1;

      const burstAt = note.t + timing;
      if (onset === 's') writeNoise(burstAt, Math.min(0.08, dur * 0.22), 0.28, 's');
      else if (onset === 'sh') writeNoise(burstAt, Math.min(0.09, dur * 0.24), 0.24, 'sh');
      else if (onset === 'ch') writeNoise(burstAt, Math.min(0.09, dur * 0.22), 0.26, 'ch');
      else if (onset === 't') writeNoise(burstAt, 0.045, 0.32, 't');
      else if (onset === 'k') writeNoise(burstAt, 0.055, 0.3, 'k');
      else if (onset === 'p') writeNoise(burstAt, 0.04, 0.26, 'p');
      else if (onset === 'b') writeNoise(burstAt, 0.032, 0.18, 'b');
      else if (onset === 'd') writeNoise(burstAt, 0.034, 0.2, 'd');
      else if (onset === 'g') writeNoise(burstAt, 0.038, 0.2, 'g');
      else if (onset === 'f' || onset === 'th') writeNoise(burstAt, 0.06, 0.14, onset);
      else if (onset === 'h') writeNoise(burstAt, 0.08, 0.1, 'h');
      if (phraseStart) writeNoise(Math.max(0, burstAt - 0.1), 0.11, 0.04, 'h');

      const voiceDelay = Math.min((vot[onset] || 0.012), dur * 0.22);
      const nasalWord = onset === 'nasal' || coda === 'nasal';

      for (let i = 0; i < len; i++) {
        const o = start + i;
        if (o >= n) break;
        const t = i / sr;
        const u = i / len;
        const dt = 1 / sr;
        drift += (-drift / driftTau) * dt + driftSig * Math.sqrt(dt) * (rand() * 2 - 1) * 1.2;
        drift = clamp(drift, -22, 22);
        let hz = lerp(fromHz, targetHz, smooth(t / glideT));
        const scoopAmt = smooth(t / scoopT);
        hz *= Math.pow(2, (scoopCents * (1 - scoopAmt)) / -1200);
        if (u > 0.84) hz *= Math.pow(2, -fall * 1.4 * smooth((u - 0.84) / 0.16));
        const vibEnv = smooth((t - vibDelay) / vibGrow);
        const rate = vibRate0 * (1 + vibRateJit * 0.35 * Math.sin(2 * Math.PI * 0.33 * (note.t + t) + rateWanderPh));
        const depth = vibDepth0 * vibEnv * (1 + vibDepthJit * 0.4 * Math.sin(2 * Math.PI * 0.27 * (note.t + t) + depthWanderPh));
        hz *= 1 + depth * Math.sin(2 * Math.PI * rate * (note.t + t) + vibPhase);
        hz *= Math.pow(2, drift / 1200);
        hz = clamp(hz, 70, 1200);
        phase += (hz * jit) / sr;
        if (phase >= 1) {
          phase -= Math.floor(phase);
          jit = 1 + (rand() * 2 - 1) * 0.009;
          shim = 1 + (rand() * 2 - 1) * 0.05;
        }
        const sourcePulse = lf(phase) * shim;
        let breath = rand() * 2 - 1;
        airLp += 0.12 * (breath - airLp);
        breath = breath - airLp;
        const breathAmt = (0.03 + 0.018 * (1 - u) + (onset === 'h' ? 0.045 * (1 - smooth(t / 0.2)) : 0)) * Math.max(0, breathScale);
        const source = sourcePulse * 0.95 + breath * breathAmt;

        const fv = formantsAt(vow, u);
        for (let k = 0; k < 4; k++) res[k].set(fv[k] * formant * (1 + 0.004 * Math.sin(2 * Math.PI * 0.7 * (note.t + t) + k)), BW[k]);
        let y = res[0].tick(source) * 1.05
          + res[1].tick(source) * 0.85
          + res[2].tick(source) * 0.45
          + res[3].tick(source) * 0.22
          + singer.tick(source) * 0.2
          + chest.tick(source) * 0.18;
        if (nasalWord && (u < 0.22 || u > 0.78)) y = y * 0.7 + nasalRes.tick(source) * 0.7;
        if (onset === 'l' && u < 0.14) y *= 0.75;
        if (onset === 'w' && u < 0.12) y *= 0.72;
        if (onset === 'y' && u < 0.12) y *= 0.78;

        const attack = smooth((t - voiceDelay) / 0.04);
        const rel = 1 - smooth((u - 0.88) / 0.12);
        const swell = 0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, u * 1.05));
        const vibAmp = 1 + vibEnv * 0.045 * Math.sin(2 * Math.PI * rate * (note.t + t) + vibPhase + 0.7);
        let env = Math.max(0, attack) * rel * swell * vibAmp * loud;
        if (t < voiceDelay) env *= 0.1;
        mono[o] += y * env * 0.2;
      }
      if (coda === 's') writeNoise(note.t + timing + dur * 0.86, Math.min(0.09, dur * 0.16), 0.22, 's');
      else if (coda === 'sh') writeNoise(note.t + timing + dur * 0.86, 0.08, 0.18, 'sh');
      else if (coda === 'ch') writeNoise(note.t + timing + dur * 0.86, 0.08, 0.2, 'ch');
      else if (coda === 't') writeNoise(note.t + timing + dur * 0.9, 0.04, 0.24, 't');
      else if (coda === 'k') writeNoise(note.t + timing + dur * 0.9, 0.045, 0.22, 'k');
      else if (coda === 'p') writeNoise(note.t + timing + dur * 0.9, 0.035, 0.2, 'p');
      prevHz = targetHz * Math.pow(2, -fall);
    }

    let peak = peakOf(mono);
    if (peak > 0) {
      const g = 0.72 / peak;
      for (let i = 0; i < n; i++) mono[i] *= g;
    }

    const left = new Float32Array(n);
    const right = new Float32Array(n);
    const wet = 0.28;
    const dry = 0.78;
    let preL = 0;
    const preDelay = Math.round(0.018 * sr);
    for (let i = 0; i < n; i++) {
      const dryS = mono[i];
      const delayed = i >= preDelay ? mono[i - preDelay] : 0;
      let accL = 0;
      let accR = 0;
      for (let c = 0; c < combsL.length; c++) accL += tickComb(combsL[c], delayed);
      for (let c = 0; c < combsR.length; c++) accR += tickComb(combsR[c], delayed);
      accL = tickAllpass(apL2, tickAllpass(apL1, accL / combsL.length));
      accR = tickAllpass(apR2, tickAllpass(apR1, accR / combsR.length));
      left[i] = dryS * dry + accL * wet;
      right[i] = dryS * dry * 0.98 + accR * wet;
      preL = dryS;
    }

    peak = Math.max(peakOf(left), peakOf(right));
    if (peak < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    const g = 0.89 / peak;
    for (let i = 0; i < n; i++) {
      left[i] *= g;
      right[i] *= g;
    }
    return encodeWav(left, right, sr);
  }

  return {
    SR: SR,
    sing: sing,
    encodeWav: encodeWav,
    decodeMono: decodeMono,
    detectPitch: detectPitch,
    peakOf: peakOf,
    midiHz: midiHz,
    vowelOf: vowelOf
  };
});
