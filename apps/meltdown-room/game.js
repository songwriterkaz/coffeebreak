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
// ===== Coffeebreak Meltdown Room =====
const DEMO=!!window.DEMO,SK=DEMO?'meltD':'melt';let S={best:0,total:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};const G={state:'menu',score:0,level:0};window.G=G;
const WEAP=[['🏏','Bat',1,1.0],['🔨','Sledgehammer',1.8,.6],['🪛','Crowbar',1.3,.85],['🍳','Frying pan',.9,1.2]];
const ROOMS=[['🏢','Office','#3d4a5c','#2a3340',['printer','tv','desk','plate','vase'],0],['🍽️','Kitchen','#6b4a3a','#4a3428',['plate','plate','vase','bottles','tv'],400],['🎂','Wedding cake hall','#7a5a7a','#523a52',['cake','vase','plate','bottles','plate'],1000],['🍾','Bottle bar','#2e4a3e','#1e332a',['bottles','bottles','tv','plate','vase'],1800],['📺','Electronics junkyard','#4a4a3a','#33332a',['tv','printer','tv','printer','desk'],2800]];
const OBJ={plate:{e:'🍽️',w:70,h:22,hp:1,c:'#f4f1ea',pts:20,snd:'glass'},vase:{e:'🏺',w:50,h:80,hp:2,c:'#5aa6d6',pts:40,snd:'glass'},tv:{e:'📺',w:110,h:80,hp:3,c:'#222',pts:70,snd:'crash'},printer:{e:'🖨️',w:100,h:70,hp:4,c:'#ddd',pts:80,snd:'crash'},desk:{e:'🗄️',w:150,h:70,hp:5,c:'#8a5a32',pts:100,snd:'wood'},bottles:{e:'🍾',w:150,h:90,hp:3,c:'#2e8b57',pts:90,snd:'glass'},cake:{e:'🎂',w:120,h:100,hp:3,c:'#fff3f6',pts:110,snd:'splat'}};
const AFF=['You are allowed to feel angry. You handled it safely.','Breathe in. Let it go. You did that.','The stress is lighter now. Be gentle with yourself.','You let it out without hurting anyone. Well done.','Shoulders down. Jaw soft. You\'re OK.'];
let room=0,wi=0,objs=[],sh=[],pops=[],combo=0,comboT=0,scream=0,screamMode=false,mic=null,an=null,label='',shake=0,cool=0,affi=0,swing=0,mp={x:450,y:300};
const AC=()=>{window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)();return window._AC};
function sfx(k,v=1){try{const A=AC(),n=A.currentTime,len=k==='glass'?.5:.35,b=A.createBuffer(1,A.sampleRate*len,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,k==='glass'?3:2);const s=A.createBufferSource();s.buffer=b;const f=A.createBiquadFilter();f.type=k==='glass'?'highpass':'lowpass';f.frequency.value=k==='glass'?2500:k==='splat'?600:900;const g=A.createGain();g.gain.value=.5*v;s.connect(f);f.connect(g);g.connect(A.destination);s.start(n);if(k==='glass'){for(let j=0;j<4;j++){const o=A.createOscillator(),og=A.createGain();o.frequency.value=3000+Math.random()*3000;og.gain.setValueAtTime(.05,n+j*.04);og.gain.exponentialRampToValueAtTime(.001,n+j*.04+.25);o.connect(og);og.connect(A.destination);o.start(n+j*.04);o.stop(n+j*.04+.3)}}if(k==='crash'||k==='wood'){const o=A.createOscillator(),og=A.createGain();o.type='square';o.frequency.setValueAtTime(k==='wood'?120:80,n);o.frequency.exponentialRampToValueAtTime(30,n+.25);og.gain.setValueAtTime(.2,n);og.gain.exponentialRampToValueAtTime(.001,n+.3);o.connect(og);og.connect(A.destination);o.start(n);o.stop(n+.3)}}catch(e){}}
function setup(){objs=[];const R=ROOMS[room];R[4].forEach((k,i)=>{const o=OBJ[k];objs.push({k,...o,x:90+i*165+(160-o.w)/2,y:440-o.h,hp:o.hp,max:o.hp,lab:'',wob:0})});sh=[];combo=0}
function smash(o,p){const W=WEAP[wi];o.hp-=W[2];o.wob=1;shake=6*W[2];sfx(o.snd,.6);if(o.hp<=0){sfx(o.snd,1.2);const n=o.k==='bottles'?60:o.k==='cake'?45:35;for(let i=0;i<n;i++)sh.push({x:o.x+Math.random()*o.w,y:o.y+Math.random()*o.h,vx:(Math.random()-.5)*600*W[3]+(p.x<o.x+o.w/2?200:-200),vy:-Math.random()*500-150,r:Math.random()*6,vr:(Math.random()-.5)*14,s:4+Math.random()*10,c:o.k==='bottles'?['#2e8b57','#7a4a1a','#9fd'][i%3]:o.k==='cake'?['#fff','#f9c','#fd8'][i%3]:o.c,life:4});
  combo=comboT>0?combo+1:1;comboT=2.2;const pts=Math.round(o.pts*(1+combo*.25)*(o.lab?1.5:1));G.score+=pts;pops.push({x:o.x+o.w/2,y:o.y,t:1.4,s:'+'+pts+(combo>1?' COMBO x'+combo:'')+(o.lab?' 💥 '+o.lab:'')});objs.splice(objs.indexOf(o),1);
  if(!objs.length){S.total+=G.score;S.best=Math.max(S.best,G.score);sv();setTimeout(()=>{G.state='clear'},700)}}}
function down(p){mp=p;if(G.state!=='play')return;swing=.25;const o=objs.slice().reverse().find(o=>p.x>o.x-15&&p.x<o.x+o.w+15&&p.y>o.y-15&&p.y<o.y+o.h+15);if(o){if(labelArm&&!o.lab){o.lab=labelArm;labelArm='';return}smash(o,p)}}
let labelArm='';function askLabel(){const v=prompt('What\'s stressing you? (it goes on the next object you tap)','Monday emails');if(v)labelArm=v.slice(0,22)}
async function micOn(){try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const A=AC();an=A.createAnalyser();an.fftSize=512;A.createMediaStreamSource(st).connect(an);mic=st}catch(e){mic=null;pops.push({x:450,y:300,t:2,s:'No mic. Use the ROAR button!'})}}
function micLevel(){if(!an)return 0;const d=new Uint8Array(an.fftSize);an.getByteTimeDomainData(d);let m=0;for(const v of d)m=Math.max(m,Math.abs(v-128));return m/128}
function update(dt){comboT-=dt;shake*=.85;swing=Math.max(0,swing-dt);objs.forEach(o=>o.wob*=.85);
 sh.forEach(s=>{s.vy+=1100*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.r+=s.vr*dt;if(s.y>470){s.y=470;s.vy*=-.35;s.vx*=.7;s.vr*=.6}if(s.x<0||s.x>900)s.vx*=-.6;s.life-=dt*.25});sh=sh.filter(s=>s.life>0).slice(-500);pops.forEach(p=>{p.t-=dt;p.y-=40*dt});pops=pops.filter(p=>p.t>0);
 if(screamMode){scream=Math.max(scream*.96,micLevel());if(scream>.55&&G.state==='play'){G.score+=1}}else scream*=.95;if(G.state==='cool')cool+=dt}
function rooms(){return ROOMS.map((r,i)=>({r,i,ok:(!DEMO||i===0)&&S.total>=r[5]}))}
function draw(){const R=ROOMS[room];x.save();x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
 x.fillStyle=R[2];x.fillRect(-10,-10,920,620);x.fillStyle=R[3];x.fillRect(-10,470,920,140);x.strokeStyle='#0002';for(let i=0;i<900;i+=60){x.beginPath();x.moveTo(i,0);x.lineTo(i,470);x.stroke()}
 if(G.state==='menu'){x.restore();x.fillStyle='#0008';x.fillRect(0,0,900,600);T('MELTDOWN ROOM',454,124,64,'#ff4f7a','center');T('MELTDOWN ROOM',450,120,64,'#fff','center');T('Smash stress, not people. Comedic, safe, messy.',450,160,20,'#ffd2a8','center','');emo('🏏🔨🍳🪛',450,220,48);
  rooms().forEach(({r,i,ok},k)=>button('r'+i,90+k*148,280,136,90,'',()=>{if(!ok){if(DEMO&&i>0)window.demoEnd&&window.demoEnd('The full game unlocks the Kitchen, Wedding Cake Hall, Bottle Bar and Electronics Junkyard, plus all four weapons.');return}room=i;G.score=0;setup();G.state='play';startMusic()},{dis:false,bg:ok?'#3a1424':'#222'}));
  rooms().forEach(({r,i,ok},k)=>{emo(r[0],156+k*148,305,30);T(r[1],156+k*148,345,13,ok?'#fff':'#999','center');if(!ok)T(DEMO&&i>0?'🔒 full game':'🔒 '+r[5]+' pts',156+k*148,362,11,'#aaa','center','')});
  T('Lifetime score: '+S.total+'   Best room: '+S.best,450,410,16,'#fff','center','');button('cool',360,440,180,46,'🌿 Cool-down',()=>{G.state='cool';cool=0;affi=Math.floor(Math.random()*AFF.length)},{bg:'#24423a',ac:'#8fd6b0'});
  T('Just for fun: please never smash real stuff, people or animals.',450,520,13,'#ffd2a8aa','center','');return}
 objs.forEach(o=>{x.save();x.translate(o.x+o.w/2,o.y+o.h);x.rotate(Math.sin(t*40)*o.wob*.15);emo(o.e,0,-o.h/2,Math.max(o.w,o.h)*1.0);if(o.hp<o.max){x.strokeStyle='#000a';x.lineWidth=2;for(let j=0;j<o.max-o.hp;j++){x.beginPath();x.moveTo(-o.w/4+j*9,-o.h);x.lineTo(j*7,-o.h/2);x.lineTo(-j*5,-o.h*.2);x.stroke()}}
  if(o.lab){x.fillStyle='#fff7a8';x.fillRect(-o.w/2,-o.h-28,o.w,22);T(o.lab,0,-o.h-12,12,'#222','center')}x.restore()});
 sh.forEach(s=>{x.save();x.globalAlpha=Math.min(1,s.life);x.translate(s.x,s.y);x.rotate(s.r);x.fillStyle=s.c;x.beginPath();x.moveTo(-s.s/2,0);x.lineTo(0,-s.s/3);x.lineTo(s.s/2,s.s/4);x.closePath();x.fill();x.restore()});
 pops.forEach(p=>{x.globalAlpha=Math.min(1,p.t);T(p.s,p.x,p.y,20,'#ffe066','center');x.globalAlpha=1});x.restore();
 x.save();x.translate(mp.x,mp.y);x.rotate(swing>0?-1.2+swing*6:-.3);emo(WEAP[wi][0],10,-20,54);x.restore();
 if(G.state==='play'||G.state==='clear'){x.fillStyle='#0009';x.fillRect(0,0,900,48);T(ROOMS[room][0]+' '+ROOMS[room][1],14,32,20,'#fff');T('Score '+G.score+(comboT>0&&combo>1?'  🔥x'+combo:''),330,32,20,'#ffe066');
  WEAP.forEach((w,i)=>button('w'+i,14+i*58,500,52,46,w[0],()=>{wi=i},{sel:i===wi,fs:24}));T(WEAP[wi][1],14,566,13,'#fff','left','');
  button('lab',260,500,170,46,labelArm?'🏷️ tap an object':'🏷️ Label stress',askLabel,{sel:!!labelArm,fs:15});
  x.fillStyle='#0008';rr(450,500,200,46,10);x.fill();x.fillStyle=scream>.55?'#ff4f7a':'#ffb347';x.fillRect(458,516,184*Math.min(1,scream),14);T('SCREAM METER',550,512,10,'#fff','center','');
  button('roar',660,500,100,46,'😱 ROAR',()=>{scream=1;G.score+=25;shake=10;pops.push({x:450,y:200,t:1.2,s:'AAARGH! +25'});sfx('crash',.5)},{fs:16});
  button('mic',768,500,118,46,screamMode?'🎤 mic on':'🎤 use mic',()=>{if(!screamMode){screamMode=true;micOn()}else{screamMode=false;mic&&mic.getTracks().forEach(t=>t.stop());an=null}},{fs:14});
  button('menu',640,8,100,32,'☰ Rooms',()=>{G.state='menu'},{fs:13})}
 if(G.state==='clear'){x.fillStyle='#000b';x.fillRect(150,150,600,280);T('ROOM WRECKED! 💥',450,210,40,'#fff','center');T('Score '+G.score+'  ·  Lifetime '+S.total,450,250,20,'#ffe066','center');const nx=ROOMS.find((r,i)=>i>room&&!DEMO&&S.total>=r[5]&&S.total-G.score<r[5]);if(nx)T('Unlocked: '+nx[0]+' '+nx[1]+'!',450,280,18,'#8fd6b0','center');
  button('again',190,320,160,54,'↺ Rebuild',()=>{G.score=0;setup();G.state='play'});button('cd',370,320,160,54,'🌿 Cool down',()=>{G.state='cool';cool=0;affi=Math.floor(Math.random()*AFF.length)},{bg:'#24423a',ac:'#8fd6b0'});button('rm',550,320,160,54,DEMO?'⭐ More rooms':'🚪 Rooms',()=>{if(DEMO){window.demoEnd&&window.demoEnd('Full game: 5 rooms (Office, Kitchen, Wedding Cake Hall, Bottle Bar, Electronics Junkyard) and lifetime unlocks.');return}G.state='menu'})}
 if(G.state==='cool'){x.fillStyle='#16302a';x.fillRect(0,0,900,600);const ph=(cool%10)<4?'Breathe in…':'Breathe out…',sc=(cool%10)<4?.5+(cool%10)/8:1-((cool%10)-4)/12;x.fillStyle='#8fd6b055';x.beginPath();x.arc(450,260,130*sc,0,7);x.fill();x.fillStyle='#8fd6b0';x.beginPath();x.arc(450,260,80*sc,0,7);x.fill();T(ph,450,268,26,'#16302a','center');
  T('🌿 Cool-down',450,70,34,'#fff','center');x.fillStyle='#e8fff4';x.font='italic 20px Georgia';x.textAlign='center';wrapT(AFF[affi],450,450,700,28);x.textAlign='left';button('back',370,500,160,48,'Back to rooms',()=>{G.state='menu'},{bg:'#24423a',ac:'#8fd6b0'})}}
bindInput({down,move:p=>{mp=p}});setup();startLoop();window.MR={setup,smash:i=>smash(objs[i],{x:0,y:0}),get objs(){return objs},set room(v){room=v},S:()=>S,sh:()=>sh.length};
