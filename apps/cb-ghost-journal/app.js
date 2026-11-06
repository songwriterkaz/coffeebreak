(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var J = window.CBGhostJournal;
  if (!J) {
    document.body.insertAdjacentHTML('afterbegin', '<p style="color:#f66;padding:12px">ghost-journal.js failed to load.</p>');
    return;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toLocalInputValue(d) {
    var x = d instanceof Date ? d : new Date(d || Date.now());
    if (isNaN(x.getTime())) x = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate()) + 'T' + pad(x.getHours()) + ':' + pad(x.getMinutes());
  }

  function readFilesAsDataURLs(input, maxEach) {
    maxEach = maxEach || 700000;
    var files = input && input.files ? Array.prototype.slice.call(input.files, 0) : [];
    return Promise.all(files.map(function (f) {
      return new Promise(function (resolve) {
        if (f.size > maxEach) {
          resolve('[omitted: ' + f.name + ' too large for browser storage]');
          return;
        }
        var r = new FileReader();
        r.onload = function () { resolve(r.result); };
        r.onerror = function () { resolve('[failed to read ' + f.name + ']'); };
        r.readAsDataURL(f);
      });
    }));
  }

  function fillAppFilter() {
    var sel = $('filterApp');
    var cur = sel.value;
    var opts = ['<option value="">All apps</option>'];
    J.apps().forEach(function (a) {
      opts.push('<option value="' + esc(a.app) + '"' + (a.app === cur ? ' selected' : '') + '>' + esc(a.app) + ' (' + a.count + ')</option>');
    });
    sel.innerHTML = opts.join('');
  }

  function render() {
    var items = J.search({ q: $('q').value, app: $('filterApp').value });
    $('listMeta').textContent = items.length + ' entr' + (items.length === 1 ? 'y' : 'ies') + ' (only what you saved)';
    fillAppFilter();
    if (!items.length) {
      $('list').innerHTML = '<div class="empty">No investigations yet. Save an entry above, or use Save in Ghost Hunter / CB Ghost Scanner.</div>';
      return;
    }
    $('list').innerHTML = items.map(function (e) {
      var when = e.date || new Date(e.ts).toLocaleString();
      try { when = new Date(e.ts || e.date).toLocaleString(); } catch (err) {}
      var photos = (e.photos || []).map(function (p) {
        if (typeof p === 'string' && p.indexOf('data:image') === 0) return '<img class="thumb" src="' + p + '" alt="Investigation photo">';
        return '<span class="muted">' + esc(String(p).slice(0, 80)) + '</span>';
      }).join('');
      var audios = (e.audio || []).map(function (a) {
        if (typeof a === 'string' && a.indexOf('data:audio') === 0) return '<audio controls src="' + a + '"></audio>';
        return '<span class="muted">' + esc(String(a).slice(0, 80)) + '</span>';
      }).join('');
      return '<article class="card entry" data-id="' + esc(e.id) + '">' +
        '<h3>' + esc(e.app || 'App') + '</h3>' +
        '<div class="meta">' + esc(when) + (e.location ? ' · 📍 ' + esc(e.location) : '') + '</div>' +
        (e.readings ? '<p><b>Readings:</b> ' + esc(e.readings) + '</p>' : '') +
        (e.notes ? '<p>' + esc(e.notes) + '</p>' : '') +
        photos + audios +
        '<div class="row noprint"><button type="button" class="danger del" data-id="' + esc(e.id) + '">Delete</button></div>' +
        '</article>';
    }).join('');
  }

  $('btnSave').onclick = function () {
    var custom = ($('fAppCustom').value || '').trim();
    var app = custom || $('fApp').value;
    var dt = $('fDate').value;
    var ts = dt ? Date.parse(dt) : Date.now();
    if (isNaN(ts)) ts = Date.now();
    $('formStatus').textContent = 'Saving…';
    Promise.all([readFilesAsDataURLs($('fPhoto')), readFilesAsDataURLs($('fAudio'))]).then(function (pair) {
      var entry = J.add({
        ts: ts,
        date: new Date(ts).toISOString(),
        location: $('fLoc').value,
        app: app,
        readings: $('fRead').value,
        notes: $('fNotes').value,
        photos: pair[0],
        audio: pair[1]
      });
      if (!entry) {
        $('formStatus').textContent = 'Could not save — browser storage may be full. Try fewer/smaller photos.';
        return;
      }
      $('formStatus').textContent = 'Saved.';
      $('fNotes').value = '';
      $('fRead').value = '';
      $('fPhoto').value = '';
      $('fAudio').value = '';
      render();
    });
  };

  $('btnClearForm').onclick = function () {
    $('fLoc').value = '';
    $('fAppCustom').value = '';
    $('fRead').value = '';
    $('fNotes').value = '';
    $('fPhoto').value = '';
    $('fAudio').value = '';
    $('fDate').value = toLocalInputValue(new Date());
    $('formStatus').textContent = '';
  };

  $('btnSearch').onclick = render;
  $('q').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); render(); } });
  $('filterApp').onchange = render;

  $('list').onclick = function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains('del')) {
      if (confirm('Delete this investigation entry?')) {
        J.remove(t.getAttribute('data-id'));
        render();
      }
    }
  };

  $('btnExportJson').onclick = function () {
    var blob = new Blob([J.exportJSON()], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cb-ghost-journal-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  $('btnExportPdf').onclick = function () {
    var items = J.search({ q: $('q').value, app: $('filterApp').value });
    var html = '<h1>Coffeebreak Ghost Investigation Journal</h1>' +
      '<p>For entertainment only. Exported ' + new Date().toLocaleString() + '. ' + items.length + ' entries.</p>';
    items.forEach(function (e) {
      var when;
      try { when = new Date(e.ts || e.date).toLocaleString(); } catch (err) { when = e.date; }
      html += '<hr><h3>' + esc(e.app) + '</h3><p><b>' + esc(when) + '</b>' +
        (e.location ? ' · ' + esc(e.location) : '') + '</p>' +
        (e.readings ? '<p><b>Readings:</b> ' + esc(e.readings) + '</p>' : '') +
        (e.notes ? '<p>' + esc(e.notes) + '</p>' : '') +
        '<p class="muted">' + ((e.photos && e.photos.length) ? e.photos.length + ' photo(s). ' : '') +
        ((e.audio && e.audio.length) ? e.audio.length + ' audio clip(s).' : '') + '</p>';
    });
    $('printArea').innerHTML = html;
    window.print();
  };

  $('importFile').onchange = function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var n = J.importJSON(r.result, 'merge');
        alert('Imported. Journal now has ' + n + ' entries.');
        render();
      } catch (err) {
        alert('Import failed: ' + (err && err.message ? err.message : err));
      }
      $('importFile').value = '';
    };
    r.readAsText(f);
  };

  $('btnClearAll').onclick = function () {
    if (confirm('Clear the whole ghost investigation journal on this device?')) {
      J.clear();
      render();
    }
  };

  window.addEventListener('cb-ghost-journal-changed', render);
  $('fDate').value = toLocalInputValue(new Date());
  render();
})();
