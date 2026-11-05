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
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8cea0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8cea0';x.lineWidth=2;x.stroke();
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
// ===== Coffeebreak Phone: real wifi calls via WebRTC (Trystero/nostr signalling, public STUN) =====
const G={state:'title',score:0,level:1};
const DEMO=!!window.DEMO;
const LS={get(k,d){try{const v=localStorage.getItem('cbph_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('cbph_'+k,JSON.stringify(v))}catch(e){}}};
const genNum=()=>'04'+String(Math.floor(Math.random()*1e8)).padStart(8,'0');let MYNUM=LS.get('num10',null),NEWNUM=!MYNUM;if(!MYNUM){MYNUM=genNum();LS.set('num10',MYNUM)}
const RTC={appId:'coffeebreaks-itch-coffeebreak-phone-v1',rtcConfig:{iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:global.stun.twilio.com:3478'}]}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>{n=String(n);return n.length===10?'CB '+n.slice(0,4)+' '+n.slice(4,7)+' '+n.slice(7):n.replace(/(\d{4})(\d{0,3})(\d{0,3})/,(a,b,c2,d)=>[b,c2,d].filter(Boolean).join(' '))}
const P={contacts:LS.get('contacts',[]),hist:LS.get('hist',[]),msgs:LS.get('msgs',{}),tab:'dial',dial:'',call:null,home:null,out:null,stream:null,muted:false,speaker:true,facing:'user',chatWith:null,status:'Connecting to the network…',online:false};
window.PHONE=P;
c.style.display='none';
const st=document.createElement('style');st.textContent=`
#ph{flex:1;width:100%;max-width:440px;min-height:0;display:flex;flex-direction:column;background:linear-gradient(#2a0f1c,#12060c);border:2px solid #e8cea0;border-radius:22px;margin:4px 0 46px;overflow:hidden;font-family:Georgia,serif}
#phHead{padding:8px 12px;text-align:center;border-bottom:1px solid #5a2a3a}#phHead b{color:#e8cea0;font-size:20px}#phHead small{display:block;color:#c8a8b0;font-size:12px}
#phBody{flex:1;overflow:auto;padding:10px}#phTabs{display:flex;border-top:1px solid #5a2a3a}#phTabs button{flex:1;border:0;border-radius:0;padding:9px 2px;font-size:13px;background:#1e0a14}#phTabs button.sel{background:#e8cea0;color:#1a0a10}
.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:8px auto}.pad button{font-size:24px;padding:10px 0;border-radius:40px}
.disp{font-size:30px;text-align:center;letter-spacing:2px;min-height:40px;color:#fff}.big{display:block;margin:8px auto;font-size:18px;padding:10px 24px;border-radius:30px}
.green{background:#2a8a4a!important;border-color:#7fe0a0!important;color:#fff!important}.red{background:#b02a3a!important;border-color:#ff9aa0!important;color:#fff!important}
.note{font-size:12px;color:#ffcf9a;background:#3a1a10;border:1px solid #a06a3a;border-radius:10px;padding:6px;margin:8px 0;text-align:center}
.row{display:flex;justify-content:space-between;align-items:center;padding:7px;border-bottom:1px solid #3a1a26;gap:6px}.row button{padding:4px 9px;font-size:13px}
input.ti{width:100%;box-sizing:border-box;padding:8px;border-radius:10px;border:1px solid #e8cea0;background:#1a0a10;color:#fff;font:15px Georgia;margin:3px 0}
#callScr{position:fixed;inset:0;z-index:90;background:radial-gradient(#4a2030,#0d0508 80%);display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff}
#callScr video{background:#000;border-radius:14px}#rv{width:min(92vw,640px);max-height:55vh}#lv{position:absolute;right:12px;top:12px;width:120px;border:2px solid #e8cea0}
.ctl{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:10px}.ctl button{min-width:76px;padding:10px;border-radius:16px}
.ring{animation:rg 1s infinite}@keyframes rg{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
.bub{max-width:78%;padding:7px 10px;border-radius:14px;margin:4px 0;word-wrap:break-word}.me{background:#e8cea0;color:#1a0a10;margin-left:auto}.th{background:#3a1424}`;
document.head.appendChild(st);
const ph=document.createElement('div');ph.id='ph';ph.innerHTML='<div id="phHead"><b>📞 Coffeebreak Phone</b><div id="phNum" style="font-size:24px;color:#fff;font-weight:bold;letter-spacing:1px"></div><div><button id="bCopy">📋 Copy</button> <button id="bShare">📤 Share</button></div><small>App number for Coffeebreak Phone only, not a real mobile number</small><small id="phSt"></small></div><div id="phBody"></div><div id="phTabs"></div>';
c.parentNode.insertBefore(ph,c);
const shareTxt=()=>'Call me on Coffeebreak Phone (app-to-app wifi calls, not a real mobile number): '+fmt(MYNUM)+' https://coffeebreaks.itch.io/coffeebreak-phone';
function copyNum(){const t=fmt(MYNUM);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>setSt('📋 Copied '+t),()=>{prompt('Copy your Coffeebreak number:',t)})}
$('bCopy').onclick=copyNum;$('bShare').onclick=()=>{if(navigator.share)navigator.share({title:'My Coffeebreak number',text:shareTxt()}).catch(()=>{});else{(navigator.clipboard?navigator.clipboard.writeText(shareTxt()):Promise.reject()).then(()=>setSt('📤 Share message copied'),()=>prompt('Share this:',shareTxt()))}};
const cs=document.createElement('div');cs.id='callScr';document.body.appendChild(cs);
const TABS=[['dial','⌨️ Keypad'],['contacts','👥 Contacts'],['hist','🕘 Recents'],['msgs','💬 Messages'],['about','ℹ️ About']];
function setSt(s){P.status=s;const e=$('phSt');if(e)e.textContent=s}
const NOTE='CB numbers are Coffeebreak app numbers, not real mobile numbers. ⚠️ Coffeebreak Phone only calls other people using the Coffeebreak Phone app over wifi/internet. It cannot call regular phone numbers or emergency services. In an emergency call 000 from a real phone.';
// ---- audio: ringtone & tones ----
let AC=null;function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume();return AC}
let ringT=null;function tone(fs,dur){try{const a=ac(),t0=a.currentTime;fs.forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.setValueAtTime(.12,t0);g.gain.linearRampToValueAtTime(0,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur)})}catch(e){}}
function ringStart(kind){ringStop();const f=()=>kind==='in'?(tone([880,1320],.4),setTimeout(()=>tone([988,1480],.4),450)):tone([400,450],.9);f();ringT=setInterval(f,kind==='in'?1600:3000)}
function ringStop(){clearInterval(ringT);ringT=null}
function dtmf(k){const r={1:[697,1209],2:[697,1336],3:[697,1477],4:[770,1209],5:[770,1336],6:[770,1477],7:[852,1209],8:[852,1336],9:[852,1477],'*':[941,1209],0:[941,1336],'#':[941,1477]};if(r[k])tone(r[k],.15)}
// ---- hold music uses the music bar ----
let holdWasPlaying=false;function holdMusic(on){const m=$('music');if(on){holdWasPlaying=!m.paused;started=true;if(musicOK&&!muted)m.play().catch(()=>{})}else if(!holdWasPlaying)m.pause()}
// ---- networking ----
function TR(){return window.Trystero}
function joinHome(){if(!TR()){setSt('⚠️ Calling service could not load. Check your internet.');return}
 try{const r=TR().joinRoom(RTC,'line-'+MYNUM);P.home=wire(r,true);setSt('🟢 Ready for calls');setTimeout(()=>{NEWNUM=false},8000);P.online=true}catch(e){setSt('⚠️ Could not connect: '+e.message)}}
function wire(room,isHome){
 const L={room,isHome,peers:new Set()};
 const mk=n=>{const a=room.makeAction(n);return [(d,id)=>a.send(d,id?{target:id}:undefined),f=>{a.onMessage=(d,c)=>f(d,c&&c.peerId!==undefined?c.peerId:c)}]};
 const [sRing,gRing]=mk('ring'),[sAns,gAns]=mk('answer'),[sEnd,gEnd]=mk('hangup'),[sMsg,gMsg]=mk('msg'),[sHold,gHold]=mk('hold'),[sHi,gHi]=mk('hello');
 Object.assign(L,{sRing,sAns,sEnd,sMsg,sHold,sHi});
 room.onPeerJoin=(id=>{L.peers.add(id);sHi({num:MYNUM},id);L.onJoin&&L.onJoin(id)});
 room.onPeerLeave=(id=>{L.peers.delete(id);if(P.call&&P.call.peer===id&&P.call.link===L)endCall('Call dropped',true)});
 gHi((d,id)=>{L.hello=L.hello||{};L.hello[id]=d&&d.num;if(isHome&&d&&d.num===MYNUM&&NEWNUM&&!P.call){const old=room;MYNUM=genNum();LS.set('num10',MYNUM);try{old.leave()}catch(e){}setSt('Number was taken, picked a new one');render();joinHome()}});
 gRing((d,id)=>{if(!d||!/^\d{10}$/.test(d.from))return;if(P.call){sEnd({busy:true},id);return}
  P.call={peer:id,link:L,num:d.from,video:!!d.video&&!DEMO,dir:'in',state:'ringing',t0:Date.now()};logH('in');ringStart('in');showCall()});
 gAns((d,id)=>{if(P.call&&P.call.peer===id&&P.call.dir==='out'){P.call.state='live';P.call.tLive=Date.now();ringStop();addStreams();showCall()}});
 gEnd((d,id)=>{if(P.call&&P.call.peer===id)endCall(d&&d.busy?'Line busy':(P.call.state==='ringing'&&P.call.dir==='out'?'Call declined':'Call ended'),true)});
 gHold((d,id)=>{if(P.call&&P.call.peer===id){P.call.remoteHold=!!(d&&d.on);holdMusic(P.call.remoteHold);showCall()}});
 gMsg((d,id)=>{if(DEMO||!d||!/^\d{10}$/.test(d.from)||typeof d.text!=='string')return;const n=d.from;(P.msgs[n]=P.msgs[n]||[]).push({me:0,text:d.text.slice(0,1000),t:Date.now()});LS.set('msgs',P.msgs);if(P.tab==='msgs')render();tone([1200],.12)});
 room.onPeerStream=((s,id)=>{if(P.call&&P.call.peer===id){P.call.remote=s;attach()}});
 return L}
async function getMedia(video){
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('This browser has no mic access');
 return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:video?{facingMode:P.facing}:false})}
async function placeCall(num,video){
 num=String(num).replace(/\D/g,'');
 if(num.length!==10){alert('Coffeebreak numbers have 10 digits, like CB 0420 123 456.\n\n'+NOTE);return}
 if(num===MYNUM){alert("That's your own number 🙂");return}
 if(num==='000'){alert(NOTE);return}
 if(video&&DEMO){upsell('Video calls');return}
 if(P.call)return;started=true;
 P.call={num,video:!!video,dir:'out',state:'calling',t0:Date.now()};logH('out');showCall();
 try{P.stream=await getMedia(video)}catch(e){mediaFail(e);return}
 if(!P.call)return;
 const r=TR().joinRoom(RTC,'line-'+num);const L=wire(r,false);P.out=L;P.call.link=L;
 let rung=false;const ring=id=>{if(rung||!P.call||P.call.link!==L)return;rung=true;P.call.peer=id;P.call.state='ringing';ringStart('out');L.sRing({from:MYNUM,video:P.call.video},id);showCall()};
 L.onJoin=id=>setTimeout(()=>{if(!L.hello||L.hello[id]===num)ring(id)},400);
 [...L.peers].forEach(id=>L.onJoin(id));
 P.call.timer=setTimeout(()=>{if(P.call&&P.call.state!=='live')endCall(P.call.state==='calling'?'No answer. They may be offline.':'No answer')},45000)}
async function answer(){if(!P.call||P.call.dir!=='in')return;ringStop();
 try{P.stream=await getMedia(P.call.video)}catch(e){P.call.link.sEnd({},P.call.peer);mediaFail(e);return}
 P.call.state='live';P.call.tLive=Date.now();P.call.link.sAns({},P.call.peer);addStreams();showCall()}
function addStreams(){if(P.stream&&P.call&&P.call.peer){P.call.link.room.addStream(P.stream,{target:P.call.peer});attach()}}
function attach(){const rv=$('rv'),lv=$('lv'),ra=$('ra');if(!P.call)return;
 if(P.call.remote){if(ra){ra.srcObject=P.call.remote;ra.play().catch(()=>{})}if(rv&&P.call.video){rv.srcObject=P.call.remote;rv.play().catch(()=>{})}}
 if(lv&&P.stream&&P.call.video){lv.srcObject=P.stream;lv.muted=true;lv.play().catch(()=>{})}}
function endCall(why,remote){if(!P.call)return;const C=P.call;P.call=null;ringStop();clearTimeout(C.timer);
 if(!remote&&C.link&&C.peer)try{C.link.sEnd({},C.peer)}catch(e){}
 if(C.remoteHold)holdMusic(false);
 if(P.stream){P.stream.getTracks().forEach(t=>t.stop());P.stream=null}
 const h=P.hist.find(x=>x.t===C.t0);if(h){h.dur=C.tLive?Math.round((Date.now()-C.tLive)/1000):0;h.missed=!C.tLive&&C.dir==='in';LS.set('hist',P.hist)}
 if(C.link&&!C.link.isHome){const L=C.link;setTimeout(()=>{try{L.room.leave()}catch(e){}},800);if(P.out===L)P.out=null}
 P.muted=false;cs.innerHTML='<h2>📵 '+esc(why||'Call ended')+'</h2>';cs.style.display='flex';setTimeout(()=>{if(!P.call)cs.style.display='none'},1600);render()}
function mediaFail(e){const inFrame=window.top!==window.self;endCall('Microphone/camera blocked');
 setTimeout(()=>{cs.innerHTML='<h2>🎙️ Microphone or camera not available</h2><p style="max-width:420px">Please allow microphone'+(DEMO?'':' and camera')+' access when your browser asks.'+(inFrame?' Some websites block the mic inside the game window, so open the phone in its own tab:':'')+'</p>'+(inFrame?'<a href="'+esc(location.href)+'" target="_blank" rel="noopener"><button class="big green">Open in a new tab</button></a>':'')+'<button class="big" onclick="this.parentNode.style.display=\'none\'">Close</button>';cs.style.display='flex'},1700)}
function logH(dir){P.hist.unshift({num:P.call.num,dir,video:P.call.video,t:P.call.t0});P.hist=P.hist.slice(0,100);LS.set('hist',P.hist)}
function nameOf(n){const k=P.contacts.find(c=>c.num===n);return k?k.name:fmt(n)}
function showCall(){const C=P.call;if(!C){cs.style.display='none';return}cs.style.display='flex';
 const sec=C.tLive?Math.round((Date.now()-C.tLive)/1000):0,dur=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
 const label={calling:'Connecting…',ringing:C.dir==='in'?'Incoming '+(C.video?'video':'voice')+' call':'Ringing…',live:C.remoteHold?'⏸️ On hold, enjoy the music':dur}[C.state];
 let h='<audio id="ra" autoplay></audio>';
 if(C.video&&C.state==='live')h+='<video id="rv" autoplay playsinline></video><video id="lv" autoplay playsinline muted></video>';
 else h+='<div class="'+(C.state!=='live'?'ring':'')+'" style="font-size:80px">'+(C.video?'📹':'📞')+'</div>';
 h+='<h2 style="margin:6px">'+esc(nameOf(C.num))+'</h2><div id="cLab" style="color:#e8cea0">'+label+'</div>';
 if(C.dir==='in'&&C.state==='ringing')h+='<div class="ctl"><button class="green big" id="bAns">✅ Answer</button><button class="red big" id="bDec">❌ Decline</button></div>';
 else{h+='<div class="ctl"><button id="bMute">'+(P.muted?'🔇 Unmute':'🎙️ Mute')+'</button><button id="bSpk">'+(P.speaker?'🔊 Speaker on':'🔈 Speaker off')+'</button>'+(C.state==='live'?'<button id="bHold">'+(C.myHold?'▶️ Resume':'⏸️ Hold')+'</button>':'')+(C.video?'<button id="bFlip">🔄 Flip camera</button>':'')+'</div><button class="red big" id="bEnd">📵 Hang up</button>'}
 cs.innerHTML=h;attach();
 const on=(i,f)=>{const e=$(i);if(e)e.onclick=f};
 on('bAns',answer);on('bDec',()=>{P.call&&P.call.link.sEnd({},P.call.peer);endCall('Declined',true)});on('bEnd',()=>endCall('Call ended'));
 on('bMute',()=>{P.muted=!P.muted;P.stream&&P.stream.getAudioTracks().forEach(t=>t.enabled=!P.muted);showCall()});
 on('bSpk',()=>{P.speaker=!P.speaker;const a=$('ra');if(a)a.volume=P.speaker?1:.35;const v=$('rv');if(v)v.volume=P.speaker?1:.35;showCall()});
 on('bHold',()=>{C.myHold=!C.myHold;P.stream&&P.stream.getTracks().forEach(t=>t.enabled=!C.myHold&&!(t.kind==='audio'&&P.muted));C.link.sHold({on:C.myHold},C.peer);showCall()});
 on('bFlip',flip)}
async function flip(){const C=P.call;if(!C||!P.stream)return;P.facing=P.facing==='user'?'environment':'user';
 try{const ns=await navigator.mediaDevices.getUserMedia({video:{facingMode:P.facing}});const nt=ns.getVideoTracks()[0],ot=P.stream.getVideoTracks()[0];
  if(C.state==='live'&&C.peer)C.link.room.replaceTrack(ot,nt,{target:C.peer});P.stream.removeTrack(ot);ot.stop();P.stream.addTrack(nt);attach()}catch(e){alert('Could not switch camera on this device.')}}
setInterval(()=>{if(P.call&&P.call.state==='live'){const e=$('cLab');if(e&&!P.call.remoteHold){const s=Math.round((Date.now()-P.call.tLive)/1000);e.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}}},1000);
// ---- messages ----
function sendMsg(num,text){if(DEMO){upsell('Text messages');return}text=text.trim();if(!text)return;
 (P.msgs[num]=P.msgs[num]||[]).push({me:1,text,t:Date.now(),st:'sending'});LS.set('msgs',P.msgs);render();const m=P.msgs[num][P.msgs[num].length-1];
 const r=TR().joinRoom(RTC,'line-'+num);const L=wire(r,false);let done=false;
 L.onJoin=id=>setTimeout(()=>{if(done)return;if(L.hello&&L.hello[id]&&L.hello[id]!==num)return;done=true;L.sMsg({from:MYNUM,text},id);m.st='delivered';LS.set('msgs',P.msgs);render();setTimeout(()=>r.leave(),1500)},400);
 setTimeout(()=>{if(!done){done=true;m.st='not delivered (they are offline)';LS.set('msgs',P.msgs);render();r.leave()}},30000)}
function upsell(what){cs.innerHTML='<h2>🔒 '+esc(what)+' are in the full version</h2><p>The free demo includes voice calls. Get video calls, text messages and all 38 Coffeebreak songs for $4.99.</p><a href="https://coffeebreaks.itch.io/coffeebreak-phone" target="_blank" rel="noopener"><button class="big green">Get the full version</button></a><button class="big" onclick="this.parentNode.style.display=\'none\'">Close</button>';cs.style.display='flex'}
// ---- screens ----
function render(){$('phNum').textContent=fmt(MYNUM);$('phSt').textContent=P.status;
 $('phTabs').innerHTML=TABS.map(([k,l])=>'<button data-t="'+k+'" class="'+(P.tab===k?'sel':'')+'">'+l+(DEMO&&k==='msgs'?' 🔒':'')+'</button>').join('');
 document.querySelectorAll('#phTabs button').forEach(b=>b.onclick=()=>{P.tab=b.dataset.t;P.chatWith=null;render()});
 const B=$('phBody');let h='';
 if(P.tab==='dial'){h='<div class="disp">'+(esc(fmt(P.dial))||'&nbsp;')+'</div><div class="pad">'+'123456789*0#'.split('').map(k=>'<button data-k="'+k+'">'+k+'</button>').join('')+'</div><div style="display:flex;gap:8px;justify-content:center"><button class="big green" id="dV">📞 Call</button><button class="big '+(DEMO?'':'green')+'" id="dVid">📹 Video'+(DEMO?' 🔒':'')+'</button><button class="big" id="dDel">⌫</button></div><div class="note">'+NOTE+'</div>';}
 else if(P.tab==='contacts'){h='<input class="ti" id="cN" placeholder="Name"><input class="ti" id="cNum" placeholder="10-digit Coffeebreak number" inputmode="numeric"><button class="big" id="cAdd">➕ Add contact</button>'+(P.contacts.length?'':'<p style="text-align:center;color:#c8a8b0">No contacts yet. Share your number: <b>'+fmt(MYNUM)+'</b></p>')+P.contacts.map((k,i)=>'<div class="row"><span>👤 '+esc(k.name)+'<br><small>'+fmt(k.num)+'</small></span><span><button data-c="'+k.num+'">📞</button><button data-v="'+k.num+'">📹</button>'+(DEMO?'':'<button data-m="'+k.num+'">💬</button>')+'<button data-x="'+i+'">🗑️</button></span></div>').join('')}
 else if(P.tab==='hist'){h=P.hist.length?P.hist.map(x=>'<div class="row"><span style="color:'+(x.missed?'#ff8a8a':'#fff')+'">'+(x.dir==='in'?(x.missed?'↙️ Missed':'↙️ In'):'↗️ Out')+' '+(x.video?'📹':'📞')+' '+esc(nameOf(x.num))+'<br><small>'+new Date(x.t).toLocaleString()+(x.dur?' · '+Math.floor(x.dur/60)+'m '+x.dur%60+'s':'')+'</small></span><button data-c="'+x.num+'">📞</button></div>').join('')+'<button class="big" id="hClr">Clear history</button>':'<p style="text-align:center;color:#c8a8b0">No calls yet.</p>'}
 else if(P.tab==='msgs'){if(DEMO)h='<p style="text-align:center">💬 Text messages between Coffeebreak numbers are in the full version.</p><button class="big green" id="mUp">Find out more</button>';
  else if(P.chatWith){const n=P.chatWith;h='<button id="mBack">← Back</button> <b>'+esc(nameOf(n))+'</b><div id="mList" style="display:flex;flex-direction:column;margin:8px 0">'+(P.msgs[n]||[]).map(m=>'<div class="bub '+(m.me?'me':'th')+'">'+esc(m.text)+(m.me?'<br><small style="opacity:.7">'+esc(m.st||'')+'</small>':'')+'</div>').join('')+'</div><div style="display:flex;gap:6px"><input class="ti" id="mTxt" placeholder="Message" maxlength="1000"><button id="mSend">Send</button></div><small style="color:#c8a8b0">Messages only arrive while the other person has the app open.</small>'}
  else h='<div style="display:flex;gap:6px"><input class="ti" id="mNew" placeholder="Number to text" inputmode="numeric"><button id="mGo">💬</button></div>'+Object.keys(P.msgs).map(n=>{const l=P.msgs[n][P.msgs[n].length-1];return '<div class="row" data-o="'+n+'" style="cursor:pointer"><span>💬 '+esc(nameOf(n))+'<br><small>'+esc((l&&l.text||'').slice(0,40))+'</small></span></div>'}).join('')}
 else h='<p>📞 <b>Coffeebreak Phone</b> makes real voice'+(DEMO?'':' and video')+' calls over wifi between people who have this app open.</p><p>Your app number is <b>'+fmt(MYNUM)+'</b>. It was made up for you on first launch, checked so no one else online has it, and stays on this device. It is not a real mobile number and only works inside Coffeebreak Phone. Share it with friends so they can call you.</p><p>Calls connect directly between devices (peer-to-peer). Nothing is recorded. Use the 🔊 Music button: if someone puts you on hold, the Coffeebreak songs play as hold music.</p><div class="note">'+NOTE+'</div><p style="font-size:12px;color:#c8a8b0">Some networks (strict work or school wifi) may block direct calls.</p>';
 B.innerHTML=h;
 B.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{if(P.dial.length<10)P.dial+=b.dataset.k;dtmf(b.dataset.k);render()});
 const on=(i,f)=>{const e=$(i);if(e)e.onclick=f};
 on('dV',()=>placeCall(P.dial,false));on('dVid',()=>placeCall(P.dial,true));on('dDel',()=>{P.dial=P.dial.slice(0,-1);render()});
 on('cAdd',()=>{const n=$('cN').value.trim(),u=$('cNum').value.replace(/\D/g,'');if(!n||u.length!==10){alert('Enter a name and a 10-digit Coffeebreak number.');return}P.contacts.push({name:n.slice(0,40),num:u});LS.set('contacts',P.contacts);render()});
 B.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>placeCall(b.dataset.c,false));B.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>placeCall(b.dataset.v,true));
 B.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{P.tab='msgs';P.chatWith=b.dataset.m;render()});
 B.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{P.contacts.splice(+b.dataset.x,1);LS.set('contacts',P.contacts);render()});
 B.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{P.chatWith=b.dataset.o;render()});
 on('hClr',()=>{P.hist=[];LS.set('hist',[]);render()});on('mUp',()=>upsell('Text messages'));on('mBack',()=>{P.chatWith=null;render()});
 on('mGo',()=>{const u=$('mNew').value.replace(/\D/g,'');if(u.length===10){P.chatWith=u;render()}else alert('Enter a 10-digit Coffeebreak number.')});
 on('mSend',()=>{const v=$('mTxt').value;sendMsg(P.chatWith,v)});const mt=$('mTxt');if(mt){mt.onkeydown=e=>{if(e.key==='Enter')sendMsg(P.chatWith,mt.value)};const ml=$('mList');ml&&ml.lastChild&&ml.lastChild.scrollIntoView()}}
(function(){const o=document.createElement('canvas');o.width=240;o.height=320;const q=o.getContext('2d');q.fillStyle='#2a0f1c';q.beginPath();q.roundRect(60,20,120,280,18);q.fill();q.strokeStyle='#e8cea0';q.lineWidth=4;q.stroke();q.font='70px serif';q.textAlign='center';q.fillText('📞',120,190);window.HERO_SRC=o.toDataURL()})();
addEventListener('pointerdown',()=>{startMusic()},{once:true});
window.PH={placeCall,answer,endCall,sendMsg,MYNUM};
render();joinHome();
