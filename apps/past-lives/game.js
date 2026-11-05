const $=id=>document.getElementById(id);
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
// ---- Coffeebreak Past Lives ----
const S=$('stage'),DEMO=!!window.DEMO,esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
const ERAS=[
 {e:'Ancient Egypt, 1350 BC',pl:['Thebes','Memphis','the banks of the Nile'],n:['Nefer','Meritamun','Khafre','Ahmose','Tiy','Sennefer'],j:['temple perfume maker','royal cat keeper','scribe of the pharaoh','lotus-garden priestess'],bg:['#e8c070','#a06a2a'],hat:'nemes',robe:'#f6f0e0',acc:'#2a7ab0'},
 {e:'Ancient Greece, 420 BC',pl:['Athens','Delphi','the island of Crete'],n:['Daphne','Theron','Ione','Lysander','Calla','Nikias'],j:['oracle\'s assistant','lyre player','olive grove keeper','philosopher\'s cook'],bg:['#a8d0f0','#4a7ab0'],hat:'laurel',robe:'#fff',acc:'#d8a830'},
 {e:'Imperial China, 1100 AD',pl:['Kaifeng','Hangzhou','a misty mountain village'],n:['Mei Lin','Bao','Xiu','Jian','Lan','Wen'],j:['tea master','silk painter','lantern maker','palace poet'],bg:['#f0a0a0','#a02030'],hat:'bun',robe:'#c2264a',acc:'#ffd75a'},
 {e:'Viking Scandinavia, 900 AD',pl:['Kattegat','a fjord in Norway','Birka'],n:['Astrid','Bjorn','Sigrid','Leif','Freya','Ragnar'],j:['shield maiden','honey mead brewer','rune carver','ship\'s singer'],bg:['#a0b8c8','#3a4a5a'],hat:'braids',robe:'#6a4a2a',acc:'#c0c0c0'},
 {e:'Medieval England, 1350',pl:['a castle in Yorkshire','London Bridge','a village near Canterbury'],n:['Rowena','Godric','Isolde','Edmund','Maud','Alaric'],j:['herbalist and healer','castle baker','travelling minstrel','candle maker'],bg:['#8ac08a','#2a5a2a'],hat:'hood',robe:'#5a2a6a',acc:'#c2264a'},
 {e:'Renaissance Italy, 1505',pl:['Florence','Venice','Rome'],n:['Lucia','Matteo','Giulia','Lorenzo','Bianca','Rafaele'],j:['painter\'s apprentice','mask maker for the carnival','perfumer','gondolier who sang'],bg:['#d8a0d8','#6a2a6a'],hat:'beret',robe:'#8a1030',acc:'#ffd75a'},
 {e:'Edo Japan, 1720',pl:['Kyoto','Edo','a cherry blossom village'],n:['Hana','Kenji','Yuki','Haruto','Sakura','Ren'],j:['tea ceremony master','kite maker','shamisen musician','sweet-shop owner'],bg:['#ffc0d0','#c06080'],hat:'bun',robe:'#4a2a8a',acc:'#ffb0c8'},
 {e:'Victorian London, 1888',pl:['a foggy London street','a Bath tea room','Whitby by the sea'],n:['Evangeline','Arthur','Clara','Percival','Violet','Edwin'],j:['séance medium','music hall singer','confectioner','lighthouse keeper'],bg:['#b0a0c0','#3a2a4a'],hat:'tophat',robe:'#2a1a2a',acc:'#c2264a'},
 {e:'Wild West, 1875',pl:['Tombstone, Arizona','a Texas cattle town','Deadwood'],n:['Josephine','Wyatt','Clementine','Jesse','Pearl','Silas'],j:['saloon piano player','horse whisperer','travelling fortune teller','country singer'],bg:['#f0c890','#a0602a'],hat:'cowboy',robe:'#8a5a2a',acc:'#d8c8a0'},
 {e:'1920s Paris',pl:['Montmartre','a jazz club on the Left Bank','a café by the Seine'],n:['Colette','Henri','Josette','Lucien','Mimi','Antoine'],j:['jazz singer','fashion designer','café pastry chef','silent film star'],bg:['#202030','#c0a0ff'],hat:'flapper',robe:'#1a1a1a',acc:'#ffd75a'},
 {e:'Colonial Sydney, 1840',pl:['The Rocks, Sydney','Newcastle by the harbour','Parramatta'],n:['Eliza','Thomas','Mary','William','Grace','Henry'],j:['lighthouse keeper at Nobbys','ship\'s cook','bush poet','baker of damper and buns'],bg:['#90d0e0','#2a6a8a'],hat:'bonnet',robe:'#6a7a9a',acc:'#fff'},
 {e:'Aztec Empire, 1480',pl:['Tenochtitlan','the floating gardens','a temple of the sun'],n:['Xochitl','Itzel','Tenoch','Citlali','Cuauh','Yaretzi'],j:['cacao chocolate maker','feather artist','star watcher','flower farmer'],bg:['#60c0a0','#1a6a5a'],hat:'feather',robe:'#e8d8a0',acc:'#2ab0a0'}];
const STORY=['You lived a life full of {q1}. Every morning you {daily}, and people travelled from far away because of your gift for {gift}.','Your neighbours called you "the one with the {q1} heart". You {daily}, and you once saved your whole village with your talent for {gift}.','You were famous in secret: by day you {daily}, but by night your {gift} made people weep with joy. You loved {q1} more than gold.'];
const DAILY=['woke before sunrise to watch the sky','sang while you worked','fed every stray cat in the street','wrote poems on scraps of paper','brewed something warm for strangers','danced barefoot when nobody was looking'];
const LESSON=['In this life, your soul came back to finish a song it started long ago.','That is why you feel at home with music, coffee and candlelight.','Your soul remembers: kindness is your true power.','That old courage is still in your bones today.','You promised to come back and create something beautiful. And here you are.'];
const QZ=[['When you close your eyes, you see…',[['🌊 the sea','adventure'],['🏰 old stone walls','mystery'],['🌸 blossoms','beauty'],['🔥 a fire','passion']]],['Which gift feels like yours?',[['🎵 music','music'],['🌿 healing','healing'],['✍️ words','storytelling'],['🔮 seeing','foresight']]],['You are drawn to…',[['☀️ hot deserts',0],['❄️ cold mountains',1],['🌧️ misty cities',2],['🌺 lush gardens',3]]],['A sound that gives you chills:',[['🔔 temple bells',4],['🎻 a violin',5],['🥁 drums',6],['🎹 an old piano',7]]]];
let ST={name:'',bd:'',ans:[],salt:0,qi:0,count:0};const G={state:'title',score:0,level:+localStorage.plN||0};window.G=G;window.ST=ST;
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function rng(seed){let a=seed;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function life(){const R=rng(hash(ST.name.toLowerCase()+ST.bd+ST.ans.join()+'#'+ST.salt)),p=a=>a[Math.floor(R()*a.length)];
 const ei=(Math.floor(R()*12)+ (ST.ans[2]|0)*3+(ST.ans[3]|0)+ST.salt*5)%12,E=ERAS[ei];return{E,place:p(E.pl),name:p(E.n),job:p(E.j),story:p(STORY).replace('{q1}',ST.ans[0]||'wonder').replace('{daily}',p(DAILY)).replace('{gift}',ST.ans[1]||'kindness')+' '+p(LESSON),R}}
function shell(h){S.innerHTML='<div class="scr">'+h+'<div class="ent">For entertainment only. Just for fun!</div></div>'}
function title(){shell(`<h1>🔮 Past Lives: Who Were You?</h1><p>Your soul is old, sweet one. Tell me your name and birthday, answer four mystical questions, and I will reveal who you were in a past life.</p>
 <div class="q"><p><input id="nm" placeholder="Your name" maxlength="30" value="${esc(ST.name)}"> <input id="bd" type="date" value="${ST.bd||'1990-01-01'}"></p><button class="big" id="go">✨ Begin the journey</button></div>${DEMO?'<p style="color:#ffcf6a">Free demo: 1 past-life reveal. Unlimited reveals, rerolls and card saving are in the full game.</p>':''}`);
 $('go').onclick=()=>{startMusic();ST.name=$('nm').value.trim()||'Sweet soul';ST.bd=$('bd').value;ST.ans=[];ST.qi=0;ST.salt=0;quiz()}}
function quiz(){const q=QZ[ST.qi];if(!q)return travel();shell(`<h2>Question ${ST.qi+1} of ${QZ.length}</h2><div class="q"><h3>${q[0]}</h3>${q[1].map((o,i)=>`<button class="big" data-a="${i}">${o[0]}</button>`).join('')}</div>`);S.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ST.ans.push(q[1][+b.dataset.a][1]);ST.qi++;quiz()})}
function travel(){if(DEMO&&ST.count>=1)return demoEnd('Your free demo includes 1 past-life reveal. Unlimited lives, rerolls and saving your portrait card are in the full game.');shell(`<h2>🌀 Travelling back through time…</h2><p style="font-size:60px" id="sw">⏳</p><p>Breathe slowly… the mists of time are parting…</p>`);let k=0;const iv=setInterval(()=>{const e=$('sw');if(!e){clearInterval(iv);return}e.textContent=['🌙','✨','🕰️','🔮','🌹'][k++%5];if(k>8){clearInterval(iv);reveal()}},250)}
function reveal(){ST.count++;localStorage.plN=G.level=(+localStorage.plN||0)+1;G.score=ST.count;const L=life();
 shell(`<h2>✨ ${esc(ST.name)}, in a past life you were…</h2><canvas id="card" width="560" height="720"></canvas><p class="story">${esc(L.story)}</p>
 <p><button class="big" id="rr">🎲 Reveal another past life</button> <button id="sv">💾 Save card PNG</button> <button id="ag">↺ Start over</button></p>`);
 drawCard($('card'),L);$('rr').onclick=()=>{if(DEMO)return demoEnd('Your free demo includes 1 past-life reveal. Unlimited lives and rerolls are in the full game.');ST.salt++;travel()};
 $('sv').onclick=()=>{if(DEMO)return demoEnd('Saving your portrait card is in the full game.');const a=document.createElement('a');a.download='my-past-life.png';a.href=$('card').toDataURL();a.click()};$('ag').onclick=title}
function drawCard(c,L){const x=c.getContext('2d'),E=L.E,R=L.R,W=560,H=720;
 x.fillStyle='#2a0e1a';x.fillRect(0,0,W,H);x.strokeStyle='#d8a830';x.lineWidth=8;x.strokeRect(12,12,W-24,H-24);x.lineWidth=2;x.strokeRect(26,26,W-52,H-52);
 const g=x.createLinearGradient(0,60,0,470);g.addColorStop(0,E.bg[0]);g.addColorStop(1,E.bg[1]);x.fillStyle=g;x.beginPath();x.ellipse(W/2,270,200,210,0,0,7);x.fill();x.save();x.clip();
 for(let i=0;i<30;i++){x.fillStyle='rgba(255,255,255,'+(R()*.4)+')';x.beginPath();x.arc(80+R()*400,70+R()*400,R()*3+1,0,7);x.fill()}
 const skin=['#f6d8c8','#e0b090','#c08a60','#8a5a3a'][Math.floor(R()*4)],hair=['#2a1810','#6a3a1a','#d8b060','#1a1a1a','#a03a1a'][Math.floor(R()*5)],cx=W/2,cy=270;
 // shoulders/robe
 x.fillStyle=E.robe;x.beginPath();x.ellipse(cx,cy+210,170,120,0,Math.PI,0);x.fill();x.fillStyle=E.acc;x.fillRect(cx-90,cy+100,180,10);
 // neck & head
 x.fillStyle=skin;x.fillRect(cx-22,cy+40,44,60);if(E.hat!=='nemes'&&E.hat!=='tophat'&&E.hat!=='cowboy'&&E.hat!=='hood'){x.fillStyle=hair;x.beginPath();x.ellipse(cx,cy-20,78,88,0,0,7);x.fill();if(E.hat==='braids'){x.fillRect(cx-80,cy,20,120);x.fillRect(cx+60,cy,20,120)}}
 x.fillStyle=skin;x.beginPath();x.ellipse(cx,cy,64,74,0,0,7);x.fill();
 // face
 x.fillStyle='#fff';x.beginPath();x.ellipse(cx-24,cy-6,12,13,0,0,7);x.ellipse(cx+24,cy-6,12,13,0,0,7);x.fill();x.fillStyle=['#5a3a1a','#3a6a9a','#4a8a4a','#7f98ac'][Math.floor(R()*4)];x.beginPath();x.arc(cx-24,cy-4,8,0,7);x.arc(cx+24,cy-4,8,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx-24,cy-4,4,0,7);x.arc(cx+24,cy-4,4,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(cx-21,cy-7,2.5,0,7);x.arc(cx+27,cy-7,2.5,0,7);x.fill();
 if(E.hat==='nemes'){x.strokeStyle='#111';x.lineWidth=3;x.beginPath();x.moveTo(cx-38,cy-6);x.lineTo(cx-52,cy-2);x.moveTo(cx+38,cy-6);x.lineTo(cx+52,cy-2);x.stroke()}
 x.fillStyle='rgba(255,120,150,.4)';x.beginPath();x.arc(cx-38,cy+18,10,0,7);x.arc(cx+38,cy+18,10,0,7);x.fill();x.strokeStyle='#a0303a';x.lineWidth=3;x.beginPath();x.arc(cx,cy+26,14,.3,2.8);x.stroke();
 // headwear
 const h=E.hat;x.fillStyle=E.acc;
 if(h==='nemes'){x.fillStyle='#2a7ab0';x.beginPath();x.moveTo(cx-70,cy-30);x.quadraticCurveTo(cx,cy-120,cx+70,cy-30);x.lineTo(cx+90,cy+90);x.lineTo(cx+56,cy+90);x.lineTo(cx+60,cy-20);x.lineTo(cx-60,cy-20);x.lineTo(cx-56,cy+90);x.lineTo(cx-90,cy+90);x.fill();x.fillStyle='#ffd75a';for(let i=-60;i<70;i+=16){x.fillRect(cx+i,cy-60+Math.abs(i)*.4,6,30)}}
 if(h==='laurel'){x.fillStyle='#6aa04a';for(let i=0;i<9;i++){const a=Math.PI+.2+i*.34;x.beginPath();x.ellipse(cx+Math.cos(a)*66,cy-40+Math.sin(a)*50,12,6,a,0,7);x.fill()}}
 if(h==='bun'){x.fillStyle=hair;x.beginPath();x.arc(cx,cy-96,32,0,7);x.fill();x.fillStyle=E.acc;x.fillRect(cx-50,cy-100,100,6);rose(cx+30,cy-90,1)}
 if(h==='braids'){x.fillStyle='#c0c0c0';x.beginPath();x.arc(cx,cy-50,70,Math.PI,0);x.fill();x.fillRect(cx-6,cy-50,12,40)}
 if(h==='hood'){x.fillStyle=E.robe;x.beginPath();x.ellipse(cx,cy-10,96,108,0,Math.PI*.95,Math.PI*2.05);x.fill();x.fillStyle=skin;x.beginPath();x.ellipse(cx,cy,64,74,0,Math.PI,0);x.fill()}
 if(h==='beret'){x.fillStyle=E.robe;x.beginPath();x.ellipse(cx+16,cy-70,82,30,-.15,0,7);x.fill()}
 if(h==='tophat'){x.fillStyle=hair;x.beginPath();x.ellipse(cx,cy-30,74,60,0,Math.PI,0);x.fill();x.fillStyle='#1a1a1a';x.fillRect(cx-100,cy-72,200,14);x.fillRect(cx-56,cy-180,112,112);x.fillStyle='#c2264a';x.fillRect(cx-56,cy-90,112,14)}
 if(h==='cowboy'){x.fillStyle=hair;x.beginPath();x.ellipse(cx,cy-30,74,60,0,Math.PI,0);x.fill();x.fillStyle='#8a5a2a';x.beginPath();x.ellipse(cx,cy-66,130,26,0,0,7);x.fill();x.beginPath();x.ellipse(cx,cy-100,62,50,0,Math.PI,0);x.fill();x.fillRect(cx-62,cy-100,124,34)}
 if(h==='flapper'){x.fillStyle='#111';x.beginPath();x.ellipse(cx,cy-40,80,60,0,Math.PI,0);x.fill();x.fillStyle='#ffd75a';x.fillRect(cx-76,cy-56,152,8);x.fillStyle='#fff';x.beginPath();x.ellipse(cx+50,cy-90,8,34,.3,0,7);x.fill()}
 if(h==='bonnet'){x.fillStyle='#fff';x.beginPath();x.ellipse(cx,cy-30,96,90,0,Math.PI*.9,Math.PI*2.1);x.fill();x.fillStyle=skin;x.beginPath();x.ellipse(cx,cy,64,74,0,Math.PI,0);x.fill();x.fillStyle=hair;x.fillRect(cx-60,cy-60,120,16)}
 if(h==='feather'){x.fillStyle='#ffd75a';x.fillRect(cx-70,cy-60,140,14);['#2ab0a0','#c2264a','#2a7ab0','#ffd75a','#6aa04a'].forEach((col,i)=>{x.fillStyle=col;x.beginPath();x.ellipse(cx-60+i*30,cy-110,10,48,(i-2)*.2,0,7);x.fill()})}
 x.restore();
 x.textAlign='center';x.fillStyle='#d8a830';x.font='bold 15px Georgia';x.fillText('✦ '+E.e.toUpperCase()+' ✦',W/2,510);x.fillStyle='#ffe9c7';x.font='bold 40px Georgia';x.fillText(L.name,W/2,560);
 x.font='italic 20px Georgia';x.fillText('the '+L.job,W/2,594);x.font='17px Georgia';x.fillStyle='#e8a0b0';x.fillText('of '+L.place,W/2,624);
 x.fillStyle='#b090a0';x.font='13px Georgia';x.fillText('Past life of '+ST.name+' · Coffeebreak Past Lives',W/2,672);if(DEMO){x.save();x.globalAlpha=.3;x.fillStyle='#fff';x.font='bold 46px Georgia';x.translate(W/2,300);x.rotate(-.5);x.fillText('DEMO',0,0);x.restore()}}
title();
