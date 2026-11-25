/* Shared text walls. Posts go to the Worker when /api/walls is deployed, otherwise they stay on this device. */
(function (root) {
  'use strict';
  var TOKEN_KEY = 'cb-vocal-social-v2';

  function readToken() {
    try { var raw = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null'); return raw && raw.token ? raw : { token: '', profile: null }; }
    catch (e) { return { token: '', profile: null }; }
  }
  function writeToken(local) {
    try { localStorage.setItem(TOKEN_KEY, JSON.stringify(local)); } catch (e) {}
  }
  function loadBox(key) {
    try { var raw = JSON.parse(localStorage.getItem(key) || 'null'); if (raw && Array.isArray(raw.posts)) return raw; } catch (e) {}
    return { posts: [] };
  }
  function saveBox(key, box) {
    try { localStorage.setItem(key, JSON.stringify(box)); } catch (e) {}
  }
  function rid(p) {
    return p + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function create(opts) {
    opts = opts || {};
    var apiBase = String(opts.api || 'https://cb-vocal-social.coffeebreaks.workers.dev').replace(/\/+$/, '');
    var channel = opts.channel === 'parenting' ? 'parenting' : 'vocal';
    var storageKey = opts.storageKey || ('cb-walls-' + channel + '-v1');
    var shared = false;
    var checked = false;

    function request(path, options) {
      options = options || {};
      var local = readToken();
      var headers = options.headers || {};
      if (local.token) headers.Authorization = 'Bearer ' + local.token;
      var body = options.body;
      if (body && typeof body !== 'string') { body = JSON.stringify(body); headers['Content-Type'] = 'application/json'; }
      return fetch(apiBase + path, { method: options.method || 'GET', headers: headers, body: body }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var err = new Error(j.error || ('The server said ' + r.status + '.')); err.status = r.status; throw err; }
          return j;
        });
      });
    }

    function probe() {
      if (checked) return Promise.resolve(shared);
      return request('/api/walls/capabilities').then(function (j) {
        shared = !!(j && j.walls);
        checked = true;
        return shared;
      }, function () { shared = false; checked = true; return false; });
    }

    function ensureProfile(name) {
      var local = readToken();
      if (local.token && local.profile) return Promise.resolve(local.profile);
      var display = String(name || 'Guest').slice(0, 40);
      var handle = display.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
      if (handle.length < 3) handle = 'singer' + Math.floor(Math.random() * 9000 + 1000);
      return request('/api/profiles', { method: 'POST', body: { name: display, handle: handle, bio: '', avatar: 'a:0' } }).then(function (j) {
        local.token = j.token;
        local.profile = j.profile;
        writeToken(local);
        return j.profile;
      });
    }

    function devicePost(text, name) {
      return {
        id: rid('d'),
        text: text,
        channel: channel,
        created: Date.now(),
        comments: [],
        device: true,
        label: 'On this device for now',
        author: { id: 'device', handle: 'you', name: name || 'You', avatar: '' },
        wall: { id: 'device', handle: 'you', name: name || 'You' }
      };
    }

    function remember(post) {
      var box = loadBox(storageKey);
      box.posts.unshift(post);
      if (box.posts.length > 100) box.posts.length = 100;
      saveBox(storageKey, box);
      return post;
    }

    function publish(text, name, wallHandle) {
      text = String(text || '').trim();
      if (!text) return Promise.reject(new Error('Write something first.'));
      return probe().then(function (ok) {
        if (!ok) return remember(devicePost(text, name));
        return ensureProfile(name).then(function () {
          return request('/api/walls', { method: 'POST', body: { text: text, channel: channel, wall: wallHandle || '' } });
        }).then(function (j) { return j.post; }, function () { return remember(devicePost(text, name)); });
      });
    }

    function comment(postId, text, name) {
      text = String(text || '').trim();
      var box = loadBox(storageKey);
      var local = null;
      for (var i = 0; i < box.posts.length; i++) if (box.posts[i].id === postId) local = box.posts[i];
      if (local && local.device) {
        local.comments = local.comments || [];
        local.comments.push({ id: rid('c'), text: text, created: Date.now(), device: true, author: { name: name || 'You', handle: 'you' } });
        saveBox(storageKey, box);
        return Promise.resolve(local.comments[local.comments.length - 1]);
      }
      return probe().then(function (ok) {
        if (!ok) return Promise.reject(new Error('On this device for now. That shared post is not available.'));
        return ensureProfile(name).then(function () {
          return request('/api/walls/' + encodeURIComponent(postId) + '/comments', { method: 'POST', body: { text: text } });
        }).then(function (j) { return j.comment; });
      });
    }

    function commentsFor(postId) {
      var box = loadBox(storageKey);
      for (var i = 0; i < box.posts.length; i++) {
        if (box.posts[i].id === postId) return Promise.resolve(box.posts[i].comments || []);
      }
      return probe().then(function (ok) {
        if (!ok) return [];
        return request('/api/walls/' + encodeURIComponent(postId) + '/comments').then(function (j) { return j.comments || []; }, function () { return []; });
      });
    }

    function merge(remote) {
      var box = loadBox(storageKey);
      var local = box.posts.filter(function (p) { return p.device; });
      var all = local.concat(remote || []);
      var seen = {};
      all = all.filter(function (p) { if (!p || seen[p.id]) return false; seen[p.id] = 1; return true; });
      all.sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
      return all;
    }

    function feed() {
      return probe().then(function (ok) {
        if (!ok) return { shared: false, posts: merge([]) };
        return request('/api/walls/feed?channel=' + channel).then(function (j) {
          return { shared: true, posts: merge(j.posts || []) };
        }, function () { return { shared: false, posts: merge([]) }; });
      });
    }

    function wall(handle) {
      return probe().then(function (ok) {
        var mine = loadBox(storageKey).posts.filter(function (p) {
          return p.device && (!handle || handle === 'you' || (p.wall && p.wall.handle === handle));
        });
        if (!ok) return { shared: false, posts: mine };
        return request('/api/walls/' + encodeURIComponent(handle) + '?channel=' + channel).then(function (j) {
          return { shared: true, wall: j.wall, posts: mine.concat(j.posts || []) };
        }, function () { return { shared: false, posts: mine }; });
      });
    }

    return { channel: channel, probe: probe, publish: publish, comment: comment, commentsFor: commentsFor, feed: feed, wall: wall, isShared: function () { return shared; } };
  }

  root.CBWalls = { create: create };
})(typeof globalThis !== 'undefined' ? globalThis : this);
