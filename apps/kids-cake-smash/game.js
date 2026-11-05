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
// ===== Coffeebreak Kids: Cake Smash =====
const S=kStore('kidsSmash',{cakes:0,best:0});const G={state:'title',score:S.stars,level:0};window.G=G;
const ICE=['#ff9ac8','#fff4f0','#8a5a3a','#9ad8ff','#c8a0ff','#a8f0a0','#ffe066'];
const SPONGE=['#ffe0a0','#8a5a3a','#ffb0c8','#c8f0a0'];
const TOP=['🦭','🦄','🦖','🐱','🤖','👑','🌈','🦕','🐸','🚀'];
const TOOLS=[['hand','✋ Hands'],['hammer','🔨 Hammer'],['jump','🦘 Jump!']];
const MAXC=DEMO?3:Infinity;
let ck={layers:2,ice:0,sp:0,spr:true,cand:3,top:0},hp=0,maxhp=0,tool='hand',combo=0,comboT=0,score=0,parts=[],splats=[],chunks=[],shake=0,jumpY=-1,num=0,msg='',msgT=0,clean=false,wipe=null;
function AC(){window._AC=window._AC||new AudioContext();if(window._AC.state==='suspended')window._AC.resume();return window._AC}
function nz(d,v,f,tp){try{const A=AC(),b=A.createBuffer(1,A.sampleRate*d,A.sampleRate),c2=b.getChannelData(0);for(let i=0;i<c2.length;i++)c2[i]=(Math.random()*2-1)*Math.pow(1-i/c2.length,2);const s=A.createBufferSource();s.buffer=b;const fl=A.createBiquadFilter();fl.type=tp||'lowpass';fl.frequency.value=f;const g=A.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(A.destination);s.start()}catch(e){}}
function sw(f1,f2,d,v,tp){try{const A=AC(),o=A.createOscillator(),g=A.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(f1,A.currentTime);o.frequency.exponentialRampToValueAtTime(f2,A.currentTime+d);g.gain.setValueAtTime(v,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+d+.02)}catch(e){}}
const SND={splat:()=>{nz(.25,.5,600);sw(300,90,.15,.08)},bonk:()=>{sw(500,120,.12,.1,'square');nz(.15,.4,900)},boing:()=>sw(200,700,.35,.08,'triangle'),squelch:()=>{nz(.4,.4,350);sw(180,60,.3,.06,'sawtooth')},fart:()=>sw(110,70,.4,.06,'sawtooth'),wipe:()=>nz(.08,.12,2500,'highpass')};
const CX=450,BASE=430;
function cakeH(){return ck.layers*60}
function newCake(){ck={layers:1+Math.floor(Math.random()*3),ice:Math.floor(Math.random()*ICE.length),sp:Math.floor(Math.random()*SPONGE.length),spr:true,cand:Math.floor(Math.random()*5),top:Math.floor(Math.random()*TOP.length)};G.state='decorate';splats=[];parts=[];chunks=[];clean=false}
function startSmash(){maxhp=hp=ck.layers*6+ck.cand+4;score=0;combo=0;G.state='smash';speak('Ready, set, SMASH!')}
function burst(px,py,n,pow){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=(150+Math.random()*450)*pow;parts.push({x:px,y:py,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-250*pow,r:5+Math.random()*12,c:Math.random()<.5?ICE[ck.ice]:SPONGE[ck.sp],l:3})}if(ck.spr)for(let i=0;i<n/2;i++){const a=Math.random()*7;parts.push({x:px,y:py,vx:Math.cos(a)*400*pow,vy:Math.sin(a)*400*pow-200,r:2.5,c:['#ff4f9a','#ffd24a','#40c8ff','#5ad870'][i%4],l:3,spr:1})}}
function hit(px,py){if(G.state!=='smash'||hp<=0)return;const top=BASE-cakeH()-20;if(px<CX-190||px>CX+190||py<top-60||py>BASE+20){return}
 let dmg=tool==='hammer'?2:1,pow=tool==='hammer'?1.3:1;if(tool==='jump'){jumpY=0;setTimeout(()=>{if(hp<=0)return;dmg=4;applyHit(CX,BASE-cakeH(),4,1.8);SND.boing();setTimeout(SND.squelch,80)},450);SND.boing();return}
 applyHit(px,py,dmg,pow);tool==='hammer'?SND.bonk():SND.splat();if(Math.random()<.08)setTimeout(SND.fart,150)}
function applyHit(px,py,dmg,pow){hp=Math.max(0,hp-dmg);combo=comboT>0?combo+1:1;comboT=.9;score+=10*dmg*combo;shake=.25*pow;burst(px,py,18+dmg*8,pow);if(Math.random()<.5)chunks.push({x:px,y:py,vx:(Math.random()-.5)*400,vy:-300,c:SPONGE[ck.sp],r:18,rot:0});
 if(combo>2&&combo%3===0){msg='COMBO x'+combo+'!';msgT=1;kTone(880+combo*40,.1,.05,'triangle')}
 if(hp<=0){setTimeout(()=>{S.cakes++;S.best=Math.max(S.best,score);G.level=S.cakes;reward(S,3,'SMASHED! '+score+' pts');G.state='smashed'},700);burst(CX,BASE-60,80,1.6);SND.squelch()}}
function drawCake(sx,sy,sc,dmg){x.save();x.translate(sx,sy);x.scale(sc,sc);x.translate(-CX,-BASE);const f=dmg||0;
 x.fillStyle='#fff';x.beginPath();x.ellipse(CX,BASE+8,210,24,0,0,7);x.fill();x.strokeStyle='#ddd';x.lineWidth=3;x.stroke();
 for(let l=0;l<ck.layers;l++){const w=170-l*30,y=BASE-(l+1)*60,squ=f*(10+l*6);x.fillStyle=SPONGE[ck.sp];rr(CX-w,y+squ*.5,w*2,60-squ*.5,10);x.fill();
  x.fillStyle=ICE[ck.ice];rr(CX-w-4,y+squ*.5-6,w*2+8,18,9);x.fill();for(let d=0;d<8;d++){x.beginPath();x.ellipse(CX-w+10+d*(w*2-20)/7,y+squ*.5+12,8,10+(d%3)*5,0,0,7);x.fill()}
  if(ck.spr)for(let s=0;s<14;s++){x.fillStyle=['#ff4f9a','#ffd24a','#40c8ff','#5ad870'][s%4];x.save();x.translate(CX-w+12+((s*53)%(w*2-24)),y+squ*.5+(s%3)*12+16);x.rotate(s);x.fillRect(-4,-1.5,8,3);x.restore()}}
 const ty=BASE-cakeH()+f*20;for(let i=0;i<ck.cand;i++){const cx2=CX-(ck.cand-1)*18+i*36;x.fillStyle=['#ff6fae','#4ab0e8','#ffd24a','#3ac060'][i%4];x.fillRect(cx2-5,ty-46,10,40);if(f<.5){x.fillStyle='#ffb020';x.beginPath();x.ellipse(cx2,ty-54+Math.sin(t*12+i)*2,5,9,0,0,7);x.fill()}}
 emo(TOP[ck.top],CX,ty-(ck.cand?80:30),56);x.restore()}
function drawTitle(){kbg('#ffe0ec','#fff3c4');T('Coffeebreak Kids',450,90,34,'#ff4f9a','center');T('Cake Smash',454,164,68,'#ff5a9a','center');T('Cake Smash',450,160,68,'#fff','center');ck.top=Math.floor(t)%TOP.length;drawCake(380,470,.7,0);seal(700,400,.9,'wave');kb('go',320,500,260,70,'🎂 Make a cake!',()=>{if(S.cakes>=MAXC){window.demoEnd&&window.demoEnd(dEnd);return}newCake()},{fs:26})}
const dEnd='What a mess! The full game has unlimited cakes to decorate and smash, every topper and the full sticker book.';
function drawDeco(){kbg('#fff6e0','#ffe0ec');starBar(S);T('Decorate your silly cake!',450,48,32,'#ff4f9a','center');drawCake(330,450,.85,0);
 const X=610;T('Layers',X,95,18,'#7a4a8a');[1,2,3].forEach(n=>kb('l'+n,X+80+(n-1)*58,70,50,40,''+n,()=>{ck.layers=n},{sel:ck.layers===n,bg:'#4ab0e8',fs:20}));
 T('Sponge',X,148,18,'#7a4a8a');SPONGE.forEach((c,i)=>kb('s'+i,X+80+i*48,124,40,40,'',()=>{ck.sp=i},{bg:c,sel:ck.sp===i}));
 T('Icing',X,200,18,'#7a4a8a');ICE.forEach((c,i)=>kb('i'+i,X+70+i*31,178,28,36,'',()=>{ck.ice=i},{bg:c,sel:ck.ice===i}));
 T('Candles',X,255,18,'#7a4a8a');kb('cm',X+100,230,44,40,'−',()=>{ck.cand=Math.max(0,ck.cand-1)},{bg:'#ff6fae'});T(''+ck.cand,X+172,258,22,'#2a3a5a','center');kb('cp',X+200,230,44,40,'+',()=>{ck.cand=Math.min(6,ck.cand+1)},{bg:'#ff6fae'});
 kb('sp',X,285,260,46,ck.spr?'✅ Sprinkles':'⬜ Sprinkles',()=>{ck.spr=!ck.spr;kTone(1200,.05,.04)},{bg:'#b06aff',fs:20});
 T('Topper',X,358,18,'#7a4a8a');TOP.forEach((e,i)=>kb('tp'+i,X+(i%5)*54,368+Math.floor(i/5)*54,48,48,e,()=>{ck.top=i},{bg:'#fff',sel:ck.top===i,fs:24}));
 kb('go',X,490,260,70,'💥 SMASH TIME!',startSmash,{bg:'#ff4f4f',fs:24})}
function physics(dt){parts.forEach(p=>{p.vy+=1100*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.y>575||p.x<5||p.x>895||p.y<5){splats.push({x:Math.max(5,Math.min(895,p.x)),y:Math.max(5,Math.min(578,p.y)),r:p.r*(p.spr?1:1.6),c:p.c,s:p.spr,a:Math.random()*7});p.l=0}});parts=parts.filter(p=>p.l>0);if(splats.length>900)splats.splice(0,splats.length-900);
 chunks.forEach(c=>{c.vy+=1000*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=dt*6;if(c.y>560){c.y=560;c.vy*=-.3;c.vx*=.6}})}
function drawMess(){splats.forEach(s=>{x.fillStyle=s.c;if(s.s){x.save();x.translate(s.x,s.y);x.rotate(s.a);x.fillRect(-4,-1.5,8,3);x.restore()}else{x.beginPath();x.ellipse(s.x,s.y,s.r,s.r*.7,s.a,0,7);x.fill()}});
 chunks.forEach(c=>{x.save();x.translate(c.x,c.y);x.rotate(c.rot);x.fillStyle=c.c;rr(-c.r,-c.r*.7,c.r*2,c.r*1.4,6);x.fill();x.restore()});parts.forEach(p=>{x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r*.6,0,7);x.fill()})}
function drawSmash(){x.save();if(shake>0)x.translate((Math.random()-.5)*shake*40,(Math.random()-.5)*shake*40);kbg('#e8f4ff','#fff0e0');x.fillStyle='#d8b890';x.fillRect(0,540,900,60);
 if(hp>0)drawCake(CX,BASE,1,1-hp/maxhp);drawMess();
 if(jumpY>=0){const k=jumpY,yy=k<.5?BASE-300+600*k*k*2:BASE-150;x.save();x.translate(CX,Math.min(BASE-100,yy-150+k*300));emo('🦘',0,0,120);x.restore()}
 x.restore();x.fillStyle='rgba(255,255,255,.9)';rr(14,10,420,44,20);x.fill();T('💥 '+score+'   🎂 '+Math.ceil(hp/maxhp*100)+'%'+(combo>1?'   🔥 x'+combo:''),30,40,22,'#ff4f4f');
 TOOLS.forEach((tl,i)=>kb('t'+i,460+i*145,62,135,50,tl[1],()=>{tool=tl[0]},{sel:tool===tl[0],bg:'#4ab0e8',fs:18}));
 T(tool==='jump'?'Tap the cake to JUMP on it!':'Tap the cake to smash!',450,140,20,'#7a4a8a','center','');
 if(msgT>0){x.globalAlpha=Math.min(1,msgT*2);T(msg,450,200,54,'#ff4f9a','center');x.globalAlpha=1}}
function drawSmashed(){kbg('#e8f4ff','#fff0e0');x.fillStyle='#d8b890';x.fillRect(0,540,900,60);drawMess();x.fillStyle='rgba(255,255,255,.92)';rr(220,120,460,250,30);x.fill();T('SPLAT-TASTIC!',450,180,46,'#ff4f9a','center');T('Score: '+score,450,235,30,'#3a7ad8','center');T('Best: '+S.best+' · Cakes smashed: '+S.cakes,450,275,18,'#7a4a8a','center','');
 kb('cl',300,300,300,60,'🧽 Clean up the mess!',()=>{G.state='clean';wipe=null},{bg:'#3ac060',fs:22})}
function drawClean(){kbg('#e8f4ff','#fff0e0');x.fillStyle='#d8b890';x.fillRect(0,540,900,60);drawMess();const left=splats.length;x.fillStyle='rgba(255,255,255,.9)';rr(200,10,500,44,20);x.fill();T('🧽 Wipe the mess away! '+left+' blobs left',450,40,20,'#3a7ad8','center');
 if(wipe)emo('🧽',wipe.x,wipe.y,60);
 if(left<25){kb('nx',300,260,300,70,S.cakes>=MAXC?'⭐ Finish':'🎂 Next cake!',()=>{if(S.cakes>=MAXC){window.demoEnd&&window.demoEnd(dEnd);return}reward(S,1,'Squeaky clean!');newCake()},{bg:'#ff6fae',fs:26})}}
bindInput({down(p){if(G.state==='smash')hit(p.x,p.y);if(G.state==='clean'){wipe=p;doWipe(p)}},move(p){if(G.state==='clean'&&wipe){wipe=p;doWipe(p)}},up(){wipe=null}});
function doWipe(p){const n=splats.length;splats=splats.filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>55);chunks=chunks.filter(s=>Math.hypot(s.x-p.x,s.y-p.y)>55);if(splats.length<n&&Math.random()<.4)SND.wipe()}
function update(dt){physics(dt);if(comboT>0)comboT-=dt;if(shake>0)shake-=dt;if(msgT>0)msgT-=dt;if(jumpY>=0){jumpY+=dt*1.6;if(jumpY>1)jumpY=-1}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,decorate:drawDeco,smash:drawSmash,smashed:drawSmashed,clean:drawClean,stk:()=>stickerBook(S,()=>{G.state='title'})})[s]();kOverlay(1/60)}
window.KC={G,S,newCake,startSmash,hit,get hp(){return hp},get splats(){return splats},doWipe,setTool:z=>tool=z};startLoop();
