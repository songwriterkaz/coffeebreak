import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/* =========================================================
   SIM-MOM 3D: robotic birthing manikin renderer
   Reads state from the shared clinical engine (window.MidwifeSim)
   ========================================================= */
const S = 0.004;
const CA = {x:215, y:290}, CC = {x:232, y:350}, CB = {x:172, y:398};
function canal(s){
  if (s < 0) return {x: CA.x + s * 2 * (CC.x - CA.x), y: CA.y + s * 2 * (CC.y - CA.y)};
  if (s > 1){ const t = s - 1; return {x: CB.x + t * 2 * (CB.x - CC.x), y: CB.y + t * 2 * (CB.y - CC.y)}; }
  const u = 1 - s; return {x: u*u*CA.x + 2*u*s*CC.x + s*s*CB.x, y: u*u*CA.y + 2*u*s*CC.y + s*s*CB.y};
}
const m2 = (x, y, z = 0) => new THREE.Vector3((y - 290) * S, (215 - x) * S, z);       // 2D sagittal -> G-local
const v2 = (dx, dy) => new THREE.Vector3(dy, -dx, 0).normalize();                      // 2D vector -> G-local dir
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

let renderer, scene, camera, controls, G, lastT = performance.now(), elapsed = 0;
const M = {};          // materials
const R = {};          // references
const hotspots = [];
let hovered = null;

function mats(){
  M.white = new THREE.MeshStandardMaterial({color:0xeef2f6, roughness:0.32, metalness:0.08});
  M.panel = new THREE.MeshStandardMaterial({color:0xdfe5ec, roughness:0.4, metalness:0.1});
  M.grey  = new THREE.MeshStandardMaterial({color:0x7d8a99, roughness:0.35, metalness:0.6});
  M.dark  = new THREE.MeshStandardMaterial({color:0x0c1520, roughness:0.15, metalness:0.7});
  M.seam  = new THREE.MeshStandardMaterial({color:0x4a5563, roughness:0.6, metalness:0.3});
  M.led   = new THREE.MeshStandardMaterial({color:0x0b3b3a, emissive:0x19e3d0, emissiveIntensity:1.2, roughness:0.3});
  M.ledBaby = new THREE.MeshStandardMaterial({color:0x0b3b3a, emissive:0x19e3d0, emissiveIntensity:1.5});
  M.ledChest = new THREE.MeshStandardMaterial({color:0x0b3b3a, emissive:0x19e3d0, emissiveIntensity:1.5});
  M.amber = new THREE.MeshStandardMaterial({color:0x3b2a0b, emissive:0xffb020, emissiveIntensity:1.2});
  M.green = new THREE.MeshStandardMaterial({color:0x0b3b1a, emissive:0x3dff8a, emissiveIntensity:1.2});
  M.shell = new THREE.MeshPhysicalMaterial({color:0xe6f4ff, roughness:0.08, metalness:0, transparent:true, opacity:0.16, depthWrite:false, side:THREE.DoubleSide, clearcoat:1});
  M.pelvisShell = new THREE.MeshPhysicalMaterial({color:0xe6f4ff, roughness:0.1, transparent:true, opacity:0.14, depthWrite:false, side:THREE.DoubleSide});
  M.uterus = new THREE.MeshStandardMaterial({color:0xff8fa6, emissive:0x40101a, roughness:0.4, transparent:true, opacity:0.22, depthWrite:false, side:THREE.DoubleSide});
  M.canal = new THREE.MeshStandardMaterial({color:0xff9fb4, transparent:true, opacity:0.16, depthWrite:false, side:THREE.DoubleSide});
  M.bone  = new THREE.MeshStandardMaterial({color:0xeadfc8, roughness:0.6, transparent:true, opacity:0.55, depthWrite:false});
  M.placenta = new THREE.MeshStandardMaterial({color:0xb5506a, roughness:0.5, emissive:0x200008});
  M.cord = new THREE.MeshStandardMaterial({color:0xb8c8ea, roughness:0.35, emissive:0x101828});
  M.clamp = new THREE.MeshStandardMaterial({color:0x2e9bd6, roughness:0.3, metalness:0.2});
  M.hot = new THREE.MeshBasicMaterial({color:0x19e3d0, transparent:true, opacity:0, depthWrite:false});
  M.ring = new THREE.MeshBasicMaterial({color:0x19e3d0, transparent:true, opacity:0.8, depthWrite:false});
  M.towel = new THREE.MeshStandardMaterial({color:0xd9e9f6, roughness:0.9, side:THREE.DoubleSide});
  M.hat = new THREE.MeshStandardMaterial({color:0x9fd8e0, roughness:0.85});
  M.tape = new THREE.MeshBasicMaterial({color:0xffc94a});
}
function mesh(geo, mat, parent, pos, rot){ const m = new THREE.Mesh(geo, mat); if (pos) m.position.copy(pos); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); m.castShadow = true; m.receiveShadow = true; (parent || scene).add(m); return m; }
function limb(a, b, r, mat, parent){
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r * 0.4), 6, 16), mat, parent);
  m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
}
function joint(p, r, parent, led){ const j = mesh(new THREE.SphereGeometry(r, 24, 16), M.grey, parent, p); if (led){ const t = mesh(new THREE.TorusGeometry(r * 1.02, r * 0.08, 8, 32), M.led, parent, p); t.rotation.y = Math.PI / 2; R.leds.push(t); } return j; }
function seamRing(p, r, axis, parent){ const t = mesh(new THREE.TorusGeometry(r, 0.008, 6, 48), M.seam, parent, p); if (axis === 'x') t.rotation.y = Math.PI / 2; else if (axis === 'y') t.rotation.x = Math.PI / 2; return t; }

/* ---------- room ---------- */
function buildRoom(){
  scene.background = new THREE.Color(0x0e1722);
  scene.fog = new THREE.Fog(0x0e1722, 9, 22);
  const floor = mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({color:0x17222e, roughness:0.85}), scene, null, [-Math.PI / 2, 0, 0]);
  floor.castShadow = false;
  const grid = new THREE.GridHelper(30, 60, 0x1f5a62, 0x1a2a38); grid.position.y = 0.002; grid.material.opacity = 0.35; grid.material.transparent = true; scene.add(grid);
  const wallM = new THREE.MeshStandardMaterial({color:0x1b2836, roughness:0.9});
  const back = mesh(new THREE.PlaneGeometry(30, 6), wallM, scene, new THREE.Vector3(0, 3, -3.6)); back.castShadow = false;
  const side = mesh(new THREE.PlaneGeometry(30, 6), wallM, scene, new THREE.Vector3(-5.2, 3, 0), [0, Math.PI / 2, 0]); side.castShadow = false;
  const panelM = new THREE.MeshStandardMaterial({color:0x223345, roughness:0.7, metalness:0.2});
  for (let i = -4; i <= 4; i++){ const p = mesh(new THREE.BoxGeometry(1.5, 2.2, 0.04), panelM, scene, new THREE.Vector3(i * 1.65, 1.7, -3.57)); p.castShadow = false; }
  const strip = mesh(new THREE.BoxGeometry(16, 0.03, 0.02), M.led, scene, new THREE.Vector3(0, 2.95, -3.55)); strip.castShadow = false;
  const strip2 = mesh(new THREE.BoxGeometry(0.02, 0.03, 16), M.led, scene, new THREE.Vector3(-5.17, 2.95, 0)); strip2.castShadow = false;
  // sign
  const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d');
  g.fillStyle = '#0c1824'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#19e3d0'; g.font = '700 40px system-ui, sans-serif'; g.fillText('SIMULATION LAB 3', 24, 62); g.fillStyle = '#5c7a91'; g.font = '20px system-ui'; g.fillText('BIRTH SUITE', 380, 62);
  const sign = mesh(new THREE.PlaneGeometry(2.4, 0.45), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}), scene, new THREE.Vector3(1.2, 3.35, -3.55)); sign.castShadow = false;

  // bed
  const bedM = new THREE.MeshStandardMaterial({color:0xcfd6de, roughness:0.4, metalness:0.3});
  mesh(new RoundedBoxGeometry(4.9, 0.18, 1.75, 4, 0.06), bedM, scene, new THREE.Vector3(-0.3, 0.6, 0));
  mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), M.grey, scene, new THREE.Vector3(-0.3, 0.3, 0));
  mesh(new THREE.BoxGeometry(3.6, 0.08, 0.12), M.grey, scene, new THREE.Vector3(-0.3, 0.12, 0));
  for (const x of [-2.2, 1.6]) for (const z of [-0.7, 0.7]){ mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), M.dark, scene, new THREE.Vector3(x, 0.07, z), [Math.PI / 2, 0, 0]); mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 10), M.grey, scene, new THREE.Vector3(x, 0.35, z)); }
  mesh(new RoundedBoxGeometry(4.7, 0.22, 1.55, 4, 0.08), new THREE.MeshStandardMaterial({color:0x34495c, roughness:0.8}), scene, new THREE.Vector3(-0.3, 0.8, 0));
  mesh(new RoundedBoxGeometry(0.7, 0.16, 0.9, 4, 0.07), new THREE.MeshStandardMaterial({color:0xdde6ee, roughness:0.9}), scene, new THREE.Vector3(-2.15, 0.98, 0));
  for (const z of [-0.86, 0.86]){ mesh(new THREE.BoxGeometry(1.8, 0.05, 0.04), bedM, scene, new THREE.Vector3(-1.4, 1.15, z)); mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), bedM, scene, new THREE.Vector3(-2.2, 1.0, z)); mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), bedM, scene, new THREE.Vector3(-0.6, 1.0, z)); }
  // trolley with Doppler
  mesh(new RoundedBoxGeometry(0.9, 0.06, 0.6, 3, 0.02), bedM, scene, new THREE.Vector3(2.5, 0.95, -1.4));
  mesh(new RoundedBoxGeometry(0.9, 0.06, 0.6, 3, 0.02), bedM, scene, new THREE.Vector3(2.5, 0.4, -1.4));
  for (const x of [2.1, 2.9]) for (const z of [-1.65, -1.15]) mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 8), M.grey, scene, new THREE.Vector3(x, 0.47, z));
  // monitor stand
  const ms = new THREE.Group(); ms.position.set(-2.2, 0, -1.55); ms.rotation.y = 0.45; scene.add(ms);
  mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.06, 32), M.grey, ms, new THREE.Vector3(0, 0.03, 0));
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 12), M.grey, ms, new THREE.Vector3(0, 1.0, 0));
  mesh(new RoundedBoxGeometry(1.25, 0.82, 0.08, 3, 0.03), M.dark, ms, new THREE.Vector3(0, 2.15, 0));
  R.monCanvas = document.createElement('canvas'); R.monCanvas.width = 640; R.monCanvas.height = 400;
  R.monTex = new THREE.CanvasTexture(R.monCanvas); R.monTex.colorSpace = THREE.SRGBColorSpace;
  const scr = mesh(new THREE.PlaneGeometry(1.15, 0.72), new THREE.MeshBasicMaterial({map:R.monTex, toneMapped:false}), ms, new THREE.Vector3(0, 2.15, 0.045)); scr.castShadow = false;
  mesh(new THREE.BoxGeometry(1.0, 0.02, 0.02), M.led, ms, new THREE.Vector3(0, 1.72, 0.04));
}

/* ---------- robot mother ---------- */
function buildMother(){
  G = new THREE.Group(); G.position.set(0.8, 1.62, 0); scene.add(G);
  R.leds = [];
  // head + visor
  const head = new THREE.Group(); head.position.set(-2.95, -0.36, 0); G.add(head);
  mesh(new THREE.SphereGeometry(0.27, 40, 28), M.white, head);
  const visor = mesh(new THREE.SphereGeometry(0.275, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), M.dark, head); visor.rotation.z = -0.25;
  for (const z of [-0.08, 0.08]){ const e = mesh(new THREE.CapsuleGeometry(0.018, 0.05, 4, 8), M.led, head, new THREE.Vector3(-0.02, 0.27, z)); e.rotation.z = Math.PI / 2; R.leds.push(e); }
  for (const z of [-0.275, 0.275]){ mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 28), M.grey, head, new THREE.Vector3(0, 0, z), [Math.PI / 2, 0, 0]); const t = mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 32), M.led, head, new THREE.Vector3(0, 0, z * 1.04)); R.leds.push(t); }
  seamRing(new THREE.Vector3(0, 0, 0), 0.272, 'x', head);
  limb(new THREE.Vector3(-2.75, -0.38, 0), new THREE.Vector3(-2.45, -0.3, 0), 0.1, M.grey, G);
  // chest module
  const chest = mesh(new THREE.CapsuleGeometry(0.42, 0.55, 8, 32), M.white, G, new THREE.Vector3(-1.85, -0.28, 0)); chest.rotation.z = Math.PI / 2; chest.scale.set(1, 1, 1.3);
  seamRing(new THREE.Vector3(-1.62, -0.28, 0), 0.425, 'x', G).scale.set(1, 1, 1.3);
  seamRing(new THREE.Vector3(-2.1, -0.28, 0), 0.425, 'x', G).scale.set(1, 1, 1.3);
  const plate = mesh(new RoundedBoxGeometry(0.55, 0.06, 0.5, 3, 0.025), M.panel, G, new THREE.Vector3(-1.85, 0.135, 0));
  const lc = document.createElement('canvas'); lc.width = 256; lc.height = 96; const lg = lc.getContext('2d'); lg.fillStyle = '#dfe5ec'; lg.fillRect(0, 0, 256, 96); lg.fillStyle = '#41505f'; lg.font = '800 44px system-ui'; lg.fillText('SIM-MOM', 20, 58); lg.font = '600 18px system-ui'; lg.fillText('UNIT 01 · OBSTETRIC', 22, 84);
  const lab = mesh(new THREE.PlaneGeometry(0.34, 0.13), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(lc)}), G, new THREE.Vector3(-1.93, 0.17, 0.03), [-Math.PI / 2, 0, Math.PI / 2]); lab.castShadow = false;
  R.status = [M.green, M.led, M.amber].map((m, i) => mesh(new THREE.SphereGeometry(0.022, 12, 10), m.clone(), G, new THREE.Vector3(-1.7, 0.17, -0.14 + i * 0.07)));
  for (const z of [-0.5, 0.5]){ const s = mesh(new THREE.BoxGeometry(0.62, 0.02, 0.02), M.led, G, new THREE.Vector3(-1.85, -0.1, z)); R.leds.push(s); }
  // shoulders & arms
  for (const sgn of [-1, 1]){
    const sh = new THREE.Vector3(-2.2, -0.32, sgn * 0.6), el = new THREE.Vector3(-1.5, -0.5, sgn * 0.8), wr = new THREE.Vector3(-0.85, -0.56, sgn * 0.82);
    joint(sh, 0.15, G, true); limb(sh, el, 0.1, M.white, G); joint(el, 0.1, G, true); limb(el, wr, 0.085, M.white, G);
    mesh(new THREE.SphereGeometry(0.09, 20, 14), M.panel, G, wr).scale.set(1.3, 0.7, 1);
  }
  // waist ring
  mesh(new THREE.TorusGeometry(0.4, 0.04, 12, 48), M.grey, G, new THREE.Vector3(-1.32, -0.3, 0), [0, Math.PI / 2, 0]).scale.set(1, 1, 1);
  const wl = mesh(new THREE.TorusGeometry(0.405, 0.012, 8, 48), M.led, G, new THREE.Vector3(-1.29, -0.3, 0), [0, Math.PI / 2, 0]); R.leds.push(wl);
  // back plate under abdomen
  mesh(new RoundedBoxGeometry(1.5, 0.22, 1.05, 4, 0.08), M.panel, G, new THREE.Vector3(-0.55, -0.6, 0));
  // translucent abdominal shell
  R.shell = mesh(new THREE.SphereGeometry(1, 48, 32), M.shell, G, new THREE.Vector3(-0.55, -0.15, 0)); R.shell.scale.set(0.8, 0.8, 0.66); R.shell.castShadow = false; R.shell.renderOrder = 3;
  R.shellBase = R.shell.scale.clone();
  R.bellyRing = mesh(new THREE.TorusGeometry(1, 0.012, 8, 72), M.led.clone(), G, new THREE.Vector3(-0.55, -0.15, 0), [0, Math.PI / 2, 0]); R.bellyRing.scale.set(0.8, 0.66, 1); R.bellyRing.castShadow = false;
  R.bellyRing2 = mesh(new THREE.TorusGeometry(1, 0.01, 8, 72), R.bellyRing.material, G, new THREE.Vector3(-0.55, -0.15, 0), [Math.PI / 2, 0, 0]); R.bellyRing2.scale.set(0.8, 0.66, 1); R.bellyRing2.castShadow = false;
  // pelvis module (clear) + bony pelvis
  R.pelvis = mesh(new THREE.CapsuleGeometry(0.34, 0.5, 8, 24), M.pelvisShell, G, new THREE.Vector3(0.2, -0.32, 0), [Math.PI / 2, 0, 0]); R.pelvis.castShadow = false; R.pelvis.renderOrder = 3;
  const ringAt = (s, r) => { const c = canal(s), cn = canal(s + 0.01); const p = m2(c.x, c.y), t = v2(cn.x - c.x, cn.y - c.y); const ring = mesh(new THREE.TorusGeometry(r, 0.03, 10, 40), M.bone, G, p); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), t); ring.castShadow = false; return ring; };
  ringAt(-0.08, 0.22); ringAt(0.7, 0.19);
  const sac = []; for (let s = -0.35; s <= 0.85; s += 0.1){ const c = canal(s), cn = canal(s + 0.01); const t = v2(cn.x - c.x, cn.y - c.y); const nrm = new THREE.Vector3(-t.y, t.x, 0); if (nrm.y > 0) nrm.negate(); sac.push(m2(c.x, c.y).addScaledVector(nrm, 0.21)); }
  const sacM = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sac), 30, 0.045, 10), M.bone, G); sacM.castShadow = false;
  const sym = mesh(new THREE.CapsuleGeometry(0.035, 0.12, 4, 10), M.bone, G, m2(148, 312), [Math.PI / 2, 0, 0]); sym.castShadow = false;
  for (const z of [-1, 1]){ const w = mesh(new THREE.SphereGeometry(0.26, 20, 14, 0, Math.PI, 0, Math.PI / 2), M.bone, G, new THREE.Vector3(-0.08, -0.25, z * 0.24), [0, z > 0 ? 0 : Math.PI, Math.PI / 2]); w.scale.set(1, 0.9, 0.5); w.castShadow = false; }
  // birth canal
  const cp = []; for (let s = -0.08; s <= 1.04; s += 0.04){ const c = canal(s); cp.push(m2(c.x, c.y)); }
  R.canal = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp), 40, 0.165, 20), M.canal, G); R.canal.castShadow = false; R.canal.renderOrder = 2;
  // uterus + placenta
  R.uterus = mesh(new THREE.SphereGeometry(1, 40, 28), M.uterus, G, new THREE.Vector3(-0.55, 0, 0)); R.uterus.scale.set(0.56, 0.55, 0.45); R.uterus.castShadow = false; R.uterus.renderOrder = 2;
  R.placenta = mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 28), M.placenta, G);
  // hips & legs
  for (const sgn of [-1, 1]){
    const hip = new THREE.Vector3(0.32, -0.36, sgn * 0.38);
    joint(hip, 0.16, G, false);
    const leg = {sgn, hip};
    leg.thigh = limb(hip, new THREE.Vector3(1.1, 0.35, sgn * 0.55), 0.15, M.white, G);
    leg.knee = joint(new THREE.Vector3(1.1, 0.35, sgn * 0.55), 0.14, G, false);
    leg.kneeLed = mesh(new THREE.TorusGeometry(0.143, 0.012, 8, 32), M.led, G); R.leds.push(leg.kneeLed);
    leg.shin = limb(new THREE.Vector3(1.1, 0.35, sgn * 0.55), new THREE.Vector3(1.6, -0.6, sgn * 0.6), 0.11, M.white, G);
    leg.foot = mesh(new RoundedBoxGeometry(0.32, 0.12, 0.16, 3, 0.05), M.panel, G);
    (R.legs = R.legs || []).push(leg);
  }
  // fundal-height tape
  const tp = [new THREE.Vector3(0.02, 0.46, 0.0), new THREE.Vector3(-0.3, 0.63, 0), new THREE.Vector3(-0.7, 0.66, 0), new THREE.Vector3(-1.1, 0.5, 0)];
  R.tape = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tp), 30, 0.012, 6), M.tape, G); R.tape.visible = false;
  // Doppler probe
  R.probe = new THREE.Group(); scene.add(R.probe);
  mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 16), M.white, R.probe, new THREE.Vector3(0, 0.11, 0));
  mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 20), M.grey, R.probe, new THREE.Vector3(0, 0, 0));
  R.probeLed = mesh(new THREE.TorusGeometry(0.037, 0.008, 6, 20), M.led, R.probe, new THREE.Vector3(0, 0.2, 0), [Math.PI / 2, 0, 0]);
  R.probeHome = new THREE.Vector3(2.35, 1.0, -1.35); R.probe.position.copy(R.probeHome); R.probeTarget = R.probeHome.clone();
  // glove marker
  R.glove = mesh(new THREE.SphereGeometry(0.08, 20, 14), new THREE.MeshStandardMaterial({color:0xeaf6ff, emissive:0x19e3d0, emissiveIntensity:0.6, transparent:true, opacity:0.85}), G); R.glove.scale.set(1.4, 0.4, 1); R.glove.visible = false; R.gloveT = 0;
}

/* ---------- robot fetus ---------- */
function buildFetus(){
  const root = new THREE.Group(); root.scale.setScalar(1.25); G.add(root); R.fetus = root;
  const headG = new THREE.Group(); root.add(headG); R.fHead = headG;
  mesh(new THREE.SphereGeometry(0.12, 32, 24), M.white, headG);
  const visor = mesh(new THREE.SphereGeometry(0.1225, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), M.dark, headG); visor.rotation.x = -Math.PI / 2 - 0.15;
  R.eyes = [-0.035, 0.035].map(x => mesh(new THREE.SphereGeometry(0.013, 12, 10), M.ledBaby, headG, new THREE.Vector3(x, -0.01, -0.12)));
  seamRing(new THREE.Vector3(0, 0, 0), 0.121, 'y', headG);
  R.hat = mesh(new THREE.SphereGeometry(0.128, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.45), M.hat, headG); R.hat.rotation.x = Math.PI; R.hat.visible = false;
  mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 14), M.grey, root, new THREE.Vector3(0, 0.15, 0));
  const torso = mesh(new THREE.CapsuleGeometry(0.115, 0.2, 8, 20), M.white, root, new THREE.Vector3(0, 0.33, 0)); torso.scale.set(1, 1, 0.9);
  seamRing(new THREE.Vector3(0, 0.27, 0), 0.113, 'y', root); seamRing(new THREE.Vector3(0, 0.4, 0), 0.113, 'y', root);
  R.babyBand = mesh(new THREE.TorusGeometry(0.117, 0.008, 8, 32), M.ledChest, root, new THREE.Vector3(0, 0.335, 0), [Math.PI / 2, 0, 0]);
  R.chestLight = mesh(new THREE.SphereGeometry(0.018, 12, 10), M.ledChest, root, new THREE.Vector3(0, 0.27, -0.105));
  for (const x of [-1, 1]){
    joint(new THREE.Vector3(x * 0.11, 0.22, 0), 0.04, root);
    limb(new THREE.Vector3(x * 0.11, 0.22, -0.01), new THREE.Vector3(x * 0.09, 0.2, -0.13), 0.032, M.white, root);
    limb(new THREE.Vector3(x * 0.09, 0.2, -0.13), new THREE.Vector3(x * 0.05, 0.1, -0.12), 0.028, M.white, root);
    joint(new THREE.Vector3(x * 0.07, 0.47, -0.02), 0.045, root);
    limb(new THREE.Vector3(x * 0.07, 0.47, -0.02), new THREE.Vector3(x * 0.08, 0.36, -0.17), 0.045, M.white, root);
    limb(new THREE.Vector3(x * 0.08, 0.36, -0.17), new THREE.Vector3(x * 0.07, 0.5, -0.2), 0.036, M.white, root);
  }
  R.towel = mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.44, 28, 1, true, -Math.PI / 2, Math.PI), M.towel, root, new THREE.Vector3(0, 0.37, 0)); R.towel.scale.set(1.15, 1, 1); R.towel.visible = false;
  R.nuchal = mesh(new THREE.TorusGeometry(0.065, 0.018, 8, 24), M.cord, root, new THREE.Vector3(0, 0.15, 0), [Math.PI / 2, 0, 0]); R.nuchal.visible = false;
  // cord pieces & clamps
  R.cordMeshes = [0, 1, 2].map(() => { const m = mesh(new THREE.BufferGeometry(), M.cord, G); m.castShadow = false; m.userData.cord = true; return m; });
  R.clamps = [0, 1].map(() => mesh(new RoundedBoxGeometry(0.09, 0.03, 0.05, 2, 0.01), M.clamp, G));
}

/* ---------- hotspots ---------- */
const HS = [
  {id:'chest', p:new THREE.Vector3(-1.85, 0.2, 0), r:0.22, label:'Chest: maternal observations'},
  {id:'fundus', p:new THREE.Vector3(-1.15, 0.52, 0), r:0.17, label:'Fundus: fundal height · palpation · massage'},
  {id:'abdomen', p:new THREE.Vector3(-0.6, 0.55, 0.38), r:0.17, label:'Abdomen (lateral): Leopold\u2019s grips'},
  {id:'doppler', p:new THREE.Vector3(-0.2, 0.5, -0.36), r:0.14, label:'Lower left abdomen: Doppler fetal heart'},
  {id:'lower', p:new THREE.Vector3(0.02, 0.44, 0.02), r:0.12, label:'Suprapubic: Pawlik\u2019s / pelvic grip · pressure'},
  {id:'perineum', p:new THREE.Vector3(0.52, 0.2, 0), r:0.12, label:'Perineum: VE · birth'},
];
function buildHotspots(){
  for (const h of HS){
    const m = new THREE.Mesh(new THREE.SphereGeometry(h.r, 24, 16), M.hot.clone()); m.position.copy(h.p); m.userData.hs = h; m.renderOrder = 5; G.add(m); h.mesh = m; hotspots.push(m);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(h.r * 0.8, 0.012, 8, 40), M.ring.clone()); ring.position.copy(h.p).add(new THREE.Vector3(0, h.r * 0.6, 0)); ring.rotation.x = Math.PI / 2; ring.visible = false; ring.renderOrder = 6; G.add(ring); h.ring = ring;
  }
}
const RELEVANT = {obs:['chest'], sfh:['fundus'], leopold:['fundus','abdomen','lower'], fh:['doppler'], brady:['doppler','chest'], ve1:['perineum'], full:['perineum'], crown:['perineum'], head:['perineum'], nuchal:['perineum'], sd:['lower'], sep:['fundus'], pph:['fundus','lower'], cut:['cord'], cct:['cord','lower'], dcc:['cord']};

/* ---------- interaction ---------- */
function clickOpt(re){ const b = $$('#scenBody .opt').find(x => !x.disabled && re.test(x.textContent)); if (b){ b.click(); return true; } return false; }
let robotT = 0;
function robot(msg, lvl){ const el = $('#robot'); if (!el) return; el.innerHTML = `<b>SIM-MOM UNIT ▸</b> ${msg}`; el.className = 'robot show ' + (lvl || ''); robotT = performance.now(); }
function showGlove(p){ R.glove.position.copy(p); R.glove.visible = true; R.gloveT = 1.6; }
function hotspotAction(id){
  const MS = window.MidwifeSim, st = MS.step, P = MS.P, sid = st && st.id;
  const h = HS.find(x => x.id === id); if (h) showGlove(h.p);
  if (id === 'chest'){
    if (sid === 'obs'){ const done = clickOpt(/^\s*\d*\s*Pulse$/) || clickOpt(/Blood pressure/) || clickOpt(/Respiratory/) || clickOpt(/Temperature/); robot(done ? 'NIBP cuff cycling · pulse oximeter attached · readings transmitted' : 'Vital signs already recorded'); }
    else robot(`Telemetry: maternal HR ${Math.round(P.mhr)} bpm · BP ${Math.round(P.sys)}/${Math.round(P.dia)} · SpO₂ ${Math.round(P.spo2)}%`);
  } else if (id === 'fundus'){
    if (sid === 'sfh'){ R.tape.visible = true; robot('Tape measure deployed: symphysis–fundal height 38 cm'); }
    else if (sid === 'leopold'){ clickOpt(/Fundal grip/); robot('Fundal grip: soft, broad, irregular pole detected (breech)'); }
    else if (sid === 'pph'){ clickOpt(/fundal massage/i); robot('Fundal massage applied: uterine tone increasing', 'warn'); }
    else if (sid === 'sep') robot('Fundus: firm, globular, rising: separation likely');
    else robot(P.bell > 0.3 ? 'Fundus: contraction palpable, strong' : 'Fundus palpated: uterus relaxed between contractions');
  } else if (id === 'abdomen'){
    if (sid === 'leopold'){ clickOpt(/Lateral/); robot('Lateral grips: smooth curved resistance on maternal left (fetal back)'); }
    else robot(P.bell > 0.3 ? 'Abdomen tense: contraction in progress' : 'Abdomen soft, non-tender');
  } else if (id === 'lower'){
    if (sid === 'leopold'){ if (!clickOpt(/Pawlik/)) clickOpt(/Pelvic \(deep\)/); robot('Suprapubic palpation: hard round presenting part (head)'); }
    else if (sid === 'sd'){ clickOpt(/Suprapubic pressure/i); robot('Suprapubic pressure applied from the fetal back side', 'warn'); }
    else if (sid === 'cct') robot('Counter-pressure above the symphysis: uterus guarded');
    else robot('Suprapubic region palpated');
  } else if (id === 'doppler'){
    R.probeTarget = G.localToWorld(HS.find(x => x.id === 'doppler').p.clone().add(new THREE.Vector3(0, 0.08, 0)));
    later(() => { R.probeTarget = R.probeHome.clone(); }, 6000);
    if (sid === 'fh'){ later(() => clickOpt(/mother's left/), 700); robot('Doppler placed: fetal heart audible, 140 bpm'); }
    else robot(MS.SIM.born ? 'Doppler: no fetal signal (baby born)' : `Doppler: FHR ${Math.round(P.fhr)} bpm${P.fhr < 110 ? ': BELOW NORMAL RANGE' : ''}`, P.fhr < 110 && !MS.SIM.born ? 'alert' : '');
  } else if (id === 'perineum'){
    const F = MS.F; robot(MS.SIM.born ? 'Perineum: assess for trauma with consent' : F.s > 0.66 ? 'Perineum: head visible; hands-on support ready' : `Vaginal examination channel: station ${Math.round(F.s <= 0 ? F.s / 0.15 : F.s / 0.55 * 3)}`);
  } else if (id === 'cord'){
    if (sid === 'cut'){ const ok = clickOpt(/first \(plastic\)/) || clickOpt(/second clamp/) || clickOpt(/cut between/) || clickOpt(/secure/); robot(ok ? 'Cord action registered' : 'Cord already clamped and cut'); }
    else if (sid === 'cct'){ clickOpt(/controlled cord traction/i); robot('Controlled cord traction with uterine guarding'); }
    else if (sid === 'dcc') robot('Cord pulsating: deferred clamping in progress');
    else robot('Umbilical cord: 3 vessels');
  }
}
const timers3 = []; function later(fn, ms){ timers3.push(setTimeout(fn, ms)); }

/* ---------- camera presets ---------- */
const CAMS = {
  overview: {p:[2.9, 3.5, 5.0], t:[-0.85, 1.25, 0]},
  side:     {p:[0.0, 3.0, 1.9], t:[0.7, 1.55, 0]},
  abdomen:  {p:[-0.1, 3.7, 2.3], t:[-0.1, 1.6, 0]},
  delivery: {p:[3.2, 2.35, 0.25], t:[0.9, 1.75, 0]},
  chest:    {p:[-0.55, 2.9, 2.3], t:[-1.25, 1.9, 0]},
};
let camTween = null;
function camPreset(name, instant){
  const c = CAMS[name]; if (!c) return;
  $$('#camBar button').forEach(b => b.classList.toggle('on', b.dataset.cam === name));
  const from = {p:camera.position.clone(), t:controls.target.clone()}, to = {p:new THREE.Vector3(...c.p), t:new THREE.Vector3(...c.t)};
  if (instant){ camera.position.copy(to.p); controls.target.copy(to.t); controls.update(); camTween = null; return; }
  camTween = {from, to, k:0};
}
const AUTO_CAM = {welcome:'overview', sfh:'abdomen', fh:'abdomen', push:'side', crown:'delivery', skin:'chest', sep:'side', pph:'abdomen', care:'overview'};

/* ---------- per-frame update ---------- */
const tmpM = new THREE.Matrix4();
let lastStep = null, lastBell = 0, babyMode = 'labour', babyK = 0, fromPos = new THREE.Vector3(), fromQuat = new THREE.Quaternion(), cordKey = '';
function fetusPose(F){
  const hp = canal(F.s), ref = canal(F.s - 0.55);
  const pos = m2(hp.x, hp.y); pos.x += F.oy * S; pos.y += -F.ox * S;
  const u = v2(ref.x - hp.x, ref.y - hp.y);
  const a = new THREE.Vector3(0, 1, 0); a.addScaledVector(u, -u.dot(a)).normalize();
  const back = a.applyAxisAngle(u, F.ins * Math.PI / 180);
  const xf = new THREE.Vector3().crossVectors(u, back).normalize();
  tmpM.makeBasis(xf, u, back);
  return {pos, quat:new THREE.Quaternion().setFromRotationMatrix(tmpM)};
}
function chestPose(){
  const u = new THREE.Vector3(1, 0, 0), back = new THREE.Vector3(0, 1, 0), xf = new THREE.Vector3().crossVectors(u, back);
  tmpM.makeBasis(xf, u, back);
  return {pos:new THREE.Vector3(-2.05, 0.38, 0.05), quat:new THREE.Quaternion().setFromRotationMatrix(tmpM)};
}
function updateCord(P3, babyPos, babyQuat){
  const key = [P3.pp.toFixed(2), P3.placVis, P3.cut, babyK.toFixed(2)].join('|');
  if (key === cordKey) return; cordKey = key;
  const pts = [];
  const pp = P3.pp;
  let pl;
  const att2 = {x:215 + (296 - 215) * P3.k, y:286 + (112 - 286) * P3.k};
  if (pp < 0.4){ const t = pp / 0.4; pl = m2(lerp(att2.x, 215, t), lerp(att2.y, 280, t)); }
  else { const c = canal((pp - 0.4) / 0.6 * 1.3); pl = m2(c.x, c.y); }
  R.placenta.position.copy(pl); R.placenta.visible = P3.placVis;
  R.placenta.rotation.set(0, 0, pp < 0.4 ? 0.3 : 1.2);
  const umb = babyPos.clone().add(new THREE.Vector3(0, 0.33, -0.1).applyQuaternion(babyQuat));
  pts.push(pl);
  const sStart = pp < 0.4 ? 0 : (pp - 0.4) / 0.6 * 1.3;
  for (let s = Math.max(0, sStart + 0.12); s <= 1.0; s += 0.2){ const c = canal(s); pts.push(m2(c.x, c.y)); }
  const out = m2(CB.x, CB.y);
  pts.push(out.clone().add(new THREE.Vector3(0.25, 0.18, 0.25)), new THREE.Vector3(0.15, 0.62, 0.5), new THREE.Vector3(-0.55, 0.72, 0.45), new THREE.Vector3(-1.1, 0.5, 0.3), umb);
  const curve = new THREE.CatmullRomCurve3(pts);
  const N = 120, all = curve.getPoints(N);
  const i1 = Math.round(N * 0.9), i2 = Math.round(N * 0.86);
  const seg = (a, b) => (b - a < 2 ? null : new THREE.TubeGeometry(new THREE.CatmullRomCurve3(all.slice(a, b + 1)), Math.max(4, (b - a) * 2), 0.024, 8));
  const geos = [P3.placVis ? seg(0, i2) : null, P3.cut ? null : seg(i2, i1), seg(i1, N)];
  R.cordMeshes.forEach((m, i) => { m.geometry.dispose(); if (geos[i]){ m.geometry = geos[i]; m.visible = true; } else { m.geometry = new THREE.BufferGeometry(); m.visible = false; } });
  if (!P3.placVis && P3.cut) R.cordMeshes[1].visible = false;
  [i1, i2].forEach((idx, k) => { const c = R.clamps[k]; c.position.copy(all[idx]); const tg = all[Math.min(N, idx + 1)].clone().sub(all[idx]).normalize(); c.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tg); });
}
function frame(){
  requestAnimationFrame(frame);
  const nowT = performance.now(); const dt = Math.min(0.1, (nowT - lastT) / 1000); lastT = nowT; elapsed += dt; const t = elapsed;
  const MS = window.MidwifeSim; if (!MS || !MS.SIM) { renderer.render(scene, camera); return; }
  const SIM = MS.SIM, P = MS.P, F = MS.F, P3 = MS.P3, st = MS.step;
  const sid = st ? st.id : null;
  const post = !!SIM.born && document.getElementById('postScene').style.display !== 'none';
  // step change
  if (sid !== lastStep){ lastStep = sid; if (st){ robot(`Module loaded: ${st.title}`); if ($('#autoCam').checked && AUTO_CAM[sid]) camPreset(AUTO_CAM[sid]); } R.tape.visible = sid === 'sfh'; }
  // contraction events
  if (P.cOn && P.bell > 0.3 && lastBell <= 0.3 && !SIM.born) robot(sid === 'push' ? 'Contraction detected: PUSH now' : 'Contraction detected', 'go');
  if (P.cOn && P.bell < 0.05 && lastBell >= 0.05 && sid === 'push') robot('Contraction ended: rest and breathe');
  lastBell = P.bell;
  // LEDs pulse with contractions / alarms
  const alarm = (!SIM.born && P.ctgOn && P.fhr < 110) || (SIM.pphActive && !SIM.pphControlled);
  const ledI = 0.8 + 2.6 * P.bell + 0.25 * Math.sin(t * 2);
  M.led.emissiveIntensity = ledI;
  R.bellyRing.material.emissive.setHex(alarm ? (Math.sin(t * 8) > 0 ? 0xff3b3b : 0x661010) : 0x19e3d0);
  R.bellyRing.material.emissiveIntensity = alarm ? 2.2 : 0.9 + 3 * P.bell;
  R.status[0].material.emissiveIntensity = 0.6 + 0.6 * Math.sin(t * 3);
  R.status[1].material.emissiveIntensity = 0.5 + 3 * P.bell;
  R.status[2].material.emissiveIntensity = alarm ? (Math.sin(t * 10) > 0 ? 3 : 0.2) : 0.15;
  const pulse = 1 - 0.035 * P.bell;
  R.shell.scale.set(R.shellBase.x * pulse, R.shellBase.y * (1 - 0.05 * P.bell), R.shellBase.z * pulse);
  M.shell.opacity = 0.14 + 0.1 * P.bell;
  // uterus
  if (!post){
    const sy = 1 - 0.3 * smoothstep(0, 1, F.s);
    R.uterus.scale.set(0.56 * sy * (1 - 0.02 * P.bell), 0.55 * (1 - 0.03 * P.bell), 0.45);
    R.uterus.position.set(-0.56 * sy, 0, 0);
    M.uterus.color.setHex(0xff8fa6); M.uterus.opacity = 0.2 + 0.12 * P.bell;
    const att = m2(296, 286 - (286 - 112) * sy); R.placenta.position.copy(att).add(new THREE.Vector3(0, 0.02, 0)); R.placenta.rotation.set(0, 0, 0.35 + 0.9 * (1 - sy)); R.placenta.visible = true;
  } else {
    const kk = P3.k * (P3.boggy ? 1 + 0.03 * Math.sin(t * 3) : 1);
    R.uterus.scale.set(0.56 * kk, 0.55 * kk, 0.45 * kk); R.uterus.position.set(-0.56 * kk, 0, 0);
    M.uterus.color.setHex(P3.boggy ? 0xffc2cf : 0xff6f8f); M.uterus.opacity = P3.boggy ? 0.18 : 0.32;
  }
  // McRoberts legs
  const mcr = sid === 'sd' && st._list && st._list.some(x => /McRoberts/.test(x.t) && x._d);
  R.legs.forEach(L => {
    const k = L.mcr = lerp(L.mcr || 0, mcr ? 1 : 0, Math.min(1, dt * 2));
    const knee = new THREE.Vector3(lerp(1.1, 0.5, k), lerp(0.35, 0.85, k), L.sgn * lerp(0.55, 0.72, k));
    const foot = new THREE.Vector3(lerp(1.6, 1.15, k), lerp(-0.6, 0.35, k), L.sgn * lerp(0.6, 0.8, k));
    placeLimb(L.thigh, L.hip, knee); L.knee.position.copy(knee); L.kneeLed.position.copy(knee); L.kneeLed.rotation.set(0, Math.PI / 2, 0);
    placeLimb(L.shin, knee, foot); L.foot.position.copy(foot).add(new THREE.Vector3(0.08, -0.04, 0));
  });
  // fetus
  const fetusOn = !(F.op < 0.05 && !post);
  R.fetus.visible = fetusOn;
  if (!post){
    babyMode = 'labour'; babyK = 0;
    const pose = fetusPose(F); R.fetus.position.copy(pose.pos); R.fetus.quaternion.copy(pose.quat);
    R.fHead.rotation.set((F.ha < 0 ? -F.ha : -F.ha * 0.25) * Math.PI / 180, 0, 0);
    fromPos.copy(pose.pos); fromQuat.copy(pose.quat);
    R.nuchal.visible = document.getElementById('nuchal').style.display !== 'none';
    R.cordMeshes.forEach(m => m.visible = false); R.clamps.forEach(c => c.visible = false); R.towel.visible = false; R.hat.visible = false;
    R.fetus.visible = F.op > 0.05 || F.s < 1.2;
    const lowFhr = P.ctgOn && P.fhr < 110;
    M.ledBaby.emissive.setHex(lowFhr ? 0xff4040 : 0x19e3d0);
    M.ledChest.emissive.setHex(lowFhr ? 0xff4040 : 0x19e3d0);
    M.ledChest.emissiveIntensity = 0.6 + 1.6 * Math.max(0, Math.sin(t * Math.PI * 2 * P.fhr / 60 / Math.max(1, SIM.speed)));
  } else {
    if (babyMode !== 'post'){ babyMode = 'post'; babyK = 0; robot('Birth detected: neonate transferred to maternal chest (skin-to-skin)', 'go'); }
    babyK = Math.min(1, babyK + dt * 0.9);
    const e = babyK * babyK * (3 - 2 * babyK), cp = chestPose();
    const pos = new THREE.Vector3().lerpVectors(fromPos, cp.pos, e); pos.y += Math.sin(e * Math.PI) * 0.35;
    R.fetus.position.copy(pos); R.fetus.quaternion.copy(fromQuat).slerp(cp.quat, e); R.fetus.visible = true;
    R.fHead.rotation.set(0.15, 0, 0); R.nuchal.visible = false;
    R.towel.visible = P3.towel; R.hat.visible = P3.hat;
    const c = new THREE.Color(0xffb020).lerp(new THREE.Color(0x19e3d0), clamp((P3.pink - 0.2) / 0.6, 0, 1));
    M.ledBaby.emissive.copy(c); M.ledChest.emissive.copy(c); M.ledChest.emissiveIntensity = 0.8 + 1.2 * Math.max(0, Math.sin(t * Math.PI * 2 * P.bhr / 60 / Math.max(1, SIM.speed)));
    R.clamps[0].visible = P3.clamp1; R.clamps[1].visible = P3.clamp2 && P3.placVis;
    updateCord(P3, R.fetus.position, R.fetus.quaternion);
  }
  // probe & glove
  R.probe.position.lerp(R.probeTarget, Math.min(1, dt * 3));
  if (R.gloveT > 0){ R.gloveT -= dt; R.glove.visible = true; R.glove.material.opacity = clamp(R.gloveT, 0, 0.85); R.glove.scale.set(1.4 + 0.1 * Math.sin(t * 10), 0.4, 1); } else R.glove.visible = false;
  // hotspots
  const rel = RELEVANT[sid] || [];
  for (const h of HS){
    const isHov = hovered && hovered.userData.hs === h;
    h.mesh.material.opacity = isHov ? 0.32 : 0;
    h.ring.visible = rel.includes(h.id) && !SIM.finished;
    h.ring.material.opacity = 0.45 + 0.4 * Math.sin(t * 4);
    h.ring.scale.setScalar(1 + 0.12 * Math.sin(t * 4));
    h.mesh.visible = !(post && h.id === 'perineum' && false);
  }
  const cordRel = rel.includes('cord') && post;
  M.cord.emissive.setHex(hovered && hovered.userData.cord ? 0x19e3d0 : cordRel ? (Math.sin(t * 4) > 0 ? 0x0a5550 : 0x101828) : 0x101828);
  // robot ticker fade
  if (performance.now() - robotT > 6000) $('#robot').classList.remove('show');
  // monitor screen texture
  R.monAcc = (R.monAcc || 0) + dt; if (R.monAcc > 0.12){ R.monAcc = 0; drawMon(MS); }
  // camera tween
  if (camTween){ camTween.k = Math.min(1, camTween.k + dt * 1.4); const e = camTween.k * camTween.k * (3 - 2 * camTween.k); camera.position.lerpVectors(camTween.from.p, camTween.to.p, e); controls.target.lerpVectors(camTween.from.t, camTween.to.t, e); if (camTween.k >= 1) camTween = null; }
  controls.update();
  renderer.render(scene, camera);
}
function smoothstep(a, b, x){ const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function placeLimb(m, a, b){ const d = new THREE.Vector3().subVectors(b, a); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
function drawMon(MS){
  const c = R.monCanvas, g = c.getContext('2d'), P = MS.P, SIM = MS.SIM;
  g.fillStyle = '#04090f'; g.fillRect(0, 0, 640, 400);
  g.fillStyle = '#19e3d0'; g.font = '700 22px system-ui, sans-serif'; g.fillText('SIM-MOM TELEMETRY', 18, 32);
  g.fillStyle = '#5c7a91'; g.font = '16px system-ui'; g.fillText(document.getElementById('clock').textContent, 560, 32);
  const rv = P.revealed || {};
  const cells = [['HR', rv.mhr ? Math.round(P.mhr) : '--', '#5ee08f'], ['BP', rv.bp ? Math.round(P.sys) + '/' + Math.round(P.dia) : '--', '#e8eef6'], ['SpO2', rv.spo2 ? Math.round(P.spo2) : '--', '#5fd4e8'], [SIM.born ? 'BABY HR' : 'FHR', rv.fhr ? Math.round(SIM.born ? P.bhr : P.fhr) : '--', '#f49ac1']];
  cells.forEach((cl, i) => { const x = 18 + i * 155; g.fillStyle = '#7f95ae'; g.font = '600 15px system-ui'; g.fillText(cl[0], x, 64); g.fillStyle = cl[2]; g.font = '800 40px system-ui'; g.fillText(cl[1], x, 106); });
  const ctg = document.getElementById('ctg'); if (ctg && ctg.width > 20) g.drawImage(ctg, 14, 124, 612, 262);
  R.monTex.needsUpdate = true;
}

/* ---------- picking ---------- */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
function pick(ev){
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const targets = hotspots.concat(R.cordMeshes.filter(m => m.visible));
  const hit = ray.intersectObjects(targets, false)[0];
  return hit ? hit.object : null;
}
function setupPicking(){
  const el = renderer.domElement, tip = $('#tip');
  let downAt = null;
  el.addEventListener('pointermove', ev => {
    hovered = pick(ev); el.style.cursor = hovered ? 'pointer' : 'grab';
    if (hovered){ tip.style.display = 'block'; tip.style.left = (ev.clientX + 14) + 'px'; tip.style.top = (ev.clientY + 10) + 'px'; tip.textContent = hovered.userData.cord ? 'Umbilical cord: clamp / cut / traction' : hovered.userData.hs.label; }
    else tip.style.display = 'none';
  });
  el.addEventListener('pointerleave', () => { hovered = null; tip.style.display = 'none'; });
  el.addEventListener('pointerdown', ev => { downAt = [ev.clientX, ev.clientY]; });
  el.addEventListener('pointerup', ev => {
    if (!downAt || Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) > 6) return;
    const o = pick(ev); if (!o) return;
    hotspotAction(o.userData.cord ? 'cord' : o.userData.hs.id);
  });
}

/* ---------- init ---------- */
function init3D(){
  const host = $('#stage3d');
  renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  host.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.05, 60);
  controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 0.8; controls.maxDistance = 12; controls.maxPolarAngle = Math.PI * 0.49;
  controls.addEventListener('start', () => { camTween = null; $$('#camBar button').forEach(b => b.classList.remove('on')); });
  scene.add(new THREE.HemisphereLight(0xcfe9ff, 0x1a2633, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(3, 7, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {left:-5, right:5, top:5, bottom:-5, near:1, far:20}); key.shadow.bias = -0.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fe9ff, 0.8); rim.position.set(-4, 3, -3); scene.add(rim);
  const ceil = new THREE.PointLight(0xffffff, 6, 8, 2); ceil.position.set(-0.2, 3.6, 0.5); scene.add(ceil);
  R.glow = new THREE.PointLight(0x19e3d0, 0.6, 2.5, 2); R.glow.position.set(0.3, 2.3, 0); scene.add(R.glow);
  mats(); buildRoom(); buildMother(); buildFetus(); buildHotspots(); setupPicking();
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h);
    const sp = $('#scenPanel'), mp = $('#monPanel');
    if (w > 900 && sp && mp){ const l = sp.getBoundingClientRect().right, r = mp.getBoundingClientRect().left; const cx = (l + r) / 2; camera.setViewOffset(w, h, (w / 2 - cx), 0, w, h); }
    else camera.clearViewOffset();
    camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();
  camPreset('overview', true);
  $$('#camBar button').forEach(b => b.onclick = () => camPreset(b.dataset.cam));
  robot('Systems online. Select a mode to begin the simulation.');
  frame();
  window.Sim3D = {
    camPreset, hotspotAction,
    screenPos(id){ let p; if (id === 'cord'){ const m = R.cordMeshes[2]; if (!m.visible) return null; m.geometry.computeBoundingSphere(); p = m.localToWorld(m.geometry.boundingSphere.center.clone()); } else p = G.localToWorld(HS.find(x => x.id === id).p.clone()); const v = p.project(camera); const r = renderer.domElement.getBoundingClientRect(); return {x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height}; },
    get renderer(){ return renderer; }
  };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init3D); else init3D();
