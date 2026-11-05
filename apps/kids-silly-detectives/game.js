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
// ===== Coffeebreak Kids: Silly Detectives =====
const S=kStore('kidsDetective',{solved:[]});const G={state:'title',score:S.stars,level:0};window.G=G;
const TR={tall:'is really tall',short:'is little',sticky:'has sticky fingers',glasses:'wears glasses',paint:'loves painting',boots:'wears boots',flippers:'has flippers',feathers:'has feathers',high:'can get up really high',nest:'builds nests',fur:'is fluffy',keys:'carries keys',giggles:'giggles a lot',paws:'has paws',mud:'loves mud',big:'has big feet',small:'has tiny feet',tail:'has a long tail',webbed:'has webbed feet',mint:'smells minty',glitter:'loves glitter',tiny:'is teeny tiny'};
// sus:[name,emoji,line,traits]  clues:[emoji,text,trait,x,y]
const M=[
{t:'Who Ate the Birthday Cake?',bg:['#ffe0f0','#ffc0d8'],props:['🎂',190,330,'🎈',720,180,'🎁',620,400],story:'It\'s Mia\'s birthday! But someone has eaten HALF the cake before the party. Gasp!',
 sus:[['Grandpa Gus','👴','"Me? I was doing my crossword. I\'m tall, so I can reach the top shelf for my glasses."',['tall','glasses']],['Penny the Puppy','🐶','"Woof! I\'m only little. I was chasing my tail all morning!"',['short','paws']],['Little Leo','🧒','"I was eating honey toast. My fingers are STILL sticky. I can\'t reach anything high though."',['short','sticky']],['Auntie Flo','👩‍🦰','"Cake? What cake? *wipes chocolate off her glasses* I\'m tall and I love toast with jam."',['tall','sticky','glasses']]],
 clues:[['🍫','Chocolate fingerprints! The culprit has sticky fingers.','sticky',330,220],['🪜','Icing smudge on the TOP shelf. The culprit is really tall.','tall',560,120],['👓','A chocolatey smudge on a glasses-cleaning cloth. The culprit wears glasses.','glasses',780,470]],
 cul:3,rev:'It was Auntie Flo! She only meant to taste ONE crumb... then another... then 47 more. She baked Mia a brand new cake to say sorry!'},
{t:'Who Painted the Cat Blue?',bg:['#e0f0ff','#b8dcff'],props:['🐈',450,360,'🖼️',150,170,'🪴',780,380],story:'Whiskers the cat was orange this morning. Now he is BRIGHT BLUE! Who did it?',
 sus:[['Artist Archie','🧑‍🎨','"I paint every day! But I never wear boots, they squeak. And I\'m super tall."',['paint','tall']],['Twin Tilly','👧','"I love painting with my blue paint! I\'m little and I wear my rain boots everywhere."',['paint','short','boots']],['Plumber Pete','👨‍🔧','"I just fixed the tap. Big work boots, big tall me. I can\'t paint a stick figure!"',['boots','tall']],['Sunny the Seal','🦭','"Arf arf! I\'m little and I have flippers. Flippers can\'t hold paintbrushes!"',['short','flippers']]],
 clues:[['🎨','Blue paint drips! The culprit loves painting.','paint',300,250],['👢','Little boot prints in the hallway. The culprit wears boots.','boots',620,500],['🖌️','A paintbrush hidden under the LOW table. The culprit is little.','short',800,250]],
 cul:1,rev:'It was Twin Tilly! She wanted Whiskers to match her new blue dress. Good news: it was washable paint, and Whiskers loved his bubble bath!'},
{t:'Where Did the Teacher\'s Wig Go?',bg:['#e8ffe0','#c0eab0'],props:['🌳',760,260,'🏫',170,240,'✏️',450,480],story:'Mr Baldwin hung his curly wig on the coat hook at lunch. Now it\'s GONE!',
 sus:[['Coco the Cockatoo','🦜','"Squawk! I\'ve got lovely feathers. I fly up high and build the comfiest nests!"',['feathers','high','nest']],['Kenny Koala','🐨','"I\'m fluffy, mate. I climb up high in my tree and snooze. No nests for me."',['fur','high']],['Janitor Joe','🧑‍🔧','"I carry a hundred keys and I\'m tall. Wigs aren\'t my department."',['keys','tall']],['Giggly Kev','🧒','"Hee hee! I use a feather pen! Hee! But I\'m scared of heights. Hee hee!"',['giggles','feathers']]],
 clues:[['🪶','A bright feather on the coat hook. The culprit has feathers.','feathers',260,330],['🔭','The wig was spotted at the top of the gum tree! The culprit can get up high.','high',700,120],['🪺','Twigs woven into the curls. The culprit builds nests.','nest',520,280]],
 cul:0,rev:'It was Coco the Cockatoo! The wig made the softest, curliest nest ever. Mr Baldwin bought Coco her own fluffy cushion and got his wig back.'},
{t:'Who Left the Muddy Pawprints?',bg:['#fff4e0','#f0d8b0'],props:['🛋️',450,330,'🥕',160,450,'🦴',760,200],story:'Mum just cleaned the floor. Now there are muddy pawprints all over the couch!',
 sus:[['Rex the Dog','🐕','"I have big paws and I LOVE rolling in mud! But I was being a very good boy. Mostly."',['paws','mud','big']],['Mittens the Cat','🐈','"I have dainty paws and tiny feet. Mud? Ew. I would never."',['paws','small']],['Kylie Kangaroo','🦘','"G\'day! Big feet and a long tail, that\'s me. I hopped straight past."',['big','tail']],['Dot the Duck','🦆','"Quack! I love a muddy puddle, but I have webbed feet, not paws!"',['webbed','mud']]],
 clues:[['🐾','Pawprints! The culprit has paws.','paws',300,470],['🟤','Squishy mud blobs. The culprit loves mud.','mud',620,430],['📏','The prints are HUGE. The culprit has big feet.','big',820,330]],
 cul:0,rev:'It was Rex! He dug up his bone in the veggie patch, then did zoomies all over the couch. He helped clean up (by licking everything).'},
{t:'Who Squeezed All the Toothpaste?',bg:['#e0fff8','#b0eee0'],props:['🪥',200,250,'🛁',700,420,'🪞',450,150],story:'The whole tube of toothpaste is squeezed out all over the bathroom sink! Who did it?',
 sus:[['Dad','👨','"I\'m tall and minty fresh. I brush twice a day, but one squeeze only!"',['tall','mint']],['Baby Bea','👶','"Goo goo! *giggles* I\'m little!"',['short','giggles']],['Sister Sam','👧','"I\'m little, I smell minty, and I put glitter on EVERYTHING."',['short','mint','glitter']],['Hammy the Hamster','🐹','"Squeak! I am teeny tiny and little. Toothpaste is too heavy!"',['tiny','short']]],
 clues:[['🌿','A super minty smell. The culprit smells minty.','mint',300,400],['🪜','The step stool was moved to the sink. The culprit is little.','short',560,480],['✨','Glitter on the tap! The culprit loves glitter.','glitter',800,250]],
 cul:2,rev:'It was Sister Sam! She was making sparkly toothpaste snowmen. They were very pretty, but now she uses just a pea-sized blob.'}];
const N=DEMO?1:M.length;
let mi=0,found=[],talked=[],ticked=[],mag={x:450,y:300},msg='',msgT=0,wrong=null,lastClue=null;
function startM(i){mi=i;found=[];talked=[];ticked=[];lastClue=null;G.state='intro';speak(M[i].story)}
function toast(m){msg=m;msgT=3}
function accuse(i){const m=M[mi];if(found.length<3){toast('Find all 3 clues first! 🔍');oops();return}if(i===m.cul){if(!S.solved.includes(mi)){S.solved.push(mi);reward(S,3,'Case solved!')}else reward(S,1,'Solved again!');G.level=S.solved.length;G.state='reveal';speak(m.rev)}else{wrong=i;oops();toast(m.sus[i][0]+': "Not me! Check the clues!" 😜');speak('Not me! Check the clues!');if(!ticked.includes(i))ticked.push(i)}}
function drawTitle(){kbg('#d8e8ff','#fff3c4');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('Silly Detectives',454,174,64,'#ff5a9a','center');T('Silly Detectives',450,170,64,'#fff','center');x.save();x.translate(250,320);x.rotate(Math.sin(t*2)*.2);emo('🔍',0,0,110);x.restore();seal(560,320,1,'wave');emo('🕵️',640,260,50);kb('go',320,450,260,70,'🔍 Solve a mystery!',()=>{G.state='menu'},{fs:24})}
function drawMenu(){kbg('#d8e8ff','#fff3c4');starBar(S);T('Pick a mystery',450,70,38,'#3a7ad8','center');
 M.forEach((m,i)=>{const lock=i>=N;kb('m'+i,150,100+i*82,600,68,(S.solved.includes(i)?'✅ ':lock?'🔒 ':'❓ ')+m.t,()=>{if(lock){window.demoEnd&&window.demoEnd('Great detective work! The full game has 5 silly mysteries to solve and the full sticker book.');return}startM(i)},{bg:lock?'#a0a8c0':['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i],fs:22})});
 kb('stk',700,15,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
function drawIntro(){const m=M[mi];kbg(m.bg[0],m.bg[1]);T(m.t,450,80,38,'#ff4f9a','center');seal(200,330,1.1,'wave');T('Detective Sunny',200,440,18,'#2a3a5a','center');bubbleK(m.story,340,200,480);kb('go',330,480,240,68,'🔍 Investigate!',()=>{G.state='scene'},{bg:'#3ac060'})}
function drawScene(){const m=M[mi];kbg(m.bg[0],m.bg[1]);for(let i=0;i<m.props.length;i+=3)emo(m.props[i],m.props[i+1],m.props[i+2],110);
 m.clues.forEach((c,i)=>{if(found.includes(i)){emo(c[0],c[3],c[4],44);emo('✅',c[3]+24,c[4]-24,22);return}const d=Math.hypot(mag.x-c[3],mag.y-c[4]);x.globalAlpha=d<80?1:.07;emo(c[0],c[3],c[4],44);x.globalAlpha=1;if(d<80){x.strokeStyle='#ffd24a';x.lineWidth=4;x.beginPath();x.arc(c[3],c[4],34+Math.sin(t*8)*4,0,7);x.stroke()}});
 x.strokeStyle='#5a3a1a';x.lineWidth=10;x.beginPath();x.moveTo(mag.x+42,mag.y+42);x.lineTo(mag.x+80,mag.y+80);x.stroke();x.strokeStyle='#ffd24a';x.lineWidth=7;x.fillStyle='rgba(200,240,255,.25)';x.beginPath();x.arc(mag.x,mag.y,58,0,7);x.fill();x.stroke();
 x.fillStyle='rgba(255,255,255,.9)';rr(14,10,520,44,20);x.fill();T('🔍 Move the magnifying glass. Clues: '+found.length+'/3',30,40,19,'#2a3a5a');
 if(lastClue!==null){x.fillStyle='rgba(255,255,255,.95)';rr(120,500,660,70,18);x.fill();x.fillStyle='#2a3a5a';x.font='bold 18px '+KF;wrapT(m.clues[lastClue][1],140,530,620,22)}
 kb('sus',560,62,200,50,'🧑‍🤝‍🧑 Suspects',()=>{G.state='board'},{bg:'#4ab0e8',fs:20});kb('bk',770,62,120,50,'⬅',()=>{G.state='menu'},{bg:'#a0a8c0'})}
function drawBoard(){const m=M[mi];kbg('#fff3c4','#ffe0b0');T('Suspect Board',450,48,34,'#ff4f9a','center');
 x.fillStyle='rgba(255,255,255,.85)';rr(20,62,860,48,14);x.fill();x.fillStyle='#2a3a5a';x.font='bold 15px '+KF;wrapT('Clues: '+(found.length?found.map(i=>m.clues[i][0]+' '+TR[m.clues[i][2]]).join('  ·  '):'none yet, go investigate!'),34,84,830,18);
 m.sus.forEach((s,i)=>{const X=20+i*220,Y=120;x.fillStyle=ticked.includes(i)?'#e0e0e0':'#fff';rr(X,Y,205,380,18);x.fill();x.strokeStyle=wrong===i?'#ff4f4f':'#4ab0e8';x.lineWidth=3;x.stroke();emo(s[1],X+102,Y+60,70);T(s[0],X+102,Y+125,17,'#2a3a5a','center');
  if(talked.includes(i)){x.fillStyle='#5a4a7a';x.font='14px '+KF;let yy=Y+150;s[3].forEach(tr=>{x.fillText('• '+TR[tr],X+12,yy);yy+=20})}else T('Tap 💬 to talk',X+102,Y+160,14,'#999','center','');
  if(ticked.includes(i)){x.strokeStyle='rgba(255,60,60,.8)';x.lineWidth=10;x.beginPath();x.moveTo(X+20,Y+20);x.lineTo(X+185,Y+360);x.moveTo(X+185,Y+20);x.lineTo(X+20,Y+360);x.stroke()}
  kb('t'+i,X+10,Y+250,90,50,'💬',()=>{if(!talked.includes(i))talked.push(i);toast(s[0]+': '+s[2].slice(0,60)+'…');speak(s[2].replace(/\*[^*]*\*/g,''))},{bg:'#3ac060'});
  kb('x'+i,X+105,Y+250,90,50,'✖',()=>{ticked.includes(i)?ticked.splice(ticked.indexOf(i),1):ticked.push(i)},{bg:'#a0a8c0'});
  kb('a'+i,X+10,Y+310,185,56,'👉 It was you!',()=>accuse(i),{bg:'#ff6fae',fs:18,dis:found.length<3})});
 kb('sc',330,520,240,60,'🔍 Back to clues',()=>{G.state='scene'},{bg:'#4ab0e8',fs:20})}
function drawReveal(){const m=M[mi],s=m.sus[m.cul];kbg('#ffe0f0','#fff3c4');T('🎉 Mystery solved! 🎉',450,70,40,'#ff4f9a','center');x.save();x.translate(250,280);x.rotate(Math.sin(t*4)*.15);emo(s[1],0,0,150);x.restore();T(s[0],250,380,24,'#2a3a5a','center');bubbleK(m.rev,420,170,440);
 kb('nx',300,470,300,68,DEMO?'⭐ Finish':'📂 Next mystery',()=>{if(DEMO){window.demoEnd&&window.demoEnd('Great detective work! The full game has 5 silly mysteries to solve and the full sticker book.');return}G.state='menu'},{bg:'#3ac060'})}
bindInput({down(p){mag={x:p.x,y:p.y};chk()},move(p){mag={x:p.x,y:p.y};chk()}});
function chk(){if(G.state!=='scene')return;const m=M[mi];m.clues.forEach((c,i)=>{if(!found.includes(i)&&Math.hypot(mag.x-c[3],mag.y-c[4])<40){found.push(i);lastClue=i;kTone(880,.15,.06,'triangle');setTimeout(()=>kTone(1320,.2,.05,'triangle'),100);speak(c[1]);if(found.length===3)setTimeout(()=>toast('All clues found! Check the Suspect Board 🧑‍🤝‍🧑'),600)}})}
function update(dt){if(msgT>0)msgT-=dt}
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,menu:drawMenu,intro:drawIntro,scene:drawScene,board:drawBoard,reveal:drawReveal,stk:()=>stickerBook(S,()=>{G.state='menu'})})[s]();
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(100,530,700,56,20);x.fill();x.strokeStyle='#ff6fae';x.lineWidth=3;x.stroke();x.fillStyle='#2a3a5a';x.font='bold 17px '+KF;x.textAlign='center';x.fillText(msg.slice(0,80),450,564);x.textAlign='left';x.globalAlpha=1}kOverlay(1/60)}
window.KD={G,S,M,startM,accuse,get found(){return found},find:i=>{const c=M[mi].clues[i];mag={x:c[3],y:c[4]};chk()}};startLoop();
