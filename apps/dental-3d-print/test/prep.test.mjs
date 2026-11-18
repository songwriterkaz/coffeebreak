import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  box, volumeMm3, signedVolume, toBinarySTL, parseSTL, to3MF, arch, tooth,
  hollowModel, buildSupports, placeOnPlate, triangleCount, parseOBJ, parsePLY,
  plinthWithLabel, cleanCaseId, translate, bounds, nightGuard, alignerShell,
  studyModel, crownPlaceholder, biteBlock, implantAnalog, modelBase, estimate
} from '../geometry.js';

const samplePath = fileURLToPath(new URL('../samples/demo-crown.stl', import.meta.url));

test('a solid box keeps its volume and outward winding', () => {
  const solid = box(10, 10, 10);
  assert.ok(signedVolume(solid) > 0);
  assert.ok(Math.abs(volumeMm3(solid) - 1000) < 1);
});

test('binary STL export loads back with the same volume', () => {
  const src = crownPlaceholder();
  const stl = toBinarySTL(src);
  fs.mkdirSync(fileURLToPath(new URL('../samples/', import.meta.url)), { recursive: true });
  fs.writeFileSync(samplePath, stl);
  const back = parseSTL(fs.readFileSync(samplePath));
  assert.equal(triangleCount(back), triangleCount(src));
  const a = volumeMm3(src);
  const b = volumeMm3(back);
  assert.ok(Math.abs(a - b) / a < 0.01, a + ' vs ' + b);
});

test('ASCII STL and OBJ and PLY readers keep triangles', () => {
  const ascii = 'solid t\nfacet normal 0 0 0\n outer loop\n  vertex 0 0 0\n  vertex 10 0 0\n  vertex 0 0 10\n endloop\nendfacet\nendsolid t\n';
  assert.equal(triangleCount(parseSTL(new TextEncoder().encode(ascii))), 1);
  assert.equal(triangleCount(parseOBJ('v 0 0 0\nv 1 0 0\nv 0 1 0\nv 0 0 1\nf 1 2 3\nf 1 3 4\n')), 2);
  const ply = 'ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty list uchar int vertex_indices\nend_header\n0 0 0\n1 0 0\n0 1 0\n3 0 1 2\n';
  assert.equal(triangleCount(parsePLY(new TextEncoder().encode(ply))), 1);
});

test('upper arch is a full set of teeth', () => {
  const mesh = arch('upper');
  assert.ok(triangleCount(mesh) > 800);
  const b = bounds(mesh);
  const width = b.max[0] - b.min[0];
  assert.ok(width > 40 && width < 90, 'width ' + width);
  assert.equal(triangleCount(tooth(11)) > 20, true);
});

test('hollowing an arch keeps a thinner shell', () => {
  const solid = arch('lower');
  const before = volumeMm3(solid);
  const shell = hollowModel(solid, 1.2, 2, 1.6, 22);
  assert.equal(shell.ok, true, shell.message);
  const after = volumeMm3(shell.positions);
  assert.ok(after < before, after + ' vs ' + before);
  assert.ok(after > before * 0.05, after + ' vs ' + before);
});

test('hollowing a box reduces volume and drain holes reduce it further', () => {
  const solid = box(20, 20, 20);
  const shell = hollowModel(solid, 2, 0, 0, 28);
  assert.equal(shell.ok, true, shell.message);
  const solidV = volumeMm3(solid);
  const shellV = volumeMm3(shell.positions);
  assert.ok(shellV < solidV * 0.8, 'shell ' + shellV + ' solid ' + solidV);
  assert.ok(shellV > solidV * 0.15, 'shell ' + shellV);
  const drained = hollowModel(solid, 2, 2, 3, 28);
  assert.equal(drained.ok, true);
  assert.ok(volumeMm3(drained.positions) < shellV);
});

test('supports reach the build plate under a raised model', () => {
  const raised = translate(box(12, 8, 12), 0, 6, 0);
  const supports = buildSupports(raised, 4, 0.35);
  assert.ok(supports.count >= 1, supports.message);
  const b = bounds(supports.positions);
  assert.ok(b.min[1] <= 0.05);
  assert.ok(b.max[1] > 4);
  const seated = placeOnPlate(raised);
  assert.ok(Math.abs(bounds(seated).min[1]) < 0.001);
});

test('library pieces and labelled plinth build closed meshes', () => {
  for (const mesh of [nightGuard(), alignerShell(), studyModel(), biteBlock(), implantAnalog(), modelBase()]) {
    assert.ok(triangleCount(mesh) >= 12);
    assert.ok(volumeMm3(mesh) > 1);
  }
  assert.equal(cleanCaseId('Jane Doe').ok, false);
  assert.equal(cleanCaseId('CASE-12').ok, true);
  const plain = modelBase();
  const labelled = plinthWithLabel('CASE-12', 'emboss');
  assert.equal(labelled.ok, true);
  assert.ok(triangleCount(labelled.positions) > triangleCount(plain));
  const engraved = plinthWithLabel('CASE-12', 'engrave');
  assert.ok(triangleCount(engraved.positions) > 12);
});

test('3MF is a zip and the print estimate is finite', () => {
  const mesh = box(8, 4, 6);
  const zip = to3MF(mesh);
  assert.equal(zip[0], 0x50);
  assert.equal(zip[1], 0x4b);
  const est = estimate(mesh, { layerHeight: 0.05, exposure: 2.5, move: 4, pricePerMl: 0.18 });
  assert.equal(est.layers, 80);
  assert.ok(est.ml > 0.1 && est.cost > 0);
});
