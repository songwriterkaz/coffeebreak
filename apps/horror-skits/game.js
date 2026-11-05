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
// ===== Coffeebreak Horror Skits =====
const DEMO=!!window.DEMO,SK=DEMO?'horrorDemo':'horrorSave';
let S={mine:[],shows:0,best:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const SCN=[['Haunted House','#1a1028','#3a2050','🏚️'],['Creepy Campsite','#0a1a14','#1a3a2a','🏕️'],['Spooky Library','#1a1410','#3a2a1a','📚'],['Midnight Graveyard','#0a0a1a','#2a2a3a','🪦'],['Foggy Lighthouse','#0a1420','#2a3a4a','🗼'],['Old Theatre','#200a10','#4a1424','🎭']];
const CAST=[['Scaredy Sam','😱','hr'],['Brave Bella','🦸‍♀️','hr'],['Ghost Hunter Gus','🕵️','hr'],['Sceptical Sue','🤨','hr'],['Kid Detective','🧒','hr'],['Ghost','👻','monster'],['Vampire','🧛','monster'],['Witch','🧙‍♀️','monster'],['Zombie (friendly)','🧟','monster'],['Werewolf','🐺','monster'],['Mummy','🫥','monster'],['Skeleton','💀','monster']];
const COST=['None','🎩','👑','🎀','🕶️','🧣','🎃'];
// performance beats: [speaker 0=hr 1=monster 2=narrator, line, [[choice,scare,laugh,sfx]...] , jump?]
const BEATS=[[2,'It was a dark and stormy night…',[['⚡ Thunder crash!',2,0,'thunder'],['🦉 An owl hoots',1,1,'owl'],['🐱 A cat meows',0,2,'meow']]],
[0,'Did you hear that?',[['😱 SCREAM!',1,2,'scream'],['😵 Faint dramatically',0,3,'thud'],['😎 "Probably just the wind."',0,1,null]]],
[2,'A door creeeeaks open by itself…',[['🚪 Slowly creak',2,0,'creak'],['💥 SLAM it shut',2,1,'slam'],['🎵 It squeaks like a rubber duck',0,3,'squeak']]],
[1,'Boo! I have come to haunt you!',[['👻 Wobble menacingly',2,1,'ghost'],['🕺 Do a spooky dance',0,3,'dance'],['🍪 Offer a cookie',0,2,null]],1],
[0,'What do you want from me?!',[['🙈 Hide behind the couch',1,2,'thud'],['🗣️ "I\'m not scared of you!"',0,1,null],['📸 Take a selfie with it',0,3,'click']]],
[1,'I want… someone to watch movies with. It\'s lonely being spooky.',[['🥺 Aww, that\'s sweet',0,2,null],['😨 A likely story!',1,1,'heart'],['🍿 Grab the popcorn',0,3,'pop']]],
[2,'Suddenly, the lights go OUT!',[['🔦 Torch under chin',2,1,'heart'],['😱 Everyone screams',2,2,'scream'],['💡 Someone just leaned on the switch',0,3,'click']],1],
[0,'…Okay. Same time next Friday?',[['👻 "BOO-tiful!"',0,3,'ghost'],['🤝 Spooky handshake',0,2,null],['🦇 Turns into a bat and flaps off',1,2,'flap']]]];
let AC=null;const ac=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC};
function nz(d,v,f,tp){const a=ac(),b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),q=b.getChannelData(0);for(let i=0;i<q.length;i++)q[i]=(Math.random()*2-1)*Math.pow(1-i/q.length,2);const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type=tp||'lowpass';fl.frequency.value=f;const g=a.createGain();g.gain.value=v;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start()}
function os(f,d,v,tp,f2){const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d+.05)}
const SFX={thunder:()=>{nz(2.5,.8,300);flash=1},owl:()=>{os(420,.3,.1);setTimeout(()=>os(380,.5,.1),400)},meow:()=>os(700,.5,.1,'triangle',400),scream:()=>{os(900,.8,.1,'sawtooth',1400);os(950,.8,.06,'square',1300)},thud:()=>{os(90,.3,.4,'sine',40);nz(.2,.4,400)},creak:()=>{os(160,1.4,.08,'sawtooth',260);os(175,1.4,.05,'sawtooth',240)},slam:()=>{nz(.4,.9,800);os(60,.4,.4)},squeak:()=>{os(1200,.15,.1,'square',1800);setTimeout(()=>os(1400,.15,.1,'square',2000),150)},ghost:()=>{os(300,1.6,.12,'sine',220);os(310,1.6,.06,'triangle',230)},dance:()=>[0,1,2,3].forEach(i=>setTimeout(()=>os([392,330,392,523][i],.15,.08,'square'),i*160)),click:()=>{nz(.05,.6,4000,'highpass');flash=.5},heart:()=>[0,1,2].forEach(i=>{setTimeout(()=>os(60,.15,.4),i*700);setTimeout(()=>os(55,.15,.3),i*700+180)}),pop:()=>[0,1,2,3,4].forEach(i=>setTimeout(()=>nz(.04,.5,2000,'highpass'),i*90)),flap:()=>[0,1,2,3].forEach(i=>setTimeout(()=>nz(.08,.3,700),i*120)),jump:()=>{nz(.6,1,2000,'highpass');os(200,.6,.3,'sawtooth',80);flash=1},applause:()=>{for(let i=0;i<30;i++)setTimeout(()=>nz(.05,.25,3000,'highpass'),Math.random()*2000)},laugh:()=>[0,1,2,3].forEach(i=>setTimeout(()=>os(300-i*20,.12,.08,'triangle'),i*140))};
let sc=0,hr=0,mon=5,costH=0,costM=0,beat=0,scare=0,laugh=0,line='',pick=null,flash=0,jumpT=0,cur=null,mi=0,mineSel=-1;
function startShow(){beat=0;scare=0;laugh=0;cur=null;G.state='show';say(BEATS[0])}
function say(b){line=b[1];pick=null}
function choose(i){const b=BEATS[beat],c2=b[2][i];scare+=c2[1];laugh+=c2[2];if(c2[3])SFX[c2[3]]();pick=i;if(b[3]&&i===0){setTimeout(()=>{jumpT=1;SFX.jump()},500)}setTimeout(()=>{beat++;if(beat>=BEATS.length||(DEMO&&beat>=4)){endShow()}else say(BEATS[beat])},1500)}
function endShow(){G.state='end';SFX.applause();S.shows++;const sc2=scare*5+laugh*5;S.best=Math.max(S.best,sc2);G.score=S.best;G.level=S.shows;save();if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Bravo! The full game has the whole 8-beat skit, 6 spooky scenes, 12 characters, costumes and the Skit Maker to write, save and perform your own horror skits.'),2500)}
function stageBg(){const s=SCN[sc];const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,s[1]);g.addColorStop(1,s[2]);x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,255,230,.9)';x.beginPath();x.arc(760,90,40,0,7);x.fill();x.fillStyle=s[1];x.beginPath();x.arc(745,80,36,0,7);x.fill();
 emo(s[3],150,330,120);x.fillStyle='rgba(200,200,220,.08)';for(let i=0;i<5;i++){x.beginPath();x.ellipse((i*230+t*20)%1100-100,470+Math.sin(t+i)*10,180,30,0,0,7);x.fill()}
 x.fillStyle='#5a0a1a';x.fillRect(0,0,60,600);x.fillRect(840,0,60,600);x.fillRect(0,0,900,30);for(let i=0;i<8;i++){x.fillStyle='rgba(0,0,0,.2)';x.fillRect(i*8,0,3,600);x.fillRect(840+i*8,0,3,600)}x.fillStyle='#2a1a10';x.fillRect(0,520,900,80)}
function actor(e,c2,X,Y,s,sp){const b=Math.sin(t*(sp?6:2))*(sp?6:3);x.fillStyle='rgba(255,255,200,.12)';x.beginPath();x.moveTo(X-20,0);x.lineTo(X-90,Y+70);x.lineTo(X+90,Y+70);x.lineTo(X+20,0);x.fill();emo(e,X,Y+b,s);if(c2)emo(COST[c2],X,Y-s*.55+b,s*.45)}
function drawShow(){stageBg();const H=CAST[hr],M=CAST[mon];const b=BEATS[Math.min(beat,BEATS.length-1)];actor(H[1],costH,330,420,110,b[0]===0);actor(M[1],costM,600,420+(b[0]===1?0:30),b[0]===1?130:100,b[0]===1);
 const who=b[0]===0?H[0]:b[0]===1?M[0]:'Narrator';x.fillStyle='rgba(0,0,0,.75)';rr(120,50,660,90,16);x.fill();T(who+':',140,80,16,'#ffb0d0');x.fillStyle='#fff';x.font='italic 22px Georgia';wrapT('“'+line+'”',140,112,620,26);
 if(pick===null)b[2].forEach((c2,i)=>button('c'+i,90+i*245,155,235,52,c2[0],()=>choose(i),{fs:14,bg:'#2a0a20'}));else T('🎭 '+b[2][pick][0],450,190,20,'#ffd24a','center');
 x.fillStyle='rgba(0,0,0,.6)';rr(620,530,260,56,10);x.fill();T('😱 Scare '+scare,640,565,18,'#c8a0ff');T('😂 Laugh '+laugh,760,565,18,'#ffd24a');T('Beat '+(beat+1)+' / '+(DEMO?4:BEATS.length),70,565,16,'#fff');
 if(jumpT>0){x.fillStyle='rgba(0,0,0,'+(jumpT*.8)+')';x.fillRect(0,0,900,600);emo(M[1],450,320,300*(1.4-jumpT*.4));}if(flash>0){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,900,600)}}
function drawEnd(){stageBg();actor(CAST[hr][1],costH,330,420,110,1);actor(CAST[mon][1],costM,600,420,110,1);x.fillStyle='rgba(0,0,0,.75)';rr(200,60,500,260,20);x.fill();T('🎭 Curtain call!',450,110,34,'#ffd24a','center');T('😱 Scares: '+scare+'    😂 Laughs: '+laugh,450,160,20,'#fff','center');
 const v=scare>laugh*1.3?'A truly terrifying performance! 👻':laugh>scare*1.3?'The audience were in stitches! 😂':'The perfect scare-comedy! ⭐';T(v,450,200,20,'#ffb0d0','center');T('⭐'.repeat(Math.min(5,1+Math.floor((scare+laugh)/4))),450,250,34,'#ffd24a','center');for(let i=0;i<14;i++)emo('👏',100+i*55,560+Math.sin(t*12+i)*6,30);
 button('again',260,280,180,46,'🔁 Perform again',startShow,{fs:15});button('menu',460,280,180,46,'🏠 Menu',()=>{G.state='title'},{fs:15})}
function drawSetup(){stageBg();x.fillStyle='rgba(0,0,0,.7)';rr(70,40,760,470,20);x.fill();T('Set the stage',450,80,28,'#ffd24a','center');
 T('Scene',90,118,16,'#ffb0d0');SCN.forEach((s,i)=>button('s'+i,160+i*110,98,104,32,s[3]+' '+s[0].split(' ')[1],()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All 6 spooky scenes are in the full game!');return}sc=i},{sel:sc===i,fs:11}));
 T('Hero',90,170,16,'#ffb0d0');CAST.filter(c2=>c2[2]==='hr').forEach((c2,i)=>button('h'+i,160+i*132,150,126,34,c2[1]+' '+c2[0].split(' ').pop(),()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All 12 characters are in the full game!');return}hr=i},{sel:hr===i,fs:12}));
 T('Monster',90,222,16,'#ffb0d0');CAST.filter(c2=>c2[2]==='monster').forEach((c2,i)=>button('m'+i,160+i*95,202,90,34,c2[1]+' '+c2[0].split(' ')[0],()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('All 12 characters are in the full game!');return}mon=5+i},{sel:mon===5+i,fs:11}));
 T('Hero costume',90,274,16,'#ffb0d0');COST.forEach((c2,i)=>button('ch'+i,230+i*70,254,62,34,c2==='None'?'✖':c2,()=>{costH=i},{sel:costH===i,fs:16}));T('Monster costume',90,326,16,'#ffb0d0');COST.forEach((c2,i)=>button('cm'+i,230+i*70,306,62,34,c2==='None'?'✖':c2,()=>{costM=i},{sel:costM===i,fs:16}));
 actor(CAST[hr][1],costH,330,440,70,0);actor(CAST[mon][1],costM,560,440,70,0);button('go',640,420,170,60,'🎬 Action!',startShow,{fs:20,bg:'#8a1030',fg:'#fff'});button('bk',90,450,120,40,'← Back',()=>{G.state='title'},{fs:14})}
// ---- skit maker (DOM form) ----
const fx=['none','jumpscare','thunder','creak','ghost','scream','slam','heart','laugh'];
const mk=document.createElement('div');mk.style.cssText='position:absolute;display:none;z-index:7;left:50%;top:10px;transform:translateX(-50%);width:min(92%,760px);max-height:86%;overflow:auto;background:#1a0a14;border:2px solid #e8a0b0;border-radius:14px;padding:12px;color:#ffe9ef;font:14px Georgia';c.parentNode.style.position='relative';c.parentNode.appendChild(mk);
mk.addEventListener('keydown',e=>e.stopPropagation());mk.addEventListener('mousedown',e=>e.stopPropagation());
function opt(a,v){return a.map((o,i)=>'<option value="'+i+'"'+(i==v?' selected':'')+'>'+o+'</option>').join('')}
function openMaker(sk){G.state='maker';sk=sk||{title:'',sc:0,h:0,m:5,lines:[{w:2,t:'',f:0}]};const Ls=sk.lines.map((l,i)=>'<div style="display:flex;gap:6px;margin:4px 0"><select class=lw>'+opt(['Hero','Monster','Narrator'],l.w)+'</select><input class=lt maxlength=120 style="flex:1" value="'+String(l.t).replace(/"/g,'&quot;')+'" placeholder="Line '+(i+1)+'…"><select class=lf>'+opt(fx,l.f)+'</select></div>').join('');
 mk.innerHTML='<b style="font-size:20px;color:#ffd24a">✍️ Skit Maker</b><div style="margin:8px 0">Title <input id=mt maxlength=40 value="'+String(sk.title).replace(/"/g,'&quot;')+'" style="width:60%"></div><div>Scene <select id=ms>'+opt(SCN.map(s=>s[0]),sk.sc)+'</select> Hero <select id=mh>'+opt(CAST.filter(c2=>c2[2]==='hr').map(c2=>c2[0]),sk.h)+'</select> Monster <select id=mm>'+opt(CAST.filter(c2=>c2[2]==='monster').map(c2=>c2[0]),sk.m-5)+'</select></div><div id=ml style="margin-top:8px">'+Ls+'</div><button id=ma>+ Add line</button> <button id=mp>🎬 Perform</button> <button id=mv>💾 Save</button> <button id=mx>✖ Close</button><div id=mlist style="margin-top:10px"></div>';
 mk.querySelectorAll('input,select').forEach(el=>{el.style.cssText+=';background:#2a1020;color:#fff;border:1px solid #e8a0b0;border-radius:6px;padding:4px'});mk.querySelectorAll('button').forEach(b=>b.style.cssText='background:#e8a0b0;color:#1a0a10;border:0;border-radius:8px;padding:6px 10px;margin:4px 2px;font:bold 14px Georgia;cursor:pointer');
 const read=()=>({title:mk.querySelector('#mt').value.trim()||'Untitled skit',sc:+mk.querySelector('#ms').value,h:+mk.querySelector('#mh').value,m:5+ +mk.querySelector('#mm').value,lines:[...mk.querySelectorAll('#ml>div')].map(d=>({w:+d.querySelector('.lw').value,t:d.querySelector('.lt').value,f:+d.querySelector('.lf').value})).filter(l=>l.t.trim())});
 mk.querySelector('#ma').onclick=()=>{const s2=read();if(s2.lines.length>=12)return;s2.lines.push({w:s2.lines.length%2,t:'',f:0});openMaker(s2)};mk.querySelector('#mx').onclick=()=>{mk.style.display='none';G.state='title'};
 mk.querySelector('#mp').onclick=()=>{const s2=read();if(!s2.lines.length)return;mk.style.display='none';playMine(s2)};
 mk.querySelector('#mv').onclick=()=>{const s2=read();if(!s2.lines.length)return;if(DEMO){window.demoEnd&&window.demoEnd('Saving your own skits is in the full game!');return}const i=S.mine.findIndex(z=>z.title===s2.title);if(i>=0)S.mine[i]=s2;else S.mine.push(s2);save();openMaker(s2)};
 const ml=mk.querySelector('#mlist');ml.innerHTML=S.mine.length?'<b>My saved skits:</b> ':'';S.mine.forEach((z,i)=>{const b=document.createElement('button');b.textContent='🎭 '+z.title;b.style.cssText='background:#3a1424;color:#ffe9ef;border:1px solid #e8a0b0;border-radius:8px;padding:4px 8px;margin:3px;cursor:pointer';b.onclick=()=>openMaker(z);ml.appendChild(b);const d=document.createElement('button');d.textContent='🗑';d.style.cssText=b.style.cssText;d.onclick=()=>{S.mine.splice(i,1);save();openMaker()};ml.appendChild(d)});mk.style.display='block'}
let ms=null;function playMine(s2){ms={s:s2,i:-1,t:0};sc=s2.sc;hr=s2.h;mon=s2.m;G.state='mine';stepMine()}
function stepMine(){ms.i++;ms.t=0;if(ms.i>=ms.s.lines.length){G.state='end';scare=ms.s.lines.filter(l=>l.f&&l.f!==8).length;laugh=ms.s.lines.length;SFX.applause();return}const l=ms.s.lines[ms.i];const f=fx[l.f];if(f==='jumpscare'){setTimeout(()=>{jumpT=1;SFX.jump()},600)}else if(f!=='none')SFX[f]()}
function drawMine(){stageBg();const l=ms.s.lines[Math.min(ms.i,ms.s.lines.length-1)];actor(CAST[hr][1],0,330,420,110,l.w===0);actor(CAST[mon][1],0,600,420,l.w===1?130:100,l.w===1);x.fillStyle='rgba(0,0,0,.75)';rr(120,50,660,90,16);x.fill();T(ms.s.title+' · '+(l.w===0?CAST[hr][0]:l.w===1?CAST[mon][0]:'Narrator'),140,80,16,'#ffb0d0');x.fillStyle='#fff';x.font='italic 22px Georgia';wrapT('“'+l.t+'”',140,112,620,26);
 button('nx',360,160,180,46,ms.i<ms.s.lines.length-1?'Next line ▶':'🎭 Take a bow',stepMine,{fs:16});if(jumpT>0){x.fillStyle='rgba(0,0,0,'+(jumpT*.8)+')';x.fillRect(0,0,900,600);emo(CAST[mon][1],450,320,300*(1.4-jumpT*.4))}if(flash>0){x.fillStyle='rgba(255,255,255,'+flash+')';x.fillRect(0,0,900,600)}}
function drawTitle(){stageBg();x.save();x.shadowColor='#b06aff';x.shadowBlur=30;T('Coffeebreak',450,150,30,'#ffb0d0','center');T('Horror Skits',450,215,64,'#fff','center');x.restore();T('Spooky. Silly. Never gory.',450,255,18,'#ffd24a','center','');['👻','🧛','🧙‍♀️','🧟','💀'].forEach((e,i)=>emo(e,250+i*100,320+Math.sin(t*2+i)*10,54));
 button('perf',230,380,210,58,'🎬 Perform a skit',()=>{G.state='setup';ac()},{fs:18,bg:'#8a1030',fg:'#fff'});button('make',460,380,210,58,'✍️ Skit Maker',()=>openMaker(),{fs:18});T('Shows performed: '+S.shows+(S.mine.length?' · Saved skits: '+S.mine.length:''),450,470,14,'#ffb0d0','center','')}
bindInput({});
function update(dt){if(flash>0)flash=Math.max(0,flash-dt*2.5);if(jumpT>0)jumpT=Math.max(0,jumpT-dt*1.2)}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title'||s==='maker')drawTitle();else if(s==='setup')drawSetup();else if(s==='show')drawShow();else if(s==='end')drawEnd();else if(s==='mine')drawMine();x.textAlign='left'}
window.HS={G,S,startShow,choose,openMaker,playMine,get beat(){return beat}};startLoop();
