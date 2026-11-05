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
// ---- Coffeebreak Manifest Money ATM (play money only) ----
const DEMO=()=>!!window.DEMO,SONG='https://music.apple.com/au/album/billionaire/1542958072?i=1542958079';
const AFF=['Money flows to me easily and often.','I am a magnet for abundance.','Every dollar I spend comes back multiplied.','I am worthy of wealth and joy.','My creativity creates endless income.','Abundance is my natural state.','I welcome unexpected money today.','I am open to receiving all the good the universe offers.','My music reaches millions and blesses me back.','I am becoming a billionaire in every way: love, joy and money.','Gratitude turns what I have into enough, and more.','Wealth loves me, and I love it back.'];
let A=JSON.parse(localStorage.atmSave||'null')||{bal:1000000,inf:false,withdrawn:0,dep:[],goal:null,day:'',wd:0,receipts:0};
const today=new Date().toDateString();if(A.day!==today){A.day=today;A.wd=0}
const G={state:'card',score:0,level:A.receipts};window.G=G;window.A=A;
let pin='',notes=[],spk=[],rcpt=null,msg='',busy=0,scr='',amtSel=null;
const save=()=>{localStorage.atmSave=JSON.stringify(A);G.level=A.receipts;G.score=Math.round(A.withdrawn)};
const fmt=v=>'$'+Math.round(v).toLocaleString('en-AU');
const dailyAff=()=>{const d=new Date();return AFF[(d.getDate()+d.getMonth()*31)%AFF.length]};
// ---- sounds (WebAudio, synthesised) ----
let AC=null;const ac=()=>AC||(AC=new (window.AudioContext||window.webkitAudioContext)());
function beep(f=1200,d=.08,v=.15){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+d)}catch(e){}}
function noise(d,f,v,t0=0){try{const a=ac(),n=a.createBuffer(1,a.sampleRate*d,a.sampleRate),c=n.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);const s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();s.buffer=n;bp.type='bandpass';bp.frequency.value=f;bp.Q.value=.8;g.gain.value=v;s.connect(bp).connect(g).connect(a.destination);s.start(a.currentTime+t0)}catch(e){}}
function shuffleSnd(){for(let i=0;i<14;i++)noise(.06,2500+Math.random()*2500,.35,i*.07);try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.value=70;g.gain.value=.05;o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+1.1)}catch(e){}}
function printSnd(){try{const a=ac();for(let i=0;i<10;i++){const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=380+(i%2)*40;g.gain.value=.05;o.connect(g).connect(a.destination);o.start(a.currentTime+i*.12);o.stop(a.currentTime+i*.12+.09)}}catch(e){}}
function chime(){[880,1108,1318].forEach((f,i)=>setTimeout(()=>beep(f,.25,.08),i*120))}
// ---- actions ----
function key(k){startMusic();beep(k==='ENTER'?1500:1200);if(busy)return;
 if(G.state==='pin'){if(k==='CLEAR')pin='';else if(k==='CANCEL'){G.state='card';pin=''}else if(k==='ENTER'){if(pin.length===4){G.state='menu';msg='Welcome, abundant soul ✨';chime()}else msg='Enter any 4-digit PIN (try 7777)'}else if(pin.length<4&&/\d/.test(k))pin+=k;return}
 if(G.state==='amount'&&k==='CANCEL')G.state='menu'}
function withdraw(v){if(DEMO()&&A.wd>=3)return demoEnd('The free demo allows 3 play-money withdrawals a day. Unlimited withdrawals, infinite-money mode and every receipt are in the full game.');
 if(!A.inf&&v>A.bal){msg='Insufficient manifested funds. Deposit gratitude to grow your balance! 🙏';beep(300,.3);return}
 busy=1;G.state='processing';scr='Processing your abundance…';let k=0;const iv=setInterval(()=>{beep(900+k*80,.05,.08);if(++k>5){clearInterval(iv);dispense(v)}},180)}
function dispense(v){shuffleSnd();if(!A.inf)A.bal-=v;A.withdrawn+=v;A.wd++;A.receipts++;save();const den=v>=100000?'1M':v>=10000?'10K':v>=1000?'1K':'100',n=Math.min(14,Math.max(4,Math.round(Math.log10(v)*2)));
 for(let i=0;i<n;i++)setTimeout(()=>{notes.push({x:CX+(Math.random()-.5)*40,y:SLOTY,vx:(Math.random()-.5)*160,vy:-60-Math.random()*90,r:0,vr:(Math.random()-.5)*4,d:den,out:0});for(let j=0;j<8;j++)spk.push({x:CX,y:SLOTY,vx:(Math.random()-.5)*240,vy:-Math.random()*200,l:1})},i*90);
 setTimeout(()=>{printSnd();rcpt={v,aff:AFF[Math.random()*AFF.length|0],y:0,t:new Date().toLocaleString('en-AU'),n:A.receipts};busy=0;G.state='menu';scr='';msg='Please take your play cash and receipt 💸'},n*90+600)}
function deposit(kind){startMusic();const el=$('tx'),v=el.value.trim();if(!v){msg='Type what you are '+(kind==='g'?'grateful for':'intending')+' first';return}el.value='';const amt=kind==='g'?1111:7777;A.bal+=amt;A.dep.unshift({k:kind,t:v,d:today});A.dep=A.dep.slice(0,50);save();chime();for(let j=0;j<30;j++)spk.push({x:CX,y:300,vx:(Math.random()-.5)*300,vy:-Math.random()*250,l:1.2});msg=(kind==='g'?'🙏 Gratitude':'✨ Intention')+' deposited! +'+fmt(amt)+' manifested'}
function setGoal(){const v=$('tx').value.trim();const m=v.match(/[\d,.]+\s*(k|m|b)?/i);if(!m){msg='Type a goal like "1000000 dream home" or "50k new car"';return}let n=parseFloat(m[0].replace(/,/g,''));const u=(m[1]||'').toLowerCase();n*=u==='k'?1e3:u==='m'?1e6:u==='b'?1e9:1;const name=v.replace(m[0],'').trim()||'My money goal';A.goal={n,name,start:A.withdrawn};$('tx').value='';save();msg='🎯 Goal set: '+name+' '+fmt(n)}
$('dep').onclick=()=>deposit('g');$('int').onclick=()=>deposit('i');$('gl').onclick=setGoal;
window.ATM={key,withdraw,deposit,setGoal,get A(){return A}};
addEventListener('keydown',e=>{if(document.activeElement===$('tx'))return;if(/^\d$/.test(e.key))key(e.key);if(e.key==='Enter')key('ENTER');if(e.key==='Backspace')key('CLEAR');if(e.key==='Escape')key('CANCEL')});
bindInput({});
// ---- drawing ----
const MX=170,MY=20,MW=560,MH=575,CX=450,SLOTY=552;
function update(dt){notes.forEach(n=>{n.out=Math.min(1,n.out+dt*3);if(n.out>=1){n.vy+=120*dt;n.vx*=.99;n.x+=n.vx*dt+Math.sin(t*3+n.r)*20*dt;n.y+=n.vy*dt;n.r+=n.vr*dt}else n.y=SLOTY-n.out*10});notes=notes.filter(n=>n.y<H+60);spk.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=200*dt;s.l-=dt*.7});spk=spk.filter(s=>s.l>0);if(rcpt&&rcpt.y<1)rcpt.y=Math.min(1,rcpt.y+dt*.6)}
function note(n){x.save();x.translate(n.x,n.y);x.rotate(n.r);const g=x.createLinearGradient(-50,-22,50,22);g.addColorStop(0,'#7fd8a0');g.addColorStop(.5,'#c8f0c0');g.addColorStop(1,'#5ab080');x.fillStyle=g;x.fillRect(-50,-22,100,44);x.strokeStyle='#2a6a4a';x.lineWidth=2;x.strokeRect(-46,-18,92,36);x.fillStyle='#1a4a2a';x.font='bold 14px Georgia';x.textAlign='center';x.fillText('$'+n.d,-28,5);x.fillText('$'+n.d,30,5);x.beginPath();x.arc(0,0,11,0,7);x.strokeStyle='#d8a830';x.stroke();x.font='12px serif';x.fillText('☕',0,4);x.font='bold 6px Georgia';x.fillText('PLAY MONEY · NOT REAL',0,-12);x.restore()}
function screen(){const sx=MX+70,sy=MY+90,sw=MW-140,sh=230;x.fillStyle='#0a1628';rr(sx-10,sy-10,sw+20,sh+20,12);x.fill();const g=x.createLinearGradient(0,sy,0,sy+sh);g.addColorStop(0,'#1a4a6a');g.addColorStop(1,'#0a2a4a');x.fillStyle=g;rr(sx,sy,sw,sh,6);x.fill();
 x.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<sh;i+=3)x.fillRect(sx,sy+i,sw,1);x.textAlign='center';x.fillStyle='#bff8ff';x.font='bold 20px monospace';
 const st=G.state;if(st==='card'){x.fillText('WELCOME TO THE',CX,sy+50);x.fillStyle='#ffd75a';x.font='bold 24px Georgia';x.fillText('Coffeebreak Abundance ATM',CX,sy+84);x.fillStyle='#bff8ff';x.font='16px monospace';x.fillText('Tap the card to insert it',CX,sy+130);x.font='12px monospace';x.fillText('Daily affirmation:',CX,sy+170);x.fillStyle='#ffd75a';x.font='italic 14px Georgia';x.fillText(dailyAff(),CX,sy+192)}
 if(st==='pin'){x.fillText('ENTER YOUR ABUNDANCE PIN',CX,sy+60);x.font='bold 40px monospace';x.fillText('* '.repeat(pin.length)+'_ '.repeat(4-pin.length),CX,sy+120);x.font='14px monospace';x.fillText('Any 4 digits · press ENTER',CX,sy+160)}
 if(st==='menu'||st==='amount'){x.font='bold 15px monospace';x.fillText('BALANCE: '+(A.inf?'∞ INFINITE':fmt(A.bal)),CX,sy+28);const L=st==='menu'?[['💸 WITHDRAW',()=>{G.state='amount'}],['🧾 BALANCE',()=>{msg='Manifested balance: '+(A.inf?'∞':fmt(A.bal))+' · total withdrawn '+fmt(A.withdrawn);beep()}],['♾️ INFINITE '+(A.inf?'ON':'OFF'),()=>{if(DEMO())return demoEnd('Infinite-money mode is in the full game.');A.inf=!A.inf;save();chime()}],['🎵 GET THE SONG',()=>open(SONG,'_blank')],['🌅 AFFIRMATION',()=>{msg='Today: '+dailyAff();chime()}],['⏏️ EXIT',()=>{G.state='card';pin='';beep(600)}]]
  :[[fmt(100),()=>withdraw(100)],[fmt(1000),()=>withdraw(1000)],[fmt(10000),()=>withdraw(10000)],[fmt(100000),()=>withdraw(100000)],[fmt(1000000),()=>withdraw(1000000)],['⬅ BACK',()=>G.state='menu']];
  L.forEach((o,i)=>{const left=i<3,Y=sy+50+(i%3)*60,X=left?sx+10:sx+sw-200;x.fillStyle='rgba(191,248,255,.12)';rr(X,Y,190,44,6);x.fill();x.fillStyle='#bff8ff';x.font='bold 14px monospace';x.textAlign='center';x.fillText(o[0],X+95,Y+27);
   const bx=left?MX+18:MX+MW-58;button('sb'+i,bx,Y+4,40,36,'▶',()=>{startMusic();beep();o[1]()},{fs:14,bg:'#5a5a64',ac:'#c0c0c8'});BTN['sc'+i]={x:X,y:Y,w:190,h:44,fn:()=>{startMusic();beep();o[1]()}}});
  if(DEMO()){x.fillStyle='#ffcf6a';x.font='11px monospace';x.textAlign='center';x.fillText('Demo: '+Math.max(0,3-A.wd)+' of 3 withdrawals left today',CX,sy+sh-6)}}
 if(st==='processing'){x.fillText(scr,CX,sy+100);for(let i=0;i<3;i++){x.fillStyle=Math.floor(t*4)%3===i?'#ffd75a':'#2a5a7a';x.beginPath();x.arc(CX-30+i*30,sy+150,8,0,7);x.fill()}}}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1036');g.addColorStop(1,'#120610');x.fillStyle=g;x.fillRect(0,0,W,H);
 // machine body brushed metal
 const m=x.createLinearGradient(MX,0,MX+MW,0);m.addColorStop(0,'#6a6a74');m.addColorStop(.2,'#d8d8e0');m.addColorStop(.5,'#a8a8b4');m.addColorStop(.8,'#e8e8f0');m.addColorStop(1,'#70707a');x.fillStyle=m;rr(MX,MY,MW,MH,22);x.fill();x.strokeStyle='#4a4a54';x.lineWidth=3;x.stroke();
 x.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<MH;i+=2)x.fillRect(MX+10,MY+i,MW-20,1);
 x.fillStyle='#c2264a';rr(MX+20,MY+14,MW-40,52,12);x.fill();x.fillStyle='#ffd75a';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('☕ COFFEEBREAK ABUNDANCE ATM',CX,MY+40);x.fillStyle='#fff';x.font='bold 11px Georgia';x.fillText('PLAY MONEY ONLY · NOT REAL MONEY · FOR FUN & MANIFESTING',CX,MY+58);
 screen();
 // keypad
 const KP=['1','2','3','CANCEL','4','5','6','CLEAR','7','8','9','ENTER','','0','',''];KP.forEach((k,i)=>{if(!k)return;const X=MX+130+(i%4)*76,Y=MY+345+Math.floor(i/4)*40,w=k.length>1?92:66;const col=k==='CANCEL'?'#c0303a':k==='CLEAR'?'#d8b020':k==='ENTER'?'#2a9a4a':'#3a3a44';
  button('k'+i,X,Y,w,34,k,()=>key(k),{bg:col,ac:'#1a1a20',fg:'#fff',fs:k.length>1?12:16})});
 // card slot + card
 x.fillStyle='#1a1a20';rr(MX+40,MY+350,70,10,4);x.fill();x.fillStyle='#7fff9a';x.fillRect(MX+44,MY+352,6,6);x.fillStyle='#333';x.font='10px Georgia';x.fillText('CARD',MX+75,MY+374);
 if(G.state==='card'){const by=MY+300+Math.sin(t*3)*5;x.save();x.translate(MX+75,by);const cg=x.createLinearGradient(-45,-28,45,28);cg.addColorStop(0,'#ff5a9a');cg.addColorStop(1,'#ffd75a');x.fillStyle=cg;rr(-45,-28,90,56,8);x.fill();x.fillStyle='#d8a830';x.fillRect(-32,-10,18,14);x.fillStyle='#fff';x.font='bold 9px monospace';x.fillText('ABUNDANCE CARD',0,18);x.restore();BTN.card={x:MX+30,y:by-28,w:90,h:56,fn:()=>{startMusic();beep(800,.15);noise(.3,800,.3);G.state='pin';pin=''}}}
 // cash slot
 x.fillStyle='#1a1a20';rr(CX-90,SLOTY-6,180,14,6);x.fill();x.fillStyle='#ffd75a';x.font='bold 10px Georgia';x.fillText('CASH',CX,SLOTY+22);
 // receipt slot
 x.fillStyle='#1a1a20';rr(MX+MW-140,SLOTY-6,100,8,3);x.fill();x.fillStyle='#333';x.fillText('RECEIPT',MX+MW-90,SLOTY+14);
 if(rcpt){const rh=230*rcpt.y,rx=MX+MW-135;x.fillStyle='#fffdf6';x.fillRect(rx,SLOTY-rh,90,rh);x.save();x.beginPath();x.rect(rx,SLOTY-rh,90,rh);x.clip();x.fillStyle='#3a3a3a';x.font='bold 9px monospace';x.textAlign='center';const L=['COFFEEBREAK','ABUNDANCE ATM','PLAY MONEY','',rcpt.t.split(',')[0],'#'+rcpt.n,'','WITHDRAWN',fmt(rcpt.v),'','BALANCE',A.inf?'INFINITE':fmt(A.bal),'','AFFIRMATION:'].concat(wrapLines(rcpt.aff,16)).concat(['','THANK YOU,','UNIVERSE ✨']);L.forEach((s,i)=>x.fillText(s,rx+45,SLOTY-rh+12+i*11));x.restore();BTN.rc={x:rx,y:SLOTY-rh,w:90,h:rh,fn:()=>{rcpt=null;beep(500)}}}
 // goal tracker
 x.textAlign='left';x.fillStyle='rgba(26,10,16,.8)';rr(8,80,150,170,12);x.fill();x.fillStyle='#ffd75a';x.font='bold 13px Georgia';x.fillText('🎯 Money goal',18,102);
 if(A.goal){const p=Math.min(1,(A.withdrawn-A.goal.start)/A.goal.n);x.fillStyle='#ffe9c7';x.font='12px Georgia';wrapT(A.goal.name,18,122,130,14);x.fillText(fmt(A.goal.n),18,158);x.fillStyle='#3a1424';rr(18,168,130,14,7);x.fill();x.fillStyle='#7fff9a';rr(18,168,130*p,14,7);x.fill();x.fillStyle='#fff';x.fillText(Math.round(p*100)+'% manifested',18,198);if(p>=1){x.fillStyle='#ffd75a';x.fillText('🎉 GOAL MANIFESTED!',18,218)}}
 else{x.fillStyle='#ffe9c7';x.font='12px Georgia';wrapT('Type a goal above (e.g. "1m dream home") and tap Set goal.',18,122,130,14)}
 x.fillStyle='rgba(26,10,16,.8)';rr(8,262,150,200,12);x.fill();x.fillStyle='#ffd75a';x.font='bold 13px Georgia';x.fillText('🙏 Deposits',18,284);x.fillStyle='#ffe9c7';x.font='11px Georgia';A.dep.slice(0,6).forEach((d,i)=>{x.fillText((d.k==='g'?'🙏 ':'✨ ')+d.t.slice(0,20),18,304+i*24)});
 button('song',740,480,150,40,'🎵 Get the song',()=>open(SONG,'_blank'),{fs:14,ac:'#ffd75a'});x.fillStyle='#ffe9c7';x.font='11px Georgia';x.textAlign='center';x.fillText('Billionaire, by Coffeebreak',815,534);
 notes.forEach(note);spk.forEach(s=>{x.fillStyle='rgba(255,215,90,'+Math.max(0,s.l)+')';x.beginPath();x.arc(s.x,s.y,2.5,0,7);x.fill()});
 if(msg){x.fillStyle="rgba(26,10,16,.92)";rr(CX-270,MY+66,540,24,8);x.fill();x.fillStyle="#ffd75a";x.font="bold 13px Georgia";x.textAlign="center";x.fillText(msg,CX,MY+83)}}
function wrapLines(s,n){const w=s.split(' '),o=[];let l='';w.forEach(z=>{if((l+z).length>n){o.push(l.trim());l=''}l+=z+' '});o.push(l.trim());return o}
startLoop();
