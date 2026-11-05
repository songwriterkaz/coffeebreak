const W=CBWalk({noLock:true,speed:3});const {R,S,C,rig}=W;
S.background=new THREE.Color(0x1a0f08);R.outputEncoding=THREE.sRGBEncoding;
const L=new THREE.TextureLoader();
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7},o));
const GOLD=M(0xc9a24a,{metalness:.8,roughness:.3}),ESP=M(0x3b2414),CAR=M(0xa8693a);
const RW=12,RD=16,RH=4.2;
function box(w,h,d,m,x,y,z){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);S.add(b);return b}
// floor (caramel boards via canvas), ceiling, walls
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t}
const floorT=canvasTex(512,512,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#8a5530':'#7a4826';g.fillRect(0,i*64,w,64);g.fillStyle='#4a2a14';g.fillRect(0,i*64,w,2)}});floorT.wrapS=floorT.wrapT=THREE.RepeatWrapping;floorT.repeat.set(3,4);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(RW,RD),M(0xffffff,{map:floorT,roughness:.5}));fl.rotation.x=-Math.PI/2;S.add(fl);
const ce=new THREE.Mesh(new THREE.PlaneGeometry(RW,RD),M(0x5a3820));ce.rotation.x=Math.PI/2;ce.position.y=RH;S.add(ce);
box(RW,RH,.2,ESP,0,RH/2,-RD/2);box(RW,RH,.2,ESP,0,RH/2,RD/2);box(.2,RH,RD,ESP,-RW/2,RH/2,0);box(.2,RH,RD,ESP,RW/2,RH/2,0);
// gold trims + caramel wainscot
[[0,-RD/2+.11,RW,0],[0,RD/2-.11,RW,0]].forEach(([x,z,w])=>{box(w,.06,.04,GOLD,x,RH-.3,z);box(w,.9,.03,CAR,x,.45,z);box(w,.04,.05,GOLD,x,.92,z)});
[-RW/2+.11,RW/2-.11].forEach(x=>{box(.04,.06,RD,GOLD,x,RH-.3,0);box(.03,.9,RD,CAR,x,.45,0);box(.05,.04,RD,GOLD,x,.92,0)});
// bench in middle
box(2.4,.12,.6,CAR,0,.45,0);box(.1,.45,.5,GOLD,-1,.22,0);box(.1,.45,.5,GOLD,1,.22,0);
// lights
S.add(new THREE.HemisphereLight(0xffe8c8,0x3b2414,.9));
// slots: 3 on each long wall + 2 on far wall
const slots=[];[-4.5,0,4.5].forEach(z=>{slots.push({x:-RW/2+.15,z,ry:Math.PI/2});slots.push({x:RW/2-.15,z,ry:-Math.PI/2})});
slots.push({x:-3,z:-RD/2+.15,ry:0},{x:3,z:-RD/2+.15,ry:0},{x:-3.6,z:RD/2-.15,ry:Math.PI});
slots.sort((a,b)=>a.z-b.z||a.x-b.x);
const clickables=[];
function label(text,sub,w=1.6){const t=canvasTex(512,160,(g)=>{g.fillStyle='#2a180c';g.fillRect(0,0,512,160);g.strokeStyle='#c9a24a';g.lineWidth=6;g.strokeRect(4,4,504,152);g.fillStyle='#e9c46a';g.textAlign='center';g.font='bold 40px Georgia';g.fillText(text,256,66);g.fillStyle='#f6e7c8';g.font='italic 28px Georgia';g.fillText(sub||'',256,116)});return new THREE.Mesh(new THREE.PlaneGeometry(w,w*160/512),new THREE.MeshBasicMaterial({map:t}))}
slots.forEach((s,i)=>{const p=PHOTOS[i];const g=new THREE.Group();g.position.set(s.x,0,s.z);g.rotation.y=s.ry;S.add(g);
 const fw=1.5,fh=2.0;const fr=new THREE.Mesh(new THREE.BoxGeometry(fw+.16,fh+.16,.06),GOLD);fr.position.set(0,2.2,0);g.add(fr);
 const pic=new THREE.Mesh(new THREE.PlaneGeometry(fw,fh),new THREE.MeshBasicMaterial({color:0x4a2f1c}));pic.position.set(0,2.2,.04);g.add(pic);
 let lab;
 if(p){L.load(p.src,t=>{t.encoding=THREE.sRGBEncoding;const a=t.image.width/t.image.height;let w=fw,h=fw/a;if(h>fh){h=fh;w=fh*a}pic.geometry=new THREE.PlaneGeometry(w,h);pic.material=new THREE.MeshBasicMaterial({map:t});});pic.userData.photo=p;clickables.push(pic);lab=label(p.title,p.caption)}
 else{const t=canvasTex(256,340,(c)=>{c.fillStyle='#4a2f1c';c.fillRect(0,0,256,340);c.fillStyle='#c9a24a';c.textAlign='center';c.font='italic 30px Georgia';c.fillText('More',128,150);c.fillText('coming soon',128,190)});pic.material=new THREE.MeshBasicMaterial({map:t});lab=label('More coming soon','New photos on the way')}
 lab.position.set(0,.85,.03);g.add(lab);
 const sp=new THREE.SpotLight(0xffe2b0,1.3,7,.5,.6);sp.position.set(0,RH-.2,1.6);sp.target=fr;g.add(sp);g.add(sp.target);
});
// plaque on near (entrance) wall facing in, and logo
const plq=canvasTex(1024,640,(g)=>{g.fillStyle='#2a180c';g.fillRect(0,0,1024,640);g.strokeStyle='#c9a24a';g.lineWidth=12;g.strokeRect(10,10,1004,620);g.textAlign='center';g.fillStyle='#e9c46a';g.font='bold 92px Georgia';g.fillText("Karen O'Brien",512,200);g.fillStyle='#f6e7c8';g.font='italic 48px Georgia';g.fillText('Model · Songwriter · Coffeebreak',512,290);g.font='40px Georgia';g.fillText('Newcastle NSW',512,390);g.fillStyle='#e9c46a';g.fillText('songwriterkaz@gmail.com',512,470);g.fillStyle='#c9a24a';g.font='28px Georgia';g.fillText('Model Portfolio · VR Gallery',512,560)});
const pm=new THREE.Mesh(new THREE.PlaneGeometry(3.2,2),new THREE.MeshBasicMaterial({map:plq}));pm.position.set(0,2.1,RD/2-.12);pm.rotation.y=Math.PI;S.add(pm);
// welcome plaque on far wall centre + logo
const wm=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5),new THREE.MeshBasicMaterial({map:plq}));wm.position.set(0,2.45,-RD/2+.15);S.add(wm);
L.load('logo.png',t=>{t.encoding=THREE.sRGBEncoding;const a=t.image.width/t.image.height;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1*a,1.1),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(0,1.05,-RD/2+.13);S.add(m);const m2=m.clone();m2.position.set(0,.6,RD/2-.13);m2.rotation.y=Math.PI;m2.scale.set(.6,.6,1);S.add(m2)});
// start position
rig.position.set(0,0,1.5);W.yaw=0;
// drag look (desktop), click to open photo
let dn=null,moved=0;const rc=new THREE.Raycaster();
R.domElement.addEventListener('mousedown',e=>{dn={x:e.clientX,y:e.clientY};moved=0});
addEventListener('mousemove',e=>{if(!dn)return;const dx=e.clientX-dn.x;moved+=Math.abs(dx)+Math.abs(e.clientY-dn.y);W.yaw=W.yaw-dx*.004;dn={x:e.clientX,y:e.clientY}});
addEventListener('mouseup',e=>{if(dn&&moved<6)pick(e.clientX,e.clientY);dn=null});
R.domElement.addEventListener('touchend',e=>{const t=e.changedTouches[0];if(t&&t.clientX>innerWidth*.35)pick(t.clientX,t.clientY)});
function pick(x,y){rc.setFromCamera({x:x/innerWidth*2-1,y:-(y/innerHeight)*2+1},C);const h=rc.intersectObjects(clickables)[0];if(h&&h.distance<9)openLB(h.object.userData.photo)}
function openLB(p){if(R.xr.isPresenting){vrBig(p);return}lbi.src=p.src;lbc.textContent=p.title+' — '+p.caption;lb.style.display='flex'}
window.closeLB=()=>{lb.style.display='none'};addEventListener('keydown',e=>{if(e.code==='Escape')closeLB()});
// VR: trigger points at a photo -> show big in front
let big=null;function vrBig(p){if(big){rig.remove(big);big=null;return}L.load(p.src,t=>{t.encoding=THREE.sRGBEncoding;const a=t.image.width/t.image.height;big=new THREE.Mesh(new THREE.PlaneGeometry(1.6*a,1.6),new THREE.MeshBasicMaterial({map:t}));big.position.set(0,1.6,-1.6);rig.add(big)})}
W.ctrl.forEach(c=>c.addEventListener('select',()=>{if(big){rig.remove(big);big=null;return}const m=new THREE.Matrix4().extractRotation(c.matrixWorld);rc.ray.origin.setFromMatrixPosition(c.matrixWorld);rc.ray.direction.set(0,0,-1).applyMatrix4(m);const h=rc.intersectObjects(clickables)[0];if(h)vrBig(h.object.userData.photo)}));
const clk=new THREE.Clock();
R.setAnimationLoop(()=>{const dt=Math.min(clk.getDelta(),.05);const d=W.move(dt);rig.position.x=Math.max(-RW/2+.6,Math.min(RW/2-.6,rig.position.x+d.dx));rig.position.z=Math.max(-RD/2+.6,Math.min(RD/2-.6,rig.position.z+d.dz));if(Math.abs(rig.position.x)<1.5&&Math.abs(rig.position.z)<.6)rig.position.z=Math.sign(rig.position.z||1)*.6;R.render(S,C)});
