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
// ---- Coffeebreak Tarot ----
const S=$('stage'),esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
const DEMO=!!window.DEMO,ENT='<div class="ent">For entertainment only.</div>';
const MAJ=[['The Fool','🎒','new beginnings, spontaneity, a leap of faith','recklessness, hesitation, holding back'],['The Magician','🪄','manifestation, skill, willpower','manipulation, untapped talent, scattered energy'],['The High Priestess','🌙','intuition, mystery, inner wisdom','secrets, disconnection from intuition'],['The Empress','🌹','abundance, nurturing, beauty','dependence, creative block, smothering'],['The Emperor','👑','structure, authority, stability','rigidity, control, stubbornness'],['The Hierophant','🗝️','tradition, guidance, belonging','rebellion, new paths, questioning rules'],['The Lovers','💞','love, harmony, choices of the heart','imbalance, misalignment, indecision'],['The Chariot','🏇','determination, victory, momentum','lack of direction, scattered drive'],['Strength','🦁','courage, compassion, inner power','self-doubt, low energy, insecurity'],['The Hermit','🏮','soul-searching, solitude, reflection','isolation, loneliness, withdrawal'],['Wheel of Fortune','☸️','luck, cycles, destiny turning','bad luck, resisting change'],['Justice','⚖️','fairness, truth, cause and effect','dishonesty, unfairness, avoidance'],['The Hanged One','🙃','pause, surrender, new perspective','stalling, resistance, indecision'],['Death','💀','endings, transformation, rebirth','resisting change, stagnation'],['Temperance','🏺','balance, patience, moderation','excess, imbalance, impatience'],['The Devil','⛓️','temptation, attachment, playfulness','release, breaking free, reclaiming power'],['The Tower','🗼','sudden change, revelation, awakening','avoiding disaster, fear of change'],['The Star','⭐','hope, renewal, inspiration','despair, lost faith, disconnection'],['The Moon','🌕','dreams, illusion, the subconscious','confusion lifting, truth revealed'],['The Sun','☀️','joy, success, warmth','temporary clouds, dimmed optimism'],['Judgement','📯','awakening, reckoning, a calling','self-doubt, ignoring the call'],['The World','🌍','completion, fulfilment, wholeness','unfinished business, delays']];
const SUITS=[['Cups','🍷','emotions, love and relationships','#c2264a'],['Wands','🔥','passion, creativity and ambition','#e07a20'],['Swords','🗡️','thoughts, truth and challenges','#7aa0d8'],['Pentacles','🪙','money, work and the material world','#c8a040']];
const RANKS=[['Ace','a fresh start in','a blocked start in'],['Two','choices and partnership in','imbalance and indecision in'],['Three','growth and celebration in','delays and setbacks in'],['Four','stability and rest in','restlessness and stagnation in'],['Five','conflict and loss in','recovery and moving on in'],['Six','harmony, kindness and memories in','clinging to the past in'],['Seven','reflection and perseverance in','self-doubt and distraction in'],['Eight','movement and mastery in','frustration and slow progress in'],['Nine','near-fulfilment and resilience in','anxiety and overwhelm in'],['Ten','completion and legacy in','burden and endings in'],['Page','curious messages about','immature energy around'],['Knight','bold action in','impulsive rushing in'],['Queen','nurturing mastery of','insecurity around'],['King','confident leadership of','controlling behaviour around']];
const DECK=[...MAJ.map((m,i)=>({id:i,maj:1,num:i,name:m[0],sym:m[1],up:m[2],rv:m[3],col:'#e8a0b0'})),...SUITS.flatMap((s,si)=>RANKS.map((r,ri)=>({id:22+si*14+ri,maj:0,num:ri+1,suit:s[0],name:r[0]+' of '+s[0],sym:s[1],up:r[1]+' '+s[2],rv:r[2]+' '+s[2],col:s[3]})))];
const roman=n=>n?['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'][n]:'0';
function art(cv,cd){const c=cv.getContext('2d'),w=cv.width=220,h=cv.height=360;const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a0e1c');g.addColorStop(1,'#0d0508');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.strokeStyle=cd.col;c.lineWidth=4;c.strokeRect(8,8,w-16,h-16);c.lineWidth=1;c.strokeRect(16,16,w-32,h-32);
 const rose=(x,y,s)=>{c.fillStyle='#c2264a';for(let i=0;i<5;i++){c.beginPath();c.arc(x+Math.cos(i*1.26)*3*s,y+Math.sin(i*1.26)*3*s,3.4*s,0,7);c.fill()}c.fillStyle='#8a1030';c.beginPath();c.arc(x,y,2.2*s,0,7);c.fill();c.fillStyle='#2a5a3a';c.beginPath();c.ellipse(x+5*s,y+5*s,4*s,2*s,.6,0,7);c.fill()};
 const skull=(x,y,s)=>{c.fillStyle='#ffe9ef';c.beginPath();c.arc(x,y,9*s,0,7);c.fill();c.fillRect(x-5*s,y+5*s,10*s,6*s);c.fillStyle='#12060c';c.beginPath();c.arc(x-3.5*s,y,2.6*s,0,7);c.arc(x+3.5*s,y,2.6*s,0,7);c.fill();c.fillRect(x-.8*s,y+4*s,1.6*s,2*s)};
 [[26,26],[w-26,26],[26,h-26],[w-26,h-26]].forEach(([x,y])=>rose(x,y,1.2));
 c.fillStyle='rgba(232,160,176,.12)';c.beginPath();c.arc(w/2,h/2-20,70,0,7);c.fill();c.strokeStyle='rgba(255,207,106,.5)';for(let i=0;i<12;i++){c.beginPath();c.moveTo(w/2+Math.cos(i*.52)*74,h/2-20+Math.sin(i*.52)*74);c.lineTo(w/2+Math.cos(i*.52)*88,h/2-20+Math.sin(i*.52)*88);c.stroke()}
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffcf6a';c.font='bold 22px Georgia';c.fillText(cd.maj?roman(cd.num):(cd.num<=10?cd.num:cd.name.split(' ')[0][0]),w/2,40);
 if(cd.maj||cd.num>10||cd.num===1){c.font='64px serif';c.fillText(cd.sym,w/2,h/2-20)}else{c.font='26px serif';const n=cd.num;for(let i=0;i<n;i++){const cols=n>6?3:2,r=i/cols|0,cc=i%cols,rows=Math.ceil(n/cols);c.fillText(cd.sym,w/2+(cc-(Math.min(cols,n-r*cols)-1)/2)*44,h/2-20+(r-(rows-1)/2)*36)}}
 skull(w/2,h-92,1.3);c.fillStyle='#ffe9c7';c.font='bold 17px Georgia';c.fillText(cd.name,w/2,h-50)}
function back(cv){const c=cv.getContext('2d'),w=cv.width=220,h=cv.height=360;c.fillStyle='#1a0a10';c.fillRect(0,0,w,h);c.strokeStyle='#e8a0b0';c.lineWidth=4;c.strokeRect(8,8,w-16,h-16);
 for(let i=0;i<8;i++){c.strokeStyle='rgba(232,160,176,'+(.15+i*.06)+')';c.beginPath();c.arc(w/2,h/2,10+i*11,0,7);c.stroke()}c.font='60px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('💀',w/2,h/2);c.font='22px serif';c.fillText('🌹',w/2,50);c.fillText('🌹',w/2,h-50)}
function cardEl(d,lab,small){const e=document.createElement('div');e.className='tc';if(small){e.style.width='88px';e.style.height='144px'}e.innerHTML=`${lab?`<div class="lab">${esc(lab)}</div>`:''}<div class="in"><canvas class="b"></canvas><canvas class="f"></canvas></div>`;
 back(e.querySelector('.b'));const f=e.querySelector('.f');art(f,DECK[d.id]);if(d.rev)f.style.transform='rotateY(180deg) rotate(180deg)';return e}
const SPREADS={single:{n:'Single card',p:['Your message']},three:{n:'Past · Present · Future',p:['Past','Present','Future']},celtic:{n:'Celtic Cross',p:['The present','The challenge','The foundation','The recent past','The best outcome','The near future','Yourself','Your environment','Hopes and fears','The outcome']}};
const CEL=[[230,170],[230,170],[230,340],[110,170],[230,0],[350,170],[500,450],[500,300],[500,150],[500,0]];
const G={state:'title',score:0,level:(JSON.parse(localStorage.tarotJ||'[]')).length};window.G=G;
const J=()=>JSON.parse(localStorage.tarotJ||'[]');
function pool(){return DEMO?DECK.filter(c=>c.maj):DECK}
function shuffled(){const a=pool().map(c=>c.id);for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function title(){G.state='title';const today=new Date().toDateString();let dc=JSON.parse(localStorage.tarotDaily||'null');
 S.innerHTML=`<div class="scr" style="text-align:center"><h1>🔮 Coffeebreak Tarot 💀🌹</h1><p>A gothic skull-and-rose deck of all 78 cards. Ask a question, shuffle, and turn over your cards.</p>
 <div class="row" style="justify-content:center"><input id="q" placeholder="Your question (optional)" style="width:340px" maxlength="120"></div>
 <div class="row" style="justify-content:center">${Object.entries(SPREADS).map(([k,s])=>`<button class="big sp" data-k="${k}" ${DEMO&&k!=='single'?'disabled':''}>${s.n}${DEMO&&k!=='single'?' 🔒':''}</button>`).join('')}</div>
 <div class="row" style="justify-content:center"><button id="daily">🌅 Daily card${dc&&dc.d===today?' (drawn)':''}</button><button id="jr">📖 Reading journal (${J().length})</button></div>
 ${DEMO?'<p style="color:#ffcf6a">Free demo: single-card readings with the 22 Major Arcana. The full deck, 3-card and Celtic Cross spreads are in the full game.</p>':''}${ENT}</div>`;
 S.querySelectorAll('.sp').forEach(b=>b.onclick=()=>{startMusic();read(b.dataset.k,$('q').value)});
 $('daily').onclick=()=>{startMusic();if(!dc||dc.d!==today){const a=shuffled();dc={d:today,id:a[0],rev:Math.random()<.3};localStorage.tarotDaily=JSON.stringify(dc)}read('daily','Card of the day',[{id:dc.id,rev:dc.rev}])};$('jr').onclick=journal}
function read(sp,q,fixed){G.state='play';const spec=sp==='daily'?{n:'Daily card',p:['Today']}:SPREADS[sp],deck=shuffled();
 const cards=fixed||spec.p.map((p,i)=>({id:deck[i],rev:Math.random()<.3}));let flipped=0;
 S.innerHTML=`<div class="scr" style="text-align:center"><h2>${spec.n}</h2>${q?`<p><i>“${esc(q)}”</i></p>`:''}<p id="hint">Shuffling the deck…</p><div id="lay" style="position:relative;margin:auto"></div><div id="mean" style="text-align:left;max-width:860px;margin:auto"></div>${ENT}</div>`;
 const lay=$('lay'),cel=sp==='celtic';if(cel){lay.style.width='600px';lay.style.height='600px'}
 const els=cards.map((cd,i)=>{const e=cardEl(cd,spec.p[i],cel);if(cel){e.style.position='absolute';e.style.left=CEL[i][0]+'px';e.style.top=(CEL[i][1]+16)+'px';e.style.margin=0;if(i===1){e.style.transform='rotate(90deg)';e.style.zIndex=2}}e.classList.add('shuf');lay.appendChild(e);return e});
 setTimeout(()=>{$('hint').textContent='Tap each card to turn it over.';els.forEach(e=>e.classList.remove('shuf'))},1100);
 els.forEach((e,i)=>e.onclick=()=>{if(e.classList.contains('up'))return;e.classList.add('up');flipped++;const cd=cards[i],D=DECK[cd.id];
  $('mean').insertAdjacentHTML('beforeend',`<p><b style="color:#e8a0b0">${esc(spec.p[i])}: ${D.name}${cd.rev?' (reversed)':''}</b><br>${cd.rev?'Reversed':'Upright'}: ${cd.rev?D.rv:D.up}.</p>`);
  if(flipped===cards.length)setTimeout(()=>summary(sp,q,cards,spec),700)})}
function summary(sp,q,cards,spec){G.state='over';const D=cards.map(c=>DECK[c.id]),maj=D.filter(d=>d.maj).length,rev=cards.filter(c=>c.rev).length;
 const cnt={};D.filter(d=>!d.maj).forEach(d=>cnt[d.suit]=(cnt[d.suit]||0)+1);const dom=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
 const lines=[];if(cards.length===1){const c=cards[0],d=D[0];lines.push(`${d.name} ${c.rev?'appears reversed, a gentle nudge to look at '+d.rv:'shines upright, bringing '+d.up}.`)}
 else{lines.push(maj>=cards.length/2?'Many Major Arcana: big life themes and fate are at work.':maj?'A mix of everyday matters and a touch of destiny.':'This reading is about everyday choices that are in your hands.');
  if(dom&&dom[1]>1)lines.push(`${dom[0]} dominate, so focus on ${SUITS.find(s=>s[0]===dom[0])[2]}.`);
  lines.push(rev>cards.length/2?'Several reversed cards suggest slowing down and looking inward.':rev?'A few reversals point to small blocks to clear.':'All upright: energy is flowing freely.');
  const last=D[D.length-1];lines.push(`The final card, ${last.name}, points toward ${cards[cards.length-1].rev?last.rv:last.up}.`)}
 G.score=cards.length*10+maj*5;
 $('mean').insertAdjacentHTML('beforeend',`<div class="card" style="max-width:none;cursor:default"><h3>✨ Reading summary</h3><p>${lines.join(' ')}</p><textarea id="note" rows="2" placeholder="Your notes for the journal…"></textarea>
 <div class="row"><button id="sv">📖 Save to journal</button><button id="ag">🔮 New reading</button></div></div>`);
 $('sv').onclick=()=>{const j=J();j.unshift({t:new Date().toLocaleString(),sp:spec.n,q:q||'',cards,sum:lines.join(' '),note:$('note').value});localStorage.tarotJ=JSON.stringify(j.slice(0,100));G.level=j.length;$('sv').textContent='Saved ✓';$('sv').disabled=true};
 $('ag').onclick=()=>{if(DEMO&&+(localStorage.tarotDemoN=(+localStorage.tarotDemoN||0)+1)>=3)return demoEnd('You have tried the free Major Arcana readings! The full 78-card deck, 3-card and Celtic Cross spreads are in the full game.');title()}}
function journal(){G.state='title';const j=J();S.innerHTML=`<div class="scr"><h2>📖 Reading journal</h2>${j.length?j.map((r,i)=>`<div class="card" style="max-width:none;cursor:default;margin:6px 0"><b>${esc(r.t)} · ${esc(r.sp)}</b>${r.q?' · <i>'+esc(r.q)+'</i>':''}<br>${r.cards.map(c=>DECK[c.id].name+(c.rev?' (R)':'')).join(', ')}<br><small>${esc(r.sum)}</small>${r.note?'<br>📝 '+esc(r.note):''} <button data-i="${i}" class="del">🗑</button></div>`).join(''):'<p>No saved readings yet.</p>'}<button id="bk">⬅ Back</button>${ENT}</div>`;
 S.querySelectorAll('.del').forEach(b=>b.onclick=()=>{const k=J();k.splice(+b.dataset.i,1);localStorage.tarotJ=JSON.stringify(k);journal()});$('bk').onclick=title}
title();
