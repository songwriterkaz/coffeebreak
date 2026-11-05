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
// ===== Coffeebreak Kids: English =====
const S=kStore('kidsEnglish',{best:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
const TOP=[['Phonics','🔤'],['Sight words','👀'],['Rhyming','🎵'],['Sentences','🧩'],['Reading','📖']];
const PH=[['a','apple','🍎'],['b','bat','🦇'],['c','cat','🐱'],['d','dog','🐶'],['e','egg','🥚'],['f','fish','🐟'],['g','goat','🐐'],['h','hat','🎩'],['i','insect','🐞'],['j','jam','🍓'],['k','kite','🪁'],['l','lion','🦁'],['m','moon','🌙'],['n','nest','🪺'],['o','octopus','🐙'],['p','pig','🐷'],['r','rabbit','🐰'],['s','seal','🦭'],['t','tiger','🐯'],['u','umbrella','☂️'],['v','van','🚐'],['w','whale','🐳'],['y','yo-yo','🪀'],['z','zebra','🦓']];
const SW=['the','and','a','to','said','in','he','I','of','it','was','you','they','on','she','is','for','at','his','but','that','with','all','we','can','are','up','had','my','her','what','there','out','this','have','went','be','like','some','so','not','then','were','go','little','as','no','mum','one','them','do','me','down','dad','big','when','it\'s','see','looked','very','look','don\'t','come','will','into','back','from','children','him','Mr','get','just','now','came','oh','about','got','their','people','your','put','could','house','old','too','by','day','made','time','I\'m','if','help','Mrs','called','here','off','asked','saw','make','an'];
const RH=[['cat',['hat','bat','mat','rat']],['dog',['log','frog','fog','jog']],['sun',['bun','run','fun']],['bee',['tree','sea','knee','three']],['cake',['lake','snake','rake','bake']],['star',['car','jar','far']],['moon',['spoon','June','balloon']],['bear',['chair','pear','hair']],['ring',['king','sing','swing','wing']],['boat',['goat','coat','float']],['light',['night','kite','bright']],['seal',['meal','wheel','heel']],['fish',['dish','wish','swish']],['bed',['red','sled','head']],['mouse',['house','blouse']],['clock',['sock','rock','block']]];
const NR=['pig','sun','cup','bed','fox','leg','hen','top','bus','van','web','zip','map','lid','gum','pot','box','jet'];
const SEN=['The cat sat on the mat.','I like to play at the park.','My seal can swim very fast.','We went to the beach today.','The big dog ran up the hill.','Mum made a yummy cake.','Can you see the red bus?','She has a pink hat.','The bird is in the tree.','I love my little sister.','Dad and I read a book.','The frog jumped into the pond.','It is hot and sunny today.','We had fish and chips for tea.','The koala is asleep in the gum tree.'];
const STO=[{t:'Sunny the Seal',e:'🦭',p:['Sunny is a little grey seal.','Sunny lives by the sea with her mum.','Every day Sunny swims and plays in the waves.','One day Sunny found a shiny shell on the sand.','She gave the shell to her mum. Mum was so happy!'],q:[['What colour is Sunny?',['grey','pink','green'],0],['What did Sunny find?',['a shell','a fish','a hat'],0],['Who did she give it to?',['her mum','a crab','a bird'],0]]},
{t:'The Lost Kite',e:'🪁',p:['Max had a red kite.','He took it to the park on a windy day.','The wind blew and the kite went up, up, up!','Oh no! The kite got stuck in a tree.','A tall lady helped Max get it down. "Thank you!" said Max.'],q:[['What colour was the kite?',['red','blue','yellow'],0],['Where did the kite get stuck?',['in a tree','on a roof','in a pond'],0],['What did Max say?',['Thank you!','Go away!','Goodnight!'],0]]},
{t:'Koala Wakes Up',e:'🐨',p:['Kip the koala sleeps all day in a gum tree.','At night Kip wakes up and is very hungry.','Kip eats lots and lots of gum leaves.','Then Kip sees the big round moon.','"Goodnight, moon," says Kip, and goes back to sleep.'],q:[['Where does Kip sleep?',['in a gum tree','in a cave','in a bed'],0],['What does Kip eat?',['gum leaves','apples','pizza'],0],['What does Kip see at night?',['the moon','the sun','a rainbow'],0]]},
{t:'Rainy Day Fun',e:'🌧️',p:['It was raining outside.','Lily put on her yellow raincoat and boots.','She jumped in the big puddles. Splash!','Then the sun came out and she saw a rainbow.','Lily counted seven colours in the rainbow.'],q:[['What colour was Lily\'s raincoat?',['yellow','purple','black'],0],['What did Lily jump in?',['puddles','a pool','leaves'],0],['How many colours did she count?',['seven','two','ten'],0]]}];
let tp=0,q=null,qn=0,right=0,fb=null,seq=[],story=null,page=0,sq=0;const NQ=8;
const rnd=n=>Math.random()*n|0,sh=a=>a.slice().sort(()=>Math.random()-.5);
function gen(){if(tp===0){const a=PH[rnd(PH.length)];const o=sh([a,...sh(PH.filter(z=>z!==a)).slice(0,2)]);q={txt:'Which one starts with the sound…',big:a[0],o:o.map(z=>z[2]),lab:o.map(z=>z[1]),ans:a[2],say:a[0]+'. Which picture starts with '+a[0]+'?'}}
 else if(tp===1){const w=SW[rnd(DEMO?20:SW.length)];const o=sh([w,...sh(SW.filter(z=>z!==w)).slice(0,3)]);q={txt:'Listen, then tap the word!',o,ans:w,say:w,hear:1}}
 else if(tp===2){const r=RH[rnd(RH.length)];const a=r[1][rnd(r[1].length)];const o=sh([a,...sh(NR).slice(0,2)]);q={txt:'Which word rhymes with…',big:r[0],o,ans:a,say:'Which word rhymes with '+r[0]+'?'}}
 else if(tp===3){const s=SEN[rnd(SEN.length)];const w=s.split(' ');q={txt:'Tap the words in the right order',sen:s,words:sh(w.map((z,i)=>({z,i}))),ans:s,say:s};seq=[]}
 if(q.say)speak(q.say)}
function start(i){tp=i;qn=0;right=0;fb=null;if(i===4){G.state='stories';return}G.state='play';gen()}
function answer(v){if(fb)return;if(v===q.ans){right++;fb={ok:1};kTone(880,.1,.06);speak('Yes! '+(tp===3?q.sen:''))}else{fb={ok:0,v};oops();speak(tp===0?'It is '+PH.find(p=>p[2]===q.ans)[1]:'The answer is '+q.ans)}}
function nextQ(){fb=null;qn++;if(qn>=(DEMO?4:NQ)){finish(right,DEMO?4:NQ);return}gen()}
function finish(r,n){G.state='done';q={r,n};const st=r>=n*.9?3:r>=n*.6?2:r>=n*.3?1:0;S.best[tp]=Math.max(S.best[tp]||0,r);if(st)reward(S,st,st===3?'Super reader!':'Great work!');S.save();G.level++;if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Great work! The full app has phonics, 100 sight words, rhyming, sentence building and 4 read-along stories with quizzes.'),2600)}
function drawPlay(){kbg('#e8f8ff','#fff3c4');starBar(S);T(TOP[tp][1]+' '+TOP[tp][0]+'  ·  '+(qn+1)+' / '+(DEMO?4:NQ),450,40,22,'#ff4f9a','center');x.fillStyle='rgba(255,255,255,.92)';rr(100,60,700,220,24);x.fill();T(q.txt,450,105,28,'#2a3a5a','center');
 if(q.big)T(q.big,450,220,q.big.length>2?80:110,'#ff4f9a','center');if(q.hear)kb('h',350,140,200,90,'🔊 Hear',()=>speak(q.ans),{bg:'#4ab0e8',fs:34});
 if(tp===3){const used=seq.map(s=>s.i);x.fillStyle='#2a3a5a';x.font='bold 30px '+KF;x.textAlign='center';wrapT(seq.map(s=>s.z).join(' ')||'…',450,190,640,38);x.textAlign='left';
  q.words.forEach((w,i)=>{if(used.includes(w.i))return;x.font='bold 26px '+KF;const ww=x.measureText(w.z).width+36;const X=60+(i%5)*160,Y=310+Math.floor(i/5)*80;kb('w'+i,X,Y,Math.max(140,ww),64,w.z,()=>{if(fb)return;seq.push(w);if(seq.length===q.words.length)answer(seq.map(s=>s.z).join(' '))},{bg:['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i%5],fs:24})});
  if(!fb&&seq.length)kb('un',650,230,140,44,'↩ Undo',()=>seq.pop(),{bg:'#c8d0d8',fs:18});if(fb&&!fb.ok)T(q.sen,450,260,22,'#3ac060','center')}
 else q.o.forEach((o,i)=>{let bg=['#ff6fae','#4ab0e8','#3ac060','#ff8a3d'][i];if(fb){bg=o===q.ans?'#3ac060':fb.v===o?'#e8303a':'#c8d0d8'}const n=q.o.length,w=n===3?240:180;kb('o'+i,450-n*(w+16)/2+i*(w+16),310,w,130,tp===0?'':o,()=>answer(o),{bg,fs:36});if(tp===0){emo(o,450-n*(w+16)/2+i*(w+16)+w/2,365,64);T(q.lab[i],450-n*(w+16)/2+i*(w+16)+w/2,428,18,'#fff','center')}});
 if(fb){T(fb.ok?'⭐ Correct!':'Good try!',300,520,30,fb.ok?'#3ac060':'#e8303a','center');kb('nx',560,490,220,60,'Next ▶',nextQ,{bg:'#b06aff'})}seal(80,520,.55,fb&&fb.ok?'wave':'')}
function drawStories(){kbg('#fff3c4','#ffe6f2');starBar(S);T('Pick a story',450,56,36,'#ff4f9a','center');STO.forEach((s,i)=>{const lk=DEMO&&i>0;kb('s'+i,120+(i%2)*340,100+Math.floor(i/2)*180,320,150,(lk?'🔒 ':'')+s.t,()=>{if(lk){window.demoEnd&&window.demoEnd('All 4 stories are in the full app!');return}story=s;page=0;sq=0;right=0;G.state='read';speak(s.p[0])},{bg:['#4ab0e8','#ff8a3d','#3ac060','#b06aff'][i],fs:24});emo(s.e,280+(i%2)*340,130+Math.floor(i/2)*180,40)});kb('b',350,480,200,56,'⬅ Back',()=>{G.state='menu'},{bg:'#ff6fae'})}
function drawRead(){kbg('#fff8e8','#ffe6f2');x.fillStyle='#fff';rr(80,40,740,420,24);x.fill();x.strokeStyle='#ffb020';x.lineWidth=4;x.stroke();
 if(page<story.p.length){T(story.t,450,90,28,'#ff4f9a','center');emo(story.e,450,190,110);x.fillStyle='#2a3a5a';x.font='bold 32px '+KF;x.textAlign='center';wrapT(story.p[page],450,320,640,42);x.textAlign='left';T('Page '+(page+1)+' / '+story.p.length,450,440,16,'#7a4a8a','center','');
  kb('rd',100,480,200,60,'🔊 Read to me',()=>speak(story.p[page]),{bg:'#4ab0e8',fs:20});kb('pv',330,480,120,60,'◀',()=>{page=Math.max(0,page-1)},{bg:'#ff8a3d'});kb('nx',470,480,330,60,page<story.p.length-1?'Next page ▶':'Quiz time! ▶',()=>{page++;if(page<story.p.length)speak(story.p[page]);else speak(story.q[0][0])},{bg:'#3ac060',fs:22})}
 else{const qq=story.q[sq];T('Quiz '+(sq+1)+' / 3',450,90,22,'#ff4f9a','center');T(qq[0],450,170,32,'#2a3a5a','center');if(!q||!q.qo||q.sq!==sq)q={qo:sh([0,1,2]),sq};q.qo.forEach((k,i)=>{let bg=['#ff6fae','#4ab0e8','#ff8a3d'][i];if(fb){bg=k===qq[2]?'#3ac060':fb.v===k?'#e8303a':'#c8d0d8'}kb('q'+i,120+i*230,240,210,110,qq[1][k],()=>{if(fb)return;if(k===qq[2]){right++;fb={ok:1};kTone(880,.1,.06)}else{fb={ok:0,v:k};oops()}},{bg,fs:24})});
  if(fb)kb('qn',340,480,220,60,'Next ▶',()=>{fb=null;sq++;if(sq>=3){finish(right,3)}else speak(story.q[sq][0])},{bg:'#b06aff'})}}
function drawMenu(){kbg('#e8f8ff','#ffe6f2');starBar(S);T('Let\'s learn English!',450,56,36,'#ff4f9a','center');TOP.forEach((tp2,i)=>{const lk=DEMO&&i===3;kb('t'+i,110+(i%3)*240,90+Math.floor(i/3)*170,220,150,'',()=>{if(lk){window.demoEnd&&window.demoEnd('Sentence building is in the full app!');return}start(i)},{bg:['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i]});emo(tp2[1],220+(i%3)*240,140+Math.floor(i/3)*170,50);T((lk?'🔒 ':'')+tp2[0],220+(i%3)*240,210+Math.floor(i/3)*170,22,'#fff','center');if(S.best[i])T('⭐'+S.best[i],310+(i%3)*240,115+Math.floor(i/3)*170,16,'#fff','right')});
 kb('stk',560,280,220,150,'',()=>{G.state='stk'},{bg:'#ffb020'});emo('🏷️',670,330,50);T('Stickers',670,400,22,'#fff','center');kb('home',350,480,200,56,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawDone(){kbg('#fff3c4','#ffd6ec');seal(450,280,1.4,'wave');T('You got '+q.r+' / '+q.n+'!',450,120,50,'#ff4f9a','center');kb('a',220,420,220,64,'🔁 Again',()=>start(tp),{bg:'#3ac060'});kb('m',460,420,220,64,'📚 Topics',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#ffe6f2','#e8f8ff');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('English',450,175,76,'#fff','center');['A','b','C','d'].forEach((l,i)=>T(l,270+i*120,280+Math.sin(t*2+i)*10,70,['#ff6fae','#4ab0e8','#3ac060','#ff8a3d'][i],'center'));seal(450,380,.8,'wave');kb('go',330,470,240,70,'📖 Let\'s read!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
bindInput({});function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawPlay();else if(s==='stories')drawStories();else if(s==='read')drawRead();else if(s==='done')drawDone();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KE={G,S,start,answer,nextQ,get q(){return q}};startLoop();
