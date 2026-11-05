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
// ---- Rock Collector ----
const DEMO=()=>!!window.DEMO;
const LOC={beach:{n:'🏖️ Beach',bg:['#8ad0f0','#f0d8a0'],tile:'#e8cc90',hard:1,items:[['Sea glass','#7fd8c0',0],['Pebble','#9a9a9a',0],['Pumice','#d8d0c0',0],['Agate','#d87a5a',1],['Jasper','#b03a2a',1],['Moonstone','#e8e8ff',2],['Amber','#f0a020',2],['Pearl','#fff4f0',3],['Fossil shell','#c8a878',1],['Black tourmaline','#2a2a2a',2]]},
 cave:{n:'🕯️ Cave',bg:['#2a1a2a','#3a2a2a'],tile:'#5a4a4a',hard:2,items:[['Quartz','#f0f0ff',0],['Calcite','#ffe0a0',0],['Fluorite','#a07af0',1],['Amethyst','#9a4ad8',1],['Geode','#8a7aa0',1],['Pyrite','#d8b030',1],['Obsidian','#1a1020',2],['Opal','#c8f0f0',3],['Malachite','#2a9a5a',2],['Rose quartz','#f6b6c6',2]]},
 mountain:{n:'⛰️ Mountain',bg:['#a0c0e0','#7a8a7a'],tile:'#8a8a7a',hard:3,items:[['Granite','#b0a0a0',0],['Slate','#5a6a7a',0],['Garnet','#a01a3a',1],['Topaz','#f0c060',2],['Aquamarine','#7ae0f0',2],['Emerald','#1ac06a',3],['Sapphire','#2a4ad8',3],['Ruby','#e01a4a',3],['Diamond','#e8ffff',4],['Gold nugget','#ffd030',3]]}};
const RAR=['Common','Uncommon','Rare','Very rare','Legendary'],RC=['#bbb','#7fd88a','#7ab0ff','#d07aff','#ffcf6a'];
const ALL=Object.entries(LOC).flatMap(([k,l])=>l.items.map((it,i)=>({id:k+i,loc:k,n:it[0],col:it[1],r:it[2],seed:i*7+k.length})));
const SV=JSON.parse(localStorage.rockSave||'null')||{inv:[],book:{},cab:[],trips:0,coins:0};
const G={state:'title',score:Object.keys(SV.book).length,level:Object.keys(SV.book).length,loc:null,grid:[],dig:0,msg:'',msgT:0,tum:[],tumT:0,sel:-1};window.G=G;
function save(){localStorage.rockSave=JSON.stringify(SV);G.score=G.level=Object.keys(SV.book).length}
function msg(s){G.msg=s;G.msgT=2.2}
function rockShape(X,Y,s,item,pol){x.save();x.translate(X,Y);const n=7,pts=[];let sd=item.seed+1;const r=()=>(sd=(sd*9301+49297)%233280)/233280;for(let i=0;i<n;i++){const a=i/n*6.283,rd=s*(.7+r()*.35);pts.push([Math.cos(a)*rd,Math.sin(a)*rd*.8])}
 const g=x.createRadialGradient(-s*.3,-s*.3,1,0,0,s*1.2);g.addColorStop(0,pol?'#fff':item.col);g.addColorStop(pol?.25:.6,item.col);g.addColorStop(1,pol?'#1a0a10':'#3a2a2a');x.fillStyle=g;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.closePath();x.fill();
 if(item.r>=1&&pol){x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1;x.beginPath();x.moveTo(pts[0][0]*.5,pts[0][1]*.5);x.lineTo(0,0);x.lineTo(pts[3][0]*.5,pts[3][1]*.5);x.stroke();x.fillStyle='rgba(255,255,255,'+(.5+.5*Math.sin(t*4+item.seed))+')';x.beginPath();x.arc(-s*.35,-s*.3,s*.12,0,7);x.fill()}
 if(!pol){x.fillStyle='rgba(90,60,40,.35)';x.beginPath();x.arc(s*.2,s*.15,s*.3,0,7);x.fill()}x.restore()}
function goDig(k){if(DEMO()&&k!=='beach'){msg('🔒 Cave and Mountain are in the full game');return}if(DEMO()&&SV.trips>=2){demoEnd('You finished your free beach trips! The crystal cave, the gem mountain and 30 specimens to collect are in the full game.');return}
 G.loc=k;G.state='play';G.dig=24;SV.trips++;save();const L=LOC[k];G.grid=[];for(let j=0;j<5;j++)for(let i=0;i<8;i++){let f=null;if(Math.random()<.45){const roll=Math.random();const tier=roll<.5?0:roll<.78?1:roll<.92?2:roll<.985?3:4;const pool=L.items.map((it,ix)=>ALL.find(a=>a.id===k+ix)).filter(a=>a.r<=tier);f=pool.filter(a=>a.r===Math.max(...pool.map(p=>p.r)))[Math.random()*pool.filter(a=>a.r===Math.max(...pool.map(p=>p.r))).length|0]||pool[0]}
  G.grid.push({i,j,hp:L.hard,f,open:false})}}
function tap(p){if(G.state!=='play')return;for(const g of G.grid){const gx=110+g.i*85,gy=200+g.j*72;if(!g.open&&p.x>gx&&p.x<gx+80&&p.y>gy&&p.y<gy+66){if(G.dig<=0){msg('Out of energy. Head home!');return}G.dig--;g.hp--;g.shake=.25;
   if(g.hp<=0){g.open=true;if(g.f){SV.inv.push({id:g.f.id,pol:false});const nw=!SV.book[g.f.id];SV.book[g.f.id]=SV.book[g.f.id]||1;msg((nw?'✨ NEW! ':'')+'Found '+g.f.n+' ('+RAR[g.f.r]+')');save()}else msg('Just dirt…')}return}}}
bindInput({down:tap});
function startTum(){if(G.tumT>0)return;const rough=SV.inv.map((v,i)=>[v,i]).filter(([v])=>!v.pol).slice(0,3);if(!rough.length){msg('No rough stones to tumble');return}rough.forEach(([v])=>v.inTum=true);G.tumT=DEMO()?6:8;save();msg('Tumbling… grind grind grind')}
function update(dt){if(G.msgT>0)G.msgT-=dt;G.grid.forEach(g=>g.shake=Math.max(0,(g.shake||0)-dt));
 if(G.tumT>0){G.tumT-=dt;if(G.tumT<=0){G.tumT=0;let n=0;SV.inv.forEach(v=>{if(v.inTum){v.inTum=false;v.pol=true;n++}});save();msg('✨ '+n+' stones polished to a shine!')}}}
function header(title){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1424');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(0,0,W,H);x.fillStyle='#f6c6d2';x.font='bold 30px Georgia';x.textAlign='center';x.fillText(title,W/2,48);
 button('home',16,14,110,34,'🗺️ Map',()=>{G.state='title'},{fs:15})}
function draw(){
 if(G.state==='title'){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a2a4a');g.addColorStop(1,'#1a0a14');x.fillStyle=g;x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 46px Georgia';x.fillText('💎 Coffeebreak Rock Collector',W/2,90);
  x.fillStyle='#ffe9c7';x.font='17px Georgia';x.fillText('Explore, dig up rocks, crystals and gems, polish them and fill your collection book.',W/2,126);
  Object.entries(LOC).forEach(([k,L],i)=>{const bx=90+i*250;const g2=x.createLinearGradient(0,170,0,330);g2.addColorStop(0,L.bg[0]);g2.addColorStop(1,L.bg[1]);x.fillStyle=g2;rr(bx,160,220,170,16);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=3;x.stroke();
   rockShape(bx+70,270,26,ALL.find(a=>a.id===k+'5'),true);rockShape(bx+150,260,20,ALL.find(a=>a.id===k+'3'),true);button('l'+k,bx+20,300,180,44,L.n+(DEMO()&&k!=='beach'?' 🔒':''),()=>goDig(k))});
  button('tum',90,390,220,52,'⚙️ Tumbler',()=>G.state='tumbler');button('cab',340,390,220,52,'🗄️ Cabinet',()=>G.state='cabinet');button('book',590,390,220,52,'📖 Collection book',()=>G.state='book');
  x.fillStyle='#ffcf6a';x.font='16px Georgia';x.fillText('Collected '+Object.keys(SV.book).length+' / '+ALL.length+' specimens   ·   Stones in bag: '+SV.inv.length+'   ·   Trips: '+SV.trips,W/2,480);
  if(hero.complete&&hero.naturalWidth)x.drawImage(hero,W/2-45,500,90*hero.naturalWidth/hero.naturalHeight,90)}
 else if(G.state==='play'){const L=LOC[G.loc],g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,L.bg[0]);g.addColorStop(1,L.bg[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(G.loc==='beach'){x.fillStyle='#4aa0d0';x.fillRect(0,130,W,40);x.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<W;i+=60)x.fillRect((i+t*30)%W,140,30,3)}else if(G.loc==='cave'){for(let i=0;i<12;i++){x.fillStyle='#1a0a1a';x.beginPath();x.moveTo(i*80,0);x.lineTo(i*80+40,60+(i%3)*20);x.lineTo(i*80+80,0);x.fill()}}else{x.fillStyle='#e8f0ff';x.beginPath();x.moveTo(200,170);x.lineTo(350,60);x.lineTo(500,170);x.moveTo(450,170);x.lineTo(650,40);x.lineTo(850,170);x.fill()}
  x.fillStyle='#ffe9c7';x.font='bold 22px Georgia';x.textAlign='center';x.fillText(L.n+'  ·  ⛏️ Energy '+G.dig,W/2,110);button('home',16,14,110,34,'🗺️ Map',()=>{G.state='title'},{fs:15});
  for(const gd of G.grid){const gx=110+gd.i*85+(gd.shake?(Math.random()-.5)*6:0),gy=200+gd.j*72;if(!gd.open){x.fillStyle=L.tile;rr(gx,gy,80,66,8);x.fill();x.fillStyle='rgba(0,0,0,'+(.1*(L.hard-gd.hp))+')';rr(gx,gy,80,66,8);x.fill();x.fillStyle='rgba(0,0,0,.15)';for(let k=0;k<5;k++)x.fillRect(gx+10+k*13,gy+20+(k%2)*20,4,3)}
   else{x.fillStyle='rgba(30,15,10,.5)';rr(gx,gy,80,66,8);x.fill();if(gd.f){rockShape(gx+40,gy+33,18,gd.f,false);x.fillStyle=RC[gd.f.r];x.font='10px Georgia';x.fillText(gd.f.n,gx+40,gy+62)}}}}
 else if(G.state==='tumbler'){header('⚙️ Rock Tumbler');x.save();x.translate(W/2,250);x.rotate(G.tumT>0?t*4:0);x.fillStyle='#5a5a6a';x.beginPath();x.arc(0,0,110,0,7);x.fill();x.fillStyle='#3a3a4a';x.beginPath();x.arc(0,0,90,0,7);x.fill();
   SV.inv.filter(v=>v.inTum).forEach((v,i)=>rockShape(Math.cos(i*2.1)*45,Math.sin(i*2.1)*45,20,ALL.find(a=>a.id===v.id),false));x.restore();
  x.fillStyle='#ffe9c7';x.font='17px Georgia';x.textAlign='center';x.fillText(G.tumT>0?'Polishing… '+Math.ceil(G.tumT)+'s':'Put up to 3 rough stones in to polish them.',W/2,400);
  button('go',W/2-110,420,220,50,G.tumT>0?'⏳ Tumbling…':'⚙️ Tumble 3 stones',startTum,{dis:G.tumT>0});x.fillText('Rough stones in bag: '+SV.inv.filter(v=>!v.pol).length+'   ·   Polished: '+SV.inv.filter(v=>v.pol).length,W/2,500)}
 else if(G.state==='cabinet'){header('🗄️ Display Cabinet');x.fillStyle='#4a2410';rr(80,80,740,470,14);x.fill();for(let s=0;s<4;s++){x.fillStyle='#2a1406';x.fillRect(96,170+s*110,708,10)}
  const pol=SV.inv.filter(v=>v.pol),seen=new Set(),show=pol.filter(v=>!seen.has(v.id)&&seen.add(v.id));show.slice(0,40).forEach((v,i)=>{const it=ALL.find(a=>a.id===v.id),cx=130+(i%10)*70,cy=145+(i/10|0)*110;rockShape(cx,cy,22,it,true);x.fillStyle='#ffe9c7';x.font='9px Georgia';x.textAlign='center';x.fillText(it.n,cx,cy+34)});
  if(!show.length){x.fillStyle='#ffe9c7';x.font='18px Georgia';x.textAlign='center';x.fillText('Polish stones in the tumbler to display them here.',W/2,320)}x.strokeStyle='rgba(255,255,255,.15)';x.lineWidth=2;x.strokeRect(84,84,732,462)}
 else if(G.state==='book'){header('📖 Collection Book');ALL.forEach((it,i)=>{const lx=i/10|0,cx=90+(i%10)*76+(0),cy=110+lx*150;const got=SV.book[it.id];x.fillStyle='#24101a';rr(cx-34,cy-30,68,120,8);x.fill();x.strokeStyle=got?RC[it.r]:'#3a2a30';x.lineWidth=2;x.stroke();
   if(got)rockShape(cx,cy+8,20,it,true);else{x.fillStyle='#3a2a30';x.font='bold 30px Georgia';x.textAlign='center';x.fillText('?',cx,cy+18)}x.fillStyle=got?'#ffe9c7':'#6a5a60';x.font='10px Georgia';x.textAlign='center';wrapT(got?it.n:'???',cx,cy+50,64,11);x.fillStyle=RC[it.r];x.fillText(got?RAR[it.r]:LOC[it.loc].n.split(' ')[1],cx,cy+80)});
  x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('Collected '+Object.keys(SV.book).length+' / '+ALL.length,W/2,575)}
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='rgba(18,6,12,.85)';rr(W/2-260,530,520,40,12);x.fill();x.fillStyle='#ffcf6a';x.font='bold 17px Georgia';x.textAlign='center';x.fillText(G.msg,W/2,556);x.globalAlpha=1}}
startLoop();
