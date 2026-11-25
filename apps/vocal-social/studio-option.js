/* Studio quality: the same ACE-Step client Coffeebreak Studio uses.
   Studio Espresso exposes an ENDPOINT and a singAceStep name, but singAceStep
   sings with the in-browser voice. This file calls apps/coffeebreak-studio/studio-core.js.
   If the free engine does not answer, the caller should use the in-browser voice. */
(function (root) {
  'use strict';
  var loader = null;
  function load() {
    if (!loader) {
      loader = import('https://cdn.jsdelivr.net/npm/@gradio/client@2.8.0/dist/index.min.js').then(function (mod) {
        var Client = mod.Client || mod.default;
        if (!Client) throw new Error('The studio client did not load.');
        return import('../coffeebreak-studio/studio-core.js').then(function (core) {
          return { Client: Client, makeSong: core.makeSong };
        });
      });
    }
    return loader;
  }
  function sing(lyrics, style, onStatus) {
    var song = {
      style: style || 'warm sung vocal, acoustic guitar, 100 BPM',
      lyrics: String(lyrics || '').trim(),
      lang: 'en',
      duration: 24
    };
    if (!song.lyrics) return Promise.reject(new Error('Write lyrics first.'));
    return load().then(function (api) {
      return api.makeSong(api.Client, song, onStatus || function () {}, '');
    });
  }
  root.CBStudioQuality = {
    name: 'ACE-Step via Coffeebreak Studio',
    note: 'Uses apps/coffeebreak-studio/studio-core.js. It is not the Studio Espresso singAceStep function, which still uses the in-browser voice. If this engine is busy or over its free allowance, keep the in-browser voice.',
    sing: sing
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
