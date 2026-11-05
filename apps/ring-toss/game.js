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
// ===== Coffeebreak Ring Toss =====
const DEMO=!!window.DEMO,SK=DEMO?'ringtossD':'ringtoss';
let S={best:0,tickets:0,won:[],hi:[],cleared:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
if(!Array.isArray(S.hi))S.hi=[];if(!Array.isArray(S.won))S.won=[];
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'menu',score:0,level:0};window.G=G;
const MAXL=DEMO?5:30,AX=160,AY=480,GR=780;
const COLS=[['Red','#e03a3a',1],['Blue','#3a7ae0',1.2],['Green','#3ab85a',1.4],['Gold','#e0b030',1.8],['Purple','#9a4ae0',2.2]];
const PRIZES=[['Teddy','🧸',40],['Bunny','🐰',55],['Seal','🦭',70],['Duck','🦆',45],['Cat','🐱',60],['Fox','🦊',80],['Unicorn','🦄',120],['Dragon','🐉',150],['Coffee Bean','☕',90],['Heart Bear','💖',100]];
let cones=[],ring=null,drag=null,parts=[],pops=[],flash=0,msg='',msgT=0,ringsLeft=0,lvScore=0,goal=0,combo=0,tickets=0,mode='levels',endlessBest=0;
function sfx(f,d,ty,v){try{const A=window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.type=ty||'sine';o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(40,f*.55),n+d);g.gain.setValueAtTime(v||.14,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
function ringer(){sfx(880,.18,'triangle',.2);sfx(1320,.28,'sine',.12);sfx(1760,.35,'triangle',.08)}
function clank(){sfx(220,.12,'square',.1);sfx(140,.2,'sawtooth',.08)}
function whoosh(){sfx(400,.15,'sine',.06)}
function say(s){msg=s;msgT=1.8}
function burst(X,Y,col,n=16){for(let i=0;i<n;i++){const a=Math.random()*6.3,s=50+Math.random()*220;parts.push({x:X,y:Y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,l:.9,col})}}
function conePts(c){return Math.round(10*c.distMul*c.colMul*(c.kind==='bottle'?1.3:1))}
function makeLevel(L){
  cones=[];const n=Math.min(8,2+Math.floor((L+1)/2));
  const rows=L<3?1:L<8?2:3;
  for(let i=0;i<n;i++){
    const row=i%rows,col=Math.floor(i/rows);
    const baseX=380+col*70+(rows>1?row*20:0)+((L*17+i*41)%40);
    const baseY=200+row*90+((L*13+i*23)%30);
    const kind=(L>2&&i%3===0)?'bottle':'cone';
    const ci=Math.min(COLS.length-1,Math.floor(L/4)+ (i%Math.min(3,1+Math.floor(L/3))));
    const distMul=1+row*.35+(baseX-380)/500;
    const move=L>=6&&(i%2===0||L>=12)?(40+L*3)*(Math.random()<.5?-1:1):0;
    const bob=L>=10&&i%3===1?(20+L):(0);
    cones.push({x:baseX,y:baseY,bx:baseX,by:baseY,kind,ci,col:COLS[ci][1],colMul:COLS[ci][2],distMul,r:kind==='bottle'?14:18,ringed:false,vx:move,bob,ph:Math.random()*6.3,wob:0});
  }
  ringsLeft=Math.max(3,n+1-Math.floor(L/8));
  goal=Math.ceil(cones.reduce((a,c)=>a+conePts(c),0)*.55);
  lvScore=0;combo=0;ring=null;drag=null;G.level=L;G.state='play';
  say('Level '+L+(mode==='endless'?' · Endless':'')+' — ring '+goal+' pts!');
}
function startLevels(){mode='levels';G.score=0;tickets=0;makeLevel(1)}
function startEndless(){if(DEMO){window.demoEnd&&window.demoEnd('Endless mode and the high-score table are in the full game, with 30 fairground levels, moving cones and a prize shelf of plush toys.');return}mode='endless';G.score=0;tickets=0;endlessBest=S.best;makeLevel(1)}
function pull(){let dx=AX-drag.x,dy=AY-drag.y,d=Math.hypot(dx,dy),m=140;if(d>m){dx*=m/d;dy*=m/d;d=m}return{dx,dy,d,pw:d/m}}
function throwRing(){const p=pull();drag=null;if(p.d<14)return;whoosh();const k=6.4;ring={x:AX,y:AY,vx:p.dx*k,vy:p.dy*k,rot:0,spin:8+p.pw*10,life:0,landed:false,hits:0,z:1};ringsLeft--;}
function endShot(hit){if(!hit){combo=0;clank()}ring=null;
  const left=cones.filter(c=>!c.ringed).length;
  if(lvScore>=goal||!left){levelWin();return}
  if(ringsLeft<=0){levelFail()}}
function levelWin(){const bonus=ringsLeft*25+combo*10;G.score+=bonus;const tix=8+Math.floor(G.level*1.5)+Math.floor(bonus/20);tickets+=tix;S.tickets=(S.tickets||0)+tix;S.cleared=Math.max(S.cleared||0,G.level);S.best=Math.max(S.best,G.score);pushHi();sv();
  if(mode==='endless'){G.state='between';say('Cleared! +'+tix+' tickets');return}
  if(DEMO&&G.level>=MAXL){G.state='between';setTimeout(()=>window.demoEnd&&window.demoEnd('You finished all 5 demo levels of <b>Coffeebreak Ring Toss</b>! The full game has 30 levels, endless mode, a high-score table and a prize shelf of plush toys.'),800);return}
  if(!DEMO&&G.level>=MAXL){G.state='win';return}
  G.state='between';say('Level clear! +'+tix+' tickets')}
function levelFail(){S.best=Math.max(S.best,G.score);pushHi();sv();G.state='fail';say(mode==='endless'?'Out of rings!':'Need '+goal+' pts — try again')}
function pushHi(){const name='You',sc=G.score;S.hi.push({n:name,s:sc,d:Date.now()});S.hi.sort((a,b)=>b.s-a.s);S.hi=S.hi.slice(0,10);sv()}
function nextLevel(){makeLevel(G.level+1)}
function buyPrize(i){const P=PRIZES[i];if(S.won.includes(P[0])){say('You already have '+P[0]+'!');return}if((S.tickets||0)<P[2]){say('Need '+P[2]+' tickets');return}S.tickets-=P[2];S.won.push(P[0]);sv();say('Won the '+P[0]+'! '+P[1]);ringer();burst(450,300,'#ffe066',30)}
function update(dt){if(msgT>0)msgT-=dt;if(flash>0)flash-=dt;
  parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);
  pops.forEach(p=>{p.y-=50*dt;p.l-=dt});pops=pops.filter(p=>p.l>0);
  if(G.state!=='play')return;
  cones.forEach(c=>{c.ph+=dt;c.wob=Math.max(0,c.wob-dt*3);
    if(c.vx&&!c.ringed){c.x+=c.vx*dt;if(c.x<340||c.x>860)c.vx*=-1;c.x=Math.max(340,Math.min(860,c.x))}
    if(c.bob&&!c.ringed){c.y=c.by+Math.sin(c.ph*2)*c.bob*.15}});
  if(!ring)return;const b=ring;b.life+=dt;b.vy+=GR*dt;b.vx*=(1-0.15*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.spin*dt;b.z=Math.max(.35,1-b.life*.35);
  if(Math.random()<.4)parts.push({x:b.x,y:b.y,vx:0,vy:0,l:.25,col:'#ffcf6a'});
  // bounce off stall counter / floor
  if(b.y>520){b.y=520;b.vy*=-.25;b.vx*=.7;b.hits++;clank();if(Math.abs(b.vy)<40||b.hits>3){endShot(false);return}}
  if(b.x>W+40||b.x<-40||b.life>6){endShot(false);return}
  // cone collisions
  for(const c of cones){if(c.ringed)continue;
    const dx=b.x-c.x,dy=b.y-(c.y-c.r*2.2),dist=Math.hypot(dx,dy),need=c.r+10*b.z;
    if(dist<need){
      // top-down ringer: coming from above with low horizontal speed relative to cone tip
      const overTop=b.y<c.y-c.r*1.2&&Math.abs(dx)<c.r*.85&&b.vy>0&&Math.abs(b.vx)<220;
      if(overTop){c.ringed=true;c.wob=1;const pts=conePts(c)*(1+Math.min(4,combo)*.25)|0;combo++;lvScore+=pts;G.score+=pts;tickets+=Math.max(1,Math.floor(pts/15));S.tickets=(S.tickets||0)+Math.max(1,Math.floor(pts/15));
        pops.push({x:c.x,y:c.y-50,s:'+'+pts+(combo>1?' 🔥x'+combo:''),l:1.3});say((combo>1?'COMBO! ':'')+'RINGER! '+COLS[c.ci][0]+' '+c.kind);ringer();burst(c.x,c.y-30,c.col,22);flash=.2;sv();endShot(true);return}
      // bounce / glance
      const nx=dx/(dist||1),ny=dy/(dist||1);const vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=1.6*vn*nx;b.vy-=1.6*vn*ny}b.vx*=.75;b.vy*=.75;b.x=c.x+nx*(need+2);b.y=c.y-c.r*2.2+ny*(need+2);c.wob=1;clank();b.hits++;
      if(b.hits>4){endShot(false);return}
    }}
}
function down(p){if(G.state==='play'&&!ring&&ringsLeft>0&&Math.hypot(p.x-AX,p.y-AY)<100)drag=p}
function move(p){if(drag)drag=p}
function up(p){if(!drag)return;throwRing()}
function drawStallBG(){
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a3a5a');g.addColorStop(.45,'#3a1a4a');g.addColorStop(1,'#2a1020');x.fillStyle=g;x.fillRect(0,0,W,H);
  // carnival lights
  for(let i=0;i<18;i++){x.fillStyle=['#ff5a5a','#ffcf6a','#7ec8ff','#9be29b','#ff8fc8'][i%5];x.globalAlpha=.55+.45*Math.sin(t*4+i);x.beginPath();x.arc(30+i*50,28,7,0,7);x.fill()}x.globalAlpha=1;
  // striped awning
  for(let i=0;i<12;i++){x.fillStyle=i%2?'#e03a3a':'#fff8e8';x.beginPath();x.moveTo(i*80,-10);x.lineTo(i*80+80,-10);x.lineTo(i*80+60,90);x.lineTo(i*80-20,90);x.fill()}
  x.fillStyle='#5a3a20';x.fillRect(0,90,W,12);
  // stall floor / counter
  x.fillStyle='#6a4a2a';x.fillRect(0,520,W,80);x.fillStyle='#4a3018';x.fillRect(0,510,W,14);
  // bunting
  for(let i=0;i<10;i++){const bx=60+i*90,by=100+Math.sin(t*2+i)*.5;x.fillStyle=['#ff5fb0','#ffe066','#7ec8ff'][i%3];x.beginPath();x.moveTo(bx,by);x.lineTo(bx+18,by+28);x.lineTo(bx-18,by+28);x.fill()}
  // fairy dust
  x.fillStyle='#fff8';for(let i=0;i<30;i++)x.fillRect((i*97+t*20)%900,(i*53)%200+100,2,2);
}
function drawCone(c){
  x.save();x.translate(c.x,c.y);const wob=Math.sin(t*20)*c.wob*6;x.rotate(wob*.02);
  if(c.kind==='bottle'){
    x.fillStyle='#2a4a6a';x.beginPath();x.moveTo(-10,0);x.lineTo(10,0);x.lineTo(8,-50);x.lineTo(-8,-50);x.closePath();x.fill();
    x.fillStyle=c.col;x.fillRect(-7,-70,14,22);x.fillStyle='#c8e0ff';x.globalAlpha=.4;x.fillRect(-5,-66,5,14);x.globalAlpha=1;
    x.strokeStyle='#fff8';x.lineWidth=2;x.beginPath();x.ellipse(0,-72,9,4,0,0,7);x.stroke();
    if(c.ringed){x.strokeStyle='#ffcf6a';x.lineWidth=5;x.beginPath();x.ellipse(0,-40,16,6,0,0,7);x.stroke()}
  }else{
    // traffic cone
    x.fillStyle=c.col;x.beginPath();x.moveTo(0,-70);x.lineTo(22,0);x.lineTo(-22,0);x.closePath();x.fill();
    x.fillStyle='#fff';x.fillRect(-14,-38,28,8);x.fillRect(-10,-22,20,7);
    x.fillStyle='#333';x.fillRect(-26,0,52,8);
    if(c.ringed){x.strokeStyle='#ffcf6a';x.lineWidth=6;x.beginPath();x.ellipse(0,-28,20,7,0,0,7);x.stroke()}
  }
  // pts label
  if(!c.ringed){T(String(conePts(c)),0,-82,12,'#ffe066','center','')}
  x.restore();
}
function drawRingAt(X,Y,rot,sc,col){
  x.save();x.translate(X,Y);x.rotate(rot);x.scale(sc,sc*.55);
  x.strokeStyle=col||'#e8a0b0';x.lineWidth=7;x.beginPath();x.arc(0,0,18,0,7);x.stroke();
  x.strokeStyle='#fff6';x.lineWidth=2;x.beginPath();x.arc(0,0,18,-.8,.8);x.stroke();
  x.restore();
}
function drawAim(){
  if(ring||ringsLeft<=0)return;
  const bp=drag?{x:AX-pull().dx,y:AY-pull().dy}:{x:AX,y:AY};
  x.strokeStyle='#e8a0b088';x.lineWidth=3;x.setLineDash([6,4]);x.beginPath();x.moveTo(AX,AY);x.lineTo(bp.x,bp.y);x.stroke();x.setLineDash([]);
  drawRingAt(bp.x,bp.y,0,1,'#ffcf6a');
  // throw pad
  x.fillStyle='#3a1424';rr(AX-50,AY-20,100,50,12);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke();
  T('🎯 FLICK',AX,AY+12,14,'#ffe9c7','center','');
  if(drag){const p=pull(),k=6.4;let px=AX,py=AY,vx=p.dx*k,vy=p.dy*k;x.fillStyle='rgba(255,207,106,.75)';
    for(let i=0;i<18;i++){for(let j=0;j<3;j++){vy+=GR*.01;vx*=(1-0.15*.01);px+=vx*.01;py+=vy*.01}x.beginPath();x.arc(px,py,3.5-i*.12,0,7);x.fill()}
    x.fillStyle='#3a1424';rr(30,300,18,150,6);x.fill();const pc=p.pw;x.fillStyle=pc>.8?'#ff5a5a':pc>.5?'#ffcf6a':'#7fd88a';rr(32,450-146*pc,14,146*pc,5);x.fill();T('POWER',39,292,11,'#ffe9c7','center','')}
}
function drawMenu(){
  drawStallBG();
  T('🎪 Coffeebreak Ring Toss',450,120,42,'#ffe066','center');
  T('Fairground stall · flick rings onto cones',450,160,18,'#ff8fc8','center','italic ');
  T('Best score '+S.best+'  ·  Tickets '+ (S.tickets||0)+'  ·  Levels cleared '+(S.cleared||0),450,195,15,'#fff','center','');
  x.fillStyle='#ddd';x.font='15px Georgia';x.textAlign='center';
  wrapT('Drag back from the throw pad and release to flick a ring. Land it over a cone for a RINGER! Farther and rarer colours score more. Win tickets for plush prizes.',450,230,640,22);
  button('play',300,330,300,54,'🎯 Play levels',startLevels,{fs:20,bg:'#5a1a2a'});
  button('end',300,400,300,48,DEMO?'🔒 Endless (full game)':'∞ Endless mode',startEndless,{fs:17,bg:DEMO?'#222':'#1a3a5a',ac:DEMO?'#666':'#8ac'});
  button('prize',300,460,145,44,'🎁 Prizes',()=>{G.state='prizes'},{fs:15});
  button('hi',455,460,145,44,'🏆 Scores',()=>{G.state='scores'},{fs:15});
  ent();
}
function drawPrizes(){
  drawStallBG();x.fillStyle='#000a';x.fillRect(0,0,W,H);
  T('🎁 Prize Shelf',450,50,34,'#ffe066','center');T('Tickets: '+(S.tickets||0),450,85,18,'#fff','center','');
  PRIZES.forEach((P,i)=>{const cx=70+(i%5)*160,cy=120+Math.floor(i/5)*170,own=S.won.includes(P[0]);
    x.fillStyle=own?'#3a5a2a':'#24101a';rr(cx,cy,140,150,12);x.fill();x.strokeStyle=own?'#9be29b':'#e8a0b0';x.lineWidth=2;x.stroke();
    emo(P[1],cx+70,cy+50,48);T(P[0],cx+70,cy+95,14,'#ffe9c7','center');
    button('pz'+i,cx+15,cy+108,110,30,own?'✓ Owned':P[2]+' 🎟',()=>buyPrize(i),{fs:13,dis:own,bg:own?'#2a4a2a':'#5a1a2a'})});
  button('bk',350,540,200,40,'← Back',()=>{G.state='menu'},{fs:15});
}
function drawScores(){
  drawStallBG();x.fillStyle='#000a';x.fillRect(0,0,W,H);
  T('🏆 High Scores',450,60,34,'#ffe066','center');
  if(!S.hi.length)T('No scores yet — go ring some cones!',450,200,18,'#fff','center','');
  S.hi.forEach((h,i)=>{T((i+1)+'.  '+h.s+' pts',450,120+i*36,20,i===0?'#ffe066':'#ffe9c7','center')});
  button('bk',350,540,200,40,'← Back',()=>{G.state='menu'},{fs:15});
}
function draw(){
  if(G.state==='menu'){drawMenu();return}
  if(G.state==='prizes'){drawPrizes();return}
  if(G.state==='scores'){drawScores();return}
  drawStallBG();
  // sort cones by y for depth
  [...cones].sort((a,b)=>a.y-b.y).forEach(drawCone);
  drawAim();
  if(ring)drawRingAt(ring.x,ring.y,ring.rot,ring.z,ring.hits?'#ff8a8a':'#e8a0b0');
  parts.forEach(p=>{x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.col;x.fillRect(p.x-2,p.y-2,4,4)});x.globalAlpha=1;
  pops.forEach(p=>{x.globalAlpha=Math.min(1,p.l);T(p.s,p.x,p.y,18,'#ffe066','center')});x.globalAlpha=1;
  if(flash>0){x.fillStyle='rgba(255,255,200,'+flash+')';x.fillRect(0,0,W,H)}
  // HUD
  T('Lv '+G.level+(mode==='endless'?' ∞':'')+'   Score '+G.score+(combo>1?'  🔥x'+combo:''),20,40,18,'#ffe9c7');
  T('Goal '+lvScore+' / '+goal+'   Rings '+ringsLeft+'   🎟 '+(S.tickets||0),20,64,14,'#ffcf6a');
  x.fillStyle='#3a1424';rr(20,74,220,8,4);x.fill();x.fillStyle='#e8a0b0';rr(20,74,220*Math.min(1,lvScore/Math.max(1,goal)),8,4);x.fill();
  if(msgT>0){x.globalAlpha=Math.min(1,msgT);T(msg,450,110,22,'#ffe066','center');x.globalAlpha=1}
  button('q',800,16,80,30,'☰ Menu',()=>{G.state='menu'},{fs:13});
  if(G.state==='between'){
    x.fillStyle='#000b';rr(180,160,540,260,16);x.fill();x.strokeStyle='#ffe066';x.lineWidth=2;x.stroke();
    T('🎉 Level '+G.level+' clear!',450,210,32,'#ffe066','center');
    T('Score '+G.score+'  ·  Tickets '+(S.tickets||0),450,255,18,'#fff','center');
    button('nx',220,300,220,50,'▶ Next level',nextLevel,{fs:17,bg:'#5a1a2a'});
    button('pr',480,300,200,50,'🎁 Prize shelf',()=>{G.state='prizes'},{fs:15});
  }
  if(G.state==='fail'){
    x.fillStyle='#000b';rr(180,160,540,260,16);x.fill();x.strokeStyle='#ff8fa0';x.lineWidth=2;x.stroke();
    T(mode==='endless'?'Out of rings!':'Not enough points',450,210,28,'#ff8fa0','center');
    T('Score '+G.score+'  ·  Best '+S.best,450,255,18,'#fff','center');
    if(mode==='endless')button('ag',300,310,300,50,'↻ Try endless again',startEndless,{fs:16});
    else{button('re',220,300,220,50,'↻ Retry level',()=>makeLevel(G.level),{fs:16});button('mn',480,300,200,50,'☰ Menu',()=>{G.state='menu'},{fs:15})}
  }
  if(G.state==='win'){
    x.fillStyle='#000b';rr(160,140,580,300,16);x.fill();x.strokeStyle='#ffe066';x.lineWidth=2;x.stroke();
    T('🏆 Fairground Champion!',450,200,34,'#ffe066','center');
    T('You cleared all 30 levels! Score '+G.score,450,250,18,'#fff','center');
    button('end2',220,310,220,50,'∞ Endless',startEndless,{fs:16});
    button('pr2',480,310,200,50,'🎁 Prizes',()=>{G.state='prizes'},{fs:15});
  }
}
bindInput({down,move,up});startLoop();
window.RT={makeLevel,startLevels,G,get cones(){return cones},get ringsLeft(){return ringsLeft},get lvScore(){return lvScore}};
