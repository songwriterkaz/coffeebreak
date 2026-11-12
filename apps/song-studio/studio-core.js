/* Coffeebreak Song Studio helpers. Browser global and CommonJS. No network calls. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CBSongStudio = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var PRODUCT_NAME = 'Coffeebreak Song Studio';
  var PRICE_AUD = '10.00';
  var CAPABILITY = {
    can: [
      'Write and edit lyrics on this page',
      'Suggest chords and a melody from the key you pick',
      'Play a short synthesized backing sketch in the browser',
      'Record a vocal with the microphone or import an audio file you already have',
      'Sing a synthesized guide vocal from the lyric and melody',
      'Open lyric sheets already stored in this copy, and play audio files already stored in this copy',
      'Run any of the 12,000 studio tools. Each one writes lyrics, chords, a melody, a vocal setting, or a mix',
      'Save the project in this browser and download a lyric sheet, a project file, and a WAV that includes the guide vocal'
    ],
    cannot: [
      'Replace your voice with a recorded human singer',
      'Create a full produced track the way a hosted music service does',
      'Call Suno or any other music service',
      'Mark the $10 licence as paid. Payment counts only after it is recorded from the bank'
    ]
  };
  var TOOL_TOTAL = 12000;
  var TOOL_CATS = [
    { id: 'vocal', name: 'Vocal style' },
    { id: 'lyric', name: 'Lyric line' },
    { id: 'chords', name: 'Chord move' },
    { id: 'melody', name: 'Melody shape' },
    { id: 'rhyme', name: 'Rhyme set' },
    { id: 'harmony', name: 'Harmony notes' },
    { id: 'mix', name: 'Mix balance' },
    { id: 'section', name: 'Section plan' },
    { id: 'tempo', name: 'Tempo feel' },
    { id: 'checklist', name: 'Vocal checklist' }
  ];
  var TOOL_PLACES = ['Coffee shop', 'Late night', 'Country road', 'Choir', 'Karaoke', 'Demo', 'Radio', 'Phone speaker', 'Headphones', 'Live room', 'Ballad', 'Dance floor'];
  var TOOL_MOODS = ['Country', 'Pop', 'Acoustic', 'Rock', 'Ballad', 'Gospel', 'Folk', 'Dance', 'Blues', 'Lo-fi'];
  var TOOL_STYLES = ['Classic', 'Bold', 'Warm', 'Minimal', 'Story', 'Soft', 'Bright', 'Close', 'Lyric led', 'Coffee break'];
  var MOOD_LINES = {
    Country: ['porch light', 'dusty road', 'old guitar'],
    Pop: ['neon night', 'heartbeat', 'golden hour'],
    Acoustic: ['open window', 'quiet room', 'paper heart'],
    Rock: ['thunder', 'broken chain', 'loud town'],
    Ballad: ['empty chair', 'last dance', 'held breath'],
    Gospel: ['morning light', 'grace', 'higher ground'],
    Folk: ['river stone', 'harbour wind', 'old letter'],
    Dance: ['strobe light', 'midnight floor', 'steady pulse'],
    Blues: ['rain on tin', 'midnight train', 'low voice'],
    'Lo-fi': ['rainy cafe', 'tape hiss', 'slow Sunday']
  };

  function scaleSteps(scale) {
    return scale === 'minor' ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  }

  function chordOf(key, scale, degree) {
    var steps = scaleSteps(scale);
    var d = ((Number(degree) % 7) + 7) % 7;
    var root = Number(key) + steps[d];
    var third = Number(key) + steps[(d + 2) % 7] + (d + 2 >= 7 ? 12 : 0);
    var fifth = Number(key) + steps[(d + 4) % 7] + (d + 4 >= 7 ? 12 : 0);
    var quality = (fifth - root + 12) % 12 === 6 ? 'dim' : ((third - root + 12) % 12 === 3 ? 'm' : '');
    return {
      name: NOTES[((root % 12) + 12) % 12] + quality,
      notes: [root, third, fifth]
    };
  }

  function progressionNames(key, scale, degrees) {
    return (degrees || []).map(function (degree) {
      return chordOf(key, scale, degree).name;
    });
  }

  function clampInt(value, min, max, fallback) {
    var n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    n = Math.round(n);
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  function cleanVocal(src) {
    var audio = resolveAudio(src);
    return audio.playable && String(src).indexOf('blob:') !== 0 && String(src).indexOf('..') === -1
      ? ''
      : (audio.playable ? String(src) : '');
  }

  function projectSnapshot(input) {
    input = input || {};
    var scale = input.scale === 'minor' ? 'minor' : 'major';
    var prog = [];
    var sourceProg = Array.isArray(input.prog) ? input.prog : [0, 4, 5, 3, 0, 4, 5, 3];
    for (var i = 0; i < 8; i++) prog.push(clampInt(sourceProg[i], 0, 6, 0));
    var mel = [];
    var sourceMel = Array.isArray(input.mel) ? input.mel : [];
    for (var m = 0; m < 16; m++) mel.push(clampInt(sourceMel[m], -1, 127, -1));
    return {
      title: String(input.title || '').slice(0, 120),
      lyr: String(input.lyr || '').slice(0, 20000),
      bpm: clampInt(input.bpm, 60, 180, 100),
      key: clampInt(input.key, 0, 11, 0),
      scale: scale,
      prog: prog,
      mel: mel,
      vocalSrc: cleanVocal(input.vocalSrc)
    };
  }

  function serializeProject(input) {
    return JSON.stringify(projectSnapshot(input));
  }

  function parseProject(text) {
    try {
      var raw = JSON.parse(text);
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, error: 'invalid project' };
      return { ok: true, project: projectSnapshot(raw) };
    } catch (err) {
      return { ok: false, error: 'invalid project' };
    }
  }

  function resolveAudio(src) {
    var value = String(src || '').trim();
    if (!value) return { playable: false, reason: 'No audio file is stored with this item in this copy.' };
    if (/suno\.ai|suno\.com/i.test(value)) return { playable: false, reason: 'This app does not call Suno.' };
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && value.indexOf('blob:') !== 0) {
      return { playable: false, reason: 'Only audio files from this copy or your device can play here.' };
    }
    if (value.indexOf('\\') >= 0 || value.indexOf('\0') >= 0) {
      return { playable: false, reason: 'That audio path cannot be used.' };
    }
    return { playable: true, src: value };
  }

  function listLibrary(audioTracks, lyricIndex, query) {
    var q = String(query || '').trim().toLowerCase();
    var audio = (audioTracks || []).filter(function (track) {
      if (!q) return true;
      return String(track.title || '').toLowerCase().indexOf(q) >= 0;
    });
    var lyrics = [];
    var note = 'Type at least 2 letters to search the lyric sheets already stored in this copy.';
    if (q.length >= 2) {
      note = '';
      lyrics = (lyricIndex || []).filter(function (entry) {
        return String(entry.title || '').toLowerCase().indexOf(q) >= 0;
      }).slice(0, 300);
    }
    return {
      audio: audio,
      lyrics: lyrics,
      lyricCount: (lyricIndex || []).length,
      note: note
    };
  }

  function lyricTitle(text) {
    var lines = String(text || '').split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\s+/g, ' ').trim();
      if (!line || /^\[.*\]$/.test(line)) continue;
      line = line.replace(/^[#*_>\s]+/, '').replace(/[*_]+/g, '').trim();
      if (!line) continue;
      return line.slice(0, 72);
    }
    return 'Untitled lyric sheet';
  }

  function licenceView(cartApi, previous) {
    var view = cartApi.catalogueCheckout([{
      id: 'song-studio',
      name: PRODUCT_NAME,
      amount: PRICE_AUD,
      qty: 1
    }], {
      currency: 'AUD',
      storeId: 'song-studio',
      fulfilmentVerified: true,
      previous: previous || null
    });
    return {
      ok: view.ok === true,
      price: PRICE_AUD,
      currency: 'AUD',
      paymentLabel: cartApi.PAYMENT_LABEL,
      payId: cartApi.PAYID,
      reference: view.reference || null,
      totalLabel: view.totalLabel || PRICE_AUD,
      requestsPayment: view.requestsPayment === true,
      showTransferInstructions: view.showTransferInstructions === true,
      paid: false,
      confirmed: false,
      unlocked: false,
      studioUsable: true,
      status: 'unpaid'
    };
  }

  function licenceStatusText(view) {
    var ref = view && view.reference ? ' Reference ' + view.reference + '.' : '';
    return 'Licence status on this page: unpaid. The studio tools still run here. A PayID transfer counts as paid only after it is recorded from the bank.' + ref;
  }

  function accessAfterClaim() {
    return { paid: false, unlocked: false, studioUsable: true, status: 'unpaid' };
  }

  function lyricSyllables(text) {
    var plain = String(text || '').replace(/\[[^\]]*\]/g, ' ');
    var words = plain.split(/[^A-Za-z']+/).filter(Boolean);
    var out = [];
    words.forEach(function (word) {
      var parts = word.match(/[^aeiouy]*[aeiouy]+[^aeiouy]*/gi);
      if (!parts || !parts.length) parts = [word];
      parts.forEach(function (part) {
        var found = part.match(/[aeiou]/i);
        out.push({ text: part, vowel: found ? found[0].toLowerCase() : 'a' });
      });
    });
    if (!out.length) out.push({ text: 'ah', vowel: 'a' });
    return out;
  }

  function defaultMelody(key, scale) {
    var steps = scaleSteps(scale);
    var base = 60 + clampInt(key, 0, 11, 0);
    var shape = [0, 2, 4, 2, 0, 4, 5, 4];
    var mel = [];
    for (var i = 0; i < 16; i++) mel.push(base + steps[shape[i % shape.length] % 7]);
    return mel;
  }

  function vocalScore(project) {
    project = project || {};
    var syls = lyricSyllables(project.lyr);
    var hasMelody = Array.isArray(project.mel) && project.mel.some(function (n) { return n > 0; });
    var mel = hasMelody ? project.mel : defaultMelody(project.key, project.scale);
    var bpm = clampInt(project.bpm, 60, 180, 100);
    var step = 60 / bpm / 4;
    var register = clampInt(project.vocalRegister, -12, 12, 0);
    var count = Math.max(syls.length, 8);
    if (count > 64) count = 64;
    var notes = [];
    var mi = 0;
    for (var i = 0; i < count; i++) {
      var guard = 0;
      var midi = -1;
      while (guard < mel.length) {
        var candidate = mel[mi % mel.length];
        mi += 1;
        guard += 1;
        if (candidate > 0) { midi = candidate; break; }
      }
      if (!(midi > 0)) midi = 60 + clampInt(project.key, 0, 11, 0);
      var syl = syls[i % syls.length];
      notes.push({
        t: Math.round(i * step * 1000) / 1000,
        dur: Math.round(step * 0.92 * 1000) / 1000,
        midi: midi + register,
        vowel: syl.vowel,
        text: syl.text
      });
    }
    return notes;
  }

  function toolAt(index) {
    var i = ((Number(index) % TOOL_TOTAL) + TOOL_TOTAL) % TOOL_TOTAL;
    var cat = TOOL_CATS[Math.floor(i / 1200)];
    var rest = i % 1200;
    var place = TOOL_PLACES[Math.floor(rest / 100)];
    var mood = TOOL_MOODS[Math.floor(rest / 10) % 10];
    var style = TOOL_STYLES[rest % 10];
    return {
      i: i,
      id: 'CB-' + String(i + 1).padStart(5, '0'),
      cat: cat.id,
      name: style + ' ' + mood + ' ' + cat.name + ' for ' + place,
      place: place,
      mood: mood,
      style: style
    };
  }

  function searchTools(query, limit) {
    var cap = clampInt(limit, 1, 60, 40);
    var words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    var items = [];
    for (var i = 0; i < TOOL_TOTAL && items.length < cap; i++) {
      var tool = toolAt(i);
      var hay = (tool.name + ' ' + tool.id + ' ' + tool.cat).toLowerCase();
      if (words.every(function (word) { return hay.indexOf(word) >= 0; })) items.push(tool);
    }
    return { total: TOOL_TOTAL, shown: items.length, items: items };
  }

  function pick(list, n) {
    return list[((n % list.length) + list.length) % list.length];
  }

  function runStudioTool(index, input) {
    input = input || {};
    var tool = toolAt(index);
    var title = String(input.title || 'Untitled').slice(0, 80);
    var key = clampInt(input.key, 0, 11, 0);
    var scale = input.scale === 'minor' ? 'minor' : 'major';
    var images = MOOD_LINES[tool.mood] || MOOD_LINES.Pop;
    var result = { id: tool.id, name: tool.name, cat: tool.cat, text: '' };
    if (tool.cat === 'vocal') {
      result.vocal = {
        on: true,
        register: tool.style === 'Bright' ? 12 : tool.style === 'Soft' || tool.style === 'Close' ? -12 : 0,
        vibrato: 4 + (tool.i % 5)
      };
      result.text = tool.name + '.\nRegister: ' + (result.vocal.register === 0 ? 'middle' : result.vocal.register > 0 ? 'high' : 'low') + '.\nVibrato: ' + result.vocal.vibrato + ' Hz.\nSing "' + title + '" for ' + tool.place + ' with a ' + tool.mood.toLowerCase() + ' tone.\nThis is a synthesized guide vocal, not a recorded singer.';
    } else if (tool.cat === 'lyric') {
      var line = 'The ' + images[0] + ' holds the ' + images[1] + ' while ' + title.toLowerCase() + ' stays in the ' + images[2];
      result.lyric = '[Verse]\n' + line + '\n[Chorus]\n' + title + '\n' + title + ' in the ' + tool.mood.toLowerCase() + ' light\n' + title;
      result.text = result.lyric;
    } else if (tool.cat === 'chords') {
      var shapes = [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 4, 0], [0, 2, 5, 4]];
      var shape = shapes[tool.i % shapes.length];
      result.prog = shape.concat(shape);
      result.text = tool.name + ' in ' + NOTES[key] + ' ' + scale + ': ' + progressionNames(key, scale, result.prog).join(' | ');
    } else if (tool.cat === 'melody') {
      var base = defaultMelody(key, scale);
      result.mel = base.map(function (n, i) { return i % 4 === 3 ? -1 : n + (tool.i % 2 ? 0 : (i % 8 === 0 ? 12 : 0)); });
      result.text = tool.name + ': ' + result.mel.map(function (n) { return n > 0 ? NOTES[((n % 12) + 12) % 12] : 'rest'; }).join(' ');
    } else if (tool.cat === 'rhyme') {
      var sets = [['light', 'night', 'right'], ['road', 'gold', 'hold'], ['heart', 'start', 'apart'], ['home', 'alone', 'stone'], ['rain', 'again', 'remain']];
      result.text = tool.name + '.\nRhymes: ' + pick(sets, tool.i).join(', ') + '.\nUse them on the ' + tool.place.toLowerCase() + ' line.';
    } else if (tool.cat === 'harmony') {
      result.text = tool.name + '.\nSing a third above the melody on the chorus, and stay on the chord root in the verse.\nPlace: ' + tool.place + '.';
    } else if (tool.cat === 'mix') {
      result.mix = { vocal: 1, melody: 0.45, chords: 0.6, bass: 0.8, drums: 0.75 };
      result.text = tool.name + '.\nVocal 100. Melody 45. Chords 60. Bass 80. Drums 75.\nChecked for ' + tool.place.toLowerCase() + '.';
    } else if (tool.cat === 'section') {
      result.text = tool.name + '.\nVerse, chorus, verse, chorus, bridge, chorus.\nSay "' + title + '" at the start and end of the chorus.';
    } else if (tool.cat === 'tempo') {
      result.bpm = 72 + (tool.i % 9) * 8;
      result.text = tool.name + '.\nTempo: ' + result.bpm + ' BPM for a ' + tool.mood.toLowerCase() + ' feel.';
    } else {
      result.text = tool.name + ' for "' + title + '".\n[ ] Lyric written\n[ ] Melody sung on the guide vocal\n[ ] Chords checked\n[ ] Vocal recorded or imported\n[ ] Mix exported\n[ ] Song saved on this device';
    }
    return result;
  }

  return {
    NOTES: NOTES,
    PRODUCT_NAME: PRODUCT_NAME,
    PRICE_AUD: PRICE_AUD,
    CAPABILITY: CAPABILITY,
    chordOf: chordOf,
    progressionNames: progressionNames,
    serializeProject: serializeProject,
    parseProject: parseProject,
    resolveAudio: resolveAudio,
    listLibrary: listLibrary,
    lyricTitle: lyricTitle,
    licenceView: licenceView,
    licenceStatusText: licenceStatusText,
    accessAfterClaim: accessAfterClaim,
    TOOL_TOTAL: TOOL_TOTAL,
    lyricSyllables: lyricSyllables,
    vocalScore: vocalScore,
    toolAt: toolAt,
    searchTools: searchTools,
    runStudioTool: runStudioTool
  };
});
