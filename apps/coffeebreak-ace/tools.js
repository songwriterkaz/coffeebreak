/* Coffeebreak Sung Song — 12,000 runnable music tools.
   Same shape as Song Studio: a generated catalogue, search, and run().
   Every index calculates a real result. Nothing here is a dead placeholder. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.CBSungTools = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var TOTAL = 12000;
  var PER = 1000;
  var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var CATS = [
    { id: 'transpose', name: 'Transpose' },
    { id: 'chord', name: 'Chord finder' },
    { id: 'scale', name: 'Scale finder' },
    { id: 'tempo', name: 'Tempo and delay' },
    { id: 'rhyme', name: 'Rhyme helper' },
    { id: 'syllable', name: 'Syllable helper' },
    { id: 'metronome', name: 'Metronome' },
    { id: 'eq', name: 'EQ and effects' },
    { id: 'tuner', name: 'Vocal tuner' },
    { id: 'structure', name: 'Song structure' },
    { id: 'style', name: 'Genre style' },
    { id: 'progression', name: 'Progression' }
  ];
  var MODES = [
    { name: 'Ionian', steps: [0, 2, 4, 5, 7, 9, 11] },
    { name: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10] },
    { name: 'Phrygian', steps: [0, 1, 3, 5, 7, 8, 10] },
    { name: 'Lydian', steps: [0, 2, 4, 6, 7, 9, 11] },
    { name: 'Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10] },
    { name: 'Aeolian', steps: [0, 2, 3, 5, 7, 8, 10] },
    { name: 'Locrian', steps: [0, 1, 3, 5, 6, 8, 10] }
  ];
  var EXTS = [
    { name: 'triad', add: [] },
    { name: '7th', add: [10] },
    { name: 'sus2', replace: [0, 2, 7] },
    { name: 'sus4', replace: [0, 5, 7] },
    { name: 'add9', add: [14] }
  ];
  var DIVS = [
    { name: 'quarter', beats: 1 },
    { name: 'eighth', beats: 0.5 },
    { name: 'sixteenth', beats: 0.25 },
    { name: 'dotted eighth', beats: 0.75 },
    { name: 'eighth triplet', beats: 1 / 3 },
    { name: 'half', beats: 2 }
  ];
  var RHYMES = [
    { end: 'ight', words: ['light', 'night', 'right', 'bright', 'sight', 'flight'] },
    { end: 'oad', words: ['road', 'load', 'showed', 'code', 'gold'] },
    { end: 'art', words: ['heart', 'start', 'apart', 'chart', 'dark'] },
    { end: 'ome', words: ['home', 'alone', 'stone', 'phone', 'roam'] },
    { end: 'ain', words: ['rain', 'again', 'remain', 'train', 'plain'] },
    { end: 'own', words: ['town', 'down', 'crown', 'sound', 'around'] },
    { end: 'ee', words: ['free', 'see', 'be', 'sea', 'me'] },
    { end: 'ay', words: ['day', 'way', 'stay', 'play', 'say'] },
    { end: 'all', words: ['call', 'fall', 'all', 'small', 'wall'] },
    { end: 'ine', words: ['line', 'time', 'mine', 'shine', 'fine'] },
    { end: 'ove', words: ['love', 'above', 'dove', 'enough', 'of'] },
    { end: 'ill', words: ['hill', 'still', 'will', 'fill', 'until'] },
    { end: 'ong', words: ['song', 'long', 'strong', 'along', 'belong'] },
    { end: 'ue', words: ['blue', 'true', 'you', 'new', 'through'] },
    { end: 'ar', words: ['star', 'far', 'are', 'car', 'heartache'] },
    { end: 'ow', words: ['flow', 'go', 'know', 'slow', 'window'] },
    { end: 'est', words: ['rest', 'best', 'west', 'chest', 'guest'] },
    { end: 'old', words: ['cold', 'hold', 'told', 'gold', 'bold'] },
    { end: 'ace', words: ['place', 'space', 'face', 'grace', 'embrace'] },
    { end: 'ear', words: ['hear', 'near', 'dear', 'clear', 'year'] }
  ];
  var WORDS = ['coffee', 'sunlight', 'highway', 'morning', 'river', 'golden', 'melody', 'silence', 'thunder', 'window', 'harbour', 'butter', 'firelight', 'open', 'under', 'beautiful', 'remember', 'holiday', 'electric', 'country', 'another', 'whisper', 'forever', 'little', 'people', 'music', 'yellow', 'orange', 'purple', 'silver', 'lonely', 'happy', 'sunday', 'monday', 'evening', 'kitchen', 'guitar', 'piano', 'drumbeat', 'chorus', 'verse', 'bridge', 'outro', 'intro', 'ballad', 'dancing', 'walking', 'singing', 'dreaming', 'falling'];
  var METERS = [2, 3, 4, 5, 6, 7];
  var BANDS = [
    { name: 'low shelf', type: 'lowshelf', freq: 120 },
    { name: 'low mid', type: 'peaking', freq: 400 },
    { name: 'presence', type: 'peaking', freq: 2500 },
    { name: 'air', type: 'highshelf', freq: 8000 }
  ];
  var GAINS = [-6, -3, -1, 1, 3, 6];
  var FORMS = [
    { name: 'Verse chorus', parts: [['Verse', 8], ['Chorus', 8], ['Verse', 8], ['Chorus', 8], ['Bridge', 8], ['Chorus', 8]] },
    { name: 'Intro verse', parts: [['Intro', 4], ['Verse', 8], ['Chorus', 8], ['Verse', 8], ['Chorus', 8], ['Outro', 4]] },
    { name: 'AABA', parts: [['A', 8], ['A', 8], ['B', 8], ['A', 8]] },
    { name: 'Short pop', parts: [['Verse', 8], ['Pre', 4], ['Chorus', 8], ['Chorus', 8]] },
    { name: 'Ballad', parts: [['Verse', 8], ['Verse', 8], ['Chorus', 8], ['Bridge', 4], ['Chorus', 8]] }
  ];
  var GENRES = ['bright pop', 'country', 'rock', 'jazz', 'blues', 'folk', 'house', 'techno', 'hip hop', 'lo-fi', 'reggae', 'funk', 'ballad', 'gospel', 'soul', 'disco', 'bossa', 'drum and bass', 'rockabilly', 'acoustic'];
  var MOODS = ['happy', 'sad', 'dreamy', 'dark', 'bouncy', 'warm', 'quiet', 'epic'];
  var VOICES = ['clear sung vocal', 'close synth voice', 'bright chorus vocal', 'soft low vocal', 'airy high vocal'];
  var PROGS = [
    { name: 'I-V-vi-IV', degrees: [0, 4, 5, 3] },
    { name: 'I-vi-IV-V', degrees: [0, 5, 3, 4] },
    { name: 'vi-IV-I-V', degrees: [5, 3, 0, 4] },
    { name: 'I-IV-V', degrees: [0, 3, 4, 4] },
    { name: 'ii-V-I', degrees: [1, 4, 0, 0] },
    { name: 'i-VI-III-VII', degrees: [0, 5, 2, 6] },
    { name: 'Andalusian', degrees: [0, 6, 5, 4] },
    { name: '12 bar blues', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4] }
  ];

  function pad(n) {
    n = String(n);
    while (n.length < 5) n = '0' + n;
    return n;
  }

  function pcName(midi) {
    var n = ((midi % 12) + 12) % 12;
    var oct = Math.floor(midi / 12) - 1;
    return NOTES[n] + oct;
  }

  function modeSteps(modeIndex, minorHint) {
    return MODES[((modeIndex % MODES.length) + MODES.length) % MODES.length].steps;
  }

  function chordIntervals(key, modeIndex, degree, extIndex) {
    var steps = modeSteps(modeIndex);
    var ext = EXTS[extIndex % EXTS.length];
    var intervals;
    if (ext.replace) intervals = ext.replace.slice();
    else {
      intervals = [0, 2, 4].map(function (k) {
        var idx = degree + k;
        var span = steps[idx % 7] + 12 * Math.floor(idx / 7) - steps[degree % 7] - 12 * Math.floor(degree / 7);
        return (span + 24) % 24;
      });
      (ext.add || []).forEach(function (add) { intervals.push(add); });
    }
    var root = (key % 12) + steps[degree % 7];
    return { root: root, intervals: intervals, ext: ext.name, mode: MODES[modeIndex % MODES.length].name };
  }

  function chordLabel(key, modeIndex, degree, extIndex) {
    var chord = chordIntervals(key, modeIndex, degree, extIndex);
    var names = chord.intervals.map(function (iv) { return NOTES[(chord.root + iv) % 12]; });
    var third = chord.intervals[1];
    var quality = chord.ext === 'triad' ? (third === 3 ? 'm' : third === 4 ? '' : '') : ' ' + chord.ext;
    if (chord.ext === 'sus2' || chord.ext === 'sus4' || chord.ext === 'add9' || chord.ext === '7th') {
      quality = chord.ext === '7th' && third === 3 ? 'm7' : chord.ext === '7th' ? '7' : chord.ext;
      if (chord.ext !== '7th') quality = chord.ext;
    }
    return { name: NOTES[chord.root % 12] + (chord.ext === 'triad' && third === 3 ? 'm' : chord.ext === 'triad' ? '' : quality), notes: names, root: chord.root };
  }

  function syllablesOf(word) {
    var w = String(word || '').toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return [String(word || '')];
    var parts = w.match(/[^aeiouy]*[aeiouy]+[^aeiouy]*/g) || [w];
    if (parts.length > 1 && parts[parts.length - 1] === 'e') parts[parts.length - 2] += parts.pop();
    return parts;
  }

  function toolAt(index) {
    var i = ((Number(index) % TOTAL) + TOTAL) % TOTAL;
    var cat = CATS[Math.floor(i / PER)];
    var n = i % PER;
    return {
      i: i,
      n: n,
      id: 'CB-' + pad(i + 1),
      cat: cat.id,
      catName: cat.name,
      name: titleFor(cat, n, i)
    };
  }

  function titleFor(cat, n, i) {
    if (cat.id === 'transpose') return 'Transpose ' + pcName(48 + (n % 36)) + ' toward ' + NOTES[Math.floor(n / 12) % 12];
    if (cat.id === 'chord') return NOTES[n % 12] + ' ' + MODES[Math.floor(n / 12) % 7].name + ' degree ' + ((Math.floor(n / 84) % 7) + 1) + ' ' + EXTS[Math.floor(n / 588) % 5].name;
    if (cat.id === 'scale') return NOTES[n % 12] + ' ' + MODES[Math.floor(n / 12) % 7].name + ' from step ' + ((Math.floor(n / 84) % 7) + 1);
    if (cat.id === 'tempo') return (40 + (n % 161)) + ' BPM ' + DIVS[Math.floor(n / 161) % DIVS.length].name + ' delay';
    if (cat.id === 'rhyme') {
      var fam = RHYMES[n % RHYMES.length];
      return 'Rhymes for ' + fam.words[n % fam.words.length];
    }
    if (cat.id === 'syllable') return 'Syllables in ' + WORDS[n % WORDS.length];
    if (cat.id === 'metronome') return 'Metronome ' + (60 + (n % 120)) + ' BPM in ' + METERS[n % METERS.length];
    if (cat.id === 'eq') return BANDS[n % BANDS.length].name + ' ' + GAINS[Math.floor(n / 4) % GAINS.length] + ' dB';
    if (cat.id === 'tuner') return 'Tune ' + (100 + (n % 400)) + ' Hz toward ' + NOTES[n % 12] + ' ' + MODES[Math.floor(n / 12) % 7].name;
    if (cat.id === 'structure') return FORMS[n % FORMS.length].name + ' at ' + (70 + (n % 90)) + ' BPM';
    if (cat.id === 'style') return GENRES[n % GENRES.length] + ' ' + MOODS[Math.floor(n / 20) % MOODS.length] + ' style';
    var prog = PROGS[n % PROGS.length];
    return prog.name + ' in ' + NOTES[Math.floor(n / PROGS.length) % 12] + (n % 2 ? ' minor' : ' major');
  }

  function run(tool) {
    if (typeof tool === 'number') tool = toolAt(tool);
    var n = tool.n;
    var text = '';
    var proof = null;
    var action = null;
    if (tool.cat === 'transpose') {
      var from = 48 + (n % 36);
      var toward = Math.floor(n / 12) % 12;
      var semi = (toward - (from % 12) + 12) % 12;
      if (n % 2 === 1 && semi !== 0) semi -= 12;
      var to = from + semi;
      text = pcName(from) + ' moves ' + semi + ' semitones to ' + pcName(to) + ', the nearest spelling toward ' + NOTES[toward] + '.';
      proof = { from: from, to: to, semitones: semi };
    } else if (tool.cat === 'chord') {
      var key = n % 12;
      var mode = Math.floor(n / 12) % 7;
      var degree = Math.floor(n / 84) % 7;
      var ext = Math.floor(n / 588) % 5;
      var chord = chordLabel(key, mode, degree, ext);
      text = NOTES[key] + ' ' + MODES[mode].name + ' degree ' + (degree + 1) + ' is ' + chord.name + ': ' + chord.notes.join(' ') + '.';
      proof = { notes: chord.notes, name: chord.name };
    } else if (tool.cat === 'scale') {
      var skey = n % 12;
      var smode = Math.floor(n / 12) % 7;
      var start = Math.floor(n / 84) % 7;
      var steps = MODES[smode].steps;
      var names = [];
      for (var s = 0; s < 7; s++) names.push(NOTES[(skey + steps[(start + s) % 7]) % 12]);
      text = NOTES[skey] + ' ' + MODES[smode].name + ' from step ' + (start + 1) + ': ' + names.join(' ') + '.';
      proof = { notes: names };
    } else if (tool.cat === 'tempo') {
      var bpm = 40 + (n % 161);
      var div = DIVS[Math.floor(n / 161) % DIVS.length];
      var ms = Math.round(60000 / bpm * div.beats * 100) / 100;
      text = div.name + ' note at ' + bpm + ' BPM lasts ' + ms + ' ms.';
      proof = { bpm: bpm, beats: div.beats, ms: ms };
      action = { type: 'tempo', bpm: bpm };
    } else if (tool.cat === 'rhyme') {
      var fam = RHYMES[n % RHYMES.length];
      var word = fam.words[n % fam.words.length];
      var rhymes = fam.words.filter(function (w) { return w !== word; });
      text = 'Rhymes for ' + word + ': ' + rhymes.join(', ') + '. They share the ' + fam.end + ' ending.';
      proof = { word: word, rhymes: rhymes, end: fam.end };
    } else if (tool.cat === 'syllable') {
      var word = WORDS[n % WORDS.length];
      var parts = syllablesOf(word);
      text = word + ' has ' + parts.length + ' syllable' + (parts.length === 1 ? '' : 's') + ': ' + parts.join('-') + '.';
      proof = { word: word, syllables: parts, count: parts.length };
    } else if (tool.cat === 'metronome') {
      var mbpm = 60 + (n % 120);
      var beats = METERS[n % METERS.length];
      var step = 60 / mbpm;
      var clicks = [];
      for (var b = 0; b < beats; b++) clicks.push(Math.round(b * step * 1000) / 1000);
      text = 'Metronome at ' + mbpm + ' BPM, ' + beats + ' beats. Clicks at ' + clicks.join(', ') + ' seconds.';
      proof = { bpm: mbpm, beats: beats, clicks: clicks };
      action = { type: 'metronome', bpm: mbpm, beats: beats };
    } else if (tool.cat === 'eq') {
      var band = BANDS[n % BANDS.length];
      var gain = GAINS[Math.floor(n / BANDS.length) % GAINS.length];
      var q = 0.7 + (n % 5) * 0.2;
      text = band.name + ' at ' + band.freq + ' Hz, ' + gain + ' dB, Q ' + q + '. Apply it to the current song, or play a filtered preview.';
      proof = { frequency: band.freq, gain: gain, q: q, type: band.type };
      action = { type: 'eq', frequency: band.freq, gain: gain, q: q, filter: band.type };
    } else if (tool.cat === 'tuner') {
      var hz = 100 + (n % 400);
      var tkey = n % 12;
      var tmode = Math.floor(n / 12) % 7;
      var midi = Math.round(69 + 12 * Math.log(hz / 440) / Math.LN2);
      var steps = MODES[tmode].steps;
      var best = midi;
      var bestD = 99;
      for (var d = -6; d <= 6; d++) {
        var cand = midi + d;
        if (steps.indexOf(((cand - tkey) % 12 + 12) % 12) >= 0 && Math.abs(d) < bestD) {
          best = cand;
          bestD = Math.abs(d);
        }
      }
      var target = 440 * Math.pow(2, (best - 69) / 12);
      var cents = Math.round(1200 * Math.log(hz / target) / Math.LN2);
      text = hz + ' Hz is ' + cents + ' cents from ' + pcName(best) + ' in ' + NOTES[tkey] + ' ' + MODES[tmode].name + '. Target ' + Math.round(target) + ' Hz.';
      proof = { hz: hz, target: Math.round(target * 10) / 10, cents: cents, midi: best };
      action = { type: 'tone', hz: target };
    } else if (tool.cat === 'structure') {
      var form = FORMS[n % FORMS.length];
      var sbpm = 70 + (n % 90);
      var bar = 4 * 60 / sbpm;
      var t = 0;
      var rows = form.parts.map(function (part) {
        var secs = Math.round(part[1] * bar * 10) / 10;
        var row = part[0] + ' ' + part[1] + ' bars, from ' + t.toFixed(1) + 's for ' + secs + 's';
        t += secs;
        return row;
      });
      var totalSec = Math.round(t);
      text = form.name + ' at ' + sbpm + ' BPM lasts about ' + totalSec + ' seconds. ' + rows.join('. ') + '.';
      proof = { bpm: sbpm, seconds: totalSec, sections: form.parts.length };
      action = { type: 'seconds', seconds: Math.max(10, Math.min(120, totalSec)) };
    } else if (tool.cat === 'style') {
      var genre = GENRES[n % GENRES.length];
      var mood = MOODS[Math.floor(n / GENRES.length) % MOODS.length];
      var voice = VOICES[Math.floor(n / 40) % VOICES.length];
      var bpm = 80 + (n % 60);
      var style = genre + ', ' + mood + ', ' + voice + ', ' + bpm + ' BPM, drums, bass and chords';
      text = 'Style: ' + style + '.';
      proof = { style: style, bpm: bpm };
      action = { type: 'style', style: style };
    } else {
      var prog = PROGS[n % PROGS.length];
      var pkey = Math.floor(n / PROGS.length) % 12;
      var minor = n % 2 === 1;
      var modeIndex = minor ? 5 : 0;
      var names = prog.degrees.map(function (degree) {
        return chordLabel(pkey, modeIndex, degree % 7, 0).name;
      });
      text = prog.name + ' in ' + NOTES[pkey] + (minor ? ' minor' : ' major') + ': ' + names.join(' | ') + '.';
      proof = { chords: names };
      action = { type: 'style-add', style: names.join(' ') };
    }
    return {
      id: tool.id,
      name: tool.name,
      cat: tool.cat,
      text: text,
      proof: proof,
      action: action
    };
  }

  function search(query, cat, limit) {
    var cap = Math.max(1, Math.min(80, limit || 40));
    var words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    var items = [];
    var matched = 0;
    for (var i = 0; i < TOTAL; i++) {
      var tool = toolAt(i);
      if (cat && cat !== 'all' && tool.cat !== cat) continue;
      if (words.length) {
        var hay = (tool.name + ' ' + tool.id + ' ' + tool.catName + ' ' + tool.cat).toLowerCase();
        if (!words.every(function (word) { return hay.indexOf(word) >= 0; })) continue;
      }
      if (items.length < cap) items.push(tool);
      matched++;
    }
    return { total: TOTAL, matched: matched, items: items };
  }

  return {
    TOTAL: TOTAL,
    CATS: CATS,
    NOTES: NOTES,
    toolAt: toolAt,
    run: run,
    search: search,
    syllablesOf: syllablesOf
  };
});
