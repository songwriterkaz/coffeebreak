/* Coffeebreak shared full-song client.
   Calls public open-model Spaces. It never invents audio and never plays a stand-in file.
   ACE-Step 1.5 is MIT. DiffRhythm is Apache-2.0. This file is Coffeebreak, not those projects. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CBSong = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const BACKENDS = [
    {
      id: 'ace-step-v15',
      endpoint: 'https://ace-step-ace-step-v1-5.hf.space',
      api: 'generation_wrapper',
      kind: 'ace15',
      model: 'ACE-Step/Ace-Step1.5',
      license: 'MIT',
      credit: 'ACE-Step 1.5, an open model under the MIT license',
    },
    {
      id: 'ace-step-v15-song',
      endpoint: 'https://reubencf-kiku-ace-step-15.hf.space',
      api: 'song',
      kind: 'kiku',
      model: 'ACE-Step/Ace-Step1.5',
      license: 'MIT',
      credit: 'ACE-Step 1.5, an open model under the MIT license',
    },
    {
      id: 'diffrhythm',
      endpoint: 'https://aslp-lab-diffrhythm.hf.space',
      api: 'infer_music',
      kind: 'diffrhythm',
      model: 'ASLP-lab/DiffRhythm',
      license: 'Apache-2.0',
      credit: 'DiffRhythm, an open model under the Apache-2.0 license',
    },
    {
      id: 'ace-step-jam',
      endpoint: 'https://victor-ace-step-jam.hf.space',
      api: 'generate',
      kind: 'jam',
      model: 'ACE-Step',
      license: 'Apache-2.0',
      credit: 'ACE-Step, an open model under the Apache-2.0 license',
      timeout: 180000,
    },
    {
      id: 'ace-step-cpu',
      endpoint: 'https://werecooking-ace-step-cpu.hf.space',
      api: 'generate',
      kind: 'cpu',
      model: 'ACE-Step CPU',
      license: 'Apache-2.0',
      credit: 'ACE-Step, an open model under the Apache-2.0 license',
      timeout: 480000,
    },
  ];

  function calm(text) {
    return String(text || '').replace(/!/g, '.').replace(/\s+/g, ' ').trim().slice(0, 280);
  }

  function wordsOf(text) {
    return String(text || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  }

  function formatLyrics(text) {
    const raw = String(text || '').trim();
    if (/^\s*\[/.test(raw)) return raw.endsWith('\n') ? raw : raw + '\n';
    return '[Verse]\n' + raw + '\n';
  }

  function stampLyrics(text, seconds) {
    const lines = String(text || '').split(/\n/).map(s => s.trim()).filter(Boolean);
    const usable = lines.length ? lines : [String(text || '').trim()];
    const span = Math.max(8, seconds - 2);
    const step = span / usable.length;
    return usable.map((line, i) => {
      const t = 1 + i * step;
      const mm = String(Math.floor(t / 60)).padStart(2, '0');
      const ss = (t % 60).toFixed(2).padStart(5, '0');
      return '[' + mm + ':' + ss + '] ' + line;
    }).join('\n');
  }

  function clampSeconds(value) {
    const n = Math.round(+value);
    if (!n) return 30;
    return Math.max(10, Math.min(120, n));
  }

  function composePrompt(job) {
    const extra = String(job.prompt || '').trim();
    const base = 'sung vocal, clear lyrics, drums, bass and backing music';
    return extra ? extra + ', ' + base : base;
  }

  function jobOf(input) {
    input = input || {};
    const lyrics = String(input.lyrics || '').trim();
    if (wordsOf(lyrics).length < 2) {
      const err = new Error('Write at least two words of lyrics.');
      err.code = 'lyrics';
      throw err;
    }
    let seed = input.seed == null ? Math.floor(Math.random() * 900000) + 1 : input.seed | 0;
    if (!seed || seed < 0) seed = 1;
    return {
      lyrics: lyrics,
      prompt: composePrompt(input),
      seconds: clampSeconds(input.seconds),
      seed: seed,
      bpm: Math.max(72, Math.min(140, Math.round(+input.bpm || 110))),
    };
  }

  function setNamed(schema, map) {
    const data = schema.defaults.slice();
    Object.keys(map).forEach(name => {
      const index = schema.names.indexOf(name);
      if (index >= 0) data[index] = map[name];
    });
    return data;
  }

  function buildData(backend, schema, job) {
    if (backend.kind === 'kiku') {
      if (schema && schema.names && schema.names.length) {
        return setNamed(schema, {
          style: job.prompt,
          lyrics: formatLyrics(job.lyrics),
          duration: job.seconds,
          seed: job.seed,
          meta_json: '',
        });
      }
      return [job.prompt, formatLyrics(job.lyrics), job.seconds, job.seed, ''];
    }
    if (backend.kind === 'diffrhythm') {
      return setNamed(schema, {
        lrc: stampLyrics(job.lyrics, job.seconds),
        text_prompt: job.prompt,
        seed: job.seed,
        randomize_seed: false,
        file_type: 'mp3',
        preference_infer: 'speed first',
        Music_Duration: job.seconds,
        ref_audio_path: null,
        audio_prompt: null,
      });
    }
    if (backend.kind === 'jam') {
      if (schema && schema.names && schema.names.length) {
        return setNamed(schema, {
          prompt: job.prompt,
          lyrics: formatLyrics(job.lyrics),
          audio_duration: job.seconds,
          infer_step: 8,
          guidance_scale: 7,
          seed: job.seed,
          lora_name_or_path: '',
          lora_weight: 0.8,
        });
      }
      return [job.prompt, formatLyrics(job.lyrics), job.seconds, 8, 7, job.seed, '', 0.8];
    }
    if (backend.kind === 'cpu') {
      const duration = Math.max(10, Math.min(24, job.seconds));
      if (schema && schema.names && schema.names.length) {
        return setNamed(schema, {
          caption: job.prompt,
          lyrics: formatLyrics(job.lyrics),
          bpm: job.bpm || 110,
          duration: duration,
          seed: job.seed,
          steps: 8,
          lora_select: 'None (no LoRA)',
          lm_model_select: 'acestep-5Hz-lm-1.7B-Q8_0.gguf',
        });
      }
      return [job.prompt, formatLyrics(job.lyrics), job.bpm || 110, duration, job.seed, 8, 'None (no LoRA)', 'acestep-5Hz-lm-1.7B-Q8_0.gguf'];
    }
    return setNamed(schema, {
      selected_model: 'acestep-v15-xl-turbo',
      generation_mode: 'custom',
      simple_query_input: '',
      simple_vocal_language: 'en',
      param_4: job.prompt,
      param_5: formatLyrics(job.lyrics),
      param_9: 'en',
      param_15: job.seconds,
      param_16: 1,
      param_23: 'text2music',
      param_30: 'mp3',
    });
  }

  function looksLikeAudio(buffer) {
    if (!buffer || buffer.byteLength < 8000) return false;
    const b = new Uint8Array(buffer);
    if (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) return true;
    if (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) return true;
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return true;
    if (b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43) return true;
    if (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return true;
    return false;
  }

  function mimeOf(buffer, hinted) {
    if (hinted && /^audio\//.test(hinted)) return hinted;
    const b = new Uint8Array(buffer);
    if (b[0] === 0x52 && b[1] === 0x49) return 'audio/wav';
    if (b[0] === 0x66 && b[1] === 0x4c) return 'audio/flac';
    if (b[0] === 0x4f && b[1] === 0x67) return 'audio/ogg';
    return 'audio/mpeg';
  }

  function queueMessages(raw) {
    const messages = [];
    String(raw || '').split(/\n\n/).forEach(block => {
      let payload = '';
      block.split(/\n/).forEach(line => {
        if (line.startsWith('data:')) payload += line.slice(5).trim();
      });
      if (!payload) return;
      try { messages.push(JSON.parse(payload)); } catch (e) {}
    });
    return messages;
  }

  function finishedMessage(raw, eventId) {
    return queueMessages(raw).find(msg => {
      if (eventId && msg.event_id && msg.event_id !== eventId) return false;
      return msg.msg === 'process_completed' || msg.msg === 'unexpected_error';
    }) || null;
  }

  async function readQueue(res, eventId) {
    if (!res.body || !res.body.getReader) return finishedMessage(await res.text(), eventId);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      let step;
      try { step = await reader.read(); }
      catch (err) {
        const found = finishedMessage(buf, eventId);
        if (found) return found;
        throw err;
      }
      if (step.value) buf += dec.decode(step.value, { stream: !step.done });
      const found = finishedMessage(buf, eventId);
      if (found) {
        try { await reader.cancel(); } catch (e) {}
        return found;
      }
      if (step.done) break;
    }
    return finishedMessage(buf, eventId);
  }

  function walkFiles(value, out) {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(item => walkFiles(item, out));
      return;
    }
    if (typeof value === 'string') {
      if (/^https?:\/\//.test(value) && /\.(mp3|wav|flac|ogg)(\?|$)/i.test(value)) out.push({ url: value });
      return;
    }
    if (typeof value !== 'object') return;
    if (value.url || value.path) {
      const name = String(value.orig_name || value.path || value.url || '');
      const mime = String(value.mime_type || '');
      if (mime.startsWith('audio') || /\.(mp3|wav|flac|ogg)(\?|$)/i.test(name) || value.url || value.path) out.push(value);
    }
    Object.keys(value).forEach(key => {
      if (key === 'url' || key === 'path' || key === 'meta') return;
      walkFiles(value[key], out);
    });
  }

  function fileUrl(endpoint, file) {
    const url = file && file.url ? String(file.url) : '';
    if (/^https?:\/\//.test(url)) return url;
    if (url.startsWith('/')) return endpoint.replace(/\/$/, '') + url;
    const path = file && file.path ? String(file.path) : '';
    if (!path) return '';
    return endpoint.replace(/\/$/, '') + '/gradio_api/file=' + path;
  }

  async function fetchSchema(backend, fetchImpl) {
    const res = await fetchImpl(backend.endpoint.replace(/\/$/, '') + '/gradio_api/info');
    if (!res.ok) throw new Error('The song service did not share its form (' + res.status + ').');
    const info = await res.json();
    const eps = info.named_endpoints || {};
    const spec = eps['/' + backend.api] || eps[backend.api];
    if (!spec || !spec.parameters) throw new Error('The song service has no ' + backend.api + ' form.');
    return {
      names: spec.parameters.map(p => p.parameter_name),
      defaults: spec.parameters.map(p => (p.parameter_default == null ? null : p.parameter_default)),
    };
  }

  function alignData(config, dep, data) {
    const inputs = dep.inputs || [];
    if (!inputs.length || inputs.length === data.length) return data;
    const byId = new Map((config.components || []).map(item => [item.id, item]));
    const aligned = [];
    let cursor = 0;
    inputs.forEach(id => {
      const comp = byId.get(id);
      if (comp && comp.type === 'state') aligned.push(null);
      else aligned.push(cursor < data.length ? data[cursor++] : null);
    });
    return aligned;
  }

  async function callSpace(backend, data, timeoutMs, fetchImpl) {
    const endpoint = backend.endpoint.replace(/\/$/, '');
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, timeoutMs || 180000);
    const signal = ctrl ? ctrl.signal : undefined;
    const session = 'cb' + Math.random().toString(16).slice(2, 12);
    try {
      const configRes = await fetchImpl(endpoint + '/config', { signal: signal });
      if (!configRes.ok) throw new Error('The song service did not share its form (' + configRes.status + ').');
      const config = await configRes.json();
      const dep = (config.dependencies || []).find(item => item && item.api_name === backend.api);
      if (!dep) throw new Error('The song service has no ' + backend.api + ' form.');
      const payload = alignData(config, dep, data);
      const posted = await fetchImpl(endpoint + '/gradio_api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: payload,
          event_data: null,
          fn_index: dep.id,
          trigger_id: null,
          session_hash: session,
        }),
        signal: signal,
      });
      if (!posted.ok) throw new Error('The song service refused the request (' + posted.status + ').');
      const accepted = await posted.json();
      if (!accepted.event_id) throw new Error('The song service did not accept the lyrics.');
      const streamed = await fetchImpl(endpoint + '/gradio_api/queue/data?session_hash=' + session, { signal: signal });
      if (!streamed.ok) throw new Error('The song service did not open a session (' + streamed.status + ').');
      const done = await readQueue(streamed, accepted.event_id);
      if (!done) throw new Error('The song service did not finish.');
      const output = done.output || {};
      if (done.msg === 'unexpected_error' || done.success === false || output.error) {
        throw new Error(calm(output.error || done.message || 'The song service returned an error.'));
      }
      const parsed = output.data;
      const files = [];
      walkFiles(parsed, files);
      const urls = [];
      files.forEach(item => {
        const url = fileUrl(endpoint, item);
        if (url && urls.indexOf(url) < 0) urls.push(url);
      });
      if (!urls.length) {
        const note = Array.isArray(parsed) ? parsed.find(item => typeof item === 'string' && item.trim()) : '';
        throw new Error(calm(note) || 'The song service returned no audio.');
      }
      let last = 'The song service returned a file that is not audio.';
      for (let i = 0; i < urls.length; i++) {
        const audio = await fetchImpl(urls[i]);
        if (!audio.ok) { last = 'The song file could not be downloaded (' + audio.status + ').'; continue; }
        const bytes = await audio.arrayBuffer();
        if (!looksLikeAudio(bytes)) continue;
        const file = files[i] || {};
        return {
          bytes: bytes,
          mime: mimeOf(bytes, file.mime_type),
          info: Math.round(bytes.byteLength / 1000) + ' KB audio file',
        };
      }
      throw new Error(last);
    } catch (err) {
      if (err && err.name === 'AbortError') throw new Error('The song service did not answer in time.');
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  function busyText(message) {
    return /quota|busy|exceeded|zerogpu|try again/i.test(message || '');
  }

  function plainFailure(errors) {
    const clean = errors.map(calm).filter(Boolean);
    if (clean.length && clean.every(busyText)) {
      return 'The free song service is busy right now. Try again in a few minutes. Nothing was saved and no stand-in audio was played.';
    }
    return 'The song could not be generated. Nothing was saved and no stand-in audio was played. ' + clean.join(' ');
  }

  async function runBackend(backend, job, opts) {
    const fetchImpl = opts.fetchImpl || fetch;
    const schemas = opts.schemas || {};
    const schema = schemas[backend.id] || await fetchSchema(backend, fetchImpl);
    const data = buildData(backend, schema, job);
    const sung = await callSpace(backend, data, backend.timeout || opts.timeoutMs || 180000, fetchImpl);
    return {
      bytes: sung.bytes,
      mime: sung.mime,
      info: sung.info,
      model: backend.model,
      license: backend.license,
      credit: backend.credit,
      backend: backend.id,
      seconds: job.seconds,
    };
  }

  async function generateSong(input, opts) {
    opts = opts || {};
    const job = jobOf(input);
    const backends = opts.backends || BACKENDS;
    const errors = [];
    const tell = msg => {
      if (typeof opts.onStatus === 'function') {
        try { opts.onStatus(msg); } catch (e) {}
      }
    };
    for (let i = 0; i < backends.length; i++) {
      if (i === 0) tell('Generating the sung song. This can take a few minutes.');
      else if (backends[i].kind === 'cpu') tell('The GPU singing service is not available. Trying the CPU backup. This can take a few minutes.');
      else tell('Trying another public singing service.');
      try {
        return await runBackend(backends[i], job, opts);
      } catch (err) {
        errors.push((backends[i].id || 'service') + ': ' + (err && err.message ? err.message : 'failed'));
      }
    }
    const failure = new Error(plainFailure(errors));
    failure.errors = errors;
    throw failure;
  }

  return {
    BACKENDS: BACKENDS,
    calm: calm,
    wordsOf: wordsOf,
    formatLyrics: formatLyrics,
    stampLyrics: stampLyrics,
    composePrompt: composePrompt,
    buildData: buildData,
    looksLikeAudio: looksLikeAudio,
    queueMessages: queueMessages,
    generateSong: generateSong,
    plainFailure: plainFailure,
  };
});
