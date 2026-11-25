'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS=localStorage;
// ---------- nav ----------
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.s));
function show(s){$$('nav button').forEach(x=>x.classList.toggle('on',x.dataset.s===s));$$('main section').forEach(x=>x.classList.toggle('on',x.id===s));if(s==='gal')loadGal();if(s==='ed'&&!base)demo()}
if(!LS.cbAge)$('#ageM').style.display='flex';$('#ageOk').onclick=()=>{LS.cbAge=1;$('#ageM').style.display='none'};
// quick hide
$('#qh').onclick=()=>{$('#hide').style.display='flex';stopCam()};let ht=0;$('#hide').onclick=()=>{if(Date.now()-ht<500){$('#hide').style.display='none';if(LS.cbPin)lock()}ht=Date.now()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#qh').click()});
// ---------- camera ----------
let stream=null,facing='user',mirror=true;const vid=$('#vid');
const LIVE={none:'',soft:'brightness(1.08) contrast(.9) blur(.6px)',warm:'sepia(.25) saturate(1.1) hue-rotate(-8deg)',cool:'saturate(.95) hue-rotate(12deg) brightness(1.02)'};
async function startCam(){stopCam();try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:3840},height:{ideal:2160}},audio:false});vid.srcObject=stream;$('#camMsg').style.display='none';applyCam()}catch(e){$('#camMsg').textContent='Camera not available: '+e.message}}
function stopCam(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null}
function applyCam(){vid.style.transform=mirror?'scaleX(-1)':'';vid.style.filter=LIVE[$('#live').value];const r=CB.aspectCrop(16,9,$('#ar').value);vid.style.aspectRatio=$('#ar').value.replace(':','/');vid.style.objectFit='cover';vid.style.height='100%'}
$('#start').onclick=startCam;$('#flip').onclick=()=>{facing=facing==='user'?'environment':'user';mirror=facing==='user';startCam()};
$('#mir').onclick=()=>{mirror=!mirror;$('#mir').classList.toggle('on',mirror);applyCam()};$('#live').onchange=$('#ar').onchange=applyCam;
$('#gridB').onclick=()=>{$('#gridOv').classList.toggle('grid');$('#gridB').classList.toggle('on')};
const ring=document.createElement('div');ring.className='ring';document.body.appendChild(ring);
$('#ringSel').onchange=e=>{ring.style.display=e.target.value?'block':'none';ring.classList.toggle('warm',e.target.value==='warm')};
const POSES={stand:'M50 8a8 8 0 1 1 0 .1M44 20q-8 4-6 24l4 18q-6 14-4 34l4 22h6l2-26 2 26h6l4-22q2-20-4-34l4-18q2-20-6-24z',
 seat:'M45 10a8 8 0 1 1 0 .1M40 22q-8 4-6 22l2 22h34l8 22h8l-6-30H52l-2-14q0-18-10-22z',
 lean:'M58 10a8 8 0 1 1 0 .1M52 22q-10 6-12 24l-6 20q-2 16 2 30l2 26h7l2-28 8 28h7l-4-30q2-18-2-34l4-14q0-18-8-22z',
 portrait:'M50 20a20 22 0 1 1 0 .1M20 128q4-46 30-48t30 48z'};
$('#pose').onchange=e=>{const p=POSES[e.target.value];$('#poseOv').innerHTML=p?`<svg viewBox="0 0 100 130" style="height:85%"><path d="${p}" fill="none" stroke="#e8b4b8" stroke-width="1.2" stroke-dasharray="3 2" opacity=".85"/></svg>`:''};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
$('#shoot').onclick=async()=>{if(!stream)return startCam();let t=+$('#timer').value;while(t>0){$('#count').textContent=t--;await sleep(1000)}$('#count').textContent='';
 for(let n=+$('#burst').value;n>0;n--){const c=grabFrame();const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.95));await dbPut(blob);flash();if(n>1)await sleep(350)}
 $('#count').textContent='Saved';setTimeout(()=>$('#count').textContent='',800)};
function grabFrame(){const w=vid.videoWidth,h=vid.videoHeight,r=CB.aspectCrop(w,h,$('#ar').value),c=document.createElement('canvas');c.width=r.w;c.height=r.h;const x=c.getContext('2d');
 if(mirror){x.translate(r.w,0);x.scale(-1,1)}x.filter=LIVE[$('#live').value]||'none';x.drawImage(vid,r.x,r.y,r.w,r.h,0,0,r.w,r.h);return c}
function flash(){const s=$('#camStage');s.style.outline='4px solid #fff';setTimeout(()=>s.style.outline='',120)}
// ---------- IndexedDB gallery ----------
let dbp;function db(){return dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('cbbs',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))}
async function dbTx(m,f){const d=await db();return new Promise((res,rej)=>{const t=d.transaction('p',m),q=f(t.objectStore('p'));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)})}
const dbPut=blob=>dbTx('readwrite',s=>s.add({blob,t:Date.now()}));const dbAll=()=>dbTx('readonly',s=>s.getAll());const dbDel=id=>dbTx('readwrite',s=>s.delete(id));
async function loadGal(){const g=$('#galGrid');g.innerHTML='';const all=(await dbAll()).reverse();if(!all.length)g.innerHTML='<p style="color:var(--mu)">No photos yet.</p>';
 for(const p of all){const d=document.createElement('div'),u=URL.createObjectURL(p.blob);d.innerHTML=`<img src="${u}"><div class="row"><button data-a="e">Edit</button><button data-a="d">Delete</button></div>`;
  d.querySelector('[data-a=e]').onclick=()=>{loadImg(u);show('ed')};d.querySelector('[data-a=d]').onclick=async()=>{if(confirm('Delete this photo from this device?')){await dbDel(p.id);loadGal()}};g.appendChild(d)}}
// PIN
function lock(){$('#lock').style.display='flex';$('#pinIn').value='';$('#pinIn').focus()}
$('#pinGo').onclick=async()=>{if(await CB.hashPin($('#pinIn').value)===LS.cbPin){$('#lock').style.display='none';$('#pinMsg').textContent=''}else $('#pinMsg').textContent='Wrong PIN'};
$('#pinIn').onkeydown=e=>{if(e.key==='Enter')$('#pinGo').click()};
$('#setPin').onclick=async()=>{const p=prompt('New 4-digit PIN');if(p===null)return;if(!CB.validPin(p))return alert('PIN must be 4 digits');LS.cbPin=await CB.hashPin(p);alert('PIN set')};
$('#clrPin').onclick=()=>{delete LS.cbPin;alert('PIN removed')};$('#lockNow').onclick=()=>LS.cbPin?lock():alert('Set a PIN first');
if(LS.cbPin)lock();
// ---------- editor ----------
const cv=$('#cv'),cx=cv.getContext('2d',{willReadFrequently:true});let base=null,params={...CB.DEF},texts=[],hist=[],fut=[],healing=false,comparing=false;
const PREV=1400;const SL=[['exposure',-100,100],['contrast',-100,100],['warmth',-60,60],['tint',-50,50],['saturation',-100,100],['fade',0,100],['grain',0,100],['vignette',0,100],['glow',0,100],['smooth',0,100]];
$('#sliders').innerHTML=SL.map(([k,a,b])=>`<label>${k==='glow'?'soft glow':k==='smooth'?'skin smoothing':k}<input type="range" min="${a}" max="${b}" value="0" data-k="${k}"></label>`).join('');
$$('#sliders input').forEach(i=>{i.onpointerdown=()=>snap();i.oninput=()=>{params[i.dataset.k]=+i.value;render()}});
const PN={none:'Original',silk:'Silk',champagne:'Champagne',noir:'Noir B&W',vintage:'Vintage Film',rosegold:'Rose Gold',cbwarm:'Coffeebreak Warm'};
$('#presets').innerHTML=Object.keys(PN).map(k=>`<button data-p="${k}">${PN[k]}${CB.PRO.includes(k)?' (Pro)':''}</button>`).join('');
$$('#presets button').forEach(b=>b.onclick=()=>{const k=b.dataset.p;if(CB.PRO.includes(k)&&!LS.cbPro){show('pro');$('#proMsg').textContent='This look is part of Pro looks.';return}snap();params={...CB.DEF,...CB.PRESETS[k]};syncSl();render()});
function syncSl(){$$('#sliders input').forEach(i=>i.value=params[i.dataset.k]||0)}
function cloneC(c){const n=document.createElement('canvas');n.width=c.width;n.height=c.height;n.getContext('2d').drawImage(c,0,0);return n}
function snap(){if(!base)return;hist.push({base:cloneC(base),params:{...params},texts:texts.map(t=>({...t})),wm:$('#wm').checked});if(hist.length>20)hist.shift();fut=[]}
function restore(s){base=s.base;params=s.params;texts=s.texts;$('#wm').checked=s.wm;syncSl();render()}
$('#undo').onclick=()=>{if(!hist.length)return;fut.push({base:cloneC(base),params:{...params},texts:[...texts],wm:$('#wm').checked});restore(hist.pop())};
$('#redo').onclick=()=>{if(!fut.length)return;hist.push({base:cloneC(base),params:{...params},texts:[...texts],wm:$('#wm').checked});restore(fut.pop())};
function setBase(src){base=document.createElement('canvas');base.width=src.naturalWidth||src.width;base.height=src.naturalHeight||src.height;base.getContext('2d').drawImage(src,0,0);hist=[];fut=[];params={...CB.DEF};texts=[];syncSl();render()}
function loadImg(u){const i=new Image();i.onload=()=>setBase(i);i.src=u}
$('#open').onclick=()=>$('#file').click();$('#file').onchange=e=>{const f=e.target.files[0];if(f)loadImg(URL.createObjectURL(f))};
function demoCanvas(w=1600,h=2000){ // silk fabric texture + rose, generated, no photo needed
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#3a2420');g.addColorStop(.5,'#c98f86');g.addColorStop(1,'#2a1816');x.fillStyle=g;x.fillRect(0,0,w,h);
 for(let k=0;k<40;k++){x.beginPath();const y0=k*h/40;x.moveTo(0,y0);for(let X=0;X<=w;X+=40)x.lineTo(X,y0+Math.sin(X/180+k*.7)*120+Math.sin(X/60+k)*20);x.strokeStyle=`rgba(255,${220-k*2},200,${.05+.1*Math.abs(Math.sin(k))})`;x.lineWidth=30;x.stroke()}
 x.save();x.translate(w*.5,h*.45);for(let r=0;r<5;r++)for(let p=0;p<7;p++){x.rotate(Math.PI*2/7+r*.3);x.beginPath();x.ellipse(0,(5-r)*30,(6-r)*28,(6-r)*45,0,0,Math.PI*2);x.fillStyle=`rgba(${200+r*10},${90+r*20},${100+r*15},.55)`;x.fill()}x.restore();return c}
function demo(){setBase(demoCanvas())}$('#demo').onclick=demo;
function process(src,scale){ // returns canvas with full pipeline
 const w=Math.round(src.width*scale),h=Math.round(src.height*scale),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(src,0,0,w,h);
 if(comparing)return c;let d=x.getImageData(0,0,w,h);const blurred=r=>{const b=document.createElement('canvas');b.width=w;b.height=h;const bx=b.getContext('2d');bx.filter=`blur(${r}px)`;bx.drawImage(c,0,0);return bx.getImageData(0,0,w,h).data};
 if(params.smooth)CB.blend(d.data,blurred(Math.max(1,w/400)),params.smooth/100*.7);
 if(params.glow)CB.screen(d.data,blurred(Math.max(2,w/80)),params.glow/100*.6);
 CB.adjust(d.data,w,h,params);x.putImageData(d,0,0);
 for(const t of texts){x.font=`${t.size*w}px Georgia`;x.fillStyle=t.color;x.textAlign='center';x.shadowColor='#0008';x.shadowBlur=w/200;x.fillText(t.text,t.x*w,t.y*h)}
 if($('#wm').checked){x.globalAlpha=.55;x.font=`italic ${w/28}px Georgia`;x.fillStyle='#f4ece2';x.textAlign='right';x.fillText('Coffeebreak',w*.96,h*.96);x.globalAlpha=1}
 return c}
let rq=0;function render(){if(!base)return;cancelAnimationFrame(rq);rq=requestAnimationFrame(()=>{const p=process(base,Math.min(1,PREV/Math.max(base.width,base.height)));cv.width=p.width;cv.height=p.height;cx.drawImage(p,0,0)})}
const cmp=$('#cmp');cmp.onpointerdown=()=>{comparing=true;render()};cmp.onpointerup=cmp.onpointerleave=()=>{comparing=false;render()};
$('#wm').onchange=()=>{render()};
$('#rot').onclick=()=>{if(!base)return;snap();const n=document.createElement('canvas');n.width=base.height;n.height=base.width;const x=n.getContext('2d');x.translate(n.width,0);x.rotate(Math.PI/2);x.drawImage(base,0,0);base=n;render()};
$('#crop').onchange=e=>{if(!base||!e.target.value)return;snap();const r=CB.aspectCrop(base.width,base.height,e.target.value),n=document.createElement('canvas');n.width=r.w;n.height=r.h;n.getContext('2d').drawImage(base,r.x,r.y,r.w,r.h,0,0,r.w,r.h);base=n;e.target.value='';render()};
$('#txtB').onclick=()=>{const t=prompt('Text to add');if(!t)return;snap();texts.push({text:t,x:.5,y:.12,size:.06,color:'#d9c08c'});render()};
$('#heal').onclick=()=>{healing=!healing;$('#heal').classList.toggle('on',healing)};
cv.onpointerdown=e=>{if(!healing||!base)return;snap();const r=cv.getBoundingClientRect(),s=base.width/r.width,X=(e.clientX-r.left)*s,Y=(e.clientY-r.top)*s,R=base.width/60;
 const b=base.getContext('2d');const t=document.createElement('canvas');t.width=t.height=R*4;const tx=t.getContext('2d');tx.filter=`blur(${R/2}px)`;tx.drawImage(base,X-R*2,Y-R*2,R*4,R*4,0,0,R*4,R*4);
 b.save();b.beginPath();b.arc(X,Y,R,0,Math.PI*2);b.clip();b.drawImage(t,X-R*2,Y-R*2);b.restore();render()};
function dl(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
async function exportImg(type){if(!base)return;const c=process(base,1);const b=await new Promise(r=>c.toBlob(r,type,.95));dl(b,'coffeebreak-'+Date.now()+(type==='image/png'?'.png':'.jpg'))}
$('#expJ').onclick=()=>exportImg('image/jpeg');$('#expP').onclick=()=>exportImg('image/png');
$('#saveG').onclick=async()=>{if(!base)return;const c=process(base,1);await dbPut(await new Promise(r=>c.toBlob(r,'image/jpeg',.95)));alert('Saved privately on this device')};
// ---------- consent ----------
{const t=new Date();$('#cDate').value=new Date(t-t.getTimezoneOffset()*6e4).toISOString().slice(0,10)}const sigs={};
$$('.sig').forEach(c=>{const x=c.getContext('2d');let d=false;const fit=()=>{c.width=Math.max(600,c.clientWidth*2);c.height=280;x.lineWidth=4;x.lineCap='round'};fit();c.fit=fit;sigs[c.id]=false;
 const p=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]};
 c.onpointerdown=e=>{if(!sigs[c.id]&&c.width!==Math.max(600,c.clientWidth*2))fit();d=true;c.setPointerCapture(e.pointerId);x.beginPath();x.moveTo(...p(e))};c.onpointermove=e=>{if(!d)return;x.lineTo(...p(e));x.stroke();sigs[c.id]=true};c.onpointerup=()=>d=false});
$$('[data-clr]').forEach(b=>b.onclick=()=>{const c=$('#'+b.dataset.clr);c.fit();sigs[c.id]=false});
function formData(){const uses={};$$('[data-u]').forEach(i=>uses[i.dataset.u]=i.checked);return{date:$('#cDate').value,model:$('#cModel').value.trim(),mc:$('#cMC').value,photographer:$('#cPh').value.trim(),pc:$('#cPC').value,adult:$('#cAdult').checked,uses,limits:$('#cLim').value,support:$('#cSup').value,modelSig:sigs.sigM,photogSig:sigs.sigP}}
function formCanvas(f){const W=1240,H=1754,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#111';let y=90;
 const L=(t,s=26,b)=>{x.font=`${b?'bold ':''}${s}px Georgia`;const words=t.split(' ');let line='';for(const w of words){if(x.measureText(line+w).width>W-160){x.fillText(line,80,y);y+=s*1.4;line=''}line+=w+' '}x.fillText(line,80,y);y+=s*1.5};
 L('Coffeebreak Boudoir Studio: Model Release and Consent Form',34,1);L('Date: '+f.date);L('Model: '+f.model+(f.mc?'  ('+f.mc+')':''));L('Photographer: '+f.photographer+(f.pc?'  ('+f.pc+')':''));
 L('Model confirms they are 18 or over: '+(f.adult?'Yes':'No'));if(f.support)L('Support person present: '+f.support);
 L('Uses agreed (each ticked separately, opt-in only):',26,1);const N={personal:'Personal use only',portfolio:"Photographer's portfolio",social:'Social media',sale:'Sale'};for(const k in N)L((f.uses[k]?'[X] ':'[  ] ')+N[k]+(f.uses[k]?'':' (NOT agreed)'));
 if(f.limits)L('Limits: '+f.limits);
 L('Consent can be withdrawn at any time by telling the photographer in writing. Photos must not be used beyond what is ticked above. After withdrawal the photographer must stop any new use and remove the photos where they control them.',22);
 L('Easy Read: You choose what the photos are used for. Only ticked boxes are allowed. You can say stop at any time. You can take back your yes later. You can bring someone you trust.',22);
 y+=10;L('Model signature',22,1);x.drawImage($('#sigM'),80,y,500,140);y+=170;L('Photographer signature',22,1);x.drawImage($('#sigP'),80,y,500,140);y+=180;L('Coffeebreak keeps all rights to its products, designs, apps, name and logo.',16);return c}
async function exportForm(pdf){const f=formData(),e=CB.consentValid(f);if(e.length){$('#cErr').textContent='Still needed: '+e.join(', ');return}$('#cErr').textContent='';const c=formCanvas(f),n='consent-'+f.date+'-'+f.model.replace(/\W+/g,'-');
 if(!pdf)return dl(await new Promise(r=>c.toBlob(r,'image/png')),n+'.png');const jb=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));dl(new Blob([CB.jpegToPdf(new Uint8Array(await jb.arrayBuffer()),c.width,c.height)],{type:'application/pdf'}),n+'.pdf')}
$('#cPng').onclick=()=>exportForm(false);$('#cPdf').onclick=()=>exportForm(true);
// ---------- pro ----------
function proUi(){if(LS.cbPro)$('#proMsg').textContent='Pro looks are unlocked on this device. Thank you.'}proUi();
$('#unlock').onclick=async()=>{if(await CB.checkCode($('#code').value,window.CB_HASHES)){LS.cbPro=1;proUi()}else $('#proMsg').textContent='That code did not match. Please check it and try again.'};
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});
window.CBApp={show,demo,params:()=>params,setParams:p=>{params={...CB.DEF,...p};syncSl();render()},formData,formCanvas};
