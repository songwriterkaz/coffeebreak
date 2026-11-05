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
// ===== Coffeebreak Cemetery Walk =====
const DEMO=!!window.DEMO,SK=DEMO?'cemDemo':'cemSave';
let S={read:[],lit:[],walks:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const ST=[['Agnes Pemberton','1841 – 1919','Beekeeper of Hollow Lane','Agnes kept forty hives and named every queen after a poet. Children swore the bees followed her to church on Sundays, humming the hymns a little flat.'],
['Captain Elias Thorn','1802 – 1867','Keeper of the North Light','For thirty years Elias never let the lighthouse lamp go out. On foggy nights, sailors still say they see a warm glow on the headland, guiding them home.'],
['Little Rosie Bell','1888 – 1896','Our sunshine','Rosie loved hopscotch and wild strawberries. Every spring, strawberries grow around her stone though no one ever planted them.'],
['Thomas & Mary Ashdown','Together 61 years','Two hearts, one garden','They met at a harvest dance and never missed one after. Mary was buried first; Thomas brought her a single rose every morning for six years.'],
['Dr. Wilhelmina Grey','1850 – 1922','She came when called','The only doctor for fifty miles, Wilhelmina rode out in every storm with a lantern and a black bag. She delivered half the town, and they never forgot it.'],
['Old Barnaby','? – 1910','A good dog','Barnaby belonged to no one and everyone. He walked each child home from school, then slept by the church door. The town paid for his stone.'],
['Josiah Crane','1790 – 1851','Clockmaker','Josiah made the town clock, which ran perfectly until the night he died, when it stopped at 11:52. It has been restarted many times. It always stops at 11:52.'],
['Evangeline Moss','1866 – 1941','Sang to the moon','Evangeline sang on her porch every full moon. On those nights, if the wind is gentle, some say a soft melody drifts between the yew trees.'],
['The Unknown Sailor','Washed ashore 1879','Known unto the sea','No one knew his name, but the fishing families gave him a proper farewell. Every year, someone still leaves a seashell on his stone.'],
['Henrietta Vale','1855 – 1930','Librarian','Henrietta never fined a single late book. "Stories should be kept as long as they are needed," she said. The library\'s reading lamp is still called Hettie.'],
['Silas Rook','1820 – 1888','Gravedigger, now resting','Silas tended these grounds for forty years and planted every yew you see. He asked to be buried by the gate, "so I can keep an eye on things."'],
['Clara & Her Cat Pip','1872 – 1950','Never apart','Clara\'s black cat Pip lived to an astonishing twenty-four. They passed the same week. A small black cat is often seen sunning itself on this stone.']];
const N=DEMO?4:ST.length,SP=320;
let px=120,cam=0,vx=0,open=null,ff=[],keys={};for(let i=0;i<40;i++)ff.push({x:Math.random()*N*SP+400,y:250+Math.random()*250,p:Math.random()*7});
function readStone(i){open=i;if(!S.read.includes(i)){S.read.push(i);save();G.score=S.read.length}chk()}
function light(i){if(!S.lit.includes(i)){S.lit.push(i);save();chime()}chk()}
function chk(){if(DEMO&&S.read.length>=4&&S.lit.length>=2&&!window.DEMO_ENDED)setTimeout(()=>window.demoEnd&&window.demoEnd('A peaceful walk. The full version has all 12 headstone stories, the whole moonlit path and your saved candles.'),3000)}
function chime(){try{window._AC=window._AC||new AudioContext();const A=window._AC;[880,1320].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.setValueAtTime(.04,A.currentTime+i*.12);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+i*.12+1.2);o.connect(g);g.connect(A.destination);o.start(A.currentTime+i*.12);o.stop(A.currentTime+i*.12+1.3)})}catch(e){}}
function sky(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#05081a');g.addColorStop(.6,'#1a2348');g.addColorStop(1,'#2a3050');x.fillStyle=g;x.fillRect(0,0,900,600);
 for(let i=0;i<70;i++){x.fillStyle='rgba(255,255,255,'+(.4+.4*Math.sin(t*2+i))+')';x.fillRect((i*137-cam*.05)%900+(i*137-cam*.05<0?900:0),(i*53)%300,1.5,1.5)}
 const g2=x.createRadialGradient(720,110,10,720,110,120);g2.addColorStop(0,'rgba(255,250,220,.35)');g2.addColorStop(1,'rgba(255,250,220,0)');x.fillStyle=g2;x.fillRect(560,0,320,260);x.fillStyle='#fff8dc';x.beginPath();x.arc(720,110,46,0,7);x.fill();x.fillStyle='rgba(200,190,160,.3)';x.beginPath();x.arc(705,100,9,0,7);x.arc(735,125,6,0,7);x.fill()
 x.fillStyle='#0e1428';for(let i=0;i<12;i++){const X=(i*170-cam*.3)%1360;const XX=X<-200?X+1360:X;x.beginPath();x.moveTo(XX,420);x.lineTo(XX+60,250+(i%3)*30);x.lineTo(XX+120,420);x.fill()}}
function stone(i,X){const Y=430,sel=Math.abs(px-(i*SP+400))<110;x.fillStyle=sel?'#8a8fa8':'#6a6f88';x.beginPath();x.moveTo(X-50,Y);x.lineTo(X-50,Y-110);x.arc(X,Y-110,50,Math.PI,0);x.lineTo(X+50,Y);x.fill();x.strokeStyle='#4a4e66';x.lineWidth=3;x.stroke();
 x.fillStyle='#3a3e56';x.font='bold 12px Georgia';x.textAlign='center';x.fillText('✝',X,Y-130);x.font='11px Georgia';wrapT(ST[i][0],X,Y-100,90,13);x.fillText(ST[i][1],X,Y-50);x.textAlign='left';
 x.fillStyle='#3a5a2a';for(let k=-3;k<4;k++){x.beginPath();x.ellipse(X+k*15,Y,9,5,0,0,7);x.fill()}
 if(S.lit.includes(i)){x.fillStyle='#f0e8d0';x.fillRect(X+56,Y-24,10,24);const f=1+.15*Math.sin(t*12+i);const g=x.createRadialGradient(X+61,Y-32,1,X+61,Y-32,40*f);g.addColorStop(0,'rgba(255,200,90,.7)');g.addColorStop(1,'rgba(255,200,90,0)');x.fillStyle=g;x.fillRect(X+20,Y-75,82,80);x.fillStyle='#ffcf5a';x.beginPath();x.ellipse(X+61,Y-31,3.5,7*f,0,0,7);x.fill()}
 if(S.read.includes(i))emo('🌼',X-58,Y-6,16);BTN['s'+i]={x:X-55,y:Y-160,w:110,h:160,fn:()=>{if(sel)readStone(i);else px=i*SP+400}}}
function walker(X){const Y=505,step=Math.sin(t*8)*(Math.abs(vx)>5?6:0);const g=x.createRadialGradient(X+18,Y-40,4,X+18,Y-40,110);g.addColorStop(0,'rgba(255,220,140,.25)');g.addColorStop(1,'rgba(255,220,140,0)');x.fillStyle=g;x.fillRect(X-100,Y-150,240,220);
 x.fillStyle='#1a1428';x.beginPath();x.moveTo(X-16,Y);x.lineTo(X-12+step,Y-60);x.lineTo(X+12-step,Y-60);x.lineTo(X+16,Y);x.fill();x.beginPath();x.moveTo(X-20,Y-55);x.quadraticCurveTo(X,Y-120,X+20,Y-55);x.fill();x.beginPath();x.arc(X,Y-100,14,0,7);x.fill();x.fillStyle='#e8c860';x.fillRect(X+18,Y-60,8,12)}
function drawWalk(){sky();cam+=(px-300-cam)*.08;
 x.fillStyle='#16202a';x.fillRect(0,430,900,170);x.fillStyle='#2a2a30';x.beginPath();x.moveTo(0,470);x.lineTo(900,470);x.lineTo(900,520);x.lineTo(0,520);x.fill();
 x.strokeStyle='#0a0a12';x.lineWidth=4;for(let k=0;k<30;k++){const X=k*90-cam%90;x.beginPath();x.moveTo(X,560);x.lineTo(X,500);x.stroke()}x.beginPath();x.moveTo(0,515);x.lineTo(900,515);x.stroke();
 for(let i=0;i<N;i++){const X=i*SP+400-cam;if(X>-100&&X<1000)stone(i,X)}const gx=N*SP+500-cam;if(gx<1000){x.fillStyle='#0a0a12';x.fillRect(gx,300,12,220);x.fillRect(gx+120,300,12,220);T('The gate home',gx+66,290,16,'#aab','center','')}
 walker(px-cam);ff.forEach(f=>{const X=f.x-cam+Math.sin(t+f.p)*20,Y=f.y+Math.cos(t*.7+f.p)*15;if(X<0||X>900)return;x.fillStyle='rgba(220,255,140,'+(.3+.6*Math.abs(Math.sin(t*2+f.p)))+')';x.beginPath();x.arc(X,Y,2.4,0,7);x.fill()});
 x.fillStyle='rgba(200,210,230,.07)';for(let i=0;i<6;i++){x.beginPath();x.ellipse((i*220+t*15-cam*.5)%1300-200,500+(i%2)*30,240,30,0,0,7);x.fill()}
 if(Math.sin(t*.5)>.98)emo('🦉',820,200,30);
 T('📖 '+S.read.length+'/'+N+'   🕯️ '+S.lit.length,20,34,18,'#e8d8b0');T('Walk ◀ ▶ (or arrows). Tap a stone to read.',450,592,13,'rgba(230,220,200,.7)','center','');
 button('l',20,524,70,44,'◀',()=>{px=Math.max(100,px-SP)},{bg:'#1a1a2a',ac:'#c8b88a'});button('r',100,524,70,44,'▶',()=>{px=Math.min(N*SP+460,px+SP)},{bg:'#1a1a2a',ac:'#c8b88a'});
 const near=[...Array(N).keys()].find(i=>Math.abs(px-(i*SP+400))<110);if(near!==undefined&&open===null){button('rd',640,524,120,44,'📖 Read',()=>readStone(near),{bg:'#1a1a2a',ac:'#c8b88a'});button('cd',770,524,110,44,'🕯️ Candle',()=>light(near),{bg:'#1a1a2a',ac:'#ffcf5a',dis:S.lit.includes(near)})}
 if(open!==null){const s=ST[open];x.fillStyle='rgba(10,10,20,.6)';x.fillRect(0,0,900,600);x.fillStyle='#e8e0cc';rr(180,70,540,430,20);x.fill();x.strokeStyle='#8a7a5a';x.lineWidth=4;x.stroke();
  T(s[0],450,130,30,'#2a2418','center');T(s[1],450,160,17,'#5a4a3a','center','');T('“'+s[2]+'”',450,192,18,'#6a4a2a','center','italic ');x.font='18px Georgia';x.fillStyle='#2a2418';x.textAlign='center';wrapT(s[3],450,240,460,28);x.textAlign='left';
  button('lc',230,430,200,48,S.lit.includes(open)?'🕯️ Candle lit':'🕯️ Light a candle',()=>light(open),{dis:S.lit.includes(open),bg:'#3a3020',ac:'#ffcf5a'});button('cl',470,430,200,48,'Rest in peace',()=>{open=null},{bg:'#3a3020',ac:'#c8b88a'})}}
function drawTitle(){sky();x.fillStyle='#16202a';x.fillRect(0,430,900,170);[150,300,600,760].forEach((X,i)=>{x.fillStyle='#4a4e66';x.beginPath();x.moveTo(X-30,460);x.lineTo(X-30,400);x.arc(X,400,30,Math.PI,0);x.lineTo(X+30,460);x.fill()});
 T('Coffeebreak',450,150,30,'#c8b88a','center');T('Cemetery Walk',450,230,72,'#f0ecdc','center');T('A gentle moonlit stroll. Read the stories. Light a candle.',450,280,20,'#c8b88a','center','italic ');
 button('go',340,330,220,56,'🕯️ Begin the walk',()=>{G.state='walk';S.walks++;save()},{bg:'#1a1a2a',ac:'#ffcf5a'});T('All stories are fictional. Spooky, never scary.',450,585,13,'rgba(230,220,200,.6)','center','')}
addEventListener('keydown',e=>{if(e.key==='ArrowLeft')px=Math.max(100,px-SP);if(e.key==='ArrowRight')px=Math.min(N*SP+460,px+SP)});
bindInput({});function update(dt){}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')drawTitle();else drawWalk()}
window.CW={G,S,readStone,light,set px(v){px=v},set open(v){open=v}};startLoop();
