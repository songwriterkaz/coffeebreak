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
// ---- Coffeebreak Spirit Messages ----
const S=$('stage'),esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
const DEMO=!!window.DEMO,DISC='<div class="ent">For entertainment and comfort only. These messages are imaginative reflections, not real contact with anyone who has passed.</div>';
const REL=['Mum','Dad','Nan','Pop','Grandma','Grandpa','Partner','Husband','Wife','Sister','Brother','Son','Daughter','Aunt','Uncle','Cousin','Best friend','Friend','Pet'];
const TR=['kind','funny','strong','gentle','brave','cheeky','wise','creative','loving','generous'];
const OPEN=['As the candle glows, imagine {n} smiling at you and saying…','In the quiet of this little light, picture {n} close by, as if whispering…','Let the warmth of the flame carry a loving thought from {n}…','Close your eyes for a moment. Imagine {n}, your {r}, would want you to hear…'];
const MSG=['I am so proud of the person you are becoming.','Every time you laugh, I am laughing with you.','You do not have to carry it all alone. Rest, my love.','I see how hard you try, and it is more than enough.','Keep making your music and your art. It lights up the world.','The love we shared never went anywhere. It lives in you.','When you see a little bird, a feather or a rose, let it remind you of me.','Please be gentle with yourself today.','I would want you to have that cup of coffee and enjoy it slowly.','Do the brave thing. You have always been braver than you know.','Remember that silly day we laughed until we cried? Hold onto that.','You were the best thing in my life.','I am not worried about you. I know you will be okay.','Look after your heart. It is a beautiful one.','Thank you for remembering me. It means everything.','Let the old worries go. Something good is coming.','Dance in the kitchen. Sing too loudly. Live fully.','You made my world so much brighter.','I hope you know how loved you are, today and always.','Hug the people near you a little tighter for me.'];
const PET=['You were my favourite person in the whole world.','Thank you for every walk, every cuddle, every treat.','I am chasing butterflies and sunbeams, and I am happy.','When you feel a soft warmth on your lap, imagine it is me.','You gave me the best life a pet could dream of.'];
const CLOSE=['With all my love, always.','Forever in your heart.','Until we meet again in your dreams.','Love, always and always.','Keep shining.'];
const SIGN=['a white feather','a red rose','a butterfly','a rainbow','a song on the radio','a robin','a warm breeze','a shooting star','a coin on the ground','the smell of fresh coffee'];
const G={state:'title',score:0,level:+localStorage.spN||0,n:'',r:'Mum',tr:'kind',lit:0,count:0};window.G=G;
const fav=()=>JSON.parse(localStorage.spFav||'[]');
const pick=a=>a[Math.random()*a.length|0];
function title(){G.state='title';G.lit=0;S.innerHTML=`<div class="scr" style="text-align:center"><h1>🕯️ Coffeebreak Spirit Messages 🌹</h1>
 <p>A gentle, comforting space to remember someone you love. Enter their name, light a candle, and receive warm, uplifting words inspired by love and memory.</p>
 <div class="row" style="justify-content:center"><input id="nm" placeholder="Their name" maxlength="30" value="${esc(G.n)}"> <select id="rl">${REL.map(r=>`<option ${r===G.r?'selected':''}>${r}</option>`).join('')}</select> <select id="tr">${TR.map(r=>`<option ${r===G.tr?'selected':''}>${r}</option>`).join('')}</select></div>
 <p><button class="big" id="go">🕯️ Go to the candle</button> <button id="fv">💌 Saved messages (${fav().length})</button></p>${DEMO?'<p style="color:#ffcf6a">Free demo: 3 messages. Unlimited messages, saved keepsakes and more candle colours are in the full game.</p>':''}${DISC}</div>`;
 $('go').onclick=()=>{startMusic();G.n=$('nm').value.trim()||'your loved one';G.r=$('rl').value;G.tr=$('tr').value;candle()};$('fv').onclick=favs}
function candle(){G.state='play';S.innerHTML=`<div class="scr" style="text-align:center"><h2>For ${esc(G.n)}, my ${esc(G.r.toLowerCase())}</h2><p id="hint">Tap the candle to light it, and take a slow, deep breath.</p>
 <div id="cand"><span class="flame" id="fl" style="visibility:hidden">🔥</span><br>🕯️</div><div id="out"></div><div class="row" style="justify-content:center" id="acts"></div><p><button id="bk">⬅ Back</button></p>${DISC}</div>`;
 $('cand').onclick=()=>{if(G.lit)return;G.lit=1;$('fl').style.visibility='visible';$('cand').classList.add('lit');$('hint').textContent='Breathe in… and out…';setTimeout(message,2200)};$('bk').onclick=title}
function message(){if(DEMO&&G.count>=3)return demoEnd('Thank you for spending time with your memories. Unlimited gentle messages and saved keepsakes are in the full game.');
 G.count++;G.score=G.count;localStorage.spN=G.level=(+localStorage.spN||0)+1;const isPet=G.r==='Pet';
 const body=[pick(isPet?PET:MSG),pick(MSG)];if(body[0]===body[1])body.pop();
 const t=`${pick(OPEN).replace('{n}',esc(G.n)).replace('{r}',esc(G.r.toLowerCase()))}<br><br>“${body.join(' ')} You were always so ${G.tr}, and that ${G.tr} heart still shines in you.”<br><br>— ${pick(CLOSE)}<br><small style="font-style:normal;color:#e8c0a0">A sign to look for: ${pick(SIGN)}.</small>`;
 const d=document.createElement('div');d.className='msg';d.innerHTML=t;$('out').innerHTML='';$('out').appendChild(d);setTimeout(()=>d.classList.add('on'),50);$('hint').textContent='💗 Take what feels comforting, and leave the rest.';
 $('acts').innerHTML='<button id="an">🕯️ Another message</button><button id="sv">💌 Save keepsake</button><button id="cp">📋 Copy</button>';
 $('an').onclick=message;$('cp').onclick=()=>navigator.clipboard&&navigator.clipboard.writeText(d.innerText).catch(()=>{});
 $('sv').onclick=()=>{const f=fav();f.unshift({n:G.n,r:G.r,t:d.innerText,d:new Date().toLocaleDateString()});localStorage.spFav=JSON.stringify(f.slice(0,50));$('sv').textContent='Saved 💗';$('sv').disabled=true}}
function favs(){G.state='title';const f=fav();S.innerHTML=`<div class="scr"><h2>💌 Saved messages</h2>${f.length?f.map((m,i)=>`<div class="card" style="max-width:none;cursor:default;margin:8px 0"><b>${esc(m.n)} · ${esc(m.r)} · ${esc(m.d)}</b><br><span style="white-space:pre-wrap">${esc(m.t)}</span><br><button class="del" data-i="${i}">🗑</button></div>`).join(''):'<p>No saved messages yet.</p>'}<button id="bk">⬅ Back</button>${DISC}</div>`;
 S.querySelectorAll('.del').forEach(b=>b.onclick=()=>{const k=fav();k.splice(+b.dataset.i,1);localStorage.spFav=JSON.stringify(k);favs()});$('bk').onclick=title}
title();
