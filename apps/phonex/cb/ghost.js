(function(){
var $=function(i){return document.getElementById(i)},CB=window.CB;
var G=window.GHOST={on:false,scan:false,speed:+(localStorage.cbgsp||0.5),vol:+(localStorage.cbgvol||0.6),speak:false,rec:false,session:[],words:[],emf:0,sensor:0};
var BANK=['hello','here','cold','leave','behind you','who','yes','no','listen','coffee','stay','dark','help','name','light','door','close','hush','follow','home','now','wait','sweet','music','dance','remember','again','why','upstairs','window','someone','gone','come','free','sorry','tired','watching','old house','the stairs','not alone','too late','over here','I see','open it','let go','sing'];
var ac,noise,ng,frag,fg,timer=null;
function A(){if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();return ac}
function buf(){var a=A(),b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function startNoise(){var a=A();if(noise)return;noise=a.createBufferSource();noise.buffer=buf();noise.loop=true;var f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2200;f.Q.value=0.5;ng=a.createGain();ng.gain.value=0.12*G.vol;noise.connect(f);f.connect(ng);ng.connect(a.destination);noise.start()}
function stopNoise(){if(noise){try{noise.stop()}catch(e){}noise=null}}
function fragment(){try{var a=A(),t=a.currentTime,o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type=['sawtooth','square','triangle'][Math.floor(Math.random()*3)];o.frequency.setValueAtTime(150+Math.random()*500,t);o.frequency.linearRampToValueAtTime(100+Math.random()*700,t+0.12);f.type='bandpass';f.frequency.value=900+Math.random()*1200;f.Q.value=4;g.gain.setValueAtTime(0.06*G.vol,t);g.gain.linearRampToValueAtTime(0,t+0.13);o.connect(f);f.connect(g);g.connect(a.destination);o.start(t);o.stop(t+0.14)}catch(e){}}
G.fragment=fragment;
function ts(){var d=new Date();return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
function note(type,txt){var e={time:new Date().toISOString(),local:ts(),type:type,text:txt};if(G.rec)G.session.push(e);return e}
function lcd(big,small){$('lcd').firstChild.nodeValue=big;$('lcds').textContent=small}
function capture(){var w=BANK[Math.floor(Math.random()*BANK.length)];G.words.push(w);var d=document.createElement('div');d.textContent=ts()+'  '+w;$('glog').prepend(d);note('word',w);lcd(w.toUpperCase(),'CAPTURED');
 if(G.speak&&window.speechSynthesis){try{var u=new SpeechSynthesisUtterance(w);u.pitch=0.1;u.rate=0.6;u.volume=Math.min(1,G.vol);speechSynthesis.speak(u)}catch(e){}}return w}
G.capture=capture;G.BANK=BANK;
function tick(){var f=(87.5+Math.random()*20.5).toFixed(1);lcd(f,'FM SWEEP · '+Math.round(1000/interval())+'/s');if(Math.random()<0.35)fragment();if(Math.random()<0.04+G.emf*0.06)capture();timer=setTimeout(tick,interval())}
function interval(){return Math.round(400-G.speed*340)}
G.interval=interval;
function startScan(){A();G.scan=true;startNoise();$('gScan').textContent='Stop scan';note('scan','start');tick()}
function stopScan(){G.scan=false;clearTimeout(timer);stopNoise();$('gScan').textContent='Start scan';note('scan','stop');lcd('--.-','SCAN STOPPED')}
G.startScan=startScan;G.stopScan=stopScan;
$('gScan').onclick=function(){G.scan?stopScan():startScan()};
// EMF
var last=null;
window.addEventListener('devicemotion',function(e){var a=e.accelerationIncludingGravity;if(!a||a.x==null)return;if(last){var d=Math.abs(a.x-last.x)+Math.abs(a.y-last.y)+Math.abs(a.z-last.z);G.sensor=Math.max(G.sensor,Math.min(1,d/8))}last={x:a.x,y:a.y,z:a.z}});
try{if('Magnetometer' in window){var mg=new Magnetometer({frequency:10});var base=null;mg.addEventListener('reading',function(){var v=Math.hypot(mg.x,mg.y,mg.z);if(base==null)base=v;G.sensor=Math.max(G.sensor,Math.min(1,Math.abs(v-base)/40))});mg.start()}}catch(e){}
setInterval(function(){if(!G.on)return;var spike=G.scan&&Math.random()<0.05?0.5+Math.random()*0.5:0;G.emf=Math.max(G.emf*0.85,spike,G.sensor,G.scan?Math.random()*0.15:0);G.sensor*=0.8;$('emf').style.width=Math.round(G.emf*100)+'%';$('emfv').textContent=(G.emf*5).toFixed(1);if(G.emf>0.7)note('emf',(G.emf*5).toFixed(1)+' mG spike')},150);
// knobs
function knob(el,get,set){var y0=null,v0;el.style.transform='rotate('+(-135+270*get())+'deg)';el.addEventListener('pointerdown',function(e){y0=e.clientY;v0=get();el.setPointerCapture(e.pointerId)});el.addEventListener('pointermove',function(e){if(y0===null)return;set(Math.min(1,Math.max(0,v0+(y0-e.clientY)/150)));el.style.transform='rotate('+(-135+270*get())+'deg)'});el.addEventListener('pointerup',function(){y0=null})}
knob($('kSweep'),function(){return G.speed},function(v){G.speed=v;localStorage.cbgsp=v});
knob($('kGVol'),function(){return G.vol},function(v){G.vol=v;localStorage.cbgvol=v;if(ng)ng.gain.value=0.12*v});
$('gSpeak').onclick=function(){G.speak=!G.speak;this.textContent='Voice: '+(G.speak?'on':'off')};
$('gGlow').onclick=function(){document.body.classList.toggle('glow');localStorage.cbglow=document.body.classList.contains('glow')?1:''};
if(localStorage.cbglow)document.body.classList.add('glow');
$('gRec').onclick=function(){G.rec=!G.rec;if(G.rec){G.session=[];note('session','recording started');this.textContent='Stop recording'}else{note('session','recording stopped');this.textContent='Record session';save()}};
function logText(){var s=G.session.length?G.session:G.words.map(function(w){return{local:'',type:'word',text:w}});return 'Coffeebreak CB Ghost Scanner session\nFor entertainment only\n'+new Date().toString()+'\n\n'+s.map(function(e){return (e.local||'')+'  '+e.type+'  '+e.text}).join('\n')}
G.logText=logText;
function save(){var b=new Blob([logText()],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='ghost-session-'+Date.now()+'.txt';document.body.appendChild(a);a.click();a.remove();try{localStorage.cbglast=logText()}catch(e){}}
G.save=save;
$('gSave').onclick=save;$('gClear').onclick=function(){$('glog').textContent='';G.words=[]};
// mode switch
function mode(g){G.on=g;$('ghostUI').hidden=!g;$('radioUI').hidden=g;$('mGhost').classList.toggle('on',g);$('mRadio').classList.toggle('on',!g);
 if(g){if(CB.tx)CB.txEnd();lcd('--.-','GHOST MODE · TAP START')}else{if(G.scan)stopScan();$('lcd').firstChild.nodeValue=(CB.ch<10?'0':'')+CB.ch;$('lcds').textContent='CH '+CB.ch+' · RX'}}
G.mode=mode;
$('mGhost').onclick=function(){mode(true)};$('mRadio').onclick=function(){mode(false)};
})();
