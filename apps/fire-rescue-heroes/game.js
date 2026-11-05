const $=id=>document.getElementById(id);
// ---- Music playlist (shuffle, loop, mute, skip) ----
const music=$('music');let muted=localStorage.frMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0,started=false;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
load();music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.frMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- Game ----
const c=$('c'),x=c.getContext('2d'),T=40,W=c.width,H=c.height;
let best=+localStorage.frBest||0;$('bs').textContent=best;
let state='title',lvl,score,rescued,map,MW,MH,fire,people,hyd,collapse,p,cam,time,parts,msg,msgT;
const keys={},rnd=n=>Math.random()*n|0;
function gen(){
  MW=24+lvl*4;MH=18+lvl*3;map=[];fire=[];
  for(let y=0;y<MH;y++){map.push([]);fire.push([]);for(let xx=0;xx<MW;xx++){map[y].push(1);fire[y].push(0)}}
  // rooms on a grid joined by corridors
  const R=6,cols=Math.floor((MW-1)/R),rows=Math.floor((MH-1)/R),rooms=[];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const x0=i*R+1,y0=j*R+1;for(let y=y0;y<y0+R-1;y++)for(let xx=x0;xx<x0+R-1;xx++)map[y][xx]=0;rooms.push({x:x0+2,y:y0+2,i,j})}
  // spanning doors (random tree) + extras
  const seen=new Set(['0,0']),st=[[0,0]];
  while(st.length){const [i,j]=st[st.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[i+a,j+b]).filter(([a,b])=>a>=0&&b>=0&&a<cols&&b<rows&&!seen.has(a+','+b));
    if(!nb.length){st.pop();continue}const [a,b]=nb[rnd(nb.length)];door(i,j,a,b);seen.add(a+','+b);st.push([a,b])}
  for(let k=0;k<cols*rows/3;k++){const i=rnd(cols-1),j=rnd(rows);door(i,j,i+1,j)}
  function door(i,j,a,b){const cx=Math.min(i,a)*R+1,cy=Math.min(j,b)*R+1;if(a!==i){const y=cy+1+rnd(R-3);map[y][cx+R-1]=0}else{const xx=cx+1+rnd(R-3);map[cy+R-1][xx]=0}}
  p={x:2.5*T,y:2.5*T,dir:0,hp:100,water:100,carry:null,spray:false,inv:0};
  const exit={x:1,y:1};map[1][1]=3;// 3 = exit/ambulance
  const far=rooms.slice(1);people=[];hyd=[];collapse=[];
  const np=2+lvl;for(let k=0;k<np&&far.length;k++){const r=far.splice(rnd(far.length),1)[0];people.push({x:(r.x+rnd(2)-0.5)*T,y:(r.y+rnd(2)-0.5)*T,saved:false,hp:100,bob:Math.random()*6})}
  for(let k=0;k<2+(lvl>>1);k++){const r=rooms[rnd(rooms.length)];hyd.push({x:(r.x-1.5)*T+T/2,y:(r.y-1.5)*T+T/2})}
  hyd.push({x:3.5*T,y:1.5*T});
  for(let k=0;k<3+lvl*2;k++){const r=rooms[1+rnd(rooms.length-1)];fire[r.y+rnd(3)-1][r.x+rnd(3)-1]=1}
  time=60+lvl*15;parts=[];cam={x:0,y:0};flash('Level '+lvl+': rescue '+people.length+' people!');
}
function flash(s){msg=s;msgT=2.5}
function start(){lvl=1;score=0;rescued=0;state='play';gen();startMusic()}
function solid(px,py){const tx=Math.floor(px/T),ty=Math.floor(py/T);return tx<0||ty<0||tx>=MW||ty>=MH||map[ty][tx]===1||map[ty][tx]===2}
function tryMove(dx,dy){const r=12;if(!solid(p.x+dx+Math.sign(dx)*r,p.y-r+2)&&!solid(p.x+dx+Math.sign(dx)*r,p.y+r-2))p.x+=dx;if(!solid(p.x-r+2,p.y+dy+Math.sign(dy)*r)&&!solid(p.x+r-2,p.y+dy+Math.sign(dy)*r))p.y+=dy}
function pick(){if(state!=='play')return;if(p.carry){return}for(const q of people)if(!q.saved&&!q.carried&&Math.hypot(q.x-p.x,q.y-p.y)<40){q.carried=true;p.carry=q;flash('Got you! Head to the ambulance 🚑');return}}
let mouse=null,touchDir=null,touchSpray=false;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault();startMusic();
  if(state!=='play'&&(e.key===' '||e.key==='Enter')){start();return}if(e.key.toLowerCase()==='e')pick()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function cpos(e){const b=c.getBoundingClientRect();return{x:(e.clientX-b.left)*W/b.width,y:(e.clientY-b.top)*H/b.height}}
c.addEventListener('pointerdown',e=>{startMusic();if(state!=='play'){start();return}mouse=cpos(e);mouse.down=true});
c.addEventListener('pointermove',e=>{if(mouse&&mouse.down){const d=cpos(e);mouse.x=d.x;mouse.y=d.y}});
addEventListener('pointerup',()=>{if(mouse)mouse.down=false});
document.querySelectorAll('#pad button').forEach(b=>{const d=b.dataset.d.split(',').map(Number);
  b.addEventListener('pointerdown',e=>{e.preventDefault();startMusic();if(state!=='play')start();touchDir=d});b.addEventListener('pointerup',()=>touchDir=null);b.addEventListener('pointerleave',()=>touchDir=null)});
$('bSpray').addEventListener('pointerdown',e=>{e.preventDefault();startMusic();if(state!=='play')start();touchSpray=true});
$('bSpray').addEventListener('pointerup',()=>touchSpray=false);$('bSpray').addEventListener('pointerleave',()=>touchSpray=false);
$('bPick').addEventListener('pointerdown',e=>{e.preventDefault();startMusic();if(state!=='play')start();else pick()});
function hurt(n){if(p.inv>0)return;p.hp-=n;if(p.hp<=0)over()}
function over(){state='over';if(score>best){best=score;localStorage.frBest=best;$('bs').textContent=best}}
let acc=0;
function update(dt){
  if(msgT>0)msgT-=dt;if(state!=='play')return;
  time-=dt;if(time<=0){time=0;over();return}
  let dx=0,dy=0;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;
  if(touchDir){dx=touchDir[0];dy=touchDir[1]}
  const sp=(p.carry?120:170)*dt;if(dx||dy){const l=Math.hypot(dx,dy);tryMove(dx/l*sp,dy/l*sp);if(!(mouse&&mouse.down))p.dir=Math.atan2(dy,dx)}
  if(mouse&&mouse.down)p.dir=Math.atan2(mouse.y+cam.y-p.y,mouse.x+cam.x-p.x);
  p.spray=(keys[' ']||(mouse&&mouse.down)||touchSpray)&&p.water>0;
  if(p.inv>0)p.inv-=dt;
  // hydrants
  for(const h of hyd)if(Math.hypot(h.x-p.x,h.y-p.y)<46&&p.water<100){p.water=Math.min(100,p.water+60*dt);if(Math.random()<.3)parts.push({x:h.x,y:h.y,vx:(Math.random()-.5)*60,vy:-60,l:.4,w:1})}
  if(p.spray){p.water-=18*dt;for(let k=0;k<4;k++){const a=p.dir+(Math.random()-.5)*.35,v=320+Math.random()*80;parts.push({x:p.x+Math.cos(p.dir)*18,y:p.y+Math.sin(p.dir)*18,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.45,w:1})}}
  // particles
  for(const q of parts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;if(q.w){const tx=Math.floor(q.x/T),ty=Math.floor(q.y/T);if(tx>=0&&ty>=0&&tx<MW&&ty<MH){if(map[ty][tx]===1)q.l=0;else if(fire[ty][tx]>0){fire[ty][tx]-=dt*4;if(fire[ty][tx]<=0){fire[ty][tx]=0;score+=10;parts.push({x:q.x,y:q.y,vx:0,vy:-30,l:1,s:1})}}}}}
  parts=parts.filter(q=>q.l>0);
  // fire spread
  acc+=dt;if(acc>.5){acc=0;const rate=.035+lvl*.012;
    for(let y=1;y<MH-1;y++)for(let xx=1;xx<MW-1;xx++){const f=fire[y][xx];if(f>0){fire[y][xx]=Math.min(1.5,f+.05);
      if(Math.random()<rate*f){const [a,b]=[[1,0],[-1,0],[0,1],[0,-1]][rnd(4)];if(map[y+b][xx+a]===0&&fire[y+b][xx+a]===0)fire[y+b][xx+a]=.3}
      if(f>1.3&&Math.random()<.004*lvl&&!collapse.some(k=>k.x===xx&&k.y===y))collapse.push({x:xx,y,t:2.5})}}}
  // collapse
  for(const k of collapse){k.t-=dt;if(k.t<=0&&!k.done){k.done=true;map[k.y][k.x]=2;fire[k.y][k.x]=0;if(Math.floor(p.x/T)===k.x&&Math.floor(p.y/T)===k.y){hurt(35);p.inv=1;tryMove(T,0);if(solid(p.x,p.y)){p.x=2.5*T;p.y=2.5*T}}flash('Ceiling collapsed!')}}
  // fire / smoke damage
  const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);if(fire[ty]&&fire[ty][tx]>.2)hurt(30*dt);
  let smoke=0;for(let y=ty-2;y<=ty+2;y++)for(let xx=tx-2;xx<=tx+2;xx++)if(fire[y]&&fire[y][xx]>.8)smoke++;if(smoke>4)hurt((smoke-4)*1.5*dt);
  // people
  for(const q of people){if(q.saved)continue;if(q.carried){q.x=p.x;q.y=p.y-20}else{const qx=Math.floor(q.x/T),qy=Math.floor(q.y/T);if(fire[qy][qx]>.5)q.hp-=6*dt;if(q.hp<=0){q.saved=true;q.lost=true;flash('Oh no... someone was lost')}}}
  if(p.carry&&tx<=2&&ty<=2){p.carry.saved=true;p.carry.carried=false;p.carry=null;rescued++;score+=250+Math.round(time)*2;p.hp=Math.min(100,p.hp+15);flash('Rescued! ⭐ +250')}
  if(people.every(q=>q.saved)){if(people.some(q=>!q.lost)||true){score+=Math.round(time)*5;lvl++;gen()}}
  cam.x=Math.max(0,Math.min(MW*T-W,p.x-W/2));cam.y=Math.max(0,Math.min(MH*T-H,p.y-H/2));
  $('lv').textContent=lvl;$('sc').textContent=score;$('rs').textContent=rescued;$('tm').textContent=Math.ceil(time);
}
// ---- drawing (cute chibi style in code) ----
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function firefighter(X,Y,dir,t){x.save();x.translate(X,Y);
  x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(0,16,14,5,0,0,7);x.fill();
  const bob=Math.sin(t*12)*1.5;
  x.fillStyle='#d62828';rr(-11,-2+bob,22,18,7);x.fill();x.fillStyle='#ffd23f';x.fillRect(-11,8+bob,22,3);
  x.fillStyle='#ffe0bd';x.beginPath();x.arc(0,-10+bob,11,0,7);x.fill();
  x.fillStyle='#222';x.beginPath();x.arc(-4,-9+bob,2,0,7);x.arc(4,-9+bob,2,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.arc(-3.4,-9.6+bob,.7,0,7);x.arc(4.6,-9.6+bob,.7,0,7);x.fill();
  x.fillStyle='#ff8fa3';x.beginPath();x.arc(-7,-6+bob,2,0,7);x.arc(7,-6+bob,2,0,7);x.fill();
  x.fillStyle='#c1121f';x.beginPath();x.ellipse(0,-17+bob,15,6,0,Math.PI,0);x.fill();x.beginPath();x.arc(0,-17+bob,10,Math.PI,0);x.fill();
  x.fillStyle='#ffd23f';x.beginPath();x.arc(0,-22+bob,3.5,0,7);x.fill();
  x.rotate(dir);x.fillStyle='#555';x.fillRect(8,2,16,5);x.fillStyle='#ffd23f';x.fillRect(22,1,5,7);x.restore()}
function person(q,t){x.save();x.translate(q.x,q.y+(q.carried?0:Math.sin(t*4+q.bob)*2));
  const cols=['#4ea8de','#9b5de5','#00bb77','#f15bb5'],cl=cols[(q.bob*10|0)%4];
  x.fillStyle=cl;rr(-9,0,18,14,6);x.fill();x.fillStyle='#f6d1a6';x.beginPath();x.arc(0,-8,10,0,7);x.fill();
  x.fillStyle='#6b3e26';x.beginPath();x.arc(0,-11,10,Math.PI,0);x.fill();
  x.fillStyle='#222';x.beginPath();x.arc(-3.5,-7,1.8,0,7);x.arc(3.5,-7,1.8,0,7);x.fill();
  x.strokeStyle='#222';x.lineWidth=1.5;x.beginPath();if(q.carried)x.arc(0,-3,3,0,Math.PI);else x.arc(0,-1,3,Math.PI,0);x.stroke();
  if(!q.carried){x.fillStyle='#fff';rr(-22,-42,44,18,8);x.fill();x.fillStyle='#d62828';x.font='bold 11px Verdana';x.textAlign='center';x.fillText('HELP!',0,-29);
    x.fillStyle='#d62828';x.fillRect(-14,-24,28,3);x.fillStyle='#3c3';x.fillRect(-14,-24,28*q.hp/100,3)}
  x.restore()}
function draw(t){
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  if(state==='title'){title(t);return}
  x.save();x.translate(-cam.x|0,-cam.y|0);
  const x0=Math.floor(cam.x/T),y0=Math.floor(cam.y/T);
  for(let y=y0;y<=y0+H/T+1&&y<MH;y++)for(let xx=x0;xx<=x0+W/T+1&&xx<MW;xx++){const v=map[y][xx],X=xx*T,Y=y*T;
    if(v===1){x.fillStyle='#5a3d31';x.fillRect(X,Y,T,T);x.fillStyle='#7a5444';x.fillRect(X+2,Y+2,T/2-3,T/2-3);x.fillRect(X+T/2+1,Y+T/2+1,T/2-3,T/2-3)}
    else if(v===2){x.fillStyle='#8a8079';x.fillRect(X,Y,T,T);x.fillStyle='#5c534d';for(let k=0;k<4;k++){x.beginPath();x.arc(X+8+k*8,Y+10+(k%2)*16,7,0,7);x.fill()}}
    else{x.fillStyle=(xx+y)%2?'#e9d8b4':'#e0cca4';x.fillRect(X,Y,T,T);
      const f=fire[y][xx];if(f>0){const s=Math.min(1,f)*T*.5;for(let k=0;k<3;k++){const fl=Math.sin(t*10+xx*3+y+k*2)*4;
        x.fillStyle=['#ff3b1f','#ff8c1a','#ffe14d'][k];x.beginPath();x.ellipse(X+T/2,Y+T/2+6-k*3,s*(1-k*.25),Math.max(1,s*(1.3-k*.3)+fl),0,0,7);x.fill()}}}}
  // ambulance at exit
  x.fillStyle='#fff';rr(T*.6,T*.6,T*1.8,T*1.2,8);x.fill();x.fillStyle='#d62828';x.fillRect(T*1.3,T*.85,T*.4,T*.7);x.fillRect(T*1.15,T*1.0,T*.7,T*.4);
  x.fillStyle=Math.sin(t*8)>0?'#38f':'#f33';x.fillRect(T*1.2,T*.5,T*.6,6);x.fillStyle='#222';x.font='bold 10px Verdana';x.textAlign='center';x.fillText('EXIT',T*1.5,T*2.1);
  for(const h of hyd){x.fillStyle='#d62828';rr(h.x-8,h.y-12,16,24,5);x.fill();x.fillStyle='#ffd23f';x.fillRect(h.x-11,h.y-3,22,5);x.beginPath();x.arc(h.x,h.y-12,7,Math.PI,0);x.fill()}
  for(const k of collapse)if(!k.done){x.strokeStyle=Math.sin(t*20)>0?'#ff0':'#000';x.lineWidth=3;x.setLineDash([6,4]);x.strokeRect(k.x*T+3,k.y*T+3,T-6,T-6);x.setLineDash([]);x.fillStyle='rgba(255,255,0,.25)';x.fillRect(k.x*T,k.y*T,T,T)}
  for(const q of people)if(!q.saved&&!q.carried)person(q,t);
  for(const q of parts){if(q.s){x.fillStyle=`rgba(200,200,200,${q.l*.5})`;x.beginPath();x.arc(q.x,q.y,10*(2-q.l),0,7);x.fill()}else{x.fillStyle=`rgba(80,170,255,${q.l*2})`;x.beginPath();x.arc(q.x,q.y,3.5,0,7);x.fill()}}
  if(!(p.inv>0&&Math.sin(t*30)>0))firefighter(p.x,p.y,p.dir,t);if(p.carry)person(p.carry,t);
  // smoke clouds
  for(let y=y0;y<=y0+H/T+1&&y<MH;y++)for(let xx=x0;xx<=x0+W/T+1&&xx<MW;xx++)if(fire[y][xx]>.9){x.fillStyle='rgba(60,55,55,.28)';x.beginPath();x.arc(xx*T+T/2+Math.sin(t+xx)*8,y*T-6+Math.cos(t+y)*6,26,0,7);x.fill()}
  x.restore();
  // HUD bars
  bar(10,10,'❤️',p.hp,'#e63946');bar(10,34,'💧',p.water,'#3a86ff');
  if(p.water<=0){x.fillStyle='#fff';x.font='bold 14px Verdana';x.textAlign='left';x.fillText('Tank empty! Find a hydrant',10,72)}
  x.fillStyle='rgba(0,0,0,.5)';rr(W-210,8,200,24,8);x.fill();x.fillStyle='#fff';x.font='13px Verdana';x.textAlign='right';x.fillText('Trapped: '+people.filter(q=>!q.saved).length+'  ⏱ '+Math.ceil(time),W-18,25);
  minimap();
  if(msgT>0){x.fillStyle='rgba(0,0,0,.6)';rr(W/2-200,H-60,400,36,10);x.fill();x.fillStyle='#ffd23f';x.font='bold 17px Verdana';x.textAlign='center';x.fillText(msg,W/2,H-36)}
  if(state==='over'){x.fillStyle='rgba(0,0,0,.75)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ff5a3c';x.font='bold 52px Verdana';x.fillText('GAME OVER',W/2,H/2-60);
    x.fillStyle='#fff';x.font='22px Verdana';x.fillText('Score: '+score+'   Rescued: '+rescued+'   Level: '+lvl,W/2,H/2);x.fillText('Best: '+best,W/2,H/2+36);
    x.fillStyle='#ffd23f';x.fillText('Press Space or tap to try again',W/2,H/2+90)}
}
function bar(X,Y,ic,v,col){x.fillStyle='rgba(0,0,0,.5)';rr(X,Y,170,20,8);x.fill();x.fillStyle=col;rr(X+26,Y+4,Math.max(0,v)*1.38,12,5);x.fill();x.font='14px Verdana';x.textAlign='left';x.fillText(ic,X+4,Y+16)}
function minimap(){const s=Math.min(150/MW,110/MH),X=W-MW*s-10,Y=H-MH*s-10;x.fillStyle='rgba(0,0,0,.6)';x.fillRect(X-3,Y-3,MW*s+6,MH*s+6);
  for(let y=0;y<MH;y++)for(let xx=0;xx<MW;xx++){const v=map[y][xx];x.fillStyle=v?'#444':fire[y][xx]>0?'#f60':'#bba';x.fillRect(X+xx*s,Y+y*s,s+.5,s+.5)}
  x.fillStyle='#0f0';for(const q of people)if(!q.saved)x.fillRect(X+q.x/T*s-2,Y+q.y/T*s-2,4,4);x.fillStyle='#fff';x.fillRect(X+p.x/T*s-2,Y+p.y/T*s-2,5,5)}
function title(t){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2b0f0f');g.addColorStop(1,'#a3260f');x.fillStyle=g;x.fillRect(0,0,W,H);
  for(let k=0;k<14;k++){const fx=k*60+20,fl=Math.sin(t*6+k)*8;x.fillStyle='#ff8c1a';x.beginPath();x.ellipse(fx,H-10,26,Math.max(1,50+fl),0,0,7);x.fill();x.fillStyle='#ffe14d';x.beginPath();x.ellipse(fx,H,14,28+fl,0,0,7);x.fill()}
  x.textAlign='center';x.fillStyle='#ffd23f';x.font='bold 56px Verdana';x.fillText('FIRE RESCUE',W/2,120);x.fillStyle='#fff';x.font='bold 30px Verdana';x.fillText('HEROES',W/2,160);
  x.save();x.scale(3,3);firefighter(W/6-20,85,0,t);person({x:W/6+22,y:90,bob:1,hp:100,carried:true},t);x.restore();
  x.font='16px Verdana';x.fillStyle='#fff';
  ['Move: WASD / Arrows   Spray: Space / hold mouse   Pick up: E','Put out fires 🔥, carry people to the ambulance 🚑','Refill water at hydrants, avoid smoke and yellow collapse zones'].forEach((s,i)=>x.fillText(s,W/2,340+i*24));
  x.fillStyle='#ffd23f';x.font='bold 22px Verdana';x.fillText('Press Space or tap to start  •  Best: '+best,W/2,430)}
let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;update(dt);draw(n/1000);requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.G={get p(){return p},get people(){return people},get fire(){return fire},get state(){return state},get score(){return score},get rescued(){return rescued},start,pick,keys};
