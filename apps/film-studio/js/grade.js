'use strict';
// Colour grading, film look and lens effects. A WebGL2 pass runs over each finished frame
// (preview and export use the same code).
(function (CB) {
  const S = { get p() { return CB.S.p; } };
  const ID = [[0, 0], [1, 1]];
  const W0 = () => ({ x: 0, y: 0, l: 0 });
  CB.defaultGrade = () => ({
    look: 'none', exposure: 0, contrast: 0, sat: 100, temp: 0, tint: 0,
    lift: W0(), gamma: W0(), gain: W0(),
    curves: { m: ID.map(p => p.slice()), r: ID.map(p => p.slice()), g: ID.map(p => p.slice()), b: ID.map(p => p.slice()) },
    lut: '', lutAmt: 100,
    grain: 0, grainSize: 40, vig: 0, vigSoft: 50, glow: 0, glowThr: 60, halation: 0, chroma: 0,
    leak: 'none', leakAmt: 0, mblur: 0, bars: 'none'
  });
  const DEF_JSON = JSON.stringify(CB.defaultGrade());
  CB.gradeActive = (g) => !!g && JSON.stringify(g) !== DEF_JSON;
  CB.mergeGrade = (g) => {
    const d = CB.defaultGrade(); if (!g) return d;
    const o = Object.assign(d, g);
    ['lift', 'gamma', 'gain'].forEach(k => { o[k] = Object.assign(W0(), g[k] || {}); });
    o.curves = Object.assign(d.curves, g.curves || {});
    return o;
  };

  // ---------- film looks (parameter presets) ----------
  const curveS = (a) => [[0, 0], [0.25, 0.25 - a], [0.75, 0.75 + a], [1, 1]];
  const curveFade = (b, t) => [[0, b], [0.25, 0.25 + b * 0.5], [0.75, 0.75 + t * 0.3], [1, 1 - t]];
  CB.GRADE_LOOKS = [
    { id: 'none', name: 'None', desc: 'No grade', sw: ['#555', '#999'], g: {} },
    { id: 'warmprint', name: 'Warm Print', desc: 'Soft warm print stock with gentle contrast', sw: ['#5b3a24', '#f0c08a'], g: { temp: 14, contrast: 12, sat: 108, gain: { x: 0.5, y: 0.2, l: 0 }, lift: { x: 0.2, y: 0.1, l: 0.03 }, curves: { m: curveS(0.04) }, grain: 22, grainSize: 40, vig: 22, glow: 12, halation: 14 } },
    { id: 'tealorange', name: 'Teal and Orange', desc: 'Blockbuster split: teal shadows, warm skin', sw: ['#0f4a52', '#f08a3c'], g: { contrast: 16, sat: 112, lift: { x: -0.7, y: 0.25, l: 0 }, gain: { x: 0.75, y: 0.35, l: 0 }, curves: { m: curveS(0.05) }, grain: 14, vig: 26 } },
    { id: 'bleach', name: 'Bleach Bypass', desc: 'Silvery, harsh and desaturated', sw: ['#2a2d30', '#c9ccd0'], g: { sat: 52, contrast: 40, gamma: { x: 0, y: 0, l: -0.1 }, curves: { m: curveS(0.07) }, grain: 32, grainSize: 45, vig: 30 } },
    { id: 'faded70s', name: 'Faded 70s', desc: 'Lifted blacks, warm cast, soft glow', sw: ['#6a4b3a', '#e8c9a4'], g: { sat: 86, temp: 16, tint: 4, contrast: -6, lift: { x: 0.3, y: 0.1, l: 0.35 }, gain: { x: 0.35, y: 0.25, l: -0.05 }, grain: 40, grainSize: 50, vig: 32, glow: 20, leak: 'warm', leakAmt: 22 } },
    { id: 'noir', name: 'Noir', desc: 'High contrast black and white with grain', sw: ['#050505', '#d9d9d9'], g: { sat: 0, contrast: 40, curves: { m: curveS(0.08) }, grain: 42, grainSize: 45, vig: 50, vigSoft: 60 } },
    { id: 'coldthriller', name: 'Cold Thriller', desc: 'Cool steel blue, tight contrast', sw: ['#122338', '#a9c2d8'], g: { temp: -24, sat: 80, contrast: 24, lift: { x: -0.4, y: -0.5, l: 0 }, curves: { m: curveS(0.05) }, grain: 18, vig: 36 } },
    { id: 'pastelpink', name: 'Pastel Pink', desc: 'Coffeebreak soft pink dream', sw: ['#a04a73', '#ffd2e4'], g: { exposure: 0.1, temp: 6, sat: 112, contrast: -8, lift: { x: 0.45, y: -0.35, l: 0.22 }, gain: { x: 0.4, y: -0.3, l: 0 }, glow: 38, glowThr: 50, halation: 22, grain: 10, vig: 14 } },
    { id: 'goldenhour', name: 'Golden Hour', desc: 'Late sun, amber highlights, bloom', sw: ['#5a3414', '#ffcf7a'], g: { exposure: 0.06, temp: 30, sat: 112, contrast: 8, gain: { x: 0.7, y: 0.45, l: 0 }, glow: 32, halation: 26, vig: 20, leak: 'gold', leakAmt: 30, grain: 14 } },
    { id: 'neon', name: 'Neon Night', desc: 'Magenta and blue night, lens fringing', sw: ['#1b0f4a', '#ff3fa4'], g: { sat: 135, contrast: 28, lift: { x: -0.2, y: -0.8, l: 0 }, gain: { x: 0.2, y: -0.7, l: 0 }, glow: 46, glowThr: 45, chroma: 28, vig: 30, grain: 12 } },
    { id: 'silverscreen', name: 'Silver Screen', desc: 'Old studio black and white, flicker and glow', sw: ['#111', '#eee'], g: { sat: 0, contrast: 26, curves: { m: curveFade(0.04, 0.03) }, grain: 56, grainSize: 60, vig: 56, glow: 26, mblur: 18 } },
    { id: 'super8', name: 'Super 8', desc: 'Home movie grain, fringing and light leaks', sw: ['#4b3a2a', '#e6c38f'], g: { sat: 92, temp: 14, contrast: -4, lift: { x: 0.3, y: 0.1, l: 0.3 }, grain: 70, grainSize: 70, vig: 50, chroma: 30, glow: 22, leak: 'warm', leakAmt: 42 } }
  ];

  // ---------- helpers ----------
  const wheelVec = (w, sw, sl) => {
    const x = w.x || 0, y = w.y || 0, l = w.l || 0;
    return [x * sw + l * sl, (-0.5 * x + 0.866 * y) * sw + l * sl, (-0.5 * x - 0.866 * y) * sw + l * sl];
  };
  CB.wheelVec = wheelVec;
  function curveLUT(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0]); const n = p.length;
    const out = new Float32Array(256);
    if (n < 2) { for (let i = 0; i < 256; i++) out[i] = i / 255; return out; }
    const dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = Math.max(1e-4, p[i + 1][0] - p[i][0]); m[i] = (p[i + 1][1] - p[i][1]) / dx[i]; }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    for (let i = 0; i < n - 1; i++) { if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; } else { const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; } } }
    for (let k = 0; k < 256; k++) {
      const x = k / 255; let v;
      if (x <= p[0][0]) v = p[0][1]; else if (x >= p[n - 1][0]) v = p[n - 1][1];
      else { let i = 0; while (i < n - 2 && x > p[i + 1][0]) i++; const h = dx[i], s = (x - p[i][0]) / h, s2 = s * s, s3 = s2 * s; v = (2 * s3 - 3 * s2 + 1) * p[i][1] + (s3 - 2 * s2 + s) * h * t[i] + (-2 * s3 + 3 * s2) * p[i + 1][1] + (s3 - s2) * h * t[i + 1]; }
      out[k] = Math.max(0, Math.min(1, v));
    }
    return out;
  }
  CB.curveLUT = curveLUT;
  const isId = (p) => p.length === 2 && p[0][0] === 0 && p[0][1] === 0 && p[1][0] === 1 && p[1][1] === 1;
  const curvesId = (c) => ['m', 'r', 'g', 'b'].every(k => !c[k] || isId(c[k]));

  // ---------- .cube LUTs ----------
  CB.luts = new Map();
  CB.parseCube = function (txt) {
    let N = 0, dmin = [0, 0, 0], dmax = [1, 1, 1]; const vals = [];
    for (let line of txt.split(/\r?\n/)) {
      line = line.trim(); if (!line || line[0] === '#') continue;
      const w = line.split(/\s+/);
      if (w[0] === 'LUT_3D_SIZE') N = parseInt(w[1], 10);
      else if (w[0] === 'LUT_1D_SIZE') throw new Error('This is a 1D LUT. Use a 3D .cube file.');
      else if (w[0] === 'DOMAIN_MIN') dmin = w.slice(1, 4).map(Number);
      else if (w[0] === 'DOMAIN_MAX') dmax = w.slice(1, 4).map(Number);
      else if (/^[-+0-9.]/.test(w[0]) && w.length >= 3) vals.push(+w[0], +w[1], +w[2]);
    }
    if (!N || N < 2 || N > 129) throw new Error('Not a valid 3D .cube file.');
    if (vals.length < N * N * N * 3) throw new Error('The .cube file is incomplete.');
    const data = new Uint8Array(N * N * N * 4);
    for (let i = 0; i < N * N * N; i++) for (let k = 0; k < 3; k++) { const v = (vals[i * 3 + k] - dmin[k]) / ((dmax[k] - dmin[k]) || 1); data[i * 4 + k] = Math.max(0, Math.min(255, Math.round(v * 255))); data[i * 4 + 3] = 255; }
    return { size: N, data };
  };
  CB.addLut = async function (name, txt, save) {
    const l = CB.parseCube(txt); l.ver = (CB.luts.get(name) || { ver: 0 }).ver + 1; CB.luts.set(name, l);
    if (save !== false) { await CB.idb.put('kv', 'lut:' + name, txt); const list = (await CB.idb.get('kv', 'lutlist')) || []; if (!list.includes(name)) list.push(name); await CB.idb.put('kv', 'lutlist', list); }
    return l;
  };
  CB.loadLuts = async function () {
    const list = (await CB.idb.get('kv', 'lutlist')) || [];
    for (const n of list) { const t = await CB.idb.get('kv', 'lut:' + n); if (t) { try { await CB.addLut(n, t, false); } catch (e) {} } }
  };
  CB.removeLut = async function (name) {
    CB.luts.delete(name); await CB.idb.del('kv', 'lut:' + name);
    const list = ((await CB.idb.get('kv', 'lutlist')) || []).filter(n => n !== name); await CB.idb.put('kv', 'lutlist', list);
  };

  // ---------- WebGL2 grader ----------
  const VS = '#version 300 es\nin vec2 p;out vec2 vUv;void main(){vUv=p*0.5+0.5;gl_Position=vec4(p,0.,1.);}';
  const FS_BLEND = '#version 300 es\nprecision highp float;uniform sampler2D uTex,uPrev;uniform float uK;in vec2 vUv;out vec4 o;void main(){o=vec4(mix(texture(uTex,vUv).rgb,texture(uPrev,vUv).rgb,uK),1.);}';
  const FS = `#version 300 es
precision highp float; precision highp sampler3D;
uniform sampler2D uTex, uCurve; uniform sampler3D uLut;
uniform vec2 uRes; uniform float uTime, uSeed;
uniform float uExp, uCon, uSat, uTemp, uTint, uLutAmt, uLutN, uUseLut, uUseCurve;
uniform vec3 uLift, uGamma, uGain;
uniform float uGrain, uGrainSize, uVig, uVigSoft, uGlow, uGlowThr, uHal, uChroma, uLeak, uLeakType, uBars;
in vec2 vUv; out vec4 o;
float hash(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
const vec3 LUM=vec3(.2126,.7152,.0722);
void main(){
  vec2 uv=vUv; vec3 c;
  if(uChroma>0.){ vec2 d=(uv-.5)*uChroma*.012; c=vec3(textureLod(uTex,uv+d,0.).r,textureLod(uTex,uv,0.).g,textureLod(uTex,uv-d,0.).b); }
  else c=textureLod(uTex,uv,0.).rgb;
  if(uGlow>0.||uHal>0.){
    vec3 b=(textureLod(uTex,uv,3.).rgb+textureLod(uTex,uv,4.).rgb+textureLod(uTex,uv,5.).rgb+textureLod(uTex,uv,6.).rgb)*.25;
    vec3 br=max(b-uGlowThr,0.)/(1.-uGlowThr+1e-3);
    c+=br*uGlow*vec3(1.,.93,.86)*1.3;
    c+=vec3(1.,.32,.1)*dot(br,vec3(.333))*uHal*1.6;
  }
  c*=exp2(uExp);
  c.r*=1.+uTemp*.16; c.b*=1.-uTemp*.16; c.g*=1.-uTint*.1;
  c=c+uLift*(1.-c);
  c=c*(1.+uGain);
  c=vec3(pow(max(c.r,0.),1./max(.15,1.+uGamma.r)),pow(max(c.g,0.),1./max(.15,1.+uGamma.g)),pow(max(c.b,0.),1./max(.15,1.+uGamma.b)));
  c=(c-.5)*(1.+uCon)+.5;
  float l=dot(c,LUM); c=mix(vec3(l),c,uSat);
  c=clamp(c,0.,1.);
  if(uUseCurve>.5){ c=vec3(texture(uCurve,vec2(c.r*.99609+.00195,.5)).r,texture(uCurve,vec2(c.g*.99609+.00195,.5)).g,texture(uCurve,vec2(c.b*.99609+.00195,.5)).b); }
  if(uUseLut>.5){ vec3 s=c*((uLutN-1.)/uLutN)+.5/uLutN; c=mix(c,texture(uLut,s).rgb,uLutAmt); }
  if(uLeak>0.){
    float t=uTime; vec2 p=uv*vec2(uRes.x/uRes.y,1.); float ar=uRes.x/uRes.y;
    float a1=exp(-pow(length((p-vec2(ar*(.02+.08*sin(t*.55)),.55+.3*sin(t*.37)))*vec2(1.,.55)),2.)*3.2);
    float a2=exp(-pow(length((p-vec2(ar*(.98+.06*sin(t*.43+1.)),.35+.3*sin(t*.29+2.)))*vec2(1.,.6)),2.)*4.5);
    vec3 c1=uLeakType<1.5?vec3(1.,.42,.08):uLeakType<2.5?vec3(1.,.28,.55):uLeakType<3.5?vec3(1.,.78,.25):vec3(.25,.55,1.);
    vec3 c2=uLeakType<1.5?vec3(1.,.15,.1):uLeakType<2.5?vec3(.9,.35,1.):uLeakType<3.5?vec3(1.,.5,.15):vec3(.6,.3,1.);
    vec3 lk=c1*a1+c2*a2; c=1.-(1.-c)*(1.-clamp(lk,0.,1.)*uLeak);
  }
  if(uVig>0.){ float d=length((uv-.5)*vec2(uRes.x/uRes.y,1.)); float e0=.2+.35*(1.-uVigSoft), e1=e0+.35+.55*uVigSoft; c*=1.-smoothstep(e0,e1,d)*uVig; }
  if(uGrain>0.){
    float gs=max(1.,uRes.y/1080.*(.7+uGrainSize*2.3)); vec2 gp=floor(gl_FragCoord.xy/gs);
    float n=hash(gp+uSeed*vec2(37.,17.))+hash(gp*1.71+uSeed*vec2(11.,53.))-1.;
    float ll=dot(c,LUM); float w=.35+.65*(1.-abs(2.*ll-1.));
    c+=n*uGrain*.42*w*vec3(1.,.98,.95);
  }
  c+=(hash(gl_FragCoord.xy+uSeed)-.5)/255.;
  if(uBars>0.){ float ar=uRes.x/uRes.y; if(ar<uBars){ float f=(1.-ar/uBars)*.5; if(uv.y<f||uv.y>1.-f) c=vec3(0.); } }
  o=vec4(clamp(c,0.,1.),1.);
}`;
  function mkProg(gl, vs, fs) {
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    return { p, u };
  }
  const LEAKS = { none: 0, warm: 1, pink: 2, gold: 3, cool: 4 };
  CB.LEAKS = [['none', 'None'], ['warm', 'Warm orange'], ['pink', 'Pink and violet'], ['gold', 'Golden'], ['cool', 'Cool blue']];

  CB.makeGrader = function () {
    const glc = document.createElement('canvas'); glc.width = 16; glc.height = 16;
    let gl = null, ok = false, prog, blend, tex, tex2, curveTex, lutTex, lutKey = '', fbo = [], fboTex = [], pi = 0, lastT = -1, size = '', seed = 0, curveKey = '', fail = '';
    const scratch = document.createElement('canvas');
    try {
      gl = glc.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
      if (gl) {
        prog = mkProg(gl, VS, FS); blend = mkProg(gl, VS, FS_BLEND);
        const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const mk = () => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); return t; };
        tex = mk();
        for (let i = 0; i < 2; i++) { fboTex[i] = mk(); fbo[i] = gl.createFramebuffer(); }
        curveTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, curveTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        lutTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_3D, lutTex);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        ['S', 'T', 'R'].forEach(a => gl.texParameteri(gl.TEXTURE_3D, gl['TEXTURE_WRAP_' + a], gl.CLAMP_TO_EDGE));
        ok = true;
      } else fail = 'WebGL2 is not available';
    } catch (e) { ok = false; fail = String(e.message || e); console.warn('grade', fail); }

    function alloc(W, H) {
      for (let i = 0; i < 2; i++) { gl.bindTexture(gl.TEXTURE_2D, fboTex[i]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[i]); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex[i], 0); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); lastT = -1;
    }
    function bind(unit, target, t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(target, t); }
    function setCurves(g) {
      const c = g.curves, key = JSON.stringify(c);
      if (curvesId(c)) return 0;
      if (key !== curveKey) {
        curveKey = key; const m = c.m ? curveLUT(c.m) : null, r = curveLUT(c.r || ID), gg = curveLUT(c.g || ID), b = curveLUT(c.b || ID);
        const d = new Uint8Array(256 * 4), f = (arr, x) => { const v = Math.max(0, Math.min(1, x)) * 255, i = Math.floor(v), fr = v - i; return arr[i] * (1 - fr) + arr[Math.min(255, i + 1)] * fr; };
        const mm = m || curveLUT(ID);
        for (let i = 0; i < 256; i++) { const x = mm[i]; d[i * 4] = Math.round(f(r, x) * 255); d[i * 4 + 1] = Math.round(f(gg, x) * 255); d[i * 4 + 2] = Math.round(f(b, x) * 255); d[i * 4 + 3] = 255; }
        bind(1, gl.TEXTURE_2D, curveTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, d);
      }
      return 1;
    }
    function setLut(g) {
      const l = g.lut && CB.luts.get(g.lut); if (!l) return 0;
      const key = g.lut + ':' + l.ver;
      if (key !== lutKey) { lutKey = key; bind(2, gl.TEXTURE_3D, lutTex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, l.size, l.size, l.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, l.data); }
      return l.size;
    }
    const api = {
      ok: () => ok, fail: () => fail, canvas: glc,
      scratch(W, H) { if (scratch.width !== W || scratch.height !== H) { scratch.width = W; scratch.height = H; } return scratch; },
      reset() { lastT = -1; },
      dispose() { try { const x = gl && gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) {} ok = false; glc.width = 1; glc.height = 1; scratch.width = 1; scratch.height = 1; },
      process(src, W, H, t, g) {
        if (!ok) return null;
        g = g || S.p.grade;
        if (glc.width !== W || glc.height !== H) { glc.width = W; glc.height = H; }
        if (size !== W + 'x' + H) { size = W + 'x' + H; alloc(W, H); }
        gl.viewport(0, 0, W, H); gl.disable(gl.BLEND);
        bind(0, gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        const lin = (t) => { gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); };
        lin(tex); lin(fboTex[0]); lin(fboTex[1]);
        let inTex = tex;
        const k = Math.max(0, Math.min(0.85, (g.mblur || 0) / 100 * 0.8));
        if (k > 0 && lastT >= 0 && t >= lastT - 0.001 && t - lastT < 0.3) {
          const prev = fboTex[pi], nx = 1 - pi;
          gl.useProgram(blend.p); bind(0, gl.TEXTURE_2D, tex); bind(1, gl.TEXTURE_2D, prev);
          gl.uniform1i(blend.u.uTex, 0); gl.uniform1i(blend.u.uPrev, 1); gl.uniform1f(blend.u.uK, k);
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[nx]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          pi = nx; inTex = fboTex[pi];
        } else if (k > 0) {
          // seed the feedback buffer with the current frame
          const nx = 1 - pi; gl.useProgram(blend.p); bind(0, gl.TEXTURE_2D, tex); bind(1, gl.TEXTURE_2D, tex);
          gl.uniform1i(blend.u.uTex, 0); gl.uniform1i(blend.u.uPrev, 1); gl.uniform1f(blend.u.uK, 0);
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[nx]); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
          pi = nx; inTex = fboTex[pi];
        }
        lastT = k > 0 ? t : -1;
        bind(0, gl.TEXTURE_2D, inTex);
        if (g.glow > 0 || g.halation > 0) { gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.generateMipmap(gl.TEXTURE_2D); }
        const useCurve = setCurves(g), lutN = setLut(g);
        const P = prog, u = P.u;
        gl.useProgram(P.p);
        bind(0, gl.TEXTURE_2D, inTex); bind(1, gl.TEXTURE_2D, curveTex); bind(2, gl.TEXTURE_3D, lutTex);
        gl.uniform1i(u.uTex, 0); gl.uniform1i(u.uCurve, 1); gl.uniform1i(u.uLut, 2);
        gl.uniform2f(u.uRes, W, H); gl.uniform1f(u.uTime, t || 0); seed = (seed + 1) % 997; gl.uniform1f(u.uSeed, seed * 0.713);
        gl.uniform1f(u.uExp, g.exposure || 0); gl.uniform1f(u.uCon, (g.contrast || 0) / 100); gl.uniform1f(u.uSat, (g.sat == null ? 100 : g.sat) / 100);
        gl.uniform1f(u.uTemp, (g.temp || 0) / 100); gl.uniform1f(u.uTint, (g.tint || 0) / 100);
        gl.uniform3fv(u.uLift, wheelVec(g.lift || W0(), 0.22, 0.2)); gl.uniform3fv(u.uGamma, wheelVec(g.gamma || W0(), 0.35, 0.45)); gl.uniform3fv(u.uGain, wheelVec(g.gain || W0(), 0.35, 0.5));
        gl.uniform1f(u.uUseCurve, useCurve); gl.uniform1f(u.uUseLut, lutN ? 1 : 0); gl.uniform1f(u.uLutN, lutN || 2); gl.uniform1f(u.uLutAmt, (g.lutAmt == null ? 100 : g.lutAmt) / 100);
        gl.uniform1f(u.uGrain, (g.grain || 0) / 100); gl.uniform1f(u.uGrainSize, (g.grainSize == null ? 40 : g.grainSize) / 100);
        gl.uniform1f(u.uVig, (g.vig || 0) / 100); gl.uniform1f(u.uVigSoft, (g.vigSoft == null ? 50 : g.vigSoft) / 100);
        gl.uniform1f(u.uGlow, (g.glow || 0) / 100); gl.uniform1f(u.uGlowThr, (g.glowThr == null ? 60 : g.glowThr) / 100); gl.uniform1f(u.uHal, (g.halation || 0) / 100);
        gl.uniform1f(u.uChroma, (g.chroma || 0) / 100 * 3);
        gl.uniform1f(u.uLeak, (g.leakAmt || 0) / 100 * (LEAKS[g.leak] ? 1 : 0)); gl.uniform1f(u.uLeakType, LEAKS[g.leak] || 0);
        gl.uniform1f(u.uBars, g.bars === 'none' || !g.bars ? 0 : parseFloat(g.bars));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return glc;
      }
    };
    return api;
  };

  // one grader for the preview
  let pv = null;
  CB.previewGrader = () => pv || (pv = CB.makeGrader());
  // render a frame, applying the project grade when it is active
  CB.renderFrame = function (ctx, W, H, t, gr) {
    const g = S.p.grade;
    if (!gr || !gr.ok() || !CB.gradeActive(g)) { CB.drawFrame(ctx, W, H, t); return false; }
    const sc = gr.scratch(W, H); CB.drawFrame(sc.getContext('2d'), W, H, t);
    const out = gr.process(sc, W, H, t, g);
    if (out) { ctx.drawImage(out, 0, 0, W, H); return true; }
    ctx.drawImage(sc, 0, 0); return false;
  };
})(window.CB);
