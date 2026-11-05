/* Coffeebreak WifiPhone extras: share sheet, file sending, mobile fixes */
(function(){
const $=s=>document.querySelector(s);
const st=document.createElement('style');st.textContent=`
html,body{height:100%;height:100dvh}body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
input,textarea,select{font-size:16px!important}
button{min-height:44px;touch-action:manipulation}
#cbplus{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:calc(84px + env(safe-area-inset-bottom));z-index:30;display:flex;flex-direction:column;gap:8px}
#cbplus button{border:0;border-radius:24px;padding:10px 14px;background:#4a2c1a;color:#fff7ea;font-weight:700;box-shadow:0 2px 8px #0006;font-size:14px}
#cbsheet{position:fixed;inset:0;background:#0008;z-index:40;display:none;align-items:flex-end;justify-content:center}
#cbsheet .in{background:#fff7ea;color:#4a2c1a;width:100%;max-width:480px;border-radius:18px 18px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom));text-align:center;font-family:system-ui}
#cbsheet .in button{width:100%;margin:6px 0;border:0;border-radius:12px;padding:12px;background:#4a2c1a;color:#fff7ea;font-size:16px}
#cbqr{display:inline-block;margin:8px;background:#fff;padding:8px}
#cbnote{font-size:13px;opacity:.8}`;document.head.appendChild(st);
const me=()=>{try{return window.__cb&&window.__cb.me}catch(e){return''}};
const url=()=>location.href.split('#')[0];
const box=document.createElement('div');box.id='cbplus';box.innerHTML='<button id="cbshare">Share (AirDrop on Apple devices)</button><button id="cbsend">Send photo or file</button>';
const sh=document.createElement('div');sh.id='cbsheet';sh.innerHTML='<div class="in"><h3 id="cbtitle">Share</h3><div id="cbbody"></div><div id="cbnote"></div><button id="cbclose">Close</button></div>';
function open(t,html,note){$('#cbtitle').textContent=t;$('#cbbody').innerHTML=html;$('#cbnote').textContent=note||'';sh.style.display='flex'}
function close(){sh.style.display='none'}
function pick(cb){const i=document.createElement('input');i.type='file';i.accept='image/*,video/*,audio/*,application/pdf,*/*';i.onchange=()=>i.files[0]&&cb(i.files[0]);i.click()}
const txt=()=>'Call me on Coffeebreak WifiPhone, app-to-app over wifi or data. My phone ID is '+me();
async function doShare(file){
 const data={title:'Coffeebreak WifiPhone',text:txt(),url:url()};
 if(file&&navigator.canShare&&navigator.canShare({files:[file]}))data.files=[file];
 if(navigator.share){try{await navigator.share(data);close();return}catch(e){if(e.name==='AbortError')return}}
 try{await navigator.clipboard.writeText(txt()+' '+url())}catch(e){}
 const lk=url().split('?')[0]+'?add='+me();open('Share link','<div id="cbqr"></div><div>Phone ID: <b>'+me()+'</b></div>','Scan the code with the other phone, or tap the big link.');
 try{new QRCode($('#cbqr'),{text:lk,width:180,height:180})}catch(e){$('#cbqr').textContent=''}
 try{$('#cbbody').appendChild(CBQL.make(lk,{label:'QR not working? Tap this link instead',text:'Tap here to open my phone'}))}catch(e){}}
function shareMenu(){
 open('Share (AirDrop on Apple devices)','<div>Your phone ID: <b style="font-size:22px">'+me()+'</b></div><button id="cbsl">Share app link and my ID</button><button id="cbsf">Share a photo or file</button>',navigator.share?'On iPhone and Mac, pick AirDrop in the share sheet.':'This browser has no share sheet. You will get a link and QR code instead.');
 $('#cbsl').onclick=()=>doShare();$('#cbsf').onclick=()=>pick(f=>doShare(f))}
// file sending over the PeerJS data link
const CH=48000;
function sendFile(to,f){if(f.size>25e6)return alert('Files up to 25 MB please');const r=new FileReader();r.onload=()=>{const b=r.result,id=Date.now()+''+Math.random().toString(36).slice(2,6),n=Math.ceil(b.length/CH);
 for(let k=0;k<n;k++)window.__cb.sendRaw(to,{type:'cbfile',id,k,n,name:f.name,mime:f.type,from:me(),d:b.slice(k*CH,(k+1)*CH)});
 open('Sending','<div>'+f.name+' sent to <b>'+to+'</b></div>','It arrives when they are online with the app open.')};r.readAsDataURL(f)}
const parts={};
window.cbFile=function(d){const p=parts[d.id]=parts[d.id]||{c:[],got:0};if(p.c[d.k]==null){p.c[d.k]=d.d;p.got++}
 if(p.got===d.n){const u=p.c.join('');delete parts[d.id];const img=/^image\//.test(d.mime)?'<img src="'+u+'" style="max-width:100%;max-height:45vh;border-radius:10px">':'';
  open('File from '+(d.from||'a contact'),img+'<div>'+String(d.name).replace(/</g,'&lt;')+'</div><a id="cbdl" download></a><button id="cbsave">Save</button>','');
  const a=$('#cbdl');a.href=u;a.download=d.name||'file';$('#cbsave').onclick=()=>a.click()}};
function sendMenu(){const cur=$('#call')&&getComputedStyle($('#call')).display!=='none'&&($('#cwho').dataset.num||'');
 open('Send photo or file','<input id="cbto" placeholder="Their phone ID" inputmode="text" style="width:100%;padding:10px;border-radius:10px;border:1px solid #4a2c1a;box-sizing:border-box" value="'+(window.cbLastPeer||'')+'"><button id="cbpick">Choose photo or file</button>','Sent directly to their app over wifi or data. Not a phone network.');
 $('#cbpick').onclick=()=>{const to=$('#cbto').value.trim();if(!to)return alert('Type their phone ID');pick(f=>sendFile(to,f))}}
// iOS audio unlock + ring tone context
let AC;function unlock(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume();const o=AC.createBuffer(1,1,22050),s=AC.createBufferSource();s.buffer=o;s.connect(AC.destination);s.start(0)}catch(e){}
 document.querySelectorAll('audio,video').forEach(m=>{m.setAttribute('playsinline','');m.setAttribute('webkit-playsinline','')});const rv=$('#rv');if(rv&&rv.srcObject)rv.play().catch(()=>{})}
window.cbAudioCtx=()=>AC;
['touchstart','pointerdown','click'].forEach(e=>document.addEventListener(e,unlock,{passive:true}));
// keep remote audio playing on mobile when stream arrives
setInterval(()=>{const rv=$('#rv');if(rv&&rv.srcObject&&rv.paused)rv.play().catch(()=>{})},1500);
// reconnect on wake / network change
function wake(){try{const s=window.__cb.state();if(!s.ready)window.__cb.syncNow()}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});addEventListener('online',wake);addEventListener('pageshow',wake);
try{navigator.connection&&navigator.connection.addEventListener('change',wake)}catch(e){}
function init(){document.body.appendChild(box);document.body.appendChild(sh);$('#cbshare').onclick=shareMenu;$('#cbsend').onclick=sendMenu;$('#cbclose').onclick=close;sh.onclick=e=>{if(e.target===sh)close()}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
/* wake lock during calls + data heartbeat */
(function(){let wl=null;const inCall=()=>{try{return window.__cb.state().cur}catch(e){return false}};
async function upd(){try{if(inCall()&&!document.hidden){if(!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request('screen');wl.addEventListener('release',()=>{wl=null})}}else if(wl){wl.release();wl=null}}catch(e){}}
setInterval(upd,3000);document.addEventListener('visibilitychange',upd);
setInterval(()=>{try{if(window.cbLastPeer&&inCall())window.__cb.sendRaw(window.cbLastPeer,{type:'cbping',t:Date.now()})}catch(e){}},15000);
setInterval(()=>{try{if(!window.__cb.state().ready)window.__cb.syncNow()}catch(e){}},20000);})();
