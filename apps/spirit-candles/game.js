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
// ===== Coffeebreak Spirit Candles =====
const DEMO=!!window.DEMO,SK=DEMO?'candlesDemo':'candlesSave';
let S={j:[],lit:0,used:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
if(!Array.isArray(S.j))S.j=[];
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){alert('Storage is full — try a smaller photo.')}};
const G={state:'title',score:0,level:0};window.G=G;
const NOTE='A remembrance and reflection space for entertainment; it does not contact real spirits.';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=a=>a[Math.random()*a.length|0];

// 12 candle colours with meanings. Demo unlocks first 4.
const COLS=[
 {id:'white', name:'White', hex:'#f4f0e6', wax:'#e8e2d4', mean:'Peace', tip:'Quiet the mind and rest your heart.'},
 {id:'pink',  name:'Pink',  hex:'#f4a0b8', wax:'#e87898', mean:'Love', tip:'Send warmth to someone you hold dear.'},
 {id:'purple',name:'Purple',hex:'#b080e0', wax:'#8a58c0', mean:'Spirit', tip:'A gentle space for reflection and wonder.'},
 {id:'blue',  name:'Blue',  hex:'#78b0e8', wax:'#4a88c8', mean:'Healing', tip:'Soften what hurts and breathe a little easier.'},
 {id:'gold',  name:'Gold',  hex:'#e8c860', wax:'#c8a030', mean:'Blessings', tip:'Count the good things still around you.'},
 {id:'black', name:'Black', hex:'#3a3a42', wax:'#222228', mean:'Protection', tip:'Feel held and safe in this quiet moment.'},
 {id:'green', name:'Green', hex:'#78c888', wax:'#4a9858', mean:'Growth', tip:'New beginnings and gentle next steps.'},
 {id:'red',   name:'Red',   hex:'#e06060', wax:'#b83838', mean:'Courage', tip:'Strength for the hard days.'},
 {id:'yellow',name:'Yellow',hex:'#f0d860', wax:'#d0b028', mean:'Hope', tip:'A little light for tomorrow.'},
 {id:'orange',name:'Orange',hex:'#e89850', wax:'#c07030', mean:'Friendship', tip:'Warmth shared between kind hearts.'},
 {id:'silver',name:'Silver',hex:'#c8d0d8', wax:'#98a0a8', mean:'Remembrance', tip:'Honour a memory that still shines.'},
 {id:'teal',  name:'Teal',  hex:'#50b8b0', wax:'#308888', mean:'Clarity', tip:'Clear thoughts and a calm path forward.'}
];
const NCOL=DEMO?4:COLS.length;

const MSGS={
 peace:['May peace settle over you like soft evening light.','Breathe in calm. Breathe out the day.','Quiet is a gift. Rest in it for a moment.','You are safe in this stillness.','Let the noise of the world fall away.'],
 love:['Love never really leaves; it just changes shape.','Someone, somewhere, is glad you exist.','Send this warmth outward. It will find its way.','Your love still matters. It always did.','Hold them gently in your thoughts tonight.'],
 spirit:['Wonder is welcome here. Stay curious and kind.','A quiet mind can hear what a busy one misses.','You are more than the weight you carry.','Look for small signs of beauty today.','Reflection is its own kind of prayer.'],
 healing:['Healing is slow, and that is alright.','Be as gentle with yourself as you would with a friend.','One soft breath is already progress.','What hurts can soften, given time and care.','You do not have to be fixed today. Just held.'],
 blessings:['Count three small blessings before you sleep.','Goodness is often quiet. Notice it anyway.','May today leave you a little more thankful.','Even ordinary days can be holy.','There is still light around you.'],
 protection:['You are held. You are safe in this moment.','Let worry wait outside the door for now.','Stand in your own quiet strength.','Nothing needs to rush you here.','Wrap yourself in calm.'],
 growth:['New beginnings often start as tiny sparks.','You are allowed to grow at your own pace.','Plant one kind intention and water it daily.','Change can be gentle.','Tomorrow can be a little different.'],
 courage:['Bravery is showing up, even softly.','You have already survived so much.','Take the next small step. That is enough.','Fear and courage often walk together.','Your heart knows the way.'],
 hope:['Hope is a candle that refuses to go out.','Morning always follows the dark.','Keep a little room for better days.','Something good is still possible.','Look up. The sky is wider than your worry.'],
 friendship:['Kind friends are a kind of home.','Reach out to someone who makes you smile.','Warmth shared is warmth doubled.','You are easier to love than you think.','A simple hello can light a whole room.'],
 remembrance:['Remembering is a way of loving still.','Their light lives on in the stories you tell.','A memory shared is a memory kept alive.','Say their name out loud. Love hears it.','Grief and gratitude can sit at the same table.'],
 clarity:['Clear the fog one breath at a time.','You do not need every answer tonight.','Trust the next honest step.','Quiet brings things into focus.','Listen inward. Kindness is speaking.']
};
const KEYMAP={Peace:'peace',Love:'love',Spirit:'spirit',Healing:'healing',Blessings:'blessings',Protection:'protection',Growth:'growth',Courage:'courage',Hope:'hope',Friendship:'friendship',Remembrance:'remembrance',Clarity:'clarity'};

const SIGNS=[
 {k:'tall',   label:'A tall, steady flame',   text:'A tall flame can mean your intention is clear and your heart is focused. Stay with that clarity.'},
 {k:'flicker',label:'A soft flicker',         text:'A flicker can mean emotions are near the surface. Be gentle with whatever rises.'},
 {k:'dance',  label:'A dancing flame',        text:'A dancing flame can mean energy and movement. Something in you is ready to shift.'},
 {k:'lean',   label:'A flame that leans',     text:'A leaning flame can mean your thoughts are pulling toward someone or something. Notice who comes to mind.'},
 {k:'bright', label:'An especially bright glow',text:'A bright glow can mean warmth and comfort are close. Receive them.'},
 {k:'soft',   label:'A low, soft flame',      text:'A soft flame can mean rest is needed. You do not have to push tonight.'}
];

// Session state
let sess=null; // {col,name,photo,intent,litAt,burn,snuffed,msgs:[],sign,matchT,smoke:[]}
let panel='altar'; // altar | journal | about
let matchAnim=0; // 0..1 while striking
let ambience=null; // {ac,nodes}

function readImg(f,cb){if(!f)return cb('');const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c2=document.createElement('canvas'),m=280,s=Math.min(1,m/Math.max(im.width,im.height));c2.width=Math.max(1,im.width*s|0);c2.height=Math.max(1,im.height*s|0);c2.getContext('2d').drawImage(im,0,0,c2.width,c2.height);cb(c2.toDataURL('image/jpeg',.72))};im.onerror=()=>cb('');im.src=r.result};r.onerror=()=>cb('');r.readAsDataURL(f)}

function startAmb(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=new AC();ac.resume&&ac.resume();
 const o1=ac.createOscillator(),o2=ac.createOscillator(),o3=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();
 o1.type='sine';o2.type='sine';o3.type='triangle';o1.frequency.value=110;o2.frequency.value=164.81;o3.frequency.value=220;
 f.type='lowpass';f.frequency.value=600;g.gain.value=.018;
 o1.connect(f);o2.connect(f);o3.connect(f);f.connect(g);g.connect(ac.destination);
 o1.start();o2.start();o3.start();ambience={ac,g,os:[o1,o2,o3]}}catch(e){}}
function stopAmb(){if(!ambience)return;try{ambience.os.forEach(o=>o.stop());ambience.ac.close()}catch(e){}ambience=null}
function crackle(){try{const ac=ambience?ambience.ac:(window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)());ac.resume&&ac.resume();
 const n=ac.createBuffer(1,ac.sampleRate*.08|0,ac.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
 const s=ac.createBufferSource();s.buffer=n;const g=ac.createGain();g.gain.value=.04;s.connect(g);g.connect(ac.destination);s.start()}catch(e){}}
function whoosh(){try{const ac=ambience?ambience.ac:(window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)());ac.resume&&ac.resume();
 const o=ac.createOscillator(),g=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(400,ac.currentTime);o.frequency.exponentialRampToValueAtTime(60,ac.currentTime+.35);
 g.gain.setValueAtTime(.05,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.4);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.42)}catch(e){}}

function newSess(col){sess={col,name:'',photo:'',intent:'',litAt:0,burn:1,snuffed:0,msgs:[],sign:null,matchT:0,smoke:[],msgT:0,nextMsg:2.5,signAt:0};matchAnim=0}

function lightCandle(){if(!sess||sess.litAt)return;matchAnim=1;crackle();
 setTimeout(()=>{sess.litAt=performance.now()/1000;sess.burn=1;sess.snuffed=0;sess.sign=pick(SIGNS);sess.signAt=sess.litAt+8+Math.random()*6;sess.nextMsg=2+Math.random()*2;S.lit++;G.score=S.lit;G.level=S.j.length;save();matchAnim=0;if(!ambience)startAmb();renderUI()},700)}

function snuff(){if(!sess||!sess.litAt||sess.snuffed)return;whoosh();sess.snuffed=1;sess.burn=0;for(let i=0;i<18;i++)sess.smoke.push({x:450+(Math.random()-.5)*30,y:280,vx:(Math.random()-.5)*20,vy:-30-Math.random()*40,life:1,r:4+Math.random()*8});renderUI()}

function burnDone(){if(!sess||!sess.litAt||sess.snuffed)return;sess.burn=0;sess.snuffed=1;for(let i=0;i<12;i++)sess.smoke.push({x:450+(Math.random()-.5)*20,y:300,vx:(Math.random()-.5)*10,vy:-20-Math.random()*30,life:1,r:3+Math.random()*6});
 toast('The candle has burned down. Your intention rests in the quiet.');renderUI()}

function pushMsg(){if(!sess||!sess.litAt||sess.snuffed)return;const key=KEYMAP[COLS[sess.col].mean]||'peace';const m=pick(MSGS[key]);
 sess.msgs.push({t:m,at:performance.now()/1000,y:260});if(sess.msgs.length>6)sess.msgs.shift()}

function saveJournal(){if(!sess)return;if(DEMO){window.demoEnd&&window.demoEnd('The free demo includes 4 candle colours. The full version has all 12 colours, photos of loved ones, a candle journal saved on your device and all 38 Coffeebreak songs.');return}
 const e={ts:Date.now(),col:sess.col,name:sess.name,photo:sess.photo,intent:sess.intent,sign:sess.sign&&sess.sign.label,msgs:sess.msgs.map(m=>m.t).slice(-4)};
 S.j.unshift(e);S.j=S.j.slice(0,80);S.used++;G.level=S.j.length;save();toast('Saved to your candle journal 🕯️');renderUI()}

let toastMsg='',toastT=0;function toast(m){toastMsg=m;toastT=3.2}

// ---- Overlay UI ----
const css=document.createElement('style');css.textContent=`
#cd{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(720px,96vw);height:min(86vh,720px);background:linear-gradient(#1a1008,#080402);border:2px solid #c8a060;border-radius:18px;color:#f6e6c8;font:15px/1.45 Georgia,serif;flex-direction:column;box-shadow:0 0 50px #ffb04033;overflow:hidden}
#cd .hd{padding:10px 14px;text-align:center;border-bottom:1px solid #5a3a1a;position:relative}
#cd .hd b{font-size:18px;color:#ffd890}#cd .hd small{display:block;color:#c8a878;font-size:12px;margin-top:2px}
#cd .x{position:absolute;right:10px;top:8px;background:none;border:0;color:#ffd890;font-size:20px;cursor:pointer}
#cd .bd{flex:1;overflow:auto;padding:12px 14px}
#cd .nt{font-size:12px;text-align:center;color:#c8a878;border:1px dashed #8a6040;border-radius:8px;padding:7px;margin:6px 0}
#cd .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center;margin:8px 0}
#cd .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
#cd .card{background:#2a1a0ecc;border:1px solid #6a4020;border-radius:12px;padding:10px;cursor:pointer;text-align:center;transition:border-color .15s}
#cd .card:hover,#cd .card.on{border-color:#ffd890;box-shadow:0 0 12px #ffb04044}
#cd .card.lk{opacity:.45;cursor:not-allowed}
#cd .sw{width:36px;height:36px;border-radius:50%;margin:0 auto 6px;border:2px solid #fff4;box-shadow:0 0 10px #0008}
#cd input,#cd textarea{width:100%;box-sizing:border-box;border-radius:10px;border:1px solid #7a5028;background:#1a0e06;color:#f6e6c8;padding:8px;font:15px Georgia,serif;margin:4px 0}
#cd textarea{height:70px;resize:none}
#cd button.b{background:#7a4a1a;color:#ffe8c0;border:1px solid #c08040;border-radius:12px;padding:8px 14px;font:bold 14px Georgia,serif;cursor:pointer;margin:3px}
#cd button.b:disabled{opacity:.4;cursor:not-allowed}
#cd button.g{background:#3a2a18;border-color:#8a6040}
#cd .ph{width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #d89a40;vertical-align:middle}
#cd .tabs{display:flex;justify-content:space-around;border-top:1px solid #5a3a1a;padding:6px 0}
#cd .tabs button{background:none;border:0;color:#d8b888;font:14px Georgia,serif;cursor:pointer}
#cd .tabs button.on{color:#ffd890;font-weight:bold}
#cd .msg{background:#fff4dc22;border-left:3px solid #e0a840;padding:6px 10px;margin:6px 0;font-style:italic;border-radius:0 8px 8px 0}
#cd .sign{background:#2a1808;border:1px solid #c8a060;border-radius:10px;padding:8px 10px;margin:8px 0;font-size:14px}
#cd .jl{background:#2a1a0e;border:1px solid #5a3a20;border-radius:12px;padding:10px;margin:8px 0}
`;document.head.appendChild(css);
const cd=document.createElement('div');cd.id='cd';document.body.appendChild(cd);

function openApp(p){panel=p||'altar';G.state='app';cd.style.display='flex';if(!ambience)startAmb();try{startMusic()}catch(e){}renderUI()}
function closeApp(){cd.style.display='none';G.state='title'}

function renderUI(){
 if(panel==='journal')return rJournal();
 if(panel==='about')return rAbout();
 rAltar();
}

function shell(title,sub,body,foot){
 cd.innerHTML=`<div class="hd"><b>${title}</b><small>${sub}</small><button class="x">✕</button></div><div class="bd">${body}</div>${foot||''}<div class="tabs">
  <button data-t="altar" class="${panel==='altar'?'on':''}">🕯️ Altar</button>
  <button data-t="journal" class="${panel==='journal'?'on':''}">📔 Journal${DEMO?' 🔒':''}</button>
  <button data-t="about" class="${panel==='about'?'on':''}">ℹ️ About</button>
 </div>`;
 cd.querySelector('.x').onclick=closeApp;
 cd.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{
  if(b.dataset.t==='journal'&&DEMO){window.demoEnd&&window.demoEnd('The candle journal, photos and all 12 colours are in the full version of <b>Coffeebreak Spirit Candles</b>.');return}
  panel=b.dataset.t;renderUI();
 });
}

function rAltar(){
 if(!sess){
  const cards=COLS.map((c,i)=>{
   const lk=i>=NCOL;
   return `<div class="card ${lk?'lk':''}" data-c="${i}"><div class="sw" style="background:${c.hex};box-shadow:0 0 14px ${c.hex}88"></div><b>${esc(c.name)}</b><br><small>${esc(c.mean)}</small>${lk?'<div style="font-size:11px;margin-top:4px">🔒 Full version</div>':`<div style="font-size:11px;color:#c8a878;margin-top:4px">${esc(c.tip)}</div>`}</div>`;
  }).join('');
  shell('🕯️ Spirit Candles',DEMO?'Free demo · 4 colours':'All 12 colours',
   `<div class="nt">⚠️ ${NOTE}</div>
    <p style="text-align:center;color:#e8c898">Choose a candle for your altar.</p>
    <div class="grid">${cards}</div>`,
   '');
  cd.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{
   const i=+b.dataset.c;if(i>=NCOL){window.demoEnd&&window.demoEnd('That colour is in the full version, along with photos, the journal and all 38 Coffeebreak songs.');return}
   newSess(i);renderUI();
  });
  return;
 }
 const c=COLS[sess.col];
 const lit=!!sess.litAt&&!sess.snuffed;
 const burned=!!sess.litAt&&sess.snuffed&&sess.burn<=0.02;
 let body=`<div class="nt">⚠️ ${NOTE}</div>
  <div class="row"><div class="sw" style="background:${c.hex};width:48px;height:48px;box-shadow:0 0 18px ${c.hex}"></div>
   <div><b>${esc(c.name)} — ${esc(c.mean)}</b><br><small style="color:#c8a878">${esc(c.tip)}</small></div></div>`;
 if(sess.photo)body+=`<div class="row"><img class="ph" src="${sess.photo}" alt="">${sess.name?`<b style="margin-left:8px">${esc(sess.name)}</b>`:''}</div>`;
 else if(sess.name)body+=`<div class="row"><b>For ${esc(sess.name)}</b></div>`;
 if(sess.intent)body+=`<div class="msg">“${esc(sess.intent)}”</div>`;

 if(!sess.litAt){
  body+=`<label>Loved one's name <small style="color:#c8a878">(optional)</small></label>
   <input id="nm" maxlength="60" placeholder="e.g. Mum, Grandad, Sam…" value="${esc(sess.name)}">
   ${DEMO?'<p style="font-size:12px;color:#c8a878;text-align:center">📷 Photos are in the full version.</p>':
   `<label>Photo <small style="color:#c8a878">(optional, stays on this device)</small></label>
    <input type="file" id="ph" accept="image/*">`}
   <label>Your intention or message</label>
   <textarea id="in" maxlength="500" placeholder="Write a wish, a thank you, a memory or a quiet thought…">${esc(sess.intent)}</textarea>
   <div class="row"><button class="b" id="lt">🔥 Light with a match</button><button class="b g" id="bk">← Other colours</button></div>`;
 }else{
  body+=`<p style="text-align:center;color:#e8c898">${lit?'The flame is lit. Sit with it a while.':burned?'The candle has burned down.':sess.snuffed?'The candle was snuffed. Soft smoke drifts upward.':'…'}</p>`;
  if(sess.msgs.length)body+=sess.msgs.slice().reverse().map(m=>`<div class="msg">${esc(m.t)}</div>`).join('');
  if(sess.sign&&sess.signShown)body+=`<div class="sign">✨ <b>Flame reading:</b> ${esc(sess.sign.label)}<br><small>${esc(sess.sign.text)}</small><br><small style="color:#a88858">Gentle interpretation for reflection only.</small></div>`;
  body+=`<div class="row">
   ${lit?`<button class="b" id="sn">💨 Snuff out</button>`:''}
   <button class="b" id="sv">${DEMO?'📔 Journal 🔒':'📔 Save to journal'}</button>
   <button class="b g" id="nw">🕯️ New candle</button>
   <button class="b g" id="bk">← Colours</button>
  </div>`;
 }
 shell('🕯️ Your altar',c.name+' · '+c.mean,body,'');
 const q=s=>cd.querySelector(s);
 if(q('#nm')){q('#nm').oninput=e=>sess.name=e.target.value;q('#nm').onkeydown=e=>e.stopPropagation()}
 if(q('#in')){q('#in').oninput=e=>sess.intent=e.target.value;q('#in').onkeydown=e=>e.stopPropagation()}
 if(q('#ph'))q('#ph').onchange=()=>{const f=q('#ph').files[0];readImg(f,p=>{sess.photo=p;renderUI()})};
 if(q('#lt'))q('#lt').onclick=()=>{if(q('#nm'))sess.name=q('#nm').value.trim();if(q('#in'))sess.intent=q('#in').value.trim();lightCandle()};
 if(q('#sn'))q('#sn').onclick=snuff;
 if(q('#sv'))q('#sv').onclick=saveJournal;
 if(q('#nw'))q('#nw').onclick=()=>{const col=sess.col;newSess(col);renderUI()};
 if(q('#bk'))q('#bk').onclick=()=>{sess=null;renderUI()};
}

function rJournal(){
 if(DEMO){panel='altar';return renderUI()}
 const body=S.j.length?S.j.map((e,i)=>{
  const c=COLS[e.col]||COLS[0];
  return `<div class="jl">
   ${e.photo?`<img class="ph" src="${e.photo}" style="float:left;margin:0 10px 6px 0">`:''}
   <b style="color:${c.hex}">${esc(c.name)}</b> · ${esc(c.mean)}
   <br><small>${new Date(e.ts).toLocaleString()}</small>
   ${e.name?`<br><b>For ${esc(e.name)}</b>`:''}
   ${e.intent?`<div class="msg">“${esc(e.intent)}”</div>`:''}
   ${e.sign?`<div style="font-size:13px;color:#e8c898">✨ ${esc(e.sign)}</div>`:''}
   ${(e.msgs||[]).map(m=>`<div style="font-size:13px;font-style:italic;color:#d8c0a0;margin:3px 0">“${esc(m)}”</div>`).join('')}
   <button class="b g" data-d="${i}">🗑 Remove</button><div style="clear:both"></div>
  </div>`;
 }).join(''):'<p style="text-align:center;color:#c8a878">Your journal is empty. Light a candle, then tap “Save to journal”. Everything stays on this device.</p>';
 shell('📔 Candle journal','Saved only on this device',body,'');
 cd.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(confirm('Remove this journal entry?')){S.j.splice(+b.dataset.d,1);save();renderUI()}});
}

function rAbout(){
 shell('ℹ️ About','Honesty first',
  `<div class="nt">⚠️ ${NOTE}</div>
   <div class="jl">
    <p><b>What this is</b></p>
    <p>A quiet, candlelit space for remembrance and reflection. You pick a colour, write an intention and sit with a flickering flame. Comforting words and flame-reading notes are gentle, pre-written prompts — not messages from beyond.</p>
    <p><b>What this is not</b></p>
    <p>It does not contact real spirits, ghosts or loved ones who have passed. Nothing is sent anywhere. Photos and journal entries stay on your device only.</p>
    <p><b>If you are grieving</b></p>
    <p>Be kind to yourself. In Australia you can call <b>GriefLine 1300 845 745</b> or <b>Lifeline 13 11 14</b>. In an emergency call <b>000</b>.</p>
    <p style="color:#c8a878;font-size:13px">${DEMO?'Free demo: 4 colours and 3 songs.':'Full version: 12 colours, photos, journal and 38 Coffeebreak songs.'}</p>
   </div>`,'');
}

// ---- Canvas drawing ----
const motes=Array.from({length:50},()=>({x:Math.random()*900,y:Math.random()*600,v:.15+Math.random()*.4,r:1+Math.random()*2,p:Math.random()*7}));

function drawCandle(X,Y,s,col,burn,lit,match){
 // burn: 1 = full height, 0 = burned down
 const c=COLS[col],h=90*Math.max(.12,burn),w=28;
 x.save();x.translate(X,Y);x.scale(s,s);
 // glow on altar
 if(lit){const g=x.createRadialGradient(0,-h-10,2,0,-h-10,90);g.addColorStop(0,c.hex+'66');g.addColorStop(1,c.hex+'00');x.fillStyle=g;x.beginPath();x.arc(0,-h-10,90,0,7);x.fill()}
 // holder
 x.fillStyle='#3a2a18';x.beginPath();x.ellipse(0,8,w+10,8,0,0,7);x.fill();x.fillStyle='#2a1a0e';x.fillRect(-w-6,0,(w+6)*2,10);
 // wax body
 const grd=x.createLinearGradient(-w,0,w,0);grd.addColorStop(0,c.wax);grd.addColorStop(.45,c.hex);grd.addColorStop(1,c.wax);
 x.fillStyle=grd;x.beginPath();x.moveTo(-w,0);x.lineTo(-w+2,-h);x.quadraticCurveTo(0,-h-6,w-2,-h);x.lineTo(w,0);x.closePath();x.fill();
 // melted rim
 x.fillStyle=c.hex;x.beginPath();x.ellipse(0,-h,w-2,5,0,0,7);x.fill();
 x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(0,-h,w-8,3,0,0,7);x.fill();
 // wick
 x.strokeStyle='#1a1008';x.lineWidth=1.6;x.beginPath();x.moveTo(0,-h);x.lineTo(0,-h-10);x.stroke();
 if(lit){
  const flicker=1+.12*Math.sin(t*14+X)+.06*Math.sin(t*23+Y);
  const lean=.15*Math.sin(t*3.2+X*.01);
  x.save();x.translate(lean*8,-h-10);x.scale(flicker,flicker);
  // outer glow
  const g2=x.createRadialGradient(0,-8,1,0,-8,36);g2.addColorStop(0,'rgba(255,220,120,.55)');g2.addColorStop(.5,'rgba(255,140,40,.2)');g2.addColorStop(1,'rgba(255,80,0,0)');
  x.fillStyle=g2;x.beginPath();x.arc(0,-8,36,0,7);x.fill();
  // flame body
  x.fillStyle='#ff9020';x.beginPath();x.moveTo(-7,4);x.quadraticCurveTo(-9,-10,0,-28);x.quadraticCurveTo(9,-10,7,4);x.quadraticCurveTo(0,8,-7,4);x.fill();
  x.fillStyle='#ffc860';x.beginPath();x.moveTo(-4,2);x.quadraticCurveTo(-5,-8,0,-20);x.quadraticCurveTo(5,-8,4,2);x.quadraticCurveTo(0,5,-4,2);x.fill();
  x.fillStyle='#fff6d0';x.beginPath();x.moveTo(-2,1);x.quadraticCurveTo(-2,-4,0,-12);x.quadraticCurveTo(2,-4,2,1);x.quadraticCurveTo(0,3,-2,1);x.fill();
  x.restore();
 }
 // match animation
 if(match>0){
  const mx=-40+match*50,my=-h-30-Math.sin(match*Math.PI)*20;
  x.save();x.translate(mx,my);x.rotate(-.6+match);
  x.fillStyle='#8a5a2a';x.fillRect(-20,-1.5,22,3);
  x.fillStyle=match<.85?'#ff6020':'#333';x.beginPath();x.arc(2,0,3.5,0,7);x.fill();
  if(match<.9){x.fillStyle='rgba(255,160,40,.7)';x.beginPath();x.ellipse(2,-4,3,6,0,0,7);x.fill()}
  x.restore();
 }
 x.restore();
}

function drawAltarBG(){
 const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#0a0610');g.addColorStop(.55,'#1a0e08');g.addColorStop(1,'#0c0804');
 x.fillStyle=g;x.fillRect(0,0,900,600);
 // stars / dust
 for(const m of motes){m.y-=m.v;if(m.y<0){m.y=600;m.x=Math.random()*900}x.fillStyle=`rgba(255,220,160,${.15+.2*Math.sin(t*2+m.p)})`;x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fill()}
 // back wall shelf
 x.fillStyle='#1a120c';x.fillRect(0,380,900,220);
 x.fillStyle='#2a1a10';x.fillRect(80,400,740,24);
 x.fillStyle='#3a2818';x.fillRect(100,418,700,14);
 // cloth
 x.fillStyle='#2a1810';x.beginPath();x.moveTo(160,432);x.quadraticCurveTo(450,460,740,432);x.lineTo(740,520);x.quadraticCurveTo(450,560,160,520);x.closePath();x.fill();
 x.strokeStyle='#5a3a20';x.lineWidth=2;x.stroke();
 // side candles (decor)
 if(!sess||!sess.litAt){
  drawCandle(180,500,.55,0,1,true,0);
  drawCandle(720,500,.55,Math.min(2,NCOL-1),1,true,0);
 }
}

function drawTitle(){
 drawAltarBG();
 // centre unlit decorative candle
 drawCandle(450,500,1.15,1,1,true,0);
 T('🕯️ Coffeebreak Spirit Candles',450,70,36,'#ffd890','center');
 T('Light a colour. Write an intention. Sit with the flame.',450,108,18,'#e8c898','center','italic ');
 // honest label box
 x.fillStyle='rgba(20,10,4,.75)';rr(140,140,620,70,12);x.fill();
 x.strokeStyle='#c8a060';x.lineWidth=1.5;x.stroke();
 T('⚠️ '+NOTE,450,168,14,'#e8d0a8','center','');
 T('Comforting words are pre-written prompts for reflection — not spirit contact.',450,190,13,'#c8a878','center','');
 button('go',300,300,300,56,'🕯️ Open the altar',()=>openApp('altar'),{fs:18,bg:'#5a3418',ac:'#ffb040'});
 button('ab',340,370,220,42,'ℹ️ What this is',()=>openApp('about'),{fs:15,bg:'#3a2410',ac:'#c8a060'});
 T(DEMO?'Free demo: 4 colours · 3 songs':'Full: 12 colours · photos · journal · 38 songs',450,470,14,'#c8a878','center','');
 T(NOTE,450,575,12,'#a88858','center','');
}

function drawAppCanvas(){
 drawAltarBG();
 if(!sess){
  // preview row of available colours
  const n=NCOL,gap=Math.min(70,700/n);
  for(let i=0;i<n;i++){
   const X=450-(n-1)*gap/2+i*gap;
   drawCandle(X,510,.7,i,1,true,0);
  }
  T('Choose a colour in the panel →',450,80,22,'#ffd890','center');
  return;
 }
 const c=COLS[sess.col];
 const lit=!!sess.litAt&&!sess.snuffed&&sess.burn>0.02;
 drawCandle(450,520,1.35,sess.col,sess.burn,lit,matchAnim);
 // photo beside candle
 if(sess.photo){
  try{
   if(!sess._img){sess._img=new Image();sess._img.src=sess.photo}
   if(sess._img.complete&&sess._img.naturalWidth){
    x.save();x.beginPath();x.arc(620,420,40,0,7);x.closePath();x.clip();
    x.drawImage(sess._img,580,380,80,80);x.restore();
    x.strokeStyle='#d89a40';x.lineWidth=3;x.beginPath();x.arc(620,420,40,0,7);x.stroke();
   }
  }catch(e){}
 }
 if(sess.name)T('For '+sess.name,450,70,22,'#ffd890','center');
 if(sess.intent&&sess.litAt){x.fillStyle='rgba(20,10,4,.55)';rr(200,95,500,40,10);x.fill();T('"'+trunc(sess.intent,52)+'"',450,120,15,'#e8d0a8','center','italic ')}
 // floating messages in smoke/glow
 if(sess.msgs)for(const m of sess.msgs){
  const age=(performance.now()/1000)-m.at;if(age>7)continue;
  const a=age<1?age:age>5?Math.max(0,1-(age-5)/2):1;
  const yy=m.y-age*18;
  x.globalAlpha=a*.9;x.fillStyle='rgba(255,240,200,.12)';rr(200,yy-18,500,36,10);x.fill();
  T(m.t,450,yy,15,'#ffe9c0','center','italic ');x.globalAlpha=1;
 }
 // smoke particles after snuff
 if(sess.smoke)for(const s of sess.smoke){
  x.globalAlpha=s.life*.35;x.fillStyle='#aaa';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill();x.globalAlpha=1;
 }
 if(sess.sign&&sess.signShown){
  x.fillStyle='rgba(20,10,4,.7)';rr(180,530,540,36,10);x.fill();
  T('✨ '+sess.sign.label,450,553,14,'#ffd890','center','');
 }
 T(c.name+' · '+c.mean,450,40,16,'#c8a878','center','');
}

function trunc(s,n){s=String(s);return s.length>n?s.slice(0,n-1)+'…':s}

function update(dt){
 if(matchAnim>0){matchAnim=Math.min(1,matchAnim+dt*1.6)}
 if(toastT>0)toastT-=dt;
 if(sess&&sess.litAt&&!sess.snuffed){
  // slow burn ~90 seconds full→empty
  const age=(performance.now()/1000)-sess.litAt;
  sess.burn=Math.max(0,1-age/90);
  if(sess.burn<=0)burnDone();
  sess.msgT=(sess.msgT||0)+dt;
  if(sess.msgT>=sess.nextMsg){sess.msgT=0;sess.nextMsg=5+Math.random()*5;pushMsg();if(panel==='altar'&&cd.style.display==='flex'){/* keep overlay msgs via re-render sparingly */}}
  if(sess.sign&&!sess.signShown&&(performance.now()/1000)>=sess.signAt){sess.signShown=1;if(panel==='altar'&&cd.style.display==='flex')renderUI()}
  // occasional ember crackle
  if(Math.random()<dt*.3)crackle();
 }
 if(sess&&sess.smoke){for(const s of sess.smoke){s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy-=8*dt;s.life-=dt*.35;s.r+=dt*3}sess.smoke=sess.smoke.filter(s=>s.life>0)}
 // refresh overlay messages every few seconds while lit
 if(sess&&sess.litAt&&!sess.snuffed&&panel==='altar'&&cd.style.display==='flex'){
  sess._uiT=(sess._uiT||0)+dt;if(sess._uiT>4.5){sess._uiT=0;renderUI()}
 }
}

function draw(){
 x.clearRect(0,0,900,600);
 if(G.state==='title')drawTitle();
 else drawAppCanvas();
 if(toastT>0){x.globalAlpha=Math.min(1,toastT);x.fillStyle='rgba(40,20,10,.9)';const w=Math.min(700,x.measureText?500:500);rr(200,540,500,36,12);x.fill();T(toastMsg,450,563,14,'#ffe9c7','center','');x.globalAlpha=1}
}

// hero thumbnail
(function(){const o=document.createElement('canvas');o.width=240;o.height=320;const k=x;x=o.getContext('2d');
 x.fillStyle='#0a0610';x.fillRect(0,0,240,320);
 // reuse drawCandle with temp context — inline mini candle
 x.fillStyle='#2a1a10';x.fillRect(40,250,160,20);
 const col=COLS[1];x.fillStyle=col.hex;x.fillRect(105,140,30,110);x.beginPath();x.ellipse(120,140,15,6,0,0,7);x.fill();
 x.fillStyle='#ff9020';x.beginPath();x.moveTo(112,138);x.quadraticCurveTo(110,110,120,90);x.quadraticCurveTo(130,110,128,138);x.fill();
 x.fillStyle='#fff6d0';x.beginPath();x.moveTo(116,136);x.quadraticCurveTo(120,110,120,100);x.quadraticCurveTo(124,120,124,136);x.fill();
 x=k;window.HERO_SRC=o.toDataURL()})();

bindInput({});
window.SC={G,S,COLS,NCOL,NOTE,openApp,closeApp,newSess,lightCandle,snuff,saveJournal,get sess(){return sess},set sess(v){sess=v},renderUI,startAmb,stopAmb};
startLoop();
