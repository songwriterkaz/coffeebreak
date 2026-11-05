// Coffeebreak 3D Converter core geometry (no dependencies)
// tris: Float32Array, 9 floats per triangle (mm)
export function heightmapToTris(h, w, rows, cellMM, baseMM){
  // h: Float32Array w*rows of heights (mm, 0 = empty). baseMM>0 adds a solid base under all cells.
  const out=[]; const H=(x,y)=>(x<0||y<0||x>=w||y>=rows)?0:h[y*w+x]+(baseMM>0?baseMM:0);
  const q=(a,b,c,d)=>{out.push(...a,...b,...c,...a,...c,...d);};
  for(let y=0;y<rows;y++)for(let x=0;x<w;x++){
    const z=H(x,y); if(z<=0)continue;
    const x0=x*cellMM,x1=x0+cellMM,y0=(rows-1-y)*cellMM,y1=y0+cellMM;
    q([x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]); // top
    q([x0,y0,0],[x0,y1,0],[x1,y1,0],[x1,y0,0]); // bottom
    // walls where neighbour lower
    let n=H(x,y+1); if(n<z) q([x0,y0,n],[x1,y0,n],[x1,y0,z],[x0,y0,z]); // south (y0 side)
    n=H(x,y-1); if(n<z) q([x1,y1,n],[x0,y1,n],[x0,y1,z],[x1,y1,z]);
    n=H(x-1,y); if(n<z) q([x0,y1,n],[x0,y0,n],[x0,y0,z],[x0,y1,z]);
    n=H(x+1,y); if(n<z) q([x1,y0,n],[x1,y1,n],[x1,y1,z],[x1,y0,z]);
  }
  return new Float32Array(out);
}
// rgba pixels -> heights. mode 'outline': dark/opaque pixels extruded to depth. 'height': darker = taller.
export function pixelsToHeights(data,w,rows,mode,depth,invert){
  const h=new Float32Array(w*rows);
  for(let i=0;i<w*rows;i++){
    const a=data[i*4+3]/255; let lum=(0.299*data[i*4]+0.587*data[i*4+1]+0.114*data[i*4+2])/255;
    let dark=(1-lum)*a; if(invert) dark=a>0.1?1-dark:0;
    h[i]= mode==='height' ? (a>0.1? Math.max(0.2,dark*depth):0) : (dark>0.35?depth:0);
  }
  return h;
}
export function bounds(t){let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<t.length;i+=3)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],t[i+k]);mx[k]=Math.max(mx[k],t[i+k]);}return{mn,mx,size:mx.map((v,k)=>v-mn[k])};}
// scale uniformly so largest XY side = targetMM, put on bed origin z=0
export function fitSize(t,targetMM,heightMM){const b=bounds(t);const s=targetMM/Math.max(b.size[0],b.size[1],1e-9);const sz=heightMM?heightMM/Math.max(b.size[2],1e-9):s;const o=new Float32Array(t.length);for(let i=0;i<t.length;i+=3){o[i]=(t[i]-b.mn[0])*s;o[i+1]=(t[i+1]-b.mn[1])*s;o[i+2]=(t[i+2]-b.mn[2])*sz;}return o;}
function normal(t,i){const ux=t[i+3]-t[i],uy=t[i+4]-t[i+1],uz=t[i+5]-t[i+2],vx=t[i+6]-t[i],vy=t[i+7]-t[i+1],vz=t[i+8]-t[i+2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;return[nx/l,ny/l,nz/l];}
export function toSTL(t){const n=t.length/9;const buf=new ArrayBuffer(84+n*50);const dv=new DataView(buf);const hdr='Coffeebreak 3D Converter';for(let i=0;i<hdr.length;i++)dv.setUint8(i,hdr.charCodeAt(i));dv.setUint32(80,n,true);let o=84;for(let f=0;f<n;f++){const i=f*9;const nn=normal(t,i);for(const v of nn){dv.setFloat32(o,v,true);o+=4;}for(let k=0;k<9;k++){dv.setFloat32(o,t[i+k],true);o+=4;}dv.setUint16(o,0,true);o+=2;}return new Uint8Array(buf);}
function indexed(t){const map=new Map(),verts=[],idx=[];for(let i=0;i<t.length;i+=3){const k=t[i].toFixed(4)+','+t[i+1].toFixed(4)+','+t[i+2].toFixed(4);let j=map.get(k);if(j===undefined){j=verts.length/3;map.set(k,j);verts.push(t[i],t[i+1],t[i+2]);}idx.push(j);}return{verts,idx};}
export function toOBJ(t){const{verts,idx}=indexed(t);let s='# Coffeebreak 3D Converter\n';for(let i=0;i<verts.length;i+=3)s+=`v ${verts[i].toFixed(4)} ${verts[i+1].toFixed(4)} ${verts[i+2].toFixed(4)}\n`;for(let i=0;i<idx.length;i+=3)s+=`f ${idx[i]+1} ${idx[i+1]+1} ${idx[i+2]+1}\n`;return s;}
const crcT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=crcT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
export function zipStore(files){const enc=new TextEncoder();const parts=[],cen=[];let off=0;for(const[name,data0]of files){const data=typeof data0==='string'?enc.encode(data0):data0;const nb=enc.encode(name);const crc=crc32(data);const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nb.length,true);parts.push(new Uint8Array(lh.buffer),nb,data);const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nb.length,true);ch.setUint32(42,off,true);cen.push(new Uint8Array(ch.buffer),nb);off+=30+nb.length+data.length;}const cs=cen.reduce((a,b)=>a+b.length,0);const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);const all=[...parts,...cen,new Uint8Array(e.buffer)];const out=new Uint8Array(all.reduce((a,b)=>a+b.length,0));let p=0;for(const a of all){out.set(a,p);p+=a.length;}return out;}
export function to3MF(t){const{verts,idx}=indexed(t);let v='',tr='';for(let i=0;i<verts.length;i+=3)v+=`<vertex x="${verts[i].toFixed(4)}" y="${verts[i+1].toFixed(4)}" z="${verts[i+2].toFixed(4)}"/>`;for(let i=0;i<idx.length;i+=3)tr+=`<triangle v1="${idx[i]}" v2="${idx[i+1]}" v3="${idx[i+2]}"/>`;
const model=`<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices>${v}</vertices><triangles>${tr}</triangles></mesh></object></resources><build><item objectid="1"/></build></model>`;
return zipStore([['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'],['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'],['3D/3dmodel.model',model]]);}
export const PRINTERS={
 generic:{name:'Generic printer (220 x 220)',bed:[220,220],nozzle:200,bedT:60,start:'G28\nG92 E0',end:'M104 S0\nM140 S0\nG28 X0\nM84'},
 ender3:{name:'Creality Ender 3',bed:[220,220],nozzle:200,bedT:60,start:'G28\nG92 E0\nG1 Z2 F3000\nG1 X0.1 Y20 Z0.3 F5000\nG1 X0.1 Y200 E15 F1500\nG92 E0',end:'G91\nG1 E-2 Z10 F600\nG90\nG1 X0 Y200\nM104 S0\nM140 S0\nM84'},
 mk4:{name:'Prusa MK4',bed:[250,210],nozzle:215,bedT:60,start:'G28\nG92 E0\nG1 Z0.3 F720\nG1 X5 Y-3 F6000\nG1 X60 E9 F1000\nG92 E0',end:'G1 Z50 F720\nM104 S0\nM140 S0\nM84'},
 bambu:{name:'Bambu Lab (A1 / P1 / X1)',bed:[256,256],nozzle:220,bedT:65,start:'G28\nG92 E0\nG1 Z0.3 F3000\nG1 X18 Y1 F12000\nG1 X100 E8 F1500\nG92 E0',end:'G1 Z20 F600\nM104 S0\nM140 S0\nM84',note:'Bambu printers prefer 3MF from Bambu Studio. This G-code is basic.'},
 anycubic:{name:'Anycubic Kobra',bed:[220,220],nozzle:205,bedT:60,start:'G28\nG92 E0\nG1 Z0.3 F3000\nG1 X5 Y20 F5000\nG1 X5 Y180 E12 F1500\nG92 E0',end:'G1 Z10\nG1 X0 Y200\nM104 S0\nM140 S0\nM84'},
 elegoo:{name:'Elegoo Neptune',bed:[220,220],nozzle:205,bedT:60,start:'G28\nG92 E0\nG1 Z0.3 F3000\nG1 X2 Y20 F5000\nG1 X2 Y200 E15 F1500\nG92 E0',end:'G1 Z10\nM104 S0\nM140 S0\nM84'}};
// Basic slicer: perimeters + simple line infill per layer
export function toGcode(t,key,opt={}){const p=PRINTERS[key]||PRINTERS.generic;const lh=opt.layer||0.2,ew=0.45,fil=1.75;const b=bounds(t);const ox=p.bed[0]/2-b.size[0]/2-b.mn[0],oy=p.bed[1]/2-b.size[1]/2-b.mn[1];
 const eper=(lh*ew)/(Math.PI*(fil/2)**2);let E=0;const g=[`; Coffeebreak 3D Converter - basic G-code for ${p.name}`,'; Basic slicer. For best results open the STL in UltiMaker Cura (free).',`M140 S${p.bedT}`,`M104 S${p.nozzle}`,`M190 S${p.bedT}`,`M109 S${p.nozzle}`,p.start,'G21','G90','M82','M106 S255'];
 let cx=0,cy=0;const mv=(x,y)=>{g.push(`G0 X${(x+ox).toFixed(2)} Y${(y+oy).toFixed(2)} F6000`);cx=x;cy=y;};const ex=(x,y,f)=>{E+=Math.hypot(x-cx,y-cy)*eper;g.push(`G1 X${(x+ox).toFixed(2)} Y${(y+oy).toFixed(2)} E${E.toFixed(4)} F${f}`);cx=x;cy=y;};
 const layers=Math.max(1,Math.round(b.size[2]/lh));
 for(let L=0;L<layers;L++){const z=b.mn[2]+(L+0.5)*lh;g.push(`;LAYER:${L}`,`G1 Z${((L+1)*lh).toFixed(2)} F600`);const seg=[];
  for(let i=0;i<t.length;i+=9){const pts=[];for(let k=0;k<3;k++){const a=i+k*3,c=i+((k+1)%3)*3;const za=t[a+2],zc=t[c+2];if((za-z)*(zc-z)<0){const s=(z-za)/(zc-za);pts.push([t[a]+(t[c]-t[a])*s,t[a+1]+(t[c+1]-t[a+1])*s]);}}if(pts.length===2)seg.push(pts);}
  const sp=L===0?1200:1800;for(const[s0,s1]of seg){if(Math.hypot(s0[0]-cx,s0[1]-cy)>0.05)mv(s0[0],s0[1]);ex(s1[0],s1[1],sp);}
  // line infill (alternating direction), even-odd on segments
  const solid=L<3||L>=layers-3;const step=solid?ew:4;const horiz=L%2===0;
  for(let c=(horiz?b.mn[1]:b.mn[0])+step/2;c<(horiz?b.mx[1]:b.mx[0]);c+=step){const xs=[];for(const[s0,s1]of seg){const a=horiz?s0[1]:s0[0],bb=horiz?s1[1]:s1[0];if((a-c)*(bb-c)<0){const s=(c-a)/(bb-a);xs.push(horiz?s0[0]+(s1[0]-s0[0])*s:s0[1]+(s1[1]-s0[1])*s);}}xs.sort((a,b)=>a-b);
   for(let k=0;k+1<xs.length;k+=2){const a=xs[k]+ew/2,bb=xs[k+1]-ew/2;if(bb<=a)continue;horiz?(mv(a,c),ex(bb,c,2400)):(mv(c,a),ex(c,bb,2400));}}}
 g.push('M107',p.end);return g.join('\n')+'\n';}
