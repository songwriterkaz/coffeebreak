(()=>{
const W=960,H=600,cv=document.getElementById('c'),x=cv.getContext('2d');
let sc=1;function fit(){sc=Math.min(innerWidth/W,innerHeight/H);cv.width=W*devicePixelRatio*sc;cv.height=H*devicePixelRatio*sc;cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';cv.style.marginTop=Math.max(0,(innerHeight-H*sc)/2)+'px';}
addEventListener('resize',fit);fit();
const logo=new Image();logo.src='logo.jpg';
const DEMO=!!window.CB_DEMO,MAXL=DEMO?3:15,STORE='https://coffeebreaks.itch.io/';
const COLORS=[['Ruby','#e0284f',0],['Ocean','#2a6fe0',0],['Royal','#7b3fe0',0],['Mint','#2bc59a',40],['Sunset','#ff8a1f',40],['Pink Silk','#ff6fb5',60],['Midnight','#24304f',80],['Gold Crema','#e3b23c',120]];
const FINS=[['Veiltail',0],['Halfmoon',0],['Crowntail',50],['Plakat',50],['Double Tail',90],['Rosetail',150]];
const DECOR=[['Coffee Cup Cave',30],['Bean Plant',30],['Latte Castle',70],['Moon Rock',50],['Sugar Coral',60]];
let S={color:0,fin:0,coins:0,hi:0,best:0,owned:{c:[0,1,2],f:[0,1],d:[]},spd:1,pow:1,sta:1,hunger:3};
try{Object.assign(S,JSON.parse(localStorage.getItem('cbBetta')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('cbBetta',JSON.stringify(S))}catch(e){}};
// audio
let ac;function snd(f,d=.12,t='sine',v=.08,f2){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=t;o.frequency.value=f;if(f2)o.frequency.exponentialRampToValueAtTime(f2,ac.currentTime+d);g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
// input
const K={};addEventListener('keydown',e=>{K[e.key.toLowerCase()]=1;if(e.key===' ')e.preventDefault();keyPress(e.key.toLowerCase())});addEventListener('keyup',e=>K[e.key.toLowerCase()]=0);
let ptr=null,btns=[];
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/sc,y:(e.clientY-r.top)/sc}}
cv.addEventListener('pointerdown',e=>{const p=pos(e);for(const b of btns)if(p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h){b.f();snd(660,.06,'triangle');return}if(st==='battle'){ptr=p;ptr.id=e.pointerId}});
cv.addEventListener('pointermove',e=>{if(ptr&&ptr.id===e.pointerId){const p=pos(e);ptr.x=p.x;ptr.y=p.y}});
const up=e=>{if(ptr&&ptr.id===e.pointerId)ptr=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
function btn(l,X,Y,w,h,f,col='#c8794a',dis){btns.push({x:X,y:Y,w,h,f:dis?()=>{}:f});x.fillStyle=dis?'#6b5a50':col;rr(X,Y,w,h,14);x.fill();x.fillStyle='#fff8ee';x.font='bold '+Math.min(22,h*.45)+'px Trebuchet MS';x.textAlign='center';x.textBaseline='middle';x.fillText(l,X+w/2,Y+h/2+1)}
function rr(X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function txt(t,X,Y,s=24,c='#fff8ee',a='center'){x.font='bold '+s+'px Trebuchet MS';x.textAlign=a;x.textBaseline='middle';x.lineWidth=5;x.strokeStyle='rgba(40,20,10,.7)';x.strokeText(t,X,Y);x.fillStyle=c;x.fillText(t,X,Y)}
// fish drawing
function fish(X,Y,ang,col,fin,t,size=1,tired=0,face=1,flare=0){x.save();x.translate(X,Y);x.rotate(ang);if(Math.cos(ang)<0){x.scale(1,-1)}x.scale(size,size);
 const w=Math.sin(t*8)*.25,fl=1+flare*.5;x.fillStyle=col;x.globalAlpha=.85;
 // tail
 x.beginPath();x.moveTo(-18,0);const tl=[46,40,52,30,44,58][fin]*fl;
 if(fin===2){for(let i=-4;i<=4;i++){x.lineTo(-18-tl*Math.cos(i*.22+w),tl*Math.sin(i*.22+w)*1.1);x.lineTo(-22-tl*.7*Math.cos(i*.22+w+.1),tl*.7*Math.sin(i*.22+w+.1))}}
 else if(fin===4){x.quadraticCurveTo(-60,-50+w*30,-18-tl,-14);x.lineTo(-30,0);x.lineTo(-18-tl,14);x.quadraticCurveTo(-60,50+w*30,-18,0)}
 else{const sp=fin===1||fin===5?1.3:fin===3?.6:.9;x.quadraticCurveTo(-30-tl*.5,-tl*sp+w*20,-18-tl,-tl*sp*.5+w*20);x.quadraticCurveTo(-18-tl*1.1,w*25,-18-tl,tl*sp*.5+w*20);x.quadraticCurveTo(-30-tl*.5,tl*sp+w*20,-18,0)}
 x.fill();
 // dorsal + anal fins
 x.beginPath();x.moveTo(-14,-10);x.quadraticCurveTo(-10,-30*fl+w*8,10,-12);x.fill();x.beginPath();x.moveTo(-16,8);x.quadraticCurveTo(-10,(fin===3?22:34)*fl+w*8,14,10);x.fill();
 x.globalAlpha=1;
 // body
 const g=x.createLinearGradient(0,-14,0,14);g.addColorStop(0,col);g.addColorStop(1,shade(col,.55));x.fillStyle=g;x.beginPath();x.ellipse(2,0,26,13,0,0,7);x.fill();
 // flare gills
 if(flare){x.fillStyle='#ffd23f';x.beginPath();x.ellipse(14,0,6,18,0,0,7);x.fill()}
 x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(4,-5,14,4,0,0,7);x.fill();
 // pectoral
 x.fillStyle=shade(col,1.3);x.beginPath();x.ellipse(8,6,7,4,.6+w,0,7);x.fill();
 // eye
 x.fillStyle='#fff';x.beginPath();x.arc(17,-3,5,0,7);x.fill();x.fillStyle='#222';
 if(tired){x.strokeStyle='#222';x.lineWidth=2;x.beginPath();x.arc(17,-3,3,.2,Math.PI-.2);x.stroke()}else{x.beginPath();x.arc(18.5,-3,2.6,0,7);x.fill()}
 x.strokeStyle='#5a1a2a';x.lineWidth=1.5;x.beginPath();x.arc(24,4,3,.3,2.2);x.stroke();
 x.restore()}
function shade(h,f){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.min(255,r*f)|0;g=Math.min(255,g*f)|0;b=Math.min(255,b*f)|0;return'rgb('+r+','+g+','+b+')'}
// background
const bub=[...Array(30)].map(()=>({x:Math.random()*W,y:Math.random()*H,r:2+Math.random()*5,s:20+Math.random()*40}));
function tank(t,dark){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dark?'#1b4a6b':'#5cc3d8');g.addColorStop(1,dark?'#0b2238':'#1f7a99');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<5;i++){x.beginPath();x.moveTo(i*220+Math.sin(t*.5+i)*30,0);x.lineTo(i*220+80,0);x.lineTo(i*220-60,H);x.lineTo(i*220-120,H);x.fill()}
 x.fillStyle='#d9b07a';x.beginPath();x.moveTo(0,H);for(let i=0;i<=W;i+=40)x.lineTo(i,H-30-Math.sin(i*.02)*10);x.lineTo(W,H);x.fill();
 for(let i=0;i<9;i++){const px=40+i*112;x.strokeStyle='#2f8f4e';x.lineWidth=6;x.beginPath();x.moveTo(px,H-30);x.quadraticCurveTo(px+Math.sin(t+i)*20,H-90,px+Math.sin(t*1.3+i)*14,H-130-(i%3)*30);x.stroke()}
 S.owned.d.forEach((d,i)=>decor(d,120+i*170,H-40));
 x.fillStyle='rgba(255,255,255,.5)';bub.forEach(b=>{b.y-=b.s/60;if(b.y<-10){b.y=H+10;b.x=Math.random()*W}x.beginPath();x.arc(b.x+Math.sin(t*2+b.r)*4,b.y,b.r,0,7);x.fill()})}
function decor(d,X,Y){x.save();x.translate(X,Y);
 if(d===0){x.fillStyle='#fff3e0';x.beginPath();x.moveTo(-40,-60);x.lineTo(40,-60);x.lineTo(30,0);x.lineTo(-30,0);x.fill();x.strokeStyle='#fff3e0';x.lineWidth=8;x.beginPath();x.arc(42,-32,16,-1.4,1.4);x.stroke();x.fillStyle='#6b3a1e';x.beginPath();x.ellipse(0,-60,40,8,0,0,7);x.fill();x.fillStyle='#1b2a3a';x.beginPath();x.arc(0,0,16,Math.PI,0);x.fill()}
 if(d===1){x.fillStyle='#2f8f4e';for(let i=0;i<5;i++){x.beginPath();x.ellipse(Math.sin(i)*15,-20-i*16,10,16,i,0,7);x.fill()}x.fillStyle='#5a2e14';for(let i=0;i<4;i++){x.beginPath();x.ellipse(-12+i*8,-30-i*14,6,9,.3,0,7);x.fill()}}
 if(d===2){x.fillStyle='#e8c9a0';x.fillRect(-40,-70,80,70);x.fillRect(-50,-90,20,90);x.fillRect(30,-90,20,90);x.fillStyle='#6b3a1e';x.beginPath();x.arc(0,0,16,Math.PI,0);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(0,-45,10,0,7);x.fill()}
 if(d===3){x.fillStyle='#9aa0b8';x.beginPath();x.ellipse(0,-20,45,26,0,0,7);x.fill();x.fillStyle='#fff6c8';x.beginPath();x.arc(10,-28,10,0,7);x.fill();x.fillStyle='#9aa0b8';x.beginPath();x.arc(15,-31,9,0,7);x.fill()}
 if(d===4){x.fillStyle='#ff9ec7';for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(i*14,-30-Math.abs(i)*-6,7,30-Math.abs(i)*6,i*.3,0,7);x.fill()}}
 x.restore()}
// state
let st='title',T=0,msg='',msgT=0;
let P,E=[],items=[],fx=[],lvl=1,score=0,lvlCoins=0,feedT=0,food=[],trainGame=null,shopTab=0,endT=0;
function say(m){msg=m;msgT=2.2}
function keyPress(k){if(k==='enter'){if(st==='title')st='tank';else if(st==='win')next();else if(st==='lose')st='tank'}
 if(st==='battle'){if(k===' '||k==='j')dash();if(k==='f'||k==='k')flare();if(k==='p'||k==='escape')st='pause';}else if(st==='pause'&&(k==='p'||k==='escape'))st='battle';
 if(st==='train'&&trainGame&&k===' ')trainHit()}
function startBattle(l){lvl=l;st='battle';lvlCoins=0;items=[];fx=[];
 P={x:150,y:H/2,vx:0,vy:0,a:0,en:100+S.sta*15,max:100+S.sta*15,dashT:0,dashCd:0,flCd:0,flT:0,inv:0,boost:0,shield:0};
 P.en=P.max;E=[];const boss=l%5===0,n=boss?1:Math.min(1+Math.ceil(l/2),6);
 for(let i=0;i<n;i++){const b=boss;E.push({x:W-120-Math.random()*200,y:80+Math.random()*(H-200),vx:0,vy:0,a:Math.PI,boss:b,size:b?1.9+l/15:.85+Math.random()*.2,en:b?140+l*30:40+l*8,max:b?140+l*30:40+l*8,col:b?['#3a2a5a','#8a1f2f','#111'][l/5-1|0]:COLORS[(Math.random()*COLORS.length)|0][1],fin:(Math.random()*6)|0,spd:(b?1.4:1.6)+l*.08,cd:1+Math.random()*2,tired:0,flT:0,name:b?['Big Mocha','Captain Ristretto','The Night Brew'][l/5-1|0]:''})}
 if(boss)say('Boss: '+E[0].name);else say('Level '+l);snd(440,.3,'triangle',.1,880)}
function dash(){if(P.dashCd>0)return;P.dashT=.25;P.dashCd=.8;const s=11+S.spd;P.vx=Math.cos(P.a)*s;P.vy=Math.sin(P.a)*s;snd(300,.15,'sawtooth',.05,900)}
function flare(){if(P.flCd>0)return;P.flCd=2.2;P.flT=.5;fx.push({x:P.x,y:P.y,r:10,t:0,ring:1});snd(200,.4,'square',.05,120);
 E.forEach(e=>{if(e.tired)return;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<150){hitE(e,12+S.pow*5);e.vx+=(e.x-P.x)/d*9;e.vy+=(e.y-P.y)/d*9}})}
function hitE(e,dm){e.en-=dm;score+=dm|0;fx.push({x:e.x,y:e.y-20,t:0,txt:'-'+(dm|0)});snd(520,.08,'triangle',.07);if(e.en<=0&&!e.tired){e.tired=1;score+=e.boss?500:100;say(e.boss?e.name+' is sleepy':'Rival is tired out');
 const nb=e.boss?12:3;for(let i=0;i<nb;i++)items.push({x:e.x+Math.random()*60-30,y:e.y+Math.random()*60-30,k:'bean',vy:-1,t:0});if(Math.random()<.5||e.boss)items.push({x:e.x,y:e.y,k:['heal','speed','shield'][(Math.random()*3)|0],t:0})}}
function upd(dt){T+=dt;if(msgT>0)msgT-=dt;fx=fx.filter(f=>(f.t+=dt)<.8);
 if(st==='battle'){let ax=0,ay=0;if(K.arrowleft||K.a)ax--;if(K.arrowright||K.d)ax++;if(K.arrowup||K.w)ay--;if(K.arrowdown||K.s)ay++;
  if(ptr){const dx=ptr.x-P.x,dy=ptr.y-P.y,d=Math.hypot(dx,dy);if(d>12){ax=dx/d;ay=dy/d}}
  const acc=(.55+S.spd*.08)*(P.boost>0?1.6:1);P.vx+=ax*acc;P.vy+=ay*acc;const fr=P.dashT>0?.97:.9;P.vx*=fr;P.vy*=fr;P.x+=P.vx;P.y+=P.vy;
  if(Math.hypot(P.vx,P.vy)>.4)P.a=Math.atan2(P.vy,P.vx);P.x=Math.max(30,Math.min(W-30,P.x));P.y=Math.max(70,Math.min(H-50,P.y));
  ['dashT','dashCd','flCd','flT','inv','boost','shield'].forEach(k=>P[k]=Math.max(0,P[k]-dt));
  E.forEach(e=>{if(e.tired){e.x+=3;e.y-=.6;e.a=0;return}const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1;e.cd-=dt;e.flT=Math.max(0,e.flT-dt);
   let tx=dx/d,ty=dy/d;if(d<90&&e.cd>.6){tx=-ty;ty=dx/d}e.vx+=tx*e.spd*.12;e.vy+=ty*e.spd*.12;
   if(e.cd<=0){e.cd=(e.boss?1.4:2.4)-lvl*.05;if(d<250){e.vx=tx*(8+lvl*.3);e.vy=ty*(8+lvl*.3);e.flT=.3;snd(250,.12,'sawtooth',.03,600)}}
   E.forEach(o=>{if(o!==e&&!o.tired){const q=Math.hypot(o.x-e.x,o.y-e.y);if(q<50&&q>0){e.vx-=(o.x-e.x)/q*.3;e.vy-=(o.y-e.y)/q*.3}}});
   e.vx*=.94;e.vy*=.94;e.x+=e.vx;e.y+=e.vy;e.x=Math.max(30,Math.min(W-30,e.x));e.y=Math.max(70,Math.min(H-50,e.y));if(Math.hypot(e.vx,e.vy)>.3)e.a=Math.atan2(e.vy,e.vx);
   if(d<34*e.size){if(P.dashT>0){hitE(e,(16+S.pow*6)*(e.boss?.8:1));e.vx+=P.vx*.8;e.vy+=P.vy*.8;P.vx*=-.4;P.vy*=-.4;P.dashT=0}
    else if(P.inv<=0&&e.flT>0||P.inv<=0&&d<24*e.size){if(P.shield>0){say('Bubble shield');P.shield=0}else{P.en-=(e.boss?14:8)+lvl*.6;fx.push({x:P.x,y:P.y-20,t:0,txt:'puff'});snd(160,.2,'triangle',.08,90)}P.inv=.9;P.vx-=tx*7;P.vy-=ty*7}}});
  E=E.filter(e=>e.x<W+120);
  items.forEach(i=>{i.t+=dt;i.y+=Math.sin(i.t*3)*.3-(i.k==='bean'?-.2:.3);if(i.y<80)i.y=80;if(i.y>H-50)i.y=H-50;if(Math.hypot(i.x-P.x,i.y-P.y)<38){i.got=1;
   if(i.k==='bean'){lvlCoins++;snd(990,.08,'sine',.06)}else{snd(700,.3,'sine',.08,1400);if(i.k==='heal'){P.en=Math.min(P.max,P.en+35);say('Latte bubble: energy up')}if(i.k==='speed'){P.boost=5;say('Espresso bubble: speed up')}if(i.k==='shield'){P.shield=8;say('Bubble shield on')}}}});
  items=items.filter(i=>!i.got&&i.t<14);
  if(Math.random()<dt*.15)items.push({x:100+Math.random()*(W-200),y:H-60,k:['heal','speed','shield'][(Math.random()*3)|0],t:0});
  if(P.en<=0){st='lose';finish(false)}else if(!E.length){st='win';finish(true)}}}
function finish(w){S.coins+=lvlCoins+(w?10+lvl*2:0);if(score>S.hi)S.hi=score;if(w&&lvl>=S.best)S.best=lvl;S.hunger=Math.max(0,S.hunger-1);save();snd(w?660:220,.5,'triangle',.1,w?1320:110)}
function next(){if(lvl>=MAXL){st=DEMO?'demoend':'champ';return}if(DEMO&&lvl>=3){st='demoend';return}startBattle(lvl+1)}
// training minigame
function trainHit(){const g=trainGame;if(!g||g.done)return;const ok=Math.abs(g.p-.5)<.12;g.hits+=ok;g.n++;snd(ok?880:200,.12);if(g.n>=5){g.done=1;if(g.hits>=3){S[g.stat]++;say('Training done: '+{spd:'Speed',pow:'Power',sta:'Stamina'}[g.stat]+' up');}else say('Nearly, try again');S.hunger=Math.max(0,S.hunger-1);save();setTimeout(()=>{st='tank';trainGame=null},900)}}
// draw
function hud(){x.fillStyle='rgba(40,20,10,.55)';x.fillRect(0,0,W,56);txt('Level '+lvl+(DEMO?' (demo)':''),20,28,22,'#fff','left');
 bar(200,18,220,20,P.en/P.max,'#ffd23f','Energy');txt('Beans '+(S.coins+lvlCoins),470,28,22,'#ffd9a8','left');txt('Score '+score,640,28,22,'#fff','left');txt('Best '+S.hi,820,28,18,'#cde','left');
 if(P.boost>0)txt('Speed',W-60,80,16,'#ff9');if(P.shield>0)txt('Shield',W-60,100,16,'#9ef')}
function bar(X,Y,w,h,f,c,l){x.fillStyle='#3a2215';rr(X,Y,w,h,8);x.fill();x.fillStyle=c;rr(X,Y,Math.max(8,w*Math.max(0,f)),h,8);x.fill();if(l)txt(l,X+w/2,Y+h/2,13,'#3a2215')}
function panel(X,Y,w,h){x.fillStyle='rgba(255,244,230,.93)';rr(X,Y,w,h,24);x.fill();x.strokeStyle='#6b3a1e';x.lineWidth=4;x.stroke()}
function logoDraw(X,Y,s){if(logo.complete&&logo.naturalWidth){x.save();x.beginPath();x.arc(X,Y,s/2,0,7);x.clip();x.drawImage(logo,X-s/2,Y-s/2,s,s);x.restore();x.strokeStyle='#fff3e0';x.lineWidth=5;x.beginPath();x.arc(X,Y,s/2,0,7);x.stroke()}}
function draw(){x.setTransform(devicePixelRatio*sc,0,0,devicePixelRatio*sc,0,0);btns=[];
 const pc=COLORS[S.color][1];
 if(st==='title'){tank(T);logoDraw(W/2,140,170);txt('Coffeebreak',W/2,260,40,'#ffe1b8');txt('Betta Battle',W/2,312,64,'#fff');
  fish(W/2-200+Math.sin(T)*30,420,Math.sin(T)*.2,pc,S.fin,T,1.6);fish(W/2+200-Math.sin(T)*30,420,Math.PI-Math.sin(T)*.2,'#2a6fe0',2,T+1,1.6);
  btn('Play',W/2-90,470,180,64,()=>st='tank');txt('Best score '+S.hi+'   Best level '+S.best+(DEMO?'   Demo: levels 1 to 3':''),W/2,565,18,'#fff');return}
 if(st==='tank'||st==='feed'){tank(T);txt('Coffeebreak Cafe Aquarium',W/2,36,30);logoDraw(50,40,60);
  const fx2=W/2+Math.sin(T*.6)*220,fy=270+Math.sin(T*1.1)*40;let ang=Math.cos(T*.6)>0?0:Math.PI;
  if(st==='feed'&&food.length){const f=food[0];ang=Math.atan2(f.y-fy,f.x-fx2)}
  fish(fx2,fy,ang,pc,S.fin,T,1.8);
  if(st==='feed'){food.forEach(f=>{f.y+=1;x.fillStyle='#6b3a1e';x.beginPath();x.ellipse(f.x,f.y,6,4,0,0,7);x.fill()});food=food.filter(f=>{if(Math.hypot(f.x-fx2,f.y-fy)<45||f.y>H-30){snd(880,.06);if(f.y<=H-30){S.hunger=Math.min(5,S.hunger+.25)}return false}return true});if(!food.length&&T>feedT){st='tank';save()}}
  panel(20,70,260,150);txt(COLORS[S.color][0]+' '+FINS[S.fin][0],150,95,18,'#6b3a1e');
  [['Speed',S.spd],['Power',S.pow],['Stamina',S.sta]].forEach((s,i)=>txt(s[0]+' '+s[1],150,125+i*24,18,'#3a2215'));bar(40,195,220,16,S.hunger/5,'#7ad36b','Full');
  txt('Beans '+S.coins,W-120,100,24,'#ffd9a8');
  const by=H-95;btn('Feed',30,by,140,56,()=>{st='feed';feedT=T+4;for(let i=0;i<6;i++)food.push({x:W/2-120+Math.random()*240,y:70+Math.random()*30})});
  btn('Train',185,by,140,56,()=>st='trainpick');btn('Customise',340,by,170,56,()=>st='custom');btn('Shop',525,by,130,56,()=>{st='shop'});
  btn('Battle',670,by,260,56,()=>{if(S.hunger<1){say('Your betta is hungry, feed it first');return}st='levels'},'#d1495b');
  if(msgT>0)txt(msg,W/2,H-130,22,'#fff');return}
 if(st==='trainpick'){tank(T,1);panel(230,130,500,330);txt('Training',480,175,32,'#6b3a1e');txt('Press when the bean hits the middle',480,215,18,'#3a2215');
  [['Speed laps','spd'],['Power push','pow'],['Stamina swim','sta']].forEach((s,i)=>btn(s[0],330,250+i*62,300,50,()=>{if(S.hunger<1){say('Feed your betta first');st='tank';return}trainGame={stat:s[1],p:0,dir:1,n:0,hits:0};st='train'}));btn('Back',30,30,110,46,()=>st='tank');return}
 if(st==='train'){tank(T,1);const g=trainGame;g.p+=g.dir*(.012+g.n*.003);if(g.p>1||g.p<0)g.dir*=-1;
  fish(200+g.p*560,300,g.dir>0?0:Math.PI,pc,S.fin,T,1.4);panel(180,420,600,90);x.fillStyle='#7ad36b';x.fillRect(480-67,445,134,40);x.fillStyle='#6b3a1e';x.beginPath();x.ellipse(200+g.p*560,465,12,9,0,0,7);x.fill();
  txt('Hits '+g.hits+' of '+g.n+' (need 3 of 5)',480,90,24);btn('Tap',W-170,H-80,140,60,trainHit,'#d1495b');if(msgT>0)txt(msg,W/2,140,22);return}
 if(st==='custom'||st==='shop'){tank(T,1);panel(30,20,900,560);const cust=st==='custom';txt(cust?'Customise your betta':'Bean Shop',480,55,32,'#6b3a1e');txt('Beans '+S.coins,800,55,22,'#a0522d');
  fish(480,140,0,pc,S.fin,T,1.6);
  txt('Colours',140,215,20,'#3a2215');COLORS.forEach((c,i)=>{const own=S.owned.c.includes(i);btn(own?c[0]:c[0]+' '+c[2],60+(i%4)*210,235+(i/4|0)*52,195,44,()=>{if(own){S.color=i}else if(S.coins>=c[2]){S.coins-=c[2];S.owned.c.push(i);S.color=i;snd(1200,.2)}else say('Need more beans');save()},c[1],!cust&&own&&false)});
  txt('Fins',120,355,20,'#3a2215');FINS.forEach((f,i)=>{const own=S.owned.f.includes(i);btn(own?f[0]:f[0]+' '+f[1],60+(i%3)*280,375+(i/3|0)*52,265,44,()=>{if(own){S.fin=i}else if(S.coins>=f[1]){S.coins-=f[1];S.owned.f.push(i);S.fin=i;snd(1200,.2)}else say('Need more beans');save()},S.fin===i?'#6b3a1e':'#c8794a')});
  txt('Tank decor',140,490,20,'#3a2215');DECOR.forEach((d,i)=>{const own=S.owned.d.includes(i);btn(own?d[0]+' (in tank)':d[0]+' '+d[1],60+i*170,510,160,44,()=>{if(!own&&S.coins>=d[1]){S.coins-=d[1];S.owned.d.push(i);snd(1200,.2);save()}else if(!own)say('Need more beans')},'#4a8f9e',own)});
  btn('Done',40,30,110,46,()=>st='tank');if(msgT>0)txt(msg,480,190,20,'#d1495b');return}
 if(st==='levels'){tank(T,1);panel(130,60,700,480);txt('Choose a battle',480,105,32,'#6b3a1e');const top=Math.min(MAXL,S.best+1);
  for(let i=1;i<=15;i++){const lock=i>top||(DEMO&&i>3);btn(i%5===0?'Boss '+i:'Level '+i,170+((i-1)%5)*126,150+((i-1)/5|0)*90,116,70,()=>{score=0;startBattle(i)},i%5===0?'#8a3fb0':'#c8794a',lock)}
  if(DEMO)btn('Unlock the full game',290,440,380,56,()=>open(STORE,'_blank'),'#d1495b');btn('Back',30,30,110,46,()=>st='tank');return}
 if(['battle','pause','win','lose','demoend','champ'].includes(st)){tank(T,lvl%5===0);
  items.forEach(i=>{x.save();x.translate(i.x,i.y);if(i.k==='bean'){x.fillStyle='#6b3a1e';x.rotate(.5);x.beginPath();x.ellipse(0,0,9,6,0,0,7);x.fill();x.strokeStyle='#d9a066';x.lineWidth=2;x.beginPath();x.moveTo(-6,0);x.quadraticCurveTo(0,3,6,0);x.stroke()}
   else{x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(0,0,18,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();txt({heal:'L',speed:'E',shield:'S'}[i.k],0,1,16,{heal:'#ffe1b8',speed:'#ff9',shield:'#9ef'}[i.k])}x.restore()});
  E.forEach(e=>{fish(e.x,e.y,e.a,e.col,e.fin,T+e.x*.01,e.size,e.tired,1,e.flT>0?1:0);if(!e.tired){bar(e.x-30*e.size,e.y-30*e.size-14,60*e.size,8,e.en/e.max,'#ff7a9a')}else txt('zzz',e.x+20,e.y-30,16)});
  if(!(P.inv>0&&(T*20|0)%2))fish(P.x,P.y,P.a,pc,S.fin,T,1.1,P.en<=0,1,P.flT>0?1:0);if(P.shield>0){x.strokeStyle='rgba(160,230,255,.8)';x.lineWidth=3;x.beginPath();x.arc(P.x,P.y,40,0,7);x.stroke()}
  fx.forEach(f=>{if(f.ring){x.strokeStyle='rgba(255,210,63,'+(1-f.t/.8)+')';x.lineWidth=6;x.beginPath();x.arc(f.x,f.y,20+f.t*170,0,7);x.stroke()}else txt(f.txt,f.x,f.y-f.t*40,18,'#fff')});
  hud();
  btn('Dash',W-250,H-90,110,70,dash,P.dashCd>0?'#7a5a48':'#d1495b');btn('Flare',W-130,H-90,110,70,flare,P.flCd>0?'#7a5a48':'#e3a03c');btn('II',20,H-70,56,50,()=>st=st==='pause'?'battle':'pause','#6b3a1e');
  if(msgT>0&&st==='battle')txt(msg,W/2,110,28);
  if(st==='pause'){panel(330,200,300,180);txt('Paused',480,250,32,'#6b3a1e');btn('Resume',380,290,200,50,()=>st='battle');btn('Aquarium',380,345,200,30,()=>st='tank','#6b3a1e')}
  if(st==='win'){panel(260,150,440,300);txt(lvl%5===0?'Boss tired out':'Level cleared',480,200,34,'#6b3a1e');txt('Beans collected '+lvlCoins+' plus bonus '+(10+lvl*2),480,250,20,'#3a2215');txt('Score '+score,480,285,22,'#3a2215');
   btn(lvl>=MAXL||DEMO&&lvl>=3?'Continue':'Next level',300,330,170,56,next);btn('Aquarium',490,330,170,56,()=>st='tank','#6b3a1e')}
  if(st==='lose'){panel(260,150,440,300);txt('Your betta is tired',480,205,32,'#6b3a1e');txt('It swam home for a rest and a snack',480,250,18,'#3a2215');txt('Score '+score+'   Beans '+lvlCoins,480,285,20,'#3a2215');btn('Retry',300,330,170,56,()=>{score=0;startBattle(lvl)});btn('Aquarium',490,330,170,56,()=>st='tank','#6b3a1e')}
  if(st==='demoend'){panel(200,120,560,360);logoDraw(480,190,90);txt('Thanks for playing the demo',480,265,28,'#6b3a1e');txt('12 more levels, 2 more bosses and the full shop wait',480,305,18,'#3a2215');btn('Unlock the full game',290,345,380,60,()=>open(STORE,'_blank'),'#d1495b');btn('Aquarium',390,420,180,44,()=>st='tank','#6b3a1e')}
  if(st==='champ'){panel(200,120,560,360);logoDraw(480,190,90);txt('Coffeebreak Champion',480,265,32,'#6b3a1e');txt('All 15 levels cleared   Score '+score,480,310,20,'#3a2215');btn('Aquarium',390,370,180,56,()=>st='tank')}}
}
let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;if(st!=='pause')upd(dt);else T+=0;draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.CBG={get st(){return st},set st(v){st=v},S,startBattle,dash,flare,get P(){return P},get E(){return E}};
})();
