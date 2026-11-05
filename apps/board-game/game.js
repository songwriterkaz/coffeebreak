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
// ---- Coffeebreak: the café property board game ----
const DEMO=()=>!!window.DEMO;
const GRP={br:['#8a5a3a',50],lb:['#8ad0f0',50],pk:['#f6a0c0',100],or:['#f0a040',100],rd:['#d83a4a',150],yl:['#f0d040',150],gr:['#3aa060',200],db:['#3a5ad8',200]};
// [name,type,group,price,baseRent]
const SQ=[['Coffee Break (Start)','go'],['Hamilton Café','p','br',60,4],['Coffee Break card','card'],['Wickham Roastery','p','br',60,6],['Barista Tip Jar','tax',100],['Bean Roasters No.1','rr',0,200,25],['Merewether Beach','p','lb',100,8],['Bar Beach','p','lb',100,8],['Dixon Park Kiosk','p','lb',120,10],['Spilled Latte','jail'],
 ['Darby St Café','p','pk',140,12],['Beaumont St Espresso','p','pk',160,14],['Coffee Break card','card'],['Honeysuckle Wharf','p','or',180,16],['Nobbys Head','p','or',200,18],['Free Refill','free'],['Fort Scratchley','p','rd',220,20],['The Bogey Hole','p','rd',240,22],
 ['Bean Roasters No.2','rr',0,200,25],['Blackbutt Reserve','p','yl',260,24],['The Junction Café','p','yl',280,26],['Spill! Go to Spilled Latte','gojail'],['Newcastle Beach','p','gr',300,28],['Coffee Break card','card'],['Queens Wharf','p','gr',320,30],['King Edward Park','p','db',350,35],['Marshmallow Lane','tax',75],['Cathedral Hill Café','p','db',400,50]];
const N=SQ.length;// 28, corners 0,7,14,21
const CARDS=[['Your latte art goes viral! Collect 100 beans.',p=>pay(p,-100)],['Spilled your flat white. Pay 50 beans.',p=>pay(p,50)],['Free refill! Advance to Coffee Break (Start) and collect 200.',p=>moveTo(p,0)],['Head to Nobbys Head for sunrise.',p=>moveTo(p,14)],['Busker tips: collect 50 from every player.',p=>{G.ps.forEach(o=>{if(o!==p&&!o.out){pay(o,50);p.m+=50}})}],['Barista of the month: collect 150.',p=>pay(p,-150)],['Too many macarons: go to Spilled Latte.',p=>sendJail(p)],['Get out of Spilled Latte free card.',p=>{p.free++}],['Shout everyone a coffee: pay 25 to each player.',p=>{G.ps.forEach(o=>{if(o!==p&&!o.out){pay(p,25);o.m+=25}})}],['Café renovations: pay 25 per cup and 100 per café.',p=>pay(p,props(p).reduce((a,i)=>a+(G.own[i].h>=5?100:G.own[i].h*25),0))],['Back 3 squares.',p=>{p.pos=(p.pos+N-3)%N;land(p)}],['Find beans in the couch: collect 20.',p=>pay(p,-20)],['Coffee festival! Collect 75.',p=>pay(p,-75)],['Visit Darby St Café.',p=>moveTo(p,10)]];
const COLS=['#f6c6d2','#7ab0ff','#7fd88a','#ffcf6a'],TOK=['🍡','☕','🧁','🌹'];
const G={state:'title',score:0,level:0,np:2,bots:[false,true,true,true],ps:[],own:{},cur:0,phase:'roll',dice:[1,1],log:[],dbl:0,info:-1,turns:0};window.G=G;
const BX=20,BY=20,BS=560,CS=80,ES=(BS-2*CS)/6;
function rect(i){const s=i/7|0,k=i%7;if(s===0){return k===0?[BX+BS-CS,BY+BS-CS,CS,CS]:[BX+BS-CS-k*ES,BY+BS-CS,ES,CS]}if(s===1){return k===0?[BX,BY+BS-CS,CS,CS]:[BX,BY+BS-CS-k*ES,CS,ES]}if(s===2){return k===0?[BX,BY,CS,CS]:[BX+CS+(k-1)*ES,BY,ES,CS]}return k===0?[BX+BS-CS,BY,CS,CS]:[BX+BS-CS,BY+CS+(k-1)*ES,CS,ES]}
function log(s){G.log.unshift(s);G.log=G.log.slice(0,7)}
function props(p){return Object.keys(G.own).filter(i=>G.own[i].o===p.id).map(Number)}
function groupOwned(p,g){return SQ.every((s,i)=>s[2]!==g||s[1]!=='p'||(G.own[i]&&G.own[i].o===p.id))}
function rent(i){const s=SQ[i],o=G.own[i];if(!o)return 0;const ow=G.ps[o.o];if(s[1]==='rr'){const n=SQ.filter((q,j)=>q[1]==='rr'&&G.own[j]&&G.own[j].o===o.o).length;return 25*n*n}
 if(o.h===0)return s[4]*(groupOwned(ow,s[2])?2:1);return s[4]*[0,3,8,15,22,30][o.h]}
function pay(p,a){p.m-=a;if(p.m<0)broke(p)}
function broke(p){for(const i of props(p))while(G.own[i].h>0&&p.m<0){G.own[i].h--;p.m+=GRP[SQ[i][2]][1]/2}if(p.m<0){p.out=true;log('💸 '+p.n+' is out of beans!');props(p).forEach(i=>delete G.own[i]);const left=G.ps.filter(q=>!q.out);if(left.length===1)win(left[0])}}
function win(p){G.state='over';G.winner=p;G.score=p.m;log('🏆 '+p.n+' wins!')}
function sendJail(p){p.pos=7;p.jail=3;log('☕💦 '+p.n+' goes to Spilled Latte!');G.dbl=0}
function moveTo(p,i){if(i<p.pos){p.m+=200;log(p.n+' passes Coffee Break: +200')}p.pos=i;land(p)}
function newGame(){startMusic();G.ps=[];for(let i=0;i<G.np;i++)G.ps.push({id:i,n:G.bots[i]?['Bot Coffee','Bot Bean','Bot Mallow','Bot Rose'][i]:'Player '+(i+1),bot:G.bots[i],m:1500,pos:0,jail:0,free:0,out:false});G.own={};G.cur=0;G.phase='roll';G.log=[];G.turns=0;G.state='play';log('Welcome to Coffeebreak! Everyone starts with 1500 beans.');botMaybe()}
function cp(){return G.ps[G.cur]}
function roll(){const p=cp();const a=1+Math.random()*6|0,b=1+Math.random()*6|0;G.dice=[a,b];G.rollT=.5;const d=a===b;
 if(p.jail){if(d){p.jail=0;log(p.n+' rolls doubles and escapes!')}else{p.jail--;if(p.jail===0){pay(p,50);log(p.n+' pays 50 to leave')}else{log(p.n+' is stuck in Spilled Latte');G.phase='end';return}}}
 if(d&&!p.jail){G.dbl++;if(G.dbl>=3){sendJail(p);G.phase='end';return}}else G.dbl=0;
 let np=p.pos+a+b;if(np>=N){np-=N;p.m+=200;log(p.n+' passes Coffee Break: +200 beans')}p.pos=np;log(p.n+' rolls '+a+'+'+b+' → '+SQ[np][0]);land(p);if(G.phase!=='buy')G.phase=d&&G.dbl&&!p.jail?'roll':'end'}
function land(p){const i=p.pos,s=SQ[i];if(s[1]==='p'||s[1]==='rr'){const o=G.own[i];if(!o){if(p.m>=s[3])G.phase='buy';}else if(o.o!==p.id&&!G.ps[o.o].jail){const r=rent(i);pay(p,r);G.ps[o.o].m+=r;log(p.n+' pays '+r+' beans to '+G.ps[o.o].n)}}
 else if(s[1]==='tax'){pay(p,s[2]);log(p.n+' pays '+s[2]+' beans ('+s[0]+')')}else if(s[1]==='gojail')sendJail(p);
 else if(s[1]==='card'){const c=CARDS[Math.random()*CARDS.length|0];G.card=c[0];G.cardT=3;log('🃏 '+c[0]);c[1](p)}else if(s[1]==='free'){p.m+=50;log(p.n+' gets a Free Refill: +50')}}
function buy(){const p=cp(),s=SQ[p.pos];p.m-=s[3];G.own[p.pos]={o:p.id,h:0};log(p.n+' buys '+s[0]+' for '+s[3]);G.phase=G.dbl?'roll':'end'}
function skip(){G.phase=G.dbl?'roll':'end'}
function canBuild(p,i){const s=SQ[i],o=G.own[i];if(!o||o.o!==p.id||s[1]!=='p'||o.h>=5||!groupOwned(p,s[2]))return false;const gi=SQ.map((q,j)=>j).filter(j=>SQ[j][2]===s[2]);return gi.every(j=>G.own[j].h>=o.h)&&p.m>=GRP[s[2]][1]}
function build(i){const p=cp();if(!canBuild(p,i))return false;p.m-=GRP[SQ[i][2]][1];G.own[i].h++;log(p.n+(G.own[i].h===5?' opens a CAFÉ on ':' adds a cup to ')+SQ[i][0]);return true}
function endTurn(){if(G.state!=='play')return;G.dbl=0;G.turns++;if(DEMO()&&G.turns>=16){G.state='demo';demoEnd('That is the end of the free demo of <b>Coffeebreak</b>! Up to 4 players, unlimited turns and the full Newcastle board are in the full game.');return}
 do{G.cur=(G.cur+1)%G.ps.length}while(cp().out);G.phase='roll';botMaybe()}
let botT=0;function botMaybe(){botT=.8}
function botStep(){const p=cp();if(!p.bot||G.state!=='play')return;if(G.phase==='roll'){roll();botT=.7;return}
 if(G.phase==='buy'){const s=SQ[p.pos];if(p.m-s[3]>=150)buy();else skip();botT=.6;return}
 if(G.phase==='end'){for(const i of props(p))if(SQ[i][1]==='p'&&p.m-GRP[SQ[i][2]][1]>300&&canBuild(p,i)){build(i);botT=.4;return}endTurn()}}
bindInput({down(q){if(G.state!=='play')return;for(let i=0;i<N;i++){const r=rect(i);if(q.x>r[0]&&q.x<r[0]+r[2]&&q.y>r[1]&&q.y<r[1]+r[3]){G.info=i;return}}}});
function update(dt){if(G.rollT>0)G.rollT-=dt;if(G.cardT>0)G.cardT-=dt;if(G.state==='play'&&cp().bot){botT-=dt;if(botT<=0)botStep()}}
function dieFace(X,Y,v){x.fillStyle='#fff8ee';rr(X,Y,44,44,8);x.fill();x.fillStyle='#3a1424';const P={1:[[22,22]],2:[[12,12],[32,32]],3:[[12,12],[22,22],[32,32]],4:[[12,12],[32,12],[12,32],[32,32]],5:[[12,12],[32,12],[22,22],[12,32],[32,32]],6:[[12,12],[32,12],[12,22],[32,22],[12,32],[32,32]]}[v];P.forEach(([a,b])=>{x.beginPath();x.arc(X+a,Y+b,4,0,7);x.fill()})}
function drawBoard(){x.fillStyle='#2a1424';x.fillRect(BX,BY,BS,BS);x.fillStyle='#1a0a10';x.fillRect(BX+CS,BY+CS,BS-2*CS,BS-2*CS);
 x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 36px Georgia';x.fillText('☕ COFFEEBREAK',BX+BS/2,BY+BS/2-30);x.font='16px Georgia';x.fillStyle='#ffe9c7';x.fillText('The Newcastle café property game',BX+BS/2,BY+BS/2);
 if(hero.complete&&hero.naturalWidth)x.drawImage(hero,BX+BS/2-40,BY+BS/2+20,80*hero.naturalWidth/hero.naturalHeight,80);
 for(let i=0;i<N;i++){const [rx,ry,rw,rh]=rect(i),s=SQ[i];x.fillStyle=i===G.info?'#fff0d8':'#fff8ee';x.fillRect(rx+1,ry+1,rw-2,rh-2);
  if(s[1]==='p'){x.fillStyle=GRP[s[2]][0];const sd=i/7|0;if(sd===0)x.fillRect(rx+1,ry+1,rw-2,14);else if(sd===1)x.fillRect(rx+rw-15,ry+1,14,rh-2);else if(sd===2)x.fillRect(rx+1,ry+rh-15,rw-2,14);else x.fillRect(rx+1,ry+1,14,rh-2)}
  x.fillStyle='#3a1424';x.font=(i%7?'9':'10')+'px Georgia';x.textAlign='center';const cx=rx+rw/2,cy=ry+rh/2;const ic={go:'☕➡',jail:'☕💦',free:'🫖',gojail:'👉💦',card:'🃏',tax:'🫙',rr:'🫘'}[s[1]];
  if(ic){emo(ic,cx,cy-6,i%7?16:22)}const words=s[0].replace(' (Start)','').split(' ');x.fillStyle='#3a1424';x.font='8px Georgia';let ln=[],cur='';words.forEach(w=>{if((cur+' '+w).length>11){ln.push(cur);cur=w}else cur=(cur?cur+' ':'')+w});ln.push(cur);ln.slice(0,3).forEach((l,k)=>x.fillText(l,cx,cy+(ic?12:-6)+k*9));
  if(s[3]&&!G.own[i]){x.fillStyle='#7a5a4a';x.fillText('🫘'+s[3],cx,ry+rh-5)}
  const o=G.own[i];if(o){x.fillStyle=COLS[o.o];x.beginPath();x.arc(rx+8,ry+8,5,0,7);x.fill();if(o.h)emo(o.h>=5?'🏪':'☕'.repeat(o.h),cx,ry+rh-8,o.h>=5?14:9)}}
 G.ps.forEach((p,k)=>{if(p.out)return;const [rx,ry,rw,rh]=rect(p.pos);x.fillStyle=COLS[k];x.beginPath();x.arc(rx+14+(k%2)*22,ry+rh/2+(k>>1)*16-4,10,0,7);x.fill();emo(TOK[k],rx+14+(k%2)*22,ry+rh/2+(k>>1)*16-4,13)})}
function draw(){x.fillStyle='#12060c';x.fillRect(0,0,W,H);
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 50px Georgia';x.fillText('☕ Coffeebreak',W/2,110);x.fillStyle='#ffe9c7';x.font='18px Georgia';x.fillText('Buy cafés and Newcastle NSW hot spots with coffee beans. Build cups, then cafés.',W/2,150);x.fillText('Collect rent, draw Coffee Break cards, and be the last barista standing!',W/2,176);
  x.fillText('Players',W/2,230);[2,3,4].forEach((n,i)=>button('n'+n,W/2-160+i*110,242,100,40,n+' players',()=>{if(DEMO()&&n>2)return;G.np=n},{sel:G.np===n,dis:DEMO()&&n>2,fs:15}));
  for(let i=1;i<G.np;i++)button('b'+i,W/2-200+(i-1)*140,310,130,38,'P'+(i+1)+': '+(G.bots[i]?'🤖 Bot':'🙂 Human'),()=>{if(DEMO())return;G.bots[i]=!G.bots[i]},{fs:14});
  x.fillStyle='#ffcf6a';x.font='14px Georgia';x.fillText(DEMO()?'Free demo: you vs 1 bot for 16 turns.':'Player 1 is you. Tap P2–P4 to switch between bot and human.',W/2,375);
  button('go',W/2-110,400,220,56,'▶ Start game',newGame);return}
 drawBoard();const p=cp(),px=600;x.fillStyle='#24101a';rr(px,20,285,560,14);x.fill();x.textAlign='left';
 G.ps.forEach((q,k)=>{const y=30+k*40;x.fillStyle=k===G.cur?'#3a1a24':'transparent';if(k===G.cur){rr(px+6,y,273,34,8);x.fill()}x.fillStyle=q.out?'#6a5a60':COLS[k];x.font='bold 15px Georgia';x.fillText(TOK[k]+' '+q.n+(q.jail?' 💦':''),px+14,y+22);x.textAlign='right';x.fillText(q.out?'OUT':'🫘 '+q.m,px+272,y+22);x.textAlign='left'});
 let y=40+G.ps.length*40;dieFace(px+14,y,G.dice[0]);dieFace(px+66,y,G.dice[1]);
 if(G.state==='play'&&!p.bot){if(G.phase==='roll')button('roll',px+120,y,150,44,'🎲 Roll',roll);if(G.phase==='buy'){const s=SQ[p.pos];button('buy',px+120,y,72,44,'Buy '+s[3],buy,{fs:13});button('skip',px+198,y,72,44,'Skip',skip,{fs:13})}if(G.phase==='end')button('end',px+120,y,150,44,'✅ End turn',endTurn)}
 else if(G.state==='play'){x.fillStyle='#ffe9c7';x.font='italic 15px Georgia';x.fillText('🤖 '+p.n+' is thinking…',px+120,y+28)}
 y+=60;x.textAlign='left';if(G.info>=0){const s=SQ[G.info],o=G.own[G.info];x.fillStyle='#fff8ee';rr(px+8,y,269,120,10);x.fill();x.fillStyle=s[2]&&GRP[s[2]]?GRP[s[2]][0]:'#e8a0b0';x.fillRect(px+8,y,269,8);x.fillStyle='#3a1424';x.font='bold 15px Georgia';x.fillText(s[0],px+16,y+28);x.font='13px Georgia';
  if(s[3]){x.fillText('Price 🫘'+s[3]+(s[1]==='p'?'   ·   Cup cost 🫘'+GRP[s[2]][1]:''),px+16,y+48);x.fillText('Owner: '+(o?G.ps[o.o].n:'none')+(o&&o.h?'  ·  '+(o.h>=5?'🏪 café':o.h+' cup(s)'):''),px+16,y+66);x.fillText('Rent now: 🫘'+(o?rent(G.info):s[1]==='p'?s[4]:25),px+16,y+84);
   if(G.state==='play'&&!p.bot&&o&&o.o===p.id&&s[1]==='p')x.textAlign='left';button('bld',px+16,y+90,180,26,canBuild(p,G.info)?(o.h===4?'🏪 Upgrade to café':'☕ Add a cup'):'Need the full colour set',()=>build(G.info),{dis:!canBuild(p,G.info),fs:12})}
  else{x.fillText({go:'Collect 200 beans when you pass.',jail:'Just visiting, or stuck mopping up.',free:'Free refill: collect 50 beans.',gojail:'Go straight to Spilled Latte!',card:'Draw a Coffee Break card.',tax:'Pay into the tip jar.'}[s[1]]||'',px+16,y+50)}}
 else{x.fillStyle='#d8c0b0';x.font='13px Georgia';x.fillText('Tap any square to see its details.',px+14,y+20);x.fillText('Own a full colour set to add cups;',px+14,y+40);x.fillText('4 cups become a café 🏪.',px+14,y+58)}
 y+=136;x.textAlign='left';x.fillStyle='#ffe9c7';x.font='12px Georgia';G.log.forEach((l,k)=>{x.globalAlpha=1-k*.12;wrapT(l,px+14,y+k*30,262,13)});x.globalAlpha=1;
 if(G.cardT>0){x.fillStyle='rgba(18,6,12,.9)';rr(BX+120,BY+200,320,150,14);x.fill();x.strokeStyle='#ffcf6a';x.lineWidth=3;x.stroke();x.fillStyle='#ffcf6a';x.font='bold 20px Georgia';x.textAlign='center';x.fillText('🃏 Coffee Break card',BX+280,BY+236);x.fillStyle='#ffe9c7';x.font='16px Georgia';wrapT(G.card,BX+280,BY+268,290,20)}
 if(G.state==='over'){x.fillStyle='rgba(18,6,12,.88)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffcf6a';x.font='bold 44px Georgia';x.fillText('🏆 '+G.winner.n+' wins!',W/2,250);button('again',W/2-110,300,220,52,'↻ New game',()=>G.state='title')}}
startLoop();
