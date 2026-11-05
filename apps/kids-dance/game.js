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
// ===== Coffeebreak Kids shared helpers =====
window.FONT='"Comic Sans MS","Chalkboard SE","Comic Neue","Trebuchet MS",sans-serif';const KF=window.FONT;
const DEMO=!!window.DEMO;
const STK=['🦭','🌈','🦄','🐬','🍭','🌟','🐙','🦋','🍩','🐢','🚀','🌻','🐳','🧁','🦊','🐝','🎈','🐠','🍓','🦖','🪐','🐧','🎨','🏆'];
function kStore(key,def){let s=Object.assign({stars:0,stk:[]},def||{});try{Object.assign(s,JSON.parse(localStorage.getItem(key+(DEMO?'D':''))||'{}'))}catch(e){}s.save=()=>{try{localStorage.setItem(key+(DEMO?'D':''),JSON.stringify(Object.assign({},s,{save:undefined})))}catch(e){}};return s}
let CONF=[],POP=null;
function confetti(n){for(let i=0;i<(n||60);i++)CONF.push({x:450+(Math.random()-.5)*300,y:250,vx:(Math.random()-.5)*500,vy:-Math.random()*500-100,c:['#ff4f9a','#ffd24a','#40c8ff','#5ad870','#b06aff','#ff8a3d'][i%6],r:Math.random()*6,l:2})}
function kTone(f,d,v,tp){try{window._AC=window._AC||new AudioContext();const A=window._AC;if(A.state==='suspended')A.resume();const o=A.createOscillator(),g=A.createGain();o.type=tp||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.06,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+d)}catch(e){}}
function yay(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>kTone(f,.18,.06,'triangle'),i*90))}
function oops(){kTone(220,.25,.06,'triangle')}
function speak(s){try{const u=new SpeechSynthesisUtterance(s);u.lang='en-AU';u.rate=.9;u.pitch=1.2;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function reward(S,n,txt){S.stars+=n||1;let nw=null;while(S.stk.length<STK.length&&S.stars>=(S.stk.length+1)*5){nw=STK[S.stk.length];S.stk.push(nw)}S.save();confetti();yay();POP={t:0,txt:txt||'Great job!',stk:nw};if(G)G.score=S.stars}
function kbg(c1,c2){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<9;i++){x.beginPath();x.arc((i*137+t*12)%960-30,80+(i*97)%460,14+i%4*8,0,7);x.fill()}}
function kb(id,X,Y,w,h,label,fn,o={}){const col=o.bg||'#ff6fae';BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:(p)=>{kTone(660,.06,.04);fn(p)}};x.globalAlpha=o.dis?.45:1;x.fillStyle='rgba(0,0,0,.18)';rr(X,Y+5,w,h,h*.3);x.fill();x.fillStyle=o.sel&&label!==''?'#ffd24a':col;rr(X,Y,w,h,h*.3);x.fill();x.strokeStyle=o.sel&&label===''?'#2a3a5a':'#fff';x.lineWidth=o.sel?6:3;x.stroke();
 x.fillStyle=o.fg||'#fff';x.font='bold '+(o.fs||Math.min(26,h*.42))+'px '+KF;x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+2);x.textBaseline='alphabetic';x.textAlign='left';x.globalAlpha=1}
function seal(X,Y,s,mood){x.save();x.translate(X,Y+Math.sin(t*3)*3*s);x.scale(s,s);const b='#9aa8b8',d='#7a889a';
 x.fillStyle=d;x.beginPath();x.ellipse(-55,40,26,12,-.5,0,7);x.ellipse(-60,26,22,10,.6,0,7);x.fill();
 x.fillStyle=b;x.beginPath();x.ellipse(0,30,62,40,0,0,7);x.fill();x.beginPath();x.ellipse(28,-12,40,36,0,0,7);x.fill();x.fillStyle='#dfe6ee';x.beginPath();x.ellipse(10,42,38,20,0,0,7);x.fill();
 x.fillStyle=d;x.beginPath();x.ellipse(mood==='wave'?44:20,mood==='wave'?10+Math.sin(t*10)*6:48,10,22,mood==='wave'?-1+Math.sin(t*10)*.4:.6,0,7);x.fill();
 x.fillStyle='#1a1a24';x.beginPath();x.arc(14,-18,7,0,7);x.arc(44,-18,7,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(16,-21,2.5,0,7);x.arc(46,-21,2.5,0,7);x.fill();
 x.fillStyle='#3a2a30';x.beginPath();x.ellipse(30,-4,7,5,0,0,7);x.fill();x.strokeStyle='#3a2a30';x.lineWidth=2;x.beginPath();if(mood==='sad')x.arc(30,12,6,3.6,5.8);else x.arc(30,2,7,.3,Math.PI-.3);x.stroke();
 x.strokeStyle='rgba(60,60,70,.6)';x.lineWidth=1.2;[[-1,-3],[1,-3],[-1,2],[1,2]].forEach(([a,o])=>{x.beginPath();x.moveTo(30+a*8,o);x.lineTo(30+a*30,o+(o<0?-4:4));x.stroke()});
 x.fillStyle='rgba(255,120,150,.45)';x.beginPath();x.arc(6,-2,6,0,7);x.arc(54,-2,6,0,7);x.fill();x.restore()}
function bubbleK(s,X,Y,w){x.font='bold 18px '+KF;const lines=Math.ceil(x.measureText(s).width/(w-24))+0;x.fillStyle='#fff';rr(X,Y,w,22+lines*22,16);x.fill();x.strokeStyle='#4ab0e8';x.lineWidth=3;x.stroke();x.fillStyle='#2a3a5a';wrapT(s,X+12,Y+26,w-24,22)}
function kOverlay(dt){CONF.forEach(p=>{p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r+=dt*8);x.fillRect(-5,-3,10,6);x.restore()});CONF=CONF.filter(p=>p.l>0&&p.y<620);
 if(POP){POP.t+=dt;const k=Math.min(1,POP.t*4),a=POP.t>1.8?Math.max(0,1-(POP.t-1.8)*3):1;x.globalAlpha=a;x.save();x.translate(450,90);x.scale(k,k);x.fillStyle='#fff';rr(-200,-40,400,POP.stk?110:70,24);x.fill();x.strokeStyle='#ffd24a';x.lineWidth=5;x.stroke();T('⭐ '+POP.txt,0,6,28,'#ff4f9a','center');if(POP.stk)T('New sticker! '+POP.stk,0,52,24,'#3a7ad8','center');x.restore();x.globalAlpha=1;if(POP.t>2.2)POP=null}}
function starBar(S){x.fillStyle='rgba(255,255,255,.85)';rr(14,10,190,40,20);x.fill();T('⭐ '+S.stars+'   🏷️ '+S.stk.length,30,38,20,'#ff7a00','left')}
function stickerBook(S,back){kbg('#fff3c4','#ffd6e8');T('My Sticker Book',450,60,38,'#ff4f9a','center');T('Earn a new sticker every 5 stars!',450,92,18,'#7a4a8a','center','');
 STK.forEach((s,i)=>{const X=95+(i%8)*92,Y=120+Math.floor(i/8)*120;x.fillStyle='#fff';rr(X-40,Y,80,100,16);x.fill();if(i<S.stk.length)emo(s,X,Y+50,52);else{x.globalAlpha=.25;emo('❔',X,Y+50,40);x.globalAlpha=1}});kb('sb',350,500,200,60,'⬅ Back',back,{bg:'#4ab0e8'})}
// ---- original kids music: rhythm-track sync ----
let RT=null;
function rhythmTrack(file,title,lead){RT={file,lead:lead||0};try{music.src='assets/music/'+file;$('np').textContent='Now playing: '+title;started=true;music.currentTime=0;music.play().catch(()=>{})}catch(e){}}
function rhythmTime(fb){try{if(RT&&music.src.indexOf(RT.file)>=0&&!music.paused&&music.currentTime>0)return music.currentTime-RT.lead}catch(e){}return fb}
function rhythmEnd(){if(!RT)return;RT=null;load();if(started&&!muted)music.play().catch(()=>{})}
// ===== Coffeebreak Kids: Dance Party =====
const S=kStore('kidsDance',{best:0,look:{hair:0,top:0,bot:0,shoe:0,acc:0,stage:0}});const G={state:'title',score:S.stars,level:0};window.G=G;
const HAIR=['#5a3a1a','#ffd24a','#1a1a24','#e8603a','#ff6fae','#b06aff'],TOP=['#ff6fae','#40c8ff','#3ac060','#ffd24a','#b06aff','#ff8a3d'],BOT=['#3a7ad8','#ff6fae','#2a2a3a','#ffffff','#b06aff','#3ac060'],SHOE=['#ffffff','#e8303a','#2a2a2a','#ffd24a','#ff6fae'],ACC=['None','👑','🎀','🕶️','🎧','⭐'],STG=[['Disco','#3a0a5a','#ff4f9a'],['Beach','#40c8ff','#ffe08a'],['Space','#0a0a3a','#b06aff'],['Rainbow','#ffd6ec','#40c8ff'],['Under the sea','#0a4a7a','#40e8c8']];
const DIRS=['left','down','up','right'],ARR=['⬅️','⬇️','⬆️','➡️'],DCOL=['#ff6fae','#40c8ff','#3ac060','#ffd24a'];
let notes=[],tm=0,bpm=96,speed=1,score=0,combo=0,maxc=0,hits=0,miss=0,move=null,fb=null,dur=60,lvl=0;
let songSel=0;const RHY=window.RHYMES||[];
const LVL=[['Easy',80,.5],['Medium',100,.75],['Hard',124,1]];
function start(l){lvl=l;bpm=LVL[l][1];notes=[];const beat=60/bpm;dur=DEMO?30:60;for(let b=4;b*beat<dur;b++){const r=Math.random();if(r<LVL[l][2]||b%2===0)notes.push({t:b*beat,d:(b*7+Math.random()*4|0)%4,hit:0})}tm=-1;score=0;combo=0;maxc=0;hits=0;miss=0;G.state='play';if(songSel>0&&RHY[songSel-1]){const R=RHY[songSel-1],gap=[.6,.35,.2][l];notes=[];let lt=-9;R.chart.forEach(c2=>{const tt=c2[0]-2;if(tt>=1&&tt<dur&&tt-lt>=gap){notes.push({t:tt,d:c2[1],hit:0});lt=tt}});rhythmTrack(R.file,R.title,2.0);return}rhythmTrack(['kids-sunny-day-bounce.mp3','kids-jellybean-jive.mp3','kids-rocket-pop-party.mp3'][l],['Sunny Day Bounce','Jellybean Jive','Rocket Pop Party'][l],1.0)}
const TY=120,SPD=320;
function press(d){if(G.state!=='play')return;move={d,t:0};let best=null,bd=.2;notes.forEach(n=>{if(!n.hit&&n.d===d){const e=Math.abs(n.t-tm);if(e<bd){bd=e;best=n}}});
 if(best){best.hit=1;hits++;combo++;maxc=Math.max(maxc,combo);const p=bd<.07?'PERFECT!':bd<.13?'GREAT!':'GOOD';score+=(bd<.07?100:bd<.13?70:40)*(1+Math.floor(combo/10)*.5);fb={s:p,t:0,c:DCOL[d]};kTone(440+d*110,.08,.05,'triangle')}else{combo=0}}
function end(){rhythmEnd();G.state='done';const acc=notes.length?hits/notes.length:0;const st=acc>.85?3:acc>.6?2:acc>.3?1:0;if(st)reward(S,st,st===3?'Dance superstar!':'Great dancing!');S.best=Math.max(S.best,score|0);S.save();G.level++;speak(st>=2?'Amazing dancing!':'Good try! Keep dancing!');
 if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Great moves! The full game has 3 levels, full-length 60-second dances, all outfits, accessories and 5 stages.'),2600)}
function dancer(X,Y,s){const L=S.look;let ax=0,ay=0,lean=0,la=0,ra=0,jump=0;if(move&&move.t<.35){const k=Math.sin(move.t/.35*Math.PI);if(move.d===0){lean=-.25*k;la=-1.2*k}if(move.d===3){lean=.25*k;ra=-1.2*k}if(move.d===2){jump=-30*k;la=ra=-1.5*k}if(move.d===1){ay=14*k}}else{lean=Math.sin(t*4)*.06}
 x.save();x.translate(X,Y+jump+ay);x.scale(s,s);x.rotate(lean);const sk='#f4c8a0';
 x.strokeStyle=BOT[L.bot];x.lineWidth=18;x.lineCap='round';x.beginPath();x.moveTo(-12,40);x.lineTo(-18-ay*.5,110);x.moveTo(12,40);x.lineTo(18+ay*.5,110);x.stroke();x.fillStyle=SHOE[L.shoe];x.beginPath();x.ellipse(-22-ay*.5,114,14,8,0,0,7);x.ellipse(22+ay*.5,114,14,8,0,0,7);x.fill();
 x.fillStyle=BOT[L.bot];rr(-24,30,48,22,6);x.fill();x.fillStyle=TOP[L.top];rr(-26,-30,52,64,14);x.fill();
 x.strokeStyle=sk;x.lineWidth=12;x.beginPath();x.moveTo(-24,-22);x.lineTo(-24+Math.cos(2.2+la)*40,-22+Math.sin(2.2+la)*40*(la?-1:1));x.moveTo(24,-22);x.lineTo(24+Math.cos(.9-ra)*40,-22+Math.sin(.9-ra)*40*(ra?-1:1));x.stroke();
 x.fillStyle=HAIR[L.hair];x.beginPath();x.arc(0,-62,30,0,7);x.fill();x.fillStyle=sk;x.beginPath();x.arc(0,-56,25,0,7);x.fill();x.fillStyle=HAIR[L.hair];x.beginPath();x.arc(0,-66,26,Math.PI,0);x.fill();
 x.fillStyle='#2a2a3a';x.beginPath();x.arc(-9,-56,3.5,0,7);x.arc(9,-56,3.5,0,7);x.fill();x.strokeStyle='#c8304a';x.lineWidth=2.5;x.beginPath();x.arc(0,-48,7,.2,Math.PI-.2);x.stroke();x.fillStyle='rgba(255,100,130,.4)';x.beginPath();x.arc(-15,-48,5,0,7);x.arc(15,-48,5,0,7);x.fill();
 if(L.acc)emo(ACC[L.acc],0,L.acc===3?-58:-92,L.acc===3?30:34);x.restore()}
function stageBg(){const st=STG[S.look.stage];const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,st[1]);g.addColorStop(1,st[2]);x.fillStyle=g;x.fillRect(0,0,900,600);for(let i=0;i<8;i++){x.fillStyle='hsla('+((i*45+t*60)%360)+',90%,65%,.25)';x.beginPath();x.moveTo(100+i*100,0);x.lineTo(60+i*100+Math.sin(t+i)*80,600);x.lineTo(140+i*100+Math.sin(t+i)*80,600);x.fill()}
 x.fillStyle='rgba(255,255,255,.15)';for(let i=0;i<9;i++)for(let j=0;j<2;j++){if((i+j+Math.floor(t*2))%2)x.fillRect(i*100,500+j*50,100,50)}}
function drawPlay(){stageBg();dancer(170,360,1.6);seal(170,520,.5,'wave');
 DIRS.forEach((d,i)=>{const X=380+i*120;x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(X,TY,44,0,7);x.fill();x.strokeStyle=DCOL[i];x.lineWidth=5;x.stroke();x.globalAlpha=.5;emo(ARR[i],X,TY,50);x.globalAlpha=1});
 notes.forEach(n=>{if(n.hit)return;const y=TY+(n.t-tm)*SPD;if(y<-50||y>620)return;const X=380+n.d*120;x.fillStyle=DCOL[n.d];x.beginPath();x.arc(X,y,40,0,7);x.fill();emo(ARR[n.d],X,y,46)});
 DIRS.forEach((d,i)=>kb('pad'+i,330+i*120,480,100,100,ARR[i],()=>press(i),{bg:DCOL[i],fs:50}));
 x.fillStyle='rgba(255,255,255,.85)';rr(14,10,250,70,16);x.fill();T('Score '+(score|0),30,40,24,'#ff4f9a');T('Combo x'+combo,30,68,18,'#3a7ad8');x.fillStyle='rgba(255,255,255,.4)';rr(330,200,480,10,5);x.fill();x.fillStyle='#ffd24a';rr(330,200,480*Math.max(0,Math.min(1,tm/dur)),10,5);x.fill();
 if(fb&&fb.t<.6){x.save();x.translate(600,270);x.scale(1+fb.t,1+fb.t);x.globalAlpha=1-fb.t/.6;T(fb.s,0,0,40,fb.c,'center');x.restore();x.globalAlpha=1}}
function drawDress(){stageBg();dancer(220,330,2.1);T('Dress Up!',620,60,40,'#fff','center');
 const rows=[['Hair',HAIR,'hair'],['Top',TOP,'top'],['Pants',BOT,'bot'],['Shoes',SHOE,'shoe']];rows.forEach((r,j)=>{T(r[0],420,118+j*70,20,'#fff');r[1].forEach((c2,i)=>{const lk=DEMO&&i>1;kb('d'+j+i,500+i*62,90+j*70,54,46,lk?'🔒':'',()=>{if(lk){window.demoEnd&&window.demoEnd('All outfits are in the full game!');return}S.look[r[2]]=i;S.save()},{bg:c2,sel:S.look[r[2]]===i})})});
 T('Extras',420,398,20,'#fff');ACC.forEach((a,i)=>kb('ac'+i,500+i*62,370,54,46,i?a:'✖',()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All accessories are in the full game!');return}S.look.acc=i;S.save()},{bg:'#fff',fg:'#2a3a5a',sel:S.look.acc===i,fs:24}));
 T('Stage',420,468,20,'#fff');STG.forEach((s2,i)=>kb('st'+i,500+i*76,440,70,46,'',()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All 5 stages are in the full game!');return}S.look.stage=i;S.save()},{bg:s2[2],sel:S.look.stage===i}));
 kb('ok',560,510,200,60,'💃 Dance!',()=>{G.state='menu'},{bg:'#ff6fae'})}
function drawMenu(){stageBg();dancer(180,330,1.8);T('Pick your level',600,80,40,'#fff','center');LVL.forEach((l,i)=>kb('l'+i,450,120+i*90,300,72,(DEMO&&i>0?'🔒 ':'')+l[0]+' · '+l[1]+' bpm',()=>{if(DEMO&&i>0){window.demoEnd&&window.demoEnd('Medium and Hard levels are in the full game!');return}start(i)},{bg:['#3ac060','#4ab0e8','#ff6fae'][i],fs:24}));
 kb('dr',450,400,140,60,'👗 Dress up',()=>{G.state='dress'},{bg:'#b06aff',fs:20});kb('sk',610,400,140,60,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20});const sn=songSel?RHY[songSel-1].title:'Party tune (matches level)';kb('sg',450,470,300,52,'🎵 '+(sn.length>24?sn.slice(0,23)+'…':sn),()=>{songSel=(songSel+1)%(RHY.length+1)},{bg:'#3a7ad8',fs:15});T('Tap to change song',600,540,15,'#fff','center','');T('Best score: '+S.best,600,568,18,'#fff','center')}
function drawDone(){stageBg();dancer(200,330,1.8);const acc=notes.length?hits/notes.length:0;T('Dance complete!',600,120,44,'#fff','center');T('Score '+(score|0),600,190,32,'#ffd24a','center');T('Hits '+hits+' / '+notes.length+'  ·  Best combo '+maxc,600,240,22,'#fff','center');T(['😊','⭐','⭐⭐','⭐⭐⭐'][acc>.85?3:acc>.6?2:acc>.3?1:0],600,310,48,'#fff','center');
 kb('a',440,380,170,60,'🔁 Again',()=>start(lvl),{bg:'#3ac060'});kb('m',630,380,170,60,'🎵 Levels',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){stageBg();dancer(250,340,1.8);seal(680,430,1,'wave');T('Coffeebreak Kids',600,110,34,'#fff','center');T('Dance Party',600,180,64,'#ffd24a','center');kb('go',480,250,240,70,'💃 Let\'s dance!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
addEventListener('keydown',e=>{const k={ArrowLeft:0,ArrowDown:1,ArrowUp:2,ArrowRight:3}[e.key];if(k!==undefined){e.preventDefault();press(k)}});
bindInput({});
function update(dt){if(move)move.t+=dt;if(fb)fb.t+=dt;if(G.state==='play'){tm=rhythmTime(tm+dt);notes.forEach(n=>{if(!n.hit&&tm-n.t>.2){n.hit=-1;miss++;combo=0}});if(tm>dur+1)end()}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawPlay();else if(s==='dress')drawDress();else if(s==='done')drawDone();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KD={G,S,start,press,end,get notes(){return notes},get tm(){return tm}};startLoop();
