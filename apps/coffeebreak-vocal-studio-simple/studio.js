/* Coffeebreak Vocal Studio Simple - lyrics, create, playback, and download.
   Default singing voice is Twirling Bean. Voice 2, the clear studio voice, baritone voices, Country Lisp Honky Tonk, and Speak stay available. */
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
    audio: null,
    mode: '',
    speaking: false
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

  function selectedVoiceId() {
    var el = $('voicePick');
    var v = el ? el.value : 'twirl';
    if (v === 'clear' || v === 'voice2' || v === 'bariwarm' || v === 'baricountry' || v === 'honky' || v === 'twirl') return v;
    return 'twirl';
  }

  function currentVoice() {
    var id = selectedVoiceId();
    if (id === 'clear' && window.CBVoiceClear) return window.CBVoiceClear;
    if (id === 'voice2') return window.CBVoice2 || window.CBVoice;
    if (id === 'bariwarm' || id === 'baricountry') return window.CBVoiceBaritone || window.CBVoice;
    if (id === 'honky') return window.CBVoiceHonky || window.CBVoice;
    return window.CBVoiceTwirl || window.CBVoice;
  }

  function voiceLabel(id) {
    if (id === 'clear') return 'the clear studio voice';
    if (id === 'voice2') return 'Voice 2';
    if (id === 'bariwarm') return 'Baritone Warm';
    if (id === 'baricountry') return 'Baritone Country';
    if (id === 'honky') return 'Country Lisp Honky Tonk';
    return 'the Twirling Bean voice';
  }

  function usesBacking(id) {
    return id === 'twirl' || id === 'bariwarm' || id === 'baricountry' || id === 'honky';
  }

  function backingOn() {
    var el = $('backingPick');
    return !el || !!el.checked;
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
    var vid = selectedVoiceId();
    var voice = currentVoice();
    if (!seq.length && voice && voice.defaultMelody) {
      if (vid === 'twirl' || vid === 'bariwarm' || vid === 'baricountry' || vid === 'honky') {
        seq = voice.defaultMelody(words.length);
      }
    }
    if (seq.length && voice && voice.transposeNotes && (vid === 'bariwarm' || vid === 'baricountry')) {
      seq = voice.transposeNotes(seq);
    }
    var out = [];
    var t = 0;
    var fallbackP = (vid === 'bariwarm' || vid === 'baricountry') ? 52 : (vid === 'twirl' || vid === 'honky' ? 57 : 64);
    for (var i = 0; i < words.length; i++) {
      var src = seq.length ? seq[i % seq.length] : { p: fallbackP, l: 1 };
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
    state.wav = wavMaybe || currentVoice().encodeWav(samples, null, sr);
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
    if (opts.voiceId && $('voicePick')) {
      var allowed = { twirl: 1, voice2: 1, clear: 1, bariwarm: 1, baricountry: 1, honky: 1 };
      $('voicePick').value = allowed[opts.voiceId] ? opts.voiceId : 'twirl';
    }
    var voice = currentVoice();
    if (!voice) throw new Error('The Coffeebreak voice could not be loaded.');
    var vid0 = selectedVoiceId();
    var bpm = opts.bpm || (vid0 === 'honky' ? 112 : (vid0 === 'bariwarm' ? 92 : (vid0 === 'baricountry' || vid0 === 'twirl' ? 100 : state.bpm)));
    var notes = opts.notes || null;
    var seconds = opts.seconds || vocalSeconds(lyrics);
    var score = buildScore(lyrics, notes, bpm, seconds);
    if (typeof opts.start === 'number' && opts.start) {
      var shift = opts.start;
      score.notes.forEach(function (n) { n.t = Math.max(0, n.t + shift); });
      score.seconds += Math.max(0, shift);
    }
    stopSpeech();
    state.mode = 'sing';
    setStatus('Singing with the Coffeebreak voice.');
    var style = opts.style ? Object.assign({}, opts.style) : {};
    var vid = selectedVoiceId();
    if (usesBacking(vid) && style.backing == null) style.backing = backingOn();
    if (vid === 'bariwarm' && style.flavor == null) style.flavor = 'warm';
    if (vid === 'baricountry' && style.flavor == null) style.flavor = 'country';
    var wav = voice.sing(score, { seed: opts.seed == null ? state.seed : opts.seed, bpm: bpm, style: style });
    var dec = voice.decodeMono(wav);
    if (voice.peakOf(dec.samples) < 0.02) throw new Error('The Coffeebreak voice returned silence.');
    encodeAndHold(dec.samples, dec.sampleRate, wav);
    state.lyrics = lyrics;
    state.bpm = bpm;
    playWav(state.wav);
    setStatus('Ready. The vocal is ' + voiceLabel(selectedVoiceId()) + '.');
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


  function stopSpeech() {
    state.speaking = false;
    try {
      if (window.speechSynthesis) speechSynthesis.cancel();
    } catch (e) {}
  }

  function pickVoice(voices) {
    voices = voices || [];
    var best = null;
    var bestScore = -1;
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var lang = String(v.lang || '').toLowerCase();
      var name = String(v.name || '').toLowerCase();
      var score = -1;
      if (/en-au/.test(lang) || /australian/.test(name)) score = 40;
      else if (/en-gb/.test(lang) || /uk english|british/.test(name)) score = 30;
      else if (/en-us/.test(lang) || /american/.test(name)) score = 20;
      else if (/^en/.test(lang)) score = 10;
      if (score < 0) continue;
      if (v.localService) score += 8;
      if (/whisper|zarvox|bad news|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|ralph|samantha|princess|albert/.test(name)) score -= 15;
      if (score > bestScore) {
        bestScore = score;
        best = v;
      }
    }
    return best;
  }

  function whenVoices(done) {
    var voices = speechSynthesis.getVoices() || [];
    if (voices.length) {
      done(voices);
      return;
    }
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      done(speechSynthesis.getVoices() || []);
    };
    if (typeof speechSynthesis.addEventListener === 'function') {
      speechSynthesis.addEventListener('voiceschanged', finish);
    } else {
      speechSynthesis.onvoiceschanged = finish;
    }
    setTimeout(finish, 500);
  }

  function onSpeak() {
    var lyrics = ($('lyrics').value || '').trim();
    if (wordsOf(lyrics).length < 2) {
      setStatus('Write at least two words to speak.');
      return;
    }
    if (!window.speechSynthesis || typeof speechSynthesis.speak !== 'function') {
      setStatus('Spoken playback is not available in this browser.');
      return;
    }
    stopSpeech();
    if (state.audio) {
      try { state.audio.pause(); } catch (e) {}
    }
    state.mode = 'speak';
    setStatus('Speaking the lyrics.');
    whenVoices(function (voices) {
      var u = new SpeechSynthesisUtterance(lyrics);
      var voice = pickVoice(voices);
      if (voice) {
        u.voice = voice;
        if (voice.lang) u.lang = voice.lang;
      } else {
        u.lang = 'en-AU';
      }
      u.rate = 0.96;
      u.pitch = 1;
      u.onstart = function () {
        state.speaking = true;
        setStatus('Speaking the lyrics.');
      };
      u.onend = function () {
        state.speaking = false;
        setStatus('Ready. The speaking voice can be played, but it cannot be saved as a wav.');
      };
      u.onerror = function () {
        state.speaking = false;
        setStatus('The speaking voice could not be played.');
      };
      speechSynthesis.speak(u);
    });
  }

  function onDownload() {
    if (!state.wav) {
      setStatus('The speaking voice can be played, but it cannot be saved as a wav. Create a vocal to download a wav.');
      return;
    }
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
    $('speakGo').onclick = onSpeak;
    $('downloadGo').onclick = onDownload;
    function keepLyricsInView() {
      var el = document.activeElement;
      if (!el || el.id !== 'lyrics') return;
      var vv = window.visualViewport;
      var r = el.getBoundingClientRect();
      var viewH = vv ? vv.height : window.innerHeight;
      var viewTop = vv ? vv.offsetTop : 0;
      if (r.top < viewTop + 8 || r.bottom > viewTop + viewH - 8) {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }
    if ($('lyrics')) {
      $('lyrics').removeAttribute('readonly');
      $('lyrics').addEventListener('focus', function () { setTimeout(keepLyricsInView, 50); });
    }
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', keepLyricsInView);
      visualViewport.addEventListener('scroll', keepLyricsInView);
    }
    window.addEventListener('pagehide', stopSpeech);
    var report = $('reportBtn');
    if (report) report.onclick = function () {
      if (window.__cbreport && window.__cbreport.open) window.__cbreport.open();
    };
  }

  window.CBVocalStudio = {
    sing: singLyrics,
    readCart: function () { return readCart(window.localStorage); },
    speak: onSpeak,
    stopSpeech: stopSpeech,
    state: function () {
      return {
        hasVocal: !!state.samples,
        peak: state.samples && currentVoice() ? currentVoice().peakOf(state.samples) : 0,
        seconds: state.samples ? state.samples.length / state.sampleRate : 0,
        voiceId: selectedVoiceId(),
        backing: usesBacking(selectedVoiceId()) && backingOn(),
        mode: state.mode,
        speaking: !!state.speaking,
        canSpeak: !!(window.speechSynthesis && speechSynthesis.speak),
        canDownloadSpeech: false
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
