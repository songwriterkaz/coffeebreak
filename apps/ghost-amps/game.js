const cv=document.getElementById('c'),x=cv.getContext('2d'),ui=document.getElementById('ui');
let W,H;function rs(){W=cv.width=innerWidth*devicePixelRatio;H=cv.height=innerHeight*devicePixelRatio}addEventListener('resize',rs);rs();
const KEYS=['d','f','j','k'],LANES=4;
const SONGS=[{n:'Spooky Shuffle',bpm:96,len:48},{n:'Haunted Hall Boogie',bpm:120,len:56},{n:'Midnight Overdrive',bpm:148,len:64}];
function cyrb(s,seed=7){let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return String(4294967296*(2097151&h2)+(h1>>>0))}
const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem('ghostamps_'+k))??d}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem('ghostamps_'+k,JSON.stringify(v))}catch(e){}}};
let gold=LS.get('gold',false),best=LS.get('best',[0,0,0]),unlocked=LS.get('unl',1);
const logo=new Image();logo.src='logo.png';
// audio
let A=null;function ac(){if(!A){A=new(window.AudioContext||window.webkitAudioContext)()}if(A.state==='suspended')A.resume();return A}
function tone(f,t,d,type='square',v=.08){const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function kick(t){const a=ac(),o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g).connect(a.destination);o.start(t);o.stop(t+.22)}
function hat(t){const a=ac(),b=a.createBuffer(1,a.sampleRate*.05,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='highpass';f.frequency.value=7000;g.gain.value=.05;s.buffer=b;s.connect(f).connect(g).connect(a.destination);s.start(t)}
const LN=[110,130.8,146.8,164.8];
function chord(l,big){const t=ac().currentTime,r=LN[l]*(big?1:2);[1,1.5,2].forEach(m=>tone(r*m,t,big?.6:.25,'sawtooth',big?.06:.04))}
const BASS=[55,55,65.4,49];
// state
let st="menu",song,lvl,ghosts=[],fx=[],score,combo,maxc,od,beat,nextBeat,t0,pressed=[0,0,0,0],hits,miss,last=0,shake=0;
function laneX(i){return W*(i+.5)/LANES}function hitY(){return H*.8}
function start(l){lvl=l;song=SONGS[l];ghosts=[];fx=[];score=0;combo=0;maxc=0;od=0;hits=0;miss=0;beat=0;ac();t0=ac().currentTime+.5;nextBeat=0;st='play';ui.className='h';
let seed=l*99+1;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const spb=60/song.bpm;sched=[];for(let b=4;b<song.len*2;b++){if(rnd()<.55+l*.12){sched.push({t:b*spb/2,l:Math.floor(rnd()*4),pc:rnd()<.12})}}}
let sched=[];
function tick(){const a=ac(),spb=60/song.bpm;while(t0+nextBeat*spb/2<a.currentTime+.1){const t=t0+nextBeat*spb/2;if(nextBeat%2==0)kick(t);hat(t);if(nextBeat%2==0)tone(BASS[(nextBeat>>3)%4],t,spb*.9,'triangle',.12);if(nextBeat%8==4)tone(BASS[(nextBeat>>3)%4]*4,t,.15,'square',.03);nextBeat++}}
const TRAVEL=2.0;
function hit(l){if(st!=='play')return;pressed[l]=.15;const now=ac().currentTime-t0;let bestG=null,bd=.18;for(const g of ghosts)if(g.l===l&&!g.dead){const d=Math.abs(g.t-now);if(d<bd){bd=d;bestG=g}}
if(bestG){bestG.dead=1;combo++;maxc=Math.max(maxc,combo);hits++;const mult=1+Math.floor(combo/10);const q=bd<.06?'Perfect':'Good';score+=(q=='Perfect'?100:50)*mult*(bestG.pc?3:1);od=Math.min(100,od+(bestG.pc?12:4));chord(l,bestG.pc);
fx.push({x:laneX(l),y:hitY(),t:0,txt:bestG.pc?'Power chord':q,c:bestG.pc?'#ffd84d':'#39ff88'})}else{combo=0;tone(80,ac().currentTime,.1,'square',.03)}}
function overdrive(){if(st!=='play'||od<100)return;od=0;shake=.4;const t=ac().currentTime;[1,1.26,1.5,2].forEach((m,i)=>tone(110*m,t+i*.03,1,'sawtooth',.06));
for(const g of ghosts)if(!g.dead&&g.spawned){g.dead=1;score+=150;hits++;combo++;fx.push({x:laneX(g.l),y:g.y,t:0,txt:'Boo',c:'#b14dff'})}maxc=Math.max(maxc,combo)}
function end(){st='over';if(score>best[lvl]){best[lvl]=score;LS.set('best',best)}const passed=hits/(hits+miss||1)>=.6;if(passed&&lvl+1>=unlocked&&lvl<2){unlocked=lvl+2;LS.set('unl',unlocked)}
menu(`<h1>${passed?'Stage cleared':'The ghosts won this round'}</h1><p>${song.n}<br>Score ${score} &middot; Best ${best[lvl]}<br>Max combo ${maxc} &middot; Hits ${hits} &middot; Missed ${miss}</p><button onclick="start(${lvl})">Play again</button>${passed&&lvl<2?`<button onclick="start(${lvl+1})">Next song</button>`:''}<button onclick="title()">Menu</button>`)}
function update(dt){if(st!=='play')return;tick();const now=ac().currentTime-t0;
while(sched.length&&sched[0].t-TRAVEL<=now){const s=sched.shift();ghosts.push({...s,spawned:1,ph:Math.random()*6})}
for(const g of ghosts){const p=1-(g.t-now)/TRAVEL;g.y=H*.05+p*(hitY()-H*.05);if(!g.dead&&now-g.t>.2){g.dead=2;combo=0;miss++}}
ghosts=ghosts.filter(g=>!(g.dead&&(g.dead==1||now-g.t>.6)));fx.forEach(f=>f.t+=dt);fx=fx.filter(f=>f.t<.8);pressed=pressed.map(p=>Math.max(0,p-dt));shake=Math.max(0,shake-dt);
if(!sched.length&&!ghosts.some(g=>!g.dead)&&ghosts.length==0)end()}
function ghost(gx,gy,r,ph,c,pc){x.save();x.translate(gx,gy+Math.sin(performance.now()/300+ph)*r*.1);x.shadowColor=c;x.shadowBlur=r;x.fillStyle=pc?'#fff3b0':'#f2eaff';
x.beginPath();x.arc(0,0,r,Math.PI,0);x.lineTo(r,r);for(let i=0;i<4;i++){x.quadraticCurveTo(r-(i+.5)*r/2,r*(i%2?1.0:1.4),r-(i+1)*r/2,r)}x.closePath();x.fill();x.shadowBlur=0;
x.fillStyle='#2a1640';x.beginPath();x.arc(-r*.35,-r*.1,r*.14,0,7);x.arc(r*.35,-r*.1,r*.14,0,7);x.fill();x.fillStyle='#ff7ab8';x.globalAlpha=.6;x.beginPath();x.arc(-r*.55,r*.2,r*.12,0,7);x.arc(r*.55,r*.2,r*.12,0,7);x.fill();x.globalAlpha=1;
x.strokeStyle='#2a1640';x.lineWidth=r*.07;x.beginPath();x.arc(0,r*.12,r*.18,.2,Math.PI-.2);x.stroke();if(pc){x.fillStyle='#ffd84d';x.font=`${r*.6}px sans-serif`;x.textAlign='center';x.fillText('\u26a1',0,-r*1.1)}x.restore()}
function amp(i){const ax=laneX(i),w=W/LANES*.7,h=H*.13,y=hitY()-h*.2,c=gold?'#ffd84d':'#39ff88',body=gold?'#6b4a00':'#24103d';const p=pressed[i];
x.save();x.shadowColor=c;x.shadowBlur=p?40:15;x.fillStyle=body;x.strokeStyle=c;x.lineWidth=4;x.beginPath();x.roundRect(ax-w/2,y,w,h,12);x.fill();x.stroke();x.shadowBlur=0;
x.fillStyle=gold?'#b88a1a':'#3a1f5c';x.beginPath();x.arc(ax,y+h*.55,h*.3*(1+p),0,7);x.fill();x.strokeStyle=c;x.stroke();x.fillStyle=c;x.font=`bold ${h*.18}px sans-serif`;x.textAlign='center';x.fillText(KEYS[i].toUpperCase(),ax,y+h*.2);x.restore()}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#14062a');g.addColorStop(1,'#2b0d4a');x.fillStyle=g;x.fillRect(0,0,W,H);
x.save();if(shake)x.translate((Math.random()-.5)*30*shake,(Math.random()-.5)*30*shake);
for(let i=0;i<LANES;i++){x.strokeStyle='#b14dff44';x.lineWidth=2;x.beginPath();x.moveTo(laneX(i),0);x.lineTo(laneX(i),hitY());x.stroke()}
x.strokeStyle='#39ff8888';x.lineWidth=3;x.beginPath();x.moveTo(0,hitY()+H*.0);x.lineTo(W,hitY());x.stroke();
const r=Math.min(W/LANES*.28,H*.05);if(st==='play'){for(const gh of ghosts)if(!gh.dead)ghost(laneX(gh.l),gh.y,r,gh.ph,'#b14dff',gh.pc)}
for(let i=0;i<LANES;i++)amp(i);
for(const f of fx){x.globalAlpha=1-f.t/.8;x.fillStyle=f.c;x.font=`bold ${H*.03}px sans-serif`;x.textAlign='center';x.fillText(f.txt,f.x,f.y-f.t*H*.12);x.globalAlpha=1}x.restore();
if(st==='play'){const fs=H*.028;x.font=`bold ${fs}px sans-serif`;x.textAlign='left';x.fillStyle='#39ff88';x.fillText('Score '+score,fs,fs*1.5);x.fillText('Combo '+combo+'  x'+(1+Math.floor(combo/10)),fs,fs*3);
x.textAlign='right';x.fillStyle='#e8d9ff';x.fillText(song.n,W-fs,fs*1.5);const bw=W*.3;x.strokeStyle='#b14dff';x.strokeRect(W-fs-bw,fs*2.2,bw,fs);x.fillStyle=od>=100?'#ffd84d':'#b14dff';x.fillRect(W-fs-bw,fs*2.2,bw*od/100,fs);
x.fillStyle='#fff';x.font=`${fs*.7}px sans-serif`;x.fillText(od>=100?'Overdrive ready: Space or tap here':'Overdrive',W-fs,fs*4.2)}}
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
addEventListener('keydown',e=>{const i=KEYS.indexOf(e.key.toLowerCase());if(i>=0)hit(i);if(e.code==='Space'){e.preventDefault();overdrive()}if(e.key==='Escape'&&st==='play'){st='menu';title()}});
cv.addEventListener('pointerdown',e=>{const px=e.clientX*devicePixelRatio,py=e.clientY*devicePixelRatio;if(py<H*.15&&px>W*.6){overdrive();return}hit(Math.min(3,Math.floor(px/(W/LANES))))});
function menu(h){ui.innerHTML=h;ui.className='';st=st==='play'?'menu':st}
function title(){st='menu';menu(`<img src="logo.png" alt="Coffeebreak" style="width:120px;border-radius:12px"><h1>Ghost Amps</h1><p class="s">Cute ghosts float down to your haunted amps in time with the beat. Hit D F J K or tap the amp as each ghost reaches it. Glowing ghosts are power chords. Fill the meter and press Space or tap the top right for Overdrive.</p>
${SONGS.map((s,i)=>`<button ${i>=unlocked?'disabled style="opacity:.4"':''} onclick="start(${i})">${i+1}. ${s.n} (${s.bpm} bpm)${i>=unlocked?' locked':''}<br><small>Best ${best[i]}</small></button>`).join('')}
<p class="s">Skin: ${gold?'Gold Amps unlocked':'Neon Amps'} ${gold?`<button onclick="gold=!gold;LS.set('goldOn',gold);title()">Toggle</button>`:''}</p>
<button onclick="support()">Support and Gold Amps</button><p class="s">Free to play. Made by Coffeebreak.</p>`)}
function support(){menu(`<h1>Support Coffeebreak</h1><p class="s">Ghost Amps is free. If you enjoy it, you can send an optional tip by PayID to <b>darkokaz@gmx.com</b>.</p>
<p class="s"><b>Gold Amps skin pack, $3:</b> pay $3 by PayID to darkokaz@gmx.com with reference GOLD, then email <a style="color:#39ff88" href="mailto:songwriterkaz@gmail.com?subject=Ghost%20Amps%20Gold%20Amps">songwriterkaz@gmail.com</a>. Your unlock code is emailed back to you.</p>
<input id="code" placeholder="GOLD-XXXXXX-XXXX"> <button onclick="redeem()">Unlock</button><p id="msg" class="s"></p><button onclick="title()">Back</button>`)}
function redeem(){const c=document.getElementById('code').value.trim().toUpperCase();if(GOLD_HASHES.includes(cyrb(c))){gold=true;LS.set('gold',true);document.getElementById('msg').textContent='Gold Amps unlocked. Enjoy.'}else document.getElementById('msg').textContent='That code did not match. Check it and try again.'}
// gold toggle persistence
if(LS.get('gold',false)){gold=LS.get('goldOn',true)}
title();
