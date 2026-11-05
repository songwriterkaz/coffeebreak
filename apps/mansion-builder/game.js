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
// ---- Coffeebreak Mansion Builder ----
const DEMO=()=>!!window.DEMO,SONG='https://music.apple.com/au/album/billionaire/1542958072?i=1542958079';
const ROOMS=[['foyer','Grand foyer','🏛️',30,'#f6e0b0'],['pool','Pool','🏊',60,'#8ad0f0'],['studio','Home studio','🎙️',100,'#c8a0e8'],['ward','Walk-in wardrobe','👗',150,'#ffc0d8'],['kitchen','Candy kitchen','🍭',220,'#ffd0e8'],['cinema','Cinema','🎬',300,'#5a2a4a'],['garden','Gardens','🌹',400,'#a8e0a0'],['gold','Billionaire wing','💎',600,'#ffd75a']];
const VIS=['🏰','💰','🌹','💎','🚗','✈️','🏝️','💍','🎤','🍾','🐾','👑','🌙','💖','🏆','🎵'];
const S=JSON.parse(localStorage.mansionSave||'null')||{en:20,vibe:50,lv:{},board:[],affs:[],grats:[],total:0};
const G={state:'title',score:0,level:0,spk:[],msg:'',msgT:0,vis:null};window.G=G;window.S=S;
function save(){localStorage.mansionSave=JSON.stringify(S);G.level=Object.keys(S.lv).length;G.score=Math.round(S.total)}
function gain(n,why,X=W/2,Y=300){const g=Math.round(n*(1+S.vibe/100));S.en+=g;S.total+=g;S.vibe=Math.min(100,S.vibe+n/2);say('+'+g+' ✨ '+why);for(let i=0;i<30;i++)G.spk.push({x:X,y:Y,vx:(Math.random()-.5)*300,vy:(Math.random()-.8)*300,l:1+Math.random()});save()}
function say(s){G.msg=s;G.msgT=3}
function words(){const v=$('aff').value.trim();$('aff').value='';return v}
$('affb').onclick=()=>{startMusic();const v=words();if(v.length<4)return say('Type an affirmation first, e.g. "I am a magnet for abundance"');if(S.affs.includes(v.toLowerCase()))return say('Say something new to raise your vibration ✨');S.affs.unshift(v.toLowerCase());gain(10+Math.min(10,v.split(' ').length),'Affirmation received by the universe')};
$('grb').onclick=()=>{startMusic();const v=words();if(v.length<3)return say('Type something you are grateful for 🙏');S.grats.unshift(v);gain(12,'Gratitude multiplies abundance')};
const cost=r=>{const L=S.lv[r[0]]||0;return Math.round(r[3]*Math.pow(1.6,L))};
function buy(i){const r=ROOMS[i];if(DEMO()&&i>2)return demoEnd('You built your first 3 rooms in the free demo of <b>Coffeebreak Mansion Builder</b>! The walk-in wardrobe, candy kitchen, cinema, gardens and the gold Billionaire wing are in the full game.');
 if(i>0&&!S.lv[ROOMS[i-1][0]])return say('Manifest the '+ROOMS[i-1][1]+' first');if((S.lv[r[0]]||0)>=3)return say('Already at max luxury!');const c=cost(r);if(S.en<c)return say('Need '+c+' ✨. Affirm, give thanks, visualise!');
 S.en-=c;S.lv[r[0]]=(S.lv[r[0]]||0)+1;say((S.lv[r[0]]>1?'Upgraded ':'Manifested ')+r[1]+' '+r[2]+'!');const p=slot(i);for(let k=0;k<60;k++)G.spk.push({x:p.x+90,y:p.y+50,vx:(Math.random()-.5)*400,vy:(Math.random()-.8)*400,l:1.5});save();if(i===7)G.state='bill'}
function slot(i){return{x:330+(i%4)*140,y:i<4?300:170}}
bindInput({down(p){if(G.vis){G.vis.hold=true}},up(){if(G.vis)G.vis.hold=false}});
function update(dt){G.msgT-=dt;S.vibe=Math.max(0,S.vibe-dt*.5);G.spk.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=300*dt;s.l-=dt});G.spk=G.spk.filter(s=>s.l>0);
 const v=G.vis;if(v){if(v.hold)v.t+=dt;if(v.t>=6){G.vis=null;G.state='play';gain(25,'Visualisation complete. You can see it, so you can have it!')}}}
function mansion(){x.fillStyle='#d8b8e8';x.beginPath();x.moveTo(320,170);x.lineTo(600,70);x.lineTo(880,170);x.fill();x.fillStyle='#fff3f7';x.fillRect(320,170,560,240);
 ROOMS.forEach((r,i)=>{const p=slot(i),L=S.lv[r[0]]||0;x.fillStyle=L?r[4]:'rgba(90,60,90,.25)';rr(p.x+4,p.y+4,132,102,8);x.fill();
  if(L){emo(r[2],p.x+70,p.y+46,34+L*6);for(let k=0;k<L;k++)emo('⭐',p.x+18+k*16,p.y+18,12);if(i===7){x.fillStyle='rgba(255,255,255,'+(.3+.3*Math.sin(t*4))+')';x.fillRect(p.x+4,p.y+4,132,102)}}
  else{x.fillStyle='#8a6a8a';x.font='30px serif';x.textAlign='center';x.fillText(DEMO()&&i>2?'🔒':'?',p.x+70,p.y+56)}
  x.fillStyle=L&&i===5?'#fff':'#3a1424';x.font='bold 12px Georgia';x.textAlign='center';x.fillText(r[1],p.x+70,p.y+92)});
 x.fillStyle='#7ac06a';x.fillRect(300,410,600,20)}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1040');g.addColorStop(1,'#e8a0c0');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){x.fillStyle='rgba(255,215,90,'+(.3+.4*Math.sin(t*2+i))+')';x.fillRect((i*157)%W,(i*83)%300,2,2)}
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 40px Georgia';x.fillText('🏰 Law of Attraction Mansion Builder',W/2,140);x.fillStyle='#fff3f7';x.font='18px Georgia';
  ['Write affirmations and gratitude above, build a vision board and visualise,','to raise your manifesting energy ✨. Spend it to manifest your dream mansion,','all the way to the gold Billionaire wing! 💎'].forEach((s,i)=>x.fillText(s,W/2,200+i*28));
  button('p',W/2-110,320,220,54,'✨ Start manifesting',()=>{startMusic();G.state='play'});button('s',W/2-110,390,220,44,'🎵 Get the song: Billionaire',()=>open(SONG,'_blank'),{fs:14,ac:'#ffd75a'});
  if(DEMO()){x.fillStyle='#ffd75a';x.font='15px Georgia';x.fillText('Demo: the first 3 rooms. The full game has all 8 rooms and upgrades.',W/2,470)}return}
 mansion();
 // left panel
 x.fillStyle='rgba(26,10,30,.8)';rr(10,10,290,580,14);x.fill();x.textAlign='left';x.fillStyle='#ffd75a';x.font='bold 22px Georgia';x.fillText('✨ '+Math.floor(S.en)+' energy',24,42);
 x.fillStyle='#fff3f7';x.font='13px Georgia';x.fillText('Positive vibes',24,66);x.fillStyle='#3a1424';rr(24,72,262,18,9);x.fill();const vg=x.createLinearGradient(24,0,286,0);vg.addColorStop(0,'#ff7aaa');vg.addColorStop(1,'#ffd75a');x.fillStyle=vg;rr(24,72,262*S.vibe/100,18,9);x.fill();
 x.fillStyle='#fff3f7';x.fillText('Energy bonus: x'+(1+S.vibe/100).toFixed(2),24,108);
 button('vz',24,118,262,40,'🧘 Visualise (hold 6s)',()=>{startMusic();G.vis={t:0,hold:false};G.state='vis'},{fs:15});
 x.textAlign='left';x.fillStyle='#ffd75a';x.font='bold 14px Georgia';x.fillText('Vision board (tap to add, +5 ✨)',24,182);
 VIS.forEach((e,i)=>{const X=24+(i%8)*33,Y=190+Math.floor(i/8)*34;button('v'+i,X,Y,30,30,'',()=>{if(S.board.length>=12)return say('Your vision board is full of dreams!');S.board.push(e);gain(5,'Added to your vision board',X,Y)},{fs:12});emo(e,X+15,Y+15,18)});
 x.fillStyle='#fff3e0';rr(24,262,262,92,8);x.fill();S.board.forEach((e,i)=>emo(e,40+(i%6)*44,284+Math.floor(i/6)*44,30));
 x.textAlign='left';x.fillStyle='#ffd75a';x.font='bold 14px Georgia';x.fillText('Manifest rooms',24,378);
 ROOMS.forEach((r,i)=>{const L=S.lv[r[0]]||0,Y=386+i*24;button('r'+i,24,Y,262,21,r[2]+' '+r[1]+(L>=3?' ★MAX':' · '+cost(r)+'✨'+(L?' (upgrade)':'')),()=>buy(i),{fs:12,dis:DEMO()&&i>2&&false,ac:i===7?'#ffd75a':undefined})});
 if(S.affs[0]){x.fillStyle='#ffd75a';x.font='italic 16px Georgia';x.textAlign='center';x.fillText('"'+S.affs[0]+'"',600,470)}
 if(S.grats[0]){x.fillStyle='#fff3f7';x.font='14px Georgia';x.textAlign='center';x.fillText('🙏 Grateful for '+S.grats[0],600,496)}
 button('song',490,520,220,36,'🎵 Get the song: Billionaire',()=>open(SONG,'_blank'),{fs:14,ac:'#ffd75a'});
 for(const s of G.spk){x.fillStyle='rgba(255,215,90,'+Math.min(1,s.l)+')';x.beginPath();x.arc(s.x,s.y,3,0,7);x.fill()}
 if(G.msgT>0){x.globalAlpha=Math.min(1,G.msgT);x.fillStyle='rgba(26,10,30,.85)';rr(330,16,540,36,10);x.fill();x.fillStyle='#ffd75a';x.font='bold 15px Georgia';x.textAlign='center';x.fillText(G.msg,600,40);x.globalAlpha=1}
 if(G.state==='vis'){const v=G.vis;x.fillStyle='rgba(20,6,30,.88)';x.fillRect(0,0,W,H);const br=60+40*Math.sin(v.t*1.05);x.fillStyle='rgba(255,215,90,.25)';x.beginPath();x.arc(W/2,280,br+40,0,7);x.fill();x.fillStyle='#ffd75a';x.beginPath();x.arc(W/2,280,br,0,7);x.fill();emo('🏰',W/2,280,40);
  x.fillStyle='#fff3f7';x.font='20px Georgia';x.textAlign='center';x.fillText(v.hold?(Math.sin(v.t*1.05)>0?'Breathe in… see your dream home':'Breathe out… feel it is already yours'):'Press and hold anywhere to visualise',W/2,430);x.fillStyle='#3a1424';rr(W/2-150,450,300,14,7);x.fill();x.fillStyle='#ffd75a';rr(W/2-150,450,300*v.t/6,14,7);x.fill()}
 if(G.state==='bill'){x.fillStyle='rgba(40,20,0,.85)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 46px Georgia';x.fillText('💎 BILLIONAIRE WING MANIFESTED 💎',W/2,230);x.fillStyle='#fff';x.font='18px Georgia';x.fillText('You attracted your dream mansion. Now play the anthem!',W/2,272);
  button('gs',W/2-230,320,220,50,'🎵 Get the song',()=>open(SONG,'_blank'),{ac:'#ffd75a'});button('k',W/2+10,320,220,50,'Keep building',()=>G.state='play')}}
save();startLoop();
