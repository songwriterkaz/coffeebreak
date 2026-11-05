/* Coffeebreak Life-Size 3D Print Studio core.
   Voxel mesh, STL/3MF, basic slicer, bed splitter with interlocking keys + labels.
   (c) Karen O'Brien (Coffeebreak). All rights reserved. */
(function(G){
'use strict';

function fillVoids(v,X,Y,Z){var n=X*Y*Z,seen=new Uint8Array(n),st=new Int32Array(n),sp=0;
 function push(i){if(!seen[i]&&!v[i]){seen[i]=1;st[sp++]=i;}}
 for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++){if(x===0||y===0||z===0||x===X-1||y===Y-1||z===Z-1)push((y*Z+z)*X+x);}
 while(sp){var i=st[--sp],x=i%X,z=((i/X)|0)%Z,y=(i/(X*Z))|0;if(x>0)push(i-1);if(x<X-1)push(i+1);if(z>0)push(i-X);if(z<Z-1)push(i+X);if(y>0)push(i-X*Z);if(y<Y-1)push(i+X*Z);}
 var c=0;for(i=0;i<n;i++)if(!v[i]&&!seen[i]){v[i]=5;c++;}return c;}

function fixManifold(v,X,Y,Z){var I=function(x,y,z){return (y*Z+z)*X+x;};var total=0;
 for(var pass=0;pass<6;pass++){var ch=0;
  for(var y=0;y<Y-1;y++)for(var z=0;z<Z-1;z++)for(var x=0;x<X-1;x++){
   var c=[v[I(x,y,z)]?1:0,v[I(x+1,y,z)]?1:0,v[I(x,y+1,z)]?1:0,v[I(x+1,y+1,z)]?1:0,v[I(x,y,z+1)]?1:0,v[I(x+1,y,z+1)]?1:0,v[I(x,y+1,z+1)]?1:0,v[I(x+1,y+1,z+1)]?1:0];
   var s=c[0]+c[1]+c[2]+c[3]+c[4]+c[5]+c[6]+c[7];if(s===0||s===8)continue;
   var faces=[[0,1,2,3],[4,5,6,7],[0,1,4,5],[2,3,6,7],[0,2,4,6],[1,3,5,7]];var bad=-1;
   for(var f=0;f<6;f++){var q=faces[f];if(c[q[0]]===c[q[3]]&&c[q[1]]===c[q[2]]&&c[q[0]]!==c[q[1]]){bad=c[q[0]]?q[1]:q[0];break;}}
   if(bad<0){var pairs=[[0,7],[1,6],[2,5],[3,4]];for(var p=0;p<4;p++){var a=pairs[p][0],b=pairs[p][1];
    if(s===2&&c[a]&&c[b]){bad=(a===0?1:0);break;}if(s===6&&!c[a]&&!c[b]){bad=a;break;}}}
   if(bad>=0){var bx=x+(bad&1),by=y+((bad>>1)&1),bz=z+((bad>>2)&1);v[I(bx,by,bz)]=3;ch++;}
  }
  total+=ch;if(!ch)break;}
 return total;}

function sealGrid(g){g.voids=fillVoids(g.v,g.X,g.Y,g.Z);g.fixes=fixManifold(g.v,g.X,g.Y,g.Z);g.voids+=fillVoids(g.v,g.X,g.Y,g.Z);return g;}

function makeGrid(X,Y,Z,vs){return {v:new Uint8Array(X*Y*Z),X:X,Y:Y,Z:Z,vs:vs||1};}
function idx(g,x,y,z){return (y*g.Z+z)*g.X+x;}
function put(g,x,y,z,m){if(x<0||y<0||z<0||x>=g.X||y>=g.Y||z>=g.Z)return;g.v[idx(g,x,y,z)]=m||1;}
function solid(g,x,y,z){return x>=0&&y>=0&&z>=0&&x<g.X&&y<g.Y&&z<g.Z&&g.v[idx(g,x,y,z)]>0;}
function fillBox(g,x0,y0,z0,x1,y1,z1,m){for(var y=y0;y<=y1;y++)for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++)put(g,x,y,z,m);}
function fillEllipsoid(g,cx,cy,cz,rx,ry,rz,m){var x0=Math.max(0,Math.floor(cx-rx)),x1=Math.min(g.X-1,Math.ceil(cx+rx));
 var y0=Math.max(0,Math.floor(cy-ry)),y1=Math.min(g.Y-1,Math.ceil(cy+ry));
 var z0=Math.max(0,Math.floor(cz-rz)),z1=Math.min(g.Z-1,Math.ceil(cz+rz));
 for(var y=y0;y<=y1;y++)for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++){
  var dx=(x-cx)/rx,dy=(y-cy)/ry,dz=(z-cz)/rz;if(dx*dx+dy*dy+dz*dz<=1)put(g,x,y,z,m);}}
function fillCylY(g,cx,cz,r,y0,y1,m){var x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(g.X-1,Math.ceil(cx+r));
 var z0=Math.max(0,Math.floor(cz-r)),z1=Math.min(g.Z-1,Math.ceil(cz+r));
 for(var y=y0;y<=y1;y++)for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++){var dx=x-cx,dz=z-cz;if(dx*dx+dz*dz<=r*r)put(g,x,y,z,m);}}

/* Meshing: print coords mm, Z up */
function mesh(g){var X=g.X,Y=g.Y,Z=g.Z,v=g.v,vs=g.vs;var VX=X+1,VY=Y+1,VZ=Z+1;
 var vid=new Int32Array(VX*VY*VZ).fill(-1);var pos=[],tri=[];
 var minY=Y,maxY=-1,minX=X,maxX=-1,minZ=Z,maxZ=-1;
 function V(x,y,z){var k=(y*VZ+z)*VX+x;if(vid[k]<0){vid[k]=pos.length/3;pos.push(x,y,z);}return vid[k];}
 function sol(x,y,z){return x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z&&v[(y*Z+z)*X+x]>0;}
 function quad(a,b,c,d,n){var A=[pos[a*3],pos[a*3+1],pos[a*3+2]],Bp=[pos[b*3],pos[b*3+1],pos[b*3+2]],C=[pos[c*3],pos[c*3+1],pos[c*3+2]];
  var u=[Bp[0]-A[0],Bp[1]-A[1],Bp[2]-A[2]],w=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];var cr=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
  if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>0)tri.push(a,b,c,a,c,d);else tri.push(a,c,b,a,d,c);}
 for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++){if(!v[(y*Z+z)*X+x])continue;
  if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;
  if(!sol(x+1,y,z))quad(V(x+1,y,z),V(x+1,y+1,z),V(x+1,y+1,z+1),V(x+1,y,z+1),[1,0,0]);
  if(!sol(x-1,y,z))quad(V(x,y,z),V(x,y+1,z),V(x,y+1,z+1),V(x,y,z+1),[-1,0,0]);
  if(!sol(x,y+1,z))quad(V(x,y+1,z),V(x+1,y+1,z),V(x+1,y+1,z+1),V(x,y+1,z+1),[0,1,0]);
  if(!sol(x,y-1,z))quad(V(x,y,z),V(x+1,y,z),V(x+1,y,z+1),V(x,y,z+1),[0,-1,0]);
  if(!sol(x,y,z+1))quad(V(x,y,z+1),V(x+1,y,z+1),V(x+1,y+1,z+1),V(x,y+1,z+1),[0,0,1]);
  if(!sol(x,y,z-1))quad(V(x,y,z),V(x+1,y,z),V(x+1,y+1,z),V(x,y+1,z),[0,0,-1]);}
 if(maxY<0)return {pos:new Float32Array(0),tri:new Uint32Array(0),size:[0,0,0],bounds:{},triCount:0};
 var P=new Float32Array(pos.length);for(var i=0;i<pos.length;i+=3){P[i]=(pos[i]-minX)*vs;P[i+1]=(maxZ+1-pos[i+2])*vs;P[i+2]=(pos[i+1]-minY)*vs;}
 return {pos:P,tri:new Uint32Array(tri),size:[(maxX-minX+1)*vs,(maxZ-minZ+1)*vs,(maxY-minY+1)*vs],bounds:{minX:minX,maxX:maxX,minY:minY,maxY:maxY,minZ:minZ,maxZ:maxZ},triCount:tri.length/3};}

function stl(m,title){var n=m.tri.length/3;var buf=new ArrayBuffer(84+n*50),dv=new DataView(buf);var hdr=(title||'Coffeebreak Life-Size 3D').slice(0,79);for(var i=0;i<hdr.length;i++)dv.setUint8(i,hdr.charCodeAt(i));dv.setUint32(80,n,true);var o=84,P=m.pos,Tr=m.tri;
 for(i=0;i<n;i++){var a=Tr[i*3]*3,b=Tr[i*3+1]*3,c=Tr[i*3+2]*3;var ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],wx=P[c]-P[a],wy=P[c+1]-P[a+1],wz=P[c+2]-P[a+2];var nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,l=Math.hypot(nx,ny,nz)||1;
  dv.setFloat32(o,nx/l,true);dv.setFloat32(o+4,ny/l,true);dv.setFloat32(o+8,nz/l,true);o+=12;[a,b,c].forEach(function(k){dv.setFloat32(o,P[k],true);dv.setFloat32(o+4,P[k+1],true);dv.setFloat32(o+8,P[k+2],true);o+=12;});dv.setUint16(o,0,true);o+=2;}
 return buf;}

var CRC=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u){var c=0xFFFFFFFF;for(var i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zip(files){var enc=new TextEncoder();var parts=[],cen=[],off=0;
 files.forEach(function(f){var name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data);
  var h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(8,0,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
  parts.push(new Uint8Array(h.buffer),name,data);
  var c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);c.setUint32(42,off,true);
  cen.push(new Uint8Array(c.buffer),name);off+=30+name.length+data.length;});
 var cs=cen.reduce(function(s,p){return s+p.length;},0);var e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob(parts.concat(cen,[new Uint8Array(e.buffer)]),{type:'application/vnd.ms-package.3dmanufacturing-3dmodel+xml'});}
function threeMF(m,title){var P=m.pos,Tr=m.tri,s=[];s.push('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">'+(title||'Coffeebreak Life-Size')+'</metadata><metadata name="Designer">Coffeebreak Life-Size 3D Print Studio</metadata><metadata name="Copyright">Karen O\'Brien (Coffeebreak). All rights reserved.</metadata><resources><object id="1" type="model"><mesh><vertices>');
 for(var i=0;i<P.length;i+=3)s.push('<vertex x="'+(+P[i].toFixed(4))+'" y="'+(+P[i+1].toFixed(4))+'" z="'+(+P[i+2].toFixed(4))+'"/>');
 s.push('</vertices><triangles>');for(i=0;i<Tr.length;i+=3)s.push('<triangle v1="'+Tr[i]+'" v2="'+Tr[i+1]+'" v3="'+Tr[i+2]+'"/>');
 s.push('</triangles></mesh></object></resources><build><item objectid="1"/></build></model>');
 return zip([{name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'},
  {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'},
  {name:'3D/3dmodel.model',data:s.join('')}]);}

/* 5x7 digit glyphs for part labels (raised voxels) */
var GLYPH={
'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],
'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],
'9':['111','101','111','001','111'],'A':['010','101','111','101','101'],'B':['110','101','110','101','110'],
'C':['011','100','100','100','011'],'D':['110','101','101','101','110'],'E':['111','100','110','100','111'],
'F':['111','100','110','100','100'],'H':['101','101','111','101','101'],'K':['101','101','110','101','101'],
'L':['100','100','100','100','111'],'P':['111','101','111','100','100'],'-':['000','000','111','000','000']
};
function stampLabel(g,x0,y0,z0,text,axis){ // axis: 'x' raise in +X, 'z' raise in +Z, 'y' raise in +Y
 text=String(text).toUpperCase().slice(0,8);var cursor=0;
 for(var ti=0;ti<text.length;ti++){var gyl=GLYPH[text[ti]]||GLYPH['-'];
  for(var row=0;row<5;row++)for(var col=0;col<3;col++){if(gyl[row][col]!=='1')continue;
   var lx=cursor+col,ly=4-row;
   if(axis==='y')put(g,x0+lx,y0+1,z0+ly,9);
   else if(axis==='z')put(g,x0+lx,y0+ly,z0+1,9);
   else put(g,x0+1,y0+ly,z0+lx,9);}
  cursor+=4;}}

/* Split a sealed grid into bed-sized interlocking parts with keys + labels.
   bedMm: {x,y,z} printable volume in mm. Returns array of {id,label,grid,mesh}. */
function splitGrid(g,bedMm,opts){
 opts=opts||{};var vs=g.vs;var bx=Math.max(20,Math.floor((bedMm.x||220)/vs)-2);
 var by=Math.max(20,Math.floor((bedMm.z||220)/vs)-2); // bed Z is print height -> grid Y
 var bz=Math.max(20,Math.floor((bedMm.y||220)/vs)-2); // bed Y depth -> grid Z
 // find occupied bounds
 var minX=g.X,maxX=-1,minY=g.Y,maxY=-1,minZ=g.Z,maxZ=-1;
 for(var y=0;y<g.Y;y++)for(var z=0;z<g.Z;z++)for(var x=0;x<g.X;x++)if(g.v[idx(g,x,y,z)]){
  if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;}
 if(maxX<0)return [];
 var key=Math.max(2,Math.round(4/vs)); // ~4 mm key
 var parts=[],pi=0,xx,yy,zz,kx,ky,kz,kx2,kyy,kzz,px,py,pz;
 var nx=Math.ceil((maxX-minX+1)/bx),ny=Math.ceil((maxY-minY+1)/by),nz=Math.ceil((maxZ-minZ+1)/bz);
 // Cap extreme part counts for browser safety
 var maxParts=opts.maxParts||80;
 if(nx*ny*nz>maxParts){
  var scale=Math.ceil(Math.pow((nx*ny*nz)/maxParts,1/3));
  bx*=scale;by*=scale;bz*=scale;
  nx=Math.ceil((maxX-minX+1)/bx);ny=Math.ceil((maxY-minY+1)/by);nz=Math.ceil((maxZ-minZ+1)/bz);
 }
 for(var iy=0;iy<ny;iy++)for(var iz=0;iz<nz;iz++)for(var ix=0;ix<nx;ix++){
  var x0=minX+ix*bx,x1=Math.min(maxX,x0+bx-1);
  var y0=minY+iy*by,y1=Math.min(maxY,y0+by-1);
  var z0=minZ+iz*bz,z1=Math.min(maxZ,z0+bz-1);
  // padding for keys sticking out
  var pad=key+2;
  var pg=makeGrid(x1-x0+1+pad*2,y1-y0+1+pad*2,z1-z0+1+pad*2,vs);
  var any=false;
  for(y=y0;y<=y1;y++)for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++){
   if(!g.v[idx(g,x,y,z)])continue;any=true;
   put(pg,x-x0+pad,y-y0+pad,z-z0+pad,g.v[idx(g,x,y,z)]);
  }
  if(!any)continue;
  // interlocking keys on +X / +Y / +Z faces (male), matching recesses carved by neighbour ownership:
  // male key protrudes into next cell's volume conceptually; we add male pegs on + faces
  function addKeys(face){
   var step=key*3;
   if(face==='x'&&ix<nx-1){
    for(var yy=y0+key;yy<=y1-key;yy+=step)for(var zz=z0+key;zz<=z1-key;zz+=step){
     if(!solid(g,x1,yy,zz))continue;
     for(var kx=1;kx<=key;kx++)for(var ky=-1;ky<=1;ky++)for(var kz=-1;kz<=1;kz++)
      put(pg,x1-x0+pad+kx,yy-y0+pad+ky,zz-z0+pad+kz,8);
    }
   }
   if(face==='y'&&iy<ny-1){
    for(var xx=x0+key;xx<=x1-key;xx+=step)for(zz=z0+key;zz<=z1-key;zz+=step){
     if(!solid(g,xx,y1,zz))continue;
     for(var kyy=1;kyy<=key;kyy++)for(var kx2=-1;kx2<=1;kx2++)for(kz=-1;kz<=1;kz++)
      put(pg,xx-x0+pad+kx2,y1-y0+pad+kyy,zz-z0+pad+kz,8);
    }
   }
   if(face==='z'&&iz<nz-1){
    for(xx=x0+key;xx<=x1-key;xx+=step)for(yy=y0+key;yy<=y1-key;yy+=step){
     if(!solid(g,xx,yy,z1))continue;
     for(var kzz=1;kzz<=key;kzz++)for(kx2=-1;kx2<=1;kx2++)for(ky=-1;ky<=1;ky++)
      put(pg,xx-x0+pad+kx2,yy-y0+pad+ky,z1-z0+pad+kzz,8);
    }
   }
  }
  addKeys('x');addKeys('y');addKeys('z');
  // female recesses on - faces (match neighbour male)
  if(ix>0){
   for(yy=y0+key;yy<=y1-key;yy+=key*3)for(zz=z0+key;zz<=z1-key;zz+=key*3){
    if(!solid(g,x0,yy,zz))continue;
    for(kx=0;kx<key;kx++)for(ky=-1;ky<=1;ky++)for(kz=-1;kz<=1;kz++){
     var px=x0-x0+pad+kx,py=yy-y0+pad+ky,pz=zz-z0+pad+kz;
     if(px>=0&&py>=0&&pz>=0&&px<pg.X&&py<pg.Y&&pz<pg.Z)pg.v[idx(pg,px,py,pz)]=0;
    }
   }
  }
  if(iy>0){
   for(xx=x0+key;xx<=x1-key;xx+=key*3)for(zz=z0+key;zz<=z1-key;zz+=key*3){
    if(!solid(g,xx,y0,zz))continue;
    for(kyy=0;kyy<key;kyy++)for(kx2=-1;kx2<=1;kx2++)for(kz=-1;kz<=1;kz++){
     px=xx-x0+pad+kx2;py=y0-y0+pad+kyy;pz=zz-z0+pad+kz;
     if(px>=0&&py>=0&&pz>=0&&px<pg.X&&py<pg.Y&&pz<pg.Z)pg.v[idx(pg,px,py,pz)]=0;
    }
   }
  }
  if(iz>0){
   for(xx=x0+key;xx<=x1-key;xx+=key*3)for(yy=y0+key;yy<=y1-key;yy+=key*3){
    if(!solid(g,xx,yy,z0))continue;
    for(kzz=0;kzz<key;kzz++)for(kx2=-1;kx2<=1;kx2++)for(ky=-1;ky<=1;ky++){
     px=xx-x0+pad+kx2;py=yy-y0+pad+ky;pz=z0-z0+pad+kzz;
     if(px>=0&&py>=0&&pz>=0&&px<pg.X&&py<pg.Y&&pz<pg.Z)pg.v[idx(pg,px,py,pz)]=0;
    }
   }
  }
  pi++;
  var label=(opts.prefix||'P')+pi;
  // stamp label on top
  stampLabel(pg,pad+2,y1-y0+pad,pad+2,label,'y');
  sealGrid(pg);
  var m=mesh(pg);
  if(!m.triCount)continue;
  parts.push({id:pi,label:label,ix:ix,iy:iy,iz:iz,grid:pg,mesh:m});
 }
 return parts;
}

/* Basic slicer (from House Maker, generalised) */
function slice(g,s,progress){var X=g.X,Y=g.Y,Z=g.Z,v=g.v,vs=g.vs;
 var minY=Y,maxY=-1,minX=X,maxX=-1,minZ=Z,maxZ=-1;for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++)if(v[(y*Z+z)*X+x]){if(y<minY)minY=y;if(y>maxY)maxY=y;if(x<minX)minX=x;if(x>maxX)maxX=x;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;}
 if(maxY<0)return null;
 var sx=(maxX-minX+1)*vs,sy=(maxZ-minZ+1)*vs,sz=(maxY-minY+1)*vs;var w=s.w,lh=s.lh;
 var offX=(s.bedX-sx)/2,offY=(s.bedY-sy)/2;var fits=offX>=2&&offY>=2;
 var k=Math.max(1,Math.round(vs/w)),p=vs/k;
 var perims=vs>=4*w?2:1;var ero=perims;
 var nx=(maxX-minX+1)*k,nz=(maxZ-minZ+1)*k;var sparseStep=Math.max(2,Math.round(100/Math.max(5,s.infill)));
 var ePerMM=w*lh/(Math.PI*Math.pow(s.fil/2,2));
 function at(x,y,z){return x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&y>=minY&&y<=maxY&&v[(y*Z+z)*X+x]>0;}
 function toXY(fx,fz){return [offX+fx*p,offY+(nz-fz)*p];}
 var cache={};
 function layerPaths(vy){if(cache[vy])return cache[vy];var loops=[],segX=[],segY=[];
  var edges={};function key(a,b){return a+','+b;}
  for(var z=minZ;z<=maxZ;z++)for(var x=minX;x<=maxX;x++){if(!at(x,vy,z))continue;var gx=x-minX,gz=z-minZ;
   if(!at(x,vy,z-1))edges[key(gx+1,gz)]=[gx,gz];
   if(!at(x+1,vy,z))edges[key(gx+1,gz+1)]=[gx+1,gz];
   if(!at(x,vy,z+1))edges[key(gx,gz+1)]=[gx+1,gz+1];
   if(!at(x-1,vy,z))edges[key(gx,gz)]=[gx,gz+1];}
  var used={};for(var st in edges){if(used[st])continue;var loop=[],cur=st,guard=0;while(!used[cur]&&edges[cur]&&guard++<1e6){used[cur]=1;var a=cur.split(',').map(Number);loop.push(a);var e=edges[cur];cur=key(e[0],e[1]);}
   var L=[];for(var i=0;i<loop.length;i++){var pr=loop[(i-1+loop.length)%loop.length],c=loop[i],nx_=loop[(i+1)%loop.length];if((pr[0]===c[0]&&c[0]===nx_[0])||(pr[1]===c[1]&&c[1]===nx_[1]))continue;L.push(c);}
   if(L.length>=4)loops.push(L);}
  var per=[];for(var pi=0;pi<perims;pi++){var o=(pi+0.5)*w;loops.forEach(function(L){var out=[];for(var i=0;i<L.length;i++){var pr=L[(i-1+L.length)%L.length],c=L[i],nx_=L[(i+1)%L.length];
    var d1=[Math.sign(c[0]-pr[0]),Math.sign(c[1]-pr[1])],d2=[Math.sign(nx_[0]-c[0]),Math.sign(nx_[1]-c[1])];
    var n1=[d1[1],-d1[0]],n2=[d2[1],-d2[0]];var gx=c[0]*vs+o*(n1[0]+n2[0]),gz=c[1]*vs+o*(n1[1]+n2[1]);out.push([offX+gx,offY+(maxZ-minZ+1)*vs-gz]);}
   out.push(out[0]);per.push(out);});}
  var F=new Uint8Array(nx*nz),S=new Uint8Array(nx*nz);
  for(z=minZ;z<=maxZ;z++)for(x=minX;x<=maxX;x++){if(!at(x,vy,z))continue;var skin=!at(x,vy-1,z)||!at(x,vy+1,z)||!at(x,vy-2,z)&&vy-2>=minY;for(var a2=0;a2<k;a2++)for(var b2=0;b2<k;b2++){var ii=((z-minZ)*k+b2)*nx+(x-minX)*k+a2;F[ii]=1;S[ii]=skin?1:0;}}
  var E=F;for(var r=0;r<ero;r++){var N=new Uint8Array(nx*nz);for(var fz=0;fz<nz;fz++)for(var fx=0;fx<nx;fx++){var j=fz*nx+fx;N[j]=E[j]&&fx>0&&fx<nx-1&&fz>0&&fz<nz-1&&E[j-1]&&E[j+1]&&E[j-nx]&&E[j+nx]&&E[j-nx-1]&&E[j-nx+1]&&E[j+nx-1]&&E[j+nx+1]?1:0;}E=N;}
  function runs(isX,out){var n1=isX?nz:nx,n2=isX?nx:nz;for(var r=0;r<n1;r++){var start=-1,mode=0;for(var q=0;q<=n2;q++){var j=isX?r*nx+q:q*nx+r;var on=q<n2&&E[j]&&(S[j]||r%sparseStep===0);var md=q<n2?S[j]:0;
     if(on&&start<0){start=q;mode=md;}else if(start>=0&&(!on||md!==mode)){var a,b;if(isX){a=toXY(start,r+0.5);b=toXY(q,r+0.5);}else{a=toXY(r+0.5,start);b=toXY(r+0.5,q);}if(Math.hypot(b[0]-a[0],b[1]-a[1])>w*0.6)out.push([a,b]);start=on?q:-1;mode=md;}}}}
  runs(true,segX);runs(false,segY);
  cache[vy]={per:per,segX:segX,segY:segY};return cache[vy];}
 var out=[],layers=[],len=0,E=0;var fr=Math.round(s.speed*60),tr=9000;var lastX=null,lastY=null;
 out.push('; Coffeebreak Life-Size 3D Print Studio basic slicer (experimental)');
 out.push('; size '+sx.toFixed(1)+' x '+sy.toFixed(1)+' x '+sz.toFixed(1)+' mm');
 out.push('M140 S'+s.bed,'M104 S'+s.temp,'G28','M190 S'+s.bed,'M109 S'+s.temp,'G90','M82','G92 E0','G1 Z2 F3000','G1 X5 Y10 F'+tr,'G1 Z0.28 F1200','G1 X5 Y150 E12 F1500','G1 X5.5 Y150 F1500','G1 X5.5 Y10 E24 F1500','G92 E0','G1 Z1 F1200');
 var nL=Math.ceil(sz/lh-1e-6);
 function travel(x,y,z){var d=lastX==null?99:Math.hypot(x-lastX,y-lastY);if(d<0.01)return;if(d>2){E-=0.8;out.push('G1 E'+E.toFixed(4)+' F2400');out.push('G0 Z'+(z+0.4).toFixed(2)+' F'+tr);out.push('G0 X'+x.toFixed(3)+' Y'+y.toFixed(3)+' F'+tr);out.push('G0 Z'+z.toFixed(2)+' F'+tr);E+=0.8;out.push('G1 E'+E.toFixed(4)+' F2400');}else out.push('G0 X'+x.toFixed(3)+' Y'+y.toFixed(3)+' F'+tr);lastX=x;lastY=y;}
 function ext(x,y,f){var d=Math.hypot(x-lastX,y-lastY);if(d<0.01)return;E+=d*ePerMM;len+=d;out.push('G1 X'+x.toFixed(3)+' Y'+y.toFixed(3)+' E'+E.toFixed(5)+(f?' F'+f:''));lastX=x;lastY=y;}
 for(var L=0;L<nL;L++){var zc=(L+0.5)*lh,zt=(L+1)*lh;var vy=minY+Math.min(maxY-minY,Math.floor(zc/vs));var lp=layerPaths(vy);var vis=[];
  out.push(';LAYER:'+L,'G0 Z'+zt.toFixed(2)+' F'+tr);if(L===1)out.push('M106 S255');
  var f1=L===0?Math.round(fr/2):fr;
  lp.per.forEach(function(pl){travel(pl[0][0],pl[0][1],zt);out.push('G1 F'+f1);for(var i=1;i<pl.length;i++)ext(pl[i][0],pl[i][1]);vis.push(pl);});
  var segs=(L%2?lp.segY:lp.segX);segs.forEach(function(sg,i){var a=sg[0],b=sg[1];if(i%2){a=sg[1];b=sg[0];}travel(a[0],a[1],zt);out.push('G1 F'+f1);ext(b[0],b[1]);vis.push([a,b]);});
  layers.push(vis);if(progress&&L%10===0)progress(L/nL);}
 out.push('G1 E'+(E-2).toFixed(4)+' F2400','M107','G0 Z'+(Math.min(sz+10,250)).toFixed(1)+' F'+tr,'G0 X0 Y'+s.bedY+' F'+tr,'M104 S0','M140 S0','M84','; end');
 return {gcode:out.join('\n')+'\n',layers:layers,size:[sx,sy,sz],fits:fits,perims:perims,minutes:len/s.speed/60+nL*0.05,filamentM:E/1000,nLayers:nL,warn:''};}

G.CBLS={makeGrid:makeGrid,put:put,solid:solid,fillBox:fillBox,fillEllipsoid:fillEllipsoid,fillCylY:fillCylY,sealGrid:sealGrid,mesh:mesh,stl:stl,threeMF:threeMF,zip:zip,splitGrid:splitGrid,slice:slice,stampLabel:stampLabel,idx:idx};
})(typeof window!=='undefined'?window:globalThis);
