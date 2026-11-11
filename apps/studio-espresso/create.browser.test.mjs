import { spawn } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';

const PORT = 8765;
const ROOT = new URL('../../', import.meta.url).pathname;
const PAGE = `http://127.0.0.1:${PORT}/apps/studio-espresso/index.html`;

function start(cmd, args, opts) {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], cwd: opts && opts.cwd });
  let log = '';
  child.stdout.on('data', d => { log += d; });
  child.stderr.on('data', d => { log += d; });
  child.log = () => log;
  return child;
}

async function waitFor(fn, ms) {
  const startAt = Date.now();
  let last;
  while (Date.now() - startAt < ms) {
    try { return await fn(); } catch (err) { last = err; }
    await new Promise(r => setTimeout(r, 250));
  }
  throw last || new Error('timed out');
}

function cdp(ws) {
  let n = 0;
  const pending = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const slot = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) slot.reject(new Error(msg.error.message));
      else slot.resolve(msg.result);
    }
  });
  return (method, params) => new Promise((resolve, reject) => {
    const id = ++n;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const server = start('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT });
server.kill = server.kill.bind(server);
const chrome = start('google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--autoplay-policy=no-user-gesture-required',
  '--remote-debugging-port=9333',
  `--user-data-dir=/tmp/cbx-chrome-songs-${process.pid}`,
  'about:blank',
]);

try {
  await waitFor(async () => {
    const res = await fetch('http://127.0.0.1:9333/json/version');
    if (!res.ok) throw new Error('chrome not ready');
    return true;
  }, 15000);
  const created = await fetch('http://127.0.0.1:9333/json/new?' + encodeURIComponent(PAGE), { method: 'PUT' });
  if (!created.ok) throw new Error('could not open the studio page ' + created.status);
  const target = await created.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await once(ws, 'open');
  const send = cdp(ws);
  await send('Runtime.enable');
  await waitFor(async () => {
    const ready = await send('Runtime.evaluate', { expression: 'typeof CBSongs==="object" && typeof renderSong==="function"', returnByValue: true });
    if (!ready.result.value) throw new Error('studio still loading');
    return true;
  }, 20000);
  const run = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    timeout: 120000,
    expression: `(() => (async () => {
      const simple = {
        hasLyrics: !!document.getElementById('createLyrics'),
        button: (document.getElementById('createGo') || {}).textContent || '',
        moreClosed: !!document.getElementById('createMore') && !document.getElementById('createMore').open,
        voiceInsideMore: !!document.querySelector('#createMore #createVoice'),
      };
      const song = await CBSongs.create({ lyrics: 'sun is up on the hill', steps: 8, seed: 3, autoplay: false });
      const listed = await CBSongs.list();
      const played = await CBSongs.play(song.id);
      const opened = await CBSongs.open(song.id);
      CBX.demoSong();
      const demo = await renderSong({ master: false, tail: 0.2 });
      let demoPeak = 0;
      const left = demo.getChannelData(0);
      for (let i = 0; i < left.length; i += 32) demoPeak = Math.max(demoPeak, Math.abs(left[i]));
      const tools = buildLib();
      const text = document.body.innerText;
      return {
        simple, song, listed: listed.map(s => ({ title: s.title, lyrics: s.lyrics })), played, opened,
        demoPeak, toolCount: tools.length,
        toolsAreFunctions: tools.every(t => typeof t.use === 'function' && t.name && t.cat),
        cart: CBSongs.cart(),
        hasPay: text.includes('Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com'),
        hasRights: text.includes('claims no ownership of third-party brands'),
        hasTesla: text.includes('Tesla') && text.includes('Starlink'),
        hasReport: !!document.getElementById('reportBtn'),
        fakeTools: /12[,.]?000\\s+tools/i.test(text),
        suno: /suno/i.test(text),
      };
    })())().catch(err => ({ error: err && (err.stack || err.message) || String(err) }))`,
  });
  if (run.exceptionDetails) throw new Error(JSON.stringify(run.exceptionDetails));
  const out = run.result.value;
  if (out.error) throw new Error(out.error);
  assert.equal(out.simple.hasLyrics, true);
  assert.equal(out.simple.button, 'Create song');
  assert.equal(out.simple.moreClosed, true);
  assert.equal(out.simple.voiceInsideMore, true);
  assert.equal(out.song.title, 'Sun is up on the hill');
  assert.equal(out.song.lyrics, 'sun is up on the hill');
  assert.equal(out.song.vocal.model, 'ASLP-lab/SemBridge');
  assert.ok(out.song.tracks.includes('Vocals'));
  assert.ok(out.song.tracks.includes('Drums'));
  assert.ok(out.listed.some(s => s.title === 'Sun is up on the hill' && s.lyrics === 'sun is up on the hill'));
  assert.ok(out.played.peak > 0.02, 'mix peak ' + out.played.peak);
  assert.ok(out.played.duration > 1, 'mix duration ' + out.played.duration);
  assert.equal(out.played.playing, true);
  assert.ok(out.played.seconds > 0, 'playhead ' + out.played.seconds);
  assert.ok(out.opened.vocalSeconds > 1);
  assert.ok(out.opened.vocalPeak > 0.05);
  assert.ok(out.opened.drumNotes > 0);
  assert.ok(out.demoPeak > 0.02, 'demo song still renders');
  assert.equal(out.cart.paid, false);
  assert.equal(out.cart.amount, 10);
  assert.equal(out.cart.status, 'awaiting_transfer');
  assert.match(out.cart.reference, /^CB[A-Z2-9]{8}$/);
  assert.equal(out.hasPay, true);
  assert.equal(out.hasRights, true);
  assert.equal(out.hasTesla, true);
  assert.equal(out.hasReport, true);
  assert.equal(out.fakeTools, false);
  assert.equal(out.suno, false);
  assert.equal(out.toolsAreFunctions, true);
  assert.ok(out.toolCount > 200 && out.toolCount < 6000, 'tool count ' + out.toolCount);
  console.log(JSON.stringify({ song: out.song, played: out.played, opened: out.opened, tools: out.toolCount, cart: out.cart.reference }, null, 2));
  console.log('browser create, library, and play: ok');
} finally {
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
}
