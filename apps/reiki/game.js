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
// ===== Coffeebreak Reiki Healing Session =====
const DEMO=()=>!!window.DEMO;
const CH=[['Root','Muladhara','#e8283a',470,'I am safe, grounded and supported.'],['Sacral','Svadhisthana','#f0801a',420,'I welcome joy, creativity and flow.'],['Solar Plexus','Manipura','#f8d020',372,'I am confident and I trust myself.'],['Heart','Anahata','#3ac060',318,'I give and receive love freely.'],['Throat','Vishuddha','#30a8e8',262,'I speak my truth with kindness.'],['Third Eye','Ajna','#5a50d8',205,'I trust my inner wisdom.'],['Crown','Sahasrara','#b060e0',160,'I am connected, peaceful and whole.']];
const SYM=[{n:'Power spiral',d:'A spiral to focus and strengthen energy (a calming visualisation shape).',p:(()=>{const a=[[450,170],[450,330],[450,170],[520,170]];for(let i=0;i<=40;i++){const th=i/40*Math.PI*4.2,r=60-i*1.35;a.push([450+Math.cos(-th)*r,250+Math.sin(-th)*r])}return a})()},
 {n:'Harmony wave',d:'A gentle flowing wave for emotional calm and balance.',p:Array.from({length:40},(_,i)=>[330+i*6,250+Math.sin(i/39*Math.PI*3)*60])},
 {n:'Heart bridge',d:'A heart shape to send kindness across distance.',p:Array.from({length:44},(_,i)=>{const th=i/43*Math.PI*2;return[450+16*Math.pow(Math.sin(th),3)*7,240-(13*Math.cos(th)-5*Math.cos(2*th)-2*Math.cos(3*th)-Math.cos(4*th))*7]})}];
const G={state:'menu',score:0,level:1,dur:5,el:0,idx:0,prog:0,hand:null,breath:0,sym:null,si:0,before:{},after:{},done:false};
const JK='reikiJournal';let J=[];try{J=JSON.parse(localStorage[JK])||[]}catch(e){}
const FEEL=['Calm','Energy','Stress','Mood'];
let parts=[],mouse={x:450,y:300,down:false};
function startSession(m){if(DEMO()&&m!==5)return demoEnd('The free demo includes the 5-minute session. Get the full app for 10 and 20 minute sessions, the full journal history and all 38 songs.');G.dur=m;G.el=0;G.idx=0;G.prog=0;G.symDone=0;G.state='before';G.before={};startMusic()}
function begin(){G.state='session';G.el=0}
function posTime(){return G.dur*60/7}
function bodyY(i){return CH[i][3]}
function update(dt){for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);
 if(G.state==='session'){G.el+=dt;G.breath+=dt;const ch=CH[G.idx];const near=mouse.down||G.hover;const d=Math.hypot(mouse.x-300,mouse.y-bodyY(G.idx));
  if(near&&d<55){G.prog+=dt/(posTime()*.6);G.channel=true;for(let k=0;k<3;k++)parts.push({x:300+Math.random()*40-20,y:bodyY(G.idx)+Math.random()*30-15,vx:Math.random()*60-30,vy:-30-Math.random()*50,l:1.5,c:ch[2]})}else G.channel=false;
  const auto=G.el>=(G.idx+1)*posTime();if(G.prog>=1||auto){G.idx++;G.prog=0;if(G.idx===3||G.idx===6){G.state='symbol';G.sym=SYM[G.symDone%3];G.si=0}if(G.idx>=7){G.state='after';G.after={}}}}
 G.score=J.length}
function drawBody(){x.fillStyle='rgba(255,230,240,.10)';x.beginPath();x.arc(300,110,42,0,7);x.fill();x.beginPath();x.moveTo(250,160);x.quadraticCurveTo(300,140,350,160);x.lineTo(370,330);x.lineTo(345,500);x.lineTo(255,500);x.lineTo(230,330);x.fill();x.fillRect(200,170,30,170);x.fillRect(370,170,30,170);x.fillRect(260,500,35,90);x.fillRect(305,500,35,90);
 CH.forEach((c,i)=>{const act=G.state==='session'&&i===G.idx,done=G.state!=='session'?1:i<G.idx;const r=act?20+Math.sin(t*3)*4+G.prog*10:14;const g=x.createRadialGradient(300,c[3],2,300,c[3],r*2.4);g.addColorStop(0,c[2]);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=done||act?1:.45;x.fillStyle=g;x.beginPath();x.arc(300,c[3],r*2.4,0,7);x.fill();x.fillStyle=c[2];x.beginPath();x.arc(300,c[3],r*.55,0,7);x.fill();x.globalAlpha=1})}
function bg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#160a24');g.addColorStop(1,'#2a0f2a');x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<40;i++){x.fillStyle='rgba(255,220,240,'+(.2+.2*Math.sin(t+i))+')';x.fillRect((i*137)%W,(i*71)%H,2,2)}}
function note(){x.fillStyle='#c8a8d8';x.font='italic 12px Georgia';x.textAlign='center';x.fillText('For relaxation only — not medical treatment. Please see a health professional for any health concern.',W/2,H-44);x.textAlign='left'}
function feelUI(o,title){x.textAlign='center';x.fillStyle='#ffe0f0';x.font='bold 26px Georgia';x.fillText(title,W/2,70);x.font='15px Georgia';x.fillText('Rate each from 1 (low) to 5 (high)',W/2,96);
 FEEL.forEach((f,i)=>{x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText(f,200,160+i*70);for(let v=1;v<=5;v++)button('f'+i+v,330+v*62,135+i*70,52,40,''+v,()=>o[f]=v,{sel:o[f]===v,ac:'#c890e0'})})}
function draw(){x.clearRect(0,0,W,H);bg();x.textAlign='left';
 if(G.state==='menu'){x.textAlign='center';x.fillStyle='#ffd0e8';x.font='bold 34px Georgia';x.fillText('🙌 Coffeebreak Reiki Healing Session',W/2,70);x.font='16px Georgia';x.fillStyle='#e8d0f0';x.fillText('A calm guided session: breathe, place your hands over each chakra, trace symbols, and journal.',W/2,100);
  drawBody();[5,10,20].forEach((m,i)=>button('d'+m,500,170+i*70,300,54,(DEMO()&&m!==5?'🔒 ':'')+m+' minute session',()=>startSession(m),{ac:'#c890e0'}));button('jr',500,390,300,46,'📔 Journal ('+J.length+')',()=>G.state='journal',{fs:16});skull(840,560,2);rose(60,560,2);note()}
 else if(G.state==='before'){feelUI(G.before,'Before your session: how do you feel?');button('go',330,440,240,52,'🕯 Begin session',begin,{ac:'#c890e0'});note()}
 else if(G.state==='session'){drawBody();for(const p of parts){x.globalAlpha=Math.max(0,p.l/1.5);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,3,0,7);x.fill()}x.globalAlpha=1;
  const c=CH[G.idx];const left=Math.max(0,G.dur*60-G.el);x.fillStyle='#ffe0f0';x.font='bold 22px Georgia';x.fillText('Position '+(G.idx+1)+'/7 · '+c[0]+' chakra',470,80);x.font='italic 15px Georgia';x.fillStyle='#e8d0f0';x.fillText('('+c[1]+')',470,102);
  x.font='16px Georgia';x.fillStyle='#fff';wrapT('Hold your hand (press and hold, or touch) gently over the glowing '+c[0].toLowerCase()+' chakra. Let warm light flow.',470,140,390,22);x.fillStyle=c[2];x.font='italic 18px Georgia';wrapT('“'+c[4]+'”',470,220,390,24);
  x.fillStyle='#111';rr(470,270,380,14,7);x.fill();x.fillStyle=c[2];rr(470,270,380*Math.min(1,G.prog),14,7);x.fill();x.fillStyle='#ccc';x.font='13px Georgia';x.fillText(G.channel?'✨ channelling energy…':'move your hand onto the chakra',470,302);
  const ph=(G.breath%12)/12,txt=ph<.33?'Breathe in…':ph<.5?'Hold…':ph<.83?'Breathe out…':'Rest…',br=ph<.33?ph/.33:ph<.5?1:ph<.83?1-(ph-.5)/.33:0;x.fillStyle='rgba(200,150,230,.25)';x.beginPath();x.arc(660,420,30+br*55,0,7);x.fill();x.strokeStyle='#e8c0f0';x.lineWidth=2;x.stroke();x.fillStyle='#fff';x.font='bold 17px Georgia';x.textAlign='center';x.fillText(txt,660,426);
  x.font='15px Georgia';x.fillText('⏱ '+Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')+' left',660,540);x.textAlign='left';note()}
 else if(G.state==='symbol'){const s=G.sym;x.fillStyle='#ffe0f0';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('Trace the symbol: '+s.n,W/2,60);x.font='15px Georgia';x.fillText(s.d+' Follow the dots in order.',W/2,86);
  x.strokeStyle='rgba(220,180,255,.35)';x.lineWidth=10;x.lineCap='round';x.beginPath();s.p.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();
  x.strokeStyle='#ffd0f0';x.lineWidth=6;x.shadowColor='#e0a0ff';x.shadowBlur=14;x.beginPath();s.p.slice(0,G.si+1).forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();x.shadowBlur=0;
  const n=s.p[G.si];if(n){x.fillStyle='#fff';x.beginPath();x.arc(n[0],n[1],9+Math.sin(t*5)*2,0,7);x.fill()}x.fillStyle='#ccc';x.fillText(Math.round(G.si/s.p.length*100)+'% traced',W/2,470);button('skip',380,500,140,36,'Skip',()=>{G.symDone++;G.state='session'},{fs:14});x.textAlign='left';note()}
 else if(G.state==='after'){feelUI(G.after,'After your session: how do you feel now?');button('sv',330,440,240,52,'📔 Save to journal',()=>{J.unshift({d:new Date().toLocaleString(),m:G.dur,b:G.before,a:G.after});J=J.slice(0,60);localStorage[JK]=JSON.stringify(J);G.state='journal'},{ac:'#c890e0'});note()}
 else if(G.state==='journal'){x.fillStyle='#ffe0f0';x.font='bold 28px Georgia';x.textAlign='center';x.fillText('📔 Reiki Journal',W/2,60);x.textAlign='left';x.font='14px Georgia';
  const L=DEMO()?J.slice(0,1):J.slice(0,8);if(!L.length){x.fillStyle='#ccc';x.fillText('No sessions yet.',350,140)}L.forEach((e,i)=>{x.fillStyle='rgba(255,255,255,.07)';rr(80,90+i*52,740,46,8);x.fill();x.fillStyle='#ffe9c7';x.fillText(e.d+' · '+e.m+' min',95,110+i*52);x.fillStyle='#d8c0e8';x.fillText(FEEL.map(f=>f+' '+(e.b[f]||'-')+'→'+(e.a[f]||'-')).join('   '),95,128+i*52)});
  if(DEMO()&&J.length>1){x.fillStyle='#ffcf6a';x.fillText('Full app keeps your whole journal history.',95,170)}button('bk',360,520,180,40,'🏠 Menu',()=>G.state='menu',{fs:16});note()}}
bindInput({down(p){mouse={...p,down:true}},move(p){mouse.x=p.x;mouse.y=p.y;if(G.state==='symbol'){const n=G.sym.p[G.si];if(n&&Math.hypot(p.x-n[0],p.y-n[1])<30){G.si++;if(G.si>=G.sym.p.length){G.symDone++;G.state='session';for(let i=0;i<40;i++)parts.push({x:450,y:250,vx:Math.random()*300-150,vy:Math.random()*300-150,l:1.5,c:'#ffd0f0'})}}}},up(){mouse.down=false}});
c.addEventListener('mousemove',()=>G.hover=true);c.addEventListener('mouseleave',()=>G.hover=false);
window.RK={G,CH,startSession,begin,get J(){return J}};startLoop();
