/* Coffeebreak Studio Espresso - create, library, and the Coffeebreak voice.
   The sung vocal is made in the browser. No outside singing service is used. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CBCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PAY_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  const CART_KEY = 'cbx-espresso-cart';
  const MODEL = 'Coffeebreak voice';
  const ENDPOINT = 'https://ace-step-ace-step.hf.space';
  const VOICES = [
    { id: 'en1', label: 'English demo voice 1 (GTSinger reference)', api: 'EN singer 1 — GTSinger' },
    { id: 'en2', label: 'English demo voice 2 (Opencpop reference)', api: 'EN singer 2 — Opencpop' },
    { id: 'zh1', label: 'Mandarin demo voice 1 (GTSinger reference)', api: 'ZH singer 1 — GTSinger' },
    { id: 'zh2', label: 'Mandarin demo voice 2 (GTSinger reference)', api: 'ZH singer 2 — GTSinger' },
  ];
  const MOODS = ['Happy', 'Sad', 'Dreamy', 'Dark', 'Bouncy', 'Epic', 'Lullaby'];
  const GENRES = ['Rock', 'Rockabilly', 'House', 'Techno', 'Hip hop', 'Trap', 'Drum and bass', 'Reggae', 'Funk', 'Pop', 'Country', 'Jazz', 'Country shuffle', 'Lo-fi'];
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const ALIASES = [
    ['country shuffle', 'Country shuffle'],
    ['drum and bass', 'Drum and bass'],
    ['drum & bass', 'Drum and bass'],
    ['dnb', 'Drum and bass'],
    ['hip hop', 'Hip hop'],
    ['hip-hop', 'Hip hop'],
    ['lo-fi', 'Lo-fi'],
    ['lofi', 'Lo-fi'],
    ['rockabilly', 'Rockabilly'],
  ];

  function mint(rng) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = 'CB';
    for (let i = 0; i < 8; i++) s += alphabet[Math.floor(rng() * alphabet.length)];
    return s;
  }

  function readCart(storage, rng) {
    rng = rng || Math.random;
    let saved = null;
    try { saved = JSON.parse(storage.getItem(CART_KEY) || 'null'); } catch (e) { saved = null; }
    const reference = saved && typeof saved.reference === 'string' && /^CB[A-Z2-9]{8}$/.test(saved.reference) ? saved.reference : mint(rng);
    const cart = {
      item: 'Coffeebreak Studio Espresso',
      amount: 10,
      currency: 'USD',
      reference: reference,
      paid: false,
      status: 'awaiting_transfer',
      label: PAY_LABEL,
    };
    try { storage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    return cart;
  }

  function wordsOf(line) {
    return String(line || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  }

  function voiceById(id) {
    return VOICES.find(v => v.id === id) || null;
  }

  function defaultVoiceId(lyrics) {
    return /[\u3400-\u9fff]/.test(lyrics || '') ? 'zh1' : 'en1';
  }

  function readStyle(input) {
    input = input || {};
    const mood = MOODS.includes(input.mood) ? input.mood : 'Happy';
    const genre = GENRES.includes(input.genre) ? input.genre : 'Pop';
    let key = Math.max(0, Math.min(11, input.key | 0));
    let minor = !!input.minor;
    let bpm = Math.max(72, Math.min(140, Math.round(+input.bpm || 110)));
    const text = String(input.description || '').toLowerCase();
    const matched = [];
    const genreHits = ALIASES.concat(GENRES.map(g => [g.toLowerCase(), g])).sort((a, b) => b[0].length - a[0].length);
    for (const [needle, name] of genreHits) {
      if (needle && text.includes(needle)) { matched.push(name); break; }
    }
    for (const name of MOODS) {
      if (text.includes(name.toLowerCase())) { matched.push(name); break; }
    }
    const keyMatch = text.match(/\b(?:in|key of)\s+([a-g])\s*(#|sharp|flat|b)?\s*(minor|major)?/);
    if (keyMatch) {
      const base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[keyMatch[1]];
      let k = base;
      if (keyMatch[2] === '#' || keyMatch[2] === 'sharp') k = (k + 1) % 12;
      if (keyMatch[2] === 'b' || keyMatch[2] === 'flat') k = (k + 11) % 12;
      key = k;
      if (keyMatch[3] === 'minor') minor = true;
      if (keyMatch[3] === 'major') minor = false;
      matched.push(NOTE_NAMES[key] + (minor ? ' minor' : ' major'));
    } else if (/\bminor\b/.test(text)) { minor = true; matched.push('minor'); }
    else if (/\bmajor\b/.test(text)) { minor = false; matched.push('major'); }
    const bpmMatch = text.match(/\b(\d{2,3})\s*bpm\b/);
    if (bpmMatch) bpm = Math.max(72, Math.min(140, +bpmMatch[1]));
    else if (/\bfast\b/.test(text)) bpm = 132;
    else if (/\bslow\b/.test(text)) bpm = 78;
    const pickedGenre = matched.find(m => GENRES.includes(m)) || genre;
    const pickedMood = matched.find(m => MOODS.includes(m)) || mood;
    return { mood: pickedMood, genre: pickedGenre, key: key, minor: minor, bpm: bpm, matched: matched };
  }

  function progressionFor(style) {
    const minor = style.minor || style.mood === 'Sad' || style.mood === 'Dark' || style.mood === 'Lullaby';
    if (style.genre === 'Country' || style.genre === 'Country shuffle') return { name: 'Country I-IV-I-V', minor: false };
    if (style.genre === 'Jazz' || style.genre === 'Rockabilly') return { name: '12 bar blues', minor: false };
    if (minor) return { name: 'i-VI-III-VII', minor: true };
    if (style.mood === 'Dreamy') return { name: 'vi-IV-I-V', minor: false };
    if (style.mood === 'Epic') return { name: 'I-vi-IV-V', minor: false };
    return { name: 'I-V-vi-IV', minor: false };
  }

  function buildScore(lyrics, notes, bpm) {
    const lines = String(lyrics || '').split(/\n+/);
    const groups = lines.map(wordsOf).filter(g => g.length);
    const words = groups.flat();
    if (words.length < 2) throw new Error('Write at least two words to sing.');
    const beat = 60 / Math.max(72, Math.min(140, bpm || 110));
    const seq = (notes || []).filter(n => n && n.l > 0.05);
    const out = [];
    let t = 0;
    const cap = 22;
    let wi = 0;
    for (let g = 0; g < groups.length && t < cap - 0.2; g++) {
      if (g > 0 && t + 0.45 < cap) {
        out.push({ text: ' ', pitch: 50, duration: 0.28, rest: true });
        t += 0.28;
      }
      for (const word of groups[g]) {
        if (t >= cap - 0.18) break;
        const src = seq.length ? seq[wi % seq.length] : { p: 64, l: 0.5 };
        let dur = Math.max(0.24, Math.min(0.85, (src.l || 0.5) * beat));
        if (t + dur > cap) dur = Math.max(0.24, +(cap - t).toFixed(3));
        const pitch = Math.max(50, Math.min(79, src.p | 0));
        out.push({ text: word, pitch: pitch, duration: +dur.toFixed(3), rest: false });
        t += dur;
        wi++;
      }
    }
    const sung = out.filter(n => !n.rest);
    if (sung.length < 2) throw new Error('Write at least two words to sing.');
    return {
      notes: out,
      text: out.map(n => n.text + '|' + n.pitch + '|' + n.duration).join('\n'),
      seconds: +t.toFixed(3),
      words: sung.length,
    };
  }

  function parseSse(raw) {
    let event = '';
    let data = '';
    String(raw || '').split(/\n\n/).forEach(block => {
      let ev = '';
      let payload = '';
      block.split(/\n/).forEach(line => {
        if (line.startsWith('event:')) ev = line.slice(6).trim();
        else if (line.startsWith('data:')) payload += line.slice(5).trim();
      });
      if (ev === 'complete' || ev === 'error') { event = ev; data = payload; }
    });
    return { event: event, data: data };
  }

  function lyricLines(text) {
    const lines = String(text || '').split(/\n/).map(s => s.trim()).filter(Boolean);
    return lines.length ? lines : CWords(text);
  }

  function CWords(text) {
    const words = wordsOf(text);
    return words.length ? [words.join(' ')] : [];
  }

  function vocalSeconds(lyrics) {
    const words = Math.max(2, wordsOf(lyrics).length);
    const lines = Math.max(1, String(lyrics || '').split(/\n/).filter(s => s.trim()).length);
    return Math.max(12, Math.min(28, Math.round(words * 0.45 + lines * 1.5)));
  }

  function defaultNotes(count, seed, key) {
    const scale = [0, 2, 4, 5, 7, 9, 11];
    const notes = [];
    let deg = 7;
    const s = (seed == null ? 3 : seed) | 0;
    const k = key || 0;
    for (let i = 0; i < Math.max(count, 2); i++) {
      deg = Math.max(0, Math.min(14, deg + ((s * 17 + i * 31) % 5) - 2));
      const p = 60 + k + scale[deg % 7] + 12 * Math.floor(deg / 7) - 12;
      notes.push({ p: p, s: i, l: 1, v: 0.8 });
    }
    return notes;
  }

  function voiceModule(opts) {
    if (opts && opts.voice && typeof opts.voice.sing === 'function') return opts.voice;
    const g = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : {});
    if (g.CBVoice && typeof g.CBVoice.sing === 'function') return g.CBVoice;
    if (typeof require === 'function') return require('./voice.js');
    throw new Error('The Coffeebreak voice could not be loaded.');
  }

  async function singVoice(lyrics, opts) {
    opts = opts || {};
    const line = opts.line ? String(opts.line).trim() : '';
    const text = line || String(lyrics || '').trim();
    if (wordsOf(text).length < 1 || (!line && wordsOf(text).length < 2)) throw new Error('Write at least two words to sing.');
    if (typeof opts.onStatus === 'function') opts.onStatus('Singing with the Coffeebreak voice.');
    const voice = voiceModule(opts);
    const bpm = Math.max(72, Math.min(140, opts.bpm || 110));
    const notes = (opts.notes && opts.notes.length) ? opts.notes : defaultNotes(wordsOf(text).length, opts.seed, opts.key);
    const score = buildScore(text, notes, bpm);
    if (opts.seconds && score.seconds > 0.2) {
      const target = Math.max(4, Math.min(120, +opts.seconds));
      const k = target / score.seconds;
      score.notes.forEach(function (n) {
        if (n.duration != null) n.duration *= k;
        if (n.d != null) n.d *= k;
        if (n.t != null) n.t *= k;
      });
      score.seconds = target;
    }
    const wav = voice.sing(score, { seed: opts.seed, key: opts.key, bpm: bpm });
    if (!wav || wav.byteLength < 100) throw new Error('The Coffeebreak voice returned silence. Nothing was saved.');
    return {
      bytes: wav,
      mime: 'audio/wav',
      model: MODEL,
      license: '',
      credit: 'Coffeebreak voice',
      info: 'Sung in the browser with the Coffeebreak voice.',
      backend: 'coffeebreak-voice',
      seconds: score.seconds,
    };
  }

  function singAceStep(lyrics, opts) {
    return singVoice(lyrics, opts);
  }

  function wavStats(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    let offset = 12;
    let rate = 44100;
    while (offset + 8 <= view.byteLength) {
      const id = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
      const size = view.getUint32(offset + 4, true);
      if (id === 'fmt ') rate = view.getUint32(offset + 12, true) || rate;
      if (id === 'data') {
        const n = Math.floor(size / 2);
        let peak = 0;
        let energy = 0;
        const step = Math.max(1, Math.floor(n / 20000));
        let counted = 0;
        for (let i = 0; i < n; i += step) {
          const s = Math.abs(view.getInt16(offset + 8 + i * 2, true)) / 32768;
          if (s > peak) peak = s;
          energy += s * s;
          counted++;
        }
        return { peak: peak, rms: Math.sqrt(energy / Math.max(1, counted)), duration: n / rate, rate: rate };
      }
      offset += 8 + size + (size % 2);
    }
    throw new Error('The vocal file is not a WAV.');
  }

  function metaOf(rec) {
    return { id: rec.id, title: rec.title, created: rec.created, summary: rec.summary, lyrics: rec.lyrics, level: rec.level == null ? 1 : rec.level, pitch: rec.pitch || 0, vocal: rec.vocal ? { model: rec.vocal.model, voice: rec.vocal.voice, info: rec.vocal.info } : null };
  }

  function memoryLibrary() {
    const rows = new Map();
    return {
      async list() { return [...rows.values()].map(metaOf).sort((a, b) => b.created - a.created); },
      async get(id) { return rows.get(id) || null; },
      async put(rec) { rows.set(rec.id, rec); return rec; },
      async remove(id) { rows.delete(id); },
    };
  }

  return {
    PAY_LABEL: PAY_LABEL,
    MODEL: MODEL,
    ENDPOINT: ENDPOINT,
    VOICES: VOICES,
    MOODS: MOODS,
    GENRES: GENRES,
    NOTE_NAMES: NOTE_NAMES,
    readCart: readCart,
    readStyle: readStyle,
    progressionFor: progressionFor,
    buildScore: buildScore,
    wordsOf: wordsOf,
    voiceById: voiceById,
    defaultVoiceId: defaultVoiceId,
    lyricLines: lyricLines,
    vocalSeconds: vocalSeconds,
    singVoice: singVoice,
    singAceStep: singAceStep,
    parseSse: parseSse,
    wavStats: wavStats,
    memoryLibrary: memoryLibrary,
    metaOf: metaOf,
  };
});
