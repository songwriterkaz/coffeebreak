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
// ===== Coffeebreak Endless Tale =====
const DEMO=!!window.DEMO,SK=DEMO?'etDemo':'etSave',DEMO_CH=5;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
const G={state:'title',score:0,level:0};window.G=G;
let seed=Date.now()%2147483647;function R(){seed=(seed*48271)%2147483647;return seed/2147483647}
const pick=a=>a[Math.floor(R()*a.length)];
function rnd(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}
// ---------- hand-written pools ----------
const WORLDS=[
{n:'the Lantern Marshes',k:'marsh',d:'where a thousand paper lanterns drift above black water, each one holding somebody\'s forgotten wish',c:['#1b2a3a','#5a7a6a'],a:'#ffcf6a'},
{n:'Glasswhistle Peaks',k:'peaks',d:'a range of crystal mountains that sing whenever the wind changes its mind',c:['#8ab4ff','#e8f0ff'],a:'#ffffff'},
{n:'the Upside-Down Orchard',k:'orchard',d:'where apple trees grow from the clouds and their roots dangle down like ribbons',c:['#ffd0e8','#a8e0a0'],a:'#e84a5a'},
{n:'the City of Folded Streets',k:'city',d:'a city that rearranges itself every midnight, so nobody ever lives at the same address twice',c:['#2a1a4a','#7a5aa8'],a:'#ffe08a'},
{n:'the Salt-Star Sea',k:'sea',d:'an ocean so clear you can see the stars that fell into it long ago, still glowing on the seabed',c:['#0a2a5a','#2a8ab4'],a:'#bff'},
{n:'the Hollowbark Forest',k:'forest',d:'where every tree is hollow and every hollow is somebody\'s front door',c:['#1a3a1a','#4a7a3a'],a:'#c8ff8a'},
{n:'the Desert of Slow Clocks',k:'desert',d:'where sand runs uphill and time moves at the speed of a sleepy tortoise',c:['#ffb46a','#ffe8b0'],a:'#8a4a1a'},
{n:'the Moth Library',k:'library',d:'an endless library kept by moths, where books flutter off the shelves if you read them too loudly',c:['#2a1a10','#6a4a2a'],a:'#ffe9c7'},
{n:'Emberfall Canyon',k:'canyon',d:'a red canyon where it rains warm sparks instead of water every evening',c:['#4a0a0a','#e8602a'],a:'#ffcf3a'},
{n:'the Cloudloom Steppes',k:'clouds',d:'rolling plains of cloud where weavers spin weather on enormous looms',c:['#a0c8ff','#fff0f8'],a:'#ff9ac8'},
{n:'the Frostbell Tundra',k:'snow',d:'a snowy wilderness where icicles chime like bells to warn of strangers',c:['#c0dcff','#ffffff'],a:'#6aa8ff'},
{n:'the Mushroom Undercity',k:'cave',d:'a glowing city built beneath the roots of the world, lit by giant mushrooms',c:['#120a20','#3a1a5a'],a:'#7affd0'},
{n:'the Isle of Paper Kites',k:'isle',d:'a little island tethered to the sky by ten thousand kite strings',c:['#7cc4ff','#ffe0a0'],a:'#ff6a8a'},
{n:'the Rust-Gold Wastes',k:'desert',d:'a plain of abandoned clockwork giants, their brass hearts still ticking faintly',c:['#6a3a1a','#c89a5a'],a:'#ffd06a'},
{n:'the Mirror Lakes',k:'sea',d:'twin lakes where your reflection sometimes walks off without you',c:['#203a5a','#9ac8e8'],a:'#ffffff'},
{n:'the Bramble Kingdom',k:'forest',d:'a kingdom of thorny hedges ruled by a very polite rose',c:['#2a1a1a','#6a2a3a'],a:'#ff5a7a'}];
const CREATURES=['a lantern-eyed owl the size of a cart','a shy dragon made entirely of autumn leaves','a mountain troll who knits scarves for avalanches','a choir of glowing jellyfish','a fox with a map tattooed on its tail','a giant snail carrying a whole village on its shell','a clockwork stag with emerald antlers','a cloud-whale that hums lullabies','a moth queen with wings like stained glass','a stone giant who has been asleep for nine hundred years','a crow who only speaks in riddles','a family of thunder-hedgehogs','a river spirit wearing a crown of reeds','a bear made of starlight','a tiny knight riding a beetle','a sphinx who has forgotten its own riddle','a salamander who guards the last candle','a tortoise with a lighthouse on its back','a bat-winged cat that steals shadows','a polite skeleton who runs a tea stall'];
const COMPANIONS=[
{n:'Pip Thimblewick',e:'🐭',d:'a mouse cartographer with a pencil behind each ear',s:'wisdom'},
{n:'Bramwell',e:'🦔',d:'a hedgehog knight who is brave about everything except moths',s:'courage'},
{n:'Oona Greymantle',e:'🦉',d:'an elderly owl witch who remembers the future',s:'wisdom'},
{n:'Fennick',e:'🦊',d:'a fox thief with a heart of gold (stolen, probably)',s:'cunning'},
{n:'Moss',e:'🌿',d:'a walking bundle of moss who communicates by blooming flowers',s:'heart'},
{n:'Captain Juniper Vale',e:'🧭',d:'a retired sky-pirate with one wooden leg and endless stories',s:'courage'},
{n:'Lumen',e:'✨',d:'a tiny star who fell out of the sky and wants to get home',s:'heart'},
{n:'Gorrick',e:'🪨',d:'a gentle rock golem who collects pretty pebbles',s:'courage'},
{n:'Sable',e:'🐈‍⬛',d:'a black cat who can walk through any door, even painted ones',s:'cunning'},
{n:'Tamsin Reedle',e:'🎻',d:'a travelling fiddler whose songs can open locks',s:'heart'},
{n:'Wick',e:'🕯️',d:'a living candle who is terrified of rain',s:'wisdom'},
{n:'Hollis',e:'🐢',d:'a tortoise sage who answers every question three days late',s:'wisdom'}];
const QUESTS=['find the Seed of the First Morning before the last sunrise fades','return a stolen song to the people who forgot how to sing','mend the crack running through the sky','find out why the stars have started going out one by one','deliver a sealed letter to someone who does not exist yet','wake the sleeping heart of the land','recover the missing chapter of the world\'s oldest book','free the wind, which has been locked in a jar','find the cartographer who drew this land and ask them to finish it','break the spell that has turned every colour grey','escort a lost dream back to its dreamer','discover who has been unwriting the roads'];
const FOES=['the Grey Quiet, a fog that eats stories','the Lord of Unfinished Things','a hungry shadow called the Blotter','the Ink Wolves, who erase whatever they bite','Madam Nevermind, who makes people forget why they came','the Rattling King, made of broken promises','the Fade, a nothingness spreading from the edges of the map','a jealous mirror called Vessel'];
const ITEMS=[
{n:'Lantern of Small Hopes',e:'🏮',d:'glows brighter the more hopeless things look'},
{n:'Compass that Points to Home',e:'🧭',d:'though it is not sure where home is'},
{n:'Feather Quill',e:'🪶',d:'anything written with it becomes a little bit true'},
{n:'Bottled Thunder',e:'⚡',d:'for emergencies only'},
{n:'Key of Second Chances',e:'🗝️',d:'opens any door you once walked away from'},
{n:'Pocket Moon',e:'🌙',d:'lights the way at night and pulls the tide a tiny bit'},
{n:'Cloak of Ordinary',e:'🧥',d:'makes the wearer completely unremarkable'},
{n:'Honey Cake',e:'🍯',d:'restores courage and makes friends of most beasts'},
{n:'Singing Shell',e:'🐚',d:'repeats the last kind thing anyone said'},
{n:'Thread of Return',e:'🧵',d:'never runs out, never tangles'},
{n:'Star Map',e:'🗺️',d:'its stars move to show where you should go'},
{n:'Clockwork Heart',e:'⚙️',d:'ticks louder near danger'},
{n:'Mirror Coin',e:'🪙',d:'shows the true face of whoever you look at'},
{n:'Seed of Maybe',e:'🌱',d:'grows into whatever is most needed'},
{n:'Riddle Stone',e:'🪨',d:'whispers one answer, once'}];
const TWISTS=['the creature you rescued earlier is actually the ruler of this land in disguise','the map you have been following was drawn by you, in a future you don\'t remember','the villain is simply lonely and has been trying to get somebody\'s attention for a century','the land itself is alive and has been listening to every word you said','your companion has been secretly writing this very story in a tiny notebook','the road behind you has vanished, so the only way is forward','the quest-giver was a reflection, and the real one is trapped in the mirror lakes','the treasure you seek is not an object at all, but a memory','the sky is the floor of another world, and someone up there is looking down at you','every door here opens onto the same room, except one'];
const PLACES=['an inn with no walls, only a roof and a lot of opinions','a bridge made of sleeping cats','a crossroads where the signposts argue','a tower of stacked teacups','a market that sells yesterday\'s weather','a ruined temple overgrown with singing vines','a ferry steered by a heron in a bowler hat','a garden where the statues play chess','a cave that echoes your thoughts instead of your words','a lighthouse at the edge of the map'];
const NAMES=['the Wayfarer','the Reader','the Lost Heir','the Lantern-Bearer','the Page-Turner','the Wanderer'];
// ---------- state ----------
let S={hero:'',cs:0,ch:0,pg:0,inv:[],comp:[],log:[],stats:{courage:1,wisdom:1,heart:1,cunning:1},world:null,quest:'',foe:'',page:null,seed:1};
function load(){try{const o=JSON.parse(localStorage.getItem(SK)||'null');if(o&&o.page)return o}catch(e){}return null}
function save(){try{S.seed=seed;localStorage.setItem(SK,JSON.stringify(S))}catch(e){}}
function addLog(t){S.log.push('Chapter '+S.ch+': '+t);if(S.log.length>600)S.log.shift()}
const has=n=>S.inv.some(i=>i.n===n);
function giveItem(){const pool=ITEMS.filter(i=>!has(i.n));if(!pool.length)return null;const it=pick(pool);S.inv.push(it);return it}
function giveComp(){const pool=COMPANIONS.filter(c=>!S.comp.some(z=>z.n===c.n));if(!pool.length||S.comp.length>=4)return null;const c=pick(pool);S.comp.push(c);return c}
function stat(k,v){S.stats[k]=(S.stats[k]||0)+v}
function best(){return Object.entries(S.stats).sort((a,b)=>b[1]-a[1])[0][0]}
// ---------- chapter / page generator ----------
function newChapter(){S.ch++;S.pg=0;let w;do{w=pick(WORLDS)}while(S.world&&w.n===S.world.n);S.world=w;S.quest=pick(QUESTS);S.foe=pick(FOES);S.creature=pick(CREATURES);S.place=pick(PLACES);S.twist=pick(TWISTS);S.art=Math.floor(R()*9999);
 if(DEMO&&S.ch>DEMO_CH){S.page=null;save();window.demoEnd&&window.demoEnd('Your tale has reached the end of Chapter '+DEMO_CH+' in the free demo. In the full game the story never ends: new worlds, companions and twists, forever.');return}
 addLog('Arrived in '+w.n+'.');makePage()}
function C(t,fn){return{t,fn}}
function makePage(){const w=S.world,h=S.hero,cp=S.comp.length?pick(S.comp):null,P=S.pg;let p;
 if(P===0)p={h:'Chapter '+S.ch+': '+w.n,t:pick(['The page turns, and ','A gust of wind riffles the book, and ','Ink spills across the paper and becomes a road. ','The words rearrange themselves, and '])+h+' steps into '+w.n+', '+w.d+'. A voice on the wind says only this: you must '+S.quest+'.',c:[
  C('Follow the main road towards '+S.place,()=>{stat('courage',1);return 'You march boldly toward '+S.place+'.'}),
  C('Climb somewhere high and study the land',()=>{stat('wisdom',1);const it=R()<.5?giveItem():null;return 'From up high you spot the shape of things.'+(it?' Tucked in a crow\'s nest you find the '+it.e+' '+it.n+', which '+it.d+'.':'')}),
  C('Ask the locals for help',()=>{stat('heart',1);const c=giveComp();return c?'A stranger steps forward: '+c.e+' '+c.n+', '+c.d+'. They join you.':'The locals share bread and gossip, and your heart feels fuller.'})]};
 else if(P===1)p={h:'An Encounter',t:'On the way, '+h+' meets '+S.creature+'. It blocks the path and studies you with ancient, curious eyes.'+(cp?' '+cp.n+' whispers, "Careful now."':''),c:[
  C('Speak to it kindly',()=>{stat('heart',1);if(R()<.6){const it=giveItem();return 'The creature softens. In thanks it gives you '+(it?'the '+it.e+' '+it.n+' ('+it.d+')':'its blessing')+'.'}return 'It listens, sighs, and lets you pass.'}),
  C('Try to trick your way past',()=>{stat('cunning',1);return R()<.6?'Your clever ruse works perfectly, and you slip past unseen.':'It sees straight through you, laughs a rumbling laugh, and lets you go anyway, amused.'}),
  S.inv.length?C('Offer it something from your satchel',()=>{const it=S.inv.splice(Math.floor(R()*S.inv.length),1)[0];stat('heart',2);const c=giveComp();return 'You offer the '+it.n+'. The creature is deeply moved.'+(c?' Its friend '+c.e+' '+c.n+', '+c.d+', decides to travel with you.':'')}):C('Stand your ground',()=>{stat('courage',2);return 'You do not flinch. The creature bows its head in respect.'})]};
 else if(P===2)p={h:'The Shadow',t:'Then the air goes cold. '+S.foe.charAt(0).toUpperCase()+S.foe.slice(1)+' has found you, and wherever it passes, the words on these pages grow faint.',c:[
  C('Face it head-on',()=>{const ok=S.stats.courage+R()*4>4;stat('courage',1);return ok?'You stand tall and the shadow recoils. It retreats, for now.':'It knocks you sprawling, but you get back up, bruised and wiser.'}),
  C('Use your wits to outsmart it',()=>{const ok=S.stats.wisdom+S.stats.cunning+R()*4>6;stat('wisdom',1);return ok?'You find the flaw in its logic and it unravels like loose knitting.':'Your plan half-works. You escape, but it will remember you.'}),
  S.comp.length?C('Trust your companions',()=>{const c=pick(S.comp);stat('heart',1);return c.e+' '+c.n+' leaps in front of you. Together you drive it back, and your bond grows stronger.'}):C('Run and hide',()=>{stat('cunning',1);return 'You dive into a hollow and wait. It passes by, muttering.'})]};
 else p={h:'A Twist in the Tale',t:'Just as the end seems near, '+h+' learns the truth: '+S.twist+'. Everything about the quest to '+S.quest+' shifts like sand.',c:[
  C('Accept it and carry on',()=>{stat('wisdom',1);return 'You take a breath, accept the strange truth, and finish what you started.'}),
  C('Write a new ending with the book itself',()=>{stat('heart',1);const it=R()<.5?giveItem():null;return 'You pick up the quill and write the world a kinder ending. It listens.'+(it?' On the last line appears the '+it.e+' '+it.n+'.':'')}),
  C('Follow the twist into the unknown',()=>{stat('courage',1);return 'You follow the mystery wherever it leads, which is, of course, the next chapter.'})]};
 S.page=p;save()}
function choose(i){const p=S.page,ch=p.c[i];const res=ch.fn?ch.fn():'';addLog(ch.t+'. '+res);S.result=res;S.page=null;G.state='result';S.lastChoice=ch.t;save()}
// choice functions can't be serialised; rebuild page on load
function cont(){if(S.pg>=3){S.pg=0;S.result='';const end=pick(['The quest is done, but the book is not. A fresh page waits.','You close one chapter, and the next one is already writing itself.','Somewhere the story keeps going, and so must you.']);addLog('Completed: '+S.quest+'.');newChapter();if(S.page)S.page.t=end+' '+S.page.t;}else{S.pg++;makePage()}G.state=S.page?'page':'title';if(S.page)G.state='page';save()}
function startNew(name){seed=(Date.now()%2147483646)+1;S={hero:name||pick(NAMES),ch:0,pg:0,inv:[],comp:[],log:[],stats:{courage:1,wisdom:1,heart:1,cunning:1},world:null};addLog(S.hero+' opened the book.');S.ch=0;newChapter();if(S.page)G.state='page'}
function resume(){const o=load();if(!o)return;S=o;seed=o.seed||1;const pg=S.pg;makePage();S.pg=pg;G.state='page'}
// ---------- art ----------
function grad(a,b,X,Y,w,h){const q=x.createLinearGradient(0,Y,0,Y+h);q.addColorStop(0,a);q.addColorStop(1,b);return q}
function scene(X,Y,w,h){const wd=S.world||WORLDS[7],s=S.art||1;x.save();x.beginPath();x.rect(X,Y,w,h);x.clip();x.fillStyle=grad(wd.c[0],wd.c[1],X,Y,w,h);x.fillRect(X,Y,w,h);
 for(let i=0;i<30;i++){x.globalAlpha=.3+.5*rnd(i+s);x.fillStyle=wd.a;const r=1+rnd(i*3+s)*2;x.beginPath();x.arc(X+rnd(i+s*2)*w,Y+rnd(i*7+s)*h*.5,r,0,7);x.fill()}x.globalAlpha=1;
 const k=wd.k;
 const hill=(yy,amp,col,sd)=>{x.fillStyle=col;x.beginPath();x.moveTo(X,Y+h);for(let i=0;i<=w;i+=8)x.lineTo(X+i,Y+yy+Math.sin(i/50+sd)*amp+Math.sin(i/17+sd)*amp*.3);x.lineTo(X+w,Y+h);x.fill()};
 if(k==='peaks'||k==='snow'){for(let i=0;i<5;i++){const px=X+rnd(i+s)*w,ph=h*(.3+rnd(i+9)*.3);x.fillStyle=k==='snow'?'#e8f4ff':'#a8c8ff';x.beginPath();x.moveTo(px-80,Y+h*.75);x.lineTo(px,Y+h*.75-ph);x.lineTo(px+80,Y+h*.75);x.fill();x.fillStyle='#fff';x.beginPath();x.moveTo(px-20,Y+h*.75-ph*.75);x.lineTo(px,Y+h*.75-ph);x.lineTo(px+20,Y+h*.75-ph*.75);x.fill()}hill(h*.75,8,'#fff',s)}
 else if(k==='forest'||k==='orchard'){hill(h*.7,10,'#2a4a2a',s);for(let i=0;i<9;i++){const tx=X+rnd(i+s)*w,ty=Y+h*(.6+rnd(i)*.25),up=k==='orchard';x.fillStyle='#5a3a1a';x.fillRect(tx-4,up?Y:ty-40,8,up?ty-Y-40:40);x.fillStyle=up?'#7ac86a':'#2a6a2a';x.beginPath();x.arc(tx,ty-50,26,0,7);x.fill();if(up){x.fillStyle=wd.a;x.beginPath();x.arc(tx+8,ty-42,5,0,7);x.fill()}}}
 else if(k==='sea'){x.fillStyle='rgba(20,60,120,.8)';x.fillRect(X,Y+h*.55,w,h*.45);for(let i=0;i<14;i++){x.strokeStyle='rgba(255,255,255,.4)';x.beginPath();const yy=Y+h*.6+i*12;for(let j=0;j<w;j+=20)x.arc(X+j+(i%2)*10,yy,8,Math.PI,0);x.stroke()}for(let i=0;i<10;i++){x.fillStyle=wd.a;x.globalAlpha=.7;x.beginPath();x.arc(X+rnd(i+s)*w,Y+h*(.75+rnd(i)*.2),3,0,7);x.fill()}x.globalAlpha=1}
 else if(k==='city'||k==='library'){for(let i=0;i<10;i++){const bw=30+rnd(i+s)*40,bh=h*(.2+rnd(i*2)*.45),bx=X+i*w/10;x.fillStyle=k==='library'?'#4a2a1a':'#1a1030';x.fillRect(bx,Y+h-bh,bw,bh);x.fillStyle=wd.a;for(let j=0;j<bh/22;j++)if(rnd(i*9+j)>.4)x.fillRect(bx+6+(j%2)*12,Y+h-bh+8+j*20,k==='library'?bw-12:6,k==='library'?4:8)}}
 else if(k==='desert'||k==='canyon'){hill(h*.65,25,k==='canyon'?'#8a2a1a':'#e8a050',s);hill(h*.8,12,k==='canyon'?'#5a1a0a':'#c8803a',s+3);x.fillStyle=wd.a;x.beginPath();x.arc(X+w*.75,Y+h*.25,30,0,7);x.fill()}
 else if(k==='cave'){hill(h*.8,10,'#1a0a2a',s);for(let i=0;i<8;i++){const mx=X+rnd(i+s)*w,my=Y+h*(.6+rnd(i)*.3),r=10+rnd(i*4)*24;x.fillStyle='#e8e0f0';x.fillRect(mx-3,my-r,6,r);x.fillStyle=pick(['#7affd0','#ff7ad0','#7ad0ff']);x.beginPath();x.ellipse(mx,my-r,r,r*.5,0,Math.PI,0);x.fill()}}
 else if(k==='clouds'||k==='isle'){for(let i=0;i<7;i++){x.fillStyle='rgba(255,255,255,.85)';const cx=X+rnd(i+s)*w,cy=Y+h*(.4+rnd(i)*.5);x.beginPath();x.arc(cx,cy,22,0,7);x.arc(cx+24,cy-8,28,0,7);x.arc(cx+50,cy,20,0,7);x.fill()}if(k==='isle'){x.fillStyle='#6cd86c';x.beginPath();x.ellipse(X+w/2,Y+h*.7,90,20,0,0,7);x.fill();for(let i=0;i<6;i++){x.strokeStyle='#fff';x.beginPath();x.moveTo(X+w/2-60+i*24,Y+h*.7);x.lineTo(X+w/2-80+i*30,Y+20);x.stroke();x.fillStyle=pick(['#ff6a8a','#ffcf3a','#6aa8ff']);x.fillRect(X+w/2-88+i*30,Y+10,16,16)}}}
 else{hill(h*.7,6,'#0a1a14',s);for(let i=0;i<12;i++){const lx=X+rnd(i+s)*w,ly=Y+h*(.2+rnd(i*5)*.4)+Math.sin(t+i)*4;x.fillStyle=wd.a;x.globalAlpha=.85;x.fillRect(lx-6,ly-8,12,16);x.globalAlpha=.25;x.beginPath();x.arc(lx,ly,16,0,7);x.fill()}x.globalAlpha=1}
 // hero silhouette
 const hx=X+w*.25,hy=Y+h*.88;x.fillStyle='#1a0a10';x.beginPath();x.arc(hx,hy-46,9,0,7);x.fill();x.beginPath();x.moveTo(hx-12,hy);x.lineTo(hx,hy-38);x.lineTo(hx+12,hy);x.fill();x.fillStyle='#ffcf6a';x.globalAlpha=.6+.3*Math.sin(t*3);x.beginPath();x.arc(hx+16,hy-30,5,0,7);x.fill();x.globalAlpha=1;
 S.comp.forEach((c,i)=>{x.font='22px serif';x.textAlign='center';x.fillText(c.e,hx+40+i*28,hy-8+Math.sin(t*2+i)*3)});x.textAlign='left';x.restore()}
function book(){x.fillStyle='#12060c';x.fillRect(0,0,W,H);x.fillStyle='#5a2a1a';rr(20,20,860,520,18);x.fill();x.strokeStyle='#c8963a';x.lineWidth=4;rr(28,28,844,504,14);x.stroke();
 x.fillStyle='#f7ecd2';rr(44,40,402,480,8);x.fill();rr(454,40,402,480,8);x.fill();x.fillStyle='rgba(90,50,20,.25)';x.fillRect(440,40,20,480);
 x.strokeStyle='#c8963a';x.lineWidth=1.5;[[54,50],[836,50],[54,500],[836,500]].forEach(([a,b])=>{x.beginPath();x.arc(a+(a>400?0:10),b+10,8,0,7);x.stroke()})}
function wrapC(s,X,Y,mw,lh,max){const ws=String(s).split(' ');let l='',n=0;for(const z of ws){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l='';if(++n>=max)return Y}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function hud(){const bs=(id,X,lab,fn)=>button(id,X,548,130,40,lab,fn);bs('inv',40,'🎒 Satchel',()=>panel('inv'));bs('cmp',180,'🧑‍🤝‍🧑 Companions',()=>panel('comp'));bs('log',320,'📜 Story Log',()=>panel('log'));bs('sv',460,'💾 Save',()=>{save();S.flash=2});bs('ex',600,'📤 Export',exportTale);bs('mn',740,'🏠 Title',()=>{save();G.state='title'})}
function drawTitle(){x.fillStyle=grad('#1a0a20','#3a1424',0,0,W,H);x.fillRect(0,0,W,H);for(let i=0;i<60;i++){x.globalAlpha=.3+.5*Math.abs(Math.sin(t+i));x.fillStyle='#ffe9c7';x.fillRect(rnd(i)*W,rnd(i+40)*H,2,2)}x.globalAlpha=1;
 x.fillStyle='#5a2a1a';rr(280,90,340,250,12);x.fill();x.strokeStyle='#c8963a';x.lineWidth=4;rr(290,100,320,230,10);x.stroke();emo('📖',450,190,90);T('Endless Tale',450,290,34,'#ffcf6a','center');
 T('A story that never ends, and is never the same twice.',450,380,18,'#ffe9c7','center','italic ');
 button('new',300,410,300,48,'✒️ Begin a New Tale',()=>{const n=prompt('What is your hero\'s name?','')||'';startNew(n.trim().slice(0,24))});
 if(load())button('res',300,468,300,48,'📖 Continue Your Tale',resume);
 if(DEMO)T('Free demo: the first '+DEMO_CH+' chapters',450,560,15,'#e8a0b0','center','')}
function drawPage(){book();scene(60,56,370,300);const p=S.page;x.fillStyle='#3a2414';T(S.world.n,245,385,17,'#5a2a1a','center');x.font='14px Georgia';x.fillStyle='#5a3a24';
 wrapC('Quest: to '+S.quest+'.',66,410,360,18,3);T('Chapter '+S.ch+' · Page '+(S.pg+1)+' of 4',245,505,13,'#8a6a4a','center','');
 T(p.h,655,82,20,'#5a1a24','center');x.font='16px Georgia';x.fillStyle='#2a1a10';const y=wrapC(p.t,474,116,364,21,13);
 p.c.forEach((c,i)=>{button('c'+i,470,Math.max(y+6,330)+i*58-(p.c.length>2?0:0),372,50,'',()=>choose(i),{bg:'#efe0bf',ac:'#8a5a2a'});x.textAlign='left';x.fillStyle='#3a1424';x.font='bold 14px Georgia';wrapC((i+1)+'. '+c.t,484,Math.max(y+6,330)+i*58+21,350,17,2)});hud();flash()}
function drawResult(){book();scene(60,56,370,300);T(S.world.n,245,385,17,'#5a2a1a','center');T('You chose…',655,90,20,'#5a1a24','center');x.font='italic 16px Georgia';x.fillStyle='#5a3a24';let y=wrapC(S.lastChoice,474,125,364,21,3);
 x.font='16px Georgia';x.fillStyle='#2a1a10';y=wrapC(S.result||'',474,y+14,364,21,10);button('nx',530,440,250,50,S.pg>=3?'📖 Turn to the next chapter':'➡️ Turn the page',cont,{bg:'#5a2a1a',ac:'#c8963a'});hud();flash()}
function flash(){if(S.flash>0){S.flash-=.02;T('Saved ✓',450,30,16,'#7aff9a','center')}}
// DOM panels
const pn=document.createElement('div');pn.style.cssText='display:none;position:fixed;inset:6% 10% 10% 10%;z-index:90;background:#f7ecd2;color:#3a2414;border:4px solid #c8963a;border-radius:16px;padding:18px 24px;overflow:auto;font:16px/1.5 Georgia,serif;box-shadow:0 10px 40px #000a';document.body.appendChild(pn);
function panel(k){let h='';if(k==='inv')h='<h2>🎒 Satchel</h2>'+(S.inv.length?S.inv.map(i=>'<p><b>'+i.e+' '+esc(i.n)+'</b>: '+esc(i.d)+'</p>').join(''):'<i>Empty, for now.</i>')+'<h3>Your strengths</h3>'+Object.entries(S.stats).map(([a,b])=>esc(a)+': '+'★'.repeat(Math.min(b,20))).join('<br>');
 else if(k==='comp')h='<h2>🧑‍🤝‍🧑 Companions</h2>'+(S.comp.length?S.comp.map(c=>'<p><b>'+c.e+' '+esc(c.n)+'</b>, '+esc(c.d)+'</p>').join(''):'<i>You travel alone… so far.</i>');
 else h='<h2>📜 The Story So Far</h2><p><b>'+esc(S.hero)+'</b></p>'+S.log.map(l=>'<p>'+esc(l)+'</p>').join('');
 pn.innerHTML=h+'<p><button id="pclose" style="padding:8px 18px;border:0;border-radius:10px;background:#5a2a1a;color:#fff;font:16px Georgia;cursor:pointer">Close</button></p>';pn.style.display='block';pn.querySelector('#pclose').onclick=()=>{pn.style.display='none'}}
function exportTale(){const txt='ENDLESS TALE: the story of '+S.hero+'\n\n'+S.log.join('\n\n')+'\n\nCompanions: '+(S.comp.map(c=>c.n).join(', ')||'none')+'\nSatchel: '+(S.inv.map(i=>i.n).join(', ')||'empty')+'\n\nCreated with Coffeebreak Endless Tale\n';
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download='my-endless-tale.txt';document.body.appendChild(a);a.click();a.remove()}
window.HERO_SRC='';
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,W,H);for(const k in BTN)delete BTN[k];if(G.state==='page'&&S.page)drawPage();else if(G.state==='result')drawResult();else drawTitle();G.level=S.ch||0;x.textAlign='left'}
window.ET={G,get S(){return S},startNew,choose,cont,resume,exportTale,panel};startLoop();
