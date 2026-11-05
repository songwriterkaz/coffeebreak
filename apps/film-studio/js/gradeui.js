'use strict';
// Grade tab: film looks, wheels, curves, LUTs, lens and film effects
(function (CB) {
  const S = CB.S, $ = CB.$, $$ = CB.$$, esc = CB.esc;
  const G = () => S.p.grade || (S.p.grade = CB.defaultGrade());
  const clone = (o) => JSON.parse(JSON.stringify(o));

  CB.gradeFromLook = function (id) {
    const d = CB.defaultGrade(); const look = CB.GRADE_LOOKS.find(l => l.id === id); if (!look) return d;
    const g = clone(look.g);
    Object.keys(g).forEach(k => {
      if (k === 'curves') Object.assign(d.curves, g.curves);
      else if (k === 'lift' || k === 'gamma' || k === 'gain') Object.assign(d[k], g[k]);
      else d[k] = g[k];
    });
    d.look = id; return d;
  };

  const sl = (k, label, min, max, step, tip, unit) => {
    const v = G()[k]; return '<div class="irow"' + (tip ? ' data-tip="' + esc(tip) + '"' : '') + '><label>' + label + '</label><input type="range" data-g="' + k + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + v + '"><output>' + v + (unit == null ? '' : unit) + '</output></div>';
  };

  CB.renderGrade = function () {
    const box = $('#gradeBox'); if (!box) return; const g = G();
    const gl = CB.previewGrader();
    let h = '';
    if (!gl.ok()) h += '<div class="sect"><div class="note warn">Colour grading needs WebGL2, which this browser does not offer. Your project keeps its grade settings, but the preview and export will skip them.</div></div>';
    h += '<div class="sect"><h4>Film looks</h4><div class="looks">' +
      CB.GRADE_LOOKS.map(l => '<button class="look' + (g.look === l.id ? ' on' : '') + '" data-look="' + l.id + '" data-tip="' + esc(l.desc) + '"><i style="background:linear-gradient(135deg,' + l.sw[0] + ',' + l.sw[1] + ')"></i><span>' + l.name + '</span></button>').join('') +
      '</div><div class="small">A look sets every control below. Then fine tune it.</div></div>';
    h += '<div class="sect"><h4>Colour</h4>' + sl('exposure', 'Exposure', -2, 2, 0.05, 'Brighter or darker, in stops') + sl('contrast', 'Contrast', -60, 80, 1) + sl('sat', 'Saturation', 0, 200, 1, 'Colour strength', '%') + sl('temp', 'Warmth', -60, 60, 1, 'Cool blue to warm amber') + sl('tint', 'Tint', -60, 60, 1, 'Green to magenta') + '</div>';
    h += '<div class="sect"><h4>Lift, gamma, gain</h4><div class="wheels">' +
      ['lift:Shadows', 'gamma:Midtones', 'gain:Highlights'].map(s => { const [k, l] = s.split(':'); return '<div class="wheel"><canvas data-w="' + k + '" width="172" height="172" data-tip="Drag to tint the ' + l.toLowerCase() + '. Double-click to centre."></canvas><b>' + l + '</b><input type="range" data-wl="' + k + '" min="-1" max="1" step="0.02" value="' + g[k].l + '" aria-label="' + l + ' brightness" data-tip="' + l + ' brightness"></div>'; }).join('') +
      '</div></div>';
    h += '<div class="sect"><h4>Curves</h4><div class="seg" id="curveSeg">' + ['m:Master', 'r:Red', 'g:Green', 'b:Blue'].map((s, i) => { const [k, l] = s.split(':'); return '<button data-c="' + k + '" class="' + (i === 0 ? 'on' : '') + '">' + l + '</button>'; }).join('') +
      '</div><canvas id="curveCv" width="520" height="380"></canvas><div class="small">Click to add a point, drag to bend, double-click a point to remove it.</div><button id="curveReset" class="mini">Reset this curve</button></div>';
    const luts = Array.from(CB.luts.keys());
    h += '<div class="sect"><h4>LUT</h4><div class="irow"><label>Colour LUT</label><select id="lutSel"><option value="">None</option>' + luts.map(n => '<option value="' + esc(n) + '"' + (g.lut === n ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select></div>' + sl('lutAmt', 'Strength', 0, 100, 1, 'How much of the LUT to apply', '%') +
      '<div class="row2"><button id="lutImport" class="mini" data-tip="Import a 3D .cube LUT from your device">Import .cube</button><button id="lutRemove" class="mini" data-tip="Remove the selected LUT from this browser">Remove</button></div><input type="file" id="lutFile" accept=".cube,text/plain" hidden><div class="small">Supports 3D .cube files. LUTs stay in this browser. Save a project and it remembers the LUT name; import the file again on another device.</div></div>';
    h += '<div class="sect"><h4>Film and lens</h4>' + sl('grain', 'Film grain', 0, 100, 1, 'Moving film grain', '%') + sl('grainSize', 'Grain size', 0, 100, 1) +
      sl('vig', 'Vignette', 0, 100, 1, 'Darken the corners', '%') + sl('vigSoft', 'Softness', 0, 100, 1) +
      sl('glow', 'Glow', 0, 100, 1, 'Soft bloom around bright areas', '%') + sl('glowThr', 'Glow from', 20, 95, 1, 'Only areas brighter than this glow', '%') + sl('halation', 'Halation', 0, 100, 1, 'Warm red halo around highlights, like real film', '%') +
      sl('chroma', 'Lens fringing', 0, 100, 1, 'Colour fringes towards the edges', '%') +
      '<div class="irow"><label>Light leaks</label><select data-g="leak">' + CB.LEAKS.map(l => '<option value="' + l[0] + '"' + (g.leak === l[0] ? ' selected' : '') + '>' + l[1] + '</option>').join('') + '</select></div>' + sl('leakAmt', 'Leak strength', 0, 100, 1, '', '%') +
      sl('mblur', 'Motion blur', 0, 100, 1, 'Blends frames for a smoother, filmic motion trail', '%') +
      '<div class="irow"><label>Letterbox bars</label><select data-g="bars"><option value="none">None</option><option value="2.39">2.39:1</option><option value="1.85">1.85:1</option></select></div>' +
      '<div class="small">Bars sit on top of the picture. To change the project shape itself, use the picture shape menu at the top.</div></div>';
    h += '<div class="sect"><button id="gradeReset" class="wide" data-tip="Remove the whole grade">Reset grade</button></div>';
    box.innerHTML = h;
    bindGrade(box);
  };

  function setG(fn, key) { CB.mutate(() => { fn(G()); G().look = 'custom'; }, 'g:' + key); }

  function bindGrade(box) {
    $$('[data-look]', box).forEach(b => b.onclick = () => { CB.mutate(() => { S.p.grade = CB.gradeFromLook(b.dataset.look); }); CB.renderGrade(); });
    $$('input[data-g]', box).forEach(el => {
      const k = el.dataset.g, out = el.parentElement.querySelector('output');
      const unit = out ? out.textContent.replace(/^-?[\d.]+/, '') : '';
      el.oninput = () => { const v = parseFloat(el.value); if (out) out.textContent = v + unit; setG(g => { g[k] = v; }, k); };
    });
    $$('select[data-g]', box).forEach(el => {
      const k = el.dataset.g; el.value = G()[k]; el.onchange = () => { setG(g => { g[k] = el.value; if (k === 'leak' && el.value !== 'none' && !g.leakAmt) g.leakAmt = 40; }, k); if (k === 'leak') CB.renderGrade(); };
    });
    $$('input[data-wl]', box).forEach(el => { el.oninput = () => { setG(g => { g[el.dataset.wl].l = parseFloat(el.value); }, 'wl' + el.dataset.wl); }; el.ondblclick = () => { el.value = 0; el.oninput(); }; });
    $$('canvas[data-w]', box).forEach(cv => { drawWheel(cv); wheelEvents(cv); });
    // curves
    let ch = 'm'; const cc = $('#curveCv', box);
    $$('#curveSeg button', box).forEach(b => b.onclick = () => { ch = b.dataset.c; $$('#curveSeg button', box).forEach(x => x.classList.toggle('on', x === b)); drawCurve(cc, ch); });
    curveEvents(cc, () => ch); drawCurve(cc, ch);
    $('#curveReset', box).onclick = () => { CB.mutate(() => { G().curves[ch] = [[0, 0], [1, 1]]; G().look = 'custom'; }); drawCurve(cc, ch); };
    // LUT
    const ls = $('#lutSel', box);
    ls.onchange = () => setG(g => { g.lut = ls.value; }, 'lut');
    const lf = $('#lutFile', box);
    $('#lutImport', box).onclick = () => lf.click();
    lf.onchange = async () => {
      const f = lf.files[0]; if (!f) return;
      try { const name = f.name.replace(/\.cube$/i, '').slice(0, 40); await CB.addLut(name, await f.text()); CB.mutate(() => { G().lut = name; G().lutAmt = 100; G().look = 'custom'; }); CB.renderGrade(); CB.toast('LUT ' + name + ' added'); }
      catch (e) { CB.toast(e.message || 'Could not read that LUT', 5000); }
      lf.value = '';
    };
    $('#lutRemove', box).onclick = async () => { const n = G().lut; if (!n) return CB.toast('Choose a LUT to remove'); await CB.removeLut(n); CB.mutate(() => { G().lut = ''; }); CB.renderGrade(); };
    $('#gradeReset', box).onclick = () => { CB.mutate(() => { S.p.grade = CB.defaultGrade(); }); CB.renderGrade(); CB.toast('Grade reset'); };
  }

  // ----- wheels -----
  function drawWheel(cv) {
    const k = cv.dataset.w, w = G()[k], n = cv.width, ctx = cv.getContext('2d'), r = n / 2 - 5;
    if (!cv._img) {
      const im = ctx.createImageData(n, n);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const dx = (x + 0.5 - n / 2) / r, dy = -(y + 0.5 - n / 2) / r, d = Math.hypot(dx, dy), i = (y * n + x) * 4;
        if (d > 1.02) { im.data[i + 3] = 0; continue; }
        const rr = dx, gg = -0.5 * dx + 0.866 * dy, bb = -0.5 * dx - 0.866 * dy;
        im.data[i] = Math.max(0, Math.min(255, 255 * (0.34 + 0.62 * rr))); im.data[i + 1] = Math.max(0, Math.min(255, 255 * (0.34 + 0.62 * gg))); im.data[i + 2] = Math.max(0, Math.min(255, 255 * (0.34 + 0.62 * bb)));
        im.data[i + 3] = d > 1 ? Math.round(255 * (1.02 - d) / 0.02) : 255;
      }
      cv._img = im;
    }
    ctx.clearRect(0, 0, n, n); ctx.putImageData(cv._img, 0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n / 2, n / 2, r, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(n / 2 - 8, n / 2); ctx.lineTo(n / 2 + 8, n / 2); ctx.moveTo(n / 2, n / 2 - 8); ctx.lineTo(n / 2, n / 2 + 8); ctx.stroke();
    const px = n / 2 + w.x * r, py = n / 2 - w.y * r;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#150b12'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill(); ctx.stroke();
  }
  function wheelEvents(cv) {
    const k = cv.dataset.w;
    const at = (e) => { const b = cv.getBoundingClientRect(), n = cv.width, r = n / 2 - 5, s = n / b.width; let x = ((e.clientX - b.left) * s - n / 2) / r, y = -((e.clientY - b.top) * s - n / 2) / r; const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; } return [x, y]; };
    const apply = (e) => { const [x, y] = at(e); setG(g => { g[k].x = +x.toFixed(3); g[k].y = +y.toFixed(3); }, 'w' + k); drawWheel(cv); };
    cv.onpointerdown = (e) => { cv.setPointerCapture(e.pointerId); apply(e); cv.onpointermove = apply; };
    cv.onpointerup = cv.onpointercancel = () => { cv.onpointermove = null; };
    cv.ondblclick = () => { setG(g => { g[k].x = 0; g[k].y = 0; }, 'w' + k); drawWheel(cv); };
  }

  // ----- curves -----
  const CCOL = { m: '#ffd6e6', r: '#ff5a6e', g: '#6bdc8a', b: '#6aa8ff' };
  function drawCurve(cv, ch) {
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, pts = G().curves[ch] || [[0, 0], [1, 1]];
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#120a10'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#3d2434'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(i * W / 4, 0); ctx.lineTo(i * W / 4, H); ctx.moveTo(0, i * H / 4); ctx.lineTo(W, i * H / 4); ctx.stroke(); }
    ctx.strokeStyle = '#5a3349'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, 0); ctx.stroke();
    const lut = CB.curveLUT(pts); ctx.strokeStyle = CCOL[ch]; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i < 256; i++) { const x = i / 255 * W, y = H - lut[i] * H; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#fff'; pts.forEach(p => { ctx.beginPath(); ctx.arc(p[0] * W, H - p[1] * H, 8, 0, 7); ctx.fill(); ctx.strokeStyle = '#150b12'; ctx.lineWidth = 2; ctx.stroke(); });
  }
  function curveEvents(cv, getCh) {
    let drag = null;
    const pos = (e) => { const b = cv.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)), Math.max(0, Math.min(1, 1 - (e.clientY - b.top) / b.height))]; };
    const near = (pts, p, b) => { let bi = -1, bd = 1e9; pts.forEach((q, i) => { const d = Math.hypot((q[0] - p[0]) * b.width, (q[1] - p[1]) * b.height); if (d < bd) { bd = d; bi = i; } }); return bd < 14 ? bi : -1; };
    cv.onpointerdown = (e) => {
      cv.setPointerCapture(e.pointerId); const ch = getCh(), b = cv.getBoundingClientRect(), p = pos(e);
      let pts = G().curves[ch]; let i = near(pts, p, b);
      CB.mutate(() => { if (i < 0) { pts.push(p); pts.sort((a, c) => a[0] - c[0]); i = pts.indexOf(p); } G().curves[ch] = pts; G().look = 'custom'; }, 'cv' + ch);
      drag = pts[i]; drawCurve(cv, ch);
    };
    cv.onpointermove = (e) => {
      if (!drag) return; const ch = getCh(), pts = G().curves[ch], p = pos(e), i = pts.indexOf(drag);
      CB.mutate(() => { if (i > 0 && i < pts.length - 1) { drag[0] = Math.max(pts[i - 1][0] + 0.02, Math.min(pts[i + 1][0] - 0.02, p[0])); } drag[1] = p[1]; G().look = 'custom'; }, 'cv' + ch);
      drawCurve(cv, ch);
    };
    cv.onpointerup = cv.onpointercancel = () => { drag = null; };
    cv.ondblclick = (e) => { const ch = getCh(), pts = G().curves[ch], i = near(pts, pos(e), cv.getBoundingClientRect()); if (i > 0 && i < pts.length - 1) { CB.mutate(() => { pts.splice(i, 1); G().look = 'custom'; }); drawCurve(cv, ch); } };
  }

  CB.on((w) => { if (w === 'full') CB.renderGrade(); });
})(window.CB);
