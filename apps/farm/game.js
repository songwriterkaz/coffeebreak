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
// ===== Coffeebreak Farm =====
const DEMO=!!window.DEMO,SK=DEMO?'farmDemo':'farmSave';
const CR={wheat:['🌾',10,3,25,'Autumn'],carrot:['🥕',15,4,35,'Spring'],tomato:['🍅',20,5,50,'Summer'],corn:['🌽',25,6,65,'Summer'],pumpkin:['🎃',40,8,110,'Autumn'],strawberry:['🍓',30,5,80,'Spring'],cabbage:['🥬',18,4,45,'Winter'],potato:['🥔',12,4,30,'Winter']};
const AN={cow:['🐄',150,'milk','🥛',40],chicken:['🐔',60,'egg','🥚',15],sheep:['🐑',120,'wool','🧶',35]};
const SEAS=['Spring','Summer','Autumn','Winter'],SC=[['#bfe8a0','#7cc860'],['#e8f0a0','#a8c850'],['#f0d090','#c89850'],['#e8f0f8','#b8c8d8']];
let S={gold:120,day:1,plots:[],ani:[],inv:{},barn:1,seeds:{wheat:4,carrot:4},sold:0};
try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
if(!S.plots.length)for(let i=0;i<24;i++)S.plots.push(null);
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:S.gold,level:S.day};window.G=G;
let tool='water',seed='wheat',dayT=0,msg='',msgT=0,tab='farm';const DAYLEN=45;
const sea=()=>SEAS[Math.floor((S.day-1)/7)%4];
const cap=()=>4+S.barn*4;const invN=()=>Object.values(S.inv).reduce((a,b)=>a+b,0);
function say(m){msg=m;msgT=3}
function tap(i){const p=S.plots[i];
 if(tool==='plant'){if(p)return say('That plot is busy.');if(!(S.seeds[seed]>0))return say('No '+seed+' seeds — visit the market!');S.seeds[seed]--;S.plots[i]={c:seed,g:0,w:0};say('Planted '+seed+'.')}
 else if(tool==='water'){if(!p)return say('Plant something first.');p.w=1;say('Watered 💧')}
 else if(tool==='harvest'){if(!p)return;if(p.g<CR[p.c][2])return say('Not ready yet.');if(invN()>=cap()*3)return say('Barn is full! Sell or upgrade.');S.inv[p.c]=(S.inv[p.c]||0)+(sea()===CR[p.c][4]?2:1);S.plots[i]=null;say('Harvested '+CR[p.c][0]+(sea()===CR[p.c][4]?' — in season, double!':''))}save()}
function newDay(){S.day++;dayT=0;S.plots.forEach(p=>{if(p&&p.w){p.g++;p.w=0}});
 S.ani.forEach(a=>{if(a.fed){S.inv[AN[a.k][2]]=(S.inv[AN[a.k][2]]||0)+1;a.happy=Math.min(5,(a.happy||3)+1)}else a.happy=Math.max(0,(a.happy||3)-1);a.fed=0});
 say('🌅 Day '+S.day+' — '+sea()+(S.day%7===1&&S.day>1?' has arrived!':''));G.level=S.day;save();
 if(DEMO&&S.day>3)window.demoEnd&&window.demoEnd('Your farm is growing! The full game has all 4 seasons, 8 crops, cows, sheep, barn upgrades and saves forever.')}
function price(k){if(CR[k])return CR[k][3]*(sea()===CR[k][4]?1:1.2)|0;for(const a in AN)if(AN[a][2]===k)return AN[a][4];return 5}
function sellAll(){let g=0;for(const k in S.inv){g+=price(k)*S.inv[k];S.sold+=S.inv[k]}S.inv={};S.gold+=g;G.score=S.gold;say(g?'Sold for '+g+' 🪙':'Nothing to sell.');save()}
function upCost(){return 200*S.barn*S.barn}
function bg(){const s=SC[Math.floor((S.day-1)/7)%4];const dark=Math.max(0,(dayT/DAYLEN-.75)*2);const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#9ad8ff');g.addColorStop(.3,s[0]);g.addColorStop(1,s[1]);x.fillStyle=g;x.fillRect(0,0,900,600);
 emo(dayT/DAYLEN<.75?'☀️':'🌙',60+dayT/DAYLEN*780,50,40);if(sea()==='Winter'){x.fillStyle='#fff';for(let i=0;i<40;i++)x.fillRect((i*97+t*20)%900,(i*53+t*40)%600,3,3)}
 if(sea()==='Autumn')for(let i=0;i<10;i++)emo('🍂',(i*91+t*30)%900,(i*67+t*25)%600,16);x.fillStyle='rgba(10,10,40,'+dark*.4+')';x.fillRect(0,0,900,600)}
function hud(){x.fillStyle='rgba(60,35,15,.85)';rr(10,8,880,44,12);x.fill();T('🪙 '+S.gold,24,38,20,'#ffd24a');T('Day '+S.day+' · '+sea(),160,38,20,'#fff');T('📦 '+invN()+'/'+cap()*3,310,38,18,'#ffe9c7');
 [['farm','🌱 Fields'],['ani','🐄 Animals'],['mkt','🏪 Market'],['barn','🏠 Barn']].forEach((b,i)=>button('tb'+i,395+i*96,14,92,32,b[1],()=>{tab=b[0]},{sel:tab===b[0],bg:'#5a3a1a',ac:'#ffd24a',fs:14}))}
function drawFarm(){S.plots.forEach((p,i)=>{const X=60+(i%6)*100,Y=90+Math.floor(i/6)*95;x.fillStyle=p&&p.w?'#5a3418':'#8a5a30';rr(X,Y,88,82,10);x.fill();x.strokeStyle='#4a2a10';x.lineWidth=2;x.stroke();BTN['p'+i]={x:X,y:Y,w:88,h:82,fn:()=>tap(i)};
  if(p){const c=CR[p.c],k=Math.min(1,p.g/c[2]);if(k>=1){emo(c[0],X+44,Y+42+Math.sin(t*3+i)*2,44)}else emo(p.g?'🌿':'🌱',X+44,Y+44,18+k*24);x.fillStyle='#fff8';x.fillRect(X+8,Y+72,72,5);x.fillStyle='#5ad870';x.fillRect(X+8,Y+72,72*k,5);if(p.w)emo('💧',X+76,Y+14,14)}});
 x.fillStyle='rgba(255,248,230,.95)';rr(680,64,210,460,14);x.fill();T('Tools',785,92,20,'#5a3a1a','center');
 [['plant','🌱 Plant'],['water','💧 Water'],['harvest','🧺 Harvest']].forEach((b,i)=>button('tl'+i,695,104+i*46,180,38,b[1],()=>{tool=b[0]},{sel:tool===b[0],bg:'#7a5a30',ac:'#ffd24a'}));
 T('Seeds',785,262,17,'#5a3a1a','center');Object.keys(CR).forEach((k,i)=>{const n=S.seeds[k]||0;button('sd'+k,695+(i%2)*92,272+Math.floor(i/2)*42,88,36,CR[k][0]+' '+n,()=>{seed=k;tool='plant'},{sel:seed===k&&tool==='plant',bg:'#7a5a30',ac:'#ffd24a',fs:15,dis:!n})});
 T('In season: '+Object.keys(CR).filter(k=>CR[k][4]===sea()).map(k=>CR[k][0]).join(' '),785,458,14,'#3a6a1a','center');button('sleep',695,472,180,42,'😴 Sleep (next day)',newDay,{bg:'#2a2a5a',ac:'#9ab0ff',fs:15})}
function drawAni(){x.fillStyle='#6ab048';rr(40,70,820,420,18);x.fill();x.strokeStyle='#8a5a30';x.lineWidth=6;x.stroke();
 if(!S.ani.length)T('No animals yet — buy some at the Market!',450,280,24,'#fff','center');
 S.ani.forEach((a,i)=>{const X=110+(i%6)*130,Y=150+Math.floor(i/6)*150;emo(AN[a.k][0],X+Math.sin(t+i)*8,Y,56);T('❤️'.repeat(a.happy||3),X,Y+44,12,'#fff','center');
  button('fd'+i,X-50,Y+54,100,32,a.fed?'✅ Fed':'🌾 Feed',()=>{a.fed=1;S.ani[i]=a;save();say('Fed the '+a.k+'!')},{dis:a.fed,bg:'#5a3a1a',fs:14})});T('Fed animals give milk, eggs and wool overnight.',450,520,16,'#2a4a1a','center');button('sleep2',350,530,200,40,'😴 Sleep',newDay,{bg:'#2a2a5a',ac:'#9ab0ff',fs:15})}
function drawMkt(){x.fillStyle='rgba(255,248,230,.95)';rr(40,70,820,470,18);x.fill();T('Village Market',450,108,28,'#a03a1a','center');
 T('Buy seeds (packet of 3)',240,145,18,'#5a3a1a','center');Object.keys(CR).forEach((k,i)=>{const pr=CR[k][1];button('bs'+k,70+(i%2)*170,160+Math.floor(i/2)*50,160,42,CR[k][0]+' '+k+' '+pr+'🪙',()=>{if(S.gold<pr)return say('Not enough gold.');S.gold-=pr;S.seeds[k]=(S.seeds[k]||0)+3;save();say('Bought '+k+' seeds.')},{bg:'#7a5a30',fs:14,dis:S.gold<pr})});
 T('Buy animals',640,145,18,'#5a3a1a','center');Object.keys(AN).forEach((k,i)=>{const pr=AN[k][1];button('ba'+k,520,160+i*54,240,44,AN[k][0]+' '+k+' '+pr+'🪙',()=>{if(S.gold<pr)return say('Not enough gold.');if(S.ani.length>=cap())return say('Barn is full — upgrade it!');S.gold-=pr;S.ani.push({k,fed:0,happy:3});save();say('Welcome, '+k+'!')},{bg:'#7a5a30',dis:S.gold<pr})});
 T('Your produce: '+(Object.keys(S.inv).filter(k=>S.inv[k]).map(k=>(CR[k]?CR[k][0]:Object.values(AN).find(a=>a[2]===k)[3])+S.inv[k]).join('  ')||'none'),640,350,17,'#2a2a2a','center');
 button('sell',540,380,200,50,'💰 Sell all',sellAll,{bg:'#3a7a2a',ac:'#c8ffa0'});T('In-season crops sell cheaper but harvest double.',640,460,13,'#7a5a30','center','')}
function drawBarn(){x.fillStyle='#a8322a';x.beginPath();x.moveTo(300,260);x.lineTo(450,140);x.lineTo(600,260);x.fill();x.fillRect(320,260,260,200);x.fillStyle='#fff';x.fillRect(420,340,60,120);T('Barn level '+S.barn,450,110,30,'#5a2a1a','center');
 T('Holds '+cap()+' animals and '+cap()*3+' produce',450,500,20,'#3a2a1a','center');button('up',330,515,240,48,'⬆ Upgrade '+upCost()+'🪙',()=>{if(S.gold<upCost())return say('Not enough gold.');S.gold-=upCost();S.barn++;save();say('Barn upgraded!');},{dis:S.gold<upCost()||(DEMO&&S.barn>=2)});T('Sold so far: '+S.sold+' items',450,590,13,'#3a2a1a','center','')}
function drawTitle(){bg();T('Coffeebreak',450,150,34,'#5a3a1a','center');T('Farm',450,240,96,'#fff','center');x.strokeStyle='#5a3a1a';x.lineWidth=3;x.strokeText('Farm',450,240);['🐄','🐔','🌾','🐑','🥕','🎃'].forEach((e,i)=>emo(e,200+i*100,320+Math.sin(t*2+i)*8,52));T('Plant, water, harvest. Grow a cosy farm through the seasons.',450,390,20,'#3a2a1a','center','');button('go',350,430,200,56,'🌱 Start farming',()=>{G.state='play'},{bg:'#5a3a1a',ac:'#ffd24a'})}
bindInput({});function update(dt){if(G.state!=='play')return;dayT+=dt;if(dayT>=DAYLEN)newDay();msgT-=dt}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')return drawTitle();bg();if(tab==='farm')drawFarm();else if(tab==='ani')drawAni();else if(tab==='mkt')drawMkt();else drawBarn();hud();if(msgT>0){x.fillStyle='rgba(40,25,10,.85)';rr(250,548,400,34,10);x.fill();T(msg,450,571,16,'#fff','center')}}
window.FM={G,S,tap,newDay,sellAll,set tool(v){tool=v},set tab(v){tab=v}};startLoop();
