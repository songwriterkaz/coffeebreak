/* Coffeebreak audio engine: Web Audio synths, drums, scheduler, WAV export. No outside services. */
(function(){
const CBA={};window.CBA=CBA;
CBA.INSTS=['piano','guitar','strings','synth','808','organ','bass','bells','sampler'];
CBA.DRUMS=['Kick','Snare','Clap','Hi-hat','Open hat','Tom','Cymbal','Rim'];
CBA.NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
CBA.name=m=>CBA.NN[((m%12)+12)%12]+(Math.floor(m/12)-1);
CBA.freq=m=>440*Math.pow(2,(m-69)/12);
CBA.ctx=null;CBA.sampleBuf=null;CBA.buffers={};
CBA.init=function(){
 if(CBA.ctx)return CBA.ctx;
 const AC=window.AudioContext||window.webkitAudioContext;const c=new AC();CBA.ctx=c;
 const g=c.createGain();g.gain.value=.75;const comp=c.createDynamicsCompressor();g.connect(comp);comp.connect(c.destination);
 const an=c.createAnalyser();an.fftSize=1024;comp.connect(an);
 CBA.out={in:g,an:an};return c;};
CBA.resume=function(){const c=CBA.init();if(c.state!=='running')c.resume();return c;};
const NB=new WeakMap();
function noise(c){let b=NB.get(c);if(b)return b;b=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;NB.set(c,b);return b;}
const KS=new WeakMap();
function ks(c,f){let m=KS.get(c);if(!m){m={};KS.set(c,m);}const k=Math.round(f*10);if(m[k])return m[k];
 const sr=c.sampleRate,N=Math.max(2,Math.round(sr/f)),len=Math.floor(sr*1.6),b=c.createBuffer(1,len,sr),d=b.getChannelData(0);
 for(let i=0;i<N;i++)d[i]=Math.random()*2-1;
 for(let i=N;i<len;i++)d[i]=.4985*(d[i-N]+d[i-N+1<i?i-N+1:i-N]);
 m[k]=b;return b;}
function env(g,t,a,d,s,r,dur,pk){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(pk*s,t+a,Math.max(.01,d/3));
 const e=t+Math.max(dur,a+.02);g.gain.setTargetAtTime(0,e,Math.max(.01,r/3));return e+r+.05;}
function osc(c,type,f,t,end,dest,det){const o=c.createOscillator();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;o.connect(dest);o.start(t);o.stop(end);return o;}
CBA.note=function(c,out,inst,m,t,dur,vel){
 vel=vel==null?.8:vel;const f=CBA.freq(m),g=c.createGain();g.connect(out);
 if(inst==='piano'){const pk=.5*vel,end=env(g,t,.005,Math.max(.5,dur*1.2),.08,.25,dur,pk);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(9000,f*8);lp.connect(g);
  [[1,1],[2,.45],[3,.22],[4,.1],[5,.05]].forEach(p=>{const o=c.createOscillator(),pg=c.createGain();o.type='sine';o.frequency.value=f*p[0];pg.gain.value=p[1];o.connect(pg);pg.connect(lp);o.start(t);o.stop(end);});}
 else if(inst==='guitar'){const s=c.createBufferSource();s.buffer=ks(c,f);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4500;s.connect(lp);lp.connect(g);
  g.gain.setValueAtTime(vel*.9,t);const e=t+Math.max(dur,.25);g.gain.setTargetAtTime(0,e,.15);s.start(t);s.stop(e+.9);}
 else if(inst==='strings'){const end=env(g,t,.25,.3,.85,.5,dur,.22*vel);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(4000,f*5);lp.connect(g);
  [-9,0,9].forEach(d=>osc(c,'sawtooth',f,t,end,lp,d));}
 else if(inst==='synth'){const end=env(g,t,.01,.2,.6,.2,dur,.2*vel);const lp=c.createBiquadFilter();lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(Math.min(8000,f*10),t);lp.frequency.exponentialRampToValueAtTime(Math.min(2500,f*3),t+.25);lp.connect(g);
  osc(c,'sawtooth',f,t,end,lp,-7);osc(c,'square',f,t,end,lp,7);}
 else if(inst==='808'){const end=env(g,t,.003,Math.max(.4,dur),.2,.2,dur,.9*vel);const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(f*2.2,t);o.frequency.exponentialRampToValueAtTime(f,t+.07);o.connect(g);o.start(t);o.stop(end);}
 else if(inst==='organ'){const end=env(g,t,.012,.05,.9,.08,dur,.2*vel);[[.5,.3],[1,.6],[2,.5],[3,.3],[4,.2]].forEach(p=>{const pg=c.createGain();pg.gain.value=p[1];pg.connect(g);osc(c,'sine',f*p[0],t,end,pg);});}
 else if(inst==='bass'){const end=env(g,t,.008,.25,.5,.1,dur,.55*vel);const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(260,t+.2);lp.connect(g);osc(c,'sawtooth',f,t,end,lp);osc(c,'sine',f,t,end,g);}
 else if(inst==='bells'){const pk=.3*vel;g.gain.setValueAtTime(pk,t);const D=Math.max(1.5,dur);g.gain.setTargetAtTime(0,t+.01,D/5);[[1,1,1],[2.76,.5,.6],[5.4,.3,.35],[8.93,.15,.2]].forEach(p=>{const o=c.createOscillator(),pg=c.createGain();o.frequency.value=f*p[0];pg.gain.setValueAtTime(p[1],t);pg.gain.setTargetAtTime(0,t,D*p[2]/4);o.connect(pg);pg.connect(g);o.start(t);o.stop(t+D*1.6+.3);});}
 else if(inst==='sampler'){const b=CBA.sampleBuf;if(!b){g.disconnect();return;}const s=c.createBufferSource();s.buffer=b;s.playbackRate.value=Math.pow(2,(m-60)/12);s.connect(g);
  g.gain.setValueAtTime(.8*vel,t);const e=t+Math.max(dur,.1);g.gain.setTargetAtTime(0,e,.04);s.start(t);s.stop(Math.min(t+b.duration/s.playbackRate.value,e+.3));}
};
CBA.drum=function(c,out,n,t,vel){
 vel=vel==null?.8:vel;const g=c.createGain();g.connect(out);
 const nz=(dec,type,fr,q)=>{const s=c.createBufferSource();s.buffer=noise(c);const f=c.createBiquadFilter();f.type=type;f.frequency.value=fr;if(q)f.Q.value=q;s.connect(f);f.connect(g);s.start(t,Math.random());s.stop(t+dec+.05);};
 if(n===0){const o=c.createOscillator();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(1.1*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.4);o.connect(g);o.start(t);o.stop(t+.45);}
 else if(n===1){g.gain.setValueAtTime(.8*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);nz(.22,'highpass',1500);const o=c.createOscillator();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(150,t+.1);const og=c.createGain();og.gain.setValueAtTime(.6,t);og.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(og);og.connect(g);o.start(t);o.stop(t+.15);}
 else if(n===2){[0,.012,.026].forEach((d,i)=>{const gg=c.createGain();gg.connect(g);const s=c.createBufferSource();s.buffer=noise(c);const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1300;f.Q.value=.9;s.connect(f);f.connect(gg);gg.gain.setValueAtTime(i<2?.5:.7,t+d);gg.gain.exponentialRampToValueAtTime(.001,t+d+(i<2?.012:.2));s.start(t+d,Math.random());s.stop(t+d+.25);});g.gain.value=vel;}
 else if(n===3){g.gain.setValueAtTime(.5*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);nz(.06,'highpass',7500);}
 else if(n===4){g.gain.setValueAtTime(.45*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);nz(.35,'highpass',7000);}
 else if(n===5){const o=c.createOscillator();o.frequency.setValueAtTime(190,t);o.frequency.exponentialRampToValueAtTime(85,t+.2);g.gain.setValueAtTime(.9*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);o.start(t);o.stop(t+.4);}
 else if(n===6){g.gain.setValueAtTime(.4*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+1.3);nz(1.3,'highpass',5000);nz(1.3,'bandpass',9000,.6);}
 else{const o=c.createOscillator();o.type='square';o.frequency.value=820;g.gain.setValueAtTime(.25*vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);o.connect(g);o.start(t);o.stop(t+.06);nz(.04,'highpass',3000);}
};
/* effects bus: reverb + delay sends */
function impulse(c,sec){const n=c.sampleRate*sec,b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.6);}return b;}
CBA.makeFx=function(c,dest,bpm){
 const rev=c.createConvolver();rev.buffer=impulse(c,1.8);const rg=c.createGain();rg.connect(rev);const ro=c.createGain();ro.gain.value=.8;rev.connect(ro);ro.connect(dest);
 const dl=c.createDelay(2);dl.delayTime.value=Math.min(1.9,60/(bpm||100)*.75);const fb=c.createGain();fb.gain.value=.38;dl.connect(fb);fb.connect(dl);const dg=c.createGain();dg.connect(dl);const dout=c.createGain();dout.gain.value=.7;dl.connect(dout);dout.connect(dest);
 return {rev:rg,dly:dg};};
CBA.makeTrackChain=function(c,dest,fx,tr){
 const inn=c.createGain();const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=tr.cut||18000;inn.connect(lp);
 const pan=c.createStereoPanner?c.createStereoPanner():c.createGain();if(pan.pan)pan.pan.value=tr.pan||0;lp.connect(pan);
 const vol=c.createGain();vol.gain.value=tr.vol==null?.8:tr.vol;pan.connect(vol);vol.connect(dest);
 if(fx){const r=c.createGain();r.gain.value=tr.rev||0;vol.connect(r);r.connect(fx.rev);const d=c.createGain();d.gain.value=tr.dly||0;vol.connect(d);d.connect(fx.dly);}
 return inn;};
CBA.stepSec=p=>60/p.bpm/4;
CBA.loopSec=p=>p.bars*16*CBA.stepSec(p);
/* schedule a project just in time (keeps the audio graph small). opts: {loop,manual,metro,from} */
CBA.schedule=function(c,dest,p,t0,opts){
 opts=opts||{};const bus=c.createGain();bus.connect(dest);const ss=CBA.stepSec(p);const fx=CBA.makeFx(c,bus,p.bpm);
 const solo=p.tracks.some(t=>t.solo);const total=CBA.loopSec(p);const ev=[];
 p.tracks.forEach(tr=>{
  if(tr.mute||(solo&&!tr.solo))return;
  const chain=CBA.makeTrackChain(c,bus,fx,tr);
  if(tr.type==='audio'){(tr.clips||[]).forEach(cl=>{const bf=CBA.buffers[cl.buf];if(!bf)return;ev.push({t:cl.s*ss,f:abs=>{const s=c.createBufferSource();s.buffer=bf;const g=c.createGain();g.gain.value=cl.gain==null?1:cl.gain;s.connect(g);g.connect(chain);const off=cl.off||0;const du=Math.min(cl.dur||bf.duration-off,bf.duration-off);if(du>0)s.start(abs,off,du);}});});return;}
  (tr.notes||[]).forEach(n=>ev.push({t:n.s*ss,f:abs=>{if(tr.type==='drums')CBA.drum(c,chain,n.m,abs,n.v);else CBA.note(c,chain,tr.inst,n.m,abs,Math.max(.05,n.l*ss*.98),n.v);}}));
 });
 if(opts.metro){for(let i=0;i<p.bars*4;i++)ev.push({t:i*4*ss,f:abs=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=i%4===0?1500:1000;g.gain.setValueAtTime(.25,abs);g.gain.exponentialRampToValueAtTime(.001,abs+.05);o.connect(g);g.connect(bus);o.start(abs);o.stop(abs+.06);}});}
 ev.sort((a,b)=>a.t-b.t);let idx=0,cycle=0,stopped=false,timer=null;
 const from=opts.from||0;while(idx<ev.length&&ev[idx].t<from)idx++;
 function pump(limit){let guard=0;while(!stopped&&guard++<100000){if(idx>=ev.length){if(opts.loop&&ev.length){cycle++;idx=0;}else if(opts.loop&&!ev.length&&t0+(cycle+1)*total<limit){cycle++;}else break;}
   if(idx>=ev.length)break;const e=ev[idx],abs=t0+cycle*total+e.t;if(abs>limit)break;e.f(abs);idx++;}}
 const S={bus,end:t0+total,pump,total,cycle:()=>cycle,stop(){if(stopped)return;stopped=true;clearInterval(timer);try{bus.gain.cancelScheduledValues(0);bus.gain.setTargetAtTime(0,c.currentTime,.015);setTimeout(()=>{try{bus.disconnect()}catch(e){}},250);}catch(e){}}};
 if(!opts.manual){pump(c.currentTime+.8);timer=setInterval(()=>pump(c.currentTime+.8),120);}
 return S;};
CBA.render=async function(p,tail){
 const sr=44100,dur=CBA.loopSec(p)+(tail==null?2.5:tail),len=Math.ceil(dur*sr);const oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,len,sr);
 const m=oc.createGain();m.gain.value=.7;const comp=oc.createDynamicsCompressor();m.connect(comp);comp.connect(oc.destination);
 const S=CBA.schedule(oc,m,p,.05,{manual:true});const W=3;S.pump(.05+W+1);
 const win=[];for(let t=W;t<dur;t+=W)win.push(t);
 const next=i=>{if(i>=win.length)return;oc.suspend(win[i]).then(()=>{S.pump(win[i]+W+1);oc.resume();next(i+1);});};next(0);
 return oc.startRendering();};
CBA.wav=function(buf){const ch=buf.numberOfChannels,n=buf.length,sr=buf.sampleRate,bytes=44+n*ch*2,ab=new ArrayBuffer(bytes),v=new DataView(ab);
 const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 ws(0,'RIFF');v.setUint32(4,bytes-8,true);ws(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*ch*2,true);
 const cd=[];for(let i=0;i<ch;i++)cd.push(buf.getChannelData(i));let o=44;
 for(let i=0;i<n;i++)for(let k=0;k<ch;k++){let s=Math.max(-1,Math.min(1,cd[k][i]));v.setInt16(o,s<0?s*32768:s*32767,true);o+=2;}
 return new Blob([ab],{type:'audio/wav'});};
CBA.download=function(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);};
/* pitch detection (autocorrelation) */
CBA.detect=function(buf,sr){let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);if(rms<.01)return -1;
 const N=buf.length,min=Math.floor(sr/1200),max=Math.min(Math.floor(sr/50),N>>1);let best=-1,bc=0;const c=new Float32Array(max+2);
 for(let l=min;l<=max;l++){let s=0;for(let i=0;i<N-l;i++)s+=buf[i]*buf[i+l];c[l]=s;}
 let l=min;while(l<max&&c[l]>c[l+1])l++;
 for(;l<=max;l++)if(c[l]>bc){bc=c[l];best=l;}
 let c0=0;for(let i=0;i<N;i++)c0+=buf[i]*buf[i];if(best<0||bc<.35*c0)return -1;
 const y1=c[best-1]||0,y2=c[best],y3=c[best+1]||0,den=y1-2*y2+y3;const sh=den?.5*(y1-y3)/den:0;return sr/(best+sh);};
/* theory helpers */
CBA.MAJ=[0,2,4,5,7,9,11];CBA.MIN=[0,2,3,5,7,8,10];
CBA.CH={maj:[0,4,7],min:[0,3,7],dim:[0,3,6],sus4:[0,5,7],'7':[0,4,7,10],maj7:[0,4,7,11],min7:[0,3,7,10]};
CBA.store={get:(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}};
})();
