/* Coffeebreak House Maker core: design model, presets, voxel builder, mesh + STL/3MF export, basic slicer.
   (c) Karen O'Brien (Coffeebreak). All rights reserved. */
(function(G){
'use strict';
var T={EMPTY:0,FLOOR:1,WALL:2,DOOR:3,WINDOW:4,STAIR:5,POOL:6,GARDEN:7,TREE:8,PATH:9};
var BUILD=function(t){return t>=1&&t<=5;};
var SUB=2, STOREY=12; // 2 sub-voxels per 0.5 m cell -> 0.25 m voxels; 12 voxels = 3 m storey

function Design(W,H,n){this.W=W;this.H=H;this.floors=[];this.dirs=[];this.roof='hip';for(var i=0;i<(n||1);i++)this.addFloor();}
Design.prototype.addFloor=function(){this.floors.push(new Uint8Array(this.W*this.H));this.dirs.push(new Uint8Array(this.W*this.H));};
Design.prototype.get=function(f,x,z){if(f<0||f>=this.floors.length||x<0||z<0||x>=this.W||z>=this.H)return 0;return this.floors[f][z*this.W+x];};
Design.prototype.set=function(f,x,z,t,d){if(x<0||z<0||x>=this.W||z>=this.H)return;this.floors[f][z*this.W+x]=t;if(d!=null)this.dirs[f][z*this.W+x]=d;};
Design.prototype.toJSON=function(){return {W:this.W,H:this.H,roof:this.roof,floors:this.floors.map(function(a){return Array.from(a).join('');}),dirs:this.dirs.map(function(a){return Array.from(a).join('');})};};
Design.fromJSON=function(o){var d=new Design(o.W,o.H,0);d.roof=o.roof||'hip';o.floors.forEach(function(s,i){var a=new Uint8Array(o.W*o.H);for(var k=0;k<a.length;k++)a[k]=+s[k]||0;d.floors.push(a);var b=new Uint8Array(o.W*o.H);var ds=(o.dirs&&o.dirs[i])||'';for(k=0;k<b.length;k++)b[k]=+ds[k]||0;d.dirs.push(b);});return d;};
Design.prototype.storeys=function(){var n=0;for(var f=0;f<this.floors.length;f++){if(this.floors[f].some(BUILD))n=f+1;}return n;};

/* ---------- preset helpers ---------- */
function room(d,f,x0,z0,x1,z1){for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++){var edge=x==x0||x==x1||z==z0||z==z1;var c=d.get(f,x,z);if(edge){if(c!==T.DOOR&&c!==T.WINDOW&&c!==T.STAIR)d.set(f,x,z,T.WALL);}else if(c!==T.STAIR&&c!==T.WALL&&c!==T.DOOR)d.set(f,x,z,T.FLOOR);}}
function wins(d,f,x0,z0,x1,z1,step){step=step||3;for(var x=x0+2;x<x1-1;x+=step){d.set(f,x,z0,T.WINDOW);d.set(f,x,z1,T.WINDOW);}for(var z=z0+2;z<z1-1;z+=step){d.set(f,x0,z,T.WINDOW);d.set(f,x1,z,T.WINDOW);}}
function fill(d,f,x0,z0,x1,z1,t){for(var z=z0;z<=z1;z++)for(var x=x0;x<=x1;x++)d.set(f,x,z,t);}
function stairs(d,f,x,z,dir,n){var dx=[0,1,0,-1][dir],dz=[-1,0,1,0][dir];for(var i=0;i<(n||2);i++)d.set(f,x+dx*i,z+dz*i,T.STAIR,dir);}
function trees(d,list){list.forEach(function(p){d.set(0,p[0],p[1],T.TREE);});}
var PRESETS={
 cottage:function(){var d=new Design(22,18,1);d.roof='gable';fill(d,0,0,0,21,17,T.GARDEN);fill(d,10,13,11,17,T.PATH);room(d,0,4,4,17,12);wins(d,0,4,4,17,12,3);d.set(0,10,12,T.DOOR);for(var z=5;z<12;z++)d.set(0,11,z,T.WALL);d.set(0,11,8,T.DOOR);trees(d,[[1,1],[20,1],[1,15],[20,15],[2,8]]);return d;},
 beach:function(){var d=new Design(26,22,2);d.roof='flat';fill(d,0,0,0,25,21,T.GARDEN);fill(d,0,16,25,21,T.PATH);room(d,0,3,3,20,13);wins(d,0,3,3,20,13,2);d.set(0,11,13,T.DOOR);d.set(0,4,3,T.DOOR);stairs(d,0,18,6,2,2);room(d,1,3,3,20,13);wins(d,1,3,3,20,13,2);fill(d,0,6,15,17,19,T.POOL);trees(d,[[23,2],[23,8],[23,13],[1,18],[24,19]]);return d;},
 mansion:function(){var d=new Design(44,34,3);d.roof='hip';fill(d,0,0,0,43,33,T.GARDEN);
  // central block 3 storeys, two wings 2 storeys
  room(d,0,14,6,29,19);wins(d,0,14,6,29,19,2);d.set(0,21,19,T.DOOR);d.set(0,22,19,T.DOOR);
  for(var x=15;x<29;x++)d.set(0,x,12,T.WALL);d.set(0,18,12,T.DOOR);d.set(0,25,12,T.DOOR);stairs(d,0,16,10,0,2);stairs(d,0,27,10,0,2);
  room(d,0,3,9,14,19);wins(d,0,3,9,14,19,2);d.set(0,14,14,T.DOOR);d.set(0,8,19,T.DOOR);
  room(d,0,29,9,40,19);wins(d,0,29,9,40,19,2);d.set(0,29,14,T.DOOR);d.set(0,35,19,T.DOOR);
  room(d,1,14,6,29,19);wins(d,1,14,6,29,19,2);for(x=15;x<29;x++)d.set(1,x,12,T.WALL);d.set(1,21,12,T.DOOR);stairs(d,1,16,10,0,2);
  room(d,1,3,9,14,19);wins(d,1,3,9,14,19,2);d.set(1,14,14,T.DOOR);room(d,1,29,9,40,19);wins(d,1,29,9,40,19,2);d.set(1,29,14,T.DOOR);
  room(d,2,14,6,29,19);wins(d,2,14,6,29,19,2);
  fill(d,0,20,20,23,33,T.PATH);fill(d,0,6,23,17,29,T.POOL);fill(d,30,23,38,26,T.GARDEN);
  trees(d,[[1,1],[6,1],[11,1],[32,1],[37,1],[42,1],[1,31],[42,31],[27,24],[27,30],[33,29],[39,29],[1,22],[42,22]]);return d;},
 castle:function(){var d=new Design(42,42,5);d.roof='castle';fill(d,0,0,0,41,41,T.GARDEN);
  // moat ring
  for(var i=0;i<42;i++){for(var k=0;k<2;k++){d.set(0,i,1+k,T.POOL);d.set(0,i,39+k,T.POOL);d.set(0,1+k,i,T.POOL);d.set(0,39+k,i,T.POOL);}}
  fill(d,0,19,39,22,41,T.PATH);
  for(var f=0;f<3;f++){room(d,f,9,9,32,32);wins(d,f,9,9,32,32,3);if(f<2){for(var x=10;x<32;x++)d.set(f,x,20,T.WALL);d.set(f,15,20,T.DOOR);d.set(f,26,20,T.DOOR);}}
  d.set(0,20,32,T.DOOR);d.set(0,21,32,T.DOOR);stairs(d,0,12,14,0,2);stairs(d,1,29,14,0,2);
  var tw=[[5,5],[30,5],[5,30],[30,30]];tw.forEach(function(p){for(var f=0;f<5;f++){room(d,f,p[0],p[1],p[0]+6,p[1]+6);d.set(f,p[0]+3,p[1],T.WINDOW);d.set(f,p[0]+3,p[1]+6,T.WINDOW);d.set(f,p[0],p[1]+3,T.WINDOW);d.set(f,p[0]+6,p[1]+3,T.WINDOW);}});
  trees(d,[[6,15],[6,25],[35,15],[35,25],[15,36],[26,36]]);return d;}
};

/* ---------- voxel build ---------- */
// opts: {scale:N, base:mm, bold:bool, only:-1|floorIndex, plate:bool}
function build(d,o){
 o=o||{};var vs=250/(o.scale||200); // mm per voxel
 var onlyF=(o.only==null?-1:o.only);var nF=d.floors.length;
 var B=0;if(o.base>0&&onlyF<=0)B=Math.max(1,Math.round(o.base/vs));
 var X=d.W*SUB,Z=d.H*SUB,roofMax=16,Y=B+2+nF*STOREY+roofMax+4;
 var v=new Uint8Array(X*Y*Z);var idx=function(x,y,z){return (y*Z+z)*X+x;};
 function put(x,y,z,m){if(x<0||y<0||z<0||x>=X||y>=Y||z>=Z)return;v[idx(x,y,z)]=m;}
 function cell(cx,cz,y0,y1,m){for(var y=y0;y<=y1;y++)for(var a=0;a<SUB;a++)for(var b=0;b<SUB;b++)put(cx*SUB+a,y,cz*SUB+b,m);}
 var M={BASE:1,GRASS:2,WALL:3,ROOF:4,SLAB:5,LEAF:6,TRUNK:7,STAIR:8,POOLRIM:9,FRAME:10};
 var yoff=B; var fStart=0;
 if(onlyF>0){yoff=0;fStart=onlyF;}
 // base plate + ground
 if(B>0){for(var z=0;z<Z;z++)for(var x=0;x<X;x++)for(var y=0;y<B;y++)put(x,y,z,M.BASE);
  for(var cz=0;cz<d.H;cz++)for(var cx=0;cx<d.W;cx++){var t=d.get(0,cx,cz);
   if(t===T.POOL&&B>=2)cell(cx,cz,B-1,B-1,0);
   if(t===T.GARDEN)cell(cx,cz,B,B,M.GRASS);
   if(t===T.TREE){cell(cx,cz,B,B+4,M.TRUNK);for(var y=B+5;y<=B+8;y++)for(var a=-1;a<=SUB;a++)for(var bb=-1;bb<=SUB;bb++)put(cx*SUB+a,y,cz*SUB+bb,M.LEAF);cell(cx,cz,B+9,B+9,M.LEAF);}
  }}
 for(var f=0;f<nF;f++){
  if(onlyF>=0&&f!==onlyF)continue;
  var y0=yoff+(f-fStart)*STOREY;var A=d.floors[f],D=d.dirs[f];
  for(cz=0;cz<d.H;cz++)for(cx=0;cx<d.W;cx++){t=A[cz*d.W+cx];if(!BUILD(t))continue;
   var below=d.get(f-1,cx,cz);var stairwell=(below===T.STAIR)&&(onlyF<0)&&t===T.FLOOR;
   if(!stairwell)cell(cx,cz,y0,y0,M.SLAB);
   if(t===T.WALL)cell(cx,cz,y0+1,y0+11,M.WALL);
   else if(t===T.DOOR)cell(cx,cz,y0+9,y0+11,M.FRAME);
   else if(t===T.WINDOW){cell(cx,cz,y0+1,y0+3,M.WALL);cell(cx,cz,y0+9,y0+11,M.FRAME);}
   else if(t===T.STAIR){var dir=D[cz*d.W+cx];var dx=[0,1,0,-1][dir],dz=[-1,0,1,0][dir];var k=0,px=cx-dx,pz=cz-dz;while(d.get(f,px,pz)===T.STAIR&&D[pz*d.W+px]===dir&&k<4){k++;px-=dx;pz-=dz;}
    for(var s=0;s<SUB;s++){var h=Math.min(11,k*6+(s+1)*3);// along dir
     for(var w=0;w<SUB;w++){var sx,sz;if(dx!==0){sx=cx*SUB+(dx>0?s:SUB-1-s);sz=cz*SUB+w;}else{sz=cz*SUB+(dz>0?s:SUB-1-s);sx=cx*SUB+w;}for(y=y0+1;y<=y0+h;y++)put(sx,y,sz,M.STAIR);}}}
  }
  if(o.bold){ // thicken walls into adjacent room floor cells by one sub-voxel
   for(cz=0;cz<d.H;cz++)for(cx=0;cx<d.W;cx++){if(A[cz*d.W+cx]!==T.FLOOR)continue;var nb=[[1,0],[-1,0],[0,1],[0,-1]];
    nb.forEach(function(n){var tt=d.get(f,cx+n[0],cz+n[1]);if(tt!==T.WALL&&tt!==T.WINDOW)return;
     for(var a=0;a<SUB;a++){var sx=n[0]===0?cx*SUB+a:(n[0]>0?cx*SUB+SUB-1:cx*SUB),sz=n[1]===0?cz*SUB+a:(n[1]>0?cz*SUB+SUB-1:cz*SUB);
      for(var y=y0+1;y<=y0+11;y++){if(tt===T.WINDOW&&y>=y0+4&&y<=y0+8)continue;put(sx,y,sz,M.WALL);}}});}}
  // roof over cells not covered by the next storey
  var R=new Uint8Array(X*Z),any=false;
  for(cz=0;cz<d.H;cz++)for(cx=0;cx<d.W;cx++){if(!BUILD(A[cz*d.W+cx]))continue;var up=(onlyF>=0)?0:d.get(f+1,cx,cz);if(BUILD(up))continue;for(a=0;a<SUB;a++)for(bb=0;bb<SUB;bb++)R[(cz*SUB+bb)*X+cx*SUB+a]=1;any=true;}
  if(!any)continue;var yr=y0+12;
  for(var i=0;i<X*Z;i++)if(R[i])put(i%X,yr,(i/X|0),M.ROOF);
  var roof=d.roof;
  if(roof==='flat'||roof==='castle'){for(z=0;z<Z;z++)for(x=0;x<X;x++){if(!R[z*X+x])continue;var edge=!(x>0&&R[z*X+x-1]&&x<X-1&&R[z*X+x+1]&&z>0&&R[(z-1)*X+x]&&z<Z-1&&R[(z+1)*X+x]);if(!edge)continue;put(x,yr+1,z,M.ROOF);if(roof==='castle'){put(x,yr+2,z,M.ROOF);if(((x>>1)+(z>>1))%2===0){put(x,yr+3,z,M.ROOF);put(x,yr+4,z,M.ROOF);}}}}
  else { // hip or gable: distance transform inside region
   var dist=new Int16Array(X*Z);var bbx0=X,bbx1=0,bbz0=Z,bbz1=0;
   for(z=0;z<Z;z++)for(x=0;x<X;x++)if(R[z*X+x]){if(x<bbx0)bbx0=x;if(x>bbx1)bbx1=x;if(z<bbz0)bbz0=z;if(z>bbz1)bbz1=z;}
   var useX=true,useZ=true;if(roof==='gable'){if((bbx1-bbx0)>=(bbz1-bbz0))useX=false;else useZ=false;}
   for(z=0;z<Z;z++)for(x=0;x<X;x++){if(!R[z*X+x])continue;var dd=999,q;
    if(useX){for(q=x;q>=0&&R[z*X+q];q--);dd=Math.min(dd,x-q);for(q=x;q<X&&R[z*X+q];q++);dd=Math.min(dd,q-x);}
    if(useZ){for(q=z;q>=0&&R[q*X+x];q--);dd=Math.min(dd,z-q);for(q=z;q<Z&&R[q*X+x];q++);dd=Math.min(dd,q-z);}
    dist[z*X+x]=Math.min(dd,roofMax);}
   if(roof==='hip'){ // make it a true min over 2D neighbourhood (chamfer pass) so diagonal corners slope
    for(var it=0;it<2;it++){for(z=0;z<Z;z++)for(x=0;x<X;x++){i=z*X+x;if(!R[i])continue;var m=dist[i];if(x>0)m=Math.min(m,R[i-1]?dist[i-1]+1:1);if(z>0)m=Math.min(m,R[i-X]?dist[i-X]+1:1);dist[i]=m;}
     for(z=Z-1;z>=0;z--)for(x=X-1;x>=0;x--){i=z*X+x;if(!R[i])continue;m=dist[i];if(x<X-1)m=Math.min(m,R[i+1]?dist[i+1]+1:1);if(z<Z-1)m=Math.min(m,R[i+X]?dist[i+X]+1:1);dist[i]=m;}}}
   for(i=0;i<X*Z;i++){if(!R[i])continue;for(y=1;y<dist[i];y++)put(i%X,yr+y,(i/X|0),M.ROOF);}
  }
 }
 var voids=fillVoids(v,X,Y,Z);var fixes=fixManifold(v,X,Y,Z);voids+=fillVoids(v,X,Y,Z);
 return {v:v,X:X,Y:Y,Z:Z,vs:vs,B:B,M:M,fixes:fixes,voids:voids};
}

// Sealed hollow pockets (e.g. a closed-off room) are filled solid so the print is one clean shell.
function fillVoids(v,X,Y,Z){var n=X*Y*Z,seen=new Uint8Array(n),st=new Int32Array(n),sp=0;
 function push(i){if(!seen[i]&&!v[i]){seen[i]=1;st[sp++]=i;}}
 for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++){if(x===0||y===0||z===0||x===X-1||y===Y-1||z===Z-1)push((y*Z+z)*X+x);}
 while(sp){var i=st[--sp],x=i%X,z=((i/X)|0)%Z,y=(i/(X*Z))|0;if(x>0)push(i-1);if(x<X-1)push(i+1);if(z>0)push(i-X);if(z<Z-1)push(i+X);if(y>0)push(i-X*Z);if(y<Y-1)push(i+X*Z);}
 var c=0;for(i=0;i<n;i++)if(!v[i]&&!seen[i]){v[i]=5;c++;}return c;}
// Fill voxels so no two solids touch only along an edge or at a vertex (keeps the surface 2-manifold / watertight).
function fixManifold(v,X,Y,Z){var I=function(x,y,z){return (y*Z+z)*X+x;};var total=0;
 for(var pass=0;pass<6;pass++){var ch=0;
  for(var y=0;y<Y-1;y++)for(var z=0;z<Z-1;z++)for(var x=0;x<X-1;x++){
   var c=[v[I(x,y,z)]?1:0,v[I(x+1,y,z)]?1:0,v[I(x,y+1,z)]?1:0,v[I(x+1,y+1,z)]?1:0,v[I(x,y,z+1)]?1:0,v[I(x+1,y,z+1)]?1:0,v[I(x,y+1,z+1)]?1:0,v[I(x+1,y+1,z+1)]?1:0];
   var s=c[0]+c[1]+c[2]+c[3]+c[4]+c[5]+c[6]+c[7];if(s===0||s===8)continue;
   // 6 faces of the 2x2x2 block: [a,b,c,d] with a-d diagonal, b-c diagonal
   var faces=[[0,1,2,3],[4,5,6,7],[0,1,4,5],[2,3,6,7],[0,2,4,6],[1,3,5,7]];var bad=-1;
   for(var f=0;f<6;f++){var q=faces[f];if(c[q[0]]===c[q[3]]&&c[q[1]]===c[q[2]]&&c[q[0]]!==c[q[1]]){bad=c[q[0]]?q[1]:q[0];break;}}
   if(bad<0){ // vertex-only contact
    var pairs=[[0,7],[1,6],[2,5],[3,4]];for(var p=0;p<4;p++){var a=pairs[p][0],b=pairs[p][1];
     if(s===2&&c[a]&&c[b]){bad=(a===0?1:0);break;}if(s===6&&!c[a]&&!c[b]){bad=a;break;}}}
   if(bad>=0){var bx=x+(bad&1),by=y+((bad>>1)&1),bz=z+((bad>>2)&1);v[I(bx,by,bz)]=3;ch++;}
  }
  total+=ch;if(!ch)break;}
 return total;}

/* ---------- meshing ---------- */
// Returns indexed mesh in print coordinates (mm, Z up). Faces are only emitted between solid & empty voxels -> closed surface.
function mesh(g){var X=g.X,Y=g.Y,Z=g.Z,v=g.v,vs=g.vs;var VX=X+1,VY=Y+1,VZ=Z+1;
 var vid=new Int32Array(VX*VY*VZ).fill(-1);var pos=[],tri=[];
 var minY=Y,maxY=0;for(var y=0;y<Y;y++)for(var i=y*X*Z;i<(y+1)*X*Z;i++)if(v[i]){if(y<minY)minY=y;maxY=y;break;}
 var minX=X,maxX=-1,minZ=Z,maxZ=-1;
 function V(x,y,z){var k=(y*VZ+z)*VX+x;if(vid[k]<0){vid[k]=pos.length/3;pos.push(x,y,z);}return vid[k];}
 function solid(x,y,z){return x>=0&&y>=0&&z>=0&&x<X&&y<Y&&z<Z&&v[(y*Z+z)*X+x]>0;}
 function quad(a,b,c,d,n){ // ensure CCW when viewed from normal n (voxel coords)
  var A=[pos[a*3],pos[a*3+1],pos[a*3+2]],Bp=[pos[b*3],pos[b*3+1],pos[b*3+2]],C=[pos[c*3],pos[c*3+1],pos[c*3+2]];
  var u=[Bp[0]-A[0],Bp[1]-A[1],Bp[2]-A[2]],w=[C[0]-A[0],C[1]-A[1],C[2]-A[2]];var cr=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
  if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]>0)tri.push(a,b,c,a,c,d);else tri.push(a,c,b,a,d,c);}
 for(y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++){if(!v[(y*Z+z)*X+x])continue;
  if(x<minX)minX=x;if(x>maxX)maxX=x;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;
  if(!solid(x+1,y,z))quad(V(x+1,y,z),V(x+1,y+1,z),V(x+1,y+1,z+1),V(x+1,y,z+1),[1,0,0]);
  if(!solid(x-1,y,z))quad(V(x,y,z),V(x,y+1,z),V(x,y+1,z+1),V(x,y,z+1),[-1,0,0]);
  if(!solid(x,y+1,z))quad(V(x,y+1,z),V(x+1,y+1,z),V(x+1,y+1,z+1),V(x,y+1,z+1),[0,1,0]);
  if(!solid(x,y-1,z))quad(V(x,y,z),V(x+1,y,z),V(x+1,y,z+1),V(x,y,z+1),[0,-1,0]);
  if(!solid(x,y,z+1))quad(V(x,y,z+1),V(x+1,y,z+1),V(x+1,y+1,z+1),V(x,y+1,z+1),[0,0,1]);
  if(!solid(x,y,z-1))quad(V(x,y,z),V(x+1,y,z),V(x+1,y+1,z),V(x,y+1,z),[0,0,-1]);}
 // to print coords: (x, -z, y) is a proper rotation; translate to start at 0
 var P=new Float32Array(pos.length);for(i=0;i<pos.length;i+=3){P[i]=(pos[i]-minX)*vs;P[i+1]=(maxZ+1-pos[i+2])*vs;P[i+2]=(pos[i+1]-minY)*vs;}
 return {pos:P,tri:new Uint32Array(tri),size:[(maxX-minX+1)*vs,(maxZ-minZ+1)*vs,(maxY-minY+1)*vs],bounds:{minX:minX,maxX:maxX,minY:minY,maxY:maxY,minZ:minZ,maxZ:maxZ}};}

function stl(m){var n=m.tri.length/3;var buf=new ArrayBuffer(84+n*50),dv=new DataView(buf);var hdr='Coffeebreak House Maker STL (mm)';for(var i=0;i<hdr.length;i++)dv.setUint8(i,hdr.charCodeAt(i));dv.setUint32(80,n,true);var o=84,P=m.pos,Tr=m.tri;
 for(i=0;i<n;i++){var a=Tr[i*3]*3,b=Tr[i*3+1]*3,c=Tr[i*3+2]*3;var ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],wx=P[c]-P[a],wy=P[c+1]-P[a+1],wz=P[c+2]-P[a+2];var nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx,l=Math.hypot(nx,ny,nz)||1;
  dv.setFloat32(o,nx/l,true);dv.setFloat32(o+4,ny/l,true);dv.setFloat32(o+8,nz/l,true);o+=12;[a,b,c].forEach(function(k){dv.setFloat32(o,P[k],true);dv.setFloat32(o+4,P[k+1],true);dv.setFloat32(o+8,P[k+2],true);o+=12;});dv.setUint16(o,0,true);o+=2;}
 return buf;}

/* minimal ZIP (stored) for 3MF */
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
function threeMF(m,title){var P=m.pos,Tr=m.tri,s=[];s.push('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><metadata name="Title">'+(title||'Coffeebreak House')+'</metadata><metadata name="Designer">Coffeebreak House Maker</metadata><metadata name="Copyright">Karen O\'Brien (Coffeebreak). All rights reserved.</metadata><resources><object id="1" type="model"><mesh><vertices>');
 for(var i=0;i<P.length;i+=3)s.push('<vertex x="'+(+P[i].toFixed(4))+'" y="'+(+P[i+1].toFixed(4))+'" z="'+(+P[i+2].toFixed(4))+'"/>');
 s.push('</vertices><triangles>');for(i=0;i<Tr.length;i+=3)s.push('<triangle v1="'+Tr[i]+'" v2="'+Tr[i+1]+'" v3="'+Tr[i+2]+'"/>');
 s.push('</triangles></mesh></object></resources><build><item objectid="1"/></build></model>');
 return zip([{name:'[Content_Types].xml',data:'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'},
  {name:'_rels/.rels',data:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'},
  {name:'3D/3dmodel.model',data:s.join('')}]);}

/* ---------- basic slicer (voxel based) ---------- */
// s: {lh,w,fil,temp,bed,speed,infill,bedX,bedY,perims}
function slice(g,s,progress){var X=g.X,Y=g.Y,Z=g.Z,v=g.v,vs=g.vs;
 var minY=Y,maxY=-1,minX=X,maxX=-1,minZ=Z,maxZ=-1;for(var y=0;y<Y;y++)for(var z=0;z<Z;z++)for(var x=0;x<X;x++)if(v[(y*Z+z)*X+x]){if(y<minY)minY=y;if(y>maxY)maxY=y;if(x<minX)minX=x;if(x>maxX)maxX=x;if(z<minZ)minZ=z;if(z>maxZ)maxZ=z;}
 if(maxY<0)return null;
 var sx=(maxX-minX+1)*vs,sy=(maxZ-minZ+1)*vs,sz=(maxY-minY+1)*vs;var w=s.w,lh=s.lh;
 var offX=(s.bedX-sx)/2,offY=(s.bedY-sy)/2;var fits=offX>=2&&offY>=2;
 var k=Math.max(1,Math.round(vs/w)),p=vs/k; // fine pitch ~ line width
 var perims=vs>=4*w?2:1;var ero=perims; // fine cells to erode for infill
 var nx=(maxX-minX+1)*k,nz=(maxZ-minZ+1)*k;var sparseStep=Math.max(2,Math.round(100/Math.max(5,s.infill)));
 var ePerMM=w*lh/(Math.PI*Math.pow(s.fil/2,2));
 function at(x,y,z){return x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ&&y>=minY&&y<=maxY&&v[(y*Z+z)*X+x]>0;}
 function toXY(fx,fz){return [offX+fx*p,offY+(nz-fz)*p];} // fine coords -> bed mm (matches STL orientation)
 var cache={};
 function layerPaths(vy){if(cache[vy])return cache[vy];var loops=[],segX=[],segY=[];
  // perimeters: trace boundary loops of voxel region, interior on the left
  var edges={};function key(a,b){return a+','+b;}
  for(var z=minZ;z<=maxZ;z++)for(var x=minX;x<=maxX;x++){if(!at(x,vy,z))continue;var gx=x-minX,gz=z-minZ;
   if(!at(x,vy,z-1))edges[key(gx+1,gz)]=[gx,gz]; // top edge (in fine-y-down grid) direction -x... keep consistent ccw in grid coords
   if(!at(x+1,vy,z))edges[key(gx+1,gz+1)]=[gx+1,gz];
   if(!at(x,vy,z+1))edges[key(gx,gz+1)]=[gx+1,gz+1];
   if(!at(x-1,vy,z))edges[key(gx,gz)]=[gx,gz+1];}
  // edges map: start -> end
  var used={};for(var st in edges){if(used[st])continue;var loop=[],cur=st,guard=0;while(!used[cur]&&edges[cur]&&guard++<1e6){used[cur]=1;var a=cur.split(',').map(Number);loop.push(a);var e=edges[cur];cur=key(e[0],e[1]);}
   // remove collinear
   var L=[];for(var i=0;i<loop.length;i++){var pr=loop[(i-1+loop.length)%loop.length],c=loop[i],nx_=loop[(i+1)%loop.length];if((pr[0]===c[0]&&c[0]===nx_[0])||(pr[1]===c[1]&&c[1]===nx_[1]))continue;L.push(c);}
   if(L.length>=4)loops.push(L);}
  var per=[];for(var pi=0;pi<perims;pi++){var o=(pi+0.5)*w;loops.forEach(function(L){var out=[];for(var i=0;i<L.length;i++){var pr=L[(i-1+L.length)%L.length],c=L[i],nx_=L[(i+1)%L.length];
    var d1=[Math.sign(c[0]-pr[0]),Math.sign(c[1]-pr[1])],d2=[Math.sign(nx_[0]-c[0]),Math.sign(nx_[1]-c[1])];
    // interior side normal: computed in grid coords where edges were built with solid on the right of travel in (x,z); use inward = rotate dir by +90 in grid
    var n1=[d1[1],-d1[0]],n2=[d2[1],-d2[0]];var gx=c[0]*vs+o*(n1[0]+n2[0]),gz=c[1]*vs+o*(n1[1]+n2[1]);out.push([offX+gx,offY+(maxZ-minZ+1)*vs-gz]);}
   out.push(out[0]);per.push(out);});}
  // infill on fine grid
  var F=new Uint8Array(nx*nz),S=new Uint8Array(nx*nz);
  for(z=minZ;z<=maxZ;z++)for(x=minX;x<=maxX;x++){if(!at(x,vy,z))continue;var skin=!at(x,vy-1,z)||!at(x,vy+1,z)||!at(x,vy-2,z)&&vy-2>=minY;for(var a2=0;a2<k;a2++)for(var b2=0;b2<k;b2++){var ii=((z-minZ)*k+b2)*nx+(x-minX)*k+a2;F[ii]=1;S[ii]=skin?1:0;}}
  // erode F by ero cells (Chebyshev), separable
  var E=F;for(var r=0;r<ero;r++){var N=new Uint8Array(nx*nz);for(var fz=0;fz<nz;fz++)for(var fx=0;fx<nx;fx++){var j=fz*nx+fx;N[j]=E[j]&&fx>0&&fx<nx-1&&fz>0&&fz<nz-1&&E[j-1]&&E[j+1]&&E[j-nx]&&E[j+nx]&&E[j-nx-1]&&E[j-nx+1]&&E[j+nx-1]&&E[j+nx+1]?1:0;}E=N;}
  function runs(isX,out){var n1=isX?nz:nx,n2=isX?nx:nz;for(var r=0;r<n1;r++){var start=-1,mode=0;for(var q=0;q<=n2;q++){var j=isX?r*nx+q:q*nx+r;var on=q<n2&&E[j]&&(S[j]||r%sparseStep===0);var md=q<n2?S[j]:0;
     if(on&&start<0){start=q;mode=md;}else if(start>=0&&(!on||md!==mode)){var a,b;if(isX){a=toXY(start,r+0.5);b=toXY(q,r+0.5);}else{a=toXY(r+0.5,start);b=toXY(r+0.5,q);}if(Math.hypot(b[0]-a[0],b[1]-a[1])>w*0.6)out.push([a,b]);start=on?q:-1;mode=md;}}}}
  runs(true,segX);runs(false,segY);
  cache[vy]={per:per,segX:segX,segY:segY};return cache[vy];}
 var out=[],layers=[],len=0,E=0,lines=0;var fr=Math.round(s.speed*60),tr=9000;var lastX=null,lastY=null;
 out.push('; Coffeebreak House Maker basic slicer (experimental) - no supports, check in a real slicer if unsure');
 out.push('; size '+sx.toFixed(1)+' x '+sy.toFixed(1)+' x '+sz.toFixed(1)+' mm, layer '+lh+' mm, line '+w+' mm');
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
 var filM=E/1000,mins=len/s.speed/60+nL*0.05;
 return {gcode:out.join('\n')+'\n',layers:layers,size:[sx,sy,sz],fits:fits,perims:perims,minutes:mins,filamentM:filM,nLayers:nL,warn:vs<2*w?'Walls are thinner than two nozzle widths at this scale. Choose a bigger scale (e.g. 1:100) or bold walls.':''};}

G.CBHM={T:T,Design:Design,PRESETS:PRESETS,build:build,mesh:mesh,stl:stl,threeMF:threeMF,slice:slice,BUILD:BUILD,SUB:SUB,STOREY:STOREY};
})(typeof window!=='undefined'?window:globalThis);
