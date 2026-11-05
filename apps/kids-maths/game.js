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
// ===== Coffeebreak Kids: Maths =====
const S=kStore('kidsMaths',{best:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
const TOP=[['Counting','🔢','Ages 3–5'],['Adding','➕','Ages 5–7'],['Taking away','➖','Ages 5–7'],['Times tables','✖️','Ages 7–10'],['Shapes','🔷','Ages 4–7'],['Number order','📏','Ages 5–8']];
const EMO=['🍎','🦭','⭐','🐟','🍓','🎈','🐞','🧁','🌸','🐥'];
const SH=[['circle',0],['square',4],['triangle',3],['rectangle',4],['pentagon',5],['hexagon',6],['octagon',8],['star',10],['oval',0],['rhombus',4]];
let topic=0,lvl=0,q=null,qn=0,right=0,tt=[2,5,10],fb=null,NQ=10;
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
function opts(ans,lo,hi){const s=new Set([ans]);while(s.size<4){const v=ans+rnd(-4,4);if(v>=lo&&v<=hi&&v!==ans)s.add(v);else if(s.size<4&&Math.random()<.2)s.add(rnd(lo,hi))}return [...s].sort(()=>Math.random()-.5)}
function gen(){const L=lvl;if(topic===0){const n=rnd(1,L?20:10),e=EMO[rnd(0,9)];q={txt:'How many '+e+' can you count?',vis:{n,e},ans:n,o:opts(n,1,20),say:'How many can you count?'}}
 else if(topic===1){const m=L?20:10,a=rnd(0,m-1),b=rnd(1,m-a);q={txt:a+' + '+b+' = ?',vis:L?null:{a,b,e:EMO[rnd(0,9)]},ans:a+b,o:opts(a+b,0,m+4),say:a+' plus '+b}}
 else if(topic===2){const m=L?20:10,a=rnd(2,m),b=rnd(1,a);q={txt:a+' − '+b+' = ?',vis:L?null:{a,b,e:EMO[rnd(0,9)],sub:1},ans:a-b,o:opts(a-b,0,m),say:a+' take away '+b}}
 else if(topic===3){const ts=L?[2,3,4,5,6,7,8,9,10,11,12]:tt;const a=ts[rnd(0,ts.length-1)],b=rnd(1,12);q={txt:a+' × '+b+' = ?',ans:a*b,o:opts(a*b,0,144).map(v=>Math.max(0,v)),say:a+' times '+b}}
 else if(topic===4){const k=rnd(0,L?9:3),sh=SH[k];const c2=rnd(0,1);if(c2&&sh[0]!=='circle'&&sh[0]!=='oval'&&sh[0]!=='star'){q={txt:'How many sides does a '+sh[0]+' have?',shape:sh[0],ans:sh[1],o:opts(sh[1],3,10),say:'How many sides does a '+sh[0]+' have?'}}else{const ch=new Set([sh[0]]);while(ch.size<4)ch.add(SH[rnd(0,L?9:5)][0]);q={txt:'What shape is this?',shape:sh[0],ans:sh[0],o:[...ch].sort(()=>Math.random()-.5),say:'What shape is this?'}}}
 else{const st=rnd(0,L?80:15),step=L?[1,2,5,10][rnd(0,3)]:1,seq=[0,1,2,3,4].map(i=>st+i*step),hole=rnd(1,4),ans=seq[hole];q={txt:seq.map((v,i)=>i===hole?'?':v).join(',  '),ans,o:opts(ans,0,140),say:'What number is missing?',sub:'What number is missing?'}}
 q.o=q.o.map(String);q.ans=String(q.ans);speak(q.say)}
function startT(i,l){topic=i;lvl=l;qn=0;right=0;G.state='play';gen()}
function answer(v){if(fb)return;if(v===q.ans){right++;fb={ok:1,t:0};kTone(880,.1,.06);speak(['Correct!','Yes!','Great!','Well done!'][rnd(0,3)])}else{fb={ok:0,t:0,v};oops();speak('The answer is '+q.ans)}}
function nextQ(){fb=null;qn++;if(qn>=(DEMO?5:NQ)){G.state='done';const st=right>=NQ*.9?3:right>=NQ*.7?2:right>=NQ*.4?1:0;const k=topic+'-'+lvl;S.best[k]=Math.max(S.best[k]||0,right);if(st)reward(S,st,st===3?'Maths whizz!':'Clever clogs!');S.save();G.level++;if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Great maths! The full app has all 6 topics with 2 levels each, every times table to 12, and the whole sticker book.'),2600);return}gen()}
function shape(n,X,Y,r,col){x.fillStyle=col;x.strokeStyle='#2a3a5a';x.lineWidth=4;x.beginPath();if(n==='circle')x.arc(X,Y,r,0,7);else if(n==='oval')x.ellipse(X,Y,r*1.3,r*.8,0,0,7);else if(n==='square')x.rect(X-r,Y-r,2*r,2*r);else if(n==='rectangle')x.rect(X-r*1.5,Y-r*.8,3*r,1.6*r);else if(n==='rhombus'){x.moveTo(X,Y-r*1.2);x.lineTo(X+r*.9,Y);x.lineTo(X,Y+r*1.2);x.lineTo(X-r*.9,Y)}else if(n==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;x.lineTo(X+Math.cos(a)*rr2,Y+Math.sin(a)*rr2)}}else{const k={triangle:3,pentagon:5,hexagon:6,octagon:8}[n];for(let i=0;i<k;i++){const a=-Math.PI/2+i*2*Math.PI/k;x.lineTo(X+Math.cos(a)*r,Y+Math.sin(a)*r)}}x.closePath();x.fill();x.stroke()}
function drawPlay(){kbg('#d6f0ff','#fff3c4');starBar(S);T(TOP[topic][1]+' '+TOP[topic][0]+'  ·  '+(qn+1)+' / '+(DEMO?5:NQ),450,40,22,'#ff4f9a','center');x.fillStyle='rgba(255,255,255,.9)';rr(120,60,660,280,24);x.fill();
 T(q.txt,450,q.vis||q.shape?110:200,q.vis||q.shape?34:62,'#2a3a5a','center');if(q.sub)T(q.sub,450,250,22,'#7a4a8a','center','');
 if(q.vis){const v=q.vis;if(v.n){for(let i=0;i<v.n;i++)emo(v.e,200+(i%10)*55,170+Math.floor(i/10)*60,42)}else{for(let i=0;i<v.a;i++){emo(v.e,170+(i%5)*44+(i>=5?0:0),160+Math.floor(i/5)*48,36);if(v.sub&&i>=v.a-v.b){x.strokeStyle='#e8303a';x.lineWidth=4;x.beginPath();x.moveTo(150+(i%5)*44,140+Math.floor(i/5)*48);x.lineTo(190+(i%5)*44,180+Math.floor(i/5)*48);x.stroke()}}if(!v.sub){T('+',450,215,50,'#ff4f9a','center');for(let i=0;i<v.b;i++)emo(v.e,520+(i%5)*44,160+Math.floor(i/5)*48,36)}}}
 if(q.shape)shape(q.shape,450,230,80,'#ffd24a');
 q.o.forEach((o,i)=>{let bg=['#ff6fae','#4ab0e8','#3ac060','#ff8a3d'][i];if(fb){if(o===q.ans)bg='#3ac060';else if(fb.v===o)bg='#e8303a';else bg='#c8d0d8'}kb('o'+i,60+i*200,370,180,100,o,()=>answer(o),{bg,fs:o.length>6?24:44})});
 if(fb){T(fb.ok?'⭐ Correct!':'The answer is '+q.ans,450,510,30,fb.ok?'#3ac060':'#e8303a','center');kb('nx',620,490,220,60,'Next ▶',nextQ,{bg:'#b06aff'})}seal(80,520,.55,fb&&fb.ok?'wave':'')}
function drawMenu(){kbg('#fff3c4','#d6f0ff');starBar(S);T('What shall we practise?',450,52,34,'#ff4f9a','center');
 TOP.forEach((tp,i)=>{const X=50+(i%3)*275,Y=80+Math.floor(i/3)*200;x.fillStyle='#fff';rr(X,Y,255,180,22);x.fill();emo(tp[1],X+50,Y+50,50);T(tp[0],X+95,Y+48,22,'#2a3a5a');T(tp[2],X+95,Y+72,15,'#7a4a8a','left','');
  ['Level 1','Level 2'].forEach((l,j)=>{const lk=DEMO&&(i>1||j>0);kb('t'+i+j,X+15+j*118,Y+100,110,60,(lk?'🔒':'')+l,()=>{if(lk){window.demoEnd&&window.demoEnd('Every topic and level is in the full app!');return}startT(i,j)},{bg:j?'#b06aff':'#3ac060',fs:18});const b=S.best[i+'-'+j];if(b)T('⭐'+b,X+70+j*118,Y+178,13,'#ff7a00','center','')})});
 kb('tt',50,490,280,56,'✖️ My tables: '+tt.join(', '),()=>{const opts2=[[2,5,10],[2,3,4],[3,6,9],[4,8],[6,7,8],[9,11,12]];const i=opts2.findIndex(o=>o.join()===tt.join());tt=opts2[(i+1)%opts2.length]},{bg:'#ff8a3d',fs:18});kb('stk',350,490,200,56,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});kb('home',570,490,160,56,'🏠',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawDone(){kbg('#fff3c4','#ffd6ec');seal(450,280,1.4,'wave');T('You got '+right+' / '+(DEMO?5:NQ)+'!',450,120,50,'#ff4f9a','center');kb('a',220,420,220,64,'🔁 Again',()=>startT(topic,lvl),{bg:'#3ac060'});kb('m',460,420,220,64,'📚 Topics',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#bff0d0','#fff3c4');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('Maths Fun',450,170,70,'#fff','center');['1','+','2','=','3'].forEach((n,i)=>T(n,250+i*100,280+Math.sin(t*2+i)*10,64,['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i],'center'));seal(450,380,.8,'wave');kb('go',330,470,240,70,'🔢 Let\'s count!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
bindInput({});function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawPlay();else if(s==='done')drawDone();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KM={G,S,startT,answer,nextQ,get q(){return q}};startLoop();
