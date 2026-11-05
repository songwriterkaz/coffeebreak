
/* =========================================================
   Step engine
   ========================================================= */
function cur(){ return SIM.steps[SIM.idx]; }
function feedback(kind, html, head){
  const heads = {ok:'✓ Correct', bad:'✗ Not the best choice', warn:'⚠ Not yet', info:'ℹ Note'};
  const box = $('#fbBox'); if (!box) return;
  box.innerHTML = `<div class="fb ${kind}"><b class="h">${head || heads[kind]}</b>${html}</div>`;
  requestAnimationFrame(() => {
    const sc = $('#scenBody'); if (!sc) return;
    const internal = getComputedStyle(sc).overflowY !== 'visible' && sc.scrollHeight > sc.clientHeight + 2;
    if (internal){ const d = box.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom; if (d > 0) sc.scrollTo({top: sc.scrollTop + d + 12, behavior:'smooth'}); }
    else { const r = box.getBoundingClientRect(); if (r.bottom > window.innerHeight) window.scrollBy({top: r.bottom - window.innerHeight + 16, behavior:'smooth'}); }
  });
}
function renderStep(){
  const st = cur(); if (!st) return;
  st._wrong = 0; st._errors = []; st._done = false; st._completed = false;
  const body = $('#scenBody'); body.innerHTML = ''; body.scrollTop = 0;
  $('#stepTag').textContent = st.tag || STAGES[st.stage];
  $('#stepNo').textContent = `Step ${SIM.idx + 1} of ${SIM.steps.length}`;
  $('#progBar').style.width = (SIM.idx / SIM.steps.length * 100) + '%';
  if (st.dt) addMin(st.dt);
  if (st.enter) st.enter(st);
  body.append(h('h2', null, st.title));
  if (st.text) body.append(h('div', {class:'narr'}, typeof st.text === 'function' ? st.text(st) : st.text));
  const area = h('div', {class:'area'}); body.append(area);
  body.append(h('div', {class:'fbBox', id:'fbBox'}));
  body.append(h('div', {class:'contBar', id:'contBar'}));
  TYPES[st.type].render(st, area);
  renderHeader(); renderTiles(true);
}
function complete(st, got, max, learn){
  if (st._completed) return; st._completed = true; st._done = true;
  if (max > 0){
    SIM.score += got; SIM.max += max;
    SIM.results.push({title: st.title, stage: st.stage, got, max, learn: st.learn || learn || '', errors: st._errors.slice()});
  }
  if (st.onComplete) st.onComplete(st);
  renderHeader();
  const cb = $('#contBar'); cb.innerHTML = '';
  if (max > 0) cb.append(h('span', {class:'pts'}, `+${got} / ${max} points`));
  const last = SIM.idx >= SIM.steps.length - 1;
  const b = h('button', {class:'btn pri', id:'contBtn'}, last ? 'View debrief ▶' : 'Continue ▶');
  b.onclick = next; cb.append(b);
  setTimeout(() => { try { b.focus({preventScroll:true}); } catch(e){} }, 30);
}
function next(){
  const st = cur(); if (!st || !st._completed) return;
  if (st.leave) st.leave(st);
  if (SIM.idx >= SIM.steps.length - 1){ showDebrief(); return; }
  SIM.idx++; renderStep();
}
function stepEvent(name){ const st = SIM && SIM.steps && cur(); if (st && TYPES[st.type].event) TYPES[st.type].event(st, name); }
function stepTick(sdt, dt){ const st = SIM && SIM.steps && cur(); if (st && TYPES[st.type].tick) TYPES[st.type].tick(st, sdt, dt); }
function optBtn(i, html){ return h('button', {class:'opt', type:'button'}, `<span class="key">${i + 1}</span><span class="otx">${html}</span>`); }

const APGAR = [
  {name:'Heart rate', crit:['Absent', '< 100 bpm', '≥ 100 bpm']},
  {name:'Respiratory effort', crit:['Absent', 'Weak, irregular, gasping', 'Good, strong cry']},
  {name:'Muscle tone', crit:['Limp', 'Some flexion', 'Active motion, well flexed']},
  {name:'Reflex irritability', crit:['No response', 'Grimace', 'Cry, cough or pulls away']},
  {name:'Colour', crit:['Blue or pale all over', 'Body pink, extremities blue', 'Pink all over']},
];

const TYPES = {
  info: { render(st){ complete(st, 0, 0); } },

  mcq: { render(st, area){
    if (st.q) area.append(h('p', {class:'q'}, st.q));
    const list = h('div', {class:'opts'}); area.append(list);
    st._opts = st.noShuffle ? st.options.slice() : shuffle(st.options.slice());
    const max = st.pts || 10;
    st._opts.forEach((o, i) => {
      const b = optBtn(i, o.t); list.append(b);
      b.onclick = () => {
        if (st._done) return;
        if (o.ok){
          b.classList.add('correct'); $$('.opt', list).forEach(x => x.disabled = true);
          feedback('ok', o.fb); const got = Math.max(0, max - st._wrong * 4);
          if (st.after) st.after(st);
          complete(st, got, max, o.fb);
        } else {
          st._wrong++; st._errors.push(o.t); b.classList.add('wrong'); b.disabled = true; feedback('bad', o.fb);
        }
      };
    });
  }},

  tasks: { render(st, area){
    if (st.q) area.append(h('p', {class:'q'}, st.q));
    const list = h('div', {class:'opts grid'}); area.append(list);
    const log = h('ul', {class:'findings'}); area.append(log);
    st._list = shuffle(st.tasks.slice());
    const need = st._list.filter(t => t.ok).length; let got = 0; const max = st.pts || 10;
    st._list.forEach((t, i) => {
      const b = optBtn(i, t.t); list.append(b);
      b.onclick = () => {
        if (st._done || b.disabled) return;
        b.disabled = true;
        if (t.ok){
          b.classList.add('done'); log.append(h('li', null, t.fb)); if (t.act) t.act(st); got++;
          if (got === need){
            st._done = true; $$('.opt', list).forEach(x => x.disabled = true);
            if (st.after) st.after(st);
            feedback('ok', st.doneFb || 'All required actions completed.', '✓ Complete');
            complete(st, Math.max(0, max - st._wrong * 3), max, st.doneFb);
          } else { const fb = $('#fbBox'); if (fb) fb.innerHTML = ''; }
        } else { st._wrong++; st._errors.push(t.t); b.classList.add('wrong'); feedback('bad', t.fb); }
      };
    });
  }},

  order: { render(st, area){
    if (st.q) area.append(h('p', {class:'q'}, st.q));
    const items = st.items.map((it, i) => Object.assign({}, it, {ok:true, grp: it.grp != null ? it.grp : i + 1}));
    const dis = (st.distractors || []).map(d => Object.assign({}, d, {ok:false}));
    st._list = shuffle(items.concat(dis));
    const list = h('div', {class:'opts'}); area.append(list);
    const log = h('ol', {class:'findings'}); area.append(log);
    const max = st.pts || 10; let ooo = 0;
    st._list.forEach((it, i) => {
      const b = optBtn(i, it.t); list.append(b);
      b.onclick = () => {
        if (st._done || b.disabled) return;
        if (!it.ok){ st._wrong++; st._errors.push(it.t); b.disabled = true; b.classList.add('wrong'); feedback('bad', it.fb); return; }
        const remaining = st._list.filter(x => x.ok && !x._d);
        const cg = Math.min.apply(null, remaining.map(x => x.grp));
        if (it.grp !== cg){ ooo++; st._errors.push('Out of sequence: ' + (it.short || it.t)); feedback('warn', st.hint || 'Think about what needs to happen first.', '⚠ Not yet: sequence matters'); return; }
        it._d = true; b.disabled = true; b.classList.add('done');
        log.append(h('li', null, `<b>${it.short || it.t}</b>: ${it.fb}`));
        const fb = $('#fbBox'); if (fb) fb.innerHTML = '';
        if (it.act) it.act(st);
        if (st._list.every(x => !x.ok || x._d)){
          st._done = true; $$('.opt', list).forEach(x => x.disabled = true);
          if (st.after) st.after(st);
          feedback('ok', st.doneFb || 'Sequence complete.', '✓ Sequence complete');
          complete(st, Math.max(0, max - ooo * 2 - st._wrong * 4), max, st.doneFb);
        }
      };
    });
  }},

  multi: { render(st, area){
    if (st.q) area.append(h('p', {class:'q'}, st.q + ' <span class="hintSmall">(select all that apply)</span>'));
    const list = h('div', {class:'opts'}); area.append(list);
    st._list = shuffle(st.options.slice()); st._sel = new Set();
    st._list.forEach((o, i) => {
      const b = optBtn(i, o.t); b.setAttribute('aria-pressed', 'false'); list.append(b);
      b.onclick = () => { if (st._done) return; if (st._sel.has(i)){ st._sel.delete(i); b.classList.remove('sel'); b.setAttribute('aria-pressed','false'); } else { st._sel.add(i); b.classList.add('sel'); b.setAttribute('aria-pressed','true'); } };
    });
    const sub = h('button', {class:'btn pri', id:'checkBtn', style:'margin-top:10px'}, 'Check answers');
    area.append(sub);
    sub.onclick = () => {
      if (st._done) return;
      if (st._sel.size === 0){ feedback('warn', 'Select at least one option first.'); return; }
      st._done = true; sub.disabled = true;
      const nOk = st._list.filter(o => o.ok).length; let c = 0, w = 0;
      $$('.opt', list).forEach((b, i) => {
        const o = st._list[i], s = st._sel.has(i); b.disabled = true; b.classList.remove('sel');
        if (s && o.ok){ c++; b.classList.add('correct'); }
        else if (s && !o.ok){ w++; b.classList.add('wrong'); st._errors.push('Selected: ' + o.t); }
        else if (!s && o.ok){ b.classList.add('missed'); st._errors.push('Missed: ' + o.t); }
        if (o.fb && (s || o.ok)) b.querySelector('.otx').insertAdjacentHTML('beforeend', `<span class="why">${o.fb}</span>`);
      });
      const max = st.pts || 10; const got = Math.round(max * clamp((c - w) / nOk, 0, 1));
      if (st.after) st.after(st);
      feedback(got === max ? 'ok' : 'warn', st.doneFb, got === max ? '✓ All correct' : `You identified ${c} of ${nOk}` + (w ? `, with ${w} incorrect selection${w > 1 ? 's' : ''}` : ''));
      complete(st, got, max, st.doneFb);
    };
  }},

  advance: {
    render(st, area){
      const b = h('button', {class:'btn pri big advBtn', id:'advBtn'}, st.btn || '▶ Advance labour');
      const bar = h('div', {class:'descent'}, '<i></i>'); area.append(b, bar); st._bar = bar.firstChild;
      b.onclick = () => { if (st._run || st._done) return; b.disabled = true; st._run = true; st._t = 0; st._c0 = SIM.clock; SIM.ff = 8; if (st.start) st.start(st); };
    },
    tick(st, sdt, dt){
      if (!st._run) return;
      st._t += dt * SIM.speed; const t = Math.min(1, st._t / (st.dur || 5));
      st.prog(t, st); SIM.clock = st._c0 + st.mins * t; st._bar.style.width = (t * 100) + '%';
      if (t >= 1){ st._run = false; SIM.ff = 0; feedback('info', st.doneText, st.doneHead || 'Labour update'); complete(st, 0, 0); }
    }
  },

  push: {
    render(st, area){
      Object.assign(st, {prog:0, peak:0, cIn:0, restPush:0, warned:false, good:0, missed:0, badRest:0, cycles:0});
      area.innerHTML = `<div class="pushPanel">
        <div class="meterRow"><div class="meter" title="Contraction strength"><i id="pm"></i><span class="thr"></span></div><div class="cstate" id="pcs">Resting</div></div>
        <button class="pushBtn" id="pushBtn" type="button">HOLD TO PUSH</button>
        <div class="pstats"><span>Effective pushes <b id="pGood">0</b></span><span>Missed contractions <b id="pMiss">0</b></span><span>Pushing at rest <b id="pBad">0</b></span><span>Station <b id="pSt">0</b></span></div>
        <div class="hintSmall" style="margin-top:8px">Fetal descent to the perineum</div><div class="descent"><i id="pDesc"></i></div></div>`;
      const pb = $('#pushBtn', area);
      const down = e => { e.preventDefault(); if (st._done) return; P.pushing = true; pb.classList.add('held'); try { pb.setPointerCapture(e.pointerId); } catch(_){} };
      const up = () => { P.pushing = false; pb.classList.remove('held'); };
      pb.addEventListener('pointerdown', down);
      ['pointerup','pointercancel','lostpointercapture'].forEach(ev => pb.addEventListener(ev, up));
      pb.addEventListener('contextmenu', e => e.preventDefault());
      P.cT = P.cPeriod - 2.5;
    },
    tick(st, sdt){
      if (st._done) return;
      const inC = P.bell > 0.3;
      const pm = $('#pm'), pcs = $('#pcs'), pb = $('#pushBtn'); if (!pm) return;
      pm.style.width = (clamp((P.toco - 8) / P.cAmp, 0, 1) * 100) + '%';
      pcs.textContent = inC ? 'Contraction: PUSH' : P.bell > 0.02 ? (P.cT < P.cDur / 2 ? 'Contraction building…' : 'Contraction easing…') : 'Resting: breathe';
      pcs.classList.toggle('go', inC); pb.classList.toggle('cue', inC && !P.pushing);
      if (P.pushing){
        if (inC){ st.cIn += sdt; st.prog = Math.min(1, st.prog + sdt * 0.078 * P.bell); st.peak = Math.max(st.peak, st.prog); }
        else if (P.bell < 0.03){ st.restPush += sdt;
          if (st.restPush > 0.8 && !st.warned){ st.warned = true; st.badRest++;
            feedback('warn', 'Encourage Emma to rest and breathe between contractions. Pushing without a contraction is ineffective, tiring and reduces fetal oxygenation. Wait for the next one.', '⚠ Pushing between contractions'); } }
      } else if (!inC && st.prog < 0.97){ st.prog = Math.max(st.peak - 0.035, st.prog - sdt * 0.004); }
      FT.s = st.prog * 0.55; FT.ins = 45 * (1 - smooth(0.3, 0.85, st.prog)); FT.ha = -8 - 8 * st.prog;
      chipState['Descent'] = 'active'; chipState['Flexion'] = st.prog > 0.3 ? 'done' : 'active';
      chipState['Internal rotation'] = st.prog > 0.85 ? 'done' : st.prog > 0.3 ? 'active' : ''; renderChipsThrottled();
      $('#pGood').textContent = st.good; $('#pMiss').textContent = st.missed; $('#pBad').textContent = st.badRest;
      const s = Math.round(stationFromS(F.s)); $('#pSt').textContent = (s > 0 ? '+' : '') + s; $('#pDesc').style.width = (st.prog * 100) + '%';
      if (st.prog >= 1){
        st._done = true; P.pushing = false; pb.classList.remove('held', 'cue'); pb.disabled = true; pb.textContent = 'Head on the perineum';
        chipState['Descent'] = 'done'; chipState['Internal rotation'] = 'done'; renderChips();
        const got = Math.max(0, 10 - st.badRest * 2 - st.missed);
        feedback(got >= 8 ? 'ok' : 'warn', `Effective pushing brought the head down to the perineum. During descent the head <b>flexed</b> and <b>rotated internally</b> from LOA to <b>OA</b> as it met the pelvic floor (see the view from below). ${st.badRest ? 'Remember to rest between contractions.' : ''} FHR auscultated after each contraction: early decelerations recovering promptly (normal head compression).`, '✓ Second stage progressing');
        complete(st, got, 10, 'Push with the urge during contractions and rest in between; the head flexes and internally rotates to OA as it descends onto the pelvic floor.');
      }
    },
    event(st, name){
      if (st._done) return;
      if (name === 'cEnd'){
        st.cycles++; addMin(2.5); renderHeader();
        if (st.cIn > 1.0){ st.good++; feedback('ok', 'Good, effective push with the contraction. The head advances, then recedes slightly as the contraction eases. Encourage rest.', '✓ Effective push'); }
        else { st.missed++; feedback('warn', 'That contraction passed without an effective push. Hold PUSH (or Space) while the contraction is active.', '⚠ Missed contraction'); }
        st.cIn = 0; st.restPush = 0; st.warned = false;
      }
    }
  },

  apgar: {
    render(st, area){
      st._pick = [null, null, null, null, null];
      const tbl = h('table', {class:'apgar'}); const tb = h('tbody'); tbl.append(tb);
      APGAR.forEach((a, i) => {
        const tr = h('tr');
        tr.innerHTML = `<td>${a.name}<div class="legendTbl">0 ${a.crit[0]} · 1 ${a.crit[1]} · 2 ${a.crit[2]}</div></td><td class="obs">${st.obs[i]}<span class="ans"></span></td><td><span class="sc">${[0,1,2].map(v => `<button type="button" data-v="${v}" title="${a.crit[v]}">${v}</button>`).join('')}</span></td>`;
        $$('.sc button', tr).forEach(b => b.onclick = () => { if (st._done) return; st._pick[i] = +b.dataset.v; $$('.sc button', tr).forEach(x => x.classList.toggle('on', x === b)); sub.disabled = st._pick.some(v => v === null); });
        tb.append(tr);
      });
      area.append(tbl);
      const sub = h('button', {class:'btn pri', id:'apgarBtn', style:'margin-top:6px'}, 'Submit Apgar score'); sub.disabled = true; area.append(sub);
      sub.onclick = () => {
        if (st._done) return; st._done = true; sub.disabled = true;
        let c = 0; const total = st.vals.reduce((a, b) => a + b, 0);
        $$('tr', tb).forEach((tr, i) => {
          const ok = st._pick[i] === st.vals[i]; if (ok) c++; else st._errors.push(`${APGAR[i].name}: scored ${st._pick[i]}, correct ${st.vals[i]}`);
          $$('.sc button', tr).forEach(b => { const v = +b.dataset.v; b.disabled = true; b.classList.remove('on'); if (v === st.vals[i]) b.classList.add('right'); else if (v === st._pick[i]) b.classList.add('wrongpick'); });
          $('.ans', tr).innerHTML = ok ? `<span style="color:var(--ok)">✓ ${st.vals[i]}: ${APGAR[i].crit[st.vals[i]]}</span>` : `<span style="color:var(--bad)">✗ Correct: ${st.vals[i]} (${APGAR[i].crit[st.vals[i]]})</span>`;
        });
        SIM['apgar' + st.min] = total;
        if (st.after) st.after(st);
        feedback(c === 5 ? 'ok' : 'warn', `Apgar at ${st.min} minute${st.min > 1 ? 's' : ''}: <b>${total}/10</b>. ${st.interp}`, c === 5 ? '✓ All five components correct' : `${c} of 5 components correct`);
        complete(st, c * 2, 10, st.learn);
      };
    }
  },

  ebl: {
    render(st, area){
      const wrap = h('div', null, `<p class="q">Your total measured blood loss:</p><div class="eblRow"><input type="range" id="eblIn" min="0" max="2000" step="10" value="0" aria-label="Estimated blood loss in mL"><span class="eblOut" id="eblOut">0 mL</span></div>`);
      area.append(wrap);
      const inp = $('#eblIn', wrap), out = $('#eblOut', wrap);
      inp.oninput = () => out.textContent = inp.value + ' mL';
      const sub = h('button', {class:'btn pri', id:'eblBtn', style:'margin-top:10px'}, 'Record blood loss'); area.append(sub);
      sub.onclick = () => {
        if (st._done) return; st._done = true; sub.disabled = true; inp.disabled = true;
        const est = +inp.value, ans = st._ans, diff = Math.abs(est - ans);
        const got = diff <= 50 ? 10 : diff <= 150 ? 6 : diff <= 300 ? 3 : 0;
        if (got < 10) st._errors.push(`Recorded ${est} mL; measured total was ${ans} mL`);
        SIM.eblEst = est; SIM.eblActual = ans; reveal('ebl');
        const cls = ans >= 1000 ? '<b>major PPH (≥ 1000 mL)</b>' : ans >= 500 ? '<b>PPH (≥ 500 mL after vaginal birth)</b>' : '<b>within normal limits (&lt; 500 mL)</b>';
        feedback(got >= 6 ? 'ok' : 'bad', `Total = drape ${st._drape} mL + pads (${st._padW} g − ${st._padDry} g dry = ${st._pads} mL) = <b>${ans} mL</b>, ${cls}. You recorded ${est} mL. Quantitative measurement (graduated drapes, weighing: 1 g ≈ 1 mL) is more accurate than visual estimation, which typically <i>under</i>estimates larger losses.`, got >= 6 ? '✓ Blood loss quantified' : '✗ Inaccurate estimate');
        complete(st, got, 10, 'Quantify blood loss: graduated drape + weighed pads (1 g ≈ 1 mL). PPH is ≥ 500 mL after vaginal birth; major PPH ≥ 1000 mL.');
      };
    }
  },
};
let chipT = 0; function renderChipsThrottled(){ const n = performance.now(); if (n - chipT > 250){ chipT = n; renderChips(); } }

/* =========================================================
   Debrief
   ========================================================= */
function showDebrief(){
  SIM.finished = true; renderHeader(); $('#progBar').style.width = '100%';
  const pct = SIM.max ? Math.round(SIM.score / SIM.max * 100) : 0;
  const band = pct >= 90 ? ['Excellent', '#1f9d63'] : pct >= 75 ? ['Competent', '#0b7a83'] : pct >= 60 ? ['Developing', '#b97c00'] : ['Needs review', '#d64b3c'];
  const T = SIM.times;
  const third = (T.placenta != null && T.birth != null) ? Math.round(T.placenta - T.birth) + ' min' : '--';
  const comps = SIM.mode === 'normal' ? 'None (normal birth)' : (SIM.encountered.length ? SIM.encountered.join(', ') : 'None encountered');
  const imperfect = SIM.results.filter(r => r.got < r.max);
  const key = [
    'Woman-centred care: introduce yourself, gain informed consent before every examination, and review antenatal risk factors.',
    'Low-risk labour: intermittent auscultation (every 15–30 min in the active first stage, every 5 min or after each contraction in the second stage), palpating the maternal pulse simultaneously.',
    'Support mobility, upright positions, hydration and spontaneous pushing with the urge; avoid prolonged directed breath-holding.',
    'Cardinal movements: engagement, descent, flexion, internal rotation, extension, restitution, external rotation, expulsion.',
    'Protect the perineum with a slow, controlled birth of the head and hands-on support; avoid routine episiotomy.',
    'Active third stage: oxytocin 10 IU IM after birth, deferred cord clamping (≥ 1–3 min in a vigorous baby), controlled cord traction with uterine guarding after signs of separation.',
    'Inspect the placenta and membranes for completeness and count the cord vessels (2 arteries, 1 vein). Quantify blood loss.',
    'Newborn: skin-to-skin, dry and stimulate, keep warm; Apgar at 1 and 5 minutes; support the first breastfeed.',
  ];
  if (SIM.encountered.includes('FHR')) key.push('Abnormal CTG: intrauterine resuscitation (left lateral, check maternal pulse/BP, IV fluids, stop oxytocin if running), exclude cord prolapse, escalate early.');
  if (SIM.encountered.includes('Shoulder dystocia')) key.push('Shoulder dystocia: call for help, McRoberts + suprapubic pressure first (HELPERR); no fundal pressure, no excessive or lateral traction; document the head-to-body interval.');
  if (SIM.encountered.includes('PPH')) key.push('PPH: call for help, rub up a contraction, uterotonics, empty the bladder, IV access/bloods/fluids, tranexamic acid; review the 4 Ts (Tone, Trauma, Tissue, Thrombin).');
  const deg = pct * 3.6;
  const el = $('#debrief');
  el.innerHTML = `
    <div class="tag">Debrief</div>
    <h2 style="margin-top:6px">Simulation complete: ${band[0]}</h2>
    <div class="scoreRing">
      <div class="ring" style="background:conic-gradient(${band[1]} ${deg}deg,#e7edf4 ${deg}deg)"><span>${pct}%</span></div>
      <div><div style="font-size:15px"><b>${SIM.score}</b> of <b>${SIM.max}</b> points across ${SIM.results.length} assessed decisions.</div>
      <div class="hintSmall" style="margin-top:4px">Mode: ${SIM.mode === 'normal' ? 'Normal birth' : SIM.mode === 'random' ? 'Random complication' : 'Chosen complications'} · Complications: ${comps}</div>
      <div class="hintSmall">${imperfect.length ? imperfect.length + ' step(s) to review below.' : 'Every decision scored full marks. Well done!'}</div></div>
    </div>
    <div class="kv">
      <div>Admission<b>${fmtClock(T.admit != null ? T.admit : 500)}</b></div>
      <div>Fully dilated<b>${T.full != null ? fmtClock(T.full) : '--'}</b></div>
      <div>Time of birth<b>${T.birth != null ? fmtClock(T.birth) : '--'}</b></div>
      <div>Third stage<b>${third}</b></div>
      <div>Blood loss (measured)<b>${SIM.eblActual != null ? SIM.eblActual + ' mL' : '--'}</b></div>
      <div>Your recorded EBL<b>${SIM.eblEst != null ? SIM.eblEst + ' mL' : '--'}</b></div>
      <div>Apgar 1 min<b>${SIM.apgar1 != null ? SIM.apgar1 : '--'}</b></div>
      <div>Apgar 5 min<b>${SIM.apgar5 != null ? SIM.apgar5 : '--'}</b></div>
    </div>
    <h3 style="margin:10px 0 6px">Learning points to review</h3>
    ${imperfect.length ? `<ul class="res">${imperfect.map(r => `<li class="partial"><div class="rh"><span>${r.title}</span><em>${r.got}/${r.max}</em></div><div class="lp">${r.learn}</div>${r.errors.length ? `<div class="err">Your choices: ${r.errors.slice(0, 4).join(' · ')}</div>` : ''}</li>`).join('')}</ul>` : '<p class="hintSmall">No missed points. Try a complication mode next.</p>'}
    <h3 style="margin:14px 0 4px">Key practice points</h3>
    <ul class="keypts">${key.map(k => `<li>${k}</li>`).join('')}</ul>
    <details class="revw"><summary>All decisions (${SIM.results.length})</summary>
      <ul class="res">${SIM.results.map(r => `<li class="${r.got === r.max ? 'perfect' : 'partial'}"><div class="rh"><span>${r.got === r.max ? '✓' : '△'} ${r.title}</span><em>${r.got}/${r.max}</em></div></li>`).join('')}</ul>
    </details>
    <div class="disc" style="margin-top:14px">Educational simulation only, not medical advice. Clinical content is simplified; follow current local guidelines (e.g. RANZCOG, ANZCOR, your health service's policies).</div>
    <div class="startRow" style="margin-top:6px">
      <button class="btn" id="dbPrint">🖨 Print / save PDF</button>
      <button class="btn" id="dbMode">Change mode</button>
      <button class="btn pri" id="dbAgain">↺ Run again</button>
    </div>`;
  $('#debriefOv').classList.add('show');
  $('#debriefOv').scrollTop = 0;
  $('#dbPrint').onclick = () => window.print();
  $('#dbMode').onclick = () => { $('#debriefOv').classList.remove('show'); $('#startOv').classList.add('show'); };
  $('#dbAgain').onclick = () => startSim(SIM.mode, Object.keys(SIM.comps).filter(k => SIM.comps[k]));
  // scenario card summary
  const body = $('#scenBody'); body.innerHTML = `<h2>Simulation complete</h2><p class="narr">Score <b>${SIM.score}/${SIM.max}</b> (${pct}%). Review your debrief for learning points.</p>`;
  const ob = h('button', {class:'btn pri'}, 'Open debrief'); ob.onclick = () => $('#debriefOv').classList.add('show'); body.append(ob);
  $('#stepTag').textContent = 'Debrief'; $('#stepNo').textContent = '';
}
