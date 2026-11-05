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
// ===== Coffeebreak Kids: Marine Life =====
const S=kStore('kidsMarine',{seen:[],best:0});const G={state:'title',score:S.stars,level:0};window.G=G;
// name, emoji, zone, facts[]
const CR=[
['Clownfish','🐠',0,['Clownfish live among sea anemones, whose stinging tentacles keep them safe.','A slimy mucus coat protects clownfish from the anemone\'s sting.','You can find clownfish on the Great Barrier Reef.']],
['Green Sea Turtle','🐢',0,['Green sea turtles mostly eat seagrass and algae when grown up.','Mother turtles return to the beach where they hatched to lay eggs.','They can hold their breath for hours while resting.']],
['Dolphin','🐬',0,['Dolphins are mammals, so they breathe air through a blowhole.','Dolphins use clicks and echoes to find food. This is called echolocation.','Bottlenose dolphins live in Australian waters.']],
['Pufferfish','🐡',0,['When scared, a pufferfish gulps water and puffs up like a ball.','Many pufferfish are poisonous, so other animals leave them alone.','Pufferfish have a tough beak made of four fused teeth.']],
['Octopus','🐙',1,['An octopus has eight arms and three hearts.','Octopuses can change colour in a split second to hide.','Their blood is blue!']],
['Crab','🦀',0,['Crabs usually walk sideways.','A crab wears its skeleton on the outside, called an exoskeleton.','Crabs moult (shed their shell) so they can grow bigger.']],
['Jellyfish','🪼',1,['Jellyfish have no brain, heart or bones.','Jellyfish have been around for over 500 million years.','Box jellyfish in northern Australia are very dangerous. Swim between the flags!']],
['Humpback Whale','🐋',1,['Humpback whales sing long, beautiful songs.','Each winter humpbacks travel up the east coast of Australia.','They eat tiny shrimp-like animals called krill.']],
['Blue Whale','🐳',1,['The blue whale is the biggest animal that has ever lived.','A blue whale\'s heart is about the size of a small car.','Even so, blue whales eat mostly tiny krill.']],
['Great White Shark','🦈',1,['Sharks are fish with skeletons made of cartilage, not bone.','Sharks can grow and replace thousands of teeth in their lives.','Great whites can sense tiny electric signals from other animals.']],
['Shrimp','🦐',0,['Cleaner shrimp pick tiny pests off fish, like a fish car wash!','Shrimp swim backwards fast by flicking their tail.','Shrimp have ten legs.']],
['Coral','🪸',0,['Coral is made of tiny animals called polyps!','The Great Barrier Reef is the largest coral reef system on Earth.','Warm water can make coral turn white. This is called bleaching.']],
['Squid','🦑',2,['Giant squid have the biggest eyes of any animal, as big as a dinner plate.','Squid squirt ink to escape from predators.','Squid move by squirting water, like jet propulsion.']],
['Anglerfish','🐟',2,['Deep-sea anglerfish have a glowing lure on their head to attract food.','The deep sea is totally dark, so many animals make their own light.','This glowing is called bioluminescence.']],
['Penguin','🐧',0,['Little penguins are the smallest penguins and live in southern Australia.','Penguins are birds that cannot fly but are amazing swimmers.','Their black and white colours help them hide in the water.']],
['Starfish','⭐',0,['Starfish are also called sea stars. They are not really fish!','If a sea star loses an arm, it can grow a new one.','Sea stars have a tiny eye at the end of each arm.']]];
const ZN=[['Sunny Reef','#7fe0ff','#2aa8d8'],['Open Ocean','#2a8ad8','#0a4a98'],['Deep Sea','#0a2a5a','#020818']];
let zone=0,sel=null,fi=0,qz=null,bub=[];
function look(i){sel=i;fi=0;speak(CR[i][0]+'. '+CR[i][3][0]);if(!S.seen.includes(i)){S.seen.push(i);reward(S,1,'New creature: '+CR[i][0]+'!')}}
const QS=[];CR.forEach((c,i)=>c[3].forEach(f=>QS.push([i,f])));
function quizStart(){qz={n:0,ok:0,fb:null};nq()}
function nq(){const [i,f]=QS[Math.floor(Math.random()*QS.length)];const o=new Set([i]);while(o.size<3)o.add(Math.floor(Math.random()*CR.length));qz.q={i,f:f.replace(new RegExp(CR[i][0].split(' ').pop()+'e?s?','gi'),'____'),o:[...o].sort(()=>Math.random()-.5)};qz.fb=null;speak('Who am I? '+qz.q.f.replace(/____/g,'blank'))}
function qAns(i){if(qz.fb)return;qz.fb={ok:i===qz.q.i,v:i};if(qz.fb.ok){qz.ok++;kTone(880,.1)}else oops();speak(qz.fb.ok?'Correct!':'It was the '+CR[qz.q.i][0])}
function qNext(){qz.n++;if(qz.n>=(DEMO?4:8)){G.state='qdone';S.best=Math.max(S.best,qz.ok);if(qz.ok)reward(S,qz.ok>=6?3:qz.ok>=3?2:1,'Ocean expert!');G.level++;if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Splendid swimming! The full app has all 3 ocean zones, 16 creatures with 48 true facts, and the full quiz.'),2600);return}nq()}
function sea(z){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,ZN[z][1]);g.addColorStop(1,ZN[z][2]);x.fillStyle=g;x.fillRect(0,0,900,600);
 if(z<2){x.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<6;i++){x.beginPath();x.moveTo(100+i*150+Math.sin(t+i)*20,0);x.lineTo(60+i*150,600);x.lineTo(120+i*150,600);x.fill()}}else{for(let i=0;i<30;i++){x.fillStyle='rgba(120,220,255,'+(.3+.3*Math.sin(t*2+i))+')';x.fillRect((i*131)%900,(i*71)%600,2,2)}}
 if(bub.length<25)bub.push({x:Math.random()*900,y:620,r:2+Math.random()*6});bub.forEach(b=>{b.y-=1+b.r*.2;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1.5;x.beginPath();x.arc(b.x+Math.sin(t*2+b.r)*4,b.y,b.r,0,7);x.stroke()});bub=bub.filter(b=>b.y>-10);
 x.fillStyle=z===0?'#f0dca0':z===1?'#1a3a6a':'#05101e';x.beginPath();x.moveTo(0,560);for(let i=0;i<=900;i+=60)x.lineTo(i,550+Math.sin(i*.02)*12);x.lineTo(900,600);x.lineTo(0,600);x.fill()}
function drawExplore(){sea(zone);starBar(S);T(ZN[zone][0],450,40,30,'#fff','center');
 const list=CR.map((c,i)=>i).filter(i=>CR[i][2]===zone);list.forEach((i,k)=>{const n=list.length,X=110+k*(680/Math.max(1,n-1)||0),Y=150+((k*97)%280)+Math.sin(t*1.5+k)*12;BTN['c'+i]={x:X-45,y:Y-45,w:90,h:90,fn:()=>look(i)};x.save();x.translate(X,Y);x.restore();emo(CR[i][1],X,Y,64);if(S.seen.includes(i))T('✓',X+30,Y-30,18,'#5aff8a','center')});
 ZN.forEach((zz,j)=>kb('z'+j,40+j*190,500,175,60,['☀️','🌊','🌑'][j]+' '+zz[0],()=>{if(DEMO&&j===2)return window.demoEnd&&window.demoEnd('The Deep Sea zone is in the full app!');zone=j;sel=null},{bg:['#ffb020','#4ab0e8','#3a3a8a'][j],fs:18,sel:zone===j}));kb('qz',620,500,130,60,'❓ Quiz',()=>{G.state='quiz';quizStart()},{bg:'#ff6fae',fs:20});kb('hm',760,500,110,60,'🏠',()=>{G.state='title'},{bg:'#3ac060'});
 T('Found '+S.seen.length+' / '+CR.length,700,40,18,'#fff','center');
 if(sel!==null){const c=CR[sel];x.fillStyle='rgba(255,255,255,.96)';rr(140,90,620,380,26);x.fill();x.strokeStyle='#4ab0e8';x.lineWidth=5;x.stroke();emo(c[1],250,210,110);T(c[0],560,160,34,'#2a3a5a','center');T(ZN[c[2]][0],560,192,18,'#7a4a8a','center','');x.font='20px '+KF;x.fillStyle='#2a3a5a';x.textAlign='left';wrapT(c[3][fi],370,240,360,28);T('Fact '+(fi+1)+' of 3',560,370,16,'#999','center','');
  kb('nf',180,390,200,56,'💡 Next fact',()=>{fi=(fi+1)%3;speak(c[3][fi])},{bg:'#ffb020',fs:20});kb('sp',400,390,150,56,'🔊 Hear',()=>speak(c[3][fi]),{bg:'#4ab0e8',fs:20});kb('cl',570,390,170,56,'✖ Close',()=>{sel=null},{bg:'#ff6fae',fs:20})}}
function drawQuiz(){sea(1);starBar(S);const q=qz.q;T('Who am I?  '+(qz.n+1)+' / '+(DEMO?4:8),450,44,28,'#fff','center');x.fillStyle='rgba(255,255,255,.95)';rr(110,70,680,150,24);x.fill();x.font='bold 24px '+KF;x.fillStyle='#2a3a5a';x.textAlign='center';wrapT(q.f,450,120,620,32);x.textAlign='left';
 q.o.forEach((i,k)=>{let bg=['#ff6fae','#4ab0e8','#ffb020'][k];if(qz.fb){bg=i===q.i?'#3ac060':i===qz.fb.v?'#e8303a':'#9aa8b8'}kb('o'+k,80+k*255,250,230,200,'',()=>qAns(i),{bg});emo(CR[i][1],195+k*255,320,80);T(CR[i][0],195+k*255,425,20,'#fff','center')});
 if(qz.fb){T(qz.fb.ok?'⭐ Correct!':'It was the '+CR[q.i][0],330,520,28,qz.fb.ok?'#5aff8a':'#ffd24a','center');kb('nx',620,490,220,64,'Next ▶',qNext,{bg:'#b06aff'})}}
function drawQDone(){sea(0);seal(450,300,1.3,'wave');T('You got '+qz.ok+' / '+(DEMO?4:8)+'!',450,120,50,'#fff','center');kb('a',220,440,220,64,'🔁 Again',()=>{G.state='quiz';quizStart()},{bg:'#3ac060'});kb('m',460,440,220,64,'🌊 Explore',()=>{G.state='explore'},{bg:'#4ab0e8'})}
function drawTitle(){sea(0);T('Coffeebreak Kids',450,100,32,'#fff','center');T('Marine Life',450,175,72,'#fff','center');['🐠','🐢','🐬','🐙','🐋','🦀','⭐'].forEach((e,i)=>emo(e,180+i*90,270+Math.sin(t*2+i)*12,54));seal(450,380,.8,'wave');
 kb('go',150,470,260,70,'🤿 Dive in!',()=>{G.state='explore'},{bg:'#ff6fae',fs:26});kb('q',430,470,180,70,'❓ Quiz',()=>{G.state='quiz';quizStart()},{bg:'#b06aff',fs:26});kb('s',630,470,130,70,'🏷️',()=>{G.state='stk'},{bg:'#ffb020',fs:30})}
bindInput({});function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='explore')drawExplore();else if(s==='quiz')drawQuiz();else if(s==='qdone')drawQDone();else stickerBook(S,()=>{G.state='title'});kOverlay(1/60)}
window.KM={G,S,look,quizStart,qAns,qNext,get qz(){return qz},set zone(v){zone=v}};startLoop();
