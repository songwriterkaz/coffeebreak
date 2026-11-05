const $=id=>document.getElementById(id),st=m=>$('status').textContent=m;
let ac,src,inGain,shaper,bass,mid,treb,cabF,delay,fb,dly,rev,revG,out,gateG,an,mon,recNode,recBuf=[],recording=false,noiseProf=null,sel=0,playing=[];
const K={gain:[0,10,5],drive:[0,10,4],bass:[-12,12,0],mid:[-12,12,0],treble:[-12,12,0],reverb:[0,10,3],delay:[0,10,2]};
for(const k in K)$('knobs').insertAdjacentHTML('beforeend',`<span class="knob">${k}<br><input type="range" id="k_${k}" min="${K[k][0]}" max="${K[k][1]}" step="0.1" value="${K[k][2]}"></span>`);
const tracks=[1,2,3,4].map(i=>({name:'Track '+i,buf:null,arm:i==1,mute:false,solo:false,vol:0.8}));
function drawTracks(){$('tracks').innerHTML='';tracks.forEach((t,i)=>{const d=document.createElement('div');d.className='track';
d.innerHTML=`<input type="radio" name="sel" ${i==sel?'checked':''}> <b style="width:70px">${t.name}</b><button class="${t.arm?'on':''}">Arm</button><button class="${t.mute?'on':''}">M</button><button class="${t.solo?'on':''}">S</button><input type="range" min="0" max="1" step="0.01" value="${t.vol}"><canvas width="800" height="40"></canvas>`;
const [r,a,m,s,v,c]=[...d.querySelectorAll('input,button,canvas')].filter((e,j)=>true);
r.onchange=()=>sel=i;a.onclick=()=>{tracks.forEach(x=>x.arm=false);t.arm=true;drawTracks()};m.onclick=()=>{t.mute=!t.mute;drawTracks()};s.onclick=()=>{t.solo=!t.solo;drawTracks()};v.oninput=()=>t.vol=+v.value;
if(t.buf){const g=c.getContext('2d'),dt=t.buf.getChannelData(0),stp=Math.ceil(dt.length/800);g.fillStyle='#d4a24c';for(let x=0;x<800;x++){let mx=0;for(let j=0;j<stp;j++)mx=Math.max(mx,Math.abs(dt[x*stp+j]||0));g.fillRect(x,20-mx*20,1,mx*40)}}
$('tracks').appendChild(d)})}
drawTracks();
function curve(d){const n=2048,c=new Float32Array(n),k=d*20+1;for(let i=0;i<n;i++){const x=i*2/n-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}return c}
function impulse(sec){const l=ac.sampleRate*sec,b=ac.createBuffer(2,l,ac.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<l;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/l,3)}return b}
function upd(){if(!ac)return;const v=k=>+$('k_'+k).value;inGain.gain.value=v('gain')/2;shaper.curve=curve(v('drive'));bass.gain.value=v('bass');mid.gain.value=v('mid');treb.gain.value=v('treble');revG.gain.value=v('reverb')/10;dly.gain.value=v('delay')/12;
const c=$('cab').value;cabF.frequency.value=c=='off'?20000:c=='4x12'?4000:5500}
document.querySelectorAll('input[type=range],#cab').forEach(e=>e.addEventListener('input',upd));
$('start').onclick=async()=>{try{ac=ac||new AudioContext();const s=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
src=ac.createMediaStreamSource(s);gateG=ac.createGain();inGain=ac.createGain();shaper=ac.createWaveShaper();shaper.oversample='4x';
bass=ac.createBiquadFilter();bass.type='lowshelf';bass.frequency.value=120;mid=ac.createBiquadFilter();mid.type='peaking';mid.frequency.value=800;treb=ac.createBiquadFilter();treb.type='highshelf';treb.frequency.value=3200;
cabF=ac.createBiquadFilter();cabF.type='lowpass';out=ac.createGain();delay=ac.createDelay(1);delay.delayTime.value=0.35;fb=ac.createGain();fb.gain.value=0.35;dly=ac.createGain();rev=ac.createConvolver();rev.buffer=impulse(2);revG=ac.createGain();
an=ac.createAnalyser();an.fftSize=1024;src.connect(an);src.connect(gateG).connect(inGain).connect(shaper).connect(bass).connect(mid).connect(treb).connect(cabF).connect(out);
cabF.connect(delay);delay.connect(fb).connect(delay);delay.connect(dly).connect(out);cabF.connect(rev).connect(revG).connect(out);
mon=ac.createGain();mon.gain.value=0;out.connect(mon).connect(ac.destination);
recNode=ac.createScriptProcessor(4096,1,1);out.connect(recNode);recNode.connect(ac.destination);recNode.onaudioprocess=e=>{if(recording)recBuf.push(new Float32Array(e.inputBuffer.getChannelData(0)))};
upd();gateLoop();st('Input ready. Arm a track and press Record.')}catch(e){st('Mic error: '+e.message)}};
$('mon').onchange=()=>mon&&(mon.gain.value=$('mon').checked?1:0);
function gateLoop(){const d=new Float32Array(an.fftSize);an.getFloatTimeDomainData(d);let s=0;for(const x of d)s+=x*x;const db=10*Math.log10(s/d.length+1e-12);
gateG.gain.setTargetAtTime(!$('gate').checked||db>+$('gthr').value?1:0,ac.currentTime,0.02);requestAnimationFrame(gateLoop)}
let metT=null;$('met').onclick=()=>{ac=ac||new AudioContext();if(metT){clearInterval(metT);metT=null;$('met').textContent='Start';return}let n=0;
const tick=()=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=n++%4?1000:1600;g.gain.setValueAtTime(0.5,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.05);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+0.06)};
tick();metT=setInterval(tick,60000/+$('bpm').value);$('met').textContent='Stop'};
$('rec').onclick=()=>{if(!src)return st('Enable input first.');if(recording){finishRec();return}recBuf=[];recording=true;$('rec').classList.add('on');$('rec').textContent='■ Stop Rec';playAll(true);st('Recording...')};
function finishRec(){recording=false;$('rec').classList.remove('on');$('rec').textContent='● Record armed';stopAll();const len=recBuf.reduce((a,b)=>a+b.length,0);if(!len)return;
const b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);let o=0;for(const c of recBuf){d.set(c,o);o+=c.length}const t=tracks.find(t=>t.arm);t.buf=b;sel=tracks.indexOf(t);drawTracks();st('Recorded '+t.name)}
function audible(t){const any=tracks.some(x=>x.solo);return t.buf&&!t.mute&&(!any||t.solo)}
function playAll(skipArmed){ac=ac||new AudioContext();stopAll();tracks.forEach(t=>{if(!audible(t)||(skipArmed&&t.arm))return;const s=ac.createBufferSource(),g=ac.createGain();s.buffer=t.buf;g.gain.value=t.vol;s.connect(g).connect(ac.destination);s.start();playing.push(s)})}
function stopAll(){playing.forEach(s=>{try{s.stop()}catch(e){}});playing=[]}
$('play').onclick=()=>playAll(false);$('stop').onclick=()=>{if(recording)finishRec();stopAll()};
// FFT
function fft(re,im,inv){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]]}}
for(let l=2;l<=n;l<<=1){const a=(inv?2:-2)*Math.PI/l,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=l){let cr=1,ci=0;for(let j=0;j<l/2;j++){const u=i+j,v=u+l/2,tr=re[v]*cr-im[v]*ci,ti=re[v]*ci+im[v]*cr;re[v]=re[u]-tr;im[v]=im[u]-ti;re[u]+=tr;im[u]+=ti;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t}}}
if(inv)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n}}
const N=2048,H=512,win=Float32Array.from({length:N},(_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/N));
function frames(d,cb){for(let p=0;p+N<=d.length;p+=H){const re=new Float32Array(N),im=new Float32Array(N);for(let i=0;i<N;i++)re[i]=d[p+i]*win[i];fft(re,im,false);cb(p,re,im)}}
function quietest(d){const L=Math.floor(ac.sampleRate*0.5);let best=0,bv=1e9;for(let p=0;p+L<=d.length;p+=L/2){let s=0;for(let i=p;i<p+L;i++)s+=d[i]*d[i];if(s<bv){bv=s;best=p}}return d.subarray(best,Math.min(d.length,best+L))}
$('learn').onclick=()=>{const t=tracks[sel];if(!t.buf)return st('Select a recorded track first.');const q=quietest(t.buf.getChannelData(0));const m=new Float32Array(N);let c=0;
frames(q,(p,re,im)=>{for(let i=0;i<N;i++)m[i]+=Math.hypot(re[i],im[i]);c++});if(!c)return st('Track too short.');for(let i=0;i<N;i++)m[i]/=c;noiseProf=m;st('Noise profile learned from quietest section of '+t.name)};
$('nr').onclick=()=>{const t=tracks[sel];if(!t.buf)return st('Select a recorded track first.');if(!noiseProf)$('learn').onclick();if(!noiseProf)return;
const d=t.buf.getChannelData(0),o=new Float32Array(d.length+N),w=new Float32Array(d.length+N);
frames(d,(p,re,im)=>{for(let i=0;i<N;i++){const mg=Math.hypot(re[i],im[i]),th=noiseProf[i]*1.8,g=mg>th?1:0.08;re[i]*=g;im[i]*=g}fft(re,im,true);for(let i=0;i<N;i++){o[p+i]+=re[i]*win[i];w[p+i]+=win[i]*win[i]}});
const b=ac.createBuffer(1,d.length,ac.sampleRate),nd=b.getChannelData(0);for(let i=0;i<d.length;i++)nd[i]=w[i]>1e-3?o[i]/w[i]:0;t.buf=b;drawTracks();st('Background noise removed from '+t.name)};
$('wav').onclick=async()=>{const act=tracks.filter(audible);if(!act.length)return st('Nothing to export.');const sr=act[0].buf.sampleRate,len=Math.max(...act.map(t=>t.buf.length));
const oc=new OfflineAudioContext(1,len,sr);act.forEach(t=>{const s=oc.createBufferSource(),g=oc.createGain();s.buffer=t.buf;g.gain.value=t.vol;s.connect(g).connect(oc.destination);s.start()});
const r=(await oc.startRendering()).getChannelData(0),dv=new DataView(new ArrayBuffer(44+len*2)),ws=(o,s)=>[...s].forEach((c,i)=>dv.setUint8(o+i,c.charCodeAt(0)));
ws(0,'RIFF');dv.setUint32(4,36+len*2,true);ws(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,len*2,true);
for(let i=0;i<len;i++)dv.setInt16(44+i*2,Math.max(-1,Math.min(1,r[i]))*32767,true);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([dv],{type:'audio/wav'}));a.download='coffeebreak-mix.wav';a.click();st('Mix exported.')};
