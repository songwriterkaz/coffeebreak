/* Vocal Social Stream. Songs come from the existing Vocal Social API. Walls use the shared walls client. */
(function () {
  'use strict';
  var API = 'https://cb-vocal-social.coffeebreaks.workers.dev';
  var APP = 'https://songwriterkaz.github.io/coffeebreak/apps/vocal-social-stream/';
  var walls = window.CBWalls.create({ api: API, channel: 'vocal', storageKey: 'cb-walls-vocal-v1' });
  var audio = new Audio();

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function view() { var h = (location.hash || '#stream').slice(1); return h === 'walls' || h === 'vocals' ? h : 'stream'; }
  function app() { return document.getElementById('app'); }

  function paintNav() {
    document.querySelectorAll('nav a[data-v]').forEach(function (a) { a.style.outline = a.getAttribute('data-v') === view() ? '2px solid #fff' : ''; });
  }

  function render() {
    paintNav();
    if (view() === 'walls') return renderWalls();
    if (view() === 'vocals') return renderVocals();
    return renderStream();
  }

  function renderStream() {
    app().innerHTML = '<section class="card"><h2>Newsfeed</h2><p id="news-note"></p><textarea id="wall-text" maxlength="500" placeholder="Write on your wall. It also shows in this newsfeed."></textarea><p><button class="btn" id="post" type="button">Post</button></p><div id="news"></div></section><section id="songs"><h2 style="color:#e8c872">Songs</h2><p>The same Vocal Social songs, in stream cards.</p></section>';
    document.getElementById('post').onclick = function () {
      var text = document.getElementById('wall-text').value.trim();
      if (!text) return;
      walls.publish(text, 'You').then(function (p) {
        document.getElementById('wall-text').value = '';
        document.getElementById('news-note').textContent = p && p.device ? 'On this device for now.' : 'Posted to the shared feed.';
        loadNews();
      }, function (err) { document.getElementById('news-note').textContent = err.message; });
    };
    loadNews();
    fetch(API + '/api/feed?mode=latest').then(function (r) { return r.json(); }).then(function (j) {
      var host = document.getElementById('songs');
      (j.posts || []).forEach(function (p) { host.appendChild(songCard(p)); });
      if (!(j.posts || []).length) host.appendChild(Object.assign(document.createElement('p'), { textContent: 'No songs in the shared feed yet.' }));
    }, function () {
      document.getElementById('songs').appendChild(Object.assign(document.createElement('p'), { textContent: 'The song feed could not be loaded.' }));
    });
  }

  function songCard(p) {
    var card = document.createElement('article');
    card.className = 'card';
    var who = p.author ? (p.author.name + ' @' + p.author.handle) : 'Coffeebreak';
    card.innerHTML = '<div class="row"><button class="play" type="button" aria-label="Play">▶</button><div><h3></h3><p></p></div></div><audio controls preload="none"></audio>';
    card.querySelector('h3').textContent = p.title || 'Song';
    card.querySelector('p').textContent = who + (p.genre ? ' · ' + p.genre : '');
    var player = card.querySelector('audio');
    player.src = p.audio || (API + '/api/audio/' + p.id);
    card.querySelector('.play').onclick = function () {
      if (audio.src !== player.src) audio.src = player.src;
      if (audio.paused) audio.play(); else audio.pause();
    };
    return card;
  }

  function drawPosts(host, posts, shared) {
    host.innerHTML = '';
    var note = document.getElementById('news-note');
    if (note) note.textContent = shared ? 'Shared newsfeed for Vocal Social walls.' : 'On this device for now. The wall Worker is not deployed, so new text stays in this browser.';
    if (!posts.length) { var empty = document.createElement('p'); empty.textContent = 'No wall posts yet.'; host.appendChild(empty); }
    posts.forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'card';
      var who = (p.author && (p.author.name || p.author.handle)) || 'Someone';
      var wall = p.wall && p.wall.handle ? ' · @' + p.wall.handle : '';
      card.innerHTML = '<h3></h3><p class="body"></p><p class="row"></p><div class="comments"></div><form class="row"><input maxlength="280" placeholder="Comment"><button class="btn quiet" type="submit">Comment</button></form>';
      card.querySelector('h3').textContent = who + wall;
      card.querySelector('.body').textContent = p.text || '';
      if (p.device) { var tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = 'On this device for now'; card.querySelector('.row').appendChild(tag); }
      var list = card.querySelector('.comments');
      walls.commentsFor(p.id).then(function (cs) {
        (cs || []).forEach(function (c) {
          var line = document.createElement('p');
          line.textContent = ((c.author && (c.author.name || c.author.handle)) || 'Someone') + ': ' + (c.text || '');
          list.appendChild(line);
        });
      });
      card.querySelector('form').onsubmit = function (ev) {
        ev.preventDefault();
        var input = card.querySelector('input');
        walls.comment(p.id, input.value, 'You').then(function () {
          input.value = '';
          if (document.getElementById('news')) loadNews();
          else if (document.getElementById('open')) document.getElementById('open').click();
        });
      };
      host.appendChild(card);
    });
  }

  function loadNews() {
    walls.feed().then(function (j) { drawPosts(document.getElementById('news'), j.posts || [], j.shared); });
  }

  function renderWalls() {
    app().innerHTML = '<section class="card"><h2>Walls</h2><p>Open a handle to see that person\'s wall. Posts here are the same notes as the stream newsfeed.</p><input id="who" placeholder="handle"><p><button class="btn" id="open" type="button">Open wall</button></p><div id="wall"></div></section>';
    document.getElementById('open').onclick = function () {
      var handle = document.getElementById('who').value.trim() || 'you';
      walls.wall(handle).then(function (j) { drawPosts(document.getElementById('wall'), j.posts || [], j.shared); });
    };
  }

  var page = 0;
  function renderVocals() {
    var lib = window.CBVocals;
    app().innerHTML = '<section class="card"><h2>12,000 vocals</h2><p>The same preset library as Vocal Social. Preview sings in this browser.</p><input id="q" type="search" placeholder="Search"><div id="list"></div><p class="row"><button class="btn quiet" id="prev" type="button">Previous</button><button class="btn quiet" id="next" type="button">Next</button></p><p id="vmsg"></p><div class="row"><button class="btn" id="dl" type="button">Download preview WAV</button><div id="qr" class="qr"></div></div><audio id="prev-audio" controls></audio></section>';
    if (window.QRCode) { try { new QRCode(document.getElementById('qr'), { text: APP, width: 96, height: 96 }); } catch (e) {} }
    function draw() {
      var result = lib.search(document.getElementById('q').value, {}, page);
      var list = document.getElementById('list');
      list.innerHTML = '';
      result.items.forEach(function (p) {
        var row = document.createElement('p');
        row.className = 'row';
        var b = document.createElement('button');
        b.className = 'btn quiet'; b.type = 'button'; b.textContent = 'Preview';
        b.onclick = function () { preview(p.id); };
        var name = document.createElement('span');
        name.textContent = p.name;
        row.appendChild(b); row.appendChild(name); list.appendChild(row);
      });
    }
    document.getElementById('q').oninput = function () { page = 0; draw(); };
    document.getElementById('prev').onclick = function () { page = Math.max(0, page - 1); draw(); };
    document.getElementById('next').onclick = function () { page += 1; draw(); };
    document.getElementById('dl').onclick = function () {
      var picked = lib.getSelected() || lib.presetAt(0);
      try {
        var bytes = lib.previewWav(picked);
        var a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
        a.download = 'vocal-preview.wav';
        a.click();
      } catch (err) { document.getElementById('vmsg').textContent = err.message; }
    };
    draw();
  }
  function preview(id) {
    var lib = window.CBVocals;
    try {
      lib.setSelected(id);
      var bytes = lib.previewWav(lib.presetAt(id));
      var url = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
      var player = document.getElementById('prev-audio');
      player.src = url; player.play();
      document.getElementById('vmsg').textContent = lib.presetAt(id).name;
    } catch (err) { document.getElementById('vmsg').textContent = err.message || 'Preview failed.'; }
  }

  window.addEventListener('hashchange', render);
  render();
})();
