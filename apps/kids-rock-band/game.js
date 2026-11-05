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
// ===== Coffeebreak Kids: Rock Band =====
const S=kStore('kidsRock',{best:{},look:{stage:0,c1:0,c2:1,c3:2}});const G={state:'title',score:S.stars,level:0};window.G=G;
let AC=null;function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function nz(d,v,f,tp){const a=ac(),b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),q=b.getChannelData(0);for(let i=0;i<q.length;i++)q[i]=(Math.random()*2-1)*Math.pow(1-i/q.length,3);const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type=tp||'highpass';fl.frequency.value=f;const g=a.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start()}
function osc(f,d,v,tp,f2){const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=tp;o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d+.05)}
const DRUM=[['Kick','🥁',()=>osc(150,.4,.6,'sine',40)],['Snare','🪘',()=>{nz(.2,.4,1200);osc(200,.1,.15,'triangle')}],['Hi-hat','🔔',()=>nz(.06,.25,7000)],['Crash','💥',()=>nz(1.1,.3,4000)],['Tom','🛢️',()=>osc(110,.35,.4,'sine',70)],['Clap','👏',()=>{nz(.05,.3,1500,'bandpass');setTimeout(()=>nz(.08,.3,1500,'bandpass'),30)}]];
const CH=[['C',[130.8,196,261.6]],['G',[98,146.8,196]],['Am',[110,164.8,220]],['F',[87.3,130.8,174.6]],['D',[146.8,220,293.7]],['E',[82.4,123.5,164.8]]];
function chord(fs){fs.forEach((f,i)=>setTimeout(()=>{osc(f,1.2,.08,'sawtooth');osc(f*1.005,1.2,.05,'square')},i*18))}
const KEYS=[['C',261.6],['D',293.7],['E',329.6],['F',349.2],['G',392],['A',440],['B',493.9],['C',523.3],['D',587.3],['E',659.3]];
function key(f){osc(f,.9,.18,'triangle');osc(f*2,.5,.04,'sine')}
const INST=[['Drums','🥁','#ff6fae',[0,1,2,1],i=>DRUM[[0,1,2,3][i]][2]()],['Guitar','🎸','#ff8a3d',[0,1,2,3],i=>chord(CH[[0,1,2,3][i]][1])],['Keys','🎹','#40c8ff',[0,2,4,7],i=>key(KEYS[[0,2,4,7][i]][1])]];
const LCOL=['#ff6fae','#40c8ff','#3ac060','#ffd24a'],STG=[['Garage','#3a2a2a','#7a5a4a'],['Big Arena','#0a0a2a','#3a1a6a'],['Beach Festival','#ff9a5a','#ffe08a'],['Rainbow Stage','#ff6fae','#40c8ff']],OUT=['#ff6fae','#40c8ff','#3ac060','#ffd24a','#b06aff','#2a2a2a'];
let ri=0,songName='',inst=0,notes=[],tm=0,dur=45,hits=0,combo=0,score=0,fb=null,hitA=[0,0,0,0],song=0,freeI=0;
const RHY=window.RHYMES||[];const SONGS=[['Starry Rock',90,'0 0 2 2 3 3 2 . 1 1 0 0 3 3 2 . 0 0 2 2 3 3 2 . 1 1 0 0 3 3 2 .'],['Seal Stomp',110,'0 . 1 . 0 0 1 . 0 . 1 . 0 0 1 2 3 . 2 . 1 . 0 . 3 3 2 2 1 1 0 .'],['Rainbow Riff',126,'0 1 2 3 2 1 0 . 3 2 1 0 1 2 3 . 0 2 1 3 0 2 1 3 3 3 2 2 1 1 0 0']];
function start(i){song=i;const b=60/SONGS[i][1],pat=SONGS[i][2].split(' ');notes=[];let n=0;for(let k=0;k*b<dur;k++){const v=pat[k%pat.length];if(v!=='.')notes.push({t:2+k*b,l:+v,hit:0})}notes=notes.filter(n=>n.t<(DEMO?22:dur));tm=0;hits=0;combo=0;score=0;G.state='play';songName=SONGS[i][0];rhythmTrack(['kids-starry-rock.mp3','kids-seal-stomp.mp3','kids-rainbow-riff.mp3'][i],SONGS[i][0],0)}
function startR(k){const R=RHY[k];song=3+k;songName=R.title;notes=[];let lt=-9;R.chart.forEach(c2=>{if(c2[0]<(DEMO?22:dur)&&c2[0]-lt>=.25){notes.push({t:c2[0],l:c2[1],hit:0});lt=c2[0]}});tm=0;hits=0;combo=0;score=0;G.state='play';rhythmTrack(R.file,R.title,0)}
const TY=470,SP=300,LX=i=>360+i*110;
function hitL(l){INST[inst][4](l);hitA[l]=.2;if(G.state!=='play')return;let best=null,bd=.22;notes.forEach(n=>{if(!n.hit&&n.l===l&&Math.abs(n.t-tm)<bd){bd=Math.abs(n.t-tm);best=n}});if(best){best.hit=1;hits++;combo++;score+=(bd<.08?100:60)*(1+Math.floor(combo/8)*.5);fb={s:bd<.08?'ROCK ON!':'NICE!',t:0}}else combo=0}
function end(){rhythmEnd();G.state='done';const acc=notes.length?hits/notes.length:0,st=acc>.85?3:acc>.6?2:acc>.3?1:0;if(st)reward(S,st,st===3?'Rock legend!':'You rock!');S.best[song]=Math.max(S.best[song]||0,score|0);S.save();G.level++;if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('You rock! The full game has 3 songs on drums, guitar and keys, full-length tracks, every stage and outfit.'),2600)}
function stage(){const s=STG[S.look.stage];const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,s[1]);g.addColorStop(1,s[2]);x.fillStyle=g;x.fillRect(0,0,900,600);for(let i=0;i<5;i++){x.fillStyle='hsla('+((i*70+t*50)%360)+',90%,60%,.22)';x.beginPath();x.moveTo(150+i*150,0);x.lineTo(80+i*150+Math.sin(t*1.5+i)*60,600);x.lineTo(220+i*150+Math.sin(t*1.5+i)*60,600);x.fill()}x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,560,900,40)}
function kid(X,Y,s,c,e){const b=Math.sin(t*8)*3;x.save();x.translate(X,Y+b);x.scale(s,s);x.fillStyle=c;rr(-22,-20,44,56,12);x.fill();x.strokeStyle='#3a5aa8';x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(-10,36);x.lineTo(-12,80);x.moveTo(10,36);x.lineTo(12,80);x.stroke();x.fillStyle='#f4c8a0';x.beginPath();x.arc(0,-44,22,0,7);x.fill();x.fillStyle='#2a2a3a';x.beginPath();x.arc(-7,-46,3,0,7);x.arc(7,-46,3,0,7);x.fill();x.strokeStyle='#c8304a';x.lineWidth=2;x.beginPath();x.arc(0,-38,6,.2,Math.PI-.2);x.stroke();x.fillStyle='#5a3a1a';x.beginPath();x.arc(0,-52,20,Math.PI,0);x.fill();emo(e,24,20,40);x.restore()}
function band(){kid(100,200,1,OUT[S.look.c1],'🥁');kid(190,230,1,OUT[S.look.c2],'🎸');kid(280,200,1,OUT[S.look.c3],'🎹');seal(190,350,.7,'wave');emo('🎤',230,330,30)}
function drawPlay(){stage();band();x.fillStyle='rgba(0,0,0,.35)';rr(300,0,450,600,0);x.fill();
 for(let l=0;l<4;l++){const X=LX(l);x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=2;x.beginPath();x.moveTo(X,0);x.lineTo(X,TY);x.stroke()}
 notes.forEach(n=>{if(n.hit)return;const y=TY-(n.t-tm)*SP;if(y<-40||y>620)return;x.fillStyle=LCOL[n.l];x.beginPath();x.ellipse(LX(n.l),y,44,18,0,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=3;x.stroke()});
 for(let l=0;l<4;l++){const lbl=inst===0?DRUM[[0,1,2,1][l]][0]:inst===1?CH[l][0]:KEYS[[0,2,4,7][l]][0];kb('l'+l,LX(l)-50,TY-30,100,70,lbl,()=>hitL(l),{bg:hitA[l]>0?'#fff':LCOL[l],fg:hitA[l]>0?LCOL[l]:'#fff',fs:20})}
 x.fillStyle='rgba(255,255,255,.85)';rr(14,10,230,70,16);x.fill();T('Score '+(score|0),30,40,24,'#ff4f9a');T(INST[inst][1]+' '+songName,30,68,16,'#3a7ad8');T('Keys: A S D F',525,585,14,'rgba(255,255,255,.7)','center','');
 if(fb&&fb.t<.6){x.globalAlpha=1-fb.t/.6;T(fb.s,525,250-fb.t*40,40,'#ffd24a','center');x.globalAlpha=1}}
function drawFree(){stage();band();const I=INST[freeI];T('Free play: '+I[0]+' '+I[1],600,60,32,'#fff','center');INST.forEach((it,i)=>kb('fi'+i,370+i*160,80,150,50,it[1]+' '+it[0],()=>{freeI=i},{sel:freeI===i,bg:it[2],fs:18}));
 if(freeI===0)DRUM.forEach((d,i)=>kb('dr'+i,370+(i%3)*165,150+Math.floor(i/3)*170,150,150,d[1],()=>{d[2]();hitA[0]=.2},{bg:LCOL[i%4],fs:60}));
 else if(freeI===1)CH.forEach((c2,i)=>kb('ch'+i,370+(i%3)*165,150+Math.floor(i/3)*170,150,150,c2[0],()=>chord(c2[1]),{bg:LCOL[i%4],fs:44}));
 else KEYS.forEach((k,i)=>{const X=340+i*52;BTN['k'+i]={x:X,y:170,w:50,h:280,fn:()=>{key(k[1]);hitA[i%4]=.15}};x.fillStyle='#fff';rr(X,170,50,280,8);x.fill();x.strokeStyle='#2a2a3a';x.stroke();T(k[0],X+25,430,20,'#2a3a5a','center');x.fillStyle=LCOL[i%4];x.beginPath();x.arc(X+25,400,8,0,7);x.fill()});
 kb('bk',370,500,200,56,'⬅ Back',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawMenu(){stage();band();T('Rock Band',600,60,44,'#fff','center');T('Pick your instrument',600,100,20,'#fff','center','');INST.forEach((it,i)=>kb('in'+i,380+i*150,115,140,56,it[1]+' '+it[0],()=>{if(DEMO&&i>0){window.demoEnd&&window.demoEnd('Guitar and keys are in the full game!');return}inst=i},{sel:inst===i,bg:it[2],fs:18}));
 SONGS.forEach((s2,i)=>kb('s'+i,400,178+i*62,400,54,(DEMO&&i>0?'🔒 ':'🎵 ')+s2[0]+(S.best[i]?'  ⭐'+S.best[i]:''),()=>{if(DEMO&&i>0){window.demoEnd&&window.demoEnd('All songs are in the full game!');return}start(i)},{bg:['#3ac060','#ff8a3d','#b06aff'][i],fs:22}));
 if(RHY.length){const R=RHY[ri%RHY.length];kb('rh',400,366,330,52,'🎶 '+(R.title.length>24?R.title.slice(0,23)+'…':R.title),()=>startR(ri%RHY.length),{bg:'#3a7ad8',fs:16});kb('rn',740,366,60,52,'▶',()=>{ri=(ri+1)%RHY.length},{bg:'#2a5ab8',fs:20})}
 kb('fp',380,430,150,56,'🎶 Free play',()=>{G.state='free'},{bg:'#ff6fae',fs:18});kb('ss',540,430,150,56,'🎨 Stage',()=>{G.state='look'},{bg:'#4ab0e8',fs:18});kb('sk',700,430,150,56,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:18})}
function drawLook(){stage();band();T('Stage & Outfits',600,60,36,'#fff','center');STG.forEach((s2,i)=>kb('st'+i,380+i*125,100,115,54,s2[0],()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All stages are in the full game!');return}S.look.stage=i;S.save()},{sel:S.look.stage===i,bg:s2[2],fs:13}));
 ['🥁 Drummer','🎸 Guitarist','🎹 Keys'].forEach((n,j)=>{T(n,380,210+j*80,20,'#fff');OUT.forEach((c2,i)=>kb('o'+j+i,520+i*58,182+j*80,50,46,'',()=>{S.look['c'+(j+1)]=i;S.save()},{bg:c2,sel:S.look['c'+(j+1)]===i}))});kb('bk',500,450,200,56,'✔ Done',()=>{G.state='menu'},{bg:'#3ac060'})}
function drawDone(){stage();band();T('Song complete!',600,120,44,'#fff','center');T('Score '+(score|0),600,190,32,'#ffd24a','center');T('Hit '+hits+' / '+notes.length,600,240,24,'#fff','center');kb('a',440,330,170,60,'🔁 Again',()=>start(song),{bg:'#3ac060'});kb('m',630,330,170,60,'🎵 Songs',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){stage();band();T('Coffeebreak Kids',600,120,34,'#fff','center');T('Rock Band',600,200,72,'#ffd24a','center');kb('go',480,270,240,70,'🎸 Let\'s rock!',()=>{ac();G.state='menu'},{bg:'#ff6fae',fs:28})}
addEventListener('keydown',e=>{const k='asdf'.indexOf(e.key.toLowerCase());if(k>=0)hitL(k)});bindInput({});
function update(dt){hitA=hitA.map(v=>Math.max(0,v-dt));if(fb)fb.t+=dt;if(G.state==='play'){tm=rhythmTime(tm+dt);notes.forEach(n=>{if(!n.hit&&tm-n.t>.25){n.hit=-1;combo=0}});if(notes.length&&tm>notes[notes.length-1].t+1.5)end()}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawPlay();else if(s==='free')drawFree();else if(s==='look')drawLook();else if(s==='done')drawDone();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KR={G,S,start,hitL,end,get notes(){return notes}};startLoop();
