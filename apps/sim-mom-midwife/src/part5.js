
/* =========================================================
   Scenario content
   ========================================================= */
const PLAC_FIG = `<svg class="placFig" viewBox="0 0 440 175" role="img" aria-label="Placenta inspection diagram">
  <g transform="translate(78 80)">
    <ellipse rx="64" ry="58" fill="#b9566c" stroke="#8f3a4e" stroke-width="2"/>
    <path d="M-20 -55 Q-12 -20 -30 0 Q-45 20 -40 52 M-30 0 Q0 6 22 -12 Q34 -30 30 -54 M22 -12 Q40 6 62 4 M0 6 Q6 30 -6 57 M-30 0 Q-50 -6 -62 -16 M6 30 Q30 30 44 44" fill="none" stroke="#7d2f42" stroke-width="2" stroke-linecap="round"/>
    <text y="76" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#5d4950">Maternal surface</text>
    <text y="90" text-anchor="middle" style="font-size:10px;fill:#7d6a70">cotyledons complete</text>
  </g>
  <g transform="translate(222 80)">
    <ellipse rx="64" ry="58" fill="#e2b3c0" stroke="#a86a7c" stroke-width="2"/>
    <ellipse rx="70" ry="64" fill="none" stroke="#cfd8e6" stroke-width="3" stroke-dasharray="2 3"/>
    <path d="M0 0 Q-20 -20 -44 -30 M0 0 Q14 -26 30 -46 M0 0 Q30 4 54 -6 M0 0 Q20 24 30 46 M0 0 Q-24 18 -50 22 M0 0 Q-6 30 -14 52" fill="none" stroke="#6f86c2" stroke-width="2.4" stroke-linecap="round"/>
    <circle r="8" fill="#e9eef8" stroke="#8597c2" stroke-width="2"/>
    <text y="76" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#5d4950">Fetal surface</text>
    <text y="90" text-anchor="middle" style="font-size:10px;fill:#7d6a70">central cord insertion · membranes</text>
  </g>
  <g transform="translate(368 70)">
    <circle r="36" fill="#eef2fa" stroke="#9fb0dd" stroke-width="2"/>
    <circle cx="-13" cy="12" r="7" fill="#6f86c2" stroke="#4c639c" stroke-width="2"/>
    <circle cx="13" cy="12" r="7" fill="#6f86c2" stroke="#4c639c" stroke-width="2"/>
    <circle cx="0" cy="-11" r="11" fill="#c95b6f" stroke="#9c3f52" stroke-width="1.2"/>
    <text y="56" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#5d4950">Cord cross-section</text>
    <text y="70" text-anchor="middle" style="font-size:10px;fill:#7d6a70">1 vein (red) · 2 arteries (blue)</text>
  </g>
</svg>`;

function buildSteps(c){
  const S = []; const add = o => S.push(o);
  const T = SIM.times;

  /* ---------------- ADMISSION ---------------- */
  add({ id:'welcome', stage:0, tag:'Admission', title:'Welcome and initial approach', type:'mcq',
    enter(){ setScene('labour'); setFT({s:-0.42, ha:-6, ins:45, op:1, ox:0, oy:0}); snapF(); P.dil = 3; contr(20, 8, 32); chips({}); annot(''); T.admit = SIM.clock; },
    text:`<p><b>Emma, 29</b>, G2 P1 (one previous uncomplicated vaginal birth) is <b>39+4 weeks</b>. Low-risk pregnancy; blood group O positive; GBS negative. Contractions began at 04:00 and are now regular. Membranes intact; fetal movements normal. She arrives at the birth suite with her partner at 08:20.</p>`,
    q:`What is your first priority?`,
    options:[
      {t:`Introduce yourself, confirm her identity, gain consent, and review her antenatal record and birth plan`, ok:true, fb:`Woman-centred care starts with an introduction, consent and a review of the antenatal history (risk factors, blood group, GBS status, birth preferences). This guides the rest of your assessment.`},
      {t:`Perform a vaginal examination straight away to see how far along she is`, ok:false, fb:`A VE is invasive and needs a clear indication and informed consent. Take a history and baseline observations first.`},
      {t:`Commence continuous CTG monitoring immediately`, ok:false, fb:`An admission CTG is not recommended for low-risk women; it increases intervention without improving outcomes. Assess first, then choose appropriate fetal surveillance.`},
      {t:`Advise her to go home because multiparous labours are long`, ok:false, fb:`Assess before deciding anything. Multiparous women often progress quickly.`},
    ]});

  add({ id:'obs', stage:0, tag:'Admission', title:'Baseline maternal observations', type:'tasks', dt:5,
    text:`<p>Emma consents to an assessment. Select the observations you would do now. Results appear on the live monitor.</p>`,
    q:`Choose all appropriate assessments:`,
    tasks:[
      {t:`Pulse`, ok:true, fb:`Pulse 82 bpm, regular. Normal.`, act(){ reveal('mhr'); }},
      {t:`Blood pressure`, ok:true, fb:`BP 118/74 mmHg. Normal; screens for hypertensive disorders of pregnancy.`, act(){ reveal('bp'); }},
      {t:`Temperature`, ok:true, fb:`36.8 °C. Afebrile (pyrexia ≥ 38 °C may indicate infection).`, act(){ reveal('temp'); }},
      {t:`Respiratory rate and SpO₂`, ok:true, fb:`RR 16/min, SpO₂ 98% on room air.`, act(){ reveal('rr', 'spo2'); }},
      {t:`Urinalysis`, ok:true, fb:`Urinalysis: no protein, glucose or ketones.`},
      {t:`Palpate contractions (frequency, duration, strength)`, ok:true, fb:`3 contractions in 10 min, lasting about 45–50 s, moderate strength.`, act(){ reveal('toco'); }},
      {t:`Insert an IV cannula routinely`, ok:false, fb:`Not routinely indicated for a low-risk woman. It restricts mobility and isn't an assessment.`},
      {t:`Perform an artificial rupture of membranes`, ok:false, fb:`Routine amniotomy is not recommended and is an intervention, not an assessment.`},
    ],
    doneFb:`Baseline observations are within normal limits. Document them, and plot them on the partogram once established labour is confirmed.`,
    learn:`Baseline observations: pulse, BP, temperature, RR/SpO₂, urinalysis and contraction pattern. Avoid routine interventions such as IV cannulation or amniotomy.`});

  add({ id:'sfh', stage:0, tag:'Abdominal palpation', title:'Symphysis–fundal height', type:'mcq', dt:4,
    enter(){ annot(`<path d="M150 286 C100 262 74 170 92 100 C108 44 160 14 205 12" fill="none" stroke="#e0a800" stroke-width="4" stroke-dasharray="1 7" stroke-linecap="round"/><circle cx="150" cy="286" r="4" fill="#e0a800"/><circle cx="205" cy="12" r="4" fill="#e0a800"/>` + svgLabel(128, 150, 'SFH 38 cm', '#b97c00')); },
    text:`<p>With Emma lying semi-recumbent (never flat), you measure from the upper border of the symphysis pubis to the top of the fundus, tape facing down to avoid bias: <b>38 cm</b>.</p>`,
    q:`At 39+4 weeks, how do you interpret this?`,
    options:[
      {t:`Consistent with gestation: within ±2 cm of gestational weeks`, ok:true, fb:`From 24 weeks, SFH in cm roughly equals gestational age in weeks (±2 cm). 38 cm at 39+4 is normal. Plot it on a customised growth chart.`},
      {t:`Small for dates: arrange an urgent growth scan`, ok:false, fb:`38 cm is within 2 cm of 39 weeks. A single measurement within range doesn't need a scan.`},
      {t:`Large for dates: suspect macrosomia`, ok:false, fb:`Large for dates would be more than 2 cm above the gestational age.`},
      {t:`SFH is meaningless at term, so ignore it`, ok:false, fb:`SFH remains a useful screening tool at term, and also confirms the uterus size matches dates.`},
    ]});

  add({ id:'leopold', stage:0, tag:'Abdominal palpation', title:"Leopold's manoeuvres", type:'order', dt:3,
    enter(){ annot(''); },
    text:`<p>Perform the four Leopold's manoeuvres <b>in the correct sequence</b>, between contractions, with warm hands. Each finding appears below.</p>`,
    q:`Select the manoeuvres in order:`,
    items:[
      {t:`Fundal grip`, short:`1 · Fundal grip`, fb:`A soft, broad, irregular mass at the fundus: the fetal <b>breech</b>.`, act(){ annot(`<ellipse cx="205" cy="30" rx="80" ry="22" fill="#0b7a83" opacity=".18" stroke="#0b7a83" stroke-dasharray="4 3"/>` + svgLabel(205, 34, '1 · Fundal grip')); }},
      {t:`Lateral (umbilical) grip`, short:`2 · Lateral grip`, fb:`Smooth, firm, continuous resistance on the mother's <b>left</b>: the fetal <b>back</b>. Small irregular parts (limbs) on the right.`, act(){ annot(`<ellipse cx="88" cy="150" rx="24" ry="62" fill="#0b7a83" opacity=".18" stroke="#0b7a83" stroke-dasharray="4 3"/>` + svgLabel(150, 150, '2 · Lateral grips (both sides)')); }},
      {t:`Pawlik's grip`, short:`3 · Pawlik's grip`, fb:`Just above the symphysis: a hard, round presenting part, the <b>head</b>. It is only slightly ballotable.`, act(){ annot(`<ellipse cx="170" cy="262" rx="34" ry="18" fill="#0b7a83" opacity=".18" stroke="#0b7a83" stroke-dasharray="4 3"/>` + svgLabel(110, 236, "3 · Pawlik's grip")); }},
      {t:`Pelvic (deep) grip`, short:`4 · Pelvic grip`, fb:`Facing her feet, your fingers diverge slightly over the head: <b>3/5 palpable</b> above the brim. Not yet engaged; head well flexed.`, act(){ annot(`<ellipse cx="200" cy="262" rx="46" ry="20" fill="#0b7a83" opacity=".18" stroke="#0b7a83" stroke-dasharray="4 3"/>` + svgArrow(150, 220, 175, 255) + svgArrow(255, 222, 232, 255) + svgLabel(205, 205, '4 · Pelvic grip')); }},
    ],
    distractors:[
      {t:`Deep palpation during a contraction`, fb:`Palpate between contractions. During one, the uterus is hard, findings are unreliable and it is painful for her.`},
    ],
    hint:`Leopold's sequence: fundus, then sides, then the presenting part (Pawlik's), then the pelvic grip facing her feet.`,
    doneFb:`Palpation is complete. Always explain each step and gain consent as you go.`,
    learn:`Leopold's manoeuvres in order: fundal grip (what is in the fundus), lateral grips (back vs limbs), Pawlik's grip (presenting part), pelvic grip (engagement in fifths palpable, flexion).`});

  add({ id:'lie', stage:0, tag:'Abdominal palpation', title:'Interpreting your findings', type:'mcq', dt:1,
    enter(){ annot(''); },
    text:`<p>Breech in the fundus, back on the mother's left, head presenting and flexed, 3/5 palpable.</p>`,
    q:`What are the lie, presentation and position?`,
    options:[
      {t:`Longitudinal lie, cephalic presentation, left occipito-anterior (LOA)`, ok:true, fb:`Back on the left anteriorly with a flexed head presenting: LOA, the most common and favourable position for labour. The inset shows the head as seen from below (occiput toward the mother's left-anterior).`},
      {t:`Transverse lie`, ok:false, fb:`In a transverse lie the poles are in the flanks and the fundus and pelvis feel empty.`},
      {t:`Longitudinal lie, breech presentation`, ok:false, fb:`The hard, round, ballotable pole is in the pelvis, so this is cephalic. The breech is in the fundus.`},
      {t:`Cephalic, right occipito-posterior (ROP)`, ok:false, fb:`In OP positions the back is felt posteriorly, with limbs across the front of the abdomen. Here the back is clearly left-anterior.`},
    ]});

  add({ id:'fh', stage:0, tag:'Fetal wellbeing', title:'Auscultating the fetal heart', type:'mcq', dt:2,
    enter(){ annot(`<circle cx="62" cy="214" r="10" fill="#0b7a83" opacity=".25" stroke="#0b7a83"/>` + svgLabel(62, 240, 'Doppler?')); },
    q:`Where do you place the hand-held Doppler to auscultate the fetal heart?`,
    options:[
      {t:`Below the umbilicus on the mother's left, over the fetal back/anterior shoulder`, ok:true, fb:`In LOA the fetal heart is best heard below the umbilicus on the left. Palpate the maternal pulse at the same time to tell the two apart. FHR: <b>140 bpm</b>, regular. The trace now starts on the monitor.`},
      {t:`Above the umbilicus on the right`, ok:false, fb:`That suits a breech presentation with the back on the right.`},
      {t:`Directly over the fundus`, ok:false, fb:`The fundus contains the breech; the heart is heard best through the fetal back, near the shoulder.`},
      {t:`Over the symphysis pubis`, ok:false, fb:`Too low. The fetal head is there, and the heart lies above it, through the back.`},
    ],
    after(){ reveal('fhr'); P.ctgOn = true; P.ctgMsg = ''; annot(`<circle cx="62" cy="214" r="10" fill="#1f9d63" opacity=".3" stroke="#1f9d63"/>` + svgLabel(62, 240, 'FH 140 bpm', '#1f9d63')); }});

  add({ id:'ve1', stage:0, tag:'Assessment', title:'Vaginal examination and diagnosing labour', type:'mcq', dt:5,
    enter(){ annot(''); P.dil = 4; reveal('dil', 'stn'); setFT({s:-0.3}); chips({'Engagement':'active'}); },
    text:`<p>With Emma's informed consent and privacy, a VE finds the cervix <b>4 cm dilated</b>, fully effaced, soft and well applied to the head. Vertex at station <b>−2</b>, LOA. Membranes intact. Contractions 3 in 10.</p>`,
    q:`What is your diagnosis?`,
    options:[
      {t:`Established (active) first stage of labour`, ok:true, fb:`Regular painful contractions with progressive cervical change from about 4–5 cm mark established labour. Document the findings and start a partogram.`},
      {t:`Latent phase: send her home`, ok:false, fb:`Regular contractions with 4 cm dilatation and full effacement in a multipara indicates established labour.`},
      {t:`Second stage of labour`, ok:false, fb:`The second stage begins at full dilatation (10 cm).`},
      {t:`False (prodromal) labour`, ok:false, fb:`False labour causes no cervical change. Here the cervix is 4 cm and effaced.`},
    ]});

  /* ---------------- FIRST STAGE ---------------- */
  add({ id:'monitor', stage:1, tag:'First stage', title:'Fetal monitoring plan', type:'mcq', dt:3,
    enter(){ contr(15, 8, 50); },
    text:`<p>Emma has no risk factors.</p>`,
    q:`Which fetal heart rate monitoring is recommended in the active first stage?`,
    options:[
      {t:`Intermittent auscultation for 60 s after a contraction, every 15–30 minutes, palpating the maternal pulse`, ok:true, fb:`Intermittent auscultation is recommended for low-risk women (RANZCOG IFS guideline). <i>The simulator shows a continuous trace so you can watch the patterns.</i>`},
      {t:`Continuous CTG for every woman in labour`, ok:false, fb:`Continuous CTG is indicated when risk factors are present. In low-risk women it increases caesarean and instrumental birth without improving neonatal outcomes.`},
      {t:`Auscultate once every 2 hours`, ok:false, fb:`Far too infrequent to detect fetal compromise.`},
      {t:`No fetal monitoring is needed in a low-risk labour`, ok:false, fb:`All women in labour need fetal heart rate surveillance appropriate to their risk.`},
    ]});

  add({ id:'support', stage:1, tag:'First stage', title:'Supportive care in labour', type:'multi', dt:5,
    q:`Which care measures are appropriate for Emma now?`,
    options:[
      {t:`Continuous one-to-one support`, ok:true, fb:`Continuous support improves outcomes and satisfaction.`},
      {t:`Encourage mobility and upright or forward-leaning positions`, ok:true, fb:`Upright positions shorten the first stage and use gravity.`},
      {t:`Offer oral fluids and a light diet as tolerated`, ok:true, fb:`Prevents dehydration and ketosis in low-risk women.`},
      {t:`Encourage her to empty her bladder every 2–4 hours`, ok:true, fb:`A full bladder can impede descent and contractions.`},
      {t:`Discuss pain relief options: water immersion, heat, TENS, nitrous oxide, opioids, epidural`, ok:true, fb:`Informed choice of non-pharmacological and pharmacological options.`},
      {t:`Keep her lying flat on her back`, ok:false, fb:`The supine position causes aortocaval compression, reducing placental perfusion.`},
      {t:`Give a routine enema`, ok:false, fb:`No evidence of benefit, and it causes discomfort.`},
      {t:`Restrict all oral intake`, ok:false, fb:`Unnecessary for low-risk women.`},
    ],
    doneFb:`Continuous support, mobility, hydration, bladder care and informed pain relief choices are core midwifery care in the first stage.`});

  add({ id:'adv1', stage:1, tag:'First stage', title:'Labour progressing', type:'advance', dur:5, mins:150,
    text:`<p>Monitor the contractions and fetal heart while labour progresses. Press <b>Advance labour</b> to fast-forward about 2½ hours of care (4-hourly VEs, hourly pulse, half-hourly contractions, regular FHR auscultation).</p>`,
    start(){ contr(15, 8.5, 60); },
    prog(t){ P.dil = lerp(4, 7, t); FT.s = lerp(-0.3, -0.15, t); },
    doneText:`Contractions are now 4 in 10, strong, lasting about 60 s. VE: cervix <b>7 cm</b>, station <b>−1</b>, LOA. Progress is normal on the partogram (about 1 cm/hour or more).`});

  add({ id:'srom', stage:1, tag:'First stage', title:'Spontaneous rupture of membranes', type:'mcq', dt:10,
    enter(){ annot(svgLabel(255, 270, 'SROM', '#4a7fc1', 'start')); T.srom = SIM.clock; },
    text:`<p>During a contraction Emma feels a sudden gush of fluid. Her membranes have ruptured spontaneously.</p>`,
    q:`What do you assess first?`,
    options:[
      {t:`Auscultate the fetal heart, and note the colour, volume and odour of the liquor`, ok:true, fb:`After SROM, listen to the FHR (cord prolapse or compression can cause bradycardia) and inspect the liquor. Clear is reassuring; meconium- or blood-stained liquor needs escalation. Here: <b>clear liquor, FHR 138 bpm</b>.`},
      {t:`Do a VE immediately in every case`, ok:false, fb:`A VE after SROM is indicated if cord prolapse is suspected (abnormal FHR, high or ill-fitting presenting part), not routinely.`},
      {t:`Start IV antibiotics`, ok:false, fb:`Antibiotics aren't indicated for SROM in established labour at term without risk factors (she is GBS negative).`},
      {t:`No action is needed`, ok:false, fb:`Always check the FHR and the liquor after membranes rupture.`},
    ],
    after(){ annot(''); }});

  if (c.brady){
    add({ id:'brady', stage:1, tag:'Complication', title:'Fetal heart rate abnormality', type:'tasks', dt:2,
      enter(){ encounter('brady'); P.fhrMode = 'late'; P.accels = false; later(() => { if (P.fhrMode === 'late') P.fhrMode = 'brady'; }, 9000);
        annot(svgLabel(300, 170, 'FHR ↓', '#d64b3c')); },
      text:`<p>At 8 cm, intermittent auscultation after a contraction finds the FHR dropping to about 90 bpm with slow recovery. You start continuous CTG. It shows <b>late decelerations</b>, then a <b>prolonged deceleration</b> (~85 bpm) with reduced variability. Watch the monitor.</p>`,
      q:`Select all appropriate immediate actions:`,
      tasks:[
        {t:`Call for help: escalate to the obstetric team (emergency bell if prolonged)`, ok:true, fb:`Senior midwife and obstetric registrar attending.`},
        {t:`Reposition Emma to left lateral`, ok:true, fb:`Left lateral relieves aortocaval and cord compression, improving placental perfusion.`},
        {t:`Palpate the maternal pulse to confirm the trace is fetal`, ok:true, fb:`Maternal HR 86 bpm, distinct from the FHR, so the trace is fetal.`},
        {t:`Check maternal BP; IV access and fluids if hypotensive`, ok:true, fb:`BP 112/70 mmHg. IV cannula inserted; fluids given if hypotensive.`},
        {t:`VE to exclude cord prolapse and assess progress`, ok:true, fb:`No cord felt. Cervix 8 cm, station −1.`},
        {t:`Lie her flat on her back`, ok:false, fb:`Supine positioning worsens aortocaval compression and fetal hypoxia.`},
        {t:`Encourage her to push to speed up the birth`, ok:false, fb:`She is not fully dilated. Pushing now risks cervical trauma and worsens fetal compromise.`},
        {t:`Reassess in 30 minutes`, ok:false, fb:`A prolonged deceleration needs immediate action, not delay.`},
      ],
      doneFb:`After intrauterine resuscitation the FHR recovers to a baseline of 140 bpm with normal variability. The registrar reviews: continue continuous CTG with a low threshold for expedited birth if abnormalities recur. Document times and actions.`,
      learn:`Abnormal FHR: call for help, left lateral position, distinguish maternal from fetal heart rate, check BP and give fluids, exclude cord prolapse, stop oxytocin if running, and prepare for expedited birth if no recovery.`,
      after(){ P.fhrMode = 'normal'; P.accels = true; P.accelT = 8; annot(''); }});
    add({ id:'bradQ', stage:1, tag:'Complication', title:'CTG interpretation', type:'mcq', dt:15,
      q:`Recurrent <b>late</b> decelerations (starting after the peak of the contraction, with the nadir after the peak) are most associated with:`,
      options:[
        {t:`Uteroplacental insufficiency and fetal hypoxaemia`, ok:true, fb:`Late decelerations reflect reduced uteroplacental perfusion and need prompt evaluation and escalation, especially with reduced variability or tachycardia.`},
        {t:`Head compression`, ok:false, fb:`Head compression causes <b>early</b> decelerations that mirror the contraction (nadir at its peak). They are usually benign, especially in the second stage.`},
        {t:`Umbilical cord compression`, ok:false, fb:`Cord compression typically causes <b>variable</b> decelerations: abrupt drops of varying shape and timing.`},
        {t:`Fetal sleep cycle`, ok:false, fb:`Fetal sleep causes reduced variability for up to about 40 minutes, not decelerations.`},
      ]});
  }

  add({ id:'adv2', stage:1, tag:'First stage', title:'Transition', type:'advance', dur:4, mins:c.brady ? 40 : 55,
    text:`<p>Contractions intensify. Press <b>Advance labour</b> to continue.</p>`,
    start(){ contr(13, 8, 72); },
    prog(t){ P.dil = lerp(7, 10, t); FT.s = lerp(-0.15, 0, t); FT.ha = -6 - 2 * t; if (t > 0.9) chip('Engagement', 'done'); },
    doneHead:'Transition',
    doneText:`Emma becomes restless and says she can't do this any more. She feels an involuntary urge to bear down and rectal pressure.`});

  add({ id:'full', stage:1, tag:'Second stage', title:'Confirming the second stage', type:'mcq', dt:3,
    enter(){ P.dil = 10; T.full = SIM.clock; chips({'Engagement':'done', 'Descent':'active'}); },
    text:`<p>With consent, a VE confirms the cervix is <b>fully dilated (10 cm)</b>. Vertex at station <b>0</b> (level with the ischial spines), LOA, no caput or moulding.</p>`,
    q:`What is the most appropriate approach to pushing?`,
    options:[
      {t:`Support spontaneous pushing with her urge, in an upright or other position of her choice`, ok:true, fb:`Spontaneous, woman-directed pushing is recommended. Upright and lateral positions widen the pelvic outlet. Auscultate the FHR at least every 5 minutes or after each contraction.`},
      {t:`Coach sustained breath-holding (10-second Valsalva, three per contraction) regardless of urge`, ok:false, fb:`Prolonged directed Valsalva can reduce fetal oxygenation and increase perineal trauma. Reserve directed pushing for specific situations, such as an epidural with no urge.`},
      {t:`Lie her flat with legs in stirrups (lithotomy)`, ok:false, fb:`Lithotomy narrows the outlet, increases perineal trauma and aortocaval compression.`},
      {t:`Tell her not to push until the head is visible`, ok:false, fb:`With full dilatation and a strong urge, suppressing it is distressing and unnecessary.`},
    ]});

  /* ---------------- SECOND STAGE ---------------- */
  add({ id:'push', stage:2, tag:'Second stage', title:'Pushing with contractions', type:'push',
    enter(){ contr(12, 7, 82); P.earlyDecels = true; P.accels = false; },
    text:`<p>Hold <b>PUSH</b> (or the <b>Space</b> bar) only <b>while a contraction is active</b>: watch the contraction meter and the toco trace. Release and rest between contractions. Watch the fetus descend, flex and rotate (LOA → OA) in the diagrams.</p>`});

  add({ id:'crown', stage:2, tag:'Second stage', title:'Crowning', type:'mcq', dt:2,
    enter(){ setFT({s:0.72, ha:-14, ins:0}); chip('Extension', 'active'); annot(svgLabel(250, 420, 'Crowning', '#b97c00', 'start')); },
    text:`<p>The head is <b>crowning</b>: the biparietal diameter is distending the perineum and no longer recedes between contractions. Emma feels intense stinging.</p>`,
    q:`How do you manage the birth of the head?`,
    options:[
      {t:`Encourage her to breathe or pant through contractions with small, gentle pushes so the head is born slowly, with hands-on perineal support and a warm compress`, ok:true, fb:`A slow, controlled birth of the head with hands-on support reduces severe perineal trauma (OASI), in line with Australian perineal protection bundles.`},
      {t:`Ask her to push as hard as she can to get it over with`, ok:false, fb:`Rapid, uncontrolled birth of the head increases the risk of severe perineal tears.`},
      {t:`Perform a routine episiotomy`, ok:false, fb:`Routine episiotomy is not recommended. Reserve it for indications such as fetal compromise or an instrumental birth.`},
      {t:`Apply fundal pressure`, ok:false, fb:`Fundal pressure is not recommended and can cause uterine and perineal trauma.`},
    ],
    after(){ annot(''); setFT({s:0.95, ha:36}); later(() => { chip('Extension', 'done'); annot(svgLabel(250, 420, 'Head born by extension', '#1f9d63', 'start')); }, 900); }});

  add({ id:'head', stage:2, tag:'Second stage', title:'After the birth of the head', type:'mcq', dt:1,
    enter(){ T.head = SIM.clock; },
    text:`<p>The head is born by <b>extension</b>: the occiput pivots under the symphysis, then the brow, face and chin sweep the perineum. Time noted.</p>`,
    q:`What do you do now?`,
    options:[
      {t:`Note the time, and feel for a nuchal cord around the baby's neck`, ok:true, fb:`Check for a nuchal cord and note the time of birth of the head. This becomes crucial if the shoulders don't follow.`},
      {t:`Pull the head down firmly to deliver the shoulders straight away`, ok:false, fb:`Wait for restitution and the next contraction. Traction before restitution risks brachial plexus injury.`},
      {t:`Routinely suction the baby's mouth and nose`, ok:false, fb:`Routine oro- or nasopharyngeal suction is not recommended, even with meconium-stained liquor in a vigorous baby.`},
      {t:`Clamp and cut the cord now`, ok:false, fb:`There's no indication. The cord is the baby's oxygen supply until breathing is established.`},
    ]});

  add({ id:'nuchal', stage:2, tag:'Second stage', title:'Nuchal cord', type:'mcq',
    enter(){ $('#nuchal').style.display = ''; annot(svgLabel(250, 420, 'Loose nuchal cord', '#4a7fc1', 'start')); },
    text:`<p>You feel a <b>loose loop of cord</b> around the baby's neck.</p>`,
    q:`What is the best action?`,
    options:[
      {t:`Gently slip the loop over the head, or leave it and keep the head close to the perineum as the body is born (somersault manoeuvre)`, ok:true, fb:`Loose nuchal cords are common (about 1 in 4 births). Reduce them gently, or use the somersault manoeuvre. Clamping and cutting is reserved for a tight cord that cannot be reduced.`},
      {t:`Clamp and cut the cord before the shoulders are born`, ok:false, fb:`Cutting the cord before birth removes the baby's oxygen supply. If shoulder dystocia then occurs, the baby is at much greater risk of hypoxia.`},
      {t:`Pull on the cord to loosen it`, ok:false, fb:`Traction on the cord can tear it or cause it to spasm.`},
      {t:`Ignore it and pull the baby out quickly`, ok:false, fb:`Always manage the cord deliberately. Rapid traction risks injury.`},
    ],
    after(){ later(() => { $('#nuchal').style.display = 'none'; annot(''); }, 800); }});

  add({ id:'restit', stage:2, tag:'Second stage', title:'Restitution and external rotation', type:'mcq', dt:1,
    text:`<p>The baby's head is born facing the mother's sacrum (OA). The shoulders are still in the oblique diameter of the pelvis.</p>`,
    q:`What happens next, and what do you do?`,
    options:[
      {t:`Wait, hands off, for the head to restitute and then externally rotate with the next contraction as the shoulders rotate into the anteroposterior diameter`, ok:true, fb:`Restitution untwists the neck (back to LOA); external rotation follows as the shoulders rotate internally. The face then turns to the mother's left thigh.`},
      {t:`Rotate the head forcefully to face the mother's thigh`, ok:false, fb:`Let rotation happen spontaneously. Forced rotation can injure the neck and brachial plexus.`},
      {t:`Apply firm downward traction immediately`, ok:false, fb:`Wait for the next contraction and external rotation before gentle axial traction.`},
      {t:`Ask her to push continuously without stopping`, ok:false, fb:`Await the next contraction; continuous pushing doesn't help rotation.`},
    ],
    after(){ if (!c.sd){ chip('Restitution', 'active'); setFT({ins:45}); later(() => { chip('Restitution', 'done'); chip('External rotation', 'active'); setFT({ins:90}); }, 1500); later(() => chip('External rotation', 'done'), 3000); } }});

  if (c.sd){
    add({ id:'sd', stage:2, tag:'Emergency', title:'Shoulder dystocia: HELPERR', type:'order', pts:15,
      enter(){ encounter('sd'); setFT({s:0.86}); annot(svgLabel(250, 420, 'Turtle sign', '#d64b3c', 'start') + svgArrow(200, 404, 214, 380, 'r')); P.fhrMode = 'normal'; },
      text:() => `<p>With the next contraction the head does <b>not</b> restitute. It retracts tightly against the perineum (<b>the turtle sign</b>), and routine axial traction fails to deliver the anterior shoulder. <b>Shoulder dystocia.</b> Head born at ${fmtClock(T.head || SIM.clock)}.</p>`,
      q:`Act in the right sequence:`,
      items:[
        {t:`Call for HELP: emergency bell; senior midwife, obstetrician, neonatal team, anaesthetist`, short:`H · Help`, grp:1, fb:`Help called. Ask Emma to stop pushing; a scribe records times.`},
        {t:`Evaluate for episiotomy (to make room for internal manoeuvres)`, short:`E · Evaluate for episiotomy`, grp:2, fb:`Episiotomy does not relieve the bony obstruction but may help access for internal manoeuvres. Not needed yet.`},
        {t:`Legs: McRoberts manoeuvre (lie her flat and hyperflex her thighs onto her abdomen)`, short:`L · Legs (McRoberts)`, grp:2, fb:`McRoberts flattens the lumbosacral angle and rotates the symphysis upward. It resolves about 40% of cases on its own.`,
          act(){ annot(svgLabel(300, 60, 'McRoberts: thighs hyperflexed', '#0b7a83') + svgLabel(250, 420, 'Turtle sign', '#d64b3c', 'start')); }},
        {t:`Pressure: suprapubic pressure from the side of the fetal back, with routine axial traction`, short:`P · Suprapubic pressure`, grp:3, fb:`Continuous, then rocking, pressure on the posterior aspect of the anterior shoulder adducts it into the oblique diameter. With McRoberts it resolves most cases.`,
          act(){ annot(svgLabel(300, 60, 'McRoberts: thighs hyperflexed', '#0b7a83') + svgArrow(70, 240, 128, 290, 'o') + svgLabel(60, 228, 'Suprapubic pressure', '#b97c00')); }},
      ],
      distractors:[
        {t:`Apply fundal pressure`, fb:`<b>Contraindicated.</b> Fundal pressure worsens impaction and risks uterine rupture and brachial plexus injury.`},
        {t:`Apply strong lateral traction on the head`, fb:`<b>Dangerous.</b> Excessive or lateral traction is a major cause of brachial plexus injury (Erb's palsy). Use routine axial traction only.`},
        {t:`Clamp and cut the cord to free the baby`, fb:`Cutting the cord removes any remaining oxygen supply and doesn't release the shoulder.`},
      ],
      hint:`HELPERR: call for Help first, then Legs (McRoberts) ± Evaluate for episiotomy, then suprapubic Pressure; then Enter, Remove the posterior arm, Roll.`,
      doneFb:`The anterior shoulder is released with McRoberts and suprapubic pressure. If these had failed you would continue: <b>E</b>nter (internal rotational manoeuvres: Rubin II, Woods' screw), <b>R</b>emove the posterior arm, <b>R</b>oll to all-fours. Head-to-body interval: about 2 minutes. Document everything and debrief the family.`,
      learn:`Shoulder dystocia (HELPERR): call for help; McRoberts and suprapubic pressure first (most cases resolve); then internal manoeuvres, posterior arm, all-fours. Never use fundal pressure or excessive or lateral traction. Record the head-to-body interval.`,
      after(){ addMin(2); setFT({s:1.05, ins:90}); chips({'Engagement':'done','Descent':'done','Flexion':'done','Internal rotation':'done','Extension':'done','Restitution':'done','External rotation':'done'}); later(() => annot(svgLabel(250, 420, 'Anterior shoulder released', '#1f9d63', 'start')), 600); }});
  } else {
    add({ id:'antsh', stage:2, tag:'Second stage', title:'Birth of the anterior shoulder', type:'mcq',
      enter(){ annot(''); },
      text:`<p>External rotation is complete: the baby faces the mother's left thigh. With the next contraction:</p>`,
      q:`How do you assist the birth of the anterior shoulder?`,
      options:[
        {t:`Gentle axial traction downwards (in line with the fetal spine) to free the anterior shoulder under the symphysis`, ok:true, fb:`Gentle axial traction slides the anterior shoulder under the pubic arch. Avoid lateral flexion of the neck.`},
        {t:`Upward traction towards the mother's abdomen first`, ok:false, fb:`Upward guidance is for the <b>posterior</b> shoulder, after the anterior shoulder is born.`},
        {t:`Strong traction with lateral flexion of the neck`, ok:false, fb:`Excessive or lateral traction risks brachial plexus injury.`},
        {t:`Hook a finger into the axilla routinely`, ok:false, fb:`Not routine; axillary traction is an advanced manoeuvre for specific situations.`},
      ],
      after(){ setFT({s:1.05, oy:4}); annot(svgArrow(120, 392, 122, 436) + svgLabel(250, 420, 'Gentle axial traction', '#0b7a83', 'start')); }});
  }

  add({ id:'body', stage:2, tag:'Second stage', title:'Birth of the posterior shoulder and body', type:'mcq',
    q:`The anterior shoulder is born. Now:`,
    options:[
      {t:`Guide the baby upwards towards the mother's abdomen to birth the posterior shoulder; the body follows by lateral flexion. Lift the baby onto her chest`, ok:true, fb:`Following the curve of Carus, upward guidance births the posterior shoulder over the perineum, then the body is born by lateral flexion (<b>expulsion</b>).`},
      {t:`Keep pulling downwards`, ok:false, fb:`Continued downward traction doesn't follow the curve of the birth canal and increases perineal trauma.`},
      {t:`Pull the baby out by the head as fast as possible`, ok:false, fb:`Gentle, controlled birth of the body reduces trauma to mother and baby.`},
      {t:`Wait 10 minutes for the next set of contractions`, ok:false, fb:`The body normally follows the shoulders within the same or the next contraction.`},
    ],
    after(){
      annot(svgArrow(118, 420, 80, 380) + svgLabel(250, 420, 'Expulsion', '#0b7a83', 'start'));
      setFT({s:1.12, oy:-6}); chip('Expulsion', 'active');
      later(() => { setFT({s:1.45, op:0}); }, 700);
      later(() => { addMin(1); T.birth = SIM.clock; SIM.born = true; P.ctgOn = false; P.ctgMsg = 'CTG discontinued: baby born ' + fmtClock(T.birth); P.earlyDecels = false; P.pushing = false;
        contr(26, 8, 28); setScene('post'); showDrape(true); annot(''); P.ebl = 120; P3.pink = 0.15; P3.pinkT = 0.3;
        chips({'Engagement':'done','Descent':'done','Flexion':'done','Internal rotation':'done','Extension':'done','Restitution':'done','External rotation':'done','Expulsion':'done'}); renderHeader(); renderTiles(true);
        const n = $('#scenBody .narr'); if (n) n.insertAdjacentHTML('beforeend', `<p><b>Baby girl born at ${fmtClock(T.birth)}.</b></p>`); }, 1700);
    }});

  /* ---------------- BIRTH & NEWBORN ---------------- */
  add({ id:'skin', stage:3, tag:'Newborn', title:'Immediate newborn care', type:'mcq', dt:0.5,
    enter(){ if (!SIM.born){ SIM.born = true; T.birth = T.birth || SIM.clock; setScene('post'); showDrape(true); P.ctgOn = false; } },
    text:() => `<p>The baby girl is born at <b>${fmtClock(T.birth)}</b> and lifted straight onto Emma's chest. She is wet and pale-blue, and ${c.brady ? 'slightly floppy with irregular breaths' : 'starting to cry'}.</p>`,
    q:`What do you do in the first minute?`,
    options:[
      {t:`Skin-to-skin on Emma's chest. Dry her thoroughly with a warm towel (stimulating as you dry), remove the wet towel, cover her with a warm dry towel and hat, and assess breathing, tone and heart rate`, ok:true, fb:`Drying provides warmth and tactile stimulation. Skin-to-skin supports thermoregulation, bonding and breastfeeding. Keep assessing breathing, tone and heart rate.`},
      {t:`Take the baby to the resuscitaire for routine suctioning`, ok:false, fb:`Routine suctioning isn't recommended, and separating mother and baby interrupts thermoregulation and bonding. Vigorous or responsive babies stay skin-to-skin.`},
      {t:`Bath the baby straight away`, ok:false, fb:`Delay the first bath (ideally 24 hours or more) because of the risk of hypothermia.`},
      {t:`Hold the baby upside down and pat her back`, ok:false, fb:`Not appropriate. Gentle drying provides adequate stimulation.`},
    ],
    after(){ P3.towel = true; P3.hat = true; P3.pinkT = 0.62; }});

  add({ id:'oxy', stage:3, tag:'Third stage', title:'Active management: uterotonic', type:'mcq', dt:0.5,
    text:`<p>Emma consented antenatally to <b>active management</b> of the third stage. You palpate her abdomen.</p>`,
    q:`Which uterotonic, and when?`,
    options:[
      {t:`Oxytocin 10 IU IM within about 1 minute of the birth, after confirming there is no second baby`, ok:true, fb:`Oxytocin 10 IU IM is first-line prophylaxis and significantly reduces PPH. Always palpate first to exclude an undiagnosed twin. It can be given with the cord intact.`},
      {t:`Ergometrine IV routinely`, ok:false, fb:`Ergometrine causes vasoconstriction and hypertension. It is contraindicated in hypertension or pre-eclampsia and is not first-line for routine prophylaxis.`},
      {t:`No uterotonic until the placenta is born`, ok:false, fb:`That describes physiological management, a valid informed choice, but Emma chose active management.`},
      {t:`Oxytocin 10 IU as a rapid IV push`, ok:false, fb:`Rapid IV bolus can cause hypotension and tachycardia. IM is standard for prophylaxis.`},
    ]});

  add({ id:'apgar1', stage:3, tag:'Newborn', title:'Apgar score at 1 minute', type:'apgar', min:1,
    enter(st){ SIM.clock = T.birth + 1; P3.pinkT = c.brady ? 0.5 : 0.65; },
    text:`<p>Score each component from your observations at 1 minute of age (baby remains skin-to-skin).</p>`,
    obs: c.brady ? [`Auscultated: 112 bpm`, `Weak, irregular breaths, improving with drying`, `Some flexion of the limbs`, `Grimaces when stimulated`, `Body pink, hands and feet blue`]
                 : [`Auscultated: 138 bpm`, `Crying, regular breathing`, `Some flexion of the arms and legs`, `Cries vigorously when dried`, `Body pink, hands and feet blue`],
    vals: c.brady ? [2, 1, 1, 1, 1] : [2, 2, 1, 2, 1],
    interp: c.brady ? `A score of 6 at 1 minute: keep drying and stimulating, keep her warm and reassess HR and breathing. Call for neonatal review and be ready to move to the resuscitaire if HR &lt; 100 or breathing is inadequate. Resuscitation decisions follow HR, breathing and tone (ANZCOR); don't wait for the Apgar score.` : `A score of 8 at 1 minute is reassuring (7–10 is normal). Peripheral cyanosis (acrocyanosis) is common in the first minutes.`,
    learn:`Apgar (HR, respiratory effort, tone, reflex irritability, colour) at 1 and 5 minutes; 7–10 is reassuring. Resuscitation decisions follow HR, breathing and tone, not the Apgar.`});

  add({ id:'dcc', stage:3, tag:'Third stage', title:'Timing of cord clamping', type:'mcq', dt:0.5,
    text:() => `<p>The baby ${c.brady ? 'is now breathing regularly and pinking up with stimulation' : 'is pink, breathing well and crying'}, skin-to-skin.</p>`,
    q:`When should the cord be clamped?`,
    options:[
      {t:`Defer clamping for at least 1–3 minutes (or until pulsation stops) while she stays skin-to-skin`, ok:true, fb:`Deferred cord clamping improves iron stores and haemoglobin in term babies (and survival in preterm babies). It is recommended for vigorous babies, including with active management.`},
      {t:`Clamp immediately so that the oxytocin can be given`, ok:false, fb:`Oxytocin can be given with the cord intact. Immediate clamping is reserved for situations such as a baby needing resuscitation away from the mother.`},
      {t:`Clamp at 10 seconds as a routine`, ok:false, fb:`Too early. At least 60 seconds is recommended in a well baby.`},
      {t:`Clamp only once the placenta has delivered, in every case`, ok:false, fb:`Not required. Clamping after 1–3 minutes achieves the benefit.`},
    ]});

  add({ id:'cut', stage:3, tag:'Third stage', title:'Clamping and cutting the cord', type:'order',
    enter(){ SIM.clock = T.birth + 3; },
    text:`<p>At about 3 minutes the cord has stopped pulsating. Emma's partner would like to cut it.</p>`,
    q:`Perform these steps in order:`,
    items:[
      {t:`Apply the first (plastic) cord clamp about 3–4 cm from the baby's umbilicus`, short:`Clamp 1`, fb:`Secure clamp near the baby, not touching the skin.`, act(){ P3.clamp1 = true; }},
      {t:`Apply a second clamp a few centimetres further towards the mother`, short:`Clamp 2`, fb:`The second clamp prevents blood spilling from the placental end.`, act(){ P3.clamp2 = true; }},
      {t:`Shield with gauze and cut between the clamps (guide the partner)`, short:`Cut`, fb:`Cord cut between the clamps.`, act(){ P3.cut = true; }},
      {t:`Check the clamp is secure and the stump isn't bleeding`, short:`Check`, fb:`Clamp secure, no oozing. Note the number of cord vessels later at placental inspection.`},
    ],
    distractors:[
      {t:`Cut the cord before any clamp is applied`, fb:`This would cause bleeding from both ends.`},
      {t:`Apply the clamp flush against the baby's skin`, fb:`Clamping against the skin can pinch or injure it. Leave a stump of about 3–4 cm.`},
    ],
    hint:`Clamp near the baby first, then the maternal side, cut between them, then check.`,
    doneFb:`The cord is clamped and cut. The baby stays skin-to-skin.`,
    learn:`Clamp about 3–4 cm from the umbilicus, apply a second clamp, cut between them under gauze, then check the clamp for security and bleeding.`});

  add({ id:'apgar5', stage:3, tag:'Newborn', title:'Apgar score at 5 minutes', type:'apgar', min:5,
    enter(){ SIM.clock = T.birth + 5; P3.pinkT = 0.85; },
    text:`<p>At 5 minutes of age, reassess.</p>`,
    obs:[`Auscultated: 148 bpm`, `Regular breathing, crying`, `Active movement, well flexed`, `Cries and pulls away when stimulated`, `Body pink, hands and feet still slightly blue`],
    vals:[2, 2, 2, 2, 1],
    interp:`A 5-minute Apgar of 9 is reassuring. If the 5-minute score were below 7, you would repeat it every 5 minutes up to 20 minutes.`,
    learn:`Repeat the Apgar at 5 minutes (and every 5 minutes up to 20 if below 7).`});

  /* ---------------- THIRD STAGE ---------------- */
  add({ id:'sep', stage:4, tag:'Third stage', title:'Signs of placental separation', type:'multi',
    enter(){ SIM.clock = T.birth + 8; P3.kT = 0.55; P3.ppT = 0.18; P.ebl = Math.max(P.ebl, 200); annot(svgLabel(250, 420, 'Cord lengthening', '#4a7fc1', 'start')); },
    text:`<p>You keep a hand lightly on the fundus without massaging it, watching for separation.</p>`,
    q:`Which signs suggest the placenta has separated?`,
    options:[
      {t:`Lengthening of the cord at the introitus`, ok:true, fb:`The placenta has descended into the lower segment.`},
      {t:`A small gush of blood`, ok:true, fb:`From the retroplacental clot as it separates.`},
      {t:`The uterus becomes firm, smaller and globular, and rises in the abdomen`, ok:true, fb:`The contracted uterus is displaced upwards by the placenta in the lower segment.`},
      {t:`Sudden severe abdominal pain with maternal collapse`, ok:false, fb:`This warns of an emergency such as uterine inversion or rupture, not normal separation.`},
      {t:`Maternal bradycardia`, ok:false, fb:`Not a sign of separation.`},
      {t:`The fundus becomes soft and boggy`, ok:false, fb:`A soft, boggy uterus suggests atony, a PPH risk, not separation.`},
    ],
    doneFb:`Signs of separation: cord lengthening, a small gush of blood, and a firm, globular uterus that rises. Only then apply controlled cord traction.`});

  add({ id:'cct', stage:4, tag:'Third stage', title:'Delivering the placenta', type:'mcq', dt:1,
    enter(){ annot(''); },
    q:`How do you deliver the placenta?`,
    options:[
      {t:`With a contraction, apply controlled cord traction downwards while guarding the uterus with counter-pressure above the symphysis (Brandt–Andrews)`, ok:true, fb:`CCT with uterine guarding, only after a uterotonic and with signs of separation, reduces blood loss and prevents uterine inversion. Ease the membranes out with a gentle twisting motion.`},
      {t:`Pull firmly on the cord without supporting the uterus`, ok:false, fb:`This risks cord avulsion or <b>uterine inversion</b>, a life-threatening emergency.`},
      {t:`Push hard on the fundus to expel the placenta`, ok:false, fb:`Fundal pressure is not recommended and can contribute to inversion.`},
      {t:`Manual removal straight away`, ok:false, fb:`Manual removal is done under anaesthesia and reserved for retained placenta (for example beyond 30 minutes with active management) or haemorrhage.`},
    ],
    after(){ annot(svgArrow(176, 404, 150, 440) + svgArrow(84, 300, 118, 274, 'o') + svgLabel(70, 318, 'Guarding', '#b97c00')); P3.ppT = 1;
      later(() => { P3.placVis = false; P3.clamp2 = false; T.placenta = SIM.clock; P.ebl = Math.max(P.ebl, 300); annot(svgLabel(250, 420, 'Placenta delivered', '#1f9d63', 'start')); }, 2600); }});

  add({ id:'inspect', stage:4, tag:'Third stage', title:'Inspecting the placenta', type:'multi', dt:3,
    enter(){ if (P3.placVis){ P3.placVis = false; T.placenta = T.placenta || SIM.clock; P.ebl = Math.max(P.ebl, 300); } annot(''); },
    text:PLAC_FIG,
    q:`Which checks make up a thorough placental inspection?`,
    options:[
      {t:`Maternal surface: all cotyledons present, none missing or ragged`, ok:true, fb:`Missing cotyledons suggest retained tissue (risk of PPH and infection).`},
      {t:`Membranes complete (amnion and chorion), with no vessels running to a torn edge`, ok:true, fb:`Vessels to a ragged edge suggest a retained succenturiate lobe.`},
      {t:`Cord: count the vessels (2 arteries, 1 vein)`, ok:true, fb:`A single umbilical artery is associated with fetal anomalies; inform the paediatric team.`},
      {t:`Note the cord insertion and length (central, eccentric, marginal, velamentous)`, ok:true, fb:`Velamentous insertion has a risk of vasa praevia and vessel rupture.`},
      {t:`Skip the inspection if the third stage was quick`, ok:false, fb:`Inspect every placenta, however quick the third stage.`},
      {t:`Only check the colour`, ok:false, fb:`Colour alone tells you little about completeness.`},
    ],
    doneFb:`Findings: complete cotyledons and membranes, 3-vessel cord, central insertion. Retained tissue is one of the 4 Ts of PPH (Tissue). Document findings; dispose of the placenta or return it to the family per their wishes and policy.`});

  add({ id:'perineum', stage:4, tag:'Third stage', title:'Perineal assessment', type:'mcq', dt:4,
    text:`<p>With consent and adequate analgesia, you inspect the perineum and find a small <b>first-degree tear</b> (perineal skin only), edges well apposed, not bleeding.</p>`,
    q:`What is your next step?`,
    options:[
      {t:`Complete a systematic assessment, including a rectal examination (with consent) to exclude anal sphincter injury, then discuss management (a small, well-apposed first-degree tear may be left unsutured)`, ok:true, fb:`Every woman with perineal trauma should have a systematic examination, including a PR, to exclude obstetric anal sphincter injury (OASI). Document findings and plan care with her.`},
      {t:`No assessment is needed after a normal birth`, ok:false, fb:`Inspect every perineum after vaginal birth. Missed OASI causes long-term morbidity.`},
      {t:`Transfer to theatre to suture every tear`, ok:false, fb:`Theatre is for complex tears (such as 3rd/4th degree). First-degree tears are managed in the birth room or left to heal.`},
      {t:`Apply a tight perineal pad and reassess tomorrow`, ok:false, fb:`Assess and document now; delays risk missed injury and haematoma.`},
    ]});

  if (c.pph){
    add({ id:'pph', stage:4, tag:'Emergency', title:'Postpartum haemorrhage', type:'order', pts:15, dt:6,
      enter(){ encounter('pph'); SIM.pphActive = true; P.ebl = Math.max(P.ebl, 520); P.eblRate = 13; P3.boggy = true; P3.kT = 0.74; showDrape(true); annot(svgLabel(250, 420, 'Heavy bleeding', '#d64b3c', 'start')); SIM._pphN = 0; },
      text:`<p>Ten minutes after the placenta, Emma has a sudden, steady flow of bright red blood. The fundus is <b>soft, boggy and above the umbilicus</b>. Blood is collecting rapidly in the drape. She feels light-headed. <b>Watch her heart rate and blood pressure.</b></p>`,
      q:`Act quickly, in a safe sequence:`,
      items:[
        {t:`Call for help: PPH emergency (senior midwife, obstetrician, anaesthetist); state "postpartum haemorrhage"`, short:`Call for help`, grp:1, fb:`Team arriving; roles allocated, scribe recording.`, act(){ P.eblRate = 11; }},
        {t:`Rub up a contraction: fundal massage`, short:`Fundal massage`, grp:2, fb:`The uterus begins to firm under your hand. Expel clots.`, act(){ pphStep(); annot(`<path d="M186 70 A24 15 0 1 1 190 94" fill="none" stroke="#0b7a83" stroke-width="3" marker-end="url(#arT)"/>` + svgLabel(150, 50, 'Fundal massage')); }},
        {t:`Give further uterotonics (e.g. oxytocin 5 IU slow IV, then infusion; ergometrine 250 micrograms IM if no hypertension)`, short:`Uterotonics`, grp:2, fb:`Uterotonics given per protocol. Escalate to misoprostol or carboprost if needed.`, act(){ pphStep(); }},
        {t:`Empty the bladder (indwelling catheter)`, short:`Empty bladder`, grp:2, fb:`A full bladder impedes uterine contraction; 300 mL drained.`, act(){ pphStep(); }},
        {t:`Two large-bore IV cannulas, bloods (FBC, coagulation, group and crossmatch), warmed fluids; tranexamic acid 1 g IV`, short:`IV access, bloods, TXA`, grp:2, fb:`Resuscitation under way. Tranexamic acid within 3 hours of birth reduces death from bleeding (WOMAN trial).`, act(){ pphStep(); }},
      ],
      distractors:[
        {t:`Leave her to rest and reassess in 15 minutes`, fb:`PPH needs immediate action. Delay is a key factor in maternal deaths.`},
        {t:`Help her walk to the bathroom to freshen up`, fb:`She is haemodynamically compromised and at risk of collapse. Keep her lying flat, warm, and on oxygen if needed.`},
      ],
      hint:`Call for help first. Then, simultaneously: rub up a contraction, uterotonics, empty the bladder, IV access/bloods/fluids/TXA.`,
      doneFb:`The uterus is now firm and well contracted, the bleeding has settled and her observations are improving. Continue close observation (vital signs, fundus, lochia, fluid balance) using a maternal early-warning chart.`,
      learn:`PPH (≥ 500 mL): call for help; rub up a contraction; uterotonics; empty the bladder; IV access, bloods, fluids and tranexamic acid; then find the cause (the 4 Ts). Bimanual compression and theatre if bleeding continues.`,
      after(){ P.eblRate = 0; SIM.pphControlled = true; P3.boggy = false; P3.kT = 0.58; annot(''); }});
    add({ id:'4ts', stage:4, tag:'Emergency', title:'The 4 Ts of PPH', type:'multi', dt:8,
      q:`Which are the "4 Ts" causes of PPH that you systematically review?`,
      options:[
        {t:`Tone: uterine atony (about 70% of cases)`, ok:true, fb:`Most common: massage and uterotonics.`},
        {t:`Trauma: perineal, vaginal or cervical tears, uterine rupture or inversion`, ok:true, fb:`Inspect the genital tract carefully; repair any bleeding tears.`},
        {t:`Tissue: retained placenta, membranes or clots`, ok:true, fb:`Re-check the placenta; examination under anaesthesia if tissue is suspected.`},
        {t:`Thrombin: coagulopathy`, ok:true, fb:`Check coagulation studies and fibrinogen; replace blood products.`},
        {t:`Temperature`, ok:false, fb:`Not one of the 4 Ts (though keep her warm: hypothermia worsens coagulopathy).`},
        {t:`Tachycardia`, ok:false, fb:`A sign of hypovolaemia, not a cause of PPH.`},
      ],
      doneFb:`Tone, Trauma, Tissue, Thrombin. Here the cause was <b>Tone</b> (atony), which responded to massage and uterotonics. Placenta was complete; no significant trauma.`});
  }

  add({ id:'ebl', stage:4, tag:'Third stage', title:'Quantifying blood loss', type:'ebl', dt:2,
    enter(st){
      showDrape(true);
      const pads = SIM.padsVol;
      if (!c.pph) P.ebl = 350;
      P.eblRate = 0;
      const total = Math.round(P.ebl / 10) * 10; P.ebl = total;
      st._pads = pads; st._padDry = c.pph ? 60 : 40; st._padW = st._padDry + pads; st._drape = total - pads; st._ans = total;
    },
    text:st => `<p>The graduated under-buttock drape reads <b>${st._drape} mL</b> (see the gauge on the diagram). The soaked pads weigh <b>${st._padW} g</b>; their dry weight is <b>${st._padDry} g</b> (1 g ≈ 1 mL).</p>`});

  add({ id:'care', stage:4, tag:'Postnatal', title:'The first hour after birth', type:'multi', dt:10,
    enter(){ annot(''); P3.pinkT = 0.95; },
    q:`Which actions are appropriate during the first hour?`,
    options:[
      {t:`Uninterrupted skin-to-skin contact for at least the first hour`, ok:true, fb:`Supports thermoregulation, glucose stability and bonding.`},
      {t:`Support the first breastfeed when the baby shows feeding cues`, ok:true, fb:`Early initiation within the first hour improves breastfeeding success.`},
      {t:`Offer vitamin K (with informed consent) and apply identification bands`, ok:true, fb:`Vitamin K prevents vitamin K deficiency bleeding; ID bands before any separation.`},
      {t:`Monitor maternal vital signs, fundal tone and lochia, and complete documentation`, ok:true, fb:`Early detection of PPH; accurate, contemporaneous records.`},
      {t:`Weigh and measure the baby immediately, interrupting skin-to-skin`, ok:false, fb:`Routine measurements can wait until after the first feed.`},
      {t:`Bath the baby at 30 minutes of age`, ok:false, fb:`Delay bathing (ideally 24 hours or more) to prevent hypothermia.`},
    ],
    doneFb:`Well done. Emma and her baby are settled, skin-to-skin, and the baby is feeding. Hand over using a structured format (e.g. ISBAR).`});

  return S;
}
function pphStep(){
  SIM._pphN = (SIM._pphN || 0) + 1;
  const rates = [5, 2, 0.8, 0.3];
  P.eblRate = rates[Math.min(SIM._pphN - 1, 3)];
  if (SIM._pphN >= 2){ P3.boggy = false; P3.kT = 0.62; } else { P3.kT = 0.68; }
}
