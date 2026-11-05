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
// ===== Coffeebreak Kids Fashion Shop =====
const S=kStore('kidsFashion',{coins:20,piggy:0,sold:0,designs:[],lessons:0,goal:50});const G={state:'title',score:S.stars,level:0};window.G=G;
const TYPES=[['tee','T-shirt','👕',4],['dress','Dress','👗',6],['hoodie','Hoodie','🧥',7],['hat','Cap','🧢',3],['tote','Tote bag','👜',3]];
const DEMO_TYPES=['tee','dress'];
const COLS=['#ff6fae','#ff4f4f','#ff9a3d','#ffd24a','#7ad860','#3ac0a0','#40c8ff','#3a7ad8','#b06aff','#ffffff','#2a2a3a','#f4c8a0'];
const PATS=['none','dots','stripes','hearts','stars','check','zigzag','rainbow','flowers','confetti'];const PATN={none:'Plain',dots:'Dots',stripes:'Stripes',hearts:'Hearts',stars:'Stars',check:'Check',zigzag:'Zigzag',rainbow:'Rainbow',flowers:'Flowers',confetti:'Confetti'};
const FSTK=['⭐','❤️','🌈','🦄','🦋','🌸','🍓','🐱','🐶','🦭','🚀','🍭','⚡','🌙','🐬','🍩'];
function newD(){return{type:'tee',col:'#ff6fae',pat:'none',pcol:'#ffffff',stk:[],text:'',tcol:'#ffffff',name:''}}
let D=newD(),pickStk=null,shopD=null,price=8,cust=[],shopMsg='',lesson=null,flash=0,saveRate=10;
function typeOK(tp){return !DEMO||DEMO_TYPES.includes(tp)}
function cost(tp){return (TYPES.find(a=>a[0]===tp)||[0,0,0,4])[3]}
// ---- garment shapes in a 300x320 local box ----
function gPath(tp){x.beginPath();if(tp==='tee'){x.moveTo(95,20);x.quadraticCurveTo(150,60,205,20);x.lineTo(290,70);x.lineTo(255,135);x.lineTo(225,115);x.lineTo(225,310);x.lineTo(75,310);x.lineTo(75,115);x.lineTo(45,135);x.lineTo(10,70);x.closePath()}
 else if(tp==='hoodie'){x.moveTo(100,40);x.quadraticCurveTo(150,-25,200,40);x.lineTo(275,70);x.lineTo(298,290);x.lineTo(262,295);x.lineTo(232,130);x.lineTo(232,310);x.lineTo(68,310);x.lineTo(68,130);x.lineTo(38,295);x.lineTo(2,290);x.lineTo(25,70);x.closePath()}
 else if(tp==='dress'){x.moveTo(110,15);x.quadraticCurveTo(150,50,190,15);x.lineTo(215,25);x.lineTo(205,130);x.quadraticCurveTo(290,250,295,315);x.lineTo(5,315);x.quadraticCurveTo(10,250,95,130);x.lineTo(85,25);x.closePath()}
 else if(tp==='hat'){x.moveTo(40,210);x.quadraticCurveTo(40,70,150,70);x.quadraticCurveTo(260,70,260,210);x.quadraticCurveTo(300,215,298,240);x.lineTo(40,240);x.closePath()}
 else{x.moveTo(30,110);x.lineTo(270,110);x.lineTo(285,310);x.lineTo(15,310);x.closePath()}}
function patDraw(p,c2){x.fillStyle=c2;x.strokeStyle=c2;x.lineWidth=8;let i=0;
 if(p==='dots')for(let y=0;y<340;y+=36)for(let X=(y/36%2)*18;X<320;X+=36){x.beginPath();x.arc(X,y,7,0,7);x.fill()}
 if(p==='stripes')for(let y=0;y<340;y+=32)x.fillRect(0,y,320,14);
 if(p==='check'){x.globalAlpha=.45;for(let k=0;k<320;k+=40){x.fillRect(k,0,20,340);x.fillRect(0,k,320,20)}x.globalAlpha=1}
 if(p==='zigzag')for(let y=10;y<340;y+=40){x.beginPath();for(let X=0;X<=320;X+=20)x.lineTo(X,y+(X/20%2?12:-12));x.stroke()}
 if(p==='rainbow'){const R=['#e8303a','#ff8a3d','#ffd24a','#3ac060','#3a7ad8','#b06aff'];x.globalAlpha=.75;for(let y=0;y<340;y+=20)x.fillStyle=R[i++%6],x.fillRect(0,y,320,20);x.globalAlpha=1}
 if(['hearts','stars','flowers','confetti'].includes(p))for(let y=10;y<340;y+=46)for(let X=(y/46%2)*23+10;X<330;X+=46){x.save();x.translate(X,y);if(p==='hearts'){x.beginPath();x.moveTo(0,6);x.bezierCurveTo(-14,-6,-6,-16,0,-7);x.bezierCurveTo(6,-16,14,-6,0,6);x.fill()}
  else if(p==='stars'){x.beginPath();for(let k=0;k<10;k++){const r=k%2?5:12,a=k*Math.PI/5-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.fill()}
  else if(p==='flowers'){for(let k=0;k<5;k++){x.beginPath();x.arc(Math.cos(k*1.26)*8,Math.sin(k*1.26)*8,6,0,7);x.fill()}x.fillStyle='#ffd24a';x.beginPath();x.arc(0,0,5,0,7);x.fill();x.fillStyle=c2}
  else{x.fillStyle=['#ff4f9a','#ffd24a','#40c8ff','#5ad870','#b06aff'][(i++)%5];x.rotate(i);x.fillRect(-7,-3,14,6)}x.restore()}}
function drawGarment(d,X,Y,s,outline){x.save();x.translate(X,Y);x.scale(s,s);gPath(d.type);x.save();x.clip();x.fillStyle=d.col;x.fillRect(-10,-30,330,360);if(d.pat!=='none')patDraw(d.pat,d.pcol);
 x.fillStyle='rgba(0,0,0,.08)';if(d.type==='tee'||d.type==='hoodie')x.fillRect(0,0,70,330),x.fillRect(232,0,80,330);if(d.type==='hoodie'){x.fillStyle='rgba(0,0,0,.12)';rr(95,215,110,60,16);x.fill()}
 d.stk.forEach(k=>emo(k.e,k.x,k.y,k.s||46));if(d.text){x.font='bold 30px '+KF;x.textAlign='center';x.lineWidth=5;x.strokeStyle='rgba(0,0,0,.35)';const ty=d.type==='hat'?160:d.type==='tote'?220:180;x.strokeText(d.text,150,ty);x.fillStyle=d.tcol;x.fillText(d.text,150,ty);x.textAlign='left'}x.restore();
 gPath(d.type);x.lineWidth=5/s*1.4;x.strokeStyle=outline||'#2a3a5a';x.stroke();if(d.type==='tote'){x.beginPath();x.moveTo(85,110);x.quadraticCurveTo(150,0,215,110);x.lineWidth=12;x.stroke()}if(d.type==='hat'){x.beginPath();x.arc(150,72,8,0,7);x.fillStyle=d.col;x.fill();x.stroke()}x.restore()}
// ---- cute model ----
function model(d,X,Y,s,sk){x.save();x.translate(X,Y);x.scale(s,s);const skin=sk||'#f4c8a0';x.fillStyle=skin;
 x.fillRect(-28,150,20,150);x.fillRect(8,150,20,150);x.fillStyle='#ff6fae';rr(-34,292,30,16,6);x.fill();rr(4,292,30,16,6);x.fill();
 x.fillStyle=skin;x.save();x.translate(-55,-15);x.rotate(.15+Math.sin(t*2)*.05);x.fillRect(-9,0,18,120);x.restore();x.save();x.translate(55,-15);x.rotate(-.15-Math.sin(t*2)*.05);x.fillRect(-9,0,18,120);x.restore();
 x.fillStyle='#ffe6f2';rr(-55,-25,110,180,30);x.fill();
 x.fillStyle='#7a4a2a';x.beginPath();x.arc(0,-75,52,0,7);x.fill();x.fillStyle=skin;x.beginPath();x.arc(0,-68,44,0,7);x.fill();x.fillStyle='#7a4a2a';x.beginPath();x.arc(0,-90,40,3.3,6.1);x.fill();x.fillRect(-52,-80,16,90);x.fillRect(36,-80,16,90);
 x.fillStyle='#2a1a2a';x.beginPath();x.arc(-15,-68,5,0,7);x.arc(15,-68,5,0,7);x.fill();x.fillStyle='rgba(255,100,140,.4)';x.beginPath();x.arc(-24,-52,7,0,7);x.arc(24,-52,7,0,7);x.fill();x.strokeStyle='#c0405a';x.lineWidth=3;x.beginPath();x.arc(0,-52,10,.3,Math.PI-.3);x.stroke();
 if(d){if(d.type==='tee')drawGarment(d,-75,-45,.5);else if(d.type==='hoodie')drawGarment(d,-77,-40,.51);else if(d.type==='dress')drawGarment(d,-76,-35,.507,);else if(d.type==='hat')drawGarment(d,-62,-158,.41);else{drawGarment({type:'tee',col:'#ffffff',pat:'none',stk:[],text:''},-75,-45,.5);drawGarment(d,40,40,.32)}}
 x.restore()}
// ---- title ----
function drawTitle(){kbg('#ffd6ec','#e6f0ff');T('Coffeebreak Kids',450,80,32,'#ff4f9a','center');T('Fashion Shop',450,145,62,'#fff','center');
 model({type:'dress',col:'#b06aff',pat:'stars',pcol:'#ffd24a',stk:[],text:''},250,300,.75);model({type:'tee',col:'#40c8ff',pat:'hearts',pcol:'#ff6fae',stk:[{e:'🦄',x:150,y:160}],text:''},650,300,.75);seal(450,340,.6,'wave');
 kb('go',300,430,300,66,'✂️ Design clothes',()=>{G.state='studio';speak('Let\'s design some clothes!')},{bg:'#ff6fae',fs:26});
 kb('shop',300,510,145,54,'🏪 My Shop',()=>openShop(),{bg:'#3ac0a0',fs:20});kb('stk',455,510,145,54,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20});
 kb('par',760,550,130,40,'🔒 Grown-ups',()=>parentGate(),{bg:'#7a889a',fs:15});starBar(S);T('🪙 '+S.coins,220,38,20,'#b07a00','left')}
// ---- studio ----
function drawStudio(){kbg('#fff3c4','#ffe6f2');starBar(S);T('Design Studio',450,40,30,'#ff4f9a','center');
 TYPES.forEach((a,i)=>{const lk=!typeOK(a[0]);kb('ty'+i,14,70+i*62,120,54,(lk?'🔒':a[2])+' '+a[1],()=>{if(lk){window.demoEnd&&window.demoEnd('Hoodies, caps and tote bags are in the full game, plus the grown-up Real Shop!');return}D.type=a[0];D.stk=[];speak(a[1])},{sel:D.type===a[0],bg:'#4ab0e8',fs:15})});
 x.fillStyle='#fff';rr(150,62,330,380,24);x.fill();drawGarment(D,165,80,1.0);
 if(pickStk){T('Tap the clothes to stick '+pickStk,315,465,18,'#7a4a8a','center')}
 T('Colour',500,80,16,'#2a3a5a');COLS.forEach((c2,i)=>{const X=500+(i%6)*62,Y=88+Math.floor(i/6)*48;BTN['c'+i]={x:X,y:Y,w:54,h:40,fn:()=>{D.col=c2;kTone(700,.05,.04)}};x.fillStyle=c2;rr(X,Y,54,40,12);x.fill();x.strokeStyle=D.col===c2?'#ff4f9a':'#ccd';x.lineWidth=D.col===c2?5:2;x.stroke()});
 T('Pattern',500,200,16,'#2a3a5a');PATS.forEach((p,i)=>{const lk=DEMO&&i>4;kb('p'+i,500+(i%5)*76,208+Math.floor(i/5)*44,70,38,(lk?'🔒':'')+PATN[p],()=>{if(lk){window.demoEnd&&window.demoEnd('All 10 patterns are in the full game!');return}D.pat=p;if(p!=='none'&&D.pcol===D.col)D.pcol='#ffffff'},{sel:D.pat===p,bg:'#b06aff',fs:13})});
 kb('pc',500,300,180,36,'🎨 Pattern colour',()=>{D.pcol=COLS[(COLS.indexOf(D.pcol)+1)%COLS.length]},{bg:'#ff9a3d',fs:15});x.fillStyle=D.pcol;rr(688,300,36,36,8);x.fill();
 T('Stickers',500,358,16,'#2a3a5a');FSTK.forEach((e,i)=>{const X=500+(i%8)*48,Y=364+Math.floor(i/8)*46;BTN['s'+i]={x:X,y:Y,w:44,h:42,fn:()=>{pickStk=e;kTone(800,.05,.04)}};x.fillStyle=pickStk===e?'#ffd24a':'#fff';rr(X,Y,44,42,10);x.fill();emo(e,X+22,Y+22,28)});
 kb('tx',500,462,120,42,'🔤 Words',()=>{const v=prompt('Words for your design (up to 14 letters):',D.text);if(v!==null)D.text=v.slice(0,14)},{bg:'#3a7ad8',fs:16});
 kb('tc',626,462,120,42,'Word colour',()=>{D.tcol=COLS[(COLS.indexOf(D.tcol)+1)%COLS.length]},{bg:'#3a7ad8',fs:15});kb('un',752,462,130,42,'↩ Undo sticker',()=>{D.stk.pop()},{bg:'#9aa8b8',fs:15});
 kb('mdl',150,500,160,56,'💃 Try on',()=>{G.state='model';confetti(40);yay()},{bg:'#ff6fae',fs:20});
 kb('sv',320,500,170,56,'💾 Save design',()=>saveDesign(),{bg:'#3ac060',fs:20});kb('new',500,520,120,44,'🆕 New',()=>{const tp=D.type;D=newD();D.type=tp},{bg:'#ffb020',fs:18});
 kb('home',630,520,120,44,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8',fs:18});kb('shop2',760,520,126,44,'🏪 Shop',()=>openShop(),{bg:'#3ac0a0',fs:18})}
function saveDesign(){const max=DEMO?3:60;if(S.designs.length>=max){if(DEMO){window.demoEnd&&window.demoEnd('Save up to 60 designs in the full game!');return}S.designs.shift()}const d=JSON.parse(JSON.stringify(D));d.id=Date.now()+''+Math.floor(Math.random()*999);d.name=d.name||(TYPES.find(a=>a[0]===d.type)[1]+' #'+(S.designs.length+1));S.designs.push(d);reward(S,1,'Design saved!');speak('Saved! Now you can sell it in your shop.');G.level=S.designs.length}
function drawModel(){kbg('#2a1a4a','#ff6fae');x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.moveTo(380,0);x.lineTo(520,0);x.lineTo(640,600);x.lineTo(260,600);x.fill();
 T('On the catwalk!',450,60,40,'#fff','center');model(D,450+Math.sin(t)*40,250,1.1);seal(150,470,.7,'wave');bubbleK('Wow, that looks amazing!',60,330,230);
 kb('bk',300,520,140,56,'✂️ Studio',()=>{G.state='studio'},{bg:'#4ab0e8'});kb('sv',460,520,170,56,'💾 Save it',()=>saveDesign(),{bg:'#3ac060'})}
// ---- pretend boutique ----
function openShop(){G.state='shop';if(!shopD&&S.designs.length)shopD=S.designs[S.designs.length-1];if(shopD)price=Math.max(price,cost(shopD.type)+1);shopMsg=S.designs.length?'Pick a design, set a price and open the shop!':'Save a design in the studio first!'}
function custWants(d){return Math.round(cost(d.type)*(1.6+Math.random()*1.6)+(d.stk.length?1:0)+(d.pat!=='none'?1:0))}
function sellTry(){if(!shopD){shopMsg='Pick a design first!';oops();return}const c0=cost(shopD.type);if(S.coins<c0){shopMsg='You need '+c0+' coins to make it. Sell or ask the piggy bank!';oops();return}
 S.coins-=c0;const want=custWants(shopD),who=['🧒','👧','👦','👩','🧑','👵','👨','🐻'][Math.random()*8|0];cust.push({e:who,t:0,buy:price<=want});
 if(price<=want){const save=Math.round(price*saveRate/100);S.coins+=price-save;S.piggy+=save;S.sold++;const pr=price-c0;shopMsg=who+' bought it for '+price+'! Cost '+c0+' + profit '+pr+'. '+save+' went in the piggy bank.';reward(S,1,'Sold! Profit '+pr);speak('Sold! You made '+pr+' coins profit')}
 else{S.coins+=c0;shopMsg=who+' said "Too expensive!" Try a lower price. (No coins lost.)';oops()}
 if(S.piggy>=S.goal){reward(S,3,'Savings goal reached!');S.goal+=50}S.save()}
function drawShop(){kbg('#d6fff0','#fff3c4');x.fillStyle='#ff6fae';for(let i=0;i<9;i++){x.fillStyle=i%2?'#fff':'#ff6fae';x.fillRect(i*100,0,100,46)}T('My Boutique',450,82,34,'#ff4f9a','center');
 x.fillStyle='rgba(255,255,255,.9)';rr(14,100,250,150,18);x.fill();T('🪙 Coins: '+S.coins,30,135,22,'#b07a00');T('🐷 Piggy bank: '+S.piggy,30,170,20,'#ff4f9a');T('Goal: '+S.goal+'   Sold: '+S.sold,30,200,17,'#2a3a5a');
 x.fillStyle='#ffe0ee';rr(30,212,220,20,10);x.fill();x.fillStyle='#ff6fae';rr(30,212,220*Math.min(1,S.piggy/S.goal),20,10);x.fill();
 kb('sr',14,262,250,40,'Save '+saveRate+'% of each sale',()=>{saveRate=saveRate>=50?0:saveRate+10},{bg:'#ff6fae',fs:16});
 const L=S.designs.slice(-8);L.forEach((d,i)=>{const X=290+(i%4)*92,Y=100+Math.floor(i/4)*110;BTN['d'+i]={x:X,y:Y,w:84,h:100,fn:()=>{shopD=d;price=Math.max(price,cost(d.type)+1)}};x.fillStyle=shopD===d?'#ffd24a':'#fff';rr(X,Y,84,100,12);x.fill();drawGarment(d,X+12,Y+12,.2)});
 if(!L.length)T('No designs yet!',450,170,22,'#7a889a','center');
 if(shopD){x.fillStyle='#fff';rr(670,100,215,220,18);x.fill();drawGarment(shopD,720,110,.4);const c0=cost(shopD.type);T('Cost to make: '+c0,690,268,17,'#2a3a5a');T('Price: '+price,690,296,22,'#ff4f9a');T('Profit: '+(price-c0),790,296,17,price-c0>0?'#3ac060':'#e8303a')}
 kb('pm',670,330,60,46,'−',()=>{price=Math.max(1,price-1)},{bg:'#9aa8b8',fs:28});kb('pp',740,330,60,46,'+',()=>{price=Math.min(99,price+1)},{bg:'#9aa8b8',fs:28});kb('sell',810,330,76,46,'Sell!',sellTry,{bg:'#3ac060',fs:20});
 x.fillStyle='rgba(255,255,255,.9)';rr(14,320,640,70,16);x.fill();x.fillStyle='#2a3a5a';x.font='bold 17px '+KF;wrapT(shopMsg,28,348,610,22);
 cust.forEach(c2=>{c2.t+=1/60;emo(c2.e,100+c2.t*400,450,60);emo(c2.buy?'🛍️':'💭',130+c2.t*400,420,30)});cust=cust.filter(c2=>c2.t<2.2);
 kb('les',14,520,200,56,'📚 Money lesson',()=>newLesson(),{bg:'#b06aff',fs:19});kb('st',224,520,180,56,'✂️ Studio',()=>{G.state='studio'},{bg:'#4ab0e8',fs:19});kb('hm',414,520,140,56,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8',fs:19});
 kb('real',580,520,306,56,'🔒 Real Shop (grown-ups)',()=>parentGate(),{bg:'#7a889a',fs:18});if(lesson)drawLesson()}
const LESS=[()=>{const c0=2+Math.random()*6|0,p=c0+2+Math.random()*8|0;return{q:'A cap costs '+c0+' coins to make. You sell it for '+p+'. What is your PROFIT?',a:p-c0,tip:'Profit = price − cost'}},
 ()=>{const c0=3+Math.random()*5|0,pr=1+Math.random()*6|0;return{q:'A tee costs '+c0+' to make and you want '+pr+' coins profit. What PRICE should you charge?',a:c0+pr,tip:'Price = cost + profit'}},
 ()=>{const p=10*(1+Math.random()*5|0);return{q:'You sell a dress for '+p+' coins and save 10% in your piggy bank. How many coins do you SAVE?',a:p/10,tip:'10% means 1 out of every 10'}},
 ()=>{const g=10*(2+Math.random()*5|0),w=5;return{q:'You save '+w+' coins every day. How many days to save '+g+' coins?',a:g/w,tip:'Saving a little each day adds up!'}},
 ()=>{const n=2+Math.random()*4|0,c0=2+Math.random()*4|0;return{q:'Making '+n+' totes costs '+c0+' coins each. What is the TOTAL COST?',a:n*c0,tip:'Total cost = number × cost each'}}];
function newLesson(){const L=LESS[Math.random()*LESS.length|0]();const o=new Set([L.a]);while(o.size<3)o.add(Math.max(0,L.a+(Math.random()*9|0)-4));L.o=[...o].sort(()=>Math.random()-.5);lesson=L;speak(L.q)}
function drawLesson(){x.fillStyle='rgba(0,0,0,.4)';x.fillRect(0,0,900,600);x.fillStyle='#fff';rr(130,90,640,400,26);x.fill();T('📚 Money Lesson',450,140,30,'#b06aff','center');x.fillStyle='#2a3a5a';x.font='bold 22px '+KF;wrapT(lesson.q,170,190,560,30);T('💡 '+lesson.tip,450,300,18,'#7a4a8a','center');
 lesson.o.forEach((v,i)=>kb('lo'+i,180+i*190,330,160,70,String(v),()=>{if(v===lesson.a){S.coins+=2;S.lessons++;reward(S,1,'Correct! +2 coins');lesson=null}else{oops();speak('Try again!')}},{bg:'#3ac0a0',fs:30}));kb('lx',370,420,160,50,'Close',()=>{lesson=null},{bg:'#9aa8b8',fs:18})}
// ---- print PNG ----
function printPNG(d,size){const cv=document.createElement('canvas');cv.width=cv.height=size||2400;const ox=x;x=cv.getContext('2d');const s=cv.width/320;x.save();x.scale(s,s);x.translate(10,0);
 // print file: artwork area only on transparent background
 x.save();gPath(d.type);x.clip();x.fillStyle=d.col;x.fillRect(-10,-30,330,360);if(d.pat!=='none')patDraw(d.pat,d.pcol);d.stk.forEach(k=>emo(k.e,k.x,k.y,k.s||46));if(d.text){x.font='bold 30px '+KF;x.textAlign='center';x.fillStyle=d.tcol;x.fillText(d.text,150,d.type==='hat'?160:d.type==='tote'?220:180)}x.restore();x.restore();const u=cv.toDataURL('image/png');x=ox;return u}
function mockPNG(d){const cv=document.createElement('canvas');cv.width=600;cv.height=640;const ox=x;x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,600,640);drawGarment(d,0,0,2);const u=cv.toDataURL('image/png');x=ox;return u}
function dl(u,n){const a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove()}
// ---- grown-ups area (DOM) ----
const OWNER='songwriterkaz@gmail.com';const SUP={Gelato:'Gelato (prints in Australia)',Printful:'Printful',Printify:'Printify'};
const PS=kStore('kidsFashionParent',{pinH:'',consent:null,orders:[]});
function h32(s){let h=2166136261;for(const ch of 'cbkf:'+s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
let PV=null;
function pv(html){if(!PV){PV=document.createElement('div');PV.id='kfParent';PV.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(20,30,50,.75);overflow:auto;font-family:system-ui,Arial,sans-serif;color:#1a2233';
 const st=document.createElement('style');st.textContent='#kfParent .card{background:#fff;max-width:760px;margin:24px auto;padding:22px 26px;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.4)}#kfParent h2{margin:.2em 0;color:#c0306a}#kfParent label{display:block;margin:8px 0 2px;font-weight:600}#kfParent input[type=text],#kfParent input[type=email],#kfParent input[type=password],#kfParent input[type=number],#kfParent input[type=date],#kfParent select{width:100%;box-sizing:border-box;padding:8px;font-size:16px;border:1px solid #aab;border-radius:8px}#kfParent .ck{display:flex;gap:8px;align-items:flex-start;font-weight:400;margin:6px 0}#kfParent .ck input{margin-top:4px;width:18px;height:18px}#kfParent button{font-size:15px;padding:9px 14px;margin:6px 6px 0 0;border-radius:10px;border:0;background:#c0306a;color:#fff;cursor:pointer}#kfParent button.g{background:#5a6a80}#kfParent .note{font-size:13px;color:#556;background:#f4f6fa;padding:8px 10px;border-radius:8px}#kfParent .err{color:#c00;font-weight:600}#kfParent canvas{border:1px dashed #889;border-radius:8px;background:#fff;touch-action:none;width:100%;max-width:600px;height:auto}#kfParent .row{display:flex;gap:12px;flex-wrap:wrap}#kfParent .row>div{flex:1;min-width:200px}#kfParent .des{display:flex;gap:12px;border:1px solid #dde;border-radius:12px;padding:10px;margin:10px 0;align-items:center;flex-wrap:wrap}#kfParent .des img{width:110px;height:117px;object-fit:contain;background:#f8f8fb;border-radius:8px}';PV.appendChild(st);PV.inner=document.createElement('div');PV.appendChild(PV.inner);document.body.appendChild(PV)}
 PV.style.display='block';PV.inner.innerHTML='<div class="card">'+html+'</div>';const q=s=>PV.querySelector(s);return q}
function pclose(){if(PV)PV.style.display='none'}window.kfClose=pclose;
function parentGate(){if(DEMO){window.demoEnd&&window.demoEnd('The grown-ups Real Shop (parent consent, approvals and real printed orders) is in the full game.');return}
 const a=6+Math.random()*7|0,b=6+Math.random()*7|0,cc=10+Math.random()*30|0;const q=pv('<h2>🔒 Grown-ups only</h2><p>Please ask a parent or guardian to continue.</p><label>What is '+a+' × '+b+' + '+cc+'?</label><input id="gA" type="number" inputmode="numeric"><label>'+(PS.pinH?'Parent PIN':'Create a 4–8 digit parent PIN')+'</label><input id="gP" type="password" inputmode="numeric" maxlength="8">'+(PS.pinH?'':'<label>Type the PIN again</label><input id="gP2" type="password" inputmode="numeric" maxlength="8">')+'<p id="gE" class="err"></p><button id="gGo">Continue</button><button class="g" onclick="kfClose()">Back to game</button>'+(PS.pinH?'<p class="note">Forgot the PIN? <a href="#" id="gR">Reset Real Shop</a> (clears the PIN, consent and approvals on this device).</p>':''));
 q('#gGo').onclick=()=>{const e=q('#gE');if(+q('#gA').value!==a*b+cc){e.textContent='That answer is not right.';return}const p=q('#gP').value.trim();if(!/^\d{4,8}$/.test(p)){e.textContent='PIN must be 4 to 8 digits.';return}
  if(!PS.pinH){if(p!==q('#gP2').value.trim()){e.textContent='PINs do not match.';return}PS.pinH=h32(p);PS.save()}else if(h32(p)!==PS.pinH){e.textContent='Wrong PIN.';return}parentHome()};
 if(q('#gR'))q('#gR').onclick=ev=>{ev.preventDefault();if(confirm('Reset the Real Shop on this device? Kids designs are kept.')){PS.pinH='';PS.consent=null;PS.orders=[];PS.save();parentGate()}}}
function parentHome(){if(!PS.consent||PS.consent.withdrawn)return consentForm();const C=PS.consent;
 let h='<h2>🏪 Real Shop — grown-ups</h2><p class="note">Consent on file from <b>'+esc(C.parent)+'</b> ('+esc(C.rel)+') for <b>'+esc(C.child)+'</b>, signed '+esc(C.date)+'. Earnings go to PayPal: <b>'+esc(C.paypal)+'</b>.</p>'+
 '<p>Approve a design, set a price and choose a supplier. "Email order request" downloads the print PNG and opens an email to Coffeebreak ('+OWNER+'). <b>Attach the downloaded PNG</b> to that email before sending — email links can\'t attach files by themselves.</p>';
 if(!S.designs.length)h+='<p><i>No saved designs yet. Your child can save designs in the Design Studio.</i></p>';
 S.designs.slice().reverse().forEach(d=>{const o=PS.orders.find(z=>z.id===d.id)||{};h+='<div class="des" data-id="'+d.id+'"><img src="'+mockPNG(d)+'"><div style="flex:1;min-width:220px"><b>'+esc(d.name)+'</b> — '+esc(TYPES.find(a=>a[0]===d.type)[1])+'<label class="ck"><input type="checkbox" class="ap" '+(o.ok?'checked':'')+'> I have looked at this design and approve it for sale</label><div class="row"><div><label>Price (AUD)</label><input type="number" class="pr" min="1" step="0.5" value="'+(o.price||'')+'"></div><div><label>Supplier</label><select class="sp">'+Object.keys(SUP).map(k=>'<option value="'+k+'" '+(o.sup===k?'selected':'')+'>'+SUP[k]+'</option>').join('')+'</select></div><div><label>Size</label><select class="sz">'+(d.type==='hat'||d.type==='tote'?['One size']:['Kids 4','Kids 6','Kids 8','Kids 10','Kids 12','Kids 14','Adult S','Adult M','Adult L','Adult XL']).map(z=>'<option '+(o.size===z?'selected':'')+'>'+z+'</option>').join('')+'</select></div></div><button class="em">📧 Email order request</button><button class="g pn">⬇️ Print PNG only</button>'+(o.sent?'<span class="note"> Requested '+esc(o.sent)+'</span>':'')+'</div></div>'});
 h+='<hr><button class="g" id="vC">View / print consent form</button><button class="g" id="wC">Withdraw consent</button><button class="g" onclick="kfClose()">Back to game</button><p class="note">Coffeebreak never collects your child\'s personal details beyond a first name, and there is no chat in this game. Orders are reviewed by Coffeebreak, which replies with a price and a PayPal payment request; nothing is charged automatically.</p>';
 const q=pv(h);PV.querySelectorAll('.des').forEach(el=>{const d=S.designs.find(z=>z.id===el.dataset.id),g=s=>el.querySelector(s);
  const rec=()=>{let o=PS.orders.find(z=>z.id===d.id);if(!o){o={id:d.id};PS.orders.push(o)}o.ok=g('.ap').checked;o.price=g('.pr').value;o.sup=g('.sp').value;o.size=g('.sz').value;PS.save();return o};
  ['.ap','.pr','.sp','.sz'].forEach(s=>g(s).onchange=rec);
  const fn=()=>'kidsfashion-'+(d.name||'design').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'-print.png';
  g('.pn').onclick=()=>dl(printPNG(d,2400),fn());
  g('.em').onclick=()=>{const o=rec();if(!o.ok){alert('Please tick the approval box first.');return}if(!(+o.price>0)){alert('Please set a price.');return}dl(printPNG(d,2400),fn());o.sent=new Date().toLocaleString('en-AU');PS.save();
   const body='Coffeebreak Kids Fashion Shop — ORDER REQUEST\n\nDesign: '+d.name+'\nProduct: '+TYPES.find(a=>a[0]===d.type)[1]+'\nSize: '+o.size+'\nBase colour: '+d.col+'\nPattern: '+PATN[d.pat]+(d.pat!=='none'?' ('+d.pcol+')':'')+'\nStickers: '+(d.stk.map(k=>k.e).join(' ')||'none')+'\nWords: '+(d.text||'none')+'\nSupplier: '+SUP[o.sup]+'\nPrice set by parent: AUD $'+(+o.price).toFixed(2)+'\nDesign ID: '+d.id+'\n\nApproved by parent/guardian: '+C.parent+' ('+C.rel+')\nParent email: '+C.email+'\nEarnings PayPal (parent): '+C.paypal+'\nChild (first name only): '+C.child+'\nConsent signed: '+C.date+'\n\nPrint file: '+fn()+' (attached — 2400x2400 PNG)\n';
   location.href='mailto:'+OWNER+'?subject='+encodeURIComponent('Kids Fashion order request: '+d.name+' ('+o.sup+')')+'&body='+encodeURIComponent(body);setTimeout(parentHome,400)}});
 q('#vC').onclick=()=>consentView();q('#wC').onclick=()=>{if(confirm('Withdraw consent? Real orders will stop until a new consent form is completed.')){PS.consent.withdrawn=new Date().toISOString();PS.save();location.href='mailto:'+OWNER+'?subject='+encodeURIComponent('Kids Fashion Shop: consent withdrawn')+'&body='+encodeURIComponent('I withdraw my consent for '+C.child+'\'s designs to be sold.\n\n'+C.parent+' ('+C.email+')\n'+new Date().toLocaleString('en-AU'));setTimeout(pclose,300)}}}
const CHK=[['adult','I am 18 or older and I am this child\'s parent or legal guardian.'],['sell','I consent to my child\'s designs being sold as real products.'],['approve','I will review and approve each design before it is offered for sale.'],['paypal','Earnings are paid to my PayPal account, not to the child.'],['contact','Coffeebreak may contact me by email about orders.'],['withdraw','I understand I can withdraw this consent at any time by emailing Coffeebreak, and future sales will stop.']];
function consentForm(){const today=new Date().toISOString().slice(0,10);
 const q=pv('<h2>📝 Parent / Guardian Consent Form</h2><p><b>Coffeebreak Kids Fashion Shop — Real Shop</b></p><p class="note">Template only, not legal advice. This form records your permission for designs made by your child in this game to be printed and sold as real products through Coffeebreak. Only your child\'s <b>first name</b> is collected. There is no chat in this game.</p>'+
 '<div class="row"><div><label>Parent / guardian full name</label><input id="cP" type="text" autocomplete="name"></div><div><label>Relationship to child</label><select id="cR"><option value="">Choose…</option><option>Mother</option><option>Father</option><option>Legal guardian</option><option>Other parent/carer with legal authority</option></select></div></div>'+
 '<div class="row"><div><label>Child\'s first name only</label><input id="cC" type="text" maxlength="20" autocomplete="off"></div><div><label>Date</label><input id="cD" type="date" value="'+today+'"></div></div>'+
 '<div class="row"><div><label>Parent email</label><input id="cE" type="email" autocomplete="email"></div><div><label>PayPal email (for earnings)</label><input id="cY" type="email"></div></div>'+
 '<h3>I confirm that:</h3>'+CHK.map(c=>'<label class="ck"><input type="checkbox" id="k_'+c[0]+'"> '+c[1]+'</label>').join('')+
 '<label>Typed signature (type your full name)</label><input id="cS" type="text"><label>Draw your signature</label><canvas id="cPad" width="600" height="170"></canvas><br><button class="g" id="cClr">Clear signature</button>'+
 '<p id="cErr" class="err"></p><button id="cSave">✅ Sign &amp; save consent</button><button class="g" onclick="kfClose()">Cancel</button>');
 const pad=q('#cPad'),pc=pad.getContext('2d');let dn=false,inked=false;pc.lineWidth=3;pc.lineCap='round';pc.strokeStyle='#1a2a6a';
 const pp=e=>{const r=pad.getBoundingClientRect(),z=e.touches?e.touches[0]:e;return[(z.clientX-r.left)*pad.width/r.width,(z.clientY-r.top)*pad.height/r.height]};
 const st=e=>{e.preventDefault();dn=true;const [a,b]=pp(e);pc.beginPath();pc.moveTo(a,b)},mv=e=>{if(!dn)return;e.preventDefault();const [a,b]=pp(e);pc.lineTo(a,b);pc.stroke();inked=true},en=()=>dn=false;
 pad.addEventListener('mousedown',st);pad.addEventListener('mousemove',mv);addEventListener('mouseup',en);pad.addEventListener('touchstart',st,{passive:false});pad.addEventListener('touchmove',mv,{passive:false});pad.addEventListener('touchend',en);
 q('#cClr').onclick=()=>{pc.clearRect(0,0,600,170);inked=false};
 q('#cSave').onclick=()=>{const v=s=>q(s).value.trim(),E=q('#cErr'),em=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;const C={parent:v('#cP'),rel:v('#cR'),child:v('#cC'),date:v('#cD'),email:v('#cE'),paypal:v('#cY'),typed:v('#cS')};
  if(C.parent.split(/\s+/).length<2)return E.textContent='Please enter your full name (first and last).';if(!C.rel)return E.textContent='Please choose your relationship to the child.';
  if(!/^[A-Za-z\u00C0-\u024F'-]{1,20}$/.test(C.child))return E.textContent='Child\'s FIRST name only please (one word, letters only).';if(!em.test(C.email))return E.textContent='Please enter a valid parent email.';if(!em.test(C.paypal))return E.textContent='Please enter a valid PayPal email.';
  if(CHK.some(c=>!q('#k_'+c[0]).checked))return E.textContent='Please tick every box to give consent.';if(C.typed.toLowerCase()!==C.parent.toLowerCase())return E.textContent='Typed signature must match your full name.';if(!inked)return E.textContent='Please draw your signature.';if(!C.date)return E.textContent='Please add the date.';
  C.sig=pad.toDataURL('image/png');C.at=new Date().toISOString();C.checks=CHK.map(c=>c[0]);PS.consent=C;PS.save();consentView(true)}}
function consentPNG(C){const cv=document.createElement('canvas');cv.width=1240;cv.height=1754;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1240,1754);g.fillStyle='#1a2233';let y=110;
 const L=(s,sz,b,col)=>{g.font=(b?'bold ':'')+sz+'px Arial';g.fillStyle=col||'#1a2233';const w=s.split(' ');let l='';for(const z of w){if(g.measureText(l+z).width>1080&&l){g.fillText(l.trim(),80,y);y+=sz*1.35;l=''}l+=z+' '}g.fillText(l.trim(),80,y);y+=sz*1.35};
 L('Parent / Guardian Consent Form',44,1,'#c0306a');L('Coffeebreak Kids Fashion Shop — Real Shop',28,1);L('TEMPLATE ONLY — NOT LEGAL ADVICE',22,1,'#a00');y+=20;
 [['Parent / guardian full name',C.parent],['Relationship to child',C.rel],['Child\'s first name',C.child],['Parent email',C.email],['PayPal email for earnings',C.paypal],['Date',C.date]].forEach(([k,v])=>L(k+':  '+v,28));y+=20;L('I confirm that:',30,1);
 CHK.forEach(c=>L('☑  '+c[1],26));y+=30;L('Typed signature:  '+C.typed,28);L('Drawn signature:',28);const im=new Image();im.src=C.sig;return new Promise(r=>{im.onload=()=>{g.strokeStyle='#889';g.strokeRect(80,y,600,170);g.drawImage(im,80,y,600,170);y+=230;L('Signed electronically '+new Date(C.at).toLocaleString('en-AU')+'. A copy is to be emailed to songwriterkaz@gmail.com. Earnings are paid to the parent/guardian\'s PayPal, never to the child. Consent can be withdrawn at any time by emailing songwriterkaz@gmail.com.',20,0,'#556');r(cv.toDataURL('image/png'))};im.onerror=()=>r(cv.toDataURL('image/png'))})}
function consentHTML(C){return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Consent form — '+esc(C.child)+'</title><style>body{font-family:Arial;max-width:760px;margin:30px auto;color:#1a2233}h1{color:#c0306a}.w{color:#a00;font-weight:bold}td{padding:5px 10px}</style></head><body><h1>Parent / Guardian Consent Form</h1><h3>Coffeebreak Kids Fashion Shop — Real Shop</h3><p class="w">TEMPLATE ONLY — NOT LEGAL ADVICE</p><table>'+[['Parent / guardian full name',C.parent],['Relationship',C.rel],['Child\'s first name',C.child],['Parent email',C.email],['PayPal email',C.paypal],['Date',C.date]].map(r=>'<tr><td><b>'+r[0]+'</b></td><td>'+esc(r[1])+'</td></tr>').join('')+'</table><h3>I confirm that:</h3>'+CHK.map(c=>'<p>☑ '+esc(c[1])+'</p>').join('')+'<p><b>Typed signature:</b> '+esc(C.typed)+'</p><p><b>Drawn signature:</b><br><img src="'+C.sig+'" style="border:1px solid #889;width:400px"></p><p style="font-size:12px;color:#556">Signed electronically '+esc(new Date(C.at).toLocaleString('en-AU'))+'. Earnings are paid to the parent/guardian, never the child. Withdraw consent anytime by emailing songwriterkaz@gmail.com.</p><script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>'}
function consentView(fresh){const C=PS.consent;const q=pv('<h2>'+(fresh?'✅ Consent saved':'Consent form')+'</h2><p>Thank you, '+esc(C.parent)+'. Please keep a copy and send one to Coffeebreak.</p><button id="vPng">⬇️ Download PNG</button><button id="vPdf">🖨️ Print / Save as PDF</button><button id="vMail">📧 Email a copy to Coffeebreak</button><p class="note">The email opens in your mail app addressed to '+OWNER+'. Attach the downloaded PNG (or PDF) before sending.</p><button class="g" id="vGo">Continue to Real Shop</button>');
 q('#vPng').onclick=async()=>dl(await consentPNG(C),'kids-fashion-consent-'+C.child+'.png');
 q('#vPdf').onclick=()=>{const w=window.open('','_blank');if(w){w.document.write(consentHTML(C));w.document.close()}else alert('Please allow pop-ups to print.')};
 q('#vMail').onclick=async()=>{dl(await consentPNG(C),'kids-fashion-consent-'+C.child+'.png');const body='Parent/Guardian Consent — Coffeebreak Kids Fashion Shop (template, not legal advice)\n\nParent/guardian: '+C.parent+'\nRelationship: '+C.rel+'\nChild (first name): '+C.child+'\nParent email: '+C.email+'\nPayPal email: '+C.paypal+'\nDate: '+C.date+'\n\nI confirm:\n'+CHK.map(c=>'[x] '+c[1]).join('\n')+'\n\nTyped signature: '+C.typed+'\nDrawn signature: see attached PNG\nSigned: '+C.at+'\n';location.href='mailto:'+OWNER+'?cc='+encodeURIComponent(C.email)+'&subject='+encodeURIComponent('Kids Fashion Shop parent consent: '+C.parent)+'&body='+encodeURIComponent(body)};
 q('#vGo').onclick=()=>parentHome()}
// ---- input / loop ----
function studioDown(p){if(G.state!=='studio'||!pickStk)return;const lx=(p.x-165),ly=(p.y-80);if(lx<0||ly<0||lx>300||ly>330)return;D.stk.push({e:pickStk,x:lx,y:ly,s:46});kTone(900,.06,.05);if(D.stk.length>12)D.stk.shift()}
bindInput({down(p){studioDown(p)}});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='studio')drawStudio();else if(s==='model')drawModel();else if(s==='shop')drawShop();else if(s==='stk')stickerBook(S,()=>{G.state='title'});kOverlay(1/60)}
window.KF2={G,S,PS,get D(){return D},set D(v){D=v},saveDesign,openShop,sellTry,newLesson,parentGate,parentHome,consentForm,consentPNG,printPNG,mockPNG,setPrice:v=>price=v,TYPES};startLoop();
