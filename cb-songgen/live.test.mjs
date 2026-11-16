/* Live check. Run with: node --test cb-songgen/live.test.mjs
   Writes the returned file and prints which service answered. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const song = require('./songgen.js');

const OUT = process.env.CB_SONG_OUT || '/tmp/coffeebreak-sung-song.mp3';

test('a live open model returns a full song file', { timeout: 560000 }, async () => {
  const sung = await song.generateSong({
    lyrics: 'sun is up on the hill\nthe coffee is warm and the road is still',
    prompt: 'bright pop, clear sung vocal, acoustic guitar, bass and drums',
    seconds: 20,
    seed: 7,
  }, { timeoutMs: 170000 });
  assert.ok(sung.bytes.byteLength > 20000, 'bytes ' + sung.bytes.byteLength);
  assert.equal(song.looksLikeAudio(sung.bytes), true);
  assert.match(sung.model, /ACE-Step|DiffRhythm/);
  assert.match(sung.license, /MIT|Apache-2\.0/);
  fs.writeFileSync(OUT, Buffer.from(sung.bytes));
  const dur = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', OUT], { encoding: 'utf8' });
  assert.ok(parseFloat(dur) > 8, dur);
  const vol = execFileSync('ffmpeg', ['-i', OUT, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const mean = vol.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/);
  assert.ok(mean, vol.slice(-400));
  assert.ok(parseFloat(mean[1]) > -45, 'mean volume ' + mean[1]);
  const note = {
    backend: sung.backend,
    model: sung.model,
    license: sung.license,
    credit: sung.credit,
    bytes: sung.bytes.byteLength,
    duration: parseFloat(dur),
    meanVolumeDb: parseFloat(mean[1]),
    file: OUT,
  };
  fs.writeFileSync(OUT + '.json', JSON.stringify(note, null, 2));
  console.log(JSON.stringify(note));
});
