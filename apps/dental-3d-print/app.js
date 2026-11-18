import { createViewer } from './viewer.js';
import { PRINTERS } from './printers.js';
import { ownerOn, ownerOff, ownerUnlock } from './owner.js';
import {
  RESINS, UPPER_FDI, LOWER_FDI, tooth, arch, crownPlaceholder, biteBlock,
  implantAnalog, nightGuard, alignerShell, studyModel, modelBase, plinthWithLabel,
  parseSTL, parseOBJ, parsePLY, toBinarySTL, to3MF, merge, placeOnPlate, autoOrient,
  hollowModel, buildSupports, scaleAbout, rotateAbout, translate, centerOf, bounds,
  volumeMm3, estimate, formatDuration, fitsPlate, cleanCaseId, triangleCount
} from './geometry.js';

const $ = (id) => document.getElementById(id);
const state = {
  objects: [],
  selected: null,
  printerId: 'form3b',
  size: [145, 145, 185],
  resin: 'model',
  layerHeight: 0.05,
  exposure: 2.5,
  move: 4,
  pricePerMl: 0.18,
  caseId: ''
};
let nextId = 1;
const past = [];
const future = [];
const STORE = 'cb-dental-3d-projects';
const viewer = createViewer($('view'));

function status(text) { $('status').textContent = text; }

function snap() {
  return {
    objects: state.objects.map(o => ({ id: o.id, name: o.name, role: o.role, positions: o.positions.slice() })),
    selected: state.selected,
    printerId: state.printerId,
    size: state.size.slice(),
    resin: state.resin,
    layerHeight: state.layerHeight,
    exposure: state.exposure,
    move: state.move,
    pricePerMl: state.pricePerMl,
    caseId: state.caseId,
    nextId
  };
}

function restore(s) {
  state.objects = s.objects.map(o => ({ id: o.id, name: o.name, role: o.role, positions: o.positions.slice() }));
  state.selected = s.selected;
  state.printerId = s.printerId;
  state.size = s.size.slice();
  state.resin = s.resin;
  state.layerHeight = s.layerHeight;
  state.exposure = s.exposure;
  state.move = s.move;
  state.pricePerMl = s.pricePerMl;
  state.caseId = s.caseId;
  nextId = s.nextId;
}

function pushHistory() {
  past.push(snap());
  if (past.length > 12) past.shift();
  future.length = 0;
}

function undo() {
  if (!past.length) return;
  future.push(snap());
  restore(past.pop());
  syncForm();
  refresh(false);
  status('Undone.');
}

function redo() {
  if (!future.length) return;
  past.push(snap());
  restore(future.pop());
  syncForm();
  refresh(false);
  status('Redone.');
}

function selected() {
  return state.objects.find(o => o.id === state.selected) || null;
}

function addPart(name, role, positions) {
  const id = nextId++;
  state.objects.push({ id, name, role, positions });
  state.selected = id;
}

function dropSupports() {
  const had = state.objects.some(o => o.role === 'support');
  state.objects = state.objects.filter(o => o.role !== 'support');
  if (state.selected && !state.objects.some(o => o.id === state.selected)) {
    state.selected = state.objects.length ? state.objects[state.objects.length - 1].id : null;
  }
  return had;
}

function sceneMesh() {
  return merge(state.objects.map(o => o.positions));
}

function refresh(frame) {
  viewer.setPlate(state.size[0], state.size[1]);
  viewer.setScene(state.objects);
  if (frame) viewer.frame();
  viewer.setSection($('section-axis').value, +$('section').value / 100);
  paintList();
  paintEstimate();
  $('undo').disabled = !past.length;
  $('redo').disabled = !future.length;
}

function paintList() {
  const list = $('parts');
  list.replaceChildren();
  if (!state.objects.length) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Nothing on the plate yet.';
    list.appendChild(empty);
    return;
  }
  for (const o of state.objects) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'part' + (o.id === state.selected ? ' on' : '');
    const tris = triangleCount(o.positions);
    btn.textContent = o.name + ' · ' + tris.toLocaleString('en-AU') + ' triangles';
    btn.addEventListener('click', () => { state.selected = o.id; paintList(); });
    list.appendChild(btn);
  }
}

function paintEstimate() {
  const mesh = sceneMesh();
  const est = estimate(mesh, state);
  const fit = fitsPlate(mesh, state.size);
  const ml = est.ml.toFixed(2);
  const cost = est.cost.toFixed(2);
  $('estimate').textContent = est.layers
    ? 'Volume ' + ml + ' ml. Estimated resin cost US$' + cost + '. Height ' + est.height.toFixed(1) + ' mm, ' + est.layers + ' layers, about ' + formatDuration(est.seconds) + '.'
    : 'Add a model to see volume, resin and time estimates.';
  $('fit').textContent = !mesh.length ? '' : fit.over
    ? 'This scene is larger than the build volume (' + fit.width.toFixed(0) + ' x ' + fit.depth.toFixed(0) + ' x ' + fit.height.toFixed(0) + ' mm). Scale it or choose another preset.'
    : 'Scene fits this build volume (' + fit.width.toFixed(0) + ' x ' + fit.depth.toFixed(0) + ' x ' + fit.height.toFixed(0) + ' mm).';
}

function syncForm() {
  $('printer').value = PRINTERS.some(p => p.id === state.printerId) ? state.printerId : 'custom';
  $('plate-x').value = String(state.size[0]);
  $('plate-z').value = String(state.size[1]);
  $('plate-y').value = String(state.size[2]);
  $('resin').value = state.resin;
  $('layer').value = String(state.layerHeight);
  $('exposure').value = String(state.exposure);
  $('move').value = String(state.move);
  $('price').value = String(state.pricePerMl);
  $('case-id').value = state.caseId;
}

function readPrintSettings() {
  state.size = [+$('plate-x').value || 1, +$('plate-z').value || 1, +$('plate-y').value || 1];
  state.layerHeight = Math.max(0.01, +$('layer').value || 0.05);
  state.exposure = Math.max(0, +$('exposure').value || 0);
  state.move = Math.max(0, +$('move').value || 0);
  state.pricePerMl = Math.max(0, +$('price').value || 0);
  const resin = RESINS.find(r => r.id === $('resin').value);
  state.resin = resin ? resin.id : 'model';
}

function libraryAdd(name, role, positions) {
  pushHistory();
  addPart(name, role, placeOnPlate(positions));
  refresh(true);
  status(name + ' added. It is a procedural education model, not a patient record.');
}

function fillSelects() {
  const printer = $('printer');
  for (const p of PRINTERS) printer.add(new Option(p.name, p.id));
  printer.add(new Option('Custom size', 'custom'));
  const fdi = $('fdi');
  for (const n of UPPER_FDI.concat(LOWER_FDI)) fdi.add(new Option(String(n), String(n)));
  const resin = $('resin');
  for (const r of RESINS) resin.add(new Option(r.name, r.id));
}

function applyResinDefaults() {
  const resin = RESINS.find(r => r.id === $('resin').value);
  if (!resin) return;
  $('exposure').value = String(resin.exposure);
  $('price').value = String(resin.pricePerMl);
  readPrintSettings();
  refresh(false);
}

async function importFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  status('Reading file. Patient names are not kept.');
  try {
    const buf = await file.arrayBuffer();
    let pos;
    if (ext === 'stl') pos = parseSTL(buf);
    else if (ext === 'obj') pos = parseOBJ(new TextDecoder().decode(buf));
    else if (ext === 'ply') pos = parsePLY(buf);
    else { status('Use an STL, OBJ or PLY file.'); return; }
    if (!pos.length) { status('That file had no triangles.'); return; }
    pos = placeOnPlate(pos);
    pushHistory();
    addPart('Imported scan', 'model', pos);
    refresh(true);
    const b = bounds(pos);
    const span = Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]);
    let note = 'Imported ' + triangleCount(pos).toLocaleString('en-AU') + ' triangles. The file name was not stored. Remove patient names before you share an export.';
    if (span < 2 || span > 500) note += ' The size looks unusual. Check scale before printing.';
    status(note);
  } catch (err) {
    status('That file could not be read. Use STL, OBJ or PLY.');
  }
}

function download(data, name, type) {
  const blob = new Blob([data], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function exportName(ext) {
  const id = cleanCaseId(state.caseId);
  const stem = id.ok && id.id ? 'coffeebreak-' + id.id : 'coffeebreak-dental-print';
  return stem + '.' + ext;
}

function bytesToB64(f32) {
  const u8 = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
  let s = '';
  const step = 0x8000;
  for (let i = 0; i < u8.length; i += step) {
    s += String.fromCharCode.apply(null, u8.subarray(i, Math.min(i + step, u8.length)));
  }
  return btoa(s);
}

function b64ToF32(text) {
  const bin = atob(text);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Float32Array(u8.buffer);
}

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; }
}

function paintProjects() {
  const sel = $('projects');
  const rows = loadStore();
  sel.replaceChildren();
  sel.add(new Option(rows.length ? 'Saved projects on this browser' : 'No saved projects', ''));
  for (const row of rows) sel.add(new Option((row.caseId || 'Untitled') + ' · ' + row.savedAt.slice(0, 16).replace('T', ' '), row.id));
}

function saveProject() {
  const payload = {
    id: String(Date.now()),
    savedAt: new Date().toISOString(),
    caseId: state.caseId,
    printerId: state.printerId,
    size: state.size,
    resin: state.resin,
    layerHeight: state.layerHeight,
    exposure: state.exposure,
    move: state.move,
    pricePerMl: state.pricePerMl,
    nextId,
    selected: state.selected,
    objects: state.objects.map(o => ({ id: o.id, name: o.name, role: o.role, positions: bytesToB64(o.positions) }))
  };
  const json = JSON.stringify(payload);
  if (json.length > 4500000) {
    status('This project is too large for browser storage. Export an STL to keep it. Nothing was sent off this device.');
    return;
  }
  const rows = loadStore().filter(r => r.caseId !== payload.caseId || !payload.caseId);
  rows.unshift(payload);
  while (rows.length > 8) rows.pop();
  try {
    localStorage.setItem(STORE, JSON.stringify(rows));
  } catch (e) {
    status('This browser could not store the project. Export an STL to keep it. Nothing was sent off this device.');
    return;
  }
  paintProjects();
  status('Project saved in this browser only. No patient names are stored.');
}

function openProject() {
  const id = $('projects').value;
  if (!id) return;
  const row = loadStore().find(r => r.id === id);
  if (!row) return;
  pushHistory();
  state.objects = row.objects.map(o => ({ id: o.id, name: o.name, role: o.role, positions: b64ToF32(o.positions) }));
  state.selected = row.selected;
  state.printerId = row.printerId;
  state.size = row.size.slice();
  state.resin = row.resin;
  state.layerHeight = row.layerHeight;
  state.exposure = row.exposure;
  state.move = row.move;
  state.pricePerMl = row.pricePerMl;
  state.caseId = row.caseId || '';
  nextId = row.nextId || (Math.max(0, ...state.objects.map(o => o.id)) + 1);
  syncForm();
  refresh(true);
  status('Project opened from this browser.');
}

function deleteProject() {
  const id = $('projects').value;
  if (!id) return;
  const rows = loadStore().filter(r => r.id !== id);
  localStorage.setItem(STORE, JSON.stringify(rows));
  paintProjects();
  status('Saved project removed from this browser.');
}

function paintOwner() {
  const on = ownerOn();
  $('owner-state').textContent = on
    ? 'Owner access is on for this browser session. The US$10 price is waived.'
    : 'Full version US$10 for customers.';
  $('owner-off').hidden = !on;
}

function bind() {
  fillSelects();
  syncForm();
  paintProjects();
  paintOwner();
  refresh(true);

  $('file').addEventListener('change', () => {
    const file = $('file').files && $('file').files[0];
    if (file) importFile(file);
    $('file').value = '';
  });
  const drop = $('drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('hot'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('hot'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('hot');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) importFile(file);
  });

  $('add-upper').onclick = () => libraryAdd('Upper arch', 'model', arch('upper'));
  $('add-lower').onclick = () => libraryAdd('Lower arch', 'model', arch('lower'));
  $('add-tooth').onclick = () => libraryAdd('Tooth ' + $('fdi').value, 'model', tooth(+$('fdi').value));
  $('add-base').onclick = () => libraryAdd('Model base', 'base', modelBase());
  $('add-crown').onclick = () => libraryAdd('Crown placeholder', 'model', crownPlaceholder());
  $('add-splint').onclick = () => libraryAdd('Night guard shell', 'model', nightGuard());
  $('add-aligner').onclick = () => libraryAdd('Aligner shell', 'model', alignerShell());
  $('add-bite').onclick = () => libraryAdd('Bite block', 'model', biteBlock());
  $('add-study').onclick = () => libraryAdd('Study model', 'model', studyModel());
  $('add-implant').onclick = () => libraryAdd('Implant analog', 'model', implantAnalog());

  $('apply-transform').onclick = () => {
    const part = selected();
    if (!part || part.role === 'support') { status('Select a model first.'); return; }
    pushHistory();
    const had = dropSupports();
    const current = selected();
    let p = current.positions;
    const s = (+$('scale').value || 100) / 100;
    let c = centerOf(p);
    if (Math.abs(s - 1) > 1e-6) p = scaleAbout(p, s, s, s, c);
    c = centerOf(p);
    const rx = +$('rot-x').value || 0, ry = +$('rot-y').value || 0, rz = +$('rot-z').value || 0;
    if (rx) p = rotateAbout(p, 'x', rx, c);
    if (ry) p = rotateAbout(p, 'y', ry, centerOf(p));
    if (rz) p = rotateAbout(p, 'z', rz, centerOf(p));
    p = translate(p, +$('tx').value || 0, +$('ty').value || 0, +$('tz').value || 0);
    current.positions = p;
    $('scale').value = '100';
    $('rot-x').value = '0'; $('rot-y').value = '0'; $('rot-z').value = '0';
    $('tx').value = '0'; $('ty').value = '0'; $('tz').value = '0';
    refresh(true);
    status(had ? 'Transform applied. Supports were cleared.' : 'Transform applied.');
  };

  $('auto-orient').onclick = () => {
    const part = selected();
    if (!part || part.role === 'support') { status('Select a model first.'); return; }
    pushHistory();
    dropSupports();
    const current = selected();
    current.positions = placeOnPlate(autoOrient(current.positions));
    refresh(true);
    status('Auto-orient finished and the model was seated on the plate. This is a height and overhang estimate, not a clinical setup.');
  };

  $('auto-place').onclick = () => {
    const part = selected();
    if (!part) { status('Select a model first.'); return; }
    pushHistory();
    part.positions = placeOnPlate(part.positions);
    refresh(true);
    status('Placed on the centre of the build plate, sitting on Y = 0.');
  };

  $('apply-hollow').onclick = () => {
    const part = selected();
    if (!part || part.role === 'support') { status('Select a model to hollow.'); return; }
    status('Hollowing. Large scans can take a moment.');
    const mobile = Math.min(window.innerWidth, window.innerHeight) < 760;
    const wall = +$('wall').value || 2;
    const drains = +$('drains').value || 0;
    const dia = +$('drain-dia').value || 2;
    setTimeout(() => {
      const result = hollowModel(part.positions, wall, drains, dia, mobile ? 28 : 42);
      if (!result.ok) { status(result.message); return; }
      pushHistory();
      dropSupports();
      const current = state.objects.find(o => o.id === part.id);
      if (current) current.positions = result.positions;
      refresh(true);
      status(result.message);
    }, 30);
  };

  $('build-supports').onclick = () => {
    const part = selected();
    if (!part || part.role === 'support') { status('Select a model first.'); return; }
    const result = buildSupports(part.positions, +$('spacing').value || 4, +$('tip').value || 0.4);
    pushHistory();
    state.objects = state.objects.filter(o => o.role !== 'support');
    if (result.positions.length) addPart('Supports', 'support', result.positions);
    refresh(false);
    status(result.message);
  };
  $('clear-supports').onclick = () => {
    if (!state.objects.some(o => o.role === 'support')) { status('No supports to clear.'); return; }
    pushHistory();
    dropSupports();
    refresh(false);
    status('Supports cleared.');
  };

  $('add-plinth').onclick = () => {
    const id = cleanCaseId($('case-id').value);
    if (!id.ok) { status(id.message); return; }
    state.caseId = id.id;
    const made = plinthWithLabel(id.id, $('label-mode').value);
    if (!made.ok) { status(made.message); return; }
    pushHistory();
    addPart(id.id ? 'Plinth ' + id.id : 'Plinth', 'plinth', placeOnPlate(made.positions));
    refresh(true);
    status(id.id ? 'Plinth added with case ID ' + id.id + '. Do not use a patient name.' : 'Plain plinth added.');
  };

  $('case-id').addEventListener('change', () => {
    const id = cleanCaseId($('case-id').value);
    if (!id.ok) { status(id.message); $('case-id').value = state.caseId; return; }
    state.caseId = id.id;
    $('case-id').value = id.id;
  });

  $('delete-part').onclick = () => {
    const part = selected();
    if (!part) return;
    pushHistory();
    state.objects = state.objects.filter(o => o.id !== part.id);
    state.selected = state.objects.length ? state.objects[state.objects.length - 1].id : null;
    refresh(true);
    status('Removed ' + part.name + '.');
  };

  $('printer').addEventListener('change', () => {
    const preset = PRINTERS.find(p => p.id === $('printer').value);
    if (!preset) { state.printerId = 'custom'; return; }
    state.printerId = preset.id;
    state.size = preset.size.slice();
    syncForm();
    refresh(false);
    status(preset.name + ' build volume loaded. Approximate and user-editable, not manufacturer-certified.');
  });
  ['plate-x', 'plate-z', 'plate-y', 'layer', 'exposure', 'move', 'price'].forEach(id => {
    $(id).addEventListener('change', () => {
      if (id.startsWith('plate')) state.printerId = 'custom';
      readPrintSettings();
      syncForm();
      refresh(false);
    });
  });
  $('resin').addEventListener('change', applyResinDefaults);

  $('wire').addEventListener('change', () => viewer.setWireframe($('wire').checked));
  $('section').addEventListener('input', () => viewer.setSection($('section-axis').value, +$('section').value / 100));
  $('section-axis').addEventListener('change', () => viewer.setSection($('section-axis').value, +$('section').value / 100));
  $('measure').addEventListener('change', () => {
    const on = $('measure').checked;
    viewer.setMeasuring(on);
    $('measure-read').textContent = on ? 'Click two points on the model.' : '';
  });
  viewer.onMeasure((mm) => {
    $('measure-read').textContent = mm == null ? 'Click the second point.' : 'Distance ' + mm.toFixed(2) + ' mm.';
  });

  $('export-stl').onclick = () => {
    const mesh = sceneMesh();
    if (!mesh.length) { status('Add or import a model first.'); return; }
    const name = exportName('stl');
    download(toBinarySTL(mesh), name, 'model/stl');
    status('Saved ' + name + '. Open it in the printer slicer, for example PreForm, RayWare or Chitubox. This app does not slice to printer-proprietary formats.');
  };
  $('export-3mf').onclick = () => {
    const mesh = sceneMesh();
    if (!mesh.length) { status('Add or import a model first.'); return; }
    const name = exportName('3mf');
    download(to3MF(mesh), name, 'model/3mf');
    status('Saved ' + name + '. 3MF here is a plain mesh package. Open the STL or 3MF in the printer slicer.');
  };

  $('undo').onclick = undo;
  $('redo').onclick = redo;
  $('save-project').onclick = saveProject;
  $('open-project').onclick = openProject;
  $('delete-project').onclick = deleteProject;

  $('owner').onclick = () => { $('owner-dialog').showModal(); $('owner-pin').focus(); };
  $('owner-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (ownerUnlock($('owner-pin').value)) {
      $('owner-dialog').close();
      $('owner-pin').value = '';
      $('owner-msg').textContent = '';
      paintOwner();
      status('Owner access is on.');
    } else {
      $('owner-msg').textContent = 'That PIN did not match.';
      $('owner-pin').value = '';
    }
  });
  $('owner-cancel').onclick = () => { $('owner-dialog').close(); $('owner-msg').textContent = ''; };
  $('owner-off').onclick = () => { ownerOff(); paintOwner(); status('Owner access is off.'); };

  window.addEventListener('cb-payid-unlock', () => {
    status('Unlocked on this device. Payment is not verified.');
  });
  window.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    e.preventDefault();
    if (e.shiftKey) redo(); else undo();
  });
}

bind();
status('Ready. Import a scan or add a library model. Nothing is uploaded.');
