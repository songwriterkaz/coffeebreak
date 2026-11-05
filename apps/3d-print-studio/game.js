const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
document.addEventListener('pointerdown',function(){startMusic()},{once:true});
music.volume=0.25;
// ================= 3D designer =================
const G={state:'design',score:0,level:0};window.G=G;
THREE.Object3D.DefaultUp.set(0,0,1);
const cv=$('c'),view=$('view');
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setClearColor(0x1a0a10);
const S=new THREE.Scene();const cam=new THREE.PerspectiveCamera(45,1,1,5000);cam.position.set(140,-200,160);
const ctl=new THREE.OrbitControls(cam,cv);ctl.target.set(0,0,10);ctl.update();
S.add(new THREE.HemisphereLight(0xffffff,0x553344,0.9));const dl=new THREE.DirectionalLight(0xffffff,0.7);dl.position.set(100,-150,250);S.add(dl);
let bedGroup=new THREE.Group();S.add(bedGroup);
const font=new THREE.FontLoader().parse(window.CB_FONT);
const PRESETS={"Creality Ender 3 / V2 / S1":[220,220,250],"Creality Ender 3 V3 / K1":[220,220,250],"Creality CR-10":[300,300,400],"Prusa MK3S / MK4":[250,210,210],"Prusa Mini":[180,180,180],"Anycubic Kobra 2":[220,220,250],"Elegoo Neptune 4":[225,225,265],"Artillery Sidewinder X2":[300,300,400],"Voron 2.4 (350)":[350,350,340],"Bambu Lab A1 mini":[180,180,180],"Custom":[200,200,200]};
const sel=$('preset');for(const k in PRESETS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o)}
function bed(){return[+$('bx').value||220,+$('by').value||220,+$('bz').value||250]}
function setPreset(){const p=PRESETS[sel.value];if(sel.value!=='Custom'){$('bx').value=p[0];$('by').value=p[1];$('bz').value=p[2]}drawBed();localStorage.p3dPreset=sel.value}
sel.onchange=setPreset;['bx','by','bz'].forEach(i=>$(i).onchange=drawBed);
function drawBed(){S.remove(bedGroup);bedGroup=new THREE.Group();const [w,d]=bed();
 const pl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({color:0x2a1420}));bedGroup.add(pl);
 const gr=new THREE.GridHelper(Math.max(w,d),Math.round(Math.max(w,d)/10),0xe8a0b0,0x553344);gr.rotation.x=Math.PI/2;gr.position.z=0.05;bedGroup.add(gr);S.add(bedGroup)}
const MAT=new THREE.MeshStandardMaterial({color:0xe8a0b0,roughness:0.55,metalness:0.05});
const MATS=new THREE.MeshStandardMaterial({color:0xffcf6a,roughness:0.5,emissive:0x221100});
let parts=[],cur=null,nid=1;
function shapeFromPts(pts){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s}
function outline(kind,r){const P=[];const N=96;
 for(let i=0;i<N;i++){const t=i/N*Math.PI*2;let x,y;
  if(kind==='heart'){x=16*Math.pow(Math.sin(t),3);y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);x*=r/17;y*=r/17}
  else if(kind==='star'){const k=Math.round(i/N*10);const tt=k/10*Math.PI*2;if(i%Math.round(N/10))continue;const rr=k%2?r*0.45:r;x=rr*Math.sin(tt);y=rr*Math.cos(tt)}
  else if(kind==='flower'){const rr=r*(0.75+0.25*Math.cos(6*t));x=rr*Math.sin(t);y=rr*Math.cos(t)}
  else if(kind==='gingerbread'){// head + body silhouette via polar blend
   const a=Math.atan2(Math.sin(t),Math.cos(t));const rr=r*(0.62+0.18*Math.pow(Math.cos(2*a),2)+0.2*Math.max(0,Math.cos(a))*Math.pow(Math.cos(a),6)-0.12*Math.pow(Math.sin(a),2)*Math.max(0,-Math.cos(a)));x=rr*Math.sin(t);y=rr*Math.cos(t)}
  else{x=r*Math.sin(t);y=r*Math.cos(t)}
  P.push([x,y])}
 return P}
function offsetPts(P,d){// inward offset via vertex normals (good enough for smooth outlines)
 const n=P.length,O=[];let area=0;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];area+=a[0]*b[1]-b[0]*a[1]}const sg=area>0?1:-1;
 for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n];let nx=0,ny=0;[[a,b],[b,c]].forEach(([p,q])=>{const dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;nx+=-dy/l*sg;ny+=dx/l*sg});const l=Math.hypot(nx,ny)||1;O.push([b[0]+nx/l*d,b[1]+ny/l*d])}return O}
function ringGeo(P,wall,h){const s=shapeFromPts(P);s.holes.push(new THREE.Path(offsetPts(P,wall).map(p=>new THREE.Vector2(p[0],p[1]))));return new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:4})}
function textGeo(t,size,h){const g=new THREE.TextGeometry(t||' ',{font:font,size:size,height:h,curveSegments:6,bevelEnabled:false});g.computeBoundingBox();const b=g.boundingBox;g.translate(-(b.max.x+b.min.x)/2,-(b.max.y+b.min.y)/2,0);return g}
function merge(gs){// merge non-indexed position-only geometries
 let n=0;const arr=gs.map(g=>{g=g.index?g.toNonIndexed():g;n+=g.attributes.position.count;return g});const pos=new Float32Array(n*3);let o=0;arr.forEach(g=>{pos.set(g.attributes.position.array,o);o+=g.attributes.position.array.length});const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(pos,3));m.computeVertexNormals();return m}
function make(kind){const T=$('txt').value.trim()||'Hi';let g,name=kind;
 switch(kind){
 case'cube':g=new THREE.BoxGeometry(20,20,20);break;
 case'cylinder':g=new THREE.CylinderGeometry(10,10,20,48).rotateX(Math.PI/2);break;
 case'sphere':g=new THREE.SphereGeometry(12,40,24);break;
 case'cone':g=new THREE.ConeGeometry(12,24,48).rotateX(Math.PI/2);break;
 case'pyramid':g=new THREE.ConeGeometry(14,20,4).rotateX(Math.PI/2).rotateZ(Math.PI/4);break;
 case'torus':g=new THREE.TorusGeometry(14,4,20,64);break;
 case'text':g=textGeo(T,14,5);name='Text "'+T+'"';break;
 case'keychain':{const tg=textGeo(T,9,2);tg.computeBoundingBox();const tw=tg.boundingBox.max.x-tg.boundingBox.min.x;const W=tw+22,H=18,rr=6;
  const s=new THREE.Shape();const x0=-W/2,y0=-H/2;s.moveTo(x0+rr,y0);s.lineTo(x0+W-rr,y0);s.quadraticCurveTo(x0+W,y0,x0+W,y0+rr);s.lineTo(x0+W,y0+H-rr);s.quadraticCurveTo(x0+W,y0+H,x0+W-rr,y0+H);s.lineTo(x0+rr,y0+H);s.quadraticCurveTo(x0,y0+H,x0,y0+H-rr);s.lineTo(x0,y0+rr);s.quadraticCurveTo(x0,y0,x0+rr,y0);
  const hole=new THREE.Path();hole.absarc(x0+6.5,0,3,0,Math.PI*2,true);s.holes.push(hole);
  const plate=new THREE.ExtrudeGeometry(s,{depth:3,bevelEnabled:false,curveSegments:12});tg.translate(4,0,3);g=merge([plate,tg]);name='Keychain "'+T+'"';break}
 case'cutter':{const k=$('cutShape').value;const P=outline(k,30);g=merge([ringGeo(P,1.2,15),ringGeo(offsetPts(P,-3),4.2,3)]);name='Cookie cutter ('+k+')';break}
 case'vase':{const st=$('vaseStyle').value;const pts=[];const H=120,N=40;pts.push(new THREE.Vector2(0,0));
  for(let i=0;i<=N;i++){const t=i/N;let r=st==='classic'?28+14*Math.sin(t*Math.PI*1.2)-10*t:30+8*Math.sin(t*Math.PI*3)+6*t;pts.push(new THREE.Vector2(r,t*H))}
  pts.push(new THREE.Vector2(0,H));g=new THREE.LatheGeometry(pts,st==='twist'?6:64);if(st==='twist'){const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=y/H*Math.PI*0.8,x=p.getX(i),z=p.getZ(i);p.setX(i,x*Math.cos(a)-z*Math.sin(a));p.setZ(i,x*Math.sin(a)+z*Math.cos(a))}}
  g.rotateX(Math.PI/2);name='Vase ('+st+') — print in solid or vase mode';break}
 }
 addPart(g,name)}
function addPart(g,name,keep){g=g.index?g.toNonIndexed():g;g.computeVertexNormals();g.computeBoundingBox();const b=g.boundingBox;g.translate(-(b.max.x+b.min.x)/2,-(b.max.y+b.min.y)/2,-b.min.z);
 const m=new THREE.Mesh(g,MAT);m.userData={id:nid++,name:name};const off=(parts.length%5)*8;if(!keep)m.position.set(off,off,0);S.add(m);parts.push(m);select(m);G.score=parts.length;return m}
function dims(m){const b=new THREE.Box3().setFromObject(m);return b.getSize(new THREE.Vector3())}
function select(m){if(cur)cur.material=MAT;cur=m;if(m)m.material=MATS;listParts();$('edit').style.display=m?'block':'none';if(m){const d=dims(m);$('sx').value=d.x.toFixed(1);$('sy').value=d.y.toFixed(1);$('sz').value=d.z.toFixed(1);$('px').value=m.position.x.toFixed(1);$('py').value=m.position.y.toFixed(1);$('rz').value=Math.round(m.rotation.z*180/Math.PI)}}
function listParts(){const L=$('parts');L.innerHTML=parts.length?'':'<i style="font-size:12px">Nothing yet — add a shape above.</i>';parts.forEach(p=>{const d=document.createElement('div');const s=dims(p);d.textContent=p.userData.name+' · '+s.x.toFixed(0)+'×'+s.y.toFixed(0)+'×'+s.z.toFixed(0)+'mm';if(p===cur)d.className='sel';d.onclick=()=>select(p);L.appendChild(d)})}
function dropZ(m){m.updateMatrixWorld();const b=new THREE.Box3().setFromObject(m);m.position.z-=b.min.z}
['sx','sy','sz'].forEach((id,i)=>$(id).onchange=()=>{if(!cur)return;const d=dims(cur);const v=+$(id).value;if(v>0){const ax='xyz'[i];cur.scale[ax]*=v/d[ax];dropZ(cur);select(cur)}});
$('px').onchange=$('py').onchange=()=>{if(!cur)return;cur.position.x=+$('px').value;cur.position.y=+$('py').value;listParts()};
$('rz').onchange=()=>{if(!cur)return;cur.rotation.z=(+$('rz').value)*Math.PI/180;dropZ(cur);select(cur)};
$('del').onclick=()=>{if(!cur)return;S.remove(cur);parts=parts.filter(p=>p!==cur);cur=null;select(parts[parts.length-1]||null);G.score=parts.length};
$('dup').onclick=()=>{if(!cur)return;const m=addPart(cur.geometry.clone(),cur.userData.name,true);m.scale.copy(cur.scale);m.rotation.copy(cur.rotation);m.position.set(cur.position.x+10,cur.position.y+10,cur.position.z);select(m)};
$('clearAll').onclick=()=>{if(parts.length&&!confirm('Remove all parts?'))return;parts.forEach(p=>S.remove(p));parts=[];cur=null;select(null)};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>make(b.dataset.add));
$('stlIn').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const g=new THREE.STLLoader().parse(r.result);addPart(g,f.name)}catch(err){alert('Could not read that STL: '+err.message)}};r.readAsArrayBuffer(f);e.target.value=''};
// raycast select
const rc=new THREE.Raycaster();let downAt=null;cv.addEventListener('pointerdown',e=>downAt=[e.clientX,e.clientY]);
cv.addEventListener('pointerup',e=>{if(!downAt||Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>4)return;const r=cv.getBoundingClientRect();rc.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1},cam);const h=rc.intersectObjects(parts);if(h.length)select(h[0].object)});
function worldTris(){// Float32Array of world-space triangles (9 floats each)
 const out=[];parts.forEach(m=>{m.updateMatrixWorld();const p=m.geometry.attributes.position,v=new THREE.Vector3();const flip=m.matrixWorld.determinant()<0;for(let i=0;i<p.count;i+=3){const t=[];for(let k=0;k<3;k++){v.fromBufferAttribute(p,i+k).applyMatrix4(m.matrixWorld);t.push(v.x,v.y,v.z)}if(flip)out.push(t[0],t[1],t[2],t[6],t[7],t[8],t[3],t[4],t[5]);else out.push.apply(out,t)}});return new Float32Array(out)}
G.worldTris=worldTris;
function download(name,data,type){const b=new Blob([data],{type:type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}
G.stl=function(){const grp=new THREE.Group();parts.forEach(p=>{const m=new THREE.Mesh(p.geometry,MAT);m.matrix.copy(p.matrixWorld);m.matrixAutoUpdate=false;grp.add(m)});grp.updateMatrixWorld(true);parts.forEach((p,i)=>{grp.children[i].matrixWorld.copy(p.matrixWorld)});return new THREE.STLExporter().parse(grp,{binary:true})};
$('expStl').onclick=()=>{if(!parts.length)return alert('Add a shape first.');parts.forEach(p=>p.updateMatrixWorld());download('coffeebreak-design.stl',G.stl(),'model/stl');G.level++};
function resize(){const w=view.clientWidth,h=view.clientHeight;R.setSize(w,h,false);cam.aspect=w/Math.max(1,h);cam.updateProjectionMatrix();if(gcv.style.display==='block')drawLayer()}
function loop(){requestAnimationFrame(loop);if(tab==='design'||!GC)R.render(S,cam)}
// tabs
let tab='design';document.querySelectorAll('.tb').forEach(b=>b.onclick=()=>{const t=b.dataset.t;if(window.DEMO&&t!=='design'){window.demoEnd&&window.demoEnd('The free demo includes the 3D designer and STL export. <b>The built-in slicer and real printer connection (USB, OctoPrint and Klipper)</b> are in the full version.');return}
 tab=t;document.querySelectorAll('.tb').forEach(x=>x.classList.toggle('sel',x===b));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.id==='t-'+t));gcv.style.display=(t!=='design'&&GC)?'block':'none';G.state=t;resize()});
// ================= slicer =================
const gcv=$('gc2d');let GC=null,LAYERS=[];
const MATD={pla:[205,60],petg:[235,80],tpu:[225,50],abs:[245,100]};$('mat').onchange=()=>{const t=MATD[$('mat').value];$('tn').value=t[0];$('tb').value=t[1]};
$('inf').oninput=()=>$('infv').textContent=$('inf').value;
function sliceLayer(T,z){const segs=[];for(let i=0;i<T.length;i+=9){const a=T[i+2]-z,b=T[i+5]-z,c=T[i+8]-z;if((a>0&&b>0&&c>0)||(a<0&&b<0&&c<0))continue;const pts=[];const v=[[0,a],[3,b],[6,c]];for(let k=0;k<3;k++){const [o1,d1]=v[k],[o2,d2]=v[(k+1)%3];if((d1<0)!==(d2<0)){const t=d1/(d1-d2);pts.push([T[i+o1]+(T[i+o2]-T[i+o1])*t,T[i+o1+1]+(T[i+o2+1]-T[i+o1+1])*t])}}if(pts.length===2)segs.push(pts[0][0],pts[0][1],pts[1][0],pts[1][1])}return segs}
function chain(segs){const key=(x,y)=>Math.round(x*200)+','+Math.round(y*200);const M=new Map(),used=new Uint8Array(segs.length/4);for(let i=0;i<segs.length;i+=4){[0,2].forEach(o=>{const k=key(segs[i+o],segs[i+o+1]);if(!M.has(k))M.set(k,[]);M.get(k).push(i/4)})}
 const loops=[];for(let s=0;s<used.length;s++){if(used[s])continue;used[s]=1;const L=[[segs[s*4],segs[s*4+1]],[segs[s*4+2],segs[s*4+3]]];for(let guard=0;guard<100000;guard++){const e=L[L.length-1];const c=(M.get(key(e[0],e[1]))||[]).find(j=>!used[j]);if(c===undefined)break;used[c]=1;const j=c*4;const k1=key(segs[j],segs[j+1]);if(k1===key(e[0],e[1]))L.push([segs[j+2],segs[j+3]]);else L.push([segs[j],segs[j+1]])}if(L.length>3)loops.push(L)}return loops}
function scanFill(segs,ang,spacing,inset,phase){// even-odd scanline fill at angle
 const ca=Math.cos(ang),sa=Math.sin(ang);const r=[];for(let i=0;i<segs.length;i+=4)r.push(segs[i]*ca+segs[i+1]*sa,-segs[i]*sa+segs[i+1]*ca,segs[i+2]*ca+segs[i+3]*sa,-segs[i+2]*sa+segs[i+3]*ca);
 let y0=1e9,y1=-1e9;for(let i=1;i<r.length;i+=2){y0=Math.min(y0,r[i]);y1=Math.max(y1,r[i])}const lines=[];let flip=false;
 for(let y=Math.ceil((y0-phase)/spacing)*spacing+phase;y<y1;y+=spacing){const xs=[];for(let i=0;i<r.length;i+=4){const ya=r[i+1],yb=r[i+3];if((ya<=y)!==(yb<=y)){xs.push(r[i]+(r[i+2]-r[i])*(y-ya)/(yb-ya))}}xs.sort((a,b)=>a-b);const row=[];for(let k=0;k+1<xs.length;k+=2){const a=xs[k]+inset,b=xs[k+1]-inset;if(b-a>0.3)row.push([a,b])}if(flip)row.reverse();row.forEach(([a,b])=>{if(flip){const t=a;a=b;b=t}lines.push([[a*ca-y*sa,a*sa+y*ca],[b*ca-y*sa,b*sa+y*ca]])});flip=!flip}return lines}
function insetLoop(L,d){// loop inset by d (positive=inward relative to winding area)
 const P=L.slice(0,-1);if(P.length<3)return L;let area=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];area+=a[0]*b[1]-b[0]*a[1]}return null}
function slice(){const T=worldTris();if(!T.length){alert('Add a shape in the Design tab first.');return null}
 const lh=+$('lh').value,nd=+$('nd').value,fd=+$('fd').value,inf=+$('inf').value,walls=+$('walls').value,spd=+$('spd').value||40,tn=+$('tn').value,tb=+$('tb').value,[bw,bd,bh]=bed();
 let zmax=0,xmin=1e9,xmax=-1e9,ymin=1e9,ymax=-1e9;for(let i=0;i<T.length;i+=3){zmax=Math.max(zmax,T[i+2]);xmin=Math.min(xmin,T[i]);xmax=Math.max(xmax,T[i]);ymin=Math.min(ymin,T[i+1]);ymax=Math.max(ymax,T[i+1])}
 if(xmax-xmin>bw||ymax-ymin>bd||zmax>bh){if(!confirm('This design is bigger than the bed ('+bw+'×'+bd+'×'+bh+'mm). Slice anyway?'))return null}
 const ox=bw/2,oy=bd/2;const lw=nd*1.125,ea=lh*lw/(Math.PI*fd*fd/4);const out=[];let E=0,len=0,time=0,px=0,py=0;
 const P=(x,y)=>[(x+ox).toFixed(3),(y+oy).toFixed(3)];
 const travel=(x,y)=>{out.push('G1 E-0.8 F2400');const p=P(x,y);out.push('G0 X'+p[0]+' Y'+p[1]+' F6000');out.push('G1 E0.8 F2400');time+=Math.hypot(x-px,y-py)/100;px=x;py=y};
 const ext=(x,y,f)=>{const d=Math.hypot(x-px,y-py);if(d<0.01)return;const e=d*ea;E+=e;len+=d;time+=d/f;const p=P(x,y);out.push('G1 X'+p[0]+' Y'+p[1]+' E'+e.toFixed(5)+' F'+Math.round(f*60));px=x;py=y};
 out.push('; Coffeebreak 3D Print Studio - simple slicer','; layer '+lh+' nozzle '+nd+' infill '+inf+'%','M140 S'+tb,'M104 S'+tn,'G28','M190 S'+tb,'M109 S'+tn,'G90','M83','G92 E0','G1 Z5 F3000');
 const nL=Math.max(1,Math.floor(zmax/lh+1e-6));const solid=Math.max(2,Math.round(0.8/lh));LAYERS=[];
 for(let li=0;li<nL;li++){const z=(li+1)*lh,zc=Math.min(z-lh/2,zmax-1e-3)+1e-5;const segs=sliceLayer(T,zc);const loops=chain(segs);const layer=[];LAYERS.push(layer);
  out.push(';LAYER:'+li,'G0 Z'+z.toFixed(3)+' F3000');if(li===1&&$('fan').checked)out.push('M106 S255');const f=li===0?Math.min(20,spd):spd;
  if(li===0&&$('skirt').checked){const m=4;const sk=[[xmin-m,ymin-m],[xmax+m,ymin-m],[xmax+m,ymax+m],[xmin-m,ymax+m],[xmin-m,ymin-m]];travel(sk[0][0],sk[0][1]);let pr=[px,py];sk.slice(1).forEach(p=>{ext(p[0],p[1],f);layer.push([pr,p,2]);pr=p})}
  // walls: scanline-based inset of loops isn't trivial; emit outer loop, then inner walls from offset loops
  for(let w=0;w<walls;w++){loops.forEach(L=>{const Q=w?offLoop(L,w*lw,segs):L;if(!Q)return;travel(Q[0][0],Q[0][1]);let pr=Q[0];for(let k=1;k<Q.length;k++){ext(Q[k][0],Q[k][1],f);layer.push([pr,Q[k],0]);pr=Q[k]}ext(Q[0][0],Q[0][1],f);layer.push([pr,Q[0],0])})}
  const above=sliceLayer(T,zc+lh*solid),below=sliceLayer(T,zc-lh*solid);const isSolid=li<solid||li>=nL-solid||!above.length||!below.length;
  const dens=isSolid?100:inf;if(dens>0&&segs.length){const sp=lw*100/dens;const lines=scanFill(segs,(li%2?135:45)*Math.PI/180,sp,lw*(walls-0.5),isSolid?0:(li%2)*0);lines.forEach(([a,b])=>{if(Math.hypot(a[0]-px,a[1]-py)>lw*1.6)travel(a[0],a[1]);else ext(a[0],a[1],f);ext(b[0],b[1],f);layer.push([a,b,1])})}
 }
 out.push('M107','M104 S0','M140 S0','G91','G1 Z10 F600','G90','G0 X0 Y'+bd.toFixed(0)+' F6000','M84','; end');
 const grams=E*Math.PI*fd*fd/4/1000*1.24;GC=out.join('\n')+'\n';
 $('lay').max=LAYERS.length-1;$('lay').value=LAYERS.length-1;$('sliceInfo').innerHTML='✅ '+LAYERS.length+' layers · '+out.length+' lines · filament ≈ '+(E/1000).toFixed(2)+' m ('+grams.toFixed(1)+' g) · time ≈ '+Math.ceil(time/60*1.3)+' min<br>No supports — keep overhangs under 45°.';
 gcv.style.display='block';drawLayer();G.level=LAYERS.length;return GC}
function offLoop(L,d,segs){// inset by moving each vertex along normal toward inside (test inside with even-odd)
 const n=L.length-1;if(n<3)return null;let area=0;for(let i=0;i<n;i++){area+=L[i][0]*L[i+1][1]-L[i+1][0]*L[i][1]}if(Math.abs(area)<4*d*d*10)return null;const sg=area>0?1:-1;const Q=[];
 for(let i=0;i<n;i++){const a=L[(i-1+n)%n],b=L[i],c=L[(i+1)%n];let nx=0,ny=0;[[a,b],[b,c]].forEach(([p,q])=>{const dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;nx+=-dy/l;ny+=dx/l});const l=Math.hypot(nx,ny)||1;
  // pick direction that lands inside material
  let x=b[0]+nx/l*d*sg,y=b[1]+ny/l*d*sg;if(!inside(segs,x,y)){x=b[0]-nx/l*d*sg;y=b[1]-ny/l*d*sg;if(!inside(segs,x,y))continue}Q.push([x,y])}
 return Q.length>3?Q:null}
function inside(segs,x,y){let c=0;for(let i=0;i<segs.length;i+=4){const ya=segs[i+1],yb=segs[i+3];if((ya<=y)!==(yb<=y)){if(segs[i]+(segs[i+2]-segs[i])*(y-ya)/(yb-ya)>x)c++}}return c%2===1}
G.slice=slice;
function drawLayer(){const w=gcv.width=view.clientWidth,h=gcv.height=view.clientHeight;const c=gcv.getContext('2d');c.fillStyle='#0d0508';c.fillRect(0,0,w,h);const [bw,bd]=bed();const s=Math.min(w/bw,h/bd)*0.9,x0=(w-bw*s)/2,y0=(h-bd*s)/2;
 c.strokeStyle='#553344';c.strokeRect(x0,y0,bw*s,bd*s);const li=+$('lay').value;$('layv').textContent=(li+1)+'/'+LAYERS.length;const L=LAYERS[li]||[];
 c.lineWidth=Math.max(1,s*0.4);L.forEach(([a,b,t])=>{c.strokeStyle=t===0?'#e8a0b0':t===1?'#ffcf6a':'#88ccff';c.beginPath();c.moveTo(x0+(a[0]+bw/2)*s,y0+(bd/2-a[1])*s);c.lineTo(x0+(b[0]+bw/2)*s,y0+(bd/2-b[1])*s);c.stroke()});
 c.fillStyle='#ffe9c7';c.font='14px Georgia';c.fillText('Layer '+(li+1)+' of '+LAYERS.length+' — pink: walls, gold: infill, blue: skirt',10,20)}
$('lay').oninput=drawLayer;$('doSlice').onclick=()=>slice();
$('saveGc').onclick=()=>{if(!GC&&!slice())return;download('coffeebreak-print.gcode',GC,'text/plain')};
// ================= printer connection =================
const PR={kind:null,port:null,writer:null,reader:null,wait:null,printing:false,paused:false,abort:false,sent:0,total:0,poll:null};G.PR=PR;
function log(s){const l=$('log');l.textContent+=s+'\n';if(l.textContent.length>20000)l.textContent=l.textContent.slice(-15000);l.scrollTop=1e9}
function status(s){$('cstat').textContent=s}
$('conn').onchange=()=>{const v=$('conn').value;$('c-serial').style.display=v==='serial'?'block':'none';$('c-net').style.display=v==='serial'?'none':'block';localStorage.p3dConn=v};
function parseTemp(s){const t=s.match(/T:\s*([\d.]+)\s*\/\s*([\d.]+)/),b=s.match(/B:\s*([\d.]+)\s*\/\s*([\d.]+)/);if(t||b)$('temps').textContent='Nozzle '+(t?t[1]+'° / '+t[2]+'°':'—')+'  Bed '+(b?b[1]+'° / '+b[2]+'°':'—')}
async function serialConnect(){if(!('serial' in navigator)){alert('USB printing needs Chrome or Edge on desktop. The itch.io browser player may block it, so please use the downloaded version opened in Chrome/Edge, or use OctoPrint / Klipper.');return}
 const port=await navigator.serial.requestPort();await port.open({baudRate:+$('baud').value});PR.port=port;PR.kind='serial';PR.writer=port.writable.getWriter();status('Connected (USB)');log('Connected over USB at '+$('baud').value+' baud');readLoop();
 await new Promise(r=>setTimeout(r,1500));await sendCmd('M115');await sendCmd('M155 S3')}
async function readLoop(){const dec=new TextDecoder();let buf='';PR.reader=PR.port.readable.getReader();try{for(;;){const {value,done}=await PR.reader.read();if(done)break;buf+=dec.decode(value,{stream:true});let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line)continue;onLine(line)}}}catch(e){log('Serial closed: '+e.message)}finally{try{PR.reader.releaseLock()}catch(e){}}}
function onLine(line){parseTemp(line);if(!/^ok\b/.test(line)&&!/^ T:/.test(line)&&!/^T:/.test(line))log('< '+line);
 if(/^ok\b/.test(line)||/^ok$/i.test(line)){const w=PR.wait;PR.wait=null;if(w)w.res()}
 else if(/^(resend|rs)[: ]/i.test(line)){log('Printer asked to resend; resending last line')}
 else if(/^error/i.test(line)&&/kill|halted|stopped/i.test(line)){PR.abort=true;const w=PR.wait;PR.wait=null;if(w)w.res()}}
function serialWrite(s){return PR.writer.write(new TextEncoder().encode(s+'\n'))}
async function sendCmd(c){if(!PR.kind){alert('Connect to a printer first.');return}
 if(PR.kind==='serial'){while(PR.wait)await PR.wait.p;let res;const p=new Promise(r=>res=r);PR.wait={p:p,res:res};const to=setTimeout(()=>{if(PR.wait&&PR.wait.p===p){log('! no ok after 30s for '+c+', continuing');PR.wait=null;res()}},/^(G28|M109|M190|G29)/.test(c)?600000:30000);await serialWrite(c);await p;clearTimeout(to)}
 else await netGcode([c])}
G.sendCmd=sendCmd;
function hdr(){const h={};const k=$('apikey').value.trim();if(k)h['X-Api-Key']=k;return h}
function base(){let h=$('host').value.trim().replace(/\/+$/,'');if(h&&!/^https?:\/\//.test(h))h='http://'+h;return h}
async function api(path,opt){opt=opt||{};opt.headers=Object.assign(hdr(),opt.headers||{});const r=await fetch(base()+path,opt);if(!r.ok)throw new Error(r.status+' '+r.statusText);const t=await r.text();try{return JSON.parse(t)}catch(e){return t}}
const J=o=>({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});
async function netGcode(cmds){if(PR.kind==='octo')await api('/api/printer/command',J({commands:cmds}));else for(const c of cmds)await api('/printer/gcode/script?script='+encodeURIComponent(c),{method:'POST'});log('> '+cmds.join(' | '))}
async function netConnect(kind){if(!base())return alert('Enter your printer address, e.g. S3-L8f2215 (OctoPrint) or S4-Ld86c3d (Moonraker).');PR.kind=kind;
 try{if(kind==='octo'){const v=await api('/api/version');log('OctoPrint '+(v.server||'')+' connected')}else{const v=await api('/printer/info');log('Klipper '+((v.result||{}).state||'')+' connected')}status('Connected ('+(kind==='octo'?'OctoPrint':'Moonraker')+')');PR.poll=setInterval(netTemps,3000);netTemps()}
 catch(e){PR.kind=null;status('Failed');log('Connection failed: '+e.message+'\nCheck the address, API key and that CORS is allowed (OctoPrint: Settings → API → Allow CORS; Moonraker: cors_domains). Browsers block http printers from https pages, so use the downloaded version.')}}
async function netTemps(){try{if(PR.kind==='octo'){const s=await api('/api/printer');const t=s.temperature||{};$('temps').textContent='Nozzle '+(t.tool0?t.tool0.actual.toFixed(0)+'° / '+t.tool0.target+'°':'—')+'  Bed '+(t.bed?t.bed.actual.toFixed(0)+'° / '+t.bed.target+'°':'—');try{const j=await api('/api/job');if(j.progress&&j.progress.completion!=null){$('prog').value=j.progress.completion;$('progt').textContent=j.state+' '+j.progress.completion.toFixed(0)+'%'}}catch(e){}}
 else if(PR.kind==='moon'){const s=await api('/printer/objects/query?extruder&heater_bed&virtual_sdcard&print_stats');const o=s.result.status;$('temps').textContent='Nozzle '+o.extruder.temperature.toFixed(0)+'° / '+o.extruder.target+'°  Bed '+o.heater_bed.temperature.toFixed(0)+'° / '+o.heater_bed.target+'°';if(o.virtual_sdcard){$('prog').value=o.virtual_sdcard.progress*100;$('progt').textContent=(o.print_stats?o.print_stats.state+' ':'')+(o.virtual_sdcard.progress*100).toFixed(0)+'%'}}}catch(e){}}
$('connect').onclick=async()=>{try{const v=$('conn').value;localStorage.p3dHost=$('host').value;if(v==='serial')await serialConnect();else await netConnect(v)}catch(e){log('Connect error: '+e.message);status('Not connected')}};
$('disconnect').onclick=async()=>{PR.abort=true;clearInterval(PR.poll);if(PR.kind==='serial'){try{PR.reader&&await PR.reader.cancel()}catch(e){}try{PR.writer.releaseLock();await PR.port.close()}catch(e){}}PR.kind=null;PR.wait=null;status('Not connected');log('Disconnected')};
$('home').onclick=()=>sendCmd('G28');
document.querySelectorAll('[data-j]').forEach(b=>b.onclick=async()=>{const j=b.dataset.j,ax=j[0],d=(j.length>1?-1:1)*(+$('step').value);
 if(PR.kind==='octo'){const o={command:'jog'};o[ax.toLowerCase()]=d;await api('/api/printer/printhead',J(o)).catch(e=>log(e.message));log('> jog '+ax+d)}else{await sendCmd('G91');await sendCmd('G1 '+ax+d+' F'+(ax==='Z'?600:3000));await sendCmd('G90')}});
$('preheat').onclick=async()=>{await sendCmd('M104 S'+$('tn').value);await sendCmd('M140 S'+$('tb').value)};
$('cool').onclick=async()=>{await sendCmd('M104 S0');await sendCmd('M140 S0')};
$('send').onclick=()=>{const c=$('cmd').value.trim();if(c){log('> '+c);sendCmd(c.toUpperCase())}};$('cmd').onkeydown=e=>{if(e.key==='Enter')$('send').onclick()};
async function streamSerial(code){const lines=code.split('\n').map(l=>l.replace(/;.*/,'').trim()).filter(Boolean);PR.total=lines.length;PR.sent=0;PR.printing=true;PR.abort=false;PR.paused=false;G.state='printing';
 for(const l of lines){if(PR.abort)break;while(PR.paused&&!PR.abort)await new Promise(r=>setTimeout(r,200));if(PR.abort)break;await sendCmd(l);PR.sent++;if(PR.sent%20===0||PR.sent===PR.total){$('prog').value=PR.sent/PR.total*100;$('progt').textContent=PR.sent+'/'+PR.total}}
 PR.printing=false;G.state=PR.abort?'stopped':'done';log(PR.abort?'Print stopped.':'✅ Print job sent ('+PR.sent+' lines).')}
G.streamSerial=streamSerial;
$('pstart').onclick=async()=>{if(!PR.kind)return alert('Connect to a printer first.');if(!GC&&!slice())return;if(PR.printing)return alert('Already printing.');
 if(!confirm('Start printing now?\n\n• Bed is clear and clean\n• Correct filament loaded\n• Nozzle '+$('tn').value+'°C, bed '+$('tb').value+'°C\n• You will stay nearby while it prints\n\nPress OK to start.'))return;
 try{if(PR.kind==='serial'){streamSerial(GC)}else{const fd=new FormData();fd.append('file',new Blob([GC],{type:'text/plain'}),'coffeebreak-'+Date.now()+'.gcode');if(PR.kind==='octo'){fd.append('select','true');fd.append('print','true');await api('/api/files/local',{method:'POST',body:fd})}else{fd.append('print','true');await api('/server/files/upload',{method:'POST',body:fd})}log('✅ Uploaded and started on printer')}}catch(e){log('Start failed: '+e.message)}};
$('ppause').onclick=async()=>{if(PR.kind==='serial'){if(!PR.printing)return;PR.paused=!PR.paused;$('ppause').textContent=PR.paused?'⏯ Resume':'⏸ Pause';log(PR.paused?'Paused (sending held)':'Resumed')}else if(PR.kind==='octo'){await api('/api/job',J({command:'pause',action:'toggle'})).catch(e=>log(e.message));log('Pause/resume sent')}else if(PR.kind==='moon'){const s=await api('/printer/objects/query?print_stats').catch(()=>null);const p=s&&s.result.status.print_stats.state==='paused';await api(p?'/printer/print/resume':'/printer/print/pause',{method:'POST'}).catch(e=>log(e.message));log(p?'Resumed':'Paused')}};
$('pstop').onclick=async()=>{if(!PR.kind||!confirm('Stop the print? It cannot be resumed.'))return;if(PR.kind==='serial'){PR.abort=true;PR.paused=false;await new Promise(r=>setTimeout(r,300));for(const c of['M104 S0','M140 S0','M107','G91','G1 Z5 F600','G90','M84'])await sendCmd(c)}else if(PR.kind==='octo')await api('/api/job',J({command:'cancel'})).catch(e=>log(e.message));else await api('/printer/print/cancel',{method:'POST'}).catch(e=>log(e.message));log('Stop sent')};
async function estop(){PR.abort=true;PR.paused=false;try{if(PR.kind==='serial'){await serialWrite('M112');const w=PR.wait;PR.wait=null;if(w)w.res()}else if(PR.kind==='octo')await api('/api/printer/command',J({commands:['M112']}));else if(PR.kind==='moon')await api('/printer/emergency_stop',{method:'POST'});log('🛑 EMERGENCY STOP (M112) sent. Power-cycle or reset the printer before using it again.')}catch(e){log('E-stop failed: '+e.message+' — switch the printer off at the wall!')}}
$('estop').onclick=estop;G.estop=estop;
// restore
sel.value=localStorage.p3dPreset&&PRESETS[localStorage.p3dPreset]?localStorage.p3dPreset:Object.keys(PRESETS)[0];setPreset();if(localStorage.p3dHost)$('host').value=localStorage.p3dHost;if(localStorage.p3dConn){$('conn').value=localStorage.p3dConn;$('conn').onchange()}
make('keychain');ctl.target.set(0,0,5);ctl.update();
addEventListener('resize',resize);new ResizeObserver(resize).observe(view);resize();loop();
