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
// ===== Coffeebreak Model Photoshoot =====
const DEMO=!!window.DEMO,SK=DEMO?'shootDemo':'shootSave';
let S={pf:[],shots:0,best:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){S.pf.pop();try{localStorage.setItem(SK,JSON.stringify(S))}catch(e2){}}};
const G={state:'title',score:S.shots,level:0};window.G=G;
const SKIN=['#f6d2b8','#e8b48f','#c68a5e','#8d5a3b','#5a3a26'],HAIR=['#2a1a10','#6a3a1a','#d8a840','#c03a2a','#e8e0d8','#7a4ad8'];
const OUT=[['Summer dress','dress','#ffb4c8','#ff6f91'],['Denim & tee','set','#ffffff','#3a6ab8'],['Evening gown','gown','#2a1a4a','#b89aff'],['Sporty','set','#ffd24a','#2a2a2a'],['Business suit','suit','#2a3a5a','#2a3a5a'],['Boho','dress','#e8c890','#a8603a'],['Streetwear','set','#4ad6a0','#3a3a3a'],['Red carpet','gown','#c0102a','#ffd24a']];
const ACC=['None','🕶️','👒','🎀','👜','💍','🧣','👑'];
const POSE=[['Classic',[20,-20],[5,-5]],['Hand on hip',[70,-20],[8,-8]],['Wave',[20,-150],[5,-5]],['Power',[50,-50],[18,-18]],['Twirl',[100,-100],[5,-25]],['Walk',[25,-30],[-15,15]]];
const BD=[['Studio white','#f4f4f4','#d8d8d8'],['Beach','#7fd4ff','#f4dca0'],['City night','#1a1a3a','#3a3a5a'],['Garden','#bfe8ff','#6ac060'],['Paris','#ffd8c8','#c8a090'],['Neon','#2a0a3a','#ff3aa8']];
const LT=[['Soft',0],['Golden hour',1],['Cool blue',2],['Spotlight',3],['Rainbow',4]];
const BR=[['Beach summer campaign',1,[0,5],1],['Evening gala cover',2,[2,7],3],['Sports brand ad',3,[3,6],3],['City fashion week',2,[1,4,6],0],['Garden party spread',3,[0,5],1],['Luxury jewellery shoot',0,[2,7],3]];
let L={sk:1,hr:0,hs:0,o:0,a:0,p:0,b:0,l:0},brief=null,flash=0,last=null,view=null,tab=0;
function newBrief(){brief=BR[Math.floor(Math.random()*(DEMO?3:BR.length))]}
function rate(){let s=50;if(L.b===brief[1])s+=20;if(brief[2].includes(L.o))s+=20;if(L.l===brief[3])s+=10;if(L.a)s+=5;if(L.p)s+=5;return Math.min(100,s-(L.b===brief[1]?0:5))}
function snap(){const sc=rate();flash=1;try{const k=document.createElement('canvas');k.width=150;k.height=100;k.getContext('2d').drawImage(c,0,0,150,100);last={img:k.toDataURL('image/jpeg',.6),sc,brief:brief[0]};S.pf.unshift(last);S.pf=S.pf.slice(0,DEMO?3:24)}catch(e){last={sc,brief:brief[0]}}
 S.shots++;S.best=Math.max(S.best,sc);G.score=S.shots;save();shutter();
 if(DEMO&&S.shots>=3)setTimeout(()=>window.demoEnd&&window.demoEnd('Gorgeous shots! The full version has all 8 outfits, 6 backdrops, 6 poses, 5 lighting set-ups, every brief and a 24-photo portfolio.'),2500)}
function shutter(){try{window._AC=window._AC||new AudioContext();const A=window._AC,b=A.createBuffer(1,4000,44100),d=b.getChannelData(0);for(let i=0;i<4000;i++)d[i]=(Math.random()*2-1)*(1-i/4000);const s=A.createBufferSource(),g=A.createGain();g.gain.value=.15;s.buffer=b;s.connect(g);g.connect(A.destination);s.start()}catch(e){}}
function backdrop(X,Y,w,h){const b=BD[L.b];const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,b[1]);g.addColorStop(1,b[2]);x.fillStyle=g;x.fillRect(X,Y,w,h);
 if(L.b===1){x.fillStyle='#fff6';x.fillRect(X,Y+h*.6,w,4);emo('☀️',X+w-60,Y+60,40);emo('🌴',X+50,Y+h*.55,80)}if(L.b===2)for(let i=0;i<12;i++){x.fillStyle='#ffd24a';x.fillRect(X+20+i*45,Y+h*.3+(i%3)*30,10,14);x.fillStyle='#2a2a4a';x.fillRect(X+10+i*45,Y+h*.25+(i%4)*20,30,h)}if(L.b===3){emo('🌸',X+60,Y+h-60,46);emo('🌷',X+w-60,Y+h-70,46);emo('🌳',X+80,Y+120,80)}if(L.b===4)emo('🗼',X+w-90,Y+h*.45,140);if(L.b===5){x.strokeStyle='#3af0ff';x.lineWidth=6;x.shadowColor='#3af0ff';x.shadowBlur=20;x.strokeRect(X+30,Y+30,w-60,h-80);x.shadowBlur=0}}
function limb(X,Y,len,ang,w,col){x.save();x.translate(X,Y);x.rotate(ang*Math.PI/180);x.fillStyle=col;rr(-w/2,0,w,len,w/2);x.fill();x.restore()}
function model(X,Y,s){const o=OUT[L.o],sk=SKIN[L.sk],p=POSE[L.p],bob=Math.sin(t*2)*2;x.save();x.translate(X,Y+bob);x.scale(s,s);
 x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(0,250,60,10,0,0,7);x.fill();
 limb(-12,120,130,p[2][0],18,o[1]==='gown'?o[2]:sk);limb(12,120,130,p[2][1],18,o[1]==='gown'?o[2]:sk);if(o[1]==='set'||o[1]==='suit'){limb(-12,120,110,p[2][0],22,o[3]);limb(12,120,110,p[2][1],22,o[3])}
 x.fillStyle='#2a2a2a';x.beginPath();x.ellipse(-12+Math.sin(-p[2][0]*Math.PI/180)*130,252,12,6,0,0,7);x.ellipse(12+Math.sin(-p[2][1]*Math.PI/180)*130,252,12,6,0,0,7);x.fill();
 x.fillStyle=o[2];x.beginPath();if(o[1]==='dress'){x.moveTo(-26,10);x.lineTo(26,10);x.lineTo(50,170);x.lineTo(-50,170)}else if(o[1]==='gown'){x.moveTo(-24,10);x.lineTo(24,10);x.lineTo(60,250);x.lineTo(-60,250)}else{x.moveTo(-28,10);x.lineTo(28,10);x.lineTo(24,125);x.lineTo(-24,125)}x.fill();
 if(o[1]==='suit'){x.fillStyle='#fff';x.beginPath();x.moveTo(-8,10);x.lineTo(8,10);x.lineTo(0,50);x.fill()}if(o[1]==='gown'||o[1]==='dress'){x.fillStyle=o[3];x.fillRect(-26,90,52,8)}
 const ac=o[1]==='set'||o[1]==='suit'?o[2]:sk;limb(-26,16,100,p[1][0],14,ac);limb(26,16,100,p[1][1],14,ac);x.fillStyle=sk;x.fillRect(-7,-12,14,24);
 x.fillStyle=HAIR[L.hr];x.beginPath();if(L.hs===0)x.ellipse(0,-40,34,42,0,0,7);else if(L.hs===1){x.ellipse(0,-50,32,30,0,0,7);x.rect(-34,-50,68,90)}else{x.arc(0,-50,32,0,7);x.arc(0,-92,16,0,7)}x.fill();
 x.fillStyle=sk;x.beginPath();x.ellipse(0,-44,26,31,0,0,7);x.fill();x.fillStyle=HAIR[L.hr];x.beginPath();x.ellipse(0,-70,28,12,0,0,7);x.fill();x.fillStyle='#2a1a1a';x.beginPath();x.arc(-10,-46,3,0,7);x.arc(10,-46,3,0,7);x.fill();x.strokeStyle='#c0305a';x.lineWidth=3;x.beginPath();x.arc(0,-34,8,.2,Math.PI-.2);x.stroke();x.fillStyle='rgba(255,120,140,.35)';x.beginPath();x.arc(-16,-36,5,0,7);x.arc(16,-36,5,0,7);x.fill();
 const A=ACC[L.a];if(A==='🕶️')emo(A,0,-46,40);else if(A==='👒')emo(A,0,-82,70);else if(A==='🎀')emo(A,22,-76,30);else if(A==='👜')emo(A,40,110,40);else if(A==='💍')emo('📿',0,8,30);else if(A==='🧣')emo(A,0,14,44);else if(A==='👑')emo(A,0,-88,40);x.restore()}
function lighting(X,Y,w,h){const l=L.l;if(l===1){x.fillStyle='rgba(255,170,60,.18)';x.fillRect(X,Y,w,h)}if(l===2){x.fillStyle='rgba(60,120,255,.18)';x.fillRect(X,Y,w,h)}if(l===3){const g=x.createRadialGradient(X+w/2,Y+h/2,40,X+w/2,Y+h/2,w*.6);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.65)');x.fillStyle=g;x.fillRect(X,Y,w,h)}if(l===4){const g=x.createLinearGradient(X,0,X+w,0);['#ff3a3a','#ffd24a','#3ac060','#3a8aff','#b06aff'].forEach((cc,i)=>g.addColorStop(i/4,cc));x.globalAlpha=.15;x.fillStyle=g;x.fillRect(X,Y,w,h);x.globalAlpha=1}}
function drawStudio(){x.fillStyle='#181820';x.fillRect(0,0,900,600);x.save();rr(20,60,500,520,10);x.clip();backdrop(20,60,500,520);model(270,230,1.15);lighting(20,60,500,520);x.restore();
 x.strokeStyle='#fff8';x.lineWidth=2;[[30,70],[510,70],[30,570],[510,570]].forEach(([a,b],i)=>{x.beginPath();x.moveTo(a,b+(i<2?20:-20));x.lineTo(a,b);x.lineTo(a+(i%2?-20:20),b);x.stroke()});
 T('📋 Brief: '+brief[0],20,40,18,'#ffd24a');T('📸 '+S.shots,470,40,16,'#fff');
 const tabs=['👗 Outfit','💁 Look','🕺 Pose','🖼️ Set'];tabs.forEach((n,i)=>button('tb'+i,540+(i%2)*170,60+Math.floor(i/2)*42,160,36,n,()=>{tab=i},{sel:tab===i,bg:'#2a2a3a',ac:'#ff8ac0',fs:15}));
 const opts=(arr,key,Y,lab,lk)=>{T(lab,540,Y,14,'#aaa','left','');arr.forEach((v,i)=>{const lock=DEMO&&lk&&i>=lk;button(key+i,540+(i%3)*112,Y+8+Math.floor(i/3)*40,106,34,(lock?'🔒':'')+v,()=>{if(lock)return window.demoEnd&&window.demoEnd('Unlock every outfit, backdrop and lighting set-up in the full version!');L[key]=i},{sel:L[key]===i,bg:'#2a2a3a',ac:'#ff8ac0',fs:12})})};
 if(tab===0){opts(OUT.map(o=>o[0]),'o',165,'Outfit',4);opts(ACC,'a',305,'Accessory',4)}
 else if(tab===1){T('Skin',540,165,14,'#aaa','left','');SKIN.forEach((s,i)=>{BTN['sk'+i]={x:540+i*66,y:173,w:58,h:40,fn:()=>{L.sk=i}};x.fillStyle=s;rr(540+i*66,173,58,40,10);x.fill();if(L.sk===i){x.strokeStyle='#ff8ac0';x.lineWidth=3;x.stroke()}});
  T('Hair colour',540,240,14,'#aaa','left','');HAIR.forEach((s,i)=>{BTN['hr'+i]={x:540+i*56,y:248,w:50,h:40,fn:()=>{L.hr=i}};x.fillStyle=s;rr(540+i*56,248,50,40,10);x.fill();if(L.hr===i){x.strokeStyle='#ff8ac0';x.lineWidth=3;x.stroke()}});opts(['Long','Bob','Bun'],'hs',315,'Hair style')}
 else if(tab===2)opts(POSE.map(p=>p[0]),'p',165,'Pose',3);
 else{opts(BD.map(b=>b[0]),'b',165,'Backdrop',3);opts(LT.map(l=>l[0]),'l',275,'Lighting',2)}
 button('snap',540,430,340,64,'📸 Snap!',snap,{bg:'#ff3a7a',ac:'#fff',fs:24});button('pf',540,504,165,40,'🖼️ Portfolio',()=>{G.state='pf'},{bg:'#2a2a3a',ac:'#ffd24a',fs:15});button('nb',715,504,165,40,'🔀 New brief',newBrief,{bg:'#2a2a3a',ac:'#ffd24a',fs:15});
 if(last&&flash<=0&&last.t===undefined){}if(last){T('Last shot: '+last.sc+'/100 '+(last.sc>=90?'— Cover-worthy! ⭐':last.sc>=70?'— Great!':'— Try matching the brief'),540,570,14,'#ffd24a','left','')}
 if(flash>0){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,900,600)}}
function drawPF(){x.fillStyle='#181820';x.fillRect(0,0,900,600);T('My Portfolio',450,50,32,'#ffd24a','center');T('Best score: '+S.best+'/100 · Photos taken: '+S.shots,450,78,15,'#aaa','center','');
 S.pf.forEach((p,i)=>{if(i>=18)return;const X=60+(i%6)*135,Y=100+Math.floor(i/6)*140;x.fillStyle='#fff';x.fillRect(X-6,Y-6,132,108);if(p.img){if(!p._i){p._i=new Image();p._i.src=p.img}if(p._i.complete)x.drawImage(p._i,X,Y,120,80)}T(p.sc+'/100',X+60,Y+96,12,'#333','center')});
 if(!S.pf.length)T('No photos yet — head to the studio!',450,280,20,'#fff','center','');button('back',350,530,200,48,'📸 Studio',()=>{G.state='studio'},{bg:'#ff3a7a',ac:'#fff'})}
function drawTitle(){const tt=Math.max(0,t);L.p=Math.floor(tt/2)%6;L.o=Math.floor(tt/2.5)%8;L.b=Math.floor(tt/3)%6;x.save();backdrop(0,0,900,600);model(300,200,1.3);lighting(0,0,900,600);x.restore();x.fillStyle='rgba(0,0,0,.45)';rr(470,150,400,280,20);x.fill();
 T('Coffeebreak',670,210,26,'#ffd24a','center');T('Model',670,280,64,'#fff','center');T('Photoshoot',670,340,48,'#ff8ac0','center');button('go',570,370,200,48,'📸 Start the shoot',()=>{Object.assign(L,{sk:1,hr:0,hs:0,o:0,a:0,p:0,b:0,l:0});newBrief();G.state='studio'},{bg:'#ff3a7a',ac:'#fff'})}
bindInput({});function update(dt){flash=Math.max(0,flash-dt*3)}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')drawTitle();else if(G.state==='studio')drawStudio();else drawPF()}
window.MP={G,S,L,snap,newBrief,set tab(v){tab=v}};startLoop();
