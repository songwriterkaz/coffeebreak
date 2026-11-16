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

test('when every service fails the error is plain and no audio is returned', async () => {
  const fetchImpl = fetchMock([
    { match: 'ace-step-ace-step-v1-5.hf.space/config', json: config('generation_wrapper', 77) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/data', text: done('a', { error: 'busy' }, false) },
    { match: 'ace-step-ace-step-v1-5.hf.space/gradio_api/queue/join', json: { event_id: 'a' } },
    { match: 'reubencf-kiku-ace-step-15.hf.space/config', json: config('song', 2) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/data', text: done('b', { error: 'queue full' }, false) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/join', json: { event_id: 'b' } },
  ]);
  await assert.rejects(
    () => song.generateSong(
      { lyrics: 'sun is up on the hill', seconds: 12, seed: 1 },
      { fetchImpl, backends: song.BACKENDS.slice(0, 2), schemas: { 'ace-step-v15': aceSchema, 'ace-step-v15-song': kikuSchema } }
    ),
    err => {
      assert.match(err.message, /Nothing was saved and no stand-in audio was played/);
      assert.equal(err.message.includes('!'), false);
      assert.equal(err.bytes, undefined);
      return true;
    }
  );
});

test('a tiny or non-audio file is not treated as a song', async () => {
  const fetchImpl = fetchMock([
    { match: 'reubencf-kiku-ace-step-15.hf.space/config', json: config('song', 2) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/data', text: done('c', { data: [{ url: 'https://files.example/bad.mp3', orig_name: 'bad.mp3' }] }, true) },
    { match: 'reubencf-kiku-ace-step-15.hf.space/gradio_api/queue/join', json: { event_id: 'c' } },
    { match: 'bad.mp3', bytes: new Uint8Array([1, 2, 3, 4]).buffer },
  ]);
  await assert.rejects(
    () => song.generateSong(
      { lyrics: 'sun is up on the hill', seconds: 12, seed: 1 },
      { fetchImpl, backends: [song.BACKENDS[1]], schemas: { 'ace-step-v15-song': kikuSchema } }
    ),
    /not audio/
  );
});

test('fewer than two words is refused before any service is called', async () => {
  let called = false;
  await assert.rejects(
    () => song.generateSong({ lyrics: 'hello' }, { fetchImpl: async () => { called = true; throw new Error('no'); } }),
    /at least two words/
  );
  assert.equal(called, false);
});
