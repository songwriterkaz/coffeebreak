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
// ===== Coffeebreak Racing Day (PLAY COINS ONLY) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const SK=D?'hrDemo':'hrSave',DEMO_RACES=3;
const st=document.createElement('style');st.textContent=`
#hr{flex:1;width:100%;max-width:1000px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#fff4f8}
#hr h1,#hr h2{color:#ff8fc4;margin:6px 0 8px}#hr h3{color:#9fe8a8;margin:6px 0}
#hr .fun{background:#0f3a22;border:2px solid #ff8fc4;border-radius:12px;padding:8px 12px;font-weight:bold;color:#c8ffd0;text-align:center}
#hr .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
#hr .coins{background:#ff8fc4;color:#2a0a1a;border-radius:999px;padding:6px 14px;font-weight:bold}
#hr button{background:#14512e;color:#fff4f8;border:1px solid #ff8fc4;border-radius:10px;padding:8px 12px;font:15px Georgia;cursor:pointer}
#hr button.on,#hr button.primary{background:#ff8fc4;color:#2a0a1a;font-weight:bold}#hr button:disabled{opacity:.45;cursor:default}
#hr input,#hr select{background:#0c2a18;color:#fff4f8;border:1px solid #ff8fc4;border-radius:8px;padding:7px 9px;font:15px Georgia}
#hr .card{background:#0c2a18;border:1px solid #3c8a56;border-radius:14px;padding:12px;margin:10px 0}
#hr table{width:100%;border-collapse:collapse;font-size:14px}#hr th,#hr td{border-bottom:1px solid #2d6a44;padding:6px 4px;text-align:left}#hr th{color:#ffcfe6}
#hr .silk{display:inline-block;width:22px;height:22px;border-radius:5px;vertical-align:middle;border:2px solid #fff}
#hr .note{font-size:13px;color:#cfe9d6;line-height:1.45}
#hr canvas{width:100%;max-width:960px;border-radius:14px;border:3px solid #ff8fc4;display:block;margin:8px auto}
#hr .comm{background:#200a16;border-left:4px solid #ff8fc4;padding:8px 12px;border-radius:8px;min-height:44px;font-style:italic}
#hrMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#ff8fc4;color:#2a0a1a;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}
body{background:linear-gradient(#0a2614,#1a0612)!important}`;document.head.appendChild(st);
const R=document.createElement('div');R.id='hr';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='hrMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>startMusic(),{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
function sfx(f,d){try{const A=window._AC=window._AC||new(window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.frequency.value=f;g.gain.setValueAtTime(.1,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d)}catch(e){}}
const today=()=>new Date().toISOString().slice(0,10);
const NAMES=['Pink Lemonade','Espresso Express','Velvet Thunder','Moonlit Mocha','Clover Comet','Sugar Spurs','Midnight Latte','Rosie Rocket','Mint Condition','Satin Sprint','Caramel Breeze','Lucky Ribbon','Daisy Dash','Cocoa Canter','Starlight Sonnet','Bramble Belle','Honey Hurricane','Emerald Echo','Flamingo Flyer','Cinnamon Swirl','Raspberry Rush','Greenfield Glory','Biscotti Bolt','Pearl Parade'];
const JOCK=['K. Ellis','M. Rowan','J. Darby','S. Pike','T. Holloway','A. Finch','L. Marsh','R. Quill','B. Sato','C. Moreau'];
const SILKS=['#ff4fa3','#2ecc71','#ffd23f','#7ec8e3','#b07cff','#ff7f50','#ffffff','#1e8a4a','#ff9ccf','#e63946'];
const TRACKS=['Rosewood Park','Greenmeadow Downs','Coffeebreak Racecourse','Peppermint Flats','Blossom Bay Turf'];
const RIVALS=[['Lady Clover',4200],['Punter Pete',3100],['Mocha Mae',2500],['Racing Rosa',1800],['Lucky Lou',1200]];
let S={coins:500,claimed:'',raceDay:'',racesToday:0,raceNo:0,best:500,won:0,bets:0,stable:[],hist:[],name:'You'};
try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
function save(){S.best=Math.max(S.best,S.coins);try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}G.score=S.best;G.level=S.won}
if(S.raceDay!==today()){S.raceDay=today();S.racesToday=0}
let tab='card',card=null,betType='win',sel=[],stake=20,racing=false,res=null;
function newCard(){const pool=NAMES.slice().sort(()=>Math.random()-.5);const n=8;const hs=[];
 const mine=S.stable.find(h=>h.entered);
 for(let i=0;i<n;i++){let h;if(i===0&&mine)h={name:mine.name,mine:true,str:40+mine.speed*3+mine.stamina*2,silk:mine.silk};else h={name:pool[i],str:45+Math.random()*40,silk:SILKS[i%SILKS.length]};
  h.no=i+1;h.jockey=JOCK[(i+S.raceNo)%JOCK.length];h.form=Array.from({length:4},()=>1+Math.floor(Math.random()*(h.str>70?4:9))).join('-');hs.push(h)}
 const tot=hs.reduce((a,h)=>a+Math.pow(h.str,3),0);
 hs.forEach(h=>{const p=Math.pow(h.str,3)/tot;h.odds=Math.max(1.4,Math.round((0.85/p)*10)/10)});
 card={track:TRACKS[S.raceNo%TRACKS.length],dist:[1000,1200,1400,1600,2000][Math.floor(Math.random()*5)],horses:hs,bets:[]};sel=[];res=null}
function canRace(){return !D||S.racesToday<DEMO_RACES}
function header(){return `<h1>🏇 Coffeebreak Racing Day</h1><div class="fun">For fun only, play coins have no real value.</div>
<div class="bar"><span class="coins">🪙 ${S.coins} coins</span>${D?`<span class="note">Demo: ${Math.max(0,DEMO_RACES-S.racesToday)} of ${DEMO_RACES} races left today</span>`:''}
<button id="daily" ${S.claimed===today()?'disabled':''}>🎁 Daily free coins</button></div>
<div class="bar">${[['card','📋 Race card'],['race','🏁 Race'],['pay','💰 Payout table'],['stable','🐴 My stable'],['lb','🏆 Leaderboard']].map(([k,l])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`}
function placeTerms(o){return Math.max(1.1,Math.round((1+(o-1)/4)*10)/10)}
function cardView(){if(!card)newCard();const h=card.horses;
 return `<div class="card"><h2>${esc(card.track)} · Race ${S.raceNo+1} · ${card.dist}m</h2>
<table><tr><th>#</th><th>Silks</th><th>Horse</th><th>Jockey</th><th>Form</th><th>Odds</th><th>Pick</th></tr>
${h.map(x=>`<tr><td>${x.no}</td><td><span class="silk" style="background:${x.silk}"></span></td><td>${esc(x.name)}${x.mine?' ⭐':''}</td><td>${x.jockey}</td><td>${x.form}</td><td>$${x.odds.toFixed(2)}</td><td><button data-pick="${x.no}" class="${sel.includes(x.no)?'on':''}">${sel.includes(x.no)?(betType==='trifecta'?['1st','2nd','3rd'][sel.indexOf(x.no)]:'✓'):'Pick'}</button></td></tr>`).join('')}</table></div>
<div class="card"><h3>Place a bet</h3><div class="bar">${['win','place','each-way','trifecta'].map(b=>`<button data-bt="${b}" class="${betType===b?'on':''}">${b[0].toUpperCase()+b.slice(1)}</button>`).join('')}</div>
<p class="note">${{win:'Win: your horse must finish 1st. Pays the win odds.',place:'Place: your horse must finish 1st, 2nd or 3rd. Pays a quarter of the win odds.','each-way':'Each-way: two bets of your stake, one Win and one Place (costs double).',trifecta:'Trifecta: pick 1st, 2nd and 3rd in exact order. Big payout!'}[betType]}</p>
<div class="bar">Stake <input id="stake" type="number" min="5" step="5" value="${stake}" style="width:90px"> coins <button class="primary" id="bet">Place bet</button></div>
${card.bets.length?`<table><tr><th>Bet</th><th>Selection</th><th>Stake</th></tr>${card.bets.map(b=>`<tr><td>${b.type}</td><td>${b.sel.map(n=>'#'+n).join(' → ')}</td><td>${b.cost}</td></tr>`).join('')}</table>`:'<p class="note">No bets yet. You can also race without betting.</p>'}
<div class="bar"><button class="primary" id="go" ${canRace()?'':'disabled'}>🏁 Go to the race</button></div>${canRace()?'':'<p class="note">That\'s all 3 demo races for today! Come back tomorrow, or get the full game for unlimited racing.</p>'}</div>`}
function raceView(){return `<div class="card"><h2>${esc(card.track)} · ${card.dist}m</h2><canvas id="trk" width="960" height="420"></canvas>
<div class="comm" id="comm">${res?esc(res.summary):'Horses are loading into the barriers…'}</div>
<div class="bar">${racing?'':(res?'<button class="primary" id="next">Next race ➡️</button>':`<button class="primary" id="start" ${canRace()?'':'disabled'}>🔔 Start race</button>`)}</div>
${res?resTable():''}</div>`}
function resTable(){return `<h3>Result</h3><table><tr><th>Pos</th><th>Horse</th><th>Odds</th></tr>${res.order.slice(0,4).map((h,i)=>`<tr><td>${i+1}</td><td><span class="silk" style="background:${h.silk}"></span> ${esc(h.name)}</td><td>$${h.odds.toFixed(2)}</td></tr>`).join('')}</table>
<h3>Your bets</h3>${res.lines.length?`<table>${res.lines.map(l=>`<tr><td>${l}</td></tr>`).join('')}</table>`:'<p class="note">No bets this race.</p>'}`}
function payView(){return `<div class="card"><h2>💰 Payout table</h2><table><tr><th>Bet</th><th>Wins when</th><th>Pays (play coins)</th></tr>
<tr><td>Win</td><td>Horse finishes 1st</td><td>Stake × win odds</td></tr><tr><td>Place</td><td>Horse finishes 1st, 2nd or 3rd</td><td>Stake × (1 + (odds − 1) ÷ 4)</td></tr>
<tr><td>Each-way</td><td>Win part + Place part (2 × stake)</td><td>Both parts paid separately</td></tr><tr><td>Trifecta</td><td>Exact 1st, 2nd, 3rd</td><td>Stake × (odds1 × odds2 × odds3 ÷ 4), min ×10</td></tr></table>
<p class="note">Example: 20 coins Win at $5.00 returns 100 coins. 20 coins Place at $5.00 returns 40 coins. Daily free coins: 200 (free top-up to 100 if you're broke).</p><div class="fun">For fun only, play coins have no real value. No cash-out, no real prizes.</div></div>`}
function stableView(){return `<div class="card"><h2>🐴 My stable</h2><p class="note">Buy a horse for 300 coins, train it with coins, and enter it in races. Your horse joins the next race card as #1.</p>
<div class="bar"><input id="hn" placeholder="Name your horse" maxlength="22"> <select id="hs">${SILKS.map((s,i)=>`<option value="${s}">Silks ${i+1}</option>`).join('')}</select> <button class="primary" id="buy" ${S.coins<300||(D&&S.stable.length>=1)?'disabled':''}>Buy (300)</button></div>
${D?'<p class="note">Demo: 1 horse. Full game: up to 6.</p>':''}
${S.stable.length?`<table><tr><th>Horse</th><th>Speed</th><th>Stamina</th><th>Wins</th><th></th></tr>${S.stable.map((h,i)=>`<tr><td><span class="silk" style="background:${h.silk}"></span> ${esc(h.name)}</td><td>${h.speed}/10</td><td>${h.stamina}/10</td><td>${h.wins}</td><td><button data-tr="${i}:speed" ${h.speed>=10?'disabled':''}>Train speed (${50*h.speed})</button> <button data-tr="${i}:stamina" ${h.stamina>=10?'disabled':''}>Train stamina (${50*h.stamina})</button> <button data-en="${i}" class="${h.entered?'on':''}">${h.entered?'Entered ✓':'Enter in races'}</button></td></tr>`).join('')}</table>`:'<p class="note">Your stable is empty.</p>'}</div>`}
function lbView(){const all=RIVALS.concat([[S.name+' (you)',S.best]]).sort((a,b)=>b[1]-a[1]);
 return `<div class="card"><h2>🏆 Leaderboard (best coin balance)</h2><div class="bar">Your name <input id="pn" value="${esc(S.name)}" maxlength="18"></div><table><tr><th>#</th><th>Punter</th><th>Best coins</th></tr>${all.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r[0])}</td><td>${r[1]}</td></tr>`).join('')}</table>
<p class="note">Races won by your picks: ${S.won} · Bets placed: ${S.bets}. The leaderboard is saved on this device with friendly computer rivals.</p></div>`}
function render(){R.innerHTML=header()+({card:cardView,race:raceView,pay:payView,stable:stableView,lb:lbView}[tab]())+`<p class="note" style="text-align:center">🏇 All horses, jockeys and tracks are made up. For fun only, play coins have no real value.</p>`;bind();if(tab==='race')drawTrack(res?1:0)}
function bind(){const q=s=>R.querySelector(s);R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(racing)return;tab=b.dataset.tab;render()});
 q('#daily')&&(q('#daily').onclick=()=>{S.coins+=200;S.claimed=today();save();sfx(880,.3);say('+200 free play coins!');render()});
 R.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const n=+b.dataset.pick;const max=betType==='trifecta'?3:1;if(sel.includes(n))sel=sel.filter(x=>x!==n);else{if(sel.length>=max)sel=max===1?[]:sel.slice(0,max-1);sel.push(n)}render()});
 R.querySelectorAll('[data-bt]').forEach(b=>b.onclick=()=>{betType=b.dataset.bt;sel=[];render()});
 q('#stake')&&(q('#stake').onchange=e=>stake=Math.max(5,Math.floor(+e.target.value||5)));
 q('#bet')&&(q('#bet').onclick=()=>{stake=Math.max(5,Math.floor(+q('#stake').value||5));const need=betType==='trifecta'?3:1;if(sel.length!==need)return say(betType==='trifecta'?'Pick 3 horses in order':'Pick a horse first');const cost=betType==='each-way'?stake*2:stake;if(cost>S.coins)return say('Not enough play coins');S.coins-=cost;S.bets++;card.bets.push({type:betType,sel:sel.slice(),stake,cost});sel=[];save();sfx(660,.15);render()});
 q('#go')&&(q('#go').onclick=()=>{tab='race';render()});
 q('#start')&&(q('#start').onclick=startRace);
 q('#next')&&(q('#next').onclick=()=>{newCard();tab='card';render()});
 q('#buy')&&(q('#buy').onclick=()=>{const n=(q('#hn').value||'').trim()||('Coffee Star '+(S.stable.length+1));if(S.stable.length>=(D?1:6))return say('Stable full');S.coins-=300;S.stable.push({name:n,silk:q('#hs').value,speed:3,stamina:3,wins:0,entered:false});save();say('Welcome to the stable, '+n+'!');render()});
 R.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>{const[i,k]=b.dataset.tr.split(':');const h=S.stable[i],c2=50*h[k];if(S.coins<c2)return say('Not enough play coins');S.coins-=c2;h[k]++;save();sfx(520,.2);say(h.name+' trained! '+k+' '+h[k]);render()});
 R.querySelectorAll('[data-en]').forEach(b=>b.onclick=()=>{const i=+b.dataset.en,was=S.stable[i].entered;S.stable.forEach(h=>h.entered=false);S.stable[i].entered=!was;save();if(!racing&&!(card&&card.bets.length))newCard();render()});
 q('#pn')&&(q('#pn').onchange=e=>{S.name=e.target.value.trim()||'You';save();render()});}
// race
let P=[];
function drawTrack(done){const cv=R.querySelector('#trk');if(!cv)return;const g=cv.getContext('2d'),W=960,H=420;
 const sky=g.createLinearGradient(0,0,0,70);sky.addColorStop(0,'#ffb6d9');sky.addColorStop(1,'#ffe3f0');g.fillStyle=sky;g.fillRect(0,0,W,70);
 g.fillStyle='#ff8fc4';for(let i=0;i<W;i+=40){g.fillRect(i,52,30,14)}g.fillStyle='#1e8a4a';g.fillRect(0,70,W,H-70);
 const n=card.horses.length,lh=(H-90)/n;
 for(let i=0;i<n;i++){g.fillStyle=i%2?'#239a54':'#1c8048';g.fillRect(0,80+i*lh,W,lh)}
 g.fillStyle='#fff';g.fillRect(W-70,75,6,H-80);g.fillStyle='#ff4fa3';for(let y=75;y<H;y+=12)g.fillRect(W-64,y,6,6);
 const L=P.length?P:card.horses.map(h=>({h,d:0}));
 L.forEach((p,i)=>{const X=40+p.d*(W-150),Y=80+i*lh+lh/2,b=Math.sin(performance.now()/60+i)*(racing?3:0);
  g.fillStyle='#6b3a24';g.beginPath();g.ellipse(X,Y+b,26,10,0,0,7);g.fill();g.beginPath();g.ellipse(X+26,Y-8+b,10,6,-.6,0,7);g.fill();
  g.fillStyle=p.h.silk;g.fillRect(X-8,Y-20+b,14,12);g.fillStyle='#fff';g.font='bold 12px Georgia';g.fillText(p.h.no,X-5,Y-10+b);
  g.fillStyle='#fff4f8';g.font='13px Georgia';g.fillText(p.h.name,X-150<0?2:X-150,Y+4)})}
function comm(t){const e=R.querySelector('#comm');if(e)e.textContent=t}
function startRace(){if(racing||!canRace())return;racing=true;S.racesToday++;save();R.querySelector('#start').remove();
 P=card.horses.map(h=>({h,d:0,v:0,fin:0}));let fin=[],t0=performance.now(),lastC=0,lastLead='';sfx(990,.6);comm("And they're racing at "+card.track+"!");
 (function step(){const now=performance.now(),el=(now-t0)/1000;
  P.forEach(p=>{if(p.fin)return;p.v=0.0016+p.h.str/30000+(Math.random()-.5)*0.0022+(el>6?p.h.str/60000*Math.random():0);p.d+=p.v;if(p.d>=1){p.d=1;p.fin=fin.length+1;fin.push(p.h)}});
  if(now-lastC>1700&&fin.length===0){lastC=now;const s=P.slice().sort((a,b)=>b.d-a.d),lead=s[0].h.name,avg=s[0].d;
   const lines=avg<.3?[`${lead} jumps well and leads early!`,`${s[1].h.name} settles nicely just behind ${lead}.`]:avg<.7?[lead===lastLead?`${lead} still holds the lead down the back straight.`:`${lead} takes over at the front!`,`${s[2].h.name} is making a move out wide!`]:[`Into the straight, ${lead} leads ${s[1].h.name}!`,`${s[1].h.name} charges at ${lead}, here they come!`];
   comm(lines[Math.floor(Math.random()*lines.length)]);lastLead=lead}
  drawTrack();if(fin.length<P.length)requestAnimationFrame(step);else finish(fin)})()}
function finish(order){racing=false;S.raceNo++;const o=order,lines=[];let ret=0;
 const pos=n=>o.findIndex(h=>h.no===n)+1,H=n=>card.horses.find(h=>h.no===n);
 card.bets.forEach(b=>{let w=0;const h=H(b.sel[0]);
  if(b.type==='win'&&pos(h.no)===1)w=b.stake*h.odds;
  if(b.type==='place'&&pos(h.no)<=3)w=b.stake*placeTerms(h.odds);
  if(b.type==='each-way'){if(pos(h.no)===1)w+=b.stake*h.odds;if(pos(h.no)<=3)w+=b.stake*placeTerms(h.odds)}
  if(b.type==='trifecta'&&b.sel.every((n,i)=>pos(n)===i+1))w=b.stake*Math.max(10,b.sel.reduce((a,n)=>a*H(n).odds,1)/4);
  w=Math.round(w);ret+=w;if(w)S.won++;lines.push(`${b.type} ${b.sel.map(n=>'#'+n).join('→')} (${b.cost}): ${w?'<b style="color:#9fe8a8">won '+w+' coins</b>':'lost'}`)});
 S.coins+=ret;const mine=S.stable.find(h=>h.entered);if(mine&&o[0].mine)mine.wins++;
 if(S.coins<10&&S.claimed===today()){S.coins+=100;lines.push('Free top-up: +100 play coins')}
 S.hist.unshift({t:card.track,w:o[0].name});S.hist=S.hist.slice(0,20);save();
 res={order:o,lines,summary:`${o[0].name} wins it! ${o[1].name} second, ${o[2].name} third.${ret?' You collect '+ret+' play coins!':''}`};
 sfx(ret?1200:300,.5);render();if(D&&!canRace()&&window.demoEnd)setTimeout(()=>window.demoEnd('You\'ve run all 3 free demo races for today! The full <b>Coffeebreak Racing Day</b> has unlimited races, a 6-horse stable and every song.'),2500)}
window.HR={get S(){return S},get card(){return card},newCard,render,startRace,setTab:t=>{tab=t;render()}};
newCard();save();render();
})();
