/* Coffeebreak Studio Espresso - Grainy Sound Remover, Upload any file, Play sample sound */
/* Coffeebreak Grainy Sound Remover, Upload any file and Sample sound. Web Audio only, free, runs fully in the browser.
   Shared module, inlined into each Coffeebreak studio app. Configure with CBG.init({...}). */
(function(){
'use strict';
if(window.CBG)return;
const CBG=window.CBG={version:'1.0'};
const cfg={key:'app',name:'Coffeebreak',theme:{},btnClass:'',getClip:null,getMix:null,addAudio:null,getCtx:null,attachNote:'',maxSec:0};
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtT=s=>{s=Math.max(0,s||0);const m=Math.floor(s/60);return m+':'+String(Math.floor(s%60)).padStart(2,'0')};
const fmtSize=n=>n<1024?n+' bytes':n<1048576?(n/1024).toFixed(1)+' KB':(n/1048576).toFixed(1)+' MB';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const newBuf=(ch,len,sr)=>new AudioBuffer({numberOfChannels:ch,length:Math.max(1,len),sampleRate:sr});

/* ---------- toast ---------- */
let toastEl,toastT;
function toast(msg,ms){
  if(!toastEl){toastEl=document.createElement('div');toastEl.id='cbg-toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');root().appendChild(toastEl)}
  toastEl.textContent=msg;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('on'),ms||5200);
  CBG.lastToast=msg;
}
CBG.toast=function(m,ms){toast(m,ms)};

/* ---------- styles and root ---------- */
let rootEl;
function root(){
  if(rootEl)return rootEl;
  const st=document.createElement('style');st.id='cbg-style';
  st.textContent=`
#cbg-root{--cbg-bg:#1e0b14;--cbg-fg:#ffe9c7;--cbg-ac:#e8a0b0;--cbg-acfg:#1a0a10;--cbg-line:#5a2a3a;--cbg-card:#2a1220;--cbg-font:Georgia,serif}
#cbg-root,#cbg-root *{box-sizing:border-box}
.cbg-ov{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;z-index:2147483200;padding:10px}
.cbg-ov.on{display:flex}
.cbg-box{background:var(--cbg-bg);color:var(--cbg-fg);border:2px solid var(--cbg-ac);border-radius:16px;width:min(680px,100%);max-height:94vh;overflow:auto;padding:14px 16px;font:14px/1.4 var(--cbg-font);text-align:left;user-select:text}
.cbg-box h2{margin:0 0 4px;font:700 22px/1.2 var(--cbg-font);color:var(--cbg-ac);letter-spacing:0}
.cbg-box .cbg-hint{font-size:12.5px;opacity:.82;margin:2px 0 8px}
.cbg-box .cbg-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}
.cbg-box button,.cbg-box select,.cbg-box .cbg-lbl{font:14px var(--cbg-font)}
.cbg-box button{background:var(--cbg-card);color:var(--cbg-fg);border:2px solid var(--cbg-ac);border-radius:999px;padding:5px 13px;cursor:pointer;min-height:32px;box-shadow:none;text-shadow:none}
.cbg-box button:hover{filter:brightness(1.15)}
.cbg-box button.pri{background:var(--cbg-ac);color:var(--cbg-acfg);font-weight:700}
.cbg-box button:disabled{opacity:.45;cursor:default}
.cbg-box select{background:var(--cbg-card);color:var(--cbg-fg);border:2px solid var(--cbg-ac);border-radius:10px;padding:4px 8px;max-width:100%;min-height:32px}
.cbg-box input[type=range]{accent-color:var(--cbg-ac);flex:1;min-width:140px}
.cbg-box label{display:inline-flex;gap:5px;align-items:center;color:var(--cbg-fg)}
.cbg-stat{font-size:12.5px;padding:6px 8px;border-radius:8px;background:var(--cbg-card);border:1px dashed var(--cbg-line);min-height:30px}
.cbg-prog{height:6px;border-radius:3px;background:var(--cbg-line);overflow:hidden;margin:4px 0}
.cbg-prog i{display:block;height:100%;width:0;background:var(--cbg-ac);transition:width .15s}
.cbg-drop{border:2px dashed var(--cbg-ac);border-radius:14px;padding:22px 10px;text-align:center;margin:8px 0;background:var(--cbg-card)}
.cbg-drop.over{background:var(--cbg-line)}
.cbg-list{margin:6px 0;display:flex;flex-direction:column;gap:5px}
.cbg-item{display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--cbg-card);border:1px solid var(--cbg-line);border-radius:10px;padding:5px 9px}
.cbg-item .nm{flex:1;min-width:120px;word-break:break-all}
.cbg-item .tg{font-size:11px;border-radius:8px;padding:1px 7px;background:var(--cbg-ac);color:var(--cbg-acfg)}
.cbg-item .sub{font-size:12px;opacity:.75;width:100%}
.cbg-item a{color:var(--cbg-ac)}
#cbg-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(30px);opacity:0;pointer-events:none;background:var(--cbg-bg);color:var(--cbg-fg);border:2px solid var(--cbg-ac);border-radius:14px;padding:9px 16px;max-width:min(560px,92vw);font:14px/1.35 var(--cbg-font);z-index:2147483300;transition:all .2s;box-shadow:0 4px 18px rgba(0,0,0,.4)}
#cbg-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
#cbg-dropall{position:fixed;inset:0;background:rgba(232,160,176,.28);border:4px dashed var(--cbg-ac);display:none;align-items:center;justify-content:center;z-index:2147483250;font:700 26px var(--cbg-font);color:var(--cbg-fg);pointer-events:none;text-shadow:0 2px 6px #000}
#cbg-dropall.on{display:flex}
.cbg-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0}
.cbg-bar .cbg-tip{font-size:12px;opacity:.75}

.cbg-meter{display:none;flex:1 1 100%;flex-wrap:wrap;gap:4px 14px;align-items:center;font:12.5px/1.3 var(--cbg-font,inherit);padding:6px 10px;border:1px solid var(--cbg-line,rgba(128,128,128,.5));border-radius:10px;background:var(--cbg-card,transparent);color:var(--cbg-fg,inherit);max-width:100%}
.cbg-meter.on{display:flex}
.cbg-meter.nostats .cbg-mh,.cbg-meter.nostats .cbg-mrow,.cbg-meter.nostats .cbg-mn{display:none}
.cbg-now{font-weight:700}
.cbg-box .cbg-now{margin:4px 0;padding:6px 10px;border-radius:10px;background:var(--cbg-card);border:1px solid var(--cbg-ac)}
.cbg-meter .cbg-mt{flex:1 1 100%;font-weight:700}
.cbg-mrow{display:flex;align-items:center;gap:7px;flex:1 1 170px;min-width:150px;opacity:.6}
.cbg-mrow.hot{opacity:1;font-weight:700}
.cbg-mrow span.n{flex:0 0 62px}
.cbg-mrow span.tr{flex:1;height:9px;border-radius:5px;background:var(--cbg-line,rgba(128,128,128,.35));overflow:hidden}
.cbg-mrow span.tr i{display:block;height:100%;border-radius:5px;background:#9a8f8a;transition:width .3s}
.cbg-mrow.c span.tr i{background:var(--cbg-ac,currentColor)}
.cbg-mrow b{flex:0 0 54px;text-align:right;font-weight:inherit}
.cbg-meter .cbg-mn{flex:1 1 100%;opacity:.95}
.cbg-viz{margin:8px 0}
.cbg-viz canvas{width:100%;height:auto;display:block;border:1px solid var(--cbg-line);border-radius:10px;background:var(--cbg-card)}
.cbg-viz .cbg-vt{font-weight:700;font-size:13px;margin:8px 0 3px}
.cbg-viz .cbg-leg{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px;margin:5px 0 2px}
.cbg-viz .cbg-leg i{display:inline-block;width:18px;height:8px;border-radius:4px;margin-right:5px;vertical-align:middle}
.cbg-viz .cbg-nums{font-size:13px;margin:4px 0;line-height:1.45}
.cbg-viz .cbg-nums b{color:var(--cbg-ac)}
.cbg-rbox{text-align:center}
.cbg-rbox .cbg-rlogo{width:84px;height:84px;margin:0 auto 6px;display:block;border-radius:16px;overflow:hidden}
.cbg-rbox .cbg-rlogo img{width:100%;height:100%;object-fit:contain;display:block}
.cbg-rbox .cbg-rtext{font-size:16px;line-height:1.5;text-align:left;margin:10px 0 12px}
.cbg-foot{display:flex;gap:10px;align-items:flex-start;margin:14px auto 10px;padding:10px 12px;max-width:760px;border:1px solid var(--cbg-line,rgba(128,128,128,.45));border-radius:12px;background:var(--cbg-card,transparent);color:var(--cbg-fg,inherit);font:13px/1.5 var(--cbg-font,inherit);text-align:left}
.cbg-foot .cbg-flogo{flex:0 0 40px;width:40px;height:40px;border-radius:8px;overflow:hidden}
.cbg-foot .cbg-flogo img{width:100%;height:100%;object-fit:contain;display:block}
.cbg-foot b{display:block;margin-bottom:2px}
`;
  document.head.appendChild(st);
  rootEl=document.createElement('div');rootEl.id='cbg-root';document.body.appendChild(rootEl);
  applyTheme();
  return rootEl;
}
function applyTheme(){
  if(!rootEl)return;const t=cfg.theme||{};
  const map={bg:'--cbg-bg',fg:'--cbg-fg',ac:'--cbg-ac',acfg:'--cbg-acfg',line:'--cbg-line',card:'--cbg-card',font:'--cbg-font'};
  for(const k in map)if(t[k])rootEl.style.setProperty(map[k],t[k]);
}


/* theme variables copied onto elements that live in the app page, outside the overlay root */
function themed(el){
  const t=cfg.theme||{},map={bg:'--cbg-bg',fg:'--cbg-fg',ac:'--cbg-ac',acfg:'--cbg-acfg',line:'--cbg-line',card:'--cbg-card',font:'--cbg-font'};
  for(const k in map)if(t[k])el.style.setProperty(map[k],t[k]);return el;
}

/* ---------- audio helpers ---------- */
let ownCtx=null;
function ac(){
  let c=null;try{c=cfg.getCtx&&cfg.getCtx()}catch(e){}
  if(c&&c.decodeAudioData)return c;
  if(!ownCtx)ownCtx=new (window.AudioContext||window.webkitAudioContext)();
  return ownCtx;
}
function playCtx(){
  if(!CBG._pctx){CBG._pctx=new (window.AudioContext||window.webkitAudioContext)();try{CBG._pctx.addEventListener('statechange',()=>{if(PL.playing&&CBG._pctx.state!=='running'&&CBG._pctx.state!=='closed'){CBG.resumes++;CBG._pctx.resume().catch(()=>{})}})}catch(e){}}
  if(CBG._pctx.state==='suspended')CBG._pctx.resume();
  return CBG._pctx;
}
function wavBlob(b,maxSec){
  const ch=b.numberOfChannels,sr=b.sampleRate,n=maxSec?Math.min(b.length,Math.floor(maxSec*sr)):b.length,ab=new ArrayBuffer(44+n*ch*2),v=new DataView(ab);
  const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};
  ws(0,'RIFF');v.setUint32(4,36+n*ch*2,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*ch*2,true);
  const d=[];for(let c=0;c<ch;c++)d.push(b.getChannelData(c));let o=44;
  for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const s=Math.max(-1,Math.min(1,d[c][i]));v.setInt16(o,s<0?s*0x8000:s*0x7fff,true);o+=2}
  return new Blob([ab],{type:'audio/wav'});
}
CBG.wavBlob=wavBlob;
function download(blob,name){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
}
function rngMaker(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

/* ---------- FFT ---------- */
const FFTC={};
function getFFT(N){
  if(FFTC[N])return FFTC[N];
  const rev=new Uint32Array(N),cs=new Float32Array(N/2),sn=new Float32Array(N/2);let bits=Math.log2(N);
  for(let i=0;i<N;i++){let r=0;for(let b=0;b<bits;b++)if(i&(1<<b))r|=1<<(bits-1-b);rev[i]=r}
  for(let i=0;i<N/2;i++){cs[i]=Math.cos(2*Math.PI*i/N);sn[i]=Math.sin(2*Math.PI*i/N)}
  const f=function(re,im){
    for(let i=0;i<N;i++){const j=rev[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
    for(let size=2;size<=N;size<<=1){const half=size>>1,step=N/size;
      for(let i=0;i<N;i+=size){for(let j=0,k=0;j<half;j++,k+=step){const wr=cs[k],wi=-sn[k],a=i+j,b=a+half;const xr=re[b]*wr-im[b]*wi,xi=re[b]*wi+im[b]*wr;re[b]=re[a]-xr;im[b]=im[a]-xi;re[a]+=xr;im[a]+=xi}}}
  };
  return FFTC[N]=f;
}

/* ---------- de-crackle ---------- */
function decrackle(d,a){
  const len=d.length;if(len<64)return 0;
  const k=14-8*a;let s=0;const m0=Math.min(len-2,16384);
  for(let i=1;i<m0;i++)s+=Math.abs(d[i+1]-2*d[i]+d[i-1]);s=s/m0;
  const flag=new Uint8Array(len);let hits=0;
  for(let i=1;i<len-1;i++){
    const e=Math.abs(d[i+1]-2*d[i]+d[i-1]),thr=Math.max(k*s,0.05);
    if(e>thr){flag[i-1]=flag[i]=flag[i+1]=1;s+=(e-s)*0.0001}else s+=(e-s)*0.002;
  }
  let fixed=0,i=0;
  while(i<len){
    if(!flag[i]){i++;continue}
    let st=i,en=i;
    while(en+1<len&&(flag[en+1]||(en+2<len&&flag[en+2])||(en+3<len&&flag[en+3])))en++;
    while(en>st&&!flag[en])en--;
    const L=en-st+1;
    if(L<=36&&st>0&&en<len-1){
      const x0=d[st-1],x1=d[en+1];let dev=0;
      for(let j=0;j<L;j++)dev=Math.max(dev,Math.abs(d[st+j]-(x0+(x1-x0)*(j+1)/(L+1))));
      // a real pop sticks out and comes back; a step or a saw edge changes level and stays, so it is left alone
      if(dev>=0.05&&dev>=3*Math.abs(x1-x0)){
        for(let j=0;j<L;j++)d[st+j]=x0+(x1-x0)*(j+1)/(L+1);
        fixed++;
      }
    }
    i=en+1;
  }
  return fixed;
}

/* ---------- spectral gate (noise reduction) ---------- */
// tuned on the built-in sample against its known clean version: gaps fall about 20 dB while the highs stay within about 1.5 dB
CBG.tune={aBase:1.3,aSlope:1.5,fBase:8,fSlope:28,nMul:1.35,power:true,sm:4,dn:0.3,up:1.0};
async function gateChannel(d,a,token,prog){
  const N=2048,H=1024,len=d.length,fft=getFFT(N),w=new Float32Array(N);
  for(let i=0;i<N;i++)w[i]=Math.sin(Math.PI*i/N);
  const TU=CBG.tune,alpha=TU.aBase+TU.aSlope*a,floor=Math.pow(10,-(TU.fBase+TU.fSlope*a)/20);
  const nFr=Math.ceil((len+H)/H),starts=[];for(let f=0;f<nFr;f++)starts.push(-H+f*H);
  // quietest frames by RMS give the noise profile
  const rms=new Float32Array(nFr);
  for(let f=0;f<nFr;f++){let s=0,c=0;const st=starts[f];for(let i=0;i<N;i+=2){const x=st+i;if(x>=0&&x<len){s+=d[x]*d[x];c++}}rms[f]=c?Math.sqrt(s/c):1}
  const idx=[];for(let f=0;f<nFr;f++){const st=starts[f];if(st>=0&&st+N<=len)idx.push(f)}
  if(!idx.length)for(let f=0;f<nFr;f++)idx.push(f);
  idx.sort((p,q)=>rms[p]-rms[q]);
  let use=idx.slice(0,Math.max(3,Math.floor(idx.length*0.15)));
  if(use.length>240){const step=use.length/240,u2=[];for(let i=0;i<240;i++)u2.push(use[Math.floor(i*step)]);use=u2}
  const K=N/2+1,noise=new Float32Array(K),re=new Float32Array(N),im=new Float32Array(N);
  const mg=[];
  for(const f of use){const st=starts[f];for(let i=0;i<N;i++){const x=st+i;re[i]=(x>=0&&x<len?d[x]:0)*w[i];im[i]=0}fft(re,im);const m=new Float32Array(K);for(let k=0;k<K;k++)m[k]=Math.hypot(re[k],im[k]);mg.push(m)}
  // per-bin 40th percentile, so a few frames with music in them do not poison the noise profile
  const col=new Float32Array(mg.length),qi=Math.floor(mg.length*0.4);
  for(let k=0;k<K;k++){for(let j=0;j<mg.length;j++)col[j]=mg[j][k];col.sort();noise[k]=col[qi]*TU.nMul}
  const ns=new Float32Array(K);for(let k=0;k<K;k++){let s=0,c=0;for(let j=-3;j<=3;j++){const q=k+j;if(q>=0&&q<K){s+=noise[q];c++}}ns[k]=s/c}
  const out=new Float32Array(len),prev=new Float32Array(K).fill(1),G=new Float32Array(K),G2=new Float32Array(K),PW=new Float32Array(K),PS=new Float32Array(K);
  for(let f=0;f<nFr;f++){
    if(token.cancel)throw new Error('cancelled');
    const st=starts[f];
    for(let i=0;i<N;i++){const x=st+i;re[i]=(x>=0&&x<len?d[x]:0)*w[i];im[i]=0}
    fft(re,im);
    if(TU.sm){for(let k=0;k<K;k++)PW[k]=re[k]*re[k]+im[k]*im[k];const h=TU.sm;for(let k=0;k<K;k++){let sp=0,c=0;for(let j=-h;j<=h;j++){const q=k+j;if(q>=0&&q<K){sp+=PW[q];c++}}PS[k]=sp/c}}
    for(let k=0;k<K;k++){const m=TU.sm?Math.sqrt(PS[k]):Math.hypot(re[k],im[k]),q=ns[k]/(m+1e-12);G[k]=TU.power?Math.max(floor,Math.sqrt(Math.max(0,1-alpha*q*q))):Math.max(floor,1-alpha*q)}
    for(let k=0;k<K;k++){const l=G[k>0?k-1:0],r=G[k<K-1?k+1:K-1];G2[k]=0.25*l+0.5*G[k]+0.25*r}
    for(let k=0;k<K;k++){const g=G2[k],p=prev[k],o=g<p?g*TU.dn+p*(1-TU.dn):g*TU.up+p*(1-TU.up);prev[k]=o;re[k]*=o;im[k]*=o;if(k>0&&k<N/2){re[N-k]=re[k];im[N-k]=-im[k]}}
    // inverse via swapped forward transform
    fft(im,re);
    for(let i=0;i<N;i++){const x=st+i;if(x>=0&&x<len)out[x]+=re[i]*w[i]/N}
    if((f&63)===0){prog(f/nFr);await sleep(0)}
  }
  return out;
}
function quietRms(d){
  const B=2048,n=Math.floor(d.length/B);if(n<2)return 0;const r=[];
  for(let b=0;b<n;b++){let s=0;for(let i=b*B;i<(b+1)*B;i++)s+=d[i]*d[i];r.push(Math.sqrt(s/B))}
  r.sort((a,b)=>a-b);const m=Math.max(1,Math.floor(n*0.08));let s=0;for(let i=0;i<m;i++)s+=r[i];return s/m;
}
const dB=x=>20*Math.log10(x+1e-9);

CBG.clean=async function(buf,opt,progress,token){
  opt=Object.assign({amount:60,hiss:true,crackle:true,soften:false},opt||{});token=token||{};progress=progress||(()=>{});
  const a=Math.max(0,Math.min(1,opt.amount/100)),ch=buf.numberOfChannels,sr=buf.sampleRate,len=buf.length;
  const out=newBuf(ch,len,sr);let clicks=0,before=0,after=0;
  if(a<=0||(!opt.hiss&&!opt.crackle&&!opt.soften)){
    for(let c=0;c<ch;c++)out.copyToChannel(buf.getChannelData(c).slice(),c);
    return{buffer:out,stats:{clicks:0,hissDb:0,amount:opt.amount}};
  }
  for(let c=0;c<ch;c++){
    let d=buf.getChannelData(c).slice();before+=quietRms(d)/ch;
    if(opt.crackle)clicks+=decrackle(d,a);
    if(opt.hiss)d=await gateChannel(d,a,token,p=>progress((c+p*0.9)/ch*0.9));
    out.copyToChannel(d,c);
    progress((c+1)/ch*0.9);await sleep(0);
  }
  let res=out;
  if(opt.soften){
    const oc=new OfflineAudioContext(ch,len,sr),src=oc.createBufferSource();src.buffer=out;
    const hs=oc.createBiquadFilter();hs.type='highshelf';hs.frequency.value=9000;hs.gain.value=-3*a;
    const lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(sr/2-100,20000-2000*a);lp.Q.value=0.6;
    src.connect(hs);hs.connect(lp);lp.connect(oc.destination);src.start();
    res=await oc.startRendering();
  }
  for(let c=0;c<ch;c++)after+=quietRms(res.getChannelData(c))/ch;
  progress(1);
  const stats={clicks,beforeDb:dB(before),afterDb:dB(after),hissDb:dB(before)-dB(after),amount:opt.amount};
  try{stats.specBefore=Array.from(CBG.spectrum(buf));stats.specAfter=Array.from(CBG.spectrum(res));const q=CBG.quietSpectra(buf,res);if(q){stats.qBefore=q.before;stats.qAfter=q.after}}catch(e){}
  CBG.lastStats=stats;
  return{buffer:res,stats};
};

/* ---------- built-in sample sound: a warm little tune, played on a worn tape ---------- */
let sampleBuf=null,sampleRef=null;
CBG.sampleRef=function(){return sampleRef};
let samplePromise=null;
CBG.makeSample=function(){
  if(sampleBuf)return Promise.resolve(sampleBuf);
  if(!samplePromise)samplePromise=makeSampleNow().catch(e=>{samplePromise=null;throw e});
  return samplePromise;
};
async function makeSampleNow(){
  if(sampleBuf)return sampleBuf;
  const sr=44100,bpm=112,beat=60/bpm,bar=beat*4,lead=0.9,bars=8,tail=1.2,total=lead+bar*bars+tail;
  const oc=new OfflineAudioContext(2,Math.ceil(total*sr),sr);
  const rnd=rngMaker(20261023);
  const gauss=()=>{let u=0,v=0;while(!u)u=rnd();v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  // gentle bus compressor so the tune sounds glued together, then a room reverb for warmth
  const comp=oc.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=14;comp.ratio.value=2.5;comp.attack.value=0.012;comp.release.value=0.28;
  const outG=oc.createGain();outG.gain.value=1;comp.connect(outG);outG.connect(oc.destination);
  const dry=oc.createGain();dry.gain.value=1;dry.connect(comp);
  const conv=oc.createConvolver(),irLen=Math.floor(sr*1.9),ir=oc.createBuffer(2,irLen,sr);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);let y=0;for(let i=0;i<irLen;i++){const t=i/sr,k=0.85-0.72*Math.min(1,t/1.6);y+=(gauss()-y)*k;d[i]=y*Math.exp(-t*3.4)*(i<sr*0.012?i/(sr*0.012):1)}}
  conv.buffer=ir;const wetG=oc.createGain();wetG.gain.value=0.16;conv.connect(wetG);wetG.connect(comp);
  const send=oc.createGain();send.gain.value=1;send.connect(conv);
  const bus=(pan,snd)=>{const p=oc.createStereoPanner();p.pan.value=pan;p.connect(dry);if(snd>0){const s=oc.createGain();s.gain.value=snd;p.connect(s);s.connect(send)}return p};
  const env=(g,t,a,pk,dec,rel)=>{g.gain.setValueAtTime(0.00001,t);g.gain.linearRampToValueAtTime(pk,t+a);g.gain.setTargetAtTime(0.00001,t+a,dec/4.6)};
  const chords=[[48,52,55,59],[45,52,55,60],[53,57,60,64],[55,59,62,64]];
  const roots=[36,33,41,43];
  const T=(b,beats)=>lead+b*bar+beats*beat;
  for(let b=0;b<bars;b++){
    const ch=chords[b%4],t0=T(b,0);
    // warm pad: three slightly detuned saws per note through a soft low-pass, swelling in and out
    ch.forEach((m,j)=>{
      [-7,0,7].forEach((cents,k)=>{
        const o=oc.createOscillator(),g=oc.createGain(),f=oc.createBiquadFilter();
        o.type='sawtooth';o.frequency.value=mtof(m+12*(j>=2?0:0));o.detune.value=cents;f.type='lowpass';f.frequency.value=1400+j*150;f.Q.value=0.4;
        g.gain.setValueAtTime(0.00001,t0);g.gain.linearRampToValueAtTime(0.020,t0+0.6);g.gain.setValueAtTime(0.020,t0+bar-0.5);g.gain.linearRampToValueAtTime(0.00001,t0+bar+0.25);
        o.connect(f);f.connect(g);g.connect(bus((j-1.5)*0.35+(k-1)*0.1,0.5));o.start(t0);o.stop(t0+bar+0.3);
      });
    });
    // electric piano comping: soft FM tines, eighth notes with a gentle lilt
    const pat=[0,2,3,2,1,3,2,3],vel=[1,.55,.8,.55,.9,.55,.8,.6];
    for(let s=0;s<8;s++){
      const t=t0+s*beat/2+(s%2?0.012:0),f0=mtof(ch[pat[s]]+12),v=0.085*vel[s];
      const car=oc.createOscillator(),mod=oc.createOscillator(),mg=oc.createGain(),g=oc.createGain(),tine=oc.createOscillator(),tg=oc.createGain();
      car.type='sine';car.frequency.value=f0;mod.type='sine';mod.frequency.value=f0;
      mg.gain.setValueAtTime(f0*1.6,t);mg.gain.setTargetAtTime(f0*0.12,t,0.18);mod.connect(mg);mg.connect(car.frequency);
      env(g,t,0.004,v,1.1);car.connect(g);
      tine.type='sine';tine.frequency.value=f0*7.02;tg.gain.setValueAtTime(v*0.4,t);tg.gain.setTargetAtTime(0.00001,t,0.025);tine.connect(tg);tg.connect(g);
      g.connect(bus((s%2?0.28:-0.28),0.55));[car,mod,tine].forEach(o=>{o.start(t);o.stop(t+1.4)});
    }
    // bass: round and warm, root on the one, a lift on the and of two
    [[0,1.4,roots[b%4]],[2,1.2,roots[b%4]],[3.5,0.5,roots[b%4]+7]].forEach(([bt,dur,m],k)=>{
      const t=T(b,bt),o=oc.createOscillator(),o2=oc.createOscillator(),g=oc.createGain(),f=oc.createBiquadFilter();
      o.type='sine';o.frequency.value=mtof(m);o2.type='triangle';o2.frequency.value=mtof(m);f.type='lowpass';f.frequency.value=420;
      const g2=oc.createGain();g2.gain.value=0.35;o2.connect(g2);g2.connect(f);o.connect(f);f.connect(g);
      env(g,t,0.012,k===2?0.17:0.32,dur*beat);g.connect(bus(0,0));o.start(t);o2.start(t);o.stop(t+dur*beat*1.6+0.2);o2.stop(t+dur*beat*1.6+0.2);
    });
    // soft kick on one and three, quiet brushed shaker on the eighths
    [0,2].forEach(bt=>{const t=T(b,bt),o=oc.createOscillator(),g=oc.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(48,t+0.14);env(g,t,0.003,0.2,0.22);o.connect(g);g.connect(bus(0,0));o.start(t);o.stop(t+0.4)});
  }
  // shaker: shared noise, high-passed, so there is real air in the top end
  {
    const nb=oc.createBuffer(1,sr,sr),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=gauss();
    for(let b=0;b<bars;b++)for(let s=0;s<8;s++){
      const t=T(b,s*0.5),src=oc.createBufferSource(),g=oc.createGain(),hp=oc.createBiquadFilter(),bp=oc.createBiquadFilter();
      src.buffer=nb;hp.type='highpass';hp.frequency.value=5200;bp.type='peaking';bp.frequency.value=9500;bp.gain.value=5;bp.Q.value=0.7;
      const v=(s%2?0.15:0.09)*(b<2?0.6:1);g.gain.setValueAtTime(0.00001,t);g.gain.linearRampToValueAtTime(v,t+0.006);g.gain.setTargetAtTime(0.00001,t+0.006,0.028);
      src.connect(hp);hp.connect(bp);bp.connect(g);g.connect(bus(s%2?0.35:-0.2,0.2));src.start(t,rnd()*0.8);src.stop(t+0.25);
    }
  }
  // melody: a mellow plucked guitar sound with a touch of vibrato, entering in bar two
  const mel=[[1,0,69,1],[1,1,72,1],[1,2,76,1.5],[1,3.5,74,.5],[2,0,72,1.5],[2,1.5,69,.5],[2,2,69,2],[3,0,71,1],[3,1,74,1],[3,2,71,1],[3,3,67,1],
    [4,0,79,1.5],[4,1.5,76,.5],[4,2,72,1],[4,3,76,1],[5,0,76,1],[5,1,72,1],[5,2,69,1],[5,3,72,1],[6,0,77,1],[6,1,76,.5],[6,1.5,72,.5],[6,2,69,2],[7,0,74,1],[7,1,71,1],[7,2,67,2]];
  mel.forEach(([b,bt,m,d])=>{
    const t=T(b,bt),f0=mtof(m),dur=d*beat;
    [['sawtooth',0.065,0],['triangle',0.065,3]].forEach(([type,v,dt])=>{
      const o=oc.createOscillator(),g=oc.createGain(),f=oc.createBiquadFilter(),lfo=oc.createOscillator(),lg=oc.createGain();
      o.type=type;o.frequency.value=f0;o.detune.value=dt;
      lfo.frequency.value=5.1;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(7,t+dur*0.7);lfo.connect(lg);lg.connect(o.detune);
      f.type='lowpass';f.Q.value=0.8;f.frequency.setValueAtTime(7500,t);f.frequency.setTargetAtTime(1900,t,0.2);
      g.gain.setValueAtTime(0.00001,t);g.gain.linearRampToValueAtTime(v,t+0.008);g.gain.setTargetAtTime(v*0.35,t+0.01,0.35);g.gain.setTargetAtTime(0.00001,t+Math.max(0.1,dur-0.04),0.12);
      o.connect(f);f.connect(g);g.connect(bus(0.12,0.42));o.start(t);lfo.start(t);o.stop(t+dur+0.9);lfo.stop(t+dur+0.9);
    });
  });
  // little bell sparkle on the first beat of bars one, three, five and seven (real high frequencies to protect)
  [[0,84],[2,81],[4,88],[6,84]].forEach(([b,m])=>{
    const t=T(b,0)+0.02,f0=mtof(m);
    [[1,0.05,1.6],[2.76,0.04,1.1],[5.4,0.03,0.7]].forEach(([r,v,dec])=>{
      const o=oc.createOscillator(),g=oc.createGain();o.type='sine';o.frequency.value=f0*r;
      g.gain.setValueAtTime(0.00001,t);g.gain.linearRampToValueAtTime(v,t+0.002);g.gain.setTargetAtTime(0.00001,t+0.002,dec/4.6);o.connect(g);g.connect(bus(0.5,0.6));o.start(t);o.stop(t+dec*1.6+0.2);
    });
  });
  const clean=await oc.startRendering();
  // normalise the clean tune, then keep it as the reference for measuring
  let pk=0;for(let c=0;c<2;c++){const d=clean.getChannelData(c);for(let i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]))}
  const sc=0.8/(pk||1);for(let c=0;c<2;c++){const d=clean.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=sc}
  sampleRef=clean;
  const buf=newBuf(2,clean.length,sr);
  // wear it in: tape hiss (bright, slowly breathing), a low noise floor with mains hum, and dusty crackle. Fixed seed so it always sounds the same.
  for(let c=0;c<2;c++){
    const d=buf.getChannelData(c),src=clean.getChannelData(c);let px=0,py=0,rum=0;
    for(let i=0;i<d.length;i++){
      const t=i/sr,w1=gauss(),x=w1*0.0105;py=0.90*(py+x-px);px=x;               // bright hiss
      const breathe=1+0.18*Math.sin(2*Math.PI*0.27*t+c);
      rum+=(gauss()*0.012-rum)*0.012;                                              // low room and circuit floor
      const hum=0.0016*Math.sin(2*Math.PI*50*t)+0.0007*Math.sin(2*Math.PI*100*t+1)+0.0004*Math.sin(2*Math.PI*150*t+2);
      d[i]=src[i]+py*1.6*breathe+w1*0.0035+rum+hum;
    }
    const pops=Math.floor(total*6.5);
    for(let p=0;p<pops;p++){
      const at=Math.floor(rnd()*(d.length-16)),big=rnd()<0.22,amp=(big?0.28+rnd()*0.28:0.07+rnd()*0.12)*(rnd()<0.5?-1:1),w=1+Math.floor(rnd()*3);
      for(let j=0;j<w;j++)d[at+j]+=amp*(j?0.45:1);
      d[at+w]-=amp*0.25;d[at+w+1]-=amp*0.1;
    }
    for(let p=0;p<Math.floor(total*40);p++){const at=Math.floor(rnd()*(d.length-4));d[at]+=(rnd()-0.5)*0.05}  // fine dust
  }
  pk=0;for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]))}
  CBG._grainPeak=pk;
  if(pk>0.95){const k=0.95/pk;for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=k;const r=clean.getChannelData(c);for(let i=0;i<r.length;i++)r[i]*=k}}
  CBG.sampleLead=lead;CBG.sampleTail=tail;
  sampleBuf=buf;return buf;
}

/* ---------- measuring: spectrum bars and numbers shown to the user, also used by the self tests ---------- */
const SP_N=2048,SP_LO=60,SP_HI=16000,SP_BANDS=56;
function monoOf(b,a,z){const n=Math.max(0,z-a),o=new Float32Array(n),ch=b.numberOfChannels;for(let c=0;c<ch;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)o[i]+=d[a+i]/ch}return o}
// average power per bin over a stretch of mono samples
function avgPower(m,only){
  const fft=getFFT(SP_N),K=SP_N/2+1,pw=new Float64Array(K),re=new Float32Array(SP_N),im=new Float32Array(SP_N),w=new Float32Array(SP_N);
  for(let i=0;i<SP_N;i++)w[i]=0.5-0.5*Math.cos(2*Math.PI*i/SP_N);
  let cnt=0;const hop=SP_N,list=only||(()=>{const a=[];for(let st=0;st+SP_N<=m.length;st+=hop)a.push(st);return a})();
  for(const st of list){for(let i=0;i<SP_N;i++){re[i]=m[st+i]*w[i];im[i]=0}fft(re,im);for(let k=0;k<K;k++)pw[k]+=re[k]*re[k]+im[k]*im[k];cnt++}
  if(cnt)for(let k=0;k<K;k++)pw[k]/=cnt;
  return pw;
}
function bandsOf(pw,sr){
  const K=pw.length,out=new Float32Array(SP_BANDS),hz=sr/SP_N;
  for(let b=0;b<SP_BANDS;b++){
    const f1=SP_LO*Math.pow(SP_HI/SP_LO,b/SP_BANDS),f2=SP_LO*Math.pow(SP_HI/SP_LO,(b+1)/SP_BANDS);
    let k1=Math.max(1,Math.floor(f1/hz)),k2=Math.min(K-1,Math.max(k1,Math.floor(f2/hz)));let s=0,c=0;
    for(let k=k1;k<=k2;k++){s+=pw[k];c++}
    out[b]=10*Math.log10(s/Math.max(1,c)/(SP_N*SP_N/4)+1e-14);
  }
  return out;
}
function powIn(pw,sr,f1,f2){const hz=sr/SP_N;let s=0;for(let k=Math.max(1,Math.floor(f1/hz));k<=Math.min(pw.length-1,Math.floor(f2/hz));k++)s+=pw[k];return s}
// spectrum of the quietest stretches of a sound, picked on the original, so the noise floor can be drawn before and after
CBG.quietSpectra=function(a,b){
  const ma=monoOf(a,0,a.length),mb=monoOf(b,0,b.length),n=Math.floor(ma.length/SP_N);if(n<4)return null;
  const r=[];for(let i=0;i<n;i++){let q=0;for(let j=i*SP_N;j<(i+1)*SP_N;j++)q+=ma[j]*ma[j];r.push([q,i*SP_N])}
  r.sort((x,y)=>x[0]-y[0]);const pick=r.slice(0,Math.max(3,Math.floor(n*0.08))).map(x=>x[1]);
  return{before:Array.from(bandsOf(avgPower(ma,pick),a.sampleRate)),after:Array.from(bandsOf(avgPower(mb,pick),a.sampleRate))};
};
CBG.spectrum=function(buf){const sr=buf.sampleRate;return bandsOf(avgPower(monoOf(buf,0,buf.length)),sr)};
const rmsOf=(m)=>{let s=0;for(let i=0;i<m.length;i++)s+=m[i]*m[i];return Math.sqrt(s/Math.max(1,m.length))};
// numbers for the self test and the sample panel: ref is the true clean tune, noisy the grainy one, cleaned the output
CBG.measure=function(ref,noisy,cleaned){
  const sr=noisy.sampleRate,lead=CBG.sampleLead||1,tail=CBG.sampleTail||1,n=noisy.length;
  const a0=Math.floor(sr*0.1),a1=Math.floor(sr*(lead-0.1)),b0=n-Math.floor(sr*(tail-0.2)),b1=n-Math.floor(sr*0.1);
  const m0=Math.floor(sr*(lead+0.1)),m1=n-Math.floor(sr*tail);
  const R={};
  const nl=[monoOf(noisy,a0,a1),monoOf(cleaned,a0,a1)],nt=[monoOf(noisy,b0,b1),monoOf(cleaned,b0,b1)];
  R.leadNoiseBeforeDb=20*Math.log10(rmsOf(nl[0])+1e-9);R.leadNoiseAfterDb=20*Math.log10(rmsOf(nl[1])+1e-9);R.leadReductionDb=R.leadNoiseBeforeDb-R.leadNoiseAfterDb;
  R.tailReductionDb=20*Math.log10(rmsOf(nt[0])/(rmsOf(nt[1])+1e-9));
  const X=[monoOf(ref,m0,m1),monoOf(noisy,m0,m1),monoOf(cleaned,m0,m1)];
  const err=(x)=>{const e=new Float32Array(x.length);for(let i=0;i<x.length;i++)e[i]=x[i]-X[0][i];return e};
  const sig=rmsOf(X[0]);R.musicRmsDb=20*Math.log10(sig);
  R.snrBeforeDb=20*Math.log10(sig/rmsOf(err(X[1])));R.snrAfterDb=20*Math.log10(sig/rmsOf(err(X[2])));R.snrGainDb=R.snrAfterDb-R.snrBeforeDb;
  const P=X.map(x=>avgPower(x));
  const band=(f1,f2)=>{const r=powIn(P[0],sr,f1,f2),q=powIn(P[1],sr,f1,f2),c=powIn(P[2],sr,f1,f2);return{noisyVsRefDb:10*Math.log10(q/r),cleanedVsRefDb:10*Math.log10(c/r)}};
  R.low=band(60,250);R.mid=band(250,2000);R.presence=band(2000,4000);R.high=band(4000,12000);R.air=band(8000,16000);
  // high band error (how close the cleaned highs are to the true highs, noise included)
  const hiErr=(x)=>{const e=err(x),p=avgPower(e);return 10*Math.log10(powIn(P[0],sr,4000,12000)/powIn(p,sr,4000,12000))};
  R.highSnrBeforeDb=hiErr(X[1]);R.highSnrAfterDb=hiErr(X[2]);
  return R;
};

/* ---------- A/B player ---------- */
const PL=CBG.PL={name:'',orig:null,clean:null,mode:'orig',playing:false,src:'sample',stats:null,srcName:'',token:null};
let plNodes=null,plStart=0,plRaf=0;
function plPos(){const b=PL.orig;if(!b)return 0;if(!PL.playing)return PL.offset||0;const t=CBG._pctx.currentTime-plStart;return b.duration?t%b.duration:0}
CBG.stopLog=[];CBG.endedEarly=0;CBG.resumes=0;
function mkSrc(buf,gain,off){
  const c=playCtx(),s=c.createBufferSource();s.buffer=buf;s.loop=true;s.onended=()=>{if(!s._cbgStop)CBG.endedEarly++};const g=c.createGain();g.gain.value=gain;s.connect(g);g.connect(c.destination);s.start(0,off);return{s,g};
}
function stopNodes(){if(plNodes){for(const k of['o','c']){const n=plNodes[k];if(n){n.s._cbgStop=1;try{n.s.stop()}catch(e){}try{n.s.disconnect();n.g.disconnect()}catch(e){}}}plNodes=null}}
CBG.play=function(off){
  if(!PL.orig){toast('Pick a sound first.');return}
  const was=PL.playing;if(off==null)off=was?plPos():(PL.offset||0);
  stopNodes();const c=playCtx();
  plNodes={o:mkSrc(PL.orig,PL.mode==='orig'?1:0,off),c:PL.clean?mkSrc(PL.clean,PL.mode==='clean'?1:0,off):null};
  plStart=c.currentTime-off;PL.playing=true;refreshUI();tick();watchdog();
};
CBG.stop=function(why){try{CBG.stopLog.push([Math.round(performance.now()),why||(new Error().stack.split('\n')[2]||'').trim().slice(0,90)])}catch(e){}stopDiff();PL.offset=PL.playing?plPos():PL.offset;stopNodes();PL.playing=false;cancelAnimationFrame(plRaf);refreshUI()};
CBG.setMode=function(m){
  if(m==='clean'&&!PL.clean){toast('Still cleaning, one moment.');return}
  PL.mode=m;
  if(plNodes){const c=playCtx(),t=c.currentTime;if(plNodes.o)plNodes.o.g.gain.setTargetAtTime(m==='orig'?1:0,t,0.012);if(plNodes.c)plNodes.c.g.gain.setTargetAtTime(m==='clean'?1:0,t,0.012)}
  refreshUI();
};
CBG.toggleAB=function(){stopDiff();CBG.setMode(PL.mode==='orig'?'clean':'orig')};
// keeps the sound going: if the browser pauses the audio engine while the sample is playing, wake it up again
let wdT=0;
function watchdog(){
  clearInterval(wdT);
  wdT=setInterval(()=>{
    if(!PL.playing){clearInterval(wdT);return}
    const c=CBG._pctx;
    if(c&&c.state!=='running'&&c.state!=='closed'){CBG.resumes++;c.resume().catch(()=>{});if(!CBG._wdNote){CBG._wdNote=1;toast('The browser paused the sound, so it was woken up again. If it stays quiet, press Play sample sound once more.',6000)}}
  },700);
}
/* ---------- Hear the difference: 6 seconds of the original, then 6 seconds of the cleaned sound, no restart ---------- */
const DIFF_SEC=6;let diff=null;
function stopDiff(){if(diff){clearInterval(diff.i);diff=null}updateLabels()}
CBG._busy='';
function nowText(){
  if(CBG._busy)return CBG._busy;
  if(diff)return diff.text;
  return'Now playing: '+(PL.mode==='orig'?'Original (grainy)':'Cleaned (clearer)');
}
function updateLabels(){
  const on=PL.playing||!!CBG._busy;
  document.querySelectorAll('.cbg-now').forEach(e=>{e.textContent=on?nowText():'';e.dataset.which=PL.mode;e.style.display=on?'':'none'});
}
CBG.hearDifference=async function(o){
  o=o||{};try{playCtx().resume()}catch(e){}
  if(diff){stopDiff()}
  if(!o.current){
    // sample: start the music right away (the original), cleaning happens while it plays
    if(!(PL.playing&&PL.src==='sample'))await CBG.playSample({offset:CBG.sampleLead||0,force:true});
    else{CBG.setMode('orig');CBG.play(CBG.sampleLead||0)}
  }else{
    if(!PL.orig){toast('Pick a sound first.');return false}
    CBG.setMode('orig');CBG.play(0);
  }
  const d=diff={phase:1,t0:performance.now(),text:''};
  const step=()=>{
    if(diff!==d)return;
    const el=(performance.now()-d.t0)/1000;
    if(d.phase===1){
      const left=Math.max(0,Math.ceil(DIFF_SEC-el));d.text='Now playing: Original (grainy), '+left+' s, then it switches to Cleaned';
      if(el>=DIFF_SEC){
        if(!PL.clean){d.text='Now playing: Original (grainy). Getting the cleaned sound ready ...'}
        else{CBG.setMode('clean');d.phase=2;d.t0=performance.now()}
      }
    }else if(d.phase===2){
      const left=Math.max(0,Math.ceil(DIFF_SEC-el));d.text='Now playing: Cleaned (clearer), '+left+' s left';
      if(el>=DIFF_SEC){d.phase=3}
    }
    if(d.phase===3){d.text='Now playing: Cleaned (clearer). It keeps playing. Use the Hearing button to switch back.';clearInterval(d.i);diff=null;updateLabels();return}
    updateLabels();
  };
  d.i=setInterval(step,200);step();
  return true;
};
CBG.diffState=()=>diff?{phase:diff.phase,text:diff.text}:null;

function tick(){
  cancelAnimationFrame(plRaf);if(!PL.playing)return;
  const seek=$('#cbg-seek'),tm=$('#cbg-time');
  if(seek&&PL.orig&&!seek._drag){seek.value=Math.round(plPos()/PL.orig.duration*1000)}
  if(tm&&PL.orig)tm.textContent=fmtT(plPos())+' / '+fmtT(PL.orig.duration);
  plRaf=requestAnimationFrame(tick);
}
function refreshUI(){
  const sampleOn=PL.playing&&PL.src==='sample';
  document.querySelectorAll('.cbg-sample-btn').forEach(b=>{b.textContent=sampleOn?'Stop sample sound':'Play sample sound'});
  document.querySelectorAll('.cbg-ab-btn').forEach(b=>{b.style.display=sampleOn?'':'none';b.textContent=PL.mode==='orig'?'Hearing Original (tap for Cleaned)':'Hearing Cleaned (tap for Original)';b.setAttribute('aria-pressed',PL.mode==='clean');b.disabled=!PL.clean;b.title=PL.clean?'Switch between the grainy original and the cleaned sound':'The cleaned sound is being made, one moment'});
  document.querySelectorAll('.cbg-tip').forEach(b=>{b.style.display=sampleOn?'':'none'});
  const pb=$('#cbg-play');if(pb)pb.textContent=PL.playing?'Pause':'Play';
  const ab=$('#cbg-ab');if(ab){ab.textContent=PL.mode==='orig'?'Hearing: Original (grainy)':'Hearing: Cleaned (clearer)';ab.disabled=!PL.clean}
  const dlb=$('#cbg-dl');if(dlb)dlb.disabled=!PL.clean;const ad=$('#cbg-add');if(ad)ad.disabled=!PL.clean||!cfg.addAudio;
  if(document.body)document.body.dataset.cbgHearing=PL.mode;
  updateMeters();
}


/* ---------- rights notice ---------- */
CBG.rightsText="Coffeebreak keeps all rights to its products, designs, apps, name and logo. Buyers may resell physical products they bought, but may not copy them or make their own versions. Coffeebreak claims no ownership of third-party brands named here, which belong to their owners, and is not affiliated with or endorsed by them.";
const MARK_SVG=`<svg width="100%" height="100%" viewBox="0 0 64 64" aria-label="Coffeebreak logo"><ellipse cx="30" cy="56" rx="24" ry="5" fill="#7a4b32"/><path d="M10 24h40l-4 26a6 6 0 0 1-6 5H20a6 6 0 0 1-6-5z" fill="#f4e6d4" stroke="#1b1214" stroke-width="2"/><path d="M50 30c10 0 10 14 -2 14" fill="none" stroke="#f4e6d4" stroke-width="5"/><ellipse cx="30" cy="24" rx="20" ry="5" fill="#7a4b32"/><rect x="18" y="14" width="11" height="10" rx="3" fill="#fff" stroke="#e7a3b4" stroke-width="2"/><rect x="31" y="12" width="11" height="11" rx="3" fill="#f7d2dc" stroke="#e7a3b4" stroke-width="2"/><path d="M30 33c-6-6-12 2 0 9c12-7 6-15 0-9z" fill="#e7a3b4"/></svg>`;
function logoNode(cls){
  const d=document.createElement('div');d.className=cls;
  if(cfg.logo){const im=document.createElement('img');im.src=cfg.logo;im.alt='Coffeebreak logo';im.onerror=()=>{d.innerHTML=MARK_SVG};d.appendChild(im)}
  else d.innerHTML=MARK_SVG;
  return d;
}
let rightsPanel;
CBG.openRights=function(){
  if(!rightsPanel){
    root();rightsPanel=document.createElement('div');rightsPanel.className='cbg-ov';rightsPanel.id='cbg-rightsov';
    const box=document.createElement('div');box.className='cbg-box cbg-rbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Rights');
    box.appendChild(logoNode('cbg-rlogo'));
    const h=document.createElement('h2');h.textContent='Rights';box.appendChild(h);
    const p=document.createElement('p');p.className='cbg-rtext';p.id='cbg-rtext';p.textContent=CBG.rightsText;box.appendChild(p);
    const b=document.createElement('button');b.type='button';b.className='pri';b.id='cbg-rclose';b.textContent='Close';b.onclick=()=>rightsPanel.classList.remove('on');box.appendChild(b);
    rightsPanel.appendChild(box);rootEl.appendChild(rightsPanel);
    rightsPanel.addEventListener('mousedown',e=>{if(e.target===rightsPanel)rightsPanel.classList.remove('on')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&rightsPanel.classList.contains('on'))rightsPanel.classList.remove('on')});
  }
  rightsPanel.classList.add('on');return true;
};
// a small footer card with the logo and the full notice, for pages that have room for it
CBG.mountFooter=function(container){
  const f=document.createElement('div');f.className='cbg-foot';f.id='cbg-foot';themed(f);
  f.appendChild(logoNode('cbg-flogo'));
  const t=document.createElement('div');const b=document.createElement('b');b.textContent='Rights';t.appendChild(b);t.appendChild(document.createTextNode(CBG.rightsText));f.appendChild(t);
  (container||document.body).appendChild(f);return f;
};

/* ---------- visible improvement: noise bars and a before and after spectrum ---------- */
const NF_LO=-80,NF_HI=-20;
const barPct=db=>Math.max(2,Math.min(100,(db-NF_LO)/(NF_HI-NF_LO)*100));
function fmtDb(x){return(x>=0?'+':'\u2212')+Math.abs(x).toFixed(1)+' dB'}
function meterRows(){return`<div class="cbg-mrow o"><span class="n">Original</span><span class="tr"><i></i></span><b>0 dB</b></div><div class="cbg-mrow c"><span class="n">Cleaned</span><span class="tr"><i></i></span><b>0 dB</b></div>`}
function mkMeter(){
  const m=document.createElement('div');m.className='cbg-meter';themed(m);
  m.innerHTML='<div class="cbg-mt cbg-now" role="status" aria-live="polite"></div><div class="cbg-mt cbg-mh">Noise level in the quiet parts</div>'+meterRows()+'<div class="cbg-mn"></div>';return m;
}
function fillMeter(m,st,mode){
  const o=m.querySelector('.o'),c=m.querySelector('.c');
  o.querySelector('i').style.width=barPct(st.beforeDb)+'%';c.querySelector('i').style.width=barPct(st.afterDb)+'%';
  o.querySelector('b').textContent=Math.round(st.beforeDb)+' dB';c.querySelector('b').textContent=Math.round(st.afterDb)+' dB';
  o.classList.toggle('hot',mode==='orig');c.classList.toggle('hot',mode==='clean');
  const n=m.querySelector('.cbg-mn');
  if(n){let t='Noise down '+Math.max(0,st.hissDb).toFixed(0)+' dB';if(st.sample)t+='. Signal to noise up '+st.sample.snrGainDb.toFixed(1)+' dB. Highs kept within '+Math.max(0,-st.sample.high.cleanedVsRefDb).toFixed(1)+' dB.';n.textContent=t}
}
function updateMeters(){
  updateLabels();
  const sOn=(PL.playing&&PL.src==='sample')||!!CBG._busy,on=sOn&&PL.stats&&PL.clean&&isFinite(PL.stats.afterDb);
  document.querySelectorAll('.cbg-meter:not(.cbg-pm)').forEach(m=>{m.classList.toggle('on',!!sOn);m.classList.toggle('nostats',!on);if(on&&PL.playing)fillMeter(m,PL.stats,PL.mode)});
  const pm=$('#cbg-pmeter');
  if(pm){const ok=PL.stats&&PL.clean&&isFinite(PL.stats.afterDb);pm.style.display=ok?'':'none';if(ok){fillMeter(pm,PL.stats,PL.mode);pm.classList.add('on');drawViz()}}
}
function colorOf(v){const p=document.createElement('span');p.style.color='var('+v+')';(rootEl||document.body).appendChild(p);const c=getComputedStyle(p).color;p.remove();return c}
function drawSpec(cv,a,b){
  if(!cv||!a||!b)return;
  const W=cv.width,H=cv.height,g=cv.getContext('2d'),L=46,R=8,T=10,B=30,pw=W-L-R,ph=H-T-B;
  const fg=colorOf('--cbg-fg'),ac=colorOf('--cbg-ac'),ln=colorOf('--cbg-line');
  g.clearRect(0,0,W,H);
  let hi=-200;for(let i=0;i<a.length;i++)hi=Math.max(hi,a[i],b[i]);
  const top=Math.ceil((hi+2)/10)*10,bot=top-60;
  const X=i=>L+i/(a.length-1)*pw,Y=v=>T+(1-(Math.max(bot,Math.min(top,v))-bot)/(top-bot))*ph;
  g.font='20px sans-serif';g.textBaseline='middle';g.lineWidth=1;
  g.strokeStyle=ln;g.fillStyle=fg;
  for(let v=top;v>=bot;v-=10){g.beginPath();g.moveTo(L,Y(v));g.lineTo(W-R,Y(v));g.globalAlpha=.45;g.stroke();g.globalAlpha=.85;g.textAlign='right';g.fillText(String(v),L-6,Y(v))}
  g.textAlign='center';g.textBaseline='top';
  [100,1000,10000].forEach(f=>{const i=Math.log(f/60)/Math.log(16000/60)*(a.length-1);g.globalAlpha=.85;g.fillText(f>=1000?(f/1000)+'k':String(f),X(i),H-B+6);g.globalAlpha=.3;g.beginPath();g.moveTo(X(i),T);g.lineTo(X(i),T+ph);g.stroke()});
  g.globalAlpha=.85;g.textAlign='right';g.fillText('Hz',W-R,H-B+6);
  g.globalAlpha=.4;g.fillStyle=fg;g.beginPath();g.moveTo(X(0),Y(bot));for(let i=0;i<a.length;i++)g.lineTo(X(i),Y(a[i]));g.lineTo(X(a.length-1),Y(bot));g.closePath();g.fill();
  g.globalAlpha=1;g.strokeStyle=fg;g.lineWidth=2;g.beginPath();for(let i=0;i<a.length;i++)i?g.lineTo(X(i),Y(a[i])):g.moveTo(X(i),Y(a[i]));g.stroke();
  g.strokeStyle=ac;g.lineWidth=4;g.lineJoin='round';g.beginPath();for(let i=0;i<b.length;i++)i?g.lineTo(X(i),Y(b[i])):g.moveTo(X(i),Y(b[i]));g.stroke();
  g.globalAlpha=1;
}
function drawViz(){
  if(!PL.stats||!PL.stats.specBefore)return;
  drawSpec($('#cbg-spec'),PL.stats.specBefore,PL.stats.specAfter);
  drawSpec($('#cbg-specq'),PL.stats.qBefore||PL.stats.specBefore,PL.stats.qAfter||PL.stats.specAfter);
  const nums=$('#cbg-nums');
  if(nums){const st=PL.stats;let h='Quiet-part noise: <b>'+Math.round(st.beforeDb)+' dB</b> down to <b>'+Math.round(st.afterDb)+' dB</b>, about <b>'+Math.max(0,st.hissDb).toFixed(0)+' dB</b> lower.';
    if(st.sample){const m=st.sample;h+=' Signal to noise against the true clean tune: <b>'+m.snrBeforeDb.toFixed(1)+' dB</b> to <b>'+m.snrAfterDb.toFixed(1)+' dB</b> ('+fmtDb(m.snrGainDb)+'). Highs kept: <b>'+fmtDb(m.high.cleanedVsRefDb)+'</b> against the true highs, presence <b>'+fmtDb(m.presence.cleanedVsRefDb)+'</b>, so the music is not dulled.'}
    nums.innerHTML=h}
}
CBG.updateMeters=updateMeters;

/* ---------- sources and cleaning ---------- */
const uploads=[];   // decoded audio from uploads {name,buffer,size}
let attachments=[]; // {id,name,size,type,blob}
const opts={amount:60,hiss:true,crackle:true,soften:false};
CBG.opts=opts;
const cleanKey=()=>JSON.stringify(opts)+JSON.stringify(CBG.tune);
function status(msg){const e=$('#cbg-status');if(e)e.textContent=msg;CBG.lastStatus=msg}
function setProg(p){const e=$('#cbg-progbar');if(e)e.style.width=Math.round(p*100)+'%'}
CBG.runClean=async function(){
  if(!PL.orig)return null;
  if(PL.token)PL.token.cancel=true;
  const token=PL.token={cancel:false},orig=PL.orig;
  PL.clean=null;refreshUI();
  status('Cleaning '+PL.srcName+' ...');setProg(0.02);
  try{
    const t0=performance.now();
    const r=await CBG.clean(orig,opts,setProg,token);
    if(token.cancel||PL.orig!==orig)return null;
    PL.clean=r.buffer;PL.stats=r.stats;PL.cleanKey=cleanKey();
    if(plNodes&&!plNodes.c&&PL.playing){const c=playCtx(),off=plPos();plNodes.c=mkSrc(PL.clean,PL.mode==='clean'?1:0,off)}
    const s=r.stats;
    if(PL.src==='sample'&&sampleRef&&CBG.sampleLead){
      try{const m=CBG.measure(sampleRef,orig,r.buffer);s.sample=m;s.beforeDb=m.leadNoiseBeforeDb;s.afterDb=m.leadNoiseAfterDb;s.hissDb=m.leadReductionDb}catch(e){}
    }
    status('Done in '+((performance.now()-t0)/1000).toFixed(1)+' seconds. Quiet-part hiss is down about '+Math.max(0,s.hissDb).toFixed(1)+' dB'+(opts.crackle?', '+s.clicks+' crackles repaired':'')+'. Use the Hearing button to switch between the original and the cleaned sound.');
    setProg(1);refreshUI();return r;
  }catch(e){
    if(e&&e.message==='cancelled')return null;
    status('The cleaner hit a problem: '+(e&&e.message||e)+'. Your original is unchanged.');setProg(0);return null;
  }
};
function sourceList(){
  const L=[{id:'sample',label:'Sample sound (built in, grainy)'}];
  if(cfg.getClip)L.push({id:'clip',label:'Selected clip in the project'});
  if(cfg.getMix)L.push({id:'mix',label:'Whole mix of the project'});
  uploads.forEach((u,i)=>L.push({id:'up'+i,label:'Uploaded: '+u.name}));
  return L;
}
CBG.useSource=async function(id,opt){
  opt=opt||{};
  const wasPlaying=PL.playing;
  let buf=null,name='';
  try{
    if(id==='sample'){status('Making the sample sound ...');buf=await CBG.makeSample();name='Sample sound'}
    else if(id==='clip'){const r=await cfg.getClip();if(!r||!r.buffer){toast('Select an audio clip first, or pick another source.');return false}buf=r.buffer;name=r.name||'Selected clip'}
    else if(id==='mix'){status('Rendering the mix ...');const r=await cfg.getMix();if(!r||!r.buffer){toast('The project has no audio to clean yet.');return false}buf=r.buffer;name=r.name||'Whole mix'}
    else if(/^up\d+$/.test(id)){const u=uploads[+id.slice(2)];if(!u){return false}buf=u.buffer;name=u.name}
    else return false;
  }catch(e){toast('Could not get that sound: '+(e&&e.message||e));status('Could not get that sound.');return false}
  CBG.stop();PL.src=id;PL.orig=buf;PL.clean=null;PL.srcName=name;PL.offset=0;PL.mode='orig';
  const sel=$('#cbg-src');if(sel)sel.value=id;
  refreshUI();
  const r=await CBG.runClean();
  if(opt.play||wasPlaying&&opt.keep)CBG.play(0);
  return !!r;
};

/* ---------- remover panel ---------- */
let panel;
function buildPanel(){
  if(panel)return panel;
  const r=root();panel=document.createElement('div');panel.className='cbg-ov';panel.id='cbg-ov';
  panel.innerHTML=`<div class="cbg-box" role="dialog" aria-modal="true" aria-label="Grainy Sound Remover">
<h2>Grainy Sound Remover</h2>
<p class="cbg-hint">Takes the hiss, grit and crackle out of a sound. It runs in your browser with the Web Audio API, costs nothing and sends nothing anywhere.</p>
<div class="cbg-row"><label class="cbg-lbl">Sound <select id="cbg-src"></select></label><button id="cbg-pick" type="button">Choose a file</button><button id="cbg-samp" type="button">Use the sample sound</button></div>
<div class="cbg-row"><label class="cbg-lbl" style="flex:1">Amount <input type="range" id="cbg-amt" min="0" max="100" value="60" step="1" aria-label="Cleaning amount"> <b id="cbg-amtv">60</b></label></div>
<div class="cbg-row"><label><input type="checkbox" id="cbg-hiss" checked> Hiss and noise</label><label><input type="checkbox" id="cbg-crk" checked> De-crackle</label><label><input type="checkbox" id="cbg-soft"> Soften harsh highs (optional)</label><button id="cbg-run" type="button" class="pri">Clean now</button></div>
<div class="cbg-prog"><i id="cbg-progbar"></i></div>
<div class="cbg-stat" id="cbg-status" aria-live="polite">Pick a sound, or press Use the sample sound to hear it work.</div>
<div class="cbg-viz" id="cbg-viz"><div class="cbg-meter cbg-pm" id="cbg-pmeter"></div><div class="cbg-vt">The noise floor in the quiet parts</div><canvas id="cbg-specq" width="640" height="260" role="img" aria-label="Noise floor spectrum before and after cleaning"></canvas><div class="cbg-vt">The whole sound, music included</div><canvas id="cbg-spec" width="640" height="260" role="img" aria-label="Whole sound spectrum before and after cleaning"></canvas><div class="cbg-leg"><span><i style="background:var(--cbg-fg);opacity:.5"></i>Original (grainy)</span><span><i style="background:var(--cbg-ac)"></i>Cleaned</span></div><div class="cbg-nums" id="cbg-nums"></div></div>
<div class="cbg-now" id="cbg-now" style="display:none" role="status" aria-live="polite"></div>
<div class="cbg-row"><button id="cbg-play" type="button" class="pri">Play</button><button id="cbg-diff" type="button">Hear the difference</button><button id="cbg-ab" type="button" aria-pressed="false">Hearing: Original (grainy)</button><input type="range" id="cbg-seek" min="0" max="1000" value="0" aria-label="Position"><span id="cbg-time">0:00 / 0:00</span></div>
<div class="cbg-row"><button id="cbg-dl" type="button" class="pri">Download cleaned WAV</button><button id="cbg-add" type="button">Add cleaned sound to the project</button><button id="cbg-up2" type="button">Upload any file</button><button id="cbg-rights" type="button">Rights</button><button id="cbg-close" type="button">Close</button></div>
</div>`;
  r.appendChild(panel);
  const pmx=$('#cbg-pmeter');pmx.innerHTML='<div class="cbg-mt">Noise level in the quiet parts</div>'+meterRows();pmx.style.display='none';
  const amt=$('#cbg-amt'),amtv=$('#cbg-amtv');
  amt.oninput=()=>{amtv.textContent=amt.value;opts.amount=+amt.value};
  amt.onchange=()=>{opts.amount=+amt.value;CBG.runClean()};
  const chk=(id,k)=>{$(id).onchange=e=>{opts[k]=e.target.checked;CBG.runClean()}};chk('#cbg-hiss','hiss');chk('#cbg-crk','crackle');chk('#cbg-soft','soften');
  $('#cbg-run').onclick=()=>CBG.runClean();
  $('#cbg-src').onchange=e=>CBG.useSource(e.target.value);
  $('#cbg-samp').onclick=()=>CBG.useSource('sample');
  $('#cbg-pick').onclick=()=>CBG.pick({toRemover:true});
  $('#cbg-up2').onclick=()=>{CBG.openUpload()};
  $('#cbg-play').onclick=()=>{PL.playing?CBG.stop():CBG.play()};
  $('#cbg-ab').onclick=()=>CBG.toggleAB();
  $('#cbg-diff').onclick=()=>CBG.hearDifference({current:true});
  const seek=$('#cbg-seek');
  seek.onpointerdown=()=>{seek._drag=1};seek.onpointerup=()=>{seek._drag=0};
  seek.oninput=()=>{if(!PL.orig)return;const off=seek.value/1000*PL.orig.duration;PL.offset=off;if(PL.playing)CBG.play(off)};
  $('#cbg-dl').onclick=()=>{if(!PL.clean)return;const nm=(PL.srcName||'sound').replace(/\.[^.]+$/,'').replace(/[^\w -]+/g,'').trim()||'sound';download(wavBlob(PL.clean,cfg.maxSec),nm+' cleaned.wav');toast('Saved '+nm+' cleaned.wav to your downloads.'+(cfg.maxSec&&PL.clean.duration>cfg.maxSec?' The free demo saves '+cfg.maxSec+' seconds at most.':''))};
  $('#cbg-add').onclick=()=>{if(!PL.clean||!cfg.addAudio)return;try{const m=cfg.addAudio(PL.clean,(PL.srcName||'Sound').replace(/\.[^.]+$/,'')+' cleaned');Promise.resolve(m).then(x=>toast(x||'Added the cleaned sound to the project.'))}catch(e){toast('Could not add it to the project: '+e.message)}};
  $('#cbg-close').onclick=()=>CBG.closeRemover();
  $('#cbg-rights').onclick=()=>CBG.openRights();
  panel.addEventListener('mousedown',e=>{if(e.target===panel)CBG.closeRemover()});
  return panel;
}
function fillSources(){
  const sel=$('#cbg-src');if(!sel)return;const L=sourceList();
  sel.innerHTML=L.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join('');sel.value=L.some(x=>x.id===PL.src)?PL.src:'sample';
  $('#cbg-add').style.display=cfg.addAudio?'':'none';
}
CBG.openRemover=function(srcId){
  buildPanel();fillSources();panel.classList.add('on');
  $('#cbg-amt').value=opts.amount;$('#cbg-amtv').textContent=opts.amount;
  refreshUI();
  const want=srcId||(PL.orig?PL.src:'sample');
  if(!PL.orig||srcId||PL.src!==want)CBG.useSource(want);
  else if(!PL.clean)CBG.runClean();
  else if(PL.stats){const t=PL.stats;status('Ready: '+PL.srcName+'. Quiet-part hiss is down about '+Math.max(0,t.hissDb).toFixed(1)+' dB. Use the Hearing button to switch between the original and the cleaned sound.');setProg(1)}
  return true;
};
CBG.closeRemover=function(){if(panel)panel.classList.remove('on');if(PL.src!=='sample'||true)CBG.stop()};

/* ---------- sample sound play (inline in each tool) ---------- */
CBG.playSample=async function(o){
  o=o||{};
  if(!o.force&&PL.playing&&PL.src==='sample'){CBG.stop('sample button');return}
  try{playCtx().resume()}catch(e){}              // wake the audio engine inside the tap itself, as phones require
  CBG._busy='Making the sample sound, one moment ...';refreshUI();
  let buf;try{buf=await CBG.makeSample()}catch(e){CBG._busy='';refreshUI();toast('The sample sound could not be made in this browser.',6000);return false}
  CBG._busy='';
  const ready=PL.src==='sample'&&PL.orig===buf&&PL.clean&&PL.cleanKey===cleanKey();
  if(!ready){
    CBG.stop('new sample');
    PL.src='sample';PL.orig=buf;PL.clean=null;PL.srcName='Sample sound';PL.offset=0;
    const sel=$('#cbg-src');if(sel)sel.value='sample';
  }
  PL.mode='orig';
  CBG.play(o.offset||0);                       // the grainy original starts at once and keeps looping
  if(!o.quiet)toast('Playing the grainy sample on a loop. Press Hearing to switch between the original and the cleaned sound, or press Hear the difference.',7000);
  if(!ready){const r=CBG.runClean();if(o.wait)await r}   // the cleaned sound is made while the original plays
  return true;
};

/* ---------- buttons to mount into each app ---------- */
function mkBtn(text,cls,fn,title){
  const b=document.createElement('button');b.type='button';b.textContent=text;b.className=(cfg.btnClass+' '+(cls||'')).trim();if(title)b.title=title;b.onclick=fn;return b;
}
CBG.mountButtons=function(container,which){
  which=which||['remover','upload','sample'];const out={};
  if(which.includes('remover'))out.remover=container.appendChild(mkBtn('Grainy Sound Remover','cbg-open-btn',()=>CBG.openRemover(),'Remove hiss, grit and crackle from a sound'));
  if(which.includes('upload'))out.upload=container.appendChild(mkBtn('Upload any file','cbg-upload-btn',()=>CBG.openUpload(),'Add sound, video or any other file'));
  if(which.includes('sample'))out.sample=container.appendChild(mkBtn('Play sample sound','cbg-sample-btn',()=>CBG.playSample(),'Play a built-in grainy sample, then hear it cleaned'));
  if(which.includes('sample')&&!which.includes('nodiff'))out.diff=container.appendChild(mkBtn('Hear the difference','cbg-diff-btn',()=>CBG.hearDifference(),'Plays 6 seconds of the grainy original, then 6 seconds of the cleaned sound'));
  if(which.includes('sample')){
    const ab=mkBtn('Hearing: Original (grainy)','cbg-ab-btn',()=>CBG.toggleAB(),'Switch between the grainy original and the cleaned sound');ab.style.display='none';container.appendChild(ab);out.ab=ab;
    if(!which.includes('nometer'))out.meter=container.appendChild(mkMeter());
  }
  if(which.includes('rights'))out.rights=container.appendChild(mkBtn('Rights','cbg-rights-btn',()=>CBG.openRights(),'Rights notice for this app'));
  refreshUI();return out;
};
CBG.mountMeter=function(container,before){const m=mkMeter();if(before)container.insertBefore(m,before);else container.appendChild(m);return m};
CBG.mountSampleBar=function(container){
  const bar=document.createElement('div');bar.className='cbg-bar';
  const o=CBG.mountButtons(bar,['sample','remover']);
  const tip=document.createElement('span');tip.className='cbg-tip';tip.style.display='none';tip.textContent='Switch between the grainy original and the cleaned sound while it plays.';bar.appendChild(tip);
  container.appendChild(bar);return bar;
};

/* ---------- upload any file ---------- */
const VIDEO_EXT=/\.(mp4|m4v|mov|webm|mkv|ogv|avi|3gp|mpg|mpeg|wmv|flv)$/i,AUDIO_EXT=/\.(wav|wave|mp3|ogg|oga|opus|m4a|aac|flac|aif|aiff|aifc|caf|weba|wma|amr|mp2)$/i;
function classify(f){
  const t=(f.type||'').toLowerCase();
  if(t.startsWith('audio/')||AUDIO_EXT.test(f.name))return'audio';
  if(t.startsWith('video/')||VIDEO_EXT.test(f.name))return'video';
  if(!t||t==='application/octet-stream')return'unknown';
  if(t==='application/ogg')return'audio';
  return'other';
}
function niceKind(f){
  const ext=((f.name.match(/\.([^.]+)$/)||[])[1]||'').toUpperCase(),t=f.type||'';
  if(t.startsWith('image/'))return(ext||'Image')+' picture';
  if(t==='application/pdf')return'PDF document';
  if(t.startsWith('text/'))return(ext||'Text')+' text file';
  if(/midi/i.test(t)||/\.(mid|midi)$/i.test(f.name))return'MIDI file';
  if(/zip|compressed/i.test(t)||/\.(zip|rar|7z|gz|tar)$/i.test(f.name))return'zip archive';
  return ext?ext+' file':'file';
}
async function decodeBlob(file){
  const ab=await file.arrayBuffer();
  return await ac().decodeAudioData(ab);
}
async function videoAudio(file,note){
  // fallback when the browser cannot decode the file directly: play it silently and record the sound
  const url=URL.createObjectURL(file),v=document.createElement('video');v.src=url;v.playsInline=true;v.preload='auto';
  await new Promise((res,rej)=>{v.onloadedmetadata=res;v.onerror=()=>rej(new Error('the browser cannot play this video'));setTimeout(()=>rej(new Error('the video took too long to open')),15000)});
  if(!isFinite(v.duration)||v.duration>1800)throw new Error('the video is longer than 30 minutes');
  const c=playCtx(),srcN=c.createMediaElementSource(v),dest=c.createMediaStreamDestination();srcN.connect(dest);
  const rec=new MediaRecorder(dest.stream),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);
  const done=new Promise(r=>rec.onstop=r);
  if(note)note('Reading the sound from the video in real time, about '+Math.ceil(v.duration)+' seconds ...');
  rec.start();await v.play();await new Promise(r=>{v.onended=r});rec.stop();await done;
  URL.revokeObjectURL(url);
  const blob=new Blob(chunks,{type:rec.mimeType||'audio/webm'});
  return await decodeBlob(blob);
}
/* attachments, kept in IndexedDB when the browser allows it */
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open('cbg-files-'+cfg.key,1);r.onupgradeneeded=()=>r.result.createObjectStore('f',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbPut(rec){try{const db=await idb();await new Promise((res,rej)=>{const tx=db.transaction('f','readwrite');tx.objectStore('f').put(rec);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});return true}catch(e){return false}}
async function idbDel(id){try{const db=await idb();await new Promise(res=>{const tx=db.transaction('f','readwrite');tx.objectStore('f').delete(id);tx.oncomplete=res;tx.onerror=res})}catch(e){}}
async function idbAll(){try{const db=await idb();return await new Promise(res=>{const r=db.transaction('f').objectStore('f').getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([])})}catch(e){return[]}}
CBG.attachments=()=>attachments.slice();
CBG.uploads=()=>uploads.slice();

CBG.handleFiles=async function(fileList,o){
  o=o||{};const files=[...fileList||[]];
  if(!files.length){toast('No file was chosen.');return[]}
  const results=[];
  for(const f of files){
    const kind=classify(f);let res={name:f.name,size:f.size,kind:'attachment',msg:''};
    if(kind==='audio'||kind==='video'||kind==='unknown'){
      let buf=null,err=null;
      try{buf=await decodeBlob(f)}catch(e){err=e}
      if(!buf&&kind==='video'){
        try{buf=await videoAudio(f,m=>{toast(m,8000);CBG.setUpStatus(m)})}catch(e){err=e}
      }
      if(buf){
        uploads.push({name:f.name,buffer:buf,size:f.size,kind:kind==='video'?'video':'audio'});
        let m='';
        if(cfg.addAudio){
          try{m=await cfg.addAudio(buf,f.name.replace(/\.[^.]+$/,''),f)}catch(e){m='';res.warn='It loaded, but adding it to the project failed: '+e.message}
        }
        res.kind=kind==='video'?'video':'audio';res.buffer=buf;
        res.msg=(kind==='video'?'Took the sound from the video "':'Loaded the sound "')+f.name+'" ('+fmtT(buf.duration)+'). '+(m||(cfg.addAudio?'It is ready to use.':'It is ready in the Grainy Sound Remover.'))+(res.warn?' '+res.warn:'');
      }else{
        res=await keepAttachment(f,kind==='audio'||kind==='video'?'It looks like '+(kind==='video'?'a video':'a sound')+' file, but this browser could not read the sound in it ('+((err&&err.message)||'unknown format').slice(0,80)+'). Nothing is lost: ':'This is a '+niceKind(f)+', so it was kept as an attachment instead of a sound. ');
      }
    }else{
      res=await keepAttachment(f,'This is a '+niceKind(f)+', not a sound, so it was kept as an attachment. ');
    }
    results.push(res);toast(res.msg,7000);CBG.lastUpload=res;
  }
  renderUploadList();
  if(panel&&panel.classList.contains('on'))fillSources();
  if(o.toRemover){const last=results.filter(r=>r.buffer).pop();if(last){openR(last)}}
  return results;
};
function openR(res){fillSources();const i=uploads.findIndex(u=>u.buffer===res.buffer);if(i>=0)CBG.openRemover('up'+i)}
async function keepAttachment(f,lead){
  const rec={id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:f.name,size:f.size,type:f.type||'',blob:f,added:Date.now()};
  attachments.push(rec);const saved=await idbPut(rec);
  return{name:f.name,size:f.size,kind:'attachment',msg:lead+'"'+f.name+'" ('+fmtSize(f.size)+') is listed under Upload any file'+(saved?' and saved in this browser.':' for this visit.')+(cfg.attachNote?' '+cfg.attachNote:'')};
}
let upPanel,fileIn;
function ensureInput(){
  root();
  if(!fileIn){fileIn=document.createElement('input');fileIn.type='file';fileIn.id='cbg-file';fileIn.multiple=true;fileIn.style.display='none';fileIn.setAttribute('aria-label','Choose any files to upload');
    fileIn.onchange=async()=>{const fs=[...fileIn.files],o=fileIn._opts||{};fileIn.value='';await CBG.handleFiles(fs,o)};rootEl.appendChild(fileIn)}
  return fileIn;
}
CBG.pick=function(o){const i=ensureInput();i._opts=o||{};i.click()};
CBG.setUpStatus=function(m){const e=$('#cbg-upstat');if(e)e.textContent=m};
function buildUpload(){
  if(upPanel)return upPanel;
  root();ensureInput();
  upPanel=document.createElement('div');upPanel.className='cbg-ov';upPanel.id='cbg-upov';
  upPanel.innerHTML=`<div class="cbg-box" role="dialog" aria-modal="true" aria-label="Upload any file">
<h2>Upload any file</h2>
<p class="cbg-hint">Any type of file is welcome. Sound and video files are decoded and become usable audio, and the sound is taken out of videos. Anything else, such as lyrics, pictures, PDFs or MIDI, is kept in the list below as an attachment.</p>
<div class="cbg-drop" id="cbg-drop"><div>Drag files here, or</div><div class="cbg-row" style="justify-content:center"><button type="button" class="pri" id="cbg-choose">Choose files</button></div></div>
<div class="cbg-stat" id="cbg-upstat" aria-live="polite">Nothing uploaded yet.</div>
<div class="cbg-list" id="cbg-list"></div>
<div class="cbg-row"><button id="cbg-up-rem" type="button">Open the Grainy Sound Remover</button><button id="cbg-upclose" type="button">Close</button></div></div>`;
  rootEl.appendChild(upPanel);
  $('#cbg-choose').onclick=()=>CBG.pick({});
  $('#cbg-upclose').onclick=()=>upPanel.classList.remove('on');
  $('#cbg-up-rem').onclick=()=>{upPanel.classList.remove('on');CBG.openRemover()};
  upPanel.addEventListener('mousedown',e=>{if(e.target===upPanel)upPanel.classList.remove('on')});
  const dz=$('#cbg-drop');
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('over')});dz.addEventListener('dragleave',()=>dz.classList.remove('over'));
  dz.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();dz.classList.remove('over');CBG.handleFiles(e.dataTransfer.files)});
  return upPanel;
}
function renderUploadList(){
  const l=$('#cbg-list');if(!l)return;
  const rows=[];
  uploads.forEach((u,i)=>rows.push(`<div class="cbg-item"><span class="tg">${u.kind==='video'?'Video sound':'Sound'}</span><span class="nm">${esc(u.name)}</span><span>${fmtT(u.buffer.duration)}</span><button type="button" data-clean="${i}">Clean this</button><button type="button" data-prev="${i}">Preview</button></div>`));
  attachments.forEach((a,i)=>rows.push(`<div class="cbg-item"><span class="tg">Attachment</span><span class="nm">${esc(a.name)}</span><span>${fmtSize(a.size)}</span><button type="button" data-dla="${i}">Download</button><button type="button" data-rma="${i}">Remove</button><span class="sub">${esc(niceKind({name:a.name,type:a.type}))}</span></div>`));
  l.innerHTML=rows.join('')||'';
  const lastMsg=CBG.lastUpload&&CBG.lastUpload.msg;if(lastMsg)CBG.setUpStatus(lastMsg);
  l.querySelectorAll('[data-clean]').forEach(b=>b.onclick=()=>{upPanel.classList.remove('on');CBG.openRemover('up'+b.dataset.clean)});
  l.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>{upPanel.classList.remove('on');CBG.openRemover('up'+b.dataset.prev);setTimeout(()=>CBG.play(0),50)});
  l.querySelectorAll('[data-dla]').forEach(b=>b.onclick=()=>{const a=attachments[+b.dataset.dla];if(a)download(a.blob,a.name)});
  l.querySelectorAll('[data-rma]').forEach(b=>b.onclick=()=>{const a=attachments[+b.dataset.rma];if(a){attachments.splice(+b.dataset.rma,1);idbDel(a.id);renderUploadList()}});
}
CBG.openUpload=function(){buildUpload();upPanel.classList.add('on');renderUploadList();return true};

/* page-wide drag and drop */
function initDnD(){
  let n=0,veil=null;
  const has=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes('Files');
  window.addEventListener('dragenter',e=>{if(!has(e))return;n++;if(!veil){veil=document.createElement('div');veil.id='cbg-dropall';veil.textContent='Drop any file here';root().appendChild(veil)}veil.classList.add('on')});
  window.addEventListener('dragleave',e=>{if(!has(e))return;n=Math.max(0,n-1);if(!n&&veil)veil.classList.remove('on')});
  window.addEventListener('dragover',e=>{if(has(e))e.preventDefault()});
  window.addEventListener('drop',e=>{
    if(!has(e))return;n=0;if(veil)veil.classList.remove('on');
    if(e.defaultPrevented)return; // an app drop target already handled it
    e.preventDefault();CBG.handleFiles(e.dataTransfer.files);
  });
}

/* ---------- init ---------- */
CBG.init=function(c){
  Object.assign(cfg,c||{});cfg.theme=Object.assign({},c&&c.theme);
  root();applyTheme();ensureInput();
  idbAll().then(a=>{if(a&&a.length){a.forEach(r=>{if(!attachments.some(x=>x.id===r.id))attachments.push(r)});renderUploadList()}});
  if(!CBG._dnd){CBG._dnd=1;initDnD()}
  CBG.ready=true;
  setTimeout(()=>{try{CBG.makeSample().catch(()=>{})}catch(e){}},150);
};
CBG.cfg=cfg;
})();

/* ---------- Coffeebreak Studio Espresso glue ---------- */
(function(){
const Q=s=>document.querySelector(s);
function go(){
  CBG.init({key:'espresso',name:'Coffeebreak Studio Espresso',btnClass:'sm',logo:'logo.jpg',maxSec:(typeof DEMO!=='undefined'&&DEMO)?DEMO_MAX:0,
    theme:{bg:'var(--bg)',fg:'var(--ink)',ac:'var(--a)',acfg:'#fff',line:'var(--b)',card:'var(--card)',font:'inherit'},
    getCtx:()=>AC(),
    getClip:()=>{const s=edTarget();return s?{buffer:s.b,name:s.c.name}:null},
    getMix:async()=>({buffer:await renderSong({}),name:'Whole mix'}),
    addAudio:(buf,name)=>{ snap(); let t=selTrack(); if(!t||t.kind!=='audio'||t.clips.some(c=>c.start<T.pos+0.01&&c.start+c.len>T.pos))t=addTrack('audio',null,String(name).slice(0,20)); if(!t)return 'The free demo allows 2 tracks, so it was kept in the Upload any file list only.'; audioClip(t,buf,T.pos,name); refreshAll(); return 'Added to the project on track "'+t.name+'" at the playhead.'; },
    attachNote:'It is not part of the song itself.'});
  // 1) sample bar at the top of every tab, and a small one on every named panel
  const decorate=sec=>{
    if(sec.dataset.cbg)return; sec.dataset.cbg='1';
    const bar=document.createElement('div'); bar.className='cbg-bar cbg-tabbar'; CBG.mountButtons(bar,['sample','remover','upload','rights']);
    const tip=document.createElement('span'); tip.className='cbg-tip'; tip.style.display='none'; tip.textContent='Switch between the grainy original and the cleaned sound while it plays.'; bar.appendChild(tip);
    sec.insertBefore(bar,sec.firstChild);
    if(!/^t-(help|features)$/.test(sec.id)) sec.querySelectorAll(':scope > .panel').forEach(p=>{ if(p.querySelector(':scope > h3')){ const b=document.createElement('div'); b.className='cbg-bar'; CBG.mountButtons(b,['sample']); p.insertBefore(b,p.querySelector(':scope > h3').nextSibling); } });
  };
  document.querySelectorAll('#main > .tab').forEach(decorate);
  new MutationObserver(m=>{ m.forEach(x=>x.addedNodes.forEach(n=>{ if(n.nodeType===1&&n.classList.contains('tab'))decorate(n); })); }).observe(Q('#main'),{childList:true});
  CBG.mountFooter(document.body);
  // 2) audio editor button
  const nr=Q('#t-editor [data-op="nr"]');
  if(nr){ const b=document.createElement('button'); b.id='edGrainy'; b.textContent='Grainy Sound Remover'; b.title='Opens the Grainy Sound Remover on the selected clip'; b.onclick=()=>{ if(edTarget())CBG.openRemover('clip'); else {toast('Select an audio clip in Arrange first, or the remover will open on the sample sound.'); CBG.openRemover('sample');} }; nr.parentNode.insertBefore(b,nr); }
  // 3) tools browser entries
  const ob=buildLib; buildLib=function(){ const L=ob(); if(!L._cbg){ L._cbg=1;
    L.push({cat:'Utility',name:'Grainy Sound Remover (noise reduction and de-crackle)',use:()=>CBG.openRemover()},{cat:'Utility',name:'Upload any file (sound, video or other)',use:()=>CBG.openUpload()},{cat:'Utility',name:'Play sample sound (grainy, then cleaned)',use:()=>CBG.playSample()}); } return L; };
  // 4) old audio import button now accepts any file
  const imp=Q('#impFile'); if(imp)imp.removeAttribute('accept');
  const ai=Q('#aImp'); if(ai)ai.textContent='Import audio or any file';
  // 5) help and features
  const note=`<div class="panel"><h3>Grainy Sound Remover, Upload any file and Play sample sound</h3><ul>
   <li><b>Grainy Sound Remover:</b> takes hiss, grit and crackle out of the sample sound, the selected clip, the whole mix or any file you upload. Use the Amount slider, switch between Original and Cleaned while it plays, then download the cleaned WAV or add it to the project.</li>
   <li><b>Upload any file:</b> choose files or drag and drop them anywhere on the page. Sound and video become clips (the sound is taken out of videos). Other files are listed as attachments with a clear message.</li>
   <li><b>Play sample sound:</b> every tab and tool has this button. It plays a built-in, slightly grainy sample made with Web Audio, so you can hear the remover work.</li></ul></div>`;
  ['#t-help','#t-features'].forEach(s=>{const e=Q(s); if(e)e.insertAdjacentHTML('beforeend',note)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
