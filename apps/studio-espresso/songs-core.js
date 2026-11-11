/* Coffeebreak Studio Espresso - create, library, and ACE-Step vocal client.
   ACE-Step (ACE-Step/ACE-Step) is Apache-2.0. This file calls the public
   Space. It does not synthesise a singer locally. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CBCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PAY_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  const CART_KEY = 'cbx-espresso-cart';
  const MODEL = 'ACE-Step/ACE-Step';
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

  async function callSpace(endpoint, apiName, data, timeoutMs) {
    const posted = await fetch(endpoint + '/gradio_api/call/' + apiName, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data }),
    });
    if (!posted.ok) throw new Error('The vocal service refused the request (' + posted.status + '). Nothing was saved.');
    const accepted = await posted.json();
    if (!accepted.event_id) throw new Error('The vocal service did not accept the lyrics. Nothing was saved.');
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, timeoutMs || 120000);
    let streamed;
    try {
      streamed = await fetch(endpoint + '/gradio_api/call/' + apiName + '/' + accepted.event_id, ctrl ? { signal: ctrl.signal } : {});
    } catch (e) {
      throw new Error('The vocal model did not answer in time. Nothing was saved.');
    } finally { clearTimeout(timer); }
    if (!streamed.ok) throw new Error('The vocal service failed while generating (' + streamed.status + '). Nothing was saved.');
    const sse = parseSse(await streamed.text());
    if (sse.event === 'error') throw new Error('The vocal model returned an error. Nothing was saved.');
    if (sse.event !== 'complete') throw new Error('The vocal model did not finish. Nothing was saved.');
    let parsed;
    try { parsed = JSON.parse(sse.data); } catch (e) { throw new Error('The vocal model sent an unreadable result. Nothing was saved.'); }
    const file = parsed && parsed[0];
    if (!file || !file.url) throw new Error('The vocal model returned no audio. Nothing was saved.');
    const audio = await fetch(file.url);
    if (!audio.ok) throw new Error('The sung audio could not be downloaded. Nothing was saved.');
    const bytes = await audio.arrayBuffer();
    if (!bytes || bytes.byteLength < 8000) throw new Error('The vocal model returned an empty file. Nothing was saved.');
    return { bytes: bytes, info: parsed[1] && parsed[1].audio_duration ? Math.round(parsed[1].audio_duration) + 's sung audio' : 'sung audio', model: MODEL, license: 'Apache-2.0' };
  }

  async function singAceStep(lyrics, opts) {
    opts = opts || {};
    const line = opts.line ? String(opts.line).trim() : '';
    const text = line || String(lyrics || '').trim();
    if (wordsOf(text).length < 1 || (!line && wordsOf(text).length < 2)) throw new Error('Write at least two words to sing.');
    const seconds = opts.seconds || (line ? Math.max(8, Math.min(14, Math.round(wordsOf(line).length * 0.8 + 4))) : vocalSeconds(text));
    const steps = opts.steps == null ? 32 : opts.steps;
    const prompt = opts.prompt || 'a cappella, solo singing voice only, no instruments, no drums, clear lyrics, natural sung vocal';
    const endpoint = String(opts.endpoint || ENDPOINT).replace(/\/$/, '');
    const data = [seconds, prompt, '[Verse]\n' + text + '\n', steps, 15, 'euler', 'apg', 10, opts.seed == null ? 7 : opts.seed, 0.5, 0, 3, true, true, true, null, 0, 0, false, 0.5, null, 'none'];
    const sung = await callSpace(endpoint, '__call__', data, opts.timeoutMs || 120000);
    sung.seconds = seconds;
    return sung;
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
    singAceStep: singAceStep,
    parseSse: parseSse,
    wavStats: wavStats,
    memoryLibrary: memoryLibrary,
    metaOf: metaOf,
  };
});
