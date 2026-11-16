/* Coffeebreak Vocal Studio - real tools and named presets from parameter grids. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CBVocalTools = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function product(lists, fn) {
    const out = [];
    function walk(i, acc) {
      if (i === lists.length) { fn(out, acc); return; }
      const list = lists[i];
      for (let k = 0; k < list.length; k++) walk(i + 1, acc.concat([list[k]]));
    }
    walk(0, []);
    return out;
  }

  function add(presets, tools, cat, tool, rows) {
    if (!tools.some(t => t.cat === cat && t.name === tool)) tools.push({ cat: cat, name: tool });
    for (let i = 0; i < rows.length; i++) presets.push(rows[i]);
  }

  function named(cat, tool, labels, params, tags) {
    return {
      id: cat + ':' + tool + ':' + labels.join('|'),
      name: tool + ': ' + labels.join(', '),
      cat: cat,
      tool: tool,
      params: params,
      tags: tags || []
    };
  }

  function build() {
    const presets = [];
    const tools = [];

    const rooms = [
      ['Booth', 0.55], ['Room', 0.9], ['Chamber', 1.15], ['Hall', 1.7],
      ['Church', 2.2], ['Plate', 1.35], ['Spring', 0.8], ['Dark hall', 1.9],
      ['Bright plate', 1.25], ['Outdoor', 0.7]
    ];
    const decays = [['0.6s', 0.6], ['1.0s', 1], ['1.6s', 1.6], ['2.2s', 2.2], ['3.0s', 3], ['4.5s', 4.5]];
    const mixes = [['8% mix', 0.08], ['16% mix', 0.16], ['28% mix', 0.28], ['40% mix', 0.4], ['55% mix', 0.55]];
    const tones = [['Dark', 0.55], ['Warm', 0.75], ['Neutral', 1], ['Bright', 1.25]];
    add(presets, tools, 'Effect', 'Reverb', product([rooms, decays, mixes, tones], function (out, a) {
      out.push(named('Effect', 'Reverb', [a[0][0], a[1][0], a[2][0], a[3][0]], { room: a[0][1], decay: a[1][1], mix: a[2][1], tone: a[3][1] }));
    }));

    const times = [['80ms slap', 0.08], ['120ms slap', 0.12], ['1/8', 0.25], ['dotted 1/8', 0.375], ['1/4', 0.5], ['dotted 1/4', 0.75], ['1/2', 1], ['dotted 1/2', 1.5]];
    const fbs = [['8% feedback', 0.08], ['18% feedback', 0.18], ['30% feedback', 0.3], ['45% feedback', 0.45], ['60% feedback', 0.6]];
    const dmix = [['12% mix', 0.12], ['22% mix', 0.22], ['35% mix', 0.35], ['50% mix', 0.5]];
    const dtones = [['Dark', 0.6], ['Neutral', 1], ['Bright', 1.3]];
    add(presets, tools, 'Effect', 'Delay', product([times, fbs, dmix, dtones], function (out, a) {
      out.push(named('Effect', 'Delay', [a[0][0], a[1][0], a[2][0], a[3][0]], { time: a[0][1], feedback: a[1][1], mix: a[2][1], tone: a[3][1] }));
    }));

    const shapes = [['High shelf', 'hs'], ['Low shelf', 'ls'], ['Presence', 'peak'], ['Air', 'air'], ['Cut mud', 'mud'], ['Warm body', 'body'], ['Smile', 'smile'], ['Telephone', 'tel']];
    const freqs = [['280 Hz', 280], ['400 Hz', 400], ['700 Hz', 700], ['1.2 kHz', 1200], ['2 kHz', 2000], ['3.5 kHz', 3500], ['5 kHz', 5000], ['8 kHz', 8000]];
    const gains = [['-6 dB', -6], ['-3 dB', -3], ['+1 dB', 1], ['+3 dB', 3], ['+5 dB', 5], ['+8 dB', 8]];
    add(presets, tools, 'Effect', 'EQ', product([shapes, freqs, gains], function (out, a) {
      out.push(named('Effect', 'EQ', [a[0][0], a[1][0], a[2][0]], { shape: a[0][1], freq: a[1][1], gain: a[2][1] }));
    }));

    const ths = [['-24 dB', -24], ['-18 dB', -18], ['-14 dB', -14], ['-10 dB', -10], ['-8 dB', -8], ['-6 dB', -6]];
    const ratios = [['1.5:1', 1.5], ['2:1', 2], ['3:1', 3], ['4:1', 4], ['8:1', 8]];
    const atks = [['3 ms attack', 0.003], ['10 ms attack', 0.01], ['30 ms attack', 0.03], ['80 ms attack', 0.08]];
    const rels = [['50 ms release', 0.05], ['120 ms release', 0.12], ['250 ms release', 0.25]];
    add(presets, tools, 'Effect', 'Compressor', product([ths, ratios, atks, rels], function (out, a) {
      out.push(named('Effect', 'Compressor', [a[0][0], a[1][0], a[2][0], a[3][0]], { thresh: a[0][1], ratio: a[1][1], attack: a[2][1], release: a[3][1] }));
    }));

    const rates = [['0.4 Hz', 0.4], ['0.8 Hz', 0.8], ['1.4 Hz', 1.4], ['2.2 Hz', 2.2], ['3.5 Hz', 3.5]];
    const depths = [['Light', 0.15], ['Medium', 0.3], ['Strong', 0.45], ['Wide', 0.6], ['Deep', 0.8]];
    const cmix = [['15% mix', 0.15], ['25% mix', 0.25], ['40% mix', 0.4], ['60% mix', 0.6]];
    const voices = [['2 voices', 2], ['3 voices', 3], ['4 voices', 4]];
    add(presets, tools, 'Effect', 'Chorus', product([rates, depths, cmix, voices], function (out, a) {
      out.push(named('Effect', 'Chorus', [a[0][0], a[1][0], a[2][0], a[3][0]], { rate: a[0][1], depth: a[1][1], mix: a[2][1], voices: a[3][1] }));
    }));

    const ddels = [['8 ms', 0.008], ['12 ms', 0.012], ['18 ms', 0.018], ['24 ms', 0.024], ['32 ms', 0.032], ['42 ms', 0.042]];
    const detunes = [['4 cents', 0.04], ['8 cents', 0.08], ['12 cents', 0.12], ['18 cents', 0.18], ['25 cents', 0.25]];
    const doMix = [['15% mix', 0.15], ['25% mix', 0.25], ['40% mix', 0.4], ['55% mix', 0.55]];
    add(presets, tools, 'Effect', 'Doubler', product([ddels, detunes, doMix], function (out, a) {
      out.push(named('Effect', 'Doubler', [a[0][0], a[1][0], a[2][0]], { delay: a[0][1], detune: a[1][1], mix: a[2][1] }));
    }));

    const essF = [['5 kHz', 5000], ['6.5 kHz', 6500], ['7.5 kHz', 7500], ['9 kHz', 9000], ['11 kHz', 11000]];
    const essA = [['-3 dB', 0.3], ['-5 dB', 0.45], ['-8 dB', 0.6], ['-10 dB', 0.72], ['-12 dB', 0.8], ['-16 dB', 0.9]];
    const essR = [['Narrow', 0.4], ['Medium', 0.7], ['Wide', 1.1], ['Full', 1.6]];
    add(presets, tools, 'Effect', 'De-esser', product([essF, essA, essR], function (out, a) {
      out.push(named('Effect', 'De-esser', [a[0][0], a[1][0], a[2][0]], { freq: a[0][1], amount: a[1][1], range: a[2][1] }));
    }));

    const drives = [['Soft', 1.4], ['Warm', 2.2], ['Present', 3.2], ['Driven', 4.5], ['Heavy', 6.5], ['Edge', 9]];
    const colors = [['Tape', 'tape'], ['Tube', 'tube'], ['Transformer', 'iron'], ['Bright', 'bright'], ['Dark', 'dark']];
    const smix = [['12% mix', 0.12], ['25% mix', 0.25], ['40% mix', 0.4], ['65% mix', 0.65]];
    add(presets, tools, 'Effect', 'Saturation', product([drives, colors, smix], function (out, a) {
      out.push(named('Effect', 'Saturation', [a[0][0], a[1][0], a[2][0]], { drive: a[0][1], color: a[1][1], mix: a[2][1] }));
    }));

    const widths = [['60%', 0.6], ['80%', 0.8], ['100%', 1], ['110%', 1.1], ['130%', 1.3], ['150%', 1.5], ['180%', 1.8], ['200%', 2]];
    const bass = [['Bass mono', 0], ['Bass tight', 0.35], ['Bass open', 0.7], ['Bass wide', 1]];
    const airs = [['Soft air', 0.2], ['Medium air', 0.5], ['Bright air', 0.85]];
    add(presets, tools, 'Effect', 'Width', product([widths, bass, airs], function (out, a) {
      out.push(named('Effect', 'Width', [a[0][0], a[1][0], a[2][0]], { width: a[0][1], bass: a[1][1], air: a[2][1] }));
    }));

    const trates = [['1.5 Hz', 1.5], ['3 Hz', 3], ['5 Hz', 5], ['7 Hz', 7], ['9 Hz', 9], ['12 Hz', 12]];
    const tdepths = [['Light', 0.12], ['Medium', 0.25], ['Strong', 0.4], ['Deep', 0.6], ['Full', 0.85]];
    const tshapes = [['Sine', 'sin'], ['Triangle', 'tri'], ['Square', 'sq'], ['Swing', 'swing']];
    add(presets, tools, 'Effect', 'Tremolo', product([trates, tdepths, tshapes], function (out, a) {
      out.push(named('Effect', 'Tremolo', [a[0][0], a[1][0], a[2][0]], { rate: a[0][1], depth: a[1][1], shape: a[2][1] }));
    }));

    const ftypes = [['Low-pass', 'lp'], ['High-pass', 'hp'], ['Band-pass', 'bp'], ['Notch', 'notch']];
    const cuts = [['200 Hz', 200], ['400 Hz', 400], ['800 Hz', 800], ['1.2 kHz', 1200], ['2 kHz', 2000], ['3.5 kHz', 3500], ['6 kHz', 6000], ['10 kHz', 10000]];
    const qs = [['Soft Q', 0.5], ['Natural Q', 0.8], ['Focused Q', 1.4], ['Sharp Q', 2.4], ['Peak Q', 4]];
    const fmix = [['25% mix', 0.25], ['50% mix', 0.5], ['100% mix', 1]];
    add(presets, tools, 'Effect', 'Filter', product([ftypes, cuts, qs, fmix], function (out, a) {
      out.push(named('Effect', 'Filter', [a[0][0], a[1][0], a[2][0], a[3][0]], { type: a[0][1], freq: a[1][1], q: a[2][1], mix: a[3][1] }));
    }));

    const gth = [['-40 dB', 0.01], ['-32 dB', 0.025], ['-26 dB', 0.05], ['-20 dB', 0.1], ['-14 dB', 0.2], ['-8 dB', 0.4]];
    const gat = [['1 ms attack', 0.001], ['5 ms attack', 0.005], ['15 ms attack', 0.015], ['40 ms attack', 0.04]];
    const grel = [['30 ms release', 0.03], ['80 ms release', 0.08], ['160 ms release', 0.16], ['300 ms release', 0.3]];
    add(presets, tools, 'Effect', 'Gate', product([gth, gat, grel], function (out, a) {
      out.push(named('Effect', 'Gate', [a[0][0], a[1][0], a[2][0]], { thresh: a[0][1], attack: a[1][1], release: a[2][1] }));
    }));

    const ceil = [['-1 dB', 0.89], ['-2 dB', 0.79], ['-3 dB', 0.71], ['-4 dB', 0.63], ['-6 dB', 0.5]];
    const lrel = [['40 ms release', 0.04], ['80 ms release', 0.08], ['160 ms release', 0.16], ['300 ms release', 0.3]];
    const ldrv = [['Clean', 1], ['+3 dB in', 1.4], ['+6 dB in', 2]];
    add(presets, tools, 'Effect', 'Limiter', product([ceil, lrel, ldrv], function (out, a) {
      out.push(named('Effect', 'Limiter', [a[0][0], a[1][0], a[2][0]], { ceiling: a[0][1], release: a[1][1], drive: a[2][1] }));
    }));

    const prates = [['0.2 Hz', 0.2], ['0.5 Hz', 0.5], ['1.0 Hz', 1], ['2.0 Hz', 2], ['4.0 Hz', 4]];
    add(presets, tools, 'Effect', 'Phaser', product([prates, depths, cmix], function (out, a) {
      out.push(named('Effect', 'Phaser', [a[0][0], a[1][0], a[2][0]], { rate: a[0][1], depth: a[1][1], mix: a[2][1] }));
    }));
    add(presets, tools, 'Effect', 'Flanger', product([prates, depths, cmix], function (out, a) {
      out.push(named('Effect', 'Flanger', [a[0][0], a[1][0], a[2][0]], { rate: a[0][1], depth: a[1][1], mix: a[2][1] }));
    }));

    const pits = [['-12 st', -12], ['-7 st', -7], ['-5 st', -5], ['-3 st', -3], ['-2 st', -2], ['-1 st', -1], ['-50 cents', -0.5], ['-25 cents', -0.25], ['+25 cents', 0.25], ['+50 cents', 0.5], ['+1 st', 1], ['+2 st', 2], ['+3 st', 3], ['+5 st', 5], ['+7 st', 7], ['+12 st', 12], ['+19 st', 19]];
    const pmix = [['20% mix', 0.2], ['40% mix', 0.4], ['70% mix', 0.7], ['100% mix', 1]];
    const pform = [['Formants follow', 1], ['Formants held', 0], ['Formants opposite', -0.4]];
    add(presets, tools, 'Effect', 'Pitch', product([pits, pmix, pform], function (out, a) {
      out.push(named('Effect', 'Pitch', [a[0][0], a[1][0], a[2][0]], { semis: a[0][1], mix: a[1][1], formant: a[2][1] }));
    }));

    const chars = [
      ['Warm', { formant: 0.94, vibrato: 0.9, breath: 0.85, scoop: 1, rd: 0.15, oq: 0.04 }],
      ['Bright', { formant: 1.08, vibrato: 1, breath: 0.9, scoop: 0.85, rd: -0.1, oq: -0.02 }],
      ['Dark', { formant: 0.88, vibrato: 0.85, breath: 0.8, scoop: 1.1, rd: 0.25, oq: 0.06 }],
      ['Soft', { formant: 0.98, vibrato: 0.7, breath: 1.15, scoop: 0.8, rd: 0.35, oq: 0.08 }],
      ['Belt', { formant: 1.04, vibrato: 1.15, breath: 0.7, scoop: 0.6, rd: -0.2, oq: -0.06 }],
      ['Airy', { formant: 1.06, vibrato: 0.8, breath: 1.55, scoop: 1, rd: 0.4, oq: 0.1 }],
      ['Close', { formant: 1.0, vibrato: 0.55, breath: 1.1, scoop: 0.7, rd: 0.05, oq: 0.02 }],
      ['Open', { formant: 1.02, vibrato: 1.05, breath: 1, scoop: 1.2, rd: 0, oq: 0.05 }]
    ];
    const vibs = [['Vibrato off', 0], ['Late gentle vibrato', 0.7], ['Late medium vibrato', 1], ['Late wide vibrato', 1.45], ['Early gentle vibrato', 0.8], ['Early wide vibrato', 1.35]];
    const breaths = [['Dry breath', 0.45], ['Light breath', 0.75], ['Medium breath', 1], ['Heavy breath', 1.4], ['Whisper breath', 1.85]];
    const weights = [['Light weight', -0.2], ['Natural weight', 0], ['Full weight', 0.2], ['Heavy weight', 0.4]];
    const regs = [['Low register', 0.94], ['Mid register', 1], ['Mid-high register', 1.035], ['High register', 1.07]];
    chars.forEach(function (ch) {
      add(presets, tools, 'Vocal style', ch[0], product([vibs, breaths, weights, regs], function (out, a) {
        const p = Object.assign({}, ch[1], { vibrato: ch[1].vibrato * a[0][1], breath: ch[1].breath * a[1][1], rd: ch[1].rd + a[2][1], formant: ch[1].formant * a[3][1] });
        if (a[0][0].indexOf('Early') === 0) p.scoop = (ch[1].scoop || 1) * 0.7;
        out.push(named('Vocal style', ch[0], [a[0][0], a[1][0], a[2][0], a[3][0]], p, [ch[0].toLowerCase(), 'voice']));
      }));
    });

    const fams = [['Pad', 'pad'], ['Keys', 'keys'], ['Bass', 'bass'], ['Bell', 'bell'], ['Organ', 'organ'], ['Pluck', 'pluck']];
    const waves = [['Sine', 'sine'], ['Triangle', 'tri'], ['Saw', 'saw'], ['Square', 'square'], ['Warm', 'warm']];
    const filts = [['Closed filter', 400], ['Soft filter', 900], ['Open filter', 1800], ['Bright filter', 3500], ['Air filter', 7000]];
    const envs = [['Short envelope', 0.18], ['Medium envelope', 0.45], ['Long envelope', 1.1], ['Swell envelope', 1.8]];
    const regsI = [['Low', 0], ['Mid', 12], ['High', 19]];
    fams.forEach(function (fam) {
      add(presets, tools, 'Instrument', fam[0], product([waves, filts, envs, regsI], function (out, a) {
        out.push(named('Instrument', fam[0], [a[0][0], a[1][0], a[2][0], a[3][0]], { family: fam[1], wave: a[0][1], cutoff: a[1][1], decay: a[2][1], trans: a[3][1] }, [fam[1]]));
      }));
    });

    const contours = [['Rising', 'rise'], ['Falling', 'fall'], ['Arch', 'arch'], ['Valley', 'valley'], ['Steps up', 'up'], ['Steps down', 'down'], ['Wave', 'wave'], ['Held then lift', 'lift']];
    const keys = [['C', 0], ['D', 2], ['E', 4], ['F', 5], ['G', 7], ['A', 9], ['Bb', 10], ['Eb', 3]];
    const ranges = [['Low range', 52], ['Mid range', 60], ['High range', 67], ['Wide range', 57]];
    const dens = [['Sparse', 0.7], ['Steady', 1], ['Busy', 1.35]];
    add(presets, tools, 'Generator', 'Melody', product([contours, keys, ranges, dens], function (out, a) {
      out.push(named('Generator', 'Melody', [a[0][0], a[1][0], a[2][0], a[3][0]], { contour: a[0][1], key: a[1][1], root: a[2][1], density: a[3][1] }));
    }));

    const ivals = [['Unison', 0], ['Third', 4], ['Fourth', 5], ['Fifth', 7], ['Sixth', 9], ['Octave', 12]];
    const voicings = [['Below', -1], ['Above', 1], ['Stacked', 2], ['Split', 0]];
    const rhythms = [['Straight', 1], ['Swung', 1.15], ['Long tones', 0.8]];
    add(presets, tools, 'Generator', 'Harmony', product([ivals, keys, voicings, rhythms], function (out, a) {
      out.push(named('Generator', 'Harmony', [a[0][0], a[1][0], a[2][0], a[3][0]], { interval: a[0][1], key: a[1][1], voicing: a[2][1], rhythm: a[3][1] }));
    }));

    const lens = [['Short phrase', 8], ['Medium phrase', 12], ['Long phrase', 16], ['Held phrase', 20], ['Spoken phrase', 10]];
    const feels = [['Even feel', 1], ['Laid back', 1.08], ['Pushed', 0.92], ['Rubato', 1.04]];
    const starts = [['On the beat', 0], ['Pickup', -0.12], ['Late entry', 0.12]];
    add(presets, tools, 'Generator', 'Phrase', product([lens, feels, starts, keys], function (out, a) {
      out.push(named('Generator', 'Phrase', [a[0][0], a[1][0], a[2][0], a[3][0]], { seconds: a[0][1], feel: a[1][1], start: a[2][1], key: a[3][1] }));
    }));

    const genres = [['Pop pulse', 'pop'], ['Folk pulse', 'folk'], ['Soul pulse', 'soul'], ['Country pulse', 'country'], ['Ballad pulse', 'ballad'], ['R and B pulse', 'rnb'], ['Lullaby pulse', 'lullaby'], ['Indie pulse', 'indie']];
    const tempos = [['72 BPM', 72], ['84 BPM', 84], ['96 BPM', 96], ['110 BPM', 110], ['120 BPM', 120], ['132 BPM', 132]];
    const feelB = [['Dry feel', 0.15], ['Warm feel', 0.35], ['Room feel', 0.5], ['Wide feel', 0.7]];
    add(presets, tools, 'Generator', 'Backing', product([genres, tempos, feelB], function (out, a) {
      out.push(named('Generator', 'Backing', [a[0][0], a[1][0], a[2][0]], { genre: a[0][1], bpm: a[1][1], feel: a[2][1] }));
    }));

    return { tools: tools, presets: presets };
  }

  let cache = null;
  function catalog() {
    if (!cache) cache = build();
    return cache;
  }

  function counts() {
    const c = catalog();
    const byCat = {};
    c.tools.forEach(function (t) { byCat[t.cat] = (byCat[t.cat] || 0) + 1; });
    const presetsByCat = {};
    c.presets.forEach(function (p) { presetsByCat[p.cat] = (presetsByCat[p.cat] || 0) + 1; });
    return { tools: c.tools.length, presets: c.presets.length, toolsByCat: byCat, presetsByCat: presetsByCat };
  }

  function search(query, cat) {
    const q = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    const list = catalog().presets;
    const hits = [];
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (cat && p.cat !== cat) continue;
      if (q.length) {
        const hay = (p.name + ' ' + p.cat + ' ' + p.tool + ' ' + (p.tags || []).join(' ')).toLowerCase();
        let ok = true;
        for (let k = 0; k < q.length; k++) if (hay.indexOf(q[k]) < 0) { ok = false; break; }
        if (!ok) continue;
      }
      hits.push(p);
    }
    return hits;
  }

  function peakOf(s) {
    let p = 0;
    for (let i = 0; i < s.length; i++) {
      const a = Math.abs(s[i]);
      if (a > p) p = a;
    }
    return p;
  }

  function biquad(type, freq, q, gainDb, sr) {
    const f0 = clamp(freq, 40, sr * 0.45);
    const w = 2 * Math.PI * f0 / sr;
    const cw = Math.cos(w), sw = Math.sin(w);
    const A = Math.pow(10, (gainDb || 0) / 40);
    const alpha = sw / (2 * Math.max(0.05, q || 0.7));
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
    else if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
    else if (type === 'bp') { b0 = alpha; b1 = 0; b2 = -alpha; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
    else if (type === 'notch') { b0 = 1; b1 = -2 * cw; b2 = 1; a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha; }
    else if (type === 'ls') { b0 = A * ((A + 1) - (A - 1) * cw + 2 * Math.sqrt(A) * alpha); b1 = 2 * A * ((A - 1) - (A + 1) * cw); b2 = A * ((A + 1) - (A - 1) * cw - 2 * Math.sqrt(A) * alpha); a0 = (A + 1) + (A - 1) * cw + 2 * Math.sqrt(A) * alpha; a1 = -2 * ((A - 1) + (A + 1) * cw); a2 = (A + 1) + (A - 1) * cw - 2 * Math.sqrt(A) * alpha; }
    else if (type === 'hs') { b0 = A * ((A + 1) + (A - 1) * cw + 2 * Math.sqrt(A) * alpha); b1 = -2 * A * ((A - 1) + (A + 1) * cw); b2 = A * ((A + 1) + (A - 1) * cw - 2 * Math.sqrt(A) * alpha); a0 = (A + 1) - (A - 1) * cw + 2 * Math.sqrt(A) * alpha; a1 = 2 * ((A - 1) - (A + 1) * cw); a2 = (A + 1) - (A - 1) * cw - 2 * Math.sqrt(A) * alpha; }
    else { b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A; a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A; }
    const c0 = b0 / a0, c1 = b1 / a0, c2 = b2 / a0, d1 = a1 / a0, d2 = a2 / a0;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return function (x) {
      const y = c0 * x + c1 * x1 + c2 * x2 - d1 * y1 - d2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      return y;
    };
  }

  function processMono(input, sr, preset) {
    const p = preset.params || {};
    const n = input.length;
    const out = new Float32Array(n);
    const tool = preset.tool;
    if (tool === 'EQ') {
      let type = 'peak', freq = p.freq, q = 0.9, gain = p.gain;
      if (p.shape === 'hs' || p.shape === 'air') { type = 'hs'; if (p.shape === 'air') freq = Math.max(freq, 6000); }
      else if (p.shape === 'ls' || p.shape === 'body') { type = 'ls'; if (p.shape === 'body') freq = Math.min(freq, 400); }
      else if (p.shape === 'mud') { type = 'peak'; freq = Math.min(freq, 400); gain = -Math.abs(gain); }
      else if (p.shape === 'smile') {
        const low = biquad('ls', 180, 0.7, Math.abs(gain) * 0.6, sr);
        const high = biquad('hs', 6000, 0.7, Math.abs(gain), sr);
        for (let i = 0; i < n; i++) out[i] = high(low(input[i]));
        return out;
      } else if (p.shape === 'tel') {
        const hp = biquad('hp', 600, 0.7, 0, sr);
        const lp = biquad('lp', 2800, 0.7, 0, sr);
        for (let i = 0; i < n; i++) out[i] = lp(hp(input[i]));
        return out;
      } else if (p.shape === 'presence') { type = 'peak'; freq = Math.max(2000, freq); q = 1.1; }
      const f = biquad(type, freq, q, gain, sr);
      for (let i = 0; i < n; i++) out[i] = f(input[i]);
      return out;
    }
    if (tool === 'Filter') {
      const f = biquad(p.type || 'lp', p.freq, p.q, 0, sr);
      const mix = p.mix == null ? 1 : p.mix;
      for (let i = 0; i < n; i++) out[i] = input[i] * (1 - mix) + f(input[i]) * mix;
      return out;
    }
    if (tool === 'De-esser') {
      const f = biquad('bp', p.freq, 1.2 / Math.max(0.3, p.range || 1), 0, sr);
      const amt = p.amount || 0.5;
      for (let i = 0; i < n; i++) {
        const band = f(input[i]);
        const red = 1 - amt * Math.min(1, Math.abs(band) * 4);
        out[i] = input[i] - band * (1 - red);
      }
      return out;
    }
    if (tool === 'Saturation') {
      const drv = p.drive || 2;
      const mix = p.mix == null ? 0.4 : p.mix;
      for (let i = 0; i < n; i++) {
        let x = input[i] * drv;
        let y = Math.tanh(x);
        if (p.color === 'bright') y = y + 0.12 * Math.tanh(x * 2);
        if (p.color === 'dark') y *= 0.92;
        out[i] = input[i] * (1 - mix) + y * mix * 0.85;
      }
      return out;
    }
    if (tool === 'Compressor' || tool === 'Limiter') {
      const thr = tool === 'Limiter' ? (p.ceiling || 0.89) : Math.pow(10, (p.thresh || -14) / 20);
      const ratio = tool === 'Limiter' ? 20 : (p.ratio || 3);
      const atk = Math.exp(-1 / (sr * (p.attack || (tool === 'Limiter' ? 0.003 : 0.01))));
      const rel = Math.exp(-1 / (sr * (p.release || 0.12)));
      const drive = p.drive || 1;
      let env = 0;
      for (let i = 0; i < n; i++) {
        const x = input[i] * drive;
        const a = Math.abs(x);
        env = a > env ? atk * env + (1 - atk) * a : rel * env + (1 - rel) * a;
        let g = 1;
        if (env > thr) g = (thr + (env - thr) / ratio) / env;
        out[i] = x * g;
      }
      if (tool === 'Limiter') {
        const ceil = p.ceiling || 0.89;
        const pk = peakOf(out) || 1;
        const s = Math.min(1, ceil / pk);
        for (let i = 0; i < n; i++) out[i] *= s;
      }
      return out;
    }
    if (tool === 'Gate') {
      const thr = p.thresh || 0.05;
      const atk = Math.exp(-1 / (sr * (p.attack || 0.005)));
      const rel = Math.exp(-1 / (sr * (p.release || 0.08)));
      let g = 0;
      for (let i = 0; i < n; i++) {
        const open = Math.abs(input[i]) > thr ? 1 : 0;
        g = open > g ? atk * g + (1 - atk) * open : rel * g + (1 - rel) * open;
        out[i] = input[i] * g;
      }
      return out;
    }
    if (tool === 'Tremolo') {
      const rate = p.rate || 5;
      const depth = p.depth || 0.3;
      for (let i = 0; i < n; i++) {
        const ph = i / sr * rate;
        let w = Math.sin(2 * Math.PI * ph);
        if (p.shape === 'tri') w = 1 - 4 * Math.abs((ph % 1) - 0.5);
        if (p.shape === 'sq') w = (ph % 1) < 0.5 ? 1 : -1;
        if (p.shape === 'swing') w = Math.sin(2 * Math.PI * ph) * 0.7 + Math.sin(4 * Math.PI * ph) * 0.3;
        out[i] = input[i] * (1 - depth * 0.5 * (1 - w));
      }
      return out;
    }
    if (tool === 'Delay' || tool === 'Reverb' || tool === 'Chorus' || tool === 'Doubler' || tool === 'Phaser' || tool === 'Flanger' || tool === 'Width' || tool === 'Pitch') {
      return processSpace(input, sr, preset);
    }
    for (let i = 0; i < n; i++) out[i] = input[i];
    return out;
  }

  function processSpace(input, sr, preset) {
    const p = preset.params || {};
    const n = input.length;
    const out = new Float32Array(n);
    const tool = preset.tool;
    const mix = p.mix == null ? 0.3 : p.mix;
    if (tool === 'Delay') {
      const d = Math.max(1, Math.round((p.time || 0.25) * sr));
      const fb = p.feedback || 0.2;
      const tone = p.tone || 1;
      const buf = new Float32Array(d);
      let bi = 0, lp = 0;
      for (let i = 0; i < n; i++) {
        let y = buf[bi];
        lp += (0.2 + 0.5 * (1 / tone)) * (y - lp);
        y = lp;
        buf[bi] = input[i] + y * fb;
        bi++; if (bi >= d) bi = 0;
        out[i] = input[i] * (1 - mix) + y * mix;
      }
      return out;
    }
    if (tool === 'Reverb') {
      const decay = p.decay || 1.6;
      const room = p.room || 1;
      const tone = p.tone || 1;
      const delays = [0.0297, 0.0371, 0.0411, 0.0437, 0.0313, 0.0393].map(t => Math.max(2, Math.round(t * room * sr)));
      const combs = delays.map(len => ({ buf: new Float32Array(len), i: 0, fb: Math.min(0.93, 0.62 + decay * 0.07), lp: 0 }));
      const ap = { buf: new Float32Array(Math.round(0.005 * sr)), i: 0, g: 0.7 };
      const damp = clamp(0.35 / tone, 0.08, 0.6);
      for (let i = 0; i < n; i++) {
        let acc = 0;
        for (let c = 0; c < combs.length; c++) {
          const cmb = combs[c];
          const y = cmb.buf[cmb.i];
          cmb.lp += damp * (y - cmb.lp);
          cmb.buf[cmb.i] = input[i] + cmb.lp * cmb.fb;
          cmb.i++; if (cmb.i >= cmb.buf.length) cmb.i = 0;
          acc += y;
        }
        acc /= combs.length;
        const d = ap.buf[ap.i];
        const y = -ap.g * acc + d;
        ap.buf[ap.i] = acc + ap.g * d;
        ap.i++; if (ap.i >= ap.buf.length) ap.i = 0;
        out[i] = input[i] * (1 - mix) + y * mix;
      }
      return out;
    }
    if (tool === 'Chorus' || tool === 'Doubler' || tool === 'Flanger') {
      const rate = p.rate || (tool === 'Doubler' ? 0.15 : 1.2);
      const depth = tool === 'Doubler' ? 0.002 : (0.002 + (p.depth || 0.3) * 0.004);
      const base = tool === 'Doubler' ? (p.delay || 0.018) : tool === 'Flanger' ? 0.003 : 0.012;
      const voices = tool === 'Chorus' ? (p.voices || 3) : 2;
      const maxD = Math.round((base + depth + 0.01) * sr) + 8;
      const buf = new Float32Array(maxD);
      let bi = 0;
      for (let i = 0; i < n; i++) {
        buf[bi] = input[i];
        let acc = 0;
        for (let v = 0; v < voices; v++) {
          const det = tool === 'Doubler' ? 1 + (p.detune || 0.1) * 0.01 * (v ? 1 : -1) : 1;
          const lfo = Math.sin(2 * Math.PI * rate * (i / sr) + v * 1.7);
          const del = (base * det + depth * lfo) * sr;
          let idx = bi - del;
          while (idx < 0) idx += maxD;
          const i0 = Math.floor(idx) % maxD;
          const i1 = (i0 + 1) % maxD;
          const f = idx - Math.floor(idx);
          acc += buf[i0] * (1 - f) + buf[i1] * f;
        }
        acc /= voices;
        bi = (bi + 1) % maxD;
        out[i] = input[i] * (1 - mix) + acc * mix;
      }
      return out;
    }
    if (tool === 'Phaser') {
      const stages = [0, 1, 2, 3].map(() => ({ x: 0, y: 0 }));
      const rate = p.rate || 0.5;
      const depth = p.depth || 0.4;
      for (let i = 0; i < n; i++) {
        const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * rate * i / sr);
        const freq = 200 + 1800 * (0.3 + depth * lfo);
        const w = 2 * Math.PI * freq / sr;
        const a = (1 - Math.sin(w)) / (1 + Math.sin(w) || 1);
        let x = input[i];
        for (let s = 0; s < stages.length; s++) {
          const st = stages[s];
          const y = -x + a * (x - st.y) + st.x;
          st.x = x; st.y = y; x = y;
        }
        out[i] = input[i] * (1 - mix) + x * mix;
      }
      return out;
    }
    if (tool === 'Width') {
      const width = p.width == null ? 1.3 : p.width;
      const lp = biquad('lp', 160, 0.7, 0, sr);
      for (let i = 0; i < n; i++) {
        const mid = input[i];
        const side = (input[i] - (i > 0 ? input[i - 1] : 0)) * 0.5 * width;
        const low = lp(mid) * (1 - (1 - (p.bass == null ? 0.35 : p.bass)) * 0.5);
        out[i] = (mid + side * 0.35 + low * 0.1) * (1 + (p.air || 0.3) * 0.08);
      }
      return out;
    }
    if (tool === 'Pitch') {
      const ratio = Math.pow(2, (p.semis || 0) / 12);
      const mixP = p.mix == null ? 1 : p.mix;
      for (let i = 0; i < n; i++) {
        const src = i / ratio;
        const i0 = Math.max(0, Math.min(n - 2, Math.floor(src)));
        const f = src - Math.floor(src);
        const y = input[i0] * (1 - f) + input[i0 + 1] * f;
        out[i] = input[i] * (1 - mixP) + y * mixP;
      }
      return out;
    }
    for (let i = 0; i < n; i++) out[i] = input[i];
    return out;
  }

  function applyEffect(samples, sr, preset) {
    const y = processMono(samples, sr, preset);
    const pk = peakOf(y);
    if (pk > 0.99) {
      const g = 0.95 / pk;
      for (let i = 0; i < y.length; i++) y[i] *= g;
    }
    return y;
  }

  function instrumentTone(preset, sr, seconds, hz) {
    sr = sr || 44100;
    seconds = seconds || 1.2;
    const p = preset.params || {};
    const n = Math.ceil(seconds * sr);
    const out = new Float32Array(n);
    const f0 = (hz || 220) * Math.pow(2, (p.trans || 0) / 12);
    const cut = p.cutoff || 1800;
    const dec = p.decay || 0.45;
    const filt = biquad('lp', cut, 0.8, 0, sr);
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      phase += f0 / sr;
      if (phase >= 1) phase -= 1;
      let s = 0;
      if (p.wave === 'sine') s = Math.sin(2 * Math.PI * phase);
      else if (p.wave === 'tri') s = 1 - 4 * Math.abs(phase - 0.5);
      else if (p.wave === 'square') s = phase < 0.5 ? 1 : -1;
      else if (p.wave === 'warm') s = Math.sin(2 * Math.PI * phase) + 0.35 * Math.sin(4 * Math.PI * phase);
      else s = 2 * phase - 1;
      if (p.family === 'bell') s = Math.sin(2 * Math.PI * phase) + 0.4 * Math.sin(2 * Math.PI * phase * 2.76);
      if (p.family === 'organ') s = Math.sin(2 * Math.PI * phase) + 0.5 * Math.sin(4 * Math.PI * phase) + 0.25 * Math.sin(6 * Math.PI * phase);
      if (p.family === 'bass') s = Math.sin(2 * Math.PI * phase * 0.5) + 0.3 * (2 * phase - 1);
      let env = Math.exp(-t / dec);
      if (p.family === 'pad' || (p.decay || 0) > 1) env = Math.min(1, t / 0.12) * Math.exp(-t / (dec * 1.4));
      if (p.family === 'pluck') env = Math.exp(-t / Math.max(0.08, dec * 0.5));
      if (p.family === 'keys') env = Math.min(1, t / 0.01) * Math.exp(-t / dec);
      out[i] = filt(s) * env * 0.35;
    }
    return out;
  }

  function melodyPitches(wordCount, preset) {
    const p = preset.params || {};
    const scale = [0, 2, 4, 5, 7, 9, 11];
    const key = p.key || 0;
    const root = p.root || 60;
    const notes = [];
    let deg = 7;
    for (let i = 0; i < Math.max(wordCount, 2); i++) {
      const u = wordCount > 1 ? i / (wordCount - 1) : 0;
      let step = 0;
      if (p.contour === 'rise') step = Math.round(u * 6);
      else if (p.contour === 'fall') step = Math.round((1 - u) * 6);
      else if (p.contour === 'arch') step = Math.round(Math.sin(Math.PI * u) * 6);
      else if (p.contour === 'valley') step = Math.round((1 - Math.sin(Math.PI * u)) * 5);
      else if (p.contour === 'up') step = Math.floor(i * 1.2) % 8;
      else if (p.contour === 'down') step = 7 - (Math.floor(i * 1.2) % 8);
      else if (p.contour === 'wave') step = Math.round(3 + 3 * Math.sin(i * 1.1));
      else step = Math.round(u * 3) + ((i % 4) === 3 ? 2 : 0);
      deg = clamp(step, 0, 14);
      const pitch = root + key + scale[deg % 7] + 12 * Math.floor(deg / 7);
      notes.push({ p: pitch, s: i / (p.density || 1), l: 1 / (p.density || 1), v: 0.8 });
    }
    return notes;
  }

  return {
    catalog: catalog,
    counts: counts,
    search: search,
    applyEffect: applyEffect,
    instrumentTone: instrumentTone,
    melodyPitches: melodyPitches,
    peakOf: peakOf
  };
});
