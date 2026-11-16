import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const core = require('./songs-core.js');

function memoryStorage(seed) {
  const data = Object.assign({}, seed);
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); },
    dump: data,
  };
}

test('style words map onto the studio moods, genres and keys', () => {
  const style = core.readStyle({ description: 'a slow sad country song in G minor', mood: 'Happy', genre: 'Pop', bpm: 120 });
  assert.equal(style.mood, 'Sad');
  assert.equal(style.genre, 'Country');
  assert.equal(style.key, 7);
  assert.equal(style.minor, true);
  assert.equal(style.bpm, 78);
  assert.equal(core.progressionFor(style).name, 'Country I-IV-I-V');
});

test('a vocal score assigns real pitches and stays singable length', () => {
  const notes = [];
  for (let i = 0; i < 6; i++) notes.push({ p: 60 + i, s: i, l: 1, v: 0.8 });
  const lyrics = Array.from({ length: 40 }, (_, i) => 'word' + i).join(' ');
  const score = core.buildScore(lyrics, notes, 110);
  assert.ok(score.words >= 2);
  assert.ok(score.seconds <= 22);
  assert.match(score.text, /^word0\|6[0-9]\|0\.\d+/);
  const phrased = core.buildScore('sun is up\n\nand the wind', notes, 110);
  assert.ok(phrased.notes.some(n => n.rest));
  assert.throws(() => core.buildScore('hello', notes, 110), /at least two words/);
});

test('the cart records a PayID reference and never marks payment received', () => {
  const storage = memoryStorage();
  const first = core.readCart(storage, () => 0.1);
  assert.equal(first.amount, 10);
  assert.equal(first.currency, 'USD');
  assert.equal(first.paid, false);
  assert.equal(first.status, 'awaiting_transfer');
  assert.equal(first.label, 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  assert.match(first.reference, /^CB[A-Z2-9]{8}$/);
  storage.setItem('cbx-espresso-cart', JSON.stringify({ reference: first.reference, paid: true, status: 'paid', amount: 1, currency: 'AUD' }));
  const again = core.readCart(storage, () => 0.9);
  assert.equal(again.reference, first.reference);
  assert.equal(again.paid, false);
  assert.equal(again.amount, 10);
  assert.equal(again.currency, 'USD');
  assert.equal(again.status, 'awaiting_transfer');
  assert.equal(JSON.parse(storage.dump['cbx-espresso-cart']).paid, false);
});

test('a personal library stores and removes songs', async () => {
  const lib = core.memoryLibrary();
  await lib.put({ id: 'a', title: 'Hill song', created: 2, summary: 'Sung', lyrics: 'sun up', vocal: { model: core.MODEL, voice: 'EN singer 1 — GTSinger', info: 'ok' } });
  await lib.put({ id: 'b', title: 'Later', created: 5, summary: 'Sung later', lyrics: 'day wide' });
  const list = await lib.list();
  assert.deepEqual(list.map(s => s.id), ['b', 'a']);
  assert.equal((await lib.get('a')).title, 'Hill song');
  await lib.remove('a');
  assert.equal(await lib.get('a'), null);
  assert.equal((await lib.list()).length, 1);
});

test('Create song sings with the Coffeebreak voice at the written pitch', async () => {
  assert.equal(core.vocalSeconds('sun is up on the hill'), 12);
  const notes = [
    { p: 69, s: 0, l: 2, v: 0.8 },
    { p: 69, s: 2, l: 2, v: 0.8 },
    { p: 69, s: 4, l: 2, v: 0.8 },
  ];
  const sung = await core.singVoice('la la la', { notes: notes, bpm: 80, seed: 3, seconds: 2.4 });
  assert.equal(sung.model, 'Coffeebreak voice');
  assert.equal(sung.backend, 'coffeebreak-voice');
  assert.equal(sung.mime, 'audio/wav');
  assert.ok(sung.bytes.byteLength > 1000);
  const alias = await core.singAceStep('la la la', { notes: notes, bpm: 80, seed: 3, seconds: 2.4 });
  assert.equal(alias.model, 'Coffeebreak voice');
  const voice = require('../../cb-voice/voice.js');
  const dec = voice.decodeMono(sung.bytes);
  const peak = voice.peakOf(dec.samples);
  assert.ok(peak > 0.05, 'peak ' + peak);
  const got = voice.detectPitch(dec.samples, dec.sampleRate, 300, 600);
  const cents = 1200 * Math.log2(got.hz / 440);
  assert.ok(Math.abs(cents) < 30, 'pitch ' + got.hz + ' Hz, ' + cents.toFixed(1) + ' cents');
});

test('Studio Espresso sings locally and does not call ACE-Step', async () => {
  let called = false;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { called = true; throw new Error('ace'); };
  try {
    const sung = await core.singAceStep('sun is up on the hill', { seconds: 10, seed: 2, prompt: 'pop' });
    assert.equal(called, false);
    assert.equal(sung.backend, 'coffeebreak-voice');
    assert.match(sung.model, /Coffeebreak voice/);
    assert.equal(sung.mime, 'audio/wav');
    const stats = core.wavStats(sung.bytes);
    assert.ok(stats.peak > 0.05, 'peak ' + stats.peak);
    assert.ok(stats.rms > 0.01, 'rms ' + stats.rms);
  } finally {
    globalThis.fetch = original;
  }
});
