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
// ---- Dream Cake ----
const DEMO=()=>!!window.DEMO;
const FLAV=[['Vanilla','#fff2c8'],['Chocolate','#6b3a1e'],['Red velvet','#a01a2a'],['Coffee','#a0703a'],['Strawberry','#f6a0b0'],['Lemon','#fff07a'],['Black forest','#2a1010'],['Matcha','#a0c87a']];
const ICE=['#fff8f0','#f6c6d2','#1a0a10','#d8c4f0','#bfe8d4','#ffe08a','#c2264a','#bfe3ff','#e8d4b8'];
const PIPE=['none','dots','shells','swirls','drips'];
const DECO=[['🌹','Rose'],['💀','Skull'],['🍡','Marshmallow'],['✨','Sprinkles'],['🍒','Cherry'],['🕯️','Candle'],['⭐','Star'],['💖','Heart'],['🫘','Coffee bean'],['🦋','Butterfly'],['🍓','Strawberry'],['🎀','Bow']];
const G={state:'play',score:0,level:+localStorage.cakeN||0,tiers:[{f:0,i:1,p:1},{f:1,i:2,p:3}],sel:1,deco:[],pick:0,drag:null,tab:'tiers',msg:'',msgT:0,saved:0};window.G=G;
const CX=330,BASE=520;
function tierRects(){let y=BASE;return G.tiers.map((tr,i)=>{const w=300-i*55,h=78-i*6;y-=h;return{x:CX-w/2,y,w,h,tr,i}})}
function decoAllowed(i){return !DEMO()||i<4}
function hit(p){for(let i=G.deco.length-1;i>=0;i--){const d=G.deco[i];if(Math.hypot(p.x-d.x,p.y-d.y)<20)return i}return -1}
bindInput({down(p){if(p.x<660){const h=hit(p);if(h>=0){G.drag=h;return}if(G.tab==='deco'&&p.y<BASE+10&&p.y>80){if(G.deco.length>=60)return;G.deco.push({e:DECO[G.pick][0],x:p.x,y:p.y,s:1});G.drag=G.deco.length-1;G.score=G.deco.length}
  else{tierRects().forEach(r=>{if(p.x>r.x&&p.x<r.x+r.w&&p.y>r.y&&p.y<r.y+r.h)G.sel=r.i})}}},
 move(p){if(G.drag!=null&&G.deco[G.drag]){G.deco[G.drag].x=p.x;G.deco[G.drag].y=p.y}},
 up(p){if(G.drag!=null){const d=G.deco[G.drag];if(d&&(d.x>650||d.y>575))G.deco.splice(G.drag,1);G.drag=null}}});
c.addEventListener('dblclick',e=>{const h=hit(pos(e));if(h>=0)G.deco.splice(h,1)});
function msg(s){G.msg=s;G.msgT=2.5}
function update(dt){if(G.msgT>0)G.msgT-=dt}
function drawCake(ctx,wm){const X=x;x=ctx;
 x.fillStyle='#e8e0d8';x.beginPath();x.ellipse(CX,BASE+8,190,22,0,0,7);x.fill();x.fillStyle='#c8c0b8';x.fillRect(CX-14,BASE+8,28,40);x.beginPath();x.ellipse(CX,BASE+50,70,12,0,0,7);x.fill();
 tierRects().forEach(r=>{const ic=ICE[r.tr.i],fl=FLAV[r.tr.f][1];x.fillStyle=ic;rr(r.x,r.y,r.w,r.h,10);x.fill();
  x.fillStyle=fl;x.globalAlpha=.9;x.fillRect(r.x+r.w-40,r.y+14,30,r.h-20);x.globalAlpha=1;x.fillStyle=ic;x.fillRect(r.x+r.w-40,r.y+r.h/2-2,30,4);
  x.fillStyle='rgba(255,255,255,.18)';x.fillRect(r.x+8,r.y+6,10,r.h-12);const pc=ic==='#1a0a10'?'#f6c6d2':'#fff';x.fillStyle=pc;x.strokeStyle=pc;x.lineWidth=3;
  const P=PIPE[r.tr.p];if(P==='dots')for(let k=r.x+8;k<r.x+r.w;k+=14){x.beginPath();x.arc(k,r.y+r.h-3,4,0,7);x.fill();x.beginPath();x.arc(k,r.y+3,3,0,7);x.fill()}
  if(P==='shells')for(let k=r.x+6;k<r.x+r.w-4;k+=16){x.beginPath();x.ellipse(k+6,r.y+r.h-3,8,5,0,0,7);x.fill()}
  if(P==='swirls'){x.beginPath();for(let k=0;k<=r.w;k+=4)x.lineTo(r.x+k,r.y+r.h/2+Math.sin(k/9)*8);x.stroke()}
  if(P==='drips'){x.fillStyle=ic==='#1a0a10'?'#6b3a1e':'#3a1a0a';x.fillRect(r.x,r.y,r.w,8);for(let k=r.x+10;k<r.x+r.w-6;k+=22){const dh=10+((k*7)%18);rr(k,r.y,10,dh,5);x.fill()}}});
 G.deco.forEach(d=>{if(d.e==='✨'){for(let k=0;k<10;k++){x.fillStyle=['#ff7aa0','#7ab0ff','#ffe03a','#7fd88a','#fff'][k%5];x.save();x.translate(d.x+Math.cos(k*2.4)*14,d.y+Math.sin(k*2.4)*10);x.rotate(k);x.fillRect(-3,-1,6,2);x.restore()}}else emo(d.e,d.x,d.y,30)});
 if(wm){x.save();x.globalAlpha=.3;x.fillStyle='#000';x.font='bold 40px Georgia';x.textAlign='center';x.translate(CX,300);x.rotate(-.4);x.fillText('COFFEEBREAK DEMO',0,0);x.restore()}x=X}
function savePNG(){const o=document.createElement('canvas');o.width=660;o.height=600;const q=o.getContext('2d');const g=q.createLinearGradient(0,0,0,600);g.addColorStop(0,'#fde6ee');g.addColorStop(1,'#f6c6d2');q.fillStyle=g;q.fillRect(0,0,660,600);
 drawCake(q,DEMO());q.fillStyle='#3a1424';q.font='bold 26px Georgia';q.textAlign='center';q.fillText(G.name||'My Dream Cake',CX,50);q.font='14px Georgia';q.fillText(G.tiers.map(t=>FLAV[t.f][0]).join(' · '),CX,80);q.fillText('Made with Coffeebreak Dream Cake',CX,588);
 const a=document.createElement('a');a.download='dream-cake.png';a.href=o.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();G.saved++;G.state='over';localStorage.cakeN=G.level=(+localStorage.cakeN||0)+1;msg('🎂 Saved dream-cake.png!');
 setTimeout(()=>{G.state='play'},300);if(DEMO())setTimeout(()=>demoEnd('Your free demo cake is saved! 4 tiers, all 12 decorations, every flavour and watermark-free images are in the full game.'),1200)}
function panel(){const px=670;x.fillStyle='#24101a';rr(px,60,220,520,14);x.fill();['tiers','icing','deco'].forEach((tb,i)=>button('tab'+tb,px+6+i*72,68,68,30,['🎂 Tiers','🎨 Icing','🌹 Decor'][i],()=>G.tab=tb,{sel:G.tab===tb,fs:12}));
 const tr=G.tiers[G.sel];let y=112;x.fillStyle='#ffe9c7';x.font='bold 14px Georgia';x.textAlign='left';x.fillText('Tier '+(G.sel+1)+' of '+G.tiers.length+' (tap a tier)',px+12,y);y+=14;
 if(G.tab==='tiers'){button('add',px+10,y,100,32,'➕ Tier',()=>{const mx=DEMO()?2:4;if(G.tiers.length<mx){G.tiers.push({f:0,i:0,p:1});G.sel=G.tiers.length-1}else msg(DEMO()?'🔒 3 and 4 tiers are in the full game':'Max 4 tiers')},{fs:14});button('rm',px+114,y,96,32,'➖ Tier',()=>{if(G.tiers.length>1){G.tiers.pop();G.sel=Math.min(G.sel,G.tiers.length-1)}},{fs:14});y+=44;
  x.fillStyle='#ffe9c7';x.fillText('Flavour',px+12,y);y+=8;FLAV.forEach((f,i)=>{const lk=DEMO()&&i>3;button('f'+i,px+10+(i%2)*104,y+(i>>1)*38,100,32,f[0]+(lk?' 🔒':''),()=>{tr.f=i},{sel:tr.f===i,fs:12,dis:lk})});y+=160;
  x.fillStyle='#ffe9c7';x.fillText('Name your cake',px+12,y+4);button('nm',px+10,y+12,200,32,G.name||'✏️ Tap to name',()=>{const n=prompt('Name your cake','My Dream Cake');if(n)G.name=n.slice(0,30)},{fs:13})}
 if(G.tab==='icing'){x.fillText('Icing colour',px+12,y);y+=8;ICE.forEach((col,i)=>{BTN['i'+i]={x:px+12+(i%5)*40,y:y+(i/5|0)*40,w:34,h:34,fn:()=>tr.i=i};x.fillStyle=col;x.beginPath();x.arc(px+29+(i%5)*40,y+17+(i/5|0)*40,15,0,7);x.fill();x.strokeStyle=tr.i===i?'#ffcf6a':'#5a2a3a';x.lineWidth=3;x.stroke()});y+=96;
  x.fillStyle='#ffe9c7';x.fillText('Piping',px+12,y);y+=8;PIPE.forEach((p,i)=>button('p'+i,px+10+(i%2)*104,y+(i>>1)*38,100,32,p,()=>tr.p=i,{sel:tr.p===i,fs:13}))}
 if(G.tab==='deco'){x.font='12px Georgia';x.fillText('Pick one, then tap the cake. Drag to',px+12,y);x.fillText('move it, drag it off the cake to remove.',px+12,y+15);y+=26;DECO.forEach((d,i)=>{const lk=!decoAllowed(i);button('d'+i,px+10+(i%3)*68,y+(i/3|0)*46,62,40,d[0]+(lk?'🔒':''),()=>{if(!lk)G.pick=i;else msg('🔒 '+d[1]+' is in the full game')},{sel:G.pick===i,fs:20,dis:lk})});y+=190;
  button('clr',px+10,y,200,30,'🧹 Clear decorations',()=>G.deco=[],{fs:13})}
 button('save',px+10,530,200,42,'💾 Save PNG',savePNG,{ac:'#ffcf6a'})}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a1424');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<8;i++)rose(40+i*85,20,1.4);
 x.fillStyle='#f6c6d2';x.font='bold 26px Georgia';x.textAlign='center';x.fillText('🎂 '+(G.name||'Design your dream cake'),CX,60);
 const sp=x.createRadialGradient(CX,380,50,CX,380,320);sp.addColorStop(0,'rgba(246,198,210,.15)');sp.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sp;x.fillRect(0,80,660,520);
 drawCake(x,false);const r=tierRects()[G.sel];if(r&&G.tab!=='deco'){x.strokeStyle='#ffcf6a';x.setLineDash([5,5]);x.lineWidth=2;x.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);x.setLineDash([])}panel();
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='rgba(18,6,12,.88)';rr(CX-230,90,460,38,12);x.fill();x.fillStyle='#ffcf6a';x.font='bold 16px Georgia';x.textAlign='center';x.fillText(G.msg,CX,115);x.globalAlpha=1}}
startLoop();
