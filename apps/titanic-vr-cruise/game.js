(function(){
const W=CBWalk({speed:4}),{S,C,R,rig}=W;
S.background=new THREE.Color(0x0b1830);S.fog=new THREE.Fog(0x0b1830,40,260);
S.add(new THREE.HemisphereLight(0xdfe8ff,0x332211,0.8));const dl=new THREE.DirectionalLight(0xfff0d0,0.7);dl.position.set(30,80,20);S.add(dl);
const mats={};const M=c=>mats[c]||(mats[c]=new THREE.MeshLambertMaterial({color:c}));
const floors=[];
function box(w,h,d,x,y,z,c,fl){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);S.add(m);if(fl)floors.push(m);return m}
function cyl(r1,r2,h,x,y,z,c,seg){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||12),M(c));m.position.set(x,y,z);S.add(m);return m}
// sea + stars
const sea=new THREE.Mesh(new THREE.PlaneGeometry(1500,1500),M(0x0a2440));sea.rotation.x=-Math.PI/2;sea.position.y=-12;S.add(sea);
const sg=new THREE.BufferGeometry(),sp=[];for(let i=0;i<900;i++){const a=Math.random()*6.28,b=Math.random()*1.4;sp.push(Math.cos(a)*400*Math.cos(b),20+Math.sin(b)*400,Math.sin(a)*400*Math.cos(b))}sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));S.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.2})));
// hull: ship along x from -80 (stern) to +80 (bow). interior deck y=0, boat deck y=8
box(164,12,22,0,-6.1,0,0x111111);box(164,1.2,22.2,0,-11.4,0,0x7a1f12);box(164,.25,22.4,0,-.4,0,0xffffff);
box(160,.2,20,0,-.1,0,0x8a6a45,1);// interior floor
box(160,8,.3,0,4,10.1,0xf3eee2);box(160,8,.3,0,4,-10.1,0xf3eee2);box(.3,8,20,-80,4,0,0xf3eee2);box(.3,8,20,80,4,0,0xf3eee2);
// boat deck with opening above staircase (x -16..-4)
box(64,.3,20.4,-48,8,0,0xd8c7a0,1);box(84,.3,20.4,38,8,0,0xd8c7a0,1);box(12,.3,6,-10,8,-7.2,0xd8c7a0,1);box(12,.3,6,-10,8,7.2,0xd8c7a0,1);
for(const z of[-10.2,10.2])box(160,1,.1,0,8.6,z,0xffffff);
// room walls (with 4m doorways in the middle) at x
const walls=[-55,-30,-16,-4,22,40];const WALLC=[0x5a3a22,0xe8dcc0,0x6b4226,0x6b4226,0xe8dcc0,0xe8dcc0];
walls.forEach((x,i)=>{box(.3,8,8,x,4,6,WALLC[i]);box(.3,8,8,x,4,-6,WALLC[i]);box(.3,2,4,x,7,0,WALLC[i])});
// ENGINE ROOM (-80..-55)
box(25,7.9,19.6,-67.5,4,0,0x2a2a2a).material=new THREE.MeshLambertMaterial({color:0x2a2a2a,side:THREE.BackSide});
for(let i=0;i<3;i++){cyl(1.2,1.2,6,-74+i*7,3,-6,0x555555,8);cyl(1.2,1.2,6,-74+i*7,3,6,0x555555,8);box(1.5,.6,.6,-74+i*7,6,0,0x8a8a8a)}
for(let i=0;i<4;i++)cyl(.4,.4,10,-72+i*5,3,-3,0xb08040,6).rotation.z=Math.PI/2*0.0;
const crank=[];for(let i=0;i<3;i++){const c=box(3,.4,.4,-70+i*6,1.5,2,0xc0a060);crank.push(c)}
// DINING SALOON (-55..-30)
for(let i=0;i<4;i++)for(let j=-1;j<=1;j+=2){const x=-51+i*6,z=j*5;cyl(1.1,1.1,.1,x,.9,z,0xffffff,16);cyl(.15,.3,.85,x,.45,z,0x6b4226,6);for(let a=0;a<4;a++)box(.5,1,.5,x+Math.cos(a*1.57)*1.6,.5,z+Math.sin(a*1.57)*1.6,0x2e6b3a)}
for(let i=0;i<4;i++)box(.1,1.5,1,-54+i*7,4,9.9,0xfff6c0);
// GRAND STAIRCASE (-16..-4): steps from x=-15 (y0) to x=-5 (y8) between z -3..3
const N=17;for(let i=0;i<N;i++)box(11/N+.02,.5,6,-15+(i+.5)*11/N,(i+1)*8.15/N-.25,0,0x8a5a2e,1);
for(const z of[-3.1,3.1])for(let i=0;i<N;i+=2)cyl(.05,.05,1,-15+(i+.5)*10/N,(i+1)*8/N+.5,z,0x2b1a10,4);
box(12,.2,1.4,-10,1+.0,-4,0x8a5a2e);const dome=new THREE.Mesh(new THREE.SphereGeometry(5,16,8,0,6.29,0,1.2),new THREE.MeshLambertMaterial({color:0xcfe8ff,transparent:true,opacity:.5,side:THREE.DoubleSide}));dome.position.set(-10,8.3,0);S.add(dome);
box(1.6,2,.2,-10,3,-9.9,0x5a3a22);const clk=cyl(.5,.5,.1,-10,3.2,-9.75,0xf1c76a,16);clk.rotation.x=Math.PI/2;// Honour and Glory clock
// FIRST CLASS LOUNGE (-4..22)
for(let i=0;i<5;i++){box(2,.8,1,0+i*4.5,.4,-6,0x2e5a3a);box(2,1,.3,0+i*4.5,.9,-6.6,0x2e5a3a);box(1.2,.6,1.2,0+i*4.5,.3,-4.3,0x6b4226)}
box(2,4,.4,9,2,9.8,0x8a5a2e);box(1.5,1.2,.1,9,3.2,9.55,0xffeeaa);// fireplace & mirror
const chand=cyl(1,.4,.6,9,7,0,0xfff0a0,8);
// CABIN (22..40)
box(3,.6,1.8,30,.3,-8,0xffffff);box(3,.2,1.8,30,.65,-8,0x2e4a7a);box(1.4,2,.6,36,1,-9.5,0x6b4226);cyl(.4,.4,.1,26,2,9.9,0xddeeff,12).rotation.x=Math.PI/2;box(1,1.6,.1,33,1.3,9.9,0x5a3a22);
// interior beyond cabin is crew area, blocked visually
// BOAT DECK: funnels, lifeboats, bridge
[-45,-25,10,32].forEach((x,i)=>{const f=cyl(2.4,2.4,16,x,16,0,0xd08a30,14);f.rotation.z=-.08;cyl(2.45,2.45,3.5,x+.6,22.3,0,0x111111,14).rotation.z=-.08});
const boats=[];[-70,-62,-55,15,23,30,38,46].forEach(x=>{for(const z of[-8.8,8.8]){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(6,1,2),M(0xffffff));g.add(b);const k=new THREE.Mesh(new THREE.BoxGeometry(5.6,.15,1.6),M(0x8a5a2e));k.position.y=.5;g.add(k);g.position.set(x,9.5,z);S.add(g);boats.push(g);box(.2,3,.2,x-3,9.6,z,0x333333);box(.2,3,.2,x+3,9.6,z,0x333333)}});
box(10,3.5,20.4,66,9.8,0,0xf5f2ea);box(10.2,.6,20.6,66,11.6,0,0x6b4226);box(.4,1,.4,64,8.7,0,0x6b4226);const wheel=new THREE.Mesh(new THREE.TorusGeometry(.5,.06,6,16),M(0x8a5a2e));wheel.position.set(64,9.6,0);wheel.rotation.y=Math.PI/2;S.add(wheel);
box(.1,3.5,6,60.9,9.8,-7,0xf5f2ea);box(.1,3.5,6,60.9,9.8,7,0xf5f2ea);// bridge back walls, doorway in middle
box(.3,.3,3,63,9.2,4,0xc0a060);// telegraph
// masts
cyl(.4,.4,30,76,23,0,0xc8a070,6);cyl(.4,.4,30,-76,23,0,0xc8a070,6);
// iceberg in distance
const ice=new THREE.Mesh(new THREE.IcosahedronGeometry(14,0),new THREE.MeshLambertMaterial({color:0xeaf6ff}));ice.position.set(160,-4,60);S.add(ice);
// HOTSPOTS
const HS=[
['Engine Room',-68,1.5,0,'Titanic had two four-cylinder triple-expansion steam engines plus a low-pressure turbine, driving three propellers. Top speed was about 23 knots.'],
['Boiler Rooms',-60,1.5,-7,'29 boilers with 159 furnaces were fed by hand by about 170 firemen, stoking around 600 tons of coal a day.'],
['Dining Saloon',-42,1.5,0,'The First Class Dining Saloon on D Deck was the largest room afloat, seating over 500 diners in Jacobean-style white panelling.'],
['Grand Staircase',-12,1.5,-4.5,'The Grand Staircase had oak panelling and a wrought-iron and glass dome. The landing clock carving was called "Honour and Glory Crowning Time".'],
['First Class Lounge',8,1.5,0,'The lounge on A Deck was styled after the Palace of Versailles, with a fireplace, a large mirror and a chandelier.'],
['First Class Cabin',30,1.5,-4,'The finest parlour suites had private promenades. A First Class parlour suite cost over £800 one way, about A$100,000 today.'],
['Boat Deck',-5,9.5,6,'Titanic had 20 lifeboats for about 1,178 people, though 2,224 people were aboard. Lifeboat rules of 1912 were based on ship tonnage, not passengers.'],
['Lifeboats',20,9.5,-6,'The first lifeboat, No. 7, was lowered at about 12:45 am. Many left half full. About 710 people survived.'],
['Funnels',-30,9.5,4,'Titanic had four funnels. Only three released smoke; the fourth was mainly for ventilation and looks.'],
['Bridge',63,9.5,0,'At 11:40 pm on 14 April 1912, lookout Frederick Fleet saw the iceberg. First Officer Murdoch ordered "hard a-starboard" and full astern, but the ship struck on the starboard side.'],
['The Sinking',72,9.5,-6,'Titanic sank at 2:20 am on 15 April 1912. RMS Carpathia arrived about 4 am. More than 1,500 people lost their lives. We remember them.']];
const hsM=[];HS.forEach(h=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(.3),new THREE.MeshBasicMaterial({color:0xf1c76a}));m.position.set(h[1],h[2],h[3]);m.userData=h;S.add(m);hsM.push(m)});
// VR info panel
const cv=document.createElement('canvas');cv.width=1024;cv.height=400;const cx=cv.getContext('2d');const tex=new THREE.CanvasTexture(cv);
const panel=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.625),new THREE.MeshBasicMaterial({map:tex,transparent:true}));panel.visible=false;S.add(panel);
function drawPanel(h){cx.fillStyle='rgba(20,12,6,.92)';cx.fillRect(0,0,1024,400);cx.strokeStyle='#f1c76a';cx.lineWidth=8;cx.strokeRect(4,4,1016,392);cx.fillStyle='#f1c76a';cx.font='bold 48px Georgia';cx.fillText(h[0],30,70);cx.fillStyle='#fff7e8';cx.font='32px Georgia';let line='',y=130;for(const w of h[4].split(' ')){if(cx.measureText(line+w).width>960){cx.fillText(line,30,y);y+=42;line=''}line+=w+' '}cx.fillText(line,30,y);tex.needsUpdate=true}
// zones / teleports
const Z=[['Boat Deck',-5,8.2,6],['Grand Staircase',-17.5,0,0],['First Class Lounge',4,0,0],['Dining Saloon',-36,0,0],['Cabin',28,0,0],['Bridge',62,8.2,0],['Engine Room',-62,0,0]];
const tps=document.getElementById('tps');Z.forEach((z,i)=>{const b=document.createElement('button');b.className='tp';b.textContent=z[0];b.onclick=()=>tp(i);tps.appendChild(b)});
function tp(i){rig.position.set(Z[i][1],Z[i][2],Z[i][3])}
window.CB_TP=tp;tp(0);W.yaw=Math.PI/2;
function zoneName(p){if(p.y>4)return p.x>61?'Bridge':'Boat Deck';const x=p.x;return x<-55?'Engine Room':x<-30?'Dining Saloon':x<-16?'Reception Room':x<-4?'Grand Staircase':x<22?'First Class Lounge':x<40?'First Class Cabin':'Crew Passage'}
const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0);
function blocked(o,n){if(Math.abs(n.z)>9.4||Math.abs(n.x)>79.4)return true;if(n.y<4){for(const w of walls)if((o.x-w)*(n.x-w)<=0&&Math.abs(n.z)>1.9)return true;if(n.x>40)return true}else{for(const fx of[-45,-25,10,32])if(Math.hypot(n.x-fx,n.z)<2.8)return true;if(n.x>60.7&&o.x<=60.7&&Math.abs(n.z)>3.5)return true;if(n.x>70.5)return true}return false}
const clock=new THREE.Clock();let cur=null,t=0;const info=document.getElementById('info'),where=document.getElementById('where');
R.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);t+=dt;const mv=W.move(dt);const o=rig.position.clone(),n=o.clone();n.x+=mv.dx;n.z+=mv.dz;
 if(!blocked(o,n)){ray.set(new THREE.Vector3(n.x,n.y+.7,n.z),down);const hit=ray.intersectObjects(floors)[0];if(hit&&hit.point.y-o.y<.65){n.y=hit.point.y;rig.position.copy(n)}}
 // gravity snap
 ray.set(new THREE.Vector3(rig.position.x,rig.position.y+.6,rig.position.z),down);const g=ray.intersectObjects(floors)[0];if(g)rig.position.y+= (g.point.y-rig.position.y)*Math.min(1,dt*12);
 hsM.forEach(m=>{m.rotation.y+=dt*2;m.position.y=m.userData[2]+Math.sin(t*2)*.1});crank.forEach((c,i)=>c.rotation.x=t*3+i);
 const p=rig.position;let best=null,bd=3.2;hsM.forEach(m=>{const d=Math.hypot(m.position.x-p.x,m.position.z-p.z)+Math.abs(m.position.y-1.5-p.y)*.5;if(d<bd){bd=d;best=m}});
 if(best!==cur){cur=best;if(cur){info.innerHTML='<b>'+cur.userData[0]+'</b><br>'+cur.userData[4];info.style.display='block';drawPanel(cur.userData)}else info.style.display='none'}
 panel.visible=!!cur&&R.xr.isPresenting;if(panel.visible){panel.position.set(cur.position.x,cur.position.y+.9,cur.position.z);panel.lookAt(R.xr.getCamera(C).getWorldPosition(new THREE.Vector3()))}
 where.textContent=zoneName(p);R.render(S,C)});
window.CBVR={W,rig,tp,zoneName,get cur(){return cur}};
})();
