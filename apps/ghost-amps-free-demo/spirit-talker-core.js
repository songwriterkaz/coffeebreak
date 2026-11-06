/* Coffeebreak Spirit Talker Core — entertainment simulation */
(function (global) {
  'use strict';

  const PHRASES = [
    "warm cup", "stay soft", "hello friend", "pink door", "mabel says yes",
    "rain then light", "you are safe", "latte love", "attic hush", "harbour fog",
    "thank you", "try again later", "listen close", "coffee first", "gentle night",
    "the kettle knows", "ribbon left", "candle leans", "planchette rests", "soft knock"
  ];

  const LONG_REPLIES = [
    "The café ghost warms their hands on a pink cup and nods toward your question.",
    "Static clears for a moment. A kind voice says to pour slow and stay soft.",
    "Cold air brushes the counter, then warmth returns with a quiet thank you.",
    "A whisper smells like vanilla rain. They want company, not fear.",
    "The attic violinist hums once. Your next step wants a warm drink first.",
    "Porcelain dolls tip their heads. The answer leans toward yes.",
    "Harbour fog writes a shy hello across the glass, then fades.",
    "The lantern keeper lifts a soft glow. You are not alone in the kind way.",
    "Sugar packets on the counter almost spell stay. Then they settle.",
    "A giggle like wind chimes. They liked that you asked gently."
  ];

  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function pick(arr, seed) {
    return arr[(seed >>> 0) % arr.length];
  }

  function answerFor(question, theme) {
    const q = (question || "").trim();
    const seed = hash((q || "silence") + "|" + (theme || "cafe"));
    const short = pick(PHRASES, seed);
    const long = pick(LONG_REPLIES, seed >> 3);
    let letters = short.toUpperCase().replace(/[^A-Z0-9 ]/g, "");
    if (/\byes\b/i.test(q) || /\bcan i\b/i.test(q) || /\bshould\b/i.test(q)) {
      letters = (seed % 5 === 0) ? "MAYBE" : (seed % 2 ? "YES" : "LATER");
    }
    if (/\bno\b/i.test(q) && seed % 3 === 0) letters = "SOFT NO";
    return { short, long, letters, seed };
  }

  /* ---------- Audio: spirit box sweep ---------- */
  function SpiritAudio() {
    this.ctx = null;
    this.nodes = [];
    this.sweeping = false;
    this._timer = null;
    this.onFragment = null;
  }
  SpiritAudio.prototype.ensure = function () {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  };
  SpiritAudio.prototype._noiseBurst = function (dur, gainVal) {
    const ctx = this.ensure();
    if (!ctx) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 400 + Math.random() * 2400;
    filt.Q.value = 0.7 + Math.random();
    const g = ctx.createGain();
    g.gain.value = gainVal;
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    src.start();
    this.nodes.push(src);
  };
  SpiritAudio.prototype._tone = function (freq, dur, gainVal) {
    const ctx = this.ensure();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sawtooth";
    o.frequency.value = freq;
    g.gain.setValueAtTime(gainVal, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  };
  SpiritAudio.prototype.startSweep = function (intensity) {
    const self = this;
    this.ensure();
    this.sweeping = true;
    clearInterval(this._timer);
    const vol = 0.04 + (intensity || 50) / 800;
    this._timer = setInterval(function () {
      if (!self.sweeping) return;
      self._noiseBurst(0.08 + Math.random() * 0.12, vol);
      if (Math.random() < 0.22) {
        self._tone(180 + Math.random() * 600, 0.12, vol * 0.8);
        const frag = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        if (self.onFragment) self.onFragment(frag);
      }
    }, 140);
  };
  SpiritAudio.prototype.stopSweep = function () {
    this.sweeping = false;
    clearInterval(this._timer);
  };
  SpiritAudio.prototype.blip = function () {
    this._tone(520 + Math.random() * 200, 0.08, 0.06);
    this._noiseBurst(0.05, 0.03);
  };

  /* ---------- Speech ---------- */
  function speak(text, voiceHint) {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.9;
      u.pitch = 0.75;
      u.volume = 1;
      const voices = window.speechSynthesis.getVoices() || [];
      const prefer = voices.find(v => /en/i.test(v.lang) && /female|woman|samantha|google uk/i.test(v.name))
        || voices.find(v => /en/i.test(v.lang));
      if (prefer) u.voice = prefer;
      if (voiceHint === "ballerina") { u.pitch = 1.15; u.rate = 0.95; }
      if (voiceHint === "plush") { u.pitch = 1.05; u.rate = 1; }
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function listenOnce(onResult, onError) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError("Speech recognition is not available in this browser."); return null; }
    const r = new SR();
    r.lang = "en-AU";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = function (ev) {
      const text = ev.results[0][0].transcript;
      if (onResult) onResult(text);
    };
    r.onerror = function (ev) { if (onError) onError(ev.error || "listen error"); };
    try { r.start(); } catch (e) { if (onError) onError(String(e)); }
    return r;
  }

  /* ---------- Visual: fog canvas ---------- */
  function Atmosphere(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.emf = 8;
    this.t = 0;
    for (let i = 0; i < 48; i++) {
      this.particles.push({
        x: Math.random(), y: Math.random(),
        r: 20 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: -0.0002 - Math.random() * 0.0004,
        a: 0.04 + Math.random() * 0.08
      });
    }
    this._raf = 0;
  }
  Atmosphere.prototype.setEmf = function (v) { this.emf = Math.max(0, Math.min(100, v)); };
  Atmosphere.prototype.start = function () {
    const self = this;
    function frame() {
      self.t++;
      const cv = self.cv, ctx = self.ctx, w = cv.width, h = cv.height;
      ctx.fillStyle = "#0a0610";
      ctx.fillRect(0, 0, w, h);
      // vignette glow
      const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 10, w * 0.5, h * 0.5, w * 0.7);
      g.addColorStop(0, "rgba(255,95,176," + (0.08 + self.emf / 500) + ")");
      g.addColorStop(0.5, "rgba(80,20,60,0.25)");
      g.addColorStop(1, "rgba(5,2,8,0.95)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      self.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
        if (p.x < -0.1) p.x = 1.1;
        if (p.x > 1.1) p.x = -0.1;
        const grd = ctx.createRadialGradient(p.x * w, p.y * h, 0, p.x * w, p.y * h, p.r);
        grd.addColorStop(0, "rgba(255,182,221," + p.a + ")");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      // ghost silhouette
      ctx.save();
      ctx.translate(w * 0.5, h * 0.42 + Math.sin(self.t / 40) * 6);
      ctx.globalAlpha = 0.35 + self.emf / 250;
      ctx.fillStyle = "#ffe6f3";
      ctx.beginPath();
      ctx.ellipse(0, -30, 28, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-40, -10);
      ctx.quadraticCurveTo(-50, 50, -30, 70);
      ctx.lineTo(30, 70);
      ctx.quadraticCurveTo(50, 50, 40, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#2a1030";
      ctx.beginPath(); ctx.arc(-10, -34, 4, 0, 7); ctx.arc(10, -34, 4, 0, 7); ctx.fill();
      ctx.restore();
      // candle flickers
      for (let i = 0; i < 3; i++) {
        const x = w * (0.2 + i * 0.3);
        const y = h * 0.82;
        const flick = 8 + Math.sin(self.t / 8 + i) * 3 + self.emf / 20;
        const cg = ctx.createRadialGradient(x, y - flick, 0, x, y, 30);
        cg.addColorStop(0, "rgba(255,220,120,0.7)");
        cg.addColorStop(1, "transparent");
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(x, y - flick / 2, 18, 0, 7); ctx.fill();
      }
      self._raf = requestAnimationFrame(frame);
    }
    frame();
  };
  Atmosphere.prototype.stop = function () { cancelAnimationFrame(this._raf); };

  /* ---------- Ouija planchette ---------- */
  function Ouija(boardEl, planchetteEl) {
    this.board = boardEl;
    this.plan = planchetteEl;
    this.letters = {};
    this._queue = [];
    this._busy = false;
  }
  Ouija.prototype.mapLetters = function () {
    const cells = this.board.querySelectorAll("[data-ch]");
    const br = this.board.getBoundingClientRect();
    this.letters = {};
    cells.forEach(el => {
      const r = el.getBoundingClientRect();
      this.letters[el.getAttribute("data-ch")] = {
        x: r.left - br.left + r.width / 2,
        y: r.top - br.top + r.height / 2
      };
    });
  };
  Ouija.prototype.moveTo = function (ch, ms) {
    const self = this;
    return new Promise(resolve => {
      self.mapLetters();
      const key = (ch === " ") ? " " : ch.toUpperCase();
      const pos = self.letters[key] || self.letters["•"] || { x: 20, y: 20 };
      self.plan.style.transition = "transform " + (ms || 450) + "ms ease-in-out";
      self.plan.style.transform = "translate(" + (pos.x - 22) + "px," + (pos.y - 22) + "px)";
      setTimeout(resolve, (ms || 450) + 40);
    });
  };
  Ouija.prototype.spell = async function (text, onLetter) {
    if (this._busy) return;
    this._busy = true;
    const chars = String(text || "").toUpperCase().split("");
    for (const ch of chars) {
      await this.moveTo(ch, 380 + Math.random() * 120);
      if (onLetter) onLetter(ch);
    }
    await this.moveTo("•", 500);
    this._busy = false;
  };

  global.CBSpirit = {
    answerFor, SpiritAudio, speak, listenOnce, Atmosphere, Ouija, PHRASES, LONG_REPLIES
  };
})(typeof window !== "undefined" ? window : globalThis);
