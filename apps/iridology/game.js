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
function skull(X,Y,s,col){x.fillStyle=col||'#ffe9ef';x.beginPath();x.arc(X,Y,6*s,0,7);x.fill();x.fillRect(X-3.5*s,Y+3*s,7*s,4*s);x.fillStyle='#12060c';x.beginPath();x.arc(X-2.3*s,Y,1.6*s,0,7);x.arc(X+2.3*s,Y,1.6*s,0,7);x.fill()}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}x.fillStyle='#8a1030';x.beginPath();x.arc(X,Y,2.2*s,0,7);x.fill()}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Iridology: Eye Reader =====
const DEMO=()=>!!window.DEMO;
const COL={Blue:['#3a78c8','#9cc8f0'],Green:['#3a8a50','#b8d88a'],Hazel:['#6a7a30','#c89040'],Brown:['#5a3418','#a06a30'],Grey:['#6a7a88','#c8d0d8'],Amber:['#a86a10','#f0c040'],Violet:['#6a4aa8','#c8a8f0']};
const TYPES={Jewel:{d:'Dots and pigment flecks',r:'The Jewel is the thinker: analytical, focused and articulate. You notice details others miss, love learning, and lead with your mind. Growth tip: let yourself feel before you fix.'},
 Flower:{d:'Rounded, petal-like openings (lacunae)',r:'The Flower is the feeler: expressive, spontaneous and warm. You light up rooms, respond to beauty and music, and love deeply. Growth tip: finish what you start and protect your energy.'},
 Stream:{d:'Smooth, even radial fibres with no marks',r:'The Stream is the sensitive soul: calm, intuitive and kind. You are a natural helper and peacemaker. Growth tip: speak up for what you need too.'},
 Shaker:{d:'A mix of petals AND flecks',r:'The Shaker is the mover: dynamic, visionary and a little bit wild. You dream big and shake things up. Growth tip: ground your big ideas with small daily steps.'}};
const ZONES=[[12,'Brain & mind','Traditionally linked with the mind, mental energy and thought. A busy zone here is read as a busy, creative thinker.'],[1,'Head & senses','Associated with the senses, sinuses and the face in classic charts.'],[2,'Throat & neck','Linked to the throat, neck and self-expression.'],[3,'Shoulder & arm','Classic charts place the shoulder, arm and upper body here.'],[4,'Lungs & chest','Associated with the lungs, chest and breath.'],[5,'Upper abdomen','Linked with the upper abdomen and digestion in traditional maps.'],[6,'Legs & feet','Traditionally linked with the lower body, legs and feet: your grounding.'],[7,'Kidneys & lower back','Associated with the kidneys and lower back.'],[8,'Pelvis','Traditionally linked to the pelvis and hips.'],[9,'Heart (left eye) / liver (right eye)','Classic charts disagree between eyes here; read as the emotional centre.'],[10,'Ear & jaw','Associated with the ear and jaw.'],[11,'Forehead & intuition','Linked with the forehead, sometimes read as intuition and imagination.']];
const DEMOZ=[12,4,8];
const ENC=[['Blue eyes','Lowest melanin; light scatters to look blue. Common in northern Europe.'],['Green eyes','Light melanin plus a yellow lipochrome. Only about 2% of people!'],['Hazel eyes','A shifting mix of green, gold and brown that changes with light.'],['Brown eyes','The most common colour worldwide; lots of melanin.'],['Grey eyes','Like blue, but with denser collagen in the stroma, giving a misty look.'],['Amber eyes','Solid golden-copper, rich in lipochrome.'],['Violet eyes','Very rare; usually a blue eye with red light reflecting through.'],['Crypts / lacunae','Small openings in the iris fibres — the "Flower" marker.'],['Pigment flecks / freckles','Little dots of colour — the "Jewel" marker.'],['Contraction / furrow rings','Circular lines around the iris, read as stress-holding in iridology.'],['Limbal ring','A dark ring around the outer edge, often read as youthful.'],['Collarette','The wavy ring between the pupil zone and the outer iris.'],['Heterochromia','Two different colours, in two eyes or within one eye. Totally harmless and striking!']];
const G={state:'design',score:0,level:1,tab:'design',col:'Blue',type:'Jewel',rings:1,flecks:true,limbal:true,seed:7,zone:null,photo:null,enc:0};
const SAVK='irisSave';try{Object.assign(G,JSON.parse(localStorage[SAVK]||'{}'),{photo:null,state:'design'})}catch(e){}
function save(){const {col,type,rings,flecks,limbal,seed}=G;localStorage[SAVK]=JSON.stringify({col,type,rings,flecks,limbal,seed})}
const CX=300,CY=310,R=200;
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
const file=document.createElement('input');file.type='file';file.accept='image/*';file.style.display='none';document.body.appendChild(file);
file.onchange=()=>{const f=file.files[0];if(!f)return;const im=new Image();im.onload=()=>{G.photo=im};im.src=URL.createObjectURL(f)};// processed locally, never uploaded
function drawIris(){x.save();x.beginPath();x.arc(CX,CY,R,0,7);x.clip();
 if(G.photo){const im=G.photo,s=Math.max(2*R/im.width,2*R/im.height);x.drawImage(im,CX-im.width*s/2,CY-im.height*s/2,im.width*s,im.height*s)}
 else{const [a,b]=COL[G.col];const g=x.createRadialGradient(CX,CY,30,CX,CY,R);g.addColorStop(0,b);g.addColorStop(.35,G.col==='Hazel'?'#c89040':b);g.addColorStop(.7,a);g.addColorStop(1,a);x.fillStyle=g;x.fillRect(CX-R,CY-R,2*R,2*R);
  const r=rng(G.seed);x.lineWidth=1.3;for(let i=0;i<260;i++){const th=r()*Math.PI*2,r0=60+r()*20,r1=R*(.75+r()*.25);x.strokeStyle='rgba(255,255,255,'+(.08+r()*.18)+')';x.beginPath();x.moveTo(CX+Math.cos(th)*r0,CY+Math.sin(th)*r0);x.quadraticCurveTo(CX+Math.cos(th+.05)*(r0+r1)/2,CY+Math.sin(th+.05)*(r0+r1)/2,CX+Math.cos(th)*r1,CY+Math.sin(th)*r1);x.stroke()}
  x.strokeStyle='rgba(255,240,200,.5)';x.lineWidth=3;x.beginPath();for(let i=0;i<=60;i++){const th=i/60*Math.PI*2,rr2=95+Math.sin(i*1.7)*8;i?x.lineTo(CX+Math.cos(th)*rr2,CY+Math.sin(th)*rr2):x.moveTo(CX+Math.cos(th)*rr2,CY+Math.sin(th)*rr2)}x.stroke();
  if(G.type==='Flower'||G.type==='Shaker')for(let i=0;i<9;i++){const th=r()*Math.PI*2,d=110+r()*60;x.fillStyle='rgba(20,10,10,.35)';x.beginPath();x.ellipse(CX+Math.cos(th)*d,CY+Math.sin(th)*d,14,7,th,0,7);x.fill()}
  if((G.type==='Jewel'||G.type==='Shaker')&&G.flecks)for(let i=0;i<22;i++){const th=r()*Math.PI*2,d=80+r()*100;x.fillStyle=r()>.5?'#5a2a08':'#d8901a';x.beginPath();x.arc(CX+Math.cos(th)*d,CY+Math.sin(th)*d,2+r()*4,0,7);x.fill()}
  else if(G.flecks&&G.type!=='Stream')0;
  for(let k=0;k<G.rings;k++){x.strokeStyle='rgba(30,15,10,.35)';x.lineWidth=2;x.beginPath();x.arc(CX,CY,140+k*18,0,7);x.stroke()}
  if(G.limbal){x.strokeStyle='rgba(15,10,10,.85)';x.lineWidth=16;x.beginPath();x.arc(CX,CY,R-6,0,7);x.stroke()}
  x.fillStyle='#050305';x.beginPath();x.arc(CX,CY,58,0,7);x.fill();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(CX-60,CY-70,22,14,-.6,0,7);x.fill()}
 x.restore();x.strokeStyle='#e8a0b0';x.lineWidth=3;x.beginPath();x.arc(CX,CY,R,0,7);x.stroke()}
function zoneAt(p){const dx=p.x-CX,dy=p.y-CY,d=Math.hypot(dx,dy);if(d>R+30||d<55)return null;let a=Math.atan2(dx,-dy)*6/Math.PI;let h=Math.round((a+12)%12);return h===0?12:h}
function zoneLocked(h){return DEMO()&&!DEMOZ.includes(h)}
function drawChart(){for(let h=1;h<=12;h++){const a0=((h-.5)/12)*Math.PI*2-Math.PI/2,a1=a0+Math.PI/6;const lock=zoneLocked(h);x.fillStyle=G.zone===h?'rgba(232,160,176,.45)':lock?'rgba(0,0,0,.35)':'rgba(255,255,255,.04)';x.beginPath();x.moveTo(CX,CY);x.arc(CX,CY,R+28,a0,a1);x.closePath();x.fill();x.strokeStyle='rgba(255,230,240,.7)';x.lineWidth=1;x.stroke();
 const am=(h/12)*Math.PI*2-Math.PI/2;x.fillStyle='#fff';x.font='bold 15px Georgia';x.textAlign='center';x.fillText(lock?'🔒':h,CX+Math.cos(am)*(R+14),CY+Math.sin(am)*(R+14)+5)}
 x.strokeStyle='rgba(255,230,240,.5)';[60,100,150].forEach(r=>{x.beginPath();x.arc(CX,CY,r,0,7);x.stroke()});x.textAlign='left'}
function panel(){const X=545;
 ['design','chart','reading','enc'].forEach((k,i)=>button('t'+k,X+i*88,50,84,32,['🎨 Design','🕐 Chart','🔮 Reading','📖 Guide'][i],()=>{if(DEMO()&&(k==='reading'||k==='enc'))return demoEnd('The free demo has the iris designer and 3 chart zones. Get the full app for every zone, your eye personality reading, the eye encyclopedia, photo upload and all 38 songs!');G.tab=k},{sel:G.tab===k,fs:12}));
 x.fillStyle='#ffe9c7';x.textAlign='left';
 if(G.tab==='design'){x.font='bold 14px Georgia';x.fillText('Colour',X,108);Object.keys(COL).forEach((k,i)=>button('c'+k,X+(i%4)*86,116+Math.floor(i/4)*36,80,30,k,()=>{G.col=k;G.photo=null;save()},{sel:G.col===k&&!G.photo,fs:13,bg:COL[k][0]}));
  x.textAlign='left';x.fillStyle='#ffe9c7';x.fillText('Iris type / pattern',X,208);Object.keys(TYPES).forEach((k,i)=>button('y'+k,X+i*86,216,80,30,k,()=>{G.type=k;save()},{sel:G.type===k,fs:13}));
  x.textAlign='left';x.fillStyle='#ffe9c7';x.fillText('Rings',X,276);[0,1,2,3].forEach(n=>button('r'+n,X+50+n*44,258,38,28,''+n,()=>{G.rings=n;save()},{sel:G.rings===n,fs:13}));
  button('fl',X,300,160,30,(G.flecks?'✓ ':'')+'Flecks',()=>{G.flecks=!G.flecks;save()},{fs:13});button('lb',X+170,300,170,30,(G.limbal?'✓ ':'')+'Limbal ring',()=>{G.limbal=!G.limbal;save()},{fs:13});
  button('rn',X,342,160,32,'🎲 Random eye',()=>{const ks=Object.keys(COL),ts=Object.keys(TYPES);G.col=ks[Math.random()*ks.length|0];G.type=ts[Math.random()*4|0];G.rings=Math.random()*4|0;G.flecks=Math.random()>.4;G.limbal=Math.random()>.3;G.seed=1+Math.random()*1e6|0;G.photo=null;save()},{fs:13});
  button('up',X+170,342,170,32,(DEMO()?'🔒 ':'')+'📷 Upload eye photo',()=>{if(DEMO())return demoEnd('Photo upload is in the full app (your photo is processed on your device only, never uploaded).');file.click()},{fs:13});
  x.textAlign='left';x.fillStyle='#c8b0c0';x.font='12px Georgia';wrapT('Photos are processed on your device only and never uploaded. Line up your eye so the pupil is in the centre.',X,396,340,16);
  x.fillStyle='#ffe9c7';x.font='14px Georgia';wrapT('Your iris: '+G.col+' '+G.type+' — '+TYPES[G.type].d+'. Open the Chart tab and tap a zone!',X,450,340,19)}
 else if(G.tab==='chart'){x.font='bold 17px Georgia';x.fillText('Iridology clock chart',X,112);x.font='14px Georgia';
  if(!G.zone)wrapT('Tap a zone on the iris (like a clock face) to see its traditional iridology meaning.'+(DEMO()?' Demo: zones 12, 4 and 8.':''),X,140,340,20);
  else{const z=ZONES.find(q=>q[0]===G.zone);x.fillStyle='#e8a0b0';x.font='bold 20px Georgia';x.fillText(z[0]+" o'clock: "+z[1],X,145);x.fillStyle='#ffe9c7';x.font='15px Georgia';wrapT(z[2],X,175,340,21)}}
 else if(G.tab==='reading'){const T=TYPES[G.type];x.font='bold 22px Georgia';x.fillStyle='#e8a0b0';x.fillText('✨ You are a '+G.type+' eye',X,118);x.fillStyle='#ffe9c7';x.font='15px Georgia';let y=wrapT(T.r,X,150,340,21);
  y=wrapT(G.photo?'(Reading based on the iris type you picked for your photo.)':'Colour note: '+ {Blue:'blue eyes are read as cool, clear-minded and honest.',Green:'green eyes are read as curious, magnetic and creative.',Hazel:'hazel eyes are read as adaptable and full of surprises.',Brown:'brown eyes are read as warm, grounded and loyal.',Grey:'grey eyes are read as wise and calm under pressure.',Amber:'amber eyes are read as bold and golden-hearted.',Violet:'violet eyes are read as rare, dreamy and artistic.'}[G.col],X,y+10,340,21);
  x.fillStyle='#c8b0c0';x.font='13px Georgia';x.fillText('Tip: change the type in Design if your photo looks different.',X,y+16)}
 else{x.font='bold 17px Georgia';x.fillText('📖 Eye colours & markings',X,112);const e=ENC[G.enc];x.fillStyle='#e8a0b0';x.font='bold 19px Georgia';x.fillText(e[0],X,150);x.fillStyle='#ffe9c7';x.font='15px Georgia';wrapT(e[1],X,178,340,21);
  button('ep',X,300,100,32,'◀ Prev',()=>G.enc=(G.enc+ENC.length-1)%ENC.length,{fs:13});button('en',X+240,300,100,32,'Next ▶',()=>G.enc=(G.enc+1)%ENC.length,{fs:13});x.fillStyle='#ccc';x.font='13px Georgia';x.textAlign='center';x.fillText((G.enc+1)+' / '+ENC.length,X+170,321);x.textAlign='left'}}
function draw(){x.clearRect(0,0,W,H);const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0a14');g.addColorStop(1,'#2a1020');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='#e8a0b0';x.font='bold 24px Georgia';x.textAlign='left';x.fillText('👁️ Coffeebreak Iridology: Eye Reader',20,34);drawIris();if(G.tab==='chart')drawChart();panel();skull(870,560,1.6);rose(30,560,1.6);
 x.fillStyle='#c8a0b0';x.font='italic 12px Georgia';x.textAlign='center';x.fillText('For entertainment only — not medical advice. Iridology is not a diagnostic tool; see a doctor for any health concern.',W/2,H-44);x.textAlign='left'}
function update(){G.score=G.zone||0}
bindInput({down(p){startMusic();if(G.tab!=='chart')return;const h=zoneAt(p);if(!h)return;if(zoneLocked(h))return demoEnd('The demo shows 3 chart zones (12, 4 and 8 o\'clock). Get the full app for all 12 zones, readings, the encyclopedia and photo upload!');G.zone=h}});
window.IR={G,ZONES,zoneAt,TYPES};startLoop();
