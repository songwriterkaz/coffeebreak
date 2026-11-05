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
// ---- Coffeebreak Crystal Ball ----
const W=900,H=600,BX=450,BY=318,BR=128;window.HERO_SRC='assets/hero.png';
const ANS=[['It is certain.','yes'],['The stars say yes.','yes'],['Without a doubt.','yes'],['Yes, and sooner than you think.','yes'],['All signs point to yes.','yes'],['The roses bloom for you: yes.','yes'],['Yes, but be patient.','yes'],['Most definitely.','yes'],['The spirits nod: yes.','yes'],['Absolutely, darling.','yes'],['Your wish is on its way.','yes'],['The answer glows bright: yes!','yes'],
 ['The mist is thick. Ask again later.','maybe'],['Not yet, but soon.','maybe'],['Perhaps, if you take the first step.','maybe'],['The future is still swirling.','maybe'],['Only you can decide this one.','maybe'],['Concentrate and ask again.','maybe'],['It depends on a choice you have not made yet.','maybe'],['The moon must turn once more.','maybe'],['Something hidden must be revealed first.','maybe'],['Listen to your heart, it already knows.','maybe'],
 ['The spirits say no.','no'],['Not this time.','no'],['My visions say no, and that is for the best.','no'],['Do not count on it.','no'],['The skull shakes its head.','no'],['A better path is waiting instead.','no'],['No, but something sweeter is coming.','no'],['The cards are against it… for now.','no']];
const V1=['a black cat','a red rose','a golden key','a silver moon','a tiny marshmallow','a steaming coffee cup','an old letter','a dancing skeleton','a glowing star','a velvet door','a white dove','a candle','a treasure chest','a heart-shaped locket','a winding staircase','a music box'],
 V2=['opening slowly','floating upward','glowing pink','spinning in the mist','surrounded by butterflies','beside a stranger with kind eyes','under a full moon','covered in petals','in a sunny café','on a long road','near the sea','in a garden at midnight','beside a ringing phone','in a crowd of cheering people'],
 V3=['A happy surprise is coming.','Money energy flows toward you.','A friend will bring good news.','Your creativity will be noticed.','A new door opens this month.','Love is closer than it seems.','An old worry fades away.','Someone is thinking of you.','A journey will change everything.','Luck follows your next brave step.','Your songs will reach new ears.','Rest now, and magic follows.'];
const VE={'a black cat':'🐈‍⬛','a red rose':'🌹','a golden key':'🗝️','a silver moon':'🌙','a tiny marshmallow':'🍡','a steaming coffee cup':'☕','an old letter':'💌','a dancing skeleton':'💀','a glowing star':'⭐','a velvet door':'🚪','a white dove':'🕊️','a candle':'🕯️','a treasure chest':'💰','a heart-shaped locket':'💖','a winding staircase':'🌀','a music box':'🎶'};
const G={state:'idle',score:0,level:+localStorage.cbAsked||0,q:'',clear:0,ans:null,vis:null,emo:null,swirl:0,blink:0,said:'Ask me anything, sweet soul…'};window.G=G;
let fog=[],t=0,drag=null,spark=[];for(let i=0;i<70;i++)fog.push({a:Math.random()*6.3,r:Math.random()*BR*.9,s:.2+Math.random()*.5,z:18+Math.random()*30,h:Math.random()});
function today(){return new Date().toDateString()}
function demoLeft(){const d=JSON.parse(localStorage.cbDemoQ||'{}');return d.d===today()?3-d.n:3}
function ask(){startMusic();const q=$('q').value.trim();if(!q){G.said='Type your question first, my dear…';return}
 if(window.DEMO&&demoLeft()<=0){demoEnd('The crystal ball rests after 3 questions a day in the free demo. Unlimited questions, every vision and fortune are in the full game.');return}
 if(window.DEMO){const d=JSON.parse(localStorage.cbDemoQ||'{}');localStorage.cbDemoQ=JSON.stringify({d:today(),n:(d.d===today()?d.n:0)+1})}
 G.q=q;G.clear=0;G.ans=ANS[Math.random()*ANS.length|0];const a=V1[Math.random()*V1.length|0];G.vis='I see '+a+' '+V2[Math.random()*V2.length|0]+'. '+V3[Math.random()*V3.length|0];G.emo=VE[a];G.state='play';G.said='Now swirl the mist… drag your finger around the ball.';
 fog.forEach(f=>{f.al=1})}
$('askb').onclick=ask;$('q').addEventListener('keydown',e=>{if(e.key==='Enter')ask();e.stopPropagation()});
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function dn(e){const p=pos(e);if(Math.hypot(p.x-BX,p.y-BY)<BR+30){e.preventDefault();drag=p;startMusic();if(G.state==='idle')G.said='First type your question above, then swirl…'}}
function mv(e){if(!drag)return;e.preventDefault();const p=pos(e);const a0=Math.atan2(drag.y-BY,drag.x-BX),a1=Math.atan2(p.y-BY,p.x-BX);let da=a1-a0;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;
 const d=Math.hypot(p.x-drag.x,p.y-drag.y);G.swirl+=da*3;if(G.state==='play'){G.clear=Math.min(1,G.clear+d/2600);if(G.clear>=1)reveal()}for(let i=0;i<2;i++)spark.push({x:p.x,y:p.y,l:.6,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60});drag=p}
function upE(){drag=null}
c.addEventListener('mousedown',dn);addEventListener('mousemove',mv);addEventListener('mouseup',upE);c.addEventListener('touchstart',dn,{passive:false});addEventListener('touchmove',mv,{passive:false});addEventListener('touchend',upE);
function reveal(){G.state='over';G.score=G.ans[1]==='yes'?3:G.ans[1]==='maybe'?2:1;G.level=+localStorage.cbAsked+1||1;localStorage.cbAsked=G.level;
 const H2=JSON.parse(localStorage.cbHist||'[]');H2.unshift({q:G.q,a:G.ans[0],v:G.vis});localStorage.cbHist=JSON.stringify(H2.slice(0,30));
 G.said=['The mist parts…','Ahh, there it is…','The spirits have spoken.','Look deep, darling…'][Math.random()*4|0]+(window.DEMO?' ('+demoLeft()+' questions left today)':'');$('q').value=''}
function update(dt){t+=dt;G.swirl*=Math.pow(.25,dt);const base=.3+Math.abs(G.swirl);fog.forEach(f=>{f.a+=dt*(f.s*.6+G.swirl*.35);f.r+=Math.sin(t*f.s+f.h*9)*dt*6;f.r=Math.max(5,Math.min(BR*.92,f.r))});
 if(G.state==='play')G.clear=Math.max(0,G.clear-dt*.02);spark.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt});spark=spark.filter(s=>s.l>0);G.blink=(t%4)<.15}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function wrapC(s,X,Y,mw,lh){const w=s.split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l,X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l,X,Y);return Y+lh}
function teller(){// veil & hood
 x.fillStyle='#2a1038';x.beginPath();x.moveTo(BX-220,H);x.quadraticCurveTo(BX-210,90,BX,60);x.quadraticCurveTo(BX+210,90,BX+220,H);x.fill();
 x.fillStyle='#3a1a4a';x.beginPath();x.moveTo(BX-140,260);x.quadraticCurveTo(BX-130,70,BX,62);x.quadraticCurveTo(BX+130,70,BX+140,260);x.quadraticCurveTo(BX,200,BX-140,260);x.fill();
 x.fillStyle='#f6d6dc';x.beginPath();x.ellipse(BX,150,62,72,0,0,7);x.fill();
 x.fillStyle='#1a0820';x.beginPath();x.moveTo(BX-70,120);x.quadraticCurveTo(BX,40,BX+70,120);x.quadraticCurveTo(BX,95,BX-70,120);x.fill();
 for(const ex of [-24,24]){if(G.blink){x.strokeStyle='#2a0e1c';x.lineWidth=3;x.beginPath();x.moveTo(BX+ex-12,150);x.lineTo(BX+ex+12,150);x.stroke()}else{x.fillStyle='#fff';x.beginPath();x.ellipse(BX+ex,148,12,14,0,0,7);x.fill();x.fillStyle='#6a3a9a';x.beginPath();x.arc(BX+ex,151,8,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(BX+ex-3,147,3,0,7);x.fill()}
  x.strokeStyle='#2a0e1c';x.lineWidth=2;x.beginPath();x.moveTo(BX+ex-14,134);x.lineTo(BX+ex+12,130+(ex<0?2:-2));x.stroke()}
 x.fillStyle='rgba(255,120,150,.5)';x.beginPath();x.ellipse(BX-38,172,9,5,0,0,7);x.ellipse(BX+38,172,9,5,0,0,7);x.fill();
 x.fillStyle='#8a1030';x.beginPath();x.arc(BX,182,8,0,3.14);x.fill();x.fillStyle='#ffcf6a';x.beginPath();x.arc(BX,105,7,0,7);x.fill();x.fillStyle='#8a5ab0';x.beginPath();x.arc(BX,105,4,0,7);x.fill();
 [[-58,96],[60,100]].forEach(([dx,dy])=>{x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(BX+dx+Math.cos(i*1.26)*5,dy+Math.sin(i*1.26)*5,5.5,0,7);x.fill()}});
 x.fillStyle='#ffcf6a';[[-40,202],[0,212],[40,202]].forEach(([dx,dy])=>{x.beginPath();x.arc(BX+dx,dy,4,0,7);x.fill()})}
function draw(){const g=x.createRadialGradient(BX,BY,50,BX,BY,650);g.addColorStop(0,'#3a1a4a');g.addColorStop(1,'#0a0410');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){const a=.3+.7*Math.abs(Math.sin(t+i));x.fillStyle='rgba(255,233,239,'+a*.5+')';x.fillRect((i*97)%W,(i*53)%220,2,2)}
 teller();
 // table & stand
 x.fillStyle='#1a0a14';x.fillRect(0,470,W,130);x.fillStyle='#4a1a3a';x.beginPath();x.ellipse(BX,470,420,26,0,0,7);x.fill();
 x.fillStyle='#c8a040';x.beginPath();x.moveTo(BX-80,478);x.lineTo(BX+80,478);x.lineTo(BX+56,BY+BR-12);x.lineTo(BX-56,BY+BR-12);x.fill();x.fillStyle='#8a6a20';x.fillRect(BX-90,474,180,10);
 for(const sx of [-1,1]){x.fillStyle='#f6d6dc';x.beginPath();x.ellipse(BX+sx*(BR+6),BY+40,22,34,sx*.4,0,7);x.fill()}
 // ball
 const glow=x.createRadialGradient(BX,BY,BR*.6,BX,BY,BR*1.5);glow.addColorStop(0,'rgba(200,140,255,.35)');glow.addColorStop(1,'rgba(200,140,255,0)');x.fillStyle=glow;x.beginPath();x.arc(BX,BY,BR*1.5,0,7);x.fill();
 x.save();x.beginPath();x.arc(BX,BY,BR,0,7);x.clip();const bg=x.createRadialGradient(BX-40,BY-50,10,BX,BY,BR);bg.addColorStop(0,'#c8b4f0');bg.addColorStop(.6,'#6a4a9a');bg.addColorStop(1,'#2a1040');x.fillStyle=bg;x.fillRect(BX-BR,BY-BR,BR*2,BR*2);
 if(G.state==='over'||G.clear>.3){const a=G.state==='over'?1:(G.clear-.3)/.7;x.globalAlpha=a;x.font='70px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(G.emo||'✨',BX,BY-32+Math.sin(t*2)*4);
  x.fillStyle='#fff';x.font='bold 20px Georgia';x.shadowColor='#e8a0ff';x.shadowBlur=12;wrapC(G.ans?G.ans[0]:'',BX,BY+38,BR*1.6,24);x.shadowBlur=0;x.textBaseline='alphabetic';x.globalAlpha=1}
 const fa=G.state==='over'?.08:1-G.clear*.9;fog.forEach(f=>{const fx=BX+Math.cos(f.a)*f.r,fy=BY+Math.sin(f.a)*f.r*.8;const fg=x.createRadialGradient(fx,fy,1,fx,fy,f.z);fg.addColorStop(0,'rgba(255,240,255,'+(.35*fa)+')');fg.addColorStop(1,'rgba(255,240,255,0)');x.fillStyle=fg;x.beginPath();x.arc(fx,fy,f.z,0,7);x.fill()});
 x.restore();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(BX-50,BY-62,30,16,-.6,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=2;x.beginPath();x.arc(BX,BY,BR,0,7);x.stroke();
 spark.forEach(s=>{x.globalAlpha=s.l;x.fillStyle='#ffcf6a';x.fillRect(s.x-2,s.y-2,4,4)});x.globalAlpha=1;
 // speech + text
 x.textAlign='center';x.fillStyle='rgba(26,8,32,.8)';rr(BX-300,10,600,38,14);x.fill();x.fillStyle='#ffe9ef';x.font='italic 18px Georgia';x.fillText('🔮 '+G.said,BX,35);
 if(G.state==='play'){x.fillStyle='#3a1a4a';rr(BX-120,494,240,10,5);x.fill();x.fillStyle='#e8a0ff';rr(BX-120,494,240*G.clear,10,5);x.fill();x.fillStyle='#ffe9ef';x.font='14px Georgia';x.fillText('“'+G.q.slice(0,70)+'”  ·  swirl to clear the mist',BX,526)}
 if(G.state==='over'){x.fillStyle='#ffe9ef';x.font='italic 17px Georgia';x.fillText('“'+G.q.slice(0,80)+'”',BX,505);x.fillStyle='#ffcf6a';x.font='bold 17px Georgia';wrapC('🌙 Vision: '+G.vis,BX,532,760,22)}
 x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.fillText('For entertainment only.',BX,592)}
let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
