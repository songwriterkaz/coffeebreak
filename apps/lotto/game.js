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
// ===== Coffeebreak Lotto (PLAY COINS ONLY - no real money, no cash-out, no real prizes) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const SK=D?'lottoDemo':'lottoSave';
const st=document.createElement('style');st.textContent=`
#lt{flex:1;width:100%;max-width:980px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#lt h1,#lt h2{color:#e8a0b0;margin:6px 0 8px}
#lt .fun{background:#3a1424;border:2px solid #ffcf6a;border-radius:12px;padding:8px 12px;font-weight:bold;color:#ffcf6a;text-align:center;margin:6px 0}
#lt .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}
#lt button{background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:10px;padding:8px 12px;font:15px Georgia;cursor:pointer}
#lt button.on,#lt button.primary{background:#e8a0b0;color:#1a0a10;font-weight:bold}
#lt button:disabled{opacity:.45;cursor:default}
#lt .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:14px;padding:14px;margin:10px 0}
#lt .note{font-size:13px;color:#d9b8c0;line-height:1.45}
#lt .top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
#lt .coins{font-size:20px;color:#ffcf6a;font-weight:bold}
#lt .jack{font-size:26px;color:#ff8fb8;font-weight:bold;text-shadow:0 0 12px #ff4f9a}
#lt .nums{display:grid;grid-template-columns:repeat(9,44px);gap:6px}
#lt .n{width:44px;height:44px;border-radius:50%;padding:0;font-weight:bold}
#lt .n.on{background:#ff6fa8;color:#fff;border-color:#fff}
#lt .ball{display:inline-flex;width:54px;height:54px;border-radius:50%;align-items:center;justify-content:center;font:bold 22px Georgia;color:#5a0f2e;margin:4px;background:radial-gradient(circle at 35% 30%,#fff,#ffb6d2 40%,#ff5fa2 90%);box-shadow:0 4px 10px rgba(0,0,0,.5)}
#lt .ball.hit{outline:4px solid #ffcf6a}
#lt .ball.drop{animation:ltdrop .7s cubic-bezier(.3,1.6,.5,1)}
@keyframes ltdrop{0%{transform:translateY(-140px) scale(.4) rotate(-200deg);opacity:0}100%{transform:none;opacity:1}}
#lt .machine{width:min(300px,80vw);height:300px;margin:10px auto;border-radius:50%;position:relative;background:radial-gradient(circle at 35% 30%,rgba(255,220,235,.25),rgba(60,10,30,.9) 70%);border:8px solid #e8a0b0;overflow:hidden;box-shadow:inset 0 0 40px #000}
#lt .mb{position:absolute;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#ff8fbf 60%,#d0397a);font:bold 11px Georgia;color:#5a0f2e;display:flex;align-items:center;justify-content:center}
#lt .mb{animation:ltjig .5s ease-in-out infinite alternate}#lt .mb:nth-child(odd){animation-duration:.37s;animation-direction:alternate-reverse}
@keyframes ltjig{0%{transform:translate(-14px,10px) rotate(-30deg)}100%{transform:translate(14px,-12px) rotate(30deg)}}
#lt .tk{display:inline-block;background:linear-gradient(135deg,#fff3f8,#ffd0e2);color:#3a1424;border:2px dashed #c48;border-radius:10px;padding:8px 12px;margin:4px;font-weight:bold}
#lt .scr{position:relative;display:inline-grid;grid-template-columns:repeat(3,80px);gap:8px;padding:12px;background:#ffd0e2;border-radius:14px}
#lt .cell{width:80px;height:80px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:40px;position:relative;cursor:pointer;overflow:hidden}
#lt .cell .cov{position:absolute;inset:0;background:repeating-linear-gradient(45deg,#c0c0c8,#c0c0c8 6px,#a8a8b4 6px,#a8a8b4 12px);display:flex;align-items:center;justify-content:center;font:bold 13px Georgia;color:#555;transition:opacity .3s}
#lt table{border-collapse:collapse;width:100%;font-size:14px}#lt td,#lt th{border-bottom:1px solid #4a2030;padding:6px;text-align:left}
#ltMsg{position:fixed;left:50%;top:14px;transform:translateX(-50%);background:#e8a0b0;color:#1a0a10;padding:10px 18px;border-radius:12px;font:bold 15px Georgia;z-index:95;display:none}
`;document.head.appendChild(st);
const R=document.createElement('div');R.id='lt';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='ltMsg';document.body.appendChild(M);
function say(s){M.textContent=s;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
const today=()=>new Date().toISOString().slice(0,10);
const NAMES=['Lucky Lou','Pinky','Rosie R','Captain Bean','Mocha Mae','Sunny J','Velvet','Dot','Biscuit','Jazz','Cupcake','Starling','Maple','Kiki','Bo','Honey'];
const PRICE=10,POOL=45,PICK=6;
let S;try{S=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){}
if(!S)S={coins:200,jackpot:5000,tickets:[],history:[],lastFree:'',draws:{day:'',n:0},drawNo:1,scratchDay:'',scratchN:0,stats:{won:0,spent:0,best:0}};
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
let tab='play',pick=[],drawing=false;
const prizeFor=m=>m===6?'JACKPOT':m===5?1000:m===4?150:m===3?30:m===2?5:0;
function quick(){const a=[];while(a.length<PICK){const n=1+Math.floor(Math.random()*POOL);if(!a.includes(n))a.push(n)}return a.sort((a,b)=>a-b)}
// virtual players grow the jackpot over time
setInterval(()=>{if(drawing)return;const k=1+Math.floor(Math.random()*4);S.jackpot+=k*PRICE*0.5|0;save();const j=document.getElementById('ltJack');if(j)j.textContent=S.jackpot.toLocaleString()+' 🪙'},4000);
function claimFree(){if(S.lastFree===today()){say('Come back tomorrow for more free coins!');return}S.lastFree=today();S.coins+=100;save();say('+100 free play coins! 🪙');render()}
function buy(nums){if(S.coins<PRICE){say('Not enough play coins. Grab your daily free coins!');return}
 S.coins-=PRICE;S.stats.spent+=PRICE;S.jackpot+=PRICE/2;S.tickets.push({nums,draw:S.drawNo});save();say('Ticket bought for draw #'+S.drawNo+' 🎟️');pick=[];render()}
function drawsLeft(){if(!D)return Infinity;if(S.draws.day!==today()){S.draws={day:today(),n:0}}return 3-S.draws.n}
async function runDraw(){
 if(drawing)return;
 if(drawsLeft()<=0){window.demoEnd&&window.demoEnd('The free demo allows 3 draws per day. The full game has unlimited draws, scratchies and every song.');return}
 const mine=S.tickets.filter(t=>t.draw===S.drawNo);
 if(!mine.length){say('Buy a ticket for this draw first (or press Quick Pick).');return}
 drawing=true;if(D){S.draws.n++;}
 const res=quick();tab='draw';render();
 const out=document.getElementById('ltOut'),mach=document.getElementById('ltMach');
 for(let i=0;i<PICK;i++){await new Promise(r=>setTimeout(r,window.FAST?10:900));
  const b=document.createElement('span');b.className='ball drop';b.textContent=res[i];out.appendChild(b);
  const mb=mach.querySelector('[data-n="'+res[i]+'"]');if(mb)mb.remove()}
 let total=0,best=0,jackHit=false;const lines=[];
 for(const t of mine){const m=t.nums.filter(n=>res.includes(n)).length;best=Math.max(best,m);let p=prizeFor(m);if(p==='JACKPOT'){p=Math.round(S.jackpot);jackHit=true}total+=p;lines.push({nums:t.nums,m,p})}
 const vw=jackHit?'You':(Math.random()<.12?NAMES[Math.floor(Math.random()*NAMES.length)]+' (virtual player)':'No one');
 const entry={no:S.drawNo,date:new Date().toLocaleString(),res,jackpot:Math.round(S.jackpot),jackWinner:vw,myWin:total,best};
 if(jackHit||vw!=='No one')S.jackpot=5000;
 S.coins+=total;S.stats.won+=total;S.stats.best=Math.max(S.stats.best,best);
 S.history.unshift(entry);S.history=S.history.slice(0,50);S.drawNo++;save();drawing=false;
 out.querySelectorAll('.ball').forEach(b=>{if(mine.some(t=>t.nums.includes(+b.textContent)))b.classList.add('hit')});
 document.getElementById('ltRes').innerHTML=lines.map(l=>'<div class="tk">'+l.nums.join(' · ')+' → '+l.m+' match'+(l.m===1?'':'es')+(l.p?' · +'+l.p+' 🪙':'')+'</div>').join('')+
  '<p><b>'+(total?'You won '+total+' play coins! 🎉':'No win this time.')+'</b> Jackpot: '+(vw==='No one'?'not won, it rolls over!':'won by '+vw+'!')+'</p><button class="primary" id="ltNext">Next draw ➜</button>';
 document.getElementById('ltNext').onclick=()=>{tab='play';render()};
}
function scratch(){
 if(D&&S.scratchDay===today()&&S.scratchN>=1){say('The demo includes 1 scratchie per day. The full game has unlimited.');return}
 if(S.coins<5){say('A scratchie costs 5 play coins.');return}
 S.coins-=5;S.stats.spent+=5;if(S.scratchDay!==today()){S.scratchDay=today();S.scratchN=0}S.scratchN++;save();
 const sy=['💖','🍀','☕','⭐','🎵','🍒'],r=Math.random();let cells=[];
 const win=r<.3?sy[Math.floor(Math.random()*sy.length)]:null;
 if(win){cells=[win,win,win];while(cells.length<9){const s=sy[Math.floor(Math.random()*sy.length)];if(s!==win)cells.push(s)}}
 else{const cnt={};while(cells.length<9){const s=sy[Math.floor(Math.random()*sy.length)];if((cnt[s]||0)<2){cnt[s]=(cnt[s]||0)+1;cells.push(s)}}}
 cells.sort(()=>Math.random()-.5);const prize=win?({'💖':100,'🍀':50,'☕':20,'⭐':40,'🎵':25,'🍒':15})[win]:0;
 const box=document.getElementById('ltScr');let open=0;
 box.innerHTML='<div class="scr">'+cells.map((s,i)=>'<div class="cell" data-i="'+i+'">'+s+'<div class="cov">SCRATCH</div></div>').join('')+'</div><p id="ltScrRes" class="note">Tap each square to scratch. Match 3 to win play coins.</p>';
 box.querySelectorAll('.cell').forEach(el=>el.onclick=()=>{const cv=el.querySelector('.cov');if(!cv||cv.style.opacity==='0')return;cv.style.opacity='0';open++;
  if(open===9){S.coins+=prize;S.stats.won+=prize;save();document.getElementById('ltScrRes').innerHTML=prize?'<b>Three '+win+'! +'+prize+' play coins 🎉</b>':'<b>No match this time.</b>';document.getElementById('ltCoins').textContent=S.coins+' 🪙'}});
 document.getElementById('ltCoins').textContent=S.coins+' 🪙';
}
function render(){
 drawsLeft();
 const mine=S.tickets.filter(t=>t.draw===S.drawNo);
 let h='<h1>🎱 Coffeebreak Lotto</h1><div class="fun">For fun only, play coins have no real value.</div>'+
 '<div class="top card"><div>Your play coins: <span class="coins" id="ltCoins">'+S.coins+' 🪙</span></div><div>Jackpot (draw #'+S.drawNo+'): <span class="jack" id="ltJack">'+Math.round(S.jackpot).toLocaleString()+' 🪙</span></div>'+
 '<button id="ltFree"'+(S.lastFree===today()?' disabled':'')+'>🎁 Daily free coins</button></div>'+
 (D?'<p class="note">Demo: '+Math.max(0,drawsLeft())+' of 3 draws left today.</p>':'')+
 '<div class="tabs">'+[['play','🎟️ Buy tickets'],['draw','🎱 Draw'],['scratch','🪙 Scratchies'],['history','🏆 Winners history'],['about','ℹ️ About']].map(([k,l])=>'<button data-tab="'+k+'" class="'+(tab===k?'on':'')+'">'+l+'</button>').join('')+'</div>';
 if(tab==='play'){
  h+='<div class="card"><h2>Pick 6 numbers (1–45)</h2><div class="nums">'+Array.from({length:POOL},(_,i)=>i+1).map(n=>'<button class="n'+(pick.includes(n)?' on':'')+'" data-n="'+n+'">'+n+'</button>').join('')+'</div>'+
  '<p>Picked: <b>'+(pick.join(' · ')||'none')+'</b></p><button class="primary" id="ltBuy"'+(pick.length===PICK?'':' disabled')+'>Buy ticket ('+PRICE+' 🪙)</button> <button id="ltQP">⚡ Quick Pick ('+PRICE+' 🪙)</button> <button id="ltClr">Clear</button></div>'+
  '<div class="card"><h2>Your tickets for draw #'+S.drawNo+'</h2>'+(mine.map(t=>'<span class="tk">'+t.nums.join(' · ')+'</span>').join('')||'<p class="note">No tickets yet.</p>')+'<p><button class="primary" id="ltGo">🎱 Start the draw</button></p>'+
  '<p class="note">Prizes in play coins: 2 matches 5 · 3 matches 30 · 4 matches 150 · 5 matches 1,000 · 6 matches the jackpot. Half of every ticket (yours and the virtual players\') grows the jackpot.</p></div>';
 } else if(tab==='draw'){
  h+='<div class="card" style="text-align:center"><h2>Draw #'+S.drawNo+'</h2><div class="machine" id="ltMach">'+Array.from({length:POOL},(_,i)=>'<div class="mb" data-n="'+(i+1)+'" style="left:'+(10+Math.random()*75)+'%;top:'+(10+Math.random()*75)+'%">'+(i+1)+'</div>').join('')+'</div><div id="ltOut"></div><div id="ltRes">'+(drawing?'':'<button class="primary" id="ltGo">🎱 Start the draw</button>')+'</div></div>';
 } else if(tab==='scratch'){
  h+='<div class="card"><h2>Scratchies</h2><p class="note">5 play coins each. Match three symbols to win play coins.'+(D?' Demo: 1 scratchie per day.':'')+'</p><button class="primary" id="ltBuyScr">Buy a scratchie (5 🪙)</button><div id="ltScr" style="margin-top:12px"></div></div>';
 } else if(tab==='history'){
  h+='<div class="card"><h2>Winners history</h2>'+(S.history.length?'<table><tr><th>Draw</th><th>Numbers</th><th>Jackpot</th><th>Jackpot winner</th><th>Your win</th></tr>'+S.history.map(e=>'<tr><td>#'+e.no+'<br><small>'+e.date+'</small></td><td>'+e.res.join(' · ')+'</td><td>'+e.jackpot.toLocaleString()+' 🪙</td><td>'+e.jackWinner+'</td><td>'+(e.myWin||0)+' 🪙</td></tr>').join('')+'</table>':'<p class="note">No draws yet.</p>')+
  '<p class="note">Your totals: won '+S.stats.won+' 🪙 · spent '+S.stats.spent+' 🪙 · best match '+S.stats.best+'.</p></div>';
 } else {
  h+='<div class="card"><h2>About</h2><p>Coffeebreak Lotto is a just-for-fun lotto game. Everything uses <b>play coins</b>.</p><ul class="note"><li>For fun only, play coins have no real value.</li><li>No real money, no cash-out and no real prizes. Play coins can\'t be bought, sold or exchanged.</li><li>Other "players" are virtual and simulated on your device.</li><li>Draws are random and run on your device.</li></ul><p class="note">If gambling is causing you harm, free confidential help is available 24/7 at Gambling Help Online: 1800 858 858.</p>'+(D?'':'<button id="ltReset">Reset game</button>')+'</div>';
 }
 R.innerHTML=h;
 R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(!drawing){tab=b.dataset.tab;render()}});
 R.querySelectorAll('.n').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(pick.includes(n))pick=pick.filter(x=>x!==n);else if(pick.length<PICK)pick.push(n);pick.sort((a,b)=>a-b);render()});
 const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f};
 on('ltFree',claimFree);on('ltBuy',()=>buy(pick.slice()));on('ltQP',()=>buy(quick()));on('ltClr',()=>{pick=[];render()});on('ltGo',runDraw);on('ltBuyScr',scratch);
 on('ltReset',()=>{if(confirm('Reset all play coins and history?')){localStorage.removeItem(SK);location.reload()}});
}
window.LT={get S(){return S},render,runDraw,buy,quick,scratch,setTab(t){tab=t;render()}};
render();
})();
function update(){}function draw(){}
