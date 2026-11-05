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
// ===== Coffeebreak Winning Goal =====
const DEMO=!!window.DEMO,SK=DEMO?'wingoalDemo':'wingoalSave';
let S={ch:0,best:0,skill:1,conf:1,bond:1,goals:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
let AC=null;const ac=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC};
function os(f,d,v,tp,f2){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d+.05)}catch(e){}}
function roar(len,vol){try{const a=ac(),n=a.sampleRate*len,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++){const e=Math.min(1,i/(a.sampleRate*.3))*Math.min(1,(n-i)/(a.sampleRate*1.2));d[i]=(Math.random()*2-1)*e}const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=.6;const g=a.createGain();g.gain.value=vol||.5;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}catch(e){}}
const SFX={kick:()=>os(120,.12,.5,'triangle',50),whistle:()=>{os(2200,.25,.12,'square',2100);setTimeout(()=>os(2300,.4,.12,'square',2250),300)},post:()=>os(700,.3,.2,'square',300),save:()=>{os(200,.3,.3,'sawtooth',80);roar(1.2,.15)},goal:()=>{roar(3.5,.6);[523,659,784].forEach((f,i)=>setTimeout(()=>os(f,.5,.08,'triangle'),i*120))},tap:()=>os(600,.08,.08)};
// ---- original cast ----
const P={jamie:['Jamie Rourke','🧑🏻','You. 19, works at a chippy, plays on Sundays.'],mags:['Mags Doherty','👩🏼‍🦳','Coach of Byker Lane Athletic.'],tariq:['Tariq Bell','🧑🏽','Your best mate and goalkeeper.'],mum:['Lorraine Rourke','👩🏻','Your mum. Night shifts at the hospital.'],scout:['Gil Hannaway','🕵🏻‍♂️','A scout in a damp anorak.'],boss:['Viktor Sallis','👨🏻‍💼','Manager of Tynegate Albion.'],dane:['Dane Whitlock','😏','Tynegate\'s star striker.'],nurse:['Physio Carys','👩🏾‍⚕️','Tynegate\'s physio.'],ref:['Referee','🧑🏻‍⚖️','']};
const BG={street:['#2a3550','#5a6a80'],pitch:['#16301e','#2f6b3a'],stadium:['#0a1430','#22407a'],dressing:['#2a2018','#5a4530'],hospital:['#203038','#5a7a88'],night:['#05060f','#1a1a3a']};
// steps: say(who,text) | ch(prompt,[[label,stat,reply]]) | game(kind,label,opt)
const say=(w,s)=>({t:'say',w,s}),ch=(q,o)=>({t:'ch',q,o}),game=(k,l,o)=>({t:'game',k,l,o:o||{}}),bg=b=>({t:'bg',b});
const CH=[
 {n:'The Lane',sub:'Byker Lane Athletic, Newcastle',steps:[bg('street'),say('mum','Jamie, love, you\'ll be late for the chippy again.'),say('jamie','Five minutes, Mum. Just five more keepy-ups.'),game('juggle','Training: Keepy-uppies in the back lane',{need:12}),bg('pitch'),say('mags','Sunday league, lads. Gateshead Wanderers Reserves. We\'re two down at half time.'),say('tariq','Psst. There\'s a bloke in an anorak by the corner flag. Taking notes.'),ch('Mags asks who takes the penalty if we get one.',[['"Me, coach. I want it."','conf','Mags grins. "That\'s the spirit."'],['"Give it to Tariq, he never misses in training."','bond','Tariq laughs. "Nice try, mate. It\'s yours."']]),say('ref','Penalty to Byker Lane!'),game('pen','Match moment: the penalty',{keeper:.8}),say('scout','Name\'s Hannaway. Tynegate Albion. Trial on Monday. Don\'t be late, son.')]},
 {n:'The Trial',sub:'Tynegate Albion training ground',steps:[bg('pitch'),say('boss','Hundred lads want your spot. Show me something I haven\'t seen.'),say('dane','Chip shop boy, is it? Mind you don\'t get grease on the ball.'),ch('How do you answer Dane?',[['Say nothing. Let your feet talk.','skill','You lace your boots tighter.'],['"I\'ll save you a battered sausage, mate."','conf','The other trialists burst out laughing.']]),game('dribble','Trial drill: dribble through the cones and defenders',{len:22,speed:230}),say('boss','Not bad. Last test. Free kick, edge of the box. Over the wall.'),game('free','Trial: the free kick',{keeper:.7}),say('boss','...Report Thursday. Bring your own boots.'),say('mum','You did WHAT? Oh, come here, pet!')]},
 {n:'Benchwarmer',sub:'Six weeks on the bench',steps:[bg('dressing'),say('jamie','Six weeks. Not one minute on the pitch.'),say('dane','Comfy on that bench, chip boy?'),ch('After training, you...',[['Stay late and practise alone.','skill','The groundsman leaves the floodlights on for you.'],['Call Tariq and the Byker Lane lads.','bond','"Proud of you, man," says Tariq. "Now get on that pitch."']]),game('juggle','Late night training under the floodlights',{need:18}),bg('stadium'),say('boss','Rourke! Warm up. You\'re on. We need a goal.'),game('dribble','Your debut: twenty minutes to change everything',{len:26,speed:260}),say('jamie','Did... did that just happen?'),say('boss','Don\'t get cocky. But you\'re in the squad for the cup.')]},
 {n:'Heartbreak',sub:'A long night',steps:[bg('hospital'),say('nurse','It\'s a hamstring strain, Jamie. Three weeks if you\'re careful.'),say('mum','Love, there\'s something else. They\'re cutting my hours at the hospital.'),ch('What do you do?',[['"I\'ll pick up shifts at the chippy again."','bond','Mum hugs you. "You\'ll do no such thing. You play."'],['"Then I\'ll win the cup. The bonus will cover it."','conf','Mum laughs through tears. "Bold. Just like your dad."']]),bg('night'),say('jamie','Rehab. Every morning, 5am. The Quayside in the rain.'),game('juggle','Rehab: gentle touches, keep control',{need:15}),bg('stadium'),say('boss','Quarter-final. You\'re fit? Then get out there. Free kick, last kick of the half.'),game('free','Quarter-final free kick',{keeper:.85}),say('dane','...Fine. Good goal. Don\'t let it go to your head.')]},
 {n:'Semi-Final',sub:'Northern Crown Cup semi-final',steps:[bg('stadium'),say('boss','Extra time done, still 1-1. It\'s penalties.'),say('dane','I\'ll go first. You take the last one, Rourke.'),ch('Dane is offering you the pressure kick. You...',[['Shake his hand. "Deal."','bond','For the first time, Dane smiles at you.'],['"Keep your mind games, I\'m ready."','conf','Dane shrugs. "Your funeral, chip boy."']]),say('ref','Shootout tied. Next one wins it.'),game('pen','The sudden-death penalty',{keeper:1}),say('mags','(on the phone) The whole of Byker Lane watched that in the pub. They\'re singing your name!'),say('jamie','We\'re going to the final.')]},
 {n:'The Final',sub:'Northern Crown Cup Final vs Kingsport City',steps:[bg('dressing'),say('boss','Kingsport City. Biggest club in the country. Nobody gives us a chance.'),say('tariq','(text) We\'re all in Block C. Your mum\'s got a banner.'),ch('Final team talk. You stand up and say...',[['"We\'re not here to make up the numbers."','conf','The dressing room roars.'],['"Play for each other. That\'s all."','bond','Even Dane nods and taps his chest.']]),bg('stadium'),say('ref','90 minutes gone. 1-1. Three minutes added on.'),game('dribble','Stoppage time: run the length of the pitch',{len:30,speed:300}),say('jamie','The keeper\'s off his line...'),game('winner','THE LAST-MINUTE WINNER',{keeper:1.15}),say('boss','You absolute beauty, Rourke!'),say('mum','That\'s my boy! THAT\'S MY BOY!'),say('jamie','From the back lane to the Crown. We did it, Byker Lane. We did it.')]}
];
const LAST=DEMO?2:6;
let ci=0,si=0,fade=0,msg='',msgT=0,reply='',mg=null,fails=0,rp=null,crT=0,card=0;
function stat(k){S[k]=(S[k]||0)+1;save()}
function startCh(i){ci=i;si=0;card=2.4;G.state='story';G.level=i+1;runStep()}
function runStep(){const st=CH[ci].steps[si];if(!st){endCh();return}if(st.t==='bg'){curBG=st.b;si++;return runStep()}if(st.t==='game'){startGame(st);return}G.state='story'}
let curBG='street';
function nextStep(){reply='';si++;SFX.tap();runStep()}
function endCh(){S.ch=Math.max(S.ch,ci+1);save();if(ci+1>=LAST){if(DEMO){G.state='chend';setTimeout(()=>window.demoEnd&&window.demoEnd('You\'ve finished chapters 1 and 2 of <b>Coffeebreak Winning Goal</b>. Jamie made the Tynegate squad... can he reach the Cup Final?'),1500)}else{G.state='credits';crT=0}}else G.state='chend'}
// ---- mini-games ----
function startGame(st){fails=0;mg={k:st.k,l:st.l,o:st.o,t:0,ph:'intro',res:null};if(st.k==='juggle'){mg.by=300;mg.vy=0;mg.cnt=0;mg.drop=0}
 if(st.k==='pen'||st.k==='free'||st.k==='winner'){mg.ph='aim';mg.aim=null;mg.pw=0;mg.kx=450;mg.kd=0;mg.ball=null;mg.timer=st.k==='winner'?8:0}
 if(st.k==='dribble'){mg.py=380;mg.dist=0;mg.hits=0;mg.def=[];mg.spawn=0;mg.tgt=380}G.state='game'}
const GOAL={x1:290,x2:610,y1:120,y2:250};
function shoot(p){if(mg.ph!=='aim'||mg.ball)return;const k=mg.k;let tx=Math.max(240,Math.min(660,p.x)),ty=Math.max(90,Math.min(270,p.y));
 const acc=6+18/(1+S.skill*.4);tx+=(Math.random()-.5)*acc*2;ty+=(Math.random()-.5)*acc;SFX.kick();
 const kd=Math.random()<.5?-1:1,react=mg.o.keeper||1;const guess=Math.random()<.2*react?(tx<450?-1:1):kd;
 mg.ball={sx:450,sy:k==='free'?520:470,tx,ty,t:0,curve:k==='free'?(tx<450?-90:90):0,path:[]};mg.kd=guess;mg.ph='fly'}
function judge(){const b=mg.ball,inG=b.tx>GOAL.x1+8&&b.tx<GOAL.x2-8&&b.ty>GOAL.y1+6&&b.ty<GOAL.y2;
 if(!inG){return b.tx<GOAL.x1-5||b.tx>GOAL.x2+5||b.ty<GOAL.y1-5?'miss':'post'}
 if(mg.k==='free'&&b.ty>205&&Math.abs(b.tx-450)<120)return 'wall';
 const kx=450+mg.kd*110,reach=62*(mg.o.keeper||1)/(1+S.conf*.08);if(Math.hypot(b.tx-kx,b.ty-215)<reach)return 'saved';return 'goal'}
function finish(win,txt){mg.ph='done';mg.res=win;mg.txt=txt;if(win){S.goals+=G.state==='game'&&/pen|free|winner|dribble/.test(mg.k)?1:0;save()}}
function updGame(dt){mg.t+=dt;const k=mg.k;
 if(k==='juggle'&&mg.ph==='play'){mg.vy+=900*dt;mg.by+=mg.vy*dt;if(mg.by>470){mg.drop++;mg.by=300;mg.vy=-200;SFX.post();if(mg.drop>=3)finish(false,'Dropped it three times!')}if(mg.cnt>=mg.o.need)finish(true,mg.cnt+' keepy-ups! Skill up!')}
 if((k==='pen'||k==='free'||k==='winner')){if(k==='winner'&&mg.ph==='aim'){mg.timer-=dt;if(mg.timer<=0){finish(false,'The referee blew for full time...');return}}
  mg.kx+=(450+mg.kd*110-mg.kx)*Math.min(1,dt*(mg.ph==='fly'?6:0));if(mg.ph==='aim')mg.kx=450+Math.sin(mg.t*2.2)*28;
  if(mg.ph==='fly'){const b=mg.ball;b.t+=dt*1.6;const u=Math.min(1,b.t);b.x=b.sx+(b.tx-b.sx)*u+Math.sin(u*Math.PI)*b.curve;b.y=b.sy+(b.ty-b.sy)*u-Math.sin(u*Math.PI)*(k==='free'?90:30);b.r=14-u*7;b.path.push([b.x,b.y,b.r,mg.kx]);
   if(u>=1){const r=judge();if(r==='goal'){SFX.goal();rp={path:b.path.slice(),i:0,next:mg.k};finish(true,'GOAL!');setTimeout(()=>{if(G.state==='game'&&mg&&mg.res){G.state='replay';rp.t=0}},900)}else{r==='saved'||r==='wall'?SFX.save():SFX.post();finish(false,{saved:'Saved by the keeper!',wall:'Blocked by the wall!',miss:'Over the bar / wide!',post:'Off the post!'}[r])}}}}
 if(k==='dribble'&&mg.ph==='play'){mg.py+=(mg.tgt-mg.py)*Math.min(1,dt*8);mg.dist+=dt;mg.spawn-=dt;if(mg.spawn<=0){mg.spawn=Math.max(.45,1.1-mg.dist*.02);mg.def.push({x:940,y:220+Math.random()*320,e:Math.random()<.5?'🧍🏿':'🧍🏼'})}
  for(const d of mg.def){d.x-=mg.o.speed*dt;if(!d.hit&&Math.abs(d.x-200)<34&&Math.abs(d.y-mg.py)<38){d.hit=1;mg.hits++;SFX.save();if(mg.hits>=3)finish(false,'Tackled! Lost the ball.')}}mg.def=mg.def.filter(d=>d.x>-50);
  if(mg.dist>=mg.o.len*.5&&mg.ph==='play'){SFX.goal();finish(true,'Through on goal! What a run!')}}}
function gameDown(p){if(!mg)return;if(mg.k==='juggle'&&mg.ph==='play'){if(Math.hypot(p.x-450,p.y-mg.by)<60&&mg.vy>-100){mg.vy=-560-Math.random()*120;mg.cnt++;SFX.kick()}}else if(mg.ph==='aim')shoot(p)}
function gameMove(p){if(mg&&mg.k==='dribble')mg.tgt=Math.max(220,Math.min(540,p.y))}
// ---- drawing ----
function sky(a,b){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,900,600)}
function scene(){const c=BG[curBG];sky(c[0],c[1]);
 if(curBG==='street'){for(let i=0;i<7;i++){x.fillStyle=i%2?'#5a2a20':'#6a3428';x.fillRect(i*130,200,128,300);x.fillStyle='#ffd88a';x.fillRect(i*130+30,250,30,40);x.fillRect(i*130+75,250,30,40)}x.fillStyle='#3a3a40';x.fillRect(0,480,900,120)}
 else if(curBG==='pitch'||curBG==='stadium'){if(curBG==='stadium'){for(let i=0;i<300;i++){x.fillStyle=['#e33','#fff','#ffd','#33e'][i%4];x.globalAlpha=.5+.5*Math.sin(t*3+i);x.fillRect((i*37)%900,90+((i*53)%160),4,4)}x.globalAlpha=1;for(let i=0;i<4;i++){x.fillStyle='rgba(255,255,220,.15)';x.beginPath();x.moveTo(120+i*220,40);x.lineTo(60+i*220,600);x.lineTo(200+i*220,600);x.fill()}}
  x.fillStyle='#2f7a3a';x.fillRect(0,300,900,300);for(let i=0;i<9;i++){x.fillStyle=i%2?'#2a6e34':'#33843f';x.fillRect(i*100,300,100,300)}x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=3;x.strokeRect(250,300,400,120)}
 else if(curBG==='dressing'){for(let i=0;i<8;i++){x.fillStyle='#7a5a3a';x.fillRect(20+i*110,120,100,260);x.fillStyle=i%2?'#c33':'#eee';x.fillRect(45+i*110,170,50,70)}x.fillStyle='#4a3020';x.fillRect(0,380,900,40)}
 else if(curBG==='hospital'){x.fillStyle='#dfe8ea';x.fillRect(100,150,700,300);x.fillStyle='#9ab';x.fillRect(150,330,300,60)}
 else{for(let i=0;i<60;i++){x.fillStyle='#fff';x.globalAlpha=.3+.3*Math.sin(t+i);x.fillRect((i*97)%900,(i*41)%300,2,2)}x.globalAlpha=1;x.fillStyle='#222a40';x.beginPath();x.moveTo(0,420);x.quadraticCurveTo(450,250,900,420);x.lineTo(900,440);x.quadraticCurveTo(450,280,0,440);x.fill()}}
function bars(){x.fillStyle='#000';x.fillRect(0,0,900,46);x.fillRect(0,554,900,46)}
function goalDraw(kx,kd,ph){x.strokeStyle='#fff';x.lineWidth=6;x.beginPath();x.moveTo(GOAL.x1,GOAL.y2+40);x.lineTo(GOAL.x1,GOAL.y1);x.lineTo(GOAL.x2,GOAL.y1);x.lineTo(GOAL.x2,GOAL.y2+40);x.stroke();x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;for(let i=GOAL.x1;i<GOAL.x2;i+=16){x.beginPath();x.moveTo(i,GOAL.y1);x.lineTo(i,GOAL.y2+40);x.stroke()}for(let j=GOAL.y1;j<GOAL.y2+40;j+=16){x.beginPath();x.moveTo(GOAL.x1,j);x.lineTo(GOAL.x2,j);x.stroke()}
 x.save();x.translate(kx,235);if(ph==='fly'||ph==='done')x.rotate(kd*.9);emo('🧤',-40,-30,30);emo('🧍🏻‍♂️',0,0,90);emo('🧤',40,-30,30);x.restore()}
function ballD(X,Y,r){emo('⚽',X,Y,r*2.6)}
function drawGame(){const k=mg.k;curBG=k==='juggle'?(ci===3?'night':'street'):'stadium';
 if(k==='juggle'){scene();bars();emo('🧑🏻',450,500,120);ballD(450,mg.by,22);x.strokeStyle='rgba(255,220,100,'+(.4+.3*Math.sin(t*6))+')';x.lineWidth=3;x.beginPath();x.arc(450,mg.by,60,0,7);x.stroke();T('Keepy-ups: '+mg.cnt+' / '+mg.o.need,30,80,24,'#ffd36a');T('Drops: '+mg.drop+' / 3',30,108,18,'#fff','left','')}
 else if(k==='dribble'){sky('#0a1430','#22407a');x.fillStyle='#2f7a3a';x.fillRect(0,200,900,354);const off=(mg.dist*mg.o.speed)%100;for(let i=-1;i<10;i++){x.fillStyle=i%2?'#2a6e34':'#33843f';x.fillRect(i*100-off,200,100,354)}
  for(const d of mg.def)emo(d.e,d.x,d.y,64);emo('🏃🏻‍♂️',200,mg.py,70);ballD(240,mg.py+24,10);bars();x.fillStyle='#ffd36a';x.fillRect(30,60,840*Math.min(1,mg.dist/(mg.o.len*.5)),10);T('Tackles: '+mg.hits+' / 3',30,95,18,'#fff','left','')}
 else{sky('#0a1430','#22407a');for(let i=0;i<200;i++){x.fillStyle=['#e33','#fff','#33e'][i%3];x.fillRect((i*37)%900,50+((i*53)%60),4,4)}x.fillStyle='#2f7a3a';x.fillRect(0,250,900,350);goalDraw(mg.kx,mg.kd,mg.ph);
  if(k==='free'){for(let i=0;i<4;i++)emo('🧍🏽‍♂️',390+i*40,330,70)}
  if(mg.ball&&mg.ball.x!==undefined)ballD(mg.ball.x,mg.ball.y,mg.ball.r);else ballD(450,k==='free'?520:470,14);
  if(mg.ph==='aim'){T('Click where you want to shoot',450,560,18,'#fff','center','');if(k==='winner')T('⏱ '+Math.ceil(mg.timer),820,90,30,mg.timer<3?'#f55':'#ffd36a','center')}bars()}
 T(mg.l,450,32,20,'#ffd36a','center');
 if(mg.ph==='intro'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,900,600);T(mg.l,450,240,28,'#ffd36a','center');T({juggle:'Click the ball inside the ring to keep it up.',dribble:'Move the mouse up and down to dodge defenders.'}[k]||'',450,290,18,'#fff','center','');button('go',350,330,200,54,'▶ Go!',()=>{mg.ph='play';mg.t=0;SFX.whistle()})}
 if(mg.ph==='done'&&G.state==='game'){if(mg.res&&rp&&/pen|free|winner/.test(k)){x.globalAlpha=Math.min(1,mg.t);T('GOOOAL!',450,330,80,'#ffd36a','center');x.globalAlpha=1;return}
  x.fillStyle='rgba(0,0,0,.65)';x.fillRect(150,220,600,220);T(mg.txt,450,280,30,mg.res?'#8f8':'#f88','center');
  if(mg.res)button('ok',350,360,200,50,'Continue ▶',()=>{rp=null;if(k==='juggle')stat('skill');nextStep()});
  else{button('re',190,360,240,50,'↻ Try again',()=>{fails++;const st=CH[ci].steps[si];const f=fails;startGame(st);fails=f});if(fails>=1)button('sk',470,360,240,50,'Carry on anyway',()=>{nextStep()},{fs:15})}}}
function drawReplay(){rp.t+=1/60;const n=rp.path.length,i=Math.min(n-1,Math.floor(rp.t*n/3.2));sky('#0a1430','#22407a');x.fillStyle='#2f7a3a';x.fillRect(0,250,900,350);const p=rp.path[i]||[450,470,14,450];
 x.save();x.translate(450,300);const z=1+rp.t*.12;x.scale(z,z);x.translate(-450,-300);goalDraw(p[3],mg.kd,'fly');for(let j=Math.max(0,i-12);j<i;j++){x.globalAlpha=(j-i+12)/24;ballD(rp.path[j][0],rp.path[j][1],rp.path[j][2])}x.globalAlpha=1;ballD(p[0],p[1],p[2]);x.restore();
 x.fillStyle='rgba(120,160,255,.08)';x.fillRect(0,0,900,600);bars();T('▶ REPLAY · SLOW MOTION',30,32,20,'#fff');if(Math.sin(t*6)>0){x.fillStyle='#f33';x.beginPath();x.arc(870,24,8,0,7);x.fill()}
 if(rp.t>3.4){T('What a strike, Jamie Rourke!',450,520,26,'#ffd36a','center');button('ok',350,400,200,50,'Continue ▶',()=>{rp=null;G.score++;nextStep()})}}
function wrapC(s,X,Y,mw,lh){x.textAlign='left';return wrapT(s,X,Y,mw,lh)}
function drawStory(){scene();const st=CH[ci].steps[si];bars();
 if(card>0){card-=1/60;x.fillStyle='rgba(0,0,0,'+Math.min(1,card)*.85+')';x.fillRect(0,0,900,600);x.globalAlpha=Math.min(1,card);T('CHAPTER '+(ci+1),450,250,22,'#ffd36a','center');T(CH[ci].n,450,310,52,'#fff','center');T(CH[ci].sub,450,350,18,'#ccc','center','italic ');x.globalAlpha=1;button('skip',780,500,100,36,'Skip',()=>card=0,{fs:14});return}
 if(!st)return;
 if(st.t==='say'){const p=P[st.w];emo(p[1],st.w==='jamie'?220:680,330,150);x.fillStyle='rgba(0,0,0,.75)';rr(60,400,780,140,14);x.fill();T(p[0],84,430,20,'#ffd36a');x.fillStyle='#fff';x.font='20px Georgia';wrapC(st.s,84,462,730,26);button('nx',720,500,110,32,'Next ▶',nextStep,{fs:14})}
 if(st.t==='ch'){emo(P.jamie[1],450,250,130);x.fillStyle='rgba(0,0,0,.8)';rr(60,330,780,215,14);x.fill();T(st.q,450,365,20,'#ffd36a','center');
  if(reply){x.fillStyle='#fff';x.font='italic 20px Georgia';wrapC(reply,90,420,720,28);button('nx',380,490,140,40,'Next ▶',nextStep,{fs:15})}
  else st.o.forEach((o,i)=>button('c'+i,90,390+i*70,720,56,o[0],()=>{stat(o[1]);reply=o[2]+'  ('+{conf:'Confidence',skill:'Skill',bond:'Team bond'}[o[1]]+' +1)';SFX.tap()},{fs:16}))}
 T('⚽ '+S.skill+'  💪 '+S.conf+'  🤝 '+S.bond,20,32,16,'#fff','left','')}
function drawTitle(){curBG='stadium';scene();bars();if(hero.complete&&hero.naturalWidth)x.globalAlpha=.0;x.globalAlpha=1;emo('⚽',450+Math.sin(t*2)*200,150+Math.abs(Math.sin(t*3))*-60+60,60);
 T('COFFEEBREAK',450,200,26,'#ffd36a','center');T('WINNING GOAL',450,270,72,'#fff','center');T('From a Newcastle back lane to the Cup Final',450,310,20,'#ddd','center','italic ');
 button('new',300,350,300,54,S.ch?'▶ Continue story':'▶ Start the story',()=>startCh(Math.min(S.ch,LAST-1)));button('chs',300,415,300,46,'🎬 Chapters',()=>G.state='chapters',{fs:17});if(!DEMO&&S.ch>=6)button('cr',300,470,300,40,'🎞 Credits',()=>{G.state='credits';crT=0},{fs:15});
 T(DEMO?'Free demo: chapters 1–2':'Full game: 6 chapters',450,535,14,'#ccc','center','');ent()}
function drawChapters(){curBG='night';scene();bars();T('🎬 Chapters',450,90,36,'#ffd36a','center');CH.forEach((c,i)=>{const lock=i>S.ch||i>=LAST;button('k'+i,200,120+i*66,500,54,(i+1)+'. '+c.n+(i>=LAST?'  🔒 Full game':lock?'  🔒':''),()=>startCh(i),{dis:lock,fs:17})});button('b',20,60,120,36,'◀ Back',()=>G.state='title',{fs:14})}
function drawChEnd(){curBG='night';scene();bars();T('Chapter '+(ci+1)+' complete',450,230,40,'#ffd36a','center');T(CH[ci].n,450,280,24,'#fff','center','italic ');if(!(DEMO&&ci+1>=LAST))button('n',300,330,300,54,'▶ Chapter '+(ci+2)+': '+CH[ci+1].n,()=>startCh(ci+1),{fs:16});button('m',350,400,200,44,'Menu',()=>G.state='title',{fs:15})}
const CRED=['COFFEEBREAK WINNING GOAL','','Starring','Jamie Rourke · the underdog','Mags Doherty · the coach','Tariq Bell · the best mate','Lorraine Rourke · Mum','Viktor Sallis · the manager','Dane Whitlock · the rival','Gil Hannaway · the scout','','Byker Lane Athletic','Tynegate Albion','Kingsport City','','All names and clubs are fictional.','','Music by Coffeebreak','','Made by Coffeebreak','coffeebreaks.itch.io','','Thanks for playing! ⚽'];
function drawCredits(){crT+=1/60;sky('#000','#0a0a20');bars();CRED.forEach((l,i)=>{const Y=640+i*40-crT*45;if(Y>40&&Y<560)T(l,450,Y,i===0?34:l===l.toUpperCase()&&l?22:20,i===0?'#ffd36a':'#fff','center',i===0?'bold ':'')});if(crT>3)button('m',760,500,120,40,'Menu',()=>G.state='title',{fs:14});if(Math.random()<.004)roar(1.5,.1)}
bindInput({down:p=>{if(G.state==='game')gameDown(p)},move:p=>{if(G.state==='game')gameMove(p)}});
function update(dt){if(G.state==='game'&&mg)updGame(dt)}
function draw(){x.clearRect(0,0,900,600);({title:drawTitle,chapters:drawChapters,story:drawStory,game:drawGame,replay:drawReplay,chend:drawChEnd,credits:drawCredits})[G.state]();x.textAlign='left'}
window.WG={G,S,CH,startCh,get mg(){return mg},nextStep,endCh,get si(){return si},set si(v){si=v}};startLoop();
const _btn=button;button=function(){_btn.apply(null,arguments);x.textAlign='left'};
