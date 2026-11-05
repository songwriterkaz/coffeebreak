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
// ===== Coffeebreak Skill Picker: 100% skill, deterministic, free entry =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const OWNER='songwriterkaz@gmail.com';
// Optional server endpoint (e.g. Supabase Edge Function, see skillpicker-server/). Empty = email fallback.
const PRIZE_ENDPOINT='';
const SK=D?'spDemo':'spSave';
const st=document.createElement('style');st.textContent=`
#sp{flex:1;width:100%;max-width:1000px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#sp h1,#sp h2{color:#e8a0b0;margin:6px 0}#sp button{background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:10px;padding:8px 12px;font:15px Georgia;cursor:pointer;margin:2px}
#sp button.on,#sp button.primary{background:#e8a0b0;color:#1a0a10;font-weight:bold}
#sp .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:14px;padding:12px;margin:8px 0}
#sp .note{font-size:13px;color:#d9b8c0;line-height:1.45}#sp input,#sp select{background:#2a1020;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:6px;width:100%;box-sizing:border-box;margin:2px 0;font:14px Georgia}
#sp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
#sp .pz{background:linear-gradient(135deg,#fff3f8,#ffd0e2);color:#3a1424;border-radius:12px;padding:10px;font-size:14px}
#sp canvas{width:100%;max-width:720px;background:#2a0f1c;border:4px solid #e8a0b0;border-radius:14px;display:block;margin:6px auto;touch-action:none}
#sp .ctl{text-align:center}#sp .ctl button{font-size:20px;padding:12px 20px}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='sp';c.parentNode.insertBefore(R,c.nextSibling);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let S;try{S=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){}
if(!S)S={best:0,practice:0,qualified:null,claimed:false,demoRuns:0};
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const PRIZES=[
 {id:'plush',e:'🧸',n:'Coffeebreak Bean Plush',sup:'Printify',prod:'Custom All-Over Print Plush (Printify catalogue, AU print provider where available)'},
 {id:'mug',e:'☕',n:'Coffeebreak 11oz Mug',sup:'Printful',prod:'White Glossy Mug 11oz (Printful catalogue)'},
 {id:'tee',e:'👕',n:'Coffeebreak Tee',sup:'Printful',prod:'Unisex Staple T-Shirt, Bella+Canvas 3001 (Printful catalogue), size chosen by winner'}];
// --- deterministic game: no randomness anywhere in grab logic ---
const W=720,H=440,TOL=[26,20,15];const GOAL=10,TIME=60;
let tab='play',run=null,raf=0;
function stage(k){return Math.min(2,Math.floor(k/4))}
function newRun(mode){run={mode,t0:performance.now(),x:360,y:40,phase:'move',grabs:0,miss:0,item:0,dir:0,res:'',hold:null};}
function itemX(r,now){// conveyor at fixed speed, fully predictable
 const s=stage(r.grabs),el=((r.frozen!=null?r.frozen:now)-r.t0-(r.paused||0))/1000;const base=[120,600,360,220,500,300,640,160,420,560][r.grabs%10];
 if(s===0)return base;const sp=s===1?70:120;const span=440;let p=(base-140+el*sp)%(span*2);if(p>span)p=span*2-p;return 140+p}
function step(now){if(!run)return;const cv=document.getElementById('spC');if(!cv){run=null;return}const g=cv.getContext('2d');
 const left=TIME-(now-run.t0)/1000;
 if(run.phase==='move'){run.x=Math.max(30,Math.min(W-30,run.x+run.dir*6))}
 else if(run.phase==='down'){run.y+=9;if(run.y>=330){run.y=330;const ix=itemX(run,now);const ok=Math.abs(ix-run.x)<=TOL[stage(run.grabs)];run.phase='up';run.hold=ok?run.grabs:null;if(ok)run.grabs++;else run.miss++;run.res=ok?'Grabbed!':'Missed: off by '+Math.round(Math.abs(ix-run.x))+'px (needed ≤'+TOL[stage(run.grabs)]+')'}}
 else if(run.phase==='up'){run.y-=9;if(run.y<=40){run.y=40;run.phase='move';run.hold=null;run.paused=(run.paused||0)+(now-run.frozen);run.frozen=null}}
 g.fillStyle='#2a0f1c';g.fillRect(0,0,W,H);g.fillStyle='#5a2a3a';g.fillRect(0,360,W,80);
 g.font='bold 34px serif';g.textAlign='center';
 if(run.grabs<GOAL){const ix=itemX(run,now);g.fillText(['🧸','☕','👕'][run.grabs%3],ix,360);g.strokeStyle='#ffcf6a';g.strokeRect(ix-TOL[stage(run.grabs)],365,TOL[stage(run.grabs)]*2,6)}
 g.strokeStyle='#ffe9c7';g.lineWidth=3;g.beginPath();g.moveTo(run.x,0);g.lineTo(run.x,run.y);g.stroke();
 g.fillStyle='#e8a0b0';g.fillRect(run.x-22,run.y,44,10);g.fillRect(run.x-22,run.y,6,26);g.fillRect(run.x+16,run.y,6,26);
 if(run.hold!==null)g.fillText(['🧸','☕','👕'][run.hold%3],run.x,run.y+40);
 g.font='18px Georgia';g.fillStyle='#ffe9c7';g.textAlign='left';
 g.fillText((run.mode==='prize'?'PRIZE CHALLENGE':'PRACTICE')+'  Grabs '+run.grabs+'/'+GOAL+'  Misses '+run.miss+'  Time '+Math.max(0,left).toFixed(1)+'s',12,24);
 g.fillText(run.res,12,52);
 const done=run.grabs>=GOAL||left<=0||(run.mode==='prize'&&run.miss>0);
 if(done&&run.phase==='move'){finish(left);return}
 raf=requestAnimationFrame(step)}
function finish(left){const r=run;run=null;const win=r.grabs>=GOAL&&r.miss===0&&left>0;const sc=r.grabs*100+Math.max(0,Math.round(left*10));
 if(r.mode==='practice'){S.practice++;S.best=Math.max(S.best,sc)}
 if(r.mode==='prize'&&win&&!S.qualified){S.qualified={score:sc,time:(TIME-left).toFixed(2),date:new Date().toISOString(),code:'CBSP-'+sc+'-'+Date.now().toString(36).toUpperCase()}}
 save();G.score=sc;tab=r.mode==='prize'&&win?'claim':'play';render(r.mode==='prize'?(win?'🎉 You cleared the Prize Challenge! Claim your prize below.':'Prize Challenge not cleared (any miss or the timer ends the run). Try again, entry is free.'):'Practice score: '+sc)}
function drop(){if(run&&run.phase==='move'){run.phase='down';run.frozen=performance.now()}}
function start(mode){if(D&&mode==='prize'){window.demoEnd&&window.demoEnd('The free demo is practice only. The full <b>Coffeebreak Skill Picker</b> has the Prize Challenge with real Coffeebreak merch prizes.');return}
 if(D&&S.demoRuns>=3){window.demoEnd&&window.demoEnd('The demo includes 3 practice runs.');return}if(D){S.demoRuns++;save()}
 cancelAnimationFrame(raf);newRun(mode);raf=requestAnimationFrame(step)}
document.addEventListener('keydown',e=>{if(!run)return;if(e.key==='ArrowLeft')run.dir=-1;if(e.key==='ArrowRight')run.dir=1;if(e.key===' '||e.key==='ArrowDown'){drop();e.preventDefault()}});
document.addEventListener('keyup',e=>{if(run&&(e.key==='ArrowLeft'||e.key==='ArrowRight'))run.dir=0});
const SKILL=`<p><b>Game of skill statement:</b> Coffeebreak Skill Picker is a game of skill, not chance. There is no random grip strength, no payout rate and no rigged odds. Prizes move on a fixed, repeating path at a fixed speed and the conveyor stops the moment you press DROP, and the claw <b>always</b> grabs when it is lowered with its centre within the gold target zone (26px, then 20px, then 15px as you progress). Every miss shows exactly how far off you were. The same inputs always give the same result.</p>`;
const TC=`<h2>Terms & Conditions</h2><ol class="note">
<li><b>Free entry.</b> Playing the Prize Challenge costs nothing and no purchase is needed to win. Prizes are paid for by Karen O'Brien (Coffeebreak) from game sales.</li>
<li><b>Skill only.</b> To win, clear 10 grabs in 60 seconds with zero misses. Nothing in the result is random.</li>
<li><b>Ties judged.</b> If more claims arrive than prizes available in a period, the fastest verified clear wins; remaining ties are judged by Karen on the evidence supplied (a short screen recording may be requested). Her decision is final.</li>
<li><b>Australia-only shipping.</b> Prizes ship to Australian addresses only. Open to residents of Australia aged 18+.</li>
<li><b>One prize per person.</b> Claims are checked by hand. Cheating, modified game files or duplicate claims are void.</li>
<li><b>Delivery.</b> Prizes are made to order and shipped directly by Printify or Printful. Allow about 2–4 weeks. Prizes can't be swapped for cash. While stocks and supplier products last; an equal-value Coffeebreak merch item may be substituted.</li>
<li><b>Privacy.</b> Your name, email and address are used only to send your prize and are shared only with the print supplier for shipping.</li>
<li>Your rights under the Australian Consumer Law are not excluded.</li></ol>`;
const HONEST=`<p class="note"><b>How prizes are sent, honestly:</b> right now each prize claim is emailed to Karen, who places the dropship order once with Printify or Printful. It is <b>not automatic yet</b>. The app has a spot for a server (e.g. a Supabase Edge Function) that can auto-place the order through the Printify API; until it is set up, claims go by email.</p>`;
function claimText(f,p){return `Coffeebreak Skill Picker - PRIZE CLAIM
Verification code: ${S.qualified.code}
Score: ${S.qualified.score}  Clear time: ${S.qualified.time}s  Date: ${S.qualified.date}

Prize: ${p.n}
Supplier: ${p.sup}
Product: ${p.prod}
Size/variant: ${f.size||'-'}

Ship to (Australia only):
${f.name}
${f.addr}
${f.sub} ${f.state} ${f.pc}
Australia
Email: ${f.email}  Phone: ${f.phone||'-'}

To place: open ${p.sup}, create a manual order for this product with the Coffeebreak design, paste the address above.`}
function mail(s,b){const u='mailto:'+OWNER+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b);window.__opened=u;window.open(u,'_blank')}
async function submitClaim(){const v=id=>(document.getElementById(id)||{}).value||'';const f={name:v('fN'),email:v('fE'),phone:v('fP'),addr:v('fA'),sub:v('fS'),state:v('fSt'),pc:v('fPc'),size:v('fSz'),prize:v('fPz')};
 const out=document.getElementById('cOut');
 if(!f.name||!/^\S+@\S+\.\S+$/.test(f.email)||!f.addr||!f.sub||!/^\d{4}$/.test(f.pc)){out.textContent='Please fill in name, email, street, suburb and a 4-digit Australian postcode.';return}
 if(!document.getElementById('f18').checked){out.textContent='Please confirm you are 18+ and accept the T&Cs.';return}
 const p=PRIZES.find(x=>x.id===f.prize)||PRIZES[0];const body=claimText(f,p);
 if(PRIZE_ENDPOINT){try{const r=await fetch(PRIZE_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({claim:f,prize:p,qualified:S.qualified})});if(r.ok){S.claimed=true;save();out.textContent='Claim sent to the prize server. Karen will confirm by email.';return}}catch(e){}}
 mail('Prize claim '+S.qualified.code+' - '+p.n,body);S.claimed=true;save();out.innerHTML='Your email app has opened with the claim addressed to Karen. Press send to finish. <br><pre class="note" style="white-space:pre-wrap">'+esc(body)+'</pre>'}
function render(msg){cancelAnimationFrame(raf);run=null;
 const tabs=['play','prizes','claim','rules'].map(t=>`<button data-t="${t}" class="${tab===t?'on':''}">${{play:'🕹️ Play',prizes:'🎁 Prizes',claim:'📦 Claim',rules:'📜 Rules & T&Cs'}[t]}</button>`).join('');
 let b='';
 if(tab==='play')b=`<div class="card"><p>${msg?'<b>'+esc(msg)+'</b>':'Move the claw over the prize and drop it inside the gold zone.'}</p>
 <canvas id="spC" width="${W}" height="${H}"></canvas>
 <div class="ctl"><button id="bL">◀</button><button class="primary" id="bD">DROP</button><button id="bR">▶</button></div>
 <p style="text-align:center"><button id="bPr">Free Practice (no prizes)</button> <button class="primary" id="bCh">🎁 Prize Challenge (free entry)</button></p>
 <p class="note">Keys: ← → to move, Space to drop. Practice best: ${S.best}. Prize Challenge: 10 grabs in 60s, zero misses.${D?' Demo: practice only, 3 runs.':''}</p></div>`;
 if(tab==='prizes')b=`<div class="card"><h2>Real Coffeebreak merch prizes</h2><div class="grid">${PRIZES.map(p=>`<div class="pz"><div style="font-size:40px">${p.e}</div><b>${p.n}</b><br>Made and shipped by ${p.sup}<br><small>${esc(p.prod)}</small></div>`).join('')}</div>${HONEST}</div>`;
 if(tab==='claim')b=`<div class="card">${D?'<p>Prize claims are in the full version. The demo is practice only.</p>':!S.qualified?'<p>Clear the Prize Challenge first to unlock a claim.</p>':S.claimed?'<p>Your claim ('+esc(S.qualified.code)+') has been sent. One prize per person.</p>':`<h2>Claim your prize</h2><p class="note">Code ${esc(S.qualified.code)} · score ${S.qualified.score}</p>
 <select id="fPz">${PRIZES.map(p=>`<option value="${p.id}">${p.e} ${p.n}</option>`).join('')}</select>
 <input id="fSz" placeholder="Tee size (S/M/L/XL/2XL), if you chose the tee">
 <input id="fN" placeholder="Full name"><input id="fE" placeholder="Email"><input id="fP" placeholder="Phone (for the courier, optional)">
 <input id="fA" placeholder="Street address"><input id="fS" placeholder="Suburb"><select id="fSt">${['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'].map(s=>`<option>${s}</option>`).join('')}</select><input id="fPc" placeholder="Postcode">
 <label class="note"><input type="checkbox" id="f18" style="width:auto"> I'm 18+, live in Australia and accept the T&Cs.</label>
 <button class="primary" id="fGo">Send prize claim</button><p id="cOut" class="note"></p>`}${HONEST}</div>`;
 if(tab==='rules')b=`<div class="card"><h2>How it works</h2>${SKILL}<p class="note">18+ only for prize claims. Practice mode is free and has no prizes.</p>${TC}</div>`;
 R.innerHTML=`<h1>🕹️ Coffeebreak Skill Picker</h1><p class="note">Free entry · 100% skill · Real merch prizes · 18+ · Australia only</p><div>${tabs}</div>${b}`;
 R.querySelectorAll('[data-t]').forEach(x=>x.onclick=()=>{tab=x.dataset.t;render()});
 const q=id=>document.getElementById(id);
 if(q('bPr')){q('bPr').onclick=()=>start('practice');q('bCh').onclick=()=>start('prize');q('bD').onclick=drop;
  [['bL',-1],['bR',1]].forEach(([id,d])=>{const e=q(id);e.onpointerdown=()=>{if(run)run.dir=d};e.onpointerup=e.onpointerleave=()=>{if(run)run.dir=0}})}
 if(q('fGo'))q('fGo').onclick=submitClaim;
 if(q('spC')){const g=q('spC').getContext('2d');g.fillStyle='#2a0f1c';g.fillRect(0,0,W,H);g.font='26px Georgia';g.fillStyle='#ffe9c7';g.textAlign='center';g.fillText('Press Practice or Prize Challenge',W/2,H/2)}}
window.SP={start,drop,finish:()=>{},get run(){return run},S:()=>S,itemX:()=>run&&itemX(run,performance.now())};
render();
})();
