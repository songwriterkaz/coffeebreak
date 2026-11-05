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
// ---- Coffeebreak Free Treats ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const GOOD=[['🍩',10],['🧁',15],['🍡',20],['☕',10],['🍬',5],['🍭',10],['🍪',10]],BAD=['🍞','🥦','💣'],PW=[['🧲','magnet'],['✖️2','double'],['⏳','slow'],['💖','life']];
const G={state:'title',score:0,level:1,lives:3,best:+localStorage.ftBest||0,combo:0,caught:0,need:0,pw:{magnet:0,double:0,slow:0},msg:'',msgT:0};window.G=G;
let items=[],parts=[],pops=[],bx=W/2,tx=W/2,spawnT=0,t=0,shake=0;const BTN={};
function newGame(){Object.assign(G,{score:0,level:1,lives:3,combo:0});startLevel()}
function startLevel(){G.caught=0;G.need=12+G.level*6;items=[];G.pw={magnet:0,double:0,slow:0};G.state='play'}
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
c.addEventListener('mousemove',e=>{tx=pos(e).x});c.addEventListener('touchmove',e=>{e.preventDefault();tx=pos(e).x},{passive:false});
function down(e){e.preventDefault();startMusic();const p=pos(e);tx=p.x;for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}}
c.addEventListener('mousedown',down);c.addEventListener('touchstart',down,{passive:false});
const keys={};addEventListener('keydown',e=>{keys[e.key]=1;if(e.key===' '&&G.state==='play')G.state='pause';else if(e.key===' '&&G.state==='pause')G.state='play'});addEventListener('keyup',e=>keys[e.key]=0);
function spd(){return 140+G.level*28}
function spawn(){const r=Math.random(),L=G.level;let it;
 if(r<.06+L*.002)it={k:'pw',p:PW[Math.random()*(G.lives<3?4:3)|0]};else if(r<.2+Math.min(.2,L*.025))it={k:'bad',e:BAD[Math.random()*BAD.length|0]};else{const g=GOOD[Math.random()*GOOD.length|0];it={k:'good',e:g[0],v:g[1]}}
 it.x=40+Math.random()*(W-80);it.y=-30;it.vy=spd()*(.8+Math.random()*.5);it.r=0;it.vr=(Math.random()-.5)*3;items.push(it)}
function msg(s){G.msg=s;G.msgT=1.4}
function burst(x,y,col,n=12){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=60+Math.random()*180;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,l:.8,col})}}
function catchIt(it){if(it.k==='good'){G.combo++;const m=Math.min(5,1+(G.combo/5|0))*(G.pw.double>0?2:1),p=it.v*m;G.score+=p;G.caught++;pops.push({x:it.x,y:it.y,s:'+'+p+(m>1?' x'+m:''),l:1});burst(it.x,it.y,'#f6c6d2',8);if(G.combo%10===0)msg('🔥 '+G.combo+' combo!')}
 else if(it.k==='pw'){const k=it.p[1];if(k==='life'){G.lives=Math.min(5,G.lives+1);msg('💖 Extra life!')}else{G.pw[k]=8;msg({magnet:'🧲 Treat magnet!',double:'✖️2 Double points!',slow:'⏳ Slow time!'}[k])}burst(it.x,it.y,'#ffcf6a',16)}
 else{G.combo=0;shake=.4;burst(it.x,it.y,it.e==='💣'?'#ff7a3a':'#7a5a3a',it.e==='💣'?30:12);G.lives-=it.e==='💣'?2:1;msg(it.e==='💣'?'💥 BOOM!':it.e==='🥦'?'🥦 Yuck, broccoli!':'🍞 Burnt toast!');if(G.lives<=0)over()}
 if(G.state==='play'&&G.caught>=G.need)levelUp()}
function over(){G.state='over';if(G.score>G.best){G.best=G.score;localStorage.ftBest=G.best}}
function levelUp(){if(G.score>G.best){G.best=G.score;localStorage.ftBest=G.best}
 if(window.DEMO&&G.level>=2){G.state='demo';items=[];setTimeout(()=>window.demoEnd&&demoEnd('You finished the free demo of <b>Coffeebreak Free Treats</b>! Endless levels, faster treats and every power-up are in the full game.'),800);return}
 G.state='levelup';items=[]}
function update(dt){t+=dt;if(G.msgT>0)G.msgT-=dt;shake=Math.max(0,shake-dt);
 parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);pops.forEach(p=>{p.y-=50*dt;p.l-=dt});pops=pops.filter(p=>p.l>0);
 if(G.state!=='play')return;const sd=G.pw.slow>0?dt*.45:dt;for(const k in G.pw)G.pw[k]=Math.max(0,G.pw[k]-dt);
 if(keys.ArrowLeft||keys.a)tx-=600*dt;if(keys.ArrowRight||keys.d)tx+=600*dt;tx=Math.max(60,Math.min(W-60,tx));bx+=(tx-bx)*Math.min(1,dt*14);
 spawnT-=sd;if(spawnT<=0){spawn();spawnT=Math.max(.28,.9-G.level*.06)*(.7+Math.random()*.6)}
 for(const it of items){it.y+=it.vy*sd;it.r+=it.vr*sd;if(G.pw.magnet>0&&it.k==='good'&&it.y>200){it.x+=(bx-it.x)*Math.min(1,dt*4)}
  if(!it.dead&&it.y>500&&it.y<545&&Math.abs(it.x-bx)<62){it.dead=1;catchIt(it)}
  if(!it.dead&&it.y>H+30){it.dead=1;if(it.k==='good')G.combo=0}}
 items=items.filter(i=>!i.dead)}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn){BTN[id]={x:X,y:Y,w,h,fn};x.fillStyle='#3a1424';rr(X,Y,w,h,12);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke();x.fillStyle='#ffe9c7';x.font='bold 20px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic'}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}}
function draw(){x.save();if(shake)x.translate((Math.random()-.5)*12*shake,(Math.random()-.5)*12*shake);
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a1830');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(-10,-10,W+20,H+20);
 for(let i=0;i<20;i++){x.fillStyle='rgba(246,198,210,.08)';x.beginPath();x.arc((i*137+t*8)%W,(i*71)%H,3+i%4,0,7);x.fill()}
 x.fillStyle='#2a1018';x.fillRect(0,560,W,40);for(let i=0;i<W;i+=50)rose(i+25,566,1.2);
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 54px Georgia';x.fillText('🍩 Free Treats! 🧁',W/2,120);x.fillStyle='#ffe9c7';x.font='20px Georgia';
  x.fillText('Move the basket (mouse, touch or ← →) to catch the falling treats.',W/2,170);x.fillText('Dodge 🍞 burnt toast, 🥦 broccoli and 💣 bombs! Grab 🧲 ✖️2 ⏳ 💖 power-ups.',W/2,200);
  if(hero.complete&&hero.naturalWidth)x.drawImage(hero,W/2-80,225,160,160*hero.naturalHeight/hero.naturalWidth);button('play',W/2-100,430,200,56,'▶ Play',newGame);x.fillStyle='#ffcf6a';x.font='16px Georgia';x.fillText('Best: '+G.best,W/2,515);x.restore();return}
 x.textAlign='center';x.textBaseline='middle';for(const it of items){x.save();x.translate(it.x,it.y);x.rotate(it.r);x.font='40px serif';
  if(it.k==='pw'){x.fillStyle='rgba(255,207,106,.35)';x.beginPath();x.arc(0,0,28+Math.sin(t*8)*3,0,7);x.fill();x.font=it.p[0].length>2?'bold 22px serif':'34px serif';x.fillStyle='#fff'}
  x.fillText(it.k==='pw'?it.p[0]:it.e,0,0);if(it.e==='🍞'){x.fillStyle='rgba(30,10,0,.55)';x.beginPath();x.arc(0,0,16,0,7);x.fill()}x.restore()}x.textBaseline='alphabetic';
 // basket + mascot
 if(hero.complete&&hero.naturalWidth){const h=90;x.drawImage(hero,bx-40,440,h*hero.naturalWidth/hero.naturalHeight*.9,h*.9)}
 x.fillStyle='#8a5a3a';x.beginPath();x.moveTo(bx-62,505);x.lineTo(bx+62,505);x.lineTo(bx+48,550);x.lineTo(bx-48,550);x.fill();x.strokeStyle='#5a3a20';x.lineWidth=2;for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(bx+i*16,507);x.lineTo(bx+i*13,548);x.stroke()}
 x.fillStyle='#f6c6d2';x.fillRect(bx-64,500,128,8);if(G.pw.magnet>0){x.strokeStyle='rgba(255,207,106,.5)';x.lineWidth=3;x.beginPath();x.arc(bx,520,90+Math.sin(t*10)*6,3.4,6);x.stroke()}
 parts.forEach(p=>{x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.col;x.fillRect(p.x-2,p.y-2,4,4)});x.globalAlpha=1;
 pops.forEach(p=>{x.globalAlpha=Math.min(1,p.l);x.fillStyle='#ffcf6a';x.font='bold 18px Georgia';x.textAlign='center';x.fillText(p.s,p.x,p.y)});x.globalAlpha=1;
 x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText('Level '+G.level+'   Score '+G.score+'   '+'💖'.repeat(Math.max(0,G.lives)),14,28);
 x.font='15px Georgia';x.fillText('Treats '+G.caught+' / '+G.need+(G.combo>1?'   Combo '+G.combo:''),14,50);x.fillStyle='#3a1424';rr(14,58,200,8,4);x.fill();x.fillStyle='#f6c6d2';rr(14,58,200*Math.min(1,G.caught/G.need),8,4);x.fill();
 let py=86;for(const [k,l] of [['magnet','🧲 Magnet'],['double','✖️2 Double'],['slow','⏳ Slow']])if(G.pw[k]>0){x.fillStyle='#ffcf6a';x.fillText(l+' '+Math.ceil(G.pw[k])+'s',14,py);py+=20}
 if(G.pw.slow>0){x.fillStyle='rgba(122,176,200,.1)';x.fillRect(0,0,W,H)}
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='#ffcf6a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText(G.msg,W/2,130);x.globalAlpha=1}
 const ov=(a,b)=>{x.fillStyle='rgba(18,6,12,.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 44px Georgia';x.fillText(a,W/2,220);x.fillStyle='#ffe9c7';x.font='22px Georgia';x.fillText(b,W/2,270)};
 if(G.state==='levelup'){ov('Level '+G.level+' complete! 🎉','Score '+G.score+' · Next: faster treats and more baddies');button('next',W/2-110,320,220,56,'▶ Level '+(G.level+1),()=>{G.level++;startLevel()})}
 if(G.state==='pause'){ov('Paused','Press space to carry on');}
 if(G.state==='over'){ov('Game over!','Score '+G.score+'  ·  Level '+G.level+'  ·  Best '+G.best);button('again',W/2-100,320,200,52,'↻ Play again',newGame)}
 x.restore()}
let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
