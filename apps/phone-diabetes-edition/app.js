(function(){
var $=function(i){return document.getElementById(i)};
var S={ch:+(localStorage.cbch||19),vol:+(localStorage.cbvol||0.7),sq:+(localStorage.cbsq||0.3),tx:false,peer:null,conns:{},calls:{},mic:null,on:false,rx:0};
var CB=window.CB=S;var MAX=8,ac=null,staticNode=null,staticGain=null,audios={};
function A(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();}if(ac.state==='suspended')ac.resume();return ac}
function noiseBuf(){var a=A(),b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(Math.random()<0.02?1:0.35);return b}
function crackle(ms,lvl){try{var a=A(),s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();s.buffer=noiseBuf();f.type='bandpass';f.frequency.value=1800;g.gain.value=(lvl||0.25)*S.vol;s.connect(f);f.connect(g);g.connect(a.destination);s.start();s.stop(a.currentTime+ms/1000)}catch(e){}}
function beep(){try{var a=A(),t=a.currentTime;[[1000,0],[1500,0.09]].forEach(function(p){var o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=p[0];g.gain.setValueAtTime(0.12*S.vol,t+p[1]);g.gain.setValueAtTime(0,t+p[1]+0.08);o.connect(g);g.connect(a.destination);o.start(t+p[1]);o.stop(t+p[1]+0.1)});crackle(250,0.15)}catch(e){}}
CB.beep=beep;CB.crackle=crackle;
function bgStatic(on){try{var a=A();if(!staticNode){staticNode=a.createBufferSource();staticNode.buffer=noiseBuf();staticNode.loop=true;staticGain=a.createGain();var f=a.createBiquadFilter();f.type='highpass';f.frequency.value=900;staticNode.connect(f);f.connect(staticGain);staticGain.connect(a.destination);staticNode.start()}staticGain.gain.value=on?Math.max(0,(0.6-S.sq))*0.08*S.vol:0}catch(e){}}
function log(t,who){var d=document.createElement('div');d.textContent=(who?who+': ':'')+t;$('log').prepend(d)}
CB.log=log;
function lcd(){$('lcd').firstChild.nodeValue=(S.ch<10?'0':'')+S.ch;$('lcds').textContent='CH '+S.ch+(S.tx?' · TX':' · RX')+($('room').value?' · ROOM':'');}
var m=$('meter');for(var i=0;i<12;i++){var x=document.createElement('i');if(i>8)x.className='hi';m.appendChild(x)}
function meter(n){[].forEach.call(m.children,function(e,i){e.classList.toggle('on',i<n)})}
setInterval(function(){var n=S.tx?10:S.rx>0?6+Math.floor(Math.random()*5):(S.on?Math.floor(Math.random()*2):0);meter(n)},120);
function rot(el,v){el.style.transform='rotate('+(-135+270*v)+'deg)'}
function knob(el,get,set,steps){var y0=null,v0;el.addEventListener('pointerdown',function(e){y0=e.clientY;v0=get();el.setPointerCapture(e.pointerId)});
el.addEventListener('pointermove',function(e){if(y0===null)return;var v=Math.min(1,Math.max(0,v0+(y0-e.clientY)/150));set(v);rot(el,get())});
el.addEventListener('pointerup',function(){y0=null});el.addEventListener('wheel',function(e){e.preventDefault();set(Math.min(1,Math.max(0,get()-e.deltaY/1000)));rot(el,get())});rot(el,get())}
knob($('kVol'),function(){return S.vol},function(v){S.vol=v;localStorage.cbvol=v;for(var k in audios)audios[k].volume=v;bgStatic(S.on)});
knob($('kSq'),function(){return S.sq},function(v){S.sq=v;localStorage.cbsq=v;bgStatic(S.on)});
knob($('kCh'),function(){return (S.ch-1)/39},function(v){setCh(Math.round(v*39)+1,true)});
function setCh(c,fromKnob){c=((c-1+40)%40)+1;if(c===S.ch)return;S.ch=c;localStorage.cbch=c;lcd();crackle(120);if(!fromKnob)rot($('kCh'),(c-1)/39);if(S.on){tuneOut();tuneIn()}}
CB.setCh=setCh;
$('chUp').onclick=function(){setCh(S.ch+1)};$('chDn').onclick=function(){setCh(S.ch-1)};
function base(){var r=($('room').value||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20);return 'coffeebreak-cb-'+S.ch+'-'+(r||'open')+'-'}
CB.base=base;
function st(t){$('st').textContent=t}
function peersN(){var n=Object.keys(S.conns).filter(function(k){return S.conns[k].open}).length;$('peers').textContent=n+' on channel'}
function wire(c){S.conns[c.peer]=c;c.on('open',function(){peersN();log('Somebody tuned in','CH '+S.ch)});c.on('data',onData);c.on('close',function(){delete S.conns[c.peer];peersN()});c.on('error',function(){})}
function onData(d){if(!d||!d.t)return;if(d.t==='txs'){S.rx++;crackle(180,0.3)}else if(d.t==='txe'){S.rx=Math.max(0,S.rx-1);beep()}else if(d.t==='msg'){crackle(120);log(String(d.m).slice(0,200),d.h||'Breaker')}}
CB.onData=onData;
function playStream(id,s){var a=audios[id]||new Audio();a.autoplay=true;a.playsInline=true;a.srcObject=s;a.volume=S.vol;audios[id]=a;a.play&&a.play().catch(function(){})}
function getMic(){if(S.mic)return Promise.resolve(S.mic);if(!navigator.mediaDevices)return Promise.reject();return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(s){S.mic=s;s.getAudioTracks().forEach(function(t){t.enabled=false});return s})}
function callPeer(id){if(!S.mic||S.calls[id]||!S.peer)return;var c=S.peer.call(id,S.mic);if(!c)return;S.calls[id]=c;c.on('stream',function(s){playStream(id,s)});c.on('close',function(){delete S.calls[id]})}
function tuneIn(slot){slot=slot||0;if(slot>=MAX){st('Channel full. Try another channel or a room code.');return}
if(typeof Peer==='undefined'){st('Needs internet to reach other radios. Breaker messages stay on this phone.');return}
S.on=true;bgStatic(true);var p=new Peer(base()+slot,{debug:0});S.peer=p;st('Tuning CH '+S.ch+'...');
p.on('open',function(){st('On air CH '+S.ch+'. Hold the button to talk.');$('tune').textContent='Tune out';
 getMic().catch(function(){log('Mic not allowed. You can still listen and send breaker messages.')}).then(function(){for(var i=0;i<MAX;i++){if(i===slot)continue;var id=base()+i;var c=p.connect(id,{reliable:true});wire(c);callPeer(id)}})});
p.on('connection',function(c){wire(c);setTimeout(function(){callPeer(c.peer)},500)});
p.on('call',function(c){getMic().catch(function(){return null}).then(function(s){c.answer(s||undefined);S.calls[c.peer]=c;c.on('stream',function(x){playStream(c.peer,x)})})});
p.on('error',function(e){if(e.type==='unavailable-id'){p.destroy();tuneIn(slot+1)}else if(e.type==='peer-unavailable'){}else st('Radio trouble: '+e.type)});}
function tuneOut(){S.on=false;if(S.peer){try{S.peer.destroy()}catch(e){}}S.peer=null;S.conns={};S.calls={};for(var k in audios){audios[k].srcObject=null}audios={};peersN();bgStatic(false);$('tune').textContent='Tune in';st('Off air.')}
CB.tuneIn=tuneIn;CB.tuneOut=tuneOut;
$('tune').onclick=function(){A();S.on?tuneOut():tuneIn()};
function bcast(o){var n=0;for(var k in S.conns){var c=S.conns[k];if(c.open){try{c.send(o);n++}catch(e){}}}return n}
CB.bcast=bcast;
function txStart(){if(S.tx)return;S.tx=true;A();$('ptt').classList.add('tx');$('ptt').textContent='TALKING';crackle(150,0.2);if(S.mic)S.mic.getAudioTracks().forEach(function(t){t.enabled=true});bcast({t:'txs'});lcd()}
function txEnd(){if(!S.tx)return;S.tx=false;$('ptt').classList.remove('tx');$('ptt').textContent='HOLD TO TALK';if(S.mic)S.mic.getAudioTracks().forEach(function(t){t.enabled=false});bcast({t:'txe'});beep();lcd()}
CB.txStart=txStart;CB.txEnd=txEnd;
var P=$('ptt');P.addEventListener('pointerdown',function(e){e.preventDefault();P.setPointerCapture&&P.setPointerCapture(e.pointerId);txStart()});
['pointerup','pointercancel','lostpointercapture'].forEach(function(ev){P.addEventListener(ev,txEnd)});
P.addEventListener('contextmenu',function(e){e.preventDefault()});
document.addEventListener('keydown',function(e){if(e.code==='Space'&&e.target.tagName!=='INPUT'){e.preventDefault();txStart()}});
document.addEventListener('keyup',function(e){if(e.code==='Space')txEnd()});
function handle(){return localStorage.cbhandle||(localStorage.cbhandle='Coffee '+Math.floor(Math.random()*900+100))}
function sendMsg(t){t=String(t||'').trim().slice(0,200);if(!t)return;var n=bcast({t:'msg',m:t,h:handle()});log(t,'Me'+(n?'':' (nobody else on air yet)'));beep()}
CB.sendMsg=sendMsg;
$('send').onclick=function(){sendMsg($('msg').value);$('msg').value=''};
$('msg').addEventListener('keydown',function(e){if(e.key==='Enter')$('send').onclick()});
[].forEach.call(document.querySelectorAll('[data-l]'),function(b){b.onclick=function(){sendMsg(b.dataset.l)}});
$('room').addEventListener('change',function(){lcd();if(S.on){tuneOut();tuneIn()}});
$('fsb').onclick=function(){var d=document.documentElement;if(document.fullscreenElement)document.exitFullscreen();else (d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)};
lcd();rot($('kCh'),(S.ch-1)/39);
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});
})();
