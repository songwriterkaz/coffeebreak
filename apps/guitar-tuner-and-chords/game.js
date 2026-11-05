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
// ===== Coffeebreak Kids: Guitar Chord Maker =====
const S=kStore('kidsGuitar',{songs:[],learned:[]});const G={state:'title',score:S.stars,level:0};window.G=G;
const OPEN=[82.41,110,146.83,196,246.94,329.63],SN=['E','A','D','G','B','E'];
// frets low E -> high e (-1 = don't play, 0 = open), fingers 1 index 2 middle 3 ring 4 pinky
const CH={Em:[[0,2,2,0,0,0],[0,2,3,0,0,0]],Am:[[-1,0,2,2,1,0],[0,0,2,3,1,0]],C:[[-1,3,2,0,1,0],[0,3,2,0,1,0]],G:[[3,2,0,0,0,3],[2,1,0,0,0,3]],D:[[-1,-1,0,2,3,2],[0,0,0,1,3,2]],E:[[0,2,2,1,0,0],[0,2,3,1,0,0]],A:[[-1,0,2,2,2,0],[0,0,1,2,3,0]],Dm:[[-1,-1,0,2,3,1],[0,0,0,2,3,1]],G7:[[3,2,0,0,0,1],[3,2,0,0,0,1]],
 'Easy G':[[-1,-1,0,0,0,3],[0,0,0,0,0,3]],'Easy C':[[-1,-1,-1,0,1,0],[0,0,0,0,1,0]],'Em7 (1 finger)':[[0,2,0,0,0,0],[0,2,0,0,0,0]]};
const ALL=Object.keys(CH),AV=DEMO?['Em','Am','C']:ALL;
const FC=['','#ff4f4f','#3a8aff','#2ab060','#ff9a20'];
const STARTERS=[['Twinkle Twinkle Little Star',['G','G','C','G','C','G','D','G'],90],['Mary Had a Little Lamb',['G','G','D','G','G','G','D','G'],100],['Row Row Row Your Boat',['G','G','G','G','G','D','G','G'],100],['Old MacDonald Had a Farm',['G','C','G','D','G','C','G','D'],110],['London Bridge',['G','G','D','G','G','G','D','G'],100]];
// ---- plucked string (Karplus-Strong) ----
function AC(){window._AC=window._AC||new AudioContext();if(window._AC.state==='suspended')window._AC.resume();return window._AC}
const KS={};function ksBuf(f){const k=Math.round(f*10);if(KS[k])return KS[k];const A=AC(),sr=A.sampleRate,len=Math.floor(sr*1.8),b=A.createBuffer(1,len,sr),d=b.getChannelData(0),N=Math.max(2,Math.round(sr/f)),line=new Float32Array(N);for(let i=0;i<N;i++)line[i]=Math.random()*2-1;let p=0;for(let i=0;i<len;i++){const nx=(p+1)%N;const v=line[p];d[i]=v;line[p]=.996*.5*(v+line[nx]);p=nx}return KS[k]=b}
function pluck(f,when,vol){try{const A=AC(),s=A.createBufferSource();s.buffer=ksBuf(f);const g=A.createGain();g.gain.value=vol||.22;const lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;s.connect(lp);lp.connect(g);g.connect(A.destination);s.start(A.currentTime+(when||0))}catch(e){}}
function noteF(si,fr){return OPEN[si]*Math.pow(2,fr/12)}
function strum(name,up,soft){const fr=CH[name][0];const order=up?[5,4,3,2,1,0]:[0,1,2,3,4,5];let k=0;order.forEach(si=>{if(fr[si]<0)return;pluck(noteF(si,fr[si]),k*.022,soft?.14:.22);k++});lastStrum={n:name,t:0}}
let lastStrum=null;
// ---- drawing ----
function diagram(name,X,Y,sc,o){o=o||{};const fr=CH[name][0],fi=CH[name][1],w=150*sc,h=170*sc,gx=w/5,gy=h/5;x.save();x.translate(X,Y);
 x.fillStyle='#fff';rr(-20*sc,-50*sc,w+40*sc,h+80*sc,14*sc);x.fill();if(o.sel){x.strokeStyle='#ffd24a';x.lineWidth=5;x.stroke()}
 if(!o.noname)T(name,w/2,-24*sc,Math.max(14,24*sc),'#2a3a5a','center');x.fillStyle='#2a2a2a';x.fillRect(-2,0,w+4,6*sc);x.strokeStyle='#888';x.lineWidth=1.5;for(let i=1;i<=5;i++){x.beginPath();x.moveTo(0,i*gy);x.lineTo(w,i*gy);x.stroke()}
 for(let s=0;s<6;s++){x.strokeStyle='#555';x.lineWidth=(3-s*.35)*sc;x.beginPath();x.moveTo(s*gx,0);x.lineTo(s*gx,h);x.stroke();const f=fr[s];
  if(f<0)T('✕',s*gx,-6*sc,Math.max(10,14*sc),'#d02020','center');else if(f===0){x.strokeStyle='#2a3a5a';x.lineWidth=2;x.beginPath();x.arc(s*gx,-10*sc,6*sc,0,7);x.stroke()}
  else{const cy=(f-.5)*gy;x.fillStyle=FC[fi[s]]||'#333';x.beginPath();x.arc(s*gx,cy,11*sc,0,7);x.fill();T(''+fi[s],s*gx,cy+5*sc,Math.max(10,14*sc),'#fff','center')}}
 if(o.labels)SN.forEach((n,s)=>T(n,s*gx,h+20*sc,Math.max(10,14*sc),'#7a4a8a','center'));x.restore()}
function guitar(X,Y,sc,lab){x.save();x.translate(X,Y);x.scale(sc,sc);x.fillStyle='#c8803a';x.beginPath();x.ellipse(0,60,110,90,0,0,7);x.ellipse(0,-60,85,70,0,0,7);x.fill();x.fillStyle='#3a2010';x.beginPath();x.arc(0,-20,30,0,7);x.fill();x.fillStyle='#5a3010';x.fillRect(-30,95,60,14);
 x.fillStyle='#7a4a1a';x.fillRect(-14,-330,28,280);x.fillStyle='#ddd';for(let i=1;i<9;i++)x.fillRect(-14,-330+i*30,28,2);x.fillStyle='#f4f0e0';x.fillRect(-14,-332,28,5);x.fillStyle='#5a3010';rr(-22,-400,44,70,8);x.fill();x.fillStyle='#ccc';for(let i=0;i<3;i++){x.beginPath();x.arc(-28,-385+i*20,6,0,7);x.arc(28,-385+i*20,6,0,7);x.fill()}
 x.strokeStyle='#eee';x.lineWidth=1;for(let s=0;s<6;s++){x.beginPath();x.moveTo(-10+s*4,-330);x.lineTo(-10+s*4,102);x.stroke()}x.restore();
 if(lab){const L=[['Headstock',-370,'🎛️'],['Tuning pegs (turn to tune)',-390],['Nut',-330],['Frets (metal lines)',-260],['Neck',-180],['Sound hole',-20],['Body',80],['Bridge',102],['Strings (6!)',-120]];L.forEach((l,i)=>{const yy=Y+l[1]*sc,side=i%2?1:-1,tx=X+side*170;x.strokeStyle='#ff6fae';x.lineWidth=2;x.beginPath();x.moveTo(X+side*20*sc,yy);x.lineTo(tx-side*5,yy);x.stroke();T(l[0],tx+(side>0?5:-5),yy+6,17,'#2a3a5a',side>0?'left':'right')})}}
// ---- state ----
let cur='Em',quiz=null,song={name:'My Song',ch:['Em','Am','C','Em','Em','Am','C','Em'],bpm:90,pat:0},slot=0,playing=null,lesson=0,pat=null,msg='',msgT=0;
const PATS=[['Down strums',['D','','D','','D','','D','']],['Down, Down-Up, Up-Down-Up',['D','','D','U','','U','D','U']]];
function toast(m){msg=m;msgT=2.5}
function play(chs,bpm,pi){stop();let step=0;const sp=60/bpm/2;playing={i:0,chs,iv:setInterval(()=>{const bar=Math.floor(step/8),b=step%8;if(bar>=chs.length){stop();return}playing.i=bar;playing.b=b;const p=PATS[pi][1][b];if(p)strum(chs[bar],p==='U',p==='U');step++},sp*1000)}}
function stop(){if(playing){clearInterval(playing.iv);playing=null}}
function newQuiz(){const a=AV[Math.floor(Math.random()*AV.length)];let opts=[a];while(opts.length<3){const b=AV[Math.floor(Math.random()*AV.length)];if(!opts.includes(b))opts.push(b)}opts.sort(()=>Math.random()-.5);quiz={a,opts,score:quiz?quiz.score:0,n:quiz?quiz.n:0,fb:null}}
function drawTitle(){kbg('#ffe6c4','#ffd6e8');T('Coffeebreak Kids',450,80,34,'#ff4f9a','center');T('Guitar Chord Maker',454,149,56,'#ff5a9a','center');T('Guitar Chord Maker',450,145,56,'#fff','center');guitar(250,470,.6);seal(620,380,.9,'wave');emo('🎵',700,250+Math.sin(t*3)*10,40);kb('go',480,480,300,70,'🎸 Let\'s play!',()=>{G.state='menu';AC()},{fs:26})}
function drawMenu(){kbg('#ffe6c4','#ffd6e8');starBar(S);T('Guitar School',450,60,40,'#ff7a00','center');
 const M=[['🎸 Parts of the guitar','parts'],['🙌 How to hold it','hold'],['🎼 Tuning: E A D G B E','tune'],['✋ Learn the chords','chords'],['🥁 Strumming patterns','strum'],['🔁 Chord change game','quiz'],['🎶 Chord Song Maker','maker'],['🖨️ Print a chord chart','print']];
 M.forEach((m,i)=>kb('m'+i,60+(i%2)*400,100+Math.floor(i/2)*100,380,80,m[0],()=>{if(m[1]==='print'){printChart();return}if(m[1]==='quiz'){quiz=null;newQuiz()}G.state=m[1]},{bg:['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff','#ff6fae','#4ab0e8','#3ac060'][i],fs:22}));
 kb('stk',700,15,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
function back(){kb('bk',20,530,140,56,'⬅ Back',()=>{stop();G.state='menu'},{bg:'#a0a8c0'})}
function drawParts(){kbg('#fff6e0','#ffe6c4');T('Parts of the guitar',450,45,32,'#ff7a00','center');guitar(450,480,1,true);back()}
function drawHold(){kbg('#e6f6ff','#fff6e0');T('How to hold your guitar',450,55,32,'#3a7ad8','center');const tips=['🪑 Sit up straight on a chair with no arms.','🎸 Rest the guitar\'s body on your right leg (left leg if you\'re left-handed).','🤗 Hug the body gently with your strumming arm over the top.','✋ Your other hand holds the neck. Thumb goes behind the neck, fingers curl over the strings.','☝️ Press strings with your fingertips, just behind the metal fret.','🙂 Relax your shoulders! It\'s normal for fingertips to feel sore at first. Practise a little every day.'];
 x.fillStyle='#2a3a5a';x.font='bold 20px '+KF;let y=110;tips.forEach(s=>{y=wrapT(s,80,y,740,26)+10});back()}
function drawTune(){kbg('#e6ffe6','#fff6e0');T('Standard tuning: E A D G B E',450,55,32,'#2ab060','center');T('From the thickest string (top, closest to your nose) to the thinnest.',450,88,17,'#2a3a5a','center','');T('Remember: Eddie Ate Dynamite, Good Bye Eddie! 🧨',450,118,19,'#ff4f9a','center');
 SN.forEach((n,i)=>{const yy=170+i*58;x.strokeStyle='#999';x.lineWidth=7-i;x.beginPath();x.moveTo(250,yy);x.lineTo(800,yy);x.stroke();kb('s'+i,100,yy-24,130,48,(i+1===1?'6th ':'')+n+(i===0?' (low)':i===5?' (high)':''),()=>{pluck(OPEN[i],0,.3);toast(['Low E','A','D','G','B','High E'][i]+' string')},{bg:['#ff4f4f','#ff9a20','#ffd24a','#3ac060','#3a8aff','#b06aff'][i],fs:17})});
 T('Tap a string to hear what it should sound like. Use a tuner app to match!',450,520,16,'#7a4a8a','center','');back()}
function drawChords(){kbg('#fff3c4','#ffe0f0');T('Tap a chord to learn it, then STRUM!',450,40,26,'#ff7a00','center');
 AV.forEach((n,i)=>kb('c'+i,20+(i%6)*145,60+Math.floor(i/6)*56,135,48,n,()=>{cur=n;strum(n);if(!S.learned.includes(n)){S.learned.push(n);reward(S,1,'Learned '+n+'!')}},{sel:cur===n,bg:'#4ab0e8',fs:n.length>6?13:20}));
 const y0=AV.length>6?190:140;diagram(cur,90,y0+70,1.5,{labels:true});
 x.fillStyle='#fff';rr(420,y0,450,260,18);x.fill();T('Finger colours',440,y0+34,20,'#2a3a5a');[['1','Pointer (index)'],['2','Middle'],['3','Ring'],['4','Pinky']].forEach((f,i)=>{x.fillStyle=FC[i+1];x.beginPath();x.arc(455,y0+64+i*34,13,0,7);x.fill();T(f[0],455,y0+70+i*34,15,'#fff','center');T(f[1],480,y0+70+i*34,17,'#2a3a5a')});
 x.fillStyle='#2a3a5a';x.font='15px '+KF;wrapT('⭕ = play the open string   ✕ = don\'t play that string',440,y0+215,410,20);
 kb('d',440,y0+280,200,56,'⬇ Strum down',()=>strum(cur),{bg:'#ff6fae'});kb('u',660,y0+280,200,56,'⬆ Strum up',()=>strum(cur,true,true),{bg:'#b06aff'});back()}
function drawStrum(){kbg('#f0e6ff','#ffe0f0');T('Strumming patterns',450,50,34,'#b06aff','center');const P=pat===null?1:pat;
 PATS.forEach((p,i)=>kb('p'+i,120+i*340,80,320,54,p[0],()=>{pat=i},{sel:P===i,bg:'#4ab0e8',fs:16}));
 const b=playing?playing.b:-1;PATS[P][1].forEach((s,i)=>{const X=130+i*85;x.fillStyle=b===i?'#ffd24a':'#fff';rr(X-35,170,70,110,16);x.fill();T(['1','&','2','&','3','&','4','&'][i],X,200,22,'#7a4a8a','center');T(s==='D'?'⬇':s==='U'?'⬆':'·',X,262,46,s==='D'?'#ff4f4f':'#3a8aff','center')});
 x.fillStyle='#2a3a5a';x.font='bold 18px '+KF;wrapT('Count "1 and 2 and 3 and 4 and". Your hand keeps moving down and up like a pendulum. Only hit the strings on the arrows!',100,330,700,24);
 kb('pl',300,430,300,64,playing?'⏹ Stop':'▶ Play with '+cur,()=>{if(playing)stop();else play([cur,cur,cur,cur],80,P)},{bg:'#3ac060',fs:22});back()}
function drawQuiz(){kbg('#e6fff0','#fff3c4');T('Chord change game',450,45,32,'#2ab060','center');T('⭐ '+quiz.score+' / '+quiz.n,800,45,22,'#ff7a00','center');T('Find the '+quiz.a+' chord!',450,95,34,'#ff4f9a','center');
 quiz.opts.forEach((n,i)=>{const X=95+i*260;x.save();diagram(n,X,200,1.1,{sel:quiz.fb&&n===quiz.a,noname:!quiz.fb});x.restore();x.save();x.globalAlpha=0;BTN['q'+i]={x:X-25,y:140,w:220,h:290,fn:()=>{if(quiz.fb)return;quiz.n++;if(n===quiz.a){quiz.score++;quiz.fb='yes';strum(n);if(quiz.score%5===0)reward(S,1,'Chord champ!');else yay()}else{quiz.fb='no';oops()}setTimeout(newQuiz,1200)}};x.restore();});
 if(quiz.fb)T(quiz.fb==='yes'?'Yes! 🎉':'Oops! Look at the dots and try again!',450,480,24,quiz.fb==='yes'?'#2ab060':'#ff4f4f','center');
 x.globalAlpha=1;T('Remember the dot shapes from the Learn the chords page!',450,520,15,'#7a4a8a','center','');back()}
function drawMaker(){kbg('#ffe0f0','#e6f6ff');T('Chord Song Maker',450,40,32,'#ff4f9a','center');T(song.name,450,70,18,'#7a4a8a','center','');
 song.ch.forEach((c,i)=>{const X=40+i*104,on=playing&&playing.i===i;kb('sl'+i,X,90,96,70,c,()=>{slot=i},{sel:slot===i,bg:on?'#ffd24a':'#ff6fae',fs:c.length>4?13:22})});
 T('Tap a box, then pick a chord:',40,195,17,'#2a3a5a');AV.forEach((n,i)=>kb('pc'+i,40+(i%6)*140,205+Math.floor(i/6)*52,130,44,n,()=>{song.ch[slot]=n;strum(n);slot=(slot+1)%8},{bg:'#4ab0e8',fs:n.length>6?13:18}));
 const y=AV.length>6?320:270;T('Speed: '+song.bpm+' bpm',40,y+30,18,'#2a3a5a');kb('bm',230,y,50,44,'−',()=>{song.bpm=Math.max(50,song.bpm-10)},{bg:'#b06aff'});kb('bp',290,y,50,44,'+',()=>{song.bpm=Math.min(160,song.bpm+10)},{bg:'#b06aff'});
 kb('pt',370,y,330,44,'Strum: '+PATS[song.pat][0],()=>{song.pat=1-song.pat},{bg:'#b06aff',fs:15});
 if(!DEMO){T('Starter songs:',40,y+80,17,'#2a3a5a');STARTERS.forEach((s,i)=>kb('st'+i,40+(i%3)*280,y+90+Math.floor(i/3)*48,270,42,s[0],()=>{song={name:s[0],ch:s[1].slice(),bpm:s[2],pat:1};stop()},{bg:'#3ac060',fs:13}))}
 kb('pl',180,520,200,60,playing?'⏹ Stop':'▶ Play',()=>{if(playing)stop();else play(song.ch,song.bpm,song.pat)},{bg:'#3ac060',fs:22});
 kb('sv',400,520,200,60,DEMO?'🔒 Save':'💾 Save',()=>{if(DEMO){window.demoEnd&&window.demoEnd(dEnd);return}const nm=prompt('Name your song:',song.name)||song.name;song.name=nm;S.songs=S.songs.filter(q=>q.name!==nm);S.songs.push(JSON.parse(JSON.stringify(song)));if(S.songs.length>12)S.songs.shift();reward(S,2,'Song saved!')},{bg:'#ff8a3d',fs:22});
 kb('my',620,520,240,60,'📂 My songs ('+S.songs.length+')',()=>{if(DEMO){window.demoEnd&&window.demoEnd(dEnd);return}G.state='songs'},{bg:'#4ab0e8',fs:18});back()}
function drawSongs(){kbg('#fff3c4','#ffe0f0');T('My songs',450,60,36,'#ff7a00','center');if(!S.songs.length)T('No songs saved yet!',450,200,22,'#7a4a8a','center','');
 S.songs.forEach((s,i)=>{kb('o'+i,120,90+i*36,540,32,s.name+' · '+s.ch.join(' '),()=>{song=JSON.parse(JSON.stringify(s));G.state='maker'},{bg:'#4ab0e8',fs:13});kb('x'+i,670,90+i*36,60,32,'🗑',()=>{S.songs.splice(i,1);S.save()},{bg:'#a0a8c0',fs:14})});kb('bk2',20,530,140,56,'⬅ Back',()=>{G.state='maker'},{bg:'#a0a8c0'})}
const dEnd='Rock on! The full game has all 12 chords (Em, Am, C, G, D, E, A, Dm, G7 plus easy versions), starter songs, and saving your own songs.';
// ---- printable chart (SVG) ----
function svgChord(n){const fr=CH[n][0],fi=CH[n][1],gx=24,gy=26;let s='<svg width="170" height="200" viewBox="-30 -50 180 210" xmlns="http://www.w3.org/2000/svg"><text x="60" y="-30" font-size="22" font-weight="bold" text-anchor="middle" font-family="Arial">'+n+'</text><rect x="-2" y="0" width="124" height="6" fill="#222"/>';
 for(let i=1;i<=5;i++)s+='<line x1="0" y1="'+i*gy+'" x2="120" y2="'+i*gy+'" stroke="#888"/>';for(let k=0;k<6;k++){s+='<line x1="'+k*gx+'" y1="0" x2="'+k*gx+'" y2="'+5*gy+'" stroke="#444" stroke-width="'+(2.5-k*.3)+'"/>';const f=fr[k];
  if(f<0)s+='<text x="'+k*gx+'" y="-6" font-size="14" text-anchor="middle" fill="#c00">✕</text>';else if(f===0)s+='<circle cx="'+k*gx+'" cy="-10" r="6" fill="none" stroke="#000" stroke-width="2"/>';else s+='<circle cx="'+k*gx+'" cy="'+(f-.5)*gy+'" r="10" fill="'+FC[fi[k]]+'"/><text x="'+k*gx+'" y="'+((f-.5)*gy+5)+'" font-size="13" text-anchor="middle" fill="#fff" font-family="Arial">'+fi[k]+'</text>';s+='<text x="'+k*gx+'" y="150" font-size="12" text-anchor="middle" font-family="Arial">'+SN[k]+'</text>'}return s+'</svg>'}
const chart=document.createElement('div');chart.id='gChart';document.body.appendChild(chart);const pcs=document.createElement('style');pcs.textContent='#gChart{display:none}@media print{body *{visibility:hidden!important}#gChart,#gChart *{visibility:visible!important}#gChart{display:block!important;position:absolute;left:0;top:0;width:100%;background:#fff;font:13px Arial}#gChart .g{display:inline-block;margin:4px}}';document.head.appendChild(pcs);
function chartHTML(){return '<h2 style="font-family:Arial">🎸 Coffeebreak Kids: Guitar Chord Chart</h2><p>Standard tuning E A D G B E (thick to thin). ⭕ open string · ✕ don\'t play · Finger numbers: 1 pointer (red), 2 middle (blue), 3 ring (green), 4 pinky (orange).</p>'+AV.map(n=>'<div class="g">'+svgChord(n)+'</div>').join('')}
function printChart(){chart.innerHTML=chartHTML();try{window.print()}catch(e){}}
bindInput({});
function update(dt){if(msgT>0)msgT-=dt}
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,menu:drawMenu,parts:drawParts,hold:drawHold,tune:drawTune,chords:drawChords,strum:drawStrum,quiz:drawQuiz,maker:drawMaker,songs:drawSongs,stk:()=>stickerBook(S,()=>{G.state='menu'})})[s]();
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(300,10,300,44,20);x.fill();T(msg,450,40,20,'#2ab060','center');x.globalAlpha=1}kOverlay(1/60)}
window.KG={G,S,CH,strum,play,stop,chartHTML,get song(){return song},newQuiz,get quiz(){return quiz}};startLoop();
