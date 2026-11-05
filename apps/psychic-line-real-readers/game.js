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
// ===== Coffeebreak Psychic Line - Real Readers =====
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
const SK=D?'prDemo':'prSave';
let S;try{S=JSON.parse(localStorage.getItem(SK))||{}}catch(e){S={}}S.b=S.b||{name:'',email:'',phone:'',date:'',time:'',mode:'Phone',type:'Tarot',reader:'',plan:'session',mins:15,q:''};S.sent=S.sent||0;
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const READERS=[
 {id:'r1',name:'Example Reader: "Luna"',sp:'Tarot, love & relationships',modes:'Phone, Video, Chat',pm:3.50,ps:45},
 {id:'r2',name:'Example Reader: "Orion"',sp:'Astrology & birth charts',modes:'Video, Chat',pm:3.00,ps:55},
 {id:'r3',name:'Example Reader: "Sage"',sp:'Oracle cards & intuition',modes:'Phone, Chat',pm:2.80,ps:40},
 {id:'r4',name:'Example Reader: "Willow"',sp:'Angel cards & energy',modes:'Phone, Video',pm:3.20,ps:50},
 {id:'r5',name:'Example Reader: "Ember"',sp:'Numerology & life path',modes:'Chat, Video',pm:2.50,ps:35},
 {id:'r6',name:'Example Reader: "Indigo"',sp:'Palm photos & tea leaves',modes:'Video',pm:3.00,ps:45}];
const LIST=D?READERS.slice(0,2):READERS;
let tab='readers',ppDone=false;
const rd=()=>READERS.find(r=>r.id===S.b.reader)||LIST[0];
function price(){const r=rd();return S.b.plan==='minute'?r.pm*Math.max(5,+S.b.mins||5):r.ps}
function summary(id){const b=S.b,r=rd();return `Coffeebreak Psychic Line - booking request${id?' (PayPal TEST '+id+')':''}
Reader: ${r.name}
Date: ${b.date}  Time: ${b.time} (Sydney time)
Format: ${b.mode}   Reading type: ${b.type}
Pricing: ${b.plan==='minute'?('per minute, '+b.mins+' min @ $'+r.pm.toFixed(2)):'per session'}  Total: $${price().toFixed(2)} AUD
Client: ${b.name}  Email: ${b.email}  Phone: ${b.phone}
Question/notes: ${b.q}
Client confirmed 18+ and that readings are for entertainment only.`}
function loadPP(){const box=document.getElementById('ppBox');if(!box)return;if(D){box.innerHTML='<p class="note">PayPal checkout is in the full version.</p>';return}
 box.innerHTML='<div id="paypal-buttons"></div><p class="note" id="ppStatus">PayPal TEST mode (sandbox) – no real money.</p>';
 const go=()=>{try{window.paypal.Buttons({createOrder:(x,a)=>a.order.create({purchase_units:[{amount:{value:price().toFixed(2),currency_code:'AUD'},description:'Psychic reading booking (TEST)'}]}),onApprove:(x,a)=>a.order.capture().then(o=>{document.getElementById('ppStatus').textContent='Sandbox payment complete: '+o.id;mail('Psychic booking '+o.id,summary(o.id))}),onError:()=>{document.getElementById('ppStatus').textContent='PayPal error – use “Email booking request”.'}}).render('#paypal-buttons')}catch(e){}};
 if(window.paypal){go();return}if(ppDone)return;ppDone=true;const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PP_CLIENT_ID)+'&currency=AUD';s.onload=go;s.onerror=()=>{ppDone=false;const t=document.getElementById('ppStatus');if(t)t.textContent='PayPal could not load (offline?) – use “Email booking request”.'};document.head.appendChild(s)}
const HONEST=`<p class="note"><b>How it works, honestly:</b> there is no live calling inside this app. You send a booking request, Karen confirms it with the reader, and the reader contacts you themselves by phone, video or chat at the booked time. Every listed reader must hold the <b>Coffeebreak Verified Psychic</b> badge (a Coffeebreak course badge, not a government licence – Australia has no psychic licence). The profiles shown now are <b>examples</b>, not real people. Payments are in PayPal TEST mode for now.</p>`;
function draw(){
 const tabs=[['readers','🔮 Readers'],['book','📅 Book'],['apply','✨ Become a reader'],['about','ℹ️ Terms']];
 let h=`<h1>📞 Coffeebreak Psychic Line – Real Readers</h1><div>${tabs.map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>`;
 if(tab==='readers'){h+=DISC+HONEST+`<div class="grid">${LIST.map(r=>`<div class="card"><h3>${esc(r.name)}</h3><span class="tag">example reader – apply to join</span><span class="tag">✔ Verified badge required</span><p class="note">${esc(r.sp)}<br>Formats: ${r.modes}<br>$${r.pm.toFixed(2)}/min or $${r.ps} per 30-min session</p><button class="primary" data-book="${r.id}">Request a booking</button></div>`).join('')}</div>`+(D?`<p class="note">Demo shows 2 example readers. <button data-more="1">See all readers</button></p>`:'')}
 if(tab==='book'){const b=S.b,r=rd();h+=`<div class="card"><h3>Booking request</h3>
 <label>Reader</label><select id="f_reader">${LIST.map(x=>`<option value="${x.id}" ${x.id===r.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
 <label>Date</label><input id="f_date" type="date" value="${esc(b.date)}"><label>Time (Sydney)</label><input id="f_time" type="time" value="${esc(b.time)}">
 <div>Format: ${['Phone','Video','Chat'].map(m=>`<button data-mode="${m}" class="${b.mode===m?'on':''}">${m}</button>`).join('')}</div>
 <div>Reading: ${['Tarot','Astrology','Oracle','Numerology','Love','Career','General'].map(m=>`<button data-type="${m}" class="${b.type===m?'on':''}">${m}</button>`).join('')}</div>
 <div>Pricing: <button data-plan="session" class="${b.plan==='session'?'on':''}">Per session ($${r.ps})</button><button data-plan="minute" class="${b.plan==='minute'?'on':''}">Per minute ($${r.pm.toFixed(2)})</button> ${b.plan==='minute'?`<input id="f_mins" type="number" min="5" max="120" value="${b.mins}" style="width:90px"> minutes`:''}</div>
 <p><b>Total: $${price().toFixed(2)} AUD</b></p>
 <input id="f_name" placeholder="Your name" value="${esc(b.name)}"><input id="f_email" placeholder="Email" value="${esc(b.email)}"><input id="f_phone" placeholder="Phone (the reader will call or message you)" value="${esc(b.phone)}"><textarea id="f_q" placeholder="Your question (optional)">${esc(b.q)}</textarea>
 ${DISC}<button class="primary" id="cpBook">✉️ Email booking request</button><div id="ppBox"></div></div>`+HONEST}
 if(tab==='apply')h+=`<div class="card"><h3>✨ Apply to become a Coffeebreak reader</h3><p class="note">You must be 18+ and hold the <b>Coffeebreak Verified Psychic</b> badge (from the Coffeebreak Psychic course), or apply for it at the same time. Karen approves or rejects every application. Readers are independent and contact clients themselves.</p>
 <input id="a_name" placeholder="Name / reader name"><input id="a_email" placeholder="Email"><input id="a_phone" placeholder="Phone"><input id="a_badge" placeholder="Coffeebreak Verified ID (if you have one)"><input id="a_spec" placeholder="Specialties (tarot, astrology…)"><input id="a_fmt" placeholder="Formats (phone, video, chat)"><input id="a_rate" placeholder="Your rate per minute / per session"><textarea id="a_bio" placeholder="Short bio and experience"></textarea>
 <label><input type="checkbox" id="a_ok" style="width:auto"> I am 18+, I will not promise guaranteed outcomes, and I will follow the Australian Consumer Law.</label><br><button class="primary" id="cpApply">✉️ Send application</button></div>`;
 if(tab==='about')h+=DISC+HONEST+`<p class="note">Bookings are requests until confirmed. Refunds are handled under the Australian Consumer Law. Readers must not give medical, legal or financial advice or claim guaranteed results.</p>`;
 R.innerHTML=h;
 R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;draw()});
 R.querySelectorAll('[data-more]').forEach(b=>b.onclick=()=>window.demoEnd&&window.demoEnd('Every reader, per-minute pricing and PayPal checkout are in the full <b>Coffeebreak Psychic Line – Real Readers</b>.'));
 R.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>{S.b.reader=b.dataset.book;save();tab='book';draw()});
 R.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{S.b.mode=b.dataset.mode;save();draw()});
 R.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{S.b.type=b.dataset.type;save();draw()});
 R.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{if(D&&b.dataset.plan==='minute'){window.demoEnd&&window.demoEnd('Per-minute pricing and PayPal checkout are in the full <b>Coffeebreak Psychic Line – Real Readers</b>.');return}S.b.plan=b.dataset.plan;save();draw()});
 const f=document.getElementById('f_reader');if(f){f.onchange=()=>{S.b.reader=f.value;save();draw()};
  ['date','time','name','email','phone','q','mins'].forEach(k=>{const el=document.getElementById('f_'+k);if(el)el.oninput=()=>{S.b[k]=el.value;save();if(k==='mins')el.onchange=draw}});
  document.getElementById('cpBook').onclick=()=>{const b=S.b;if(!b.name||!b.email||!b.date||!b.time){say('Add your name, email, date and time');return}if(D&&S.sent>=1){window.demoEnd&&window.demoEnd('Send unlimited bookings in the full <b>Coffeebreak Psychic Line – Real Readers</b>.');return}S.sent++;save();mail('Psychic booking request – '+b.name,summary());say('Opening your email app…')};loadPP()}
 const ap=document.getElementById('cpApply');if(ap)ap.onclick=()=>{const v=k=>document.getElementById('a_'+k).value;if(!v('name')||!v('email')){say('Add your name and email');return}if(!document.getElementById('a_ok').checked){say('Please tick the 18+ / terms box');return}
  mail('Reader application – '+v('name'),`Coffeebreak Psychic Line – reader application\nName: ${v('name')}\nEmail: ${v('email')}\nPhone: ${v('phone')}\nVerified ID: ${v('badge')||'none yet'}\nSpecialties: ${v('spec')}\nFormats: ${v('fmt')}\nRates: ${v('rate')}\nBio: ${v('bio')}\nConfirmed 18+, no guaranteed outcomes, ACL.`);say('Opening your email app…')};
}
window.CP={get S(){return S},draw,summary,price,set tab(t){tab=t}};
save();gate(SK,draw);
})();
function update(){}function draw(){}
