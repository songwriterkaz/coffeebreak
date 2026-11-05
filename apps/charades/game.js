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
// ===== Coffeebreak Charades =====
const DEMO=!!window.DEMO,SK=DEMO?'charDemo':'charSave';
let S={games:0,best:0,teams:['Team Sunshine','Team Thunder'],secs:60,rounds:3};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const CAT={'Animals':['🐾','kangaroo,penguin,elephant,monkey,snake,giraffe,crab,octopus,kookaburra,flamingo,koala,sloth,frog,eagle,jellyfish,platypus,chicken,shark,bat,wombat'],
'Actions':['🏃','brushing teeth,juggling,surfing,ice skating,baking a cake,changing a nappy,walking a dog,mowing the lawn,taking a selfie,fishing,climbing a ladder,blowing bubbles,doing yoga,washing a car,parallel parking,sneezing,skipping rope,riding a horse,painting a wall,hanging washing'],
'Jobs':['👷','firefighter,dentist,lifeguard,chef,pilot,magician,librarian,plumber,astronaut,farmer,hairdresser,referee,photographer,mail carrier,scientist,zookeeper,builder,DJ,surgeon,ballet dancer'],
'Sports':['⚽','cricket,swimming,tennis,boxing,archery,golf,basketball,rowing,surfing,skiing,netball,weightlifting,fencing,bowling,gymnastics,rugby,cycling,diving,table tennis,skateboarding'],
'Fairy Tales':['🏰','Cinderella,Little Red Riding Hood,Jack and the Beanstalk,The Three Little Pigs,Sleeping Beauty,Rapunzel,Goldilocks,The Frog Prince,Hansel and Gretel,The Ugly Duckling,Snow White,The Tortoise and the Hare,Pinocchio,The Gingerbread Man,Rumpelstiltskin'],
'Everyday Things':['🏠','umbrella,toaster,vacuum cleaner,washing machine,toothbrush,ladder,scissors,remote control,hairdryer,stapler,alarm clock,trampoline,wheelbarrow,camera,kettle,lawn mower,mirror,zipper,sunglasses,shopping trolley'],
'Feelings':['😮','embarrassed,jealous,bored,excited,terrified,proud,confused,grumpy,in love,exhausted,nervous,surprised,disgusted,sleepy,heartbroken'],
'At the Beach':['🏖️','building a sandcastle,sunburn,stepping on a crab,seagull stealing chips,getting dumped by a wave,applying sunscreen,boogie boarding,eating a melting ice cream,snorkelling,beach volleyball,shaking sand out of a towel,lifeguard rescue']};
const CK=Object.keys(CAT),TC=['#ff6f91','#4ab0ff','#4ad6a0','#ffc75f'];
let sel=new Set(['Animals','Actions']),nt=2,sc=[0,0,0,0],turn=0,round=1,deck=[],word='',time=0,got=[],skp=[],phase='ready';
function build(){deck=[];sel.forEach(k=>CAT[k][1].split(',').forEach(w=>deck.push([w,k])));deck.sort(()=>Math.random()-.5)}
function draw1(){if(!deck.length)build();const d=deck.pop();word=d[0];wcat=d[1]}let wcat='';
function newGame(){if(!sel.size)return;sc=[0,0,0,0];turn=0;round=1;build();phase='ready';G.state='play';S.games++;save()}
function go(){phase='act';time=S.secs;got=[];skp=[];draw1();beep(660)}
function hit(ok){if(phase!=='act')return;(ok?got:skp).push(word);if(ok){sc[turn]++;beep(880)}else beep(300);draw1()}
function endTurn(){phase='sum';beep(220,.5)}
function nextTurn(){turn++;if(turn>=nt){turn=0;round++}if(round>(DEMO?1:S.rounds)){G.state='over';const m=Math.max(...sc.slice(0,nt));S.best=Math.max(S.best,m);G.score=m;save();if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('What a performance! The full version has all 8 categories (150+ prompts), up to 4 teams, custom timers and rounds.'),2500);return}phase='ready'}
function beep(f,d){try{const A=window._AC=window._AC||new AudioContext(),o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.setValueAtTime(.06,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+(d||.15));o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+(d||.15))}catch(e){}}
function bgC(){const g=x.createLinearGradient(0,0,900,600);g.addColorStop(0,'#2a1050');g.addColorStop(1,'#10204a');x.fillStyle=g;x.fillRect(0,0,900,600);for(let i=0;i<20;i++){x.fillStyle='rgba(255,255,255,.05)';x.beginPath();x.arc((i*173)%900,(i*91+t*10)%600,30+i%5*10,0,7);x.fill()}}
function scores(){for(let i=0;i<nt;i++){x.fillStyle=TC[i];rr(20+i*215,14,205,40,12);x.fill();T(S.teams[i]||('Team '+(i+1)),34+i*215,40,16,'#1a1a2a');T(String(sc[i]),210+i*215,41,22,'#1a1a2a','right')}}
function drawSetup(){bgC();T('Game set-up',450,50,32,'#ffc75f','center');T('Categories',60,92,18,'#fff');
 CK.forEach((k,i)=>{const lk=DEMO&&i>1;button('c'+i,60+(i%4)*200,104+Math.floor(i/4)*52,190,44,(lk?'🔒 ':CAT[k][0]+' ')+k,()=>{if(lk)return window.demoEnd&&window.demoEnd('All 8 categories are in the full version!');sel.has(k)?sel.delete(k):sel.add(k)},{sel:sel.has(k),bg:'#2a1a4a',ac:'#ffc75f',fs:15})});
 T('Teams',60,240,18,'#fff');[2,3,4].forEach(n=>button('n'+n,140+(n-2)*80,218,70,34,n+'',()=>{if(DEMO&&n>2)return window.demoEnd&&window.demoEnd('Play with up to 4 teams in the full version!');nt=n},{sel:nt===n,bg:'#2a1a4a',ac:'#4ad6a0'}));
 T('Timer',420,240,18,'#fff');[30,60,90].forEach((s,i)=>button('s'+s,490+i*80,218,70,34,s+'s',()=>{S.secs=s;save()},{sel:S.secs===s,bg:'#2a1a4a',ac:'#4ab0ff'}));
 T('Rounds',60,300,18,'#fff');[1,3,5].forEach((r,i)=>button('r'+r,140+i*80,278,70,34,r+'',()=>{S.rounds=r;save()},{sel:S.rounds===r,bg:'#2a1a4a',ac:'#ff6f91',dis:DEMO}));
 T('Team names (tap to rename)',60,360,18,'#fff');for(let i=0;i<nt;i++)button('tn'+i,60+i*200,372,190,40,S.teams[i]||'Team '+(i+1),()=>{const v=prompt('Team name',S.teams[i]||'');if(v){S.teams[i]=v.slice(0,16);save()}},{bg:TC[i],fg:'#1a1a2a',ac:'#fff',fs:15});
 T('How to play: the actor sees the word and acts it out, no talking! Team mates shout guesses.',450,460,15,'#cfc8ff','center','');button('go',330,490,240,60,'🎬 Start game',newGame,{bg:'#ff3a7a',ac:'#fff',fs:22,dis:!sel.size})}
function drawPlay(){bgC();scores();T('Round '+round+'/'+(DEMO?1:S.rounds),830,80,15,'#cfc8ff','right','');const tc=TC[turn];
 if(phase==='ready'){T(S.teams[turn]+', your turn!',450,200,40,tc,'center');T('Pass the device to your actor. No peeking, team!',450,250,18,'#fff','center','');button('go',330,320,240,80,'▶ I\'m the actor',go,{bg:tc,fg:'#1a1a2a',ac:'#fff',fs:24})}
 else if(phase==='act'){const k=time/S.secs;x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=14;x.beginPath();x.arc(450,170,70,0,7);x.stroke();x.strokeStyle=time<10?'#ff3a3a':tc;x.beginPath();x.arc(450,170,70,-Math.PI/2,-Math.PI/2+k*Math.PI*2);x.stroke();T(Math.ceil(time)+'',450,186,48,'#fff','center');
  T(CAT[wcat][0]+' '+wcat,450,280,18,'#cfc8ff','center','');x.fillStyle='#fff';rr(150,295,600,110,20);x.fill();T(word,450,368,word.length>18?36:48,'#1a1a2a','center');
  button('skip',150,430,280,80,'⏭ Skip',()=>hit(0),{bg:'#5a3a6a',ac:'#ff6f91',fs:26});button('got',470,430,280,80,'✅ Got it!',()=>hit(1),{bg:'#2a7a4a',ac:'#4ad6a0',fs:26})}
 else{T('Time\'s up!',450,120,44,tc,'center');T(S.teams[turn]+' scored '+got.length,450,165,24,'#fff','center');T('✅ '+(got.join(', ')||'—'),450,215,16,'#9affc0','center','');T('⏭ '+(skp.join(', ')||'—'),450,245,16,'#ffb0c0','center','');button('nx',330,300,240,64,'Next team ▶',nextTurn,{bg:'#ff3a7a',ac:'#fff',fs:22})}}
function drawOver(){bgC();const m=Math.max(...sc.slice(0,nt)),w=sc.slice(0,nt).map((v,i)=>v===m?i:-1).filter(i=>i>=0);T('🏆',450,150,80,'#fff','center');T(w.length>1?'It\'s a tie!':S.teams[w[0]]+' wins!',450,240,44,TC[w[0]],'center');
 for(let i=0;i<nt;i++)T(S.teams[i]+': '+sc[i],450,290+i*32,22,'#fff','center','');button('again',230,460,200,56,'🔁 Rematch',newGame,{bg:'#ff3a7a',ac:'#fff'});button('set',470,460,200,56,'⚙️ Set-up',()=>{G.state='setup'},{bg:'#2a1a4a',ac:'#ffc75f'})}
function drawTitle(){bgC();T('Coffeebreak',450,140,30,'#ffc75f','center');T('Charades',450,230,90,'#fff','center');['🤫','🎭','⏱️','🏆','🙌'].forEach((e,i)=>emo(e,250+i*100,310+Math.sin(t*3+i)*10,52));T('Act it out. No talking. Beat the clock.',450,390,20,'#cfc8ff','center','italic ');button('go',350,430,200,60,'🎬 Play',()=>{G.state='setup'},{bg:'#ff3a7a',ac:'#fff',fs:22})}
bindInput({});function update(dt){if(G.state==='play'&&phase==='act'){const p=time;time-=dt;if(Math.ceil(time)!==Math.ceil(p)&&time<5&&time>0)beep(500,.08);if(time<=0)endTurn()}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='setup')drawSetup();else if(s==='play')drawPlay();else drawOver()}
window.CH={G,S,newGame,go,hit,endTurn,nextTurn,get phase(){return phase}};startLoop();
