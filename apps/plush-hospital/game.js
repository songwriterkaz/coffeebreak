import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const SAVE_KEY = 'cb-plush-hospital-v1';
const WALK = 3.25;
const DEMO_LIMIT = 3;

const ROOMS = [
  { id: 'pink', name: 'Pink Ward', hearts: 0, demo: true, x: 0, z: 0, floor: 0xf3b7c8, wall: 0xffe4ee, doors: ['n', 'e', 's', 'w'] },
  { id: 'nook', name: 'Lamp Nook', hearts: 1, demo: true, x: 0, z: -8, floor: 0xf6c7ae, wall: 0xffeadc, doors: ['s'] },
  { id: 'cupboard', name: 'Button Cupboard', hearts: 2, demo: true, x: 8, z: 0, floor: 0xf7c3d6, wall: 0xffe6f0, doors: ['w', 's'] },
  { id: 'sewing', name: 'Sewing Nook', hearts: 3, demo: false, x: -8, z: 0, floor: 0xf0c0cf, wall: 0xffe3ea, doors: ['e'] },
  { id: 'loft', name: 'Stuffing Loft', hearts: 5, demo: false, x: 0, z: 8, floor: 0xf8d7c4, wall: 0xfff0e6, doors: ['n', 'e'] },
  { id: 'garden', name: 'Cuddle Conservatory', hearts: 7, demo: false, x: 8, z: 8, floor: 0xf6c9d4, wall: 0xffe8f1, doors: ['n', 'w'] }
];

const DOORS = [
  { a: 'pink', b: 'nook', x: 0, z: -4, hx: 0.9, hz: 1.2 },
  { a: 'pink', b: 'cupboard', x: 4, z: 0, hx: 1.2, hz: 0.9 },
  { a: 'pink', b: 'sewing', x: -4, z: 0, hx: 1.2, hz: 0.9 },
  { a: 'pink', b: 'loft', x: 0, z: 4, hx: 0.9, hz: 1.2 },
  { a: 'cupboard', b: 'garden', x: 8, z: 4, hx: 0.9, hz: 1.2 },
  { a: 'loft', b: 'garden', x: 4, z: 8, hx: 1.2, hz: 0.9 }
];

const QUEUE = [
  { name: 'Pip', kind: 'seam', color: '#f4a8c4' },
  { name: 'Mallow', kind: 'stuff', color: '#f7c0d4' },
  { name: 'Dot', kind: 'eye', color: '#e98ab0' },
  { name: 'Nib', kind: 'fever', color: '#f3b0c0' },
  { name: 'Rosie', kind: 'sad', color: '#e7a0c0' }
];

const SHOP_ITEMS = [
  { name: 'Pink plush doctor', color: '#f4a6c2', coat: true, kind: '' },
  { name: 'Pip the torn-seam bunny', color: '#f4a8c4', coat: false, kind: 'seam' },
  { name: 'Mallow the stuffing bear', color: '#f7c0d4', coat: false, kind: 'stuff' },
  { name: 'Dot the button-eye kitty', color: '#e98ab0', coat: false, kind: 'eye' },
  { name: 'Nib the fever pup', color: '#f3b0c0', coat: false, kind: 'fever' },
  { name: 'Rosie the sad-mood plush', color: '#e7a0c0', coat: false, kind: 'sad' }
];

const GAME_UNLOCK = 'Coffeebreak Plush Hospital';

const KINDS = {
  seam: { label: 'Torn seam', tool: 'needle', text: 'A seam has split along the side.' },
  stuff: { label: 'Lost stuffing', tool: 'stuffing', text: 'This plush is a little flat.' },
  eye: { label: 'Button eye', tool: 'bandage', text: 'A button eye has come loose.' },
  fever: { label: 'Fever', tool: 'thermo', text: 'This plush feels too warm.' },
  sad: { label: 'Sad mood', tool: 'cuddle', text: 'This plush needs a gentle cuddle.' }
};

const TOOLS = {
  thermo: 'Thermometer',
  steth: 'Stethoscope',
  bandage: 'Bandage',
  needle: 'Needle and thread',
  stuffing: 'Stuffing refill',
  cuddle: 'Cuddle'
};

const STEPS = [
  'You are the plush doctor. The Pink Ward is warm, soft, and ready.',
  'Move with W A S D or the arrow keys. Q and E turn you. Drag the scene to look. On a touch screen, use the round pad at the lower left.',
  'Tap See the patient, or press Enter. The chart names what is wrong.',
  'Torn seam: needle and thread. Lost stuffing: stuffing refill. Button eye: bandage. Fever: thermometer. Sad mood: cuddle.',
  'The stethoscope listens and names the care they need. Try any tool below. Practice does not use a patient.',
  'Tap the targets in each mini-game. A healed patient gives you a heart.',
  'Hearts open the Lamp Nook and the Button Cupboard. Further rooms are in the full game.',
  'The free demo covers the first ward and 3 patients. Full game $10 USD. Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com'
];

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let save = loadSave();
let mode = 'title';
let tutorialReturn = 'title';
let step = 0;
let payFrom = 'title';
let shopFrom = 'title';
let patient = null;
let healing = false;
let miniPractice = false;
let miniTool = '';
let orderNeed = 0;
let orderCount = 0;
let fill = 0;
let thermoT = 0;
let thermoHits = 0;
let cuddleT = 0;
let cuddleHits = 0;
let stethT = 0;
let stethHits = 0;
let miniLive = false;
let yaw = -0.45;
let pitch = 0.12;
let xr = false;
let loopOn = false;
let walkTo = null;
let audioCtx = null;
let master = null;
let droneOn = false;
let toastTimer = 0;
let cartTries = 0;
let lookId = null;
let lastX = 0;
let lastY = 0;
let stickId = null;
const keys = { f: false, b: false, l: false, r: false, q: false, e: false };
const stickVec = { x: 0, y: 0 };
const texCache = {};
const curtains = [];

let scene;
let camera;
let renderer;
let clock;
let player;
let doctor;
let patientMesh;
let belt;
let beltNote;
let vrMini;
let raycaster;
const hands = [];

function loadSave() {
  const blank = { v: 1, hearts: 0, healed: 0, mute: false, announced: {}, started: false };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return blank;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return blank;
    blank.hearts = Number(data.hearts) || 0;
    blank.healed = Number(data.healed) || 0;
    blank.mute = data.mute === true;
    blank.started = data.started === true || blank.healed > 0 || blank.hearts > 0;
    if (data.announced && typeof data.announced === 'object') blank.announced = data.announced;
    if (blank.healed > patientCap()) blank.healed = patientCap();
    if (blank.hearts < 0) blank.hearts = 0;
    return blank;
  } catch (err) {
    return blank;
  }
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (err) {
    /* storage can be blocked in a frame */
  }
  const line = document.getElementById('saved-line');
  if (line) line.textContent = 'Hearts saved: ' + save.hearts;
}

function roomById(id) {
  let i = 0;
  while (i < ROOMS.length) {
    if (ROOMS[i].id === id) return ROOMS[i];
    i += 1;
  }
  return null;
}

function honourUnlocked() {
  try {
    const raw = localStorage.getItem('cb-payid-unlock:apps/plush-hospital');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.unlocked === true && data.paid !== true && data.verified !== true && data.confirmed !== true;
  } catch (err) {
    return false;
  }
}

function patientCap() {
  return honourUnlocked() ? QUEUE.length : DEMO_LIMIT;
}

function canEnter(room) {
  if (!room) return false;
  if (save.hearts < room.hearts) return false;
  if (room.demo) return true;
  return honourUnlocked();
}

function forwardVector(angle) {
  return new THREE.Vector3(Math.sin(angle), 0, -Math.cos(angle));
}

function $(id) {
  return document.getElementById(id);
}

function show(id, on) {
  const el = $(id);
  if (!el) return;
  el.classList.toggle('open', on);
  el.setAttribute('aria-hidden', on ? 'false' : 'true');
}

function showPanels() {
  show('screen-title', mode === 'title');
  show('screen-tutorial', mode === 'tutorial');
  show('screen-mini', mode === 'mini');
  show('screen-pay', mode === 'pay');
  show('screen-shop', mode === 'shop');
  const playish = mode === 'play' || mode === 'chart' || mode === 'rooms';
  show('hud', playish);
  show('screen-chart', mode === 'chart');
  show('screen-rooms', mode === 'rooms');
  show('stick', mode === 'play' || mode === 'chart');
  const door = $('btn-door');
  if (door && mode !== 'play') door.style.display = 'none';
  document.body.dataset.screen = mode;
  updateHud();
  if (xr) syncVrMini();
}

function toast(text) {
  const el = $('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('open');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () { el.classList.remove('open'); }, 2600);
  setBeltNote(text);
}

function paintSound() {
  const label = save.mute ? 'Sound off' : 'Sound on';
  $('btn-title-sound').textContent = label;
  $('btn-sound').textContent = label;
}

function updateHud() {
  $('hud-hearts').textContent = 'Hearts ' + save.hearts;
  const cap = patientCap();
  $('hud-patients').textContent = 'Patients ' + Math.min(save.healed, cap) + ' of ' + cap;
  if (player) $('hud-ward').textContent = wardNameAt(player.position.x, player.position.z);
  if (patient && save.healed < patientCap()) $('hud-who').textContent = patient.name + ' needs care';
  else $('hud-who').textContent = 'Ward is quiet';
  const fit = mode === 'chart' && patient ? KINDS[patient.kind].tool : '';
  Object.keys(TOOLS).forEach(function (id) {
    const btn = $('btn-tool-' + id);
    if (!btn) return;
    btn.classList.toggle('fit', id === fit);
  });
}

function wardNameAt(x, z) {
  let name = 'Doorway';
  let i = 0;
  while (i < ROOMS.length) {
    const room = ROOMS[i];
    if (Math.abs(x - room.x) <= WALK && Math.abs(z - room.z) <= WALK) name = room.name;
    i += 1;
  }
  return name;
}

function resumeAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx || save.mute) return;
  if (!audioCtx) {
    audioCtx = new Ctx();
    master = audioCtx.createGain();
    master.gain.value = 0.18;
    master.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (!droneOn) startDrone();
}

function startDrone() {
  if (!audioCtx || !master) return;
  const notes = [196, 246.94, 293.66];
  let i = 0;
  while (i < notes.length) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[i];
    gain.gain.value = 0.012;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    i += 1;
  }
  droneOn = true;
}

function tone(freq, dur, type, vol) {
  if (save.mute || !audioCtx || !master) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(vol || 0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + dur);
}

function blip() { tone(560, 0.08, 'sine', 0.06); }
function thud() { tone(160, 0.14, 'triangle', 0.07); }
function chime() {
  tone(523, 0.16, 'sine', 0.07);
  window.setTimeout(function () { tone(659, 0.16, 'sine', 0.06); }, 90);
  window.setTimeout(function () { tone(784, 0.22, 'sine', 0.06); }, 180);
}

function setMute(next) {
  save.mute = next;
  if (master) master.gain.value = next ? 0 : 0.18;
  saveGame();
  paintSound();
  if (!next) resumeAudio();
}

function plushTex(hex) {
  if (texCache[hex]) return texCache[hex];
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = hex;
  g.fillRect(0, 0, 128, 128);
  let i = 0;
  while (i < 420) {
    g.fillStyle = 'rgba(255,255,255,' + ((i % 6) / 48) + ')';
    g.fillRect((i * 17) % 128, (i * 29) % 128, 2, 2);
    i += 1;
  }
  g.strokeStyle = 'rgba(110, 45, 70, 0.28)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(64, 8);
  g.lineTo(66, 120);
  g.moveTo(18, 70);
  g.lineTo(110, 62);
  g.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  texCache[hex] = tex;
  return tex;
}

function plushMat(hex) {
  return new THREE.MeshLambertMaterial({ map: plushTex(hex), color: '#ffffff' });
}

function labelTexture(text, bg) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const g = canvas.getContext('2d');
  g.fillStyle = bg || '#e978a8';
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = '#fffafb';
  g.font = '700 42px Georgia';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(text).slice(0, 16), 128, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function labelMesh(text) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.12, 0.02),
    new THREE.MeshLambertMaterial({ map: labelTexture(text) })
  );
}

function labelSprite(text) {
  const mat = new THREE.SpriteMaterial({ map: labelTexture(text, '#fff7f4'), transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.15, 0.36, 1);
  return sprite;
}

function makePlush(color, withCoat) {
  const g = new THREE.Group();
  const mat = plushMat(color);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 28, 18), mat);
  body.scale.set(1.02, 1.18, 0.9);
  body.position.y = 0.62;
  body.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 28, 18), mat);
  head.position.y = 1.2;
  head.castShadow = true;
  const earG = new THREE.SphereGeometry(0.12, 16, 12);
  const earL = new THREE.Mesh(earG, mat);
  earL.position.set(-0.2, 1.46, 0);
  earL.scale.set(0.85, 1.2, 0.55);
  const earR = new THREE.Mesh(earG, mat);
  earR.position.set(0.2, 1.46, 0);
  earR.scale.set(0.85, 1.2, 0.55);
  const eyeMat = new THREE.MeshLambertMaterial({ color: '#4a2436' });
  const eyeG = new THREE.SphereGeometry(0.045, 12, 10);
  const eyeL = new THREE.Mesh(eyeG, eyeMat);
  eyeL.position.set(-0.09, 1.22, -0.26);
  const eyeR = new THREE.Mesh(eyeG, eyeMat);
  eyeR.position.set(0.09, 1.22, -0.26);
  const blushMat = new THREE.MeshLambertMaterial({ color: '#ff8fb3' });
  const blushG = new THREE.SphereGeometry(0.05, 10, 8);
  const blushL = new THREE.Mesh(blushG, blushMat);
  blushL.position.set(-0.16, 1.12, -0.22);
  blushL.scale.set(1, 0.7, 0.4);
  const blushR = new THREE.Mesh(blushG, blushMat);
  blushR.position.set(0.16, 1.12, -0.22);
  blushR.scale.set(1, 0.7, 0.4);
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), eyeMat);
  mouth.scale.set(1.6, 0.45, 0.4);
  mouth.position.set(0, 1.08, -0.27);
  const armG = new THREE.SphereGeometry(0.12, 14, 12);
  const armL = new THREE.Mesh(armG, mat);
  armL.position.set(-0.48, 0.7, 0);
  const armR = new THREE.Mesh(armG, mat);
  armR.position.set(0.48, 0.7, 0);
  const legG = new THREE.SphereGeometry(0.11, 12, 10);
  const legL = new THREE.Mesh(legG, mat);
  legL.position.set(-0.16, 0.12, 0);
  const legR = new THREE.Mesh(legG, mat);
  legR.position.set(0.16, 0.12, 0);
  g.add(body, head, earL, earR, eyeL, eyeR, blushL, blushR, mouth, armL, armR, legL, legR);
  if (withCoat) addCoat(g);
  const ailment = new THREE.Group();
  g.add(ailment);
  g.userData.parts = { body: body, eyeL: eyeL, eyeR: eyeR, mouth: mouth, blushL: blushL, blushR: blushR, ailment: ailment };
  return g;
}

function addCoat(g) {
  const white = new THREE.MeshLambertMaterial({ color: '#fff8fb' });
  const coat = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 16), white);
  coat.scale.set(1.05, 0.72, 0.78);
  coat.position.set(0, 0.58, 0.02);
  const glassMat = new THREE.MeshLambertMaterial({ color: '#6a3044' });
  const ring = new THREE.TorusGeometry(0.07, 0.01, 8, 18);
  const gL = new THREE.Mesh(ring, glassMat);
  gL.position.set(-0.09, 1.22, -0.3);
  const gR = new THREE.Mesh(ring, glassMat);
  gR.position.set(0.09, 1.22, -0.3);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.012), glassMat);
  bridge.position.set(0, 1.22, -0.31);
  const scope = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 20, Math.PI), glassMat);
  scope.position.set(0, 0.95, -0.24);
  scope.rotation.z = Math.PI;
  const badge = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), plushMat('#f7b6cf'));
  badge.position.set(0.14, 0.72, -0.38);
  badge.scale.z = 0.35;
  g.add(coat, gL, gR, bridge, scope, badge);
}

function applyAilment(group, kind) {
  const parts = group.userData.parts;
  const bucket = parts.ailment;
  while (bucket.children.length) bucket.remove(bucket.children[0]);
  parts.eyeL.visible = true;
  parts.eyeR.visible = true;
  parts.eyeL.position.y = 1.22;
  parts.eyeR.position.y = 1.22;
  parts.body.scale.set(1.02, 1.18, 0.9);
  parts.mouth.position.y = 1.08;
  parts.mouth.rotation.z = 0;
  parts.blushL.scale.set(1, 0.7, 0.4);
  parts.blushR.scale.set(1, 0.7, 0.4);
  if (kind === 'seam') {
    const thread = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.42, 0.03), new THREE.MeshLambertMaterial({ color: '#6a3044' }));
    thread.position.set(0.36, 0.7, -0.1);
    thread.rotation.z = 0.25;
    bucket.add(thread);
  } else if (kind === 'stuff') {
    parts.body.scale.set(1.02, 0.84, 0.8);
    let i = 0;
    while (i < 3) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshLambertMaterial({ color: '#fff6ea' }));
      puff.position.set(0.46, 0.28 + i * 0.14, 0.12);
      bucket.add(puff);
      i += 1;
    }
  } else if (kind === 'eye') {
    parts.eyeR.visible = false;
    const loose = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), new THREE.MeshLambertMaterial({ color: '#4a2436' }));
    loose.rotation.x = Math.PI / 2;
    loose.position.set(0.38, 0.08, 0.22);
    bucket.add(loose);
  } else if (kind === 'fever') {
    parts.blushL.scale.set(1.5, 1.05, 0.55);
    parts.blushR.scale.set(1.5, 1.05, 0.55);
  } else if (kind === 'sad') {
    parts.mouth.position.y = 1.02;
    parts.mouth.rotation.z = 0.5;
    parts.eyeL.position.y = 1.17;
    parts.eyeR.position.y = 1.17;
  }
}

function smile(group) {
  const parts = group.userData.parts;
  while (parts.ailment.children.length) parts.ailment.remove(parts.ailment.children[0]);
  parts.eyeL.visible = true;
  parts.eyeR.visible = true;
  parts.body.scale.set(1.05, 1.22, 0.92);
  parts.mouth.position.y = 1.12;
  parts.mouth.rotation.z = 0;
}

function addBox(w, h, d, color, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: color }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addWall(room, side) {
  const H = 3.62;
  const wh = 1.35;
  const doorHalf = 0.85;
  const hasDoor = room.doors.indexOf(side) !== -1;
  const alongX = side === 'n' || side === 's';
  const sign = side === 'n' || side === 'w' ? -1 : 1;
  const mat = new THREE.MeshLambertMaterial({ color: room.wall });
  function place(span, shift) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(alongX ? span : 0.16, wh, alongX ? 0.16 : span),
      mat
    );
    mesh.position.set(
      room.x + (alongX ? shift : sign * H),
      wh / 2,
      room.z + (alongX ? sign * H : shift)
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
  if (!hasDoor) {
    place(7.3, 0);
    return;
  }
  const span = 2.8;
  const offset = doorHalf + span / 2;
  place(span, -offset);
  place(span, offset);
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(alongX ? doorHalf * 2 : 0.16, 0.42, alongX ? 0.16 : doorHalf * 2),
    mat
  );
  lintel.position.set(room.x + (alongX ? 0 : sign * H), wh - 0.21, room.z + (alongX ? sign * H : 0));
  scene.add(lintel);
}

function buildRooms() {
  let i = 0;
  while (i < ROOMS.length) {
    const room = ROOMS[i];
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(7.3, 0.2, 7.3),
      new THREE.MeshLambertMaterial({ color: room.floor })
    );
    floor.position.set(room.x, -0.1, room.z);
    floor.receiveShadow = true;
    scene.add(floor);
    addWall(room, 'n');
    addWall(room, 's');
    addWall(room, 'e');
    addWall(room, 'w');
    const light = new THREE.PointLight(0xffc8b4, 14, 10, 2);
    light.position.set(room.x, 2.2, room.z);
    scene.add(light);
    i += 1;
  }
  DOORS.forEach(function (door) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 1.35),
      new THREE.MeshLambertMaterial({ color: 0xf7b7cf, transparent: true, opacity: 0.78, side: THREE.DoubleSide })
    );
    mesh.position.set(door.x, 0.7, door.z);
    if (door.hx > door.hz) mesh.rotation.y = Math.PI / 2;
    scene.add(mesh);
    curtains.push({ door: door, mesh: mesh });
  });
}

function dressWard() {
  addBox(1.5, 0.28, 2.05, 0xc9856a, -1.7, 0.2, -1.45);
  addBox(1.35, 0.22, 1.85, 0xf7c3d4, -1.7, 0.42, -1.45);
  const pillow = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), new THREE.MeshLambertMaterial({ color: 0xfff8fb }));
  pillow.scale.set(1.1, 0.42, 0.7);
  pillow.position.set(-1.7, 0.62, -2.0);
  scene.add(pillow);
  addBox(0.7, 0.36, 0.7, 0xd7a07a, 1.7, 0.18, -1.5);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 16), new THREE.MeshLambertMaterial({ color: 0xf4a8c4 }));
  cup.position.set(1.7, 0.44, -1.5);
  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 12), new THREE.MeshLambertMaterial({ color: 0x6b3e32 }));
  coffee.position.set(1.7, 0.52, -1.5);
  scene.add(cup, coffee);
  addBox(1.8, 0.04, 1.4, 0xffc2d4, 0.2, 0.02, 0.7);

  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshLambertMaterial({ color: 0xfff1c9, emissive: 0xffb070, emissiveIntensity: 0.7 }));
  lamp.position.set(0.2, 1.7, -8.4);
  addBox(0.08, 1.5, 0.08, 0xc9856a, 0.2, 0.75, -8.4);
  scene.add(lamp);
  addBox(0.7, 0.45, 0.7, 0xf4a8c4, -0.9, 0.28, -7.3);

  addBox(1.6, 0.1, 0.45, 0xd7a07a, 8, 0.9, -0.2);
  let b = 0;
  const buttonColours = [0x4a2436, 0xf4a8c4, 0xfff6ea, 0xe978a8];
  while (b < 4) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), new THREE.MeshLambertMaterial({ color: buttonColours[b] }));
    btn.position.set(7.55 + b * 0.28, 1.0, -0.2);
    scene.add(btn);
    b += 1;
  }

  addBox(1.2, 0.4, 0.7, 0xc9856a, -8, 0.28, 0.2);
  const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12), plushMat('#f4a8c4'));
  spool.rotation.z = Math.PI / 2;
  spool.position.set(-8, 0.56, 0.2);
  scene.add(spool);

  let p = 0;
  while (p < 4) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), new THREE.MeshLambertMaterial({ color: 0xfff6ea }));
    puff.position.set(-0.6 + (p % 2) * 0.7, 0.22, 7.6 + Math.floor(p / 2) * 0.55);
    scene.add(puff);
    p += 1;
  }

  let f = 0;
  while (f < 5) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), new THREE.MeshLambertMaterial({ color: 0xc9856a }));
    stem.position.set(7.2 + f * 0.35, 0.25, 7.7);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), plushMat('#f4a8c4'));
    bloom.position.set(7.2 + f * 0.35, 0.55, 7.7);
    scene.add(stem, bloom);
    f += 1;
  }
  dressGiftShop();
}

function dressGiftShop() {
  addBox(2.55, 0.46, 0.72, 0xd7a07a, 2.05, 0.23, 2.05);
  addBox(2.35, 0.08, 0.56, 0xf7c3d4, 2.05, 0.48, 2.05);
  const sign = labelSprite('Gift Shop');
  sign.position.set(2.05, 1.62, 2.05);
  scene.add(sign);
  let i = 0;
  while (i < SHOP_ITEMS.length) {
    const item = SHOP_ITEMS[i];
    const plush = makePlush(item.color, item.coat);
    if (item.kind) applyAilment(plush, item.kind);
    plush.scale.set(0.32, 0.32, 0.32);
    plush.position.set(0.95 + i * 0.42, 0.5, 2.05);
    plush.rotation.y = 0.45;
    scene.add(plush);
    i += 1;
  }
}

function refreshCurtains() {
  curtains.forEach(function (item) {
    const open = canEnter(roomById(item.door.a)) && canEnter(roomById(item.door.b));
    item.mesh.visible = open ? false : true;
  });
}

function insideOpen(x, z) {
  let i = 0;
  while (i < ROOMS.length) {
    const room = ROOMS[i];
    if (canEnter(room) && Math.abs(x - room.x) <= WALK && Math.abs(z - room.z) <= WALK) return true;
    i += 1;
  }
  let d = 0;
  while (d < DOORS.length) {
    const door = DOORS[d];
    if (canEnter(roomById(door.a)) && canEnter(roomById(door.b))) {
      if (Math.abs(x - door.x) <= door.hx && Math.abs(z - door.z) <= door.hz) return true;
    }
    d += 1;
  }
  return false;
}

function movePlayer(nx, nz) {
  if (insideOpen(nx, nz)) {
    player.position.x = nx;
    player.position.z = nz;
    return;
  }
  if (insideOpen(nx, player.position.z)) player.position.x = nx;
  else if (insideOpen(player.position.x, nz)) player.position.z = nz;
}

function ensurePatient() {
  if (patientMesh) {
    scene.remove(patientMesh);
    patientMesh = null;
  }
  if (save.healed >= patientCap()) {
    patient = null;
    updateHud();
    return;
  }
  const spec = QUEUE[save.healed];
  patient = spec;
  patientMesh = makePlush(spec.color, false);
  applyAilment(patientMesh, spec.kind);
  patientMesh.position.set(-1.35, 0, -0.9);
  patientMesh.rotation.y = Math.atan2(0.15 - (-1.35), -((0.35) - (-0.9)));
  patientMesh.userData.action = function () { seePatient(); };
  const tag = labelSprite(spec.name);
  tag.position.y = 1.78;
  patientMesh.add(tag);
  scene.add(patientMesh);
  updateHud();
}

function placeCamera() {
  if (xr || !camera || !player) return;
  const f = forwardVector(yaw);
  const back = 3.1;
  const height = 3.55 + pitch * 0.4;
  camera.position.set(player.position.x - f.x * back, height, player.position.z - f.z * back);
  camera.lookAt(player.position.x + f.x * 0.6, 0.7, player.position.z + f.z * 0.6);
  player.rotation.y = yaw;
}

function setBeltNote(text) {
  if (!beltNote) return;
  beltNote.material.map = labelTexture(text, '#a33b68');
  beltNote.material.needsUpdate = true;
}

function buildBelt() {
  belt = new THREE.Group();
  belt.position.set(0, -0.42, -1.05);
  camera.add(belt);
  beltNote = labelMesh('Pink Ward');
  beltNote.scale.set(1.8, 1, 1);
  beltNote.position.set(0, 0.2, 0);
  belt.add(beltNote);
  const items = [
    ['Temp', 'thermo'],
    ['Listen', 'steth'],
    ['Wrap', 'bandage'],
    ['Sew', 'needle'],
    ['Stuff', 'stuffing'],
    ['Cuddle', 'cuddle']
  ];
  items.forEach(function (item, index) {
    const mesh = labelMesh(item[0]);
    mesh.position.set((index - 2.5) * 0.28, 0.02, 0);
    mesh.userData.action = function () { useTool(item[1]); };
    belt.add(mesh);
  });
  const see = labelMesh('Patient');
  see.position.set(0, -0.16, 0);
  see.userData.action = function () { seePatient(); };
  belt.add(see);
  belt.visible = false;
  vrMini = new THREE.Group();
  vrMini.position.set(0, 0.05, -0.95);
  camera.add(vrMini);
  vrMini.visible = false;
}

function syncVrMini() {
  if (!vrMini) return;
  while (vrMini.children.length) vrMini.remove(vrMini.children[0]);
  if (!xr || mode !== 'mini') {
    vrMini.visible = false;
    return;
  }
  vrMini.visible = true;
  const buttons = $('screen-mini').querySelectorAll('button');
  let i = 0;
  buttons.forEach(function (button) {
    if (button.disabled) return;
    const mesh = labelMesh(button.textContent);
    mesh.position.set((i % 3) * 0.32 - 0.32, 0.2 - Math.floor(i / 3) * 0.16, 0);
    mesh.userData.action = function () { button.click(); };
    vrMini.add(mesh);
    i += 1;
  });
}

function onSelect(event) {
  const controller = event.target;
  const origin = new THREE.Vector3().setFromMatrixPosition(controller.matrixWorld);
  const quat = new THREE.Quaternion().setFromRotationMatrix(controller.matrixWorld);
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
  raycaster.set(origin, dir);
  const list = [];
  if (belt) belt.children.forEach(function (child) { list.push(child); });
  if (vrMini) vrMini.children.forEach(function (child) { list.push(child); });
  if (patientMesh) list.push(patientMesh);
  const hits = raycaster.intersectObjects(list, true);
  if (!hits.length) return;
  let node = hits[0].object;
  while (node && !node.userData.action) node = node.parent;
  if (node && node.userData.action) node.userData.action();
}

function setupHands() {
  let i = 0;
  while (i < 2) {
    const hand = renderer.xr.getController(i);
    player.add(hand);
    const gem = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshLambertMaterial({ color: 0xffd0e2 }));
    hand.add(gem);
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xff8ab0 }));
    line.scale.z = 2;
    hand.add(line);
    hand.addEventListener('selectstart', onSelect);
    hand.visible = false;
    hands.push(hand);
    i += 1;
  }
}

function readVrAxes(dt) {
  const session = renderer.xr.getSession();
  if (!session) return { turn: 0, forward: 0, strafe: 0 };
  let turn = 0;
  let forward = 0;
  let strafe = 0;
  session.inputSources.forEach(function (source) {
    const pad = source.gamepad;
    if (!pad || !pad.axes) return;
    const pairs = [[0, 1], [2, 3]];
    pairs.forEach(function (pair) {
      if (pad.axes.length <= pair[1]) return;
      const ax = pad.axes[pair[0]];
      const ay = pad.axes[pair[1]];
      if (Math.abs(ax) + Math.abs(ay) < 0.25) return;
      turn += ax;
      forward += -ay;
      strafe += ax * 0.35;
    });
  });
  return { turn: turn * dt, forward: forward, strafe: strafe };
}

function resize() {
  if (!renderer || !camera) return;
  const w = window.innerWidth;
  const h = Math.max(window.innerHeight, 1);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function nearestLockedDoor() {
  let best = null;
  let bestD = 1.65;
  curtains.forEach(function (item) {
    if (!item.mesh.visible) return;
    const dx = player.position.x - item.door.x;
    const dz = player.position.z - item.door.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < bestD) {
      bestD = dist;
      best = item;
    }
  });
  return best;
}

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  if (xr) {
    const axes = readVrAxes(dt);
    yaw -= axes.turn * 1.4;
    const f = forwardVector(yaw);
    const right = new THREE.Vector3(-f.z, 0, f.x);
    const speed = 2.3 * dt;
    movePlayer(
      player.position.x + f.x * axes.forward * speed + right.x * axes.strafe * speed,
      player.position.z + f.z * axes.forward * speed + right.z * axes.strafe * speed
    );
    player.rotation.y = yaw;
  }
  if (!xr && (mode === 'play' || mode === 'chart')) {
    if (keys.q) yaw += dt * 1.7;
    if (keys.e) yaw -= dt * 1.7;
    let ix = 0;
    let iz = 0;
    if (keys.f) iz += 1;
    if (keys.b) iz -= 1;
    if (keys.r) ix += 1;
    if (keys.l) ix -= 1;
    ix += stickVec.x;
    iz += -stickVec.y;
    if (walkTo) {
      const dx = walkTo.x - player.position.x;
      const dz = walkTo.z - player.position.z;
      if (dx * dx + dz * dz < 0.08) walkTo = null;
      else {
        ix += dx * 0.8;
        iz += dz * 0.8;
        yaw = Math.atan2(dx, -dz);
      }
    }
    const len = Math.hypot(ix, iz);
    if (len > 1) {
      ix /= len;
      iz /= len;
    }
    const f = forwardVector(yaw);
    const right = new THREE.Vector3(-f.z, 0, f.x);
    const speed = 2.5 * dt;
    const moving = Math.abs(ix) + Math.abs(iz) > 0.05;
    movePlayer(
      player.position.x + (f.x * iz + right.x * ix) * speed,
      player.position.z + (f.z * iz + right.z * ix) * speed
    );
    if (doctor && !reduceMotion) doctor.position.y = moving ? Math.sin(t * 10) * 0.04 : 0;
    placeCamera();
    const doorBtn = $('btn-door');
    const near = mode === 'play' ? nearestLockedDoor() : null;
    doorBtn.style.display = near ? 'inline-block' : 'none';
    if (Math.floor(t * 2) !== Math.floor((t - dt) * 2)) updateHud();
  } else if (!xr) {
    placeCamera();
  }
  if (patientMesh && !reduceMotion) {
    patientMesh.position.y = Math.sin(t * 2) * 0.03;
  }
  if (miniLive) stepMini(dt);
  if (belt) belt.visible = xr;
  renderer.render(scene, camera);
}

function renderTutorial() {
  $('tut-text').textContent = STEPS[step];
  $('btn-tut-next').textContent = step === STEPS.length - 1 ? 'Play the ward' : 'Next';
}

function openTutorial(from) {
  tutorialReturn = from;
  step = 0;
  mode = 'tutorial';
  renderTutorial();
  showPanels();
  resumeAudio();
}

function closeTutorial() {
  mode = tutorialReturn === 'play' ? 'play' : 'title';
  showPanels();
}

function startPlay() {
  if (!renderer) {
    toast('This browser could not start the 3D view.');
    return;
  }
  mode = 'play';
  save.started = true;
  if (!loopOn) {
    renderer.setAnimationLoop(tick);
    loopOn = true;
  }
  ensurePatient();
  showPanels();
  saveGame();
  resumeAudio();
  setBeltNote('Pink Ward');
}

function seePatient() {
  if (!renderer) {
    toast('The 3D view did not start.');
    return;
  }
  if (mode === 'title' || mode === 'tutorial') startPlay();
  if (save.healed >= patientCap() || !patient) {
    if (!honourUnlocked() && save.healed >= DEMO_LIMIT) openPay('play');
    else toast('Every patient in this visit is comfortable.');
    return;
  }
  mode = 'chart';
  const kind = KINDS[patient.kind];
  $('chart-name').textContent = patient.name;
  $('chart-ail').textContent = kind.label;
  $('chart-blurb').textContent = kind.text;
  $('chart-hint').textContent = 'Choose a tool, or listen with the stethoscope.';
  showPanels();
  walkTo = { x: 0.15, z: -0.15 };
  setBeltNote(patient.name + ': ' + kind.label);
  blip();
}

function hintFor(kind) {
  const name = patient ? patient.name : 'This plush';
  if (kind === 'seam') return name + ' needs a needle and thread.';
  if (kind === 'stuff') return name + ' needs a stuffing refill.';
  if (kind === 'eye') return name + ' needs a bandage on the button eye.';
  if (kind === 'fever') return name + ' needs the thermometer.';
  return name + ' needs a cuddle.';
}

function useTool(id) {
  resumeAudio();
  if (mode === 'tutorial') {
    openMini(id, true);
    return;
  }
  if (mode === 'mini') {
    toast('Finish this care, or close it.');
    return;
  }
  if (mode !== 'chart') {
    toast('See the patient first.');
    return;
  }
  if (!patient) {
    openPay('play');
    return;
  }
  if (id === 'steth') {
    openMini('steth', false);
    return;
  }
  if (KINDS[patient.kind].tool !== id) {
    toast('That tool can rest. The stethoscope can name the right care.');
    thud();
    return;
  }
  openMini(id, false);
}

function addMiniButton(parent, label, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tap';
  button.textContent = label;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

function openMini(tool, practice) {
  miniPractice = practice;
  miniTool = tool;
  orderNeed = 0;
  orderCount = 0;
  fill = 0;
  thermoT = 0;
  thermoHits = 0;
  cuddleT = 0;
  cuddleHits = 0;
  stethT = 0;
  stethHits = 0;
  miniLive = true;
  mode = 'mini';
  $('mini-title').textContent = TOOLS[tool];
  const help = {
    needle: 'Tap the stitches from 1 to 5.',
    bandage: 'Tap the wraps from 1 to 3.',
    stuffing: 'Add stuffing until the bar sits in the green band, then press Stop.',
    thermo: 'Press Read temperature while the mark sits in the green band. Three calm reads.',
    cuddle: 'Press Cuddle while the button glows. Four gentle taps.',
    steth: 'Press Listen while the button glows. Four beats.'
  };
  $('mini-help').textContent = help[tool];
  const body = $('mini-body');
  body.replaceChildren();
  if (tool === 'needle') buildOrder(body, 5, 'Stitch');
  else if (tool === 'bandage') buildOrder(body, 3, 'Wrap');
  else if (tool === 'stuffing') buildStuffing(body);
  else if (tool === 'thermo') buildThermo(body);
  else if (tool === 'cuddle') buildPulse(body, 'Cuddle');
  else buildPulse(body, 'Listen');
  showPanels();
  blip();
}

function buildOrder(body, count, label) {
  orderCount = count;
  orderNeed = 0;
  const row = document.createElement('div');
  row.className = 'row';
  let i = 0;
  while (i < count) {
    const index = i;
    addMiniButton(row, label + ' ' + (i + 1), function (event) {
      if (index === orderNeed) {
        event.currentTarget.disabled = true;
        orderNeed += 1;
        blip();
        if (orderNeed === orderCount) onMiniSuccess();
        else if (xr) syncVrMini();
      } else {
        thud();
        toast('Follow the numbers in order.');
      }
    });
    i += 1;
  }
  body.appendChild(row);
}

function paintFill() {
  const level = $('meter-level');
  if (level) level.style.width = fill + '%';
}

function buildStuffing(body) {
  const meter = document.createElement('div');
  meter.className = 'meter';
  const level = document.createElement('div');
  level.className = 'level';
  level.id = 'meter-level';
  const zone = document.createElement('div');
  zone.className = 'zone';
  meter.append(level, zone);
  body.appendChild(meter);
  const row = document.createElement('div');
  row.className = 'row';
  addMiniButton(row, 'Add stuffing', function () {
    fill = Math.min(100, fill + 16);
    paintFill();
    blip();
  });
  addMiniButton(row, 'Ease off', function () {
    fill = Math.max(0, fill - 16);
    paintFill();
    blip();
  });
  addMiniButton(row, 'Stop', function () {
    if (fill >= 48 && fill <= 80) onMiniSuccess();
    else if (fill < 48) {
      thud();
      toast('A little more stuffing.');
    } else {
      thud();
      toast('Ease off a little.');
    }
  });
  body.appendChild(row);
}

function buildThermo(body) {
  const meter = document.createElement('div');
  meter.className = 'meter tall';
  const mark = document.createElement('div');
  mark.className = 'mark';
  mark.id = 'thermo-mark';
  const zone = document.createElement('div');
  zone.className = 'zone';
  meter.append(zone, mark);
  body.appendChild(meter);
  const note = document.createElement('p');
  note.id = 'thermo-note';
  note.textContent = 'Reads 0 of 3';
  body.appendChild(note);
  const row = document.createElement('div');
  row.className = 'row';
  addMiniButton(row, 'Read temperature', function () {
    const s = Math.sin(thermoT);
    if (s > -0.15 && s < 0.55) {
      thermoHits += 1;
      note.textContent = 'Reads ' + thermoHits + ' of 3';
      blip();
      if (thermoHits >= 3) onMiniSuccess();
    } else {
      thud();
      toast('Wait for the rose band.');
    }
  });
  body.appendChild(row);
}

function buildPulse(body, label) {
  const row = document.createElement('div');
  row.className = 'row';
  const button = addMiniButton(row, label, function () {
    const hot = miniTool === 'cuddle' ? cuddleHot() : stethHot();
    if (!hot) {
      thud();
      toast(miniTool === 'cuddle' ? 'Wait for the glow.' : 'Wait for the beat.');
      return;
    }
    blip();
    if (miniTool === 'cuddle') {
      cuddleHits += 1;
      if (cuddleHits >= 4) onMiniSuccess();
    } else {
      stethHits += 1;
      if (stethHits >= 4) onMiniSuccess();
    }
  });
  button.id = 'pulse-btn';
  body.appendChild(row);
}

function cuddleHot() { return (cuddleT % 1.6) < 0.85; }
function stethHot() { return (stethT % 1.15) < 0.48; }

function stepMini(dt) {
  if (mode !== 'mini') return;
  if (miniTool === 'thermo') {
    thermoT += dt * 1.7;
    const mark = $('thermo-mark');
    if (mark) {
      const p = (Math.sin(thermoT) + 1) / 2;
      mark.style.bottom = (p * 100) + '%';
    }
  } else if (miniTool === 'cuddle') {
    cuddleT += dt;
    const button = $('pulse-btn');
    if (button) button.classList.toggle('hot', cuddleHot());
  } else if (miniTool === 'steth') {
    stethT += dt;
    const button = $('pulse-btn');
    if (button) button.classList.toggle('hot', stethHot());
  }
}

function hideMini(next) {
  miniLive = false;
  mode = next;
  showPanels();
}

function onMiniSuccess() {
  if (miniTool === 'steth' && !miniPractice) {
    const hint = hintFor(patient ? patient.kind : 'seam');
    $('chart-hint').textContent = hint;
    toast(hint);
    chime();
    hideMini('chart');
    return;
  }
  if (miniPractice) {
    toast('That is the motion.');
    chime();
    hideMini('tutorial');
    return;
  }
  healPatient();
}

function announceRooms() {
  ROOMS.forEach(function (room) {
    if (!room.demo || room.hearts === 0) return;
    if (save.hearts >= room.hearts && !save.announced[room.id]) {
      save.announced[room.id] = true;
      toast(room.name + ' is open.');
    }
  });
}

function healPatient() {
  if (healing) return;
  healing = true;
  save.hearts += 1;
  save.healed += 1;
  if (patientMesh) smile(patientMesh);
  chime();
  const name = patient ? patient.name : 'The patient';
  toast(name + ' is comfortable. You earned a heart.');
  announceRooms();
  refreshCurtains();
  saveGame();
  miniLive = false;
  mode = 'play';
  showPanels();
  window.setTimeout(function () {
    healing = false;
    if (save.healed >= patientCap()) {
      patient = null;
      if (patientMesh) {
        scene.remove(patientMesh);
        patientMesh = null;
      }
      if ((mode === 'play' || mode === 'chart') && !honourUnlocked()) openPay('play');
      else updateHud();
    } else {
      ensurePatient();
      if (mode === 'play' || mode === 'chart') {
        mode = 'play';
        showPanels();
        if (patient) setBeltNote(patient.name + ' has arrived');
      }
    }
  }, reduceMotion ? 200 : 900);
}

function openPay(from) {
  payFrom = from || 'play';
  mode = 'pay';
  const ready = [];
  ROOMS.forEach(function (room) {
    if (!room.demo && save.hearts >= room.hearts) ready.push(room.name);
  });
  let extra = 'You have ' + save.hearts + ' hearts.';
  if (ready.length) extra += ' Hearts are ready for ' + ready.join(', ') + '.';
  else extra += ' Keep hearts for the rooms in the full game.';
  extra += ' This page does not mark a payment as received.';
  $('pay-extra').textContent = extra;
  showPanels();
}

function withCart(fn, tries) {
  const n = tries || 0;
  const toggle = $('cb-game-cart-toggle');
  const panel = $('cb-game-cart-panel');
  if (!toggle || !panel) {
    if (n > 12) {
      toast('The cart did not load. Reload the page.');
      return;
    }
    window.setTimeout(function () { withCart(fn, n + 1); }, 150);
    return;
  }
  if (panel.hidden) toggle.click();
  fn(panel);
  cartTries = n;
}

function addButtonFor(panel, name) {
  const rows = panel.querySelectorAll('.row');
  let i = 0;
  while (i < rows.length) {
    const strong = rows[i].querySelector('strong');
    if (strong && strong.textContent === name) {
      const buttons = rows[i].querySelectorAll('button');
      let b = 0;
      while (b < buttons.length) {
        if (buttons[b].textContent === 'Add to cart') return buttons[b];
        b += 1;
      }
    }
    i += 1;
  }
  return null;
}

function openCart(tries) {
  withCart(function (panel) {
    const text = panel.textContent || '';
    if (text.indexOf('Your cart is empty.') !== -1) {
      const add = addButtonFor(panel, GAME_UNLOCK);
      if (add) add.click();
      else {
        const buttons = panel.querySelectorAll('button');
        let i = 0;
        while (i < buttons.length) {
          if (buttons[i].textContent === 'Add to cart') {
            buttons[i].click();
            break;
          }
          i += 1;
        }
      }
    }
    toast('Cart open. Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com');
  }, tries);
}

function addPlushToCart(name) {
  withCart(function (panel) {
    const add = addButtonFor(panel, name);
    if (!add) {
      toast('That plush is not listed in the cart yet. Reload the page.');
      return;
    }
    add.click();
    toast(name + ' is in the cart. Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com. This page does not mark a payment as received.');
  }, 0);
}

function openShop(from) {
  shopFrom = from === 'play' ? 'play' : 'title';
  const close = $('btn-shop-close');
  if (close) close.textContent = shopFrom === 'play' ? 'Back to the ward' : 'Title screen';
  mode = 'shop';
  showPanels();
  blip();
}

function openRooms() {
  const list = $('room-list');
  list.replaceChildren();
  const shop = document.createElement('button');
  shop.type = 'button';
  shop.textContent = 'Gift Shop';
  shop.addEventListener('click', function () { openShop('play'); });
  list.appendChild(shop);
  ROOMS.forEach(function (room) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'room-btn';
    if (canEnter(room)) {
      button.textContent = 'Visit ' + room.name;
      button.addEventListener('click', function () {
        player.position.set(room.x, 0, room.z + 0.5);
        yaw = 0;
        walkTo = null;
        mode = 'play';
        showPanels();
        placeCamera();
        toast(room.name);
        blip();
      });
    } else if (!room.demo && !honourUnlocked()) {
      button.textContent = room.name + ' is in the full game';
      button.addEventListener('click', function () {
        toast(room.name + ' asks for ' + room.hearts + ' hearts. You have ' + save.hearts + '. Full game $10 USD.');
        openPay('rooms');
      });
    } else {
      button.textContent = room.name + ' needs ' + room.hearts + ' hearts';
      button.addEventListener('click', function () {
        toast(room.name + ' opens at ' + room.hearts + ' hearts. You have ' + save.hearts + '.');
        blip();
      });
    }
    list.appendChild(button);
  });
  mode = 'rooms';
  showPanels();
}

function goBack() {
  if (mode === 'shop') {
    mode = shopFrom === 'play' ? 'play' : 'title';
    showPanels();
    return;
  }
  if (mode === 'mini') {
    hideMini(miniPractice ? 'tutorial' : 'chart');
    return;
  }
  if (mode === 'chart' || mode === 'rooms') {
    mode = 'play';
    showPanels();
    return;
  }
  if (mode === 'pay') {
    if (payFrom === 'title') {
      mode = 'title';
      showPanels();
    } else {
      mode = 'play';
      if (!loopOn && renderer) startPlay();
      else showPanels();
    }
    return;
  }
  if (mode === 'tutorial') closeTutorial();
  else if (mode === 'play') {
    saveGame();
    mode = 'title';
    showPanels();
  }
}

function setMove(key, down) {
  if (key === 'w' || key === 'arrowup') keys.f = down;
  else if (key === 's' || key === 'arrowdown') keys.b = down;
  else if (key === 'a' || key === 'arrowleft') keys.l = down;
  else if (key === 'd' || key === 'arrowright') keys.r = down;
  else if (key === 'q') keys.q = down;
  else if (key === 'e') keys.e = down;
}

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  const tag = event.target && event.target.tagName;
  if (key === 'escape') {
    event.preventDefault();
    goBack();
    return;
  }
  if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA') return;
  setMove(key, true);
  if (event.repeat) return;
  const toolKey = { '1': 'thermo', '2': 'steth', '3': 'bandage', '4': 'needle', '5': 'stuffing', '6': 'cuddle' };
  if (toolKey[key]) {
    event.preventDefault();
    useTool(toolKey[key]);
    return;
  }
  if (key === 'm') setMute(save.mute ? false : true);
  if ((key === 'enter' || key === ' ') && (mode === 'play' || mode === 'chart')) {
    event.preventDefault();
    seePatient();
  } else if ((key === 'enter' || key === ' ') && mode === 'mini') {
    const live = $('mini-body') && $('mini-body').querySelector('button:not([disabled])');
    if (live) {
      event.preventDefault();
      live.click();
    }
  } else if (key === 'h') openTutorial(mode === 'play' || mode === 'chart' ? 'play' : 'title');
  else if (key === 'r' && (mode === 'play' || mode === 'chart')) openRooms();
  if (key.indexOf('arrow') === 0) event.preventDefault();
}

function onKeyUp(event) {
  setMove(event.key.toLowerCase(), false);
}

function bindStick() {
  const stick = $('stick');
  const knob = $('knob');
  function at(event) {
    const rect = stick.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = event.clientX - cx;
    let dy = event.clientY - cy;
    const max = rect.width * 0.32;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) {
      dx = dx / len * max;
      dy = dy / len * max;
    }
    stickVec.x = dx / max;
    stickVec.y = dy / max;
    knob.style.transform = 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
  }
  function end(event) {
    if (stickId === null || event.pointerId !== stickId) return;
    stickId = null;
    stickVec.x = 0;
    stickVec.y = 0;
    knob.style.transform = 'translate(-50%, -50%)';
  }
  stick.addEventListener('pointerdown', function (event) {
    stickId = event.pointerId;
    stick.setPointerCapture(event.pointerId);
    at(event);
  });
  stick.addEventListener('pointermove', function (event) {
    if (event.pointerId !== stickId) return;
    at(event);
  });
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);
}

function bindLook() {
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    lookId = event.pointerId;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', function (event) {
    if (event.pointerId !== lookId) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    yaw -= dx * 0.005;
    pitch -= dy * 0.0035;
    if (pitch > 0.85) pitch = 0.85;
    if (pitch < -0.35) pitch = -0.35;
  });
  function end(event) {
    if (event.pointerId === lookId) lookId = null;
  }
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });
}

function mountVrButton() {
  const node = VRButton.createButton(renderer);
  node.id = node.id || 'vr-button';
  document.body.appendChild(node);
  node.style.zIndex = '80';
  node.style.bottom = '18px';
  node.style.background = '#e978a8';
  node.style.color = '#fffafb';
  node.style.border = '0';
  node.style.borderRadius = '999px';
  node.style.font = '700 15px Georgia, serif';
  node.style.minHeight = '44px';
  window.setTimeout(function () {
    const text = node.textContent || '';
    const unsupported = node.tagName === 'A' || /NOT SUPPORTED|NOT ALLOWED|NOT AVAILABLE|NEEDS HTTPS/i.test(text);
    if (!unsupported) {
      node.style.opacity = '1';
      return;
    }
    if (node.tagName === 'A') node.removeAttribute('href');
    node.textContent = 'VR';
    node.style.cursor = 'pointer';
    node.style.opacity = '1';
    node.onclick = function (event) {
      event.preventDefault();
      toast('This browser has no immersive VR session. Touch and keyboard still work.');
    };
  }, 600);
}

function bootWorld() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6d5e2);
  scene.fog = new THREE.Fog(0xf8d0dc, 16, 42);
  camera = new THREE.PerspectiveCamera(58, 1, 0.08, 80);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setClearColor(0xf6d5e2, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true;
  $('stage').appendChild(renderer.domElement);
  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();

  const hemi = new THREE.HemisphereLight(0xfff3e6, 0xc48b9c, 2.4);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff6ea, Math.PI * 1.15);
  sun.position.set(6, 10, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -16;
  sun.shadow.camera.right = 16;
  sun.shadow.camera.top = 16;
  sun.shadow.camera.bottom = -16;
  scene.add(sun);

  buildRooms();
  dressWard();
  player = new THREE.Group();
  scene.add(player);
  doctor = makePlush('#f4a6c2', true);
  player.add(doctor);
  player.position.set(0.15, 0, 0.35);
  refreshCurtains();
  buildBelt();
  setupHands();
  placeCamera();
  resize();

  renderer.xr.addEventListener('sessionstart', function () {
    xr = true;
    player.add(camera);
    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);
    doctor.visible = false;
    hands.forEach(function (hand) { hand.visible = true; });
    if (belt) belt.visible = true;
  });
  renderer.xr.addEventListener('sessionend', function () {
    xr = false;
    scene.add(camera);
    doctor.visible = true;
    hands.forEach(function (hand) { hand.visible = false; });
    if (belt) belt.visible = false;
    if (vrMini) vrMini.visible = false;
    placeCamera();
  });
  mountVrButton();
  bindLook();
}

function bindUi() {
  $('btn-play').addEventListener('click', function () { resumeAudio(); startPlay(); });
  $('btn-tutorial').addEventListener('click', function () { openTutorial('title'); });
  $('btn-continue').addEventListener('click', function () {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (err) { raw = null; }
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (err) { parsed = null; }
    if (!parsed || parsed.started !== true) {
      toast('There is no saved visit yet.');
      return;
    }
    save = loadSave();
    refreshCurtains();
    startPlay();
    toast('Saved visit loaded.');
  });
  $('btn-title-sound').addEventListener('click', function () { setMute(save.mute ? false : true); });
  $('btn-sound').addEventListener('click', function () { setMute(save.mute ? false : true); });
  $('btn-title-cart').addEventListener('click', function () { openCart(0); });
  $('btn-title-shop').addEventListener('click', function () { openShop('title'); });
  $('btn-shop').addEventListener('click', function () { openShop('play'); });
  $('btn-shop-close').addEventListener('click', function () { goBack(); });
  document.querySelectorAll('.shop-add').forEach(function (button) {
    button.addEventListener('click', function () {
      addPlushToCart(button.getAttribute('data-plush') || '');
    });
  });
  $('btn-pay-cart').addEventListener('click', function () { openCart(0); });
  window.addEventListener('cb-payid-unlock', function (event) {
    const detail = event.detail || {};
    if (detail.storeId !== 'apps/plush-hospital' || detail.unlocked !== true) return;
    if (detail.paid === true || detail.verified === true || detail.confirmed === true) return;
    refreshCurtains();
    updateHud();
    if (mode === 'pay') {
      mode = payFrom === 'title' ? 'title' : 'play';
      showPanels();
    }
    if (mode === 'play') ensurePatient();
    toast('Full game unlocked on this device. Payment is not verified.');
  });
  $('btn-tut-back').addEventListener('click', function () {
    if (step === 0) {
      toast('This is the start of the tour.');
      return;
    }
    step -= 1;
    renderTutorial();
  });
  $('btn-tut-next').addEventListener('click', function () {
    if (step >= STEPS.length - 1) {
      startPlay();
      return;
    }
    step += 1;
    renderTutorial();
  });
  $('btn-tut-close').addEventListener('click', closeTutorial);
  $('btn-try-thermo').addEventListener('click', function () { openMini('thermo', true); });
  $('btn-try-steth').addEventListener('click', function () { openMini('steth', true); });
  $('btn-try-bandage').addEventListener('click', function () { openMini('bandage', true); });
  $('btn-try-needle').addEventListener('click', function () { openMini('needle', true); });
  $('btn-try-stuffing').addEventListener('click', function () { openMini('stuffing', true); });
  $('btn-try-cuddle').addEventListener('click', function () { openMini('cuddle', true); });
  $('btn-patient').addEventListener('click', seePatient);
  $('btn-door').addEventListener('click', function () {
    const near = nearestLockedDoor();
    if (!near) {
      toast('No locked door is close.');
      return;
    }
    const otherId = near.door.a === 'pink' ? near.door.b : near.door.a;
    const room = roomById(otherId) || roomById(near.door.b);
    if (room && !room.demo && !honourUnlocked()) openPay('play');
    else if (room) toast(room.name + ' opens at ' + room.hearts + ' hearts. You have ' + save.hearts + '.');
    else openRooms();
  });
  $('btn-rooms').addEventListener('click', openRooms);
  $('btn-rooms-close').addEventListener('click', function () { mode = 'play'; showPanels(); });
  $('btn-help').addEventListener('click', function () { openTutorial('play'); });
  $('btn-menu').addEventListener('click', function () {
    saveGame();
    mode = 'title';
    showPanels();
    toast('Progress is saved on this device.');
  });
  $('btn-chart-close').addEventListener('click', function () { mode = 'play'; showPanels(); });
  $('btn-mini-close').addEventListener('click', function () { hideMini(miniPractice ? 'tutorial' : 'chart'); });
  $('btn-pay-walk').addEventListener('click', function () {
    if (!loopOn) startPlay();
    mode = 'play';
    showPanels();
  });
  $('btn-pay-title').addEventListener('click', function () {
    saveGame();
    mode = 'title';
    showPanels();
  });
  Object.keys(TOOLS).forEach(function (id) {
    $('btn-tool-' + id).addEventListener('click', function () { useTool(id); });
  });
  $('btn-door').style.display = 'none';
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', function () {
    keys.f = false;
    keys.b = false;
    keys.l = false;
    keys.r = false;
    keys.q = false;
    keys.e = false;
    stickVec.x = 0;
    stickVec.y = 0;
  });
  document.body.addEventListener('pointerdown', function () {
    if (!save.mute) resumeAudio();
  });
  bindStick();
}

function init() {
  window.addEventListener('unhandledrejection', function (event) {
    const reason = event.reason;
    const msg = String(reason && reason.message ? reason.message : reason || '');
    if (/xr|session|immersive|webxr/i.test(msg)) {
      event.preventDefault();
      toast('VR did not start. Touch and keyboard still work.');
    }
  });
  window.PLUSH = {
    state: function () {
      return {
        mode: mode,
        hearts: save.hearts,
        healed: save.healed,
        x: player ? Math.round(player.position.x * 100) / 100 : null,
        z: player ? Math.round(player.position.z * 100) / 100 : null,
        yaw: Math.round(yaw * 100) / 100,
        cam: camera ? {
          x: Math.round(camera.position.x * 100) / 100,
          y: Math.round(camera.position.y * 100) / 100,
          z: Math.round(camera.position.z * 100) / 100
        } : null,
        meshes: scene ? scene.children.length : 0,
        frames: renderer && renderer.info ? renderer.info.render.frame : 0
      };
    }
  };
  paintSound();
  const savedLine = $('saved-line');
  if (savedLine) savedLine.textContent = 'Hearts saved: ' + save.hearts;
  bindUi();
  try {
    bootWorld();
  } catch (err) {
    renderer = null;
    const note = $('boot-note');
    if (note) note.textContent = 'This browser could not start the 3D view. The tour, cart, and pages still open.';
    console.error(err);
  }
  showPanels();
  window.PLUSH_READY = true;
}

init();
window.addEventListener('resize', resize);
