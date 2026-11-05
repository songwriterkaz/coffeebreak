/* Coffeebreak Studio Espresso - extended tool library: more effects, instruments, MIDI FX, generators, presets */
function wfx(name,keys,ins){ return function(c,p){ const n=wnode(c,name,p,ins); if(!n)return passthru(c); const ap={}; keys.forEach(k=>ap[k]=n.parameters.get(k)); const r={i:n,o:n,ap}; if(ins===2)r.side=n; return r; }; }
function revVar(n,size,decay,pre,tone){ return{n,p:{size:[size,0.2,8,'Size s',0.1],decay:[decay,0.5,10,'Decay',0.1],predelay:[pre,0,0.2,'Pre-delay s',0.005],tone:[tone,1000,18000,'Tone Hz',10],mix:[0.3,0,1,'Mix',0.01]},
 b(c,p){ const m=mixer(c,p.mix),pd=c.createDelay(0.5); pd.delayTime.value=p.predelay; const cv=c.createConvolver(); cv.buffer=getIR(c,p.size,p.decay); const t=c.createBiquadFilter(); t.type='lowpass'; t.frequency.value=p.tone; m.dry.gain.value=p.mix>=1?0:1; chainNodes([m.i,pd,cv,t,m.wet]); return{i:m.i,o:m.o,ap:{predelay:pd.delayTime,tone:t.frequency,mix:m.wet.gain}}; }}; }
function filt(type,f,q){ return(c)=>{const b=c.createBiquadFilter();b.type=type;b.frequency.value=f;if(q)b.Q.value=q;return b}; }
Object.assign(FXDEF,{
 multiband:{n:'Multiband compressor',p:{low:[200,60,600,'Low split Hz',5],high:[3000,1000,10000,'High split Hz',10],threshold:[-20,-60,0,'Threshold dB',1],ratio:[3,1,20,'Ratio',0.5],makeup:[3,0,18,'Makeup dB',0.5]},
  b(c,p){ const i=c.createGain(),o=c.createGain(),ap={}; const bands=[[['lowpass',p.low]],[['highpass',p.low],['lowpass',p.high]],[['highpass',p.high]]];
   bands.forEach((bd,k)=>{ let last=i; bd.forEach(([t,f])=>{const x=filt(t,f,0.5)(c);last.connect(x);last=x}); const cp=c.createDynamicsCompressor(); cp.threshold.value=p.threshold; cp.ratio.value=p.ratio; last.connect(cp); const g=c.createGain(); g.gain.value=dbToG(p.makeup); cp.connect(g); g.connect(o); ap['band'+k]=cp.threshold; });
   return{i,o,ap}; }},
 limiter:{n:'Limiter',p:{ceiling:[-1,-12,0,'Ceiling dB',0.1],gain:[0,0,18,'Input gain dB',0.5],release:[0.08,0.01,1,'Release s',0.01]},
  b(c,p){ const g=c.createGain(); g.gain.value=dbToG(p.gain); const k=c.createDynamicsCompressor(); k.threshold.value=p.ceiling-0.5; k.knee.value=0; k.ratio.value=20; k.attack.value=0.001; k.release.value=p.release; const o=c.createGain(); o.gain.value=dbToG(-0.2); chainNodes([g,k,o]); return{i:g,o,ap:{gain:g.gain,release:k.release}}; }},
 transient:{n:'Transient shaper',p:{attack:[0.5,-1,1,'Attack',0.01],sustain:[0,-1,1,'Sustain',0.01]},b:wfx('cbx-trans',['attack','sustain'])},
 exciter:{n:'Exciter',p:{freq:[3500,1000,10000,'Frequency Hz',10],drive:[4,1,20,'Drive',0.1],mix:[0.25,0,1,'Amount',0.01]},
  b(c,p){ const i=c.createGain(),o=c.createGain(); i.connect(o); const h=filt('highpass',p.freq,0.7)(c),w=c.createWaveShaper(); w.curve=satCurve(p.drive); const g=c.createGain(); g.gain.value=p.mix; chainNodes([i,h,w,g,o]); return{i,o,ap:{freq:h.frequency,mix:g.gain}}; }},
 widener:{n:'Stereo widener',p:{width:[1.5,0,3,'Width',0.01]},
  b(c,p){ const i=c.createGain(),sp=c.createChannelSplitter(2),mg=c.createChannelMerger(2),o=c.createGain(); i.channelCountMode='explicit'; i.channelCount=2; i.connect(sp); const a=(1+p.width)/2,b=(1-p.width)/2;
   const G=v=>{const g=c.createGain();g.gain.value=v;return g}; const LL=G(a),RR=G(a),LR=G(b),RL=G(b); sp.connect(LL,0);sp.connect(RL,0);sp.connect(RR,1);sp.connect(LR,1); LL.connect(mg,0,0);LR.connect(mg,0,0);RR.connect(mg,0,1);RL.connect(mg,0,1); mg.connect(o); return{i,o,ap:{}}; }},
 bitcrush:{n:'Bitcrusher',p:{bits:[8,1,16,'Bits',1],down:[4,1,40,'Downsample',1]},b:wfx('cbx-crush',['bits','down'])},
 lofi:{n:'Lo-fi',p:{bits:[10,4,16,'Bits',1],down:[3,1,12,'Downsample',1],tone:[4500,800,12000,'Tone Hz',10]},
  b(c,p){ const n=wnode(c,'cbx-crush',p); const t=filt('lowpass',p.tone,0.7)(c); if(!n)return{i:t,o:t,ap:{tone:t.frequency}}; n.connect(t); return{i:n,o:t,ap:{bits:n.parameters.get('bits'),tone:t.frequency}}; }},
 tape:{n:'Tape sim',p:{drive:[2,1,10,'Drive',0.1],wow:[0.0015,0,0.006,'Wow depth s',0.0001],rate:[0.6,0.1,6,'Wow rate Hz',0.05],tone:[11000,2000,18000,'Tone Hz',10],hiss:[0.002,0,0.03,'Hiss',0.001]},
  b(c,p){ const w=c.createWaveShaper(); w.curve=satCurve(p.drive); const d=c.createDelay(0.05); d.delayTime.value=0.01; const l=lfo(c,p.rate,p.wow,d.delayTime); const t=filt('lowpass',p.tone,0.6)(c),o=c.createGain(); chainNodes([w,d,t,o]);
   const n=c.createBufferSource(); n.buffer=noiseBuf(c); n.loop=true; const ng=c.createGain(); ng.gain.value=p.hiss; n.connect(filt('highpass',3000)(c)).connect(ng); ng.connect(o); n.start(); return{i:w,o,ap:{rate:l.o.frequency,depth:l.g.gain,tone:t.frequency,hiss:ng.gain}}; }},
 vinyl:{n:'Vinyl sim',p:{crackle:[0.03,0,0.2,'Crackle',0.005],tone:[7000,1500,14000,'Tone Hz',10],wow:[0.001,0,0.004,'Wow s',0.0001]},
  b(c,p){ const hp=filt('highpass',60)(c),lp=filt('lowpass',p.tone,0.7)(c),d=c.createDelay(0.05); d.delayTime.value=0.008; lfo(c,0.55,p.wow,d.delayTime); const o=c.createGain(); chainNodes([hp,lp,d,o]);
   const sr=c.sampleRate,b=c.createBuffer(1,sr*2,sr),x=b.getChannelData(0); for(let i=0;i<x.length;i++)x[i]=Math.random()<0.0007?(Math.random()*2-1):0; const s=c.createBufferSource(); s.buffer=b; s.loop=true; const g=c.createGain(); g.gain.value=p.crackle; s.connect(g); g.connect(o); s.start(); return{i:hp,o,ap:{crackle:g.gain,tone:lp.frequency}}; }},
 ringmod:{n:'Ring modulator',p:{freq:[440,1,4000,'Frequency Hz',1],mix:[0.5,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),g=c.createGain(); g.gain.value=0; const o=c.createOscillator(); o.frequency.value=p.freq; o.connect(g.gain); o.start(); m.i.connect(g); g.connect(m.wet); return{i:m.i,o:m.o,ap:{freq:o.frequency,mix:m.wet.gain}}; }},
 vocoder:{n:'Vocoder',p:{note:[48,24,72,'Carrier note',1],bands:[16,6,24,'Bands',1],mix:[1,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),car=c.createOscillator(); car.type='sawtooth'; car.frequency.value=mtof(p.note); const car2=c.createOscillator(); car2.type='sawtooth'; car2.frequency.value=mtof(p.note)*1.005; car.start(); car2.start(); const cg=c.createGain(); car.connect(cg); car2.connect(cg);
   const abs=c.createWaveShaper(),cv=new Float32Array(1025); for(let i=0;i<1025;i++)cv[i]=Math.abs(i/512-1); abs.curve=cv; const N=Math.round(p.bands);
   for(let k=0;k<N;k++){ const f=120*Math.pow(8000/120,k/(N-1)); const mb=filt('bandpass',f,6)(c),cb=filt('bandpass',f,6)(c),r=c.createWaveShaper(); r.curve=cv; const sm=filt('lowpass',25)(c),vg=c.createGain(); vg.gain.value=0;
    m.i.connect(mb); mb.connect(r); r.connect(sm); const boost=c.createGain(); boost.gain.value=8; sm.connect(boost); boost.connect(vg.gain); cg.connect(cb); cb.connect(vg); vg.connect(m.wet); }
   return{i:m.i,o:m.o,ap:{note:car.frequency,mix:m.wet.gain}}; }},
 harmonizer:{n:'Harmonizer',p:{semi:[4,-12,12,'Voice 1 semitones',1],semi2:[7,-12,12,'Voice 2 semitones',1],mix:[0.5,0,1,'Voices',0.01],dry:[1,0,1,'Dry',0.01]},b:wfx('cbx-shift',['semi','semi2','mix','dry'])},
 shifter:{n:'Pitch shifter',p:{semi:[-12,-24,24,'Semitones',1],semi2:[0,0,0,'-',1],mix:[1,0,1,'Wet',0.01],dry:[0,0,1,'Dry',0.01]},b:wfx('cbx-shift',['semi','mix','dry'])},
 octaver:{n:'Octaver',p:{semi:[-12,-24,0,'Octave down',12],semi2:[12,0,24,'Octave up (0 off)',12],mix:[0.5,0,1,'Octaves',0.01],dry:[1,0,1,'Dry',0.01]},b:wfx('cbx-shift',['semi','semi2','mix','dry'])},
 filter:{n:'Filter',p:{type:[0,0,2,'0 lowpass 1 highpass 2 bandpass',1],freq:[1200,30,18000,'Frequency Hz',1],q:[2,0.1,20,'Resonance',0.1]},
  b(c,p){ const f=filt(['lowpass','highpass','bandpass'][Math.round(p.type)],p.freq,p.q)(c); return{i:f,o:f,ap:{freq:f.frequency,q:f.Q}}; }},
 wah:{n:'Wah (auto)',p:{rate:[2,0.1,10,'Rate Hz',0.05],base:[900,300,2500,'Centre Hz',10],depth:[700,0,2000,'Depth Hz',10],q:[6,1,20,'Q',0.1]},
  b(c,p){ const f=filt('bandpass',p.base,p.q)(c),o=c.createGain(); o.gain.value=2; f.connect(o); const l=lfo(c,p.rate,p.depth,f.frequency); return{i:f,o,ap:{rate:l.o.frequency,depth:l.g.gain,base:f.frequency}}; }},
 tremolo:{n:'Tremolo',p:{rate:[5,0.1,20,'Rate Hz',0.1],depth:[0.5,0,1,'Depth',0.01]},
  b(c,p){ const g=c.createGain(); g.gain.value=1-p.depth/2; const l=lfo(c,p.rate,p.depth/2,g.gain); return{i:g,o:g,ap:{rate:l.o.frequency,depth:l.g.gain}}; }},
 rotary:{n:'Rotary speaker',p:{rate:[6,0.5,10,'Speed Hz',0.1],depth:[0.7,0,1,'Depth',0.01]},
  b(c,p){ const d=c.createDelay(0.02); d.delayTime.value=0.003; const l1=lfo(c,p.rate,0.0008*p.depth,d.delayTime); const g=c.createGain(); g.gain.value=1-0.25*p.depth; lfo(c,p.rate,0.25*p.depth,g.gain); const s=c.createStereoPanner(); lfo(c,p.rate,p.depth*0.8,s.pan); chainNodes([d,g,s]); return{i:d,o:s,ap:{rate:l1.o.frequency}}; }},
 distortion:{n:'Distortion / fuzz',p:{drive:[12,1,20,'Drive',0.1],tone:[3500,500,12000,'Tone Hz',10],out:[-10,-30,0,'Output dB',0.5]},
  b(c,p){ const pre=filt('highpass',90)(c),w=c.createWaveShaper(); w.curve=satCurve(p.drive); w.oversample='4x'; const t=filt('lowpass',p.tone,0.7)(c),g=c.createGain(); g.gain.value=dbToG(p.out); chainNodes([pre,w,t,g]); return{i:pre,o:g,ap:{tone:t.frequency,out:g.gain}}; }},
 amp:{n:'Amp sim + cab',p:{gain:[6,1,20,'Gain',0.1],bass:[2,-12,12,'Bass dB',0.5],mid:[0,-12,12,'Mid dB',0.5],treble:[2,-12,12,'Treble dB',0.5],cab:[1,0,2,'Cab 0 DI 1 1x12 2 4x12',1],out:[-12,-30,0,'Output dB',0.5]},
  b(c,p){ const hp=filt('highpass',80)(c),w=c.createWaveShaper(); w.curve=satCurve(p.gain); w.oversample='4x'; const b=filt('lowshelf',120)(c),m=filt('peaking',700,0.8)(c),t=filt('highshelf',3200)(c); b.gain.value=p.bass; m.gain.value=p.mid; t.gain.value=p.treble;
   const cab=Math.round(p.cab), lp=filt('lowpass',[18000,5200,4200][cab],0.8)(c), res=filt('peaking',[1000,1800,110][cab],1.2)(c); res.gain.value=cab?4:0; const g=c.createGain(); g.gain.value=dbToG(p.out); chainNodes([hp,w,b,m,t,res,lp,g]); return{i:hp,o:g,ap:{bass:b.gain,mid:m.gain,treble:t.gain}}; }},
 cab:{n:'Cabinet sim',p:{cab:[1,0,2,'0 DI 1 1x12 combo 2 4x12 stack',1]},
  b(c,p){ const cab=Math.round(p.cab),h=filt('highpass',[20,90,70][cab])(c),r=filt('peaking',[1000,1800,110][cab],1.2)(c),l=filt('lowpass',[18000,5200,4200][cab],0.8)(c); r.gain.value=cab?4:0; chainNodes([h,r,l]); return{i:h,o:l,ap:{}}; }},
 preamp:{n:'Vintage preamp',p:{drive:[1.8,1,6,'Warmth',0.1],air:[2,-6,8,'Air dB',0.5],body:[2,-6,8,'Body dB',0.5]},
  b(c,p){ const w=c.createWaveShaper(); w.curve=satCurve(p.drive); const lo=filt('lowshelf',180)(c),hi=filt('highshelf',9000)(c); lo.gain.value=p.body; hi.gain.value=p.air; chainNodes([lo,w,hi]); return{i:lo,o:hi,ap:{body:lo.gain,air:hi.gain}}; }},
 spring:revVar('Spring reverb',1.4,2,0.005,3500), plate:revVar('Plate reverb',1.8,3.5,0.01,9000), hall:revVar('Hall reverb',4.5,2.5,0.04,7000), room:revVar('Room reverb',0.7,3,0.005,9000), cathedral:revVar('Cathedral reverb',7,1.8,0.06,6000),
 pingpong:{n:'Ping-pong delay',p:{time:[0.3,0.02,1.5,'Time s',0.005],feedback:[0.45,0,0.9,'Feedback',0.01],mix:[0.3,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),mono=c.createGain(); mono.channelCount=1; mono.channelCountMode='explicit'; const dl=c.createDelay(2),dr=c.createDelay(2); dl.delayTime.value=p.time; dr.delayTime.value=p.time; const fb=c.createGain(); fb.gain.value=p.feedback; const mg=c.createChannelMerger(2);
   m.i.connect(mono); mono.connect(dl); dl.connect(dr); dr.connect(fb); fb.connect(dl); dl.connect(mg,0,0); dr.connect(mg,0,1); mg.connect(m.wet); return{i:m.i,o:m.o,ap:{time:dl.delayTime,feedback:fb.gain,mix:m.wet.gain}}; }},
 tapedelay:{n:'Tape delay',p:{time:[0.4,0.05,1.5,'Time s',0.005],feedback:[0.5,0,0.95,'Feedback',0.01],wow:[0.002,0,0.006,'Wow s',0.0001],mix:[0.3,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d=c.createDelay(2); d.delayTime.value=p.time; lfo(c,0.7,p.wow,d.delayTime); const fb=c.createGain(); fb.gain.value=p.feedback; const w=c.createWaveShaper(); w.curve=satCurve(1.6); const t=filt('lowpass',3500,0.6)(c),h=filt('highpass',150)(c);
   m.i.connect(d); chainNodes([d,w,t,h,fb]); fb.connect(d); h.connect(m.wet); return{i:m.i,o:m.o,ap:{time:d.delayTime,feedback:fb.gain,mix:m.wet.gain}}; }},
 slapback:{n:'Slapback echo',p:{time:[0.11,0.04,0.2,'Time s',0.005],mix:[0.35,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d=c.createDelay(0.5); d.delayTime.value=p.time; m.dry.gain.value=1; m.i.connect(d); d.connect(m.wet); return{i:m.i,o:m.o,ap:{time:d.delayTime,mix:m.wet.gain}}; }},
 utility:{n:'Utility (gain, phase, mono)',p:{gain:[0,-36,24,'Gain dB',0.5],invert:[0,0,1,'Phase invert',1],mono:[0,0,1,'Mono',1]},
  b(c,p){ const g=c.createGain(); g.gain.value=dbToG(p.gain)*(p.invert?-1:1); if(p.mono){g.channelCount=1;g.channelCountMode='explicit'} return{i:g,o:g,ap:{gain:g.gain}}; }},
 tilt:{n:'Tilt EQ',p:{tilt:[0,-6,6,'Tilt dB (dark to bright)',0.1]},
  b(c,p){ const l=filt('lowshelf',800)(c),h=filt('highshelf',800)(c); l.gain.value=-p.tilt; h.gain.value=p.tilt; l.connect(h); return{i:l,o:h,ap:{tilt:h.gain}}; }},
 geq:{n:'Graphic EQ 10-band',p:Object.fromEntries([31,62,125,250,500,1000,2000,4000,8000,16000].map(f=>['b'+f,[0,-12,12,f+' Hz',0.5]])),
  b(c,p){ const fs=[31,62,125,250,500,1000,2000,4000,8000,16000].map(f=>{const b=filt('peaking',f,1.4)(c);b.gain.value=p['b'+f];return b}); chainNodes(fs); const ap={}; fs.forEach((b,i)=>ap['b'+[31,62,125,250,500,1000,2000,4000,8000,16000][i]]=b.gain); return{i:fs[0],o:fs[9],ap}; }},
 cut:{n:'Low and high cut',p:{low:[80,20,500,'Low cut Hz',1],high:[16000,2000,20000,'High cut Hz',10]},
  b(c,p){ const h=filt('highpass',p.low,0.7)(c),l=filt('lowpass',p.high,0.7)(c); h.connect(l); return{i:h,o:l,ap:{low:h.frequency,high:l.frequency}}; }},
 telephone:{n:'Telephone / radio voice',p:{low:[400,200,1000,'Low Hz',5],high:[3200,1500,5000,'High Hz',10],drive:[3,1,10,'Grit',0.1]},
  b(c,p){ const h=filt('highpass',p.low,1)(c),l=filt('lowpass',p.high,1)(c),w=c.createWaveShaper(); w.curve=satCurve(p.drive); chainNodes([h,w,l]); return{i:h,o:l,ap:{low:h.frequency,high:l.frequency}}; }},
 doubler:{n:'Vocal doubler',p:{time:[0.025,0.01,0.05,'Spread s',0.001],mix:[0.5,0,1,'Mix',0.01]},
  b(c,p){ const m=mixer(c,p.mix),d1=c.createDelay(0.1),d2=c.createDelay(0.1); d1.delayTime.value=p.time; d2.delayTime.value=p.time*1.37; lfo(c,0.3,0.001,d1.delayTime); lfo(c,0.23,0.001,d2.delayTime); const pl=c.createStereoPanner(),pr=c.createStereoPanner(); pl.pan.value=-0.8; pr.pan.value=0.8; m.dry.gain.value=1;
   m.i.connect(d1); m.i.connect(d2); d1.connect(pl); d2.connect(pr); pl.connect(m.wet); pr.connect(m.wet); return{i:m.i,o:m.o,ap:{mix:m.wet.gain}}; }},
 robot:{n:'Robot voice (hard tune)',p:{key:[0,0,11,'Key',1],scale:[2,0,5,'Scale',1],speed:[1,1,1,'Speed',0.01],mix:[1,0,1,'Mix',0.01]},b:wfx('cbx-tune',['key','scale','speed','mix'])},
 duck:{n:'Sidechain ducker',p:{amount:[0.7,0,1,'Amount',0.01],threshold:[-30,-60,0,'Trigger level dB',1],release:[0.2,0.02,1,'Release s',0.01]},b:wfx('cbx-duck',['amount','threshold','release'],2)},
 pump:{n:'Tempo pump (beat ducking)',p:{depth:[0.7,0,1,'Depth',0.01]},
  b(c,p){ const g=c.createGain(); const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=1/spb(); const d=c.createGain(); d.gain.value=p.depth/2; g.gain.value=1-p.depth/2; o.connect(d); d.connect(g.gain); o.start(); return{i:g,o:g,ap:{depth:d.gain}}; }},
 expander:{n:'Expander',p:{threshold:[-40,-90,0,'Threshold dB',1],release:[0.3,0.01,1,'Release s',0.01]},b:wfx('cbx-gate',['threshold','release'])},
 opto:{n:'Opto compressor',p:{threshold:[-24,-60,0,'Peak reduction dB',1],makeup:[4,0,24,'Gain dB',0.5]},
  b(c,p){ const k=c.createDynamicsCompressor(); k.threshold.value=p.threshold; k.ratio.value=3; k.knee.value=20; k.attack.value=0.01; k.release.value=0.5; const g=c.createGain(); g.gain.value=dbToG(p.makeup); k.connect(g); return{i:k,o:g,ap:{threshold:k.threshold,makeup:g.gain}}; }},
 boost:{n:'Volume boost',p:{gain:[3.5,0,18,'Boost dB',0.5]},b(c,p){ const g=c.createGain(); g.gain.value=dbToG(p.gain); return{i:g,o:g,ap:{gain:g.gain}}; }},
});
/* ---------- more instruments (synthesis engines) ---------- */
Object.assign(INSTDEF,{
 wt:{n:'Wavetable synth',p:{table:[0,0,7,'Table',1],morph:[0.3,0,1,'Morph',0.01],cut:[6000,60,16000,'Cutoff Hz',10],res:[1,0.1,20,'Resonance',0.1],a:[0.01,0.001,2,'Attack',0.001],d:[0.3,0.01,2,'Decay',0.01],s:[0.7,0,1,'Sustain',0.01],r:[0.4,0.01,4,'Release',0.01],vol:[0.35,0,1,'Volume',0.01]}},
 organ:{n:'Additive organ',p:{d1:[8,0,8,"16'",1],d2:[8,0,8,"8'",1],d3:[6,0,8,"5 1/3'",1],d4:[4,0,8,"4'",1],d5:[0,0,8,"2 2/3'",1],d6:[3,0,8,"2'",1],d7:[0,0,8,"1 3/5'",1],d8:[0,0,8,"1 1/3'",1],d9:[2,0,8,"1'",1],click:[0.3,0,1,'Key click',0.01],a:[0.005,0.001,1,'Attack',0.001],d:[0.1,0.01,1,'Decay',0.01],s:[1,0,1,'Sustain',0.01],r:[0.08,0.01,2,'Release',0.01],vol:[0.3,0,1,'Volume',0.01]}},
 pluck:{n:'Pluck (string model)',p:{decay:[1.5,0.2,4,'Decay',0.05],tone:[5000,500,16000,'Tone Hz',10],vol:[0.7,0,1,'Volume',0.01]}},
 b808:{n:'808 bass',p:{decay:[1.2,0.2,4,'Decay s',0.05],drop:[2,0,12,'Pitch drop semis',0.5],drive:[2,1,10,'Drive',0.1],vol:[0.7,0,1,'Volume',0.01]}},
 granular:{n:'Granular (uses sampler sample)',p:{root:[60,24,96,'Root note',1],grain:[0.08,0.01,0.3,'Grain s',0.005],density:[30,5,80,'Grains per s',1],spray:[0.3,0,1,'Position spray',0.01],pos:[0.3,0,1,'Position',0.01],a:[0.05,0.001,2,'Attack',0.001],r:[0.5,0.01,4,'Release',0.01],vol:[0.6,0,1,'Volume',0.01]}},
});
INSTDEF.drums.p.vol[0]=0.6; INSTDEF.drums.p.kit=[0,0,4,'Kit 0 Classic 1 808 2 Acoustic 3 Electro 4 Lo-Fi',1];
const WT_TABLES=[[1,.5,.33,.25,.2,.16,.14,.12],[1,0,.33,0,.2,0,.14,0],[1,.8,.6,.4,.3,.2,.1,.05],[1,0,0,.5,0,0,.33,0],[.3,1,.2,.6,.1,.4,0,.3],[1,.1,.6,.1,.4,.1,.3,.1],[1,.9,0,.7,0,.5,0,.3],[1,0,.1,0,.8,0,.1,.6]];
const _pw=new WeakMap();
function wtWave(c,t,m){ let mp=_pw.get(c); if(!mp){mp={};_pw.set(c,mp)} const k=t+'/'+Math.round(m*20); if(mp[k])return mp[k]; const A=WT_TABLES[t],B=WT_TABLES[(t+1)%8],re=new Float32Array(17),im=new Float32Array(17);
 for(let h=1;h<17;h++){const a=A[(h-1)%8]/Math.ceil(h/8),b=B[(h-1)%8]/Math.ceil(h/8);im[h]=a*(1-m)+b*m} return mp[k]=c.createPeriodicWave(re,im); }
const _basePlay=playNote;
playNote=function(c,dest,ins,pitch,t,dur,vel){ vel=vel==null?0.8:vel; const ty=ins.type;
 if(ty==='drums'&&ins.kit){ return _basePlay(c,dest,Object.assign({},ins,KITS[Math.round(ins.kit)]),pitch,t,dur,vel); }
 if(!['wt','organ','pluck','b808','granular'].includes(ty))return _basePlay(c,dest,ins,pitch,t,dur,vel);
 const g=c.createGain(); g.connect(dest); const srcs=[]; let rel=ins.r||0.2; const f=mtof(pitch);
 if(ty==='wt'){ const o=c.createOscillator(); o.setPeriodicWave(wtWave(c,Math.round(ins.table),ins.morph)); o.frequency.value=f; const fl=filt('lowpass',ins.cut,ins.res)(c); o.connect(fl); fl.connect(g); srcs.push(o); adsr(g,t,ins,vel*ins.vol); }
 else if(ty==='organ'){ const ratios=[0.5,1,1.5,2,3,4,5,6,8]; ratios.forEach((r,i)=>{const lv=ins['d'+(i+1)]/8;if(!lv||f*r>20000)return;const o=c.createOscillator(),og=c.createGain();o.frequency.value=f*r;og.gain.value=lv/4;o.connect(og);og.connect(g);srcs.push(o)});
  if(ins.click>0){const n=c.createBufferSource();n.buffer=noiseBuf(c);const ng=c.createGain();ng.gain.setValueAtTime(ins.click*0.3,t);ng.gain.exponentialRampToValueAtTime(0.001,t+0.015);n.connect(ng);ng.connect(g);n.start(t);n.stop(t+0.03)} adsr(g,t,ins,vel*ins.vol); }
 else if(ty==='pluck'){ const s=c.createBufferSource(); s.buffer=ksBuf(c,pitch,ins.decay); const fl=filt('lowpass',ins.tone,0.5)(c); s.connect(fl); fl.connect(g); g.gain.value=vel*ins.vol; srcs.push(s); rel=0.08; }
 else if(ty==='b808'){ const o=c.createOscillator(); o.frequency.setValueAtTime(f*Math.pow(2,ins.drop/12),t); o.frequency.exponentialRampToValueAtTime(f,t+0.08); const w=c.createWaveShaper(); w.curve=satCurve(ins.drive); o.connect(w); w.connect(g);
  g.gain.setValueAtTime(vel*ins.vol,t); g.gain.setTargetAtTime(0,t+0.05,ins.decay/3); srcs.push(o); rel=0.05; }
 else if(ty==='granular'){ const b=BUFS[ins.buf]||ksBuf(c,ins.root,1.5); adsr(g,t,{a:ins.a,d:0.1,s:1},vel*ins.vol); const end=t+(dur==null?4:dur)+ins.r; const rate=Math.pow(2,(pitch-ins.root)/12);
  if(b){ for(let gt=t;gt<end;gt+=1/ins.density){ const s=c.createBufferSource(),e=c.createGain(); s.buffer=b; s.playbackRate.value=rate; const pos=Math.max(0,Math.min(0.99,ins.pos+(Math.random()-0.5)*ins.spray))*b.duration; e.gain.setValueAtTime(0,gt); e.gain.linearRampToValueAtTime(0.5,gt+ins.grain/2); e.gain.linearRampToValueAtTime(0,gt+ins.grain); s.connect(e); e.connect(g); s.start(gt,pos,ins.grain*rate+0.01); } }
  return{stop(te){ release(g,Math.max(te,t+0.01),ins.r); }}; }
 srcs.forEach(s=>s.start(t)); let done=false; const stop=te=>{ if(done)return; done=true; te=Math.max(te,t+0.005); release(g,te,rel); srcs.forEach(s=>{try{s.stop(te+rel*1.5+0.05)}catch(e){}}); };
 if(dur!=null){ if(ty==='pluck'||ty==='b808')srcs.forEach(s=>{try{s.stop(t+Math.max(dur,0.05)+3)}catch(e){}}); else stop(t+dur); } return{stop}; };
const KITS=[{},{tune:-3,decay:1.8},{tune:2,decay:0.8},{tune:5,decay:0.6},{tune:-5,decay:0.7}];
/* ---------- instrument presets (named sounds built from the engines) ---------- */
const INST_PRESETS={
 'Piano-ish':['fm',{ratio:1,index:1.6,mdec:0.5,a:0.002,d:1.2,s:0.05,r:0.5}],'Electric piano':['fm',{ratio:14,index:0.8,mdec:0.3,a:0.002,d:1.5,s:0.15,r:0.6}],'Soft keys':['fm',{ratio:1,index:0.8,mdec:0.6,a:0.01,d:0.8,s:0.3,r:0.4}],
 'Bell':['fm',{ratio:3.5,index:5,mdec:1.5,a:0.001,d:2,s:0,r:1.2}],'Strings pad':['sub',{w1:'sawtooth',w2:'sawtooth',det:12,mix:0.5,cut:2500,res:0.7,env:500,a:0.6,d:0.5,s:0.85,r:1.2,lfoAmt:0.15,lfoTo:'pitch',lfoRate:5}],
 'Strings':['sub',{w1:'sawtooth',w2:'sawtooth',det:9,mix:0.5,cut:3200,res:0.8,env:300,a:0.3,d:0.4,s:0.9,r:0.6,lfoAmt:0.1,lfoTo:'pitch'}],'Warm pad':['sub',{w1:'triangle',w2:'sawtooth',det:15,mix:0.35,cut:1200,res:1,env:400,a:0.8,d:1,s:0.8,r:1.5}],
 'Round bass':['sub',{w1:'triangle',w2:'square',oct2:-1,mix:0.3,cut:700,res:2,env:400,a:0.005,d:0.3,s:0.6,r:0.15}],'Synth bass':['sub',{w1:'sawtooth',w2:'square',oct2:-1,mix:0.5,cut:500,res:8,env:2000,a:0.003,d:0.2,s:0.3,r:0.1}],
 'Pedal-steel lead':['sub',{w1:'sawtooth',w2:'triangle',det:4,mix:0.5,cut:2800,res:2,env:800,a:0.12,d:0.4,s:0.8,r:0.6,lfoAmt:0.25,lfoTo:'pitch',lfoRate:5.5}],'Lead':['sub',{w1:'sawtooth',w2:'square',det:8,cut:3500,res:5,env:3000,a:0.005,d:0.2,s:0.7,r:0.2}],
 'Pluck':['pluck',{decay:1.2}],'Guitar-ish pluck':['pluck',{decay:2.5,tone:3500}],'Harp':['pluck',{decay:3,tone:8000}],'808 bass':['b808',{}],'Organ':['organ',{}],'Gospel organ':['organ',{d1:8,d2:8,d3:8,d4:0,d6:0,d9:0,click:0.6}],
 'Jazz organ':['organ',{d1:8,d2:8,d3:8,d4:0,d5:0,d6:0,d9:0}],'Wavetable lead':['wt',{table:4,morph:0.5,cut:5000}],'Glass pad':['wt',{table:7,morph:0.2,a:0.7,r:1.5}],'Brass-ish':['sub',{w1:'sawtooth',w2:'sawtooth',det:5,cut:900,res:1,env:3500,a:0.06,d:0.3,s:0.7,r:0.2}],
 'Granular cloud':['granular',{}],'Sampler':['sampler',{}],'Drum kit':['drums',{}],'808 kit':['drums',{kit:1}],'Acoustic kit':['drums',{kit:2}],'Electro kit':['drums',{kit:3}],'Lo-Fi kit':['drums',{kit:4}],
};
// generated preset banks: wave x envelope x filter x character for the synth engines
(function(){ const W=[['Saw','sawtooth'],['Square','square'],['Triangle','triangle'],['Sine','sine']],E=[['Pluck',{a:0.002,d:0.2,s:0,r:0.2}],['Stab',{a:0.002,d:0.15,s:0.2,r:0.1}],['Keys',{a:0.005,d:0.5,s:0.4,r:0.3}],['Pad',{a:0.6,d:0.8,s:0.8,r:1.4}],['Swell',{a:1.2,d:0.5,s:1,r:1}]],
 F=[['Dark',{cut:600,res:1}],['Warm',{cut:1500,res:2}],['Bright',{cut:6000,res:1}],['Resonant',{cut:1200,res:12}]],C=[['Mono',{det:0,mix:0}],['Wide',{det:14,mix:0.5}],['Huge',{det:25,mix:0.6,oct2:-1}]];
 W.forEach(([wn,w])=>E.forEach(([en,e])=>F.forEach(([fn,f])=>C.forEach(([cn,ch])=>{INST_PRESETS[`Synth ${wn} ${en} ${fn} ${cn}`]=['sub',Object.assign({w1:w,w2:w},e,f,ch)]}))));
 [0.5,1,2,3,3.5,4,7,14].forEach(r=>[1,3,6].forEach(ix=>[['Short',0.2],['Long',1.2]].forEach(([dn,d])=>{INST_PRESETS[`FM ratio ${r} index ${ix} ${dn}`]=['fm',{ratio:r,index:ix,d,mdec:d}]})));
 for(let t=0;t<8;t++)[0,0.5,1].forEach(m=>{INST_PRESETS[`Wavetable ${t+1} morph ${m*100}%`]=['wt',{table:t,morph:m}]});
})();
function applyInstPreset(name){ const[ty,ov]=INST_PRESETS[name]; const keep=selTrack()&&selTrack().inst&&selTrack().inst.buf; const p=Object.assign(instNew(ty),ov); if(keep)p.buf=keep; p.preset=name; return p; }
// FX presets: Light / Medium / Heavy for every effect, scaling the main parameter
function fxPresets(){ const out=[]; for(const k in FXDEF){ const d=FXDEF[k].p,main=Object.keys(d).find(x=>x==='mix')||Object.keys(d)[0];
 [['Light',0.25],['Medium',0.5],['Heavy',0.85]].forEach(([n,a])=>{const[def,mn,mx]=d[main];out.push({name:FXDEF[k].n+' '+n,type:k,over:{[main]:typeof def==='number'?mn+(mx-mn)*a:def}})}); } return out; }
/* ---------- MIDI FX (non-destructive, applied when notes are scheduled) ---------- */
const MIDIFX_DEF={arp:'Arpeggiator',chord:'Chord generator',transpose:'Transpose',humanise:'Humanise',velocity:'Velocity scale',scale:'Scale lock',echo:'Note echo'};
const CHORD_SHAPES={Major:[0,4,7],Minor:[0,3,7],Sus2:[0,2,7],Sus4:[0,5,7],'7th':[0,4,7,10],'Maj7':[0,4,7,11],'Min7':[0,3,7,10],Power:[0,7,12],Add9:[0,4,7,14],Dim:[0,3,6],Aug:[0,4,8]};
const SCALES={Major:[0,2,4,5,7,9,11],Minor:[0,2,3,5,7,8,10],Dorian:[0,2,3,5,7,9,10],Phrygian:[0,1,3,5,7,8,10],Lydian:[0,2,4,6,7,9,11],Mixolydian:[0,2,4,5,7,9,10],Locrian:[0,1,3,5,6,8,10],'Harmonic minor':[0,2,3,5,7,8,11],'Melodic minor':[0,2,3,5,7,9,11],'Major pentatonic':[0,2,4,7,9],'Minor pentatonic':[0,3,5,7,10],Blues:[0,3,5,6,7,10],Chromatic:[0,1,2,3,4,5,6,7,8,9,10,11]};
function snapScale(p,key,sc){ const S=SCALES[sc]||SCALES.Major; let best=p,bd=99; for(let d=-6;d<=6;d++){const q=p+d;if(S.includes(((q-key)%12+12)%12)&&Math.abs(d)<bd){bd=Math.abs(d);best=q}} return best; }
let _rng=1; const rnd=()=>{_rng=(_rng*16807)%2147483647;return _rng/2147483647};
function midiFX(t,notes,len){ const m=t.mfx; if(!m)return notes; let out=notes.map(n=>Object.assign({},n)); _rng=7;
 if(m.chord&&m.chord.on){ const sh=CHORD_SHAPES[m.chord.type]||CHORD_SHAPES.Major; out=out.flatMap(n=>sh.map(iv=>Object.assign({},n,{p:n.p+iv}))); }
 if(m.scale&&m.scale.on)out.forEach(n=>n.p=snapScale(n.p,m.scale.key|0,m.scale.type));
 if(m.transpose&&m.transpose.on)out.forEach(n=>n.p+=m.transpose.semi|0);
 if(m.arp&&m.arp.on){ const step=1/(m.arp.rate||4),oct=m.arp.oct||1,res=[]; const groups={}; out.forEach(n=>{const k=n.s.toFixed(3)+'/'+n.l.toFixed(3);(groups[k]=groups[k]||[]).push(n)});
  for(const k in groups){ const g=groups[k].sort((a,b)=>a.p-b.p); let ps=[]; for(let o=0;o<oct;o++)ps=ps.concat(g.map(n=>n.p+12*o)); if(m.arp.mode==='Down')ps.reverse(); else if(m.arp.mode==='Up Down')ps=ps.concat(ps.slice(1,-1).reverse());
   const s0=g[0].s,L=g[0].l; let i=0; for(let s=s0;s<s0+L-1e-6;s+=step,i++){ const p=m.arp.mode==='Random'?ps[Math.floor(rnd()*ps.length)]:ps[i%ps.length]; res.push({p,s,l:step*0.9,v:g[0].v}); } }
  out=res; }
 if(m.echo&&m.echo.on){ const ex=[]; out.forEach(n=>{for(let k=1;k<=(m.echo.n||2);k++)ex.push(Object.assign({},n,{s:n.s+k*(m.echo.time||0.5),v:n.v*Math.pow(0.6,k)}))}); out=out.concat(ex.filter(n=>n.s<len)); }
 if(m.velocity&&m.velocity.on)out.forEach(n=>n.v=Math.max(0.05,Math.min(1,n.v*(m.velocity.scale||1))));
 if(m.humanise&&m.humanise.on)out.forEach(n=>{n.s=Math.max(0,n.s+(rnd()-0.5)*0.04*(m.humanise.amt||1));n.v=Math.max(0.05,Math.min(1,n.v+(rnd()-0.5)*0.2*(m.humanise.amt||1)))});
 return out; }
/* ---------- generators (write notes into a clip) ---------- */
const PROGS={'I-V-vi-IV':[0,4,5,3],'ii-V-I':[1,4,0,0],'I-vi-IV-V':[0,5,3,4],'vi-IV-I-V':[5,3,0,4],'I-IV-V-IV':[0,3,4,3],'12 bar blues':[0,0,0,0,3,3,0,0,4,3,0,4],'I-iii-IV-V':[0,2,3,4],'i-VI-III-VII':[0,5,2,6],Andalusian:[0,6,5,4],'I-V-IV':[0,4,3,3],'Doo wop':[0,5,3,4],Canon:[0,4,5,2,3,0,3,4],'Country I-IV-I-V':[0,3,0,4]};
const GENRES=['Rock','Rockabilly','House','Techno','Hip hop','Trap','Drum and bass','Reggae','Funk','Pop','Country','Jazz','Country shuffle','Lo-fi'];
const MOODS=['Happy','Sad','Dreamy','Dark','Bouncy','Epic','Lullaby'];
function genChords(prog,key,minor,bars){ const S=minor?SCALES.Minor:SCALES.Major,deg=PROGS[prog],notes=[],sig=P.sig||4; deg.forEach((d,i)=>{ if(i>=bars)return; [0,2,4].forEach(k=>{const idx=d+k,p=48+key+S[idx%7]+12*Math.floor(idx/7);notes.push({p,s:i*sig,l:sig,v:0.7})}); }); return notes; }
function genMelody(key,mood,seed,bars){ _rng=seed*977+mood*131+key; const minor=[1,3,6].includes(mood),S=minor?SCALES.Minor:SCALES.Major,dens=[0.5,1,1,0.5,0.5,0.25,1][mood],notes=[],sig=P.sig||4; let deg=7;
 for(let b=0;b<bars*sig;b+=dens){ if(rnd()<0.2)continue; deg=Math.max(0,Math.min(14,deg+Math.round((rnd()-0.5)*4))); const p=60+key+S[deg%7]+12*Math.floor(deg/7)-12*([3,6].includes(mood)?1:0); notes.push({p,s:b,l:dens*(rnd()<0.3?2:1)*0.95,v:0.6+rnd()*0.3}); } return notes; }
function genDrums(genre,v,bars){ _rng=v*31+genre.length; const sig=P.sig||4,steps=sig*4,n=[]; const put=(p,st,vel)=>n.push({p,s:st/4,l:0.25,v:vel});
 const pat={Rock:{36:[0,8],38:[4,12],42:[0,2,4,6,8,10,12,14]},Rockabilly:{36:[0,8],38:[4,12],42:[0,3,4,7,8,11,12,15]},House:{36:[0,4,8,12],39:[4,12],46:[2,6,10,14],42:[0,4,8,12]},Techno:{36:[0,4,8,12],42:[2,6,10,14],39:[12]},
  'Hip hop':{36:[0,7,10],38:[4,12],42:[0,2,4,6,8,10,12,14]},Trap:{36:[0,11],38:[8],42:[0,1,2,3,4,6,8,9,10,11,12,14,15]},'Drum and bass':{36:[0,10],38:[4,12],42:[0,2,4,6,8,10,12,14]},Reggae:{36:[8],38:[8],42:[2,6,10,14]},
  Funk:{36:[0,3,10],38:[4,12,7],42:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]},Pop:{36:[0,6,8],38:[4,12],42:[0,2,4,6,8,10,12,14]},Country:{36:[0,8],38:[4,12],42:[0,2,4,6,8,10,12,14]},'Country shuffle':{36:[0,8],38:[4,12],42:[0,3,4,7,8,11,12,15]},
  Jazz:{49:[0,6,8,14],42:[4,12],36:[0]},'Lo-fi':{36:[0,7,10],38:[4,12],42:[0,2,4,6,8,10,12,14]}}[genre]||{36:[0,8],38:[4,12]};
 for(let bar=0;bar<bars;bar++)for(const p in pat)pat[p].forEach(st=>{ if(st>=steps)return; if(v>1&&rnd()<0.08*v)return; put(+p,bar*steps+st,(st%4===0?0.95:0.7)-(+p===42?0.2:0)); });
 if(v>2)for(let bar=0;bar<bars;bar++)if(rnd()<0.5)put(38,bar*steps+steps-1,0.5); return n; }
