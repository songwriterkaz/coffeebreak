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
// ===== Coffeebreak Kids: Little Chefs =====
const S=kStore('kidsCook',{made:[]});const G={state:'title',score:S.stars,level:0};window.G=G;
// step: [text, emoji, type(tap|drag|stir|wait), n or [drag emojis], grownUp reason or '']
const WASH=['Wash your hands with soap and water for 20 seconds. Scrub the bubbles!','🧼','tap',8,''];
const R=[
{n:'Fairy Bread',e:'🍞',serves:'Makes 16 triangles',time:'10 min',
 ing:[['4 slices white bread','🍞'],['40 g (2 tbsp) butter or margarine, softened','🧈'],['40 g (3 tbsp) hundreds and thousands','🌈']],eq:['Blunt butter knife','Chopping board','Plate','Shallow plate for sprinkles'],
 st:[WASH,['Spread butter all over one side of each slice with the blunt butter knife.','🧈','tap',6,''],['Pour the hundreds and thousands onto a plate. Press each slice butter-side down into the sprinkles.','🌈','drag',['🍞','🍞','🍞','🍞'],''],['Cut each slice into 4 triangles.','🔪','tap',4,'Knife: ask a grown-up to cut, or help you cut.'],['Arrange on a plate and share!','🍽️','tap',3,'']],
 al:'Contains wheat (gluten) and dairy (butter). Use dairy-free spread and gluten-free bread if needed. Some sprinkles contain colourings.'},
{n:'Fruit Kebabs',e:'🍓',serves:'Makes 8 kebabs',time:'15 min',
 ing:[['250 g strawberries','🍓'],['1 banana','🍌'],['2 kiwi fruit','🥝'],['1 cup (150 g) seedless grapes','🍇'],['1 cup (150 g) pineapple pieces, drained','🍍'],['8 blunt-ended skewers','🥢']],eq:['Chopping board','Knife (grown-up)','Colander','Plate'],
 st:[WASH,['Rinse the strawberries and grapes in a colander.','💧','tap',6,''],['Peel the banana. Ask a grown-up to peel the kiwi fruit.','🍌','tap',3,'Knife or peeler: a grown-up peels the kiwi.'],['Cut the fruit into bite-sized chunks. Hull the strawberries.','🔪','tap',6,'Knife: a grown-up cuts the fruit.'],['Thread the fruit onto the blunt skewers, mixing the colours.','🥢','drag',['🍓','🍌','🥝','🍇','🍍'],''],['Eat sitting down, and take the fruit off the stick if you\'re little!','😋','tap',3,'']],
 al:'Usually allergy-friendly. Check for fruit allergies. Children under 4: cut grapes into quarters (choking risk) and slide fruit off the skewer.'},
{n:'Banana Smoothie',e:'🥤',serves:'Makes 2 glasses',time:'5 min',
 ing:[['1 ripe banana','🍌'],['250 ml (1 cup) milk','🥛'],['2 tbsp (40 g) plain or vanilla yoghurt','🥣'],['1 tsp honey (optional)','🍯'],['4 ice cubes','🧊'],['Pinch of cinnamon (optional)','✨']],eq:['Blender (grown-up)','Measuring cup and spoons','2 glasses'],
 st:[WASH,['Peel the banana and break it into pieces.','🍌','tap',4,''],['Put the banana, milk, yoghurt, honey and ice into the blender jug.','🫙','drag',['🍌','🥛','🥣','🍯','🧊'],''],['Put the lid on tight and blend until smooth, about 30 seconds.','🌀','stir',0,'Blender: a grown-up works the blender.'],['Pour into glasses and sprinkle with cinnamon.','🥤','tap',3,'']],
 al:'Contains dairy. Use a plant milk and yoghurt if dairy-free. Do not give honey to babies under 12 months.'},
{n:'Yoghurt Parfait',e:'🍨',serves:'Makes 2 cups',time:'5 min',
 ing:[['1 cup (250 g) vanilla yoghurt','🥣'],['½ cup (60 g) granola or muesli','🌾'],['½ cup (75 g) mixed berries','🫐'],['1 tsp honey (optional)','🍯']],eq:['2 clear cups or jars','Spoon','Measuring cups'],
 st:[WASH,['Spoon a layer of yoghurt into each cup.','🥣','drag',['🥣','🥣'],''],['Add a layer of granola.','🌾','drag',['🌾','🌾'],''],['Add a layer of berries. Repeat the layers!','🫐','drag',['🫐','🫐','🫐'],''],['Drizzle with honey and eat straight away so the granola stays crunchy.','🍯','tap',3,'']],
 al:'Contains dairy. Granola may contain gluten and nuts: check the label. No honey for babies under 12 months.'},
{n:'No-Bake Bliss Balls',e:'🟤',serves:'Makes about 16',time:'20 min + 30 min chilling',
 ing:[['1 cup (150 g) pitted dates','🟫'],['1 cup (90 g) rolled oats','🌾'],['2 tbsp (15 g) cocoa powder','🍫'],['3 tbsp desiccated coconut, plus ½ cup (45 g) for rolling','🥥'],['1–2 tbsp water','💧']],eq:['Food processor (grown-up)','Plate','Container with lid'],
 st:[WASH,['Put the dates, oats, cocoa, 3 tbsp coconut and 1 tbsp water in the food processor.','🫙','drag',['🟫','🌾','🍫','🥥','💧'],''],['Blend until it sticks together when you squeeze it. Add a little more water if it\'s crumbly.','🌀','stir',0,'Food processor: a grown-up runs it (sharp blade!).'],['Roll tablespoons of mixture into balls with clean hands.','🤲','tap',8,''],['Roll each ball in coconut.','🥥','tap',6,''],['Chill in the fridge for 30 minutes. Keep for up to 1 week.','🧊','wait',0,'']],
 al:'Nut-free. Contains oats (may contain gluten) and coconut. Dates have hard pits: always use pitted dates.'},
{n:'Rainbow Wraps',e:'🌯',serves:'Makes 2 wraps',time:'10 min',
 ing:[['2 wholemeal wraps','🫓'],['2 tbsp (40 g) cream cheese','🧀'],['2 slices ham or ½ cup cooked shredded chicken','🍗'],['1 cup (40 g) baby spinach','🥬'],['½ carrot, grated','🥕'],['4 cherry tomatoes, halved','🍅']],eq:['Grater (grown-up help)','Knife (grown-up)','Chopping board','Butter knife'],
 st:[WASH,['Grate the carrot and halve the tomatoes.','🔪','tap',5,'Grater and knife: a grown-up helps.'],['Spread cream cheese over each wrap with a butter knife.','🧀','tap',5,''],['Add ham or chicken, spinach, carrot and tomato down the middle.','🫓','drag',['🍗','🥬','🥕','🍅'],''],['Fold the bottom up, then roll it up tightly.','🌯','tap',4,''],['Cut in half to serve.','🔪','tap',2,'Knife: a grown-up cuts.']],
 al:'Contains wheat (gluten) and dairy. Use gluten-free wraps or dairy-free spread if needed. Children under 4: quarter cherry tomatoes.'},
{n:'Ants on a Log',e:'🐜',serves:'Makes 8 logs',time:'10 min',
 ing:[['4 celery sticks, washed','🥬'],['4 tbsp (80 g) peanut butter OR sunflower seed spread','🥜'],['2 tbsp (20 g) sultanas','🍇']],eq:['Knife (grown-up)','Chopping board','Butter knife or spoon'],
 st:[WASH,['Cut each celery stick into 2 logs, about 10 cm long.','🔪','tap',4,'Knife: a grown-up cuts the celery.'],['Spread the peanut butter or seed spread into the groove of each log.','🥜','tap',6,''],['Line up the sultana "ants" along the top!','🐜','drag',['🍇','🍇','🍇','🍇','🍇'],''],['March your ants to the plate and enjoy.','🍽️','tap',3,'']],
 al:'Peanut butter contains PEANUTS: use sunflower seed spread for nut-free schools or allergies. Children under 4: celery can be a choking risk, so cut it thin.'},
{n:'Overnight Oats',e:'🫙',serves:'Makes 1 jar',time:'5 min + overnight',
 ing:[['½ cup (45 g) rolled oats','🌾'],['½ cup (125 ml) milk','🥛'],['¼ cup (60 g) yoghurt','🥣'],['1 tsp chia seeds','⚫'],['1 tsp maple syrup','🍁'],['¼ cup (35 g) berries','🫐']],eq:['Jar with lid','Measuring cups and spoons','Spoon'],
 st:[WASH,['Put the oats, milk, yoghurt, chia seeds and maple syrup in the jar.','🫙','drag',['🌾','🥛','🥣','⚫','🍁'],''],['Stir it all together really well.','🥄','stir',0,''],['Put the lid on and pop it in the fridge overnight (at least 6 hours).','🧊','wait',0,''],['In the morning, top with berries and eat cold.','🫐','tap',3,'']],
 al:'Contains dairy. Oats may contain gluten. Use plant milk and yoghurt if dairy-free.'},
{n:'Pikelets',e:'🥞',serves:'Makes about 16',time:'25 min',
 ing:[['1 cup (150 g) self-raising flour','🌾'],['2 tbsp (25 g) caster sugar','🍬'],['1 egg','🥚'],['¾ cup (185 ml) milk','🥛'],['About 20 g butter, for greasing','🧈']],eq:['Mixing bowl and whisk','Non-stick frying pan (grown-up)','Egg flip','Tablespoon'],
 st:[WASH,['Sift the flour into a bowl and add the sugar.','🥣','drag',['🌾','🍬'],''],['Crack the egg into a cup, then add egg and milk to the bowl.','🥚','drag',['🥚','🥛'],''],['Whisk until smooth.','🥄','stir',0,''],['Heat the pan over medium-low heat and grease with a little butter.','🔥','tap',3,'HOT STOVE: a grown-up does this step.'],['Drop tablespoons of batter into the pan. Cook until bubbles appear (1–2 min), flip, cook 1 min more.','🍳','tap',6,'HOT PAN: a grown-up cooks and flips.'],['Cool a little, then top with jam or butter!','🥞','tap',3,'']],
 al:'Contains wheat (gluten), egg and dairy. Wash hands after touching raw egg.'},
{n:'Chocolate Crackles',e:'🍫',serves:'Makes 24',time:'15 min + 30 min chilling',
 ing:[['4 cups (120 g) puffed rice cereal','🍚'],['1 cup (125 g) icing sugar, sifted','🍬'],['3 tbsp (20 g) cocoa powder','🍫'],['1 cup (90 g) desiccated coconut','🥥'],['250 g white vegetable shortening, chopped','🧈'],['24 paper patty cases','🧁']],eq:['Large bowl','Small saucepan (grown-up)','Wooden spoon','Patty tin'],
 st:[WASH,['Put the cereal, icing sugar, cocoa and coconut in a big bowl and mix.','🥣','drag',['🍚','🍬','🍫','🥥'],''],['Melt the shortening in a saucepan over low heat. Let it cool slightly.','🔥','tap',3,'HOT STOVE and melted fat: a grown-up does this step.'],['Pour the melted shortening into the bowl and stir until everything is coated.','🥄','stir',0,'Hot liquid: a grown-up pours.'],['Spoon the mixture into the 24 patty cases.','🧁','tap',8,''],['Chill in the fridge for 30 minutes until set.','🧊','wait',0,'']],
 al:'Contains coconut. Some puffed rice cereals contain malt (gluten): choose a gluten-free one if needed.'}];
const N=DEMO?2:R.length;
let ri=0,si=0,prog=0,need=1,tick=[],grownOK=false,dragI=null,dropped=[],stirA=null,msg='',msgT=0,bubbles=[];
function startR(i){ri=i;tick=[];G.state='ing';speak(R[i].n)}
function startSteps(){si=0;setStep()}
function setStep(){const s=R[ri].st[si];prog=0;grownOK=!s[4];dropped=[];stirA=null;need=s[2]==='tap'?s[3]:s[2]==='drag'?s[3].length:s[2]==='stir'?12:1;G.state='step';speak(s[1]&&s[0]);if(s[4])speak('Ask a grown-up! '+s[0])}
function advance(){kTone(880,.1,.05,'triangle');if(si<R[ri].st.length-1){si++;setStep()}else{if(!S.made.includes(ri)){S.made.push(ri);reward(S,3,R[ri].n+' made!')}else reward(S,1,'Yum!');G.level=S.made.length;G.state='done'}}
function addProg(){if(!grownOK||prog>=need)return;prog++;kTone(500+prog*40,.08,.05,'sine');if(prog>=need)setTimeout(advance,500)}
function toast(m){msg=m;msgT=2.5}
function drawTitle(){kbg('#fff3c4','#ffe0d0');T('Coffeebreak Kids',450,90,34,'#ff4f9a','center');T('Little Chefs',454,164,66,'#ff5a9a','center');T('Little Chefs',450,160,66,'#fff','center');['🍓','🥞','🍞','🥤','🍫'].forEach((e,i)=>emo(e,230+i*110,270+Math.sin(t*2+i)*10,54));seal(450,390,.9,'wave');emo('👩‍🍳',530,350,44);kb('go',330,480,240,70,'👩‍🍳 Let\'s cook!',()=>{G.state='menu'},{fs:26})}
function drawMenu(){kbg('#fff3c4','#ffe0d0');starBar(S);T('Pick a recipe',450,60,36,'#ff7a00','center');
 R.forEach((r,i)=>{const X=40+(i%2)*420,Y=85+Math.floor(i/2)*84,lock=i>=N;kb('r'+i,X,Y,400,70,(lock?'🔒 ':S.made.includes(i)?'✅ ':'')+r.e+' '+r.n,()=>{if(lock){window.demoEnd&&window.demoEnd('Yum! The full game has all 10 real recipes, including pikelets and chocolate crackles, plus printable recipe cards and the full sticker book.');return}startR(i)},{bg:lock?'#a0a8c0':['#ff6fae','#4ab0e8','#3ac060','#ff8a3d','#b06aff'][i%5],fs:22})});
 kb('stk',700,15,180,50,'🏷️ Stickers',()=>{G.state='stk'},{bg:'#ffb020',fs:20})}
function drawIng(){const r=R[ri];kbg('#fffaf0','#fff0e0');T(r.e+' '+r.n,450,50,36,'#ff7a00','center');T(r.serves+' · '+r.time,450,80,17,'#7a4a8a','center','');T('Tap each ingredient when you have it:',40,115,18,'#2a3a5a');
 r.ing.forEach((g,i)=>{const on=tick.includes(i);kb('g'+i,40,128+i*58,520,50,'',()=>{on?tick.splice(tick.indexOf(i),1):tick.push(i)},{bg:on?'#3ac060':'#fff',sel:false});emo(g[1],75,153+i*58,28);T((on?'✅ ':'⬜ ')+g[0],100,160+i*58,16,on?'#fff':'#2a3a5a','left','bold ')});
 x.fillStyle='#fff';rr(590,120,280,240,16);x.fill();T('Equipment',610,150,19,'#ff7a00');x.fillStyle='#2a3a5a';x.font='15px '+KF;r.eq.forEach((e,i)=>x.fillText('• '+e,610,180+i*26,250));
 x.fillStyle='#fff6c8';rr(590,370,280,130,16);x.fill();T('⚠️ Allergy note',605,395,16,'#c05a00');x.fillStyle='#5a3a1a';x.font='12px '+KF;wrapT(r.al,605,415,255,15);
 kb('go',300,520,300,64,tick.length===r.ing.length?'👩‍🍳 Start cooking!':'Tick all '+r.ing.length+' first',startSteps,{dis:tick.length<r.ing.length,bg:'#ff6fae',fs:22});kb('bk',20,530,120,50,'⬅',()=>{G.state='menu'},{bg:'#a0a8c0'})}
function bowl(X,Y){x.fillStyle='#e8f4ff';x.beginPath();x.ellipse(X,Y,150,40,0,0,7);x.fill();x.fillStyle='#9ad0f0';x.beginPath();x.moveTo(X-150,Y);x.quadraticCurveTo(X,Y+180,X+150,Y);x.fill();x.strokeStyle='#5aa0d0';x.lineWidth=4;x.stroke()}
function drawStep(){const r=R[ri],s=r.st[si];kbg('#fffaf0','#ffe8d8');x.fillStyle='rgba(255,255,255,.9)';rr(14,10,600,40,20);x.fill();T(r.e+' '+r.n+' · Step '+(si+1)+' of '+r.st.length,30,38,19,'#ff7a00');
 x.fillStyle='#fff';rr(30,60,840,90,18);x.fill();x.strokeStyle='#ffb020';x.lineWidth=3;x.stroke();x.fillStyle='#2a3a5a';x.font='bold 20px '+KF;wrapT(s[0],50,92,800,24);
 if(s[4]&&!grownOK){x.fillStyle='#ffe0e0';rr(150,190,600,240,24);x.fill();x.strokeStyle='#ff4f4f';x.lineWidth=5;x.stroke();emo('🧑‍🍳',450,250,70);T('ASK A GROWN-UP!',450,320,34,'#e02020','center');x.fillStyle='#5a1a1a';x.font='bold 17px '+KF;x.textAlign='center';x.fillText(s[4],450,352);x.textAlign='left';
  kb('ok',280,370,340,54,'✔ A grown-up is helping',()=>{grownOK=true;yay()},{bg:'#3ac060',fs:20});return}
 if(s[4]){x.fillStyle='#ff4f4f';rr(640,10,250,40,20);x.fill();T('🧑‍🍳 Grown-up step',765,37,17,'#fff','center')}
 const ty=s[2];
 if(ty==='tap'){if(s===R[ri].st[0]||s[1]==='🧼'){emo('🧼',450,330,120);bubbles.forEach(b=>{x.strokeStyle='rgba(120,180,255,.7)';x.lineWidth=3;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.stroke()})}else{x.save();x.translate(450,330);const k=1+.1*Math.sin(t*6);x.scale(k,k);emo(s[1],0,0,150);x.restore()}
  T('Tap '+(need-prog)+' more time'+(need-prog===1?'':'s')+'!',450,500,24,'#b06aff','center');BTN.tap={x:250,y:180,w:400,h:300,fn:p=>{if(s[1]==='🧼')for(let i=0;i<4;i++)bubbles.push({x:p.x+(Math.random()-.5)*120,y:p.y+(Math.random()-.5)*80,r:8+Math.random()*20,l:1.5});addProg()}}}
 if(ty==='drag'){bowl(600,330);emo(s[1],600,300,60);dropped.forEach((d,i)=>emo(s[3][+d],530+i*35,350,34));s[3].forEach((e,i)=>{if(dropped.length>i&&dragI!==i&&false)return;const used=dropped.includes(i+'');if(used)return;const p=dragI&&dragI.i===i?dragI:{x:120+(i%2)*110,y:200+Math.floor(i/2)*100};emo(e,p.x,p.y,56)});T('Drag each one into the '+(s[1]==='🍞'?'sprinkles':'bowl')+'!',450,520,22,'#b06aff','center')}
 if(ty==='stir'){bowl(450,330);x.save();x.translate(450,330);x.rotate(prog*.6);emo('🌀',0,0,110);x.restore();emo('🥄',450+Math.cos(t*4)*80,300+Math.sin(t*4)*20,60);T(s[1]==='🌀'?'Spin round and round to blend!':'Stir in circles!',450,520,22,'#b06aff','center');x.fillStyle='#ddd';rr(300,540,300,20,10);x.fill();x.fillStyle='#3ac060';rr(300,540,300*Math.min(1,prog/need),20,10);x.fill()}
 if(ty==='wait'){emo(s[1],450,320,140);kb('w',330,450,240,64,'⏩ Next day!',()=>{toast('…zzz… it\'s ready!');addProg()},{bg:'#4ab0e8',fs:22})}
 kb('bk',20,540,120,50,'⬅',()=>{G.state='menu'},{bg:'#a0a8c0'})}
function drawDone(){const r=R[ri];kbg('#fff3c4','#ffe0f0');T('You made '+r.n+'!',450,90,40,'#ff4f9a','center');emo(r.e,450,240,150);seal(220,360,.9,'wave');T('Now make it for real with a grown-up 👩‍🍳',450,380,20,'#7a4a8a','center','');
 kb('pr',250,420,400,64,'🖨️ Print the real recipe card',()=>printCard(ri),{bg:'#3ac060',fs:22});kb('m',300,500,300,60,'📖 More recipes',()=>{G.state='menu'},{bg:'#4ab0e8',fs:22})}
const card=document.createElement('div');card.id='cookCard';document.body.appendChild(card);
const pcs=document.createElement('style');pcs.textContent='#cookCard{display:none}@media print{body *{visibility:hidden!important}#cookCard,#cookCard *{visibility:visible!important}#cookCard{display:block!important;position:absolute;left:0;top:0;width:100%;font:14px/1.5 Arial,sans-serif;color:#000;background:#fff}#cookCard h1{font-size:24px;margin:0}#cookCard .g{border:2px solid #e00;color:#c00;padding:0 6px;border-radius:6px;font-weight:bold;font-size:12px}#cookCard .al{border:1px solid #999;padding:6px;margin-top:10px;font-size:12px}}';document.head.appendChild(pcs);
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
function cardHTML(i){const r=R[i];return `<h1>${r.e} ${esc(r.n)}</h1><p>${esc(r.serves)} · ${esc(r.time)} · Coffeebreak Kids: Little Chefs</p><h3>Ingredients</h3><ul>${r.ing.map(g=>'<li>'+esc(g[0])+'</li>').join('')}</ul><h3>Equipment</h3><ul>${r.eq.map(g=>'<li>'+esc(g)+'</li>').join('')}</ul><h3>Method</h3><ol>${r.st.map(s=>'<li>'+esc(s[0])+(s[4]?' <span class="g">ASK A GROWN-UP: '+esc(s[4])+'</span>':'')+'</li>').join('')}</ol><div class="al"><b>Allergy note:</b> ${esc(r.al)}<br>Always cook with a grown-up nearby. Australian metric cup = 250 ml, tablespoon = 20 ml, teaspoon = 5 ml.</div>`}
function printCard(i){card.innerHTML=cardHTML(i);try{window.print()}catch(e){}}
bindInput({down(p){const s=G.state==='step'&&R[ri].st[si];if(!s||!grownOK)return;if(s[2]==='drag'){s[3].forEach((e,i)=>{if(dropped.includes(i+''))return;const hx=120+(i%2)*110,hy=200+Math.floor(i/2)*100;if(Math.hypot(p.x-hx,p.y-hy)<45)dragI={i,x:p.x,y:p.y}})}if(s[2]==='stir')stirA=Math.atan2(p.y-330,p.x-450)},
 move(p){if(dragI){dragI.x=p.x;dragI.y=p.y}if(stirA!==null){const a=Math.atan2(p.y-330,p.x-450);let d=Math.abs(Math.atan2(Math.sin(a-stirA),Math.cos(a-stirA)));if(d>.5){stirA=a;addProg()}}},
 up(p){if(dragI){const s=R[ri].st[si];if(Math.hypot(dragI.x-600,dragI.y-330)<160){dropped.push(dragI.i+'');dropped.length;addProg()}dragI=null}stirA=null}});
function update(dt){if(msgT>0)msgT-=dt;bubbles.forEach(b=>{b.y-=40*dt;b.l-=dt});bubbles=bubbles.filter(b=>b.l>0)}
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,menu:drawMenu,ing:drawIng,step:drawStep,done:drawDone,stk:()=>stickerBook(S,()=>{G.state='menu'})})[s]();
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='#fff';rr(250,180,400,50,20);x.fill();T(msg,450,212,20,'#ff7a00','center');x.globalAlpha=1}kOverlay(1/60)}
window.KK={G,S,R,startR,startSteps,advance,addProg,cardHTML,get si(){return si},ok:()=>{grownOK=true}};startLoop();
