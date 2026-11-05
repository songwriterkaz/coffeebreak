(function(){
const W=CBWalk({speed:3,noLock:false}),{S,C,R,rig}=W;
S.background=new THREE.Color(0x140b06);
S.add(new THREE.HemisphereLight(0xffe8c8,0x221108,0.7));const pl=new THREE.PointLight(0xffd9a0,1.2,60);pl.position.set(0,6,-6);S.add(pl);const pl2=new THREE.PointLight(0xffd9a0,.8,40);pl2.position.set(0,5,-20);S.add(pl2);
const M=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||0});
const NEON=[0xf1c76a,0x29d3e8,0xff8a1e,0x7cff6b];
function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);S.add(m);return m}
const world=new CANNON.World({gravity:new CANNON.Vec3(0,-9.82,0)});
const mLane=new CANNON.Material('lane'),mPin=new CANNON.Material('pin'),mBall=new CANNON.Material('ball');
world.addContactMaterial(new CANNON.ContactMaterial(mLane,mBall,{friction:.04,restitution:.1}));world.addContactMaterial(new CANNON.ContactMaterial(mLane,mPin,{friction:.3,restitution:.2}));world.addContactMaterial(new CANNON.ContactMaterial(mPin,mBall,{friction:.1,restitution:.5}));world.addContactMaterial(new CANNON.ContactMaterial(mPin,mPin,{friction:.2,restitution:.5}));
function sbox(w,h,d,x,y,z,mat,rx){const b=new CANNON.Body({mass:0,material:mat||mLane,shape:new CANNON.Box(new CANNON.Vec3(w/2,h/2,d/2))});b.position.set(x,y,z);if(rx)b.quaternion.setFromEuler(rx,0,0);world.addBody(b);return b}
// hall
box(30,.1,50,0,-.05,-15,M(0x2b1a10));sbox(30,.1,50,0,-.05,-15);
box(30,8,.3,0,4,-40,M(0x3b2414));box(.3,8,50,-15,4,-15,M(0x3b2414));box(.3,8,50,15,4,-15,M(0x3b2414));box(30,8,.3,0,4,10,M(0x3b2414));
for(let i=0;i<4;i++){box(.08,.08,50,-14.8,1+i*1.6,-15,M(0,NEON[i]));box(.08,.08,50,14.8,1+i*1.6,-15,M(0,NEON[(i+2)%4]))}
const lt=new THREE.TextureLoader().load('cb-logo.jpg');const logo=new THREE.Mesh(new THREE.CircleGeometry(2,40),new THREE.MeshBasicMaterial({map:lt}));logo.position.set(0,5.2,-39.8);S.add(logo);
function sign(txt,x,y,z,ry,col){const c=document.createElement('canvas');c.width=1024;c.height=200;const g=c.getContext('2d');g.font='bold 110px sans-serif';g.textAlign='center';g.shadowColor=col;g.shadowBlur=30;g.fillStyle=col;g.fillText(txt,512,140);const m=new THREE.Mesh(new THREE.PlaneGeometry(5,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true}));m.position.set(x,y,z);m.rotation.y=ry||0;S.add(m)}
sign('COFFEEBREAK BOWL',0,6.6,-39.7,0,'#f1c76a');sign('SKEE-BALL',8,3.5,-7.5,0,'#29d3e8');sign('HOOPS',-8,4.6,-7.6,0,'#ff8a1e');sign('PRIZE COUNTER',-14.7,3,2,Math.PI/2,'#7cff6b');
// lane: x 0, foul line z 0, head pin z -18.29
const LW=1.05;box(LW,.05,22,0,.025,-9,M(0xd8a868));sbox(LW,.05,22,0,.025,-9);
box(.25,.02,22,-.66,0,-9,M(0x222222));box(.25,.02,22,.66,0,-9,M(0x222222));
box(.05,.4,22,-.8,.2,-9,M(0,0xf1c76a));sbox(.05,.6,22,-.8,.3,-9);box(.05,.4,22,.8,.2,-9,M(0,0xf1c76a));sbox(.05,.6,22,.8,.3,-9);
box(2,1.5,.2,0,.75,-20.2,M(0x111111));sbox(2,1.5,.2,0,.75,-20.2);box(LW,.02,.05,0,.06,0,M(0,0x29d3e8));
for(let i=0;i<7;i++)box(.03,.01,.15,-.4+i*.13,.06,-4.6,M(0,0xff8a1e));
const pinGeo=new THREE.CylinderGeometry(.04,.06,.38,10);const pinMat=M(0xffffff);
const PINPOS=[];for(let r=0;r<4;r++)for(let i=0;i<=r;i++)PINPOS.push([(i-r/2)*.305,-18.29-r*.264]);
const pins=PINPOS.map(p=>{const m=new THREE.Mesh(pinGeo,pinMat);const st=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.03,10),M(0,0xff8a1e));st.position.y=.1;m.add(st);S.add(m);const b=new CANNON.Body({mass:1.5,material:mPin,shape:new CANNON.Box(new CANNON.Vec3(.055,.19,.055))});b.sleepSpeedLimit=.1;world.addBody(b);return{m,b,p,up:true,gone:false}});
function setPins(all){pins.forEach(pn=>{if(all){pn.gone=false;}if(pn.gone){pn.b.position.set(50,-5,0);pn.b.type=CANNON.Body.STATIC;}else{pn.b.type=CANNON.Body.DYNAMIC;pn.b.mass=1.5;pn.b.updateMassProperties();pn.b.position.set(pn.p[0],.05+.19,pn.p[1]);pn.b.quaternion.set(0,0,0,1);pn.b.velocity.setZero();pn.b.angularVelocity.setZero();pn.b.wakeUp()}})}
function pinDown(pn){if(pn.gone)return true;const q=pn.b.quaternion,up=q.vmult(new CANNON.Vec3(0,1,0));return up.y<.75||pn.b.position.y<.1||Math.hypot(pn.b.position.x-pn.p[0],pn.b.position.z-pn.p[1])>.12}
// skee-ball at x=8: ramp up toward -z, target rings
const SK={x:8};box(1.2,.05,5,8,.5,-3.5,M(0x6b4226)).rotation.x=.18;sbox(1.2,.05,5,8,.5,-3.5,mLane,.18);
box(.05,.6,5,7.4,.7,-3.5,M(0,0x29d3e8));sbox(.05,1.2,5,7.4,.7,-3.5);box(.05,.6,5,8.6,.7,-3.5,M(0,0x29d3e8));sbox(.05,1.2,5,8.6,.7,-3.5);
box(1.2,2.5,.1,8,2,-6.8,M(0x2b1a10));sbox(1.2,2.5,.1,8,2,-6.8);box(.05,2,1.6,7.4,2,-6.1,M(0x2b1a10));sbox(.05,2,1.6,7.4,2,-6.1);box(.05,2,1.6,8.6,2,-6.1,M(0x2b1a10));sbox(.05,2,1.6,8.6,2,-6.1);
sbox(1.2,.05,1.6,8,1.3,-6.1);[.15,.3,.45].forEach((r,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(r,.02,6,24),M(0,NEON[i]));t.rotation.x=Math.PI/2;t.position.set(8,1.36,-6.1);S.add(t)});
// hoops at x=-8
box(1.8,1.05,.05,-8,3.4,-6,M(0xffffff));sbox(1.8,1.05,.05,-8,3.4,-6);box(.1,3.5,.1,-8,1.75,-6.1,M(0x333333));
const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.02,6,20),M(0,0xff8a1e));rim.rotation.x=Math.PI/2;rim.position.set(-8,3.05,-5.7);S.add(rim);
for(let i=0;i<10;i++){const a=i/10*6.283;const b=new CANNON.Body({mass:0,shape:new CANNON.Sphere(.02)});b.position.set(-8+Math.cos(a)*.23,3.05,-5.7+Math.sin(a)*.23);world.addBody(b)}
// prize counter
box(1,1.1,6,-13.5,.55,2,M(0x6b4226));box(.05,.05,6,-13,1.1,2,M(0,0x7cff6b));
// balls
const BC=[0x6b4226,0xf1c76a,0x29d3e8,0xff8a1e];let ball=null;
function throwBall(pos,dir,power){if(ball){world.removeBody(ball.b);S.remove(ball.m)}const r=mode==='bowl'?.109:mode==='skee'?.07:.12;const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),M(BC[cp%4],0x110800));S.add(m);const b=new CANNON.Body({mass:mode==="bowl"?7:mode==='skee'?.4:.6,material:mBall,shape:new CANNON.Sphere(r)});
 if(mode==='bowl'){b.position.set(Math.max(-.4,Math.min(.4,pos.x)),r+.06,-.3);const d=new THREE.Vector3(dir.x,0,dir.z).normalize();b.velocity.set(d.x*(7+power*5),0,d.z*(7+power*5))}
 else if(mode==='skee'){b.position.set(8+Math.max(-.4,Math.min(.4,pos.x-8)),.35,-1);const d=new THREE.Vector3(dir.x*.4,0,-1).normalize();b.velocity.set(d.x*(3+power*4),0,d.z*(3+power*4))}
 else{b.position.copy(pos);const s=4+power*5;b.velocity.set(dir.x*s,dir.y*s+2.5,dir.z*s)}
 world.addBody(b);ball={m,b,t:0,mode,lastY:b.position.y};return ball}
// game state
let mode='bowl',NP=1,cp=0,frames,rollInFrame=0,standingBefore=10,tickets=+localStorage.cbTickets||0,settled=true,hoopShots=0,skeeShots=0;
const $=id=>document.getElementById(id);
function newGame(n){NP=n;standingBefore=10;settled=true;cp=0;frames=Array.from({length:n},()=>[]);rollInFrame=0;setPins(true);ui()}
function score(rolls){let s=0,i=0,out=[];for(let f=0;f<10;f++){if(i>=rolls.length)break;if(rolls[i]===10){if(rolls[i+2]===undefined){out.push(null);break}s+=10+rolls[i+1]+rolls[i+2];i++}else if(rolls[i+1]===undefined){out.push(null);break}else if(rolls[i]+rolls[i+1]===10){if(rolls[i+2]===undefined){out.push(null);break}s+=10+rolls[i+2];i+=2}else{s+=rolls[i]+rolls[i+1];i+=2}out.push(s)}return out}
function frameOf(r){let f=0,i=0;while(i<r.length&&f<9){if(r[i]===10)i++;else i+=2;f++}return{f,i}}
function done(r){const{f,i}=frameOf(r);if(f<9)return false;const t=r.slice(i);if(t.length<2)return false;if(t[0]===10||t[0]+t[1]===10)return t.length===3;return true}
function sym(r){const out=[];let i=0;for(let f=0;f<10&&i<r.length;f++){if(f<9){if(r[i]===10){out.push('X');i++}else{out.push(r[i]+(r[i+1]===undefined?'':r[i]+r[i+1]===10?'/':r[i+1]));i+=2}}else{let s='';const t=r.slice(i);t.forEach((v,j)=>{s+=v===10?'X':j>0&&t[j-1]!==10&&t[j-1]+v===10&&j!==2?'/':v});out.push(s)}}return out}
function addTickets(n,why){tickets+=n;localStorage.cbTickets=tickets;flash(`+${n} tickets: ${why}`)}
let ft=0;function flash(s){$('info').innerHTML=s;$('info').style.display='block';ft=2.5}
function endRoll(){const r=frames[cp];const down=pins.filter(pinDown).length;const knocked=down-(10-standingBefore);r.push(knocked);
 const tenth=frameOf(r.slice(0,-1)).f>=9;const st=frameOf(r.slice(0,-1));
 if(knocked===10&&(rollInFrame===0||tenth)){flash('☕ STRIKE!');addTickets(5,'strike')}else if(down===10&&rollInFrame>0){flash('SPARE!');addTickets(3,'spare')}else flash(knocked+' pin'+(knocked===1?'':'s'));
 pins.forEach(p=>{if(pinDown(p))p.gone=true});
 let frameOver;if(!tenth){frameOver=knocked===10&&rollInFrame===0||rollInFrame===1}else frameOver=done(r);
 if(tenth&&!frameOver&&pins.every(p=>p.gone))pins.forEach(p=>p.gone=false);
 if(frameOver){rollInFrame=0;pins.forEach(p=>p.gone=false);const all=frames.every(done);if(all){const sc=frames.map(f=>score(f).slice(-1)[0]);const w=sc.indexOf(Math.max(...sc));flash(`Game over! ${NP>1?'Player '+(w+1)+' wins':'Score '+sc[0]} · New game started`);addTickets(Math.floor(Math.max(...sc)/20),'game bonus');setTimeout(()=>newGame(NP),3000)}else{do{cp=(cp+1)%NP}while(done(frames[cp]))}}else rollInFrame++;
 setPins(false);standingBefore=pins.filter(p=>!p.gone).length;ui()}
function ui(){const T=$('sc');if(!T||!frames)return;T.innerHTML=frames.map((r,p)=>{const sy=sym(r),sc=score(r);return`<tr${p===cp?' class="cur"':''}><th>P${p+1}</th>`+Array.from({length:10},(_,f)=>`<td><small>${sy[f]||''}</small><br>${sc[f]??''}</td>`).join('')+'</tr>'}).join('');$('tk').textContent=tickets;$('mode').textContent={bowl:'Bowling · Player '+(cp+1),skee:'Skee-Ball',hoop:'Hoops'}[mode]}
// stations
const ST={bowl:[0,0,2.5,0],skee:[8,0,1.5,0],hoop:[-8,0,-1,0],prize:[-11.5,0,2,Math.PI/2]};
function go(k){if(k==='prize'){rig.position.set(...ST.prize.slice(0,3));W.yaw=ST.prize[3];showPrizes();return}$('prz').style.display='none';mode=k;rig.position.set(...ST[k].slice(0,3));W.yaw=0;ui()}
const PR=[['Coffeebreak sticker (virtual)',20],['Golden coffee bean badge',50],['Neon mug trophy',120],['Bowling legend crown',300],['Coffeebreak Hall of Fame',1000]];
function showPrizes(){const own=JSON.parse(localStorage.cbPrizes||'[]');$('prz').style.display='block';$('prz').innerHTML='<b>Prize Counter</b> · '+tickets+' tickets<br><small>Tickets only, no real money. Prizes are fun virtual trophies.</small>'+PR.map((p,i)=>`<div>${p[0]} · ${p[1]} 🎟 <button class="tp" ${tickets<p[1]?'disabled':''} onclick="CBB.buy(${i})">Swap</button></div>`).join('')+(own.length?'<div>Your trophies: '+own.join(', ')+'</div>':'')+'<button class="tp" onclick="CBB.go(\'bowl\')">Close</button>'}
function buy(i){const p=PR[i];if(tickets<p[1])return;tickets-=p[1];localStorage.cbTickets=tickets;const o=JSON.parse(localStorage.cbPrizes||'[]');o.push(p[0]);localStorage.cbPrizes=JSON.stringify(o);showPrizes();ui()}
// throwing: hold to charge
let charging=0,power=0;const bar=$('pw');
function aim(){if(R.xr.isPresenting&&vrCtrl){const p=new THREE.Vector3(),q=new THREE.Quaternion();vrCtrl.getWorldPosition(p);vrCtrl.getWorldQuaternion(q);return{pos:p,dir:new THREE.Vector3(0,0,-1).applyQuaternion(q)}}const p=new THREE.Vector3(),d=new THREE.Vector3();C.getWorldPosition(p);C.getWorldDirection(d);return{pos:p.add(d.clone().multiplyScalar(.4)),dir:d}}
function startC(){if(mode==='prize'||$('prz').style.display==='block')return;if(mode==='bowl'&&ball&&ball.mode==='bowl'&&!settled)return;charging=1;power=0}
function release(){if(!charging)return;charging=0;const a=aim();throwBall(a.pos,a.dir,power);if(mode==='bowl'){settled=false}else if(mode==='hoop')hoopShots++;else skeeShots++;bar.style.width='0'}
addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat)startC()});addEventListener('keyup',e=>{if(e.code==='Space')release()});
R.domElement.addEventListener('mousedown',()=>{if(document.pointerLockElement)startC()});addEventListener('mouseup',release);
$('thr').addEventListener('touchstart',e=>{e.preventDefault();startC()},{passive:false});$('thr').addEventListener('touchend',e=>{e.preventDefault();release()},{passive:false});$('thr').onmousedown=startC;
let vrCtrl=null;W.ctrl.forEach(c=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.01,.02,.15,6),M(0,0xf1c76a));m.rotation.x=-Math.PI/2;c.add(m);c.addEventListener('selectstart',()=>{vrCtrl=c;startC()});c.addEventListener('selectend',()=>{vrCtrl=c;release()});c.addEventListener('squeezestart',()=>{const k=['bowl','skee','hoop'];go(k[(k.indexOf(mode)+1)%3])})});
// loop
const clock=new THREE.Clock();
R.setAnimationLoop(()=>{const dt=Math.min(clock.getDelta(),.05);const mv=W.move(dt);rig.position.x=Math.max(-14,Math.min(14,rig.position.x+mv.dx));rig.position.z=Math.max(-2,Math.min(9,rig.position.z+mv.dz));
 if(charging){power=Math.min(1,power+dt*.8);bar.style.width=power*100+'%'}
 world.step(1/120,dt,6);pins.forEach(p=>{p.m.position.copy(p.b.position);p.m.quaternion.copy(p.b.quaternion);p.m.visible=!p.gone});
 if(ball){ball.t+=dt;ball.m.position.copy(ball.b.position);ball.m.quaternion.copy(ball.b.quaternion);const b=ball.b.position;
  if(ball.mode==='bowl'&&!settled&&(ball.t>7||(b.z<-19.5||b.y<-1)&&ball.t>1.5)){if(!ball.w)ball.w=ball.t;if(ball.t-ball.w>2||ball.t>7){settled=true;endRoll()}}
  if(ball.mode==='hoop'&&ball.lastY>=3.05&&b.y<3.05&&Math.hypot(b.x+8,b.z+5.7)<.2){flash('🏀 Swish! +2 tickets');addTickets(2,'basket')}
  if(ball.mode==='skee'&&!ball.sc&&b.y<1.45&&b.y>1.2&&b.z<-5.4&&ball.b.velocity.length()<1.5){ball.sc=1;const d=Math.hypot(b.x-8,b.z+6.1);const pts=d<.15?50:d<.3?30:d<.45?20:10;addTickets(pts/10,'skee-ball '+pts)}
  ball.lastY=b.y}
 if(ft>0){ft-=dt;if(ft<=0)$('info').style.display='none'}R.render(S,C)});
window.CBB={ball:()=>ball&&[ball.b.position.z.toFixed(2),ball.b.position.y.toFixed(3),ball.b.velocity.length().toFixed(2),ball.t.toFixed(2)].join(" "),go,buy,newGame,throwTest:(p)=>{const a=aim();throwBall(a.pos,a.dir,p);if(mode==='bowl')settled=false},get frames(){return frames},get tickets(){return tickets},score,pins,get settled(){return settled},endRoll};
$('np').onchange=e=>newGame(+e.target.value);newGame(1);go('bowl');
})();
