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
// ---- Ghost Box ----
const WORDS=['hello','here','yes','no','coffee','rose','listen','behind you','friend','warm','cold','light','music','dance','smile','home','remember','sweet','marshmallow','candle','sing','hush','boo','hi there','welcome','peace','stay','goodnight','cat','garden','moon','kind','love','laugh','tea','follow','window','door','who','hmm','okay','thank you','again','closer','hide and seek'];
const QS=['Is anyone here?','What is your name?','Do you like music?','Are you friendly?','Give me a sign','What do you want to say?'];
const DEMO=()=>!!window.DEMO;
const G={state:'title',score:0,level:+localStorage.gbMax||0,on:false,freq:87.5,rate:3,emf:0,emfT:0,word:null,wordT:0,log:[],q:null,qT:0,sess:0,said:'Turn it on and ask a question…'};window.G=G;
let AC=null,noise,bp,gate,master,toneO,toneG;
function audio(){if(AC)return;AC=new (window.AudioContext||window.webkitAudioContext)();const n=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 noise=AC.createBufferSource();noise.buffer=n;noise.loop=true;bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;gate=AC.createGain();master=AC.createGain();master.gain.value=0;
 toneO=AC.createOscillator();toneO.type='sine';toneG=AC.createGain();toneG.gain.value=0;toneO.connect(toneG);toneG.connect(master);
 noise.connect(bp);bp.connect(gate);gate.connect(master);master.connect(AC.destination);noise.start();toneO.start()}
function power(){startMusic();audio();if(AC.state==='suspended')AC.resume();G.on=!G.on;master.gain.setTargetAtTime(G.on?.25:0,AC.currentTime,.05);G.said=G.on?'Sweeping the frequencies… ask a question.':'Ghost box off.';G.state=G.on?'play':'idle';if(G.on&&music&&!music.paused)music.volume=.35;else music.volume=1}
function ask(q){if(!G.on){G.said='Switch it on first.';return}G.q=q;G.qT=6;G.said='“'+q+'”… listening…'}
bindInput({});
function word(){const w=WORDS[Math.random()*WORDS.length|0];G.word=w;G.wordT=3;G.log.unshift(w);G.log=G.log.slice(0,8);G.score++;if(G.score>G.level){G.level=G.score;localStorage.gbMax=G.level}G.emf=Math.max(G.emf,3.5+Math.random()*1.5);
 if(AC){toneO.frequency.setValueAtTime(300+Math.random()*500,AC.currentTime);toneG.gain.setValueAtTime(.0,AC.currentTime);toneG.gain.linearRampToValueAtTime(.12,AC.currentTime+.1);toneG.gain.linearRampToValueAtTime(0,AC.currentTime+.9)}
 if('speechSynthesis'in window&&G.voice){const u=new SpeechSynthesisUtterance(w);u.rate=.6;u.pitch=.4;u.volume=.6;speechSynthesis.speak(u)}}
let stepT=0;
function update(dt){if(G.wordT>0)G.wordT-=dt;if(G.qT>0)G.qT-=dt;
 if(!G.on){G.emf+=(0-G.emf)*dt*2;return}
 G.sess+=dt;if(DEMO()&&G.sess>60){power();demoEnd('Your 60-second free ghost box session has ended. Unlimited sessions, the voice option and the full word bank are in the full game.');return}
 stepT-=dt;if(stepT<=0){stepT=1/(G.rate*4);G.freq+=.2;if(G.freq>108)G.freq=87.5;if(AC){bp.frequency.setValueAtTime(400+Math.random()*3000,AC.currentTime);gate.gain.setValueAtTime(.4+Math.random()*.6,AC.currentTime);gate.gain.setTargetAtTime(.05,AC.currentTime+.03,.02)}}
 G.emfT-=dt;if(G.emfT<=0){G.emfT=.15;G.emf+=(Math.random()-.5)*.6;G.emf+=(.8-G.emf)*.05;if(Math.random()<.01)G.emf=2+Math.random()*2}G.emf=Math.max(0,Math.min(5,G.emf-dt*.2));
 const ch=(G.qT>0?.35:.08)*dt;if(Math.random()<ch&&G.wordT<=0)word()}
function draw(){x.fillStyle='#0a0408';x.fillRect(0,0,W,H);for(let i=0;i<H;i+=3){x.fillStyle='rgba(255,255,255,'+(G.on?.015+Math.random()*.02:.008)+')';x.fillRect(0,i,W,1)}
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#ff6a8a';x.font='bold 52px Georgia';x.fillText('📻 Coffeebreak Ghost Box',W/2,140);x.fillStyle='#ffe9c7';x.font='19px Georgia';x.fillText('A spooky, playful spirit-box: sweeping radio static, a flickering EMF meter',W/2,190);x.fillText('and mysterious words drifting through the noise. Turn the volume up!',W/2,218);
  emo('👻',W/2,310,100);button('st',W/2-110,400,220,56,'▶ Start',()=>{G.state='idle';power()});x.fillStyle='#ffcf6a';x.font='15px Georgia';x.fillText('Most words in one session: '+G.level,W/2,490);ent();return}
 // radio
 x.fillStyle='#3a1a1a';rr(60,70,520,300,26);x.fill();x.strokeStyle='#8a4a3a';x.lineWidth=4;x.stroke();x.fillStyle='#1a0a08';rr(90,95,460,90,10);x.fill();
 x.fillStyle='#ffcf6a';x.font='10px monospace';x.textAlign='center';for(let f=88;f<=108;f+=2){const px=100+(f-87.5)/20.5*440;x.fillRect(px,160,1,10);x.fillText(f,px,180)}
 const nx=100+(G.freq-87.5)/20.5*440;x.fillStyle='#ff3a3a';x.fillRect(nx-1,100,3,78);x.fillStyle=G.on?'#7fff9a':'#335533';x.font='bold 34px monospace';x.fillText(G.on?G.freq.toFixed(1)+' FM':'— OFF —',320,145);
 for(let i=0;i<8;i++)for(let j=0;j<5;j++){x.fillStyle='#2a1010';x.beginPath();x.arc(120+i*26,230+j*24,8,0,7);x.fill()}
 x.fillStyle='#c8a040';x.beginPath();x.arc(420,270,50,0,7);x.fill();x.save();x.translate(420,270);x.rotate(G.rate*.8);x.fillStyle='#3a1a1a';x.fillRect(-4,-46,8,30);x.restore();x.fillStyle='#ffe9c7';x.font='13px Georgia';x.fillText('sweep speed '+G.rate,420,345);
 button('pw',490,210,70,40,G.on?'⏻ ON':'⏻ OFF',power,{sel:G.on});button('sl',350,345,26,22,'−',()=>G.rate=Math.max(1,G.rate-1),{fs:14});button('sf',465,345,26,22,'+',()=>G.rate=Math.min(8,G.rate+1),{fs:14});
 // EMF
 x.fillStyle='#1a1a1a';rr(620,70,240,300,20);x.fill();x.strokeStyle='#555';x.stroke();x.fillStyle='#ffe9c7';x.font='bold 16px monospace';x.fillText('EMF METER',740,100);
 const LC=['#3aff6a','#a0ff3a','#ffe03a','#ff9a3a','#ff3a3a'];for(let i=0;i<5;i++){const on=G.emf>i+.3;x.fillStyle=on?LC[i]:'#2a2a2a';x.beginPath();x.arc(740,330-i*50,16,0,7);x.fill();if(on){x.globalAlpha=.3;x.beginPath();x.arc(740,330-i*50,28,0,7);x.fill();x.globalAlpha=1}}
 x.fillStyle='#999';x.font='12px monospace';x.fillText(G.emf.toFixed(1)+' mG',740,360);
 // word
 if(G.wordT>0){x.globalAlpha=Math.min(1,G.wordT);x.fillStyle='#ff9ab0';x.shadowColor='#ff3a6a';x.shadowBlur=20;x.font='bold '+(54+Math.random()*4)+'px Georgia';x.textAlign='center';x.fillText('“'+G.word+'”',W/2+(Math.random()-.5)*4,440);x.shadowBlur=0;x.globalAlpha=1}
 x.fillStyle='#ffe9c7';x.font='italic 15px Georgia';x.textAlign='left';x.fillText('Heard: '+G.log.join(' · '),60,478);
 QS.forEach((q,i)=>button('q'+i,60+(i%3)*270,490+(i/3|0)*44,258,38,q,()=>ask(q),{fs:15}));
 button('vc',486,262,80,30,G.voice?'🗣 Voice on':'🗣 Voice',()=>{if(DEMO()){G.said='The spooky voice is in the full game.';return}G.voice=!G.voice},{fs:12,sel:G.voice});
 x.textAlign='center';x.fillStyle='#ffe9ef';x.font='italic 16px Georgia';x.fillText(G.said+(DEMO()&&G.on?'   ('+Math.max(0,60-G.sess|0)+'s left in demo)':''),W/2,40);ent()}
startLoop();
