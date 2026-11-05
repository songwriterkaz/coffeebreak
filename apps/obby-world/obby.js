(function(){'use strict';const THREE=window.THREE;

const DEMO=!!window.DEMO,NST=12,MAXS=DEMO?3:NST,W_=900,H_=600;
const SV=JSON.parse(localStorage.obbySave||'null')||{coins:0,done:[],own:['none','pink','cap0'],av:{skin:'#f6d8c8',shirt:'#ff5a9a',pants:'#3a1424',hat:'none',face:'smile'}};
const save=()=>{localStorage.obbySave=JSON.stringify(SV)};
const SHOP=[['shirt','#ff5a9a','Pink tee',0],['shirt','#7ad0ff','Sky tee',10],['shirt','#ffd75a','Gold tee',25],['shirt','#1a1a1a','Goth tee',15],['shirt','#9a6aff','Purple tee',15],['pants','#3a1424','Plum pants',0],['pants','#2a4a8a','Denim',10],['pants','#f6a6c6','Candy pants',20],['hat','none','No hat',0],['hat','cap','Coffee cap',20],['hat','beanie','Grey beanie',25],['hat','crown','Gold crown',80],['hat','bow','Big pink bow',35],['face','smile','Smile',0],['face','wink','Wink',15],['face','cool','Shades',40],['skin','#f6d8c8','Skin 1',0],['skin','#e0b090','Skin 2',0],['skin','#a06a40','Skin 3',0],['skin','#6a4028','Skin 4',0]];
const key=(s)=>s[0]+':'+s[1];SHOP.filter(s=>s[3]===0).forEach(s=>{if(!SV.own.includes(key(s)))SV.own.push(key(s))});
// ---- renderer ----
const hud=document.getElementById('c'),glc=document.createElement('canvas');hud.parentNode.insertBefore(glc,hud);hud.style.position='relative';hud.style.zIndex=2;hud.style.background='transparent';glc.style.cssText='position:absolute;z-index:1;pointer-events:none;visibility:hidden';hud.parentNode.style.position=hud.parentNode.style.position||'relative';
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xffd0e2);scene.fog=new THREE.Fog(0xffd0e2,60,160);const cam=new THREE.PerspectiveCamera(65,1.5,.1,300);
scene.add(new THREE.HemisphereLight(0xffffff,0x8a6a7a,.9));const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(30,60,10);scene.add(sun);
const M=c=>new THREE.MeshLambertMaterial({color:c});const box=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));
// ---- level data ----
let world=new THREE.Group();scene.add(world);let plats=[],coins=[],cps=[],spins=[],portals=[],goal=null,mode='hub',stage=0,cp=null,stT=0;
function R(s){let a=s|0;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function plat(x,y,z,w,h,d,c,o={}){const m=box(w,h,d,c);m.position.set(x,y,z);world.add(m);const p={x,y,z,w,h,d,m,...o,ox:x,oz:z,oy:y};plats.push(p);return p}
function coin(x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,16),new THREE.MeshLambertMaterial({color:0xffd75a,emissive:0x664400}));m.rotation.x=Math.PI/2;m.position.set(x,y,z);world.add(m);coins.push({m,got:false})}
function clear(){scene.remove(world);world=new THREE.Group();scene.add(world);plats=[];coins=[];cps=[];spins=[];portals=[];goal=null}
function buildHub(){clear();mode='hub';plat(0,-.5,0,40,1,40,0xf3e2e8);for(let i=-20;i<20;i+=4)for(let j=-20;j<20;j+=4)if((i+j)/4%2===0){const t=box(4,.02,4,0xe8cfd8);t.position.set(i+2,.01,j+2);world.add(t)}
 // café building
 plat(0,3,-14,16,6,6,0x8a5a3a);const roof=box(17,1,7,0xff5a9a);roof.position.set(0,6.5,-14);world.add(roof);const sign=box(8,1.6,.3,0xfff3d6);sign.position.set(0,5,-10.9);world.add(sign);
 const sc=document.createElement('canvas');sc.width=256;sc.height=52;const g=sc.getContext('2d');g.fillStyle='#fff3d6';g.fillRect(0,0,256,52);g.fillStyle='#c2264a';g.font='bold 30px Georgia';g.textAlign='center';g.fillText('☕ Coffeebreak Café',128,36);sign.material=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc)});
 plat(0,.6,-9.5,8,1.2,1.4,0xc8a070);[[-8,-4],[8,-4],[-8,6],[8,6]].forEach(([a,b])=>{plat(a,.45,b,2.4,.9,2.4,0xffffff);const u=box(.4,1.2,.4,0xffd0e2);u.position.set(a,1.5,b);world.add(u);const cup=box(.4,.5,.4,0x6a3a1a);cup.position.set(a,1.15,b);world.add(cup)});
 // stage portals in an arc
 for(let i=0;i<NST;i++){const a=-Math.PI*.9+i*(Math.PI*.8/(NST-1)),X=Math.cos(a+Math.PI/2)*0+(-16.5+i*3),Z=14;const un=i===0||SV.done.includes(i)||SV.done.includes(i-1+1)||SV.done.includes(i-1);
  const locked=!(i===0||SV.done.includes(i-1))||i>=MAXS;const col=SV.done.includes(i)?0x7fd88a:locked?0x888888:0xffd75a;const pad=box(2.4,.3,2.4,col);pad.position.set(X,.15,Z);world.add(pad);
  const ps=document.createElement('canvas');ps.width=64;ps.height=64;const q=ps.getContext('2d');q.fillStyle='#'+col.toString(16).padStart(6,'0');q.fillRect(0,0,64,64);q.fillStyle='#1a0a10';q.font='bold 40px Georgia';q.textAlign='center';q.fillText(locked?'🔒':i+1,32,46);
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(ps)}));lab.position.set(X,2.2,Z);lab.rotation.y=Math.PI;world.add(lab);portals.push({x:X,z:Z,i,locked})}
 const shop=box(3,2.4,2,0x9a6aff);shop.position.set(14,1.2,-4);world.add(shop);plats.push({x:14,y:1.2,z:-4,w:3,h:2.4,d:2,m:shop});portals.push({x:14,z:-1.8,i:'shop'});
 sp(0,1,4)}
function buildStage(s){clear();mode='stage';stage=s;const r=R(s*977+5),col=[0xff5a9a,0x7ad0ff,0xffd75a,0x9a6aff,0x7fd88a][s%5];let z=0,y=0,x=0;stT=0;
 plat(0,-.5,0,8,1,8,0xfff3d6);cps.push({x:0,y:1,z:0,on:true});const n=7+s*2;
 for(let k=0;k<n;k++){const t=['jump','jump','kill','move','spin','pad','thin','stairs'][Math.floor(r()*Math.min(8,3+s))],gap=2.2+r()*(.6+s*.12);
  if(t==='jump'){z+=gap+2;x+=(r()-.5)*3;plat(x,y-.5,z,3,1,3,col);coin(x,y+1,z)}
  else if(t==='thin'){z+=2;plat(x,y-.5,z+3,.8,1,7,0xffffff);z+=6;plat(x,y-.5,z,3,1,3,col)}
  else if(t==='kill'){z+=gap+2;plat(x,y-.5,z+2,4,1,7,col);plat(x,y+.15,z+2,4,.3,1.2,0xff2020,{kill:1});coin(x,y+2.2,z+2);z+=4}
  else if(t==='move'){z+=gap+2.5;plat(x,y-.5,z,3,1,3,0xffa040,{mv:{ax:'x',a:3+s*.2,sp:.8+s*.08,ph:r()*6}});z+=0}
  else if(t==='spin'){z+=gap+3;plat(x,y-.5,z,6,1,6,col);const bar=box(6,.4,.4,0xff2020);bar.position.set(x,y+.6,z);world.add(bar);spins.push({m:bar,x,y:y+.6,z,sp:1.2+s*.12});coin(x+2,y+1,z+2)}
  else if(t==='pad'){z+=2.5;plat(x,y-.5,z,3,1,3,0x40ff80,{pad:1});y+=3;z+=3.5;plat(x,y-.5,z,3,1,3,col);coin(x,y+1,z)}
  else if(t==='stairs'){for(let q=0;q<3;q++){z+=2.6;y+=1;plat(x,y-.5,z,2.4,1,2.4,col)}}
  if(k%4===3){z+=3;plat(x,y-.5,z,4,1,4,0xffffff);const f=box(.2,2,.2,0x3a1424),fl=box(1,.6,.05,0x7ad0ff);f.position.set(x+1.6,y+1,z);fl.position.set(x+2.1,y+1.7,z);world.add(f,fl);cps.push({x,y:y+1,z,fl,on:false})}}
 z+=4;plat(x,y-.5,z,6,1,6,0xffd75a);const gl=box(1,4,1,0xffd75a);gl.position.set(x,y+2,z+2);world.add(gl);goal={x,y,z};cp=cps[0];sp(0,1,0)}
// ---- avatar ----
const av=new THREE.Group();scene.add(av);let parts={};
function buildAvatar(){av.clear();const A=SV.av;const body=box(1,1.2,.55,A.shirt);body.position.y=1.5;const head=box(.8,.8,.8,A.skin);head.position.y=2.5;
 const fc=document.createElement('canvas');fc.width=fc.height=64;const g=fc.getContext('2d');g.fillStyle=A.skin;g.fillRect(0,0,64,64);g.fillStyle='#1a0a10';
 if(A.face==='cool'){g.fillRect(10,20,44,10);g.fillRect(30,22,4,4)}else{g.fillRect(18,22,7,9);if(A.face==='wink')g.fillRect(38,27,10,3);else g.fillRect(39,22,7,9)}g.strokeStyle='#c2264a';g.lineWidth=3;g.beginPath();g.arc(32,38,10,.3,2.8);g.stroke();g.fillStyle='rgba(255,120,150,.5)';g.fillRect(8,36,8,5);g.fillRect(48,36,8,5);
 const fm=new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(fc)});head.material=[M(A.skin),M(A.skin),M(A.skin),M(A.skin),fm,M(A.skin)];
 const la=box(.4,1.2,.4,A.skin),ra=box(.4,1.2,.4,A.skin),ll=box(.45,1,.45,A.pants),rl=box(.45,1,.45,A.pants);la.geometry.translate(0,-.5,0);ra.geometry.translate(0,-.5,0);ll.geometry.translate(0,-.5,0);rl.geometry.translate(0,-.5,0);
 la.position.set(-.72,2.05,0);ra.position.set(.72,2.05,0);ll.position.set(-.25,.95,0);rl.position.set(.25,.95,0);av.add(body,head,la,ra,ll,rl);parts={head,la,ra,ll,rl};
 if(A.hat==='cap'){const h=box(.9,.25,.9,0x6a3a1a),b=box(.9,.08,.5,0x6a3a1a);h.position.set(0,3,0);b.position.set(0,2.92,.6);av.add(h,b)}
 if(A.hat==='beanie'){const h=box(.88,.4,.88,0x9a9aa4);h.position.set(0,3.05,0);av.add(h)}
 if(A.hat==='crown'){for(let i=0;i<4;i++){const s=box(.18,.35,.18,0xffd75a);s.position.set(-.3+i*.2,3.1,.3);av.add(s)}const b=box(.85,.15,.85,0xffd75a);b.position.set(0,2.95,0);av.add(b)}
 if(A.hat==='bow'){const a=box(.35,.3,.15,0xff5a9a),b=box(.35,.3,.15,0xff5a9a);a.position.set(-.25,3.05,0);b.position.set(.25,3.05,0);av.add(a,b)}}
const Pl={x:0,y:1,z:0,vy:0,ground:false,yaw:Math.PI,camYaw:Math.PI,camPitch:.35,walk:0};
function sp(x,y,z){Pl.x=x;Pl.y=y;Pl.z=z;Pl.vy=0}
// ---- input/state ----
let keys={},state='title',msg='',msgT=0,coinsRun=0,shopOpen=false;const G=window.G={score:0,level:SV.done.length};
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code==='Space')e.preventDefault()});addEventListener('keyup',e=>keys[e.code]=0);
let drag=null;hud.addEventListener('mousedown',e=>{drag={x:e.clientX,y:e.clientY}});addEventListener('mousemove',e=>{if(drag&&state==='play'&&!shopOpen){Pl.camYaw-=(e.clientX-drag.x)*.006;Pl.camPitch=Math.max(.05,Math.min(1.2,Pl.camPitch+(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY}});addEventListener('mouseup',()=>drag=null);
bindInput({});
function say(s){msg=s;msgT=2.5}
function respawn(){const c=cp||{x:0,y:1,z:0};sp(c.x,c.y,c.z);say('Oops! Back to the checkpoint')}
function goHub(){buildHub();state='play';shopOpen=false}
function enterStage(i){if(i>=MAXS)return demoEnd('Your free demo includes the first 3 obby stages. All '+NST+' stages and the full avatar shop are in the full game.');buildStage(i);coinsRun=0;say('Stage '+(i+1)+': reach the golden flag!')}
window.OB={get Pl(){return Pl},get state(){return state},start:()=>{startMusic();goHub()},enterStage,goHub,plats:()=>plats,cps:()=>cps,goal:()=>goal,SV,buy:i=>buy(i),openShop:()=>{shopOpen=true},get mode(){return mode},coinsList:()=>coins};
function buy(i){const s=SHOP[i],k=key(s);if(!SV.own.includes(k)){if(DEMO&&s[3]>20)return demoEnd('Premium avatar items are in the full game.');if(SV.coins<s[3])return say('Need '+s[3]+' coins. Collect them in the obbies!');SV.coins-=s[3];SV.own.push(k)}SV.av[s[0]]=s[1];save();buildAvatar()}
// ---- physics ----
function solidAt(px,py,pz){for(const p of plats){if(Math.abs(px-p.x)<p.w/2+.35&&Math.abs(pz-p.z)<p.d/2+.35&&py<p.y+p.h/2&&py+2.9>p.y-p.h/2)return p}return null}
window.update=function(dt){if(msgT>0)msgT-=dt;const T=performance.now()/1000;
 for(const p of plats)if(p.mv){const o=Math.sin(T*p.mv.sp+p.mv.ph)*p.mv.a,prev=p.x;p.x=p.ox+o;p.m.position.x=p.x;p.dx=p.x-prev}
 for(const s of spins)s.m.rotation.y=T*s.sp;for(const c of coins)c.m.rotation.z=T*3;
 if(state==='play'&&!shopOpen){const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0),st=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0);
  const cy=Pl.camYaw,mx=(-Math.sin(cy)*f+Math.cos(cy)*st),mz=(-Math.cos(cy)*f-Math.sin(cy)*st),len=Math.hypot(mx,mz)||1,spd=8;const vx=mx/len*spd*(f||st?1:0),vz=mz/len*spd*(f||st?1:0);
  if(f||st){Pl.yaw=Math.atan2(vx,vz);Pl.walk+=dt*10}else Pl.walk*=.8;
  Pl.vy-=30*dt;if(keys.Space&&Pl.ground){Pl.vy=11;Pl.ground=false}
  if(!solidAt(Pl.x+vx*dt,Pl.y+.05,Pl.z))Pl.x+=vx*dt;if(!solidAt(Pl.x,Pl.y+.05,Pl.z+vz*dt))Pl.z+=vz*dt;
  const ny=Pl.y+Pl.vy*dt,hit=solidAt(Pl.x,ny,Pl.z);if(hit){if(Pl.vy<0){Pl.y=hit.y+hit.h/2;Pl.ground=true;if(hit.kill)return respawn();if(hit.pad){Pl.vy=19;Pl.ground=false}if(hit.dx)Pl.x+=hit.dx}else Pl.y=hit.y-hit.h/2-2.9;if(Pl.vy<0)Pl.vy=0}else{Pl.y=ny;Pl.ground=false}
  if(Pl.y<-15){mode==='hub'?sp(0,1,4):respawn()}
  for(const s of spins){const dx=Pl.x-s.x,dz=Pl.z-s.z,a=-s.m.rotation.y,lx=dx*Math.cos(a)-dz*Math.sin(a),lz=dx*Math.sin(a)+dz*Math.cos(a);if(Math.abs(lx)<3.3&&Math.abs(lz)<.6&&Pl.y<s.y+.4&&Pl.y+2.9>s.y-.2){respawn();break}}
  for(const c of coins)if(!c.got&&Math.hypot(Pl.x-c.m.position.x,Pl.y+1-c.m.position.y,Pl.z-c.m.position.z)<1.2){c.got=true;c.m.visible=false;SV.coins++;coinsRun++;save()}
  for(const c of cps)if(!c.on&&Math.hypot(Pl.x-c.x,Pl.z-c.z)<2&&Math.abs(Pl.y-c.y)<2){c.on=true;cp=c;if(c.fl)c.fl.material=M(0x7fd88a);say('✅ Checkpoint!')}
  if(mode==='stage'){stT+=dt;if(goal&&Math.hypot(Pl.x-goal.x,Pl.z-goal.z)<3&&Math.abs(Pl.y-goal.y)<1.5){const first=!SV.done.includes(stage);if(first)SV.done.push(stage);SV.coins+=first?10:3;G.level=SV.done.length;G.score=SV.coins;save();state='win'}}
  if(mode==='hub'&&Pl.ground)for(const p of portals){if(Math.hypot(Pl.x-p.x,Pl.z-p.z)<1.3){if(p.i==='shop'){shopOpen=true;Pl.z+=1.5}else if(p.locked){if(p.i>=MAXS){Pl.z-=2;enterStage(p.i)}else{say('Finish stage '+p.i+' first!');Pl.z-=2}}else enterStage(p.i);break}}}
 av.position.set(Pl.x,Pl.y,Pl.z);av.rotation.y=Pl.yaw;const sw=Math.sin(Pl.walk)*.7;if(parts.la){parts.la.rotation.x=sw;parts.ra.rotation.x=-sw;parts.ll.rotation.x=-sw;parts.rl.rotation.x=sw}
 const cd=11;cam.position.set(Pl.x+Math.sin(Pl.camYaw)*cd*Math.cos(Pl.camPitch),Pl.y+2+Math.sin(Pl.camPitch)*cd,Pl.z+Math.cos(Pl.camYaw)*cd*Math.cos(Pl.camPitch));cam.lookAt(Pl.x,Pl.y+2,Pl.z);
 const r=hud.getBoundingClientRect();const pr=hud.parentNode.getBoundingClientRect();glc.style.left=(r.left-pr.left+hud.parentNode.scrollLeft)+'px';glc.style.top=(r.top-pr.top+hud.parentNode.scrollTop)+'px';if(glc.width!==Math.round(r.width)||glc.height!==Math.round(r.height)){renderer.setSize(Math.round(r.width),Math.round(r.height),false);glc.style.width=r.width+'px';glc.style.height=r.height+'px';cam.aspect=r.width/r.height;cam.updateProjectionMatrix()}
 renderer.render(scene,cam)};
window.draw=function(){x.clearRect(0,0,W_,H_);try{x.drawImage(glc,0,0,W_,H_)}catch(e){};
 if(state==='title'){x.fillStyle='rgba(58,20,36,.55)';x.fillRect(0,0,W_,H_);x.textAlign='center';x.fillStyle='#fff3f7';x.font='bold 56px Georgia';x.fillText('🧱 Coffeebreak Obby World',W_/2,140);x.font='17px Georgia';
  ['Hang out at the café hub, then step on a numbered pad to start an obby!','WASD / arrows to move · Space to jump · drag to turn the camera','Grab coins, hit checkpoints, dodge red bricks and spinners, reach the golden flag.'].forEach((s,i)=>x.fillText(s,W_/2,190+i*26));
  button('p',W_/2-110,300,220,56,'▶ Play',()=>{startMusic();goHub()});x.fillStyle='#ffd75a';x.font='15px Georgia';x.fillText('🪙 '+SV.coins+' coins · '+SV.done.length+'/'+NST+' stages done'+(DEMO?' · Demo: first 3 stages':''),W_/2,390);return}
 x.textAlign='left';x.fillStyle='#3a1424';x.font='bold 17px Georgia';x.fillText('🪙 '+SV.coins+'   '+(mode==='hub'?'☕ Café hub':'Stage '+(stage+1)+' · ⏱ '+stT.toFixed(1)+'s'),12,26);
 if(mode==='stage')button('hb',W_-370,8,120,32,'☕ Back to hub',goHub,{fs:13});
 if(msgT>0){x.fillStyle='rgba(58,20,36,.85)';rr(W_/2-200,50,400,34,10);x.fill();x.fillStyle='#ffd75a';x.font='bold 15px Georgia';x.textAlign='center';x.fillText(msg,W_/2,72)}
 if(state==='win'){x.fillStyle='rgba(58,20,36,.8)';x.fillRect(0,0,W_,H_);x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 46px Georgia';x.fillText('🏁 Stage '+(stage+1)+' complete!',W_/2,220);x.fillStyle='#fff';x.font='18px Georgia';x.fillText('Time '+stT.toFixed(1)+'s · 🪙 '+coinsRun+' coins collected',W_/2,260);
  button('n',W_/2-230,300,220,50,'▶ Next stage',()=>{state='play';enterStage(stage+1)},{dis:stage+1>=NST});button('h',W_/2+10,300,220,50,'☕ Back to hub',()=>{goHub()})}
 if(shopOpen){x.fillStyle='rgba(26,10,16,.9)';rr(60,50,780,500,16);x.fill();x.fillStyle='#ffd75a';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('👕 Avatar shop · 🪙 '+SV.coins,W_/2,85);
  SHOP.forEach((s,i)=>{const own=SV.own.includes(key(s)),on=SV.av[s[0]]===s[1],X=80+(i%5)*150,Y=105+Math.floor(i/5)*95;button('s'+i,X,Y,140,80,'',()=>buy(i),{sel:on});if(s[0]!=='hat'&&s[0]!=='face'){x.fillStyle=s[1];rr(X+48,Y+10,44,30,6);x.fill()}else{x.font='26px serif';x.textAlign='center';x.fillText({none:'🚫',cap:'🧢',beanie:'🧶',crown:'👑',bow:'🎀',smile:'🙂',wink:'😉',cool:'😎'}[s[1]],X+70,Y+36)}
   x.fillStyle=on?'#1a0a10':'#ffe9c7';x.font='12px Georgia';x.textAlign='center';x.fillText(s[2],X+70,Y+56);x.fillText(own?(on?'✓ wearing':'owned'):'🪙 '+s[3],X+70,Y+72)});
  button('cl',W_/2-80,505,160,36,'Close',()=>{shopOpen=false},{fs:15})}};
buildAvatar();buildHub();startLoop();

const TOUCH_BTNS=[['⤒ Jump','rgba(120,200,120,.85)',()=>{keys.Space=1},()=>{keys.Space=0}]];const TOUCH_LOOK=(dx,dy)=>{if(state==='play'&&!shopOpen){Pl.camYaw-=dx*.008;Pl.camPitch=Math.max(.05,Math.min(1.2,Pl.camPitch+dy*.006))}};
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