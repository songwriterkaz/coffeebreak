/* Coffeebreak Vocal Studio - in-browser singing and tool browser. */
(function () {
  const $ = (id) => document.getElementById(id);
  const PAGE = 80;
  const state = {
    lyrics: '',
    style: null,
    bpm: 110,
    seed: 3,
    wav: null,
    samples: null,
    sampleRate: 44100,
    audio: null,
    selected: null,
    page: 0,
    cat: '',
    query: '',
    hits: []
  };

  function wordsOf(text) {
    return String(text || '').split(/\s+/).map(s => s.replace(/[^a-zA-Z0-9']+/g, '')).filter(Boolean);
  }

  function setStatus(text) {
    const el = $('status');
    if (el) el.textContent = text || '';
  }

  function countsLine() {
    const c = CBVocalTools.counts();
    return c.tools + ' tools, ' + c.presets.toLocaleString('en-US') + ' presets';
  }

  function buildScore(lyrics, notes, bpm, seconds) {
    const words = wordsOf(lyrics);
    if (words.length < 2) throw new Error('Write at least two words to sing.');
    const beat = 60 / Math.max(72, Math.min(140, bpm || 110));
    const seq = notes && notes.length ? notes : [];
    const out = [];
    let t = 0;
    for (let i = 0; i < words.length; i++) {
      const src = seq.length ? seq[i % seq.length] : { p: 64, l: 1 };
      const dur = Math.max(0.24, (src.l || 1) * beat);
      out.push({ text: words[i], w: words[i], pitch: src.p, p: src.p, t: t, d: dur, duration: dur, rest: false });
      t += dur;
    }
    const score = { notes: out, seconds: t, words: words.length };
    if (seconds && t > 0.2) {
      const k = Math.max(4, Math.min(120, seconds)) / t;
      out.forEach(function (n) { n.t *= k; n.d *= k; n.duration = n.d; });
      score.seconds = Math.max(4, Math.min(120, seconds));
    }
    return score;
  }

  function vocalSeconds(lyrics) {
    const words = Math.max(2, wordsOf(lyrics).length);
    const lines = Math.max(1, String(lyrics || '').split(/\n/).filter(s => s.trim()).length);
    return Math.max(8, Math.min(28, Math.round(words * 0.45 + lines * 1.5)));
  }

  function decodeWav(buf) {
    return CBVoice.decodeMono(buf);
  }

  function encodeAndHold(samples, sr, wavMaybe) {
    state.samples = samples;
    state.sampleRate = sr;
    state.wav = wavMaybe || CBVoice.encodeWav(samples, null, sr);
    return state.wav;
  }

  function playWav(wav) {
    if (state.audio) { state.audio.pause(); URL.revokeObjectURL(state.audio.src); }
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = $('player');
    audio.src = url;
    audio.hidden = false;
    state.audio = audio;
    audio.play().catch(function () {});
  }

  async function singLyrics(lyrics, opts) {
    opts = opts || {};
    const voice = window.CBVoice;
    if (!voice) throw new Error('The Coffeebreak voice could not be loaded.');
    const bpm = opts.bpm || state.bpm;
    const notes = opts.notes || null;
    const seconds = opts.seconds || vocalSeconds(lyrics);
    const score = buildScore(lyrics, notes, bpm, seconds);
    if (typeof opts.start === 'number' && opts.start) {
      const shift = opts.start;
      score.notes.forEach(function (n) { n.t = Math.max(0, n.t + shift); });
      score.seconds += Math.max(0, shift);
    }
    setStatus('Singing with the Coffeebreak voice.');
    const wav = voice.sing(score, { seed: opts.seed == null ? state.seed : opts.seed, bpm: bpm, style: opts.style || state.style || {} });
    const dec = decodeWav(wav);
    if (voice.peakOf(dec.samples) < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    encodeAndHold(dec.samples, dec.sampleRate, wav);
    state.lyrics = lyrics;
    state.bpm = bpm;
    playWav(state.wav);
    setStatus('Ready. The vocal is the Coffeebreak voice.');
    return { peak: voice.peakOf(dec.samples), seconds: dec.samples.length / dec.sampleRate, hz: null };
  }

  function mixAt(base, add, gain) {
    const n = Math.max(base.length, add.length);
    const out = new Float32Array(n);
    gain = gain == null ? 0.28 : gain;
    for (let i = 0; i < n; i++) out[i] = (i < base.length ? base[i] : 0) + (i < add.length ? add[i] * gain : 0);
    const pk = CBVocalTools.peakOf(out);
    if (pk > 0.95) {
      const g = 0.95 / pk;
      for (let i = 0; i < n; i++) out[i] *= g;
    }
    return out;
  }

  async function applyPreset(preset) {
    if (!preset) throw new Error('Choose a preset first.');
    if (preset.cat === 'Vocal style') {
      state.style = preset.params;
      if (wordsOf(state.lyrics).length >= 2) await singLyrics(state.lyrics, { style: preset.params, bpm: state.bpm, seed: state.seed });
      else setStatus('Style saved. It will be used when you create a vocal.');
      return { kind: 'style' };
    }
    if (preset.cat === 'Effect') {
      if (!state.samples) throw new Error('Create a vocal first, then apply an effect.');
      const y = CBVocalTools.applyEffect(state.samples, state.sampleRate, preset);
      if (CBVocalTools.peakOf(y) < 0.02) throw new Error('That effect left the vocal too quiet. It was not kept.');
      encodeAndHold(y, state.sampleRate);
      playWav(state.wav);
      setStatus('Applied ' + preset.name + '.');
      return { kind: 'effect', peak: CBVocalTools.peakOf(y) };
    }
    if (preset.cat === 'Instrument') {
      const tone = CBVocalTools.instrumentTone(preset, state.sampleRate || 44100, 1.4, 220);
      if (state.samples) {
        const y = mixAt(state.samples, tone, 0.32);
        encodeAndHold(y, state.sampleRate);
        playWav(state.wav);
        setStatus('Mixed ' + preset.name + ' under the vocal.');
      } else {
        encodeAndHold(tone, 44100);
        playWav(state.wav);
        setStatus('Previewing ' + preset.name + '.');
      }
      return { kind: 'instrument' };
    }
    if (preset.tool === 'Melody' || preset.tool === 'Phrase') {
      const lyrics = state.lyrics || ($('lyrics') && $('lyrics').value) || '';
      if (wordsOf(lyrics).length < 2) throw new Error('Write at least two words to sing.');
      const notes = preset.tool === 'Melody' ? CBVocalTools.melodyPitches(wordsOf(lyrics).length, preset) : null;
      const seconds = preset.params && preset.params.seconds ? preset.params.seconds * (preset.params.feel || 1) : vocalSeconds(lyrics);
      const bpm = state.bpm;
      await singLyrics(lyrics, { notes: notes, seconds: seconds, start: preset.params && preset.params.start, bpm: bpm, style: state.style, seed: state.seed });
      setStatus('Sang with ' + preset.name + '.');
      return { kind: 'generator' };
    }
    if (preset.tool === 'Harmony') {
      if (!state.samples) throw new Error('Create a vocal first, then add harmony.');
      const semis = (preset.params.interval || 7) * (preset.params.voicing < 0 ? -1 : 1);
      const shifted = CBVocalTools.applyEffect(state.samples, state.sampleRate, { tool: 'Pitch', params: { semis: semis, mix: 1, formant: 0 } });
      const y = mixAt(state.samples, shifted, 0.55);
      encodeAndHold(y, state.sampleRate);
      playWav(state.wav);
      setStatus('Added ' + preset.name + '.');
      return { kind: 'harmony', peak: CBVocalTools.peakOf(y) };
    }
    if (preset.tool === 'Backing') {
      const bpm = preset.params.bpm || state.bpm;
      state.bpm = bpm;
      const sr = state.sampleRate || 44100;
      const seconds = state.samples ? state.samples.length / sr : 8;
      const n = Math.ceil(seconds * sr);
      const bed = new Float32Array(n);
      const step = Math.round((60 / bpm) * sr);
      const feel = preset.params.feel || 0.35;
      for (let i = 0; i < n; i++) {
        const hit = (i % step) < sr * 0.03;
        const pulse = hit ? 1 : 0;
        const bass = Math.sin(2 * Math.PI * 55 * i / sr) * Math.exp(-(i % step) / (sr * 0.2));
        bed[i] = (pulse * 0.12 + bass * 0.18) * (0.5 + feel);
      }
      if (state.samples) {
        encodeAndHold(mixAt(state.samples, bed, 0.7), sr);
        playWav(state.wav);
        setStatus('Added ' + preset.name + ' under the vocal.');
      } else {
        encodeAndHold(bed, sr);
        playWav(state.wav);
        setStatus('Previewing ' + preset.name + '.');
      }
      return { kind: 'backing' };
    }
    throw new Error('That preset could not be used.');
  }

  function renderList() {
    state.hits = CBVocalTools.search(state.query, state.cat);
    const total = state.hits.length;
    const maxPage = Math.max(0, Math.ceil(total / PAGE) - 1);
    if (state.page > maxPage) state.page = 0;
    const start = state.page * PAGE;
    const slice = state.hits.slice(start, start + PAGE);
    const list = $('presetList');
    list.innerHTML = slice.map(function (p, i) {
      const idx = start + i;
      const sel = state.selected && state.selected.id === p.id ? ' selected' : '';
      return '<button type="button" class="preset' + sel + '" data-i="' + idx + '"><b>' + escapeHtml(p.name) + '</b><span>' + escapeHtml(p.cat) + '</span></button>';
    }).join('') || '<p class="hint">No presets match that search.</p>';
    $('listMeta').textContent = (total ? ('Showing ' + (start + 1) + ' to ' + (start + slice.length) + ' of ' + total.toLocaleString('en-US') + ' matches. ') : '') + countsLine() + '.';
    $('prevPage').disabled = state.page <= 0;
    $('nextPage').disabled = state.page >= maxPage;
    list.querySelectorAll('.preset').forEach(function (btn) {
      btn.onclick = function () {
        const item = state.hits[+btn.getAttribute('data-i')];
        state.selected = item;
        renderList();
      };
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  async function onCreate() {
    try {
      const lyrics = ($('lyrics').value || '').trim();
      state.seed = 1 + Math.floor(Math.random() * 50);
      await singLyrics(lyrics, { style: state.style, bpm: state.bpm, seed: state.seed });
    } catch (err) {
      setStatus(err.message || 'The vocal could not be created.');
    }
  }

  async function onApply() {
    try {
      await applyPreset(state.selected);
    } catch (err) {
      setStatus(err.message || 'That preset could not be applied.');
    }
  }

  function onDownload() {
    if (!state.wav) { setStatus('Create a vocal first.'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([state.wav], { type: 'audio/wav' }));
    a.download = 'coffeebreak-vocal.wav';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function mount() {
    $('counts').textContent = countsLine();
    $('toolsHonest').textContent = 'This page has ' + countsLine() + ', made from parameter grids on the tools below. The numbers shown are the actual counts.';
    $('filter').innerHTML = '<option value="">All types</option><option>Effect</option><option>Vocal style</option><option>Instrument</option><option>Generator</option>';
    $('search').addEventListener('input', function () { state.query = $('search').value; state.page = 0; renderList(); });
    $('filter').addEventListener('change', function () { state.cat = $('filter').value; state.page = 0; renderList(); });
    $('prevPage').onclick = function () { if (state.page > 0) { state.page--; renderList(); } };
    $('nextPage').onclick = function () { state.page++; renderList(); };
    $('createGo').onclick = onCreate;
    $('applyGo').onclick = onApply;
    $('downloadGo').onclick = onDownload;
    const report = $('reportBtn');
    if (report) report.onclick = function () { if (window.__cbreport && window.__cbreport.open) window.__cbreport.open(); };
    renderList();
  }

  window.CBVocalStudio = {
    counts: function () { return CBVocalTools.counts(); },
    search: function (q, cat) { return CBVocalTools.search(q, cat); },
    sing: singLyrics,
    apply: applyPreset,
    state: function () {
      return {
        hasVocal: !!state.samples,
        peak: state.samples ? (window.CBVoice ? CBVoice.peakOf(state.samples) : CBVocalTools.peakOf(state.samples)) : 0,
        seconds: state.samples ? state.samples.length / state.sampleRate : 0,
        style: state.style,
        selected: state.selected && { id: state.selected.id, name: state.selected.name, cat: state.selected.cat, tool: state.selected.tool },
        counts: CBVocalTools.counts()
      };
    },
    detectPitch: function () {
      if (!state.samples || !window.CBVoice) return null;
      return CBVoice.detectPitch(state.samples, state.sampleRate, 80, 900);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
