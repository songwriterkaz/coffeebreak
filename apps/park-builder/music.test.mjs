import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const js = readFileSync(resolve(dir, 'game.js'), 'utf8');

test('music files exist and playback is armed from a user gesture', () => {
  const files = [...js.matchAll(/file:\s*'([^']+\.mp3)'/g)].map((match) => match[1]);
  assert.ok(files.length >= 3, 'expected a playlist of real files');
  for (const file of files) {
    assert.equal(existsSync(resolve(dir, file)), true, file);
  }
  assert.match(js, /Turn music on/);
  assert.match(js, /Turn music off/);
  assert.match(js, /playsInline/);
  assert.doesNotMatch(js, /audio\.play\(\)\.catch\(\(\) => \{\}\)/);
  assert.doesNotMatch(js, /crossOrigin\s*=\s*'anonymous'/);
  assert.doesNotMatch(js, /tracks\/coffee-break\.mp3|tracks\/im-weak\.mp3|tracks\/knee-deep-mashup\.mp3/);
});
