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
// ===== Coffeebreak Kids: Spelling Bee =====
const S=kStore('kidsSpell',{lvl:0,best:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
const LV=[['Easy 3-letter',[['cat','🐱'],['dog','🐶'],['sun','☀️'],['hat','🎩'],['bus','🚌'],['pig','🐷'],['cup','☕'],['bed','🛏️'],['egg','🥚'],['fox','🦊'],['ant','🐜'],['owl','🦉'],['bee','🐝'],['cow','🐮'],['jam','🍓'],['mum','👩'],['van','🚐'],['bat','🦇']]],
['4-letter words',[['fish','🐟'],['frog','🐸'],['duck','🦆'],['star','⭐'],['moon','🌙'],['cake','🍰'],['ball','⚽'],['tree','🌳'],['boat','⛵'],['seal','🦭'],['bear','🐻'],['milk','🥛'],['shoe','👟'],['ring','💍'],['kite','🪁'],['lion','🦁'],['corn','🌽'],['snow','❄️']]],
['5-letter words',[['apple','🍎'],['horse','🐴'],['house','🏠'],['train','🚆'],['heart','❤️'],['whale','🐳'],['zebra','🦓'],['snake','🐍'],['pizza','🍕'],['clock','⏰'],['shark','🦈'],['robot','🤖'],['bread','🍞'],['mouse','🐭'],['plane','✈️'],['tiger','🐯'],['koala','🐨'],['beach','🏖️']]],
['Tricky words',[['rainbow','🌈'],['penguin','🐧'],['dolphin','🐬'],['rocket','🚀'],['octopus','🐙'],['flower','🌸'],['colour','🎨'],['kangaroo','🦘'],['butterfly','🦋'],['cupcake','🧁'],['unicorn','🦄'],['football','🏉'],['dinosaur','🦖'],['umbrella','☂️'],['jellyfish','🪼'],['crocodile','🐊'],['strawberry','🍓'],['caterpillar','🐛']]]];
let L=0,word=null,tiles=[],slots=[],drag=null,round=0,score=0,hint=0,qs=[];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function startLv(l){L=l;qs=shuffle(LV[l][1].slice()).slice(0,DEMO?3:8);round=0;score=0;next()}
function next(){if(round>=qs.length){G.state='done';S.best[L]=Math.max(S.best[L]||0,score);S.save();if(score>=qs.length*.6)reward(S,3,'Level complete!');if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Great spelling! The full game has 4 levels and 72 words, from cat to caterpillar, plus the whole sticker book.'),2600);return}
 word=qs[round];const w=word[0];const n=w.length;const extra=L<2?2:3;const AB='abcdefghijklmnopqrstuvwxyz';const letters=w.split('');for(let i=0;i<extra;i++)letters.push(AB[Math.random()*26|0]);shuffle(letters);
 const tw=Math.min(76,780/letters.length);tiles=letters.map((ch,i)=>({ch,x:450-letters.length*tw/2+i*tw+tw/2,y:470,hx:450-letters.length*tw/2+i*tw+tw/2,hy:470,slot:-1}));
 const sw=Math.min(80,800/n);slots=w.split('').map((ch,i)=>({ch,x:450-n*sw/2+i*sw+sw/2,y:330,w:sw-8,t:null}));hint=0;G.state='play';speak('Spell '+w);}
function place(ti,si){const tl=tiles[ti];if(slots[si].t!==null)return false;slots[si].t=ti;tl.slot=si;tl.x=slots[si].x;tl.y=slots[si].y;kTone(600+si*60,.06,.05);if(slots.every(s=>s.t!==null))checkW();return true}
function checkW(){const ok=slots.every(s=>tiles[s.t].ch===s.ch);if(ok){score++;round++;reward(S,1,['Spot on!','Brilliant!','You spelled it!','Super speller!'][Math.random()*4|0]);speak(word[0]+'! Well done!');G.level++;setTimeout(next,1800);word.done=1}else{oops();speak('Not quite, try again');setTimeout(()=>{slots.forEach(s=>{if(s.t!==null&&tiles[s.t].ch!==s.ch){const tl=tiles[s.t];tl.slot=-1;tl.x=tl.hx;tl.y=tl.hy;s.t=null}})},700)}}
function tile(tl,hi){x.fillStyle='rgba(0,0,0,.15)';rr(tl.x-32,tl.y-32+4,64,64,14);x.fill();x.fillStyle=hi?'#ffd24a':'#fff';rr(tl.x-32,tl.y-32,64,64,14);x.fill();x.strokeStyle='#ffb020';x.lineWidth=3;x.stroke();T(tl.ch,tl.x,tl.y+14,40,'#2a3a5a','center')}
function drawPlay(){kbg('#fff3c4','#d6f0ff');starBar(S);T(LV[L][0]+' · '+(round+1)+' / '+qs.length,450,40,22,'#ff4f9a','center');x.fillStyle='#fff';x.beginPath();x.arc(450,170,95,0,7);x.fill();emo(word[1],450,175,110);
 kb('say',600,100,140,50,'🔊 Hear it',()=>speak(word[0]),{bg:'#4ab0e8',fs:20});kb('hint',600,160,140,50,'💡 Hint',()=>{const si=slots.findIndex(s=>s.t===null||tiles[s.t].ch!==s.ch);if(si<0)return;if(slots[si].t!==null){const tl=tiles[slots[si].t];tl.slot=-1;tl.x=tl.hx;tl.y=tl.hy;slots[si].t=null}const ti=tiles.findIndex(tl=>tl.slot<0&&tl.ch===slots[si].ch);if(ti>=0)place(ti,si)},{bg:'#b06aff',fs:20});
 slots.forEach(s=>{x.fillStyle='rgba(255,255,255,.6)';rr(s.x-s.w/2,s.y-34,s.w,68,12);x.fill();x.strokeStyle='#ff6fae';x.lineWidth=3;x.setLineDash([6,5]);x.stroke();x.setLineDash([])});
 tiles.forEach((tl,i)=>{if(drag&&drag.i===i)return;tile(tl)});if(drag)tile(tiles[drag.i],true);seal(120,250,.7,POP?'wave':'');
 kb('back',30,520,150,50,'⬅ Levels',()=>{G.state='menu'},{bg:'#4ab0e8',fs:20});T('Drag the letters into the boxes',450,560,18,'#2a3a5a','center','')}
function drawMenu(){kbg('#ffe6f2','#d6f0ff');starBar(S);T('Choose a level',450,60,36,'#ff4f9a','center');LV.forEach((l,i)=>{const lk=DEMO&&i>0;kb('lv'+i,200,100+i*90,500,74,(lk?'🔒 ':'')+l[0]+'  '+l[1].slice(0,3).map(w=>w[1]).join(''),()=>{if(lk){window.demoEnd&&window.demoEnd('All 4 levels are in the full game!');return}startLv(i)},{bg:['#3ac060','#4ab0e8','#ff8a3d','#b06aff'][i],fs:26});if(S.best[i])T('⭐ '+S.best[i],740,145+i*90,22,'#ff7a00','left')});
 kb('stk',250,480,200,60,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});kb('home',470,480,180,60,'🏠 Home',()=>{G.state='title'},{bg:'#ff6fae'})}
function drawDone(){kbg('#fff3c4','#ffd6ec');seal(450,250,1.4,'wave');T('You spelled '+score+' / '+qs.length+'!',450,120,44,'#ff4f9a','center');kb('again',220,420,220,64,'🔁 Again',()=>startLv(L),{bg:'#3ac060'});kb('lv',460,420,220,64,'📚 Levels',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#ffe58a','#fff6d6');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('Spelling Bee',450,170,66,'#fff','center');emo('🐝',250,300,90);seal(560,320,1,'wave');kb('go',330,450,240,70,'🐝 Let\'s spell!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
bindInput({down(p){if(G.state!=='play')return;for(let i=tiles.length-1;i>=0;i--){const tl=tiles[i];if(Math.abs(p.x-tl.x)<32&&Math.abs(p.y-tl.y)<32){if(tl.slot>=0){slots[tl.slot].t=null;tl.slot=-1}drag={i,ox:p.x-tl.x,oy:p.y-tl.y,sx:p.x,sy:p.y};return}}},
 move(p){if(drag){const tl=tiles[drag.i];tl.x=p.x-drag.ox;tl.y=p.y-drag.oy}},up(p){if(!drag)return;const tl=tiles[drag.i],i=drag.i;drag=null;let best=-1,bd=60;slots.forEach((s,si)=>{const d=Math.hypot(s.x-tl.x,s.y-tl.y);if(d<bd&&s.t===null){bd=d;best=si}});
  if(best<0&&p&&Math.hypot(p.x-tl.hx,p.y-tl.hy)<10){best=slots.findIndex(s=>s.t===null)}if(best>=0)place(i,best);else{tl.x=tl.hx;tl.y=tl.hy}}});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawPlay();else if(s==='done')drawDone();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KS={G,S,startLv,place,get tiles(){return tiles},get slots(){return slots}};startLoop();
