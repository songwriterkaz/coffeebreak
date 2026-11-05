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
// ---- Coffeebreak: Sim Kaz ----
const DEMO=()=>!!window.DEMO;
const TIERS=[[0,'Small creator'],[1e3,'Bedroom artist'],[1e4,'Local Newy legend'],[1e5,'Rising star'],[1e6,'Millionaire'],[1e7,'Multi-millionaire'],[1e8,'Mogul'],[1e9,'BILLIONAIRE 💎']];
const OUT=[['candy','Candy corset',0],['goth','Gothic rose dress',1],['country','Country denim',2],['cosy','Cosy hoodie',3],['stage','Stage sparkle',4],['gold','Billionaire gold gown',7]];
const ST={studio:{x:120,y:330,e:'🎙️',n:'Write & record a song',h:3,need:{creativity:25,energy:15}},pc:{x:285,y:330,e:'💻',n:'Make a game',h:4,need:{creativity:30,energy:25}},sew:{x:450,y:330,e:'🧵',n:'Design for Coffee Break: No Inside Out',h:2,need:{creativity:20,energy:10}},
 phone:{x:610,y:330,e:'📱',n:'Post to @kobcountrymusic',h:1,need:{energy:5}},coffee:{x:770,y:330,e:'☕',n:'Get coffee',h:.5,need:{money:5}},bed:{x:150,y:500,e:'🛏️',n:'Sleep',h:0,need:{}},darko:{x:640,y:500,e:'👧',n:'Hang out with Darko',h:2,need:{energy:10}}};
const def=()=>({day:1,hour:8,coffee:70,energy:80,creativity:70,fun:70,money:50,worth:50,fans:20,songs:[],games:0,designs:0,posts:0,streams:0,outfit:'candy',log:['Good morning, Kaz! ☀️ Welcome home to Newcastle.']});
let K=JSON.parse(localStorage.kazSave||'null')||def();const G={state:'title',score:0,level:0,walk:null,busy:null,kaz:{x:450,y:430},flash:null};window.G=G;window.K=K;
function save(){localStorage.kazSave=JSON.stringify(K)}
function tier(){let i=0;TIERS.forEach((q,j)=>{if(K.worth>=q[0])i=j});return i}
function log(s){K.log.unshift(s);K.log.length=Math.min(K.log.length,5)}
const clamp=v=>Math.max(0,Math.min(100,v));
function passHours(h){for(let i=0;i<h*2;i++){K.coffee=clamp(K.coffee-2.5);K.energy=clamp(K.energy-(K.coffee<20?3:1.5));K.fun=clamp(K.fun-1.5);K.creativity=clamp(K.creativity-.5);K.hour+=.5;
 // passive income each half hour
 const s=K.songs.reduce((a,q)=>a+q,0)*(1+K.fans/40)*0.5;K.streams+=s;earn(s*0.004*40+K.games*(2+K.fans*.02)+K.designs*(1+K.fans*.01))}}
function earn(m){K.money+=m;K.worth+=Math.max(0,m)}
function act(k){const s=ST[k];if(G.busy)return;startMusic();
 for(const n in s.need){if(K[n]<s.need[n]){G.flash=n==='money'?'Not enough money for coffee! Post or make something first 💸':n==='energy'?'Too tired! Have a coffee or sleep 😴':'Out of creative juice! Hang out with Darko or post for inspo 🎨';return}}
 if(k!=='bed'&&K.hour+s.h>24){G.flash='It is too late, time for bed! 🌙';return}
 G.walk={k,x0:G.kaz.x,y0:G.kaz.y,t:0};}
function finish(k){const s=ST[k],q=Math.round(K.creativity);
 if(k==='studio'){K.creativity-=25;K.energy-=15;const qual=1+q/25;K.songs.push(qual);K.fans+=Math.round(5+K.fans*.03*qual);const np=($('np').textContent||'').replace('Now playing: ','');log('🎙️ Recorded a new song'+(np?' (vibe: '+np+')':'')+'! '+K.songs.length+' songs out.')}
 if(k==='pc'){K.creativity-=30;K.energy-=25;K.games++;K.fans+=Math.round(10+K.fans*.05);earn(20*K.games);log('💻 Shipped game #'+K.games+' on itch.io!')}
 if(k==='sew'){K.creativity-=20;K.energy-=10;K.fun=clamp(K.fun+5);K.designs++;earn(15*K.designs);log('🧵 New Coffee Break: No Inside Out design! ('+K.designs+' total)')}
 if(k==='phone'){K.energy-=5;K.fun=clamp(K.fun+5);K.creativity=clamp(K.creativity+5);K.posts++;const g=Math.round(8+K.fans*(.06+.01*(K.songs.length+K.games+K.designs))*(K.fun/70));K.fans+=g;log('📱 Posted to @kobcountrymusic: +'+g+' fans')}
 if(k==='coffee'){K.money-=5;K.coffee=clamp(K.coffee+50);K.energy=clamp(K.energy+15);log('☕ Mmm, a Coffee Break.')}
 if(k==='darko'){K.energy-=10;K.fun=clamp(K.fun+40);K.creativity=clamp(K.creativity+20);log(['👧 Baked cupcakes with Darko!','👧 Beach walk with Darko at Nobbys!','👧 Darko and you had a dance party!','👧 Movie night with Darko 🍿'][Math.random()*4|0])}
 if(k==='bed'){K.day++;K.hour=8;K.energy=100;K.creativity=clamp(K.creativity+30);K.coffee=clamp(K.coffee-20);log('🌙 Day '+K.day+'. Fans: '+Math.round(K.fans).toLocaleString());
  if(DEMO()&&K.day>3){save();G.state='demo';demoEnd('That was 3 days in the free demo of <b>Coffeebreak: Sim Kaz</b>! The billionaire career, every outfit and endless days are in the full game.');return}}
 else passHours(s.h);
 ['coffee','energy','creativity','fun'].forEach(n=>K[n]=clamp(K[n]));if(K.energy<=0){log('😴 Kaz passed out from tiredness...');finish('bed');return}
 if(K.hour>=24){finish('bed');return}
 const ti=tier();if(ti>G.level){G.level=ti;G.flash='🎉 Career up: '+TIERS[ti][1]+'!'+(OUT.find(o=>o[2]===ti)?' New outfit unlocked!':'');if(ti===7)G.state='win'}
 G.score=Math.round(K.worth);save()}
bindInput({down(p){if(G.state!=='play')return;for(const k in ST){const s=ST[k];if(Math.hypot(p.x-s.x,p.y-s.y)<45){act(k);return}}}});
function update(dt){if(G.flashT==null||G.flash!==G.lastF){G.flashT=3;G.lastF=G.flash}if(G.flash){G.flashT-=dt;if(G.flashT<=0)G.flash=null}
 if(G.walk){const w=G.walk,s=ST[w.k];w.t+=dt*1.6;const k=Math.min(1,w.t);G.kaz.x=w.x0+(s.x-w.x0)*k;G.kaz.y=w.y0+(s.y+60-w.y0)*k;if(w.t>=1){G.walk=null;G.busy={k:w.k,t:0}}}
 if(G.busy){G.busy.t+=dt;if(G.busy.t>1.2){const k=G.busy.k;G.busy=null;finish(k)}}}
function kaz(X,Y,s,o,mood){x.save();x.translate(X,Y);x.scale(s,s);const sk='#f6d8c8';
 const OC={candy:['#f6a6c6','#ffd0e2'],goth:['#2a0a1a','#c2264a'],country:['#4a6a9a','#d8c8a0'],cosy:['#9a8ab0','#c8bce0'],stage:['#a040c0','#ffd0ff'],gold:['#d8a830','#fff0a0']}[o]||['#f6a6c6','#ffd0e2'];
 // legs + skirt (tasteful, full coverage)
 x.fillStyle=o==='country'?'#3a5a8a':'#f2a0c0';x.fillRect(-10,30,8,26);x.fillRect(3,30,8,26);x.fillStyle='#2a1a2a';x.fillRect(-12,54,11,6);x.fillRect(2,54,11,6);
 x.fillStyle=OC[1];x.beginPath();x.moveTo(-22,34);x.lineTo(22,34);x.lineTo(16,14);x.lineTo(-16,14);x.fill();
 // torso / outfit
 x.fillStyle=OC[0];rr(-17,-14,34,32,8);x.fill();
 if(o==='candy'){for(let i=0;i<5;i++){const a=i*1.7;x.fillStyle=['#fff','#ff5a9a','#7ad0ff','#ffe066','#9aff9a'][i];x.fillRect(-12+(i*7)%24,-8+(i*11)%20,3,2)}x.fillStyle='#fff';x.beginPath();x.arc(-8,2,4,0,7);x.fill();x.fillStyle='#ff5a9a';x.beginPath();x.arc(-8,2,2,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(9,-4,4,0,7);x.fill();x.fillStyle='#ff5a9a';x.beginPath();x.arc(9,-4,2,0,7);x.fill();x.strokeStyle='#ff9ac0';x.lineWidth=1.5;x.beginPath();for(let yy=-12;yy<16;yy+=5){x.moveTo(-3,yy);x.lineTo(3,yy+3)}x.stroke();x.fillStyle='#ffc0d8';x.beginPath();x.moveTo(-7,-16);x.lineTo(0,-12);x.lineTo(7,-16);x.lineTo(7,-10);x.lineTo(0,-12);x.lineTo(-7,-10);x.fill()}
 if(o==='goth')rose(0,-4,1.2);if(o==='gold'||o==='stage'){x.fillStyle='#fff';for(let i=0;i<6;i++)x.fillRect(-12+i*5,-10+(i%3)*9,2,2)}
 // shoulders + arms with fishnet sleeves
 x.fillStyle=o==='candy'||o==='goth'?sk:OC[0];x.beginPath();x.arc(-17,-12,5,0,7);x.arc(17,-12,5,0,7);x.fill();
 const arm=(ax)=>{x.fillStyle=o==='candy'?'#f5a0c0':o==='goth'?'#1a0a12':OC[0];x.fillRect(ax-4,-10,8,26);if(o==='candy'||o==='goth'){x.strokeStyle=o==='candy'?'#ff7aaa':'#555';x.lineWidth=.8;x.beginPath();for(let i=-10;i<16;i+=3){x.moveTo(ax-4,i);x.lineTo(ax+4,i+3);x.moveTo(ax+4,i);x.lineTo(ax-4,i+3)}x.stroke()}x.fillStyle=sk;x.beginPath();x.arc(ax,18,4,0,7);x.fill()};arm(-22);arm(22);
 // neck + tattoo
 x.fillStyle=o==='cosy'||o==='country'?OC[0]:sk;x.fillRect(-6,-22,12,9);x.strokeStyle='#3a3a5a';x.lineWidth=1.2;x.beginPath();x.moveTo(-4,-17);x.quadraticCurveTo(0,-13,4,-17);x.moveTo(0,-15);x.lineTo(0,-12);x.stroke();
 // head
 x.fillStyle='#3a2418';x.beginPath();x.ellipse(0,-44,30,28,0,0,7);x.fill();x.fillRect(-30,-46,12,28);x.fillRect(18,-46,12,28);
 x.fillStyle=sk;x.beginPath();x.ellipse(0,-40,24,23,0,0,7);x.fill();
 x.fillStyle='#3a2418';for(let i=-3;i<=3;i++){x.beginPath();x.moveTo(i*7-5,-62);x.lineTo(i*7+3,-48+Math.abs(i));x.lineTo(i*7+6,-62);x.fill()}
 // beanie
 x.fillStyle='#9a9aa4';x.beginPath();x.ellipse(0,-62,29,16,0,Math.PI,0);x.fill();x.fillRect(-29,-64,58,9);x.strokeStyle='#7a7a84';x.lineWidth=1.5;for(let i=-24;i<=24;i+=6){x.beginPath();x.moveTo(i,-55);x.lineTo(i,-72+Math.abs(i)*.3);x.stroke()}
 // eyes grey-blue
 const blink=Math.sin(t*1.3+X)>.97;[-9,9].forEach(ex=>{if(blink){x.strokeStyle='#2a1a1a';x.lineWidth=2;x.beginPath();x.moveTo(ex-5,-40);x.lineTo(ex+5,-40);x.stroke()}else{x.fillStyle='#fff';x.beginPath();x.ellipse(ex,-40,6,7,0,0,7);x.fill();x.fillStyle='#7f98ac';x.beginPath();x.arc(ex,-39,4.5,0,7);x.fill();x.fillStyle='#1a1a2a';x.beginPath();x.arc(ex,-39,2.2,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+1.5,-41,1.3,0,7);x.fill()}});
 x.fillStyle='rgba(255,130,160,.45)';x.beginPath();x.arc(-15,-31,4,0,7);x.arc(15,-31,4,0,7);x.fill();
 x.fillStyle='#c0203a';x.beginPath();if(mood==='sad'){x.ellipse(0,-26,4,2,0,Math.PI,0)}else x.ellipse(0,-27,5,mood==='happy'?3.5:2.2,0,0,Math.PI);x.fill();x.restore()}
function darko(X,Y,s){x.save();x.translate(X,Y);x.scale(s,s);x.fillStyle='#7a4aa0';rr(-12,-6,24,26,6);x.fill();x.fillStyle='#2a1a2a';x.fillRect(-9,20,7,12);x.fillRect(2,20,7,12);x.fillStyle='#2a1810';x.beginPath();x.arc(0,-22,18,0,7);x.fill();x.fillStyle='#f6d8c8';x.beginPath();x.arc(0,-19,14,0,7);x.fill();x.fillStyle='#2a1810';x.fillRect(-16,-34,32,9);x.fillStyle='#1a1a2a';x.beginPath();x.arc(-5,-20,2.5,0,7);x.arc(5,-20,2.5,0,7);x.fill();x.strokeStyle='#c0405a';x.lineWidth=1.5;x.beginPath();x.arc(0,-14,3.5,.3,2.8);x.stroke();x.restore()}
function room(){x.fillStyle='#f3e2e8';x.fillRect(0,0,W,420);x.fillStyle='#e8cfd8';for(let i=0;i<W;i+=30)x.fillRect(i,0,12,420);x.fillStyle='#b98a6a';x.fillRect(0,400,W,200);x.strokeStyle='#a07858';for(let i=0;i<W;i+=60){x.beginPath();x.moveTo(i,400);x.lineTo(i-40,600);x.stroke()}
 // window: Newcastle beach + Nobbys lighthouse
 x.fillStyle=K.hour>=19||K.hour<7?'#1a1240':'#8ad0f0';x.fillRect(350,40,200,130);x.fillStyle=K.hour>=19?'#2a3a70':'#3a8ac0';x.fillRect(350,120,200,50);x.fillStyle='#e8d8a0';x.fillRect(350,155,200,15);x.fillStyle='#6a8a4a';x.beginPath();x.moveTo(470,120);x.quadraticCurveTo(505,95,540,120);x.fill();x.fillStyle='#fff';x.fillRect(500,92,8,22);x.fillStyle='#ffd75a';x.fillRect(500,88,8,5);x.strokeStyle='#fff';x.lineWidth=6;x.strokeRect(350,40,200,130);x.beginPath();x.moveTo(450,40);x.lineTo(450,170);x.stroke();x.fillStyle='#8a5a6a';x.font='11px Georgia';x.textAlign='center';x.fillText('Newcastle NSW',450,186);
 skull(300,200,2.5);rose(600,200,2.5);x.fillStyle='#c2264a';x.font='bold 14px Georgia';x.fillText('♫ Billionaire ♫',690,60)}
function bar(n,X,Y,col,v){x.fillStyle='#fff3f7';rr(X,Y,120,26,8);x.fill();x.fillStyle=col;rr(X+2,Y+2,116*v/100,22,7);x.fill();x.fillStyle='#3a1424';x.font='bold 12px Georgia';x.textAlign='center';x.fillText(n+' '+Math.round(v),X+60,Y+17)}
const money=v=>'$'+(v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(2)+'M':v>=1e3?(v/1e3).toFixed(1)+'K':Math.round(v));
function draw(){room();
 if(G.state==='title'||G.state==='closet'){kaz(W/2,330,2.6,K.outfit,'happy');x.textAlign='center';x.fillStyle='#c2264a';x.font='bold 48px Georgia';x.fillText('🍭 Coffeebreak: Sim Kaz',W/2,230);
  if(G.state==='title'){x.fillStyle='#3a1424';x.font='17px Georgia';x.fillText('Write songs, make games, design clothes, hang with Darko. Small creator to BILLIONAIRE!',W/2,480);
   button('p',W/2-310,505,200,48,'▶ Play (day '+K.day+')',()=>{startMusic();G.state='play';G.level=tier()});button('c',W/2-100,505,200,48,'👗 Wardrobe',()=>G.state='closet');button('n',W/2+110,505,200,48,'↺ New life',()=>{K=def();window.K=K;save()});return}
  x.fillStyle='rgba(58,20,36,.85)';rr(80,440,740,150,14);x.fill();OUT.forEach((o,i)=>{const un=tier()>=o[2]&&!(DEMO()&&i>1);button('o'+i,95+i*120,455,112,60,o[1],()=>{if(un){K.outfit=o[0];save()}},{dis:!un,sel:K.outfit===o[0],fs:12});x.fillStyle='#ffe9ef';x.font='11px Georgia';x.textAlign='center';x.fillText(un?'':DEMO()&&i>1?'full game':TIERS[o[2]][1],151+i*120,530)});button('b',W/2-70,545,140,36,'← Back',()=>G.state='title');return}
 for(const k in ST){const s=ST[k];x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.arc(s.x,s.y,42,0,7);x.fill();x.strokeStyle='#e88aa8';x.lineWidth=3;x.stroke();if(k==='darko')darko(s.x,s.y+8,1.1);else emo(s.e,s.x,s.y,44);x.fillStyle='#3a1424';x.font='bold 12px Georgia';x.textAlign='center';wrapT(s.n,s.x,s.y+56,150,14)}
 const busy=G.busy;kaz(G.kaz.x,G.kaz.y,1.1,K.outfit,K.fun<25||K.energy<20?'sad':busy?'happy':'');if(busy){emo(['✨','🎵','💖'][Math.floor(t*4)%3],G.kaz.x+30,G.kaz.y-90,26)}
 bar('☕',8,8,'#a0703a',K.coffee);bar('⚡',134,8,'#ffcf3a',K.energy);bar('🎨',260,8,'#c070ff',K.creativity);bar('🎉',386,8,'#ff7aaa',K.fun);
 x.fillStyle='#3a1424';x.textAlign='left';x.font='bold 15px Georgia';x.fillText('💰 '+money(K.money)+'  ·  Day '+K.day+' '+String(Math.floor(K.hour)).padStart(2,'0')+':'+(K.hour%1?'30':'00'),516,26);
 x.font='13px Georgia';x.fillText('⭐ '+TIERS[tier()][1]+' · net worth '+money(K.worth)+' · '+Math.round(K.fans).toLocaleString()+' fans · '+Math.round(K.streams).toLocaleString()+' streams',8,56);
 x.fillStyle='rgba(255,255,255,.8)';rr(560,40,330,0,0);x.fillStyle='#5a2a3a';x.font='12px Georgia';K.log.slice(0,3).forEach((l,i)=>x.fillText(l,8,76+i*16));
 button('menu',800,42,90,30,'☰ Menu',()=>G.state='title',{fs:13});
 if(G.flash){x.fillStyle='rgba(58,20,36,.9)';rr(W/2-260,240,520,44,12);x.fill();x.fillStyle='#ffe9ef';x.font='bold 16px Georgia';x.textAlign='center';x.fillText(G.flash,W/2,268)}
 if(G.state==='win'){x.fillStyle='rgba(40,10,30,.88)';x.fillRect(0,0,W,H);kaz(W/2,330,2.4,'gold','happy');x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 46px Georgia';x.fillText('💎 BILLIONAIRE! 💎',W/2,120);x.fillStyle='#fff';x.font='18px Georgia';x.fillText('From small creator to billionaire in '+K.day+' days. Just like the song!',W/2,160);button('k',W/2-100,500,200,48,'Keep playing',()=>G.state='play')}}
startLoop();
