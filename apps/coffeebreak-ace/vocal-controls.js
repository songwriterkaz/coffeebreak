/* Simple vocal controls for Coffeebreak Vocal Studio.
   Reuses Studio Espresso dsp.js (tune worklet, wsola, pitchShiftBuf, makeIR, encodeWAV). */
(function () {
  var orig = null;
  var lastPeak = 0;
  var lastBytes = null;
  var lastDuration = 0;
  var applyingSrc = false;
  var objectUrl = null;

  function $(id) { return document.getElementById(id); }

  function setStatus(text) {
    var el = $('vcStatus');
    if (el) el.textContent = text || '';
  }

  function readControls() {
    return {
      pitch: +($('vcPitch') && $('vcPitch').value || 0),
      correct: +($('vcCorrect') && $('vcCorrect').value || 0),
      key: +($('vcKey') && $('vcKey').value || 0),
      scale: +($('vcScale') && $('vcScale').value || 0),
      formant: +($('vcFormant') && $('vcFormant').value || 0),
      speed: +($('vcSpeed') && $('vcSpeed').value || 1),
      vibrato: +($('vcVibrato') && $('vcVibrato').value || 0),
      reverb: +($('vcReverb') && $('vcReverb').value || 0),
      volume: +($('vcVolume') && $('vcVolume').value || 1)
    };
  }

  function isDefault(p) {
    return p.pitch === 0 && p.correct === 0 && p.formant === 0 &&
      Math.abs(p.speed - 1) < 0.005 && p.vibrato === 0 && p.reverb === 0 &&
      Math.abs(p.volume - 1) < 0.005;
  }

  function copyBuffer(bytes) {
    if (!bytes) return bytes;
    if (bytes instanceof ArrayBuffer) return bytes.slice(0);
    if (ArrayBuffer.isView(bytes)) {
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
    return bytes;
  }

  async function decodeBytes(bytes) {
    var ab = copyBuffer(bytes);
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      return await ctx.decodeAudioData(ab);
    } finally {
      if (ctx.close) await ctx.close();
    }
  }

  function playBytes(bytes, mime) {
    var audio = $('cb-sung-audio');
    if (!audio) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(new Blob([bytes], { type: mime || 'audio/wav' }));
    applyingSrc = true;
    audio.src = objectUrl;
    audio.play().catch(function () {});
    setTimeout(function () { applyingSrc = false; }, 0);
  }

  function saveProcessed(bytes, mime) {
    lastBytes = bytes;
    var dl = $('cb-sung-dl');
    if (dl) {
      dl.hidden = false;
      dl.dataset.vcReady = '1';
    }
  }

  async function runChain(buf, p) {
    var out = buf;
    if (Math.abs(p.speed - 1) >= 0.005 && typeof wsola === 'function') {
      out = wsola(out, 1 / p.speed);
    }
    if (p.pitch !== 0 && typeof pitchShiftBuf === 'function') {
      out = await pitchShiftBuf(out, p.pitch);
    }

    var extra = p.reverb > 0.01 ? 1.4 * p.reverb : 0.05;
    var ch = Math.max(2, out.numberOfChannels);
    var len = Math.ceil(out.length + extra * out.sampleRate);
    var o = new OfflineAudioContext(ch, Math.max(1, len), out.sampleRate);
    if (typeof ensureWorklet === 'function') {
      await ensureWorklet(o);
    }
    var src = o.createBufferSource();
    src.buffer = out;
    var node = src;

    if (p.formant !== 0) {
      var r = Math.pow(2, p.formant / 12);
      var low = o.createBiquadFilter();
      low.type = 'lowshelf';
      low.frequency.value = 280;
      low.gain.value = -p.formant * 0.45;
      var mid = o.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1200 * r;
      mid.Q.value = 0.9;
      mid.gain.value = p.formant * 0.35;
      var high = o.createBiquadFilter();
      high.type = 'highshelf';
      high.frequency.value = 2800 * r;
      high.gain.value = p.formant * 0.5;
      node.connect(low);
      low.connect(mid);
      mid.connect(high);
      node = high;
    }

    if (p.correct > 0.01) {
      try {
        var tune = new AudioWorkletNode(o, 'cbx-tune', { outputChannelCount: [2] });
        tune.parameters.get('key').value = p.key;
        tune.parameters.get('scale').value = p.scale;
        tune.parameters.get('speed').value = 0.6;
        tune.parameters.get('mix').value = p.correct;
        node.connect(tune);
        node = tune;
      } catch (err) {
        console.warn('tune worklet', err);
      }
    }

    if (p.vibrato > 0.01) {
      var delay = o.createDelay(0.05);
      delay.delayTime.value = 0.01;
      var lfo = o.createOscillator();
      lfo.frequency.value = 5.5;
      var depth = o.createGain();
      depth.gain.value = 0.0055 * p.vibrato;
      lfo.connect(depth);
      depth.connect(delay.delayTime);
      lfo.start();
      node.connect(delay);
      node = delay;
    }

    var vol = o.createGain();
    vol.gain.value = p.volume;
    if (p.reverb > 0.01 && typeof makeIR === 'function') {
      var dry = o.createGain();
      var wet = o.createGain();
      dry.gain.value = 1 - p.reverb * 0.7;
      wet.gain.value = p.reverb * 0.7;
      var pre = o.createDelay(0.2);
      pre.delayTime.value = 0.02;
      var cv = o.createConvolver();
      cv.buffer = makeIR(o, 2.2, 3);
      node.connect(dry);
      node.connect(pre);
      pre.connect(cv);
      cv.connect(wet);
      dry.connect(vol);
      wet.connect(vol);
    } else {
      node.connect(vol);
    }
    vol.connect(o.destination);
    src.start();
    return await o.startRendering();
  }

  async function processBytes(bytes, mime, p) {
    p = p || readControls();
    if (isDefault(p)) {
      var buf0 = await decodeBytes(bytes);
      lastPeak = typeof peakOf === 'function' ? peakOf(buf0) : 0;
      lastDuration = buf0.length / buf0.sampleRate;
      return { bytes: copyBuffer(bytes), mime: mime || 'audio/wav', peak: lastPeak, duration: lastDuration, passthrough: true };
    }
    var buf = await decodeBytes(bytes);
    var rendered = await runChain(buf, p);
    if (typeof peakOf === 'function') lastPeak = peakOf(rendered);
    else lastPeak = 0;
    lastDuration = rendered.length / rendered.sampleRate;
    var wav = encodeWAV(rendered);
    return { bytes: wav, mime: 'audio/wav', peak: lastPeak, duration: lastDuration, passthrough: false };
  }

  async function apply() {
    if (!orig) {
      setStatus('Create a song first, then apply the controls.');
      return null;
    }
    var btn = $('vcApply');
    if (btn) btn.disabled = true;
    setStatus('Applying vocal controls.');
    try {
      var out = await processBytes(orig.bytes, orig.mime, readControls());
      saveProcessed(out.bytes, out.mime);
      playBytes(out.bytes, out.mime);
      setStatus('Applied to the current song.');
      return out;
    } catch (err) {
      setStatus(err && err.message ? err.message : 'The controls could not be applied.');
      throw err;
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function resetControls() {
    $('vcPitch').value = 0;
    $('vcCorrect').value = 0;
    $('vcKey').value = 0;
    $('vcScale').value = 0;
    $('vcFormant').value = 0;
    $('vcSpeed').value = 1;
    $('vcVibrato').value = 0;
    $('vcReverb').value = 0;
    $('vcVolume').value = 1;
    syncLabels();
  }

  function syncLabels() {
    var p = readControls();
    if ($('vcPitchVal')) $('vcPitchVal').textContent = String(p.pitch);
    if ($('vcCorrectVal')) $('vcCorrectVal').textContent = p.correct.toFixed(2);
    if ($('vcFormantVal')) $('vcFormantVal').textContent = String(p.formant);
    if ($('vcSpeedVal')) $('vcSpeedVal').textContent = p.speed.toFixed(2);
    if ($('vcVibratoVal')) $('vcVibratoVal').textContent = p.vibrato.toFixed(2);
    if ($('vcReverbVal')) $('vcReverbVal').textContent = p.reverb.toFixed(2);
    if ($('vcVolumeVal')) $('vcVolumeVal').textContent = p.volume.toFixed(2);
  }

  function quietPanel() {
    var sel = $('cb-sung-engine');
    if (sel) {
      sel.value = 'builtin';
      var ace = sel.querySelector('option[value="ace"]');
      if (ace) ace.remove();
      sel.hidden = true;
      var lab = document.querySelector('label[for="cb-sung-engine"]');
      if (lab) lab.hidden = true;
    }
    var honest = $('cb-sung-honest');
    if (honest) {
      honest.textContent = 'The built-in synth voice sings your lyrics in this browser, on a melody, with drums, bass and chords. It is a synthesizer, not a recording of a person.';
    }
  }

  function wrapSonggen() {
    if (!window.CBSong || !window.CBSong.generateSong || window.CBSong.__vocalWrapped) return;
    var base = window.CBSong.generateSong.bind(window.CBSong);
    window.CBSong.generateSong = async function (input, opts) {
      var job = Object.assign({}, input, { engine: 'builtin' });
      var sung = await base(job, opts);
      orig = { bytes: copyBuffer(sung.bytes), mime: sung.mime || 'audio/wav' };
      var out = await processBytes(orig.bytes, orig.mime, readControls());
      saveProcessed(out.bytes, out.mime);
      lastPeak = out.peak;
      return Object.assign({}, sung, { bytes: out.bytes, mime: out.mime });
    };
    window.CBSong.__vocalWrapped = true;
  }

  function hookDownload() {
    var dl = $('cb-sung-dl');
    if (!dl || dl.dataset.vcHooked) return;
    dl.dataset.vcHooked = '1';
    dl.addEventListener('click', function (ev) {
      if (!lastBytes) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      var blob = new Blob([lastBytes], { type: 'audio/wav' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'vocal-studio.wav';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }, true);
  }

  function hookAudioCapture() {
    var audio = $('cb-sung-audio');
    if (!audio || audio.dataset.vcHooked) return;
    audio.dataset.vcHooked = '1';
    audio.addEventListener('loadedmetadata', function () {
      if (applyingSrc || !audio.src) return;
      fetch(audio.src).then(function (res) { return res.arrayBuffer(); }).then(function (buf) {
        orig = { bytes: buf, mime: 'audio/wav' };
      }).catch(function () {});
    });
  }

  function boot() {
    quietPanel();
    wrapSonggen();
    hookDownload();
    hookAudioCapture();
    syncLabels();
    ['vcPitch', 'vcCorrect', 'vcFormant', 'vcSpeed', 'vcVibrato', 'vcReverb', 'vcVolume'].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener('input', syncLabels);
    });
    if ($('vcApply')) $('vcApply').onclick = function () { apply().catch(function () {}); };
    if ($('vcReset')) {
      $('vcReset').onclick = function () {
        resetControls();
        if (orig) apply().catch(function () {});
        else setStatus('Controls reset.');
      };
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CBVocal = {
    readControls: readControls,
    processBytes: processBytes,
    apply: apply,
    lastPeak: function () { return lastPeak; },
    lastDuration: function () { return lastDuration; },
    hasOriginal: function () { return !!orig; }
  };
})();
