/* Coffeebreak voice - a sung vocal made in the browser.
   Formant singing with glides, vibrato, breath and reverb.
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
    if (w.startsWith('shr') || w.startsWith('sh') || w.startsWith('ch')) return 'sh';
    if (w.startsWith('th')) return 'th';
    if (w.startsWith('ph') || w[0] === 'f') return 'f';
    if (w.startsWith('wh') || w[0] === 'w') return 'w';
    if (w[0] === 's' || (w[0] === 'c' && 'eiy'.indexOf(w[1] || '') >= 0)) return 's';
    if (w[0] === 'h') return 'h';
    if (w[0] === 'p' || w[0] === 't' || w[0] === 'k' || (w[0] === 'c' && 'eiy'.indexOf(w[1] || '') < 0) || w[0] === 'q') return 'stop';
    if (w[0] === 'b' || w[0] === 'd' || w[0] === 'g') return 'vstop';
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
    if (/sh$|ch$|ge$|dge$/.test(w)) return 'sh';
    if (/[ptk]$|ck$/.test(w)) return 'stop';
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

  function glottal(phase, oq) {
    const tp = oq * 0.62;
    const tn = oq * 0.38;
    if (phase < tp) return 0.5 * (1 - Math.cos(Math.PI * phase / tp));
    if (phase < tp + tn) return Math.cos(Math.PI * (phase - tp) / (2 * tn));
    return 0;
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
    const fric = resonator(5500, 1800, sr);
    const combsL = makeCombs(sr);
    const combsR = makeCombs(sr * 1.013);
    const apL1 = makeAllpass(sr, 0.0051, 0.7);
    const apL2 = makeAllpass(sr, 0.0017, 0.7);
    const apR1 = makeAllpass(sr, 0.0057, 0.7);
    const apR2 = makeAllpass(sr, 0.0023, 0.7);

    let phase = 0;
    let prevHz = 0;
    let lip = 0;
    let airLp = 0;

    function writeNoise(at, dur, amount, kind) {
      const start = Math.max(0, Math.floor(at * sr));
      const len = Math.max(1, Math.floor(dur * sr));
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const env = Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.35);
        let x = (rand() * 2 - 1);
        if (kind === 's' || kind === 'sh') {
          x = fric.tick(x);
          if (kind === 's') x = x - airLp, airLp += 0.08 * ((x + airLp) - airLp);
        } else if (kind === 'f' || kind === 'th' || kind === 'h') {
          x *= 0.55;
        } else if (kind === 'stop') {
          if (i < sr * 0.012) x = 0;
          else x *= Math.exp(-(i - sr * 0.012) / (sr * 0.012));
        }
        const o = start + i;
        if (o < n) mono[o] += x * amount * env;
      }
    }

    for (let ni = 0; ni < notes.length; ni++) {
      const note = notes[ni];
      if (!note || note.rest || !(note.d > 0)) {
        if (note && note.d > 0.18) writeNoise(note.t + note.d * 0.15, Math.min(0.16, note.d * 0.35), 0.035, 'h');
        continue;
      }
      const word = note.w || 'la';
      const vow = vowelOf(word);
      const onset = onsetOf(word);
      const coda = codaOf(word);
      const start = Math.max(0, Math.floor(note.t * sr));
      const dur = note.d;
      const len = Math.max(1, Math.floor(dur * sr));
      const targetHz = midiHz(clamp(note.p, 48, 84));
      const fromHz = prevHz > 0 ? prevHz : targetHz * 0.97;
      const leap = Math.abs(Math.log2(targetHz / fromHz));
      const glideT = clamp(0.05 + leap * 0.07, 0.05, 0.16);
      const scoop = prevHz <= 0 || leap > 0.15;
      const vibDelay = 0.14 + rand() * 0.1;
      const vibRate = 5.15 + rand() * 0.55;
      const vibDepth = 0.016 + rand() * 0.01;
      const fall = (ni === notes.length - 1 || (notes[ni + 1] && notes[ni + 1].rest)) ? 0.018 : 0.006;
      const oq = 0.58 + rand() * 0.08;
      if (onset === 's') writeNoise(note.t, Math.min(0.07, dur * 0.18), 0.16, 's');
      else if (onset === 'sh') writeNoise(note.t, Math.min(0.08, dur * 0.2), 0.14, 'sh');
      else if (onset === 'f' || onset === 'th') writeNoise(note.t, 0.05, 0.09, onset);
      else if (onset === 'h') writeNoise(note.t, 0.07, 0.07, 'h');
      else if (onset === 'stop') writeNoise(note.t, 0.04, 0.11, 'stop');
      else if (onset === 'vstop') writeNoise(note.t, 0.03, 0.08, 'stop');
      if (ni === 0 || (notes[ni - 1] && notes[ni - 1].rest)) writeNoise(Math.max(0, note.t - 0.09), 0.1, 0.03, 'h');

      const voiceDelay = (onset === 's' || onset === 'sh' || onset === 'stop') ? Math.min(0.05, dur * 0.15) : (onset === 'h' ? 0.04 : 0.01);
      const nasalWord = onset === 'nasal' || coda === 'nasal';

      for (let i = 0; i < len; i++) {
        const o = start + i;
        if (o >= n) break;
        const t = i / sr;
        const u = i / len;
        const local = t;
        let hz = lerp(fromHz, targetHz, smooth(local / glideT));
        if (scoop && local < 0.08) hz *= 0.97 + 0.03 * smooth(local / 0.08);
        if (u > 0.82) hz *= 1 - fall * smooth((u - 0.82) / 0.18);
        const vibAmt = smooth((local - vibDelay) / 0.18);
        hz *= 1 + vibAmt * vibDepth * Math.sin(2 * Math.PI * vibRate * (note.t + t));
        hz *= 1 + 0.0016 * Math.sin(2 * Math.PI * 0.85 * (note.t + t) + 0.3);
        hz = clamp(hz, 70, 1200);
        phase += hz / sr;
        if (phase >= 1) phase -= Math.floor(phase);
        const pulse = glottal(phase, oq);
        const rad = pulse - lip;
        lip = pulse;
        let breath = (rand() * 2 - 1);
        airLp += 0.12 * (breath - airLp);
        breath = breath - airLp;
        const breathAmt = 0.028 + 0.02 * (1 - u) + (onset === 'h' ? 0.04 * (1 - smooth(u / 0.2)) : 0);
        const source = rad * 0.9 + breath * breathAmt;

        const fv = formantsAt(vow, u);
        for (let k = 0; k < 4; k++) res[k].set(fv[k] * (1 + 0.004 * Math.sin(2 * Math.PI * 0.7 * (note.t + t) + k)), BW[k]);
        let y = res[0].tick(source) * 1.05
          + res[1].tick(source) * 0.85
          + res[2].tick(source) * 0.45
          + res[3].tick(source) * 0.22
          + singer.tick(source) * 0.2
          + chest.tick(source) * 0.18;
        if (nasalWord && (u < 0.22 || u > 0.78)) y = y * 0.7 + nasalRes.tick(source) * 0.7;
        if (onset === 'l' && u < 0.14) y *= 0.75;
        if (onset === 'w' && u < 0.12) y = y * 0.6 + res[0].tick(source) * 0.2;
        if (onset === 'y' && u < 0.12) y = y * 0.7;

        const attack = smooth((t - voiceDelay) / 0.035);
        const rel = 1 - smooth((u - 0.88) / 0.12);
        const swell = 0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, u * 1.05));
        const vibAmp = 1 + vibAmt * 0.04 * Math.sin(2 * Math.PI * vibRate * (note.t + t) + 0.7);
        let env = Math.max(0, attack) * rel * swell * vibAmp;
        if (t < voiceDelay) env *= 0.12;
        mono[o] += y * env * 0.22;
      }
      if (coda === 's') writeNoise(note.t + dur * 0.86, Math.min(0.08, dur * 0.14), 0.12, 's');
      else if (coda === 'sh') writeNoise(note.t + dur * 0.86, 0.07, 0.1, 'sh');
      else if (coda === 'stop') writeNoise(note.t + dur * 0.92, 0.03, 0.08, 'stop');
      prevHz = targetHz * (1 - fall);
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
