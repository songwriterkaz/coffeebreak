import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tools = require('./tools.js');

test('the catalogue is exactly 12000 tools in 12 categories', () => {
  assert.equal(tools.TOTAL, 12000);
  assert.equal(tools.CATS.length, 12);
  const seen = new Set();
  for (let i = 0; i < tools.TOTAL; i++) {
    const tool = tools.toolAt(i);
    seen.add(tool.cat);
    const out = tools.run(tool);
    assert.equal(out.id, tool.id);
    assert.ok(out.text.length > 12, tool.id + ' ' + out.text);
    assert.equal(out.text.includes('!'), false, out.text);
    assert.ok(out.proof != null, tool.id);
  }
  assert.equal(seen.size, 12);
});

test('a sample from each category returns a checked result', () => {
  const transpose = tools.run(0);
  assert.equal(transpose.proof.to, transpose.proof.from + transpose.proof.semitones);
  assert.match(transpose.text, /semitone/);

  const chord = tools.run(1000);
  assert.deepEqual(chord.proof.notes, ['C', 'E', 'G']);
  assert.match(chord.text, /C E G/);

  const scale = tools.run(2000);
  assert.deepEqual(scale.proof.notes, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);

  const tempo = tools.run(3000);
  assert.equal(tempo.proof.bpm, 40);
  assert.equal(tempo.proof.ms, 1500);

  const rhyme = tools.run(4000);
  assert.equal(rhyme.proof.word, 'light');
  assert.ok(rhyme.proof.rhymes.includes('night'));
  assert.ok(rhyme.proof.rhymes.every(word => word.endsWith('ight') || word.endsWith('ight')));

  const syllables = tools.run(5000);
  assert.equal(syllables.proof.word, 'coffee');
  assert.equal(syllables.proof.count, 2);
  assert.deepEqual(syllables.proof.syllables, tools.syllablesOf('coffee'));

  const metro = tools.run(6000);
  assert.equal(metro.proof.bpm, 60);
  assert.equal(metro.proof.clicks.length, metro.proof.beats);
  assert.equal(metro.proof.clicks[0], 0);

  const eq = tools.run(7000);
  assert.equal(eq.proof.frequency, 120);
  assert.equal(eq.proof.gain, -6);
  assert.ok(eq.action.frequency > 0);

  const tuner = tools.run(8000);
  assert.equal(typeof tuner.proof.cents, 'number');
  assert.ok(tuner.proof.target > 40);

  const structure = tools.run(9000);
  assert.ok(structure.proof.seconds > 10);
  assert.ok(structure.proof.sections >= 4);

  const style = tools.run(10000);
  assert.match(style.proof.style, /bright pop/);
  assert.match(style.proof.style, /BPM/);
  assert.equal(style.action.type, 'style');

  const prog = tools.run(11000);
  assert.ok(prog.proof.chords.length >= 4);
  assert.match(prog.text, /\|/);
});

test('search finds a real tool and the matched count is exact', () => {
  const found = tools.search('coffee', 'syllable', 10);
  assert.equal(found.total, 12000);
  assert.ok(found.matched >= 1);
  assert.ok(found.items.every(tool => /coffee/i.test(tool.name)));
  const all = tools.search('', 'chord', 5);
  assert.equal(all.matched, 1000);
  assert.equal(all.items.length, 5);
});
