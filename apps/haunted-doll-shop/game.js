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
// ===== Coffeebreak Voodoo Doll (cute pastel goth, for fun only) =====
const DEMO=()=>!!window.DEMO;
const OPT={fabric:['#f8b8d0','#2a2028','#c8a8e8','#a8e8d0','#f8ecd8','#e85a7a'],pattern:['Plain','Stripes','Polka','Lace'],eyes:['Pink buttons','Black buttons','Heart buttons','Stitched X'],hair:['None','Pigtails','Bob','Mohawk','Bun'],hairCol:['#1a1018','#f070a8','#f8f0f8','#8a50c8','#e8c060'],outfit:['None','Tutu','Lace dress','Overalls','Bat cape'],acc:['Bow','Tiny crown','Bat wings','Rose','Skull clip','None']};
const PINS=[{id:'love',n:'Love',c:'#ff5aa0',e:'💖',t:n=>'✨ By pink pin and stitch of red, may '+n+' be loved from toe to head! ✨'},{id:'luck',n:'Luck',c:'#3ad070',e:'🍀',t:n=>'🍀 Lucky clover, lucky star, '+n+' finds luck wherever you are!'},{id:'money',n:'Money',c:'#f8c820',e:'💰',t:n=>'💰 Coins that jingle, notes that fly, abundance for '+n+', sky high!'},{id:'conf',n:'Confidence',c:'#a060f0',e:'👑',t:n=>'👑 Chin up, crown on, '+n+' shines — bold and strong!'},{id:'prot',n:'Protection',c:'#40a8f0',e:'🛡️',t:n=>'🛡️ A bubble of light from heart to shoe, nothing bad gets through to '+n+'!'},{id:'hair',n:'Bad hair day',c:'#f08a20',e:'💇',t:n=>'😜 Frizz and fluff and static too… '+n+' has a bad hair day — boo-hoo! (just kidding)'},{id:'toe',n:'Stub your toe',c:'#e83040',e:'🦶',t:n=>'🙃 Oopsie-daisy, bump and blink, '+n+' stubs a toe on the kitchen sink! (cartoon ouch, no harm done)'}];
const SPOTS=[['head',0,-118],['heart',-14,-28],['belly',0,20],['left hand',-78,-20],['right hand',78,-20],['foot',-26,118]];
const DEMO_PINS=['love','luck','hair'];
const SK='voodooShelf';let shelf=[];try{shelf=JSON.parse(localStorage[SK])||[]}catch(e){}
function newDoll(){return {name:'Bestie',fabric:0,pattern:0,eyes:0,hair:1,hairCol:0,outfit:1,acc:0,pins:[]}}
const G={state:'shelf',score:0,level:1,d:newDoll(),idx:-1,pin:'love',spell:'',fx:[],eff:null,effT:0};
let parts=[];
const nameIn=document.createElement('input');nameIn.maxLength=14;nameIn.placeholder='Name on tag';nameIn.style.cssText='position:absolute;display:none;z-index:4;font:16px Georgia;padding:4px 8px;border:2px solid #f070a8;border-radius:8px;background:#1a0a14;color:#ffd0e8;width:150px';document.body.appendChild(nameIn);
nameIn.oninput=()=>{G.d.name=nameIn.value||'Bestie'};
function placeName(){const r=c.getBoundingClientRect();if(G.state==='make'){nameIn.style.display='block';nameIn.style.left=(r.left+scrollX+560*r.width/W)+'px';nameIn.style.top=(r.top+scrollY+452*r.height/H)+'px'}else nameIn.style.display='none'}
function saveShelf(){localStorage[SK]=JSON.stringify(shelf);G.score=shelf.length}
function saveDoll(){const d=JSON.parse(JSON.stringify(G.d));if(G.idx>=0)shelf[G.idx]=d;else{if(DEMO()&&shelf.length>=1)return demoEnd('The free demo keeps 1 doll on your shelf. Get the full game for a whole shelf of dolls, all 7 charm pins and all 38 songs!');shelf.push(d);G.idx=shelf.length-1}saveShelf();burst(450,300,'💗',16)}
function burst(X,Y,e,n){for(let i=0;i<n;i++)parts.push({x:X,y:Y,vx:(Math.random()-.5)*300,vy:-Math.random()*260,l:1.6,e})}
function stitch(X1,Y1,X2,Y2){x.strokeStyle='#ff7ab0';x.lineWidth=2;x.setLineDash([5,4]);x.beginPath();x.moveTo(X1,Y1);x.lineTo(X2,Y2);x.stroke();x.setLineDash([])}
function doll(d,X,Y,s,o={}){x.save();x.translate(X,Y);x.scale(s,s);const fab=OPT.fabric[d.fabric],dark=d.fabric===1;
 const wob=o.hop?Math.abs(Math.sin(t*12))*-14:0;x.translate(0,wob);
 if(d.acc===2){x.fillStyle='#1a1018';for(const sg of[-1,1]){x.beginPath();x.moveTo(sg*30,-40);x.quadraticCurveTo(sg*110,-110,sg*120,-30);x.quadraticCurveTo(sg*95,-45,sg*85,-20);x.quadraticCurveTo(sg*70,-40,sg*60,-10);x.fill()}}
 if(d.outfit===4){x.fillStyle='#1a1018';x.beginPath();x.moveTo(-40,-60);x.lineTo(40,-60);x.lineTo(70,110);x.lineTo(-70,110);x.fill();x.fillStyle='#e85a7a';x.fillRect(-40,-62,80,6)}
 x.fillStyle=fab;// limbs
 x.beginPath();x.ellipse(-70,-20,30,14,-.3,0,7);x.ellipse(70,-20,30,14,.3,0,7);x.fill();x.beginPath();x.ellipse(-26,100,16,30,0,0,7);x.ellipse(26,100,16,30,0,0,7);x.fill();
 x.strokeStyle='#ff7ab0';x.lineWidth=2.5;x.beginPath();x.ellipse(-70,-20,30,14,-.3,0,7);x.stroke();x.beginPath();x.ellipse(70,-20,30,14,.3,0,7);x.stroke();x.beginPath();x.ellipse(-26,100,16,30,0,0,7);x.stroke();x.beginPath();x.ellipse(26,100,16,30,0,0,7);x.stroke();x.beginPath();x.ellipse(0,10,50,72,0,0,7);x.fill();x.stroke();x.beginPath();x.arc(0,-100,58,0,7);x.fill();x.stroke();
 x.save();x.beginPath();x.ellipse(0,10,50,72,0,0,7);x.arc(0,-100,58,0,7);x.clip();const pc=dark?'rgba(255,120,180,.35)':'rgba(30,10,20,.18)';x.fillStyle=pc;x.strokeStyle=pc;
 if(d.pattern===1)for(let i=-200;i<200;i+=18)x.fillRect(-80,i,160,7);if(d.pattern===2)for(let i=-6;i<6;i++)for(let j=-6;j<6;j++){x.beginPath();x.arc(i*22+(j%2)*11,j*24,5,0,7);x.fill()}
 if(d.pattern===3){x.lineWidth=1.5;for(let i=-160;i<120;i+=16){x.beginPath();for(let k=-80;k<=80;k+=10)x.arc(k,i,6,0,Math.PI);x.stroke()}}x.restore();
 stitch(0,-42,0,80);stitch(-50,-30,-40,-18);stitch(50,-30,40,-18);x.strokeStyle='#ff7ab0';x.lineWidth=2;for(let i=-36;i<80;i+=14){x.beginPath();x.moveTo(-5,i);x.lineTo(5,i+6);x.stroke()}
 if(d.outfit===1){x.fillStyle='rgba(255,140,190,.85)';for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(i*16,35);x.lineTo(i*18-12,75);x.lineTo(i*18+12,75);x.fill()}x.fillStyle='#1a1018';x.fillRect(-48,30,96,8)}
 if(d.outfit===2){x.fillStyle='rgba(20,10,16,.85)';x.beginPath();x.moveTo(-40,-30);x.lineTo(40,-30);x.lineTo(58,80);x.lineTo(-58,80);x.fill();x.strokeStyle='#f8b8d0';x.lineWidth=1.5;for(let k=-56;k<=56;k+=8){x.beginPath();x.arc(k,80,4,0,Math.PI);x.stroke()}}
 if(d.outfit===3){x.fillStyle='#6a5ab8';rr(-40,0,80,70,10);x.fill();x.fillRect(-30,-30,8,32);x.fillRect(22,-30,8,32);x.fillStyle='#f8c820';x.beginPath();x.arc(-26,0,4,0,7);x.arc(26,0,4,0,7);x.fill()}
 // hair
 const frizz=o.frizz?1:0,hc=OPT.hairCol[d.hairCol];x.fillStyle=hc;
 if(frizz){for(let i=0;i<18;i++){const a=Math.PI+i/17*Math.PI;x.beginPath();x.arc(Math.cos(a)*70,-110+Math.sin(a)*70,18+Math.sin(t*20+i)*4,0,7);x.fill()}}
 else if(d.hair===1){x.beginPath();x.arc(0,-112,58,Math.PI,0);x.fill();x.beginPath();x.ellipse(-66,-110,16,30,.3,0,7);x.ellipse(66,-110,16,30,-.3,0,7);x.fill()}
 else if(d.hair===2){x.beginPath();x.arc(0,-108,62,Math.PI*.95,Math.PI*2.05);x.lineTo(62,-70);x.lineTo(-62,-70);x.fill();x.fillStyle=fab;x.fillRect(-44,-112,88,50)}
 else if(d.hair===3){for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(i*12-8,-150);x.lineTo(i*12,-195+Math.abs(i)*10);x.lineTo(i*12+8,-150);x.fill()}}
 else if(d.hair===4){x.beginPath();x.arc(0,-112,58,Math.PI,0);x.fill();x.beginPath();x.arc(0,-168,24,0,7);x.fill()}
 // face
 const eye=(ex)=>{if(d.eyes===3){x.strokeStyle='#1a1018';x.lineWidth=4;x.beginPath();x.moveTo(ex-9,-112);x.lineTo(ex+9,-94);x.moveTo(ex+9,-112);x.lineTo(ex-9,-94);x.stroke();return}x.fillStyle=d.eyes===1?'#1a1018':'#ff5aa0';if(d.eyes===2){x.beginPath();x.moveTo(ex,-92);x.bezierCurveTo(ex-18,-104,ex-8,-120,ex,-108);x.bezierCurveTo(ex+8,-120,ex+18,-104,ex,-92);x.fill()}else{x.beginPath();x.arc(ex,-103,13,0,7);x.fill()}x.fillStyle=dark&&d.eyes===1?'#f8b8d0':'#fff';x.beginPath();x.arc(ex-3,-106,1.8,0,7);x.arc(ex+3,-106,1.8,0,7);x.arc(ex-3,-100,1.8,0,7);x.arc(ex+3,-100,1.8,0,7);x.fill()};eye(-22);eye(22);
 x.strokeStyle=dark?'#ff7ab0':'#1a1018';x.lineWidth=2.5;x.beginPath();if(o.frizz||o.ouch){x.arc(0,-62,8,Math.PI+.3,-.3)}else x.arc(0,-74,9,.2,Math.PI-.2);x.stroke();stitch(-8,-70,8,-70);
 x.fillStyle='rgba(255,90,160,.45)';x.beginPath();x.arc(-38,-80,8,0,7);x.arc(38,-80,8,0,7);x.fill();
 // accessory
 if(d.acc===0){x.fillStyle='#ff5aa0';x.beginPath();x.moveTo(30,-150);x.lineTo(60,-168);x.lineTo(58,-134);x.fill();x.beginPath();x.moveTo(30,-150);x.lineTo(2,-170);x.lineTo(4,-134);x.fill();x.fillStyle='#1a1018';x.beginPath();x.arc(30,-150,6,0,7);x.fill()}
 if(d.acc===1){x.fillStyle='#f8c820';x.beginPath();x.moveTo(-26,-150);x.lineTo(-26,-178);x.lineTo(-13,-162);x.lineTo(0,-184);x.lineTo(13,-162);x.lineTo(26,-178);x.lineTo(26,-150);x.fill();x.fillStyle='#ff5aa0';x.beginPath();x.arc(0,-160,4,0,7);x.fill()}
 if(d.acc===3)rose(-42,-148,3);if(d.acc===4)skull(44,-146,2.6,'#f8f0f8');
 // tag
 x.fillStyle='#f8ecd8';x.save();x.rotate(.12);rr(30,40,74,26,5);x.fill();x.strokeStyle='#1a1018';x.lineWidth=1;x.stroke();x.fillStyle='#1a1018';x.font='bold 12px Georgia';x.textAlign='center';x.fillText(d.name.slice(0,10),67,58);x.restore();x.strokeStyle='#ff7ab0';x.beginPath();x.moveTo(30,30);x.lineTo(38,46);x.stroke();
 // pins
 for(const p of d.pins||[]){const s2=SPOTS.find(q=>q[0]===p.s),P=PINS.find(q=>q.id===p.p);if(!s2||!P)continue;x.strokeStyle='#ccc';x.lineWidth=2;x.beginPath();x.moveTo(s2[1]+p.o,s2[2]);x.lineTo(s2[1]+p.o+12,s2[2]-16);x.stroke();x.fillStyle=P.c;x.beginPath();x.arc(s2[1]+p.o+12,s2[2]-16,7,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(s2[1]+p.o+10,s2[2]-18,2,0,7);x.fill()}
 x.restore()}
function bg(){x.fillStyle='#1a0a14';x.fillRect(0,0,W,H);x.fillStyle='#2a1020';for(let i=0;i<W;i+=30){x.beginPath();x.arc(i+15,0,15,0,Math.PI);x.fill();x.beginPath();x.arc(i+15,H,15,Math.PI,0);x.fill()}
 for(let i=0;i<12;i++){const X=(i*173)%W,Y=60+(i*97)%460;x.globalAlpha=.25;emo(['🦇','🖤','💗','🦇'][i%4],X,Y+Math.sin(t+i)*6,20);x.globalAlpha=1}}
function note(){x.fillStyle='#d8a0c0';x.font='italic 12px Georgia';x.textAlign='center';x.fillText('For fun only 💗 Cute charms and silly joke curses — no real magic, no harm, all ages.',W/2,H-44);x.textAlign='left'}
function title(s){x.fillStyle='#ff8ac0';x.font='bold 28px Georgia';x.textAlign='center';x.fillText(s,W/2,46);x.textAlign='left'}
function drawShelf(){title('🧷 Coffeebreak Voodoo Doll — Doll Shelf');x.fillStyle='#ffd0e8';x.font='15px Georgia';x.textAlign='center';x.fillText('Stitch a cute plush, then cast sweet (or cheeky) charms with coloured pins.',W/2,72);x.textAlign='left';
 for(let r=0;r<2;r++){x.fillStyle='#4a2030';x.fillRect(60,250+r*200,780,14);x.fillStyle='#ff7ab0';x.fillRect(60,250+r*200,780,3)}
 shelf.slice(0,12).forEach((d,i)=>{const X=110+(i%6)*130,Y=200+Math.floor(i/6)*200;doll(d,X,Y-20,.32);button('e'+i,X-48,Y+56,46,24,'✏️',()=>{G.d=JSON.parse(JSON.stringify(d));G.idx=i;G.state='make';placeName();nameIn.value=d.name},{fs:12});button('k'+i,X+2,Y+56,46,24,'🧷',()=>{G.d=JSON.parse(JSON.stringify(d));G.idx=i;G.state='cast'},{fs:12});button('x'+i,X+40,Y-60,24,22,'✕',()=>{shelf.splice(i,1);saveShelf()},{fs:11})});
 if(!shelf.length){x.fillStyle='#c8a0b0';x.font='italic 16px Georgia';x.textAlign='center';x.fillText('Your shelf is empty — stitch your first doll!',W/2,200);x.textAlign='left'}
 button('new',330,500,240,46,'🪡 Stitch a new doll',()=>{if(DEMO()&&shelf.length>=1)return demoEnd('The free demo has 1 doll. Get the full game for a whole shelf of dolls, all 7 charm pins and all 38 songs!');G.d=newDoll();G.idx=-1;G.state='make';nameIn.value='';placeName()},{ac:'#ff7ab0'});note()}
const LBL={fabric:'Fabric',pattern:'Pattern',eyes:'Button eyes',hair:'Hair',hairCol:'Hair colour',outfit:'Outfit',acc:'Accessory'};
function drawMake(){title('🪡 Stitch & Customise');doll(G.d,250,320,1.15);let y=86;
 for(const k in OPT){x.fillStyle='#ffd0e8';x.font='bold 14px Georgia';x.textAlign='left';x.fillText(LBL[k],480,y+17);const v=G.d[k],o=OPT[k];const lab=k==='fabric'||k==='hairCol'?'':o[v];
  button('p'+k,600,y,36,26,'◀',()=>G.d[k]=(v+o.length-1)%o.length,{fs:13});if(lab){x.fillStyle='#fff';x.font='14px Georgia';x.textAlign='center';x.fillText(lab,710,y+18)}else{x.fillStyle=o[v];rr(670,y+2,80,22,6);x.fill();x.strokeStyle='#ff7ab0';x.stroke()}button('n'+k,784,y,36,26,'▶',()=>G.d[k]=(v+1)%o.length,{fs:13});y+=48}
 x.fillStyle='#ffd0e8';x.font='bold 14px Georgia';x.textAlign='left';x.fillText('Name tag:',480,y+16);
 button('sv',480,500,160,40,'💾 Save to shelf',saveDoll,{ac:'#ff7ab0',fs:15});button('cs',650,500,170,40,'🧷 Cast charms →',()=>{saveDoll();if(G.idx>=0){G.state='cast';placeName()}},{ac:'#ff7ab0',fs:15});button('bk',40,40,90,30,'◀ Shelf',()=>{G.state='shelf';placeName()},{fs:13});note()}
function cast(spot){const P=PINS.find(q=>q.id===G.pin);if(DEMO()&&!DEMO_PINS.includes(P.id))return demoEnd('The demo has 3 pins: Love, Luck and Bad hair day. Get the full game for Money, Confidence, Protection, Stub your toe, the full shelf and all 38 songs!');
 G.d.pins=(G.d.pins||[]).slice(-11);G.d.pins.push({p:P.id,s:spot[0],o:Math.round(Math.random()*16-8)});G.spell=P.t(G.d.name)+'  ('+spot[0]+')';G.eff=P.id;G.effT=3;burst(250+spot[1],320+spot[2],P.e,18);for(let i=0;i<20;i++)parts.push({x:250+spot[1],y:320+spot[2],vx:(Math.random()-.5)*400,vy:(Math.random()-.5)*400,l:1,e:'✨'});
 if(G.idx>=0){shelf[G.idx]=JSON.parse(JSON.stringify(G.d));saveShelf()}}
function drawCast(){title('🧷 Cast a Charm on '+G.d.name);const e=G.effT>0?G.eff:null;
 if(e==='prot'){x.fillStyle='rgba(64,168,240,.18)';x.strokeStyle='rgba(120,200,255,.8)';x.lineWidth=3;x.beginPath();x.arc(250,320,190+Math.sin(t*6)*6,0,7);x.fill();x.stroke()}
 if(e==='conf'){x.fillStyle='rgba(255,220,100,.18)';x.beginPath();x.arc(250,320,200,0,7);x.fill()}
 doll(G.d,250,320,1.15,{frizz:e==='hair',hop:e==='toe',ouch:e==='toe'});
 if(e==='toe'){x.fillStyle='#ffd040';x.font='bold 26px Georgia';x.textAlign='center';x.fillText('OUCHIE! 🙃',250,470);for(let i=0;i<5;i++)emo('⭐',220+Math.cos(t*6+i*1.26)*40,452+Math.sin(t*6+i*1.26)*12,18)}
 if(e==='money'&&Math.random()<.2)parts.push({x:50+Math.random()*400,y:60,vx:0,vy:120,l:3,e:Math.random()<.5?'🪙':'💵'});if(e==='love'&&Math.random()<.3)parts.push({x:150+Math.random()*200,y:450,vx:0,vy:-90,l:3,e:'💗'});if(e==='luck'&&Math.random()<.3)parts.push({x:80+Math.random()*340,y:80,vx:(Math.random()-.5)*40,vy:80,l:3,e:'🍀'});if(e==='conf'&&Math.random()<.3)parts.push({x:150+Math.random()*200,y:150+Math.random()*300,vx:0,vy:-30,l:1.5,e:'⭐'});
 SPOTS.forEach(s=>{const X=250+s[1]*1.15,Y=320+s[2]*1.15;x.strokeStyle='rgba(255,255,255,'+(.4+Math.sin(t*4)*.3)+')';x.lineWidth=2;x.setLineDash([4,4]);x.beginPath();x.arc(X,Y,20,0,7);x.stroke();x.setLineDash([])});
 x.fillStyle='#ffd0e8';x.font='bold 15px Georgia';x.textAlign='left';x.fillText('1. Pick a pin',500,92);PINS.forEach((P,i)=>{const lock=DEMO()&&!DEMO_PINS.includes(P.id);button('pin'+P.id,500+(i%2)*190,102+Math.floor(i/2)*46,180,38,(lock?'🔒 ':P.e+' ')+P.n,()=>{if(lock)return demoEnd('The demo has 3 pins: Love, Luck and Bad hair day. Get the full game for every pin!');G.pin=P.id},{sel:G.pin===P.id,ac:P.c,fs:14})});
 x.fillStyle='#ffd0e8';x.font='bold 15px Georgia';x.textAlign='left';x.fillText('2. Tap a dotted spot on the doll',500,302);
 if(G.spell){x.fillStyle='rgba(255,120,180,.12)';rr(500,318,370,120,12);x.fill();x.strokeStyle='#ff7ab0';x.lineWidth=1.5;x.stroke();x.fillStyle='#fff';x.font='italic 16px Georgia';wrapT(G.spell,515,346,345,22)}
 button('cl',500,456,170,34,'🧹 Pull out pins',()=>{G.d.pins=[];G.spell='';if(G.idx>=0){shelf[G.idx]=JSON.parse(JSON.stringify(G.d));saveShelf()}},{fs:13});button('sh',690,456,170,34,'🖤 Back to shelf',()=>{G.state='shelf';parts=[]},{fs:13});button('ed',40,40,90,30,'✏️ Edit',()=>{G.state='make';nameIn.value=G.d.name;placeName()},{fs:13});note()}
function update(dt){G.effT-=dt;for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt}parts=parts.filter(p=>p.l>0);G.score=shelf.length}
function draw(){x.clearRect(0,0,W,H);bg();x.textAlign='left';if(G.state==='shelf')drawShelf();else if(G.state==='make')drawMake();else drawCast();for(const p of parts){x.globalAlpha=Math.max(0,Math.min(1,p.l));emo(p.e,p.x,p.y,22)}x.globalAlpha=1;x.textAlign='left'}
bindInput({down(p){startMusic();if(G.state!=='cast')return;for(const s of SPOTS){if(Math.hypot(p.x-(250+s[1]*1.15),p.y-(320+s[2]*1.15))<28){cast(s);return}}}});
addEventListener('resize',placeName);addEventListener('scroll',placeName);setInterval(placeName,500);
window.VD={G,get shelf(){return shelf},cast,SPOTS,saveDoll};saveShelf();startLoop();
