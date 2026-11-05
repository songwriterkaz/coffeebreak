import * as THREE from './three.module.js';
import {VRButton} from './VRButton.js';
const $=i=>document.getElementById(i);
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.xr.enabled=true;$('stage').appendChild(R.domElement);
try{$('vrb').appendChild(VRButton.createButton(R))}catch(e){}
$('tab').onclick=()=>window.__cbNav?__cbNav(location.href):open(location.href,'_blank');
const sc=new THREE.Scene();sc.fog=new THREE.Fog(0x1a2030,20,90);
const cam=new THREE.PerspectiveCamera(70,16/9,.05,200);const rig=new THREE.Group();rig.add(cam);sc.add(rig);cam.position.set(0,1.6,0);
sc.add(new THREE.HemisphereLight(0xfff0d0,0x334466,.9));const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(10,30,10);sc.add(sun);
let room='hole',scale=1,keys=0,cups=0,timerOn=false,tLeft=300,msgs=[],maze=[],rabbit,cheshire,doorOpen=false,grown=false,waterY=-5;
const say=(t)=>{msgs.unshift(t);msgs=msgs.slice(0,3);$('com').textContent=msgs.join(' · ')};
function floor(c,y=0,s=40){const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s),new THREE.MeshLambertMaterial({color:c}));m.rotation.x=-Math.PI/2;m.position.y=y;sc.add(m);return m}
function clearScene(){while(sc.children.length){const o=sc.children[0];if(o===rig){sc.remove(o);continue}sc.remove(o)}sc.add(rig);sc.add(new THREE.HemisphereLight(0xfff0d0,0x334466,.9));const s=new THREE.DirectionalLight(0xffffff,.8);s.position.set(10,30,10);sc.add(s);maze=[];rabbit=cheshire=null}
function makeHole(){clearScene();sc.background=new THREE.Color(0x1a1010);floor(0x3a281c,-20,8);const walls=new THREE.Mesh(new THREE.CylinderGeometry(3,4,40,16,1,true),new THREE.MeshLambertMaterial({color:0x4a3020,side:THREE.DoubleSide}));walls.position.y=-0;sc.add(walls);rig.position.set(0,18,0);room='hole';say('Down the rabbit-hole! (1865 Carroll — no Disney.) Fall…');const fall=setInterval(()=>{rig.position.y-=.15;if(rig.position.y<=1.6){clearInterval(fall);rig.position.y=1.6;makeDoor()}},30)}
function makeDoor(){clearScene();sc.background=new THREE.Color(0xf4e8d0);floor(0xd8c8a0);const roomB=new THREE.Mesh(new THREE.BoxGeometry(12,6,12),new THREE.MeshLambertMaterial({color:0xe8d8b0,side:THREE.BackSide}));roomB.position.y=3;sc.add(roomB);
const door=new THREE.Mesh(new THREE.BoxGeometry(.8,1.2,.1),new THREE.MeshLambertMaterial({color:0x6a4020}));door.position.set(0,.6*scale,-5.8);door.userData.door=true;sc.add(door);
const drink=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.2),new THREE.MeshLambertMaterial({color:0x40a060}));drink.position.set(-1.5,.2,-2);drink.userData.drink=true;sc.add(drink);
const eat=new THREE.Mesh(new THREE.BoxGeometry(.2,.1,.2),new THREE.MeshLambertMaterial({color:0xc04050}));eat.position.set(1.5,.1,-2);eat.userData.eat=true;sc.add(eat);
const lbl=(t,p)=>{const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#2a1d14';x.font='28px Georgia';x.fillText(t,10,40);const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.copy(p);sc.add(m)};
lbl('DRINK ME',new THREE.Vector3(-1.5,.45,-2));lbl('EAT ME',new THREE.Vector3(1.5,.35,-2));
rig.position.set(0,0,0);room='door';say('A tiny door. Drink Me / Eat Me to change size. Find the key (tap objects).')}
function makeMaze(){clearScene();sc.background=new THREE.Color(0x203020);floor(0x2a4a2a,0,60);const N=11,cell=3,seed=42;let rs=seed;const rnd=()=>{rs=(rs*1103515245+12345)&0x7fffffff;return rs/0x7fffffff};
const grid=Array.from({length:N},()=>Array(N).fill(1));const stack=[[1,1]];grid[1][1]=0;while(stack.length){const[x,y]=stack[stack.length-1];const dirs=[[0,2],[0,-2],[2,0],[-2,0]].sort(()=>rnd()-.5);let moved=false;for(const[dx,dy] of dirs){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<N-1&&ny<N-1&&grid[ny][nx]===1){grid[ny][nx]=0;grid[y+dy/2][x+dx/2]=0;stack.push([nx,ny]);moved=true;break}}if(!moved)stack.pop()}
for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(grid[y][x]){const w=new THREE.Mesh(new THREE.BoxGeometry(cell,.2,cell),new THREE.MeshLambertMaterial({color:0x1a3a1a}));w.position.set((x-N/2)*cell,.1,(y-N/2)*cell);const h=new THREE.Mesh(new THREE.BoxGeometry(cell,2.2,.2),new THREE.MeshLambertMaterial({color:0x2a5a2a}));h.position.set((x-N/2)*cell,1.2,(y-N/2)*cell);sc.add(h);maze.push({x:(x-N/2)*cell,z:(y-N/2)*cell})}
rabbit=new THREE.Mesh(new THREE.SphereGeometry(.35),new THREE.MeshLambertMaterial({color:0xf0f0f0}));rabbit.position.set(6,1.2,6);sc.add(rabbit);const ear=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.5),new THREE.MeshLambertMaterial({color:0xf0f0f0}));ear.position.set(.1,.5,0);rabbit.add(ear.clone());ear.position.x=-.1;rabbit.add(ear);
cheshire=new THREE.Mesh(new THREE.SphereGeometry(.4),new THREE.MeshLambertMaterial({color:0x7a50a0,transparent:true,opacity:.7}));cheshire.position.set(-6,2,-4);sc.add(cheshire);
for(let i=0;i<5;i++){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.15),new THREE.MeshLambertMaterial({color:0xe8d8b0}));cup.position.set((Math.random()-0.5)*20,.2,(Math.random()-0.5)*20);cup.userData.cup=true;sc.add(cup)}
rig.position.set(0,0,0);room='maze';say('Hedge maze! Chase the White Rabbit. Cheshire Cat fades in and out with hints. Collect teacups.')}
function makeTea(){clearScene();sc.background=new THREE.Color(0x304050);floor(0x6a5030);const table=new THREE.Mesh(new THREE.CylinderGeometry(2,.1,.8),new THREE.MeshLambertMaterial({color:0x8a6030}));table.position.y=.4;sc.add(table);
for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const ch=new THREE.Mesh(new THREE.BoxGeometry(.4,.5,.4),new THREE.MeshLambertMaterial({color:0x7a4b2a}));ch.position.set(Math.cos(a)*2.5,.25,Math.sin(a)*2.5);sc.add(ch);const cup=new THREE.Mesh(new THREE.CylinderGeometry(.1,.08,.12),new THREE.MeshLambertMaterial({color:0xf4e8d8}));cup.position.set(Math.cos(a)*1.2,.9,Math.sin(a)*1.2);cup.userData.cup=true;sc.add(cup)}
rig.position.set(0,0,4);room='tea';say('Mad Tea Party! Collect cups, then follow the path to the rose garden.')}
function makeGarden(){clearScene();sc.background=new THREE.Color(0x402030);floor(0x3a5a34);for(let i=0;i<30;i++){const rose=new THREE.Mesh(new THREE.SphereGeometry(.2),new THREE.MeshLambertMaterial({color:Math.random()>.5?0xc03040:0xffffff}));rose.position.set((Math.random()-.5)*20,.3,(Math.random()-.5)*20);sc.add(rose)}
for(let i=0;i<12;i++){const card=new THREE.Mesh(new THREE.BoxGeometry(.6,1.4,.05),new THREE.MeshLambertMaterial({color:i%2?0xc03040:0x202020}));card.position.set(-8+i*1.4,.7,-8);sc.add(card)}
const queen=new THREE.Mesh(new THREE.CapsuleGeometry(.4,1.2),new THREE.MeshLambertMaterial({color:0x8a1030}));queen.position.set(0,1.2,-10);sc.add(queen);rig.position.set(0,0,8);room='garden';say('Queen of Hearts rose garden! Card soldiers stand guard. You found Wonderland’s end. Collect remaining cups. 🎩')}
function interact(){const ray=new THREE.Raycaster();const dir=new THREE.Vector3();cam.getWorldDirection(dir);ray.set(cam.getWorldPosition(new THREE.Vector3()),dir);const hits=ray.intersectObjects(sc.children,true);
for(const h of hits){let o=h.object;while(o&&!o.userData.drink&&!o.userData.eat&&!o.userData.door&&!o.userData.cup&&o.parent)o=o.parent;
if(o.userData.drink){scale=.35;rig.scale.setScalar(scale);cam.position.y=1.6;say('Curiouser and curiouser — you shrink!');doorOpen=true;sc.remove(o);return}
if(o.userData.eat){scale=1.4;rig.scale.setScalar(Math.min(scale,1));grown=true;say('You grow! Too big for the door — drink first maybe.');sc.remove(o);return}
if(o.userData.door&&doorOpen&&scale<.5){say('Through the tiny door!');makeMaze();return}
if(o.userData.cup){cups++;sc.remove(o);$('hud').textContent=`Keys ${keys} · Teacups ${cups} · ${room}`;say('Teacup +1');if(room=='maze'&&cups>=3){say('Cheshire grins: tea time…');setTimeout(makeTea,800)}if(room=='tea'&&cups>=6)setTimeout(makeGarden,800);return}}}
// input
const keysDown={};addEventListener('keydown',e=>{keysDown[e.code]=true;if(e.code==='KeyE'||e.code==='Space')interact()});addEventListener('keyup',e=>keysDown[e.code]=false);
let yaw=0,pitch=0,ptr=null;R.domElement.onpointerdown=e=>{ptr={x:e.clientX,y:e.clientY,id:e.pointerId};if(e.pointerType==='touch'&&e.clientX>innerWidth/2)interact()};
addEventListener('pointermove',e=>{if(!ptr||ptr.id!==e.pointerId)return;yaw-=(e.clientX-ptr.x)*.004;pitch=Math.max(-1,Math.min(1,pitch-(e.clientY-ptr.y)*.003));ptr.x=e.clientX;ptr.y=e.clientY});
addEventListener('pointerup',()=>ptr=null);
const ctrls=[0,1].map(i=>{const c=R.xr.getController(i);c.addEventListener('selectstart',interact);rig.add(c);return c});
let snapCD=0;
function resize(){const w=$('stage').clientWidth,h=Math.max(360,Math.min(innerHeight-220,w*.56));R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
R.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);if(!R.xr.isPresenting){cam.rotation.set(pitch,0,0);rig.rotation.y=yaw}
let mx=(keysDown.KeyD||keysDown.ArrowRight?1:0)-(keysDown.KeyA||keysDown.ArrowLeft?1:0),mz=(keysDown.KeyS||keysDown.ArrowDown?1:0)-(keysDown.KeyW||keysDown.ArrowUp?1:0);
const s=R.xr.getSession&&R.xr.getSession();if(s)for(const src of s.inputSources){const g=src.gamepad;if(!g||g.axes.length<4)continue;if(src.handedness==='left'){mx=g.axes[2];mz=g.axes[3]}else{const sn=+$('snap').value;if(sn){if(Math.abs(g.axes[2])>.7&&snapCD<=0){rig.rotation.y-=Math.sign(g.axes[2])*sn*Math.PI/180;snapCD=.35}}else rig.rotation.y-=g.axes[2]*dt*1.5}}snapCD-=dt;
if(Math.abs(mx)+Math.abs(mz)>.1&&room!=='hole'){const v=new THREE.Vector3(mx,0,mz).applyAxisAngle(new THREE.Vector3(0,1,0),rig.rotation.y).multiplyScalar(dt*4);rig.position.add(v)}
$('vg').style.opacity=$('vig').checked&&(Math.abs(mx)+Math.abs(mz)>.1)?.8:0;
if(rabbit&&room==='maze'){const t=performance.now()/1000;rabbit.position.x=Math.sin(t*.7)*8;rabbit.position.z=Math.cos(t*.5)*8;if(rig.position.distanceTo(rabbit.position)<1.5){say('You nearly caught the White Rabbit — he drops a key!');keys++;rabbit.position.set(Math.random()*10,1.2,Math.random()*10)}}
if(cheshire&&room==='maze'){cheshire.material.opacity=.2+.5*Math.abs(Math.sin(performance.now()/800));if(Math.random()<.002)say(['Cheshire: “We’re all mad here.”','Cheshire: try the left hedge…','Cheshire: cups, cups, cups!'][Math.random()*3|0])}
if(timerOn){tLeft-=dt;$('time').textContent='⏱ '+Math.ceil(tLeft)+'s';if(tLeft<=0){timerOn=false;say('Time’s up! Restart from the hole.');makeHole()}}
R.render(sc,cam)});
$('timer').onchange=()=>{timerOn=$('timer').checked;tLeft=300};$('restart').onclick=()=>{keys=cups=0;scale=1;rig.scale.set(1,1,1);makeHole()};
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{['play','shop'].forEach(t=>$(t).style.display=t===b.dataset.t?'':'none');document.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));if(b.dataset.t==='play')resize()});
makeHole();
