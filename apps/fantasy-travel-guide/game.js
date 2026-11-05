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
// ===== Coffeebreak Fantasy Travel Guide =====
const DEMO=!!window.DEMO,SK=DEMO?'ftgDemo':'ftgSave';
let S={stamps:[],trip:[],journal:[],cards:[]};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
function rnd(i){const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v)}
// ---- art primitives (g=context, w,h) ----
function sky(g,w,h,a,b){const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,w,h)}
function stars(g,w,h,n,col){g.fillStyle=col||'#fff';for(let i=0;i<n;i++){g.globalAlpha=.4+.6*rnd(i+3);g.fillRect(rnd(i)*w,rnd(i+50)*h*.6,2,2)}g.globalAlpha=1}
function cloud(g,X,Y,s,col){g.fillStyle=col||'#fff';g.beginPath();g.arc(X,Y,22*s,0,7);g.arc(X+25*s,Y-10*s,28*s,0,7);g.arc(X+55*s,Y,22*s,0,7);g.arc(X+28*s,Y+8*s,22*s,0,7);g.fill()}
function hills(g,w,h,Y,amp,col,seed){g.fillStyle=col;g.beginPath();g.moveTo(0,h);for(let i=0;i<=w;i+=10)g.lineTo(i,Y+Math.sin(i/70+seed)*amp+Math.sin(i/23+seed*2)*amp*.3);g.lineTo(w,h);g.fill()}
function tri(g,a,b,c,d,e,f,col){g.fillStyle=col;g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.lineTo(e,f);g.fill()}
function circ(g,X,Y,r,col){g.fillStyle=col;g.beginPath();g.arc(X,Y,r,0,7);g.fill()}
function tower(g,X,Y,w,h,col,roof){g.fillStyle=col;g.fillRect(X,Y-h,w,h);tri(g,X-6,Y-h,X+w/2,Y-h-w*1.2,X+w+6,Y-h,roof);g.fillStyle='#ffe9a0';g.fillRect(X+w/2-4,Y-h+14,8,12)}
function glyph(g,e,X,Y,s){g.font=s+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(e,X,Y);g.textBaseline='alphabetic';g.textAlign='left'}
const ART={
sky(g,w,h){sky(g,w,h,'#7cc4ff','#ffe0f0');cloud(g,w*.1,h*.2,1.2);cloud(g,w*.7,h*.15,.9);
 [[.2,.55,.18],[.6,.4,.24],[.85,.7,.12]].forEach(([a,b,s])=>{const X=a*w,Y=b*h,R=s*w;g.fillStyle='#8a6a4a';g.beginPath();g.moveTo(X-R,Y);g.lineTo(X+R,Y);g.lineTo(X,Y+R*1.1);g.fill();g.fillStyle='#6cd86c';g.beginPath();g.ellipse(X,Y,R,R*.22,0,0,7);g.fill();tower(g,X-R*.2,Y,R*.3,R*.7,'#fff8ee','#e87aa8');g.strokeStyle='#bfe8ff';g.lineWidth=2;g.beginPath();g.moveTo(X+R*.6,Y);g.lineTo(X+R*.7,Y+R*1.4);g.stroke()});cloud(g,w*.35,h*.85,1.4,'#fff')},
crystal(g,w,h){sky(g,w,h,'#140b2e','#2a1050');for(let i=0;i<16;i++){const X=rnd(i)*w,s=30+rnd(i+9)*70,cs=['#9af','#f8a','#af8','#c9f','#7ef'];g.globalAlpha=.85;tri(g,X-s*.3,h,X,h-s*2,X+s*.3,h,cs[i%5]);tri(g,X-s*.3,0,X,s*1.2,X+s*.3,0,cs[(i+2)%5])}g.globalAlpha=1;for(let i=0;i<30;i++)circ(g,rnd(i+7)*w,rnd(i+77)*h,2+rnd(i)*3,'rgba(200,220,255,.7)');g.fillStyle='#4a2a7a';g.fillRect(0,h*.9,w,h*.1)},
mermaid(g,w,h){sky(g,w,h,'#1ab0c8','#062a5a');for(let i=0;i<8;i++){g.globalAlpha=.12;g.fillStyle='#fff';g.beginPath();g.moveTo(w*rnd(i),0);g.lineTo(w*rnd(i)+40,0);g.lineTo(w*rnd(i)+140,h);g.lineTo(w*rnd(i)+80,h);g.fill()}g.globalAlpha=1;
 hills(g,w,h,h*.82,10,'#e8d0a0',2);[[.3,.5],[.5,.38],[.7,.52]].forEach(([a,b],i)=>{const X=a*w;g.fillStyle=['#ff9ac0','#ffd27a','#a0f0e0'][i];g.beginPath();g.ellipse(X,h*.82,w*.07,h*(.82-b),0,Math.PI,0);g.fill();circ(g,X,b*h,w*.03,'#fff8')});
 for(let i=0;i<14;i++)circ(g,rnd(i)*w,rnd(i+30)*h*.8,3+rnd(i+4)*6,'rgba(255,255,255,.35)');for(let i=0;i<6;i++){g.strokeStyle='#2e9e5e';g.lineWidth=5;g.beginPath();const X=rnd(i+40)*w;g.moveTo(X,h);g.quadraticCurveTo(X+20,h*.8,X-10,h*.65);g.stroke()}},
candy(g,w,h){sky(g,w,h,'#ffd0ec','#fff4c8');hills(g,w,h,h*.72,18,'#ff9ccf',1);hills(g,w,h,h*.84,12,'#a8e8ff',4);for(let i=0;i<6;i++){const X=w*(.1+i*.16),Y=h*.72;g.fillStyle='#fff';g.fillRect(X-3,Y-60,6,60);circ(g,X,Y-70,22,['#ff5c8a','#7ad','#fc5','#8d6'][i%4]);g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(X,Y-70,12,0,5);g.stroke()}
 tower(g,w*.45,h*.72,w*.1,h*.35,'#ffb0d0','#8a4a2a');tower(g,w*.58,h*.72,w*.07,h*.25,'#ffe08a','#ff6aa0');cloud(g,w*.75,h*.18,1,'#ffe8f6')},
dragon(g,w,h){sky(g,w,h,'#ff7a3a','#3a0a10');tri(g,w*.1,h,w*.5,h*.18,w*.9,h,'#3a1a1a');tri(g,w*.42,h*.3,w*.5,h*.18,w*.58,h*.3,'#ff5a1a');g.fillStyle='#ffaa3a';g.globalAlpha=.6;for(let i=0;i<10;i++)circ(g,w*.5+(rnd(i)-.5)*60,h*.15-rnd(i+3)*h*.12,6+rnd(i)*10,'#888');g.globalAlpha=1;hills(g,w,h,h*.88,8,'#1a0808',3);
 g.fillStyle='#1a0808';const X=w*.75,Y=h*.3;g.beginPath();g.moveTo(X,Y);g.lineTo(X-50,Y-25);g.lineTo(X-20,Y);g.lineTo(X-55,Y+15);g.lineTo(X,Y+5);g.lineTo(X+30,Y-5);g.lineTo(X+40,Y-12);g.fill()},
fairy(g,w,h){sky(g,w,h,'#0e3a2a','#2a6a3a');for(let i=0;i<9;i++){const X=rnd(i)*w;g.fillStyle='#3a2414';g.fillRect(X-10,h*.3,20,h*.7);circ(g,X,h*.3,50+rnd(i)*30,['#1e6a3a','#2a8a4a','#155a2e'][i%3])}
 for(let i=0;i<5;i++){const X=w*(.15+i*.18),Y=h*.88;g.fillStyle='#fff4e0';g.fillRect(X-6,Y-24,12,24);g.fillStyle='#e83a3a';g.beginPath();g.ellipse(X,Y-24,22,14,0,Math.PI,0);g.fill()}for(let i=0;i<40;i++)circ(g,rnd(i+5)*w,rnd(i+60)*h,1.5+rnd(i)*2.5,'rgba(255,255,150,.85)')},
cloudspa(g,w,h){sky(g,w,h,'#b8a8ff','#ffe6f2');for(let i=0;i<7;i++)cloud(g,rnd(i)*w,h*(.6+rnd(i+2)*.35),1+rnd(i+5),'#fff');[[.3,.55],[.65,.62]].forEach(([a,b])=>{g.fillStyle='#9ee8f0';g.beginPath();g.ellipse(a*w,b*h,w*.12,h*.05,0,0,7);g.fill();g.globalAlpha=.4;for(let k=0;k<3;k++){g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(a*w-20+k*20,b*h-10);g.bezierCurveTo(a*w-30+k*20,b*h-40,a*w-10+k*20,b*h-50,a*w-20+k*20,b*h-80);g.stroke()}g.globalAlpha=1});circ(g,w*.85,h*.18,30,'#fff6c0')},
moon(g,w,h){sky(g,w,h,'#05051a','#1a1a4a');stars(g,w,h,90);circ(g,w*.5,h*.35,h*.22,'#f4f0d8');circ(g,w*.45,h*.3,h*.04,'#ddd8c0');circ(g,w*.56,h*.42,h*.03,'#ddd8c0');hills(g,w,h,h*.85,10,'#2a2a5a',1);for(let i=0;i<5;i++)tower(g,w*(.12+i*.18),h*.88,22,40+rnd(i)*40,'#3a3a7a','#8a8aff')},
volcano(g,w,h){sky(g,w,h,'#ffcf6a','#ff6a8a');circ(g,w*.8,h*.2,40,'#fff2a0');g.fillStyle='#3ac0c8';g.fillRect(0,h*.7,w,h*.3);tri(g,w*.2,h*.72,w*.4,h*.3,w*.6,h*.72,'#5a3a3a');tri(g,w*.36,h*.36,w*.4,h*.3,w*.44,h*.36,'#ff8a2a');for(let i=0;i<4;i++){const X=w*(.65+i*.08);g.strokeStyle='#6a4a2a';g.lineWidth=5;g.beginPath();g.moveTo(X,h*.72);g.quadraticCurveTo(X+10,h*.55,X+20,h*.45);g.stroke();for(let k=0;k<4;k++){g.save();g.translate(X+20,h*.45);g.rotate(k*1.6);g.fillStyle='#2a9a4a';g.beginPath();g.ellipse(18,0,22,6,0,0,7);g.fill();g.restore()}}},
ice(g,w,h){sky(g,w,h,'#0a1a3a','#5aa0d0');for(let k=0;k<3;k++){g.globalAlpha=.4;g.strokeStyle=['#5f8','#a6f','#6ef'][k];g.lineWidth=18;g.beginPath();g.moveTo(0,h*.2+k*20);g.bezierCurveTo(w*.3,h*.05+k*30,w*.6,h*.35,w,h*.15+k*15);g.stroke()}g.globalAlpha=1;hills(g,w,h,h*.75,14,'#e8f6ff',2);tower(g,w*.4,h*.78,w*.06,h*.3,'#bfe8ff','#fff');tower(g,w*.48,h*.78,w*.08,h*.4,'#d8f2ff','#fff');tower(g,w*.58,h*.78,w*.06,h*.26,'#bfe8ff','#fff')},
clock(g,w,h){sky(g,w,h,'#5a3a1a','#d8a050');for(let i=0;i<6;i++){const X=rnd(i)*w,Y=rnd(i+9)*h,R=30+rnd(i+2)*50;g.strokeStyle='#ffd27a';g.lineWidth=6;g.beginPath();for(let k=0;k<12;k++){const a=k/12*6.283;g.moveTo(X+Math.cos(a)*R,Y+Math.sin(a)*R);g.lineTo(X+Math.cos(a)*(R+10),Y+Math.sin(a)*(R+10))}g.stroke();g.beginPath();g.arc(X,Y,R,0,7);g.stroke()}tower(g,w*.45,h,w*.1,h*.55,'#7a4a2a','#3a2010');circ(g,w*.5,h*.6,w*.04,'#fff4d0');g.strokeStyle='#000';g.lineWidth=3;g.beginPath();g.moveTo(w*.5,h*.6);g.lineTo(w*.5,h*.6-w*.03);g.moveTo(w*.5,h*.6);g.lineTo(w*.5+w*.02,h*.6);g.stroke()},
desert(g,w,h){sky(g,w,h,'#2a1a5a','#ff9a6a');stars(g,w,h,30);hills(g,w,h,h*.7,16,'#e8a85a',1);hills(g,w,h,h*.82,10,'#c8803a',5);[[.3,.3],[.6,.22]].forEach(([a,b])=>{g.fillStyle='#c84a6a';g.beginPath();g.moveTo(a*w-50,b*h);g.quadraticCurveTo(a*w,b*h-20,a*w+50,b*h);g.quadraticCurveTo(a*w,b*h+20,a*w-50,b*h);g.fill();g.strokeStyle='#ffd27a';g.lineWidth=2;g.stroke()});for(let i=0;i<3;i++){const X=w*(.45+i*.06);g.fillStyle='#fff0d0';g.fillRect(X,h*.72-50,24,50);g.beginPath();g.arc(X+12,h*.72-50,14,Math.PI,0);g.fill()}},
garden(g,w,h){sky(g,w,h,'#ffe6a0','#9ad89a');hills(g,w,h,h*.7,12,'#5ab85a',2);for(let i=0;i<9;i++){const X=rnd(i)*w,Y=h*(.72+rnd(i+3)*.2),s=40+rnd(i+1)*50;g.fillStyle='#3a8a3a';g.fillRect(X-2,Y-s,4,s);const col=['#ff6a9a','#ffd23a','#a07aff','#ff8a3a'][i%4];for(let k=0;k<6;k++)circ(g,X+Math.cos(k)*s*.3,Y-s+Math.sin(k)*s*.3,s*.22,col);circ(g,X,Y-s,s*.16,'#fff2a0')}for(let i=0;i<6;i++)glyph(g,'🐝',rnd(i+20)*w,rnd(i+30)*h*.6,20)},
};
const D=[
{k:'sky',n:'The Floating Sky Isles',e:'☁️',st:'🏝️',tag:'Islands that drift above the clouds, tethered by rainbow ropes.',
sights:['Rainbow Rope Bridges: wobbly, glorious and only slightly terrifying','The Upside-Down Waterfall that pours into the sky','Kite Market, where every stall floats a few feet off the ground'],
food:['Cloudberry pancakes, so light you hold them down with jam','Thunder tea (one sip and your hair stands on end)'],
creatures:['Puffball sheep that graze on cumulus','Bell-winged sky whales that sing at sunset'],
stay:['The Breeze Inn: hammock suites with 360° views','Lantern Loft B&B: breakfast delivered by paper bird'],
tips:['Pack pebbles in your pockets on windy days','Never shout "jump" on a rope bridge as a joke. Locals have heard it.']},
{k:'crystal',n:'The Glimmering Crystal Caves',e:'💎',st:'🔮',tag:'A glittering underworld lit by singing crystals.',
sights:['The Echo Cathedral, where crystals hum back your favourite song','The Glow Lake, a mirror so still it shows tomorrow\'s weather','Gemsmith Row, home of the world\'s tiniest jewellers'],
food:['Rock candy geodes (crack them open for a sherbet centre)','Glowworm soup, which tastes like fairy floss. Nobody asks why.'],
creatures:['Lantern moles with lights on their noses','Gem beetles that sparkle when they are happy'],
stay:['The Geode Hotel: sleep inside a giant amethyst','Stalactite Hostel: bunk beds hang from the ceiling'],
tips:['Bring a jumper. It is always a crisp 14 degrees','Do not lick the crystals, however tempting']},
{k:'mermaid',n:'Coralina, the Mermaid City',e:'🧜‍♀️',st:'🐚',tag:'Pearl domes and kelp boulevards beneath a turquoise sea.',
sights:['The Pearl Palace and its daily changing-of-the-seahorse-guard','Sunken Ship Gallery: pirate treasure turned modern art','Bubble Ballet at the Grand Coral Amphitheatre'],
food:['Seaweed sushi rolls with sea-grape caviar','Bubble tea, served in actual bubbles'],
creatures:['Seahorse taxis (tipping is customary, in shells)','Gossiping octopus librarians'],
stay:['The Clamshell Suites: waterbeds, naturally','Air-Bubble Lodge, for visitors who prefer breathing'],
tips:['Breathing charms are sold at every dock. Buy two.','Waving with your tail is considered polite; you may use your hand']},
{k:'candy',n:'The Candy Kingdom',e:'🍭',st:'🍬',tag:'Sugar-spun castles, lolly forests and a chocolate river.',
sights:['Castle Marzipan (the left turret is edible on Sundays)','The Chocolate River boat cruise','Lollipop Grove at golden hour'],
food:['Gingerbread pizzas with gumdrop toppings','Fizzy cloud floss straight from the sky'],
creatures:['Gummy bears (real ones, very cuddly)','Meringue swans gliding on the custard lake'],
stay:['The Cupcake Cottages, with frosting roofs','Hotel Bonbon: pillows are marshmallows, please do not eat them'],
tips:['Bring a toothbrush. Seriously.','It rains sprinkles in the afternoon, so carry a brolly']},
{k:'dragon',n:'Mount Emberpeak, Dragon Mountain',e:'🐉',st:'🔥',tag:'A smouldering peak where dragons nap on piles of gold.',
sights:['Hoard Hall, the oldest dragon treasure vault','Lava Falls viewing platform (heatproof sandals required)','The Dragon Egg Nursery, open on hatching days'],
food:['Flame-grilled anything, cooked in seconds','Fire peppers, rated "polite cough" to "volcano"'],
creatures:['Grumpy elder dragons who love a compliment','Ember pups, tiny dragons the size of corgis'],
stay:['The Cinder Lodge: underfloor heating is an understatement','Scale & Tail Inn, built into an old dragon\'s den'],
tips:['Always bow to a dragon first. Always.','Gold is not a souvenir. Ask anyone with eyebrows missing.']},
{k:'fairy',n:'Whisperwood Fairy Forest',e:'🧚',st:'🍄',tag:'Ancient trees, toadstool villages and a billion fireflies.',
sights:['Toadstool Town, where the houses are mushrooms','The Wishing Willow (one wish per visitor)','Firefly Festival every full moon'],
food:['Honey-dew dumplings served on leaves','Acorn-cap espresso, tiny but powerful'],
creatures:['Pixies, who will steal your socks','Talking hedgehogs with strong opinions'],
stay:['Treehouse Hollow, with rope ladder access','The Mossy Bed & Breakfast, softest moss in the realm'],
tips:['Never step inside a ring of mushrooms','Say thank you to the trees. They notice.']},
{k:'cloudspa',n:'Serenity Cloud Spa',e:'🧖',st:'🫧',tag:'Hot springs on the clouds, where stress melts into mist.',
sights:['The Steam Pools, warmed by a sleepy sunbeam','Meditation Rainbow (lie on it, gently)','Dream Library: borrow a nap'],
food:['Lavender cloud cakes','Starlight smoothies with a moonbeam swirl'],
creatures:['Cloud kittens who purr in fog','Massage geese (surprisingly skilled)'],
stay:['The Fluff Suite: a bed that is literally a cloud','Mist Pods for solo travellers'],
tips:['Leave your phone at the gate; the clouds absorb it anyway','Do not fall asleep on the edge pools']},
{k:'moon',n:'Lunaria, the Moon Harbour',e:'🌙',st:'⭐',tag:'A silver port where ships sail on starlight.',
sights:['The Starlight Docks, where comets are moored','Silver Lighthouse with a telescope to every galaxy','Night Market of Lost Wishes'],
food:['Moon cheese (it is real, it is delicious)','Comet-tail noodles that glow as you slurp'],
creatures:['Moon rabbits running the noodle stalls','Star jellyfish drifting through the air'],
stay:['Crescent Hotel: hammocks swing from the moon\'s curve','The Orbit Inn, which rotates slowly all night'],
tips:['Gravity is light, so tie your shoelaces tight','Best visited on a full moon, obviously']},
{k:'volcano',n:'Tikitango Volcano Isle',e:'🌋',st:'🌺',tag:'A tropical paradise with a friendly volcano that bubbles soup.',
sights:['Soup Crater, the volcano that erupts minestrone','Turquoise Lagoon snorkel trail','Sunset Fire Dance at the beach'],
food:['Coconut lava cake','Grilled pineapple skewers on volcanic stone'],
creatures:['Singing parrots who know every song','Turtle surf instructors'],
stay:['Palm Hut Bungalows on stilts','Lava Lamp Lodge, where everything glows orange'],
tips:['The volcano only rumbles when hungry. Feed it bread.','Reef-safe sunscreen please']},
{k:'ice',n:'Glacierholm Ice Palace',e:'❄️',st:'⛄',tag:'An aurora-lit palace carved entirely from ice.',
sights:['The Aurora Ballroom, ceiling made of northern lights','Frozen Waterfall Slide (the fastest in the realm)','Snow Sculpture Garden'],
food:['Hot chocolate bombs in ice-cup mugs','Snowflake waffles with frost syrup'],
creatures:['Polar foxes who deliver mail','Penguin butlers (formal by default)'],
stay:['The Igloo Suites: heated furs, igloo-warm','Ice Palace Guest Wing, with a fireplace that does not melt anything'],
tips:['Layers, layers, layers','Do not stick your tongue to the palace walls']},
{k:'clock',n:'Clockwork City of Tick',e:'⚙️',st:'🕰️',tag:'A brass city of gears, steam trams and inventors.',
sights:['The Great Gear Tower, which rings every 7 minutes','Automaton Opera House','Inventors\' Bazaar, where you can buy a mechanical umbrella that flies'],
food:['Steam-baked bao from vending robots','Copper-pot coffee, strong enough to wind a watch'],
creatures:['Clockwork owls that tell time','Brass cats (they still ignore you)'],
stay:['The Cog & Spanner Hotel','Airship Dock Rooms, which float above the city'],
tips:['Do not touch any lever labelled "do not touch"','Time runs a little fast here, so arrive early']},
{k:'desert',n:'The Mirage Desert of Sahariel',e:'🏜️',st:'🧞',tag:'Golden dunes, flying carpets and oases that move about.',
sights:['The Wandering Oasis (check where it is today)','Flying Carpet sunset tours','Palace of a Thousand Lamps'],
food:['Date and honey pastries','Mint tea poured from a great height'],
creatures:['Wise old camels who tell riddles','Sand dolphins that leap from dunes'],
stay:['Starlit Tent Camp','Lamp Palace Suites, genie on call (three requests max)'],
tips:['Mirages can be very convincing. Pinch yourself.','Carpets prefer you hold on with both hands']},
{k:'garden',n:'The Giant\'s Garden',e:'🌻',st:'🐝',tag:'Flowers as tall as towers and bees the size of ponies.',
sights:['Sunflower Lookout (climb the stalk to the top)','The Dewdrop Pools, each one a swimming hole','Giant Strawberry Patch picking tours'],
food:['Single-pea soup (feeds a family of six)','Honey straight from pony-sized bees'],
creatures:['Friendly giant bumblebees offering rides','Ladybirds as big as cars'],
stay:['Teacup Cottages in the giant\'s abandoned china','Leaf Hammock Village'],
tips:['Watch for falling apples','The giant is friendly but a little loud. Bring earplugs.']}];
const FREE=3;const locked=i=>DEMO&&i>=FREE;
function lockMsg(){window.demoEnd&&window.demoEnd('The full guide has all '+D.length+' destinations, including the Candy Kingdom, Dragon Mountain, the Fairy Forest, the Cloud Spa and more, plus every passport stamp.')}
// ---- canvas UI ----
let cur=0,sc=0;const bgs={};
function sceneImg(i,w,h){const key=i+'_'+w;if(bgs[key])return bgs[key];const o=document.createElement('canvas');o.width=w;o.height=h;ART[D[i].k](o.getContext('2d'),w,h);return bgs[key]=o}
function drawTitle(){x.drawImage(sceneImg(0,900,600),0,0);x.fillStyle='rgba(20,10,40,.45)';x.fillRect(0,0,900,600);T('🗺️ Coffeebreak',450,150,30,'#ffe9c7','center');T('Fantasy Travel Guide',450,215,58,'#fff','center');T('A guidebook to '+D.length+' magical places that do not exist (yet).',450,260,20,'#ffd8f0','center','italic ');
 button('go',350,320,200,62,'✈️ Open the guide',()=>G.state='menu',{fs:22});T(DEMO?'Free demo: '+FREE+' destinations':'All '+D.length+' destinations',450,420,15,'#ffe9c7','center','')}
function drawMenu(){x.drawImage(sceneImg(2,900,600),0,0);x.fillStyle='rgba(20,10,40,.55)';x.fillRect(0,0,900,600);T('Where to next, traveller?',450,70,34,'#fff','center');
 const B=[['at','🗺️ Destinations',()=>G.state='atlas'],['pl','🧳 Dream trip planner',openPlanner],['pp','🛂 My passport',()=>G.state='passport'],['jn','📔 Travel journal',openJournal],['pc','💌 Postcard maker',()=>openPostcard(cur)]];
 B.forEach((b,i)=>button(b[0],300,110+i*76,300,60,b[1],b[2],{fs:20}));T('🛂 Stamps: '+S.stamps.length+' / '+D.length,450,520,16,'#ffe9c7','center','')}
function drawAtlas(){x.fillStyle='#f4e6c8';x.fillRect(0,0,900,600);T('🗺️ The Realm Atlas',450,46,30,'#5a3a1a','center');
 D.forEach((d,i)=>{const col=i%5,row=(i/5|0),X=22+col*174,Y=70+row*158,tw=165,th=100;x.drawImage(sceneImg(i,200,120),X,Y,tw,th);x.strokeStyle='#5a3a1a';x.lineWidth=3;x.strokeRect(X,Y,tw,th);
  x.fillStyle='rgba(255,248,230,.92)';x.fillRect(X,Y+th,tw,40);x.font='bold 12px Georgia';const nm=d.n.replace(/^The /,'').split(', ');T(d.e+' '+nm[0],X+tw/2,Y+th+16,12,'#3a2414','center');if(nm[1])T(nm[1],X+tw/2,Y+th+32,11,'#6a4a2a','center','italic ');if(locked(i)){x.fillStyle='rgba(0,0,0,.5)';x.fillRect(X,Y,tw,th);emo('🔒',X+tw/2,Y+th/2,36)}else if(S.stamps.includes(d.k))emo(d.st,X+tw-18,Y+18,24);
  BTN['d'+i]={x:X,y:Y,w:tw,h:th+40,fn:()=>{if(locked(i))return lockMsg();openDest(i)}}});button('ab',20,560,110,34,'⬅ Back',()=>G.state='menu',{fs:14})}
function drawPassport(){x.fillStyle='#1a2a5a';x.fillRect(0,0,900,600);x.fillStyle='#fff8e8';rr(60,40,780,500,16);x.fill();x.fillStyle='#d8c8a8';x.fillRect(448,40,4,500);T('🛂 Passport of the Realms',450,85,28,'#1a2a5a','center');
 D.forEach((d,i)=>{const X=110+(i%6)*124+(i%6>2?20:0),Y=150+(i/6|0)*190;x.save();x.translate(X+40,Y+50);x.rotate((rnd(i)-.5)*.4);const got=S.stamps.includes(d.k);x.strokeStyle=got?['#c83a5a','#2a6ac8','#2a9a5a','#8a3ac8'][i%4]:'#ccc';x.lineWidth=3;x.setLineDash(got?[]:[5,5]);x.beginPath();x.arc(0,0,44,0,7);x.stroke();x.setLineDash([]);x.globalAlpha=got?1:.25;emo(d.st,0,-6,34);x.font='bold 10px Georgia';x.fillStyle=x.strokeStyle;x.textAlign='center';x.fillText(d.n.replace(/^The /,'').split(/[ ,]/)[0].toUpperCase(),0,28);x.restore();x.globalAlpha=1});
 T(S.stamps.length+' of '+D.length+' stamps collected. Visit a destination to get stamped!',450,520,15,'#5a3a1a','center','');button('pb',20,556,110,34,'⬅ Back',()=>G.state='menu',{fs:14})}
// ---- DOM panel ----
const pn=document.createElement('div');pn.id='ftPanel';pn.style.cssText='display:none;position:fixed;inset:4% 8% 9% 8%;z-index:90;background:rgba(255,250,238,.98);color:#3a2414;border-radius:18px;padding:18px 22px;overflow:auto;font:16px/1.5 Georgia,serif;box-shadow:0 10px 40px #0008';document.body.appendChild(pn);
const BS='margin:4px;padding:8px 14px;border:0;border-radius:10px;background:#5a3a8a;color:#fff;font:15px Georgia;cursor:pointer',BS2=BS.replace('#5a3a8a','#e8a0b0').replace('#fff','#3a1424');
function show(h,back){G.state='panel';pn.innerHTML=h;pn.style.display='block';pn.scrollTop=0;const b=pn.querySelector('#pback');if(b)b.onclick=back||closeP}
function closeP(){pn.style.display='none';G.state='menu'}
function sect(t,a){return '<h3 style="margin:12px 0 4px;color:#5a3a8a">'+t+'</h3><ul style="margin:0">'+a.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'}
function openDest(i){cur=i;const d=D[i],nw=!S.stamps.includes(d.k);if(nw){S.stamps.push(d.k);save()}const im=sceneImg(i,800,300).toDataURL();
 show('<img src="'+im+'" style="width:100%;border-radius:12px"><h2 style="margin:8px 0 0">'+d.e+' '+esc(d.n)+'</h2><i>'+esc(d.tag)+'</i>'+(nw?'<p style="background:#fff0c8;padding:6px 10px;border-radius:8px">🛂 Stamped! '+d.st+' added to your passport.</p>':'')+
 sect('👀 Must-see sights',d.sights)+sect('🍽️ What to eat',d.food)+sect('🦄 Local creatures',d.creatures)+sect('🛏️ Where to stay',d.stay)+sect('💡 Travel tips',d.tips)+
 '<p><button id="pback" style="'+BS+'">⬅ Atlas</button><button id="padd" style="'+BS2+'">'+(S.trip.includes(d.k)?'✅ In my trip':'🧳 Add to dream trip')+'</button><button id="ppc" style="'+BS2+'">💌 Send a postcard</button><button id="pjn" style="'+BS2+'">📔 Write in journal</button></p>',()=>{pn.style.display='none';G.state='atlas'});
 pn.querySelector('#padd').onclick=()=>{if(!S.trip.includes(d.k)){S.trip.push(d.k);save()}openDest(i)};pn.querySelector('#ppc').onclick=()=>openPostcard(i);pn.querySelector('#pjn').onclick=()=>openJournal(d.n)}
const byK=k=>D.findIndex(d=>d.k===k);
function openPlanner(){const days=S.trip.map((k,n)=>{const d=D[byK(k)];return '<div style="padding:8px;margin:6px 0;background:#f4ead8;border-radius:10px"><b>Day '+(n*2+1)+'–'+(n*2+2)+': '+d.e+' '+esc(d.n)+'</b><br>Morning: '+esc(d.sights[0])+'<br>Lunch: '+esc(d.food[0])+'<br>Afternoon: '+esc(d.sights[1])+'<br>Night: '+esc(d.stay[0])+' <button data-u="'+n+'" style="'+BS2+'">⬆</button><button data-r="'+n+'" style="'+BS2+'">✖</button></div>'}).join('');
 show('<h2 style="margin:0">🧳 Dream Trip Planner</h2><p>Tap destinations to add them to your itinerary.</p><div>'+D.map((d,i)=>'<button data-a="'+i+'" style="'+BS2+(locked(i)?';opacity:.5':'')+'">'+d.e+' '+esc(d.n.replace(/^The /,''))+(locked(i)?' 🔒':S.trip.includes(d.k)?' ✅':'')+'</button>').join('')+'</div><h3>Your itinerary'+(S.trip.length?' ('+S.trip.length*2+' days)':'')+'</h3>'+(days||'<p><i>Nothing planned yet. Where do your dreams want to go?</i></p>')+'<p><button id="pback" style="'+BS+'">⬅ Back</button>'+(S.trip.length?'<button id="pclr" style="'+BS2+'">🗑️ Clear trip</button>':'')+'</p>');
 pn.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const i=+b.dataset.a;if(locked(i))return lockMsg();const k=D[i].k;if(!S.trip.includes(k))S.trip.push(k);save();openPlanner()});
 pn.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{S.trip.splice(+b.dataset.r,1);save();openPlanner()});pn.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{const n=+b.dataset.u;if(n>0){[S.trip[n-1],S.trip[n]]=[S.trip[n],S.trip[n-1]];save()}openPlanner()});
 const c2=pn.querySelector('#pclr');if(c2)c2.onclick=()=>{S.trip=[];save();openPlanner()}}
function openJournal(pre){show('<h2 style="margin:0">📔 Travel Journal</h2><p style="font-size:13px;opacity:.7">Saved on this device only.</p><input id="jt" placeholder="Title" value="'+esc(typeof pre==='string'?pre:'')+'" style="width:100%;padding:8px;font:16px Georgia;box-sizing:border-box"><textarea id="jb" rows="4" placeholder="Dear diary, today I rode a seahorse taxi..." style="width:100%;padding:8px;font:16px Georgia;box-sizing:border-box;margin-top:6px"></textarea><button id="js" style="'+BS+'">💾 Save entry</button>'+
 S.journal.slice().reverse().map((e,r)=>'<div style="padding:8px;margin:8px 0;background:#f4ead8;border-radius:10px"><b>'+esc(e.t||'Untitled')+'</b> <small>'+esc(e.d)+'</small><br>'+esc(e.b).replace(/\n/g,'<br>')+' <button data-x="'+(S.journal.length-1-r)+'" style="'+BS2+'">✖</button></div>').join('')+'<p><button id="pback" style="'+BS+'">⬅ Back</button></p>');
 pn.querySelector('#js').onclick=()=>{const b=pn.querySelector('#jb').value.trim();if(!b)return;S.journal.push({t:pn.querySelector('#jt').value.slice(0,80),b:b.slice(0,4000),d:new Date().toLocaleDateString()});save();openJournal()};
 pn.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{S.journal.splice(+b.dataset.x,1);save();openJournal()})}
// ---- postcard maker ----
let PC={d:0,msg:'Wish you were here!',to:'',font:'Georgia',fr:0};const FR=['#fff','#ffd8e8','#d8f0ff','#fff0c0','#e0ffd8'];
function drawCard(g){const w=900,h=600;g.drawImage(sceneImg(PC.d,900,600),0,0);g.fillStyle=FR[PC.fr];g.fillRect(0,0,w,24);g.fillRect(0,h-24,w,24);g.fillRect(0,0,24,h);g.fillRect(w-24,0,24,h);const d=D[PC.d];
 g.fillStyle='rgba(255,250,238,.88)';g.beginPath();g.roundRect(40,h-190,560,150,14);g.fill();g.fillStyle='#3a2414';g.font='bold 30px '+PC.font;g.fillText('Greetings from '+d.n.replace(/^The /,'')+'!',60,h-145);g.font='22px '+PC.font;
 const ws=PC.msg.split(' ');let l='',Y=h-110;for(const z of ws){if(g.measureText(l+z).width>520&&l){g.fillText(l,60,Y);Y+=28;l=''}l+=z+' '}g.fillText(l,60,Y);if(PC.to){g.font='italic 20px '+PC.font;g.fillText('To: '+PC.to,60,h-52)}
 g.save();g.translate(800,90);g.rotate(.15);g.strokeStyle='#c83a5a';g.lineWidth=4;g.setLineDash([6,4]);g.strokeRect(-55,-55,110,110);g.setLineDash([]);g.font='56px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(d.st,0,-6);g.font='bold 11px Georgia';g.fillStyle='#c83a5a';g.fillText('FANTASY POST',0,40);g.restore();g.textAlign='left';g.textBaseline='alphabetic'}
function openPostcard(i){if(i!==undefined&&!locked(i))PC.d=i;if(locked(PC.d))PC.d=0;
 show('<h2 style="margin:0">💌 Postcard Maker</h2><canvas id="pcv" width="900" height="600" style="width:100%;max-width:640px;border-radius:10px;display:block;margin:6px 0"></canvas>Destination: <select id="pd" style="font:15px Georgia">'+D.map((d,i)=>'<option value="'+i+'"'+(i===PC.d?' selected':'')+(locked(i)?' disabled':'')+'>'+d.e+' '+esc(d.n)+(locked(i)?' 🔒':'')+'</option>').join('')+'</select> Frame: '+FR.map((c,i)=>'<button data-fr="'+i+'" style="width:26px;height:26px;border-radius:50%;border:2px solid #555;background:'+c+'"></button>').join('')+
 ' Font: <select id="pf" style="font:15px Georgia">'+['Georgia','Comic Sans MS','Courier New','Brush Script MT','Trebuchet MS'].map(f=>'<option'+(f===PC.font?' selected':'')+'>'+f+'</option>').join('')+'</select><br><input id="pto" placeholder="To (optional)" value="'+esc(PC.to)+'" style="width:100%;padding:6px;font:15px Georgia;box-sizing:border-box;margin-top:6px"><textarea id="pm" rows="2" style="width:100%;padding:6px;font:15px Georgia;box-sizing:border-box;margin-top:6px">'+esc(PC.msg)+'</textarea>'+
 '<p><button id="pback" style="'+BS+'">⬅ Back</button><button id="pex" style="'+BS2+'">🖼️ Export PNG</button><button id="psv" style="'+BS2+'">💾 Save to my postcards</button></p><h3>My postcards</h3><div id="pcl">'+(S.cards.length?S.cards.map((c,n)=>'<button data-l="'+n+'" style="'+BS2+'">'+D[c.d].e+' '+esc((c.to||'Postcard')+' · '+c.msg.slice(0,24))+'</button>').join(''):'<i>None saved yet.</i>')+'</div>');
 const re=()=>drawCard(pn.querySelector('#pcv').getContext('2d'));re();
 pn.querySelector('#pd').onchange=e=>{PC.d=+e.target.value;re()};pn.querySelector('#pf').onchange=e=>{PC.font=e.target.value;re()};pn.querySelector('#pm').oninput=e=>{PC.msg=e.target.value.slice(0,200);re()};pn.querySelector('#pto').oninput=e=>{PC.to=e.target.value.slice(0,40);re()};
 pn.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>{PC.fr=+b.dataset.fr;re()});
 pn.querySelector('#pex').onclick=()=>{const a=document.createElement('a');a.href=pn.querySelector('#pcv').toDataURL('image/png');a.download='fantasy-postcard.png';document.body.appendChild(a);a.click();a.remove()};
 pn.querySelector('#psv').onclick=()=>{S.cards.push(Object.assign({},PC));if(S.cards.length>30)S.cards.shift();save();openPostcard()};
 pn.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{Object.assign(PC,S.cards[+b.dataset.l]);openPostcard()})}
(function(){const o=document.createElement('canvas');o.width=300;o.height=200;ART.sky(o.getContext('2d'),300,200);window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);for(const k in BTN)delete BTN[k];({title:drawTitle,menu:drawMenu,atlas:drawAtlas,passport:drawPassport,panel:()=>x.drawImage(sceneImg(cur,900,600),0,0)})[G.state]();x.textAlign='left'}
window.FT={G,S,D,openDest,openPlanner,openJournal,openPostcard,drawCard};startLoop();
