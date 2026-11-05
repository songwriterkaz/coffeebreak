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
// ===== Coffeebreak Kids: Singing School =====
const S=kStore('kidsSing',{badges:[],done:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
function AC(){window._AC=window._AC||new AudioContext();if(window._AC.state==='suspended')window._AC.resume();return window._AC}
const NN=['C','D','E','F','G','A','B','C'],SOL=['Do','Re','Mi','Fa','So','La','Ti','Do'],NF=[261.63,293.66,329.63,349.23,392,440,493.88,523.25],SC=['#ff4f4f','#ff9a20','#ffd24a','#3ac060','#3a8aff','#6a5aff','#b06aff','#ff4f9a'];
function note(f,d,v){kTone(f,d||.6,v||.12,'triangle')}
const BADGES=[['warm','🌬️ Warm-up Wizard'],['pitch','🎯 Pitch Pal'],['scale','🪜 Scale Climber'],['song','🎤 Sing-along Star'],['clap','👏 Clap Champ'],['star50','🏆 50 Star Singer']];
function badge(id){if(S.badges.includes(id))return;S.badges.push(id);S.save();const b=BADGES.find(q=>q[0]===id);reward(S,2,'Badge: '+b[1])}
function chkStars(){if(S.stars>=50)badge('star50')}
let msg='',msgT=0;function toast(m){msg=m;msgT=2.5}
const LOCK=DEMO?['songs','clap']:[];const dEnd='Great singing! The full game adds Sing-along Songs with bouncing lyrics, Rhythm Clapping, all 5 warm-ups, the full scale and every badge.';
// ---- Bean the singing bird (original character) ----
function bean(X,Y,s,open,mood){x.save();x.translate(X,Y+Math.sin(t*3)*4*s);x.scale(s,s);x.fillStyle='#ffb84a';x.beginPath();x.ellipse(0,0,60,55,0,0,7);x.fill();x.fillStyle='#ff9a20';x.beginPath();x.ellipse(-50,10,18,30,.5+Math.sin(t*8)*.2,0,7);x.ellipse(50,10,18,30,-.5-Math.sin(t*8)*.2,0,7);x.fill();
 x.fillStyle='#fff3d0';x.beginPath();x.ellipse(0,22,34,26,0,0,7);x.fill();x.fillStyle='#1a1a24';x.beginPath();x.arc(-20,-15,8,0,7);x.arc(20,-15,8,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-18,-18,3,0,7);x.arc(22,-18,3,0,7);x.fill();
 x.fillStyle='#ff6f3a';x.beginPath();x.moveTo(-12,0);x.lineTo(12,0);x.lineTo(0,8+open*18);x.closePath();x.fill();if(open>.1){x.beginPath();x.moveTo(-12,0);x.lineTo(12,0);x.lineTo(0,-6-open*4);x.closePath();x.fill()}
 x.fillStyle='rgba(255,100,140,.5)';x.beginPath();x.arc(-36,4,7,0,7);x.arc(36,4,7,0,7);x.fill();x.fillStyle='#ff4f9a';x.beginPath();x.moveTo(-6,-55);x.quadraticCurveTo(0,-80,8,-55);x.fill();if(mood==='happy')emo('🎵',70,-50+Math.sin(t*4)*6,30);x.restore()}
// ---- mic + pitch detection (on-device only, nothing stored or sent) ----
const MIC={on:false,an:null,buf:null,stream:null,f:0,lvl:0,err:''};
async function micStart(){try{const A=AC();MIC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});const src=A.createMediaStreamSource(MIC.stream);MIC.an=A.createAnalyser();MIC.an.fftSize=2048;MIC.buf=new Float32Array(2048);src.connect(MIC.an);MIC.on=true;MIC.err=''}catch(e){MIC.err='No microphone? That\'s OK, you can still sing along and tap "I sang it!"'}}
function micStop(){try{MIC.stream&&MIC.stream.getTracks().forEach(k=>k.stop())}catch(e){}MIC.on=false;MIC.an=null}
function detect(b,sr){let rms=0;for(let i=0;i<b.length;i++)rms+=b[i]*b[i];rms=Math.sqrt(rms/b.length);MIC.lvl=rms;if(rms<.01)return 0;const minL=Math.floor(sr/1000),maxL=Math.floor(sr/80);let best=0,bl=-1;
 for(let l=minL;l<=maxL;l++){let c=0;for(let i=0;i<b.length-l;i++)c+=b[i]*b[i+l];if(c>best){best=c;bl=l}}if(bl<0)return 0;let c0=0;for(let i=0;i<b.length;i++)c0+=b[i]*b[i];if(best/c0<.3)return 0;return sr/bl}
window.detectPitch=detect;
function pitchTick(){if(!MIC.on||!MIC.an)return 0;MIC.an.getFloatTimeDomainData(MIC.buf);const f=detect(MIC.buf,AC().sampleRate);MIC.f=f?(MIC.f?MIC.f*.6+f*.4:f):0;return MIC.f}
function semis(f,tg){let d=12*Math.log2(f/tg);while(d>6)d-=12;while(d<-6)d+=12;return d}// octave-forgiving for kids' voices
// ---- 1. warm-ups ----
const WU=[['🌬️ Balloon Breath','Breathe in through your nose for 4 and fill your tummy like a balloon. Breathe out slowly "sssss" for 8.',8],['🐝 Busy Bee Hum','Lips together, teeth apart. Hum "mmmm" like a happy bee. Feel your lips tickle!',6],['🏍️ Motorbike Lip Trill','Blow through loose lips "brrrr" and slide your voice up and down like a motorbike on a hill.',6],['🦉 Owl Sirens','Say "wooo" from low to high and back down, like an owl calling.',6],['😮 Big Yawn Stretch','Pretend to yawn wide, then sigh "haaa" down gently. Shoulders relaxed!',5]];
const WUA=DEMO?WU.slice(0,3):WU;let wi=0,wT=-1;
function drawWarm(){kbg('#e6f6ff','#fff3c4');starBar(S);T('Vocal Warm-ups',450,60,36,'#3a7ad8','center');WUA.forEach((w,i)=>kb('w'+i,30,90+i*66,270,56,w[0],()=>{wi=i;wT=-1},{sel:wi===i,bg:'#4ab0e8',fs:17}));
 const w=WUA[wi];x.fillStyle='#fff';rr(330,90,540,300,20);x.fill();T(w[0],600,130,26,'#ff7a00','center');x.fillStyle='#2a3a5a';x.font='bold 19px '+KF;wrapT(w[1],360,175,480,28);
 if(wT>=0){const k=Math.min(1,wT/w[2]);x.fillStyle='#ffe0f0';rr(360,330,480,30,15);x.fill();x.fillStyle='#ff6fae';rr(360,330,480*k,30,15);x.fill();T(Math.ceil(w[2]-wT)+'',600,354,20,'#2a3a5a','center')}
 bean(600,470,.7,wT>=0?.3+.3*Math.sin(t*6):0,'happy');kb('go',680,430,190,60,wT>=0?'Keep going!':'▶ Start',()=>{if(wT<0){wT=0;note(NF[0],.4)}},{bg:'#3ac060'});back()}
// ---- 2. pitch match ----
let pm={i:0,hold:0,stars:0,ask:true};const PMN=DEMO?[0,2,4]:[0,1,2,3,4,5,6,7];
function drawPitch(){kbg('#f0e6ff','#e6fff0');starBar(S);T('Match the Note with Bean!',450,60,32,'#b06aff','center');
 if(pm.ask&&!MIC.on){x.fillStyle='#fff';rr(150,110,600,330,24);x.fill();bean(450,200,.8,0,'happy');x.fillStyle='#2a3a5a';x.font='bold 19px '+KF;wrapT('Bean wants to hear you sing! 🎤 Ask a grown-up to tap "Use the microphone". Your voice stays on this device: nothing is recorded, saved or sent.',190,300,520,26);
  kb('mic',190,380,280,50,'🎤 Use the microphone',()=>{pm.ask=false;micStart()},{bg:'#3ac060',fs:18});kb('nom',490,380,240,50,'No mic, just sing',()=>{pm.ask=false},{bg:'#a0a8c0',fs:18});back();return}
 const n=PMN[pm.i%PMN.length],tg=NF[n];const f=pitchTick();const d=f?semis(f,tg):null;const ok=d!==null&&Math.abs(d)<.7;
 if(ok){pm.hold+=1/60;if(pm.hold>1.2){pm.hold=0;pm.stars++;reward(S,1,'You matched '+SOL[n]+'!');chkStars();if(pm.stars>=3)badge('pitch');pm.i++}}else pm.hold=Math.max(0,pm.hold-1/120);
 x.fillStyle='#fff';rr(80,100,180,400,20);x.fill();const yOf=dd=>300-dd*30;x.strokeStyle='#3ac060';x.lineWidth=40;x.globalAlpha=.25;x.beginPath();x.moveTo(100,300);x.lineTo(240,300);x.stroke();x.globalAlpha=1;T('🎯',170,310,30,'#000','center');
 if(d!==null){const yy=Math.max(120,Math.min(480,yOf(d)));emo('⭐',170,yy+12,40)}T(d===null?'Sing!':ok?'Perfect!':d>0?'A bit lower ⬇':'A bit higher ⬆',170,530,20,ok?'#2ab060':'#7a4a8a','center');
 T('Sing: '+SOL[n]+' ('+NN[n]+')',560,140,40,SC[n],'center');kb('hear',420,170,280,56,'🔊 Hear the note',()=>note(tg,1.2),{bg:SC[n],fs:20});
 x.fillStyle='#fff';rr(420,240,280,20,10);x.fill();x.fillStyle='#ffd24a';rr(420,240,280*Math.min(1,pm.hold/1.2),20,10);x.fill();
 bean(560,380,.9,Math.min(1,MIC.lvl*12),ok?'happy':'');for(let i=0;i<pm.stars%10;i++)emo('⭐',740+(i%3)*40,140+Math.floor(i/3)*40,30);
 if(MIC.err){x.fillStyle='#2a3a5a';x.font='15px '+KF;wrapT(MIC.err,300,470,560,20)}
 if(!MIC.on)kb('sang',640,480,220,50,'✅ I sang it!',()=>{pm.stars++;reward(S,1,'Lovely singing!');if(pm.stars>=3)badge('pitch');pm.i++},{bg:'#3ac060',fs:18});
 T('🎤 Mic is listening on this device only',450,590,13,'#7a4a8a','center','');back()}
// ---- 3. do-re-mi scales ----
let sc={play:-1,tm:0,seq:null},scHit=new Set();const SCN=DEMO?5:8;
function drawScale(){kbg('#fff3c4','#ffe0f0');starBar(S);T('Do-Re-Mi Staircase',450,60,36,'#ff7a00','center');
 for(let i=0;i<SCN;i++){const X=80+i*95,Y=470-i*45,on=sc.play===i;kb('st'+i,X,Y,88,40,SOL[i],()=>{note(NF[i]);scHit.add(i);if(scHit.size===SCN){scHit.clear();reward(S,1,'You climbed the scale!');badge('scale')}},{bg:on?'#ffd24a':SC[i],fs:20});T(NN[i],X+44,Y+60,14,'#7a4a8a','center','')}
 const bi=sc.play>=0?sc.play:0;bean(80+bi*95+44,470-bi*45-60,.45,sc.play>=0?.6:0,'happy');
 kb('up',560,110,150,50,'▶ Up',()=>{runScale([...Array(SCN).keys()])},{bg:'#3ac060'});kb('dn',720,110,150,50,'▶ Down',()=>{runScale([...Array(SCN).keys()].reverse())},{bg:'#4ab0e8'});
 x.fillStyle='#2a3a5a';x.font='bold 16px '+KF;wrapT('Tap each step from Do up to the top and sing the name with it. Then press Up and sing along!',40,120,500,22);if(DEMO)T('Full game: all 8 steps to high Do',450,585,14,'#7a4a8a','center','');back()}
function runScale(q){let k=0;clearInterval(sc.iv);sc.iv=setInterval(()=>{if(k>=q.length){clearInterval(sc.iv);sc.play=-1;return}sc.play=q[k];note(NF[q[k]],.5);k++},600)}
// ---- 4. sing-along songs (public domain) ----
const SONGS=[['Twinkle Twinkle Little Star',[['Twin','kle','twin','kle','lit','tle','star',0],[0,0,4,4,5,5,4,-1]],[['How','I','won','der','what','you','are',0],[3,3,2,2,1,1,0,-1]],[['Up','a','bove','the','world','so','high',0],[4,4,3,3,2,2,1,-1]],[['Like','a','dia','mond','in','the','sky',0],[4,4,3,3,2,2,1,-1]]],
 ['Mary Had a Little Lamb',[['Ma','ry','had','a','lit','tle','lamb',0],[2,1,0,1,2,2,2,-1]],[['Lit','tle','lamb,','lit','tle','lamb',0,0],[1,1,1,2,4,4,-1,-1]],[['Ma','ry','had','a','lit','tle','lamb',0],[2,1,0,1,2,2,2,-1]],[['Its','fleece','was','white','as','snow',0,0],[2,1,1,2,1,0,-1,-1]]],
 ['Row Row Row Your Boat',[['Row,','row,','row','your','boat',0,0,0],[0,0,0,1,2,-1,-1,-1]],[['Gent','ly','down','the','stream',0,0,0],[2,1,2,3,4,-1,-1,-1]],[['Mer','ri','ly','mer','ri','ly',0,0],[7,7,4,4,2,2,-1,-1]],[['Life','is','but','a','dream',0,0,0],[4,3,2,1,0,-1,-1,-1]]],
 ['Hot Cross Buns',[['Hot','cross','buns!',0],[2,1,0,-1]],[['Hot','cross','buns!',0],[2,1,0,-1]],[['One','a','pen','ny,','two','a','pen','ny'],[0,0,0,0,1,1,1,1]],[['Hot','cross','buns!',0],[2,1,0,-1]]],
 ['London Bridge',[['Lon','don','Bridge','is','fall','ing','down',0],[4,5,4,3,2,3,4,-1]],[['Fall','ing','down,','fall','ing','down',0,0],[1,2,3,2,3,4,-1,-1]],[['Lon','don','Bridge','is','fall','ing','down',0],[4,5,4,3,2,3,4,-1]],[['My','fair','la','dy',0,0,0,0],[1,4,2,0,-1,-1,-1,-1]]]];
let sg={i:0,line:0,w:-1,iv:null};
function playSong(i){stopSong();sg={i,line:0,w:-1};const L=SONGS[i].slice(1);let li=0,wi2=0;sg.iv=setInterval(()=>{if(li>=L.length){stopSong();reward(S,2,'What a performance!');badge('song');chkStars();return}const [wd,ns]=L[li];sg.line=li;sg.w=wi2;if(ns[wi2]>=0)note(NF[ns[wi2]],.45);wi2++;if(wi2>=wd.length){wi2=0;li++}},450)}
function stopSong(){if(sg.iv)clearInterval(sg.iv);sg.iv=null;sg.w=-1}
function drawSongs(){kbg('#ffe0f0','#e6f6ff');starBar(S);T('Sing-along Songs',450,60,36,'#ff4f9a','center');SONGS.forEach((s,i)=>kb('sg'+i,20,90+i*62,280,52,s[0],()=>playSong(i),{sel:sg.i===i,bg:'#ff6fae',fs:14}));
 const L=SONGS[sg.i].slice(1);x.fillStyle='#fff';rr(320,90,560,360,20);x.fill();L.forEach((ln,li)=>{let X=340;ln[0].forEach((w,wi3)=>{if(!w)return;const on=sg.iv&&li===sg.line&&wi3===sg.w;x.font='bold 24px '+KF;const ww=x.measureText(w).width;T(w,X,150+li*80-(on?14+Math.abs(Math.sin(t*12))*6:0),24,on?'#ff4f9a':'#2a3a5a');if(on)emo('🔴',X+ww/2,150+li*80-48,16);X+=ww+12})});
 bean(800,500,.5,sg.iv?.6:0,'happy');kb('pl',400,470,220,60,sg.iv?'⏹ Stop':'▶ Sing along',()=>{sg.iv?stopSong():playSong(sg.i)},{bg:'#3ac060'});T('All songs are traditional, public-domain nursery songs.',450,585,13,'#7a4a8a','center','');back()}
// ---- 5. rhythm clapping ----
const PAT=[[1,0,1,0,1,0,1,0],[1,0,1,0,1,1,1,0],[1,1,1,0,1,1,1,0],[1,0,0,1,1,0,1,0],[1,1,0,1,1,0,1,0]];let cl={p:0,step:-1,mode:'',hits:[],t0:0,res:''};
function clapStart(listen){cl.mode=listen?'listen':'clap';cl.hits=[];cl.res='';cl.t0=performance.now()+1200;cl.step=-1;for(let k=0;k<4;k++)setTimeout(()=>kTone(880,.05,.05),k*300);
 const iv=setInterval(()=>{const s=Math.floor((performance.now()-cl.t0)/300);if(s>=8){clearInterval(iv);if(cl.mode==='clap')score();cl.step=-1;cl.mode='';return}if(s>=0&&s!==cl.step){cl.step=s;if(listen&&PAT[cl.p][s])kTone(330,.12,.12,'square')}},20)}
function score(){const P=PAT[cl.p];let good=0,need=P.filter(v=>v).length;P.forEach((v,i)=>{if(v&&cl.hits.some(h=>Math.abs(h-i*300)<140))good++});const extra=Math.max(0,cl.hits.length-need);const ok=good===need&&extra===0;cl.res=ok?'Perfect rhythm! 🎉':good+' of '+need+' claps on the beat. Try again!';if(ok){reward(S,1,'Clap clap hooray!');badge('clap');chkStars();cl.p=(cl.p+1)%PAT.length}}
function clap(){if(cl.mode!=='clap')return;cl.hits.push(performance.now()-cl.t0);kTone(1200,.05,.08,'square')}
function drawClap(){kbg('#e6fff0','#fff3c4');starBar(S);T('Rhythm Clapping',450,60,36,'#2ab060','center');T('Pattern '+(cl.p+1)+' of '+PAT.length,450,95,18,'#7a4a8a','center','');
 PAT[cl.p].forEach((v,i)=>{const X=130+i*90;x.fillStyle=cl.step===i?'#ffd24a':'#fff';rr(X-38,130,76,100,16);x.fill();emo(v?'👏':'🤫',X,195,v?44:26)});
 kb('ls',120,270,300,60,'👂 Listen first',()=>clapStart(true),{bg:'#4ab0e8'});kb('cp',480,270,300,60,'▶ My turn',()=>clapStart(false),{bg:'#ff8a3d'});
 kb('clap',300,360,300,110,cl.mode==='clap'?'👏 CLAP! (or Space)':'👏',()=>clap(),{bg:'#ff6fae',fs:30});if(cl.res)T(cl.res,450,510,22,'#2a3a5a','center');back()}
addEventListener('keydown',e=>{if(e.code==='Space'&&G.state==='clap'){e.preventDefault();clap()}});
// ---- badges + parents ----
function drawBadges(){kbg('#fff3c4','#ffd6e8');starBar(S);T('My Badges',450,60,38,'#ff4f9a','center');BADGES.forEach((b,i)=>{const X=90+(i%3)*250,Y=110+Math.floor(i/3)*170,has=S.badges.includes(b[0]);x.fillStyle='#fff';rr(X,Y,220,150,20);x.fill();x.globalAlpha=has?1:.3;emo(b[1].split(' ')[0],X+110,Y+70,56);x.globalAlpha=1;T(b[1].slice(b[1].indexOf(' ')+1),X+110,Y+128,17,'#2a3a5a','center')});
 kb('stk',350,460,200,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});back()}
const TIPS=['🎤 Little and often: 5–10 minutes a day beats one long session.','💧 Water helps voices. Avoid shouting songs; singing should never hurt.','🌬️ Always start with warm-ups (humming and lip trills are gentle).','🎯 Children\'s voices sit higher than adults\'. The pitch game forgives octaves, so a child singing high is still "right".','😊 Praise effort, not perfection. Sing together, it\'s contagious!','🔒 Privacy: the microphone is only used live for pitch matching on this device. Nothing is recorded, saved or sent. No ads, no accounts, no data collection.','🩺 If your child is often hoarse or their voice hurts, check with your GP or a speech pathologist.'];
function drawParents(){kbg('#e6f6ff','#f0e6ff');T('Tips for Grown-ups',450,55,34,'#3a7ad8','center');x.fillStyle='#2a3a5a';x.font='bold 17px '+KF;let y=100;TIPS.forEach(s=>{y=wrapT(s,70,y,760,23)+12});back()}
// ---- title / menu ----
function drawTitle(){kbg('#ffe6c4','#ffd6e8');T('Coffeebreak Kids',450,80,34,'#ff4f9a','center');T('Singing School',454,149,58,'#ff5a9a','center');T('Singing School',450,145,58,'#fff','center');bean(450,330,1.2,.4+.3*Math.sin(t*5),'happy');kb('go',300,470,300,70,'🎤 Let\'s sing!',()=>{G.state='menu';AC()},{fs:26})}
const MENU=[['🌬️ Warm-ups','warm'],['🎯 Match the Note','pitch'],['🪜 Do-Re-Mi','scale'],['🎶 Sing-along Songs','songs'],['👏 Rhythm Clapping','clap'],['🏆 My Badges','badges'],['👪 Parent Tips','parents']];
function drawMenu(){kbg('#ffe6c4','#ffd6e8');starBar(S);T('Singing School',450,60,40,'#ff7a00','center');MENU.forEach((m,i)=>{const lk=LOCK.includes(m[1]);kb('m'+i,60+(i%2)*400,95+Math.floor(i/2)*100,380,80,(lk?'🔒 ':'')+m[0],()=>{if(lk){window.demoEnd&&window.demoEnd(dEnd);return}G.state=m[1]},{bg:['#4ab0e8','#b06aff','#ff8a3d','#ff6fae','#3ac060','#ffb020','#7a8ad8'][i],fs:22})});bean(830,540,.4,0,'happy')}
function back(){kb('bk',20,530,140,56,'⬅ Back',()=>{stopSong();if(G.state==='pitch')micStop();G.state='menu'},{bg:'#a0a8c0'})}
bindInput({});
function update(dt){if(msgT>0)msgT-=dt;if(wT>=0){wT+=dt;const w=WUA[wi];if(wT>=w[2]){wT=-1;S.done[wi]=1;reward(S,1,'Warm-up done!');if(Object.keys(S.done).length>=3)badge('warm');chkStars()}}}
function draw(){x.clearRect(0,0,900,600);({title:drawTitle,menu:drawMenu,warm:drawWarm,pitch:drawPitch,scale:drawScale,songs:drawSongs,clap:drawClap,badges:drawBadges,parents:drawParents,stk:()=>stickerBook(S,()=>{G.state='badges'})})[G.state]();
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(300,10,300,44,20);x.fill();T(msg,450,40,20,'#2ab060','center');x.globalAlpha=1}kOverlay(1/60)}
window.KS={G,S,MIC,pm,cl,sg,micStart,playSong,clapStart,clap,detect,NF};startLoop();
