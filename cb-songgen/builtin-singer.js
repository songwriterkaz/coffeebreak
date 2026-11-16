/* Coffeebreak built-in singer.
   A formant synthesizer: each syllable is pitched to a melody, shaped like its vowel,
   and mixed with drums, bass and chords. No network, no ACE-Step, no canned file.
   The voice is a synthesizer, not a recording of a person. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CBBuiltinSinger = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const MODEL = 'Coffeebreak built-in synth voice';
  const CREDIT = 'the built-in synth voice in this browser. It sings the typed lyrics on a melody with drums, bass and chords. It is a synthesizer, not a recording of a person';
  const RATE = 22050;
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const MINOR = [0, 2, 3, 5, 7, 8, 10];
  const FORMANTS = {
    a: [[730, 90], [1090, 110], [2440, 150]],
    e: [[530, 70], [1840, 100], [2480, 140]],
    i: [[270, 60], [2290, 120], [3010, 170]],
    o: [[570, 80], [840, 90], [2410, 140]],
    u: [[300, 60], [870, 90], [2240, 130]],
    schwa: [[500, 90], [1500, 120], [2500, 160]],
  };

  function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function mulberry(seed) {
    let a = (seed || 1) >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function wordsOf(text) {
    return String(text || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  }

  function syllablesOfWord(word) {
    const raw = String(word || '');
    const latin = raw.toLowerCase().replace(/[^a-z']/g, '');
    if (!latin) return [raw || 'ah'];
    let parts = latin.match(/[^aeiouy]*[aeiouy]+[^aeiouy]*/g);
    if (!parts || !parts.length) parts = [latin];
    if (parts.length > 1 && parts[parts.length - 1] === 'e') parts[parts.length - 2] += parts.pop();
    return parts;
  }

  function vowelOf(syl) {
    const m = String(syl).toLowerCase().match(/[aeiouy]+/);
    if (!m) return 'schwa';
    const c = m[0][0];
    if (c === 'a') return 'a';
    if (c === 'e') return 'e';
    if (c === 'i' || c === 'y') return 'i';
    if (c === 'o') return 'o';
    if (c === 'u') return 'u';
    return 'schwa';
  }

  function syllabify(text) {
    const lines = String(text || '').split(/\n+/);
    const out = [];
    lines.forEach(function (line, li) {
      const words = wordsOf(line);
      words.forEach(function (word, wi) {
        syllablesOfWord(word).forEach(function (syl, si) {
          out.push({
            text: syl,
            vowel: vowelOf(syl),
            onset: String(syl).toLowerCase().match(/^[^aeiouy]+/),
            lineStart: li > 0 && wi === 0 && si === 0,
          });
        });
      });
    });
    return out;
  }

  function feelOf(prompt) {
    const text = String(prompt || '').toLowerCase();
    let bpm = 104;
    const bpmMatch = text.match(/(\d{2,3})\s*bpm/);
    if (bpmMatch) bpm = Math.max(72, Math.min(160, +bpmMatch[1]));
    else if (/slow|sad|lullaby|ballad/.test(text)) bpm = 78;
    else if (/fast|techno|house|drum and bass|dnb/.test(text)) bpm = 126;
    const minor = /minor|sad|dark|blues/.test(text);
    let key = 0;
    const km = text.match(/\b(?:in|key of)\s+([a-g])\s*(#|sharp|b|flat)?/);
    if (km) {
      key = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[km[1]];
      if (km[2] === '#' || km[2] === 'sharp') key = (key + 1) % 12;
      if (km[2] === 'b' || km[2] === 'flat') key = (key + 11) % 12;
    }
    let genre = 'pop';
    ['drum and bass', 'hip hop', 'lo-fi', 'house', 'techno', 'trap', 'reggae', 'country', 'jazz', 'rock', 'funk'].forEach(function (g) {
      if (text.includes(g)) genre = g;
    });
    return { bpm: bpm, minor: minor, key: key, genre: genre };
  }

  function scalePitch(key, scale, degree, base) {
    const d = ((degree % 7) + 7) % 7;
    const oct = Math.floor(degree / 7);
    return base + (key % 12) + scale[d] + 12 * oct;
  }

  function plan(input) {
    input = input || {};
    const lyrics = String(input.lyrics || '').trim();
    const syllables = syllabify(lyrics);
    if (syllables.length < 1 || wordsOf(lyrics).length < 2) {
      const err = new Error('Write at least two words to sing.');
      err.code = 'lyrics';
      throw err;
    }
    const feel = feelOf(input.prompt);
    const seconds = Math.max(4, Math.min(120, Math.round(+input.seconds) || 12));
    const seed = input.seed == null ? 1 : (input.seed | 0) || 1;
    const rng = mulberry(seed);
    const scale = feel.minor ? MINOR : MAJOR;
    const intro = 0.32;
    const gap = 0.04;
    const lineGap = 0.14;
    let extra = 0;
    syllables.forEach(function (s) { if (s.lineStart) extra += lineGap; });
    const usable = Math.max(syllables.length * 0.18, seconds - intro - 0.45 - extra);
    const dur = Math.max(0.18, Math.min(0.7, (usable - gap * Math.max(0, syllables.length - 1)) / syllables.length));
    let degree = 4;
    let t = intro;
    const notes = syllables.map(function (syl) {
      if (syl.lineStart) t += lineGap;
      degree = Math.max(0, Math.min(11, degree + Math.floor(rng() * 5) - 2));
      let midi = scalePitch(feel.key, scale, degree, 60);
      midi = Math.max(57, Math.min(76, midi));
      const note = {
        text: syl.text,
        vowel: syl.vowel,
        onset: syl.onset ? syl.onset[0] : '',
        midi: midi,
        hz: +midiHz(midi).toFixed(2),
        start: +t.toFixed(4),
        dur: +dur.toFixed(4),
      };
      t += dur + gap;
      return note;
    });
    const length = Math.max(seconds, t + 0.35);
    return {
      lyrics: lyrics,
      notes: notes,
      seconds: +length.toFixed(3),
      bpm: feel.bpm,
      key: feel.key,
      minor: feel.minor,
      genre: feel.genre,
      seed: seed,
      scale: scale,
    };
  }

  function resonator(freq, bw, sr) {
    const r = Math.exp(-Math.PI * bw / sr);
    const theta = 2 * Math.PI * Math.min(freq, sr * 0.45) / sr;
    return { a1: 2 * r * Math.cos(theta), a2: -(r * r), b0: 0.12 * (1 - r), y1: 0, y2: 0 };
  }

  function stepRes(res, x) {
    let y = res.b0 * x + res.a1 * res.y1 + res.a2 * res.y2;
    if (y > 4) y = 4;
    else if (y < -4) y = -4;
    res.y2 = res.y1;
    res.y1 = y;
    return y;
  }

  function ampEnv(t, dur) {
    const a = 0.025;
    const r = 0.05;
    if (t < a) return t / a;
    if (t > dur - r) return Math.max(0, (dur - t) / r);
    return 1;
  }

  function addVocal(vocal, score, sr, noise) {
    score.notes.forEach(function (note) {
      const form = FORMANTS[note.vowel] || FORMANTS.schwa;
      const filters = form.map(function (pair) { return resonator(pair[0], pair[1], sr); });
      const i0 = Math.max(0, Math.floor(note.start * sr));
      const i1 = Math.min(vocal.length, Math.floor((note.start + note.dur) * sr));
      const onset = note.onset || '';
      const noisy = /[sfhvz]/.test(onset) || onset.indexOf('sh') === 0 || onset.indexOf('th') === 0;
      const burst = /[ptkbdg]/.test(onset[0] || '');
      let phase = 0;
      for (let i = i0; i < i1; i++) {
        const t = (i - i0) / sr;
        const env = ampEnv(t, note.dur);
        const f0 = note.hz * (1 + 0.012 * Math.sin(2 * Math.PI * 5.1 * (note.start + t)));
        phase += f0 / sr;
        if (phase >= 1) phase -= 1;
        const pulse = phase < 0.04 ? (1 - phase / 0.04) : 0;
        let body = 0;
        for (let f = 0; f < filters.length; f++) body += stepRes(filters[f], pulse);
        let s = (0.55 * Math.sin(2 * Math.PI * phase) + 0.28 * body) * env;
        if (noisy && t < 0.07) s = s * (t / 0.07) + (noise() * 0.35) * (1 - t / 0.07);
        else if (burst && t < 0.025) s = noise() * 0.45 * (1 - t / 0.025) + s * (t / 0.025);
        vocal[i] += s;
      }
    });
  }

  function addKick(left, right, t0, sr) {
    const i0 = Math.floor(t0 * sr);
    const n = Math.floor(0.18 * sr);
    let phase = 0;
    for (let i = 0; i < n && i0 + i < left.length; i++) {
      const t = i / sr;
      const f = 150 * Math.exp(-t * 22) + 42;
      phase += f / sr;
      const s = Math.sin(2 * Math.PI * phase) * Math.exp(-t * 14) * 0.85;
      left[i0 + i] += s;
      right[i0 + i] += s;
    }
  }

  function addSnare(left, right, t0, sr, noise) {
    const i0 = Math.floor(t0 * sr);
    const n = Math.floor(0.16 * sr);
    let prev = 0;
    for (let i = 0; i < n && i0 + i < left.length; i++) {
      const t = i / sr;
      const x = noise();
      const hp = x - prev;
      prev = x;
      const env = Math.exp(-t * 22);
      const tone = Math.sin(2 * Math.PI * 196 * t) * Math.exp(-t * 30) * 0.25;
      const s = hp * env * 0.45 + tone;
      left[i0 + i] += s * 0.85;
      right[i0 + i] += s;
    }
  }

  function addHat(left, right, t0, sr, noise, open) {
    const i0 = Math.floor(t0 * sr);
    const n = Math.floor((open ? 0.09 : 0.035) * sr);
    let prev = 0;
    for (let i = 0; i < n && i0 + i < left.length; i++) {
      const x = noise();
      const hp = x - prev;
      prev = x;
      const s = hp * Math.exp(-i / n * 5) * 0.16;
      left[i0 + i] += s * 0.65;
      right[i0 + i] += s;
    }
  }

  function addTone(left, right, t0, dur, hz, gain, sr) {
    const i0 = Math.max(0, Math.floor(t0 * sr));
    const i1 = Math.min(left.length, Math.floor((t0 + dur) * sr));
    for (let i = i0; i < i1; i++) {
      const t = (i - i0) / sr;
      const env = ampEnv(t, dur);
      const s = (Math.sin(2 * Math.PI * hz * t) + 0.18 * Math.sin(2 * Math.PI * hz * 2 * t)) * gain * env;
      left[i] += s;
      right[i] += s;
    }
  }

  function addBacking(left, right, score, sr, noise) {
    const beat = 60 / score.bpm;
    const scale = score.scale;
    const prog = score.minor ? [0, 5, 2, 6] : [0, 4, 5, 3];
    const house = score.genre === 'house' || score.genre === 'techno';
    const bars = Math.ceil(score.seconds / (beat * 4));
    for (let bar = 0; bar < bars; bar++) {
      const degree = prog[bar % prog.length];
      const root = scalePitch(score.key, scale, degree, 36);
      const barStart = bar * beat * 4;
      addTone(left, right, barStart, beat * 3.6, midiHz(root), 0.22, sr);
      addTone(left, right, barStart, beat * 3.8, midiHz(scalePitch(score.key, scale, degree, 60)), 0.05, sr);
      addTone(left, right, barStart, beat * 3.8, midiHz(scalePitch(score.key, scale, degree + 2, 60)), 0.04, sr);
      addTone(left, right, barStart, beat * 3.8, midiHz(scalePitch(score.key, scale, degree + 4, 60)), 0.04, sr);
      for (let step = 0; step < 8; step++) {
        const t = barStart + step * beat * 0.5;
        if (t >= score.seconds) break;
        const beatIndex = Math.floor(step / 2);
        const onBeat = step % 2 === 0;
        if (onBeat && (house || beatIndex === 0 || beatIndex === 2)) addKick(left, right, t, sr);
        if (onBeat && beatIndex === 1 || (onBeat && beatIndex === 3)) addSnare(left, right, t, sr, noise);
        addHat(left, right, t, sr, noise, step % 4 === 2);
      }
    }
  }

  function peakOf(buf) {
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
      const a = buf[i] < 0 ? -buf[i] : buf[i];
      if (a > peak) peak = a;
    }
    return peak;
  }

  function scaleBuf(buf, g) {
    for (let i = 0; i < buf.length; i++) buf[i] *= g;
  }

  function encodeWav(left, right, sr) {
    const n = left.length;
    const buffer = new ArrayBuffer(44 + n * 4);
    const view = new DataView(buffer);
    function str(o, s) { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF');
    view.setUint32(4, 36 + n * 4, true);
    str(8, 'WAVE');
    str(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 2, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    str(36, 'data');
    view.setUint32(40, n * 4, true);
    let o = 44;
    for (let i = 0; i < n; i++) {
      let l = left[i];
      let r = right[i];
      if (l > 1) l = 1; else if (l < -1) l = -1;
      if (r > 1) r = 1; else if (r < -1) r = -1;
      view.setInt16(o, (l * 32767) | 0, true);
      view.setInt16(o + 2, (r * 32767) | 0, true);
      o += 4;
    }
    return buffer;
  }

  function estimatePitch(samples, sr, start, len) {
    start = Math.max(0, start | 0);
    len = Math.max(16, len | 0);
    if (start >= samples.length) return { hz: 0, corr: 0 };
    if (start + len > samples.length) len = samples.length - start;
    const dt = 1 / sr;
    const rc = 1 / (2 * Math.PI * 150);
    const alpha = rc / (rc + dt);
    const hp = new Float32Array(len);
    let y = 0;
    let x1 = 0;
    let energy = 0;
    for (let i = 0; i < len; i++) {
      const x = samples[start + i] || 0;
      y = alpha * (y + x - x1);
      x1 = x;
      hp[i] = y;
      energy += y * y;
    }
    const minLag = Math.max(1, Math.floor(sr / 900));
    const maxLag = Math.min(len - 2, Math.floor(sr / 70));
    let best = -1e12;
    let bestLag = minLag;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      const n = len - lag;
      for (let i = 0; i < n; i += 2) sum += hp[i] * hp[i + lag];
      if (sum > best) { best = sum; bestLag = lag; }
    }
    return { hz: sr / bestLag, corr: energy > 1e-8 ? best / (energy * 0.5) : 0 };
  }

  function sing(input) {
    const score = plan(input);
    const n = Math.ceil(score.seconds * RATE);
    const left = new Float32Array(n);
    const right = new Float32Array(n);
    const vocal = new Float32Array(n);
    const noiseState = { v: (score.seed * 9973 + 17) >>> 0 };
    function noise() {
      noiseState.v = (Math.imul(1664525, noiseState.v) + 1013904223) >>> 0;
      return noiseState.v / 4294967296 * 2 - 1;
    }
    addVocal(vocal, score, RATE, noise);
    for (let i = 0; i < n; i++) { left[i] = vocal[i]; right[i] = vocal[i]; }
    addBacking(left, right, score, RATE, noise);
    const peak = Math.max(peakOf(left), peakOf(right), 1e-8);
    const g = 0.89 / peak;
    scaleBuf(left, g);
    scaleBuf(right, g);
    scaleBuf(vocal, g);
    const bytes = encodeWav(left, right, RATE);
    return {
      bytes: bytes,
      mime: 'audio/wav',
      model: MODEL,
      license: 'Coffeebreak',
      credit: CREDIT,
      backend: 'builtin-singer',
      info: score.seconds.toFixed(1) + 's built-in synth song, ' + score.notes.length + ' sung syllables',
      seconds: score.seconds,
      rate: RATE,
      score: score,
      vocal: vocal,
      left: left,
      right: right,
    };
  }

  return {
    MODEL: MODEL,
    CREDIT: CREDIT,
    RATE: RATE,
    NOTES: NOTES,
    sing: sing,
    plan: plan,
    estimatePitch: estimatePitch,
    midiHz: midiHz,
    wordsOf: wordsOf,
  };
});
