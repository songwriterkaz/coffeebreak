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
// ===== Coffeebreak Kids: Playground Games =====
const S=kStore('kidsPlay',{best:{}});const G={state:'title',score:S.stars,level:0};window.G=G;
const GM=[['rps','✊ Rock Paper Scissors'],['hop','🔢 Hopscotch'],['simon','🗣️ Simon Says'],['tag','🏃 Tag'],['hide','🙈 Hide and Seek'],['light','🚦 Red Light Green Light'],['wolf','🐺 What\'s the Time Mr Wolf?'],['duck','🦆 Duck Duck Goose'],['chairs','🪑 Musical Chairs'],['elastic','🎗️ Elastics'],['parcel','🎁 Pass the Parcel']];
const NG=DEMO?3:GM.length;const dEnd='What fun! The full game has all 11 playground games: Tag, Hide and Seek, Red Light Green Light, What\'s the Time Mr Wolf?, Duck Duck Goose, Musical Chairs, Elastics and Pass the Parcel too.';
let g=null,msg='',msgT=0,P={x:450,y:400},tune=null;
function toast(m,d){msg=m;msgT=d||2}
function win(n,txt){reward(S,n||2,txt||'You win!');g.over='win'}
function lose(txt){oops();g.over='lose';toast(txt||'Oh no! Try again!',2.5)}
function startTune(){stopTune();const N=[523,587,659,523,659,698,784,0,784,880,784,698,659,523];let i=0;tune=setInterval(()=>{const f=N[i++%N.length];if(f)kTone(f,.18,.05,'square')},220)}
function stopTune(){if(tune)clearInterval(tune);tune=null}
function kid(X,Y,e,s){emo(e,X,Y+Math.sin(t*8+X)*3,s||50)}
function start(k){stopTune();g={k,t:0,over:null};P={x:450,y:400};G.state='play';
 if(k==='rps')Object.assign(g,{me:0,su:0,pick:null,sp:null});
 if(k==='hop'){g.stone=1+Math.floor(Math.random()*9);g.next=1;if(g.next===g.stone)g.next++}
 if(k==='simon'){g.score=0;g.lives=3;nextSimon()}
 if(k==='tag')Object.assign(g,{sx:100,sy:100,left:20});
 if(k==='hide'){const spots=[[150,300,'🌳'],[330,260,'🛝'],[520,320,'📦'],[700,280,'🌳'],[240,460,'🪣'],[440,470,'🛞'],[640,470,'🧺'],[800,440,'🌲']];spots.sort(()=>Math.random()-.5);g.spots=spots.map((s,i)=>({x:s[0],y:s[1],e:s[2],kid:i<5?['🧒','👧','👦','🧒🏽','👧🏾'][i]:null,open:false}));g.left=30;g.found=0}
 if(k==='light')Object.assign(g,{pos:0,green:true,sw:2+Math.random()*2,go:false});
 if(k==='wolf')Object.assign(g,{steps:0,say:'',dinner:false,dt:0});
 if(k==='duck')Object.assign(g,{i:0,goose:3+Math.floor(Math.random()*6),phase:'walk',taps:0,race:0,su:0});
 if(k==='chairs'){Object.assign(g,{n:5,chairs:4,playing:true,until:3+Math.random()*4,stopT:0});startTune()}
 if(k==='elastic')Object.assign(g,{lv:0,beat:0,hits:0,bt:0,hitThis:false});
 if(k==='parcel'){Object.assign(g,{layers:6,holder:0,playing:true,until:2+Math.random()*3});startTune()}}
// --- per-game ---
const HOPS=[[450,520],[450,460],[410,400],[490,400],[450,340],[410,280],[490,280],[450,220],[410,160],[490,160]];
const SIMON=[['touch your nose','👃'],['clap your hands','👏'],['put your hands up','🙌'],['stomp your feet','🦶'],['wave hello','👋']];
function nextSimon(){const c=SIMON[Math.floor(Math.random()*SIMON.length)];g.cmd=c;g.simon=Math.random()<.65;g.ct=2.6;g.done=false;speak((g.simon?'Simon says ':'')+c[0])}
function simonTap(i){if(g.done||g.over)return;g.done=true;if(g.simon&&SIMON[i]===g.cmd){g.score++;yay();toast('Yes! ✅',1)}else{g.lives--;oops();toast(g.simon?'Wrong move!':'Simon didn\'t say! 😜',1.5)}setTimeout(()=>{if(g.lives<=0)lose('Out! Score: '+g.score);else if(g.score>=8)win(3,'Simon champ!');else nextSimon()},1200)}
const LV=['Ankles','Knees','Hips','Waist','Under arms'];
const JOKES=['Why did the seal cross the beach? To get to the other tide!','What do you call a sleeping dinosaur? A dino-snore!','Why are fish so smart? They live in schools!','What do koalas call their friends? Bear-y good mates!','How does the ocean say hi? It waves!'];
function drawGame(){const k=g.k;kbg(['#c8f0ff','#e0ffd8','#fff3c4','#ffe0f0'][GM.findIndex(z=>z[0]===k)%4],'#ffffff');x.fillStyle='rgba(255,255,255,.9)';rr(14,10,520,40,20);x.fill();T(GM.find(z=>z[0]===k)[1],30,38,20,'#3a7ad8');kb('bk',770,62,120,50,'⬅',()=>{stopTune();G.state='menu'},{bg:'#a0a8c0'});
 if(k==='rps'){seal(650,260,1.1,g.sp!==null&&g.pick!==null&&g.res==='su'?'wave':undefined);emo('🧒',250,260,110);T('You '+g.me+'  –  '+g.su+' Sunny',450,110,30,'#ff4f9a','center');T('First to 3 wins!',450,140,18,'#7a4a8a','center','');
  if(g.pick!==null){emo(['✊','✋','✌️'][g.pick],330,260,70);emo(['✊','✋','✌️'][g.sp],560,200,70);T(g.res==='me'?'You win the round!':g.res==='su'?'Sunny wins the round!':'Draw!',450,380,26,'#3a7ad8','center')}
  if(!g.over)['✊ Rock','✋ Paper','✌️ Scissors'].forEach((l,i)=>kb('r'+i,120+i*230,440,210,80,l,()=>{g.pick=i;g.sp=Math.floor(Math.random()*3);const d=(i-g.sp+3)%3;g.res=d===0?'draw':d===1?'me':'su';if(g.res==='me'){g.me++;yay()}else if(g.res==='su'){g.su++;oops()}else kTone(440,.1);if(g.me>=3)win(2,'You beat Sunny!');if(g.su>=3)lose('Sunny wins! Rematch?')},{bg:['#ff6fae','#4ab0e8','#3ac060'][i],fs:24}))}
 if(k==='hop'){T('A stone landed on '+g.stone+'. Hop 1 to 10 but SKIP the stone!',450,95,20,'#2a3a5a','center');HOPS.forEach((h,i)=>{const n=i+1,done=n<g.next&&n!==g.stone;kb('h'+n,h[0]-38,h[1]-28,76,56,''+n,()=>{if(g.over)return;if(n===g.next){kTone(400+n*50,.12,.06,'triangle');g.next++;if(g.next===g.stone)g.next++;if(g.next>10)win(2,'Hop hop hooray!')}else{lose(n===g.stone?'You stepped on the stone!':'Wrong square!')}},{bg:done?'#3ac060':'#ff8a3d',fs:24});if(n===g.stone)emo('🪨',h[0]+26,h[1]-18,26)});if(g.next<=10)emo('🦶',HOPS[g.next-1][0]-60,HOPS[g.next-1][1],30)}
 if(k==='simon'){seal(180,260,1,'wave');T('Score '+g.score+'/8   '+'❤️'.repeat(Math.max(0,g.lives)),450,95,22,'#ff4f9a','center');bubbleK((g.simon?'Simon says ':'')+g.cmd[0]+'!',300,150,520);x.fillStyle='#ddd';rr(300,250,520,14,7);x.fill();x.fillStyle='#ff8a3d';rr(300,250,520*Math.max(0,g.ct/2.6),14,7);x.fill();
  SIMON.forEach((c,i)=>kb('s'+i,60+i*165,400,150,90,c[1],()=>simonTap(i),{bg:'#4ab0e8',fs:44}));T('If Simon didn\'t say, don\'t move!',450,540,18,'#7a4a8a','center','')}
 if(k==='tag'){x.fillStyle='#8ad870';x.fillRect(0,120,900,480);kid(P.x,P.y,'🧒',56);seal(g.sx-30,g.sy-20,.6);T('Sunny is IT! Don\'t get tagged: '+Math.ceil(g.left)+'s',450,100,22,'#ff4f9a','center')}
 if(k==='hide'){x.fillStyle='#8ad870';x.fillRect(0,200,900,400);T('Find 5 hiding kids! '+g.found+'/5 · '+Math.ceil(g.left)+'s',450,100,22,'#ff4f9a','center');g.spots.forEach((s,i)=>{if(s.open&&s.kid)kid(s.x+40,s.y,s.kid,46);else if(s.kid&&Math.sin(t*2+i)>.85)emo('👀',s.x+28,s.y-30,18);emo(s.e,s.x,s.y,90);BTN['sp'+i]={x:s.x-50,y:s.y-50,w:100,h:100,fn:()=>{if(s.open||g.over)return;s.open=true;if(s.kid){g.found++;yay();speak('Found you!');if(g.found>=5)win(3,'Found everyone!')}else kTone(220,.1)}}})}
 if(k==='light'){x.fillStyle='#d8c8a8';x.fillRect(0,300,900,140);x.fillStyle='#fff';x.fillRect(820,300,8,140);emo('🏁',830,280,40);x.fillStyle='#333';rr(60,80,70,150,14);x.fill();x.fillStyle=g.green?'#333':'#ff3030';x.beginPath();x.arc(95,120,24,0,7);x.fill();x.fillStyle=g.green?'#30e050':'#333';x.beginPath();x.arc(95,190,24,0,7);x.fill();
  T(g.green?'GREEN LIGHT! Go go go!':'RED LIGHT! Freeze!',450,120,30,g.green?'#2ab060':'#e02020','center');kid(80+g.pos*720,370,'🏃',60);seal(860,230,.6);kb('go',300,470,300,90,g.go?'🏃 Running…':'👆 Hold to run',()=>{g.go=true},{bg:'#3ac060',fs:26})}
 if(k==='wolf'){x.fillStyle='#8ad870';x.fillRect(0,300,900,300);emo('🐺',780,320,110);kid(120+g.steps*55,420,'🧒',60);bubbleK(g.say||'Ask the wolf what time it is!',360,120,400);
  if(!g.dinner&&!g.over)kb('ask',80,500,380,70,'🕐 What\'s the time Mr Wolf?',()=>{if(Math.random()<.22&&g.steps>2){g.dinner=true;g.say='DINNER TIME! 🍽️ RUN!';g.dt=1.3;speak('Dinner time!')}else{const n=1+Math.floor(Math.random()*3);g.say=n+' o\'clock!';speak(n+' o clock');g.steps+=n;kTone(500,.1);if(g.steps>=11)win(2,'You tagged Mr Wolf!')}},{bg:'#ff8a3d',fs:20});
  if(g.dinner)kb('run',480,500,340,70,'🏃 RUN HOME!',()=>{if(g.dt>0){g.dinner=false;g.steps=0;g.say='Phew! You made it home. Try again!';yay()}},{bg:'#e02020',fs:26})}
 if(k==='duck'){x.fillStyle='#8ad870';x.fillRect(0,120,900,480);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;kid(450+Math.cos(a)*220,340+Math.sin(a)*150,i===3?'🧒':['👧','👦','🧒🏽','👧🏾','👦🏼','👧🏻','🧒🏿'][i%7],46)}if(g.i===3&&g.phase==='walk')T('⬅ you',540,330,16,'#2a3a5a');const a=g.i/8*Math.PI*2;seal(450+Math.cos(a)*280-20,330+Math.sin(a)*190,.5);
  if(g.phase==='walk')T(g.say||'Duck…',450,120,30,'#3a7ad8','center');if(g.phase==='race'){T('GOOSE! Tap fast to race Sunny round the circle!',450,110,22,'#e02020','center');x.fillStyle='#ddd';rr(200,135,500,20,10);x.fill();x.fillStyle='#3ac060';rr(200,135,500*Math.min(1,g.race),20,10);x.fill();x.fillStyle='#ff6fae';rr(200,160,500*Math.min(1,g.su),12,6);x.fill();kb('tap',330,500,240,80,'🏃 TAP!',()=>{g.race+=.07;kTone(600+g.race*300,.05)},{bg:'#e02020',fs:30})}}
 if(k==='chairs'){x.fillStyle='#ffe8c8';x.fillRect(0,120,900,480);T(g.playing?'🎵 Walk around… 🎵':'MUSIC STOPPED! Grab a chair!',450,110,28,g.playing?'#b06aff':'#e02020','center');T('Players: '+g.n+'  Chairs: '+g.chairs,450,145,18,'#7a4a8a','center','');
  for(let i=0;i<g.chairs;i++){const X=450-(g.chairs-1)*70+i*140;emo('🪑',X,350,70);BTN['c'+i]={x:X-45,y:300,w:90,h:100,fn:()=>{if(g.playing){lose('Too early! The music was still playing.');stopTune();return}if(g.over)return;if(g.stopT<1.1){yay();g.n--;g.chairs--;if(g.chairs<1)win(3,'Musical chairs champion!');else{g.playing=true;g.until=3+Math.random()*4;g.stopT=0;startTune();toast('You got a chair! Next round…',1.5)}}else lose('Too slow! Someone grabbed it.')}}}
  if(g.playing)for(let i=0;i<g.n;i++){const a=t*1.2+i/g.n*Math.PI*2;kid(450+Math.cos(a)*330,350+Math.sin(a)*130,i===0?'🧒':['👧','👦','🧒🏽','👧🏾'][i%4],44)}}
 if(k==='elastic'){T('Level: '+LV[g.lv]+'  ·  hits '+g.hits+'/8 (need 6)',450,100,22,'#ff4f9a','center');const hy=[480,420,370,340,300][g.lv];x.strokeStyle='#ff4fb0';x.lineWidth=6;x.beginPath();x.moveTo(150,hy);x.lineTo(750,hy);x.stroke();kid(150,400,'🧍‍♀️',90);kid(750,400,'🧍',90);
  const ph=g.bt%1;const jump=g.hitThis&&ph<.5;kid(450,(jump?300:440),'🤸',80);const moves=['IN','OUT','ON','IN-OUT'];T(moves[g.beat%4],450,200,40,'#3a7ad8','center');x.fillStyle='#ffd24a';x.beginPath();x.arc(450,240,10+20*(1-ph),0,7);x.fill();
  kb('j',330,510,240,70,'🦘 JUMP!',()=>{const ph2=g.bt%1;if(!g.hitThis&&(ph2<.25||ph2>.8)){g.hitThis=true;g.hits++;kTone(880,.08,.06,'triangle')}else oops()},{bg:'#b06aff',fs:28})}
 if(k==='parcel'){x.fillStyle='#ffe0f0';x.fillRect(0,120,900,480);const pl=['🧒 You','👧 Mia','👦 Leo','🦭 Sunny','👧🏾 Zara'];pl.forEach((p,i)=>{const a=i/5*Math.PI*2-Math.PI/2;T(p,450+Math.cos(a)*250,340+Math.sin(a)*170,22,'#2a3a5a','center')});const a=g.holder/5*Math.PI*2-Math.PI/2;emo('🎁',450+Math.cos(a)*170,345+Math.sin(a)*100,40+g.layers*4);
  T(g.playing?'🎵 Pass the parcel… 🎵':g.holder===0?'The music stopped on YOU! Unwrap a layer!':'The music stopped on '+pl[g.holder].slice(3)+'!',450,110,24,'#b06aff','center');T('Layers left: '+g.layers,450,140,18,'#7a4a8a','center','');if(g.reveal)bubbleK(g.reveal,250,180,400);
  if(!g.playing&&!g.over)kb('un',300,500,300,70,g.holder===0?'🎁 Unwrap!':'▶ Keep passing',()=>{if(g.holder===0||Math.random()<1){g.layers--;kTone(900,.1);g.reveal=g.layers<=0?'🏆 The prize in the middle: a GOLD STAR!':(g.holder===0?(Math.random()<.5?'A sticker inside! 🌟':JOKES[Math.floor(Math.random()*JOKES.length)]):pl[g.holder].slice(3)+' found a joke: '+JOKES[Math.floor(Math.random()*JOKES.length)]);if(g.layers<=0){win(3,'Prize unwrapped!')}else{g.playing=true;g.until=2+Math.random()*3;startTune();if(g.layers===1)g.final=1}}},{bg:'#ff6fae',fs:24})}
 if(g.over)kb('again',300,250,300,70,g.over==='win'?'🎉 Play again':'🔁 Try again',()=>start(k),{bg:'#3ac060',fs:26})}
function update(dt){if(msgT>0)msgT-=dt;if(G.state!=='play'||!g||g.over)return;g.t+=dt;const k=g.k;
 if(k==='simon'&&!g.done){g.ct-=dt;if(g.ct<=0){g.done=true;if(g.simon){g.lives--;oops();toast('Too slow!',1)}else{g.score++;yay();toast('Good! You didn\'t move ✅',1)}setTimeout(()=>{if(!g||g.over)return;if(g.lives<=0)lose('Out! Score: '+g.score);else if(g.score>=8)win(3,'Simon champ!');else nextSimon()},1200)}}
 if(k==='tag'){g.left-=dt;const dx=P.x-g.sx,dy=P.y-g.sy,d=Math.hypot(dx,dy)||1,sp=150+g.t*6;g.sx+=dx/d*sp*dt;g.sy+=dy/d*sp*dt;if(d<45)lose('Tagged! You\'re it!');else if(g.left<=0)win(2,'You escaped!')}
 if(k==='hide'){g.left-=dt;if(g.left<=0)lose('Time\'s up! They\'re still hiding!')}
 if(k==='light'){g.sw-=dt;g.since=(g.since||0)+dt;if(g.sw<=0){g.since=0;g.green=!g.green;g.sw=g.green?1.5+Math.random()*2.5:1+Math.random()*2;kTone(g.green?700:300,.2,.06)}if(g.go){if(g.green){g.pos+=dt*.12;if(g.pos>=1)win(2,'You made it!')}else if(g.since>.4){g.pos=0;oops();toast('You moved on red! Back to start!',1.5);g.go=false}}}
 if(k==='wolf'&&g.dinner){g.dt-=dt;if(g.dt<=0){g.dinner=false;lose('Mr Wolf caught you! (He just wanted a hug.)')}}
 if(k==='duck'){if(g.phase==='walk'){g.wt=(g.wt||0)+dt;if(g.wt>.8){g.wt=0;g.i=(g.i+1)%8;if(g.i===3&&--g.goose<=0){g.phase='race';g.say='';speak('GOOSE!')}else{g.say='Duck…';kTone(500,.08)}}}else{g.su+=dt*.16;if(g.race>=1)win(2,'You beat Sunny around the circle!');else if(g.su>=1)lose('Sunny got your spot first!')}}
 if(k==='chairs'){if(g.playing){g.until-=dt;if(g.until<=0){g.playing=false;g.stopT=0;stopTune()}}else g.stopT+=dt}
 if(k==='parcel'&&g.playing){g.until-=dt;g.pt=(g.pt||0)+dt;if(g.pt>.5){g.pt=0;g.holder=(g.holder+1)%5}if(g.until<=0){g.playing=false;stopTune();g.reveal='';if(g.layers===1)g.holder=0}}
 if(k==='elastic'){const b0=Math.floor(g.bt);g.bt+=dt*(1+g.lv*.15);if(Math.floor(g.bt)>b0){g.beat++;g.hitThis=false;kTone(300,.05,.04);if(g.beat%8===0){if(g.hits>=6){if(g.lv>=4)win(3,'Elastics legend!');else{g.lv++;yay();toast('Up to '+LV[g.lv]+'!',1.5)}}else lose('Tangled in the elastic! Try again!');g.hits=0}}}}
bindInput({down(p){if(g&&g.k==='light'&&inB(p,{x:300,y:470,w:300,h:90}))g.go=true;P=p},move(p){P=p},up(){if(g)g.go=false}});
function drawTitle(){kbg('#c8f0ff','#e0ffd8');T('Coffeebreak Kids',450,90,34,'#ff4f9a','center');T('Playground Games',454,164,60,'#ff5a9a','center');T('Playground Games',450,160,60,'#fff','center');['✊','🔢','🐺','🦆','🎁'].forEach((e,i)=>emo(e,230+i*110,270+Math.sin(t*2+i)*10,50));seal(450,390,.9,'wave');kb('go',330,480,240,70,'🛝 Let\'s play!',()=>{G.state='menu'},{fs:26})}
function drawMenu(){kbg('#c8f0ff','#e0ffd8');starBar(S);T('Pick a game',450,55,34,'#3a7ad8','center');GM.forEach((m,i)=>{const lock=i>=NG;kb('g'+i,40+(i%2)*420,75+Math.floor(i/2)*84,400,70,(lock?'🔒 ':'')+m[1],()=>{if(lock){window.demoEnd&&window.demoEnd(dEnd);return}start(m[0])},{bg:lock?'#a0a8c0':['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i%5],fs:m[1].length>24?16:20})});kb('stk',480,540,260,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='play')drawGame();else stickerBook(S,()=>{G.state='menu'});
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(200,540,500,50,20);x.fill();T(msg,450,572,18,'#ff4f9a','center');x.globalAlpha=1}kOverlay(1/60)}
window.KP={G,S,start,get g(){return g},simonTap};startLoop();
