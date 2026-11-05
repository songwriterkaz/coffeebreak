/* Coffeebreak Life-Size 3D Print Studio models: houses, dresses/fabric, animals, boats.
   (c) Karen O'Brien (Coffeebreak). All rights reserved. */
(function(G){
'use strict';
var C=G.CBLS;

/* ---- Houses: reuse House Maker voxel build, remapped to real-world mm ----
   House Maker uses vs = 250/scale mm per sub-voxel (0.25 m at scale 1).
   For life-size studio we treat "lifeScale" as a fraction of full size (1 = life size).
   At lifeScale 1, walls are thick; user usually prints at 0.05–0.25 for assembleable kits.
*/
function houseGrid(opts){
 opts=opts||{};
 var HM=G.CBHM; if(!HM) throw new Error('House Maker core missing');
 var preset=opts.preset||'cottage';
 var design=opts.design||(preset==='blank'?new HM.Design(16,14,1):HM.PRESETS[preset]());
 var lifeScale=opts.lifeScale!=null?opts.lifeScale:0.1; // 10% of life size default
 // House Maker scale N means 1:N. We want physical size = life / N_effective.
 // At HM scale=1, vs=250mm and cell=0.5m → true life size for the plan.
 // lifeScale 0.1 → use HM scale = 1/0.1 = 10.
 var hmScale=Math.max(1,Math.round(1/Math.max(0.01,lifeScale)));
 var g=HM.build(design,{scale:hmScale,base:opts.base!=null?opts.base:2,bold:!!opts.bold});
 // HM build already returns {v,X,Y,Z,vs,...} compatible with CBLS
 return {grid:g, design:design, hmScale:hmScale, lifeScale:lifeScale, kind:'house', name:preset};
}

/* ---- Dresses & fabric: wearable chainmail / lattice sized to body (mm) ---- */
function dressGrid(opts){
 opts=opts||{};
 var bust=(opts.bust||900); // mm circumference
 var waist=(opts.waist||700);
 var hips=(opts.hips||950);
 var length=(opts.length||900); // shoulder to hem
 var sleeve=(opts.sleeve||0); // 0 = sleeveless
 var style=opts.style||'chainmail'; // chainmail | diamond | hex
 var thick=Math.max(2,opts.thickness||3); // strut thickness mm
 var pitch=Math.max(6,opts.pitch||10); // lattice pitch mm
 var vs=Math.max(1,Math.min(3,opts.vs||2)); // voxel size mm

 // Approximate body as stacked ellipses; generate lattice shell
 var rB=bust/(2*Math.PI), rW=waist/(2*Math.PI), rH=hips/(2*Math.PI);
 var pad=Math.ceil(20/vs);
 var maxR=Math.max(rB,rW,rH)+thick+10;
 var X=Math.ceil(2*maxR/vs)+pad*2;
 var Z=X;
 var Y=Math.ceil(length/vs)+pad*2;
 var g=C.makeGrid(X,Y,Z,vs);
 var cx=(X-1)/2, cz=(Z-1)/2;

 function radiusAt(yNorm){
  // yNorm 0 at shoulder, 1 at hem. Bust near 0.15, waist 0.4, hips 0.65
  if(yNorm<0.15){var t=yNorm/0.15;return rB*(0.85+0.15*t);}
  if(yNorm<0.4){t=(yNorm-0.15)/0.25;return rB+(rW-rB)*t;}
  if(yNorm<0.65){t=(yNorm-0.4)/0.25;return rW+(rH-rW)*t;}
  t=(yNorm-0.65)/0.35;return rH+(rH*1.05-rH)*t;
 }

 var y0=pad, y1=pad+Math.floor(length/vs);
 var pV=Math.max(2,Math.round(pitch/vs));
 var tV=Math.max(1,Math.round(thick/vs));

 for(var y=y0;y<=y1;y++){
  var yNorm=(y-y0)/(y1-y0||1);
  var R=radiusAt(yNorm)/vs;
  // neck opening near top
  var neck=yNorm<0.08?(R*0.35):0;
  for(var z=0;z<Z;z++)for(var x=0;x<X;x++){
   var dx=x-cx, dz=z-cz, rr=Math.sqrt(dx*dx+dz*dz);
   if(rr<neck)continue;
   var onShell=Math.abs(rr-R)<=tV+0.6;
   if(!onShell)continue;
   // lattice pattern
   var ang=Math.atan2(dz,dx);
   var aCell=Math.round((ang+Math.PI)/(2*Math.PI)*Math.max(8,Math.round(2*Math.PI*R/pV)));
   var yCell=Math.floor((y-y0)/pV);
   var keep=false;
   if(style==='diamond'){
    keep=((aCell+yCell)%2===0)||(Math.abs(rr-R)<tV*0.5);
   } else if(style==='hex'){
    keep=((aCell%3)!==1)||((yCell%2)===0&&(aCell%3)===0)||(Math.abs(rr-R)<tV*0.4);
   } else { // chainmail: rings = denser horizontal + vertical bands
    var ringY=((y-y0)%pV)<tV || ((y-y0)%pV)>(pV-tV-1);
    var ringA=(Math.abs((ang*R)%pV)<tV+0.5);
    keep=ringY||ringA||(Math.abs(rr-R)<tV*0.35);
   }
   if(keep)C.put(g,x,y,z,2);
  }
 }

 // optional short sleeves
 if(sleeve>0){
  var sLen=Math.floor(sleeve/vs);
  var armY=y0+Math.floor((y1-y0)*0.12);
  var armR=Math.max(3,Math.round((rB*0.22)/vs));
  [[-1],[1]].forEach(function(side){
   var acx=cx+side[0]*Math.round(R*0.95);
   for(var i=0;i<sLen;i++){
    var ax=acx+side[0]*i;
    for(var zz=-armR-tV;zz<=armR+tV;zz++)for(var yy=-armR-tV;yy<=armR+tV;yy++){
     var d=Math.sqrt(zz*zz+yy*yy);
     if(Math.abs(d-armR)<=tV){
      var px=Math.round(ax),py=armY+yy,pz=Math.round(cz+zz);
      if((i%pV)<tV||(Math.atan2(zz,yy)*armR%pV)<tV)C.put(g,px,py,pz,3);
     }
    }
   }
  });
 }

 C.sealGrid(g);
 return {grid:g, kind:'dress', name:style, lifeMm:{bust:bust,waist:waist,hips:hips,length:length}};
}

/* ---- Animals: parametric low-poly life-size (mm), then voxelised ---- */
var ANIMAL_DIMS={
 // typical lengths / heights / widths in mm (approx adult)
 dog:{L:900,H:550,W:300,leg:280,neck:120,head:180,tail:250,ear:80},
 cat:{L:450,H:280,W:160,leg:140,neck:60,head:110,tail:280,ear:50},
 horse:{L:2200,H:1600,W:550,leg:900,neck:500,head:450,tail:600,ear:140},
 bird:{L:280,H:220,W:120,leg:60,neck:40,head:50,tail:80,ear:0,wing:200}
};

function animalGrid(opts){
 opts=opts||{};
 var kind=opts.animal||'dog';
 var D=ANIMAL_DIMS[kind]||ANIMAL_DIMS.dog;
 var lifeScale=opts.lifeScale!=null?opts.lifeScale:1;
 var vsTarget=opts.vs; // optional
 // Choose voxel size so model fits ~ memory (max dim ~ 200 voxels)
 var L=D.L*lifeScale,H=D.H*lifeScale,W=D.W*lifeScale;
 var maxDim=Math.max(L,H,W);
 var vs=vsTarget||Math.max(2,Math.min(20,Math.ceil(maxDim/160)));
 var pad=4;
 var X=Math.ceil(L/vs)+pad*2;
 var Y=Math.ceil(H/vs)+pad*2;
 var Z=Math.ceil(W/vs)+pad*2;
 var g=C.makeGrid(X,Y,Z,vs);
 var cx=X/2, cz=Z/2;

 function mm(v){return Math.round(v/vs);}

 if(kind==='bird'){
  // body
  C.fillEllipsoid(g,cx,pad+mm(D.leg*lifeScale)+mm(D.H*lifeScale*0.35),cz, mm(L*0.35),mm(H*0.28),mm(W*0.4),1);
  // head
  C.fillEllipsoid(g,cx+mm(L*0.28),pad+mm(D.leg*lifeScale)+mm(H*0.5),cz, mm(D.head*lifeScale*0.35),mm(D.head*lifeScale*0.3),mm(W*0.28),1);
  // beak
  C.fillEllipsoid(g,cx+mm(L*0.4),pad+mm(D.leg*lifeScale)+mm(H*0.48),cz, mm(30*lifeScale),mm(12*lifeScale),mm(10*lifeScale),4);
  // legs
  var footY=pad;
  C.fillCylY(g,cx-mm(20*lifeScale),cz, Math.max(1,mm(8*lifeScale)), footY, footY+mm(D.leg*lifeScale),2);
  C.fillCylY(g,cx+mm(10*lifeScale),cz, Math.max(1,mm(8*lifeScale)), footY, footY+mm(D.leg*lifeScale),2);
  // wings
  var wy=pad+mm(D.leg*lifeScale)+mm(H*0.4);
  C.fillEllipsoid(g,cx,wy,cz-mm(W*0.55), mm(D.wing*lifeScale*0.35),mm(20*lifeScale),mm(D.wing*lifeScale*0.55),3);
  C.fillEllipsoid(g,cx,wy,cz+mm(W*0.55), mm(D.wing*lifeScale*0.35),mm(20*lifeScale),mm(D.wing*lifeScale*0.55),3);
  // tail
  C.fillEllipsoid(g,cx-mm(L*0.3),wy,cz, mm(D.tail*lifeScale*0.35),mm(15*lifeScale),mm(25*lifeScale),3);
 } else {
  // quadruped: dog/cat/horse
  var belly=pad+mm(D.leg*lifeScale);
  var bodyH=mm(H*0.35);
  var bodyL=mm(L*0.45);
  var bodyW=mm(W*0.45);
  C.fillEllipsoid(g,cx,belly+bodyH*0.5,cz, bodyL, bodyH*0.55, bodyW,1);
  // neck + head
  var neckX=cx+bodyL*0.75;
  var neckH=mm(D.neck*lifeScale);
  C.fillCylY(g,neckX,cz, Math.max(2,mm(W*0.18)), belly+bodyH*0.4, belly+bodyH*0.4+neckH,1);
  var headR=mm(D.head*lifeScale*0.35);
  C.fillEllipsoid(g,neckX+mm(D.head*lifeScale*0.15), belly+bodyH*0.4+neckH, cz, headR*1.1, headR*0.85, headR*0.75,1);
  // snout
  C.fillEllipsoid(g,neckX+mm(D.head*lifeScale*0.45), belly+bodyH*0.4+neckH-mm(10*lifeScale), cz, headR*0.7, headR*0.4, headR*0.4,1);
  // ears
  if(D.ear){
   var ey=belly+bodyH*0.4+neckH+headR*0.5;
   C.fillEllipsoid(g,neckX,ey,cz-headR*0.6, mm(D.ear*lifeScale*0.2),mm(D.ear*lifeScale*0.45),mm(D.ear*lifeScale*0.15),3);
   C.fillEllipsoid(g,neckX,ey,cz+headR*0.6, mm(D.ear*lifeScale*0.2),mm(D.ear*lifeScale*0.45),mm(D.ear*lifeScale*0.15),3);
  }
  // legs
  var legR=Math.max(2,mm(W*0.12));
  var legs=[[-0.55,-0.55],[-0.55,0.55],[0.45,-0.55],[0.45,0.55]];
  legs.forEach(function(p){
   C.fillCylY(g, cx+bodyL*p[0], cz+bodyW*p[1], legR, pad, belly+mm(15*lifeScale),2);
   // paw
   C.fillEllipsoid(g, cx+bodyL*p[0], pad+legR*0.4, cz+bodyW*p[1], legR*1.3, legR*0.5, legR*1.1,2);
  });
  // tail
  C.fillEllipsoid(g, cx-bodyL*0.95, belly+bodyH*0.6, cz, mm(D.tail*lifeScale*0.35), mm(D.tail*lifeScale*0.12), mm(W*0.1),3);
 }

 C.sealGrid(g);
 return {grid:g, kind:'animal', name:kind, lifeScale:lifeScale, lifeMm:{L:L,H:H,W:W}};
}

/* ---- Boats: dinghy / kayak / small hull (mm) ---- */
var BOAT_DIMS={
 kayak:{L:3000,W:650,H:350,cockpit:450},
 dinghy:{L:2800,W:1400,H:500,cockpit:0},
 sailboat:{L:4000,W:1600,H:700,cockpit:800}
};

function boatGrid(opts){
 opts=opts||{};
 var kind=opts.boat||'kayak';
 var D=BOAT_DIMS[kind]||BOAT_DIMS.kayak;
 var lifeScale=opts.lifeScale!=null?opts.lifeScale:0.25;
 var L=D.L*lifeScale,W=D.W*lifeScale,H=D.H*lifeScale;
 var vs=opts.vs||Math.max(2,Math.min(15,Math.ceil(Math.max(L,W,H)/140)));
 var pad=3;
 var X=Math.ceil(L/vs)+pad*2;
 var Y=Math.ceil(H/vs)+pad*2;
 var Z=Math.ceil(W/vs)+pad*2;
 var g=C.makeGrid(X,Y,Z,vs);
 var cx=X/2, cz=Z/2;
 function mm(v){return v/vs;}

 var thick=Math.max(1,Math.round(6/vs)); // ~6 mm hull skin at full; scales with vs
 var yKeel=pad;
 var yGun=pad+Math.floor(mm(H));

 for(var y=yKeel;y<=yGun;y++){
  var yn=(y-yKeel)/(yGun-yKeel||1); // 0 keel → 1 gunwale
  for(var x=pad;x<X-pad;x++){
   var xn=(x-pad)/Math.max(1,X-2*pad-1); // 0 bow → 1 stern
   // waterline beam tapers at bow/stern
   var taper=Math.sin(Math.PI*Math.min(1,Math.max(0,xn))*1); // crude
   // better: pointed bow, wider mid, moderate stern
   var along=xn;
   var beamFactor;
   if(along<0.15)beamFactor=0.15+along/0.15*0.7;
   else if(along>0.85)beamFactor=0.85-(along-0.85)/0.15*0.25;
   else beamFactor=0.85+0.15*Math.sin((along-0.15)/0.7*Math.PI);
   // V-hull: width grows with height
   var half=mm(W/2)*beamFactor*(0.25+0.75*yn);
   var z0=cz-half, z1=cz+half;
   for(var z=Math.floor(z0);z<=Math.ceil(z1);z++){
    var zd=Math.abs(z-cz);
    var inside=zd<=half;
    if(!inside)continue;
    var shell=zd>=half-thick-0.5 || y<=yKeel+thick || y>=yGun-thick;
    // deck open for dinghy; kayak has deck with cockpit
    if(kind==='dinghy'){
     if(y>=yGun-thick){ /* gunwale ring */ if(zd>=half-thick*2)C.put(g,x,y,z,1); }
     else if(shell)C.put(g,x,y,z,1);
    } else {
     // kayak / sailboat: closed deck except cockpit
     var inCockpit=false;
     if(D.cockpit){
      var cL=mm(D.cockpit*lifeScale);
      var cMid=cx;
      inCockpit = y>yGun-thick*3 && Math.abs(x-cMid)<cL/2 && zd<half*0.55;
     }
     if(inCockpit)continue;
     if(shell || (y>=yGun-thick && !inCockpit))C.put(g,x,y,z,1);
    }
   }
  }
 }

 // thwart / seat for dinghy
 if(kind==='dinghy'){
  var seatY=pad+Math.floor(mm(H*0.55));
  C.fillBox(g, Math.floor(cx-mm(40*lifeScale)), seatY, Math.floor(cz-mm(W*0.35*lifeScale/lifeScale)), Math.floor(cx+mm(40*lifeScale)), seatY+Math.max(1,Math.round(8/vs)), Math.floor(cz+mm(W*0.35)), 2);
 }
 // simple keel strip
 C.fillBox(g, pad+2, yKeel, Math.floor(cz-1), X-pad-3, yKeel+thick, Math.floor(cz+1), 3);

 C.sealGrid(g);
 return {grid:g, kind:'boat', name:kind, lifeScale:lifeScale, lifeMm:{L:L,W:W,H:H}};
}

G.CBLS.models={
 house:houseGrid,
 dress:dressGrid,
 animal:animalGrid,
 boat:boatGrid,
 ANIMAL_DIMS:ANIMAL_DIMS,
 BOAT_DIMS:BOAT_DIMS
};
})(typeof window!=='undefined'?window:globalThis);
