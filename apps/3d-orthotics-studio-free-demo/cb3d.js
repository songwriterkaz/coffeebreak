/* Coffeebreak 3D core - shared helpers (Z-up, millimetres) */
(function(){
const T=THREE, CB={};
CB.DEMO=!!window.CB_DEMO;
CB.font=new T.Font(window.CB_FONT);
/* ---------- viewer ---------- */
CB.initViewer=function(el){
  const r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));el.appendChild(r.domElement);
  const s=new T.Scene();s.background=new T.Color(0x1a0820);
  const c=new T.PerspectiveCamera(45,1,0.5,5000);c.up.set(0,0,1);c.position.set(90,-140,110);
  const ctl=new T.OrbitControls(c,r.domElement);ctl.target.set(0,0,10);ctl.update();
  s.add(new T.HemisphereLight(0xffe0f0,0x402040,0.9));
  const d=new T.DirectionalLight(0xffffff,0.8);d.position.set(80,-60,200);s.add(d);
  const d2=new T.DirectionalLight(0xff99cc,0.35);d2.position.set(-120,100,60);s.add(d2);
  const g=new T.GridHelper(200,20,0xff66b3,0x5a2a60);g.rotation.x=Math.PI/2;s.add(g);
  const root=new T.Group();s.add(root);
  function size(){const w=el.clientWidth||300,h=el.clientHeight||300;r.setSize(w,h,false);r.domElement.style.width='100%';r.domElement.style.height='100%';c.aspect=w/h;c.updateProjectionMatrix();}
  window.addEventListener('resize',size);size();
  (function loop(){requestAnimationFrame(loop);ctl.update();r.render(s,c);})();
  const V={renderer:r,scene:s,camera:c,controls:ctl,root:root,grid:g,resize:size};
  V.frame=function(){const b=new T.Box3().setFromObject(root);if(b.isEmpty())return;const ctr=b.getCenter(new T.Vector3()),sz=b.getSize(new T.Vector3()).length()||50;
    ctl.target.copy(ctr);c.position.set(ctr.x+sz*0.7,ctr.y-sz*1.1,ctr.z+sz*0.9);ctl.update();};
  return V;
};
CB.mat=function(col){return new T.MeshStandardMaterial({color:col||0xff6fb5,roughness:0.45,metalness:0.1});};
CB.clear=function(g){while(g.children.length){const o=g.children.pop();o.traverse(x=>{if(x.geometry)x.geometry.dispose();});}};
/* ---------- 2D shapes (centred, mm) ---------- */
function polyShape(pts){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;}
function polyPath(pts){const s=new T.Path();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();return s;}
CB.shapePts=function(kind,size,n){ // returns closed point list (CCW), size = overall width
  const R=size/2,P=[];n=n||64;
  if(kind==='circle'){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([R*Math.cos(a),R*Math.sin(a)]);}}
  else if(kind==='square'){const r=R*0.18;for(let q=0;q<4;q++){const cx=(q==0||q==3?1:-1)*(R-r),cy=(q<2?1:-1)*(R-r);for(let i=0;i<=6;i++){const a=q*Math.PI/2+i/6*Math.PI/2;P.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}}}
  else if(kind==='star'){for(let i=0;i<10;i++){const a=Math.PI/2+i/10*Math.PI*2,rr=i%2?R*0.45:R;P.push([rr*Math.cos(a),rr*Math.sin(a)]);}}
  else if(kind==='heart'){for(let i=0;i<n;i++){const t=i/n*Math.PI*2;const x=16*Math.pow(Math.sin(t),3),y=13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t);P.push([x/32*size,(y+2.5)/32*size]);}}
  else if(kind==='flower'){for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=R*(0.62+0.38*Math.abs(Math.cos(2.5*a)));P.push([rr*Math.cos(a),rr*Math.sin(a)]);}}
  else if(kind==='bean'){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([R*0.68*Math.cos(a),R*Math.sin(a)]);}}
  else if(kind==='hexagon'){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.push([R*Math.cos(a),R*Math.sin(a)]);}}
  else if(kind==='cup'){ // coffee cup silhouette (logo-inspired)
    P.push([-R*0.6,R*0.55],[R*0.45,R*0.55],[R*0.42,R*0.25]);for(let i=0;i<=10;i++){const a=Math.PI/2-i/10*Math.PI;P.push([R*0.48+R*0.32*Math.cos(a),R*0.05+R*0.25*Math.sin(a)]);}
    P.push([R*0.36,-R*0.25],[R*0.2,-R*0.6],[-R*0.4,-R*0.6]);}
  else return CB.shapePts('circle',size,n);
  return P;
};
CB.beanGroove=function(size){const R=size/2,L=[],Rt=[];for(let i=0;i<=12;i++){const t=-0.8+1.6*i/12,y=t*R,x=Math.sin(t*2.2)*R*0.15,w=R*0.06*(1-Math.abs(t)/1.1);L.push([x-w,y]);Rt.unshift([x+w,y]);}return L.concat(Rt);};
CB.shape=function(kind,size){const s=polyShape(CB.shapePts(kind,size));if(kind==='bean')s.holes.push(polyPath(CB.beanGroove(size)));return s;};
CB.polyShape=polyShape;CB.polyPath=polyPath;
CB.move=function(pts,dx,dy,rot,sc){const c=Math.cos(rot||0),s=Math.sin(rot||0);sc=sc||1;return pts.map(p=>[dx+sc*(p[0]*c-p[1]*s),dy+sc*(p[0]*s+p[1]*c)]);};
CB.circlePts=function(cx,cy,r,n){n=n||32;const P=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return P;};
/* ---------- solids ---------- */
CB.extrude=function(shapes,h,z0){const g=new T.ExtrudeGeometry(shapes,{depth:h,bevelEnabled:false,curveSegments:16});if(z0)g.translate(0,0,z0);return g;};
CB.textShapes=function(txt,size){return CB.font.generateShapes(txt||' ',size);};
CB.textGeo=function(txt,size,h,z0,cx,cy){const sh=CB.textShapes(txt,size);const g=CB.extrude(sh,h,z0||0);g.computeBoundingBox();const b=g.boundingBox;g.translate((cx||0)-(b.min.x+b.max.x)/2,(cy||0)-(b.min.y+b.max.y)/2,0);return g;};
CB.stadium=function(x0,y0,x1,y1,w){const r=w/2,a=Math.atan2(y1-y0,x1-x0),P=[];for(let i=0;i<=8;i++){const t=a-Math.PI/2-i/8*Math.PI;P.push([x0+r*Math.cos(t),y0+r*Math.sin(t)]);}for(let i=0;i<=8;i++){const t=a+Math.PI/2-i/8*Math.PI;P.push([x1+r*Math.cos(t),y1+r*Math.sin(t)]);}return P;};
CB.strokeGeos=function(pts,w,h,z0){const out=[];if(!pts.length)return out;let q=[pts[0]];for(const p of pts){const l=q[q.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>=Math.max(0.6,w*0.35))q.push(p);}
  if(q.length===1)q.push([q[0][0]+0.01,q[0][1]]);
  for(let i=0;i<q.length-1;i++)out.push(CB.extrude(polyShape(CB.stadium(q[i][0],q[i][1],q[i+1][0],q[i+1][1],w)),h,z0));return out;};
CB.merge=function(geos){let n=0;const arr=geos.map(g=>{const ng=g.index?g.toNonIndexed():g;n+=ng.attributes.position.count;return ng;});const pos=new Float32Array(n*3);let o=0;arr.forEach(g=>{pos.set(g.attributes.position.array,o);o+=g.attributes.position.array.length;});const m=new T.BufferGeometry();m.setAttribute('position',new T.BufferAttribute(pos,3));m.computeVertexNormals();return m;};
CB.mesh=function(geo,col){return new T.Mesh(geo,CB.mat(col));};
/* ---------- export ---------- */
CB.exportCount=0;
CB.stlBytes=function(obj){obj.updateMatrixWorld(true);const ex=new T.STLExporter();const dv=ex.parse(obj,{binary:true});return dv;};
CB.download=function(data,name){const b=new Blob([data],{type:'model/stl'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);};
CB.exportSTL=function(obj,name){
  if(CB.DEMO&&CB.exportCount>=3){CB.toast('The free demo saves 3 STL files per visit. Get the full version on itch.io for unlimited saves');return null;}
  const dv=CB.stlBytes(obj);CB.exportCount++;window.CB_LAST_STL=dv;CB.download(dv,name);
  const tris=dv.getUint32(80,true);CB.toast('Saved '+name+' ('+tris+' triangles)');return dv;};
CB.toast=function(msg){let t=document.getElementById('cbtoast');if(!t){t=document.createElement('div');t.id='cbtoast';document.body.appendChild(t);}t.textContent=msg;t.className='show';clearTimeout(t._h);t._h=setTimeout(()=>t.className='',3500);};
CB.locked=function(feature){if(!CB.DEMO)return false;CB.toast(feature+' is in the full version on itch.io');return true;};
CB.dims=function(obj){const b=new T.Box3().setFromObject(obj);if(b.isEmpty())return '';const s=b.getSize(new T.Vector3());return s.x.toFixed(1)+' x '+s.y.toFixed(1)+' x '+s.z.toFixed(1)+' mm';};

// Easy size picker: tabs of big tap buttons. tabs={Tab:[[label,value],...]}
CB.sizeGrid=function(el,tabs,onPick,startTab,startLabel){const names=Object.keys(tabs);let cur=startTab||names[0],sel=startLabel;
  function draw(){el.innerHTML='<div class="sztabs">'+names.map(n=>`<button class="sztab${n===cur?' sel':''}" data-t="${n}">${n}</button>`).join('')+'</div><div class="szgrid">'+tabs[cur].map((b,i)=>`<button class="szb${b[0]===sel?' sel':''}" data-i="${i}">${b[0]}</button>`).join('')+'</div>';
    el.querySelectorAll('.sztab').forEach(b=>b.onclick=()=>{cur=b.dataset.t;draw();});
    el.querySelectorAll('.szb').forEach(b=>b.onclick=()=>{const it=tabs[cur][+b.dataset.i];sel=it[0];draw();onPick(it[1],it[0],cur);});}
  draw();return {set:(t,l)=>{cur=t;sel=l;draw();},clear:()=>{sel=null;draw();}};};
window.CB3D=CB;
})();
