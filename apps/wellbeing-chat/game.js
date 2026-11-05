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
// ===== Coffeebreak Wellbeing Chat =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const PP_CLIENT_ID='AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-';
const OWNER='songwriterkaz@gmail.com';
const st=document.createElement('style');st.textContent=`
#wb{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Verdana,sans-serif;color:#24323a;background:linear-gradient(#e9f6f1,#f8efe6);border-radius:16px}
#wb h1{color:#2f6d5e;margin:6px 0}#wb h3{color:#3d7f6e;margin:6px 0}
#wb button{background:#fff;color:#2f6d5e;border:1.5px solid #7fb8a6;border-radius:16px;padding:7px 12px;font:14px Verdana;cursor:pointer;margin:2px}
#wb button.on,#wb button.primary{background:#3d8f78;color:#fff}
#wb input,#wb textarea,#wb select{border:1.5px solid #7fb8a6;border-radius:10px;padding:6px 8px;font:14px Verdana;box-sizing:border-box;width:100%;margin:2px 0}
#wb .card{background:#fff;border:1.5px solid #cfe6dd;border-radius:14px;padding:10px 12px;margin:8px 0}
#wb .note{font-size:13px;color:#4a5a60;line-height:1.45}
#wb .ban{position:sticky;top:0;z-index:5;background:#2f6d5e;color:#fff;font-weight:bold;padding:8px 10px;border-radius:10px;text-align:center}
#wb .crisis{background:#ffe3e3;border:2px solid #d33;border-radius:12px;padding:10px;margin:8px 0;color:#7a1010}
#wb .msg{padding:7px 10px;border-radius:12px;margin:4px 0;max-width:85%}#wb .me{background:#d8efe7;margin-left:auto}#wb .ai{background:#f3ece4}
#wb .log{max-height:340px;overflow:auto;display:flex;flex-direction:column}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='wb';c.parentNode.insertBefore(R,c.nextSibling);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function mail(subj,body){const u='mailto:'+OWNER+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);window.__opened=u;window.open(u,'_blank')}
const BAN='<div class="ban" id="banner">AI wellbeing support, not counselling or therapy, not for emergencies</div>';
const CRISIS=`<div class="crisis" id="crisisBox"><b>If you're in danger or thinking about hurting yourself, please reach out now:</b><br>📞 <b>000</b> – emergency<br>📞 <b>Lifeline 13 11 14</b> (24/7)<br>📞 <b>Beyond Blue 1300 22 4636</b><br>📞 <b>Kids Helpline 1800 55 1800</b> (ages 5–25)<br><span class="note">This app is AI and can't help in a crisis. A real person at these services can.</span></div>`;
const CW=/suicid|kill (my|me)self|end (my|it all)|want to die|wanna die|self.?harm|hurt(ing)? myself|cut(ting)? myself|overdose|no reason to live|better off dead|can'?t go on|take my (own )?life|not safe|abuse[ds]?|being hurt/i;
const SK=D?'wbDemo':'wbSave';
let S;try{S=JSON.parse(localStorage.getItem(SK))||{}}catch(e){S={}}S.chat=S.chat||[];S.mood=S.mood||[];S.jr=S.jr||[];S.n=S.n||0;
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const BOTS=[{id:'wren',name:'Wren (AI)',v:'soft and gentle'},{id:'juniper',name:'Juniper (AI)',v:'calm and grounding'},{id:'marlo',name:'Marlo (AI)',v:'upbeat and practical'},{id:'sage',name:'Sagey (AI)',v:'thoughtful and reflective'}];
const DEMOB=['wren','juniper'];
const TOOLS={breath:'Let\'s try box breathing: breathe in for 4, hold for 4, out for 4, hold for 4. Repeat 4 times. Slow out-breaths can help your body settle.',ground:'Try 5-4-3-2-1 grounding: name 5 things you can see, 4 you can feel, 3 you can hear, 2 you can smell and 1 you can taste.',journal:'A journaling prompt: "What’s weighing on me most right now, and what’s one small thing that’s in my control?" Write for 5 minutes without editing.',reframe:'Let\'s gently check the thought. What\'s the evidence for it, and against it? What would you say to a friend who thought this? Is there a kinder, more balanced way to put it?',move:'Small actions can lift mood a little: a 10-minute walk, a glass of water, stepping outside, or texting someone you trust.'};
const RULES=[[/anx|panic|nervous|worr|stress/i,['That sounds really stressful. Thank you for sharing it.',TOOLS.breath]],[/sad|down|low|cry|lonely|alone/i,['I\'m sorry you\'re feeling low. Those feelings are valid.',TOOLS.move+' Talking to someone you trust, or your GP, can help too.']],[/overwhelm|too much|can'?t cope|spiral/i,['It sounds like a lot at once.',TOOLS.ground]],[/fail|stupid|useless|hate myself|not good enough/i,['That\'s a harsh thing to carry.',TOOLS.reframe]],[/sleep|tired|insomnia/i,['Rest matters.','Some people find a steady bedtime, less screen time before bed and a wind-down routine helpful. If sleep problems keep going, a GP is the right person to talk to.']],[/angry|mad|frustrat/i,['Anger often tells us something matters to us.',TOOLS.breath+' Then maybe write down what you need.']]];
const OPEN={wren:'I hear you. ',juniper:'Let\'s slow down together. ',marlo:'Okay, let\'s tackle this. ',sage:'That\'s worth sitting with. '};
const DOC=/diagnos|do i have|medicat|pill|dose|prescri|disorder|adhd|bipolar|are you (a )?(therapist|counsellor|doctor|human|real)/i;
function reply(t,b){if(CW.test(t))return{crisis:1,txt:'I\'m really glad you told me. I\'m an AI and I can\'t keep you safe, but people can, right now. Please call 000 if you\'re in danger, or Lifeline on 13 11 14. Beyond Blue (1300 22 4636) and Kids Helpline (1800 55 1800) are there too.'};
 if(DOC.test(t))return{txt:'I\'m an AI support companion, not a counsellor, therapist or doctor, so I can\'t diagnose anything or give medical or medication advice. A GP can help with that and can refer you to a psychologist. I\'m happy to try a breathing or grounding exercise with you meanwhile.'};
 for(const [re,a] of RULES)if(re.test(t))return{txt:OPEN[b]+a.join(' ')};
 if(/breath/i.test(t))return{txt:TOOLS.breath};if(/ground/i.test(t))return{txt:TOOLS.ground};if(/journal/i.test(t))return{txt:TOOLS.journal};
 return{txt:OPEN[b]+'Tell me a bit more about what\'s going on? You could also try one of the tools below – breathing, grounding, a journaling prompt or mood check-in.'}}
let tab='chat',bot='wren',crisis=false,ppDone=false;
function gate(next){let a=false;try{a=localStorage.getItem(SK+'age')==='1'}catch(e){}if(a)return next();
 R.innerHTML=BAN+`<h1>🌿 Coffeebreak Wellbeing Chat</h1><div class="card"><p>This app is for <b>18+</b>, or <b>16–17 with a parent or guardian's consent</b>. Everything you type stays on this device only.</p><button class="primary" id="a18">I'm 18 or older</button><button id="a16">I'm 16–17 and my parent/guardian consents</button><p class="note">Under 16? Kids Helpline is free and 24/7: 1800 55 1800.</p></div>`+CRISIS;
 const ok=()=>{try{localStorage.setItem(SK+'age','1')}catch(e){}next()};document.getElementById('a18').onclick=ok;document.getElementById('a16').onclick=ok}
function chatView(){return `<div class="card"><h3>Choose an AI companion</h3>${BOTS.map(x=>`<button data-bot="${x.id}" class="${bot===x.id?'on':''}">${x.name} <small>· ${x.v}</small>${D&&!DEMOB.includes(x.id)?' 🔒':''}</button>`).join('')}
 <p class="note">🤖 Companions are AI, not people. They run offline on your device with pre-written self-help ideas (breathing, grounding, journaling, reframing). They can't diagnose, give medical advice, or replace a counsellor, therapist or GP.</p></div>
 ${crisis?CRISIS:''}<div class="card"><div class="log" id="log">${S.chat.slice(-30).map(m=>`<div class="msg ${m.me?'me':'ai'}">${m.me?'':'<b>'+esc(m.b)+':</b> '}${esc(m.t)}</div>`).join('')}</div>
 <textarea id="in" rows="2" placeholder="How are you feeling?"></textarea><button class="primary" id="send">Send</button>
 ${Object.keys(TOOLS).map(k=>`<button data-tool="${k}">${{breath:'🌬️ Breathing',ground:'🖐️ Grounding',journal:'📓 Journal prompt',reframe:'💭 Reframe',move:'🚶 Small step'}[k]}</button>`).join('')}<button id="clr">Clear chat</button></div>`}
function moodView(){return `<div class="card"><h3>Mood check-in</h3>${['😞','🙁','😐','🙂','😄'].map((e,i)=>`<button data-mood="${i+1}">${e}</button>`).join('')}<input id="mn" placeholder="Note (optional)"><div>${S.mood.slice(0,14).map(m=>`<p class="note">${esc(m.t)} – ${['😞','🙁','😐','🙂','😄'][m.v-1]} ${esc(m.n)}</p>`).join('')}</div></div>
 <div class="card"><h3>Journal</h3><p class="note">${esc(TOOLS.journal)}</p><textarea id="jt" rows="4"></textarea><button class="primary" id="js">Save entry</button>${S.jr.slice(0,10).map(j=>`<p class="note"><b>${esc(j.t)}</b> ${esc(j.x)}</p>`).join('')}</div>`}
function karenView(){return `<div class="card"><h3>👩 Book a session with Karen (human)</h3>
 <p><b>Karen O'Brien</b> – community services worker<br>Qualification: <b>Diploma of Community Services</b></p>
 <p class="note">Karen offers <b>support and wellbeing sessions</b> as a community services worker: a caring person to talk things through with, practical wellbeing support and help finding other services. Karen is a real person, not AI. She is <b>not</b> a registered counsellor, psychologist or therapist, isn't registered with ACA or PACFA, and sessions don't diagnose or treat mental health conditions. Not for emergencies – call 000 or Lifeline 13 11 14.</p>
 <label>Name</label><input id="bN"><label>Email</label><input id="bE"><label>Date</label><input id="bD" type="date"><label>Time (Sydney)</label><input id="bT" type="time">
 <label>Format</label><select id="bF"><option>Phone</option><option>Video</option><option>Chat</option></select><label>What would you like support with? (optional)</label><textarea id="bW" rows="2"></textarea>
 <label><input type="checkbox" id="b18" style="width:auto"> I'm 18+ (or 16–17 with parent/guardian consent)</label>
 <p><b>Suggested price: $60 AUD for 50 minutes</b> <span class="note">(a suggestion only – Karen confirms the final price with you)</span></p>
 <button class="primary" id="bGo">📧 Send booking request</button><p class="note">Your request opens in your email app, addressed to Karen. She'll reply to confirm.</p>
 ${D?'<p class="note">🔒 Session payment by PayPal is in the full version.</p>':'<div id="paypal-buttons"></div><p class="note" id="ppStatus">PayPal TEST mode (sandbox) – no real money yet.</p>'}</div>`}
function draw(){R.innerHTML=BAN+`<h1>🌿 Coffeebreak Wellbeing Chat</h1><div>${[['chat','💬 AI chat'],['mood','📈 Mood & journal'],['karen','👩 Book Karen'],['help','☎️ Get help now']].map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>`+
 (tab==='chat'?chatView():tab==='mood'?moodView():tab==='karen'?karenView():CRISIS+'<p class="note">13YARN (Aboriginal & Torres Strait Islander crisis support): 13 92 76 · Your GP can make a Mental Health Treatment Plan.</p>');
 R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;draw()});
 R.querySelectorAll('[data-bot]').forEach(b=>b.onclick=()=>{if(D&&!DEMOB.includes(b.dataset.bot)){window.demoEnd&&window.demoEnd('All four AI companions are in the full <b>Coffeebreak Wellbeing Chat</b>.');return}bot=b.dataset.bot;draw()});
 const bx=BOTS.find(x=>x.id===bot);
 const push=(t)=>{if(D&&S.n>=8&&!CW.test(t)){window.demoEnd&&window.demoEnd('Unlimited chat, mood history and journal are in the full <b>Coffeebreak Wellbeing Chat</b>.');return}S.chat.push({me:1,t});const r=reply(t,bot);if(r.crisis)crisis=true;S.chat.push({b:bx.name,t:r.txt});S.n++;save();draw();const l=document.getElementById('log');if(l)l.scrollTop=1e6};
 const sn=document.getElementById('send');if(sn){sn.onclick=()=>{const t=document.getElementById('in').value.trim();if(t)push(t)};
  document.getElementById('in').oninput=e=>{if(CW.test(e.target.value)&&!crisis){crisis=true;const v=e.target.value;draw();const i=document.getElementById('in');i.value=v;i.focus()}};
  R.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{S.chat.push({b:bx.name,t:TOOLS[b.dataset.tool]});save();draw()});
  document.getElementById('clr').onclick=()=>{S.chat=[];crisis=false;save();draw()}}
 R.querySelectorAll('[data-mood]').forEach(b=>b.onclick=()=>{S.mood.unshift({v:+b.dataset.mood,n:document.getElementById('mn').value,t:new Date().toLocaleString('en-AU',{timeZone:'Australia/Sydney'})});if(D)S.mood=S.mood.slice(0,3);save();draw()});
 const js=document.getElementById('js');if(js)js.onclick=()=>{const x=document.getElementById('jt').value.trim();if(!x)return;if(D&&S.jr.length>=1){window.demoEnd&&window.demoEnd('Unlimited journal entries are in the full <b>Coffeebreak Wellbeing Chat</b>.');return}S.jr.unshift({x,t:new Date().toLocaleDateString('en-AU',{timeZone:'Australia/Sydney'})});save();draw()};
 const bg=document.getElementById('bGo');if(bg){bg.onclick=()=>{const v=id=>document.getElementById(id).value;if(!v('bN')||!v('bE')||!v('bD')||!v('bT')){alert('Please fill in name, email, date and time.');return}if(!document.getElementById('b18').checked){alert('Please confirm your age.');return}
  mail('Wellbeing session request – '+v('bN'),`Name: ${v('bN')}\nEmail: ${v('bE')}\nDate: ${v('bD')}\nTime (Sydney): ${v('bT')}\nFormat: ${v('bF')}\nSupport with: ${v('bW')}\nSuggested price: $60 AUD / 50 min (to be confirmed)\nPayment: ${ppDone?'PayPal sandbox paid':'not yet paid'}`)};
  if(!D)loadPP()}}
function loadPP(){const go=()=>{try{paypal.Buttons({createOrder:(x,a)=>a.order.create({purchase_units:[{amount:{value:'60.00',currency_code:'AUD'},description:'Support and wellbeing session with Karen (TEST)'}]}),onApprove:(x,a)=>a.order.capture().then(o=>{ppDone=true;document.getElementById('ppStatus').textContent='Sandbox payment complete: '+o.id})}).render('#paypal-buttons')}catch(e){}};
 if(window.paypal){go();return}const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PP_CLIENT_ID)+'&currency=AUD';s.onload=go;s.onerror=()=>{const p=document.getElementById('ppStatus');if(p)p.textContent='PayPal unavailable offline – Karen will send a payment link.'};document.head.appendChild(s)}
window.WB={get S(){return S},reply,CW,draw};
save();gate(draw);
})();
function update(){}function draw(){}
