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
// ===== Coffeebreak Kids: Fidget Spinner =====
const S=kStore('kidsSpinner',{best:0,designs:[],cur:null});const G={state:'title',score:S.stars,level:0};window.G=G;
const SHAPES=[['Classic',0],['Round',0],['Star',5],['Heart',10],['Flower',15],['Gear',20]];
const ARMS=[[2,0],[3,0],[4,5],[5,10],[6,15]];
const COLS=['#ff4f9a','#3a8aff','#3ac060','#ffb020','#b06aff','#ff6a3a','#20c8c8','#222222','#f4f4f4','#ffd700'];
const LEDS=[['None',0],['Rainbow',0],['Pulse',5],['Chase',10],['Sparkle',15]];
const BEAR=[['Steel',0,.18,.06],['Ceramic',10,.10,.035],['Hybrid',20,.06,.02]];// name,cost,lin,quad friction
const PRESET=[{sh:0,arms:3,c1:0,c2:8,gl:true,led:1,b:0},{sh:1,arms:3,c1:1,c2:9,gl:false,led:0,b:0}];
let D=Object.assign({},S.cur&&!DEMO?S.cur:PRESET[0]);let ang=0,w=0,spinT=0,spinning=false,mode='play',last=null,drag=null,toss=null,bal=null,msg='',msgT=0;
const CX=450,CY=330;
// whirr
let wh=null;function whirr(){if(wh)return;try{window._AC=window._AC||new AudioContext();const A=window._AC;A.resume();const b=A.createBuffer(1,A.sampleRate*2,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=A.createBufferSource();s.buffer=b;s.loop=true;const f=A.createBiquadFilter();f.type='bandpass';f.Q.value=4;const g2=A.createGain();g2.gain.value=0;s.connect(f);f.connect(g2);g2.connect(A.destination);s.start();wh={f,g:g2,A}}catch(e){}}
function setWhirr(){if(!wh)return;const v=Math.min(1,Math.abs(w)/40);wh.f.frequency.setTargetAtTime(150+Math.abs(w)*25,wh.A.currentTime,.05);wh.g.gain.setTargetAtTime(v*(mode==='calm'?.05:.09),wh.A.currentTime,.1)}
function toast(m){msg=m;msgT=2}
function drawSpinner(X,Y,R,a,d,glowT){const n=ARMS[d.arms<2?0:ARMS.findIndex(z=>z[0]===d.arms)][0],c1=COLS[d.c1],c2=COLS[d.c2],sh=d.sh;x.save();x.translate(X,Y);x.rotate(a);
 const blur=Math.min(1,Math.abs(w)/30);
 for(let i=0;i<n;i++){x.save();x.rotate(i/n*Math.PI*2);const ar=R*.62;
  x.fillStyle=c1;x.beginPath();if(sh===1){x.arc(0,-ar,R*.36,0,7)}else if(sh===2){for(let k=0;k<10;k++){const rr2=k%2?R*.16:R*.38,aa=k/10*Math.PI*2;x.lineTo(Math.sin(aa)*rr2,-ar+Math.cos(aa)*rr2)}}else if(sh===3){const s2=R*.022;x.moveTo(0,-ar+12*s2);x.bezierCurveTo(-18*s2,-ar-2*s2,-10*s2,-ar-18*s2,0,-ar-8*s2);x.bezierCurveTo(10*s2,-ar-18*s2,18*s2,-ar-2*s2,0,-ar+12*s2)}else if(sh===4){for(let k=0;k<5;k++){const aa=k/5*Math.PI*2;x.moveTo(Math.cos(aa)*R*.2,-ar+Math.sin(aa)*R*.2);x.arc(Math.cos(aa)*R*.2,-ar+Math.sin(aa)*R*.2,R*.17,0,7)}}else if(sh===5){for(let k=0;k<16;k++){const rr2=k%2?R*.3:R*.38,aa=k/16*Math.PI*2;x.lineTo(Math.sin(aa)*rr2,-ar+Math.cos(aa)*rr2)}}else{x.ellipse(0,-ar*.6,R*.3,R*.62,0,0,7)}x.fill();
  x.fillStyle=c1;x.fillRect(-R*.16,-ar,R*.32,ar);
  x.fillStyle='#ccc';x.beginPath();x.arc(0,-ar,R*.2,0,7);x.fill();x.fillStyle=d.b===1?'#fafafa':d.b===2?'#888':'#aaa';x.beginPath();x.arc(0,-ar,R*.14,0,7);x.fill();
  if(d.led){const on=d.led===1?true:d.led===2?Math.sin(glowT*4)>0:d.led===3?Math.floor(glowT*8)%n===i:Math.random()<.5;if(on){const col=d.led===1?'hsl('+((i/n*360+glowT*120)%360)+',100%,60%)':'#7af0ff';x.shadowColor=col;x.shadowBlur=30;x.fillStyle=col;x.beginPath();x.arc(0,-ar*.45,R*.07,0,7);x.fill();x.shadowBlur=0}}
  x.restore()}
 x.fillStyle=c1;x.beginPath();x.arc(0,0,R*.32,0,7);x.fill();x.fillStyle=c2;x.beginPath();x.arc(0,0,R*.2,0,7);x.fill();x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(-R*.06,-R*.06,R*.06,0,7);x.fill();
 if(d.gl){for(let k=0;k<30;k++){const aa=k*2.4,rr2=(k*37%100)/100*R*.9;x.fillStyle='rgba(255,255,255,'+(.4+.4*Math.sin(glowT*5+k))+')';x.fillRect(Math.cos(aa)*rr2,Math.sin(aa)*rr2,3,3)}}
 x.restore();if(blur>.3){x.globalAlpha=blur*.25;x.fillStyle=c1;x.beginPath();x.arc(X,Y,R*.95,0,7);x.fill();x.globalAlpha=1}}
function locked(cost){return S.stars<cost}
function drawTitle(){kbg('#e0e8ff','#ffe0f4');T('Coffeebreak Kids',450,90,34,'#ff4f9a','center');T('Fidget Spinner',454,164,62,'#ff5a9a','center');T('Fidget Spinner',450,160,62,'#fff','center');ang+=.15;drawSpinner(330,350,110,ang,PRESET[0],t);seal(640,380,.9,'wave');kb('go',330,480,240,70,'🌀 Let\'s spin!',()=>{G.state='spin';whirr()},{fs:26})}
function drawSpin(){if(mode==='calm'){const g2=x.createRadialGradient(450,300,40,450,300,600);g2.addColorStop(0,'#2a2a5a');g2.addColorStop(1,'#05051a');x.fillStyle=g2;x.fillRect(0,0,900,600)}else kbg('#e0e8ff','#ffe0f4');
 let sx=CX,sy=CY;if(toss){sx=toss.x;sy=toss.y}if(bal){sx=bal.x;sy=bal.y-90;emo('☝️',bal.x,bal.y,70)}
 drawSpinner(sx,sy,toss?90:140,ang,D,t);
 if(mode!=='calm'){starBar(S);x.fillStyle='rgba(255,255,255,.85)';rr(220,10,460,40,20);x.fill();T('⏱️ '+spinT.toFixed(1)+'s   🏆 Best '+S.best.toFixed(1)+'s   '+Math.round(Math.abs(w)*9.55)+' RPM',450,38,18,'#3a7ad8','center')}
 else T('Calm mode. Swipe gently and breathe…',450,60,18,'rgba(255,255,255,.5)','center','');
 T(bal?'Keep your finger under it!':toss?'Tap the spinner to catch it!':'Swipe around the spinner to flick it!',450,100,18,mode==='calm'?'rgba(255,255,255,.4)':'#7a4a8a','center','');
 const b=[['🎨 Design',()=>{G.state='design'}],['🤹 Toss',()=>{if(Math.abs(w)<8){toast('Spin it faster first!');return}toss={x:CX,y:CY,vy:-900,t:0}}],['☝️ Balance',()=>{if(Math.abs(w)<8){toast('Spin it faster first!');return}bal={x:CX,y:CY+90,t:0,ox:0,vx:(Math.random()-.5)*60}}],[mode==='calm'?'🌈 Play mode':'🌙 Calm mode',()=>{mode=mode==='calm'?'play':'calm'}]];
 b.forEach((q,i)=>kb('b'+i,40+i*210,520,195,60,q[0],q[1],{bg:mode==='calm'?'#3a3a6a':['#ff6fae','#4ab0e8','#3ac060','#b06aff'][i],fs:19}))}
function opt(id,X,Y,w2,label,cost,sel,fn){const lk=!DEMO&&locked(cost);kb(id,X,Y,w2,44,(lk?'🔒'+cost+'⭐ ':'')+label,()=>{if(DEMO){window.demoEnd&&window.demoEnd(dEnd);return}if(lk){toast('Earn '+cost+' stars to unlock!');oops();return}fn()},{sel,bg:'#4ab0e8',fs:15})}
const dEnd='Spin-tastic! The full game lets you design your own spinners with 6 shapes, up to 6 arms, 10 colours, glitter, LED patterns and bearings, and save them.';
function drawDesign(){kbg('#fff3c4','#e0e8ff');starBar(S);T('Design your spinner',450,45,30,'#ff4f9a','center');ang+=.03;drawSpinner(200,300,140,ang,D,t);
 if(DEMO){T('Demo: pick a design',600,110,20,'#2a3a5a','center');PRESET.forEach((p,i)=>kb('pr'+i,480,130+i*70,240,56,'Design '+(i+1),()=>{D=Object.assign({},p)},{bg:'#ff6fae',fs:20}));kb('more',480,300,240,56,'🔒 Make your own',()=>window.demoEnd&&window.demoEnd(dEnd),{bg:'#a0a8c0',fs:18})}
 else{let y=80;T('Shape',400,y+28,16,'#2a3a5a');SHAPES.forEach((s,i)=>opt('sh'+i,460+(i%3)*140,y+(i>2?50:0),132,s[0],s[1],D.sh===i,()=>D.sh=i));y+=105;
  T('Arms',400,y+28,16,'#2a3a5a');ARMS.forEach((a,i)=>opt('ar'+i,460+i*86,y,80,''+a[0],a[1],D.arms===a[0],()=>D.arms=a[0]));y+=55;
  T('Colour',400,y+28,16,'#2a3a5a');COLS.forEach((c,i)=>kb('c1'+i,460+i*42,y,36,40,'',()=>D.c1=i,{bg:c,sel:D.c1===i}));y+=48;T('Centre',400,y+28,16,'#2a3a5a');COLS.forEach((c,i)=>kb('c2'+i,460+i*42,y,36,40,'',()=>D.c2=i,{bg:c,sel:D.c2===i}));y+=55;
  T('LEDs',400,y+28,16,'#2a3a5a');LEDS.forEach((l,i)=>opt('le'+i,460+i*86,y,82,l[0],l[1],D.led===i,()=>D.led=i));y+=55;
  T('Bearing',400,y+28,16,'#2a3a5a');BEAR.forEach((b,i)=>opt('be'+i,460+i*140,y,132,b[0],b[1],D.b===i,()=>D.b=i));y+=55;
  kb('gl',460,y,200,44,D.gl?'✨ Glitter ON':'Glitter OFF',()=>D.gl=!D.gl,{bg:'#b06aff',fs:16});kb('sv',670,y,200,44,'💾 Save design',()=>{S.designs.push(Object.assign({},D));if(S.designs.length>8)S.designs.shift();S.cur=Object.assign({},D);reward(S,1,'Design saved!')},{bg:'#3ac060',fs:16});
  S.designs.forEach((d,i)=>{BTN['sd'+i]={x:30+i*45,y:470,w:42,h:42,fn:()=>{D=Object.assign({},d)}};drawSpinner(51+i*45,491,20,0,d,t)})}
 kb('bk',40,530,200,56,'🌀 Spin it!',()=>{S.cur=Object.assign({},D);S.save();G.state='spin'},{bg:'#ff6fae',fs:22})}
bindInput({down(p){if(G.state!=='spin')return;if(toss){if(Math.hypot(p.x-toss.x,p.y-toss.y)<110&&toss.vy>0){yay();reward(S,2,'Nice catch!');toss=null}return}last={x:p.x,y:p.y,t:performance.now()};drag=true},
 move(p){if(G.state!=='spin')return;if(bal){bal.x=bal.x*0+p.x;bal.y=Math.max(300,Math.min(480,p.y))}if(!drag||!last)return;const rx=last.x-CX,ry=last.y-CY,r=Math.hypot(rx,ry);if(r>30){const dt=Math.max(1,performance.now()-last.t)/1000;const cross=(rx*(p.y-last.y)-ry*(p.x-last.x))/(r*r);const add=cross/dt*(BEAR[D.b][0]==='Hybrid'?1:1);w+=Math.max(-12,Math.min(12,add*.35));if(Math.abs(w)>1&&!spinning){spinning=true;spinT=0}}last={x:p.x,y:p.y,t:performance.now()}},
 up(){drag=false;last=null}});
function update(dt){const B=BEAR[D.b];const aw=Math.abs(w);const dec=(B[2]+B[3]*aw)*(mode==='calm'?.8:1)*.25;w=w>0?Math.max(0,w-dec*dt*aw*.25-dec*dt*2):Math.min(0,w+dec*dt*aw*.25+dec*dt*2);w=Math.max(-70,Math.min(70,w));ang+=w*dt;
 if(spinning){spinT+=dt;if(Math.abs(w)<.3){spinning=false;if(spinT>S.best&&spinT>3){S.best=spinT;G.level=Math.round(spinT);reward(S,2,'New record '+spinT.toFixed(1)+'s!')}else if(spinT>15&&Math.random()<.5)reward(S,1,'Super spin!')}}
 if(toss){toss.t+=dt;toss.vy+=1500*dt;toss.y+=toss.vy*dt;if(toss.y>620){oops();toast('Dropped it! Try again.');toss=null;w*=.3}}
 if(bal){bal.t+=dt;bal.ox+=bal.vx*dt;bal.vx+=(Math.random()-.5)*400*dt+bal.ox*1.5*dt;if(Math.abs(w)<4){if(bal.t>3)reward(S,Math.min(3,Math.floor(bal.t/4)+1),'Balanced '+bal.t.toFixed(1)+'s!');bal=null}else if(Math.abs(bal.ox)>140){oops();toast('It wobbled off!');bal=null}else bal.x+=0}
 if(G.state==='spin')setWhirr();else if(wh)wh.g.gain.setTargetAtTime(0,wh.A.currentTime,.1);if(msgT>0)msgT-=dt}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='spin')drawSpin();else if(s==='design')drawDesign();else stickerBook(S,()=>{G.state='spin'});
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(250,450,400,50,20);x.fill();T(msg,450,482,18,'#ff4f9a','center');x.globalAlpha=1}kOverlay(1/60)}
window.KSP={G,S,get w(){return w},set w(v){w=v;spinning=true;spinT=0},get D(){return D},setD:d=>{D=d}};startLoop();
