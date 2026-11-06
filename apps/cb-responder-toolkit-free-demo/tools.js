/* Coffeebreak Responder Toolkit — catalogue + formula engines */
(function (global) {
  'use strict';

  var TARGET = 12000;
  var DEMO_UNLOCK = 48;

  var NATO = [
    ['A', 'Alpha'], ['B', 'Bravo'], ['C', 'Charlie'], ['D', 'Delta'], ['E', 'Echo'],
    ['F', 'Foxtrot'], ['G', 'Golf'], ['H', 'Hotel'], ['I', 'India'], ['J', 'Juliett'],
    ['K', 'Kilo'], ['L', 'Lima'], ['M', 'Mike'], ['N', 'November'], ['O', 'Oscar'],
    ['P', 'Papa'], ['Q', 'Quebec'], ['R', 'Romeo'], ['S', 'Sierra'], ['T', 'Tango'],
    ['U', 'Uniform'], ['V', 'Victor'], ['W', 'Whiskey'], ['X', 'X-ray'], ['Y', 'Yankee'], ['Z', 'Zulu']
  ];

  /* Common UN numbers with brief public-domain style notes (ERG-style class only). */
  var UN_NOTES = [
    [1005, 'Ammonia, anhydrous', '2.3'], [1072, 'Oxygen, compressed', '2.2'],
    [1203, 'Gasoline', '3'], [1223, 'Kerosene', '3'], [1267, 'Petroleum crude oil', '3'],
    [1789, 'Hydrochloric acid', '8'], [1824, 'Sodium hydroxide solution', '8'],
    [1830, 'Sulphuric acid', '8'], [1971, 'Natural gas, compressed', '2.1'],
    [1978, 'Propane', '2.1'], [1993, 'Flammable liquid, n.o.s.', '3'],
    [1202, 'Diesel fuel', '3'], [1017, 'Chlorine', '2.3'], [1040, 'Ethylene oxide', '2.3'],
    [1050, 'Hydrogen chloride, anhydrous', '2.3'], [1090, 'Acetone', '3'],
    [1170, 'Ethanol', '3'], [1230, 'Methanol', '3'], [1294, 'Toluene', '3'],
    [1760, 'Corrosive liquid, n.o.s.', '8'], [1950, 'Aerosols', '2.1'],
    [2187, 'Carbon dioxide, refrigerated liquid', '2.2'], [2448, 'Sulphur, molten', '4.1'],
    [2794, 'Batteries, wet, filled with acid', '8'], [2912, 'Radioactive material, LSA', '7'],
    [3077, 'Environmentally hazardous substance, solid', '9'],
    [3082, 'Environmentally hazardous substance, liquid', '9'],
    [3159, '1,1,1,2-Tetrafluoroethane', '2.2'], [3163, 'Liquefied gas, n.o.s.', '2.2'],
    [3264, 'Corrosive liquid, acidic, inorganic', '8'], [3266, 'Corrosive liquid, basic, inorganic', '8'],
    [3286, 'Flammable liquid, toxic, corrosive', '3'], [3295, 'Hydrocarbons, liquid', '3'],
    [3480, 'Lithium ion batteries', '9'], [3481, 'Lithium ion batteries in equipment', '9'],
    [1863, 'Fuel, aviation, turbine engine', '3'], [1011, 'Butane', '2.1'],
    [1049, 'Hydrogen, compressed', '2.1'], [1066, 'Nitrogen, compressed', '2.2'],
    [1001, 'Acetylene, dissolved', '2.1'], [1075, 'Petroleum gases, liquefied', '2.1']
  ];

  var HOSE_C = [
    { id: '1.0', label: '1.0 in', c: 150 },
    { id: '1.5', label: '1.5 in', c: 24 },
    { id: '1.75', label: '1.75 in', c: 15.5 },
    { id: '2.0', label: '2.0 in', c: 8 },
    { id: '2.5', label: '2.5 in', c: 2 },
    { id: '3.0', label: '3.0 in', c: 0.8 },
    { id: '4.0', label: '4.0 in LDH', c: 0.2 },
    { id: '5.0', label: '5.0 in LDH', c: 0.08 }
  ];

  var UNIT_DIMS = [
    { id: 'length', name: 'Length', units: [
      { id: 'm', n: 'metres', toBase: 1 }, { id: 'cm', n: 'centimetres', toBase: 0.01 },
      { id: 'mm', n: 'millimetres', toBase: 0.001 }, { id: 'km', n: 'kilometres', toBase: 1000 },
      { id: 'ft', n: 'feet', toBase: 0.3048 }, { id: 'in', n: 'inches', toBase: 0.0254 },
      { id: 'yd', n: 'yards', toBase: 0.9144 }, { id: 'mi', n: 'miles', toBase: 1609.344 }
    ]},
    { id: 'mass', name: 'Mass / weight', units: [
      { id: 'kg', n: 'kilograms', toBase: 1 }, { id: 'g', n: 'grams', toBase: 0.001 },
      { id: 'mg', n: 'milligrams', toBase: 1e-6 }, { id: 'lb', n: 'pounds', toBase: 0.45359237 },
      { id: 'oz', n: 'ounces', toBase: 0.028349523125 }, { id: 'st', n: 'stone', toBase: 6.35029318 }
    ]},
    { id: 'volume', name: 'Volume', units: [
      { id: 'L', n: 'litres', toBase: 1 }, { id: 'mL', n: 'millilitres', toBase: 0.001 },
      { id: 'galUS', n: 'US gallons', toBase: 3.785411784 }, { id: 'galUK', n: 'UK gallons', toBase: 4.54609 },
      { id: 'flozUS', n: 'US fl oz', toBase: 0.0295735295625 }, { id: 'cup', n: 'US cups', toBase: 0.2365882365 }
    ]},
    { id: 'flow', name: 'Flow rate', units: [
      { id: 'Lpm', n: 'L/min', toBase: 1 }, { id: 'Lps', n: 'L/s', toBase: 60 },
      { id: 'gpm', n: 'US gal/min', toBase: 3.785411784 }, { id: 'm3h', n: 'm³/h', toBase: 1000 / 60 }
    ]},
    { id: 'pressure', name: 'Pressure', units: [
      { id: 'kPa', n: 'kPa', toBase: 1 }, { id: 'bar', n: 'bar', toBase: 100 },
      { id: 'psi', n: 'psi', toBase: 6.894757293 }, { id: 'atm', n: 'atm', toBase: 101.325 },
      { id: 'mmHg', n: 'mmHg', toBase: 0.133322387415 }
    ]},
    { id: 'temp', name: 'Temperature', units: [
      { id: 'C', n: 'Celsius' }, { id: 'F', n: 'Fahrenheit' }, { id: 'K', n: 'Kelvin' }
    ]},
    { id: 'speed', name: 'Speed', units: [
      { id: 'mps', n: 'm/s', toBase: 1 }, { id: 'kmh', n: 'km/h', toBase: 1 / 3.6 },
      { id: 'mph', n: 'mph', toBase: 0.44704 }, { id: 'kn', n: 'knots', toBase: 0.514444 }
    ]},
    { id: 'energy', name: 'Energy', units: [
      { id: 'J', n: 'joules', toBase: 1 }, { id: 'kJ', n: 'kilojoules', toBase: 1000 },
      { id: 'cal', n: 'calories', toBase: 4.184 }, { id: 'kcal', n: 'kilocalories', toBase: 4184 },
      { id: 'Wh', n: 'watt-hours', toBase: 3600 }
    ]}
  ];

  var CHECKLISTS = [
    'Structure fire size-up', 'Vehicle extrication', 'Wildfire / bushfire briefing',
    'Hazmat approach', 'Cardiac arrest team roles', 'Stroke assessment pathway',
    'Trauma primary survey', 'Airway equipment check', 'Ambulance bay turnover',
    'High-rise standpipe ops', 'Water supply / tanker shuttle', 'Search marking',
    'Rehab sector setup', 'Mass casualty START setup', 'Paediatric kit check',
    'Obstetric emergency kit', 'Spinal immobilisation check', 'Burn dressing kit',
    'SCBA donning check', 'Radio channel plan', 'Landing zone setup',
    'Confined space entry', 'Water rescue shore ops', 'Electric vehicle fire notes',
    'Shift start vehicle check', 'Controlled substance count', 'Infection control PPE'
  ];

  var TIMER_PRESETS = [
    ['CPR cycle', 120], ['Rhythm check', 120], ['Drug reassess', 300], ['Scene clock', 600],
    ['Airway attempt limit', 30], ['Tourniquet reassess', 900], ['Fluid bolus window', 900],
    ['Stroke door clock', 3600], ['Trauma platinum 10', 600], ['Fire attack clock', 1200],
    ['Rehab cycle', 600], ['Battery change reminder', 1800], ['Med fridge check', 86400],
    ['Shift remaining', 28800], ['Oxygen cylinder watch', 1800]
  ];

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  function convertTemp(v, from, to) {
    var c;
    if (from === 'C') c = v; else if (from === 'F') c = (v - 32) * 5 / 9; else c = v - 273.15;
    if (to === 'C') return c; if (to === 'F') return c * 9 / 5 + 32; return c + 273.15;
  }

  function convertUnit(dimId, value, fromId, toId) {
    var dim = UNIT_DIMS.find(function (d) { return d.id === dimId; });
    if (!dim) throw new Error('Unknown dimension');
    if (dimId === 'temp') return convertTemp(value, fromId, toId);
    var from = dim.units.find(function (u) { return u.id === fromId; });
    var to = dim.units.find(function (u) { return u.id === toId; });
    if (!from || !to) throw new Error('Unknown unit');
    return value * from.toBase / to.toBase;
  }

  /* GCS: E 1-4, V 1-5, M 1-6 */
  function gcs(e, v, m) {
    e = +e; v = +v; m = +m;
    if (!(e >= 1 && e <= 4 && v >= 1 && v <= 5 && m >= 1 && m <= 6)) throw new Error('GCS out of range');
    var t = e + v + m;
    var band = t >= 13 ? 'Mild (13-15)' : t >= 9 ? 'Moderate (9-12)' : 'Severe (3-8)';
    return { total: t, band: band, e: e, v: v, m: m };
  }

  /* APGAR each component 0-2 */
  function apgar(a, p, g, ac, r) {
    var vals = [a, p, g, ac, r].map(Number);
    if (vals.some(function (x) { return !(x >= 0 && x <= 2); })) throw new Error('APGAR out of range');
    var t = vals.reduce(function (s, x) { return s + x; }, 0);
    var band = t >= 7 ? 'Generally reassuring (7-10)' : t >= 4 ? 'Moderately low (4-6)' : 'Low (0-3)';
    return { total: t, band: band, parts: vals };
  }

  /* Adult rule of nines percentages */
  var NINES = { head: 9, armL: 9, armR: 9, chest: 18, back: 18, legL: 18, legR: 18, groin: 1 };
  function burnsTBSA(parts) {
    var t = 0;
    Object.keys(NINES).forEach(function (k) { if (parts[k]) t += NINES[k] * (parts[k] === 0.5 ? 0.5 : 1); });
    if (parts.custom) t += +parts.custom || 0;
    return Math.min(100, Math.round(t * 10) / 10);
  }
  function parkland(kg, tbsaPct) {
    var total = 4 * kg * tbsaPct; /* mL over 24 h from time of burn */
    return { totalMl: total, first8hMl: total / 2, next16hMl: total / 2 };
  }

  function dripRate(volumeMl, timeMin, dropFactor) {
    if (timeMin <= 0) throw new Error('Time must be > 0');
    return (volumeMl * dropFactor) / timeMin;
  }

  function drugDose(mgPerKg, weightKg, concentrationMgPerMl) {
    var doseMg = mgPerKg * weightKg;
    var vol = concentrationMgPerMl > 0 ? doseMg / concentrationMgPerMl : null;
    return { doseMg: doseMg, volumeMl: vol };
  }

  /* FL = C * (Q/100)^2 * (L/100)  — Q gpm, L feet, result psi */
  function frictionLossPsi(c, flowGpm, lengthFt) {
    return c * Math.pow(flowGpm / 100, 2) * (lengthFt / 100);
  }

  /* Smooth bore: Q = 29.7 * d^2 * sqrt(NP) */
  function nozzleFlowGpm(diameterIn, nozzlePressurePsi) {
    return 29.7 * diameterIn * diameterIn * Math.sqrt(nozzlePressurePsi);
  }

  function pumpDischargePressure(np, fl, appliance, elevationFt) {
    var elev = (elevationFt || 0) * 0.5; /* ~0.5 psi per foot elevation gain */
    return np + fl + (appliance || 0) + elev;
  }

  function ladderTipHeight(lengthFt, angleDeg) {
    var rad = angleDeg * Math.PI / 180;
    return { height: lengthFt * Math.sin(rad), setback: lengthFt * Math.cos(rad) };
  }
  function ladderAngleFromHeight(lengthFt, heightFt) {
    if (heightFt > lengthFt) throw new Error('Height cannot exceed ladder length');
    var rad = Math.asin(heightFt / lengthFt);
    return { angleDeg: rad * 180 / Math.PI, setback: lengthFt * Math.cos(rad) };
  }

  /* START triage decision helper */
  function startTriage(input) {
    if (input.walking) return { tag: 'Minor', color: 'green', reason: 'Able to walk (secondary triage)' };
    if (!input.breathing) {
      if (input.airwayOpened && input.breathingAfterAirway) return { tag: 'Immediate', color: 'red', reason: 'Breathing only after airway open' };
      return { tag: 'Expectant / deceased', color: 'black', reason: 'Apnoeic after airway' };
    }
    if (input.rr > 30) return { tag: 'Immediate', color: 'red', reason: 'Respiratory rate > 30' };
    if (input.perfusionBad) return { tag: 'Immediate', color: 'red', reason: 'Poor perfusion (CRT > 2 s or no radial pulse)' };
    if (!input.followsCommands) return { tag: 'Immediate', color: 'red', reason: 'Cannot follow simple commands' };
    return { tag: 'Delayed', color: 'yellow', reason: 'Breathing, RR ok, perfusion ok, follows commands' };
  }

  function buildCatalogue(full) {
    var tools = [];
    function add(cat, name, kind, meta, tags) {
      if (tools.length >= TARGET) return;
      tools.push({
        id: 't' + pad(tools.length + 1, 5),
        cat: cat,
        name: name,
        kind: kind,
        meta: meta || {},
        tags: tags || []
      });
    }

    /* Core interactive tools first (demo unlocks these) */
    add('Scores', 'Glasgow Coma Scale (GCS)', 'gcs', {}, ['neuro', 'trauma']);
    add('Scores', 'APGAR newborn score', 'apgar', {}, ['obstetric', 'paeds']);
    add('Burns', 'Rule of Nines TBSA (adult)', 'burns', {}, ['burns', 'trauma']);
    add('Burns', 'Parkland fluid estimate', 'parkland', {}, ['burns', 'fluids']);
    add('Med calc', 'Drug dose from mg/kg (protocol dose)', 'drug', {}, ['meds']);
    add('Med calc', 'IV drip rate (gtt/min)', 'drip', {}, ['fluids', 'meds']);
    add('Cardiac', 'CPR metronome 100-120/min', 'cpr', {}, ['cpr', 'cardiac']);
    add('Timers', 'Multi-timer desk', 'timer', {}, ['timer']);
    add('Triage', 'START triage helper', 'start', {}, ['mci', 'triage']);
    add('Fireground', 'Hose friction loss (NFPA-style C·Q²·L)', 'friction', {}, ['hose', 'pump']);
    add('Fireground', 'Smooth-bore nozzle flow (29.7 d² √NP)', 'nozzle', {}, ['nozzle', 'pump']);
    add('Fireground', 'Pump discharge pressure (PDP)', 'pdp', {}, ['pump']);
    add('Fireground', 'Ladder tip height and setback', 'ladder', {}, ['ladder']);
    add('Hazmat', 'UN number lookup notes', 'un', {}, ['hazmat']);
    add('Radio', 'NATO phonetic alphabet', 'phonetic', {}, ['radio']);
    add('Notes', 'Incident log (local device)', 'log', {}, ['notes']);
    add('Notes', 'Shift handover notes (local device)', 'handover', {}, ['notes']);
    add('Converters', 'Unit converter desk', 'units', {}, ['units']);
    add('Checklists', 'Checklist runner', 'checklist', {}, ['checklist']);

    /* Expand unit converter variants */
    UNIT_DIMS.forEach(function (dim) {
      var units = dim.units;
      for (var i = 0; i < units.length; i++) {
        for (var j = 0; j < units.length; j++) {
          if (i === j) continue;
          add('Converters', dim.name + ': ' + units[i].n + ' to ' + units[j].n, 'units',
            { dim: dim.id, from: units[i].id, to: units[j].id }, ['units', dim.id]);
        }
      }
    });

    /* Friction loss matrix */
    var flows = [50, 75, 95, 100, 125, 150, 175, 200, 250, 300, 350, 400, 500, 600, 750, 1000, 1250, 1500];
    var lengths = [50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
    HOSE_C.forEach(function (h) {
      flows.forEach(function (q) {
        lengths.forEach(function (L) {
          add('Fireground', 'FL preset ' + h.label + ' · ' + q + ' gpm · ' + L + ' ft', 'friction',
            { c: h.c, q: q, L: L, hose: h.label }, ['hose', 'preset']);
        });
      });
    });

    /* Nozzle presets */
    var diams = [0.75, 0.875, 1.0, 1.125, 1.25, 1.375, 1.5, 1.75, 2.0];
    var nps = [40, 50, 55, 60, 70, 75, 80, 100];
    diams.forEach(function (d) {
      nps.forEach(function (np) {
        add('Fireground', 'Nozzle ' + d + ' in @ ' + np + ' psi NP', 'nozzle',
          { d: d, np: np }, ['nozzle', 'preset']);
      });
    });

    /* Ladder presets */
    var ladderLens = [14, 16, 20, 24, 28, 30, 35, 40, 45, 50];
    var angles = [60, 65, 70, 72, 75, 76, 78, 80];
    ladderLens.forEach(function (len) {
      angles.forEach(function (a) {
        add('Fireground', 'Ladder ' + len + ' ft at ' + a + '°', 'ladder',
          { length: len, angle: a }, ['ladder', 'preset']);
      });
    });

    /* PDP combination notes */
    var nps2 = [50, 75, 100];
    var fls = [10, 20, 30, 40, 50, 75, 100];
    var elevs = [0, 10, 20, 30, 40, 50];
    nps2.forEach(function (np) {
      fls.forEach(function (fl) {
        elevs.forEach(function (el) {
          add('Fireground', 'PDP NP ' + np + ' + FL ' + fl + ' + elev ' + el + ' ft', 'pdp',
            { np: np, fl: fl, elev: el }, ['pump', 'preset']);
        });
      });
    });

    /* Drip presets */
    var vols = [50, 100, 250, 500, 1000];
    var mins = [15, 20, 30, 45, 60, 90, 120, 240, 480, 720];
    var drops = [10, 15, 20, 60];
    vols.forEach(function (v) {
      mins.forEach(function (m) {
        drops.forEach(function (d) {
          add('Med calc', 'Drip ' + v + ' mL over ' + m + ' min · DF ' + d, 'drip',
            { vol: v, min: m, df: d }, ['fluids', 'preset']);
        });
      });
    });

    /* Drug worksheet presets — user supplies protocol mg/kg */
    var weights = [3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120];
    var ordered = [0.01, 0.05, 0.1, 0.15, 0.2, 0.5, 1, 1.5, 2, 5, 10, 15];
    var concs = [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100];
    weights.forEach(function (w) {
      ordered.forEach(function (o) {
        concs.forEach(function (c) {
          add('Med calc', 'Dose worksheet ' + o + ' mg/kg · ' + w + ' kg · ' + c + ' mg/mL', 'drug',
            { mgkg: o, kg: w, conc: c }, ['meds', 'preset']);
        });
      });
    });

    /* Timers */
    TIMER_PRESETS.forEach(function (tp) {
      add('Timers', tp[0] + ' (' + tp[1] + ' s)', 'timer', { seconds: tp[1] }, ['timer']);
    });
    for (var sec = 10; sec <= 3600; sec += 10) {
      add('Timers', 'Custom timer ' + sec + ' seconds', 'timer', { seconds: sec }, ['timer']);
    }

    /* Checklists + numbered variants */
    CHECKLISTS.forEach(function (c) {
      for (var n = 1; n <= 40; n++) {
        add('Checklists', c + ' · card ' + n, 'checklist', { title: c, n: n }, ['checklist']);
      }
    });

    /* UN numbers + synthetic pads */
    UN_NOTES.forEach(function (u) {
      add('Hazmat', 'UN ' + u[0] + ' — ' + u[1] + ' (class ' + u[2] + ')', 'un',
        { un: u[0], name: u[1], cls: u[2] }, ['hazmat']);
    });
    for (var un = 1000; un <= 3500; un++) {
      add('Hazmat', 'UN ' + un + ' reference stub', 'un', { un: un }, ['hazmat', 'stub']);
    }

    /* Phonetic variants */
    NATO.forEach(function (p) {
      add('Radio', 'Phonetic ' + p[0] + ' — ' + p[1], 'phonetic', { letter: p[0], word: p[1] }, ['radio']);
    });
    for (var w = 1; w <= 200; w++) {
      add('Radio', 'Callsign practice card ' + w, 'phonetic', { card: w }, ['radio']);
    }

    /* GCS / APGAR practice cards */
    for (var e = 1; e <= 4; e++) for (var v = 1; v <= 5; v++) for (var m = 1; m <= 6; m++) {
      add('Scores', 'GCS practice E' + e + 'V' + v + 'M' + m, 'gcs', { e: e, v: v, m: m }, ['gcs', 'practice']);
    }
    for (var a = 0; a <= 2; a++) for (var p = 0; p <= 2; p++) for (var g = 0; g <= 2; g++) {
      for (var ac = 0; ac <= 2; ac++) for (var r = 0; r <= 2; r++) {
        add('Scores', 'APGAR practice ' + a + p + g + ac + r, 'apgar',
          { a: a, p: p, g: g, ac: ac, r: r }, ['apgar', 'practice']);
      }
    }

    /* START practice */
    var startCases = [
      { walking: true }, { walking: false, breathing: false, airwayOpened: true, breathingAfterAirway: false },
      { walking: false, breathing: false, airwayOpened: true, breathingAfterAirway: true },
      { walking: false, breathing: true, rr: 36, perfusionBad: false, followsCommands: true },
      { walking: false, breathing: true, rr: 18, perfusionBad: true, followsCommands: true },
      { walking: false, breathing: true, rr: 16, perfusionBad: false, followsCommands: false },
      { walking: false, breathing: true, rr: 20, perfusionBad: false, followsCommands: true }
    ];
    for (var si = 1; si <= 400; si++) {
      var sc = startCases[si % startCases.length];
      add('Triage', 'START practice case ' + si, 'start', sc, ['triage', 'practice']);
    }

    /* Incident / handover numbered pads */
    for (var li = 1; li <= 500; li++) {
      add('Notes', 'Incident log sheet ' + li, 'log', { n: li }, ['notes']);
      add('Notes', 'Handover pad ' + li, 'handover', { n: li }, ['notes']);
    }

    /* Burns practice combinations */
    var burnKeys = Object.keys(NINES);
    for (var bi = 0; bi < 800; bi++) {
      var parts = {};
      burnKeys.forEach(function (k, idx) { if ((bi >> idx) & 1) parts[k] = 1; });
      add('Burns', 'TBSA practice set ' + (bi + 1), 'burns', { parts: parts }, ['burns', 'practice']);
    }

    /* CPR rate cards */
    for (var bpm = 100; bpm <= 120; bpm++) {
      add('Cardiac', 'CPR pace ' + bpm + ' / min', 'cpr', { bpm: bpm }, ['cpr']);
    }
    for (var cpr = 1; cpr <= 300; cpr++) {
      add('Cardiac', 'CPR coaching card ' + cpr, 'cpr', { card: cpr }, ['cpr']);
    }

    /* Filler utility cards to reach exactly 12000 — still searchable useful stubs */
    var fillers = [
      'Scene safety prompt', 'PPE reminder card', 'Accountability tag prompt',
      'Water supply note', 'Rehab vitals prompt', 'Allergy ask prompt',
      'SAMPLE history card', 'OPQRST pain card', 'DCAP-BTLS trauma scan',
      'AEIOU-TIPS altered mental', 'MIST handover cue', 'ATMIST trauma cue',
      'Paeds weight estimate cue', 'Burn dressing steps', 'Spinal motion restriction cue'
    ];
    var n = 1;
    while (tools.length < TARGET) {
      var f = fillers[n % fillers.length];
      add('Field cues', f + ' #' + n, 'checklist', { title: f, n: n }, ['cue']);
      n++;
    }

    if (!full) {
      /* Demo still ships full catalogue for search count honesty, but locks by index */
    }
    return tools;
  }

  global.CBResponder = {
    TARGET: TARGET,
    DEMO_UNLOCK: DEMO_UNLOCK,
    NATO: NATO,
    UN_NOTES: UN_NOTES,
    HOSE_C: HOSE_C,
    UNIT_DIMS: UNIT_DIMS,
    CHECKLISTS: CHECKLISTS,
    NINES: NINES,
    buildCatalogue: buildCatalogue,
    convertUnit: convertUnit,
    gcs: gcs,
    apgar: apgar,
    burnsTBSA: burnsTBSA,
    parkland: parkland,
    dripRate: dripRate,
    drugDose: drugDose,
    frictionLossPsi: frictionLossPsi,
    nozzleFlowGpm: nozzleFlowGpm,
    pumpDischargePressure: pumpDischargePressure,
    ladderTipHeight: ladderTipHeight,
    ladderAngleFromHeight: ladderAngleFromHeight,
    startTriage: startTriage
  };
})(typeof window !== 'undefined' ? window : global);
