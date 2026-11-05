// Coffeebreak virtual wig try-on. Everything runs on this device: camera frames and selfies are never uploaded.
const T=window.CB_TRYON||{};let lm=null,lmErr=null,mode='IMAGE',ov=new Image(),cur=null,src=null,stream=null,raf=0,man={dx:0,dy:0,s:1,r:0},auto=null,fit=null;
const $=i=>document.getElementById(i);
const modal=document.createElement('div');modal.id='tryon';modal.hidden=true;
modal.innerHTML=`<div class="tbox"><button class="tx" aria-label="Close">✕</button><h2>Try it on</h2><p class="tpriv">🔒 Your camera and photos stay on your device. Nothing is uploaded or saved by us.</p>
<div class="tbtns"><button id="tCam">📷 Use camera</button><label class="tup">🖼️ Upload selfie<input id="tFile" type="file" accept="image/*" hidden></label><button id="tSnap" disabled>💾 Save photo</button></div>
<div class="tstage"><canvas id="tCv" width="720" height="960"></canvas><video id="tVid" playsinline muted hidden></video></div>
<p id="tMsg" class="tmsg">Pick camera or a selfie to start.</p>
<div class="tadj">Adjust: <button data-a="u">⬆</button><button data-a="d">⬇</button><button data-a="l">⬅</button><button data-a="r">➡</button><button data-a="+">＋</button><button data-a="-">－</button><button data-a="cw">⟳</button><button data-a="ccw">⟲</button><button data-a="0">Reset</button><br><small>Or drag the wig, scroll / pinch to resize.</small></div></div>`;
document.body.appendChild(modal);
const cv=$('tCv'),cx=cv.getContext('2d'),vid=$('tVid'),msg=t=>$('tMsg').textContent=t;
async function loadLM(){if(lm||lmErr)return lm;try{const V=await import('./lib/vision_bundle.mjs');const fs=await V.FilesetResolver.forVisionTasks(new URL('./lib',import.meta.url).href);
 lm=await V.FaceLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:new URL('./lib/face.task',import.meta.url).href},runningMode:'IMAGE',numFaces:1});}catch(e){lmErr=e;console.warn('face detection unavailable',e)}return lm}
async function setMode(m){if(lm&&mode!=m){await lm.setOptions({runningMode:m});mode=m}}
function detect(el,ts){if(!lm)return null;try{const r=mode=='VIDEO'?lm.detectForVideo(el,ts):lm.detect(el);const L=r.faceLandmarks&&r.faceLandmarks[0];if(!L)return null;
 const W=cv.width,H=cv.height,P=i=>({x:L[i].x*W,y:L[i].y*H}),a=P(234),b=P(454),t=P(10),c=P(152);
 return {x:(t.x+c.x)/2,y:(t.y+c.y)/2,w:Math.hypot(b.x-a.x,b.y-a.y),r:Math.atan2(b.y-a.y,b.x-a.x)}}catch(e){return null}}
function drawSrc(el,w,h){const s=Math.max(cv.width/w,cv.height/h);cx.save();if(el===vid){cx.translate(cv.width,0);cx.scale(-1,1)}cx.drawImage(el,(cv.width-w*s)/2,(cv.height-h*s)/2,w*s,h*s);cx.restore()}
function render(){const f=fit||{x:cv.width/2,y:cv.height*.42,w:cv.width*.42,r:0};if(!cur||!ov.complete||!ov.naturalWidth)return;
 const k=(f.w/cur.w)*1.05*man.s,ax=cur.x+cur.w/2,ay=cur.y+cur.h*.5;cx.save();cx.translate(f.x+man.dx,f.y+man.dy);cx.rotate(f.r+man.r);cx.drawImage(ov,-ax*k,-ay*k,cur.W*k,cur.H*k);cx.restore()}
function frame(ts){if(!stream)return;drawSrc(vid,vid.videoWidth,vid.videoHeight);const ctx2=detect(cv,ts);if(ctx2){fit=ctx2;}render();raf=requestAnimationFrame(frame)}
function stop(){cancelAnimationFrame(raf);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
async function still(img){stop();src=img;drawSrc(img,img.naturalWidth,img.naturalHeight);await loadLM();await setMode('IMAGE');fit=detect(cv);redraw();
 msg(fit?'Face found ✓ Use the arrows or drag to fine-tune.':(lm?'Couldn\'t find a face, so place the wig by dragging, resizing and rotating.':'Face detection isn\'t available on this device, so place the wig by hand.'));$('tSnap').disabled=false}
function redraw(){if(stream)return;if(src)drawSrc(src,src.naturalWidth,src.naturalHeight);else{cx.fillStyle='#f3ece6';cx.fillRect(0,0,cv.width,cv.height)}render()}
$('tFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{still(i);URL.revokeObjectURL(u)};i.src=u};
$('tCam').onclick=async()=>{try{stop();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:720,height:960},audio:false});vid.srcObject=stream;await vid.play();src=null;msg('Loading face tracking…');await loadLM();await setMode('VIDEO');
 msg(lm?'Camera on. Look straight ahead.':'Camera on. Face tracking isn\'t available here, so drag the wig into place.');$('tSnap').disabled=false;raf=requestAnimationFrame(frame)}catch(e){msg('Camera not available or blocked. Try uploading a selfie instead.')}};
$('tSnap').onclick=()=>{const a=document.createElement('a');a.download='coffeebreak-wig-tryon.png';a.href=cv.toDataURL('image/png');a.click()};
modal.querySelector('.tx').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
function close(){stop();modal.hidden=true}
modal.querySelector('.tadj').onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;const m={u:()=>man.dy-=8,d:()=>man.dy+=8,l:()=>man.dx-=8,r:()=>man.dx+=8,'+':()=>man.s*=1.05,'-':()=>man.s/=1.05,cw:()=>man.r+=.05,ccw:()=>man.r-=.05,'0':()=>man={dx:0,dy:0,s:1,r:0}};m[a]();redraw()};
let drag=null;const pt=e=>{const b=cv.getBoundingClientRect();return {x:(e.clientX-b.left)*cv.width/b.width,y:(e.clientY-b.top)*cv.height/b.height}};
const pts=new Map();cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,pt(e));drag={p:pt(e),m:{...man},d:null}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,pt(e));const v=[...pts.values()];
 if(v.length==2){const d=Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y),an=Math.atan2(v[1].y-v[0].y,v[1].x-v[0].x);if(!drag.d){drag.d=d;drag.an=an;drag.m={...man}}man.s=drag.m.s*d/drag.d;man.r=drag.m.r+an-drag.an}
 else if(drag&&!drag.d){const p=pt(e);man.dx=drag.m.dx+p.x-drag.p.x;man.dy=drag.m.dy+p.y-drag.p.y}redraw()});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{pts.delete(e.pointerId);if(!pts.size)drag=null}));
cv.addEventListener('wheel',e=>{e.preventDefault();man.s*=e.deltaY<0?1.05:1/1.05;redraw()},{passive:false});
window.cbTryOn=id=>{const t=T[id];if(!t)return;cur=t;man={dx:0,dy:0,s:1,r:0};ov=new Image();ov.onload=redraw;ov.src='tryon/'+id+'.png';modal.hidden=false;if(!stream&&!src){fit=null;redraw()}};
window.cbTryOnReady=true;
