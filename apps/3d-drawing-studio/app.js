(function(){
const CB=CB3D,$=id=>document.getElementById(id);
const V=CB.initViewer($('view'));const pad=$('pad'),ctx=pad.getContext('2d');
let items=[],tool='pen',mode='draw',cur=null;
const TPL={none:{w:100,h:100},keychain:{w:60,h:32},badge:{w:56,h:56},coaster:{w:95,h:95},plaque:{w:110,h:60}};
const locked={coaster:1,plaque:1};
function S(id){return parseFloat($(id).value);}
['baseT','penW','penH','stampS','txtS'].forEach(id=>{const f=()=>{$(id+'v').textContent=$(id).value+' mm';};$(id).oninput=()=>{f();if(mode==='3d')build();};f();});
document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tool').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');tool=b.dataset.tool;});
$('tpl').onchange=()=>{if(locked[$('tpl').value]&&CB.locked('This template')){$('tpl').value='keychain';}draw2d();if(mode==='3d')build();};
$('level').onchange=()=>{if($('level').value!=='1'&&CB.locked('Height levels'))$('level').value='1';};
function area(){const t=TPL[$('tpl').value];return Math.max(t.w,t.h)+16;}
function fit(){const r=pad.getBoundingClientRect();pad.width=r.width*devicePixelRatio;pad.height=r.height*devicePixelRatio;draw2d();}
function sc(){return Math.min(pad.width,pad.height)/area();}
function toMM(e){const r=pad.getBoundingClientRect(),x=(e.clientX-r.left)*devicePixelRatio,y=(e.clientY-r.top)*devicePixelRatio,s=sc();return [(x-pad.width/2)/s,-(y-pad.height/2)/s];}
function toPX(p){const s=sc();return [pad.width/2+p[0]*s,pad.height/2-p[1]*s];}
function basePts(){const k=$('tpl').value,t=TPL[k];if(k==='none')return null;
  if(k==='badge'||k==='coaster')return {outer:CB.shapePts('circle',t.w,96),holes:k==='badge'?[CB.circlePts(0,t.h/2-5,2.2,24)]:[]};
  const P=CB.shapePts('square',1).map(p=>[p[0]*t.w,p[1]*t.h]);const holes=k==='keychain'?[CB.circlePts(-t.w/2+6,0,2.6,24)]:[CB.circlePts(-t.w/2+8,t.h/2-8,2.2,24),CB.circlePts(t.w/2-8,t.h/2-8,2.2,24)];return {outer:P,holes:holes};}
function poly(ctx,P,fill,stroke){ctx.beginPath();P.forEach((p,i)=>{const q=toPX(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function draw2d(){ctx.fillStyle='#2a0f33';ctx.fillRect(0,0,pad.width,pad.height);const s=sc();
  ctx.strokeStyle='#4a2558';ctx.lineWidth=1;for(let g=-60;g<=60;g+=10){let a=toPX([g,-60]),b=toPX([g,60]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();a=toPX([-60,g]);b=toPX([60,g]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  const b=basePts();if(b){poly(ctx,b.outer,'#5b2a6e','#ff6fb5');b.holes.forEach(h=>poly(ctx,h,'#2a0f33','#ff6fb5'));}
  const col=$('col').value;
  items.forEach(it=>{ctx.fillStyle=col;ctx.strokeStyle=col;
    if(it.t==='pen'){ctx.lineWidth=it.w*s;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();it.pts.forEach((p,i)=>{const q=toPX(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});if(it.pts.length===1){const q=toPX(it.pts[0]);ctx.lineTo(q[0]+0.1,q[1]);}ctx.stroke();}
    else if(it.t==='stamp'){poly(ctx,CB.move(CB.shapePts(it.k,it.s),it.x,it.y),col);}
    else if(it.t==='text'){ctx.font='bold '+(it.s*s*1.1)+'px "Trebuchet MS",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const q=toPX([it.x,it.y]);ctx.fillText(it.txt,q[0],q[1]);}});
  ctx.fillStyle='#ffe6f4';ctx.font=(13*devicePixelRatio)+'px sans-serif';ctx.textAlign='left';ctx.fillText('Grid squares are 10 mm',8*devicePixelRatio,18*devicePixelRatio);}
pad.addEventListener('pointerdown',e=>{pad.setPointerCapture(e.pointerId);const p=toMM(e);
  if(tool==='pen'){cur={t:'pen',pts:[p],w:S('penW'),h:S('penH'),lv:+$('level').value};items.push(cur);}
  else if(tool==='stamp'){items.push({t:'stamp',k:$('stamp').value,s:S('stampS'),x:p[0],y:p[1],h:S('penH'),lv:+$('level').value});}
  else if(tool==='text'){const t=$('txt').value.trim();if(t)items.push({t:'text',txt:t,s:S('txtS'),x:p[0],y:p[1],h:S('penH'),lv:+$('level').value});}
  else if(tool==='erase'){let best=-1,bd=8;items.forEach((it,i)=>{const pts=it.t==='pen'?it.pts:[[it.x,it.y]];pts.forEach(q=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<bd){bd=d;best=i;}});});if(best>=0)items.splice(best,1);}
  draw2d();});
pad.addEventListener('pointermove',e=>{if(cur){cur.pts.push(toMM(e));draw2d();}});
['pointerup','pointercancel'].forEach(ev=>pad.addEventListener(ev,()=>{cur=null;}));
$('undo').onclick=()=>{items.pop();draw2d();if(mode==='3d')build();};
$('clear').onclick=()=>{items=[];draw2d();if(mode==='3d')build();};
$('col').oninput=()=>{draw2d();if(mode==='3d')build();};
function sample(){items=[];const t=$('tpl').value;const W=TPL[t].w;
  items.push({t:'stamp',k:'heart',s:12,x:W/2-9,y:0,h:1.6,lv:1});
  items.push({t:'text',txt:'Karen',s:9,x:(t==='keychain'?2:0),y:(t==='keychain'?0:-8),h:1.6,lv:1});
  const pts=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;pts.push([-W/2+16+Math.cos(a)*5*(1+i/40),Math.sin(a)*5*(1+i/40)]);}
  if(t!=='keychain')items.push({t:'pen',pts:pts.map(p=>[p[0]+8,p[1]+12]),w:2,h:1.6,lv:1});draw2d();}
$('sample').onclick=()=>{sample();if(mode==='3d')build();};
function geos(){const out=[],bt=$('tpl').value==='none'?0:S('baseT'),b=basePts();
  if(b){const sh=CB.polyShape(b.outer);b.holes.forEach(h=>sh.holes.push(CB.polyPath(h)));out.push(CB.extrude(sh,bt));
    if($('tpl').value==='coaster'){const r=CB.polyShape(CB.shapePts('circle',95,96));r.holes.push(CB.polyPath(CB.shapePts('circle',87,96)));out.push(CB.extrude(r,1.5,bt-0.01));}}
  items.forEach(it=>{const top=bt+it.h*it.lv;
    if(it.t==='pen')CB.strokeGeos(it.pts,it.w,top,0).forEach(g=>out.push(g));
    else if(it.t==='stamp'){const sh=CB.polyShape(CB.move(CB.shapePts(it.k,it.s),it.x,it.y));if(it.k==='bean')sh.holes.push(CB.polyPath(CB.move(CB.beanGroove(it.s),it.x,it.y)));out.push(CB.extrude(sh,top));}
    else if(it.t==='text')out.push(CB.textGeo(it.txt,it.s,top,0,it.x,it.y));});
  return out;}
function build(){CB.clear(V.root);const g=geos();if(!g.length){$('dims').textContent='Draw something first';return;}
  V.root.add(CB.mesh(CB.merge(g),parseInt($('col').value.slice(1),16)));$('dims').textContent=CB.dims(V.root);}
function setMode(m){mode=m;$('mDraw').classList.toggle('sel',m==='draw');$('m3d').classList.toggle('sel',m==='3d');pad.style.display=m==='draw'?'block':'none';if(m==='3d'){V.resize();build();V.frame();}else fit();}
$('mDraw').onclick=()=>setMode('draw');$('m3d').onclick=()=>setMode('3d');
$('exp').onclick=()=>{if(mode!=='3d')setMode('3d');build();if(!V.root.children.length)return;CB.exportSTL(V.root,'coffeebreak-drawing-'+$('tpl').value+'.stl');};
window.addEventListener('resize',()=>{if(mode==='draw')fit();});
window.APP={scenarios:()=>['keychain','badge','coaster','plaque','none'],scenario:t=>{$('tpl').value=t;sample();setMode('3d');},build:build,setMode:setMode,sample:sample,items:()=>items,setTpl:v=>{$('tpl').value=v;draw2d();},exportAll:()=>{setMode('3d');build();return [CB.exportSTL(V.root,'drawing.stl')];}};
fit();sample();
})();
