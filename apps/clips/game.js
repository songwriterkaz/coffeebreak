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
// ===== Coffeebreak (on-device clip studio) =====
const DEMO=!!window.DEMO,MAXC=3,MAXMOVIE=30,PK=DEMO?'cbAppDemoP':'cbAppP';
const G={state:'app',score:0,level:0};window.G=G;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
let dbp=null;function db(){return dbp||(dbp=new Promise((ok,no)=>{const r=indexedDB.open(DEMO?'cbAppDemo':'cbApp',2);r.onupgradeneeded=()=>{for(const n of ['clips','songs','lists'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n,{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}))}
async function tx(m,f,sn){sn=sn||'clips';const d=await db();return new Promise((ok,no)=>{const t=d.transaction(sn,m),s=t.objectStore(sn),r=f(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error)})}
const allClips=async()=>((await tx('readonly',s=>s.getAll()))||[]).sort((a,b)=>b.t-a.t);
const posted=async()=>(await allClips()).filter(c=>!c.draft);
const putClip=c=>tx('readwrite',s=>s.put(c)),delClip=id=>tx('readwrite',s=>s.delete(id));
let prof;try{prof=JSON.parse(localStorage[PK])}catch(e){}prof=prof||{name:'you',bio:'Coffee lover ☕',av:'☕'};const saveP=()=>localStorage[PK]=JSON.stringify(prof);
let ACT;try{ACT=JSON.parse(localStorage[PK+'act'])}catch(e){}ACT=ACT||[];function act(m){ACT.unshift({m,t:Date.now()});ACT=ACT.slice(0,100);localStorage[PK+'act']=JSON.stringify(ACT)}
const FILTERS={None:'none',Warm:'sepia(.35) saturate(1.4)',Cool:'hue-rotate(180deg) saturate(.8)',Mono:'grayscale(1)',Vintage:'sepia(.7) contrast(1.1)',Pop:'saturate(2) contrast(1.15)',Dreamy:'blur(1px) brightness(1.15) saturate(1.3)',Noir:'grayscale(1) contrast(1.6)','Golden Hour':'sepia(.45) saturate(1.6) brightness(1.08) hue-rotate(-12deg)',Mint:'hue-rotate(95deg) saturate(.75) brightness(1.1) contrast(.95)',Sunset:'sepia(.3) saturate(1.8) hue-rotate(-28deg) contrast(1.1)'};
const STK=['☕','❤️','😂','🔥','✨','🌸','💋','🎉','😎','🦋','🍩','⭐','🌈','👑','💀','🐱','🐨','🦘','🥐','🧋','🌻','🍪','🏖️','🌊','🧁','🥞','🫖','🍰','🌞','🐧','🦜'];
const EFFECTS=['None','Snow','Confetti','Bubbles','Coffee Rain','Sparkles','Floating Hearts','Rainbow Glow'];
const FXP={n:'',p:[]};
function drawEffect(g,nm,t){if(!nm||nm==='None'){FXP.n='';FXP.p=[];return}const W=540,H=960,R=Math.random;
 if(FXP.n!==nm){FXP.n=nm;FXP.p=[];const N={'Snow':70,'Confetti':80,'Bubbles':28,'Coffee Rain':26,'Sparkles':40,'Floating Hearts':22,'Rainbow Glow':0}[nm]||0;
  for(let i=0;i<N;i++)FXP.p.push({x:R()*W,y:R()*H,v:0.6+R()*1.8,s:4+R()*10,a:R()*6.28,c:['#ff5c8a','#ffd23f','#4dd2ff','#7cff6b','#c38bff','#ff9f43'][i%6],e:['☕','🫘','🥐','🧁'][i%4]})}
 g.save();g.textAlign='center';g.textBaseline='middle';
 if(nm==='Rainbow Glow'){const h=(t/20)%360;const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,`hsla(${h},90%,60%,0.22)`);gr.addColorStop(0.5,`hsla(${(h+120)%360},90%,60%,0.10)`);gr.addColorStop(1,`hsla(${(h+240)%360},90%,60%,0.22)`);g.fillStyle=gr;g.fillRect(0,0,W,H)}
 for(const q of FXP.p){
  if(nm==='Snow'){q.y+=q.v;q.x+=Math.sin(t/900+q.a)*0.6;g.fillStyle='rgba(255,255,255,0.9)';g.beginPath();g.arc(q.x,q.y,q.s/3,0,6.28);g.fill()}
  else if(nm==='Confetti'){q.y+=q.v*1.6;q.a+=0.08;g.fillStyle=q.c;g.save();g.translate(q.x,q.y);g.rotate(q.a);g.fillRect(-q.s/2,-q.s/4,q.s,q.s/2);g.restore()}
  else if(nm==='Bubbles'){q.y-=q.v;q.x+=Math.sin(t/700+q.a)*0.8;g.strokeStyle='rgba(200,240,255,0.85)';g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,q.s*1.4,0,6.28);g.stroke();g.fillStyle='rgba(255,255,255,0.6)';g.beginPath();g.arc(q.x-q.s*0.5,q.y-q.s*0.5,q.s*0.3,0,6.28);g.fill()}
  else if(nm==='Coffee Rain'){q.y+=q.v*2;q.a+=0.02;g.font=Math.round(18+q.s*1.5)+'px serif';g.save();g.translate(q.x,q.y);g.rotate(Math.sin(q.a)*0.4);g.fillText(q.e,0,0);g.restore()}
  else if(nm==='Sparkles'){const k=0.5+0.5*Math.sin(t/180+q.a*5);g.globalAlpha=k;g.font=Math.round(10+q.s*2*k)+'px serif';g.fillText('✨',q.x,q.y);g.globalAlpha=1;if(k<0.03){q.x=R()*W;q.y=R()*H}}
  else if(nm==='Floating Hearts'){q.y-=q.v*1.2;q.x+=Math.sin(t/600+q.a)*0.9;g.font=Math.round(18+q.s*1.6)+'px serif';g.fillText(['💗','💖','🩷'][Math.floor(q.a*10)%3],q.x,q.y)}
  if(q.y>H+30){q.y=-30;q.x=R()*W}else if(q.y<-30){q.y=H+30;q.x=R()*W}}
 g.restore()}
const FRAMES=['None','Polaroid','Film Strip','Coffee Beans','Love Hearts','Gold Glam','Comic Pop'];
function drawFrame(g,nm,t){if(!nm||nm==='None')return;const W=540,H=960;g.save();g.textAlign='center';g.textBaseline='middle';
 if(nm==='Polaroid'){g.fillStyle='#fbf8f1';g.fillRect(0,0,W,28);g.fillRect(0,0,28,H);g.fillRect(W-28,0,28,H);g.fillRect(0,H-150,W,150);g.strokeStyle='#d8d0c0';g.lineWidth=2;g.strokeRect(28,28,W-56,H-178);g.fillStyle='#5a3a28';g.font='italic 34px Georgia,serif';g.fillText('Coffeebreak ☕ '+new Date().toLocaleDateString('en-AU'),W/2,H-112)}
 else if(nm==='Film Strip'){g.fillStyle='#111';g.fillRect(0,0,46,H);g.fillRect(W-46,0,46,H);const off=(t*0.06)%60;g.fillStyle='#f4e6c8';for(let y=-60+off;y<H;y+=60){g.fillRect(12,y,22,30);g.fillRect(W-34,y,22,30)}g.fillStyle='#e8a0b0';g.font='bold 18px monospace';g.save();g.translate(30,H/2);g.rotate(-Math.PI/2);g.fillText('COFFEEBREAK FILM',0,0);g.restore()}
 else if(nm==='Coffee Beans'){g.strokeStyle='#4a2c1a';g.lineWidth=34;g.strokeRect(17,17,W-34,H-34);g.font='26px serif';const e=['☕','🫘'];let i=0;for(let X=24;X<W;X+=54){g.fillText(e[i++%2],X,17);g.fillText(e[i%2],X,H-17)}for(let Y=70;Y<H-40;Y+=54){g.fillText(e[i++%2],17,Y);g.fillText(e[i%2],W-17,Y)}}
 else if(nm==='Love Hearts'){g.strokeStyle='#ff8fc0';g.lineWidth=20;g.strokeRect(10,10,W-20,H-20);const p=1+0.12*Math.sin(t/250);g.font=Math.round(30*p)+'px serif';for(let X=30;X<W;X+=60){g.fillText('💗',X,12);g.fillText('💗',X,H-12)}for(let Y=72;Y<H-40;Y+=60){g.fillText('💗',12,Y);g.fillText('💗',W-12,Y)}}
 else if(nm==='Gold Glam'){g.strokeStyle='#d4af37';g.lineWidth=8;g.strokeRect(14,14,W-28,H-28);g.lineWidth=3;g.strokeRect(30,30,W-60,H-60);const tw=0.6+0.4*Math.sin(t/300);g.globalAlpha=tw;g.font='44px serif';[[34,34],[W-34,34],[34,H-34],[W-34,H-34]].forEach(q=>g.fillText('✨',q[0],q[1]));g.globalAlpha=1}
 else if(nm==='Comic Pop'){g.strokeStyle='#000';g.lineWidth=16;g.strokeRect(8,8,W-16,H-16);g.fillStyle='#ffd23f';g.strokeStyle='#000';g.lineWidth=5;g.beginPath();const cx=W-110,cy=90,n=12;for(let k=0;k<n*2;k++){const r=k%2?44:78,a=k*Math.PI/n;g.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a)*0.8)}g.closePath();g.fill();g.stroke();g.fillStyle='#e0245e';g.font='bold 34px Impact,sans-serif';g.fillText(['POW','WOW','YUM'][Math.floor(t/1200)%3],cx,cy)}
 g.restore()}
const FACES={None:'',Puppy:'🐶',Kitty:'🐱',Shades:'😎',Crown:'👑',Bunny:'🐰',Hearts:'😍',Halo:'😇'};
const st=document.createElement('style');st.textContent=`#cbA{position:fixed;z-index:50;background:#120806;color:#ffe9c7;font:15px system-ui,sans-serif;display:flex;flex-direction:column;overflow:hidden;border-radius:6px}
#cbA button{font:inherit;background:#6f4e37;color:#fff;border:0;border-radius:10px;padding:6px 11px;cursor:pointer;margin:2px}#cbA button.on{background:#e8a0b0;color:#1a0a10}
#cbTop{display:flex;align-items:center;gap:6px;background:#2a160e;padding:2px 175px 2px 8px}#cbA canvas{flex:none!important}#stg canvas{width:auto!important;height:100%!important;aspect-ratio:9/16;max-width:100%}#mpv canvas,#mpv video{width:auto!important;height:50vh!important;aspect-ratio:9/16}#cbTop b{flex:1;color:#e8a0b0}
#cbMain{flex:1;position:relative;overflow:hidden}#cbNav{display:flex;justify-content:space-around;align-items:center;background:#2a160e;padding:4px}#cbNav button[data-v=create]{font-size:20px!important;padding:2px 22px!important;background:linear-gradient(90deg,#4ad0e0,#fff,#e8507a)!important;color:#000!important}
#cbFeed{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory}.cbS{height:100%;scroll-snap-align:start;position:relative;display:flex;justify-content:center;background:#000;overflow:hidden}
.cbS video{height:100%;max-width:100%;object-fit:contain}.cbSide{position:absolute;right:10px;bottom:60px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12px}
.cbSide button{font-size:22px!important;background:#0008!important;border-radius:50%!important;width:50px;height:50px;padding:0!important}.cbCap{position:absolute;left:14px;bottom:16px;right:80px;text-shadow:0 1px 3px #000}
.cbPane{height:100%;overflow:auto;padding:10px;box-sizing:border-box}.cbStage{position:relative;background:#000;height:55%;display:flex;justify-content:center}.cbStage canvas,.cbStage video{height:100%;max-width:100%}
.cbGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.cbGrid video,.cbGrid img{width:100%;aspect-ratio:9/16;object-fit:cover;background:#000;border-radius:6px}
#cbA input,#cbA textarea,#cbA select{font:inherit;border-radius:8px;border:1px solid #6f4e37;background:#2a160e;color:#ffe9c7;padding:5px}.cbNote{font-size:12px;opacity:.75}
#cbChat{position:absolute;left:10px;bottom:10px;width:60%;max-height:45%;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;text-shadow:0 1px 2px #000}
.cbSheet{position:absolute;left:0;right:0;bottom:0;max-height:60%;background:#241009;border-radius:16px 16px 0 0;padding:10px;overflow:auto;z-index:5;box-shadow:0 -6px 20px #0009}
.cbRow{display:flex;flex-wrap:wrap;align-items:center;gap:2px;margin:3px 0}`;
document.head.appendChild(st);
const A=document.createElement('div');A.id='cbA';A.innerHTML='<div id="cbTop"><b>☕ Coffeebreak</b><button data-v="movie">🎬 Make My Movie</button><button data-v="music">🎵 Music</button><button data-v="live">🔴 Live</button></div><div id="cbMain"></div><div id="cbMini" style="display:none;align-items:center;gap:8px;background:#3a1f12;padding:3px 8px"><img id="miArt" style="width:30px;height:30px;border-radius:6px;object-fit:cover"><span id="miT" style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><button id="miP">⏸️</button><button id="miN">⏭️</button><button id="miX">✖️</button></div><div id="cbNav"><button data-v="feed">🏠 Home</button><button data-v="discover">🔍 Discover</button><button data-v="create">＋</button><button data-v="inbox">💬 Inbox</button><button data-v="me">👤 Profile</button></div>';document.body.appendChild(A);
function place(){const r=c.getBoundingClientRect();let h=r.height;const sp=document.getElementById('cbStrip');if(sp){const q=sp.getBoundingClientRect();if(q.height&&q.top<r.bottom&&q.bottom>r.top)h=Math.max(200,q.top-r.top-2)}Object.assign(A.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:h+'px'})}
addEventListener('resize',place);addEventListener('scroll',place,true);setInterval(place,500);place();
A.addEventListener('pointerdown',()=>{if(!inUse())startMusic()});
const M=$('cbMain');let stopCam=()=>{};
A.addEventListener('click',e=>{const v=e.target.dataset&&e.target.dataset.v;if(v)show(v)});
async function show(v,arg){stopCam();stopCam=()=>{};M.innerHTML='';A.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));await VIEWS[v](arg)}
function vidFor(cl){const v=document.createElement('video');v.src=URL.createObjectURL(cl.blob);v.playsInline=true;v.loop=true;v.style.filter=FILTERS[cl.f]||'none';v.playbackRate=cl.rate||1;v.defaultPlaybackRate=cl.rate||1;return v}
function stickersHTML(cl){return(cl.st||[]).map(s=>`<span style="position:absolute;left:${s.x}%;top:${s.y}%;font-size:${s.txt?Math.round(s.sz/2.4)+'px;font-weight:bold;font-family:sans-serif;color:'+s.col+';-webkit-text-stroke:1px #000':'40px'};transform:translate(-50%,-50%);pointer-events:none">${esc(s.e)}</span>`).join('')}
const ext=b=>b.type.includes('mp4')?'.mp4':'.webm';
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name+ext(blob);document.body.appendChild(a);a.click();a.remove()}
async function share(cl){const f=new File([cl.blob],'coffeebreak'+ext(cl.blob),{type:cl.blob.type});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Coffeebreak',text:cl.cap||''});return}}catch(e){if(e.name==='AbortError')return}download(cl.blob,'coffeebreak-'+cl.id)}
function tags(s){return(String(s||'').match(/#\w+/g)||[]).map(t=>t.toLowerCase())}
function comments(cl,host,onCount){const sh=document.createElement('div');sh.className='cbSheet';host.appendChild(sh);
 const draw=()=>{sh.innerHTML=`<div class="cbRow"><b style="flex:1">💬 ${(cl.cm||[]).length} comments</b><button class="x">✖️</button></div>`+(cl.cm||[]).map((m,i)=>`<div class="cbRow"><span style="flex:1"><b>@${esc(m.u)}</b> ${esc(m.b)} <span class="cbNote">${new Date(m.t).toLocaleDateString()}</span></span><button data-i="${i}" class="dc">🗑️</button></div>`).join('')+`<div class="cbRow"><input class="ci" maxlength="300" placeholder="Add a comment (notes to yourself, on this device)" style="flex:1"><button class="cs">Post</button></div>`;
  sh.querySelector('.x').onclick=()=>sh.remove();
  sh.querySelectorAll('.dc').forEach(b=>b.onclick=async()=>{cl.cm.splice(+b.dataset.i,1);await putClip(cl);onCount();draw()});
  const send=async()=>{const v=sh.querySelector('.ci').value.trim();if(!v)return;(cl.cm=cl.cm||[]).push({u:prof.name,b:v,t:Date.now()});await putClip(cl);act('💬 You commented: "'+v.slice(0,40)+'"');onCount();draw()};
  sh.querySelector('.cs').onclick=send;sh.querySelector('.ci').onkeydown=e=>{if(e.key==='Enter')send()}};draw()}
const VIEWS={
async feed(arg){let cl=arg&&arg.list?arg.list:await posted();if(!cl.length){M.innerHTML='<div class="cbPane" style="text-align:center"><h2>☕ Coffeebreak</h2><p>Your feed is empty. Tap <b>＋</b> to record or upload your first clip, or try <b>🎬 Make My Movie</b>!</p><p class="cbNote">Your clips stay on this device only. Coffeebreak is not an online social network.</p></div>';return}
 const F=document.createElement('div');F.id='cbFeed';M.appendChild(F);let target=null;
 for(const c1 of cl){const s=document.createElement('div');s.className='cbS';const v=vidFor(c1);if(c1.duetOf)s.title='Duet';s.appendChild(v);
  s.insertAdjacentHTML('beforeend',stickersHTML(c1)+`<div class="cbCap"><b>@${esc(prof.name)}</b>${c1.rate&&c1.rate!==1?' · '+c1.rate+'x':''}${c1.movie?' · 🎬 Movie':''}<br>${esc(c1.cap||'')}</div><div class="cbSide"><div style="font-size:34px">${esc(prof.av)}</div><button class="lk">${c1.liked?'❤️':'🤍'}</button><span class="lc">${c1.likes||0}</span><button class="cm">💬</button><span class="cc">${(c1.cm||[]).length}</span><button class="sv">${c1.saved?'🔖':'📑'}</button><span>${c1.saved?'Saved':'Save'}</span><button class="sh">↗️</button><span>Share</span><button class="mt">🔈</button></div>`);
  const lk=s.querySelector('.lk');lk.onclick=async()=>{c1.liked=!c1.liked;c1.likes=(c1.likes||0)+(c1.liked?1:-1);lk.textContent=c1.liked?'❤️':'🤍';s.querySelector('.lc').textContent=c1.likes;if(c1.liked)act('❤️ You liked "'+(c1.cap||'a clip').slice(0,30)+'"');await putClip(c1)};
  v.addEventListener('dblclick',()=>{if(!c1.liked)lk.click()});v.onclick=()=>v.paused?v.play().catch(()=>{}):v.pause();
  s.querySelector('.cm').onclick=()=>comments(c1,s,()=>s.querySelector('.cc').textContent=(c1.cm||[]).length);
  s.querySelector('.sv').onclick=async e=>{c1.saved=!c1.saved;e.target.textContent=c1.saved?'🔖':'📑';e.target.nextElementSibling.textContent=c1.saved?'Saved':'Save';await putClip(c1)};
  s.querySelector('.sh').onclick=()=>share(c1);s.querySelector('.mt').onclick=e=>{v.muted=!v.muted;e.target.textContent=v.muted?'🔇':'🔈'};F.appendChild(s);if(arg&&arg.id===c1.id)target=s}
 if(target)setTimeout(()=>target.scrollIntoView(),50);
 const io=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target.querySelector('video');if(en.isIntersecting&&en.intersectionRatio>.6){v.playbackRate=v.defaultPlaybackRate;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})}else v.pause()}),{root:F,threshold:[.6]});
 F.querySelectorAll('.cbS').forEach(s=>io.observe(s))},
async discover(){const cl=await posted();const T={};cl.forEach(c=>tags(c.cap).forEach(t=>T[t]=(T[t]||0)+1));
 M.innerHTML=`<div class="cbPane"><div class="cbRow"><input id="q" placeholder="🔍 Search your captions and #hashtags" style="flex:1"><button id="sv">🔖 Saved</button><button id="lk">❤️ Liked</button><button id="all">All</button></div><div class="cbRow">${Object.entries(T).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([t,n])=>`<button class="tg">${esc(t)} (${n})</button>`).join('')||'<span class="cbNote">Add #hashtags to your captions to see them here.</span>'}</div><div class="cbGrid" id="gr"></div></div>`;
 const fill=L=>{const g=$('gr');g.innerHTML=L.length?'':'<p class="cbNote">Nothing here yet.</p>';L.forEach(c1=>{const v=vidFor(c1);v.muted=true;v.preload='metadata';v.onmouseenter=()=>v.play().catch(()=>{});v.onmouseleave=()=>v.pause();v.onclick=()=>show('feed',{list:L,id:c1.id});g.appendChild(v)})};
 fill(cl);$('q').oninput=e=>{const q=e.target.value.toLowerCase();fill(cl.filter(c=>(c.cap||'').toLowerCase().includes(q)))};
 $('sv').onclick=()=>fill(cl.filter(c=>c.saved));$('lk').onclick=()=>fill(cl.filter(c=>c.liked));$('all').onclick=()=>fill(cl);
 M.querySelectorAll('.tg').forEach(b=>b.onclick=()=>{const t=b.textContent.split(' ')[0];fill(cl.filter(c=>tags(c.cap).includes(t)))})},
async inbox(){const cl=await allClips();const dr=cl.filter(c=>c.draft).length;
 M.innerHTML=`<div class="cbPane"><h3 style="margin:4px 0">💬 Inbox</h3>${dr?`<div class="cbRow" style="background:#3a1f12;padding:8px;border-radius:10px"><span style="flex:1">📝 You have ${dr} draft${dr>1?'s':''} waiting</span><button id="gd">Open drafts</button></div>`:''}
 <p class="cbNote">Your activity on this device. Coffeebreak is private: no one else can message you or see your clips.</p>${ACT.length?ACT.map(a=>`<div class="cbRow" style="border-bottom:1px solid #3a1f12;padding:5px 0"><span style="flex:1">${esc(a.m)}</span><span class="cbNote">${new Date(a.t).toLocaleString()}</span></div>`).join(''):'<p>No activity yet.</p>'}${ACT.length?'<button id="ca">Clear activity</button>':''}</div>`;
 const gd=$('gd');if(gd)gd.onclick=()=>show('me','drafts');const ca=$('ca');if(ca)ca.onclick=()=>{ACT=[];localStorage[PK+'act']='[]';show('inbox')}},
async me(tab){const cl=await allClips();const pub=cl.filter(c=>!c.draft),lk=pub.reduce((a,b)=>a+(b.likes||0),0);tab=tab||'clips';
 const L=tab==='drafts'?cl.filter(c=>c.draft):tab==='saved'?pub.filter(c=>c.saved):pub;
 M.innerHTML=`<div class="cbPane"><div style="display:flex;gap:12px;align-items:center"><div style="font-size:54px">${esc(prof.av)}</div><div style="flex:1"><h3 style="margin:0">@${esc(prof.name)}</h3><div>${esc(prof.bio)}</div><div>${pub.length} clips · ${lk} likes</div></div><button id="ed">✏️ Edit</button></div>
 <div id="edf" style="display:none"><input id="pn" value="${esc(prof.name)}" maxlength="20"> <input id="pa" value="${esc(prof.av)}" maxlength="4" style="width:50px"> <input id="pb" value="${esc(prof.bio)}" maxlength="80"> <button id="ps">💾 Save</button></div>
 <div class="cbRow"><button class="tb${tab==='clips'?' on':''}" data-t="clips">🎞️ Clips</button><button class="tb${tab==='saved'?' on':''}" data-t="saved">🔖 Saved</button><button class="tb${tab==='drafts'?' on':''}" data-t="drafts">📝 Drafts (${cl.length-pub.length})</button></div>
 <div class="cbGrid" id="gr"></div><p class="cbNote">Everything is stored only in this browser on this device. Use ⬇️ to download a clip and share it wherever you like.${DEMO?' Demo: '+cl.length+'/3 clips used (drafts count).':''}</p></div>`;
 $('ed').onclick=()=>$('edf').style.display='block';
 $('ps').onclick=()=>{prof={name:$('pn').value.replace(/[^\w.]/g,'').slice(0,20)||'you',av:$('pa').value||'☕',bio:$('pb').value};saveP();show('me',tab)};
 M.querySelectorAll('.tb').forEach(b=>b.onclick=()=>show('me',b.dataset.t));
 for(const c1 of L){const d=document.createElement('div');const v=vidFor(c1);v.muted=true;v.preload='metadata';v.onmouseenter=()=>v.play().catch(()=>{});v.onmouseleave=()=>v.pause();if(!c1.draft)v.onclick=()=>show('feed',{list:L,id:c1.id});d.appendChild(v);
  d.insertAdjacentHTML('beforeend',`<div>${c1.draft?'<button class="po">📤 Post</button>':'❤️'+(c1.likes||0)}<button class="d">⬇️</button><button class="x">🗑️</button></div>`);
  const po=d.querySelector('.po');if(po)po.onclick=async()=>{c1.draft=false;c1.t=Date.now();await putClip(c1);act('📤 You posted a draft');show('me')};
  d.querySelector('.d').onclick=()=>download(c1.blob,'coffeebreak-'+c1.id);d.querySelector('.x').onclick=async()=>{if(confirm('Delete this clip?')){await delClip(c1.id);show('me',tab)}};$('gr').appendChild(d)}},
async live(){M.innerHTML=`<div class="cbStage" style="height:100%"><video id="lv" playsinline muted style="transform:scaleX(-1)"></video><div style="position:absolute;top:10px;left:10px"><span style="background:#e0245e;padding:3px 8px;border-radius:6px">PRACTICE LIVE</span> 👁️ <span id="vw">0</span></div>
 <div id="cbChat"></div><div style="position:absolute;right:10px;bottom:10px;text-align:right"><button id="go">🔴 Start practice live</button><br><input id="say" placeholder="Say something" style="width:150px"></div></div>`;
 let s=null,iv=null;const ch=$('cbChat'),N=['latte_luv','mochamia','beanqueen','javajay','flatwhite_fi','sugarcube','cuppa_carl','espressoyou'],MSG=['hiii 👋','love this ❤️','where are you from?','so fun 😂','🔥🔥🔥','say hi to me!','what are you drinking? ☕','you’re a natural','first time here!','✨✨'];
 const add=(n,m)=>{const d=document.createElement('div');d.innerHTML=`<b>${esc(n)}</b> ${esc(m)}`;ch.appendChild(d);while(ch.children.length>12)ch.firstChild.remove()};
 stopCam=()=>{clearInterval(iv);s&&s.getTracks().forEach(t=>t.stop())};
 $('say').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim()){add(prof.name,e.target.value.trim());e.target.value=''}};
 $('go').onclick=async()=>{if(iv){stopCam();iv=null;$('go').textContent='🔴 Start practice live';add('Coffeebreak','Practice ended. Nothing was broadcast.');return}
  try{s=await navigator.mediaDevices.getUserMedia({video:true,audio:false});$('lv').srcObject=s;$('lv').play()}catch(e){add('Coffeebreak','Camera unavailable, practising without video')}
  add('Coffeebreak','Practice mode: this is NOT broadcast. Chat is pretend.');let v=0;$('go').textContent='⏹️ End';iv=setInterval(()=>{v=Math.max(0,v+((Math.random()*5)|0)-1);$('vw').textContent=v;if(Math.random()<.6)add(N[Math.random()*N.length|0],MSG[Math.random()*MSG.length|0])},1500)}},
async create(){const all=await allClips(),n=all.length;if(DEMO&&n>=MAXC){M.innerHTML='<div class="cbPane"><h3>Demo limit reached</h3><p>The free demo keeps up to 3 clips (including drafts).</p></div>';window.demoEnd&&window.demoEnd('The free demo holds <b>3 clips</b>. The full version of <b>Coffeebreak</b> gives you unlimited clips and unlimited-length movies.');return}
 const pub=all.filter(c=>!c.draft);
 M.innerHTML=`<div class="cbPane"><div class="cbStage" id="stg"><canvas id="rc" width="540" height="960"></canvas></div>
 <div class="cbRow"><button id="cam">📷 Camera</button><button id="flip">🔄 Flip</button><button id="upb">📁 Upload</button><input type="file" id="up" accept="video/*" style="display:none"><button id="rec">⏺️ Record</button>
 ⏱️<select id="tmr"><option value="0">No timer</option><option value="3">3s</option><option value="10">10s</option></select> ⚡<select id="spd"><option value="0.5">0.5x slow</option><option value="1" selected>1x</option><option value="2">2x fast</option><option value="3">3x</option></select><span id="rs"></span></div>
 <div class="cbRow">🎨<select id="flt">${Object.keys(FILTERS).map(k=>`<option>${k}</option>`).join('')}</select> ✨Beauty<input type="range" id="bty" min="0" max="100" value="0" style="width:80px"> 🎭Face<select id="fce">${Object.keys(FACES).map(k=>`<option>${k}</option>`).join('')}</select> 🖼️Frame<select id="frm">${FRAMES.map(k=>`<option>${k}</option>`).join('')}</select> 🌨️Effect<select id="efx">${EFFECTS.map(k=>`<option>${k}</option>`).join('')}</select>
 🟩<button id="gsb">Green screen bg</button><input type="file" id="gsf" accept="image/*" style="display:none"><button id="gso">Off</button> 👯Duet<select id="dut"><option value="">None</option>${pub.map(c=>`<option value="${c.id}">${esc((c.cap||'clip').slice(0,24))}</option>`).join('')}</select></div>
 <div class="cbRow">${STK.map(e=>`<button class="sk">${e}</button>`).join('')}</div>
 <div class="cbRow">🔤<input id="txt" maxlength="40" placeholder="Text overlay" style="width:140px"><input type="color" id="tcol" value="#ffffff" style="width:40px;padding:0"><select id="tsz"><option value="40">S</option><option value="60" selected>M</option><option value="90">L</option></select><button id="tadd">Add text</button><button id="clr">🧽 Clear</button><span class="cbNote" id="hint">Tap a sticker/text, then tap the video to place it.</span></div>
 <div class="cbRow">🎵<select id="snd"><option value="">Original sound</option></select><input id="cap" maxlength="150" placeholder="Caption… #coffeebreak" style="flex:1"><button id="dft" disabled>📝 Draft</button><button id="post" disabled>✅ Post</button></div>
 <p class="cbNote">${DEMO?`Demo: ${n}/3 clips used. `:''}Max 60s. Clips are saved only on this device. Green screen works best with a plain green wall or sheet behind you.</p></div>`;
 const rc=$('rc'),g=rc.getContext('2d',{willReadFrequently:true}),src=document.createElement('video');src.playsInline=true;src.muted=true;
 let stream=null,facing='user',items=[],tool=null,rec=null,chunks=[],out=null,fileBlob=null,raf,bgImg=null,duet=null,face=null,count=0,mix=null;
 const o=document.createElement('canvas'),og=o.getContext('2d',{willReadFrequently:true}),bgc=document.createElement('canvas'),bgg=bgc.getContext('2d');
 const fd=('FaceDetector' in window)?new FaceDetector({fastMode:true,maxDetectedFaces:1}):null;let fdBusy=false,lastFd=0;
 function cover(ctx,el,w,h,vw,vh,mir){const s=Math.max(w/vw,h/vh);ctx.save();if(mir){ctx.translate(w,0);ctx.scale(-1,1)}ctx.drawImage(el,(w-vw*s)/2,(h-vh*s)/2,vw*s,vh*s);ctx.restore()}
 function frame(){const half=duet?270:540;g.fillStyle='#1a0f0a';g.fillRect(0,0,540,960);
  if(src.readyState>=2){if(o.width!==half){o.width=half;o.height=960}og.filter=FILTERS[$('flt').value];cover(og,src,half,960,src.videoWidth,src.videoHeight,stream&&facing==='user');og.filter='none';
   if(bgImg){if(bgc.width!==half){bgc.width=half;bgc.height=960;cover(bgg,bgImg,half,960,bgImg.width,bgImg.height)}const id=og.getImageData(0,0,half,960),bd=bgg.getImageData(0,0,half,960).data,d=id.data;
    for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2];if(gg>80&&gg>r*1.25&&gg>b*1.25){d[i]=bd[i];d[i+1]=bd[i+1];d[i+2]=bd[i+2]}}og.putImageData(id,0,0)}
   g.drawImage(o,0,0);const k=+$('bty').value/100;if(k>0){g.save();g.globalAlpha=k*.6;g.filter='blur(4px) brightness(1.08) saturate(1.1)';g.drawImage(o,0,0);g.restore();g.save();g.globalAlpha=k*.12;g.fillStyle='#ffd8c8';g.fillRect(0,0,half,960);g.restore()}
   if(fd&&!fdBusy&&performance.now()-lastFd>300){fdBusy=true;lastFd=performance.now();fd.detect(o).then(f=>{if(f[0])face=f[0].boundingBox}).catch(()=>{}).finally(()=>fdBusy=false)}
  }else{g.fillStyle='#ffe9c7';g.font='28px sans-serif';g.textAlign='center';g.fillText('Tap 📷 Camera or 📁 Upload',270,480)}
  if(duet&&duet.readyState>=2){g.save();g.translate(270,0);g.beginPath();g.rect(0,0,270,960);g.clip();cover(g,duet,270,960,duet.videoWidth,duet.videoHeight);g.restore();g.fillStyle='#fff';g.fillRect(269,0,2,960)}
  const fe=FACES[$('fce').value];if(fe){const fx=face?face.x+face.width/2:(window.__fx||half/2),fy=face?face.y:(window.__fy||260),fs=face?face.width*1.1:200;g.font=fs+'px serif';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=.92;g.fillText(fe,fx,fy-fs*.15);g.globalAlpha=1}
  g.textAlign='center';g.textBaseline='middle';for(const s of items){if(s.txt){g.font='bold '+s.sz+'px sans-serif';g.lineWidth=s.sz/9;g.strokeStyle='#000';g.strokeText(s.e,s.x*5.4,s.y*9.6);g.fillStyle=s.col;g.fillText(s.e,s.x*5.4,s.y*9.6)}else{g.font='80px serif';g.fillText(s.e,s.x*5.4,s.y*9.6)}}g.textBaseline='alphabetic';
  drawEffect(g,$('efx')&&$('efx').value,performance.now());
  drawFrame(g,$('frm')&&$('frm').value,performance.now());
  const cp=$('cap')&&$('cap').value;if(cp){g.font='bold 30px sans-serif';g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=5;g.strokeText(cp.slice(0,40),270,900);g.fillText(cp.slice(0,40),270,900)}
  if(count>0){g.fillStyle='#0008';g.fillRect(0,0,540,960);g.font='bold 220px sans-serif';g.fillStyle='#fff';g.fillText(count,270,560)}raf=requestAnimationFrame(frame)}
 frame();allSongs().then(L=>{for(const so of L)$('snd').insertAdjacentHTML('beforeend',`<option value="${esc(so.id)}">${esc(so.title)}</option>`)});
 async function cam(){try{stream&&stream.getTracks().forEach(t=>t.stop());stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:720,height:1280},audio:true});src.srcObject=stream;src.play()}catch(e){$('rs').textContent=' Camera unavailable: '+e.name}}
 stopCam=()=>{cancelAnimationFrame(raf);stream&&stream.getTracks().forEach(t=>t.stop());rec&&rec.state==='recording'&&rec.stop();duet&&duet.pause()};
 $('cam').onclick=cam;$('flip').onclick=()=>{facing=facing==='user'?'environment':'user';cam()};$('upb').onclick=()=>$('up').click();
 $('up').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>200e6){$('rs').textContent=' File too big (200 MB max)';return}stream&&stream.getTracks().forEach(t=>t.stop());stream=null;src.srcObject=null;fileBlob=f;src.src=URL.createObjectURL(f);src.loop=true;src.play().catch(()=>{});out=null;$('post').disabled=$('dft').disabled=false;$('rs').textContent=' Uploaded ✔ (Record to bake in effects, or Post as is)'};
 $('gsb').onclick=()=>$('gsf').click();$('gsf').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{bgImg=im;bgc.width=0};im.src=URL.createObjectURL(f)};$('gso').onclick=()=>bgImg=null;
 $('dut').onchange=async e=>{if(duet){duet.pause();duet=null}const c1=pub.find(c=>c.id===e.target.value);if(c1){duet=vidFor(c1);duet.muted=true;duet.play().catch(()=>{})}o.width=0};
 M.querySelectorAll('.sk').forEach(b=>b.onclick=()=>{tool={e:b.textContent};$('hint').textContent='Tap the video to place '+b.textContent});
 $('tadd').onclick=()=>{const v=$('txt').value.trim();if(!v)return;tool={e:v,txt:1,col:$('tcol').value,sz:+$('tsz').value};$('hint').textContent='Tap the video to place your text'};
 $('clr').onclick=()=>items=[];
 rc.onclick=e=>{const r=rc.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*100,py=(e.clientY-r.top)/r.height*100;if(tool){items.push(Object.assign({x:px,y:py},tool));return}if(FACES[$('fce').value]&&!face){window.__fx=px*5.4;window.__fy=py*9.6}};
 function audioMix(){const ac=new AudioContext(),dst=ac.createMediaStreamDestination(),stops=[];
  const sid=$('snd').value,so=sid&&SONGS.find(z=>z.id===sid);
  if(so){const au=new Audio(songURL(so));ac.createMediaElementSource(au).connect(dst);au.play().catch(()=>{});stops.push(()=>au.pause())}
  else{if(stream&&stream.getAudioTracks().length)ac.createMediaStreamSource(new MediaStream(stream.getAudioTracks())).connect(dst);
   if(!stream&&src.src){try{const s2=ac.createMediaElementSource(src);s2.connect(dst);s2.connect(ac.destination);src.muted=false}catch(e){}}
   if(duet){try{duet.muted=false;const s3=ac.createMediaElementSource(duet);s3.connect(dst);s3.connect(ac.destination)}catch(e){}}}
  return{tracks:dst.stream.getAudioTracks(),stop:()=>{stops.forEach(f=>f());ac.close().catch(()=>{});src.muted=true;if(duet)duet.muted=true}}}
 async function startRec(){const cs=rc.captureStream(30);mix=audioMix();mix.tracks.forEach(t=>cs.addTrack(t));if(!stream){src.currentTime=0;src.play().catch(()=>{})}if(duet){duet.currentTime=0;duet.play().catch(()=>{})}
  const mt=['video/webm;codecs=vp9,opus','video/webm','video/mp4'].find(m=>window.MediaRecorder&&MediaRecorder.isTypeSupported(m))||'';rec=new MediaRecorder(cs,mt?{mimeType:mt}:{});chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
  rec.onstop=()=>{mix&&mix.stop();out=new Blob(chunks,{type:rec.mimeType||'video/webm'});$('rec').textContent='⏺️ Record again';$('rs').textContent=' Recorded ✔';$('post').disabled=$('dft').disabled=false};
  rec.start(250);const t0=Date.now();$('rec').textContent='⏹️ Stop';const tk=setInterval(()=>{if(!rec||rec.state!=='recording'){clearInterval(tk);return}const s=(Date.now()-t0)/1000|0;$('rs').textContent=' 🔴 '+s+'s';if(s>=60)rec.stop()},250)}
 $('rec').onclick=async()=>{if(rec&&rec.state==='recording'){rec.stop();return}if(count>0)return;if(src.readyState<2){$('rs').textContent=' Start the camera or upload first';return}
  let tm=+$('tmr').value;if(tm){count=tm;await new Promise(ok=>{const iv=setInterval(()=>{count--;if(count<=0){clearInterval(iv);ok()}},1000)})}startRec()};
 async function save(draft){const baked=!!out;const blob=out||fileBlob;if(!blob)return;if(DEMO&&(await allClips()).length>=MAXC){show('create');return}
  await putClip({id:Date.now().toString(36),t:Date.now(),blob,cap:$('cap').value.trim(),f:baked?'None':$('flt').value,st:baked?[]:items,rate:+$('spd').value,draft,duetOf:$('dut').value||null,likes:0,liked:false,cm:[]});
  act(draft?'📝 You saved a draft':'📤 You posted a new clip'+($('dut').value?' (duet)':''));show(draft?'me':'feed',draft?'drafts':undefined)}
 $('post').onclick=()=>save(false);$('dft').onclick=()=>save(true)},
async movie(){const pub=await posted();await allSongs();let extra=[];
 const TH={cinematic:{seg:4,f:'contrast(1.1) saturate(.9)',font:'Georgia,serif',col:'#e8c070',tr:'dip'},fun:{seg:2,f:'saturate(1.6) contrast(1.1)',font:'Comic Sans MS,cursive',col:'#ffe14a',tr:'zoom'},romantic:{seg:4,f:'sepia(.25) brightness(1.08) saturate(1.2)',font:'Georgia,serif',col:'#ffb0c8',tr:'fade'},horror:{seg:3,f:'grayscale(.85) contrast(1.4) brightness(.8)',font:'Impact,sans-serif',col:'#e01010',tr:'glitch'},vlog:{seg:2.5,f:'none',font:'system-ui,sans-serif',col:'#fff',tr:'slide'},'café':{seg:3.5,f:'sepia(.4) saturate(1.2) brightness(1.04) contrast(1.05)',font:'Georgia,serif',col:'#f3d2a2',tr:'fade'},pastel:{seg:3,f:'brightness(1.12) saturate(.8) contrast(.92)',font:'Trebuchet MS,system-ui,sans-serif',col:'#ffd6f0',tr:'zoom'},neon:{seg:2,f:'saturate(2.1) contrast(1.25) hue-rotate(-20deg)',font:'Impact,Arial Black,sans-serif',col:'#39f6ff',tr:'glitch'}};
 M.innerHTML=`<div class="cbPane"><h3 style="margin:2px 0">🎬 Make My Movie</h3><p class="cbNote">Pick your clips and photos. Coffeebreak finds the best moments (most movement and nicely lit), adds pan &amp; zoom to photos, transitions, a title and credits, then renders a WebM movie.${DEMO?' Demo: movies up to 30 seconds.':''}</p>
 <div class="cbRow"><b>Your clips:</b> <button id="sa">Select all</button></div><div class="cbGrid" id="mg" style="grid-template-columns:repeat(6,1fr)"></div>
 <div class="cbRow"><button id="addb">📁 Add photos &amp; videos from device</button><input type="file" id="addf" accept="image/*,video/*" multiple style="display:none"><span id="addn" class="cbNote"></span></div>
 <div class="cbRow">🎭Theme<select id="mth">${Object.keys(TH).map(k=>`<option value="${k}">${k[0].toUpperCase()+k.slice(1)}</option>`).join('')}</select> 🎨<select id="mfl"><option value="">Theme look</option>${Object.keys(FILTERS).map(k=>`<option>${k}</option>`).join('')}</select>
 🎵<select id="msg"><option value="">Original sound</option>${SONGS.map(s=>`<option value="${esc(s.id)}">${esc(s.title)}</option>`).join('')}</select> ⏳<select id="mln"><option value="15">15s</option><option value="30" selected>30s</option>${DEMO?'':'<option value="60">60s</option><option value="120">2 min</option><option value="0">Auto (everything)</option>'}</select></div>
 <div class="cbRow">🏷️<input id="mtt" placeholder="Movie title" value="My Coffeebreak Movie" maxlength="40" style="flex:1"><input id="mby" placeholder="Credits: starring…" value="Starring @${esc(prof.name)}" maxlength="60" style="flex:1"><button id="mk">✨ Make My Movie</button></div>
 <div id="mst" class="cbNote"></div><div class="cbStage" id="mpv" style="height:auto;min-height:0"></div></div>`;
 const sel=new Set();pub.forEach(c1=>{const v=vidFor(c1);v.muted=true;v.preload='metadata';v.style.outline='3px solid transparent';v.onclick=()=>{sel.has(c1.id)?sel.delete(c1.id):sel.add(c1.id);v.style.outline=sel.has(c1.id)?'3px solid #e8a0b0':'3px solid transparent'};$('mg').appendChild(v)});
 if(!pub.length)$('mg').innerHTML='<span class="cbNote">No clips yet. Add photos/videos from your device below.</span>';
 $('sa').onclick=()=>$('mg').querySelectorAll('video').forEach((v,i)=>{if(!sel.has(pub[i].id))v.click()});
 $('addb').onclick=()=>$('addf').click();$('addf').onchange=e=>{extra=extra.concat([...e.target.files]);$('addn').textContent=extra.length+' file(s) added: '+extra.map(f=>f.name).join(', ').slice(0,80)};
 const S=m=>$('mst').textContent=m;let running=false;
 stopCam=()=>{running=false};
 const loadV=url=>new Promise((ok,no)=>{const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;v.onloadeddata=()=>ok(v);v.onerror=()=>no(new Error('video'))});
 const seek=(v,t)=>new Promise(ok=>{if(Math.abs(v.currentTime-t)<.05&&v.readyState>=2)return ok();const f=()=>{v.removeEventListener('seeked',f);ok()};v.addEventListener('seeked',f);v.currentTime=t;setTimeout(f,1500)});
 const loadI=url=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
 async function fixDur(v){if(isFinite(v.duration)&&v.duration>0)return v.duration;await seek(v,1e5);const d=v.duration;await seek(v,0);return isFinite(d)&&d>0?d:v.currentTime||1}
 async function analyse(v,seg){const d=await fixDur(v),n=Math.max(2,Math.min(24,Math.ceil(d/.5))),cv=document.createElement('canvas');cv.width=24;cv.height=40;const cx=cv.getContext('2d',{willReadFrequently:true});let prev=null;const sc=[];
  for(let i=0;i<n;i++){const t=d*i/n;await seek(v,t);cx.drawImage(v,0,0,24,40);const p=cx.getImageData(0,0,24,40).data;let br=0,mo=0;for(let j=0;j<p.length;j+=4){const l=(p[j]+p[j+1]+p[j+2])/3;br+=l;if(prev)mo+=Math.abs(l-prev[j/4])}
   const L=new Float32Array(p.length/4);for(let j=0;j<L.length;j++)L[j]=(p[j*4]+p[j*4+1]+p[j*4+2])/3;br/=L.length;mo=prev?mo/L.length:0;prev=L;sc.push({t,s:mo/20+(1-Math.abs(br-128)/128)})}
  const w=Math.max(1,Math.round(seg/(d/n)));const k=Math.max(1,Math.min(3,Math.round(d/(seg*3))));const wins=[];
  for(let i=0;i+w<=sc.length||i===0;i++){let s=0;for(let j=i;j<Math.min(sc.length,i+w);j++)s+=sc[j].s;wins.push({t:sc[i].t,s});if(i+w>=sc.length)break}
  wins.sort((a,b)=>b.s-a.s);const pick=[];for(const x of wins){if(pick.every(p=>Math.abs(p.t-x.t)>=seg))pick.push(x);if(pick.length>=k)break}
  return{d,picks:pick.sort((a,b)=>a.t-b.t).map(p=>({start:Math.min(p.t,Math.max(0,d-seg)),dur:Math.min(seg,d)}))}}
 $('mk').onclick=async()=>{if(running)return;const th=TH[$('mth').value],seg=th.seg;const srcs=pub.filter(c=>sel.has(c.id)).map(c=>({kind:'video',url:URL.createObjectURL(c.blob),t:c.t})).concat(extra.map(f=>({kind:f.type.startsWith('image')?'image':'video',url:URL.createObjectURL(f),t:f.lastModified})));
  if(!srcs.length){S('Pick at least one clip or add photos/videos first.');return}running=true;$('mk').disabled=true;
  try{srcs.sort((a,b)=>a.t-b.t);const segs=[];let i=0;
   for(const s of srcs){i++;S('🔎 Finding the best moments… '+i+'/'+srcs.length);if(s.kind==='image'){segs.push({kind:'image',img:await loadI(s.url),dur:seg})}else{const v0=await loadV(s.url);const a=await analyse(v0,seg);for(const p of a.picks){const v=await loadV(s.url);segs.push({kind:'video',v,start:p.start,dur:p.dur})}}}
   let target=+$('mln').value;if(DEMO)target=Math.min(target||MAXMOVIE,MAXMOVIE);const TT=3,CR=3;let body=target?target-TT-CR:1e9;const plan=[];for(const s of segs){if(body<=0.6)break;const d=Math.min(s.dur,body);plan.push(Object.assign(s,{dur:d}));body-=d}
   for(const s of plan)if(s.kind==='video')await seek(s.v,s.start);
   const TOT=TT+plan.reduce((a,s)=>a+s.dur,0)+CR;S('🎬 Rendering '+Math.round(TOT)+'s movie… (plays in real time)');
   const cv=document.createElement('canvas');cv.width=540;cv.height=960;const g=cv.getContext('2d');$('mpv').innerHTML='';cv.style.cssText='height:50vh';$('mpv').appendChild(cv);
   const ac=new AudioContext(),dst=ac.createMediaStreamDestination(),so=$('msg').value&&SONGS.find(z=>z.id===$('msg').value);let song=null,sg=ac.createGain();sg.connect(dst);
   if(so){song=new Audio(songURL(so));ac.createMediaElementSource(song).connect(sg)}
   const vg=ac.createGain();vg.gain.value=so?0.2:1;vg.connect(dst);const seen=new Set();for(const s of plan)if(s.kind==='video'&&!seen.has(s.v)){seen.add(s.v);try{ac.createMediaElementSource(s.v).connect(vg);s.v.muted=false}catch(e){}}
   const cs=cv.captureStream(30);dst.stream.getAudioTracks().forEach(t=>cs.addTrack(t));const mt=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m))||'';
   const rec=new MediaRecorder(cs,mt?{mimeType:mt}:{});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);const done=new Promise(ok=>rec.onstop=ok);
   let t0=0;const starts=[];{let a=TT;for(const s of plan){starts.push(a);a+=s.dur}}const flt=$('mfl').value?FILTERS[$('mfl').value]:th.f,title=$('mtt').value,by=$('mby').value,date=new Date().toLocaleDateString(),TR=.5;
   function drawSeg(s,lt,alpha,dx,zoom){if(!s)return;g.save();g.globalAlpha=alpha;g.translate(270+dx,480);g.scale(zoom,zoom);g.translate(-270,-480);g.filter=flt;
    if(s.kind==='image'){const im=s.img,p=lt/s.dur,k=1+.15*p,sc=Math.max(540/im.width,960/im.height)*k,dir=(plan.indexOf(s)%2?1:-1);g.drawImage(im,(540-im.width*sc)/2+dir*40*(p-.5),(960-im.height*sc)/2,im.width*sc,im.height*sc)}
    else if(s.v.readyState>=2){const v=s.v,sc=Math.max(540/v.videoWidth,960/v.videoHeight);g.drawImage(v,(540-v.videoWidth*sc)/2,(960-v.videoHeight*sc)/2,v.videoWidth*sc,v.videoHeight*sc)}g.restore()}
   const hearts=[...Array(14)].map((_,i)=>({x:Math.random()*540,y:Math.random()*960,s:.5+Math.random()}));
   function deco(T){const th2=$('mth').value;
    if(th2==='cinematic'){g.fillStyle='#000';g.fillRect(0,0,540,110);g.fillRect(0,850,540,110)}
    if(th2==='romantic'){g.font='30px serif';g.textAlign='center';for(const h of hearts){g.globalAlpha=.55;g.fillText('💗',h.x,(h.y-T*40*h.s+1920)%960)}g.globalAlpha=1}
    if(th2==='fun'){g.font='34px serif';g.textAlign='center';['🎉','✨','⭐','🎈'].forEach((e,i)=>g.fillText(e,60+i*140,80+Math.sin(T*4+i)*20))}
    if(th2==='horror'){const gr=g.createRadialGradient(270,480,200,270,480,620);gr.addColorStop(0,'#0000');gr.addColorStop(1,'#000e');g.fillStyle=gr;g.fillRect(0,0,540,960);g.fillStyle='rgba(120,0,0,.18)';g.fillRect(0,0,540,960);if(Math.random()<.04){g.fillStyle='#fff3';g.fillRect(0,0,540,960)}}
    if(th2==='vlog'){g.font='bold 22px system-ui';g.fillStyle='#fff';g.textAlign='left';g.fillText((Math.floor(T*2)%2?'⏺':'  ')+' REC  '+date,20,40)}
    if(th2==='café'){const wg=g.createRadialGradient(270,480,260,270,480,640);wg.addColorStop(0,'rgba(80,40,10,0)');wg.addColorStop(1,'rgba(60,30,10,.55)');g.fillStyle=wg;g.fillRect(0,0,540,960);g.textAlign='center';g.font='30px serif';hearts.slice(0,8).forEach((h,i)=>{const y=(h.y-T*30*h.s+1920)%960;g.globalAlpha=.35+.25*Math.sin(T*2+i);g.fillText(i%3?'♨️':(i%2?'☕':'🥐'),h.x,y)});g.globalAlpha=1}
    if(th2==='pastel'){g.fillStyle='rgba(255,200,235,.12)';g.fillRect(0,0,540,960);g.textAlign='center';g.font='26px serif';hearts.forEach((h,i)=>{g.globalAlpha=.4+.3*Math.sin(T*3+i);g.fillText(['💗','⭐','🩷','✨','🌸'][i%5],(h.x+Math.sin(T+i)*20+540)%540,(h.y+T*25*h.s)%960)});g.globalAlpha=1}
    if(th2==='neon'){g.save();const hu=(T*90)%360;g.shadowBlur=24;[0,1].forEach(i=>{g.shadowColor=g.fillStyle='hsl('+((hu+i*160)%360)+',100%,60%)';g.globalAlpha=.75+.25*Math.sin(T*8+i);g.fillRect(0,i?942:8,540,10)});g.globalAlpha=.85;g.shadowColor='#ff3cf0';g.font='34px serif';g.textAlign='center';g.fillText('🌃',490,80);g.restore()}}
   function text(s,y,sz,col){g.font='bold '+sz+'px '+th.font;g.textAlign='center';g.lineWidth=sz/10;g.strokeStyle='#000';g.fillStyle=col;const w=String(s).split(' ');let l='',ls=[];for(const z of w){if(g.measureText(l+z).width>480&&l){ls.push(l);l=''}l+=z+' '}ls.push(l);ls.forEach((q,i)=>{g.strokeText(q.trim(),270,y+i*sz*1.15);g.fillText(q.trim(),270,y+i*sz*1.15)})}
   function play(s,on){if(s&&s.kind==='video'){if(on&&s.v.paused&&!s._p){s._p=1;s.v.play().catch(()=>{})}if(!on&&!s.v.paused)s.v.pause()}}
   rec.start(200);if(song)song.play().catch(()=>{});t0=performance.now();
   await new Promise(ok=>{function step(){if(!running){ok();return}const T=(performance.now()-t0)/1000;g.fillStyle='#000';g.fillRect(0,0,540,960);
    if(T<TT){if(plan[0]&&T>TT-TR){play(plan[0],true);drawSeg(plan[0],0,(T-(TT-TR))/TR,0,1)}g.globalAlpha=Math.min(1,T/.6,(TT-T)/.5+0.0001);text(title,420,64,th.col);text('a Coffeebreak movie',560,26,'#fff');g.globalAlpha=1}
    else if(T<TOT-CR){let k=0;while(k+1<plan.length&&T>=starts[k+1])k++;const s=plan[k],lt=T-starts[k];play(s,true);for(let j=0;j<plan.length;j++)if(j!==k&&j!==k+1)play(plan[j],false);
     const nx=plan[k+1],rem=s.dur-lt,tr=th.tr;
     if(nx&&rem<TR){play(nx,true);const p=1-rem/TR;
      if(tr==='fade'){drawSeg(s,lt,1,0,1);drawSeg(nx,0,p,0,1)}else if(tr==='dip'){if(p<.5)drawSeg(s,lt,1-p*2,0,1);else drawSeg(nx,0,(p-.5)*2,0,1)}
      else if(tr==='zoom'){drawSeg(s,lt,1-p,0,1+p*.6);drawSeg(nx,0,p,0,1.6-p*.6)}else if(tr==='slide'){drawSeg(s,lt,1,-540*p,1);drawSeg(nx,0,1,540*(1-p),1)}
      else{drawSeg(Math.random()<p?nx:s,lt,1,(Math.random()-.5)*60,1);g.fillStyle='rgba(255,0,0,.25)';g.fillRect(0,Math.random()*960,540,30+Math.random()*80)}}
     else drawSeg(s,lt,1,0,1)}
    else{plan.forEach(s=>play(s,false));const ct=T-(TOT-CR);if(song)sg.gain.value=Math.max(0,1-ct/CR);g.fillStyle='#000';g.fillRect(0,0,540,960);const y=960-ct*120;text(title,y,46,th.col);text(by,y+110,30,'#fff');text('Music: '+(so?so.title:'original sound'),y+200,24,'#ccc');text('Made with ☕ Coffeebreak',y+270,24,'#e8a0b0')}
    if(T<TOT-CR)deco(T);S('🎬 Rendering… '+Math.min(100,Math.round(T/TOT*100))+'%');if(T>=TOT){ok();return}requestAnimationFrame(step)}step()});
   rec.stop();await done;if(song)song.pause();plan.forEach(s=>play(s,false));ac.close().catch(()=>{});
   if(!running){S('Stopped.');return}
   const blob=new Blob(ch,{type:'video/webm'});const pv=document.createElement('video');pv.src=URL.createObjectURL(blob);pv.controls=true;pv.playsInline=true;pv.style.height='50vh';$('mpv').innerHTML='';$('mpv').appendChild(pv);
   S('✅ Your movie is ready ('+Math.round(TOT)+'s).');act('🎬 You made a movie: "'+title+'"');window.__movieBlob=blob;
   $('mst').insertAdjacentHTML('beforeend',' <button id="mdl">⬇️ Download WebM</button> <button id="msv">➕ Save to my clips</button>');
   $('mdl').onclick=()=>download(blob,'coffeebreak-movie');$('msv').onclick=async()=>{if(DEMO&&(await allClips()).length>=MAXC){S('Demo holds 3 clips. Download your movie instead, or get the full version.');return}await putClip({id:Date.now().toString(36),t:Date.now(),blob,cap:title+' #movie',f:'None',st:[],rate:1,movie:true,likes:0,liked:false,cm:[]});show('feed')}}
  catch(e){S('Something went wrong: '+e.message)}finally{running=false;const b=$('mk');if(b)b.disabled=false}}},
};
// --- Music: built-in Coffeebreak playlist + user imports ---
let SONGS=[],LISTS=[],Q=[],qi=0,shuf=false,rep='all',curList='coffeebreak';const P=new Audio();P.preload='auto';
const songURL=so=>so.blob?(so._u||(so._u=URL.createObjectURL(so.blob))):'assets/music/'+so.file;
const artURL=so=>so.art?(so._a||(so._a=URL.createObjectURL(so.art))):(window.HERO_SRC||'assets/hero.png');
async function allSongs(){const b=(window.PLAYLIST||[]).map(p=>({id:'cb:'+p.file,title:p.title,artist:'Coffeebreak',file:p.file,builtin:1}));const u=((await tx('readonly',s=>s.getAll(),'songs'))||[]).sort((a,b)=>a.t-b.t);SONGS=b.concat(u);LISTS=(await tx('readonly',s=>s.getAll(),'lists'))||[];return SONGS}
function listSongs(id){if(id==='coffeebreak')return SONGS.filter(s=>s.builtin);if(id==='mine')return SONGS.filter(s=>!s.builtin);const l=LISTS.find(z=>z.id===id);return l?l.ids.map(i=>SONGS.find(s=>s.id===i)).filter(Boolean):[]}
function id3art(buf){try{const b=new Uint8Array(buf);if(b[0]!==73||b[1]!==68||b[2]!==51)return null;const v=b[3],sz=(b[6]<<21)|(b[7]<<14)|(b[8]<<7)|b[9];let i=10;const tg=String.fromCharCode;let o={};
 while(i<sz+10&&b[i]){const id=tg(b[i],b[i+1],b[i+2],b[i+3]);const fs=v===4?(b[i+4]<<21)|(b[i+5]<<14)|(b[i+6]<<7)|b[i+7]:(b[i+4]<<24)|(b[i+5]<<16)|(b[i+6]<<8)|b[i+7];const d=b.subarray(i+10,i+10+fs);
  if(id==='APIC'){let j=1;let mime='';while(d[j])mime+=tg(d[j++]);j+=2;const enc=d[0];if(enc===1||enc===2){while(j<d.length-1&&(d[j]||d[j+1]))j+=2;j+=2}else{while(d[j])j++;j++}o.art=new Blob([d.subarray(j)],{type:mime||'image/jpeg'})}
  if(id==='TIT2'||id==='TPE1'){const enc=d[0];let t=enc===1||enc===2?new TextDecoder('utf-16').decode(d.subarray(1)):new TextDecoder(enc===3?'utf-8':'latin1').decode(d.subarray(1));t=t.replace(/\0/g,'').trim();if(id==='TIT2')o.title=t;else o.artist=t}
  if(fs<=0)break;i+=10+fs}return o}catch(e){return null}}
function playQ(list,i){Q=list.slice();qi=i;if(shuf){const f=Q.splice(qi,1)[0];for(let k=Q.length-1;k>0;k--){const j=Math.random()*(k+1)|0;[Q[k],Q[j]]=[Q[j],Q[k]]}Q.unshift(f);qi=0}playCur()}
function playCur(){const so=Q[qi];if(!so)return;tmpl(false);try{music.pause()}catch(e){}P.src=songURL(so);P.play().catch(()=>{});$('cbMini').style.display='flex';$('miT').textContent='🎵 '+so.title+' — '+(so.artist||'');$('miArt').src=artURL(so);
 if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:so.title,artist:so.artist||'',artwork:[{src:artURL(so)}]});navigator.mediaSession.setActionHandler('nexttrack',nextS);navigator.mediaSession.setActionHandler('previoustrack',prevS)}catch(e){}}upd()}
function nextS(){if(rep==='one'){P.currentTime=0;P.play();return}if(qi+1<Q.length)qi++;else if(rep==='all')qi=0;else{P.pause();upd();return}playCur()}
function prevS(){if(P.currentTime>3){P.currentTime=0;return}qi=(qi-1+Q.length)%Q.length;playCur()}
function togS(){if(!Q.length)return;P.paused?(music.pause(),P.play().catch(()=>{})):P.pause();upd()}
P.addEventListener('ended',nextS);P.addEventListener('play',()=>{try{music.pause()}catch(e){}});
$('miP').onclick=togS;$('miN').onclick=nextS;
function upd(){$('miP').textContent=P.paused?'▶️':'⏸️';const m=$('mpP');if(m){m.textContent=P.paused?'▶️':'⏸️';$('mpS').classList.toggle('on',shuf);$('mpR').textContent=rep==='one'?'🔂':'🔁';$('mpR').classList.toggle('on',rep!=='off');const so=Q[qi];if(so){$('mpArt').src=artURL(so);$('mpT').textContent=so.title;$('mpA').textContent=so.artist||''}}}
setInterval(()=>{const r=$('mpPos');if(r&&P.duration){r.max=P.duration;if(!r.matches(':active'))r.value=P.currentTime}},500);
VIEWS.music=async function(){await allSongs();
 const tabs=[['coffeebreak','☕ Coffeebreak'],['mine','📥 My Songs']].concat(LISTS.map(l=>[l.id,'📃 '+l.name]));if(!tabs.some(t=>t[0]===curList))curList='coffeebreak';const L=listSongs(curList);
 M.innerHTML=`<div class="cbPane"><div style="display:flex;gap:12px;align-items:center"><img id="mpArt" src="${window.HERO_SRC||''}" style="width:90px;height:90px;border-radius:10px;object-fit:cover;background:#2a160e"><div style="flex:1"><b id="mpT">Pick a song</b><div id="mpA" class="cbNote"></div>
 <input type="range" id="mpPos" min="0" value="0" step="1" style="width:100%"><button id="mpS">🔀</button><button id="mpV">⏮️</button><button id="mpP">▶️</button><button id="mpN">⏭️</button><button id="mpR">🔁</button></div></div>
 <div style="margin:8px 0">${tabs.map(t=>`<button class="tl${t[0]===curList?' on':''}" data-l="${esc(t[0])}">${esc(t[1])}</button>`).join('')}<button id="nl">➕ Playlist</button></div>
 <div><button id="imb">📥 Import songs (mp3, m4a, wav)</button><input type="file" id="imf" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,.mp3,.m4a,.wav" multiple style="display:none"> <button id="pall">▶️ Play all</button>${!['coffeebreak','mine'].includes(curList)?' <button id="dl0">🗑️ Delete playlist</button>':''}</div>
 <div id="sl"></div><p class="cbNote">Imported songs are stored only on this device. Only import music you own or have rights to. ⚠️ Some Coffeebreak music may contain adult themes or language.</p></div>`;
 const sl=$('sl');L.forEach((so,i)=>{const d=document.createElement('div');d.style.cssText='display:flex;align-items:center;gap:8px;padding:4px;border-bottom:1px solid #3a1f12';
  d.innerHTML=`<img src="${artURL(so)}" style="width:38px;height:38px;border-radius:6px;object-fit:cover"><div style="flex:1;cursor:pointer" class="pl"><b>${esc(so.title)}</b><div class="cbNote">${esc(so.artist||'')}</div></div><button class="ad" title="Add to playlist">➕</button>${!so.builtin?'<button class="ar" title="Album art">🖼️</button><button class="rm">🗑️</button>':''}${!['coffeebreak','mine'].includes(curList)?'<button class="ou">➖</button>':''}`;
  d.querySelector('.pl').onclick=()=>playQ(L,i);
  d.querySelector('.ad').onclick=async()=>{if(!LISTS.length){alert('Make a playlist first with ➕ Playlist');return}const n=prompt('Add to which playlist?\n'+LISTS.map((l,k)=>(k+1)+'. '+l.name).join('\n'),'1');const l=LISTS[(+n||0)-1];if(l&&!l.ids.includes(so.id)){l.ids.push(so.id);await tx('readwrite',s=>s.put(l),'lists')}};
  const ou=d.querySelector('.ou');if(ou)ou.onclick=async()=>{const l=LISTS.find(z=>z.id===curList);l.ids=l.ids.filter(z=>z!==so.id);await tx('readwrite',s=>s.put(l),'lists');show('music')};
  const rm=d.querySelector('.rm');if(rm)rm.onclick=async()=>{if(confirm('Remove '+so.title+'?')){await tx('readwrite',s=>s.delete(so.id),'songs');show('music')}};
  const ar=d.querySelector('.ar');if(ar)ar.onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=async()=>{if(f.files[0]){const o=Object.assign({},so);delete o._a;delete o._u;o.art=f.files[0];await tx('readwrite',s=>s.put(o),'songs');show('music')}};f.click()};sl.appendChild(d)});
 M.querySelectorAll('.tl').forEach(b=>b.onclick=()=>{curList=b.dataset.l;show('music')});
 $('nl').onclick=async()=>{const n=prompt('Playlist name?');if(n){const l={id:'pl'+Date.now(),name:n.slice(0,30),ids:[]};await tx('readwrite',s=>s.put(l),'lists');curList=l.id;show('music')}};
 const d0=$('dl0');if(d0)d0.onclick=async()=>{if(confirm('Delete this playlist? (songs stay)')){await tx('readwrite',s=>s.delete(curList),'lists');curList='coffeebreak';show('music')}};
 $('imb').onclick=()=>$('imf').click();
 $('imf').onchange=async e=>{for(const f of e.target.files){if(!/\.(mp3|m4a|wav)$/i.test(f.name)&&!/audio\/(mpeg|mp4|x-m4a|wav|x-wav)/.test(f.type))continue;const meta=id3art(await f.slice(0,2e6).arrayBuffer())||{};
   await tx('readwrite',s=>s.put({id:'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),t:Date.now(),title:meta.title||f.name.replace(/\.\w+$/,''),artist:meta.artist||'Me',blob:f,art:meta.art||null}),'songs')}curList='mine';show('music')};
 $('pall').onclick=()=>L.length&&playQ(L,0);$('mpP').onclick=togS;$('mpN').onclick=nextS;$('mpV').onclick=prevS;$('mpS').onclick=()=>{shuf=!shuf;upd()};$('mpR').onclick=()=>{rep=rep==='all'?'one':rep==='one'?'off':'all';upd()};
 $('mpPos').oninput=e=>{P.currentTime=+e.target.value};upd()};
allSongs();
function inUse(){return Q.length>0}
function tmpl(on){['mute','skip','np'].forEach(i=>{const e=document.getElementById(i);if(e)e.style.display=on?'':'none'})}
$('miX').onclick=()=>{P.pause();Q=[];$('cbMini').style.display='none';tmpl(true)};
function update(){}function draw(){x.fillStyle='#120806';x.fillRect(0,0,W,H)}
// ===== Live Chatroom (P2P via Trystero/nostr) + Karaoke =====
(function(){
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const top=document.getElementById('cbTop');
[['chat','💬 Chatroom'],['karaoke','🎤 Karaoke']].forEach(([v,l])=>{const b=document.createElement('button');b.dataset.v=v;b.textContent=l;top.appendChild(b)});
const st=document.createElement('style');st.textContent=`.ckMsg{padding:4px 6px;margin:2px 0;border-radius:8px;background:#3a1f12;word-wrap:break-word}.ckMsg.me{background:#5a2a3a}.ckMsg small{opacity:.6}.ckMsg .ck{font-size:11px;padding:1px 5px;margin-left:4px}#ckLog{flex:1;overflow:auto;padding:4px}.ckWrap{display:flex;flex-direction:column;height:100%;padding:6px;box-sizing:border-box;gap:4px}.ckWrap input,.ckWrap textarea,.ckWrap select{background:#241009;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px;font:14px Georgia}.ckEm button{padding:2px 6px;font-size:16px}`;document.head.appendChild(st);
const BAD=['fuck','shit','bitch','cunt','dick','pussy','asshole','bastard','slut','whore','fag','nigger','nigga','retard','kys','kill yourself','rape'];
function filt(t){let o=String(t).slice(0,500);for(const w of BAD){o=o.replace(new RegExp(w.replace(/ /g,'\\s*'),'gi'),m=>m[0]+'*'.repeat(m.length-1))}return o}
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},LW=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let blocked=LS('ckBlocked',[]),hidden=new Set(LS('ckHidden',[]));
const CH={room:null,name:LS('ckName',''),code:null,peers:{},log:[],send:null,sendClip:null};
window.CB_CHAT=CH;
function addMsg(m){if(blocked.includes(m.from))return;if(CH.log.some(z=>z.id===m.id))return;CH.log.push(m);if(CH.log.length>200)CH.log.shift();render()}
function online(){return 1+Object.keys(CH.peers).length}
function render(){const L=document.getElementById('ckLog');if(!L)return;const n=document.getElementById('ckOn');if(n)n.textContent='🟢 '+online()+' online';
 L.innerHTML=CH.log.filter(m=>!hidden.has(m.id)&&!blocked.includes(m.from)).map(m=>{const me=m.from===Trystero.selfId;return `<div class="ckMsg${me?' me':''}" data-id="${m.id}"><b>${esc(m.name)}</b>${m.ver?' '+CBV.tick:''} <small>${new Date(m.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small>${me||m.sys?'':` <button class="ck ckB" data-f="${esc(m.from)}" title="Block">🚫</button><button class="ck ckR" data-id="${m.id}" title="Report">🚩</button>`}<br>${m.sys?'<i>'+esc(m.text)+'</i>':esc(filt(m.text))}${m.audio?`<br><audio controls src="${m.audio}" style="height:30px;max-width:100%"></audio>`:''}</div>`}).join('');
 L.scrollTop=L.scrollHeight;
 L.querySelectorAll('.ckB').forEach(b=>b.onclick=()=>{if(confirm('Block this person? You won\'t see their messages.')){blocked.push(b.dataset.f);LW('ckBlocked',blocked);render()}});
 L.querySelectorAll('.ckR').forEach(b=>b.onclick=()=>{const m=CH.log.find(z=>z.id===b.dataset.id)||{};const done=()=>{hidden.add(b.dataset.id);LW('ckHidden',[...hidden].slice(-500));render()};if(window.CBR)CBR.open({handle:m.name,text:m.text,peer:m.from,room:CH.code,where:'chat message',onDone:done});else done()})}
function sys(t){addMsg({id:'s'+Date.now()+Math.random(),from:'sys',name:'☕ Coffeebreak',text:t,t:Date.now(),sys:1})}
async function leave(){if(CH.room){try{await CH.room.leave()}catch(e){}}CH.room=null;CH.peers={};CH.send=null;CH.sendClip=null}
function join(code){if(!window.Trystero){sys('Chat could not load.');return}leave();CH.code=code;CH.log=[];
 try{const r=Trystero.joinRoom({appId:'coffeebreaks-itch-coffeebreak-app-v1'},'room-'+code.toLowerCase());CH.room=r;
 const a=r.makeAction('msg'),hi=r.makeAction('hi'),cl=r.makeAction('clip');
 CH.send=d=>a.send(d);CH.sendClip=d=>cl.send(d);
 a.onMessage=(d,c)=>{if(d&&typeof d.text==='string')addMsg({id:String(d.id).slice(0,40),from:c.peerId,name:String(d.name||'Guest').slice(0,24),text:d.text,t:Date.now(),ver:CBV.check(d,String(d.name||'Guest').slice(0,24))})};
 hi.onMessage=(d,c)=>{const was=CH.peers[c.peerId];CH.peers[c.peerId]=String(d&&d.name||'Guest').slice(0,24);if(!was)sys(CH.peers[c.peerId]+' joined');render()};
 cl.onMessage=(d,c)=>{try{if(!(d instanceof ArrayBuffer||ArrayBuffer.isView(d))||d.byteLength>600000)return;const u=URL.createObjectURL(new Blob([d],{type:'audio/webm'}));addMsg({id:'c'+Date.now()+Math.random(),from:c.peerId,name:CH.peers[c.peerId]||'Guest',text:'🎤 shared a karaoke clip',audio:u,t:Date.now()})}catch(e){}};
 r.onPeerJoin=p=>{CH.peers[p]=CH.peers[p]||'Guest';hi.send({name:CH.name},{target:p});render()};
 r.onPeerLeave=p=>{const n=CH.peers[p];delete CH.peers[p];if(n)sys(n+' left');render()};
 sys('You joined "'+code+'". Looking for people… (messages are live only, nothing is stored)');
 }catch(e){sys('Could not connect: '+e.message)}}
VIEWS.chat=async function(){
 if(!CH.name||!CH.code){M.innerHTML=`<div class="ckWrap" style="overflow:auto"><h2 style="margin:4px 0">💬 Coffeebreak Chatroom</h2>
 <div style="background:#2a160e;border-radius:10px;padding:8px;font-size:14px">💗 <b>Be kind.</b> No bullying, hate, sexual messages or sharing personal info (address, phone, school). Under 13? Ask a grown-up first. Use 🚫 to block and 🚩 to report (hides the message for you). Chat is live and peer-to-peer: no accounts, nothing saved on a server, and people in the room can see your display name.</div>
 <label>Display name <input id="ckN" maxlength="20" value="${esc(CH.name)}" placeholder="e.g. Sunny"></label>
 <div>Public rooms: <button class="ckJ" data-r="Lobby">🏠 Lobby</button> <button class="ckJ" data-r="Music">🎵 Music</button> <button class="ckJ" data-r="Movies">🎬 Movies</button></div>
 <div>Or a room code: <input id="ckC" maxlength="24" placeholder="e.g. bestie123"> <button id="ckJC">Join</button></div></div>`;
  const go=r=>{const n=filt(document.getElementById('ckN').value.trim()).slice(0,20);if(!n){alert('Pick a display name first');return}CH.name=n;LW('ckName',n);join(r);VIEWS.chat()};
  M.querySelectorAll('.ckJ').forEach(b=>b.onclick=()=>go(b.dataset.r));document.getElementById('ckJC').onclick=()=>{const c=document.getElementById('ckC').value.trim().replace(/[^\w-]/g,'');if(c)go(c)};return}
 M.innerHTML=`<div class="ckWrap"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><b>#${esc(CH.code)}</b><span id="ckOn">🟢 ${online()} online</span><span style="flex:1"></span><small>💗 Be kind</small><button id="ckLv">Leave</button></div>
 <div id="ckLog"></div><div class="ckEm">${['❤️','😂','😍','🥰','😭','🔥','🎉','☕','🎵','🙏','✨','👋'].map(e=>`<button>${e}</button>`).join('')}</div>
 <div style="display:flex;gap:4px"><input id="ckT" maxlength="300" style="flex:1" placeholder="Say something kind…"><button id="ckS">Send</button></div></div>`;
 const T=document.getElementById('ckT');M.querySelectorAll('.ckEm button').forEach(b=>b.onclick=()=>{T.value+=b.textContent;T.focus()});
 const snd=()=>{const t=T.value.trim();if(!t||!CH.send)return;const m=CBV.wrap({id:Trystero.selfId+Date.now().toString(36),name:CH.name,text:filt(t)},CH.name);CH.send(m);addMsg({...m,from:Trystero.selfId,t:Date.now(),ver:!!(CBV.badge&&CBV.badge.h.toLowerCase()===CH.name.toLowerCase())});T.value=''};
 document.getElementById('ckS').onclick=snd;T.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')snd()};
 document.getElementById('ckLv').onclick=()=>{leave();CH.code=null;VIEWS.chat()};render()};

// ---- Karaoke ----
let K={ctx:null,el:null,stopVis:()=>{},rec:null};
function kdb(){return new Promise((res,rej)=>{const q=indexedDB.open('cbKaraoke',1);q.onupgradeneeded=()=>q.result.createObjectStore('recs',{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function kall(){try{const d=await kdb();return await new Promise(r=>{const q=d.transaction('recs').objectStore('recs').getAll();q.onsuccess=()=>r(q.result||[]);q.onerror=()=>r([])})}catch(e){return[]}}
async function kput(o){const d=await kdb();return new Promise(r=>{const t=d.transaction('recs','readwrite');t.objectStore('recs').put(o);t.oncomplete=r;t.onerror=r})}
async function kdel(id){const d=await kdb();return new Promise(r=>{const t=d.transaction('recs','readwrite');t.objectStore('recs').delete(id);t.oncomplete=r})}
function kstop(){try{K.el&&K.el.pause()}catch(e){}try{K.rec&&K.rec.state!=='inactive'&&K.rec.stop()}catch(e){}K.stopVis()}
VIEWS.karaoke=async function(){
 try{music.pause()}catch(e){}try{typeof P!=='undefined'&&P.pause()}catch(e){}
 const songs=(window.PLAYLIST||[]).map(p=>({title:p.title,url:'assets/music/'+p.file,file:p.file}));
 let user=[];try{user=(await allSongs()).filter(s=>s.blob)}catch(e){}
 const all=songs.concat(user.map(s=>({title:s.title,blob:s.blob,file:s.id})));
 const lyr=LS('ckLyrics',{});
 M.innerHTML=`<div class="ckWrap" style="overflow:auto"><h2 style="margin:2px 0">🎤 Karaoke</h2>
 <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><select id="kS" style="max-width:60%">${all.map((s,i)=>`<option value="${i}">${esc(s.title)}</option>`).join('')}</select>
 <label><input type="checkbox" id="kV"> 🎚️ Vocal reduction</label></div>
 <div style="display:flex;gap:6px;flex-wrap:wrap"><button id="kP">▶️ Play</button><button id="kR" style="background:#d42a4a">🎙️ Sing &amp; Record</button><button id="kX">⏹️ Stop</button></div>
 <canvas id="kC" width="600" height="120" style="width:100%;height:120px;background:#1a0a10;border-radius:10px;flex:none"></canvas>
 <div id="kL" style="background:#2a160e;border-radius:10px;padding:8px;white-space:pre-wrap;max-height:160px;overflow:auto;text-align:center;font-size:17px"></div>
 <details><summary>✏️ Add / edit lyrics for this song</summary><textarea id="kLT" rows="5" style="width:100%" placeholder="Paste the words here. They're saved on this device."></textarea><button id="kLS">Save lyrics</button></details>
 <div id="kOut"></div><h3 style="margin:4px 0">💾 My recordings</h3><div id="kRecs"></div>
 <small>⚠️ Some music may contain adult themes or language. Listener discretion advised. Use headphones for the cleanest recording. Vocal reduction works best on songs with centred vocals.</small></div>`;
 const sel=document.getElementById('kS'),C=document.getElementById('kC'),cx=C.getContext('2d');
 const showL=()=>{const s=all[sel.value];const t=lyr[s.file];document.getElementById('kL').textContent=t||'🎶 Sing along! 🎶\n(No lyrics for this song yet. Add them below if you like.)';document.getElementById('kLT').value=t||''};
 sel.onchange=()=>{kstop();showL()};showL();
 document.getElementById('kLS').onclick=()=>{lyr[all[sel.value].file]=document.getElementById('kLT').value;LW('ckLyrics',lyr);showL()};
 async function setup(){kstop();if(!K.ctx)K.ctx=new (window.AudioContext||window.webkitAudioContext)();const ac=K.ctx;await ac.resume();
  const s=all[sel.value];const el=new Audio();el.crossOrigin='anonymous';el.src=s.blob?URL.createObjectURL(s.blob):s.url;K.el=el;
  const src=ac.createMediaElementSource(el),out=ac.createGain(),sp=ac.createChannelSplitter(2),mg=ac.createChannelMerger(2),inv=ac.createGain();inv.gain.value=-1;
  // vocal cancel: L-R to both channels
  sp.connect(mg,0,0);sp.connect(inv,1);inv.connect(mg,0,0);sp.connect(mg,1,1);const inv2=ac.createGain();inv2.gain.value=-1;sp.connect(inv2,0);inv2.connect(mg,0,1);
  const vr=document.getElementById('kV');const route=()=>{try{src.disconnect()}catch(e){}if(vr.checked){src.connect(sp)}else src.connect(out)};mg.connect(out);vr.onchange=route;route();
  const an=ac.createAnalyser();an.fftSize=256;out.connect(an);out.connect(ac.destination);
  const recDest=ac.createMediaStreamDestination();out.connect(recDest);
  let raf=0,ph=0;const buf=new Uint8Array(an.frequencyBinCount);const lines=(lyr[s.file]||'').split('\n').filter(Boolean);
  const loop=()=>{raf=requestAnimationFrame(loop);an.getByteFrequencyData(buf);cx.fillStyle='#1a0a10';cx.fillRect(0,0,600,120);ph+=.03;
   for(let i=0;i<buf.length;i++){const h=buf[i]/255*110;cx.fillStyle=`hsl(${330+i},80%,${50+h/4}%)`;cx.fillRect(i*600/buf.length,120-h,600/buf.length-1,h)}
   cx.font='28px serif';cx.textAlign='center';['🎵','🎤','✨','💗','🎶'].forEach((e,i)=>cx.fillText(e,60+i*120,40+Math.sin(ph+i)*14));
   if(lines.length&&el.duration){const li=Math.min(lines.length-1,Math.floor(el.currentTime/el.duration*lines.length));const L=document.getElementById('kL');if(L&&L.dataset.li!=li){L.dataset.li=li;L.innerHTML=lines.map((l,j)=>j===li?'<b style="color:#ffcf6a;font-size:20px">'+esc(l)+'</b>':esc(l)).join('\n');const b=L.querySelector('b');b&&b.scrollIntoView({block:'center'})}}};
  loop();K.stopVis=()=>cancelAnimationFrame(raf);return {el,recDest,ac,out}}
 document.getElementById('kP').onclick=async()=>{const g=await setup();g.el.play().catch(e=>alert('Could not play: '+e.message))};
 document.getElementById('kX').onclick=kstop;
 document.getElementById('kR').onclick=async()=>{let mic;try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){alert('Microphone permission is needed to record.');return}
  const g=await setup();const ms=g.ac.createMediaStreamSource(mic);const mg2=g.ac.createGain();mg2.gain.value=1.4;ms.connect(mg2);mg2.connect(g.recDest);
  const mt=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'';const rec=new MediaRecorder(g.recDest.stream,mt?{mimeType:mt}:{});K.rec=rec;const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
  const kR=document.getElementById('kR');kR.textContent='🔴 Recording… (Stop to finish)';
  rec.onstop=()=>{mic.getTracks().forEach(t=>t.stop());try{ms.disconnect()}catch(e){}if(kR)kR.innerHTML='🎙️ Sing &amp; Record';const b=new Blob(ch,{type:rec.mimeType||'audio/webm'});done(b,all[sel.value].title)};
  g.el.onended=()=>rec.state!=='inactive'&&rec.stop();rec.start(250);g.el.play().catch(()=>{})};
 function done(b,title){const u=URL.createObjectURL(b);const o=document.getElementById('kOut');if(!o)return;
  o.innerHTML=`<div style="background:#3a1f12;border-radius:10px;padding:6px"><b>🎉 Your take: ${esc(title)}</b><br><audio controls src="${u}" style="width:100%"></audio><br><a download="coffeebreak-karaoke.webm" href="${u}"><button>⬇️ Download</button></a> <button id="kSv">💾 Save to device</button> <button id="kSh">💬 Share clip to chatroom</button></div>`;
  document.getElementById('kSv').onclick=async()=>{await kput({id:'k'+Date.now(),t:Date.now(),title,blob:b});recs();document.getElementById('kSv').textContent='✅ Saved'};
  document.getElementById('kSh').onclick=()=>share(b)}
 async function share(b){if(!CH.sendClip){alert('Join a chatroom first (💬 Chatroom), then come back and share.');return}
  const clip=b.size>500000?b.slice(0,500000):b;// first ~30s
  const ab=await clip.arrayBuffer();CH.sendClip(ab);addMsg({id:'c'+Date.now(),from:Trystero.selfId,name:CH.name,text:'🎤 shared a karaoke clip',audio:URL.createObjectURL(clip),t:Date.now()});alert('Shared to #'+CH.code)}
 async function recs(){const R=document.getElementById('kRecs');if(!R)return;const a=(await kall()).sort((x,y)=>y.t-x.t);
  R.innerHTML=a.length?a.map(r=>`<div style="margin:3px 0">${esc(r.title)} <small>${new Date(r.t).toLocaleString()}</small><br><audio controls src="${URL.createObjectURL(r.blob)}" style="height:30px;max-width:70%"></audio> <button data-d="${r.id}">🗑️</button> <button data-s="${r.id}">💬</button></div>`).join(''):'<small>No saved recordings yet.</small>';
  R.querySelectorAll('[data-d]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this recording?')){await kdel(b.dataset.d);recs()}});
  R.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>share(a.find(r=>r.id===b.dataset.s).blob))}
 recs();
 const os=stopCam;stopCam=()=>{kstop();os()}};
})();

// ===== CB Radio (P2P live voice, push-to-talk) =====
(function(){
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b=document.createElement('button');b.dataset.v='cb';b.textContent='📻 CB Radio';document.getElementById('cbTop').appendChild(b);
const R={room:null,ch:null,handle:(()=>{try{return localStorage.getItem('cbHandle')||''}catch(e){return ''}})(),peers:{},mic:null,tx:null,talking:{},ac:null,els:{}};
window.CB_RADIO=R;
function ac(){if(!R.ac)R.ac=new (window.AudioContext||window.webkitAudioContext)();R.ac.resume();return R.ac}
function noise(sec,vol){const a=ac(),n=a.createBuffer(1,a.sampleRate*sec,a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(Math.random()<.02?1:.35);const s=a.createBufferSource();s.buffer=n;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.7;const g=a.createGain();g.gain.value=vol;g.gain.setValueAtTime(vol,a.currentTime+sec*.7);g.gain.linearRampToValueAtTime(0,a.currentTime+sec);s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
function beep(){const a=ac(),t=a.currentTime;[[1200,0],[900,.09]].forEach(([fr,d])=>{const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=fr;g.gain.setValueAtTime(.08,t+d);g.gain.setValueAtTime(0,t+d+.08);o.connect(g);g.connect(a.destination);o.start(t+d);o.stop(t+d+.1)})}
function squelch(){noise(.25,.25)}
function list(){const L=document.getElementById('rbL');if(!L)return;const me=`<div>📻 <b>${esc(R.handle)}</b>${CBV.badge&&CBV.badge.h.toLowerCase()===R.handle.toLowerCase()?' '+CBV.tick:''} (you)${R.tx?' 🔴 TX':''}</div>`;L.innerHTML=me+Object.entries(R.peers).map(([p,h])=>`<div>📻 ${esc(h)}${R.ver&&R.ver[p]?' '+CBV.tick:''}${R.talking[p]?' 🔊 talking…':''} <button class="ck" data-rp="${esc(p)}" style="font-size:11px;padding:1px 5px">🚩</button></div>`).join('');L.querySelectorAll('[data-rp]').forEach(b=>b.onclick=()=>window.CBR&&CBR.open({handle:R.peers[b.dataset.rp],peer:b.dataset.rp,room:'CB ch '+R.ch,where:'CB Radio user'}));const n=document.getElementById('rbN');if(n)n.textContent=(1+Object.keys(R.peers).length)+' on channel'}
async function leave(){if(R.room)try{await R.room.leave()}catch(e){}R.room=null;R.peers={};R.talking={};Object.values(R.els).forEach(e=>{e.srcObject=null;e.remove()});R.els={};if(R.mic)R.mic.getTracks().forEach(t=>t.stop());R.mic=null}
async function join(ch){await leave();R.ch=ch;
 try{R.mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){R.mic=null}
 const r=Trystero.joinRoom({appId:'coffeebreaks-itch-cbradio-v1'},'ch'+ch);R.room=r;
 const hi=r.makeAction('hi'),ptt=r.makeAction('ptt');R.ptt=ptt;R.hi=hi;
 hi.onMessage=(d,c)=>{const h=String(d&&d.h||'Breaker').slice(0,20);R.peers[c.peerId]=h;R.ver=R.ver||{};R.ver[c.peerId]=CBV.check(d,h);list()};
 ptt.onMessage=(d,c)=>{const on=!!(d&&d.on);R.talking[c.peerId]=on;if(on)squelch();else{beep();setTimeout(()=>noise(.15,.15),200)}const e=R.els[c.peerId];if(e)e.muted=!on;list()};
 r.onPeerJoin=p=>{R.peers[p]=R.peers[p]||'Breaker';hi.send(CBV.wrap({id:'hi'+p,h:R.handle},R.handle),{target:p});if(R.mic)r.addStream(R.mic,{target:p});list()};
 r.onPeerLeave=p=>{delete R.peers[p];delete R.talking[p];if(R.els[p]){R.els[p].remove();delete R.els[p]}list()};
 r.onPeerStream=(s,p)=>{let e=R.els[p];if(!e){e=document.createElement('audio');e.autoplay=true;e.muted=true;document.body.appendChild(e);R.els[p]=e}e.srcObject=s;e.play().catch(()=>{})};
 if(R.mic)R.mic.getAudioTracks().forEach(t=>t.enabled=false)}
function setTx(on){if(!R.room)return;if(on&&!R.mic){alert('Microphone permission is needed to talk. You can still listen.');return}if(R.tx===on)return;R.tx=on;R.mic.getAudioTracks().forEach(t=>t.enabled=on);R.ptt.send({on});if(on)squelch();else beep();const k=document.getElementById('rbP');if(k){k.textContent=on?'🔴 ON AIR… release to stop':'🎙️ HOLD TO TALK';k.style.background=on?'#d42a4a':''}list()}
VIEWS.cb=async function(){
 try{music.pause()}catch(e){}try{typeof P!=='undefined'&&P.pause()}catch(e){}
 const chs=Array.from({length:40},(_,i)=>`<option ${R.ch==i+1?'selected':''} value="${i+1}">Channel ${i+1}${i+1===9?' (Help)':i+1===19?' (Road chat)':''}</option>`).join('');
 M.innerHTML=`<div class="ckWrap" style="overflow:auto;text-align:center"><h2 style="margin:2px 0">📻 Coffeebreak CB Radio</h2>
 <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap"><input id="rbH" maxlength="20" placeholder="Your handle, e.g. Rubber Duck" value="${esc(R.handle)}"><select id="rbC">${chs}</select><button id="rbJ">${R.room?'Change channel':'Tune in'}</button>${R.room?'<button id="rbX">Off</button>':''}</div>
 <div id="rb9" style="font-size:13px;background:#2a160e;border-radius:10px;padding:6px">🆘 <b>Channel 9 is the help channel.</b> Keep it clear for people asking for help. This is a fun hobby radio, not an emergency service: in a real emergency call <b>000</b> (Australia), 911 (US) or 112 (EU).</div>
 ${R.room?`<div style="font-size:22px;color:#ffcf6a">📡 CH ${R.ch} · <span id="rbN"></span></div>
 <button id="rbP" style="font-size:24px;padding:26px 30px;border-radius:50%;margin:8px auto;user-select:none;touch-action:none">🎙️ HOLD TO TALK</button><small>or hold the Space bar · release for the roger beep</small>
 <div id="rbL" style="text-align:left;background:#1a0a10;border-radius:10px;padding:6px;min-height:40px"></div>`:'<p>Pick a handle and a channel (1–40), then tune in.</p>'}
 <small>💗 Be kind on air. Voice is live peer-to-peer: nothing is recorded or stored, and anyone on the channel can hear you. Don't share personal details.</small></div>`;
 document.getElementById('rbJ').onclick=async()=>{const h=document.getElementById('rbH').value.trim().slice(0,20);if(!h){alert('Pick a handle first');return}R.handle=h;try{localStorage.setItem('cbHandle',h)}catch(e){}squelch();await join(+document.getElementById('rbC').value);VIEWS.cb()};
 const x=document.getElementById('rbX');if(x)x.onclick=async()=>{await leave();R.ch=null;VIEWS.cb()};
 const p=document.getElementById('rbP');if(p){p.onpointerdown=e=>{e.preventDefault();p.setPointerCapture&&p.setPointerCapture(e.pointerId);setTx(true)};p.onpointerup=p.onpointercancel=p.onpointerleave=()=>setTx(false);list()}
 const kd=e=>{if(e.code==='Space'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();setTx(true)}},ku=e=>{if(e.code==='Space')setTx(false)};addEventListener('keydown',kd);addEventListener('keyup',ku);
 const os=stopCam;stopCam=()=>{removeEventListener('keydown',kd);removeEventListener('keyup',ku);setTx(false);os()}};
})();

// ===== Verified badges (signed by Coffeebreak admin key; only the PUBLIC key ships) =====
(function(){
const ADMIN_PUB='03add3d55d27c87325f95b83a28dc938c89f73c9a73e8333569fc1eddb339dcdce';
const E=window.CBEC,te=new TextEncoder(),hx=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''),bx=h=>new Uint8Array((h.match(/../g)||[]).map(x=>parseInt(x,16)));
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},LW=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let me=LS('cbvMe',null);if(!me||!me.sk){const sk=E.p256.utils.randomSecretKey();me={sk:hx(sk),pk:hx(E.p256.getPublicKey(sk))};LW('cbvMe',me)}
const V={ADMIN_PUB,pk:me.pk,badge:LS('cbvBadge',null),admin:null,cache:{}};window.CBV=V;
const bmsg=(h,pk)=>te.encode('cbverify:v1:'+h.toLowerCase()+':'+pk);
function sv(sig,msg,pub){try{return E.p256.verify(bx(sig),msg,bx(pub))}catch(e){return false}}
V.wrap=function(d,name){d.upk=me.pk;d.us=hx(E.p256.sign(te.encode('cbmsg:'+(d.id||'')+':'+(d.text||'')+':'+name),bx(me.sk)));if(V.badge&&V.badge.h.toLowerCase()===String(name).toLowerCase())d.badge=V.badge.s;return d};
// true only if: admin signed (name,upk) AND the sender holds the upk private key (signed this message)
V.check=function(d,name){if(!d||!d.badge||!d.upk||!d.us)return false;const k=d.badge+d.upk+name;if(!(k in V.cache))V.cache[k]=sv(d.badge,bmsg(String(name),d.upk),ADMIN_PUB);return V.cache[k]&&sv(d.us,te.encode('cbmsg:'+(d.id||'')+':'+(d.text||'')+':'+name),d.upk)};
V.tick='<span title="Verified by Coffeebreak (Karen)" style="color:#ffcf6a">⭐ Verified</span>';
// admin
V.unlock=function(pass){const seed=E.pbkdf2(E.sha256,te.encode(pass),te.encode('coffeebreak-verify-v1'),{c:200000,dkLen:48});const n=E.p256.Point.Fn.ORDER;const d=BigInt('0x'+hx(seed))%(n-1n)+1n;const sk=bx(d.toString(16).padStart(64,'0'));if(hx(E.p256.getPublicKey(sk))!==ADMIN_PUB)return false;V.admin=sk;return true};
V.sign=(h,pk)=>hx(E.p256.sign(bmsg(h,pk),V.admin));
let AR=null,reqA,badA,reqs={};
function adminRoom(){if(AR)return AR;AR=Trystero.joinRoom({appId:'coffeebreaks-itch-coffeebreak-app-v1'},'verify-requests');reqA=AR.makeAction('req');badA=AR.makeAction('badge');
 reqA.onMessage=(d,c)=>{if(V.admin&&d&&d.h&&d.pk){reqs[c.peerId]={h:String(d.h).slice(0,24),pk:String(d.pk).slice(0,70),why:String(d.why||'').slice(0,200)};V.render&&V.render()}};
 badA.onMessage=(d,c)=>{if(d&&d.s&&d.pk===me.pk&&sv(d.s,bmsg(d.h,me.pk),ADMIN_PUB)){V.badge={h:d.h,s:d.s};LW('cbvBadge',V.badge);alert('⭐ You are now verified as "'+d.h+'"!');V.render&&V.render()}};
 AR.onPeerJoin=p=>{const q=LS('cbvReq',null);if(q&&!V.badge)reqA.send(q,{target:p})};return AR}
if(LS('cbvReq',null)&&!V.badge)setTimeout(()=>{try{adminRoom()}catch(e){}},3000);
const b=document.createElement('button');b.dataset.v='verify';b.textContent='⭐ Verify';document.getElementById('cbTop').appendChild(b);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
VIEWS.verify=async function(){V.render=()=>{if(!document.getElementById('vfW'))return;VIEWS.verify()};const q=LS('cbvReq',null);
 M.innerHTML=`<div class="ckWrap" id="vfW" style="overflow:auto"><h2 style="margin:2px 0">⭐ Verified badges</h2>
 <p style="font-size:14px">Verified badges are approved by hand by Karen (Coffeebreak). Each badge is digitally signed, and every copy of the app checks that signature before showing ⭐ Verified next to a name in the Chatroom and on CB Radio. A badge only works for the exact name it was approved for, on this device.</p>
 ${V.badge?`<p>✅ You're verified as <b>${esc(V.badge.h)}</b> ${V.tick}</p>`:q?`<p>⏳ Request sent for <b>${esc(q.h)}</b>. Keep the app open now and then so Karen can approve it while you're online.</p><button id="vfC">Cancel request</button>`:`<label>Name to verify <input id="vfH" maxlength="20" value="${esc((window.CB_CHAT&&CB_CHAT.name)||'')}"></label><br><label>Why? (optional) <input id="vfY" maxlength="120" placeholder="e.g. I'm Karen's cousin"></label><br><button id="vfR">Request verification</button>`}
 <hr><details ${V.admin?'open':''}><summary>🔐 Admin</summary>${V.admin?`<b>Admin mode on.</b> Pending requests from people online:<div id="vfQ">${Object.entries(reqs).map(([p,r])=>`<div style="margin:4px 0;background:#3a1f12;padding:4px;border-radius:8px"><b>${esc(r.h)}</b> <small>${esc(r.why)}</small> <button data-a="${p}">✅ Approve</button> <button data-x="${p}">✖️</button></div>`).join('')||'<small>None right now.</small>'}</div><button id="vfS">Approve my own name</button> <button id="vfO">Lock admin</button>`:`<input id="vfP" type="password" placeholder="Admin passphrase"> <button id="vfU">Unlock</button>`}</details></div>`;
 const g=id=>document.getElementById(id);
 g('vfR')&&(g('vfR').onclick=()=>{const h=g('vfH').value.trim();if(!h){alert('Enter a name');return}const r={h,pk:me.pk,why:g('vfY').value.trim()};LW('cbvReq',r);adminRoom();try{reqA.send(r)}catch(e){}VIEWS.verify()});
 g('vfC')&&(g('vfC').onclick=()=>{localStorage.removeItem('cbvReq');VIEWS.verify()});
 g('vfU')&&(g('vfU').onclick=()=>{g('vfU').textContent='Checking…';setTimeout(()=>{if(V.unlock(g('vfP').value)){adminRoom();V.adminHook&&V.adminHook();VIEWS.verify()}else{alert('Wrong passphrase');g('vfU').textContent='Unlock'}},30)});
 g('vfO')&&(g('vfO').onclick=()=>{V.admin=null;VIEWS.verify()});
 g('vfS')&&(g('vfS').onclick=()=>{const h=prompt('Your display name');if(h){V.badge={h,s:V.sign(h,me.pk)};LW('cbvBadge',V.badge);VIEWS.verify()}});
 if(V.admin&&window.CBR){const d=document.createElement('div');d.id='vfRep';M.querySelector('details').appendChild(d);CBR.adminHTML().then(h=>{d.innerHTML=h;CBR.adminWire(d)})}
 M.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{const r=reqs[x.dataset.a];badA.send({h:r.h,pk:r.pk,s:V.sign(r.h,r.pk)},{target:x.dataset.a});delete reqs[x.dataset.a];alert('Approved '+r.h);VIEWS.verify()});
 M.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{delete reqs[x.dataset.x];VIEWS.verify()})};
})();

// ===== Phone tab: embeds the Coffeebreak Phone app (same code, same numbers & signalling as coffeebreak-phone) =====
(function(){const b=document.createElement('button');b.dataset.v='phone';b.textContent='📞 Phone';document.getElementById('cbTop').appendChild(b);
let fr=null;
VIEWS.phone=async function(){try{music.pause()}catch(e){}try{typeof P!=='undefined'&&P.pause()}catch(e){}
 if(!fr){fr=document.createElement('iframe');fr.src='assets/phone/index.html';fr.allow='camera *; microphone *; autoplay *; clipboard-write *';fr.style.cssText='border:0;width:100%;height:100%;background:#12060c'}
 M.innerHTML='<div style="display:flex;flex-direction:column;height:100%"><div style="font-size:12px;padding:3px 6px;background:#2a160e">📞 App-to-app calls with anyone using Coffeebreak or Coffeebreak Phone. Your CB number works in both. ⚠️ It can\'t call real phone numbers or 000. In an emergency use a real phone and call 000.</div><div id="phHost" style="flex:1;min-height:0"></div></div>';
 document.getElementById('phHost').appendChild(fr)};
})();

// ===== Coffeebreak Report system: reports encrypted to Karen's admin public key, delivered only to her admin room =====
(function(){
const E=window.CBEC,V=window.CBV,te=new TextEncoder(),td=new TextDecoder();
const hx=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''),bx=h=>new Uint8Array((h.match(/../g)||[]).map(x=>parseInt(x,16)));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},LW=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
async function aes(shared){const k=E.sha256(shared.slice(1));return crypto.subtle.importKey('raw',k,'AES-GCM',false,['encrypt','decrypt'])}
async function enc(obj){const esk=E.p256.utils.randomSecretKey(),epk=E.p256.getPublicKey(esk);const key=await aes(E.p256.getSharedSecret(esk,bx(V.ADMIN_PUB)));const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify(obj))));return {id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),e:hx(epk),iv:hx(iv),c:hx(ct)}}
async function dec(r){const key=await aes(E.p256.getSharedSecret(V.admin,bx(r.e)));return JSON.parse(td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bx(r.iv)},key,bx(r.c))))}
const PR=[
 {p:'Dear God, thank You for the courage it took to speak up. Please wrap this person in Your peace, heal anything that hurt, and surround them with kind people. Amen.',v:'Psalms 34:18',t:'Yahweh is near to those who have a broken heart, and saves those who have a crushed spirit.'},
 {p:'Lord, be close to my friend right now. Quiet every worry, lift every heavy feeling, and let them know they are safe, seen and loved. Amen.',v:'Isaiah 41:10',t:'Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness.'},
 {p:'Jesus, give rest to this tired heart. Take what they have carried today and replace it with calm, hope and a good night’s sleep. Amen.',v:'Matthew 11:28',t:'“Come to me, all you who labor and are heavily burdened, and I will give you rest.'},
 {p:'Father, be this person’s shelter. Where they feel unsafe, be their strength; where they feel alone, send help and comfort. Amen.',v:'Psalms 46:1',t:'God is our refuge and strength, a very present help in trouble.'},
 {p:'God, go ahead of this person into tomorrow. Clear the path, guard their heart and remind them that You will never leave them. Amen.',v:'Deuteronomy 31:8',t:'Yahweh himself is who goes before you. He will be with you. He will not fail you nor forsake you. Don’t be afraid. Don’t be discouraged.”'},
 {p:'Prince of Peace, settle this troubled mind. Let Your peace fill the space where the hurt was, today and every day. Amen.',v:'John 14:27',t:'Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful.'}];
let out=LS('cbrOut',[]),inbox=LS('cbrInbox',[]),AR=null,rep,ack;
function room(){if(AR)return AR;AR=Trystero.joinRoom({appId:'coffeebreaks-itch-coffeebreak-app-v1'},'karen-admin-reports');rep=AR.makeAction('rep');ack=AR.makeAction('ack');
 rep.onMessage=(d,c)=>{if(!V.admin||!d||!d.c||String(d.c).length>20000)return;if(!inbox.some(r=>r.id===d.id)){inbox.push({...d,at:Date.now()});LW('cbrInbox',inbox.slice(-500));V.render&&V.render()}ack.send({id:d.id},{target:c.peerId})};
 ack.onMessage=d=>{out=out.filter(r=>r.id!==(d&&d.id));LW('cbrOut',out)};
 AR.onPeerJoin=p=>{out.forEach(r=>rep.send(r,{target:p}))};return AR}
if(out.length)setTimeout(()=>{try{room()}catch(e){}},4000);
V.adminHook=()=>{try{room()}catch(e){}};
const R={};window.CBR=R;
R.open=function(ctx){ctx=ctx||{};const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:200;background:#000a;display:flex;align-items:center;justify-content:center';
 o.innerHTML=`<div style="background:#241009;color:#ffe9c7;border:2px solid #e8a0b0;border-radius:14px;padding:12px;width:min(440px,92vw);max-height:90vh;overflow:auto;font-family:Georgia,serif" id="rpB">
 <h3 style="margin:0 0 6px">🚩 Report to Coffeebreak</h3>${ctx.handle?`<div>About: <b>${esc(ctx.handle)}</b> <small>(${esc(ctx.where||'')})</small></div>`:''}${ctx.text?`<div style="font-size:13px;background:#3a1f12;padding:4px;border-radius:6px;margin:4px 0">“${esc(String(ctx.text).slice(0,300))}”</div>`:''}
 <label>Reason <select id="rpR" style="width:100%"><option>Bullying or harassment</option><option>Hate or abuse</option><option>Sexual content</option><option>Someone may be unsafe</option><option>Spam or scam</option><option>Sharing personal info</option><option>Pretending to be someone</option><option>Something else</option></select></label>
 ${ctx.handle?'':'<label>Who / which post or profile <input id="rpW" maxlength="80" style="width:100%"></label>'}
 <label>Details (optional) <textarea id="rpD" maxlength="1000" rows="3" style="width:100%"></textarea></label>
 <div style="font-size:12px;margin:4px 0">🔒 Sent privately and encrypted, only to Karen at Coffeebreak. It is not sent to anyone else.</div>
 <div style="font-size:12px;color:#ffcf6a">If someone is in immediate danger call 000. Lifeline 13 11 14.</div>
 <div style="margin-top:8px"><button id="rpS">Send report</button> <button id="rpX">Cancel</button></div></div>`;
 document.body.appendChild(o);const g=id=>o.querySelector('#'+id);g('rpX').onclick=()=>o.remove();
 g('rpS').onclick=async()=>{g('rpS').disabled=true;const body={t:Date.now(),reason:g('rpR').value,details:g('rpD').value.trim(),handle:ctx.handle||(g('rpW')?g('rpW').value.trim():''),where:ctx.where||'general',text:String(ctx.text||'').slice(0,500),peer:ctx.peer||'',room:ctx.room||'',by:(window.CB_CHAT&&CB_CHAT.name)||''};
  try{const r=await enc(body);out.push(r);LW('cbrOut',out);room();rep.send(r)}catch(e){}
  ctx.onDone&&ctx.onDone();const P=PR[Math.floor(Math.random()*PR.length)];
  g('rpB').innerHTML=`<h3 style="margin:0 0 6px">💗 Thank you for telling us</h3><p style="font-size:14px">Your report is saved and will reach Karen privately as soon as she's online. You did the right thing.</p>
  <div style="background:#3a1f12;border-radius:10px;padding:8px"><b>🙏 A prayer for you</b><p style="font-style:italic;margin:4px 0">${esc(P.p)}</p><p style="margin:4px 0">“${esc(P.t)}”<br><small>${esc(P.v)} (World English Bible)</small></p></div>
  <div style="font-size:12px;color:#ffcf6a;margin-top:6px">If someone is in immediate danger call 000. Lifeline 13 11 14.</div><button id="rpOk" style="margin-top:8px">Close</button>`;o.querySelector('#rpOk').onclick=()=>o.remove()}};
R.adminHTML=async function(){if(!V.admin)return '';const rows=[];for(const r of inbox.slice().reverse()){try{const d=await dec(r);rows.push({r,d})}catch(e){}}
 const bl=LS('ckBlocked',[]);
 return `<h4 style="margin:6px 0">🚩 Reports inbox (${rows.length})</h4>`+(rows.map(({r,d})=>`<div style="background:#3a1f12;border-radius:8px;padding:5px;margin:3px 0;font-size:13px"><b>${esc(d.reason)}</b> · ${new Date(d.t).toLocaleString()}<br>About: <b>${esc(d.handle||'?')}</b> (${esc(d.where)}${d.room?' #'+esc(d.room):''})${d.by?' · from '+esc(d.by):''}${d.text?`<br>Message: “${esc(d.text)}”`:''}${d.details?`<br>Details: ${esc(d.details)}`:''}<br>${d.peer?`<button data-rb="${esc(d.peer)}">${bl.includes(d.peer)?'✅ Blocked':'🚫 Block sender'}</button> `:''}<button data-rh="${r.id}">🙈 Hide report</button></div>`).join('')||'<small>No reports yet. Reports arrive while you are in admin mode.</small>')};
R.adminWire=function(root){root.querySelectorAll('[data-rb]').forEach(b=>b.onclick=()=>{const bl=LS('ckBlocked',[]);if(!bl.includes(b.dataset.rb)){bl.push(b.dataset.rb);LW('ckBlocked',bl)}b.textContent='✅ Blocked'});
 root.querySelectorAll('[data-rh]').forEach(b=>b.onclick=()=>{inbox=inbox.filter(r=>r.id!==b.dataset.rh);LW('cbrInbox',inbox);V.render&&V.render()})};
const tb=document.createElement('button');tb.dataset.v='report';tb.textContent='🚩 Report';document.getElementById('cbTop').appendChild(tb);
VIEWS.report=async function(){M.innerHTML='<div class="ckWrap"><h2>🚩 Report</h2><p>Report a chat message, CB Radio user, profile or post. Reports go privately to Karen.</p><button id="rpG">Make a report</button><p style="font-size:12px;color:#ffcf6a">If someone is in immediate danger call 000. Lifeline 13 11 14.</p></div>';document.getElementById('rpG').onclick=()=>R.open({where:'general'})};
})();

// ===== ON AIR: clock-synced Coffeebreak radio (everyone hears the same song at the same moment) =====
(function(){
const DUR={"suno-cinnamon-candy-v1.mp3": 28.06, "suno-coffee-break-v1.mp3": 212.21, "suno-coffeebreak-after-dark-v1.mp3": 365.47, "suno-coffeebreak-after-dark-v2.mp3": 387.26, "suno-coffeebreak-after-dark-v3.mp3": 344.95, "suno-coffeebreak-after-dark-v4.mp3": 373.94, "suno-coffeebreak-after-dark-v5.mp3": 361.46, "suno-coffeebreak-after-dark-v6.mp3": 361.46, "suno-coffeebreak-after-dark-v7.mp3": 402.62, "suno-coffeebreak-after-dark-v8.mp3": 321.62, "suno-coffeebreak-after-dark-v9.mp3": 247.2, "suno-drip-drip-drip-country-v1.mp3": 127.58, "suno-drip-drip-drip-country-v2.mp3": 163.46, "suno-drip-drip-drip-country-v3.mp3": 152.4, "suno-drip-drip-drip-country-v4.mp3": 139.58, "suno-drip-drip-drip-country-v5.mp3": 124.54, "suno-im-weak-v1.mp3": 204.36, "suno-im-weak-v2.mp3": 186.79, "suno-knee-deep-mashup-v1.mp3": 347.59, "suno-knee-deep-mashup-v2.mp3": 393.07, "suno-knee-deep-mashup-v3.mp3": 187.58, "suno-knee-deep-mashup-v4.mp3": 202.8, "suno-sweet-juices-cotton-candy-v1.mp3": 50.83, "suno-sweet-juices-cotton-candy-v2.mp3": 60.31, "suno-sweet-juices-cotton-candy-v3.mp3": 94.03, "suno-sweet-juices-cotton-candy-v4.mp3": 81.67, "suno-sweet-juices-cotton-candy-v5.mp3": 55.99, "suno-sweet-juices-cotton-candy-v6.mp3": 96.79, "suno-sweet-juices-cotton-candy-v7.mp3": 131.59, "suno-sweet-juices-cotton-candy-v8.mp3": 82.03, "suno-sweet-juices-cotton-candy-v9.mp3": 75.43, "track1.mp3": 178.15, "track2.mp3": 243.07, "track3.mp3": 18.6, "track4.mp3": 79.08, "track5.mp3": 77.81, "user-upload-1.mp3": 50.83, "user-upload-2.mp3": 202.8};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const EPOCH=Date.UTC(2026,0,1)/1000;
// fixed station order: playlist entries that have a known duration, deterministic shuffle (same on every device)
const LIST=(window.PLAYLIST||[]).filter(p=>DUR[p.file]).map(p=>({file:p.file,title:p.title,d:DUR[p.file]}));
let sd=20261013;const rnd=()=>{sd=(sd*1103515245+12345)%2147483648;return sd/2147483648};
LIST.sort((a,b)=>a.file<b.file?-1:1);for(let i=LIST.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[LIST[i],LIST[j]]=[LIST[j],LIST[i]]}
const TOTAL=LIST.reduce((s,x)=>s+x.d,0);
let OFF=0;// server-clock correction in ms (best effort, from itch's Date header)
fetch(location.href,{method:'HEAD',cache:'no-store'}).then(r=>{const h=r.headers.get('date');if(h&&location.protocol.startsWith('http')){const o=new Date(h).getTime()+500-Date.now();if(Math.abs(o)>2000)OFF=o}}).catch(()=>{});
function at(ms){const t=(((ms+OFF)/1000-EPOCH)%TOTAL+TOTAL)%TOTAL;let a=0;for(let i=0;i<LIST.length;i++){if(t<a+LIST[i].d)return {i,pos:t-a,song:LIST[i],next:LIST[(i+1)%LIST.length],left:a+LIST[i].d-t};a+=LIST[i].d}return {i:0,pos:0,song:LIST[0],next:LIST[1%LIST.length],left:LIST[0].d}}
window.CB_ONAIR={at,LIST,TOTAL};
const SHOWS=[{n:'☀️ Morning Coffee',s:6,e:10,dj:'Good morning, sunshine! You are listening to Morning Coffee on Coffeebreak Radio.'},{n:'🎶 Coffeebreak Mix',s:10,e:15,dj:'This is the Coffeebreak Mix, non-stop songs all day long.'},{n:'🚗 Drive Home',s:15,e:19,dj:'Drive Home on Coffeebreak Radio. Buckle up and sing along!'},{n:'🎶 Evening Mix',s:19,e:21,dj:'Evening Mix on Coffeebreak Radio. Put your feet up.'},{n:'🌙 Late Night',s:21,e:30,dj:'It is Late Night on Coffeebreak Radio. Turn the lights down low.'}];
function show(d){const h=d.getHours();const hh=h<6?h+24:h;return SHOWS.find(s=>hh>=s.s&&hh<s.e)||SHOWS[1]}
const b=document.createElement('button');b.dataset.v='onair';b.textContent='🔴 On Air';document.getElementById('cbTop').appendChild(b);
const st=document.createElement('style');st.textContent='.oaL{display:inline-block;padding:4px 14px;border-radius:8px;font:bold 20px Georgia;letter-spacing:2px;background:#3a1414;color:#7a3a3a;border:2px solid #7a3a3a}.oaL.on{background:#e21b3c;color:#fff;border-color:#ff9aa8;box-shadow:0 0 18px #ff3355,0 0 40px #ff335588;animation:oaP 1.6s infinite}@keyframes oaP{50%{box-shadow:0 0 8px #ff3355}}';document.head.appendChild(st);
const R={el:null,on:false,timer:0,lastI:-1,jingles:true};
function jingle(text){if(!R.jingles||!window.speechSynthesis)return;try{const u=new SpeechSynthesisUtterance(text);u.rate=1.02;u.pitch=1.1;const v=R.el;if(v)v.volume=.35;u.onend=u.onerror=()=>{if(R.el)R.el.volume=1};speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function tune(){const n=at(Date.now());const el=R.el;if(!el)return n;
 if(R.lastI!==n.i||!el.src.endsWith(encodeURI(n.song.file))){const first=R.lastI<0;R.lastI=n.i;el.src='assets/music/'+n.song.file;el.currentTime=0;el.addEventListener('loadedmetadata',()=>{el.currentTime=at(Date.now()).pos},{once:true});el.play().catch(()=>{});
  const sh=show(new Date());jingle(first?sh.dj+' Here is '+n.song.title+'.':'You are tuned to Coffeebreak Radio, '+sh.n.replace(/^\W+/,'')+'. Up now, '+n.song.title+'.')}
 else if(el.readyState>=1&&Math.abs(el.currentTime-n.pos)>2.5)el.currentTime=n.pos;// drift correction
 return n}
function fmt(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function start(){try{music.pause()}catch(e){}try{typeof P!=='undefined'&&P.pause()}catch(e){}if(!R.el){R.el=new Audio();R.el.preload='auto'}R.on=true;R.lastI=-1;tune();clearInterval(R.timer);R.timer=setInterval(()=>{if(R.on){tune();ui()}},1000);ui()}
function stop(){R.on=false;clearInterval(R.timer);if(R.el)R.el.pause();try{speechSynthesis.cancel()}catch(e){}ui()}
function ui(){const g=id=>document.getElementById(id);if(!g('oaNow'))return;const n=at(Date.now()),sh=show(new Date());
 g('oaLt').className='oaL'+(R.on?' on':'');g('oaNow').innerHTML=`<b style="font-size:20px">${esc(n.song.title)}</b><br><small>${fmt(n.pos)} / ${fmt(n.song.d)}</small>`;g('oaBar').style.width=(n.pos/n.song.d*100)+'%';
 g('oaNext').textContent=n.next.title+' in '+fmt(n.left);g('oaShow').textContent=sh.n;g('oaBtn').textContent=R.on?'⏹️ Turn off':'📻 Tune in'}
VIEWS.onair=async function(){
 if(!LIST.length){M.innerHTML='<p>No songs available.</p>';return}
 M.innerHTML=`<div class="ckWrap" style="overflow:auto;text-align:center">
 <div><span id="oaLt" class="oaL">ON AIR</span></div><h2 style="margin:4px 0">📻 Coffeebreak Radio</h2>
 <div>Now on: <b id="oaShow"></b></div>
 <div style="background:#2a160e;border-radius:12px;padding:8px">🎵 Now playing<div id="oaNow"></div><div style="height:6px;background:#3a1f12;border-radius:3px;margin-top:4px"><div id="oaBar" style="height:6px;background:#e8a0b0;border-radius:3px;width:0"></div></div></div>
 <div>⏭️ Up next: <span id="oaNext"></span></div>
 <div><button id="oaBtn" style="font-size:20px">📻 Tune in</button> <label><input type="checkbox" id="oaJ" ${R.jingles?'checked':''}> 🎙️ DJ jingles</label></div>
 <div style="text-align:left;background:#1a0a10;border-radius:10px;padding:6px;font-size:14px"><b>📅 Show schedule</b> <small>(your local time)</small><br>☀️ Morning Coffee 6am–10am<br>🎶 Coffeebreak Mix 10am–3pm<br>🚗 Drive Home 3pm–7pm<br>🎶 Evening Mix 7pm–9pm<br>🌙 Late Night 9pm–6am</div>
 <div style="text-align:left;background:#2a160e;border-radius:10px;padding:6px"><b>💌 Send a dedication</b> <small>(posted live in the Chatroom)</small><br><input id="oaTo" maxlength="30" placeholder="To (e.g. Mum)"> <input id="oaMsg" maxlength="140" placeholder="Message" style="width:60%"> <button id="oaSend">Send 💌</button></div>
 <small>Everyone listening hears the same song at the same moment, set by the clock. ${window.DEMO?'Demo station plays 3 songs; the full app has all 38.':''} ⚠️ Some music may contain adult themes or language. Listener discretion advised.</small></div>`;
 document.getElementById('oaBtn').onclick=()=>R.on?stop():start();document.getElementById('oaJ').onchange=e=>{R.jingles=e.target.checked};
 document.getElementById('oaSend').onclick=()=>{const C=window.CB_CHAT;const to=document.getElementById('oaTo').value.trim(),m=document.getElementById('oaMsg').value.trim();if(!to&&!m)return;
  if(!C||!C.send||!C.name){alert('Join the 💬 Chatroom first (pick a name and a room), then send your dedication.');return}
  const n=at(Date.now());const text='📻💌 Dedication'+(to?' to '+to:'')+': '+(m||'')+' (while '+n.song.title+' is on air)';
  const box=document.getElementById('oaMsg');const T=document.createElement('div');// reuse chat send path
  const msg=CBV.wrap({id:Trystero.selfId+Date.now().toString(36),name:C.name,text},C.name);C.send(msg);C.log.push({...msg,from:Trystero.selfId,t:Date.now()});box.value='';document.getElementById('oaTo').value='';
  if(R.on)jingle('This one goes out'+(to?' to '+to:'')+', from '+C.name+'.');alert('💌 Sent to #'+C.code)};
 ui()};
// keep playing in the background when switching tabs; stop if the main music starts
music.addEventListener('play',()=>{if(R.on)stop()});
})();

startLoop();show('feed');
