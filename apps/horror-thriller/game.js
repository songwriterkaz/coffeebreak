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
// ---- Kaz: stylised canvas character (original) ----
function drawKaz(X,Y,s,o){o=o||{};const f=o.face||1,lean=o.lean||0,arm=o.arm===undefined?-0.3:o.arm,bob=Math.sin(t*3)*1.5*(o.still?0:1);
 x.save();x.translate(X,Y);x.scale(s*f,s);x.rotate(lean);
 // legs (light blue jeans)
 const st=o.stance||0;x.fillStyle='#8fb8e0';x.strokeStyle='#5d86b3';x.lineWidth=2;
 x.beginPath();x.moveTo(-14,-95);x.lineTo(-26-st*14,0);x.lineTo(-12-st*14,0);x.lineTo(-2,-80);x.lineTo(8,-80);x.lineTo(14+st*16,0);x.lineTo(28+st*16,0);x.lineTo(16,-95);x.closePath();x.fill();x.stroke();
 x.fillStyle='#2a2a33';x.fillRect(-30-st*14,-6,22,7);x.fillRect(12+st*16,-6,22,7);
 // midriff + pink crop top
 x.fillStyle='#f6d8c8';x.fillRect(-15,-112+bob,31,18);
 x.fillStyle='#ff8fc8';rr(-19,-160+bob,39,50,8);x.fill();x.fillStyle='#ffb3da';x.fillRect(-15,-150+bob,6,30);
 // chain handbag (silver) on hip
 x.strokeStyle='#d8dde6';x.lineWidth=2;x.setLineDash([3,2]);x.beginPath();x.moveTo(-14,-158+bob);x.lineTo(-24,-100+bob);x.stroke();x.setLineDash([]);
 x.fillStyle='#c9ced8';rr(-34,-104+bob,22,16,4);x.fill();x.fillStyle='#fff';x.fillRect(-30,-100+bob,4,4);
 // back arm
 x.strokeStyle='#f6d8c8';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(-14,-150+bob);x.lineTo(-24,-122+bob);x.lineTo(-18,-104+bob);x.stroke();
 // neck & chest with gothic lace tattoo
 x.fillStyle='#f6d8c8';x.fillRect(-6,-176+bob,12,18);x.beginPath();x.moveTo(-16,-162+bob);x.lineTo(17,-162+bob);x.lineTo(10,-156+bob);x.lineTo(-10,-156+bob);x.fill();
 x.strokeStyle='#4a4a52';x.lineWidth=1;for(let i=-12;i<=12;i+=4){x.beginPath();x.arc(i,-160+bob,2.2,0,Math.PI);x.stroke()}x.beginPath();x.moveTo(-5,-174+bob);x.quadraticCurveTo(0,-166+bob,5,-174+bob);x.stroke();x.beginPath();x.arc(0,-168+bob,1.6,0,7);x.stroke();
 // head
 x.fillStyle='#f8e0d2';x.beginPath();x.ellipse(0,-196+bob,17,21,0,0,7);x.fill();
 // messy dark hair
 x.fillStyle='#1f1a1d';x.beginPath();x.moveTo(-20,-186+bob);for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;x.lineTo(Math.cos(a)*(22+(i%2)*5),-200+bob+Math.sin(a)*(24+(i%2)*4))}x.lineTo(22,-172+bob);x.lineTo(16,-190+bob);x.quadraticCurveTo(0,-212+bob,-14,-192+bob);x.lineTo(-22,-166+bob);x.closePath();x.fill();
 x.strokeStyle='#1f1a1d';x.lineWidth=2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-18+i*12,-218+bob);x.lineTo(-22+i*12+Math.sin(t*2+i)*2,-226+bob);x.stroke()}
 // butterfly clips orange, pink, blue
 [['#ff8a2a',-14,-214],['#ff5fb0',2,-221],['#3aa0ff',16,-210]].forEach(([col,bx,by])=>{x.fillStyle=col;x.beginPath();x.ellipse(bx-4,by+bob,4,3,-.5,0,7);x.ellipse(bx+4,by+bob,4,3,.5,0,7);x.fill();x.fillStyle='#222';x.fillRect(bx-1,by-3+bob,2,6)});
 // face: blue eyes, serious brows, glossy lips
 x.fillStyle='#fff';x.beginPath();x.ellipse(-6,-197+bob,4,3,0,0,7);x.ellipse(8,-197+bob,4,3,0,0,7);x.fill();
 x.fillStyle='#2f7fd6';x.beginPath();x.arc(-5,-197+bob,2.2,0,7);x.arc(9,-197+bob,2.2,0,7);x.fill();
 x.strokeStyle='#1f1a1d';x.lineWidth=2;x.beginPath();x.moveTo(-11,-204+bob);x.lineTo(-2,-202+bob);x.moveTo(4,-202+bob);x.lineTo(13,-204+bob);x.stroke();
 const sc=o.scared;x.fillStyle='#d8406a';x.beginPath();if(sc)x.ellipse(2,-182+bob,4,4,0,0,7);else x.ellipse(2,-183+bob,6,2.6,0,0,7);x.fill();
 x.fillStyle='#fff';x.globalAlpha=.6+.4*Math.sin(t*5);x.fillRect(1,-185+bob,3,1.3);x.globalAlpha=1;
 // front arm (+ optional sword/torch)
 x.save();x.translate(14,-150+bob);x.rotate(arm);x.strokeStyle='#f6d8c8';x.lineWidth=8;x.beginPath();x.moveTo(0,0);x.lineTo(30,0);x.stroke();
 if(o.sword){x.strokeStyle='#c9a646';x.lineWidth=3;x.beginPath();x.moveTo(30,-8);x.lineTo(30,8);x.stroke();x.strokeStyle='#e9eef5';x.lineWidth=2;x.beginPath();x.moveTo(32,0);x.lineTo(32+(o.blade||95),0);x.stroke()}
 if(o.torch){x.fillStyle='#444';x.fillRect(28,-4,16,8);x.fillStyle='#fff6b0';x.beginPath();x.arc(46,0,4,0,7);x.fill()}
 x.restore();
 // sparkles on lips
 if(Math.sin(t*4)>.7){x.fillStyle='#fff';x.font='8px serif';x.fillText('✦',8,-186+bob)}
 x.restore()}
// ===== Coffeebreak Horror Thriller =====
const DEMO=!!window.DEMO,SK=DEMO?'thrD':'thr';let S={endings:[],best:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};const G={state:'menu',score:0,level:0};window.G=G;
// scene key: [bg, chapter, text, choices[[label,next,clue,needClue]], scare]
const BG={gate:['#1a2420','#060a08','🏚️'],hall:['#2a1e18','#0a0605','🕯️'],stairs:['#241a22','#08050a','🪜'],nursery:['#2a2430','#0a080e','🧸'],lib:['#2a2214','#0a0804','📚'],cellar:['#141a1e','#030506','🕸️'],asylum:['#1e2424','#050808','🏥'],ward:['#202828','#060909','🛏️'],office:['#262018','#090705','🗄️'],chapel:['#1c1a28','#05040a','🔔'],roof:['#14182a','#04050c','🌕'],out:['#2a3a4a','#101820','🌅']};
const N={
 start:['gate',1,'Midnight. Kaz stands at the rusted gate of Hollowmere House. Her cousin Tess went in three days ago to film a "ghost vlog" and never came out. Her phone shows one bar.',[['Push the gate open','hall'],['Check the side path first','side']]],
 side:['gate',1,'Around the side, the grass is flattened in a long drag mark. A torn pink lanyard hangs on a bramble: TESS - CREW.',[['Take the lanyard','hall','Lanyard']]],
 hall:['hall',1,'The front hall smells of candle wax. A grandfather clock ticks, though its hands are missing. Upstairs, something heavy shifts.',[['Go up the stairs','stairs'],['Search the library','lib'],['Call out for Tess','call']]],
 call:['hall',1,'"TESS?" Silence. Then, from right behind Kaz, a whisper: "...she can\'t hear you."',[['Spin around!','hall2']],1],
 hall2:['hall',1,'Nothing there. Only wet footprints leading to the library, far too long to be human.',[['Follow the footprints','lib'],['Run upstairs instead','stairs']]],
 lib:['lib',1,'Dusty shelves. A diary lies open: "The Hollow Man walks when the clock has no hands. Light keeps him back. Never let him see your face."',[['Pocket the diary page','stairs','Diary page'],['Keep reading','lib2']]],
 lib2:['lib',1,'The next page is torn out. A cold draught flickers the candles out one by one...',[['Grab the diary and run','stairs','Diary page']],1],
 stairs:['stairs',1,'Every stair creaks. At the top, a door marked NURSERY is ajar. A music box is playing.',[['Enter the nursery','nursery']]],
 nursery:['nursery',1,'A rocking horse rocks on its own. On the wall, written in crayon: GO TO THE ASYLUM. TESS.',[['Find the way to the asylum','ch1end']]],
 ch1end:['nursery',1,'Through the cracked window, across the moors, Kaz sees the lights of St. Ashby\'s Asylum flicker on. Something tall and thin stands at the end of the corridor behind her...',[['Chapter 2 ▶','asylum']],1],
 asylum:['asylum',2,'Chapter 2: St. Ashby\'s. The doors open with a long groan. A reception bell rings once by itself. Two ways: the patient ward, or the doctor\'s office.',[['The patient ward','ward'],['The doctor\'s office','office']]],
 ward:['ward',2,'Rows of empty beds. One is warm. Under its pillow: Tess\'s camera. The last clip shows her hiding in the chapel.',[['Take the camera','chapel','Camera'],['Hide under the bed','hide']]],
 hide:['ward',2,'Footsteps. Long grey fingers drag along the bed frames... and stop beside Kaz. She holds her breath.',[['Stay perfectly still','ward2'],['Bolt for the door','caught']],1],
 ward2:['ward',2,'The footsteps move on. Kaz crawls out, heart hammering, and spots the camera.',[['Grab it and go','chapel','Camera']]],
 caught:['ward',2,'It turns. A face with no features, just a smooth grey blank. It tilts its head at her...',[['Remember the diary','escape1',null,'Diary page'],['Scream','end_lost']],1],
 escape1:['ward',2,'"Never let him see your face." Kaz throws her hood over her head and shuts her eyes. A cold breath... then nothing. It\'s gone.',[['Find the chapel','chapel']]],
 office:['office',2,'Patient files. One reads: SUBJECT H — "fed on fear, banished by light and a name spoken aloud." The name is smudged: "Ho...is Gr..."',[['Take the file','chapel','Patient file']]],
 chapel:['chapel',2,'The chapel bell hangs still. A trapdoor under the altar is scratched from the inside. Someone is tapping: three slow taps.',[['Open the trapdoor','ch2end']]],
 ch2end:['chapel',2,'Tess! Pale and shaking: "It follows the light... no, it HATES the light. The roof — the old signal lamp!" Behind them, every candle goes out.',[['Chapter 3 ▶','roof']],1],
 roof:['roof',3,'Chapter 3: The roof. Wind howls. The giant signal lamp is rusted. The Hollow Man climbs over the parapet, impossibly tall.',[['Fix the lamp','lamp'],['Use the camera flash','flash',null,'Camera'],['Speak its name','name',null,'Patient file']]],
 lamp:['roof',3,'Kaz yanks the lever. Sparks. Nothing. It\'s getting closer...',[['Kick the generator','end_dawn'],['Run with Tess','end_run']],1],
 flash:['roof',3,'FLASH! FLASH! It recoils, shrieking, giving Kaz time to hit the lamp switch.',[['Light it up!','end_dawn']]],
 name:['roof',3,'Kaz reads the file aloud, sounding it out: "HOLLIS GREY!" The thing freezes, and for a second it looks almost human, almost sad.',[['Tell him to rest','end_true',null,'Lanyard'],['Light the lamp','end_dawn']]],
 end_lost:['asylum',0,'ENDING: Lost in St. Ashby\'s. Kaz\'s phone is found by the gate a week later. Its last photo is a blank grey face. (Try again, and find the clues!)',[]],
 end_run:['out',0,'ENDING: Survivors. Kaz and Tess sprint down the fire escape and don\'t stop until sunrise. They never go back. But sometimes the clock in Kaz\'s flat has no hands...',[]],
 end_dawn:['out',0,'ENDING: Dawn Breaker. The lamp blazes across the moors and the Hollow Man dissolves like smoke. Tess\'s vlog goes viral. Nobody believes it\'s real.',[]],
 end_true:['out',0,'TRUE ENDING: Rest, Hollis. Kaz holds out Tess\'s lanyard, a reminder he was once a patient with a name. He bows, fades, and the asylum finally falls quiet. Kaz, slightly serious, glossy grin: "Case closed."',[]]};
const ENDS=['end_lost','end_run','end_dawn','end_true'];
let cur='start',clues=[],scare=0,scareSnd=false,typed=0,mp={x:450,y:300},fl=0;
function sfx(f,d,ty,v){try{const A=window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.type=ty||'sawtooth';o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.3),n+d);g.gain.setValueAtTime(v||.2,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
function go(k){const n=N[k];if(!n)return;if(DEMO&&n[1]>=2){window.demoEnd&&window.demoEnd('You survived Chapter 1! The full game has all 3 chapters (Hollowmere House, St. Ashby\'s Asylum and The Roof), more clues and jump scares, and 4 endings.');return}
 cur=k;typed=0;if(n[4]){scare=1.1;sfx(900,.8,'sawtooth',.3);sfx(140,1,'square',.25)}G.score+=10;
 if(ENDS.includes(k)){if(!S.endings.includes(k))S.endings.push(k);S.best=Math.max(S.best,G.score+clues.length*50);sv()}}
function pick(ch){if(ch[2]&&!clues.includes(ch[2])){clues.push(ch[2]);G.score+=50;sfx(880,.3,'sine',.12)}go(ch[1])}
function newGame(){cur='start';clues=[];G.score=0;G.state='play';go('start')}
function update(dt){if(scare>0)scare-=dt;typed+=dt*60;fl+=dt}
function drawMonster(a,big){x.save();x.globalAlpha=a;x.translate(big?450:780,big?330:300);const s=big?2.6:1;x.scale(s,s);x.fillStyle='#9aa0a4';x.beginPath();x.ellipse(0,-60,34,46,0,0,7);x.fill();x.fillStyle='#0a0a0a';x.fillRect(-12,-12,24,120);x.strokeStyle='#9aa0a4';x.lineWidth=4;x.beginPath();x.moveTo(-10,0);x.lineTo(-50,70);x.lineTo(-56,110);x.moveTo(10,0);x.lineTo(50,70);x.lineTo(56,110);x.stroke();if(big){x.fillStyle='#000';x.beginPath();x.ellipse(0,-50,10,18,0,0,7);x.fill()}x.restore();x.globalAlpha=1}
function draw(){const n=N[G.state==='menu'?'start':cur],b=BG[n[0]];const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,b[0]);g.addColorStop(1,b[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
 x.globalAlpha=.25;emo(b[2],620,200,150);x.globalAlpha=1;
 // windows/doors silhouettes
 x.fillStyle='#0006';for(let i=0;i<4;i++)x.fillRect(380+i*120,250,60,130);
 if(['ch1end','hide','lamp','roof','caught'].includes(cur)&&G.state==='play')drawMonster(.35+.15*Math.sin(t*2),false);
 drawKaz(170,470,1.45,{torch:1,arm:-.15,scared:scare>0,still:scare>0});
 // torch vignette
 const R=x.createRadialGradient(mp.x,mp.y,40,mp.x,mp.y,360);R.addColorStop(0,'rgba(0,0,0,0)');R.addColorStop(1,'rgba(0,0,0,'+(.75+.08*Math.sin(fl*13))+')');x.fillStyle=R;x.fillRect(0,0,W,H);
 if(G.state==='menu'){x.fillStyle='#0008';x.fillRect(0,0,W,H);drawKaz(170,470,1.45,{torch:1});T('Coffeebreak Horror Thriller',580,110,38,'#e8e8e8','center');T('Kaz and the Hollow Man',580,148,22,'#ff8fc8','center','italic ');
  T('Endings found: '+S.endings.length+'/4   ·   Best score '+S.best,580,190,16,'#ffe066','center','');x.fillStyle='#ccc';x.font='16px Georgia';x.textAlign='center';wrapT('A choose-your-path spooky story. Move your torch with the mouse. Collect clues — they unlock better endings. Spooky, not gory. Contains jump scares.',580,240,520,24);x.textAlign='left';
  button('ng',460,340,240,58,'🔦 Begin',newGame);ent();return}
 // text box
 x.fillStyle='#000c';rr(330,40,540,300,14);x.fill();x.strokeStyle='#ff8fc855';x.lineWidth=2;x.stroke();
 if(n[1])T('Chapter '+n[1],350,72,16,'#ff8fc8','left','');x.fillStyle='#eee';x.font='18px Georgia';x.textAlign='left';wrapT(n[2].slice(0,Math.floor(typed)),350,104,500,27);
 const ch=n[3];ch.forEach((c,i)=>{const ok=!c[3]||clues.includes(c[3]);button('c'+i,340,360+i*62,520,52,(ok?'':'🔒 ')+c[0]+(c[3]?' ['+c[3]+']':''),()=>{if(ok){typed=999;pick(c)}},{dis:!ok,fs:16})});
 if(!ch.length){T('Endings found: '+S.endings.length+'/4',600,380,18,'#ffe066','center');button('again',470,400,260,56,'↺ Play again',newGame);button('menu',470,466,260,46,'🏠 Menu',()=>{G.state='menu'},{fs:15})}
 T('🗝️ Clues: '+(clues.join(', ')||'none'),20,30,14,'#ffe066','left','');T('Score '+G.score,880,80,14,'#fff','right','');
 if(scare>0){x.fillStyle='rgba(0,0,0,'+Math.min(1,scare)+')';x.fillRect(0,0,W,H);drawMonster(Math.min(1,scare*1.5),true);if(scare>.9){x.fillStyle='#fff3';x.fillRect(0,0,W,H)}}
 ent()}
bindInput({down:()=>{typed=999},move:p=>{mp=p}});startLoop();window.HT={go,pick,newGame,get cur(){return cur},clues:()=>clues,N};
