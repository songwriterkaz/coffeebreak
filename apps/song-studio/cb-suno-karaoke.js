/* Coffeebreak library: lyric sheets and audio files already stored in this copy. */
(function () {
  var S = window.CBSongStudio;
  var AUDIO = [];
  var WHERE = [];
  var CH = {};
  var loaded = false;
  var css = '#cbsk-btn{position:fixed;left:12px;bottom:12px;z-index:99990;font:700 17px system-ui;padding:12px 16px;border-radius:24px;border:0;background:#c2185b;color:#fff;box-shadow:0 2px 8px #0005;cursor:pointer}' +
    '#cbsk{position:fixed;inset:0;z-index:2147483000;background:#1b1020;color:#fff;font:18px/1.45 system-ui;display:none;flex-direction:column}' +
    '#cbsk.on{display:flex}#cbsk header{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px}' +
    '#cbsk input[type=search]{flex:1;min-width:160px;font-size:18px;padding:10px;border-radius:10px;border:0}' +
    '#cbsk button,#cbsk label.b{font:600 16px system-ui;padding:9px 12px;border-radius:10px;border:0;background:#f8bbd0;color:#3a0a20;cursor:pointer}' +
    '#cbsk .body{flex:1;display:flex;min-height:0}#cbsk .songs{width:38%;overflow:auto;border-right:1px solid #fff3}' +
    '#cbsk .songs div{padding:9px 12px;border-bottom:1px solid #fff1;cursor:pointer}#cbsk .songs div.cur{background:#c2185b}' +
    '#cbsk .songs small{opacity:.7;display:block;font-size:13px}#cbsk .ly{flex:1;overflow:auto;padding:16px 20px;text-align:center}' +
    '#cbsk .ly p{margin:4px 0;font-size:24px;opacity:.85}#cbsk .ly p.tag{font-size:15px;opacity:.5;font-style:italic}' +
    '#cbsk audio{width:100%}#cbsk .np{padding:6px 12px;font-weight:700}' +
    '@media(max-width:760px){#cbsk .body{flex-direction:column}#cbsk .songs{width:auto;height:34%;border-right:0;border-bottom:1px solid #fff3}#cbsk .ly p{font-size:21px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  var b = document.createElement('button');
  b.id = 'cbsk-btn';
  b.type = 'button';
  b.textContent = 'Coffeebreak library';
  var P = document.createElement('div');
  P.id = 'cbsk';
  P.setAttribute('role', 'dialog');
  P.innerHTML = '<header><input type="search" placeholder="Search lyric sheets" aria-label="Search lyric sheets">' +
    '<label class="b">Play my own song<input type="file" accept="audio/*" hidden id="cbsk-up"></label>' +
    '<button type="button" id="cbsk-use">Use these lyrics</button>' +
    '<button type="button" id="cbsk-rec">Record me</button>' +
    '<a id="cbsk-dl" class="b" hidden download="my-coffeebreak-recording.webm">Save my recording</a>' +
    '<button type="button" id="cbsk-x">Close</button></header>' +
    '<div class="np" id="cbsk-np">Open the library to load lyric sheets and audio files stored in this copy.</div>' +
    '<audio controls preload="none"></audio><div class="body"><div class="songs"></div><div class="ly"><p>Pick a lyric sheet or an audio file.</p></div></div>';
  function add() { document.body.appendChild(b); document.body.appendChild(P); }
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  var q = P.querySelector('input[type=search]');
  var songs = P.querySelector('.songs');
  var lyrics = P.querySelector('.ly');
  var audio = P.querySelector('audio');
  var note = P.querySelector('#cbsk-np');
  var currentLyrics = '';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function load() {
    if (loaded) return Promise.resolve();
    return Promise.all([
      fetch('local-tracks.json').then(function (r) { return r.json(); }),
      fetch('suno/where.json').then(function (r) { return r.json(); })
    ]).then(function (pair) {
      AUDIO = pair[0] || [];
      WHERE = (pair[1] || []).map(function (row) { return { id: row[0], chunk: row[1], title: row[2] }; });
      loaded = true;
      render();
    }).catch(function () {
      note.textContent = 'The library files in this copy could not be read. You can still play your own song.';
    });
  }

  function render() {
    if (!S) return;
    var view = S.listLibrary(AUDIO, WHERE, q.value);
    note.textContent = view.note
      ? view.note + ' ' + view.lyricCount + ' lyric sheets are stored in this copy, and ' + AUDIO.length + ' audio files.'
      : view.lyrics.length + ' lyric sheets shown. Audio files in this copy stay listed below the search.';
    var html = '';
    view.audio.forEach(function (track, i) {
      html += '<div data-a="' + i + '">' + esc(track.title) + '<small>Audio file in this copy</small></div>';
    });
    view.lyrics.forEach(function (entry) {
      html += '<div data-l="' + esc(entry.id) + '" data-c="' + entry.chunk + '">' + esc(entry.title) + '<small>Lyric sheet. No matching audio file in this copy.</small></div>';
    });
    songs.innerHTML = html || '<div>Nothing matched.</div>';
  }

  function showText(text) {
    currentLyrics = text || '';
    if (!currentLyrics) {
      lyrics.innerHTML = '<p>No lyric sheet is stored for this item.</p>';
      return;
    }
    lyrics.innerHTML = currentLyrics.split('\n').map(function (line) {
      line = line.trim();
      if (!line) return '<p>&nbsp;</p>';
      return '<p' + (/^\[.*\]$/.test(line) ? ' class="tag"' : '') + '>' + esc(line) + '</p>';
    }).join('');
  }

  function sheet(id, chunk) {
    var key = String(chunk);
    if (CH[key]) return Promise.resolve(CH[key][id] || '');
    var name = ('00' + key).slice(-3);
    return fetch('suno/l/' + name + '.json').then(function (r) { return r.json(); }).then(function (data) {
      CH[key] = data;
      return data[id] || '';
    }).catch(function () { return ''; });
  }

  function playAudio(track) {
    var resolved = S.resolveAudio(track.audio);
    if (!resolved.playable) {
      note.textContent = resolved.reason;
      audio.removeAttribute('src');
      return;
    }
    audio.src = resolved.src;
    audio.play().catch(function () {});
    note.textContent = 'Now playing: ' + track.title;
    showText('');
  }

  function playLyric(id, chunk, title) {
    audio.pause();
    audio.removeAttribute('src');
    note.textContent = title + '. No audio file is stored with this lyric sheet in this copy.';
    sheet(id, chunk).then(function (text) { showText(text); });
  }

  songs.addEventListener('click', function (e) {
    var row = e.target.closest('[data-a],[data-l]');
    if (!row) return;
    if (row.hasAttribute('data-a')) {
      var view = S.listLibrary(AUDIO, WHERE, q.value);
      playAudio(view.audio[+row.getAttribute('data-a')]);
      return;
    }
    playLyric(row.getAttribute('data-l'), row.getAttribute('data-c'), row.childNodes[0].textContent);
  });
  q.addEventListener('input', function () { if (loaded) render(); });
  P.querySelector('#cbsk-x').onclick = function () { P.classList.remove('on'); };
  P.querySelector('#cbsk-use').onclick = function () {
    var box = document.getElementById('lyr');
    if (!box) return;
    if (currentLyrics) {
      box.value = currentLyrics;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    }
    P.classList.remove('on');
    if (window.tab) window.tab(0);
  };
  P.querySelector('#cbsk-up').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    var url = URL.createObjectURL(file);
    audio.src = url;
    audio.play().catch(function () {});
    note.textContent = 'Playing a file from your device: ' + file.name;
  });
  (function () {
    var recorder = null;
    var chunks = [];
    var rec = P.querySelector('#cbsk-rec');
    var dl = P.querySelector('#cbsk-dl');
    rec.onclick = function () {
      if (recorder && recorder.state === 'recording') { recorder.stop(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        note.textContent = 'Recording is not available in this browser.';
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        chunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          dl.href = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
          dl.hidden = false;
          rec.textContent = 'Record me';
          note.textContent = 'Recording ready. Press Save my recording to keep it.';
        };
        recorder.start();
        rec.textContent = 'Stop recording';
        note.textContent = 'Recording. Sing along, then press Stop recording.';
      }).catch(function () { note.textContent = 'Allow the microphone to record.'; });
    };
  })();
  b.onclick = function () { P.classList.add('on'); load(); };
  window.cbSunoKaraoke = { open: function () { b.onclick(); } };
})();
