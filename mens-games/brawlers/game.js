const R=[{n:'Karen',hair:'#f5d76e',body:'#e0407b',sp:'Espresso Shot',t:'proj'},{n:'Barista',hair:'#3b2416',body:'#7a4a2a',sp:'Steam Rush',t:'dash'},
{n:'Director',hair:'#222',body:'#333a55',sp:'Action Cut',t:'upper'},{n:'Stylist',hair:'#b04cff',body:'#ff8fc0',sp:'Hairspray Haze',t:'stun'},
{n:'DJ',hair:'#0cf',body:'#1d1d1d',sp:'Bass Drop',t:'quake'},{n:'Tattoo Artist',hair:'#c22',body:'#2f6b3a',sp:'Ink Whip',t:'whip'}];
const BT=[['◀',40],['▶',100],['PUNCH',170],['KICK',240],['BLOCK',305],['SPECIAL',368]];let s,pick=0;
function F(c,x,dir,ai){return{c,x,dir,hp:100,meter:0,act:null,at:0,cd:0,stun:0,ai,vx:0,hist:[],tk:0}}
const G={title:'Coffeebreak Brawlers',how:'1v1 fighting. Pick a fighter, win 2 rounds. Keys: A/D move, J punch, K kick, L block, U special',
start(l){s={l,phase:'select',p:null,e:null,rw:0,ew:0,round:1,time:45,msg:'',mt:0,fx:[]}},
begin(){const pc=R[pick],others=R.filter((_,i)=>i!==pick),ec=others[(s.l-1)%others.length];s.p=F(pc,110,1,false);s.e=F(ec,290,-1,true);s.time=45;s.fx=[];s.phase='fight';s.msg='Round '+s.round+': '+pc.n+' vs '+ec.n;s.mt=1.5},
atk(f,o,k){if(f.at>0||f.stun>0||f.cd>0)return;const T={PUNCH:[.22,7,60],KICK:[.35,11,78],SPECIAL:[.5,22,0]}[k];if(!T)return;
 if(k==='SPECIAL'){if(f.meter<100)return;f.meter=0;f.act='SPECIAL';f.at=.5;const t=f.c.t;
  if(t==='proj')s.fx.push({x:f.x+f.dir*30,dir:f.dir,o,f,dmg:22});else{const r={dash:200,upper:70,stun:120,quake:400,whip:170}[t];if(t==='dash')f.x+=f.dir*90;
   if(Math.abs(o.x-f.x)<r)G.hurt(o,f,t==='stun'?10:22,t==='stun'||t==='quake'?1.2:0)}
  s.msg=f.c.sp;s.mt=1;return}
 f.act=k;f.at=T[0];f.cd=T[0]+.08;f.hist.push(k);f.hist=f.hist.slice(-3);let dmg=T[1];
 if(f.hist.join()==='PUNCH,PUNCH,KICK'){dmg*=2;f.hist=[];if(!f.ai){s.msg='COMBO';s.mt=.7}}
 if(Math.abs(o.x-f.x)<T[2]+10)G.hurt(o,f,dmg,0)},
hurt(o,f,dmg,st){if(o.act==='BLOCK'&&o.at>0&&!st){dmg*=.2}o.hp-=dmg;o.stun=Math.max(o.stun,st||.18);o.x+=f.dir*12;f.meter=Math.min(100,f.meter+dmg*2.2);o.meter=Math.min(100,o.meter+dmg)},
cmd(k){const p=s.p;if(k==='BLOCK'){p.act='BLOCK';p.at=.5}else G.atk(p,s.e,k)},
down(p){if(s.phase==='select'){R.forEach((c,i)=>{if(CB.hit(p,105+(i%2)*190,190+Math.floor(i/2)*110,170,95)){pick=i;G.begin()}});return}
 BT.forEach(([n,x])=>{if(CB.hit(p,x,595,62,60)){if(n==='◀')s.p.vx=-1;else if(n==='▶')s.p.vx=1;else G.cmd(n)}})},
up(){if(s.p)s.p.vx=0},
key(k){if(s.phase==='select'){const i='123456'.indexOf(k);if(i>=0){pick=i;G.begin()}else if(k===' '){G.begin()}return}
 k=k.toLowerCase();if(k==='a'||k==='arrowleft')s.p.vx=-1;if(k==='d'||k==='arrowright')s.p.vx=1;const m={j:'PUNCH',k:'KICK',l:'BLOCK',u:'SPECIAL'}[k];if(m)G.cmd(m)},
keyup(k){k=k.toLowerCase();if(['a','d','arrowleft','arrowright'].includes(k)&&s.p)s.p.vx=0},
update(dt){if(s.phase!=='fight')return;s.mt-=dt;if(s.mt>1)return;s.time-=dt;const p=s.p,e=s.e;
 [p,e].forEach(f=>{f.at-=dt;f.cd-=dt;f.stun-=dt;if(f.at<=0&&f.act!=='BLOCK')f.act=null;if(f.at<=0)f.act=null});
 if(p.stun<=0)p.x+=p.vx*160*dt;
 if(e.stun<=0){e.tk-=dt;const d=Math.abs(p.x-e.x),ag=.55+s.l*.08;if(e.tk<=0){e.tk=Math.max(.25,.7-s.l*.05);
   if(p.at>0&&p.act!=='BLOCK'&&Math.random()<.25+s.l*.05){e.act='BLOCK';e.at=.45}else if(e.meter>=100&&d<200)G.atk(e,p,'SPECIAL');else if(d<85&&Math.random()<ag)G.atk(e,p,Math.random()<.5?'PUNCH':'KICK')}
  if(d>70&&!e.at)e.x+=-90*dt*(e.x>p.x?1:-1)}
 [p,e].forEach(f=>f.x=Math.max(30,Math.min(370,f.x)));if(Math.abs(p.x-e.x)<40){const m=(p.x+e.x)/2;p.x=m-20*(p.x<e.x?1:-1);e.x=m+20*(p.x<e.x?1:-1)}
 p.dir=p.x<e.x?1:-1;e.dir=-p.dir;
 s.fx.forEach(b=>{b.x+=b.dir*300*dt;if(!b.done&&Math.abs(b.x-b.o.x)<25){b.done=1;G.hurt(b.o,b.f,b.dmg,.4)}});s.fx=s.fx.filter(b=>!b.done&&b.x>0&&b.x<400);
 if(p.hp<=0||e.hp<=0||s.time<=0){const pw=e.hp<=0||(s.time<=0&&p.hp>e.hp);pw?s.rw++:s.ew++;
  if(s.rw>=2)return CB.win(p.c.n+' beats '+e.c.n);if(s.ew>=2)return CB.lose(e.c.n+' wins the match');s.round++;const pc=pick;G.begin();s.msg=(pw?'You took':'Lost')+' round '+(s.round-1);s.mt=1.5}},
drawF(g,f){const x=f.x,y=470,d=f.dir;g.save();if(f.stun>0.3){g.globalAlpha=.7}
 g.fillStyle='#222';g.fillRect(x-14,y-40,10,40);g.fillRect(x+4,y-40,10,40);if(f.act==='KICK'){g.save();g.translate(x,y-40);g.rotate(-d*1.3);g.fillRect(-5,0,11,50);g.restore()}
 g.fillStyle=f.c.body;g.fillRect(x-20,y-110,40,72);g.fillStyle='#f2c49b';g.beginPath();g.arc(x,y-128,20,0,7);g.fill();
 g.fillStyle=f.c.hair;g.beginPath();g.arc(x,y-136,21,Math.PI,0);g.fill();if(f.c.n==='Karen'){g.fillRect(x-21,y-136,9,36);g.fillRect(x+12,y-136,9,36)}
 g.fillStyle='#000';g.fillRect(x+d*8-2,y-132,4,4);g.fillStyle='#f2c49b';const ext=f.act==='PUNCH'?55:f.act==='SPECIAL'?45:f.act==='BLOCK'?14:22;
 g.fillRect(d>0?x:x-ext,y-100,ext,10);g.fillStyle='#e0407b';g.beginPath();g.arc(x+d*ext,y-95,8,0,7);g.fill();
 if(f.act==='BLOCK'){g.strokeStyle='#8cf';g.lineWidth=4;g.beginPath();g.arc(x+d*18,y-90,30,-1.2,1.2);g.stroke();g.lineWidth=1}
 if(f.stun>.3)CB.text('★ ★',x,y-160,14,'#ff0');g.restore()},
draw(g){g.fillStyle='#2a1030';g.fillRect(0,0,400,640);
 if(s.phase==='select'){CB.text('Pick your fighter',200,110,24,'#ff8fc0');R.forEach((c,i)=>{const x=105+(i%2)*190,y=190+Math.floor(i/2)*110;g.fillStyle=pick===i?'#5a2a48':'#3a1d30';g.beginPath();g.roundRect(x-85,y-47,170,95,10);g.fill();
  g.fillStyle=c.hair;g.beginPath();g.arc(x-55,y-8,16,0,7);g.fill();g.fillStyle=c.body;g.fillRect(x-68,y+8,26,30);CB.text((i+1)+' '+c.n,x+12,y-6,15,'#fff');CB.text(c.sp,x+12,y+16,12,'#fc0')});
  CB.text('Lvl '+s.l+' · Tap a fighter or press 1-6',200,560,14,'#ccc');return}
 g.fillStyle='#4a2a1a';g.fillRect(0,470,400,90);g.fillStyle='#6b3d22';g.fillRect(0,300,400,170);CB.text('COFFEEBREAK',200,380,34,'#0003');
 [[s.p,20,'left'],[s.e,210,'right']].forEach(([f,x])=>{g.fillStyle='#0008';g.fillRect(x,20,170,16);g.fillStyle='#e33';g.fillRect(x,20,170*Math.max(0,f.hp)/100,16);g.fillStyle='#0008';g.fillRect(x,40,170,6);g.fillStyle='#fc0';g.fillRect(x,40,170*f.meter/100,6);CB.text(f.c.n,x+4,64,13,'#fff','left')});
 CB.text(Math.max(0,s.time|0),200,34,18,'#fff');CB.text('●'.repeat(s.rw)+'  R'+s.round+'  '+'●'.repeat(s.ew),200,64,13,'#ff8fc0');CB.text('Lvl '+s.l,200,84,12,'#aaa');
 G.drawF(g,s.p);G.drawF(g,s.e);s.fx.forEach(b=>{g.fillStyle='#6b3d22';g.beginPath();g.arc(b.x,375,12,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(b.x-b.dir*8,368,5,0,7);g.fill()});
 if(s.mt>0)CB.text(s.msg,200,200,22,'#ff0');BT.forEach(([n,x])=>CB.btn(n,x,595,60,56,n==='SPECIAL'&&s.p.meter>=100?'#e0a000':'#a03060'))}};CB.game(G);
