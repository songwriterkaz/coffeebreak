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
// ===== Coffeebreak Kids: Treasure Hunt =====
const S=kStore('kidsTreasure',{found:0});const G={state:'title',score:S.stars,level:0};window.G=G;
const CW=8,CH=6,CS=78,OX=138,OY=80;
const LM=[['🌴','palm tree'],['⛰️','mountain'],['🏠','hut'],['🗿','big stone head'],['🌋','volcano'],['⛵','boat'],['🦜','parrot'],['🌳','big tree'],['🏝️','tiny island'],['🐊','crocodile']];
const DIRS=[['north',0,-1],['south',0,1],['east',1,0],['west',-1,0]];
let map=null,tr=null,dug=[],clue='',mode='find',tries=0,hint='',won=0,hider=null;
const rnd=n=>Math.floor(Math.random()*n);
function newMap(){map=[];const used=new Set();while(map.length<6){const c=rnd(CW),r=rnd(CH),k=c+','+r;if(used.has(k))continue;used.add(k);map.push({c,r,l:LM[(map.length*3+rnd(10))%10]})}
 const ls=new Set();map.forEach(m=>{while(ls.has(m.l[1]))m.l=LM[rnd(10)];ls.add(m.l[1])})}
function makeClue(){for(let k=0;k<200;k++){const m=map[rnd(map.length)],d=DIRS[rnd(4)],n=1+rnd(G.level>2?3:2),c=m.c+d[1]*n,r=m.r+d[2]*n;if(c<0||r<0||c>=CW||r>=CH||map.some(q=>q.c===c&&q.r===r))continue;tr={c,r};clue='Start at the '+m.l[1]+' '+m.l[0]+'. Walk '+n+' step'+(n>1?'s':'')+' '+d[0]+'.';return}}
function startFind(){mode='find';newMap();makeClue();dug=[];tries=0;hint='';won=0;G.state='play';speak(clue)}
function startHide(){mode='hide';newMap();tr=null;dug=[];tries=0;hint='';won=0;G.state='play';clue='Hider: tap a square to bury the treasure. Then pass to the seeker!';speak(clue)}
function dist(c,r){return Math.abs(c-tr.c)+Math.abs(r-tr.r)}
function tapCell(c,r){if(won)return;if(mode==='hide'&&!tr){tr={c,r};clue='Treasure buried! Seeker: dig to find it. I\'ll say hot or cold.';speak(clue);return}
 if(dug.some(d=>d.c===c&&d.r===r))return;dug.push({c,r});tries++;
 if(c===tr.c&&r===tr.r){won=1;S.found++;const st=tries<=1?3:tries<=3?2:1;reward(S,st,tries<=1?'First dig! Amazing!':'You found the treasure!');speak('You found the treasure!');G.level++;
  if(DEMO&&S.found>=2)setTimeout(()=>window.demoEnd&&window.demoEnd('Ahoy, treasure hunter! The full app has endless maps, harder clues, Hide mode for friends, and the full sticker book.'),2600);return}
 const d=dist(c,r);hint=d<=1?'🔥 Very hot!':d<=2?'♨️ Warm':d<=4?'🌤️ Cool':'🧊 Cold!';kTone(d<=1?700:d<=2?500:300,.15);speak(hint.replace(/[^\w !]/g,'').trim())}
function drawMap(){x.fillStyle='#3ab0e0';x.fillRect(0,0,900,600);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;for(let i=0;i<14;i++){x.beginPath();x.arc((i*90+t*15)%960,40+(i*73)%560,20,0,Math.PI);x.stroke()}
 x.fillStyle='#f4dfa0';rr(OX-20,OY-20,CW*CS+40,CH*CS+40,50);x.fill();x.fillStyle='#bfe08a';rr(OX,OY,CW*CS,CH*CS,30);x.fill();
 for(let c=0;c<CW;c++)for(let r=0;r<CH;r++){const X=OX+c*CS,Y=OY+r*CS;x.strokeStyle='rgba(90,60,20,.25)';x.setLineDash([4,4]);x.strokeRect(X,Y,CS,CS);x.setLineDash([]);BTN['g'+c+r]={x:X,y:Y,w:CS,h:CS,fn:()=>tapCell(c,r)};
  const d=dug.find(q=>q.c===c&&q.r===r);if(d){x.fillStyle='#8a5a30';x.beginPath();x.ellipse(X+CS/2,Y+CS/2,24,14,0,0,7);x.fill();if(!(won&&c===tr.c&&r===tr.r))emo('❌',X+CS/2,Y+CS/2,18)}}
 map.forEach(m=>emo(m.l[0],OX+m.c*CS+CS/2,OY+m.r*CS+CS/2,46));
 if(won){emo('💰',OX+tr.c*CS+CS/2,OY+tr.r*CS+CS/2-Math.abs(Math.sin(t*5))*10,54)}else if(mode==='hide'&&tr&&!dug.length&&false){}
 x.fillStyle='#fff';x.font='bold 16px '+KF;x.textAlign='center';x.fillText('N ⬆',OX+CW*CS+50,OY+20);x.fillText('⬅ W   E ➡',OX+CW*CS+50,OY+50);x.fillText('S ⬇',OX+CW*CS+50,OY+80);x.textAlign='left'}
function drawPlay(){drawMap();starBar(S);x.fillStyle='rgba(255,250,235,.96)';rr(225,8,540,62,18);x.fill();x.strokeStyle='#c8902a';x.lineWidth=3;x.stroke();x.font='bold 18px '+KF;x.fillStyle='#5a3a1a';x.textAlign='center';wrapT('🗺️ '+clue,500,32,530,22);x.textAlign='left';
 if(hint&&!won)T(hint,140,560,26,'#fff','center');T('Digs: '+tries,780,560,20,'#fff','center');
 kb('hear',20,90,100,60,'🔊',()=>speak(clue),{bg:'#4ab0e8',fs:28});kb('home',20,170,100,60,'🏠',()=>{G.state='title'},{bg:'#ff6fae',fs:28});seal(70,330,.5,won?'wave':'');
 if(won){kb('again',300,540,300,56,'🏴‍☠️ New hunt!',mode==='find'?startFind:startHide,{bg:'#3ac060',fs:24})}}
function drawTitle(){x.fillStyle='#3ab0e0';x.fillRect(0,0,900,600);x.fillStyle='#f4dfa0';x.beginPath();x.ellipse(450,470,380,110,0,0,7);x.fill();T('Coffeebreak Kids',450,90,32,'#fff','center');x.font='bold 70px '+(window.FONT||'Georgia');x.textAlign='center';x.lineWidth=6;x.strokeStyle='#7a4a1a';x.strokeText('Treasure Hunt',450,170);x.fillStyle='#ffd24a';x.fillText('Treasure Hunt',450,170);x.textAlign='left';
 ['🌴','🗺️','💰','🦜','⛵'].forEach((e,i)=>emo(e,220+i*115,260+Math.sin(t*2+i)*10,56));seal(450,390,.7,'wave');
 kb('f',110,470,260,74,'🔍 Find treasure',startFind,{bg:'#ff6fae',fs:24});kb('h',390,470,240,74,'🙈 Hide & seek',()=>{if(DEMO)return window.demoEnd&&window.demoEnd('Hide mode for playing with friends is in the full app!');startHide()},{bg:'#b06aff',fs:24});kb('s',650,470,130,74,'🏷️',()=>{G.state='stk'},{bg:'#ffb020',fs:32})}
bindInput({});function update(dt){}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')drawTitle();else if(G.state==='play')drawPlay();else stickerBook(S,()=>{G.state='title'});kOverlay(1/60)}
window.KT={G,S,startFind,startHide,tapCell,get tr(){return tr}};startLoop();
