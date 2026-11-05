const c=document.getElementById('c'),x=c.getContext('2d'),$=id=>document.getElementById(id);
const music=$('music');let muted=localStorage.tmMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);
music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.tmMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
let state='title',level,score,lives,time,N,cs,grid,p,roses,snakes,exit,best=+localStorage.tmBest||0,last=0,inv=0;$('bs').textContent=best;
function gen(n){const g=[];for(let y=0;y<n;y++){g.push([]);for(let i=0;i<n;i++)g[y].push({v:0,w:[1,1,1,1]})}// N E S W
const st=[[0,0]];g[0][0].v=1;const D=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]];
while(st.length){const[a,b]=st[st.length-1];const o=D.filter(([dx,dy])=>g[b+dy]&&g[b+dy][a+dx]&&!g[b+dy][a+dx].v);
if(!o.length){st.pop();continue}const[dx,dy,w,ow]=o[Math.random()*o.length|0];g[b][a].w[w]=0;g[b+dy][a+dx].w[ow]=0;g[b+dy][a+dx].v=1;st.push([a+dx,b+dy])}
for(let k=0;k<n*n/8;k++){const a=1+Math.random()*(n-2)|0,b=1+Math.random()*(n-2)|0,d=Math.random()*4|0,[dx,dy,w,ow]=D[d];g[b][a].w[w]=0;g[b+dy][a+dx].w[ow]=0}return g}
function canMove(a,b,dx,dy){const w=dx==1?1:dx==-1?3:dy==1?2:0;return !grid[b][a].w[w]}
let cam={x:0,y:0},seen;
function newLevel(){N=Math.min(21+level*4,61);cs=56;grid=gen(N);p={x:0,y:0};exit={x:N-1,y:N-1};roses=[];seen=new Uint8Array(N*N);
for(let i=0;i<N*2+level*4;i++){const r={x:Math.random()*N|0,y:Math.random()*N|0};if(r.x+r.y>0)roses.push(r)}
snakes=[];const ns=Math.min(6+level*3,40);for(let i=0;i<ns;i++){let sx,sy;do{sx=Math.random()*N|0;sy=Math.random()*N|0}while(sx+sy<8);snakes.push({x:sx,y:sy,dx:1,dy:0,t:0,sp:Math.max(170,420-level*25)})}
time=90+N*4;cam.x=0;cam.y=0;explore()}
function explore(){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=p.x+dx,Y=p.y+dy;if(X>=0&&Y>=0&&X<N&&Y<N)seen[Y*N+X]=1}}
function start(){level=1;score=0;lives=3;newLevel();state='play'}
function move(dx,dy){startMusic();if(state!=='play'){start();return}if(canMove(p.x,p.y,dx,dy)){p.x+=dx;p.y+=dy;explore();check()}}
function check(){roses=roses.filter(r=>{if(r.x==p.x&&r.y==p.y){score+=10;return false}return true});
if(p.x==exit.x&&p.y==exit.y){score+=50+Math.ceil(time)*2;level++;newLevel()}
if(inv<=0&&snakes.some(s=>s.x==p.x&&s.y==p.y))hit()}
function hit(){lives--;inv=1.5;p={x:0,y:0};if(lives<=0)over()}
function over(){state='over';if(score>best){best=score;localStorage.tmBest=best}}
addEventListener('keydown',e=>{const m={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]}[e.key];
if(m){e.preventDefault();move(...m)}else if(e.key==' '||e.key=='Enter'){startMusic();if(state!=='play')start()}});
document.querySelectorAll('#ctl button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();move(...b.dataset.d.split(',').map(Number))}));
c.addEventListener('pointerdown',()=>{startMusic();if(state!=='play')start()});
function vine(x1,y1,x2,y2){x.strokeStyle='#1d2a1d';x.lineWidth=Math.max(3,cs/9);x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();
const L=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/L,uy=(y2-y1)/L,t=cs/7;x.fillStyle='#1d2a1d';for(let d=t;d<L;d+=t*1.6){const px=x1+ux*d,py=y1+uy*d,s=(d/t|0)%2?1:-1;
x.beginPath();x.moveTo(px-ux*t/2,py-uy*t/2);x.lineTo(px+ux*t/2,py+uy*t/2);x.lineTo(px-uy*t*s,py+ux*t*s);x.fill()}}
function rose(cx,cy,r){x.fillStyle='#3a5a3a';x.beginPath();x.ellipse(cx+r*.7,cy+r*.5,r*.5,r*.25,.6,0,7);x.fill();
x.fillStyle='#8a0f1c';x.strokeStyle='#000';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.stroke();
x.fillStyle='#4a050c';for(let i=0;i<3;i++){x.beginPath();x.arc(cx,cy,r*(.75-i*.22),i,i+4.2);x.stroke()}}
const HERO=new Image();HERO.src='assets/hero.png';
function mallow(cx,cy,s,blink){if(HERO.complete&&HERO.naturalWidth){const k=s*1.15/Math.max(HERO.width,HERO.height),W=HERO.width*k,H=HERO.height*k;if(blink)x.globalAlpha=.4;x.drawImage(HERO,cx-W/2,cy-H/2,W,H);x.globalAlpha=1;return}if(blink)x.globalAlpha=.4;// marshmallow body
x.fillStyle='#f6f1e7';x.strokeStyle='#000';x.lineWidth=2.5;x.beginPath();x.roundRect(cx-s*.42,cy-s*.4,s*.84,s*.8,s*.25);x.fill();x.stroke();
x.fillStyle='#ddd5c6';x.beginPath();x.ellipse(cx,cy-s*.3,s*.36,s*.08,0,0,7);x.fill();
// skull face
x.fillStyle='#000';for(const d of[-1,1]){x.beginPath();x.ellipse(cx+d*s*.15,cy-s*.04,s*.11,s*.13,0,0,7);x.fill()}
x.fillStyle='#fff';for(const d of[-1,1]){x.beginPath();x.arc(cx+d*s*.13,cy-s*.08,s*.035,0,7);x.fill()}
x.fillStyle='#000';x.beginPath();x.moveTo(cx,cy+s*.07);x.lineTo(cx-s*.04,cy+s*.14);x.lineTo(cx+s*.04,cy+s*.14);x.fill();
x.lineWidth=1.5;x.beginPath();x.moveTo(cx-s*.15,cy+s*.22);x.lineTo(cx+s*.15,cy+s*.22);for(let i=-2;i<=2;i++){x.moveTo(cx+i*s*.06,cy+s*.18);x.lineTo(cx+i*s*.06,cy+s*.26)}x.stroke();
x.fillStyle='#e8a0b0';for(const d of[-1,1]){x.beginPath();x.arc(cx+d*s*.3,cy+s*.12,s*.05,0,7);x.fill()}
rose(cx+s*.3,cy-s*.36,s*.14);x.globalAlpha=1}
function snake(cx,cy,s,t){x.shadowColor='#000';x.shadowBlur=s*.5;x.strokeStyle='rgba(0,0,0,.85)';x.lineWidth=s*.16;x.lineCap='round';x.beginPath();for(let i=0;i<=10;i++){const px=cx-s*.4+i*s*.08,py=cy+Math.sin(i*.9+t*6)*s*.15;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
x.fillStyle='#000';x.beginPath();x.ellipse(cx+s*.42,cy+Math.sin(9+t*6)*s*.15,s*.13,s*.1,0,0,7);x.fill();x.shadowBlur=0;x.fillStyle='#ff1a2e';x.fillRect(cx+s*.42,cy+Math.sin(9+t*6)*s*.15-s*.06,s*.06,s*.05);x.fillRect(cx+s*.5,cy+Math.sin(9+t*6)*s*.15-s*.06,s*.06,s*.05);x.lineCap='butt'}
function draw(t){x.fillStyle='#14100f';x.fillRect(0,0,c.width,c.height);
if(state!=='play'){x.fillStyle='#050203';x.fillRect(0,0,c.width,c.height);cs=60;for(let i=0;i<10;i++)vine(0,i*70,c.width,i*70+35);
const fl=Math.random()<.06?.35:1;mallow(315,215,170,0);const g=x.createRadialGradient(315,215,40,315,215,330);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.97*fl+.03)+')');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
for(let i=0;i<5;i++)rose(110+i*125,500,14);x.textAlign='center';x.fillStyle=fl<1?'#400':'#c0182a';x.shadowColor='#f00';x.shadowBlur=18;x.font='bold 40px Georgia';
x.fillText(state=='title'?'Coffeebreak: Midnight Maze':'You Were Caught',315,355);x.shadowBlur=0;x.fillStyle='#bbb';x.font='18px Georgia';
if(state=='over')x.fillText('Score '+score+'   Best '+best,315,392);else x.fillText('The lights are out. Something is in the thorns.',315,392);
x.fillText('Tap / press any arrow to '+(state=='title'?'enter the dark':'try again'),315,425);x.fillStyle='#888';x.font='italic 15px Georgia';x.fillText('Free to play · Enjoyed it? Tip Coffeebreak ♥ coffeebreaks.itch.io',315,460);return}
const h=cs/2,W=c.width,H=c.height,on=(gx,gy)=>gx*cs+cs>cam.x&&gx*cs<cam.x+W&&gy*cs+cs>cam.y&&gy*cs<cam.y+H;
x.save();x.translate(-Math.round(cam.x),-Math.round(cam.y));
if(on(exit.x,exit.y)){x.fillStyle='#5a0a12';x.fillRect(exit.x*cs+4,exit.y*cs+4,cs-8,cs-8);x.fillStyle='#000';x.font=(cs*.5|0)+'px Georgia';x.textAlign='center';x.fillText('⛩',exit.x*cs+h,exit.y*cs+h*1.35)}
const a0=Math.max(0,cam.x/cs|0),a1=Math.min(N-1,(cam.x+W)/cs|0),b0=Math.max(0,cam.y/cs|0),b1=Math.min(N-1,(cam.y+H)/cs|0);
for(let b=b0;b<=b1;b++)for(let a=a0;a<=a1;a++){const w=grid[b][a].w,X=a*cs,Y=b*cs;if(w[0])vine(X,Y,X+cs,Y);if(w[3])vine(X,Y,X,Y+cs);if(b==N-1&&w[2])vine(X,Y+cs,X+cs,Y+cs);if(a==N-1&&w[1])vine(X+cs,Y,X+cs,Y+cs)}
roses.forEach(r=>{if(on(r.x,r.y))rose(r.x*cs+h,r.y*cs+h,cs*.22)});snakes.forEach(s=>{if(on(s.x,s.y))snake(s.x*cs+h,s.y*cs+h,cs*.8,t)});
mallow(p.x*cs+h,p.y*cs+h,cs*1.0,inv>0&&(t*10|0)%2);x.restore();dark(t);
const M=Math.min(150,W*.26),k=M/N,mx=W-M-8,my=8;x.fillStyle='rgba(0,0,0,.75)';x.fillRect(mx-3,my-3,M+6,M+6);x.fillStyle='#3a3030';
for(let i=0;i<N*N;i++)if(seen[i])x.fillRect(mx+(i%N)*k,my+(i/N|0)*k,Math.ceil(k),Math.ceil(k));
x.fillStyle='#c0182a';x.fillRect(mx+exit.x*k-1,my+exit.y*k-1,k+3,k+3);x.fillStyle='#fff';x.fillRect(mx+p.x*k-1,my+p.y*k-1,k+3,k+3);
x.strokeStyle='#c0182a';x.lineWidth=1;x.strokeRect(mx+cam.x/cs*k,my+cam.y/cs*k,W/cs*k,H/cs*k)}
function loop(ts){const dt=Math.min(.1,(ts-last)/1000||0);last=ts;
if(state=='play'){const tx=Math.max(0,Math.min(N*cs-c.width,p.x*cs+cs/2-c.width/2)),ty=Math.max(0,Math.min(N*cs-c.height,p.y*cs+cs/2-c.height/2)),L=1-Math.pow(.001,dt);cam.x+=(tx-cam.x)*L;cam.y+=(ty-cam.y)*L;time-=dt;inv-=dt;if(time<=0){hit();time=90+N*4}
snakes.forEach(s=>{const dd=Math.abs(s.x-p.x)+Math.abs(s.y-p.y);s.hunt=dd<=6;s.t+=dt*1000*(s.hunt?1.35:1);if(s.t>s.sp){s.t=0;if(s.hunt){const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>canMove(s.x,s.y,...d));o.sort((A,B)=>(Math.abs(s.x+A[0]-p.x)+Math.abs(s.y+A[1]-p.y))-(Math.abs(s.x+B[0]-p.x)+Math.abs(s.y+B[1]-p.y)));if(o.length)[s.dx,s.dy]=Math.random()<.8?o[0]:o[Math.random()*o.length|0]}else if(Math.random()<.3||!canMove(s.x,s.y,s.dx,s.dy)){const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>canMove(s.x,s.y,...d));[s.dx,s.dy]=o[Math.random()*o.length|0]}
if(canMove(s.x,s.y,s.dx,s.dy)){s.x+=s.dx;s.y+=s.dy}}});if(state=='play')check()}
$('lv').textContent=level||1;$('sc').textContent=score||0;$('li').textContent=lives??3;$('tm').textContent=Math.ceil(time||0);$('bs').textContent=best;
fx(dt,ts/1000);draw(ts/1000);requestAnimationFrame(loop)}requestAnimationFrame(loop);

// ---- thriller layer: darkness, flicker, heartbeat, whispers ----
let flick=1,AC=null,hbT=0,whT=0,danger=0;
function dark(t){const W=c.width,H=c.height,px=p.x*cs+cs/2-cam.x,py=p.y*cs+cs/2-cam.y;if(Math.random()<.04)flick=.55+Math.random()*.3;else flick+=(1-flick)*.2;
const r=cs*2.6*flick,g=x.createRadialGradient(px,py,cs*.4,px,py,r);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.6,'rgba(5,0,2,.55)');g.addColorStop(1,'rgba(3,0,1,.985)');
x.fillStyle=g;x.fillRect(0,0,W,H);if(danger>0){x.fillStyle='rgba(120,0,10,'+(danger*.25*(.6+.4*Math.sin(t*9)))+')';x.fillRect(0,0,W,H)}
// red eyes glint through the dark when hunting
snakes.forEach(s=>{if(s.hunt){const ex=s.x*cs+cs/2-cam.x,ey=s.y*cs+cs/2-cam.y;if(ex>0&&ey>0&&ex<W&&ey<H&&Math.hypot(ex-px,ey-py)>r*.7){x.fillStyle='rgba(255,20,40,'+(.5+.5*Math.sin(t*5+s.x))+')';x.fillRect(ex-5,ey-2,3,3);x.fillRect(ex+3,ey-2,3,3)}}})}
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state=='suspended')AC.resume();return AC}
addEventListener('pointerdown',ac);addEventListener('keydown',ac);
function thump(v){const a=AC;if(!a||muted)return;[0,.16].forEach((d,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+d;o.frequency.setValueAtTime(60,t);o.frequency.exponentialRampToValueAtTime(35,t+.15);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*(i?.6:1),t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g).connect(a.destination);o.start(t);o.stop(t+.25)})}
function whisper(){const a=AC;if(!a||muted)return;const n=a.sampleRate*1.2,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n)*(.5+.5*Math.sin(i/a.sampleRate*38));
const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),pn=a.createStereoPanner?a.createStereoPanner():null;s.buffer=b;f.type='bandpass';f.frequency.value=1800+Math.random()*1500;f.Q.value=4;g.gain.value=.25;s.connect(f).connect(g);if(pn){pn.pan.value=Math.random()*2-1;g.connect(pn).connect(a.destination)}else g.connect(a.destination);s.start();
const o=a.createOscillator(),og=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(220,a.currentTime);o.frequency.linearRampToValueAtTime(233,a.currentTime+.8);og.gain.setValueAtTime(.05,a.currentTime);og.gain.exponentialRampToValueAtTime(.001,a.currentTime+.9);o.connect(og).connect(a.destination);o.start();o.stop(a.currentTime+1)}
function fx(dt,t){if(state!='play'){danger=0;return}let m=99;snakes.forEach(s=>m=Math.min(m,Math.abs(s.x-p.x)+Math.abs(s.y-p.y)));danger+=((m<=6?1-m/7:0)-danger)*.1;
music.volume=Math.max(.25,1-danger*.6);hbT-=dt;if(hbT<=0){hbT=1.3-danger*.85;thump(.25+danger*.6)}whT-=dt;if(m<=3&&whT<=0){whisper();whT=4+Math.random()*3}}
