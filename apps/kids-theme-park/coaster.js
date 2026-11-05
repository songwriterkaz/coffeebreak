(function(){'use strict';const THREE=window.THREE,V3=THREE.Vector3;
const DEMO=!!window.DEMO,MAXP=DEMO?10:60,MAXS=DEMO?2:12,D2R=Math.PI/180;
const THEMES=[
 {k:'candy',n:'Candy Land',e:'🍭',sky:0xffc6e0,gr:0xff9cc4},
 {k:'goth',n:'Pink Goth Castle',e:'🦇',sky:0x2a0f22,gr:0x4a1e3a},
 {k:'bean',n:'Coffee Bean Jungle',e:'☕',sky:0x9fd6a0,gr:0x5a3a22},
 {k:'sea',n:'Underwater Seals',e:'🦭',sky:0x1a6a9a,gr:0xd8c890},
 {k:'space',n:'Space Galaxy',e:'🪐',sky:0x070418,gr:0x2a2050},
 {k:'gold',n:'Billionaire Gold City',e:'💰',sky:0xffe6a0,gr:0xb89040},
 {k:'fairy',n:'Fairy Forest',e:'🧚',sky:0xc8b0ff,gr:0x4f8a4a}];
const TH={};THEMES.forEach(z=>TH[z.k]=z);
const DEMO_TH=['candy','goth'];const locked=k=>DEMO&&DEMO_TH.indexOf(k)<0;
const PIECES=[{k:'straight',n:'Straight'},{k:'left',n:'Curve left'},{k:'right',n:'Curve right'},{k:'lift',n:'Lift hill'},{k:'drop',n:'Big drop'},{k:'loop',n:'Loop'},{k:'cork',n:'Corkscrew'},{k:'launch',n:'Launch'},{k:'helix',n:'Helix'}];
const PN={};PIECES.forEach(z=>PN[z.k]=z.n);
const SHAPES=[{k:'teacup',n:'Teacup',e:'🫖'},{k:'coffee',n:'Coffee cup',e:'☕'},{k:'shell',n:'Seashell',e:'🐚'},{k:'rocket',n:'Rocket',e:'🚀'}];
const CCOL=['#ff6fa8','#1a0a14','#f5c542','#ffffff','#3fd0c0','#9a5cff'];
const TCOL=['#ff4f9a','#f5c542','#222033','#7fe0c0','#c4a0ff','#e8304a'];
const G=window.G={state:'title',score:0,level:0};
function sample(){return DEMO?
 {name:'Sweet Scream',pieces:[['lift','candy'],['drop','candy'],['loop','candy'],['left','candy'],['straight','goth'],['cork','goth'],['right','goth'],['helix','goth']].map(a=>({t:a[0],th:a[1]})),car:{shape:'teacup',col:0},tcol:0,props:true,fw:true,best:0}:
 {name:'Coffeebreak Fantasy',pieces:[['lift','candy'],['drop','candy'],['loop','candy'],['left','bean'],['cork','bean'],['straight','goth'],['helix','goth'],['launch','sea'],['loop','sea'],['right','space'],['drop','space'],['cork','gold'],['left','gold'],['straight','fairy'],['helix','fairy']].map(a=>({t:a[0],th:a[1]})),car:{shape:'teacup',col:0},tcol:0,props:true,fw:true,best:0}}
let saves=[];try{saves=JSON.parse(localStorage.getItem(DEMO?'coasterSavesDemo':'coasterSaves')||'[]')}catch(e){saves=[]}
let cur;try{cur=JSON.parse(localStorage.getItem(DEMO?'coasterCurDemo':'coasterCur')||'null')}catch(e){}
if(!cur||!cur.pieces)cur=sample();
let selTh=cur.pieces.length?cur.pieces[cur.pieces.length-1].th:'candy';if(locked(selTh))selTh='candy';
const persist=()=>{try{localStorage.setItem(DEMO?'coasterCurDemo':'coasterCur',JSON.stringify(cur));localStorage.setItem(DEMO?'coasterSavesDemo':'coasterSaves',JSON.stringify(saves))}catch(e){}};
let msg='',msgT=0;const say=(m,s)=>{msg=m;msgT=s||2.6};
// ---------- renderer ----------
const glc=document.createElement('canvas');glc.width=900;glc.height=600;
let renderer=null;try{renderer=new THREE.WebGLRenderer({canvas:glc,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setSize(900,600,false)}catch(e){renderer=null}
const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(70,1.5,0.1,900);
scene.add(new THREE.HemisphereLight(0xffffff,0x553344,0.95));const sun=new THREE.DirectionalLight(0xffffff,0.75);sun.position.set(40,80,30);scene.add(sun);
scene.fog=new THREE.Fog(0xffc6e0,80,320);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshLambertMaterial({color:0x3a2434}));ground.rotation.x=-Math.PI/2;scene.add(ground);
const starG=new THREE.BufferGeometry();{const a=[];for(let i=0;i<900;i++){const v=new V3(Math.random()-.5,Math.random()*.9+.05,Math.random()-.5).normalize().multiplyScalar(420);a.push(v.x,v.y,v.z)}starG.setAttribute('position',new THREE.Float32BufferAttribute(a,3))}
const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:0xffffff,size:1.6,fog:false}));stars.visible=false;scene.add(stars);
const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
const mesh=(g,m,x0,y0,z0)=>{const o=new THREE.Mesh(g,m);o.position.set(x0||0,y0||0,z0||0);return o};
// ---------- track generator (turtle) ----------
let frames=[],dist=[],total=0,trackG=null,bbox=new THREE.Box3();
function gen(pieces){const fr=[];const p=new V3(0,3,0),q=new THREE.Quaternion(),ax=new V3(),dq=new THREE.Quaternion();
 const step=(ds,pi,ya,ro,o)=>{if(pi){dq.setFromAxisAngle(ax.set(1,0,0),pi*D2R);q.multiply(dq)}if(ya){dq.setFromAxisAngle(ax.set(0,1,0),ya*D2R);q.multiply(dq)}if(ro){dq.setFromAxisAngle(ax.set(0,0,1),ro*D2R);q.multiply(dq)}
  const f=new V3(0,0,1).applyQuaternion(q);p.addScaledVector(f,ds);if(o.side)p.addScaledVector(new V3(-1,0,0).applyQuaternion(q),o.side);fr.push({p:p.clone(),q:q.clone(),bank:o.bank||0,pi:o.pi,th:o.th,fl:o.fl||''})};
 const seg=(pi,th,n,ds,pt,ya,ro,fl,bf,side)=>{for(let i=0;i<n;i++)step(ds,pt,ya,ro,{pi,th,fl,bank:bf?bf((i+.5)/n):0,side})};
 const th0=pieces.length?pieces[0].th:'candy';seg(-1,th0,12,1,0,0,0,'station');
 pieces.forEach((pc,pi)=>{const th=pc.th;switch(pc.t){
  case 'straight':seg(pi,th,16,1,0,0,0,'');break;
  case 'left':case 'right':{const d=pc.t==='left'?1:-1;seg(pi,th,18,1.2,0,5*d,0,'',s=>-d*38*Math.sin(Math.PI*s));break}
  case 'lift':seg(pi,th,8,1,-4,0,0,'lift');seg(pi,th,16,1,0,0,0,'lift');seg(pi,th,8,1,4,0,0,'lift');break;
  case 'drop':seg(pi,th,10,1,5,0,0,'drop');seg(pi,th,14,1,0,0,0,'drop');seg(pi,th,10,1,-5,0,0,'');break;
  case 'loop':seg(pi,th,36,1.5,-10,0,0,'inv',null,0.14);break;
  case 'cork':seg(pi,th,4,1,0,0,0,'');seg(pi,th,30,1,0,0,12,'inv');seg(pi,th,4,1,0,0,0,'');break;
  case 'launch':seg(pi,th,22,1,0,0,0,'launch');break;
  case 'helix':seg(pi,th,4,1.1,2,0,0,'');seg(pi,th,40,1.1,0,9,0,'',s=>-40*Math.min(1,Math.min(s,1-s)*8));seg(pi,th,4,1.1,-2,0,0,'');break}});
 seg(-2,pieces.length?pieces[pieces.length-1].th:th0,16,1,0,0,0,'brake');
 let mn=1e9;fr.forEach(F=>{if(F.fl!=='station')mn=Math.min(mn,F.p.y)});const lift=Math.max(0,2.2-mn);
 const out=[];let d=0;fr.forEach((F,i)=>{F.p.y+=lift;const f=new V3(0,0,1).applyQuaternion(F.q),u=new V3(0,1,0).applyQuaternion(F.q);if(F.bank)u.applyAxisAngle(f,F.bank*D2R);F.f=f;F.u=u;F.r=new V3().crossVectors(f,u);if(i)d+=F.p.distanceTo(fr[i-1].p);F.d=d;out.push(F)});
 return out}
function frameAt(s){s=Math.max(0,Math.min(total,s));let lo=0,hi=frames.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(frames[m].d<=s)lo=m;else hi=m}
 const A=frames[lo],B=frames[hi],k=B.d>A.d?(s-A.d)/(B.d-A.d):0;const p=A.p.clone().lerp(B.p,k),f=A.f.clone().lerp(B.f,k).normalize(),u=A.u.clone().lerp(B.u,k).normalize();
 return {p,f,u,r:new V3().crossVectors(f,u),fl:(k<.5?A:B).fl,th:(k<.5?A:B).th,pi:(k<.5?A:B).pi}}
// ---------- props ----------
function rnd(sd){let a=sd*9301+49297;return()=>{a=(a*9301+49297)%233280;return a/233280}}
function prop(k,R){const g=new THREE.Group();const r=R();
 if(k==='candy'){if(r<.5){g.add(mesh(new THREE.CylinderGeometry(.15,.15,6,6),M(0xffffff),0,3,0));const d=mesh(new THREE.CylinderGeometry(1.8,1.8,.4,20),M([0xff4f9a,0x7fe0ff,0xffe066,0xb47cff][R()*4|0]),0,6.6,0);d.rotation.x=Math.PI/2;g.add(d);const d2=mesh(new THREE.TorusGeometry(1.1,.18,6,20),M(0xffffff),0,6.6,.22);g.add(d2)}else{const c=[0xff6fa8,0x9cff8a,0xffd24a,0xa98cff][R()*4|0];g.add(mesh(new THREE.SphereGeometry(1.6,14,10,0,Math.PI*2,0,Math.PI/2),M(c),0,0,0));g.add(mesh(new THREE.SphereGeometry(.25,6,6),M(0xffffff),.8,1.2,.4))}}
 else if(k==='goth'){g.add(mesh(new THREE.CylinderGeometry(1.6,1.8,9,10),M(0x3a1830),0,4.5,0));g.add(mesh(new THREE.ConeGeometry(2.2,3.6,10),M(0xff4f9a),0,10.8,0));g.add(mesh(new THREE.BoxGeometry(.6,1,.2),M(0xffd24a,{emissive:0xaa6600}),0,6,1.75));if(r<.4){const t=mesh(new THREE.BoxGeometry(1.2,1.6,.3),M(0x777088),3,.8,0);g.add(t)}}
 else if(k==='bean'){if(r<.55){g.add(mesh(new THREE.CylinderGeometry(.3,.45,8,7),M(0x8a5a30),0,4,0));for(let i=0;i<6;i++){const l=mesh(new THREE.ConeGeometry(.7,4.5,5),M(0x2f9a3a),0,8,0);l.rotation.z=1.25;l.rotation.y=i*1.05;l.position.set(Math.cos(i*1.05)*1.6,7.6,-Math.sin(i*1.05)*1.6);l.rotation.order='YZX';g.add(l)}}else{const b=mesh(new THREE.SphereGeometry(1,14,10),M(0x5a3014),0,1.4,0);b.scale.set(1.5,1,2.2);g.add(b);const s=mesh(new THREE.BoxGeometry(.15,.3,3.6),M(0x2a1408),0,2.4,0);g.add(s)}}
 else if(k==='sea'){if(r<.5){const b=mesh(new THREE.SphereGeometry(1,14,10),M(0x8a96a8),0,1,0);b.scale.set(1.1,.9,2.2);g.add(b);g.add(mesh(new THREE.SphereGeometry(.85,12,10),M(0x9aa6b8),0,1.9,1.9));[-.35,.35].forEach(e=>g.add(mesh(new THREE.SphereGeometry(.12,6,6),M(0x111111),e,2.1,2.7)));g.add(mesh(new THREE.SphereGeometry(.14,6,6),M(0x222222),0,1.8,2.75))}else{for(let i=0;i<4;i++){const c=mesh(new THREE.ConeGeometry(.5,3+R()*3,6),M([0xff7a9a,0xffa040,0xc070ff][i%3]),(R()-.5)*3,1.8,(R()-.5)*3);g.add(c)}}for(let i=0;i<3;i++)g.add(mesh(new THREE.SphereGeometry(.3+R()*.4,8,6),M(0xbfefff,{transparent:true,opacity:.5}),(R()-.5)*4,4+R()*8,(R()-.5)*4))}
 else if(k==='space'){const pl=mesh(new THREE.SphereGeometry(2+R()*3,18,12),M([0xff8ac0,0x8ac8ff,0xffc070,0xb090ff][R()*4|0],{emissive:0x221133}),0,10+R()*14,0);g.add(pl);if(r<.6){const ring=mesh(new THREE.TorusGeometry(pl.geometry.parameters.radius*1.6,.25,6,30),M(0xfff0c0,{emissive:0x332200}),0,pl.position.y,0);ring.rotation.x=1.2;g.add(ring)}}
 else if(k==='gold'){if(r<.6){const h=8+R()*18;g.add(mesh(new THREE.BoxGeometry(3.4,h,3.4),M(0xf5c542,{emissive:0x553300}),0,h/2,0));g.add(mesh(new THREE.BoxGeometry(3.6,.4,3.6),M(0xfff2b0),0,h*.6,0))}else{const c=mesh(new THREE.CylinderGeometry(2,2,.4,24),M(0xffd24a,{emissive:0x664400}),0,3,0);c.rotation.x=Math.PI/2;g.add(c);g.add(mesh(new THREE.BoxGeometry(.4,2,.5),M(0xb88a10),0,3,.25))}}
 else{if(r<.5){g.add(mesh(new THREE.CylinderGeometry(.5,.7,2.4,8),M(0xfff4e0),0,1.2,0));g.add(mesh(new THREE.SphereGeometry(1.8,14,8,0,Math.PI*2,0,Math.PI/2),M(0xe8304a),0,2.3,0));for(let i=0;i<5;i++)g.add(mesh(new THREE.SphereGeometry(.22,6,6),M(0xffffff),Math.cos(i*1.3)*1.1,3.4,Math.sin(i*1.3)*1.1))}else{g.add(mesh(new THREE.CylinderGeometry(.3,.4,3,6),M(0x6a4428),0,1.5,0));g.add(mesh(new THREE.ConeGeometry(2,5,8),M(0x3f9a5a),0,5,0))}for(let i=0;i<3;i++)g.add(mesh(new THREE.SphereGeometry(.18,6,6),new THREE.MeshBasicMaterial({color:0xfff27a}),(R()-.5)*5,2+R()*4,(R()-.5)*5))}
 return g}
// ---------- cars ----------
function car(shape,col){const g=new THREE.Group(),m=M(new THREE.Color(col)),wm=M(0xffffff),dk=M(0x2a1420);
 if(shape==='teacup'){g.add(mesh(new THREE.CylinderGeometry(1,.7,1,18,1,true),new THREE.MeshLambertMaterial({color:new THREE.Color(col),side:THREE.DoubleSide}),0,.75,0));g.add(mesh(new THREE.CylinderGeometry(.7,.7,.1,18),dk,0,.3,0));g.add(mesh(new THREE.CylinderGeometry(1.3,1.2,.14,20),wm,0,.22,0));const h=mesh(new THREE.TorusGeometry(.35,.09,6,14),m,1.1,.8,0);h.rotation.y=Math.PI/2;g.add(h);const rim=mesh(new THREE.TorusGeometry(1,.06,6,24),M(0xf5c542),0,1.25,0);rim.rotation.x=Math.PI/2;g.add(rim)}
 else if(shape==='coffee'){g.add(mesh(new THREE.CylinderGeometry(.95,.75,1.1,18,1,true),new THREE.MeshLambertMaterial({color:new THREE.Color(col),side:THREE.DoubleSide}),0,.8,0));g.add(mesh(new THREE.CylinderGeometry(.75,.75,.1,18),M(0x5a3014),0,.35,0));g.add(mesh(new THREE.CylinderGeometry(.98,.92,.35,18,1,true),new THREE.MeshLambertMaterial({color:0xc89a6a,side:THREE.DoubleSide}),0,.85,0));const s=mesh(new THREE.TorusGeometry(.95,.07,6,24),wm,0,1.35,0);s.rotation.x=Math.PI/2;g.add(s)}
 else if(shape==='shell'){const s=mesh(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:new THREE.Color(col),side:THREE.DoubleSide}),0,.2,0);s.scale.set(1.05,.8,1.3);s.rotation.x=Math.PI;s.position.y=1.0;g.add(s);for(let i=-2;i<=2;i++){const rb=mesh(new THREE.TorusGeometry(1,.05,4,16,Math.PI),wm,0,1.0,0);rb.rotation.z=Math.PI/2;rb.rotation.y=i*.32;rb.rotation.order='YZX';rb.scale.set(.8,1.05,1.3);g.add(rb)}g.add(mesh(new THREE.BoxGeometry(1.6,.15,2.2),wm,0,.25,0))}
 else{const b=mesh(new THREE.CylinderGeometry(.75,.75,1.9,16),m,0,.75,0);b.rotation.x=Math.PI/2;g.add(b);const n=mesh(new THREE.ConeGeometry(.75,1.1,16),wm,0,.75,1.5);n.rotation.x=Math.PI/2;g.add(n);for(let i=0;i<3;i++){const f=mesh(new THREE.BoxGeometry(.08,.7,.6),M(0xf5c542),Math.cos(i*2.09+1.57)*.85,.75+Math.sin(i*2.09+1.57)*.85,-.7);f.rotation.z=i*2.09;g.add(f)}const fl=mesh(new THREE.ConeGeometry(.45,.9,10),new THREE.MeshBasicMaterial({color:0xff8a20}),0,.75,-1.35);fl.rotation.x=-Math.PI/2;g.add(fl);g.add(mesh(new THREE.BoxGeometry(1,.3,1),dk,0,1.35,.1))}
 return g}
let train=[];const trainG=new THREE.Group();scene.add(trainG);
function buildTrain(){trainG.clear();train=[];for(let i=0;i<3;i++){const c=car(cur.car.shape,CCOL[cur.car.col]);trainG.add(c);train.push(c)}}
const MB=new THREE.Matrix4();
function placeTrain(s){if(train[0])train[0].visible=!(G.state==='ride'&&R.view===0);train.forEach((c,i)=>{const F=frameAt(s-i*2.6);MB.makeBasis(F.r.clone().negate(),F.u,F.f);c.matrixAutoUpdate=false;c.matrix.copy(MB).setPosition(F.p.clone().addScaledVector(F.u,.35));c.matrixWorldNeedsUpdate=true})}
// ---------- build track meshes ----------
function disposeG(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
function buildTrack(){if(trackG){scene.remove(trackG);disposeG(trackG)}trackG=new THREE.Group();scene.add(trackG);
 frames=gen(cur.pieces);total=frames[frames.length-1].d;bbox.makeEmpty();frames.forEach(F=>bbox.expandByPoint(F.p));
 const tc=new THREE.Color(TCOL[cur.tcol]),rm=new THREE.MeshLambertMaterial({color:tc}),sm=M(tc.clone().multiplyScalar(.6)),L=[],R=[],S=[];
 frames.forEach(F=>{L.push(F.p.clone().addScaledVector(F.r,-.55));R.push(F.p.clone().addScaledVector(F.r,.55));S.push(F.p.clone().addScaledVector(F.u,-.42))});
 const tube=(pts,rad,mat)=>trackG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),pts.length*2,rad,6,false),mat));
 tube(L,.11,rm);tube(R,.11,rm);tube(S,.2,sm);
 const nT=Math.ceil(frames.length/2),ties=new THREE.InstancedMesh(new THREE.BoxGeometry(1.35,.1,.22),M(0x2a1420),nT);let k=0;
 for(let i=0;i<frames.length;i+=2){const F=frames[i];MB.makeBasis(F.r.clone().negate(),F.u,F.f).setPosition(F.p.clone().addScaledVector(F.u,-.22));ties.setMatrixAt(k++,MB)}ties.count=k;trackG.add(ties);
 const sup=[];for(let i=3;i<frames.length;i+=6){const F=frames[i];if(F.u.y>.3&&F.p.y>1.2)sup.push(F)}
 const sp=new THREE.InstancedMesh(new THREE.CylinderGeometry(.16,.24,1,6),M(0x55404e),Math.max(1,sup.length));sup.forEach((F,i)=>{const h=F.p.y-.5;MB.makeScale(1,h,1).setPosition(F.p.x,h/2,F.p.z);sp.setMatrixAt(i,MB)});sp.count=sup.length;trackG.add(sp);
 // station + brakes
 const st=frames.filter(F=>F.fl==='station'),mid=st[st.length>>1];const pl=mesh(new THREE.BoxGeometry(4.5,.4,13),M(0xffe0ea),0,0,0);MB.makeBasis(mid.r.clone().negate(),mid.u,mid.f).setPosition(mid.p.clone().addScaledVector(mid.r,2.6).addScaledVector(mid.u,-.6));pl.matrixAutoUpdate=false;pl.matrix.copy(MB);trackG.add(pl);
 const roof=mesh(new THREE.ConeGeometry(5.5,2.6,4),M(0xff4f9a),0,0,0);roof.matrixAutoUpdate=false;roof.matrix.copy(MB.clone().multiply(new THREE.Matrix4().makeTranslation(-2.6,4.6,0)).multiply(new THREE.Matrix4().makeRotationY(Math.PI/4)));trackG.add(roof);
 [-5,5].forEach(z=>{const po=mesh(new THREE.CylinderGeometry(.18,.18,4.4,6),M(0x2a1420));po.matrixAutoUpdate=false;po.matrix.copy(MB.clone().multiply(new THREE.Matrix4().makeTranslation(1.5,2,z)));trackG.add(po)});
 frames.filter((F,i)=>F.fl==='brake'&&i%3===0).forEach(F=>{const b=mesh(new THREE.BoxGeometry(.12,.35,1.2),M(0xe8304a));b.matrixAutoUpdate=false;b.matrix.copy(new THREE.Matrix4().makeBasis(F.r.clone().negate(),F.u,F.f).setPosition(F.p.clone().addScaledVector(F.u,-.3)));trackG.add(b)});
 // themed ground + props
 cur.pieces.forEach((pc,pi)=>{const fs=frames.filter(F=>F.pi===pi);if(!fs.length)return;const F=fs[fs.length>>1],T=TH[pc.th]||TH.candy;
  const disc=mesh(new THREE.CircleGeometry(15,24),M(T.gr),F.p.x,.03+pi*.002,F.p.z);disc.rotation.x=-Math.PI/2;trackG.add(disc);
  if(cur.props){const R=rnd(pi*7+3+pc.th.length);for(let j=0;j<3;j++){const side=(j%2?1:-1)*(7+R()*7),pr=prop(pc.th,R);const fp=fs[(fs.length*(j+.5)/3)|0];pr.position.set(fp.p.x+fp.r.x*side,0,fp.p.z+fp.r.z*side);pr.rotation.y=R()*6.28;trackG.add(pr)}}});
 buildTrain();placeTrain(8);G.level=cur.pieces.length;setSky(cur.pieces.length?cur.pieces[0].th:'candy')}
let skyNow='';function setSky(k){if(k===skyNow)return;skyNow=k;const T=TH[k]||TH.candy;scene.background=new THREE.Color(T.sky);scene.fog.color.set(T.sky);stars.visible=(k==='space'||k==='goth');if(G.state==='ride'){scene.fog.near=k==='sea'?30:80;scene.fog.far=k==='sea'?160:340}ground.material.color.set(k==='space'?0x14102a:k==='sea'?0x3a6a7a:0x3a2434)}
// ---------- audio ----------
let AC=null,wind=null,windG=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function noiseBuf(a,sec){const b=a.createBuffer(1,a.sampleRate*sec,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function windOn(){const a=ac();if(!a||wind)return;wind=a.createBufferSource();wind.buffer=noiseBuf(a,2);wind.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=500;f.Q.value=.6;windG=a.createGain();windG.gain.value=0;wind.connect(f);f.connect(windG);windG.connect(a.destination);wind.start()}
function windOff(){if(wind){try{wind.stop()}catch(e){}wind=null;windG=null}}
function clack(){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=180;g.gain.value=.05;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.05);o.stop(a.currentTime+.06)}
function scream(big){const a=ac();if(!a)return;const t0=a.currentTime,dur=big?1.6:1.1;const out=a.createGain();out.gain.setValueAtTime(.0001,t0);out.gain.exponentialRampToValueAtTime(big?.16:.11,t0+.08);out.gain.exponentialRampToValueAtTime(.0001,t0+dur);out.connect(a.destination);
 const base=(big?620:520)+Math.random()*180;[1,1.5].forEach((m,j)=>{const o=a.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(base*m*.8,t0);o.frequency.linearRampToValueAtTime(base*m*1.25,t0+.25);o.frequency.linearRampToValueAtTime(base*m*.95,t0+dur);const v=a.createOscillator(),vg=a.createGain();v.frequency.value=7;vg.gain.value=22*m;v.connect(vg);vg.connect(o.frequency);
  const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=j?2600:1100;f.Q.value=3;o.connect(f);f.connect(out);o.start(t0);v.start(t0);o.stop(t0+dur+.05);v.stop(t0+dur+.05)});
 const n=a.createBufferSource();n.buffer=noiseBuf(a,dur);const nf=a.createBiquadFilter();nf.type='highpass';nf.frequency.value=2500;const ng=a.createGain();ng.gain.value=.25;n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t0)}
function bang(){const a=ac();if(!a)return;const n=a.createBufferSource();n.buffer=noiseBuf(a,.8);const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=a.createGain();g.gain.setValueAtTime(.35,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.8);n.connect(f);f.connect(g);g.connect(a.destination);n.start()}
// ---------- fireworks ----------
const bursts=[];function firework(pos){const n=70,g=new THREE.BufferGeometry(),ps=new Float32Array(n*3),vs=[];for(let i=0;i<n;i++){ps[i*3]=pos.x;ps[i*3+1]=pos.y;ps[i*3+2]=pos.z;vs.push(new V3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(8+Math.random()*6))}
 g.setAttribute('position',new THREE.BufferAttribute(ps,3));const col=[0xff4f9a,0xf5c542,0x7fe0ff,0xc4a0ff,0xffffff][Math.random()*5|0];const pt=new THREE.Points(g,new THREE.PointsMaterial({color:col,size:.9,transparent:true,fog:false}));scene.add(pt);bursts.push({pt,vs,life:1.8});bang()}
function updBursts(dt){for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.life-=dt;const a=b.pt.geometry.attributes.position;for(let j=0;j<b.vs.length;j++){b.vs[j].y-=6*dt;a.array[j*3]+=b.vs[j].x*dt;a.array[j*3+1]+=b.vs[j].y*dt;a.array[j*3+2]+=b.vs[j].z*dt}a.needsUpdate=true;b.pt.material.opacity=Math.max(0,b.life/1.8);if(b.life<=0){scene.remove(b.pt);b.pt.geometry.dispose();bursts.splice(i,1)}}}
// ---------- ride ----------
const R={s:0,v:3,view:0,st:null,gV:1,gL:0,clk:0,scrT:0,prevInv:false,fwDone:{},paused:false};
function startRide(){if(cur.pieces.length<1){say('Add some track pieces first!');return}buildTrack();ac();windOn();Object.assign(R,{s:8,v:3,gV:1,gL:0,clk:0,scrT:1.5,prevInv:false,fwDone:{},paused:false,st:{maxV:0,maxG:1,minG:1,maxL:0,air:0,inv:0,maxH:0,time:0,len:total,rescue:0,screams:0}});G.state='ride'}
function thrill(st){const types=new Set(cur.pieces.map(p=>p.t)).size;const sc=1.2*Math.min(3,st.maxV/10)+1.0*Math.min(2.5,Math.max(0,st.maxG-1))+0.8*Math.min(2,st.air)+0.7*Math.min(4,st.inv)+0.5*Math.min(2,st.len/250)+0.15*types;return Math.max(0,Math.min(10,Math.round(sc*10)/10))}
const TLAB=s=>s<2?'Gentle Teacup Twirl':s<4?'Sweet Sunday Spin':s<6?'Proper Coffee Rush':s<7.5?'Double-Shot Scream':s<9?'Pink Goth Nightmare (in a good way)':'Legendary Billionaire Scream Machine';
function rideStep(dt){const st=R.st;const F=frameAt(R.s);let a=-9.8*F.f.y-.03*R.v-.0024*R.v*R.v;if(F.fl==='launch'&&R.v<26)a+=22;R.v+=a*dt;
 if(F.fl==='lift'&&R.v<4.5){R.v=4.5;R.clk-=dt;if(R.clk<=0){R.clk=.18;clack()}}if(F.fl==='brake')R.v=Math.max(2.2,R.v-11*dt);if(F.fl==='station')R.v=Math.max(R.v,3);if(R.v<1.8){R.v=1.8;st.rescue+=dt}
 R.s+=R.v*dt;st.time+=dt;
 const pA=frameAt(R.s-3).p,pB=frameAt(R.s+3).p,P0=frameAt(R.s);const kv=pA.add(pB).addScaledVector(P0.p,-2).multiplyScalar(1/9);const acc=kv.multiplyScalar(R.v*R.v).add(new V3(0,9.8,0));
 const gV=Math.max(-1.2,Math.min(5.5,1+(acc.dot(P0.u)/9.8-1)*.45)),gL=Math.max(-2.5,Math.min(2.5,acc.dot(P0.r)/9.8*.4));R.gV+=(gV-R.gV)*Math.min(1,dt*6);R.gL+=(gL-R.gL)*Math.min(1,dt*6);
 st.maxV=Math.max(st.maxV,R.v);st.maxG=Math.max(st.maxG,R.gV);st.minG=Math.min(st.minG,R.gV);st.maxL=Math.max(st.maxL,Math.abs(R.gL));st.maxH=Math.max(st.maxH,P0.p.y);if(R.gV<.25&&F.fl!=='station')st.air+=dt;
 const inv=P0.u.y<-.2;if(inv&&!R.prevInv){st.inv++;if(cur.fw&&!R.fwDone[P0.pi]){R.fwDone[P0.pi]=1;firework(P0.p.clone().addScaledVector(P0.f,8).add(new V3(0,10,0)))}}R.prevInv=inv;
 R.scrT-=dt;if(R.scrT<=0&&(R.gV>2.6||R.gV<.15||inv||(F.fl==='drop'&&R.v>12))){R.scrT=3.2;scream(R.gV>3.2||inv);st.screams++}
 if(windG)windG.gain.setTargetAtTime(Math.min(.22,R.v/120),AC.currentTime,.1);
 if(R.s>=total-1){endRide()}}
function endRide(){windOff();const st=R.st;st.score=thrill(st);if(st.score>(cur.best||0))cur.best=st.score;G.score=Math.max(G.score,Math.round(st.score*10));persist();G.state='results';
 if(cur.fw){const F=frameAt(total-6);for(let i=0;i<4;i++)setTimeout(()=>firework(F.p.clone().add(new V3((Math.random()-.5)*30,14+Math.random()*10,(Math.random()-.5)*30))),i*450)}}
// ---------- camera ----------
const orb={th:.8,ph:.75,z:1,drag:null,idle:0};
function camUpdate(dt){if(G.state==='ride'){const F=frameAt(R.s);setSky(F.th);if(R.view===0){cam.position.copy(F.p).addScaledVector(F.u,2.35).addScaledVector(F.f,-.5);cam.up.copy(F.u);cam.lookAt(F.p.clone().addScaledVector(F.f,8).addScaledVector(F.u,1.6))}else{cam.position.copy(F.p).addScaledVector(F.f,-9).addScaledVector(F.u,4.2);cam.up.set(0,1,0);cam.lookAt(F.p.clone().addScaledVector(F.u,1))}cam.fov=70+Math.min(18,R.v*.5);cam.updateProjectionMatrix();return}
 cam.fov=55;cam.updateProjectionMatrix();if(!orb.drag){orb.idle+=dt;if(orb.idle>1.5)orb.th+=dt*.12}const c=bbox.getCenter(new V3()),sz=bbox.getSize(new V3()).length();const rad=Math.max(26,sz*.62)*orb.z;scene.fog.near=rad*.8;scene.fog.far=rad*3.2;
 cam.up.set(0,1,0);cam.position.set(c.x+Math.cos(orb.th)*Math.cos(orb.ph)*rad,Math.max(4,c.y+Math.sin(orb.ph)*rad),c.z+Math.sin(orb.th)*Math.cos(orb.ph)*rad);cam.lookAt(c);if(G.state!=='results')setSky(cur.pieces.length?cur.pieces[0].th:'candy')}
// ---------- editing ----------
function addPiece(k){if(cur.pieces.length>=MAXP){if(DEMO&&window.demoEnd)window.demoEnd('The free demo allows '+MAXP+' track pieces. The full game gives you up to 60 pieces, all 7 themed worlds, every car shape and unlimited coaster saves.');else say('Track limit reached ('+MAXP+' pieces).');return}
 cur.pieces.push({t:k,th:selTh});persist();buildTrack();say(PN[k]+' added · '+TH[selTh].n,1.4)}
function undo(){if(cur.pieces.length){cur.pieces.pop();persist();buildTrack()}}
function clearT(){cur.pieces=[];persist();buildTrack();say('Track cleared: start building!')}
function randomT(){const th=THEMES.filter(z=>!locked(z.k)).map(z=>z.k);const n=Math.min(MAXP,DEMO?8:12+(Math.random()*8|0));cur.pieces=[{t:'lift',th:th[0]},{t:'drop',th:th[0]}];const ks=PIECES.map(p=>p.k);let ti=0;while(cur.pieces.length<n){if(cur.pieces.length%4===0)ti=(ti+1)%th.length;let k=ks[Math.random()*ks.length|0];if(cur.pieces.length%5===4)k='lift';cur.pieces.push({t:k,th:th[ti]})}persist();buildTrack();say('Random fantasy coaster generated!')}
function pickTheme(k){if(locked(k)){if(window.demoEnd)window.demoEnd('<b>'+TH[k].n+'</b> is in the full game! The demo includes Candy Land and Pink Goth Castle. The full game unlocks all 7 worlds: Coffee Bean Jungle, Underwater Seals, Space Galaxy, Billionaire Gold City and Fairy Forest.');return}selTh=k;say('New pieces will be '+TH[k].n,1.4)}
function repaint(){const p=cur.pieces[cur.pieces.length-1];if(!p)return;p.th=selTh;persist();buildTrack();say('Last piece repainted: '+TH[selTh].n,1.4)}
function saveCur(){const i=saves.findIndex(s=>s.name===cur.name);const copy=JSON.parse(JSON.stringify(cur));if(i>=0)saves[i]=copy;else{if(saves.length>=MAXS){say(DEMO?'Demo: '+MAXS+' save slots. The full game saves 12 coasters.':'All 12 slots used. Delete one first.');return}saves.push(copy)}persist();say('Saved “'+cur.name+'” ('+saves.length+'/'+MAXS+')')}
// DOM name input
const nameIn=document.createElement('input');nameIn.maxLength=24;nameIn.placeholder='Coaster name';nameIn.style.cssText='position:absolute;display:none;z-index:6;font:bold 18px Georgia;padding:6px 10px;border-radius:10px;border:2px solid #ff4f9a;background:#fff0f6;color:#3a1424;text-align:center';c.parentNode.appendChild(nameIn);
nameIn.addEventListener('input',()=>{cur.name=nameIn.value||'My Coaster';persist()});nameIn.addEventListener('keydown',e=>e.stopPropagation());
function placeName(show){if(!show){nameIn.style.display='none';return}const r=c.getBoundingClientRect(),pr=c.parentNode.getBoundingClientRect(),sx=r.width/900,sy=r.height/600;nameIn.style.display='block';nameIn.style.left=(r.left-pr.left+300*sx)+'px';nameIn.style.top=(r.top-pr.top+118*sy)+'px';nameIn.style.width=(300*sx-24)+'px';if(document.activeElement!==nameIn)nameIn.value=cur.name}
// ---------- input ----------
bindInput({down(p){if(G.state==='build'||G.state==='title'||G.state==='results'){orb.drag={x:p.x,y:p.y,th:orb.th,ph:orb.ph};orb.idle=0}},move(p){if(orb.drag){orb.th=orb.drag.th+(p.x-orb.drag.x)*.01;orb.ph=Math.max(.12,Math.min(1.35,orb.drag.ph+(p.y-orb.drag.y)*.008))}},up(){orb.drag=null}});
c.addEventListener('wheel',e=>{if(G.state==='build'){e.preventDefault();orb.z=Math.max(.35,Math.min(2.2,orb.z*(e.deltaY>0?1.1:.9)))}},{passive:false});
addEventListener('keydown',e=>{if(G.state==='ride'){if(e.key===' '){scream(true);R.st.screams++}if(e.key==='v'||e.key==='V')R.view^=1;if(e.key==='Escape'){windOff();G.state='build'}}});
// ---------- HUD ----------
const PINK='#ff4f9a',GOLD='#f5c542';
function panel(X,Y,w,h,a){x.fillStyle='rgba(26,8,20,'+(a||.72)+')';rr(X,Y,w,h,12);x.fill();x.strokeStyle='rgba(255,140,190,.7)';x.lineWidth=1.5;x.stroke()}
function txt(s,X,Y,sz,col,al,b){x.fillStyle=col||'#ffe9f2';x.font=(b===false?'':'bold ')+sz+'px Georgia';x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function gauge(X,Y,lab,val,mn,mx,unit,col){panel(X,Y,128,58,.7);txt(lab,X+10,Y+18,12,'#ffb8d4');txt(val,X+10,Y+44,22,col||'#fff');txt(unit,X+118,Y+44,12,'#ffb8d4','right');const k=Math.max(0,Math.min(1,(parseFloat(val)-mn)/(mx-mn)));x.fillStyle='rgba(255,255,255,.15)';x.fillRect(X+10,Y+50,108,4);x.fillStyle=col||PINK;x.fillRect(X+10,Y+50,108*k,4)}
function drawTitle(){x.fillStyle='rgba(26,8,20,.45)';x.fillRect(0,0,900,600);txt('🎢 Coffeebreak',450,120,30,'#ffd6e8','center');txt('Rollercoaster of Fantasies',450,172,46,'#fff','center');txt('Build it. Theme it. Ride it. Scream!',450,212,20,'#ffd6e8','center',false);
 button('play',300,262,300,62,'🎢 Build & Ride',()=>{G.state='build';buildTrack()},{bg:'#ff4f9a',fg:'#fff',ac:'#fff',fs:24});button('mine',300,338,300,52,'📂 My Coasters ('+saves.length+')',()=>{G.state='saves'},{fs:19});button('quick',300,404,300,52,'⚡ Quick ride',()=>{startRide()},{fs:19});
 txt(DEMO?'Free demo: 2 themed worlds · up to '+MAXP+' track pieces · 2 save slots':'Full version: 7 themed worlds · 60 pieces · 12 save slots · all car shapes',450,500,14,'#ffe9f2','center',false);txt('Drag to spin the view · tap the buttons to build (touch friendly)',450,522,13,'#ffd6e8','center',false)}
function drawBuild(){panel(6,6,150,526);txt('Track pieces',16,28,14,'#ffb8d4');PIECES.forEach((p,i)=>button('p'+i,14,38+i*46,134,40,p.n,()=>addPiece(p.k),{fs:14}));
 txt(cur.pieces.length+' / '+MAXP+' pieces',16,470,14,cur.pieces.length>=MAXP?'#ff8a8a':'#fff');txt('Length '+Math.round(total)+' m',16,490,13,'#ffd6e8',null,false);txt('Top '+Math.round(bbox.max.y)+' m high',16,508,13,'#ffd6e8',null,false);
 panel(744,72,150,370);txt('Theme for new pieces',752,92,12,'#ffb8d4');THEMES.forEach((z,i)=>button('t'+i,752,100+i*42,134,37,(locked(z.k)?'🔒 ':z.e+' ')+z.n,()=>pickTheme(z.k),{fs:11.5,sel:selTh===z.k,dis:false}));button('rep',752,398,134,36,'🎨 Repaint last',repaint,{fs:13});
 const bb=[['undo','↶ Undo',undo],['clr','🗑 Clear',clearT],['rnd','🎲 Random',randomT],['cus','✨ Customise',()=>{G.state='custom'}],['sav','💾 Save',saveCur],['mine','📂 Coasters',()=>{G.state='saves'}]];
 bb.forEach((b,i)=>button(b[0],166+i*96,540,90,48,b[1],b[2],{fs:13}));button('ride',744,450,150,82,'🎢 RIDE!',startRide,{bg:'#ff4f9a',fg:'#fff',ac:'#fff',fs:26});
 button('zi',166,8,40,36,'+',()=>orb.z=Math.max(.35,orb.z*.8),{fs:22});button('zo',212,8,40,36,'−',()=>orb.z=Math.min(2.2,orb.z*1.25),{fs:22});button('home',258,8,72,36,'⌂ Title',()=>{G.state='title'},{fs:13});
 panel(338,8,398,36,.6);txt('🎢 '+cur.name+(cur.best?'  ·  best thrill '+cur.best.toFixed(1):''),350,32,15,'#fff')}
function drawCustom(){x.fillStyle='rgba(26,8,20,.6)';x.fillRect(0,0,900,600);panel(150,50,600,500,.92);txt('✨ Customise your coaster',450,92,26,'#fff','center');placeName(true);
 txt('Car shape',180,190,15,'#ffb8d4');SHAPES.forEach((s,i)=>button('sh'+i,180+i*136,200,126,44,s.e+' '+s.n,()=>{cur.car.shape=s.k;persist();buildTrain();placeTrain(8)},{sel:cur.car.shape===s.k,fs:15}));
 txt('Car colour',180,276,15,'#ffb8d4');CCOL.forEach((cc,i)=>{button('cc'+i,180+i*62,286,52,40,'',()=>{cur.car.col=i;persist();buildTrain();placeTrain(8)},{bg:cc,sel:false});if(cur.car.col===i){x.strokeStyle='#fff';x.lineWidth=4;rr(178+i*62,284,56,44,10);x.stroke()}});
 txt('Track colour',180,356,15,'#ffb8d4');TCOL.forEach((cc,i)=>{button('tc'+i,180+i*62,366,52,40,'',()=>{cur.tcol=i;persist();buildTrack()},{bg:cc});if(cur.tcol===i){x.strokeStyle='#fff';x.lineWidth=4;rr(178+i*62,364,56,44,10);x.stroke()}});
 button('prp',180,430,260,44,(cur.props?'✅':'⬜')+' Themed props & scenery',()=>{cur.props=!cur.props;persist();buildTrack()},{fs:15});button('fw',460,430,260,44,(cur.fw?'✅':'⬜')+' Fireworks on inversions',()=>{cur.fw=!cur.fw;persist();if(cur.fw)firework(bbox.getCenter(new V3()).add(new V3(0,12,0)))},{fs:15});
 button('done',350,490,200,46,'✓ Done',()=>{placeName(false);G.state='build'},{bg:'#ff4f9a',fg:'#fff',ac:'#fff',fs:20})}
function drawSaves(){x.fillStyle='rgba(26,8,20,.66)';x.fillRect(0,0,900,600);panel(120,30,660,530,.92);txt('📂 My Coasters ('+saves.length+'/'+MAXS+')',450,72,26,'#fff','center');
 if(!saves.length)txt('No saved coasters yet. Build one and tap 💾 Save!',450,150,16,'#ffd6e8','center',false);
 saves.forEach((s,i)=>{const Y=92+i*36;if(Y>500)return;x.fillStyle=i%2?'rgba(255,255,255,.05)':'rgba(255,79,154,.08)';x.fillRect(140,Y,620,32);txt((i+1)+'. '+s.name,150,Y+22,15,'#fff');txt(s.pieces.length+' pcs'+(s.best?' · ★ '+s.best.toFixed(1):''),420,Y+22,13,'#ffd6e8',null,false);
  button('ld'+i,540,Y+2,64,28,'Load',()=>{cur=JSON.parse(JSON.stringify(s));persist();buildTrack();G.state='build'},{fs:12});button('rd'+i,610,Y+2,64,28,'Ride',()=>{cur=JSON.parse(JSON.stringify(s));persist();startRide()},{fs:12});button('dl'+i,680,Y+2,70,28,'Delete',()=>{saves.splice(i,1);persist()},{fs:12})});
 button('new',200,500,200,44,'➕ New coaster',()=>{cur={name:'Coaster '+(saves.length+1),pieces:[],car:{shape:'teacup',col:0},tcol:0,props:true,fw:true,best:0};persist();buildTrack();G.state='build'},{fs:16});button('back',500,500,200,44,'← Builder',()=>{buildTrack();G.state='build'},{fs:16})}
function drawRide(){const st=R.st,F=frameAt(R.s);if(R.view===0){const cc=CCOL[cur.car.col];x.save();x.lineCap='round';x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=34;x.beginPath();x.moveTo(60,606);x.quadraticCurveTo(450,452,840,606);x.stroke();x.strokeStyle=cc;x.lineWidth=26;x.beginPath();x.moveTo(60,600);x.quadraticCurveTo(450,446,840,600);x.stroke();x.strokeStyle=GOLD;x.lineWidth=4;x.beginPath();x.moveTo(70,584);x.quadraticCurveTo(450,434,830,584);x.stroke();x.fillStyle='#ffe0c8';[[300,520],[600,520]].forEach(h=>{x.beginPath();x.ellipse(h[0],h[1],26,16,0,0,7);x.fill()});x.restore()}gauge(10,10,'SPEED',(R.v*3.6).toFixed(0),0,110,'km/h',PINK);gauge(144,10,'G-FORCE',R.gV.toFixed(1),-1,5,'g',R.gV>3?'#ff5a5a':R.gV<.3?'#7fe0ff':GOLD);gauge(278,10,'LATERAL',Math.abs(R.gL).toFixed(1),0,2,'g','#c4a0ff');gauge(412,10,'HEIGHT',F.p.y.toFixed(0),0,60,'m','#7fe0c0');
 panel(546,10,200,58,.7);txt((TH[F.th]||TH.candy).e+' '+(TH[F.th]||TH.candy).n,556,32,14,'#fff');x.fillStyle='rgba(255,255,255,.15)';x.fillRect(556,46,180,8);x.fillStyle=PINK;x.fillRect(556,46,180*Math.min(1,R.s/total),8);
 const live=thrill(Object.assign({},st,{len:total}));panel(754,74,138,58,.7);txt('THRILL',764,92,12,'#ffb8d4');txt(live.toFixed(1)+' / 10',764,120,20,GOLD);
 if(F.fl==='lift'){txt('clack… clack… clack…',450,140,22,'#fff','center')}if(F.fl==='launch'){txt('🚀 LAUNCH!',450,140,34,GOLD,'center')}if(R.gV<.3&&F.fl!=='station'){txt('AIRTIME!',450,180,30,'#7fe0ff','center')}if(F.u.y<-.2){txt('UPSIDE DOWN!',450,180,30,PINK,'center')}
 button('ex',10,536,110,50,'⏹ Exit',()=>{windOff();G.state='build'},{fs:16});button('scr',360,532,180,58,'😱 Scream!',()=>{scream(true);st.screams++},{bg:'#ff4f9a',fg:'#fff',ac:'#fff',fs:22});button('vw',780,536,110,50,R.view?'👀 Seat':'🎥 Chase',()=>R.view^=1,{fs:15})}
function drawResults(){const st=R.st;x.fillStyle='rgba(26,8,20,.55)';x.fillRect(0,0,900,600);panel(190,50,520,500,.92);txt('🎢 Ride complete!',450,96,30,'#fff','center');txt(cur.name,450,126,17,'#ffd6e8','center',false);
 txt(st.score.toFixed(1)+' / 10',450,190,52,GOLD,'center');txt(TLAB(st.score),450,224,19,'#fff','center');for(let i=0;i<10;i++)emo(i<Math.round(st.score)?'🎀':'▫️',275+i*39,256,22);
 const rows=[['Top speed',(st.maxV*3.6).toFixed(0)+' km/h'],['Max G-force',st.maxG.toFixed(1)+' g'],['Min G (airtime)',st.minG.toFixed(1)+' g'],['Max lateral G',st.maxL.toFixed(1)+' g'],['Airtime',st.air.toFixed(1)+' s'],['Inversions',''+st.inv],['Highest point',st.maxH.toFixed(0)+' m'],['Track length',Math.round(st.len)+' m'],['Ride time',st.time.toFixed(0)+' s'],['Screams',''+st.screams]];
 rows.forEach((r,i)=>{const X=220+(i%2)*245,Y=300+(i>>1)*30;txt(r[0],X,Y,14,'#ffb8d4',null,false);txt(r[1],X+225,Y,15,'#fff','right')});
 button('again',210,470,150,50,'🔁 Ride again',startRide,{fs:16,bg:'#ff4f9a',fg:'#fff',ac:'#fff'});button('bld',375,470,150,50,'🛠 Builder',()=>{G.state='build'},{fs:16});button('sv',540,470,150,50,'💾 Save',saveCur,{fs:16})}
// ---------- loop ----------
window.update=function(dt){if(msgT>0)msgT-=dt;if(G.state==='ride'&&R.st&&!R.paused){const n=4;for(let i=0;i<n&&G.state==='ride';i++)rideStep(dt/n);if(G.state==='ride')placeTrain(R.s)}else if(G.state!=='ride')placeTrain(8);updBursts(dt);camUpdate(dt);if(G.state!=='custom')placeName(false)};
window.draw=function(){x.clearRect(0,0,900,600);if(renderer){renderer.render(scene,cam);try{x.drawImage(glc,0,0,900,600)}catch(e){}}else{x.fillStyle='#2a0f22';x.fillRect(0,0,900,600);txt('WebGL is not available in this browser.',450,300,20,'#fff','center')}
 if(G.state==='title')drawTitle();else if(G.state==='build')drawBuild();else if(G.state==='custom')drawCustom();else if(G.state==='saves')drawSaves();else if(G.state==='ride')drawRide();else if(G.state==='results')drawResults();
 if(msgT>0){x.font='bold 16px Georgia';const w=x.measureText(msg).width+30;const ty=G.state==='results'?24:476;panel(450-w/2,ty,w,36,.85);txt(msg,450,ty+24,16,'#fff','center')}x.textAlign='left'};
window.CO={G,R,get cur(){return cur},set cur(v){cur=v},get saves(){return saves},addPiece,undo,clearT,randomT,pickTheme,saveCur,startRide,endRide,buildTrack,thrill,get frames(){return frames},get total(){return total},scene,firework};
buildTrack();startLoop();
})();
