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
// ---- Coffeebreak Dream Wedding ----
const S=$('stage'),esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const hero=new Image();hero.src='assets/hero.png';window.HERO_SRC='assets/hero.png';
const DEMO=!!window.DEMO,FREE=2;
const AFF=['I am worthy of a love that feels like home.','My dream wedding is already on its way to me.','Everything is unfolding perfectly for us.','I attract joy, abundance and beautiful moments.','Our love grows sweeter every single day.','I am grateful for the love surrounding me.','The universe is planning something magical for us.','I deserve a celebration as beautiful as our love.'];
const CAT=[
 {id:'venue',t:'🏰 Venue',o:[['Rose garden','🌹','#3a5a3a'],['Gothic chapel','⛪','#3a2a4a'],['Beach at sunset','🏖️','#c87a5a'],['Candlelit castle','🏰','#2a1a2a'],['Cosy coffee house','☕','#5a3a2a'],['Starry forest','🌲','#1a2a3a']]},
 {id:'theme',t:'🎨 Theme & colours',o:[['Blush & black','🖤',['#f6c6d2','#1a0a10','#e8a0b0']],['Lavender dream','💜',['#d8c4f0','#6a4a8a','#fff']],['Midnight roses','🌹',['#8a1030','#12060c','#ffcf6a']],['Mint & gold','💚',['#bfe8d4','#c8a040','#fff']],['Cotton candy','🍬',['#ffd1e8','#bfe3ff','#fff']],['Coffee & cream','☕',['#e8d4b8','#6b3a1e','#fff8ee']]]},
 {id:'outfit',t:'👗 Dress / suit',o:[['Lace ball gown','👰'],['Sharp black suit','🤵'],['Pastel tea dress','👗'],['Gothic velvet gown','🖤'],['Matching suits','🤵🤵'],['Boho flowing dress','🌸']]},
 {id:'flowers',t:'🌹 Flowers',o:[['Red roses','🌹'],['Blush peonies','🌸'],['Black roses','🥀'],['Wildflowers','🌼'],['White lilies','🤍'],['Sunflowers','🌻']]},
 {id:'cake',t:'🎂 Cake',o:[['Three-tier vanilla','🎂'],['Marshmallow tower','🍡'],['Chocolate skull cake','💀'],['Coffee cupcake tower','🧁'],['Rose velvet','🍰'],['Doughnut wall','🍩']]},
 {id:'music',t:'🎶 Music',o:[['Coffeebreak playlist','🎧'],['String quartet','🎻'],['Live band','🎸'],['Piano ballads','🎹'],['DJ dance party','💃'],['Acoustic guitar','🪕']]},
 {id:'guests',t:'💌 Guests',o:[['Just us (elopement)','💑'],['Close family','👪'],['Intimate 30','🥂'],['Big party 100','🎉'],['Fairytale 200','👑'],['Everyone we love','💞']]}];
const DECO=['🌹','🥀','🕯️','💐','🎀','🦋','💀','🍡','🎂','💍','🕊️','🌙','⭐','🎈','🍾','💖'];
const W={state:'title',score:0,level:+localStorage.wedBoards||0,aff:[],own:'',pick:{},items:[],grat:['','',''],step:0};window.W=W;window.G=W;
const STEPS=['Intentions',...CAT.map(c=>c.t.split(' ').slice(1).join(' ')),'Decorate','Gratitude','Vision Board'];
function mp(){let p=W.aff.length*10+(W.own.trim()?20+Math.min(30,W.own.trim().split(/\s+/).length*2):0);
 p+=Object.keys(W.pick).length*5+Math.min(60,W.items.length*3);
 W.grat.forEach(g=>{const n=g.trim().split(/\s+/).filter(Boolean).length;if(n)p+=10+Math.min(15,n)});
 const pos=/(love|joy|grateful|thank|happy|abundan|bless|beautiful|dream|magic)/gi;p+=Math.min(30,((W.own+W.grat.join(' ')).match(pos)||[]).length*3);return p}
function steps(){return `<div class="steps">${STEPS.map((s,i)=>`<span class="${i===W.step?'on':''}">${i+1}. ${s}</span>`).join('')}</div><div class="row"><b style="color:#ffcf6a">✨ Manifestation points: <span id="mp">${mp()}</span></b></div>`}
function nav(ok=true){return `<div class="row"><button id="bk">⬅ Back</button><button class="big" id="nx" ${ok?'':'disabled'}>Next ✨</button></div>`}
function wire(){const b=$('bk');if(b)b.onclick=()=>{W.step=Math.max(0,W.step-1);render()};const n=$('nx');if(n)n.onclick=()=>{W.step++;render()}}
function upd(){W.score=mp();const e=$('mp');if(e)e.textContent=W.score}
function title(){W.state='title';S.innerHTML=`<div class="scr" style="text-align:center"><img src="assets/hero.png" style="height:160px;filter:drop-shadow(0 0 14px #f6c6d2)"><h1>💍 Coffeebreak Dream Wedding</h1>
<p>Set your intentions, design your dream wedding, and manifest it onto a beautiful Vision Board.</p><p><button class="big" id="go">🌹 Start planning</button></p>
<p style="color:#e8a0b0">Vision boards made: ${W.level} · Best manifestation: ${+localStorage.wedBest||0}</p>${DEMO?'<p style="color:#ffcf6a">Free demo: 2 choices per category and 1 watermarked vision board.</p>':''}</div>`;
 $('go').onclick=()=>{startMusic();W.state='play';W.step=0;render()}}
function render(){W.state=W.step>=STEPS.length-1?'over':'play';const s=W.step;
 if(s===0){S.innerHTML=`<div class="scr">${steps()}<h2>✨ Set your intentions</h2><p>Tap the affirmations that feel true for you (+10 each), or write your own (+20 and more).</p>
 <div class="row">${AFF.map((a,i)=>`<div class="card aff ${W.aff.includes(i)?'sel':''}" data-i="${i}">${a}</div>`).join('')}</div>
 <p>My own affirmation:</p><textarea id="own" rows="2" maxlength="160" placeholder="I am…">${esc(W.own)}</textarea>${nav(W.aff.length||W.own.trim())}</div>`;
  S.querySelectorAll('.aff').forEach(c=>c.onclick=()=>{const i=+c.dataset.i;W.aff=W.aff.includes(i)?W.aff.filter(x=>x!==i):[...W.aff,i];c.classList.toggle('sel');upd();$('nx').disabled=!(W.aff.length||W.own.trim())});
  $('own').oninput=e=>{W.own=e.target.value;upd();$('nx').disabled=!(W.aff.length||W.own.trim())}}
 else if(s<=CAT.length){const C=CAT[s-1];S.innerHTML=`<div class="scr">${steps()}<h2>${C.t}</h2><div class="row">${C.o.map((o,i)=>{const lk=DEMO&&i>=FREE;return `<div class="card opt ${lk?'lock':''} ${W.pick[C.id]===i?'sel':''}" data-i="${i}" style="min-width:140px;text-align:center"><div style="font-size:40px">${o[1]}</div>${o[0]}${C.id==='theme'?'<br>'+o[2].map(c=>`<span class="sw" style="background:${c}"></span>`).join(''):''}${lk?'<br><small>🔒 full game</small>':''}</div>`}).join('')}</div>${nav(W.pick[C.id]!==undefined)}</div>`;
  S.querySelectorAll('.opt').forEach(c=>c.onclick=()=>{const i=+c.dataset.i;if(DEMO&&i>=FREE)return;W.pick[C.id]=i;S.querySelectorAll('.opt').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');upd();$('nx').disabled=false})}
 else if(s===CAT.length+1)decorate();
 else if(s===CAT.length+2){S.innerHTML=`<div class="scr">${steps()}<h2>🙏 Gratitude journal</h2><p>Write three things you are grateful for, as if your dream wedding has already happened.</p>
 ${W.grat.map((g,i)=>`<textarea class="gr" data-i="${i}" rows="2" maxlength="200" placeholder="I am so grateful that…">${esc(g)}</textarea>`).join('<br>')}${nav(true)}</div>`;
  S.querySelectorAll('.gr').forEach(t=>t.oninput=e=>{W.grat[+t.dataset.i]=e.target.value;upd()})}
 else board();
 wire()}
function theme(){return CAT[1].o[W.pick.theme??0][2]}
function decorate(){const th=theme(),v=CAT[0].o[W.pick.venue??0],deco=DEMO?DECO.slice(0,6):DECO;
 S.innerHTML=`<div class="scr">${steps()}<h2>🎀 Decorate your wedding scene</h2><p>Tap a decoration to add it, then drag it anywhere. Double-tap to remove. (+3 each)</p>
 <div class="row">${deco.map(d=>`<button class="dc">${d}</button>`).join('')}${DEMO?'<small style="color:#ffcf6a">🔒 10 more decorations in the full game</small>':''}<button id="clr">🧹 Clear</button></div>
 <div class="scene" id="scene" style="background:linear-gradient(${v[2]},${th[1]}),${th[0]}"><div style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);font-size:90px;opacity:.8">${v[1]}</div>
 <div style="position:absolute;left:50%;bottom:20px;transform:translateX(-50%);font-size:60px">${CAT[2].o[W.pick.outfit??0][1]}</div></div>${nav(true)}</div>`;
 const sc=$('scene');
 const put=it=>{const e=document.createElement('div');e.className='it';e.textContent=it.e;e.style.left=it.x*100+'%';e.style.top=it.y*100+'%';sc.appendChild(e);
  e.onpointerdown=ev=>{ev.preventDefault();e.setPointerCapture(ev.pointerId);const r=sc.getBoundingClientRect();e.onpointermove=m=>{it.x=Math.max(0,Math.min(.93,(m.clientX-r.left)/r.width-.03));it.y=Math.max(0,Math.min(.85,(m.clientY-r.top)/r.height-.06));e.style.left=it.x*100+'%';e.style.top=it.y*100+'%'};e.onpointerup=()=>{e.onpointermove=null}};
  e.ondblclick=()=>{W.items=W.items.filter(q=>q!==it);e.remove();upd()}};
 W.items.forEach(put);
 S.querySelectorAll('.dc').forEach(b=>b.onclick=()=>{if(W.items.length>=40)return;const it={e:b.textContent,x:.1+Math.random()*.8,y:.1+Math.random()*.6};W.items.push(it);put(it);upd()});
 $('clr').onclick=()=>{W.items=[];decorate();wire()}}
function wrap(c,t,x,y,mw,lh){const w=t.split(' ');let l='';for(const s of w){if(c.measureText(l+s).width>mw&&l){c.fillText(l,x,y);y+=lh;l=''}l+=s+' '}c.fillText(l,x,y);return y+lh}
function makeBoard(){const cv=document.createElement('canvas');cv.width=1200;cv.height=900;const c=cv.getContext('2d'),th=theme();
 const g=c.createLinearGradient(0,0,1200,900);g.addColorStop(0,th[0]);g.addColorStop(1,th[2]);c.fillStyle=g;c.fillRect(0,0,1200,900);
 c.strokeStyle=th[1];c.lineWidth=14;c.strokeRect(20,20,1160,860);c.textAlign='center';c.fillStyle=th[1];c.font='bold 60px Georgia';c.fillText('💍 My Dream Wedding 💍',600,100);
 c.font='italic 24px Georgia';c.fillText('Manifestation points: '+mp()+' ✨',600,140);
 CAT.forEach((C,i)=>{const o=C.o[W.pick[C.id]??0],cx=55+(i%4)*278,cy=180+(i/4|0)*210;c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.roundRect(cx,cy,258,180,20);c.fill();
  c.fillStyle=th[1];c.font='70px serif';c.fillText(o[1],cx+129,cy+85);c.font='bold 20px Georgia';c.fillText(C.t.replace(/^\S+\s/,''),cx+129,cy+125);c.font='19px Georgia';c.fillText(o[0],cx+129,cy+155)});
 if(hero.complete&&hero.naturalWidth)c.drawImage(hero,935,385,150,150*hero.naturalHeight/hero.naturalWidth);
 W.items.slice(0,30).forEach((it,i)=>{c.font='40px serif';c.globalAlpha=.85;c.fillText(it.e,40+it.x*1120,60+it.y*640);c.globalAlpha=1});
 c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.roundRect(60,610,1080,225,20);c.fill();c.fillStyle=th[1];c.textAlign='left';
 let y=650;c.font='bold 22px Georgia';c.fillText('My affirmations',90,y);y+=32;c.font='italic 20px Georgia';
 [...W.aff.map(i=>AFF[i]),W.own.trim()].filter(Boolean).slice(0,4).forEach(a=>{y=wrap(c,'✨ '+a,90,y,500,26)});
 y=650;c.font='bold 22px Georgia';c.fillText('I am grateful…',640,y);y+=32;c.font='italic 20px Georgia';W.grat.filter(s=>s.trim()).forEach(a=>{y=wrap(c,'🙏 '+a.trim(),640,y,480,26)});
 c.textAlign='center';c.font='16px Georgia';c.fillStyle=th[1];c.fillText('Made with Coffeebreak Dream Wedding · coffeebreaks.itch.io',600,862);
 if(DEMO){c.save();c.translate(600,450);c.rotate(-.5);c.globalAlpha=.28;c.fillStyle='#000';c.font='bold 90px Georgia';c.fillText('COFFEEBREAK DEMO',0,0);c.font='bold 40px Georgia';c.fillText('get the full game on itch.io',0,70);c.restore()}
 return cv}
function board(){W.score=mp();const n=+localStorage.wedBoards||0;if(!W.counted){W.counted=1;localStorage.wedBoards=W.level=n+1;localStorage.wedBest=Math.max(+localStorage.wedBest||0,W.score)}
 const cv=makeBoard(),url=cv.toDataURL('image/png');
 S.innerHTML=`<div class="scr">${steps()}<h2>🌹 Your Vision Board</h2><img id="vb" src="${url}" style="width:100%;max-width:900px;border-radius:12px;display:block;margin:auto">
 <div class="row" style="justify-content:center"><a id="dl" download="dream-wedding-vision-board.png" href="${url}"><button>⬇ Download PNG</button></a><button id="ed">✏️ Edit</button><button id="nw">💍 New wedding</button></div></div>`;
 $('ed').onclick=()=>{W.step=0;W.counted=0;localStorage.wedBoards=n;W.level=n;render()};
 $('nw').onclick=()=>{if(DEMO)return demoEnd('You made your free vision board! Unlock every venue, theme, dress, cake and decoration, plus unlimited watermark-free vision boards, in the full game.');Object.assign(W,{aff:[],own:'',pick:{},items:[],grat:['','',''],step:0,counted:0});render()};
 if(DEMO)setTimeout(()=>{const p=document.createElement('p');p.style.cssText='text-align:center;color:#ffcf6a';p.innerHTML='Demo board includes a watermark. <button id="gf">Get the full game</button>';S.querySelector('.scr').appendChild(p);$('gf').onclick=()=>demoEnd()},50)}
title();
