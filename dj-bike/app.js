'use strict';
(function(){
const $=s=>document.querySelector(s);
const KEYS=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const SCALES={minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],'minor pentatonic':[0,3,5,7,10],'major pentatonic':[0,2,4,7,9],blues:[0,3,5,6,7,10],mixolydian:[0,2,4,5,7,9,10]};
const SCN=Object.keys(SCALES);
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const p2=n=>String(n).padStart(2,'0');
const pat=s=>{const a=new Array(16).fill(0);for(let i=0;i<16;i++)if(s[i]==='x')a[i]=1;else if(s[i]==='g')a[i]=0.4;return a};
const mtof=m=>440*Math.pow(2,(m-69)/12);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- audio ---------- */
let ac=null,NB=null,bus,fx={},masterG,comp,analyser,recDest,padBus;
function curveDrive(a){if(a<=0)return null;const n=1024,c=new Float32Array(n),k=1+a*40;for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return c}
function curveCrush(a){if(a<=0)return null;const steps=Math.round(64-a*60),n=2048,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.round(x*steps)/steps}return c}
function impulse(sec){const len=Math.floor(ac.sampleRate*sec),b=ac.createBuffer(2,len,ac.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3)}return b}
function ensureAudio(){
 if(ac){if(ac.state==='suspended')ac.resume();return ac}
 ac=new (window.AudioContext||window.webkitAudioContext)();
 NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 bus=ac.createGain();padBus=ac.createGain();padBus.connect(bus);
 fx.drive=ac.createWaveShaper();fx.crush=ac.createWaveShaper();
 fx.fl=ac.createDelay(0.05);fx.fl.delayTime.value=0.004;fx.flW=ac.createGain();fx.flW.gain.value=0;fx.flFb=ac.createGain();fx.flFb.gain.value=0;
 fx.lfo=ac.createOscillator();fx.lfo.frequency.value=0.25;fx.lfoG=ac.createGain();fx.lfoG.gain.value=0.003;fx.lfo.connect(fx.lfoG);fx.lfoG.connect(fx.fl.delayTime);fx.lfo.start();
 fx.out=ac.createGain();
 bus.connect(fx.drive);fx.drive.connect(fx.crush);fx.crush.connect(fx.out);fx.crush.connect(fx.fl);fx.fl.connect(fx.flFb);fx.flFb.connect(fx.fl);fx.fl.connect(fx.flW);fx.flW.connect(fx.out);
 masterG=ac.createGain();masterG.gain.value=+$('#master').value;
 fx.dSend=ac.createGain();fx.dSend.gain.value=0;fx.delay=ac.createDelay(2);fx.dFb=ac.createGain();
 fx.out.connect(fx.dSend);fx.dSend.connect(fx.delay);fx.delay.connect(fx.dFb);fx.dFb.connect(fx.delay);fx.delay.connect(masterG);
 fx.rSend=ac.createGain();fx.rSend.gain.value=0;fx.rev=ac.createConvolver();fx.rev.buffer=impulse(1.8);fx.out.connect(fx.rSend);fx.rSend.connect(fx.rev);fx.rev.connect(masterG);
 fx.out.connect(masterG);
 comp=ac.createDynamicsCompressor();comp.threshold.value=-10;comp.ratio.value=6;
 analyser=ac.createAnalyser();analyser.fftSize=512;
 masterG.connect(comp);comp.connect(analyser);analyser.connect(ac.destination);
 try{recDest=ac.createMediaStreamDestination();comp.connect(recDest)}catch(e){}
 decks.forEach(buildDeckAudio);applyFx();updateXf();
 setInterval(sched,25);
 return ac;
}
/* voices */
function env(g,t,v,a,d){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(v,0.0002),t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d)}
function tone(out,t,o){const os=ac.createOscillator(),g=ac.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+(o.gt||o.dur));if(o.det)os.detune.value=o.det;let n=os;if(o.lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);n=f}n.connect(g);g.connect(out);env(g,t,o.v||0.3,o.att||0.003,o.dur);os.start(t);os.stop(t+(o.att||0.003)+o.dur+0.05);return os}
function noise(out,t,o){const s=ac.createBufferSource();s.buffer=NB;const f=ac.createBiquadFilter(),g=ac.createGain();f.type=o.ft||'highpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+(o.gt||o.dur));f.Q.value=o.q||0.7;s.connect(f);f.connect(g);g.connect(out);env(g,t,o.v||0.3,o.att||0.002,o.dur);s.start(t,Math.random());s.stop(t+(o.att||0.002)+o.dur+0.05)}
function kick(out,t,v,kp,kd,pf){tone(out,t,{f:kp*3.5*pf,f2:kp*pf,gt:0.07,dur:kd,v:v*0.9})}
function snare(out,t,v,st){noise(out,t,{f:1200,dur:0.16,v:v*0.35});tone(out,t,{type:'triangle',f:st,f2:st*0.7,dur:0.1,v:v*0.25})}
function hat(out,t,v,dec){noise(out,t,{f:7500,dur:dec,v:v*0.18})}
function clap(out,t,v){for(let i=0;i<3;i++)noise(out,t+i*0.011,{ft:'bandpass',f:1400,q:1.2,dur:0.03,v:v*0.3});noise(out,t+0.033,{ft:'bandpass',f:1300,q:1,dur:0.18,v:v*0.25})}
const SAMPLE_TYPES={
 kick:(o,t,p,d)=>kick(o,t,1,55*p,0.45*d,1),
 snare:(o,t,p,d)=>snare(o,t,1,190*p),
 clap:(o,t)=>clap(o,t,1),
 rim:(o,t,p)=>{tone(o,t,{type:'square',f:1700*p,dur:0.03,v:0.2});noise(o,t,{f:3000,dur:0.02,v:0.2})},
 'closed hat':(o,t,p,d)=>hat(o,t,1,0.05*d),
 'open hat':(o,t,p,d)=>hat(o,t,1,0.3*d),
 crash:(o,t,p,d)=>noise(o,t,{f:5000*p,dur:1.3*d,v:0.25}),
 'low tom':(o,t,p,d)=>tone(o,t,{f:130*p,f2:85*p,dur:0.35*d,v:0.6}),
 'high tom':(o,t,p,d)=>tone(o,t,{f:230*p,f2:160*p,dur:0.28*d,v:0.55}),
 cowbell:(o,t,p,d)=>{tone(o,t,{type:'square',f:540*p,dur:0.3*d,v:0.12,lp:3000});tone(o,t,{type:'square',f:800*p,dur:0.3*d,v:0.12,lp:3000})},
 shaker:(o,t,p,d)=>noise(o,t,{f:6000*p,att:0.03,dur:0.08*d,v:0.2}),
 conga:(o,t,p,d)=>tone(o,t,{f:320*p,f2:230*p,dur:0.22*d,v:0.5}),
 '808 boom':(o,t,p,d)=>tone(o,t,{f:85*p,f2:48*p,gt:0.15,dur:1.2*d,v:0.8}),
 'bike bell':(o,t,p,d)=>{for(const k of [0,0.14]){tone(o,t+k,{f:2100*p,dur:1*d,v:0.15});tone(o,t+k,{f:2950*p,dur:0.8*d,v:0.1});tone(o,t+k,{f:4200*p,dur:0.4*d,v:0.05})}},
 'bike horn':(o,t,p,d)=>{tone(o,t,{type:'square',f:420*p,f2:380*p,dur:0.25*d,v:0.15,lp:1800});tone(o,t+0.3*d,{type:'square',f:420*p,f2:360*p,dur:0.3*d,v:0.15,lp:1800})},
 'air horn':(o,t,p,d)=>{[[0,0.12],[0.16,0.12],[0.32,0.5*d]].forEach(([k,l])=>{for(const det of [-12,0,9])tone(o,t+k,{type:'sawtooth',f:466*p,det,att:0.01,dur:l,v:0.08,lp:3500})})},
 siren:(o,t,p,d)=>{const os=ac.createOscillator(),g=ac.createGain();os.type='triangle';const L=1.6*d;for(let i=0;i<=8;i++)os.frequency.linearRampToValueAtTime((i%2?1300:650)*p,t+L*i/8);os.connect(g);g.connect(o);env(g,t,0.2,0.02,L);os.start(t);os.stop(t+L+0.1)},
 laser:(o,t,p,d)=>tone(o,t,{type:'square',f:2200*p,f2:120*p,dur:0.25*d,v:0.12}),
 zap:(o,t,p,d)=>tone(o,t,{type:'sawtooth',f:900*p,f2:40*p,dur:0.15*d,v:0.15}),
 riser:(o,t,p,d)=>noise(o,t,{ft:'bandpass',f:200*p,f2:8000*p,q:3,att:1.8*d,dur:0.1,v:0.35}),
 downlifter:(o,t,p,d)=>noise(o,t,{ft:'bandpass',f:8000*p,f2:150*p,q:3,dur:1.5*d,v:0.35}),
 impact:(o,t,p,d)=>{tone(o,t,{f:90*p,f2:35*p,dur:1.4*d,v:0.8});noise(o,t,{ft:'lowpass',f:2500,dur:0.8*d,v:0.3});noise(o,t,{f:5000,dur:1.2*d,v:0.12})},
 scratch:(o,t,p,d)=>{const s=ac.createBufferSource();s.buffer=NB;const f=ac.createBiquadFilter(),g=ac.createGain();f.type='bandpass';f.Q.value=4;const L=0.32*d;[600,2600,700,2200,500].forEach((v,i)=>f.frequency.linearRampToValueAtTime(v*p,t+L*i/4));s.connect(f);f.connect(g);g.connect(o);env(g,t,0.5,0.005,L);s.start(t);s.stop(t+L+0.05)},
 'vinyl stop':(o,t,p,d)=>tone(o,t,{type:'sawtooth',f:220*p,f2:18,dur:0.8*d,v:0.18,lp:1200}),
 bell:(o,t,p,d)=>{const f=660*p;tone(o,t,{f,dur:1.5*d,v:0.2});tone(o,t,{f:f*2.76,dur:0.9*d,v:0.08});tone(o,t,{f:f*5.4,dur:0.4*d,v:0.04})},
 chime:(o,t,p,d)=>{[0,4,7,12].forEach((s,i)=>tone(o,t+i*0.09,{f:1046*p*Math.pow(2,s/12),dur:0.9*d,v:0.1}))},
 stab:(o,t,p,d)=>{[0,3,7].forEach(s=>tone(o,t,{type:'sawtooth',f:220*p*Math.pow(2,s/12),dur:0.25*d,v:0.1,lp:2500}))},
 'vox hey':(o,t,p,d)=>{const os=ac.createOscillator(),g=ac.createGain();os.type='sawtooth';os.frequency.setValueAtTime(190*p,t);os.frequency.linearRampToValueAtTime(160*p,t+0.25*d);[[700,6],[1200,8]].forEach(([fq,q])=>{const f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=fq*p;f.Q.value=q;os.connect(f);f.connect(g)});g.connect(o);env(g,t,0.9,0.01,0.25*d);os.start(t);os.stop(t+0.35*d);noise(o,t,{f:2500,dur:0.04,v:0.1})},
 whistle:(o,t,p,d)=>{const os=tone(o,t,{f:1800*p,att:0.02,dur:0.5*d,v:0.12});const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=7;lg.gain.value=40;l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+0.6*d)},
 'sub drop':(o,t,p,d)=>tone(o,t,{f:90*p,f2:28,dur:1.2*d,v:0.8})
};
const STYPES=Object.keys(SAMPLE_TYPES);
function playSample(sp,t,out){ensureAudio();SAMPLE_TYPES[sp.type](out||padBus,t||ac.currentTime+0.01,sp.p||1,sp.d||1)}

/* ---------- decks ---------- */
const decks=['A','B'].map(n=>({n,bpm:120,rate:0,bend:1,brakeF:1,playing:false,count:0,next:0,roll:0,rollStart:0,rollFrom:0,angle:0,mute:{d:0,b:0,l:0,c:0},pat:emptyPat(),vis:[],cur:-1,name:'Empty'}));
function emptyPat(){return{drums:{k:pat(''),s:pat(''),h:pat(''),o:pat(''),c:pat('')},kit:{kp:52,kd:0.4,st:190,hd:0.05},swing:0,bass:null,lead:null,chords:null}}
function buildDeckAudio(d){d.in=ac.createGain();d.low=ac.createBiquadFilter();d.low.type='lowshelf';d.low.frequency.value=250;d.mid=ac.createBiquadFilter();d.mid.type='peaking';d.mid.frequency.value=1000;d.mid.Q.value=0.8;d.high=ac.createBiquadFilter();d.high.type='highshelf';d.high.frequency.value=4000;d.filt=ac.createBiquadFilter();d.filt.type='lowpass';d.filt.frequency.value=20000;d.vol=ac.createGain();d.xg=ac.createGain();
 d.in.connect(d.low);d.low.connect(d.mid);d.mid.connect(d.high);d.high.connect(d.filt);d.filt.connect(d.vol);d.vol.connect(d.xg);d.xg.connect(bus);
 const u=d.ui;['vol','hi','mi','lo','flt'].forEach(k=>u[k].dispatchEvent(new Event('input')))}
const effBpm=d=>d.bpm*(1+d.rate/100);
function stepDur(d){return 60/(effBpm(d)*d.bend*d.brakeF)/4}
function sched(){if(!ac)return;const now=ac.currentTime;for(const d of decks){if(!d.playing)continue;if(d.next<now-0.2)d.next=now+0.02;while(d.next<now+0.12){playStep(d,d.next);const dur=stepDur(d),sw=d.pat.swing||0;d.next+=dur*(d.count%2?(1-sw):(1+sw));d.count++;if(d.brake){d.brakeF=Math.max(0.05,1-(now-d.brake.t0)/d.brake.dur);if(d.brakeF<=0.06){d.playing=false;d.brake=null;d.brakeF=1;syncDeckUI(d);break}}}}}
function pos(d){return d.roll?d.rollStart+((d.count-d.rollFrom)%d.roll):d.count}
function playStep(d,t){const P=d.pat,ps=pos(d),s=ps%16,pf=d.brakeF<1?0.5+d.brakeF/2:1,o=d.in;
 if(!d.mute.d){const D=P.drums,K=P.kit;if(D.k[s])kick(o,t,D.k[s],K.kp,K.kd,pf);if(D.s[s])snare(o,t,D.s[s],K.st*pf);if(D.c[s])clap(o,t,D.c[s]);if(D.o[s])hat(o,t,D.o[s],0.25);else if(D.h[s])hat(o,t,D.h[s],K.hd)}
 const sd=stepDur(d);
 if(P.bass&&!d.mute.b)voice(o,t,P.bass,ps,sd,pf,'b');
 if(P.lead&&!d.mute.l)voice(o,t,P.lead,ps,sd,pf,'l');
 if(P.chords&&!d.mute.c)voice(o,t,P.chords,ps,sd,pf,'c');
 d.vis.push({t,s})}
function voice(out,t,tr,ps,sd,pf,kind){const e=tr.ev[ps%tr.ev.length];if(!e)return;const V=tr.v,len=Math.max(0.05,e.d*sd);
 for(const m of e.n){const f=mtof(m)*pf;
  if(kind==='b'){const os=ac.createOscillator(),fl=ac.createBiquadFilter(),g=ac.createGain();os.type=V.wave;os.frequency.value=f;fl.type='lowpass';fl.Q.value=V.res;fl.frequency.setValueAtTime(V.cut*(1+V.env*4),t);fl.frequency.exponentialRampToValueAtTime(V.cut,t+Math.min(len,0.25));os.connect(fl);fl.connect(g);g.connect(out);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(V.v,t+0.005);g.gain.setValueAtTime(V.v,t+len*0.8);g.gain.exponentialRampToValueAtTime(0.0001,t+len+0.03);os.start(t);os.stop(t+len+0.06);if(V.sub)tone(out,t,{f:f/2,dur:len,v:V.v*0.6})}
  else{const att=V.att||0.005;tone(out,t,{type:V.wave,f,det:V.det||0,att,dur:kind==='c'&&V.hold?len:Math.min(len,V.dec||len),v:V.v/(kind==='c'?e.n.length*0.6:1),lp:V.lp});if(V.det)tone(out,t,{type:V.wave,f,det:-V.det,att,dur:Math.min(len,V.dec||len),v:V.v*0.6/(kind==='c'?e.n.length:1),lp:V.lp})}}}
function loadInto(d,fn,name){fn(d);d.name=name;syncDeckUI(d);if(ac&&!d.playing)startDeck(d)}
function startDeck(d){ensureAudio();d.playing=true;d.count=0;d.next=ac.currentTime+0.05;d.brake=null;d.brakeF=1;const o=decks.find(x=>x!==d);if(o.playing){d.next=o.next;d.count=o.count%16===0?0:o.count}syncDeckUI(d)}

/* ---------- generators ---------- */
const GENRES=[
 {n:'House',bpm:[120,126],k:'x...x...x...x...',s:'',c:'....x.......x...',h:'x.x.x.x.x.x.x.x.',o:'..x...x...x...x.',sw:0},
 {n:'Techno',bpm:[128,136],k:'x...x...x...x...',s:'',c:'....x.......x...',h:'xxxxxxxxxxxxxxxx',o:'..x...x...x...x.',sw:0},
 {n:'Hip hop',bpm:[84,96],k:'x......x..x.....',s:'....x.......x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0.12},
 {n:'Drum and bass',bpm:[170,176],k:'x.........x.....',s:'....x.......x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0},
 {n:'Dubstep',bpm:[140,140],k:'x.........x.....',s:'........x.......',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0},
 {n:'Trap',bpm:[136,150],k:'x......x.x......',s:'........x.......',c:'........x.......',h:'xxxxxxxxxxxxxxxx',o:'',sw:0},
 {n:'Breakbeat',bpm:[126,134],k:'x.....x...x.....',s:'....x..g.g..x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0.05},
 {n:'Disco',bpm:[112,120],k:'x...x...x...x...',s:'....x.......x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'..x...x...x...x.',sw:0},
 {n:'Reggaeton',bpm:[90,98],k:'x...x...x...x...',s:'...x..x....x..x.',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0},
 {n:'UK garage',bpm:[130,134],k:'x......x..x.....',s:'....x.......x...',c:'',h:'..x...x...x...x.',o:'',sw:0.15},
 {n:'Electro',bpm:[124,130],k:'x..x..x...x.....',s:'....x.......x...',c:'....x.......x...',h:'x.x.x.x.x.x.x.x.',o:'',sw:0},
 {n:'Lo-fi',bpm:[72,88],k:'x.......x.x.....',s:'....x.......x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0.18},
 {n:'Afrobeat',bpm:[100,110],k:'x..x..x...x..x..',s:'....x.......x...',c:'',h:'x.xxx.xxx.xxx.xx',o:'',sw:0.08},
 {n:'Funk',bpm:[98,110],k:'x.x....x..x.....',s:'....x..g.g..x..g',c:'',h:'xxxxxxxxxxxxxxxx',o:'',sw:0.1},
 {n:'Amapiano',bpm:[110,115],k:'x...x...x...x...',s:'',c:'....x.......x...',h:'..x...x...x...x.',o:'',sw:0.06},
 {n:'Rock',bpm:[110,130],k:'x.......x.x.....',s:'....x.......x...',c:'',h:'x.x.x.x.x.x.x.x.',o:'',sw:0},
 {n:'Jungle',bpm:[160,168],k:'x.........x.....',s:'....x..g.g..x..g',c:'',h:'x.xxx.x.x.xxx.x.',o:'',sw:0.04},
 {n:'Bike ride',bpm:[104,112],k:'x...x...x..xx...',s:'....x.......x...',c:'............x...',h:'x.xxx.xxx.xxx.xx',o:'..x.......x.....',sw:0.05}
];
function makeDrums(g,r,v){const D={k:pat(g.k),s:pat(g.s),c:pat(g.c),h:pat(g.h),o:pat(g.o)};const amt=Math.min(0.5,(v-1)*0.04);
 if(v>1){for(let i=0;i<16;i++){if(r()<amt*0.5&&!D.k[i]&&i%4)D.k[i]=0.8;if(r()<amt*0.5&&!D.s[i]&&!D.c[i])D.s[i]=0.35;if(r()<amt)D.h[i]=D.h[i]?0:0.6;if(r()<amt*0.3&&!D.o[i])D.o[i]=r()<0.5?0.7:0;}
  if(g.n==='Trap'&&r()<0.6){const st=12+Math.floor(r()*3);D.h=D.h.slice()}}
 for(let i=0;i<16;i++)if(D.h[i]&&i%4!==0)D.h[i]*=0.7;
 return{D,kit:{kp:44+r()*22,kd:0.3+r()*0.4,st:160+r()*80,hd:0.03+r()*0.05},sw:g.sw}}
const BSTY=[
 {n:'Sub',r:'x.......x.......',wave:'sine',cut:400,res:1,env:0,dl:8,v:0.5},
 {n:'Rolling',r:'x.xx.xx.xx.xx.xx',wave:'sawtooth',cut:500,res:4,env:0.6,dl:1,v:0.25},
 {n:'Acid',r:'?',wave:'sawtooth',cut:350,res:14,env:1.5,dl:1,v:0.22},
 {n:'Octave',r:'x.x.x.x.x.x.x.x.',wave:'square',cut:700,res:2,env:0.4,dl:1,oct:1,v:0.2},
 {n:'Funky',r:'x..x..x.x.x..x..',wave:'square',cut:900,res:3,env:0.8,dl:1,v:0.22},
 {n:'Wobble',r:'x.......x...x...',wave:'sawtooth',cut:300,res:8,env:2,dl:4,v:0.25},
 {n:'Reese',r:'x.......x.......',wave:'sawtooth',cut:600,res:1,env:0.2,dl:8,v:0.22,sub:1},
 {n:'Pluck',r:'..x...x...x...x.',wave:'square',cut:800,res:5,env:1,dl:1,v:0.22},
 {n:'Walking',r:'x...x...x...x...',wave:'triangle',cut:1500,res:1,env:0.2,dl:3,v:0.4},
 {n:'Log drum',r:'..x..x..x.x...x.',wave:'sine',cut:900,res:2,env:0.6,dl:2,v:0.5,sub:1}
];
function scaleNote(root,sc,deg,oct){const S=SCALES[sc],n=S.length,o=Math.floor(deg/n),i=((deg%n)+n)%n;return root+S[i]+12*(o+(oct||0))}
function makeBass(st,key,sc,r){const ev=new Array(16).fill(null),rhy=st.r==='?'?Array.from({length:16},(_,i)=>i%4===0||r()<0.6?'x':'.').join(''):st.r;const root=36+key;
 for(let i=0;i<16;i++)if(rhy[i]==='x'){let deg=r()<0.55?0:[0,2,4,-3,1,5,-1][Math.floor(r()*7)];let m=scaleNote(root,sc,deg);if(st.oct&&i%4===2)m+=12;if(st.n==='Walking')deg=[0,2,4,5][i/4|0],m=scaleNote(root,sc,deg);ev[i]={n:[m],d:st.dl}}
 return{ev,v:{wave:st.wave,cut:st.cut,res:st.res,env:st.env,v:st.v,sub:st.sub}}}
const MSTY=[
 {n:'Arp up',wave:'sawtooth',lp:3000,dec:0.15,v:0.08,mk:(r,k,s)=>Array.from({length:16},(_,i)=>({n:[scaleNote(60+k,s,[0,2,4,7][i%4])],d:1}))},
 {n:'Arp down',wave:'square',lp:2500,dec:0.15,v:0.06,mk:(r,k,s)=>Array.from({length:16},(_,i)=>({n:[scaleNote(60+k,s,[7,4,2,0][i%4])],d:1}))},
 {n:'Arp bounce',wave:'triangle',dec:0.2,v:0.12,mk:(r,k,s)=>Array.from({length:16},(_,i)=>({n:[scaleNote(60+k,s,[0,4,2,7,4,9,7,4][i%8])],d:1}))},
 {n:'Lead hook',wave:'sawtooth',lp:2600,det:8,dec:0.4,v:0.07,mk:(r,k,s)=>Array.from({length:32},(_,i)=>i%2===0&&r()<0.6?{n:[scaleNote(64+k,s,Math.floor(r()*8)-1)],d:2}:null)},
 {n:'Bells',wave:'sine',dec:0.8,v:0.14,mk:(r,k,s)=>Array.from({length:32},(_,i)=>i%4===0&&r()<0.8?{n:[scaleNote(72+k,s,Math.floor(r()*7))],d:4}:null)},
 {n:'Pluck riff',wave:'square',lp:1800,dec:0.12,v:0.07,mk:(r,k,s)=>Array.from({length:16},(_,i)=>r()<0.55?{n:[scaleNote(60+k,s,Math.floor(r()*6))],d:1}:null)},
 {n:'Chiptune',wave:'square',dec:0.08,v:0.05,mk:(r,k,s)=>Array.from({length:16},(_,i)=>({n:[scaleNote(72+k,s,[0,2,4][i%3]+(i>7?1:0))],d:1}))},
 {n:'Flute line',wave:'triangle',att:0.05,dec:0.6,v:0.14,mk:(r,k,s)=>Array.from({length:32},(_,i)=>i%4===0||(i%4===3&&r()<0.4)?{n:[scaleNote(72+k,s,Math.floor(r()*6))],d:3}:null)},
 {n:'Sparkle',wave:'sine',dec:0.25,v:0.08,mk:(r,k,s)=>Array.from({length:16},(_,i)=>r()<0.4?{n:[scaleNote(84+k,s,Math.floor(r()*7))],d:1}:null)},
 {n:'Synth brass',wave:'sawtooth',att:0.03,lp:1800,det:12,dec:0.5,v:0.06,mk:(r,k,s)=>Array.from({length:32},(_,i)=>[0,6,12,16,22].includes(i)?{n:[scaleNote(60+k,s,Math.floor(r()*5))],d:3}:null)}
];
const PROGS=[['i-VI-III-VII',[0,5,2,6]],['i-iv-v-i',[0,3,4,0]],['i-VII-VI-VII',[0,6,5,6]],['i-v-VI-iv',[0,4,5,3]],['i-iv-VII-III',[0,3,6,2]],['i-VI-iv-v',[0,5,3,4]],['i-III-VII-iv',[0,2,6,3]],['i-i-VI-VII',[0,0,5,6]],['ii-v-i',[1,4,0,0]],['i-VII-iv-i',[0,6,3,0]]];
const CSND=[{n:'Pad',wave:'sawtooth',att:0.3,lp:1400,hold:1,v:0.12,r:[0]},{n:'Stab',wave:'sawtooth',lp:2500,dec:0.15,v:0.12,r:[0,3,6,10,12]},{n:'Organ',wave:'square',lp:2200,dec:0.2,v:0.08,r:[2,6,10,14]},{n:'Keys',wave:'triangle',dec:0.9,v:0.2,r:[0,8]},{n:'Pluck chords',wave:'square',lp:1600,dec:0.12,v:0.08,r:[0,2,4,6,8,10,12,14]}];
function makeChords(prog,key,snd){const ev=new Array(64).fill(null);prog.forEach((deg,b)=>{const ch=[0,2,4].map(x=>scaleNote(48+key,'minor',deg+x));snd.r.forEach(s=>{ev[b*16+s]={n:ch,d:snd.hold?16:2}})});return{ev,v:{wave:snd.wave,att:snd.att,lp:snd.lp,dec:snd.dec,hold:snd.hold,v:snd.v}}}

/* ---------- tools ---------- */
const TOOLS=[],CATS=['Drum loops','Bass lines','Melodies','Chord loops','Pad kits','Samples','Effects','Filters','Sequencer patterns','Bike tricks'];
function add(cat,name,tags,run,kind){TOOLS.push({id:TOOLS.length+1,cat,name,tags:tags.join(' '),run,kind:kind||'load',search:(name+' '+cat+' '+tags.join(' ')).toLowerCase()})}
const tgt=()=>decks[$('#target').value==='B'?1:0];
// drum loops 220
for(let i=0;i<220;i++){const g=GENRES[i%18],v=(i/18|0)+1,r=rng(1000+i),bpm=Math.round(g.bpm[0]+r()*(g.bpm[1]-g.bpm[0])),dr=makeDrums(g,r,v),nm=`${g.n} groove ${p2(v)}`;
 add('Drum loops',nm,[g.n.toLowerCase(),bpm+' bpm','drums','beat','loop'],()=>{const d=tgt();loadInto(d,d=>{d.pat.drums=dr.D;d.pat.kit=dr.kit;d.pat.swing=dr.sw;d.bpm=bpm},nm)})}
// bass 200
for(let i=0;i<200;i++){const st=BSTY[i%10],k=(i*7)%12,sc=['minor','dorian','phrygian','minor pentatonic','blues'][(i/10|0)%5],v=(i/10|0)+1,r=rng(5000+i),b=makeBass(st,k,sc,r),nm=`${st.n} bass in ${KEYS[k]} ${sc} ${p2(v)}`;
 add('Bass lines',nm,['bass',st.n.toLowerCase(),KEYS[k].toLowerCase(),sc],()=>{const d=tgt();loadInto(d,d=>{d.pat.bass=b},nm)})}
// melodies 200
for(let i=0;i<200;i++){const st=MSTY[i%10],k=(i*5)%12,sc=SCN[(i/10|0)%SCN.length],v=(i/10|0)+1,r=rng(9000+i),ev=st.mk(r,k,sc),tr={ev,v:{wave:st.wave,lp:st.lp,dec:st.dec,det:st.det,att:st.att,v:st.v}},nm=`${st.n} in ${KEYS[k]} ${sc} ${p2(v)}`;
 add('Melodies',nm,['melody','lead',st.n.toLowerCase(),KEYS[k].toLowerCase(),sc],()=>{const d=tgt();loadInto(d,d=>{d.pat.lead=tr},nm)})}
// chords 150
for(let i=0;i<150;i++){const pr=PROGS[i%10],snd=CSND[(i/10|0)%5],k=(i*7+3)%12,tr=makeChords(pr[1],k,snd),nm=`${snd.n} ${pr[0]} in ${KEYS[k]} minor`;
 add('Chord loops',nm,['chords','progression',snd.n.toLowerCase(),KEYS[k].toLowerCase(),'minor'],()=>{const d=tgt();loadInto(d,d=>{d.pat.chords=tr},nm)})}
// pad kits 150
const KITS=[['808 street',['kick','snare','clap','closed hat','open hat','808 boom','rim','cowbell','low tom','high tom','crash','shaker','conga','vox hey','air horn','sub drop']],['Bike shed',['kick','snare','bike bell','bike horn','closed hat','open hat','clap','scratch','vinyl stop','riser','downlifter','impact','whistle','cowbell','chime','zap']],['Laser',['laser','zap','kick','snare','closed hat','riser','downlifter','impact','sub drop','scratch','stab','clap','bell','chime','siren','air horn']],['Siren pack',['siren','air horn','bike horn','whistle','vox hey','impact','kick','clap','scratch','laser','riser','sub drop','snare','open hat','crash','bike bell']],['Percussion',['conga','cowbell','shaker','rim','low tom','high tom','clap','closed hat','open hat','kick','snare','bell','chime','whistle','crash','808 boom']],['Dub',['kick','snare','rim','closed hat','siren','air horn','sub drop','808 boom','laser','zap','bell','stab','vox hey','scratch','impact','downlifter']],['Festival',['kick','clap','snare','crash','riser','downlifter','impact','air horn','vox hey','stab','sub drop','whistle','laser','open hat','closed hat','scratch']],['Scratch',['scratch','vinyl stop','kick','snare','clap','closed hat','stab','vox hey','air horn','impact','rim','open hat','zap','laser','bell','808 boom']],['Chill',['bell','chime','kick','rim','shaker','closed hat','conga','whistle','snare','clap','low tom','high tom','open hat','stab','riser','downlifter']],['Trap',['808 boom','kick','snare','clap','closed hat','open hat','rim','sub drop','vox hey','air horn','laser','zap','impact','riser','crash','cowbell']],['Retro',['zap','laser','stab','kick','snare','closed hat','open hat','clap','cowbell','bell','chime','scratch','low tom','high tom','vinyl stop','impact']],['Cafe',['bell','chime','kick','rim','shaker','conga','clap','snare','closed hat','open hat','whistle','stab','bike bell','cowbell','low tom','808 boom']],['Night ride',['kick','snare','closed hat','open hat','sub drop','riser','downlifter','impact','laser','bike bell','bike horn','siren','stab','vox hey','chime','crash']],['Stadium',['kick','clap','air horn','whistle','vox hey','crash','impact','snare','808 boom','siren','cowbell','closed hat','open hat','riser','stab','scratch']],['Newcastle beach',['kick','snare','shaker','conga','bell','chime','bike bell','whistle','closed hat','open hat','clap','rim','riser','downlifter','stab','sub drop']]];
for(let i=0;i<150;i++){const K=KITS[i%15],v=(i/15|0)+1,r=rng(13000+i),tune=v===1?1:0.75+r()*0.6,dec=v===1?1:0.7+r()*0.8,pads=K[1].map(t=>({type:t,p:+(tune*(0.95+r()*0.1)).toFixed(3),d:+dec.toFixed(2)})),nm=`${K[0]} kit ${p2(v)}`;
 add('Pad kits',nm,['kit','pads',K[0].toLowerCase()],()=>{PADS=pads;renderPads();say(`${nm} is on the pads.`)})}
// samples 180
const SVAR=[['original',1,1],['low',0.8,1],['high',1.25,1],['deep long',0.66,1.5],['bright short',1.5,0.6],['long tail',1,2]];
for(let i=0;i<180;i++){const t=STYPES[i%30],vr=SVAR[i/30|0],sp={type:t,p:vr[1],d:vr[2]},nm=`${t[0].toUpperCase()+t.slice(1)}, ${vr[0]}`;add('Samples',nm,['sample','one shot',t,vr[0]],()=>playSample(sp),'sample');TOOLS[TOOLS.length-1].sp=sp}
// effects 150
const FXB=[['Dub echo',l=>({fxDelay:l*0.7,fxDelayT:0.375,fxFb:0.3+l*0.45})],['Slap echo',l=>({fxDelay:l*0.6,fxDelayT:0.09,fxFb:0.1})],['Eighth note echo',l=>({fxDelay:l*0.6,fxDelayT:(60/tempoNow())/2,fxFb:0.2+l*0.4})],['Triplet echo',l=>({fxDelay:l*0.6,fxDelayT:(60/tempoNow())/3,fxFb:0.2+l*0.4})],['Long echo',l=>({fxDelay:l*0.6,fxDelayT:0.75,fxFb:0.3+l*0.4})],['Small room reverb',l=>({fxRev:l*0.6,fxRoom:0.6})],['Hall reverb',l=>({fxRev:l*0.7,fxRoom:2.2})],['Cathedral reverb',l=>({fxRev:l*0.8,fxRoom:4.5})],['Warm drive',l=>({fxDrive:l*0.4})],['Fuzz drive',l=>({fxDrive:0.3+l*0.7})],['Bit crush',l=>({fxCrush:l})],['Lo-fi tape',l=>({fxCrush:l*0.5,fxDrive:l*0.3,fxRev:l*0.3,fxRoom:0.8})],['Jet flanger',l=>({fxFlange:l})],['Space wash',l=>({fxDelay:l*0.5,fxDelayT:0.5,fxFb:0.6,fxRev:l*0.7,fxRoom:3.5,fxFlange:l*0.4})],['Tunnel',l=>({fxRev:l*0.9,fxRoom:5,fxDelay:l*0.4,fxDelayT:0.25,fxFb:0.5})]];
for(let i=0;i<150;i++){const b=FXB[i%15],lv=(i/15|0)+1,nm=`${b[0]}, amount ${lv} of 10`;add('Effects',nm,['effect','fx',b[0].toLowerCase(),'level '+lv],()=>{fxOff(false);setFx(b[1](lv/10));say(`${b[0]} on at ${lv} of 10.`)})}
// filters 100
const FL=[];
[200,300,400,600,800,1000,1300,1600,2000,2500,3000,4000,5000,6500,8000].forEach(f=>FL.push([`Low pass ${f} Hz`,['low pass'],d=>setFilter(d,'lowpass',f,1)]));
[60,100,150,200,300,400,600,800,1000,1300,1600,2000,2500,3200,4000].forEach(f=>FL.push([`High pass ${f} Hz`,['high pass'],d=>setFilter(d,'highpass',f,1)]));
[300,500,800,1000,1200,1500,2000,2500,3000,4000].forEach(f=>FL.push([`Band pass ${f} Hz`,['band pass','telephone'],d=>setFilter(d,'bandpass',f,2)]));
[1,2,4,8,16].forEach(b=>{FL.push([`Low pass open over ${b} bar${b>1?'s':''}`,['sweep','low pass','build'],d=>sweep(d,'lowpass',150,20000,b)]);FL.push([`Low pass close over ${b} bar${b>1?'s':''}`,['sweep','low pass','breakdown'],d=>sweep(d,'lowpass',20000,150,b)]);FL.push([`Resonant sweep over ${b} bar${b>1?'s':''}`,['sweep','resonant','acid'],d=>sweep(d,'lowpass',200,8000,b,12)])});
[1,2,4,8,16].forEach(b=>{FL.push([`High pass rise over ${b} bar${b>1?'s':''}`,['sweep','high pass','build'],d=>sweep(d,'highpass',20,3000,b)]);FL.push([`High pass fall over ${b} bar${b>1?'s':''}`,['sweep','high pass','drop'],d=>sweep(d,'highpass',3000,20,b)]);FL.push([`Band pass sweep over ${b} bar${b>1?'s':''}`,['sweep','band pass'],d=>sweep(d,'bandpass',300,6000,b,3)])});
[['whole bar',4],['half bar',2],['quarter',1],['eighth',0.5],['sixteenth',0.25],['dotted eighth',0.75],['triplet',1/3],['two bars',8]].forEach(([n,beats],i)=>{[[400,3000],[200,1500],[800,5000]].forEach(([lo,hi],j)=>{if(FL.length<100)FL.push([`Wobble every ${n}${j?', '+['deep','bright'][j-1]:''}`,['wobble','lfo','dubstep'],d=>wobble(d,lo,hi,beats)])})});
while(FL.length<99){const q=FL.length-90+4;FL.push([`Resonance peak Q ${q*3}`,['resonance','low pass'],d=>setFilter(d,'lowpass',1200,q*3)])}
FL.push(['Filter reset',['reset','clean'],d=>resetFilter(d)]);
FL.slice(0,100).forEach(([nm,tags,fn])=>add('Filters',nm,['filter',...tags],()=>{ensureAudio();const d=tgt();fn(d);say(`${nm} on deck ${d.n}.`)}));
// sequencer patterns 100
for(let i=0;i<100;i++){const g=GENRES[i%18],k=(i*5+9)%12,v=(i/18|0)+1,r=rng(20000+i),bpm=Math.round(g.bpm[0]+r()*(g.bpm[1]-g.bpm[0])),dr=makeDrums(g,r,v+1),bs=makeBass(BSTY[(i*3)%10],k,'minor',r),ms=MSTY[(i*7)%10],ld={ev:ms.mk(r,k,'minor'),v:{wave:ms.wave,lp:ms.lp,dec:ms.dec,det:ms.det,att:ms.att,v:ms.v}},sn=CSND[i%5],ch=makeChords(PROGS[i%10][1],k,sn),nm=`${g.n} full pattern in ${KEYS[k]} minor ${p2(v)}`;
 add('Sequencer patterns',nm,['pattern','full','song',g.n.toLowerCase(),bpm+' bpm',KEYS[k].toLowerCase()],()=>{const d=tgt();loadInto(d,d=>{d.pat={drums:dr.D,kit:dr.kit,swing:dr.sw,bass:bs,lead:ld,chords:ch};d.bpm=bpm},nm)})}
// bike tricks 50
const TR=[['Bike brake',[0.5,1,1.5,2,3],(d,x)=>brake(d,x),x=>`${x} sec`],['Spin back',[0.3,0.5,0.8,1.2,1.6],(d,x)=>spinBack(d,x),x=>`${x} sec`],['Stutter',[8,4,2,1,3],(d,x)=>stutter(d,x),x=>({8:'half bar',4:'1 beat',2:'half beat',1:'quarter beat',3:'triplet'})[x]],['Gear up',[1,2,4,6,8],(d,x)=>{d.rate=clamp(d.rate+x*100/d.bpm,-16,16);syncDeckUI(d)},x=>`plus ${x} BPM`],['Gear down',[1,2,4,6,8],(d,x)=>{d.rate=clamp(d.rate-x*100/d.bpm,-16,16);syncDeckUI(d)},x=>`minus ${x} BPM`],['Echo out',[1,2,3,4,6],(d,x)=>echoOut(d,x),x=>`${x} sec`],['Wheelie riser',[1,2,4,8,16],(d,x)=>{playSample({type:'riser',d:x*4*60/tempoNow()/1.8});sweep(d,'highpass',20,2000,x);setTimeout(()=>{resetFilter(d);playSample({type:'impact'})},x*4*60000/tempoNow())},x=>`${x} bar${x>1?'s':''}`],['Freewheel',[1,2,4,8,16],(d,x)=>{d.mute.d=1;syncDeckUI(d);setTimeout(()=>{d.mute.d=0;syncDeckUI(d)},x*4*60000/tempoNow())},x=>`${x} bar${x>1?'s':''}, drums out`],['Bell ring',[1,2,3,4,6],(d,x)=>{for(let i=0;i<x;i++)playSample({type:'bike bell',p:1+i*0.03},ac.currentTime+0.05+i*0.35)},x=>`${x} ring${x>1?'s':''}`],['Drop in',[1,2,3,4,5],(d,x)=>{playSample({type:['impact','sub drop','air horn','crash','808 boom'][x-1]});d.count=0;if(!d.playing)startDeck(d)},x=>['impact','sub drop','air horn','crash','808 boom'][x-1]]];
TR.forEach(([n,vals,fn,lab])=>vals.forEach(x=>add('Bike tricks',`${n}, ${lab(x)}`,['trick','bike',n.toLowerCase()],()=>{ensureAudio();const d=tgt();fn(d,x);say(`${n} on deck ${d.n}.`)})));

/* ---------- fx and filter helpers ---------- */
const FXIDS=['fxDelay','fxDelayT','fxFb','fxRev','fxRoom','fxDrive','fxCrush','fxFlange'];
function tempoNow(){const p=decks.filter(d=>d.playing);return p.length?effBpm(p[0]):effBpm(decks[0])}
let roomT=0,lastRoom=1.8;
function applyFx(){if(!ac)return;const v=k=>+$('#'+k).value,t=ac.currentTime;fx.dSend.gain.setTargetAtTime(v('fxDelay'),t,0.02);fx.delay.delayTime.setTargetAtTime(v('fxDelayT'),t,0.05);fx.dFb.gain.setTargetAtTime(v('fxFb'),t,0.02);fx.rSend.gain.setTargetAtTime(v('fxRev'),t,0.02);
 fx.drive.curve=curveDrive(v('fxDrive'));fx.crush.curve=curveCrush(v('fxCrush'));fx.flW.gain.setTargetAtTime(v('fxFlange')*0.8,t,0.02);fx.flFb.gain.setTargetAtTime(v('fxFlange')*0.6,t,0.02);
 if(Math.abs(v('fxRoom')-lastRoom)>0.05){lastRoom=v('fxRoom');clearTimeout(roomT);roomT=setTimeout(()=>{fx.rev.buffer=impulse(lastRoom)},200)}}
function setFx(o){for(const k in o)$('#'+k).value=o[k];applyFx()}
function fxOff(msg){setFx({fxDelay:0,fxFb:0.35,fxRev:0,fxDrive:0,fxCrush:0,fxFlange:0});if(msg!==false)say('Effects are off.')}
function clearLfo(d){if(d.lfo){try{d.lfo.stop()}catch(e){}d.lfo=null}}
function setFilter(d,type,f,q){ensureAudio();clearLfo(d);const t=ac.currentTime;d.filt.type=type;d.filt.frequency.cancelScheduledValues(t);d.filt.frequency.setTargetAtTime(f,t,0.02);d.filt.Q.value=q||1}
function resetFilter(d){d.ui.flt.value=0;setFilter(d,'lowpass',20000,0.7)}
function sweep(d,type,a,b,bars,q){ensureAudio();clearLfo(d);const t=ac.currentTime,L=bars*4*60/tempoNow();d.filt.type=type;d.filt.Q.value=q||1;d.filt.frequency.cancelScheduledValues(t);d.filt.frequency.setValueAtTime(a,t);d.filt.frequency.exponentialRampToValueAtTime(b,t+L)}
function wobble(d,lo,hi,beats){setFilter(d,'lowpass',(lo+hi)/2,8);const l=ac.createOscillator(),g=ac.createGain();l.frequency.value=tempoNow()/60/beats;g.gain.value=(hi-lo)/2;l.connect(g);g.connect(d.filt.frequency);l.start();d.lfo=l}
function brake(d,sec){ensureAudio();if(!d.playing)return;d.brake={t0:ac.currentTime,dur:sec};playSample({type:'vinyl stop',d:sec},0,d.in)}
function spinBack(d,sec){ensureAudio();playSample({type:'downlifter',d:sec/1.5,p:1.4});playSample({type:'scratch',d:sec*2},0);const was=d.playing;d.playing=false;syncDeckUI(d);setTimeout(()=>{if(was)startDeck(d)},sec*1000+(60000/tempoNow())*2)}
function stutter(d,n){if(!d.playing)return;const p=pos(d);d.rollStart=p-(p%n);d.rollFrom=d.count;d.roll=n;setTimeout(()=>{d.roll=0},2*60000/tempoNow()*2)}
function echoOut(d,sec){ensureAudio();setFx({fxDelay:0.75,fxFb:0.7,fxDelayT:(60/tempoNow())*0.75});const t=ac.currentTime;d.vol.gain.setTargetAtTime(0,t+0.05,0.05);setTimeout(()=>{d.playing=false;syncDeckUI(d);d.vol.gain.setTargetAtTime(+d.ui.vol.value,ac.currentTime,0.05)},400);setTimeout(()=>setFx({fxDelay:0,fxFb:0.35}),sec*1000)}

/* ---------- deck UI ---------- */
function deckHTML(n){return `<h2><span class="tag">Deck ${n}</span><span class="bpm" data-k="bpm">120.0</span></h2>
<div class="track" data-k="trk">Empty</div><div class="jog" data-k="jog"><i></i></div><div class="steps" data-k="steps">${'<b></b>'.repeat(16)}</div>
<div class="row"><button class="btn play" data-k="play">Play</button><button class="btn" data-k="restart">Restart</button><button class="btn" data-k="sync">Sync</button></div>
<div class="row"><label>Tempo</label><input type="range" data-k="tempo" min="-16" max="16" step="0.1" value="0"></div>
<div class="row"><label>Volume</label><input type="range" data-k="vol" min="0" max="1" step="0.01" value="0.85"></div>
<div class="row"><label>High</label><input type="range" data-k="hi" min="-24" max="6" step="0.5" value="0"></div>
<div class="row"><label>Mid</label><input type="range" data-k="mi" min="-24" max="6" step="0.5" value="0"></div>
<div class="row"><label>Low</label><input type="range" data-k="lo" min="-24" max="6" step="0.5" value="0"></div>
<div class="row"><label>Filter</label><input type="range" data-k="flt" min="-1" max="1" step="0.01" value="0"></div>
<div class="row"><button class="btn on" data-m="d">Drums</button><button class="btn on" data-m="b">Bass</button><button class="btn on" data-m="l">Melody</button><button class="btn on" data-m="c">Chords</button></div>
<div class="row"><label>Hold loop</label><button class="btn" data-r="8">2 beats</button><button class="btn" data-r="4">1 beat</button><button class="btn" data-r="2">Half</button><button class="btn" data-r="1">Quarter</button></div>`}
decks.forEach(d=>{const el=$('#deck'+d.n);el.innerHTML=deckHTML(d.n);const u={};el.querySelectorAll('[data-k]').forEach(x=>u[x.dataset.k]=x);d.ui=u;d.el=el;
 u.play.onclick=()=>{ensureAudio();if(d.playing){d.playing=false;syncDeckUI(d)}else startDeck(d)};
 u.restart.onclick=()=>{ensureAudio();startDeck(d)};
 u.sync.onclick=()=>syncTo(d,decks.find(x=>x!==d));
 u.tempo.oninput=()=>{d.rate=+u.tempo.value;syncDeckUI(d)};
 u.vol.oninput=()=>{if(ac)d.vol.gain.setTargetAtTime(+u.vol.value,ac.currentTime,0.02)};
 [['hi','high'],['mi','mid'],['lo','low']].forEach(([k,n])=>u[k].oninput=()=>{if(ac)d[n].gain.setTargetAtTime(+u[k].value,ac.currentTime,0.02)});
 u.flt.oninput=()=>{if(!ac)return;clearLfo(d);const v=+u.flt.value,t=ac.currentTime;d.filt.frequency.cancelScheduledValues(t);if(v<-0.02){d.filt.type='lowpass';d.filt.Q.value=4;d.filt.frequency.setTargetAtTime(20000*Math.pow(0.01,-v),t,0.02)}else if(v>0.02){d.filt.type='highpass';d.filt.Q.value=4;d.filt.frequency.setTargetAtTime(20*Math.pow(200,v),t,0.02)}else{d.filt.type='lowpass';d.filt.Q.value=0.7;d.filt.frequency.setTargetAtTime(20000,t,0.02)}};
 el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{d.mute[b.dataset.m]^=1;syncDeckUI(d)});
 el.querySelectorAll('[data-r]').forEach(b=>{const on=e=>{e.preventDefault();if(!d.playing)return;const n=+b.dataset.r,p=pos(d);d.rollStart=p-(p%n);d.rollFrom=d.count;d.roll=n;b.classList.add('on')},off=()=>{d.roll=0;b.classList.remove('on')};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off)});
 let drag=null;u.jog.addEventListener('pointerdown',e=>{ensureAudio();const r=u.jog.getBoundingClientRect();drag={cx:r.left+r.width/2,cy:r.top+r.height/2,a:Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2),t:performance.now()};u.jog.setPointerCapture(e.pointerId);if(!d.playing)playSample({type:'scratch',d:0.6},0,d.in)});
 u.jog.addEventListener('pointermove',e=>{if(!drag)return;const a=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx);let da=a-drag.a;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;drag.a=a;d.angle+=da*57.3;d.bend=clamp(1+da*3,0.5,1.5)});
 const up=()=>{drag=null;d.bend=1};u.jog.addEventListener('pointerup',up);u.jog.addEventListener('pointercancel',up);
});
function syncDeckUI(d){const u=d.ui;u.bpm.textContent=effBpm(d).toFixed(1);u.trk.textContent=d.name;u.tempo.value=d.rate;u.play.textContent=d.playing?'Pause':'Play';u.play.classList.toggle('on',d.playing);d.el.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',!d.mute[b.dataset.m]));const k=d.pat.drums.k;u.steps.querySelectorAll('b').forEach((b,i)=>b.classList.toggle('k',!!k[i]))}
function syncTo(d,o){d.rate=clamp((effBpm(o)/d.bpm-1)*100,-16,16);if(effBpm(o)/d.bpm>1.16||effBpm(o)/d.bpm<0.84){d.bpm=effBpm(o);d.rate=0}if(d.playing&&o.playing){d.next=o.next;d.count=o.count}syncDeckUI(d);say(`Deck ${d.n} matched to ${effBpm(o).toFixed(1)} BPM.`)}

/* ---------- mixer controls ---------- */
function updateXf(){if(!ac)return;const x=+$('#xf').value;decks[0].xg.gain.setTargetAtTime(Math.cos(x*Math.PI/2),ac.currentTime,0.01);decks[1].xg.gain.setTargetAtTime(Math.sin(x*Math.PI/2),ac.currentTime,0.01)}
$('#xf').oninput=updateXf;
$('#master').oninput=()=>{if(ac)masterG.gain.setTargetAtTime(+$('#master').value,ac.currentTime,0.02)};
FXIDS.forEach(k=>$('#'+k).oninput=applyFx);
$('#fxOff').onclick=()=>fxOff();
$('#brake').onclick=()=>{decks.forEach(d=>brake(d,1.5));say('DJ Jase hits the brakes.')};
$('#spin').onclick=()=>{decks.filter(d=>d.playing).forEach(d=>spinBack(d,0.8));say('Spin back.')};
$('#syncBA').onclick=()=>syncTo(decks[1],decks[0]);$('#syncAB').onclick=()=>syncTo(decks[0],decks[1]);
let taps=[];$('#tap').onclick=()=>{const n=performance.now();taps=taps.filter(t=>n-t<3000);taps.push(n);if(taps.length>=3){const iv=(taps[taps.length-1]-taps[0])/(taps.length-1),bpm=clamp(60000/iv,60,200),d=tgt();d.bpm=bpm;d.rate=0;syncDeckUI(d);say(`Deck ${d.n} set to ${bpm.toFixed(1)} BPM by tapping.`)}else say('Keep tapping on the beat.')};
let autoT=null;$('#auto').onclick=()=>{ensureAudio();if(autoT){cancelAnimationFrame(autoT);autoT=null;say('Auto mix stopped.');return}const xf=$('#xf'),from=+xf.value,to=from<0.5?1:0,inc=decks[to],out=decks[1-to];if(!inc.playing){syncTo(inc,out);startDeck(inc)}const L=8*4*60000/effBpm(out),t0=performance.now();say(`Auto mix to deck ${inc.n} over 8 bars.`);const st=()=>{const k=Math.min(1,(performance.now()-t0)/L);xf.value=from+(to-from)*k;updateXf();if(k<1)autoT=requestAnimationFrame(st);else{autoT=null;say(`Now on deck ${inc.n}.`)}};st()};
let mr=null,chunks=[];$('#rec').onclick=()=>{ensureAudio();if(!recDest||!window.MediaRecorder){say('Recording is not supported in this browser.');return}if(mr){mr.stop();return}chunks=[];mr=new MediaRecorder(recDest.stream);mr.ondataavailable=e=>chunks.push(e.data);mr.onstop=()=>{const b=new Blob(chunks,{type:mr.mimeType||'audio/webm'}),a=$('#dl');a.href=URL.createObjectURL(b);a.download='coffeebreak-dj-bike-mix.webm';a.style.display='';mr=null;$('#rec').classList.remove('on');$('#rec').textContent='Record';say('Mix recorded. Tap Save mix to keep it.')};mr.start();$('#rec').classList.add('on');$('#rec').textContent='Stop';say('Recording your mix.')};

/* ---------- pads ---------- */
let PADS=[],selPad=0;const PADKEYS='12345678qwertyui';
function renderPads(){$('#pads').innerHTML=PADS.map((p,i)=>`<button class="pad${i===selPad?' sel':''}" data-i="${i}" title="Key ${PADKEYS[i].toUpperCase()}">${p.type}<br><small>${PADKEYS[i].toUpperCase()}</small></button>`).join('')}
function hitPad(i){const p=PADS[i];if(!p)return;playSample(p);const b=$('#pads').children[i];if(b){b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),120)}}
$('#pads').addEventListener('pointerdown',e=>{const b=e.target.closest('.pad');if(!b)return;selPad=+b.dataset.i;[...$('#pads').children].forEach((x,j)=>x.classList.toggle('sel',j===selPad));hitPad(selPad)});
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||e.repeat)return;const i=PADKEYS.indexOf(e.key.toLowerCase());if(i>=0)hitPad(i)});

/* ---------- library UI ---------- */
let cat='All',page=0;const PER=40;
$('#cats').innerHTML=['All',...CATS].map(c=>`<button data-c="${c}" class="${c==='All'?'on':''}">${c} <small>${c==='All'?TOOLS.length:TOOLS.filter(t=>t.cat===c).length}</small></button>`).join('');
$('#cats').onclick=e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.c;page=0;[...$('#cats').children].forEach(x=>x.classList.toggle('on',x===b));renderList()};
function filtered(){const q=$('#q').value.toLowerCase().trim().split(/\s+/).filter(Boolean);return TOOLS.filter(t=>(cat==='All'||t.cat===cat)&&q.every(w=>t.search.includes(w)))}
function renderList(){const f=filtered(),pages=Math.max(1,Math.ceil(f.length/PER));page=clamp(page,0,pages-1);
 $('#list').innerHTML=f.slice(page*PER,page*PER+PER).map(t=>`<div class="tool"><div>${t.name}<em>#${t.id} · ${t.cat} · ${t.tags}</em></div><div style="display:flex;gap:4px">${t.kind==='sample'?`<button class="btn" data-play="${t.id}">Play</button><button class="btn" data-pad="${t.id}">To pad</button>`:`<button class="btn" data-use="${t.id}">Use</button>`}</div></div>`).join('')||'<div class="tool">No tools match that search.</div>';
 $('#pageInfo').textContent=`${f.length} tools, page ${page+1} of ${pages}`}
$('#q').oninput=()=>{page=0;renderList()};$('#prev').onclick=()=>{page--;renderList()};$('#next').onclick=()=>{page++;renderList()};
$('#list').onclick=e=>{const b=e.target.closest('button');if(!b)return;ensureAudio();const id=+(b.dataset.use||b.dataset.play||b.dataset.pad),t=TOOLS[id-1];
 if(b.dataset.pad){PADS[selPad]={...t.sp};say(`${t.name} is on pad ${PADKEYS[selPad].toUpperCase()}.`);selPad=(selPad+1)%16;renderPads();playSample(t.sp)}else{t.run();if(t.kind!=='sample')say(`Loaded ${t.name}.`)}
 jaseLine()};

/* ---------- DJ Jase ---------- */
const LINES=['DJ Jase is ready to ride.','Pedal to the beat.','Next stop, the drop.','Both decks rolling.','Wind in the headphones.','Mind the bike lane, the bass is coming through.','Keep it smooth on the crossfader.','Ring ring, here comes the hook.'];
function say(m){$('#status').textContent=m}
function jaseLine(){$('#jaseSays').textContent=LINES[Math.floor(Math.random()*LINES.length)]}
$('#toolCount').textContent=TOOLS.length.toLocaleString('en-AU')+' tools';$('#toolCountTop').textContent=TOOLS.length.toLocaleString('en-AU')+' tools on board';
const dash=$('#dashes');for(let i=0;i<10;i++){const r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('y','230');r.setAttribute('width','24');r.setAttribute('height','4');dash.appendChild(r)}
let wheelA=0,roadX=0,lastF=performance.now(),notes=[];
function frame(now){const dt=(now-lastF)/1000;lastF=now;const playing=decks.filter(d=>d.playing),bpm=playing.length?effBpm(playing[0])*playing[0].brakeF:0;
 wheelA+=dt*bpm*3;roadX=(roadX+dt*bpm*1.2)%40;
 $('#wheelL').setAttribute('transform',`translate(110,190) rotate(${wheelA})`);$('#wheelR').setAttribute('transform',`translate(290,190) rotate(${wheelA})`);
 [...dash.children].forEach((r,i)=>r.setAttribute('x',i*40-roadX));
 let lvl=0;if(analyser){const a=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(a);for(const v of a)lvl=Math.max(lvl,Math.abs(v-128)/128)}
 $('#cone').setAttribute('r',12+lvl*6);$('#l1').setAttribute('opacity',0.2+lvl*0.7);$('#l2').setAttribute('opacity',0.2+lvl*0.5);
 const beat=bpm?(ac?ac.currentTime:0)*bpm/60:0;$('#head').setAttribute('transform',`translate(0,${bpm?Math.abs(Math.sin(beat*Math.PI))*-4:0})`);
 decks.forEach(d=>{if(d.playing)d.angle+=dt*effBpm(d)*d.bend*d.brakeF*1.5;d.ui.jog.style.transform=`rotate(${d.angle}deg)`;
  if(ac){while(d.vis.length&&d.vis[0].t<=ac.currentTime){d.cur=d.vis.shift().s}}if(!d.playing){d.vis.length=0;d.cur=-1}
  d.ui.steps.querySelectorAll('b').forEach((b,i)=>b.classList.toggle('now',i===d.cur));if(d.playing)d.ui.bpm.textContent=(effBpm(d)*d.bend*d.brakeF).toFixed(1)});
 if(bpm&&Math.random()<dt*bpm/60*0.6&&notes.length<8){const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.textContent=Math.random()<0.5?'♪':'♫';$('#notes').appendChild(t);notes.push({el:t,x:118+Math.random()*30,y:105,life:0})}
 notes=notes.filter(n=>{n.life+=dt;n.y-=dt*40;n.x+=Math.sin(n.life*4)*0.6;n.el.setAttribute('x',n.x);n.el.setAttribute('y',n.y);n.el.setAttribute('opacity',Math.max(0,1-n.life/2));if(n.life>2){n.el.remove();return false}return true});
 $('#platA').setAttribute('rx',decks[0].playing?14+Math.sin(now/90)*2:16);$('#platB').setAttribute('rx',decks[1].playing?14+Math.cos(now/90)*2:16);
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);

/* ---------- start ---------- */
const pick=(c,n)=>TOOLS.filter(t=>t.cat===c)[n];
PADS=[];pick('Pad kits',1).run();selPad=0;renderPads();
function preload(){const a=$('#target').value;$('#target').value='A';pick('Sequencer patterns',17).run();$('#target').value='B';pick('Sequencer patterns',0).run();$('#target').value=a}
preload();renderList();
$('#go').onclick=()=>{ensureAudio();$('#start').style.display='none';startDeck(decks[0]);jaseLine();say('Deck A is rolling. Bring in deck B with the crossfader or Auto mix.')};
$('#xf').value=0;
window.DJBIKE={TOOLS,decks,CATS};
})();
