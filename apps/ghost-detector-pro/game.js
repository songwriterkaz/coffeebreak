(function(){
const $=id=>document.getElementById(id);
const K='cb_ghostdetpro_log';let LOG;try{LOG=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){LOG=[]}
const saveLog=()=>{try{localStorage.setItem(K,JSON.stringify(LOG.slice(0,300)))}catch(e){}};
let emf=0.2,emfBase=null,sensor='SIMULATED',mic=0,temp=21.4+Math.random(),anom=[],AC,micAn,stream,camOn=false,filt='night';
function ts(){return new Date().toLocaleString('en-AU',{hour12:false})}
function ev(type,detail){LOG.unshift({t:ts(),type,detail});saveLog();drawLog();flash()}
function flash(){const f=$('gdFlash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
// ---- sensors ----
function startMag(){try{if('Magnetometer' in window){const m=new Magnetometer({frequency:20});m.addEventListener('reading',()=>{const v=Math.hypot(m.x,m.y,m.z);if(emfBase==null)emfBase=v;emf=Math.min(5,Math.abs(v-emfBase)/8)});m.addEventListener('error',()=>{});m.start();sensor='MAGNETOMETER';return}}catch(e){}
 if(window.DeviceOrientationEvent){let last=null;const h=e=>{if(e.alpha==null)return;sensor='MOTION/COMPASS';if(last!=null){const d=Math.abs(e.alpha-last);emf=Math.min(5,emf*.85+Math.min(d,30)/10)}last=e.alpha};if(DeviceOrientationEvent.requestPermission){DeviceOrientationEvent.requestPermission().then(r=>{if(r=='granted')addEventListener('deviceorientation',h)}).catch(()=>{})}else addEventListener('deviceorientation',h)}}
async function startMic(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();stream=stream||await navigator.mediaDevices.getUserMedia({audio:true});const s=AC.createMediaStreamSource(stream);micAn=AC.createAnalyser();micAn.fftSize=1024;s.connect(micAn);$('micSt').textContent='MIC: LIVE';ev('System','Microphone connected')}catch(e){$('micSt').textContent='MIC: SIMULATED';}}
// ---- main loop ----
const em=$('emf').getContext('2d'),rd=$('radar').getContext('2d');let ang=0;
function loop(){
 if(sensor=='SIMULATED'){emf=Math.max(0,emf*.93+(Math.random()<.004?3+Math.random()*2:Math.random()*.08))}
 if(micAn){const d=new Uint8Array(micAn.fftSize);micAn.getByteTimeDomainData(d);let s=0;for(const v of d)s+=(v-128)**2;mic=Math.sqrt(s/d.length)/40}else mic=Math.max(0,mic*.9+Math.random()*.05);
 temp+= (21.5-temp)*.002+(Math.random()-.5)*.02;if(Math.random()<.0015){temp-=2+Math.random()*3;ev('Temperature',`Sudden drop to ${temp.toFixed(1)}°C`)}
 if(emf>3.2&&!loop.cool){loop.cool=60;ev('EMF spike',`Level ${emf.toFixed(1)} (${sensor})`);anom.push({a:ang+Math.random(),r:.3+Math.random()*.6,life:200})}if(loop.cool)loop.cool--;
 if(Math.random()<.003)anom.push({a:Math.random()*6.28,r:.2+Math.random()*.7,life:160});
 drawEMF();drawRadar();$('tmp').textContent=temp.toFixed(1)+'°C';$('tmp').classList.toggle('cold',temp<19);$('micLv').style.width=Math.min(100,mic*100)+'%';$('sens').textContent='SENSOR: '+sensor;
 if(camOn)drawCam();requestAnimationFrame(loop)}
function drawEMF(){const W=360,H=200;em.clearRect(0,0,W,H);em.strokeStyle='#e8c766';em.lineWidth=3;em.beginPath();em.arc(W/2,H-10,150,Math.PI,0);em.stroke();
 for(let i=0;i<=10;i++){const a=Math.PI+i*Math.PI/10;em.beginPath();em.moveTo(W/2+Math.cos(a)*140,H-10+Math.sin(a)*140);em.lineTo(W/2+Math.cos(a)*(i%5?128:118),H-10+Math.sin(a)*(i%5?128:118));em.stroke()}
 em.fillStyle='#e8c766';em.font='12px monospace';['0','1','2','3','4','5'].forEach((t,i)=>{const a=Math.PI+i*Math.PI/5;em.fillText(t,W/2+Math.cos(a)*105-4,H-10+Math.sin(a)*105+4)});
 const a=Math.PI+Math.min(emf,5)/5*Math.PI;em.strokeStyle='#ff4a3a';em.lineWidth=4;em.beginPath();em.moveTo(W/2,H-10);em.lineTo(W/2+Math.cos(a)*135,H-10+Math.sin(a)*135);em.stroke();em.fillStyle='#e8c766';em.beginPath();em.arc(W/2,H-10,8,0,7);em.fill();
 document.querySelectorAll('#leds i').forEach((l,i)=>l.classList.toggle('on',emf>i));$('emfV').textContent=emf.toFixed(2)+' mG*'}
function drawRadar(){const W=300,c=W/2;rd.fillStyle='rgba(0,20,8,.18)';rd.fillRect(0,0,W,W);rd.strokeStyle='#1f6b3a';[.33,.66,1].forEach(r=>{rd.beginPath();rd.arc(c,c,r*140,0,7);rd.stroke()});rd.beginPath();rd.moveTo(0,c);rd.lineTo(W,c);rd.moveTo(c,0);rd.lineTo(c,W);rd.stroke();
 ang+=.035;rd.strokeStyle='#3cff8a';rd.lineWidth=2;rd.beginPath();rd.moveTo(c,c);rd.lineTo(c+Math.cos(ang)*140,c+Math.sin(ang)*140);rd.stroke();
 anom=anom.filter(b=>b.life-->0);anom.forEach(b=>{rd.fillStyle=`rgba(255,${90+b.life/2|0},60,${b.life/200})`;rd.beginPath();rd.arc(c+Math.cos(b.a)*b.r*140,c+Math.sin(b.a)*b.r*140,6,0,7);rd.fill()});$('blips').textContent=anom.length+' anomal'+(anom.length==1?'y':'ies')}
// ---- camera ----
const cc=$('cam').getContext('2d'),vid=document.createElement('video');vid.playsInline=true;vid.muted=true;
async function startCam(){try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});vid.srcObject=s;await vid.play();camOn=true;ev('System','Camera connected – '+filt+' mode')}catch(e){camOn=true;vid.srcObject=null;ev('System','Camera unavailable – simulated feed')}}
function drawCam(){const W=480,H=320;if(vid.srcObject&&vid.readyState>=2)cc.drawImage(vid,0,0,W,H);else{const g=cc.createLinearGradient(0,0,W,H);g.addColorStop(0,'#111');g.addColorStop(1,'#222');cc.fillStyle=g;cc.fillRect(0,0,W,H);for(let i=0;i<4;i++){cc.fillStyle='#333';cc.fillRect(60+i*100,120+Math.sin(i)*20,60,140)}}
 const im=cc.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255,n=(Math.random()-.5)*.12;if(filt=='night'){d[i]=l*60;d[i+1]=Math.min(255,(l+n)*330);d[i+2]=l*60}else{const v=Math.max(0,Math.min(1,l+n*.5));d[i]=255*Math.min(1,v*2);d[i+1]=255*Math.max(0,Math.min(1,v*2-.6));d[i+2]=255*Math.max(0,1-v*2.2)}}cc.putImageData(im,0,0);
 cc.strokeStyle='#e8c766';cc.lineWidth=1;cc.strokeRect(W/2-30,H/2-30,60,60);cc.fillStyle='#e8c766';cc.font='12px monospace';cc.fillText((filt=='night'?'IR NIGHT':'THERMAL')+'  '+new Date().toLocaleTimeString('en-AU',{hour12:false}),10,18);cc.fillText('● REC',W-60,18);
 if(emf>2.8){cc.fillStyle='rgba(220,240,255,.18)';cc.beginPath();cc.ellipse(W*.6,H*.5,26,70,0,0,7);cc.fill()}}
// ---- spirit box ----
let sb=null,sbT;const WORDS=['HELLO','HERE','COLD','LEAVE','STAY','NAME','HOME','LIGHT','DARK','MUM','HELP','FRIEND','YES','NO','BEHIND','WAIT','REMEMBER','CANDLE','SING','DOOR','STAIRS','SORRY','CHILD','WATER','COFFEE','KAREN','LISTEN','NOW'];
function spiritBox(){if(sb){sb.src.stop();sb=null;clearInterval(sbT);$('sbBtn').textContent='📻 Start spirit box sweep';$('freq').textContent='--.- MHz';return}
 AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume();const n=AC.sampleRate*2,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 const src=AC.createBufferSource();src.buffer=b;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=4;const g=AC.createGain();g.gain.value=.12;src.connect(bp);bp.connect(g);g.connect(AC.destination);src.start();sb={src,bp,g};
 let f=87.5;sbT=setInterval(()=>{f+=.2;if(f>108)f=87.5;bp.frequency.value=300+Math.random()*2500;g.gain.value=Math.random()<.15?0:.08+Math.random()*.1;$('freq').textContent=f.toFixed(1)+' MHz';if(Math.random()<.04){const w=WORDS[Math.random()*WORDS.length|0];$('word').textContent=w;$('word').classList.remove('pop');void $('word').offsetWidth;$('word').classList.add('pop');ev('Spirit box word',`"${w}" at ${f.toFixed(1)} MHz`)}},90);$('sbBtn').textContent='■ Stop sweep'}
// ---- EVP recorder ----
let rec,chunks=[],lastBlob=null,lastBuf=null;
async function evp(){if(rec&&rec.state=='recording'){rec.stop();return}
 try{if(!stream)await startMic();rec=new MediaRecorder(stream);chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=async()=>{lastBlob=new Blob(chunks,{type:rec.mimeType});$('evpBtn').textContent='⏺ Record EVP (10s)';try{lastBuf=await AC.decodeAudioData(await lastBlob.arrayBuffer());wave(lastBuf)}catch(e){}ev('EVP session','10 second recording captured');$('evpPlay').disabled=$('evpRev').disabled=false};rec.start();$('evpBtn').textContent='■ Recording… tap to stop';setTimeout(()=>rec.state=='recording'&&rec.stop(),10000)}
 catch(e){AC=AC||new (window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*3;lastBuf=AC.createBuffer(1,n,AC.sampleRate);const d=lastBuf.getChannelData(0);for(let i=0;i<n;i++){const t=i/AC.sampleRate;d[i]=(Math.random()*2-1)*.05+(t>1.2&&t<1.8?Math.sin(t*900)*.3*Math.sin((t-1.2)*5.2):0)}wave(lastBuf);ev('EVP session','Simulated recording (no microphone)');$('evpPlay').disabled=$('evpRev').disabled=false}}
function wave(buf){const c=$('wave').getContext('2d'),W=600,H=110,d=buf.getChannelData(0);c.fillStyle='#050805';c.fillRect(0,0,W,H);c.strokeStyle='#3cff8a';c.beginPath();for(let x=0;x<W;x++){let m=0;const s=Math.floor(x*d.length/W),e=Math.floor((x+1)*d.length/W);for(let i=s;i<e;i++)m=Math.max(m,Math.abs(d[i]));c.moveTo(x,H/2-m*H/2);c.lineTo(x,H/2+m*H/2)}c.stroke()}
function playBuf(rev){if(!lastBuf)return;AC.resume();let b=lastBuf;if(rev){b=AC.createBuffer(1,lastBuf.length,lastBuf.sampleRate);const s=lastBuf.getChannelData(0),d=b.getChannelData(0);for(let i=0;i<s.length;i++)d[i]=s[s.length-1-i]}const src=AC.createBufferSource();src.buffer=b;src.connect(AC.destination);src.start()}
// ---- log + report ----
function drawLog(){$('log').innerHTML=LOG.slice(0,40).map(l=>`<li><time>${l.t}</time> <b>${l.type}</b> ${l.detail}</li>`).join('')||'<li>No evidence yet. Start scanning…</li>';$('logN').textContent=LOG.length}
function report(){const txt='COFFEEBREAK GHOST DETECTOR PRO – SESSION REPORT\nFor entertainment only. Readings are not scientific evidence of paranormal activity.\nGenerated: '+ts()+'\nSensor: '+sensor+'\n\n'+LOG.map(l=>`[${l.t}] ${l.type}: ${l.detail}`).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download='ghost-session-report.txt';document.body.appendChild(a);a.click();a.remove();ev('System','Report exported')}
$('startBtn').onclick=()=>{startMag();startMic();$('startBtn').textContent='✔ Sensors armed';ev('System','Scan started')};
$('camBtn').onclick=startCam;$('filtBtn').onclick=()=>{filt=filt=='night'?'thermal':'night';$('filtBtn').textContent=filt=='night'?'🌡️ Switch to thermal':'🌙 Switch to night vision'};
$('sbBtn').onclick=spiritBox;$('evpBtn').onclick=evp;$('evpPlay').onclick=()=>playBuf(false);$('evpRev').onclick=()=>playBuf(true);
$('repBtn').onclick=report;$('clrLog').onclick=()=>{if(confirm('Clear the evidence log?')){LOG=[];saveLog();drawLog()}};$('markBtn').onclick=()=>ev('Investigator note',prompt('What did you notice?')||'Marked moment');
drawLog();loop();
})();
