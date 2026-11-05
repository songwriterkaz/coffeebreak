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
// ===== Coffeebreak Kids: Balloon Word Guess =====
const S=kStore('kidsHangman',{won:{},best:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
const CATS=[
 ['Animals','🐾','#3ac060',[['CAT','🐱','A fluffy pet that says meow'],['DOG','🐶','A fluffy pet that wags its tail'],['FISH','🐟','Swims in a bowl or the sea'],['BIRD','🐦','Has wings and can fly'],['FROG','🐸','Hops and says ribbit'],['SEAL','🦭','Sunny is one of these!'],['BEAR','🐻','Big and furry, likes honey'],['LION','🦁','King of the jungle'],['DUCK','🦆','Quacks and loves puddles'],['HORSE','🐴','You can ride one'],['WHALE','🐳','Biggest animal in the ocean'],['ZEBRA','🦓','A horse with black and white stripes'],['KOALA','🐨','Sleepy Aussie who loves gum leaves'],['SNAKE','🐍','Slithers along the ground'],['MOUSE','🐭','Tiny and likes cheese'],['SHARK','🦈','Big fish with lots of teeth'],['PANDA','🐼','Black and white, loves bamboo'],['TIGER','🐯','Stripey big cat']]],
  ['Food','🍎','#ff8a3d',[['CAKE','🍰','Yummy birthday treat'],['PIZZA','🍕','Round with cheese on top'],['APPLE','🍎','Crispy red or green fruit'],['BREAD','🍞','Makes toast and sandwiches'],['MILK','🥛','White drink from cows'],['EGG','🥚','Chickens lay these'],['CORN','🌽','Yellow and grows on a cob'],['JAM','🍓','Sweet spread for toast'],['RICE','🍚','Tiny white grains'],['SOUP','🥣','Warm and sippy in a bowl'],['CHEESE','🧀','Mice love this yellow food'],['BANANA','🍌','Yellow fruit monkeys love'],['COOKIE','🍪','Sweet round biscuit'],['GRAPE','🍇','Little purple or green fruits'],['LEMON','🍋','Sour yellow fruit'],['HONEY','🍯','Bees make this sweet treat'],['CARROT','🥕','Orange veg rabbits love'],['POPCORN','🍿','Puffy white snack at the movies']]],
  ['Colours','🌈','#b06aff',[['RED','🔴','Colour of strawberries and stop lights'],['BLUE','🔵','Colour of the sky and the sea'],['PINK','🩷','Soft rosy colour'],['GREEN','🟢','Colour of grass and leaves'],['YELLOW','🟡','Colour of the sun and bananas'],['ORANGE','🟠','Colour of carrots and pumpkins'],['PURPLE','🟣','Colour of grapes and lavender'],['WHITE','⚪','Colour of snow and clouds'],['BLACK','⚫','Opposite of white'],['BROWN','🟤','Colour of chocolate and dirt'],['GOLD','🥇','Shiny medal colour'],['SILVER','🥈','Shiny second-place colour'],['TEAL','🩵','Blue-green like the ocean'],['CREAM','🍦','Pale soft colour of ice cream'],['CORAL','🪸','Pinky-orange like a reef'],['INDIGO','💙','Deep blue-purple'],['VIOLET','💜','Pretty purple flower colour'],['AMBER','🟡','Warm honey-gold colour']]],
  ['School','📚','#4ab0e8',[['BOOK','📖','You read one of these'],['PEN','🖊️','Writes with ink'],['DESK','🪑','You sit at one in class'],['BAG','🎒','Carries your books to school'],['MATHS','🔢','Numbers and sums'],['MUSIC','🎵','Songs and instruments'],['PAINT','🎨','Colours for art class'],['CLOCK','⏰','Tells the time'],['RULER','📏','Straight stick for measuring'],['PENCIL','✏️','Writes and can be rubbed out'],['TEACHER','👩‍🏫','Helps you learn'],['PAPER','📄','You write and draw on it'],['GLOBE','🌍','Ball that shows the world'],['CRAYON','🖍️','Waxy stick for colouring'],['LIBRARY','📚','Room full of books'],['SCIENCE','🔬','Experiments and discoveries'],['HISTORY','🏺','Stories about long ago'],['RECESS','⚽','Playtime between lessons']]]
];
const PIRATE=[['SHIP','⛵','Big boat with sails'],['HAT','🎩','Pirates wear a fancy one'],['MAP','🗺️','Shows where the treasure is'],['GOLD','🥇','Shiny yellow treasure'],['FLAG','🏴‍☠️','Pirates fly a skull one'],['BOAT','🚤','Smaller than a ship'],['PEARL','🤍','Shiny gem from an oyster'],['CHEST','🧰','Box that holds treasure'],['PARROT','🦜','Talking pirate bird'],['ISLAND','🏝️','Land in the middle of the sea'],['ANCHOR','⚓','Heavy hook that stops a ship'],['CANNON','💣','Goes BOOM on a pirate ship'],['COMPASS','🧭','Points north so you don’t get lost'],['TREASURE','💎','Gold, jewels and shiny things'],['CAPTAIN','🧑‍✈️','Boss of the pirate ship'],['SAILOR','🧑‍✈️','Works on a ship'],['PIRATE','🏴‍☠️','Says Arrr and looks for gold'],['LAGOON','🌊','Quiet blue water by an island']];
const MAXW=6;
let mode='balloon',cat=0,word='',hint='',emoji='',guessed={},wrong=0,won=0,msg='',msgT=0,popping=[],floatY=0,splashT=0,demoPlankDone=0,round=0;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function pickWord(list){const w=list[Math.random()*list.length|0];word=w[0];emoji=w[1];hint=w[2];guessed={};wrong=0;won=0;msg='';msgT=0;popping=[];floatY=0;splashT=0;round++}
function startBalloon(i){if(DEMO&&i>0){window.demoEnd&&window.demoEnd('The full game has all 4 word categories (Animals, Food, Colours and School), Walk the Plank pirate mode, and the full sticker book!');return}
 mode='balloon';cat=i;pickWord(CATS[i][3]);G.state='play';speak('Guess the '+CATS[i][0].toLowerCase()+' word')}
function startPlank(){if(DEMO&&demoPlankDone){window.demoEnd&&window.demoEnd('That was your free Walk the Plank round! The full game has endless pirate words, all 4 balloon categories and the sticker book.');return}
 mode='plank';pickWord(PIRATE);G.state='play';speak('Walk the plank! Guess the pirate word')}
function letters(){return word.split('')}
function revealed(){return letters().map(ch=>guessed[ch]?ch:'_')}
function say(m){msg=m;msgT=2.2}
function guess(ch){if(G.state!=='play'||won||guessed[ch])return;guessed[ch]=1;if(word.indexOf(ch)>=0){kTone(660,.08,.05);yay();if(letters().every(c=>guessed[c])){won=1;const n=mode==='plank'?2:1;reward(S,n,mode==='plank'?'Treasure! 💎':'Sunny floats up!');S.won[mode+(mode==='balloon'?cat:'')]= (S.won[mode+(mode==='balloon'?cat:'')]||0)+1;S.save();if(mode==='plank')demoPlankDone=1;speak(word+'! Well done!');confetti(80);say(mode==='plank'?'You found the treasure! 💎':'Sunny floats up! 🎈')}}
 else{wrong++;oops();popping.push({i:wrong-1,t:0});say(mode==='plank'?'Whoops! One step further…':'Oh no! A balloon popped!');if(wrong>=MAXW){won=2;if(mode==='plank'){splashT=.01;demoPlankDone=1;speak('Splash! The word was '+word);say('Splash! 🛟 Hee hee — the word was '+word)}else{speak('Giggle! The word was '+word);say('Sunny giggles! The word was '+word)}}}}
function update(dt){msgT-=dt;popping.forEach(p=>p.t+=dt);popping=popping.filter(p=>p.t<1.2);if(won===1&&mode==='balloon')floatY=Math.min(220,floatY+80*dt);if(splashT>0)splashT+=dt}
function balloon(X,Y,col,pop){if(pop){const k=Math.min(1,pop);x.globalAlpha=1-k;for(let i=0;i<6;i++){const a=i/6*6.28+k*2;x.fillStyle=col;x.beginPath();x.arc(X+Math.cos(a)*40*k,Y+Math.sin(a)*30*k-10,6-k*4,0,7);x.fill()}x.globalAlpha=1;return}
 x.save();x.translate(X,Y+Math.sin(t*3+X)*.015*40);x.fillStyle=col;x.beginPath();x.ellipse(0,-28,22,28,0,0,7);x.fill();x.fillStyle='#fff8';x.beginPath();x.ellipse(-7,-38,6,8,0,0,7);x.fill();x.strokeStyle='#888';x.lineWidth=1.5;x.beginPath();x.moveTo(0,0);x.lineTo(0,36);x.stroke();x.restore()}
function drawBalloons(alive,cx,cy){const cols=['#ff6fae','#4ab0e8','#ffd24a','#3ac060','#b06aff','#ff8a3d'];const pos=[[-50,-90],[-20,-110],[20,-110],[50,-90],[-35,-70],[35,-70]];
 for(let i=0;i<6;i++){const p=popping.find(pp=>pp.i===i);if(i>=alive){if(p)balloon(cx+pos[i][0],cy+pos[i][1],cols[i],p.t);continue}
  balloon(cx+pos[i][0],cy+pos[i][1]-floatY,cols[i],0)}}
function drawSunnyBalloon(){const cy=280-floatY;drawBalloons(MAXW-wrong,450,cy);seal(450,cy+(won===2?10:0),1.1,won===1?'wave':won===2?'':'wave');if(won===2)bubbleK('Hee hee! Try again ❤️',520,cy-40,200)}
function drawShip(){// sea + sky
 kbg('#87ceeb','#b8e0ff');x.fillStyle='#3ab0e8';x.fillRect(0,380,900,220);x.fillStyle='#2a9fd0';for(let i=0;i<12;i++){x.beginPath();x.ellipse((i*90+t*40)%960-40,400+(i%3)*18,40,10,0,0,7);x.fill()}
 // deck
 x.fillStyle='#8b5a2b';rr(80,300,520,90,8);x.fill();x.fillStyle='#6e4520';for(let i=0;i<8;i++){x.fillRect(90+i*60,305,4,80)}
 // mast + sail
 x.fillStyle='#5a3a1a';x.fillRect(220,80,14,230);x.fillStyle='#fff8e8';x.beginPath();x.moveTo(234,100);x.lineTo(340,180);x.lineTo(234,260);x.fill();x.strokeStyle='#d8c8a0';x.stroke();
 // plank
 const steps=wrong;const plankLen=280;x.fillStyle='#c8a060';x.save();x.translate(580,330);x.rotate(-.08);rr(0,-10,plankLen,22,4);x.fill();x.strokeStyle='#8a6830';x.lineWidth=2;x.stroke();
 for(let i=0;i<MAXW;i++){x.fillStyle=i<steps?'#ff6fae':'#fff6';x.beginPath();x.arc(30+i*40,0,6,0,7);x.fill()}x.restore();
 // pirate Sunny position along plank
 const px=580+30+Math.min(steps,MAXW-1)*40*Math.cos(.08);const py=330+30+Math.min(steps,MAXW-1)*40*Math.sin(.08)-(won===1?40:0);
 if(won===2&&splashT>.3){// splash + rubber ring
  x.fillStyle='#fff';for(let i=0;i<10;i++){const a=i/10*6.28;x.beginPath();x.arc(780+Math.cos(a)*30*(1+Math.sin(splashT*6)*.3),420+Math.sin(a)*12,6,0,7);x.fill()}
  x.fillStyle='#ff4f4f';x.beginPath();x.ellipse(780,440,48,18,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(780,440,22,8,0,0,7);x.fill();
  seal(780,420+Math.sin(splashT*4)*6,0.85,'wave');emo('🎩',780,370,36);bubbleK('Hee hee! That was fun! 🛟',560,360,240)}
 else{seal(px,py,0.95,won===1?'wave':'');emo('🎩',px+8,py-70,40);if(won===1){emo('💎',px+60,py-40,40);emo('👑',px-50,py-50,36)}}}
function drawKeyboard(){const rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];const y0=430;rows.forEach((row,ri)=>{const tw=ri===2?54:52;const total=row.length*tw;const x0=450-total/2;row.split('').forEach((ch,ci)=>{const used=!!guessed[ch];const ok=used&&word.indexOf(ch)>=0;const bad=used&&!ok;const X=x0+ci*tw,Y=y0+ri*52;
  kb('k'+ch,X,Y,tw-6,46,ch,()=>{if(!used&&!won)guess(ch)},{bg:ok?'#3ac060':bad?'#ff6a6a':used?'#ccc':'#fff',fg:used&&!ok&&!bad?'#888':'#2a3a5a',fs:22,dis:!!won})})})}
function drawSlots(){const n=word.length;const sw=Math.min(70,700/n);letters().forEach((ch,i)=>{const X=450-n*sw/2+i*sw+sw/2;x.fillStyle='#fff';rr(X-sw/2+4,150,sw-8,70,12);x.fill();x.strokeStyle='#ff6fae';x.lineWidth=3;x.stroke();T(guessed[ch]?ch:'',X,200,40,'#2a3a5a','center')})}
function drawPlay(){if(mode==='plank')drawShip();else{kbg('#ffe58a','#cfefff');drawSunnyBalloon()}
 starBar(S);T(mode==='plank'?'Walk the Plank ☠️':'🎈 '+(CATS[cat]?CATS[cat][0]:'Word'),450,36,26,mode==='plank'?'#5a3a1a':'#ff4f9a','center');
 drawSlots();
 if(msgT>0)bubbleK(msg,mode==='plank'?40:30,70,280);
 kb('hint',740,70,140,50,'💡 Hint',()=>{speak(hint);say(hint)},{bg:'#b06aff',fs:20});
 if(!won)drawKeyboard();
 else{x.fillStyle='#fffd';rr(180,420,540,150,24);x.fill();T(won===1?(mode==='plank'?'Treasure ahoy! 💎':'You saved Sunny! 🎈'):(mode==='plank'?'Splash! Try again 🛟':'Sunny giggles! 🦭'),450,460,32,won===1?'#3ac060':'#ff7a00','center');
  T('The word was '+word+'  '+emoji,450,500,24,'#2a3a5a','center');
  kb('again',220,530,200,55,'🔁 Again',()=>{if(mode==='plank')startPlank();else startBalloon(cat)},{bg:'#ff6fae'});
  kb('menu',480,530,200,55,'🏠 Modes',()=>{G.state='menu'},{bg:'#4ab0e8'})}
 kb('back',20,20,120,44,'⬅ Back',()=>{G.state='menu'},{bg:'#4ab0e8',fs:18})}
function drawMenu(){kbg('#ffe6f2','#d6f0ff');starBar(S);T('Pick a game',450,60,40,'#ff4f9a','center');
 // Balloon mode card
 x.fillStyle='#fff';rr(40,100,400,300,24);x.fill();x.strokeStyle='#ff6fae';x.lineWidth=4;x.stroke();
 T('🎈 Balloon Word Guess',240,140,24,'#ff4f9a','center');seal(140,240,.7,'wave');drawBalloons(6,280,220);T('Sunny holds 6 balloons.',240,318,16,'#2a3a5a','center');T('Guess letters — wrong ones pop!',240,340,16,'#2a3a5a','center');
 kb('bal',90,360,300,50,'🎈 Play Balloons',()=>{G.state='cats'},{bg:'#ff6fae',fs:22});
 // Plank mode card
 x.fillStyle='#fff';rr(460,100,400,300,24);x.fill();x.strokeStyle='#8b5a2b';x.lineWidth=4;x.stroke();
 T('☠️ Walk the Plank',660,140,24,'#8b5a2b','center');seal(560,250,.65,'wave');emo('🎩',568,195,34);emo('⛵',760,230,60);T('Pirate Sunny walks the plank.',660,318,16,'#2a3a5a','center');T('Guess the word — find treasure!',660,340,16,'#2a3a5a','center');
 const plankLock=DEMO&&demoPlankDone;kb('plk',510,360,300,50,plankLock?'🔒 More in full game':'☠️ Walk the Plank',()=>{if(plankLock){window.demoEnd&&window.demoEnd('The full game has endless Walk the Plank pirate words, all 4 balloon categories and the sticker book!');return}startPlank()},{bg:plankLock?'#aaa':'#8b5a2b',fs:20});
 kb('stk',250,440,200,55,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});kb('home',470,440,180,55,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawCats(){kbg('#fff3c4','#d6f0ff');starBar(S);T('Choose a category',450,60,36,'#ff4f9a','center');
 CATS.forEach((c,i)=>{const lock=DEMO&&i>0;kb('c'+i,200,100+i*90,500,74,(lock?'🔒 ':'')+c[1]+' '+c[0],()=>{startBalloon(i)},{bg:c[2],fs:28});if(S.won['balloon'+i])T('⭐ '+S.won['balloon'+i],740,145+i*90,22,'#ff7a00','left')});
 kb('bk',350,480,200,60,'⬅ Modes',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#ffe58a','#cfefff');T('Coffeebreak Kids',450,70,32,'#ff4f9a','center');T('Balloon Word Guess',450,130,52,'#fff','center');T('& Walk the Plank',450,180,34,'#8b5a2b','center');
 drawBalloons(6,300,300);seal(300,300,1,'wave');emo('⛵',650,280,90);seal(700,340,.7,'wave');emo('🎩',708,290,32);
 kb('go',300,470,300,70,'🎈 Let\'s play!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28});
 kb('stk2',700,20,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='cats')drawCats();else if(s==='play')drawPlay();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
bindInput({down(){}});startLoop();window.KH={G,S,guess,startBalloon,startPlank,get word(){return word},get wrong(){return wrong},get mode(){return mode},setWord(w,h,e){word=w;hint=h||'';emoji=e||'🔤';guessed={};wrong=0;won=0}};
