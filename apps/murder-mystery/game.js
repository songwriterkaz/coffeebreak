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
// ---- Coffeebreak: Who Did It? ----
const S=$('stage'),DEMO=!!window.DEMO,esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
const pick=a=>a[Math.random()*a.length|0],shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const SUS=[
 {n:'Mocha Marge',p:'👩‍🍳',c:'#a0703a',job:'pastry chef',item:'a flour-dusted oven mitt',sec:'She secretly buys her "homemade" croissants from the servo.',voice:'Oh, sugar!'},
 {n:'Captain Biscotti',p:'🧔',c:'#4a6a9a',job:'retired sea captain',item:'a soggy sailor\'s cap',sec:'He has never actually sailed a boat. He gets seasick in the bath.',voice:'Arr, shiver me saucers!'},
 {n:'Lady Latte',p:'💁‍♀️',c:'#e88aa8',job:'influencer',item:'a glittery phone case',sec:'Her 2 million followers are mostly bots.',voice:'Literally, like, can you not?'},
 {n:'Professor Bean',p:'🧑‍🔬',c:'#5a8a5a',job:'coffee scientist',item:'a cracked pair of goggles',sec:'He has been trying to invent self-stirring coffee for 20 years.',voice:'Fascinating. Simply fascinating.'},
 {n:'Velvet Vinnie',p:'🧑‍🎤',c:'#8a4ab0',job:'lounge singer',item:'a purple velvet guitar pick',sec:'He lip-syncs every single song.',voice:'Oooh baby, let me sing you my alibi.'},
 {n:'Granny Sprinkles',p:'👵',c:'#c06a8a',job:'champion knitter',item:'a ball of pink wool',sec:'She is actually the undefeated arm-wrestling champ of Newcastle.',voice:'Now listen here, sweetheart.'}];
const WEP=[['a giant rubber spoon','🥄'],['a frozen baguette','🥖'],['a heavy teapot','🫖'],['a squeaky rubber chicken','🐔'],['a rock-hard stale muffin','🧁'],['a frilly umbrella','☂️']];
const ROOMS=[['the Coffee Counter','☕'],['the Kitchen','🍳'],['the Storeroom','📦'],['the Garden Patio','🌹'],['the Little Stage','🎤'],['the Cake Cabinet Corner','🍰']];
let C,NB,G={state:'title',score:0,level:+localStorage.mmSolved||0};window.G=G;
function newCase(){const cul=Math.random()*6|0,w=Math.random()*6|0,r=Math.random()*6|0,inn=shuf([0,1,2,3,4,5].filter(i=>i!==cul));
 const rooms=shuf([0,1,2,3,4,5].filter(i=>i!==r)),alibi={};
 // pairs vouch for each other in a real room; the 5th has a receipt; culprit lies
 [[inn[0],inn[1]],[inn[2],inn[3]]].forEach(([a,b],k)=>{const rm=rooms[k];alibi[a]={where:rm,with:b};alibi[b]={where:rm,with:a}});
 alibi[inn[4]]={where:rooms[2],with:null,receipt:true};const lieRoom=rooms[3];alibi[cul]={where:lieRoom,with:null,lie:true};
 const herring=pick(inn.slice(0,4));const wrooms=shuf(rooms);
 // room clues
 const RC={};ROOMS.forEach((_,i)=>RC[i]=[]);
 RC[r].push({t:'Scuff marks and a spilled flat white. This is where Barry was bonked!',k:'scene'});RC[r].push({t:'A smear that matches '+WEP[w][0]+' '+WEP[w][1]+'.',k:'weapon'});RC[r].push({t:'Dropped near the scene: '+SUS[cul].item+'.',k:'item',s:cul});
 WEP.forEach((wp,i)=>{if(i!==w)RC[wrooms[i%5]].push({t:wp[0]+' '+wp[1]+', dusty and untouched. Not the weapon.',k:'notw'})});
 RC[alibi[inn[4]].where].push({t:'A timestamped receipt: '+SUS[inn[4]].n+' was buying a muffin here at the time.',k:'receipt',s:inn[4]});
 RC[lieRoom].push({t:'The fairy lights here were off and the door was locked all evening. Nobody was in here!',k:'lie',s:cul});
 RC[pick(rooms)].push({t:'Hmm, '+SUS[herring].item+' tucked behind a cushion. Suspicious?',k:'herring',s:herring});
 C={cul,w,r,alibi,RC,herring,asked:{},searched:{},q:0};NB=['☕ Barry the Barista was found "murdered" (out cold with cartoon X eyes and a bump on the head) at closing time.'];G.state='case'}
function note(s){if(!NB.includes(s))NB.push(s)}
function shell(inner){S.innerHTML='<div class="scr">'+inner+'<div class="ent">A cosy cartoon whodunit. Nobody is really hurt, Barry wakes up with a headache and a free coffee!</div></div>'}
function title(){G.state='title';shell(`<div style="text-align:center"><h1>🔍 Coffeebreak: Who Did It?</h1><p>Closing time at the Coffeebreak café… and Barry the Barista has been found "murdered" 😵 (just a cartoon bonk!). Six quirky suspects. One culprit. Question them, search the café, keep your notebook, then make your accusation.</p>
 <p><button class="big" id="go">🕵️ Solve a case</button> <button class="big" id="host">🎉 Host Mode (2-8 players)</button></p>${DEMO?'<p style="color:#ffcf6a">Free demo: one case. Endless random cases and party Host Mode are in the full game.</p>':''}<p>Cases solved: ${G.level}</p>
 <div>${SUS.map(s=>`<div class="sus" style="border-color:${s.c}"><div class="pt">${s.p}</div><b>${s.n}</b><br><small>${s.job}</small></div>`).join('')}</div></div>`);
 $('go').onclick=()=>{startMusic();if(DEMO&&+localStorage.mmDemo>=1)return demoEnd('You solved your free demo case! Endless randomised cases and the party Host Mode for 2 to 8 players are in the full game.');localStorage.mmDemo=1;newCase();hub()};
 $('host').onclick=()=>{startMusic();if(DEMO)return demoEnd('Party Host Mode for 2 to 8 players, with secret character cards, clue rounds and a group reveal, is in the full game.');hostSetup()}}
function hub(){shell(`<h2>🔍 The Case of the Bonked Barista</h2><div class="box">${NB.slice(-1)[0]}</div>
 <h3>🗣️ Question a suspect</h3><div>${SUS.map((s,i)=>`<div class="sus" data-s="${i}" style="border-color:${s.c}"><div class="pt">${s.p}</div><b>${s.n}</b></div>`).join('')}</div>
 <h3>🔦 Search a room</h3><div class="row">${ROOMS.map((r,i)=>`<button data-r="${i}">${r[1]} ${r[0].replace('the ','')}${C.searched[i]?' ✓':''}</button>`).join(' ')}</div>
 <p><button id="nb">📓 Notebook (${NB.length})</button> <button class="big" id="acc">☝️ Make an accusation</button> <button id="bk">⬅ Menu</button></p>`);
 S.querySelectorAll('[data-s]').forEach(e=>e.onclick=()=>talk(+e.dataset.s));S.querySelectorAll('[data-r]').forEach(e=>e.onclick=()=>search(+e.dataset.r));$('nb').onclick=book;$('acc').onclick=accuse;$('bk').onclick=title}
function search(i){C.searched[i]=1;const cl=C.RC[i];cl.forEach(c=>note(ROOMS[i][1]+' '+ROOMS[i][0]+': '+c.t));
 shell(`<h2>${ROOMS[i][1]} Searching ${ROOMS[i][0]}…</h2><div class="box">${cl.length?cl.map(c=>`<p class="clue">🔎 ${c.t}</p>`).join(''):'<p>Nothing here but crumbs and a sleepy cat. 🐈‍⬛</p>'}</div><p><button id="b">⬅ Back to the café</button></p>`);$('b').onclick=hub}
function line(i,q){const s=SUS[i],a=C.alibi[i],R=ROOMS[a.where][0];
 if(q==='where')return a.with!=null?`I was in ${R} with ${SUS[a.with].n} the whole time. Ask them!`:a.receipt?`I was in ${R}, buying a muffin. I kept the receipt, somewhere…`:`I was in ${R}. All alone. Very quiet. Nobody saw me, but trust me!`;
 if(q==='barry')return pick(['Barry? Lovely lad. Made a decent cappuccino.','He did forget my extra shot once… but I forgave him! Mostly.','He owed me five dollars. But I would never!','Barry was always humming. Annoying but sweet.']);
 if(q==='saw'){if(a.lie)return 'Saw? Me? Nothing! I saw absolutely nothing. Can I go now?';const o=[0,1,2,3,4,5].filter(k=>k!==i&&k!==a.with);const k=o.find(z=>C.alibi[z].lie)??pick(o);return Math.random()<.6&&C.alibi[k].lie?`I think I saw ${SUS[k].n} sneaking around near ${ROOMS[C.r][0]}…`:`I heard a loud BONK coming from somewhere. Then a squeak!`}
 if(q==='item'){if(i===C.cul)return `That's… er… not mine. Lots of people have one of those. Move along!`;if(i===C.herring)return `Oh, that! I lost it there this afternoon, ask anyone. Thank you for finding it!`;return 'Hmm?'}
 if(q==='secret')return `Fine… my secret: ${s.sec} But that doesn't make me a villain!`}
function talk(i){const s=SUS[i],has=NB.some(n=>n.includes(s.item));shell(`<div class="box" style="display:flex;gap:14px;align-items:center"><div style="font-size:80px;background:${s.c};border-radius:50%;width:120px;height:120px;text-align:center;line-height:120px">${s.p}</div><div><h2>${s.n}</h2><p>${s.job}. <span class="say">"${s.voice}"</span></p><p id="ans" class="say"></p></div></div>
 <div class="row"><button data-q="where">📍 Where were you when it happened?</button><button data-q="barry">☕ What did you think of Barry?</button><button data-q="saw">👀 Did you see anything?</button><button data-q="secret">🤫 What are you hiding?</button>${has?`<button data-q="item">🧶 Show them ${s.item}</button>`:''}</div><p><button id="b">⬅ Back</button></p>`);
 S.querySelectorAll('[data-q]').forEach(e=>e.onclick=()=>{const q=e.dataset.q,t=line(i,q);$('ans').textContent='"'+t+'"';note(s.p+' '+s.n+': "'+t+'"')});$('b').onclick=hub}
function book(){shell(`<h2>📓 Detective notebook</h2><div class="box">${NB.map(n=>'<p>• '+esc(n)+'</p>').join('')}</div><p><small>Tip: alibis vouched for by someone else, or backed by a receipt, are true. Someone's story won't match the clues…</small></p><p><button id="b">⬅ Back</button></p>`);$('b').onclick=hub}
function accuse(){shell(`<h2>☝️ J'accuse!</h2><div class="box"><p>Who did it? <select id="as">${SUS.map((s,i)=>`<option value="${i}">${s.p} ${s.n}</option>`).join('')}</select></p><p>With what? <select id="aw">${WEP.map((w,i)=>`<option value="${i}">${w[1]} ${w[0]}</option>`).join('')}</select></p><p>Where? <select id="ar">${ROOMS.map((r,i)=>`<option value="${i}">${r[1]} ${r[0]}</option>`).join('')}</select></p></div><p><button class="big" id="go">🔍 Reveal the truth</button> <button id="b">⬅ Not yet</button></p>`);
 $('b').onclick=hub;$('go').onclick=()=>reveal(+$('as').value,+$('aw').value,+$('ar').value)}
function truth(){const s=SUS[C.cul];return `<div class="box" style="text-align:center"><div style="font-size:90px">${s.p}</div><h2>It was ${s.n}, with ${WEP[C.w][0]} ${WEP[C.w][1]}, in ${ROOMS[C.r][0]}!</h2><p class="say">"${s.voice} Fine! Barry gave my table away to someone else, so I gave him a little bonk. I'm sorry!"</p><p>Barry wakes up 😵‍💫 → 😊 with a bump, a headache and a free coffee. Case closed!</p></div>`}
function reveal(a,w,r){const sc=(a===C.cul)*3+(w===C.w)+(r===C.r);G.score=sc;if(a===C.cul){localStorage.mmSolved=G.level=(+localStorage.mmSolved||0)+1}
 shell(`<h1>${a===C.cul?'🎉 Case solved!':'😱 Wrong suspect!'}</h1><p>You got ${a===C.cul?'the culprit ✓':'the culprit ✗'}, ${w===C.w?'the weapon ✓':'the weapon ✗'}, ${r===C.r?'the room ✓':'the room ✗'}. Detective rating: ${'⭐'.repeat(sc)||'🥔'}</p>${truth()}<p><button class="big" id="n">🔄 New case</button> <button id="m">⬅ Menu</button></p>`);
 $('n').onclick=()=>{if(DEMO)return demoEnd('You solved your free demo case! Endless randomised cases and the party Host Mode are in the full game.');newCase();hub()};$('m').onclick=title}
// ---- Host Mode ----
let H;
function hostSetup(){shell(`<h2>🎉 Host Mode: a murder mystery party</h2><div class="box"><p>How many players? <select id="np">${[2,3,4,5,6,7,8].map(n=>`<option ${n===6?'selected':''}>${n}</option>`).join('')}</select></p><p>Player names (optional, one per line):</p><textarea id="nm" rows="4" style="width:90%"></textarea>
 <p><small>Each player gets a secret character card. One suspect is the culprit (players 7 and 8 are the Detective and the Café Owner). Pass the device around or print the cards, read clues each round, then everyone accuses together!</small></p></div><p><button class="big" id="go">🎲 Deal characters</button> <button id="b">⬅ Menu</button></p>`);
 $('b').onclick=title;$('go').onclick=()=>{const n=+$('np').value,nm=$('nm').value.split('\n').map(s=>s.trim()).filter(Boolean);newCase();
  let roles=shuf([0,1,2,3,4,5]).slice(0,Math.min(n,6));if(!roles.includes(C.cul))roles[Math.random()*roles.length|0]=C.cul;roles=roles.map(r=>({s:r}));if(n>=7)roles.push({x:'Detective'});if(n>=8)roles.push({x:'Café Owner'});
  H={players:roles.map((r,i)=>({...r,name:nm[i]||'Player '+(i+1)})),round:0,deal:0,clues:hostClues()};hostDeal()}}
function cardHTML(p){if(p.x==='Detective')return `<div class="card"><h2>🕵️ ${esc(p.name)}: the Detective</h2><p>You are innocent and you lead the questioning. Ask each suspect where they were, what they saw, and what they are hiding.</p></div>`;
 if(p.x)return `<div class="card"><h2>☕ ${esc(p.name)}: the Café Owner</h2><p>You are innocent. You found Barry at closing time. You noticed the lights in ${ROOMS[C.r][0]} were flickering.</p></div>`;
 const s=SUS[p.s],a=C.alibi[p.s];return `<div class="card"><h2>${s.p} ${esc(p.name)} is ${s.n}</h2><p><b>${s.job}.</b> Catchphrase: "${s.voice}"</p><p>🤫 Secret: ${s.sec}</p>`+(p.s===C.cul?`<p style="color:#ff7a8a"><b>😈 YOU DID IT!</b> You bonked Barry with ${WEP[C.w][0]} in ${ROOMS[C.r][0]}. Lie and say you were in ${ROOMS[a.where][0]}, alone. Don't get caught!</p>`:`<p>😇 You are innocent. Your alibi: you were in ${ROOMS[a.where][0]}${a.with!=null?' with '+SUS[a.with].n:a.receipt?' buying a muffin (you have the receipt!)':''}.</p>`)+'</div>'}
function hostDeal(){const p=H.players[H.deal];if(!p)return hostRound();shell(`<h2>🎴 Secret cards</h2><p>Pass the device to <b>${esc(p.name)}</b>. Nobody else peek!</p><div id="cd"><button class="big" id="sh">👀 Tap to reveal your card</button></div><p><button id="pr">🖨️ Print all cards instead</button></p>`);
 $('sh').onclick=()=>{$('cd').innerHTML=cardHTML(p)+'<button class="big" id="hd">🙈 Hide and pass on</button>';$('hd').onclick=()=>{H.deal++;hostDeal()}};$('pr').onclick=printCards}
function printCards(){let d=$('print');if(!d){d=document.createElement('div');d.id='print';document.body.appendChild(d)}d.innerHTML='<h1>Coffeebreak: Who Did It? Character cards</h1>'+H.players.map(cardHTML).join('');window.print();H.deal=H.players.length;hostRound()}
function hostClues(){const all=[];Object.entries(C.RC).forEach(([i,l])=>l.forEach(c=>all.push(ROOMS[i][1]+' In '+ROOMS[i][0]+': '+c.t)));const crit=all.filter(s=>/bonked|matches|Dropped|locked/.test(s)),rest=shuf(all.filter(s=>!crit.includes(s)));
 return[rest.slice(0,3).concat(crit.filter(s=>/bonked/.test(s))),rest.slice(3).concat(crit.filter(s=>/matches|locked/.test(s))),crit.filter(s=>/Dropped/.test(s))]}
function hostRound(){if(H.round>=3)return hostAccuse();const r=H.round;shell(`<h2>🔔 Round ${r+1} of 3</h2><p>Read these clues aloud. Then everyone questions each other in character for a few minutes.</p><div class="box">${H.clues[r].map(c=>'<p class="clue">🔎 '+c+'</p>').join('')}</div>
 <p><button class="big" id="nx">${r<2?'➡ Next round':'☝️ Time to accuse!'}</button> <button id="m">⬅ Menu</button></p>`);$('nx').onclick=()=>{H.round++;hostRound()};$('m').onclick=title}
function hostAccuse(){const sus=H.players.filter(p=>p.s!=null);shell(`<h2>☝️ Group accusation</h2><p>Everyone points at who they think did it! Tally the votes below.</p><div class="box">${sus.map((p,i)=>`<p>${SUS[p.s].p} ${esc(p.name)} (${SUS[p.s].n}) <button data-v="${i}">+1</button> <b id="v${i}">0</b></p>`).join('')}</div><p><button class="big" id="rv">🔍 Reveal the culprit</button></p>`);
 const v=sus.map(()=>0);S.querySelectorAll('[data-v]').forEach(e=>e.onclick=()=>{const i=+e.dataset.v;v[i]++;$('v'+i).textContent=v[i]});
 $('rv').onclick=()=>{const top=v.indexOf(Math.max(...v)),win=sus[top]&&sus[top].s===C.cul&&Math.max(...v)>0,cp=H.players.find(p=>p.s===C.cul);G.score=win?1:0;if(win)localStorage.mmSolved=G.level=(+localStorage.mmSolved||0)+1;
  shell(`<h1>${win?'🎉 The group caught the culprit!':'😈 The culprit got away!'}</h1><p>It was <b>${esc(cp.name)}</b>!</p>${truth()}<p><button class="big" id="ag">🔄 Host another party</button> <button id="m">⬅ Menu</button></p>`);$('ag').onclick=hostSetup;$('m').onclick=title}}
title();
