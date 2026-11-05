// Coffeebreak Sketch engine (shared with Fashion Sketch)
(function(){
const $=id=>document.getElementById(id);
let W=1200,H=900;
const S={tool:'pencil',size:6,opacity:1,color:'#1a1a1a',layers:[],cur:0,undo:[],redo:[],pattern:null,stamp:null};
const stage=$('stage'),view=$('view'),vctx=view.getContext('2d');
view.width=W;view.height=H;
function mkLayer(name){const c=document.createElement('canvas');c.width=W;c.height=H;return {name,c,ctx:c.getContext('2d',{willReadFrequently:true}),vis:true,op:1}}
function render(){vctx.fillStyle='#fff';vctx.fillRect(0,0,W,H);
 if(S.bg){vctx.globalAlpha=S.bgOp||.4;vctx.drawImage(S.bg,0,0,W,H);vctx.globalAlpha=1}
 S.layers.forEach(l=>{if(l.vis){vctx.globalAlpha=l.op;vctx.drawImage(l.c,0,0)}});vctx.globalAlpha=1;
 if(S.live)S.live();}
function snap(){const l=S.layers[S.cur];S.undo.push({i:S.cur,d:l.ctx.getImageData(0,0,W,H)});if(S.undo.length>40)S.undo.shift();S.redo=[]}
function undo(){const u=S.undo.pop();if(!u)return;const l=S.layers[u.i];if(!l)return;S.redo.push({i:u.i,d:l.ctx.getImageData(0,0,W,H)});l.ctx.putImageData(u.d,0,0);render()}
function redo(){const u=S.redo.pop();if(!u)return;const l=S.layers[u.i];S.undo.push({i:u.i,d:l.ctx.getImageData(0,0,W,H)});l.ctx.putImageData(u.d,0,0);render()}
function addLayer(name){S.layers.push(mkLayer(name||('Layer '+(S.layers.length+1))));S.cur=S.layers.length-1;drawLayers();render()}
function drawLayers(){const el=$('layers');if(!el)return;el.innerHTML='';
 S.layers.slice().reverse().forEach((l,ri)=>{const i=S.layers.length-1-ri;const d=document.createElement('div');d.className='layer'+(i==S.cur?' on':'');
  d.innerHTML=`<input type="checkbox" ${l.vis?'checked':''} title="Show/hide"><span>${l.name}</span><button title="Delete">✕</button>`;
  d.onclick=e=>{if(e.target.tagName=='INPUT'){l.vis=e.target.checked;render();return}if(e.target.tagName=='BUTTON'){if(S.layers.length>1){S.layers.splice(i,1);S.cur=Math.min(S.cur,S.layers.length-1);S.undo=S.undo.filter(u=>u.i!=i);drawLayers();render()}return}S.cur=i;drawLayers()};el.appendChild(d)})}
function pos(e){const r=view.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,p:e.pointerType=='mouse'?0.6:(e.pressure||0.5)}}
function hexA(h){const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255]}
function style(ctx,p){const t=S.tool,c=S.color;let w=S.size,a=S.opacity;
 ctx.globalCompositeOperation=t=='eraser'?'destination-out':'source-over';ctx.lineCap='round';ctx.lineJoin='round';
 if(t=='pencil'){w=Math.max(1,w*0.5*(0.4+p));a*=0.85}
 if(t=='pen'){w=w*(0.3+p*1.2)}
 if(t=='brush'){w=w*(0.5+p*1.5)}
 if(t=='marker'){a*=0.45;ctx.lineCap='square'}
 ctx.lineWidth=w;ctx.strokeStyle=t=='eraser'?'#000':(S.pattern&&t!='pencil'&&t!='pen'?S.pattern:c);ctx.globalAlpha=t=='eraser'?1:a}
let drawing=false,last=null,buf=null;
function fill(x,y){const l=S.layers[S.cur],ctx=l.ctx;x|=0;y|=0;
 // sample from the composite so you can fill inside lines on other layers
 const src=vctx.getImageData(0,0,W,H).data,out=ctx.getImageData(0,0,W,H);
 const i0=(y*W+x)*4,tr=src[i0],tg=src[i0+1],tb=src[i0+2],tol=40,seen=new Uint8Array(W*H),st=[x+y*W];
 const mask=document.createElement('canvas');mask.width=W;mask.height=H;const mc=mask.getContext('2d'),md=mc.createImageData(W,H);
 while(st.length){const p=st.pop();if(seen[p])continue;seen[p]=1;const k=p*4;
  if(Math.abs(src[k]-tr)+Math.abs(src[k+1]-tg)+Math.abs(src[k+2]-tb)>tol)continue;md.data[k+3]=255;
  const px=p%W;if(px>0)st.push(p-1);if(px<W-1)st.push(p+1);if(p>=W)st.push(p-W);if(p<W*(H-1))st.push(p+W)}
 mc.putImageData(md,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle=S.pattern||S.color;mc.fillRect(0,0,W,H);
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=S.opacity;ctx.drawImage(mask,0,0);ctx.globalAlpha=1;render()}
view.addEventListener('pointerdown',e=>{e.preventDefault();view.setPointerCapture(e.pointerId);const p=pos(e);snap();
 if(S.tool=='fill'){fill(p.x,p.y);return}
 if(S.tool=='stamp'&&S.stamp){const ctx=S.layers[S.cur].ctx;ctx.globalCompositeOperation='source-over';ctx.globalAlpha=S.opacity;ctx.fillStyle=S.pattern||S.color;ctx.strokeStyle='#222';ctx.lineWidth=2;
  const sc=S.size/6;ctx.save();ctx.translate(p.x,p.y);ctx.scale(sc,sc);const pa=new Path2D(S.stamp);ctx.fill(pa);ctx.stroke(pa);ctx.restore();ctx.globalAlpha=1;render();return}
 drawing=true;last=p;const ctx=S.layers[S.cur].ctx;style(ctx,p.p);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y);ctx.stroke();render()});
view.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];const ctx=S.layers[S.cur].ctx;
 for(const ev of (evs.length?evs:[e])){const p=pos(ev);style(ctx,p.p);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p}render()});
['pointerup','pointercancel','pointerleave'].forEach(n=>view.addEventListener(n,()=>{drawing=false}));
view.style.touchAction='none';
function exportPNG(){return view.toDataURL('image/png')}
function savePNG(name){const a=document.createElement('a');a.href=exportPNG();a.download=(name||'coffeebreak-sketch')+'.png';document.body.appendChild(a);a.click();a.remove()}
const GKEY=(window.CB_GALLERY_KEY||'cb_sketch_gallery');
function gallery(){try{return JSON.parse(localStorage.getItem(GKEY)||'[]')}catch(e){return []}}
function thumb(){const t=document.createElement('canvas');t.width=400;t.height=300;t.getContext('2d').drawImage(view,0,0,400,300);return t.toDataURL('image/jpeg',.8)}
function saveGallery(){const g=gallery();const full=view.toDataURL('image/jpeg',.85);g.unshift({t:Date.now(),thumb:thumb(),full});
 while(g.length){try{localStorage.setItem(GKEY,JSON.stringify(g));break}catch(e){g.pop();if(!g.length)alert('Storage full – save as PNG instead')}}drawGallery()}
function drawGallery(){const el=$('gallery');if(!el)return;const g=gallery();el.innerHTML=g.length?'':'<p class="muted">No saved drawings yet.</p>';
 g.forEach((it,i)=>{const d=document.createElement('div');d.className='gi';d.innerHTML=`<img src="${it.thumb}" alt="Saved drawing"><div><button data-a="open">Open</button><button data-a="del">Delete</button></div>`;
  d.onclick=e=>{const a=e.target.dataset.a;if(a=='del'){g.splice(i,1);localStorage.setItem(GKEY,JSON.stringify(g));drawGallery()}if(a=='open'){const im=new Image();im.onload=()=>{snap();const c=S.layers[S.cur].ctx;c.globalCompositeOperation='source-over';c.globalAlpha=1;c.drawImage(im,0,0,W,H);render()};im.src=it.full}};el.appendChild(d)})}
function importImage(file){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');const s=Math.min(W/im.width,H/im.height);x.drawImage(im,(W-im.width*s)/2,(H-im.height*s)/2,im.width*s,im.height*s);S.bg=c;render()};im.src=r.result};r.readAsDataURL(file)}
function clearLayer(){snap();S.layers[S.cur].ctx.clearRect(0,0,W,H);render()}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='z'){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='y'){e.preventDefault();redo()}});
window.CBSketch={S,W,H,addLayer,drawLayers,render,undo,redo,savePNG,saveGallery,drawGallery,importImage,clearLayer,snap,exportPNG,gallery};
function cbcp(c,w,h,bg){var t=document.createElement('canvas');t.width=c.width;t.height=c.height;t.getContext('2d').drawImage(c,0,0);var k=Math.min(1,w/c.width,h/c.height);c.width=w;c.height=h;var x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.drawImage(t,0,0,t.width*k,t.height*k)};window.CBResizeCanvas=function(w,h){w=Math.round(w);h=Math.round(h);if(w<50||h<50||(w==W&&h==H))return;S.layers.forEach(function(l,i){cbcp(l.c,w,h,null)});W=w;H=h;view.width=W;view.height=H;view.style.aspectRatio=W+'/'+H;S.undo.length=0;S.redo.length=0;render()};
})();
