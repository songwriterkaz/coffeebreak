import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tools = require('./tools.js');
const voice = require('../../cb-voice/voice.js');

test('the catalog has a real tool set and 11996 named presets', () => {
  const c = tools.counts();
  assert.equal(c.tools, 34);
  assert.equal(c.presets, 11996);
  assert.equal(c.toolsByCat.Effect, 16);
  assert.equal(c.toolsByCat['Vocal style'], 8);
  assert.equal(c.toolsByCat.Instrument, 6);
  assert.equal(c.toolsByCat.Generator, 4);
  const ids = new Set(tools.catalog().presets.map(p => p.id));
  assert.equal(ids.size, 11996);
});

test('search and filtering find usable presets', () => {
  const halls = tools.search('Hall 1.6 28% Warm', 'Effect');
  assert.ok(halls.length >= 1);
  assert.match(halls[0].name, /Reverb: Hall/);
  const styles = tools.search('Airy Late medium', 'Vocal style');
  assert.ok(styles.length >= 1);
  const none = tools.search('xyzzy-not-a-preset');
  assert.equal(none.length, 0);
});

test('an effect keeps a sung note audible and in tune', () => {
  const wav = voice.sing({ seconds: 1.6, notes: [{ w: 'la', p: 69, t: 0.15, d: 1.45 }] }, { seed: 3 });
  const dec = voice.decodeMono(wav);
  assert.ok(voice.peakOf(dec.samples) > 0.05);
  const preset = tools.search('Hall, 1.6s, 28% mix, Warm', 'Effect')[0];
  const wet = tools.applyEffect(dec.samples, dec.sampleRate, preset);
  assert.ok(tools.peakOf(wet) > 0.05);
  const got = voice.detectPitch(dec.samples, dec.sampleRate, 300, 600);
  const cents = 1200 * Math.log2(got.hz / 440);
  assert.ok(Math.abs(cents) < 30, 'pitch ' + got.hz + ' cents ' + cents);
});
