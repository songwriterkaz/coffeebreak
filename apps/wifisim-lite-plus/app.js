'use strict';
const $=s=>document.querySelector(s),PFX='coffeebreak-dsim-v1-';
const ICE=window.__ICE||{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:global.stun.twilio.com:3478'},{urls:'stun:stun.nextcloud.com:443'}]};
const get=(k,d)=>{try{const v=localStorage.getItem('cbl_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},put=(k,v)=>{try{localStorage.setItem('cbl_'+k,JSON.stringify(v))}catch(e){}};
const norm=s=>{const m=String(s||'').match(/CB-?(\d{4})-?(\d{4})/i)||String(s||'').match(/[?&#]add=CB-?(\d{4})-?(\d{4})/i);return m?`CB-${m[1]}-${m[2]}`:null};
const isPhone=s=>{const t=String(s||'').replace(/[\s()-]/g,'');return !norm(s)&&/^\+?\d{3,15}$/.test(t)?t:null};
let me=get('num');if(!me){const a=new Uint32Array(2);crypto.getRandomValues(a);me=`CB-${1000+a[0]%9000}-${String(a[1]%10000).padStart(4,'0')}`;put('num',me)}
$('#me').textContent=me;
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
const FULL=location.href.split('#')[0].split('?')[0];
const LINK=(/itch\.zone|hwcdn|itch\.io|localhost|^file/.test(location.host+location.protocol)?FULL:location.origin+location.pathname)+'?add='+me;
function loadQR(){return window.QRCode?Promise.resolve():new Promise((r,j)=>{const s=document.createElement('script');s.src='qrcode.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)})}
setTimeout(()=>loadQR().then(()=>new QRCode($('#qr'),{text:LINK,width:220,height:220,colorDark:'#3b2417',correctLevel:QRCode.CorrectLevel.M})).catch(()=>{$('#qr').textContent=LINK}),0);
let errT;function err(t){$('#err').textContent=t;$('#err').style.display=t?'block':'none';clearTimeout(errT);if(t)errT=setTimeout(()=>$('#err').style.display='none',12000)}
function showFull(){$('#full').style.display='block';$('#fulla').href=FULL+'?add='+(norm($('#to').value)||'')}
$('#share').onclick=async()=>{try{if(navigator.share){await navigator.share({title:'Coffeebreak WifiPhone',text:'Call me free on Coffeebreak WifiPhone',url:LINK});return}}catch(e){if(e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(LINK);err('');$('#share').textContent='Link copied';setTimeout(()=>$('#share').textContent='Share my link',2500)}catch(e){prompt('Copy your link',LINK)}};
// messages
let msgs=get('msgs',{});const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let outbox=get('outbox',[]);const save=()=>{put('msgs',msgs);put('outbox',outbox)};
function draw(){const w=norm($('#to').value);const l=w?(msgs[w]||[]):[];$('#msgs').innerHTML=l.slice(-50).map(m=>`<div class="m${m.me?' me':''}">${esc(m.text)}<small>${new Date(m.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}${m.me?(m.ok?' ✓ delivered':' ⏳ waiting'):''}</small></div>`).join('');scrollTo(0,document.body.scrollHeight)}
$('#to').addEventListener('input',()=>{const n=norm($('#to').value);if(n&&n!==$('#to').value)$('#to').value=n;draw();if(n)put('last',n)});
// peer
let peer,ready=false,back=1000,reT=null,conns={};
const pid=n=>PFX+n.replace(/-/g,'');const fromPid=p=>norm(p.slice(PFX.length).replace(/^CB/,'CB-').replace(/^(CB-\d{4})/,'$1-'));
function setSt(){$('#st').textContent=ready?'Ready':'Connecting…';$('#st').className=ready?'ok':'wait'}
function start(){try{peer&&peer.destroy()}catch(e){}peer=new Peer(pid(me),{config:ICE,debug:0});
 peer.on('open',()=>{ready=true;back=1000;setSt();flush()});
 peer.on('disconnected',()=>{ready=false;setSt();again()});peer.on('close',()=>{ready=false;setSt();again()});
 peer.on('error',e=>{if(e.type==='peer-unavailable'){const who=(e.message.match(/coffeebreak-dsim-v1-(\S+)/)||[])[1];if(callTo&&pending){endCall('They are not online right now');}else if(!callTo)err('They are not online right now. Messages will send when they open the app.');}
  else if(e.type==='unavailable-id'){err('This number is open in another tab. Close the other tab.')}else if(['network','server-error','socket-error','socket-closed','disconnected'].includes(e.type)){ready=false;setSt();again()}else if(e.type==='webrtc'){err('Could not connect. Try again, or switch between wifi and mobile data.')}});
 peer.on('connection',wire);peer.on('call',incoming)}
function again(){if(reT)return;reT=setTimeout(()=>{reT=null;if(ready)return;try{peer&&!peer.destroyed&&peer.disconnected?peer.reconnect():start()}catch(e){start()}back=Math.min(back*2,30000);setTimeout(()=>{if(!ready)again()},6000)},back)}
addEventListener('online',()=>{back=1000;again()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(!ready){back=1000;again()}else flush()}});
function wire(c){const n=fromPid(c.peer);if(!n)return;c.on('open',()=>{conns[n]=c;flush(n)});
 c.on('data',d=>{if(typeof d==='string')try{d=JSON.parse(d)}catch(e){return}
  if(d.type==='msg'){const l=msgs[n]=msgs[n]||[];if(!l.some(m=>m.id===d.id)){l.push({id:d.id,text:d.text,t:d.t,me:false});save();if(!norm($('#to').value)){$('#to').value=n;put('last',n)}draw();try{navigator.vibrate&&navigator.vibrate(150)}catch(e){}}c.send({type:'ack',id:d.id})}
  else if(d.type==='ack'){outbox=outbox.filter(o=>o.id!==d.id);(msgs[n]||[]).forEach(m=>{if(m.id===d.id)m.ok=true});save();draw()}});
 c.on('close',()=>{if(conns[n]===c)delete conns[n]});c.on('error',()=>{if(conns[n]===c)delete conns[n]})}
function link(n){const c=conns[n];if(c&&(c.open||Date.now()-c._t<10000))return c;const nc=peer.connect(pid(n),{reliable:true,serialization:'json'});nc._t=Date.now();conns[n]=nc;wire(nc);return nc}
function flush(only){if(!ready)return;[...new Set(outbox.map(o=>o.to))].filter(n=>!only||n===only).forEach(n=>{const c=link(n);if(c.open)outbox.filter(o=>o.to===n).forEach(o=>c.send({type:'msg',id:o.id,text:o.text,t:o.t}))})}
setInterval(()=>flush(),15000);
function sendTo(n,t){const id=(crypto.randomUUID?crypto.randomUUID():Date.now()+''+Math.random());(msgs[n]=msgs[n]||[]).push({id,text:t,t:Date.now(),me:true,ok:false});outbox.push({to:n,id,text:t,t:Date.now()});save();draw();flush(n);return id}
function sendText(){const n=norm($('#to').value),t=$('#txt').value.trim();if(!t)return;
 const ph=isPhone($('#to').value);if(ph){location.href='sms:'+ph+'?&body='+encodeURIComponent(t);return}
 if(!n)return err('Type their CB number or paste their link first');const id=(crypto.randomUUID?crypto.randomUUID():Date.now()+''+Math.random());
 (msgs[n]=msgs[n]||[]).push({id,text:t,t:Date.now(),me:true,ok:false});outbox.push({to:n,id,text:t,t:Date.now()});save();$('#txt').value='';draw();
 if(!ready)err('Not connected yet. Your message will send automatically.');flush(n);
 setTimeout(()=>{if(outbox.some(o=>o.id===id))err('Not delivered yet. They may not be online. It will keep trying.')},10000)}
$('#send').onclick=sendText;$('#txt').addEventListener('keydown',e=>{if(e.key==='Enter')sendText()});
$('#btext').onclick=()=>{const ph=isPhone($('#to').value);if(ph){location.href='sms:'+ph;return}if(!norm($('#to').value))return err('Type their CB number or paste their link first');$('#txt').focus()};
// calls
let cur=null,stream=null,callTo=null,pending=false,ringT=null,actx=null,touched=false;
['pointerdown','touchstart','keydown','click'].forEach(ev=>document.addEventListener(ev,()=>{if(touched)return;touched=true;try{actx=new (window.AudioContext||window.webkitAudioContext)();actx.resume()}catch(e){}},{passive:true}));
function ring(on){clearInterval(ringT);if(!on)return;const beep=()=>{try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();[0,.45].forEach(d=>{const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=d?480:440;g.gain.value=.2;o.connect(g).connect(actx.destination);o.start(actx.currentTime+d);o.stop(actx.currentTime+d+.35)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([500,200,500])}catch(e){}};beep();ringT=setInterval(beep,2200)}
async function media(video){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){if(inFrame)showFull();throw new Error('Calls need the full app. Tap the green button to open it.')}
 const tries=video?[{audio:true,video:{facingMode:'user'}},{audio:true,video:true},{audio:true}]:[{audio:true}];let last;
 for(const c of tries){try{return await navigator.mediaDevices.getUserMedia(c)}catch(e){last=e}}
 if(inFrame){showFull();throw new Error('Microphone blocked inside this page. Tap the green button to open the full app for calls.')}
 throw new Error(last&&last.name==='NotFoundError'?'No microphone found on this device':'Microphone blocked. Allow the microphone for this site in your browser settings.')}
function ui(n,state,inc,video){callTo=n;$('#cwho').textContent=n===get('mum')?'Mum':n;$('#cstate').textContent=state;$('#ans').style.display=$('#dec').style.display=inc?'':'none';$('#hang').style.display=inc?'none':'';$('#call').classList.add('show');$('#lv').style.display=$('#rv').style.display=video?'block':'none'}
async function call(video){const raw=$('#to').value,ph=isPhone(raw);if(ph){location.href='tel:'+ph;return}
 const n=norm(raw);if(!n)return err('Type their CB number or paste their link first');if(n===me)return err('That is your own number');
 if(!ready)return err('Not connected yet. Wait for Ready, then try again.');if(cur)return;err('');
 ui(n,'Getting microphone…',false,video);try{stream=await media(video)}catch(e){return endCall(e.message)}
 $('#lv').srcObject=stream;$('#cstate').textContent='Calling…';pending=true;
 cur=peer.call(pid(n),stream,{metadata:{video}});hook(cur,video);
 // presence check: if no answer path within 8 s, say they are offline
 const probe=peer.connect(pid(n),{serialization:'json'});let seen=false;probe.on('open',()=>{seen=true;$('#cstate').textContent='Ringing…';setTimeout(()=>probe.close(),500)});
 setTimeout(()=>{if(cur&&pending&&!seen)endCall('They are not online right now')},8000);
 setTimeout(()=>{if(cur&&pending)endCall('No answer')},45000)}
$('#bcall').onclick=()=>call(false);$('#bvid').onclick=()=>call(true);
function hook(c,video){c.on('stream',r=>{pending=false;if(video){$('#rv').srcObject=r;$('#rv').style.display='block'}else $('#ra').srcObject=r;$('#cstate').textContent='Connected';window.__connected=true});
 c.on('close',()=>endCall(pending?'They declined or hung up':'Call ended'));c.on('error',()=>endCall('Could not connect the call'));
 setTimeout(()=>{const pc=c.peerConnection;if(pc)pc.addEventListener('iceconnectionstatechange',()=>{if(pc.iceConnectionState==='failed')endCall('Could not connect. The network may be blocking calls. Try mobile data.')})},500)}
function incoming(c){const n=fromPid(c.peer),video=!!(c.metadata&&c.metadata.video);if(cur){c.close();return}
 cur=c;pending=true;ui(n,`Incoming ${video?'video':'voice'} call`,true,video);ring(true);if(n&&!norm($('#to').value)){$('#to').value=n;draw()}
 $('#ans').onclick=async()=>{ring(false);$('#ans').style.display=$('#dec').style.display='none';$('#hang').style.display='';$('#cstate').textContent='Connecting…';
  try{stream=await media(video)}catch(e){err(e.message);try{stream=await media(false)}catch(e2){c.close();return endCall(e.message)}}
  $('#lv').srcObject=stream;c.answer(stream);hook(c,video)};
 $('#dec').onclick=()=>{c.close();endCall('Declined')};c.on('close',()=>endCall('Call ended'))}
function endCall(msg){ring(false);pending=false;const c=cur;cur=null;try{c&&c.close()}catch(e){}if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 $('#cstate').textContent=msg;if(msg&&!/ended|Declined/.test(msg))err(msg);setTimeout(()=>{if(!cur){$('#call').classList.remove('show');$('#rv').srcObject=null;$('#ra').srcObject=null;callTo=null}},1500)}
$('#hang').onclick=()=>endCall('Call ended');
// Mum
$('#mum').onclick=()=>{let m=get('mum');if(!m){m=norm(prompt("Mum's Coffeebreak number (CB-1234-5678)")||'')||isPhone(prompt('Or Mum\'s normal phone number')||'');if(!m)return;put('mum',m)}$('#to').value=m;draw();call(false)};
// link open: auto-fill and connect
const q=new URLSearchParams(location.search).get('add')||(location.hash.match(/add=([^&]+)/)||[])[1];
const qn=q&&norm(q);if(qn&&qn!==me){$('#to').value=qn;put('last',qn)}else{const l=get('last');if(l)$('#to').value=l}
start();draw();setSt();
setInterval(()=>{if(ready){const n=norm($('#to').value);if(n&&n!==me&&!(conns[n]&&conns[n].open))link(n)}},20000);
const ac=setInterval(()=>{if(!ready)return;clearInterval(ac);const n=norm($('#to').value);if(n&&n!==me)link(n)},300);
if(inFrame)$('#full').style.display='block',$('#fulla').href=FULL;
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
// SIM PIN
async function hashPin(pin,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const pinRec=()=>get('pin',null);
async function setPin(pin){const s=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');put('pin',{s,h:await hashPin(pin,s)});put('pinfail',{n:0,until:0})}
async function checkPin(pin){const r=pinRec();return !!r&&await hashPin(pin,r.s)===r.h}
let entry='';const lock=()=>{entry='';$('#pinshow').textContent='';$('#lock').classList.add('show')};
'123456789C0✓'.split('').forEach(k=>{const b=document.createElement('button');b.textContent=k;b.setAttribute('aria-label',k==='C'?'Clear':k==='✓'?'OK':k);b.onclick=()=>pinKey(k);$('#kp').appendChild(b)});
async function pinKey(k){const f=get('pinfail',{n:0,until:0});if(Date.now()<f.until){$('#pinmsg').textContent=`Too many tries. Wait ${Math.ceil((f.until-Date.now())/1000)} seconds.`;return}
 if(k==='C'){entry='';}else if(k==='✓'){if(await checkPin(entry)){put('pinfail',{n:0,until:0});$('#lock').classList.remove('show');$('#pinmsg').textContent='';entry=''}else{f.n++;if(f.n>=3){f.until=Date.now()+30000;f.n=0;$('#pinmsg').textContent='Too many tries. Wait 30 seconds.'}else $('#pinmsg').textContent='Wrong PIN';put('pinfail',f);entry=''}}
 else if(entry.length<8)entry+=k;$('#pinshow').textContent='•'.repeat(entry.length)}
document.addEventListener('keydown',e=>{if(!$('#lock').classList.contains('show'))return;if(/^\d$/.test(e.key))pinKey(e.key);else if(e.key==='Enter')pinKey('✓');else if(e.key==='Backspace')pinKey('C')});
$('#lmum').onclick=()=>{const m=get('mum');if(!m){$('#pinmsg').textContent='Mum is not saved yet. Unlock to save her.';return}$('#to').value=m;call(false)};
$('#forgot').onclick=()=>{if(confirm('Forgot PIN: this removes the SIM PIN from this app. Your contacts and messages stay. Anyone holding this phone can then open it. Continue?')){localStorage.removeItem('cbl_pin');localStorage.removeItem('cbl_pinfail');$('#lock').classList.remove('show')}};
function setUI(){const on=!!pinRec();$('#pinstate').textContent=on?'SIM PIN is ON':'SIM PIN is OFF';$('#pinon').style.display=on?'none':'';$('#pinchg').style.display=$('#pinoff').style.display=$('#pcur').style.display=on?'':'none';$('#p1').value=$('#p2').value=$('#pcur').value=''}
const valid=()=>{const a=$('#p1').value,b=$('#p2').value;if(!/^\d{4,8}$/.test(a)){$('#setmsg').textContent='PIN must be 4 to 8 digits';return null}if(a!==b){$('#setmsg').textContent='The two PINs do not match';return null}return a};
$('#gear').onclick=()=>{setUI();$('#setmsg').textContent='';$('#set').classList.add('show')};$('#setx').onclick=()=>$('#set').classList.remove('show');
$('#pinon').onclick=async()=>{const p=valid();if(!p)return;await setPin(p);setUI();$('#setmsg').textContent='SIM PIN is on'};
$('#pinchg').onclick=async()=>{if(!await checkPin($('#pcur').value)){$('#setmsg').textContent='Current PIN is wrong';return}const p=valid();if(!p)return;await setPin(p);setUI();$('#setmsg').textContent='PIN changed'};
$('#pinoff').onclick=async()=>{if(!await checkPin($('#pcur').value)){$('#setmsg').textContent='Current PIN is wrong';return}localStorage.removeItem('cbl_pin');setUI();$('#setmsg').textContent='SIM PIN is off'};
if(pinRec()&&!get('kiosk',false))lock();
// Call Mum Phone (kiosk)
const COLS=['#1e88e5','#43a047','#fb8c00','#8e24aa'];
function favs(){return get('favs',[{},{},{},{}])}
function drawFavSet(){const f=favs();$('#favset').innerHTML=f.map((x,i)=>`<div style="display:flex;gap:4px"><input data-fn="${i}" placeholder="Favourite ${i+1} name" value="${esc(x.n||'')}" style="font-size:16px;padding:8px"><input data-fv="${i}" placeholder="CB number" value="${esc(x.v||'')}" style="font-size:16px;padding:8px"></div>`).join('')}
function saveFavs(){const f=[0,1,2,3].map(i=>({n:$(`[data-fn="${i}"]`).value.trim(),v:norm($(`[data-fv="${i}"]`).value)||''}));put('favs',f)}
function kioskDraw(){$('#kfav').innerHTML=favs().map((x,i)=>x.n&&x.v?`<button class="btn" data-kc="${x.v}" style="background:${COLS[i]}">📞 ${esc(x.n)}</button>`:'').join('');$('#kst').textContent=ready?'Ready':'Connecting…'}
let wl=null;async function wake(){try{if('wakeLock'in navigator&&get('kiosk',false)&&!document.hidden){wl=await navigator.wakeLock.request('screen')}}catch(e){}}
document.addEventListener('visibilitychange',wake);
function kioskOn(){$('#kiosk').classList.add('show');$('#lock').classList.remove('show');kioskDraw();wake()}
$('#kiosk').addEventListener('click',e=>{const b=e.target.closest('[data-kc]');if(b){$('#to').value=b.dataset.kc;call(false)}});
$('#kmum').onclick=()=>{const m=get('mum');if(!m){$('#kst').textContent='Mum is not saved yet. Ask a parent.';return}$('#to').value=m;call(false)};
$('#kmsg').onclick=()=>$('#kq').classList.toggle('show');
$('#kq').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const m=get('mum');if(!m||!norm(m)){$('#kst').textContent='Mum is not saved yet. Ask a parent.';return}
 const go=t=>{sendTo(m,t);$('#kst').textContent='Sent to Mum: '+t;$('#kq').classList.remove('show')};
 if(b.dataset.loc&&navigator.geolocation){$('#kst').textContent='Getting location…';navigator.geolocation.getCurrentPosition(p=>go(`${b.dataset.q}. I am here: https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`),()=>go(b.dataset.q+' (location not available)'),{timeout:10000,enableHighAccuracy:true})}else go(b.dataset.q)});
$('#kon').onclick=()=>{saveFavs();if(!pinRec()){$('#setmsg').textContent='Turn on the SIM PIN first. It is the parent PIN to leave this mode.';return}if(!get('mum')){$('#setmsg').textContent='Save Mum first: tap Call Mum on the main screen.';return}put('kiosk',true);$('#set').classList.remove('show');kioskOn()};
$('#kexit').onclick=async()=>{const p=prompt('Parent PIN');if(p&&await checkPin(p)){put('kiosk',false);$('#kiosk').classList.remove('show');try{wl&&wl.release()}catch(e){}}else if(p!==null)$('#kst').textContent='Wrong PIN'};
$('#gear').addEventListener('click',drawFavSet);
$('#guideb').onclick=()=>$('#guide').classList.add('show');$('#guidex').onclick=()=>$('#guide').classList.remove('show');
setInterval(()=>{if(get('kiosk',false))$('#kst').textContent=ready?'Ready':'Connecting…'},2000);
if(get('kiosk',false))kioskOn();
window.__lite={sendTo,kioskOn,pinKey,setPin,me:()=>me,ready:()=>ready,call,sendText,msgs:()=>msgs};
