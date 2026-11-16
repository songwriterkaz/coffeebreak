/* Shared Coffeebreak sung-song panel. One copy, mounted by each music app. */
(function () {
  var G = window.CBSong;
  if (!G) return;
  var RIGHTS = 'You get 100 percent commercial rights to the songs you make here. You can sell them, release them, or use them in a film. The app, its name, and its design stay with Coffeebreak.';
  var DISCLAIMER = 'Coffeebreak keeps all rights to its products, designs, apps, name and logo. Buyers may resell physical products they bought, but may not copy them or make their own versions. Coffeebreak claims no ownership of third-party brands named here, which belong to their owners, and is not affiliated with or endorsed by them.';
  var PAY = (window.CoffeebreakCart && window.CoffeebreakCart.PAYMENT_LABEL) || 'Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';

  function css() {
    if (document.getElementById('cb-sung-css')) return;
    var style = document.createElement('style');
    style.id = 'cb-sung-css';
    style.textContent = '.cb-sung{font:16px/1.45 Georgia,serif;color:#3a1028;background:#fff7fb;border:1px solid #f3c1da;border-radius:16px;padding:16px;margin:16px 0;max-width:760px}' +
      '.cb-sung h2,.cb-sung h3{margin:0 0 8px;font-size:1.25rem}.cb-sung label{display:block;margin:10px 0 4px;font-weight:700}' +
      '.cb-sung textarea,.cb-sung input[type=text],.cb-sung input[type=number]{width:100%;box-sizing:border-box;font:inherit;padding:8px;border-radius:10px;border:1px solid #e48ab3;background:#fff}' +
      '.cb-sung textarea{min-height:140px}.cb-sung button{font:inherit;background:#c2185b;color:#fff;border:0;border-radius:999px;padding:10px 18px;cursor:pointer;margin:8px 8px 8px 0}' +
      '.cb-sung button[disabled]{opacity:.6}.cb-sung .hint,.cb-sung .fine{font-size:13px;color:#6d3554}.cb-sung audio{width:100%;margin:8px 0}' +
      '.cb-sung li{margin:8px 0;padding:8px;background:#fff;border-radius:10px}.cb-sung a{color:#a01455}';
    document.head.appendChild(style);
  }

  function db(name) {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('storage')); return; }
      var req = indexedDB.open(name, 1);
      req.onupgradeneeded = function () {
        var base = req.result;
        if (!base.objectStoreNames.contains('songs')) base.createObjectStore('songs', { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function storeOp(database, mode, fn) {
    return new Promise(function (resolve, reject) {
      var tx = database.transaction('songs', mode);
      var out = fn(tx.objectStore('songs'));
      tx.oncomplete = function () { resolve(out && out.result); };
      tx.onerror = function () { reject(tx.error); };
    });
  }

  function memoryStore() {
    var rows = [];
    return {
      async list(app) { return rows.filter(function (row) { return row.app === app; }).sort(function (a, b) { return b.created - a.created; }); },
      async put(row) { rows = rows.filter(function (item) { return item.id !== row.id; }).concat([row]); },
      async remove(id) { rows = rows.filter(function (item) { return item.id !== id; }); },
    };
  }

  async function openStore(name) {
    try {
      var database = await db(name);
      return {
        async list(app) {
          var all = await new Promise(function (resolve, reject) {
            var tx = database.transaction('songs', 'readonly');
            var req = tx.objectStore('songs').getAll();
            req.onsuccess = function () { resolve(req.result || []); };
            req.onerror = function () { reject(req.error); };
          });
          return all.filter(function (row) { return row.app === app; }).sort(function (a, b) { return b.created - a.created; });
        },
        async put(row) {
          await storeOp(database, 'readwrite', function (store) { return store.put(row); });
        },
        async remove(id) {
          await storeOp(database, 'readwrite', function (store) { return store.delete(id); });
        },
      };
    } catch (e) {
      return memoryStore();
    }
  }

  function titleFrom(lyrics) {
    var line = String(lyrics || '').split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean)[0] || 'Untitled song';
    return line.slice(0, 80);
  }

  function saveFile(bytes, mime, name) {
    var blob = new Blob([bytes], { type: mime || 'audio/mpeg' });
    var url = URL.createObjectURL(blob);
    var frame = document.createElement('iframe');
    frame.setAttribute('hidden', '');
    document.body.appendChild(frame);
    var doc = frame.contentDocument;
    var a = doc.createElement('a');
    a.href = url;
    a.download = name;
    doc.body.appendChild(a);
    a.click();
    setTimeout(function () { frame.remove(); URL.revokeObjectURL(url); }, 60000);
    return url;
  }

  function payNote(host) {
    var amountText = host.getAttribute('data-amount-text') || '';
    var amount = host.getAttribute('data-amount');
    var currency = host.getAttribute('data-currency') || '';
    var note = document.createElement('div');
    note.className = 'fine';
    var cart = window.CoffeebreakCart;
    if (cart && amount && currency) {
      var view = cart.catalogueCheckout([{ id: 'app', name: host.getAttribute('data-app') || 'Coffeebreak', amount: amount, qty: 1 }], {
        currency: currency,
        storeId: host.getAttribute('data-store') || 'sung-song',
        fulfilmentVerified: false,
      });
      if (view.ok) {
        note.textContent = 'Existing price on this page: ' + view.totalLabel + ' ' + view.currency + '. ' + PAY + '. Reference ' + (view.reference || '') + '. This page does not mark a payment as received.';
        return note;
      }
    }
    if (amountText) note.textContent = 'Existing price on this page: ' + amountText + '. ' + PAY + '. This page does not mark a payment as received and does not add a new price.';
    else note.textContent = 'This page does not show a separate price for songs, so no new amount is requested. ' + PAY + '.';
    return note;
  }

  function mountOne(host) {
    if (host.dataset.cbSungReady) return;
    host.dataset.cbSungReady = '1';
    css();
    var app = host.getAttribute('data-app') || 'Coffeebreak';
    var store = openStore('cb-sung-songs');
    var box = document.createElement('div');
    box.className = 'cb-sung';
    box.innerHTML = '<h2>Make a sung song</h2>' +
      '<p>Type lyrics and a style, then press Create. You get a full song with a sung vocal and backing music. It plays on this page, and you can download it.</p>' +
      '<label for="cb-sung-lyrics">Lyrics</label><textarea id="cb-sung-lyrics" aria-label="Lyrics" placeholder="Paste or type the words to sing"></textarea>' +
      '<label for="cb-sung-style">Style</label><input id="cb-sung-style" type="text" aria-label="Style" placeholder="bright pop, female vocal, live drums">' +
      '<label for="cb-sung-seconds">Length in seconds, optional</label><input id="cb-sung-seconds" type="number" min="10" max="120" placeholder="30" aria-label="Length in seconds">' +
      '<div><button type="button" id="cb-sung-go">Create</button><span class="hint" id="cb-sung-status"></span></div>' +
      '<audio id="cb-sung-audio" controls></audio>' +
      '<div><button type="button" id="cb-sung-dl" hidden>Download song</button></div>' +
      '<h3>My songs</h3><ul id="cb-sung-list"></ul>' +
      '<p>' + RIGHTS + '</p>' +
      '<p class="fine" id="cb-sung-credit">Songs are generated with an open model. This page is Coffeebreak.</p>' +
      '<p class="fine">' + DISCLAIMER + '</p>' +
      '<p class="fine"><a href="https://www.tesla.com">Tesla</a> · <a href="https://www.starlink.com">Starlink</a></p>' +
      '<p><button type="button" id="cb-sung-report">Report a problem</button></p>';
    box.appendChild(payNote(host));
    host.appendChild(box);
    var status = box.querySelector('#cb-sung-status');
    var audio = box.querySelector('#cb-sung-audio');
    var dl = box.querySelector('#cb-sung-dl');
    var list = box.querySelector('#cb-sung-list');
    var current = null;
    var busy = false;

    function setStatus(text) { status.textContent = text || ''; }

    function play(row) {
      current = row;
      var blob = new Blob([row.bytes], { type: row.mime || 'audio/mpeg' });
      audio.src = URL.createObjectURL(blob);
      audio.play().catch(function () {});
      dl.hidden = false;
    }

    async function draw() {
      var lib = await store;
      var rows = await lib.list(app);
      list.innerHTML = '';
      if (!rows.length) {
        var empty = document.createElement('li');
        empty.className = 'hint';
        empty.textContent = 'No songs yet. A song you create is kept in this browser.';
        list.appendChild(empty);
        return;
      }
      rows.forEach(function (row) {
        var li = document.createElement('li');
        var name = document.createElement('div');
        name.textContent = row.title;
        var meta = document.createElement('div');
        meta.className = 'fine';
        meta.textContent = (row.credit || row.model || '') + (row.backend ? ' · ' + row.backend : '');
        var playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.textContent = 'Play';
        playBtn.onclick = function () { play(row); };
        var saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.textContent = 'Download song';
        saveBtn.onclick = function () { saveFile(row.bytes, row.mime, (row.title || 'song').replace(/[^\w]+/g, '-').slice(0, 40) + '.mp3'); };
        var del = document.createElement('button');
        del.type = 'button';
        del.textContent = 'Delete';
        del.onclick = async function () {
          var libNow = await store;
          await libNow.remove(row.id);
          draw();
        };
        li.append(name, meta, playBtn, saveBtn, del);
        list.appendChild(li);
      });
    }

    box.querySelector('#cb-sung-dl').onclick = function () {
      if (!current) return;
      saveFile(current.bytes, current.mime, (current.title || 'song').replace(/[^\w]+/g, '-').slice(0, 40) + '.mp3');
    };
    box.querySelector('#cb-sung-report').onclick = function () {
      if (window.__cbreport && window.__cbreport.open) window.__cbreport.open();
    };
    box.querySelector('#cb-sung-go').onclick = async function () {
      if (busy) return;
      var lyrics = box.querySelector('#cb-sung-lyrics').value;
      var prompt = box.querySelector('#cb-sung-style').value;
      var secondsRaw = box.querySelector('#cb-sung-seconds').value;
      busy = true;
      box.querySelector('#cb-sung-go').disabled = true;
      setStatus('Generating the full song. This can take a few minutes.');
      try {
        var sung = await G.generateSong({ lyrics: lyrics, prompt: prompt, seconds: secondsRaw ? +secondsRaw : undefined });
        var row = {
          id: 's' + Date.now().toString(36),
          app: app,
          title: titleFrom(lyrics),
          lyrics: lyrics,
          prompt: prompt,
          created: Date.now(),
          bytes: sung.bytes,
          mime: sung.mime,
          model: sung.model,
          license: sung.license,
          credit: sung.credit,
          backend: sung.backend,
        };
        var lib = await store;
        await lib.put(row);
        play(row);
        box.querySelector('#cb-sung-credit').textContent = 'This song was generated with ' + sung.credit + '. Service: ' + sung.backend + '. This page is Coffeebreak.';
        setStatus('Saved in My songs. ' + sung.info + '.');
        draw();
      } catch (err) {
        setStatus(err && err.message ? err.message : 'The song could not be generated. Nothing was saved and no stand-in audio was played.');
      } finally {
        busy = false;
        box.querySelector('#cb-sung-go').disabled = false;
      }
    };
    draw();
  }

  function boot() {
    document.querySelectorAll('[data-cb-sung]').forEach(mountOne);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.CBSungPanel = { mount: mountOne };
})();
