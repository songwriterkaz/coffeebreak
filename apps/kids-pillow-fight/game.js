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
// ===== Coffeebreak Kids: Pillow Fight =====
const S=kStore('kidsPillow',{wins:{},feathers:0});const G={state:'title',score:0,level:0};window.G=G;
const OPP=[['🧸','Teddy','#c98a5a',1.0],['🐰','Bunny','#f3c6d8',1.15],['🐼','Panda','#e8e8e8',1.3],['🐨','Koala','#a8b4c0',1.45],['🦉','Owl Grandma','#c8a070',1.6]];
const NO=DEMO?1:OPP.length;const PCOL=['#ffd84a','#8fd6ff','#ffb0d0','#b8f0a0','#d0b0ff'];
let o=0,ring=0,me={hp:0,sw:0,duck:0},op={hp:0,sw:0,wind:0,cool:2},fe=[],msg='',msgT=0,fin=0,giggle=[];
function start(i){o=i;me={hp:0,sw:0,duck:0};op={hp:0,sw:0,wind:0,cool:2};fe=[];fin=0;G.state='fight';startMusic()}
function puff(X,Y,n,col){for(let i=0;i<n;i++)fe.push({x:X,y:Y,vx:(Math.random()-.5)*360,vy:-Math.random()*300-60,r:Math.random()*6,vr:(Math.random()-.5)*3,c:Math.random()<.7?'#fff':col,l:4+Math.random()*3});S.feathers+=n;kTone(300+Math.random()*200,.12,.05)}
function say(m){msg=m;msgT=1.4}
function bop(){if(G.state!=='fight'||fin||me.sw>0)return;me.sw=.35;const good=Math.abs(ring-.5)<.18;if(op.duck>0){say(OPP[o][1]+' ducked! Hee hee');kTone(200,.1,.05);return}
 if(good){me.hp++;puff(640,300,26,PCOL[o]);say(['FLUMP!','POOF!','Feathers everywhere!','Bop-bop!'][me.hp%4]);yay();if(me.hp>=5){fin=1;S.wins[o]=1;reward(S,2,'You won the pillow fight!');speak('What a fluffy pillow fight!')}}
 else{puff(640,300,6,PCOL[o]);say('Soft bop! Try the green zone')}}
function duck(){if(G.state!=='fight'||fin)return;me.duck=.6;kTone(520,.06,.04)}
function update(dt){fe.forEach(f=>{f.vy+=60*dt;f.vy=Math.min(f.vy,50);f.vx*=.985;f.x+=f.vx*dt+Math.sin(t*3+f.r)*20*dt;f.y+=f.vy*dt;f.r+=f.vr*dt;if(f.y>520){f.y=520;f.vy=0;f.vx*=.8}f.l-=dt*.4});fe=fe.filter(f=>f.l>0).slice(-400);if(G.state!=='fight')return;ring=(Math.sin(t*2.4*OPP[o][3])+1)/2;me.sw=Math.max(0,me.sw-dt);me.duck=Math.max(0,me.duck-dt);op.sw=Math.max(0,op.sw-dt);op.duck=Math.max(0,(op.duck||0)-dt);msgT-=dt;
 if(!fin){op.cool-=dt;if(op.wind>0){op.wind-=dt;if(op.wind<=0){op.sw=.35;if(me.duck>0){say('Dodged! 🙌');reward(S,0)}else{op.hp++;puff(260,300,18,'#ffd84a');say(OPP[o][1]+' got you! Giggle!');if(op.hp>=5){fin=2;speak('So close! Try again!')}}op.cool=1.6+Math.random()*1.4/OPP[o][3]}}
  else if(op.cool<=0){if(Math.random()<.3){op.duck=.7;op.cool=1}else op.wind=.9/OPP[o][3]+.25}}
}
function feather(f){x.save();x.translate(f.x,f.y);x.rotate(f.r);x.globalAlpha=Math.min(1,f.l);x.fillStyle=f.c;x.beginPath();x.ellipse(0,0,10,4,0,0,7);x.fill();x.strokeStyle='#ccc';x.lineWidth=1;x.beginPath();x.moveTo(-11,0);x.lineTo(10,0);x.stroke();x.restore()}
function pillow(X,Y,rot,col){x.save();x.translate(X,Y);x.rotate(rot);x.fillStyle=col;rr(-45,-28,90,56,22);x.fill();x.strokeStyle='#0002';x.lineWidth=2;x.stroke();x.restore()}
function room(){kbg('#d8d0ff','#ffe0f0');x.fillStyle='#fff6';for(let i=0;i<14;i++){x.beginPath();x.arc((i*137)%900,(i*71)%300+20,3,0,7);x.fill()}emo('🌙',820,70,50);x.fillStyle='#8a6ad8';rr(60,400,780,110,30);x.fill();x.fillStyle='#fff';rr(80,390,740,40,20);x.fill()}
function draw(){x.clearRect(0,0,900,600);
 if(G.state==='title'){room();fe.length<60&&Math.random()<.3&&fe.push({x:Math.random()*900,y:-10,vx:0,vy:20,r:0,vr:1,c:'#fff',l:6});fe.forEach(feather);T('Coffeebreak Kids',450,80,32,'#8a4adf','center');T('Pillow Fight',454,154,72,'#ff5a9a','center');T('Pillow Fight',450,150,72,'#fff','center');seal(300,320,.9,'wave');pillow(420,300,-.4,'#ffd84a');emo('🧸',620,320,110);pillow(540,300,.4,'#8fd6ff');
  kb('go',330,470,240,70,'🪶 Play!',()=>{G.state='pick'},{fs:28});kb('stk',700,20,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20});return}
 if(G.state==='stk'){stickerBook(S,()=>{G.state='title'});kOverlay(1/60);return}
 if(G.state==='pick'){room();starBar(S);T('Pick a pillow buddy',450,70,40,'#8a4adf','center');T('Feathers floated so far: '+S.feathers,450,105,18,'#7a4a8a','center');
  OPP.forEach((p,i)=>{const X=40+i*168,lock=i>=NO;kb('o'+i,X,150,155,190,'',()=>{if(lock){window.demoEnd&&window.demoEnd('The full game has 5 cuddly pillow buddies (Teddy, Bunny, Panda, Koala and Owl Grandma), each a little quicker, plus the full sticker book!');return}start(i)},{bg:lock?'#bbb':'#fff'});emo(lock?'🔒':p[0],X+77,220,70);T(p[1],X+77,300,18,'#7a4a8a','center');if(S.wins[i])T('🏆',X+77,325,18,'#000','center')});
  T('Tap BOP when the ring is in the green • tap DUCK when your buddy winds up!',450,400,18,'#7a4a8a','center');kb('bk',330,470,240,60,'⬅ Back',()=>{G.state='title'},{bg:'#b06aff'});kOverlay(1/60);return}
 room();const O=OPP[o];
 seal(250,330+(me.duck>0?40:0),1,fin===1?'happy':'wave');pillow(330+(me.sw>0?120:0),300+(me.duck>0?40:0),me.sw>0?.6:-.6,'#ffd84a');
 x.save();x.translate(650,330+(op.duck>0?45:0));if(op.wind>0)x.rotate(-.15);emo(O[0],0,0,140);x.restore();pillow(560-(op.sw>0?120:0)+(op.wind>0?60:0),290+(op.wind>0?-60:0),op.sw>0?-.6:op.wind>0?-1.2:.6,PCOL[o]);
 if(op.wind>0)T('!!',650,220,40,'#ff4f7a','center');fe.forEach(feather);
 [[me.hp,40,'You'],[op.hp,560,O[1]]].forEach(([h,X,n])=>{T(n,X,40,20,'#7a4a8a','left');for(let i=0;i<5;i++)emo(i<h?'🪶':'⚪',X+20+i*36,70,26)});
 x.lineWidth=12;x.strokeStyle='#fff';x.beginPath();x.arc(450,140,40,Math.PI,0);x.stroke();x.strokeStyle='#3ac060';x.beginPath();x.arc(450,140,40,Math.PI+Math.PI*.32,Math.PI+Math.PI*.68);x.stroke();const a=Math.PI+ring*Math.PI;x.fillStyle='#ff4f9a';x.beginPath();x.arc(450+Math.cos(a)*40,140+Math.sin(a)*40,10,0,7);x.fill();
 if(msgT>0)bubbleK(msg,330,170,240);
 if(!fin){kb('bop',180,520,240,70,'🪶 BOP!',bop,{fs:30});kb('duck',480,520,240,70,'🙈 DUCK!',duck,{bg:'#4ab0e8',fs:30})}
 else{x.fillStyle='#fffd';rr(200,170,500,230,30);x.fill();T(fin===1?'You win! 🏆':'Giggle tie-break!',450,240,46,fin===1?'#3ac060':'#ff7a00','center');T(fin===1?'So many feathers! What a fluffy fight.':O[1]+' won this one. Have another go!',450,285,20,'#7a4a8a','center');
  kb('ag',230,320,200,60,'↺ Again',()=>start(o),{bg:'#ff6fae'});kb('pk',470,320,200,60,DEMO&&fin===1?'⭐ More buddies':'👫 Buddies',()=>{if(DEMO&&fin===1){window.demoEnd&&window.demoEnd('Great pillow fighting! The full game has 5 pillow buddies and the full sticker book.');return}G.state='pick'},{bg:'#4ab0e8'})}
 kb('qx',800,520,90,50,'⬅',()=>{G.state='pick'},{bg:'#b06aff',fs:22});kOverlay(1/60)}
bindInput({down(p){}});addEventListener('keydown',e=>{if(e.code==='Space')bop();if(e.code==='ArrowDown')duck()});startLoop();window.KP={start,bop,duck,G,S,get me(){return me},get op(){return op},set ring(v){ring=v}};
