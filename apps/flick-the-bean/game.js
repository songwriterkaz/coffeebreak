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
// ---- Flick the Bean ----

const hero=new Image();hero.src='assets/hero.png';
const W=900,H=600,GR=650,AX=120,AY=470;
const SV=JSON.parse(localStorage.getItem('ftbSave')||'null');
const G={state:'title',level:1,score:0,best:+localStorage.ftbBest||0,coins:0,beans:0,combo:0,goal:0,lvScore:0,wind:0,
 up:{beans:0,guide:0,power:0},sp:{golden:1,decaf:1,espresso:1},sel:'normal',msg:'',msgT:0};window.G=G;
let bean=null,drag=null,targets=[],obs=[],parts=[],pops=[],slow=0,t=0;
function lvSetup(){const L=G.level;G.beans=6+G.up.beans*2+Math.min(4,L>>1);G.goal=60+L*40;G.lvScore=0;G.combo=0;G.wind=L<2?0:(Math.random()*2-1)*Math.min(260,40+L*25);
 targets=[];const n=Math.min(6,2+(L>>1));for(let i=0;i<n;i++){const k=['cup','cup','grinder','espresso'][(i+L)%4];
  targets.push({k,x:420+Math.random()*420,y:k==='cup'?440+Math.random()*80:160+Math.random()*220,vx:(k==='cup'?1:0)*(30+L*12)*(Math.random()<.5?-1:1),vy:k==='espresso'?(25+L*8):0,
   r:k==='grinder'?30:k==='espresso'?34:26,pts:k==='cup'?10:k==='grinder'?20:30,hp:k==='cup'?1:2,ph:Math.random()*6,hit:0})}
 obs=[];for(let i=0;i<Math.min(5,L-1);i++)obs.push({x:300+Math.random()*450,y:120+Math.random()*320,w:22+Math.random()*30,h:60+Math.random()*80,vy:L>4?40*(Math.random()<.5?-1:1):0});
 bean=null;drag=null;G.state='play'}
function newGame(){G.level=1;G.score=0;G.coins=0;G.up={beans:0,guide:0,power:0};G.sp={golden:1,decaf:1,espresso:1};G.sel='normal';lvSetup()}
function save(){localStorage.ftbSave=JSON.stringify({level:G.level,score:G.score,coins:G.coins,up:G.up,sp:G.sp})}
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
const BTN={};function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function down(e){e.preventDefault();startMusic();const p=pos(e);
 for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}
 if(G.state==='play'&&!bean&&G.beans>0&&Math.hypot(p.x-AX,p.y-AY)<90)drag=p}
function move(e){if(drag){e.preventDefault();drag=pos(e)}}
function pull(){let dx=AX-drag.x,dy=AY-drag.y,d=Math.hypot(dx,dy),m=120;if(d>m){dx*=m/d;dy*=m/d;d=m}return{dx,dy,d,pw:d/m}}
function up(e){if(!drag)return;const p=pull();drag=null;if(p.d<12)return;const k=7.2*(1+G.up.power*.12);
 const type=G.sel!=='normal'&&G.sp[G.sel]>0?G.sel:'normal';if(type!=='normal'){G.sp[type]--;if(!G.sp[type])G.sel='normal'}
 bean={x:AX,y:AY,vx:p.dx*k,vy:p.dy*k,type,life:0,hits:0,rot:0};G.beans--;if(type==='decaf')slow=1}
c.addEventListener('mousedown',down);c.addEventListener('mousemove',move);addEventListener('mouseup',up);
c.addEventListener('touchstart',down,{passive:false});c.addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);
function msg(s){G.msg=s;G.msgT=1.6}
function burst(x,y,col,n=14){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=60+Math.random()*200;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.8,col})}}
function score(tg,mult){G.combo++;G.mood=G.combo>1?'cheer':'happy';G.moodT=1.5;const m=Math.min(5,G.combo)*(mult||1),p=tg.pts*m;G.lvScore+=p;G.score+=p;G.coins+=Math.ceil(p/5);pops.push({x:tg.x,y:tg.y-30,s:'+'+p+(G.combo>1?' x'+Math.min(5,G.combo)+' combo!':''),l:1.2});tg.hp--;tg.hit=.3;burst(tg.x,tg.y,'#c8864a')}
function endShot(){if(bean&&!bean.hits){G.combo=0;G.mood='worried';G.moodT=1.5}bean=null;slow=0;
 targets=targets.filter(t=>t.hp>0);
 if(G.lvScore>=G.goal||!targets.length){levelDone();return}
 if(G.beans<=0){G.state='over';localStorage.removeItem('ftbSave');if(G.score>G.best){G.best=G.score;localStorage.ftbBest=G.best}}}
function levelDone(){const bonus=G.beans*15;G.score+=bonus;G.coins+=G.beans*3;if(G.score>G.best){G.best=G.score;localStorage.ftbBest=G.best}
 if(window.DEMO&&G.level>=3){G.state='demo';setTimeout(()=>window.demoEnd&&demoEnd('You finished the 3 demo levels of <b>Flick the Bean</b>! Endless levels, stronger winds, moving obstacles and the full café shop are in the full game.'),900);return}
 G.level++;G.state='shop';G.bonus=bonus;save()}
const SHOP=[['beans','☕ +2 beans per level',30,()=>G.up.beans++],['guide','📏 Longer aim guide',25,()=>G.up.guide++],['power','💪 Stronger flick',35,()=>G.up.power++],
 ['golden','🌟 Golden bean (x3 points)',20,()=>G.sp.golden++],['decaf','🐢 Decaf bean (slow-mo)',15,()=>G.sp.decaf++],['espresso','💥 Espresso bean (explodes)',25,()=>G.sp.espresso++]];
function cost(s){return s[2]+(G.up[s[0]]||0)*20}
function update(dt){t+=dt;if(G.moodT>0)G.moodT-=dt;if(G.msgT>0)G.msgT-=dt;
 parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);pops.forEach(p=>{p.y-=40*dt;p.l-=dt});pops=pops.filter(p=>p.l>0);
 if(G.state!=='play')return;
 const sd=slow?dt*.35:dt;
 targets.forEach(tg=>{tg.ph+=dt;tg.hit=Math.max(0,tg.hit-dt);tg.x+=tg.vx*sd;if(tg.x<380||tg.x>870)tg.vx*=-1;tg.x=Math.max(380,Math.min(870,tg.x));
  if(tg.vy){tg.y+=tg.vy*sd;if(tg.y<120||tg.y>420)tg.vy*=-1}});
 obs.forEach(o=>{if(o.vy){o.y+=o.vy*sd;if(o.y<60||o.y+o.h>520)o.vy*=-1}});
 if(!bean)return;const b=bean;b.life+=sd;b.vx+=G.wind*sd;b.vy+=GR*sd;b.x+=b.vx*sd;b.y+=b.vy*sd;b.rot+=sd*10;
 if(Math.random()<.5)parts.push({x:b.x,y:b.y,vx:0,vy:0,l:.3,col:b.type==='golden'?'#ffd75a':'#6b3a1e'});
 for(const o of obs){if(b.x>o.x-8&&b.x<o.x+o.w+8&&b.y>o.y-8&&b.y<o.y+o.h+8){const fromSide=Math.min(Math.abs(b.x-o.x),Math.abs(b.x-o.x-o.w))<Math.min(Math.abs(b.y-o.y),Math.abs(b.y-o.y-o.h));
  if(fromSide){b.vx*=-.6;b.x=b.x<o.x+o.w/2?o.x-9:o.x+o.w+9}else{b.vy*=-.6;b.y=b.y<o.y+o.h/2?o.y-9:o.y+o.h+9}burst(b.x,b.y,'#fff',5)}}
 for(const tg of targets){if(tg.hp>0&&Math.hypot(b.x-tg.x,b.y-tg.y)<tg.r+8){b.hits++;
   if(b.type==='espresso'){burst(b.x,b.y,'#ff7a3a',40);msg('💥 ESPRESSO BLAST!');targets.forEach(o=>{if(o.hp>0&&Math.hypot(o.x-b.x,o.y-b.y)<130)score(o,1)})}
   else score(tg,b.type==='golden'?3:1);
   if(b.type==='golden')msg('🌟 Golden bean x3!');endShot();return}}
 if(b.y>H+30||b.x>W+30||b.x<-30||b.life>8)endShot()}
// ---- drawing ----
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function skull(X,Y,s){x.fillStyle='#ffe9ef';x.beginPath();x.arc(X,Y,6*s,0,7);x.fill();x.fillRect(X-3.5*s,Y+3*s,7*s,4*s);x.fillStyle='#12060c';x.beginPath();x.arc(X-2.3*s,Y,1.6*s,0,7);x.arc(X+2.3*s,Y,1.6*s,0,7);x.fill()}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}x.fillStyle='#8a1030';x.beginPath();x.arc(X,Y,2.4*s,0,7);x.fill()}
function beanShape(X,Y,r,col,rot){x.save();x.translate(X,Y);x.rotate(rot||0);x.fillStyle=col;x.beginPath();x.ellipse(0,0,r,r*.7,0,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=2;x.beginPath();x.moveTo(-r*.7,0);x.quadraticCurveTo(0,-r*.35,r*.7,0);x.stroke();x.restore()}
const BC={normal:'#6b3a1e',golden:'#ffc93a',decaf:'#7ab0c8',espresso:'#2a0f05'};
function drawTarget(tg){const s=tg.hit>0?1.15:1;x.save();x.translate(tg.x,tg.y);x.scale(s,s);
 if(tg.k==='cup'){x.fillStyle='#f6c6d2';x.beginPath();x.moveTo(-26,-18);x.lineTo(26,-18);x.lineTo(19,22);x.lineTo(-19,22);x.fill();x.strokeStyle='#f6c6d2';x.lineWidth=5;x.beginPath();x.arc(28,0,9,-1.4,1.4);x.stroke();x.fillStyle='#4a2410';x.beginPath();x.ellipse(0,-18,26,6,0,0,7);x.fill();skull(0,4,1.4);
  x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=2;for(let i=-1;i<2;i++){x.beginPath();x.moveTo(i*8,-28);x.quadraticCurveTo(i*8+5*Math.sin(t*3+i),-36,i*8,-44);x.stroke()}}
 else if(tg.k==='grinder'){x.fillStyle='#3a1424';rr(-24,-10,48,42,6);x.fill();x.fillStyle='#e8a0b0';x.beginPath();x.moveTo(-28,-38);x.lineTo(28,-38);x.lineTo(12,-10);x.lineTo(-12,-10);x.fill();x.strokeStyle='#ffcf6a';x.lineWidth=3;x.beginPath();x.moveTo(0,-38);x.lineTo(16*Math.cos(t*4),-46+8*Math.sin(t*4));x.stroke();rose(0,12,1.6)}
 else{x.fillStyle='#5a2a3a';rr(-32,-34,64,62,8);x.fill();x.fillStyle='#e8a0b0';rr(-26,-28,52,14,4);x.fill();x.fillStyle='#12060c';rr(-8,-10,16,10,2);x.fill();x.fillStyle='#ffe9ef';rr(-10,8,20,16,3);x.fill();skull(18,-21,.8)}
 if(tg.hp>1){x.fillStyle='#ffcf6a';x.font='bold 12px Georgia';x.textAlign='center';x.fillText('×'+tg.hp,0,tg.r+16)}
 x.restore()}
function beanBuddy(X,Y,sc,mood){x.save();x.translate(X,Y);x.scale(sc,sc);const bob=Math.sin(t*3)*(mood==='cheer'?6:2);x.translate(0,bob);
 if(mood==='cheer'){x.rotate(Math.sin(t*10)*.08)}
 const g=x.createRadialGradient(-14,-22,4,0,0,60);g.addColorStop(0,'#a8683c');g.addColorStop(.5,'#6b3a1e');g.addColorStop(1,'#3a1a0a');
 x.fillStyle=g;x.beginPath();x.ellipse(0,0,42,54,0,0,7);x.fill();
 x.strokeStyle='#2a1006';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(0,-50);x.bezierCurveTo(-14,-22,14,8,0,50);x.stroke();
 x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(-20,-28,8,14,-.5,0,7);x.fill();
 const ey=mood==='worried'?-6:-8;[-17,17].forEach(ex=>{x.fillStyle='#fff';x.beginPath();x.ellipse(ex,ey,11,mood==='cheer'?3:13,0,0,7);x.fill();
  if(mood!=='cheer'){x.fillStyle='#2a0e1c';x.beginPath();x.ellipse(ex,ey+2,7,9,0,0,7);x.fill();x.fillStyle='#e8a0b0';x.beginPath();x.ellipse(ex,ey+4,4,5,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex-3,ey-3,3,0,7);x.arc(ex+3,ey+5,1.4,0,7);x.fill()}
  else{x.strokeStyle='#2a0e1c';x.lineWidth=3;x.beginPath();x.arc(ex,ey+3,8,3.5,5.9);x.stroke()}});
 if(mood==='worried'){x.strokeStyle='#2a0e1c';x.lineWidth=2.5;x.beginPath();x.moveTo(-26,-26);x.lineTo(-10,-22);x.moveTo(26,-26);x.lineTo(10,-22);x.stroke();x.fillStyle='#9fd4ff';x.beginPath();x.ellipse(32,-18,3,5,0,0,7);x.fill()}
 x.fillStyle='rgba(255,120,150,.55)';x.beginPath();x.ellipse(-27,10,8,5,0,0,7);x.ellipse(27,10,8,5,0,0,7);x.fill();
 x.strokeStyle='#2a0e1c';x.lineWidth=2.5;x.beginPath();if(mood==='worried'){x.arc(0,22,7,3.5,5.9)}else if(mood==='cheer'){x.fillStyle='#8a1030';x.arc(0,12,9,0,3.14);x.fill()}else{x.arc(0,12,7,.3,2.8)}x.stroke();
 rose(-26,-44,1.3);skull(26,-44,.9);x.fillStyle='#2a1006';x.fillRect(-40,46,12,8);x.fillRect(28,46,12,8);
 if(mood==='cheer'){x.strokeStyle='#6b3a1e';x.lineWidth=7;x.beginPath();x.moveTo(-40,0);x.lineTo(-58,-30);x.moveTo(40,0);x.lineTo(58,-30);x.stroke()}
 x.restore()}
(function(){const o=document.createElement('canvas');o.width=240;o.height=260;const keep=x;x=o.getContext('2d');beanBuddy(120,140,1.8,'cheer');x=keep;window.HERO_SRC=o.toDataURL()})();
function curMood(){return G.moodT>0?G.mood:'happy'}
function drawBarista(){beanBuddy(AX-62,AY-18,1,curMood());x.fillStyle='#3a1424';x.fillRect(AX-6,AY+10,12,90)}
function draw(){x.clearRect(0,0,W,H);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a0e1c');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<9;i++){x.fillStyle='rgba(232,160,176,.05)';x.beginPath();x.arc(100*i+50,80+30*Math.sin(i+t*.3),40,0,7);x.fill()}
 x.fillStyle='#3a1a10';x.fillRect(0,540,W,60);for(let i=0;i<W;i+=60)rose(i+30,548,1.3);
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#e8a0b0';x.font='bold 54px Georgia';x.fillText('☕ Flick the Bean ☕',W/2,130);x.fillStyle='#ffe9c7';x.font='20px Georgia';
  x.fillText('Drag back the slingshot by Bean Buddy, release to flick coffee beans',W/2,180);x.fillText('into cups, grinders and espresso machines. Watch the wind!',W/2,208);
  beanBuddy(W/2,330,1.5,Math.sin(t)>0?'happy':'cheer');
  button('play',W/2-110,440,220,56,SV?'▶ New game':'▶ Play',newGame);if(SV)button('cont',W/2-110,505,220,40,'Continue level '+SV.level,()=>{Object.assign(G,{level:SV.level,score:SV.score,coins:SV.coins,up:SV.up,sp:SV.sp});lvSetup()});
  x.fillStyle='#ffcf6a';x.font='16px Georgia';x.fillText('Best: '+G.best,W/2,580);return}
 targets.forEach(drawTarget);
 obs.forEach(o=>{x.fillStyle='#ffe9ef';rr(o.x,o.y,o.w,o.h,6);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke();x.fillStyle='rgba(232,160,176,.4)';for(let yy=o.y+8;yy<o.y+o.h-4;yy+=14)x.fillRect(o.x+4,yy,o.w-8,2)});
 drawBarista();
 if(G.state==='play'&&!bean&&G.beans>0){const bp=drag?{x:AX-pull().dx,y:AY-pull().dy}:{x:AX,y:AY};
  x.strokeStyle='#e8a0b0';x.lineWidth=4;x.beginPath();x.moveTo(AX-20,AY-6);x.lineTo(bp.x,bp.y);x.lineTo(AX+20,AY-6);x.stroke();beanShape(bp.x,bp.y,11,BC[G.sel],0);
  if(drag){const p=pull(),k=7.2*(1+G.up.power*.12);let px=AX,py=AY,vx=p.dx*k,vy=p.dy*k;x.fillStyle='rgba(255,233,239,.7)';const n=14+G.up.guide*10;
   for(let i=0;i<n;i++){for(let j=0;j<4;j++){vx+=G.wind*.012;vy+=GR*.012;px+=vx*.012;py+=vy*.012}x.beginPath();x.arc(px,py,3-i*2/n,0,7);x.fill()}
   x.fillStyle='#3a1424';rr(196,330,18,140,6);x.fill();const pc=p.pw;x.fillStyle=pc>.8?'#ff5a5a':pc>.5?'#ffcf6a':'#7fd88a';rr(198,470-136*pc,14,136*pc,5);x.fill();x.fillStyle='#ffe9c7';x.font='12px Georgia';x.textAlign='center';x.fillText('POWER',205,322)}}
 if(bean)beanShape(bean.x,bean.y,11,BC[bean.type],bean.rot);
 parts.forEach(p=>{x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.col;x.fillRect(p.x-2,p.y-2,4,4)});x.globalAlpha=1;
 pops.forEach(p=>{x.globalAlpha=Math.min(1,p.l);x.fillStyle='#ffcf6a';x.font='bold 18px Georgia';x.textAlign='center';x.fillText(p.s,p.x,p.y)});x.globalAlpha=1;
 // HUD
 x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText('Level '+G.level+'   Score '+G.score+'   ☕ coins '+G.coins,14,28);
 x.font='15px Georgia';x.fillText('Goal '+G.lvScore+' / '+G.goal+'   Beans left: '+G.beans+(G.combo>1?'   Combo x'+Math.min(5,G.combo):''),14,50);
 x.fillStyle='#3a1424';rr(14,58,200,8,4);x.fill();x.fillStyle='#e8a0b0';rr(14,58,200*Math.min(1,G.lvScore/G.goal),8,4);x.fill();
 if(G.wind){x.fillStyle='#bfe3ff';x.font='15px Georgia';const a=G.wind>0?'→':'←';x.fillText('Wind '+a.repeat(1+Math.min(3,Math.abs(G.wind)/70|0)),14,86);
  for(let i=0;i<6;i++){const wx=((t*G.wind*.6+i*170)%W+W)%W;x.strokeStyle='rgba(191,227,255,.18)';x.beginPath();x.moveTo(wx,110+i*60);x.lineTo(wx+30*Math.sign(G.wind),110+i*60);x.stroke()}}
 if(slow){x.fillStyle='rgba(122,176,200,.12)';x.fillRect(0,0,W,H)}
 if(G.state==='play'){let bx=240;[['normal','Bean',99],['golden','🌟',G.sp.golden],['decaf','🐢',G.sp.decaf],['espresso','💥',G.sp.espresso]].forEach(([k,l,n])=>{
   button('sp_'+k,bx,552,k==='normal'?70:64,32,l+(k==='normal'?'':' '+n),()=>{if(k==='normal'||n>0)G.sel=k},G.sel===k,k!=='normal'&&!n);bx+=(k==='normal'?78:72)})}
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='#ffcf6a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText(G.msg,W/2,110);x.globalAlpha=1}
 if(G.state==='shop')drawShop();
 if(G.state==='over'){x.fillStyle='rgba(18,6,12,.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#e8a0b0';x.font='bold 44px Georgia';x.fillText('Out of beans!',W/2,220);x.fillStyle='#ffe9c7';x.font='22px Georgia';x.fillText('Score '+G.score+'  ·  Reached level '+G.level+'  ·  Best '+G.best,W/2,270);button('again',W/2-100,320,200,52,'↻ Play again',newGame)}}
function drawShop(){x.fillStyle='rgba(18,6,12,.9)';x.fillRect(0,0,W,H);beanBuddy(80,520,.8,'cheer');beanBuddy(820,520,.8,'happy');x.textAlign='center';x.fillStyle='#e8a0b0';x.font='bold 36px Georgia';x.fillText('☕ Café Upgrade Shop',W/2,70);
 x.fillStyle='#ffe9c7';x.font='18px Georgia';x.fillText('Level cleared! Leftover bean bonus +'+(G.bonus||0)+'   ·   You have '+G.coins+' coins',W/2,104);
 SHOP.forEach((s,i)=>{const cx=W/2-330+(i%3)*225,cy=135+(i/3|0)*150,cs=cost(s),own=G.up[s[0]]!==undefined?'Lv '+G.up[s[0]]:'Own '+G.sp[s[0]];
  x.fillStyle='#24101a';rr(cx,cy,210,130,12);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke();x.fillStyle='#ffe9c7';x.font='bold 15px Georgia';x.fillText(s[1],cx+105,cy+34);
  x.font='14px Georgia';x.fillText(own,cx+105,cy+58);button('b'+i,cx+40,cy+76,130,38,'Buy '+cs,()=>{if(G.coins>=cs){G.coins-=cs;s[3]();save()}},false,G.coins<cs)});
 button('next',W/2-120,470,240,56,'▶ Level '+G.level,lvSetup)}
function button(id,X,Y,w,h,label,fn,sel,dis){BTN[id]={x:X,y:Y,w,h,fn:dis?()=>{}:fn};x.fillStyle=sel?'#e8a0b0':'#3a1424';x.globalAlpha=dis?.4:1;rr(X,Y,w,h,10);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=sel?'#1a0a10':'#ffe9c7';x.font='bold '+Math.min(20,h*.42)+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
