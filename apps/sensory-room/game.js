/* Coffeebreak Sensory Room: 3D character game in the Park Builder style.
   Free to play. Saves on this device only. Visitors are game characters, not real players.
   No flashing: every colour change fades over seconds and nothing strobes. */
import * as THREE from 'three';

const SR = window.SR;
const KEY = 'cb-sensory-room-v2';
const SHOP_URL = '../../stores/sensory-shop/';
const $ = id => document.getElementById(id);

// ---------- room layout (a character is about 6 units tall) ----------
const ROOM = { w: 48, d: 36, h: 18 };
const HX = ROOM.w / 2, HZ = ROOM.d / 2;
const SLOTS = [
  { id: 'c1', zone: 'ceiling', x: -14, z: -4 }, { id: 'c2', zone: 'ceiling', x: 0, z: -4 }, { id: 'c3', zone: 'ceiling', x: 14, z: -4 },
  { id: 'w1', zone: 'wall', x: -16, z: -HZ }, { id: 'w2', zone: 'wall', x: -5.5, z: -HZ }, { id: 'w3', zone: 'wall', x: 5.5, z: -HZ }, { id: 'w4', zone: 'wall', x: 16, z: -HZ },
  { id: 'f1', zone: 'floor', x: -18, z: -9 }, { id: 'f2', zone: 'floor', x: -6, z: -9 }, { id: 'f3', zone: 'floor', x: 6, z: -9 }, { id: 'f4', zone: 'floor', x: 18, z: -9 },
  { id: 'f5', zone: 'floor', x: -13, z: 4 }, { id: 'f6', zone: 'floor', x: 0, z: 4 }, { id: 'f7', zone: 'floor', x: 13, z: 4 }
];
const slotById = Object.fromEntries(SLOTS.map(s => [s.id, s]));
const DOOR = { x: -HX - 4, z: 11 };
const PAINTS = [
  { id: 'night', hex: '#4a3a86' }, { id: 'ocean', hex: '#2a5f86' }, { id: 'forest', hex: '#2c6a52' },
  { id: 'blush', hex: '#8a3a70' }, { id: 'sand', hex: '#8a7650' }, { id: 'charcoal', hex: '#3a3a48' }
];
const BADGES = [
  { id: 'first', name: 'First glow' }, { id: 'fibre', name: 'Fibre optic fan' }, { id: 'bubbles', name: 'Bubble friend' },
  { id: 'calm', name: 'Calm designer' }, { id: 'full', name: 'Full room' }, { id: 'stars3', name: 'Three star host' }, { id: 'all', name: 'Every visitor welcomed' },
  { id: 'swing', name: 'Swing time' }, { id: 'cosy', name: 'Cosy corner' }
];
const LOOK = {
  skin: ['#ffe0c4', '#f1c094', '#d49a6a', '#a8714a', '#7a4a2c', '#4e2e1c'],
  hair: ['#2a1a12', '#6b3a1e', '#c98a3a', '#f2d27a', '#ff8cc8', '#9646dc', '#4cb8ff', '#eeeeee'],
  style: ['Short', 'Long', 'Buns', 'Curly'],
  top: ['#ff8cc8', '#9646dc', '#4cb8ff', '#5cf0a0', '#ffcf5c', '#ffffff', '#2a1640'],
  bottom: ['#9646dc', '#2a1640', '#4a6aa8', '#ff3caa', '#5c8a6a', '#e8dcc8'],
  extra: ['None', 'Bow', 'Headphones', 'Crown', 'Cap']
};

// ---------- state ----------
const defaults = {
  coins: 250, room: { w2: { id: 'fibre-waterfall', color: 'pink', on: true, gift: true } }, paint: 'night', calm: false, vol: 60, bright: 85,
  music: false, level: 0, stars: {}, badges: {}, day: '', earned: 0, ver: 3,
  look: { skin: 1, hair: 1, style: 1, top: 0, bottom: 0, extra: 1 }
};
const st = load();
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
  const out = JSON.parse(JSON.stringify(defaults));
  if (s && typeof s === 'object') Object.keys(out).forEach(k => { if (s[k] !== undefined) out[k] = s[k]; });
  if (!out.look || typeof out.look !== 'object') out.look = JSON.parse(JSON.stringify(defaults.look));
  if (!s) { try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) out.calm = true; } catch (e) {} }
  return out;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
const itemById = id => SR.ITEMS.find(i => i.id === id) || null;
const spd = () => (st.calm ? 2.4 : 1);

// ---------- messages ----------
let msgT = null;
function msg(t, ms) { const m = $('msg'); m.textContent = t; m.classList.add('show'); clearTimeout(msgT); msgT = setTimeout(() => m.classList.remove('show'), ms || 4200); }
function coinsUI() { $('coins').textContent = st.coins + ' coins'; }

// ---------- audio: soft only ----------
let ac = null, master = null, musicNodes = null, quietUntil = 0;
function audio() {
  if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ac = new AC(); master = ac.createGain(); master.connect(ac.destination); }
  if (ac.state === 'suspended') ac.resume();
  setVol(); return ac;
}
function setVol() {
  if (!master) return;
  let v = st.vol / 100 * (st.calm ? 0.5 : 1) * 0.5;
  if (Date.now() < quietUntil) v *= 0.15;
  master.gain.setTargetAtTime(v, ac.currentTime, 0.3);
}
function tone(freq, dur, type, gain, when, glide) {
  const a = audio(); if (!a || st.vol === 0) return;
  const t = a.currentTime + (when || 0);
  const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(freq * glide, t + dur);
  f.type = 'lowpass'; f.frequency.value = 1800;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain || 0.2, t + Math.min(0.08, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, fc, gain) {
  const a = audio(); if (!a || st.vol === 0) return;
  const len = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
  src.buffer = b; f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = 0.7;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master); src.start(t);
}
const SFX = {
  chime() { [523, 659, 784].forEach((f, i) => tone(f, 1.6, 'sine', 0.12, i * 0.18)); },
  bubble() { for (let i = 0; i < 6; i++) tone(260 + Math.random() * 260, 0.22, 'sine', 0.14, i * 0.16 + Math.random() * 0.05, 1.8); },
  rain() { noise(3.2, 2600, 0.35); for (let i = 0; i < 10; i++) tone(1400 + Math.random() * 900, 0.08, 'sine', 0.04, Math.random() * 2.8); },
  click() { tone(700, 0.06, 'triangle', 0.08); tone(900, 0.06, 'triangle', 0.06, 0.12); },
  whoosh() { noise(1.6, 500, 0.25); },
  cosy() { tone(196, 1.2, 'sine', 0.12); tone(247, 1.2, 'sine', 0.08, 0.1); },
  sparkle() { [880, 1046, 1318, 1568].forEach((f, i) => tone(f, 1.2, 'sine', 0.05, i * 0.25)); },
  coins() { tone(660, 0.3, 'sine', 0.1); tone(990, 0.5, 'sine', 0.1, 0.15); },
  hello() { tone(440, 0.4, 'sine', 0.08); tone(554, 0.5, 'sine', 0.08, 0.2); },
  place() { tone(392, 0.5, 'sine', 0.1); tone(523, 0.7, 'sine', 0.1, 0.15); }
};
function startMusic() {
  const a = audio(); if (!a || musicNodes) return;
  const g = a.createGain(); g.gain.value = 0.0001; g.connect(master); g.gain.setTargetAtTime(0.18, a.currentTime, 2);
  const chords = [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]];
  const oscs = [0, 1, 2].map(i => { const o = a.createOscillator(); o.type = 'sine'; o.frequency.value = chords[0][i]; o.connect(g); o.start(); return o; });
  let idx = 0;
  const timer = setInterval(() => { idx = (idx + 1) % chords.length; oscs.forEach((o, i) => o.frequency.setTargetAtTime(chords[idx][i], a.currentTime, 1.5)); }, 8000);
  musicNodes = { g, oscs, timer };
}
function stopMusic() {
  if (!musicNodes) return;
  const m = musicNodes; musicNodes = null; clearInterval(m.timer);
  m.g.gain.setTargetAtTime(0.0001, ac.currentTime, 0.8);
  setTimeout(() => m.oscs.forEach(o => { try { o.stop(); } catch (e) {} }), 3000);
}
const anyOn = kind => Object.values(placedMap).some(o => o.item.kind === kind && o.p.on);
function syncMusic() { if ((st.music || anyOn('galaxy')) && ac) startMusic(); else stopMusic(); }

// ---------- renderer ----------
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.body.classList.add('touch');
const view = $('view');
const renderer = new THREE.WebGLRenderer({ antialias: !isTouch });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
view.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b0f2e);
const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 400);
const hemi = new THREE.HemisphereLight(0xffffff, 0x8060b0, 1.0); scene.add(hemi);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.6); keyLight.position.set(10, 30, 30); scene.add(keyLight);
let portrait = false;
function resize() {
  const w = view.clientWidth || innerWidth, h = view.clientHeight || innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  portrait = w < h; camera.fov = portrait ? 68 : 55; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();
if (window.ResizeObserver) new ResizeObserver(resize).observe(view);

// ---------- helpers ----------
const matCache = {};
function mat(color, emissive, opts) {
  const m = new THREE.MeshLambertMaterial(Object.assign({ color: new THREE.Color(color) }, opts || {}));
  if (emissive) { m.emissive = new THREE.Color(color); m.emissiveIntensity = emissive; }
  return m;
}
function sharedMat(color) { return matCache[color] || (matCache[color] = mat(color)); }
const M = m => (typeof m === 'string' || typeof m === 'number' ? sharedMat(m) : m);
function box(parent, sx, sy, sz, x, y, z, m) { const o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), M(m)); o.position.set(x, y, z); parent.add(o); return o; }
function cyl(parent, r1, r2, h, x, y, z, m, seg) { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 20), M(m)); o.position.set(x, y, z); parent.add(o); return o; }
function ball(parent, r, x, y, z, m) { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), M(m)); o.position.set(x, y, z); parent.add(o); return o; }
function canvasTex(size, draw) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const dotTex = canvasTex(64, (g, s) => { const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
function glowSprite(color, size) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(color), transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1); return s;
}

// ---------- the room ----------
const roomG = new THREE.Group(); scene.add(roomG);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mat('#efe2f8')); floor.rotation.x = -Math.PI / 2; roomG.add(floor);
const rug = new THREE.Mesh(new THREE.CircleGeometry(9, 40), mat('#d9c2f0')); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.02, -1); roomG.add(rug);
const outside = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat('#24163e')); outside.rotation.x = -Math.PI / 2; outside.position.y = -0.05; roomG.add(outside);
const wallMat = mat('#4a3a86');
const back = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.h), wallMat); back.position.set(0, ROOM.h / 2, -HZ); roomG.add(back);
const left = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d, ROOM.h), wallMat); left.rotation.y = Math.PI / 2; left.position.set(-HX, ROOM.h / 2, 0); roomG.add(left);
const right = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.d, ROOM.h), wallMat); right.rotation.y = -Math.PI / 2; right.position.set(HX, ROOM.h / 2, 0); roomG.add(right);
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), mat('#1e1438')); ceiling.rotation.x = Math.PI / 2; ceiling.position.y = ROOM.h; roomG.add(ceiling);
box(roomG, ROOM.w, 0.6, 0.3, 0, 0.3, -HZ + 0.15, '#ffffff');
const doorG = new THREE.Group(); doorG.position.set(-HX + 0.05, 0, DOOR.z); roomG.add(doorG);
box(doorG, 0.3, 9, 0.6, 0, 4.5, -3.3, '#ff8cc8'); box(doorG, 0.3, 9, 0.6, 0, 4.5, 3.3, '#ff8cc8'); box(doorG, 0.3, 0.6, 7.2, 0, 9, 0, '#ff8cc8');
const doorPanel = new THREE.Mesh(new THREE.PlaneGeometry(6, 8.7), mat('#ffd7ef')); doorPanel.rotation.y = Math.PI / 2; doorPanel.position.set(0.1, 4.35, 0); doorG.add(doorPanel);
const logoTex = new THREE.TextureLoader().load('logo.png'); logoTex.colorSpace = THREE.SRGBColorSpace;
const logoM = new THREE.Mesh(new THREE.CircleGeometry(2.2, 40), new THREE.MeshBasicMaterial({ map: logoTex })); logoM.position.set(0, 15, -HZ + 0.06); roomG.add(logoM);
function applyPaint() { const p = PAINTS.find(x => x.id === st.paint) || PAINTS[0]; wallMat.color.set(p.hex); }

// ---------- generated 3D items (no photos) ----------
function fibreBundle(g, n, from, to, curve, colorMats) {
  const pos = [], tips = [];
  for (let i = 0; i < n; i++) {
    const e = to(i, n), seg = 10;
    const a = new THREE.Vector3(from.x, from.y, from.z), b = new THREE.Vector3(e.x, e.y, e.z);
    const c = a.clone().lerp(b, 0.5).add(curve(i, n));
    const q = new THREE.QuadraticBezierCurve3(a, c, b).getPoints(seg);
    for (let k = 0; k < seg; k++) pos.push(q[k].x, q[k].y, q[k].z, q[k + 1].x, q[k + 1].y, q[k + 1].z);
    tips.push(b.x, b.y, b.z);
  }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  g.add(new THREE.LineSegments(lg, lm));
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(tips, 3));
  const pm = new THREE.PointsMaterial({ size: 0.9, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff });
  g.add(new THREE.Points(pg, pm));
  colorMats.push(lm, pm);
}
function bubbleSet(g, n, x, y0, h, r, ud) {
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
  for (let i = 0; i < n; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (i % 3) * 0.07, 8, 6), m);
    b.userData = { ph: i / n, dx: Math.sin(i * 2.3) * r * 0.5, dz: Math.cos(i * 1.7) * r * 0.5 };
    g.add(b); ud.bubbles.push(b);
  }
  ud.bubbleRange = { x, y0, h };
}
const starTex = canvasTex(256, (g, s) => {
  for (let i = 0; i < 70; i++) { const x = Math.random() * s, y = Math.random() * s, r = Math.random() * 2 + 0.6; g.fillStyle = 'rgba(255,255,255,' + (0.5 + Math.random() * 0.5) + ')'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
});
const galaxyTex = canvasTex(256, (g, s) => {
  ['rgba(255,60,170,.55)', 'rgba(60,200,255,.5)', 'rgba(150,70,220,.55)', 'rgba(92,240,160,.35)'].forEach((c, i) => { const a = i * 1.6, x = s / 2 + Math.cos(a) * s * 0.18, y = s / 2 + Math.sin(a) * s * 0.18; const r = g.createRadialGradient(x, y, 0, x, y, s * 0.4); r.addColorStop(0, c); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, s, s); });
  for (let i = 0; i < 120; i++) { const a = Math.random() * Math.PI * 6, d = (a / (Math.PI * 6)) * s * 0.45; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, 1.6, 1.6); }
});

function tubeMat(op, em) { const m = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: op, emissive: 0xffffff, emissiveIntensity: em }); m.userData.glowy = true; return m; }
function buildItem(id) {
  const g = new THREE.Group();
  const ud = { colorMats: [], tintMats: [], bubbles: [], spin: [], sway: null, seat: null, radius: 2.5, glow: null, stars: null, galaxy: null, use: 'Use' };
  g.userData = ud;
  const glow = (y, size) => { ud.glow = glowSprite('#ffffff', size); ud.glow.position.set(0, y, 0); g.add(ud.glow); };
  const golden = 2.39996;
  switch (id) {
    case 'fibre-lamp':
      cyl(g, 0.5, 1.1, 1.6, 0, 0.8, 0, '#e9e3f2');
      fibreBundle(g, 40, { x: 0, y: 1.6, z: 0 }, i => { const a = i * golden, r = 1.6 + (i % 5) * 0.35; return { x: Math.cos(a) * r, y: 3.6 + (i % 4) * 0.4, z: Math.sin(a) * r }; }, () => new THREE.Vector3(0, 1.4, 0), ud.colorMats);
      glow(3.6, 7); ud.radius = 2; ud.use = 'Touch'; break;
    case 'fibre-fountain':
      cyl(g, 1.4, 1.6, 0.4, 0, 0.2, 0, '#d8dce4'); cyl(g, 0.35, 0.35, 3, 0, 1.9, 0, '#d8dce4');
      fibreBundle(g, 60, { x: 0, y: 3.4, z: 0 }, i => { const a = i * golden, r = 2 + (i % 6) * 0.4; return { x: Math.cos(a) * r, y: 2 + (i % 3) * 0.6, z: Math.sin(a) * r }; }, () => new THREE.Vector3(0, 2.8, 0), ud.colorMats);
      glow(4, 9); ud.radius = 2.4; ud.use = 'Touch'; break;
    case 'fibre-waterfall':
      box(g, 9, 0.8, 0.8, 0, 13, 0.6, '#eeeeee');
      fibreBundle(g, 70, { x: 0, y: 13, z: 0.8 }, (i, n) => ({ x: -4.2 + 8.4 * i / (n - 1), y: 0.6 + (i % 4) * 0.3, z: 1.2 + (i % 3) * 0.5 }), (i, n) => new THREE.Vector3((i / n - 0.5) * 3, -1, 1.4), ud.colorMats);
      glow(6, 16); ud.use = 'Touch'; break;
    case 'fibre-canopy': {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(3, 0.25, 8, 40), sharedMat('#ffffff')); ring.rotation.x = Math.PI / 2; ring.position.y = ROOM.h - 0.6; g.add(ring);
      fibreBundle(g, 70, { x: 0, y: ROOM.h - 0.5, z: 0 }, i => { const a = i * golden, r = 2.5 + (i % 7) * 0.7; return { x: Math.cos(a) * r, y: 9.5 + (i % 5) * 0.7, z: Math.sin(a) * r }; }, () => new THREE.Vector3(0, -2, 0), ud.colorMats);
      glow(12, 14); ud.use = 'Touch'; break; }
    case 'bubble-tube': {
      cyl(g, 1.8, 1.8, 1, 0, 0.5, 0, '#dddddd'); cyl(g, 1.6, 1.6, 0.4, 0, 12.2, 0, '#dddddd');
      const tm = tubeMat(0.55, 0.6); cyl(g, 1.4, 1.4, 11, 0, 6.5, 0, tm, 28); ud.tintMats.push(tm);
      bubbleSet(g, 22, 0, 1.2, 10.4, 1.4, ud); glow(6.5, 12); ud.radius = 2.2; ud.use = 'Watch'; break; }
    case 'bubble-lamp': {
      box(g, 3, 2.4, 3, 0, 1.2, 0, '#f4e8ff'); cyl(g, 1.0, 1.0, 0.4, 0, 2.6, 0, '#dddddd');
      const tm = tubeMat(0.55, 0.6); cyl(g, 0.8, 0.8, 4, 0, 4.8, 0, tm, 24); ud.tintMats.push(tm);
      const fish = ball(g, 0.35, 0, 4.8, 0, '#ffcf5c'); fish.scale.set(1.4, 0.8, 0.6); ud.fish = fish;
      bubbleSet(g, 10, 0, 3, 3.6, 0.8, ud); glow(4.8, 6); ud.radius = 2.2; ud.use = 'Watch'; break; }
    case 'star-ceiling': {
      const panel = new THREE.Mesh(new THREE.CircleGeometry(7, 48), mat('#120a28')); panel.rotation.x = Math.PI / 2; panel.position.y = ROOM.h - 0.05; g.add(panel);
      const sm = new THREE.MeshBasicMaterial({ map: starTex, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff });
      const sp = new THREE.Mesh(new THREE.CircleGeometry(7, 48), sm); sp.rotation.x = Math.PI / 2; sp.position.y = ROOM.h - 0.1; g.add(sp);
      ud.stars = sm; ud.colorMats.push(sm); ud.use = 'Switch'; break; }
    case 'galaxy-ceiling': case 'galaxy-projector': {
      if (id === 'galaxy-ceiling') { cyl(g, 0.2, 0.2, 2.5, 0, ROOM.h - 1.2, 0, '#cccccc'); const b = ball(g, 1.3, 0, ROOM.h - 3, 0, '#2a1d4a'); b.scale.y = 0.8; ud.lens = ball(g, 0.6, 0, ROOM.h - 3.9, 0, mat('#ffffff', 0.8)); ud.lens.material.userData.glowy = true; }
      else { cyl(g, 1.6, 1.8, 0.6, 0, 0.3, 0, '#dddddd'); const d = ball(g, 1.4, 0, 1.2, 0, '#2a1d4a'); d.scale.y = 0.9; ud.lens = ball(g, 0.6, 0, 2.3, 0, mat('#ffffff', 0.8)); ud.lens.material.userData.glowy = true; ud.radius = 2; }
      const gm = new THREE.MeshBasicMaterial({ map: galaxyTex, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff });
      const gp = new THREE.Mesh(new THREE.CircleGeometry(12, 48), gm); gp.rotation.x = Math.PI / 2; gp.position.y = ROOM.h - 0.12; g.add(gp);
      ud.galaxy = { mesh: gp, mat: gm }; ud.colorMats.push(gm); ud.tintMats.push(ud.lens.material); ud.use = 'Switch'; break; }
    case 'rain-tube': {
      box(g, 2.4, 1.8, 2.4, 0, 0.9, 0, '#f4e8ff');
      const tg = new THREE.Group(); tg.position.set(0, 3.6, 0); tg.rotation.z = 0.35; g.add(tg);
      const tm = tubeMat(0.6, 0.4); cyl(tg, 0.55, 0.55, 4.5, 0, 0, 0, tm); ud.tintMats.push(tm); ud.tube = tg;
      for (let i = 0; i < 8; i++) ball(tg, 0.13, Math.sin(i) * 0.25, -1.8 + i * 0.5, Math.cos(i) * 0.25, '#ffffff');
      ud.radius = 1.8; ud.use = 'Tip'; break; }
    case 'weighted-blanket': {
      box(g, 8, 0.5, 6, 0, 0.25, 0, '#f4e8ff');
      const bm = mat('#ffffff'); box(g, 7, 0.6, 5, 0, 0.8, 0, bm); ud.tintMats.push(bm);
      const line = mat('#ffffff', 0, { transparent: true, opacity: 0.5 });
      for (let i = -2; i <= 2; i++) box(g, 0.08, 0.62, 5, i * 1.4, 0.82, 0, line);
      box(g, 2.4, 0.7, 1.4, 0, 1.2, -1.8, '#ffffff');
      ud.seat = { y: 1.2, lie: true }; ud.radius = 3.6; ud.use = 'Snuggle'; break; }
    case 'lap-pad': {
      cyl(g, 2, 2.2, 1, 0, 0.5, 0, '#e0d0f5');
      const pm = mat('#ffffff'); box(g, 2.6, 0.4, 1.8, 0, 1.25, 0.6, pm); ud.tintMats.push(pm);
      ud.seat = { y: 1.0 }; ud.radius = 2.3; ud.use = 'Sit on'; break; }
    case 'beanbag': {
      const bm = mat('#ffffff'); const b = ball(g, 2.6, 0, 1.4, 0, bm); b.scale.set(1.1, 0.62, 1.1); ud.tintMats.push(bm);
      const b2 = ball(g, 2, 0, 2.6, -1.4, bm); b2.scale.set(1.1, 0.8, 0.6);
      ud.seat = { y: 1.9 }; ud.radius = 2.8; ud.use = 'Sit in'; break; }
    case 'crash-pad': {
      const cm = mat('#ffffff'); box(g, 8, 1.4, 8, 0, 0.7, 0, cm); ud.tintMats.push(cm);
      ud.seat = { y: 1.4, lie: true }; ud.radius = 4.2; ud.use = 'Flop on'; break; }
    case 'sensory-swing': case 'pod-swing': {
      const piv = new THREE.Group(); piv.position.set(0, ROOM.h, 0); g.add(piv);
      cyl(g, 0.6, 0.6, 0.4, 0, ROOM.h - 0.2, 0, '#cccccc');
      const sm2 = mat('#ffffff', 0, { side: THREE.DoubleSide }); ud.tintMats.push(sm2);
      if (id === 'sensory-swing') {
        cyl(piv, 0.08, 0.08, 7, 0, -3.5, 0, '#dddddd');
        const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(Math.sin(t * Math.PI) * 2.4 + 0.05, -t * 8.5)); }
        const lathe = new THREE.Mesh(new THREE.LatheGeometry(pts, 24, 0, Math.PI * 1.45), sm2);
        lathe.position.y = -7; lathe.rotation.y = Math.PI * 0.27; piv.add(lathe);
      } else {
        cyl(piv, 0.08, 0.08, 8, 0, -4, 0, '#dddddd');
        const pod = new THREE.Mesh(new THREE.SphereGeometry(3, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.72), sm2);
        pod.rotation.x = Math.PI; pod.position.y = -11; pod.scale.set(1, 0.8, 1); piv.add(pod);
      }
      ud.seat = { y: 0, swingY: -13.2 }; ud.sway = piv; ud.radius = 2.8; ud.use = 'Swing on'; break; }
    case 'fidget-basket': {
      cyl(g, 1.8, 1.4, 1.8, 0, 0.9, 0, '#d9a066');
      ['#ff5cc0', '#5cf0a0', '#4cb8ff', '#ffcf5c', '#b07cff'].forEach((c, i) => ball(g, 0.6, Math.cos(i * 1.3) * 0.8, 2, Math.sin(i * 1.3) * 0.8, c));
      ud.radius = 2; ud.use = 'Squish'; break; }
    case 'tactile-stones':
      ['#ff5cc0', '#4cb8ff', '#5cf0a0', '#ffcf5c', '#b07cff', '#ff8cc8'].forEach((c, i) => { const s = ball(g, 1.1, ((i % 3) - 1) * 2.6, 0.25, (Math.floor(i / 3) - 0.5) * 2.6, c); s.scale.set(1, 0.3, 1); });
      ud.radius = 0.1; ud.use = 'Hop on'; break;
    case 'tactile-panels': {
      const on = mat('#ffffff'), off = mat('#c9c3d8'); ud.tintMats.push(on);
      for (let p = 0; p < 3; p++) {
        box(g, 2.6, 4.6, 0.2, (p - 1) * 3, 6, 0.2, '#f2e8ff');
        for (let r = 0; r < 7; r++) for (let q = 0; q < 4; q++) { const d = cyl(g, 0.26, 0.26, 0.1, (p - 1) * 3 - 0.9 + q * 0.6, 4.1 + r * 0.62, 0.35, (r + q + p) % 2 ? on : off, 10); d.rotation.x = Math.PI / 2; }
      }
      ud.use = 'Brush'; break; }
    case 'fidget-wall': {
      box(g, 8, 6, 0.3, 0, 6, 0.2, '#ffe9a8');
      [[-2.6, 7.4, '#ff5cc0'], [0, 7.4, '#4cb8ff'], [2.6, 7.4, '#5cf0a0']].forEach(([x, y, c]) => { const sp = new THREE.Group(); sp.position.set(x, y, 0.5); g.add(sp); const d = cyl(sp, 0.9, 0.9, 0.2, 0, 0, 0, c, 6); d.rotation.x = Math.PI / 2; ball(sp, 0.25, 0.6, 0, 0.15, '#ffffff'); ud.spin.push(sp); });
      box(g, 6, 0.4, 0.2, 0, 5, 0.45, '#9646dc'); ud.slider = ball(g, 0.4, -2, 5, 0.6, '#ff3caa');
      ['#4cb8ff', '#5cf0a0', '#ffcf5c', '#ff5cc0', '#b07cff'].forEach((c, i) => ball(g, 0.35, -2 + i, 3.9, 0.5, c));
      ud.use = 'Play with'; break; }
    case 'headphones': {
      box(g, 0.3, 0.3, 1.2, 0, 7.6, 0.6, '#dddddd');
      const band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.15, 8, 24, Math.PI), sharedMat('#ff8cc8')); band.position.set(0, 6.4, 1); g.add(band);
      box(g, 0.6, 1, 0.8, -1, 6.2, 1, '#9646dc'); box(g, 0.6, 1, 0.8, 1, 6.2, 1, '#9646dc');
      ud.use = 'Wear'; break; }
  }
  return g;
}

// ---------- placed items ----------
const placedMap = {}; // slotId -> { g, item, p, cur, on }
function slotWorld(s) { return { x: s.x, z: s.zone === 'wall' ? -HZ + 0.1 : s.z }; }
function usePoint(s, o) {
  if (s.zone === 'wall') return new THREE.Vector3(s.x, 0, -HZ + 4.5);
  if (s.zone === 'ceiling') return new THREE.Vector3(s.x, 0, s.z + 3);
  const r = (o && o.g.userData.radius) || 2.5;
  return new THREE.Vector3(s.x, 0, s.z + Math.max(r, 1.5) + 1.6);
}
function spawn(slotId) {
  const s = slotById[slotId], p = st.room[slotId], item = p && itemById(p.id);
  if (placedMap[slotId]) { scene.remove(placedMap[slotId].g); delete placedMap[slotId]; }
  if (!item) return;
  const g = buildItem(item.id), w = slotWorld(s);
  g.position.set(w.x, 0, w.z); g.userData.slotId = slotId;
  g.traverse(o => { if (o !== g) o.userData.slotId = slotId; });
  scene.add(g);
  const o = { g, item, p, cur: new THREE.Color(SR.hexOf(p.color === 'rainbow' ? 'pink' : p.color)), on: p.on !== false ? 1 : 0 };
  placedMap[slotId] = o; applyColour(o, 1, 0);
}
function rebuildAll() { Object.keys(placedMap).forEach(k => { scene.remove(placedMap[k].g); delete placedMap[k]; }); SLOTS.forEach(s => spawn(s.id)); }
const tmpC = new THREE.Color();
function applyColour(o, k, T) {
  if (o.p.color === 'rainbow') tmpC.setHSL(((T || 0) / (16 * spd())) % 1, 0.75, 0.62); else tmpC.set(SR.hexOf(o.p.color));
  o.cur.lerp(tmpC, k);
  const ud = o.g.userData;
  ud.colorMats.forEach(m => m.color.copy(o.cur));
  ud.tintMats.forEach(m => { m.color.copy(o.cur); if (m.userData.glowy) m.emissive.copy(o.cur); });
  if (ud.glow) ud.glow.material.color.copy(o.cur);
}

// ---------- characters (blocky, Park Builder style) ----------
function makeAvatar(look) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const parts = {};
  const top = mat(look.top), bottom = mat(look.bottom), skin = mat(look.skin), hair = mat(look.hair);
  parts.torso = box(body, 2, 2, 1, 0, 3, 0, top);
  parts.head = box(body, 1.25, 1.25, 1.25, 0, 4.65, 0, skin);
  const face = new THREE.Group(); face.position.set(0, 4.75, 0.63); body.add(face);
  box(face, 0.2, 0.25, 0.02, -0.28, 0, 0, '#222222'); box(face, 0.2, 0.25, 0.02, 0.28, 0, 0, '#222222'); box(face, 0.5, 0.08, 0.02, 0, -0.35, 0, '#ff3caa');
  const limb = (x, y, m) => { const p = new THREE.Group(); p.position.set(x, y, 0); body.add(p); box(p, 1, 2, 1, 0, -1, 0, m); return p; };
  parts.la = limb(-1.5, 4, top); parts.ra = limb(1.5, 4, top); parts.ll = limb(-0.5, 2, bottom); parts.rl = limb(0.5, 2, bottom);
  parts.hair = new THREE.Group(); body.add(parts.hair); parts.extra = new THREE.Group(); body.add(parts.extra);
  root.userData = { parts, body, mats: { top, bottom, skin, hair } };
  setHair(root, look.style); setExtra(root, look.extra);
  return root;
}
function clearG(g) { while (g.children.length) g.remove(g.children[0]); }
function setHair(av, style) {
  const h = av.userData.parts.hair, m = av.userData.mats.hair; clearG(h);
  box(h, 1.35, 0.35, 1.35, 0, 5.35, -0.05, m);
  if (style === 'Long') { box(h, 1.35, 1.6, 0.3, 0, 4.4, -0.65, m); box(h, 0.25, 1.2, 1.2, -0.68, 4.6, -0.05, m); box(h, 0.25, 1.2, 1.2, 0.68, 4.6, -0.05, m); }
  if (style === 'Buns') { ball(h, 0.42, -0.6, 5.6, -0.1, m); ball(h, 0.42, 0.6, 5.6, -0.1, m); }
  if (style === 'Curly') { for (let i = 0; i < 7; i++) ball(h, 0.32, Math.cos(i) * 0.6, 5.45 + (i % 2) * 0.15, Math.sin(i) * 0.6 - 0.1, m); }
}
function setExtra(av, extra) {
  const e = av.userData.parts.extra; clearG(e);
  if (extra === 'Bow') { box(e, 0.7, 0.6, 0.3, -0.45, 5.75, 0, '#ff3caa'); box(e, 0.7, 0.6, 0.3, 0.45, 5.75, 0, '#ff3caa'); box(e, 0.3, 0.3, 0.35, 0, 5.75, 0, '#ff8cc8'); }
  if (extra === 'Headphones') { box(e, 0.3, 0.8, 0.8, -0.75, 4.65, 0, '#ff3caa'); box(e, 0.3, 0.8, 0.8, 0.75, 4.65, 0, '#ff3caa'); box(e, 1.8, 0.2, 0.3, 0, 5.6, 0, '#281932'); }
  if (extra === 'Crown') { box(e, 1.2, 0.35, 1.2, 0, 5.75, 0, '#ffd34d'); for (const x of [-0.45, 0, 0.45]) box(e, 0.25, 0.4, 0.25, x, 6.1, 0.5, '#ffd34d'); }
  if (extra === 'Cap') { box(e, 1.45, 0.4, 1.45, 0, 5.55, 0, '#4cb8ff'); box(e, 1.2, 0.12, 0.8, 0, 5.4, 0.9, '#4cb8ff'); }
}
function lookColours() { const L = st.look, g = (k) => LOOK[k][(L[k] || 0) % LOOK[k].length]; return { skin: g('skin'), hair: g('hair'), style: g('style'), top: g('top'), bottom: g('bottom'), extra: g('extra') }; }
const player = makeAvatar(lookColours());
player.position.set(0, 0, 12); player.rotation.y = Math.PI; scene.add(player);
function applyLook() {
  const c = lookColours(), m = player.userData.mats;
  m.top.color.set(c.top); m.bottom.color.set(c.bottom); m.skin.color.set(c.skin); m.hair.color.set(c.hair);
  setHair(player, c.style); setExtra(player, c.extra);
}
function animateWalk(av, speed, t) {
  const p = av.userData.parts, s = Math.sin(t * 9) * Math.min(1, speed / 7) * 0.7;
  p.la.rotation.x = s; p.ra.rotation.x = -s; p.ll.rotation.x = -s; p.rl.rotation.x = s;
}
function pose(av, kind) {
  const p = av.userData.parts, b = av.userData.body;
  b.rotation.set(0, 0, 0); b.position.set(0, 0, 0);
  ['la', 'ra', 'll', 'rl'].forEach(k => p[k].rotation.set(0, 0, 0));
  if (kind === 'sit') { p.ll.rotation.x = p.rl.rotation.x = -1.45; p.la.rotation.x = p.ra.rotation.x = -0.3; b.position.y = -1.9; }
  else if (kind === 'lie') { b.rotation.x = -Math.PI / 2; b.position.set(0, 0.6, -3); }
  else if (kind === 'reach') { p.ra.rotation.x = -2.2; }
  av.userData.posed = kind !== 'stand' && kind !== 'reach';
}

// ---------- emotes (drawn shapes, no emoji fonts) ----------
const EMO = {};
function emoTex(kind) {
  if (EMO[kind]) return EMO[kind];
  return (EMO[kind] = canvasTex(128, (g) => {
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 56, 48, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(50, 98); g.lineTo(64, 124); g.lineTo(76, 98); g.fill();
    g.lineWidth = 6; g.lineCap = 'round';
    if (kind === 'heart') { g.fillStyle = '#ff3caa'; g.beginPath(); g.moveTo(64, 82); g.bezierCurveTo(20, 54, 36, 22, 64, 42); g.bezierCurveTo(92, 22, 108, 54, 64, 82); g.fill(); }
    if (kind === 'star') { g.fillStyle = '#ffc93c'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 14 : 32, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(64 + Math.cos(a) * r, 56 + Math.sin(a) * r); } g.fill(); }
    if (kind === 'note') { g.fillStyle = '#9646dc'; g.strokeStyle = '#9646dc'; g.beginPath(); g.ellipse(52, 74, 12, 9, -0.4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(62, 72); g.lineTo(62, 28); g.lineTo(84, 36); g.stroke(); }
    if (kind === 'ask') { g.fillStyle = '#9646dc'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('?', 64, 78); }
    if (kind === 'sparkle') { g.strokeStyle = '#4cb8ff'; [[64, 30, 64, 82], [38, 56, 90, 56], [46, 38, 82, 74], [82, 38, 46, 74]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }); }
    if (kind === 'calm') { g.strokeStyle = '#3aa880'; g.beginPath(); g.arc(46, 52, 10, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); g.beginPath(); g.arc(82, 52, 10, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); g.beginPath(); g.arc(64, 66, 14, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
    if (kind === 'wave') { g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(64, 56, 24, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2a1640'; g.beginPath(); g.arc(56, 50, 3.5, 0, 7); g.fill(); g.beginPath(); g.arc(72, 50, 3.5, 0, 7); g.fill(); g.strokeStyle = '#2a1640'; g.lineWidth = 4; g.beginPath(); g.arc(64, 58, 10, 0.2, Math.PI - 0.2); g.stroke(); }
  }));
}
const emotes = [];
function emote(av, kind) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoTex(kind), transparent: true, depthTest: false }));
  s.scale.set(2.6, 2.6, 1); s.renderOrder = 10; scene.add(s);
  emotes.push({ s, av, t: 0, life: 2.6 * Math.min(1.6, spd()), kind });
}

// ---------- comfort and visitors ----------
function placed() { return SLOTS.filter(s => placedMap[s.id]).map(s => ({ slot: s.id, p: st.room[s.id], item: placedMap[s.id].item })); }
const has = id => placed().some(x => x.item.id === id);
const hasTag = t => placed().some(x => x.item.tags.indexOf(t) >= 0);
const fibreColours = () => placed().filter(x => x.item.kind === 'fibre' || x.item.kind === 'bubble').map(x => x.p.color);
function comfort() {
  const cats = ['light', 'seat', 'touch', 'sound', 'movement', 'pressure', 'quiet'];
  let score = cats.filter(hasTag).length * 12;
  if (st.calm) score += 6; if (st.bright <= 75) score += 5; if (st.vol <= 60) score += 5;
  const n = placed().length; if (n > 11) score -= (n - 11) * 6;
  return Math.max(0, Math.min(100, score));
}
const VISITORS = [
  { name: 'Ava', top: '#4cb8ff', bottom: '#2a1640', hair: '#2a1a12', style: 'Long', extra: 'Bow', likes: ['fibre', 'beanbag'], says: 'I like soft blue light and somewhere cosy to sit.',
    needs: [['A fibre optic light set to blue', () => placed().some(x => x.item.kind === 'fibre' && x.p.color === 'blue')], ['A beanbag', () => has('beanbag')]],
    bonus: ['Not too busy: 6 items or fewer', () => placed().length <= 6] },
  { name: 'Leo', top: '#5cf0a0', bottom: '#4a6aa8', hair: '#c98a3a', style: 'Short', extra: 'Headphones', likes: ['bubble-tube', 'rain-tube', 'headphones'], says: 'I love bubbles and gentle sounds, not loud ones.',
    needs: [['A bubble tube', () => has('bubble-tube')], ['A rain sound tube', () => has('rain-tube')], ['Quiet headphones on the wall', () => has('headphones')]],
    bonus: ['Volume at 50 or lower', () => st.vol <= 50] },
  { name: 'Sam', top: '#ffcf5c', bottom: '#2a1640', hair: '#6b3a1e', style: 'Curly', extra: 'Cap', likes: ['sensory-swing', 'pod-swing', 'crash-pad', 'tactile-stones'], says: 'I like to move, swing and land on something soft.',
    needs: [['A swing', () => has('sensory-swing') || has('pod-swing')], ['A soft crash pad', () => has('crash-pad')], ['Tactile floor stones', () => has('tactile-stones')]],
    bonus: ['Both a sensory swing and a pod swing', () => has('sensory-swing') && has('pod-swing')] },
  { name: 'Priya', top: '#ff5cc0', bottom: '#9646dc', hair: '#2a1a12', style: 'Buns', extra: 'None', likes: ['tactile-panels', 'fidget-wall', 'fidget-basket'], says: 'I like things to touch and keep my hands busy.',
    needs: [['Tactile wall panels', () => has('tactile-panels')], ['A fidget wall', () => has('fidget-wall')], ['A quiet fidget basket', () => has('fidget-basket')]],
    bonus: ['Something glowing to look at too', () => hasTag('light')] },
  { name: 'Joe', top: '#b07cff', bottom: '#5c8a6a', hair: '#eeeeee', style: 'Short', extra: 'Cap', likes: ['stars', 'galaxy', 'weighted-blanket'], says: 'Low light, a starry sky and soft music please.',
    needs: [['Stars switched on in the ceiling', () => anyOn('stars')], ['A galaxy projector playing', () => anyOn('galaxy')], ['A weighted blanket', () => has('weighted-blanket')], ['Brightness at 60 or lower', () => st.bright <= 60]],
    bonus: ['Calm mode on', () => st.calm] },
  { name: 'Maya', top: '#ff8cc8', bottom: '#4a6aa8', hair: '#f2d27a', style: 'Long', extra: 'Crown', likes: ['fibre'], says: 'Fibre optics everywhere, in lots of colours, but nothing flashing.',
    needs: [['Three fibre optic lights', () => placed().filter(x => x.item.kind === 'fibre').length >= 3], ['At least three different colours', () => new Set(fibreColours()).size >= 3]],
    bonus: ['One set to slow rainbow', () => fibreColours().indexOf('rainbow') >= 0] },
  { name: 'Noah', top: '#5cc8c8', bottom: '#2a1640', hair: '#2a1a12', style: 'Curly', extra: 'Headphones', likes: ['weighted-blanket', 'lap-pad', 'headphones'], says: 'I need a quiet corner with a heavy blanket and a calm wall colour.',
    needs: [['A weighted blanket or lap pad', () => has('weighted-blanket') || has('lap-pad')], ['Quiet headphones', () => has('headphones')], ['Ocean, forest or charcoal walls', () => ['ocean', 'forest', 'charcoal'].indexOf(st.paint) >= 0], ['Calm mode on', () => st.calm]],
    bonus: ['Volume at 30 or lower', () => st.vol <= 30] },
  { name: 'Big makeover', top: '#ff3caa', bottom: '#9646dc', hair: '#9646dc', style: 'Buns', extra: 'Crown', likes: ['any'], says: 'Design a room everyone can enjoy, with something on the ceiling, wall and floor.',
    needs: [['Something on the ceiling', () => placed().some(x => x.slot[0] === 'c')], ['Something on the wall', () => placed().some(x => x.slot[0] === 'w')], ['At least 9 items', () => placed().length >= 9], ['Comfort 80 or more', () => comfort() >= 80]],
    bonus: ['Comfort 95 or more', () => comfort() >= 95] }
];
function evalVisitor(i) {
  const v = VISITORS[i];
  const res = v.needs.map(n => ({ text: n[0], ok: !!n[1]() }));
  const all = res.every(r => r.ok), c = comfort(), bonusOk = !!v.bonus[1]();
  return { res, all, comfort: c, stars: all ? 1 + (c >= 60 ? 1 : 0) + (bonusOk ? 1 : 0) : 0, bonusOk };
}
function award(id) {
  if (st.badges[id]) return; st.badges[id] = Date.now();
  const b = BADGES.find(x => x.id === id); setTimeout(() => msg('New badge: ' + b.name + '.'), 1400); renderBadges();
}

// ---------- visitor characters (game characters, one at a time) ----------
let npc = null;
function liked(v) {
  return placed().filter(x => v.likes.indexOf('any') >= 0 || v.likes.indexOf(x.item.id) >= 0 || v.likes.indexOf(x.item.kind) >= 0).map(x => x.slot).slice(0, 4);
}
function inviteVisitor(i) {
  if (npc) { msg(npc.v.name + ' is already visiting.'); return; }
  const v = VISITORS[i];
  const av = makeAvatar({ skin: LOOK.skin[(i * 2 + 1) % LOOK.skin.length], hair: v.hair, style: v.style, top: v.top, bottom: v.bottom, extra: v.extra });
  av.position.set(DOOR.x, 0, DOOR.z); av.rotation.y = Math.PI / 2; scene.add(av);
  npc = { av, v, i, stops: liked(v), step: 0, phase: 'enter', target: new THREE.Vector3(-HX + 3, 0, DOOR.z), wait: 0, sitting: false };
  closePanels(); closeSheet(); SFX.hello(); renderVisitor();
  msg(v.name + ' is coming in. Watch where they go.', 5000);
}
function npcStand() { const n = npc; if (n.sitting) { const u = n.standAt; if (u) n.av.position.set(u.x, 0, u.z); n.sitting = false; } pose(n.av, 'stand'); }
function nextStop() {
  const n = npc; npcStand();
  while (n.step < n.stops.length && !placedMap[n.stops[n.step]]) n.step++;
  if (n.step < n.stops.length) { const sid = n.stops[n.step++]; n.cur = sid; n.target = usePoint(slotById[sid], placedMap[sid]).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0, 0.4)); }
  else { n.cur = null; n.phase = 'judge'; n.target = new THREE.Vector3(0, 0, 9); }
}
function npcStep(dt, T) {
  if (!npc) return;
  const n = npc, av = n.av;
  if (n.wait > 0) { n.wait -= dt; animateWalk(av, 0, T); return; }
  const to = n.target, d = Math.hypot(to.x - av.position.x, to.z - av.position.z);
  if (d > 0.45) {
    const sp = 7 / Math.max(1, spd() * 0.7), step = Math.min(d, sp * dt);
    av.position.x += (to.x - av.position.x) / d * step; av.position.z += (to.z - av.position.z) / d * step;
    av.rotation.y = Math.atan2(to.x - av.position.x, to.z - av.position.z);
    if (n.phase === 'visit' || n.phase === 'judge') pushOut(av.position);
    animateWalk(av, sp, T); return;
  }
  animateWalk(av, 0, T);
  if (n.phase === 'enter') { emote(av, 'wave'); n.phase = 'visit'; n.wait = 1; nextStop(); return; }
  if (n.phase === 'visit') {
    if (n.cur && n.arrived !== n.cur) {
      n.arrived = n.cur;
      const o = placedMap[n.cur];
      if (o) {
        const c = o.g.position, kind = o.item.kind, seat = o.g.userData.seat;
        av.rotation.y = Math.atan2(c.x - av.position.x, (o.item.zone === 'wall' ? -HZ : c.z) - av.position.z);
        if (seat && !seat.swingY) { n.standAt = av.position.clone(); av.position.set(c.x, seat.y, c.z); av.rotation.y = 0; pose(av, seat.lie ? 'lie' : 'sit'); n.sitting = true; emote(av, 'calm'); }
        else if (kind === 'fibre' || kind === 'sequin' || kind === 'fidget') { pose(av, 'reach'); emote(av, 'heart'); }
        else if (kind === 'stars' || kind === 'galaxy') emote(av, 'star');
        else if (kind === 'rain' || kind === 'quiet') emote(av, 'note');
        else if (kind === 'bubble') emote(av, 'heart');
        else emote(av, 'sparkle');
        n.wait = 3 * Math.min(1.6, spd()); return;
      }
    }
    nextStop(); return;
  }
  if (n.phase === 'judge') {
    npcStand(); av.rotation.y = 0;
    const r = finishVisit(n.i);
    emote(av, r.all ? (r.stars === 3 ? 'star' : 'heart') : 'ask');
    n.phase = 'leave'; n.wait = 2.8; n.target = new THREE.Vector3(DOOR.x, 0, DOOR.z); return;
  }
  if (n.phase === 'leave') { scene.remove(av); npc = null; renderVisitor(); }
}
function finishVisit(i) {
  const e = evalVisitor(i), v = VISITORS[i];
  if (!e.all) { msg(v.name + ' would like a few more things first. Check the list in Visitors.', 6000); SFX.cosy(); return e; }
  const prev = st.stars[i] || 0; let reward = 0;
  if (e.stars > prev) { reward = (e.stars - prev) * 50 + (prev === 0 ? 30 : 0); st.stars[i] = e.stars; }
  st.coins += reward; st.earned += reward;
  if (st.calm) award('calm'); if (e.stars === 3) award('stars3');
  if (VISITORS.every((_, k) => st.stars[k])) award('all');
  if (i === st.level && i < VISITORS.length - 1) st.level = i + 1;
  save(); SFX.coins(); coinsUI();
  msg(v.name + ' enjoyed the room: ' + e.stars + ' of 3 stars.' + (reward ? ' You earned ' + reward + ' coins.' : ' Beat your best stars to earn more coins.'), 6000);
  return e;
}

// ---------- build mode ----------
let sel = null, zoneFilter = 'all';
const pads = new THREE.Group(); scene.add(pads);
const padMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
const padFill = new THREE.MeshBasicMaterial({ color: 0xff8cc8, transparent: true, opacity: 0.3, depthWrite: false });
const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false });
function padPoint(s) { return s.zone === 'wall' ? { x: s.x, z: -HZ + 3.5 } : { x: s.x, z: s.z }; }
function refreshPads() {
  clearG(pads);
  if (sel) {
    const it = itemById(sel);
    SLOTS.filter(s => s.zone === it.zone && !st.room[s.id]).forEach(s => {
      const p = padPoint(s);
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.6, 36), padMat); ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, 0.06, p.z);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.8, 36), padFill); disc.rotation.x = -Math.PI / 2; disc.position.set(p.x, 0.05, p.z);
      ring.userData.pad = disc.userData.pad = s.id; pads.add(ring, disc);
      if (s.zone !== 'floor') { const h = s.zone === 'ceiling' ? ROOM.h : 9; const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, h, 8), beamMat); beam.position.set(s.x, h / 2, s.zone === 'wall' ? -HZ + 0.6 : s.z); pads.add(beam); }
    });
  }
  setMode();
}
function setMode() { $('mode').textContent = sel ? 'Building: ' + itemById(sel).name : (pState.sit ? (pState.sit.swing ? 'Swinging' : 'Relaxing') : 'Exploring'); }
function placeAt(slotId) {
  const s = slotById[slotId]; if (!sel || st.room[slotId]) return false;
  const it = itemById(sel); if (it.zone !== s.zone) return false;
  if (st.coins < it.coin) { msg('You need ' + it.coin + ' coins. Welcome visitors to earn more.'); return false; }
  st.coins -= it.coin;
  st.room[slotId] = { id: it.id, color: it.kind === 'fibre' || it.kind === 'bubble' ? 'pink' : (it.kind === 'cosy' || it.kind === 'swing' ? 'purple' : 'blue'), on: true };
  sel = null; spawn(slotId); pushOut(player.position);
  award('first'); if (it.kind === 'fibre') award('fibre'); if (it.kind === 'bubble') award('bubbles'); if (placed().length >= 12) award('full');
  save(); coinsUI(); refreshPads(); renderPalette(); renderVisitor(); SFX.place();
  emote(player, 'sparkle'); msg(it.name + ' placed. ' + it.desc);
  syncMusic(); return true;
}
function nearestPad() {
  if (!sel) return null; const it = itemById(sel); let best = null, bd = 3.4;
  SLOTS.forEach(s => { if (s.zone !== it.zone || st.room[s.id]) return; const p = padPoint(s); const d = Math.hypot(p.x - player.position.x, p.z - player.position.z); if (d < bd) { bd = d; best = s.id; } });
  return best;
}

// ---------- player interaction ----------
const pState = { sit: null, moveTo: null, onArrive: null };
function nearestItem() {
  let best = null, bd = 5.5;
  SLOTS.forEach(s => { const o = placedMap[s.id]; if (!o) return; const u = usePoint(s, o); const d = Math.hypot(u.x - player.position.x, u.z - player.position.z); if (d < bd) { bd = d; best = s.id; } });
  return best;
}
function cycleColour(p, noRainbow) { const ids = SR.COLORS.map(c => c.id).filter(c => !(noRainbow && c === 'rainbow')); p.color = ids[(ids.indexOf(p.color) + 1) % ids.length]; }
const colourName = id => (SR.COLORS.find(c => c.id === id) || {}).name || id;
let reachT = null;
function reach() { pose(player, 'reach'); clearTimeout(reachT); reachT = setTimeout(() => { if (!pState.sit) pose(player, 'stand'); }, 1400); }
function useItem(slotId) {
  const o = placedMap[slotId]; if (!o) return;
  const s = slotById[slotId], it = o.item, p = st.room[slotId], ud = o.g.userData, c = o.g.position;
  if (pState.sit) standUp();
  const tz = s.zone === 'wall' ? -HZ : c.z; player.rotation.y = Math.atan2(c.x - player.position.x, tz - player.position.z);
  let note = '';
  switch (it.kind) {
    case 'fibre': cycleColour(p); reach(); SFX.chime(); emote(player, 'heart'); note = 'You touched the fibre optics. Colour: ' + colourName(p.color) + '.'; break;
    case 'bubble': cycleColour(p); SFX.bubble(); emote(player, 'calm'); note = 'You watch the bubbles drift up. Colour: ' + colourName(p.color) + '.'; break;
    case 'stars': case 'galaxy': p.on = !p.on; SFX.sparkle(); emote(player, 'star'); note = p.on ? 'Switched on. It fades in slowly.' : 'Switched off.'; break;
    case 'rain': cycleColour(p); SFX.rain(); emote(player, 'note'); ud.tipT = 3; note = 'You tip the tube and listen to the rain.'; break;
    case 'sequin': cycleColour(p); reach(); SFX.click(); emote(player, 'sparkle'); note = 'The sequins flip to ' + colourName(p.color) + '.'; break;
    case 'fidget': reach(); SFX.click(); ud.boost = 3; emote(player, 'heart'); note = 'Spin, slide, click.'; break;
    case 'stones': hopStones(o); SFX.click(); note = 'Hop across the bumpy stones.'; break;
    case 'quiet': quietUntil = Date.now() + 15000; setVol(); setTimeout(setVol, 15100); setExtra(player, 'Headphones'); setTimeout(() => setExtra(player, lookColours().extra), 15000); emote(player, 'calm'); note = 'Headphones on. The room is quieter for 15 seconds.'; break;
    case 'cosy': case 'swing': sitOn(slotId); note = it.kind === 'swing' ? 'Swinging gently. Move to hop off.' : 'Nice and cosy. Move to get up.'; award(it.kind === 'swing' ? 'swing' : 'cosy'); break;
  }
  save(); renderVisitor(); syncMusic(); msg(note);
}
function sitOn(slotId) {
  const o = placedMap[slotId], seat = o.g.userData.seat, c = o.g.position;
  pState.sit = { slotId, swing: !!seat.swingY }; pState.moveTo = null;
  if (seat.swingY) { o.g.userData.sway.add(player); player.position.set(0, seat.swingY, 0); player.rotation.y = 0; pose(player, 'sit'); SFX.whoosh(); }
  else { player.position.set(c.x, seat.y, c.z); player.rotation.y = 0; pose(player, seat.lie ? 'lie' : 'sit'); SFX.cosy(); }
  emote(player, 'calm'); setMode();
}
function standUp() {
  const s = pState.sit; if (!s) return;
  if (player.parent !== scene) scene.add(player);
  const o = placedMap[s.slotId], u = o ? usePoint(slotById[s.slotId], o) : new THREE.Vector3(0, 0, 10);
  player.position.set(u.x, 0, u.z); player.rotation.y = Math.PI;
  pose(player, 'stand'); pState.sit = null; setMode();
}
let hop = null;
function hopStones(o) { const c = o.g.position; hop = { from: player.position.clone(), pts: [[-2.6, 1.3], [0, 1.3], [2.6, 1.3], [2.6, -1.3], [0, -1.3], [-2.6, -1.3]].map(([x, z]) => new THREE.Vector3(c.x + x, 0, c.z + z)), i: 0, t: 0 }; emote(player, 'heart'); }

function openSheet(slotId, note) {
  const o = placedMap[slotId]; if (!o) return;
  const it = o.item, p = st.room[slotId], shop = SR.SHOP[it.shop];
  $('sheetTitle').textContent = it.name;
  $('sheetText').textContent = (note ? note + ' ' : '') + it.desc;
  const btns = $('sheetBtns'); btns.replaceChildren();
  if (['fibre', 'bubble', 'sequin', 'rain', 'cosy', 'swing'].indexOf(it.kind) >= 0) {
    SR.COLORS.forEach(c => {
      if ((it.kind === 'cosy' || it.kind === 'swing') && c.id === 'rainbow') return;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'sw';
      b.style.background = c.id === 'rainbow' ? 'linear-gradient(135deg,#ff5cc0,#ffcf5c,#5cf0a0,#4cb8ff,#b07cff)' : c.hex;
      b.setAttribute('aria-label', c.name);
      b.addEventListener('click', () => { p.color = c.id; save(); renderVisitor(); $('sheetText').textContent = 'Colour: ' + c.name + '. ' + it.desc; if (it.kind === 'fibre') SFX.chime(); else if (it.kind === 'bubble') SFX.bubble(); });
      btns.appendChild(b);
    });
  }
  const real = document.createElement('a'); real.href = SHOP_URL + '#item-' + it.shop; real.className = 'getreal'; real.textContent = 'Get the real one, US$' + shop.price;
  const back = p.gift ? 0 : it.coin;
  const away = document.createElement('button'); away.type = 'button'; away.className = 'alt';
  away.textContent = back ? 'Put away (+' + back + ' coins)' : 'Put away (welcome gift)';
  away.addEventListener('click', () => {
    if (pState.sit && pState.sit.slotId === slotId) standUp();
    delete st.room[slotId]; st.coins += back; spawn(slotId); save(); coinsUI(); closeSheet(); renderVisitor(); syncMusic(); refreshPads();
    msg(it.name + ' put away.' + (back ? ' Coins returned.' : ''));
  });
  const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Done'; close.addEventListener('click', closeSheet);
  btns.append(real, away, close);
  closePanels(); $('sheet').hidden = false;
}
function closeSheet() { $('sheet').hidden = true; }

// ---------- UI panels ----------
function closePanels() { document.querySelectorAll('.panel').forEach(p => p.classList.remove('show')); }
function togglePanel(id, fill) { const el = $(id), was = el.classList.contains('show'); closePanels(); closeSheet(); if (!was) { if (fill) fill(); el.classList.add('show'); } }
function renderPalette() {
  const pal = $('palette'); pal.replaceChildren();
  SR.ITEMS.filter(it => zoneFilter === 'all' || it.zone === zoneFilter).forEach(it => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pal' + (sel === it.id ? ' sel' : '');
    b.innerHTML = SR.ART[it.id]('#ff5cc0', true) + '<span></span><span class="cost">' + it.coin + ' coins</span><small>' + it.zone + '</small>';
    b.children[1].textContent = it.name;
    b.setAttribute('aria-pressed', sel === it.id ? 'true' : 'false');
    b.addEventListener('click', () => {
      sel = sel === it.id ? null : it.id;
      if (sel) {
        if (!SLOTS.some(s => s.zone === it.zone && !st.room[s.id])) { msg('Every ' + it.zone + ' spot is full. Use Info on an item to put it away first.'); sel = null; }
        else if (st.coins < it.coin) { msg('You need ' + it.coin + ' coins. Welcome visitors to earn more.'); sel = null; }
        else { closePanels(); msg('Tap a glowing pad, or walk onto one and press Place here, to put the ' + it.name.toLowerCase() + ' there.', 6000); }
      }
      renderPalette(); refreshPads();
    });
    pal.appendChild(b);
  });
}
function faceSvg(col) { return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="' + col + '"/><circle cx="36" cy="44" r="5" fill="#2a1640"/><circle cx="64" cy="44" r="5" fill="#2a1640"/><path d="M34 62 Q50 76 66 62" stroke="#2a1640" stroke-width="5" fill="none" stroke-linecap="round"/></svg>'; }
const maxUnlocked = () => { let k = 0; while (k < VISITORS.length - 1 && st.stars[k]) k++; return k; };
function renderVisitor() {
  const i = Math.min(st.level, VISITORS.length - 1), v = VISITORS[i], e = evalVisitor(i);
  const card = $('visitorCard'); card.replaceChildren();
  const face = document.createElement('div'); face.className = 'face'; face.innerHTML = faceSvg(v.top);
  const h = document.createElement('h4'); h.textContent = 'Visitor ' + (i + 1) + ': ' + v.name;
  const q = document.createElement('p'); q.textContent = '"' + v.says + '"';
  const ul = document.createElement('ul');
  e.res.forEach(r => { const li = document.createElement('li'); li.className = r.ok ? 'ok' : 'no'; li.textContent = r.text; ul.appendChild(li); });
  const bl = document.createElement('li'); bl.className = e.bonusOk ? 'ok' : 'no'; bl.textContent = 'Bonus star: ' + v.bonus[0]; ul.appendChild(bl);
  const cl = document.createElement('li'); cl.className = e.comfort >= 60 ? 'ok' : 'no'; cl.textContent = 'Bonus star: room comfort 60 or more'; ul.appendChild(cl);
  const m = document.createElement('div'); m.className = 'meter'; m.innerHTML = '<i style="width:' + e.comfort + '%"></i>';
  const ct = document.createElement('p'); ct.textContent = 'Room comfort: ' + e.comfort + ' out of 100. Mix light, seats, touch, sound, movement, pressure and quiet.';
  const best = st.stars[i] || 0;
  const bt = document.createElement('button'); bt.type = 'button'; bt.id = 'inviteBtn';
  bt.textContent = npc ? npc.v.name + ' is visiting' : 'Invite ' + v.name + (best ? ' again (best ' + best + ' of 3 stars)' : '');
  bt.disabled = !!npc; bt.addEventListener('click', () => inviteVisitor(i));
  card.append(face, h, q, ul, m, ct, bt);
  const list = $('levelList'); list.replaceChildren();
  VISITORS.forEach((vv, k) => {
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = (k + 1) + '. ' + vv.name + ' ' + (st.stars[k] ? '\u2605'.repeat(st.stars[k]) : '');
    b.disabled = k > maxUnlocked(); if (k === i) b.className = 'cur';
    b.addEventListener('click', () => { st.level = k; save(); renderVisitor(); });
    list.appendChild(b);
  });
}
function renderBadges() { const b = $('badges'); b.replaceChildren(); BADGES.forEach(x => { const s = document.createElement('span'); s.className = 'badge' + (st.badges[x.id] ? ' got' : ''); s.textContent = x.name; b.appendChild(s); }); }
function renderReal() {
  const box2 = $('realList'); box2.replaceChildren(); const seen = {};
  SR.ITEMS.forEach(it => { if (seen[it.shop]) return; seen[it.shop] = 1; const s = SR.SHOP[it.shop]; const a = document.createElement('a'); a.className = 'real'; a.href = SHOP_URL + '#item-' + it.shop; a.innerHTML = '<span></span><b></b>'; a.firstChild.textContent = s.name; a.lastChild.textContent = 'US$' + s.price; box2.appendChild(a); });
}
function renderMe() {
  const box2 = $('meOpts'); box2.replaceChildren();
  [['skin', 'Skin tone', true], ['hair', 'Hair colour', true], ['style', 'Hair style', false], ['top', 'Top', true], ['bottom', 'Trousers', true], ['extra', 'Accessory', false]].forEach(([k, label, swatch]) => {
    const h = document.createElement('h4'); h.textContent = label; const row = document.createElement('div'); row.className = 'opts';
    LOOK[k].forEach((val, idx) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = (swatch ? 'sw' : 'txt') + (st.look[k] === idx ? ' on' : '');
      if (swatch) { b.style.background = val; b.setAttribute('aria-label', label + ' ' + (idx + 1)); } else b.textContent = val;
      b.addEventListener('click', () => { st.look[k] = idx; save(); applyLook(); renderMe(); emote(player, 'sparkle'); });
      row.appendChild(b);
    });
    box2.append(h, row);
  });
}
function applyView() {
  const b = 0.45 + st.bright / 100 * 0.6;
  renderer.domElement.style.filter = 'brightness(' + b.toFixed(2) + ') saturate(' + (st.calm ? 0.6 : 1) + ')';
  hemi.intensity = 0.55 + st.bright / 100 * 0.6;
  $('calmPill').textContent = st.calm ? 'Calm on' : 'Calm off'; $('calmPill').setAttribute('aria-pressed', st.calm ? 'true' : 'false');
  $('calmToggle').checked = !!st.calm;
}
function setCalm(on) {
  st.calm = on;
  if (on) { if (st.vol > 40) st.vol = 40; if (st.bright > 60) st.bright = 60; }
  $('vol').value = st.vol; $('bright').value = st.bright; $('volV').textContent = st.vol; $('brightV').textContent = st.bright;
  save(); setVol(); applyView(); renderVisitor();
  msg(on ? 'Calm mode on: softer colours, slower movement and quieter sound.' : 'Calm mode off.');
}
function bindUI() {
  $('bBuild').onclick = () => togglePanel('pBuild', renderPalette);
  $('bVisit').onclick = () => togglePanel('pVisit', () => { renderVisitor(); renderBadges(); });
  $('bMe').onclick = () => togglePanel('pMe', renderMe);
  $('bCalm').onclick = () => togglePanel('pCalm');
  $('bReal').onclick = () => togglePanel('pReal', renderReal);
  $('bAbout').onclick = () => { closePanels(); $('about').scrollIntoView({ behavior: 'smooth' }); };
  document.querySelectorAll('.closeP').forEach(b => b.addEventListener('click', closePanels));
  document.querySelectorAll('.zones button').forEach(b => b.addEventListener('click', () => { zoneFilter = b.dataset.zone; document.querySelectorAll('.zones button').forEach(x => x.classList.toggle('on', x === b)); renderPalette(); }));
  $('calmPill').onclick = () => setCalm(!st.calm);
  const vol = $('vol'), br = $('bright'), mu = $('musicToggle');
  vol.value = st.vol; br.value = st.bright; mu.checked = !!st.music; $('volV').textContent = st.vol; $('brightV').textContent = st.bright;
  $('calmToggle').addEventListener('change', e => setCalm(e.target.checked));
  vol.addEventListener('input', () => { st.vol = +vol.value; $('volV').textContent = st.vol; save(); setVol(); renderVisitor(); });
  br.addEventListener('input', () => { st.bright = +br.value; $('brightV').textContent = st.bright; save(); applyView(); renderVisitor(); });
  mu.addEventListener('change', () => { st.music = mu.checked; save(); audio(); syncMusic(); });
  const pb = $('paints');
  PAINTS.forEach(p => { const b = document.createElement('button'); b.type = 'button'; b.style.background = p.hex; b.setAttribute('aria-label', p.id + ' wall'); if (st.paint === p.id) b.className = 'on'; b.addEventListener('click', () => { st.paint = p.id; save(); [...pb.children].forEach(c => c.className = ''); b.className = 'on'; applyPaint(); renderVisitor(); }); pb.appendChild(b); });
  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Start a new room? Your items go back and your coins stay.')) return;
    if (pState.sit) standUp();
    placed().forEach(x => { if (!x.p.gift) st.coins += x.item.coin; });
    st.room = {}; save(); rebuildAll(); coinsUI(); renderVisitor(); syncMusic(); refreshPads();
  });
  $('useBtn').addEventListener('click', doUse);
  $('infoBtn').addEventListener('click', () => { const n = pState.sit ? pState.sit.slotId : nearestItem(); if (n) openSheet(n); });
}
function doUse() {
  if (sel) { const pad = nearestPad(); if (pad) { placeAt(pad); return; } }
  if (pState.sit) { standUp(); return; }
  const n = nearestItem(); if (n) useItem(n);
}

// ---------- input: keyboard, tap to move, joystick, drag to look ----------
const keys = {};
addEventListener('keydown', e => {
  const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT') return;
  if (!$('start').hidden) return;
  keys[e.code] = true;
  if ((e.code === 'KeyE' || e.code === 'Enter') && tg !== 'BUTTON' && tg !== 'A') { e.preventDefault(); doUse(); }
  if (e.code === 'KeyB') togglePanel('pBuild', renderPalette);
  if (e.code === 'KeyI') { const n = pState.sit ? pState.sit.slotId : nearestItem(); if (n) openSheet(n); }
  if (e.code === 'Escape') { closePanels(); closeSheet(); if (sel) { sel = null; refreshPads(); renderPalette(); } }
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) >= 0 && tg !== 'BUTTON') e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let camYaw = 0, camPitch = 0.42, camDist = 30;
const joy = { x: 0, y: 0, id: null };
let drag = null;
const ray = new THREE.Raycaster();
const cvs = renderer.domElement;
cvs.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false }; });
addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) drag.moved = true;
  if (!drag.moved) return;
  camYaw = Math.max(-0.95, Math.min(0.95, camYaw - (e.clientX - drag.x) * 0.005));
  camPitch = Math.max(0.12, Math.min(0.62, camPitch + (e.clientY - drag.y) * 0.003));
  drag.x = e.clientX; drag.y = e.clientY;
});
addEventListener('pointerup', e => { if (!drag || drag.id !== e.pointerId) return; const tap = !drag.moved; drag = null; if (tap && e.target === cvs) tapAt(e.clientX, e.clientY); });
addEventListener('pointercancel', () => { drag = null; });
const marker = new THREE.Mesh(new THREE.RingGeometry(0.6, 0.9, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false }));
marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
function tapAt(cx, cy) {
  const r = cvs.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1), camera);
  if (sel) { const h = ray.intersectObjects(pads.children, false).find(x => x.object.userData.pad); if (h) { placeAt(h.object.userData.pad); return; } }
  ray.params.Line.threshold = 0.6; ray.params.Points.threshold = 0.8;
  const hit = ray.intersectObjects(Object.values(placedMap).map(o => o.g), true).find(x => x.object.userData.slotId && !x.object.isSprite && x.object.visible);
  if (hit) {
    const sid = hit.object.userData.slotId;
    if (pState.sit && pState.sit.slotId === sid) { openSheet(sid); return; }
    if (pState.sit) standUp();
    hop = null; pState.moveTo = usePoint(slotById[sid], placedMap[sid]); pState.onArrive = () => useItem(sid);
    msg('Walking to the ' + placedMap[sid].item.name.toLowerCase() + '.', 2000); return;
  }
  const f = ray.intersectObject(floor)[0];
  if (f) { if (pState.sit) standUp(); hop = null; pState.moveTo = new THREE.Vector3(f.point.x, 0, f.point.z); pState.onArrive = null; marker.position.set(f.point.x, 0.07, f.point.z); marker.visible = true; }
}
const joyEl = $('joy'), knob = $('knob');
joyEl.addEventListener('pointerdown', e => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); moveJoy(e); });
joyEl.addEventListener('pointermove', e => { if (joy.id === e.pointerId) moveJoy(e); });
const endJoy = e => { if (joy.id === e.pointerId) { joy.id = null; joy.x = joy.y = 0; knob.style.left = knob.style.top = '35px'; } };
joyEl.addEventListener('pointerup', endJoy); joyEl.addEventListener('pointercancel', endJoy);
function moveJoy(e) {
  const r = joyEl.getBoundingClientRect(); let dx = e.clientX - r.left - 60, dy = e.clientY - r.top - 60;
  const l = Math.hypot(dx, dy); if (l > 45) { dx *= 45 / l; dy *= 45 / l; }
  joy.x = dx / 45; joy.y = dy / 45; knob.style.left = 35 + dx + 'px'; knob.style.top = 35 + dy + 'px';
}

// ---------- collisions ----------
function pushOut(pos) {
  pos.x = Math.max(-HX + 1.4, Math.min(HX - 1.4, pos.x)); pos.z = Math.max(-HZ + 1.6, Math.min(HZ + 6, pos.z));
  Object.values(placedMap).forEach(o => {
    if (o.item.zone !== 'floor') return; const r = o.g.userData.radius + 1; if (r < 1.3) return;
    const dx = pos.x - o.g.position.x, dz = pos.z - o.g.position.z, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 0.001) { pos.z += r; return; } pos.x = o.g.position.x + dx / d * r; pos.z = o.g.position.z + dz / d * r; }
  });
}

// ---------- coins over time ----------
function daily() {
  const d = new Date(), key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  if (st.day !== key) { const first = !st.day; st.day = key; if (!first) { st.coins += 40; setTimeout(() => msg('Welcome back. Daily bonus: 40 coins.'), 900); } save(); }
}
setInterval(() => {
  if (document.hidden || !placed().length) return;
  const add = Math.min(5, Math.floor(comfort() / 20));
  if (add > 0) { st.coins += add; st.earned += add; save(); coinsUI(); }
}, 45000);

// ---------- main loop ----------
const clock = new THREE.Clock();
let T = 0, useKey = '';
function updateUseButton() {
  let label = '', info = false;
  if (sel) { if (nearestPad()) label = 'Place here'; }
  if (!label && pState.sit) { label = 'Get up'; info = true; }
  if (!label && !hop) { const n = nearestItem(); if (n) { const o = placedMap[n]; label = o.g.userData.use + ' ' + o.item.name.toLowerCase(); info = true; } }
  const k = label + '|' + info; if (k === useKey) return; useKey = k;
  $('useBtn').hidden = !label; $('useBtn').textContent = label; $('infoBtn').hidden = !info;
}
const tmpV = new THREE.Vector3();
function frame() {
  const dt = Math.min(0.05, clock.getDelta()); T += dt;
  const S = spd();
  let mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const manual = Math.hypot(mx, mz) > 0.15;
  if (manual) { pState.moveTo = null; pState.onArrive = null; marker.visible = false; if (hop) { hop = null; player.position.y = 0; } if (pState.sit) standUp(); }
  let moving = 0;
  if (!pState.sit) {
    const speed = st.calm ? 9 : 12;
    if (hop) {
      hop.t += dt * 2.2 / Math.min(1.5, S);
      if (hop.t >= 1) { hop.t = 0; hop.from = hop.pts[hop.i].clone(); hop.i++; if (hop.i >= hop.pts.length) { hop = null; player.position.y = 0; emote(player, 'star'); } else SFX.click(); }
      if (hop) { const a = hop.from, b = hop.pts[hop.i]; player.position.x = a.x + (b.x - a.x) * hop.t; player.position.z = a.z + (b.z - a.z) * hop.t; player.position.y = 0.4 + Math.sin(hop.t * Math.PI) * 1.4; if (Math.hypot(b.x - a.x, b.z - a.z) > 0.01) player.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); }
    } else if (manual) {
      const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
      const sy = Math.sin(camYaw), cy = Math.cos(camYaw);
      const wx = mx * cy + mz * sy, wz = -mx * sy + mz * cy;
      player.position.x += wx * speed * dt; player.position.z += wz * speed * dt;
      player.rotation.y = Math.atan2(wx, wz); moving = speed * Math.min(1, l);
    } else if (pState.moveTo) {
      const t = pState.moveTo, dx = t.x - player.position.x, dz = t.z - player.position.z, d = Math.hypot(dx, dz);
      if (d < 0.6) { pState.moveTo = null; marker.visible = false; const f = pState.onArrive; pState.onArrive = null; if (f) f(); }
      else { const step = Math.min(d, speed * dt); player.position.x += dx / d * step; player.position.z += dz / d * step; player.rotation.y = Math.atan2(dx, dz); moving = speed; }
    }
    if (!hop) pushOut(player.position);
    if (!player.userData.posed && player.userData.parts.ra.rotation.x > -2) animateWalk(player, moving, T);
  }
  // camera follows like Park Builder
  player.getWorldPosition(tmpV); tmpV.y = Math.max(tmpV.y, 0) + 4;
  const cd = camDist * (portrait ? 1.25 : 1);
  camera.position.set(tmpV.x + Math.sin(camYaw) * Math.cos(camPitch) * cd, Math.min(ROOM.h - 1, tmpV.y + Math.sin(camPitch) * cd), tmpV.z + Math.cos(camYaw) * Math.cos(camPitch) * cd);
  camera.lookAt(tmpV);
  // items: slow colour fades only
  const k = 1 - Math.exp(-dt * 1.4 / S);
  Object.values(placedMap).forEach(o => {
    const ud = o.g.userData;
    applyColour(o, k, T);
    o.on += ((o.p.on !== false ? 1 : 0) - o.on) * (1 - Math.exp(-dt * 0.9 / S));
    if (ud.glow) ud.glow.material.opacity = 0.3 + 0.1 * Math.sin(T * 0.8 / S + o.g.position.x);
    if (ud.colorMats[1] && ud.colorMats[1].isPointsMaterial) ud.colorMats[1].opacity = 0.75 + 0.2 * Math.sin(T * 0.9 / S + o.g.position.z);
    if (ud.stars) ud.stars.opacity = o.on * (0.65 + 0.2 * Math.sin(T * 0.6 / S));
    if (ud.galaxy) { ud.galaxy.mat.opacity = o.on * 0.85; ud.galaxy.mesh.rotation.z += dt * 0.05 / S; if (ud.lens) ud.lens.material.emissiveIntensity = 0.2 + o.on * 0.8; }
    if (ud.bubbles.length) { const R = ud.bubbleRange; ud.bubbles.forEach(b => { const ph = ((T * 0.12 / S) + b.userData.ph) % 1; b.position.set(R.x + b.userData.dx * Math.sin(ph * 6), R.y0 + ph * R.h, b.userData.dz); }); }
    if (ud.fish) { ud.fish.position.y = 4.8 + Math.sin(T * 0.5 / S) * 1.2; ud.fish.rotation.y = T * 0.4 / S; }
    if (ud.sway) { const amp = pState.sit && pState.sit.slotId === ud.slotId ? 0.22 : 0.05; ud.sway.rotation.x = Math.sin(T * 1.1 / S) * amp; }
    if (ud.spin.length) { const b = ud.boost > 0 ? 2.5 : 1; ud.boost = Math.max(0, (ud.boost || 0) - dt); ud.spin.forEach((s2, i) => { s2.rotation.z += dt * (0.4 + i * 0.15) * b / S; }); if (ud.slider) ud.slider.position.x = Math.sin(T * 0.5 / S) * 2.4; }
    if (ud.tube) { ud.tipT = Math.max(0, (ud.tipT || 0) - dt); ud.tube.rotation.z = 0.35 + Math.sin(Math.min(1, ud.tipT / 3) * Math.PI) * 0.9; }
  });
  npcStep(dt, T);
  for (let i = emotes.length - 1; i >= 0; i--) {
    const e = emotes[i]; e.t += dt; e.av.getWorldPosition(tmpV);
    const lying = e.av.userData.body.rotation.x !== 0;
    e.s.position.set(tmpV.x, tmpV.y + (lying ? 3.5 : 7.6) + e.t * 0.4, tmpV.z);
    e.s.material.opacity = Math.max(0, Math.min(1, e.t * 3, (e.life - e.t) * 1.5));
    if (e.t >= e.life) { scene.remove(e.s); e.s.material.dispose(); emotes.splice(i, 1); }
  }
  if (marker.visible) marker.material.opacity = 0.45 + 0.25 * Math.sin(T * 2);
  padMat.opacity = 0.4 + 0.2 * Math.sin(T * 1.5 / S);
  updateUseButton();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------- start ----------
function start() {
  $('startCalm').checked = !!st.calm;
  $('playBtn').addEventListener('click', () => {
    $('start').hidden = true; audio();
    if ($('startCalm').checked !== !!st.calm) setCalm($('startCalm').checked);
    syncMusic(); emote(player, 'wave');
    msg(st.earned || Object.keys(st.stars).length ? 'Welcome back to your room.' : 'Walk to the fibre optic waterfall on the back wall and press Use to change its colour. Then open Build.', 7000);
  });
}
applyPaint(); rebuildAll(); applyLook(); bindUI(); applyView(); daily(); coinsUI(); renderPalette(); renderVisitor(); renderBadges(); renderReal(); start(); resize();
requestAnimationFrame(frame);
window.CBSensoryRoom = {
  walk: (x, z) => { if (pState.sit) standUp(); pState.moveTo = new THREE.Vector3(x, 0, z); pState.onArrive = null; },
  state: () => JSON.parse(JSON.stringify(st)), comfort,
  debug: () => ({ player: player.getWorldPosition(new THREE.Vector3()).toArray().map(v => +v.toFixed(2)), sit: pState.sit, npc: npc ? { name: npc.v.name, phase: npc.phase, pos: npc.av.position.toArray().map(v => +v.toFixed(1)) } : null, nearest: nearestItem(), use: $('useBtn').hidden ? '' : $('useBtn').textContent, items: Object.keys(placedMap), emotes: emotes.map(e => e.kind) }),
  screen: (x, y, z) => { const v = new THREE.Vector3(x, y, z).project(camera); const r = cvs.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; },
  itemScreen: sid => { const o = placedMap[sid]; if (!o) return null; const b = new THREE.Box3().setFromObject(o.g).getCenter(new THREE.Vector3()).project(camera); const r = cvs.getBoundingClientRect(); return { x: r.left + (b.x + 1) / 2 * r.width, y: r.top + (1 - b.y) / 2 * r.height }; },
  padScreen: sid => { const p = padPoint(slotById[sid]); const v = new THREE.Vector3(p.x, 0, p.z).project(camera); const r = cvs.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; }
};
