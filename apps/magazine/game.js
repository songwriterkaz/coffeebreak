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
// ===== Coffeebreak Magazine (all celebrities fictional) =====
const DEMO=!!window.DEMO,SK=DEMO?'cbmagDemo':'cbmagSave';
let S={issue:1,votes:{},rates:{},cover:{h1:'',h2:'',h3:''},faves:[],gossip:[]};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
if(DEMO)S.issue=1;
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[m]);
function RNG(seed){let s=seed*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280}}
const CELEBS=[
['Sienna Vale','💃','Pop superstar','Five-time chart-topper famous for glitter capes and midnight album drops.','Leo','#e8457a'],
['Jett Maddox','🎸','Rock frontman','Leather-jacketed lead singer of The Velvet Wreckage. Allegedly owns 40 identical sunglasses.','Scorpio','#2b2b3a'],
['Clementine Rae','🎬','Oscar-tipped actress','Period-drama queen who cries on cue and knits on set.','Cancer','#b5838d'],
['Dante Okafor','🏀','Basketball MVP','Two-time champion turned sneaker designer and part-time DJ.','Aries','#f4a261'],
['Lola Bright','📱','Influencer','14 million followers, 3 skincare lines and one very famous chihuahua named Biscuit.','Gemini','#ff9ecd'],
['Marcus Steele','🦸','Action hero','Does all his own stunts, except the ones involving spiders.','Capricorn','#3d5a80'],
['Ivy Lacroix','👗','Supermodel','Walked 60 runways in one season and still found time to open a vegan bakery.','Libra','#9d4edd'],
['Rafferty Quinn','🎤','Boy-band heartthrob','Former member of 4Ever Boyz, now a "serious" solo artist with a cello.','Pisces','#48cae4'],
['Duchess Bea Ashworth','👑','Socialite','Fictional aristocrat famous for tiaras, tea parties and terrible poetry.','Taurus','#d4af37'],
['Kai Nakamura','🎮','Gaming streamer','Speedrun champion with a ring light brighter than the sun.','Aquarius','#06d6a0'],
['Valentina Cruz','💄','Beauty mogul','Built a lipstick empire from her bathroom and names every shade after an ex.','Virgo','#c1121f'],
['Beau Hartley','🤠','Country singer','Sings about trucks, heartbreak and his nan. Mostly his nan.','Sagittarius','#bc6c25'],
['Nova Sterling','🚀','Tech billionaire','Owns three islands and a robot butler called Gerald.','Aquarius','#5e60ce'],
['Peaches Monroe','🍑','Reality TV star','Has been on 9 dating shows and found love on none of them.','Leo','#ffb4a2'],
['Theo Blackwood','🧛','Vampire-show star','Plays a 400-year-old brooding vampire; in real life loves garlic bread.','Scorpio','#540b0e'],
['Aria Moon','🌙','Indie singer','Whispers every lyric and records exclusively in forests.','Pisces','#a2d2ff'],
['Gianni Russo','👨‍🍳','Celebrity chef','Shouts at soufflés on prime-time TV. The soufflés always win.','Aries','#e76f51'],
['Skye Delacourt','🎾','Tennis ace','Grand-slam winner with a fierce backhand and fiercer headbands.','Gemini','#90be6d'],
['Zane Fox','🕺','Dancer & judge','Talent-show judge known for his catchphrase "Darling, NO."','Libra','#f72585'],
['Honey Blaze','🔥','Rapper','Diamond-selling rapper who also breeds prize-winning alpacas.','Sagittarius','#ff6d00'],
['Oliver Pembrook','🎭','Stage actor','Theatre luvvie who has played Hamlet 900 times and wants a break.','Virgo','#6c757d'],
['Cherry Vex','🖤','Goth pop icon','Black lipstick, black lace, surprisingly sunny personality.','Capricorn','#3c096c'],
['Remy Laurent','📸','Fashion photographer','Has photographed everyone; refuses to be photographed.','Taurus','#7f5539'],
['Tallulah Grace','🩰','Ballet star','Prima ballerina who secretly loves monster-truck rallies.','Cancer','#ffc8dd']
].map(([n,e,j,b,z,c])=>({n,e,j,b,z,c}));
const PLACES=['a Malibu juice bar','a Paris flea market','the drive-through at 2am','a Bondi café','a secret London karaoke bar','a Tokyo arcade','an IKEA car park','a Monaco yacht party','a Byron Bay yoga retreat','a petrol station in Ohio','the front row at Milan Fashion Week','a garden centre buying gnomes','a Vegas wedding chapel (just looking?!)','a Melbourne laneway','a Nashville honky-tonk'];
const DOING=['wearing pyjamas and diamonds','arguing with a parking meter','carrying 14 shopping bags','in a disguise fooling no-one','dancing alone to no music','feeding a swan a croissant','buying 30 scratchies','crying at a rom-com','signing autographs for a cardboard cut-out','eating spaghetti in a white suit'];
const SCANDAL=['{a} caught lip-syncing at charity gala — "the microphone was ON," says insider','{a}\'s secret second album leaked by a pet-sitter','{a} banned from luxury hotel after "the chandelier incident"','{a} accused of stealing {b}\'s signature dance move','Shock as {a} admits they have never actually seen the ocean','{a} in hot water after 3am rant about pineapple on pizza','{a}\'s "all-natural" look revealed to be 11 hours of makeup','Tell-all memoir from {a}\'s former butler names names','{a} walks off chat-show set over "the question about the goat"','{a} fined for parking a hovercraft outside a bakery'];
const ROMANCE=['{a} & {b}: holding hands at the beach! Is it LOVE?','{a} and {b} spotted sharing a milkshake — two straws!','Wedding bells? {a} flashes huge ring after date with {b}','{a} writes love song "obviously" about {b}','Exclusive: {a} and {b} adopt a puppy together'];
const BREAK=['It\'s OVER: {a} and {b} split after 6 whole weeks','{a} unfollows {b} — fans in meltdown','{a} returns {b}\'s hoodie in dramatic airport hand-off','"We\'re still friends," insists {a}. {b}\'s face says otherwise','{a} deletes every photo with {b} except one of the dog'];
const FEUD=['FEUD! {a} vs {b}: who wore the canary-yellow suit first?','{a} snubs {b} at awards after-party','{a} and {b} in war of words over best taco truck','Cold shoulder: {a} refuses to sit near {b} at fashion show','{a} says {b}\'s new song "sounds like a dishwasher"','{a} vs {b}: the great charity bake-off sabotage'];
const LOOKS=['sequinned ballgown','pastel power suit','feathered jumpsuit','metallic mini dress','velvet tuxedo','neon puffer coat','sheer lace gown','denim-on-denim','giant bow dress','chainmail top','tulle cloud skirt','leopard-print suit'];
const COLS=['#e8457a','#d4af37','#5e60ce','#06d6a0','#111','#fff','#c1121f','#ff9ecd','#48cae4','#9d4edd','#f4a261','#3c096c','#90be6d'];
const SIGNS=[['♈','Aries'],['♉','Taurus'],['♊','Gemini'],['♋','Cancer'],['♌','Leo'],['♍','Virgo'],['♎','Libra'],['♏','Scorpio'],['♐','Sagittarius'],['♑','Capricorn'],['♒','Aquarius'],['♓','Pisces']];
const HORO=['A surprise invitation brings sparkle — say yes to the party.','Your glow is undeniable; strangers will ask for your skincare routine.','Avoid drama in group chats this week. Mute, smile, carry on.','Money luck arrives in small, shiny ways. Check your coat pockets.','Someone admires you from afar. They like your playlist, too.','Time for a fresh look — a bold lip or a new fringe calls your name.','Rest is your red carpet this week. Cosy socks are couture.','An old flame flickers. Remember why you blew it out.','Your creativity is on fire; write, sing, paint, post.','Say what you mean, darling. Directness is very in this season.','A friend needs your famous advice — bring snacks.','Spontaneous road trip energy! Pack sunnies and a good song.'];
const QUIZZES=[
{t:'Which Coffeebreak celeb are you?',q:[['Your perfect Saturday?',['Stage lights & screaming fans','A cosy film marathon','A sweaty workout','A fancy party']],['Pick a snack',['Glitter cupcake','Garlic bread','Protein bar','Caviar on toast']],['Your signature look?',['Sequins everything','Black leather','Sporty chic','Tiara, obviously']]],r:[0,14,3,8]},
{t:'What is your red-carpet style?',q:[['Choose a colour',['Hot pink','Midnight black','Gold','Pastel blue']],['Shoes?',['Platform boots','Stilettos','Sneakers','Barefoot, darling']],['Accessory?',['Giant bow','Chainmail','Sunglasses indoors','Pet chihuahua']]],r:[0,21,1,4],res:['Bubblegum Bombshell','Gothic Glamour','Golden Goddess','Dreamy Darling']},
{t:'How famous would you be?',q:[['Paparazzi at your door — you…',['Pose!','Hide behind a plant','Offer them tea','Call your publicist']],['Your secret talent?',['Singing','Lying convincingly','Juggling','Napping']],['Fans ask for a selfie',['Of course!','Only on Tuesdays','Make it a group one','Run']]],r:[0,9,16,22],res:['A-list Megastar','Cult Legend','Beloved National Treasure','Mysterious Recluse']}];
const POLLQ=[['Who wore it best: the canary-yellow suit?','{a}','{b}'],['Should {a} and {b} get back together?','Yes, soulmates!','No, move on!'],['Best new single this week?','{a}','{b}'],['Who would you trust with your dog?','{a}','{b}'],['Who wins the feud?','{a}','{b}'],['Is {a}\'s new fringe a hit?','HIT','MISS']];
function pick(r,a){return a[Math.floor(r()*a.length)]}
function two(r){const a=Math.floor(r()*CELEBS.length);let b=Math.floor(r()*CELEBS.length);if(b===a)b=(b+1)%CELEBS.length;return[CELEBS[a],CELEBS[b]]}
function fill(s,a,b){return s.replace(/\{a\}/g,a.n).replace(/\{b\}/g,b.n)}
function makeIssue(n){const r=RNG(n*7+3),I={n,stories:[],romance:[],feuds:[],spotted:[],looks:[],polls:[],horo:{},quiz:QUIZZES[n%QUIZZES.length]};
 for(let i=0;i<4;i++){const[a,b]=two(r);I.stories.push({h:fill(pick(r,SCANDAL),a,b),a,b,src:pick(r,['a close pal','a waiter','a very chatty florist','sources','a neighbour with binoculars','their hairdresser'])})}
 for(let i=0;i<3;i++){const[a,b]=two(r);I.romance.push({h:fill(pick(r,r()<.5?ROMANCE:BREAK),a,b),a,b})}
 for(let i=0;i<3;i++){const[a,b]=two(r);I.feuds.push({h:fill(pick(r,FEUD),a,b),a,b})}
 for(let i=0;i<5;i++){const a=pick(r,CELEBS);I.spotted.push(a.e+' <b>'+a.n+'</b> spotted at '+pick(r,PLACES)+', '+pick(r,DOING)+'.')}
 for(let i=0;i<6;i++){const a=pick(r,CELEBS);I.looks.push({a,look:pick(r,LOOKS),c1:pick(r,COLS),c2:pick(r,COLS),hit:r()<.55,id:n+'-'+i})}
 for(let i=0;i<3;i++){const[a,b]=two(r),p=pick(r,POLLQ);I.polls.push({q:fill(p[0],a,b),o:[fill(p[1],a,b),fill(p[2],a,b)],id:n+'-p'+i,base:[Math.floor(r()*400)+50,Math.floor(r()*400)+50]})}
 SIGNS.forEach((s,i)=>I.horo[s[1]]=HORO[(i+n*5)%HORO.length]);I.cover=I.stories[0];return I}
// ---- outfit art ----
function outfitArt(L,w,h){const o=document.createElement('canvas');o.width=w;o.height=h;const g=o.getContext('2d');const q=g.createLinearGradient(0,0,0,h);q.addColorStop(0,'#2a0a1a');q.addColorStop(1,'#7a1f3d');g.fillStyle=q;g.fillRect(0,0,w,h);
 g.fillStyle='#c1121f';g.fillRect(0,h*.86,w,h*.14);for(let i=0;i<8;i++){g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(Math.random()*w,Math.random()*h*.5,2,0,7);g.fill()}
 const X=w/2,s=h/300;g.fillStyle='#e0ac69';g.beginPath();g.arc(X,55*s,20*s,0,7);g.fill();g.fillStyle=L.a.c;g.beginPath();g.arc(X,48*s,22*s,Math.PI,0);g.fill();
 g.fillStyle=L.c1;g.beginPath();g.moveTo(X-22*s,80*s);g.lineTo(X+22*s,80*s);g.lineTo(X+(/gown|skirt|dress/.test(L.look)?60:28)*s,255*s);g.lineTo(X-(/gown|skirt|dress/.test(L.look)?60:28)*s,255*s);g.closePath();g.fill();
 g.fillStyle=L.c2;g.fillRect(X-24*s,130*s,48*s,10*s);if(/bow/.test(L.look)){g.beginPath();g.ellipse(X-18*s,92*s,16*s,10*s,0,0,7);g.ellipse(X+18*s,92*s,16*s,10*s,0,0,7);g.fill()}
 if(/sequin|metallic|chainmail/.test(L.look))for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,'+Math.random()*.7+')';g.fillRect(X-40*s+Math.random()*80*s,90*s+Math.random()*160*s,2,2)}
 if(/feather|tulle|puffer/.test(L.look))for(let i=0;i<14;i++){g.fillStyle=L.c2;g.beginPath();g.arc(X-40*s+Math.random()*80*s,120*s+Math.random()*130*s,7*s,0,7);g.fill()}
 g.strokeStyle='#e0ac69';g.lineWidth=7*s;g.beginPath();g.moveTo(X-22*s,88*s);g.lineTo(X-38*s,170*s);g.moveTo(X+22*s,88*s);g.lineTo(X+38*s,170*s);g.stroke();g.font=24*s+'px serif';g.textAlign='center';g.fillText(L.a.e,X+50*s,40*s);return o.toDataURL()}
// ---- panel (magazine pages) ----
const st=document.createElement('style');st.textContent='#mag{display:none;position:fixed;inset:3% 6% 9% 6%;z-index:90;perspective:1800px}#mag .pg{position:absolute;inset:0;background:#fffaf3;color:#221;border-radius:6px 16px 16px 6px;padding:20px 26px;overflow:auto;font:16px/1.5 Georgia,serif;box-shadow:inset 18px 0 22px -14px #0006,0 10px 40px #000a;transform-origin:left center}#mag .flip{animation:flp .55s ease}@keyframes flp{from{transform:rotateY(-80deg);opacity:.3}to{transform:rotateY(0);opacity:1}}#mag h1{font:900 34px/1.1 "Didot","Bodoni MT",Georgia,serif;color:#c1124f;margin:4px 0 8px;letter-spacing:-1px}#mag h2{font:800 22px Georgia;color:#7a1f3d;margin:14px 0 4px}#mag .kick{display:inline-block;background:#c1124f;color:#fff;font:bold 12px Arial;padding:2px 8px;letter-spacing:2px;text-transform:uppercase}#mag .card{background:#fff;border:1px solid #f0d3dc;border-radius:12px;padding:10px 14px;margin:8px 0;box-shadow:0 2px 6px #0001}#mag .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}#mag button.b{margin:3px;padding:7px 14px;border:0;border-radius:20px;background:#c1124f;color:#fff;font:bold 14px Georgia;cursor:pointer}#mag button.o{background:#fff;color:#c1124f;border:2px solid #c1124f}#mag .nav{position:sticky;top:-20px;background:#fffaf3;padding:6px 0;border-bottom:2px solid #c1124f;margin:-6px 0 10px;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:2px}#mag .bar{height:12px;background:#f3d1dc;border-radius:6px;overflow:hidden}#mag .bar i{display:block;height:100%;background:#c1124f}#mag .fic{font:italic 12px Arial;color:#888;margin-top:16px}';document.head.appendChild(st);
const mag=document.createElement('div');mag.id='mag';document.body.appendChild(mag);
let I=makeIssue(S.issue),page=0;
const PAGES=[['Cover','cover'],['Contents','contents'],['Hot Gossip','gossip'],['Love & Breakups','love'],['Feuds','feuds'],['Spotted','spotted'],['Red Carpet','carpet'],['Hits & Misses','hits'],['Polls','polls'],['Horoscopes','horo'],['Quiz','quiz'],['Star Profiles','stars'],['Gossip Generator','gen'],['Cover Maker','maker'],['Coffeebreak Feature','cb']];
const FIC='<div class="fic">All celebrities, stories and quotes in Coffeebreak Magazine are fictional. Any resemblance to real people is coincidental. For entertainment only.</div>';
function nav(){return '<div class="nav"><button class="b o" data-go="close">✖ Close</button><button class="b o" data-go="prev">◀</button><b style="margin:0 6px;color:#c1124f">Issue #'+I.n+' · '+PAGES[page][0]+' ('+(page+1)+'/'+PAGES.length+')</b><button class="b o" data-go="next">▶</button><select id="jump" style="font:14px Georgia;margin-left:6px">'+PAGES.map((p,i)=>'<option value="'+i+'"'+(i===page?' selected':'')+'>'+p[0]+'</option>').join('')+'</select></div>'}
const R={};
R.cover=()=>'<div style="text-align:center"><canvas id="cv" width="420" height="560" style="max-width:100%;border-radius:6px;box-shadow:0 6px 20px #0005"></canvas><p><button class="b" data-go="next">Open the magazine ▶</button></p></div>';
R.contents=()=>'<span class="kick">Inside this issue</span><h1>Issue #'+I.n+'</h1>'+PAGES.slice(2).map((p,i)=>'<div class="card" style="cursor:pointer" data-pg="'+(i+2)+'"><b style="color:#c1124f">p.'+(i*4+6)+'</b> &nbsp;'+p[0]+(p[1]==='maker'&&DEMO?' 🔒':'')+'</div>').join('');
R.gossip=()=>'<span class="kick">Exclusive</span><h1>Hot Gossip</h1>'+I.stories.map(s=>'<div class="card"><h2>'+esc(s.h)+'</h2><p>'+s.a.e+' According to '+s.src+', '+esc(s.a.n)+' ('+s.a.j.toLowerCase()+') was "absolutely mortified" — or possibly thrilled. Reps for '+esc(s.a.n)+' said only: "No comment, but also, look at the shoes." '+esc(s.b.n)+' is said to be "watching closely with popcorn."</p></div>').join('');
R.love=()=>'<span class="kick">Heart to heart</span><h1>Love & Breakups</h1>'+I.romance.map(s=>'<div class="card"><h2>'+s.a.e+'💕'+s.b.e+' '+esc(s.h)+'</h2><p>Fans have already named the couple <b>"'+esc(s.a.n.split(' ')[0].slice(0,3)+s.b.n.split(' ')[0].slice(-4).toLowerCase())+'"</b>. Our body-language expert rates the chemistry <b>'+(5+s.a.n.length%6)+'/10</b>.</p></div>').join('');
R.feuds=()=>'<span class="kick">Claws out</span><h1>Feuds</h1>'+I.feuds.map(s=>'<div class="card"><h2>'+s.a.e+' ⚔️ '+s.b.e+' '+esc(s.h)+'</h2><p>Who\'s side are you on? Team '+esc(s.a.n.split(' ')[0])+' or Team '+esc(s.b.n.split(' ')[0])+'? Head to the Polls page to vote.</p></div>').join('');
R.spotted=()=>'<span class="kick">Seen it first</span><h1>Spotted!</h1>'+I.spotted.map(s=>'<div class="card">📸 '+s+'</div>').join('');
R.carpet=()=>'<span class="kick">Rate the outfit</span><h1>Red Carpet</h1><div class="grid">'+I.looks.map((L,i)=>{const v=S.rates[L.id];return '<div class="card" style="text-align:center"><img src="'+outfitArt(L,190,300)+'" style="width:100%;border-radius:8px"><b>'+esc(L.a.n)+'</b><br><i>'+L.look+'</i><br>'+[1,2,3,4,5].map(k=>'<span data-rate="'+i+'" data-k="'+k+'" style="cursor:pointer;font-size:22px">'+(v>=k?'⭐':'☆')+'</span>').join('')+(v?'<br><small>You rated '+v+'/5 · readers: '+(2.5+((i*7+I.n)%25)/10).toFixed(1)+'</small>':'')+'</div>'}).join('')+'</div>';
R.hits=()=>'<span class="kick">The verdict</span><h1>Fashion Hits & Misses</h1><div class="grid">'+I.looks.map(L=>'<div class="card" style="text-align:center"><img src="'+outfitArt(L,160,250)+'" style="width:100%;border-radius:8px"><h2 style="color:'+(L.hit?'#2a9d4f':'#c1121f')+'">'+(L.hit?'✅ HIT':'❌ MISS')+'</h2>'+esc(L.a.n)+' in a '+L.look+'. '+(L.hit?'Iconic. Frame it.':'Bold… maybe too bold.')+'</div>').join('')+'</div>';
R.polls=()=>'<span class="kick">You decide</span><h1>Reader Polls</h1>'+I.polls.map((p,i)=>{const v=S.votes[p.id];let tot=p.base[0]+p.base[1]+(v!=null?1:0);return '<div class="card"><h2>'+esc(p.q)+'</h2>'+p.o.map((o,k)=>{const n=p.base[k]+(v===k?1:0),pc=Math.round(n*100/tot);return v==null?'<button class="b o" data-vote="'+i+'" data-k="'+k+'">'+esc(o)+'</button>':'<div>'+(v===k?'✔ ':'')+esc(o)+' — '+pc+'%<div class="bar"><i style="width:'+pc+'%"></i></div></div>'}).join('')+'</div>'}).join('');
R.horo=()=>'<span class="kick">Star signs</span><h1>Horoscopes</h1><div class="grid">'+SIGNS.map(s=>{const c=CELEBS.filter(z=>z.z===s[1]).map(z=>z.n);return '<div class="card"><h2>'+s[0]+' '+s[1]+'</h2>'+I.horo[s[1]]+(c.length?'<br><small>Same sign as: '+esc(c.join(', '))+'</small>':'')+'</div>'}).join('')+'</div>';
let QA=[];
R.quiz=()=>{const Q=I.quiz;let h='<span class="kick">Quiz</span><h1>'+Q.t+'</h1>';Q.q.forEach((q,i)=>{h+='<div class="card"><b>'+(i+1)+'. '+q[0]+'</b><br>'+q[1].map((o,k)=>'<button class="b '+(QA[i]===k?'':'o')+'" data-qa="'+i+'" data-k="'+k+'">'+o+'</button>').join('')+'</div>'});
 if(QA.filter(v=>v!=null).length===Q.q.length){const cnt=[0,0,0,0];QA.forEach(k=>cnt[k]++);const w=cnt.indexOf(Math.max(...cnt)),c=CELEBS[Q.r[w]];h+='<div class="card" style="background:#ffe3ec"><h2>🎉 You are: '+(Q.res?Q.res[w]+' — just like '+c.e+' '+esc(c.n):c.e+' '+esc(c.n))+'!</h2>'+esc(c.b)+'</div>'}return h};
R.stars=()=>'<span class="kick">Who\'s who</span><h1>Star Profiles</h1><div class="grid">'+CELEBS.map((c,i)=>'<div class="card" style="border-top:6px solid '+c.c+'"><div style="font-size:40px">'+c.e+'</div><b>'+esc(c.n)+'</b><br><i>'+c.j+' · '+c.z+'</i><p style="font-size:14px">'+esc(c.b)+'</p><button class="b o" data-fav="'+i+'">'+(S.faves.includes(i)?'❤️ Fave':'🤍 Add fave')+'</button></div>').join('')+'</div>';
let GEN='';
R.gen=()=>'<span class="kick">Write your own</span><h1>Gossip Headline Generator</h1><p>Pick your stars (or let fate decide) and spin a juicy headline.</p><div class="card">Star 1: <select id="g1">'+CELEBS.map((c,i)=>'<option value="'+i+'">'+esc(c.n)+'</option>').join('')+'</select> Star 2: <select id="g2">'+CELEBS.map((c,i)=>'<option value="'+i+'"'+(i===1?' selected':'')+'>'+esc(c.n)+'</option>').join('')+'</select><br>Type: <select id="gt"><option>Scandal</option><option>Romance</option><option>Breakup</option><option>Feud</option><option>Any</option></select> <button class="b" data-gen="1">✨ Spin headline</button> <button class="b o" data-gen="r">🎲 Random stars</button><br><br>Or type your own: <input id="gown" placeholder="Your headline…" style="width:60%;padding:6px;font:15px Georgia"> <button class="b o" data-gen="own">Save</button></div>'+(GEN?'<div class="card" style="background:#ffe3ec"><h2>'+esc(GEN)+'</h2></div>':'')+'<h2>My headlines</h2>'+(S.gossip.length?S.gossip.slice().reverse().map(g=>'<div class="card">📰 '+esc(g)+'</div>').join(''):'<i>None yet.</i>');
R.maker=()=>DEMO?'<span class="kick">Full version</span><h1>Cover Maker 🔒</h1><p>Put YOURSELF on the cover! Upload your photo, add headlines and export it as a PNG. The Cover Maker and endless new issues are in the full version.</p><button class="b" data-go="end">Find out more</button>':
 '<span class="kick">Be the star</span><h1>Cover Maker</h1><div style="display:flex;flex-wrap:wrap;gap:16px"><canvas id="mk" width="600" height="800" style="width:300px;height:400px;border-radius:6px;box-shadow:0 6px 20px #0005"></canvas><div style="flex:1;min-width:220px"><p>📷 <input type="file" id="mf" accept="image/*"></p><p>Main headline<br><input id="m1" value="'+esc(S.cover.h1||'MY SHOCK GLOW-UP!')+'" style="width:100%;padding:6px;font:15px Georgia"></p><p>Side story<br><input id="m2" value="'+esc(S.cover.h2||'The diet secrets of a nap champion')+'" style="width:100%;padding:6px;font:15px Georgia"></p><p>Corner badge<br><input id="m3" value="'+esc(S.cover.h3||'EXCLUSIVE')+'" style="width:100%;padding:6px;font:15px Georgia"></p><p>Masthead colour: '+['#c1124f','#111','#d4af37','#5e60ce','#06a77d','#fff'].map(c=>'<button data-mc="'+c+'" style="width:26px;height:26px;border-radius:50%;border:2px solid #555;background:'+c+'"></button>').join('')+'</p><button class="b" data-go="png">🖼️ Export PNG</button></div></div>';
R.cb=()=>'<span class="kick">Editor\'s letter</span><h1>From the Editor: Karen O\'Brien ☕</h1><div class="card"><p>Hello, darlings! Welcome to <b>Coffeebreak Magazine</b>, where the stars are fake but the fun is real. I\'m Karen, your editor-in-chief, and when I\'m not dishing the dirt on our (totally made-up) celebs, I\'m making music.</p><p>🎵 Every song you hear while you read is one of mine. Tap <b>Skip</b> to hear the next one, or find me on Suno and YouTube using the link bar below. If you love a tune, subscribe — it means the world.</p><p>🎮 Coffeebreak makes games and apps for everyone, from kids\' games to cosy apps. Find them all at <a href="https://coffeebreaks.itch.io" target="_blank" rel="noopener">coffeebreaks.itch.io</a>.</p><p>Stay fabulous,<br><i style="font-size:22px;color:#c1124f">Karen x</i></p></div><div class="card"><h2>⭐ Coffeebreak Star of the Week</h2>Our resident songstress has been spotted in the studio, wearing pyjamas and diamonds, recording song after song. Sources say "she simply never stops."</div>'+(DEMO?'<button class="b" data-go="end">Next issue ▶</button>':'<button class="b" data-go="issue">Next issue (#'+(I.n+1)+') ▶</button>');
let photo=null,mc='#c1124f';
function drawCover(g,w,h,custom){g.fillStyle='#2a0a1a';g.fillRect(0,0,w,h);const s=w/420;
 if(custom&&photo){const r=Math.max(w/photo.width,h/photo.height);g.drawImage(photo,(w-photo.width*r)/2,(h-photo.height*r)/2,photo.width*r,photo.height*r)}
 else{const L=I.looks[0],im=custom?null:new Image();const q=g.createRadialGradient(w/2,h*.5,10,w/2,h*.5,h*.7);q.addColorStop(0,I.cover.a.c);q.addColorStop(1,'#1a0510');g.fillStyle=q;g.fillRect(0,0,w,h);g.font=200*s+'px serif';g.textAlign='center';g.fillText(custom?'🌟':I.cover.a.e,w/2,h*.62)}
 g.fillStyle=custom?mc:'#c1124f';g.font='900 '+78*s+'px Didot,"Bodoni MT",Georgia,serif';g.textAlign='center';g.fillText('COFFEEBREAK',w/2,78*s);g.font='bold '+14*s+'px Arial';g.fillStyle='#fff';g.fillText((custom?'SPECIAL EDITION':'ISSUE #'+I.n)+' · ALL THE GOSSIP · $4.99',w/2,100*s);
 const H1=custom?(S.cover.h1||''):I.cover.h,H2=custom?(S.cover.h2||''):I.romance[0].h,H3=custom?(S.cover.h3||''):'SPOTTED!';
 g.textAlign='left';g.fillStyle='#ffde59';g.font='900 '+30*s+'px Arial';g.shadowColor='#000';g.shadowBlur=8*s;let y=h-150*s;const words=H1.toUpperCase().split(' ');let l='';const lines=[];for(const z of words){if(g.measureText(l+z).width>w-40*s&&l){lines.push(l);l=''}l+=z+' '}lines.push(l);lines.slice(-4).forEach((t,i)=>g.fillText(t,20*s,h-40*s-(Math.min(lines.length,4)-1-i)*34*s));
 g.fillStyle='#fff';g.font='bold '+16*s+'px Georgia';const w2=H2.split(' ');l='';y=140*s;for(const z of w2){if(g.measureText(l+z).width>150*s&&l){g.fillText(l,20*s,y);y+=20*s;l=''}l+=z+' '}g.fillText(l,20*s,y);g.shadowBlur=0;
 g.fillStyle='#ffde59';g.beginPath();g.arc(w-70*s,170*s,52*s,0,7);g.fill();g.fillStyle='#c1124f';g.font='900 '+15*s+'px Arial';g.textAlign='center';const b=H3.toUpperCase().split(' ');b.slice(0,3).forEach((t,i)=>g.fillText(t,w-70*s,176*s+(i-(Math.min(b.length,3)-1)/2)*18*s));g.textAlign='left'}
function render(flip){mag.innerHTML='<div class="pg'+(flip?' flip':'')+'">'+nav()+R[PAGES[page][1]]()+FIC+'</div>';const pg=mag.firstChild;
 const cv=pg.querySelector('#cv');if(cv)drawCover(cv.getContext('2d'),420,560,false);
 const mk=pg.querySelector('#mk');if(mk){const re=()=>drawCover(mk.getContext('2d'),600,800,true);re();
  pg.querySelector('#mf').onchange=e=>{const f=e.target.files[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{photo=im;re()};im.src=u};
  ['m1','m2','m3'].forEach((id,i)=>pg.querySelector('#'+id).oninput=e=>{S.cover['h'+(i+1)]=e.target.value.slice(0,80);save();re()});
  pg.querySelectorAll('[data-mc]').forEach(b=>b.onclick=()=>{mc=b.dataset.mc;re()})}
 pg.querySelector('#jump').onchange=e=>go(+e.target.value);
 pg.querySelectorAll('[data-pg]').forEach(b=>b.onclick=()=>go(+b.dataset.pg));
 pg.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const a=b.dataset.go;
  if(a==='close'){mag.style.display='none';G.state='title'}else if(a==='next')go(Math.min(PAGES.length-1,page+1));else if(a==='prev')go(Math.max(0,page-1));
  else if(a==='end'){mag.style.display='none';window.demoEnd&&window.demoEnd('You\'ve read the free issue of <b>Coffeebreak Magazine</b>! The full version has endless new issues and the Cover Maker.')}
  else if(a==='issue')nextIssue();else if(a==='png'){const a2=document.createElement('a');a2.href=mk.toDataURL('image/png');a2.download='coffeebreak-cover.png';document.body.appendChild(a2);a2.click();a2.remove()}});
 pg.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>{S.rates[I.looks[+b.dataset.rate].id]=+b.dataset.k;save();render()});
 pg.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>{S.votes[I.polls[+b.dataset.vote].id]=+b.dataset.k;save();render()});
 pg.querySelectorAll('[data-qa]').forEach(b=>b.onclick=()=>{QA[+b.dataset.qa]=+b.dataset.k;render()});
 pg.querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fav,k=S.faves.indexOf(i);k<0?S.faves.push(i):S.faves.splice(k,1);save();render()});
 pg.querySelectorAll('[data-gen]').forEach(b=>b.onclick=()=>{const m=b.dataset.gen;if(m==='own'){const v=pg.querySelector('#gown').value.trim();if(v){S.gossip.push(v.slice(0,140));save()}render();return}
  let a=CELEBS[+pg.querySelector('#g1').value],c=CELEBS[+pg.querySelector('#g2').value];if(m==='r'||a===c){const r=Math.random;[a,c]=two(r)}
  const t=pg.querySelector('#gt').value,P={Scandal:SCANDAL,Romance:ROMANCE,Breakup:BREAK,Feud:FEUD,Any:SCANDAL.concat(ROMANCE,BREAK,FEUD)}[t];GEN=fill(P[Math.floor(Math.random()*P.length)],a,c);S.gossip.push(GEN);if(S.gossip.length>40)S.gossip.shift();save();render()})}
function go(p){page=p;QA=p===PAGES.findIndex(z=>z[1]==='quiz')?QA:[];render(true)}
function openMag(p){mag.style.display='block';G.state='mag';page=p||0;render(true)}
function nextIssue(){if(DEMO){window.demoEnd&&window.demoEnd();return}S.issue++;save();I=makeIssue(S.issue);QA=[];G.level=S.issue;openMag(0)}
// ---- canvas title (magazine rack) ----
const cov=document.createElement('canvas');cov.width=420;cov.height=560;
function drawTitle(){const q=x.createLinearGradient(0,0,0,H);q.addColorStop(0,'#3a0b22');q.addColorStop(1,'#12060c');x.fillStyle=q;x.fillRect(0,0,W,H);
 drawCover(cov.getContext('2d'),420,560,false);x.save();x.translate(250,320);x.rotate(-.06+Math.sin(t)*.01);x.shadowColor='#000';x.shadowBlur=30;x.drawImage(cov,-160,-213,320,427);x.restore();
 T('☕ Coffeebreak Magazine',470,110,38,'#ff8fb1');T('Glossy gossip about fictional stars',470,145,18,'#ffe9c7','left','italic ');
 T('Issue #'+I.n+(DEMO?' · Free demo issue':''),470,180,17,'#ffde59');
 button('read',470,215,330,56,'📖 Read Issue #'+I.n,()=>openMag(0));
 button('stars',470,285,160,46,'⭐ Stars',()=>openMag(11));button('carpet',640,285,160,46,'👗 Red Carpet',()=>openMag(6));
 button('gen',470,345,160,46,'✍️ Gossip',()=>openMag(12));button('maker',640,345,160,46,(DEMO?'🔒 ':'📸 ')+'Cover',()=>openMag(13));
 button('next',470,405,330,46,DEMO?'🔒 Next issue (full version)':'🗞️ Next issue (#'+(I.n+1)+')',nextIssue);
 T('All celebrities are fictional.',470,480,14,'rgba(255,233,239,.7)','left','italic ');ent()}
(function(){const o=document.createElement('canvas');o.width=420;o.height=560;drawCover(o.getContext('2d'),420,560,false);window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,W,H);drawTitle()}
window.MAG={G,S,I:()=>I,openMag,nextIssue,makeIssue,CELEBS,go};startLoop();
