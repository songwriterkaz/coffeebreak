(function(){
const CB=CB3D,T=THREE,$=id=>document.getElementById(id);
const V=CB.initViewer($('view'));
const ann=(ro,ri,n)=>{const s=CB.polyShape(CB.circlePts(0,0,ro,n||96));s.holes.push(CB.polyPath(CB.circlePts(0,0,ri,n||96).reverse()));return s;};
const shp=(k,size,x,y,rot)=>{const s=CB.polyShape(CB.move(CB.shapePts(k,size),x||0,y||0,rot||0));if(k==='bean')s.holes.push(CB.polyPath(CB.move(CB.beanGroove(size),x||0,y||0,rot||0)));return s;};
function inside(P,x,y){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function patternHoles(outline,pat,cell,shrink){ // small pattern cut-outs fully inside an inset outline
  if(pat==='none')return [];const H=[];const xs=outline.map(p=>p[0]),ys=outline.map(p=>p[1]);const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
  const inner=outline.map(p=>[cx+(p[0]-cx)*shrink,cy+(p[1]-cy)*shrink]);
  for(let y=Math.min(...ys);y<=Math.max(...ys);y+=cell)for(let x=Math.min(...xs)+((Math.round((y-Math.min(...ys))/cell))%2?cell/2:0);x<=Math.max(...xs);x+=cell){
    const pts=CB.move(CB.shapePts(pat==='bean'?'circle':pat,cell*0.6,24),x,y);if(pts.every(p=>inside(inner,p[0],p[1])))H.push(pts);}
  return H;}
const ringD=s=>11.63+0.8128*s; // US ring size -> inner diameter mm
const ITEMS={
 ring:{name:'💍 Ring (by size)',p:[['size','US ring size (tap a size above)',3,13,0.5,7],['w','Band width',2,10,0.5,4],['t','Band thickness',1.4,3,0.1,1.8],['top','Topper size',0,16,1,9]],
  build(p,pat){const ri=ringD(p.size)/2,ro=ri+p.t,G=[CB.extrude(ann(ro,ri,128),p.w)];
   if(p.top>0&&pat!=='none'){const k=pat==='circle'?'circle':pat;G.push(CB.extrude(shp(k,p.top,0,ro+p.top*0.32),p.w));}
   return {g:G,info:'Inner diameter '+(ri*2).toFixed(1)+' mm (US '+p.size+'). Prints lying flat.'};}},
 pendant:{name:'💖 Pendant',p:[['s','Size',15,50,1,32],['t','Thickness',1.5,5,0.5,2.5]],shape:1,text:1,
  build(p,pat,o){const O=CB.shapePts(o.shape,p.s,96);const sh=CB.polyShape(O);if(o.txt)pat='none';patternHoles(O,pat,p.s/5,0.72).forEach(h=>sh.holes.push(CB.polyPath(h)));
   const ys=O.map(q=>q[1]),top=Math.max(...ys);const G=[CB.extrude(sh,p.t),CB.extrude(ann(3.2,1.6,32),p.t)];G[1].translate(0,top+1.8,0);
   if(o.txt)G.push(CB.textGeo(o.txt,p.s/(2+o.txt.length*0.45),p.t+1,0,0,0));return {g:G,info:'Hanging loop has a 3.2 mm hole for a chain or jump ring.'};}},
 earrings:{name:'✨ Earrings (pair)',p:[['s','Size',8,30,1,16],['t','Thickness',1.2,3,0.2,1.8]],shape:1,
  build(p,pat,o){const G=[];[-1,1].forEach(side=>{const O=CB.move(CB.shapePts(o.shape,p.s,64),side*(p.s*0.75+3),0);const sh=CB.polyShape(O);patternHoles(O,pat,p.s/3.2,0.7).forEach(h=>sh.holes.push(CB.polyPath(h)));G.push(CB.extrude(sh,p.t));
   const top=Math.max(...O.map(q=>q[1])),r=CB.extrude(ann(2.2,1,24),p.t);r.translate(side*(p.s*0.75+3),top+1.2,0);G.push(r);});return {g:G,info:'Add standard earring hooks through the 2 mm loops.'};}},
 bangle:{name:'⭕ Bangle',p:[['d','Inner diameter',50,80,1,64],['w','Width',5,25,1,10],['t','Thickness',2,5,0.5,3],['n','Decorations',0,16,1,8]],
  build(p,pat){const ri=p.d/2,ro=ri+p.t,G=[CB.extrude(ann(ro,ri,160),p.w)];if(pat!=='none')for(let i=0;i<p.n;i++){const a=i/p.n*Math.PI*2,s=Math.min(p.w,10)+2;G.push(CB.extrude(shp(pat,s,Math.cos(a)*(ro+s*0.25),Math.sin(a)*(ro+s*0.25),a-Math.PI/2),p.w));}
   return {g:G,info:'Measure around your knuckles to choose the inner diameter.'};}},
 button:{name:'🔘 Buttons',p:[['d','Diameter',10,40,1,20],['t','Thickness',2,5,0.5,3],['holes','Holes (2 or 4)',2,4,2,4],['n','How many',1,12,1,4]],shape:1,
  build(p,pat,o){const G=[];const per=Math.ceil(Math.sqrt(p.n));for(let i=0;i<p.n;i++){const x=(i%per)*(p.d+4),y=Math.floor(i/per)*(p.d+4);const sh=CB.polyShape(CB.move(CB.shapePts(o.shape,p.d,64),x,y));const hs=p.d*0.13;
   for(let h=0;h<p.holes;h++){const a=h/p.holes*Math.PI*2+Math.PI/4;sh.holes.push(CB.polyPath(CB.circlePts(x+Math.cos(a)*hs,y+Math.sin(a)*hs,Math.max(0.9,p.d*0.045),20)));}G.push(CB.extrude(sh,p.t));
   const rim=CB.polyShape(CB.move(CB.shapePts(o.shape,p.d,64),x,y));rim.holes.push(CB.polyPath(CB.move(CB.shapePts(o.shape,p.d*0.8,64),x,y)));G.push(CB.extrude(rim,0.8,p.t-0.01));}
   return {g:G,info:'Thread holes are '+(Math.max(0.9,p.d*0.045)*2).toFixed(1)+' mm wide.'};}},
 buckle:{name:'🔲 Belt buckle',p:[['b','Strap width',15,50,1,35],['t','Thickness',3,6,0.5,4],['f','Frame width',4,10,0.5,6]],
  build(p,pat){const W=p.b+2*p.f+4,H=p.b+2*p.f+2,G=[];const sh=CB.polyShape(CB.shapePts('square',1).map(q=>[q[0]*W*1.2,q[1]*H]));const gw=(W*1.2-3*p.f)/2,gh=H-2*p.f;
   const hw=p.f/2+gw;sh.holes.push(CB.polyPath(CB.shapePts('square',1).map(q=>[q[0]*2*hw,q[1]*gh])));G.push(CB.extrude(sh,p.t));G.push(CB.extrude(CB.polyShape([[-p.f/2,-gh/2-1],[p.f/2,-gh/2-1],[p.f/2,gh/2+1],[-p.f/2,gh/2+1]]),p.t));
   if(pat!=='none')[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(c=>G.push(CB.extrude(shp(pat,p.f*0.9,c[0]*(W*0.6-p.f/2),c[1]*(H/2-p.f/2)),1,p.t-0.01)));
   return {g:G,info:'Fits a '+p.b+' mm strap.'};}},
 charm:{name:'👟 Shoe charm',p:[['s','Charm size',12,30,1,20],['t','Thickness',2,4,0.5,2.5]],shape:1,
  build(p,pat,o){const G=[CB.extrude(shp(o.shape,p.s),p.t)];const st=new T.CylinderGeometry(3.5,3.5,6,32);st.rotateX(Math.PI/2);st.translate(0,0,p.t+3-0.01);G.push(st);const cap=new T.CylinderGeometry(4.8,4.8,1.8,32);cap.rotateX(Math.PI/2);cap.translate(0,0,p.t+6+0.9-0.02);G.push(cap);
   return {g:G,info:'Clog-style stem: 7 mm post with a 9.6 mm cap. Print face down.'};}},
 clip:{name:'🎀 Hair clip',p:[['l','Length',35,90,1,60],['w','Width',8,20,1,12],['t','Thickness',1.2,3,0.2,1.6]],
  build(p,pat){const out=[],inn=[];for(let i=0;i<=40;i++){const a=Math.PI/2+i/40*Math.PI*2,x=Math.cos(a)*p.l/2,taper=0.55+0.45*(x+p.l/2)/p.l,y=Math.sin(a)*p.w/2*taper;out.push([x,y]);}
   const sh=CB.polyShape(out);const slot=CB.stadium(-p.l*0.32,0,p.l*0.32,0,Math.max(1.6,p.w*0.28));sh.holes.push(CB.polyPath(slot));const G=[CB.extrude(sh,p.t)];
   if(pat!=='none')for(let i=-2;i<=2;i++){const x=i*p.l*0.17;G.push(CB.extrude(shp(pat,p.w*0.38,x,p.w*0.33*(0.55+0.45*(x+p.l/2)/p.l)),0.8,p.t-0.01));}
   return {g:G,info:'Print in PETG or nylon so it can flex. Slide hair through the slot.'};}},
 glasses:{name:'🕶 Sunglasses frame',p:[['lw','Lens width',40,62,1,50],['lh','Lens height',28,50,1,40],['br','Bridge',12,24,1,17],['rim','Rim',3,7,0.5,4.5],['t','Thickness',3,6,0.5,4]],shape:1,
  build(p,pat,o){const G=[],k=o.shape==='square'?'square':o.shape;const lp=s=>CB.shapePts(k,1,96).map(q=>[q[0]*(p.lw+s),q[1]*(p.lh+s)]);const cx=p.br/2+p.lw/2;
   [-1,1].forEach(s=>{const sh=CB.polyShape(CB.move(lp(2*p.rim),s*cx,0));sh.holes.push(CB.polyPath(CB.move(lp(0),s*cx,0)));G.push(CB.extrude(sh,p.t));
    G.push(CB.extrude(CB.polyShape([[s*(cx+p.lw/2),p.lh*0.2],[s*(cx+p.lw/2+p.rim+5),p.lh*0.2],[s*(cx+p.lw/2+p.rim+5),p.lh*0.2+6],[s*(cx+p.lw/2),p.lh*0.2+6]]),p.t));
    const arm=CB.polyShape(CB.shapePts('square',1).map(q=>[q[0]*140,q[1]*5]));arm.holes.push(CB.polyPath(CB.circlePts(-64,0,1.1,16)));const ag=CB.extrude(arm,p.t);ag.translate(0,-p.lh/2-p.rim-12-(s>0?12:0),0);G.push(ag);});
   const bh=p.lh*0.18;G.push(CB.extrude(CB.polyShape([[-cx+p.lw*0.3,p.lh*0.08],[cx-p.lw*0.3,p.lh*0.08],[cx-p.lw*0.3,p.lh*0.08+bh],[-cx+p.lw*0.3,p.lh*0.08+bh]]),p.t));
   return {g:G,info:'Front plus two 140 mm arms. Join with 2 mm screws or filament pins. Lenses are bought separately. This is a fashion frame, not eye protection.'};}},
 armour:{name:'🛡 Cosplay bracer',p:[['c','Forearm around (cm)',16,36,0.5,24],['l','Length',80,250,5,160],['t','Thickness',2,4,0.5,2.5],['cov','Wrap (degrees)',150,280,5,220]],
  build(p,pat){const ri=p.c*10/(2*Math.PI)+2,ro=ri+p.t,a0=Math.PI/2-p.cov*Math.PI/360,a1=Math.PI/2+p.cov*Math.PI/360,P=[];
   for(let i=0;i<=64;i++){const a=a0+(a1-a0)*i/64;P.push([Math.cos(a)*ro,Math.sin(a)*ro]);}for(let i=64;i>=0;i--){const a=a0+(a1-a0)*i/64;P.push([Math.cos(a)*ri,Math.sin(a)*ri]);}
   const sh=CB.polyShape(P);const G=[CB.extrude(sh,p.l)];
   if(pat!=='none'){const s=Math.min(18,p.l/6);for(let j=1;j<=4;j++)for(let k=-1;k<=1;k++){const a=Math.PI/2+k*0.45,z=p.l*j/5;const g=CB.extrude(shp(pat,s,0,0),1.6+0.8);g.rotateX(-Math.PI/2);g.rotateZ(a-Math.PI/2);g.translate(Math.cos(a)*(ro-0.8),Math.sin(a)*(ro-0.8),z);G.push(g);}}
   return {g:G,info:'Stands on its end for printing. Glue elastic or straps inside the open edges. Heat with a hair dryer to fine tune the curve.'};}},
 fabric:{name:'🧶 Flexible fabric tiles',p:[['s','Tile size',6,20,1,10],['gap','Gap',0.8,3,0.2,1.4],['cols','Columns',2,20,1,10],['rows','Rows',2,20,1,8],['t','Tile thickness',1,3,0.2,1.6]],
  build(p,pat){const G=[],k=pat==='none'?'hexagon':pat,st=p.s+p.gap,lw=Math.max(1,p.s*0.14);
   for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++){const x=c*st,y=r*st;G.push(CB.extrude(shp(k,p.s,x,y),p.t));
    if(c<p.cols-1)G.push(CB.extrude(CB.polyShape(CB.stadium(x,y,x+st,y,lw)),0.6));if(r<p.rows-1)G.push(CB.extrude(CB.polyShape(CB.stadium(x,y,x,y+st,lw)),0.6));}
   return {g:G,info:'Thin 0.6 mm links let the sheet bend like fabric. Print flat in TPU or thin PLA.'};}}
};
const shapes=['heart','star','circle','flower','bean','cup','hexagon','square'];
const demoOk={ring:1,pendant:1,earrings:1,button:1};
Object.keys(ITEMS).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=ITEMS[k].name+(CB.DEMO&&!demoOk[k]?' 🔒':'');$('item').appendChild(o);});
let P={};
function panel(){const it=ITEMS[$('item').value];P={};let h='';
  it.p.forEach(q=>{P[q[0]]=q[5];h+=`<div class="row"><label>${q[1]}</label><input type="range" data-k="${q[0]}" min="${q[2]}" max="${q[3]}" step="${q[4]}" value="${q[5]}"><span class="val" id="v_${q[0]}">${q[5]}</span></div>`;});
  if(it.shape)h+=`<div class="row"><label>Outline</label><select id="shape">${shapes.map(s=>`<option ${s==='heart'?'selected':''}>${s}</option>`).join('')}</select></div>`;
  if($('item').value==='ring'){const rows=h.split('</div>');h='<div id="rsz"></div><details class="custom"><summary>Custom size (exact)</summary>'+rows[0]+'</div></details>'+rows.slice(1).join('</div>');}
  $('params').innerHTML=h;$('txtRow').style.display=it.text?'flex':'none';
  $('params').querySelectorAll('input').forEach(i=>i.oninput=()=>{P[i.dataset.k]=parseFloat(i.value);$('v_'+i.dataset.k).textContent=i.value;build();});
  if($('shape'))$('shape').onchange=build;
  if($('rsz')){const mk=(a,b)=>{const r=[];for(let x=a;x<=b+1e-9;x+=0.5)r.push([''+x,x]);return r;};
    CB.sizeGrid($('rsz'),{Kids:mk(3,6),Women:mk(4,10),Men:mk(8,13)},v=>{P.size=v;const i=document.querySelector('input[data-k="size"]');i.value=v;$('v_size').textContent=v;build();},'Women','7');}}
function build(){const it=ITEMS[$('item').value];const r=it.build(P,$('pat').value,{shape:$('shape')?$('shape').value:'heart',txt:it.text?$('txt').value.trim():''});
  CB.clear(V.root);V.root.add(CB.mesh(CB.merge(r.g),parseInt($('col').value.slice(1),16)));$('info').textContent=r.info;$('dims').textContent=CB.dims(V.root);}
$('item').onchange=()=>{if(!demoOk[$('item').value]&&CB.locked(ITEMS[$('item').value].name)){$('item').value='ring';}panel();build();V.frame();};
$('pat').onchange=build;$('txt').oninput=build;
$('colSel').onchange=()=>{$('col').value=$('colSel').value;build();};$('col').oninput=build;
$('exp').onclick=()=>CB.exportSTL(V.root,'coffeebreak-'+$('item').value+'.stl');
window.APP={scenarios:()=>Object.keys(ITEMS),scenario:k=>{$('item').value=k;panel();build();V.frame();},exportAll:()=>[CB.exportSTL(V.root,'fashion.stl')],items:ITEMS};
panel();build();V.frame();
})();
