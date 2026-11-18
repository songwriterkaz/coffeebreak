/* Coffeebreak Vocal Social: local feed around the Studio Espresso vocal engine. */
(function () {
  var STORE = 'cb-vocal-social-v1';
  var AUDIO_DB = 'cb-vocal-social-audio';
  var UNLOCK_KEY = 'cb-payid-unlock:apps/vocal-social';
  var FREE_GENS = 1;

  var state = {
    profile: null,
    posts: [],
    following: [],
    draft: null,
    feedMode: 'all',
    audioUrls: {}
  };

  function $(id) { return document.getElementById(id); }

  function status(text) {
    var el = $('vs-status');
    if (el) el.textContent = text || '';
  }

  function loadState() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (raw && typeof raw === 'object') {
        state.profile = raw.profile || null;
        state.posts = Array.isArray(raw.posts) ? raw.posts : [];
        state.following = Array.isArray(raw.following) ? raw.following : [];
        state.usedGens = raw.usedGens || 0;
      }
    } catch (err) {
      state.profile = null;
      state.posts = [];
      state.following = [];
      state.usedGens = 0;
    }
    if (!state.profile) {
      state.profile = defaultProfile();
      saveState();
    }
  }

  function defaultProfile() {
    return {
      id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name: 'Guest',
      handle: 'guest',
      email: '',
      bio: '',
      created: Date.now()
    };
  }

  function saveState() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        profile: state.profile,
        posts: state.posts,
        following: state.following,
        usedGens: state.usedGens || 0
      }));
    } catch (err) {
      status('This browser would not save the feed. Posts and profile may be lost when you leave.');
    }
  }

  function isOwner(profile) {
    profile = profile || state.profile || {};
    var name = String(profile.name || '').trim().toLowerCase().replace(/[’']/g, "'");
    var email = String(profile.email || '').trim().toLowerCase();
    return name === "karen o'brien" || name === 'karen obrien' || email === 'darkokaz@gmx.com';
  }

  function isUnlocked() {
    if (isOwner()) return true;
    try { return !!localStorage.getItem(UNLOCK_KEY); } catch (err) { return false; }
  }

  function canGenerate() {
    if (isUnlocked()) return true;
    return (state.usedGens || 0) < FREE_GENS;
  }

  function accessNote() {
    if (isOwner()) return 'Owner copy is on for Karen on this device. The full app is free for you here.';
    if (isUnlocked()) return 'This device is unlocked for the full app. Payment was not verified by this page.';
    var left = Math.max(0, FREE_GENS - (state.usedGens || 0));
    if (left) return 'You can create ' + left + ' song as a preview. The full app is US$10 via the PayID cart, or free for Karen as owner.';
    return 'The preview song has been used. Unlock the full app for US$10 via the PayID cart, or use the owner copy if you are Karen O\'Brien.';
  }

  function initials(name) {
    var parts = String(name || 'G').trim().split(/\s+/).filter(Boolean);
    var text = ((parts[0] || 'G').charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
    return text.slice(0, 2);
  }

  function hueFor(id) {
    var n = 0;
    String(id || '').split('').forEach(function (ch) { n = (n * 31 + ch.charCodeAt(0)) >>> 0; });
    return 330 + (n % 40);
  }

  function avatarNode(profile) {
    var el = document.createElement('span');
    el.className = 'avatar';
    el.textContent = initials(profile && profile.name);
    el.style.background = 'hsl(' + hueFor(profile && profile.id) + ' 55% 42%)';
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function openAudioDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(AUDIO_DB, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains('songs')) req.result.createObjectStore('songs', { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function saveAudio(id, bytes, mime) {
    return openAudioDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('songs', 'readwrite');
        tx.objectStore('songs').put({ id: id, bytes: bytes, mime: mime || 'audio/wav' });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function loadAudio(id) {
    return openAudioDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('songs', 'readonly');
        var req = tx.objectStore('songs').get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function audioUrl(id) {
    if (state.audioUrls[id]) return Promise.resolve(state.audioUrls[id]);
    return loadAudio(id).then(function (row) {
      if (!row || !row.bytes) return '';
      var blob = new Blob([row.bytes], { type: row.mime || 'audio/wav' });
      var url = URL.createObjectURL(blob);
      state.audioUrls[id] = url;
      return url;
    });
  }

  function waitForEngine() {
    if (window.CBSongs && window.CBCore) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var n = 0;
      var t = setInterval(function () {
        n += 1;
        if (window.CBSongs && window.CBCore) { clearInterval(t); resolve(); }
        else if (n > 80) { clearInterval(t); reject(new Error('The Studio Espresso song engine did not load.')); }
      }, 100);
    });
  }

  function fillStyleSelects() {
    var C = window.CBCore;
    if (!C) return;
    var genre = $('genre');
    var mood = $('mood');
    genre.innerHTML = C.GENRES.map(function (g) {
      return '<option' + (g === 'Pop' ? ' selected' : '') + '>' + g + '</option>';
    }).join('');
    mood.innerHTML = C.MOODS.map(function (m) {
      return '<option' + (m === 'Happy' ? ' selected' : '') + '>' + m + '</option>';
    }).join('');
  }

  function route() {
    var hash = (location.hash || '#make').replace(/^#/, '');
    var parts = hash.split('=');
    var name = parts[0] || 'make';
    if (name === 'post') {
      showView('feed');
      highlightPost(decodeURIComponent(parts.slice(1).join('=')));
      return;
    }
    if (name === 'make' && parts[1]) {
      applyShareMake(parts.slice(1).join('='));
      showView('make');
      return;
    }
    if (name === 'profile' && parts[1]) {
      showView('people');
      return;
    }
    if (['make', 'feed', 'people', 'me'].indexOf(name) < 0) name = 'make';
    showView(name);
  }

  function showView(name) {
    ['make', 'feed', 'people', 'me'].forEach(function (id) {
      var view = $('view-' + id);
      if (view) view.hidden = id !== name;
    });
    document.querySelectorAll('nav.tabs a').forEach(function (a) {
      a.classList.toggle('on', a.getAttribute('data-r') === name);
    });
    if (name === 'feed') renderFeed();
    if (name === 'people') renderPeople();
    if (name === 'me') renderMe();
  }

  function applyShareMake(payload) {
    try {
      var json = JSON.parse(decodeURIComponent(escape(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))));
      if (json.lyrics) $('lyrics').value = json.lyrics;
      if (json.genre) $('genre').value = json.genre;
      if (json.mood) $('mood').value = json.mood;
      if (json.title) $('title').value = json.title;
      if (json.bpm) $('bpm').value = json.bpm;
      if (json.desc) $('desc').value = json.desc;
      status('Lyrics and style were loaded from a share link. Press Create song to sing them in this browser.');
    } catch (err) {
      status('That share link could not be read.');
    }
  }

  function encodeShareMake(data) {
    var raw = btoa(unescape(encodeURIComponent(JSON.stringify(data)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return location.origin + location.pathname + '#make=' + raw;
  }

  function postShareUrl(id) {
    return location.origin + location.pathname + '#post=' + encodeURIComponent(id);
  }

  async function onGenerate() {
    if (!canGenerate()) {
      status(accessNote());
      location.hash = '#me';
      return;
    }
    var lyrics = ($('lyrics').value || '').trim();
    try {
      await waitForEngine();
    } catch (err) {
      status(err.message || 'The song engine did not load.');
      return;
    }
    if (window.CBCore.wordsOf(lyrics).length < 2) {
      status('Write at least two words to sing.');
      return;
    }
    var btn = $('btn-generate');
    btn.disabled = true;
    status('Singing with the Coffeebreak voice. This can take a little while.');
    try {
      if (window.AC) try { window.AC(); } catch (e) {}
      var meta = await window.CBSongs.create({
        lyrics: lyrics,
        genre: $('genre').value,
        mood: $('mood').value,
        bpm: $('bpm').value ? Number($('bpm').value) : undefined,
        title: ($('title').value || '').trim(),
        description: ($('desc').value || '').trim(),
        autoplay: false,
        onStatus: status
      });
      var mix = await window.CBSongs.mixWav(meta.id);
      await saveAudio(meta.id, mix.bytes, mix.mime);
      if (!isUnlocked()) state.usedGens = (state.usedGens || 0) + 1;
      saveState();
      state.draft = {
        songId: meta.id,
        title: mix.title || meta.title,
        lyrics: lyrics,
        summary: mix.summary || meta.summary || '',
        genre: $('genre').value,
        mood: $('mood').value,
        bpm: $('bpm').value || '',
        desc: $('desc').value || '',
        duration: mix.duration,
        mime: mix.mime
      };
      var url = await audioUrl(meta.id);
      var audio = $('draft-audio');
      audio.src = url;
      $('draft-meta').textContent = (state.draft.title || 'Song') + ' · ' + (state.draft.summary || 'Sung with the Coffeebreak voice.');
      $('draft').hidden = false;
      status('The song is ready on this device. You can play it, download the WAV, or post it to your feed.');
    } catch (err) {
      status(err.message || 'The vocal could not be generated.');
    } finally {
      btn.disabled = false;
    }
  }

  function downloadDraft() {
    if (!state.draft) return;
    audioUrl(state.draft.songId).then(function (url) {
      if (!url) { status('The song file is not in this browser.'); return; }
      var a = document.createElement('a');
      a.href = url;
      a.download = String(state.draft.title || 'song').replace(/[^\w]+/g, '-').slice(0, 40) + '.wav';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  function onPost() {
    if (!state.draft) return;
    var post = {
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      songId: state.draft.songId,
      title: state.draft.title,
      lyrics: state.draft.lyrics,
      summary: state.draft.summary,
      genre: state.draft.genre,
      mood: state.draft.mood,
      bpm: state.draft.bpm,
      desc: state.draft.desc,
      duration: state.draft.duration,
      created: Date.now(),
      author: {
        id: state.profile.id,
        name: state.profile.name,
        handle: state.profile.handle
      },
      likes: [],
      comments: []
    };
    state.posts.unshift(post);
    saveState();
    status('Posted to the feed on this device.');
    location.hash = '#post=' + encodeURIComponent(post.id);
  }

  function visiblePosts() {
    if (state.feedMode === 'following') {
      var ids = {};
      state.following.forEach(function (id) { ids[id] = true; });
      return state.posts.filter(function (p) { return ids[p.author && p.author.id]; });
    }
    return state.posts.slice();
  }

  function renderFeed() {
    var box = $('feed-list');
    box.replaceChildren();
    var posts = visiblePosts();
    if (!posts.length) {
      var empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = state.feedMode === 'following'
        ? 'You are not following anyone with a post on this device yet.'
        : 'No posts on this device yet. Create a song and post it from the Make tab.';
      box.appendChild(empty);
      return;
    }
    posts.forEach(function (post) { box.appendChild(postCard(post)); });
  }

  function postCard(post) {
    var card = document.createElement('article');
    card.className = 'card';
    card.id = 'post-' + post.id;
    var head = document.createElement('div');
    head.className = 'post-head';
    head.appendChild(avatarNode(post.author));
    var who = document.createElement('div');
    var name = document.createElement('p');
    name.className = 'who';
    name.textContent = (post.author && post.author.name) || 'Guest';
    var meta = document.createElement('p');
    meta.className = 'meta';
    var when = new Date(post.created).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' });
    meta.textContent = '@' + ((post.author && post.author.handle) || 'guest') + ' · ' + when;
    who.append(name, meta);
    head.appendChild(who);
    card.appendChild(head);

    var title = document.createElement('h3');
    title.textContent = post.title || 'Song';
    card.appendChild(title);
    if (post.summary) {
      var sum = document.createElement('p');
      sum.className = 'meta';
      sum.textContent = post.summary;
      card.appendChild(sum);
    }
    var lyrics = document.createElement('pre');
    lyrics.className = 'lyrics';
    lyrics.textContent = post.lyrics || '';
    card.appendChild(lyrics);

    var audio = document.createElement('audio');
    audio.controls = true;
    audio.setAttribute('preload', 'none');
    card.appendChild(audio);
    audioUrl(post.songId).then(function (url) {
      if (url) audio.src = url;
      else {
        var missing = document.createElement('p');
        missing.className = 'hint';
        missing.textContent = 'The audio for this post is not stored in this browser. You can still share the lyrics and style.';
        card.insertBefore(missing, audio);
      }
    }).catch(function () {});

    var actions = document.createElement('div');
    actions.className = 'row actions';
    var liked = (post.likes || []).indexOf(state.profile.id) >= 0;
    var likeBtn = document.createElement('button');
    likeBtn.type = 'button';
    likeBtn.className = 'btn quiet';
    likeBtn.textContent = (liked ? 'Unlike' : 'Like') + ' · ' + (post.likes || []).length;
    likeBtn.addEventListener('click', function () { toggleLike(post.id); });
    var followBtn = document.createElement('button');
    followBtn.type = 'button';
    followBtn.className = 'btn quiet';
    var isSelf = post.author && post.author.id === state.profile.id;
    var following = state.following.indexOf(post.author && post.author.id) >= 0;
    followBtn.textContent = isSelf ? 'Your post' : (following ? 'Unfollow' : 'Follow');
    followBtn.disabled = !!isSelf;
    followBtn.addEventListener('click', function () { toggleFollow(post.author && post.author.id); });
    var shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'btn quiet';
    shareBtn.textContent = 'Copy share link';
    shareBtn.addEventListener('click', function () { copyShare(post); });
    var dlBtn = document.createElement('button');
    dlBtn.type = 'button';
    dlBtn.className = 'btn quiet';
    dlBtn.textContent = 'Download WAV';
    dlBtn.addEventListener('click', function () { downloadPost(post); });
    actions.append(likeBtn, followBtn, shareBtn, dlBtn);
    card.appendChild(actions);

    var comments = document.createElement('ul');
    comments.className = 'comments';
    (post.comments || []).forEach(function (c) {
      var li = document.createElement('li');
      li.textContent = (c.name || 'Guest') + ': ' + c.text;
      comments.appendChild(li);
    });
    card.appendChild(comments);

    var form = document.createElement('div');
    form.className = 'comment-form';
    var input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 200;
    input.setAttribute('aria-label', 'Write a comment');
    input.placeholder = 'Write a comment';
    var send = document.createElement('button');
    send.type = 'button';
    send.className = 'btn';
    send.textContent = 'Comment';
    send.addEventListener('click', function () {
      addComment(post.id, input.value);
      input.value = '';
    });
    form.append(input, send);
    card.appendChild(form);
    return card;
  }

  function toggleLike(id) {
    var post = state.posts.find(function (p) { return p.id === id; });
    if (!post) return;
    post.likes = post.likes || [];
    var i = post.likes.indexOf(state.profile.id);
    if (i >= 0) post.likes.splice(i, 1);
    else post.likes.push(state.profile.id);
    saveState();
    renderFeed();
  }

  function toggleFollow(authorId) {
    if (!authorId || authorId === state.profile.id) return;
    var i = state.following.indexOf(authorId);
    if (i >= 0) state.following.splice(i, 1);
    else state.following.push(authorId);
    saveState();
    renderFeed();
    renderPeople();
  }

  function addComment(id, text) {
    text = String(text || '').trim();
    if (!text) { status('Write a comment first.'); return; }
    var post = state.posts.find(function (p) { return p.id === id; });
    if (!post) return;
    post.comments = post.comments || [];
    post.comments.push({
      id: 'c' + Date.now().toString(36),
      name: state.profile.name,
      authorId: state.profile.id,
      text: text,
      created: Date.now()
    });
    saveState();
    renderFeed();
  }

  function copyShare(post) {
    var local = postShareUrl(post.id);
    var make = encodeShareMake({
      lyrics: post.lyrics,
      genre: post.genre,
      mood: post.mood,
      title: post.title,
      bpm: post.bpm,
      desc: post.desc
    });
    var text = 'Open this post on the same browser: ' + local + '\nMake the same lyrics and style in any browser: ' + make;
    function done() { status('Share links copied. The post link works on this device. The lyrics link can be used to generate a new take elsewhere.'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { window.prompt('Copy these share links', text); done(); });
    } else {
      window.prompt('Copy these share links', text);
      done();
    }
  }

  function downloadPost(post) {
    audioUrl(post.songId).then(function (url) {
      if (!url) { status('The audio for this post is not stored in this browser.'); return; }
      var a = document.createElement('a');
      a.href = url;
      a.download = String(post.title || 'song').replace(/[^\w]+/g, '-').slice(0, 40) + '.wav';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  function highlightPost(id) {
    renderFeed();
    var el = $('post-' + id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else status('That post is not stored in this browser. If you have a lyrics share link, open it to generate a new take.');
  }

  function authors() {
    var map = {};
    map[state.profile.id] = {
      id: state.profile.id,
      name: state.profile.name,
      handle: state.profile.handle,
      bio: state.profile.bio,
      self: true
    };
    state.posts.forEach(function (p) {
      if (!p.author || map[p.author.id]) return;
      map[p.author.id] = {
        id: p.author.id,
        name: p.author.name,
        handle: p.author.handle,
        bio: '',
        self: false
      };
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function renderPeople() {
    var box = $('people-list');
    box.replaceChildren();
    authors().forEach(function (person) {
      var card = document.createElement('article');
      card.className = 'card';
      var head = document.createElement('div');
      head.className = 'post-head';
      head.appendChild(avatarNode(person));
      var who = document.createElement('div');
      var name = document.createElement('p');
      name.className = 'who';
      name.textContent = person.name + (person.self ? ' (you)' : '');
      var meta = document.createElement('p');
      meta.className = 'meta';
      meta.textContent = '@' + (person.handle || 'guest');
      who.append(name, meta);
      head.appendChild(who);
      card.appendChild(head);
      if (person.bio) {
        var bio = document.createElement('p');
        bio.textContent = person.bio;
        card.appendChild(bio);
      }
      if (!person.self) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn quiet';
        var following = state.following.indexOf(person.id) >= 0;
        btn.textContent = following ? 'Unfollow' : 'Follow';
        btn.addEventListener('click', function () { toggleFollow(person.id); });
        card.appendChild(btn);
      }
      var count = state.posts.filter(function (p) { return p.author && p.author.id === person.id; }).length;
      var n = document.createElement('p');
      n.className = 'meta';
      n.textContent = count + (count === 1 ? ' post on this device' : ' posts on this device');
      card.appendChild(n);
      box.appendChild(card);
    });
  }

  function renderMe() {
    $('prof-name').value = state.profile.name || '';
    $('prof-handle').value = state.profile.handle || '';
    $('prof-email').value = state.profile.email || '';
    $('prof-bio').value = state.profile.bio || '';
    $('access-note').textContent = accessNote();
    var box = $('my-posts');
    box.replaceChildren();
    var mine = state.posts.filter(function (p) { return p.author && p.author.id === state.profile.id; });
    var h = document.createElement('h3');
    h.textContent = 'Your posts';
    box.appendChild(h);
    if (!mine.length) {
      var empty = document.createElement('p');
      empty.className = 'hint';
      empty.textContent = 'You have not posted a song on this device yet.';
      box.appendChild(empty);
      return;
    }
    mine.forEach(function (post) { box.appendChild(postCard(post)); });
  }

  function saveProfile() {
    var name = ($('prof-name').value || '').trim() || 'Guest';
    var handle = ($('prof-handle').value || '').trim().replace(/^@/, '').replace(/[^\w.-]/g, '') || 'guest';
    state.profile.name = name.slice(0, 60);
    state.profile.handle = handle.slice(0, 30);
    state.profile.email = ($('prof-email').value || '').trim().slice(0, 120);
    state.profile.bio = ($('prof-bio').value || '').trim().slice(0, 240);
    state.posts.forEach(function (p) {
      if (p.author && p.author.id === state.profile.id) {
        p.author.name = state.profile.name;
        p.author.handle = state.profile.handle;
      }
    });
    saveState();
    $('access-note').textContent = accessNote();
    status(isOwner() ? 'Profile saved. The owner copy is on for this device.' : 'Profile saved on this device.');
  }

  function bind() {
    $('btn-generate').addEventListener('click', function () { onGenerate(); });
    $('btn-download').addEventListener('click', downloadDraft);
    $('btn-post').addEventListener('click', onPost);
    $('btn-save-profile').addEventListener('click', saveProfile);
    $('feed-all').addEventListener('click', function () {
      state.feedMode = 'all';
      $('feed-all').setAttribute('aria-pressed', 'true');
      $('feed-following').setAttribute('aria-pressed', 'false');
      renderFeed();
    });
    $('feed-following').addEventListener('click', function () {
      state.feedMode = 'following';
      $('feed-all').setAttribute('aria-pressed', 'false');
      $('feed-following').setAttribute('aria-pressed', 'true');
      renderFeed();
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('cb-payid-unlock', function () {
      status('This device is unlocked for the full app. Payment was not verified by this page.');
      if ($('access-note')) $('access-note').textContent = accessNote();
    });
  }

  loadState();
  bind();
  waitForEngine().then(function () {
    fillStyleSelects();
    status(accessNote());
    route();
  }).catch(function (err) {
    status(err.message || 'The song engine did not load.');
    route();
  });
})();
