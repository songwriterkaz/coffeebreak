import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const voice = require('../../cb-voice/voice.js');

function held(midi, seconds) {
  return { seconds, notes: [{ w: 'la', p: midi, t: 0.15, d: seconds - 0.15 }] };
}

test('the Coffeebreak voice sings a non-silent note at the written pitch', () => {
  for (const midi of [60, 69, 72]) {
    const wav = voice.sing(held(midi, 1.6), { seed: 3 });
    const dec = voice.decodeMono(wav);
    const peak = voice.peakOf(dec.samples);
    assert.ok(peak > 0.05, 'silent at midi ' + midi + ' peak ' + peak);
    const want = voice.midiHz(midi);
    const got = voice.detectPitch(dec.samples, dec.sampleRate, want * 0.7, want * 1.4);
    const cents = 1200 * Math.log2(got.hz / want);
    assert.ok(Math.abs(cents) < 20, 'midi ' + midi + ' was ' + got.hz + ' Hz, ' + cents.toFixed(1) + ' cents');
    assert.ok(got.corr > 0.7, 'corr ' + got.corr);
  }
});

test('a short lyric phrase keeps audible level', () => {
  const score = {
    seconds: 3.2,
    notes: [
      { w: 'sun', p: 64, t: 0.2, d: 0.55 },
      { w: 'is', p: 67, t: 0.8, d: 0.4 },
      { w: 'up', p: 69, t: 1.25, d: 0.7 },
      { w: 'on', p: 67, t: 2.05, d: 0.4 },
      { w: 'the', p: 65, t: 2.5, d: 0.25 },
      { w: 'hill', p: 64, t: 2.8, d: 0.7 },
    ],
  };
  const wav = voice.sing(score, { seed: 4 });
  const dec = voice.decodeMono(wav);
  assert.ok(voice.peakOf(dec.samples) > 0.05);
  assert.ok(wav.byteLength > 10000);
});
