'use strict';
const DEMO=!!window.CB_DEMO, DEMO_MAX=30;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let ctx;
function AC(){ if(!ctx){ try{ctx=new AudioContext({sampleRate:48000,latencyHint:'interactive'})}catch(e){ctx=new AudioContext()} setupMeter(); applySink(); } if(ctx.state==='suspended')ctx.resume(); return ctx;}
const prefs=Object.assign({theme:0,compact:false,waveH:160,tab:'master',ec:false,ns:false,agc:false,inDev:'',outDev:''},JSON.parse(localStorage.getItem('cbms-prefs')||'{}'));
function savePrefs(){localStorage.setItem('cbms-prefs',JSON.stringify(prefs))}
function status(el,t){ if(typeof el==='string')el=$(el); if(el)el.textContent=t; }
function fmtT(s){s=Math.max(0,s);const m=Math.floor(s/60);return m+':'+(s%60).toFixed(1).padStart(4,'0')}
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),30000)}
const dbToG=d=>Math.pow(10,d/20);

/* ---------- master bus + meter ---------- */
let masterOut, analyser;
function setupMeter(){ masterOut=ctx.createGain(); analyser=ctx.createAnalyser(); analyser.fftSize=1024; masterOut.connect(analyser); masterOut.connect(ctx.destination);
  const c=$('#meter'),g=c.getContext('2d'),d=new Float32Array(analyser.fftSize); let hold=0,clipT=0;
  (function loop(){ analyser.getFloatTimeDomainData(d); let p=0; for(const v of d){const a=Math.abs(v); if(a>p)p=a}
    hold=Math.max(p,hold*0.95); if(p>=0.999)clipT=performance.now(); $('#clip').classList.toggle('on',performance.now()-clipT<1500);
    const db=20*Math.log10(hold+1e-9), w=Math.max(0,Math.min(1,(db+60)/60))*c.width;
    g.clearRect(0,0,c.width,c.height); const gr=g.createLinearGradient(0,0,c.width,0); gr.addColorStop(0,'#7fd'),gr.addColorStop(.75,'#f8c'),gr.addColorStop(1,'#f22'); g.fillStyle=gr; g.fillRect(0,0,w,c.height);
    requestAnimationFrame(loop);})();
}
async function applySink(){ if(!ctx||!prefs.outDev)return; try{ if(ctx.setSinkId) await ctx.setSinkId(prefs.outDev);}catch(e){console.warn('sink',e)} }

/* ---------- audio helpers ---------- */
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
async function exportBuf(b,fmt,name,statusEl){ const max=DEMO?DEMO_MAX:0; status(statusEl,'Encoding...');
  let blob,ext; if(fmt==='mp3'){blob=await encodeMP3(b,max);ext='mp3'}else{blob=encodeWAV(b,+fmt,max);ext='wav'}
  dl(blob,name+'.'+ext); status(statusEl,'Saved '+name+'.'+ext+(DEMO&&b.duration>DEMO_MAX?' (demo: first 30 seconds)':'')); return blob; }

/* ---------- waveform drawing ---------- */
function drawWave(cv,b,sel,head){ const dpr=window.devicePixelRatio||1,W=cv.clientWidth||600,H=cv.clientHeight||cv.height; cv.width=W*dpr;cv.height=H*dpr; const g=cv.getContext('2d'); g.scale(dpr,dpr); g.clearRect(0,0,W,H);
  if(!b){g.fillStyle='#f8c';g.font='14px sans-serif';g.fillText('No audio loaded',10,H/2);return}
  const d=b.getChannelData(0),step=Math.max(1,Math.floor(d.length/W)),acc=getComputedStyle(document.body).getPropertyValue('--a')||'#e75b9a';
  if(sel&&sel[1]>sel[0]){g.fillStyle='rgba(255,214,232,.35)';g.fillRect(sel[0]/b.length*W,0,(sel[1]-sel[0])/b.length*W,H)}
  g.fillStyle=acc; for(let x=0;x<W;x++){let mn=1,mx=-1;const st=x*step;for(let i=st;i<st+step&&i<d.length;i++){const v=d[i];if(v<mn)mn=v;if(v>mx)mx=v} if(mx<mn)continue; if(mx>=0.999||mn<=-0.999)g.fillStyle='#f33'; g.fillRect(x,(1-mx)*H/2,1,Math.max(1,(mx-mn)*H/2)); g.fillStyle=acc;}
  if(head!=null){g.fillStyle='#fff';g.fillRect(head*W,0,2,H)} }

/* ================= MASTER ================= */
const PRESETS={
 'Streaming -14 LUFS':{l:0.5,m:0,h:1,c:0.5,w:1.05,t:-14},
 'Radio Loud':{l:1.5,m:0.5,h:2,c:0.9,w:1.1,t:-9},
 'Warm':{l:2.5,m:-0.5,h:-1.5,c:0.5,w:1,t:-14},
 'Bright':{l:-0.5,m:0.5,h:3,c:0.55,w:1.15,t:-14},
 'Country':{l:1,m:1.5,h:1.5,c:0.6,w:1.1,t:-13},
 'Pop':{l:2,m:-0.5,h:2.5,c:0.75,w:1.2,t:-11},
 'Gentle':{l:0,m:0,h:0.5,c:0.25,w:1,t:-16}};
const M={src:null,buf:null,gain:1,playing:false,nodes:null,wet:true,t0:0};
function mParams(){return{l:+$('#eqL').value,m:+$('#eqM').value,h:+$('#eqH').value,c:+$('#cmp').value,w:+$('#wid').value,t:+$('#tgt').value}}
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
let mMeasureTimer;
async function mAnalyse(){ if(!M.buf)return; status('#mLufs','Measuring loudness...'); const p=mParams();
  const prev=M.buf.duration>40?sliceBuf(M.buf,M.buf.length*0.3,M.buf.length*0.3+30*M.buf.sampleRate):M.buf;
  const r=await renderMaster(prev,p); M.gain=r.gain; if(M.nodes)M.nodes.mk.gain.value=M.gain;
  const src=await measureLUFS(M.buf); status('#mLufs',`Original about ${src.toFixed(1)} LUFS, mastered about ${r.lufs.toFixed(1)} LUFS`); }
function mStop(){ if(M.src){try{M.src.stop()}catch(e){}} M.src=null;M.playing=false;$('#mPlay').textContent='Play'; }
function mPlay(){ AC(); if(M.playing)return mStop(); if(!M.buf)return status('#mInfo','Load a track first');
  const s=ctx.createBufferSource(); s.buffer=toStereo(M.buf); const dry=ctx.createGain(),wet=ctx.createGain(); M.nodes=buildMasterChain(ctx,s,mParams(),M.gain); M.nodes.out.connect(wet); s.connect(dry);
  M.dry=dry;M.wetG=wet; dry.gain.value=M.wet?0:1; wet.gain.value=M.wet?1:0; dry.connect(masterOut);wet.connect(masterOut);
  s.start(); M.src=s; M.playing=true; M.t0=ctx.currentTime; $('#mPlay').textContent='Stop'; s.onended=()=>{if(M.src===s)mStop()};
  (function anim(){ if(!M.playing)return; drawWave($('#mWave'),M.buf,null,((ctx.currentTime-M.t0)%M.buf.duration)/M.buf.duration); requestAnimationFrame(anim)})(); }
function mAB(){ M.wet=!M.wet; $('#mAB').textContent='Hearing: '+(M.wet?'Mastered':'Original'); if(M.dry){const t=ctx.currentTime;M.dry.gain.setTargetAtTime(M.wet?0:1,t,0.01);M.wetG.gain.setTargetAtTime(M.wet?1:0,t,0.01);} }
async function mLoad(b,name){ mStop(); M.buf=b; M.name=(name||'track').replace(/\.[^.]+$/,''); status('#mInfo',`${name||''} ${b.duration.toFixed(1)}s, ${b.sampleRate} Hz`); drawWave($('#mWave'),b); await mAnalyse(); }
function initMaster(){
  const pc=$('#presets'); Object.keys(PRESETS).forEach((k,i)=>{const bt=document.createElement('button');bt.textContent=k;bt.onclick=()=>{$$('#presets button').forEach(x=>x.classList.remove('on'));bt.classList.add('on');const p=PRESETS[k];$('#eqL').value=p.l;$('#eqM').value=p.m;$('#eqH').value=p.h;$('#cmp').value=p.c;$('#wid').value=p.w;$('#tgt').value=p.t;mParamsChanged();};pc.appendChild(bt);if(!i)bt.classList.add('on')});
  ['#eqL','#eqM','#eqH','#cmp','#wid','#tgt'].forEach(s=>$(s).addEventListener('input',mParamsChanged));
  $('#mFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;status('#mInfo','Opening...');try{await mLoad(await decodeFile(f),f.name)}catch(err){status('#mInfo','This browser cannot open that file type')}};
  $('#mPlay').onclick=mPlay;$('#mAB').onclick=mAB;
  $('#mExport').onclick=async()=>{ if(!M.buf)return status('#mStat','Load a track first'); status('#mStat','Mastering...'); const src=DEMO?sliceBuf(M.buf,0,DEMO_MAX*M.buf.sampleRate):M.buf; const r=await renderMaster(src,mParams()); window.__lastMaster=r; await exportBuf(r.buf,$('#mBits').value,M.name+'-mastered','#mStat'); };
  $('#mFromEd').onclick=()=>{ if(E.buf){mLoad(cloneBuf(E.buf),'editor');}else status('#mInfo','The Editor is empty'); };
  $('#mFromMix').onclick=async()=>{ const b=await mixdown(); if(b)mLoad(b,'mixdown'); else status('#mInfo','The Mixer is empty'); };
}
function mParamsChanged(){ if(M.nodes&&M.playing){const p=mParams();} clearTimeout(mMeasureTimer); mMeasureTimer=setTimeout(async()=>{const was=M.playing;await mAnalyse(); if(was){mStop();mPlay();}},400); }

/* ================= MIC / RECORDING ================= */
async function getMic(){ AC(); const c={audio:{echoCancellation:prefs.ec,noiseSuppression:prefs.ns,autoGainControl:prefs.agc,sampleRate:{ideal:48000},channelCount:{ideal:2}}}; if(prefs.inDev)c.audio.deviceId={exact:prefs.inDev};
  const st=await navigator.mediaDevices.getUserMedia(c); refreshDevices(); return st; }
function pickMime(){ for(const m of['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm'])if(window.MediaRecorder&&MediaRecorder.isTypeSupported(m))return m; return ''; }
// Recorder: captures raw PCM via ScriptProcessor (wide support) plus MediaRecorder for compressed format
class Rec{ constructor(stream){this.stream=stream;this.chunks=[[],[]];this.len=0;}
  start(){ const c=AC(); this.src=c.createMediaStreamSource(this.stream); this.sp=c.createScriptProcessor(4096,2,2); const z=c.createGain();z.gain.value=0;
    this.sp.onaudioprocess=e=>{const ib=e.inputBuffer;for(let ch=0;ch<2;ch++)this.chunks[ch].push(ib.getChannelData(Math.min(ch,ib.numberOfChannels-1)).slice());this.len+=ib.length;};
    this.src.connect(this.sp);this.sp.connect(z);z.connect(c.destination); this.src.connect(analyser);
    const mt=pickMime(); if(mt){this.mr=new MediaRecorder(this.stream,{mimeType:mt});this.mparts=[];this.mr.ondataavailable=e=>e.data.size&&this.mparts.push(e.data);this.mr.start(1000);} }
  async stop(){ try{this.src.disconnect();this.sp.disconnect();}catch(e){} this.stream.getTracks().forEach(t=>t.stop());
    let comp=null; if(this.mr&&this.mr.state!=='inactive'){await new Promise(r=>{this.mr.onstop=r;this.mr.stop()}); comp=new Blob(this.mparts,{type:this.mr.mimeType});}
    const b=newBuf(2,this.len,ctx.sampleRate); for(let ch=0;ch<2;ch++){let o=0;const d=b.getChannelData(ch);for(const k of this.chunks[ch]){d.set(k,o);o+=k.length}} return{buf:b,comp}; } }

/* ================= MIXER ================= */
const PPS=50; let tracks=[],selTrack=0,tid=0; const X={playing:false,srcs:[],t0:0,pos:0,rec:null};
function newTrack(name){ const t={id:++tid,name:name||('Track '+(tracks.length+1)),clips:[],vol:0.8,pan:0,mute:false,solo:false,echo:false,reverb:false}; tracks.push(t); renderTracks(); return t; }
function addClip(t,buf,start,name){ t.clips.push({buf,start:start||0,name:name||'clip'}); renderTracks(); }
function trackEnd(){ let e=0; for(const t of tracks)for(const c of t.clips)e=Math.max(e,c.start+c.buf.duration); return e; }
function renderTracks(){ const box=$('#tracks'); box.innerHTML='';
  tracks.forEach((t,i)=>{ const row=document.createElement('div');row.className='track'+(i===selTrack?' sel':'');
    row.innerHTML=`<div class="tctl"><input type="text" value="${t.name.replace(/"/g,'')}"><label>Vol <input type="range" min="0" max="1.5" step="0.01" value="${t.vol}" class="v"></label><label>Pan <input type="range" min="-1" max="1" step="0.01" value="${t.pan}" class="p"></label>
    <div class="mini"><button class="m ${t.mute?'on':''}">M</button><button class="s ${t.solo?'on':''}">S</button><button class="ec ${t.echo?'on':''}">Echo</button><button class="rv ${t.reverb?'on':''}">Verb</button><button class="ld">Load</button><button class="ed">Edit</button><button class="x">X</button></div></div><div class="lane"></div>`;
    const q=s=>row.querySelector(s);
    row.onclick=()=>{ if(selTrack!==i){selTrack=i;$$('.track').forEach((r,j)=>r.classList.toggle('sel',j===i));} };
    q('input[type=text]').onchange=e=>t.name=e.target.value; q('.v').oninput=e=>{t.vol=+e.target.value;liveUpdate()}; q('.p').oninput=e=>{t.pan=+e.target.value;liveUpdate()};
    q('.m').onclick=e=>{t.mute=!t.mute;e.target.classList.toggle('on');liveUpdate()}; q('.s').onclick=e=>{t.solo=!t.solo;e.target.classList.toggle('on');liveUpdate()};
    q('.ec').onclick=e=>{t.echo=!t.echo;e.target.classList.toggle('on')}; q('.rv').onclick=e=>{t.reverb=!t.reverb;e.target.classList.toggle('on')};
    q('.x').onclick=e=>{e.stopPropagation();tracks.splice(i,1);selTrack=Math.max(0,Math.min(selTrack,tracks.length-1));renderTracks()};
    q('.ed').onclick=()=>{ if(!t.clips.length)return; const b=renderTrackRaw(t); eLoad(b,t.name); showTab('editor'); };
    q('.ld').onclick=()=>{ const inp=document.createElement('input');inp.type='file';inp.accept='audio/*,.flac,.m4a,.webm';inp.onchange=async()=>{const f=inp.files[0];if(f)addClip(t,await decodeFile(f),trackEnd2(t),f.name)};inp.click(); };
    const lane=q('.lane'); lane.ondragover=e=>e.preventDefault(); lane.ondrop=e=>{e.preventDefault();const k=e.dataTransfer.getData('text/loop');if(k){const x=(e.clientX-lane.getBoundingClientRect().left)/PPS;const lb=makeLoop(k);addClip(t,lb,Math.max(0,snap(x)),k)}};
    t.clips.forEach((c,ci)=>{ const d=document.createElement('div');d.className='clipbox';d.style.left=(c.start*PPS)+'px';d.style.width=Math.max(4,c.buf.duration*PPS)+'px';d.title=c.name;
      const cv=document.createElement('canvas');cv.height=60;d.appendChild(cv);lane.appendChild(d);requestAnimationFrame(()=>drawWave(cv,c.buf));
      let sx=null,s0=0;d.onpointerdown=e=>{sx=e.clientX;s0=c.start;d.setPointerCapture(e.pointerId)};d.onpointermove=e=>{if(sx==null)return;c.start=Math.max(0,s0+(e.clientX-sx)/PPS);d.style.left=c.start*PPS+'px'};d.onpointerup=()=>{sx=null};
      d.ondblclick=()=>{ if(confirm('Remove this clip?')){t.clips.splice(ci,1);renderTracks()} }; });
    box.appendChild(row); }); }
function trackEnd2(t){return t.clips.reduce((a,c)=>Math.max(a,c.start+c.buf.duration),0)}
function snap(x){const beat=60/(+$('#bpm').value);return Math.round(x/beat)*beat}
function renderTrackRaw(t){ const sr=t.clips[0].buf.sampleRate,end=trackEnd2(t),b=newBuf(2,Math.ceil(end*sr),sr); for(const c of t.clips){const o=Math.round(c.start*sr);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch),s=c.buf.getChannelData(Math.min(ch,c.buf.numberOfChannels-1));for(let i=0;i<s.length&&o+i<d.length;i++)d[o+i]+=s[i];}} return b; }
function buildTrackGraph(c,t,anySolo,irCache){ const g=c.createGain(); g.gain.value=(t.mute||(anySolo&&!t.solo))?0:t.vol; const p=c.createStereoPanner?c.createStereoPanner():null; if(p){p.pan.value=t.pan;g.connect(p)} const out=p||g; const bus=c.createGain(); out.connect(bus);
  if(t.echo){const dl=c.createDelay(2);dl.delayTime.value=60/(+$('#bpm').value)*0.75;const fb=c.createGain();fb.gain.value=0.35;const wg=c.createGain();wg.gain.value=0.35;out.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wg);wg.connect(bus);}
  if(t.reverb){const cv=c.createConvolver();cv.buffer=irCache.ir||(irCache.ir=makeIR(c));const wg=c.createGain();wg.gain.value=0.3;out.connect(cv);cv.connect(wg);wg.connect(bus);}
  return{in:g,out:bus,g,p}; }
function liveUpdate(){ if(!X.playing)return; const anySolo=tracks.some(t=>t.solo); X.graphs.forEach((gr,i)=>{const t=tracks[i];if(!t)return;gr.g.gain.value=(t.mute||(anySolo&&!t.solo))?0:t.vol;if(gr.p)gr.p.pan.value=t.pan}); }
function xStop(){ X.srcs.forEach(s=>{try{s.stop()}catch(e){}}); X.srcs=[]; if(X.playing)X.pos=ctx.currentTime-X.t0; X.playing=false; $('#xPlay').textContent='Play'; if(X.metro)clearInterval(X.metro); }
function xPlay(fromStart,startAt){ AC(); if(X.playing){xStop();return} const at=startAt||ctx.currentTime+0.05, pos=fromStart?0:(X.pos>=trackEnd()?0:X.pos); const anySolo=tracks.some(t=>t.solo),ir={};
  X.graphs=tracks.map(t=>{const gr=buildTrackGraph(ctx,t,anySolo,ir);gr.out.connect(masterOut);for(const c of t.clips){const off=pos-c.start;if(off>=c.buf.duration)continue;const s=ctx.createBufferSource();s.buffer=c.buf;s.connect(gr.in);if(off>=0)s.start(at,off);else s.start(at-off);X.srcs.push(s)}return gr});
  X.t0=at-pos; X.playing=true; $('#xPlay').textContent='Pause';
  if($('#metro').checked)startMetro(at);
  (function anim(){ if(!X.playing)return; const t=ctx.currentTime-X.t0; $('#playhead').style.left=($('.tctl')?$('.tctl').offsetWidth:150)+t*PPS+'px'; status('#xTime',fmtT(t)); if(!X.rec&&t>trackEnd()+0.5&&trackEnd()>0){xStop();X.pos=0;return} requestAnimationFrame(anim)})(); }
function click(c,t,acc){ const o=c.createOscillator(),g=c.createGain();o.frequency.value=acc?1600:1000;g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);o.connect(g);g.connect(masterOut||c.destination);o.start(t);o.stop(t+0.06); }
function startMetro(at){ const beat=60/(+$('#bpm').value); let n=Math.ceil(Math.max(0,ctx.currentTime-at)/beat); const sched=()=>{while(at+n*beat<ctx.currentTime+0.3){click(ctx,at+n*beat,n%4===0);n++}}; sched(); X.metro=setInterval(sched,100); }
async function xRecord(){ AC(); if(X.rec){ const r=X.rec; X.rec=null; $('#xRec').classList.remove('on'); $('#xRec').textContent='Record on selected'; xStop(); const res=await r.rec.stop();
    const lat=(ctx.baseLatency||0)+(ctx.outputLatency||0); let b=res.buf; const skip=Math.max(0,Math.round((r.skip+lat)*ctx.sampleRate)); b=sliceBuf(b,skip,b.length); addClip(r.track,b,r.pos,'take'); return; }
  if(!tracks.length)newTrack(); const t=tracks[selTrack]||tracks[0]; let st; try{st=await getMic()}catch(e){return alert('Microphone was not allowed. Tap Record again and allow the mic.')}
  const rec=new Rec(st); const beat=60/(+$('#bpm').value), ci=$('#countin').checked?4*beat:0; const startAt=ctx.currentTime+0.1+ci;
  if(ci)for(let i=0;i<4;i++)click(ctx,ctx.currentTime+0.1+i*beat,i===0);
  rec.start(); const pos=X.pos; X.rec={rec,track:t,pos,skip:0.1+ci}; $('#xRec').classList.add('on'); $('#xRec').textContent='Stop recording';
  if(X.playing)xStop(); X.pos=pos; xPlay(false,startAt); }
async function mixdown(){ if(!tracks.some(t=>t.clips.length))return null; const sr=AC().sampleRate,len=Math.ceil((trackEnd()+ (tracks.some(t=>t.reverb||t.echo)?2.5:0.1))*sr);
  const o=new OfflineAudioContext(2,len,sr),anySolo=tracks.some(t=>t.solo),ir={};
  for(const t of tracks){const gr=buildTrackGraph(o,t,anySolo,ir);gr.out.connect(o.destination);for(const c of t.clips){const s=o.createBufferSource();s.buffer=c.buf;s.connect(gr.in);s.start(c.start)}}
  const b=await o.startRendering(); const p=peakOf(b); if(p>0.99)gainBuf(b,0.99/p); return b; }
function initMixer(){ for(let i=0;i<4;i++)newTrack(); $('#xAdd').onclick=()=>newTrack(); $('#xPlay').onclick=()=>xPlay(); $('#xStop').onclick=()=>{xStop();X.pos=0;status('#xTime','0:00.0');$('#playhead').style.left=($('.tctl')?$('.tctl').offsetWidth:150)+'px'};
  $('#xRec').onclick=xRecord; $('#xMix').onclick=async()=>{const b=await mixdown(); if(b)exportBuf(b,'24','coffeebreak-mixdown','#xTime')};
  $('#xMaster').onclick=async()=>{const b=await mixdown(); if(b){showTab('master');mLoad(b,'mixdown')}};
  $('#pSave').onclick=saveProject; $('#pLoad').onclick=loadProject;
  $('#timeline').addEventListener('click',e=>{ if(e.target.classList.contains('lane')&&!X.playing){const x=(e.clientX-e.target.getBoundingClientRect().left)/PPS;X.pos=Math.max(0,x);status('#xTime',fmtT(X.pos));$('#playhead').style.left=$('.tctl').offsetWidth+X.pos*PPS+'px'} }); }

/* ---------- IndexedDB ---------- */
function idb(){ return new Promise((res,rej)=>{const r=indexedDB.open('cb-master-studio',1);r.onupgradeneeded=()=>{r.result.createObjectStore('projects');r.result.createObjectStore('recs',{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}); }
async function idbDo(store,mode,fn){ const db=await idb(); return new Promise((res,rej)=>{const tx=db.transaction(store,mode),st=tx.objectStore(store);const r=fn(st);tx.oncomplete=()=>res(r&&r.result);tx.onerror=()=>rej(tx.error)}); }
const ser=b=>({sr:b.sampleRate,ch:[...Array(b.numberOfChannels)].map((_,c)=>b.getChannelData(c).slice())});
const deser=o=>{const b=newBuf(o.ch.length,o.ch[0].length,o.sr);o.ch.forEach((d,c)=>b.copyToChannel(d,c));return b};
async function saveProject(){ const name=prompt('Project name','My song'); if(!name)return; const data={bpm:+$('#bpm').value,tracks:tracks.map(t=>({...t,clips:t.clips.map(c=>({start:c.start,name:c.name,buf:ser(c.buf)}))}))};
  try{await idbDo('projects','readwrite',s=>s.put(data,name));status('#xTime','Saved '+name)}catch(e){alert('Could not save, the device storage may be full')} }
async function loadProject(){ const keys=await idbDo('projects','readonly',s=>s.getAllKeys()); if(!keys||!keys.length)return alert('No saved projects yet'); const name=prompt('Type a project name:\n'+keys.join('\n'),keys[keys.length-1]); if(!name)return;
  const d=await idbDo('projects','readonly',s=>s.get(name)); if(!d)return; xStop(); $('#bpm').value=d.bpm; tracks=d.tracks.map(t=>({...t,id:++tid,clips:t.clips.map(c=>({...c,buf:deser(c.buf)}))})); selTrack=0; renderTracks(); }

/* ================= LOOPS + SYNTH ================= */
const LOOPS=['Pop beat','Country shuffle','Four on the floor','Half-time groove','Bass walk','Bass pulse','Keys chords','Pad chords','Pluck arp'];
const loopCache={};
function synthNote(c,dest,type,f,t,dur,vel=0.6){ const g=c.createGain(); const o=c.createOscillator(); const flt=c.createBiquadFilter(); flt.type='lowpass';
  if(type==='keys'){o.type='triangle';flt.frequency.value=3000;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel*0.5,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+dur+0.8);}
  else if(type==='pad'){o.type='sawtooth';flt.frequency.value=1200;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel*0.18,t+0.4);g.gain.setValueAtTime(vel*0.18,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+0.8);const o2=c.createOscillator();o2.type='sawtooth';o2.frequency.value=f*1.006;o2.connect(flt);o2.start(t);o2.stop(t+dur+1);}
  else if(type==='bass'){o.type='square';flt.frequency.value=500;g.gain.setValueAtTime(vel*0.5,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur+0.1);}
  else {o.type='sawtooth';flt.frequency.setValueAtTime(4000,t);flt.frequency.exponentialRampToValueAtTime(300,t+0.25);g.gain.setValueAtTime(vel*0.35,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur+0.3);}
  o.frequency.value=f;o.connect(flt);flt.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+1.2);return{o,g}; }
function drum(c,dest,k,t){ if(k==='k'){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+0.15);g.gain.setValueAtTime(1,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.4);o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.45);return}
  const len=k==='h'?0.05:0.2,nb=c.createBuffer(1,c.sampleRate*len|0,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=nb;const f=c.createBiquadFilter();f.type=k==='h'?'highpass':'bandpass';f.frequency.value=k==='h'?7000:1800;const g=c.createGain();g.gain.setValueAtTime(k==='h'?0.25:0.7,t);g.gain.exponentialRampToValueAtTime(0.001,t+len);s.connect(f);f.connect(g);g.connect(dest);s.start(t);
  if(k==='s'){const o=c.createOscillator(),g2=c.createGain();o.frequency.value=190;g2.gain.setValueAtTime(0.4,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.1);o.connect(g2);g2.connect(dest);o.start(t);o.stop(t+0.12);} }
const mtof=m=>440*Math.pow(2,(m-69)/12);
const CHORDS=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]; // C G Am F
function renderLoopSync(name,bpm){ // returns promise
  const beat=60/bpm,bars=4,len=bars*4*beat,sr=AC().sampleRate,o=new OfflineAudioContext(2,Math.ceil(len*sr),sr),bus=o.createGain();bus.gain.value=0.8;bus.connect(o.destination);
  for(let bar=0;bar<bars;bar++){const b0=bar*4*beat,ch=CHORDS[bar];
    for(let s=0;s<16;s++){const t=b0+s*beat/4;
      if(name==='Pop beat'){if(s%8===0||s===10)drum(o,bus,'k',t);if(s%8===4)drum(o,bus,'s',t);if(s%2===0)drum(o,bus,'h',t);}
      if(name==='Country shuffle'){if(s%8===0)drum(o,bus,'k',t);if(s%8===4)drum(o,bus,'s',t);if(s%4===0||s%4===3)drum(o,bus,'h',t);}
      if(name==='Four on the floor'){if(s%4===0)drum(o,bus,'k',t);if(s%8===4)drum(o,bus,'s',t);if(s%4===2)drum(o,bus,'h',t);}
      if(name==='Half-time groove'){if(s===0||s===7)drum(o,bus,'k',t);if(s===8)drum(o,bus,'s',t);if(s%2===0)drum(o,bus,'h',t);}
      if(name==='Bass walk'&&s%4===0)synthNote(o,bus,'bass',mtof(ch[(s/4)%3]-24),t,beat*0.9);
      if(name==='Bass pulse'&&s%2===0)synthNote(o,bus,'bass',mtof(ch[0]-24),t,beat*0.4);
      if(name==='Pluck arp'&&s%2===0)synthNote(o,bus,'pluck',mtof(ch[(s/2)%3]+12),t,beat*0.4);}
    if(name==='Keys chords')for(let q=0;q<4;q++)ch.forEach(n=>synthNote(o,bus,'keys',mtof(n),b0+q*beat,beat*0.8,0.4));
    if(name==='Pad chords')ch.forEach(n=>synthNote(o,bus,'pad',mtof(n),b0,4*beat-0.3,0.5));}
  return o.startRendering(); }
function makeLoop(name){ const k=name+'@'+$('#bpm').value; return loopCache[k]; }
async function ensureLoops(){ const bpm=+$('#bpm').value; for(const n of LOOPS){const k=n+'@'+bpm;if(!loopCache[k])loopCache[k]=await renderLoopSync(n,bpm);} }
function initLoops(){ const box=$('#loops'); LOOPS.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.draggable=true;
    b.ondragstart=e=>e.dataTransfer.setData('text/loop',n);
    b.onclick=async()=>{await ensureLoops();const lb=makeLoop(n);const s=AC().createBufferSource();s.buffer=lb;s.connect(masterOut);s.start();setTimeout(()=>{try{s.stop()}catch(e){}},2500);
      if(!tracks.length)newTrack();const t=tracks[selTrack]||tracks[0];addClip(t,lb,trackEnd2(t),n);b.classList.add('on');setTimeout(()=>b.classList.remove('on'),600)};
    box.appendChild(b)});
  // tap = add to selected; drag works after loops rendered
  $('#bpm').addEventListener('change',()=>ensureLoops()); 
  // piano
  const pn=$('#piano'),white=[0,2,4,5,7,9,11],blackPos={1:0,3:1,6:3,8:4,10:5}; const keys={};
  for(let oct=0;oct<2;oct++){white.forEach((s,i)=>{const k=document.createElement('div');k.className='wk';k.dataset.n=60+oct*12+s;pn.appendChild(k);keys[60+oct*12+s]=k});}
  requestAnimationFrame(()=>{for(let oct=0;oct<2;oct++)for(const s in blackPos){const k=document.createElement('div');k.className='bk';k.dataset.n=60+oct*12+ +s;k.style.left=(oct*7+blackPos[s])*44+30+'px';pn.appendChild(k);keys[60+oct*12+ +s]=k}});
  const on={}; window.noteOn=(n,v=0.7)=>{AC();if(on[n])return;const t=ctx.currentTime;on[n]=synthNote(ctx,kbus(),$('#inst').value,mtof(n),t,30,v);keys[n]&&keys[n].classList.add('on');if(K.rec)K.ev.push([n,t-K.t0,v,1])};
  window.noteOff=n=>{const x=on[n];if(!x)return;delete on[n];const t=ctx.currentTime;x.g.gain.cancelScheduledValues(t);x.g.gain.setTargetAtTime(0,t,0.08);x.o.stop(t+0.5);keys[n]&&keys[n].classList.remove('on');if(K.rec)K.ev.push([n,t-K.t0,0,0])};
  pn.onpointerdown=e=>{const n=e.target.dataset.n;if(n){noteOn(+n);const up=()=>{noteOff(+n);window.removeEventListener('pointerup',up)};window.addEventListener('pointerup',up)}};
  const map='awsedftgyhujk'; window.addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||cur!=='loops'||/INPUT|SELECT/.test(e.target.tagName))return;const i=map.indexOf(e.key);if(i>=0)noteOn(60+i)});
  window.addEventListener('keyup',e=>{const i=map.indexOf(e.key);if(i>=0)noteOff(60+i)});
  if(navigator.requestMIDIAccess){navigator.requestMIDIAccess().then(m=>{const hook=()=>{let n=0;m.inputs.forEach(i=>{n++;i.onmidimessage=ev=>{const[s,d1,d2]=ev.data;if((s&240)===144&&d2)noteOn(d1,d2/127);else if((s&240)===128||((s&240)===144&&!d2))noteOff(d1)}});status('#midiStat',n?n+' MIDI device connected':'No MIDI keyboard found')};hook();m.onstatechange=hook}).catch(()=>status('#midiStat','MIDI not allowed'))}else status('#midiStat','MIDI not supported in this browser');
  $('#kRec').onclick=kRecord; }
const K={rec:false,ev:[]}; let _kbus; function kbus(){if(!_kbus){_kbus=ctx.createGain();_kbus.gain.value=0.6;_kbus.connect(masterOut)}return _kbus}
async function kRecord(){ AC(); if(!K.rec){K.rec=true;K.ev=[];K.t0=ctx.currentTime;$('#kRec').classList.add('on');$('#kRec').textContent='Stop keys recording';return}
  K.rec=false;$('#kRec').classList.remove('on');$('#kRec').textContent='Record keys to selected track'; const ev=K.ev; if(!ev.length)return; const end=ev[ev.length-1][1]+2,sr=ctx.sampleRate,o=new OfflineAudioContext(2,Math.ceil(end*sr),sr),inst=$('#inst').value;
  for(const e of ev)if(e[3]){const off=ev.find(x=>!x[3]&&x[0]===e[0]&&x[1]>=e[1]);synthNote(o,o.destination,inst,mtof(e[0]),e[1],(off?off[1]:end-1)-e[1],e[2]*0.6);}
  const b=await o.startRendering(); if(!tracks.length)newTrack(); addClip(tracks[selTrack]||tracks[0],b,X.pos,'keys'); }

/* ================= EDITOR ================= */
const E={buf:null,sel:null,undo:[],redo:[],clip:null,src:null,name:'audio'};
function eLoad(b,name){ eStop(); E.buf=b;E.name=(name||'audio').replace(/\.[^.]+$/,'');E.sel=null;E.undo=[];E.redo=[];eDraw(); }
function eDraw(head){ drawWave($('#eWave'),E.buf,E.sel,head); if(E.buf){const p=peakOf(E.buf);status('#eInfo',`${E.buf.duration.toFixed(2)}s, peak ${(20*Math.log10(p+1e-9)).toFixed(1)} dB${p>=0.999?' (clipping)':''}`)}
  status('#eSel',E.sel&&E.buf?`Selected ${(E.sel[0]/E.buf.sampleRate).toFixed(2)}s to ${(E.sel[1]/E.buf.sampleRate).toFixed(2)}s`:'No selection, effects apply to the whole file'); }
function ePush(){ E.undo.push(E.buf); if(E.undo.length>15)E.undo.shift(); E.redo=[]; }
function eRange(){ return E.sel&&E.sel[1]-E.sel[0]>10?E.sel:[0,E.buf.length]; }
async function eApplyRange(fn){ const[s,e]=eRange(); const part=sliceBuf(E.buf,s,e); const r=await fn(part); ePush(); const ch=E.buf.numberOfChannels;
  E.buf=concatBufs([s>0?sliceBuf(E.buf,0,s):null,r,e<E.buf.length?sliceBuf(E.buf,e,E.buf.length):null],E.buf.sampleRate,ch); if(E.sel)E.sel=[s,s+r.length]; eDraw(); }
function fitLen(r,n){ return r.length===n?r:sliceBuf(r,0,n); }
async function eOp(op){ if(!E.buf&&op!=='paste')return; const sr=E.buf?E.buf.sampleRate:48000;
  const per=f=>eApplyRange(async b=>{for(let c=0;c<b.numberOfChannels;c++)f(b.getChannelData(c),b);return b});
  switch(op){
   case'copy':{const[s,e]=eRange();E.clip=sliceBuf(E.buf,s,e);break}
   case'cut':case'del':{if(!E.sel)return;const[s,e]=E.sel;if(op==='cut')E.clip=sliceBuf(E.buf,s,e);ePush();E.buf=concatBufs([sliceBuf(E.buf,0,s),sliceBuf(E.buf,e,E.buf.length)],sr,E.buf.numberOfChannels);E.sel=null;eDraw();break}
   case'paste':{if(!E.clip)return;if(!E.buf){eLoad(cloneBuf(E.clip),'pasted');break}const at=E.sel?E.sel[0]:E.buf.length;ePush();E.buf=concatBufs([sliceBuf(E.buf,0,at),E.clip,sliceBuf(E.buf,at,E.buf.length)],sr,Math.max(E.buf.numberOfChannels,E.clip.numberOfChannels));E.sel=[at,at+E.clip.length];eDraw();break}
   case'insert':{const at=E.sel?E.sel[0]:E.buf.length;ePush();E.buf=concatBufs([sliceBuf(E.buf,0,at),newBuf(E.buf.numberOfChannels,sr,sr),sliceBuf(E.buf,at,E.buf.length)],sr,E.buf.numberOfChannels);eDraw();break}
   case'trim':{if(!E.sel)return;ePush();E.buf=sliceBuf(E.buf,E.sel[0],E.sel[1]);E.sel=null;eDraw();break}
   case'silence':return per(d=>d.fill(0));
   case'fadein':return per(d=>{for(let i=0;i<d.length;i++)d[i]*=i/d.length});
   case'fadeout':return per(d=>{for(let i=0;i<d.length;i++)d[i]*=1-i/d.length});
   case'rev':return per(d=>d.reverse());
   case'amp+':return per(d=>{const g=dbToG(3);for(let i=0;i<d.length;i++)d[i]*=g});
   case'amp-':return per(d=>{const g=dbToG(-3);for(let i=0;i<d.length;i++)d[i]*=g});
   case'norm':return eApplyRange(async b=>gainBuf(b,0.977/(peakOf(b)||1)));
   case'autogain':return eApplyRange(async b=>{const l=await measureLUFS(b);gainBuf(b,dbToG(Math.max(-20,Math.min(20,-16-l))));const p=peakOf(b);if(p>0.977)gainBuf(b,0.977/p);return b});
   case'echo':return eApplyRange(async b=>offline(b,(o,s)=>{const d=o.createDelay(2);d.delayTime.value=0.3;const fb=o.createGain();fb.gain.value=0.4;const m=o.createGain();s.connect(m);s.connect(d);d.connect(fb);fb.connect(d);d.connect(m);return m},0));
   case'reverb':return eApplyRange(async b=>offline(b,(o,s)=>{const cv=o.createConvolver();cv.buffer=makeIR(o);const w=o.createGain();w.gain.value=0.35;const m=o.createGain();s.connect(m);s.connect(cv);cv.connect(w);w.connect(m);return m}).then(r=>fitLen(r,b.length)));
   case'eq':return eApplyRange(async b=>offline(b,(o,s)=>{const p=mParams();let n=s;[['lowshelf',120,p.l],['peaking',1200,p.m],['highshelf',8000,p.h]].forEach(([t,f,g])=>{const q=o.createBiquadFilter();q.type=t;q.frequency.value=f;q.gain.value=g;n.connect(q);n=q});return n}));
   case'dehiss':return eApplyRange(async b=>offline(b,(o,s)=>{const q=o.createBiquadFilter();q.type='lowpass';q.frequency.value=11000;q.Q.value=0.5;s.connect(q);return q}));
   case'rumble':return eApplyRange(async b=>offline(b,(o,s)=>{const q=o.createBiquadFilter();q.type='highpass';q.frequency.value=80;s.connect(q);return q}));
   case'pitchup':return eApplyRange(async b=>offline(b,null,0,1.06));
   case'pitchdn':return eApplyRange(async b=>offline(b,null,0,0.94));
   case'deess':return eApplyRange(async b=>deEss(b));
   case'gate':return eApplyRange(async b=>gate(b,null));
   case'nr':{let prof=null;if(E.sel&&E.sel[1]-E.sel[0]>sr*0.2)prof=sliceBuf(E.buf,E.sel[0],E.sel[1]);const keep=E.sel;E.sel=null;await eApplyRange(async b=>spectralNR(b,prof));E.sel=keep;break}
   case'declick':return per(d=>declick(d));
  } }
// noise gate with smooth gain (threshold from quietest frames)
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
function eStop(){ if(E.src){try{E.src.stop()}catch(e){}E.src=null} }
function ePlay(){ AC(); if(E.src)return eStop(); if(!E.buf)return; const[s,e]=E.sel&&E.sel[1]-E.sel[0]>100?E.sel:[0,E.buf.length]; const src=ctx.createBufferSource();src.buffer=E.buf;src.connect(masterOut);
  src.start(0,s/E.buf.sampleRate,(e-s)/E.buf.sampleRate);E.src=src;const t0=ctx.currentTime;src.onended=()=>{if(E.src===src){E.src=null;eDraw()}};
  (function a(){if(E.src!==src)return;eDraw((s+(ctx.currentTime-t0)*E.buf.sampleRate)/E.buf.length);requestAnimationFrame(a)})(); }
function initEditor(){ $('#eFile').onchange=async e=>{const f=e.target.files[0];if(f){try{eLoad(await decodeFile(f),f.name)}catch(err){status('#eInfo','This browser cannot open that file type')}}};
  $$('[data-e]').forEach(b=>b.onclick=async()=>{b.disabled=true;status('#eInfo','Working...');try{await eOp(b.dataset.e)}catch(err){console.error(err)}b.disabled=false;eDraw()});
  $('#ePlay').onclick=ePlay;$('#eStop').onclick=eStop;$('#eUndo').onclick=eUndo;$('#eRedo').onclick=eRedo;
  $('#eAll').onclick=()=>{if(E.buf){E.sel=[0,E.buf.length];eDraw()}};$('#eNone').onclick=()=>{E.sel=null;eDraw()};
  const cv=$('#eWave');let down=null;const pos=e=>{const r=cv.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(E.buf?E.buf.length:0)|0};
  cv.onpointerdown=e=>{if(!E.buf)return;down=pos(e);E.sel=[down,down];cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(down==null)return;const p=pos(e);E.sel=[Math.min(down,p),Math.max(down,p)];eDraw()};
  cv.onpointerup=()=>{down=null;if(E.sel&&E.sel[1]-E.sel[0]<50)E.sel=null;eDraw()};
  $('#eExport').onclick=()=>E.buf&&exportBuf(E.buf,$('#eFmt').value,E.name+'-edit','#eInfo');
  $('#eToMix').onclick=()=>{if(!E.buf)return;if(!tracks.length)newTrack();const t=tracks[selTrack]||tracks[0];addClip(t,cloneBuf(E.buf),trackEnd2(t),E.name);showTab('mixer')};
  $('#eToMaster').onclick=()=>{if(E.buf){showTab('master');mLoad(cloneBuf(E.buf),E.name)}}; eDraw(); }
function eUndo(){ if(!E.undo.length)return; E.redo.push(E.buf); E.buf=E.undo.pop(); E.sel=null; eDraw(); }
function eRedo(){ if(!E.redo.length)return; E.undo.push(E.buf); E.buf=E.redo.pop(); E.sel=null; eDraw(); }

/* ================= QUICK RECORDER ================= */
const Q={rec:null,t0:0,timer:null,list:[]};
async function qToggle(){ AC(); if(Q.rec){ const r=Q.rec;Q.rec=null;clearInterval(Q.timer);$('#qRec').classList.remove('on');$('#qRec').textContent='Record';$('#recDot').classList.add('hidden');
    const res=await r.stop(); const item={id:Date.now(),name:'Recording '+new Date().toLocaleString('en-AU'),fmt:$('#qFmt').value,dur:res.buf.duration,buf:ser(res.buf),comp:res.comp};
    Q.list.unshift(item); try{await idbDo('recs','readwrite',s=>s.put(item))}catch(e){} qRender(); return; }
  let st; try{st=await getMic()}catch(e){return alert('Microphone was not allowed. Tap Record again and allow the mic.')}
  Q.rec=new Rec(st);Q.rec.start();Q.t0=Date.now();$('#qRec').classList.add('on');$('#qRec').textContent='Stop';$('#recDot').classList.remove('hidden');
  const auto=+$('#qAuto').value*60;Q.timer=setInterval(()=>{const s=(Date.now()-Q.t0)/1000;status('#qTime',String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0'));if(auto&&s>=auto)qToggle()},250); }
function qRender(){ const box=$('#qList');box.innerHTML='';if(!Q.list.length){box.innerHTML='<p class="hint">No recordings yet</p>';return}
  Q.list.forEach((it,i)=>{const d=document.createElement('div');d.className='recitem';d.innerHTML=`<b>${it.name}</b> <span>${it.dur.toFixed(1)}s</span><button class="pl">Play</button><button class="dl">Download</button><button class="mx">To Mixer</button><button class="ed">To Editor</button><button class="rm">Remove</button>`;
    const b=()=>deser(it.buf); d.querySelector('.pl').onclick=()=>{const s=AC().createBufferSource();s.buffer=b();s.connect(masterOut);s.start()};
    d.querySelector('.dl').onclick=async()=>{const f=$('#qFmt').value,nm='coffeebreak-'+it.id;if(f==='webm'&&it.comp){const ext=it.comp.type.includes('ogg')?'ogg':it.comp.type.includes('mp4')?'m4a':'webm';dl(it.comp,nm+'.'+ext)}else exportBuf(b(),f==='mp3'?'mp3':'24',nm,null)};
    d.querySelector('.mx').onclick=()=>{if(!tracks.length)newTrack();const t=tracks[selTrack]||tracks[0];addClip(t,b(),trackEnd2(t),it.name);showTab('mixer')};
    d.querySelector('.ed').onclick=()=>{eLoad(b(),'recording');showTab('editor')};
    d.querySelector('.rm').onclick=async()=>{if(!confirm('Remove this recording from the list?'))return;Q.list.splice(i,1);try{await idbDo('recs','readwrite',s=>s.delete(it.id))}catch(e){}qRender()};
    box.appendChild(d)}); }
async function initRecorder(){ $('#qRec').onclick=qToggle; try{const all=await idbDo('recs','readonly',s=>s.getAll());Q.list=(all||[]).sort((a,b)=>b.id-a.id)}catch(e){} qRender(); if(!hasMP3())$('#qFmt option[value=mp3]').remove(); }

/* ================= SETTINGS / UI ================= */
const THEMES=[['Coffeebreak pink','#e75b9a','#ffd6e8','#fff5f9','#5a2840','#fff'],['Bubblegum','#ff6fb5','#ffe0f0','#fff7fb','#61204a','#fff'],['Rose gold','#c9787e','#f3d6d0','#fdf6f3','#4d2a2a','#fff'],['Marshmallow','#d58ab8','#f6e6f0','#fffafc','#4a3040','#fff'],['Night pink','#ff5ca8','#4a1f36','#24101b','#ffe0ef','#341827']];
function applyTheme(){ const t=THEMES[prefs.theme]||THEMES[0],r=document.documentElement.style; r.setProperty('--a',t[1]);r.setProperty('--b',t[2]);r.setProperty('--bg',t[3]);r.setProperty('--ink',t[4]);r.setProperty('--card',t[5]); document.body.classList.toggle('compact',prefs.compact); $('#eWave').style.height=prefs.waveH+'px'; }
async function refreshDevices(){ if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices)return; const ds=await navigator.mediaDevices.enumerateDevices();
  const fill=(sel,kind,def)=>{const v=prefs[sel==='#inDev'?'inDev':'outDev'];$(sel).innerHTML=`<option value="">${def}</option>`+ds.filter(d=>d.kind===kind&&d.deviceId&&d.deviceId!=='default').map(d=>`<option value="${d.deviceId}">${(d.label||kind).replace(/</g,'')}</option>`).join('');$(sel).value=v||''};
  fill('#inDev','audioinput','Default mic'); fill('#outDev','audiooutput','Default output'); if(!(window.AudioContext&&AudioContext.prototype.setSinkId))$('#outDev').title='Output choice is not supported in this browser'; }
let cur='master';
function showTab(t){ if(DEMO&&!['master','features','settings'].includes(t))t='master'; cur=t; $$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t)); $$('.tab').forEach(s=>s.classList.toggle('on',s.id==='t-'+t)); prefs.tab=t; savePrefs();
  if(t==='editor')eDraw(); if(t==='master'&&M.buf)drawWave($('#mWave'),M.buf); if(t==='loops'||t==='mixer')ensureLoops(); }
function initSettings(){ const th=$('#themes'); THEMES.forEach((t,i)=>{const b=document.createElement('button');b.textContent=t[0];b.style.borderColor=t[1];b.onclick=()=>{prefs.theme=i;savePrefs();applyTheme();$$('#themes button').forEach((x,j)=>x.classList.toggle('on',j===i))};if(i===prefs.theme)b.classList.add('on');th.appendChild(b)});
  $('#compact').checked=prefs.compact;$('#compact').onchange=e=>{prefs.compact=e.target.checked;savePrefs();applyTheme()};
  $('#waveH').value=prefs.waveH;$('#waveH').oninput=e=>{prefs.waveH=+e.target.value;savePrefs();applyTheme();eDraw()};
  [['#optEC','ec'],['#optNS','ns'],['#optAGC','agc']].forEach(([s,k])=>{$(s).checked=prefs[k];$(s).onchange=e=>{prefs[k]=e.target.checked;savePrefs()}});
  $('#inDev').onchange=e=>{prefs.inDev=e.target.value;savePrefs()};$('#outDev').onchange=e=>{prefs.outDev=e.target.value;savePrefs();applySink()};$('#devRefresh').onclick=refreshDevices;
  $$('details.panel').forEach((d,i)=>{const k='cbms-p'+i;if(localStorage.getItem(k)==='0')d.open=false;d.addEventListener('toggle',()=>localStorage.setItem(k,d.open?'1':'0'))});
  refreshDevices(); applyTheme(); }
function initKeys(){ window.addEventListener('keydown',e=>{ if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&e.target.type!=='range')return; const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
  if(mod&&k==='z'){e.preventDefault();e.shiftKey?eRedo():eUndo();return} if(mod&&k==='y'){e.preventDefault();eRedo();return}
  if(cur==='editor'&&mod&&['x','c','v'].includes(k)){e.preventDefault();eOp({x:'cut',c:'copy',v:'paste'}[k]);return}
  if(cur==='editor'&&(k==='delete'||k==='backspace')){e.preventDefault();eOp('del');return}
  if(mod||cur==='loops'&&'awsedftgyhujk'.includes(k))return;
  if(k===' '){e.preventDefault();({master:mPlay,mixer:()=>xPlay(),editor:ePlay})[cur]?.();}
  else if(k==='r'){({mixer:xRecord,recorder:qToggle})[cur]?.()} else if(k==='b'&&cur==='master')mAB();
  else if(/^[1-7]$/.test(k))showTab($$('nav button')[+k-1].dataset.t); }); }

window.addEventListener('DOMContentLoaded',()=>{
  $$('nav button').forEach(b=>b.onclick=()=>showTab(b.dataset.t));
  if(DEMO){ $('#demoBanner').classList.remove('hidden'); $$('nav button').forEach(b=>{if(!['master','features','settings'].includes(b.dataset.t))b.classList.add('hidden')}); $('#sub').textContent='Free demo'; $('#mFromMix').classList.add('hidden');$('#mFromEd').classList.add('hidden'); $('#mExport').textContent='Export 30 second preview'; }
  if(!hasMP3())$$('option[value=mp3]').forEach(o=>o.remove());
  initSettings(); initMaster(); initMixer(); initEditor(); initRecorder(); initLoops(); initKeys(); showTab(prefs.tab||'master');
  window.CBMS={M,E,X,tracks:()=>tracks,renderMaster,encodeWAV,mLoad,eLoad,eOp,mixdown,measureLUFS,ensureLoops,makeLoop,addClip,newBuf,spectralNR};
});
