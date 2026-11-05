const AFF=["I am abundant","Love flows to me","My music is heard","I am worthy","Money comes easily","My dreams are real","I attract kindness","I am healthy and strong","My art finds its people","Joy is my home","I am enough","Success follows me","My heart is open","I shine my light","Good things are coming","I am grateful","My songs reach millions","I am safe and loved","Opportunities find me","I trust the timing"];
const c=document.getElementById('c'),x=c.getContext('2d'),W=c.width,H=c.height,$=i=>document.getElementById(i);
const girl=new Image();girl.src='img/girl.png';
const HS='teamTagIt_hs';let hs=JSON.parse(localStorage.getItem(HS)||'[]'),vb=JSON.parse(localStorage.getItem('teamTagIt_vb')||'[]');
let P,team,wishes,clouds,lv,score,got,need,time,run=false,keys={},touch=null,last,parts=[];
const TC=['#ff6fb5','#ff9ac8','#d94b9c','#ffb3d6'],TN=['Bee','Mocha','Lulu','Rosie'];
let ac;function snd(f,d=.1){if(!$('snd').checked)return;ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.06,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);}
function rnd(a,b){return a+Math.random()*(b-a)}
function wish(){return{x:rnd(60,W-60),y:rnd(60,H-60),t:AFF[Math.floor(Math.random()*AFF.length)],ph:rnd(0,6),vx:rnd(-.4,.4),vy:rnd(-.4,.4)}}
function level(n){lv=n;need=4+n*2;got=0;time=40+n*5;P={x:W/2,y:H/2,boost:0,slow:0};
 team=TN.slice(0,Math.min(4,1+Math.ceil(n/1.5))).map((nm,i)=>({nm,x:rnd(80,W-80),y:rnd(80,H-80),c:TC[i],boost:0,cd:0,tx:0,ty:0}));
 wishes=Array.from({length:5},wish);clouds=Array.from({length:1+n},()=>({x:rnd(0,W),y:rnd(0,H),vx:rnd(-1,1)*(0.6+n*.15),vy:rnd(-1,1)*(0.6+n*.15),r:rnd(30,45)}));
 $('lv').textContent=n;$('wn').textContent=need;upd();}
function upd(){$('sc').textContent=score;$('wc').textContent=got;$('tm').textContent=Math.ceil(time);}
function start(){score=0;level(1);$('ov').style.display='none';run=true;last=performance.now();requestAnimationFrame(loop);}
function manifest(w,byTeam){score+=byTeam?5:10*(P.boost>0?2:1);got++;vb.push(w.t);vb=vb.slice(-40);localStorage.setItem('teamTagIt_vb',JSON.stringify(vb));drawVB();snd(660+got*30,.25);
 for(let i=0;i<14;i++)parts.push({x:w.x,y:w.y,vx:rnd(-3,3),vy:rnd(-3,3),l:40});Object.assign(w,wish());}
function loop(now){if(!run)return;const dt=Math.min(50,now-last)/16.7;last=now;time-=dt/60;
 let dx=(keys.ArrowRight||keys.d?1:0)-(keys.ArrowLeft||keys.a?1:0),dy=(keys.ArrowDown||keys.s?1:0)-(keys.ArrowUp||keys.w?1:0);
 if(touch){dx=touch.x-P.x;dy=touch.y-P.y;if(Math.hypot(dx,dy)<8)dx=dy=0;}
 const m=Math.hypot(dx,dy)||1,sp=4*(P.boost>0?1.7:1)*(P.slow>0?.45:1);P.x=Math.max(20,Math.min(W-20,P.x+dx/m*sp*dt*(dx||dy?1:0)));P.y=Math.max(20,Math.min(H-20,P.y+dy/m*sp*dt*(dx||dy?1:0)));
 P.boost-=dt/60;P.slow-=dt/60;
 wishes.forEach(w=>{w.x+=w.vx*dt;w.y+=w.vy*dt;if(w.x<40||w.x>W-40)w.vx*=-1;if(w.y<40||w.y>H-40)w.vy*=-1;if(Math.hypot(w.x-P.x,w.y-P.y)<36)manifest(w,0);});
 clouds.forEach(k=>{k.x+=k.vx*dt;k.y+=k.vy*dt;if(k.x<-50)k.x=W+50;if(k.x>W+50)k.x=-50;if(k.y<-50)k.y=H+50;if(k.y>H+50)k.y=-50;if(Math.hypot(k.x-P.x,k.y-P.y)<k.r+12&&P.slow<=0&&P.boost<=0){P.slow=2;snd(160,.3);}});
 team.forEach(t=>{t.cd-=dt/60;t.boost-=dt/60;let tg=wishes.reduce((a,w)=>Math.hypot(w.x-t.x,w.y-t.y)<Math.hypot(a.x-t.x,a.y-t.y)?w:a);let ex=tg.x-t.x,ey=tg.y-t.y,d=Math.hypot(ex,ey)||1,s=(t.boost>0?2.6:1.3);t.x+=ex/d*s*dt;t.y+=ey/d*s*dt;
  if(d<30&&Math.random()<.006*dt)manifest(tg,1);
  if(Math.hypot(t.x-P.x,t.y-P.y)<34&&t.cd<=0){t.cd=3;t.boost=4;P.boost=4;score+=3;snd(880,.15);snd(1100,.2);}});
 parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.l--});parts=parts.filter(p=>p.l>0);
 if(got>=need){run=false;score+=Math.ceil(time)*2;upd();over(`Level ${lv} manifested. Your team brought ${need} wishes to life.`,'Next level',()=>{level(lv+1);$('ov').style.display='none';run=true;last=performance.now();requestAnimationFrame(loop);});return;}
 if(time<=0){run=false;save();over(`Time is up. You manifested ${score} points of good energy. Every wish still counts.`,'Play again',start);return;}
 upd();draw(now);requestAnimationFrame(loop);}
function draw(t){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffd1e8');g.addColorStop(1,'#ffeaf4');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<30;i++){x.beginPath();x.arc((i*137+t/40)%W,(i*71)%H,2+i%3,0,7);x.fill();}
 x.globalAlpha=.08;x.fillStyle='#e0117a';x.font='bold 40px Georgia';x.fillText('COFFEEBREAK',W/2-150,H/2);x.globalAlpha=1;
 wishes.forEach(w=>{const r=24+Math.sin(t/300+w.ph)*4,gr=x.createRadialGradient(w.x,w.y,2,w.x,w.y,r*1.8);gr.addColorStop(0,'#fff');gr.addColorStop(.4,'#ff9ac8');gr.addColorStop(1,'rgba(255,154,200,0)');x.fillStyle=gr;x.beginPath();x.arc(w.x,w.y,r*1.8,0,7);x.fill();
  x.fillStyle='#b0005e';x.font='bold 13px Georgia';x.textAlign='center';x.fillText(w.t,w.x,w.y-r-6);x.fillText('\u2726',w.x,w.y+5);});
 clouds.forEach(k=>{x.fillStyle='rgba(120,120,130,.75)';[[0,0,1],[-.6,.2,.7],[.6,.2,.7],[0,-.4,.6]].forEach(([a,b,s])=>{x.beginPath();x.arc(k.x+a*k.r,k.y+b*k.r,k.r*s,0,7);x.fill();});x.fillStyle='#fff';x.font='12px Georgia';x.fillText('doubt',k.x,k.y+4);});
 team.forEach(m=>{if(m.boost>0){x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.arc(m.x,m.y,24,0,7);x.stroke();}x.fillStyle=m.c;x.beginPath();x.arc(m.x,m.y,16,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(m.x-5,m.y-3,3,0,7);x.arc(m.x+5,m.y-3,3,0,7);x.fill();x.fillStyle='#7a1048';x.font='11px Georgia';x.fillText(m.nm,m.x,m.y+30);});
 if(P.boost>0){x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(P.x,P.y,40,0,7);x.fill();}
 x.globalAlpha=P.slow>0?.55:1;if(girl.complete)x.drawImage(girl,P.x-32,P.y-40,64,64*girl.height/girl.width);x.globalAlpha=1;
 parts.forEach(p=>{x.fillStyle=`rgba(255,79,163,${p.l/40})`;x.fillRect(p.x,p.y,4,4);});x.textAlign='left';
 if(P.boost>0){x.fillStyle='#e0117a';x.font='bold 16px Georgia';x.fillText('Team boost',12,24);}if(P.slow>0){x.fillStyle='#666';x.font='bold 16px Georgia';x.fillText('Doubt is slowing you, keep going',12,46);}}
function save(){const n=(prompt('Name for the high scores','Coffeebreak')||'Guest').slice(0,16);hs.push({n,s:score,l:lv});hs.sort((a,b)=>b.s-a.s);hs=hs.slice(0,8);localStorage.setItem(HS,JSON.stringify(hs));}
function over(m,b,f){$('msg').innerHTML=m;$('play').textContent=b;$('play').onclick=f;showHS();$('ov').style.display='flex';}
function showHS(){$('hs').innerHTML=hs.map(h=>`<li>${h.n} - ${h.s} (level ${h.l})</li>`).join('')||'<li>No scores yet</li>';}
function drawVB(){$('vb').innerHTML=vb.map(a=>`<span>${a}</span>`).join('')||'<small>Empty for now</small>';}
addEventListener('keydown',e=>{keys[e.key.length==1?e.key.toLowerCase():e.key]=1;if(e.key.startsWith('Arrow'))e.preventDefault();});addEventListener('keyup',e=>{keys[e.key.length==1?e.key.toLowerCase():e.key]=0;});
function tp(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]:e;touch={x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height};e.preventDefault();}
c.addEventListener('touchstart',tp,{passive:false});c.addEventListener('touchmove',tp,{passive:false});c.addEventListener('touchend',()=>touch=null);
c.addEventListener('mousedown',e=>{tp(e);c.onmousemove=tp;});addEventListener('mouseup',()=>{touch=null;c.onmousemove=null;});
$('play').onclick=start;showHS();drawVB();girl.onload=()=>{level(1);draw(0);};
