/* Coffeebreak Mega Studio. (c) Coffeebreak (Karen O'Brien). All rights reserved. */
'use strict';
const $=id=>document.getElementById(id);
const el=(t,a={},...k)=>{const e=document.createElement(t);for(const x in a){if(x==='on')for(const ev in a.on)e.addEventListener(ev,a.on[ev]);else if(x in e&&x!=='list')e[x]=a[x];else e.setAttribute(x,a[x])}k.forEach(c=>e.append(c));return e};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const db=v=>Math.pow(10,v/20);
const fmt=t=>{t=Math.max(0,t||0);return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')};
const toast=m=>{const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(t._t);t._t=setTimeout(()=>t.style.display='none',2600)};
let ctx=null;const S={};window.CBS=S;
const NOTE=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/* ---------- worklets ---------- */
const WORKLET=`
class Rec extends AudioWorkletProcessor{constructor(){super();this.on=false;this.port.onmessage=e=>{this.on=e.data==='start'}}
 process(i,o){const a=i[0];if(a&&a.length){for(let c=0;c<o[0].length;c++)o[0][c].set(a[c]||a[0]);if(this.on){this.port.postMessage([a[0].slice(0),(a[1]||a[0]).slice(0)])}}return true}}
registerProcessor('cb-rec',Rec);
class Pitch extends AudioWorkletProcessor{
 static get parameterDescriptors(){return[{name:'shift',defaultValue:0,minValue:-24,maxValue:24},{name:'correct',defaultValue:0,minValue:0,maxValue:1},{name:'key',defaultValue:0,minValue:0,maxValue:11},{name:'scale',defaultValue:0,minValue:0,maxValue:2},{name:'detect',defaultValue:0,minValue:0,maxValue:1}]}
 constructor(){super();this.N=8192;this.W=2048;this.buf=[new Float32Array(this.N),new Float32Array(this.N)];this.w=0;this.d=0;this.an=new Float32Array(2048);this.ai=0;this.cnt=0;this.ratio=1;this.corr=1}
 detectPitch(){const x=this.an,n=1024;let best=0,bl=-1,e=0;for(let i=0;i<n;i++)e+=x[i]*x[i];if(e<0.02)return 0;
  let prev=1,falling=true;for(let l=40;l<700;l++){let s=0;for(let i=0;i<n;i++)s+=x[i]*x[i+l];s/=e;if(s>best&&l>50){best=s;bl=l}}
  return best>0.5?sampleRate/bl:0}
 process(inp,out,p){const a=inp[0],o=out[0];if(!a||!a.length){return true}
  const shift=p.shift[0],corr=p.correct[0],key=p.key[0]|0,sc=p.scale[0]|0,det=p.detect[0];const L=a[0].length,N=this.N,W=this.W;
  for(let i=0;i<L;i++){const m=(a[0][i]+(a[1]||a[0])[i])*0.5;this.an[this.ai]=m;this.ai=(this.ai+1)%2048;}
  this.cnt+=L;if((corr>0||det>0)&&this.cnt>=1024){this.cnt=0;const lin=new Float32Array(2048);for(let i=0;i<2048;i++)lin[i]=this.an[(this.ai+i)%2048];const keep=this.an;this.an=lin;const f=this.detectPitch();this.an=keep;
   if(f>0){const midi=69+12*Math.log2(f/440);const S=[[0,1,2,3,4,5,6,7,8,9,10,11],[0,2,4,5,7,9,11],[0,2,3,5,7,8,10]][sc];let bestN=Math.round(midi),bd=99;
    for(let k=Math.floor(midi)-2;k<=Math.ceil(midi)+2;k++){if(S.indexOf(((k-key)%12+12)%12)<0)continue;const dd=Math.abs(k-midi);if(dd<bd){bd=dd;bestN=k}}
    this.corr=Math.pow(2,(bestN-midi)*corr/12);this.port.postMessage({f,midi,target:bestN})}else{this.corr=1;this.port.postMessage({f:0})}}
  const target=Math.pow(2,shift/12)*this.corr;this.ratio+=(target-this.ratio)*0.2;const r=this.ratio;
  if(Math.abs(r-1)<1e-4){for(let c=0;c<o.length;c++)o[c].set(a[c]||a[0]);return true}
  for(let i=0;i<L;i++){for(let c=0;c<2;c++)this.buf[c][this.w]=(a[c]||a[0])[i];
   this.d+=1-r;while(this.d<0)this.d+=W;while(this.d>=W)this.d-=W;const d2=(this.d+W/2)%W;
   const g1=Math.sin(Math.PI*this.d/W),g2=Math.sin(Math.PI*d2/W);
   for(let c=0;c<o.length;c++){const b=this.buf[c%2];const rd=(x)=>{const pos=this.w-x-1+N;const i0=Math.floor(pos),fr=pos-i0;return b[i0%N]*(1-fr)+b[(i0+1)%N]*fr};o[c][i]=rd(this.d)*g1+rd(d2)*g2}
   this.w=(this.w+1)%N}
  return true}}
registerProcessor('cb-pitch',Pitch);`;

/* ---------- helpers ---------- */
function impulse(c,sec,decay){const r=c.sampleRate,l=Math.floor(r*sec),b=c.createBuffer(2,l,r);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<l;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/l,decay||2.5)}return b}
function crushCurve(steps){const n=4096,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.round(x*steps)/steps}return c}
function driveCurve(k){const n=4096,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*k)/Math.tanh(k)}return c}
function biq(c,type,f,gn,q){const b=c.createBiquadFilter();b.type=type;b.frequency.value=f;if(gn!=null)b.gain.value=gn;if(q!=null)b.Q.value=q;return b}
function lfo(c,rate,depth,target){const o=c.createOscillator(),g=c.createGain();o.frequency.value=rate;g.gain.value=depth;o.connect(g).connect(target);o.start();return o}
function encodeWAV(chs,sr){const n=chs[0].length,nc=chs.length,cov=wavCoverChunk(),buf=new ArrayBuffer(44+n*nc*2+cov.length),v=new DataView(buf);let p=0;const ws=s=>{for(const ch of s)v.setUint8(p++,ch.charCodeAt(0))};
 ws('RIFF');v.setUint32(p,36+n*nc*2+cov.length,true);p+=4;ws('WAVEfmt ');v.setUint32(p,16,true);p+=4;v.setUint16(p,1,true);p+=2;v.setUint16(p,nc,true);p+=2;v.setUint32(p,sr,true);p+=4;v.setUint32(p,sr*nc*2,true);p+=4;v.setUint16(p,nc*2,true);p+=2;v.setUint16(p,16,true);p+=2;ws('data');v.setUint32(p,n*nc*2,true);p+=4;
 for(let i=0;i<n;i++)for(let c=0;c<nc;c++){const s=clamp(chs[c][i],-1,1);v.setInt16(p,s<0?s*0x8000:s*0x7fff,true);p+=2}if(cov.length)new Uint8Array(buf).set(cov,p);return new Blob([buf],{type:'audio/wav'})}
function bufToWav(b){const chs=[];for(let c=0;c<Math.max(2,b.numberOfChannels);c++)chs.push(b.getChannelData(Math.min(c,b.numberOfChannels-1)));return encodeWAV(chs,b.sampleRate)}
function download(blob,name,holder){const u=URL.createObjectURL(blob);const a=el('a',{href:u,download:name,textContent:'Download '+name+' ('+(blob.size/1048576).toFixed(2)+' MB)'});if(holder){holder.innerHTML='';holder.append(a,el('audio',{controls:true,src:u,style:'width:100%;margin-top:4px'}))}S.lastBlob=blob;S.lastBlobName=name;return a}
async function loadFile(f){return await decodeAny(f)}
function drawWave(cv,buf,pos,marks){const w=cv.width=cv.clientWidth*devicePixelRatio||600,h=cv.height,g=cv.getContext('2d');g.fillStyle='#0b0705';g.fillRect(0,0,w,h);if(!buf)return;
 if(!buf._peaks||buf._peaks.length!==w){const d=buf.getChannelData(0),st=Math.max(1,Math.floor(d.length/w)),pk=new Float32Array(w);for(let x=0;x<w;x++){let m=0;for(let i=x*st;i<x*st+st&&i<d.length;i+=4)m=Math.max(m,Math.abs(d[i]));pk[x]=m}buf._peaks=pk}
 g.fillStyle='#e8a54b';for(let x=0;x<w;x++){const v=buf._peaks[x]*h/2;g.fillRect(x,h/2-v,1,v*2)}
 (marks||[]).forEach(m=>{if(m.t==null)return;g.fillStyle=m.c;g.fillRect(m.t/buf.duration*w,0,m.w||2,h)});
 if(pos!=null){g.fillStyle='#fff';g.fillRect(pos/buf.duration*w,0,2,h)}}

/* synth sounds for demos, pads and test tones */
function makeBuf(sec,fn,sr){sr=sr||ctx.sampleRate;const n=Math.floor(sec*sr),b=ctx.createBuffer(2,n,sr),L=b.getChannelData(0),R=b.getChannelData(1);for(let i=0;i<n;i++){const v=fn(i/sr,i);if(Array.isArray(v)){L[i]=v[0];R[i]=v[1]}else L[i]=R[i]=v}return b}
const kick=t=>t<0.35?Math.sin(2*Math.PI*(50*t+90*(1-Math.exp(-t*30))/30))*Math.exp(-t*8):0;
const snare=t=>t<0.25?((Math.random()*2-1)*0.7+Math.sin(2*Math.PI*190*t)*0.4)*Math.exp(-t*18):0;
const hat=t=>t<0.06?(Math.random()*2-1)*Math.exp(-t*80)*0.5:0;
function demoSong(bpm,bars,vocal){const beat=60/bpm,len=bars*4*beat;const bass=[0,0,3,5,7,7,5,3];
 return makeBuf(len,t=>{const b=t/beat,bi=Math.floor(b),bt=t-bi*beat,qb=t%(beat/2);let v=kick(bt)*0.9;if(bi%2===1)v+=snare(bt)*0.5;v+=hat(qb)*0.35;
  const n=bass[bi%8];v+=Math.sin(2*Math.PI*55*Math.pow(2,n/12)*t)*0.25*(1-bt/beat);
  let voc=0;if(vocal){const mel=[12,14,16,19,16,14,12,7][Math.floor(b/2)%8];voc=Math.sin(2*Math.PI*220*Math.pow(2,mel/12)*t+Math.sin(2*Math.PI*5*t)*0.3)*0.22}
  const pad=Math.sin(2*Math.PI*220*Math.pow(2,(n+7)/12)*t)*0.06;
  return[clamp(v*0.8+voc+pad*1.4,-1,1),clamp(v*0.8+voc+pad*0.6,-1,1)]})}
function testTone(f,sec){return makeBuf(sec||4,t=>Math.sin(2*Math.PI*f*t)*0.5*Math.min(1,t*20,(sec||4)-t))}

/* ---------- FX ---------- */
function buildFx(c,type,p){p=p==null?0.5:p;const i=c.createGain(),o=c.createGain(),nodes=[];let set=()=>{};
 const chain=(...n)=>{let a=i;n.forEach(x=>{a.connect(x);a=x});a.connect(o)};
 switch(type){
 case'echo':{const d=c.createDelay(2),fb=c.createGain();d.delayTime.value=0.1+p*0.6;fb.gain.value=0.45;d.connect(fb).connect(d);chain(d);set=v=>d.delayTime.setTargetAtTime(0.1+v*0.6,c.currentTime,0.05);break}
 case'reverb':{const cv=c.createConvolver();cv.buffer=impulse(c,1+p*4);chain(cv);break}
 case'flanger':{const d=c.createDelay(0.05),fb=c.createGain();d.delayTime.value=0.004;fb.gain.value=0.6;d.connect(fb).connect(d);nodes.push(lfo(c,0.1+p*2,0.003,d.delayTime));chain(d);break}
 case'chorus':{[0.012,0.019,0.027].forEach((t,k)=>{const d=c.createDelay(0.1);d.delayTime.value=t;nodes.push(lfo(c,0.3+k*0.17+p,0.003,d.delayTime));i.connect(d).connect(o)});break}
 case'phaser':{const ap=[0,1,2,3,4,5].map(()=>biq(c,'allpass',800,null,0.7));ap.forEach(a=>nodes.push(lfo(c,0.1+p*3,700,a.frequency)));chain(...ap);break}
 case'bitcrush':{const w=c.createWaveShaper();w.curve=crushCurve(Math.round(2+(1-p)*30));chain(w);set=v=>w.curve=crushCurve(Math.round(2+(1-v)*30));break}
 case'lofi':{const w=c.createWaveShaper();w.curve=crushCurve(24);chain(w,biq(c,'lowpass',2500+p*3000),biq(c,'highpass',200));break}
 case'gate':{const g=c.createGain();g.gain.value=0.5;const sh=c.createWaveShaper();sh.curve=new Float32Array([-0.5,-0.5,0.5,0.5]);const os=c.createOscillator();os.type='square';os.frequency.value=2+p*14;os.connect(sh).connect(g.gain);os.start();nodes.push(os);chain(g);break}
 case'distortion':{const w=c.createWaveShaper();w.curve=driveCurve(1+p*30);w.oversample='4x';const g=c.createGain();g.gain.value=0.6;chain(w,g);break}
 case'tremolo':{const g=c.createGain();g.gain.value=0.6;nodes.push(lfo(c,2+p*10,0.4,g.gain));chain(g);break}
 case'autopan':{const pn=c.createStereoPanner();nodes.push(lfo(c,0.2+p*4,0.9,pn.pan));chain(pn);break}
 case'sweep':{const f=biq(c,'lowpass',1500,null,8);nodes.push(lfo(c,0.05+p*1.5,1300,f.frequency));chain(f);break}
 case'telephone':{chain(biq(c,'highpass',500),biq(c,'lowpass',3000),biq(c,'peaking',1500,8,1));break}
 case'robot':{const g=c.createGain();g.gain.value=0;const os=c.createOscillator();os.frequency.value=30+p*200;os.connect(g.gain);os.start();nodes.push(os);chain(g);break}
 default:chain()}
 return{i,o,set,stop(){nodes.forEach(n=>{try{n.stop()}catch(e){}})}}}
class FxSlot{constructor(c){this.c=c;this.i=c.createGain();this.o=c.createGain();this.dry=c.createGain();this.wet=c.createGain();this.wet.gain.value=0;this.i.connect(this.dry).connect(this.o);this.wet.connect(this.o);this.type='none';this.p=0.5;this.amt=0}
 setType(t){if(this.fx){this.i.disconnect(this.fx.i);this.fx.o.disconnect();this.fx.stop()}this.type=t;this.fx=null;if(t&&t!=='none'){this.fx=buildFx(this.c,t,this.p);this.i.connect(this.fx.i);this.fx.o.connect(this.wet)}this.setWet(this.amt)}
 setWet(v){this.amt=v;const on=this.fx?v:0;this.wet.gain.setTargetAtTime(on,this.c.currentTime,0.02);this.dry.gain.setTargetAtTime(this.type==='robot'||this.type==='telephone'||this.type==='gate'||this.type==='tremolo'?1-on:1-on*0.3,this.c.currentTime,0.02)}
 setP(v){this.p=v;if(this.fx)this.fx.set(v)}}
const FXN=['none','echo','reverb','flanger','phaser','bitcrush','gate','distortion','tremolo','autopan','sweep','chorus','lofi','telephone','robot'];

/* ---------- mastering chain (shared by live and offline render) ---------- */
const MDEF={eq5:[0,0,0,0,0],mb:[[-20,2,1],[-18,1.5,0.5],[-20,2,0.5]],glue:{th:-12,ratio:2},width:1.1,ceil:-1,target:-14,out:0};
function buildMaster(c,s){const n={};n.i=c.createGain();n.o=c.createGain();const F=[60,250,1000,4000,12000];
 n.eq=F.map((f,k)=>biq(c,k===0?'lowshelf':k===4?'highshelf':'peaking',f,0,0.9));let a=n.i;n.eq.forEach(e=>{a.connect(e);a=e});
 const sum=c.createGain();const lp=f=>[biq(c,'lowpass',f,null,0.707),biq(c,'lowpass',f,null,0.707)],hp=f=>[biq(c,'highpass',f,null,0.707),biq(c,'highpass',f,null,0.707)];
 const bands=[lp(200),[...hp(200),...lp(3000)],hp(3000)];n.mb=bands.map(fl=>{let x=a;fl.forEach(f=>{x.connect(f);x=f});const cp=c.createDynamicsCompressor();cp.attack.value=0.01;cp.release.value=0.2;const mk=c.createGain();x.connect(cp).connect(mk).connect(sum);return{cp,mk}});
 n.glue=c.createDynamicsCompressor();n.glue.attack.value=0.02;n.glue.release.value=0.25;n.glue.knee.value=6;sum.connect(n.glue);
 const sp=c.createChannelSplitter(2),mg=c.createChannelMerger(2);n.glue.connect(sp);n.ws=[0,1,2,3].map(()=>c.createGain());sp.connect(n.ws[0],0);sp.connect(n.ws[1],1);sp.connect(n.ws[2],1);sp.connect(n.ws[3],0);n.ws[0].connect(mg,0,0);n.ws[1].connect(mg,0,0);n.ws[2].connect(mg,0,1);n.ws[3].connect(mg,0,1);
 n.drive=c.createGain();n.lim=c.createDynamicsCompressor();n.lim.attack.value=0.001;n.lim.release.value=0.08;n.lim.ratio.value=20;n.lim.knee.value=0;n.ceilG=c.createGain();
 n.clip=c.createWaveShaper();n.clip.curve=driveCurve(1.2);
 mg.connect(n.drive).connect(n.lim).connect(n.ceilG).connect(n.clip).connect(n.o);
 n.set=s=>{s=Object.assign({},MDEF,s);n.s=s;s.eq5.forEach((g,k)=>n.eq[k].gain.value=g);s.mb.forEach((b,k)=>{n.mb[k].cp.threshold.value=b[0];n.mb[k].cp.ratio.value=b[1];n.mb[k].mk.gain.value=db(b[2])});
  n.glue.threshold.value=s.glue.th;n.glue.ratio.value=s.glue.ratio;const w=s.width;n.ws[0].gain.value=n.ws[2].gain.value=0.5+0.5*w;n.ws[1].gain.value=n.ws[3].gain.value=0.5-0.5*w;
  n.drive.gain.value=db(s.out||0);n.lim.threshold.value=s.ceil-1;n.ceilG.gain.value=db(s.ceil);};
 n.set(s||MDEF);return n}

/* loudness from a buffer (offline K-weighting, gated integrated) */
async function measureLUFS(buf){const oc=new OfflineAudioContext(2,buf.length,buf.sampleRate);const s=oc.createBufferSource();s.buffer=buf;const a=biq(oc,'highshelf',1500,4),b=biq(oc,'highpass',38,null,0.5);s.connect(a).connect(b).connect(oc.destination);s.start();const r=await oc.startRendering();
 const blk=Math.floor(0.4*buf.sampleRate),hop=Math.floor(blk/4),L=r.getChannelData(0),R=r.getChannelData(1);const ms=[];let pk=0;for(let i=0;i<buf.length;i++){const v=Math.abs(buf.getChannelData(0)[i]);if(v>pk)pk=v}
 for(let st=0;st+blk<=L.length;st+=hop){let e=0;for(let i=st;i<st+blk;i++)e+=L[i]*L[i]+R[i]*R[i];ms.push(e/blk)}
 const lk=m=>-0.691+10*Math.log10(m+1e-12);let g=ms.filter(m=>lk(m)>-70);if(!g.length)return{lufs:-70,peak:20*Math.log10(pk+1e-9)};const rel=lk(g.reduce((a,b)=>a+b)/g.length)-10;g=g.filter(m=>lk(m)>rel);
 return{lufs:lk(g.reduce((a,b)=>a+b,0)/Math.max(1,g.length)),peak:20*Math.log10(pk+1e-9)}}

/* ---------- mixer channel strip ---------- */
class Strip{constructor(name,id){const c=ctx;this.name=name;this.id=id;this.i=c.createGain();this.hpf=biq(c,'highpass',20);this.eq=[biq(c,'lowshelf',200,0),biq(c,'peaking',1200,0,0.8),biq(c,'highshelf',5000,0)];
 this.comp=c.createDynamicsCompressor();this.comp.threshold.value=0;this.comp.ratio.value=1;this.fx=new FxSlot(c);this.pan=c.createStereoPanner();this.fader=c.createGain();this.mute=c.createGain();this.an=c.createAnalyser();this.an.fftSize=1024;
 this.rev=c.createGain();this.rev.gain.value=0;this.dly=c.createGain();this.dly.gain.value=0;
 let a=this.i;[this.hpf,...this.eq,this.comp].forEach(x=>{a.connect(x);a=x});a.connect(this.fx.i);this.fx.o.connect(this.pan).connect(this.fader).connect(this.mute);this.mute.connect(S.bus);this.mute.connect(this.an);this.mute.connect(this.rev).connect(S.revBus);this.mute.connect(this.dly).connect(S.dlyBus);
 this.m=false;this.solo=false;this.vol=0.8;this.fader.gain.value=0.8;this.auto=[];this.amode='off';this._data=new Float32Array(1024)}
 setVol(v){this.vol=v;this.fader.gain.setTargetAtTime(v,ctx.currentTime,0.015);if(this.ui)this.ui.vol.value=v}
 level(){this.an.getFloatTimeDomainData(this._data);let m=0;for(const v of this._data)m=Math.max(m,Math.abs(v));return m}
 apply(s){if(s.eq)s.eq.forEach((g,k)=>this.eq[k].gain.value=g);if(s.hpf)this.hpf.frequency.value=s.hpf;if(s.comp){this.comp.threshold.value=s.comp.th;this.comp.ratio.value=s.comp.ratio;this.comp.attack.value=s.comp.att;this.comp.release.value=s.comp.rel}
  if(s.fx){this.fx.p=s.fx.p;this.fx.setType(s.fx.type);this.fx.setWet(s.fx.type==='none'?0:s.fx.wet)}if(s.rev!=null)this.rev.gain.value=s.rev;if(s.dly!=null)this.dly.gain.value=s.dly;if(s.pan!=null)this.pan.pan.value=s.pan;this.refresh&&this.refresh()}}
function updateSolo(){const any=S.strips.some(s=>s.solo);S.strips.forEach(s=>s.mute.gain.setTargetAtTime(s.m||(any&&!s.solo)?0:1,ctx.currentTime,0.01))}

/* ---------- audio init ---------- */
async function initAudio(){ctx=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});S.ctx=ctx;
 try{await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'})))}catch(e){await ctx.audioWorklet.addModule('data:application/javascript;base64,'+btoa(WORKLET))}
 S.bus=ctx.createGain();S.revBus=ctx.createGain();S.dlyBus=ctx.createGain();
 S.conv=ctx.createConvolver();S.conv.buffer=impulse(ctx,2.2);S.revRet=ctx.createGain();S.revRet.gain.value=0.8;S.revBus.connect(S.conv).connect(S.revRet).connect(S.bus);
 S.dl=ctx.createDelay(2);S.dl.delayTime.value=0.375;S.dlFb=ctx.createGain();S.dlFb.gain.value=0.35;S.dlRet=ctx.createGain();S.dlRet.gain.value=0.7;S.dlyBus.connect(S.dl);S.dl.connect(S.dlFb).connect(S.dl);S.dl.connect(S.dlRet).connect(S.bus);
 S.mset=JSON.parse(JSON.stringify(MDEF));S.master=buildMaster(ctx,S.mset);S.mOn=true;S.bypass=ctx.createGain();S.bypass.gain.value=0;
 S.bus.connect(S.master.i);S.bus.connect(S.bypass);S.mOut=ctx.createGain();S.master.o.connect(S.mOut);S.bypass.connect(S.mOut);
 S.out=ctx.createGain();S.ref=ctx.createGain();S.ref.gain.value=0;S.mOut.connect(S.out);
 S.recNode=new AudioWorkletNode(ctx,'cb-rec',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2]});S.out.connect(S.recNode).connect(ctx.destination);S.ref.connect(ctx.destination);
 S.recChunks=null;S.recNode.port.onmessage=e=>{if(S.recChunks)S.recChunks.push(e.data)};
 S.an=ctx.createAnalyser();S.an.fftSize=2048;S.mOut.connect(S.an);
 S.kA=biq(ctx,'highshelf',1500,4);S.kB=biq(ctx,'highpass',38,null,0.5);S.kAn=ctx.createAnalyser();S.kAn.fftSize=2048;S.mOut.connect(S.kA).connect(S.kB).connect(S.kAn);
 S.stream=ctx.createMediaStreamDestination();S.mOut.connect(S.stream);
 S.strips=[];const mk=(n,id)=>{const s=new Strip(n,id);S.strips.push(s);return s};
 S.chDecks=mk('DJ decks','decks');S.chPads=mk('Sampler','pads');S.chKar=mk('Karaoke backing','kar');S.chMic=mk('Mic','mic');S.chMaster=mk('Master player','mplay');
 S.tracks=[];for(let k=0;k<8;k++)addTrack();
 buildMixerUI();buildDJ();buildKaraoke();buildStudio();buildMastering();buildTools();buildCleaner();requestAnimationFrame(loop)}
function startRec(){S.recChunks=[];S.recNode.port.postMessage('start')}
function stopRec(){S.recNode.port.postMessage('stop');const ch=S.recChunks||[];S.recChunks=null;const n=ch.reduce((a,c)=>a+c[0].length,0),L=new Float32Array(n),R=new Float32Array(n);let p=0;ch.forEach(c=>{L.set(c[0],p);R.set(c[1],p);p+=c[0].length});return encodeWAV([L,R],ctx.sampleRate)}

/* ---------- mixer UI ---------- */
function knob(label,min,max,step,val,fn){const i=el('input',{type:'range',min,max,step,value:val});i.oninput=()=>fn(+i.value);return[el('label',{className:'k'},label,i),i]}
function buildMixerUI(){const box=$('strips');box.innerHTML='';S.strips.forEach(s=>{const d=el('div',{className:'strip'});const m=el('div',{className:'meter'},el('i'));
 const [vl,vol]=knob('Fader',0,1.5,0.01,s.vol,v=>s.setVol(v));const [pl,pan]=knob('Pan',-1,1,0.01,s.pan.pan.value,v=>s.pan.pan.value=v);
 const eqs=['Low','Mid','High'].map((n,k)=>knob(n+' EQ',-15,15,0.5,s.eq[k].gain.value,v=>s.eq[k].gain.value=v));
 const [cl,ci]=knob('Comp',0,1,0.01,0,v=>{s.comp.threshold.value=-v*40;s.comp.ratio.value=1+v*11});
 const [rl,ri]=knob('Reverb send',0,1,0.01,s.rev.gain.value,v=>s.rev.gain.value=v);const [dl,di]=knob('Delay send',0,1,0.01,s.dly.gain.value,v=>s.dly.gain.value=v);
 const mb=el('button',{textContent:'M',on:{click:()=>{s.m=!s.m;mb.classList.toggle('act',s.m);updateSolo()}}}),sb=el('button',{textContent:'S',on:{click:()=>{s.solo=!s.solo;sb.classList.toggle('act',s.solo);updateSolo()}}});
 const am=el('select',{},...['off','write','read'].map(x=>el('option',{value:x,textContent:'Auto '+x})));am.onchange=()=>{s.amode=am.value;if(am.value==='write')s.auto=[]};
 const fxs=el('select',{},...FXN.map(x=>el('option',{value:x,textContent:'FX '+x})));fxs.onchange=()=>{s.fx.setType(fxs.value);s.fx.setWet(fxs.value==='none'?0:0.4)};
 d.append(el('b',{textContent:s.name,title:s.name}),m,vl,pl,...eqs.map(e=>e[0]),cl,rl,dl,fxs,el('div',{className:'row'},mb,sb),am);s.ui={vol,meter:m.firstChild};
 s.refresh=()=>{pan.value=s.pan.pan.value;eqs.forEach((e,k)=>e[1].value=s.eq[k].gain.value);ri.value=s.rev.gain.value;di.value=s.dly.gain.value;fxs.value=s.fx.type};box.append(d)});
 $('revSize').oninput=e=>S.conv.buffer=impulse(ctx,+e.target.value);$('revRet').oninput=e=>S.revRet.gain.value=+e.target.value;$('dlyTime').oninput=e=>S.dl.delayTime.value=+e.target.value;$('dlyFb').oninput=e=>S.dlFb.gain.value=+e.target.value;$('dlyRet').oninput=e=>S.dlRet.gain.value=+e.target.value}

/* ---------- DJ ---------- */
class Deck{constructor(k){const c=ctx;this.k=k;this.name='ABCD'[k];this.buf=null;this.src=null;this.rate=1;this.tempo=0;this.range=0.08;this.pos=0;this.t0=0;this.playing=false;this.cue=0;this.hot=[null,null,null,null];this.loop=null;this.bpm=0;
 this.i=c.createGain();this.eq=[biq(c,'lowshelf',250,0),biq(c,'peaking',1000,0,0.9),biq(c,'highshelf',4000,0)];this.filt=biq(c,'allpass',1000,null,1.2);this.fx=new FxSlot(c);this.vol=c.createGain();this.vol.gain.value=0.9;this.xf=c.createGain();this.an=c.createAnalyser();
 let a=this.i;[...this.eq,this.filt].forEach(x=>{a.connect(x);a=x});a.connect(this.fx.i);this.fx.o.connect(this.vol).connect(this.xf).connect(S.chDecks.i);this.vol.connect(this.an)}
 time(){if(!this.playing)return this.pos;let t=this.pos+(ctx.currentTime-this.t0)*this.rate;if(this.loop&&t>this.loop[1]){const L=this.loop[1]-this.loop[0];t=this.loop[0]+((t-this.loop[0])%L)}return this.buf?Math.min(t,this.buf.duration):t}
 startSrc(dur){const s=ctx.createBufferSource();s.buffer=this.buf;s.playbackRate.value=this.rate;if(this.loop){s.loop=true;s.loopStart=this.loop[0];s.loopEnd=this.loop[1]}s.connect(this.i);s.start(0,clamp(this.pos,0,this.buf.duration-0.001),dur);return s}
 play(){if(!this.buf||this.playing)return;if(ctx.state!=='running')ctx.resume();this.src=this.startSrc();this.t0=ctx.currentTime;this.playing=true;const me=this.src;me.onended=()=>{if(this.src===me&&this.playing){this.pos=this.time();this.playing=false;this.src=null;this.ui&&this.ui.sync()}}}
 pause(){if(!this.playing)return;this.pos=this.time();this.playing=false;const s=this.src;this.src=null;try{s.stop()}catch(e){}}
 seek(t){const p=this.playing;this.pause();this.pos=clamp(t,0,this.buf?this.buf.duration:0);if(p)this.play()}
 setRate(r){if(this.playing){this.pos=this.time();this.t0=ctx.currentTime}this.rate=r;if(this.src)this.src.playbackRate.setValueAtTime(r,ctx.currentTime)}
 setTempo(v){this.tempo=v;this.setRate(1+v*this.range)}
 curBpm(){return this.bpm*this.rate}
 setLoop(beats){if(!this.buf)return;if(beats===0){this.loop=null}else{const len=this.bpm?beats*60/this.bpm:beats*0.5,s=this.time();this.loop=[s,Math.min(s+len,this.buf.duration)]}const p=this.playing;this.pause();if(p)this.play()}
 setFilter(v){const f=this.filt;if(Math.abs(v)<0.03){f.type='allpass';return}if(v<0){f.type='lowpass';f.frequency.value=20000*Math.pow(0.01,-v)}else{f.type='highpass';f.frequency.value=20*Math.pow(400,v)}}
 load(buf,name){this.pause();this.buf=buf;this.pos=0;this.cue=0;this.hot=[null,null,null,null];this.loop=null;this.title=name;this.bpm=detectBPM(buf);this.ui&&this.ui.sync()}
 scratch(delta){if(!this.buf)return;this.pos=clamp(this.pos+delta,0,this.buf.duration);if(Math.abs(delta)>0.0005){const s=ctx.createBufferSource();s.buffer=this.buf;s.playbackRate.value=clamp(Math.abs(delta)/0.03,0.25,3);const g=ctx.createGain();g.gain.setValueAtTime(0.9,ctx.currentTime);g.gain.linearRampToValueAtTime(0,ctx.currentTime+0.05);s.connect(g).connect(this.i);s.start(0,this.pos,0.05)}}}
function detectBPM(buf){const sr=buf.sampleRate,hop=512,d=buf.getChannelData(0),n=Math.min(d.length,sr*60),fr=Math.floor(n/hop);if(fr<40)return 0;const env=new Float32Array(fr);let prev=0;
 for(let f=0;f<fr;f++){let e=0;for(let i=f*hop;i<f*hop+hop;i++)e+=d[i]*d[i];const le=Math.log(1e-6+e);env[f]=Math.max(0,le-prev);prev=le}
 const fps=sr/hop;let best=0,bb=120;const at=(x)=>{const i=Math.floor(x),fr2=x-i;return i+1<fr?env[i]*(1-fr2)+env[i+1]*fr2:0};
 for(let bpm=70;bpm<=180;bpm+=0.05){const lag=60*fps/bpm;let s=0;for(let t=0;t+lag*4<fr;t+=1)s+=env[t]*(at(t+lag)+0.5*at(t+lag*2)+0.25*at(t+lag*4));s/=Math.max(1,fr-lag*4);const w=1-Math.abs(Math.log2(bpm/120))*0.15;if(s*w>best){best=s*w;bb=bpm}}
 return Math.round(bb*10)/10}
function xfGains(x,curve){if(curve==='linear')return[1-x,x];if(curve==='cut'){return[x>0.92?0:1,x<0.08?0:1]}return[Math.cos(x*Math.PI/2),Math.sin(x*Math.PI/2)]}
function applyXF(){const x=+$('xf').value,[l,r]=xfGains(x,$('xcurve').value);S.decks.forEach((d,k)=>d.xf.gain.setTargetAtTime(k%2===0?l:r,ctx.currentTime,0.01))}
function buildDJ(){S.decks=[0,1,2,3].map(k=>new Deck(k));const box=$('decks');
 S.decks.forEach((d,k)=>{const c=el('div',{className:'card'});if(k>1)c.style.display='none';d.card=c;
  const file=el('input',{type:'file',title:'Any audio or video file'});const dl=(b,n)=>d.load(b,n);pick(file,dl);c.dataset.drop='deck'+k;dropZone('deck'+k,dl);
  const demo=el('button',{textContent:'Demo track',on:{click:()=>d.load(demoSong([124,128,120,126][k],16,k%2===0),'Demo '+[124,128,120,126][k]+' BPM')}});
  const title=el('div',{textContent:'Empty deck'}),wave=el('canvas',{height:70}),info=el('span');
  wave.onclick=e=>{if(!d.buf)return;const r=wave.getBoundingClientRect();d.seek((e.clientX-r.left)/r.width*d.buf.duration)};
  const play=el('button',{textContent:'Play',on:{click:()=>{d.playing?d.pause():d.play();d.ui.sync()}}});
  const cue=el('button',{textContent:'Cue',on:{click:()=>{if(d.playing){d.pause();d.seek(d.cue)}else{d.cue=d.time()}d.ui.sync()}}});
  const sync=el('button',{textContent:'Sync',on:{click:()=>syncDeck(d)}});
  const hots=d.hot.map((_,h)=>el('button',{textContent:'Hot '+(h+1),on:{click:e=>{if(e.shiftKey||d.hot[h]==null){d.hot[h]=d.time();hots[h].classList.add('act')}else d.seek(d.hot[h])},contextmenu:e=>{e.preventDefault();d.hot[h]=null;hots[h].classList.remove('act')}}}));
  const loops=[0.5,1,2,4,8,16].map(b=>el('button',{textContent:'Loop '+b,on:{click:()=>d.setLoop(b)}}));const exit=el('button',{textContent:'Exit loop',on:{click:()=>d.setLoop(0)}});
  const [tl,ti]=knob('Tempo',-1,1,0.001,0,v=>{d.setTempo(v);d.ui.sync()});const rng=el('select',{},...[8,16,50].map(x=>el('option',{value:x,textContent:'±'+x+'%'})));rng.onchange=()=>{d.range=+rng.value/100;d.setTempo(d.tempo);d.ui.sync()};
  const nudge=(v)=>{d.setRate(d.rate*(1+v));setTimeout(()=>d.setTempo(d.tempo),300)};
  const eqs=['Low','Mid','High'].map((n,j)=>knob(n,-26,8,0.5,0,v=>d.eq[j].gain.value=v)[0]);const [fl]=knob('Filter',-1,1,0.01,0,v=>d.setFilter(v));const [vl]=knob('Volume',0,1.2,0.01,0.9,v=>d.vol.gain.value=v);
  const fxs=el('select',{},...FXN.map(x=>el('option',{value:x,textContent:x})));fxs.onchange=()=>{d.fx.setType(fxs.value);d.fx.setWet(+fw.value)};const [fwl,fw]=knob('FX amount',0,1,0.01,0,v=>d.fx.setWet(v));const [fpl,fp]=knob('FX rate',0,1,0.01,0.5,v=>d.fx.setP(v));
  const jog=el('canvas',{width:110,height:110,style:'width:110px;height:110px;border-radius:50%;touch-action:none;cursor:grab'});let lastA=null,wasPlaying=false;
  const ang=e=>{const r=jog.getBoundingClientRect();return Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)};
  jog.onpointerdown=e=>{jog.setPointerCapture(e.pointerId);lastA=ang(e);wasPlaying=d.playing;d.pause()};jog.onpointermove=e=>{if(lastA==null)return;const a=ang(e);let da=a-lastA;if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;lastA=a;d.scratch(da*0.25)};
  jog.onpointerup=()=>{lastA=null;if(wasPlaying)d.play();d.ui.sync()};
  c.append(el('h3',{textContent:'Deck '+d.name}),el('div',{className:'row'},file,demo),title,wave,el('div',{className:'row'},play,cue,sync,el('button',{textContent:'<<',title:'Nudge slower',on:{click:()=>nudge(-0.04)}}),el('button',{textContent:'>>',title:'Nudge faster',on:{click:()=>nudge(0.04)}}),info),
   el('div',{className:'row'},jog,el('div',{style:'flex:1'},tl,rng)),el('div',{className:'row'},...hots),el('div',{className:'row'},...loops,exit),el('div',{className:'row'},...eqs,fl,vl),el('div',{className:'row'},fxs,fwl,fpl));
  d.ui={sync(){title.textContent=d.title||'Empty deck';play.textContent=d.playing?'Pause':'Play';play.classList.toggle('act',d.playing);info.textContent=(d.bpm?(d.curBpm().toFixed(1)+' BPM'):'')+' · '+((d.rate-1)*100).toFixed(1)+'%';ti.value=d.tempo},wave,jog,time:el('span')};
  box.append(c)});
 $('deck4').onclick=()=>{const on=S.decks[2].card.style.display==='none';S.decks.slice(2).forEach(d=>d.card.style.display=on?'':'none');$('deck4').textContent=on?'Show 2 decks':'Show 4 decks'};
 $('xf').oninput=applyXF;$('xcurve').onchange=applyXF;applyXF();
 const pads=[['Kick',kick,0.4],['Snare',snare,0.3],['Hat',hat,0.1],['Clap',t=>t<0.2?(Math.random()*2-1)*Math.exp(-t*25)*(t%0.012<0.006?1:0.5):0,0.2],
  ['Air horn',t=>(((t*466)%1)*2-1+((t*554)%1)*2-1)*0.25*Math.min(1,t*30)*(t<0.9?1:Math.max(0,1-(t-0.9)*10)),1],['Siren',t=>Math.sin(2*Math.PI*(600*t+150*Math.sin(2*Math.PI*1.5*t)/(2*Math.PI*1.5)))*0.4,1.6],['Laser',t=>Math.sin(2*Math.PI*(1800*t-1500*t*t))*0.4*Math.exp(-t*4),0.5],['Riser',t=>((Math.random()*2-1)*0.3*t/3+Math.sin(2*Math.PI*(200*t+150*t*t))*0.2*t/3),3],
  ['Bass drop',t=>Math.sin(2*Math.PI*(120*t-40*t*t))*0.7*Math.exp(-t*0.8),1.5],['Scratch',t=>(Math.random()*2-1)*0.4*Math.abs(Math.sin(2*Math.PI*6*t)),0.6],['Rewind',t=>Math.sin(2*Math.PI*(900*Math.exp(-t*2))*t)*0.4*Math.exp(-t),1.2],['Gunshot',t=>(Math.random()*2-1)*Math.exp(-t*12)*0.8,0.5],
  ['Hey',t=>Math.sin(2*Math.PI*220*t+3*Math.sin(2*Math.PI*660*t))*0.4*Math.exp(-t*6),0.35],['Cowbell',t=>(Math.sign(Math.sin(2*Math.PI*540*t))+Math.sign(Math.sin(2*Math.PI*800*t)))*0.15*Math.exp(-t*10),0.4],['Rim',t=>Math.sin(2*Math.PI*1700*t)*Math.exp(-t*60)*0.6,0.1],['Thunder',t=>(Math.random()*2-1)*0.5*Math.exp(-t*0.9)*Math.min(1,t*4),3]];
 S.pads=pads.map(p=>({name:p[0],buf:makeBuf(p[2],p[1])}));const keys='12345678qwerasdf';const pb=$('pads'),ps=$('padSel');
 S.pads.forEach((p,k)=>{const b=el('button',{textContent:p.name+' ('+keys[k].toUpperCase()+')',on:{pointerdown:()=>playPad(k)}});p.btn=b;pb.append(b);ps.append(el('option',{value:k,textContent:'Pad '+(k+1)}))});
 const padIn=(b,n)=>{const k=+ps.value;S.pads[k].buf=b;S.pads[k].name=n.slice(0,12);S.pads[k].btn.textContent=S.pads[k].name;toast('Pad loaded')};pick($('padFile'),padIn);dropZone('pads',padIn);
 $('recMix').onclick=()=>{const b=$('recMix');if(!S.mixRec){startRec();S.mixRec=1;b.textContent='Stop recording';b.classList.add('rec')}else{S.mixRec=0;b.textContent='Record mix';b.classList.remove('rec');const w=stopRec();const a=download(w,'coffeebreak-mix-'+Date.now()+'.wav');a.click();toast('Mix saved as WAV')}}}
function playPad(k){const s=ctx.createBufferSource();s.buffer=S.pads[k].buf;s.connect(S.chPads.i);s.start();S.pads[k].btn.classList.add('act');setTimeout(()=>S.pads[k].btn.classList.remove('act'),150)}
function syncDeck(d){const m=S.decks.find(x=>x!==d&&x.playing&&x.bpm)||S.decks.find(x=>x!==d&&x.bpm);if(!m||!d.bpm){toast('Load two tracks with a BPM to sync');return}
 const r=m.curBpm()/d.bpm;d.range=Math.max(d.range,Math.abs(r-1)+0.01);d.setTempo((r-1)/d.range);
 if(m.playing&&d.playing){const ph=(m.time()%(60/m.bpm))/(60/m.bpm),pd=(d.time()%(60/d.bpm))/(60/d.bpm);d.seek(d.time()+(ph-pd)*60/d.bpm)}d.ui.sync();toast('Deck '+d.name+' synced to '+m.curBpm().toFixed(1)+' BPM')}

/* ---------- Karaoke ---------- */
function buildKaraoke(){const K=S.kar={buf:null,src:null,pos:0,t0:0,playing:false,lines:[],tapIdx:0,score:0,frames:0,good:0};const c=ctx;
 K.i=c.createGain();const sp=c.createChannelSplitter(2),mg=c.createChannelMerger(2);K.orig=c.createGain();K.red=c.createGain();K.red.gain.value=0;
 K.i.connect(K.orig);K.i.connect(sp);const l=c.createGain(),r=c.createGain();r.gain.value=-1;sp.connect(l,0);sp.connect(r,1);const side=c.createGain();l.connect(side);r.connect(side);
 const hp=biq(c,'highpass',180);side.connect(hp);hp.connect(mg,0,0);hp.connect(mg,0,1);const bass=biq(c,'lowpass',160);K.i.connect(bass);bass.connect(K.red);mg.connect(K.red);
 K.shift=new AudioWorkletNode(c,'cb-pitch',{outputChannelCount:[2]});K.vol=c.createGain();K.orig.connect(K.shift);K.red.connect(K.shift);K.shift.connect(K.vol).connect(S.chKar.i);
 $('karVr').onchange=e=>{const v=+e.target.value;K.orig.gain.setTargetAtTime(1-v,c.currentTime,0.02);K.red.gain.setTargetAtTime(v,c.currentTime,0.02)};
 $('karKey').oninput=e=>{K.shift.parameters.get('shift').value=+e.target.value;$('karKeyV').textContent=(e.target.value>0?'+':'')+e.target.value};
 $('karVol').oninput=e=>K.vol.gain.value=+e.target.value;
 const karIn=(b,n)=>{karStop();K.buf=b;K.pos=0;toast('Backing loaded: '+n)};pick($('karFile'),karIn);dropZone('kar',karIn);pick($('lyrFile'),karIn);dropZone('lyr',karIn);
 $('karDemo').onclick=()=>{karStop();K.buf=demoSong(100,16,true);if(!K.lines.length){$('lyrText').value='[00:00.50] Coffee in the morning light\n[00:05.30] Singing with my friends tonight\n[00:10.10] Every note a little brighter\n[00:14.90] Turn it up and hold on tighter\n[00:19.70] This is the Coffeebreak song';parseLyrics()}toast('Demo backing loaded')};
 $('karPlay').onclick=()=>{if(!K.buf){toast('Load a backing track first');return}if(K.playing)return;if(c.state!=='running')c.resume();K.src=c.createBufferSource();K.src.buffer=K.buf;K.src.connect(K.i);K.src.start(0,K.pos);K.t0=c.currentTime;K.playing=true;K.src.onended=()=>{if(K.playing&&karTime()>=K.buf.duration-0.05){karStop();K.pos=0}}};
 $('karStop').onclick=()=>{karStop();K.pos=0};
 $('karWave').onclick=e=>{if(!K.buf)return;const r=e.target.getBoundingClientRect(),t=(e.clientX-r.left)/r.width*K.buf.duration,p=K.playing;karStop();K.pos=t;if(p)$('karPlay').click()};
 // mic
 const ks=$('atKey');NOTE.forEach((n,k)=>ks.append(el('option',{value:k,textContent:n})));
 K.tune=new AudioWorkletNode(c,'cb-pitch',{outputChannelCount:[2]});K.tune.parameters.get('detect').value=1;K.micG=c.createGain();K.micEcho=c.createDelay(1);K.micEcho.delayTime.value=0.32;const efb=c.createGain();efb.gain.value=0.35;K.echoG=c.createGain();K.echoG.gain.value=0.15;
 K.revG=c.createGain();K.revG.gain.value=0.3;const cv=c.createConvolver();cv.buffer=impulse(c,2.5);K.micIn=c.createGain();
 K.micIn.connect(K.tune).connect(K.micG).connect(S.chMic.i);K.micG.connect(K.echoG).connect(K.micEcho).connect(efb).connect(K.micEcho);K.micEcho.connect(S.chMic.i);K.micG.connect(K.revG).connect(cv).connect(S.chMic.i);
 $('micVol').oninput=e=>K.micG.gain.value=+e.target.value;$('micRev').oninput=e=>K.revG.gain.value=+e.target.value;$('micEcho').oninput=e=>K.echoG.gain.value=+e.target.value;
 $('atStr').oninput=e=>K.tune.parameters.get('correct').value=+e.target.value;ks.onchange=()=>K.tune.parameters.get('key').value=+ks.value;$('atScale').onchange=e=>K.tune.parameters.get('scale').value=['chrom','major','minor'].indexOf(e.target.value);
 K.tune.port.onmessage=e=>{const d=e.data;if(!d.f){$('micNote').textContent='--';return}const cents=Math.round((d.midi-Math.round(d.midi))*100);$('micNote').textContent=NOTE[((Math.round(d.midi)%12)+12)%12]+(Math.floor(Math.round(d.midi)/12)-1)+' '+(cents>=0?'+':'')+cents+'c';
  if(K.playing||K.scoreAlways){K.frames++;const dev=Math.abs(d.midi-d.target);if(dev<0.3){K.good++;K.score+=10}else if(dev<0.6)K.score+=4;else K.score+=1;const acc=Math.round(K.good/K.frames*100);$('score').textContent=K.score;$('acc').textContent=acc+'%';$('grade').textContent=acc>85?'Superstar':acc>70?'Great singing':acc>50?'Nice work':'Keep going'}};
 $('micOn').onclick=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});S.micStream=st;if(K.micSrc)K.micSrc.disconnect();K.micSrc=c.createMediaStreamSource(st);K.micSrc.connect(K.micIn);$('micSt').textContent='On';S.micReady=true;toast('Mic on. Use headphones to stop feedback.')}catch(err){$('micSt').textContent='Mic blocked: '+err.name}};
 $('scoreReset').onclick=()=>{K.score=K.frames=K.good=0;$('score').textContent='0';$('acc').textContent='0%';$('grade').textContent='Sing to score'};
 $('karRec').onclick=()=>{const b=$('karRec');if(!K.rec){startRec();K.rec=1;b.textContent='Stop recording';b.classList.add('rec')}else{K.rec=0;b.textContent='Record performance';b.classList.remove('rec');download(stopRec(),'coffeebreak-karaoke-'+Date.now()+'.wav',$('karRecOut'))}};
 $('lyrLoad').onclick=parseLyrics;$('lyrTap').onclick=tapLyric;
 $('lyrClean').onclick=()=>{const res=LyricCleaner.scan($('lyrText').value.replace(/^\[[\d:.]+\]\s*/gm,''),CB_WORDS,true);renderClean(res,$('lyrCleanOut'))}}
function karTime(){const K=S.kar;return K.playing?K.pos+ctx.currentTime-K.t0:K.pos}
function karStop(){const K=S.kar;if(K.playing){K.pos=karTime();K.playing=false;try{K.src.stop()}catch(e){}}}
function parseLyrics(){const K=S.kar,L=[];$('lyrText').value.split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);if(m)L.push({t:+m[1]*60+ +m[2],x:m[3]});else if(l.trim())L.push({t:null,x:l.trim()})});K.lines=L;K.tapIdx=L.findIndex(x=>x.t==null);
 $('lyrInfo').textContent=L.length+' lines, '+L.filter(x=>x.t!=null).length+' timed'+(K.tapIdx>=0?'. Press Tap as each line starts.':'')}
function tapLyric(){const K=S.kar;if(K.tapIdx<0||K.tapIdx>=K.lines.length){toast('All lines are timed');return}K.lines[K.tapIdx].t=karTime();K.tapIdx=K.lines.findIndex(x=>x.t==null);
 $('lyrText').value=K.lines.map(l=>l.t==null?l.x:'['+String(Math.floor(l.t/60)).padStart(2,'0')+':'+(l.t%60).toFixed(2).padStart(5,'0')+'] '+l.x).join('\n');$('lyrInfo').textContent='Timed '+K.lines.filter(x=>x.t!=null).length+' of '+K.lines.length}
function karFrame(){const K=S.kar;if(!K)return;const t=karTime();$('karTime').textContent=fmt(t)+(K.buf?' / '+fmt(K.buf.duration):'');drawWave($('karWave'),K.buf,t);
 const tl=K.lines.filter(l=>l.t!=null);let i=-1;tl.forEach((l,k)=>{if(l.t<=t)i=k});const now=i>=0?tl[i].x:(tl[0]?'Get ready':'');const nx=tl[i+1]?tl[i+1].x:'';if($('lyrNow').textContent!==now)$('lyrNow').textContent=now;if($('lyrNext').textContent!==nx)$('lyrNext').textContent=nx}

/* ---------- Recording studio ---------- */
function addTrack(){const n=S.tracks.length+1,s=new Strip('Track '+n,'t'+n);S.strips.push(s);const t={name:'Track '+n,strip:s,takes:[[]],active:0,armed:false};S.tracks.push(t);if(S.trBox){buildMixerUI();renderTracks()}return t}
const clipsOf=t=>t.takes[t.active];
function buildStudio(){S.st={playing:false,pos:0,startAt:0,pos0:0,srcs:[],met:false,count:false,punch:false,zoom:60,nextClick:0};S.trBox=$('tracks');S.sel=null;S.clip=null;
 S.micRec=new AudioWorkletNode(ctx,'cb-rec',{outputChannelCount:[2]});const z=ctx.createGain();z.gain.value=0;S.kar.micIn.connect(S.micRec).connect(z).connect(ctx.destination);S.micChunks=null;S.micRec.port.onmessage=e=>{if(S.micChunks)S.micChunks.push(e.data)};
 $('sPlay').onclick=()=>stPlay(false);$('sStop').onclick=stStop;$('sRec').onclick=()=>S.st.rec?stStop():stRecord();
 $('sMet').onclick=e=>{S.st.met=!S.st.met;e.target.textContent='Metronome '+(S.st.met?'on':'off');e.target.classList.toggle('act',S.st.met)};
 $('sCount').onclick=e=>{S.st.count=!S.st.count;e.target.textContent='Count-in '+(S.st.count?'on':'off');e.target.classList.toggle('act',S.st.count)};
 $('sPunch').onclick=e=>{S.st.punch=!S.st.punch;e.target.textContent='Punch '+(S.st.punch?'on':'off');e.target.classList.toggle('act',S.st.punch);renderTracks()};
 pick($('sImport'),(b,n)=>putClip(b,n));dropZone('studio',(b,n)=>putClip(b,n));
 $('sTone').onclick=()=>putClip(testTone([220,330,440,550,660][S.tracks.indexOf(selTrack())%5],4),'Test tone');
 $('sAddTr').onclick=()=>addTrack();$('sZoom').onclick=()=>{S.st.zoom=S.st.zoom>=120?20:S.st.zoom*2;renderTracks()};
 const need=f=>()=>{if(!S.sel){toast('Select a clip first');return}f(S.sel.c,S.sel.t);renderTracks()};
 $('sSplit').onclick=need((c,t)=>{const p=S.st.pos;if(p<=c.start||p>=c.start+c.dur){toast('Move the playhead over the clip');return}const b=Object.assign({},c,{start:p,off:c.off+(p-c.start),dur:c.start+c.dur-p,fi:0});c.dur=p-c.start;c.fo=0;clipsOf(t).push(b)});
 $('sCopy').onclick=need(c=>{S.clip=Object.assign({},c);toast('Copied')});
 $('sPaste').onclick=()=>{if(!S.clip){toast('Copy a clip first');return}clipsOf(selTrack()).push(Object.assign({},S.clip,{start:S.st.pos}));renderTracks()};
 $('sDel').onclick=need((c,t)=>{const a=clipsOf(t);a.splice(a.indexOf(c),1);S.sel=null});
 $('sTrimS').onclick=need(c=>{const p=S.st.pos;if(p>c.start&&p<c.start+c.dur){c.off+=p-c.start;c.dur-=p-c.start;c.start=p}});
 $('sTrimE').onclick=need(c=>{const p=S.st.pos;if(p>c.start&&p<c.start+c.dur)c.dur=p-c.start});
 $('sFadeI').onclick=need(c=>{c.fi=c.fi?0:Math.min(0.5,c.dur/2)});$('sFadeO').onclick=need(c=>{c.fo=c.fo?0:Math.min(0.5,c.dur/2)});
 $('exWav').onclick=async()=>{$('exOut').textContent='Rendering...';const b=await renderStudio($('exMaster').checked);if(!b){$('exOut').textContent='Nothing to export yet';return}const m=await measureLUFS(b);download(bufToWav(b),'coffeebreak-song.wav',$('exOut'));$('exOut').prepend('Loudness '+m.lufs.toFixed(1)+' LUFS (approx), peak '+m.peak.toFixed(1)+' dBFS. ')};
 $('exComp').onclick=exportCompressed;renderTracks()}
function selTrack(){return S.sel?S.sel.t:(S.tracks.find(t=>t.armed)||S.tracks[0])}
function putClip(b,name){const t=selTrack();const c={buf:b,start:S.st.pos,off:0,dur:b.duration,fi:0,fo:0,name};clipsOf(t).push(c);S.sel={t,c};renderTracks();toast('Added to '+t.name);return c}
function stTime(){const s=S.st;return s.playing?s.pos0+(ctx.currentTime-s.startAt):s.pos}
function stPlay(rec){const s=S.st;if(s.playing)return;if(ctx.state!=='running')ctx.resume();const ci=s.count?4*60/(+$('sBpm').value):0;s.startAt=ctx.currentTime+0.06+ci;s.pos0=s.pos;s.playing=true;s.srcs=[];
 const bt=60/(+$('sBpm').value);s.nextClick=s.count?ctx.currentTime+0.06:s.startAt+((Math.ceil(s.pos0/bt-1e-6)*bt)-s.pos0);s.clickN=s.count?0:Math.ceil(s.pos0/bt-1e-6);s.countUntil=s.startAt;
 S.tracks.forEach(t=>clipsOf(t).forEach(c=>{const end=c.start+c.dur;if(end<=s.pos0)return;const skip=Math.max(0,s.pos0-c.start),when=s.startAt+Math.max(0,c.start-s.pos0);
  const src=ctx.createBufferSource();src.buffer=c.buf;const g=ctx.createGain();envelope(g.gain,c,when,skip);src.connect(g).connect(t.strip.i);src.start(when,c.off+skip,c.dur-skip);s.srcs.push(src)}));$('sPlay').classList.add('act')}
function envelope(p,c,when,skip){const g=c.gain||1;p.setValueAtTime(g,0);if(c.fi&&skip<c.fi){p.setValueAtTime(g*skip/c.fi,when);p.linearRampToValueAtTime(g,when+c.fi-skip)}if(c.fo){const fs=when+c.dur-skip-c.fo;if(fs>when){p.setValueAtTime(g,fs);p.linearRampToValueAtTime(0,fs+c.fo)}}}
function stStop(){const s=S.st;if(s.rec)finishRec();if(s.playing){s.pos=Math.max(0,stTime());s.playing=false;s.srcs.forEach(x=>{try{x.stop()}catch(e){}});s.srcs=[]}else s.pos=0;$('sPlay').classList.remove('act');renderTracks()}
function stRecord(){const t=S.tracks.find(x=>x.armed);if(!t){toast('Arm a track with its R button first');return}if(!S.micReady){toast('Turn on the mic in the Karaoke tab first');$('micOn').click();return}
 S.st.rec={t,capStart:ctx.currentTime};S.micChunks=[];S.micRec.port.postMessage('start');stPlay(true);S.st.rec.startAt=S.st.startAt;S.st.rec.pos0=S.st.pos0;$('sRec').classList.add('rec');$('sRec').textContent='Stop recording'}
function finishRec(){const r=S.st.rec;S.st.rec=null;S.micRec.port.postMessage('stop');const ch=S.micChunks||[];S.micChunks=null;$('sRec').classList.remove('rec');$('sRec').textContent='Record';
 const n=ch.reduce((a,c)=>a+c[0].length,0),sr=ctx.sampleRate;let L=new Float32Array(n),R=new Float32Array(n);let p=0;ch.forEach(c=>{L.set(c[0],p);R.set(c[1],p);p+=c[0].length});
 let drop=Math.round((r.startAt-r.capStart)*sr),start=r.pos0;if(drop>0){L=L.slice(drop);R=R.slice(drop)}let end=start+L.length/sr;
 if(S.st.punch){const pi=+$('pIn').value,po=+$('pOut').value;const a=Math.max(start,pi),b=Math.min(end,po);if(b<=a){toast('Nothing recorded inside the punch range');return}L=L.slice(Math.round((a-start)*sr),Math.round((b-start)*sr));R=R.slice(Math.round((a-start)*sr),Math.round((b-start)*sr));start=a;end=b}
 if(L.length<64){toast('Recording too short');return}const b=ctx.createBuffer(2,L.length,sr);b.copyToChannel(L,0);b.copyToChannel(R,1);
 const t=r.t,old=clipsOf(t),take=[];old.forEach(c=>{const ce=c.start+c.dur;if(ce<=start||c.start>=end){take.push(Object.assign({},c));return}if(c.start<start)take.push(Object.assign({},c,{dur:start-c.start,fo:0}));if(ce>end)take.push(Object.assign({},c,{start:end,off:c.off+(end-c.start),dur:ce-end,fi:0}))});
 const clip={buf:b,start,off:0,dur:b.duration,fi:0,fo:0,name:'Take '+(t.takes.length+1)};take.push(clip);t.takes.push(take);t.active=t.takes.length-1;S.sel={t,c:clip};toast('Recorded take '+t.takes.length+' on '+t.name);renderTracks()}
function renderTracks(){const box=S.trBox;if(!box)return;box.innerHTML='';const z=S.st.zoom;
 S.tracks.forEach(t=>{const row=el('div',{className:'tr'});const arm=el('button',{textContent:'R',title:'Arm for recording',on:{click:()=>{S.tracks.forEach(x=>x.armed=x===t?!x.armed:false);renderTracks()}}});if(t.armed)arm.classList.add('rec');
  const tk=el('select',{title:'Takes'},...t.takes.map((_,k)=>el('option',{value:k,textContent:'Take '+(k+1)})));tk.value=t.active;tk.onchange=()=>{t.active=+tk.value;S.sel=null;renderTracks()};
  const cv=el('canvas',{height:46,style:'flex:1;min-width:0;touch-action:none'});row.append(el('div',{className:'nm'},el('b',{textContent:t.name}),arm,tk),cv);box.append(row);t.cv=cv;
  let drag=null;cv.onpointerdown=e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*cv.width/devicePixelRatio,tt=x/z+S.st.view0;const c=clipsOf(t).slice().reverse().find(c=>tt>=c.start&&tt<=c.start+c.dur);
   if(c){S.sel={t,c};drag={c,dx:tt-c.start};cv.setPointerCapture(e.pointerId)}else{if(!S.st.playing)S.st.pos=Math.max(0,tt);S.sel=null}drawTracks()};
  cv.onpointermove=e=>{if(!drag)return;const r=cv.getBoundingClientRect(),tt=(e.clientX-r.left)/r.width*cv.width/devicePixelRatio/z+S.st.view0;drag.c.start=Math.max(0,Math.round((tt-drag.dx)*100)/100);drawTracks()};cv.onpointerup=()=>drag=null});
 drawTracks()}
function drawTracks(){const z=S.st.zoom,pos=stTime();const vis=Math.max(1,(S.trBox.clientWidth-160)/z);S.st.view0=Math.max(0,(S.st.playing?pos:S.st.pos)-vis*0.8);const v0=S.st.view0;
 S.tracks.forEach(t=>{const cv=t.cv;if(!cv)return;const w=cv.width=Math.max(100,cv.clientWidth)*devicePixelRatio,h=cv.height=46*devicePixelRatio,g=cv.getContext('2d'),X=s=>(s-v0)*z*devicePixelRatio;
  g.fillStyle='#0b0705';g.fillRect(0,0,w,h);if(S.st.punch){g.fillStyle='rgba(232,91,75,.18)';g.fillRect(X(+$('pIn').value),0,(+$('pOut').value-+$('pIn').value)*z*devicePixelRatio,h)}
  const bt=60/(+$('sBpm').value||120);g.fillStyle='#2b1d16';for(let b=Math.floor(v0/bt);X(b*bt)<w;b++)g.fillRect(X(b*bt),0,b%4?1:2,h);
  clipsOf(t).forEach(c=>{const x=X(c.start),cw=c.dur*z*devicePixelRatio;const sel=S.sel&&S.sel.c===c;g.fillStyle=sel?'#6b4a2a':'#3a281e';g.fillRect(x,2,cw,h-4);g.strokeStyle=sel?'#4bc3e8':'#e8a54b';g.strokeRect(x,2,cw,h-4);
   const d=c.buf.getChannelData(0),sr=c.buf.sampleRate;g.fillStyle='#e8a54b';const step=Math.max(1,Math.floor(cw/400));for(let px=0;px<cw;px+=step){const s0=Math.floor((c.off+px/cw*c.dur)*sr);let m=0;for(let i=s0;i<s0+sr/z/devicePixelRatio*step&&i<d.length;i+=16)m=Math.max(m,Math.abs(d[i]));g.fillRect(x+px,h/2-m*h/2.3,step,m*h/1.15)}
   if(c.fi){g.strokeStyle='#fff';g.beginPath();g.moveTo(x,h-2);g.lineTo(x+c.fi*z*devicePixelRatio,2);g.stroke()}if(c.fo){g.strokeStyle='#fff';g.beginPath();g.moveTo(x+cw-c.fo*z*devicePixelRatio,2);g.lineTo(x+cw,h-2);g.stroke()}
   g.fillStyle='#fff';g.font=(10*devicePixelRatio)+'px sans-serif';g.fillText(c.name||'',x+4,12*devicePixelRatio)});
  g.fillStyle='#4bc3e8';g.fillRect(X(Math.max(0,pos)),0,2,h)})}
function studioEnd(){let e=0;S.tracks.forEach(t=>clipsOf(t).forEach(c=>e=Math.max(e,c.start+c.dur)));return e}
async function renderStudio(master,sr){const end=studioEnd();if(!end)return null;sr=sr||44100;const oc=new OfflineAudioContext(2,Math.ceil((end+1.5)*sr),sr);const bus=oc.createGain();
 let mo=null;if(master){mo=buildMaster(oc,S.mset);bus.connect(mo.i);mo.o.connect(oc.destination)}else bus.connect(oc.destination);
 const cv=oc.createConvolver();cv.buffer=impulse(oc,2.2);const rr=oc.createGain();rr.gain.value=S.revRet.gain.value;cv.connect(rr).connect(bus);const any=S.strips.some(s=>s.solo);
 S.tracks.forEach(t=>{const s=t.strip;if(s.m||(any&&!s.solo))return;const i=oc.createGain();const eq=s.eq.map(e=>biq(oc,e.type,e.frequency.value,e.gain.value,e.Q.value));const cp=oc.createDynamicsCompressor();cp.threshold.value=s.comp.threshold.value;cp.ratio.value=s.comp.ratio.value;
  const pn=oc.createStereoPanner();pn.pan.value=s.pan.pan.value;const f=oc.createGain();f.gain.value=s.vol;if(s.auto.length&&s.amode==='read')s.auto.forEach(a=>f.gain.setValueAtTime(a[1],Math.max(0,a[0])));let a=i;[biq(oc,'highpass',s.hpf.frequency.value),...eq,cp,pn,f].forEach(x=>{a.connect(x);a=x});a.connect(bus);const rs=oc.createGain();rs.gain.value=s.rev.gain.value;a.connect(rs).connect(cv);
  clipsOf(t).forEach(c=>{const src=oc.createBufferSource();src.buffer=c.buf;const g=oc.createGain();envelope(g.gain,c,c.start,0);src.connect(g).connect(i);src.start(c.start,c.off,c.dur)})});
 return await oc.startRendering()}
async function exportCompressed(){const types=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm'];const mt=types.find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t));if(!mt){$('exOut').textContent='This browser cannot make WebM or OGG. Use Export WAV.';return}
 const end=studioEnd();if(!end){$('exOut').textContent='Nothing to export yet';return}stStop();S.st.pos=0;const mr=new MediaRecorder(S.stream.stream,{mimeType:mt});const parts=[];mr.ondataavailable=e=>e.data.size&&parts.push(e.data);
 const done=new Promise(r=>mr.onstop=r);mr.start(250);stPlay(false);$('exOut').textContent='Recording in real time, '+Math.ceil(end)+' seconds...';await new Promise(r=>setTimeout(r,(end+0.6)*1000));mr.stop();await done;stStop();
 const ext=mt.includes('ogg')?'ogg':'webm';download(new Blob(parts,{type:mt.split(';')[0]}),'coffeebreak-song.'+ext,$('exOut'))}
function metroTick(){const s=S.st;if(!s.playing||!(s.met||(s.count&&ctx.currentTime<s.countUntil)))return;const bt=60/(+$('sBpm').value);
 while(s.nextClick<ctx.currentTime+0.15){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=s.clickN%4===0?1600:1000;g.gain.setValueAtTime(0.5,s.nextClick);g.gain.exponentialRampToValueAtTime(0.001,s.nextClick+0.05);o.connect(g).connect(ctx.destination);o.start(s.nextClick);o.stop(s.nextClick+0.06);s.nextClick+=bt;s.clickN++;if(!s.met&&s.nextClick>=s.countUntil-0.01)break}}

/* ---------- Mastering ---------- */
const MPRE={Spotify:{target:-14,ceil:-1,width:1.15,eq5:[0.5,-0.5,0,0.5,1.5],mb:[[-22,2,1],[-20,1.6,0.6],[-22,2,0.8]],glue:{th:-14,ratio:2}},YouTube:{target:-14,ceil:-1,width:1.1,eq5:[1,-0.5,0,1,1.5],mb:[[-22,2.2,1],[-20,1.8,0.8],[-22,2,0.8]],glue:{th:-14,ratio:2}},
 Radio:{target:-9,ceil:-0.3,width:1,eq5:[1,-1,1,2,1.5],mb:[[-26,4,2],[-24,3,1.5],[-26,3.5,1.5]],glue:{th:-18,ratio:3}},Suno:{target:-12,ceil:-1,width:1.1,eq5:[0.5,-1,0.5,1,2],mb:[[-24,2.5,1.2],[-22,2,0.8],[-24,2.5,1]],glue:{th:-16,ratio:2.5}},
 Club:{target:-7,ceil:-0.3,width:1,eq5:[3,-1,0,1,1],mb:[[-28,5,2.5],[-24,3,1.5],[-26,3,1.5]],glue:{th:-20,ratio:4}},'Apple Music':{target:-16,ceil:-1,width:1.1,eq5:[0.5,0,0,0.5,1],mb:[[-20,1.8,0.6],[-18,1.5,0.4],[-20,1.8,0.5]],glue:{th:-12,ratio:1.8}},Podcast:{target:-16,ceil:-1,width:0.9,eq5:[-2,-1,2,1.5,0],mb:[[-22,3,1],[-22,3,1.5],[-24,3,1]],glue:{th:-16,ratio:3}}};
function setMaster(s){Object.assign(S.mset,JSON.parse(JSON.stringify(s)));S.master.set(S.mset);renderMCtl()}
function renderMCtl(){const box=$('mCtl');box.innerHTML='';const m=S.mset,up=()=>S.master.set(m);const row=el('div',{className:'row'});
 ['60','250','1k','4k','12k'].forEach((n,k)=>row.append(knob(n+' Hz',-12,12,0.5,m.eq5[k],v=>{m.eq5[k]=v;up()})[0]));box.append(el('small',{textContent:'5-band EQ'}),row);
 ['Low band','Mid band','High band'].forEach((n,k)=>box.append(el('div',{className:'row'},el('small',{textContent:n,style:'width:70px'}),knob('Threshold',-50,0,1,m.mb[k][0],v=>{m.mb[k][0]=v;up()})[0],knob('Ratio',1,12,0.1,m.mb[k][1],v=>{m.mb[k][1]=v;up()})[0],knob('Makeup dB',0,8,0.1,m.mb[k][2],v=>{m.mb[k][2]=v;up()})[0])));
 box.append(el('div',{className:'row'},knob('Glue comp',-40,0,1,m.glue.th,v=>{m.glue.th=v;up()})[0],knob('Glue ratio',1,10,0.1,m.glue.ratio,v=>{m.glue.ratio=v;up()})[0],knob('Stereo width',0,2,0.01,m.width,v=>{m.width=v;up()})[0]),
  el('div',{className:'row'},knob('Drive into limiter dB',-6,12,0.1,m.out||0,v=>{m.out=v;up()})[0],knob('Ceiling dBFS',-3,0,0.1,m.ceil,v=>{m.ceil=v;up()})[0],el('span',{textContent:'Target '+m.target+' LUFS'})))}
function buildMastering(){const sel=$('mPreset');sel.append(el('option',{value:'',textContent:'Preset...'}));Object.keys(MPRE).forEach(k=>sel.append(el('option',{value:k,textContent:k+' ('+MPRE[k].target+' LUFS)'})));
 sel.onchange=()=>{if(sel.value){setMaster(Object.assign({},MDEF,MPRE[sel.value]));toast(sel.value+' master loaded')}};renderMCtl();
 $('mBypass').onclick=e=>{S.mOn=!S.mOn;S.master.o.gain.value=S.mOn?1:0;S.bypass.gain.value=S.mOn?0:1;e.target.textContent=S.mOn?'Mastering on':'Mastering bypassed';e.target.classList.toggle('act',!S.mOn)};
 const MP=S.mp={buf:null,src:null};const mplay=()=>{if(!MP.buf){toast('Load a song first');return}mstop();MP.src=ctx.createBufferSource();MP.src.buffer=MP.buf;MP.src.connect(S.chMaster.i);MP.src.start()};const mstop=()=>{if(MP.src){try{MP.src.stop()}catch(e){}MP.src=null}};
 const mIn=async(b,n)=>{MP.buf=b;MP.name=n;await showM()};pick($('mFile'),mIn,{out:'mOut'});dropZone('master',mIn,{out:'mOut'});pick($('coverFile'),mIn,{out:'mOut'});dropZone('cover',mIn,{out:'mOut'});$('mDemo').onclick=()=>{MP.buf=demoSong(122,8,true);MP.name='Demo song';showM()};
 $('mPlay').onclick=mplay;$('mStop').onclick=mstop;S.mplay=mplay;S.mstop=mstop;
 async function showM(){const m=await measureLUFS(MP.buf);MP.lufs=m.lufs;$('mOut').textContent=MP.name+': '+m.lufs.toFixed(1)+' LUFS (approx), peak '+m.peak.toFixed(1)+' dBFS'}
 $('mRender').onclick=async()=>{if(!MP.buf){toast('Load a song first');return}$('mOut').textContent='Rendering...';const b=await renderMastered(MP.buf);const m=await measureLUFS(b);download(bufToWav(b),'mastered.wav',$('mOut'));$('mOut').prepend('Mastered: '+m.lufs.toFixed(1)+' LUFS (approx), peak '+m.peak.toFixed(1)+' dBFS. ')};
 $('mMatch').onclick=async()=>{if(!MP.buf){toast('Load a song first');return}for(let k=0;k<4;k++){const m=await measureLUFS(await renderMastered(MP.buf,20));const d=S.mset.target-m.lufs;if(Math.abs(d)<0.5)break;S.mset.out=clamp((S.mset.out||0)+d,-6,12);S.master.set(S.mset)}renderMCtl();const m=await measureLUFS(await renderMastered(MP.buf,20));$('mOut').textContent='Matched: '+m.lufs.toFixed(1)+' LUFS against target '+S.mset.target};
 const R=S.refp={buf:null,src:null,on:false};const refIn=async(b,n)=>{if(R.src){try{R.src.stop()}catch(e){}R.src=null}R.buf=b;const m=await measureLUFS(R.buf);R.lufs=m.lufs;$('refInfo').textContent='Reference: '+n+', '+m.lufs.toFixed(1)+' LUFS (approx). Press the button to flip between your master and the reference.'};pick($('refFile'),refIn,{out:'refInfo'});dropZone('ref',refIn,{out:'refInfo'});
 $('refAB').onclick=e=>{if(!R.buf){toast('Load a reference song first');return}R.on=!R.on;if(R.on){if(!R.src){R.src=ctx.createBufferSource();R.src.buffer=R.buf;R.src.loop=true;R.src.connect(S.ref);R.src.start()}S.ref.gain.value=1;S.out.gain.value=0}else{S.ref.gain.value=0;S.out.gain.value=1}e.target.textContent='Listening: '+(R.on?'Reference':'Your master')};
 $('lufsReset').onclick=()=>{S.lu={blocks:[],peak:0}};S.lu={blocks:[],peak:0}}
async function renderMastered(buf,maxSec){const len=maxSec?Math.min(buf.length,maxSec*buf.sampleRate):buf.length;const oc=new OfflineAudioContext(2,len,buf.sampleRate);const s=oc.createBufferSource();s.buffer=buf;const m=buildMaster(oc,S.mset);s.connect(m.i);m.o.connect(oc.destination);s.start();return await oc.startRendering()}

/* ---------- Tools and presets ---------- */
function buildTools(){$('toolCount').textContent=CBPresets.TOTAL.toLocaleString();$('toolCountH').textContent=CBPresets.TOTAL.toLocaleString();S.favs=JSON.parse(localStorage.cbMegaFav||'{}');
 const tg=$('tTarget');[['master','Master'],...S.decks.map((d,k)=>['deck'+k,'Deck '+d.name]),['voice','Karaoke mic'],...S.strips.map((s,k)=>['strip'+k,s.name])].forEach(o=>tg.append(el('option',{value:o[0],textContent:o[1]})));
 let tm;$('tSearch').oninput=()=>{clearTimeout(tm);tm=setTimeout(runSearch,150)};$('tCat').onchange=runSearch}
function runSearch(){const r=CBPresets.search($('tSearch').value,$('tCat').value,S.favs,150);$('tInfo').textContent=r.hits.toLocaleString()+' matches'+(r.hits>150?', showing the first 150':'');const L=$('tList');L.innerHTML='';
 r.list.forEach(p=>{const f=el('button',{textContent:S.favs[p.id]?'★':'☆',title:'Favourite',on:{click:()=>{if(S.favs[p.id])delete S.favs[p.id];else S.favs[p.id]=1;localStorage.cbMegaFav=JSON.stringify(S.favs);f.textContent=S.favs[p.id]?'★':'☆'}}});
  L.append(el('div',{className:'pr'},f,el('span',{},p.name+' ',el('small',{textContent:{chain:'channel chain',master:'mastering',djfx:'DJ FX',voice:'karaoke voice'}[p.kind]})),el('button',{textContent:'Apply',on:{click:()=>applyPreset(p)}})))})}
function applyPreset(p,target){target=target||$('tTarget').value;const s=p.s;
 if(p.kind==='master'){setMaster(Object.assign({},MDEF,s));toast('Applied to master: '+p.name);return 'master'}
 if(p.kind==='voice'){const K=S.kar;K.revG.gain.value=s.rev;K.echoG.gain.value=s.echo;K.tune.parameters.get('correct').value=s.at;$('micRev').value=s.rev;$('micEcho').value=s.echo;$('atStr').value=s.at;S.chMic.apply({eq:s.eq,fx:s.fx});toast('Applied to karaoke mic: '+p.name);return 'voice'}
 if(target.startsWith('deck')){const d=S.decks[+target.slice(4)];if(s.eq)s.eq.forEach((g,k)=>d.eq[k].gain.value=g);if(s.fx){d.fx.p=s.fx.p;d.fx.setType(s.fx.type);d.fx.setWet(s.fx.type==='none'?0:s.fx.wet)}if(s.filter!=null)d.setFilter(s.filter);toast('Applied to deck '+d.name+': '+p.name);return target}
 let st=target.startsWith('strip')?S.strips[+target.slice(5)]:S.tracks[0].strip;if(p.kind==='djfx'){st.apply({fx:s.fx})}else st.apply(s);toast('Applied to '+st.name+': '+p.name);return st.id}

/* ---------- Lyric Cleaner ---------- */
function renderClean(res,box){box.innerHTML='';const c={red:0,amber:0,green:0};res.forEach(r=>{if(!r.line.trim())return;c[r.sev]++;const d=el('div',{className:'lcl lc-'+r.sev},el('div',{textContent:r.line}));
 if(r.reasons.length)d.append(el('small',{textContent:r.reasons.join(' ')}));r.rewrites.forEach(w=>d.append(el('div',{},el('small',{textContent:'Try: '+w}))));box.append(d)});box.prepend(el('div',{textContent:c.red+' red, '+c.amber+' amber, '+c.green+' green'}));return c}
function buildCleaner(){let last=null;pick($('lcFile'),null,{lyrics:'clean'});dropZone('clean',null,{lyrics:'clean'});$('lcScan').onclick=()=>{last=LyricCleaner.scan($('lcText').value,CB_WORDS,$('lcRadio').checked);const c=renderClean(last,$('lcOut'));$('lcSum').textContent=c.red?'Some lines need a rewrite.':c.amber?'A few lines could be misread.':'All clear.'};
 $('lcApply').onclick=()=>{if(!last)$('lcScan').click();$('lcText').value=LyricCleaner.applyAll(last);$('lcScan').click()};$('lcToKar').onclick=()=>{$('lyrText').value=$('lcText').value;parseLyrics();showTab('kar')}}

/* ---------- loop ---------- */
function loop(){requestAnimationFrame(loop);if(!ctx)return;
 S.decks.forEach(d=>{const t=d.time();drawWave(d.ui.wave,d.buf,d.buf?t:null,[{t:d.cue,c:'#4bc3e8'},...d.hot.map(h=>({t:h,c:'#5be87a'})),...(d.loop?[{t:d.loop[0],c:'#e85b4b'},{t:d.loop[1],c:'#e85b4b'}]:[])]);
  const j=d.ui.jog,g=j.getContext('2d');g.clearRect(0,0,110,110);g.fillStyle='#2b1d16';g.beginPath();g.arc(55,55,52,0,7);g.fill();g.strokeStyle='#e8a54b';g.lineWidth=4;g.beginPath();const a=t*1.8*Math.PI;g.moveTo(55,55);g.lineTo(55+Math.cos(a)*48,55+Math.sin(a)*48);g.stroke();g.fillStyle='#fff';g.font='12px sans-serif';g.fillText(fmt(t),38,100)});
 const mb=S.decks.filter(d=>d.playing&&d.bpm);$('mbpm').textContent=mb.length?mb[0].curBpm().toFixed(1):'--';
 S.strips.forEach(s=>{const l=s.level();if(s.ui)s.ui.meter.style.width=Math.min(100,l*100)+'%';
  if(S.st&&S.st.playing&&s.id[0]==='t'){const t=stTime();if(s.amode==='write'){const lp=s.auto[s.auto.length-1];if(!lp||t-lp[0]>0.05)s.auto.push([t,s.vol])}else if(s.amode==='read'&&s.auto.length){let v=s.auto[0][1];for(const p of s.auto){if(p[0]<=t)v=p[1];else break}if(Math.abs(v-s.vol)>0.001)s.setVol(v)}}});
 const kd=new Float32Array(2048);S.kAn.getFloatTimeDomainData(kd);let e=0;for(const v of kd)e+=v*v;S.lu.blocks.push(e/2048*2);if(S.lu.blocks.length>3000)S.lu.blocks.shift();
 const td=new Float32Array(2048);S.an.getFloatTimeDomainData(td);let pk=0;for(const v of td)pk=Math.max(pk,Math.abs(v));S.lu.peak=Math.max(S.lu.peak*0.995,pk);
 const lk=m=>-0.691+10*Math.log10(m+1e-12),avg=n=>{const b=S.lu.blocks.slice(-n);return b.reduce((a,c)=>a+c,0)/Math.max(1,b.length)};const M=lk(avg(24)),Sh=lk(avg(180));
 const gated=S.lu.blocks.filter(m=>lk(m)>-70),I=gated.length?lk(gated.reduce((a,c)=>a+c,0)/gated.length):-70;
 if(!(S.fr=(S.fr||0)+1)%6){$('lufsM').textContent=M>-70?M.toFixed(1):'--';$('lufsS').textContent=Sh>-70?Sh.toFixed(1):'--';$('lufsI').textContent=I>-70?I.toFixed(1):'--';$('lufsH').textContent=(Sh>-70?Sh.toFixed(1):'--')+' LUFS';$('peak').textContent=S.lu.peak>0?(20*Math.log10(S.lu.peak)).toFixed(1):'--'}
 const mm=$('mmeter').getContext('2d');mm.fillStyle='#000';mm.fillRect(0,0,160,16);mm.fillStyle=pk>0.95?'#e85b4b':'#5be87a';mm.fillRect(0,0,Math.min(160,pk*160),16);
 if(document.getElementById('t-master').classList.contains('on')){const cv=$('spec'),w=cv.width=cv.clientWidth||300,h=cv.height,g=cv.getContext('2d'),f=new Uint8Array(S.an.frequencyBinCount);S.an.getByteFrequencyData(f);g.fillStyle='#0b0705';g.fillRect(0,0,w,h);g.fillStyle='#4bc3e8';for(let x=0;x<w;x++){const i=Math.floor(Math.pow(f.length,x/w));g.fillRect(x,h-f[i]/255*h,1,f[i]/255*h)}}
 if(document.getElementById('t-kar').classList.contains('on'))karFrame();if(document.getElementById('t-studio').classList.contains('on')){$('sTime').textContent=(stTime()<0?'Count-in ':'')+fmt(Math.abs(stTime()))+'.'+Math.floor(Math.abs(stTime())*10%10);drawTracks()}
 metroTick()}

/* ---------- tabs, keys, start ---------- */
const TABS=[['dj','DJ decks'],['kar','Karaoke'],['studio','Recording studio'],['mixer','Mixer'],['master','Mastering'],['tools','Tools and presets'],['clean','Lyric Cleaner'],['about','About']];
function showTab(k){TABS.forEach(t=>{$('t-'+t[0]).classList.toggle('on',t[0]===k);S.navB[t[0]].classList.toggle('on',t[0]===k)});if(k==='tools'&&!S.searched){S.searched=1;runSearch()}if(k==='studio')renderTracks()}
S.navB={};TABS.forEach(t=>{const b=el('button',{textContent:t[1],on:{click:()=>showTab(t[0])}});S.navB[t[0]]=b;$('nav').append(b)});showTab('dj');
document.addEventListener('keydown',e=>{if(!ctx||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase(),i='12345678qwerasdf'.indexOf(k);if(i>=0&&!e.repeat){playPad(i);return}
 if(k===' '){e.preventDefault();const d=S.decks[0];d.playing?d.pause():d.play();d.ui.sync()}if(k==='t')tapLyric()});
$('go').onclick=async()=>{$('go').disabled=true;try{await initAudio();$('start').style.display='none'}catch(err){$('go').disabled=false;$('start').append(el('p',{textContent:'Audio could not start: '+err.message}))}};
