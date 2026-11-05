/* Coffeebreak Studio Espresso - audio engine */
const DEMO=!!window.CB_DEMO, DEMO_MAX=30, DEMO_TRACKS=2;
let ctx;
function AC(){ if(!ctx){ try{ctx=new AudioContext({latencyHint:'interactive'})}catch(e){ctx=new (window.AudioContext||window.webkitAudioContext)()} ensureWorklet(ctx); } if(ctx.state==='suspended')ctx.resume(); return ctx; }
const BUFS={}; let bufSeq=0;
function addBuf(b){ const id='b'+(++bufSeq)+Math.random().toString(36).slice(2,6); BUFS[id]=b; return id; }
let uid=0; const nid=p=>p+(++uid)+Math.random().toString(36).slice(2,5);
const spb=()=>60/P.bpm;
// tempo map: P.tempo = [[beat,bpm],...] (first entry at beat 0 uses P.bpm)
function tmap(){ const m=[[0,P.bpm]].concat((P.tempo||[]).filter(x=>x[0]>0).sort((a,b)=>a[0]-b[0])); return m; }
function b2s(b){ const m=tmap(); let s=0; for(let i=0;i<m.length;i++){const end=i+1<m.length?m[i+1][0]:Infinity; if(b<=end){return s+(b-m[i][0])*60/m[i][1]} s+=(end-m[i][0])*60/m[i][1]} return s; }
function s2b(t){ const m=tmap(); let s=0; for(let i=0;i<m.length;i++){const end=i+1<m.length?m[i+1][0]:Infinity,seg=(end-m[i][0])*60/m[i][1]; if(t<=s+seg)return m[i][0]+(t-s)*m[i][1]/60; s+=seg} return 0; }
function chainNodes(a){ for(let i=0;i<a.length-1;i++)a[i].connect(a[i+1]); return a; }
function lfo(c,rate,depth,target){ const o=c.createOscillator(),g=c.createGain(); o.frequency.value=rate; g.gain.value=depth; o.connect(g); g.connect(target); o.start(); return{o,g}; }
function mixer(c,mix){ const i=c.createGain(),o=c.createGain(),dry=c.createGain(),wet=c.createGain(); dry.gain.value=1-mix; wet.gain.value=mix; i.connect(dry); dry.connect(o); wet.connect(o); return{i,o,dry,wet}; }
const satCurves={};
function satCurve(drive){ const k=Math.round(drive*10); if(satCurves[k])return satCurves[k]; const n=2048,cv=new Float32Array(n); for(let i=0;i<n;i++){const x=i/(n-1)*2-1;cv[i]=Math.tanh(x*drive)/Math.tanh(drive)} return satCurves[k]=cv; }
const irCache=new WeakMap();
function getIR(c,size,decay){ let m=irCache.get(c); if(!m){m={};irCache.set(c,m)} const k=size.toFixed(1)+'/'+decay.toFixed(1); return m[k]||(m[k]=makeIR(c,size,decay)); }
let WL_OK=new WeakMap();
function wnode(c,name,params,ins){ if(!WL_OK.get(c))return null; try{ const n=new AudioWorkletNode(c,name,{numberOfInputs:ins||1,outputChannelCount:[2]}); for(const k in params){const ap=n.parameters.get(k); if(ap)ap.value=params[k]} return n; }catch(e){ console.warn(e); return null; } }
function passthru(c){ const g=c.createGain(); return{i:g,o:g,ap:{}}; }
/* ---------- FX definitions: p = key:[default,min,max,label,step] ---------- */
const FXDEF={
 eq:{n:'Parametric EQ',p:{g1:[0,-18,18,'Low dB',0.5],f1:[100,30,500,'Low Hz',1],g2:[0,-18,18,'Mid 1 dB',0.5],f2:[400,100,3000,'Mid 1 Hz',1],g3:[0,-18,18,'Mid 2 dB',0.5],f3:[2500,600,10000,'Mid 2 Hz',1],q:[1,0.3,8,'Mid Q',0.1],g4:[0,-18,18,'High dB',0.5],f4:[8000,2000,18000,'High Hz',1]},
  b(c,p){ const ty=['lowshelf','peaking','peaking','highshelf']; const f=ty.map((t,i)=>{const b=c.createBiquadFilter();b.type=t;b.frequency.value=p['f'+(i+1)];b.gain.value=p['g'+(i+1)];if(t==='peaking')b.Q.value=p.q;return b}); chainNodes(f);
   return{i:f[0],o:f[3],ap:{g1:f[0].gain,f1:f[0].frequency,g2:f[1].gain,f2:f[1].frequency,g3:f[2].gain,f3:f[2].frequency,g4:f[3].gain,f4:f[3].frequency,q:f[1].Q,q2:f[2].Q}}; }},
 comp:{n:'Compressor',p:{threshold:[-18,-60,0,'Threshold dB',1],ratio:[4,1,20,'Ratio',0.5],attack:[0.01,0.001,0.3,'Attack s',0.001],release:[0.2,0.02,1,'Release s',0.01],knee:[6,0,30,'Knee dB',1],makeup:[3,0,24,'Makeup dB',0.5]},
  b(c,p){ const k=c.createDynamicsCompressor(); for(const x of['threshold','ratio','attack','release','knee'])k[x].value=p[x]; const g=c.createGain(); g.gain.value=dbToG(p.makeup); k.connect(g); return{i:k,o:g,ap:{threshold:k.threshold,ratio:k.ratio,attack:k.attack,release:k.release,knee:k.knee}}; }},
 gate:{n:'Noise gate',p:{threshold:[-45,-90,0,'Threshold dB',1],release:[0.1,0.01,1,'Release s',0.01]},
  b(c,p){ const n=wnode(c,'cbx-gate',p); if(!n)return passthru(c); return{i:n,o:n,ap:{threshold:n.parameters.get('threshold'),release:n.parameters.get('release')}}; }},
 sat:{n:'Saturation',p:{drive:[3,1,20,'Drive',0.1],tone:[9000,500,18000,'Tone Hz',10],mix:[1,0,1,'Mix',0.01],out:[-3,-24,6,'Output dB',0.5]},
  b(c,p){ const m=mixer(c,p.mix),w=c.createWaveShaper(); w.curve=satCurve(p.drive); w.oversample='2x'; const t=c.createBiquadFilter(); t.type='lowpass'; t.frequency.value=p.tone; const g=c.createGain(); g.gain.value=dbToG(p.out); m.i.connect(w); w.connect(t); t.connect(m.wet); m.o.connect(g); return{i:m.i,o:g,ap:{tone:t.frequency,mix:m.wet.gain,out:g.gain}}; }},
 chorus:{n:'Chorus',p:{rate:[0.8,0.05,8,'Rate Hz',0.05],depth:[0.004,0,0.012,'Depth s',0.0005],mix:[0.5,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d=c.createDelay(0.1); d.delayTime.value=0.022; const l=lfo(c,p.rate,p.depth,d.delayTime); m.i.connect(d); d.connect(m.wet); return{i:m.i,o:m.o,ap:{rate:l.o.frequency,depth:l.g.gain,mix:m.wet.gain}}; }},
 flanger:{n:'Flanger',p:{rate:[0.25,0.05,5,'Rate Hz',0.05],depth:[0.002,0,0.005,'Depth s',0.0001],feedback:[0.5,0,0.9,'Feedback',0.01],mix:[0.5,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d=c.createDelay(0.05); d.delayTime.value=0.004; const fb=c.createGain(); fb.gain.value=p.feedback; const l=lfo(c,p.rate,p.depth,d.delayTime); m.i.connect(d); d.connect(fb); fb.connect(d); d.connect(m.wet); return{i:m.i,o:m.o,ap:{rate:l.o.frequency,depth:l.g.gain,feedback:fb.gain,mix:m.wet.gain}}; }},
 phaser:{n:'Phaser',p:{rate:[0.5,0.05,8,'Rate Hz',0.05],depth:[600,0,1500,'Depth Hz',10],base:[800,200,3000,'Centre Hz',10],feedback:[0.4,0,0.9,'Feedback',0.01],mix:[0.5,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),ap=[0,1,2,3].map(()=>{const f=c.createBiquadFilter();f.type='allpass';f.frequency.value=p.base;f.Q.value=0.7;return f}); chainNodes(ap); const fb=c.createGain(); fb.gain.value=p.feedback;
   const o=c.createOscillator(),g=c.createGain(); o.frequency.value=p.rate; g.gain.value=p.depth; o.connect(g); ap.forEach(f=>g.connect(f.frequency)); o.start();
   const base=c.createConstantSource(); base.offset.value=0; base.start(); m.i.connect(ap[0]); ap[3].connect(fb); fb.connect(ap[0]); ap[3].connect(m.wet); return{i:m.i,o:m.o,ap:{rate:o.frequency,depth:g.gain,feedback:fb.gain,mix:m.wet.gain}}; }},
 delay:{n:'Delay',p:{time:[0.375,0.02,2,'Time s',0.005],feedback:[0.35,0,0.95,'Feedback',0.01],tone:[5000,500,16000,'Tone Hz',10],mix:[0.3,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d=c.createDelay(2.5); d.delayTime.value=p.time; const fb=c.createGain(); fb.gain.value=p.feedback; const t=c.createBiquadFilter(); t.type='lowpass'; t.frequency.value=p.tone; m.dry.gain.value=p.mix>=1?0:1;
   m.i.connect(d); d.connect(t); t.connect(fb); fb.connect(d); t.connect(m.wet); return{i:m.i,o:m.o,ap:{time:d.delayTime,feedback:fb.gain,tone:t.frequency,mix:m.wet.gain}}; }},
 reverb:{n:'Reverb',p:{size:[2.2,0.3,6,'Size s',0.1],decay:[3,1,8,'Decay',0.1],predelay:[0.02,0,0.2,'Pre-delay s',0.005],mix:[0.3,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),pd=c.createDelay(0.5); pd.delayTime.value=p.predelay; const cv=c.createConvolver(); cv.buffer=getIR(c,p.size,p.decay); m.dry.gain.value=p.mix>=1?0:1; m.i.connect(pd); pd.connect(cv); cv.connect(m.wet); return{i:m.i,o:m.o,ap:{predelay:pd.delayTime,mix:m.wet.gain}}; }},
 autopan:{n:'Auto-pan',p:{rate:[1,0.05,10,'Rate Hz',0.05],depth:[0.8,0,1,'Depth',0.01]},
  b(c,p){ const s=c.createStereoPanner(); s.pan.value=0; const l=lfo(c,p.rate,p.depth,s.pan); return{i:s,o:s,ap:{rate:l.o.frequency,depth:l.g.gain}}; }},
 tune:{n:'Vocal tuner',p:{key:[0,0,11,'Key (0=C)',1],scale:[0,0,5,'Scale 0 maj 1 min 2 chrom 3 penta 4 blues 5 harm min',1],speed:[0.6,0,1,'Speed',0.01],mix:[1,0,1,'Mix',0.01]},
  b(c,p){ const n=wnode(c,'cbx-tune',p); if(!n)return passthru(c); const ap={}; for(const k of['key','scale','speed','mix'])ap[k]=n.parameters.get(k); return{i:n,o:n,ap}; }},
 deess:{n:'De-esser',p:{threshold:[-30,-60,0,'Threshold dB',1],freq:[6000,3000,10000,'Frequency Hz',10]},
  b(c,p){ const n=wnode(c,'cbx-deess',p); if(!n)return passthru(c); return{i:n,o:n,ap:{threshold:n.parameters.get('threshold'),freq:n.parameters.get('freq')}}; }},
};
function fxNew(type,over){ const p={}; for(const k in FXDEF[type].p)p[k]=FXDEF[type].p[k][0]; return{id:nid('f'),type,on:true,p:Object.assign(p,over||{})}; }
/* ---------- instruments ---------- */
const INSTDEF={
 sub:{n:'Subtractive synth',p:{w1:['sawtooth','wave'],w2:['square','wave'],det:[7,-50,50,'Osc 2 detune cents',1],oct2:[0,-2,2,'Osc 2 octave',1],mix:[0.4,0,1,'Osc mix',0.01],cut:[2200,60,16000,'Cutoff Hz',10],res:[3,0.1,20,'Resonance',0.1],env:[2500,0,8000,'Filter env Hz',10],a:[0.01,0.001,2,'Attack',0.001],d:[0.25,0.01,2,'Decay',0.01],s:[0.6,0,1,'Sustain',0.01],r:[0.3,0.01,4,'Release',0.01],lfoRate:[5,0.1,20,'LFO rate Hz',0.1],lfoAmt:[0,0,1,'LFO amount',0.01],lfoTo:['cut','target'],vol:[0.35,0,1,'Volume',0.01]}},
 fm:{n:'FM synth',p:{ratio:[2,0.25,12,'Mod ratio',0.25],index:[3,0,20,'Mod index',0.1],mdec:[0.4,0.01,3,'Mod decay',0.01],a:[0.005,0.001,2,'Attack',0.001],d:[0.4,0.01,3,'Decay',0.01],s:[0.4,0,1,'Sustain',0.01],r:[0.4,0.01,4,'Release',0.01],vol:[0.4,0,1,'Volume',0.01]}},
 sampler:{n:'Sampler',p:{root:[60,24,96,'Root note',1],a:[0.002,0.001,2,'Attack',0.001],d:[0.2,0.01,2,'Decay',0.01],s:[1,0,1,'Sustain',0.01],r:[0.2,0.01,4,'Release',0.01],vol:[0.8,0,1,'Volume',0.01],loop:[0,0,1,'Loop (0/1)',1]}},
 drums:{n:'Drum kit synth',p:{tune:[0,-12,12,'Tune',1],decay:[1,0.3,3,'Decay',0.05],vol:[0.8,0,1,'Volume',0.01]}},
};
const DRUMS=[[36,'Kick'],[38,'Snare'],[39,'Clap'],[42,'Closed hat'],[46,'Open hat'],[45,'Low tom'],[48,'High tom'],[49,'Crash']];
function instNew(type){ const p={type}; for(const k in INSTDEF[type].p)p[k]=INSTDEF[type].p[k][0]; return p; }
const mtof=m=>440*Math.pow(2,(m-69)/12);
const noiseCache=new WeakMap();
function noiseBuf(c){ if(!noiseCache.has(c)){const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseCache.set(c,b)} return noiseCache.get(c); }
function adsr(g,t,p,peak){ g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+p.a); g.gain.setTargetAtTime(peak*p.s,t+p.a,p.d/3+0.001); }
function release(g,t,r){ if(g.gain.cancelAndHoldAtTime)g.gain.cancelAndHoldAtTime(t); else g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0,t,r/4+0.001); }
function playNote(c,dest,ins,pitch,t,dur,vel){ vel=vel==null?0.8:vel; let v=null;
 if(ins.type==='drums'){ drumHit(c,dest,ins,pitch,t,vel); return{stop(){}}; }
 const g=c.createGain(); g.connect(dest); const srcs=[];
 if(ins.type==='sub'){ const f=mtof(pitch),o1=c.createOscillator(),o2=c.createOscillator(),m1=c.createGain(),m2=c.createGain(),flt=c.createBiquadFilter();
  o1.type=ins.w1; o2.type=ins.w2; o1.frequency.value=f; o2.frequency.value=f*Math.pow(2,ins.oct2); o2.detune.value=ins.det; m1.gain.value=1-ins.mix; m2.gain.value=ins.mix;
  flt.type='lowpass'; flt.Q.value=ins.res; flt.frequency.setValueAtTime(ins.cut+ins.env,t); flt.frequency.setTargetAtTime(ins.cut,t+ins.a,ins.d/2+0.01);
  o1.connect(m1); o2.connect(m2); m1.connect(flt); m2.connect(flt); flt.connect(g); srcs.push(o1,o2);
  if(ins.lfoAmt>0){ const l=c.createOscillator(),lg=c.createGain(); l.frequency.value=ins.lfoRate; if(ins.lfoTo==='pitch'){lg.gain.value=ins.lfoAmt*50;l.connect(lg);lg.connect(o1.detune);lg.connect(o2.detune)}else if(ins.lfoTo==='amp'){lg.gain.value=ins.lfoAmt*0.5;const tr=c.createGain();flt.disconnect();flt.connect(tr);tr.connect(g);l.connect(lg);lg.connect(tr.gain)}else{lg.gain.value=ins.lfoAmt*ins.cut;l.connect(lg);lg.connect(flt.frequency)} srcs.push(l); }
  adsr(g,t,ins,vel*ins.vol); v=ins.r; }
 else if(ins.type==='fm'){ const f=mtof(pitch),car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(); car.frequency.value=f; mod.frequency.value=f*ins.ratio;
  mg.gain.setValueAtTime(ins.index*f,t); mg.gain.setTargetAtTime(ins.index*f*0.15,t,ins.mdec/3+0.001); mod.connect(mg); mg.connect(car.frequency); car.connect(g); srcs.push(car,mod); adsr(g,t,ins,vel*ins.vol); v=ins.r; }
 else if(ins.type==='sampler'){ const b=BUFS[ins.buf]; const s=c.createBufferSource(); if(b){s.buffer=b;} else { s.buffer=noiseBuf(c); vel*=0.05; } s.playbackRate.value=Math.pow(2,(pitch-ins.root)/12); s.loop=!!ins.loop; s.connect(g); srcs.push(s); adsr(g,t,ins,vel*ins.vol); v=ins.r; }
 srcs.forEach(s=>s.start(t)); let stopped=false;
 const stop=(te)=>{ if(stopped)return; stopped=true; te=Math.max(te,t+0.005); release(g,te,v); srcs.forEach(s=>{try{s.stop(te+v*1.5+0.05)}catch(e){}}); };
 if(dur!=null)stop(t+dur); return{stop}; }
function drumHit(c,dest,ins,p,t,vel){ const tune=Math.pow(2,(ins.tune||0)/12),dc=ins.decay||1,out=c.createGain(); out.gain.value=vel*(ins.vol==null?0.8:ins.vol); out.connect(dest);
 const tone=(f0,f1,dur,type='sine',lvl=1)=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0*tune,t);o.frequency.exponentialRampToValueAtTime(f1*tune,t+dur*0.4);g.gain.setValueAtTime(lvl,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+0.02)};
 const noise=(type,f,dur,lvl=1,q=1)=>{const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=noiseBuf(c);fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(lvl,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);s.connect(fl);fl.connect(g);g.connect(out);s.start(t);s.stop(t+dur+0.02)};
 switch(p){ case 36:tone(160,45,0.45*dc,'sine',1.2);noise('lowpass',1500,0.02,0.3);break;
  case 38:tone(220,160,0.15*dc,'triangle',0.6);noise('highpass',1800,0.22*dc,0.7);break;
  case 39:for(let i=0;i<3;i++){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),ti=t+i*0.011;s.buffer=noiseBuf(c);f.type='bandpass';f.frequency.value=1200;f.Q.value=1.5;g.gain.setValueAtTime(0.9,ti);g.gain.exponentialRampToValueAtTime(0.001,ti+(i==2?0.2*dc:0.01));s.connect(f);f.connect(g);g.connect(out);s.start(ti);s.stop(ti+0.25)}break;
  case 42:noise('highpass',7500,0.05*dc,0.5);break;
  case 46:noise('highpass',7000,0.35*dc,0.45);break;
  case 45:tone(110,70,0.4*dc,'sine',0.9);break;
  case 48:tone(200,130,0.3*dc,'sine',0.9);break;
  case 49:noise('highpass',5000,1.4*dc,0.4);noise('bandpass',9000,1*dc,0.3,0.5);break;
  default:tone(mtof(p),mtof(p),0.2*dc,'square',0.3); } }
/* ---------- mixing graph ---------- */
function laneParam(ch,nodes,lane){ if(lane==='vol')return nodes.fader.gain; if(lane==='pan')return nodes.pan.pan; const m=/^fx:(\w+):(\w+)$/.exec(lane); if(!m)return null; const e=nodes.fxn.find(x=>x.f.id===m[1]); return e&&e.n.ap[m[2]]||null; }
function laneRange(ch,lane){ if(lane==='vol')return[0,1.5]; if(lane==='pan')return[-1,1]; const m=/^fx:(\w+):(\w+)$/.exec(lane); const f=m&&ch.fx.find(x=>x.id===m[1]); if(!f)return[0,1]; const d=FXDEF[f.type].p[m[2]]; return[d[1],d[2]]; }
function laneValueAt(pts,b){ if(!pts.length)return null; if(b<=pts[0][0])return pts[0][1]; for(let i=1;i<pts.length;i++)if(b<=pts[i][0]){const[a0,v0]=pts[i-1],[a1,v1]=pts[i];return v0+(v1-v0)*(b-a0)/((a1-a0)||1)} return pts[pts.length-1][1]; }
function applyAuto(ch,nodes,startBeat,t0){ for(const lane in (ch.auto||{})){ const pts=ch.auto[lane]; if(!pts||!pts.length)continue; const ap=laneParam(ch,nodes,lane); if(!ap)continue;
  ap.setValueAtTime(laneValueAt(pts,startBeat),t0); for(const[b,v]of pts)if(b>startBeat)ap.linearRampToValueAtTime(v,t0+b2s(b)-b2s(startBeat)); } }
function buildChannel(c,ch,dest,rt,live){ const inp=c.createGain(); let last=inp; const fxn=[];
 for(const f of ch.fx||[]){ if(!f.on)continue; const n=FXDEF[f.type].b(c,f.p); last.connect(n.i); last=n.o; fxn.push({f,n}); }
 const fader=c.createGain(); fader.gain.value=ch.vol; const pan=c.createStereoPanner(); pan.pan.value=ch.pan||0; const mute=c.createGain(); mute.gain.value=ch.mute?0:1;
 last.connect(fader); fader.connect(pan); pan.connect(mute); mute.connect(dest);
 const sends={}; if(rt){ for(const k of['A','B']){ const g=c.createGain(); g.gain.value=ch['send'+k]||0; mute.connect(g); g.connect(rt[k]); sends[k]=g; } }
 let meter=null; if(live){ meter=c.createAnalyser(); meter.fftSize=512; mute.connect(meter); }
 return{inp,fader,pan,mute,fxn,sends,meter}; }
function trackOf(id){ return P.tracks.find(t=>t.id===id); }
function songEndBeats(){ let e=0; for(const t of P.tracks)for(const c of t.clips)e=Math.max(e,c.start+c.len); return e; }
// builds the whole song into context c. events are returned for live scheduling, or run straight away offline
async function buildSong(c,startBeat,t0,o={}){
 WL_OK.set(c,await ensureWorklet(c)); const S=spb(),G={ch:{},events:[]};
 const mIn=c.createGain(); G.mIn=mIn; const mOut=c.createGain(); mOut.gain.value=P.master.vol; G.mOut=mOut;
 if(o.live&&P.master.live){ const ch=buildMasterChain(c,mIn,P.master.p,P.master.makeup||1); ch.out.connect(mOut); } else mIn.connect(mOut);
 mOut.connect(o.dest||c.destination);
 const rt={}; for(const r of P.returns){ const n=buildChannel(c,r,mIn,null,o.live); rt[r.id==='rA'?'A':'B']=n.inp; G.ch[r.id]=n; applyAuto(r,n,startBeat,t0); }
 for(const t of P.tracks)if(t.kind==='bus'){ G.ch[t.id]=null; }
 // buses first (in order), so tracks can route into them; buses route to master
 for(const t of P.tracks)if(t.kind==='bus'){ const n=buildChannel(c,t,mIn,rt,o.live); G.ch[t.id]=n; applyAuto(t,n,startBeat,t0); }
 const anySolo=P.tracks.some(t=>t.solo&&t.kind!=='bus');
 for(const t of P.tracks){ if(t.kind==='bus')continue; if(o.only&&t.id!==o.only)continue; if(!o.only&&anySolo&&!t.solo)continue;
  const dest=(t.out&&G.ch[t.out])?G.ch[t.out].inp:mIn; const n=buildChannel(c,t,dest,rt,o.live); G.ch[t.id]=n; applyAuto(t,n,startBeat,t0); if(t.mute)continue;
  for(const cl of t.clips){ if(cl.start+cl.len<=startBeat)continue;
   if(t.kind==='audio'){ const b=BUFS[cl.takes[cl.take]]; if(!b)continue; const s0=b2s(cl.start)-b2s(startBeat),len=b2s(cl.start+cl.len)-b2s(cl.start),skip=Math.max(0,-s0),at=t0+Math.max(0,s0);
    G.events.push({t:at,fn:()=>{ const src=c.createBufferSource(); src.buffer=b; const g=c.createGain(); const cs=t0+s0,gv=cl.gain==null?1:cl.gain;
      const fi=Math.min(cl.fadeIn||0,len/2),fo=Math.min(cl.fadeOut||0,len/2); g.gain.setValueAtTime(fi?0:gv,cs); if(fi)g.gain.linearRampToValueAtTime(gv,cs+fi); if(fo){g.gain.setValueAtTime(gv,cs+len-fo);g.gain.linearRampToValueAtTime(0,cs+len)}
      src.connect(g); g.connect(n.inp); const off=(cl.offset||0)+skip; if(off<b.duration){src.start(Math.max(at,c.currentTime),off,Math.max(0.001,len-skip)); (G.srcs||(G.srcs=[])).push(src);} }});
   } else { for(const nt of midiFX(t,cl.notes,cl.len)){ if(nt.s>=cl.len)continue; const b=cl.start+nt.s; if(b<startBeat)continue; const at=t0+b2s(b)-b2s(startBeat),dur=b2s(Math.min(b+nt.l,cl.start+cl.len))-b2s(b);
     G.events.push({t:at,fn:()=>{ const v=playNote(c,n.inp,t.inst,nt.p,at,dur,nt.v); (G.voices||(G.voices=[])).push(v); }}); } }
  } }
 for(const id in G.ch){const n=G.ch[id];if(!n)continue;for(const e of n.fxn)if(e.f.type==='duck'&&e.f.src&&G.ch[e.f.src]&&e.n.side)G.ch[e.f.src].mute.connect(e.n.side,0,1);}
 G.events.sort((a,b)=>a.t-b.t);
 if(!o.live){ G.events.forEach(e=>e.fn()); G.events=[]; }
 return G; }
async function renderSong(o={}){ const sr=o.sr||48000; let endB=songEndBeats(); if(!endB)throw new Error('The project is empty'); let sec=b2s(endB)+(o.tail==null?2.5:o.tail); if(DEMO)sec=Math.min(sec,DEMO_MAX);
 const c=new OfflineAudioContext(2,Math.ceil(sec*sr),sr); await buildSong(c,0,0,o); let b=await c.startRendering();
 if(o.master&&P.master.on){ b=(await renderMaster(b,P.master.p)).buf; } return b; }
