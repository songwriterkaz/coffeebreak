const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Ring Designer (three.js, all on-device) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const st=document.createElement('style');st.textContent=`#rd{flex:1;width:100%;max-width:1250px;padding:8px 10px 90px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#rd h2{color:#e8a0b0;margin:6px 0}#rd button{margin:2px;background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px 9px;font:14px Georgia;cursor:pointer}
#rd button.on{background:#e8a0b0;color:#1a0a10}#rd button:disabled{opacity:.4;cursor:not-allowed}#rd select,#rd input[type=text]{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:6px;padding:4px;font:13px Georgia}
#rd .row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}#rd .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:12px;padding:10px;margin:6px 0}
#rd label{font-size:13px;color:#d9b8c0;display:block;margin:4px 0}#rd .note{font-size:12px;color:#c9a0aa}#rd canvas.v{border-radius:12px;background:#140810;touch-action:none;max-width:100%;cursor:grab}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='rd';c.parentNode.insertBefore(R,c.nextSibling);
// AU ring sizes (same letter system as UK). Circumference mm: A=37.8, +1.25 per letter.
const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');const SIZES=[];L.forEach((l,i)=>{SIZES.push({n:l,c:37.8+i*1.25});if(i<25)SIZES.push({n:l+'½',c:37.8+i*1.25+.625})});
const dia=s=>s.c/Math.PI;
const BANDS=[{k:'flat',n:'Flat'},{k:'court',n:'Court (domed)'},{k:'comfort',n:'Comfort fit'},{k:'bevel',n:'Bevelled'},{k:'knife',n:'Knife edge'},{k:'groove',n:'Centre groove'},{k:'twist',n:'Twist'},{k:'wave',n:'Wave'}];
const DEMO_B=3;
const METALS={silver:{n:'Sterling silver',c:0xdfe3e8},gold:{n:'Yellow gold',c:0xf2c45a},rose:{n:'Rose gold',c:0xe8a088},white:{n:'White gold',c:0xeeeae2},steel:{n:'Stainless steel',c:0xb8bcc2}};
const GEMS={none:'No stone',round:'Round',princess:'Princess (square)',oval:'Oval',emerald:'Emerald cut',pear:'Pear',heart:'Heart'};
const GCOL={Diamond:0xf4f8ff,Ruby:0xd0103a,Sapphire:0x1f4fd8,Emerald:0x18a058,Amethyst:0x8a3fd0,Topaz:0x3fc0e8,Citrine:0xf0a020,Pink:0xff7fb0,Onyx:0x151515};
const SET={prong4:'4-prong',prong6:'6-prong',bezel:'Bezel',halo:'Halo',channel:'Channel (3 stones)'};
const S=Object.assign({band:'flat',width:4,thick:1.8,size:'N',metal:'silver',finish:'polished',gem:'none',gsize:5,gcol:'Diamond',set:'prong4',eIn:'',eOut:'',font:'Georgia',orderUrl:'',orderEmail:''},JSON.parse(localStorage.rdS||'{}'));
if(D){S.gem='none';if(BANDS.findIndex(b=>b.k==S.band)>=DEMO_B)S.band='flat'}
const save=()=>{localStorage.rdS=JSON.stringify(S)};
const T3=window.THREE;
R.innerHTML=`<h2>💍 Coffeebreak Ring Designer</h2><div class="row"><div><canvas class="v" id="rdV" width="620" height="520"></canvas><div class="note">Drag to turn · wheel / pinch or buttons to zoom</div><button data-a="zi">＋ Zoom</button><button data-a="zo">－ Zoom</button><button data-a="spin">⟳ Auto-spin</button><button data-a="reset">Reset view</button></div><div id="rdP" style="flex:1;min-width:300px"></div></div>`;
const cv=document.getElementById('rdV');
const ren=new T3.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});ren.setPixelRatio(Math.min(2,devicePixelRatio||1));
const scene=new T3.Scene();scene.background=new T3.Color(0x140810);
const cam=new T3.PerspectiveCamera(35,620/520,1,1000);
scene.add(new T3.HemisphereLight(0xffffff,0x442233,1.1));const dl1=new T3.DirectionalLight(0xffffff,2.2);dl1.position.set(30,50,40);scene.add(dl1);const dl2=new T3.DirectionalLight(0xffd8e0,1.2);dl2.position.set(-40,-10,-30);scene.add(dl2);const dl3=new T3.PointLight(0xffffff,800);dl3.position.set(0,40,-30);scene.add(dl3);
// fake env map for metallic shine
(function(){const g=document.createElement('canvas');g.width=256;g.height=128;const q=g.getContext('2d');const gr=q.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#fff');gr.addColorStop(.45,'#888');gr.addColorStop(.5,'#222');gr.addColorStop(1,'#666');q.fillStyle=gr;q.fillRect(0,0,256,128);for(let i=0;i<8;i++){q.fillStyle='rgba(255,255,255,.8)';q.fillRect(i*32,20,10,30)}const tx=new T3.CanvasTexture(g);tx.mapping=T3.EquirectangularReflectionMapping;scene.environment=tx})();
let grp=new T3.Group();scene.add(grp);
const V={rx:.5,ry:.6,d:70,spin:false};
function place(){cam.position.set(0,0,V.d);cam.lookAt(0,0,0);grp.rotation.set(V.rx,V.ry,0)}
// band cross-section profile (r offset 0..th, y -w/2..w/2) -> list of [r,y], closed loop
function profile(k,ri,w,th){const P=[],N=16,h=w/2;
 const top=(f)=>{// f(u) outer bulge for u in -1..1
  P.push([ri,-h]);for(let i=0;i<=N;i++){const u=-1+2*i/N;P.push([ri+f(u),u*h])}P.push([ri,h]);};
 if(k=='flat'||k=='twist'||k=='wave')top(u=>th);
 else if(k=='court')top(u=>th*(.55+.45*Math.sqrt(Math.max(0,1-u*u))));
 else if(k=='bevel')top(u=>Math.abs(u)>.6?th*(1-(Math.abs(u)-.6)/.4*.45):th);
 else if(k=='knife')top(u=>th*(.5+.5*(1-Math.abs(u))));
 else if(k=='groove')top(u=>Math.abs(u)<.15?th*.7:th);
 else if(k=='comfort'){P.push([ri+th*.2,-h]);for(let i=0;i<=N;i++){const u=-1+2*i/N;P.push([ri+th*(.6+.4*Math.sqrt(Math.max(0,1-u*u))),u*h])}P.push([ri+th*.2,h]);for(let i=N;i>=0;i--){const u=-1+2*i/N;P.push([ri+th*.2*(u*u),u*h*.98])}}
 return P}
function bandGeo(){const s=SIZES.find(z=>z.n==S.size)||SIZES[26];const ri=dia(s)/2,w=+S.width,th=+S.thick;
 const P=profile(S.band,ri,w,th),M=P.length,SEG=160,pos=[],idx=[];
 for(let j=0;j<SEG;j++){const a=j/SEG*Math.PI*2;const tw=S.band=='twist'?a*3:0,wv=S.band=='wave'?Math.sin(a*8)*w*.18:0;
  for(const [r,y] of P){let rr=r,yy=y;if(tw){const dr=r-ri-th/2;const cs=Math.cos(tw),sn=Math.sin(tw);rr=ri+th/2+dr*cs-y*sn*.25;yy=y*cs+dr*sn}pos.push(Math.cos(a)*rr,yy+wv,Math.sin(a)*rr)}}
 for(let j=0;j<SEG;j++)for(let i=0;i<M;i++){const a=j*M+i,b=j*M+(i+1)%M,c2=((j+1)%SEG)*M+i,d2=((j+1)%SEG)*M+(i+1)%M;idx.push(a,c2,b,b,c2,d2)}
 const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setIndex(idx);g.rotateX(-Math.PI/2);g.computeVertexNormals();return {g,ri,th}}
function gemGeo(shape,sz){let g;const r=sz/2;
 if(shape=='round'||shape=='oval'||shape=='pear'){const pts=[new T3.Vector2(0,-r*.85),new T3.Vector2(r,0),new T3.Vector2(r*.98,r*.12),new T3.Vector2(r*.55,r*.38),new T3.Vector2(0,r*.38)];g=new T3.LatheGeometry(pts,16);if(shape=='oval')g.scale(1,1,1.35);if(shape=='pear'){const p=g.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);if(z>0)p.setX(i,p.getX(i)*(1-z/(r*1.6)));p.setZ(i,z*(z>0?1.5:1))}}}
 else if(shape=='princess'){g=new T3.CylinderGeometry(r*.75,r*.02,r*1.2,4,1);g.rotateY(Math.PI/4);g.translate(0,-r*.3,0);const t=new T3.CylinderGeometry(r*.55,r*.75,r*.35,4,1);t.rotateY(Math.PI/4);t.translate(0,r*.47,0);g=merge([g,t])}
 else if(shape=='emerald'){g=new T3.CylinderGeometry(r*.8,r*.2,r*1.1,8,1);g.scale(1,1,1.4);g.translate(0,-r*.25,0);const t=new T3.CylinderGeometry(r*.6,r*.8,r*.35,8,1);t.scale(1,1,1.4);t.translate(0,r*.47,0);g=merge([g,t])}
 else if(shape=='heart'){const sh=new T3.Shape();sh.moveTo(0,-r);sh.bezierCurveTo(r*1.3,-r*.2,r*.8,r*1.1,0,r*.4);sh.bezierCurveTo(-r*.8,r*1.1,-r*1.3,-r*.2,0,-r);g=new T3.ExtrudeGeometry(sh,{depth:r*.6,bevelEnabled:true,bevelThickness:r*.2,bevelSize:r*.12,bevelSegments:2});g.rotateX(-Math.PI/2);g.translate(0,0,0)}
 return g}
function merge(gs){const pos=[];for(const g0 of gs){const g=g0.index?g0.toNonIndexed():g0;pos.push(...g.attributes.position.array)}const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g}
function engraveTex(txt,inner){const g=document.createElement('canvas');g.width=2048;g.height=128;const q=g.getContext('2d');q.fillStyle='#fff';q.fillRect(0,0,2048,128);if(txt){q.fillStyle='#000';q.font='italic 70px '+S.font;q.textAlign='center';q.textBaseline='middle';const rep=inner?1:2;for(let i=0;i<rep;i++)q.fillText(txt,(i+.5)*2048/rep,64)}const t=new T3.CanvasTexture(g);t.wrapS=T3.RepeatWrapping;return t}
let meshes=[];
function build(){scene.remove(grp);grp=new T3.Group();scene.add(grp);meshes=[];
 const m=METALS[S.metal];const rough=S.finish=='matte'?.45:S.finish=='brushed'?.28:.08;
 const mat=new T3.MeshStandardMaterial({color:m.c,metalness:1,roughness:rough,side:T3.DoubleSide});
 const B=bandGeo();const bm=new T3.Mesh(B.g,mat);grp.add(bm);meshes.push(bm);
 // engraving overlay cylinders (visual only)
 const w=+S.width;
 if(S.eOut){const cg=new T3.CylinderGeometry(B.ri+B.th+.03,B.ri+B.th+.03,w*.6,160,1,true);cg.rotateX(-Math.PI/2);const tm=engraveTex(S.eOut,false);const om=new T3.MeshStandardMaterial({color:0x000000,transparent:true,opacity:.55,alphaMap:invert(tm),depthWrite:false});grp.add(new T3.Mesh(cg,om))}
 if(S.eIn){const cg=new T3.CylinderGeometry(B.ri+.05,B.ri+.05,w*.55,160,1,true);cg.rotateX(-Math.PI/2);const om=new T3.MeshStandardMaterial({color:0x000000,transparent:true,opacity:.6,alphaMap:invert(engraveTex(S.eIn,true)),depthWrite:false,side:T3.BackSide});grp.add(new T3.Mesh(cg,om))}
 if(S.gem!='none'&&!D){const top=B.ri+B.th;const gs=+S.gsize;const gmat=new T3.MeshPhysicalMaterial({color:GCOL[S.gcol],metalness:0,roughness:0,transmission:.6,thickness:2,ior:2.2,clearcoat:1,flatShading:true});
  const addGem=(x,s)=>{const g=gemGeo(S.gem,s);const gm=new T3.Mesh(g,gmat);gm.position.set(x,top+s*.55,0);grp.add(gm);meshes.push(gm);return gm};
  const pr=(n,x,s)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2+Math.PI/n;const p=new T3.Mesh(new T3.CylinderGeometry(.35,.45,s*.95,8),mat);p.position.set(x+Math.cos(a)*s*.48,top+s*.42,Math.sin(a)*s*.48*(S.gem=='oval'||S.gem=='emerald'?1.35:1));grp.add(p);meshes.push(p)}};
  const seat=new T3.Mesh(new T3.CylinderGeometry(gs*.32,gs*.42,gs*.5,16),mat);seat.position.set(0,top+gs*.05,0);grp.add(seat);meshes.push(seat);
  if(S.set=='channel'){[-1,0,1].forEach(k=>{addGem(k*gs*.8,gs*.75)});const ch=new T3.Mesh(new T3.BoxGeometry(gs*2.6,gs*.5,.6),mat);[-1,1].forEach(z=>{const cc=ch.clone();cc.position.set(0,top+gs*.35,z*gs*.42);grp.add(cc);meshes.push(cc)})}
  else{addGem(0,gs);if(S.set=='prong4')pr(4,0,gs);else if(S.set=='prong6')pr(6,0,gs);else if(S.set=='bezel'){const bz=new T3.Mesh(new T3.CylinderGeometry(gs*.56,gs*.5,gs*.45,32,1,true),mat);bz.position.set(0,top+gs*.45,0);if(S.gem=='oval'||S.gem=='emerald')bz.scale.z=1.35;grp.add(bz);meshes.push(bz)}
   else if(S.set=='halo'){pr(4,0,gs);const hm=new T3.MeshPhysicalMaterial({color:0xf4f8ff,roughness:0,metalness:0,clearcoat:1,flatShading:true});for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const sg=new T3.Mesh(new T3.OctahedronGeometry(gs*.13),hm);sg.position.set(Math.cos(a)*gs*.72,top+gs*.4,Math.sin(a)*gs*.72);grp.add(sg);meshes.push(sg)}}}
 }
 place();save();summary()}
function invert(t){const g=t.image,q=g.getContext('2d'),d=q.getImageData(0,0,g.width,g.height);for(let i=0;i<d.data.length;i+=4){d.data[i]=d.data[i+1]=d.data[i+2]=255-d.data[i]}q.putImageData(d,0,0);t.needsUpdate=true;return t}
// controls
let drag=null;cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);startMusic&&startMusic()});
cv.addEventListener('pointermove',e=>{if(!drag)return;V.ry+=(e.clientX-drag.x)*.01;V.rx+=(e.clientY-drag.y)*.01;drag={x:e.clientX,y:e.clientY};place()});
cv.addEventListener('pointerup',()=>drag=null);cv.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY>0?1.1:.9)},{passive:false});
let pinch=0;cv.addEventListener('touchmove',e=>{if(e.touches.length==2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinch)zoom(pinch/d);pinch=d;e.preventDefault()}},{passive:false});cv.addEventListener('touchend',()=>pinch=0);
function zoom(f){V.d=Math.max(28,Math.min(160,V.d*f));place()}
(function loop(){if(V.spin){V.ry+=.01;place()}ren.render(scene,cam);requestAnimationFrame(loop)})();
// panel
const P=document.getElementById('rdP');
function opt(o,v,lock){return Object.entries(o).map(([k,n])=>`<option value="${k}" ${k==v?'selected':''} ${lock&&lock(k)?'disabled':''}>${n}${lock&&lock(k)?' (full)':''}</option>`).join('')}
function panel(){const s=SIZES.find(z=>z.n==S.size);
P.innerHTML=`<div class="card"><b>Band</b><div>${BANDS.map((b,i)=>`<button data-band="${b.k}" class="${S.band==b.k?'on':''}" ${D&&i>=DEMO_B?'disabled title="Full version"':''}>${b.n}</button>`).join('')}</div>
<label>Width ${S.width} mm <input type="range" id="rW" min="2" max="10" step=".5" value="${S.width}"></label><label>Thickness ${S.thick} mm <input type="range" id="rT" min="1.2" max="3" step=".1" value="${S.thick}"></label>
<label>Metal look <select id="rM">${opt(Object.fromEntries(Object.entries(METALS).map(([k,v])=>[k,v.n])),S.metal)}</select> Finish <select id="rF">${opt({polished:'Polished',brushed:'Brushed',matte:'Matte'},S.finish)}</select></label></div>
<div class="card"><b>Size (AU)</b> <select id="rS">${SIZES.map(z=>`<option ${z.n==S.size?'selected':''}>${z.n}</option>`).join('')}</select> <span class="note">inside ⌀ ${dia(s).toFixed(1)} mm · circumference ${s.c.toFixed(1)} mm</span><br><button data-a="guide">📏 Sizing guide</button>
<div id="rG" style="display:none" class="note"><p>Australia uses letter sizes (A–Z, with halves), the same system as the UK.</p><p><b>String method:</b> wrap a strip of paper or string around the base of your finger, mark where it meets, and measure the length in mm. Enter it here: <input type="text" id="rC" size="5" placeholder="mm"> <button data-a="fromc">Find my size</button></p><p><b>Existing ring:</b> measure the inside diameter in mm: <input type="text" id="rDm" size="5" placeholder="mm"> <button data-a="fromd">Find my size</button></p><p>Fingers swell when warm, so measure at the end of the day. For wide bands (6 mm+) go up half a size. A jeweller's sizer is the most accurate.</p></div></div>
<div class="card"><b>Gemstone</b>${D?' <span class="note">(full version)</span>':''}<label>Shape <select id="rGs" ${D?'disabled':''}>${opt(GEMS,S.gem)}</select> Colour <select id="rGc" ${D?'disabled':''}>${opt(Object.fromEntries(Object.keys(GCOL).map(k=>[k,k])),S.gcol)}</select></label>
<label>Setting <select id="rSt" ${D?'disabled':''}>${opt(SET,S.set)}</select> Stone ${S.gsize} mm <input type="range" id="rGz" min="3" max="10" step=".5" value="${S.gsize}" ${D?'disabled':''}></label><div class="note">Stone colours are a preview. Your jeweller confirms the real stone (natural, lab-grown or simulant) and price.</div></div>
<div class="card"><b>Engraving</b><label>Outside <input type="text" id="rEo" maxlength="24" value="${esc(S.eOut)}"></label><label>Inside <input type="text" id="rEi" maxlength="30" value="${esc(S.eIn)}"></label><label>Style <select id="rFo">${opt({Georgia:'Classic serif','Brush Script MT, cursive':'Script','Courier New, monospace':'Typewriter','Arial, sans-serif':'Modern'},S.font)}</select></label><div class="note">Engraving is shown in the preview and listed on the order. Jewellers laser- or hand-engrave after casting, so it isn't cut into the STL.</div></div>
<div class="card"><b>Save & order</b><div><button data-a="png">🖼️ Design sheet PNG</button><button data-a="stl" ${D?'disabled title="Full version"':''}>🧊 Export STL${D?' (full)':''}</button><button data-a="order">💌 Order this ring</button></div>
<details><summary class="note">Order settings (shop owner)</summary><label>Order link (e.g. your shop or supplier form) <input type="text" id="rOu" size="34" value="${esc(S.orderUrl)}"></label><label>Order email <input type="text" id="rOe" size="30" value="${esc(S.orderEmail)}"></label></details>
<div class="note">Honest note: this app designs and previews rings. It does not make them. Real rings are made by Coffeebreak's chosen jewellery supplier, who will confirm the price, metal and stones, and the timing before anything is charged. Metal colours on screen are a guide only.</div><pre id="rSum" class="note" style="white-space:pre-wrap"></pre></div>`;
const on=(id,ev,f)=>{const e=document.getElementById(id);e&&e.addEventListener(ev,f)};
on('rW','input',e=>{S.width=+e.target.value;build();e.target.previousSibling.textContent='Width '+S.width+' mm '});on('rT','input',e=>{S.thick=+e.target.value;build();e.target.previousSibling.textContent='Thickness '+S.thick+' mm '});
on('rM','change',e=>{S.metal=e.target.value;build()});on('rF','change',e=>{S.finish=e.target.value;build()});on('rS','change',e=>{S.size=e.target.value;build();panel()});
on('rGs','change',e=>{S.gem=e.target.value;build()});on('rGc','change',e=>{S.gcol=e.target.value;build()});on('rSt','change',e=>{S.set=e.target.value;build()});on('rGz','input',e=>{S.gsize=+e.target.value;build()});
on('rEo','input',e=>{S.eOut=e.target.value;build()});on('rEi','input',e=>{S.eIn=e.target.value;build()});on('rFo','change',e=>{S.font=e.target.value;build()});
on('rOu','change',e=>{S.orderUrl=e.target.value.trim();save()});on('rOe','change',e=>{S.orderEmail=e.target.value.trim();save()});
}
function esc(s){return String(s||'').replace(/[&"<>]/g,m=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[m]))}
function sizeFromC(cm){let b=SIZES[0];for(const z of SIZES)if(Math.abs(z.c-cm)<Math.abs(b.c-cm))b=z;return b}
function text(){const s=SIZES.find(z=>z.n==S.size);const b=BANDS.find(x=>x.k==S.band).n;return `Coffeebreak Ring Designer: order request
Band: ${b}, ${S.width} mm wide, ${S.thick} mm thick
Metal: ${METALS[S.metal].n} (${S.finish})
Size: AU ${S.size} (inside ⌀ ${dia(s).toFixed(2)} mm, circumference ${s.c.toFixed(1)} mm)
Stone: ${S.gem=='none'||D?'none':GEMS[S.gem]+' '+S.gcol+' '+S.gsize+' mm, '+SET[S.set]+' setting'}
Engraving outside: ${S.eOut||'(none)'}
Engraving inside: ${S.eIn||'(none)'}${S.eIn||S.eOut?' ['+S.font.split(',')[0]+' style]':''}
STL attached: ${D?'no (demo)':'yes, if exported (units: mm)'}
Design ID: CB-${hash()}`}
function hash(){let h=0;const s=JSON.stringify([S.band,S.width,S.thick,S.size,S.metal,S.finish,S.gem,S.gcol,S.gsize,S.set,S.eIn,S.eOut]);for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h.toString(36).toUpperCase()}
function summary(){const e=document.getElementById('rSum');if(e)e.textContent=text()}
function dl(url,n){const a=document.createElement('a');a.href=url;a.download=n;document.body.appendChild(a);a.click();a.remove()}
function sheet(){ren.render(scene,cam);const g=document.createElement('canvas');g.width=1400;g.height=800;const q=g.getContext('2d');q.fillStyle='#1a0a12';q.fillRect(0,0,1400,800);q.drawImage(cv,30,90,780,780*cv.height/cv.width);q.fillStyle='#e8a0b0';q.font='bold 40px Georgia';q.fillText('💍 Coffeebreak Ring Design',30,60);q.fillStyle='#ffe9c7';q.font='22px Georgia';let y=120;for(const l of text().split('\n').slice(1)){q.fillText(l,840,y);y+=40}q.font='16px Georgia';q.fillStyle='#c9a0aa';q.fillText('Preview only. Final ring made and quoted by Coffeebreak\'s jewellery supplier.',840,y+20);return g}
function stl(){// binary STL of all solid meshes, mm units, world transforms
 grp.updateMatrixWorld(true);const saved=grp.rotation.clone();grp.rotation.set(0,0,0);grp.updateMatrixWorld(true);const tris=[];
 for(const m of meshes){let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;const p=g.attributes.position;const v=new T3.Vector3();for(let i=0;i<p.count;i+=3){const t=[];for(let k=0;k<3;k++){v.fromBufferAttribute(p,i+k).applyMatrix4(m.matrixWorld);t.push(v.x,v.y,v.z)}tris.push(t)}}
 grp.rotation.copy(saved);grp.updateMatrixWorld(true);
 const buf=new ArrayBuffer(84+tris.length*50),dv=new DataView(buf);const hd='Coffeebreak Ring Designer STL mm '+hash();for(let i=0;i<80;i++)dv.setUint8(i,i<hd.length?hd.charCodeAt(i):32);dv.setUint32(80,tris.length,true);
 let o=84;const a=new T3.Vector3(),b=new T3.Vector3(),cc=new T3.Vector3();for(const t of tris){a.set(t[0],t[1],t[2]);b.set(t[3],t[4],t[5]);cc.set(t[6],t[7],t[8]);const n=new T3.Vector3().subVectors(cc,b).cross(new T3.Vector3().subVectors(a,b)).normalize();for(const z of [n.x,n.y,n.z,...t]){dv.setFloat32(o,z||0,true);o+=4}dv.setUint16(o,0,true);o+=2}
 return {blob:new Blob([buf],{type:'model/stl'}),n:tris.length}}
function order(){const body=text();const subj='Ring order request CB-'+hash();
 const M=document.createElement('div');M.style.cssText='position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center';
 const has=S.orderUrl||S.orderEmail;
 M.innerHTML=`<div class="card" style="max-width:560px;background:#1e0b14;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:12px;padding:16px;font-family:Georgia"><h3 style="color:#e8a0b0;margin-top:0">💌 Order this ring</h3><pre style="white-space:pre-wrap;font-size:13px">${esc(body)}</pre><p style="font-size:13px">Orders are made by Coffeebreak's chosen jewellery supplier. You'll get a real quote (metal weight, stones, engraving, shipping) before paying. Nothing is charged by this app.${D?'':' Attach your exported STL and design sheet to the email.'}</p>
 ${has?'':'<p style="font-size:13px;color:#ffcf6a">No order link or email is set yet. Copy the summary and send it to Coffeebreak, or the shop owner can add one under Order settings.</p>'}
 <button id="oC">📋 Copy summary</button>${S.orderEmail?'<button id="oE">✉️ Email order</button>':''}${S.orderUrl?'<button id="oU">🔗 Open order page</button>':''}<button id="oX">Close</button></div>`;
 document.body.appendChild(M);const g=id=>M.querySelector('#'+id);
 g('oX').onclick=()=>M.remove();g('oC').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(body);g('oC').textContent='✅ Copied'};
 if(g('oE'))g('oE').onclick=()=>{location.href='mailto:'+encodeURIComponent(S.orderEmail)+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body)};
 if(g('oU'))g('oU').onclick=()=>{let u=S.orderUrl;if(!/^https?:\/\//.test(u))u='https://'+u;open(u+(u.includes('?')?'&':'?')+'design='+encodeURIComponent(body),'_blank','noopener')};
 window.RD_LAST_ORDER=body}
R.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;startMusic&&startMusic();
 if(t.dataset.band){S.band=t.dataset.band;build();panel();return}const a=t.dataset.a;
 if(a=='zi')zoom(.85);if(a=='zo')zoom(1.18);if(a=='spin')V.spin=!V.spin;if(a=='reset'){V.rx=.5;V.ry=.6;V.d=70;place()}
 if(a=='guide'){const g=document.getElementById('rG');g.style.display=g.style.display=='none'?'block':'none'}
 if(a=='fromc'){const v=parseFloat(document.getElementById('rC').value);if(v>30&&v<80){S.size=sizeFromC(v).n;build();panel()}}
 if(a=='fromd'){const v=parseFloat(document.getElementById('rDm').value);if(v>10&&v<26){S.size=sizeFromC(v*Math.PI).n;build();panel()}}
 if(a=='png'){dl(sheet().toDataURL('image/png'),'coffeebreak-ring-'+hash()+'.png')}
 if(a=='stl'){if(D){window.demoEnd&&demoEnd('STL export is in the full version, along with gemstones, all 8 band styles and all 38 Coffeebreak songs.');return}const r=stl();dl(URL.createObjectURL(r.blob),'coffeebreak-ring-'+hash()+'.stl')}
 if(a=='order')order()});
panel();build();
window.RD={S,build,panel,stl,sheet,text,SIZES,meshes:()=>meshes,order};
})();
function update(){}function draw(){}
