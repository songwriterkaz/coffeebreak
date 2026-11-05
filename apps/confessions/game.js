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
// ===== Coffeebreak Confessions =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'cfxDemo':'cfxSave';const MAXSEND=D?3:1e9;
const st=document.createElement('style');st.textContent=`
#cf{flex:1;width:100%;max-width:1100px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#5a1f3a;background:#fff0f6}
body{background:#fff0f6!important}
#cf h1,#cf h2,#cf h3{color:#d6336c;margin:6px 0 8px}
#cf button{background:#ffd6e7;color:#5a1f3a;border:1px solid #f06595;border-radius:12px;padding:7px 12px;font:14px Georgia;cursor:pointer;margin:2px}
#cf button.on,#cf button.primary{background:#f06595;color:#fff;font-weight:bold}
#cf textarea,#cf input,#cf select{background:#fff;color:#5a1f3a;border:1px solid #f06595;border-radius:10px;padding:8px;font:15px Georgia;box-sizing:border-box;width:100%;margin:3px 0}
#cf .card{background:#fff;border:1px solid #fcc2d7;border-radius:16px;padding:12px;margin:8px 0;box-shadow:0 2px 8px #f0659522}
#cf .conf{border-radius:16px;padding:16px;margin:8px 0;font-size:17px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
#cf .note{font-size:13px;color:#8a4a66;line-height:1.45}
#cf .warn{background:#fff3bf;border:1px solid #f59f00;border-radius:12px;padding:10px;margin:8px 0}
#cf .help{background:#e7f5ff;border:2px solid #339af0;border-radius:12px;padding:12px;margin:8px 0;color:#1c3d5a}
#cf .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
#cf nav{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}
#cfMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#f06595;color:#fff;padding:8px 14px;border-radius:12px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='cf';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='cfMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2800)}
const MOODS=[['relief','😌 Relief'],['guilt','😔 Guilt'],['love','💗 Love'],['secret','🤫 Secret'],['funny','😂 Funny'],['regret','🥀 Regret'],['hope','🌈 Hope'],['grateful','🙏 Grateful']];
const STYLES=[['Blush','#ffe3ec','#ffc9de'],['Lavender','#f1e6ff','#dcc8ff'],['Mint','#e3fbef','#bff0d6'],['Peach','#fff0e3','#ffd6b8'],['Sky','#e6f3ff','#c4e1ff'],['Lemon','#fffbe0','#fff0a8'],['Lilac Rose','#fbe4f7','#f3c0ea'],['Cotton Candy','#ffe6f2','#d9ecff']];
const NSTY=D?3:STYLES.length;
const KEY='songwriterkaz@gmail.com';
let S;try{S=JSON.parse(localStorage.getItem(SK))||{}}catch(e){S={}}
S.q=S.q||[];S.wall=S.wall||[];S.sent=S.sent||0;S.cfg=S.cfg||{};S.hearts=S.hearts||{};
if(!S.seeded){S.seeded=1;[['funny','I have been saying "I\'m five minutes away" while still in the shower for eleven years.',0],['love','I still keep the coffee cup from our first date. The lid smells like nothing now, but I can\'t throw it out.',1],['hope','This year I finally started singing again. Badly. Happily.',6]].forEach((x,i)=>S.wall.push({id:'s'+i,mood:x[0],text:x[1],style:x[2],t:Date.now()-i*864e5,hearts:3+i*2,sample:1}))}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};save();
// ---- safety filters ----
const HARM=/\b(kill(ing)? myself|suicid\w*|end (it all|my life)|want(ed)? to die|self[- ]?harm\w*|cut(ting)? myself|hurt(ing)? myself|overdos\w*|no reason to live|better off dead|don'?t want to (be here|live))\b/i;
function doxx(t){const r=[];
 if(/(\+?\d[\d\s().-]{7,}\d)/.test(t))r.push('a phone number or long number');
 if(/[\w.+-]+@[\w-]+\.[\w.]+/.test(t))r.push('an email address');
 if(/(https?:\/\/|www\.|\b\w+\.(com|net|org|au|io)\b)/i.test(t))r.push('a link');
 if(/(^|\s)@\w{2,}/.test(t))r.push('a social media handle');
 if(/\b\d{1,5}\s+\w+(\s\w+)?\s(st|street|rd|road|ave|avenue|dr|drive|lane|ln|ct|court|pde|parade|cres|crescent|hwy|place|pl)\b/i.test(t))r.push('a street address');
 if(/\b(lives at|his address|her address|their address|works at|goes to school at|real name is|full name is|surname is|last name is)\b/i.test(t))r.push('identifying details about someone');
 // capitalised First Last pairs not at sentence start
 const s=t.replace(/(^|[.!?]\s+|\n)[A-Z]\w*/g,'$1x');
 if(/\b[A-Z][a-z]{1,}\s+[A-Z][a-z]{2,}\b/.test(s))r.push('what looks like a full name');
 return r}
function hash(s){let h=5381;for(const ch of 'cbcfx:'+s)h=((h*33)^ch.charCodeAt(0))>>>0;return h.toString(36)}
// ---- views ----
let view='write',mood='secret',sty=0,admin=false;
function nav(){return '<nav>'+[['write','✍️ Confess'],['wall','💗 Wall'],['admin','🔐 Karen\'s admin'],['about','ℹ️ Privacy']].map(([k,l])=>`<button class="${view==k?'on':''}" data-v="${k}">${l}</button>`).join('')+'</nav>'}
function confHTML(x,extra){const s=STYLES[x.style||0]||STYLES[0];const m=(MOODS.find(m=>m[0]==x.mood)||MOODS[3])[1];
 return `<div class="conf" style="background:linear-gradient(135deg,${s[1]},${s[2]})"><div class="note">${m}</div>${esc(x.text)}${extra||''}</div>`}
function render(){let h='<h1>💗 Coffeebreak Confessions</h1>'+nav();
 if(view=='write'){
  h+=`<div class="card"><p class="note">Write it down, let it go. No name, no email asked. Please don't name anyone or share details that could identify a person.</p>
  <textarea id="cfT" rows="6" maxlength="1200" placeholder="I've never told anyone that...">${esc(R.dataset.draft||'')}</textarea>
  <div class="note"><span id="cfN">0</span>/1200</div>
  <h3>Mood</h3>${MOODS.map(([k,l])=>`<button class="${mood==k?'on':''}" data-m="${k}">${l}</button>`).join('')}
  <h3>Card style</h3>${STYLES.map((s,i)=>`<button class="${sty==i?'on':''}" data-s="${i}" style="background:${s[1]};color:#5a1f3a;${sty==i?"outline:3px solid #d6336c;":""}" ${i>=NSTY?'disabled title="Full version"':''}>${s[0]}${i>=NSTY?' 🔒':''}</button>`).join('')}
  <div id="cfChk"></div><h3>Preview</h3><div id="cfPrev"></div>
  <button class="primary" id="cfSend">💌 Send anonymously to Karen</button>
  <p class="note">${S.cfg.mode&&S.cfg.mode!='email'?'✅ Sending through the anonymous web form. Your email address is <b>not</b> shared.':'⚠️ <b>Honest note:</b> this opens your own email app with the confession ready to send to Karen. Your email address <b>will be visible</b> to her when you send it. For true anonymity, the app owner can switch on the anonymous web form (Formspree or Supabase) in the admin settings.'}</p>
  ${D?`<p class="note">Free demo: ${Math.max(0,MAXSEND-S.sent)} of ${MAXSEND} confessions left, 3 card styles.</p>`:''}</div>`}
 if(view=='wall'){const w=S.wall.slice().sort((a,b)=>b.t-a.t);
  h+=`<p class="note">Approved confessions. Tap 💗 to send love. Names and personal details are never shown.</p><div class="grid">`+w.map(x=>`<div>${confHTML(x)}<button data-h="${x.id}">💗 ${x.hearts||0}</button><button data-x="${x.id}">🖼️ Save image</button></div>`).join('')+'</div>'}
 if(view=='admin'){
  if(!admin){h+=`<div class="card"><h3>🔐 Karen's admin</h3>${S.pin?'<p>Enter your PIN.</p>':'<p>First time: choose a 4–8 digit PIN.</p>'}<input id="cfPin" type="password" inputmode="numeric" maxlength="8"><button class="primary" id="cfPinGo">${S.pin?'Unlock':'Set PIN'}</button></div>`}
  else{h+=`<div class="card"><h3>📥 Pending confessions (${S.q.length})</h3><p class="note">Paste a confession from your email to add it here, or load from the web form below.</p>
   <textarea id="cfImp" rows="3" placeholder="Paste confession text from email"></textarea><select id="cfImpM">${MOODS.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><button id="cfImpGo">➕ Add to pending</button>${S.cfg.mode=='supabase'?'<button id="cfLoad">⬇️ Load from Supabase</button>':''}
   ${S.q.map(x=>{const d=doxx(x.text),hm=HARM.test(x.text);return confHTML(x,`${d.length?'<div class="warn">⚠️ May contain '+esc(d.join(', '))+'</div>':''}${hm?'<div class="help">💙 Mentions self-harm. Consider Lifeline 13 11 14 before posting.</div>':''}<div><button class="primary" data-ok="${x.id}">✅ Approve</button><button data-no="${x.id}">❌ Reject</button></div>`)}).join('')||'<p class="note">Nothing waiting. 💗</p>'}</div>
   <div class="card"><h3>⚙️ Anonymous sending (optional)</h3><p class="note">Email mode shows the sender's address. For true anonymity, create a free Formspree form (formspree.io, sends to ${KEY}) or a Supabase table <code>confessions(id uuid default gen_random_uuid(), text text, mood text, style int, created_at timestamptz default now())</code> with an insert-only policy for anon.</p>
   <select id="cfMode"><option value="email">Email (shows sender address)</option><option value="formspree">Formspree form</option><option value="supabase">Supabase</option></select>
   <input id="cfFs" placeholder="Formspree endpoint, e.g. S1-Ld16754" value="${esc(S.cfg.fs||'')}"><input id="cfSu" placeholder="Supabase Project URL" value="${esc(S.cfg.su||'')}"><input id="cfSk" placeholder="Supabase anon public key" value="${esc(S.cfg.sk||'')}">
   <button class="primary" id="cfCfg">Save settings</button><button id="cfLock">🔒 Lock admin</button><button id="cfRepin">Change PIN</button></div>
   <div class="card"><h3>🧱 Wall (${S.wall.length})</h3>${S.wall.map(x=>`<div class="note">${esc(x.text.slice(0,80))}… <button data-del="${x.id}">Remove</button></div>`).join('')}</div>`}}
 if(view=='about'){h+=`<div class="card"><h3>Privacy & safety</h3><p class="note">• No names or emails are collected by the app.<br>• Email mode opens your own mail app, so Karen will see your email address. Only the optional web form (if switched on) is truly anonymous.<br>• Confessions with names, phone numbers, emails, addresses, links or handles are blocked to protect people.<br>• Every confession is read and approved by Karen before it goes on the wall.<br>• The wall is saved on this device.</p><div class="help">💙 If you're struggling or thinking about hurting yourself, please reach out: <b>Lifeline 13 11 14</b> (24/7, call or text), lifeline.org.au. In an emergency call <b>000</b>.</div></div>`}
 R.innerHTML=h;wire()}
function check(){const t=(document.getElementById('cfT')||{}).value||'';R.dataset.draft=t;const n=document.getElementById('cfN');if(n)n.textContent=t.length;
 const d=doxx(t),hm=HARM.test(t);let h='';
 if(hm)h+='<div class="help">💙 It sounds like you might be going through something really hard. You don\'t have to carry it alone. Please call <b>Lifeline 13 11 14</b> (24/7) or text 0477 13 11 14. In an emergency call <b>000</b>.</div>';
 if(d.length)h+='<div class="warn">🚫 To protect people, please remove '+esc(d.join(', '))+'. Confessions can\'t name or identify anyone.</div>';
 const c1=document.getElementById('cfChk');if(c1)c1.innerHTML=h;const p=document.getElementById('cfPrev');if(p)p.innerHTML=confHTML({text:t||'Your confession will appear here…',mood,style:sty});return {t,d,hm}}
async function send(){const {t,d}=check();if(t.trim().length<5)return say('Write a little more first 💗');if(d.length)return say('Please remove personal details first');
 if(S.sent>=MAXSEND)return window.demoEnd&&demoEnd('You\'ve sent your 3 free demo confessions. Get the full version for unlimited confessions and every card style.');
 const x={id:'c'+Date.now().toString(36),text:t.trim(),mood,style:sty,t:Date.now()};const m=S.cfg.mode||'email';
 try{if(m=='formspree'&&S.cfg.fs){const r=await fetch(S.cfg.fs,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({mood,style:STYLES[sty][0],confession:x.text})});if(!r.ok)throw 0}
  else if(m=='supabase'&&S.cfg.su){const r=await fetch(S.cfg.su.replace(/\/$/,'')+'/rest/v1/confessions',{method:'POST',headers:{apikey:S.cfg.sk,Authorization:'Bearer '+S.cfg.sk,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({text:x.text,mood,style:sty})});if(!r.ok)throw 0}
  else{const a=document.createElement('a');a.href='mailto:'+KEY+'?subject='+encodeURIComponent('Anonymous confession ('+mood+')')+'&body='+encodeURIComponent(x.text+'\n\nMood: '+mood+' | Card: '+STYLES[sty][0]+'\n— sent from Coffeebreak Confessions');a.target='_blank';a.click()}}
 catch(e){return say('Could not send. Check your connection.')}
 S.sent++;S.q.push(x);save();R.dataset.draft='';say(m=='email'?'Your mail app is opening. Press send 💌':'Sent anonymously 💌');render()}
function exportImg(x){const cv=document.createElement('canvas');cv.width=1080;cv.height=1080;const g=cv.getContext('2d');const s=STYLES[x.style||0];const gr=g.createLinearGradient(0,0,1080,1080);gr.addColorStop(0,s[1]);gr.addColorStop(1,s[2]);g.fillStyle=gr;g.fillRect(0,0,1080,1080);
 g.fillStyle='#d6336c';g.font='bold 54px Georgia';g.textAlign='center';g.fillText('💗 Confession',540,130);g.font='34px Georgia';g.fillText((MOODS.find(m=>m[0]==x.mood)||MOODS[3])[1],540,190);
 g.fillStyle='#5a1f3a';g.font='40px Georgia';const words=x.text.split(/\s+/);let line='',y=300;const L=[];for(const w of words){if(g.measureText(line+w).width>900){L.push(line);line=''}line+=w+' '}L.push(line);
 const lh=Math.min(56,620/L.length);g.font=Math.min(40,lh*.75)+'px Georgia';L.forEach(l=>{g.fillText(l.trim(),540,y);y+=lh});
 g.font='28px Georgia';g.fillStyle='#d6336c';g.fillText('Coffeebreak Confessions · coffeebreaks.itch.io',540,1030);
 const a=document.createElement('a');a.download='confession.png';a.href=cv.toDataURL('image/png');a.click();say('Image saved 🖼️')}
function wire(){R.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{view=b.dataset.v;render()});
 R.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mood=b.dataset.m;render()});
 R.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{sty=+b.dataset.s;render()});
 const T=document.getElementById('cfT');if(T){T.oninput=check;check()}
 const on=(id,f)=>{const e=document.getElementById(id);if(e)e.onclick=f};
 on('cfSend',send);
 R.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const x=S.wall.find(w=>w.id==b.dataset.h);if(!x)return;if(S.hearts[x.id]){x.hearts--;delete S.hearts[x.id]}else{x.hearts=(x.hearts||0)+1;S.hearts[x.id]=1}save();render()});
 R.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>exportImg(S.wall.find(w=>w.id==b.dataset.x)));
 on('cfPinGo',()=>{const p=document.getElementById('cfPin').value;if(!/^\d{4,8}$/.test(p))return say('PIN must be 4–8 digits');if(!S.pin){S.pin=hash(p);save();admin=true;say('PIN set 🔐')}else if(hash(p)==S.pin)admin=true;else return say('Wrong PIN');render()});
 on('cfLock',()=>{admin=false;render()});on('cfRepin',()=>{delete S.pin;save();admin=false;render()});
 R.querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>{const i=S.q.findIndex(x=>x.id==b.dataset.ok);if(i<0)return;const x=S.q.splice(i,1)[0];x.hearts=0;x.t=Date.now();S.wall.push(x);save();say('Approved and on the wall 💗');render()});
 R.querySelectorAll('[data-no]').forEach(b=>b.onclick=()=>{S.rej=(S.rej||[]).concat(b.dataset.no);S.q=S.q.filter(x=>x.id!=b.dataset.no);save();say('Rejected');render()});
 R.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.wall=S.wall.filter(x=>x.id!=b.dataset.del);save();render()});
 on('cfImpGo',()=>{const t=document.getElementById('cfImp').value.trim();if(!t)return;S.q.push({id:'i'+Date.now().toString(36),text:t,mood:document.getElementById('cfImpM').value,style:0,t:Date.now()});save();render()});
 const md=document.getElementById('cfMode');if(md)md.value=S.cfg.mode||'email';
 on('cfCfg',()=>{S.cfg={mode:md.value,fs:document.getElementById('cfFs').value.trim(),su:document.getElementById('cfSu').value.trim(),sk:document.getElementById('cfSk').value.trim()};save();say('Settings saved');render()});
 on('cfLoad',async()=>{try{const r=await fetch(S.cfg.su.replace(/\/$/,'')+'/rest/v1/confessions?select=*&order=created_at.desc&limit=100',{headers:{apikey:S.cfg.sk,Authorization:'Bearer '+S.cfg.sk}});const rows=await r.json();let n=0;rows.forEach(x=>{const id='sb'+x.id;if(!S.q.some(q=>q.id==id)&&!S.wall.some(q=>q.id==id)&&!(S.rej||[]).includes(id)){S.q.push({id,text:x.text,mood:x.mood,style:x.style||0,t:Date.parse(x.created_at)});n++}});save();say(n+' new loaded');render()}catch(e){say('Could not load from Supabase')}});
}
G.state='play';render();
})();
