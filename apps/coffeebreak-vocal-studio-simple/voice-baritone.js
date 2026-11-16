/* Baritone voices for Vocal Studio Simple only.
   Vendored from the Twirling Bean / clear engine and retuned for a male
   baritone: G2-G4, lower formants, fuller chest, moderate vibrato.
   Style flavor "warm" or "country". Melodies are transposed into baritone
   range automatically. No outside service is used. This is still a synthesizer. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CBVoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SR = 48000;

  const VOWELS = {
    i: [280, 1840, 2480, 3000, 3650],
    I: [360, 1680, 2180, 2920, 3600],
    e: [420, 1540, 2220, 2960, 3600],
    E: [520, 1400, 2140, 2960, 3550],
    a: [700, 1020, 2140, 2960, 3500],
    o: [460, 700, 2200, 2900, 3450],
    u: [320, 640, 2000, 2860, 3380],
    '@': [540, 1140, 2140, 2920, 3550],
    r: [440, 980, 1360, 2420, 3180]
  };

  const BW = [70, 95, 135, 185, 250];

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

  const VFORM = {
    IY: VOWELS.i,
    IH: VOWELS.I,
    EY: VOWELS.e,
    EH: VOWELS.E,
    AE: VOWELS.a,
    AA: VOWELS.a,
    AO: VOWELS.o,
    OW: VOWELS.o,
    UH: VOWELS.u,
    UW: VOWELS.u,
    AH: VOWELS['@'],
    ER: VOWELS.r,
    AY: VOWELS.a,
    AW: VOWELS.a,
    OY: VOWELS.o
  };
  const DIPH = { EY: ['EH', 'IY'], AY: ['AA', 'IY'], AW: ['AA', 'UW'], OW: ['AO', 'UW'], OY: ['AO', 'IY'] };
  const NASAL_F = { M: [250, 1100, 2150, 2800, 3500], N: [270, 1400, 2500, 3200, 3600], NG: [260, 2000, 2500, 3000, 3400] };
  const LIQ_F = { L: [400, 950, 2650, 3300, 3800], R: VOWELS.r, W: [350, 700, 2300, 3200, 3700], Y: VOWELS.i };

  const VOICED = {
    IY:1,IH:1,EY:1,EH:1,AE:1,AA:1,AO:1,OW:1,UH:1,UW:1,AH:1,ER:1,AY:1,AW:1,OY:1,
    B:1,D:1,G:1,V:1,Z:1,ZH:1,DH:1,M:1,N:1,NG:1,L:1,R:1,W:1,Y:1,JH:1
  };
  const TYPE = {};
  'IY IH EY EH AE AA AO OW UH UW AH ER AY AW OY'.split(' ').forEach(function (p) { TYPE[p] = 'vowel'; });
  'M N NG'.split(' ').forEach(function (p) { TYPE[p] = 'nasal'; });
  'L R W Y'.split(' ').forEach(function (p) { TYPE[p] = 'liquid'; });
  'S SH F TH HH'.split(' ').forEach(function (p) { TYPE[p] = 'fric'; });
  'Z ZH V DH'.split(' ').forEach(function (p) { TYPE[p] = 'vfric'; });
  'P T K'.split(' ').forEach(function (p) { TYPE[p] = 'stop'; });
  'B D G'.split(' ').forEach(function (p) { TYPE[p] = 'vstop'; });
  TYPE.CH = 'stop'; TYPE.JH = 'vstop';

  const NAT = {
    IY:0.16,IH:0.12,EY:0.16,EH:0.13,AE:0.14,AA:0.15,AO:0.15,OW:0.16,UH:0.12,UW:0.16,AH:0.12,ER:0.14,AY:0.18,AW:0.18,OY:0.18,
    S:0.105,SH:0.105,F:0.08,TH:0.08,HH:0.08,Z:0.10,ZH:0.09,V:0.08,DH:0.08,
    P:0.085,T:0.085,K:0.09,B:0.065,D:0.065,G:0.075,CH:0.10,JH:0.09,
    M:0.08,N:0.085,NG:0.09,L:0.085,R:0.07,W:0.055,Y:0.05
  };

  const CMU = {
    a:['AH'], an:['AE','N'], and:['AE','N','D'], are:['AA','R'], as:['AE','Z'], at:['AE','T'],
    be:['B','IY'], been:['B','IH','N'], but:['B','AH','T'], by:['B','AY'],
    can:['K','AE','N'], come:['K','AH','M'], could:['K','UH','D'],
    day:['D','EY'], did:['D','IH','D'], do:['D','UW'], down:['D','AW','N'],
    for:['F','AO','R'], from:['F','R','AH','M'],
    get:['G','EH','T'], go:['G','OW'], going:['G','OW','IH','NG'], good:['G','UH','D'],
    had:['HH','AE','D'], has:['HH','AE','Z'], have:['HH','AE','V'], he:['HH','IY'], her:['HH','ER'],
    here:['HH','IY','R'], him:['HH','IH','M'], his:['HH','IH','Z'], hill:['HH','IH','L'],
    i:['AY'], if:['IH','F'], in:['IH','N'], into:['IH','N','T','UW'], is:['IH','Z'], it:['IH','T'], its:['IH','T','S'],
    just:['JH','AH','S','T'],
    know:['N','OW'],
    la:['L','AA'], let:['L','EH','T'], like:['L','AY','K'], little:['L','IH','T','AH','L'], look:['L','UH','K'], love:['L','AH','V'],
    me:['M','IY'], more:['M','AO','R'], my:['M','AY'],
    no:['N','OW'], not:['N','AA','T'], now:['N','AW'],
    of:['AH','V'], on:['AA','N'], one:['W','AH','N'], or:['AO','R'], our:['AW','ER'], out:['AW','T'],
    said:['S','EH','D'], see:['S','IY'], she:['SH','IY'], so:['S','OW'], some:['S','AH','M'], sun:['S','AH','N'],
    that:['DH','AE','T'], the:['DH','AH'], their:['DH','EH','R'], them:['DH','EH','M'], then:['DH','EH','N'],
    there:['DH','EH','R'], they:['DH','EY'], this:['DH','IH','S'], to:['T','UW'], too:['T','UW'], two:['T','UW'],
    up:['AH','P'], us:['AH','S'],
    was:['W','AA','Z'], we:['W','IY'], were:['W','ER'], what:['W','AH','T'], when:['W','EH','N'],
    where:['W','EH','R'], who:['HH','UW'], will:['W','IH','L'], with:['W','IH','DH'], would:['W','UH','D'],
    you:['Y','UW'], your:['Y','AO','R'],
    all:['AO','L'], night:['N','AY','T'], heart:['HH','AA','R','T'], time:['T','AY','M'],
    life:['L','AY','F'], want:['W','AA','N','T'], never:['N','EH','V','ER'], ever:['EH','V','ER'],
    away:['AH','W','EY'], again:['AH','G','EH','N'], around:['ER','AW','N','D'],
    light:['L','AY','T'], right:['R','AY','T'], rain:['R','EY','N'], sky:['S','K','AY'],
    home:['HH','OW','M'], world:['W','ER','L','D'], girl:['G','ER','L'], boy:['B','OY'],
    baby:['B','EY','B','IY'], yeah:['Y','AE'], oh:['OW'], ah:['AA'], ooh:['UW'],
    through:['TH','R','UW'], thought:['TH','AO','T'], though:['DH','OW'],
    because:['B','IH','K','AO','Z'], before:['B','IH','F','AO','R'], about:['AH','B','AW','T'],
    only:['OW','N','L','IY'], over:['OW','V','ER'], under:['AH','N','D','ER'],
    every:['EH','V','R','IY'], always:['AO','L','W','EY','Z'], still:['S','T','IH','L'],
    feel:['F','IY','L'], feeling:['F','IY','L','IH','NG'], tell:['T','EH','L'], call:['K','AO','L'],
    come:['K','AH','M'], coming:['K','AH','M','IH','NG'], going:['G','OW','IH','NG'],
    take:['T','EY','K'], make:['M','EY','K'], made:['M','EY','D'], give:['G','IH','V'],
    keep:['K','IY','P'], find:['F','AY','N','D'], found:['F','AW','N','D'],
    walk:['W','AO','K'], talking:['T','AO','K','IH','NG'], singing:['S','IH','NG','IH','NG'],
    dream:['D','R','IY','M'], fire:['F','AY','ER'], water:['W','AO','T','ER'],
    morning:['M','AO','R','N','IH','NG'], tonight:['T','AH','N','AY','T']
  };

  const OLD_KEY = {
    IY:'i', IH:'I', EY:'e', EH:'E', AE:'a', AA:'a', AO:'o', OW:'o',
    UH:'u', UW:'u', AH:'@', ER:'r', AY:'a', AW:'a', OY:'o'
  };

  function isVowel(ph) { return TYPE[ph] === 'vowel'; }

  function g2p(word, next) {
    const raw = String(word || '').toLowerCase().replace(/[^a-z']/g, '');
    if (!raw) return ['AH'];
    let phones = CMU[raw] ? CMU[raw].slice() : g2pRules(raw);
    if (raw === 'the' && next) {
      const n0 = g2p(next)[0];
      if (isVowel(n0)) phones = ['DH', 'IY'];
    }
    return phones;
  }

  function g2pRules(s) {
    const out = [];
    let i = 0;
    function take(n, phones) {
      for (let k = 0; k < phones.length; k++) out.push(phones[k]);
      i += n;
    }
    function consC() {
      const nx = s[i + 1] || '';
      return 'eiy'.indexOf(nx) >= 0 ? 'S' : 'K';
    }
    function magicE(vowel) {
      if (s[i + 2] === 'e' && s[i + 3] === undefined && s[i + 1] && 'aeiou'.indexOf(s[i + 1]) < 0) return vowel;
      return null;
    }
    while (i < s.length) {
      const r = s.slice(i);
      if (r.startsWith("n't")) { take(3, ['AH','N','T']); continue; }
      if (r.startsWith('tion')) { take(4, ['SH','AH','N']); continue; }
      if (r.startsWith('sion')) { take(4, ['ZH','AH','N']); continue; }
      if (r.startsWith('ough')) { take(4, ['AO']); continue; }
      if (r.startsWith('ight') || r.startsWith('igh')) { take(r.startsWith('ight') ? 4 : 3, r.startsWith('ight') ? ['AY','T'] : ['AY']); continue; }
      if (r.startsWith('qu')) { take(2, ['K','W']); continue; }
      if (r.startsWith('wh')) { take(2, ['W']); continue; }
      if (r.startsWith('ch')) { take(2, ['CH']); continue; }
      if (r.startsWith('sh')) { take(2, ['SH']); continue; }
      if (r.startsWith('th')) { take(2, [i === 0 || s[i - 1] === ' ' ? 'DH' : 'TH']); continue; }
      if (r.startsWith('ph')) { take(2, ['F']); continue; }
      if (r.startsWith('ng')) { take(2, ['NG']); continue; }
      if (r.startsWith('ck')) { take(2, ['K']); continue; }
      if (r.startsWith('dg') || r.startsWith('dge')) { take(r.startsWith('dge') ? 3 : 2, ['JH']); continue; }
      if (r.startsWith('oo')) { take(2, ['UW']); continue; }
      if (r.startsWith('ee') || r.startsWith('ea')) { take(2, ['IY']); continue; }
      if (r.startsWith('ai') || r.startsWith('ay') || r.startsWith('ey')) { take(2, ['EY']); continue; }
      if (r.startsWith('oa') || r.startsWith('oe')) { take(2, ['OW']); continue; }
      if (r.startsWith('oi') || r.startsWith('oy')) { take(2, ['OY']); continue; }
      if (r.startsWith('aw') || r.startsWith('au')) { take(2, ['AO']); continue; }
      if (r.startsWith('ow') || r.startsWith('ou')) { take(2, ['AW']); continue; }
      if (r.startsWith('ew') || r.startsWith('ue') || r.startsWith('ui')) { take(2, ['UW']); continue; }
      if (r.startsWith('ar')) { take(2, ['AA','R']); continue; }
      if (r.startsWith('or') || r.startsWith('ore')) { take(r.startsWith('ore') ? 3 : 2, ['AO','R']); continue; }
      if (r.startsWith('er') || r.startsWith('ir') || r.startsWith('ur')) { take(2, ['ER']); continue; }
      if (r.startsWith('ing')) { take(3, ['IH','NG']); continue; }
      if (r.startsWith('ed') && i > 0) {
        const prev = s[i - 1];
        if (prev === 't' || prev === 'd') take(2, ['AH','D']);
        else if ('pkfsch'.indexOf(prev) >= 0) take(2, ['T']);
        else take(2, ['D']);
        continue;
      }
      const c = s[i];
      const nx = s[i + 1] || '';
      if (c === 'c') { take(1, [consC() === 'S' ? 'S' : 'K']); continue; }
      if (c === 'g') { take(1, ['eiy'.indexOf(nx) >= 0 ? 'JH' : 'G']); continue; }
      if (c === 'x') { take(1, ['K','S']); continue; }
      if (c === 'j') { take(1, ['JH']); continue; }
      if (c === 'y') {
        if (i === 0 || 'aeiou'.indexOf(s[i - 1] || '') < 0) take(1, ['Y']);
        else take(1, ['IY']);
        continue;
      }
      if (c === 'a') {
        const m = magicE('EY');
        take(1, [m || (nx && 'eiou'.indexOf(nx) >= 0 ? 'EY' : 'AE')]);
        continue;
      }
      if (c === 'e') {
        if (i === s.length - 1 && out.length) { i += 1; continue; }
        const m = magicE('IY');
        take(1, [m || 'EH']);
        continue;
      }
      if (c === 'i') { take(1, [magicE('AY') || 'IH']); continue; }
      if (c === 'o') { take(1, [magicE('OW') || 'AA']); continue; }
      if (c === 'u') { take(1, [magicE('UW') || 'AH']); continue; }
      const cmap = { b:'B', d:'D', f:'F', h:'HH', k:'K', l:'L', m:'M', n:'N', p:'P', q:'K', r:'R', s:'S', t:'T', v:'V', w:'W', z:'Z' };
      if (cmap[c]) take(1, [cmap[c]]);
      else i += 1;
    }
    if (!out.length) out.push('AH');
    return out;
  }

  function vowelOf(word) {
    const phones = g2p(word);
    const vs = phones.filter(isVowel);
    if (!vs.length) return ['@', '@'];
    const a = vs[0];
    const b = vs[vs.length - 1];
    if (vs.length === 1 && DIPH[a]) return [OLD_KEY[DIPH[a][0]] || '@', OLD_KEY[DIPH[a][1]] || '@'];
    return [OLD_KEY[a] || '@', OLD_KEY[b] || '@'];
  }

  function formantsOf(ph, u) {
    u = clamp(u, 0, 1);
    if (NASAL_F[ph]) return NASAL_F[ph];
    if (LIQ_F[ph]) return LIQ_F[ph];
    if (DIPH[ph]) {
      const a = VFORM[DIPH[ph][0]] || VFORM.AH;
      const b = VFORM[DIPH[ph][1]] || a;
      const k = smooth(u);
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k), lerp(a[4] || 4000, b[4] || 4000, k)];
    }
    return VFORM[ph] || VFORM.AH;
  }

  function scheduleWord(phones, t0, slot, midi) {
    const segs = [];
    if (!phones.length) return segs;
    const onset = [];
    const nuc = [];
    const coda = [];
    let seenV = false;
    for (let i = 0; i < phones.length; i++) {
      if (isVowel(phones[i])) { seenV = true; nuc.push(phones[i]); }
      else if (!seenV) onset.push(phones[i]);
      else coda.push(phones[i]);
    }
    if (!nuc.length) nuc.push('AH');
    function durOf(ph) { return NAT[ph] || 0.08; }
    let cDur = 0;
    onset.concat(coda).forEach(function (ph) { cDur += durOf(ph); });
    const avail = Math.max(0.18, slot);
    let vDur = avail - cDur;
    const vMin = 0.1 * nuc.length;
    if (vDur < vMin) {
      const scale = Math.max(0.6, (avail - vMin) / Math.max(0.04, cDur));
      cDur = 0;
      onset.forEach(function (ph, i) { onset[i] = [ph, Math.max(0.035, durOf(ph) * scale)]; cDur += onset[i][1]; });
      coda.forEach(function (ph, i) { coda[i] = [ph, Math.max(0.035, durOf(ph) * scale)]; cDur += coda[i][1]; });
      vDur = Math.max(vMin, avail - cDur);
    } else {
      onset.forEach(function (ph, i) { onset[i] = [ph, durOf(ph)]; });
      coda.forEach(function (ph, i) { coda[i] = [ph, durOf(ph)]; });
    }
    let t = t0;
    function push(ph, d) {
      segs.push({ ph: ph, type: TYPE[ph] || 'vowel', t: t, d: d, p: midi });
      t += d;
    }
    onset.forEach(function (pair) { push(pair[0], pair[1]); });
    const each = vDur / nuc.length;
    nuc.forEach(function (ph) { push(ph, each); });
    coda.forEach(function (pair) { push(pair[0], pair[1]); });
    return segs;
  }


  function biquad(type, freq, q, gainDb, sr) {
    const f0 = clamp(freq, 20, sr * 0.45);
    const A = Math.pow(10, (gainDb || 0) / 40);
    const w0 = 2 * Math.PI * f0 / sr;
    const cw = Math.cos(w0);
    const sw = Math.sin(w0);
    const alpha = sw / (2 * Math.max(0.1, q || 0.7));
    let b0, b1, b2, a0, a1, a2;
    if (type === 'highpass') {
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else if (type === 'lowshelf') {
      const t = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) - (A - 1) * cw + t); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - t);
      a0 = (A + 1) + (A - 1) * cw + t; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - t;
    } else if (type === 'highshelf') {
      const t = 2 * Math.sqrt(A) * alpha;
      b0 = A * ((A + 1) + (A - 1) * cw + t); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - t);
      a0 = (A + 1) - (A - 1) * cw + t; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - t;
    } else {
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A;
    }
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return function tick(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    };
  }

  function vocalChain(buf, sr) {
    const hp = biquad('highpass', 70, 0.7, 0, sr);
    const warm = biquad('lowshelf', 150, 0.7, 4.6, sr);
    const scoop = biquad('peaking', 380, 0.9, -1.0, sr);
    const presence = biquad('peaking', 2400, 0.9, 1.1, sr);
    const air = biquad('highshelf', 7000, 0.7, -1.4, sr);
    const essF = 2 * Math.PI * 6500 / sr;
    const essA = Math.exp(-essF);
    let lp = 0, env = 0, cenv = 0;
    const th = 0.12;
    const ratio = 2.4;
    const atk = Math.exp(-1 / (sr * 0.008));
    const rel = Math.exp(-1 / (sr * 0.12));
    const deessRel = Math.exp(-1 / (sr * 0.04));
    for (let i = 0; i < buf.length; i++) {
      let x = air(presence(scoop(warm(hp(buf[i])))));
      lp = essA * lp + (1 - essA) * x;
      const high = x - lp;
      const ha = Math.abs(high);
      env = ha > env ? ha : env * deessRel + ha * (1 - deessRel);
      const dg = env > 0.075 ? 0.075 / env : 1;
      x = lp + high * (0.45 + 0.55 * dg);
      const a = Math.abs(x);
      cenv = a > cenv ? a : cenv * rel + a * (1 - rel);
      let cg = 1;
      if (cenv > th) cg = (th + (cenv - th) / ratio) / cenv;
      buf[i] = x * cg * 1.08;
    }
    const p = peakOf(buf);
    if (p > 0) {
      const g = 0.68 / p;
      for (let i = 0; i < buf.length; i++) buf[i] *= g;
    }
  }


  function addKick(left, right, t0, sr, gain) {
    const start = Math.max(0, Math.floor(t0 * sr));
    const n = Math.floor(0.22 * sr);
    for (let i = 0; i < n; i++) {
      const o = start + i;
      if (o >= left.length) break;
      const t = i / sr;
      const hz = 130 * Math.exp(-t * 18) + 42;
      const env = Math.min(1, t / 0.004) * Math.exp(-t * 14);
      const s = Math.sin(2 * Math.PI * hz * t) * env * gain;
      left[o] += s;
      right[o] += s;
    }
  }

  function addSnare(left, right, t0, sr, gain, rand) {
    const start = Math.max(0, Math.floor(t0 * sr));
    const n = Math.floor(0.18 * sr);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const o = start + i;
      if (o >= left.length) break;
      const t = i / sr;
      const env = Math.min(1, t / 0.003) * Math.exp(-t * 16);
      const noise = rand() * 2 - 1;
      lp += 0.18 * (noise - lp);
      const tone = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 22);
      const s = (tone * 0.35 + (noise - lp) * 0.75) * env * gain;
      left[o] += s * 0.96;
      right[o] += s * 1.04;
    }
  }

  function addHat(left, right, t0, sr, gain, rand, open) {
    const start = Math.max(0, Math.floor(t0 * sr));
    const n = Math.floor((open ? 0.14 : 0.045) * sr);
    let lp = 0;
    const decay = open ? 10 : 38;
    for (let i = 0; i < n; i++) {
      const o = start + i;
      if (o >= left.length) break;
      const t = i / sr;
      const env = Math.exp(-t * decay);
      const noise = rand() * 2 - 1;
      lp += 0.04 * (noise - lp);
      const s = (noise - lp) * env * gain * 1.6;
      left[o] += s * 0.72;
      right[o] += s * 1.18;
    }
  }

  function addBass(left, right, t0, dur, hz, gain, sr) {
    const start = Math.max(0, Math.floor(t0 * sr));
    const n = Math.max(1, Math.floor(dur * sr));
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const o = start + i;
      if (o >= left.length) break;
      const t = i / sr;
      const u = i / n;
      const env = Math.min(1, t / 0.012) * (u < 0.82 ? 1 : 1 - (u - 0.82) / 0.18);
      const s = Math.sin(phase) * 0.78 + Math.sin(2 * phase) * 0.18 + Math.sin(3 * phase) * 0.05;
      phase += 2 * Math.PI * hz / sr;
      const y = s * env * gain;
      left[o] += y;
      right[o] += y;
    }
  }

  function addPluck(left, right, t0, dur, hz, gain, sr, rand, pan, damp) {
    const period = Math.max(2, Math.round(sr / Math.max(40, hz)));
    const delay = new Float32Array(period);
    for (let i = 0; i < period; i++) delay[i] = rand() * 2 - 1;
    const start = Math.max(0, Math.floor(t0 * sr));
    const n = Math.max(1, Math.floor(dur * sr));
    let idx = 0;
    let prev = 0;
    const panL = Math.cos((pan + 1) * Math.PI / 4);
    const panR = Math.sin((pan + 1) * Math.PI / 4);
    const d = damp == null ? 0.985 : damp;
    for (let i = 0; i < n; i++) {
      const o = start + i;
      if (o >= left.length) break;
      const avg = (delay[idx] + prev) * 0.5 * d;
      prev = delay[idx];
      delay[idx] = avg;
      idx++;
      if (idx >= period) idx = 0;
      const env = i < 0.004 * sr ? i / (0.004 * sr) : 1;
      left[o] += avg * gain * env * panL;
      right[o] += avg * gain * env * panR;
    }
  }

  function addCountryBacking(left, right, notes, sr, bpm, rand, flavor) {
    const warm = flavor !== 'country';
    const kg = warm ? 0.22 : 0.34;
    const sg = warm ? 0.10 : 0.20;
    const hg = warm ? 0.035 : 0.07;
    const bg = warm ? 0.26 : 0.30;
    const gg = warm ? 0.04 : 0.07;
    const ag = warm ? 0.04 : 0.05;
    const beat = 60 / Math.max(72, Math.min(140, bpm || 100));
    const first = notes && notes.length ? Math.round(notes[0].p) : 57;
    const pc = ((first % 12) + 12) % 12;
    const root = 24 + pc;
    const chordSteps = [0, 0, 5, 7]; // I I IV V
    const total = left.length / sr;
    let beatIndex = 0;
    for (let t = 0; t < total - 0.08; t += beat, beatIndex++) {
      const bar = Math.floor(beatIndex / 4) % 4;
      const chord = chordSteps[bar];
      const inBar = beatIndex % 4;
      if (inBar === 0 || inBar === 2) addKick(left, right, t, sr, kg);
      if (inBar === 1 || inBar === 3) addSnare(left, right, t, sr, sg, rand);
      addHat(left, right, t, sr, inBar % 2 === 0 ? hg : hg * 0.7, rand, false);
      addHat(left, right, t + beat * 0.5, sr, hg * 0.65, rand, !warm && inBar === 3);
      const bassHz = midiHz(root + chord + (inBar === 2 ? 7 : 0));
      if (inBar === 0 || inBar === 2) addBass(left, right, t, beat * 0.88, bassHz, bg, sr);
      const midis = [root + 12 + chord, root + 16 + chord, root + 19 + chord, root + 24 + chord];
      if (inBar === 1 || inBar === 3) {
        for (let m = 0; m < midis.length; m++) {
          addPluck(left, right, t, 0.20, midiHz(midis[m]), gg, sr, rand, (m - 1.5) * 0.5, 0.952);
        }
      }
      if (inBar === 0) {
        for (let m = 0; m < midis.length; m++) {
          addPluck(left, right, t + m * 0.03, beat * 1.6, midiHz(midis[m]), ag, sr, rand, (m - 1.5) * 0.55, 0.984);
        }
      }
    }
  }

  function warmMaster(left, right, sr) {
    const n = left.length;
    const low = biquad('lowshelf', 120, 0.7, 3.4, sr);
    const body = biquad('peaking', 230, 0.8, 1.4, sr);
    const air = biquad('highshelf', 7000, 0.7, 1.2, sr);
    const midHi = biquad('peaking', 1800, 0.8, 1.6, sr);
    const sideHp = biquad('highpass', 180, 0.7, 0, sr);
    const atk = Math.exp(-1 / (sr * 0.01));
    const rel = Math.exp(-1 / (sr * 0.18));
    let env = 0;
    const th = 0.28;
    const ratio = 2.2;
    for (let i = 0; i < n; i++) {
      let mid = (left[i] + right[i]) * 0.5;
      let side = (left[i] - right[i]) * 0.5;
      mid = air(midHi(body(low(mid))));
      side = sideHp(side) * 1.7;
      let l = mid + side;
      let r = mid - side;
      const a = Math.max(Math.abs(l), Math.abs(r));
      env = a > env ? env * atk + a * (1 - atk) : env * rel + a * (1 - rel);
      let cg = 1;
      if (env > th) cg = (th + (env - th) / ratio) / env;
      left[i] = l * cg;
      right[i] = r * cg;
    }
  }

  function toBaritonePitch(p) {
    p = Math.round(+p || 52);
    while (p > 67) p -= 12;
    while (p < 43) p += 12;
    if (p >= 55 && p - 12 >= 43) p -= 12;
    return clamp(p, 43, 67);
  }

  function transposeNotes(notes) {
    const out = [];
    for (let i = 0; i < (notes || []).length; i++) {
      const n = notes[i] || {};
      const copy = {};
      for (const k in n) if (Object.prototype.hasOwnProperty.call(n, k)) copy[k] = n[k];
      copy.p = toBaritonePitch(n.p != null ? n.p : n.pitch);
      copy.pitch = copy.p;
      out.push(copy);
    }
    return out;
  }

  function defaultMelody(count) {
    const scale = [45, 47, 49, 52, 54, 52, 49, 47];
    const lens = [1, 1, 1, 1.2, 1, 1, 1, 1.35];
    const out = [];
    for (let i = 0; i < count; i++) out.push({ p: scale[i % scale.length], l: lens[i % lens.length] });
    return out;
  }

  function sing(score, opts) {
    opts = opts || {};
    const st = opts.style || {};
    const flavor = st.flavor === 'country' ? 'country' : 'warm';
    const formant = st.formant > 0 ? +st.formant : (flavor === 'country' ? 0.98 : 0.96);
    const vibScale = st.vibrato != null ? +st.vibrato : 1;
    const breathScale = st.breath != null ? +st.breath : (flavor === 'country' ? 1.05 : 0.9);
    const scoopScale = st.scoop != null ? +st.scoop : (flavor === 'country' ? 1.2 : 0.75);
    const rdBias = st.rd != null ? +st.rd : (flavor === 'country' ? -0.08 : -0.04);
    const oqBias = st.oq != null ? +st.oq : -0.02;
    const useBacking = st.backing !== false;
    const sr = opts.sampleRate || SR;
    let notes = transposeNotes(normalizeNotes(score));
    const segs = [];
    for (let ni = 0; ni < notes.length; ni++) {
      const note = notes[ni];
      if (!note || note.rest || !(note.d > 0) || !note.w) {
        if (note && note.d > 0.18) segs.push({ ph: 'HH', type: 'fric', t: note.t + note.d * 0.15, d: Math.min(0.16, note.d * 0.35), p: note.p || 60, restBreath: true });
        continue;
      }
      const nextWord = (notes[ni + 1] && !notes[ni + 1].rest) ? notes[ni + 1].w : '';
      const phones = g2p(note.w, nextWord);
      const phraseStart = ni === 0 || (notes[ni - 1] && notes[ni - 1].rest);
      const timing = 0; /* keep consonants aligned; small loudness variation stays in the renderer */
      const wordSegs = scheduleWord(phones, note.t + timing, Math.max(0.16, note.d), clamp(note.p, 43, 67));
      if (phraseStart) segs.push({ ph: 'HH', type: 'fric', t: Math.max(0, (wordSegs[0] ? wordSegs[0].t : note.t) - 0.12), d: 0.13, p: note.p, restBreath: true, amount: 0.06 });
      wordSegs.forEach(function (s) { segs.push(s); });
    }

    const last = segs.length ? segs[segs.length - 1] : null;
    const scoredNotes = notes.length ? notes[notes.length - 1] : null;
    const scored = (score && score.seconds) || (last ? last.t + last.d : (scoredNotes ? scoredNotes.t + scoredNotes.d : 2));
    const tail = useBacking ? 2.4 : 1.7;
    const seconds = Math.max(0.4, scored) + tail;
    const n = Math.ceil(seconds * sr);
    const mono = new Float32Array(n);
    const rand = mulberry((opts.seed == null ? 17 : opts.seed) * 9973 + 13);
    const res = [0, 1, 2, 3, 4].map(function (i) { return resonator(VOWELS['@'][i], BW[i], sr); });
    const singer = resonator(2550, 150, sr);
    const chest = resonator(380, 85, sr);
    const nasalRes = resonator(280, 70, sr);
    const sRes = resonator(6500, 1400, sr);
    const sRes2 = resonator(7800, 1600, sr);
    const sRes3 = resonator(5400, 1100, sr);
    const shRes = resonator(3200, 1200, sr);
    const shRes2 = resonator(2500, 900, sr);
    const tRes = resonator(4800, 1100, sr);
    const tRes2 = resonator(6200, 1400, sr);
    const kRes = resonator(2100, 700, sr);
    const kRes2 = resonator(1400, 500, sr);
    const pRes = resonator(900, 500, sr);
    const fRes = resonator(7000, 2800, sr);
    const thRes = resonator(8000, 2500, sr);
    const combsL = makeCombs(sr);
    const combsR = makeCombs(sr * 1.03);
    const apL1 = makeAllpass(sr, 0.0051, 0.7);
    const apL2 = makeAllpass(sr, 0.0017, 0.7);
    const apR1 = makeAllpass(sr, 0.0057, 0.7);
    const apR2 = makeAllpass(sr, 0.0023, 0.7);

    let phase = 0;
    let prevHz = 0;
    let airLp = 0;
    let hpS = 0;

    function noiseAt(kind) {
      const w = rand() * 2 - 1;
      let x = w;
      if (kind === 'S' || kind === 'Z') {
        x = sRes.tick(w) * 0.55 + sRes2.tick(w) * 0.7 + sRes3.tick(w) * 0.35;
        hpS += 0.18 * (x - hpS);
        x = x - hpS;
      } else if (kind === 'SH' || kind === 'ZH' || kind === 'CH' || kind === 'JH') {
        x = shRes.tick(w) * 0.7 + shRes2.tick(w) * 0.45;
        if (kind === 'CH' || kind === 'JH') x = 0.6 * x + 0.4 * (tRes.tick(rand() * 2 - 1) + tRes2.tick(rand() * 2 - 1) * 0.5);
      } else if (kind === 'T' || kind === 'D') {
        x = tRes.tick(w) * 0.7 + tRes2.tick(w) * 0.5;
      } else if (kind === 'K' || kind === 'G') {
        x = kRes.tick(w) * 0.7 + kRes2.tick(w) * 0.45;
      } else if (kind === 'P' || kind === 'B') {
        x = pRes.tick(w) * 0.65 + (rand() * 2 - 1) * 0.35;
      } else if (kind === 'F' || kind === 'V') {
        airLp += 0.06 * (w - airLp);
        x = (w - airLp) * 0.7 + fRes.tick(w) * 0.5;
      } else if (kind === 'TH' || kind === 'DH') {
        airLp += 0.07 * (w - airLp);
        x = (w - airLp) * 0.55 + thRes.tick(w) * 0.45;
      } else if (kind === 'HH') {
        airLp += 0.08 * (w - airLp);
        x = (w - airLp) * 0.75;
      }
      return x;
    }

    function targets(seg, u, prevF, nextF) {
      let f = formantsOf(seg.ph, u);
      const trans = 0.02 / Math.max(0.04, seg.d);
      if (prevF && u < trans) {
        const k = smooth(u / trans);
        f = [lerp(prevF[0], f[0], k), lerp(prevF[1], f[1], k), lerp(prevF[2], f[2], k), lerp(prevF[3], f[3], k), lerp(prevF[4] || 4000, f[4] || 4000, k)];
      } else if (nextF && u > 1 - trans) {
        const k = smooth((u - (1 - trans)) / trans);
        f = [lerp(f[0], nextF[0], k), lerp(f[1], nextF[1], k), lerp(f[2], nextF[2], k), lerp(f[3], nextF[3], k), lerp(f[4] || 4000, nextF[4] || 4000, k)];
      }
      return f;
    }

    for (let si = 0; si < segs.length; si++) {
      const seg = segs[si];
      const start = Math.max(0, Math.floor(seg.t * sr));
      const len = Math.max(1, Math.floor(seg.d * sr));
      const typ = seg.type;
      const targetHz = midiHz(clamp(seg.p, 43, 67));
      const fromHz = prevHz > 0 ? prevHz : targetHz * Math.pow(2, typ === 'vowel' ? -0.06 : -0.02);
      const leap = Math.abs(Math.log2(targetHz / Math.max(70, fromHz)));
      const glideT = clamp(0.05 + leap * 0.08, 0.05, 0.18);
      const phraseLike = typ === 'vowel';
      const scoopCents = ((phraseLike && leap > 0.08 ? 50 : 28) + rand() * 35) * scoopScale * (typ === 'vowel' ? 1 : 0.25);
      const scoopT = 0.05 + rand() * 0.035;
      const vibDelay = 0.20 + rand() * 0.14;
      const vibGrow = 0.28 + rand() * 0.24;
      const vibRate0 = 5.05 + rand() * 0.40;
      const vibDepth0 = (0.020 + rand() * 0.008) * Math.max(0, vibScale);
      const vibRateJit = 0.12 + rand() * 0.1;
      const vibDepthJit = 0.18 + rand() * 0.12;
      const vibPhase = rand() * Math.PI * 2;
      const rateWanderPh = rand() * Math.PI * 2;
      const depthWanderPh = rand() * Math.PI * 2;
      const fall = (si === segs.length - 1 || (segs[si + 1] && segs[si + 1].restBreath)) ? 0.02 : (typ === 'vowel' ? 0.006 : 0);
      const oq = 0.61 + rand() * 0.04 + oqBias;
      const rd = 0.95 + rand() * 0.16 + rdBias;
      const lf = typ === 'vowel' || typ === 'nasal' || typ === 'liquid' || typ === 'vfric' || typ === 'vstop'
        ? makeLF(oq, oq * (0.64 + rand() * 0.04), clamp(0.013 * rd, 0.011, 0.032))
        : null;
      let drift = (rand() - 0.5) * 4;
      const driftTau = 0.32 + rand() * 0.22;
      const driftSig = 9;
      let jit = 1;
      let shim = 1;
      const loud = 0.86 + rand() * 0.26;
      const prevF = si > 0 && !segs[si - 1].restBreath ? formantsOf(segs[si - 1].ph, 1) : null;
      const nextF = si + 1 < segs.length && !segs[si + 1].restBreath ? formantsOf(segs[si + 1].ph, 0) : null;
      const closeN = (typ === 'stop' || typ === 'vstop') ? Math.floor(sr * (typ === 'stop' ? (seg.ph === 'K' ? 0.02 : seg.ph === 'T' ? 0.016 : 0.012) : 0.01)) : 0;
      const burstN = (typ === 'stop' || typ === 'vstop') ? Math.floor(sr * ((seg.ph === 'CH' || seg.ph === 'JH') ? 0.04 : typ === 'stop' ? 0.016 : 0.012)) : 0;

      for (let i = 0; i < len; i++) {
        const o = start + i;
        if (o >= n) break;
        const t = i / sr;
        const u = i / len;
        const dt = 1 / sr;
        let y = 0;
        let env = 1;

        if (typ === 'stop' || typ === 'vstop') {
          if (i < closeN) {
            if (typ === 'vstop' && lf) {
              const pulse = lf(phase);
              phase += (targetHz * 0.45 * jit) / sr;
              if (phase >= 1) { phase -= Math.floor(phase); jit = 1 + (rand() * 2 - 1) * 0.009; }
              y = pulse * 0.1;
            } else y = 0;
          } else if (i < closeN + burstN) {
            const bu = (i - closeN) / Math.max(1, burstN);
            const amp = Math.exp(-bu / 0.18) * (bu < 0.08 ? bu / 0.08 : 1);
            y = noiseAt(seg.ph) * amp * (typ === 'stop' ? 0.38 : 0.24);
          } else {
            const vu = (i - closeN - burstN) / Math.max(1, len - closeN - burstN);
            const asp = typ === 'stop' ? 0.16 * (1 - vu) : 0.06 * (1 - vu);
            y = noiseAt(seg.ph) * asp;
          }
        } else if (typ === 'fric' || typ === 'vfric') {
          const amt = seg.restBreath ? (seg.amount || 0.04) : (typ === 'fric' ? 0.36 : 0.32);
          env = Math.sin(Math.PI * Math.min(1, u * 1.2));
          y = noiseAt(seg.ph) * amt;
        }

        const voicedNow = !!VOICED[seg.ph] && !(typ === 'stop' || (typ === 'vstop' && i < closeN));
        if (voicedNow && lf) {
          drift += (-drift / driftTau) * dt + driftSig * Math.sqrt(dt) * (rand() * 2 - 1) * 1.2;
          drift = clamp(drift, -22, 22);
          let hz = lerp(fromHz, targetHz, smooth(t / glideT));
          if (typ === 'vowel') {
            const scoopAmt = smooth(t / scoopT);
            hz *= Math.pow(2, (scoopCents * (1 - scoopAmt)) / -1200);
            if (u > 0.84) hz *= Math.pow(2, -fall * 1.4 * smooth((u - 0.84) / 0.16));
          }
          const vibEnv = typ === 'vowel' ? smooth((t - vibDelay) / vibGrow) : 0;
          const rate = vibRate0 * (1 + vibRateJit * 0.35 * Math.sin(2 * Math.PI * 0.33 * (seg.t + t) + rateWanderPh));
          const depth = vibDepth0 * vibEnv * (1 + vibDepthJit * 0.4 * Math.sin(2 * Math.PI * 0.27 * (seg.t + t) + depthWanderPh));
          hz *= 1 + depth * Math.sin(2 * Math.PI * rate * (seg.t + t) + vibPhase);
          hz *= Math.pow(2, drift / 1200);
          hz = clamp(hz, 70, 1200);
          phase += (hz * jit) / sr;
          if (phase >= 1) {
            phase -= Math.floor(phase);
            jit = 1 + (rand() * 2 - 1) * 0.006;
            shim = 1 + (rand() * 2 - 1) * 0.018;
          }
          const sourcePulse = lf(phase) * shim;
          let breath = rand() * 2 - 1;
          airLp += 0.12 * (breath - airLp);
          breath = breath - airLp;
          const breathAmt = (0.022 + 0.010 * (1 - u) + (seg.ph === 'HH' ? 0.03 * (1 - smooth(t / 0.2)) : 0)) * Math.max(0, breathScale);
          const source = sourcePulse * 0.95 + breath * breathAmt;
          const fv = targets(seg, u, prevF, nextF);
          const bwMul = typ === 'nasal' ? 0.85 : 1;
          for (let k = 0; k < 5; k++) res[k].set((fv[k] || 4000) * formant * (1 + 0.004 * Math.sin(2 * Math.PI * 0.7 * (seg.t + t) + k)), BW[k] * bwMul);
          let vf = res[0].tick(source) * 1.05
            + res[1].tick(source) * 1.05
            + res[2].tick(source) * 0.68
            + res[3].tick(source) * 0.34
            + res[4].tick(source) * 0.14
            + singer.tick(source) * (typ === 'nasal' ? 0.1 : 0.22)
            + chest.tick(source) * (typ === 'nasal' ? 0.42 : 0.38);
          if (typ === 'nasal') vf = vf * 0.75 + nasalRes.tick(source) * 0.55;
          if (typ === 'vstop' && i >= closeN + burstN) y += vf * 0.8;
          else if (typ !== 'stop' && typ !== 'vstop' && typ !== 'vfric' && typ !== 'fric') y = vf;

          if (typ === 'vowel') {
            const attack = smooth(t / 0.04);
            const rel = 1 - smooth((u - 0.88) / 0.12);
            const swell = 0.86 + 0.14 * Math.sin(Math.PI * Math.min(1, u * 1.05));
            const vibAmp = 1 + vibEnv * 0.045 * Math.sin(2 * Math.PI * rate * (seg.t + t) + vibPhase + 0.7);
            env = Math.max(0, attack) * rel * swell * vibAmp * loud;
          } else if (typ === 'nasal' || typ === 'liquid') {
            env = smooth(t / 0.012) * (1 - 0.08 * smooth((u - 0.9) / 0.1)) * loud;
          }
          if (typ === 'vfric' || typ === 'fric') {
            const noise = typ === 'vfric' ? y : (y + vf * 0.12);
            const voice = typ === 'vfric' ? vf * env * 0.16 : 0;
            mono[o] += voice + noise * env;
          } else {
            mono[o] += y * env * 0.2;
          }
        } else {
          if (typ === 'fric' && seg.ph === 'HH' && seg.restBreath) {
            env = Math.sin(Math.PI * Math.min(1, u * 1.2));
          }
          mono[o] += y * env;
        }
      }
      if (typ === 'vowel' || typ === 'nasal' || typ === 'liquid') prevHz = targetHz * Math.pow(2, -fall);
    }

    let peak = peakOf(mono);
    if (peak > 0) {
      const g = 0.72 / peak;
      for (let i = 0; i < n; i++) mono[i] *= g;
    }
    vocalChain(mono, sr);

    const left = new Float32Array(n);
    const right = new Float32Array(n);
    const wet = useBacking ? 0.30 : 0.26;
    const dry = useBacking ? 0.80 : 0.84;
    const preDelay = Math.round(0.024 * sr);
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
    }

    peak = Math.max(peakOf(left), peakOf(right));
    if (peak < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    const g = (useBacking ? 0.62 : 0.89) / peak;
    for (let i = 0; i < n; i++) {
      left[i] *= g;
      right[i] *= g;
    }
    if (useBacking) {
      addCountryBacking(left, right, notes, sr, opts.bpm || (flavor === 'country' ? 100 : 92), rand, flavor);
      warmMaster(left, right, sr);
    }
    peak = Math.max(peakOf(left), peakOf(right));
    if (peak < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    const g2 = 0.89 / peak;
    for (let i = 0; i < n; i++) {
      left[i] *= g2;
      right[i] *= g2;
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
    vowelOf: vowelOf,
    g2p: g2p,
    defaultMelody: defaultMelody,
    transposeNotes: transposeNotes,
    toBaritonePitch: toBaritonePitch
  };
});
