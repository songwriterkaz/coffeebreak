/*! Coffeebreak Ghost Investigation Journal — shared localStorage helper.
 *  Key: cb_ghost_journal. Same-origin apps (Ghost Hunter, CB Ghost Scanner, this journal) share entries.
 *  Only stores data the user (or a hooked Save) explicitly adds — nothing fake is invented.
 */
(function (root) {
  'use strict';
  var KEY = 'cb_ghost_journal';
  var MAX_ENTRIES = 500;
  var MAX_MEDIA_CHARS = 900000; // keep localStorage under ~1MB soft cap per photo/audio

  function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var data = safeParse(raw);
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.entries)) return data.entries;
      return [];
    } catch (e) {
      return [];
    }
  }

  function persist(entries) {
    if (!Array.isArray(entries)) entries = [];
    if (entries.length > MAX_ENTRIES) entries = entries.slice(entries.length - MAX_ENTRIES);
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: 1, entries: entries }));
      return true;
    } catch (e) {
      try {
        // strip media and retry once if quota exceeded
        var slim = entries.map(function (e) {
          var c = Object.assign({}, e);
          if (c.photos && c.photos.length) c.photos = c.photos.slice(0, 1).map(function (p) {
            return (typeof p === 'string' && p.length > 20000) ? '[photo omitted — storage full]' : p;
          });
          if (c.audio && c.audio.length) c.audio = ['[audio omitted — storage full]'];
          return c;
        });
        localStorage.setItem(KEY, JSON.stringify({ v: 1, entries: slim }));
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  function uid() {
    return 'gj_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function normalize(entry) {
    entry = entry || {};
    var ts = entry.ts || entry.when || Date.now();
    if (typeof ts === 'string') {
      var parsed = Date.parse(ts);
      ts = isNaN(parsed) ? Date.now() : parsed;
    }
    var d = entry.date || entry.datetime || new Date(ts).toISOString();
    return {
      id: entry.id || uid(),
      ts: ts,
      date: d,
      location: String(entry.location || entry.place || entry.p || '').slice(0, 400),
      app: String(entry.app || entry.source || 'Manual').slice(0, 120),
      readings: String(entry.readings || entry.reading || entry.type || entry.t || '').slice(0, 2000),
      notes: String(entry.notes || entry.n || entry.text || '').slice(0, 8000),
      photos: Array.isArray(entry.photos) ? entry.photos.slice(0, 6) : (entry.photo ? [entry.photo] : []),
      audio: Array.isArray(entry.audio) ? entry.audio.slice(0, 4) : (entry.audioClip ? [entry.audioClip] : [])
    };
  }

  function add(entry) {
    var n = normalize(entry);
    // drop oversized media strings
    n.photos = n.photos.filter(function (p) { return typeof p === 'string' && p.length <= MAX_MEDIA_CHARS; }).slice(0, 6);
    n.audio = n.audio.filter(function (a) { return typeof a === 'string' && a.length <= MAX_MEDIA_CHARS; }).slice(0, 4);
    var list = load();
    list.push(n);
    var ok = persist(list);
    try {
      root.dispatchEvent(new CustomEvent('cb-ghost-journal-changed', { detail: { entry: n, ok: ok } }));
    } catch (e) {}
    return ok ? n : null;
  }

  function update(id, patch) {
    var list = load();
    var i = list.findIndex(function (e) { return e.id === id; });
    if (i < 0) return null;
    var next = normalize(Object.assign({}, list[i], patch, { id: id }));
    list[i] = next;
    return persist(list) ? next : null;
  }

  function remove(id) {
    var list = load().filter(function (e) { return e.id !== id; });
    return persist(list);
  }

  function clear() {
    return persist([]);
  }

  function apps() {
    var seen = {};
    load().forEach(function (e) {
      var a = e.app || 'Manual';
      seen[a] = (seen[a] || 0) + 1;
    });
    return Object.keys(seen).sort().map(function (k) { return { app: k, count: seen[k] }; });
  }

  function search(opts) {
    opts = opts || {};
    var q = String(opts.q || '').trim().toLowerCase();
    var app = String(opts.app || '').trim();
    return load().filter(function (e) {
      if (app && e.app !== app) return false;
      if (!q) return true;
      var hay = [e.date, e.location, e.app, e.readings, e.notes].join(' ').toLowerCase();
      return hay.indexOf(q) >= 0;
    }).sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
  }

  function exportJSON() {
    return JSON.stringify({ v: 1, exported: new Date().toISOString(), app: 'Coffeebreak Ghost Investigation Journal', entries: load() }, null, 2);
  }

  function importJSON(text, mode) {
    mode = mode || 'merge';
    var data = typeof text === 'string' ? safeParse(text) : text;
    if (!data) throw new Error('Invalid JSON');
    var incoming = Array.isArray(data) ? data : (data.entries || []);
    if (!Array.isArray(incoming)) throw new Error('No entries array found');
    var list = mode === 'replace' ? [] : load();
    var ids = {};
    list.forEach(function (e) { ids[e.id] = 1; });
    incoming.forEach(function (e) {
      var n = normalize(e);
      if (ids[n.id]) n.id = uid();
      ids[n.id] = 1;
      list.push(n);
    });
    if (!persist(list)) throw new Error('Could not save (storage full)');
    return list.length;
  }

  /** Convenience for other Coffeebreak ghost apps' Save buttons. */
  function saveFromApp(appName, readings, notes, location, extra) {
    extra = extra || {};
    return add({
      app: appName,
      readings: readings,
      notes: notes,
      location: location || extra.location || '',
      photos: extra.photos || [],
      audio: extra.audio || [],
      date: extra.date || new Date().toISOString()
    });
  }

  root.CBGhostJournal = {
    KEY: KEY,
    load: load,
    save: persist,
    add: add,
    update: update,
    remove: remove,
    clear: clear,
    apps: apps,
    search: search,
    exportJSON: exportJSON,
    importJSON: importJSON,
    saveFromApp: saveFromApp,
    normalize: normalize
  };
})(typeof window !== 'undefined' ? window : this);
