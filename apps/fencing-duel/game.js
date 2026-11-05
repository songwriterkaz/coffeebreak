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
// ---- Kaz: stylised canvas character (original) ----
function drawKaz(X,Y,s,o){o=o||{};const f=o.face||1,lean=o.lean||0,arm=o.arm===undefined?-0.3:o.arm,bob=Math.sin(t*3)*1.5*(o.still?0:1);
 x.save();x.translate(X,Y);x.scale(s*f,s);x.rotate(lean);
 // legs (light blue jeans)
 const st=o.stance||0;x.fillStyle='#8fb8e0';x.strokeStyle='#5d86b3';x.lineWidth=2;
 x.beginPath();x.moveTo(-14,-95);x.lineTo(-26-st*14,0);x.lineTo(-12-st*14,0);x.lineTo(-2,-80);x.lineTo(8,-80);x.lineTo(14+st*16,0);x.lineTo(28+st*16,0);x.lineTo(16,-95);x.closePath();x.fill();x.stroke();
 x.fillStyle='#2a2a33';x.fillRect(-30-st*14,-6,22,7);x.fillRect(12+st*16,-6,22,7);
 // midriff + pink crop top
 x.fillStyle='#f6d8c8';x.fillRect(-15,-112+bob,31,18);
 x.fillStyle='#ff8fc8';rr(-19,-160+bob,39,50,8);x.fill();x.fillStyle='#ffb3da';x.fillRect(-15,-150+bob,6,30);
 // chain handbag (silver) on hip
 x.strokeStyle='#d8dde6';x.lineWidth=2;x.setLineDash([3,2]);x.beginPath();x.moveTo(-14,-158+bob);x.lineTo(-24,-100+bob);x.stroke();x.setLineDash([]);
 x.fillStyle='#c9ced8';rr(-34,-104+bob,22,16,4);x.fill();x.fillStyle='#fff';x.fillRect(-30,-100+bob,4,4);
 // back arm
 x.strokeStyle='#f6d8c8';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(-14,-150+bob);x.lineTo(-24,-122+bob);x.lineTo(-18,-104+bob);x.stroke();
 // neck & chest with gothic lace tattoo
 x.fillStyle='#f6d8c8';x.fillRect(-6,-176+bob,12,18);x.beginPath();x.moveTo(-16,-162+bob);x.lineTo(17,-162+bob);x.lineTo(10,-156+bob);x.lineTo(-10,-156+bob);x.fill();
 x.strokeStyle='#4a4a52';x.lineWidth=1;for(let i=-12;i<=12;i+=4){x.beginPath();x.arc(i,-160+bob,2.2,0,Math.PI);x.stroke()}x.beginPath();x.moveTo(-5,-174+bob);x.quadraticCurveTo(0,-166+bob,5,-174+bob);x.stroke();x.beginPath();x.arc(0,-168+bob,1.6,0,7);x.stroke();
 // head
 x.fillStyle='#f8e0d2';x.beginPath();x.ellipse(0,-196+bob,17,21,0,0,7);x.fill();
 // messy dark hair
 x.fillStyle='#1f1a1d';x.beginPath();x.moveTo(-20,-186+bob);for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;x.lineTo(Math.cos(a)*(22+(i%2)*5),-200+bob+Math.sin(a)*(24+(i%2)*4))}x.lineTo(22,-172+bob);x.lineTo(16,-190+bob);x.quadraticCurveTo(0,-212+bob,-14,-192+bob);x.lineTo(-22,-166+bob);x.closePath();x.fill();
 x.strokeStyle='#1f1a1d';x.lineWidth=2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(-18+i*12,-218+bob);x.lineTo(-22+i*12+Math.sin(t*2+i)*2,-226+bob);x.stroke()}
 // butterfly clips orange, pink, blue
 [['#ff8a2a',-14,-214],['#ff5fb0',2,-221],['#3aa0ff',16,-210]].forEach(([col,bx,by])=>{x.fillStyle=col;x.beginPath();x.ellipse(bx-4,by+bob,4,3,-.5,0,7);x.ellipse(bx+4,by+bob,4,3,.5,0,7);x.fill();x.fillStyle='#222';x.fillRect(bx-1,by-3+bob,2,6)});
 // face: blue eyes, serious brows, glossy lips
 x.fillStyle='#fff';x.beginPath();x.ellipse(-6,-197+bob,4,3,0,0,7);x.ellipse(8,-197+bob,4,3,0,0,7);x.fill();
 x.fillStyle='#2f7fd6';x.beginPath();x.arc(-5,-197+bob,2.2,0,7);x.arc(9,-197+bob,2.2,0,7);x.fill();
 x.strokeStyle='#1f1a1d';x.lineWidth=2;x.beginPath();x.moveTo(-11,-204+bob);x.lineTo(-2,-202+bob);x.moveTo(4,-202+bob);x.lineTo(13,-204+bob);x.stroke();
 const sc=o.scared;x.fillStyle='#d8406a';x.beginPath();if(sc)x.ellipse(2,-182+bob,4,4,0,0,7);else x.ellipse(2,-183+bob,6,2.6,0,0,7);x.fill();
 x.fillStyle='#fff';x.globalAlpha=.6+.4*Math.sin(t*5);x.fillRect(1,-185+bob,3,1.3);x.globalAlpha=1;
 // front arm (+ optional sword/torch)
 x.save();x.translate(14,-150+bob);x.rotate(arm);x.strokeStyle='#f6d8c8';x.lineWidth=8;x.beginPath();x.moveTo(0,0);x.lineTo(30,0);x.stroke();
 if(o.sword){x.strokeStyle='#c9a646';x.lineWidth=3;x.beginPath();x.moveTo(30,-8);x.lineTo(30,8);x.stroke();x.strokeStyle='#e9eef5';x.lineWidth=2;x.beginPath();x.moveTo(32,0);x.lineTo(32+(o.blade||95),0);x.stroke()}
 if(o.torch){x.fillStyle='#444';x.fillRect(28,-4,16,8);x.fillStyle='#fff6b0';x.beginPath();x.arc(46,0,4,0,7);x.fill()}
 x.restore();
 // sparkles on lips
 if(Math.sin(t*4)>.7){x.fillStyle='#fff';x.font='8px serif';x.fillText('✦',8,-186+bob)}
 x.restore()}
// ===== Coffeebreak Fencing Duel =====
const DEMO=!!window.DEMO,SK=DEMO?'fenceD':'fence';let S={best:0,beaten:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};const G={state:'menu',score:0,level:0};window.G=G;
// name, colour, arena, speed (windup secs), aggression, parry chance, quote
const OPP=[['Pip the Novice','#7ac27a',0,1.1,.35,.15,'Go easy, I only started Tuesday!'],['Baron Brisket','#c27a4a',0,.95,.45,.25,'En garde, you upstart!'],
 ['Madame Mirelle','#b07ad6',1,.8,.5,.35,'My blade has never been late.'],['Captain Vex','#d64a4a',1,.7,.6,.4,'Fast feet, faster sword.'],
 ['The Silent Duke','#6a7a9a',2,.6,.65,.5,'...'],['Grandmaster Orla','#e0c060',2,.5,.75,.6,'Show me what you have, Kaz.']];
const ARENA=[['🏛️ Village Hall','#5a3a2a','#3a2418','#c8a070'],['🏰 Castle Courtyard','#4a5060','#2a2e38','#9aa0b0'],['🌙 Rooftop at Midnight','#1a1a3a','#0a0a1a','#6a6a9a']];
const MAXO=DEMO?2:OPP.length;let oi=0,px=300,ox=600,ps='idle',pt=0,os='idle',ot=0,pS=0,oS=0,msg='',msgT=0,rip=0,keys={},sparks=[],combo=0,flash=0;
const RANGE=190;
function sfx(f,d,ty,v){try{const A=window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.type=ty||'triangle';o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f*1.6,n+d);g.gain.setValueAtTime(v||.15,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
function clang(){sfx(1800,.15,'square',.08);sfx(2600,.2,'triangle',.06)}
function say(s){msg=s;msgT=1.6}
function startBout(i){oi=i;px=300;ox=600;ps='idle';os='idle';ot=1.2;pS=0;oS=0;rip=0;combo=0;G.state='bout';say(OPP[i][0]+': "'+OPP[i][6]+'"')}
function reset(){px=300;ox=600;ps='idle';os='idle';ot=1+Math.random();rip=0}
function touch(byP,pts){if(byP){pS++;G.score+=pts+combo*20;combo++;say(pts>=200?'RIPOSTE! Touché! +'+(pts+(combo-1)*20):'Touché! +'+(pts+(combo-1)*20));sfx(660,.3,'sine',.2)}else{oS++;combo=0;say('Touch to '+OPP[oi][0]+'!');sfx(180,.4,'sawtooth',.12)}
 flash=.25;for(let i=0;i<14;i++)sparks.push({x:(px+ox)/2,y:330,vx:(Math.random()-.5)*300,vy:-Math.random()*250,l:.6});
 if(pS>=5||oS>=5){G.state='result';if(pS>=5){G.score+=500;S.beaten=Math.max(S.beaten,oi+1)}S.best=Math.max(S.best,G.score);sv();return}setTimeout(reset,700);ps='hold';os='hold'}
function act(a){if(G.state!=='bout'||ps==='hold')return;const d=ox-px;
 if(a==='adv'&&ps==='idle'){px=Math.min(ox-90,px+40);sfx(300,.05)}
 if(a==='ret'&&ps==='idle'){px=Math.max(60,px-40);sfx(250,.05)}
 if(a==='lunge'&&ps==='idle'){ps='lunge';pt=.35;sfx(900,.12,'triangle',.1);px=Math.min(ox-70,px+60);
  const d2=ox-px;if(d2>RANGE){say('Too far! Use footwork.');return}
  if(os==='parry'||(os==='idle'&&Math.random()<OPP[oi][5])){os='parry';ot=.5;clang();say(OPP[oi][0]+' parries!');ps='open';pt=.6;return}
  if(os==='attack'&&ot>.15){touch(false);return}
  touch(true,100)}
 if(a==='parry'&&ps==='idle'){ps='parry';pt=.4;sfx(500,.08)}
 if(a==='rip'&&rip>0){rip=0;ps='lunge';pt=.3;clang();touch(true,250)}}
function update(dt){if(msgT>0)msgT-=dt;if(flash>0)flash-=dt;sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=600*dt;s.l-=dt});sparks=sparks.filter(s=>s.l>0);
 if(G.state!=='bout')return;if(rip>0)rip-=dt;
 if(ps!=='idle'&&ps!=='hold'){pt-=dt;if(pt<=0){if(ps==='lunge')px=Math.max(60,px-60);ps='idle'}}
 const O=OPP[oi];ot-=dt;
 if(os==='idle'&&ot<=0){const d=ox-px;if(d>RANGE+30){ox-=40;ot=.5}else if(Math.random()<O[4]){os='wind';ot=O[3];say('⚠️ '+O[0]+' winds up…')}else if(Math.random()<.4&&ox<820){ox+=30;ot=.6}else{os='parry';ot=.6}}
 else if(os==='wind'&&ot<=0){os='attack';ot=.3}
 else if(os==='attack'){if(ps==='parry'){clang();os='stagger';ot=1.0;rip=1.0;combo++;G.score+=30;say('PARRY! Riposte now!');for(let i=0;i<8;i++)sparks.push({x:(px+ox)/2,y:300,vx:(Math.random()-.5)*200,vy:-Math.random()*200,l:.5})}
  else if(ot<=0){if(ox-px<RANGE+40)touch(false);else{os='idle';ot=.6;say('Dodged by distance!')}}}
 else if((os==='parry'||os==='stagger')&&ot<=0){os='idle';ot=.4+Math.random()*.8}}
function down(p){}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')act('ret');if(k==='d'||k==='arrowright')act('adv');if(k==='j'||k===' ')act('lunge');if(k==='k')act('parry');if(k==='l')act('rip')});
function drawOpp(X,Y,col){const st=os,ln=st==='wind'?-.15:st==='attack'?.2:st==='stagger'?-.25:0;x.save();x.translate(X,Y);x.rotate(-ln);
 x.fillStyle='#f2f2f2';x.fillRect(-14,-150,28,60);x.fillStyle=col;x.fillRect(-14,-150,28,10);x.fillStyle='#ddd';x.fillRect(-16,-92,12,92);x.fillRect(4,-92,12,92);
 x.fillStyle='#333';x.beginPath();x.ellipse(0,-172,16,20,0,0,7);x.fill();x.strokeStyle='#888';x.lineWidth=1;for(let i=-10;i<=10;i+=4){x.beginPath();x.moveTo(i,-188);x.lineTo(i,-156);x.stroke()}
 x.fillStyle=col;x.beginPath();x.moveTo(-6,-192);x.lineTo(0,-208);x.lineTo(6,-192);x.fill();
 const a=st==='wind'?-1.1:st==='attack'?.05:st==='parry'?-.6:-.25;x.save();x.translate(-12,-140);x.rotate(Math.PI-a);x.strokeStyle='#f2f2f2';x.lineWidth=8;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.lineTo(30,0);x.stroke();x.strokeStyle='#e9eef5';x.lineWidth=2;x.beginPath();x.moveTo(32,0);x.lineTo(125,0);x.stroke();x.restore();x.restore()}
function draw(){const A=ARENA[G.state==='bout'||G.state==='result'?OPP[oi][2]:0];const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,A[1]);g.addColorStop(1,A[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
 if(A===ARENA[2]){x.fillStyle='#fff8';for(let i=0;i<40;i++)x.fillRect((i*137)%900,(i*71)%250,2,2);x.fillStyle='#ffeeaa';x.beginPath();x.arc(760,90,40,0,7);x.fill()}
 if(A===ARENA[1]){x.fillStyle='#3a3e48';for(let i=0;i<9;i++)x.fillRect(i*110,120,70,40);x.fillRect(0,160,900,40)}
 if(A===ARENA[0]){x.fillStyle='#7a5a3a';for(let i=0;i<6;i++)x.fillRect(80+i*140,90,60,90);x.fillStyle='#ffe9a8';x.fillRect(420,40,60,8)}
 x.fillStyle=A[3];x.fillRect(40,420,820,14);x.fillStyle='#0004';x.fillRect(0,434,900,166);
 if(G.state==='menu'){x.fillStyle='#0009';x.fillRect(0,0,W,H);drawKaz(200,470,1.6,{sword:1,arm:-.6,stance:.5});T('Coffeebreak Fencing Duel',560,90,40,'#ffe9c7','center');T('Starring Kaz',560,128,20,'#ff8fc8','center','italic ');
  T('Best score '+S.best,560,160,16,'#ffe066','center','');
  OPP.forEach((o,i)=>{const lock=i>=MAXO||(i>S.beaten&&i>0&&!DEMO&&false);button('o'+i,400,180+i*52,320,44,(i<MAXO?'⚔️ ':'🔒 ')+o[0]+' · '+ARENA[o[2]][0].slice(3),()=>{if(i>=MAXO){window.demoEnd&&window.demoEnd('The full game has all 6 opponents across 3 arenas: Village Hall, Castle Courtyard and the Midnight Rooftop.');return}G.score=0;startBout(i)},{fs:15,dis:false,bg:i<MAXO?'#3a1424':'#222'})});
  T('Keys: A/D footwork · J or Space lunge · K parry · L riposte (or use the buttons)',450,520,14,'#fff','center','');ent();return}
 drawKaz(px,430,1.05,{sword:1,arm:ps==='lunge'?0:ps==='parry'?-1.0:-.3,lean:ps==='lunge'?.18:0,stance:ps==='lunge'?1:.4});drawOpp(ox,430,OPP[oi][1]);
 sparks.forEach(s=>{x.fillStyle='#ffe066';x.globalAlpha=Math.max(0,s.l*1.6);x.fillRect(s.x,s.y,3,3)});x.globalAlpha=1;if(flash>0){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,W,H)}
 T('KAZ '+pS,30,40,26,'#ff8fc8');T(OPP[oi][0]+' '+oS,870,100,22,OPP[oi][1],'right');T('Score '+G.score+(combo>1?'  🔥x'+combo:''),450,40,20,'#ffe066','center');T(ARENA[OPP[oi][2]][0],450,64,14,'#fff','center','');
 if(os==='wind'){x.fillStyle='#ff4f4f';x.beginPath();x.arc(ox,210,10+Math.sin(t*30)*3,0,7);x.fill()}
 if(msgT>0)T(msg,450,110,20,'#fff','center');
 if(G.state==='bout'){button('ret',40,470,120,56,'◀ Retreat',()=>act('ret'));button('adv',170,470,120,56,'Advance ▶',()=>act('adv'));button('lun',330,470,150,56,'⚔️ Lunge',()=>act('lunge'),{bg:'#5a1a2a'});button('par',490,470,150,56,'🛡️ Parry',()=>act('parry'),{bg:'#1a3a5a',ac:'#8ac'});button('rip',650,470,190,56,'✨ Riposte',()=>act('rip'),{dis:rip<=0,bg:'#5a4a1a',ac:'#ffe066'});button('q',20,60,90,30,'☰ Menu',()=>{G.state='menu'},{fs:13})}
 if(G.state==='result'){x.fillStyle='#000b';x.fillRect(170,150,560,280);const win=pS>=5;T(win?'VICTORY! 🏆':'Defeated…',450,215,42,win?'#ffe066':'#ff8fa0','center');T('Score '+G.score+'   ·   Best '+S.best,450,255,20,'#fff','center');
  if(win&&oi+1<OPP.length)button('nx',190,320,250,54,'Next opponent ▶',()=>{if(oi+1>=MAXO){window.demoEnd&&window.demoEnd('You beat both demo opponents! The full game has 4 more rivals, including Grandmaster Orla, across 3 arenas.');return}startBout(oi+1)});
  button('rt',460,320,250,54,win?'🏠 Menu':'↺ Rematch',()=>{if(win){G.state='menu'}else{G.score=0;startBout(oi)}})}
 ent()}
bindInput({down});startLoop();window.FD={act,startBout,get st(){return {ps,os,pS,oS,rip,px,ox}},setOs:(s,v)=>{os=s;ot=v}};
