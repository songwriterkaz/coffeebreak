/* Coffeebreak Life-Size 3D Print Studio UI. (c) Karen O'Brien (Coffeebreak). All rights reserved. */
(function(){'use strict';
var C=window.CBLS, FULL=!!window.CB_FULL, $=function(id){return document.getElementById(id);};
var cat='house', hPreset='cottage', animal='dog', boat='kayak';
var model=null, parts=[], selectedPart=-1, sliced=null, need3d=true;

function toast(t){var e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(function(){e.style.display='none';},3500);}
function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},2500);}

/* Demo limits: free demo only exports when longest whole-model edge <= 400 mm (or a single part). */
function demoBlocked(forPart){
 if(FULL)return false;
 if(forPart)return false; // single bed-sized parts always OK in demo
 if(!model)return true;
 var m=C.mesh(model.grid);var long=Math.max(m.size[0],m.size[1],m.size[2]);
 if(long>400){toast('Free demo exports models up to 400 mm on the longest edge, or individual split parts. Get the full version ($10) for larger life-size exports.');return true;}
 return false;
}

/* Tabs */
document.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){
 document.querySelectorAll('.tabs button').forEach(function(x){x.classList.toggle('on',x===b);});
 document.querySelectorAll('.wrap>.panel').forEach(function(p){p.classList.toggle('show',p.id===b.dataset.tab);});
 if(b.dataset.tab==='viewPanel')resize3d();
};});

/* Category */
function showOpts(){
 ['house','dress','animal','boat'].forEach(function(k){$(k+'Opts').hidden=k!==cat;});
}
document.querySelectorAll('#cats button').forEach(function(b){b.onclick=function(){
 cat=b.dataset.cat;document.querySelectorAll('#cats button').forEach(function(x){x.classList.toggle('on',x===b);});showOpts();
};});
document.querySelectorAll('[data-hpreset]').forEach(function(b){b.onclick=function(){hPreset=b.dataset.hpreset;document.querySelectorAll('[data-hpreset]').forEach(function(x){x.classList.toggle('on',x===b);});};});
document.querySelectorAll('[data-animal]').forEach(function(b){b.onclick=function(){animal=b.dataset.animal;document.querySelectorAll('[data-animal]').forEach(function(x){x.classList.toggle('on',x===b);});};});
document.querySelectorAll('[data-boat]').forEach(function(b){b.onclick=function(){boat=b.dataset.boat;document.querySelectorAll('[data-boat]').forEach(function(x){x.classList.toggle('on',x===b);});};});

function buildModel(){
 try{
  if(cat==='house'){
   model=C.models.house({preset:hPreset,lifeScale:+$('hScale').value,base:+$('hBase').value});
  } else if(cat==='dress'){
   model=C.models.dress({style:$('dStyle').value,bust:+$('dBust').value,waist:+$('dWaist').value,hips:+$('dHips').value,length:+$('dLen').value,sleeve:+$('dSleeve').value,pitch:+$('dPitch').value});
  } else if(cat==='animal'){
   model=C.models.animal({animal:animal,lifeScale:+$('aScale').value});
  } else {
   model=C.models.boat({boat:boat,lifeScale:+$('bScale').value});
  }
 }catch(e){toast('Build failed: '+e.message);console.error(e);return;}
 parts=[];
 if($('doSplit').checked){
  parts=C.splitGrid(model.grid,{x:+$('bedX').value,y:+$('bedY').value,z:+$('bedZ').value},{prefix:cat[0].toUpperCase(),maxParts:FULL?120:40});
 }
 selectedPart=parts.length?0:-1;
 refreshPartsUI();
 update3d();
 var m=C.mesh(model.grid);
 var long=Math.max.apply(null,m.size);
 $('sizeInfo').className='notice small '+(long>Math.max(+$('bedX').value,+$('bedY').value)?'':'ok');
 $('sizeInfo').innerHTML='Whole model: <b>'+m.size.map(function(x){return x.toFixed(0);}).join(' × ')+' mm</b> (W × D × H) · '+(m.triCount||0).toLocaleString()+' triangles · voxel '+model.grid.vs+' mm'
  +(parts.length?' · <b>'+parts.length+' parts</b> after split':'');
 var life=model.lifeMm?('Real-world target: '+Object.keys(model.lifeMm).map(function(k){return k+' '+Math.round(model.lifeMm[k])+' mm';}).join(', ')):'';
 if(model.lifeScale!=null)life+=(life?' · ':'')+'Print scale '+(model.lifeScale*100).toFixed(0)+'% of life size';
 if(model.hmScale)life+=' (House Maker 1:'+model.hmScale+')';
 $('dims').textContent=life;
 if(!FULL&&long>400)toast('Demo: view any size; export whole model only up to 400 mm, or export individual parts.');
 else toast((model.name||cat)+' ready'+(parts.length?' · '+parts.length+' parts':''));
}
$('rebuild').onclick=buildModel;

function refreshPartsUI(){
 var list=$('partsList');list.innerHTML='';
 var vp=$('viewPart'),sp=$('slicePart');
 var keep=vp.value;vp.innerHTML='<option value="-1">Whole model</option>';sp.innerHTML='<option value="-1">Whole (if fits)</option>';
 parts.forEach(function(p,i){
  var row=document.createElement('div');
  row.innerHTML='<span><b>'+p.label+'</b> · '+p.mesh.size.map(function(x){return x.toFixed(0);}).join('×')+' mm · '+(p.mesh.triCount)+' tri</span><button data-i="'+i+'">Select</button>';
  row.querySelector('button').onclick=function(){selectedPart=+this.dataset.i;$('viewPart').value=selectedPart;update3d();};
  list.appendChild(row);
  var o=document.createElement('option');o.value=i;o.textContent=p.label+' ('+p.mesh.size.map(function(x){return x.toFixed(0);}).join('×')+' mm)';vp.appendChild(o);
  sp.appendChild(o.cloneNode(true));
 });
 if(keep!==''&&(+keep<parts.length))vp.value=keep;
 else vp.value=selectedPart;
 $('viewPart').onchange=function(){selectedPart=+this.value;update3d();};
}

/* 3D */
var R3,scene,cam,ctl,group;
function init3d(){var el=$('view');R3=new THREE.WebGLRenderer({antialias:true});R3.setPixelRatio(Math.min(2,devicePixelRatio||1));el.appendChild(R3.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color('#cfe8ff');
 cam=new THREE.PerspectiveCamera(45,1,0.1,50000);cam.position.set(400,300,500);
 ctl=new THREE.OrbitControls(cam,R3.domElement);ctl.enableDamping=true;ctl.maxPolarAngle=Math.PI*0.49;
 scene.add(new THREE.HemisphereLight(0xffffff,0xb08aa0,0.8));
 var dl=new THREE.DirectionalLight(0xffffff,0.7);dl.position.set(200,400,150);scene.add(dl);
 var gr=new THREE.Mesh(new THREE.CircleGeometry(5000,64),new THREE.MeshLambertMaterial({color:0x9fd28c}));gr.rotation.x=-Math.PI/2;gr.position.y=-0.5;scene.add(gr);
 group=new THREE.Group();scene.add(group);
 resize3d();ctl.addEventListener('change',function(){need3d=true;});
 (function loop(){requestAnimationFrame(loop);if(ctl.update())need3d=true;if(need3d&&!document.hidden){need3d=false;R3.render(scene,cam);}})();
 window.addEventListener('resize',resize3d);
}
function resize3d(){need3d=true;if(!R3)return;var el=$('view');var w=el.clientWidth||300,h=el.clientHeight||300;R3.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}

var MCOL={1:'#f5d0e0',2:'#7cc66b',3:'#ff9fc8',4:'#ffb74d',5:'#d9c2a8',8:'#5c6bc0',9:'#ffe082'};
var firstView=true;
function update3d(){need3d=true;if(!R3||!model)return;
 while(group.children.length){var c=group.children.pop();if(c.geometry)c.geometry.dispose();}
 var g,m;
 if(selectedPart>=0&&parts[selectedPart]){g=parts[selectedPart].grid;m=parts[selectedPart].mesh;}
 else {g=model.grid;m=C.mesh(g);}
 var s=g.vs; // display scale: 1 unit = 1 mm visually too heavy; use 0.05 for large
 var disp=Math.max(0.02,Math.min(1,200/Math.max(m.size[0],m.size[1],m.size[2],1)));
 if($('viewMode').value==='print'){
  var geo=new THREE.BufferGeometry();
  var P=new Float32Array(m.pos.length);
  var cx=m.size[0]/2,cy=m.size[1]/2;
  for(var i=0;i<P.length;i+=3){P[i]=(m.pos[i]-cx)*disp;P[i+1]=m.pos[i+2]*disp;P[i+2]=-(m.pos[i+1]-cy)*disp;}
  geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setIndex(new THREE.BufferAttribute(m.tri,1));geo.computeVertexNormals();
  group.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xff8fbf,roughness:.7,flatShading:true})));
 } else {
  var X=g.X,Y=g.Y,Z=g.Z,v=g.v,vs=g.vs*disp;
  var cx=X*vs/2,cz=Z*vs/2;var pos=[],col=[];var cc=new THREE.Color();
  function sol(x,y,z){return x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z&&v[(y*Z+z)*X+x]>0;}
  function face(a,b,c,d,colr){pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2],a[0],a[1],a[2],c[0],c[1],c[2],d[0],d[1],d[2]);for(var q=0;q<6;q++)col.push(colr.r,colr.g,colr.b);}
  // subsample if huge
  var step=1;var solidCount=0;for(i=0;i<v.length;i++)if(v[i])solidCount++;
  if(solidCount>250000)step=2;if(solidCount>600000)step=3;
  for(var y=0;y<Y;y+=step)for(var z=0;z<Z;z+=step)for(var x=0;x<X;x+=step){var mm=v[(y*Z+z)*X+x];if(!mm)continue;cc.set(MCOL[mm]||'#eee');
   var x0=x*vs-cx,x1=x0+vs*step,y0=y*vs,y1=y0+vs*step,z0=z*vs-cz,z1=z0+vs*step;
   if(!sol(x+step,y,z))face([x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],cc);
   if(!sol(x-step,y,z))face([x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],cc);
   if(!sol(x,y+step,z))face([x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],cc);
   if(!sol(x,y-step,z))face([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],cc);
   if(!sol(x,y,z+step))face([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],cc);
   if(!sol(x,y,z-step))face([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],cc);}
  if(pos.length){var geo2=new THREE.BufferGeometry();geo2.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo2.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo2.computeVertexNormals();
   group.add(new THREE.Mesh(geo2,new THREE.MeshLambertMaterial({vertexColors:true})));}
 }
 if(firstView){var r=Math.max(m.size[0],m.size[2],50)*disp;cam.position.set(r*1.2,r*0.9,r*1.4);ctl.target.set(0,m.size[2]*disp*0.3,0);firstView=false;ctl.update();}
}
$('viewMode').onchange=update3d;

/* Export */
function currentMesh(whole){
 if(!whole&&selectedPart>=0&&parts[selectedPart])return parts[selectedPart].mesh;
 return C.mesh(model.grid);
}
function baseName(){var tag=model?(model.name||model.kind||cat):cat;var p=selectedPart>=0&&parts[selectedPart]?('-'+parts[selectedPart].label):'';return 'coffeebreak-lifesize-'+tag+p;}

$('expStl').onclick=function(){if(!model)return toast('Build a model first');if(demoBlocked(false))return;var m=C.mesh(model.grid);if(!m.triCount)return toast('Nothing to export');download(new Blob([C.stl(m,'Coffeebreak Life-Size')],{type:'model/stl'}),baseName().replace(/-P\d+/,'')+'.stl');$('expInfo').textContent='Saved whole STL · '+m.triCount+' triangles · '+m.size.map(function(x){return x.toFixed(1);}).join(' × ')+' mm';};
$('exp3mf').onclick=function(){if(!model)return toast('Build a model first');if(demoBlocked(false))return;var m=C.mesh(model.grid);if(!m.triCount)return toast('Nothing to export');download(C.threeMF(m,'Coffeebreak Life-Size'),baseName().replace(/-P\d+/,'')+'.3mf');$('expInfo').textContent='Saved whole 3MF';};
$('expOneStl').onclick=function(){if(!model)return;if(selectedPart<0)return toast('Select a part first (or build with auto-split)');if(demoBlocked(true))return;var p=parts[selectedPart];download(new Blob([C.stl(p.mesh,'CB '+p.label)],{type:'model/stl'}),'coffeebreak-lifesize-'+p.label+'.stl');$('expInfo').textContent='Saved '+p.label+' STL';};
$('expOne3mf').onclick=function(){if(!model)return;if(selectedPart<0)return toast('Select a part first');var p=parts[selectedPart];download(C.threeMF(p.mesh,'CB '+p.label),'coffeebreak-lifesize-'+p.label+'.3mf');$('expInfo').textContent='Saved '+p.label+' 3MF';};

$('expAllStl').onclick=async function(){
 if(!parts.length)return toast('Turn on auto-split and build first');
 if(!FULL&&parts.length>12){toast('Free demo zips up to 12 parts. Export parts one-by-one or get the full version.');}
 var list=FULL?parts:parts.slice(0,12);
 var files=[];
 list.forEach(function(p){files.push({name:p.label+'.stl',data:new Uint8Array(C.stl(p.mesh,'CB '+p.label))});});
 download(C.zip(files),'coffeebreak-lifesize-parts-stl.zip');
 $('expInfo').textContent='Saved zip of '+list.length+' STL parts';
};
$('expAll3mf').onclick=function(){
 if(!parts.length)return toast('Turn on auto-split and build first');
 var list=FULL?parts:parts.slice(0,12);
 // Each 3MF is already a zip; pack STLs as fallback named .3mf via threeMF blobs is awkward in sync zip.
 // Export a zip of binary STLs labeled, plus one multi-object note — use STL zip for reliability.
 var files=[];list.forEach(function(p){files.push({name:p.label+'.stl',data:new Uint8Array(C.stl(p.mesh,'CB '+p.label))});});
 download(C.zip(files),'coffeebreak-lifesize-parts-3mf-as-stl.zip');
 $('expInfo').textContent='Saved zip of '+list.length+' parts (STL inside; open any in your slicer). Full per-part 3MF is available via Download selected 3MF.';
};

/* Slicer */
$('doSlice').onclick=function(){
 if(!model)return toast('Build a model first');
 var which=+$('slicePart').value;
 var g,isPart=which>=0;
 if(isPart){if(!parts[which])return;g=parts[which].grid;}
 else {g=model.grid;if(demoBlocked(false))return;}
 $('sliceInfo').textContent='Slicing…';
 setTimeout(function(){
  try{sliced=C.slice(g,{lh:+$('lh').value,w:+$('noz').value,fil:+$('fil').value,temp:+$('tNoz').value,bed:+$('tBed').value,speed:+$('spd').value,infill:+$('inf').value,bedX:+$('bedX').value,bedY:+$('bedY').value});}
  catch(e){sliced=null;$('sliceInfo').textContent='Slicing failed: '+e.message;return;}
  if(!sliced){$('sliceInfo').textContent='Nothing to slice';return;}
  var h=Math.floor(sliced.minutes/60),mi=Math.round(sliced.minutes%60);
  $('sliceInfo').innerHTML=sliced.nLayers+' layers · about '+(h?h+' h ':'')+mi+' min · '+sliced.filamentM.toFixed(1)+' m filament'+(sliced.fits?'':'<br><b style="color:#c62828">Does not fit your bed. Slice a part or shrink the model.</b>');
  $('dlG').disabled=false;$('layerSlider').max=Math.max(0,sliced.nLayers-1);$('layerSlider').value=0;drawG();updBtns();
 },40);
};
$('dlG').onclick=function(){if(sliced)download(new Blob([sliced.gcode],{type:'text/plain'}),'coffeebreak-lifesize.gcode');};
$('layerSlider').oninput=drawG;
function drawG(){var c=$('gprev'),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);if(!sliced)return;var bx=+$('bedX').value,by=+$('bedY').value,k=c.width/Math.max(bx,by);
 x.strokeStyle='#ddd';x.strokeRect(0,0,bx*k,by*k);var L=+$('layerSlider').value;
 function dl(i,cl){x.strokeStyle=cl;x.lineWidth=Math.max(1,0.4*k);x.beginPath();sliced.layers[i].forEach(function(pl){x.moveTo(pl[0][0]*k,(by-pl[0][1])*k);for(var j=1;j<pl.length;j++)x.lineTo(pl[j][0]*k,(by-pl[j][1])*k);});x.stroke();}
 if(L>0)dl(L-1,'#f5c6da');dl(L,'#c2186b');x.fillStyle='#3a1028';x.font='13px sans-serif';x.fillText('Layer '+(L+1)+' / '+sliced.nLayers,6,16);}

/* USB Web Serial */
var port=null,reader=null,writer=null,waiters=[],printing=false,paused=false,cancelReq=false,lineNo=0,lastSent={};
function log(t){var l=$('log');l.textContent+=t+'\n';if(l.textContent.length>20000)l.textContent=l.textContent.slice(-15000);l.scrollTop=l.scrollHeight;}
function updBtns(){var c=!!port;['bHome','bPre','bCool','bStop','bSend','usbDisc'].forEach(function(id){$(id).disabled=!c;});$('usbConnect').disabled=c;$('bPrint').disabled=!(c&&sliced&&!printing);$('bPause').disabled=!printing;$('bCancel').disabled=!printing;}
function cs(s){var c=0;for(var i=0;i<s.length;i++)c^=s.charCodeAt(i);return c&255;}
function rawWrite(s){return writer.write(new TextEncoder().encode(s+'\n'));}
function send(cmd){cmd=cmd.split(';')[0].trim();if(!cmd)return Promise.resolve();lineNo++;var body='N'+lineNo+' '+cmd;var line=body+'*'+cs(body);lastSent[lineNo]=line;delete lastSent[lineNo-200];
 return new Promise(function(res,rej){waiters.push({res:res,rej:rej,t:setTimeout(function(){log('(no ok after 120 s for: '+cmd+')');res();},120000)});rawWrite(line).catch(rej);});}
function parseLine(l){if(!l)return;if(/T:\s*[\d.]+/.test(l)){var t=l.match(/T:\s*([\d.]+)\s*\/\s*([\d.]+)/),b=l.match(/B:\s*([\d.]+)\s*\/\s*([\d.]+)/);$('temps').textContent='Nozzle '+(t?t[1]+' / '+t[2]:'?')+' °C · Bed '+(b?b[1]+' / '+b[2]:'?')+' °C';if(!/^ok/.test(l))return;}
 var rs=l.match(/^(?:Resend|rs)[: ]\s*N?(\d+)/i);if(rs){var n=+rs[1];if(lastSent[n]){log('resend '+n);rawWrite(lastSent[n]);}return;}
 if(/^ok/.test(l)){var w=waiters.shift();if(w){clearTimeout(w.t);w.res();}return;}
 if(/^echo:busy/.test(l))return;if(/^(Error|!!)/.test(l)){log('PRINTER: '+l);if(/kill|halt|stopped/i.test(l)){printing=false;updBtns();}return;}log('< '+l);}
async function readLoop(){var dec=new TextDecoder(),buf='';try{while(port&&reader){var r=await reader.read();if(r.done)break;buf+=dec.decode(r.value,{stream:true});var parts=buf.split(/\r?\n/);buf=parts.pop();parts.forEach(function(p){parseLine(p.trim());});}}catch(e){log('Read stopped: '+e.message);}}
$('usbConnect').onclick=async function(){if(!('serial' in navigator)){toast('Web Serial needs desktop Chrome or Edge');return;}
 if(!$('safeOk').checked){toast('Tick the safety box first');return;}
 try{port=await navigator.serial.requestPort();await port.open({baudRate:+$('baud').value});writer=port.writable.getWriter();reader=port.readable.getReader();readLoop();log('Connected at '+$('baud').value+' baud');$('pstatus').textContent='Connected by USB';updBtns();
  await new Promise(function(r){setTimeout(r,1800);});lineNo=0;await rawWrite('M110 N0');await send('M115');await send('M155 S2');await send('M105');}catch(e){log('Could not connect: '+e.message);port=null;updBtns();}};
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
 for(var i=0;i<n&&printing;i++){while(paused&&!cancelReq)await new Promise(function(r){setTimeout(r,300);});if(cancelReq)break;await send(lines[i]);if(i%25===0)$('pstatus').textContent='Printing '+(i/n*100).toFixed(1)+'% · line '+i+' of '+n+' · '+Math.round((Date.now()-t0)/60000)+' min';}
 if(cancelReq&&port){log('Print cancelled');$('pstatus').textContent='Cancelled';try{await send('M104 S0');await send('M140 S0');await send('G91');await send('G1 Z10 F600');await send('G90');await send('M84');}catch(e){}}else if(printing){$('pstatus').textContent='Print sent: finished';log('All G-code sent');}
 printing=false;cancelReq=false;$('bPause').textContent='Pause';updBtns();};

/* Network */
try{var ns=JSON.parse(localStorage.getItem('cbls-net')||'null');if(ns){$('netType').value=ns.type;$('netUrl').value=ns.url;$('netKey').value=ns.key;$('netRemember').checked=true;}}catch(e){}
function netSave(){if($('netRemember').checked)localStorage.setItem('cbls-net',JSON.stringify({type:$('netType').value,url:$('netUrl').value,key:$('netKey').value}));else localStorage.removeItem('cbls-net');}
$('netRemember').onchange=netSave;
function base(){return $('netUrl').value.trim().replace(/\/+$/,'');}
function hdr(){var h={},k=$('netKey').value.trim();if(k)h['X-Api-Key']=k;return h;}
function netMsg(t,ok){var e=$('netInfo');e.textContent=t;e.style.color=ok?'#2e7d32':'#c62828';}
function netErr(e){var u=base();var mixed=location.protocol==='https:'&&/^http:/i.test(u);netMsg('Could not reach the printer'+(mixed?': this https page is blocked from talking to an http printer address by your browser. Download the app and open it from your computer, or use your printer\'s own web page.':': '+(e&&e.message||e)),false);}
$('netTest').onclick=async function(){var u=base();if(!/^https?:\/\//i.test(u))return netMsg('Enter a URL starting with http:// or https://',false);netSave();
 try{var r=await fetch(u+($('netType').value==='octo'?'/api/version':'/server/info'),{headers:hdr()});var j=await r.json().catch(function(){return {};});
  if(!r.ok)return netMsg('Printer answered with error '+r.status,false);
  netMsg($('netType').value==='octo'?'Connected to OctoPrint '+(j.server||''):'Connected to Moonraker, Klippy '+((j.result&&j.result.klippy_state)||'?'),true);}catch(e){netErr(e);}};
$('netUp').onclick=async function(){if(!sliced)return toast('Slice to G-code first');var u=base();if(!/^https?:\/\//i.test(u))return netMsg('Enter the printer URL first',false);
 var start=$('netStart').checked;if(start&&!$('safeOk').checked)return toast('Tick the safety box before starting a print');if(start&&!confirm('Upload and START printing now? Stay with the printer.'))return;netSave();
 var fd=new FormData();var name='coffeebreak-lifesize.gcode';fd.append('file',new Blob([sliced.gcode],{type:'text/plain'}),name);
 var url;if($('netType').value==='octo'){url=u+'/api/files/local';if(start){fd.append('select','true');fd.append('print','true');}}else{url=u+'/server/files/upload';fd.append('root','gcodes');if(start)fd.append('print','true');}
 netMsg('Uploading…',true);try{var r=await fetch(url,{method:'POST',headers:hdr(),body:fd});if(!r.ok)return netMsg('Upload failed with error '+r.status,false);netMsg('Uploaded '+name+(start?' and started printing':''),true);}catch(e){netErr(e);}};

/* Start */
if(!FULL){document.querySelector('#printPanel h2').insertAdjacentHTML('afterend','<div class="notice small">Free demo: design any category and export models up to 400 mm on the longest edge, or export individual auto-split parts. The <a href="'+window.CB_BUY+'">full version ($10 USD)</a> unlocks whole-model export at any life-size scale and larger part zips.</div>');}
showOpts();init3d();updBtns();
// Default small cottage so first paint is quick
setTimeout(buildModel,60);
window.CBLS_APP={get model(){return model;},get parts(){return parts;},buildModel:buildModel};
})();
