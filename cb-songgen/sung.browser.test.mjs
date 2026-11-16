import { spawn } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import test from 'node:test';

const PORT = 8766;
const ROOT = new URL('../', import.meta.url).pathname;

const APPS = [
  { name: 'studio-espresso', path: '/apps/studio-espresso/index.html', kind: 'espresso' },
  // Coffeebreak Vocal Studio is no longer a Sung Song panel. Covered by apps/coffeebreak-ace/studio.playwright.py.
  { name: 'song-studio', path: '/apps/song-studio/index.html', kind: 'panel' },
  { name: 'music-software', path: '/apps/music-software-app/index.html', kind: 'panel', before: "if (typeof show==='function') show('s7')" },
  { name: 'recording-studio-pro', path: '/apps/recording-studio-pro/index.html', kind: 'panel', before: "var b=document.querySelector('#tabs button[data-p=\"sung\"]'); if (b) b.click();" },
  { name: 'music-tool-maker', path: '/apps/music-tool-maker/index.html', kind: 'panel' },
  { name: 'virtual-studio', path: '/apps/studio/index.html', kind: 'panel', before: "var b=document.querySelector('#tabs button[data-tab=\"sung\"]'); if (b) b.click();" },
];

function start(cmd, args, cwd) {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], cwd });
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
    await new Promise(r => setTimeout(r, 200));
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

const PAGE_FN = `async (app) => {
  let aceCalls = 0;
  const origFetch = window.fetch.bind(window);
  window.fetch = function (url, opts) {
    const href = String(url && url.url ? url.url : url);
    if (/hf\\.space|ace-step|diffrhythm/i.test(href)) aceCalls++;
    return origFetch(url, opts);
  };
  if (app.before) (0, eval)(app.before);
  const go = document.getElementById(app.kind === 'espresso' ? 'createGo' : 'cb-sung-go');
  if (!go) throw new Error('no create button');
  const box = go.getBoundingClientRect();
  const tools = {};
  if (app.tools) {
    const count = document.getElementById('cb-tool-count').textContent;
    const search = document.getElementById('cb-tool-search');
    search.value = 'coffee';
    search.dispatchEvent(new Event('input'));
    const row = document.querySelector('#cb-tool-list .row');
    if (!row) throw new Error('no syllable tool row');
    row.click();
    const syllable = document.getElementById('cb-tool-result').textContent;
    search.value = 'bright pop';
    search.dispatchEvent(new Event('input'));
    document.querySelector('#cb-tool-list .row').click();
    document.getElementById('cb-tool-apply').click();
    tools.count = count;
    tools.syllable = syllable;
    tools.style = document.getElementById('cb-sung-style').value;
    tools.bang = /!/.test(document.getElementById('cb-tools').innerText);
    tools.total = window.CBSungTools.TOTAL;
  }
  if (app.kind === 'espresso') {
    const song = await CBSongs.create({ lyrics: 'sun is up on the hill', seconds: 10, seed: 5, autoplay: false });
    const vocal = P.tracks.find(t => t.name === 'Vocals');
    const clip = vocal.clips[0];
    const buf = BUFS[clip.takes[clip.take || 0]];
    const data = buf.getChannelData(0);
    let peak = 0, energy = 0, n = 0;
    for (let i = 0; i < data.length; i += 8) {
      const a = Math.abs(data[i]);
      if (a > peak) peak = a;
      energy += data[i] * data[i];
      n++;
    }
    const found = CBVoice.detectPitch(data, buf.sampleRate, 80, 800);
    return {
      width: box.width,
      aceCalls,
      backend: song.vocal && song.vocal.model,
      fallback: false,
      peak, rms: Math.sqrt(energy / n), duration: buf.duration,
      hz: found.hz, corr: found.corr,
      expected: found.hz,
      voice: 'coffeebreak',
      honest: (document.getElementById('createHonest') || {}).textContent || '',
      engineChoices: document.querySelectorAll('#cb-sung-engine option').length,
      tools,
    };
  }
  document.getElementById('cb-sung-lyrics').value = 'sun is up on the hill';
  document.getElementById('cb-sung-seconds').value = '10';
  document.getElementById('cb-sung-engine').value = 'builtin';
  go.click();
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const audio = document.getElementById('cb-sung-audio');
    if (audio && audio.src && audio.readyState >= 1) break;
    const status = document.getElementById('cb-sung-status').textContent;
    if (/could not|at least two/i.test(status)) throw new Error(status);
    await new Promise(r => setTimeout(r, 100));
  }
  const audio = document.getElementById('cb-sung-audio');
  if (!audio || !audio.src) throw new Error(document.getElementById('cb-sung-status').textContent || 'no audio');
  const raw = await (await origFetch(audio.src)).arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = await ctx.decodeAudioData(raw.slice(0));
  const data = buf.getChannelData(0);
  let peak = 0, energy = 0, n = 0;
  for (let i = 0; i < data.length; i += 8) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
    energy += data[i] * data[i];
    n++;
  }
  const note = CBSong.lastSong().score.notes[0];
  const start = Math.floor((note.start + note.dur * 0.45) * buf.sampleRate);
  const found = CBBuiltinSinger.estimatePitch(data, buf.sampleRate, start, Math.floor(0.12 * buf.sampleRate));
  const first = {
    backend: CBSong.lastSong().backend,
    fallback: !!CBSong.lastSong().fallback,
    hz: found.hz,
    corr: found.corr,
    expected: 440 * Math.pow(2, (note.midi - 69) / 12),
  };
  let aceFallback = null;
  if (app.fallback) {
    window.fetch = function () { aceCalls++; return Promise.reject(new Error('busy')); };
    document.getElementById('cb-sung-engine').value = 'ace';
    document.getElementById('cb-sung-go').click();
    const end = Date.now() + 20000;
    while (Date.now() < end) {
      if (CBSong.lastSong() && CBSong.lastSong().fallback) break;
      await new Promise(r => setTimeout(r, 100));
    }
    aceFallback = { backend: CBSong.lastSong().backend, fallback: !!CBSong.lastSong().fallback, aceCalls };
  }
  return {
    width: box.width,
    aceCalls,
    backend: first.backend,
    fallback: first.fallback,
    peak, rms: Math.sqrt(energy / n), duration: buf.duration,
    hz: first.hz, corr: first.corr,
    expected: first.expected,
    honest: (document.getElementById('cb-sung-honest') || {}).textContent || '',
    panelBang: /!/.test(document.querySelector('.cb-sung').innerText),
    rights: document.body.innerText.includes('100 percent commercial rights'),
    pay: document.body.innerText.includes('Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com'),
    headspace: /headspace/i.test(document.body.innerText),
    tools,
    aceFallback,
  };
}`;

test('every sung app creates a voiced song on desktop and mobile', { timeout: 300000 }, async () => {
  const serverProc = start('python3', ['-m', 'http.server', String(PORT)], ROOT);
  const chrome = start('google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-port=9334',
    `--user-data-dir=/tmp/cbx-chrome-sung-${process.pid}`,
    'about:blank',
  ]);
  try {
    await waitFor(async () => {
      const res = await fetch('http://127.0.0.1:9334/json/version');
      if (!res.ok) throw new Error('chrome not ready');
      return true;
    }, 15000);
    const created = await fetch('http://127.0.0.1:9334/json/new?about:blank', { method: 'PUT' });
    const target = await created.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await once(ws, 'open');
    const send = cdp(ws);
    await send('Runtime.enable');
    await send('Page.enable');
    const results = [];
    for (const mobile of [false, true]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width: mobile ? 390 : 1280,
        height: mobile ? 844 : 800,
        deviceScaleFactor: 1,
        mobile,
      });
      for (const app of APPS) {
        const url = `http://127.0.0.1:${PORT}${app.path}`;
        await send('Page.navigate', { url });
        await waitFor(async () => {
          const ready = await send('Runtime.evaluate', {
            expression: app.kind === 'espresso'
              ? 'typeof CBSongs==="object" && !!document.getElementById("createGo")'
              : 'typeof CBSong==="object" && !!document.getElementById("cb-sung-go")',
            returnByValue: true,
          });
          if (!ready.result.value) throw new Error(app.name + ' still loading');
          return true;
        }, 25000);
        const run = await send('Runtime.evaluate', {
          awaitPromise: true,
          returnByValue: true,
          timeout: 40000,
          expression: `(${PAGE_FN})(${JSON.stringify({
            kind: app.kind,
            before: app.before || '',
            tools: !!app.tools,
            fallback: !!app.fallback && !mobile,
          })})`,
        });
        if (run.exceptionDetails) {
          throw new Error(app.name + ' ' + (mobile ? 'mobile' : 'desktop') + ' ' + JSON.stringify(run.exceptionDetails));
        }
        const out = run.result.value;
        if (out && out.error) throw new Error(app.name + ' ' + out.error);
        results.push({ app: app.name, mobile, out });
        assert.ok(out.width > 40, app.name + ' button width ' + out.width);
        assert.equal(out.fallback, false);
        assert.ok(out.peak > 0.2, app.name + ' peak ' + out.peak);
        assert.ok(out.rms > 0.02, app.name + ' rms ' + out.rms);
        assert.ok(out.duration > 8, app.name + ' duration ' + out.duration);
        assert.ok(out.corr > 0.2, app.name + ' corr ' + out.corr + ' hz ' + out.hz);
        if (app.kind === 'espresso') {
          assert.match(out.backend, /Coffeebreak voice/);
          assert.ok(out.hz > 80 && out.hz < 900, app.name + ' hz ' + out.hz);
          assert.equal(out.aceCalls, 0);
          assert.match(out.honest, /Coffeebreak voice/);
          assert.equal(out.engineChoices, 0);
        } else {
          assert.equal(out.backend, 'builtin-singer', app.name);
          assert.ok(Math.abs(out.hz - out.expected) / out.expected < 0.08, app.name + ' ' + out.hz + ' vs ' + out.expected);
          assert.equal(out.panelBang, false, app.name);
          assert.equal(out.rights, true, app.name);
          assert.equal(out.pay, true, app.name);
          assert.equal(out.headspace, false, app.name);
          assert.match(out.honest, /built-in synth voice/);
        }
        if (app.tools) {
          assert.equal(out.tools.total, 12000);
          assert.match(out.tools.count, /12,000 of 12,000 tools|of 12,000 tools/);
          assert.match(out.tools.syllable, /coffee/);
          assert.match(out.tools.syllable, /syllable/);
          assert.match(out.tools.style, /bright pop/);
          assert.equal(out.tools.bang, false);
        }
        if (out.aceFallback) {
          assert.equal(out.aceFallback.fallback, true);
          assert.equal(out.aceFallback.backend, 'builtin-singer');
          assert.ok(out.aceFallback.aceCalls > 0);
        }
        console.log(app.name, mobile ? 'mobile' : 'desktop', 'peak', out.peak.toFixed(2), 'hz', out.hz.toFixed(1));
      }
    }
    assert.equal(results.length, APPS.length * 2);
  } finally {
    chrome.kill('SIGKILL');
    serverProc.kill('SIGKILL');
  }
});
