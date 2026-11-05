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
// ---- Coffeebreak Darts ----
const DEMO=()=>!!window.DEMO;
const ORD=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5],CX=360,CY=300,SC=1.3;// px per mm
const G={state:'title',mode:'501',vs:'bot',score:0,level:+localStorage.dartWins||0,ps:[],cur:0,darts:[],thrown:[],aim:{x:CX,y:CY},steady:1,hold:false,msg:'',msgT:0,turn:0,botT:0,fly:null};window.G=G;
function scoreAt(px,py){const dx=(px-CX)/SC,dy=(py-CY)/SC,r=Math.hypot(dx,dy);if(r<=6.35)return{v:50,m:2,n:25,lab:'BULLSEYE'};if(r<=15.9)return{v:25,m:1,n:25,lab:'25'};if(r>170)return{v:0,m:0,n:0,lab:'Miss'};
 let a=Math.atan2(dx,-dy)*180/Math.PI;a=(a+360+9)%360;const n=ORD[Math.floor(a/18)];const m=r>=99&&r<=107?3:r>=162&&r<=170?2:1;return{v:n*m,m,n,lab:(m===3?'T':m===2?'D':'')+n}}
function target(n,m){if(n===25)return m===2?[CX,CY]:[CX+10*SC,CY];const i=ORD.indexOf(n),a=(i*18)*Math.PI/180,r=m===3?103:m===2?166:135;return[CX+Math.sin(a)*r*SC,CY-Math.cos(a)*r*SC]}
function newGame(mode,vs){startMusic();G.mode=mode;G.vs=vs;G.ps=[{n:'You',bot:false},{n:vs==='bot'?'Shed Bot':'Player 2',bot:vs==='bot'}].map(p=>({...p,left:501,next:1,hist:[]}));G.cur=0;G.thrown=[];G.turn=0;G.state='play';G.start=null;msg((mode==='501'?'501, double to finish. ':'Around the Clock: hit 1 to 20, then the bull. ')+'You throw first!')}
function msg(s){G.msg=s;G.msgT=2.6}
function cp(){return G.ps[G.cur]}
function throwAt(px,py){if(G.fly)return;G.fly={x0:px+80,y0:py+260,tx:px,ty:py,t:0}}
function landed(px,py){const p=cp(),s=scoreAt(px,py);G.thrown.push({x:px,y:py,s});
 if(G.mode==='501'){if(G.start==null)G.start=p.left;const nl=p.left-s.v;if(nl<0||nl===1||(nl===0&&s.m!==2)){msg('BUST! '+s.lab);p.left=G.start;G.thrown.length=3;}else{p.left=nl;msg(s.lab+(s.v?' (+'+s.v+')':''));if(nl===0){win(p);return}}}
 else{if(s.n===p.next&&(p.next!==25||true)){p.next=p.next===20?25:p.next===25?0:p.next+1;msg('✔ '+s.lab+'!  Next: '+(p.next===25?'Bull':p.next));if(p.next===0){win(p);return}}else msg(s.lab+'  (need '+(p.next===25?'Bull':p.next)+')')}
 if(G.thrown.length>=3)setTimeout(nextPlayer,900)}
function win(p){G.state='over';G.winner=p;G.score=G.mode==='501'?100:50;if(!p.bot&&G.vs==='bot'){localStorage.dartWins=G.level=(+localStorage.dartWins||0)+1}}
function nextPlayer(){if(G.state!=='play')return;G.thrown=[];G.start=null;G.cur=1-G.cur;G.turn++;if(DEMO()&&G.turn>=8){G.state='demo';demoEnd('That is the end of the free demo of <b>Coffeebreak Darts</b>! Full matches, 2-player mode and Around the Clock are in the full game.');return}G.steady=1;if(cp().bot)G.botT=1}
function botThrow(){const p=cp();let n,m;if(G.mode==='501'){const L=p.left;if(L<=40&&L%2===0){n=L/2;m=2}else if(L===50){n=25;m=2}else if(L>60){n=20;m=3}else{n=L>40?(L-40>20?20:L-40):1;m=1;if(L%2===1){n=1}}}else{n=p.next;m=1}
 const [tx,ty]=target(n,m),sk=11;throwAt(tx+(Math.random()+Math.random()-1)*sk*SC*1.4,ty+(Math.random()+Math.random()-1)*sk*SC*1.4)}
bindInput({down(p){if(G.state==='play'&&!cp().bot&&!G.fly&&G.thrown.length<3)G.hold=true},up(p){if(G.hold){G.hold=false;const j=(1-G.steady*0)*0;throwAt(G.aim.x+(Math.random()-.5)*6,G.aim.y+(Math.random()-.5)*6)}},move(p){G.mouse=p}});
function update(dt){if(G.msgT>0)G.msgT-=dt;if(G.state!=='play')return;
 if(G.fly){G.fly.t+=dt*3.2;if(G.fly.t>=1){const f=G.fly;G.fly=null;landed(f.tx,f.ty)}return}
 if(cp().bot){if(G.thrown.length<3){G.botT-=dt;if(G.botT<=0){botThrow();G.botT=.9}}return}
 const m=G.mouse||{x:CX,y:CY};if(G.hold)G.steady=Math.max(0,G.steady-dt*.45);else G.steady=Math.min(1,G.steady+dt*.3);
 const amp=(G.hold?8+28*(1-G.steady)*(1-G.steady)*3:30)+(G.steady<.15?40:0);G.aim.x=m.x+Math.sin(t*2.1)*amp+Math.sin(t*5.3)*amp*.3;G.aim.y=m.y+Math.cos(t*1.7)*amp+Math.sin(t*4.1)*amp*.3}
function board(){x.fillStyle='#111';x.beginPath();x.arc(CX,CY,215*SC/1.45*1.0+10,0,7);x.fill();
 for(let i=0;i<20;i++){const a0=(i*18-9-90)*Math.PI/180,a1=a0+18*Math.PI/180;const ring=(r0,r1,col)=>{x.fillStyle=col;x.beginPath();x.arc(CX,CY,r1*SC,a0,a1);x.arc(CX,CY,r0*SC,a1,a0,true);x.fill()};
  const dk=i%2===0;ring(15.9,99,dk?'#1a1a1a':'#f0e0c0');ring(99,107,dk?'#c2264a':'#2a8a4a');ring(107,162,dk?'#1a1a1a':'#f0e0c0');ring(162,170,dk?'#c2264a':'#2a8a4a');
  const am=(i*18-90)*Math.PI/180;x.fillStyle='#fff';x.font='bold 16px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(ORD[i],CX+Math.cos(am)*188*SC,CY+Math.sin(am)*188*SC)}
 x.textBaseline='alphabetic';x.fillStyle='#2a8a4a';x.beginPath();x.arc(CX,CY,15.9*SC,0,7);x.fill();x.fillStyle='#c2264a';x.beginPath();x.arc(CX,CY,6.35*SC,0,7);x.fill();
 x.strokeStyle='#bbb';x.lineWidth=1;[15.9,99,107,162,170].forEach(r=>{x.beginPath();x.arc(CX,CY,r*SC,0,7);x.stroke()})}
function dartAt(X,Y,col){x.strokeStyle='#888';x.lineWidth=3;x.beginPath();x.moveTo(X,Y);x.lineTo(X+14,Y+22);x.stroke();x.fillStyle=col;x.beginPath();x.moveTo(X+12,Y+18);x.lineTo(X+26,Y+20);x.lineTo(X+20,Y+34);x.fill();x.fillStyle='#ffcf6a';x.beginPath();x.arc(X,Y,2.5,0,7);x.fill()}
function shed(){x.fillStyle='#5a3a22';x.fillRect(0,0,W,H);for(let i=0;i<W;i+=45){x.fillStyle=i/45%2?'#634026':'#56371f';x.fillRect(i,0,44,H)}
 x.strokeStyle='#2a1a0a';x.lineWidth=2;x.beginPath();for(let i=0;i<=W;i+=10)x.lineTo(i,70+Math.sin(i/60)*6);x.stroke();const LC=['#ffd75a','#ff8ab0','#8ad0ff','#a0ff9a'];for(let i=15;i<W;i+=40){const y=72+Math.sin(i/60)*6,on=.6+.4*Math.sin(t*3+i);x.fillStyle=LC[(i/40|0)%4];x.globalAlpha=on*.35;x.beginPath();x.arc(i,y+6,11,0,7);x.fill();x.globalAlpha=on;x.beginPath();x.arc(i,y+6,4,0,7);x.fill();x.globalAlpha=1}}
function draw(){shed();
 if(G.state==='title'){board();x.fillStyle='rgba(18,8,4,.65)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f0c070';x.font='bold 52px Georgia';x.fillText('🎯 Coffeebreak Darts',W/2,140);x.fillStyle='#fff3d6';x.font='18px Georgia';x.fillText('Aim with the mouse or finger. Press and hold to steady your hand, release to throw.',W/2,185);x.fillText("Don't hold too long, or your arm starts to wobble!",W/2,210);
  button('a',W/2-270,260,260,50,'🎯 501 vs Shed Bot',()=>newGame('501','bot'));button('b',W/2+10,260,260,50,'🕐 Around the Clock vs Bot',()=>newGame('atc','bot'),{dis:DEMO(),fs:16});
  button('c',W/2-270,325,260,50,'👥 501, 2 players',()=>newGame('501','2p'),{dis:DEMO()});button('d',W/2+10,325,260,50,'👥 Around the Clock, 2P',()=>newGame('atc','2p'),{dis:DEMO(),fs:16});
  x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('Wins vs the bot: '+G.level+(DEMO()?'   ·   Demo: 501 vs the bot, 4 rounds each':''),W/2,420);return}
 board();G.thrown.forEach(d=>dartAt(d.x,d.y,G.cur?'#7ab0ff':'#f6c6d2'));
 if(G.fly){const f=G.fly,k=f.t,X=f.x0+(f.tx-f.x0)*k,Y=f.y0+(f.ty-f.y0)*k-Math.sin(k*3.14)*60;dartAt(X,Y,'#ffcf6a')}
 if(G.state==='play'&&!cp().bot&&!G.fly&&G.thrown.length<3){const a=G.aim;x.strokeStyle=G.hold?'#7fff9a':'#ffcf6a';x.lineWidth=2;x.beginPath();x.arc(a.x,a.y,10,0,7);x.moveTo(a.x-16,a.y);x.lineTo(a.x+16,a.y);x.moveTo(a.x,a.y-16);x.lineTo(a.x,a.y+16);x.stroke();
  x.fillStyle='#2a1406';rr(20,420,16,150,6);x.fill();x.fillStyle=G.steady>.4?'#7fd88a':G.steady>.15?'#ffcf6a':'#ff5a5a';rr(22,568-146*G.steady,12,146*G.steady,5);x.fill();x.fillStyle='#fff3d6';x.font='11px Georgia';x.textAlign='center';x.fillText('STEADY',28,412)}
 const px=640;x.fillStyle='rgba(26,12,6,.85)';rr(px,100,245,440,14);x.fill();x.textAlign='left';x.fillStyle='#f0c070';x.font='bold 18px Georgia';x.fillText(G.mode==='501'?'501 · double out':'Around the Clock',px+14,128);
 G.ps.forEach((p,i)=>{const y=150+i*90;x.fillStyle=i===G.cur?'#4a2a14':'transparent';if(i===G.cur){rr(px+8,y,229,80,10);x.fill()}x.fillStyle=i?'#7ab0ff':'#f6c6d2';x.font='bold 17px Georgia';x.fillText((i===G.cur?'▶ ':'')+p.n,px+18,y+26);x.fillStyle='#fff3d6';x.font='bold 34px Georgia';x.fillText(G.mode==='501'?p.left:(p.next===25?'Bull':p.next===0?'Done':p.next),px+18,y+66)});
 x.fillStyle='#fff3d6';x.font='15px Georgia';x.fillText('This turn: '+G.thrown.map(d=>d.s.lab).join(', '),px+14,350);x.fillText('Darts left: '+(3-G.thrown.length),px+14,374);
 if(G.mode==='501'&&!cp().bot&&cp().left<=170){x.fillStyle='#ffcf6a';x.fillText('Checkout tip: finish on a double!',px+14,398)}
 button('menu',px+14,490,217,36,'☰ Menu',()=>G.state='title',{fs:15});
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='rgba(18,8,4,.85)';rr(CX-250,16,500,40,12);x.fill();x.fillStyle='#ffcf6a';x.font='bold 18px Georgia';x.textAlign='center';x.fillText(G.msg,CX,42);x.globalAlpha=1}
 if(G.state==='over'){x.fillStyle='rgba(18,8,4,.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f0c070';x.font='bold 44px Georgia';x.fillText('🏆 '+G.winner.n+' wins!',W/2,240);button('again',W/2-110,290,220,52,'↻ Play again',()=>newGame(G.mode,G.vs));button('m2',W/2-110,355,220,44,'☰ Menu',()=>G.state='title')}}
startLoop();
