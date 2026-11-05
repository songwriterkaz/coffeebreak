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
// ===== Coffeebreak Psychic Line - AI Readers =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const PP_CLIENT_ID='AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-';
const OWNER='songwriterkaz@gmail.com';
const st=document.createElement('style');st.textContent=`
#cp{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#f3e6ff;background:radial-gradient(circle at 30% 10%,#3a1d5c,#140a24 70%);border-radius:16px}
#cp h1{color:#ffcf6a;margin:6px 0;font-style:italic}#cp h3{color:#d9b3ff;margin:6px 0}
#cp button{background:linear-gradient(#4b2a73,#2d1748);color:#f3e6ff;border:1.5px solid #9b6ad1;border-radius:18px;padding:7px 12px;font:14px Georgia;cursor:pointer;margin:2px}
#cp button.on,#cp button.primary{background:linear-gradient(#ffcf6a,#e0a030);color:#2a1440;font-weight:bold}
#cp input,#cp textarea,#cp select{background:#1e1033;color:#f3e6ff;border:1.5px solid #9b6ad1;border-radius:10px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;width:100%;margin:2px 0}
#cp .card{background:rgba(40,20,70,.85);border:1.5px solid #6b4a99;border-radius:14px;padding:10px 12px;margin:8px 0}
#cp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}
#cp .note{font-size:13px;color:#d8c8ee;line-height:1.45}#cp .tag{display:inline-block;background:#ffcf6a;color:#2a1440;border-radius:8px;padding:1px 7px;font-size:12px;font-weight:bold;margin:2px}
#cp .warn{background:rgba(120,30,60,.6);border:1.5px solid #e88aa8;border-radius:12px;padding:8px 10px;font-size:13px;margin:6px 0}
#cpMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#6b3fa0;color:#fff;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='cp';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='cpMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
function mail(subj,body){const u='mailto:'+OWNER+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);window.__opened=u;window.open(u,'_blank')}
const DISC=`<div class="warn"><b>18+ only. For entertainment purposes only.</b> Readings are not a substitute for medical, legal, financial or psychological advice, and no outcome is guaranteed or promised. Nothing here can predict the future with certainty. Your rights under the Australian Consumer Law (including refunds for services not provided with due care and skill) are not excluded. If you are in crisis, call Lifeline on 13 11 14 or 000 in an emergency.</div>`;
function gate(SK,next){let a=false;try{a=localStorage.getItem(SK+'18')==='1'}catch(e){}if(a)return next();
 R.innerHTML=`<h1>🔮 18+ only</h1>${DISC}<p>Please confirm you are 18 or older and understand readings are for entertainment only.</p><button class="primary" id="age">I am 18+ and I understand</button>`;
 document.getElementById('age').onclick=()=>{try{localStorage.setItem(SK+'18','1')}catch(e){}next()}}
const SK=D?'paDemo':'paSave';
let S;try{S=JSON.parse(localStorage.getItem(SK))||{}}catch(e){S={}}S.log=S.log||[];S.n=S.n||0;
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const MAJ=[['The Fool','new beginnings, spontaneity, a leap of faith','recklessness, hesitation'],['The Magician','skill, willpower, making things happen','scattered energy, untapped talent'],['The High Priestess','intuition, quiet knowing, mystery','secrets, ignoring your gut'],['The Empress','nurturing, creativity, abundance','creative block, over-giving'],['The Emperor','structure, stability, leadership','rigidity, control'],['The Hierophant','tradition, learning, guidance','rebellion, new paths'],['The Lovers','connection, choices, harmony','imbalance, misalignment'],['The Chariot','drive, focus, victory through effort','lack of direction'],['Strength','courage, patience, gentle power','self-doubt'],['The Hermit','reflection, solitude, inner wisdom','isolation'],['Wheel of Fortune','cycles, change, turning points','resisting change'],['Justice','fairness, truth, cause and effect','unfairness, avoidance'],['The Hanged Man','pause, new perspective, surrender','stalling'],['Death','endings that make room, transformation','fear of change'],['Temperance','balance, moderation, healing','excess'],['The Devil','attachments, temptation, shadow','release, breaking free'],['The Tower','sudden change, revelation','avoiding upheaval'],['The Star','hope, renewal, inspiration','discouragement'],['The Moon','dreams, uncertainty, imagination','confusion clearing'],['The Sun','joy, success, warmth','temporary clouds'],['Judgement','awakening, reckoning, a calling','self-criticism'],['The World','completion, wholeness, travel','unfinished business']];
const SUITS=[['Cups','emotions and relationships'],['Wands','passion and projects'],['Swords','thoughts and decisions'],['Pentacles','work, money and home']];
const RANKS=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
const RM=['a fresh start','a choice or partnership','growth and teamwork','rest and stability','a challenge or loss','sharing and recovery','patience and assessment','movement and effort','near completion','a full cycle','curiosity and messages','action and pursuit','mature care','mastery and authority'];
const DECK=[...MAJ.map(m=>({n:m[0],u:m[1],r:m[2]})),...SUITS.flatMap(s=>RANKS.map((k,i)=>({n:k+' of '+s[0],u:RM[i]+' in '+s[1],r:'blocked or delayed '+RM[i]+' in '+s[1]})))];
const BOTS=[{id:'nova',name:'Nova (AI)',style:'warm and gentle'},{id:'raven',name:'Raven (AI)',style:'direct and practical'},{id:'stella',name:'Stella (AI)',style:'dreamy and poetic'},{id:'atlas',name:'Atlas (AI)',style:'calm and wise'}];
const SPREADS=[{id:'one',name:'One card',pos:['Your message']},{id:'three',name:'Past · Present · Future',pos:['Past','Present','Future']},{id:'love',name:'Love (3)',pos:['You','Them','The connection']},{id:'five',name:'Career cross (5)',pos:['Now','Challenge','Advice','Hidden factor','Likely direction']}];
let bot=BOTS[0].id,spread='one',q='',last=null;
const OPEN={warm:['Take a breath with me.','Let\'s look at this kindly.'],direct:['Here\'s what the cards show.','Straight to it.'],dreamy:['The cards shimmer like moonlight…','A soft story unfolds…'],calm:['Let\'s be still and look.','Slowly, then.']};
function rnd(n){return Math.floor(Math.random()*n)}
function read(){const sp=SPREADS.find(s=>s.id===spread),b=BOTS.find(x=>x.id===bot),pool=DECK.slice(),cards=sp.pos.map(p=>{const c=pool.splice(rnd(pool.length),1)[0],rev=Math.random()<.3;return{p,n:c.n,rev,m:rev?c.r:c.u}});
 const o=OPEN[b.style.split(' ')[0]]||OPEN.calm;
 const txt=o[rnd(o.length)]+' '+cards.map(x=>`In "${x.p}" you drew ${x.n}${x.rev?' (reversed)':''}, which traditionally means ${x.m}.`).join(' ')+' Take what feels useful and leave the rest – this is a reflection prompt, not a prediction.';
 return{bot:b.name,spread:sp.name,q,cards,txt,t:new Date().toLocaleString('en-AU',{timeZone:'Australia/Sydney'})}}
function draw(){const DEMOSP=['one','three'];
 R.innerHTML=`<h1>🤖🔮 Coffeebreak Psychic Line – AI Readers</h1>
 <div class="warn"><b>These readers are AI, not people, and have no psychic ability.</b> Readings are generated on your device from traditional tarot card meanings and random draws. No internet AI, no live humans. Entertainment only.</div>${DISC}
 <div class="card"><h3>Choose an AI reader</h3>${BOTS.map(x=>`<button data-bot="${x.id}" class="${bot===x.id?'on':''}">${x.name} <small>· ${x.style}</small></button>`).join('')}<span class="tag">AI · entertainment only</span></div>
 <div class="card"><h3>Spread</h3>${SPREADS.map(s=>`<button data-sp="${s.id}" class="${spread===s.id?'on':''}">${s.name}${D&&!DEMOSP.includes(s.id)?' 🔒':''}</button>`).join('')}
 <input id="q" placeholder="Your question (optional)" value="${esc(q)}"><button class="primary" id="go">🃏 Draw my reading</button></div>
 ${last?`<div class="card"><h3>${esc(last.bot)} · ${esc(last.spread)}</h3><div class="grid">${last.cards.map(x=>`<div class="card"><b>${esc(x.p)}</b><br>🃏 ${esc(x.n)}${x.rev?' ↺':''}<p class="note">${esc(x.m)}</p></div>`).join('')}</div><p>${esc(last.txt)}</p><p class="note">🤖 AI-generated · for entertainment only · no outcome is guaranteed</p></div>`:''}
 ${S.log.length?`<div class="card"><h3>Reading journal</h3>${S.log.slice(0,8).map(l=>`<p class="note">${esc(l.t)} – ${esc(l.bot)} – ${esc(l.cards.map(c=>c.n).join(', '))}</p>`).join('')}</div>`:''}`;
 R.querySelectorAll('[data-bot]').forEach(b=>b.onclick=()=>{bot=b.dataset.bot;draw()});
 R.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{if(D&&!DEMOSP.includes(b.dataset.sp)){window.demoEnd&&window.demoEnd('Love and career spreads are in the full <b>Coffeebreak Psychic Line – AI Readers</b>.');return}spread=b.dataset.sp;draw()});
 document.getElementById('q').oninput=e=>q=e.target.value;
 document.getElementById('go').onclick=()=>{if(D&&S.n>=3){window.demoEnd&&window.demoEnd('Unlimited readings and the reading journal are in the full <b>Coffeebreak Psychic Line – AI Readers</b>.');return}last=read();S.n++;if(!D)S.log.unshift(last);save();draw()}}
window.CP={get S(){return S},draw,read,DECK};
save();gate(SK,draw);
})();
function update(){}function draw(){}
