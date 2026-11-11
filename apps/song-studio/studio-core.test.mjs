import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const studio = require('./studio-core.js');
const cart = require('../../payid-cart/cart.js');

const PAY = 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';

test('chord helper names the scale degrees', () => {
  assert.equal(studio.chordOf(0, 'major', 0).name, 'C');
  assert.equal(studio.chordOf(0, 'major', 1).name, 'Dm');
  assert.equal(studio.chordOf(0, 'major', 6).name, 'Bdim');
  assert.equal(studio.chordOf(9, 'minor', 0).name, 'Am');
  assert.deepEqual(studio.progressionNames(7, 'major', [0, 4, 5, 3]), ['G', 'D', 'Em', 'C']);
});

test('a project round-trips lyrics, melody and chords', () => {
  const saved = studio.serializeProject({
    title: 'Kitchen light',
    lyr: '[Verse]\nThe kettle clicks',
    bpm: 96,
    key: 7,
    scale: 'major',
    prog: [0, 4, 5, 3, 0, 4, 5, 3],
    mel: [67, -1, 69, 71, -1, -1, -1, -1, 72, -1, -1, -1, -1, -1, -1, -1]
  });
  const back = studio.parseProject(saved);
  assert.equal(back.ok, true);
  assert.equal(back.project.title, 'Kitchen light');
  assert.match(back.project.lyr, /kettle clicks/);
  assert.equal(back.project.bpm, 96);
  assert.equal(back.project.key, 7);
  assert.deepEqual(back.project.prog, [0, 4, 5, 3, 0, 4, 5, 3]);
  assert.equal(back.project.mel[0], 67);
  assert.equal(back.project.mel[1], -1);
});

test('a saved project cannot smuggle a Suno audio address', () => {
  const raw = studio.serializeProject({
    title: 'Nope',
    lyr: 'line',
    vocalSrc: 'https://cdn1.suno.ai/abc.mp3'
  });
  const back = studio.parseProject(raw);
  assert.equal(back.ok, true);
  assert.equal(back.project.vocalSrc, '');
});

test('audio playback stays on files in this copy or a local take', () => {
  assert.equal(studio.resolveAudio('').playable, false);
  assert.equal(studio.resolveAudio('https://cdn1.suno.ai/abc.mp3').playable, false);
  assert.equal(studio.resolveAudio('https://suno.com/song/abc').playable, false);
  assert.equal(studio.resolveAudio('https://example.com/track.mp3').playable, false);
  const local = studio.resolveAudio('../../radio/music/cinnamon-candy.mp3');
  assert.equal(local.playable, true);
  assert.equal(local.src, '../../radio/music/cinnamon-candy.mp3');
  const take = studio.resolveAudio('blob:http://localhost/take');
  assert.equal(take.playable, true);
});

test('library search shows stored lyric sheets and does not invent a wall of tracks', () => {
  const audio = [{ id: 'a', title: 'Cinnamon Candy', audio: '../../radio/music/cinnamon-candy.mp3' }];
  const lyrics = [
    { id: '1', chunk: 0, title: 'No limit' },
    { id: '2', chunk: 0, title: 'Kitchen light' }
  ];
  const idle = studio.listLibrary(audio, lyrics, '');
  assert.equal(idle.audio.length, 1);
  assert.equal(idle.lyrics.length, 0);
  assert.equal(idle.lyricCount, 2);
  assert.match(idle.note, /Type at least 2 letters/);
  const hit = studio.listLibrary(audio, lyrics, 'kit');
  assert.equal(hit.lyrics.length, 1);
  assert.equal(hit.lyrics[0].title, 'Kitchen light');
  const many = [];
  for (let i = 0; i < 500; i++) many.push({ id: String(i), chunk: 0, title: 'rain song ' + i });
  const capped = studio.listLibrary([], many, 'rain');
  assert.equal(capped.lyrics.length, 300);
  assert.equal(capped.lyricCount, 500);
});

test('lyric titles come from the sheet, not a generated catalogue', () => {
  assert.equal(studio.lyricTitle('[Verse]\nNo limit\nYeah'), 'No limit');
  assert.equal(studio.lyricTitle(''), 'Untitled lyric sheet');
});

test('the $10 licence uses PayID and stays unpaid in the browser', () => {
  const view = studio.licenceView(cart, null);
  assert.equal(view.ok, true);
  assert.equal(view.price, '10.00');
  assert.equal(view.currency, 'AUD');
  assert.equal(view.paymentLabel, PAY);
  assert.equal(view.paymentLabel, cart.PAYMENT_LABEL);
  assert.equal(view.requestsPayment, true);
  assert.equal(view.showTransferInstructions, true);
  assert.equal(view.paid, false);
  assert.equal(view.confirmed, false);
  assert.equal(view.unlocked, false);
  assert.equal(view.studioUsable, true);
  assert.equal(view.status, 'unpaid');
  assert.match(studio.licenceStatusText(view), /unpaid/);
  assert.equal(studio.licenceStatusText(view).includes('!'), false);

  const memory = new MapStore();
  const state = cart.buildState({
    storeId: 'song-studio',
    currency: 'AUD',
    lines: [{ id: 'song-studio', name: studio.PRODUCT_NAME, unitMinor: 1000, qty: 1 }],
    customerClaimsPaid: true
  });
  cart.persist(memory, 'k', { ...state, paid: true, confirmed: true, status: 'paid' });
  const restored = cart.restore(memory, 'k');
  assert.equal(restored.paid, false);
  assert.notEqual(restored.status, 'paid');
  const access = studio.accessAfterClaim({ paid: true, status: 'paid', confirmed: true });
  assert.equal(access.paid, false);
  assert.equal(access.unlocked, false);
  assert.equal(access.studioUsable, true);
});

test('capability copy is honest about the guide vocal and Suno', () => {
  const text = studio.CAPABILITY.can.concat(studio.CAPABILITY.cannot).join('\n');
  assert.equal(text.includes('!'), false);
  assert.equal(/headspace/i.test(text), false);
  assert.equal(/paypal|gumroad/i.test(text), false);
  assert.match(text, /synthesized guide vocal/);
  assert.match(text, /12,000 studio tools/);
  assert.match(text, /does not call Suno|Call Suno/i);
  assert.match(text, /recorded human singer/);
  assert.match(text, /does not mark the \$10 licence as paid|Payment counts only after/i);
});

test('the guide vocal sings the lyric on the melody', () => {
  const score = studio.vocalScore({
    lyr: '[Verse]\nKitchen light',
    mel: [60, -1, 64, 67],
    bpm: 120,
    key: 0,
    scale: 'major'
  });
  assert.ok(score.length >= 3);
  assert.equal(score[0].text.toLowerCase(), 'kitch');
  assert.equal(score[0].vowel, 'i');
  assert.equal(score[0].midi, 60);
  assert.ok(score.every((note) => note.midi > 0 && note.dur > 0));
  const sung = studio.vocalScore({ lyr: '', mel: [-1, -1], bpm: 100, key: 0, scale: 'major' });
  assert.equal(sung[0].text, 'ah');
  assert.ok(sung[0].midi > 0);
});

test('there are 12,000 runnable studio tools and search does not dump them all', () => {
  assert.equal(studio.TOOL_TOTAL, 12000);
  assert.equal(studio.toolAt(0).id, 'CB-00001');
  assert.equal(studio.toolAt(11999).cat, 'checklist');
  const page = studio.searchTools('', 40);
  assert.equal(page.total, 12000);
  assert.equal(page.items.length, 40);
  const vocal = studio.searchTools('vocal country', 20);
  assert.ok(vocal.items.length > 0);
  assert.ok(vocal.items.length <= 20);
  assert.ok(vocal.items.every((tool) => /vocal/i.test(tool.name) && /country/i.test(tool.name)));
  const run = studio.runStudioTool(vocal.items[0].i, { title: 'Kitchen light', key: 0, scale: 'major' });
  assert.match(run.text, /guide vocal/);
  assert.equal(run.vocal.on, true);
  const chords = studio.runStudioTool(2400, { title: 'Kitchen light', key: 0, scale: 'major' });
  assert.equal(chords.cat, 'chords');
  assert.equal(chords.prog.length, 8);
  const melody = studio.runStudioTool(3600, { key: 7, scale: 'major' });
  assert.equal(melody.mel.length, 16);
  assert.ok(melody.mel.some((n) => n > 0));
  assert.equal(run.text.includes('!'), false);
});

test('local audio entries are real files and are not Suno addresses', () => {
  const tracks = JSON.parse(readFileSync(join(here, 'local-tracks.json'), 'utf8'));
  assert.ok(tracks.length >= 10);
  assert.ok(tracks.length < 100);
  for (const track of tracks) {
    assert.equal(studio.resolveAudio(track.audio).playable, true);
    assert.equal(/suno\.ai|suno\.com/i.test(track.audio), false);
    assert.equal(track.title.includes('!'), false);
    const file = resolve(here, track.audio);
    assert.equal(existsSync(file), true, track.audio);
  }
});

test('the lyric index points at sheets already stored in this copy', () => {
  const where = JSON.parse(readFileSync(join(here, 'suno/where.json'), 'utf8'));
  let stored = 0;
  for (const name of readdirSync(join(here, 'suno/l'))) {
    if (!name.endsWith('.json')) continue;
    stored += Object.keys(JSON.parse(readFileSync(join(here, 'suno/l', name), 'utf8'))).length;
  }
  assert.equal(where.length, stored);
  assert.ok(where.length > 1000);
  const sampleId = '90880eac-884a-4713-9089-c59a591ab65c';
  const row = where.find((entry) => entry[0] === sampleId);
  assert.ok(row);
  assert.equal(row[1], 0);
  const sheet = JSON.parse(readFileSync(join(here, 'suno/l/000.json'), 'utf8'))[sampleId];
  assert.equal(row[2], studio.lyricTitle(sheet));
  assert.equal(row.length, 3);
});

test('the song studio page states the limit, the price, and the footer', () => {
  const html = readFileSync(join(here, 'index.html'), 'utf8');
  const karaoke = readFileSync(join(here, 'cb-suno-karaoke.js'), 'utf8');
  const honest = between(html, '<!-- cb-studio-honest -->', '<!-- /cb-studio-honest -->');
  const licence = between(html, '<!-- cb-studio-licence -->', '<!-- /cb-studio-licence -->');
  const footer = between(html, '<!-- cb-studio-footer -->', '<!-- /cb-studio-footer -->');
  for (const block of [honest, licence, footer]) {
    const visible = block.replace(/<!--[\s\S]*?-->/g, '');
    assert.equal(visible.includes('!'), false, visible.slice(0, 120));
    assert.equal(/headspace/i.test(visible), false);
  }
  assert.match(honest, /guide vocal/);
  assert.match(honest, /synthesized in this browser/);
  assert.match(honest, /12,000 studio tools/);
  assert.match(honest, /does not call Suno/);
  assert.match(html, /id="hearVocal"/);
  assert.match(html, /id="vocalOn"/);
  assert.match(html, /function singNote/);
  assert.match(html, /P\.vocalOn&&P\.vocalScore/);
  assert.match(licence, /\$10 AUD/);
  assert.match(licence, new RegExp(PAY.replace(/[()]/g, '\\$&')));
  assert.match(licence, /unpaid/);
  assert.match(footer, /keeps all rights/);
  assert.match(footer, /Third-party brands named belong to their owners/);
  assert.match(footer, /https:\/\/www\.tesla\.com/);
  assert.match(footer, /https:\/\/www\.starlink\.com/);
  assert.equal(/paypal|gumroad/i.test(html), false);
  assert.equal(/cdn1\.suno\.ai|suno\.com/i.test(html + karaoke), false);
  assert.match(html, /id="importVocal"/);
  assert.match(html, /function exportWav\(\)\{return _full_exportWav\(\)\}/);
  assert.match(html, /function saveProj\(\)\{return _full_saveProj\(\)\}/);
  assert.equal(html.includes('Get the full version'), false);
  assert.match(html, /cbreport\.js/);
});

function between(text, start, end) {
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  assert.ok(a >= 0 && b > a, start);
  return text.slice(a, b);
}

function MapStore() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); }
  };
}

void root;
