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
// ---- Coffeebreak Rune Reading ----
const S=$('stage'),DEMO=!!window.DEMO,esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
// [name, symbol, sound, meaning word, upright, reversed or null (cannot be reversed)]
const RUNES=[
['Fehu','ᚠ','f','Cattle, wealth','Abundance, earned wealth and new beginnings in money. Your hard work is about to pay off; share your good fortune.','Loss or delay of money, greed or wasted energy. Look after what you already have.'],
['Uruz','ᚢ','u','Aurochs, strength','Raw strength, health and courage. A burst of energy helps you overcome what stands in your way.','Weakness, low energy or missed chances. Rest and rebuild your strength before pushing on.'],
['Thurisaz','ᚦ','th','Thorn, giant','A protective force and a moment to pause before acting. Defend what matters, but think before you strike.','Danger of acting rashly, or feeling defenceless. Avoid hasty decisions.'],
['Ansuz','ᚨ','a','God, mouth, message','Messages, wisdom and inspiration. Listen closely: advice or a sign is coming, perhaps through words or music.','Misunderstandings, mixed messages or bad advice. Check the facts.'],
['Raidho','ᚱ','r','Journey, wheel','Travel, movement and being on the right path. Things are moving in rhythm.','Delays, a disrupted journey or feeling stuck. Re-plan your route.'],
['Kenaz','ᚲ','k','Torch','Light, creativity and clarity. A torch shines on your path; your creative fire is strong.','Lost inspiration or something hidden. Let an old flame go out to make room for a new one.'],
['Gebo','ᚷ','g','Gift','Gifts, partnership and generosity. Balance between giving and receiving; a loving exchange.',null],
['Wunjo','ᚹ','w','Joy','Joy, harmony and belonging. Happiness with friends and family, and success in your efforts.','Sadness, conflict or feeling left out. The joy will return; reach out to someone.'],
['Hagalaz','ᚺ','h','Hail','Sudden disruption that clears the way. Like a hailstorm, it passes and leaves fresh ground for growth.',null],
['Naudhiz','ᚾ','n','Need','Need, patience and resilience. Hardship teaches you what you truly want; keep going.','Desperation or wanting the wrong thing. Ask what you really need.'],
['Isa','ᛁ','i','Ice','Stillness and pause. Things are frozen for now; wait, reflect and keep calm.',null],
['Jera','ᛃ','j','Year, harvest','Harvest and reward after patient effort. What you planted is ready to bloom in its own season.',null],
['Eihwaz','ᛇ','ei','Yew tree','Endurance, protection and transformation. Like the evergreen yew, you are strong through every season.',null],
['Perthro','ᛈ','p','Lot cup, mystery','Mystery, fate and secrets about to be revealed. Trust the unknown, luck is in the cup.','Unpleasant surprises or secrets kept from you. Trust your intuition.'],
['Algiz','ᛉ','z','Elk, protection','Protection and a shield around you. You are guarded by friends, ancestors and your own instincts.','Hidden danger or ignoring your gut. Take care of yourself.'],
['Sowilo','ᛊ','s','Sun','Success, victory and wholeness. The sun shines on you; your goals are within reach.',null],
['Tiwaz','ᛏ','t','The god Tyr','Courage, justice and honour. Stand up for what is right, and victory follows.','Low confidence or an unfair situation. Find your courage again.'],
['Berkano','ᛒ','b','Birch, birth','Birth, growth and nurturing. New beginnings, fertility of ideas and family blessings.','Family worries or stalled growth. Nurture yourself first.'],
['Ehwaz','ᛖ','e','Horse','Teamwork, trust and steady progress. A loyal partner or friend carries you forward.','Restlessness or a broken partnership. Slow down and rebuild trust.'],
['Mannaz','ᛗ','m','Humankind','The self and others. Community, friendship and seeing yourself clearly.','Isolation or self-doubt. Remember you are not alone.'],
['Laguz','ᛚ','l','Water, lake','Intuition, emotions and flow. Go with the current and trust your dreams.','Confusion or fear of your feelings. Do not make decisions in a muddle.'],
['Ingwaz','ᛜ','ng','The god Ing, seed','Rest, completion and potential. A seed of something new is quietly growing.',null],
['Dagaz','ᛞ','d','Day, dawn','Breakthrough and awakening. The dawn arrives; a hopeful turning point.',null],
['Othala','ᛟ','o','Heritage, home','Home, inheritance and roots. Your family, your traditions and what truly belongs to you.','Feeling homeless or cut off from roots. Make your own sense of home.'],
['Wyrd','◯','(blank)','The blank rune, fate','The blank rune: the unknowable. Your future is not written yet; it is yours to shape.',null]];
const RP=[[[.3,0,.3,1],[.3,.3,.75,0],[.3,.55,.75,.25]],[[.3,1,.3,0],[.3,0,.7,.35],[.7,.35,.7,1]],[[.35,0,.35,1],[.35,.25,.7,.5],[.7,.5,.35,.75]],[[.3,0,.3,1],[.3,0,.7,.3],[.3,.3,.7,.6]],[[.3,0,.3,1],[.3,0,.7,.25],[.7,.25,.3,.5],[.3,.5,.7,1]],[[.65,.2,.35,.5],[.35,.5,.65,.8]],[[.25,0,.75,1],[.75,0,.25,1]],[[.3,0,.3,1],[.3,0,.7,.2],[.7,.2,.3,.45]],[[.3,0,.3,1],[.7,0,.7,1],[.3,.35,.7,.6]],[[.5,0,.5,1],[.3,.35,.7,.6]],[[.5,0,.5,1]],[[.45,.1,.25,.35],[.25,.35,.45,.6],[.55,.4,.75,.65],[.75,.65,.55,.9]],[[.5,0,.5,1],[.5,0,.7,.15],[.5,1,.3,.85]],[[.3,0,.3,1],[.3,0,.7,.2],[.3,1,.7,.8],[.7,.2,.55,.35],[.7,.8,.55,.65]],[[.5,0,.5,1],[.5,.4,.25,0],[.5,.4,.75,0]],[[.65,0,.35,.35],[.35,.35,.65,.65],[.65,.65,.35,1]],[[.5,0,.5,1],[.5,0,.25,.3],[.5,0,.75,.3]],[[.3,0,.3,1],[.3,0,.7,.25],[.7,.25,.3,.5],[.3,.5,.7,.75],[.7,.75,.3,1]],[[.25,1,.25,0],[.25,0,.5,.3],[.5,.3,.75,0],[.75,0,.75,1]],[[.25,1,.25,0],[.75,1,.75,0],[.25,0,.75,.4],[.75,0,.25,.4]],[[.35,0,.35,1],[.35,0,.7,.3]],[[.5,.15,.75,.5],[.75,.5,.5,.85],[.5,.85,.25,.5],[.25,.5,.5,.15]],[[.25,0,.25,1],[.75,0,.75,1],[.25,0,.75,1],[.75,0,.25,1]],[[.5,0,.75,.3],[.75,.3,.5,.6],[.5,.6,.25,.3],[.25,.3,.5,0],[.5,.6,.25,1],[.5,.6,.75,1]],[]];
function glyph(x,i,X,Y,sz,col){x.save();x.strokeStyle=col||'#c2264a';x.lineWidth=Math.max(2,sz*.09);x.lineCap='round';RP[i].forEach(l=>{x.beginPath();x.moveTo(X+(l[0]-.5)*sz,Y+(l[1]-.5)*sz);x.lineTo(X+(l[2]-.5)*sz,Y+(l[3]-.5)*sz);x.stroke()});if(!RP[i].length){x.globalAlpha*=.4;x.beginPath();x.arc(X,Y,sz*.25,0,7);x.stroke()}x.restore()}
function gIMG(i,sz,col){const c=document.createElement('canvas');c.width=c.height=sz;glyph(c.getContext('2d'),i,sz/2,sz/2,sz*.8,col||'#ffcf8a');return '<img src="'+c.toDataURL()+'" width="'+sz+'" height="'+sz+'" style="vertical-align:middle">'}
const SPREADS={single:{n:'Single rune',pos:['Your answer']},three:{n:'Past · Present · Future',pos:['Past','Present','Future']},cross:{n:'Five-rune cross',pos:['The present','The past','The future','What helps you','The outcome']}};
const G={state:'title',score:0,level:+localStorage.runeN||0};window.G=G;let useBlank=localStorage.runeBlank!=='0',spread='single',cast=null,shake=0;
const J=()=>JSON.parse(localStorage.runeJ||'[]');
function shell(h){S.innerHTML='<div class="scr">'+h+'<div class="ent" style="font-size:11px;opacity:.55">For entertainment only.</div></div>'}
function title(){shell(`<h1>🪨 Coffeebreak Rune Reading 🕯️</h1><p>Ask the runes your question, shake the velvet pouch, and cast the stones.</p>
 <p><input id="q" maxlength="120" placeholder="Ask your question…"></p>
 <p>${Object.entries(SPREADS).map(([k,s])=>`<button data-sp="${k}" class="${k===spread?'on':''}" style="${k===spread?'background:#e8a0b0;color:#1a0a10':''}">${s.n}${DEMO&&k!=='single'?' 🔒':''}</button>`).join(' ')}</p>
 <p><label><input type="checkbox" id="bl" ${useBlank?'checked':''}> include the blank rune (Wyrd)</label></p>
 <canvas id="cv" width="820" height="500"></canvas><p id="hint">Drag the pouch side to side (or tap it) to shake, then press Cast.</p>
 <p><button class="big" id="go">✨ Cast the runes</button> <button id="enc">📖 Rune encyclopedia</button> <button id="jr">📓 Journal (${J().length})</button></p><div id="out"></div>`);
 S.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{if(DEMO&&b.dataset.sp!=='single')return demoEnd('The three-rune and five-rune cross spreads, plus the full journal, are in the full game.');spread=b.dataset.sp;const q=$('q').value;title();$('q').value=q});
 $('bl').onchange=e=>{useBlank=e.target.checked;localStorage.runeBlank=useBlank?'1':'0'};$('go').onclick=doCast;$('enc').onclick=enc;$('jr').onclick=journal;
 const c=$('cv');let last=null;const px=e=>{const r=c.getBoundingClientRect();return(e.clientX-r.left)*820/r.width};c.onpointerdown=e=>{startMusic();last=px(e);shake+=.3};c.onpointermove=e=>{if(last!=null){const p=px(e);shake+=Math.abs(p-last)/300;last=p}};c.onpointerup=()=>last=null;cast=null;loop()}
let raf;function loop(){cancelAnimationFrame(raf);const c=$('cv');if(!c)return;const x=c.getContext('2d');let t0=performance.now();
 const f=n=>{const t=(n-t0)/1000;if(!$('cv'))return;shake=Math.max(0,shake-0.01);
  // background: dark wood + candles
  x.fillStyle='#14100e';x.fillRect(0,0,820,500);for(let i=0;i<820;i+=60){x.fillStyle=i/60%2?'#1c1612':'#181210';x.fillRect(i,0,58,500)}
  const g=x.createRadialGradient(410,260,20,410,260,420);g.addColorStop(0,'rgba(255,170,80,.22)');g.addColorStop(1,'rgba(0,0,0,.6)');x.fillStyle=g;x.fillRect(0,0,820,500);
  [[60,120],[760,120]].forEach(([X,Y],i)=>{x.fillStyle='#e8dcc0';x.fillRect(X-12,Y,24,90);const fl=Math.sin(t*11+i)*2;x.fillStyle='rgba(255,170,60,.25)';x.beginPath();x.arc(X,Y-14,30,0,7);x.fill();x.fillStyle='#ffcf4a';x.beginPath();x.ellipse(X+fl*.4,Y-14,6,14+fl,0,0,7);x.fill()});
  // cloth
  x.fillStyle='#2a0e1a';x.beginPath();x.ellipse(410,310,340,150,0,0,7);x.fill();x.strokeStyle='#8a6a3a';x.lineWidth=2;x.stroke();
  if(!cast){const sx=Math.sin(t*25)*shake*10;x.save();x.translate(410+sx,180);x.rotate(Math.sin(t*20)*shake*.06);x.fillStyle='#5a1a3a';x.beginPath();x.moveTo(-70,-20);x.quadraticCurveTo(-95,90,0,100);x.quadraticCurveTo(95,90,70,-20);x.fill();x.fillStyle='#7a2a4a';x.fillRect(-55,-40,110,26);x.strokeStyle='#d8a830';x.lineWidth=4;x.beginPath();x.moveTo(-55,-14);x.lineTo(55,-14);x.stroke();glyph(x,4,0,45,40,'#d8a830');x.restore();
   if(shake>.2){x.fillStyle='#ffcf8a';x.font='14px Georgia';x.textAlign='center';x.fillText('clack clack…',410+Math.sin(t*9)*40,90)}}
  else cast.forEach((s,i)=>{const k=Math.min(1,Math.max(0,(t-s.d)/.6)),e=1-Math.pow(1-k,3),X=410+(s.x-410)*e,Y=170+(s.y-170)*e-Math.sin(k*Math.PI)*80;x.save();x.translate(X,Y);x.rotate(s.r*e+(1-e)*6);
   x.fillStyle='#8a8478';x.beginPath();x.ellipse(0,0,34,42,0,0,7);x.fill();x.fillStyle='#a8a090';x.beginPath();x.ellipse(-6,-8,24,28,0,0,7);x.fill();
   if(k>=1&&s.flip<1)s.flip=Math.min(1,s.flip+.05);const R=RUNES[s.i];x.save();if(s.rev)x.rotate(Math.PI);x.globalAlpha=s.flip;glyph(x,s.i,0,0,44);x.restore();x.restore();
   if(s.flip>=1){x.fillStyle='#ffe9c7';x.font='12px Georgia';x.textAlign='center';x.fillText(SPREADS[s.sp].pos[i]+': '+R[0]+(s.rev?' (merkstave)':''),s.x,s.y+60)}});
  raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
const LAYOUT={single:[[410,300]],three:[[230,300],[410,300],[590,300]],cross:[[410,300],[240,300],[580,300],[410,175],[410,425]]};
function doCast(){startMusic();const q=$('q').value.trim()||'What do I need to know?';const pool=RUNES.map((r,i)=>i).filter(i=>useBlank||i<24);for(let i=pool.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[pool[i],pool[j]]=[pool[j],pool[i]]}
 const L=LAYOUT[spread];cast=L.map((p,k)=>({i:pool[k],rev:RUNES[pool[k]][5]!==null&&Math.random()<.35,x:p[0],y:p[1],r:(Math.random()-.5)*.4,d:k*.35+.1,flip:0,sp:spread}));
 const res=cast.map((s,k)=>{const R=RUNES[s.i];return{pos:SPREADS[spread].pos[k],n:R[0],sym:s.i,rev:s.rev,txt:s.rev?R[5]:R[4]}});
 const sum=res.filter(r=>!r.rev).length>=res.length/2?'Overall, the runes lean bright: the energy around your question is supportive. Move forward with trust.':'Overall, the runes ask for care: slow down, look inward and let things settle before acting.';
 setTimeout(()=>{if(!$('out'))return;$('out').innerHTML=`<div class="box"><h3>“${esc(q)}”</h3>${res.map(r=>`<p>${gIMG(r.sym,32)} <b>${r.pos}: ${r.n}${r.rev?' (merkstave, reversed)':''}</b><br>${esc(r.txt)}</p>`).join('')}<p><i>${sum}</i></p><button id="sv">📓 Save to journal</button></div>`;
  $('sv').onclick=()=>{const j=J();j.unshift({d:new Date().toLocaleString(),q,sp:SPREADS[spread].n,res,sum});localStorage.runeJ=JSON.stringify(j.slice(0,200));$('sv').textContent='✓ Saved';$('sv').disabled=true}},cast.length*350+1300);
 G.score=cast.length;localStorage.runeN=G.level=(+localStorage.runeN||0)+1;shake=0}
function enc(){shell(`<h2>📖 Rune encyclopedia</h2><p>The 24 runes of the Elder Futhark, in three ætts, plus the modern blank rune.</p><div>${RUNES.map((r,i)=>`<div class="rn" data-r="${i}">${gIMG(i,40)}<br>${r[0]}<br><small>"${r[2]}"</small></div>`).join('')}</div><div id="det"></div><p><button id="b">⬅ Back</button></p>`);
 S.querySelectorAll('[data-r]').forEach(e=>e.onclick=()=>{const r=RUNES[+e.dataset.r],i=+e.dataset.r;$('det').innerHTML=`<div class="box"><h3>${gIMG(i,54)} ${r[0]}</h3><p><b>Sound:</b> ${r[2]} · <b>Meaning:</b> ${r[3]}${i<24?' · <b>Ætt:</b> '+["Freyr's","Heimdall's","Tyr's"][Math.floor(i/8)]:''}</p><p><b>Upright:</b> ${r[4]}</p><p><b>Merkstave (reversed):</b> ${r[5]||'This rune looks the same either way, so it has no reversed meaning.'}</p></div>`;$('det').scrollIntoView({behavior:'smooth'})});$('b').onclick=title}
function journal(){const j=J();shell(`<h2>📓 Rune journal</h2>${j.length?j.map((e,k)=>`<div class="box"><b>${esc(e.d)}</b> · ${e.sp}<br><i>“${esc(e.q)}”</i><br>${e.res.map(r=>`${typeof r.sym==='number'?gIMG(r.sym,20):r.sym} ${r.pos}: ${r.n}${r.rev?' (merkstave)':''}`).join(' · ')}<br><small>${e.sum}</small> <button data-del="${k}">🗑️</button></div>`).join(''):'<p>No readings saved yet.</p>'}<p><button id="b">⬅ Back</button></p>`);
 S.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const j=J();j.splice(+b.dataset.del,1);localStorage.runeJ=JSON.stringify(j);journal()});$('b').onclick=title}
title();
