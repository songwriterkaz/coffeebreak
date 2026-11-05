const c=document.getElementById('c'),x=c.getContext('2d'),$=id=>document.getElementById(id);
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
// ---- game ----
const NAMES=['Mr Marsh Mallow','Granny Rosebud','Captain Skullby','Duchess Thornheart','Sir Snakesworth','Lady Midnight'];
const PH=[['scalpel','Make the incision: hold and trace the dotted line slowly'],['graft','Place the bypass graft: drag it onto the blocked artery'],['suture','Stitch it up: tap the stitches in order'],['paddles','Restart the heart: hit SHOCK when the charge is in the green']];
const G={state:'title',level:1,score:0,lives:3,best:+localStorage.hsBest||0,tool:null,phase:0,msg:'',msgT:0};
window.G=G;
const HX=450,HY=300;
function newPatient(){const L=G.level;Object.assign(G,{phase:0,stress:10+L*4,hr:78,bp:120,o2:98,crit:0,t:0,tool:null,
 tol:Math.max(10,26-L*3),drift:0.6+L*0.35,path:mkPath(L),prog:0,drag:false,
 graft:{x:120,y:480,held:false,placed:false},target:{x:HX+60+Math.random()*30,y:HY-40+Math.random()*40},
 stitches:[],sIdx:0,charge:0,cdir:1,zone:[0.62-L*0.02,0.62+Math.max(0.06,0.16-L*0.02)],shocks:0,medCD:0,flat:false,ph0:performance.now()});
 G.stitches=G.path.filter((_,i)=>i%Math.max(2,Math.floor(G.path.length/(4+L)))==1).map(p=>({x:p.x,y:p.y,done:false}));
 G.patient=NAMES[(L-1)%NAMES.length];say('Patient '+L+': '+G.patient+'. Pick the 🔪 Scalpel.');}
function mkPath(L){const pts=[],n=40,amp=10+L*6,fr=1+L*0.5;for(let i=0;i<=n;i++){const t=i/n;pts.push({x:HX-120+t*240,y:HY-70+t*120+Math.sin(t*Math.PI*fr)*amp})}return pts}
function say(m){G.msg=m;G.msgT=4}
function start(){if(G.state==='demo')return;startMusic();G.level=1;G.score=0;G.lives=3;G.state='play';newPatient()}
function stress(n){G.stress=Math.min(100,G.stress+n)}
document.querySelectorAll('#tools button').forEach(b=>b.onclick=e=>{e.stopPropagation();pickTool(b.dataset.t)});
function pickTool(t){if(G.state!=='play')return;startMusic();
 if(t==='meds'){if(G.medCD>0){say('Meds not ready yet');return}G.stress=Math.max(0,G.stress-30);G.medCD=8;say('💉 Patient calmer');return}
 if(t!==PH[G.phase][0]){stress(6);say('Wrong tool! Stress up. You need the '+PH[G.phase][0]);return}
 G.tool=t;document.querySelectorAll('#tools button').forEach(b=>b.classList.toggle('sel',b.dataset.t===t));say(PH[G.phase][1])}
function pos(e){const r=c.getBoundingClientRect(),s=Math.min(r.width/900,r.height/600),ox=(r.width-900*s)/2,oy=(r.height-600*s)/2;return{x:(e.clientX-r.left-ox)/s,y:(e.clientY-r.top-oy)/s}}
c.addEventListener('pointerdown',e=>{startMusic();const p=pos(e);if(G.state==='title'||G.state==='over'){start();return}if(G.state!=='play')return;down(p)});
c.addEventListener('pointermove',e=>{if(G.state==='play')move(pos(e))});
c.addEventListener('pointerup',e=>{if(G.state==='play')up(pos(e))});
addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&G.state!=='play'){start()}else if(e.key===' '&&G.tool==='paddles')shock()});
function d(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function down(p){if(!G.tool){say('Pick a tool first');return}
 if(G.tool==='scalpel'){G.drag=true;move(p)}
 else if(G.tool==='graft'&&d(p,G.graft)<40){G.graft.held=true}
 else if(G.tool==='suture'){const s=G.stitches[G.sIdx];if(s&&d(p,s)<22){s.done=true;G.sIdx++;G.score+=50;if(G.sIdx>=G.stitches.length)nextPhase()}else{stress(5);say('Missed the stitch!')}}
 else if(G.tool==='paddles'){if(p.y>440&&p.x>620)shock()}}
function move(p){if(G.tool==='scalpel'&&G.drag){let best=1e9,bi=0;for(let i=0;i<G.path.length;i++){const q=d(p,G.path[i]);if(q<best){best=q;bi=i}}
  if(best>G.tol){stress(best>G.tol*2?2:0.8);G.wob=1}else{G.wob=0;if(bi<=G.prog+3&&bi>G.prog){G.score+=Math.round(10*(1-best/G.tol));G.prog=bi}}
  if(G.prog>=G.path.length-1){G.drag=false;nextPhase()}}
 if(G.tool==='graft'&&G.graft.held){G.graft.x=p.x;G.graft.y=p.y}}
function up(p){G.drag=false;if(G.graft.held){G.graft.held=false;if(d(G.graft,G.target)<30){G.graft.x=G.target.x;G.graft.y=G.target.y;G.graft.placed=true;G.score+=200;nextPhase()}else{stress(8);say('Graft missed! Try again');G.graft.x=120;G.graft.y=480}}}
function shock(){if(G.tool!=='paddles')return;G.shocks++;if(G.charge>=G.zone[0]&&G.charge<=G.zone[1]){G.score+=300;G.flat=false;nextPhase()}else{stress(12);say('⚡ No rhythm! Wait for the green zone')}}
function nextPhase(){const tb=Math.max(0,Math.round(300-(performance.now()-G.ph0)/100));G.score+=tb;G.ph0=performance.now();G.phase++;G.tool=null;
 document.querySelectorAll('#tools button').forEach(b=>b.classList.remove('sel'));
 if(G.phase===3){G.flat=true;say('Flatline! Grab the ⚡ Paddles')}else if(G.phase>=4){patientSaved()}else say('Nice! Next: pick the '+PH[G.phase][0])}
function patientSaved(){const bonus=Math.round((100-G.stress)*10);G.score+=bonus;say('💖 '+G.patient+' saved! Calm bonus '+bonus);
 if(window.DEMO&&G.level>=1){G.state='demo';saveBest();setTimeout(()=>window.demoEnd&&demoEnd('You saved your first patient! Harder patients, trickier incisions and the full Coffeebreak playlist are in the full game.'),1200);return}
 G.state='saved';setTimeout(()=>{G.level++;G.state='play';newPatient()},2000)}
function lose(){G.lives--;say('💔 We lost the rhythm... '+(G.lives>0?'next patient':'')); if(G.lives<=0){G.state='over';saveBest()}else{G.state='saved';setTimeout(()=>{G.state='play';newPatient()},2000)}}
function saveBest(){if(G.score>G.best){G.best=G.score;localStorage.hsBest=G.best}}
let last=performance.now();
function step(dt){G.msgT-=dt;if(G.state!=='play')return;G.t+=dt;G.medCD=Math.max(0,G.medCD-dt);
 G.stress=Math.max(0,G.stress-dt*1.5);const s=G.stress/100;
 const tHr=G.flat?0:70+s*90,tBp=G.flat?40:115+s*60,tO2=99-s*18-(G.flat?10:0);
 const k=Math.min(1,dt*0.8*G.drift);G.hr+=(tHr-G.hr)*k;G.bp+=(tBp-G.bp)*k;G.o2+=(tO2-G.o2)*k;
 if(G.tool==='paddles'){G.charge+=G.cdir*dt*(0.7+G.level*0.15);if(G.charge>1){G.charge=1;G.cdir=-1}if(G.charge<0){G.charge=0;G.cdir=1}}
 const bad=(!G.flat&&(G.hr>150||G.bp>170))||G.o2<82;G.crit=bad?G.crit+dt:Math.max(0,G.crit-dt);if(G.crit>4)lose()}
function heart(t){const b=1+(G.flat?0:Math.max(0,Math.sin(t*G.hr/60*Math.PI*2))*0.04);x.save();x.translate(HX,HY);x.scale(b,b);
 x.fillStyle='#ff6f91';x.strokeStyle='#7a1f3d';x.lineWidth=6;x.beginPath();x.moveTo(0,-90);x.bezierCurveTo(60,-190,230,-90,0,150);x.bezierCurveTo(-230,-90,-60,-190,0,-90);x.fill();x.stroke();
 x.fillStyle='#ffd1dc';x.beginPath();x.ellipse(-70,-70,30,18,-0.6,0,7);x.fill();
 x.fillStyle='#fff';x.font='bold 22px Georgia';x.textAlign='center';x.fillText(G.flat?'x_x':'◕‿◕',0,30);x.restore();
 // artery
 x.strokeStyle='#b03a5b';x.lineWidth=12;x.beginPath();x.moveTo(HX+20,HY-130);x.quadraticCurveTo(HX+120,HY-60,HX+90,HY+60);x.stroke();
 if(!G.graft.placed){x.fillStyle='#ffcf6a';x.beginPath();x.arc(G.target.x,G.target.y,10,0,7);x.fill();if(G.phase===1){x.strokeStyle='#ffcf6a';x.setLineDash([4,4]);x.lineWidth=2;x.beginPath();x.arc(G.target.x,G.target.y,30,0,7);x.stroke();x.setLineDash([])}}}
function drawPath(){x.lineWidth=4;for(let i=0;i<G.path.length-1;i++){x.strokeStyle=i<G.prog?'#7a1f3d':'rgba(255,255,255,.7)';x.setLineDash(i<G.prog?[]:[6,6]);x.beginPath();x.moveTo(G.path[i].x,G.path[i].y);x.lineTo(G.path[i+1].x,G.path[i+1].y);x.stroke()}x.setLineDash([]);
 if(G.phase===0){const p=G.path[G.prog];x.fillStyle='#8f8';x.beginPath();x.arc(p.x,p.y,7,0,7);x.fill()}
 if(G.phase>=2)G.stitches.forEach((s,i)=>{x.strokeStyle=s.done?'#2a9d8f':(i===G.sIdx?'#ffcf6a':'#fff');x.lineWidth=3;x.beginPath();if(s.done){x.moveTo(s.x-9,s.y-9);x.lineTo(s.x+9,s.y+9);x.moveTo(s.x+9,s.y-9);x.lineTo(s.x-9,s.y+9)}else x.arc(s.x,s.y,i===G.sIdx?12:8,0,7);x.stroke()})}
function monitor(t){x.fillStyle='#061a12';x.fillRect(640,20,240,150);x.strokeStyle='#2f6';x.lineWidth=2;x.beginPath();
 for(let i=0;i<220;i++){const ph=((t*G.hr/60)+i/60)%1;const y=G.flat?0:(ph<0.05?-40:ph<0.1?25:ph<0.2?-6:0);i?x.lineTo(650+i,70+y):x.moveTo(650,70+y)}x.stroke();
 x.font='16px monospace';x.textAlign='left';const col=(v,b)=>b?'#ff5a5a':'#6f6';
 x.fillStyle=col(0,G.hr>130||G.flat);x.fillText('HR  '+Math.round(G.hr)+' bpm',650,120);
 x.fillStyle=col(0,G.bp>155);x.fillText('BP  '+Math.round(G.bp)+'/'+Math.round(G.bp*0.65),650,140);
 x.fillStyle=col(0,G.o2<90);x.fillText('O2  '+Math.round(G.o2)+'%',650,160);
 x.fillStyle='#ffe9c7';x.fillText('Stress',20,560);x.fillStyle='#3a1424';x.fillRect(90,546,200,16);x.fillStyle=G.stress>60?'#ff5a5a':'#e8a0b0';x.fillRect(90,546,2*G.stress,16);
 if(G.crit>0){x.fillStyle='#ff5a5a';x.font='bold 20px Georgia';x.fillText('⚠ CRITICAL '+(4-G.crit).toFixed(1)+'s',650,195)}}
function hud(){x.fillStyle='#ffe9c7';x.font='18px Georgia';x.textAlign='left';x.fillText('Patient '+G.level+': '+G.patient,20,30);x.fillText('Score '+G.score+'   Best '+G.best+'   ❤'.repeat(1)+' x'+G.lives,20,55);
 x.fillText('Step '+Math.min(4,G.phase+1)+'/4: '+(PH[Math.min(3,G.phase)][1]),20,80);
 if(G.medCD>0){x.fillText('💉 ready in '+Math.ceil(G.medCD)+'s',320,560)}
 if(G.msgT>0){x.textAlign='center';x.fillStyle='#ffcf6a';x.font='bold 20px Georgia';x.fillText(G.msg,450,520)}}
function draw(t){x.fillStyle='#2a0f1c';x.fillRect(0,0,900,600);x.fillStyle='#3d6b6b';x.beginPath();x.ellipse(HX,HY+20,300,230,0,0,7);x.fill();
 if(G.state==='title'){heartTitle(t);return}
 heart(t);drawPath();
 if(!G.graft.placed||G.phase>1){x.fillStyle='#f4a261';x.strokeStyle='#7a3';x.lineWidth=3;x.beginPath();x.ellipse(G.graft.x,G.graft.y,26,10,0.5,0,7);x.fill();x.stroke()}
 if(G.tool==='paddles'){x.fillStyle='#3a1424';x.fillRect(560,450,40,120);x.fillStyle='#2a9d8f';x.fillRect(560,570-G.zone[1]*120,40,(G.zone[1]-G.zone[0])*120);x.fillStyle='#ffcf6a';x.fillRect(555,568-G.charge*120,50,4);
  x.fillStyle='#e63946';x.fillRect(640,460,220,90);x.fillStyle='#fff';x.font='bold 32px Georgia';x.textAlign='center';x.fillText('⚡ SHOCK',750,515)}
 monitor(t);hud();
 if(G.state==='saved'&&G.phase>=4||G.state==='demo'){x.fillStyle='rgba(0,0,0,.4)';x.fillRect(0,0,900,600);x.fillStyle='#e8a0b0';x.font='bold 44px Georgia';x.textAlign='center';x.fillText('💖 Patient saved!',450,300)}
 if(G.state==='over'){x.fillStyle='rgba(10,3,6,.85)';x.fillRect(0,0,900,600);x.textAlign='center';x.fillStyle='#e8a0b0';x.font='bold 48px Georgia';x.fillText('Surgery over',450,220);
  x.fillStyle='#ffe9c7';x.font='24px Georgia';x.fillText('Patients saved: '+(G.level-1)+'   Score: '+G.score,450,290);x.fillText('Best: '+G.best,450,330);x.fillText('Tap or press Space to scrub in again',450,400)}}
function heartTitle(t){G.hr=70;G.flat=false;G.graft.placed=true;heart(t);x.textAlign='center';x.fillStyle='#e8a0b0';x.font='bold 54px Georgia';x.fillText('Coffeebreak Heart Surgeon',450,90);
 x.fillStyle='#ffe9c7';x.font='20px Georgia';['Pick the right tool, trace steady incisions, place the bypass graft,','stitch up and restart the heart. Keep the vitals stable!','Tap or press Space to scrub in'].forEach((l,i)=>x.fillText(l,450,480+i*30));x.fillText('Best: '+G.best,450,575)}
G.graft={x:0,y:0,placed:true};G.path=[];G.stitches=[];G.hr=70;G.stress=0;
function loop(n){const dt=Math.min(0.05,(n-last)/1000);last=n;step(dt);draw(n/1000);requestAnimationFrame(loop)}requestAnimationFrame(loop);
Object.assign(G,{start,pickTool,down,move,up,shock});
