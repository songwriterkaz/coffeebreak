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
  const NASAL_F = { M: [250, 1100, 2150, 2800], N: [270, 1400, 2500, 3200], NG: [260, 2000, 2500, 3000] };
  const LIQ_F = { L: [400, 950, 2650, 3300], R: VOWELS.r, W: [350, 700, 2300, 3200], Y: VOWELS.i };

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
    S:0.085,SH:0.09,F:0.07,TH:0.07,HH:0.065,Z:0.08,ZH:0.08,V:0.07,DH:0.065,
    P:0.075,T:0.07,K:0.08,B:0.06,D:0.06,G:0.07,CH:0.09,JH:0.08,
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
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
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
      const wordSegs = scheduleWord(phones, note.t + timing, Math.max(0.16, note.d), clamp(note.p, 48, 84));
      if (phraseStart) segs.push({ ph: 'HH', type: 'fric', t: Math.max(0, (wordSegs[0] ? wordSegs[0].t : note.t) - 0.1), d: 0.11, p: note.p, restBreath: true, amount: 0.04 });
      wordSegs.forEach(function (s) { segs.push(s); });
    }

    const last = segs.length ? segs[segs.length - 1] : null;
    const scoredNotes = notes.length ? notes[notes.length - 1] : null;
    const scored = (score && score.seconds) || (last ? last.t + last.d : (scoredNotes ? scoredNotes.t + scoredNotes.d : 2));
    const tail = 1.55;
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

    function noiseAt(kind) {
      let x = rand() * 2 - 1;
      if (kind === 'S' || kind === 'Z') {
        x = sRes.tick(x);
        hpS += 0.22 * (x - hpS);
        x = x - hpS;
      } else if (kind === 'SH' || kind === 'ZH' || kind === 'CH' || kind === 'JH') {
        x = shRes.tick(x);
        if (kind === 'CH' || kind === 'JH') x = 0.65 * x + 0.35 * tRes.tick(rand() * 2 - 1);
      } else if (kind === 'T' || kind === 'D') x = tRes.tick(x);
      else if (kind === 'K' || kind === 'G') x = kRes.tick(x);
      else if (kind === 'P' || kind === 'B') x = pRes.tick(x) * 0.7 + (rand() * 2 - 1) * 0.3;
      else if (kind === 'F' || kind === 'V' || kind === 'TH' || kind === 'DH' || kind === 'HH') {
        airLp += 0.08 * (x - airLp);
        x = (x - airLp) * (kind === 'HH' ? 0.7 : 0.85);
      }
      return x;
    }

    function targets(seg, u, prevF, nextF) {
      let f = formantsOf(seg.ph, u);
      const trans = 0.02 / Math.max(0.04, seg.d);
      if (prevF && u < trans) {
        const k = smooth(u / trans);
        f = [lerp(prevF[0], f[0], k), lerp(prevF[1], f[1], k), lerp(prevF[2], f[2], k), lerp(prevF[3], f[3], k)];
      } else if (nextF && u > 1 - trans) {
        const k = smooth((u - (1 - trans)) / trans);
        f = [lerp(f[0], nextF[0], k), lerp(f[1], nextF[1], k), lerp(f[2], nextF[2], k), lerp(f[3], nextF[3], k)];
      }
      return f;
    }

    for (let si = 0; si < segs.length; si++) {
      const seg = segs[si];
      const start = Math.max(0, Math.floor(seg.t * sr));
      const len = Math.max(1, Math.floor(seg.d * sr));
      const typ = seg.type;
      const targetHz = midiHz(clamp(seg.p, 48, 84));
      const fromHz = prevHz > 0 ? prevHz : targetHz * Math.pow(2, typ === 'vowel' ? -0.06 : -0.02);
      const leap = Math.abs(Math.log2(targetHz / Math.max(70, fromHz)));
      const glideT = clamp(0.05 + leap * 0.08, 0.05, 0.18);
      const phraseLike = typ === 'vowel';
      const scoopCents = ((phraseLike && leap > 0.08 ? 50 : 28) + rand() * 35) * scoopScale * (typ === 'vowel' ? 1 : 0.25);
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
      const fall = (si === segs.length - 1 || (segs[si + 1] && segs[si + 1].restBreath)) ? 0.02 : (typ === 'vowel' ? 0.006 : 0);
      const oq = 0.58 + rand() * 0.08 + oqBias;
      const rd = 1.05 + rand() * 0.35 + rdBias;
      const lf = typ === 'vowel' || typ === 'nasal' || typ === 'liquid' || typ === 'vfric' || typ === 'vstop'
        ? makeLF(oq, oq * (0.62 + rand() * 0.06), clamp(0.018 * rd, 0.014, 0.06))
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
            y = noiseAt(seg.ph) * amp * (typ === 'stop' ? 0.3 : 0.2);
          } else {
            const vu = (i - closeN - burstN) / Math.max(1, len - closeN - burstN);
            const asp = typ === 'stop' ? 0.16 * (1 - vu) : 0.06 * (1 - vu);
            y = noiseAt(seg.ph) * asp;
          }
        } else if (typ === 'fric' || typ === 'vfric') {
          const amt = seg.restBreath ? (seg.amount || 0.04) : (typ === 'fric' ? 0.30 : 0.28);
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
            jit = 1 + (rand() * 2 - 1) * 0.009;
            shim = 1 + (rand() * 2 - 1) * 0.05;
          }
          const sourcePulse = lf(phase) * shim;
          let breath = rand() * 2 - 1;
          airLp += 0.12 * (breath - airLp);
          breath = breath - airLp;
          const breathAmt = (0.03 + 0.018 * (1 - u) + (seg.ph === 'HH' ? 0.045 * (1 - smooth(t / 0.2)) : 0)) * Math.max(0, breathScale);
          const source = sourcePulse * 0.95 + breath * breathAmt;
          const fv = targets(seg, u, prevF, nextF);
          const bwMul = typ === 'nasal' ? 0.85 : 1;
          for (let k = 0; k < 4; k++) res[k].set(fv[k] * formant * (1 + 0.004 * Math.sin(2 * Math.PI * 0.7 * (seg.t + t) + k)), BW[k] * bwMul);
          let vf = res[0].tick(source) * 1.05
            + res[1].tick(source) * 0.85
            + res[2].tick(source) * 0.45
            + res[3].tick(source) * 0.22
            + singer.tick(source) * (typ === 'nasal' ? 0.1 : 0.2)
            + chest.tick(source) * (typ === 'nasal' ? 0.28 : 0.18);
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

    const left = new Float32Array(n);
    const right = new Float32Array(n);
    const wet = 0.28;
    const dry = 0.78;
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
    vowelOf: vowelOf,
    g2p: g2p
  };
});
