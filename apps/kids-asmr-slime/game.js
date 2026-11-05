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
// ===== Coffeebreak Kids shared helpers =====
window.FONT='"Comic Sans MS","Chalkboard SE","Comic Neue","Trebuchet MS",sans-serif';const KF=window.FONT;
const DEMO=!!window.DEMO;
const STK=['🦭','🌈','🦄','🐬','🍭','🌟','🐙','🦋','🍩','🐢','🚀','🌻','🐳','🧁','🦊','🐝','🎈','🐠','🍓','🦖','🪐','🐧','🎨','🏆'];
function kStore(key,def){let s=Object.assign({stars:0,stk:[]},def||{});try{Object.assign(s,JSON.parse(localStorage.getItem(key+(DEMO?'D':''))||'{}'))}catch(e){}s.save=()=>{try{localStorage.setItem(key+(DEMO?'D':''),JSON.stringify(Object.assign({},s,{save:undefined})))}catch(e){}};return s}
let CONF=[],POP=null;
function confetti(n){for(let i=0;i<(n||60);i++)CONF.push({x:450+(Math.random()-.5)*300,y:250,vx:(Math.random()-.5)*500,vy:-Math.random()*500-100,c:['#ff4f9a','#ffd24a','#40c8ff','#5ad870','#b06aff','#ff8a3d'][i%6],r:Math.random()*6,l:2})}
function kTone(f,d,v,tp){try{window._AC=window._AC||new AudioContext();const A=window._AC;if(A.state==='suspended')A.resume();const o=A.createOscillator(),g=A.createGain();o.type=tp||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.06,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+d)}catch(e){}}
function yay(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>kTone(f,.18,.06,'triangle'),i*90))}
function oops(){kTone(220,.25,.06,'triangle')}
function speak(s){try{const u=new SpeechSynthesisUtterance(s);u.lang='en-AU';u.rate=.9;u.pitch=1.2;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function reward(S,n,txt){S.stars+=n||1;let nw=null;while(S.stk.length<STK.length&&S.stars>=(S.stk.length+1)*5){nw=STK[S.stk.length];S.stk.push(nw)}S.save();confetti();yay();POP={t:0,txt:txt||'Great job!',stk:nw};if(G)G.score=S.stars}
function kbg(c1,c2){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<9;i++){x.beginPath();x.arc((i*137+t*12)%960-30,80+(i*97)%460,14+i%4*8,0,7);x.fill()}}
function kb(id,X,Y,w,h,label,fn,o={}){const col=o.bg||'#ff6fae';BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:(p)=>{kTone(660,.06,.04);fn(p)}};x.globalAlpha=o.dis?.45:1;x.fillStyle='rgba(0,0,0,.18)';rr(X,Y+5,w,h,h*.3);x.fill();x.fillStyle=o.sel&&label!==''?'#ffd24a':col;rr(X,Y,w,h,h*.3);x.fill();x.strokeStyle=o.sel&&label===''?'#2a3a5a':'#fff';x.lineWidth=o.sel?6:3;x.stroke();
 x.fillStyle=o.fg||'#fff';x.font='bold '+(o.fs||Math.min(26,h*.42))+'px '+KF;x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+2);x.textBaseline='alphabetic';x.textAlign='left';x.globalAlpha=1}
function seal(X,Y,s,mood){x.save();x.translate(X,Y+Math.sin(t*3)*3*s);x.scale(s,s);const b='#9aa8b8',d='#7a889a';
 x.fillStyle=d;x.beginPath();x.ellipse(-55,40,26,12,-.5,0,7);x.ellipse(-60,26,22,10,.6,0,7);x.fill();
 x.fillStyle=b;x.beginPath();x.ellipse(0,30,62,40,0,0,7);x.fill();x.beginPath();x.ellipse(28,-12,40,36,0,0,7);x.fill();x.fillStyle='#dfe6ee';x.beginPath();x.ellipse(10,42,38,20,0,0,7);x.fill();
 x.fillStyle=d;x.beginPath();x.ellipse(mood==='wave'?44:20,mood==='wave'?10+Math.sin(t*10)*6:48,10,22,mood==='wave'?-1+Math.sin(t*10)*.4:.6,0,7);x.fill();
 x.fillStyle='#1a1a24';x.beginPath();x.arc(14,-18,7,0,7);x.arc(44,-18,7,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(16,-21,2.5,0,7);x.arc(46,-21,2.5,0,7);x.fill();
 x.fillStyle='#3a2a30';x.beginPath();x.ellipse(30,-4,7,5,0,0,7);x.fill();x.strokeStyle='#3a2a30';x.lineWidth=2;x.beginPath();if(mood==='sad')x.arc(30,12,6,3.6,5.8);else x.arc(30,2,7,.3,Math.PI-.3);x.stroke();
 x.strokeStyle='rgba(60,60,70,.6)';x.lineWidth=1.2;[[-1,-3],[1,-3],[-1,2],[1,2]].forEach(([a,o])=>{x.beginPath();x.moveTo(30+a*8,o);x.lineTo(30+a*30,o+(o<0?-4:4));x.stroke()});
 x.fillStyle='rgba(255,120,150,.45)';x.beginPath();x.arc(6,-2,6,0,7);x.arc(54,-2,6,0,7);x.fill();x.restore()}
function bubbleK(s,X,Y,w){x.font='bold 18px '+KF;const lines=Math.ceil(x.measureText(s).width/(w-24))+0;x.fillStyle='#fff';rr(X,Y,w,22+lines*22,16);x.fill();x.strokeStyle='#4ab0e8';x.lineWidth=3;x.stroke();x.fillStyle='#2a3a5a';wrapT(s,X+12,Y+26,w-24,22)}
function kOverlay(dt){CONF.forEach(p=>{p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r+=dt*8);x.fillRect(-5,-3,10,6);x.restore()});CONF=CONF.filter(p=>p.l>0&&p.y<620);
 if(POP){POP.t+=dt;const k=Math.min(1,POP.t*4),a=POP.t>1.8?Math.max(0,1-(POP.t-1.8)*3):1;x.globalAlpha=a;x.save();x.translate(450,90);x.scale(k,k);x.fillStyle='#fff';rr(-200,-40,400,POP.stk?110:70,24);x.fill();x.strokeStyle='#ffd24a';x.lineWidth=5;x.stroke();T('⭐ '+POP.txt,0,6,28,'#ff4f9a','center');if(POP.stk)T('New sticker! '+POP.stk,0,52,24,'#3a7ad8','center');x.restore();x.globalAlpha=1;if(POP.t>2.2)POP=null}}
function starBar(S){x.fillStyle='rgba(255,255,255,.85)';rr(14,10,190,40,20);x.fill();T('⭐ '+S.stars+'   🏷️ '+S.stk.length,30,38,20,'#ff7a00','left')}
function stickerBook(S,back){kbg('#fff3c4','#ffd6e8');T('My Sticker Book',450,60,38,'#ff4f9a','center');T('Earn a new sticker every 5 stars!',450,92,18,'#7a4a8a','center','');
 STK.forEach((s,i)=>{const X=95+(i%8)*92,Y=120+Math.floor(i/8)*120;x.fillStyle='#fff';rr(X-40,Y,80,100,16);x.fill();if(i<S.stk.length)emo(s,X,Y+50,52);else{x.globalAlpha=.25;emo('❔',X,Y+50,40);x.globalAlpha=1}});kb('sb',350,500,200,60,'⬅ Back',back,{bg:'#4ab0e8'})}
// ---- original kids music: rhythm-track sync ----
let RT=null;
function rhythmTrack(file,title,lead){RT={file,lead:lead||0};try{music.src='assets/music/'+file;$('np').textContent='Now playing: '+title;started=true;music.currentTime=0;music.play().catch(()=>{})}catch(e){}}
function rhythmTime(fb){try{if(RT&&music.src.indexOf(RT.file)>=0&&!music.paused&&music.currentTime>0)return music.currentTime-RT.lead}catch(e){}return fb}
function rhythmEnd(){if(!RT)return;RT=null;load();if(started&&!muted)music.play().catch(()=>{})}
// ===== Coffeebreak Kids: ASMR Slime =====
const S=kStore('kidsSlime',{shelf:[]});const G={state:'title',score:S.stars,level:0};window.G=G;
const COLS=[['Bubblegum','#ff8ac8'],['Sky','#7ac8ff'],['Lime','#9aea5a'],['Grape','#b88aff'],['Sunshine','#ffd84a'],['Peach','#ffb08a'],['Mint','#7aeacc'],['Galaxy','#5a4ab8'],['Cloud','#f4f4ff'],['Rainbow','rainbow']];
const ADD=[['glitter','✨ Glitter'],['beads','🫧 Foam beads'],['charms','🌟 Charms'],['clear','💧 Clear & shiny']];
const CHARMS=['⭐','🦄','🍓','🌈','🦭','🍩','💖','🐬','🌸','🍭'];
const NC=DEMO?3:COLS.length,NA=DEMO?1:ADD.length;
let sl={c:0,add:{},charms:[]};const NP=48,R0=150,CX=450,CY=320;let P=[],swirl=0,grab=null,last=null,speck=[];
function initSlime(){P=[];for(let i=0;i<NP;i++){const a=i/NP*Math.PI*2;P.push({a,r:R0,v:0,ox:0,oy:0,vx:0,vy:0})}swirl=0;speck=[];for(let i=0;i<90;i++)speck.push({a:Math.random()*7,d:Math.sqrt(Math.random())*.85,k:Math.random()})}
initSlime();
// ---- ASMR sounds ----
function AC(){window._AC=window._AC||new AudioContext();if(window._AC.state==='suspended')window._AC.resume();return window._AC}
function noise(d,v,f,q,tp){try{const A=AC(),b=A.createBuffer(1,A.sampleRate*d,A.sampleRate),c2=b.getChannelData(0);for(let i=0;i<c2.length;i++)c2[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/c2.length);const s=A.createBufferSource();s.buffer=b;const fl=A.createBiquadFilter();fl.type=tp||'bandpass';fl.frequency.value=f;fl.Q.value=q||1;const g=A.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(A.destination);s.start()}catch(e){}}
let sndT=0;
function squish(k){if(sndT>0)return;sndT=.09;noise(.18+Math.random()*.12,.25*(k||1),300+Math.random()*500,2.5,'lowpass');if(sl.add.clear)kTone(180+Math.random()*80,.12,.03,'sine')}
function crunch(){for(let i=0;i<5;i++)setTimeout(()=>noise(.03,.18,2500+Math.random()*3000,3,'bandpass'),i*35+Math.random()*30)}
function pop(){noise(.06,.3,900,6);kTone(700+Math.random()*300,.08,.04,'sine')}
// ---- physics ----
function pt(i){const p=P[i];return{x:CX+Math.cos(p.a)*p.r+p.ox,y:CY+Math.sin(p.a)*p.r*.78+p.oy}}
function update(dt){if(sndT>0)sndT-=dt;if(G.state!=='play')return;
 for(let i=0;i<NP;i++){const p=P[i],l=P[(i+NP-1)%NP],n=P[(i+1)%NP];const avg=(l.r+n.r)/2;p.v+=((R0-p.r)*22+(avg-p.r)*60)*dt;p.v*=Math.pow(.02,dt);
  p.vx+=(-p.ox*16+((l.ox+n.ox)/2-p.ox)*50)*dt;p.vy+=(-p.oy*16+((l.oy+n.oy)/2-p.oy)*50)*dt;p.vx*=Math.pow(.03,dt);p.vy*=Math.pow(.03,dt)}
 if(grab){P.forEach((p,i)=>{const d=Math.min(Math.abs(i-grab.i),NP-Math.abs(i-grab.i));const ww=Math.max(0,1-d/9);if(ww>0){const q=pt(i);p.vx+=(grab.x-q.x)*ww*30*dt;p.vy+=(grab.y-q.y)*ww*30*dt}})}
 P.forEach(p=>{p.r+=p.v*dt;p.ox+=p.vx*dt;p.oy+=p.vy*dt;p.r=Math.max(40,Math.min(260,p.r))});swirl*=Math.pow(.6,dt)}
function fillCol(){const c=COLS[sl.c][1];if(c==='rainbow'){const g=x.createLinearGradient(CX-200,0,CX+200,0);['#ff6a8a','#ffb04a','#ffe04a','#7ae05a','#4ac0ff','#b06aff'].forEach((q,i)=>g.addColorStop(i/5,q));return g}return c}
function drawSlime(X,Y,sc,o){x.save();x.translate(X,Y);x.scale(sc,sc);x.translate(-CX,-CY);x.beginPath();for(let i=0;i<=NP;i++){const a=pt(i%NP),b=pt((i+1)%NP);const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;i===0?x.moveTo(mx,my):x.quadraticCurveTo(a.x,a.y,mx,my)}x.closePath();
 x.fillStyle='rgba(0,0,0,.12)';x.save();x.translate(0,14);x.fill();x.restore();x.globalAlpha=(o.add.clear?.75:1);x.fillStyle=fillCol();x.fill();x.globalAlpha=1;x.save();x.clip();
 const g=x.createRadialGradient(CX-60,CY-70,10,CX,CY,220);g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(.35,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.12)');x.fillStyle=g;x.fillRect(CX-300,CY-300,600,600);
 x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=6;for(let k=0;k<4;k++){x.beginPath();x.arc(CX,CY,30+k*35,swirl*(1+k*.3)+k,swirl*(1+k*.3)+k+2.2);x.stroke()}
 const avR=P.reduce((s2,p)=>s2+p.r,0)/NP,cx2=P.reduce((s2,p)=>s2+p.ox,0)/NP,cy2=P.reduce((s2,p)=>s2+p.oy,0)/NP;
 speck.forEach((s2,i)=>{const a=s2.a+swirl*(1-s2.d),px=CX+cx2+Math.cos(a)*s2.d*avR,py=CY+cy2+Math.sin(a)*s2.d*avR*.78;
  if(o.add.glitter&&i%2===0){x.fillStyle=['#fff','#ffe680','#ffc0f0','#c0f0ff'][i%4];x.globalAlpha=.5+.5*Math.sin(t*6+i);x.fillRect(px,py,4,4);x.globalAlpha=1}
  if(o.add.beads&&i%3===1){x.fillStyle=['#fff','#ffd0e8','#d0f0ff','#fff0b0'][i%4];x.beginPath();x.arc(px,py,7,0,7);x.fill();x.strokeStyle='rgba(0,0,0,.08)';x.lineWidth=1;x.stroke()}});
 (o.charms||[]).forEach((c,i)=>{const a=i*2.4+swirl*.5,px=CX+cx2+Math.cos(a)*avR*.45,py=CY+cy2+Math.sin(a)*avR*.35;emo(c,px,py,34)});
 x.restore();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(CX-70+P[0].ox*.3,CY-80,40,14,-.4,0,7);x.fill();x.restore()}
// ---- screens ----
function drawTitle(){kbg('#ffd6f0','#d6f0ff');T('Coffeebreak Kids',450,90,34,'#ff4f9a','center');T('ASMR Slime',454,164,66,'#ff5a9a','center');T('ASMR Slime',450,160,66,'#fff','center');update(1/60);drawSlime(450,320,.75,{add:{glitter:1,beads:1},charms:['🦄','⭐']});seal(720,420,.8,'wave');kb('go',330,480,240,70,'💖 Make slime!',()=>{G.state='make'},{fs:26})}
function drawMake(){kbg('#ffe6f6','#e0f4ff');starBar(S);T('Make your slime',450,50,34,'#ff4f9a','center');drawSlime(450,300,.75,{add:sl.add,charms:sl.charms});
 COLS.forEach((c,i)=>{const X=30+(i%5)*56,Y=110+Math.floor(i/5)*60,lock=i>=NC;kb('c'+i,X,Y,48,48,lock?'🔒':'',()=>{if(lock){toast('More colours in the full game!');return}sl.c=i;squish(1)},{bg:c[1]==='rainbow'?'#ff9a6a':c[1],sel:sl.c===i,dis:false})});
 T(COLS[sl.c][0],170,250,18,'#7a4a8a','center');
 ADD.forEach((a,i)=>{const lock=i>=NA;kb('a'+i,620,100+i*62,250,52,(lock?'🔒 ':'')+a[1],()=>{if(lock){toast('More add-ins in the full game!');return}sl.add[a[0]]=!sl.add[a[0]];a[0]==='beads'?crunch():pop()},{bg:sl.add[a[0]]?'#3ac060':'#b06aff',fs:18})});
 if(!DEMO){T('Charms (tap to add):',30,310,16,'#7a4a8a','left');CHARMS.forEach((c,i)=>kb('ch'+i,30+(i%5)*54,320+Math.floor(i/5)*54,48,48,c,()=>{if(sl.charms.length<6){sl.charms.push(c);pop()}},{bg:'#fff',fs:24}));kb('clr',30,430,260,40,'Remove charms',()=>{sl.charms=[]},{bg:'#a0a8c0',fs:16})}
 kb('play',330,500,240,70,'👐 Play!',()=>{initSlime();G.state='play'},{bg:'#ff6fae',fs:28});kb('sh',620,500,250,60,'🫙 My shelf ('+S.shelf.length+')',()=>{G.state='shelf'},{bg:'#4ab0e8',fs:20})}
function drawPlay(){kbg('#fff0fa','#e6f6ff');drawSlime(450,320,1,{add:sl.add,charms:sl.charms});x.fillStyle='rgba(255,255,255,.85)';rr(200,10,500,40,20);x.fill();T('Poke · Stretch · Squish · Swirl!',450,38,20,'#b06aff','center');
 kb('sq',20,510,150,60,'🤲 Squish',()=>{P.forEach(p=>p.v-=380);setTimeout(()=>P.forEach(p=>p.v+=200),120);squish(1.6);if(sl.add.beads)crunch()},{bg:'#ff6fae',fs:20});
 kb('sw',180,510,150,60,'🌀 Swirl',()=>{swirl+=5;squish(.8)},{bg:'#b06aff',fs:20});
 kb('sv',570,510,150,60,'🫙 Save',()=>{if(S.shelf.length>=12)S.shelf.shift();S.shelf.push({c:sl.c,add:Object.assign({},sl.add),charms:sl.charms.slice()});reward(S,1,'Slime saved!')},{bg:'#3ac060',fs:20});
 kb('bk',730,510,150,60,'🎨 Change',()=>{G.state='make'},{bg:'#4ab0e8',fs:20})}
function drawShelf(){kbg('#fff3c4','#ffe0f0');T('My Slime Shelf',450,60,38,'#ff4f9a','center');for(let r=0;r<2;r++){x.fillStyle='#c08a5a';x.fillRect(60,280+r*190,780,16)}
 if(!S.shelf.length)T('Save a slime to put it on your shelf!',450,200,22,'#7a4a8a','center','');
 S.shelf.forEach((s2,i)=>{const X=110+(i%6)*130,Y=200+Math.floor(i/6)*190;x.fillStyle='rgba(220,240,255,.6)';rr(X-45,Y-60,90,120,14);x.fill();x.strokeStyle='#fff';x.lineWidth=3;x.stroke();const c=COLS[s2.c][1];x.fillStyle=c==='rainbow'?'#ff9a6a':c;rr(X-38,Y-10,76,62,12);x.fill();x.fillStyle='#ff8ac8';x.fillRect(X-48,Y-70,96,14);if(s2.add.glitter)emo('✨',X-14,Y+20,20);if(s2.charms[0])emo(s2.charms[0],X+14,Y+22,22);
  BTN['j'+i]={x:X-45,y:Y-70,w:90,h:130,fn:()=>{sl={c:s2.c,add:Object.assign({},s2.add),charms:s2.charms.slice()};initSlime();G.state='play';pop()}}});
 kb('bk',330,520,240,60,'⬅ Back',()=>{G.state='make'},{bg:'#4ab0e8'});kb('stk',700,15,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
let msg='',msgT=0;function toast(m){msg=m;msgT=2.5;oops();if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('So squishy! The full game has 10 colours (including Galaxy and Rainbow), foam beads, charms, clear slime and the full sticker book.'),900)}
let pokes=0;
bindInput({down(p){if(G.state!=='play')return;let bi=0,bd=1e9;for(let i=0;i<NP;i++){const q=pt(i),d=Math.hypot(q.x-p.x,(q.y-p.y));if(d<bd){bd=d;bi=i}}
  const ins=Math.hypot(p.x-CX,(p.y-CY)/.78)<P[bi].r;if(bd<70&&!ins){grab={i:bi,x:p.x,y:p.y};squish(.7)}else if(ins){const a=Math.atan2((p.y-CY)/.78,p.x-CX);P.forEach(q=>{const da=Math.abs(Math.atan2(Math.sin(q.a-a),Math.cos(q.a-a)));q.v-=Math.max(0,1-da/1.2)*260});squish(1);if(sl.add.beads)crunch();pokes++;if(pokes%25===0)reward(S,1,'So satisfying!')}last=p},
 move(p){if(G.state!=='play')return;if(grab){grab.x=p.x;grab.y=p.y;if(Math.random()<.15)squish(.5)}else if(last&&(window._down)){const a1=Math.atan2(last.y-CY,last.x-CX),a2=Math.atan2(p.y-CY,p.x-CX);let da=Math.atan2(Math.sin(a2-a1),Math.cos(a2-a1));swirl+=da*1.5;if(Math.abs(da)>.02&&Math.random()<.2)squish(.4)}last=p},
 up(){grab=null;last=null}});
addEventListener('mousedown',()=>window._down=1);addEventListener('mouseup',()=>window._down=0);addEventListener('touchstart',()=>window._down=1);addEventListener('touchend',()=>window._down=0);
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,make:drawMake,play:drawPlay,shelf:drawShelf,stk:()=>stickerBook(S,()=>{G.state='shelf'})})[s]();
 if(msgT>0){msgT-=1/60;x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(250,440,400,50,20);x.fill();T(msg,450,472,18,'#b06aff','center');x.globalAlpha=1}
kOverlay(1/60)}
window.KSL={G,S,sl,get P(){return P},initSlime};startLoop();
