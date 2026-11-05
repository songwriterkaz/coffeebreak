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
function skull(X,Y,s,col){x.fillStyle=col||'#ffe9ef';x.beginPath();x.arc(X,Y,6*s,0,7);x.fill();x.fillRect(X-3.5*s,Y+3*s,7*s,4*s);x.fillStyle='#12060c';x.beginPath();x.arc(X-2.3*s,Y,1.6*s,0,7);x.arc(X+2.3*s,Y,1.6*s,0,7);x.fill()}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}x.fillStyle='#8a1030';x.beginPath();x.arc(X,Y,2.2*s,0,7);x.fill()}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Rescue Crew: Life Saver =====
const DEMO=()=>!!window.DEMO;
const G={state:'hq',score:0,level:1,m:null,msg:'',res:null,tab:'missions'};
const SK='rescueSave';let S;try{S=JSON.parse(localStorage[SK])}catch(e){}
S=Object.assign({lives:0,cred:0,up:{},done:{},best:{},missions:0},S||{});S.up=S.up||{};
function save(){if(!DEMO())localStorage[SK]=JSON.stringify(S);G.score=S.lives;G.level=1+Object.keys(S.up).length}
save();
const keys={};addEventListener('keydown',e=>{keys[e.code]=1;if(G.state==='play'&&G.m&&G.m.key)G.m.key(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&G.state==='play')e.preventDefault()});addEventListener('keyup',e=>keys[e.code]=0);
let mouse={x:450,y:300,down:false};
const ORANGE='#f07a1a',ORD='#b85408';
function crew(X,Y,s,o={}){x.save();x.translate(X,Y);x.scale(s,s);
 x.fillStyle='#2a2a2a';x.fillRect(-9,22,7,14);x.fillRect(2,22,7,14);// boots/legs
 x.fillStyle=ORANGE;rr(-12,-4,24,30,6);x.fill();x.fillRect(-10,18,8,12);x.fillRect(2,18,8,12);
 x.fillStyle='#e8f0f0';x.fillRect(-12,8,24,3);x.fillRect(-12,15,24,3);// reflective
 x.fillStyle=ORANGE;x.fillRect(-18,-2,6,18);x.fillRect(12,-2,6,18);x.fillStyle='#f3c9a8';x.beginPath();x.arc(-15,18,3.5,0,7);x.arc(15,18,3.5,0,7);x.fill();
 x.fillStyle='#f3c9a8';x.beginPath();x.arc(0,-14,11,0,7);x.fill();
 x.fillStyle=o.helmet||'#fff6e8';x.beginPath();x.arc(0,-17,12,Math.PI,0);x.fill();x.fillRect(-14,-18,28,3);
 x.fillStyle='#1a0a10';x.beginPath();x.arc(-4,-13,2,0,7);x.arc(4,-13,2,0,7);x.fill();
 x.fillStyle='#e8708a';x.globalAlpha=.6;x.beginPath();x.arc(-7,-9,2.4,0,7);x.arc(7,-9,2.4,0,7);x.fill();x.globalAlpha=1;
 x.strokeStyle='#1a0a10';x.lineWidth=1.4;x.beginPath();x.arc(0,-10,3,.2,Math.PI-.2);x.stroke();
 rose(0,-27,.9);x.restore()}
function person(X,Y,s,wave,col){x.save();x.translate(X,Y);x.scale(s,s);x.fillStyle=col||'#6aa0d8';rr(-8,-4,16,20,4);x.fill();x.fillStyle='#f3c9a8';x.beginPath();x.arc(0,-11,7,0,7);x.fill();
 x.strokeStyle='#f3c9a8';x.lineWidth=3;x.beginPath();const a=wave?Math.sin(t*10)*.5:0;x.moveTo(8,0);x.lineTo(14,-10+a*8);x.moveTo(-8,0);x.lineTo(-14,-10-a*8);x.stroke();
 x.fillStyle='#1a0a10';x.beginPath();x.arc(-2.5,-11,1.3,0,7);x.arc(2.5,-11,1.3,0,7);x.fill();x.restore()}
function hud(title,extra){x.fillStyle='rgba(20,8,4,.75)';x.fillRect(0,0,W,38);x.fillStyle='#ffd9a8';x.font='bold 17px Georgia';x.textAlign='left';x.fillText('🦺 '+title,12,25);if(extra){x.textAlign='center';x.fillText(extra,W/2+90,25)}x.textAlign='left'}
function tipBar(s){x.fillStyle='rgba(20,8,4,.7)';x.fillRect(0,H-30,W,30);x.fillStyle='#ffe9c7';x.font='13px Georgia';x.textAlign='center';x.fillText(s,W/2,H-10);x.textAlign='left'}
const D2=(a,b,c2,d)=>Math.hypot(a-c2,b-d);
const rnd=(a,b)=>a+Math.random()*(b-a);
function finish(saved,ok,note){const m=G.m;const cred=Math.round(saved*25+(ok?30:5)+(m.bonus||0));S.lives+=saved;S.cred+=cred;S.missions++;S.done[m.id]=(S.done[m.id]||0)+1;S.best[m.id]=Math.max(S.best[m.id]||0,saved);save();
 G.res={id:m.id,saved,ok,cred,note:note||''};G.state='result';fx(ok?'🎉':'💪')}
let parts=[];function fx(e){for(let i=0;i<12;i++)parts.push({x:450,y:300,vx:rnd(-200,200),vy:rnd(-260,40),l:1.4,e})}
// ---------- missions ----------
const MISSIONS=[
 {id:'flood',name:'Flood Rescue',ic:'🚤',desc:'Steer the rescue boat through floodwater, pick people off rooftops and bring them to the evac centre. Dodge debris!',tip:'Real life: If it\'s flooded, forget it. Never drive or walk into floodwater.',demo:true},
 {id:'surf',name:'Surf Patrol: Newcastle Beach',ic:'🏄',desc:'Set the red-and-yellow patrol flags away from the rip, then paddle the rescue board to swimmers caught in the rip.',tip:'Real life: Swim between the red and yellow flags. Caught in a rip? Stay calm, float, raise an arm.',demo:true},
 {id:'cpr',name:'First Aid: DRSABCD + CPR',ic:'❤️',desc:'Put the DRSABCD action plan in order, then do chest compressions at the right rhythm: 100–120 a minute.',tip:'Real life: call 000 in an emergency. Doing CPR is better than doing nothing. Do a real first-aid course!',demo:true},
 {id:'storm',name:'Storm Damage',ic:'🌳',desc:'A tree came down on a house. Hold to cut the branches off the roof, then tarp every hole before the rain soaks the family home.',tip:'Real life: stay away from fallen power lines, keep 8 m back and call for help.'},
 {id:'crash',name:'Road Crash Rescue',ic:'🚗',desc:'Make the scene safe and free the trapped driver: follow the right steps in the right order.',tip:'Real life: at a crash call 000, keep yourself safe first and don\'t move a patient unless there is danger.'},
 {id:'bush',name:'Bushland Search',ic:'🌲',desc:'A bushwalker is lost. Search the grid, follow footprints and clues, and find them before dark.',tip:'Real life: tell someone your plans, take water, and stay put if you are lost.'}];
const UPG=[
 {id:'boat',name:'Turbo boat engine',ic:'🚤',cost:60,d:'Flood boat is 35% faster'},
 {id:'cap',name:'Bigger rescue boat',ic:'🛟',cost:80,d:'Carry 4 people instead of 3'},
 {id:'board',name:'Pro rescue board',ic:'🏄',cost:70,d:'Paddle faster in the surf'},
 {id:'aed',name:'AED defib kit',ic:'⚡',cost:80,d:'Bonus credits on CPR missions'},
 {id:'saw',name:'Pro chainsaw',ic:'🪚',cost:60,d:'Cut branches twice as fast'},
 {id:'drone',name:'Thermal drone',ic:'🛸',cost:90,d:'Bush search reveals a wider area'},
 {id:'truck',name:'Shiny new rescue truck',ic:'🚒',cost:150,d:'Upgrade the HQ driveway'},
 {id:'mascot',name:'Marshmallow crew mascot',ic:'🍡',cost:40,d:'A cute mascot at HQ, +5 credits a mission'}];
const MK={};
MK.flood=()=>{const cap=S.up.cap?4:3,sp=S.up.boat?190:140;const houses=[];for(let i=0;i<5;i++)houses.push({x:200+i*130+rnd(-20,20),y:rnd(110,470),p:1});
 const logs=[];for(let i=0;i<5;i++)logs.push({x:rnd(100,900),y:rnd(80,540),vx:rnd(40,90),r:rnd(0,3)});
 return {id:'flood',time:90,boat:{x:60,y:300,a:0},load:0,saved:0,hp:3,inv:0,houses,logs,
 update(dt){this.time-=dt;const b=this.boat;let tx=0,ty=0;if(keys.ArrowLeft||keys.KeyA)tx--;if(keys.ArrowRight||keys.KeyD)tx++;if(keys.ArrowUp||keys.KeyW)ty--;if(keys.ArrowDown||keys.KeyS)ty++;
  if(mouse.down){const dx=mouse.x-b.x,dy=mouse.y-b.y,m=Math.hypot(dx,dy);if(m>10){tx=dx/m;ty=dy/m}}
  const m=Math.hypot(tx,ty)||1;b.x+=tx/m*sp*dt+25*dt;b.y+=ty/m*sp*dt;if(tx||ty)b.a=Math.atan2(ty,tx);b.x=Math.max(20,Math.min(880,b.x));b.y=Math.max(55,Math.min(560,b.y));
  for(const h of this.houses)if(h.p&&this.load<cap&&D2(b.x,b.y,h.x,h.y+30)<48){h.p=0;this.load++;fx('🙌')}
  if(b.x<80&&this.load){this.saved+=this.load;this.load=0;fx('💛')}
  this.inv-=dt;for(const l of this.logs){l.x+=l.vx*dt;if(l.x>940){l.x=-40;l.y=rnd(80,540)}if(this.inv<=0&&D2(b.x,b.y,l.x,l.y)<34){this.hp--;this.inv=1.5;b.x-=40}}
  if(this.saved>=5)finish(this.saved,true,'Everyone off the rooftops and safe at the evac centre!');else if(this.time<=0||this.hp<=0)finish(this.saved,this.saved>=3,this.hp<=0?'The boat took too much damage — the crew towed you back.':'Time\'s up!')},
 draw(){x.fillStyle='#7a5a38';x.fillRect(0,0,W,H);for(let i=0;i<40;i++){x.strokeStyle='rgba(255,230,190,.15)';x.beginPath();const yy=(i*37)%H,xx=((i*97)+t*40)%W;x.moveTo(xx,yy);x.lineTo(xx+30,yy);x.stroke()}
  x.fillStyle='#4f8a3a';x.fillRect(0,0,80,H);x.fillStyle='#fff';x.font='bold 13px Georgia';x.save();x.translate(40,300);x.rotate(-Math.PI/2);x.textAlign='center';x.fillText('⛺ EVAC CENTRE — drop people here',0,5);x.restore();
  for(const h of this.houses){x.fillStyle='#d8c8b0';x.fillRect(h.x-30,h.y+10,60,30);x.fillStyle='#8a2a2a';x.beginPath();x.moveTo(h.x-38,h.y+12);x.lineTo(h.x,h.y-16);x.lineTo(h.x+38,h.y+12);x.fill();if(h.p)person(h.x,h.y-18,1,true)}
  for(const l of this.logs){x.save();x.translate(l.x,l.y);x.rotate(l.r);x.fillStyle='#4a2c14';rr(-28,-8,56,16,8);x.fill();x.restore()}
  const b=this.boat;x.save();x.translate(b.x,b.y);x.rotate(b.a);if(this.inv>0&&(t*10|0)%2)x.globalAlpha=.4;x.fillStyle=ORANGE;x.beginPath();x.moveTo(30,0);x.lineTo(-22,-15);x.lineTo(-22,15);x.fill();x.fillStyle='#fff';x.fillRect(-14,-3,24,6);x.restore();crew(b.x,b.y-4,.55);
  hud('Flood Rescue','⏱ '+Math.ceil(this.time)+'s   🛟 aboard '+this.load+'/'+cap+'   💛 saved '+this.saved+'/5   🔧 boat '+'🔧'.repeat(Math.max(0,this.hp)));
  tipBar('Arrows/WASD or hold & drag to steer · the current pulls you downstream · If it\'s flooded, forget it!')}}};
MK.surf=()=>{const rx=rnd(330,520);return {id:'surf',phase:'flags',rx,flags:[],time:70,board:{x:450,y:500},carry:0,saved:0,swim:[{x:rx+45,y:200,in:1},{x:rx+30,y:150,in:1}],note:'',
 inRip(px){return px>this.rx-10&&px<this.rx+100},
 down(p){if(this.phase!=='flags')return;if(p.y<440||p.y>560)return;this.flags.push(p.x);if(this.flags.length===2){const [a,b]=this.flags.sort((m,n)=>m-n);if(b-a<120){this.note='Flags too close together — give swimmers room!';this.flags=[];return}if(!(b<this.rx-20||a>this.rx+110)){this.note='The rip is between those flags! Look for the calm dark gap with no waves.';this.flags=[];this.bonus=(this.bonus||0)-5;return}this.note='Great flags — away from the rip. Now: two swimmers drifted into it!';this.phase='rescue';this.bonus=(this.bonus||0)+15}},
 update(dt){if(this.phase!=='rescue')return;this.time-=dt;const b=this.board,sp=S.up.board?200:150;let tx=0,ty=0;if(keys.ArrowLeft||keys.KeyA)tx--;if(keys.ArrowRight||keys.KeyD)tx++;if(keys.ArrowUp||keys.KeyW)ty--;if(keys.ArrowDown||keys.KeyS)ty++;
  if(mouse.down){const dx=mouse.x-b.x,dy=mouse.y-b.y,m=Math.hypot(dx,dy);if(m>8){tx=dx/m;ty=dy/m}}const m=Math.hypot(tx,ty)||1;b.x+=tx/m*sp*dt;b.y+=ty/m*sp*dt;
  if(this.inRip(b.x)&&b.y<440)b.y-=70*dt;b.x=Math.max(10,Math.min(890,b.x));b.y=Math.max(60,Math.min(520,b.y));
  for(const s of this.swim){if(s.in){s.y=Math.max(70,s.y-12*dt);if(!this.carry&&D2(b.x,b.y,s.x,s.y)<30){s.in=0;this.carry=1;fx('🤝')}}}
  if(this.carry&&b.y>430&&!this.inRip(b.x)){this.carry=0;this.saved++;fx('💛')}
  if(this.carry&&b.y>430&&this.inRip(b.x))this.note='Paddle sideways out of the rip, then come in on the breaking waves!';
  if(this.saved>=2)finish(2,true,'Both swimmers safe on the sand. Ripper patrol!');else if(this.time<=0)finish(this.saved,this.saved>0,'Time\'s up — the IRB crew helped finish the rescue.')},
 draw(){const sea=x.createLinearGradient(0,40,0,440);sea.addColorStop(0,'#1a6a9a');sea.addColorStop(1,'#4ab8d8');x.fillStyle=sea;x.fillRect(0,0,W,440);
  for(let r=0;r<6;r++){const yy=430-r*55+Math.sin(t*2+r)*6;x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=3;x.beginPath();x.moveTo(0,yy);for(let xx=0;xx<=W;xx+=20){if(this.inRip(xx)&&r<5){x.moveTo(xx+20,yy);continue}x.lineTo(xx,yy+Math.sin(xx/30+t*3)*3)}x.stroke()}
  x.fillStyle='rgba(10,50,80,.35)';x.fillRect(this.rx,40,90,400);if(this.phase==='rescue'||G.showRip){x.fillStyle='rgba(255,255,255,.7)';x.font='bold 16px Georgia';x.textAlign='center';for(let k=0;k<4;k++)x.fillText('⬆',this.rx+45,400-k*90-(t*40%90));x.textAlign='left'}
  x.fillStyle='#f0d9a0';x.fillRect(0,440,W,160);x.fillStyle='#e8c880';for(let i=0;i<30;i++)x.fillRect((i*131)%W,450+(i*53)%140,3,3);
  x.fillStyle='#5a3a2a';x.font='bold 14px Georgia';x.fillText('🏖 Newcastle Beach',12,590-30);emo('🛟',840,500,30);
  for(const f of this.flags){x.strokeStyle='#333';x.lineWidth=3;x.beginPath();x.moveTo(f,520);x.lineTo(f,460);x.stroke();x.fillStyle='#d82020';x.fillRect(f,460,26,9);x.fillStyle='#f8d820';x.fillRect(f,469,26,9)}
  if(this.phase==='rescue'){const [a,b]=this.flags;for(let i=0;i<3;i++)person(a+30+i*((b-a-60)/2),400+Math.sin(t*2+i)*4,.7,false,'#e870a0');
   for(const s of this.swim)if(s.in)person(s.x,s.y,.9,true,'#e8c020');const bd=this.board;x.fillStyle='#f8d820';rr(bd.x-10,bd.y-28,20,56,10);x.fill();x.fillStyle='#d82020';x.fillRect(bd.x-10,bd.y-4,20,8);crew(bd.x,bd.y-8,.55,{helmet:'#d82020'});if(this.carry)person(bd.x,bd.y+18,.6,false,'#e8c020')}
  hud('Surf Patrol',this.phase==='flags'?'Tap the sand to place 2 flags (away from the rip)':'⏱ '+Math.ceil(this.time)+'s   💛 rescued '+this.saved+'/2'+(this.carry?'   🤝 swimmer on board':''));
  if(this.note){x.fillStyle='rgba(0,0,0,.6)';rr(150,50,600,30,8);x.fill();x.fillStyle='#fff';x.font='14px Georgia';x.textAlign='center';x.fillText(this.note,450,70);x.textAlign='left'}
  tipBar(this.phase==='flags'?'Hint: a rip is the calm, darker gap where waves aren\'t breaking.':'Arrows/WASD or hold & drag to paddle · rips pull you OUT — paddle sideways to escape')}}};
const DRS=[['D','Danger','Check for danger to you, others and the patient'],['R','Response','Talk and touch: are they responsive?'],['S','Send for help','Call Triple Zero (000)'],['A','Airway','Open the mouth, clear the airway'],['B','Breathing','Look, listen and feel for normal breathing'],['C','CPR','30 compressions : 2 breaths'],['D2','Defibrillation','Attach an AED as soon as one is available']];
MK.cpr=()=>({id:'cpr',phase:'drs',step:0,mist:0,order:DRS.map((d,i)=>i).sort(()=>Math.random()-.5),comp:0,cyc:0,taps:[],good:0,tot:0,breaths:0,flash:0,note:'Put the DRSABCD action plan in order.',
 pick(i){if(this.phase!=='drs')return;if(i===this.step){this.step++;this.note=DRS[i][1]+': '+DRS[i][2];if(this.step===5){this.phase='comp';this.note='Tap the chest (or Space) — aim for 100–120 a minute. 30 compressions.'}}else{this.mist++;this.note='Not yet! Next is '+DRS[this.step][1]+'.'}},
 press(){if(this.phase==='comp'){const n=performance.now()/1000;if(this.taps.length){const iv=n-this.taps[this.taps.length-1];this.tot++;if(iv>=.47&&iv<=.64)this.good++;this.rate=60/iv}this.taps.push(n);this.flash=.15;this.comp++;if(this.comp>=30){this.phase='breath';this.note='Now 2 rescue breaths — tap Breathe twice.'}}},
 breathe(){if(this.phase!=='breath')return;this.breaths++;if(this.breaths>=2){this.breaths=0;this.cyc++;this.comp=0;this.taps=[];if(this.cyc>=2){this.phase=S.up.aed?'aed':'done';this.note=S.up.aed?'AED arrived! Tap Attach AED and follow its voice prompts.':'';if(!S.up.aed)this.end()}else{this.phase='comp';this.note='Cycle 2: another 30 compressions.'}}},
 end(){const acc=this.tot?this.good/this.tot:0;this.bonus=Math.round(acc*40)-this.mist*3+(S.up.aed?25:0);finish(acc>=.4?1:0,acc>=.4,'Rhythm accuracy '+Math.round(acc*100)+'% · '+this.mist+' DRSABCD mix-ups. The ambulance crew took over — well done!')},
 key(k){if(k==='Space')this.press()},
 down(p){if(this.phase==='comp'&&D2(p.x,p.y,330,330)<130)this.press()},
 update(dt){this.flash-=dt},
 draw(){x.fillStyle='#2a3a2a';x.fillRect(0,0,W,H);x.fillStyle='#3a5a3a';x.fillRect(0,350,W,250);
  // patient
  x.fillStyle='#f3c9a8';x.beginPath();x.ellipse(170,380,32,28,0,0,7);x.fill();x.fillStyle='#6aa0d8';rr(200,345,240,70,20);x.fill();x.fillStyle='#3a5a8a';x.fillRect(440,355,160,50);
  const pr=this.flash>0?8:0;x.fillStyle='rgba(255,120,140,.35)';x.beginPath();x.arc(330,380,40+pr,0,7);x.fill();emo('🫀',330,380,30);crew(330,300+pr,1.3);
  if(this.phase==='drs'){this.order.forEach((i,k)=>{const d=DRS[i],done=i<this.step;button('d'+k,560+(k%2)*165,60+Math.floor(k/2)*62,155,52,(done?'✓ ':'')+d[1],()=>this.pick(i),{dis:done,fs:15})})}
  if(this.phase==='comp'||this.phase==='breath'){x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText('Compressions '+this.comp+'/30 · cycle '+(this.cyc+1)+'/2',560,90);
   const r=this.rate||0;x.fillStyle='#111';rr(560,110,300,26,8);x.fill();const zone=(v)=>560+Math.max(0,Math.min(1,(v-60)/100))*300;x.fillStyle='#3a8a3a';x.fillRect(zone(100),110,zone(120)-zone(100),26);x.fillStyle='#ffd040';x.fillRect(zone(r)-3,106,6,34);
   x.fillStyle='#ffe9c7';x.font='14px Georgia';x.fillText('Rate: '+(r?Math.round(r):'–')+' / min  (green = 100–120)',560,158);x.fillText('Good rhythm: '+this.good+'/'+this.tot,560,180);
   if(this.phase==='comp')button('push',560,200,300,70,'🫸 PUSH (Space)',()=>this.press());else button('br',560,200,300,70,'💨 Breathe ('+this.breaths+'/2)',()=>this.breathe())}
  if(this.phase==='aed')button('aed',560,200,300,70,'⚡ Attach AED',()=>this.end());
  hud('First Aid: DRSABCD + CPR','Step '+Math.min(this.step+1,7)+' / 7');x.fillStyle='rgba(0,0,0,.55)';rr(30,50,500,50,10);x.fill();x.fillStyle='#fff';x.font='15px Georgia';wrapT(this.note,45,72,470,19);
  tipBar('Practice game only — in a real emergency call 000 and follow the operator. Learn real CPR at a first-aid course.')}});
MK.storm=()=>{const fast=S.up.saw?2:1;return {id:'storm',phase:'cut',time:50,dmg:0,br:[{x:300,y:190,p:0},{x:460,y:160,p:0},{x:610,y:200,p:0}],holes:[],hold:null,note:'Hold on each branch to cut it off the roof (stay clear of power lines!)',
 down(p){if(this.phase==='cut'){for(const b of this.br)if(b.p<1&&D2(p.x,p.y,b.x,b.y)<55)this.hold=b}else{for(const h of this.holes)if(!h.t&&Math.abs(p.x-h.x)<36&&Math.abs(p.y-h.y)<26){h.t=1;fx('🟦')}}},
 up(){this.hold=null},
 update(dt){this.time-=dt;if(this.hold&&mouse.down){this.hold.p+=dt/1.6*fast;if(this.hold.p>=1){this.hold=null;fx('🪵')}}
  if(this.phase==='cut'&&this.br.every(b=>b.p>=1)){this.phase='tarp';this.note='Rain is coming! Tap every hole to tarp it.';for(let i=0;i<7;i++)this.holes.push({x:250+rnd(0,400),y:190+rnd(0,90),t:0})}
  if(this.phase==='tarp'){this.dmg+=this.holes.filter(h=>!h.t).length*dt*1.4;if(this.holes.every(h=>h.t)){this.bonus=Math.max(0,40-Math.round(this.dmg));finish(4,true,'Roof tarped and the family of 4 is safe and dry. Water damage '+Math.round(this.dmg)+'%.')}}
  if(this.time<=0||this.dmg>=100)finish(this.phase==='tarp'?4:2,false,'The storm got ahead of us, but everyone got out safely.')},
 draw(){x.fillStyle='#3a4a5a';x.fillRect(0,0,W,H);if(this.phase==='tarp'){x.strokeStyle='rgba(180,200,255,.5)';for(let i=0;i<80;i++){const rx=(i*53+t*300)%W,ry=(i*97+t*700)%H;x.beginPath();x.moveTo(rx,ry);x.lineTo(rx-4,ry+14);x.stroke()}}
  x.fillStyle='#4a6a3a';x.fillRect(0,470,W,130);x.fillStyle='#d8c8b0';x.fillRect(220,280,460,190);x.fillStyle='#8a2a2a';x.beginPath();x.moveTo(190,290);x.lineTo(450,120);x.lineTo(710,290);x.fill();
  x.fillStyle='#5a3a20';x.fillRect(420,380,60,90);x.fillStyle='#bfe0f0';x.fillRect(270,320,80,60);x.fillRect(550,320,80,60);
  x.strokeStyle='#222';x.lineWidth=2;x.beginPath();x.moveTo(0,110);x.quadraticCurveTo(450,160,900,100);x.stroke();x.fillStyle='#ffd040';x.font='12px Georgia';x.fillText('⚡ power line — keep clear',20,100);
  x.fillStyle='#3a2410';x.fillRect(760,200,40,270);
  for(const b of this.br)if(b.p<1){x.save();x.translate(b.x,b.y);x.rotate(-.3);x.fillStyle='#5a3a1a';x.fillRect(-60,-8,120,16);x.fillStyle='#2e6a2a';x.beginPath();x.arc(40,-10,26,0,7);x.arc(-30,-14,20,0,7);x.fill();x.restore();if(b.p>0){x.fillStyle='#111';x.fillRect(b.x-30,b.y+28,60,8);x.fillStyle='#ffd040';x.fillRect(b.x-30,b.y+28,60*b.p,8)}}
  for(const h of this.holes){if(h.t){x.fillStyle='#2a6ad8';rr(h.x-34,h.y-22,68,44,4);x.fill();x.strokeStyle='#fff';x.strokeRect(h.x-30,h.y-18,60,36)}else{x.fillStyle='#1a1010';x.beginPath();x.ellipse(h.x,h.y,22,14,0,0,7);x.fill()}}
  crew(150,430,1.1);if(this.hold)emo('🪚',this.hold.x,this.hold.y-30,30);
  hud('Storm Damage','⏱ '+Math.ceil(this.time)+'s'+(this.phase==='tarp'?'   💧 water damage '+Math.round(this.dmg)+'%':''));x.fillStyle='rgba(0,0,0,.55)';rr(150,46,600,28,8);x.fill();x.fillStyle='#fff';x.font='14px Georgia';x.textAlign='center';x.fillText(this.note,450,65);x.textAlign='left';
  tipBar('Real life: stay 8 m away from fallen power lines and call for help.')}}};
const CR=[['cones','🚧 Place traffic cones',120,420],['ign','🔑 Turn off ignition',470,330],['chock','🧱 Stabilise the car',600,430],['glass','🪟 Protect patient & glass',380,300],['cut','✂️ Cut the door (hold)',530,350],['collar','🩹 Neck collar & spine board',440,250],['amb','🚑 Hand over to ambulance',800,360]];
MK.crash=()=>({id:'crash',step:0,mist:0,time:0,hold:0,holding:false,note:'Make the scene safe and free the driver. Pick the steps in the right order.',spots:CR.map((c,i)=>i).sort(()=>Math.random()-.5),
 down(p){for(const i of this.spots){const s=CR[i];if(D2(p.x,p.y,s[2],s[3])<38){if(i===this.step){if(s[0]==='cut'){this.holding=true;return}this.step++;fx('✅');this.note=['Cones out — traffic slowed.','Ignition off, hazards on.','Car stabilised with step chocks.','Patient covered, glass managed.','',"Collar on, patient on the board — gently!",''][i]||''}else{this.mist++;this.note='Hmm — safety first! Think: what should happen before that?'}return}}},
 up(){this.holding=false},
 update(dt){this.time+=dt;if(this.holding&&mouse.down&&this.step===4){this.hold+=dt/2;if(this.hold>=1){this.holding=false;this.step++;this.note='Door off! Now protect the spine.';fx('✂️')}}
  if(this.step>=CR.length){this.bonus=Math.max(0,40-this.mist*8-Math.round(this.time/3));finish(1,this.mist<4,'Driver freed and in the ambulance. '+this.mist+' wrong steps, '+Math.round(this.time)+'s.')}},
 draw(){x.fillStyle='#4a4a50';x.fillRect(0,0,W,H);x.fillStyle='#6a8a4a';x.fillRect(0,0,W,180);x.fillStyle='#fff';for(let i=0;i<10;i++)x.fillRect(i*100,470,50,8);
  x.save();x.translate(500,370);x.rotate(.08);x.fillStyle='#c84a8a';rr(-140,-50,280,90,20);x.fill();x.fillStyle='#bfe0f0';rr(-90,-80,170,40,12);x.fill();x.fillStyle='#222';x.beginPath();x.arc(-90,45,26,0,7);x.arc(90,45,26,0,7);x.fill();x.restore();
  x.fillStyle='#fff';rr(740,320,150,90,10);x.fill();x.fillStyle='#d82020';x.fillRect(740,350,150,10);emo('🚑',815,300,34);person(470,320,.8,false,'#8a6ad8');crew(260,400,1.1);
  for(const i of this.spots){const s=CR[i],done=i<this.step;x.globalAlpha=done?.35:1;x.fillStyle=done?'#3a8a3a':'rgba(255,208,64,'+(.6+Math.sin(t*4)*.3)+')';x.beginPath();x.arc(s[2],s[3],30,0,7);x.fill();x.fillStyle='#1a0a10';x.font='bold 12px Georgia';x.textAlign='center';emo(s[1].split(' ')[0],s[2],s[3],24);x.fillStyle='#fff';x.font='bold 12px Georgia';x.fillText(s[1].slice(s[1].indexOf(' ')+1),s[2],s[3]+46);x.globalAlpha=1}
  if(this.step===4&&this.hold>0){x.fillStyle='#111';x.fillRect(480,300,100,10);x.fillStyle='#ffd040';x.fillRect(480,300,100*this.hold,10)}
  x.textAlign='left';hud('Road Crash Rescue','Step '+Math.min(this.step+1,7)+'/7 · ⏱ '+Math.round(this.time)+'s · mix-ups '+this.mist);x.fillStyle='rgba(0,0,0,.55)';rr(150,46,600,28,8);x.fill();x.fillStyle='#fff';x.font='14px Georgia';x.textAlign='center';x.fillText(this.note,450,65);x.textAlign='left';
  tipBar('Real life: call 000, keep yourself safe, and only move a patient if they are in danger.')}});
MK.bush=()=>{const C=14,R=8,tx=Math.random()*C|0,ty=Math.random()*R|0;const sc=[];for(let i=0;i<C;i++){sc[i]=[];for(let j=0;j<R;j++)sc[i][j]=0}return {id:'bush',C,R,tx,ty,sc,moves:22,found:false,note:'Tap a square to search it. Footprints point toward the walker; the radio says if you\'re getting warmer.',
 down(p){const i=Math.floor((p.x-30)/60),j=Math.floor((p.y-60)/60);if(i<0||j<0||i>=C||j>=R||this.found)return;const rad=S.up.drone?1:0;let hit=false;for(let a=-rad;a<=rad;a++)for(let b=-rad;b<=rad;b++){const u=i+a,v=j+b;if(u>=0&&v>=0&&u<C&&v<R){if(!this.sc[u][v])this.sc[u][v]=1;if(u===tx&&v===ty)hit=true}}this.moves--;
  if(hit){this.found=true;this.note='Found them! Cold and thirsty but OK.';fx('🔦');setTimeout(()=>finish(1,true,'Bushwalker found with '+this.moves+' searches to spare.'),900);this.bonus=this.moves*2;return}
  const d=Math.hypot(i-tx,j-ty);this.note=(this.last!=null?(d<this.last?'📻 "Warmer!"':'📻 "Colder…"'):'📻 Keep searching')+(d<3?' Fresh footprints nearby!':'');this.last=d;if(this.moves<=0)finish(0,false,'Night fell. The helicopter with thermal camera found them — next time!')},
 update(){},
 draw(){x.fillStyle='#1e3a1e';x.fillRect(0,0,W,H);for(let i=0;i<C;i++)for(let j=0;j<R;j++){const X=30+i*60,Y=60+j*60;x.fillStyle=this.sc[i][j]?'#7a6a40':'#2e5a2a';x.fillRect(X+1,Y+1,58,58);
   if(!this.sc[i][j]){emo((i*7+j*3)%4?'🌲':'🌳',X+30,Y+32,30)}else{const d=Math.hypot(i-tx,j-ty);if(d<4&&!(i===tx&&j===ty)){x.save();x.translate(X+30,Y+30);x.rotate(Math.atan2(ty-j,tx-i)+Math.PI/2);emo('👣',0,0,22);x.restore()}}
   if(this.found&&i===tx&&j===ty){person(X+30,Y+36,1,true,'#e8c020')}}
  const dk=Math.max(0,.45-this.moves*.02);x.fillStyle='rgba(0,0,30,'+dk+')';x.fillRect(0,40,W,H);
  hud('Bushland Search','🔦 searches left '+this.moves+(S.up.drone?'  🛸 drone: 3×3 reveal':''));x.fillStyle='rgba(0,0,0,.6)';rr(30,548,840,24,8);x.fill();x.fillStyle='#fff';x.font='13px Georgia';x.textAlign='center';x.fillText(this.note,450,565);x.textAlign='left';
  tipBar('Real life: tell someone your plans, carry water, and if you\'re lost, stay where you are.')}}};
function startMission(id){const M=MISSIONS.find(m=>m.id===id);if(DEMO()&&!M.demo)return demoEnd('The free demo has 3 missions: Flood Rescue, Surf Patrol and First Aid CPR. Get the full game for Storm Damage, Road Crash Rescue, Bushland Search, every HQ upgrade and all 38 songs!');
 G.brief=M;G.state='brief';startMusic()}
function go(){G.m=MK[G.brief.id]();if(S.up.mascot)G.m.bonus=(G.m.bonus||0)+5;G.state='play'}
function buy(u){if(S.up[u.id]||S.cred<u.cost)return;S.cred-=u.cost;S.up[u.id]=1;save();fx(u.ic)}
bindInput({down(p){mouse.x=p.x;mouse.y=p.y;mouse.down=true;if(G.state==='play'&&G.m.down)G.m.down(p)},move(p){mouse.x=p.x;mouse.y=p.y},up(p){mouse.down=false;if(G.state==='play'&&G.m&&G.m.up)G.m.up(p)}});
function update(dt){if(G.state==='play'&&G.m)G.m.update(dt);for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt}parts=parts.filter(p=>p.l>0)}
function drawHQ(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1408');g.addColorStop(1,'#120806');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle=ORANGE;x.font='bold 30px Georgia';x.textAlign='center';x.fillText('🦺 Coffeebreak Rescue Crew: Life Saver',W/2,44);x.fillStyle='#ffd9a8';x.font='15px Georgia';x.fillText('Volunteer crew HQ · Newcastle NSW',W/2,66);
 x.fillStyle='#3a2010';rr(30,80,250,150,14);x.fill();x.fillStyle='#fff';x.font='bold 46px Georgia';x.fillText(S.lives,155,145);x.font='15px Georgia';x.fillText('💛 lives saved',155,170);x.fillStyle='#ffd040';x.fillText('🪙 '+S.cred+' crew credits',155,196);x.fillStyle='#ffd9a8';x.font='12px Georgia';x.fillText(S.missions+' missions run',155,216);
 // HQ shed
 x.fillStyle='#5a3a2a';x.fillRect(30,250,250,150);x.fillStyle=ORANGE;x.fillRect(30,250,250,26);x.fillStyle='#fff';x.font='bold 13px Georgia';x.fillText('RESCUE CREW HQ',155,268);x.fillStyle='#2a1a10';x.fillRect(60,300,110,100);
 emo(S.up.truck?'🚒':'🛻',115,365,S.up.truck?56:44);crew(215,355,1.2);if(S.up.mascot){x.drawImage(hero,240,345,40,40)}skull(270,290,1.3);rose(48,292,1.2);
 x.font='12px Georgia';x.fillStyle='#ffb0a0';wrapT('⚠️ This is a game. In a real emergency call Triple Zero (000).',155,425,240,15);
 button('tm',300,80,140,34,'🚨 Missions',()=>G.tab='missions',{sel:G.tab==='missions',fs:15});button('tu',450,80,140,34,'🔧 Upgrades',()=>G.tab='up',{sel:G.tab==='up',fs:15});
 if(G.tab==='missions')MISSIONS.forEach((m,i)=>{const lock=DEMO()&&!m.demo,X=300+(i%2)*290,Y=126+Math.floor(i/2)*112;x.fillStyle=lock?'#2a1a14':'#3a2010';rr(X,Y,280,102,12);x.fill();x.strokeStyle=lock?'#6a4a3a':ORANGE;x.lineWidth=2;x.stroke();
  x.textAlign='left';emo(m.ic,X+28,Y+32,30);x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 15px Georgia';x.fillText(m.name,X+52,Y+28);x.font='11px Georgia';x.fillStyle='#d8b8a0';wrapT(m.desc,X+12,Y+50,190,13);
  x.fillStyle='#ffd040';x.font='11px Georgia';x.fillText(S.done[m.id]?'✓ done ×'+S.done[m.id]:'',X+12,Y+96);button('m'+i,X+204,Y+60,68,32,lock?'🔒 Full':'Go!',()=>startMission(m.id),{fs:13,ac:lock?'#8a6a5a':ORANGE});x.textAlign='left'});
 else UPG.forEach((u,i)=>{const X=300+(i%2)*290,Y=126+Math.floor(i/2)*84,own=S.up[u.id];x.fillStyle='#3a2010';rr(X,Y,280,76,12);x.fill();x.textAlign='left';emo(u.ic,X+26,Y+30,26);x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 14px Georgia';x.fillText(u.name,X+48,Y+26);x.font='12px Georgia';x.fillStyle='#d8b8a0';x.fillText(u.d,X+12,Y+56);
  button('u'+i,X+196,Y+38,76,30,own?'✓ Owned':'🪙'+u.cost,()=>buy(u),{dis:own||S.cred<u.cost,fs:13,ac:ORANGE});x.textAlign='left'});
 x.textAlign='left'}
function draw(){x.clearRect(0,0,W,H);x.textAlign='left';
 if(G.state==='hq')drawHQ();
 else if(G.state==='brief'){drawHQ();x.fillStyle='rgba(0,0,0,.75)';x.fillRect(0,0,W,H);const M=G.brief;x.fillStyle='#2a1408';rr(170,110,560,360,18);x.fill();x.strokeStyle=ORANGE;x.lineWidth=3;x.stroke();x.textAlign='center';emo(M.ic,450,165,48);x.fillStyle=ORANGE;x.font='bold 26px Georgia';x.fillText(M.name,450,225);x.fillStyle='#ffe9c7';x.font='16px Georgia';wrapT(M.desc,450,260,480,22);x.fillStyle='#ffd040';x.font='italic 14px Georgia';wrapT(M.tip,450,350,480,19);button('go',330,400,240,48,'🚨 Start mission',go,{ac:ORANGE});button('bk',600,412,110,30,'Back',()=>G.state='hq',{fs:13})}
 else if(G.state==='play'){G.m.draw();button('quit',W-74,44,66,26,'Quit',()=>{G.state='hq'},{fs:12})}
 else if(G.state==='result'){if(G.m)G.m.draw();x.fillStyle='rgba(0,0,0,.72)';x.fillRect(0,0,W,H);const r=G.res;x.fillStyle='#2a1408';rr(200,120,500,330,18);x.fill();x.strokeStyle=ORANGE;x.lineWidth=3;x.stroke();x.textAlign='center';x.fillStyle=r.ok?'#8ae08a':'#ffd040';x.font='bold 30px Georgia';x.fillText(r.ok?'Mission complete!':'Mission over',450,175);
  crew(450,245,1.4);x.fillStyle='#fff';x.font='bold 22px Georgia';x.fillText('💛 '+r.saved+' saved   🪙 +'+r.cred,450,310);x.fillStyle='#ffe9c7';x.font='15px Georgia';wrapT(r.note,450,340,440,20);x.fillStyle='#ffb0a0';x.font='13px Georgia';x.fillText('Total lives saved: '+S.lives,450,392);
  button('again',260,402,170,38,'🔁 Again',()=>{G.brief=MISSIONS.find(m=>m.id===r.id);go()},{fs:15});button('hq',470,402,170,38,'🏠 HQ',()=>G.state='hq',{fs:15,ac:ORANGE})}
 for(const p of parts){x.globalAlpha=Math.max(0,p.l);emo(p.e,p.x,p.y,22)}x.globalAlpha=1;x.textAlign='left';
 if(DEMO()&&G.state==='hq'){x.fillStyle='#ffd040';x.font='12px Georgia';x.textAlign='center';x.fillText('Free demo: 3 missions · full game unlocks all 6 + upgrades',W/2,H-8);x.textAlign='left'}}
window.RS={G,S,MK,startMission,go,finish,buy};
startLoop();
