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
// ===== Coffeebreak Kids: Art & Craft =====
const S=kStore('kidsCraft',{gal:[]});const G={state:'title',score:S.stars,level:0};window.G=G;
const AX=230,AY=60,AW=640,AH=470;
const art=document.createElement('canvas');art.width=AW;art.height=AH;const ax=art.getContext('2d');const lines=document.createElement('canvas');lines.width=AW;lines.height=AH;const lx=lines.getContext('2d');
const COLS=['#e8303a','#ff8a3d','#ffd24a','#3ac060','#40c8ff','#3a7ad8','#b06aff','#ff6fae','#7a4a2a','#2a2a2a','#ffffff','#f4c8a0'];
const TOOLS=[['brush','🖌️','Brush'],['glitter','✨','Glitter'],['rainbow','🌈','Rainbow'],['fill','🪣','Fill'],['stamp','⭐','Stamps'],['sticker','🦄','Stickers'],['eraser','🧽','Rubber']];
const STAMPS=['★','♥','●','◆','▲','✿'],STICK=['🦭','🦄','🌈','🌸','🦋','🐱','🐶','🍭','🧁','🎈','🌟','👑','🐬','🌻','🍓','🚀','🦖','🐝'];
let tool='brush',col='#ff6fae',size=12,stp=0,stk=0,last=null,down=false,hue=0,tpl='blank',cardTxt=0;const CARDS=['Happy Birthday!','I Love You Mum!','Thank You!','Merry Christmas!','Get Well Soon!','Best Friends!','Happy Easter!','Happy Father\'s Day!'];
function L(f){lx.save();lx.strokeStyle='#2a2a2a';lx.lineWidth=5;lx.lineCap='round';lx.lineJoin='round';lx.beginPath();f(lx);lx.stroke();lx.restore()}
const PAGES={
seal:()=>L(c=>{c.ellipse(300,300,170,100,0,0,7);c.moveTo(500,220);c.ellipse(420,210,90,80,0,0,7);c.moveTo(395,200);c.arc(390,200,10,0,7);c.moveTo(455,200);c.arc(450,200,10,0,7);c.moveTo(150,330);c.quadraticCurveTo(80,380,110,420);c.quadraticCurveTo(160,380,170,350);c.moveTo(0,420);c.lineTo(640,420);c.moveTo(240,380);c.ellipse(260,370,60,25,.3,0,7)}),
flower:()=>L(c=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;c.moveTo(320+Math.cos(a)*60+50,180+Math.sin(a)*60);c.ellipse(320+Math.cos(a)*60,180+Math.sin(a)*60,50,50,0,0,7)}c.moveTo(355,180);c.arc(320,180,35,0,7);c.moveTo(320,255);c.lineTo(320,440);c.moveTo(320,360);c.quadraticCurveTo(230,300,220,360);c.quadraticCurveTo(270,390,320,360);c.moveTo(0,440);c.lineTo(640,440);c.moveTo(560,80);c.arc(530,80,30,0,7)}),
house:()=>L(c=>{c.rect(170,210,300,220);c.moveTo(140,215);c.lineTo(320,80);c.lineTo(500,215);c.closePath();c.rect(290,320,60,110);c.rect(200,250,60,50);c.rect(380,250,60,50);c.moveTo(0,430);c.lineTo(640,430);c.moveTo(110,80);c.arc(80,80,30,0,7);c.moveTo(560,120);c.arc(540,120,26,0,7);c.arc(500,124,30,0,7)}),
butterfly:()=>L(c=>{c.ellipse(320,240,14,110,0,0,7);c.moveTo(310,200);c.bezierCurveTo(180,60,80,140,180,240);c.bezierCurveTo(100,330,200,400,310,280);c.moveTo(330,200);c.bezierCurveTo(460,60,560,140,460,240);c.bezierCurveTo(540,330,440,400,330,280);c.moveTo(195,180);c.arc(180,180,20,0,7);c.moveTo(475,180);c.arc(460,180,20,0,7);c.moveTo(315,135);c.lineTo(290,80);c.moveTo(325,135);c.lineTo(350,80)}),
rocket:()=>L(c=>{c.moveTo(320,60);c.bezierCurveTo(400,140,400,300,370,360);c.lineTo(270,360);c.bezierCurveTo(240,300,240,140,320,60);c.moveTo(352,200);c.arc(320,200,32,0,7);c.moveTo(270,300);c.lineTo(220,380);c.lineTo(270,360);c.moveTo(370,300);c.lineTo(420,380);c.lineTo(370,360);c.moveTo(290,360);c.lineTo(320,440);c.lineTo(350,360);[[100,80],[540,120],[120,330],[520,330]].forEach(([a,b])=>{c.moveTo(a+14,b);c.arc(a,b,14,0,7)})}),
mask:()=>L(c=>{c.moveTo(120,200);c.bezierCurveTo(140,110,300,120,320,170);c.bezierCurveTo(340,120,500,110,520,200);c.bezierCurveTo(540,290,400,330,320,260);c.bezierCurveTo(240,330,100,290,120,200);c.moveTo(270,205);c.ellipse(230,205,40,28,0,0,7);c.moveTo(450,205);c.ellipse(410,205,40,28,0,0,7);c.moveTo(520,200);c.lineTo(600,170)}),
card:()=>L(c=>{c.rect(60,30,520,410);c.setLineDash([12,10]);c.moveTo(60,30);c.lineTo(580,30)})};
function newPage(k){tpl=k;ax.fillStyle='#fff';ax.fillRect(0,0,AW,AH);lx.clearRect(0,0,AW,AH);if(PAGES[k])PAGES[k]();if(k==='card'){lx.fillStyle='#ff4f9a';lx.font='bold 46px '+KF;lx.textAlign='center';lx.fillText(CARDS[cardTxt],320,110)}if(k==='mask'){ax.fillStyle='#ffffff'}G.state='art'}
function flood(px,py,fc){px|=0;py|=0;const ld=lx.getImageData(0,0,AW,AH).data,ad=ax.getImageData(0,0,AW,AH);const d=ad.data;const seen=new Uint8Array(AW*AH);const r=parseInt(fc.slice(1,3),16),g=parseInt(fc.slice(3,5),16),b=parseInt(fc.slice(5,7),16);const st=[py*AW+px];let n=0;
 while(st.length&&n<AW*AH){const p=st.pop();if(seen[p])continue;seen[p]=1;if(ld[p*4+3]>60)continue;d[p*4]=r;d[p*4+1]=g;d[p*4+2]=b;d[p*4+3]=255;n++;const X=p%AW,Y=(p/AW)|0;if(X>0)st.push(p-1);if(X<AW-1)st.push(p+1);if(Y>0)st.push(p-AW);if(Y<AH-1)st.push(p+AW)}ax.putImageData(ad,0,0)}
function paint(p){const X=p.x-AX,Y=p.y-AY;if(X<0||Y<0||X>AW||Y>AH)return;
 if(tool==='brush'||tool==='eraser'||tool==='rainbow'){ax.strokeStyle=tool==='eraser'?'#fff':tool==='rainbow'?'hsl('+(hue=(hue+6)%360)+',90%,60%)':col;ax.lineWidth=tool==='eraser'?size*2:size;ax.lineCap='round';ax.beginPath();ax.moveTo(last?last.x:X,last?last.y:Y);ax.lineTo(X,Y);ax.stroke();last={x:X,y:Y}}
 else if(tool==='glitter'){for(let i=0;i<8;i++){ax.fillStyle=Math.random()<.4?'#fff':Math.random()<.5?'#ffd24a':col;const a=Math.random()*7,r=Math.random()*size*1.4;ax.fillRect(X+Math.cos(a)*r,Y+Math.sin(a)*r,2+Math.random()*3,2+Math.random()*3)}}}
function tap(p){const X=p.x-AX,Y=p.y-AY;if(X<0||Y<0||X>AW||Y>AH)return;if(tool==='fill'){flood(X,Y,col);kTone(400,.1,.05)}else if(tool==='stamp'){ax.fillStyle=col;ax.font='bold '+(size*5)+'px '+KF;ax.textAlign='center';ax.textBaseline='middle';ax.fillText(STAMPS[stp],X,Y);kTone(300,.08,.06)}else if(tool==='sticker'){ax.font=(size*5)+'px serif';ax.textAlign='center';ax.textBaseline='middle';ax.fillText(STICK[stk],X,Y);kTone(800,.08,.05)}else{last=null;paint(p)}}
function snap(){const o=document.createElement('canvas');o.width=320;o.height=235;const ox=o.getContext('2d');ox.drawImage(art,0,0,320,235);ox.drawImage(lines,0,0,320,235);return o.toDataURL('image/jpeg',.7)}
function saveArt(){if(DEMO&&S.gal.length>=1){window.demoEnd&&window.demoEnd('The demo saves 1 artwork. The full game has a 12-picture gallery, all colouring pages, card and mask makers, glitter and every sticker!');return}S.gal.unshift(snap());S.gal=S.gal.slice(0,12);reward(S,1,'Saved to gallery!');G.level=S.gal.length;speak('Beautiful!')}
function download(){const o=document.createElement('canvas');o.width=AW;o.height=AH;const ox=o.getContext('2d');ox.drawImage(art,0,0);ox.drawImage(lines,0,0);const a=document.createElement('a');a.href=o.toDataURL('image/png');a.download='my-coffeebreak-art.png';document.body.appendChild(a);a.click();a.remove()}
const imgs={};function galImg(s){if(!imgs[s]){imgs[s]=new Image();imgs[s].src=s}return imgs[s]}
function drawArt(){kbg('#ffe6f2','#d6f0ff');x.fillStyle='rgba(0,0,0,.12)';rr(AX-6,AY-2,AW+12,AH+12,14);x.fill();x.drawImage(art,AX,AY);x.drawImage(lines,AX,AY);
 TOOLS.forEach((tl,i)=>kb('t'+i,10,10+i*62,100,54,tl[1],()=>{if(DEMO&&(tl[0]==='glitter'||tl[0]==='rainbow')){window.demoEnd&&window.demoEnd('Glitter and rainbow brushes are in the full game!');return}tool=tl[0]},{sel:tool===tl[0],bg:'#4ab0e8',fs:28}));
 COLS.forEach((c2,i)=>{const X=118+(i%2)*52,Y=10+Math.floor(i/2)*52;BTN['c'+i]={x:X,y:Y,w:46,h:46,fn:()=>{col=c2}};x.fillStyle=c2;x.beginPath();x.arc(X+23,Y+23,21,0,7);x.fill();x.strokeStyle=col===c2?'#ff4f9a':'#fff';x.lineWidth=col===c2?6:3;x.stroke()});
 [6,12,22].forEach((s2,i)=>kb('s'+i,118+i*36,330,32,40,'',()=>{size=s2},{sel:size===s2,bg:'#b06aff'}));[6,12,22].forEach((s2,i)=>{x.fillStyle='#fff';x.beginPath();x.arc(134+i*36,350,s2/3,0,7);x.fill()});
 if(tool==='stamp')STAMPS.forEach((s2,i)=>kb('sp'+i,AX+i*58,AY+AH+12,52,46,s2,()=>{stp=i},{sel:stp===i,bg:'#ff8a3d',fs:26}));
 else if(tool==='sticker')STICK.forEach((s2,i)=>{if(i<11)kb('sk'+i,AX+i*58,AY+AH+12,52,46,'',()=>{stk=i},{sel:stk===i,bg:'#fff'});if(i<11)emo(s2,AX+i*58+26,AY+AH+35,28)});
 else{kb('sv',AX,AY+AH+12,150,46,'💾 Save',saveArt,{bg:'#3ac060',fs:20});kb('dl',AX+160,AY+AH+12,150,46,'⬇️ Download',download,{bg:'#4ab0e8',fs:18});kb('nw',AX+320,AY+AH+12,150,46,'📄 New',()=>{G.state='menu'},{bg:'#ff8a3d',fs:20});kb('cl',AX+480,AY+AH+12,160,46,'🧹 Clear',()=>newPage(tpl),{bg:'#e8303a',fs:20})}
 if(tool==='stamp'||tool==='sticker')kb('done2',10,450,100,54,'✔',()=>{tool='brush'},{bg:'#3ac060'})}
function drawMenu(){kbg('#fff3c4','#ffd6ec');starBar(S);T('What shall we make?',450,56,36,'#ff4f9a','center');
 const items=[['blank','📄','Blank paper'],['seal','🦭','Colour: Seal'],['flower','🌸','Colour: Flower'],['house','🏠','Colour: House'],['butterfly','🦋','Colour: Butterfly'],['rocket','🚀','Colour: Rocket'],['card','💌','Card maker'],['mask','🎭','Mask maker']];
 items.forEach((it,i)=>{const X=60+(i%4)*200,Y=90+Math.floor(i/4)*170,lk=DEMO&&i>2;x.fillStyle='#fff';rr(X,Y,180,150,20);x.fill();emo(it[1],X+90,Y+62,64);T((lk?'🔒 ':'')+it[2],X+90,Y+130,17,'#2a3a5a','center');BTN['m'+i]={x:X,y:Y,w:180,h:150,fn:()=>{if(lk){window.demoEnd&&window.demoEnd('All colouring pages, the card maker and the mask maker are in the full game!');return}newPage(it[0]);if(it[0]==='card')speak('Make a card for someone special!')}}});
 kb('ct',60,440,300,46,'💌 Card says: '+CARDS[cardTxt],()=>{cardTxt=(cardTxt+1)%CARDS.length},{bg:'#ff6fae',fs:15});kb('gal',380,440,170,46,'🖼️ Gallery',()=>{G.state='gal'},{bg:'#3ac060',fs:20});kb('stk',570,440,150,46,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:18});kb('home',740,440,120,46,'🏠',()=>{G.state='title'},{bg:'#4ab0e8'})}
function drawGal(){kbg('#d6f0ff','#ffe6f2');T('My Art Gallery',450,50,36,'#ff4f9a','center');if(!S.gal.length)T('Save a picture and it will hang here!',450,280,22,'#2a3a5a','center','');S.gal.forEach((s2,i)=>{const X=40+(i%4)*210,Y=70+Math.floor(i/4)*150;x.fillStyle='#c89a5a';rr(X-6,Y-6,192,142,6);x.fill();const im=galImg(s2);if(im.complete)x.drawImage(im,X,Y,180,130)});kb('b',350,520,200,56,'⬅ Back',()=>{G.state='menu'},{bg:'#4ab0e8'})}
function drawTitle(){kbg('#ffd6ec','#d6f0ff');T('Coffeebreak Kids',450,100,34,'#ff4f9a','center');T('Art & Craft',450,170,66,'#fff','center');['🖌️','✂️','🎨','✨','🌈','🖍️'].forEach((e,i)=>emo(e,180+i*108,260+Math.sin(t*2+i)*10,60));seal(450,370,.9,'wave');kb('go',330,460,240,70,'🎨 Let\'s create!',()=>{G.state='menu'},{bg:'#ff6fae',fs:28})}
bindInput({down(p){if(G.state!=='art')return;down=true;last=null;tap(p)},move(p){if(down&&G.state==='art'&&!['fill','stamp','sticker'].includes(tool))paint(p)},up(){down=false;last=null}});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='art')drawArt();else if(s==='gal')drawGal();else if(s==='stk')stickerBook(S,()=>{G.state='menu'});kOverlay(1/60)}
newPage('blank');G.state='title';window.KC={G,S,newPage,tap,paint,flood,saveArt,setTool:v=>tool=v,setCol:v=>col=v};startLoop();
