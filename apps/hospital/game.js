const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Hospital =====
const DEMO=!!window.DEMO,SK=DEMO?'cbhospD':'cbhosp';
let S={rep:50,cash:0,shift:0,treated:0,best:0,up:{},rel:{ash:0,jamie:0,vic:0},drama:0,seen:[]};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};const G={state:'menu',score:0,level:0};window.G=G;
function sfx(f,d,ty,v){try{const A=window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.type=ty||'sine';o.frequency.setValueAtTime(f,n);g.gain.setValueAtTime(v||.12,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
const DEPTS=[['er','🚑 ER Triage','#ff6b6b'],['surg','🔪 Surgery','#7ec8ff'],['mat','🤰 Maternity','#ffb3da'],['kids','🧸 Kids Ward','#ffe066'],['pharm','💊 Pharmacy','#9be29b']];
// tests: key test reveals result; mg = minigame on test or treatment
const P=[
{d:'er',n:'Kev Ladderman',e:'🧔',age:41,cc:'Fell off a ladder cleaning the gutters. Landed on his outstretched hand. "It went CRUNCH, doc."',sym:['Wrist swollen and bent like a fork','Pain 8/10','Fingers warm and pink'],tests:{'X-ray':['xray','Broken wrist (distal radius fracture)'],'Blood test':[0,'Normal']},dx:['Sprained wrist','Broken wrist','Gout'],ok:1,tx:'bone',fun:0},
{d:'er',n:'Priya Chopwell',e:'👩‍🍳',age:27,cc:'Slipped while slicing an onion for a cooking video. Still filming.',sym:['3 cm clean cut on palm','Bleeding slows with pressure','Can move all fingers'],tests:{'Look closely':[0,'Clean edges, no tendon showing'],'X-ray':['xray','No glass or bone damage']},dx:['Laceration needing stitches','Burn','Broken finger'],ok:0,tx:'stitch',fun:1},
{d:'er',n:'Gary Brickley',e:'👨',age:33,cc:'Was showing his kid "how NOT to put LEGO up your nose".',sym:['Blocked left nostril','Whistles when he breathes','Deeply embarrassed'],tests:{'X-ray':['xray','Small brick in left nostril'],'Smell test':[0,'Smells nothing on the left. Or his own dignity.']},dx:['Common cold','Nasal foreign body','Allergy'],ok:1,tx:'tweeze',fun:1},
{d:'er',n:'Pearl Hargreaves',e:'👵',age:72,cc:'Heavy chest pain while gardening that won\'t go away.',sym:['Crushing chest pain spreading to left arm','Sweaty and pale','Feels sick'],tests:{'ECG':['lab','ECG changes: heart attack pattern'],'Blood test':['lab','Raised troponin (heart muscle strain)']},dx:['Heartburn','Heart attack','Pulled muscle'],ok:1,tx:'pharm:Aspirin 300 mg (then cardiology)',fun:0},
{d:'er',n:'Ben Nutley',e:'🧑',age:24,cc:'Ate a "nut-free" brownie at a party. It was not nut-free.',sym:['Lips and tongue swelling','Hives everywhere','Wheezy, voice hoarse'],tests:{'Oxygen level':[0,'Low: 91%'],'Allergy history':[0,'Severe peanut allergy']},dx:['Anaphylaxis','Food poisoning','Panic attack'],ok:0,tx:'pharm:Adrenaline injection (IM)',fun:0},
{d:'er',n:'Jo Sweetman',e:'👩',age:38,cc:'Skipped lunch after her insulin. Now trying to pay the vending machine with a sock.',sym:['Shaky and sweaty','Confused','Type 1 diabetes'],tests:{'Finger-prick glucose':['lab','Blood sugar very LOW (2.6)'],'Blood pressure':[0,'Normal']},dx:['Low blood sugar','Stroke','Drunk'],ok:0,tx:'pharm:Glucose gel / sugary drink',fun:1},
{d:'er',n:'Trevor Tapps',e:'🛁',age:45,cc:'Toe stuck in the bath tap. Arrived in a towel. Brought the tap.',sym:['Big toe stuck in tap','Toe swollen but pink','Pride badly injured'],tests:{'Look closely':[0,'Good circulation, just swollen'],'X-ray':['xray','No fracture']},dx:['Broken toe','Stuck toe: reduce swelling and slide out','Gout'],ok:1,tx:'pharm:Ice, raise foot, soap',fun:1},
{d:'surg',n:'Dylan Pike',e:'👦',age:19,cc:'Pain started around his belly button, then moved to the lower right.',sym:['Sharp lower-right tummy pain','Fever 38.3°C','Off his food, feels sick'],tests:{'Blood test':['lab','High white cells (infection)'],'Ultrasound':['xray','Swollen appendix']},dx:['Appendicitis','Trapped wind','Kidney stone'],ok:0,tx:'appendix',fun:0},
{d:'surg',n:'Sergeant Rex Boulder',e:'💪',age:36,cc:'Arm-wrestled a forklift operator. Lost to the forklift.',sym:['Forearm bent the wrong way','Pain 9/10','Pulse in hand OK'],tests:{'X-ray':['xray','Broken forearm (both bones)']},dx:['Broken forearm','Bruise','Dislocated shoulder'],ok:0,tx:'bone',fun:1},
{d:'surg',n:'Marnie Cuthbert',e:'👩‍🦰',age:30,cc:'Cut her leg on a fence during a cheeky shortcut.',sym:['5 cm cut on shin','Edges gaping','Up to date on tetanus'],tests:{'Look closely':[0,'Clean, no debris after washing']},dx:['Laceration needing stitches','Graze only','Spider bite'],ok:0,tx:'stitch',fun:0},
{d:'mat',n:'Sasha Bloom',e:'🤰',age:29,cc:'First baby! Partner is panicking more than she is.',sym:['Contractions every 3 minutes','Waters broke an hour ago','Baby is head-down'],tests:{'Baby heartbeat':['lab','Healthy 140 bpm'],'Check progress':[0,'Fully dilated, ready to push']},dx:['Active labour: deliver','False labour: go home','Food poisoning'],ok:0,tx:'birth',fun:0},
{d:'mat',n:'Kylie & twins',e:'🤰',age:34,cc:'Expecting twins. Has named them both "Kevin" just in case.',sym:['Strong regular contractions','37 weeks','Both babies head-down'],tests:{'Ultrasound':['xray','Twin 1 head-down, ready']},dx:['Active labour: deliver','Braxton Hicks','Indigestion'],ok:0,tx:'birth',fun:1},
{d:'kids',n:'Mia (4)',e:'👧',age:4,cc:'Grumpy, hot and keeps pulling her ear. Mum hasn\'t slept.',sym:['Fever 38.5°C','Pulling at right ear','Earache'],tests:{'Otoscope':['xray','Red, bulging eardrum'],'Throat check':[0,'Fine']},dx:['Ear infection','Tooth coming in','Appendicitis'],ok:0,tx:'pharm:Children\'s paracetamol (by weight)',fun:0},
{d:'kids',n:'Leo (8)',e:'🧒',age:8,cc:'Gets wheezy and coughy at footy, especially in cold air.',sym:['Wheeze on breathing out','Cough at night','Tight chest'],tests:{'Peak flow':['lab','Lower than expected, improves with inhaler']},dx:['Asthma','Broken rib','Chickenpox'],ok:0,tx:'pharm:Blue reliever inhaler with spacer',fun:0},
{d:'kids',n:'Ruby (6)',e:'👧',age:6,cc:'Swallowed a 20c coin playing "magician". Very proud.',sym:['Not choking, breathing fine','Eating and drinking OK','No tummy pain'],tests:{'X-ray':['xray','Coin safely in the stomach']},dx:['Coin in stomach: should pass, watch and wait','Emergency surgery','Coin in lungs'],ok:0,tx:'pharm:Watch & wait (no medicine)',fun:1},
{d:'pharm',n:'Mr Okoye',e:'👴',age:66,cc:'Prescription: water tablet for his blood pressure, but he wants to stop it because he wees too much.',sym:['High blood pressure','Takes it at night','Up all night weeing'],tests:{'Check timing':[0,'He takes it at 10 pm']},dx:['Take it in the morning instead','Stop all tablets','Double the dose'],ok:0,tx:'pharm:Same tablet, morning dose',fun:1},
{d:'pharm',n:'Tess Hayfield',e:'🤧',age:25,cc:'Spring has arrived and so has her nose.',sym:['Sneezing','Itchy watery eyes','No fever'],tests:{'History':[0,'Every spring, worse near grass']},dx:['Hay fever','Flu','Pink eye'],ok:0,tx:'pharm:Non-drowsy antihistamine',fun:0}];
const MEDS=['Aspirin 300 mg (then cardiology)','Adrenaline injection (IM)','Glucose gel / sugary drink','Ice, raise foot, soap','Children\'s paracetamol (by weight)','Blue reliever inhaler with spacer','Watch & wait (no medicine)','Same tablet, morning dose','Non-drowsy antihistamine','Antibiotic cream','Cough syrup','Vitamin C'];
const UPS=[['er','🛋️ Comfy ER (+30s per shift)',60],['xray','📸 Super X-ray (tests cost less time)',80],['surg','💡 Surgery lights (easier surgery)',100],['kids','🧸 Kids playroom (+rep from kids)',80],['pharm','🤖 Pharmacy robot (hints)',90],['mat','🛁 Birth suite (+rep from births)',90]];
const DRAMA=[
['☕','Staff Room','Dr Ash Rivera (charming surgeon) offers you the last decent coffee. Nurse Jamie Cole says Ash does that with every new doctor.',[['Accept, with a smile',{ash:2}],['Share it with Jamie',{jamie:2}],['Drink it in one go, alone',{}]]],
['😤','Corridor','Dr Victoria Steele, your rival, takes credit for your diagnosis in front of the Chief.',[['Call her out politely',{vic:-1},5],['Let it go, stay classy',{vic:1}],['Steal her lunch later',{vic:-2}]]],
['🌧️','Car Park','It\'s pouring. Jamie offers you a lift under the hospital umbrella. Ash honks from his convertible (roof stuck down).',[['Umbrella with Jamie',{jamie:3}],['Soggy convertible with Ash',{ash:3}],['Run for it',{}]]],
['🕯️','Night Shift','The power flickers. Victoria admits she\'s terrified her career will flop. She looks human for once.',[['Comfort her',{vic:3}],['Make a joke',{vic:1,jamie:1}],['Tell everyone later',{vic:-3},-5]]],
['💌','Locker','There\'s a note in your locker: "Dinner after the shift? ❤️" No name. Ash and Jamie both look suspiciously innocent.',[['Ask Ash',{ash:3}],['Ask Jamie',{jamie:3}],['Frame the note',{}]]],
['🎂','Chief\'s Birthday','Chief Dr Okafor\'s cake is shaped like a kidney. Someone has to give a speech.',[['Give a heartfelt speech',{},8],['Push Victoria forward',{vic:1}],['Eat the kidney in silence',{}]]],
['🌹','Rooftop','After a brutal shift, the person you\'re closest to finds you on the roof watching the sunset. "Same time tomorrow?"',[['"It\'s a date ❤️"',{ash:1,jamie:1}],['"Let\'s keep it professional"',{}],['Hug it out',{vic:1,jamie:1,ash:1}]]]];
let cur=null,revealed={},wrong=0,msg='',mg=null,shiftT=0,shiftDone=0,dept='er',queue=[],sel=null,dramaI=null,demoCount=0,parts=[];
function shiftLen(){return 240+(S.up.er?30:0)}
function startShift(){S.shift++;shiftT=shiftLen();shiftDone=0;G.score=0;G.state='hub';msg='';sv()}
function pool(d){return P.filter(p=>p.d===d)}
function openDept(d){if(DEMO&&d!=='er'){msg='🔒 '+DEPTS.find(z=>z[0]===d)[1]+' is in the full game.';return}dept=d;G.state='queue'}
function pick(p){cur=p;revealed={};wrong=0;msg='';G.state='case'}
function burst(X,Y,col){for(let i=0;i<18;i++)parts.push({x:X,y:Y,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:1,c:col})}
function test(k){if(revealed[k])return;const r=cur.tests[k];shiftT-=S.up.xray?5:12;if(r[0]){mg=mkMG(r[0],()=>{revealed[k]=r[1];G.state='case'});G.state='mg'}else{revealed[k]=r[1];sfx(660,.2)}}
function diag(i){if(i===cur.ok){sfx(880,.3);burst(450,200,'#9be29b');msg='✅ Correct diagnosis! Now treat them.';const tx=cur.tx;
  if(tx.startsWith('pharm:')){G.state='pharm'}else{mg=mkMG(tx,sc=>finish(sc));G.state='mg'}}
 else{wrong++;S.rep=Math.max(0,S.rep-3);sfx(150,.4,'square');msg='❌ Not quite. Nurse Jamie: "Have another look at the symptoms'+(Object.keys(revealed).length?'':' and run a test')+'."'}}
function finish(q){const bonus=(cur.d==='kids'&&S.up.kids?3:0)+(cur.d==='mat'&&S.up.mat?3:0);const rep=Math.max(1,Math.round(q*6)-wrong*2)+bonus;S.rep=Math.min(100,S.rep+rep);const cash=20+Math.round(q*20);S.cash+=cash;S.treated++;shiftDone++;G.score+=Math.round(q*100)+50;
 if(!S.seen.includes(cur.n))S.seen.push(cur.n);S.best=Math.max(S.best,G.score);sv();burst(450,300,'#ffe066');sfx(523,.15);setTimeout(()=>sfx(784,.3),150);
 msg='🎉 '+cur.n+' is on the mend! +'+rep+' reputation, +$'+cash+'.';G.state='hub';demoCount++;
 if(DEMO&&demoCount>=3){window.demoEnd&&window.demoEnd('Great first shift, doctor! The full game opens Surgery (stitches, bones and appendix removal), Maternity, the Kids Ward and Pharmacy, with 17 patients, staff drama and romance, shift timers and ward upgrades.');return}
 if(!DEMO&&shiftDone%2===0&&S.drama<99){dramaI=DRAMA[S.drama%DRAMA.length];G.state='drama'}}
function choose(o){Object.entries(o[1]).forEach(([k,v])=>S.rel[k]=(S.rel[k]||0)+v);if(o[2])S.rep=Math.max(0,Math.min(100,S.rep+o[2]));S.drama++;sv();G.state='hub'}
function buy(u){if(S.up[u[0]]||S.cash<u[2])return;S.cash-=u[2];S.up[u[0]]=1;sv();sfx(988,.3)}
// ---- minigames ----
function mkMG(type,done){const m={type,done,t:0,step:0,hits:0,miss:0,easy:S.up.surg?1.4:1};
 if(type==='xray'){m.tx=250+Math.random()*400;m.ty=180+Math.random()*250;m.lx=450;m.ly=300}
 if(type==='lab'){m.germs=[...Array(6)].map(()=>({x:300+Math.random()*300,y:200+Math.random()*220,a:Math.random()*7,alive:1}))}
 if(type==='stitch'||type==='appendix'){m.pts=[...Array(6)].map((_,i)=>({x:380+i*28,y:300+Math.sin(i)*8,d:0}))}
 if(type==='bone'){m.off=-160+Math.random()*60;m.v=140;m.tries=0}
 if(type==='birth'){m.v=0;m.dir=1;m.push=0}
 if(type==='tweeze'){m.bx=450+(Math.random()-.5)*100;m.by=280}
 return m}
function mgEnd(q){const m=mg;mg=null;m.done(Math.max(0,Math.min(1,q)))}
function mgDown(p){const m=mg;if(!m)return;
 if(m.type==='xray'){if(Math.hypot(p.x-m.tx,p.y-m.ty)<45*(S.up.xray?1.5:1)){sfx(880,.2);mgEnd(1)}else{m.miss++;sfx(200,.15)}}
 if(m.type==='lab'){m.germs.forEach(g=>{if(g.alive&&Math.hypot(p.x-g.x,p.y-g.y)<26){g.alive=0;m.hits++;sfx(700+m.hits*60,.1)}});if(m.germs.every(g=>!g.alive))mgEnd(1)}
 if(m.type==='stitch'||(m.type==='appendix'&&(m.step===0||m.step===2))){const n=m.pts.find(q=>!q.d);if(n&&Math.hypot(p.x-n.x,p.y-n.y)<24*m.easy){n.d=1;sfx(600,.08);if(m.pts.every(q=>q.d)){if(m.type==='stitch')mgEnd(1-m.miss*.1);else{m.step++;m.pts.forEach(q=>q.d=0)}}}else m.miss++}
 else if(m.type==='appendix'&&m.step===1){if(Math.hypot(p.x-450,p.y-360)<40*m.easy){m.step=2;sfx(880,.2);burst(450,360,'#9be29b')}else m.miss++}
 if(m.type==='bone'){m.tries++;const e=Math.abs(m.off);if(e<14*m.easy){sfx(880,.3);mgEnd(1-m.tries*.1)}else{sfx(180,.2,'square');if(m.tries>5)mgEnd(.3)}}
 if(m.type==='birth'){if(m.v>.62&&m.v<.86){m.push++;sfx(400+m.push*120,.3);burst(450,330,'#ffb3da');if(m.push>=3){m.step=9;setTimeout(()=>mgEnd(1-m.miss*.12),900)}}else{m.miss++;sfx(150,.2)}}
 if(m.type==='tweeze'){if(Math.hypot(p.x-m.bx,p.y-m.by)<22*m.easy){sfx(1000,.3);burst(m.bx,m.by,'#ff5050');mgEnd(1-m.miss*.1)}else{m.miss++;m.bx=Math.max(400,Math.min(500,m.bx+(Math.random()-.5)*40))}}}
function mgMove(p){if(mg&&mg.type==='xray'){mg.lx=p.x;mg.ly=p.y}}
function mgUpdate(dt){const m=mg;if(!m)return;m.t+=dt;
 if(m.type==='lab')m.germs.forEach(g=>{g.a+=dt*2;g.x+=Math.cos(g.a)*40*dt;g.y+=Math.sin(g.a*1.3)*40*dt});
 if(m.type==='bone'){m.off+=m.v*dt;if(m.off>120||m.off<-160)m.v*=-1}
 if(m.type==='birth'&&m.step!==9){m.v+=m.dir*dt*.9;if(m.v>1||m.v<0)m.dir*=-1}}
function drawBody(cx,cy,s){x.fillStyle='#ffd8b5';x.beginPath();x.arc(cx,cy-120*s,40*s,0,7);x.fill();rr(cx-55*s,cy-75*s,110*s,170*s,30*s);x.fill()}
function mgDraw(){const m=mg;x.fillStyle='#0d1b2a';x.fillRect(0,0,W,H);const titles={xray:'📸 X-ray / Scan: move the scanner and click on the problem',lab:'🔬 Lab: click all the wriggly markers to run the test',stitch:'🪡 Stitches: click the dots left to right',bone:'🦴 Set the bone: click when the pieces line up',appendix:['🔪 Appendix: mark the cut (dots)','🔪 Appendix: lift out the swollen appendix','🪡 Appendix: stitch up (dots)'][m.step],birth:'👶 Delivery: click PUSH when the bar is in the pink zone (3 times)',tweeze:'🔧 Tweezers: grab the LEGO brick'};
 T(titles[m.type],450,50,20,'#ffe066','center');T('Cartoon medicine: no gore, no real advice',450,76,13,'#9ab','center','');
 if(m.type==='xray'){x.fillStyle='#000';rr(150,110,600,420,16);x.fill();x.save();x.beginPath();x.arc(m.lx,m.ly,70,0,7);x.clip();x.fillStyle='#123';x.fillRect(150,110,600,420);x.strokeStyle='#cfe';x.lineWidth=10;
  for(let i=0;i<6;i++){x.beginPath();x.moveTo(200+i*90,130);x.lineTo(210+i*90,510);x.stroke()}x.fillStyle='#ff5050';x.beginPath();x.arc(m.tx,m.ty,14,0,7);x.fill();emo('⚡',m.tx,m.ty,22);x.restore();x.strokeStyle='#7ec8ff';x.lineWidth=3;x.beginPath();x.arc(m.lx,m.ly,70,0,7);x.stroke()}
 if(m.type==='lab'){x.fillStyle='#eef';x.beginPath();x.arc(450,320,190,0,7);x.fill();m.germs.forEach(g=>g.alive&&emo('🦠',g.x,g.y,34));T(m.hits+'/6',450,560,18,'#fff','center')}
 if(m.type==='stitch'||m.type==='appendix'){drawBody(450,360,1.6);if(m.type==='appendix'&&m.step===1){x.fillStyle='#ff9a9a';rr(290,280,320,40,20);x.fill();emo('🪱',450,360,46);T('↓ click it',450,420,16,'#fff','center')}
  if(m.type==='stitch'||m.step!==1){x.strokeStyle='#c0392b';x.lineWidth=4;x.beginPath();x.moveTo(370,300);x.lineTo(530,300);x.stroke();m.pts.forEach((q,i)=>{x.fillStyle=q.d?'#2e86de':'#fff';x.beginPath();x.arc(q.x,q.y,q.d?7:11,0,7);x.fill();if(q.d&&i){x.strokeStyle='#2e86de';x.lineWidth=3;x.beginPath();x.moveTo(m.pts[i-1].x,m.pts[i-1].y-12);x.lineTo(q.x,q.y+12);x.stroke()}})}}
 if(m.type==='bone'){x.fillStyle='#ffd8b5';rr(150,250,600,100,50);x.fill();x.fillStyle='#fff';rr(180,285,260,30,15);x.fill();rr(460+m.off,285+m.off*.15,260,30,15);x.fill();x.strokeStyle='#2ecc71';x.setLineDash([6,6]);x.strokeRect(455,275,10,50);x.setLineDash([]);button('set',360,420,180,54,'🦴 SET!',()=>mgDown({}))}
 if(m.type==='birth'){x.fillStyle='#333';rr(200,150,500,40,20);x.fill();x.fillStyle='#ffb3da';x.fillRect(200+500*.62,150,500*.24,40);x.fillStyle='#fff';x.fillRect(200+500*m.v-4,140,8,60);emo(m.step===9?'👶':'🤰',450,330,110);T('Pushes: '+m.push+'/3',450,450,20,'#fff','center');if(m.step===9)T('It\'s a healthy baby! 💕',450,500,26,'#ffb3da','center');else button('push',360,480,180,54,'PUSH!',()=>mgDown({}))}
 if(m.type==='tweeze'){emo('👃',450,300,220);x.fillStyle='#e74c3c';x.fillRect(m.bx-12,m.by-8,24,16);T('Misses: '+m.miss,450,540,16,'#fff','center')}}
// ---- drawing ----
function bg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#dff3f7');g.addColorStop(1,'#a9d6e5');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='#ffffff88';for(let i=0;i<9;i++)x.fillRect(i*110,0,4,H)}
function hud(){x.fillStyle='#0b3d5ccc';x.fillRect(0,0,W,34);const mm=Math.max(0,shiftT)|0;T('⏱️ '+(mm/60|0)+':'+String(mm%60).padStart(2,'0'),12,23,16,'#fff','left');T('⭐ Rep '+S.rep+'/100',150,23,16,'#ffe066','left');T('💵 $'+S.cash,300,23,16,'#9be29b','left');T('Shift '+S.shift+' · Treated '+shiftDone,420,23,15,'#fff','left','');T('Score '+G.score,888,23,15,'#fff','right','')}
function panel(X,Y,w,h){x.fillStyle='#ffffffee';rr(X,Y,w,h,14);x.fill();x.strokeStyle='#0b3d5c55';x.lineWidth=2;x.stroke()}
const BO={bg:'#0b3d5c',ac:'#7ec8ff',fg:'#fff'};
function update(dt){parts=parts.filter(p=>(p.l-=dt)>0);parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt});
 if(['hub','queue','case','pharm','mg'].includes(G.state)&&!DEMO){shiftT-=dt;if(shiftT<=0&&G.state!=='mg'){G.state='shiftend';S.best=Math.max(S.best,G.score);sv()}}if(mg)mgUpdate(dt)}
function draw(){bg();
 if(G.state==='menu'){emo('🏥',450,110,90);T('Coffeebreak Hospital',450,200,44,'#0b3d5c','center');T('Your first day as a doctor. What could go wrong?',450,238,20,'#2e86de','center','italic ');
  x.fillStyle='#234';x.font='16px Georgia';x.textAlign='center';wrapT('Triage the ER, read x-rays, run lab tests, stitch, set bones, deliver babies, run the kids ward and pharmacy, and survive the staff drama. Diagnose from symptoms, keep your reputation up and upgrade your wards.',450,276,640,23);x.textAlign='left';
  T('Reputation '+S.rep+' · Patients treated '+S.treated+' · Best shift '+S.best,450,370,15,'#0b3d5c','center','');
  button('go',320,395,260,58,'🩺 Start shift',startShift,BO);if(!DEMO)button('up',320,462,260,44,'🛠️ Upgrade wards ($'+S.cash+')',()=>G.state='ups',BO);
  T('⚕️ For entertainment only. Not medical advice. In an emergency call 000 (AU) / 911 (US) / 999 (UK) / 112 (EU).',450,560,12,'#7a2020','center','');return}
 hud();
 if(G.state==='hub'){T('🏥 Hospital Map: pick a department',450,70,22,'#0b3d5c','center');DEPTS.forEach((d,i)=>{const X=60+(i%3)*270,Y=95+(i/3|0)*150,lock=DEMO&&d[0]!=='er';x.fillStyle=d[2]+(lock?'55':'');rr(X,Y,250,130,16);x.fill();T(d[1],X+125,Y+55,22,'#123','center');T(pool(d[0]).filter(p=>!S.seen.includes(p.n)||1).length+' patients'+(lock?' 🔒 full game':'')+(S.up[d[0]]?' · ⭐upgraded':''),X+125,Y+90,14,'#234','center','');BTN['d'+i]={x:X,y:Y,w:250,h:130,fn:()=>openDept(d[0])}});
  const rel=S.rel;panel(600,250,250,130);T('💞 Staff',615,275,16,'#0b3d5c');T('Dr Ash Rivera '+'❤️'.repeat(Math.max(0,Math.min(5,rel.ash/2|0))),615,300,14,'#234','left','');T('Nurse Jamie Cole '+'❤️'.repeat(Math.max(0,Math.min(5,rel.jamie/2|0))),615,325,14,'#234','left','');T('Dr V. Steele (rival) '+(rel.vic>=3?'🤝':rel.vic<0?'😠':'😐'),615,350,14,'#234','left','');
  if(msg){panel(60,400,780,50);x.fillStyle='#123';x.font='16px Georgia';wrapT(msg,75,430,750,20)}
  button('end',60,470,200,44,'🏁 End shift',()=>{G.state='shiftend';sv()},BO);if(!DEMO)button('ups',280,470,200,44,'🛠️ Upgrades',()=>G.state='ups',BO)}
 if(G.state==='queue'){const d=DEPTS.find(z=>z[0]===dept);T(d[1]+': waiting room',450,70,24,'#0b3d5c','center');let ps=pool(dept);if(DEMO)ps=ps.slice(0,3);
  ps.forEach((p,i)=>{const X=60+(i%2)*400,Y=90+(i/2|0)*92;panel(X,Y,380,80);emo(p.e,X+40,Y+40,40);T(p.n+(S.seen.includes(p.n)?' ✔️':''),X+75,Y+30,16,'#0b3d5c');x.fillStyle='#345';x.font='13px Georgia';wrapT(p.cc,X+75,Y+50,290,15);BTN['p'+i]={x:X,y:Y,w:380,h:80,fn:()=>pick(p)}});
  button('back',60,540,160,40,'⬅ Map',()=>G.state='hub',BO)}
 if(G.state==='case'){const p=cur;panel(30,45,840,185);emo(p.e,85,110,70);T(p.n+', '+p.age,140,80,22,'#0b3d5c');x.fillStyle='#234';x.font='15px Georgia';wrapT(p.cc,140,104,700,19);
  p.sym.forEach((s,i)=>T('• '+s,140,150+i*22,15,'#7a2020','left',''));
  T('🔬 Tests',40,255,18,'#0b3d5c');Object.keys(p.tests).forEach((k,i)=>{button('t'+i,40+i*200,265,190,38,(revealed[k]?'✔️ ':'')+k,()=>test(k),BO);if(revealed[k])T(k+': '+revealed[k],40,325+i*20,14,'#145a32','left','')});
  T('🩺 Diagnosis',40,390,18,'#0b3d5c');p.dx.forEach((d,i)=>button('x'+i,40+i*278,400,268,44,d,()=>diag(i),{fs:13,bg:'#fff',fg:'#0b3d5c',ac:'#2e86de'}));
  if(msg){x.fillStyle=msg[0]==='✅'?'#145a32':'#7a2020';x.font='bold 15px Georgia';wrapT(msg,40,475,820,20)}
  if(S.up.pharm&&wrong)T('🤖 Robot hint: it\'s "'+p.dx[p.ok].slice(0,8)+'…"',40,515,14,'#2e86de','left','');button('back',700,530,160,40,'⬅ Back',()=>G.state='queue',BO)}
 if(G.state==='pharm'){T('💊 Pharmacy: pick the right treatment for '+cur.n,450,70,20,'#0b3d5c','center');const ans=cur.tx.slice(6);if(!cur._m){const o=MEDS.filter(m=>m!==ans).sort(()=>Math.random()-.5).slice(0,5);o.splice(Math.random()*6|0,0,ans);cur._m=o}
  cur._m.forEach((m,i)=>button('m'+i,60+(i%2)*400,100+(i/2|0)*70,380,56,'💊 '+m,()=>{if(m===ans){cur._m=null;finish(1-wrong*.15)}else{wrong++;S.rep=Math.max(0,S.rep-2);msg='❌ Wrong shelf! Pharmacist Bev raises an eyebrow.';sfx(150,.3,'square')}},{fs:14,bg:'#fff',fg:'#0b3d5c',ac:'#9be29b'}));
  if(msg.startsWith('❌'))T(msg,450,350,16,'#7a2020','center','');if(S.up.pharm)T('🤖 Robot: think about what the diagnosis needs right now.',450,380,14,'#2e86de','center','')}
 if(G.state==='mg')mgDraw();
 if(G.state==='drama'){const d=dramaI;panel(60,60,780,300);emo(d[0],780,110,50);T('🎭 '+d[1],90,100,22,'#8e44ad');x.fillStyle='#234';x.font='18px Georgia';wrapT(d[2],90,140,640,26);d[3].forEach((o,i)=>button('o'+i,150,380+i*56,600,46,o[0],()=>choose(o),{fs:15,bg:'#8e44ad',ac:'#d7bde2',fg:'#fff'}))}
 if(G.state==='ups'){T('🛠️ Upgrade your wards',450,75,26,'#0b3d5c','center');UPS.forEach((u,i)=>button('u'+i,150,95+i*62,600,52,(S.up[u[0]]?'✔️ ':'')+u[1]+(S.up[u[0]]?'':' · $'+u[2]),()=>buy(u),{fs:15,dis:!S.up[u[0]]&&S.cash<u[2],bg:'#0b3d5c',ac:'#ffe066',fg:'#fff'}));button('b',370,480,160,44,'⬅ Back',()=>G.state=shiftT>0&&S.shift?'hub':'menu',BO)}
 if(G.state==='shiftend'){panel(150,90,600,360);T('🏁 Shift '+S.shift+' over!',450,140,30,'#0b3d5c','center');T('Patients treated: '+shiftDone,450,190,20,'#234','center','');T('Score: '+G.score+' · Best: '+S.best,450,225,20,'#234','center','');T('Reputation: '+S.rep+'/100 '+(S.rep>=80?'(Hospital legend!)':S.rep>=50?'(Solid doctor)':'(The Chief wants a word...)'),450,260,18,'#2e86de','center','');
  button('n',300,300,300,50,'🩺 Next shift',startShift,BO);if(!DEMO)button('u',300,360,300,44,'🛠️ Upgrades ($'+S.cash+')',()=>G.state='ups',BO);button('m',300,412,300,30,'🏠 Menu',()=>G.state='menu',{fs:13})}
 parts.forEach(p=>{x.globalAlpha=p.l;x.fillStyle=p.c;x.fillRect(p.x,p.y,6,6)});x.globalAlpha=1;
 T('⚕️ Entertainment only, not medical advice.',450,594,11,'#0b3d5c99','center','')}
bindInput({down:p=>{if(G.state==='mg')mgDown(p)},move:mgMove});startLoop();
window.HOSP={P,pick,test,diag,finish,startShift,openDept,get mg(){return mg},mgEnd,S,choose,buy};
