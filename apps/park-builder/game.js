import * as THREE from 'three';

// ---------- settings (same as the Roblox Config) ----------
const CFG = { plotSize: 96, grid: 4, maxPieces: 150, startCoins: 100, coinsPerTick: 5, visitorBonus: 3, tickSeconds: 10 };
const PLOT = { x: 0, z: 124 };
const C = { Pink: 0xff8cc8, HotPink: 0xff3caa, Purple: 0x9646dc, Lilac: 0xd7b4f5, Cream: 0xfff0e6, White: 0xffffff, Black: 0x281932, Coffee: 0x784b32 };
const TRACKS = [
  { name: 'Coffee Break', file: 'tracks/coffee-break.mp3' },
  { name: 'Sweet Juices Cotton Candy', file: 'tracks/sweet-juices-cotton-candy.mp3' },
  { name: 'Drip Drip Drip (Country)', file: 'tracks/drip-drip-drip-country.mp3' },
  { name: "I'm Weak", file: 'tracks/im-weak.mp3' },
  { name: 'Knee Deep Mashup', file: 'tracks/knee-deep-mashup.mp3' },
];
const OUTFITS = [
  { name: 'Pink Latte', top: 0xff8cc8, bottom: 0x9646dc, extra: 'Bow' },
  { name: 'Purple Mocha', top: 0x9646dc, bottom: 0xff3caa, extra: 'Headphones' },
  { name: 'Cotton Candy', top: 0xffc8e6, bottom: 0xbea0ff, extra: 'Crown' },
  { name: 'Barista', top: 0xfff0e6, bottom: 0x784b32, extra: 'Cup' },
];
const PIECES = [
  { id: 'Speaker', name: 'Speaker', cost: 0, fp: [4, 4] },
  { id: 'Lights', name: 'Party Light', cost: 0, fp: [4, 4] },
  { id: 'Stage', name: 'Stage', cost: 0, fp: [16, 10] },
  { id: 'LogoSign', name: 'Coffeebreak Sign', cost: 0, fp: [8, 2] },
  { id: 'Poster', name: 'Character Poster', cost: 40, fp: [6, 2] },
  { id: 'DanceFloor', name: 'Dance Floor', cost: 50, fp: [12, 12] },
  { id: 'TrackStraight', name: 'Coaster Track', cost: 60, fp: [4, 12] },
  { id: 'TrackRamp', name: 'Coaster Ramp', cost: 60, fp: [4, 12] },
  { id: 'FoodStall', name: 'Coffee Stall', cost: 80, fp: [10, 6] },
  { id: 'Slide', name: 'Slide', cost: 120, fp: [6, 16] },
  { id: 'Swing', name: 'Swing', cost: 150, fp: [10, 6] },
  { id: 'Carousel', name: 'Carousel', cost: 300, fp: [16, 16] },
  { id: 'FerrisWheel', name: 'Ferris Wheel', cost: 500, fp: [28, 8] },
  { id: 'CoasterLoop', name: 'Roller Coaster', cost: 800, fp: [36, 22] },
];
const byId = Object.fromEntries(PIECES.map(p => [p.id, p]));
const SAVE_KEY = 'coffeebreakParkBuilder_v1';

// ---------- state ----------
let state = { coins: CFG.startCoins, unlocked: {}, pieces: [], track: 0, outfit: 0 };
try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s && typeof s === 'object') state = Object.assign(state, s); } catch (e) {}
if (!Array.isArray(state.pieces)) state.pieces = [];
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
const isUnlocked = id => byId[id] && (byId[id].cost <= 0 || state.unlocked[id]);

// ---------- renderer ----------
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) document.body.classList.add('touch');
const renderer = new THREE.WebGLRenderer({ antialias: !isTouch, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !isTouch;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc8e6);
scene.fog = new THREE.Fog(0xffc8e6, 140, 320);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.5, 600);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb080d0, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.4);
sun.position.set(60, 120, 40);
sun.castShadow = !isTouch;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, far: 400 });
scene.add(sun);
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const loader = new THREE.TextureLoader();
const tex = url => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; return t; };
const logoTex = tex('assets/logo.png');
const girlTex = [1, 2, 3, 4, 5].map(i => tex(`assets/girl-${i}.png`));
const matCache = {};
function mat(color, neon) {
  const k = color + (neon ? 'n' : '');
  if (!matCache[k]) matCache[k] = new THREE.MeshStandardMaterial({ color, roughness: 0.55, emissive: neon ? color : 0, emissiveIntensity: neon ? 0.8 : 0 });
  return matCache[k];
}
function textTex(text, bg) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#fff'; g.font = 'bold 64px Trebuchet MS, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 68, 490);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const geoBox = new THREE.BoxGeometry(1, 1, 1);
function box(parent, sx, sy, sz, x, y, z, color, neon) {
  const m = new THREE.Mesh(geoBox, typeof color === 'object' ? color : mat(color, neon));
  m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !isTouch;
  parent.add(m); return m;
}
function cyl(parent, r, h, x, y, z, color, neon, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat(color, neon));
  m.position.set(x, y, z); m.castShadow = !isTouch; parent.add(m); return m;
}
function ball(parent, r, x, y, z, color, neon) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), new THREE.MeshStandardMaterial({ color, emissive: neon ? color : 0, emissiveIntensity: 0.9 }));
  m.position.set(x, y, z); parent.add(m); return m;
}
function between(parent, a, b, w, h, color, neon) {
  const len = Math.max(0.05, a.distanceTo(b));
  const m = box(parent, w, h, len, 0, 0, 0, color, neon);
  m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b.clone().add(parent.position.clone().multiplyScalar(0))); m.lookAt(b);
  return m;
}
function picPanel(parent, w, h, x, y, z, texture) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  m.position.set(x, y, z); m.rotation.y = Math.PI; parent.add(m); return m; // faces -Z (front)
}

// ---------- animated things registry ----------
const anim = { pulse: [], cycle: [], tiles: [], spins: [], coasters: [], uprights: [] };
function unregister(group) {
  for (const k in anim) anim[k] = anim[k].filter(o => { let p = o.obj || o; while (p) { if (p === group) return false; p = p.parent; } return true; });
}

// ---------- piece builders (front faces -Z) ----------
const coasterPoint = t => { const a = t * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 15, 5 + Math.sin(a * 2) * 3, Math.sin(a) * 8); };
function rails(g, a, b) {
  const dir = b.clone().sub(a).normalize();
  const r = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(1.5);
  between(g, a.clone().add(r), b.clone().add(r), 0.4, 0.4, C.HotPink, true);
  between(g, a.clone().sub(r), b.clone().sub(r), 0.4, 0.4, C.HotPink, true);
}
const B = {
  Speaker(g) {
    box(g, 4, 7, 4, 0, 3.5, 0, C.Black);
    const cone = cyl(g, 1.5, 0.4, 0, 4.6, -2.05, C.HotPink, true); cone.rotation.x = Math.PI / 2;
    const tw = cyl(g, 0.6, 0.4, 0, 1.8, -2.05, C.Purple, true); tw.rotation.x = Math.PI / 2;
    box(g, 4.2, 0.4, 4.2, 0, 7.2, 0, C.Pink);
    anim.pulse.push(cone, tw);
  },
  Lights(g) {
    box(g, 0.6, 10, 0.6, 0, 5, 0, C.White);
    anim.cycle.push(ball(g, 1, 0, 10.8, 0, C.HotPink, true));
  },
  Stage(g) {
    box(g, 16, 2, 10, 0, 1, 0, C.Purple);
    box(g, 16, 0.4, 0.4, 0, 2, -5, C.HotPink, true);
    box(g, 16, 10, 1, 0, 7, 4.5, C.Lilac);
    picPanel(g, 9, 9, 0, 7, 3.95, logoTex);
    for (const x of [-7.5, 7.5]) { box(g, 1, 12, 1, x, 6, 4, C.Black); anim.cycle.push(ball(g, 0.8, x, 12.5, 3.5, C.Pink, true)); }
    box(g, 4, 1, 2, 0, 0.5, -6, C.Pink);
  },
  LogoSign(g) {
    box(g, 0.5, 4, 0.5, -3.5, 2, 0, C.White); box(g, 0.5, 4, 0.5, 3.5, 2, 0, C.White);
    box(g, 8, 4, 0.4, 0, 5.5, 0, C.Pink);
    picPanel(g, 4, 4, 0, 5.5, -0.22, logoTex);
  },
  Poster(g, v) {
    box(g, 0.5, 3, 0.5, 0, 1.5, 0.3, C.White);
    box(g, 5, 7, 0.4, 0, 6.5, 0, C.Lilac);
    picPanel(g, 4.6, 6.6, 0, 6.5, -0.22, girlTex[((v || 1) - 1) % 5]);
  },
  DanceFloor(g) {
    box(g, 12.4, 0.3, 12.4, 0, 0.15, 0, C.Black);
    let n = 0;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const t = box(g, 2.8, 0.3, 2.8, (i - 1.5) * 3, 0.4, (j - 1.5) * 3, new THREE.MeshStandardMaterial({ color: C.Pink, emissive: C.Pink, emissiveIntensity: 0.7 }));
      t.userData.n = n++; anim.tiles.push(t);
    }
  },
  TrackStraight(g) {
    rails(g, new THREE.Vector3(0, 2, -6), new THREE.Vector3(0, 2, 6));
    for (let z = -5; z <= 5; z += 2) box(g, 3.6, 0.3, 0.6, 0, 1.7, z, C.Purple);
    for (const z of [-4, 4]) box(g, 0.6, 1.6, 0.6, 0, 0.8, z, C.White);
  },
  TrackRamp(g) {
    const a = new THREE.Vector3(0, 2, -6), b = new THREE.Vector3(0, 7, 6);
    rails(g, a, b);
    for (let k = 0; k < 6; k++) {
      const p = a.clone().lerp(b, (k + 0.5) / 6);
      const t = box(g, 3.6, 0.3, 0.6, p.x, p.y - 0.3, p.z, C.Purple); t.lookAt(b.x, b.y - 0.3, b.z);
      if (k % 2) box(g, 0.6, p.y - 0.3, 0.6, p.x, (p.y - 0.3) / 2, p.z, C.White);
    }
  },
  FoodStall(g) {
    box(g, 10, 3.5, 3, 0, 1.75, -1.5, C.Cream);
    for (const x of [-4.7, 4.7]) for (const z of [-2.7, 2.7]) box(g, 0.5, 7, 0.5, x, 3.5, z, C.White);
    for (let k = 0; k < 5; k++) box(g, 2, 0.4, 7, -4 + k * 2, 7.2, 0, k % 2 ? C.White : C.HotPink);
    box(g, 8, 1.6, 0.3, 0, 8.3, -3.2, C.Purple);
    picPanel(g, 8, 1.6, 0, 8.3, -3.36, textTex('COFFEEBREAK CAFE', '#9646dc'));
    cyl(g, 0.5, 1, -2, 4, -1.5, C.White); cyl(g, 0.45, 0.1, -2, 4.52, -1.5, C.Coffee);
    box(g, 1.4, 0.9, 1.4, 2, 3.95, -1.5, C.Pink);
  },
  Slide(g) {
    box(g, 6, 0.5, 5, 0, 8, 5, C.Purple);
    for (const x of [-2.7, 2.7]) for (const z of [2.8, 7.2]) box(g, 0.5, 8, 0.5, x, 4, z, C.White);
    for (let y = 1; y <= 7; y++) box(g, 3, 0.3, 0.3, 0, y, 7.6, C.Pink);
    const top = new THREE.Vector3(0, 8, 2.5), bot = new THREE.Vector3(0, 0.6, -7.5);
    between(g, top, bot, 4, 0.4, C.HotPink);
    for (const s of [2, -2]) between(g, top.clone().add(new THREE.Vector3(s, 0.6, 0)), bot.clone().add(new THREE.Vector3(s, 0.6, 0)), 0.3, 1, C.Pink);
  },
  Swing(g) {
    for (const x of [-5, 5]) {
      between(g, new THREE.Vector3(x, 0, -2.5), new THREE.Vector3(x, 9, 0), 0.5, 0.5, C.Purple);
      between(g, new THREE.Vector3(x, 0, 2.5), new THREE.Vector3(x, 9, 0), 0.5, 0.5, C.Purple);
    }
    box(g, 10.6, 0.6, 0.6, 0, 9, 0, C.Pink);
    const piv = new THREE.Group(); piv.position.set(0, 9, 0); g.add(piv);
    for (const x of [-2.6, 2.6]) {
      box(piv, 0.15, 6.5, 0.15, x - 1, -3.25, 0, C.White); box(piv, 0.15, 6.5, 0.15, x + 1, -3.25, 0, C.White);
      box(piv, 2.6, 0.4, 1.4, x, -6.6, 0, C.HotPink);
    }
    anim.spins.push({ obj: piv, axis: 'x', speed: 1.6, mode: 'swing', amp: 0.6 });
  },
  Carousel(g) {
    cyl(g, 8, 1, 0, 0.5, 0, C.Purple, false, 32);
    const piv = new THREE.Group(); g.add(piv);
    box(piv, 1.2, 10, 1.2, 0, 6, 0, C.Pink);
    cyl(piv, 7, 0.4, 0, 1.2, 0, C.Lilac, false, 32);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 3, 32), mat(C.HotPink)); roof.position.y = 12.5; piv.add(roof);
    anim.cycle.push(ball(piv, 1.25, 0, 14.4, 0, C.Pink, true));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2, x = Math.cos(a) * 5, z = Math.sin(a) * 5;
      cyl(piv, 0.15, 10, x, 6.4, z, C.White);
      const h = new THREE.Group(); h.position.set(x, 4, z); h.rotation.y = -a; piv.add(h);
      const col = k % 2 ? C.Pink : C.White;
      box(h, 1.2, 1.4, 3, 0, 0, 0, col); box(h, 1, 1.6, 1, 0, 1, -1.6, col);
      for (const lx of [-0.4, 0.4]) for (const lz of [-1.1, 1.1]) box(h, 0.25, 1.4, 0.25, lx, -1.2, lz, col);
      anim.spins.push({ obj: h, axis: 'bob', speed: 2, phase: k, base: 4 });
    }
    anim.spins.push({ obj: piv, axis: 'y', speed: 0.6, mode: 'spin' });
  },
  FerrisWheel(g) {
    const hubY = 14.5, R = 11;
    for (const z of [-2, 2]) {
      between(g, new THREE.Vector3(-6, 0, z * 1.5), new THREE.Vector3(0, hubY, z * 0.7), 0.8, 0.8, C.White);
      between(g, new THREE.Vector3(6, 0, z * 1.5), new THREE.Vector3(0, hubY, z * 0.7), 0.8, 0.8, C.White);
    }
    const piv = new THREE.Group(); piv.position.y = hubY; g.add(piv);
    const hub = cyl(piv, 1.2, 3, 0, 0, 0, C.HotPink, true); hub.rotation.x = Math.PI / 2;
    const N = 16, pts = [];
    for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R, 0)); }
    for (let k = 0; k < N; k++) {
      between(piv, pts[k], pts[(k + 1) % N], 0.6, 0.6, C.Pink, true);
      if (k % 2 === 0) {
        between(piv, new THREE.Vector3(), pts[k], 0.3, 0.3, C.White);
        const cabG = new THREE.Group(); cabG.position.copy(pts[k]); piv.add(cabG);
        box(cabG, 2.4, 2.4, 2.4, 0, -1.6, 0, k % 4 ? C.HotPink : C.Purple);
        box(cabG, 0.2, 1.4, 0.2, 0, -0.2, 0, C.White);
        anim.uprights.push({ obj: cabG, pivot: piv });
      }
    }
    anim.spins.push({ obj: piv, axis: 'z', speed: 0.25, mode: 'spin' });
  },
  CoasterLoop(g) {
    const N = 40;
    for (let k = 0; k < N; k++) {
      const a = coasterPoint(k / N), b = coasterPoint((k + 1) / N);
      rails(g, a, b);
      if (k % 2 === 0) { const t = box(g, 3.6, 0.3, 0.6, a.x, a.y - 0.3, a.z, C.Purple); t.lookAt(b.x, b.y - 0.3, b.z); }
      if (k % 4 === 0) box(g, 0.6, a.y - 0.3, 0.6, a.x, (a.y - 0.3) / 2, a.z, C.White);
    }
    for (let k = 0; k < 3; k++) {
      const cart = new THREE.Group(); g.add(cart);
      box(cart, 3, 1.6, 3.6, 0, 0, 0, k % 2 ? C.Purple : C.HotPink);
      box(cart, 2.4, 0.3, 0.3, 0, 1, -1.7, C.White);
      anim.coasters.push({ obj: cart, offset: -k * 0.035, speed: 0.07 });
    }
    box(g, 6, 2, 4, 15, 1, -4, C.Lilac);
  },
};
function buildPiece(id, variant) {
  const g = new THREE.Group(); B[id](g, variant); g.userData.id = id; return g;
}

// ---------- world: ground, plaza, plot ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ color: 0xb8e6a8 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const plaza = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: C.Pink }));
plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.05; plaza.receiveShadow = true; scene.add(plaza);
const ring = new THREE.Mesh(new THREE.RingGeometry(40, 43, 64), new THREE.MeshStandardMaterial({ color: C.Purple }));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; scene.add(ring);
for (let i = 0; i < 16; i++) { // checker tiles
  const a = i / 16 * Math.PI * 2;
  const t = new THREE.Mesh(new THREE.CircleGeometry(4, 24), new THREE.MeshStandardMaterial({ color: i % 2 ? C.Lilac : C.HotPink }));
  t.rotation.x = -Math.PI / 2; t.position.set(Math.cos(a) * 30, 0.08, Math.sin(a) * 30); scene.add(t);
}
// logo cube
const logoCube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshStandardMaterial({ map: logoTex, color: 0xffffff }));
logoCube.position.set(0, 11, 0); logoCube.castShadow = true; scene.add(logoCube);
cyl(scene, 6, 4, 0, 2, 0, C.Purple, false, 32);
box(scene, 1, 4, 1, 0, 5, 0, C.White);
// 5 character posters
for (let i = 0; i < 5; i++) {
  const a = i / 5 * Math.PI * 2 + 0.94, g = buildPiece('Poster', i + 1);
  g.scale.setScalar(1.6); g.position.set(Math.cos(a) * 34, 0, Math.sin(a) * 34);
  g.rotation.y = Math.atan2(Math.cos(a), Math.sin(a)); // face centre
  scene.add(g);
}
// 10 party lights and speakers
for (let i = 0; i < 10; i++) {
  const a = i / 10 * Math.PI * 2;
  const l = buildPiece('Lights'); l.position.set(Math.cos(a) * 22, 0, Math.sin(a) * 22); scene.add(l);
  const s = buildPiece('Speaker'); const a2 = a + Math.PI / 10;
  s.position.set(Math.cos(a2) * 20, 0, Math.sin(a2) * 20); s.rotation.y = Math.atan2(Math.cos(a2), Math.sin(a2)); scene.add(s);
}
const sign = new THREE.Mesh(new THREE.PlaneGeometry(24, 6), new THREE.MeshBasicMaterial({ map: textTex('COFFEEBREAK PARK', '#ff3caa') }));
sign.position.set(0, 24, 0); scene.add(sign);
// path and plot
const path = new THREE.Mesh(new THREE.PlaneGeometry(10, PLOT.z - 48 - 40), new THREE.MeshStandardMaterial({ color: C.Lilac }));
path.rotation.x = -Math.PI / 2; path.position.set(0, 0.04, (40 + PLOT.z - 48) / 2); scene.add(path);
const plotMesh = new THREE.Mesh(new THREE.PlaneGeometry(CFG.plotSize, CFG.plotSize), new THREE.MeshStandardMaterial({ color: 0xffe0f0 }));
plotMesh.rotation.x = -Math.PI / 2; plotMesh.position.set(PLOT.x, 0.05, PLOT.z); plotMesh.receiveShadow = true; scene.add(plotMesh);
const gridHelper = new THREE.GridHelper(CFG.plotSize, CFG.plotSize / CFG.grid, C.HotPink, C.Lilac);
gridHelper.position.set(PLOT.x, 0.07, PLOT.z); gridHelper.visible = false; scene.add(gridHelper);
const h = CFG.plotSize / 2;
for (const [x, z, w, d] of [[0, -h, CFG.plotSize, 1], [0, h, CFG.plotSize, 1], [-h, 0, 1, CFG.plotSize], [h, 0, 1, CFG.plotSize]]) {
  if (z === -h) { box(scene, (w - 12) / 2, 1, d, PLOT.x - w / 4 - 3, 0.5, PLOT.z + z, C.Purple); box(scene, (w - 12) / 2, 1, d, PLOT.x + w / 4 + 3, 0.5, PLOT.z + z, C.Purple); }
  else box(scene, w, 1, d, PLOT.x + x, 0.5, PLOT.z + z, C.Purple);
}
const plotSign = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), new THREE.MeshBasicMaterial({ map: textTex('MY PARK', '#9646dc') }));
plotSign.position.set(PLOT.x, 16, PLOT.z - h); plotSign.rotation.y = Math.PI; scene.add(plotSign);
box(scene, 0.6, 14, 0.6, PLOT.x - 7.5, 7, PLOT.z - h, C.White); box(scene, 0.6, 14, 0.6, PLOT.x + 7.5, 7, PLOT.z - h, C.White);
// decorative clouds and trees
for (let i = 0; i < 30; i++) {
  const a = Math.random() * Math.PI * 2, r = 200 + Math.random() * 60;
  const t = new THREE.Group(); t.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); scene.add(t);
  box(t, 2, 8, 2, 0, 4, 0, C.Coffee); box(t, 8, 8, 8, 0, 11, 0, i % 2 ? 0xffb0d8 : 0xd7b4f5);
}

// ---------- placed pieces ----------
const placed = []; // {data, group}
function footprint(id, r) { const f = byId[id].fp; return r % 2 ? [f[1], f[0]] : [f[0], f[1]]; }
function addPlaced(d) {
  const g = buildPiece(d.id, d.v);
  g.position.set(PLOT.x + d.x, 0, PLOT.z + d.z); g.rotation.y = -d.r * Math.PI / 2;
  scene.add(g); placed.push({ data: d, group: g });
}
state.pieces.filter(d => byId[d.id]).forEach(addPlaced);

// ---------- avatar ----------
function makeAvatar(top, bottom, extra, skin = 0xffd9b8) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const parts = {};
  parts.torso = box(body, 2, 2, 1, 0, 3, 0, top);
  parts.head = box(body, 1.25, 1.25, 1.25, 0, 4.65, 0, skin);
  const face = new THREE.Group(); face.position.set(0, 4.75, -0.63); body.add(face);
  box(face, 0.2, 0.25, 0.02, -0.28, 0, 0, 0x222222); box(face, 0.2, 0.25, 0.02, 0.28, 0, 0, 0x222222);
  box(face, 0.5, 0.08, 0.02, 0, -0.35, 0, C.HotPink);
  box(body, 1.35, 0.35, 1.35, 0, 5.35, 0.05, C.Coffee); // hair
  const mkLimb = (x, y, color) => { const p = new THREE.Group(); p.position.set(x, y, 0); body.add(p); box(p, 1, 2, 1, 0, -1, 0, color); return p; };
  parts.la = mkLimb(-1.5, 4, top); parts.ra = mkLimb(1.5, 4, top);
  parts.ll = mkLimb(-0.5, 2, bottom); parts.rl = mkLimb(0.5, 2, bottom);
  parts.extra = new THREE.Group(); body.add(parts.extra);
  root.userData = { parts, body };
  setExtra(root, extra);
  return root;
}
function setExtra(av, extra) {
  const e = av.userData.parts.extra; while (e.children.length) e.remove(e.children[0]);
  if (extra === 'Bow') { box(e, 0.7, 0.6, 0.3, -0.45, 5.6, 0, C.HotPink); box(e, 0.7, 0.6, 0.3, 0.45, 5.6, 0, C.HotPink); box(e, 0.3, 0.3, 0.35, 0, 5.6, 0, C.Pink); }
  if (extra === 'Headphones') { box(e, 0.3, 0.8, 0.8, -0.75, 4.65, 0, C.HotPink); box(e, 0.3, 0.8, 0.8, 0.75, 4.65, 0, C.HotPink); box(e, 1.8, 0.2, 0.3, 0, 5.6, 0, C.Black); }
  if (extra === 'Crown') { box(e, 1.2, 0.35, 1.2, 0, 5.7, 0, 0xffd34d); for (const x of [-0.45, 0, 0.45]) box(e, 0.25, 0.4, 0.25, x, 6.05, -0.5, 0xffd34d); }
  if (extra === 'Cup') { const c = cyl(e, 0.3, 0.6, 1.5, 1.8, -0.4, C.White); c.parent.remove(c); av.userData.parts.ra.add(c); c.position.set(0, -2.1, -0.3); e.userData.cup = c; }
}
function setOutfit(av, o) {
  const p = av.userData.parts;
  for (const k of ['torso', 'la', 'ra']) { const m = k === 'torso' ? p[k] : p[k].children[0]; m.material = mat(o.top); }
  for (const k of ['ll', 'rl']) p[k].children[0].material = mat(o.bottom);
  // remove old cup if any
  p.ra.children.slice(1).forEach(c => p.ra.remove(c));
  setExtra(av, o.extra);
}
const player = makeAvatar(OUTFITS[0].top, OUTFITS[0].bottom, OUTFITS[0].extra);
setOutfit(player, OUTFITS[state.outfit % 4]);
player.position.set(0, 0, 46); player.rotation.y = 0;
scene.add(player);
function animateWalk(av, speed, t) {
  const p = av.userData.parts, s = Math.sin(t * 10) * Math.min(1, speed / 8) * 0.8;
  p.la.rotation.x = s; p.ra.rotation.x = -s; p.ll.rotation.x = -s; p.rl.rotation.x = s;
}

// ---------- NPC visitors ----------
const npcNames = ['Mia', 'Zoe', 'Leo', 'Ava', 'Kai', 'Ruby', 'Max', 'Lily'];
const npcs = [];
for (let i = 0; i < 8; i++) {
  const o = OUTFITS[i % 4];
  const av = makeAvatar(i % 2 ? o.bottom : o.top, i % 2 ? o.top : o.bottom, o.extra, [0xffd9b8, 0xc68e64, 0x8d5a3b, 0xf1c8a5][i % 4]);
  av.position.set(Math.cos(i) * 25, 0, Math.sin(i) * 25);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex(npcNames[i], '#9646dc'), depthTest: true }));
  tag.scale.set(4, 1, 1); tag.position.y = 7; av.add(tag);
  scene.add(av);
  npcs.push({ av, target: new THREE.Vector3(), wait: Math.random() * 3, inPark: false, name: npcNames[i] });
}
function pickTarget(n) {
  const goPark = placed.length > 0 && Math.random() < 0.65;
  if (goPark) {
    const p = placed[Math.floor(Math.random() * placed.length)].group.position;
    n.target.set(p.x + (Math.random() - 0.5) * 14, 0, p.z - 6 - Math.random() * 6);
    n.target.x = Math.max(PLOT.x - h + 3, Math.min(PLOT.x + h - 3, n.target.x));
    n.target.z = Math.max(PLOT.z - h + 3, Math.min(PLOT.z + h - 3, n.target.z));
  } else { const a = Math.random() * Math.PI * 2, r = 12 + Math.random() * 24; n.target.set(Math.cos(a) * r, 0, Math.sin(a) * r); }
}
npcs.forEach(pickTarget);
const insidePlot = p => Math.abs(p.x - PLOT.x) < h && Math.abs(p.z - PLOT.z) < h;
function stepNpc(n, dt, t) {
  const p = n.av.position;
  if (n.wait > 0) { n.wait -= dt; animateWalk(n.av, 0, t); n.av.userData.body.position.y = Math.abs(Math.sin(t * 6)) * 0.3 * (Math.sin(t) > 0 ? 1 : 0); return; }
  const d = n.target.clone().sub(p); d.y = 0;
  const dist = d.length();
  // route through plot gate: if going between plaza and plot, head for gate first
  const gate = new THREE.Vector3(PLOT.x, 0, PLOT.z - h);
  let dir = d;
  if (insidePlot(n.target) !== insidePlot(p) && Math.abs(p.x - gate.x) > 4 && Math.abs(p.z - gate.z) < 6) dir = gate.clone().sub(p);
  else if (insidePlot(n.target) !== insidePlot(p) && Math.abs(p.z - gate.z) >= 6 && Math.abs(p.x - gate.x) > 4) dir = new THREE.Vector3(gate.x - p.x, 0, gate.z - p.z);
  if (dist < 1) { n.wait = 2 + Math.random() * 5; pickTarget(n); return; }
  dir.y = 0; dir.normalize();
  p.addScaledVector(dir, 7 * dt);
  n.av.rotation.y = Math.atan2(-dir.x, -dir.z);
  animateWalk(n.av, 7, t + n.name.length);
  n.av.userData.body.position.y = 0;
  const now = insidePlot(p);
  if (now && !n.inPark) toast(`${n.name} is visiting your park`);
  n.inPark = now;
}

// ---------- audio ----------
let audio = null, analyser = null, actx = null, level = 0, fdata = null;
function playTrack(i) {
  state.track = i; save();
  try {
    if (!audio) {
      audio = new Audio(); audio.loop = true; audio.crossOrigin = 'anonymous';
      actx = new (window.AudioContext || window.webkitAudioContext)();
      const src = actx.createMediaElementSource(audio); analyser = actx.createAnalyser(); analyser.fftSize = 256;
      src.connect(analyser); analyser.connect(actx.destination); fdata = new Uint8Array(analyser.frequencyBinCount);
    }
    if (actx.state === 'suspended') actx.resume();
    audio.src = TRACKS[i].file; audio.play().catch(() => {});
    $('now').style.display = ''; $('now').textContent = 'Playing ' + TRACKS[i].name;
  } catch (e) {}
}
function stopMusic() { if (audio) audio.pause(); $('now').style.display = 'none'; state.track = -1; save(); }

// ---------- UI ----------
const $ = id => document.getElementById(id);
let toastT;
function toast(s) { const m = $('msg'); m.textContent = s; m.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => m.style.opacity = 0, 2200); }
function updateCoins() { $('coins').textContent = state.coins + ' coins'; }
updateCoins();
function closePanels() { document.querySelectorAll('.panel').forEach(p => p.classList.remove('show')); }
let buildMode = false, selected = null, ghost = null, rot = 0, variant = 1;
const ghostPos = new THREE.Vector3(PLOT.x, 0, PLOT.z);
function renderPieces() {
  const el = $('pieces'); el.innerHTML = '<h3>Pick a piece</h3>';
  PIECES.forEach(p => {
    const b = document.createElement('button'); b.className = 'piece' + (selected === p.id ? ' sel' : '');
    b.innerHTML = p.name + '<small>' + (isUnlocked(p.id) ? (p.cost ? 'Unlocked' : 'Free') : 'Unlock for ' + p.cost + ' coins') + '</small>';
    b.onclick = () => {
      if (!isUnlocked(p.id)) {
        if (state.coins < p.cost) return toast('Need ' + p.cost + ' coins');
        state.coins -= p.cost; state.unlocked[p.id] = true; updateCoins(); save(); toast(p.name + ' unlocked');
      }
      selectPiece(p.id); closePanels();
    };
    el.appendChild(b);
  });
}
function setMode() { $('mode').textContent = buildMode ? (selected ? 'Building ' + byId[selected].name : 'Build mode') : 'Exploring'; gridHelper.visible = buildMode; }
function selectPiece(id) {
  selected = id; if (id === 'Poster') variant = variant % 5 + 1;
  if (ghost) { unregister(ghost); scene.remove(ghost); }
  ghost = buildPiece(id, variant);
  ghost.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.55; } });
  scene.add(ghost);
  if (!insidePlot(ghostPos)) ghostPos.set(PLOT.x, 0, PLOT.z);
  buildMode = true; setMode();
  if (!insidePlot(player.position)) goPark();
  placeGhostInFront();
}
function snapGhost() {
  if (!ghost) return;
  const [w, d] = footprint(selected, rot), g = CFG.grid;
  let x = Math.round((ghostPos.x - PLOT.x - (w / 2) % g) / g) * g + (w / 2) % g;
  let z = Math.round((ghostPos.z - PLOT.z - (d / 2) % g) / g) * g + (d / 2) % g;
  x = Math.max(-h + w / 2, Math.min(h - w / 2, x)); z = Math.max(-h + d / 2, Math.min(h - d / 2, z));
  ghost.userData.lx = x; ghost.userData.lz = z;
  ghost.position.set(PLOT.x + x, 0, PLOT.z + z); ghost.rotation.y = -rot * Math.PI / 2;
  const ok = !overlaps(selected, x, z, rot);
  ghost.traverse(o => { if (o.isMesh) o.material.emissive && o.material.emissive.setHex(ok ? o.material.color.getHex() & 0 : 0xff0000); });
}
function overlaps(id, x, z, r, ignore) {
  const [w, d] = footprint(id, r);
  return placed.some(p => { if (p === ignore) return false; const [w2, d2] = footprint(p.data.id, p.data.r); return Math.abs(p.data.x - x) * 2 < w + w2 - 0.01 && Math.abs(p.data.z - z) * 2 < d + d2 - 0.01; });
}
function placeGhostInFront() {
  const f = new THREE.Vector3(-Math.sin(player.rotation.y), 0, -Math.cos(player.rotation.y));
  ghostPos.copy(player.position).addScaledVector(f, 14); snapGhost();
}
function place() {
  if (!buildMode || !selected) return toast('Press Build and pick a piece first');
  const x = ghost.userData.lx, z = ghost.userData.lz;
  if (placed.length >= CFG.maxPieces) return toast('Your park is full');
  if (overlaps(selected, x, z, rot)) return toast('Something is already there');
  const d = { id: selected, x, z, r: rot, v: variant };
  state.pieces.push(d); addPlaced(d); save(); toast(byId[selected].name + ' placed');
  if (selected === 'Poster') selectPiece('Poster');
}
function del() {
  const ref = buildMode && ghost ? ghost.position : player.position;
  let best = null, bd = 16;
  for (const p of placed) { const dd = p.group.position.distanceTo(ref); if (dd < bd) { bd = dd; best = p; } }
  if (!best) return toast('Stand next to a piece in your park to delete it');
  unregister(best.group); scene.remove(best.group);
  placed.splice(placed.indexOf(best), 1); state.pieces.splice(state.pieces.indexOf(best.data), 1); save();
  toast(byId[best.data.id].name + ' removed');
}
function goPark() { player.position.set(PLOT.x, 0, PLOT.z - h + 6); player.rotation.y = Math.PI; camYaw = Math.PI; vel.set(0, 0, 0); }
function done() { buildMode = false; selected = null; if (ghost) { unregister(ghost); scene.remove(ghost); ghost = null; } closePanels(); setMode(); }
function toggle(id, fill) { const el = $(id), was = el.classList.contains('show'); closePanels(); if (!was) { fill(); el.classList.add('show'); } }
$('bBuild').onclick = () => { buildMode = true; setMode(); toggle('pieces', renderPieces); };
$('bRotate').onclick = () => { rot = (rot + 1) % 4; snapGhost(); };
$('bPlace').onclick = place;
$('bDelete').onclick = del;
$('bMusic').onclick = () => toggle('music', () => {
  const el = $('music'); el.innerHTML = '<h3>Coffeebreak music</h3>';
  TRACKS.forEach((t, i) => { const b = document.createElement('button'); b.textContent = t.name; b.onclick = () => { playTrack(i); closePanels(); }; el.appendChild(b); });
  const s = document.createElement('button'); s.className = 'alt'; s.textContent = 'Stop'; s.onclick = () => { stopMusic(); closePanels(); }; el.appendChild(s);
});
$('bOutfit').onclick = () => toggle('outfits', () => {
  const el = $('outfits'); el.innerHTML = '<h3>Outfits</h3>';
  OUTFITS.forEach((o, i) => { const b = document.createElement('button'); b.textContent = o.name; b.style.background = '#' + o.top.toString(16).padStart(6, '0'); b.style.color = i === 3 || i === 2 ? '#784b32' : '#fff'; b.onclick = () => { state.outfit = i; setOutfit(player, o); save(); closePanels(); toast(o.name + ' on'); }; el.appendChild(b); });
});
$('bPark').onclick = () => { closePanels(); goPark(); toast('Welcome to your park'); };
$('bDone').onclick = done;
$('play').onclick = () => { $('start').style.display = 'none'; if (state.track >= 0) playTrack(state.track); };

// ---------- input ----------
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'KeyR') { rot = (rot + 1) % 4; snapGhost(); }
  if (e.code === 'Enter') place();
  if (e.code === 'Delete' || e.code === 'Backspace') del();
  if (e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', e => keys[e.code] = false);
let camYaw = 0, camPitch = 0.45, camDist = 22;
const joy = { x: 0, y: 0, id: null };
let drag = null;
const ray = new THREE.Raycaster();
renderer.domElement.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY }; });
addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  camYaw -= (e.clientX - drag.x) * 0.006; camPitch = Math.max(0.05, Math.min(1.2, camPitch + (e.clientY - drag.y) * 0.004));
  drag.x = e.clientX; drag.y = e.clientY;
});
addEventListener('pointerup', e => {
  if (!drag || drag.id !== e.pointerId) return;
  if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6 && buildMode && ghost) {
    ray.setFromCamera(new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
    const hit = ray.intersectObject(plotMesh)[0];
    if (hit) { ghostPos.copy(hit.point); snapGhost(); }
  }
  drag = null;
});
renderer.domElement.addEventListener('wheel', e => { camDist = Math.max(8, Math.min(60, camDist + e.deltaY * 0.03)); }, { passive: true });
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
let jumpQueued = false;
$('jump').addEventListener('pointerdown', e => { e.preventDefault(); jumpQueued = true; });

// ---------- coins tick ----------
setInterval(() => {
  const visitors = npcs.filter(n => n.inPark).length;
  const gain = CFG.coinsPerTick + visitors * CFG.visitorBonus;
  state.coins += gain; updateCoins(); save();
  toast(visitors ? `+${gain} coins (${visitors} visitors in your park)` : `+${gain} coins`);
}, CFG.tickSeconds * 1000);
addEventListener('beforeunload', save);

// ---------- loop ----------
const vel = new THREE.Vector3(); let onGround = true;
const clock = new THREE.Clock(); let T = 0;
const tmpQ = new THREE.Quaternion();
function frame() {
  const dt = Math.min(0.05, clock.getDelta()); T += dt;
  // music level
  if (analyser && audio && !audio.paused) { analyser.getByteFrequencyData(fdata); let s = 0; for (let i = 0; i < 24; i++) s += fdata[i]; level = level * 0.6 + (s / 24 / 255) * 0.4; }
  else level = level * 0.9 + (0.25 + 0.15 * Math.sin(T * 8)) * 0.1;
  // player movement
  let mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
  const sp = (keys.ShiftLeft ? 26 : 16);
  const fwd = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
  const move = fwd.multiplyScalar(-mz).add(right.multiplyScalar(mx));
  player.position.addScaledVector(move, sp * dt);
  if (move.lengthSq() > 0.01) { const target = Math.atan2(-move.x, -move.z); let d = target - player.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); player.rotation.y += d * Math.min(1, dt * 12); }
  if ((keys.Space || jumpQueued) && onGround) { vel.y = 18; onGround = false; }
  jumpQueued = false;
  vel.y -= 50 * dt; player.position.y += vel.y * dt;
  if (player.position.y <= 0) { player.position.y = 0; vel.y = 0; onGround = true; }
  player.position.x = Math.max(-280, Math.min(280, player.position.x)); player.position.z = Math.max(-280, Math.min(280, player.position.z));
  animateWalk(player, onGround ? ml * sp : 0, T);
  if (!onGround) { const p = player.userData.parts; p.la.rotation.x = p.ra.rotation.x = -2.6; }
  // camera
  const target = player.position.clone().add(new THREE.Vector3(0, 4, 0));
  camera.position.set(target.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist, target.y + Math.sin(camPitch) * camDist, target.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist);
  camera.lookAt(target);
  // plaza
  logoCube.rotation.y += dt * 0.5; logoCube.position.y = 11 + Math.sin(T * 1.5) * 0.6;
  sign.lookAt(camera.position.x, sign.position.y, camera.position.z);
  // animations
  const s = 1 + level * 0.6;
  for (const m of anim.pulse) m.scale.set(s, 1, s);
  const hue = (T * 0.15) % 1;
  anim.cycle.forEach((m, i) => { m.material.color.setHSL((hue + i * 0.07) % 1, 0.9, 0.6); m.material.emissive.copy(m.material.color); });
  for (const t of anim.tiles) { const on = (Math.floor(T * 4) + t.userData.n * 7) % 3 === 0; t.material.emissive.setHSL(on ? (hue + t.userData.n / 16) % 1 : 0.9, 0.9, on ? 0.55 : 0.2 + level * 0.3); }
  for (const sp2 of anim.spins) {
    if (sp2.axis === 'bob') { sp2.obj.position.y = sp2.base + Math.sin(T * sp2.speed + sp2.phase) * 0.8; continue; }
    if (sp2.mode === 'swing') sp2.obj.rotation[sp2.axis] = Math.sin(T * sp2.speed) * sp2.amp;
    else sp2.obj.rotation[sp2.axis] += sp2.speed * dt;
  }
  for (const u of anim.uprights) u.obj.rotation.z = -u.pivot.rotation.z;
  for (const c of anim.coasters) {
    const t = ((T * c.speed + c.offset) % 1 + 1) % 1;
    const a = coasterPoint(t), b = coasterPoint((t + 0.01) % 1);
    c.obj.position.set(a.x, a.y + 1.2, a.z); c.obj.lookAt(b.x, b.y + 1.2, b.z);
  }
  for (const n of npcs) stepNpc(n, dt, T);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
setMode();
frame();
window.__setGhost = (x, z) => { ghostPos.set(PLOT.x + x, 0, PLOT.z + z); snapGhost(); };
window.__game = { state, placed, npcs, place, selectPiece, goPark };
