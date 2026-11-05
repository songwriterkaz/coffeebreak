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
// ---- Coffeebreak Shed Pool ----
const W=900,H=600,TX=110,TY=125,TW=680,TH=360,R=10,PR=19;window.HERO_SRC='assets/hero.png';
const POCK=[[TX,TY],[TX+TW/2,TY-4],[TX+TW,TY],[TX,TY+TH],[TX+TW/2,TY+TH+4],[TX+TW,TY+TH]];
const COL=['#fff','#f2c230','#2a5ad8','#d83030','#6a2a9a','#f07a20','#2a9a4a','#8a2020','#111'];
const DEMO=()=>!!window.DEMO;
const G={state:'title',mode:'ai',score:0,level:+localStorage.spTricks||0,turn:0,groups:[null,null],msg:'',msgT:0,winner:null,trick:0,tries:0,best:+localStorage.spWins||0};window.G=G;
let balls=[],aim=null,moving=false,shot=null,t=0,aiT=0;const BTN={};
const TRICKS=[{n:'Straight in',d:'Pot the yellow in the corner',b:[[0,300,305],[1,680,180]],need:[1]},
 {n:'Cut shot',d:'Pot the blue in the middle pocket',b:[[0,300,400],[2,450,170]],need:[2]},
 {n:'Double trouble',d:'Pot BOTH red and orange',b:[[0,250,305],[3,560,230],[5,560,390]],need:[3,5]},
 {n:'Through the gap',d:'Pot the purple past the blockers',b:[[0,200,305],[4,700,305],[9,450,270],[10,450,340]],need:[4]},
 {n:'The bank',d:'Pot the 8 off a cushion',b:[[0,300,430],[8,620,440],[11,470,420],[12,470,470]],need:[8]}];
function ball(n,x,y){return{n,x,y,vx:0,vy:0,in:false}}
function rack(){balls=[ball(0,TX+TW*.25,TY+TH/2)];const ord=[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];let k=0;const fx=TX+TW*.7,fy=TY+TH/2;
 for(let c=0;c<5;c++)for(let r=0;r<=c;r++)balls.push(ball(ord[k++],fx+c*R*1.75,fy+(r-c/2)*R*2.02))}
function start(mode){startMusic();G.mode=mode;G.turn=0;G.groups=[null,null];G.winner=null;G.state='play';G.pot=[0,0];if(mode==='trick'){G.trick=G.trick%TRICKS.length;setTrick()}else{rack();msg(mode==='ai'?'You break! (solids or stripes decided by first pot)':'Player 1 breaks!')}}
function setTrick(){const T=TRICKS[G.trick];balls=T.b.map(([n,x,y])=>ball(n,x,y));G.tries=3;msg('Trick '+(G.trick+1)+': '+T.d)}
function msg(s){G.msg=s;G.msgT=3}
const grp=n=>n===0?'cue':n===8?'eight':n<8?'solids':'stripes';
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
const human=()=>G.mode!=='ai'||G.turn===0;
function down(e){e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}
 if(G.state==='play'&&!moving&&human())aim={x:p.x,y:p.y,sx:p.x,sy:p.y}}
function move(e){const p=pos(e);if(aim){e.preventDefault();aim.x=p.x;aim.y=p.y}else hover=p}
let hover=null;
function aimVec(){const cb=balls[0];let dx=cb.x-aim.x,dy=cb.y-aim.y;const d=Math.hypot(dx,dy)||1;const pw=Math.min(1,Math.hypot(aim.x-aim.sx,aim.y-aim.sy)/160);return{ux:dx/d,uy:dy/d,pw}}
function up(){if(!aim)return;const a=aimVec();aim=null;if(a.pw<.04)return;shoot(a.ux,a.uy,a.pw)}
c.addEventListener('mousedown',down);c.addEventListener('mousemove',move);addEventListener('mouseup',up);c.addEventListener('touchstart',down,{passive:false});c.addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);
function shoot(ux,uy,pw){const cb=balls[0];const v=250+pw*1250;cb.vx=ux*v;cb.vy=uy*v;moving=true;shot={first:null,potted:[],cush:0}}
function physics(dt){const steps=8,h=dt/steps;for(let s=0;s<steps;s++){
 for(const b of balls){if(b.in)continue;b.x+=b.vx*h;b.y+=b.vy*h;const sp=Math.hypot(b.vx,b.vy);if(sp>0){const f=Math.max(0,sp-260*h)/sp;b.vx*=f;b.vy*=f}
  for(const [px,py] of POCK)if(Math.hypot(b.x-px,b.y-py)<PR){b.in=true;b.vx=b.vy=0;shot&&shot.potted.push(b.n)}
  if(b.in)continue;
  if(b.x<TX+R){b.x=TX+R;b.vx=-b.vx*.8;shot&&shot.cush++}if(b.x>TX+TW-R){b.x=TX+TW-R;b.vx=-b.vx*.8;shot&&shot.cush++}
  if(b.y<TY+R){b.y=TY+R;b.vy=-b.vy*.8;shot&&shot.cush++}if(b.y>TY+TH-R){b.y=TY+TH-R;b.vy=-b.vy*.8;shot&&shot.cush++}}
 for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j];if(a.in||b.in)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d<2*R&&d>0){const nx=dx/d,ny=dy/d,ov=2*R-d;a.x-=nx*ov/2;a.y-=ny*ov/2;b.x+=nx*ov/2;b.y+=ny*ov/2;const rv=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
   if(rv>0){const im=rv*.97;a.vx-=im*nx;a.vy-=im*ny;b.vx+=im*nx;b.vy+=im*ny;if(shot&&shot.first===null&&(a.n===0||b.n===0))shot.first=a.n===0?b.n:a.n}}}}
 return balls.some(b=>!b.in&&Math.hypot(b.vx,b.vy)>4)}
function placeCue(){const cb=balls[0];cb.in=false;cb.vx=cb.vy=0;cb.x=TX+TW*.25;cb.y=TY+TH/2;while(balls.some(b=>b!==cb&&!b.in&&Math.hypot(b.x-cb.x,b.y-cb.y)<2*R+1))cb.y+=2*R}
function left(g){return balls.filter(b=>!b.in&&grp(b.n)===g).length}
function endShot(){moving=false;const s=shot;shot=null;balls.forEach(b=>{b.vx=b.vy=0});
 if(G.mode==='trick'){const T=TRICKS[G.trick],ok=T.need.every(n=>s.potted.includes(n))&&!s.potted.includes(0);
  if(ok){G.trick++;if(G.trick>G.level){G.level=G.trick;localStorage.spTricks=G.level}G.score+=100*G.tries;msg('🎯 Trick shot cleared!');
   if(DEMO()&&G.trick>=1){G.state='demo';setTimeout(()=>window.demoEnd&&demoEnd('Nice shot! All 5 trick shots, 2-player mode and full matches are in the full game of <b>Coffeebreak Shed Pool</b>.'),1200);return}
   if(G.trick>=TRICKS.length){G.state='over';G.winner='All trick shots cleared! 🏆';return}setTimeout(setTrick,1200)}
  else{G.tries--;if(G.tries<=0){msg('Out of tries. Resetting this trick.');setTimeout(setTrick,1200)}else{msg('Missed! '+G.tries+' tries left.');const T=TRICKS[G.trick];setTimeout(()=>{balls=T.b.map(([n,x,y])=>ball(n,x,y))},900)}}return}
 const p=G.turn,o=1-p,mine=G.groups[p];let foul=false,keep=false,why='';
 if(s.first===null){foul=true;why='No ball hit'}else if(mine&&grp(s.first)!==mine&&!(grp(s.first)==='eight'&&left(mine)===0)){foul=true;why='Wrong ball hit first'}
 if(s.potted.includes(0)){foul=true;why='Scratch!'}
 const pots=s.potted.filter(n=>n!==0&&n!==8);
 if(!G.groups[p]&&pots.length&&!foul){const g=grp(pots[0]);G.groups[p]=g;G.groups[o]=g==='solids'?'stripes':'solids';msg((G.mode==='ai'?(p?'Coffeebreak Bot is ':'You are '):'Player '+(p+1)+' is ')+g+'!')}
 if(p===0||G.mode==='2p')G.pot[p]+=pots.length;if(p===0)G.score+=pots.length*10;
 if(s.potted.includes(8)){const won=!foul&&G.groups[p]&&left(G.groups[p])===0;finish(won?p:o,won?'potted the 8-ball!':'8-ball potted early, so the other player wins.');return}
 if(G.groups[p])keep=!foul&&pots.some(n=>grp(n)===G.groups[p]);else keep=!foul&&pots.length>0;
 if(s.potted.includes(0))placeCue();
 if(foul)msg('Foul: '+why+' Turn passes.');
 if(!keep){G.turn=o;if(G.mode==='ai'&&G.turn===1)aiT=1.2}}
function finish(w,why){G.state='over';const nm=w===0?(G.mode==='ai'?'You win':'Player 1 wins'):(G.mode==='ai'?'Coffeebreak Bot wins':'Player 2 wins');G.winner=nm+': '+why;
 if(G.mode==='ai'&&w===0){G.score+=200;G.best++;localStorage.spWins=G.best}
 if(DEMO())setTimeout(()=>window.demoEnd&&demoEnd('Thanks for playing a frame of <b>Coffeebreak Shed Pool</b>! 2-player mode, all 5 trick shots and unlimited matches are in the full game.'),2500)}
function clear(ax,ay,bx,by,skip){for(const b of balls){if(b.in||skip.includes(b))continue;const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy,tt=Math.max(0,Math.min(1,((b.x-ax)*dx+(b.y-ay)*dy)/L));if(Math.hypot(ax+dx*tt-b.x,ay+dy*tt-b.y)<2*R-1)return false}return true}
function aiShot(){const cb=balls[0],mine=G.groups[1];let tg=balls.filter(b=>!b.in&&b.n!==0&&(mine?(left(mine)?grp(b.n)===mine:b.n===8):b.n!==8));if(!tg.length)tg=balls.filter(b=>!b.in&&b.n!==0);
 let best=null;for(const b of tg)for(const [px,py] of POCK){const dx=px-b.x,dy=py-b.y,d=Math.hypot(dx,dy),gx=b.x-dx/d*2*R,gy=b.y-dy/d*2*R;
  const cx=gx-cb.x,cy=gy-cb.y,cd=Math.hypot(cx,cy);const cut=(cx*dx+cy*dy)/(cd*d);if(cut<.3)continue;
  if(!clear(cb.x,cb.y,gx,gy,[cb,b])||!clear(b.x,b.y,px,py,[b]))continue;const sc=cut*2-(cd+d)/800;if(!best||sc>best.sc)best={sc,ux:cx/cd,uy:cy/cd,pw:Math.min(1,.3+(cd+d)/1100)}}
 if(!best){const b=tg.sort((a,b)=>Math.hypot(a.x-cb.x,a.y-cb.y)-Math.hypot(b.x-cb.x,b.y-cb.y))[0];const dx=b.x-cb.x,dy=b.y-cb.y,d=Math.hypot(dx,dy);best={ux:dx/d,uy:dy/d,pw:.55}}
 const er=(Math.random()-.5)*.06,ca=Math.cos(er),sa=Math.sin(er);shoot(best.ux*ca-best.uy*sa,best.ux*sa+best.uy*ca,best.pw)}
function update(dt){t+=dt;if(G.msgT>0)G.msgT-=dt;if(G.state!=='play')return;
 if(moving){if(!physics(dt))endShot()}else if(G.mode==='ai'&&G.turn===1){aiT-=dt;if(aiT<=0)aiShot()}}
// ---- drawing ----
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,dis){BTN[id]={x:X,y:Y,w,h,fn:dis?()=>{}:fn};x.globalAlpha=dis?.4:1;x.fillStyle='#3a1424';rr(X,Y,w,h,12);x.fill();x.strokeStyle='#f0c070';x.lineWidth=2;x.stroke();x.fillStyle='#fff3d6';x.font='bold 19px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function shed(){x.fillStyle='#5a3a22';x.fillRect(0,0,W,H);for(let i=0;i<W;i+=45){x.fillStyle=i/45%2?'#634026':'#56371f';x.fillRect(i,0,44,H);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(i+43,0,2,H)}
 x.fillStyle='#3a2414';x.fillRect(0,540,W,60);
 // fairy lights
 x.strokeStyle='#2a1a0a';x.lineWidth=2;x.beginPath();for(let i=0;i<=W;i+=10)x.lineTo(i,70+Math.sin(i/60)*6);x.stroke();
 const LC=['#ffd75a','#ff8ab0','#8ad0ff','#a0ff9a'];for(let i=15;i<W;i+=40){const y=72+Math.sin(i/60)*6,on=.6+.4*Math.sin(t*3+i);x.fillStyle=LC[(i/40|0)%4];x.globalAlpha=on*.35;x.beginPath();x.arc(i,y+6,12,0,7);x.fill();x.globalAlpha=on;x.beginPath();x.arc(i,y+6,4,0,7);x.fill();x.globalAlpha=1}
 // dartboard
 const dx=40,dy=430;[['#111',30],['#d8c890',26],['#c22',20],['#2a8a3a',14],['#d8c890',9],['#c22',4]].forEach(([cl,r])=>{x.fillStyle=cl;x.beginPath();x.arc(dx,dy,r,0,7);x.fill()});x.strokeStyle='#ffcf6a';x.lineWidth=2;x.beginPath();x.moveTo(dx+3,dy-2);x.lineTo(dx+18,dy-12);x.stroke();
 // beer fridge
 x.fillStyle='#d8dde2';rr(4,170,70,190,8);x.fill();x.fillStyle='#b8bec4';x.fillRect(4,240,70,3);x.fillStyle='#555';x.fillRect(64,190,5,36);x.fillRect(64,256,5,60);x.fillStyle='#c2264a';x.font='bold 12px Georgia';x.textAlign='center';x.fillText('COLD 🍺',39,208);
 x.font='22px serif';x.fillText('🧃',26,300);x.fillText('🍺',52,300);
 // sleeping dog
 const bx=830,by=548;x.fillStyle='#b07a40';x.beginPath();x.ellipse(bx,by,42,18+Math.sin(t*1.5)*1.5,0,0,7);x.fill();x.beginPath();x.arc(bx-36,by-4,15,0,7);x.fill();x.fillStyle='#7a4a20';x.beginPath();x.ellipse(bx-42,by-12,6,11,.5,0,7);x.fill();
 x.strokeStyle='#2a1406';x.lineWidth=2;x.beginPath();x.arc(bx-40,by-4,4,.2,2.9);x.stroke();x.fillStyle='#111';x.beginPath();x.arc(bx-50,by-1,2.5,0,7);x.fill();
 x.fillStyle='rgba(255,243,214,.8)';x.font='bold 16px Georgia';const z=(t*.7)%1;x.globalAlpha=1-z;x.fillText('z',bx-20+z*10,by-28-z*24);x.font='bold 12px Georgia';x.fillText('z',bx-10+z*10,by-40-z*20);x.globalAlpha=1;x.fillStyle='#b05030';x.fillRect(780,560,40,6);x.fillStyle='#fff3d6';x.font='10px Georgia';x.fillText('Biscuit',800,580)}
function table(){x.fillStyle='#4a2410';rr(TX-28,TY-28,TW+56,TH+56,18);x.fill();x.fillStyle='#e8a0b0';for(const [px,py] of [[TX+TW/4,TY-14],[TX+TW*3/4,TY-14],[TX+TW/4,TY+TH+14],[TX+TW*3/4,TY+TH+14]]){x.beginPath();x.arc(px,py,3,0,7);x.fill()}
 const g=x.createRadialGradient(TX+TW/2,TY+TH/2,40,TX+TW/2,TY+TH/2,TW*.6);g.addColorStop(0,'#2e7a4a');g.addColorStop(1,'#1c5232');x.fillStyle=g;x.fillRect(TX,TY,TW,TH);
 x.strokeStyle='rgba(255,255,255,.15)';x.beginPath();x.moveTo(TX+TW*.25,TY);x.lineTo(TX+TW*.25,TY+TH);x.stroke();
 for(const [px,py] of POCK){x.fillStyle='#0a0503';x.beginPath();x.arc(px,py,PR,0,7);x.fill()}}
function drawBall(b){if(b.in)return;x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.arc(b.x+2,b.y+3,R,0,7);x.fill();const st=b.n>8;x.fillStyle=st?'#fff':COL[b.n]||'#fff';x.beginPath();x.arc(b.x,b.y,R,0,7);x.fill();
 if(st){x.save();x.beginPath();x.arc(b.x,b.y,R,0,7);x.clip();x.fillStyle=COL[b.n-8];x.fillRect(b.x-R,b.y-5,2*R,10);x.restore()}
 if(b.n){x.fillStyle='#fff';x.beginPath();x.arc(b.x,b.y,4.5,0,7);x.fill();x.fillStyle='#111';x.font='bold 7px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(b.n,b.x,b.y+.5);x.textBaseline='alphabetic'}
 x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(b.x-3,b.y-3,2.5,0,7);x.fill()}
function draw(){shed();
 if(G.state==='title'){table();rack();balls.forEach(drawBall);x.fillStyle='rgba(18,8,4,.6)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f0c070';x.font='bold 54px Georgia';x.fillText('🎱 Coffeebreak Shed Pool',W/2,140);
  x.fillStyle='#fff3d6';x.font='19px Georgia';x.fillText('Drag back from the cue ball to aim, pull further for more power, release to shoot.',W/2,185);
  button('ai',W/2-130,240,260,52,'🤖 1 Player vs Bot',()=>start('ai'));button('2p',W/2-130,305,260,52,DEMO()?'👥 2 Players (full game)':'👥 2 Players',()=>start('2p'),DEMO());button('tr',W/2-130,370,260,52,'🎯 Trick Shots',()=>start('trick'));
  x.fillStyle='#ffcf6a';x.font='16px Georgia';x.fillText('Wins vs bot: '+G.best+'   ·   Trick shots cleared: '+G.level+'/5',W/2,455);if(G.state==='title')balls=[];return}
 table();
 if(!moving&&G.state==='play'&&human()&&balls[0]&&!balls[0].in){const cb=balls[0];const a=aim?aimVec():hover?(()=>{const dx=hover.x-cb.x,dy=hover.y-cb.y,d=Math.hypot(dx,dy)||1;return{ux:dx/d,uy:dy/d,pw:0}})():null;
  if(a){x.setLineDash([6,6]);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.5;x.beginPath();x.moveTo(cb.x,cb.y);x.lineTo(cb.x+a.ux*(aim?520:160),cb.y+a.uy*(aim?520:160));x.stroke();x.setLineDash([]);
   const back=22+a.pw*70;x.strokeStyle='#c8945a';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(cb.x-a.ux*back,cb.y-a.uy*back);x.lineTo(cb.x-a.ux*(back+260),cb.y-a.uy*(back+260));x.stroke();x.strokeStyle='#f6c6d2';x.beginPath();x.moveTo(cb.x-a.ux*back,cb.y-a.uy*back);x.lineTo(cb.x-a.ux*(back+10),cb.y-a.uy*(back+10));x.stroke();x.lineCap='butt';
   if(aim){x.fillStyle='#2a1406';rr(TX+TW+40,TY,16,TH,6);x.fill();x.fillStyle=a.pw>.8?'#ff5a5a':a.pw>.45?'#ffcf6a':'#7fd88a';rr(TX+TW+42,TY+TH-(TH-4)*a.pw-2,12,(TH-4)*a.pw,5);x.fill()}}}
 balls.forEach(drawBall);
 // HUD
 x.textAlign='left';x.fillStyle='#fff3d6';x.font='bold 17px Georgia';
 if(G.mode==='trick'){const T=TRICKS[Math.min(G.trick,TRICKS.length-1)];x.fillText('🎯 Trick '+(Math.min(G.trick,4)+1)+'/5: '+T.n+' · '+T.d+' · tries '+G.tries+' · score '+G.score,14,40)}
 else{const nm=i=>G.mode==='ai'?(i?'Coffeebreak Bot':'You'):'Player '+(i+1);for(let i=0;i<2;i++){x.fillStyle=G.turn===i?'#ffcf6a':'#d8c0a0';x.fillText((G.turn===i?'▶ ':'')+nm(i)+(G.groups[i]?' ('+G.groups[i]+', '+left(G.groups[i])+' left)':''),14+i*420,40)}}
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='rgba(18,8,4,.75)';rr(W/2-300,TY+TH/2-24,600,44,12);x.fill();x.fillStyle='#ffcf6a';x.font='bold 18px Georgia';x.textAlign='center';x.fillText(G.msg,W/2,TY+TH/2+5);x.globalAlpha=1}
 button('menu',14,520,96,30,'☰ Menu',()=>{G.state='title';moving=false});
 if(G.state==='over'){x.fillStyle='rgba(18,8,4,.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f0c070';x.font='bold 30px Georgia';x.fillText(G.winner||'',W/2,230);button('again',W/2-110,290,220,52,'↻ Play again',()=>start(G.mode==='trick'?'trick':G.mode));button('menu2',W/2-110,355,220,44,'☰ Menu',()=>G.state='title')}}
let last=performance.now();function loop(n){const dt=Math.min(.033,(n-last)/1000);last=n;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
