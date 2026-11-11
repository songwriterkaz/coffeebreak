/* Coffeebreak Studio Espresso - Create and My songs.
   Vocals are sung by SemBridge (Apache-2.0) via its public Space.
   Drums, bass and keys use this studio's instruments. */
(function () {
  const C = window.CBCore;
  const LIB = idbLibrary();
  let AUD = { playing: false, id: null, buf: null, ctx: null, src: null, t0: 0, title: '' };
  let busy = false;

  function idbLibrary() {
    function db() {
      return new Promise((res, rej) => {
        const req = indexedDB.open('cb-espresso-songs', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('songs', { keyPath: 'id' });
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
    }
    function ask(mode, fn) {
      return db().then(database => new Promise((res, rej) => {
        const tx = database.transaction('songs', mode);
        const out = fn(tx.objectStore('songs'));
        tx.oncomplete = () => res(out && out.result);
        tx.onerror = () => rej(tx.error);
      }));
    }
    return {
      async list() {
        const rows = await ask('readonly', store => store.getAll()) || [];
        return rows.map(C.metaOf).sort((a, b) => b.created - a.created);
      },
      get(id) { return ask('readonly', store => store.get(id)); },
      put(rec) { return ask('readwrite', store => store.put(rec)); },
      remove(id) { return ask('readwrite', store => store.delete(id)); },
    };
  }

  function peakBuf(buf) {
    let peak = 0;
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const data = buf.getChannelData(c);
      for (let i = 0; i < data.length; i += 16) peak = Math.max(peak, Math.abs(data[i]));
    }
    return peak;
  }

  function trimBuffer(buf) {
    const thresh = 0.004;
    const ch = buf.numberOfChannels;
    const channels = [];
    for (let c = 0; c < ch; c++) channels.push(buf.getChannelData(c));
    const loud = i => {
      let m = 0;
      for (let c = 0; c < ch; c++) m = Math.max(m, Math.abs(channels[c][i] || 0));
      return m;
    };
    let a = 0;
    let b = buf.length - 1;
    while (a < b && loud(a) < thresh) a++;
    while (b > a && loud(b) < thresh) b--;
    const pad = Math.round(buf.sampleRate * 0.15);
    a = Math.max(0, a - pad);
    b = Math.min(buf.length - 1, b + pad);
    if (b - a < buf.sampleRate * 0.4) return buf;
    const out = newBuf(ch, b - a + 1, buf.sampleRate);
    for (let c = 0; c < ch; c++) out.getChannelData(c).set(channels[c].subarray(a, b + 1));
    return out;
  }

  function tile(notes, bars, cycleBars) {
    const cycle = cycleBars * P.sig;
    const out = [];
    const reps = Math.ceil((bars * P.sig) / cycle);
    for (let r = 0; r < reps; r++) {
      for (const note of notes) {
        const s = note.s + r * cycle;
        if (s < bars * P.sig) out.push(Object.assign({}, note, { s: s }));
      }
    }
    return out;
  }

  function bassNotes(prog, key, bars) {
    const scale = prog.minor ? SCALES.Minor : SCALES.Major;
    const degrees = PROGS[prog.name];
    const notes = [];
    for (let i = 0; i < bars; i++) {
      const degree = degrees[i % degrees.length];
      notes.push({ p: 36 + (key % 12) + scale[degree % 7], s: i * P.sig, l: P.sig * 0.9, v: 0.84 });
    }
    return notes;
  }

  function drumPreset(genre) {
    if (genre === 'Trap' || genre === 'Hip hop') return '808 kit';
    if (genre === 'House' || genre === 'Techno' || genre === 'Drum and bass') return 'Electro kit';
    if (genre === 'Lo-fi') return 'Lo-Fi kit';
    if (genre === 'Country' || genre === 'Country shuffle' || genre === 'Jazz') return 'Acoustic kit';
    return 'Drum kit';
  }

  function keysPreset(mood) {
    if (mood === 'Epic') return 'Strings';
    if (mood === 'Dreamy' || mood === 'Lullaby') return 'Warm pad';
    if (mood === 'Sad' || mood === 'Dark') return 'Soft keys';
    return 'Electric piano';
  }

  function midiRoom() { return DEMO ? DEMO_TRACKS - 1 : 99; }

  function putMidi(preset, name, notes, bars) {
    if (realTracks().length >= midiRoom()) return null;
    const track = addTrack('midi', preset, name);
    if (!track) return null;
    const clip = newClip(track, 0, bars * P.sig, { name: name });
    clip.notes = notes;
    return track;
  }

  function arrange(style, prog, melody, bars) {
    const made = [];
    const drums = putMidi(drumPreset(style.genre), 'Drums', genDrums(style.genre, 2, bars), bars);
    if (drums) { drums.fx.push(fxNew('comp', { threshold: -16, ratio: 3, makeup: 2 })); made.push('drums'); }
    const bass = putMidi('Round bass', 'Bass', bassNotes(prog, style.key, bars), bars);
    if (bass) { bass.vol = 0.72; made.push('bass'); }
    const cycle = PROGS[prog.name].length;
    const chords = tile(genChords(prog.name, style.key, prog.minor, cycle), bars, cycle);
    const keys = putMidi(keysPreset(style.mood), 'Keys', chords, bars);
    if (keys) { keys.vol = 0.58; keys.sendA = 0.2; keys.fx.push(fxNew('chorus', { mix: 0.25 })); made.push('keys'); }
    const lead = putMidi('Soft keys', 'Sung pitches', melody.filter(n => n.s < bars * P.sig), bars);
    if (lead) { lead.mute = true; lead.vol = 0; made.push('sung pitches'); }
    return made;
  }

  async function createSong(input) {
    input = input || {};
    const lyrics = String(input.lyrics || '').trim();
    const style = C.readStyle(input);
    const prog = C.progressionFor(style);
    const moodIndex = Math.max(0, C.MOODS.indexOf(style.mood));
    const seed = input.seed == null ? 1 + Math.floor(Math.random() * 50) : input.seed | 0;
    const previousSig = P.sig;
    P.sig = 4;
    let melody;
    try { melody = genMelody(style.key, moodIndex, seed, 8); }
    finally { P.sig = previousSig; }
    const score = C.buildScore(lyrics, melody, style.bpm);
    const voiceId = input.voiceId || C.defaultVoiceId(lyrics);
    const sung = await C.singSemBridge(score.text, { voiceId: voiceId, steps: input.steps, seed: seed });
    const ctx = AC();
    const decoded = await ctx.decodeAudioData(sung.bytes.slice(0));
    if (peakBuf(decoded) < 0.02) throw new Error('The vocal model returned silence. Nothing was saved.');
    const vocal = trimBuffer(decoded);
    const previous = JSON.stringify(P);
    try {
      stop();
      P = newProject();
      P.songId = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      P.name = String(input.title || '').trim().slice(0, 80) || titleFromLyrics(lyrics);
      P.bpm = style.bpm;
      P.sig = 4;
      P.lyrics = lyrics;
      const bars = Math.max(4, Math.min(16, Math.ceil(s2b(vocal.duration) / P.sig)));
      const parts = arrange(style, prog, melody, bars);
      const vocalTrack = addTrack('audio', null, 'Vocals');
      if (!vocalTrack) throw new Error('The vocal track could not be added. Nothing was saved.');
      audioClip(vocalTrack, vocal, 0, 'Vocals');
      vocalTrack.vol = 0.95;
      vocalTrack.sendA = 0.16;
      parts.push('vocals');
      P.markers = [{ b: 0, name: 'Song' }];
      SEL.t = vocalTrack.id;
      const keyName = C.NOTE_NAMES[style.key] + (prog.minor ? ' minor' : ' major');
      const summary = style.genre + ', ' + style.mood + ', ' + keyName + ', ' + style.bpm + ' BPM. SemBridge sang ' + score.words + ' words. Parts: ' + parts.join(', ') + '. Sung timing can drift from the grid.';
      const record = {
        id: P.songId,
        title: P.name,
        created: Date.now(),
        lyrics: lyrics,
        summary: summary,
        style: style,
        vocal: { model: sung.model, voice: sung.voice, info: sung.info, license: sung.license, score: score.text },
        packed: await packProject().arrayBuffer(),
      };
      await LIB.put(record);
      if ($('#pName')) $('#pName').value = P.name;
      refreshAll();
      await renderLibrary();
      showResult(record);
      const meta = Object.assign(C.metaOf(record), { tracks: P.tracks.map(t => t.name), parts: parts });
      if (input.autoplay !== false) {
        try { await playSong(record.id); } catch (err) { setStatus('The song is saved in My songs. Playback did not start: ' + (err.message || 'unknown error')); }
      }
      return meta;
    } catch (err) {
      try { P = JSON.parse(previous); } catch (e) {}
      refreshAll();
      throw err;
    }
  }

  async function playSong(id) {
    const record = await LIB.get(id);
    if (!record || !record.packed) throw new Error('That song is not in this browser.');
    const previous = await packProject().arrayBuffer();
    const tab = CUR;
    try {
      await unpackProject(record.packed.slice ? record.packed.slice(0) : record.packed);
      const mix = await renderSong({ master: false, tail: 0.35 });
      const peak = peakBuf(mix);
      await unpackProject(previous.slice(0));
      if (tab) showTab(tab);
      playMix(mix, record);
      await new Promise(r => setTimeout(r, 350));
      const seconds = AUD.ctx ? Math.max(0, AUD.ctx.currentTime - AUD.t0) : 0;
      return { peak: peak, duration: mix.duration, playing: !!(AUD.playing && AUD.ctx && AUD.ctx.state === 'running'), seconds: seconds, title: record.title, state: AUD.ctx && AUD.ctx.state };
    } catch (err) {
      try { await unpackProject(previous.slice(0)); } catch (e) {}
      throw err;
    }
  }

  async function openSong(id) {
    const record = await LIB.get(id);
    if (!record || !record.packed) throw new Error('That song is not in this browser.');
    stopAudition();
    await unpackProject(record.packed.slice ? record.packed.slice(0) : record.packed);
    P.songId = record.id;
    if ($('#pName')) $('#pName').value = P.name || '';
    showTab('arrange');
    const vocal = P.tracks.find(t => t.name === 'Vocals' && t.kind === 'audio');
    const clip = vocal && vocal.clips[0];
    const buf = clip && BUFS[clip.takes[clip.take || 0]];
    const drums = P.tracks.find(t => t.kind === 'midi' && t.inst && t.inst.type === 'drums');
    return {
      title: P.name,
      tracks: P.tracks.map(t => t.name),
      vocalSeconds: buf ? buf.duration : 0,
      vocalPeak: buf ? peakBuf(buf) : 0,
      drumNotes: drums ? drums.clips.reduce((n, c) => n + (c.notes ? c.notes.length : 0), 0) : 0,
    };
  }

  function playMix(buf, record) {
    stop();
    stopAudition();
    const ctx = AC();
    if (ctx.state === 'suspended') ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const t0 = ctx.currentTime + 0.06;
    src.start(t0);
    AUD = { src: src, ctx: ctx, t0: t0, buf: buf, playing: true, title: record.title, id: record.id };
    src.onended = () => { if (AUD.src === src) { AUD.playing = false; paintPlayer(); renderLibrary(); } };
    const box = $('#songPlayer');
    if (box) box.hidden = false;
    paintPlayer();
    requestAnimationFrame(tickPlayer);
    renderLibrary();
  }

  function stopAudition() {
    if (AUD.src) { try { AUD.src.stop(); } catch (e) {} }
    AUD.src = null;
    AUD.playing = false;
  }

  function paintPlayer() {
    const title = $('#playTitle');
    const state = $('#playState');
    if (title) title.textContent = AUD.title || '';
    if (state) {
      if (AUD.playing) {
        const sec = AUD.ctx ? Math.max(0, AUD.ctx.currentTime - AUD.t0) : 0;
        state.textContent = 'Playing ' + sec.toFixed(1) + 's';
      } else state.textContent = AUD.buf ? 'Stopped' : '';
    }
    drawWave();
  }

  function tickPlayer() {
    if (!AUD.playing) { paintPlayer(); return; }
    paintPlayer();
    requestAnimationFrame(tickPlayer);
  }

  function drawWave() {
    const cv = $('#songWave');
    if (!cv) return;
    const width = cv.width = cv.clientWidth || 640;
    const height = cv.height = 84;
    const g = cv.getContext('2d');
    g.fillStyle = '#2e1422';
    g.fillRect(0, 0, width, height);
    if (!AUD.buf) return;
    const data = AUD.buf.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / width));
    g.fillStyle = '#e75b9a';
    for (let x = 0; x < width; x++) {
      let m = 0;
      for (let i = x * step; i < (x + 1) * step; i += 8) m = Math.max(m, Math.abs(data[i] || 0));
      const h = Math.max(1, m * (height - 10));
      g.fillRect(x, (height - h) / 2, 1, h);
    }
    if (AUD.playing && AUD.ctx) {
      const sec = Math.max(0, AUD.ctx.currentTime - AUD.t0);
      const x = Math.min(width - 2, (sec / AUD.buf.duration) * width);
      g.fillStyle = '#ffffff';
      g.fillRect(x, 0, 2, height);
    }
  }

  async function renderLibrary() {
    const box = $('#songList');
    if (!box) return;
    let rows = [];
    try { rows = await LIB.list(); } catch (e) { box.innerHTML = '<p class="hint">Browser storage is not available here.</p>'; return; }
    if (!rows.length) { box.innerHTML = '<p class="hint">No songs yet. A song you create is kept in this browser.</p>'; return; }
    box.innerHTML = rows.map(s => `<div class="songrow${AUD.id === s.id && AUD.playing ? ' playing' : ''}">
      <div class="songmeta"><b>${esc(s.title)}</b><span>${esc(lyricLine(s.lyrics))}</span><span class="hint">${esc(s.summary || '')}</span></div>
      <button type="button" data-act="play" data-id="${esc(s.id)}">Play</button>
      <button type="button" data-act="open" data-id="${esc(s.id)}">Open in studio</button>
      <button type="button" class="sm" data-act="delete" data-id="${esc(s.id)}">Delete</button>
    </div>`).join('');
    box.querySelectorAll('button').forEach(button => {
      button.onclick = async () => {
        const id = button.dataset.id;
        try {
          if (button.dataset.act === 'play') await playSong(id);
          else if (button.dataset.act === 'open') await openSong(id);
          else if (button.dataset.act === 'delete') {
            if (!confirm('Delete this song from My songs?')) return;
            if (AUD.id === id) stopAudition();
            await LIB.remove(id);
            await renderLibrary();
          }
        } catch (err) { toast(err.message || 'That song could not be opened'); }
      };
    });
  }

  function showResult(record) {
    const el = $('#createResult');
    if (!el) return;
    el.hidden = false;
    el.innerHTML = `<b>${esc(record.title)}</b><p class="hint">${esc(record.summary)}</p><p class="hint">Vocal model: ${esc(record.vocal.model)}, ${esc(record.vocal.license)}. Voice colour: ${esc(record.vocal.voice)}. ${esc(record.vocal.info)}</p>`;
  }

  function setStatus(text) {
    const el = $('#createStatus');
    if (el) el.textContent = text || '';
  }

  function titleFromLyrics(lyrics) {
    const line = String(lyrics || '').split(/\n/).map(s => s.trim()).find(Boolean) || '';
    const words = C.wordsOf(line).slice(0, 6).join(' ');
    if (!words) return 'Untitled song';
    return (words.charAt(0).toUpperCase() + words.slice(1)).slice(0, 80);
  }

  function lyricLine(lyrics) {
    return String(lyrics || '').split(/\n/).map(s => s.trim()).find(Boolean) || '';
  }

  function selectedInput() {
    const lyrics = $('#createLyrics') ? $('#createLyrics').value : '';
    const more = $('#createMore') && $('#createMore').open;
    const base = {
      title: '',
      lyrics: lyrics,
      description: '',
      mood: 'Happy',
      genre: 'Pop',
      key: 0,
      minor: false,
      bpm: 110,
      voiceId: C.defaultVoiceId(lyrics),
    };
    if (!more) return base;
    return {
      title: $('#createTitle') ? $('#createTitle').value : '',
      lyrics: lyrics,
      description: $('#createDesc') ? $('#createDesc').value : '',
      mood: $('#createMood') ? $('#createMood').value : base.mood,
      genre: $('#createGenre') ? $('#createGenre').value : base.genre,
      key: $('#createKey') ? +$('#createKey').value : base.key,
      minor: $('#createMinor') ? $('#createMinor').checked : false,
      bpm: $('#createBpm') ? +$('#createBpm').value : base.bpm,
      voiceId: $('#createVoice') && $('#createVoice').value ? $('#createVoice').value : base.voiceId,
    };
  }

  async function onCreate() {
    if (busy) return;
    const input = selectedInput();
    if (C.wordsOf(input.lyrics).length < 2) { setStatus('Write at least two words to sing.'); return; }
    busy = true;
    const button = $('#createGo');
    if (button) button.disabled = true;
    setStatus('Generating the vocal with SemBridge. This can take up to a minute.');
    try {
      AC();
      await createSong(input);
      setStatus('Saved in My songs. The vocal is generated audio from SemBridge, played with this studio\'s arrangement.');
      toast('Song saved in My songs');
    } catch (err) {
      setStatus(err.message || 'The vocal could not be generated.');
      toast(err.message || 'The vocal could not be generated.');
    } finally {
      busy = false;
      if (button) button.disabled = false;
    }
  }

  function fillPay() {
    const cart = C.readCart(localStorage);
    document.querySelectorAll('[data-pay-ref]').forEach(el => { el.textContent = cart.reference; });
    return cart;
  }

  function mount() {
    const player = document.createElement('div');
    player.id = 'songPlayer';
    player.className = 'panel song-player';
    player.hidden = true;
    player.innerHTML = '<div class="row"><b id="playTitle"></b><span id="playState" class="hint"></span><button type="button" id="playStop">Stop</button><button type="button" id="playOpen">Open in studio</button></div><canvas id="songWave" width="640" height="84"></canvas>';
    $('#main').before(player);
    $('#playStop').onclick = () => { stopAudition(); paintPlayer(); renderLibrary(); };
    $('#playOpen').onclick = () => { if (AUD.id) openSong(AUD.id).catch(err => toast(err.message)); };

    sec('create', `<div class="panel"><h3>Create a song</h3>
      <p class="hint" id="createHonest">Paste the words and press Create song. SemBridge, an open Apache-2.0 singing model, sings them and the song is saved in My songs with those words. This is generated singing, not a recording of a person. Drums, bass and keys are this studio's synthesizers. If the vocal service fails, nothing is saved and no stand-in voice is played.</p>
      <textarea id="createLyrics" placeholder="Paste or type the words to sing"></textarea>
      <div class="row"><button type="button" id="createGo" class="big">Create song</button><span id="createStatus" class="hint"></span></div>
      <details id="createMore"><summary>More choices</summary>
        <div class="row"><label class="mini">Title <input id="createTitle" type="text" maxlength="80"></label>
          <label class="mini">BPM <input id="createBpm" type="number" min="72" max="140" value="110"></label></div>
        <div class="row"><label class="mini">Mood <select id="createMood"></select></label>
          <label class="mini">Style <select id="createGenre"></select></label>
          <label class="mini">Key <select id="createKey"></select></label>
          <label class="mini"><input id="createMinor" type="checkbox"> Minor</label></div>
        <div class="row"><label class="mini">Voice colour <select id="createVoice"></select></label></div>
        <label class="mini">Describe the song <input id="createDesc" type="text" placeholder="slow country in G minor" style="width:min(420px,80vw)"></label>
        <p class="hint">Leave this closed and Create song still sings your words. These choices only apply when this section is open.</p>
      </details>
      <div id="createResult" hidden></div>
      <div class="paybox"><b>Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com</b><br>$10 USD for Coffeebreak Studio Espresso. Reference: <b data-pay-ref></b>.<br><span class="hint">The cart stores this reference only. It does not mark the payment as received. You can use the studio either way.</span></div>
    </div>`);
    sec('songs', `<div class="panel"><h3>My songs</h3><p class="hint">Songs you create stay in this browser. Play one here, or open it on the Arrange page with the studio tools.</p><div id="songList"></div></div>`);
    $('#createMood').innerHTML = C.MOODS.map(m => `<option${m === 'Happy' ? ' selected' : ''}>${m}</option>`).join('');
    $('#createGenre').innerHTML = C.GENRES.map(m => `<option${m === 'Pop' ? ' selected' : ''}>${m}</option>`).join('');
    $('#createKey').innerHTML = C.NOTE_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
    $('#createVoice').innerHTML = C.VOICES.map(v => `<option value="${v.id}">${esc(v.label)}</option>`).join('');
    $('#createGo').onclick = onCreate;
    VIEWS.create = function () {};
    VIEWS.songs = function () { renderLibrary(); };
    const _save = saveLocal;
    saveLocal = async function () {
      await _save();
      if (!P.songId) return;
      try {
        const rec = await LIB.get(P.songId);
        if (!rec) return;
        rec.packed = await packProject().arrayBuffer();
        rec.title = P.name || rec.title;
        rec.lyrics = P.lyrics || rec.lyrics;
        rec.updated = Date.now();
        await LIB.put(rec);
        renderLibrary();
      } catch (e) {}
    };
    if ($('#bSave')) $('#bSave').onclick = () => saveLocal();
    if ($('#pSave')) $('#pSave').onclick = () => saveLocal();
    fillPay();
    if (!DEMO && $('#sub')) $('#sub').textContent = 'Paste lyrics. The sung song is kept in My songs';
    showTab('create');
    renderLibrary();
  }

  mount();
  window.CBSongs = {
    create: createSong,
    play: playSong,
    open: openSong,
    list: () => LIB.list(),
    cart: () => C.readCart(localStorage),
    player: () => ({
      playing: !!AUD.playing,
      title: AUD.title || '',
      seconds: AUD.ctx ? Math.max(0, AUD.ctx.currentTime - AUD.t0) : 0,
      state: AUD.ctx ? AUD.ctx.state : '',
      duration: AUD.buf ? AUD.buf.duration : 0,
    }),
  };
})();
