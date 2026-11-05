'use strict';
/* Coffeebreak One Button WiFi Phone: one giant button. Tap to call, tap to hang up, hold to walkie talk, tap to answer. */
(function(){if(typeof startPeer!=='function')return;
const O=s=>document.querySelector(s),K={g:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('cbob_'+k));return v==null?d:v}catch(e){return d}},s:(k,v)=>{try{localStorage.setItem('cbob_'+k,JSON.stringify(v))}catch(e){}}};
try{localStorage.setItem('cbx_wkon','true')}catch(e){}
const css=document.createElement('style');css.textContent=`
#ob{position:fixed;inset:0;z-index:60;background:radial-gradient(circle at 50% 35%,#fff8ef,#f3dcc6);display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:14px 12px 10px;font-family:inherit;color:#3b2417;text-align:center;overflow:auto;-webkit-user-select:none;user-select:none}
#ob.hide{display:none}#obmore{position:absolute;top:10px;right:12px;font-size:15px;background:#fff;border:2px solid #3b2417;border-radius:18px;padding:6px 14px;color:#3b2417}
#obwho{font-size:26px;font-weight:800;margin-top:28px}#obst{font-size:44px;font-weight:900;letter-spacing:1px;margin:6px 0}
#obbtn{width:min(78vw,62vh,420px);height:min(78vw,62vh,420px);border-radius:50%;border:10px solid #3b2417;background:#ffd6e0 center/70% no-repeat url(logo.png);box-shadow:0 12px 30px rgba(59,36,23,.35);touch-action:none;transition:transform .1s,background-color .2s;cursor:pointer;flex:none}
#obbtn:active{transform:scale(.96)}#ob.calling #obbtn{background-color:#ffe082;animation:obp 1s infinite}#ob.talking #obbtn{background-color:#a5d6a7}#ob.walkie #obbtn{background-color:#ef9a9a}#ob.incoming #obbtn{background-color:#90caf9;animation:obp .6s infinite}
@keyframes obp{50%{transform:scale(1.05)}}
#obhint{font-size:19px;margin:8px 0}#obx{display:flex;gap:14px;justify-content:center;margin:6px 0}
.obx{width:84px;height:84px;border-radius:50%;border:5px solid #3b2417;background:#fff center/cover no-repeat;font-size:30px;font-weight:800;display:flex;align-items:center;justify-content:center;color:#3b2417}
.obxl{font-size:13px;font-weight:700;margin-top:2px;max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#obnote{font-size:12px;opacity:.85;max-width:460px}#obset{position:fixed;inset:0;z-index:61;background:#fff8ef;overflow:auto;padding:18px;text-align:center;color:#3b2417}
#obset button.big{font-size:22px;padding:14px 18px;border-radius:16px;border:3px solid #3b2417;background:#ffd6e0;margin:6px;min-width:70%}
.obpick{display:flex;align-items:center;gap:12px;font-size:20px;padding:10px;border:2px solid #d7b9a0;border-radius:14px;margin:6px auto;max-width:440px;background:#fff;cursor:pointer;text-align:left}
.obpick.on{border-color:#2e7d32;background:#e8f5e9}.obpick img,.obpick span.i{width:54px;height:54px;border-radius:50%;object-fit:cover;background:#f3dcc6;display:flex;align-items:center;justify-content:center;font-weight:800}`;
document.head.appendChild(css);
const cbs=()=>contacts.filter(c=>/^CB-\d{4}-\d{4}$/.test(c.num));
const cOf=n=>contacts.find(c=>c.num===n)||{num:n,name:n};
const ini=c=>esc(String(c.name||'?').trim().charAt(0).toUpperCase()||'?');
let ac=null;function tone(fs,d){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();fs.forEach((f,i)=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.18;o.connect(g).connect(ac.destination);const t=ac.currentTime+i*(d||.15);o.start(t);o.stop(t+(d||.15)*.9)})}catch(e){}}
const SND={Ready:[523,659,784],Calling:[440,440],Talking:[659,880],Walkie:[880],Incoming:[784,659,784,659]};
function say(t){try{if(K.g('speak',true)&&window.speechSynthesis){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(t))}}catch(e){}}

const ob=document.createElement('div');ob.id='ob';ob.innerHTML=`<button id="obmore">More ›</button>
<div><div id="obwho"></div><div id="obst">Ready</div></div>
<button id="obbtn" aria-label="Coffeebreak call button"></button>
<div><div id="obhint">Tap to call · Hold to talk</div><div id="obx"></div>
<div id="obnote"><b>Please note:</b> needs WiFi or internet, and the other person needs the Coffeebreak app open. This is not a mobile phone service and cannot call 000. In an emergency use a normal phone and call 000.<br>© Coffeebreak. Coffeebreak keeps all rights to this app, design, name and logo. You can resell a phone you bought, but you cannot copy the app or design.</div></div>`;
document.body.appendChild(ob);
let state='Ready',lastSt='';
function setSt(s,hint){state=s;O('#obst').textContent=s;ob.className=s.toLowerCase().split(' ')[0];if(ob.dataset.h==='1')ob.classList.add('hide');O('#obhint').textContent=hint||'';if(s!==lastSt){lastSt=s;if(SND[s])tone(SND[s],s==='Incoming'?.25:.15)}}
const buddy=()=>K.g('buddy',null);
function chFor(n){return 'ob'+[me,n].map(x=>x.replace(/\D/g,'')).sort().join('')}
function joinWk(){const b=buddy();if(b&&window.cbWK)window.cbWK.join(chFor(b))}
function drawWho(){const b=buddy();O('#obwho').innerHTML=b?'My button calls <b>'+esc(cOf(b).name)+'</b>':'';
 const xs=K.g('extras',[]).filter(n=>contacts.some(c=>c.num===n)).slice(0,3);
 O('#obx').innerHTML=xs.map(n=>{const c=cOf(n);return `<div><button class="obx" data-n="${esc(n)}" style="${c.photo?'background-image:url('+c.photo+')':''}">${c.photo?'':ini(c)}</button><div class="obxl">${esc(c.name)}</div></div>`}).join('');
 O('#obx').querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{if(!cur)go(b.dataset.n)})}
function go(n){if(!ready){setSt('Ready','Connecting to WiFi, try again in a moment');say('Not connected yet');return}window.__touched=true;startCall(n,false);tone(SND.Calling)}

/* the button: tap, hold */
let hT=null,held=false;const B=O('#obbtn');
B.addEventListener('pointerdown',e=>{e.preventDefault();held=false;try{B.setPointerCapture(e.pointerId)}catch(x){}
 if(cur||!buddy())return;hT=setTimeout(()=>{held=true;if(!window.cbWK)return;joinWk();window.cbWK.start();setSt('Walkie','Talking to '+cOf(buddy()).name+'. Let go to stop')},550)});
function up(){clearTimeout(hT);if(held){held=false;window.cbWK&&window.cbWK.stop();setSt('Ready','Tap to call · Hold to talk');return 1}}
B.addEventListener('pointerup',e=>{e.preventDefault();if(up())return;
 if(cur&&O('#ans')&&O('#ans').style.display!=='none'){O('#ans').click();return}
 if(cur){endCall('Call ended');return}
 const b=buddy();if(!b)return openSetup();go(b)});
B.addEventListener('pointercancel',up);B.addEventListener('contextmenu',e=>e.preventDefault());

/* watch the app's call state */
setInterval(()=>{if(held)return;const cs=(O('#cstate')||{}).textContent||'';
 if(cur&&O('#ans').style.display!=='none')setSt('Incoming',nameOf(callTo)+' is calling. Tap to answer');
 else if(cur&&cs==='Connected')setSt('Talking','Talking to '+nameOf(callTo)+'. Tap to hang up');
 else if(cur)setSt('Calling','Calling '+nameOf(callTo)+'. Tap to hang up');
 else if(window.__obWkHeard)setSt('Walkie',nameOf(buddy()||'')+' is talking');
 else setSt('Ready',ready?(buddy()?'Tap to call · Hold to talk':'Tap to choose who your button calls'):'Connecting to WiFi...')},400);
const drawW=()=>{const w=O('#wkwho');window.__obWkHeard=!!(w&&/talking/.test(w.textContent)&&!/You talking/.test(w.textContent))};setInterval(drawW,400);

/* first open setup: asked once */
const set=document.createElement('div');set.id='obset';set.style.display='none';document.body.appendChild(set);
async function perms(){try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop())}catch(e){}try{if(window.Notification&&Notification.permission==='default')await Notification.requestPermission()}catch(e){}K.s('perms',true)}
function openSetup(){let pick=buddy(),ex=K.g('extras',[]);
 const draw=()=>{const L=cbs();set.innerHTML=`<img src="logo.png" alt="Coffeebreak" style="height:70px"><h2 style="margin:6px 0">Who does my button call?</h2>
 <p style="font-size:17px">Your Coffeebreak number is <b>${esc(me)}</b></p>
 ${L.length?L.map(c=>`<div class="obpick ${c.num===pick?'on':''}" data-p="${esc(c.num)}">${c.photo?`<img src="${c.photo}" alt="">`:`<span class="i">${ini(c)}</span>`}<div style="flex:1"><b>${esc(c.name)}</b><br><small>${esc(c.num)}</small></div><label style="font-size:13px" onclick="event.stopPropagation()"><input type="checkbox" data-x="${esc(c.num)}" ${ex.includes(c.num)?'checked':''}> extra</label></div>`).join(''):'<p style="font-size:17px">No Coffeebreak contacts yet. Scan their QR code below.</p>'}
 <button class="big" id="obscan">📷 Scan their QR code</button><div id="obcam" style="display:none"><video playsinline muted style="width:90%;max-width:360px;border-radius:12px"></video><canvas style="display:none"></canvas></div>
 <p style="font-size:13px">Tick "extra" for up to 3 more people as small photo buttons.</p>
 <button class="big" id="obdone" style="background:#c8e6c9">${pick?'Done':'Skip for now'}</button>`;
  set.querySelectorAll('[data-p]').forEach(r=>r.onclick=()=>{pick=r.dataset.p;draw()});
  set.querySelectorAll('[data-x]').forEach(x=>x.onchange=()=>{ex=ex.filter(n=>n!==x.dataset.x);if(x.checked){if(ex.length>=3){x.checked=false;return alert('Up to 3 extra buttons')}ex.push(x.dataset.x)}});
  O('#obscan').onclick=scan;O('#obdone').onclick=async()=>{stop();if(!K.g('perms',false))await perms();K.s('extras',ex.filter(n=>n!==pick));if(pick){K.s('buddy',pick);joinWk()}K.s('setup',true);set.style.display='none';drawWho()}};
 let st=null;function stop(){if(st){st.getTracks().forEach(t=>t.stop());st=null}}
 async function scan(){const box=O('#obcam'),v=box.querySelector('video'),cv=box.querySelector('canvas'),x=cv.getContext('2d');try{st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){return alert('Camera not allowed')}box.style.display='block';v.srcObject=st;v.play();
  (function tick(){if(!st)return;if(v.videoWidth&&window.jsQR){cv.width=v.videoWidth;cv.height=v.videoHeight;x.drawImage(v,0,0);const r=jsQR(x.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);const m=r&&r.data.match(/CB-?(\d{4})-?(\d{4})/);
   if(m){const n=norm(m[1]+m[2]);stop();if(n&&n!==me){try{helloTo(n)}catch(e){upsert(n)}pick=n;draw();return}}}requestAnimationFrame(tick)})()}
 draw();set.style.display='block'}
O('#obmore').onclick=()=>{ob.classList.add('hide');ob.dataset.h='1';K.s('mode','full');showBack()};
function showBack(){let b=O('#obback');if(!b){b=document.createElement('button');b.id='obback';b.textContent='🔴 One Button';b.style.cssText='position:fixed;bottom:calc(66px + env(safe-area-inset-bottom));left:12px;z-index:59;font-size:16px;padding:10px 14px;border-radius:20px;border:2px solid #3b2417;background:#ffd6e0';b.onclick=()=>{ob.dataset.h='';ob.classList.remove('hide');K.s('mode','one');b.remove();drawWho()};document.body.appendChild(b)}}
window.cbOneButton={setup:openSetup,open:()=>O('#obback')&&O('#obback').click()};
const ch=document.createElement('button');ch.textContent='Change who my button calls';ch.style.cssText='font-size:14px;background:none;border:none;text-decoration:underline;color:#3b2417;margin-top:4px';ch.onclick=openSetup;O('#obhint').after(ch);
if(K.g('mode','one')==='full'){ob.classList.add('hide');ob.dataset.h='1';showBack()}
drawWho();if(!K.g('setup',false))openSetup();else setTimeout(joinWk,1500);
window.addEventListener('storage',drawWho);
})();
