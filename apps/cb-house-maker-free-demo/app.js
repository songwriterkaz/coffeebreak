/* Coffeebreak House Maker UI. (c) Karen O'Brien (Coffeebreak). All rights reserved. */
(function(){'use strict';var need3d=true;
var C=window.CBHM,T=C.T,FULL=!!window.CB_FULL;var $=function(id){return document.getElementById(id);};
var COL={0:'#ffffff',1:'#f3e2c7',2:'#7a3b55',3:'#b5651d',4:'#6ec6ff',5:'#ff9fc8',6:'#2f8fe0',7:'#7cc66b',8:'#2e7d32',9:'#d9c9a8'};
var NAME={0:'Empty',1:'Floor',2:'Wall',3:'Door',4:'Window',5:'Stairs',6:'Pool',7:'Garden',8:'Tree',9:'Path'};
var D=C.PRESETS.mansion(),F=0,tool='room',stairDir=0,hist=[],cell=12,showAll=true;
function toast(t){var e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display='none';},3200);}
function opts(){return {scale:+$('scale').value,base:+$('base').value,bold:$('bold').value==='1'};}
function snapshot(){hist.push(JSON.stringify(D.toJSON()));if(hist.length>40)hist.shift();}
function store(){try{localStorage.setItem('cbhm-design',JSON.stringify(D.toJSON()));}catch(e){}}
try{var sv=localStorage.getItem('cbhm-design');if(sv)D=C.Design.fromJSON(JSON.parse(sv));}catch(e){}
function demoBlocked(){if(FULL)return false;if(D.storeys()>2){toast('Free demo exports and prints designs up to 2 storeys. Get the full version ($10) for mansions and castles.');return true;}return false;}

/* ---------- tabs ---------- */
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b);});document.querySelectorAll('.wrap>.panel').forEach(function(p){p.classList.toggle('show',p.id===b.dataset.tab);});if(b.dataset.tab==='viewPanel')resize3d();if(b.dataset.tab==='planPanel')drawPlan();};});
/* ---------- legend + tools ---------- */
$('legend').innerHTML=[1,2,3,4,5,6,7,8,9].map(function(k){return '<span style="background:'+COL[k]+'"></span>'+NAME[k];}).join(' ');
document.querySelectorAll('#tools button').forEach(function(b){b.onclick=function(){tool=b.dataset.tool;document.querySelectorAll('#tools button').forEach(function(x){x.classList.toggle('on',x===b);});$('planBox').classList.toggle('pan',tool==='pan');};});
$('rotStair').onclick=function(){stairDir=(stairDir+1)%4;this.textContent='Stair dir: '+'↑→↓←'[stairDir];};
document.querySelectorAll('[data-preset]').forEach(function(b){b.onclick=function(){snapshot();var p=b.dataset.preset;D=p==='blank'?new C.Design(30,24,1):C.PRESETS[p]();F=0;
 $('scale').value=(p==='cottage'||p==='beach')?'150':'200';syncUI();changed();toast((b.textContent)+' loaded'+(!FULL&&D.storeys()>2?' (demo: view only, full version exports it)':''));};});
function syncUI(){var s=$('floorSel');s.innerHTML='';D.floors.forEach(function(_,i){var o=document.createElement('option');o.value=i;o.textContent=i===0?'Ground floor':'Level '+i;s.appendChild(o);});if(F>=D.floors.length)F=D.floors.length-1;s.value=F;$('roof').value=D.roof;$('pw').value=D.W;$('ph').value=D.H;
 var e=$('expWhat'),cur=e.value;e.innerHTML='<option value="-1">Whole house</option>'+D.floors.map(function(_,i){return '<option value="'+i+'">Only '+(i===0?'ground floor (with base)':'level '+i)+'</option>';}).join('');if(cur&&+cur<D.floors.length)e.value=cur;$('planLbl').textContent='· '+(F===0?'Ground floor':'Level '+F);}
$('floorSel').onchange=function(){F=+this.value;syncUI();drawPlan();update3d();};
$('addFloor').onclick=function(){if(D.floors.length>=6)return toast('Up to 6 storeys');if(!FULL&&D.floors.length>=2)toast('Demo: designs over 2 storeys can be viewed but not exported');snapshot();D.addFloor();F=D.floors.length-1;
 var below=D.floors[F-1],cur=D.floors[F];for(var i=0;i<cur.length;i++){if(below[i]===T.WALL||below[i]===T.WINDOW)cur[i]=T.WALL;else if(C.BUILD(below[i]))cur[i]=T.FLOOR;}syncUI();changed();toast('Added a storey on top (copied the outline)');};
$('delFloor').onclick=function(){if(D.floors.length<=1)return;snapshot();D.floors.pop();D.dirs.pop();syncUI();changed();};
$('roof').onchange=function(){snapshot();D.roof=this.value;changed();};
$('resize').onclick=function(){var w=Math.max(8,Math.min(64,+$('pw').value|0)),h=Math.max(8,Math.min(64,+$('ph').value|0));snapshot();var N=new C.Design(w,h,0);N.roof=D.roof;D.floors.forEach(function(a,f){N.addFloor();for(var z=0;z<Math.min(h,D.H);z++)for(var x=0;x<Math.min(w,D.W);x++){N.floors[f][z*w+x]=a[z*D.W+x];N.dirs[f][z*w+x]=D.dirs[f][z*D.W+x];}});D=N;syncUI();changed();};
['scale','base','bold'].forEach(function(id){$(id).onchange=function(){changed();};});
$('undo').onclick=function(){if(!hist.length)return toast('Nothing to undo');D=C.Design.fromJSON(JSON.parse(hist.pop()));syncUI();changed();};
$('save').onclick=function(){download(new Blob([JSON.stringify(D.toJSON())],{type:'application/json'}),'coffeebreak-house.json');};
$('load').onclick=function(){$('loadFile').click();};$('loadFile').onchange=function(){var f=this.files[0];if(!f)return;f.text().then(function(t){snapshot();D=C.Design.fromJSON(JSON.parse(t));F=0;syncUI();changed();toast('Design opened');}).catch(function(){toast('Could not open that file');});};
function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},2000);}

/* ---------- plan editor ---------- */
var pc=$('plan'),px=pc.getContext('2d');
function fitCell(){var box=$('planBox');var w=box.clientWidth||360;cell=Math.max(6,Math.floor((w-4)/D.W));}
$('zin').onclick=function(){cell=Math.min(40,cell+3);drawPlan();};$('zout').onclick=function(){cell=Math.max(5,cell-3);drawPlan();};
function drawPlan(){if(!cell)fitCell();pc.width=D.W*cell;pc.height=D.H*cell;px.fillStyle='#fff';px.fillRect(0,0,pc.width,pc.height);
 var A=D.floors[F],Bl=F>0?D.floors[F-1]:null;
 for(var z=0;z<D.H;z++)for(var x=0;x<D.W;x++){var t=A[z*D.W+x];if(!t&&Bl&&Bl[z*D.W+x]){px.fillStyle='#00000014';px.fillRect(x*cell,z*cell,cell,cell);continue;}if(!t)continue;px.fillStyle=COL[t];px.fillRect(x*cell,z*cell,cell,cell);
  if(t===T.STAIR&&cell>=8){px.fillStyle='#3a1028';px.font=Math.floor(cell*.8)+'px sans-serif';px.textAlign='center';px.textBaseline='middle';px.fillText('↑→↓←'[D.dirs[F][z*D.W+x]],x*cell+cell/2,z*cell+cell/2+1);}
  if(t===T.TREE){px.fillStyle='#1b5e20';px.beginPath();px.arc(x*cell+cell/2,z*cell+cell/2,cell*.42,0,7);px.fill();}}
 px.strokeStyle='#0000001a';px.lineWidth=1;px.beginPath();for(x=0;x<=D.W;x++){px.moveTo(x*cell+.5,0);px.lineTo(x*cell+.5,pc.height);}for(z=0;z<=D.H;z++){px.moveTo(0,z*cell+.5);px.lineTo(pc.width,z*cell+.5);}px.stroke();
 px.strokeStyle='#0000004d';px.beginPath();for(x=0;x<=D.W;x+=10){px.moveTo(x*cell+.5,0);px.lineTo(x*cell+.5,pc.height);}for(z=0;z<=D.H;z+=10){px.moveTo(0,z*cell+.5);px.lineTo(pc.width,z*cell+.5);}px.stroke();
 if(drag&&tool==='room'){px.strokeStyle='#ff4f9a';px.lineWidth=3;var r=rect();px.strokeRect(r[0]*cell,r[1]*cell,(r[2]-r[0]+1)*cell,(r[3]-r[1]+1)*cell);}}
var drag=null;function rect(){return [Math.min(drag.x0,drag.x1),Math.min(drag.z0,drag.z1),Math.max(drag.x0,drag.x1),Math.max(drag.z0,drag.z1)];}
function cellAt(e){var r=pc.getBoundingClientRect();return [Math.floor((e.clientX-r.left)/cell),Math.floor((e.clientY-r.top)/cell)];}
function paint(x,z){var t=+tool;if(t>=6&&F!==0){toast('Pool, garden, tree and path go on the ground floor');return;}D.set(F,x,z,t,t===T.STAIR?stairDir:0);}
pc.addEventListener('pointerdown',function(e){if(tool==='pan')return;e.preventDefault();var c=cellAt(e);snapshot();drag={x0:c[0],z0:c[1],x1:c[0],z1:c[1]};pc.setPointerCapture(e.pointerId);if(tool!=='room'){paint(c[0],c[1]);drawPlan();}});
pc.addEventListener('pointermove',function(e){if(!drag)return;var c=cellAt(e);if(c[0]===drag.x1&&c[1]===drag.z1)return;drag.x1=c[0];drag.z1=c[1];if(tool!=='room')paint(c[0],c[1]);drawPlan();});
pc.addEventListener('pointerup',function(){if(!drag)return;if(tool==='room'){var r=rect();if(r[2]-r[0]>=2&&r[3]-r[1]>=2){for(var z=r[1];z<=r[3];z++)for(var x=r[0];x<=r[2];x++){var edge=x===r[0]||x===r[2]||z===r[1]||z===r[3];var c=D.get(F,x,z);if(edge){if(c!==T.DOOR&&c!==T.WINDOW&&c!==T.STAIR)D.set(F,x,z,T.WALL);}else if(!C.BUILD(c)||c===T.FLOOR)D.set(F,x,z,T.FLOOR);}}else toast('Drag a bigger rectangle (at least 3 × 3 squares)');}
 drag=null;changed();});

/* ---------- 3D ---------- */
var R3,scene,cam,ctl,group,plane;
function init3d(){var el=$('view');R3=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R3.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R3.localClippingEnabled=true;el.appendChild(R3.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#cfe8ff');cam=new THREE.PerspectiveCamera(45,1,0.1,2000);cam.position.set(18,16,22);
 ctl=new THREE.OrbitControls(cam,R3.domElement);ctl.enableDamping=true;ctl.maxPolarAngle=Math.PI*0.49;
 scene.add(new THREE.HemisphereLight(0xffffff,0xb08aa0,0.75));var dl=new THREE.DirectionalLight(0xffffff,0.75);dl.position.set(20,40,15);scene.add(dl);
 var gr=new THREE.Mesh(new THREE.CircleGeometry(80,48),new THREE.MeshLambertMaterial({color:0x9fd28c}));gr.rotation.x=-Math.PI/2;gr.position.y=-0.02;scene.add(gr);
 plane=new THREE.Plane(new THREE.Vector3(0,-1,0),1000);group=new THREE.Group();scene.add(group);resize3d();ctl.addEventListener('change',function(){need3d=true;});(function loop(){requestAnimationFrame(loop);if(ctl.update())need3d=true;if(need3d&&!document.hidden){need3d=false;R3.render(scene,cam);}})();window.addEventListener('resize',function(){resize3d();});}
function resize3d(){need3d=true;if(!R3)return;var el=$('view');var w=el.clientWidth||300,h=el.clientHeight||300;R3.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}
var MCOL={1:'#e8d6c9',2:'#7cc66b',3:'#fbeef3',4:'#b04a72',5:'#d9c2a8',6:'#3f9d4a',7:'#7a5230',8:'#ff9fc8',9:'#ffffff',10:'#ffffff'};
var firstView=true;
function update3d(){need3d=true;if(!R3)return;var o=opts();var g=C.build(D,{scale:o.scale,base:o.base,bold:o.bold});lastG=g;
 while(group.children.length){var c=group.children.pop();c.geometry.dispose();}
 var s=0.25;var X=g.X,Y=g.Y,Z=g.Z,v=g.v;var cx=X*s/2,cz=Z*s/2;var B=g.B;
 if($('viewMode').value==='print'){var m=C.mesh(g);var geo=new THREE.BufferGeometry();var P=new Float32Array(m.pos.length),k=1/g.vs*s;
  for(var i=0;i<P.length;i+=3){P[i]=m.pos[i]*k-cx;P[i+1]=m.pos[i+2]*k;P[i+2]=-m.pos[i+1]*k+cz;}
  geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setIndex(new THREE.BufferAttribute(m.tri,1));geo.computeVertexNormals();
  group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xff8fbf,roughness:.7,flatShading:true,clippingPlanes:[plane]})));}
 else{var pos=[],col=[];var cc=new THREE.Color();
  function sol(x,y,z){return x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z&&v[(y*Z+z)*X+x]>0;}
  function face(a,b,c,d,colr){pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(var q=0;q<6;q++)col.push(colr.r,colr.g,colr.b);}
  for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++){var mm=v[(y*Z+z)*X+x];if(!mm)continue;cc.set(MCOL[mm]||'#eee');
   var x0=x*s-cx,x1=x0+s,y0=y*s,y1=y0+s,z0=z*s-cz,z1=z0+s;
   if(!sol(x+1,y,z))face([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],cc);if(!sol(x-1,y,z))face([x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],cc);
   if(!sol(x,y+1,z))face([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],cc);if(!sol(x,y-1,z))face([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],cc);
   if(!sol(x,y,z+1))face([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],cc);if(!sol(x,y,z-1))face([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],cc);}
  var geo2=new THREE.BufferGeometry();geo2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo2.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo2.computeVertexNormals();
  group.add(new THREE.Mesh(geo2,new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:[plane],side:THREE.FrontSide})));
  // pool water and windows glass hint
  var wpos=[];for(var cz2=0;cz2<D.H;cz2++)for(var cx2=0;cx2<D.W;cx2++){if(D.get(0,cx2,cz2)!==T.POOL)continue;var a0=cx2*2*s-cx,b0=cz2*2*s-cz,h=Math.max(B-0.4,0.1)*s;wpos.push(a0,h,b0,a0,h,b0+2*s,a0+2*s,h,b0+2*s,a0,h,b0,a0+2*s,h,b0+2*s,a0+2*s,h,b0);}
  if(wpos.length){var wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wpos,3));wg.computeVertexNormals();group.add(new THREE.Mesh(wg,new THREE.MeshLambertMaterial({color:0x29b6f6,transparent:true,opacity:.8,side:THREE.DoubleSide})));}}
 plane.constant=showAll?1000:(B+(F+1)*C.STOREY)*s+0.01;
 if(firstView){var r=Math.max(X,Z)*s;cam.position.set(r*0.75,r*0.7,r*1.0);ctl.target.set(0,2,0);firstView=false;}
 sizeInfo(g);}
$('viewMode').onchange=update3d;$('cutaway').onclick=function(){showAll=!showAll;this.textContent=showAll?'Show all storeys':'Cut away above this storey';this.classList.toggle('on',!showAll);update3d();};
var lastG=null;
function sizeInfo(g){var o=opts();var m=C.mesh(g);var s=m.size;var wallmm=(o.bold?0.75:0.5)*1000/o.scale;var el=$('sizeInfo');
 var big=s[0]>220||s[1]>220||s[2]>250;var thin=wallmm<1.2;
 el.className='notice small '+(big||thin?'':'ok');el.innerHTML='Model size: <b>'+s.map(function(x){return x.toFixed(0);}).join(' × ')+' mm</b> (W × D × H) at 1:'+o.scale+'<br>Walls print '+wallmm.toFixed(1)+' mm thick · '+(m.tri.length/3|0).toLocaleString()+' triangles'+(g.B?' · base '+(g.B*g.vs).toFixed(1)+' mm':'')+(big?'<br><b>Bigger than a typical 220 × 220 bed.</b> Try a smaller scale or print one storey at a time.':'')+(thin?'<br><b>Walls are very thin at this scale.</b> Use Bold walls or a bigger scale.':'');}
var t3=null;function changed(){store();drawPlan();clearTimeout(t3);t3=setTimeout(update3d,120);}

/* ---------- export ---------- */
function exportMesh(){var o=opts();var only=+$('expWhat').value;var g=C.build(D,{scale:o.scale,base:only<=0?o.base:0,bold:o.bold,only:only<0?null:only});return C.mesh(g);}
function fname(ext){var w=$('expWhat').value;return 'coffeebreak-house-1-'+$('scale').value+(w==='-1'?'':'-level'+w)+'.'+ext;}
$('expStl').onclick=function(){if(demoBlocked())return;var m=exportMesh();if(!m.tri.length)return toast('Nothing to export yet');download(new Blob([C.stl(m)],{type:'model/stl'}),fname('stl'));$('expInfo').textContent='Saved '+fname('stl')+': '+(m.tri.length/3)+' triangles, '+m.size.map(function(x){return x.toFixed(1);}).join(' × ')+' mm. Open it in your slicer.';};
$('exp3mf').onclick=function(){if(demoBlocked())return;var m=exportMesh();if(!m.tri.length)return toast('Nothing to export yet');download(C.threeMF(m,'Coffeebreak House'),fname('3mf'));$('expInfo').textContent='Saved '+fname('3mf')+'. Double-click to open in your slicer.';};

/* ---------- slicer ---------- */
var sliced=null;
$('doSlice').onclick=function(){if(demoBlocked())return;var o=opts();var only=+$('expWhat').value;var g=C.build(D,{scale:o.scale,base:only<=0?o.base:0,bold:o.bold,only:only<0?null:only});
 $('sliceInfo').textContent='Slicing…';setTimeout(function(){try{sliced=C.slice(g,{lh:+$('lh').value,w:+$('noz').value,fil:+$('fil').value,temp:+$('tNoz').value,bed:+$('tBed').value,speed:+$('spd').value,infill:+$('inf').value,bedX:+$('bedX').value,bedY:+$('bedY').value});}catch(e){sliced=null;$('sliceInfo').textContent='Slicing failed: '+e.message+'. Use Download STL and a real slicer.';return;}
  if(!sliced){$('sliceInfo').textContent='Nothing to slice.';return;}
  var h=Math.floor(sliced.minutes/60),mi=Math.round(sliced.minutes%60);
  $('sliceInfo').innerHTML=sliced.nLayers+' layers · about '+(h?h+' h ':'')+mi+' min · '+sliced.filamentM.toFixed(1)+' m filament · '+(sliced.gcode.length/1e6).toFixed(1)+' MB'+(sliced.fits?'':'<br><b style="color:#c62828">Does not fit your bed. Choose a smaller scale.</b>')+(sliced.warn?'<br><b>'+sliced.warn+'</b>':'');
  $('dlG').disabled=false;$('layerSlider').max=sliced.nLayers-1;$('layerSlider').value=Math.min(sliced.nLayers-1,Math.round(sliced.nLayers*0.3));drawG();updBtns();},30);};
$('dlG').onclick=function(){if(sliced)download(new Blob([sliced.gcode],{type:'text/plain'}),fname('gcode'));};
$('layerSlider').oninput=drawG;
function drawG(){var c=$('gprev'),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);if(!sliced)return;var bx=+$('bedX').value,by=+$('bedY').value,k=c.width/Math.max(bx,by);
 x.strokeStyle='#ddd';x.strokeRect(0,0,bx*k,by*k);var L=+$('layerSlider').value;function dl(i,cl){x.strokeStyle=cl;x.lineWidth=Math.max(1,0.4*k);x.beginPath();sliced.layers[i].forEach(function(pl){x.moveTo(pl[0][0]*k,(by-pl[0][1])*k);for(var j=1;j<pl.length;j++)x.lineTo(pl[j][0]*k,(by-pl[j][1])*k);});x.stroke();}
 if(L>0)dl(L-1,'#f5c6da');dl(L,'#c2186b');x.fillStyle='#3a1028';x.font='13px sans-serif';x.fillText('Layer '+(L+1)+' / '+sliced.nLayers,6,16);}

/* ---------- USB Web Serial (Marlin) ---------- */
var port=null,reader=null,writer=null,waiters=[],printing=false,paused=false,cancelReq=false,lineNo=0,lastSent={};
function log(t){var l=$('log');l.textContent+=t+'\n';if(l.textContent.length>20000)l.textContent=l.textContent.slice(-15000);l.scrollTop=l.scrollHeight;}
function updBtns(){var c=!!port;['bHome','bPre','bCool','bStop','bSend','usbDisc'].forEach(function(id){$(id).disabled=!c;});$('usbConnect').disabled=c;$('bPrint').disabled=!(c&&sliced&&!printing);$('bPause').disabled=!printing;$('bCancel').disabled=!printing;}
function cs(s){var c=0;for(var i=0;i<s.length;i++)c^=s.charCodeAt(i);return c&255;}
function rawWrite(s){return writer.write(new TextEncoder().encode(s+'\n'));}
function send(cmd){ // numbered line with checksum, waits for ok
 cmd=cmd.split(';')[0].trim();if(!cmd)return Promise.resolve();lineNo++;var body='N'+lineNo+' '+cmd;var line=body+'*'+cs(body);lastSent[lineNo]=line;delete lastSent[lineNo-200];
 return new Promise(function(res,rej){waiters.push({res:res,rej:rej,t:setTimeout(function(){log('(no ok after 120 s for: '+cmd+')');res();},120000)});rawWrite(line).catch(rej);});}
function parseLine(l){if(!l)return;if(/T:\s*[\d.]+/.test(l)){var t=l.match(/T:\s*([\d.]+)\s*\/\s*([\d.]+)/),b=l.match(/B:\s*([\d.]+)\s*\/\s*([\d.]+)/);$('temps').textContent='Nozzle '+(t?t[1]+' / '+t[2]:'?')+' °C · Bed '+(b?b[1]+' / '+b[2]:'?')+' °C';if(!/^ok/.test(l))return;}
 var rs=l.match(/^(?:Resend|rs)[: ]\s*N?(\d+)/i);if(rs){var n=+rs[1];if(lastSent[n]){log('resend '+n);rawWrite(lastSent[n]);}return;}
 if(/^ok/.test(l)){var w=waiters.shift();if(w){clearTimeout(w.t);w.res();}return;}
 if(/^echo:busy/.test(l))return;if(/^(Error|!!)/.test(l)){log('PRINTER: '+l);if(/kill|halt|stopped/i.test(l)){printing=false;updBtns();}return;}log('< '+l);}
async function readLoop(){var dec=new TextDecoder(),buf='';try{while(port&&reader){var r=await reader.read();if(r.done)break;buf+=dec.decode(r.value,{stream:true});var parts=buf.split(/\r?\n/);buf=parts.pop();parts.forEach(function(p){parseLine(p.trim());});}}catch(e){log('Read stopped: '+e.message);}}
$('usbConnect').onclick=async function(){if(!('serial' in navigator)){toast('Web Serial needs desktop Chrome or Edge');log('This browser has no Web Serial. Use desktop Chrome or Edge, or download the G-code / STL.');return;}
 if(!$('safeOk').checked){toast('Tick the safety box first');return;}
 try{port=await navigator.serial.requestPort();await port.open({baudRate:+$('baud').value});writer=port.writable.getWriter();reader=port.readable.getReader();readLoop();log('Connected at '+$('baud').value+' baud');$('pstatus').textContent='Connected by USB';updBtns();
  await new Promise(function(r){setTimeout(r,1800);}); // Marlin resets on connect
  lineNo=0;await rawWrite('M110 N0');await send('M115');await send('M155 S2');await send('M105');}catch(e){log('Could not connect: '+e.message);port=null;updBtns();}};
async function disconnect(){try{printing=false;if(reader){await reader.cancel();reader.releaseLock();}if(writer){writer.releaseLock();}if(port)await port.close();}catch(e){}port=null;reader=null;writer=null;waiters.forEach(function(w){clearTimeout(w.t);w.res();});waiters=[];$('temps').textContent='Not connected';$('pstatus').textContent='';log('Disconnected');updBtns();}
$('usbDisc').onclick=disconnect;
$('bHome').onclick=function(){if(confirm('Home all axes now? Make sure nothing is on the bed.'))send('G28');};
$('bPre').onclick=function(){send('M104 S'+$('tNoz').value);send('M140 S'+$('tBed').value);};
$('bCool').onclick=function(){send('M104 S0');send('M140 S0');send('M107');};
$('bStop').onclick=async function(){printing=false;cancelReq=true;try{await rawWrite('M112');}catch(e){}log('EMERGENCY STOP sent (M112). Power-cycle or reset the printer before using it again.');$('pstatus').textContent='Emergency stop sent';};
$('bSend').onclick=function(){var c=$('cmd').value.trim();if(!c)return;log('> '+c);send(c);$('cmd').value='';};
$('bPause').onclick=function(){paused=!paused;this.textContent=paused?'Resume':'Pause';$('pstatus').textContent=paused?'Paused (nozzle stays hot)':'Printing';};
$('bCancel').onclick=function(){if(confirm('Cancel this print?'))cancelReq=true;};
$('bPrint').onclick=async function(){if(!sliced||!port)return;if(!$('safeOk').checked)return toast('Tick the safety box first');if(!sliced.fits&&!confirm('The model looks bigger than your bed. Print anyway?'))return;if(!confirm('Start printing now? Stay with the printer.'))return;
 printing=true;paused=false;cancelReq=false;updBtns();var lines=sliced.gcode.split('\n').filter(function(l){return l.split(';')[0].trim();});var n=lines.length,t0=Date.now();
 for(var i=0;i<n&&printing;i++){while(paused&&!cancelReq)await new Promise(function(r){setTimeout(r,300);});if(cancelReq)break;await send(lines[i]);if(i%25===0){var pct=(i/n*100);$('pstatus').textContent='Printing '+pct.toFixed(1)+'% · line '+i+' of '+n+' · '+Math.round((Date.now()-t0)/60000)+' min';}}
 if(cancelReq&&port){log('Print cancelled');$('pstatus').textContent='Cancelled';try{await send('M104 S0');await send('M140 S0');await send('G91');await send('G1 Z10 F600');await send('G90');await send('M84');}catch(e){}}else if(printing){$('pstatus').textContent='Print sent: finished';log('All G-code sent');}
 printing=false;cancelReq=false;$('bPause').textContent='Pause';updBtns();};

/* ---------- Network printers ---------- */
try{var ns=JSON.parse(localStorage.getItem('cbhm-net')||'null');if(ns){$('netType').value=ns.type;$('netUrl').value=ns.url;$('netKey').value=ns.key;$('netRemember').checked=true;}}catch(e){}
function netSave(){if($('netRemember').checked)localStorage.setItem('cbhm-net',JSON.stringify({type:$('netType').value,url:$('netUrl').value,key:$('netKey').value}));else localStorage.removeItem('cbhm-net');}
$('netRemember').onchange=netSave;
function base(){return $('netUrl').value.trim().replace(/\/+$/,'');}
function hdr(){var h={},k=$('netKey').value.trim();if(k)h['X-Api-Key']=k;return h;}
function netMsg(t,ok){var e=$('netInfo');e.textContent=t;e.style.color=ok?'#2e7d32':'#c62828';}
function netErr(e){var u=base();var mixed=location.protocol==='https:'&&/^http:/i.test(u);netMsg('Could not reach the printer'+(mixed?': this https page is blocked from talking to an http printer address by your browser. Download the full app and open it from your computer, or use your printer\'s own web page to upload the G-code.':': '+(e&&e.message||e)+'. Check the URL, that the printer is on, and that cross-origin access is allowed.'),false);}
$('netTest').onclick=async function(){var u=base();if(!/^https?:\/\//i.test(u))return netMsg('Enter a URL starting with http:// or https://',false);netSave();
 try{var r=await fetch(u+($('netType').value==='octo'?'/api/version':'/server/info'),{headers:hdr()});var j=await r.json().catch(function(){return {};});
  if(!r.ok)return netMsg('Printer answered with error '+r.status+(r.status===403||r.status===401?' (check the API key)':''),false);
  netMsg($('netType').value==='octo'?'Connected to OctoPrint '+(j.server||'')+' (API '+(j.api||'?')+')':'Connected to Moonraker, Klippy '+((j.result&&j.result.klippy_state)||'?'),true);}catch(e){netErr(e);}};
$('netUp').onclick=async function(){if(!sliced)return toast('Slice to G-code first');var u=base();if(!/^https?:\/\//i.test(u))return netMsg('Enter the printer URL first',false);
 var start=$('netStart').checked;if(start&&!$('safeOk').checked)return toast('Tick the safety box before starting a print');if(start&&!confirm('Upload and START printing now? Stay with the printer.'))return;netSave();
 var fd=new FormData();var name=fname('gcode');fd.append('file',new Blob([sliced.gcode],{type:'text/plain'}),name);
 var url;if($('netType').value==='octo'){url=u+'/api/files/local';if(start){fd.append('select','true');fd.append('print','true');}}else{url=u+'/server/files/upload';fd.append('root','gcodes');if(start)fd.append('print','true');}
 netMsg('Uploading '+name+'…',true);try{var r=await fetch(url,{method:'POST',headers:hdr(),body:fd});if(!r.ok)return netMsg('Upload failed with error '+r.status,false);netMsg('Uploaded '+name+(start?' and started printing':'')+'.',true);}catch(e){netErr(e);}};

/* ---------- start ---------- */
if(!FULL){$('printPanel').querySelector('h2').insertAdjacentHTML('afterend','<div class="notice small">Free demo: everything works for designs up to 2 storeys (cottage, beach house or your own). The Mansion and Castle presets can be designed and viewed here; exporting and printing them needs the <a href="'+window.CB_BUY+'">full version ($10 USD)</a>.</div>');}
syncUI();fitCell();drawPlan();init3d();update3d();updBtns();
window.addEventListener('resize',function(){drawPlan();});
window.CBHM_APP={get design(){return D;},opts:opts,exportMesh:exportMesh,send:send,parseLine:parseLine};
})();
