/* Coffeebreak "Add phone nearby" (AirDrop style connect flow). Reusable, no dependencies except optional
   qrcode.min.js (QR), jsqr.js (scanner fallback) and PeerJS (pairing code).
   Coffeebreak keeps all rights to its products, designs, apps, name and logo. */
(function(){
'use strict';
const D=document,S=s=>D.querySelector(s);
let H=null,ui={},scanStream=null,scanLoop=0,pairPeer=null,pairT=null,joinedQ=[];
const LS={g:(k,d)=>{try{const v=localStorage.getItem('cbn.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},s:(k,v)=>{try{localStorage.setItem('cbn.'+k,JSON.stringify(v))}catch(e){}}};
const digits=s=>String(s||'').replace(/\D/g,'');
const dash=s=>{const d=digits(s).slice(-8);return d.length==8?d.slice(0,4)+'-'+d.slice(4):null};
const el=(t,a,k)=>{const e=D.createElement(t);Object.assign(e,a||{});(k||[]).forEach(x=>e.append(x));return e};
function toast(m){if(H&&H.toast)return H.toast(m);let t=S('#cbn-toast');if(!t){t=el('div',{id:'cbn-toast'});D.body.append(t)}t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',3500)}
const myNum=()=>dash(H.getNumber());
const mineName=()=>String((H.getName&&H.getName())||'').slice(0,40);
function baseLink(){const s=LS.g('applink','')||(typeof H.appLink=='function'?H.appLink():H.appLink);if(s)return s;
 const itch=/itch\.zone|itch\.io|hwcdn/.test(location.hostname);if(/^https?:$/.test(location.protocol)&&!itch)return location.origin+location.pathname;return H.itchPage||'https://coffeebreaks.itch.io'}
const addLink=w=>{const n=mineName();return baseLink().split('#')[0].split('?')[0]+'#add='+myNum()+(w&&n&&n!='Coffeebreak friend'?'&n='+encodeURIComponent(n):'')};
const shareText=()=>'Add me on '+H.appName+'. My number is '+myNum()+'. Open the link on your phone and I will be added to your contacts automatically.';
const markInvite=()=>LS.s('inv',Date.now()),inviteOn=()=>Date.now()-LS.g('inv',0)<864e5;
function parseAdd(s){s=String(s||'').trim();let m=/[#?&]add=(?:CB-?)?(\d{4}-?\d{4})/i.exec(s);
 if(m){const n=/[#?&]n=([^&#]*)/.exec(s);let nn='';try{nn=n?decodeURIComponent(n[1].replace(/\+/g,' ')):''}catch(e){}return{num:dash(m[1]),name:nn}}
 m=/^\s*(?:CB-?)?(\d{4}[-\s]?\d{4})\s*$/i.exec(s);return m?{num:dash(m[1]),name:''}:null}
function acceptAdd(a){if(!a||!a.num)return false;if(a.num==myNum()){toast('That is my own number');return false}
 let r=H.addContact(a.num,a.name);if(r===true||r==null)r={ok:true,added:true};
 if(!r.ok){toast('That number did not look right');return false}
 toast((r.added?'Added ':'Already have ')+(a.name||a.num)+' to my contacts');if(H.onAdded)try{H.onAdded(a.num,r)}catch(e){}
 sayJoined(a.num);return true}
async function copyText(t){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);return true}}catch(e){}
 try{ui.lnk.value=t;ui.lnk.focus();ui.lnk.select();ui.lnk.setSelectionRange(0,t.length);return D.execCommand('copy')}catch(e){return false}}
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1),isAnd=/Android/i.test(navigator.userAgent);
function osNote(){if(isIOS)return 'iPhone: a web page cannot start AirDrop by itself. The Share button opens the iPhone share sheet, and AirDrop is in that sheet. Tap AirDrop, then the other phone.';
 if(isAnd)return 'Android: the Share button opens the Android share sheet, which includes Nearby Share (Quick Share). Pick the other phone there.';
 return 'iPhone: a web page cannot start AirDrop by itself, but the iPhone share sheet that Share opens includes AirDrop. Android: the share sheet includes Nearby Share (Quick Share).'}
function refresh(){if(!ui.lnk)return;ui.lnk.value=addLink(true);ui.qr.innerHTML='';
 try{new QRCode(ui.qr,{text:addLink(false),width:200,height:200,colorDark:'#3b2417',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M})}catch(e){ui.qr.textContent='QR code needs qrcode.min.js'}
 ui.qrt.textContent=addLink(false);ui.num.textContent=myNum()||''}
/* tell the inviter that I opened their link so they can add me back (needs host support, see README) */
function sayJoined(n){if(!H.joinBack||!H.getPeer)return;joinedQ.push({n,t:0});flushJoined()}
function flushJoined(){if(!joinedQ.length)return;const p=H.getPeer();if(!p||!p.open)return setTimeout(flushJoined,3000);
 const j=joinedQ[0];if(j.t>=3){joinedQ.shift();return flushJoined()}j.t++;let c,done=false;
 const next=ok=>{if(done)return;done=true;try{c&&c.close()}catch(e){}if(ok)joinedQ.shift();setTimeout(flushJoined,ok?0:4000)};
 setTimeout(()=>next(false),8000);try{c=p.connect(H.peerId(j.n));c.on('open',()=>{c.send({type:'joined',num:myNum(),name:mineName()});setTimeout(()=>next(true),800)});c.on('error',()=>next(false))}catch(e){next(false)}}
function onJoined(d){const n=dash(d&&d.num);if(!n||!inviteOn())return false;H.addContact(n,String(d.name||'').slice(0,40));toast((d.name||n)+' opened my link and was added');return true}
/* pairing code */
const pairId=c=>(H.pfx||'')+'pair-'+c;
function stopPair(){clearInterval(pairT);try{pairPeer&&pairPeer.destroy()}catch(e){}pairPeer=null;ui.code.textContent='';ui.pinfo.textContent=''}
function showCode(){stopPair();markInvite();if(!window.Peer)return toast('Pairing needs internet');
 const code=String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000);let p;
 try{p=new Peer(pairId(code),{config:H.iceConfig?H.iceConfig():undefined,debug:0})}catch(e){return toast('Could not start pairing')}
 pairPeer=p;ui.pinfo.textContent='Starting';let exp=0;
 p.on('open',()=>{if(p!==pairPeer)return;ui.code.textContent=code.slice(0,3)+' '+code.slice(3);exp=Date.now()+6e5;
  pairT=setInterval(()=>{const s=Math.max(0,Math.round((exp-Date.now())/1000));ui.pinfo.textContent='Type this code on the other phone. It works for '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'.';if(!s)stopPair()},1000)});
 p.on('connection',c=>c.on('data',d=>{if(d&&d.type=='pair'){const n=dash(d.num);if(!n)return;acceptAdd({num:n,name:String(d.name||'').slice(0,40)});try{c.send({type:'pair-ok',num:myNum(),name:mineName()})}catch(e){}
  setTimeout(()=>{if(pairPeer===p)stopPair()},2000)}}));
 p.on('error',e=>{if(p!==pairPeer)return;if(e.type=='unavailable-id'){stopPair();showCode();return}ui.pinfo.textContent='Could not start the code. Check your internet and try again.'})}
function usePair(){const code=digits(ui.pin.value),res=ui.pres;
 if(code.length!=6){res.textContent='The code has 6 digits.';return}if(!window.Peer){res.textContent='Pairing needs internet.';return}
 const main=H.getPeer&&H.getPeer();let p=main&&main.open?main:null,tmp=false;
 if(!p){try{p=new Peer(undefined,{config:H.iceConfig?H.iceConfig():undefined,debug:0});tmp=true}catch(e){res.textContent='Could not connect.';return}}
 res.textContent='Connecting';let c,done=false,to;
 const fin=t=>{if(done)return;done=true;clearTimeout(to);try{p.off('error',onErr)}catch(e){}try{c&&c.close()}catch(e){}if(tmp)setTimeout(()=>{try{p.destroy()}catch(e){}},1500);if(t)res.textContent=t};
 const onErr=e=>{if(e.type=='peer-unavailable'&&String(e.message||'').indexOf(pairId(code))>-1)fin('No phone is showing that code. Check the code and try again.')};
 p.on('error',onErr);to=setTimeout(()=>fin('Could not reach that phone. Check the code and try the same WiFi.'),12000);
 const go=()=>{try{c=p.connect(pairId(code),{reliable:true})}catch(e){return fin('Could not connect.')}
  c.on('open',()=>c.send({type:'pair',num:myNum(),name:mineName()}));
  c.on('data',d=>{if(d&&d.type=='pair-ok'){const n=dash(d.num);const ok=n&&acceptAdd({num:n,name:String(d.name||'').slice(0,40)});fin(ok?'Paired with '+(d.name||n)+'.':'Paired.')}});
  c.on('error',()=>fin('Could not connect. Try the same WiFi on both phones.'))};
 if(p.open)go();else p.on('open',go)}
/* scanner */
const loadJsQR=()=>new Promise((res,rej)=>{if(window.jsQR)return res();const s=el('script',{src:H.jsqrSrc||'jsqr.js',onload:res,onerror:rej});D.head.append(s)});
async function scanStart(){ui.scan.style.display='block';
 try{scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});ui.sv.srcObject=scanStream;ui.sv.play&&ui.sv.play()}catch(e){scanStop();return toast('Camera needed to scan')}
 let bd=null;try{if(window.BarcodeDetector)bd=new BarcodeDetector({formats:['qr_code']})}catch(e){}
 if(!bd){try{await loadJsQR()}catch(e){scanStop();return toast('Scanner could not load')}}
 const cv=D.createElement('canvas'),x=cv.getContext('2d',{willReadFrequently:true});
 const tick=async()=>{if(!scanStream)return;const v=ui.sv;let txt='';
  if(v.videoWidth){try{if(bd){const r=await bd.detect(v);if(r[0])txt=r[0].rawValue}else{cv.width=v.videoWidth;cv.height=v.videoHeight;x.drawImage(v,0,0);const r=jsQR(x.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);if(r)txt=r.data}}catch(e){}}
  if(txt){const a=parseAdd(txt);if(a){scanStop();acceptAdd(a);return}}
  scanLoop=setTimeout(tick,300)};tick()}
function scanStop(){clearTimeout(scanLoop);if(ui.scan)ui.scan.style.display='none';scanStream&&scanStream.getTracks().forEach(t=>t.stop());scanStream=null}
const CSS='.cbn-open{position:fixed;left:10px;bottom:76px;z-index:9990;background:#e91e63;color:#fff;border:0;border-radius:22px;padding:10px 16px;font:700 14px system-ui,sans-serif;box-shadow:0 2px 8px #0005}'+
'.cbn-sheet{position:fixed;inset:0;background:#fff7f0;z-index:10001;overflow:auto;padding:14px;color:#3b2417;font:15px system-ui,sans-serif;display:none}.cbn-sheet.cbn-in{position:static;display:block;inset:auto;overflow:visible;padding:0}.cbn-sheet.cbn-show{display:block}'+
'.cbn-sheet h2{margin:0 0 6px;font-size:20px}.cbn-sheet h3{margin:14px 0 4px;font-size:16px}.cbn-sheet p,.cbn-sheet .cbn-s{font-size:13px;margin:4px 0;line-height:1.4}'+
'.cbn-sheet button{border:0;border-radius:10px;padding:10px 14px;margin:3px 4px 3px 0;font:700 14px system-ui,sans-serif;background:#e91e63;color:#fff}.cbn-sheet button.g{background:#2e7d32}.cbn-sheet button.b{background:#6d4c41}'+
'.cbn-sheet input{width:100%;box-sizing:border-box;padding:10px;border:1px solid #d7b9a5;border-radius:8px;font-size:15px;margin:3px 0}.cbn-sheet .cbn-qr{display:flex;justify-content:center;padding:8px;background:#fff;border-radius:10px}'+
'.cbn-code{font:700 30px ui-monospace,monospace;letter-spacing:4px;text-align:center;margin:6px 0}#cbn-toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#3b2417;color:#fff;padding:10px 16px;border-radius:12px;z-index:10003;display:none;font:14px system-ui,sans-serif;max-width:90%}'+
'.cbn-scan{position:fixed;inset:0;background:#000;z-index:10002;display:none}.cbn-scan video{width:100%;height:100%;object-fit:cover}.cbn-scan button{position:absolute;top:14px;right:14px}';
function build(){const st=el('style');st.textContent=CSS;D.head.append(st);
 const sheet=el('div',{className:'cbn-sheet',id:'cbn-sheet'});
 const mk=(t,c,f)=>{const b=el('button',{textContent:t,className:c||''});b.onclick=f;return b};
 ui.num=el('b');ui.lnk=el('input',{readOnly:true});ui.qr=el('div',{className:'cbn-qr'});ui.qrt=el('div',{className:'cbn-s'});ui.qrt.style.wordBreak='break-all';
 ui.note=el('p',{className:'cbn-s',textContent:'Real AirDrop cannot be controlled by a web app. Share uses your phone share sheet, which has AirDrop on iPhone and Nearby Share on Android.'});
 ui.os=el('p',{className:'cbn-s',textContent:osNote()});
 ui.code=el('div',{className:'cbn-code'});ui.pinfo=el('div',{className:'cbn-s'});ui.pin=el('input',{placeholder:'Type 6 digit code from the other phone',inputMode:'numeric',maxLength:8});ui.pres=el('div',{className:'cbn-s'});
 ui.paste=el('input',{placeholder:'Paste a link or type 1234-5678'});
 const share=async()=>{markInvite();const url=addLink(true);
  if(typeof navigator.share=='function'){try{await navigator.share({title:H.appName,text:shareText(),url});toast('Shared. The other phone adds me when it opens the link.');return}catch(e){if(e&&e.name=='AbortError')return}}
  const ok=await copyText(url);ui.lnk.focus();ui.lnk.select();ui.note.textContent='This browser has no share sheet'+(ok?', so the link was copied.':'. Copy the link below and send it yourself.');toast(ok?'No share sheet here. Link copied instead.':'No share sheet here. Copy the link below.')};
 ui.shr=mk('Share with a nearby phone','',share);
 ui.cpy=mk('Copy link','b',async()=>{markInvite();const ok=await copyText(addLink(true));toast(ok?'Link copied':'Copy the link from the box');if(!ok)ui.lnk.select()});
 const sms=mk('SMS','g',()=>{markInvite();location.href='sms:?&body='+encodeURIComponent(shareText()+' '+addLink(true))});
 const wa=mk('WhatsApp','g',()=>{markInvite();window.open('https://wa.me/?text='+encodeURIComponent(shareText()+' '+addLink(true)),'_blank','noopener')});
 ui.scan=el('div',{className:'cbn-scan'});ui.sv=el('video',{playsInline:true,muted:true,autoplay:true});ui.scan.append(ui.sv,mk('Close','b',scanStop));
 sheet.append(el('h2',{textContent:'Add phone nearby'}),el('p',{className:'cbn-s'},[ 'Set up the other phone from this one. My number is ',ui.num,'.']),
  el('h3',{textContent:'1. Share'}),ui.os,ui.shr,ui.cpy,sms,wa,ui.lnk,ui.note,
  el('h3',{textContent:'2. QR code'}),el('p',{className:'cbn-s',textContent:'Scan with the camera on the other phone. It opens the app and adds me automatically.'}),ui.qr,ui.qrt,
  el('h3',{textContent:'3. Pairing code'}),el('p',{className:'cbn-s',textContent:'Open the app on both phones. Show a code on one and type it on the other. Both phones add each other.'}),mk('Show my code','',showCode),ui.code,ui.pinfo,ui.pin,mk('Pair','g',usePair),ui.pres,
  el('h3',{textContent:'4. Paste a link or number, or scan'}),ui.paste,mk('Add','g',()=>{if(acceptAdd(parseAdd(ui.paste.value)))ui.paste.value=''}),mk('Scan a QR code','b',scanStart));
 if(H.mount){const m=typeof H.mount=='string'?S(H.mount):H.mount;sheet.classList.add('cbn-in');m.append(sheet)}
 else{const close=mk('Close','b',()=>sheet.classList.remove('cbn-show'));sheet.prepend(close);D.body.append(sheet);
  const o=el('button',{className:'cbn-open',textContent:'Add phone nearby'});o.onclick=()=>{refresh();sheet.classList.add('cbn-show')};D.body.append(o);ui.open=o;ui.sheet=sheet}
 D.body.append(ui.scan);refresh()}
function handleHash(){const h=location.hash+location.search;if(!/[#?&]add=/.test(h))return;const a=parseAdd(h);
 try{history.replaceState(null,'',location.pathname+(/[?&]add=/.test(location.search)?'':location.search))}catch(e){}acceptAdd(a)}
/* adapter for the Coffeebreak Contacts, One Button, Jumbo and Social phones (they share these globals) */
function familyHost(){return{appName:document.title||'Coffeebreak phone',pfx:PFX,
 getNumber:()=>me,getName:()=>typeof myName=='function'?myName():'',
 addContact:(n,nm)=>{const k=norm(n);if(!k)return{ok:false};if(k===me)return{ok:false,why:'self'};const had=contacts.some(c=>c.num===k);upsert(k,nm||'');return{ok:true,added:!had}},
 getPeer:()=>peer,peerId:n=>pid(norm(n)),joinBack:false,
 iceConfig:()=>peer&&peer.options&&peer.options.config}}
const API={init(h){H=Object.assign({},h);ui={};if(D.readyState=='loading')D.addEventListener('DOMContentLoaded',()=>{build();handleHash()});else{build();handleHash()}
  window.addEventListener('hashchange',handleHash);return API},
 autoInit(extra){const h=familyHost();return API.init(Object.assign(h,extra||{}))},
 parseAdd,addLink,onJoined,refresh,open(){refresh();ui.sheet&&ui.sheet.classList.add('cbn-show')},version:'1'};
window.CBNearby=API})();
