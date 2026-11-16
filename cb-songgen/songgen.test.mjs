import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const song = require('./songgen.js');

function mp3(bytes) {
  const buf = new Uint8Array(bytes);
  buf[0] = 0x49; buf[1] = 0x44; buf[2] = 0x33;
  return buf.buffer;
}

function fetchMock(routes) {
  const calls = [];
  async function fetchImpl(url, opts) {
    calls.push({ url: String(url), body: opts && opts.body });
    const hit = routes.find(route => String(url).includes(route.match));
    if (!hit) throw new Error('unexpected ' + url);
    if (hit.throw) throw new Error(hit.throw);
    return {
      ok: hit.status ? hit.status < 400 : true,
      status: hit.status || 200,
      json: async () => hit.json,
      text: async () => hit.text || '',
      arrayBuffer: async () => hit.bytes,
      body: null,
    };
  }
  fetchImpl.calls = calls;
  return fetchImpl;
}

const aceSchema = {
  names: ['selected_model', 'generation_mode', 'param_4', 'param_5', 'param_15', 'param_16', 'param_30'],
  defaults: ['acestep-v15-xl-turbo', 'simple', null, null, -1, 2, 'flac'],
};
const kikuSchema = {
  names: ['style', 'lyrics', 'duration', 'seed', 'meta_json'],
  defaults: [null, null, -1, -1, null],
};

test('the official payload asks for one full song with the lyrics and style', () => {
  const job = { lyrics: 'sun is up on the hill', prompt: 'country, acoustic guitar', seconds: 20, seed: 4 };
  const data = song.buildData(song.BACKENDS[0], aceSchema, job);
  assert.equal(data[0], 'acestep-v15-xl-turbo');
  assert.equal(data[1], 'custom');
  assert.equal(data[2], 'country, acoustic guitar');
  assert.match(song.composePrompt({ prompt: 'country' }), /backing music/);
  assert.match(data[3], /sun is up on the hill/);
  assert.equal(data[4], 20);
  assert.equal(data[5], 1);
  assert.equal(data[6], 'mp3');
});

function config(api, id) {
  return { dependencies: [{ api_name: api, id: id }] };
}
function done(eventId, output, success) {
  return 'data: ' + JSON.stringify({ msg: 'process_completed', event_id: eventId, success: success, output: output }) + '\n\n';
}

test('a failed first service falls through to the next and returns only that audio', async () => {
  const good = mp3(9000);
  const fetchImpl = fetchMock([
    { match: 'ace-step-ace-step-v1-5.hf.space/config', json: config('generation_wrapper', 77) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/data', text: done('e1', { error: 'quota exceeded' }, false) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/join', json: { event_id: 'e1' } },
    { match: 'reubencf-kiku-ace-step-15.hf.space/config', json: config('song', 2) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/data', text: done('e2', { data: ['ok', { url: 'https://files.example/song.mp3', mime_type: 'audio/mpeg', orig_name: 'song.mp3' }] }, true) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/join', json: { event_id: 'e2' } },
    { match: 'files.example/song.mp3', bytes: good },
  ]);
  const sung = await song.generateSong(
    { lyrics: 'sun is up on the hill', prompt: 'pop', seconds: 20, seed: 3 },
    {
      engine: 'ace',
      fetchImpl,
      timeoutMs: 5000,
      backends: song.BACKENDS.slice(0, 2),
      schemas: { 'ace-step-v15': aceSchema, 'ace-step-v15-song': kikuSchema },
    }
  );
  assert.equal(sung.backend, 'ace-step-v15-song');
  assert.equal(sung.model, 'ACE-Step/Ace-Step1.5');
  assert.equal(sung.license, 'MIT');
  assert.equal(sung.bytes, good);
  assert.equal(song.looksLikeAudio(sung.bytes), true);
  const posted = fetchImpl.calls.filter(call => call.body);
  assert.equal(posted.length, 2);
  const second = JSON.parse(posted[1].body);
  assert.match(second.data[1], /sun is up on the hill/);
});

test('when every ACE service fails the built-in singer still returns a song', async () => {
  const fetchImpl = fetchMock([
    { match: 'ace-step-ace-step-v1-5.hf.space/config', json: config('generation_wrapper', 77) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/data', text: done('a', { error: 'busy' }, false) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/join', json: { event_id: 'a' } },
    { match: 'reubencf-kiku-ace-step-15.hf.space/config', json: config('song', 2) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/data', text: done('b', { error: 'queue full' }, false) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/join', json: { event_id: 'b' } },
  ]);
  const opts = { engine: 'ace', fetchImpl, backends: song.BACKENDS.slice(0, 2), schemas: { 'ace-step-v15': aceSchema, 'ace-step-v15-song': kikuSchema } };
  const sung = await song.generateSong({ lyrics: 'sun is up on the hill', seconds: 10, seed: 1 }, opts);
  assert.equal(sung.fallback, true);
  assert.equal(sung.backend, 'builtin-singer');
  assert.equal(sung.mime, 'audio/wav');
  assert.match(sung.info, /built-in synth voice/);
  assert.ok(sung.bytes.byteLength > 20000);
  assert.equal(song.looksLikeAudio(sung.bytes), true);
  await assert.rejects(
    () => song.generateSong(
      { lyrics: 'sun is up on the hill', seconds: 10, seed: 1 },
      Object.assign({}, opts, { allowFallback: false })
    ),
    err => {
      assert.match(err.message, /Nothing was saved and no stand-in audio was played/);
      assert.equal(err.message.includes('!'), false);
      assert.equal(err.bytes, undefined);
      return true;
    }
  );
});

test('a tiny or non-audio file is not kept, and the built-in voice sings instead', async () => {
  const fetchImpl = fetchMock([
    { match: 'reubencf-kiku-ace-step-15.hf.space/config', json: config('song', 2) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/data', text: done('c', { data: [{ url: 'https://files.example/bad.mp3', orig_name: 'bad.mp3' }] }, true) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/join', json: { event_id: 'c' } },
    { match: 'bad.mp3', bytes: new Uint8Array([1, 2, 3, 4]).buffer },
  ]);
  const sung = await song.generateSong(
    { lyrics: 'sun is up on the hill', seconds: 10, seed: 1 },
    { engine: 'ace', fetchImpl, backends: [song.BACKENDS[1]], schemas: { 'ace-step-v15-song': kikuSchema } }
  );
  assert.equal(sung.fallback, true);
  assert.equal(sung.backend, 'builtin-singer');
  assert.equal(song.looksLikeAudio(new Uint8Array([1, 2, 3, 4]).buffer), false);
  assert.equal(song.looksLikeAudio(sung.bytes), true);
});

test('the default singer is built in and does not call a service', async () => {
  let called = false;
  const sung = await song.generateSong(
    { lyrics: 'sun is up on the hill', seconds: 10, seed: 2 },
    { fetchImpl: async () => { called = true; throw new Error('network'); } }
  );
  assert.equal(called, false);
  assert.equal(sung.backend, 'builtin-singer');
  assert.equal(sung.fallback, false);
  assert.equal(sung.mime, 'audio/wav');
  assert.ok(sung.score.notes.length >= 2);
  assert.equal(song.lastSong(), sung);
});

test('fewer than two words is refused before any service is called', async () => {
  let called = false;
  await assert.rejects(
    () => song.generateSong({ lyrics: 'hello' }, { fetchImpl: async () => { called = true; throw new Error('no'); } }),
    /at least two words/
  );
  assert.equal(called, false);
});

test('the CPU and GPU backups fill the ACE-Step lyric forms', () => {
  const job = { lyrics: 'sun is up on the hill', prompt: 'pop, soft vocal', seconds: 16, seed: 7, bpm: 110 };
  const jamSchema = { names: ['prompt', 'lyrics', 'audio_duration', 'infer_step', 'guidance_scale', 'seed', 'lora_name_or_path', 'lora_weight'], defaults: [null, null, 60, 8, 7, -1, '', 0.8] };
  const cpuSchema = { names: ['caption', 'lyrics', 'bpm', 'duration', 'seed', 'steps', 'lora_select', 'lm_model_select'], defaults: [null, null, 120, 10, -1, 8, 'None (no LoRA)', 'acestep-5Hz-lm-1.7B-Q8_0.gguf'] };
  const jam = song.BACKENDS.find(b => b.kind === 'jam');
  const cpu = song.BACKENDS.find(b => b.kind === 'cpu');
  assert.ok(jam && cpu);
  const jamData = song.buildData(jam, jamSchema, job);
  assert.equal(jamData[0], 'pop, soft vocal');
  assert.match(jamData[1], /sun is up on the hill/);
  assert.equal(jamData[2], 16);
  const cpuData = song.buildData(cpu, cpuSchema, job);
  assert.equal(cpuData[0], 'pop, soft vocal');
  assert.match(cpuData[1], /sun is up on the hill/);
  assert.equal(cpuData[2], 110);
  assert.equal(cpuData[3], 16);
  assert.equal(cpuData[6], 'None (no LoRA)');
});
