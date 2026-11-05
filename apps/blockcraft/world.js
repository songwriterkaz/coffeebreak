(function(){'use strict';const THREE=window.THREE;

const DEMO=!!window.DEMO,WX=DEMO?32:80,WZ=WX,WY=40,CS=16;
// ---- blocks ----
const B=[null,{n:'Grass'},{n:'Dirt'},{n:'Stone'},{n:'Wood log'},{n:'Leaves'},{n:'Sand'},{n:'Coffee bean ore'},{n:'Espresso stone'},{n:'Candy block'},{n:'Pink block'},{n:'Planks'},{n:'Glass'},{n:'Marshmallow'},{n:'Bedrock'}];
const NB=B.length,TS=16;
// atlas: tile index = id*3 + face (0 top,1 side,2 bottom)
const atlas=document.createElement('canvas');atlas.width=TS*3;atlas.height=TS*NB;const ax=atlas.getContext('2d');
function rnd(s){let a=s|0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function tile(id,f,draw){const R=rnd(id*31+f*7+1);ax.save();ax.translate(f*TS,id*TS);draw(R);ax.restore()}
function noiseFill(R,base,v){for(let y=0;y<TS;y++)for(let x=0;x<TS;x++){const k=(R()-.5)*v;ax.fillStyle=`rgb(${base[0]+k|0},${base[1]+k|0},${base[2]+k|0})`;ax.fillRect(x,y,1,1)}}
for(let id=1;id<NB;id++)for(let f=0;f<3;f++)tile(id,f,R=>{
 const C={1:[96,170,70],2:[134,96,60],3:[128,128,132],4:[110,78,44],5:[60,140,60],6:[222,206,150],7:[128,128,132],8:[58,40,34],9:[255,240,245],10:[248,160,200],11:[180,134,80],12:[200,230,255],13:[255,246,250],14:[40,40,44]}[id];
 if(id===1&&f!==0){noiseFill(R,f===1?[134,96,60]:[134,96,60],30);if(f===1){for(let x=0;x<TS;x++){const h=3+R()*3|0;ax.fillStyle='rgb(96,170,70)';ax.fillRect(x,0,1,h)}}return}
 if(id===4&&f===0){noiseFill(R,[170,130,80],20);ax.strokeStyle='#7a5a30';for(let r=2;r<8;r+=2){ax.strokeRect(8-r,8-r,r*2,r*2)}return}
 noiseFill(R,C,id===12?6:id===9||id===13?10:34);
 if(id===4&&f!==0){ax.fillStyle='rgba(60,40,20,.5)';for(let x=1;x<TS;x+=4)ax.fillRect(x,0,1,TS)}
 if(id===7){for(let i=0;i<5;i++){const X=1+R()*12|0,Y=1+R()*12|0;ax.fillStyle='#4a2a14';ax.fillRect(X,Y,3,4);ax.fillStyle='#2a1408';ax.fillRect(X+1,Y,1,4)}}
 if(id===8){ax.fillStyle='rgba(255,210,150,.25)';for(let i=0;i<4;i++)ax.fillRect(R()*14|0,R()*14|0,2,1)}
 if(id===9){ax.fillStyle='#ff5a9a';for(let i=-16;i<16;i+=6){ax.beginPath();ax.moveTo(i,0);ax.lineTo(i+3,0);ax.lineTo(i+19,16);ax.lineTo(i+16,16);ax.fill()}}
 if(id===10){ax.fillStyle='#fff';for(let i=0;i<6;i++)ax.fillRect(R()*15|0,R()*15|0,1,1);ax.fillStyle='#7ad0ff';for(let i=0;i<4;i++)ax.fillRect(R()*15|0,R()*15|0,2,1)}
 if(id===11){ax.fillStyle='rgba(80,50,20,.6)';[0,4,8,12].forEach(y=>ax.fillRect(0,y,TS,1));ax.fillRect(7,0,1,4);ax.fillRect(3,4,1,4);ax.fillRect(11,8,1,4);ax.fillRect(6,12,1,4)}
 if(id===12){ax.clearRect(1,1,14,14);ax.fillStyle='rgba(220,240,255,.25)';ax.fillRect(1,1,14,14);ax.fillStyle='#fff';ax.fillRect(3,3,1,4)}
 if(id===13){ax.fillStyle='rgba(255,180,210,.5)';ax.fillRect(0,0,TS,2);ax.fillRect(0,14,TS,2)}
 if(id===5){ax.fillStyle='rgba(20,60,20,.5)';for(let i=0;i<20;i++)ax.fillRect(R()*16|0,R()*16|0,1,1)}});
const tex=new THREE.CanvasTexture(atlas);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.colorSpace=THREE.SRGBColorSpace;
// ---- world ----
let seed=1234,W=new Uint8Array(WX*WY*WZ);const idx=(x,y,z)=>(y*WZ+z)*WX+x;
const get=(x,y,z)=>x<0||z<0||x>=WX||z>=WZ||y<0?14:y>=WY?0:W[idx(x,y,z)];
const set=(x,y,z,v)=>{if(x<0||z<0||x>=WX||z>=WZ||y<0||y>=WY)return;W[idx(x,y,z)]=v};
function vnoise(s){const R=rnd(s),g=[];for(let i=0;i<256;i++)g.push(R());const h=(x,z)=>g[((x*73856093)^(z*19349663))&255];
 return(x,z)=>{const xi=Math.floor(x),zi=Math.floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return(h(xi,zi)*(1-u)+h(xi+1,zi)*u)*(1-v)+(h(xi,zi+1)*(1-u)+h(xi+1,zi+1)*u)*v}}
let edits={};
function gen(){W.fill(0);const n1=vnoise(seed),n2=vnoise(seed+7),n3=vnoise(seed+13),R=rnd(seed+99);
 for(let x=0;x<WX;x++)for(let z=0;z<WZ;z++){const h=Math.floor(12+n1(x/16,z/16)*10+n2(x/6,z/6)*3),candy=n3(x/20,z/20)>.62,beach=h<14;
  for(let y=0;y<=h&&y<WY;y++){let b=y===0?14:y<h-3?3:y<h?(beach?6:2):(beach?6:candy?10:1);if(b===3){const r=R();if(r<.03)b=7;else if(r<.05&&y<10)b=8}if(candy&&y>=h-1&&b!==14)b=y===h?10:13;set(x,y,z,b)}
  if(!beach&&!candy&&R()<.018&&x>2&&z>2&&x<WX-3&&z<WZ-3){const th=4+(R()*2|0);for(let y=1;y<=th;y++)set(x,h+y,z,4);for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=th-1;dy<=th+1;dy++)if(Math.abs(dx)+Math.abs(dz)+(dy>th?1:0)<4&&get(x+dx,h+dy,z+dz)===0)set(x+dx,h+dy,z+dz,5)}
  if(candy&&R()<.02){for(let y=1;y<=3;y++)set(x,h+y,z,9)}}
 for(const k in edits){const[a,b,c]=k.split(',').map(Number);set(a,b,c,edits[k])}}
// ---- render ----
const glc=document.createElement('canvas');const hud=document.getElementById('c');hud.parentNode.insertBefore(glc,hud);hud.style.position='relative';hud.style.zIndex=2;hud.style.background='transparent';
glc.style.cssText='position:absolute;z-index:1;pointer-events:none;visibility:hidden';hud.parentNode.style.position=hud.parentNode.style.position||'relative';
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:false,preserveDrawingBuffer:true});renderer.setPixelRatio(1);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(72,900/600,.05,200);scene.fog=new THREE.Fog(0x9ad8ff,30,75);
const amb=new THREE.AmbientLight(0xffffff,.6),sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(30,60,20);scene.add(amb,sun);
const mat=new THREE.MeshLambertMaterial({map:tex,vertexColors:true,alphaTest:.1,transparent:false});
const FACES=[[[1,0,0],[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],1,.8],[[-1,0,0],[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],1,.8],[[0,1,0],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],0,1],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],2,.5],[[0,0,1],[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],1,.9],[[0,0,-1],[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],1,.7]];
const chunks={};const transp=b=>b===0||b===12||b===5;
function buildChunk(cx,cz){const k=cx+','+cz;if(chunks[k]){scene.remove(chunks[k]);chunks[k].geometry.dispose()}const P=[],N=[],U=[],C=[],I=[];
 for(let x=cx*CS;x<Math.min(WX,cx*CS+CS);x++)for(let z=cz*CS;z<Math.min(WZ,cz*CS+CS);z++)for(let y=0;y<WY;y++){const b=get(x,y,z);if(!b)continue;
  for(const[d,vs,f,sh]of FACES){const nb=get(x+d[0],y+d[1],z+d[2]);if(!(transp(nb)&&nb!==b))continue;const base=P.length/3;
   vs.forEach(v=>{P.push(x+v[0],y+v[1],z+v[2]);N.push(...d);C.push(sh,sh,sh)});const u0=f/3,u1=(f+1)/3,v0=1-(b+1)/NB,v1=1-b/NB,e=.001;
   if(d[1]!==0){U.push(u0+e,v0+e,u1-e,v0+e,u1-e,v1-e,u0+e,v1-e)}else U.push(u0+e,v0+e,u0+e,v1-e,u1-e,v1-e,u1-e,v0+e);
   I.push(base,base+1,base+2,base,base+2,base+3)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);
 const m=new THREE.Mesh(g,mat);scene.add(m);chunks[k]=m}
function buildAll(){for(let cx=0;cx<Math.ceil(WX/CS);cx++)for(let cz=0;cz<Math.ceil(WZ/CS);cz++)buildChunk(cx,cz)}
function touch(x,z){const cx=Math.floor(x/CS),cz=Math.floor(z/CS);buildChunk(cx,cz);if(x%CS===0&&cx>0)buildChunk(cx-1,cz);if(x%CS===CS-1&&(cx+1)*CS<WX)buildChunk(cx+1,cz);if(z%CS===0&&cz>0)buildChunk(cx,cz-1);if(z%CS===CS-1&&(cz+1)*CS<WZ)buildChunk(cx,cz+1)}
const sel=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002,1.002,1.002)),new THREE.LineBasicMaterial({color:0x1a0a10}));scene.add(sel);
// ---- player ----
const P={x:WX/2,y:WY,z:WZ/2,vx:0,vy:0,vz:0,yaw:0,pitch:-.2,ground:false};
let inv={},hot=[1,3,4,11,7,8,9,10,13],hs=0,state='title',slot=0,dayT=60,keys={},tgt=null,msg='',msgT=0,mined=0,placed=0,crafted=0,lock=false;
const RECIPES=[[{4:1},{11:4},'1 Wood log → 4 Planks'],[{6:4},{12:2},'4 Sand → 2 Glass'],[{7:2,3:1},{8:2},'2 Coffee bean ore + 1 Stone → 2 Espresso stone'],[{10:2},{9:1},'2 Pink block → 1 Candy block'],[{13:1,9:1},{10:3},'1 Marshmallow + 1 Candy → 3 Pink block'],[{11:2,7:1},{13:2},'2 Planks + 1 Coffee bean ore → 2 Marshmallow']];
function spawn(){P.x=WX/2+.5;P.z=WZ/2+.5;let y=WY-1;while(y>0&&!get(Math.floor(P.x),y,Math.floor(P.z)))y--;P.y=y+1.01;P.vy=0}
function solid(x,y,z){const b=get(Math.floor(x),Math.floor(y),Math.floor(z));return b!==0}
function collide(nx,ny,nz){const r=.3;for(const dx of[-r,r])for(const dz of[-r,r])for(const dy of[0,.9,1.7])if(solid(nx+dx,ny+dy,nz+dz))return true;return false}
function ray(){const dir=new THREE.Vector3();cam.getWorldDirection(dir);let x=cam.position.x,y=cam.position.y,z=cam.position.z,px=null;for(let s=0;s<6;s+=.05){const bx=Math.floor(x+dir.x*s),by=Math.floor(y+dir.y*s),bz=Math.floor(z+dir.z*s);if(get(bx,by,bz)&&get(bx,by,bz)!==14||(by===0&&get(bx,by,bz)===14))return{b:[bx,by,bz],p:px};px=[bx,by,bz]}return null}
function say(s){msg=s;msgT=2.5}
function mine(){const r=ray();if(!r)return;const[x,y,z]=r.b,b=get(x,y,z);if(b===14)return say('Bedrock is unbreakable!');set(x,y,z,0);edits[x+','+y+','+z]=0;inv[b]=(inv[b]||0)+1;mined++;G.score=mined;touch(x,z);say('+1 '+B[b].n)}
function place(){const r=ray();if(!r||!r.p)return;const b=hot[hs];if(!(inv[b]>0))return say('No '+B[b].n+' left. Mine or craft some!');const[x,y,z]=r.p;const px=Math.floor(P.x),pz=Math.floor(P.z);if(x===px&&z===pz&&(y===Math.floor(P.y)||y===Math.floor(P.y+1)))return;set(x,y,z,b);edits[x+','+y+','+z]=b;inv[b]--;placed++;touch(x,z)}
function craft(i){const[a,o,n]=RECIPES[i];for(const k in a)if((inv[k]||0)<a[k])return say('Missing ingredients for: '+n);for(const k in a)inv[k]-=a[k];for(const k in o)inv[k]=(inv[k]||0)+o[k];crafted++;say('Crafted! '+n)}
const SK='bcWorld';function setInv(o){for(const k in inv)delete inv[k];Object.assign(inv,o)}
function saveWorld(s){if(DEMO)return demoEnd('Saving worlds is in the full game. The demo is a small world without saving.');const d={seed,edits,P:{x:P.x,y:P.y,z:P.z,yaw:P.yaw},inv,dayT};localStorage[SK+s]=JSON.stringify(d);say('World '+(s+1)+' saved ☕')}
function loadWorld(s){const d=JSON.parse(localStorage[SK+s]||'null');if(d){seed=d.seed;edits=d.edits;setInv(d.inv);dayT=d.dayT;gen();buildAll();Object.assign(P,d.P,{vy:0})}else newWorld();slot=s}
function newWorld(){seed=Math.random()*1e9|0;edits={};setInv({1:4,3:4});gen();buildAll();spawn()}
function startGame(s){startMusic();if(DEMO){newWorld()}else loadWorld(s);state='play';try{hud.requestPointerLock()}catch(e){}}
window.BC={get,set,P,inv,mine,place,craft,ray,cam,RECIPES,newWorld,saveWorld,loadWorld,startGame,get state(){return state},set state(v){state=v},edits:()=>edits,setHs:v=>hs=v,WX,stats:()=>({mined,placed,crafted})};
// ---- input ----
addEventListener('keydown',e=>{keys[e.code]=1;if(state!=='play'&&state!=='craft')return;if(e.code.startsWith('Digit')){const n=+e.code.slice(5)-1;if(n>=0&&n<9)hs=n}if(e.code==='KeyC'||e.code==='KeyE'){state=state==='craft'?'play':'craft';if(state==='craft')document.exitPointerLock&&document.exitPointerLock()}if(e.code==='Space')e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=0);
document.addEventListener('pointerlockchange',()=>lock=document.pointerLockElement===hud);
addEventListener('mousemove',e=>{if(lock&&state==='play'){P.yaw-=e.movementX*.0025;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-e.movementY*.0025))}});
hud.addEventListener('wheel',e=>{hs=(hs+(e.deltaY>0?1:8))%9;e.preventDefault()},{passive:false});
hud.addEventListener('contextmenu',e=>e.preventDefault());
let drag=null;
hud.addEventListener('mousedown',e=>{if(state!=='play')return;if(!lock){const p=pos(e);let hitBtn=false;for(const k in BTN)if(inB(p,BTN[k]))hitBtn=true;if(hitBtn)return;try{hud.requestPointerLock()}catch(err){}drag={x:e.clientX,y:e.clientY,b:e.button,moved:0};return}if(e.button===0)mine();else if(e.button===2)place()});
addEventListener('mousemove',e=>{if(drag&&!lock){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved+=Math.abs(dx)+Math.abs(dy);P.yaw-=dx*.005;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-dy*.005));drag.x=e.clientX;drag.y=e.clientY}});
addEventListener('mouseup',e=>{if(drag&&drag.moved<6&&!lock){drag.b===2?place():mine()}drag=null});
bindInput({});
// ---- loop ----
const G=window.G={score:0,level:0};
window.update=function(dt){if(msgT>0)msgT-=dt;dayT=(dayT+dt)%240;
 if(state==='play'){const sp=keys.ShiftLeft?7:4.3,f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  const vx=(-Math.sin(P.yaw)*f+Math.cos(P.yaw)*s)*sp,vz=(-Math.cos(P.yaw)*f-Math.sin(P.yaw)*s)*sp;P.vy-=22*dt;if(keys.Space&&P.ground){P.vy=7.6;P.ground=false}
  if(!collide(P.x+vx*dt,P.y,P.z))P.x+=vx*dt;if(!collide(P.x,P.y,P.z+vz*dt))P.z+=vz*dt;if(!collide(P.x,P.y+P.vy*dt,P.z)){P.y+=P.vy*dt;P.ground=false}else{if(P.vy<0)P.ground=true;P.vy=0}
  if(P.y<-5)spawn()}
 cam.position.set(P.x,P.y+1.6,P.z);cam.rotation.order='YXZ';cam.rotation.set(P.pitch,P.yaw,0);
 const day=Math.sin(dayT/240*Math.PI*2)*.5+.5,sky=new THREE.Color().setHSL(.58,.6,.12+day*.6);scene.background=sky;scene.fog.color=sky;amb.intensity=.25+day*.5;sun.intensity=.1+day*.8;sun.position.set(Math.cos(dayT/240*6.28)*60,Math.sin(dayT/240*6.28)*60+10,20);
 tgt=state==='play'?ray():null;sel.visible=!!tgt;if(tgt)sel.position.set(tgt.b[0]+.5,tgt.b[1]+.5,tgt.b[2]+.5);
 const r=hud.getBoundingClientRect();const pr=hud.parentNode.getBoundingClientRect();glc.style.left=(r.left-pr.left+hud.parentNode.scrollLeft)+'px';glc.style.top=(r.top-pr.top+hud.parentNode.scrollTop)+'px';if(glc.width!==Math.round(r.width)||glc.height!==Math.round(r.height)){renderer.setSize(Math.round(r.width),Math.round(r.height),false);glc.style.width=r.width+'px';glc.style.height=r.height+'px';cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
 renderer.render(scene,cam)};
function slotRow(X,Y,b,sel2,n){x.fillStyle=sel2?'rgba(255,233,239,.9)':'rgba(26,10,16,.7)';rr(X,Y,44,44,6);x.fill();x.strokeStyle=sel2?'#ff5a9a':'#e8a0b0';x.lineWidth=sel2?3:1.5;x.stroke();x.imageSmoothingEnabled=false;x.drawImage(atlas,TS,b*TS,TS,TS,X+8,Y+6,28,28);x.fillStyle='#fff';x.font='bold 12px Georgia';x.textAlign='right';x.fillText(n,X+41,Y+41)}
window.draw=function(){x.clearRect(0,0,W_,H_);try{x.drawImage(glc,0,0,W_,H_)}catch(e){};
 if(state==='title'){x.fillStyle='rgba(26,10,16,.55)';x.fillRect(0,0,W_,H_);x.textAlign='center';x.fillStyle='#ffe9c7';x.font='bold 54px Georgia';x.fillText('⛏️ Coffeebreak Blockcraft',W_/2,130);x.font='17px Georgia';
  ['A cosy blocky sandbox. Dig, build, craft, and find coffee bean ore and candy hills!','WASD move · Space jump · Shift run · mouse look (click to capture)','Left click mine · Right click place · 1-9 or wheel picks a block · C crafting'].forEach((s,i)=>x.fillText(s,W_/2,175+i*26));
  if(DEMO){button('d',W_/2-120,280,240,54,'▶ Play the demo world',()=>startGame(0));x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('Demo: a small world without saving. The full game has big worlds and 3 save slots.',W_/2,370)}
  else[0,1,2].forEach(s=>{const has=!!localStorage[SK+s];button('w'+s,W_/2-300+s*205,270,190,60,(has?'▶ World ':'✨ New world ')+(s+1),()=>startGame(s),{fs:17});if(has)button('x'+s,W_/2-300+s*205+55,340,80,26,'🗑 reset',()=>{delete localStorage[SK+s]},{fs:12})});return}
 // crosshair
 x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(W_/2-9,H_/2);x.lineTo(W_/2+9,H_/2);x.moveTo(W_/2,H_/2-9);x.lineTo(W_/2,H_/2+9);x.stroke();
 hot.forEach((b,i)=>slotRow(W_/2-225+i*50,H_-58,b,i===hs,inv[b]||0));x.fillStyle='#fff';x.font='bold 14px Georgia';x.textAlign='center';x.fillText(B[hot[hs]].n,W_/2,H_-66);
 const day=Math.sin(dayT/240*Math.PI*2);x.textAlign='left';x.font='14px Georgia';x.fillStyle='#fff';x.fillText((day>0?'☀️ Day':'🌙 Night')+' · ⛏ '+mined+' mined · 🧱 '+placed+' placed',10,22);
 button('cr',W_-380,8,105,30,'🛠 Craft (C)',()=>{state=state==='craft'?'play':'craft'},{fs:13});button('sv',W_-268,8,110,30,DEMO?'💾 Save 🔒':'💾 Save',()=>saveWorld(slot),{fs:13});
 if(!lock&&state==='play'){x.fillStyle='rgba(26,10,16,.6)';rr(W_/2-200,H_/2+30,400,30,8);x.fill();x.fillStyle='#ffe9c7';x.font='14px Georgia';x.textAlign='center';x.fillText('Click to capture the mouse (or drag to look, tap to mine)',W_/2,H_/2+50)}
 if(msgT>0){x.fillStyle='rgba(26,10,16,.8)';rr(W_/2-220,60,440,34,10);x.fill();x.fillStyle='#ffcf6a';x.font='bold 15px Georgia';x.textAlign='center';x.fillText(msg,W_/2,82)}
 if(state==='craft'){x.fillStyle='rgba(26,10,16,.9)';rr(150,90,600,400,16);x.fill();x.fillStyle='#ffcf6a';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('🛠 Crafting',W_/2,125);
  RECIPES.forEach((r,i)=>{const ok=Object.keys(r[0]).every(k=>(inv[k]||0)>=r[0][k]);button('rc'+i,180,145+i*52,540,44,r[2],()=>craft(i),{fs:15,dis:!ok})});
  x.fillStyle='#ffe9c7';x.font='13px Georgia';x.fillText('Press C to close · Your bag: '+Object.keys(inv).filter(k=>inv[k]>0).map(k=>B[k].n+' '+inv[k]).join(', '),W_/2,470)}};
const W_=900,H_=600;
gen();buildAll();spawn();startLoop();

const TOUCH_BTNS=[['⤒ Jump','rgba(120,200,120,.85)',()=>{keys.Space=1},()=>{keys.Space=0}],['⛏ Mine','rgba(200,90,110,.85)',()=>{if(state==='play')mine()}],['🧱 Place','rgba(110,140,220,.85)',()=>{if(state==='play')place()}]];const TOUCH_LOOK=(dx,dy)=>{if(state==='play'){P.yaw-=dx*.006;P.pitch=Math.max(-1.5,Math.min(1.5,P.pitch-dy*.006))}};
;(function(){if(!(('ontouchstart' in window)||navigator.maxTouchPoints>0||/[?&]touch=1/.test(location.search)))return;
const wrap=hud.parentNode,ui=document.createElement('div');ui.id='touchui';ui.style.cssText='position:absolute;z-index:5;pointer-events:none;left:0;top:0;width:0;height:0';wrap.appendChild(ui);
const mk=(css,html)=>{const d=document.createElement('div');d.style.cssText='position:absolute;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;display:flex;align-items:center;justify-content:center;font:bold 15px sans-serif;color:#fff;'+css;d.innerHTML=html||'';ui.appendChild(d);return d};
const base=mk('width:130px;height:130px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.55)'),knob=mk('width:56px;height:56px;border-radius:50%;background:rgba(232,160,176,.85);border:2px solid #fff');
const btns=[];const addB=(lbl,col,down,up)=>{const b=mk('width:70px;height:70px;border-radius:50%;background:'+col+';border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)',lbl);b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();down()},{passive:false});b.addEventListener('touchend',e=>{e.preventDefault();up&&up()},{passive:false});b.addEventListener('mousedown',e=>{e.stopPropagation();down()});b.addEventListener('mouseup',()=>up&&up());btns.push(b);return b};
TOUCH_BTNS.forEach(a=>addB(...a));
let jid=null,jc=null;const setK=(dx,dy)=>{keys.KeyW=dy<-.3?1:0;keys.KeyS=dy>.3?1:0;keys.KeyA=dx<-.3?1:0;keys.KeyD=dx>.3?1:0};
function lay(){const r=hud.getBoundingClientRect(),pr=wrap.getBoundingClientRect(),L=r.left-pr.left,T=r.top-pr.top;base.style.left=(L+24)+'px';base.style.top=(T+r.height-195)+'px';jc=[L+24+65,T+r.height-130];if(jid===null){knob.style.left=(jc[0]-28)+'px';knob.style.top=(jc[1]-28)+'px'}btns.forEach((b,i)=>{const col=i%2,row=Math.floor(i/2);b.style.left=(L+r.width-100-col*85)+'px';b.style.top=(T+r.height-145-row*85)+'px'});ui.style.display=(typeof state!=='undefined'&&state==='play')?'block':'none'}
setInterval(lay,200);lay();
const jmove=t=>{const pr=wrap.getBoundingClientRect();let dx=(t.clientX-pr.left-jc[0])/55,dy=(t.clientY-pr.top-jc[1])/55;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}knob.style.left=(jc[0]+dx*55-28)+'px';knob.style.top=(jc[1]+dy*55-28)+'px';setK(dx,dy)};
base.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];jid=t.identifier;jmove(t)},{passive:false});
addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===jid){e.preventDefault();jmove(t)}else if(t.identifier===lid){e.preventDefault();TOUCH_LOOK(t.clientX-lp[0],t.clientY-lp[1]);lp=[t.clientX,t.clientY]}}},{passive:false});
const end=e=>{for(const t of e.changedTouches){if(t.identifier===jid){jid=null;setK(0,0);lay()}if(t.identifier===lid)lid=null}};addEventListener('touchend',end);addEventListener('touchcancel',end);
let lid=null,lp=null;hud.addEventListener('touchstart',e=>{if(typeof state==='undefined'||state!=='play')return;const t=e.changedTouches[0];lid=t.identifier;lp=[t.clientX,t.clientY]},{passive:true});
window.TOUCHUI={setK,lay};})();

})();