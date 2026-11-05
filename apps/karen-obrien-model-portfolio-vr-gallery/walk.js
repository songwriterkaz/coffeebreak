// Coffeebreak shared walker: desktop WASD+mouse, mobile joystick, WebXR (Quest) with thumbsticks.
window.CBWalk=function(opt){
const R=new THREE.WebGLRenderer({antialias:true});R.setSize(innerWidth,innerHeight);R.setPixelRatio(Math.min(devicePixelRatio,2));R.xr.enabled=true;document.body.appendChild(R.domElement);
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.05,800),rig=new THREE.Group();rig.add(C);S.add(rig);C.position.y=1.6;
addEventListener('resize',()=>{C.aspect=innerWidth/innerHeight;C.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});
let yaw=0,pitch=0;const keys={};addEventListener('keydown',e=>keys[e.code]=1);addEventListener('keyup',e=>keys[e.code]=0);
R.domElement.addEventListener('click',()=>{if(!opt.noLock&&!R.xr.isPresenting&&!('ontouchstart' in window))R.domElement.requestPointerLock&&R.domElement.requestPointerLock()});
addEventListener('mousemove',e=>{if(document.pointerLockElement===R.domElement){yaw-=e.movementX*.0025;pitch=Math.max(-1.4,Math.min(1.4,pitch-e.movementY*.0025))}});
// touch joystick
const J=document.createElement('div');J.style.cssText='position:fixed;left:24px;bottom:90px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.15);border:2px solid #f1c76a;display:none;z-index:50;touch-action:none';const K=document.createElement('div');K.style.cssText='position:absolute;left:35px;top:35px;width:40px;height:40px;border-radius:50%;background:#f1c76a';J.appendChild(K);document.body.appendChild(J);
const joy={x:0,y:0};let jid=null,lid=null,lx=0,ly=0;if('ontouchstart' in window)J.style.display='block';
J.addEventListener('touchstart',e=>{jid=e.changedTouches[0].identifier;e.preventDefault()},{passive:false});
addEventListener('touchmove',e=>{for(const t of e.changedTouches){if(t.identifier===jid){const r=J.getBoundingClientRect();let x=(t.clientX-r.left-55)/45,y=(t.clientY-r.top-55)/45;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}joy.x=x;joy.y=y;K.style.left=35+x*35+'px';K.style.top=35+y*35+'px'}else if(t.identifier===lid){yaw-=(t.clientX-lx)*.005;pitch=Math.max(-1.4,Math.min(1.4,pitch-(t.clientY-ly)*.005));lx=t.clientX;ly=t.clientY}}},{passive:false});
R.domElement.addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(t.clientX>innerWidth*.35){lid=t.identifier;lx=t.clientX;ly=t.clientY}});
addEventListener('touchend',e=>{for(const t of e.changedTouches){if(t.identifier===jid){jid=null;joy.x=joy.y=0;K.style.left=K.style.top='35px'}if(t.identifier===lid)lid=null}});
// VR button
const B=document.createElement('button');B.textContent='VR not available';B.disabled=true;B.id='vrbtn';B.style.cssText='position:fixed;right:12px;bottom:60px;z-index:60;padding:10px 16px;border-radius:20px;border:2px solid #f1c76a;background:#2b1a10;color:#f1c76a;font:bold 15px sans-serif';document.body.appendChild(B);
let sess=null;if(navigator.xr){navigator.xr.isSessionSupported('immersive-vr').then(ok=>{if(!ok)return;B.disabled=false;B.textContent='🥽 Enter VR';B.onclick=async()=>{if(sess){sess.end();return}const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});sess=s;R.xr.setReferenceSpaceType('local-floor');await R.xr.setSession(s);B.textContent='Exit VR';s.addEventListener('end',()=>{sess=null;B.textContent='🥽 Enter VR'})}}).catch(()=>{})}else if(!window.isSecureContext)B.textContent='VR needs https';
let snapCD=0;const ctrl=[R.xr.getController(0),R.xr.getController(1)];ctrl.forEach(c=>rig.add(c));
const api={R,S,C,rig,ctrl,get yaw(){return yaw},set yaw(v){yaw=v},speed:opt.speed||4,
 move(dt){let fx=0,fz=0,turn=0;
  if(keys.KeyW||keys.ArrowUp)fz-=1;if(keys.KeyS||keys.ArrowDown)fz+=1;if(keys.KeyA)fx-=1;if(keys.KeyD)fx+=1;if(keys.ArrowLeft)yaw+=dt*2;if(keys.ArrowRight)yaw-=dt*2;fx+=joy.x;fz+=joy.y;
  let heading=yaw;
  if(R.xr.isPresenting){const ss=R.xr.getSession();for(const src of ss.inputSources){const g=src.gamepad;if(!g||g.axes.length<4)continue;const ax=g.axes[2],ay=g.axes[3];if(src.handedness==='left'){if(Math.abs(ax)>.15)fx+=ax;if(Math.abs(ay)>.15)fz+=ay}else{if(Math.abs(ax)>.6&&snapCD<=0){yaw-=Math.sign(ax)*Math.PI/6;snapCD=.35}}}
   snapCD-=dt;const q=new THREE.Quaternion();R.xr.getCamera(C).getWorldQuaternion(q);const e=new THREE.Euler().setFromQuaternion(q,'YXZ');heading=e.y;rig.rotation.y=yaw;C.rotation.set(0,0,0)}
  else{rig.rotation.y=0;C.rotation.set(pitch,yaw,0,'YXZ')}
  const m=Math.hypot(fx,fz);if(m>1){fx/=m;fz/=m}const sp=api.speed*(keys.ShiftLeft?1.8:1)*dt;
  return{dx:(Math.cos(heading)*fx+Math.sin(heading)*fz)*sp,dz:(-Math.sin(heading)*fx+Math.cos(heading)*fz)*sp}}};
return api};
