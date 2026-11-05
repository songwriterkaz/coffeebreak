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
// ---- Tea Leaf Reading ----
const SYM=[['🐦','Bird','good news is flying your way'],['❤️','Heart','love and affection surround you'],['⭐','Star','a wish comes true'],['🌙','Moon','a dream reveals something important'],['🗝️','Key','a door opens to new opportunity'],['⚓','Anchor','stability, and a safe harbour'],['🌹','Rose','romance and admiration'],['💀','Skull','an old chapter ends so a new one begins'],['🐱','Cat','trust your instincts'],['🐟','Fish','abundance and money luck'],['🌳','Tree','growth, health and strong roots'],['🏠','House','home happiness and security'],['🔔','Bell','an announcement or celebration'],['💍','Ring','commitment or a promise'],['🦋','Butterfly','joyful transformation'],['☕','Cup','friendship and cosy gatherings'],['🐍','Snake','wisdom and shedding old skin'],['👑','Crown','success and recognition'],['🍀','Clover','a lucky break'],['🌈','Rainbow','hope after a challenge'],['🎵','Music note','creative success and happy songs'],['✈️','Plane','travel or a big journey'],['🕯️','Candle','inspiration lights your way'],['🐘','Elephant','wisdom and good fortune'],['🪶','Feather','lightness, and worries lifting'],['🍎','Apple','learning and achievement'],['🌻','Sunflower','happiness and confidence'],['📜','Letter','news arrives soon'],['🦉','Owl','a wise person helps you'],['💰','Money bag','unexpected money'],['🐝','Bee','busy, rewarding times'],['🌊','Wave','go with the flow'],['🦢','Swan','grace and true love'],['🔮','Crystal','intuition is strong now'],['🐞','Ladybird','small blessings'],['🎂','Cake','celebration ahead'],['🕊️','Dove','peace and harmony'],['🍄','Mushroom','a surprising growth spurt'],['🌸','Blossom','new beginnings in love'],['🎁','Gift','a lovely surprise']];
const DEMO=()=>!!window.DEMO,POOL=()=>DEMO()?SYM.slice(0,10):SYM;
const G={state:'title',score:0,level:+localStorage.teaN||0,swirl:0,tea:1,flip:0,syms:[],pick:-1,said:''};window.G=G;
const CX=450,CY=300;let drag=null,ang=0,leaves=[],sw=0;
function shapePts(e){const o=document.createElement('canvas');o.width=o.height=60;const q=o.getContext('2d');q.font='48px serif';q.textAlign='center';q.textBaseline='middle';q.fillText(e,30,32);const d=q.getImageData(0,0,60,60).data,p=[];for(let y=0;y<60;y+=4)for(let x2=0;x2<60;x2+=4)if(d[(y*60+x2)*4+3]>120)p.push([x2-30,y-30]);return p}
function newReading(){startMusic();if(DEMO()&&(+localStorage.teaDemo||0)>=2){demoEnd('You have tried your free tea leaf readings! 40 symbols and unlimited readings are in the full game.');return}
 G.state='play';G.phase='swirl';G.swirl=0;G.tea=1;G.flip=0;G.pick=-1;G.said='Swirl the cup three times, thinking of your question…';
 leaves=[];for(let i=0;i<120;i++)leaves.push({a:Math.random()*6.3,r:Math.random()*110,tx:0,ty:0})}
function settle(){const P=POOL(),n=3+(Math.random()*3|0),ch=[];while(ch.length<n){const s=P[Math.random()*P.length|0];if(!ch.includes(s))ch.push(s)}
 const zones=['near the rim: very soon','in the middle: within months','at the bottom: further in the future'];
 const placed=[];G.syms=ch.map((s,i)=>{let a,rd,k=0;do{a=Math.random()*6.3;rd=i===0?150:30+Math.random()*130;k++}while(k<80&&placed.some(q=>Math.hypot(CX+Math.cos(a)*rd-q[0],CY+Math.sin(a)*rd*.85-q[1])<95));placed.push([CX+Math.cos(a)*rd,CY+Math.sin(a)*rd*.85]);return{s,x:CX+Math.cos(a)*rd,y:CY+Math.sin(a)*rd*.85,z:rd>120?0:rd>70?1:2,side:Math.cos(a)>0.3?'near the handle: it concerns you closely':'away from the handle: it involves others',pts:shapePts(s[0]),seen:0}});
 G.syms.forEach(o=>o.zone=zones[o.z]);
 leaves=[];G.syms.forEach(o=>o.pts.forEach(p=>leaves.push({x:CX+(Math.random()-.5)*300,y:CY+(Math.random()-.5)*260,tx:o.x+p[0]*1.3,ty:o.y+p[1]*1.3})));for(let i=0;i<40;i++){const a=Math.random()*6.3,r=Math.random()*180;leaves.push({x:CX,y:CY,tx:CX+Math.cos(a)*r,ty:CY+Math.sin(a)*r*.85})}}
bindInput({down(p){if(G.state==='play'&&G.phase==='swirl')drag=p;if(G.state==='play'&&G.phase==='read'){G.syms.forEach((o,i)=>{if(Math.hypot(p.x-o.x,p.y-o.y)<36){G.pick=i;o.seen=1;G.said=o.s[1]+': '+o.s[2]+'.';if(G.syms.every(q=>q.seen))finish()}})}},
 move(p){if(!drag)return;const a0=Math.atan2(drag.y-CY,drag.x-CX),a1=Math.atan2(p.y-CY,p.x-CX);let da=a1-a0;if(da>Math.PI)da-=6.283;if(da<-Math.PI)da+=6.283;sw+=da*4;G.swirl=Math.min(3,G.swirl+Math.abs(da)/6.283);drag=p;
  if(G.swirl>=3&&G.phase==='swirl'){G.phase='drink';G.said='Now sip the tea down, leaving a little at the bottom.'}},up(){drag=null}});
function finish(){if(G.state==='over')return;G.state='over';G.score=G.syms.length;localStorage.teaN=G.level=(+localStorage.teaN||0)+1;if(DEMO())localStorage.teaDemo=(+localStorage.teaDemo||0)+1}
function update(dt){sw*=Math.pow(.3,dt);ang+=sw*dt;
 if(G.phase==='flipping'){G.flip=Math.min(1,G.flip+dt*.8);if(G.flip>=1){G.phase='read';settle();G.said='Tap each shape in the leaves to read its meaning.'}}
 if(G.phase==='read'||G.state==='over')leaves.forEach(l=>{l.x+=(l.tx-l.x)*Math.min(1,dt*2.5);l.y+=(l.ty-l.y)*Math.min(1,dt*2.5)})}
function cupTop(){x.fillStyle='#f6e6ea';x.beginPath();x.ellipse(CX,CY,250,215,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(CX,CY,215,185,0,0,7);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=6;x.stroke();
 for(let i=0;i<10;i++)rose(CX+Math.cos(i*.628)*232,CY+Math.sin(i*.628)*200,1.4);x.fillStyle='#f6e6ea';rr(CX+240,CY-30,60,60,30);x.fill();x.fillStyle='#fff';rr(CX+252,CY-16,34,32,16);x.fill()}
function draw(){const g=x.createRadialGradient(CX,CY,60,CX,CY,600);g.addColorStop(0,'#4a2a3a');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(0,0,W,H);
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 50px Georgia';x.fillText('🍵 Tea Leaf Reading',W/2,140);x.fillStyle='#ffe9c7';x.font='19px Georgia';
  x.fillText('Think of a question, swirl the cup, drink, flip it onto the saucer,',W/2,190);x.fillText('then read the shapes the leaves leave behind.',W/2,218);emo('🫖',W/2,300,110);
  button('go',W/2-110,400,220,56,'🍵 Pour my tea',newReading);x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('Readings: '+G.level+(DEMO()?'  ·  Demo: 2 readings, 10 symbols':''),W/2,490);ent();return}
 if(G.phase==='swirl'||G.phase==='drink'){cupTop();x.save();x.beginPath();x.ellipse(CX,CY,213,183,0,0,7);x.clip();const lv=G.tea;x.fillStyle='rgba(150,90,40,'+(.25+lv*.6)+')';x.beginPath();x.ellipse(CX,CY,213*(.5+lv*.5),183*(.5+lv*.5),0,0,7);x.fill();
  leaves.forEach(l=>{const a=l.a+ang,px=CX+Math.cos(a)*l.r*(.5+lv*.5),py=CY+Math.sin(a)*l.r*.85*(.5+lv*.5);x.fillStyle='#2a1406';x.fillRect(px-2,py-1,4,3)});
  x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=3;x.beginPath();x.arc(CX,CY,120,ang,ang+2);x.stroke();x.restore();
  if(G.phase==='swirl'){x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.textAlign='center';x.fillText('Drag in circles to swirl: '+'🌀'.repeat(Math.floor(G.swirl))+'○'.repeat(3-Math.floor(G.swirl)),W/2,560)}
  else{button('sip',W/2-180,535,170,46,'☕ Sip',()=>{G.tea=Math.max(.08,G.tea-.23);if(G.tea<=.1)G.said='Lovely. Now flip the cup onto the saucer.'});button('flip',W/2+10,535,170,46,'🔄 Flip the cup',()=>{G.phase='flipping';G.said='Turning the cup three times on the saucer…'},{dis:G.tea>.1})}}
 if(G.phase==='flipping'){const f=G.flip;x.save();x.translate(CX,CY+40);x.fillStyle='#f6e6ea';x.beginPath();x.ellipse(0,140,300,40,0,0,7);x.fill();x.rotate(f*Math.PI);x.fillStyle='#fff';x.beginPath();x.moveTo(-150,-80);x.lineTo(150,-80);x.lineTo(100,80);x.lineTo(-100,80);x.fill();rose(0,0,3);x.restore()}
 if(G.phase==='read'||G.state==='over'){cupTop();leaves.forEach(l=>{x.fillStyle='#3a1a08';x.fillRect(l.x-2,l.y-1.5,4,3)});
  G.syms.forEach((o,i)=>{if(o.seen){x.globalAlpha=.85;emo(o.s[0],o.x,o.y-50,30);x.globalAlpha=1;x.strokeStyle=i===G.pick?'#ffcf6a':'rgba(232,160,176,.7)';x.lineWidth=2;x.beginPath();x.arc(o.x,o.y,38,0,7);x.stroke()}else{x.strokeStyle='rgba(255,207,106,'+(.3+.3*Math.sin(t*4+i))+')';x.setLineDash([4,4]);x.beginPath();x.arc(o.x,o.y,36,0,7);x.stroke();x.setLineDash([])}});
  if(G.pick>=0){const o=G.syms[G.pick];x.fillStyle='rgba(18,6,12,.85)';rr(20,470,860,70,12);x.fill();x.fillStyle='#ffcf6a';x.font='bold 18px Georgia';x.textAlign='left';x.fillText(o.s[0]+' '+o.s[1]+': '+o.s[2]+'.',36,498);x.fillStyle='#ffe9c7';x.font='15px Georgia';x.fillText('Found '+o.zone+', '+o.side+'.',36,524)}
  if(G.state==='over'){button('again',W-200,545,180,40,'🍵 New reading',newReading);button('sum',20,545,200,40,'📜 Summary',()=>{G.sumOn=!G.sumOn})}
  if(G.sumOn&&G.state==='over'){x.fillStyle='rgba(18,6,12,.94)';rr(120,60,660,400,16);x.fill();x.fillStyle='#f6c6d2';x.font='bold 26px Georgia';x.textAlign='center';x.fillText('Your tea leaves say…',W/2,104);x.font='16px Georgia';x.fillStyle='#ffe9c7';x.textAlign='left';let y=140;
   G.syms.forEach(o=>{y=wrapT(o.s[0]+' '+o.s[1]+' ('+o.zone.split(':')[1].trim()+'): '+o.s[2]+'.',150,y,600,22)+4});x.fillStyle='#ffcf6a';x.textAlign='center';wrapT(['The leaves are kind to you today.','Good things are brewing.','Trust the little signs around you.'][G.level%3],W/2,y+20,600,22);button('cls',W/2-60,410,120,36,'Close',()=>G.sumOn=false)}}
 x.textAlign='center';x.fillStyle='rgba(18,6,12,.7)';rr(W/2-330,8,660,34,12);x.fill();x.fillStyle='#ffe9ef';x.font='italic 17px Georgia';x.fillText(G.said,W/2,31);ent()}
startLoop();
