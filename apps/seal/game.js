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
// ---- Coffeebreak Seal ----
const DEMO=()=>!!window.DEMO,SURF=150;
const COS=[['none','No hat',0,''],['crown','Rose flower crown',30,'🌹'],['beanie','Tiny beanie',45,'🧢'],['bow','Gothic bow',60,'🎀'],['skull','Skull clip',80,'💀']];
const S={own:JSON.parse(localStorage.sealOwn||'["none"]'),wear:localStorage.sealWear||'none',coins:+localStorage.sealCoins||0};
const G={state:'title',score:0,level:1,lives:3,seal:{x:300,y:300,vx:0,vy:0,face:1},tgt:{x:300,y:300},ents:[],stack:[],combo:1,spawn:0,drop:0,pops:[],bub:[],hurt:0};window.G=G;
function save(){localStorage.sealOwn=JSON.stringify(S.own);localStorage.sealWear=S.wear;localStorage.sealCoins=S.coins}
function start(){startMusic();Object.assign(G,{state:'play',score:0,level:1,lives:3,ents:[],stack:[],combo:1,spawn:0,drop:2,pops:[],hurt:0,fishN:0});G.seal={x:300,y:300,vx:0,vy:0,face:1}}
function pop(s,X,Y,c){G.pops.push({s,x:X,y:Y,l:1,c:c||'#fff3d6'})}
bindInput({down(p){G.tgt=p},move(p){G.tgt=p}});
function spawn(){const L=G.level,r=Math.random(),dir=Math.random()<.5?1:-1,X=dir>0?-40:W+40,Y=SURF+40+Math.random()*(H-SURF-80);
 if(r<.55)G.ents.push({k:'fish',e:['🐟','🐠','🐡'][Math.random()*3|0],x:X,y:Y,vx:dir*(70+L*12+Math.random()*50),r:18});
 else if(r<.55+Math.min(.3,.12+L*.03))G.ents.push({k:'shark',e:'🦈',x:X,y:Y,vx:dir*(90+L*15),r:30});
 else G.ents.push({k:'junk',e:['🥫','🛍️','🥤','🧴'][Math.random()*4|0],x:Math.random()*(W-100)+50,y:SURF,vx:0,vy:30+L*6,r:16,sink:1})}
function hit(){if(G.hurt>0)return;G.lives--;G.hurt=1.5;G.stack=[];G.combo=1;pop('Ouch!',G.seal.x,G.seal.y-40,'#ff7a8a');if(G.lives<=0){G.state='over';S.coins+=Math.floor(G.score/20);save()}}
function update(dt){G.pops.forEach(p=>{p.l-=dt;p.y-=30*dt});G.pops=G.pops.filter(p=>p.l>0);if(G.state!=='play')return;
 const s=G.seal,ax=(G.tgt.x-s.x),ay=(G.tgt.y-s.y);s.vx+=(ax*4-s.vx*2.2)*dt;s.vy+=(ay*4-s.vy*2.2)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.x=Math.max(30,Math.min(W-30,s.x));s.y=Math.max(SURF-10,Math.min(H-30,s.y));if(Math.abs(s.vx)>15)s.face=s.vx>0?1:-1;
 if(G.hurt>0)G.hurt-=dt;
 // balancing: stack falls if seal goes underwater or moves too fast
 if(G.stack.length&&(s.y>SURF+30||Math.abs(s.vx)>420)){pop('Dropped it! 💦',s.x,s.y-60,'#9ad8ff');G.stack=[];G.combo=1}
 if(G.stack.length){G.score+=dt*5*G.stack.length*G.combo;}
 G.spawn-=dt;if(G.spawn<=0){spawn();G.spawn=Math.max(.35,1.3-G.level*.09)}
 G.drop-=dt;if(G.drop<=0){G.ents.push({k:Math.random()<.4?'ball':'cup',e:Math.random()<.4?'⚽':'☕',x:80+Math.random()*(W-160),y:-20,vx:0,vy:90+G.level*8,r:16,air:1});G.drop=3.5+Math.random()*2}
 for(const e of G.ents){e.x+=e.vx*dt;if(e.vy)e.y+=e.vy*dt;
  if(e.air){const ny=s.y-34-G.stack.length*26;if(Math.abs(e.x-s.x)<34&&Math.abs(e.y-ny)<20&&s.y<SURF+30){e.dead=1;G.stack.push(e.e);G.combo=Math.min(8,G.stack.length+1);G.score+=25*G.combo;pop('Balanced! x'+G.combo,s.x,ny-30,'#ffcf6a')}else if(e.y>SURF+10){e.dead=1;pop('splash',e.x,SURF,'#9ad8ff')}continue}
  const d=Math.hypot(e.x-s.x,e.y-s.y);if(d<e.r+26){if(e.k==='fish'){e.dead=1;G.score+=10*G.combo;G.fishN++;pop('+'+10*G.combo,e.x,e.y,'#7fff9a')}else{e.dead=1;hit()}}
  if(e.x<-80||e.x>W+80||e.y>H+30)e.dead=1}
 G.ents=G.ents.filter(e=>!e.dead);
 const nl=1+Math.floor(G.score/400);if(nl>G.level){G.level=nl;pop('Level '+nl+'!',W/2,250,'#ffcf6a');if(DEMO()&&nl>3){G.state='demo';S.coins+=Math.floor(G.score/20);save();demoEnd('You reached level 3 in the free demo of <b>Coffeebreak Seal</b>! Endless levels, every cosmetic and all the songs are in the full game.')}}
 if(Math.random()<dt*3)G.bub.push({x:s.x+s.face*30,y:s.y,l:2});G.bub.forEach(b=>{b.y-=40*dt;b.l-=dt});G.bub=G.bub.filter(b=>b.l>0&&b.y>SURF)}
function sealDraw(X,Y,f,sc=1){x.save();x.translate(X,Y);x.scale(f*sc,sc);x.fillStyle='#8f9bb0';x.beginPath();x.ellipse(-8,4,44,24,0,0,7);x.fill();x.beginPath();x.moveTo(-48,4);x.lineTo(-70,-10);x.lineTo(-66,22);x.fill();
 x.fillStyle='#a9b4c8';x.beginPath();x.arc(26,-12,22,0,7);x.fill();x.fillStyle='#d6dde8';x.beginPath();x.ellipse(-6,14,30,10,0,0,7);x.fill();
 x.fillStyle='#12060c';x.beginPath();x.arc(20,-16,5,0,7);x.arc(36,-16,5,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(21.5,-18,1.8,0,7);x.arc(37.5,-18,1.8,0,7);x.fill();
 x.fillStyle='#ff9ab0';x.globalAlpha=.6;x.beginPath();x.arc(14,-6,4,0,7);x.arc(42,-6,4,0,7);x.fill();x.globalAlpha=1;x.fillStyle='#3a2a2a';x.beginPath();x.arc(30,-6,3,0,7);x.fill();
 x.fillStyle='#7a869a';x.beginPath();x.ellipse(2,22,14,6,.5,0,7);x.fill();x.restore();
 const c=COS.find(q=>q[0]===S.wear);if(c&&c[3]){emo(c[3],X+f*30*sc,Y-36*sc,26*sc)}}
function bg(){const g=x.createLinearGradient(0,0,0,SURF);g.addColorStop(0,'#2a1036');g.addColorStop(1,'#e88aa8');x.fillStyle=g;x.fillRect(0,0,W,SURF);
 const w=x.createLinearGradient(0,SURF,0,H);w.addColorStop(0,'#2a6a9a');w.addColorStop(1,'#0a1a3a');x.fillStyle=w;x.fillRect(0,SURF,W,H-SURF);
 x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=2;x.beginPath();for(let i=0;i<=W;i+=8)x.lineTo(i,SURF+Math.sin(i/30+t*2)*3);x.stroke();x.fillStyle='#d8c890';x.fillRect(0,H-18,W,18);for(let i=40;i<W;i+=140)emo('🌿',i,H-34,30)}
function draw(){bg();
 if(G.state==='title'||G.state==='shop'){sealDraw(W/2,SURF+120,1,2);x.textAlign='center';x.fillStyle='#ffe9ef';x.font='bold 50px Georgia';x.fillText('🦭 Coffeebreak Seal',W/2,80);
  if(G.state==='title'){x.font='17px Georgia';x.fillText('Swim with your mouse or finger. Catch fish, dodge sharks 🦈 and rubbish.',W/2,400);x.fillText('Pop up to the surface to balance balls ⚽ and coffee cups ☕ on your nose for combos!',W/2,426);
   button('p',W/2-200,460,190,52,'▶ Play',start);button('s',W/2+10,460,190,52,'🎀 Wardrobe',()=>G.state='shop');x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('🐟 Fish coins: '+S.coins,W/2,540);return}
  x.fillStyle='rgba(18,8,20,.8)';rr(120,360,660,200,14);x.fill();x.fillStyle='#ffcf6a';x.font='16px Georgia';x.fillText('🐟 Fish coins: '+S.coins+'   (you earn 1 coin per 20 points)',W/2,385);
  COS.forEach((q,i)=>{const own=S.own.includes(q[0]),X=135+i*128;const lock=DEMO()&&i>1;button('c'+i,X,400,118,70,(q[3]||'—')+' '+(own?(S.wear===q[0]?'✓':''):q[2]+'🐟'),()=>{if(lock)return;if(own){S.wear=q[0]}else if(S.coins>=q[2]){S.coins-=q[2];S.own.push(q[0]);S.wear=q[0]}save()},{sel:S.wear===q[0],dis:lock||(!own&&S.coins<q[2]),fs:17});x.fillStyle='#fff3d6';x.font='11px Georgia';x.textAlign='center';x.fillText(q[1]+(lock?' (full game)':''),X+59,488)});
  button('b',W/2-80,505,160,42,'← Back',()=>G.state='title');return}
 for(const b of G.bub){x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1;x.beginPath();x.arc(b.x,b.y,3,0,7);x.stroke()}
 for(const e of G.ents){x.save();x.translate(e.x,e.y);if(e.vx<0&&!e.air)x.scale(-1,1);emo(e.e,0,0,e.k==='shark'?56:34);x.restore()}
 const s=G.seal;if(!(G.hurt>0&&Math.floor(t*10)%2))sealDraw(s.x,s.y,s.face);
 G.stack.forEach((e,i)=>emo(e,s.x+s.face*30+Math.sin(t*3+i)*3*(i+1),s.y-46-i*26,30));
 x.textAlign='left';x.fillStyle='#fff3d6';x.font='bold 18px Georgia';x.fillText('Score '+Math.floor(G.score)+'   Level '+G.level+'   '+'❤'.repeat(Math.max(0,G.lives))+'   Combo x'+G.combo,16,28);
 for(const p of G.pops){x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;x.font='bold 18px Georgia';x.textAlign='center';x.fillText(p.s,p.x,p.y);x.globalAlpha=1}
 if(G.state==='over'){x.fillStyle='rgba(10,10,30,.8)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffe9ef';x.font='bold 42px Georgia';x.fillText('Splash! Game over',W/2,220);x.font='20px Georgia';x.fillText('Score '+Math.floor(G.score)+' · '+G.fishN+' fish · level '+G.level,W/2,262);x.fillText('🐟 Coins: '+S.coins,W/2,292);
  button('a',W/2-200,330,190,52,'↻ Again',start);button('w',W/2+10,330,190,52,'🎀 Wardrobe',()=>G.state='shop')}}
startLoop();
