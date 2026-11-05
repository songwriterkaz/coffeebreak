(function(){
const CB=CB3D,T=THREE,$=id=>document.getElementById(id);
const V=CB.initViewer($('view'));
// ---- size tables (AU), foot length in mm ----
const IN=25.4,half=(a,b)=>{const r=[];for(let s=a;s<=b+1e-9;s+=0.5)r.push(s);return r;};
const lenOf={m:s=>(s+23)/3*IN,w:s=>(s+22.5)/3*IN,kc:s=>(s+12)/3*IN,ky:s=>(s+25)/3*IN};
const widOf={m:0.385,w:0.375,k:0.40};
const TABS={Kids:half(5,13).map(s=>['C'+s,{L:lenOf.kc(s),g:'k',n:'Kids '+s}]).concat(half(1,6).map(s=>['Y'+s,{L:lenOf.ky(s),g:'k',n:'Youth '+s}])),
 Women:half(1,15).map(s=>[''+s,{L:lenOf.w(s),g:'w',n:'Women AU '+s}]),
 Men:half(1,15).map(s=>[''+s,{L:lenOf.m(s),g:'m',n:'Men AU '+s}])};
const PR=[['len','Foot length',140,340,1,250],['wid','Foot width (ball)',55,125,1,94],['cup','Heel cup depth',0,16,1,8],['t','Base thickness',2,8,0.5,4],['trim','Trim to shoe (mm all round)',0,8,0.5,1]];
const P={};let h='';PR.forEach(q=>{P[q[0]]=q[5];h+=`<div class="row"><label>${q[1]}</label><input type="range" data-k="${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"><span class="val" id="v_${q[0]}">${q[5]}</span></div>`;});
const dimKeys={len:1,wid:1};
// length and width go in the Custom box, the rest under Fit
let hd='',hf='';PR.forEach((q,i)=>{const row=h.split('</div>')[i]+'</div>';if(dimKeys[q[0]])hd+=row;else hf+=row;});
$('dimp').innerHTML=hd;$('params').innerHTML=hf;
const setP=(k,v)=>{v=Math.round(v*2)/2;P[k]=v;const i=document.querySelector(`input[data-k="${k}"]`);i.value=v;$('v_'+k).textContent=v;};
let sizeName='Women AU 8';
const grid=CB.sizeGrid($('sizes'),TABS,(o,l,tab)=>{sizeName=o.n;setP('len',o.L);setP('wid',o.L*widOf[o.g]);build();V.frame();},'Women','8');
setP('len',lenOf.w(8));setP('wid',lenOf.w(8)*widOf.w);
$('szgo').onclick=()=>{const sys=$('sys').value,g=$('gen').value,n=+$('szn').value;let L;
  if(sys==='EU')L=(n/1.5-1.5)*10;else{let au=n;if(sys==='US')au=g==='m'?n-1:g==='w'?n-1.5:n;L=g==='m'?lenOf.m(au):g==='w'?lenOf.w(au):lenOf.kc(au);}
  sizeName=sys+' '+n+(g==='m'?' men':g==='w'?' women':' kids');setP('len',L);setP('wid',L*widOf[g]);grid.clear();build();V.frame();};
// ---- feet ----
let feet='both';const fb={left:'fL',right:'fR',both:'fB'};
Object.keys(fb).forEach(k=>$(fb[k]).onclick=()=>{feet=k;Object.values(fb).forEach(id=>$(id).classList.remove('sel'));$(fb[k]).classList.add('sel');build();V.frame();});
// ---- demo limits ----
if(CB.DEMO){[...$('arch').options].forEach(o=>{if(o.value!=='medium')o.textContent+=' (full version)';});[...$('pat').options].forEach(o=>{if(o.value!=='none')o.textContent+=' (full version)';});}
// ---- geometry ----
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function outline(y,L,W){ // returns [centre x, half width] for right foot, medial side is -x
  const Wb=W/2,Wh=W*0.34;let w;const yh=0.16*L,yb=0.70*L;
  if(y<yh)w=Wh*Math.sqrt(Math.max(0,1-Math.pow((yh-y)/yh,2)));
  else if(y<yb)w=Wh+(Wb-Wh)*sm((y-yh)/(yb-yh));
  else w=Wb*Math.pow(Math.max(0,1-Math.pow((y-yb)/(L-yb),2)),0.55);
  const c=-0.10*W*sm((y-0.45*L)/(0.55*L))+0.03*W*sm(1-y/(0.5*L));return [c,w];}
const hash=(i,j)=>{const s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s);};
const shapeCache={};function inPoly(Q,x,y){let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function patAt(pat,x,y,s){const k=pat==='bean'?'circle':pat;if(!shapeCache[k])shapeCache[k]=CB.shapePts(k,0.7,40);const row=Math.floor(y/s),off=row%2?s/2:0,cu=Math.floor((x+off)/s);
  return inPoly(shapeCache[k],(x+off-(cu+0.5)*s)/s,(y-(row+0.5)*s)/s);}
function textMask(txt,L,W){if(!txt)return null;const sc=3,c=document.createElement('canvas');c.width=Math.ceil(W*sc);c.height=Math.ceil(L*sc);const x=c.getContext('2d');
  const fh=Math.min(W*0.42,L*0.5/(txt.length*0.62+0.3));x.translate(c.width/2,c.height*0.52);x.rotate(Math.PI/2);x.scale(-1,1); // mirrored so it reads from underneath
  x.font='bold '+(fh*sc)+'px "Trebuchet MS",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,0,0);const d=x.getImageData(0,0,c.width,c.height).data;
  return (px,py)=>{const i=Math.floor((px+W/2)*sc),j=Math.floor((L-py)*sc);if(i<0||j<0||i>=c.width||j>=c.height)return false;return d[(j*c.width+i)*4+3]>110;};}
function insole(p,side,o){ // side 1 right, -1 left
  const tr=p.trim,L=p.len-2*tr,W=p.wid-2*tr,cs=Math.max(1.2,L/230),nx=Math.ceil((W*0.75+12)/cs)*2,ny=Math.ceil(L/cs)+2,x0=-nx*cs/2,y0=-cs;
  const archH={low:4,medium(){},high:13}[o.arch];const ah=o.arch==='low'?4:o.arch==='high'?13:8.5;
  const M=new Uint8Array(nx*ny),inside=(i,j)=>{const x=x0+(i+0.5)*cs,y=y0+(j+0.5)*cs;if(y<0||y>L)return 0;const [c,w]=outline(y,L,W);return Math.abs(x-c)<w?1:0;};
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){let m=inside(i,j);
    if(m&&o.pat==='vent'){const x=x0+(i+0.5)*cs,y=y0+(j+0.5)*cs,[c,w]=outline(y,L,W);if(y>0.62*L&&y<0.9*L&&w-Math.abs(x-c)>9){const s=9,r=Math.floor(y/s),off=r%2?s/2:0,u=((x+off)%s+s)%s-s/2,v=(y%s)-s/2;if(u*u+v*v<2.2*2.2)m=0;}}
    M[i*ny+j]=m;}
  // remove diagonal-only contacts (keeps the mesh manifold)
  const g=(i,j)=>i<0||j<0||i>=nx||j>=ny?0:M[i*ny+j];
  for(let pass=0;pass<4;pass++){let ch=0;for(let i=0;i<nx-1;i++)for(let j=0;j<ny-1;j++){const a=g(i,j),b=g(i+1,j),c=g(i,j+1),d=g(i+1,j+1);
    if(a&&d&&!b&&!c){M[(i+1)*ny+j]=1;M[i*ny+j+1]=1;ch++;}else if(b&&c&&!a&&!d){M[i*ny+j]=1;M[(i+1)*ny+j+1]=1;ch++;}}if(!ch)break;}
  const tm=textMask(o.txt,L,W);
  // node heights
  const NX=nx+1,NY=ny+1,top=new Float32Array(NX*NY),bot=new Float32Array(NX*NY);
  for(let i=0;i<NX;i++)for(let j=0;j<NY;j++){const xr=x0+i*cs,y=y0+j*cs,yc=Math.min(Math.max(y,0.5),L-0.5),[c,w]=outline(yc,L,W);
    const dx=(xr-c)*side*(-1)<0?0:0;const xm=(xr-c); // xm<0 is medial for right foot
    const med=-xm*1,d=Math.max(0,w-Math.abs(xm));
    let z=p.t;
    // heel cup rim, fades out after the heel
    const heelF=1-sm((y-0.22*L)/(0.2*L));z+=p.cup*heelF*Math.pow(Math.max(0,1-d/14),2);
    // medial arch
    const ay=Math.exp(-Math.pow((y-0.42*L)/(0.13*L),2)),ax=sm((med+0.15*W)/(0.55*W));z+=ah*ay*ax*Math.min(1,d/6+0.3);
    // lateral support lip along the outside of the midfoot
    z+=2*Math.exp(-Math.pow((y-0.42*L)/(0.14*L),2))*Math.pow(Math.max(0,1-d/8),2)*(xm>0?1:0);
    // metatarsal pad just behind the ball
    if(o.met>0){const my=0.64*L,mr=o.met>1?0.075*L:0.055*L,rr=Math.hypot((y-my)/1.4,xm+0.05*W);z+=(o.met>1?4:2.5)*Math.max(0,1-Math.pow(rr/mr,2));}
    // gentle toe taper
    z-=Math.min(p.t*0.35,1.2)*sm((y-0.78*L)/(0.2*L));
    // raised pattern on the top
    if(o.pat!=='none'&&o.pat!=='vent'&&d>6&&y>0.3*L&&y<0.93*L&&patAt(o.pat,xr,y,o.pat==='bean'?8:11))z+=0.8;
    let b=0;if(tm&&d>4&&tm(xr*side,y))b=0.6; // name engraved underneath (mirrored per foot)
    top[i*NY+j]=Math.max(z,b+1.2);bot[i*NY+j]=b;}
  const X=i=>side*(x0+i*cs),Y=j=>y0+j*cs;
  const vt=(i,j)=>[X(i),Y(j),top[i*NY+j]],vb=(i,j)=>[X(i),Y(j),bot[i*NY+j]];
  const pos=[];const quad=(a,b,c,d)=>{if(side<0){pos.push(...a,...c,...b,...a,...d,...c);}else pos.push(...a,...b,...c,...a,...c,...d);};
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){if(!M[i*ny+j])continue;
    quad(vt(i,j),vt(i+1,j),vt(i+1,j+1),vt(i,j+1));quad(vb(i,j),vb(i,j+1),vb(i+1,j+1),vb(i+1,j));
    if(!g(i-1,j))quad(vb(i,j),vt(i,j),vt(i,j+1),vb(i,j+1));
    if(!g(i+1,j))quad(vb(i+1,j),vb(i+1,j+1),vt(i+1,j+1),vt(i+1,j));
    if(!g(i,j-1))quad(vb(i,j),vb(i+1,j),vt(i+1,j),vt(i,j));
    if(!g(i,j+1))quad(vb(i,j+1),vt(i,j+1),vt(i+1,j+1),vb(i+1,j+1));}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(pos),3));geo.computeVertexNormals();return geo;}
let parts=[];
function opts(){return {arch:$('arch').value,met:+$('met').value,pat:$('pat').value,txt:$('txt').value.trim().toUpperCase()};}
function build(){CB.clear(V.root);parts=[];const o=opts(),list=feet==='both'?[-1,1]:[feet==='left'?-1:1];
  list.forEach(s=>{const m=CB.mesh(insole(P,s,o),parseInt($('col').value.slice(1),16));m.position.x=list.length>1?s*(P.wid*0.62+6):0;m.userData.side=s;V.root.add(m);parts.push(m);});
  $('sizeInfo').textContent=sizeName+': foot '+P.len.toFixed(0)+' mm long, '+P.wid.toFixed(0)+' mm wide.';
  $('info').textContent='Insole '+(P.len-2*P.trim).toFixed(0)+' x '+(P.wid-2*P.trim).toFixed(0)+' mm, '+o.arch+' arch, heel cup '+P.cup+' mm. '+(feet==='both'?'Saves a left and a right STL.':'Saves the '+feet+' insole.');
  $('dims').textContent=CB.dims(V.root);}
function exportAll(){const out=[];parts.forEach(m=>{const gr=new T.Group();gr.add(new T.Mesh(m.geometry));
  out.push(CB.exportSTL(gr,'coffeebreak-insole-'+sizeName.toLowerCase().replace(/[^a-z0-9.]+/g,'-')+'-'+(m.userData.side<0?'left':'right')+'.stl'));});return out;}
$('dimp').querySelectorAll('input').forEach(i=>i.oninput=()=>{P[i.dataset.k]=parseFloat(i.value);$('v_'+i.dataset.k).textContent=i.value;sizeName='Custom';grid.clear();clearTimeout(window._bt);window._bt=setTimeout(build,150);});
$('params').querySelectorAll('input').forEach(i=>i.oninput=()=>{P[i.dataset.k]=parseFloat(i.value);$('v_'+i.dataset.k).textContent=i.value;clearTimeout(window._bt);window._bt=setTimeout(build,150);});
$('arch').onchange=()=>{if($('arch').value!=='medium'&&CB.locked('Low and high arches'))$('arch').value='medium';build();};
$('pat').onchange=()=>{if($('pat').value!=='none'&&CB.locked('Patterns'))$('pat').value='none';build();};
['met','col'].forEach(id=>$(id).onchange=build);$('txt').oninput=()=>{clearTimeout(window._bt);window._bt=setTimeout(build,300);};
$('exp').onclick=exportAll;
window.APP={scenarios:()=>['w8-both-medium','m11-both-high-hearts','kidsC10-left-low-vent','m15-right-beans','w4-both-medium-trim'],
 scenario:s=>{const pick=(tab,lab)=>{const it=TABS[tab].find(b=>b[0]===lab);sizeName=it[1].n;setP('len',it[1].L);setP('wid',it[1].L*widOf[it[1].g]);grid.set(tab,lab);};
  if(s.startsWith('w8'))pick('Women','8');else if(s.startsWith('m11'))pick('Men','11');else if(s.startsWith('kids'))pick('Kids','C10');else if(s.startsWith('m15'))pick('Men','15');else pick('Women','4');
  feet=s.includes('both')?'both':s.includes('left')?'left':'right';$(fb[feet]).click();
  if(!CB.DEMO){$('arch').value=s.includes('high')?'high':s.includes('low')?'low':'medium';$('pat').value=s.includes('hearts')?'heart':s.includes('vent')?'vent':s.includes('beans')?'bean':'none';}
  setP('trim',s.includes('trim')?4:1);build();V.frame();},
 exportAll:exportAll};
build();V.frame();
})();
