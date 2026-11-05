/* Coffeebreak Studio Espresso - DSP helpers (some reused from Master Studio) */
const dbToG=d=>Math.pow(10,d/20);
async function decodeFile(file){ const ab=await file.arrayBuffer(); return await AC().decodeAudioData(ab); }
function newBuf(ch,len,sr){ return new AudioBuffer({numberOfChannels:ch,length:Math.max(1,len),sampleRate:sr}); }
function cloneBuf(b){ const n=newBuf(b.numberOfChannels,b.length,b.sampleRate); for(let c=0;c<b.numberOfChannels;c++)n.copyToChannel(b.getChannelData(c).slice(),c); return n; }
function toStereo(b){ if(b.numberOfChannels>=2)return b; const n=newBuf(2,b.length,b.sampleRate); n.copyToChannel(b.getChannelData(0),0); n.copyToChannel(b.getChannelData(0),1); return n; }
function sliceBuf(b,s,e){ s=Math.max(0,s|0);e=Math.min(b.length,e|0); const n=newBuf(b.numberOfChannels,e-s,b.sampleRate); for(let c=0;c<b.numberOfChannels;c++)n.copyToChannel(b.getChannelData(c).subarray(s,e),c); return n; }
function concatBufs(list,sr,ch){ const len=list.reduce((a,b)=>a+(b?b.length:0),0); const n=newBuf(ch,len,sr); let o=0; for(const b of list){ if(!b)continue; for(let c=0;c<ch;c++){ n.getChannelData(c).set(b.getChannelData(Math.min(c,b.numberOfChannels-1)),o);} o+=b.length;} return n; }
function peakOf(b){ let p=0; for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c); for(let i=0;i<d.length;i++){const a=Math.abs(d[i]); if(a>p)p=a}} return p; }
function gainBuf(b,g){ for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c); for(let i=0;i<d.length;i++)d[i]*=g} return b; }
async function offline(b,build,extraSec=0,rate=1){ const len=Math.ceil((b.length/rate)+extraSec*b.sampleRate); const o=new OfflineAudioContext(Math.max(2,b.numberOfChannels),len,b.sampleRate); const s=o.createBufferSource(); s.buffer=b; s.playbackRate.value=rate; const out=(build&&build(o,s))||s; out.connect(o.destination); s.start(); return await o.startRendering(); }
function makeIR(c,sec=2.2,decay=3){ const sr=c.sampleRate,len=sr*sec|0,ir=c.createBuffer(2,len,sr); for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch); for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);} return ir; }
// approximate integrated LUFS (K-weighting approx, 400ms blocks, absolute + relative gate)
async function measureLUFS(b){ const k=await offline(b,(o,s)=>{const h=o.createBiquadFilter();h.type='highshelf';h.frequency.value=1500;h.gain.value=4;const hp=o.createBiquadFilter();hp.type='highpass';hp.frequency.value=38;hp.Q.value=0.5;s.connect(h);h.connect(hp);return hp;});
  const blk=Math.floor(0.4*k.sampleRate),hop=blk/4|0,ch=Math.min(2,k.numberOfChannels),L=[];
  for(let st=0;st+blk<=k.length;st+=hop){let z=0;for(let c=0;c<ch;c++){const d=k.getChannelData(c);let s=0;for(let i=st;i<st+blk;i++)s+=d[i]*d[i];z+=s/blk;} L.push(z);}
  if(!L.length)return -70; const lu=z=>-0.691+10*Math.log10(z+1e-12); let g=L.filter(z=>lu(z)>-70); if(!g.length)return -70;
  const rel=lu(g.reduce((a,b)=>a+b,0)/g.length)-10; g=g.filter(z=>lu(z)>rel); return lu(g.reduce((a,b)=>a+b,0)/g.length); }

/* ---------- encoders ---------- */
function encodeWAV(b,bits=16,maxSec){ let len=b.length; if(maxSec)len=Math.min(len,maxSec*b.sampleRate|0); const ch=b.numberOfChannels,fl=bits===32,bps=bits/8,data=len*ch*bps,buf=new ArrayBuffer(44+data),v=new DataView(buf);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  ws(0,'RIFF');v.setUint32(4,36+data,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,fl?3:1,true);v.setUint16(22,ch,true);v.setUint32(24,b.sampleRate,true);v.setUint32(28,b.sampleRate*ch*bps,true);v.setUint16(32,ch*bps,true);v.setUint16(34,bits,true);ws(36,'data');v.setUint32(40,data,true);
  const cs=[];for(let c=0;c<ch;c++)cs.push(b.getChannelData(c)); let o=44;
  for(let i=0;i<len;i++)for(let c=0;c<ch;c++){let s=cs[c][i]; if(fl){v.setFloat32(o,s,true);o+=4;continue} s=Math.max(-1,Math.min(1,s));
    if(bits===16){v.setInt16(o,s<0?s*32768:s*32767,true);o+=2}else{const x=Math.round(s<0?s*8388608:s*8388607);v.setUint8(o,x&255);v.setUint8(o+1,(x>>8)&255);v.setUint8(o+2,(x>>16)&255);o+=3}}
  return new Blob([buf],{type:'audio/wav'}); }
function hasMP3(){return typeof lamejs!=='undefined'}
async function encodeMP3(b,maxSec,kbps=192){ if(!hasMP3())throw new Error('MP3 encoder not available'); let src=b; if(![32000,44100,48000].includes(b.sampleRate))src=await resample(b,44100);
  let len=src.length; if(maxSec)len=Math.min(len,maxSec*src.sampleRate|0); const ch=Math.min(2,src.numberOfChannels),enc=new lamejs.Mp3Encoder(ch,src.sampleRate,kbps),out=[];
  const conv=d=>{const r=new Int16Array(len);for(let i=0;i<len;i++){const s=Math.max(-1,Math.min(1,d[i]));r[i]=s<0?s*32768:s*32767}return r};
  const L=conv(src.getChannelData(0)),R=ch>1?conv(src.getChannelData(1)):null;
  for(let i=0;i<len;i+=1152){const m=ch>1?enc.encodeBuffer(L.subarray(i,i+1152),R.subarray(i,i+1152)):enc.encodeBuffer(L.subarray(i,i+1152)); if(m.length)out.push(new Uint8Array(m)); if(i%(1152*200)===0)await new Promise(r=>setTimeout(r));}
  const f=enc.flush(); if(f.length)out.push(new Uint8Array(f)); return new Blob(out,{type:'audio/mpeg'}); }
async function resample(b,sr){ const o=new OfflineAudioContext(b.numberOfChannels,Math.ceil(b.duration*sr),sr); const s=o.createBufferSource(); s.buffer=b; s.connect(o.destination); s.start(); return o.startRendering(); }
function buildMasterChain(c,input,p,makeup=1){
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;
  const lo=c.createBiquadFilter();lo.type='lowshelf';lo.frequency.value=120;lo.gain.value=p.l;
  const mi=c.createBiquadFilter();mi.type='peaking';mi.frequency.value=1200;mi.Q.value=0.8;mi.gain.value=p.m;
  const hi=c.createBiquadFilter();hi.type='highshelf';hi.frequency.value=8000;hi.gain.value=p.h;
  input.connect(hp);hp.connect(lo);lo.connect(mi);mi.connect(hi);
  // three band compression
  const sum=c.createGain(); const bands=[['lowpass',200],['bandpass',1500],['highpass',5000]];
  for(const [t,f] of bands){const fl=c.createBiquadFilter();fl.type=t;fl.frequency.value=f;if(t==='bandpass')fl.Q.value=0.35;
    const k=c.createDynamicsCompressor();k.threshold.value=-12-p.c*18;k.ratio.value=1.5+p.c*3;k.knee.value=8;k.attack.value=t==='lowpass'?0.03:0.008;k.release.value=0.2;
    const mg=c.createGain();mg.gain.value=dbToG(p.c*5);hi.connect(fl);fl.connect(k);k.connect(mg);mg.connect(sum);}
  // stereo width (mid/side)
  const sp=c.createChannelSplitter(2),mg=c.createChannelMerger(2);sum.connect(sp);
  const w=p.w,a=(1+w)/2,b=(1-w)/2; const LL=c.createGain(),LR=c.createGain(),RL=c.createGain(),RR=c.createGain();LL.gain.value=a;RR.gain.value=a;LR.gain.value=b;RL.gain.value=b;
  sp.connect(LL,0);sp.connect(LR,1);sp.connect(RR,1);sp.connect(RL,0);LL.connect(mg,0,0);LR.connect(mg,0,0);RR.connect(mg,0,1);RL.connect(mg,0,1);
  const mk=c.createGain();mk.gain.value=makeup;mg.connect(mk);
  const lim=c.createDynamicsCompressor();lim.threshold.value=-1.5;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=0.001;lim.release.value=0.08;mk.connect(lim);
  const ceil=c.createGain();ceil.gain.value=dbToG(-0.3);lim.connect(ceil);return{out:ceil,mk};}
async function renderMaster(b,p){ // pass 1: measure chain loudness, pass 2: apply makeup gain
  b=toStereo(b); const r1=await offline(b,(o,s)=>buildMasterChain(o,s,p,1).out); const l1=await measureLUFS(r1);
  const gdb=Math.max(-12,Math.min(18,p.t-l1)); const r2=await offline(b,(o,s)=>buildMasterChain(o,s,p,dbToG(gdb)).out);
  const pk=peakOf(r2); if(pk>0.966)gainBuf(r2,0.966/pk); return{buf:r2,gain:dbToG(gdb),lufs:await measureLUFS(r2)};}
function gate(b){ const sr=b.sampleRate,fr=Math.floor(sr*0.01),n=Math.floor(b.length/fr),rms=new Float32Array(n);
  for(let k=0;k<n;k++){let s=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=k*fr;i<(k+1)*fr;i++)s+=d[i]*d[i]}rms[k]=Math.sqrt(s/fr/b.numberOfChannels)}
  const sorted=[...rms].sort((a,b)=>a-b),floor=sorted[Math.floor(n*0.1)]||0,th=Math.max(floor*3,1e-4);let g=1;const gains=new Float32Array(b.length);
  for(let i=0;i<b.length;i++){const k=Math.min(n-1,Math.floor(i/fr));const tgt=rms[k]>th?1:0.05;g+=(tgt-g)*(tgt>g?0.01:0.0005);gains[i]=g}
  for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=gains[i]} return b; }
// simple FFT
function fft(re,im,inv){const n=re.length;for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
 for(let len=2;len<=n;len<<=1){const a=2*Math.PI/len*(inv?1:-1),wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci,vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr;re[i+j]=ur+vr;im[i+j]=ui+vi;re[i+j+len/2]=ur-vr;im[i+j+len/2]=ui-vi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}
 if(inv)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}}
// spectral noise reduction using a noise profile (spectral subtraction with smoothing)
async function spectralNR(b,prof){ const N=2048,H=N/4,win=new Float32Array(N).map((_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/N));
  const mags=(d,st)=>{const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++)re[i]=(d[st+i]||0)*win[i];fft(re,im);return[re,im]};
  const out=newBuf(b.numberOfChannels,b.length,b.sampleRate);
  for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c),o=out.getChannelData(c),noise=new Float32Array(N/2+1);
    // profile: from selection or quietest 10% frames
    const src=prof?prof.getChannelData(Math.min(c,prof.numberOfChannels-1)):d; const frames=[];
    for(let st=0;st+N<src.length;st+=H*2){const[re,im]=mags(src,st);let e=0;const m=new Float32Array(N/2+1);for(let k=0;k<=N/2;k++){m[k]=Math.hypot(re[k],im[k]);e+=m[k]}frames.push([e,m]);if(frames.length>4000)break}
    frames.sort((a,b)=>a[0]-b[0]); const use=prof?frames:frames.slice(0,Math.max(1,frames.length/10|0)); for(const[,m]of use)for(let k=0;k<=N/2;k++)noise[k]+=m[k]/use.length;
    const prevG=new Float32Array(N/2+1).fill(1);
    for(let st=-N+H;st<d.length;st+=H){const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++){const x=st+i;re[i]=(x>=0&&x<d.length?d[x]:0)*win[i]}fft(re,im);
      for(let k=0;k<=N/2;k++){const m=Math.hypot(re[k],im[k]);let g=Math.max(0.08,1-1.5*noise[k]/(m+1e-9));g=0.6*prevG[k]+0.4*g;prevG[k]=g;re[k]*=g;im[k]*=g;if(k>0&&k<N/2){re[N-k]*=g;im[N-k]*=g}}
      fft(re,im,true);for(let i=0;i<N;i++){const x=st+i;if(x>=0&&x<d.length)o[x]+=re[i]*win[i]/1.5}}
    await new Promise(r=>setTimeout(r));}
  return out; }
function declick(d){ let fixed=0; const w=6; let avg=0; for(let i=1;i<d.length;i++){const diff=Math.abs(d[i]-d[i-1]);avg=avg*0.999+diff*0.001;
  if(diff>0.3&&diff>avg*25&&i+w<d.length){const a=d[i-1],b=d[i+w];for(let j=0;j<w;j++)d[i+j]=a+(b-a)*(j+1)/(w+1);i+=w;fixed++}} return fixed; }
async function deEss(b){ // reduce 5-9 kHz bursts: sidechain detected per 5ms
  const hi=await offline(b,(o,s)=>{const q=o.createBiquadFilter();q.type='bandpass';q.frequency.value=6500;q.Q.value=1.2;s.connect(q);return q});
  const fr=Math.floor(b.sampleRate*0.005),out=cloneBuf(b);const hc=hi.getChannelData(0),d0=b.getChannelData(0);
  for(let st=0;st<b.length;st+=fr){let sh=0,sa=0;for(let i=st;i<st+fr&&i<b.length;i++){sh+=hc[i]*hc[i];sa+=d0[i]*d0[i]}const ratio=sh/(sa+1e-9);if(ratio>0.35){const red=Math.max(0.35,1-(ratio-0.35));
    for(let c=0;c<out.numberOfChannels;c++){const d=out.getChannelData(c),h=hi.getChannelData(Math.min(c,hi.numberOfChannels-1));for(let i=st;i<st+fr&&i<b.length;i++)d[i]-=h[i]*(1-red)}}}
  return out; }
/* ---------- new DSP for Studio Espresso ---------- */
function monoOf(b){ const n=new Float32Array(b.length); for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<n.length;i++)n[i]+=d[i]/b.numberOfChannels} return n; }
// WSOLA time stretch: f>1 makes it longer, pitch unchanged
function wsola(b,f){ const N=2048,Hs=N/2,Ha=Hs/f,tol=400,win=new Float32Array(N).map((_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/N));
  const outLen=Math.ceil(b.length*f)+N,ref=monoOf(b),out=newBuf(b.numberOfChannels,outLen,b.sampleRate),chs=[],ochs=[];
  for(let c=0;c<b.numberOfChannels;c++){chs.push(b.getChannelData(c));ochs.push(out.getChannelData(c))}
  let prev=0; for(let k=0;k*Hs<outLen-N;k++){ const nom=Math.round(k*Ha); let best=nom;
    if(k>0){ const nat=prev+Hs; let bv=-Infinity; for(let d=-tol;d<=tol;d+=8){const p=nom+d; if(p<0||p+N>ref.length)continue; let s=0; for(let i=0;i<512;i+=2)s+=ref[p+i]*ref[nat+i]||0; if(s>bv){bv=s;best=p}} }
    if(best+N>b.length)best=Math.max(0,Math.min(best,b.length-N)); prev=best; const o=k*Hs;
    for(let c=0;c<chs.length;c++){const s=chs[c],d=ochs[c];for(let i=0;i<N;i++)d[o+i]+=(s[best+i]||0)*win[i]} }
  return sliceBuf(out,0,Math.ceil(b.length*f)); }
async function pitchShiftBuf(b,semi){ const r=Math.pow(2,semi/12); const st=wsola(b,r); const o=await offline(st,null,0,r); return sliceBuf(o,0,b.length); }
function reverseBuf(b){ const n=cloneBuf(b); for(let c=0;c<n.numberOfChannels;c++)n.getChannelData(c).reverse(); return n; }
function normaliseBuf(b,db=-1){ const p=peakOf(b); return p>0?gainBuf(cloneBuf(b),dbToG(db)/p):b; }
function fadeBuf(b,s,e,inOut){ const n=cloneBuf(b); for(let c=0;c<n.numberOfChannels;c++){const d=n.getChannelData(c);for(let i=s;i<e;i++){const x=(i-s)/(e-s);d[i]*=inOut==='in'?x:1-x}} return n; }
const NOTE_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
// basic key detection: chroma from FFT frames + Krumhansl profiles
function detectKey(b){ const d=monoOf(b),N=4096,sr=b.sampleRate,chroma=new Float32Array(12); const step=Math.max(N,Math.floor(d.length/200));
  for(let st=0;st+N<d.length;st+=step){const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++)re[i]=d[st+i]*(0.5-0.5*Math.cos(2*Math.PI*i/N));fft(re,im);
    for(let k=2;k<N/2;k++){const f=k*sr/N;if(f<60||f>2000)continue;const m=Math.hypot(re[k],im[k]);const pc=((Math.round(12*Math.log2(f/440))+69)%12+12)%12;chroma[pc]+=m}}
  const maj=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88],min=[6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
  const corr=(p,r)=>{let mx=0,my=0;for(let i=0;i<12;i++){mx+=chroma[(i+r)%12];my+=p[i]}mx/=12;my/=12;let a=0,bx=0,by=0;for(let i=0;i<12;i++){const x=chroma[(i+r)%12]-mx,y=p[i]-my;a+=x*y;bx+=x*x;by+=y*y}return a/Math.sqrt(bx*by+1e-12)};
  let best=[-2,'']; for(let r=0;r<12;r++){const a=corr(maj,r),m=corr(min,r);if(a>best[0])best=[a,NOTE_NAMES[r]+' major'];if(m>best[0])best=[m,NOTE_NAMES[r]+' minor']} return best[1]; }
function detectPitch(d,sr){ // autocorrelation, returns Hz or 0
  const n=d.length;let rms=0;for(let i=0;i<n;i++)rms+=d[i]*d[i];if(Math.sqrt(rms/n)<0.01)return 0;
  const minL=Math.floor(sr/1000),maxL=Math.floor(sr/60);let best=0,bl=0;
  for(let l=minL;l<maxL&&l<n/2;l++){let s=0,e=0;for(let i=0;i<n-l;i+=2){s+=d[i]*d[i+l];e+=d[i+l]*d[i+l]}const v=s/Math.sqrt(e*rms+1e-12);if(v>best){best=v;bl=l}}
  return best>0.3&&bl?sr/bl:0; }
// AudioWorklet processors (loaded from a blob URL)
const WORKLET_SRC=`
class Rec extends AudioWorkletProcessor{constructor(){super();this.b=[[],[]];this.n=0;this.port.onmessage=e=>{if(e.data==='flush')this.flush()}}
 flush(){if(this.n){this.port.postMessage(this.b.map(a=>{const o=new Float32Array(this.n);let p=0;for(const x of a){o.set(x,p);p+=x.length}return o}));this.b=[[],[]];this.n=0}}
 process(i){const x=i[0];if(x&&x[0]){this.b[0].push(x[0].slice());this.b[1].push((x[1]||x[0]).slice());this.n+=x[0].length;if(this.n>=8192)this.flush()}return true}}
registerProcessor('cbx-rec',Rec);
class Gate extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'threshold',defaultValue:-45,minValue:-90,maxValue:0},{name:'release',defaultValue:0.1,minValue:0.01,maxValue:1}]}
 constructor(){super();this.env=0;this.g=1}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const th=Math.pow(10,p.threshold[0]/20),rel=Math.exp(-1/(sampleRate*p.release[0]));
  for(let n=0;n<x[0].length;n++){let a=0;for(const c of x)a=Math.max(a,Math.abs(c[n]));this.env=a>this.env?a:this.env*0.9995;const t=this.env>th?1:0;this.g=t>this.g?Math.min(1,this.g+0.01):this.g*rel+t*(1-rel);for(let c=0;c<y.length;c++)y[c][n]=(x[c]||x[0])[n]*this.g}return true}}
registerProcessor('cbx-gate',Gate);
class DeEss extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'threshold',defaultValue:-30,minValue:-60,maxValue:0},{name:'freq',defaultValue:6000,minValue:3000,maxValue:10000}]}
 constructor(){super();this.lp=[0,0];this.env=0}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const a=Math.exp(-2*Math.PI*p.freq[0]/sampleRate),th=Math.pow(10,p.threshold[0]/20);
  for(let n=0;n<x[0].length;n++){let hm=0;const hs=[];for(let c=0;c<y.length;c++){const s=(x[c]||x[0])[n];this.lp[c]=a*this.lp[c]+(1-a)*s;const h=s-this.lp[c];hs.push(h);hm=Math.max(hm,Math.abs(h))}
   this.env=hm>this.env?hm:this.env*0.999;const g=this.env>th?th/this.env:1;for(let c=0;c<y.length;c++)y[c][n]=this.lp[c]+hs[c]*g}return true}}
registerProcessor('cbx-deess',DeEss);
class Tune extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'key',defaultValue:0,minValue:0,maxValue:11},{name:'scale',defaultValue:0,minValue:0,maxValue:5},{name:'speed',defaultValue:0.5,minValue:0,maxValue:1},{name:'mix',defaultValue:1,minValue:0,maxValue:1}]}
 constructor(){super();this.W=2048;this.buf=new Float32Array(4096);this.w=0;this.an=new Float32Array(1024);this.ai=0;this.cnt=0;this.ratio=1;this.target=1;this.ph=0}
 detect(){const d=this.an,n=d.length,sr=sampleRate/2;let rms=0;for(let i=0;i<n;i+=2)rms+=d[i]*d[i];rms/=n/2;if(Math.sqrt(rms)<0.01)return 0;let best=0,bl=0;
  for(let l=Math.floor(sr/900);l<Math.floor(sr/70);l++){let s=0,e=0;for(let i=0;i+2*l<n;i+=4){s+=d[i]*d[i+2*l];e+=d[i+2*l]*d[i+2*l]}const v=s/Math.sqrt(e*rms*(n/4)+1e-12);if(v>best){best=v;bl=l}}return best>0.5&&bl?sr/bl:0}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const S=[[0,2,4,5,7,9,11],[0,2,3,5,7,8,10],[0,1,2,3,4,5,6,7,8,9,10,11],[0,2,4,7,9],[0,3,5,6,7,10],[0,2,3,5,7,8,11]][Math.round(p.scale[0])],key=Math.round(p.key[0]),mix=p.mix[0],sp=0.0005+0.02*p.speed[0];
  for(let n=0;n<x[0].length;n++){const s=x[0][n];this.buf[this.w]=s;this.an[this.ai]=s;this.ai=(this.ai+1)%1024;
   if(++this.cnt>=512){this.cnt=0;const f=this.detect();if(f){const m=69+12*Math.log2(f/440);let bm=m,bd=99;for(let o=-1;o<=1;o++)for(const sc of S){const c=Math.round(m/12+o)*12+((sc+key)%12);if(Math.abs(c-m)<bd){bd=Math.abs(c-m);bm=c}}this.target=Math.pow(2,(bm-m)/12)}else this.target=1}
   this.ratio+=(this.target-this.ratio)*sp;this.ph=(this.ph+(1-this.ratio)/this.W+1)%1;
   const rd=(d)=>{let q=this.w-d;while(q<0)q+=4096;const q0=Math.floor(q),fr=q-q0;return this.buf[q0%4096]*(1-fr)+this.buf[(q0+1)%4096]*fr};
   const p2=(this.ph+0.5)%1,v=rd(this.ph*this.W+2)*Math.sin(Math.PI*this.ph)+rd(p2*this.W+2)*Math.sin(Math.PI*p2);
   const out=v*mix+s*(1-mix);for(let c=0;c<y.length;c++)y[c][n]=out;this.w=(this.w+1)%4096}return true}}
registerProcessor('cbx-tune',Tune);`;
const _wl=new WeakMap();
function ensureWorklet(c){ if(!c.audioWorklet)return Promise.resolve(false); if(!_wl.has(c)){const u=URL.createObjectURL(new Blob([WORKLET_SRC+WORKLET_SRC2],{type:'application/javascript'}));_wl.set(c,c.audioWorklet.addModule(u).then(()=>true,e=>{console.warn('worklet',e);return false}))} return _wl.get(c); }
const WORKLET_SRC2=`
class Trans extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'attack',defaultValue:0,minValue:-1,maxValue:1},{name:'sustain',defaultValue:0,minValue:-1,maxValue:1}]}
 constructor(){super();this.f=0;this.s=0}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const at=p.attack[0],su=p.sustain[0];for(let n=0;n<x[0].length;n++){let a=0;for(const c of x)a=Math.max(a,Math.abs(c[n]));this.f+=(a-this.f)*(a>this.f?0.3:0.003);this.s+=(a-this.s)*(a>this.s?0.002:0.0005);
  const d=(this.f-this.s)/(this.s+1e-4);let g=1+at*Math.max(0,Math.min(4,d))-su*Math.max(-1,Math.min(0,d))*-1;g=Math.max(0.1,Math.min(4,g));for(let c=0;c<y.length;c++)y[c][n]=(x[c]||x[0])[n]*g}return true}}
registerProcessor('cbx-trans',Trans);
class Crush extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'bits',defaultValue:8,minValue:1,maxValue:16},{name:'down',defaultValue:4,minValue:1,maxValue:40}]}
 constructor(){super();this.h=[0,0];this.c=0}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const q=Math.pow(2,p.bits[0]-1),d=Math.round(p.down[0]);for(let n=0;n<x[0].length;n++){if(++this.c>=d){this.c=0;for(let c=0;c<y.length;c++)this.h[c]=Math.round((x[c]||x[0])[n]*q)/q}for(let c=0;c<y.length;c++)y[c][n]=this.h[c]}return true}}
registerProcessor('cbx-crush',Crush);
class Shift extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'semi',defaultValue:0,minValue:-24,maxValue:24},{name:'semi2',defaultValue:0,minValue:-24,maxValue:24},{name:'mix',defaultValue:1,minValue:0,maxValue:1},{name:'dry',defaultValue:0,minValue:0,maxValue:1}]}
 constructor(){super();this.W=2048;this.b=new Float32Array(4096);this.w=0;this.ph=[0,0]}
 rd(d){let q=this.w-d;while(q<0)q+=4096;const q0=Math.floor(q),f=q-q0;return this.b[q0%4096]*(1-f)+this.b[(q0+1)%4096]*f}
 voice(k,r){this.ph[k]=(this.ph[k]+(1-r)/this.W+1)%1;const a=this.ph[k],b=(a+0.5)%1;return this.rd(a*this.W+2)*Math.sin(Math.PI*a)+this.rd(b*this.W+2)*Math.sin(Math.PI*b)}
 process(i,o,p){const x=i[0],y=o[0];if(!x||!x[0])return true;const r1=Math.pow(2,p.semi[0]/12),s2=p.semi2[0],r2=Math.pow(2,s2/12);for(let n=0;n<x[0].length;n++){const s=x[1]?(x[0][n]+x[1][n])/2:x[0][n];this.b[this.w]=s;
  let v=this.voice(0,r1);if(s2!==0)v+=this.voice(1,r2);const out=v*p.mix[0]+s*p.dry[0];this.w=(this.w+1)%4096;for(let c=0;c<y.length;c++)y[c][n]=out}return true}}
registerProcessor('cbx-shift',Shift);
class Duck extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:'amount',defaultValue:0.7,minValue:0,maxValue:1},{name:'release',defaultValue:0.2,minValue:0.02,maxValue:1},{name:'threshold',defaultValue:-30,minValue:-60,maxValue:0}]}
 constructor(){super();this.e=0}
 process(i,o,p){const x=i[0],k=i[1],y=o[0];if(!x||!x[0])return true;const th=Math.pow(10,p.threshold[0]/20),rel=Math.exp(-1/(sampleRate*p.release[0]));for(let n=0;n<x[0].length;n++){const a=k&&k[0]?Math.abs(k[0][n]):0;this.e=a>this.e?a:this.e*rel;const g=1-p.amount[0]*Math.min(1,this.e/th>1?1:this.e/th);for(let c=0;c<y.length;c++)y[c][n]=(x[c]||x[0])[n]*g}return true}}
registerProcessor('cbx-duck',Duck);`;
// click and pop repair (from Master Studio)
function declick(d){ let fixed=0; const w=6; let avg=0; for(let i=1;i<d.length;i++){const diff=Math.abs(d[i]-d[i-1]);avg=avg*0.999+diff*0.001;
  if(diff>0.3&&diff>avg*25&&i+w<d.length){const a=d[i-1],b=d[i+w];for(let j=0;j<w;j++)d[i+j]=a+(b-a)*(j+1)/(w+1);i+=w;fixed++}} return fixed; }
// de-reverb lite: spectral expansion that pulls down decaying tails
async function dereverb(b,amt=0.6){ const N=2048,H=N/4,win=new Float32Array(N).map((_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/N)),out=newBuf(b.numberOfChannels,b.length,b.sampleRate);
 for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c),o=out.getChannelData(c),slow=new Float32Array(N/2+1);
  for(let st=-N+H;st<d.length;st+=H){const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++){const x=st+i;re[i]=(x>=0&&x<d.length?d[x]:0)*win[i]}fft(re,im);
   for(let k=0;k<=N/2;k++){const m=Math.hypot(re[k],im[k]);slow[k]=Math.max(m,slow[k]*0.93);const tail=m<slow[k]*0.7;const g=tail?Math.max(1-amt,m/(slow[k]+1e-9)):1;re[k]*=g;im[k]*=g;if(k>0&&k<N/2){re[N-k]*=g;im[N-k]*=g}}
   fft(re,im,true);for(let i=0;i<N;i++){const x=st+i;if(x>=0&&x<d.length)o[x]+=re[i]*win[i]/1.5}} await new Promise(r=>setTimeout(r));}
 return out; }
// Karplus-Strong pluck buffer
const _ks={}; function ksBuf(c,pitch,dec){ const k=c.sampleRate+'/'+pitch+'/'+dec; if(_ks[k])return _ks[k]; const sr=c.sampleRate,len=Math.floor(sr*2.5*dec),b=c.createBuffer(1,len,sr),d=b.getChannelData(0),P=Math.max(2,Math.round(sr/mtof(pitch))),line=new Float32Array(P).map(()=>Math.random()*2-1);
 const fb=0.994+0.005*Math.min(1,dec/3); for(let i=0;i<len;i++){const j=i%P,n=(j+1)%P;const v=line[j];d[i]=v;line[j]=fb*0.5*(v+line[n])} return _ks[k]=b; }
