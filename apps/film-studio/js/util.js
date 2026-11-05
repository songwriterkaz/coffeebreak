'use strict';
window.CB = window.CB || {};
(function(CB){
  CB.$ = (s, r) => (r || document).querySelector(s);
  CB.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  CB.uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  CB.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  CB.fmt = function (t, dec) {
    dec = dec == null ? 2 : dec; const k = Math.pow(10, dec);
    t = Math.round(Math.max(0, t || 0) * k) / k;
    const m = Math.floor(t / 60), sec = t - m * 60;
    return String(m).padStart(2, '0') + ':' + (sec < 10 ? '0' : '') + sec.toFixed(dec);
  };
  CB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  CB.toast = function (msg, ms) {
    const el = CB.$('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(CB._tt); CB._tt = setTimeout(() => el.classList.remove('show'), ms || 3200);
  };
  CB.download = function (blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  };
  CB.safeName = (s) => String(s || 'film').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'film';

  // ---- IndexedDB (media, characters, backups) ----
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      try {
        const rq = indexedDB.open('coffeebreak-film-studio', 1);
        rq.onupgradeneeded = () => { const d = rq.result; ['assets', 'chars', 'kv'].forEach(n => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n); }); };
        rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  CB.idb = {
    async get(store, key) { try { const d = await db(); return await new Promise((r, j) => { const q = d.transaction(store).objectStore(store).get(key); q.onsuccess = () => r(q.result); q.onerror = () => j(q.error); }); } catch (e) { return undefined; } },
    async put(store, key, val) { try { const d = await db(); return await new Promise((r, j) => { const t = d.transaction(store, 'readwrite'); t.objectStore(store).put(val, key); t.oncomplete = () => r(true); t.onerror = () => j(t.error); }); } catch (e) { return false; } },
    async del(store, key) { try { const d = await db(); return await new Promise((r) => { const t = d.transaction(store, 'readwrite'); t.objectStore(store).delete(key); t.oncomplete = () => r(true); t.onerror = () => r(false); }); } catch (e) { return false; } },
    async all(store) { try { const d = await db(); return await new Promise((r, j) => { const q = d.transaction(store).objectStore(store).getAll(); q.onsuccess = () => r(q.result); q.onerror = () => j(q.error); }); } catch (e) { return []; } }
  };

  // ---- modal helper ----
  CB.modal = function (html, opts) {
    const m = CB.$('#modal'); opts = opts || {};
    m.innerHTML = '<div class="mback"></div><div class="mbox ' + (opts.cls || '') + '" role="dialog" aria-modal="true"><button class="mclose" aria-label="Close">&times;</button>' + html + '</div>';
    m.hidden = false;
    const close = () => { m.hidden = true; m.innerHTML = ''; if (opts.onclose) opts.onclose(); };
    CB.$('.mback', m).onclick = close; CB.$('.mclose', m).onclick = close;
    CB.closeModal = close;
    return CB.$('.mbox', m);
  };
  CB.confirm = function (title, text, okLabel) {
    return new Promise(res => {
      const b = CB.modal('<h3>' + CB.esc(title) + '</h3><p>' + CB.esc(text) + '</p><div class="mrow"><button id="cNo">Cancel</button><button id="cYes" class="primary">' + CB.esc(okLabel || 'Continue') + '</button></div>', { cls: 'small', onclose: () => res(false) });
      CB.$('#cNo', b).onclick = () => { CB.closeModal(); };
      CB.$('#cYes', b).onclick = () => { const m = CB.$('#modal'); m.hidden = true; m.innerHTML = ''; res(true); };
    });
  };
})(window.CB);
