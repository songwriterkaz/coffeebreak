/* Coffeebreak: big tappable link to sit beside or under any QR code. Plain link plus a guarded Copy button. No alerts. */
(function(){
if(window.CBQL)return;
var css='.cbql{display:block;box-sizing:border-box;width:100%;max-width:340px;margin:12px auto;padding:12px 12px 14px;background:#fff7ea;color:#4a2c1a;border:3px solid #4a2c1a;border-radius:16px;text-align:center;font-family:system-ui,sans-serif;line-height:1.3;position:relative;z-index:2}'+
'.cbql *{box-sizing:border-box}.cbql .cbql-l{font-size:15px;font-weight:700;margin:0 0 6px}'+
'.cbql a.cbql-a{display:block;font-size:22px;font-weight:800;color:#0b3fb3;background:#fff;border:2px solid #0b3fb3;border-radius:12px;padding:14px 10px;text-decoration:underline;overflow-wrap:break-word;min-height:56px;-webkit-tap-highlight-color:rgba(11,63,179,.2)}'+
'.cbql .cbql-u{font-size:13px;opacity:.85;margin:6px 0 0;word-break:break-all;user-select:all;-webkit-user-select:all}'+
'.cbql button.cbql-b{display:block;width:100%;min-height:54px;margin:10px 0 0;border:0;border-radius:14px;font-size:20px;font-weight:800;background:#4a2c1a;color:#fff7ea;touch-action:manipulation}'+
'.cbql .cbql-m{min-height:20px;font-size:15px;font-weight:700;margin:6px 0 0}';
function addCss(){if(document.getElementById('cbql-css'))return;var s=document.createElement('style');s.id='cbql-css';s.textContent=css;(document.head||document.documentElement).appendChild(s)}
function copy(t){
 return new Promise(function(res){
  function legacy(){
   try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,t.length);var ok=false;try{ok=document.execCommand('copy')}catch(e){}document.body.removeChild(ta);res(!!ok)}catch(e){res(false)}}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){res(true)},legacy)}else legacy()}catch(e){legacy()}
 })}
function make(url,o){
 o=o||{};addCss();
 var d=document.createElement('div');d.className='cbql';
 var l=document.createElement('p');l.className='cbql-l';l.textContent=o.label||'QR not working? Tap this link instead';d.appendChild(l);
 var a=document.createElement('a');a.className='cbql-a';a.target='_blank';a.rel='noopener';a.href=url;a.textContent=o.text||'Tap here to open';d.appendChild(a);
 var u=document.createElement('p');u.className='cbql-u';u.textContent=url;d.appendChild(u);
 var b=document.createElement('button');b.type='button';b.className='cbql-b';b.textContent='Copy link';d.appendChild(b);
 var m=document.createElement('p');m.className='cbql-m';m.setAttribute('role','status');m.setAttribute('aria-live','polite');d.appendChild(m);
 b.addEventListener('click',function(){var cur=a.href;copy(cur).then(function(ok){m.textContent=ok?'Link copied':'Could not copy. Press and hold the link above, then choose Copy link.'})});
 d.cbqlSet=function(nu){a.href=nu;u.textContent=nu;m.textContent=''};
 return d}
function after(el,url,o){if(!el||!el.parentNode)return null;var d=make(url,o);el.parentNode.insertBefore(d,el.nextSibling);return d}
window.CBQL={make:make,after:after,copy:copy};
})();

/* Coffeebreak app-to-app calling (wifi or data). Free: PeerJS cloud + public STUN/TURN. Not a phone network. */
(function(){
if(window.__cbcall)return;window.__cbcall=1;
const PFX='cbwp-';let LS;try{LS=localStorage;LS.getItem('x')}catch(e){const mem={};LS={getItem:k=>mem[k]===undefined?null:mem[k],setItem:(k,v)=>{mem[k]=String(v)}}}let me=LS.getItem('cbwp_id');if(!me){me=String(100000+Math.floor(Math.random()*900000));try{LS.setItem('cbwp_id',me)}catch(e){}}
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}]};
const IN_FRAME=(()=>{try{return top!==self}catch(e){return true}})();
const css=`#cbc{position:fixed;inset:0;z-index:9999;background:#fff7ea;color:#4a2c1a;font-family:system-ui,sans-serif;display:none;flex-direction:column;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px calc(12px + env(safe-area-inset-bottom));box-sizing:border-box;overflow:auto;height:100dvh}
#cbc.on{display:flex}#cbc *{box-sizing:border-box}#cbc img.lg{width:64px;height:64px;border-radius:50%;object-fit:cover}
#cbc .id{font-size:40px;font-weight:800;letter-spacing:3px}#cbc .sm{font-size:14px;opacity:.8;text-align:center}
#cbc input{font-size:30px!important;text-align:center;width:100%;max-width:340px;padding:10px;border-radius:14px;border:2px solid #4a2c1a}
#cbc .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;max-width:340px}
#cbc button{min-height:54px;border:0;border-radius:16px;font-size:22px;font-weight:700;background:#4a2c1a;color:#fff7ea;touch-action:manipulation}
#cbc .row{display:flex;gap:8px;width:100%;max-width:340px}#cbc .row button{flex:1}
#cbc .go{background:#1d9a4b}#cbc .no{background:#c4002f}#cbc .lt{background:#e9dccb;color:#4a2c1a;font-size:16px}
#cbc video{width:100%;max-width:340px;border-radius:14px;background:#000;display:none}#cbc #cbst{font-weight:700}
#cbopen{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(66px + env(safe-area-inset-bottom));z-index:9998;border:0;border-radius:30px;padding:14px 22px;font-size:20px;font-weight:800;background:#1d9a4b;color:#fff;box-shadow:0 3px 10px #0006}
#cbqr{background:#fff;padding:8px;display:inline-block}#cbextra .cbql{color:#4a2c1a}body.cbs-grown #cbc{padding-bottom:calc(130px + env(safe-area-inset-bottom))}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const logo=(document.querySelector('img[src*="logo"]')||{}).src||'logo.png';
const el=document.createElement('div');el.id='cbc';el.innerHTML=`<img class="lg" src="${logo}" alt="Coffeebreak logo"><div class="sm">App-to-app calls over wifi or data. Not a phone network.</div>
<div class="sm">My phone ID</div><div class="id" id="cbme"></div><div id="cbst" class="sm">Connecting...</div>
<div id="cbdial" style="display:contents"><input id="cbnum" inputmode="numeric" placeholder="Their ID" maxlength="6"><div class="pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'C'].map(k=>`<button class="lt" data-k="${k}" style="font-size:24px">${k}</button>`).join('')}</div>
<div class="row"><button class="go" id="cbcall">Call</button><button class="go" id="cbvid">Video</button></div></div>
<div id="cbin" style="display:none;width:100%;max-width:340px;text-align:center"><div class="id" style="font-size:26px" id="cbwho"></div><div class="row"><button class="go" id="cbans">Answer</button><button class="no" id="cbdec">Decline</button></div></div>
<video id="cbrv" autoplay playsinline></video><video id="cblv" autoplay playsinline muted style="max-width:120px"></video>
<div id="cbinc" style="display:none;width:100%;max-width:340px"><div class="row"><button class="lt" id="cbmute">Mute</button><button class="lt" id="cbspk">Speaker</button><button class="lt" id="cbfile">Send file</button></div><div class="row" style="margin-top:8px"><button class="no" id="cbhang">Hang up</button></div></div>
<div class="row"><button class="lt" id="cbshare">Share (AirDrop on Apple devices)</button></div>
<div class="row"><button class="lt" id="cbfull" style="display:${IN_FRAME?'':'none'}">Open full screen</button><button class="lt" id="cbx">Close</button></div><div id="cbextra" class="sm"></div>`;
const $=s=>el.querySelector(s);
function mount(){document.body.appendChild(el);const ob=document.createElement('button');ob.id='cbopen';ob.textContent='📞 App call';ob.onclick=()=>show(true);document.body.appendChild(ob);$('#cbme').textContent=me;bind();start();let cq=null;try{cq=new URLSearchParams(location.search).get('call')}catch(e){}if(cq&&/^\d{6}$/.test(cq)&&cq!==me){$('#cbnum').value=cq;status('Press Call to ring '+cq);setTimeout(()=>{if(!document.body.classList.contains('cbs-simple'))show(true)},700)}else if(window.CBCALL_OPEN!==false)show(true)}
function show(v){el.classList.toggle('on',v)}
let peer,cur=null,stream=null,ready=false,back=1000,conns={},AC,ringI=null,wl=null,redial=0,lastTo='';
function status(t){$('#cbst').textContent=t}
function start(){try{peer&&peer.destroy()}catch(e){}peer=new Peer(PFX+me,{config:ICE});
 peer.on('open',()=>{ready=true;back=1000;status(cur?$('#cbst').textContent:'Ready')});
 peer.on('disconnected',()=>{ready=false;status(cur?'Reconnecting...':'Reconnecting...');retry()});
 peer.on('close',()=>{ready=false;retry()});
 peer.on('error',e=>{if(e.type==='unavailable-id'){status('Open in one tab only')}else if(e.type==='peer-unavailable'){if(cur&&!cur._up){status('They are not online right now');end(false)}}else{ready=false;retry()}});
 peer.on('call',incoming);peer.on('connection',wire)}
let rt=null;function retry(){if(rt)return;rt=setTimeout(()=>{rt=null;if(ready)return;try{if(peer&&!peer.destroyed&&peer.disconnected)peer.reconnect();else start()}catch(e){start()}back=Math.min(back*2,30000);setTimeout(()=>{if(!ready)retry()},4000)},back)}
function wake(){if(!ready)retry()}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();lock()});addEventListener('online',wake);addEventListener('pageshow',wake);try{navigator.connection.addEventListener('change',wake)}catch(e){}
function unlock(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.state!=='running'&&AC.resume()}catch(e){}const rv=$('#cbrv');rv&&rv.srcObject&&rv.paused&&rv.play().catch(()=>{})}
['touchstart','pointerdown','click'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
function ring(on){clearInterval(ringI);ringI=null;if(!on)return;const beep=()=>{try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=480;g.gain.value=.2;o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+.8)}catch(e){}navigator.vibrate&&navigator.vibrate(600)};beep();ringI=setInterval(beep,2000)}
async function lock(){try{if(cur&&!document.hidden&&navigator.wakeLock&&!wl){wl=await navigator.wakeLock.request('screen');wl.onrelease=()=>wl=null}else if(!cur&&wl){wl.release();wl=null}}catch(e){}}
async function media(v){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('nomedia');for(const c of v?[{audio:true,video:{facingMode:'user'}},{audio:true}]:[{audio:true}]){try{return await navigator.mediaDevices.getUserMedia(c)}catch(e){}}throw new Error('denied')}
function mic_fail(){status(IN_FRAME?'Microphone blocked here. Tap Open full screen.':'Allow the microphone, then try again')}
function ui(mode){$('#cbdial').style.display=mode==='idle'?'contents':'none';$('#cbin').style.display=mode==='ring'?'block':'none';$('#cbinc').style.display=mode==='call'?'block':'none';if(mode==='idle'){$('#cbrv').style.display='none';$('#cblv').style.display='none'}}
async function call(to,video){to=String(to||'').replace(/\D/g,'');if(to.length<6)return status('Type a 6 digit ID');if(to===me)return status('That is your own ID');if(!ready)return status('Not connected yet, try again in a moment');
 try{stream=await media(video)}catch(e){return mic_fail()}lastTo=to;redial=0;status('Calling '+to+'...');ui('call');$('#cblv').srcObject=stream;$('#cblv').style.display=video?'':'none';
 const c=peer.call(PFX+to,stream,{metadata:{video}});c._out=1;hook(c,video);setTimeout(()=>{if(cur===c&&!c._up){status('No answer');end(true)}},40000)}
function hook(c,video){cur=c;lock();c.on('stream',r=>{c._up=1;const rv=$('#cbrv');rv.srcObject=r;rv.style.display=video?'':'none';rv.play().catch(()=>{});status('Connected')});
 c.on('close',()=>{if(!c._replaced&&cur===c){status('Call ended');end(false)}});c.on('error',()=>{});
 const w=()=>{const pc=c.peerConnection;if(!pc||pc._w)return;pc._w=1;pc.addEventListener('iceconnectionstatechange',()=>{if(cur!==c)return;const s=pc.iceConnectionState;
  if(s==='disconnected'){status('Reconnecting...');try{pc.restartIce&&pc.restartIce()}catch(e){}}else if(s==='connected'||s==='completed'){if(c._up)status('Connected')}
  else if(s==='failed'){status('Reconnecting...');if(c._out&&redial<3&&ready){redial++;const n=peer.call(c.peer,stream,{metadata:c.metadata});n._out=1;c._replaced=1;try{c.close()}catch(e){}hook(n,video)}}})};setTimeout(w,0);c.on('stream',w)}
function incoming(c){const video=!!(c.metadata&&c.metadata.video),from=c.peer.slice(PFX.length);
 if(cur){if(cur.peer===c.peer&&stream&&cur._up!==undefined){const o=cur;o._replaced=1;c.answer(stream);hook(c,video);try{o.close()}catch(e){}return}c.close();return}
 cur=c;show(true);ui('ring');$('#cbwho').textContent=(video?'Video call from ':'Call from ')+from;status('Incoming call');ring(true);lastTo=from;
 $('#cbans').onclick=async()=>{ring(false);try{stream=await media(video)}catch(e){mic_fail();stream=new MediaStream()}$('#cblv').srcObject=stream;$('#cblv').style.display=video?'':'none';ui('call');c.answer(stream);hook(c,video);status('Connecting...')};
 $('#cbdec').onclick=()=>{ring(false);try{c.close()}catch(e){}cur=null;ui('idle');status('Ready')};c.on('close',()=>{if(cur===c&&!c._up){ring(false);cur=null;ui('idle');status('Missed call from '+from)}})}
function end(close){ring(false);const c=cur;cur=null;if(close&&c)try{c.close()}catch(e){}if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;ui('idle');lock()}
// data: files + heartbeat
const parts={};function wire(c){c.on('data',d=>{if(!d||typeof d!=='object')return;if(d.t==='ping')return;if(d.t==='file'){const p=parts[d.id]=parts[d.id]||{c:[],n:0};if(p.c[d.k]==null){p.c[d.k]=d.d;p.n++}if(p.n===d.of){const u=p.c.join('');delete parts[d.id];got(d.name,d.mime,u,c.peer.slice(PFX.length))}}})}
function got(name,mime,u,from){const x=$('#cbextra');x.innerHTML='File from '+from+': ';const a=document.createElement('a');a.href=u;a.download=name||'file';a.textContent=String(name);x.appendChild(a);if(/^image\//.test(mime)){const i=document.createElement('img');i.src=u;i.style.cssText='max-width:100%;max-height:40vh;border-radius:10px;display:block;margin:6px auto';x.appendChild(i)}show(true)}
function dc(to,cb){const k=PFX+to;if(conns[k]&&conns[k].open)return cb(conns[k]);const c=peer.connect(k,{reliable:true,serialization:'json'});conns[k]=c;wire(c);c.on('open',()=>cb(c));c.on('close',()=>delete conns[k])}
setInterval(()=>{if(cur&&lastTo&&ready)dc(lastTo,c=>c.send({t:'ping'}))},15000);
function pick(cb){const i=document.createElement('input');i.type='file';i.onchange=()=>i.files[0]&&cb(i.files[0]);i.click()}
function sendFile(){const to=(lastTo||$('#cbnum').value).replace(/\D/g,'');if(to.length<6)return status('Type their ID first');pick(f=>{if(f.size>25e6)return status('Files up to 25 MB');const r=new FileReader();r.onload=()=>{const b=r.result,id=Date.now().toString(36),CH=48000,of=Math.ceil(b.length/CH);dc(to,c=>{for(let k=0;k<of;k++)c.send({t:'file',id,k,of,name:f.name,mime:f.type,d:b.slice(k*CH,(k+1)*CH)});status('Sent '+f.name)})};r.readAsDataURL(f)})}
const url=()=>location.href.split('#')[0],plink=()=>location.href.split('#')[0].split('?')[0]+'?call='+me,txt=()=>'Call me app-to-app on Coffeebreak WifiPhone. My phone ID is '+me;
async function share(file){const d={title:'Coffeebreak WifiPhone',text:txt(),url:url()};if(file&&navigator.canShare&&navigator.canShare({files:[file]}))d.files=[file];
 if(navigator.share){try{await navigator.share(d);return}catch(e){if(e.name==='AbortError')return}}try{await navigator.clipboard.writeText(txt()+' '+url())}catch(e){}
 const x=$('#cbextra');showLink()}
function showLink(){const x=$('#cbextra');x.innerHTML='Scan this on the other phone, or use the link below.<br><div id="cbqr"></div>';try{new QRCode(x.querySelector('#cbqr'),{text:plink(),width:170,height:170})}catch(e){const q=x.querySelector('#cbqr');if(q)q.remove()}x.appendChild(CBQL.make(plink(),{label:'QR not working? Tap this link instead',text:'Tap here to open my phone'}))}
function bind(){el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const i=$('#cbnum'),k=b.dataset.k;i.value=k==='⌫'?i.value.slice(0,-1):k==='C'?'':(i.value+k).slice(0,6)});
 $('#cbcall').onclick=()=>call($('#cbnum').value,false);$('#cbvid').onclick=()=>call($('#cbnum').value,true);$('#cbhang').onclick=()=>{status('Call ended');end(true)};
 $('#cbmute').onclick=()=>{if(!stream)return;const a=stream.getAudioTracks();const m=a.length&&a[0].enabled;a.forEach(t=>t.enabled=!m);$('#cbmute').textContent=m?'Unmute':'Mute'};
 $('#cbspk').onclick=async()=>{const rv=$('#cbrv');rv.muted=false;rv.volume=1;try{if(rv.setSinkId&&navigator.mediaDevices.selectAudioOutput){const d=await navigator.mediaDevices.selectAudioOutput();await rv.setSinkId(d.deviceId)}}catch(e){}rv.play().catch(()=>{});$('#cbspk').textContent='Speaker on'};
 $('#cbfile').onclick=sendFile;$('#cbshare').onclick=()=>{const x=$('#cbextra');x.innerHTML='';const a=document.createElement('button');a.className='lt';a.textContent='Share link and my ID';a.onclick=()=>share();const b=document.createElement('button');b.className='lt';b.textContent='Share a photo or file';b.onclick=()=>pick(f=>share(f));const c=document.createElement('button');c.className='lt';c.textContent='Show link and QR code';c.onclick=()=>showLink();const r=document.createElement('div');r.className='row';r.append(a,b);x.appendChild(r);const r2=document.createElement('div');r2.className='row';r2.style.marginTop='8px';r2.append(c);x.appendChild(r2)};
 $('#cbfull').onclick=()=>window.open(url(),'_blank');$('#cbx').onclick=()=>show(false)}
window.cbcall={me:()=>me,call,state:()=>({ready,inCall:!!cur,up:!!(cur&&cur._up)}),show,start};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',mount):mount();
})();
/* Projector / TV */
(function(){function add(){const el=document.getElementById('cbc');if(!el||document.getElementById('cbproj'))return setTimeout(add,500);
const r=document.createElement('div');r.className='row';r.innerHTML='<button class="lt" id="cbproj">Projector / TV</button>';el.querySelector('#cbshare').parentNode.after(r);
el.querySelectorAll('video').forEach(v=>{v.setAttribute('x-webkit-airplay','allow');v.disablePictureInPicture=false});
const say=t=>{const x=document.getElementById('cbextra');x.textContent=t};
function vid(){const rv=document.getElementById('cbrv');if(rv&&rv.srcObject)return rv;return [...document.querySelectorAll('video')].find(v=>v.src||v.srcObject)}
function projMode(){const v=vid(),img=document.querySelector('#cbextra img');const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:#000;color:#fff;z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column';
 if(v){const c=document.createElement('video');c.autoplay=true;c.playsInline=true;c.muted=true;c.srcObject=v.srcObject||null;if(v.src)c.src=v.src;c.style.cssText='max-width:100%;max-height:90vh';o.appendChild(c)}else if(img){const i=img.cloneNode();i.style.cssText='max-width:100%;max-height:90vh';o.appendChild(i)}else{o.innerHTML='<div style="font-size:9vw;font-weight:800;text-align:center">'+document.getElementById('cbme').textContent+'<div style="font-size:4vw">Coffeebreak WifiPhone ID</div></div>'}
 const b=document.createElement('button');b.textContent='Close projector mode';b.style.cssText='margin-top:12px;font-size:22px;padding:12px 20px;border-radius:14px;border:0';b.onclick=()=>{document.exitFullscreen&&document.fullscreenElement&&document.exitFullscreen();o.remove()};o.appendChild(b);document.body.appendChild(o);try{(o.requestFullscreen||o.webkitRequestFullscreen).call(o)}catch(e){}}
document.getElementById('cbproj').onclick=async()=>{const v=vid();
 if(v&&v.webkitShowPlaybackTargetPicker){try{v.webkitShowPlaybackTargetPicker();say('Pick your Apple TV or AirPlay projector.');return}catch(e){}}
 if(v&&v.remote&&v.remote.prompt){try{await v.remote.prompt();say('Sending to your TV or projector.');return}catch(e){}}
 if(window.PresentationRequest){try{const pr=new PresentationRequest([location.href.split('#')[0]]);await pr.start();say('Showing on the second screen.');return}catch(e){}}
 projMode();say('Projector mode is on. With a cable or HDMI adapter, or screen mirroring (AirPlay, Miracast or Cast from your phone settings), this shows on the projector.')}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',add):add()})();
