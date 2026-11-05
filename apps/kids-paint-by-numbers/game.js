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
// ===== Coffeebreak Kids: Paint by Numbers =====
const S=kStore('kidsPaint',{done:{},sums:false});const G={state:'title',score:S.stars,level:0};window.G=G;
const PICS=[
['Love Heart',['#bfe8ff','#ff4f9a','#ffffff'],['111111111111','112221122211','123222222221','122222222221','122222222221','112222222211','111222222111','111122221111','111112211111','111111111111','111111111111','111111111111']],
['Sunny the Seal',['#7fc8f0','#9aa8b8','#1a1a24','#eef2f6','#f4dca0'],['111111111111','111111122211','111111222221','111111232321','111111222221','111122222211','112222222211','122224444221','222244444221','322222222211','555555555555','555555555555']],
['Cupcake',['#ffe6f2','#ff8fc0','#e0203a','#7a4a2a','#ffd24a'],['111111111111','111113311111','111113311111','111222222111','112252225211','122222522221','125222222521','122222222221','114444444411','114444444411','111444444111','111111111111']],
['Rainbow',['#bfe8ff','#e8303a','#ff8a3d','#ffd24a','#3ac060','#3a7ad8','#ffffff'],['111111111111','111222222111','112333333211','123444444321','234555555432','345666666543','456111111654','561111111165','771111111177','777111111777','111111111111','111111111111']],
['Goldfish',['#4ab0e8','#ff8a1a','#ffffff','#1a1a24','#3ac060'],['111111111131','111111111111','111122221311','121222222111','122232242211','122232222221','122232222221','121222222211','111122221111','111111111111','151111115111','151111115111']],
['Flower',['#cfefff','#ff6fae','#ffd24a','#3ac060','#7ad860'],['111111111111','111122221111','111222222111','112223322211','112223322211','111222222111','111122221111','111114411111','114414411111','111444411111','555555555555','555555555555']],
['Rocket',['#1a1a4a','#f4f4f8','#e8303a','#40c8ff','#ff8a1a','#ffd24a'],['611111111116','111113311111','111132231111','111122221116','161124421111','111124421111','111122221111','111322223111','113322223311','113115511311','111155551111','611115511116']],
['Happy Sun',['#9fdcff','#ffd24a','#ff8a1a','#ffffff','#5a3a1a'],['111113311111','131111111131','113122221311','111222222211','312252252213','312222222213','111252252111','113225522311','131122221131','111113311111','144411111441','444441114444']],
['Strawberry',['#fff3c4','#e8203a','#3ac060','#ffe060'],['111111111111','111113311111','111333333111','112223322211','122422224221','122222242221','124222222421','112224222211','112222222211','111222242111','111122221111','111112211111']],
['House',['#bfe8ff','#e8303a','#ffe08a','#7a4a2a','#40a8ff','#5ac860'],['111111111111','111112211111','111122221111','111222222111','112222222211','122222222221','113333333311','113553355311','113553355311','113334433311','666334436666','666666666666']],
['Butterfly',['#e0f6ff','#ff6fae','#b06aff','#2a1a2a','#ffd24a'],['111111111111','122211112221','125221122521','122224422221','122224422221','112224422211','113334433311','135334433531','133334433331','113311113311','111111111111','111111111111']]];
PICS.forEach(p=>{if(p[2].length!==12||p[2].some(r=>r.length!==12))console.warn('bad pic',p[0])});
let pic=null,grid=null,sel=1,wrong=null,painting=false,sums={};const N=12,CS=38,GX=230,GY=72;
function open(i){pic=PICS[i];pic.i=i;grid=pic[2].map(r=>r.split('').map(()=>0));sums={};for(let y=0;y<N;y++)for(let X=0;X<N;X++){const n=+pic[2][y][X];if(n>1){const a=1+Math.random()*(n-1)|0;sums[y+','+X]=a+'+'+(n-a)}else sums[y+','+X]='1'}sel=1;G.state='paint';speak('Let\'s paint '+pic[0])}
function cellAt(p){const X=Math.floor((p.x-GX)/CS),y=Math.floor((p.y-GY)/CS);return X>=0&&y>=0&&X<N&&y<N?[X,y]:null}
function paintAt(p){const c2=cellAt(p);if(!c2)return;const [X,y]=c2;if(grid[y][X])return;const n=+pic[2][y][X];if(n===sel){grid[y][X]=1;kTone(500+n*80,.05,.04);if(grid.every(r=>r.every(v=>v))){S.done[pic.i]=1;reward(S,2,'Masterpiece!');speak('Wow! You painted '+pic[0]+'!');G.level=Object.keys(S.done).length;
 if(DEMO&&Object.keys(S.done).length>=2)setTimeout(()=>window.demoEnd&&window.demoEnd('Beautiful painting! The full game has all 11 pictures, sums mode for maths practice and the full sticker book.'),2500)}}else if(!wrong){wrong={X,y,t:0};oops()}}
function drawPaint(){kbg('#fff3c4','#ffe6f2');starBar(S);T(pic[0],GX+N*CS/2,58,26,'#ff4f9a','center');x.fillStyle='#fff';rr(GX-10,GY-10,N*CS+20,N*CS+20,14);x.fill();
 for(let y=0;y<N;y++)for(let X=0;X<N;X++){const n=+pic[2][y][X],cx=GX+X*CS,cy=GY+y*CS;if(grid[y][X]){x.fillStyle=pic[1][n-1];x.fillRect(cx,cy,CS,CS)}else{x.fillStyle=n===sel?'#fff6c0':'#fff';x.fillRect(cx,cy,CS,CS);x.strokeStyle='#d8e4ee';x.lineWidth=1;x.strokeRect(cx+.5,cy+.5,CS-1,CS-1);T(S.sums?sums[y+','+X]:n,cx+CS/2,cy+CS/2+6,S.sums?12:16,n===sel?'#ff4f9a':'#9aa8b8','center')}}
 if(wrong){x.strokeStyle='rgba(255,60,60,'+(1-wrong.t)+')';x.lineWidth=4;x.strokeRect(GX+wrong.X*CS,GY+wrong.y*CS,CS,CS)}
 pic[1].forEach((c2,i)=>{const Y=72+i*62;BTN['pal'+i]={x:20,y:Y,w:190,h:54,fn:()=>{sel=i+1;kTone(700,.05,.04)}};x.fillStyle='rgba(0,0,0,.15)';rr(20,Y+4,190,54,18);x.fill();x.fillStyle=c2;rr(20,Y,190,54,18);x.fill();x.strokeStyle=sel===i+1?'#ff4f9a':'#fff';x.lineWidth=sel===i+1?6:3;x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(52,Y+27,20,0,7);x.fill();T(i+1,52,Y+35,22,'#2a3a5a','center');
  const left=pic[2].reduce((a,r,y)=>a+r.split('').filter((v,X)=>+v===i+1&&!grid[y][X]).length,0);T(left?left+' left':'✓',140,Y+35,18,left?'#2a3a5a':'#3ac060','center')});
 seal(780,140,.6,POP?'wave':'');bubbleK(S.sums?'Work out each sum to find the colour!':'Pick a colour, then tap its numbers!',700,200,180);
 kb('fill',710,330,170,56,'🪣 Fill all '+sel,()=>{if(DEMO){window.demoEnd&&window.demoEnd('The magic fill bucket is in the full game!');return}for(let y=0;y<N;y++)for(let X=0;X<N;X++)if(+pic[2][y][X]===sel&&!grid[y][X])paintAt({x:GX+X*CS+5,y:GY+y*CS+5})},{bg:'#b06aff',fs:20});
 kb('bk',710,400,170,56,'🖼️ Pictures',()=>{G.state='menu'},{bg:'#4ab0e8',fs:20})}
function mini(p,X,Y,s,done){for(let y=0;y<N;y++)for(let i=0;i<N;i++){const n=+p[2][y][i];x.fillStyle=done?p[1][n-1]:(n===1?'#f4f4f8':'#e0e6ee');x.fillRect(X+i*s,Y+y*s,s,s)}}
function drawMenu(){kbg('#ffe6f2','#d6f0ff');starBar(S);T('Pick a picture',450,50,34,'#ff4f9a','center');kb('sm',230,14,230,44,S.sums?'➕ Sums mode: ON':'🔢 Sums mode: OFF',()=>{if(DEMO){window.demoEnd&&window.demoEnd('Sums mode (paint by adding!) is in the full game.');return}S.sums=!S.sums;S.save()},{sel:S.sums,bg:'#4ab0e8',fs:18});
 PICS.forEach((p,i)=>{const X=40+(i%6)*140,Y=80+Math.floor(i/6)*200,lk=DEMO&&i>2;x.fillStyle='#fff';rr(X,Y,128,180,16);x.fill();mini(p,X+10,Y+10,9,S.done[i]);if(lk){x.fillStyle='rgba(255,255,255,.7)';x.fillRect(X+10,Y+10,108,108);emo('🔒',X+64,Y+64,40)}T(p[0],X+64,Y+140,14,'#2a3a5a','center');if(S.done[i])T('⭐',X+110,Y+28,20,'#ffb020','center');BTN['p'+i]={x:X,y:Y,w:128,h:180,fn:()=>{if(lk){window.demoEnd&&window.demoEnd('All 11 pictures are in the full game!');return}open(i)}}});
 kb('stk',250,500,200,60,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020'});kb('home',470,500,180,60,'🏠 Home',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#ffd6ec','#fff3c4');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('Paint by Numbers',450,165,60,'#fff','center');mini(PICS[1],200,220,14,true);mini(PICS[3],530,220,14,true);seal(450,330,.8,'wave');kb('go',330,450,240,70,'🎨 Let\'s paint!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
bindInput({down(p){if(G.state==='paint'){painting=true;paintAt(p)}},move(p){if(painting&&G.state==='paint')paintAt(p)},up(){painting=false}});
function update(dt){if(wrong){wrong.t+=dt*1.5;if(wrong.t>1)wrong=null}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='paint')drawPaint();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
window.KP={G,S,PICS,open,get grid(){return grid},paintAt,setSel:v=>sel=v};startLoop();
