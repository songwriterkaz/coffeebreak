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
// ===== Coffeebreak Kids: Learn to Write (with Sunny the Seal) =====
const S=kStore('kidsWrite',{done:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
function A(cx,cy,rx,ry,a0,a1){const p=[],n=24;for(let i=0;i<=n;i++){const a=(a0+(a1-a0)*i/n)*Math.PI/180;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry])}return p}
const ST={A:[[[50,0],[10,100]],[[50,0],[90,100]],[[25,62],[75,62]]],B:[[[15,0],[15,100]],[[15,0],[60,0],[78,12],[78,38],[60,50],[15,50]],[[15,50],[65,50],[85,63],[85,88],[65,100],[15,100]]],C:[A(52,50,40,48,-45,-315)],D:[[[15,0],[15,100]],[[15,0],...A(15,50,70,50,-90,90)]],
E:[[[15,0],[15,100]],[[15,0],[85,0]],[[15,50],[70,50]],[[15,100],[85,100]]],F:[[[15,0],[15,100]],[[15,0],[85,0]],[[15,50],[70,50]]],G:[[...A(52,50,40,48,-45,-320),[92,55],[60,55]]],H:[[[15,0],[15,100]],[[85,0],[85,100]],[[15,50],[85,50]]],I:[[[50,0],[50,100]],[[25,0],[75,0]],[[25,100],[75,100]]],
J:[[[70,0],[70,72],...A(45,72,25,28,0,180)]],K:[[[15,0],[15,100]],[[85,0],[15,60]],[[38,42],[85,100]]],L:[[[15,0],[15,100],[85,100]]],M:[[[10,100],[10,0],[50,60],[90,0],[90,100]]],N:[[[15,100],[15,0],[85,100],[85,0]]],O:[A(50,50,40,50,-90,-450)],
P:[[[15,0],[15,100]],[[15,0],[60,0],[82,14],[82,38],[60,52],[15,52]]],Q:[A(50,50,40,50,-90,-450),[[60,72],[92,104]]],R:[[[15,0],[15,100]],[[15,0],[60,0],[82,14],[82,38],[60,52],[15,52]],[[45,52],[85,100]]],
S:[[[82,15],[65,2],[35,2],[18,15],[18,35],[40,47],[62,54],[82,67],[82,88],[62,100],[35,100],[15,88]]],T:[[[10,0],[90,0]],[[50,0],[50,100]]],U:[[[15,0],[15,62],...A(50,62,35,38,180,0),[85,0]]],V:[[[10,0],[50,100],[90,0]]],W:[[[5,0],[27,100],[50,30],[73,100],[95,0]]],
X:[[[15,0],[85,100]],[[85,0],[15,100]]],Y:[[[15,0],[50,50]],[[85,0],[50,50],[50,100]]],Z:[[[15,0],[85,0],[15,100],[85,100]]],
'0':[A(50,50,35,50,-90,-450)],'1':[[[30,20],[55,0],[55,100]]],'2':[[...A(50,28,32,28,-160,0),[15,100],[85,100]]],'3':[A(48,26,32,25,-150,90),A(48,74,35,26,-90,150)],'4':[[[60,0],[10,70],[90,70]],[[65,40],[65,100]]],
'5':[[[80,0],[22,0],[18,45],...A(48,68,35,32,-120,150)]],'6':[[[78,8],[55,0],[30,10],[17,40],...A(50,70,34,30,180,540)]],'7':[[[10,0],[90,0],[40,100]]],'8':[A(50,26,28,25,-90,-450),A(50,75,34,25,-90,270)],'9':[[...A(50,30,32,30,0,-360),[80,100]]]};
const SETS={'A–Z':'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),'a–z':'abcdefghijklmnopqrstuvwxyz'.split(''),'0–9':'0123456789'.split('')};
const WORDS={A:'apple',B:'ball',C:'cat',D:'dog',E:'egg',F:'fish',G:'goat',H:'hat',I:'igloo',J:'jelly',K:'kangaroo',L:'lion',M:'moon',N:'nest',O:'octopus',P:'penguin',Q:'queen',R:'rainbow',S:'seal',T:'tiger',U:'umbrella',V:'van',W:'whale',X:'xylophone',Y:'yo-yo',Z:'zebra'};
const EM={A:'🍎',B:'⚽',C:'🐱',D:'🐶',E:'🥚',F:'🐟',G:'🐐',H:'🎩',I:'🧊',J:'🍮',K:'🦘',L:'🦁',M:'🌙',N:'🪺',O:'🐙',P:'🐧',Q:'👸',R:'🌈',S:'🦭',T:'🐯',U:'☂️',V:'🚐',W:'🐳',X:'🎼',Y:'🪀',Z:'🦓'};
let set='A–Z',ch='A',ink=[],cur=null,demoAnim=null,msg='Trace the letter! Start at the green dot.',BX=300,BY=130,BS=300;
const mask=document.createElement('canvas');mask.width=900;mask.height=600;const mx=mask.getContext('2d');const inkC=document.createElement('canvas');inkC.width=900;inkC.height=600;const ix=inkC.getContext('2d');
const P=(p)=>[BX+p[0]/100*BS*.75+BS*.125,BY+p[1]/100*BS];
function strokes(){return ST[ch]||null}
function buildMask(){mx.clearRect(0,0,900,600);mx.strokeStyle='#000';mx.fillStyle='#000';mx.lineCap='round';mx.lineJoin='round';mx.lineWidth=34;const s=strokes();if(s){s.forEach(st=>{mx.beginPath();st.forEach((p,i)=>{const q=P(p);i?mx.lineTo(q[0],q[1]):mx.moveTo(q[0],q[1])});mx.stroke()})}else{mx.font='bold 300px '+KF;mx.textAlign='center';mx.textBaseline='alphabetic';mx.fillText(ch,BX+BS/2,BY+BS-30)}}
function pick(c2){ch=c2;ink=[];ix.clearRect(0,0,900,600);buildMask();demoAnim=null;const w=WORDS[c2.toUpperCase()];msg=/[0-9]/.test(c2)?'Trace the number '+c2+'!':'Trace '+c2+'… '+c2+' is for '+(w||'')+'!';speak(/[0-9]/.test(c2)?c2:c2+'. '+c2+' is for '+(w||''));G.state='trace'}
function check(){const md=mx.getImageData(0,0,900,600).data,id=ix.getImageData(0,0,900,600).data;let need=0,got=0,stray=0,inkN=0;for(let y=BY-20;y<BY+BS+20;y+=5)for(let X=BX-20;X<BX+BS+20;X+=5){const i=(y*900+X)*4+3;const m=md[i]>0,k=id[i]>0;if(m){need++;if(k)got++}if(k){inkN++;if(!m)stray++}}
 const cov=need?got/need:0,sf=inkN?stray/inkN:1;if(cov>.72&&sf<.45){S.done[ch]=1;reward(S,1,['Super!','Awesome!','Brilliant!','You did it!','Wow!'][Math.random()*5|0]);msg='Yay! Sunny is so proud of you! Try the next one.';speak('Great job!');G.level=Object.keys(S.done).length;
  if(DEMO&&Object.keys(S.done).length>=3)setTimeout(()=>window.demoEnd&&window.demoEnd('Great writing! The full app has all 26 capital letters, 26 lowercase letters, numbers 0–9, free-write paper and the whole sticker book.'),2400)}else{msg=cov<.72?'Almost! Try to cover the whole dotted line.':'Oops, try to stay on the dotted lines!';oops();speak('Almost! Try again')}}
function drawGuide(){x.fillStyle='#fff';rr(BX-30,BY-30,BS+60,BS+60,24);x.fill();x.strokeStyle='#b8d8f0';x.lineWidth=2;[0,.5,1].forEach(k=>{x.setLineDash(k===.5?[10,8]:[]);x.beginPath();x.moveTo(BX-20,BY+k*BS);x.lineTo(BX+BS+20,BY+k*BS);x.stroke()});x.setLineDash([]);
 const s=strokes();if(s){x.lineCap='round';x.lineJoin='round';s.forEach(st=>{x.strokeStyle='#e8eef6';x.lineWidth=30;x.beginPath();st.forEach((p,i)=>{const q=P(p);i?x.lineTo(...q):x.moveTo(...q)});x.stroke();x.strokeStyle='#8aa4c0';x.lineWidth=4;x.setLineDash([3,10]);x.stroke();x.setLineDash([])});
  s.forEach((st,n)=>{const a=P(st[0]),b=P(st[Math.min(st.length-1,st.length>3?3:1)]);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);const mxp=a[0]+Math.cos(ang)*40,myp=a[1]+Math.sin(ang)*40;x.save();x.translate(mxp,myp);x.rotate(ang);x.fillStyle='#ff6fae';x.beginPath();x.moveTo(12,0);x.lineTo(-6,-9);x.lineTo(-6,9);x.fill();x.restore();
   x.fillStyle='#3ac060';x.beginPath();x.arc(a[0],a[1],15,0,7);x.fill();T(n+1,a[0],a[1]+7,18,'#fff','center')})}
 else{x.font='bold 300px '+KF;x.textAlign='center';x.fillStyle='#e8eef6';x.fillText(ch,BX+BS/2,BY+BS-30);x.strokeStyle='#8aa4c0';x.lineWidth=3;x.setLineDash([4,8]);x.strokeText(ch,BX+BS/2,BY+BS-30);x.setLineDash([]);x.textAlign='left'}
 x.drawImage(inkC,0,0);
 if(demoAnim){const s2=strokes();if(s2){let tt=demoAnim.t,done=false;for(const st of s2){const len=st.length-1;if(tt<len){const i=Math.floor(tt),f=tt-i,a=P(st[i]),b=P(st[i+1]);demoAnim.pos=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];done=true;break}tt-=len+3}if(!done)demoAnim=null;else{x.fillStyle='#ff6fae';x.beginPath();x.arc(demoAnim.pos[0],demoAnim.pos[1],14,0,7);x.fill();emo('🦭',demoAnim.pos[0]+18,demoAnim.pos[1]-18,28)}}}}
function drawTrace(){kbg('#bfe8ff','#e8f8ff');starBar(S);seal(130,330,1.2,POP?'wave':'');bubbleK(msg,20,170,220);
 if(!/[0-9]/.test(ch)&&WORDS[ch.toUpperCase()]){emo(EM[ch.toUpperCase()],130,470,56);T(WORDS[ch.toUpperCase()],130,530,22,'#2a3a5a','center')}
 drawGuide();kb('watch',690,130,190,56,'👀 Watch Sunny',()=>{demoAnim={t:0}},{bg:'#4ab0e8',fs:20});kb('clr',690,200,190,56,'🧽 Rub out',()=>{ix.clearRect(0,0,900,600)},{bg:'#b06aff',fs:20});kb('chk',690,270,190,70,'✅ Done!',check,{bg:'#3ac060',fs:26});
 const L=SETS[set],i=L.indexOf(ch);kb('prv',690,360,90,56,'◀',()=>pick(L[(i+L.length-1)%L.length]),{bg:'#ff8a3d'});kb('nxt',790,360,90,56,'▶',()=>{const n=L[(i+1)%L.length];if(DEMO&&L.indexOf(n)>4){window.demoEnd&&window.demoEnd('The demo has the first 5 letters. The full app has A–Z, a–z, 0–9 and free-write!');return}pick(n)},{bg:'#ff8a3d'});
 kb('menu',690,440,190,56,'🏠 Letters',()=>{G.state='menu'},{bg:'#ff6fae',fs:20});if(S.done[ch])T('⭐ Done!',785,530,22,'#ff7a00','center')}
function drawMenu(){kbg('#ffe6f2','#d6f0ff');starBar(S);T('Pick a letter to trace',450,52,34,'#ff4f9a','center');Object.keys(SETS).forEach((k,i)=>kb('set'+i,230+i*150,70,140,46,k,()=>{set=k},{sel:set===k,bg:'#4ab0e8',fs:22}));
 const L=SETS[set];L.forEach((c2,i)=>{const X=60+(i%9)*88,Y=135+Math.floor(i/9)*88,lk=DEMO&&!(set==='A–Z'&&i<5);kb('l'+i,X,Y,78,78,lk?'🔒':c2,()=>{if(lk){window.demoEnd&&window.demoEnd('All letters and numbers are in the full app!');return}pick(c2)},{bg:S.done[c2]?'#3ac060':['#ff6fae','#ff8a3d','#b06aff','#4ab0e8'][i%4],fs:36})});
 kb('free',120,420+40,220,60,'✏️ Free write',()=>{if(DEMO){window.demoEnd&&window.demoEnd('Free-write paper is in the full app!');return}ix.clearRect(0,0,900,600);G.state='free'},{bg:'#3ac060'});kb('stk',360,460,220,60,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});kb('home',600,460,180,60,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawFree(){kbg('#fff8e0','#ffe6f2');x.fillStyle='#fff';rr(40,70,820,440,20);x.fill();x.strokeStyle='#b8d8f0';x.lineWidth=2;for(let y=150;y<500;y+=90){x.beginPath();x.moveTo(60,y);x.lineTo(840,y);x.stroke();x.setLineDash([8,8]);x.beginPath();x.moveTo(60,y-45);x.lineTo(840,y-45);x.stroke();x.setLineDash([])}x.drawImage(inkC,0,0);
 T('Free write! Write your name, words, anything ✏️',450,52,24,'#ff4f9a','center');COLS.forEach((c2,i)=>kb('pc'+i,60+i*60,522,50,50,'',()=>{pen=c2},{bg:c2,sel:pen===c2}));kb('fc',520,522,150,50,'🧽 Clear',()=>ix.clearRect(0,0,900,600),{bg:'#b06aff',fs:20});kb('fb',690,522,170,50,'⬅ Back',()=>{G.state='menu'},{bg:'#4ab0e8',fs:20});seal(820,90,.45,'wave')}
const COLS=['#2a3a5a','#ff4f9a','#3a7ad8','#3ac060','#ff8a3d','#b06aff'];let pen='#ff4f9a',last=null,drawing=false;
function drawTitle(){kbg('#9fdcff','#e0f6ff');seal(450,380,2,'wave');T('Coffeebreak Kids',450,110,34,'#ff4f9a','center');T('Learn to Write',450,175,62,'#fff','center');x.strokeStyle='#3a7ad8';x.lineWidth=3;x.strokeText&&0;T('with Sunny the Seal 🦭',450,215,24,'#2a3a5a','center');
 kb('go',330,500,240,70,'✏️ Let\'s write!',()=>{G.state='menu';speak('Hi! I am Sunny the seal. Let\'s learn to write!')},{bg:'#ff6fae',fs:28})}
bindInput({down(p){if(G.state==='trace'||G.state==='free'){drawing=true;last=p;ix.fillStyle=G.state==='free'?pen:'#ff4f9a';ix.beginPath();ix.arc(p.x,p.y,G.state==='free'?5:11,0,7);ix.fill()}},move(p){if(!drawing)return;ix.strokeStyle=G.state==='free'?pen:'#ff4f9a';ix.lineWidth=G.state==='free'?10:22;ix.lineCap='round';ix.beginPath();ix.moveTo(last.x,last.y);ix.lineTo(p.x,p.y);ix.stroke();last=p},up(){drawing=false}});
function update(dt){if(demoAnim)demoAnim.t+=dt*3}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='trace')drawTrace();else if(s==='free')drawFree();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KW={G,S,pick,check,ix,P,strokes,set:v=>{set=v}};startLoop();
