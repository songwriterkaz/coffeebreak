import * as C from './core.js';
const $=id=>document.getElementById(id);const status=s=>$('status').textContent=s;
let tris=null,src=null; // src: {kind:'img',canvas} or {kind:'mesh',raw}
for(const[k,p]of Object.entries(C.PRINTERS))$('printer').add(new Option(p.name,k));$('printer').value='ender3';
// drawing
const cv=$('draw'),cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,512,512);let erase=false,down=false,last=null;
const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*512/r.width,(e.clientY-r.top)*512/r.height];};
cv.onpointerdown=e=>{down=true;cv.setPointerCapture(e.pointerId);last=pos(e);dot(last,last);};
cv.onpointermove=e=>{if(!down)return;const p=pos(e);dot(last,p);last=p;};cv.onpointerup=cv.onpointercancel=()=>down=false;
function dot(a,b){cx.strokeStyle=erase?'#fff':'#000';cx.lineWidth=+$('brush').value;cx.lineCap=cx.lineJoin='round';cx.beginPath();cx.moveTo(...a);cx.lineTo(...b);cx.stroke();}
$('pen').onclick=()=>erase=false;$('eraser').onclick=()=>erase=true;$('clear').onclick=()=>{cx.fillStyle='#fff';cx.fillRect(0,0,512,512);};
$('useDraw').onclick=()=>{src={kind:'img',canvas:cv,draw:true};build();};
// three.js view
let THREE,scene,cam,ren,ctl,meshObj;
(async()=>{try{THREE=await import('three');const{OrbitControls}=await import('three/addons/controls/OrbitControls.js');const el=$('view');
scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(45,1,0.1,5000);ren=new THREE.WebGLRenderer({antialias:true});ren.setPixelRatio(devicePixelRatio);el.appendChild(ren.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x553355,1.2));const d=new THREE.DirectionalLight(0xffffff,1.5);d.position.set(1,2,3);scene.add(d);
const grid=new THREE.GridHelper(220,22,0xff4fa3,0x553355);scene.add(grid);ctl=new OrbitControls(cam,ren.domElement);cam.position.set(0,140,160);
const rs=()=>{ren.setSize(el.clientWidth,el.clientHeight);cam.aspect=el.clientWidth/el.clientHeight;cam.updateProjectionMatrix();};addEventListener('resize',rs);rs();
(function loop(){requestAnimationFrame(loop);ctl.update();ren.render(scene,cam);})();status('Ready. Draw something or open a file.');}catch(e){status('3D preview needs internet the first time. Exports still work.');}})();
function show(){if(!scene||!tris)return;if(meshObj){scene.remove(meshObj);meshObj.geometry.dispose();}
const g=new THREE.BufferGeometry();const b=C.bounds(tris);const p=new Float32Array(tris.length);
for(let i=0;i<tris.length;i+=3){p[i]=tris[i]-b.mn[0]-b.size[0]/2;p[i+1]=tris[i+2];p[i+2]=-(tris[i+1]-b.mn[1]-b.size[1]/2);} // z-up to y-up
g.setAttribute('position',new THREE.BufferAttribute(p,3));g.computeVertexNormals();
meshObj=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xff4fa3,roughness:.5,flatShading:true}));scene.add(meshObj);
const m=Math.max(...b.size);cam.position.set(0,m*1.2,m*1.4);ctl.target.set(0,b.size[2]/2,0);}
// build
export function imgToTris(canvas,opts){const max=160;const s=Math.min(1,max/Math.max(canvas.width,canvas.height));const w=Math.max(1,Math.round(canvas.width*s)),h=Math.max(1,Math.round(canvas.height*s));
const t=document.createElement('canvas');t.width=w;t.height=h;const c=t.getContext('2d');c.drawImage(canvas,0,0,w,h);const px=c.getImageData(0,0,w,h).data;
const hm=C.pixelsToHeights(px,w,h,opts.mode,opts.depth,opts.invert);const cell=opts.width/w;return C.heightmapToTris(hm,w,h,cell,opts.base);}
function build(){const width=+$('sizeW').value||80,depth=+$('depth').value||5,base=+$('base').value||0;
if(!src)return status('Draw something or open a file first.');
if(src.kind==='img'){tris=imgToTris(src.canvas,{mode:src.draw?'outline':$('mode').value,depth,base,width,invert:$('invert').checked});}
else tris=C.fitSize(src.raw,width);
if(!tris.length){tris=null;return status('Nothing solid found. Try darker lines, or swap light and dark.');}
const b=C.bounds(tris);$('dims').textContent=`Model: ${b.size[0].toFixed(1)} x ${b.size[1].toFixed(1)} x ${b.size[2].toFixed(1)} mm, ${(tris.length/9)|0} triangles`;show();status('Looks good. Save it below when ready.');}
$('apply').onclick=build;$('mode').onchange=$('invert').onchange=()=>src&&src.kind==='img'&&!src.draw&&build();
// files
$('file').onchange=async e=>{const f=e.target.files[0];if(!f)return;const ext=f.name.split('.').pop().toLowerCase();status('Opening '+f.name+'...');
try{if(['stl','obj','3mf','ply'].includes(ext)){const buf=await f.arrayBuffer();const L={stl:['STLLoader','STLLoader'],obj:['OBJLoader','OBJLoader'],'3mf':['3MFLoader','ThreeMFLoader'],ply:['PLYLoader','PLYLoader']}[ext];
const mod=await import(`three/addons/loaders/${L[0]}.js`);const ld=new mod[L[1]]();let obj=ext==='obj'?ld.parse(new TextDecoder().decode(buf)):ld.parse(buf);
const arr=[];const add=(geo,mat)=>{let g=geo.index?geo.toNonIndexed():geo;g=g.clone();if(mat)g.applyMatrix4(mat);const p=g.attributes.position.array;for(let i=0;i<p.length;i++)arr.push(p[i]);};
if(obj.isBufferGeometry)add(obj);else{obj.updateMatrixWorld(true);obj.traverse(o=>{if(o.isMesh)add(o.geometry,o.matrixWorld);});}
let raw=new Float32Array(arr);if(ext==='obj'){for(let i=0;i<raw.length;i+=3){const y=raw[i+1];raw[i+1]=-raw[i+2];raw[i+2]=y;}} // OBJ is usually y-up
src={kind:'mesh',raw};$('sizeW').value=Math.round(Math.max(C.bounds(raw).size[0],C.bounds(raw).size[1]))||80;build();}
else{const url=URL.createObjectURL(f);const im=new Image();await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src=url;});
const c=document.createElement('canvas');c.width=im.naturalWidth||512;c.height=im.naturalHeight||512;const x=c.getContext('2d');x.fillStyle='#fff';if(ext!=='png')x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
src={kind:'img',canvas:c};build();}}catch(err){status('Could not open that file. Try STL, OBJ, 3MF, PLY, PNG, JPG or SVG.');console.error(err);}};
// exports
function save(data,name,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();status('Saved '+name);}
const need=()=>{if(!tris){status('Make a model first.');return false;}return true;};
$('eSTL').onclick=()=>need()&&save(C.toSTL(tris),'coffeebreak-model.stl','model/stl');
$('eOBJ').onclick=()=>need()&&save(C.toOBJ(tris),'coffeebreak-model.obj','text/plain');
$('e3MF').onclick=()=>need()&&save(C.to3MF(tris),'coffeebreak-model.3mf','model/3mf');
$('eG').onclick=()=>{if(!need())return;const k=$('printer').value,p=C.PRINTERS[k],b=C.bounds(tris);
if(b.size[0]>p.bed[0]||b.size[1]>p.bed[1])return status(`Too big for the ${p.name} bed. Make the width smaller.`);status('Slicing, one moment...');
setTimeout(()=>{save(C.toGcode(tris,k,{layer:+$('layer').value}),`coffeebreak-${k}.gcode`,'text/plain');if(p.note)status(p.note);},30);};
window.__cb={get tris(){return tris},build,setSrc:s=>src=s};
// ---- phone app extras ----
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
let deferred=null;const inst=$('install');const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(!localStorage.cbNoInstall)inst.style.display='block';});
if(!standalone&&/iphone|ipad/i.test(navigator.userAgent)&&!localStorage.cbNoInstall){$('installTxt').textContent='To install, tap Share then Add to Home Screen';$('installBtn').style.display='none';inst.style.display='block';}
$('installBtn').onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;inst.style.display='none';};
$('installNo').onclick=()=>{localStorage.cbNoInstall=1;inst.style.display='none';};
$('cam').onchange=$('gal').onchange=e=>{const f=e.target.files[0];if(!f)return;const dt=new DataTransfer();dt.items.add(f);$('file').files=dt.files;$('file').onchange({target:$('file')});};
const gcodeNow=()=>{const k=$('printer').value,p=C.PRINTERS[k],b=C.bounds(tris);if(b.size[0]>p.bed[0]||b.size[1]>p.bed[1]){status(`Too big for the ${p.name} bed. Make the width smaller.`);return null;}return{data:C.toGcode(tris,k,{layer:+$('layer').value}),name:`coffeebreak-${k}.gcode`};};
async function share(data,name,type){const f=new File([data],name,{type});
 if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name});status('Shared '+name);}catch(e){if(e.name!=='AbortError')save(data,name,type);}}else save(data,name,type);}
$('shareSTL').onclick=()=>need()&&share(C.toSTL(tris),'coffeebreak-model.stl','application/octet-stream');
$('shareG').onclick=()=>{if(!need())return;const g=gcodeNow();if(g)share(g.data,g.name,'text/plain');};
const hostSel=$('host');const upd=()=>{$('wifi').style.display=hostSel.value==='sd'?'none':'block';$('keyRow').style.display=hostSel.value==='octo'?'flex':'none';};
hostSel.onchange=upd;['ip','key','host'].forEach(id=>{if(localStorage['cb_'+id])$(id).value=localStorage['cb_'+id];$(id).addEventListener('change',()=>localStorage['cb_'+id]=$(id).value);});upd();
$('send').onclick=async()=>{if(!need())return;const g=gcodeNow();if(!g)return;const h=hostSel.value;
 if(h==='sd'){save(g.data,g.name,'text/plain');status('Saved. Copy it to the SD card or USB stick, then choose it on the printer.');return;}
 const ip=$('ip').value.trim().replace(/^https?:\/\//,'').replace(/\/$/,'');if(!ip)return status('Type the printer IP first.');
 const fd=new FormData();fd.append('file',new Blob([g.data],{type:'text/plain'}),g.name);const go=$('autoPrint').checked;let url,headers={};
 if(h==='octo'){url=`http://${ip}/api/files/local`;headers['X-Api-Key']=$('key').value.trim();if(go){fd.append('select','true');fd.append('print','true');}}
 else{url=`http://${ip}/server/files/upload`;fd.append('root','gcodes');if(go)fd.append('print','true');}
 status('Sending to '+ip+'...');try{const r=await fetch(url,{method:'POST',body:fd,headers});if(!r.ok)throw new Error(r.status);status(go?'Sent and printing.':'Sent. It is on the printer now.');}
 catch(e){save(g.data,g.name,'text/plain');status('Could not reach the printer from here, so the G-code was saved instead. Upload it on the printer page at http://'+ip);}};
