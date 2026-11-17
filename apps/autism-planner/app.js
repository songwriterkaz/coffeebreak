(function () {
  'use strict';
  var KEY = 'cb_autism_planner_v2';
  var OLD_KEY = 'cb_autism_planner_v1';
  var $ = function (id) { return document.getElementById(id); };

  var ICONS = [
    { id: 'sun', label: 'Wake' },
    { id: 'toilet', label: 'Toilet' },
    { id: 'teeth', label: 'Teeth' },
    { id: 'shower', label: 'Shower' },
    { id: 'hands', label: 'Wash hands' },
    { id: 'shirt', label: 'Dress' },
    { id: 'hair', label: 'Hair' },
    { id: 'bowl', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
    { id: 'cup', label: 'Drink' },
    { id: 'bag', label: 'Bag' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'keys', label: 'Keys' },
    { id: 'door', label: 'Leave' },
    { id: 'bus', label: 'Travel' },
    { id: 'school', label: 'School' },
    { id: 'work', label: 'Work' },
    { id: 'house', label: 'Home' },
    { id: 'book', label: 'Read' },
    { id: 'pencil', label: 'Homework' },
    { id: 'computer', label: 'Screen' },
    { id: 'music', label: 'Music' },
    { id: 'paint', label: 'Art' },
    { id: 'puzzle', label: 'Play' },
    { id: 'broom', label: 'Chores' },
    { id: 'paw', label: 'Pet' },
    { id: 'pill', label: 'Medicine' },
    { id: 'moon', label: 'Wind down' },
    { id: 'bed', label: 'Bed' },
    { id: 'clock', label: 'Timed task' },
    { id: 'star', label: 'Custom' }
  ];

  var BREAKS = [
    { id: 'quiet', icon: 'quiet', title: 'Quiet time', minutes: 10, notes: 'A calm pause in a quiet space' },
    { id: 'stretch', icon: 'stretch', title: 'Stretch', minutes: 5, notes: 'Gentle movement at your own pace' },
    { id: 'walk', icon: 'walk', title: 'Short walk', minutes: 10, notes: 'A brief walk indoors or outside' },
    { id: 'water', icon: 'cup', title: 'Water', minutes: 2, notes: 'Have a drink of water' },
    { id: 'air', icon: 'air', title: 'Fresh air', minutes: 5, notes: 'Open a window or step outside' },
    { id: 'fidget', icon: 'fidget', title: 'Fidget or hold', minutes: 5, notes: 'Use a familiar fidget or comfort item' },
    { id: 'ears', icon: 'ears', title: 'Quiet ears', minutes: 10, notes: 'Ear defenders or a quieter room' },
    { id: 'dim', icon: 'dim', title: 'Softer light', minutes: 10, notes: 'Dim lights or close curtains' }
  ];

  function iconSvg(id) {
    var stroke = '#2c3a3a';
    var fill = '#d7e6e1';
    var common = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"';
    var paths = {
      sun: '<circle cx="32" cy="32" r="12" fill="#f3e0a8" stroke="'+stroke+'" stroke-width="2"/><g stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M14 50l6-6M44 20l6-6"/></g>',
      toilet: '<rect x="18" y="10" width="28" height="20" rx="4" fill="#e8eef0" stroke="'+stroke+'" stroke-width="2"/><path d="M22 30h20v8a10 10 0 0 1-20 0z" fill="#e8eef0" stroke="'+stroke+'" stroke-width="2"/><path d="M42 16h8" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      teeth: '<rect x="14" y="22" width="36" height="14" rx="7" fill="#f2f6f4" stroke="'+stroke+'" stroke-width="2"/><path d="M20 22v14M32 22v14M44 22v14" stroke="'+stroke+'" stroke-width="2"/>',
      shower: '<path d="M20 14h18a8 8 0 0 1 8 8v2H20z" fill="#c9dce0" stroke="'+stroke+'" stroke-width="2"/><path d="M32 24v6" stroke="'+stroke+'" stroke-width="2"/><g stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"><path d="M22 40v10M28 38v12M32 36v14M36 38v12M42 40v10"/></g>',
      hands: '<circle cx="32" cy="28" r="10" fill="#d7e6e1" stroke="'+stroke+'" stroke-width="2"/><path d="M16 46c4-8 12-10 16-10s12 2 16 10" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      shirt: '<path d="M20 18l12-8 12 8 8-4 2 12-8 2v24H18V28l-8-2 2-12z" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/>',
      hair: '<path d="M16 40c2-16 10-24 16-24s14 8 16 24" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><circle cx="32" cy="36" r="8" fill="#f3e6d6" stroke="'+stroke+'" stroke-width="2"/>',
      bowl: '<ellipse cx="32" cy="28" rx="16" ry="6" fill="#f3e0a8" stroke="'+stroke+'" stroke-width="2"/><path d="M16 28c0 12 8 20 16 20s16-8 16-20" fill="#e8d2a0" stroke="'+stroke+'" stroke-width="2"/>',
      lunch: '<rect x="14" y="20" width="36" height="26" rx="4" fill="#e7efe4" stroke="'+stroke+'" stroke-width="2"/><path d="M14 30h36M32 20v26" stroke="'+stroke+'" stroke-width="2"/>',
      dinner: '<circle cx="32" cy="34" r="16" fill="#f2eee6" stroke="'+stroke+'" stroke-width="2"/><path d="M18 18v10M22 18v10M42 18c4 0 6 4 6 8s-2 8-6 8" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      snack: '<circle cx="26" cy="32" r="10" fill="#e8c9a8" stroke="'+stroke+'" stroke-width="2"/><circle cx="40" cy="30" r="8" fill="#e8d9a0" stroke="'+stroke+'" stroke-width="2"/>',
      cup: '<path d="M20 18h22v20a8 8 0 0 1-22 0z" fill="#c9dce0" stroke="'+stroke+'" stroke-width="2"/><path d="M42 22h8v10a6 6 0 0 1-8 0" fill="none" stroke="'+stroke+'" stroke-width="2"/><path d="M18 48h26" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      bag: '<path d="M16 24h32l-4 28H20z" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/><path d="M26 24c0-8 12-8 12 0" fill="none" stroke="'+stroke+'" stroke-width="2"/>',
      shoes: '<path d="M12 40c8-2 14-10 22-10 10 0 18 8 18 8v6H12z" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/>',
      keys: '<circle cx="24" cy="28" r="8" fill="#f3e0a8" stroke="'+stroke+'" stroke-width="2"/><path d="M30 32l18 12v-6l-8-5" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      door: '<rect x="18" y="10" width="28" height="44" rx="2" fill="#d7c4a8" stroke="'+stroke+'" stroke-width="2"/><circle cx="40" cy="32" r="2.5" fill="'+stroke+'"/>',
      bus: '<rect x="8" y="22" width="48" height="22" rx="4" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2"/><path d="M8 32h48M16 22v-6h16v6" fill="none" stroke="'+stroke+'" stroke-width="2"/><circle cx="20" cy="46" r="4" fill="'+stroke+'"/><circle cx="44" cy="46" r="4" fill="'+stroke+'"/>',
      school: '<path d="M8 28l24-14 24 14v22H8z" fill="#d7e6e1" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/><rect x="26" y="34" width="12" height="16" fill="#f7f5f1" stroke="'+stroke+'" stroke-width="2"/>',
      work: '<rect x="12" y="24" width="40" height="26" rx="3" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2"/><path d="M24 24v-6h16v6" fill="none" stroke="'+stroke+'" stroke-width="2"/>',
      house: '<path d="M8 32l24-18 24 18v22H8z" fill="#e8d2a0" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/><rect x="26" y="36" width="12" height="18" fill="#f7f5f1" stroke="'+stroke+'" stroke-width="2"/>',
      book: '<path d="M12 16h18v36H16a4 4 0 0 1-4-4zM32 16h18v32a4 4 0 0 1-4 4H32z" fill="#c9dce0" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/>',
      pencil: '<path d="M14 46l4-14 22-22 10 10-22 22z" fill="#f3e0a8" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/><path d="M36 14l10 10" stroke="'+stroke+'" stroke-width="2"/>',
      computer: '<rect x="10" y="14" width="44" height="28" rx="3" fill="#d5ddd8" stroke="'+stroke+'" stroke-width="2"/><path d="M20 50h24M32 42v8" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      music: '<circle cx="22" cy="42" r="8" fill="#c9b8d0" stroke="'+stroke+'" stroke-width="2"/><circle cx="42" cy="36" r="8" fill="#c9b8d0" stroke="'+stroke+'" stroke-width="2"/><path d="M30 42V16h20v20" fill="none" stroke="'+stroke+'" stroke-width="2"/>',
      paint: '<rect x="20" y="10" width="8" height="22" rx="2" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><path d="M16 32h16l-2 18H18z" fill="#8a9a7a" stroke="'+stroke+'" stroke-width="2"/><circle cx="44" cy="22" r="8" fill="#d7e6e1" stroke="'+stroke+'" stroke-width="2"/>',
      puzzle: '<path d="M12 12h16c0 6 8 6 8 0h16v16c-6 0-6 8 0 8v16H36c0-6-8-6-8 0H12V36c6 0 6-8 0-8z" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/>',
      broom: '<path d="M40 8L20 48" stroke="'+stroke+'" stroke-width="3" stroke-linecap="round"/><path d="M12 40l16 16 8-8-16-16z" fill="#d7c4a8" stroke="'+stroke+'" stroke-width="2"/>',
      paw: '<circle cx="32" cy="40" r="10" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><circle cx="18" cy="26" r="5" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><circle cx="28" cy="20" r="5" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><circle cx="40" cy="20" r="5" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/><circle cx="48" cy="28" r="5" fill="#c9b89a" stroke="'+stroke+'" stroke-width="2"/>',
      pill: '<rect x="14" y="24" width="36" height="16" rx="8" fill="#e8c9a8" stroke="'+stroke+'" stroke-width="2"/><path d="M32 24v16" stroke="'+stroke+'" stroke-width="2"/>',
      moon: '<path d="M40 16a18 18 0 1 0 8 28 16 16 0 0 1-8-28z" fill="#e6e0c8" stroke="'+stroke+'" stroke-width="2"/>',
      bed: '<path d="M10 40V28h20c8 0 16 6 16 12H10z" fill="#c5d6e8" stroke="'+stroke+'" stroke-width="2"/><path d="M10 40h44v6H10zM18 28V20h10v8" fill="none" stroke="'+stroke+'" stroke-width="2"/>',
      clock: '<circle cx="32" cy="32" r="18" fill="#f2eee6" stroke="'+stroke+'" stroke-width="2"/><path d="M32 18v14l10 6" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      star: '<path d="M32 10l5 14h14l-11 9 5 15-13-9-13 9 5-15-11-9h14z" fill="#f3e0a8" stroke="'+stroke+'" stroke-width="2" stroke-linejoin="round"/>',
      quiet: '<rect x="16" y="16" width="32" height="32" rx="8" fill="#efe8f4" stroke="'+stroke+'" stroke-width="2"/><path d="M24 32h16" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      stretch: '<circle cx="32" cy="16" r="6" fill="#d7e6e1" stroke="'+stroke+'" stroke-width="2"/><path d="M16 28h32M32 22v28M22 50l10-8 10 8" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      walk: '<circle cx="32" cy="14" r="6" fill="#d7e6e1" stroke="'+stroke+'" stroke-width="2"/><path d="M32 20v18M22 28l10 4 12-8M24 54l8-16 10 16" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      air: '<path d="M12 24c10-8 20 8 30 0M12 34c10-8 20 8 30 0M12 44c10-8 20 8 30 0" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/><path d="M46 20c8 2 8 14 0 16" fill="none" stroke="'+stroke+'" stroke-width="2"/>',
      fidget: '<circle cx="32" cy="32" r="16" fill="#efe8f4" stroke="'+stroke+'" stroke-width="2"/><circle cx="32" cy="32" r="6" fill="#c9b8d0" stroke="'+stroke+'" stroke-width="2"/>',
      ears: '<path d="M18 20v16M18 28h10l8 12 8-12h10" fill="none" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/><path d="M46 20v16" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round"/>',
      dim: '<circle cx="32" cy="32" r="10" fill="#e6e0c8" stroke="'+stroke+'" stroke-width="2"/><path d="M32 12v6M32 46v6M12 32h6M46 32h6" stroke="'+stroke+'" stroke-width="2" stroke-linecap="round" opacity=".45"/>'
    };
    return '<svg '+common+'>'+(paths[id] || paths.star)+'</svg>';
  }

  function uid() {
    return 's' + Math.random().toString(36).slice(2, 10);
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function samples() {
    return [
      {
        id: 'morning',
        name: 'Morning',
        steps: [
          { id: uid(), title: 'Wake up', icon: 'sun', minutes: 10, notes: '' },
          { id: uid(), title: 'Toilet', icon: 'toilet', minutes: 5, notes: '' },
          { id: uid(), title: 'Brush teeth', icon: 'teeth', minutes: 5, notes: '' },
          { id: uid(), title: 'Get dressed', icon: 'shirt', minutes: 10, notes: '' },
          { id: uid(), title: 'Breakfast', icon: 'bowl', minutes: 20, notes: '' },
          { id: uid(), title: 'Bag and shoes', icon: 'bag', minutes: 5, notes: '' },
          { id: uid(), title: 'Leave', icon: 'door', minutes: 5, notes: '' }
        ]
      },
      {
        id: 'after-school',
        name: 'After school',
        steps: [
          { id: uid(), title: 'Arrive home', icon: 'house', minutes: 5, notes: '' },
          { id: uid(), title: 'Snack', icon: 'snack', minutes: 15, notes: '' },
          { id: uid(), title: 'Quiet time', icon: 'quiet', minutes: 20, notes: '' },
          { id: uid(), title: 'Homework or reading', icon: 'pencil', minutes: 30, notes: '' },
          { id: uid(), title: 'Free choice', icon: 'puzzle', minutes: 30, notes: '' },
          { id: uid(), title: 'Dinner', icon: 'dinner', minutes: 30, notes: '' },
          { id: uid(), title: 'Shower', icon: 'shower', minutes: 15, notes: '' },
          { id: uid(), title: 'Bed wind-down', icon: 'moon', minutes: 20, notes: '' }
        ]
      },
      {
        id: 'bedtime',
        name: 'Bedtime',
        steps: [
          { id: uid(), title: 'Put devices away', icon: 'computer', minutes: 5, notes: '' },
          { id: uid(), title: 'Wash and teeth', icon: 'teeth', minutes: 10, notes: '' },
          { id: uid(), title: 'Put out clothes', icon: 'shirt', minutes: 5, notes: '' },
          { id: uid(), title: 'Quiet time', icon: 'book', minutes: 15, notes: '' },
          { id: uid(), title: 'Lights down', icon: 'dim', minutes: 5, notes: '' },
          { id: uid(), title: 'Bed', icon: 'bed', minutes: 0, notes: '' }
        ]
      }
    ];
  }

  function blankState() {
    var list = samples();
    return {
      version: 2,
      routines: list,
      activeRoutineId: list[0].id,
      date: today(),
      index: 0,
      doneIds: [],
      bigText: false,
      timer: { running: false, remaining: 0, total: 0, stepId: null },
      breakItem: null,
      resumeIndex: 0,
      status: ''
    };
  }

  function migrateV1(raw) {
    var state = blankState();
    if (!raw || !Array.isArray(raw.steps) || !raw.steps.length) return state;
    state.routines.push({
      id: 'saved',
      name: raw.name || 'Saved routine',
      steps: raw.steps.map(function (title) {
        return { id: uid(), title: String(title), icon: 'star', minutes: 0, notes: '' };
      })
    });
    state.activeRoutineId = 'saved';
    state.index = raw.index || 0;
    return state;
  }

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (raw && raw.version === 2 && Array.isArray(raw.routines)) {
        if (raw.date !== today()) {
          raw.date = today();
          raw.index = 0;
          raw.doneIds = [];
          raw.timer = { running: false, remaining: 0, total: 0, stepId: null };
          raw.breakItem = null;
        }
        return raw;
      }
    } catch (err) {}
    try {
      var old = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
      if (old) return migrateV1(old);
    } catch (err) {}
    return blankState();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (err) {}
  }

  var data = load();
  var chosenIcon = 'star';
  var tick = null;

  function routine() {
    return data.routines.find(function (r) { return r.id === data.activeRoutineId; }) || data.routines[0];
  }

  function steps() {
    return (routine() && routine().steps) || [];
  }

  function currentStep() {
    if (data.breakItem) return data.breakItem;
    var list = steps();
    return list[data.index] || null;
  }

  function nextStep() {
    if (data.breakItem) return steps()[data.resumeIndex] || null;
    return steps()[data.index + 1] || null;
  }

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function setTimerFromStep(step) {
    var mins = step && step.minutes ? Number(step.minutes) : 0;
    data.timer = {
      running: false,
      remaining: mins * 60,
      total: mins * 60,
      stepId: step ? step.id : null
    };
  }

  function ensureTimer() {
    var step = currentStep();
    if (!step) {
      data.timer = { running: false, remaining: 0, total: 0, stepId: null };
      return;
    }
    if (data.timer.stepId !== step.id) setTimerFromStep(step);
  }

  function paintIcons() {
    var grid = $('iconGrid');
    grid.innerHTML = '';
    ICONS.forEach(function (icon) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'icon-pick' + (chosenIcon === icon.id ? ' on' : '');
      b.setAttribute('aria-label', icon.label);
      b.innerHTML = iconSvg(icon.id) + '<span>' + icon.label + '</span>';
      b.onclick = function () {
        chosenIcon = icon.id;
        paintIcons();
      };
      grid.appendChild(b);
    });
  }

  function paintBreaks() {
    var grid = $('breakGrid');
    grid.innerHTML = '';
    BREAKS.forEach(function (item) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'break-btn';
      b.innerHTML = iconSvg(item.icon) + '<span>' + item.title + '</span>';
      b.onclick = function () { startBreak(item); };
      grid.appendChild(b);
    });
  }

  function paintRoutines() {
    var sel = $('routineSelect');
    sel.innerHTML = '';
    data.routines.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r.id;
      o.textContent = r.name;
      if (r.id === data.activeRoutineId) o.selected = true;
      sel.appendChild(o);
    });
  }

  function paintNowNext() {
    var now = currentStep();
    var nxt = nextStep();
    var nowSlot = $('nowSlot');
    nowSlot.classList.toggle('break-on', !!data.breakItem);
    $('nowIcon').innerHTML = now ? iconSvg(now.icon) : iconSvg('star');
    $('nowTitle').textContent = now ? now.title : 'All done for now';
    var nowMeta = [];
    if (data.breakItem) nowMeta.push('Break');
    if (now && now.minutes) nowMeta.push(now.minutes + ' min');
    if (now && now.notes) nowMeta.push(now.notes);
    if (!now) nowMeta.push('Add or reset cards to start again');
    $('nowMeta').textContent = nowMeta.join(' · ');
    $('nextIcon').innerHTML = nxt ? iconSvg(nxt.icon) : '';
    $('nextTitle').textContent = nxt ? nxt.title : '—';
    $('nextMeta').textContent = nxt && nxt.minutes ? nxt.minutes + ' min' : (nxt ? 'Up next' : '');
    $('btnEndBreak').hidden = !data.breakItem;
  }

  function paintTimer() {
    ensureTimer();
    var t = data.timer;
    $('timerDigits').textContent = fmt(t.remaining);
    var total = t.total || 0;
    var done = total ? (total - t.remaining) / total : 0;
    var circ = 2 * Math.PI * 34;
    $('timerArc').setAttribute('stroke-dasharray', String(circ));
    $('timerArc').setAttribute('stroke-dashoffset', String(circ * (1 - done)));
    $('btnStartTimer').textContent = t.running ? 'Pause timer' : 'Start timer';
    $('btnStartTimer').disabled = !currentStep() || (!t.total && !t.remaining);
  }

  function paintCards() {
    var list = $('cardList');
    list.innerHTML = '';
    var items = steps();
    $('emptyCards').hidden = items.length > 0;
    items.forEach(function (step, idx) {
      var li = document.createElement('li');
      li.className = 'card' + (data.doneIds.indexOf(step.id) !== -1 ? ' done' : '');
      li.dataset.id = step.id;
      li.innerHTML =
        '<button type="button" class="handle" aria-label="Drag to reorder" data-drag="1">↕</button>' +
        '<div class="card-icon">' + iconSvg(step.icon) + '</div>' +
        '<div><p class="card-title"></p><p class="card-sub"></p></div>' +
        '<button type="button" class="ghost ghost-hide" data-edit="1">Edit</button>' +
        '<button type="button" class="check" data-check="1" aria-label="Mark done">' + (data.doneIds.indexOf(step.id) !== -1 ? '✓' : '') + '</button>';
      li.querySelector('.card-title').textContent = step.title;
      li.querySelector('.card-sub').textContent = (idx + 1) + (step.minutes ? ' · ' + step.minutes + ' min' : '') + (step.notes ? ' · ' + step.notes : '');
      list.appendChild(li);
    });
  }

  function paint() {
    document.documentElement.classList.toggle('big', !!data.bigText);
    $('todayLabel').textContent = data.date.split('-').reverse().join('/');
    paintRoutines();
    paintNowNext();
    paintTimer();
    paintCards();
    paintIcons();
    paintBreaks();
    $('status').textContent = data.status || '';
  }

  function firstOpenIndex() {
    var list = steps();
    for (var i = 0; i < list.length; i++) {
      if (data.doneIds.indexOf(list[i].id) === -1) return i;
    }
    return list.length;
  }

  function markDone(id) {
    if (data.doneIds.indexOf(id) === -1) data.doneIds.push(id);
    data.index = firstOpenIndex();
    data.status = '';
    setTimerFromStep(currentStep());
    save();
    paint();
  }

  function skipNow() {
    var step = currentStep();
    if (!step) return;
    if (data.breakItem) return endBreak();
    data.index = Math.min(data.index + 1, steps().length);
    setTimerFromStep(currentStep());
    save();
    paint();
  }

  function startBreak(item) {
    if (!data.breakItem) data.resumeIndex = data.index;
    data.breakItem = {
      id: 'break-' + item.id,
      title: item.title,
      icon: item.icon,
      minutes: item.minutes,
      notes: item.notes,
      isBreak: true
    };
    setTimerFromStep(data.breakItem);
    data.status = 'Break started. Your place in the routine is kept.';
    save();
    paint();
  }

  function endBreak() {
    data.breakItem = null;
    data.index = data.resumeIndex || firstOpenIndex();
    setTimerFromStep(currentStep());
    data.status = 'Back to your routine.';
    save();
    paint();
  }

  function startTimer() {
    ensureTimer();
    if (!data.timer.total && !data.timer.remaining) return;
    if (!data.timer.remaining) data.timer.remaining = data.timer.total;
    data.timer.running = !data.timer.running;
    save();
    paintTimer();
  }

  function resetTimer() {
    var step = currentStep();
    setTimerFromStep(step);
    save();
    paintTimer();
  }

  function addMinutes(mins) {
    var extra = mins * 60;
    data.timer.remaining += extra;
    data.timer.total += extra;
    save();
    paintTimer();
  }

  function tickTimer() {
    if (!data.timer || !data.timer.running) return;
    data.timer.remaining = Math.max(0, data.timer.remaining - 1);
    if (data.timer.remaining <= 0) {
      data.timer.running = false;
      data.status = 'Timer finished for ' + (currentStep() ? currentStep().title : 'this step') + '.';
    }
    save();
    paintNowNext();
    paintTimer();
    $('status').textContent = data.status || '';
  }

  function addCard() {
    var title = ($('newTitle').value || '').trim();
    var minutes = parseInt($('newMins').value, 10) || 0;
    var notes = ($('newNotes').value || '').trim();
    if (!title) {
      data.status = 'Add a name for the card first.';
      paint();
      return;
    }
    routine().steps.push({
      id: uid(),
      title: title,
      icon: chosenIcon,
      minutes: minutes,
      notes: notes
    });
    $('newTitle').value = '';
    $('newMins').value = '';
    $('newNotes').value = '';
    data.status = 'Card added to ' + routine().name + '.';
    if (data.index > steps().length) data.index = firstOpenIndex();
    save();
    paint();
  }

  function editCard(id) {
    var step = steps().find(function (s) { return s.id === id; });
    if (!step) return;
    $('newTitle').value = step.title;
    $('newMins').value = step.minutes || '';
    $('newNotes').value = step.notes || '';
    chosenIcon = step.icon || 'star';
    routine().steps = steps().filter(function (s) { return s.id !== id; });
    data.doneIds = data.doneIds.filter(function (x) { return x !== id; });
    data.index = firstOpenIndex();
    data.status = 'Edit the card and add it again to save changes.';
    save();
    paint();
  }

  function newRoutine() {
    var name = ($('newRoutineName').value || '').trim();
    if (!name) {
      data.status = 'Name the routine first.';
      paint();
      return;
    }
    var item = { id: uid(), name: name, steps: [] };
    data.routines.push(item);
    data.activeRoutineId = item.id;
    data.index = 0;
    data.doneIds = [];
    data.breakItem = null;
    $('newRoutineName').value = '';
    setTimerFromStep(null);
    data.status = 'New routine ready. Add cards below.';
    save();
    paint();
  }

  function resetToday() {
    data.date = today();
    data.index = 0;
    data.doneIds = [];
    data.breakItem = null;
    setTimerFromStep(currentStep());
    data.status = 'Today is reset. Your routines are still saved.';
    save();
    paint();
  }

  function loadSample(id) {
    var fresh = samples().find(function (r) { return r.id === id; });
    if (!fresh) return;
    var existing = data.routines.find(function (r) { return r.id === id; });
    if (existing) existing.steps = fresh.steps;
    else data.routines.push(fresh);
    data.activeRoutineId = id;
    data.index = 0;
    data.doneIds = [];
    data.breakItem = null;
    setTimerFromStep(currentStep());
    data.status = fresh.name + ' sample loaded.';
    save();
    paint();
  }

  /* Pointer drag reorder, including touch. */
  var dragId = null;
  var dragEl = null;

  function cardFromPoint(x, y) {
    var node = document.elementFromPoint(x, y);
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('card') && node.dataset.id) return node;
      node = node.parentNode;
    }
    return null;
  }

  function moveCard(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return;
    var list = steps();
    var from = list.findIndex(function (s) { return s.id === fromId; });
    var to = list.findIndex(function (s) { return s.id === toId; });
    if (from < 0 || to < 0) return;
    var item = list.splice(from, 1)[0];
    list.splice(to, 0, item);
    routine().steps = list;
    data.index = firstOpenIndex();
    save();
    paint();
  }

  function onCardClick(e) {
    var card = e.target.closest('.card');
    if (!card) return;
    if (e.target.closest('[data-check]')) {
      var already = data.doneIds.indexOf(card.dataset.id) !== -1;
      if (already) data.doneIds = data.doneIds.filter(function (id) { return id !== card.dataset.id; });
      else data.doneIds.push(card.dataset.id);
      data.index = firstOpenIndex();
      setTimerFromStep(currentStep());
      save();
      paint();
      return;
    }
    if (e.target.closest('[data-edit]')) editCard(card.dataset.id);
  }

  function onPointerDown(e) {
    if (!e.target.closest('[data-drag]')) return;
    var card = e.target.closest('.card');
    if (!card) return;
    dragId = card.dataset.id;
    dragEl = card;
    card.classList.add('dragging');
    card.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragId) return;
    var over = cardFromPoint(e.clientX, e.clientY);
    document.querySelectorAll('.card.drop-target').forEach(function (n) { n.classList.remove('drop-target'); });
    if (over && over.dataset.id !== dragId) over.classList.add('drop-target');
  }

  function onPointerUp(e) {
    if (!dragId) return;
    var over = cardFromPoint(e.clientX, e.clientY);
    var toId = over && over.dataset.id;
    var fromId = dragId;
    if (dragEl) dragEl.classList.remove('dragging');
    document.querySelectorAll('.card.drop-target').forEach(function (n) { n.classList.remove('drop-target'); });
    dragId = null;
    dragEl = null;
    moveCard(fromId, toId);
  }

  function bind() {
    $('btnDone').onclick = function () {
      var step = currentStep();
      if (!step) return;
      if (data.breakItem) return endBreak();
      markDone(step.id);
    };
    $('btnSkip').onclick = skipNow;
    $('btnEndBreak').onclick = endBreak;
    $('btnStartTimer').onclick = startTimer;
    $('btnResetTimer').onclick = resetTimer;
    $('btnPlus5').onclick = function () { addMinutes(5); };
    $('btnPlus1').onclick = function () { addMinutes(1); };
    $('routineSelect').onchange = function () {
      data.activeRoutineId = this.value;
      data.index = 0;
      data.doneIds = [];
      data.breakItem = null;
      setTimerFromStep(currentStep());
      save();
      paint();
    };
    $('btnNewRoutine').onclick = newRoutine;
    $('btnAddCard').onclick = addCard;
    $('btnMorning').onclick = function () { loadSample('morning'); };
    $('btnAfter').onclick = function () { loadSample('after-school'); };
    $('btnBed').onclick = function () { loadSample('bedtime'); };
    $('btnResetToday').onclick = resetToday;
    $('btnBig').onclick = function () { data.bigText = true; save(); paint(); };
    $('btnNormal').onclick = function () { data.bigText = false; save(); paint(); };
    $('cardList').addEventListener('click', onCardClick);
    $('cardList').addEventListener('pointerdown', onPointerDown);
    $('cardList').addEventListener('pointermove', onPointerMove);
    $('cardList').addEventListener('pointerup', onPointerUp);
    $('cardList').addEventListener('pointercancel', onPointerUp);
  }

  if (tick) clearInterval(tick);
  tick = setInterval(tickTimer, 1000);
  bind();
  paint();

  window.CBPlanner = {
    load: load,
    save: function () { save(); },
    data: function () { return data; },
    steps: steps,
    currentStep: currentStep,
    nextStep: nextStep,
    moveCard: moveCard,
    markDone: markDone,
    startBreak: startBreak,
    endBreak: endBreak,
    fmt: fmt,
    iconSvg: iconSvg,
    migrateV1: migrateV1
  };
})();
