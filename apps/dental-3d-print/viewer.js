import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
const IVORY = 0xf3efe6;
const SUPPORT = 0x7d97a0;
const BASE = 0xc5d0cc;

export function createViewer(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6eef0);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 5000);
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 760;
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.localClippingEnabled = true;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xf7fbff, 0x8aa0a6, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(40, 80, 30);
  scene.add(key);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minDistance = 8;
  controls.maxDistance = 800;
  controls.target.set(0, 10, 0);
  camera.position.set(70, 55, 90);

  const plate = new THREE.GridHelper(120, 12, 0x8aa3aa, 0xc5d4d8);
  plate.position.y = 0;
  scene.add(plate);
  const plateLine = new THREE.LineLoop(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x0f6e6e })
  );
  scene.add(plateLine);

  const content = new THREE.Group();
  scene.add(content);
  const measureLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: 0x0f6e6e })
  );
  measureLine.visible = false;
  scene.add(measureLine);
  const measureDots = new THREE.Group();
  scene.add(measureDots);

  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6);
  const materials = {
    model: new THREE.MeshStandardMaterial({ color: IVORY, roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide, clippingPlanes: [clip] }),
    support: new THREE.MeshStandardMaterial({ color: SUPPORT, roughness: 0.7, metalness: 0, side: THREE.DoubleSide, clippingPlanes: [clip] }),
    base: new THREE.MeshStandardMaterial({ color: BASE, roughness: 0.62, metalness: 0, side: THREE.DoubleSide, clippingPlanes: [clip] })
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let objects = [];
  let measurePoints = [];
  let onMeasure = null;
  let measuring = false;

  function resize() {
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 320;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  function roleMat(role) {
    if (role === 'support') return materials.support;
    if (role === 'base' || role === 'plinth') return materials.base;
    return materials.model;
  }

  function setPlate(width, depth) {
    const hw = width / 2, hd = depth / 2;
    const pts = [
      new THREE.Vector3(-hw, 0.05, -hd),
      new THREE.Vector3(hw, 0.05, -hd),
      new THREE.Vector3(hw, 0.05, hd),
      new THREE.Vector3(-hw, 0.05, hd)
    ];
    plateLine.geometry.dispose();
    plateLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const span = Math.max(width, depth);
    plate.scale.set(span / 120, 1, span / 120);
  }

  function setScene(parts) {
    for (const m of objects) {
      content.remove(m);
      m.geometry.dispose();
    }
    objects = [];
    for (const part of parts) {
      if (!part.positions || part.positions.length < 9) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(part.positions, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, roleMat(part.role));
      mesh.userData.id = part.id;
      content.add(mesh);
      objects.push(mesh);
    }
  }

  function frame() {
    const box = new THREE.Box3();
    if (!objects.length) box.set(new THREE.Vector3(-30, 0, -30), new THREE.Vector3(30, 20, 30));
    else objects.forEach(m => box.expandByObject(m));
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const span = Math.max(size.x, size.y, size.z, 20);
    controls.target.copy(center);
    camera.position.set(center.x + span * 0.9, center.y + span * 0.75, center.z + span * 1.15);
    camera.near = Math.max(0.05, span / 200);
    camera.far = span * 20;
    camera.updateProjectionMatrix();
    controls.update();
  }

  function setWireframe(on) {
    for (const key of Object.keys(materials)) materials[key].wireframe = on;
  }

  function setSection(axis, t) {
    const box = new THREE.Box3();
    if (!objects.length) {
      clip.constant = 1e6;
      return;
    }
    objects.forEach(m => box.expandByObject(m));
    const min = box.min, max = box.max;
    const axes = { x: [1, 0, 0, min.x, max.x], y: [0, -1, 0, min.y, max.y], z: [0, 0, 1, min.z, max.z] };
    const spec = axes[axis] || axes.y;
    clip.normal.set(spec[0], spec[1], spec[2]);
    if (t >= 0.995) { clip.constant = 1e6; return; }
    const along = spec[3] + (spec[4] - spec[3]) * t;
    if (axis === 'y') clip.constant = along;
    else if (axis === 'x') clip.constant = -along;
    else clip.constant = -along;
  }

  function clearMeasure() {
    measurePoints = [];
    measureLine.visible = false;
    while (measureDots.children.length) {
      const c = measureDots.children.pop();
      c.geometry.dispose();
    }
  }

  function addMeasurePoint(point) {
    measurePoints.push(point.clone());
    if (measurePoints.length > 2) measurePoints = [point.clone()];
    while (measureDots.children.length) {
      const c = measureDots.children.pop();
      c.geometry.dispose();
    }
    const dotGeo = new THREE.SphereGeometry(0.45, 10, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x0f6e6e });
    for (const p of measurePoints) {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(p);
      measureDots.add(dot);
    }
    if (measurePoints.length === 2) {
      measureLine.geometry.dispose();
      measureLine.geometry = new THREE.BufferGeometry().setFromPoints(measurePoints);
      measureLine.visible = true;
      const d = measurePoints[0].distanceTo(measurePoints[1]);
      if (onMeasure) onMeasure(d);
    } else if (onMeasure) onMeasure(null);
  }

  function pick(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(objects, false);
    return hits[0] || null;
  }

  renderer.domElement.addEventListener('pointerdown', (ev) => {
    if (!measuring) return;
    const hit = pick(ev);
    if (!hit) return;
    addMeasurePoint(hit.point);
  });

  let running = true;
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
  }
  loop();

  return {
    setPlate, setScene, frame, setWireframe, setSection, clearMeasure,
    setMeasuring(on) {
      measuring = on;
      controls.enabled = !on;
      if (!on) clearMeasure();
    },
    onMeasure(fn) { onMeasure = fn; },
    resize,
    dispose() { running = false; ro.disconnect(); renderer.dispose(); }
  };
}
