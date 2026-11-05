'use strict';
const $=s=>document.querySelector(s),PFX='coffeebreak-dsim-v1-';
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:global.stun.twilio.com:3478'},{urls:'stun:stun.nextcloud.com:443'}]};
const get=(k,d)=>{try{const v=localStorage.getItem('cbk_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},put=(k,v)=>{try{localStorage.setItem('cbk_'+k,JSON.stringify(v))}catch(e){}};
const norm=s=>{const m=String(s||'').match(/CB-?(\d{4})-?(\d{4})/i);return m?`CB-${m[1]}-${m[2]}`:null};
const isPhone=s=>{const t=String(s||'').replace(/[\s()-]/g,'');return !norm(s)&&/^\+?\d{3,15}$/.test(t)?t:null};
let me=get('num');if(!me){const a=new Uint32Array(2);crypto.getRandomValues(a);me=`CB-${1000+a[0]%9000}-${String(a[1]%10000).padStart(4,'0')}`;put('num',me)}
$('#me').textContent=me;
const inFrame=(()=>{try{return window.self!==window.top}catch(e){return true}})();
const FULL=location.href.split('#')[0].split('?')[0];
const LINK=(/itch\.zone|hwcdn|itch\.io|localhost|^file/.test(location.host+location.protocol)?FULL:location.origin+location.pathname)+'?add='+me;
// sky art: stars and a rocket
(()=>{const sky=$('#sky'),cols=['#ffeb3b','#fff','#80d8ff','#ccff90','#ff80ab'];for(let i=0;i<14;i++){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');const z=10+Math.random()*16;s.style.cssText=`width:${z}px;left:${Math.random()*96}%;top:${Math.random()*96}%;animation-delay:${(Math.random()*3).toFixed(2)}s`;s.innerHTML=`<path fill="${cols[i%5]}" d="M12 1l3 7.5 8 .6-6.1 5.2 1.9 7.8L12 17.8 5.2 22.1l1.9-7.8L1 9.1l8-.6z"/>`;sky.appendChild(s)}
 const r=document.createElementNS('http://www.w3.org/2000/svg','svg');r.id='rocket';r.setAttribute('viewBox','0 0 40 80');r.innerHTML='<path d="M20 2C30 14 32 30 30 52H10C8 30 10 14 20 2z" fill="#eceff1"/><circle cx="20" cy="26" r="6" fill="#40c4ff" stroke="#546e7a" stroke-width="2"/><path d="M10 40L2 58l8-2zM30 40l8 18-8-2z" fill="#ff1744"/><path d="M13 54h14l-7 22z" fill="#ffab00"/>';sky.appendChild(r)})();
let errT;function err(t){$('#err').textContent=t;$('#err').style.display=t?'block':'none';clearTimeout(errT);if(t)errT=setTimeout(()=>$('#err').style.display='none',10000)}
const log=t=>{$('#log').textContent=t};
function showFull(){$('#full').style.display='block';$('#fulla').href=FULL}
function loadQR(){return window.QRCode?Promise.resolve():new Promise((r,j)=>{const s=document.createElement('script');s.src='qrcode.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s)})}
let qrDone=false;function drawQR(){if(qrDone)return;qrDone=true;loadQR().then(()=>new QRCode($('#myqr'),{text:LINK,width:200,height:200,colorDark:'#4a148c',correctLevel:QRCode.CorrectLevel.M})).catch(()=>{$('#myqr').textContent=LINK})}
// messages
let msgs=get('msgs',{});const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let outbox=get('outbox',[]);const save=()=>{put('msgs',msgs);put('outbox',outbox)};
const mum=()=>get('mum',null);
function draw(){const w=norm(mum());const l=w?(msgs[w]||[]):[];$('#msgs').innerHTML=l.slice(-4).map(m=>`<div class="m${m.me?' me':''}">${esc(m.text)}<small>${new Date(m.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}${m.me?(m.ok?' ✓ Mum got it':' ⏳ sending'):''}</small></div>`).join('')}
function mumUI(){const m=mum();$('#mumsub').textContent=m?'Tap to call Mum':'A grown-up needs to set Mum first';$('#mumstate').textContent=m?'Mum is saved: '+m:'Mum is not saved yet'}
// peer (same as Lite)
let peer,ready=false,back=1000,reT=null,conns={};
const pid=n=>PFX+n.replace(/-/g,'');const fromPid=p=>norm(p.slice(PFX.length).replace(/^CB/,'CB-').replace(/^(CB-\d{4})/,'$1-'));
function setSt(){$('#st').textContent=ready?'Ready':'Connecting';$('#st').className=ready?'ok':''}
function start(){try{peer&&peer.destroy()}catch(e){}peer=new Peer(pid(me),{config:ICE,debug:0});
 peer.on('open',()=>{ready=true;back=1000;setSt();flush()});
 peer.on('disconnected',()=>{ready=false;setSt();again()});peer.on('close',()=>{ready=false;setSt();again()});
 peer.on('error',e=>{if(e.type==='peer-unavailable'){if(callTo&&pending)endCall('Mum is not online right now');else if(!callTo)log('Mum is not online. Messages will send when she opens the app.')}
  else if(e.type==='unavailable-id'){err('This app is open in another tab. Close the other tab.')}else if(['network','server-error','socket-error','socket-closed','disconnected'].includes(e.type)){ready=false;setSt();again()}else if(e.type==='webrtc'){err('Could not connect. Try again, or switch between wifi and mobile data.')}});
 peer.on('connection',wire);peer.on('call',incoming)}
function again(){if(reT)return;reT=setTimeout(()=>{reT=null;if(ready)return;try{peer&&!peer.destroyed&&peer.disconnected?peer.reconnect():start()}catch(e){start()}back=Math.min(back*2,30000);setTimeout(()=>{if(!ready)again()},6000)},back)}
addEventListener('online',()=>{back=1000;again()});document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(!ready){back=1000;again()}else flush()}});
function wire(c){const n=fromPid(c.peer);if(!n)return;c.on('open',()=>{conns[n]=c;flush(n)});
 c.on('data',d=>{if(typeof d==='string')try{d=JSON.parse(d)}catch(e){return}
  if(d.type==='msg'){const l=msgs[n]=msgs[n]||[];if(!l.some(m=>m.id===d.id)){l.push({id:d.id,text:d.text,t:d.t,me:false});save();draw();try{navigator.vibrate&&navigator.vibrate(150)}catch(e){}}c.send({type:'ack',id:d.id})}
  else if(d.type==='ack'){outbox=outbox.filter(o=>o.id!==d.id);(msgs[n]||[]).forEach(m=>{if(m.id===d.id)m.ok=true});save();draw();log('Mum got your message')}});
 c.on('close',()=>{if(conns[n]===c)delete conns[n]});c.on('error',()=>{if(conns[n]===c)delete conns[n]})}
function link(n){const c=conns[n];if(c&&(c.open||Date.now()-c._t<10000))return c;const nc=peer.connect(pid(n),{reliable:true,serialization:'json'});nc._t=Date.now();conns[n]=nc;wire(nc);return nc}
function flush(only){if(!ready)return;[...new Set(outbox.map(o=>o.to))].filter(n=>!only||n===only).forEach(n=>{const c=link(n);if(c.open)outbox.filter(o=>o.to===n).forEach(o=>c.send({type:'msg',id:o.id,text:o.text,t:o.t}))})}
setInterval(()=>flush(),15000);
function where(ms){return new Promise(r=>{if(!navigator.geolocation)return r(null);let done=false;const fin=v=>{if(!done){done=true;r(v)}};setTimeout(()=>fin(null),ms||5000);
 try{navigator.geolocation.getCurrentPosition(p=>fin(`https://maps.google.com/?q=${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)}`),()=>fin(null),{enableHighAccuracy:true,timeout:ms||5000,maximumAge:60000})}catch(e){fin(null)}})}
async function toMum(text,withLoc){const m=mum();if(!m){needMum();return false}
 if(withLoc){log('Finding where you are');const l=await where(5000);text+=l?' - I am here: '+l:' - location not available'}
 const ph=isPhone(m);if(ph){location.href='sms:'+ph+'?&body='+encodeURIComponent(text);return true}
 const id=(crypto.randomUUID?crypto.randomUUID():Date.now()+''+Math.random());
 (msgs[m]=msgs[m]||[]).push({id,text,t:Date.now(),me:true,ok:false});outbox.push({to:m,id,text,t:Date.now()});save();draw();
 log(ready?'Sending to Mum':'Not connected yet. It will send by itself.');flush(m);return true}
$('#ok').onclick=()=>toMum("I'm OK",false);$('#come').onclick=()=>toMum('Come get me',true);$('#need').onclick=()=>toMum('I need help',true);
// audio unlock
let cur=null,stream=null,callTo=null,pending=false,ringT=null,actx=null,touched=false;
const AC=()=>{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state!=='running')actx.resume();return actx};
['pointerdown','touchstart','keydown','click'].forEach(ev=>document.addEventListener(ev,()=>{if(touched)return;touched=true;try{AC()}catch(e){}},{passive:true}));
// SIREN
let sir=null;
function sirenOn(){if(sir)return;const a=AC(),o=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),comp=a.createDynamicsCompressor();
 o.type='sawtooth';o2.type='square';g.gain.value=1;o.connect(g);o2.connect(g);g.connect(comp).connect(a.destination);
 const sched=()=>{const t=a.currentTime;[o,o2].forEach((x,i)=>{const f=x.frequency,k=i?1.01:1;f.cancelScheduledValues(t);f.setValueAtTime(600*k,t);f.linearRampToValueAtTime(1400*k,t+1.4);f.linearRampToValueAtTime(600*k,t+2.8)})};
 sched();o.start();o2.start();const wail=setInterval(sched,2800);
 const vib=()=>{try{navigator.vibrate&&navigator.vibrate([600,200,600,200,1200,400])}catch(e){}};vib();const vt=setInterval(vib,3200);
 sir={o,o2,g,wail,vt,running:true};window.__sirenState='running';$('#sov').classList.add('show');$('#sosst').textContent='Telling Mum';
 if(!mum()){$('#sosst').textContent='Mum is not set up yet. Ask a grown-up.';return}
 toMum('SOS - siren on',true).then(ok=>{if(sir)$('#sosst').textContent=ok?'Message sent to Mum':'Could not tell Mum'})}
function sirenOff(){if(!sir)return;try{sir.o.stop();sir.o2.stop();sir.g.disconnect()}catch(e){}clearInterval(sir.wail);clearInterval(sir.vt);try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}sir=null;window.__sirenState='stopped';$('#sov').classList.remove('show')}
$('#siren').onclick=sirenOn;$('#stop').onclick=sirenOff;
// calls (same engine as Lite)
function ring(on){clearInterval(ringT);if(!on)return;const beep=()=>{try{const a=AC();[0,.25,.5].forEach((d,i)=>{const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=[660,880,990][i];g.gain.value=.3;o.connect(g).connect(a.destination);o.start(a.currentTime+d);o.stop(a.currentTime+d+.2)})}catch(e){}try{navigator.vibrate&&navigator.vibrate([500,200,500])}catch(e){}};beep();ringT=setInterval(beep,2000)}
async function media(video){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){if(inFrame)showFull();throw new Error('Calls need the full app. Tap the green button to open it.')}
 const tries=video?[{audio:true,video:{facingMode:'user'}},{audio:true,video:true},{audio:true}]:[{audio:true}];let last;
 for(const c of tries){try{return await navigator.mediaDevices.getUserMedia(c)}catch(e){last=e}}
 if(inFrame){showFull();throw new Error('Microphone blocked inside this page. Tap the green button to open the full app for calls.')}
 throw new Error(last&&last.name==='NotFoundError'?'No microphone found on this device':'Microphone blocked. Ask a grown-up to allow the microphone for this site.')}
function ui(n,state,inc,video){callTo=n;$('#cwho').textContent=n===mum()?'Mum':n;$('#cstate').textContent=state;$('#ans').style.display=$('#dec').style.display=inc?'':'none';$('#hang').style.display=inc?'none':'';$('#call').classList.add('show');$('#lv').style.display=$('#rv').style.display=video?'block':'none'}
async function call(n,video){const ph=isPhone(n);if(ph){location.href='tel:'+ph;return}
 n=norm(n);if(!n)return needMum();if(n===me)return err('That is this phone\'s own number');
 if(!ready)return err('Not connected yet. Wait for Ready, then try again.');if(cur)return;err('');
 ui(n,'Getting microphone',false,video);try{stream=await media(video)}catch(e){return endCall(e.message)}
 $('#lv').srcObject=stream;$('#cstate').textContent='Calling Mum';pending=true;
 cur=peer.call(pid(n),stream,{metadata:{video}});hook(cur,video);
 const probe=peer.connect(pid(n),{serialization:'json'});let seen=false;probe.on('open',()=>{seen=true;$('#cstate').textContent='Ringing';setTimeout(()=>probe.close(),500)});
 setTimeout(()=>{if(cur&&pending&&!seen)endCall('Mum is not online right now. Try a message.')},8000);
 setTimeout(()=>{if(cur&&pending)endCall('No answer')},45000)}
function hook(c,video){c.on('stream',r=>{pending=false;if(video){$('#rv').srcObject=r;$('#rv').style.display='block'}else $('#ra').srcObject=r;$('#cstate').textContent='Connected';window.__connected=true});
 c.on('close',()=>endCall(pending?'Mum could not answer':'Call ended'));c.on('error',()=>endCall('Could not connect the call'));
 setTimeout(()=>{const pc=c.peerConnection;if(pc)pc.addEventListener('iceconnectionstatechange',()=>{if(pc.iceConnectionState==='failed')endCall('Could not connect. The network may be blocking calls. Try mobile data.')})},500)}
function incoming(c){const n=fromPid(c.peer),video=!!(c.metadata&&c.metadata.video);if(cur){c.close();return}
 cur=c;pending=true;ui(n,n===mum()?'Mum is calling':`Incoming ${video?'video':'voice'} call`,true,video);ring(true);
 $('#ans').onclick=async()=>{ring(false);$('#ans').style.display=$('#dec').style.display='none';$('#hang').style.display='';$('#cstate').textContent='Connecting';
  try{stream=await media(video)}catch(e){err(e.message);try{stream=await media(false)}catch(e2){c.close();return endCall(e.message)}}
  $('#lv').srcObject=stream;c.answer(stream);hook(c,video)};
 $('#dec').onclick=()=>{c.close();endCall('Declined')};c.on('close',()=>endCall('Call ended'))}
function endCall(msg){ring(false);pending=false;const c=cur;cur=null;try{c&&c.close()}catch(e){}if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 $('#cstate').textContent=msg;if(msg&&!/ended|Declined/.test(msg))err(msg);setTimeout(()=>{if(!cur){$('#call').classList.remove('show');$('#rv').srcObject=null;$('#ra').srcObject=null;callTo=null}},1500)}
$('#hang').onclick=()=>endCall('Call ended');
$('#help').onclick=()=>{const m=mum();if(!m)return needMum();if(norm(m))link(norm(m));call(m,false)};
// grown-up area (behind PIN)
async function hashPin(pin,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pin));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const pinRec=()=>get('pin',null);
async function setPin(pin){const s=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');put('pin',{s,h:await hashPin(pin,s)});put('pinfail',{n:0,until:0})}
async function checkPin(pin){const r=pinRec();return !!r&&await hashPin(pin,r.s)===r.h}
let entry='',afterPin=null;
function grownUp(title){if(!pinRec())return openSet();afterPin=openSet;entry='';$('#pinshow').textContent='';$('#pinmsg').textContent='';$('#locktitle').textContent=title||'Grown-up PIN';$('#lock').classList.add('show')}
function needMum(){grownUp('Grown-up: enter PIN to set Mum');if(!pinRec())err('A grown-up needs to set Mum first')}
'123456789C0✓'.split('').forEach(k=>{const b=document.createElement('button');b.textContent=k;b.setAttribute('aria-label',k==='C'?'Clear':k==='✓'?'OK':k);b.onclick=()=>pinKey(k);$('#kp').appendChild(b)});
async function pinKey(k){const f=get('pinfail',{n:0,until:0});if(Date.now()<f.until){$('#pinmsg').textContent=`Too many tries. Wait ${Math.ceil((f.until-Date.now())/1000)} seconds.`;return}
 if(k==='C'){entry='';}else if(k==='✓'){if(await checkPin(entry)){put('pinfail',{n:0,until:0});$('#lock').classList.remove('show');entry='';const f2=afterPin;afterPin=null;f2&&f2()}else{f.n++;if(f.n>=3){f.until=Date.now()+30000;f.n=0;$('#pinmsg').textContent='Too many tries. Wait 30 seconds.'}else $('#pinmsg').textContent='Wrong PIN';put('pinfail',f);entry=''}}
 else if(entry.length<8)entry+=k;$('#pinshow').textContent='•'.repeat(entry.length)}
document.addEventListener('keydown',e=>{if(!$('#lock').classList.contains('show'))return;if(/^\d$/.test(e.key))pinKey(e.key);else if(e.key==='Enter')pinKey('✓');else if(e.key==='Backspace')pinKey('C')});
$('#lockx').onclick=()=>{afterPin=null;$('#lock').classList.remove('show')};
$('#forgot').onclick=()=>{if(confirm('Forgot PIN: this removes the grown-up PIN. Mum and messages stay. Continue?')){localStorage.removeItem('cbk_pin');localStorage.removeItem('cbk_pinfail');$('#lock').classList.remove('show');openSet()}};
function setUI(){const on=!!pinRec();$('#pinstate').textContent=on?'PIN is ON':'PIN is OFF';$('#pinon').style.display=on?'none':'';$('#pinchg').style.display=$('#pinoff').style.display=$('#pcur').style.display=on?'':'none';$('#p1').value=$('#p2').value=$('#pcur').value='';mumUI()}
function openSet(){setUI();drawQR();$('#setmsg').textContent='';$('#mumin').value=mum()||'';$('#set').classList.add('show')}
const valid=()=>{const a=$('#p1').value,b=$('#p2').value;if(!/^\d{4,8}$/.test(a)){$('#setmsg').textContent='PIN must be 4 to 8 digits';return null}if(a!==b){$('#setmsg').textContent='The two PINs do not match';return null}return a};
$('#gear').onclick=()=>grownUp();$('#setx').onclick=()=>{stopScan();$('#set').classList.remove('show')};
$('#pinon').onclick=async()=>{const p=valid();if(!p)return;await setPin(p);setUI();$('#setmsg').textContent='PIN is on'};
$('#pinchg').onclick=async()=>{if(!await checkPin($('#pcur').value)){$('#setmsg').textContent='Current PIN is wrong';return}const p=valid();if(!p)return;await setPin(p);setUI();$('#setmsg').textContent='PIN changed'};
$('#pinoff').onclick=async()=>{if(!await checkPin($('#pcur').value)){$('#setmsg').textContent='Current PIN is wrong';return}localStorage.removeItem('cbk_pin');setUI();$('#setmsg').textContent='PIN is off'};
function saveMum(v){const m=norm(v)||isPhone(v);if(!m){$('#setmsg').textContent='That is not a CB number or phone number';return false}if(m===me){$('#setmsg').textContent='That is this phone\'s own number';return false}
 put('mum',m);mumUI();$('#mumin').value=m;$('#setmsg').textContent='Mum is saved';draw();if(norm(m)&&ready)link(m);return true}
$('#mumsave').onclick=()=>saveMum($('#mumin').value);
let scanS=null,scanT=null;function stopScan(){clearInterval(scanT);if(scanS){scanS.getTracks().forEach(t=>t.stop());scanS=null}$('#sv').style.display='none'}
$('#scan').onclick=async()=>{if(!('BarcodeDetector'in window)){$('#setmsg').textContent='This browser cannot scan here. Open the camera app, scan Mum\'s QR, then paste her link or type her number below.';$('#mumin').focus();return}
 try{scanS=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})}catch(e){if(inFrame)showFull();$('#setmsg').textContent='Camera blocked. Type Mum\'s number below.';return}
 const v=$('#sv');v.srcObject=scanS;v.style.display='block';await v.play().catch(()=>{});const bd=new BarcodeDetector({formats:['qr_code']});
 scanT=setInterval(async()=>{try{const r=await bd.detect(v);if(r[0]&&saveMum(r[0].rawValue))stopScan()}catch(e){}},400)};
// opening Mum's link: offer to save her (grown-up only)
const q=new URLSearchParams(location.search).get('add')||(location.hash.match(/add=([^&]+)/)||[])[1];
const qn=q&&norm(q);if(qn&&qn!==me&&!mum()){put('pendingMum',qn)}
start();draw();setSt();mumUI();
if(get('pendingMum')&&!mum()){const pm=get('pendingMum');grownUp('Grown-up: save '+pm+' as Mum');const o=openSet;afterPin=()=>{o();$('#mumin').value=pm};if(!pinRec())$('#mumin').value=pm;localStorage.removeItem('cbk_pendingMum')}
setInterval(()=>{const n=norm(mum());if(ready&&n&&!(conns[n]&&conns[n].open))link(n)},20000);
const ac=setInterval(()=>{if(!ready)return;clearInterval(ac);const n=norm(mum());if(n)link(n)},300);
if(inFrame)showFull();
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__kids={pinKey,setPin,saveMum,me:()=>me,ready:()=>ready,sirenOn,sirenOff,siren:()=>sir,msgs:()=>msgs,toMum};
