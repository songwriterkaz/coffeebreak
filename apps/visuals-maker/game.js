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
// ===== Coffeebreak Visuals Maker =====
if(localStorage.vmMusic!=='1'){muted=true;music.muted=true;$('mute').textContent='🔇 Muted'}
$('mute').addEventListener('click',()=>{localStorage.vmMusic=muted?'0':'1'});
const S=kStore('cbVisuals',{lib:[]});const G={state:'title',score:S.lib.length,level:0};window.G=G;
const CALM={bg1:'#eef4f7',bg2:'#e4eef0',ink:'#2f4858',a:'#6aa9c9',g:'#7cbf9a',o:'#e8b46a',r:'#d98a8a',p:'#a99ad6'};
function cbg(){x.fillStyle=CALM.bg1;x.fillRect(0,0,900,600)}
function cb(id,X,Y,w,h,l,fn,o={}){o.bg=o.bg||CALM.a;o.fs=o.fs||Math.min(22,h*.4);kb(id,X,Y,w,h,l,fn,o)}
const TYPES=[['single','🃏','Single card',1],['firstthen','➡️','First / Then',2],['schedule','🗓️','Daily schedule',6],['choice','🤔','Choice board',4],['feelings','😊','Feelings cards',6],['story','📖','Social story',4],['reward','⭐','Reward chart',1]];
const DEF={single:[['🙂','My card']],firstthen:[['🦷','Brush teeth'],['📺','TV time']],
 schedule:[['🛏️','Wake up'],['🚽','Toilet'],['👕','Get dressed'],['🥣','Breakfast'],['🎒','School'],['🛁','Bath']],
 choice:[['🧩','Puzzle'],['🎨','Drawing'],['🛝','Play outside'],['📚','Read a book']],
 feelings:[['😀','Happy'],['😢','Sad'],['😠','Angry'],['😨','Scared'],['😴','Tired'],['😌','Calm']],
 story:[['🏫','We are going to the shop.'],['🛒','I can push the trolley.'],['🔊','It might be noisy. I can wear headphones.'],['🏠','Then we go home.']],
 reward:[['🎁','I am working for...']]};
const DEMO_T=['single','firstthen'];
const STICKERS=['🙂','😀','😢','😠','😨','😴','😌','🤗','🥰','😮','🤔','🙁','🛏️','🚽','🦷','🛁','🚿','👕','👟','🧥','🥣','🍎','🥪','🥤','🍕','🍌','🥕','💧','🏫','🎒','🚌','🚗','🏠','🛒','🏥','🌳','🛝','⚽','🧩','🎨','📚','📺','🎮','🎵','🎧','🧸','🐶','🐱','⭐','❤️','✅','❌','✋','👍','🤫','⏰','☀️','🌙','🌧️','🙏','👩','👨','👧','👦','👶','👵','🧑‍🏫','🧑‍⚕️','✏️','✂️','🖍️','🧼','🧻','💤','🔊','🔇','🎁','🍦','🏊','🚲'];
let B=null,mode='tick',drag=null,cur=-1;
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function newBoard(tp){const d=DEF[tp];B={id:uid(),type:tp,title:TYPES.find(q=>q[0]===tp)[2],cards:d.map(q=>({emo:q[0],label:q[1],img:null,done:false})),stars:0,goal:5};G.state='board';mode='tick'}
const imc={};function imgOf(s){if(!imc[s]){imc[s]=new Image();imc[s].src=s}return imc[s]}
function slots(b){const tp=b.type,o=[];
 if(tp==='single')o.push({x:290,y:80,w:320,h:380});
 else if(tp==='firstthen'){o.push({x:110,y:110,w:300,h:350,hd:'First'});o.push({x:490,y:110,w:300,h:350,hd:'Then'})}
 else if(tp==='schedule'||tp==='feelings')for(let i=0;i<6;i++)o.push({x:60+(i%3)*270,y:75+Math.floor(i/3)*215,w:240,h:200,n:tp==='schedule'?i+1:0});
 else if(tp==='choice')for(let i=0;i<4;i++)o.push({x:150+(i%2)*320,y:100+Math.floor(i/2)*190,w:280,h:175});
 else if(tp==='story')for(let i=0;i<4;i++)o.push({x:50+(i%2)*410,y:75+Math.floor(i/2)*215,w:390,h:200,st:1});
 else if(tp==='reward')o.push({x:50,y:110,w:300,h:350,hd:'I am working for'});
 return o}
function drawCard(cd,r){x.fillStyle='rgba(0,0,0,.08)';rr(r.x,r.y+4,r.w,r.h,18);x.fill();x.fillStyle='#fff';rr(r.x,r.y,r.w,r.h,18);x.fill();x.strokeStyle='#c9d6dd';x.lineWidth=3;x.stroke();
 const lh=r.st?60:40,s=Math.min(r.w-24,r.h-lh-20),ix=r.st?r.x+12:r.x+(r.w-s)/2,iy=r.y+10;const ss=r.st?Math.min(r.h-24,170):s;
 if(cd.img){const im=imgOf(cd.img);if(im.complete&&im.naturalWidth)x.drawImage(im,ix,iy,ss,ss)}else emo(cd.emo||'🙂',ix+ss/2,iy+ss/2,ss*.6);
 x.fillStyle=CALM.ink;x.font='bold '+(r.st?19:Math.min(26,r.w/9))+'px '+KF;x.textAlign=r.st?'left':'center';
 if(r.st)wrapT(cd.label||'',ix+ss+14,r.y+44,r.w-ss-38,26);else x.fillText(cd.label||'',r.x+r.w/2,r.y+r.h-16);x.textAlign='left';
 if(r.n){x.fillStyle=CALM.a;x.beginPath();x.arc(r.x+22,r.y+22,17,0,7);x.fill();T(''+r.n,r.x+22,r.y+29,19,'#fff','center')}
 if(r.hd)T(r.hd,r.x+r.w/2,r.y-14,30,CALM.ink,'center');
 if(cd.done){x.fillStyle='rgba(124,191,154,.45)';rr(r.x,r.y,r.w,r.h,18);x.fill();emo('✅',r.x+r.w-34,r.y+34,44)}}
function drawBoardOn(exp){cbg();T(B.title,450,50,32,CALM.ink,'center');const sl=slots(B);
 B.cards.forEach((cd,i)=>{if(drag&&drag.i===i&&drag.moved)return;drawCard(cd,sl[i])});
 if(B.type==='firstthen')emo('➡️',450,285,60);
 if(B.type==='reward'){T('Stars: '+B.stars+' / '+B.goal,620,120,26,CALM.ink,'center');for(let i=0;i<B.goal;i++){const X=420+(i%5)*85,Y=150+Math.floor(i/5)*95;x.fillStyle='#fff';rr(X,Y,75,80,14);x.fill();x.strokeStyle='#c9d6dd';x.lineWidth=3;x.stroke();x.globalAlpha=i<B.stars?1:.18;emo('⭐',X+37,Y+42,52);x.globalAlpha=1;if(!exp)BTN['st'+i]={x:X,y:Y,w:75,h:80,fn:()=>{B.stars=i<B.stars?i:i+1;if(B.stars>=B.goal){confetti(40);yay();speak('You did it!')}else kTone(700,.1,.05)}}}
  if(!exp){cb('g-',420,350,70,50,'−',()=>{B.goal=Math.max(3,B.goal-1);B.stars=Math.min(B.stars,B.goal)});cb('g+',500,350,70,50,'+',()=>{B.goal=Math.min(10,B.goal+1)});T('stars needed',590,383,18,CALM.ink,'left','')}}
 if(drag&&drag.moved){const r=sl[drag.i];x.globalAlpha=.85;drawCard(B.cards[drag.i],{...r,x:drag.p.x-drag.ox,y:drag.p.y-drag.oy});x.globalAlpha=1}}
function drawBoard(){drawBoardOn(false);const dm=DEMO;
 cb('mt',10,530,150,56,mode==='tick'?'✔ Tick mode':'✏️ Edit mode',()=>{mode=mode==='tick'?'edit':'tick'},{bg:mode==='tick'?CALM.g:CALM.o,fs:19});
 cb('nm',170,530,120,56,'🔤 Title',()=>ask('Board title',B.title,v=>B.title=v),{fs:19});
 cb('rs',300,530,120,56,'↺ Reset',()=>{B.cards.forEach(q=>q.done=false);B.stars=0},{bg:CALM.p,fs:19});
 cb('sv',430,530,115,56,(dm?'🔒 ':'')+'💾 Save',saveLib,{bg:CALM.g,fs:18});
 cb('px',555,530,110,56,(dm?'🔒 ':'')+'🖼️ PNG',exportPNG,{fs:18});
 cb('pr',675,530,110,56,(dm?'🔒 ':'')+'🖨️ Print',printBoard,{bg:CALM.p,fs:18});
 cb('bk',795,530,95,56,'🏠',()=>{G.state='menu'},{bg:CALM.r});
 T(mode==='tick'?'Tap a card to tick it off. Drag cards to change the order.':'Tap a card to draw, add pictures and change its words.',450,515,16,'#5a7080','center','')}
function lock(m){window.demoEnd&&window.demoEnd(m||'Photo and magazine pictures, schedules, choice boards, feelings cards, social stories, reward charts, your saved library, PNG export and printing are all in the full app!');return true}
function saveLib(){if(DEMO)return lock();const i=S.lib.findIndex(q=>q.id===B.id);const cp=JSON.parse(JSON.stringify(B));if(i>=0)S.lib[i]=cp;else S.lib.unshift(cp);try{localStorage.setItem('cbVisuals',JSON.stringify({stars:S.stars,stk:S.stk,lib:S.lib}));G.score=S.lib.length;POP={t:0,txt:'Saved to My Library'};kTone(660,.15,.05)}catch(e){S.lib.splice(S.lib.indexOf(cp),1);POP={t:0,txt:'Library full: delete one first'}}}
function renderPNG(){const o=document.createElement('canvas');o.width=900;o.height=510;const old=x;x=o.getContext('2d');const sb=Object.assign({},BTN);drawBoardOn(true);for(const k in BTN)if(!(k in sb))delete BTN[k];x=old;return o.toDataURL('image/png')}
function exportPNG(){if(DEMO)return lock();const a=document.createElement('a');a.href=renderPNG();a.download=(B.title||'visual').replace(/[^\w ]/g,'')+'.png';document.body.appendChild(a);a.click();a.remove()}
function printBoard(){if(DEMO)return lock();let d=$('vmPrint');if(!d){d=document.createElement('div');d.id='vmPrint';document.body.appendChild(d);const st=document.createElement('style');st.textContent='#vmPrint{display:none}@media print{body>*:not(#vmPrint){display:none!important}#vmPrint{display:block!important}#vmPrint img{width:100%}}';document.head.appendChild(st)}d.innerHTML='<img src="'+renderPNG()+'">';setTimeout(()=>{try{window.print()}catch(e){}},200)}
// ---- text entry overlay ----
function ask(q,v,cb2){let d=$('vmAsk');if(!d){d=document.createElement('div');d.id='vmAsk';d.style.cssText='position:fixed;inset:0;z-index:98;background:rgba(40,60,70,.45);display:flex;align-items:center;justify-content:center';d.innerHTML='<div style="background:#fff;padding:22px;border-radius:20px;font:20px sans-serif;color:#2f4858;text-align:center;max-width:90vw"><div id="vmQ" style="margin-bottom:10px"></div><input id="vmIn" maxlength="90" style="font-size:24px;padding:10px;width:min(480px,80vw);border:3px solid #6aa9c9;border-radius:12px"><br><button id="vmOk" style="margin-top:14px;font-size:22px;padding:10px 30px;border:0;border-radius:14px;background:#7cbf9a;color:#fff">OK</button> <button id="vmNo" style="margin-top:14px;font-size:22px;padding:10px 30px;border:0;border-radius:14px;background:#d98a8a;color:#fff">Cancel</button></div>';document.body.appendChild(d)}
 d.style.display='flex';$('vmQ').textContent=q;const i=$('vmIn');i.value=v||'';setTimeout(()=>i.focus(),50);const done=ok=>{d.style.display='none';if(ok)cb2(i.value)};$('vmOk').onclick=()=>done(1);$('vmNo').onclick=()=>done(0);i.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')done(1)}}
// ---- card editor ----
const EW=400,AX=240,AY=50;const ed=document.createElement('canvas');ed.width=ed.height=EW;const ex=ed.getContext('2d');
const COLS=['#2f4858','#ffffff','#d9534f','#f0ad4e','#f7d94c','#7cbf9a','#3a9a5a','#6aa9c9','#3a6ab8','#a99ad6','#e79ac0','#8a5a3a'];
const TOOLS=[['pen','✏️'],['brush','🖌️'],['eraser','🧽'],['rect','⬜'],['circle','⚪'],['line','📏'],['sticker','😀'],['photo','📷']];
let tool='pen',col='#2f4858',size=8,stI=0,stPage=0,eLabel='',snapD=null,start=null,last=null,down=false,undo=[],place=null,fillShape=false;
function openCard(i){cur=i;const cd=B.cards[i];eLabel=cd.label||'';ex.fillStyle='#fff';ex.fillRect(0,0,EW,EW);undo=[];place=null;
 if(cd.img){const im=imgOf(cd.img);const f=()=>{ex.drawImage(im,0,0,EW,EW)};im.complete?f():im.onload=f}else{ex.font='240px serif';ex.textAlign='center';ex.textBaseline='middle';ex.fillText(cd.emo||'🙂',EW/2,EW/2+10)}G.state='edit'}
function pushU(){undo.push(ex.getImageData(0,0,EW,EW));if(undo.length>15)undo.shift()}
function finishCard(){if(place)stamp();const o=document.createElement('canvas');o.width=o.height=300;const g=o.getContext('2d');g.drawImage(ed,0,0,300,300);const cd=B.cards[cur];cd.img=o.toDataURL('image/jpeg',.85);cd.label=eLabel;G.state='board'}
function ep(p){return{x:p.x-AX,y:p.y-AY}}function inE(q){return q.x>=0&&q.y>=0&&q.x<=EW&&q.y<=EW}
function shape(q){ex.putImageData(snapD,0,0);ex.strokeStyle=col;ex.fillStyle=col;ex.lineWidth=size;ex.lineCap='round';ex.beginPath();
 if(tool==='rect')ex.rect(start.x,start.y,q.x-start.x,q.y-start.y);else if(tool==='circle')ex.ellipse((start.x+q.x)/2,(start.y+q.y)/2,Math.abs(q.x-start.x)/2,Math.abs(q.y-start.y)/2,0,0,7);else{ex.moveTo(start.x,start.y);ex.lineTo(q.x,q.y)}
 fillShape&&tool!=='line'?ex.fill():ex.stroke()}
function eDown(p){const q=ep(p);if(!inE(q))return;
 if(place){place.drag={dx:q.x-place.x,dy:q.y-place.y};return}
 pushU();down=true;start=q;last=q;snapD=ex.getImageData(0,0,EW,EW);
 if(tool==='sticker'){ex.font=(size*9)+'px serif';ex.textAlign='center';ex.textBaseline='middle';ex.fillText(STICKERS[stI],q.x,q.y);kTone(800,.06,.04);down=false}
 else if(tool==='pen'||tool==='brush'||tool==='eraser')eMove(p)}
function eMove(p){const q=ep(p);if(place&&place.drag){place.x=q.x-place.drag.dx;place.y=q.y-place.drag.dy;return}if(!down)return;
 if(['rect','circle','line'].includes(tool))return shape(q);
 ex.strokeStyle=tool==='eraser'?'#fff':col;ex.globalAlpha=tool==='brush'?.55:1;ex.lineWidth=tool==='eraser'?size*3:tool==='brush'?size*2.2:size;ex.lineCap=ex.lineJoin='round';ex.beginPath();ex.moveTo(last.x,last.y);ex.lineTo(q.x+.01,q.y);ex.stroke();ex.globalAlpha=1;last=q}
function eUp(){down=false;if(place)place.drag=null}
function stamp(){pushU();ex.drawImage(place.c,place.x,place.y,place.c.width*place.s,place.c.height*place.s);place=null;kTone(600,.1,.05)}
function drawEdit(){cbg();x.fillStyle='rgba(0,0,0,.1)';rr(AX-6,AY-4,EW+12,EW+12,14);x.fill();x.drawImage(ed,AX,AY);
 if(place){x.drawImage(place.c,AX+place.x,AY+place.y,place.c.width*place.s,place.c.height*place.s);x.setLineDash([8,6]);x.strokeStyle=CALM.o;x.lineWidth=3;x.strokeRect(AX+place.x,AY+place.y,place.c.width*place.s,place.c.height*place.s);x.setLineDash([])}
 T(eLabel||'(no words yet)',AX+EW/2,AY+EW+40,26,CALM.ink,'center');
 TOOLS.forEach((tl,i)=>cb('t'+i,10,10+i*62,100,54,(DEMO&&tl[0]==='photo'?'🔒':'')+tl[1],()=>{if(tl[0]==='photo'){if(DEMO)return lock();return pickPhoto()}tool=tl[0]},{sel:tool===tl[0],fs:26}));
 COLS.forEach((c2,i)=>{const X=120+(i%2)*55,Y=10+Math.floor(i/2)*55;BTN['c'+i]={x:X,y:Y,w:48,h:48,fn:()=>{col=c2}};x.fillStyle=c2;x.beginPath();x.arc(X+24,Y+24,22,0,7);x.fill();x.strokeStyle=col===c2?CALM.o:'#b8c8d0';x.lineWidth=col===c2?6:2;x.stroke()});
 [4,8,16].forEach((s2,i)=>cb('s'+i,120+i*37,345,33,44,'',()=>{size=s2},{sel:size===s2,bg:'#c9d6dd'}));[4,8,16].forEach((s2,i)=>{x.fillStyle=CALM.ink;x.beginPath();x.arc(136+i*37,367,s2/2.5+1,0,7);x.fill()});
 cb('fl',120,400,108,44,fillShape?'■ Filled':'□ Outline',()=>{fillShape=!fillShape},{bg:CALM.p,fs:16});
 const R=660;cb('lb',R,50,230,56,'🔤 Words',()=>ask('Words for this card',eLabel,v=>eLabel=v));
 cb('ud',R,116,230,56,'↩ Undo',()=>{if(undo.length)ex.putImageData(undo.pop(),0,0)},{bg:CALM.p});
 cb('cl',R,182,230,56,'🧹 Clear',()=>{pushU();ex.fillStyle='#fff';ex.fillRect(0,0,EW,EW)},{bg:CALM.o});
 cb('dn',R,380,230,60,'✔ Done',finishCard,{bg:CALM.g});cb('cx',R,450,230,56,'✖ Cancel',()=>{G.state='board'},{bg:CALM.r});
 if(place){cb('p-',AX,510,80,56,'➖',()=>{place.s=Math.max(.1,place.s*.85)});cb('p+',AX+90,510,80,56,'➕',()=>{place.s=Math.min(4,place.s*1.18)});cb('ps',AX+180,510,130,56,'📌 Stick',stamp,{bg:CALM.g});cb('pc',AX+320,510,80,56,'✖',()=>{place=null},{bg:CALM.r});T('Drag the picture to move it',R+115,300,16,'#5a7080','center','')}
 else if(tool==='sticker'){const per=10,pg=STICKERS.slice(stPage*per,stPage*per+per);pg.forEach((s2,i)=>{cb('sk'+i,AX-120+i*58,505,52,52,'',()=>{stI=stPage*per+i},{sel:stI===stPage*per+i,bg:'#fff'});emo(s2,AX-120+i*58+26,532,30)});cb('spg',AX+470,505,80,52,'▶',()=>{stPage=(stPage+1)%Math.ceil(STICKERS.length/per)},{bg:CALM.p})}}
// ---- photo / magazine upload, crop and cut-out (all on device) ----
let PH=null,sel=null,lasso=[],cmode='rect',cdown=false;const CR={x:40,y:70,w:820,h:420};
function pickPhoto(){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{PH=im;sel=null;lasso=[];G.state='crop'};im.src=r.result};r.readAsDataURL(f)};i.click()}
function fit(){const s=Math.min(CR.w/PH.width,CR.h/PH.height);return{s,x:CR.x+(CR.w-PH.width*s)/2,y:CR.y+(CR.h-PH.height*s)/2}}
function useCut(whole){const f=fit();let o=document.createElement('canvas'),g;
 if(whole||(!sel&&lasso.length<3)){o.width=PH.width;o.height=PH.height;o.getContext('2d').drawImage(PH,0,0)}
 else if(cmode==='rect'){const X=Math.min(sel.a.x,sel.b.x),Y=Math.min(sel.a.y,sel.b.y),w=Math.abs(sel.b.x-sel.a.x),h=Math.abs(sel.b.y-sel.a.y);if(w<5||h<5)return;o.width=w/f.s;o.height=h/f.s;o.getContext('2d').drawImage(PH,(X-f.x)/f.s,(Y-f.y)/f.s,o.width,o.height,0,0,o.width,o.height)}
 else{const xs=lasso.map(q=>(q.x-f.x)/f.s),ys=lasso.map(q=>(q.y-f.y)/f.s),mx=Math.min(...xs),my=Math.min(...ys);o.width=Math.max(...xs)-mx;o.height=Math.max(...ys)-my;g=o.getContext('2d');g.beginPath();xs.forEach((v,i)=>g.lineTo(v-mx,ys[i]-my));g.closePath();g.clip();g.drawImage(PH,-mx,-my)}
 const s=Math.min(1,(EW*.8)/Math.max(o.width,o.height));place={c:o,s,x:(EW-o.width*s)/2,y:(EW-o.height*s)/2};G.state='edit'}
function drawCrop(){cbg();T('Choose the part you want',450,45,28,CALM.ink,'center');const f=fit();x.drawImage(PH,f.x,f.y,PH.width*f.s,PH.height*f.s);
 x.strokeStyle=CALM.o;x.lineWidth=4;x.setLineDash([10,6]);if(cmode==='rect'&&sel)x.strokeRect(sel.a.x,sel.a.y,sel.b.x-sel.a.x,sel.b.y-sel.a.y);if(cmode==='cut'&&lasso.length){x.beginPath();lasso.forEach(q=>x.lineTo(q.x,q.y));if(!cdown)x.closePath();x.stroke()}x.setLineDash([]);
 cb('cr',40,515,170,60,'▭ Crop box',()=>{cmode='rect';lasso=[]},{sel:cmode==='rect'});cb('cu',220,515,170,60,'✂️ Cut out',()=>{cmode='cut';sel=null},{sel:cmode==='cut'});
 cb('ok',400,515,180,60,'✔ Use it',()=>useCut(false),{bg:CALM.g});cb('wh',590,515,160,60,'Whole pic',()=>useCut(true),{bg:CALM.p,fs:19});cb('no',760,515,100,60,'✖',()=>{G.state='edit'},{bg:CALM.r})}
function cropDown(p){if(p.y>500)return;cdown=true;if(cmode==='rect')sel={a:p,b:p};else lasso=[p]}
function cropMove(p){if(!cdown)return;if(cmode==='rect')sel.b=p;else lasso.push(p)}
// ---- menus ----
function drawTitle(){cbg();T('Coffeebreak',450,110,30,'#5a7080','center');T('Visuals Maker',450,180,60,CALM.ink,'center');T('Make your own visual cards, schedules and stories',450,225,22,'#5a7080','center','');['🗓️','➡️','😊','📖','⭐','🎨'].forEach((e,i)=>emo(e,190+i*104,310,56));seal(450,410,.7);cb('go',310,480,280,74,'Start making',()=>{G.state='menu'},{bg:CALM.g,fs:28});T('Music is off to start. Tap 🔇 Muted to turn it on.',450,585,14,'#5a7080','center','')}
function drawMenu(){cbg();T('What would you like to make?',450,55,32,CALM.ink,'center');
 TYPES.forEach((tp,i)=>{const X=45+(i%4)*210,Y=85+Math.floor(i/4)*190,lk=DEMO&&!DEMO_T.includes(tp[0]);x.fillStyle='#fff';rr(X,Y,190,170,22);x.fill();x.strokeStyle='#c9d6dd';x.lineWidth=3;x.stroke();x.globalAlpha=lk?.5:1;emo(tp[1],X+95,Y+70,64);x.globalAlpha=1;T((lk?'🔒 ':'')+tp[2],X+95,Y+145,19,CALM.ink,'center');BTN['m'+i]={x:X,y:Y,w:190,h:170,fn:()=>{if(lk)return lock();newBoard(tp[0])}}});
 const lx=45+3*210,ly=85+190;x.fillStyle='#fff';rr(lx,ly,190,170,22);x.fill();x.strokeStyle='#c9d6dd';x.stroke();emo('📚',lx+95,ly+70,64);T((DEMO?'🔒 ':'')+'My Library',lx+95,ly+145,19,CALM.ink,'center');BTN.lib={x:lx,y:ly,w:190,h:170,fn:()=>{if(DEMO)return lock();G.state='lib'}};
 cb('hm',380,500,140,60,'🏠',()=>{G.state='title'},{bg:CALM.r})}
let delId=null;
function drawLib(){cbg();T('My Library',450,50,32,CALM.ink,'center');if(!S.lib.length)T('Nothing saved yet. Make a board and tap 💾 Save.',450,280,22,'#5a7080','center','');
 S.lib.slice(0,12).forEach((b,i)=>{const X=40+(i%4)*210,Y=75+Math.floor(i/4)*140,tp=TYPES.find(q=>q[0]===b.type);x.fillStyle='#fff';rr(X,Y,195,125,18);x.fill();x.strokeStyle='#c9d6dd';x.lineWidth=3;x.stroke();emo(tp[1],X+40,Y+45,40);x.fillStyle=CALM.ink;x.font='bold 17px '+KF;wrapT(b.title,X+70,Y+38,118,20);T(tp[2],X+12,Y+110,14,'#5a7080','left','');
  BTN['l'+i]={x:X,y:Y,w:150,h:125,fn:()=>{B=JSON.parse(JSON.stringify(b));G.state='board';mode='tick'}};cb('d'+i,X+150,Y+80,40,40,delId===b.id?'❗':'🗑',()=>{if(delId===b.id){S.lib.splice(S.lib.indexOf(b),1);S.save();delId=null}else delId=b.id},{bg:CALM.r,fs:16})});
 cb('bk',380,520,140,60,'⬅ Back',()=>{G.state='menu'})}
bindInput({down(p){const s=G.state;if(s==='edit')eDown(p);else if(s==='crop')cropDown(p);else if(s==='board'){const sl=slots(B);const i=sl.findIndex(r=>inB(p,r));if(i>=0)drag={i,p,ox:p.x-sl[i].x,oy:p.y-sl[i].y,s:p,moved:false}}},
 move(p){const s=G.state;if(s==='edit')eMove(p);else if(s==='crop')cropMove(p);else if(drag){drag.p=p;if(Math.hypot(p.x-drag.s.x,p.y-drag.s.y)>12)drag.moved=true}},
 up(p){const s=G.state;if(s==='edit')eUp();else if(s==='crop')cdown=false;else if(drag&&s==='board'){if(drag.moved){const sl=slots(B);const j=sl.findIndex(r=>inB(drag.p,r));if(j>=0&&j!==drag.i){const tm=B.cards[j];B.cards[j]=B.cards[drag.i];B.cards[drag.i]=tm;kTone(500,.08,.04)}}
  else if(mode==='edit')openCard(drag.i);else{const cd=B.cards[drag.i];cd.done=!cd.done;if(cd.done){kTone(880,.12,.05);if(B.cards.every(q=>q.done)&&B.cards.length>1){confetti(40);yay()}}}drag=null}}});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='board')drawBoard();else if(s==='edit')drawEdit();else if(s==='crop')drawCrop();else if(s==='lib')drawLib();kOverlay(1/60)}
window.VM={G,S,newBoard,openCard,finishCard,useCut,get B(){return B},setPH:im=>{PH=im},renderPNG,saveLib};startLoop();
