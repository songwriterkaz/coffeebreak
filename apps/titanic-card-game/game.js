/* Coffeebreak Titanic Card Game
   A respectful card game about the night of 14-15 April 1912.
   Engine is exported as CBTitanic so the rules can be tested in Node. */
(function (root) {
  'use strict';

  var OFFICERS = ['Captain Edward Smith', 'William Murdoch', 'Charles Lightoller', 'Herbert Pitman', 'Joseph Boxhall', 'Harold Lowe'];
  var AI_NAMES = ["Lightoller's Mate", 'Purser', 'Steward'];
  var MAX_CLOCK = 16;
  var HAND_LIMIT = 8;
  var START_HAND = 5;
  var EVENT_CHAIN = 3;
  var HS_KEY = 'cb-titanic-card-best';

  function card(name, fact, type, extra) {
    var c = { t: type, n: name, f: fact, id: type + ':' + name + ':' + Math.random().toString(36).slice(2, 8) };
    if (extra) Object.keys(extra).forEach(function (k) { c[k] = extra[k]; });
    return c;
  }

  function rooms() {
    return [
      card('Boat Deck', "The highest deck, holding the lifeboats, the gymnasium and the officers' quarters.", 'Room'),
      card('Grand Staircase', 'Oak panelling and a wrought-iron and glass dome lit the forward First Class staircase.', 'Room'),
      card('Dining Saloon', 'On D Deck, the First Class Dining Saloon was the largest room afloat at the time, seating over 500.', 'Room'),
      card('Café Parisien', 'A First Class café on B Deck styled like a Paris sidewalk café, with trellis walls.', 'Room'),
      card('Swimming Bath', 'Titanic had one of the first swimming pools on an ocean liner, on F Deck.', 'Room'),
      card('Turkish Bath', 'Decorated in an Arabian style with tiled walls and bronze lamps.', 'Room'),
      card('Marconi Room', "The wireless room sent distress calls CQD and SOS, reaching Carpathia about 58 miles away.", 'Room'),
      card('Bridge', 'The ship was steered from the wheelhouse behind the open bridge on the Boat Deck.', 'Room'),
      card('Boiler Rooms', '29 boilers with 159 furnaces made steam for the engines.', 'Room'),
      card('Third Class General Room', 'A pine-panelled common room on C Deck where Third Class passengers gathered and sang.', 'Room')
    ];
  }

  function crew() {
    return [
      card('Captain Edward Smith', "Commander of Titanic and White Star Line's senior captain. He went down with his ship.", 'Crew'),
      card('William Murdoch', 'First Officer, on watch at the collision. He ordered "hard a-starboard" and helped load boats until the end.', 'Crew'),
      card('Charles Lightoller', 'Second Officer. He loaded boats on the port side and was the most senior officer to survive.', 'Crew'),
      card('Herbert Pitman', 'Third Officer. He was placed in command of Lifeboat 5.', 'Crew'),
      card('Joseph Boxhall', 'Fourth Officer. He fired distress rockets and commanded Lifeboat 2.', 'Crew'),
      card('Harold Lowe', 'Fifth Officer. He took Lifeboat 14 back to search for survivors in the water.', 'Crew'),
      card('Jack Phillips', 'Senior wireless operator. He kept sending distress calls until power failed and did not survive.', 'Crew'),
      card('Frederick Fleet', "Lookout in the crow's nest who spotted the iceberg and rang the bell three times.", 'Crew'),
      card('Thomas Andrews', 'Shipbuilder from Harland & Wolff who designed Titanic. He helped passengers to the boats.', 'Crew'),
      card('Wallace Hartley', 'Bandleader. The musicians played to keep people calm; none of the band survived.', 'Crew')
    ];
  }

  function passengers() {
    var list = [];
    var i;
    for (i = 0; i < 7; i++) list.push(card('First Class passenger', 'About 324 First Class passengers were aboard. The most expensive suites cost over £800.', 'Passenger'));
    for (i = 0; i < 7; i++) list.push(card('Second Class passenger', 'About 284 Second Class passengers sailed, many of them teachers, clergy and tradespeople.', 'Passenger'));
    for (i = 0; i < 9; i++) list.push(card('Third Class passenger', 'About 709 people travelled Third Class, many emigrating to America from across Europe.', 'Passenger'));
    list.push(card('Child passenger', 'The order "women and children first" was followed by officers loading the boats.', 'Passenger', { child: 1 }));
    list.push(card('Child passenger', 'Around 109 children were on board.', 'Passenger', { child: 1 }));
    list.push(card('Millvina Dean', 'Third Class, aged 2 months, the youngest passenger. She survived and was the last living survivor until 2009.', 'Passenger', { child: 1 }));
    list.push(card('Margaret "Molly" Brown', 'First Class. In Lifeboat 6 she urged the crew to go back for survivors.', 'Passenger'));
    list.push(card('Lawrence Beesley', 'Second Class science teacher who survived in Lifeboat 13 and wrote a book about the night.', 'Passenger'));
    return list;
  }

  function boats() {
    var nums = [1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15, 16];
    return nums.map(function (n) {
      return card('Lifeboat ' + n, 'Titanic carried 20 lifeboats with room for about 1,178 people, far fewer than the 2,200 aboard.', 'Lifeboat');
    });
  }

  function events() {
    return [
      card('Iceberg warning', 'Titanic received several ice warnings by wireless on 14 April 1912. The clock moves forward 10 minutes.', 'Event'),
      card('Iceberg warning', "The Californian's warning was cut off by a busy operator. The clock moves forward 10 minutes.", 'Event'),
      card('Distress rockets', 'Boxhall fired white rockets into the night. Draw 1 extra card.', 'Event'),
      card('CQD and SOS', 'Phillips and Bride called for help by wireless. Draw 1 extra card.', 'Event'),
      card('Carpathia turns', 'Captain Rostron raced Carpathia toward Titanic. Every player draws 1 card.', 'Event'),
      card('Lifeboat launch', 'The first lifeboat, No. 7, was lowered about 12:45 am. Draw a Lifeboat card if one is in the deck.', 'Event')
    ];
  }

  function buildDeck() {
    var r = rooms();
    var d = r.concat(r.map(function (x) { return card(x.n, x.f, x.t); }));
    return d.concat(crew(), passengers(), boats(), events());
  }

  function rngShuffle(a, rng) {
    var i, j, t;
    rng = rng || Math.random;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(rng() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function clockLabel(c) {
    var m = 40 + Math.min(c, MAX_CLOCK) * 10;
    var h = 11 + Math.floor(m / 60);
    m = m % 60;
    var hour12 = ((h - 1) % 12) + 1;
    var ap = h >= 12 ? ' am' : ' pm';
    return hour12 + ':' + String(m).padStart(2, '0') + ap;
  }

  function isOfficer(c) {
    return c && c.t === 'Crew' && OFFICERS.indexOf(c.n) >= 0;
  }

  function launchScore(passList) {
    return passList.reduce(function (s, c) { return s + 2 + (c.child ? 1 : 0); }, 0);
  }

  function canLaunch(cs) {
    if (!cs || !cs.length) return false;
    var b = cs.filter(function (c) { return c.t === 'Lifeboat'; });
    var o = cs.filter(isOfficer);
    var ps = cs.filter(function (c) { return c.t === 'Passenger'; });
    return b.length === 1 && o.length === 1 && ps.length >= 1 && ps.length <= 4 && cs.length === 2 + ps.length;
  }

  function canSet(cs) {
    if (!cs || cs.length !== 3) return false;
    var t = cs[0].t;
    if (t !== 'Room' && t !== 'Crew') return false;
    if (!cs.every(function (c) { return c.t === t; })) return false;
    return new Set(cs.map(function (c) { return c.n; })).size === 3;
  }

  function hintFor(cs) {
    if (!cs || !cs.length) return 'Select a Lifeboat, an officer and 1 to 4 passengers to launch, or 3 different rooms or crew to lay a set.';
    if (canLaunch(cs)) return 'Ready to launch this lifeboat.';
    if (canSet(cs)) return 'Ready to lay this set for 4 points.';
    var b = cs.filter(function (c) { return c.t === 'Lifeboat'; }).length;
    var o = cs.filter(isOfficer).length;
    var ps = cs.filter(function (c) { return c.t === 'Passenger'; }).length;
    var roomsN = cs.filter(function (c) { return c.t === 'Room'; }).length;
    var crewN = cs.filter(function (c) { return c.t === 'Crew'; }).length;
    if (b > 1) return 'A launch uses only one lifeboat.';
    if (o > 1) return 'A launch uses only one officer.';
    if (ps > 4) return 'A lifeboat can take up to 4 passenger cards.';
    if (b || o || ps) {
      var need = [];
      if (!b) need.push('a Lifeboat');
      if (!o) need.push('an officer (Smith, Murdoch, Lightoller, Pitman, Boxhall or Lowe)');
      if (!ps) need.push('at least one passenger');
      if (cs.length !== b + o + ps) return 'Launch selections can only be a lifeboat, an officer and passengers.';
      if (need.length) return 'To launch, you still need ' + need.join(' and ') + '.';
    }
    if (roomsN && roomsN < 3) return 'A room set needs 3 different rooms.';
    if (crewN && crewN < 3) return 'A crew set needs 3 different crew cards.';
    return 'That mix of cards is not a launch or a set.';
  }

  function cloneCards(arr) {
    return (arr || []).map(function (c) {
      var o = { t: c.t, n: c.n, f: c.f, id: c.id };
      if (c.child) o.child = c.child;
      if (c.sel) o.sel = true;
      return o;
    });
  }

  function newPlayer(name, ai) {
    return { name: name, h: [], s: 0, ai: ai ? 1 : 0, saved: 0, children: 0, sets: 0 };
  }

  function refillDeck(state) {
    if (state.deck.length) return;
    if (!state.disc.length) return;
    state.deck = rngShuffle(state.disc, state.rng);
    state.disc = [];
  }

  function drawOne(state, p, depth) {
    depth = depth || 0;
    refillDeck(state);
    var c = state.deck.pop();
    if (!c) return null;
    if (c.t === 'Event') {
      state.disc.push(c);
      log(state, p.name + ' drew event ' + c.n + ': ' + c.f);
      resolveEvent(state, p, c, depth);
      return c;
    }
    p.h.push(c);
    return c;
  }

  function resolveEvent(state, p, c, depth) {
    if (state.over) return;
    if (c.n === 'Iceberg warning') {
      state.clock += 1;
      log(state, 'The clock moves to ' + clockLabel(state.clock) + '.');
      if (state.clock >= MAX_CLOCK) endGame(state);
      return;
    }
    if (depth >= EVENT_CHAIN) {
      log(state, 'The night is too busy for another event to take effect.');
      return;
    }
    if (c.n === 'Carpathia turns') {
      state.P.forEach(function (q) { if (!state.over) drawOne(state, q, depth + 1); });
      return;
    }
    if (c.n === 'Lifeboat launch') {
      var i = -1;
      for (var k = state.deck.length - 1; k >= 0; k--) {
        if (state.deck[k].t === 'Lifeboat') { i = k; break; }
      }
      if (i >= 0) {
        p.h.push(state.deck.splice(i, 1)[0]);
        log(state, p.name + ' took a Lifeboat from the deck.');
      } else {
        log(state, 'No Lifeboat was left in the deck.');
      }
      return;
    }
    drawOne(state, p, depth + 1);
  }

  function log(state, s) {
    state.log.unshift(s);
    if (state.log.length > 80) state.log.pop();
  }

  function removeCards(p, cs) {
    p.h = p.h.filter(function (c) { return cs.indexOf(c) < 0; });
    cs.forEach(function (c) { delete c.sel; });
  }

  function doLaunch(state, p, cs) {
    if (!canLaunch(cs)) return false;
    var ps = cs.filter(function (c) { return c.t === 'Passenger'; });
    var pts = launchScore(ps);
    var kids = ps.filter(function (c) { return c.child; }).length;
    p.s += pts;
    p.saved += ps.length;
    p.children += kids;
    removeCards(p, cs);
    cs.forEach(function (c) { state.disc.push(c); });
    var b = cs.find(function (c) { return c.t === 'Lifeboat'; });
    var o = cs.find(isOfficer);
    log(state, p.name + ' launched ' + b.n + ' with ' + o.n + ', saving ' + ps.length + ' passenger' + (ps.length > 1 ? 's' : '') + (kids ? ' including ' + kids + ' child card' + (kids > 1 ? 's' : '') : '') + ' (+' + pts + ').');
    return true;
  }

  function doSet(state, p, cs) {
    if (!canSet(cs)) return false;
    p.s += 4;
    p.sets += 1;
    removeCards(p, cs);
    cs.forEach(function (c) { state.disc.push(c); });
    log(state, p.name + ' laid a set of ' + (cs[0].t === 'Room' ? 'ship rooms' : 'crew') + ': ' + cs.map(function (c) { return c.n; }).join(', ') + ' (+4).');
    return true;
  }

  function discardToLimit(state, p) {
    while (p.h.length > HAND_LIMIT) {
      var i = 0;
      if (p.ai) {
        i = p.h.findIndex(function (c) { return c.t === 'Room'; });
        if (i < 0) i = 0;
      }
      var c = p.h.splice(i, 1)[0];
      delete c.sel;
      state.disc.push(c);
      log(state, p.name + ' discarded ' + c.n + ' to stay at 8 cards.');
    }
  }

  function snapshot(state) {
    return {
      hand: cloneCards(state.P[0].h),
      s: state.P[0].s,
      saved: state.P[0].saved,
      children: state.P[0].children,
      sets: state.P[0].sets,
      disc: cloneCards(state.disc),
      deck: cloneCards(state.deck),
      clock: state.clock,
      log: state.log.slice(),
      over: state.over
    };
  }

  function restore(state, snap) {
    if (!snap) return;
    state.P[0].h = cloneCards(snap.hand);
    state.P[0].s = snap.s;
    state.P[0].saved = snap.saved;
    state.P[0].children = snap.children;
    state.P[0].sets = snap.sets;
    state.disc = cloneCards(snap.disc);
    state.deck = cloneCards(snap.deck);
    state.clock = snap.clock;
    state.log = snap.log.slice();
    state.over = snap.over;
  }

  function dealNonEvent(state) {
    refillDeck(state);
    var skipped = [];
    var c = null;
    var guard = 0;
    while (state.deck.length && guard++ < 200) {
      c = state.deck.pop();
      if (c.t !== 'Event') break;
      skipped.push(c);
      c = null;
    }
    if (skipped.length) state.deck = skipped.concat(state.deck);
    return c;
  }

  function startGame(numAI, rng) {
    numAI = Math.max(1, Math.min(3, numAI | 0));
    var state = {
      P: [newPlayer('You', 0)],
      deck: rngShuffle(buildDeck(), rng),
      disc: [],
      clock: 0,
      turn: 0,
      over: 0,
      log: [],
      snap: null,
      winner: null,
      rng: rng || Math.random
    };
    var i;
    for (i = 0; i < numAI; i++) state.P.push(newPlayer(AI_NAMES[i], 1));
    state.P.forEach(function (p) {
      var n = 0, c, guard = 0;
      while (n < START_HAND && guard++ < 200) {
        c = dealNonEvent(state);
        if (!c) break;
        p.h.push(c);
        n++;
      }
    });
    log(state, '11:40 pm, 14 April 1912: Titanic strikes an iceberg in the North Atlantic.');
    return state;
  }

  function beginTurn(state) {
    if (state.over) return state;
    if (state.clock >= MAX_CLOCK) return endGame(state);
    var p = state.P[state.turn];
    p.h.forEach(function (c) { delete c.sel; });
    drawOne(state, p, 0);
    if (state.over) return state;
    drawOne(state, p, 0);
    if (state.over) return state;
    if (!p.ai) state.snap = snapshot(state);
    return state;
  }

  function finishTurn(state) {
    if (state.over) return state;
    var p = state.P[state.turn];
    p.h.forEach(function (c) { delete c.sel; });
    discardToLimit(state, p);
    state.turn = (state.turn + 1) % state.P.length;
    if (state.turn === 0) {
      state.clock += 1;
      if (state.clock >= MAX_CLOCK) return endGame(state);
    }
    return beginTurn(state);
  }

  function endGame(state) {
    if (state.over) return state;
    state.over = 1;
    var ranked = state.P.slice().sort(function (a, b) { return b.s - a.s || b.saved - a.saved; });
    state.winner = ranked[0];
    var tie = ranked.length > 1 && ranked[0].s === ranked[1].s;
    log(state, '2:20 am, 15 April 1912: Titanic sank. Carpathia arrived about 4 am and rescued about 710 survivors. More than 1,500 people were lost.');
    if (tie) log(state, 'The night ends in a tie on ' + ranked[0].s + ' points.');
    else log(state, ranked[0].name + (ranked[0].name === 'You' ? ' win' : ' wins') + ' with ' + ranked[0].s + ' points.');
    return state;
  }

  function uniqueByName(arr) {
    var seen = {}, out = [];
    arr.forEach(function (c) {
      if (!seen[c.n]) { seen[c.n] = 1; out.push(c); }
    });
    return out;
  }

  function aiPlay(state) {
    var p = state.P[state.turn];
    if (!p || !p.ai || state.over) return state;
    var safety = 0;
    var did = true;
    while (did && safety++ < 12) {
      did = false;
      var b = p.h.find(function (c) { return c.t === 'Lifeboat'; });
      var o = p.h.find(isOfficer);
      var ps = p.h.filter(function (c) { return c.t === 'Passenger'; }).sort(function (a, b) { return (b.child ? 1 : 0) - (a.child ? 1 : 0); }).slice(0, 4);
      if (b && o && ps.length) {
        doLaunch(state, p, [b, o].concat(ps));
        did = true;
        continue;
      }
      var rs = uniqueByName(p.h.filter(function (c) { return c.t === 'Room'; }));
      if (rs.length >= 3) { doSet(state, p, rs.slice(0, 3)); did = true; continue; }
      var cr = uniqueByName(p.h.filter(function (c) { return c.t === 'Crew' && !isOfficer(c); }));
      if (cr.length >= 3) { doSet(state, p, cr.slice(0, 3)); did = true; }
    }
    return finishTurn(state);
  }

  var Engine = {
    OFFICERS: OFFICERS,
    MAX_CLOCK: MAX_CLOCK,
    HAND_LIMIT: HAND_LIMIT,
    buildDeck: buildDeck,
    shuffle: rngShuffle,
    clockLabel: clockLabel,
    isOfficer: isOfficer,
    launchScore: launchScore,
    canLaunch: canLaunch,
    canSet: canSet,
    hintFor: hintFor,
    startGame: startGame,
    beginTurn: beginTurn,
    finishTurn: finishTurn,
    doLaunch: doLaunch,
    doSet: doSet,
    aiPlay: aiPlay,
    snapshot: snapshot,
    restore: restore,
    endGame: endGame
  };

  root.CBTitanic = Engine;
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;

  /* ---------- Browser UI ---------- */
  if (typeof document === 'undefined') return;

  var $ = function (id) { return document.getElementById(id); };
  var S = null;
  var muted = false;
  var audioCtx = null;

  function tone(freq, dur, type, gain) {
    if (muted) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.value = gain || 0.03;
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + dur);
    } catch (e) {}
  }

  function selected() { return S ? S.P[0].h.filter(function (c) { return c.sel; }) : []; }

  function myTurn() { return S && !S.over && S.turn === 0; }

  function saveBest() {
    if (!S || !S.over) return;
    try {
      var prev = parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0;
      if (S.P[0].s > prev) localStorage.setItem(HS_KEY, String(S.P[0].s));
    } catch (e) {}
  }

  function bestScore() {
    try { return parseInt(localStorage.getItem(HS_KEY) || '0', 10) || 0; } catch (e) { return 0; }
  }

  function render() {
    if (!S) return;
    var clockEl = $('clock');
    var sunk = S.clock >= MAX_CLOCK || S.over;
    clockEl.textContent = clockLabel(Math.min(S.clock, MAX_CLOCK)) + (sunk ? '  (sunk)' : '');
    $('dk').textContent = String(S.deck.length);
    $('track').innerHTML = Array.from({ length: MAX_CLOCK }, function (_, i) {
      return '<i class="' + (i < S.clock ? 'd' : '') + '"></i>';
    }).join('');
    $('opp').innerHTML = S.P.slice(1).map(function (p, i) {
      var on = !S.over && S.turn === i + 1;
      return '<div class="' + (on ? 'on' : '') + '"><b>' + p.name + '</b><span>Score ' + p.s + ' · ' + p.h.length + ' cards · saved ' + p.saved + '</span></div>';
    }).join('');
    $('me').textContent = S.P[0].s;
    $('mysaved').textContent = S.P[0].saved + ' saved' + (S.P[0].children ? ' · ' + S.P[0].children + ' child cards' : '') + ' · ' + S.P[0].sets + ' sets';
    var h = $('hand');
    h.innerHTML = '';
    S.P[0].h.forEach(function (c) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'tc ' + c.t + (c.sel ? ' sel' : '') + (isOfficer(c) ? ' officer' : '') + (c.child ? ' child' : '');
      var badge = c.t;
      if (isOfficer(c)) badge += ' · Officer';
      if (c.child) badge += ' · Child +1';
      d.innerHTML = '<span class="ty">' + badge + '</span><b>' + c.n + '</b><div class="f">' + c.f + '</div>';
      d.setAttribute('aria-pressed', c.sel ? 'true' : 'false');
      d.disabled = !myTurn();
      d.onclick = function () {
        if (!myTurn()) return;
        c.sel = !c.sel;
        tone(c.sel ? 520 : 320, 0.08, 'triangle', 0.02);
        render();
      };
      h.appendChild(d);
    });
    var mine = myTurn();
    var cs = selected();
    $('launch').disabled = !(mine && canLaunch(cs));
    $('set').disabled = !(mine && canSet(cs));
    $('end').disabled = !mine;
    var dirty = mine && S.snap && JSON.stringify({ h: S.P[0].h, s: S.P[0].s }) !== JSON.stringify({ h: S.snap.hand, s: S.snap.s });
    $('undo').disabled = !dirty;
    $('msg').textContent = S.over ? '' : hintFor(cs);
    $('log').innerHTML = S.log.map(function (s) { return '<div>' + s + '</div>'; }).join('');
    var turnLabel = S.over ? 'Game over' : (S.P[S.turn].name === 'You' ? 'Your turn' : (S.P[S.turn].name + "'s turn"));
    $('turnflag').textContent = turnLabel;
    $('over').style.display = S.over ? 'block' : 'none';
    if (S.over) {
      var ranked = S.P.slice().sort(function (a, b) { return b.s - a.s || b.saved - a.saved; });
      $('overbody').innerHTML = ranked.map(function (p, i) {
        return '<li><b>' + (i + 1) + '. ' + p.name + '</b> — ' + p.s + ' points, ' + p.saved + ' passengers saved</li>';
      }).join('') + '<p class="small">Your best score on this device is ' + Math.max(bestScore(), S.P[0].s) + '.</p>';
    }
  }

  function afterHumanAction() {
    render();
    if (S.over) saveBest();
  }

  function runAIChain() {
    render();
    if (!S || S.over || S.turn === 0) return;
    setTimeout(function () {
      aiPlay(S);
      tone(240, 0.12, 'sine', 0.02);
      if (S.over) saveBest();
      render();
      if (S && !S.over && S.turn !== 0) runAIChain();
    }, 700);
  }

  function startFromSetup() {
    var n = parseInt($('nai').value, 10) || 2;
    S = startGame(n);
    $('setup').style.display = 'none';
    $('rules').style.display = 'none';
    $('game').style.display = 'block';
    beginTurn(S);
    tone(196, 0.25, 'sine', 0.03);
    render();
    if (S.turn !== 0) runAIChain();
  }

  function playAgain() {
    $('game').style.display = 'none';
    $('over').style.display = 'none';
    $('setup').style.display = 'block';
    S = null;
    var b = bestScore();
    $('bestsetup').textContent = b ? ('Best score on this device: ' + b) : '';
  }

  function bind() {
    if (!$('start')) return;
    $('start').onclick = startFromSetup;
    $('rulesb').onclick = $('rulesb2').onclick = function () { $('rules').style.display = 'block'; };
    $('rclose').onclick = function () { $('rules').style.display = 'none'; };
    $('launch').onclick = function () {
      if (doLaunch(S, S.P[0], selected())) { tone(392, 0.2, 'sine', 0.04); afterHumanAction(); }
    };
    $('set').onclick = function () {
      if (doSet(S, S.P[0], selected())) { tone(330, 0.16, 'triangle', 0.03); afterHumanAction(); }
    };
    $('undo').onclick = function () {
      if (S && S.snap) { restore(S, S.snap); tone(180, 0.1, 'sine', 0.02); render(); }
    };
    $('end').onclick = function () {
      finishTurn(S);
      tone(220, 0.1, 'sine', 0.02);
      if (S.over) saveBest();
      render();
      if (S && !S.over && S.turn !== 0) runAIChain();
    };
    $('again').onclick = playAgain;
    var mute = $('mute');
    if (mute) mute.onclick = function () {
      muted = !muted;
      mute.textContent = muted ? 'Sound off' : 'Sound on';
      mute.setAttribute('aria-pressed', muted ? 'true' : 'false');
    };
    var b = bestScore();
    if (b) $('bestsetup').textContent = 'Best score on this device: ' + b;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})(typeof window !== 'undefined' ? window : globalThis);
