(function(){
const S=new THREE.Scene();S.background=new THREE.Color(0x87b5e0);S.fog=new THREE.Fog(0x87b5e0,60,320);
const R=new THREE.WebGLRenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));document.body.appendChild(R.domElement);
const C=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.1,600);
addEventListener('resize',()=>{C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});
S.add(new THREE.HemisphereLight(0xffffff,0x334455,0.9));const sun=new THREE.DirectionalLight(0xfff2d0,0.8);sun.position.set(50,100,30);S.add(sun);
const M=c=>new THREE.MeshLambertMaterial({color:c});
const solids=[];// AABB colliders {x0,x1,z0,z1,y0,y1}
function box(w,h,d,x,y,z,c,solid){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?M(c):c);m.position.set(x,y,z);S.add(m);if(solid)solids.push({x0:x-w/2,x1:x+w/2,y0:y-h/2,y1:y+h/2,z0:z-d/2,z1:z+d/2});return m}
// sea
const sea=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshLambertMaterial({color:0x1d4f7a}));sea.rotation.x=-Math.PI/2;sea.position.y=-12;S.add(sea);
// hull: ship along x, length 180, beam 24
const L=180,B=24;
box(L,12,B,0,-6,0,0x111111);box(L,1.5,B+0.2,0,-11.5,0,0x8a1c1c);box(L+0.2,0.6,B+0.3,0,-0.5,0,0xeeeeee);
// tapered bow
const bow=new THREE.Mesh(new THREE.CylinderGeometry(0.1,B/2,20,3,1),M(0x111111));bow.rotation.z=-Math.PI/2;bow.rotation.y=0;bow.scale.set(1,1,1);bow.position.set(L/2+10,-6,0);bow.rotation.x=Math.PI/2*0;S.add(bow);
// decks: boat deck (y=0 floor), promenade etc implemented as levels
const DECKS=[{n:'Boat Deck',y:0},{n:'A Deck – Promenade',y:-4},{n:'D Deck – Ballroom & Dining',y:-8}];
const wood=M(0xc9a26b),carpet=M(0x7a1f2b),white=M(0xf3efe6);
const GX=20;function floorHole(y,c,hz0,hz1,w0,w1){// floor with hole x GX-7..GX+7, z hz0..hz1, extent x w0..w1
 box((GX-7)-w0,0.3,B-2,(w0+GX-7)/2,y,0,c);box(w1-(GX+7),0.3,B-2,(GX+7+w1)/2,y,0,c);
 const zl=-(B-2)/2,zr=(B-2)/2;box(14,0.3,hz0-zl,GX,y,(zl+hz0)/2,c);box(14,0.3,zr-hz1,GX,y,(hz1+zr)/2,c)}
box(L,0.3,2,0,-0.15,-(B/2-1),wood);box(L,0.3,2,0,-0.15,B/2-1,wood);floorHole(-0.15,wood,-5,-0.2,-L/2,L/2);
// superstructure walls on boat deck
box(110,3.2,0.3,-5,1.6,-8,white,true);box(110,3.2,0.3,-5,1.6,8,white,true);box(0.3,3.2,16,-60,1.6,0,white,true);box(0.3,3.2,6,50,1.6,-5,white,true);box(0.3,3.2,6,50,1.6,5,white,true);
box(110,0.3,16,-5,3.3,0,white);
// funnels
for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(3,3.2,18,20),M(0xd98b2b));f.position.set(40-i*30,12,0);S.add(f);const t=new THREE.Mesh(new THREE.CylinderGeometry(3.05,3.05,4,20),M(0x111111));t.position.set(40-i*30,19.5,0);S.add(t)}
// masts
box(0.6,30,0.6,80,15,0,0xcfb38a);box(0.6,26,0.6,-80,13,0,0xcfb38a);
// lifeboats + railings
for(let i=0;i<8;i++){for(const s of[-1,1]){box(7,1.4,2,40-i*13,0.9,s*10.5,white,true);box(7,0.3,2.1,40-i*13,1.6,s*10.5,0x8b5a2b)}}
for(const s of[-1,1])box(L,1,0.15,0,0.5,s*(B/2-0.2),0xdddddd,true);
box(0.15,1,B,L/2,0.5,0,0xdddddd,true);box(0.15,1,B,-L/2,0.5,0,0xdddddd,true);
// bridge
box(8,3,14,64,1.5,0,white,true);box(8.2,0.8,14.2,64,2.4,0,0x223344);
// ===== interior: grand staircase well at x=20 connecting decks =====
for(const sd of[-1,1]){box(130,8,0.3,-5,-4.1,sd*(B/2-0.6),M(0xe9dcc0));}box(0.3,8,B,-70,-4.1,0,M(0xe9dcc0),true);box(0.3,8,B,60,-4.1,0,M(0xe9dcc0),true);
// A deck floor (promenade) and D deck floor
floorHole(-4.15,carpet,0.2,5,-65,55);box(120,0.3,B-2,-5,-8.15,0,M(0xe8dcc0));
// cut stair hole visually: dome
const dome=new THREE.Mesh(new THREE.SphereGeometry(5,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xddeeff,transparent:true,opacity:0.7,side:THREE.DoubleSide}));dome.position.set(GX,3.3,0);S.add(dome);
// staircase steps (ramps): boat deck -> A deck -> D deck
function stairs(x0,y0,y1,dir,zc){const n=16;for(let i=0;i<n;i++){const y=y0-(y0-y1)*(i+1)/n;box(0.8,0.25,4.6,x0+dir*i*0.8,y,zc,0x6b3e1e)}
 for(const s of[-1,1])box(n*0.8,1,0.15,x0+dir*n*0.4-dir*0.4,(y0+y1)/2+0.6,zc+s*2.35,0xc8a040)}
stairs(GX-6,-0.1,-4.1,1,-2.6);stairs(GX+6,-4.1,-8.1,-1,2.6);
// cherub statue & clock
box(0.6,1.4,0.6,GX-7,-3.3,0,0xb08d57);box(2,2,0.2,GX,-2.5,-3.2,0x6b3e1e);const clk=new THREE.Mesh(new THREE.CircleGeometry(0.6,24),M(0xf5e8c8));clk.position.set(GX,-2.3,-3.08);S.add(clk);
// openings in boat deck floor near stairs: we just allow walking; floor function below
// Ballroom on D deck x -50..-10
box(40,0.05,18,-30,-7.95,0,new THREE.MeshLambertMaterial({color:0xf0e6d0}));
for(let i=0;i<5;i++)for(let j=0;j<3;j++){const ch=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,8),new THREE.MeshBasicMaterial({color:0xfff3b0}));ch.position.set(-46+i*8,-4.8,-6+j*6);S.add(ch);const pl=new THREE.PointLight(0xffe7a0,0.6,12);pl.position.copy(ch.position);S.add(pl)}
for(let i=0;i<6;i++)for(const s of[-1,1])box(0.6,4,0.6,-48+i*7,-6,s*8,0xe9dcc0,true);
// tables in dining saloon x 0..40 D deck
for(let i=0;i<5;i++)for(let j=-1;j<=1;j++){if(Math.abs(i*7+5-GX)<5&&j==0)continue;box(1.6,0.1,1.6,i*7+5,-7.2,j*6,white,true);box(0.2,0.8,0.2,i*7+5,-7.7,j*6,0x5a3a1a)}
// piano on ballroom stage
box(3,1.2,1.5,-12,-7.4,6,0x111111,true);
// A deck promenade windows
for(let i=0;i<20;i++)for(const s of[-1,1])box(3,1.5,0.1,-60+i*6,-2.5,s*(B/2-0.9),new THREE.MeshLambertMaterial({color:0x9cc8ee,transparent:true,opacity:0.5}));
// iceberg in distance (just scenery)
const ice=new THREE.Mesh(new THREE.ConeGeometry(25,40,7),M(0xeaf6ff));ice.position.set(260,5,-120);S.add(ice);
// logo flag on mast
const logoTex=new THREE.TextureLoader().load('cb-logo.jpg');const flag=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshBasicMaterial({map:logoTex,side:THREE.DoubleSide}));flag.position.set(-80,24,3.2);S.add(flag);
const logoWall=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:logoTex}));logoWall.position.set(-49.8,-5.5,0);logoWall.rotation.y=Math.PI/2;S.add(logoWall);
// ===== player =====
const P={x:84,z:-9,y:0,yaw:Math.PI/2-0.25,pitch:0.12,vy:0};
function floorAt(x,z,y){// return floor height under player given current y
 if(z>-4.9&&z<-0.3&&x>GX-6.4&&x<GX+6.8&&y>-4.6&&y<0.8){const t=Math.min(1,Math.max(0,(x-(GX-6.4))/12.8));return -0.1-4*t+0.0}
 if(z>0.3&&z<4.9&&x>GX-6.8&&x<GX+6.4&&y<=-3.4&&y>-8.6){const t=Math.min(1,Math.max(0,((GX+6.4)-x)/12.8));return -4.1-4*t}
 if(y>-2)return 0; if(y>-6)return -4; return -8}
function blocked(x,z,y){if(Math.abs(z)>B/2-0.6||Math.abs(x)>L/2-0.6)return true;
 for(const b of solids){if(x>b.x0-0.3&&x<b.x1+0.3&&z>b.z0-0.3&&z<b.z1+0.3&&y+0.2<b.y1&&y+1.6>b.y0)return true}return false}
const keys={};addEventListener('keydown',e=>keys[e.code]=true);addEventListener('keyup',e=>keys[e.code]=false);
R.domElement.addEventListener('click',()=>{if(!matchMedia('(pointer:coarse)').matches)R.domElement.requestPointerLock()});
addEventListener('mousemove',e=>{if(document.pointerLockElement){P.yaw-=e.movementX*0.0025;P.pitch=Math.max(-1.4,Math.min(1.4,P.pitch-e.movementY*0.0025))}});
// touch: left half joystick, right half look
let tj=null,tl=null,jx=0,jy=0;
R.domElement.addEventListener('touchstart',e=>{for(const t of e.changedTouches){if(t.clientX<innerWidth/2)tj={id:t.identifier,x:t.clientX,y:t.clientY};else tl={id:t.identifier,x:t.clientX,y:t.clientY}}},{passive:true});
R.domElement.addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(tj&&t.identifier==tj.id){jx=(t.clientX-tj.x)/60;jy=(t.clientY-tj.y)/60}if(tl&&t.identifier==tl.id){P.yaw-=(t.clientX-tl.x)*0.005;P.pitch=Math.max(-1.4,Math.min(1.4,P.pitch-(t.clientY-tl.y)*0.005));tl.x=t.clientX;tl.y=t.clientY}}},{passive:true});
R.domElement.addEventListener('touchend',e=>{for(const t of e.changedTouches){if(tj&&t.identifier==tj.id){tj=null;jx=jy=0}if(tl&&t.identifier==tl.id)tl=null}},{passive:true});
const PLACES=[['Grand Staircase',GX,-6,-4,6],['Ballroom',-30,-8,-50,-10],['First Class Dining Saloon',20,-8,0,40],['Bridge',64,0,59,69],['Promenade (A Deck)',0,-4,-60,60],['Boat Deck',0,0,-90,90]];
const hud=document.getElementById('where'),found=new Set();let t0=performance.now();
function where(){for(const p of PLACES){if(Math.abs(P.y-p[2])<1.6&&P.x>p[3]&&P.x<p[4]){if(p[0]=='Grand Staircase'&&Math.abs(P.z)>5)continue;return p[0]}}return 'On board'}
window.CB_TP=(i)=>{const d=[[60,0,0],[GX+8,-2.6,-4],[-30,0,-8],[15,0,-8],[72,0,0]][i];P.x=d[0];P.z=d[1];P.y=d[2]};
function loop(now){const dt=Math.min(0.05,(now-t0)/1000);t0=now;
 let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-jy,s=(keys.KeyD?1:0)-(keys.KeyA?1:0)+jx;
 if(keys.ArrowLeft)P.yaw+=1.8*dt;if(keys.ArrowRight)P.yaw-=1.8*dt;
 const sp=(keys.ShiftLeft?9:5)*dt,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
 const nx=P.x+(fx*f+(-fz)*-s*-1*0+Math.cos(P.yaw)*s)*sp,nz=P.z+(fz*f-Math.sin(P.yaw)*s)*sp;
 if(!blocked(nx,P.z,P.y))P.x=nx;if(!blocked(P.x,nz,P.y))P.z=nz;
 const fl=floorAt(P.x,P.z,P.y);if(P.y>fl+0.05){P.vy-=20*dt;P.y=Math.max(fl,P.y+P.vy*dt)}else{P.y=fl;P.vy=0}
 C.position.set(P.x,P.y+1.6,P.z);C.rotation.set(0,0,0);C.rotateY(P.yaw);C.rotateX(P.pitch);
 const w=where();if(hud.textContent!==w){hud.textContent=w;if(w!='On board'&&!found.has(w)){found.add(w);document.getElementById('found').textContent=found.size+'/'+PLACES.length+' places explored'}}
 sea.position.y=-12+Math.sin(now/1500)*0.15;R.render(S,C);requestAnimationFrame(loop)}
var h=location.hash.match(/tp(\d)/);if(h)CB_TP(+h[1]);
requestAnimationFrame(loop);
})();
