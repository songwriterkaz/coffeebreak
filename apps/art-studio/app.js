(()=>{let W=1200,H=900;const $=id=>document.getElementById(id);
const view=$('view'),vx=view.getContext('2d');view.width=W;view.height=H;
let layers=[],cur=0,tool='ink',color='#ff4fa3',size=12,alpha=1,sym=0,zoom=1,panX=0,panY=0,undo=[],redo=[],frames=[],stencil=false,sticker='❤️';
const toast=m=>{const t=$('toast');t.textContent=m;t.style.opacity=1;setTimeout(()=>t.style.opacity=0,1600)};
function mk(name){const c=document.createElement('canvas');c.width=W;c.height=H;return{c,x:c.getContext('2d',{willReadFrequently:true}),name,op:1,blend:'source-over',vis:true}}
function render(){vx.globalCompositeOperation='source-over';vx.globalAlpha=1;vx.fillStyle='#fff';vx.fillRect(0,0,W,H);
 for(const l of layers)if(l.vis){vx.globalAlpha=l.op;vx.globalCompositeOperation=l.blend;vx.drawImage(l.c,0,0)}
 vx.globalAlpha=1;vx.globalCompositeOperation='source-over';if(stencil)stencilize()}
function stencilize(){const d=vx.getImageData(0,0,W,H),p=d.data,o=new Uint8ClampedArray(p.length),q=v=>Math.round(v/85)*85;
 for(let i=0;i<p.length;i+=4){o[i]=q(p[i]);o[i+1]=q(p[i+1]);o[i+2]=q(p[i+2]);o[i+3]=255}
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=(y*W+x)*4,r=i+4,b=i+W*4;
  if(Math.abs(o[i]-o[r])+Math.abs(o[i+1]-o[r+1])+Math.abs(o[i+2]-o[r+2])+Math.abs(o[i]-o[b])+Math.abs(o[i+1]-o[b+1])+Math.abs(o[i+2]-o[b+2])>60){o[i]=o[i+1]=o[i+2]=0;o[r]=o[r+1]=o[r+2]=0}}
 d.data.set(o);vx.putImageData(d,0,0)}
function snap(){undo.push({i:cur,d:layers[cur].x.getImageData(0,0,W,H)});if(undo.length>25)undo.shift();redo=[]}
function done(){render();const t=document.createElement('canvas');t.width=240;t.height=180;t.getContext('2d').drawImage(view,0,0,240,180);frames.push(t.toDataURL('image/jpeg',.6));if(frames.length>400)frames.splice(0,1);save()}
function swap(a,b){const s=a.pop();if(!s)return;const l=layers[s.i];if(!l)return;b.push({i:s.i,d:l.x.getImageData(0,0,W,H)});l.x.putImageData(s.d,0,0);done()}
$('undo').onclick=()=>swap(undo,redo);$('redo').onclick=()=>swap(redo,undo);
// brushes
const B=[['pencil','✏️'],['ink','🖋'],['marker','🖍'],['airbrush','💨'],['water','💧'],['glitter','✨'],['neon','🌈'],['pattern','🎀'],['eraser','🧽'],['smudge','👆'],['fill','🪣'],['line','／'],['rect','▭'],['circle','◯'],['heart','♡'],['text','T'],['sticker','⭐']];
B.forEach(([k,e])=>{const b=document.createElement('button');b.textContent=e+' '+k;b.title=k;b.onclick=()=>{tool=k;document.querySelectorAll('#brushes button').forEach(x=>x.classList.remove('on'));b.classList.add('on')};if(k==tool)b.classList.add('on');$('brushes').append(b)});
['❤️','🎀','⭐','☕','💖','🌸','💎','🤠','🌹','💋','🦋','✨'].forEach(s=>{const b=document.createElement('button');b.textContent=s;b.onclick=()=>{sticker=s;tool='sticker';toast('Stamp '+s)};$('stickers').append(b)});
$('size').oninput=e=>{size=+e.target.value;$('sv').textContent=size};$('alpha').oninput=e=>alpha=e.target.value/100;$('sym').onchange=e=>sym=+e.target.value;
$('stencil').onchange=e=>{stencil=e.target.checked;render();toast(stencil?'Tattoo stencil: outline + flat colour':'Stencil off')};
function setColor(c){color=c;$('cur').style.background=c;try{$('pick').value=c}catch(e){}}$('pick').oninput=e=>setColor(e.target.value);
// colour wheel
const wh=$('wheel'),wx=wh.getContext('2d');function drawWheel(){const L=$('light').value;for(let a=0;a<360;a++){for(let r=0;r<90;r+=3){wx.fillStyle=`hsl(${a},${r/90*100}%,${L}%)`;wx.beginPath();wx.arc(90,90,r+3,a*Math.PI/180,(a+1.5)*Math.PI/180);wx.arc(90,90,r,(a+1.5)*Math.PI/180,a*Math.PI/180,true);wx.fill()}}}
drawWheel();$('light').oninput=drawWheel;const hex=d=>'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');
wh.addEventListener('pointerdown',e=>{const d=wx.getImageData(e.offsetX,e.offsetY,1,1).data;if(d[3])setColor(hex(d))});
// mixing palette
const mx=$('mix'),mxx=mx.getContext('2d',{willReadFrequently:true});let mixing=false;mxx.fillStyle='#fff';mxx.fillRect(0,0,180,90);
mx.addEventListener('pointerdown',e=>{if(e.shiftKey||e.button==2){}mixing=true;mixAt(e)});mx.addEventListener('pointermove',e=>mixing&&mixAt(e));addEventListener('pointerup',()=>mixing=false);
function mixAt(e){mxx.globalAlpha=.25;mxx.fillStyle=color;mxx.beginPath();mxx.arc(e.offsetX,e.offsetY,10,0,7);mxx.fill();mxx.globalAlpha=1;setColor(hex(mxx.getImageData(e.offsetX,e.offsetY,1,1).data))}
$('mixadd').onclick=()=>{mxx.fillStyle=color;mxx.beginPath();mxx.arc(20+Math.random()*140,20+Math.random()*50,14,0,7);mxx.fill()};$('mixclr').onclick=()=>{mxx.fillStyle='#fff';mxx.fillRect(0,0,180,90)};
// layers
function ui(){const L=$('layers');L.innerHTML='';layers.slice().reverse().forEach((l,ri)=>{const i=layers.length-1-ri,d=document.createElement('div');if(i==cur)d.className='sel';
 const v=document.createElement('input');v.type='checkbox';v.checked=l.vis;v.onclick=e=>{e.stopPropagation();l.vis=v.checked;render()};d.append(v,l.name);d.onclick=()=>{cur=i;ui()};L.append(d)});
 $('blend').value=layers[cur].blend;$('lop').value=layers[cur].op*100}
$('ladd').onclick=()=>{layers.splice(cur+1,0,mk('Layer '+(layers.length+1)));cur++;ui()};
$('ldel').onclick=()=>{if(layers.length>1){layers.splice(cur,1);cur=Math.max(0,cur-1);undo=[];redo=[];ui();done()}};
$('blend').onchange=e=>{layers[cur].blend=e.target.value;done()};$('lop').oninput=e=>{layers[cur].op=e.target.value/100;render()};
// zoom/pan
const stage=$('stage'),wrap=$('wrap');function tf(){wrap.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`}
function fit(){const r=stage.getBoundingClientRect();zoom=Math.min(r.width/W,r.height/H)*.96;panX=(r.width-W*zoom)/2;panY=(r.height-H*zoom)/2;tf()}
$('zin').onclick=()=>{zoom*=1.25;tf()};$('zout').onclick=()=>{zoom/=1.25;tf()};$('zfit').onclick=fit;addEventListener('resize',fit);
stage.addEventListener('wheel',e=>{e.preventDefault();const r=stage.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,f=e.deltaY<0?1.1:1/1.1;panX=mx-(mx-panX)*f;panY=my-(my-panY)*f;zoom*=f;tf()},{passive:false});
// drawing
const pts=new Map();let down=null,last=null,start=null,base=null,panning=null,spd=0;
const pos=e=>{const r=view.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}};
function mirror(p){const o=[p];if(sym==1)o.push({x:W-p.x,y:p.y});else if(sym>1){const cx=W/2,cy=H/2,dx=p.x-cx,dy=p.y-cy;for(let k=1;k<sym;k++){const a=k*2*Math.PI/sym,c=Math.cos(a),s=Math.sin(a);o.push({x:cx+dx*c-dy*s,y:cy+dx*s+dy*c})}if(sym>1)for(let k=0;k<sym;k++){const a=k*2*Math.PI/sym,c=Math.cos(a),s=Math.sin(a),mx=-dx;o.push({x:cx+mx*c-dy*s,y:cy+mx*s+dy*c})}}return o}
function dab(x,a,b,pr){const r=size*pr;x.save();x.globalAlpha=alpha;x.strokeStyle=x.fillStyle=color;x.lineCap=x.lineJoin='round';
 switch(tool){case'pencil':x.globalAlpha=alpha*.7;x.lineWidth=Math.max(1,r*.3);line(x,a,b);break;
 case'ink':x.lineWidth=r;line(x,a,b);break;
 case'marker':x.globalAlpha=alpha*.35;x.lineCap='square';x.lineWidth=r*1.4;line(x,a,b);break;
 case'airbrush':for(let i=0;i<r*2;i++){const t=Math.random()*7,d=Math.random()*r*1.5;x.globalAlpha=alpha*.08;x.fillRect(b.x+Math.cos(t)*d,b.y+Math.sin(t)*d,2,2)}break;
 case'water':{const g=x.createRadialGradient(b.x,b.y,0,b.x,b.y,r*1.6);g.addColorStop(0,color+'30');g.addColorStop(1,color+'00');x.globalAlpha=alpha;x.fillStyle=g;x.beginPath();x.arc(b.x,b.y,r*1.6,0,7);x.fill();break}
 case'glitter':for(let i=0;i<6;i++){x.fillStyle=Math.random()<.4?'#fff':`hsl(${300+Math.random()*60},100%,${60+Math.random()*30}%)`;const s=Math.random()*3+1;x.fillRect(b.x+(Math.random()-.5)*r*2,b.y+(Math.random()-.5)*r*2,s,s)}break;
 case'neon':x.shadowColor=color;x.shadowBlur=r*1.5;x.lineWidth=r*.6;line(x,a,b);x.strokeStyle='#fff';x.lineWidth=r*.2;line(x,a,b);break;
 case'pattern':if(Math.hypot(b.x-a.x,b.y-a.y)>0||1){x.font=r*1.5+'px serif';x.textAlign='center';if(Math.random()<.35)x.fillText(['♥','✿','★','☕'][(b.x+b.y|0)%4],b.x,b.y)}break;
 case'eraser':x.globalCompositeOperation='destination-out';x.lineWidth=r*1.5;line(x,a,b);break;
 case'smudge':{const s=Math.max(4,r|0);try{const d=x.getImageData(a.x-s/2,a.y-s/2,s,s);const t=document.createElement('canvas');t.width=t.height=s;t.getContext('2d').putImageData(d,0,0);x.globalAlpha=.5;x.drawImage(t,b.x-s/2,b.y-s/2)}catch(e){}break}}
 x.restore()}
function line(x,a,b){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
function shape(x,a,b){x.save();x.globalAlpha=alpha;x.strokeStyle=color;x.lineWidth=size/2;x.lineCap='round';x.beginPath();
 if(tool=='line'){x.moveTo(a.x,a.y);x.lineTo(b.x,b.y)}else if(tool=='rect')x.rect(a.x,a.y,b.x-a.x,b.y-a.y);else if(tool=='circle')x.arc(a.x,a.y,Math.hypot(b.x-a.x,b.y-a.y),0,7);
 else{const s=Math.hypot(b.x-a.x,b.y-a.y)/16;x.moveTo(a.x,a.y+s*4);for(let t=0;t<=6.3;t+=.1)x.lineTo(a.x+16*s*Math.sin(t)**3,a.y-s*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t)))}x.stroke();x.restore()}
function fill(x,p){const d=x.getImageData(0,0,W,H),a=d.data,sx=p.x|0,sy=p.y|0,i0=(sy*W+sx)*4,t=[a[i0],a[i0+1],a[i0+2],a[i0+3]];
 const c=parseInt(color.slice(1),16),f=[c>>16,c>>8&255,c&255,255];if(t.every((v,i)=>v==f[i]))return;const st=[sx+sy*W],seen=new Uint8Array(W*H);
 const ok=i=>Math.abs(a[i]-t[0])+Math.abs(a[i+1]-t[1])+Math.abs(a[i+2]-t[2])+Math.abs(a[i+3]-t[3])<60;
 while(st.length){const q=st.pop();if(seen[q])continue;seen[q]=1;const i=q*4;if(!ok(i))continue;a.set(f,i);const x0=q%W;if(x0>0)st.push(q-1);if(x0<W-1)st.push(q+1);if(q>=W)st.push(q-W);if(q<W*H-W)st.push(q+W)}x.putImageData(d,0,0)}
view.addEventListener('pointerdown',e=>{pts.set(e.pointerId,e);if(pts.size==2){down=null;panning={d:dist(),z:zoom,px:panX,py:panY,m:mid()};return}
 if(e.button==1||e.altKey){panning={x:e.clientX,y:e.clientY,px:panX,py:panY};return}
 view.setPointerCapture(e.pointerId);const p=pos(e),x=layers[cur].x;snap();
 if(tool=='fill'){fill(x,p);done();return}if(tool=='text'){x.save();x.globalAlpha=alpha;x.fillStyle=color;x.font=`bold ${size*3}px Georgia,serif`;mirror(p).forEach(q=>x.fillText($('txt').value,q.x,q.y));x.restore();done();return}
 if(tool=='sticker'){x.font=size*4+'px serif';x.textAlign='center';x.textBaseline='middle';mirror(p).forEach(q=>x.fillText(sticker,q.x,q.y));done();return}
 down=p;last=p;start=p;if(['line','rect','circle','heart'].includes(tool))base=x.getImageData(0,0,W,H)});
const dist=()=>{const [a,b]=[...pts.values()];return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)},mid=()=>{const [a,b]=[...pts.values()];return{x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2}};
view.addEventListener('pointermove',e=>{if(pts.has(e.pointerId))pts.set(e.pointerId,e);
 if(panning){if(pts.size==2&&panning.d){const f=dist()/panning.d,m=mid();zoom=panning.z*f;panX=m.x-(panning.m.x-panning.px)*f;panY=m.y-(panning.m.y-panning.py)*f}else if(panning.x!=null){panX=panning.px+e.clientX-panning.x;panY=panning.py+e.clientY-panning.y}tf();return}
 if(!down)return;const p=pos(e),x=layers[cur].x;
 if(base){x.putImageData(base,0,0);const A=mirror(start),Bp=mirror(p);A.forEach((a,i)=>shape(x,a,Bp[i]))}
 else{const v=Math.hypot(p.x-last.x,p.y-last.y);spd=spd*.7+v*.3;const pr=e.pointerType=='pen'&&e.pressure?e.pressure*1.6:Math.max(.35,1.3-spd/40);const A=mirror(last),Bp=mirror(p);A.forEach((a,i)=>dab(x,a,Bp[i],pr))}
 last=p;render()});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2&&panning&&panning.d)panning=null;if(panning&&panning.x!=null)panning=null;if(down){down=null;base=null;done()}};
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
// photo trace
$('photo').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const l=mk('Trace photo');l.op=.4;const s=Math.min(W/im.width,H/im.height);l.x.drawImage(im,(W-im.width*s)/2,(H-im.height*s)/2,im.width*s,im.height*s);layers.splice(0,0,l);cur=layers.length-1;if(layers.length<2){layers.push(mk('Ink'));cur=1}undo=[];ui();done();toast('Photo added at 40% — trace on the top layer')};im.src=URL.createObjectURL(f)};
// timelapse
let rp=null;$('replay').onclick=()=>{if(!frames.length)return toast('Draw something first');$('replaybar').hidden=false;let i=0;rp=setInterval(()=>{const im=new Image();im.onload=()=>vx.drawImage(im,0,0,W,H);im.src=frames[i++];if(i>=frames.length)stopR()},120)};
function stopR(){clearInterval(rp);setTimeout(()=>{$('replaybar').hidden=true;render()},400)}$('stopr').onclick=stopR;
// export
function branded(){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(view,0,0);const lg=$('tools')&&document.querySelector('header img');try{x.globalAlpha=.85;x.drawImage(lg,W-110,H-110,96,96)}catch(e){}return c}
function dl(url,n){const a=document.createElement('a');a.href=url;a.download=n;a.click()}
$('png').onclick=()=>{render();dl(branded().toDataURL('image/png'),'coffeebreak-art.png')};
$('pdf').onclick=()=>{render();const b=atob(branded().toDataURL('image/jpeg',.95).split(',')[1]);const pw=842,ph=631.5;const o=[];let s='%PDF-1.4\n';const off=[];const add=t=>{off.push(s.length);s+=t};
 add('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n');add(`2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n`);add(`3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pw} ${ph}]/Resources<</XObject<</I 4 0 R>>>>/Contents 5 0 R>>endobj\n`);
 add(`4 0 obj<</Type/XObject/Subtype/Image/Width ${W}/Height ${H}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${b.length}>>stream\n${b}\nendstream endobj\n`);
 const cs=`q ${pw} 0 0 ${ph} 0 0 cm /I Do Q`;add(`5 0 obj<</Length ${cs.length}>>stream\n${cs}\nendstream endobj\n`);const x=s.length;s+=`xref\n0 6\n0000000000 65535 f \n`+off.map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer<</Size 6/Root 1 0 R>>\nstartxref\n${x}\n%%EOF`;
 const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;dl(URL.createObjectURL(new Blob([u],{type:'application/pdf'})),'coffeebreak-art-print.pdf')};
$('clear').onclick=()=>{if(!confirm('Start a new artwork?'))return;layers=[mk('Background'),mk('Layer 2')];cur=1;undo=[];redo=[];frames=[];ui();done()};
// autosave
let st;function save(){clearTimeout(st);st=setTimeout(()=>{try{localStorage.setItem('cbArt',JSON.stringify(layers.map(l=>({n:l.name,o:l.op,b:l.blend,v:l.vis,d:l.c.toDataURL()}))))}catch(e){}},800)}
function load(){let d;try{d=JSON.parse(localStorage.getItem('cbArt'))}catch(e){}if(!d||!d.length){layers=[mk('Background'),mk('Layer 2')];cur=1;ui();render();return}
 layers=d.map(o=>{const l=mk(o.n);l.op=o.o;l.blend=o.b;l.vis=o.v;const im=new Image();im.onload=()=>{l.x.drawImage(im,0,0);render()};im.src=o.d;return l});cur=layers.length-1;ui();render()}
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;if((e.ctrlKey||e.metaKey)&&e.key=='z'){e.preventDefault();e.shiftKey?swap(redo,undo):swap(undo,redo)}if((e.ctrlKey||e.metaKey)&&e.key=='y')swap(redo,undo)});
setColor(color);load();fit();
window.CB={layers:()=>layers,setTool:t=>tool=t,setColor,setSym:v=>sym=v,setSize:v=>size=v,done,snap,dab:(a,b)=>{const A=mirror(a),Bp=mirror(b);A.forEach((q,i)=>dab(layers[cur].x,q,Bp[i],1))},render,sticker:(s,p)=>{sticker=s;const x=layers[cur].x;x.font=size*4+'px serif';x.textAlign='center';x.textBaseline='middle';mirror(p).forEach(q=>x.fillText(s,q.x,q.y))}};
function cbcp(c,w,h,bg){var t=document.createElement('canvas');t.width=c.width;t.height=c.height;t.getContext('2d').drawImage(c,0,0);var k=Math.min(1,w/c.width,h/c.height);c.width=w;c.height=h;var x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.drawImage(t,0,0,t.width*k,t.height*k)};window.CBResizeCanvas=function(w,h){w=Math.round(w);h=Math.round(h);if(w<50||h<50||(w==W&&h==H))return;layers.forEach(function(l){cbcp(l.c,w,h,null)});W=w;H=h;view.width=W;view.height=H;undo.length=0;redo.length=0;render();fit()};
})();
