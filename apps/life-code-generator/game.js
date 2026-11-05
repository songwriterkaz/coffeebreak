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
// ===== Coffeebreak Life Code Generator =====
const DEMO=!!window.DEMO,SK=DEMO?'lifecodeDemo':'lifecodeSave';
const AREAS=[['love','💖 Love','#ff7ab0'],['money','💰 Money','#ffd04a'],['health','🌿 Health','#6fe0a0'],['career','🚀 Career','#7ab8ff'],['peace','🕊️ Peace','#c8b8ff'],['creativity','🎨 Creativity','#ffa05a']];
const OPEN=DEMO?['love','money','peace']:AREAS.map(a=>a[0]);
const NOTE='For inspiration and fun; not a guarantee.';
let S={name:'',bd:'',area:'love',codes:[],journal:[],board:[],dayKey:'',dayCount:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const today=()=>new Date().toDateString();
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function hash(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0}return h}
function rng(seed){return()=>{seed=(Math.imul(seed^seed>>>15,2246822507)+0x6D2B79F5)>>>0;return(seed>>>0)/4294967296}}
function lifePath(bd){if(!/^\d{4}-\d{2}-\d{2}$/.test(bd))return null;let n=bd.replace(/\D/g,'').split('').reduce((a,b)=>a+ +b,0);while(n>9&&n!==11&&n!==22&&n!==33)n=String(n).split('').reduce((a,b)=>a+ +b,0);return n}
const LP={1:'The Trailblazer: bold beginnings',2:'The Harmoniser: gentle connection',3:'The Spark: joyful expression',4:'The Builder: steady foundations',5:'The Free Spirit: change and adventure',6:'The Nurturer: love and home',7:'The Seeker: inner wisdom',8:'The Powerhouse: abundance and drive',9:'The Old Soul: compassion and completion',11:'Master 11, The Lightbearer',22:'Master 22, The Dream Architect',33:'Master 33, The Heart Teacher'};
const SEED={love:'528',money:'888',health:'741',career:'369',peace:'174',creativity:'333'};
const AFF={love:['I am worthy of deep, kind love.','I am open to giving and receiving love.','I am surrounded by people who cherish me.','I am magnetic to loving connection.','I am love, and love finds me easily.'],
money:['I am a magnet for abundance.','I am grateful for money flowing to me.','I am wise and calm with my finances.','I am open to new streams of income.','I am worthy of prosperity.'],
health:['I am healing a little more every day.','I am grateful for my strong body.','I am gentle with myself.','I am full of energy and calm.','I am choosing what nourishes me.'],
career:['I am confident in my gifts.','I am creating work I love.','I am ready for the right opportunities.','I am valued and respected.','I am growing every single day.'],
peace:['I am calm, safe and grounded.','I am letting go of what I cannot control.','I am at peace with my past.','I am breathing in peace, breathing out worry.','I am exactly where I need to be.'],
creativity:['I am overflowing with ideas.','I am brave enough to create.','I am a channel for beautiful things.','I am inspired everywhere I look.','I am proud of what I make.']};
const SCRIPT=['I am waking up in my dream life. Describe the first thing I see…','I am so grateful now that ___ has happened. Here is how it feels…','I am telling my best friend the amazing news: …','I am looking back one year from today. The biggest change is…','I am living as the person who already has this. Today I…','I am celebrating tonight because…'];
function makeCode(area,extra){const r=rng(hash(S.name+'|'+S.bd+'|'+area+'|'+extra));const lp=lifePath(S.bd)||7;let d='';for(let i=0;i<7;i++)d+=Math.floor(r()*10);
 const code=SEED[area]+' '+d.slice(0,4)+' '+d.slice(4)+lp;const affs=[...AFF[area]].sort(()=>r()-.5).slice(0,3);return{area,code,lp,affs,ts:Date.now()}}
function dailyCode(){return makeCode(S.area,'day:'+today())}
const css=document.createElement('style');css.textContent=`#lc{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,96vw);height:min(86vh,720px);background:linear-gradient(#2a1650,#0d0620);border:2px solid #c9a0ff;border-radius:22px;color:#f4ecff;font:15px/1.45 system-ui,Segoe UI,Arial,sans-serif;display:none;flex-direction:column;box-shadow:0 10px 50px #000a}
#lc .tb{display:flex;flex-wrap:wrap;gap:4px;padding:8px;border-bottom:1px solid #5a3a8a}#lc .tb button{background:#3a2060;color:#f4ecff;border:1px solid #7a5ab0;border-radius:12px;padding:5px 9px;cursor:pointer;font-size:13px}#lc .tb button.on{background:#c9a0ff;color:#1a0a30}
#lc .bd{flex:1;overflow:auto;padding:12px 16px}#lc input,#lc textarea,#lc select{background:#1a0e30;color:#fff;border:1px solid #7a5ab0;border-radius:10px;padding:7px;font-size:14px;box-sizing:border-box}
#lc .btn{background:#c9a0ff;color:#1a0a30;border:0;border-radius:12px;padding:8px 14px;font-weight:bold;cursor:pointer;margin:4px 4px 0 0}#lc .card{background:#ffffff12;border-radius:14px;padding:10px 12px;margin:8px 0}
#lc .code{font:bold 34px Georgia,serif;letter-spacing:4px;color:#ffe08a;text-align:center;margin:8px 0}#lc .nt{font-size:11px;color:#b8a8d8;text-align:center;padding:4px}#lc .x{position:absolute;right:12px;top:8px;background:none;border:0;color:#fff;font-size:20px;cursor:pointer}
#lc .ar{display:inline-block;margin:3px;padding:6px 10px;border-radius:14px;border:1px solid #7a5ab0;cursor:pointer}#lc .ar.on{background:#c9a0ff;color:#1a0a30}#lc .ar.lk{opacity:.4}
#lc .vb{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}#lc .vb div{background:#ffffff14;border-radius:10px;padding:6px;min-height:90px;position:relative;text-align:center}#lc .vb img{max-width:100%;max-height:120px;border-radius:8px}`;document.head.appendChild(css);
const lc=document.createElement('div');lc.id='lc';document.body.appendChild(lc);
let tab='gen',cur=null,timer=null,tLeft=0,tReps=0;
const TABS=[['gen','🔢 My Code'],['day','☀️ Daily'],['focus','🧘 Focus'],['script','✍️ Scripting'],['jr','📔 Journal'],['vb','🖼️ Vision Board'],['saved','💾 Saved']];
function openApp(t){tab=t||'gen';G.state='app';lc.style.display='flex';render()}
function closeApp(){lc.style.display='none';G.state='title';stopTimer()}
function shell(body){lc.innerHTML='<button class="x">✕</button><div class="tb">'+TABS.map(t=>'<button data-t="'+t[0]+'" class="'+(tab===t[0]?'on':'')+'">'+t[1]+'</button>').join('')+'</div><div class="bd">'+body+'</div><div class="nt">✨ '+NOTE+(DEMO?' · Free demo: 3 areas, 1 code a day':'')+'</div>';
 lc.querySelector('.x').onclick=closeApp;lc.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(tab==='focus')stopTimer();tab=b.dataset.t;render()});lc.querySelectorAll('input,textarea').forEach(i=>i.onkeydown=e=>e.stopPropagation())}
function areaPick(){return AREAS.map(a=>{const lk=!OPEN.includes(a[0]);return'<span class="ar'+(S.area===a[0]?' on':'')+(lk?' lk':'')+'" data-a="'+a[0]+'">'+a[1]+(lk?' 🔒':'')+'</span>'}).join('')}
function bindAreas(){lc.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(!OPEN.includes(b.dataset.a))return window.demoEnd&&window.demoEnd('Health, Career and Creativity codes are in the full <b>Coffeebreak Life Code Generator</b>.');S.area=b.dataset.a;save();render()})}
function codeCard(c){const a=AREAS.find(z=>z[0]===c.area);return'<div class="card" style="border:2px solid '+a[2]+'"><div style="text-align:center">'+a[1]+' code for <b>'+esc(S.name||'you')+'</b></div><div class="code">'+c.code+'</div><div style="text-align:center">Life Path <b>'+c.lp+'</b>, '+(LP[c.lp]||'')+'</div><ul>'+c.affs.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul></div>'}
function canGen(){if(!DEMO)return true;if(S.dayKey!==today()){S.dayKey=today();S.dayCount=0}return S.dayCount<1}
function render(){if(tab==='gen'){const lp=lifePath(S.bd);
 shell('<h2>🔢 Generate your Life Code</h2><p>Your name<br><input id="nm" value="'+esc(S.name)+'" maxlength="40" style="width:100%"></p><p>Birth date<br><input id="bdt" type="date" value="'+esc(S.bd)+'"></p>'+(lp?'<p>Your numerology Life Path: <b>'+lp+'</b>, '+LP[lp]+'</p>':'')+'<p>What do you desire?<br>'+areaPick()+'</p><button class="btn" id="go">✨ Generate my code</button>'+(cur?codeCard(cur)+'<button class="btn" id="png">🖼️ Save code card (PNG)</button><button class="btn" id="sv">💾 Keep this code</button><button class="btn" id="fo">🧘 Repeat it now</button>':''));
 bindAreas();const up=()=>{S.name=lc.querySelector('#nm').value.trim();S.bd=lc.querySelector('#bdt').value;save()};lc.querySelector('#nm').onchange=up;lc.querySelector('#bdt').onchange=()=>{up();render()};
 lc.querySelector('#go').onclick=()=>{up();if(!S.name||!lifePath(S.bd)){alert('Please enter your name and birth date.');return}if(!canGen())return window.demoEnd&&window.demoEnd('The free demo gives you 1 new code a day. Get unlimited codes in the full <b>Coffeebreak Life Code Generator</b>.');S.dayCount++;cur=makeCode(S.area,'n'+Date.now());save();render()};
 const p=lc.querySelector('#png');if(p){p.onclick=()=>exportCard(cur);lc.querySelector('#sv').onclick=()=>{S.codes.push(cur);save();lc.querySelector('#sv').textContent='✔ Saved'};lc.querySelector('#fo').onclick=()=>{tab='focus';render()}}}
 else if(tab==='day'){if(!S.name||!lifePath(S.bd)){shell('<p>Enter your name and birth date on <b>My Code</b> first.</p>');return}const c=dailyCode();cur=c;shell('<h2>☀️ Today\'s code</h2><p>'+new Date().toLocaleDateString()+'. A fresh code each day for your chosen area.</p><p>'+areaPick()+'</p>'+codeCard(c)+'<button class="btn" id="png">🖼️ Save as PNG</button><button class="btn" id="fo">🧘 Focus on it</button>');bindAreas();lc.querySelector('#png').onclick=()=>exportCard(c);lc.querySelector('#fo').onclick=()=>{tab='focus';render()}}
 else if(tab==='focus'){const c=cur||(S.name&&lifePath(S.bd)?dailyCode():null);if(!c){shell('<p>Generate a code first.</p>');return}cur=c;
 shell('<h2>🧘 Repeat your code</h2><p style="text-align:center">Breathe in for 4, hold for 4, out for 6. On each out-breath, say your code softly.</p><div class="code">'+c.code+'</div><div style="text-align:center"><div id="orb" style="width:120px;height:120px;margin:14px auto;border-radius:50%;background:radial-gradient(#ffe08a,#c9a0ff 60%,transparent 70%);transition:transform 4s ease-in-out"></div><div id="ph" style="font-size:20px">Ready</div><div id="rp">0 repeats</div><select id="mn"><option value="1">1 min</option><option value="3" selected>3 min</option><option value="5">5 min</option></select> <button class="btn" id="tg">▶ Start</button></div>');
 lc.querySelector('#tg').onclick=()=>{if(timer){stopTimer();render()}else startTimer(+lc.querySelector('#mn').value)}}
 else if(tab==='script'){shell('<h2>✍️ Scripting</h2><p>Write as if it has already happened, in present tense: "I am…"</p>'+SCRIPT.map((s,i)=>'<div class="card"><b>'+esc(s)+'</b><br><textarea data-s="'+i+'" rows="3" style="width:100%;margin-top:6px"></textarea><button class="btn" data-k="'+i+'">📔 Add to journal</button></div>').join(''));
 lc.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const v=lc.querySelector('[data-s="'+b.dataset.k+'"]').value.trim();if(v){S.journal.push({t:SCRIPT[b.dataset.k].split('…')[0]+'… '+v,area:S.area,ts:Date.now(),done:0});save();b.textContent='✔ Added'}})}
 else if(tab==='jr'){const done=S.journal.filter(j=>j.done).length;shell('<h2>📔 Manifestation Journal</h2><p>🌟 Came true: <b>'+done+'</b> of '+S.journal.length+'</p><div class="card"><textarea id="jt" rows="3" style="width:100%" placeholder="I am so grateful that…"></textarea><button class="btn" id="ja">➕ Add</button></div>'+S.journal.map((j,i)=>({j,i})).reverse().map(({j,i})=>'<div class="card">'+(j.done?'🌟 <b style="color:#ffe08a">Came true!</b> ':'')+esc(j.t)+'<br><small>'+new Date(j.ts).toLocaleDateString()+'</small><br><button class="btn" data-d="'+i+'">'+(j.done?'↩ Not yet':'🌟 It came true')+'</button><button class="btn" data-x="'+i+'">🗑</button></div>').join(''));
 lc.querySelector('#ja').onclick=()=>{const v=lc.querySelector('#jt').value.trim();if(v){S.journal.push({t:v,area:S.area,ts:Date.now(),done:0});save();render()}};
 lc.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const j=S.journal[+b.dataset.d];j.done=j.done?0:Date.now();save();render()});lc.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{S.journal.splice(+b.dataset.x,1);save();render()})}
 else if(tab==='vb'){if(DEMO){shell('<h2>🖼️ Vision Board</h2><p>Pin photos and words of your dream life, then export your board as an image. Available in the full version.</p><button class="btn" id="ul">🔓 Get the full app</button>');lc.querySelector('#ul').onclick=()=>window.demoEnd&&window.demoEnd('The Vision Board and export are in the full <b>Coffeebreak Life Code Generator</b>.');return}
 shell('<h2>🖼️ Vision Board</h2><p><input id="vw" placeholder="A word or dream, e.g. Beach house" style="width:60%"> <button class="btn" id="aw">➕ Word</button> <label class="btn">📷 Photo<input id="vf" type="file" accept="image/*" style="display:none"></label> <button class="btn" id="ve">⬇ Export board</button></p><div class="vb">'+S.board.map((b,i)=>'<div>'+(b.img?'<img src="'+b.img+'">':'')+'<div>'+esc(b.t||'')+'</div><button data-r="'+i+'" style="position:absolute;top:2px;right:2px;background:none;border:0;color:#fff;cursor:pointer">✕</button></div>').join('')+'</div>'+(S.board.length?'':'<p>Your board is empty. Add words and photos!</p>'));
 lc.querySelector('#aw').onclick=()=>{const v=lc.querySelector('#vw').value.trim();if(v){S.board.push({t:v});save();render()}};
 lc.querySelector('#vf').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const k=document.createElement('canvas'),s=Math.min(1,360/Math.max(im.width,im.height));k.width=im.width*s;k.height=im.height*s;k.getContext('2d').drawImage(im,0,0,k.width,k.height);S.board.push({img:k.toDataURL('image/jpeg',.8),t:''});save();render()};im.src=URL.createObjectURL(f)};
 lc.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{S.board.splice(+b.dataset.r,1);save();render()});lc.querySelector('#ve').onclick=exportBoard}
 else{shell('<h2>💾 Saved codes</h2>'+(S.codes.length?'':'<p>No saved codes yet.</p>')+S.codes.map((c,i)=>({c,i})).reverse().map(({c,i})=>codeCard(c)+(DEMO?'':'<button class="btn" data-p="'+i+'">🖼️ PNG</button>')+'<button class="btn" data-x="'+i+'">🗑</button>').join('')+(!DEMO&&S.codes.length?'<button class="btn" id="ex">⬇ Export all (text)</button>':''));
 lc.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>exportCard(S.codes[+b.dataset.p]));lc.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{S.codes.splice(+b.dataset.x,1);save();render()});
 const ex=lc.querySelector('#ex');if(ex)ex.onclick=()=>dl(URL.createObjectURL(new Blob([S.codes.map(c=>c.area+': '+c.code+' (Life Path '+c.lp+')\n'+c.affs.join('\n')).join('\n\n')+'\n\n'+NOTE],{type:'text/plain'})),'my-life-codes.txt')}}
function dl(u,n){const a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove()}
function cardCanvas(c){const k=document.createElement('canvas');k.width=1080;k.height=1350;const g=k.getContext('2d'),a=AREAS.find(z=>z[0]===c.area);const gr=g.createLinearGradient(0,0,0,1350);gr.addColorStop(0,'#3a2060');gr.addColorStop(1,'#0c0618');g.fillStyle=gr;g.fillRect(0,0,1080,1350);
 g.strokeStyle=a[2];g.lineWidth=10;g.strokeRect(40,40,1000,1270);g.textAlign='center';g.fillStyle='#fff';g.font='bold 54px Georgia';g.fillText('✨ Life Code ✨',540,170);g.font='40px Georgia';g.fillText(a[1]+' · '+(S.name||''),540,250);
 g.fillStyle='#ffe08a';g.font='bold 96px Georgia';g.fillText(c.code,540,470);g.fillStyle='#e8d8ff';g.font='36px Georgia';g.fillText('Life Path '+c.lp+' · '+(LP[c.lp]||''),540,570);g.font='italic 40px Georgia';c.affs.forEach((f,i)=>g.fillText(f,540,720+i*90));
 g.font='26px Georgia';g.fillStyle='#b8a8d8';g.fillText(NOTE,540,1210);g.fillText('Coffeebreak Life Code Generator',540,1260);return k}
function exportCard(c){if(c)dl(cardCanvas(c).toDataURL('image/png'),'life-code-'+c.area+'.png')}
function exportBoard(){const n=S.board.length,cols=3,rows=Math.max(1,Math.ceil(n/cols)),k=document.createElement('canvas');k.width=1200;k.height=120+rows*360;const g=k.getContext('2d');g.fillStyle='#1a0e30';g.fillRect(0,0,k.width,k.height);g.fillStyle='#ffe08a';g.font='bold 52px Georgia';g.textAlign='center';g.fillText('My Vision Board',600,80);
 let pending=0;const fin=()=>dl(k.toDataURL('image/png'),'vision-board.png');S.board.forEach((b,i)=>{const X=20+(i%cols)*393,Y=110+Math.floor(i/cols)*360;g.fillStyle='#ffffff18';g.fillRect(X,Y,373,340);g.fillStyle='#fff';g.font='bold 32px Georgia';g.fillText(b.t||'',X+186,Y+320);
 if(b.img){pending++;const im=new Image();im.onload=()=>{const s=Math.min(353/im.width,270/im.height);g.drawImage(im,X+186-im.width*s/2,Y+10,im.width*s,im.height*s);if(--pending===0)fin()};im.src=b.img}});if(!pending)fin()}
const BR=[['Breathe in',4,1.35],['Hold',4,1.35],['Breathe out · say your code',6,.8]];
function startTimer(min){tLeft=min*60;tReps=0;let ph=0,pt=0;startMusic();const orb=lc.querySelector('#orb'),phE=lc.querySelector('#ph'),rp=lc.querySelector('#rp');lc.querySelector('#tg').textContent='■ Stop';
 const step=()=>{const p=BR[ph];phE.textContent=p[0]+' ('+(p[1]-pt)+')';orb.style.transform='scale('+p[2]+')';};step();
 timer=setInterval(()=>{tLeft--;pt++;if(pt>=BR[ph][1]){pt=0;if(ph===2){tReps++;rp.textContent=tReps+' repeats · '+Math.floor(tLeft/60)+':'+String(tLeft%60).padStart(2,'0')+' left'}ph=(ph+1)%3}if(tLeft<=0){stopTimer();phE.textContent='🌟 Beautiful. '+tReps+' repeats done.';lc.querySelector('#tg').textContent='▶ Again';return}step()},1000)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
const stars=Array.from({length:90},(_,i)=>({x:(i*97)%900,y:(i*53)%600,s:1+i%2}));
function bg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#3a2060');g.addColorStop(1,'#0c0618');x.fillStyle=g;x.fillRect(0,0,900,600);for(const s of stars){x.globalAlpha=.4+.4*Math.sin(t*2+s.x);x.fillStyle='#fff';x.fillRect(s.x,s.y,s.s,s.s)}x.globalAlpha=1}
function sigil(cx,cy,r){x.save();x.translate(cx,cy);x.rotate(t*.2);x.strokeStyle='#ffe08a';x.lineWidth=3;for(let k=0;k<3;k++){x.beginPath();x.arc(0,0,r-k*28,0,7);x.stroke()}
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9;x.fillStyle='#c9a0ff';x.font='bold 26px Georgia';x.textAlign='center';x.fillText(String(i+1),Math.cos(a)*(r-14),Math.sin(a)*(r-14)+9)}x.restore();x.fillStyle='rgba(255,224,138,'+(.3+.2*Math.sin(t*2))+')';x.beginPath();x.arc(cx,cy,30,0,7);x.fill()}
function drawTitle(){bg();sigil(450,300,150);T('✨ Coffeebreak Life Code Generator',450,78,36,'#fff','center');T('Your name, your birth date, your desire: your personal manifestation code.',450,114,17,'#e8d8ff','center','italic ');
 button('st',230,490,200,52,'🔢 Get my code',()=>openApp('gen'),{fs:17,bg:'#4a2a7a',ac:'#c9a0ff'});button('dy',470,490,200,52,'☀️ Daily code',()=>openApp('day'),{fs:17,bg:'#4a2a7a',ac:'#c9a0ff'});
 T(NOTE,450,565,13,'#c8b8e8','center','');T(DEMO?'Free demo: 3 desire areas, 1 code a day':'Full version: all areas, unlimited codes, vision board',450,585,12,'#a898c8','center','')}
(function(){const o=document.createElement('canvas');o.width=320;o.height=320;const k=x;x=o.getContext('2d');sigil(160,160,150);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);bg();drawTitle();x.textAlign='left'}
window.LC={G,S,makeCode,lifePath,openApp,render,cardCanvas,dailyCode};startLoop();
