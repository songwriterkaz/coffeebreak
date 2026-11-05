
/* =========================================================
   Start / loop / init
   ========================================================= */
function startSim(mode, comps){
  timers.forEach(clearTimeout); timers = [];
  const spd = SIM ? SIM.speed : 1;
  freshState(); SIM.speed = spd; SIM.mode = mode;
  if (mode === 'random'){ const ks = shuffle(['brady', 'sd', 'pph']); SIM.comps[ks[0]] = true; if (Math.random() < 0.35) SIM.comps[ks[1]] = true; }
  else if (mode === 'choose'){ (comps || []).forEach(k => SIM.comps[k] = true); if (!Object.values(SIM.comps).some(Boolean)) SIM.mode = 'normal'; }
  SIM.padsVol = SIM.comps.pph ? 150 : 100;
  $('#nuchal').style.display = 'none';
  annot(''); setScene('labour'); showDrape(false); chips({});
  SIM.steps = buildSteps(SIM.comps);
  SIM.finished = false;
  $('#startOv').classList.remove('show'); $('#debriefOv').classList.remove('show');
  renderStep(); renderTiles(true);
}

let last = performance.now(), sAcc = 0;
function frame(now){
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
  const mult = SIM.speed * (SIM.ff || 1);
  let rem = dt * mult;
  while (rem > 1e-6){ const hs = Math.min(rem, 0.05); updatePhys(hs); sAcc += hs; while (sAcc >= 0.1){ sAcc -= 0.1; pushSample(); } rem -= hs; }
  stepTick(dt * mult, dt);
  renderScene(dt * SIM.speed);
  tileAcc += dt; if (tileAcc > 0.2){ tileAcc = 0; renderTiles(); $('#clock').textContent = fmtClock(SIM.clock); }
  drawCTG();
  requestAnimationFrame(frame);
}

function init(){
  freshState(); cacheEls(); buildTiles(); renderChips();
  const ticks = $('#drapeTicks'); [0, 250, 500, 750, 1000].forEach(v => { const s = h('span', null, v); s.style.bottom = (v / 1200 * 100) + '%'; ticks.append(s); });
  cv = $('#ctg'); ctx = cv.getContext('2d'); sizeCTG();
  if (window.ResizeObserver) new ResizeObserver(sizeCTG).observe($('#ctgWrap')); else window.addEventListener('resize', sizeCTG);
  renderHeader(); renderTiles(true);
  $('#scenBody').innerHTML = `<h2>Ready when you are</h2><p class="narr">Choose a mode on the start screen to begin.</p>`;

  let mode = 'normal';
  $$('#modes .mode').forEach(b => b.onclick = () => { mode = b.dataset.mode; $$('#modes .mode').forEach(x => x.classList.toggle('on', x === b)); $('#compPick').classList.toggle('show', mode === 'choose'); });
  $('#startBtn').onclick = () => startSim(mode, $$('#compPick input:checked').map(i => i.value));
  $('#restartBtn').onclick = () => { P.pushing = false; SIM.ff = 0; $('#debriefOv').classList.remove('show'); $('#startOv').classList.add('show'); };
  $$('#speedSeg button').forEach(b => b.onclick = () => { SIM.speed = +b.dataset.speed; $$('#speedSeg button').forEach(x => x.classList.toggle('on', x === b)); });

  document.addEventListener('keydown', e => {
    if ($('#startOv').classList.contains('show') || $('#debriefOv').classList.contains('show')) return;
    const st = cur(); if (!st) return;
    if (e.code === 'Space' && st.type === 'push'){ e.preventDefault(); if (!e.repeat && !st._done){ P.pushing = true; const pb = $('#pushBtn'); if (pb) pb.classList.add('held'); } return; }
    if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey){ const o = $$('#scenBody .opt')[+e.key - 1]; if (o && !o.disabled){ e.preventDefault(); o.click(); } }
    if (e.key === 'Enter' && st._completed && document.activeElement && document.activeElement.tagName !== 'BUTTON'){ e.preventDefault(); next(); }
  });
  document.addEventListener('keyup', e => { if (e.code === 'Space'){ P.pushing = false; const pb = $('#pushBtn'); if (pb) pb.classList.remove('held'); } });
  window.addEventListener('blur', () => { P.pushing = false; });
  requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });
}

/* test / debugging hook (read-only helpers) */
window.MidwifeSim = {
  get SIM(){ return SIM; }, get P(){ return P; }, get F(){ return F; },
  debugCurrent(){
    const st = cur(); if (!st) return null;
    const r = {id: st.id, type: st.type, done: !!st._completed, stage: st.stage};
    const idx = (list, f) => list.map((o, i) => f(o) ? i : -1).filter(i => i >= 0);
    if (st.type === 'mcq') r.correct = idx(st._opts, o => o.ok);
    if (st.type === 'tasks' || st.type === 'multi') r.correct = idx(st._list, o => o.ok);
    if (st.type === 'order') r.correct = st._list.map((o, i) => ({o, i})).filter(x => x.o.ok).sort((a, b) => a.o.grp - b.o.grp).map(x => x.i);
    if (st.type === 'apgar') r.vals = st.vals.slice();
    if (st.type === 'ebl') r.answer = st._ans;
    return r;
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
