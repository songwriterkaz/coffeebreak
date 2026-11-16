/* Coffeebreak Vocal Studio Simple - lyrics, create, playback, and download.
   Uses a vendored copy of the original Vocal Studio voice (commit fd959847). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var PAY_LABEL = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
  var CART_KEY = 'cbx-vocal-studio-simple-cart';
  var state = {
    lyrics: '',
    bpm: 110,
    seed: 3,
    wav: null,
    samples: null,
    sampleRate: 44100,
    audio: null
  };

  function wordsOf(text) {
    return String(text || '').split(/\s+/).map(function (s) {
      return s.replace(/[^a-zA-Z0-9']+/g, '');
    }).filter(Boolean);
  }

  function setStatus(text) {
    var el = $('status');
    if (el) el.textContent = text || '';
  }

  function mint(rng) {
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var s = 'CB';
    for (var i = 0; i < 8; i++) s += alphabet[Math.floor(rng() * alphabet.length)];
    return s;
  }

  function readCart(storage, rng) {
    rng = rng || Math.random;
    var saved = null;
    try { saved = JSON.parse(storage.getItem(CART_KEY) || 'null'); } catch (e) { saved = null; }
    var reference = saved && typeof saved.reference === 'string' && /^CB[A-Z2-9]{8}$/.test(saved.reference)
      ? saved.reference
      : mint(rng);
    var cart = {
      item: 'Coffeebreak Vocal Studio Simple',
      amount: 10,
      currency: 'USD',
      reference: reference,
      paid: false,
      status: 'awaiting_transfer',
      label: PAY_LABEL
    };
    try { storage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
    return cart;
  }

  function fillPay() {
    var cart = readCart(window.localStorage);
    document.querySelectorAll('[data-pay-ref]').forEach(function (el) {
      el.textContent = cart.reference;
    });
    return cart;
  }

  function buildScore(lyrics, notes, bpm, seconds) {
    var words = wordsOf(lyrics);
    if (words.length < 2) throw new Error('Write at least two words to sing.');
    var beat = 60 / Math.max(72, Math.min(140, bpm || 110));
    var seq = notes && notes.length ? notes : [];
    var out = [];
    var t = 0;
    for (var i = 0; i < words.length; i++) {
      var src = seq.length ? seq[i % seq.length] : { p: 64, l: 1 };
      var dur = Math.max(0.24, (src.l || 1) * beat);
      out.push({ text: words[i], w: words[i], pitch: src.p, p: src.p, t: t, d: dur, duration: dur, rest: false });
      t += dur;
    }
    var score = { notes: out, seconds: t, words: words.length };
    if (seconds && t > 0.2) {
      var k = Math.max(4, Math.min(120, seconds)) / t;
      out.forEach(function (n) { n.t *= k; n.d *= k; n.duration = n.d; });
      score.seconds = Math.max(4, Math.min(120, seconds));
    }
    return score;
  }

  function vocalSeconds(lyrics) {
    var words = Math.max(2, wordsOf(lyrics).length);
    var lines = Math.max(1, String(lyrics || '').split(/\n/).filter(function (s) { return s.trim(); }).length);
    return Math.max(8, Math.min(28, Math.round(words * 0.45 + lines * 1.5)));
  }

  function encodeAndHold(samples, sr, wavMaybe) {
    state.samples = samples;
    state.sampleRate = sr;
    state.wav = wavMaybe || CBVoice.encodeWav(samples, null, sr);
    return state.wav;
  }

  function playWav(wav) {
    if (state.audio) {
      state.audio.pause();
      if (state.audio.src) URL.revokeObjectURL(state.audio.src);
    }
    var url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
    var audio = $('player');
    audio.src = url;
    audio.hidden = false;
    state.audio = audio;
    audio.play().catch(function () {});
  }

  async function singLyrics(lyrics, opts) {
    opts = opts || {};
    var voice = window.CBVoice;
    if (!voice) throw new Error('The Coffeebreak voice could not be loaded.');
    var bpm = opts.bpm || state.bpm;
    var notes = opts.notes || null;
    var seconds = opts.seconds || vocalSeconds(lyrics);
    var score = buildScore(lyrics, notes, bpm, seconds);
    if (typeof opts.start === 'number' && opts.start) {
      var shift = opts.start;
      score.notes.forEach(function (n) { n.t = Math.max(0, n.t + shift); });
      score.seconds += Math.max(0, shift);
    }
    setStatus('Singing with the Coffeebreak voice.');
    var wav = voice.sing(score, { seed: opts.seed == null ? state.seed : opts.seed, bpm: bpm, style: opts.style || {} });
    var dec = voice.decodeMono(wav);
    if (voice.peakOf(dec.samples) < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    encodeAndHold(dec.samples, dec.sampleRate, wav);
    state.lyrics = lyrics;
    state.bpm = bpm;
    playWav(state.wav);
    setStatus('Ready. The vocal is the original Coffeebreak voice.');
    return { peak: voice.peakOf(dec.samples), seconds: dec.samples.length / dec.sampleRate };
  }

  async function onCreate() {
    var button = $('createGo');
    try {
      if (button) button.disabled = true;
      var lyrics = ($('lyrics').value || '').trim();
      state.seed = 1 + Math.floor(Math.random() * 50);
      await singLyrics(lyrics, { bpm: state.bpm, seed: state.seed });
    } catch (err) {
      setStatus(err.message || 'The vocal could not be created.');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function onDownload() {
    if (!state.wav) { setStatus('Create a vocal first.'); return; }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([state.wav], { type: 'audio/wav' }));
    a.download = 'coffeebreak-vocal.wav';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function mount() {
    fillPay();
    $('createGo').onclick = onCreate;
    $('downloadGo').onclick = onDownload;
    var report = $('reportBtn');
    if (report) report.onclick = function () {
      if (window.__cbreport && window.__cbreport.open) window.__cbreport.open();
    };
  }

  window.CBVocalStudio = {
    sing: singLyrics,
    readCart: function () { return readCart(window.localStorage); },
    state: function () {
      return {
        hasVocal: !!state.samples,
        peak: state.samples && window.CBVoice ? CBVoice.peakOf(state.samples) : 0,
        seconds: state.samples ? state.samples.length / state.sampleRate : 0
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
