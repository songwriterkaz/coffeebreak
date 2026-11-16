import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const singer = require('./builtin-singer.js');

function pcmPeak(buffer) {
  const view = new DataView(buffer);
  assert.equal(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)), 'RIFF');
  let offset = 12;
  let channels = 1;
  let rate = 22050;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    const size = view.getUint32(offset + 4, true);
    if (id === 'fmt ') {
      channels = view.getUint16(offset + 10, true);
      rate = view.getUint32(offset + 12, true);
    }
    if (id === 'data') {
      const frames = Math.floor(size / 2 / channels);
      let peak = 0;
      let energy = 0;
      let n = 0;
      for (let i = 0; i < frames; i += 8) {
        const s = view.getInt16(offset + 8 + i * channels * 2, true) / 32768;
        const a = Math.abs(s);
        if (a > peak) peak = a;
        energy += s * s;
        n++;
      }
      return { peak: peak, rms: Math.sqrt(energy / Math.max(1, n)), frames: frames, rate: rate, channels: channels };
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error('no data chunk');
}

test('two words are required before any audio is made', () => {
  assert.throws(() => singer.sing({ lyrics: 'hello', seconds: 6, seed: 1 }), /at least two words/);
});

test('the built-in voice sings the lyric on a voiced pitch with backing', () => {
  const sung = singer.sing({
    lyrics: 'sun is up on the hill',
    prompt: 'bright pop, 110 bpm',
    seconds: 6,
    seed: 3,
  });
  assert.equal(sung.model, 'Coffeebreak built-in synth voice');
  assert.equal(sung.backend, 'builtin-singer');
  assert.equal(sung.mime, 'audio/wav');
  assert.match(sung.credit, /synthesizer/);
  assert.equal(sung.credit.includes('!'), false);
  assert.equal(sung.score.notes.length >= 6, true);
  const stats = pcmPeak(sung.bytes);
  assert.equal(stats.channels, 2);
  assert.ok(stats.peak > 0.2, 'peak ' + stats.peak);
  assert.ok(stats.rms > 0.02, 'rms ' + stats.rms);
  assert.ok(stats.frames / stats.rate > 5, 'duration');
  const note = sung.score.notes[0];
  const start = Math.floor((note.start + note.dur * 0.45) * sung.rate);
  const found = singer.estimatePitch(sung.vocal, sung.rate, start, Math.floor(0.12 * sung.rate));
  const expected = singer.midiHz(note.midi);
  assert.ok(found.corr > 0.25, 'corr ' + found.corr + ' hz ' + found.hz);
  assert.ok(Math.abs(found.hz - expected) / expected < 0.08, found.hz + ' vs ' + expected);
  let lowMix = 0;
  let lowVoice = 0;
  const a = Math.exp(-2 * Math.PI * 90 / sung.rate);
  let ym = 0;
  let yv = 0;
  for (let i = 0; i < sung.left.length; i += 2) {
    ym = ym + (1 - a) * (sung.left[i] - ym);
    yv = yv + (1 - a) * (sung.vocal[i] - yv);
    lowMix += ym * ym;
    lowVoice += yv * yv;
  }
  assert.ok(lowMix > lowVoice * 1.4, 'backing low energy ' + lowMix + ' vs voice ' + lowVoice);
});

test('the same lyric and seed repeat, and a different lyric does not', () => {
  const a = singer.sing({ lyrics: 'sun is up on the hill', seconds: 6, seed: 4 });
  const b = singer.sing({ lyrics: 'sun is up on the hill', seconds: 6, seed: 4 });
  const c = singer.sing({ lyrics: 'see the bee flee free', seconds: 6, seed: 4 });
  let same = 0;
  let diff = 0;
  for (let i = 0; i < a.vocal.length; i += 20) {
    same += Math.abs(a.vocal[i] - b.vocal[i]);
    diff += Math.abs(a.vocal[i] - c.vocal[i]);
  }
  assert.equal(same, 0);
  assert.ok(diff > 5, 'lyric difference ' + diff);
  assert.notEqual(a.score.notes.map(n => n.vowel).join(''), c.score.notes.map(n => n.vowel).join(''));
});
