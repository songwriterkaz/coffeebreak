'use strict';
const $=i=>document.getElementById(i);
const PFX='coffeebreak-dsim-v1-',ITCH_PAGE='https://coffeebreaks.itch.io/coffeebreak-oneapp-phone',APP='Coffeebreak One App Phone';
/* ---------- storage (falls back to memory if blocked) ---------- */
const mem={};
const L={g(k,d){try{const v=localStorage.getItem('cbo_'+k);return v==null?d:JSON.parse(v)}catch(e){return k in mem?mem[k]:d}},
 s(k,v){try{localStorage.setItem('cbo_'+k,JSON.stringify(v))}catch(e){mem[k]=v}}};
const esc=s=>String(s).replace(/[&<>"']/g,m=>'&#'+m.charCodeAt(0)+';');
/* ---------- ICE servers: main list, then a longer fallback list ---------- */
const STUN_MAIN=['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478','stun:stun.nextcloud.com:443'];
const STUN_MORE=['stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302','stun:stun4.l.google.com:19302','stun:global.stun.twilio.com:3478','stun:stun.sipgate.net:3478','stun:stun.stunprotocol.org:3478'];
const TURN_FALLBACK=[{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
let iceLevel=0;
function cfg(level){const s=STUN_MAIN.map(u=>({urls:u}));if(level>0){STUN_MORE.forEach(u=>s.push({urls:u}));TURN_FALLBACK.forEach(t=>s.push(t))}return{iceServers:s}}
/* ---------- number, contacts, messages ---------- */
let me=L.g('num');const firstRun=!me;
if(!me){const a=crypto.getRandomValues(new Uint32Array(2));me=(1000+a[0]%9000)+'-'+String(a[1]%1e4).padStart(4,'0');L.s('num',me)}
let C=L.g('c',[]),M=L.g('m',[]),peer=null,cur=null,inc=null,stream=null,walk=L.g('w',0),cid=null,netState='connecting',route='';
document.querySelectorAll('.mn,#mn').forEach(e=>e.textContent=me);
$('myn').value=L.g('name','');$('myn').onchange=e=>{L.s('name',e.target.value.trim());refreshLink()};
const myName=()=>L.g('name','');
const fmtNum=n=>{const d=String(n||'').replace(/\D/g,'');return d.length==8?d.slice(0,4)+'-'+d.slice(4):''};
const pid=n=>PFX+String(n).replace(/\D/g,''),nm=n=>(C.find(c=>c.u==n)||{}).n||n;
let tt;function toast(t,ms){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',ms||4500)}
function banner(t,ok){const b=$('banner');if(!t){b.style.display='none';return}b.className=ok?'ok':'';b.textContent=t;b.style.display='block'}
function tab(n){document.querySelectorAll('.s,nav button').forEach(x=>x.classList.remove('on'));const b=document.querySelector('nav button[data-s="'+n+'"]');b&&b.classList.add('on');$('s'+n).classList.add('on')}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.s));
function saveC(){L.s('c',C)}
function addContact(num,name,src){num=fmtNum(num);if(!num)return{ok:false,why:'bad'};if(num==me)return{ok:false,why:'self'};
 const ex=C.find(c=>c.u==num);if(ex){if(name&&(!ex.n||ex.n=='Friend'))ex.n=name;saveC();draw();return{ok:true,added:false,c:ex}}
 const c={n:(name||'Friend').slice(0,40),u:num,h:'',p:''};C.push(c);saveC();if(!L.g('fav',''))L.s('fav',num);draw();return{ok:true,added:true,c}}
function draw(){const cl=$('cl');cl.innerHTML='';let o='';
 C.slice().sort((a,b)=>a.n.localeCompare(b.n)).forEach(c=>{const i=C.indexOf(c),d=document.createElement('div');d.className='c';
  d.innerHTML='<img src="'+(c.p||'logo.webp')+'" alt=""><span>'+esc(c.n)+'<br><small style="display:inline">'+esc(c.u)+(c.h?' &middot; '+esc(c.h):'')+'</small></span>';
  [['Call','b g',()=>call(c.u,0)],['Video','b',()=>call(c.u,1)],['Msg','b y',()=>{$('to').value=c.u;chat();tab(3)}],['Edit','b y',()=>edit(i)]].forEach(([t,k,f])=>{const b=document.createElement('button');b.className=k;b.textContent=t;b.onclick=f;d.append(b)});
  cl.append(d);o+='<option value="'+esc(c.u)+'">'+esc(c.n)+'</option>'});
 const pf=$('fav').value||L.g('fav','');$('fav').innerHTML=$('to').innerHTML=o||'<option value="">Add a contact first</option>';
 if(C.find(c=>c.u==pf))$('fav').value=pf;chat()}
$('fav').onchange=e=>L.s('fav',e.target.value);$('to').onchange=chat;
function edit(i){cid=i;const c=C[i]||{n:'',u:'',h:'',p:''};$('ed').hidden=false;$('en').value=c.n;$('eu').value=c.u;$('eh').value=c.h||'';$('ep').src=c.p||'logo.webp';$('ex').hidden=i==null}
$('add').onclick=()=>edit(null);$('ec').onclick=()=>$('ed').hidden=true;
$('ef').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image;im.onload=()=>{const k=document.createElement('canvas');k.width=k.height=96;const s=Math.min(im.width,im.height);k.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,96,96);$('ep').src=k.toDataURL('image/jpeg',.7)};im.src=URL.createObjectURL(f)};
$('es').onclick=()=>{const u=fmtNum($('eu').value);if(!u)return toast('The number needs 8 digits, like 1234-5678');
 const c={n:$('en').value.trim()||'Friend',u,h:$('eh').value,p:$('ep').src.startsWith('data:')?$('ep').src:''};cid==null?C.push(c):C[cid]=c;saveC();$('ed').hidden=true;draw()};
$('ex').onclick=()=>{if(confirm('Delete contact?')){C.splice(cid,1);saveC();$('ed').hidden=true;draw()}};
/* ---------- chat with retries and delivery status ---------- */
const stTxt={sending:'sending',sent:'sent',delivered:'delivered',failed:'not delivered, try the same WiFi'};
function chat(){const t=$('to').value;$('log').innerHTML=M.filter(m=>m.w==t).slice(-80).map(m=>'<p style="text-align:'+(m.o?'right':'left')+'">'+esc(m.t)+(m.o&&m.s?' <i>'+stTxt[m.s]+'</i>':'')+'</p>').join('')||'<p>No messages yet</p>';$('log').scrollTop=1e6}
function addM(w,t,o,id){const m={w,t,o,id:id||Math.random().toString(36).slice(2),s:o?'sending':''};M.push(m);M=M.slice(-400);L.s('m',M);chat();return m}
function setS(m,s){m.s=s;L.s('m',M);chat()}
$('snd').onclick=()=>{const t=$('tx').value.trim(),w=$('to').value;if(!t||!w)return;if(!peer||!peer.open){toast('Not online yet. '+netText());return}const m=addM(w,t,1);$('tx').value='';trySend(m,0)};
function trySend(m,tries){let done=false;const id=pid(m.w);let c;
 const retry=why=>{if(done)return;done=true;rmP();try{c&&c.close()}catch(e){}
  if(why=='unavail'){setS(m,'failed');toast('That phone is not online. Ask them to open '+APP+'.');return}
  if(tries<2){bumpIce();setTimeout(()=>trySend(m,tries+1),1200)}else{setS(m,'failed');toast('Message not delivered. Try the same WiFi on both phones.')}};
 const to=setTimeout(()=>retry('timeout'),9000);const rmP=addP(id,()=>{clearTimeout(to);retry('unavail')});
 try{c=peer.connect(id,{reliable:true})}catch(e){clearTimeout(to);return retry('error')}
 c.on('open',()=>{if(done)return;done=true;clearTimeout(to);rmP();c.send({type:'msg',text:m.t,from:me,name:myName(),id:m.id});setS(m,'sent');setTimeout(()=>{try{c.close()}catch(e){}},6000)});
 c.on('data',d=>{if(d&&d.type=='ack'&&d.id==m.id)setS(m,'delivered')});
 c.on('error',()=>{clearTimeout(to);retry('error')})}
/* ---------- connection status ---------- */
const pend={};/* peer id -> list of functions called on peer-unavailable */
function addP(id,f){(pend[id]=pend[id]||[]).push(f);return()=>{pend[id]=(pend[id]||[]).filter(x=>x!==f)}}
function netText(){return({connecting:'Connecting to the phone network.',online:route=='local'?'Online, but it needs the same WiFi on both phones.':'Online.',retry:'Reconnecting.',offline:'Offline. Check your internet.'})[netState]||''}
function net(s,extra){netState=s;const e=$('st');e.className=s;e.textContent=({connecting:'Connecting',online:'Online',retry:'Reconnecting',offline:'Offline'})[s]+(extra?' '+extra:'');renderNet()}
function renderNet(){let t=netText();if(netState=='online'&&route=='local')t='Needs same WiFi. Both phones should be on the same WiFi to connect.';else if(netState=='online'&&route=='internet')t='Online. An internet route was found, so calls can work on different networks.';$('netl').textContent=t}
function bumpIce(){if(iceLevel<1){iceLevel=1}if(peer&&peer.options)peer.options.config=cfg(iceLevel)}
let retryN=0,startT=null;
function start(){clearTimeout(startT);
 if(!window.Peer){net('offline');return startT=setTimeout(start,5000)}
 net(retryN?'retry':'connecting');let p;
 try{p=new Peer(pid(me),{config:cfg(iceLevel),debug:0})}catch(e){net('offline');return startT=setTimeout(start,5000)}
 peer=p;
 p.on('open',()=>{if(p!==peer)return;retryN=0;net('online');netCheck()});
 p.on('disconnected',()=>{if(p!==peer||p.destroyed)return;net('retry');const d=Math.min(30000,1500*Math.pow(2,retryN++));setTimeout(()=>{if(p===peer&&!p.destroyed){try{p.reconnect()}catch(e){}}},d)});
 p.on('close',()=>{if(p!==peer)return;net('retry');startT=setTimeout(start,3000)});
 p.on('error',e=>{if(p!==peer)return;
  if(e.type=='peer-unavailable'){const id=String(e.message||'').split(' ').pop();(pend[id]||[]).slice().forEach(f=>f());if(cur&&cur.peer==id)callFail('unavail');return}
  if(e.type=='unavailable-id'){net('offline');toast('This number is open on another device or tab. Close it there first.');try{p.destroy()}catch(x){}return startT=setTimeout(start,10000)}
  if(e.type=='browser-incompatible'){net('offline');toast('This browser cannot make calls. Try Chrome or Safari.');return}
  net('retry');try{p.destroy()}catch(x){}retryN++;startT=setTimeout(start,Math.min(30000,2000*retryN))});
 p.on('connection',onConn);p.on('call',onCall)}
/* check which kind of network route this phone can find */
let checking=false;
function netCheck(){if(checking||!window.RTCPeerConnection)return;checking=true;let kinds={},pc;
 const fin=()=>{checking=false;try{pc.close()}catch(e){}route=kinds.srflx||kinds.relay?'internet':'local';renderNet();$('cr').textContent=''};
 try{pc=new RTCPeerConnection(cfg(iceLevel));pc.createDataChannel('x');pc.onicecandidate=e=>{if(!e.candidate)return fin();const m=/ typ (\w+)/.exec(e.candidate.candidate);if(m)kinds[m[1]]=1};
  pc.createOffer().then(o=>pc.setLocalDescription(o)).catch(()=>fin());setTimeout(()=>{if(checking)fin()},5000)}catch(e){checking=false}}
$('chk').onclick=()=>{toast('Checking the connection');route='';checking=false;netCheck();if(peer&&!peer.open&&!peer.destroyed&&peer.disconnected){try{peer.reconnect()}catch(e){}}setTimeout(()=>toast(netText()),5200)};
/* ---------- calls ---------- */
async function media(v){return navigator.mediaDevices.getUserMedia({audio:true,video:!!v})}
function cs(t){$('cw').textContent=t}
function callUi(on){$('call').style.display=on?'block':'none'}
let ctx=null;/* {k,n,v,w,tries,out,connected,timer} */
function onCall(k){if(cur||inc){try{k.close()}catch(e){}return}
 inc=k;const w=nm(fmtNum(k.peer.slice(PFX.length)));
 if(walk&&k.metadata&&k.metadata.w)return answer();
 cs('Call from '+w);$('ans').hidden=false;callUi(true)}
async function answer(){const k=inc;inc=null;if(!k)return;let v=k.metadata&&k.metadata.v;
 try{stream=await media(v)}catch(e){try{stream=await media(0)}catch(x){stream=new MediaStream}}
 k.answer(stream);hook(k,{k,n:fmtNum(k.peer.slice(PFX.length)),out:false,tries:9})}
$('ans').onclick=answer;
function hook(k,c){cur=k;ctx=c;c.k=k;c.connected=false;$('ans').hidden=true;callUi(true);$('lv').srcObject=stream;
 cs((c.out?'Calling ':'Connecting to ')+nm(c.n));$('cr').textContent='Connecting';banner('');
 clearTimeout(c.timer);c.timer=setTimeout(()=>{if(cur===k&&!c.connected)callFail('timeout')},22000);
 k.on('stream',s=>{if(cur!==k)return;c.connected=true;clearTimeout(c.timer);$('rv').srcObject=s;cs('Connected to '+nm(c.n));pathInfo(k)});
 k.on('close',()=>{if(cur!==k)return;c.connected?end():callFail('closed')});
 k.on('error',()=>{if(cur===k)callFail('error')});
 const pc=k.peerConnection;
 if(pc)pc.addEventListener('iceconnectionstatechange',()=>{if(cur!==k)return;const s=pc.iceConnectionState;
  if(s=='checking')$('cr').textContent='Connecting';
  if(s=='failed')callFail('ice');
  if(s=='disconnected'&&c.connected){$('cr').textContent='Connection weak, trying to recover';setTimeout(()=>{if(cur===k&&pc.iceConnectionState=='disconnected')end(true)},9000)}
  if(s=='connected'||s=='completed')pathInfo(k)});
 ui()}
async function pathInfo(k){const pc=k.peerConnection;if(!pc||!pc.getStats)return;
 try{const r=await pc.getStats();let rel=null;const cand={};r.forEach(x=>{if(x.type=='local-candidate'||x.type=='remote-candidate')cand[x.id]=x});
  r.forEach(x=>{if(x.type=='candidate-pair'&&(x.nominated||x.selected)&&x.state=='succeeded'){const l=cand[x.localCandidateId],m=cand[x.remoteCandidateId];rel=(l&&l.candidateType=='relay')||(m&&m.candidateType=='relay')?'relay':'direct'}});
  if(rel&&cur===k)$('cr').textContent=rel=='relay'?'Connected through a relay':'Connected direct'}catch(e){}}
function callFail(why){if(!ctx||!cur)return;const c=ctx,n=c.n;
 clearTimeout(c.timer);
 if(why=='unavail'){end();banner('That phone is not online. Ask them to open '+APP+' and try again.');return}
 if(c.out&&c.tries<1){$('cr').textContent='Connection slow, trying another route';cs('Retrying '+nm(n));bumpIce();
  const k=cur;cur=null;ctx=null;try{k.close()}catch(e){}stopMedia();
  setTimeout(()=>{if(!cur)dial(n,c.v,c.w,c.tries+1)},1000);return}
 bumpIce();end();$('cr').textContent='';route=route||'local';
 banner('Call failed. Try the same WiFi on both phones, then call again.');toast('Needs same WiFi',3000);renderNet()}
function stopMedia(){stream&&stream.getTracks().forEach(t=>t.stop());stream=null}
function end(weak){const k=cur;cur=null;ctx&&clearTimeout(ctx.timer);ctx=null;if(k){try{k.close()}catch(e){}}if(inc){try{inc.close()}catch(e){}inc=null}stopMedia();callUi(false);ui();if(weak===true)banner('The call dropped. Try the same WiFi on both phones.')}
$('hup').onclick=()=>end();
async function dial(n,v,w,tries){
 if(!peer||!peer.open){banner('Not online yet. '+netText());return}
 try{stream=await media(v)}catch(e){try{if(v){stream=await media(0)}else throw e}catch(x){return toast('Microphone needed to call')}}
 const k=peer.call(pid(n),stream,{metadata:{v,w}});hook(k,{n,v,w,tries,out:true})}
async function call(n,v,w){if(!n){toast('Add a contact first');tab(6);return}if(cur||inc)return;banner('');await dial(n,v,w,0)}
function ui(){const b=$('one');b.className='big'+(cur?' call':'');b.textContent=cur?'Tap to hang up':'Tap to call';$('wk').textContent='Walkie '+(walk?'ON':'OFF');$('wk').className='b '+(walk?'g':'y')}
$('wk').onclick=()=>{walk=walk?0:1;L.s('w',walk);ui()};
let ht,held=0;const one=$('one');
one.onpointerdown=()=>{held=0;ht=setTimeout(async()=>{held=1;if(cur)return;one.className='big talk';one.textContent='Talking';await call($('fav').value,0,1)},500)};
one.onpointerup=one.onpointercancel=()=>{clearTimeout(ht);if(held){held=0;end();return}};
one.onclick=()=>{if(held)return;cur?end():call($('fav').value,0)};
/* ---------- incoming data connections ---------- */
function onConn(c){c.on('data',d=>{if(!d||typeof d!='object')return;
 if(d.type=='msg'){const w=fmtNum(d.from)||fmtNum(c.peer.slice(PFX.length));if(!w)return;if(!C.find(x=>x.u==w))addContact(w,d.name);addM(w,String(d.text||'').slice(0,2000),0,d.id);try{c.send({type:'ack',id:d.id})}catch(e){}}
 else if(d.type=='joined')onJoined(d)})}
/* ---------- add a phone nearby ---------- */
function baseLink(){const s=L.g('applink','');if(s)return s;
 const itch=/itch\.zone|itch\.io|hwcdn/.test(location.hostname);
 if(/^https?:$/.test(location.protocol)&&!itch)return location.origin+location.pathname;return ITCH_PAGE}
const onItch=()=>baseLink()==ITCH_PAGE;
function addLink(withName){const n=myName();return baseLink().split('#')[0]+'#add='+me+(withName&&n?'&n='+encodeURIComponent(n):'')}
function shareText(){return 'Add me on '+APP+'. My number is '+me+'. Open the link on your phone and I will be added to your contacts automatically.'}
function markInvite(){L.s('inv',Date.now())}
const inviteOn=()=>Date.now()-L.g('inv',0)<864e5;
function refreshLink(){$('lnk').value=addLink(true);const box=$('qrbox');box.innerHTML='';
 try{new QRCode(box,{text:addLink(false),width:220,height:220,colorDark:'#3b2417',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M})}catch(e){}
 $('qrtxt').textContent=addLink(false);$('applink').value=baseLink()}
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform=='MacIntel'&&navigator.maxTouchPoints>1),isAnd=/Android/i.test(navigator.userAgent);
function osNote(){let t='';
 if(isIOS)t='iPhone: a web page cannot start AirDrop by itself. The Share button opens the iPhone share sheet, and AirDrop is in that sheet. Tap AirDrop, then the other phone.';
 else if(isAnd)t='Android: the Share button opens the Android share sheet, which includes Nearby Share (Quick Share). Pick the other phone there.';
 else t='iPhone: a web page cannot start AirDrop by itself, but the iPhone share sheet that Share opens includes AirDrop. Android: the share sheet includes Nearby Share (Quick Share).';
 if(onItch())t+=' On itch the page cannot pass the number into the game, so after the link opens, use the pairing code or Scan a QR code inside the app.';
 return t}
$('oslab').textContent=osNote();
$('sharenote').textContent='Real AirDrop cannot be controlled by a web app. Share uses your phone share sheet, which has AirDrop on iPhone and Nearby Share on Android.';
async function copyText(t){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);return true}}catch(e){}
 try{const i=$('lnk');i.value=t;i.focus();i.select();i.setSelectionRange(0,t.length);const ok=document.execCommand('copy');return ok}catch(e){return false}}
$('shr').onclick=async()=>{markInvite();const url=addLink(true);
 if(typeof navigator.share=='function'){try{await navigator.share({title:APP,text:shareText(),url});toast('Shared. The other phone adds me when it opens the link.');return}catch(e){if(e&&e.name=='AbortError')return}}
 const ok=await copyText(url);$('lnk').focus();$('lnk').select();
 $('sharenote').textContent='This browser has no share sheet'+(ok?', so the link was copied.':'. Copy the link below and send it yourself.');toast(ok?'No share sheet here. Link copied instead.':'No share sheet here. Copy the link below.')};
$('cpy').onclick=async()=>{markInvite();const ok=await copyText(addLink(true));toast(ok?'Link copied':'Copy the link from the box below');if(!ok)$('lnk').select()};
$('smsb').onclick=()=>{markInvite();location.href='sms:?&body='+encodeURIComponent(shareText()+' '+addLink(true))};
$('wab').onclick=()=>{markInvite();window.open('https://wa.me/?text='+encodeURIComponent(shareText()+' '+addLink(true)),'_blank','noopener')};
$('appsave').onclick=()=>{L.s('applink',$('applink').value.trim());refreshLink();$('oslab').textContent=osNote();toast('App link saved')};
function parseAdd(s){s=String(s||'').trim();let m=/[#?&]add=(\d{4}-?\d{4})/.exec(s);if(m){const n=/[#?&]n=([^&#]*)/.exec(s);let nn='';try{nn=n?decodeURIComponent(n[1].replace(/\+/g,' ')):''}catch(e){}return{num:fmtNum(m[1]),name:nn}}
 m=/^\s*(\d{4}[-\s]?\d{4})\s*$/.exec(s);return m?{num:fmtNum(m[1]),name:''}:null}
function acceptAdd(a,how){if(!a||!a.num)return false;const r=addContact(a.num,a.name);
 if(!r.ok){toast(r.why=='self'?'That is my own number':'That number did not look right');return false}
 banner((r.added?'Added ':'Already have ')+nm(a.num)+' ('+a.num+'). '+(firstRun?'Your number is '+me+'.':''),true);
 toast((r.added?'Added ':'Already have ')+nm(a.num)+' to People');tab(2);sayJoined(a.num);return true}
$('pastego').onclick=()=>{if(acceptAdd(parseAdd($('paste').value)))$('paste').value=''}; 
/* tell the inviter I opened their link so they add me back */
let joinedQ=[];function sayJoined(n){joinedQ.push({n,t:0});flushJoined()}
function flushJoined(){if(!joinedQ.length)return;if(!peer||!peer.open)return setTimeout(flushJoined,3000);
 const j=joinedQ[0];if(j.t>=3){joinedQ.shift();return flushJoined()}j.t++;const id=pid(j.n);let c,done=false;
 let rmP=()=>{};const next=ok=>{if(done)return;done=true;rmP();try{c&&c.close()}catch(e){}if(ok)joinedQ.shift();setTimeout(flushJoined,ok?0:4000)};
 rmP=addP(id,()=>next(false));setTimeout(()=>next(false),8000);
 try{c=peer.connect(id);c.on('open',()=>{c.send({type:'joined',num:me,name:myName()});setTimeout(()=>next(true),800)});c.on('error',()=>next(false))}catch(e){next(false)}}
function onJoined(d){const n=fmtNum(d.num);if(!n||!inviteOn())return;const r=addContact(n,String(d.name||'').slice(0,40));if(r.ok&&r.added){toast((d.name||n)+' opened my link and was added');}}
function handleHash(){const h=location.hash;if(!/add=/.test(h))return;const a=parseAdd(h);try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}acceptAdd(a,'link')}
window.addEventListener('hashchange',handleHash);
/* pairing code */
let pairPeer=null,pairT=null,pairExp=0;
function stopPair(){clearInterval(pairT);try{pairPeer&&pairPeer.destroy()}catch(e){}pairPeer=null;$('code').textContent='';$('pinfo').textContent=''}
$('pshow').onclick=()=>{stopPair();markInvite();if(!window.Peer)return toast('Needs internet');
 const code=String(100000+crypto.getRandomValues(new Uint32Array(1))[0]%900000);let p;
 try{p=new Peer(PFX+'pair-'+code,{config:cfg(iceLevel),debug:0})}catch(e){return toast('Could not start pairing')}
 pairPeer=p;$('pinfo').textContent='Starting';
 p.on('open',()=>{if(p!==pairPeer)return;$('code').textContent=code.slice(0,3)+' '+code.slice(3);pairExp=Date.now()+6e5;
  pairT=setInterval(()=>{const s=Math.max(0,Math.round((pairExp-Date.now())/1000));$('pinfo').textContent='Type this code on the other phone. It works for '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'.';if(!s)stopPair()},1000)});
 p.on('connection',c=>c.on('data',d=>{if(d&&d.type=='pair'){const n=fmtNum(d.num);if(!n)return;const r=addContact(n,String(d.name||'').slice(0,40));try{c.send({type:'pair-ok',num:me,name:myName()})}catch(e){}
  if(r.ok){toast('Paired with '+nm(n));banner('Paired with '+nm(n)+' ('+n+'). They are now in People.',true);tab(2)}setTimeout(()=>{if(pairPeer===p)stopPair()},2000)}}));
 p.on('error',e=>{if(p!==pairPeer)return;if(e.type=='unavailable-id'){stopPair();$('pshow').click();return}$('pinfo').textContent='Could not start the code. Check your internet and try again.'})};
$('pgo').onclick=()=>{const code=$('pin').value.replace(/\D/g,'');const res=$('pres');
 if(code.length!=6){res.textContent='The code has 6 digits.';return}
 if(!peer||!peer.open){res.textContent='Not online yet. '+netText();return}
 const id=PFX+'pair-'+code;let c,done=false;res.textContent='Connecting';
 let rmP=()=>{};const fin=t=>{if(done)return;done=true;rmP();try{c&&c.close()}catch(e){}if(t)res.textContent=t};
 const to=setTimeout(()=>{bumpIce();fin('Could not reach that phone. Check the code and try the same WiFi.')},12000);
 rmP=addP(id,()=>{clearTimeout(to);fin('No phone is showing that code. Check the code and try again.')});
 try{c=peer.connect(id,{reliable:true})}catch(e){clearTimeout(to);return fin('Could not connect.')}
 c.on('open',()=>{c.send({type:'pair',num:me,name:myName()})});
 c.on('data',d=>{if(d&&d.type=='pair-ok'){clearTimeout(to);const r=addContact(d.num,String(d.name||'').slice(0,40));fin(r.ok?'Paired with '+nm(fmtNum(d.num))+'.':'Paired.');if(r.ok){toast('Paired with '+nm(fmtNum(d.num)));tab(2)}}});
 c.on('error',()=>{clearTimeout(to);fin('Could not connect. Try the same WiFi on both phones.')})};
/* in-app QR scanner */
let scanStream=null,scanLoop=0;
function loadJsQR(){return new Promise((res,rej)=>{if(window.jsQR)return res();const s=document.createElement('script');s.src='jsqr.js';s.onload=res;s.onerror=rej;document.head.append(s)})}
async function scanStart(){$('scan').style.display='block';
 try{scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});$('sv').srcObject=scanStream}catch(e){scanStop();return toast('Camera needed to scan')}
 let bd=null;try{if(window.BarcodeDetector)bd=new BarcodeDetector({formats:['qr_code']})}catch(e){}
 if(!bd){try{await loadJsQR()}catch(e){scanStop();return toast('Scanner could not load')}}
 const cv=document.createElement('canvas'),x=cv.getContext('2d',{willReadFrequently:true});
 const tick=async()=>{if(!scanStream)return;const v=$('sv');let txt='';
  if(v.videoWidth){try{if(bd){const r=await bd.detect(v);if(r[0])txt=r[0].rawValue}else{cv.width=v.videoWidth;cv.height=v.videoHeight;x.drawImage(v,0,0);const r=jsQR(x.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);if(r)txt=r.data}}catch(e){}}
  if(txt){const a=parseAdd(txt);if(a){scanStop();acceptAdd(a,'qr');return}}
  scanLoop=setTimeout(tick,300)};tick()}
function scanStop(){clearTimeout(scanLoop);$('scan').style.display='none';scanStream&&scanStream.getTracks().forEach(t=>t.stop());scanStream=null}
$('scanb').onclick=scanStart;$('scx').onclick=scanStop;
$('addn').onclick=()=>{tab(6)};$('wgo').onclick=()=>{$('welcome').hidden=true;L.s('welcomed',1);tab(6)};$('wx').onclick=()=>{$('welcome').hidden=true;L.s('welcomed',1)};
/* ---------- social ---------- */
$('soc').innerHTML=[['Telegram','https://t.me'],['TikTok','https://www.tiktok.com'],['YouTube','https://www.youtube.com/@coffeebreakTVSERIES'],['Google Chat','https://chat.google.com'],['WhatsApp','https://wa.me'],['Messenger','https://m.me'],['Instagram','https://instagram.com'],['X','https://x.com'],['Snapchat','https://snapchat.com'],['Discord','https://discord.com/app'],['Facebook','https://facebook.com'],['itch','https://coffeebreaks.itch.io']].map(([n,u])=>'<a href="'+u+'" target="_blank" rel="noopener">'+n+'</a>').join('');
/* ---------- go ---------- */
draw();ui();refreshLink();renderNet();
if(!L.g('welcomed',0)&&!/add=/.test(location.hash))$('welcome').hidden=false;
handleHash();start();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
window.cbo={me:()=>me,contacts:()=>C,parseAdd,addLink,baseLink,iceLevel:()=>iceLevel,state:()=>netState};
