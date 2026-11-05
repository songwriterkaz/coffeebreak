(function(){
'use strict';
/* =========================================================
   MidwifeSim: engine
   ========================================================= */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function h(tag, attrs, html){ const e = document.createElement(tag); if (attrs) for (const k in attrs){ if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
function shuffle(a){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const fmtClock = m => { m = Math.round(m); const hh = Math.floor(m / 60) % 24, mm = m % 60; return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const STAGES = ['Admission', 'First stage', 'Second stage', 'Birth & newborn', 'Third stage', 'Debrief'];

/* ---------- birth canal geometry (curve of Carus) ---------- */
const CA = {x:215, y:290}, CC = {x:232, y:350}, CB = {x:172, y:398};
function canal(s){
  if (s < 0) return {x: CA.x + s * 2 * (CC.x - CA.x), y: CA.y + s * 2 * (CC.y - CA.y)};
  if (s > 1){ const t = s - 1; return {x: CB.x + t * 2 * (CB.x - CC.x), y: CB.y + t * 2 * (CB.y - CC.y)}; }
  const u = 1 - s; return {x: u*u*CA.x + 2*u*s*CC.x + s*s*CB.x, y: u*u*CA.y + 2*u*s*CC.y + s*s*CB.y};
}
function stationFromS(s){
  if (s <= 0) return s / 0.15;
  if (s <= 0.55) return s / 0.55 * 3;
  return Math.min(5, 3 + (s - 0.55) / 0.17 * 2);
}

/* ---------- state ---------- */
let SIM, P, F, FT, P3;
const N = 720; // CTG samples (0.1 s each)
let fhrBuf, tocoBuf, bufHead = 0, bufCount = 0;
let timers = [];
function later(fn, ms){ const id = setTimeout(fn, ms); timers.push(id); return id; }

function freshState(){
  SIM = { mode:'normal', comps:{brady:false, sd:false, pph:false}, compsRevealed:false, steps:[], idx:0,
          score:0, max:0, results:[], clock: 8*60 + 20, speed: (SIM && SIM.speed) || 1, ff:0,
          times:{}, apgar1:null, apgar5:null, eblEst:null, eblActual:null, born:false, pphActive:false, pphControlled:false, encountered:[] };
  P = { mhr:82, sys:118, dia:74, spo2:98, temp:36.8, rr:16, mhrT:82, sysT:118, diaT:74,
        fhrBase:140, fhrBaseT:140, fhr:140, fhrMode:'normal', varAmp:1, earlyDecels:false, accels:true, accelT:12, accelU:-1,
        toco:8, bell:0, cT:0, cPeriod:20, cDur:8, cAmp:35, cOn:true,
        dil:3, ebl:0, eblRate:0, eblCap:1500, pushing:false, ctgOn:false, fhrOn:true, ctgMsg:'Not connected: auscultate the fetal heart to begin',
        revealed:{}, t:0, bhr:146, uterusTone:'' };
  F  = { s:-0.42, ha:-6, ins:45, op:1, ox:0, oy:0 };
  FT = Object.assign({}, F);
  P3 = { k:0.6, kT:0.6, pp:0, ppT:0, placVis:true, clamp1:false, clamp2:false, cut:false, pink:0.25, pinkT:0.25, towel:false, hat:false, boggy:false, wob:0 };
  fhrBuf = new Float32Array(N).fill(NaN); tocoBuf = new Float32Array(N).fill(NaN); bufHead = 0; bufCount = 0;
}

/* ---------- helpers used by scenario steps ---------- */
function setFT(o){ Object.assign(FT, o); }
function snapF(){ Object.assign(F, FT); }
function contr(period, dur, amp){ P.cPeriod = period; P.cDur = dur; P.cAmp = amp; P.cOn = true; }
function reveal(){ for (const k of arguments) P.revealed[k] = true; renderTiles(true); }
function addMin(m){ SIM.clock += m; }
function annot(svg){ $('#annot').innerHTML = svg || ''; }
const CHIP_NAMES = ['Engagement','Descent','Flexion','Internal rotation','Extension','Restitution','External rotation','Expulsion'];
let chipState = {};
function chips(map){ chipState = Object.assign({}, map); renderChips(); }
function chip(name, st){ chipState[name] = st; renderChips(); }
function renderChips(){
  const el = $('#chips'); el.innerHTML = '';
  CHIP_NAMES.forEach(n => { const c = h('span', {class:'chip ' + (chipState[n] || '')}, n); el.append(c); });
}
function setScene(name){
  const post = name === 'post';
  $('#labourScene').style.display = post ? 'none' : '';
  $('#postScene').style.display = post ? '' : 'none';
  $('#fetus').style.display = post ? 'none' : '';
  $('#cervix').style.display = post ? 'none' : '';
  $('#inset').style.display = post ? 'none' : '';
  $('#illusTitle').textContent = post ? 'Sagittal schematic: third stage & newborn' : 'Sagittal schematic: pelvis, uterus & fetus';
}
function showDrape(on){ $('#drape').style.display = on ? 'block' : 'none'; }
function svgArrow(x1,y1,x2,y2,col){ const m = col === 'r' ? 'arR' : col === 'o' ? 'arO' : 'arT'; const c = col === 'r' ? '#d64b3c' : col === 'o' ? '#c98a00' : '#0b7a83';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" marker-end="url(#${m})" stroke-linecap="round"/>`; }
function svgLabel(x,y,t,col,anchor){ const c = col || '#0b7a83'; const w = t.length * 5.6 + 12;
  const ax = anchor === 'end' ? x - w : anchor === 'start' ? x : x - w/2;
  return `<g><rect x="${ax}" y="${y-11}" width="${w}" height="16" rx="8" fill="#fff" stroke="${c}" stroke-width="1.2" opacity=".96"/><text x="${ax + w/2}" y="${y+1}" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:${c}">${t}</text></g>`; }

/* ---------- physiology update ---------- */
function bellAt(t){ if (t < 0) t += P.cPeriod; if (t >= 0 && t < P.cDur){ const u = t / P.cDur; const s = Math.sin(Math.PI * u); return s * s; } return 0; }
function updatePhys(dt){
  P.t += dt;
  let ended = false, started = false;
  if (P.cOn){
    const prev = P.cT; P.cT += dt;
    if (prev < P.cDur && P.cT >= P.cDur) ended = true;
    if (P.cT >= P.cPeriod){ P.cT -= P.cPeriod; started = true; }
  }
  P.bell = P.cOn ? bellAt(P.cT) : 0;
  P.toco = 8 + P.cAmp * P.bell + 1.2 * Math.sin(P.t * 0.7) + (Math.random() - 0.5) * 0.8;
  if (ended) stepEvent('cEnd'); if (started) stepEvent('cStart');

  // fetal heart
  const ftau = Math.min(1, dt * 0.25);
  P.fhrBaseT = P.fhrMode === 'brady' ? 84 : 140;
  P.fhrBase += (P.fhrBaseT - P.fhrBase) * ftau;
  const va = P.fhrMode === 'normal' ? 1 : 0.45;
  P.varAmp += (va - P.varAmp) * Math.min(1, dt);
  let tgt = P.fhrBase + P.varAmp * (3.4 * Math.sin(P.t * 1.3 + 1) + 2.4 * Math.sin(P.t * 2.9 + 2) + 1.4 * Math.sin(P.t * 6.1)) + (Math.random() - 0.5) * 2.2 * P.varAmp;
  if (P.fhrMode === 'normal' && P.accels){
    P.accelT -= dt;
    if (P.accelT <= 0 && P.accelU < 0){ P.accelU = 0; P.accelT = 22 + Math.random() * 25; }
    if (P.accelU >= 0){ P.accelU += dt / 6; tgt += 17 * Math.pow(Math.sin(Math.PI * Math.min(1, P.accelU)), 2); if (P.accelU >= 1) P.accelU = -1; }
  }
  if (P.earlyDecels) tgt -= 16 * P.bell;
  if (P.fhrMode === 'late') tgt -= 42 * bellAt(P.cT - P.cDur * 0.6);
  P.fhr += (tgt - P.fhr) * Math.min(1, dt * 4);
  P.bhr = 146 + 5 * Math.sin(P.t * 0.4) + (Math.random() - 0.5) * 2;

  // maternal
  if (SIM.pphActive){
    P.ebl = Math.min(P.eblCap, P.ebl + P.eblRate * dt);
    P.mhrT = 84 + clamp((P.ebl - 380) / 13, 0, 44);
    P.sysT = 118 - clamp((P.ebl - 450) / 14, 0, 32);
    P.diaT = 74 - clamp((P.ebl - 450) / 22, 0, 20);
    if (SIM.pphControlled){ P.mhrT -= 10; P.sysT += 6; P.diaT += 4; }
  }
  const mt = P.mhrT + (P.pushing ? 10 : 0) + 5 * P.bell;
  P.mhr += (mt - P.mhr) * Math.min(1, dt * 0.9);
  P.sys += (P.sysT + 8 * P.bell - P.sys) * Math.min(1, dt * 0.6);
  P.dia += (P.diaT + 4 * P.bell - P.dia) * Math.min(1, dt * 0.6);
  P.rr  += ((P.pushing ? 22 : 16 + (SIM.pphActive ? 4 : 0)) - P.rr) * Math.min(1, dt * 0.5);
  P.spo2 += ((SIM.pphActive && !SIM.pphControlled ? 96 : 98) - P.spo2) * Math.min(1, dt * 0.3);
  if (!SIM.pphActive && P.eblRate > 0) P.ebl = Math.min(P.eblCap, P.ebl + P.eblRate * dt);
}

/* ---------- fetus & scene rendering ---------- */
const E = {};
function cacheEls(){
  ['fetus','fBody','fHead','cxL','cxR','cxLbl','iHead','iCervix','insetCap','uterusL','uterusP','plac3','cordIn','cordOut1','cordOut1e','cordMid','cordOut2','clamp1','clamp2','babyBody','babyHead','towel','hat','drapeFill','drapeRd','utLblP','placentaL','uterusG','placLine','utLblL'].forEach(id => E[id] = document.getElementById(id));
}
function mixCol(a, b, t){ const pa = [1,3,5].map(i => parseInt(a.substr(i,2),16)), pb = [1,3,5].map(i => parseInt(b.substr(i,2),16)); return '#' + pa.map((v,i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2,'0')).join(''); }
function posName(th){
  const names = {'0':'OA','45':'LOA','90':'LOT','135':'LOP','180':'OP','-45':'ROA','-90':'ROT','-135':'ROP'};
  let a = ((th % 360) + 540) % 360 - 180; const r = Math.round(a / 45) * 45; return names[String(r === -180 ? 180 : r)] || 'OA';
}
function renderScene(dt){
  // tween fetus
  const k = Math.min(1, dt * 2.4);
  for (const key in FT) F[key] += (FT[key] - F[key]) * k;
  // fetus geometry
  const hp = canal(F.s), ref = canal(F.s - 0.55);
  let dx = ref.x - hp.x, dy = ref.y - hp.y; const L = Math.hypot(dx, dy) || 1;
  const bx = hp.x + dx / L * 88, by = hp.y + dy / L * 88;
  const th = Math.atan2(-(hp.x - bx), (hp.y - by)) * 180 / Math.PI;
  E.fBody.setAttribute('transform', `translate(${(bx + F.ox).toFixed(2)} ${(by + F.oy).toFixed(2)}) rotate(${th.toFixed(2)})`);
  E.fHead.setAttribute('transform', `translate(0 88) rotate(${F.ha.toFixed(2)})`);
  E.fetus.style.opacity = F.op.toFixed(3);
  // uterus contraction
  const sc = 1 - 0.018 * P.bell;
  E.uterusL.setAttribute('transform', `translate(215 160) scale(${sc.toFixed(4)}) translate(-215 -160)`);
  E.uterusL.setAttribute('stroke-width', (10 + 7 * P.bell).toFixed(2));
  E.uterusL.setAttribute('stroke', mixCol('#d98c9a', '#c0566d', P.bell));
  // fundus follows the fetus down during descent
  const sy = 1 - 0.3 * smooth(0, 1.0, F.s);
  E.uterusG.setAttribute('transform', `translate(0 ${(286 * (1 - sy)).toFixed(2)}) scale(1 ${sy.toFixed(4)})`);
  E.placLine.setAttribute('y2', (286 - (286 - 70) * sy).toFixed(1));
  E.utLblL.setAttribute('y', (286 - (286 - 40) * sy).toFixed(1));
  // cervix
  const d = clamp(P.dil, 0, 10), off = 8 + d * 2.6;
  E.cxL.setAttribute('x', (215 - off - 14).toFixed(1)); E.cxR.setAttribute('x', (215 + off).toFixed(1));
  const cxo = d >= 10 ? 0.25 : 1; E.cxL.style.opacity = cxo; E.cxR.style.opacity = cxo; E.cxLbl.style.opacity = d >= 10 ? 0 : 1;
  // inset
  E.iHead.setAttribute('transform', `rotate(${F.ins.toFixed(2)} 80 82)`);
  const r = Math.max(1.5, d * 5.0);
  const ho = d >= 10 ? Math.max(0, 1 - Math.max(0, F.s) * 3) : 1;
  E.iCervix.setAttribute('d', `M80 82 m-78 0 a78 78 0 1 0 156 0 a78 78 0 1 0 -156 0 Z M80 82 m-${r} 0 a${r} ${r} 0 1 0 ${2*r} 0 a${r} ${r} 0 1 0 -${2*r} 0 Z`);
  E.iCervix.style.opacity = ho.toFixed(3);
  const st = stationFromS(F.s);
  let cap = posName(F.ins) + ' · ';
  if (F.s > 0.8) cap += 'Head born'; else if (F.s > 0.66) cap += 'Crowning'; else cap += 'Station ' + (st >= 0 ? '+' : '−') + Math.abs(Math.round(st));
  if (d < 10 && P.revealed.dil) cap += ' · Cx ' + Math.round(d) + ' cm';
  E.insetCap.textContent = cap;

  // post scene
  P3.k += (P3.kT - P3.k) * Math.min(1, dt * 1.5);
  P3.pp += (P3.ppT - P3.pp) * Math.min(1, dt * 1.2);
  P3.pink += (P3.pinkT - P3.pink) * Math.min(1, dt * 0.6);
  P3.wob += dt;
  const kk = P3.k * (P3.boggy ? 1 + 0.02 * Math.sin(P3.wob * 3) : 1);
  E.uterusP.setAttribute('transform', `translate(215 286) scale(${kk.toFixed(4)}) translate(-215 -286)`);
  E.uterusP.setAttribute('stroke-dasharray', P3.boggy ? '10 6' : 'none');
  E.uterusP.setAttribute('fill', P3.boggy ? '#f6d6dc' : '#f1c3cb');
  E.utLblP.textContent = P3.boggy ? 'Uterus: soft, boggy' : 'Uterus (contracted)';
  E.utLblP.setAttribute('y', (286 - 270 * kk - 8).toFixed(1));
  E.utLblP.setAttribute('x', '215');
  // placenta along path
  const att = {x: 215 + (296 - 215) * P3.k, y: 286 + (112 - 286) * P3.k};
  let px, py, rot;
  const pp = P3.pp;
  if (pp < 0.4){ const t = pp / 0.4; px = lerp(att.x, 215, t); py = lerp(att.y, 280, t); rot = lerp(-60, -10, t); }
  else { const c = canal((pp - 0.4) / 0.6 * 1.3); px = c.x; py = c.y; rot = lerp(-10, 40, (pp - 0.4) / 0.6); }
  E.plac3.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${rot.toFixed(1)})`);
  E.plac3.style.display = P3.placVis ? '' : 'none';
  // inner cord from placenta to introitus
  let cd = '';
  if (P3.placVis){
    if (pp < 0.4) cd = `M${px.toFixed(1)} ${py.toFixed(1)} Q ${((px + 215) / 2).toFixed(1)} ${Math.max(py, 250).toFixed(1)} 215 288 Q232 350 172 398`;
    else { const s0 = (pp - 0.4) / 0.6 * 1.3; if (s0 < 1){ const pts = []; for (let s = s0; s <= 1.0001; s += 0.05){ const c = canal(Math.min(1, s)); pts.push(c.x.toFixed(1) + ' ' + c.y.toFixed(1)); } cd = 'M' + pts.join(' L'); } }
  }
  E.cordIn.setAttribute('d', cd);
  const showMat = P3.placVis;
  E.cordOut1.style.display = showMat ? '' : 'none'; E.cordOut1e.style.display = showMat ? '' : 'none';
  E.clamp2.style.display = (P3.clamp2 && showMat) ? '' : 'none';
  E.cordMid.style.display = P3.cut ? 'none' : '';
  E.clamp1.style.display = P3.clamp1 ? '' : 'none';
  const bc = mixCol('#a3b1d4', '#f2bfa8', clamp(P3.pink, 0, 1)), bs = mixCol('#8592b4', '#d39a83', clamp(P3.pink, 0, 1));
  E.babyBody.setAttribute('fill', bc); E.babyHead.setAttribute('fill', bc); E.babyBody.setAttribute('stroke', bs); E.babyHead.setAttribute('stroke', bs);
  E.towel.style.display = P3.towel ? '' : 'none'; E.hat.style.display = P3.hat ? '' : 'none';
  // drape
  const pads = SIM.padsVol || 100;
  const drapeVol = Math.max(0, P.ebl - pads);
  E.drapeFill.style.height = clamp(drapeVol / 1200 * 100, 0, 100) + '%';
  E.drapeRd.textContent = 'Drape: ' + (Math.round(drapeVol / 10) * 10) + ' mL';
}

/* ---------- monitor tiles ---------- */
const TILES = [
  {k:'mhr', l:'Maternal HR', u:'bpm', c:'g', v:() => Math.round(P.mhr), a:() => P.mhr > 100 || P.mhr < 50, s:() => P.mhr > 100 ? 'Tachycardia' : 'Pulse'},
  {k:'bp', l:'BP (mmHg)', u:'', c:'w', v:() => Math.round(P.sys) + '/' + Math.round(P.dia), a:() => P.sys >= 140 || P.sys < 95 || P.dia >= 90, s:() => P.sys < 95 ? 'Hypotension' : 'Non-invasive'},
  {k:'spo2', l:'SpO₂', u:'%', c:'c', v:() => Math.round(P.spo2), a:() => P.spo2 < 94, s:() => 'Pulse oximetry'},
  {k:'temp', l:'Temperature', u:'°C', c:'o', v:() => P.temp.toFixed(1), a:() => P.temp >= 37.5, s:() => 'Tympanic'},
  {k:'rr', l:'Resp rate', u:'/min', c:'y', v:() => Math.round(P.rr), a:() => P.rr > 24, s:() => 'Breaths'},
  {k:'fhr', l:() => SIM.born ? 'Baby HR' : 'Fetal HR', u:'bpm', c:'p', v:() => SIM.born ? Math.round(P.bhr) : Math.round(P.fhr), a:() => !SIM.born && (P.fhr < 110 || P.fhr > 160), s:() => SIM.born ? 'Newborn' : (P.fhr < 100 ? 'Bradycardia' : P.fhr < 110 ? 'Below normal range' : 'Normal 110–160')},
  {k:'toco', l:'Toco', u:'', c:'c', v:() => P.cOn ? Math.round(P.toco) : '--', a:() => false, s:() => P.cOn ? Math.max(1, Math.round(600 / (P.cPeriod * 10))) + ' in 10 min' + (P.bell > 0.25 ? ' · ACTIVE' : '') : 'Not monitored'},
  {k:'dil', l:'Cervix', u:'cm', c:'w', v:() => SIM.born ? '--' : Math.round(P.dil), a:() => false, s:() => SIM.born ? 'n/a' : (P.dil >= 10 ? 'Fully dilated' : 'Dilatation')},
  {k:'stn', l:'Station', u:'', c:'w', v:() => { if (SIM.born || F.s > 0.8) return '--'; if (F.s > 0.66) return '+5'; const s = Math.round(stationFromS(F.s)); return (s > 0 ? '+' : s < 0 ? '−' : '') + Math.abs(s); }, a:() => false, s:() => F.s > 0.66 && !SIM.born ? 'Crowning/born' : 'vs ischial spines'},
  {k:'ebl', l:'Blood loss', u:'mL', c:'p', v:() => Math.round(P.ebl / 10) * 10, a:() => P.ebl >= 500, s:() => P.ebl >= 1000 ? 'Major PPH' : P.ebl >= 500 ? 'PPH ≥ 500 mL' : 'Measured'},
];
const tileEls = {};
function buildTiles(){
  const wrap = $('#tiles'); wrap.innerHTML = '';
  TILES.forEach(d => { const t = h('div', {class:'tile', 'data-c':d.c}); t.innerHTML = `<div class="tl"></div><div class="tv"></div><div class="ts"></div>`; wrap.append(t);
    tileEls[d.k] = {el:t, l:t.children[0], v:t.children[1], s:t.children[2]}; });
}
let tileAcc = 0;
function renderTiles(force){
  TILES.forEach(d => {
    const e = tileEls[d.k], rev = !!P.revealed[d.k];
    e.l.textContent = typeof d.l === 'function' ? d.l() : d.l;
    e.el.classList.toggle('na', !rev);
    e.v.innerHTML = rev ? (d.v() + (d.u ? `<small>${d.u}</small>` : '')) : '--';
    e.s.textContent = rev ? d.s() : 'Not yet assessed';
    e.el.classList.toggle('alarm', rev && d.a());
  });
}

/* ---------- CTG ---------- */
let cv, ctx, DPR = 1;
function sizeCTG(){ DPR = window.devicePixelRatio || 1; const r = cv.parentElement.getBoundingClientRect(); cv.width = Math.max(10, Math.round(r.width * DPR)); cv.height = Math.max(10, Math.round(r.height * DPR)); }
function pushSample(){ fhrBuf[bufHead] = (P.ctgOn && P.fhrOn) ? P.fhr : NaN; tocoBuf[bufHead] = P.ctgOn ? P.toco : NaN; bufHead = (bufHead + 1) % N; bufCount++; }
function drawCTG(){
  const W = cv.width, H = cv.height, d = DPR; if (W < 20 || H < 20) return;
  ctx.fillStyle = '#fffaf6'; ctx.fillRect(0, 0, W, H);
  const padL = 30 * d, fT = 18 * d, fH = H * 0.6 - fT, tT = H * 0.67, tH = H - tT - 6 * d, pw = W - padL - 4 * d;
  const yF = v => fT + (200 - v) / 140 * fH, yT = v => tT + (100 - v) / 100 * tH;
  ctx.fillStyle = 'rgba(31,157,99,.10)'; ctx.fillRect(padL, yF(160), pw, yF(110) - yF(160));
  ctx.lineWidth = 1; ctx.font = `${9.5 * d}px system-ui, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let v = 60; v <= 200; v += 10){ ctx.strokeStyle = v % 30 === 0 ? 'rgba(214,75,60,.32)' : 'rgba(214,75,60,.13)'; ctx.beginPath(); ctx.moveTo(padL, yF(v)); ctx.lineTo(padL + pw, yF(v)); ctx.stroke(); if (v % 30 === 0){ ctx.fillStyle = '#9a6b5f'; ctx.fillText(v, padL - 4 * d, yF(v)); } }
  for (let v = 0; v <= 100; v += 25){ ctx.strokeStyle = v % 50 === 0 ? 'rgba(214,75,60,.3)' : 'rgba(214,75,60,.13)'; ctx.beginPath(); ctx.moveTo(padL, yT(v)); ctx.lineTo(padL + pw, yT(v)); ctx.stroke(); if (v % 50 === 0){ ctx.fillStyle = '#9a6b5f'; ctx.fillText(v, padL - 4 * d, yT(v)); } }
  const i0 = ((N - bufCount) % 60 + 60) % 60;
  for (let i = i0; i < N; i += 60){ const x = padL + i / (N - 1) * pw; ctx.strokeStyle = 'rgba(214,75,60,.22)'; ctx.beginPath(); ctx.moveTo(x, fT); ctx.lineTo(x, fT + fH); ctx.moveTo(x, tT); ctx.lineTo(x, tT + tH); ctx.stroke(); }
  const trace = (buf, yf, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw * d; ctx.lineJoin = 'round'; ctx.beginPath(); let pen = false;
    for (let i = 0; i < N; i++){ const v = buf[(bufHead + i) % N]; const x = padL + i / (N - 1) * pw; if (isNaN(v)){ pen = false; continue; } const y = yf(v); if (!pen){ ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); } ctx.stroke(); };
  trace(fhrBuf, v => yF(clamp(v, 60, 200)), '#22324a', 1.5);
  trace(tocoBuf, v => yT(clamp(v, 0, 100)), '#0b7a83', 1.5);
  ctx.textAlign = 'left'; ctx.fillStyle = '#9a6b5f'; ctx.font = `700 ${9.5 * d}px system-ui, sans-serif`;
  ctx.fillText('FHR', padL + 4 * d, fT - 8 * d); ctx.fillText('TOCO', padL + 4 * d, tT - 7 * d);
  if (!P.ctgOn && P.ctgMsg){ ctx.fillStyle = 'rgba(255,250,246,.85)'; ctx.fillRect(padL + pw * 0.15, H * 0.36, pw * 0.7, 24 * d); ctx.fillStyle = '#7a5a50'; ctx.textAlign = 'center'; ctx.font = `600 ${11 * d}px system-ui, sans-serif`; ctx.fillText(P.ctgMsg, padL + pw / 2, H * 0.36 + 12 * d); }
}

/* ---------- header ---------- */
function renderHeader(){
  const st = SIM.steps[SIM.idx]; const stage = SIM.finished ? 5 : (st ? st.stage : 0);
  const sp = $('#stepper'); sp.innerHTML = '';
  STAGES.forEach((n, i) => sp.append(h('span', {class:'st ' + (i < stage ? 'done' : i === stage ? 'active' : '')}, n)));
  $('#stageMini').textContent = 'Stage: ' + STAGES[stage];
  $('#score').textContent = SIM.score; $('#scoreMax').textContent = SIM.max;
  $('#clock').textContent = fmtClock(SIM.clock);
  const mb = $('#modeBadge');
  if (SIM.mode === 'normal'){ mb.textContent = 'Normal birth'; mb.classList.remove('comp'); }
  else { mb.classList.add('comp'); mb.textContent = SIM.mode === 'random' && SIM.encountered.length === 0 ? 'Complications: hidden' : 'Complications: ' + (SIM.mode === 'random' ? SIM.encountered : compList()).join(', '); }
}
function compList(){ const n = {brady:'FHR', sd:'Shoulder dystocia', pph:'PPH'}; return Object.keys(SIM.comps).filter(k => SIM.comps[k]).map(k => n[k]); }
function encounter(k){ const n = {brady:'FHR', sd:'Shoulder dystocia', pph:'PPH'}; if (!SIM.encountered.includes(n[k])) SIM.encountered.push(n[k]); renderHeader(); }
