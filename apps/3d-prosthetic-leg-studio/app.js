(function(){
const CB=CB3D,T=THREE,$=id=>document.getElementById(id);
const V=CB.initViewer($('view'));const f0=V.frame;V.frame=()=>{f0();const t=V.controls.target,c=V.camera.position;c.y=t.y+(t.y-c.y);V.controls.update();};
const PR=[['len','Cover length',150,450,5,320],['calf','Calf around (widest)',220,480,5,340],['ankle','Ankle width',45,100,1,62],['knee','Knee width',70,140,1,100],['pylon','Pylon diameter',22,40,1,30],['wall','Wall thickness',2,4,0.2,2.6],['ps','Pattern size',12,50,1,26],['sec','Sections (to fit printer)',1,3,1,1]];
const P={};let h='';PR.forEach(q=>{P[q[0]]=q[5];h+=`<div class="row"><label>${q[1]}</label><input type="range" data-k="${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"><span class="val" id="v_${q[0]}">${q[5]}</span></div>`;});
$('params').innerHTML=h;
const PRE={Small:{len:240,calf:270,ankle:52,knee:82},Medium:{len:320,calf:340,ankle:62,knee:100},Large:{len:380,calf:390,ankle:70,knee:112},XL:{len:430,calf:450,ankle:80,knee:126}};
const setK=(k,v)=>{P[k]=v;const i=document.querySelector(`#params input[data-k="${k}"]`);i.value=v;$('v_'+k).textContent=v;};
const pgrid=CB.sizeGrid($('psz'),{Sizes:Object.keys(PRE).map(n=>[n,PRE[n]])},o=>{Object.keys(o).forEach(k=>setK(k,o[k]));build();V.frame();},'Sizes','Medium');
const demoPat={lattice:1,heart:1,none:1};
if(CB.DEMO){[...$('pat').options].forEach(o=>{if(!demoPat[o.value])o.textContent+=' (full version)';});$('pat').value='lattice';$('txt').value='';$('txt').disabled=true;$('txt').placeholder='Full version';}
// ---------- shape model ----------
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function radius(z,th,p,side){const L=p.len,ra=p.ankle/2,rk=p.knee/2,rc=Math.max(p.calf/(2*Math.PI),ra+2),zc=0.62*L;
  let r=z<zc?ra+(rc-ra)*smooth(z/zc):rc+(rk-rc)*smooth((z-zc)/(L-zc));
  const ell=1-0.07*Math.pow(Math.sin(th),2); // a little flatter front to back
  const hump=Math.exp(-Math.pow((z-zc)/(0.25*L),2)),tb=-Math.PI/2+side*0.35; let d=Math.atan2(Math.sin(th-tb),Math.cos(th-tb));
  return r*ell+0.10*rc*hump*Math.exp(-d*d/0.5);}
// ---------- pattern mask ----------
const hash=(i,j)=>{const s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s);};
const shapeCache={};function inPoly(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function patHole(pat,u,v,s){
  if(pat==='lattice'){const a=((u+v)/s%1+1)%1,b=((u-v)/s%1+1)%1;return Math.min(a,1-a)>0.13&&Math.min(b,1-b)>0.13;}
  if(pat==='voronoi'){const ci=Math.floor(u/s),cj=Math.floor(v/s);let d1=1e9,d2=1e9;for(let i=ci-1;i<=ci+1;i++)for(let j=cj-1;j<=cj+1;j++){const px=(i+0.15+0.7*hash(i,j))*s,py=(j+0.15+0.7*hash(j+7,i+3))*s,d=Math.hypot(u-px,v-py);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return d2-d1>0.22*s;}
  const k=pat;if(!shapeCache[k])shapeCache[k]=CB.shapePts(k,0.72,48);const row=Math.floor(v/s),off=row%2?s/2:0,cu=Math.floor((u+off)/s);
  const lx=(u+off-(cu+0.5)*s)/s,ly=(v-(row+0.5)*s)/s;return inPoly(shapeCache[k],lx,ly);}
function textMask(txt,U,L){if(!txt)return null;const sc=2,c=document.createElement('canvas');c.width=Math.ceil(U*sc);c.height=Math.ceil(L*sc);const x=c.getContext('2d');
  const fh=Math.min(U*0.32,L/(txt.length*0.75+0.5),40);x.translate(c.width/2,c.height/2);x.rotate(-Math.PI/2);x.font='bold '+(fh*sc)+'px "Trebuchet MS",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,0,0);
  const box={u0:U/2-fh*0.75,u1:U/2+fh*0.75,v0:L/2-txt.length*fh*0.4-6,v1:L/2+txt.length*fh*0.4+6};
  const d=x.getImageData(0,0,c.width,c.height).data;return {box:box,at:(u,v)=>{const px=Math.floor(u*sc),py=Math.floor((L-v)*sc);if(px<0||py<0||px>=c.width||py>=c.height)return 0;return d[(py*c.width+px)*4+3]>110;}};}
// ---------- cell-grid shell builder (watertight heightfield on a cylinder) ----------
function half(p,side,front,z0,z1,txt,pat,style){
  const rc=p.calf/(2*Math.PI),cs=1.6,nu=Math.min(220,Math.ceil(Math.PI*rc/cs)),nv=Math.min(320,Math.ceil((z1-z0)/cs));
  const th0=front?0:Math.PI,U=Math.PI*rc,L=p.len,t=p.wall,raise=1.4;
  const tm=front?textMask(txt,U,L):null,H=new Float32Array(nu*nv);
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const u=(i+0.5)/nu*U,v=z0+(j+0.5)/nv*(z1-z0);let h=t;
    const edgeU=Math.min(u,U-u),edgeV=Math.min(v-z0,z1-v,v,L-v);
    const slot=edgeU>4&&edgeU<8&&[0.22,0.5,0.78].some(f=>Math.abs(v-f*L)<11);
    const border=edgeU<14||edgeV<12;
    if(tm&&u>tm.box.u0&&u<tm.box.u1&&v>tm.box.v0&&v<tm.box.v1){h=tm.at(u,v)?(style==='raise'?t+raise:0):t; if(style!=='raise'&&!tm.at(u,v))h=t;}
    else if(pat!=='none'&&!border&&patHole(pat,u,v,p.ps))h=style==='raise'?t+raise:0;
    if(slot)h=0;H[i*nv+j]=h;}
  if(tm&&style!=='raise'){} // stencil text: islands possible, keep letters bold
  const node=(i,j,off)=>{const th=th0+i/nu*Math.PI,z=z0+j/nv*(z1-z0),r=radius(z,th,p,side)-t+off;return [r*Math.cos(th),r*Math.sin(th),z-z0];};
  const pos=[];const quad=(a,b,c,d)=>{pos.push(...a,...b,...c,...a,...c,...d);};
  const hAt=(i,j)=>i<0||j<0||i>=nu||j>=nv?0:H[i*nv+j];
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const h=H[i*nv+j];if(!h)continue;
    quad(node(i,j,h),node(i+1,j,h),node(i+1,j+1,h),node(i,j+1,h)); // outer
    quad(node(i,j,0),node(i,j+1,0),node(i+1,j+1,0),node(i+1,j,0)); // inner
    let n=hAt(i-1,j);if(n<h)quad(node(i,j,n),node(i,j,h),node(i,j+1,h),node(i,j+1,n));
    n=hAt(i+1,j);if(n<h)quad(node(i+1,j,n),node(i+1,j+1,n),node(i+1,j+1,h),node(i+1,j,h));
    n=hAt(i,j-1);if(n<h)quad(node(i,j,n),node(i+1,j,n),node(i+1,j,h),node(i,j,h));
    n=hAt(i,j+1);if(n<h)quad(node(i,j+1,n),node(i,j+1,h),node(i+1,j+1,h),node(i+1,j+1,n));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(pos),3));g.computeVertexNormals();return g;}
let parts={front:[],back:[]};
function build(){const side=+$('side_').value,pat=$('pat').value,style=$('pstyle').value,txt=$('txt').value.trim().toUpperCase();
  const minR=Math.min(P.ankle,P.knee)/2-P.wall;let warn='';if(minR<P.pylon/2+3)warn='The cover is very tight around the '+P.pylon+' mm pylon. Increase ankle or knee width. ';
  CB.clear(V.root);parts={front:[],back:[]};const n=P.sec,ex=+$('explode').value;
  for(let s=0;s<n;s++){const z0=P.len*s/n,z1=P.len*(s+1)/n;
    ['front','back'].forEach(k=>{const g=half(P,side,k==='front',z0,z1,s===Math.floor((n-1)/2)?txt:'',pat,style);
      // name text is only placed on the middle section to keep letters whole
      const m=CB.mesh(g,parseInt($(k==='front'?'col':'col2').value.slice(1),16));m.position.z=z0+(ex?s*25:0);m.position.y=ex?(k==='front'?30:-30):0;m.userData.z0=z0;V.root.add(m);parts[k].push(m);});}
  $('info').textContent=warn+'Cover '+P.len+' mm tall, widest '+(P.calf/Math.PI).toFixed(0)+' mm across. '+(n>1?n+' sections per half. ':'')+'Inner clearance at the narrowest point about '+(minR*2).toFixed(0)+' mm.';
  $('dims').textContent=CB.dims(V.root);}
function expPart(k){const out=[];parts[k].forEach((m,i)=>{const g=new T.Group();const c=new T.Mesh(m.geometry);g.add(c);if(+$('side_').value<0){}out.push(CB.exportSTL(g,'coffeebreak-leg-cover-'+($('side_').value>0?'right':'left')+'-'+k+(parts[k].length>1?'-part'+(i+1):'')+'.stl'));});return out;}
$('params').querySelectorAll('input').forEach(i=>i.onchange=i.oninput=()=>{P[i.dataset.k]=parseFloat(i.value);$('v_'+i.dataset.k).textContent=i.value;clearTimeout(window._bt);window._bt=setTimeout(build,120);});
$('pat').onchange=()=>{if(!demoPat[$('pat').value]&&CB.locked('This pattern'))$('pat').value='lattice';build();};
['side_','pstyle','explode','col','col2'].forEach(id=>$(id).onchange=build);$('txt').oninput=()=>{clearTimeout(window._bt);window._bt=setTimeout(build,300);};
$('expF').onclick=()=>expPart('front');$('expB').onclick=()=>expPart('back');
window.APP={scenarios:()=>['voronoi-right','hearts-left-raised','lattice-2sections','smooth'],
  scenario:s=>{const set=(id,v)=>{$(id).value=v;};set('pat',s.startsWith('voronoi')?'voronoi':s.startsWith('hearts')?'heart':s.startsWith('lattice')?'lattice':'none');set('side_',s.includes('left')?'-1':'1');set('pstyle',s.includes('raised')?'raise':'cut');
   P.sec=s.includes('2sections')?2:1;build();V.frame();},
  exportAll:()=>expPart('front').concat(expPart('back'))};
build();V.frame();
})();
