/* Millimetre meshes for Coffeebreak 3D Dental Print.
   Positions are a flat Float32Array of triangles, Y up.
   STL and 3MF export use Z up, which dental slicers expect. */

export function bounds(pos) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const v = pos[i + k];
      if (v < min[k]) min[k] = v;
      if (v > max[k]) max[k] = v;
    }
  }
  if (!pos.length) return { min: [0, 0, 0], max: [0, 0, 0] };
  return { min, max };
}

export function signedVolume(pos) {
  let v = 0;
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i], ay = pos[i + 1], az = pos[i + 2];
    const bx = pos[i + 3], by = pos[i + 4], bz = pos[i + 5];
    const cx = pos[i + 6], cy = pos[i + 7], cz = pos[i + 8];
    v += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
  }
  return v / 6;
}

export function volumeMm3(pos) {
  return Math.abs(signedVolume(pos));
}

export function triangleCount(pos) {
  return (pos.length / 9) | 0;
}

export function merge(parts) {
  let n = 0;
  for (const p of parts) if (p && p.length) n += p.length;
  const out = new Float32Array(n);
  let o = 0;
  for (const p of parts) {
    if (!p || !p.length) continue;
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function translate(pos, x, y, z) {
  const o = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    o[i] = pos[i] + x;
    o[i + 1] = pos[i + 1] + y;
    o[i + 2] = pos[i + 2] + z;
  }
  return o;
}

export function scaleAbout(pos, sx, sy, sz, c) {
  const o = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    o[i] = c[0] + (pos[i] - c[0]) * sx;
    o[i + 1] = c[1] + (pos[i + 1] - c[1]) * sy;
    o[i + 2] = c[2] + (pos[i + 2] - c[2]) * sz;
  }
  return o;
}

export function centerOf(pos) {
  const b = bounds(pos);
  return [
    (b.min[0] + b.max[0]) / 2,
    (b.min[1] + b.max[1]) / 2,
    (b.min[2] + b.max[2]) / 2
  ];
}

function rotX(y, z, c, s) { return [y * c - z * s, y * s + z * c]; }
function rotY(x, z, c, s) { return [x * c + z * s, -x * s + z * c]; }
function rotZ(x, y, c, s) { return [x * c - y * s, x * s + y * c]; }

export function rotateAbout(pos, axis, deg, origin) {
  const rad = deg * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const o = new Float32Array(pos.length);
  const ox = origin[0], oy = origin[1], oz = origin[2];
  for (let i = 0; i < pos.length; i += 3) {
    let x = pos[i] - ox, y = pos[i + 1] - oy, z = pos[i + 2] - oz;
    if (axis === 'x') { const r = rotX(y, z, c, s); y = r[0]; z = r[1]; }
    else if (axis === 'y') { const r = rotY(x, z, c, s); x = r[0]; z = r[1]; }
    else { const r = rotZ(x, y, c, s); x = r[0]; y = r[1]; }
    o[i] = x + ox;
    o[i + 1] = y + oy;
    o[i + 2] = z + oz;
  }
  return o;
}

export function flipWinding(pos) {
  const o = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 9) {
    o[i] = pos[i]; o[i + 1] = pos[i + 1]; o[i + 2] = pos[i + 2];
    o[i + 3] = pos[i + 6]; o[i + 4] = pos[i + 7]; o[i + 5] = pos[i + 8];
    o[i + 6] = pos[i + 3]; o[i + 7] = pos[i + 4]; o[i + 8] = pos[i + 5];
  }
  return o;
}

export function ensureOutward(pos) {
  if (!pos.length) return pos;
  return signedVolume(pos) < 0 ? flipWinding(pos) : pos;
}

export function swapYZ(pos) {
  const o = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    o[i] = pos[i];
    o[i + 1] = pos[i + 2];
    o[i + 2] = pos[i + 1];
  }
  return o;
}

function triNormal(pos, i) {
  const ux = pos[i + 3] - pos[i], uy = pos[i + 4] - pos[i + 1], uz = pos[i + 5] - pos[i + 2];
  const vx = pos[i + 6] - pos[i], vy = pos[i + 7] - pos[i + 1], vz = pos[i + 8] - pos[i + 2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l, l / 2];
}

export function toBinarySTL(posYup) {
  const pos = swapYZ(posYup);
  const n = (pos.length / 9) | 0;
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  const hdr = 'Coffeebreak 3D Dental Print';
  for (let i = 0; i < hdr.length; i++) dv.setUint8(i, hdr.charCodeAt(i));
  dv.setUint32(80, n, true);
  let o = 84;
  for (let f = 0; f < n; f++) {
    const i = f * 9;
    const nn = triNormal(pos, i);
    dv.setFloat32(o, nn[0], true); o += 4;
    dv.setFloat32(o, nn[1], true); o += 4;
    dv.setFloat32(o, nn[2], true); o += 4;
    for (let k = 0; k < 9; k++) { dv.setFloat32(o, pos[i + k], true); o += 4; }
    dv.setUint16(o, 0, true); o += 2;
  }
  return new Uint8Array(buf);
}

export function parseSTL(buffer) {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  const dv = new DataView(buf);
  let ascii = false;
  if (u8.length >= 84) {
    const count = dv.getUint32(80, true);
    const expect = 84 + count * 50;
    const head = String.fromCharCode.apply(null, u8.subarray(0, Math.min(80, u8.length)));
    if (/^solid/i.test(head) && expect !== u8.length) ascii = true;
    if (expect === u8.length && count > 0 && count < 5e7) ascii = false;
  } else ascii = true;
  const raw = ascii ? parseAsciiSTL(new TextDecoder().decode(u8)) : parseBinarySTL(dv, u8.length);
  return swapYZ(raw);
}

function parseAsciiSTL(text) {
  const re = /vertex\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s+([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
  const nums = [];
  let m;
  while ((m = re.exec(text))) nums.push(+m[1], +m[2], +m[3]);
  return new Float32Array(nums);
}

function parseBinarySTL(dv, byteLength) {
  const n = dv.getUint32(80, true);
  if (84 + n * 50 > byteLength) throw new Error('STL length does not match the triangle count');
  const out = new Float32Array(n * 9);
  let o = 84;
  let k = 0;
  for (let i = 0; i < n; i++) {
    o += 12;
    for (let v = 0; v < 9; v++) { out[k++] = dv.getFloat32(o, true); o += 4; }
    o += 2;
  }
  return out;
}

export function parseOBJ(text) {
  const vs = [];
  const tris = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('v ')) {
      const p = line.trim().split(/\s+/);
      vs.push(+p[1], +p[2], +p[3]);
    } else if (line.startsWith('f ')) {
      const p = line.trim().split(/\s+/).slice(1).map(tok => {
        const ix = parseInt(tok.split('/')[0], 10);
        return ix < 0 ? vs.length / 3 + ix : ix - 1;
      });
      for (let i = 1; i < p.length - 1; i++) tris.push(p[0], p[i], p[i + 1]);
    }
  }
  const out = new Float32Array(tris.length * 3);
  let k = 0;
  for (const ix of tris) {
    out[k++] = vs[ix * 3];
    out[k++] = vs[ix * 3 + 1];
    out[k++] = vs[ix * 3 + 2];
  }
  return out;
}

export function parsePLY(buffer) {
  const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const headEnd = findPlyHeaderEnd(u8);
  const header = new TextDecoder().decode(u8.subarray(0, headEnd));
  const lines = header.split(/\r?\n/);
  let format = 'ascii';
  let vCount = 0, fCount = 0;
  const vProps = [];
  let inV = false, inF = false;
  let listType = 'uchar', idxType = 'int';
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('format ')) format = t.split(/\s+/)[1];
    else if (t.startsWith('element vertex')) { vCount = +t.split(/\s+/)[2]; inV = true; inF = false; }
    else if (t.startsWith('element face')) { fCount = +t.split(/\s+/)[2]; inF = true; inV = false; }
    else if (t.startsWith('element ')) { inV = false; inF = false; }
    else if (t.startsWith('property ') && inV) vProps.push(t.split(/\s+/).slice(1));
    else if (t.startsWith('property list ') && inF) {
      const p = t.split(/\s+/);
      listType = p[2];
      idxType = p[3];
    }
  }
  const xi = vProps.findIndex(p => p[1] === 'x');
  const yi = vProps.findIndex(p => p[1] === 'y');
  const zi = vProps.findIndex(p => p[1] === 'z');
  if (xi < 0 || yi < 0 || zi < 0) throw new Error('PLY has no xyz vertices');
  if (format === 'ascii') return swapYZ(parsePlyAscii(u8.subarray(headEnd), vCount, fCount, vProps.length, xi, yi, zi));
  if (format !== 'binary_little_endian') throw new Error('Only ASCII and binary little-endian PLY are supported');
  return swapYZ(parsePlyBinary(u8.subarray(headEnd), vCount, fCount, vProps, xi, yi, zi, listType, idxType));
}

function findPlyHeaderEnd(u8) {
  const token = [101, 110, 100, 95, 104, 101, 97, 100, 101, 114];
  for (let i = 0; i < u8.length - token.length; i++) {
    let ok = true;
    for (let k = 0; k < token.length; k++) if (u8[i + k] !== token[k]) { ok = false; break; }
    if (!ok) continue;
    let j = i + token.length;
    if (u8[j] === 13) j++;
    if (u8[j] === 10) j++;
    return j;
  }
  throw new Error('PLY header is incomplete');
}

function parsePlyAscii(body, vCount, fCount, stride, xi, yi, zi) {
  const text = new TextDecoder().decode(body);
  const nums = text.trim().split(/\s+/).map(Number);
  const verts = [];
  let p = 0;
  for (let i = 0; i < vCount; i++) {
    verts.push(nums[p + xi], nums[p + yi], nums[p + zi]);
    p += stride;
  }
  const out = [];
  for (let i = 0; i < fCount; i++) {
    const n = nums[p++];
    const ids = [];
    for (let k = 0; k < n; k++) ids.push(nums[p++]);
    for (let k = 1; k < n - 1; k++) {
      for (const id of [ids[0], ids[k], ids[k + 1]]) out.push(verts[id * 3], verts[id * 3 + 1], verts[id * 3 + 2]);
    }
  }
  return new Float32Array(out);
}

function plySize(type) {
  if (type === 'char' || type === 'uchar' || type === 'int8' || type === 'uint8') return 1;
  if (type === 'short' || type === 'ushort' || type === 'int16' || type === 'uint16') return 2;
  if (type === 'int' || type === 'uint' || type === 'int32' || type === 'uint32' || type === 'float' || type === 'float32') return 4;
  if (type === 'double' || type === 'float64') return 8;
  return 4;
}

function readPlyNum(dv, o, type) {
  if (type === 'char' || type === 'int8') return [dv.getInt8(o), 1];
  if (type === 'uchar' || type === 'uint8') return [dv.getUint8(o), 1];
  if (type === 'short' || type === 'int16') return [dv.getInt16(o, true), 2];
  if (type === 'ushort' || type === 'uint16') return [dv.getUint16(o, true), 2];
  if (type === 'int' || type === 'int32') return [dv.getInt32(o, true), 4];
  if (type === 'uint' || type === 'uint32') return [dv.getUint32(o, true), 4];
  if (type === 'double' || type === 'float64') return [dv.getFloat64(o, true), 8];
  return [dv.getFloat32(o, true), 4];
}

function parsePlyBinary(body, vCount, fCount, vProps, xi, yi, zi, listType, idxType) {
  const dv = new DataView(body.buffer, body.byteOffset, body.byteLength);
  const verts = new Float32Array(vCount * 3);
  let o = 0;
  for (let i = 0; i < vCount; i++) {
    const start = o;
    const vals = [];
    for (const prop of vProps) {
      const r = readPlyNum(dv, o, prop[0]);
      vals.push(r[0]);
      o += r[1];
    }
    verts[i * 3] = vals[xi];
    verts[i * 3 + 1] = vals[yi];
    verts[i * 3 + 2] = vals[zi];
    if (o === start) o += 12;
  }
  const tris = [];
  for (let i = 0; i < fCount; i++) {
    const nr = readPlyNum(dv, o, listType);
    o += nr[1];
    const ids = [];
    for (let k = 0; k < nr[0]; k++) {
      const r = readPlyNum(dv, o, idxType);
      ids.push(r[0]);
      o += r[1];
    }
    for (let k = 1; k < ids.length - 1; k++) {
      for (const id of [ids[0], ids[k], ids[k + 1]]) tris.push(verts[id * 3], verts[id * 3 + 1], verts[id * 3 + 2]);
    }
  }
  return new Float32Array(tris);
}

const crcT = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(u) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u.length; i++) c = crcT[(c ^ u[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function zipStore(files) {
  const enc = new TextEncoder();
  const parts = [];
  const cen = [];
  let off = 0;
  for (const [name, data0] of files) {
    const data = typeof data0 === 'string' ? enc.encode(data0) : data0;
    const nb = enc.encode(name);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(lh.buffer), nb, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, nb.length, true);
    ch.setUint32(42, off, true);
    cen.push(new Uint8Array(ch.buffer), nb);
    off += 30 + nb.length + data.length;
  }
  const cs = cen.reduce((a, b) => a + b.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, cs, true);
  e.setUint32(16, off, true);
  const all = parts.concat(cen, [new Uint8Array(e.buffer)]);
  const out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let p = 0;
  for (const a of all) { out.set(a, p); p += a.length; }
  return out;
}

export function to3MF(posYup) {
  const pos = swapYZ(posYup);
  const map = new Map();
  const verts = [];
  const idx = [];
  for (let i = 0; i < pos.length; i += 3) {
    const k = pos[i].toFixed(4) + ',' + pos[i + 1].toFixed(4) + ',' + pos[i + 2].toFixed(4);
    let j = map.get(k);
    if (j === undefined) {
      j = verts.length / 3;
      map.set(k, j);
      verts.push(pos[i], pos[i + 1], pos[i + 2]);
    }
    idx.push(j);
  }
  let v = '';
  let tr = '';
  for (let i = 0; i < verts.length; i += 3) v += '<vertex x="' + verts[i].toFixed(4) + '" y="' + verts[i + 1].toFixed(4) + '" z="' + verts[i + 2].toFixed(4) + '"/>';
  for (let i = 0; i < idx.length; i += 3) tr += '<triangle v1="' + idx[i] + '" v2="' + idx[i + 1] + '" v3="' + idx[i + 2] + '"/>';
  const model = '<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Application">Coffeebreak 3D Dental Print</metadata><resources><object id="1" type="model"><mesh><vertices>' + v + '</vertices><triangles>' + tr + '</triangles></mesh></object></resources><build><item objectid="1"/></build></model>';
  return zipStore([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'],
    ['3D/3dmodel.model', model]
  ]);
}

function pushTri(arr, a, b, c) { arr.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
function pushQuad(arr, a, b, c, d) { pushTri(arr, a, b, c); pushTri(arr, a, c, d); }

export function box(w, h, d) {
  const x = w / 2, z = d / 2, y = h;
  const p = [
    [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z],
    [-x, y, -z], [x, y, -z], [x, y, z], [-x, y, z]
  ];
  const arr = [];
  pushQuad(arr, p[0], p[3], p[2], p[1]);
  pushQuad(arr, p[4], p[5], p[6], p[7]);
  pushQuad(arr, p[3], p[7], p[6], p[2]);
  pushQuad(arr, p[0], p[1], p[5], p[4]);
  pushQuad(arr, p[1], p[2], p[6], p[5]);
  pushQuad(arr, p[0], p[4], p[7], p[3]);
  return ensureOutward(new Float32Array(arr));
}

function lathe(profile, sides) {
  const rings = profile.map(p => {
    const ring = [];
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      ring.push([Math.cos(a) * p[1], p[0], Math.sin(a) * p[2]]);
    }
    return ring;
  });
  const arr = [];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      pushQuad(arr, rings[r][i], rings[r][j], rings[r + 1][j], rings[r + 1][i]);
    }
  }
  const top = rings[rings.length - 1];
  const bot = rings[0];
  const tc = [0, top[0][1], 0];
  const bc = [0, bot[0][1], 0];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    pushTri(arr, tc, top[i], top[j]);
    pushTri(arr, bc, bot[j], bot[i]);
  }
  return ensureOutward(new Float32Array(arr));
}

const PROFILES = {
  incisor: [[0, 1.15, 0.9], [3.4, 2.5, 1.9], [7.4, 3.35, 2.15], [9.8, 2.9, 1.25], [11.4, 1.2, 0.45]],
  canine: [[0, 1.05, 1.05], [4.2, 2.7, 2.7], [8.2, 3.5, 3.5], [12.2, 1.15, 1.15], [14.2, 0.28, 0.28]],
  premolar: [[0, 1.35, 1.2], [3.2, 3.3, 3.5], [7.2, 4.05, 4.45], [9.6, 3.5, 3.7], [11.2, 1.35, 1.3]],
  molar: [[0, 1.7, 1.5], [3.1, 4.5, 4.1], [6.6, 5.5, 5.05], [8.9, 5.15, 4.7], [10.4, 2.1, 1.9]]
};

export function toothKind(fdi) {
  const n = +fdi;
  const q = Math.floor(n / 10);
  const d = n % 10;
  if (q < 1 || q > 4 || d < 1 || d > 8) return null;
  if (d <= 2) return 'incisor';
  if (d === 3) return 'canine';
  if (d <= 5) return 'premolar';
  return 'molar';
}

export function tooth(fdi) {
  const kind = toothKind(fdi);
  if (!kind) throw new Error('FDI numbers run from 11-18, 21-28, 31-38 and 41-48');
  return lathe(PROFILES[kind], kind === 'molar' ? 12 : 10);
}

export const UPPER_FDI = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_FDI = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function placeOnArch(mesh, a, rx, rz) {
  const cx = Math.cos(a) * rx;
  const cz = Math.sin(a) * rz;
  const tx = -Math.sin(a);
  const tz = Math.cos(a);
  const rxd = Math.cos(a);
  const rzd = Math.sin(a);
  const o = new Float32Array(mesh.length);
  for (let i = 0; i < mesh.length; i += 3) {
    const lx = mesh[i], ly = mesh[i + 1], lz = mesh[i + 2];
    o[i] = cx + tx * lx + rxd * lz;
    o[i + 1] = ly;
    o[i + 2] = cz + tz * lx + rzd * lz;
  }
  return o;
}

export function arch(which) {
  const ids = which === 'lower' ? LOWER_FDI : UPPER_FDI;
  const rx = which === 'lower' ? 28.5 : 31.5;
  const rz = which === 'lower' ? 22 : 24.5;
  const parts = [];
  for (let i = 0; i < ids.length; i++) {
    const a = Math.PI * (0.12 + 0.76 * (i / (ids.length - 1)));
    parts.push(placeOnArch(tooth(ids[i]), a, rx, rz));
  }
  return ensureOutward(merge(parts));
}

export function crownPlaceholder() {
  return lathe([[0, 4.6, 4.2], [2.2, 5.3, 4.9], [5.4, 5.1, 4.6], [7.6, 2.4, 2.0], [8.4, 0.6, 0.5]], 12);
}

export function biteBlock() {
  const w = 22, d = 16, h0 = 4, h1 = 10;
  const x = w / 2, z = d / 2;
  const p = [
    [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z],
    [-x, h0, -z], [x, h0, -z], [x, h1, z], [-x, h1, z]
  ];
  const arr = [];
  pushQuad(arr, p[0], p[3], p[2], p[1]);
  pushQuad(arr, p[4], p[5], p[6], p[7]);
  pushQuad(arr, p[3], p[7], p[6], p[2]);
  pushQuad(arr, p[0], p[1], p[5], p[4]);
  pushQuad(arr, p[1], p[2], p[6], p[5]);
  pushQuad(arr, p[0], p[4], p[7], p[3]);
  return ensureOutward(new Float32Array(arr));
}

function prism(sides, r, y0, y1) {
  const bot = [], top = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    bot.push([Math.cos(a) * r, y0, Math.sin(a) * r]);
    top.push([Math.cos(a) * r, y1, Math.sin(a) * r]);
  }
  const arr = [];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    pushQuad(arr, bot[i], bot[j], top[j], top[i]);
  }
  const bc = [0, y0, 0], tc = [0, y1, 0];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    pushTri(arr, bc, bot[j], bot[i]);
    pushTri(arr, tc, top[i], top[j]);
  }
  return new Float32Array(arr);
}

export function cylinder(x, z, y0, y1, r, sides) {
  return translate(prism(sides || 8, r, y0, y1), x, 0, z);
}

export function cone(x, z, y0, y1, r0, r1, sides) {
  sides = sides || 6;
  const bot = [], top = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    bot.push([x + Math.cos(a) * r0, y0, z + Math.sin(a) * r0]);
    top.push([x + Math.cos(a) * r1, y1, z + Math.sin(a) * r1]);
  }
  const arr = [];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    pushQuad(arr, bot[i], bot[j], top[j], top[i]);
  }
  const bc = [x, y0, z], tc = [x, y1, z];
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    pushTri(arr, bc, bot[j], bot[i]);
    pushTri(arr, tc, top[i], top[j]);
  }
  return ensureOutward(new Float32Array(arr));
}

export function implantAnalog() {
  return ensureOutward(merge([
    prism(12, 2.15, 0, 12),
    translate(prism(6, 2.55, 12, 14.2), 0, 0, 0)
  ]));
}

function archFrames(rx, rz, steps) {
  const frames = [];
  const a0 = Math.PI * 0.14;
  const a1 = Math.PI * 0.86;
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    const x = Math.cos(a) * rx;
    const z = Math.sin(a) * rz;
    const dx = -Math.sin(a) * rx;
    const dz = Math.cos(a) * rz;
    const len = Math.hypot(dx, dz) || 1;
    frames.push({ x, z, lx: -dz / len, lz: dx / len });
  }
  return frames;
}

function sectionPoint(frame, s, y) {
  return [frame.x + frame.lx * s, y, frame.z + frame.lz * s];
}

export function shellArch(opts) {
  const rx = opts.rx, rz = opts.rz, wall = opts.wall, height = opts.height, width = opts.width;
  const steps = opts.steps || 36;
  const hw = width / 2;
  const inner = Math.max(0.4, hw - wall);
  const shape = [
    [-hw, 0], [hw, 0], [hw, height], [inner, height],
    [inner, wall], [-inner, wall], [-inner, height], [-hw, height]
  ];
  const frames = archFrames(rx, rz, steps);
  const rings = frames.map(f => shape.map(p => sectionPoint(f, p[0], p[1])));
  const arr = [];
  const n = shape.length;
  for (let i = 0; i < rings.length - 1; i++) {
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      pushQuad(arr, rings[i][k], rings[i][j], rings[i + 1][j], rings[i + 1][k]);
    }
  }
  const cap = (ring, outward) => {
    const tris = [[0, 1, 4], [0, 4, 5], [1, 2, 3], [1, 3, 4], [5, 6, 7], [5, 7, 0]];
    for (const t of tris) {
      if (outward) pushTri(arr, ring[t[0]], ring[t[1]], ring[t[2]]);
      else pushTri(arr, ring[t[0]], ring[t[2]], ring[t[1]]);
    }
  };
  cap(rings[0], false);
  cap(rings[rings.length - 1], true);
  return ensureOutward(new Float32Array(arr));
}

export function nightGuard() {
  return shellArch({ rx: 32, rz: 25, wall: 1.8, height: 6.5, width: 9.5, steps: 40 });
}

export function alignerShell() {
  return shellArch({ rx: 33.5, rz: 26, wall: 0.8, height: 14, width: 11, steps: 42 });
}

export function studyModel() {
  const teeth = arch('upper');
  const b = bounds(teeth);
  const w = (b.max[0] - b.min[0]) + 10;
  const d = (b.max[2] - b.min[2]) + 10;
  let base = box(w, 6, d);
  base = translate(base, (b.min[0] + b.max[0]) / 2, 0, (b.min[2] + b.max[2]) / 2);
  return ensureOutward(merge([base, translate(teeth, 0, 6, 0)]));
}

export function modelBase() {
  return box(62, 8, 48);
}

const FONT = {
  '0': ['11111', '10001', '10011', '10101', '11001', '10001', '11111'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['11110', '00001', '00001', '11110', '10000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['10001', '10001', '10001', '11111', '00001', '00001', '00001'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01111', '10000', '10000', '11111', '10001', '10001', '11111'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['11111', '10001', '10001', '11111', '10001', '10001', '11111'],
  '9': ['11111', '10001', '10001', '11111', '00001', '00001', '11110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000']
};

export function cleanCaseId(text) {
  const raw = String(text || '').toUpperCase();
  if (!raw) return { ok: true, id: '' };
  if (!/^[A-Z0-9-]{1,16}$/.test(raw)) {
    return { ok: false, id: '', message: 'Use a case ID of letters, numbers and hyphens only, up to 16 characters. Do not enter a patient name.' };
  }
  return { ok: true, id: raw };
}

function glyphPixels(text) {
  const rows = [];
  for (let r = 0; r < 7; r++) rows.push('');
  for (const ch of text) {
    const g = FONT[ch] || FONT['-'];
    for (let r = 0; r < 7; r++) rows[r] += g[r] + '0';
  }
  return rows;
}

function tileBox(x, y, z, w, h, d) {
  const p = [
    [x, y, z], [x + w, y, z], [x + w, y, z + d], [x, y, z + d],
    [x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + d], [x, y + h, z + d]
  ];
  const arr = [];
  pushQuad(arr, p[0], p[3], p[2], p[1]);
  pushQuad(arr, p[4], p[5], p[6], p[7]);
  pushQuad(arr, p[3], p[7], p[6], p[2]);
  pushQuad(arr, p[0], p[1], p[5], p[4]);
  pushQuad(arr, p[1], p[2], p[6], p[5]);
  pushQuad(arr, p[0], p[4], p[7], p[3]);
  return arr;
}

export function labelPlate(text, mode) {
  const rows = glyphPixels(text);
  const cols = rows[0].length;
  const cell = 0.62;
  const width = cols * cell;
  const height = 7 * cell;
  const arr = [];
  const depth = mode === 'engrave' ? 0.35 : 0.25;
  arr.push(...tileBox(-width / 2, -height / 2, 0, width, height, depth));
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < cols; c++) {
      const on = rows[r][c] === '1';
      if (mode === 'engrave' && on) continue;
      if (mode !== 'engrave' && !on) continue;
      const x = -width / 2 + c * cell;
      const y = height / 2 - (r + 1) * cell;
      arr.push(...tileBox(x, y, depth, cell, cell, mode === 'engrave' ? 0.45 : 0.55));
    }
  }
  return ensureOutward(new Float32Array(arr));
}

export function plinthWithLabel(caseId, mode) {
  const body = box(64, 16, 46);
  const id = cleanCaseId(caseId);
  if (!id.ok) return { ok: false, message: id.message };
  if (!id.id) return { ok: true, positions: body, message: '' };
  const plate = labelPlate(id.id, mode === 'engrave' ? 'engrave' : 'emboss');
  const b = bounds(body);
  const pb = bounds(plate);
  const placed = translate(plate, 0, 8 - (pb.min[1] + pb.max[1]) / 2, b.max[2] - pb.min[2]);
  return { ok: true, positions: ensureOutward(merge([body, placed])), message: '' };
}

export function placeOnPlate(pos) {
  const b = bounds(pos);
  const cx = (b.min[0] + b.max[0]) / 2;
  const cz = (b.min[2] + b.max[2]) / 2;
  return translate(pos, -cx, -b.min[1], -cz);
}

function rotateTo(pos, from, to) {
  let fx = from[0], fy = from[1], fz = from[2];
  const fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;
  let tx = to[0], ty = to[1], tz = to[2];
  const tl = Math.hypot(tx, ty, tz) || 1;
  tx /= tl; ty /= tl; tz /= tl;
  let cx = fy * tz - fz * ty;
  let cy = fz * tx - fx * tz;
  let cz = fx * ty - fy * tx;
  const cl = Math.hypot(cx, cy, cz);
  const dot = fx * tx + fy * ty + fz * tz;
  if (cl < 1e-8) {
    if (dot > 0) return new Float32Array(pos);
    return rotateAbout(pos, Math.abs(fy) < 0.9 ? 'y' : 'x', 180, [0, 0, 0]);
  }
  cx /= cl; cy /= cl; cz /= cl;
  const ang = Math.acos(Math.max(-1, Math.min(1, dot)));
  const s = Math.sin(ang), c = Math.cos(ang);
  const o = new Float32Array(pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    const dx = (cy * z - cz * y);
    const dy = (cz * x - cx * z);
    const dz = (cx * y - cy * x);
    o[i] = x * c + dx * s + cx * (cx * x + cy * y + cz * z) * (1 - c);
    o[i + 1] = y * c + dy * s + cy * (cx * x + cy * y + cz * z) * (1 - c);
    o[i + 2] = z * c + dz * s + cz * (cx * x + cy * y + cz * z) * (1 - c);
  }
  return o;
}

function overhangArea(pos) {
  let a = 0;
  for (let i = 0; i < pos.length; i += 9) {
    const n = triNormal(pos, i);
    if (n[1] < -0.3) a += n[3];
  }
  return a;
}

export function autoOrient(pos) {
  const clusters = new Map();
  for (let i = 0; i < pos.length; i += 9) {
    const n = triNormal(pos, i);
    if (n[3] < 1e-4) continue;
    const key = [Math.round(n[0] * 4), Math.round(n[1] * 4), Math.round(n[2] * 4)].join(',');
    const cur = clusters.get(key) || { x: 0, y: 0, z: 0, a: 0 };
    cur.x += n[0] * n[3]; cur.y += n[1] * n[3]; cur.z += n[2] * n[3]; cur.a += n[3];
    clusters.set(key, cur);
  }
  const dirs = [[0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
  const ranked = [...clusters.values()].sort((a, b) => b.a - a.a).slice(0, 6);
  for (const c of ranked) dirs.push([c.x, c.y, c.z]);
  let best = pos;
  let bestScore = Infinity;
  for (const d of dirs) {
    const turned = rotateTo(pos, d, [0, -1, 0]);
    for (const yaw of [0, 90, 180, 270]) {
      const spun = yaw ? rotateAbout(turned, 'y', yaw, [0, 0, 0]) : turned;
      const b = bounds(spun);
      const h = b.max[1] - b.min[1];
      const score = h + overhangArea(spun) * 0.02;
      if (score < bestScore) { bestScore = score; best = spun; }
    }
  }
  return best;
}

function hitX(pos, i, y, z) {
  const ay = pos[i + 1], az = pos[i + 2];
  const by = pos[i + 4] - ay, bz = pos[i + 5] - az;
  const cy = pos[i + 7] - ay, cz = pos[i + 8] - az;
  const py = y - ay, pz = z - az;
  const dot00 = by * by + bz * bz;
  const dot01 = by * cy + bz * cz;
  const dot02 = by * py + bz * pz;
  const dot11 = cy * cy + cz * cz;
  const dot12 = cy * py + cz * pz;
  const den = dot00 * dot11 - dot01 * dot01;
  if (Math.abs(den) < 1e-14) return null;
  const inv = 1 / den;
  const u = (dot11 * dot02 - dot01 * dot12) * inv;
  const v = (dot00 * dot12 - dot01 * dot02) * inv;
  if (u < -1e-5 || v < -1e-5 || u + v > 1 + 1e-5) return null;
  const w = 1 - u - v;
  return pos[i] * w + pos[i + 3] * u + pos[i + 6] * v;
}

function voxelize(pos, maxRes) {
  const b = bounds(pos);
  const size = [b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]];
  const maxDim = Math.max(size[0], size[1], size[2], 1e-6);
  const nLong = maxRes;
  const nx = Math.max(6, Math.round(nLong * size[0] / maxDim));
  const ny = Math.max(6, Math.round(nLong * size[1] / maxDim));
  const nz = Math.max(6, Math.round(nLong * size[2] / maxDim));
  const dx = size[0] / nx, dy = size[1] / ny, dz = size[2] / nz;
  const solid = new Uint8Array(nx * ny * nz);
  const buckets = new Array(ny * nz);
  for (let i = 0; i < buckets.length; i++) buckets[i] = [];
  const ntri = (pos.length / 9) | 0;
  for (let t = 0; t < ntri; t++) {
    const i = t * 9;
    let y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let k = 0; k < 3; k++) {
      const y = pos[i + k * 3 + 1], z = pos[i + k * 3 + 2];
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (z < z0) z0 = z; if (z > z1) z1 = z;
    }
    let iy0 = Math.floor((y0 - b.min[1]) / dy) - 1;
    let iy1 = Math.floor((y1 - b.min[1]) / dy) + 1;
    let iz0 = Math.floor((z0 - b.min[2]) / dz) - 1;
    let iz1 = Math.floor((z1 - b.min[2]) / dz) + 1;
    if (iy0 < 0) iy0 = 0; if (iy1 >= ny) iy1 = ny - 1;
    if (iz0 < 0) iz0 = 0; if (iz1 >= nz) iz1 = nz - 1;
    for (let iy = iy0; iy <= iy1; iy++) {
      for (let iz = iz0; iz <= iz1; iz++) buckets[iy * nz + iz].push(i);
    }
  }
  for (let iy = 0; iy < ny; iy++) {
    const y = b.min[1] + (iy + 0.37) * dy;
    for (let iz = 0; iz < nz; iz++) {
      const z = b.min[2] + (iz + 0.37) * dz;
      const hits = [];
      const list = buckets[iy * nz + iz];
      for (let q = 0; q < list.length; q++) {
        const x = hitX(pos, list[q], y, z);
        if (x !== null && x >= b.min[0] - dx && x <= b.max[0] + dx) hits.push(x);
      }
      if (hits.length < 2) continue;
      hits.sort((a, c) => a - c);
      const clean = [];
      for (const h of hits) {
        if (!clean.length || h - clean[clean.length - 1] > dx * 0.08) clean.push(h);
      }
      if (clean.length % 2) clean.pop();
      for (let h = 0; h + 1 < clean.length; h += 2) {
        let x0 = Math.floor((clean[h] - b.min[0]) / dx);
        let x1 = Math.floor((clean[h + 1] - b.min[0]) / dx);
        if (x0 < 0) x0 = 0;
        if (x1 >= nx) x1 = nx - 1;
        for (let ix = x0; ix <= x1; ix++) solid[ix + nx * (iy + ny * iz)] = 1;
      }
    }
  }
  return { solid, nx, ny, nz, dx, dy, dz, origin: b.min };
}

function idxOf(ix, iy, iz, nx, ny) { return ix + nx * (iy + ny * iz); }

function shellFromSolid(grid, wallMm) {
  const { solid, nx, ny, nz, dx, dy, dz } = grid;
  const shell = new Uint8Array(solid.length);
  const r = Math.max(dx, dy, dz);
  const rad = Math.max(1, Math.ceil(wallMm / Math.min(dx, dy, dz)));
  const r2 = wallMm * wallMm;
  for (let iz = 0; iz < nz; iz++) {
    for (let iy = 0; iy < ny; iy++) {
      for (let ix = 0; ix < nx; ix++) {
        const id = idxOf(ix, iy, iz, nx, ny);
        if (!solid[id]) continue;
        let deep = true;
        for (let dzv = -rad; dzv <= rad && deep; dzv++) {
          const z2 = iz + dzv;
          if (z2 < 0 || z2 >= nz) { deep = false; break; }
          for (let dyv = -rad; dyv <= rad && deep; dyv++) {
            const y2 = iy + dyv;
            if (y2 < 0 || y2 >= ny) { deep = false; break; }
            for (let dxv = -rad; dxv <= rad; dxv++) {
              const x2 = ix + dxv;
              const dist2 = (dxv * dx) * (dxv * dx) + (dyv * dy) * (dyv * dy) + (dzv * dz) * (dzv * dz);
              if (dist2 > r2) continue;
              if (x2 < 0 || x2 >= nx || !solid[idxOf(x2, y2, z2, nx, ny)]) { deep = false; break; }
            }
          }
        }
        if (!deep) shell[id] = 1;
      }
    }
  }
  if (r < wallMm * 0.25 && !shell.some(v => v)) {
    solid.forEach((v, i) => { if (v) shell[i] = 1; });
  }
  return shell;
}

function punchDrains(shell, solid, grid, count, dia) {
  if (count <= 0 || dia <= 0) return;
  const { nx, ny, nz, dx, dz, origin } = grid;
  const cands = [];
  for (let iz = 0; iz < nz; iz++) {
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        if (shell[idxOf(ix, iy, iz, nx, ny)]) {
          cands.push({ ix, iy, iz, x: origin[0] + (ix + 0.5) * dx, z: origin[2] + (iz + 0.5) * dz });
          break;
        }
      }
    }
  }
  if (!cands.length) return;
  cands.sort((a, b) => a.x - b.x);
  const picks = [];
  const slots = Math.min(count, cands.length);
  for (let s = 0; s < slots; s++) {
    const at = Math.round((s + 0.5) * (cands.length / slots) - 0.5);
    picks.push(cands[Math.max(0, Math.min(cands.length - 1, at))]);
  }
  const r = dia / 2;
  for (const p of picks) {
    for (let iz = 0; iz < nz; iz++) {
      const z = origin[2] + (iz + 0.5) * dz;
      for (let ix = 0; ix < nx; ix++) {
        const x = origin[0] + (ix + 0.5) * dx;
        if (Math.hypot(x - p.x, z - p.z) > r) continue;
        let seen = false;
        for (let iy = 0; iy < ny; iy++) {
          const id = idxOf(ix, iy, iz, nx, ny);
          if (shell[id]) { shell[id] = 0; seen = true; continue; }
          if (seen && !solid[id]) break;
        }
      }
    }
  }
}

function meshFromVoxels(mask, grid) {
  const { nx, ny, nz, dx, dy, dz, origin } = grid;
  const arr = [];
  const on = (ix, iy, iz) => ix >= 0 && iy >= 0 && iz >= 0 && ix < nx && iy < ny && iz < nz && mask[idxOf(ix, iy, iz, nx, ny)];
  for (let iz = 0; iz < nz; iz++) {
    const z0 = origin[2] + iz * dz, z1 = z0 + dz;
    for (let iy = 0; iy < ny; iy++) {
      const y0 = origin[1] + iy * dy, y1 = y0 + dy;
      for (let ix = 0; ix < nx; ix++) {
        if (!on(ix, iy, iz)) continue;
        const x0 = origin[0] + ix * dx, x1 = x0 + dx;
        if (!on(ix - 1, iy, iz)) pushQuad(arr, [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]);
        if (!on(ix + 1, iy, iz)) pushQuad(arr, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]);
        if (!on(ix, iy - 1, iz)) pushQuad(arr, [x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0]);
        if (!on(ix, iy + 1, iz)) pushQuad(arr, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]);
        if (!on(ix, iy, iz - 1)) pushQuad(arr, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]);
        if (!on(ix, iy, iz + 1)) pushQuad(arr, [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]);
      }
    }
  }
  return ensureOutward(new Float32Array(arr));
}

export function hollowModel(pos, wallMm, drainCount, drainDia, maxRes) {
  const wall = Math.max(0.4, +wallMm || 2);
  const res = Math.max(16, Math.min(56, maxRes || 40));
  const grid = voxelize(pos, res);
  let filled = 0;
  for (let i = 0; i < grid.solid.length; i++) filled += grid.solid[i];
  if (filled < 8) {
    return { ok: false, positions: pos, message: 'This mesh could not be hollowed. It may be open or too small for the voxel grid.' };
  }
  const shell = shellFromSolid(grid, wall);
  punchDrains(shell, grid.solid, grid, Math.max(0, drainCount | 0), Math.max(0, +drainDia || 0));
  const mesh = meshFromVoxels(shell, grid);
  if (mesh.length < 36) {
    return { ok: false, positions: pos, message: 'Hollowing produced an empty shell. Try a thinner wall.' };
  }
  return {
    ok: true,
    positions: mesh,
    message: 'Hollow shell is a voxel approximation at about ' + grid.dx.toFixed(2) + ' mm. Confirm the wall in your slicer.'
  };
}

export function buildSupports(pos, spacingMm, tipMm) {
  let spacing = Math.max(1.5, +spacingMm || 4);
  const tip = Math.max(0.15, Math.min(1.2, +tipMm || 0.4));
  const shaft = Math.max(tip * 2.4, 0.5);
  const cells = new Map();
  const consider = (map) => {
    map.clear();
    for (let i = 0; i < pos.length; i += 9) {
      const n = triNormal(pos, i);
      if (n[1] >= -0.22) continue;
      const x = (pos[i] + pos[i + 3] + pos[i + 6]) / 3;
      const y = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3;
      const z = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3;
      if (y < 0.6) continue;
      const key = Math.round(x / spacing) + ',' + Math.round(z / spacing);
      const prev = map.get(key);
      if (!prev || y < prev.y) map.set(key, { x, y, z });
    }
  };
  consider(cells);
  while (cells.size > 700) {
    spacing *= 1.25;
    consider(cells);
  }
  if (!cells.size) return { ok: true, positions: new Float32Array(0), count: 0, message: 'No overhangs needed supports. The underside already sits near the plate.' };
  const parts = [];
  for (const p of cells.values()) {
    const tipH = Math.min(1.4, Math.max(0.4, p.y * 0.25));
    const yTip = Math.max(0, p.y - tipH);
    if (yTip > 0.15) parts.push(cylinder(p.x, p.z, 0, yTip, shaft, 6));
    parts.push(cone(p.x, p.z, yTip, p.y, shaft, tip, 6));
  }
  return {
    ok: true,
    positions: ensureOutward(merge(parts)),
    count: cells.size,
    message: cells.size + ' supports at ' + spacing.toFixed(1) + ' mm spacing.'
  };
}

export function fitsPlate(pos, size) {
  const b = bounds(pos);
  const w = b.max[0] - b.min[0];
  const d = b.max[2] - b.min[2];
  const h = b.max[1] - b.min[1];
  return {
    width: w, depth: d, height: h,
    over: w > size[0] + 0.2 || d > size[1] + 0.2 || h > size[2] + 0.2
  };
}

export function estimate(pos, opt) {
  const b = bounds(pos);
  const height = Math.max(0, b.max[1] - b.min[1]);
  const ml = volumeMm3(pos) / 1000;
  const layer = Math.max(0.01, +opt.layerHeight || 0.05);
  const layers = height <= 0 ? 0 : Math.ceil(height / layer);
  const per = Math.max(0, +opt.exposure || 0) + Math.max(0, +opt.move || 0);
  const seconds = layers * per;
  const price = Math.max(0, +opt.pricePerMl || 0);
  return { height, ml, layers, seconds, cost: ml * price };
}

export function formatDuration(seconds) {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return h + ' h ' + m + ' min';
  return m + ' min';
}

export const RESINS = [
  { id: 'model', name: 'Model', exposure: 2.5, pricePerMl: 0.18 },
  { id: 'die', name: 'Die', exposure: 3.0, pricePerMl: 0.22 },
  { id: 'splint', name: 'Splint', exposure: 4.0, pricePerMl: 0.28 },
  { id: 'guide', name: 'Surgical guide', exposure: 5.0, pricePerMl: 0.4 }
];
