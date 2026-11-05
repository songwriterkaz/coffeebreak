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
// ===== Coffeebreak Fantasy Vending Machine =====
const DEMO=!!window.DEMO,SK=DEMO?'vendSaveDemo':'vendSave';
const RAR=[{k:'common',n:'Common',c:'#ffd6e8',w:55,p:1},{k:'rare',n:'Rare',c:'#7fd8ff',w:28,p:2},{k:'epic',n:'Epic',c:'#c48aff',w:12,p:3},{k:'legend',n:'Legendary',c:'#ff7a5a',w:4.2,p:5},{k:'gold',n:'Golden',c:'#ffd24a',w:.8,p:8}];
const RI={};RAR.forEach((r,i)=>RI[r.k]=i);
const PROD=[
['Pocket Rainbow','🌈','common','Fold it out on grey days.'],['Marshmallow Cloud','☁️','common','Soft, sweet, slightly bouncy.'],['Can of Compliments','💬','common','Each sip: “you look amazing today”.'],['Jar of Giggles','😂','common','Open in a quiet library. We dare you.'],['Extra Hour of Sleep','😴','common','Redeemable any Monday.'],['Teleport Donut','🍩','common','Bite it to arrive 5 minutes early.'],['Lucky Clover','🍀','common','Four leaves, zero bad days.'],['Cupcake Cushion','🧁','common','Sit on it. Feel fancy.'],['Glitter Rain','✨','common','Personal weather, sparkle edition.'],['Bat Plushie','🦇','common','Cute, goth, very huggable.'],['Pet Rock with Lashes','🪨','common','Low maintenance. High glamour.'],['Spare Sunday','📅','common','Insert between any two weekdays.'],
['Bottled Moonlight','🌙','rare','Glows softly on your nightstand.'],['Espresso of Courage','☕','rare','One shot, zero fear.'],['Seal Hug','🦭','rare','A warm, blubbery cuddle on demand.'],['Pink Goth Candle','🕯️','rare','Smells like roses and midnight.'],['Haunted Teacup','🫖','rare','The ghost inside only gossips nicely.'],['Pocket Beach','🏖️','rare','Sand not included. Somehow still sandy.'],['Rocket Soda','🚀','rare','Fizz so strong it orbits.'],['Lavender Calm','💜','rare','Breathe in. Breathe out. Ahh.'],
['Fairy Dust','🧚','epic','Sprinkle for instant whimsy.'],['Star in a Capsule','⭐','epic','A real wish-granting star (tiny).'],['Love Potion No.9','💖','epic','Works best on yourself.'],['Snow Globe Kingdom','🔮','epic','Shake it: a whole tiny world cheers.'],['Cotton Candy Cyclone','🍭','epic','Tastes like a fairground in a storm.'],['Rose of Midnight','🥀','epic','Never wilts. Always dramatic.'],
['Tiny Unicorn','🦄','legend','Fits in a teacup. Demands oat milk.'],['Dragon Egg','🥚','legend','Warm it gently. Very gently.'],['Cupcake Crown','👑','legend','For royalty of the sweet kind.'],['Song in a Bottle','🎶','legend','Uncork it and Coffeebreak starts singing.'],
['Golden Ticket','🎫','gold','Admits one to absolutely anywhere.'],['Diamond Latte','💎','gold','The most expensive coffee in the multiverse.'],['Platinum Record','💿','gold','Billionaire, certified platinum.'],['Billionaire Key','🗝️','gold','Unlocks the vault of good vibes.'],['Crown of the Coffeebreak Queen','🌟','gold','The rarest treasure in the machine.']]
.map((a,i)=>({id:i,n:a[0],e:a[1],r:a[2],d:a[3]}));
const ROWS='ABCD',COLS=5;
let S={coins:DEMO?10:20,col:{},wishes:[],taps:0,vended:0,spinDay:'',golds:0,dbl:false,skin:{n:0,b:0,s:0,g:0}};
try{const j=JSON.parse(localStorage.getItem(SK)||'null');if(j)S=Object.assign(S,j)}catch(e){}
const AFF=['I am worthy of every good thing coming my way.','Abundance flows to me easily and often.','My dreams are already on their way.','I am a magnet for joy, love and money.','Everything is working out for me.','I deserve rest, treats and happiness.','My energy creates my reality.','I am grateful for what I have and excited for what is coming.','Good things find me wherever I go.','I trust the timing of my life.','I am confident, capable and glowing.','Money comes to me in expected and unexpected ways.','I radiate love and receive it back tenfold.','Today I choose magic.','I am exactly where I need to be.','My wishes are vending right now.','Luck is my love language.','I give myself permission to shine.'];
const NEONS=[['Hot Pink','#ff4f9a'],['Aqua','#3fe0ff'],['Violet','#b06aff'],['Mint','#5affb0'],['Sunset','#ff8a3d'],['Ruby','#ff2a4a']];
const BODIES=[['Midnight Plum','#2a0a20'],['Goth Black','#0e0a10'],['Bubblegum','#7a2a56'],['Ocean','#0a2440'],['Forest','#0e2a1a'],['Chocolate','#3a2214']];
const SIGNS=['✦ FANTASY VENDING ✦','✦ DESIRE DISPENSER ✦','☕ COFFEEBREAK WISHES ☕','💖 MANIFEST-O-MATIC 💖','✨ DREAM DROPS ✨','🦇 MIDNIGHT TREATS 🦇'];
const GLASS=[['Clear','rgba(120,200,255,.08)'],['Rose tint','rgba(255,120,180,.12)'],['Gold tint','rgba(255,210,74,.10)'],['Smoky','rgba(0,0,0,.25)']];
if(!S.skin)S.skin={n:0,b:0,s:0,g:0};
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
function upd(){const u=Object.keys(S.col).length;G.level=u;G.score=u*10+S.vended}
function pickProd(force){if(force)return PROD.filter(p=>p.r===force)[Math.random()*PROD.filter(p=>p.r===force).length|0];let tw=0;RAR.forEach(r=>tw+=r.w);let q=Math.random()*tw,rk='common';for(const r of RAR){q-=r.w;if(q<=0){rk=r.k;break}}const L=PROD.filter(p=>p.r===rk);return L[Math.random()*L.length|0]}
const slots={};for(const r of ROWS)for(let cI=1;cI<=COLS;cI++)slots[r+cI]={p:pickProd(),rot:0};
const priceOf=p=>RAR[RI[p.r]].p;
let code='',msg='Insert coins, punch a code!',msgT=0,card=null,anim=null,shake=0,shakes=0,stuck=null,floats=[],rain=[],spin=null,book={tab:0,page:0},wishMode=false;
const say=(m,s)=>{msg=m;msgT=s||3};
// ---- audio ----
let AC=null;const ac=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC};
function tone(f,d,v,tp,f2){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v||.08,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d+.02)}
function noise(d,v,fq){const a=ac();if(!a)return;const b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),dd=b.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=(Math.random()*2-1)*Math.pow(1-i/dd.length,2);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=fq||600;const g=a.createGain();g.gain.value=v||.4;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
const beep=()=>tone(1200,.06,.05,'square');const clink=()=>{tone(2400,.12,.05);setTimeout(()=>tone(3200,.1,.04),60)};
const clunk=()=>{tone(140,.25,.25,'sine',50);noise(.25,.5,500)};const whirr=()=>{tone(90,1.1,.06,'sawtooth',110)};
const fanfare=()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.25,.07,'triangle'),i*110));
// ---- actions ----
function key(k){if(anim||card||stuck)return;beep();if(k==='CLR'){code='';return}if(k==='OK'){vend();return}if(ROWS.includes(k)){code=k;return}if(code.length===1)code+=k;else say('Pick a row letter first (A–D)')}
function vend(){const s=slots[code];if(!s){say('Type a code like B3, then OK');return}const pr=priceOf(s.p);
 if(S.coins<pr){say('Not enough coins! '+(DEMO?'The demo has 10 coins.':'Tap the coin jar or spin the daily wheel.'));if(DEMO&&S.coins<1)demoOver();return}
 S.coins-=pr;S.vended++;save();clink();setTimeout(whirr,150);
 const ev=Math.random();let kind='normal';if(ev<.12)kind='stuck';else if(ev<.18||S.dbl)kind='double';else if(ev<.21)kind='jackpot';S.dbl=false;
 anim={code,s,t:0,kind,y:0,vy:0,phase:'turn',x0:slotXY(code).x,y0:slotXY(code).y};code='';}
function slotXY(cd){const r=ROWS.indexOf(cd[0]),cI=+cd[1]-1;return{x:92+cI*86,y:96+r*92}}
function shakeIt(){if(!stuck)return;shake=.35;shakes++;noise(.15,.3,300);if(shakes>=5){stuck=null;shakes=0;anim.phase='fall';anim.vy=0;say('THUNK! It dropped!')}}
function giveItem(p,glow,wish){const af=AFF[Math.random()*AFF.length|0];S.col[p.id]=(S.col[p.id]||0)+1;if(p.r==='gold'){S.golds++;fanfare()}save();upd();card={p,t:0,glow,isNew:S.col[p.id]===1,af}}
function land(a){clunk();const p=a.s.p;let extra=null;giveItem(p);if(a.kind==='double'){extra=pickProd();S.col[extra.id]=(S.col[extra.id]||0)+1;save();upd();card.extra=extra;say('DOUBLE DROP! Two treats fell!',3.5)}
 if(a.kind==='jackpot'){const j=DEMO?3:25;S.coins+=j;save();for(let i=0;i<40;i++)rain.push({x:60+Math.random()*500,y:-Math.random()*300,v:150+Math.random()*200});card.jack=j;fanfare();say('JACKPOT! +'+j+' coins!',3.5)}
 a.s.p=pickProd();anim=null}
function tapCoin(){if(DEMO){if(window.demoEnd)window.demoEnd('Earning coins by tapping is in the full game! The demo comes with 10 coins. The full version adds unlimited coin taps, the daily spin wheel and the collection book with every rarity tier.');return}S.coins++;S.taps++;if(S.taps%10===0){S.coins+=2;floats.push({x:760,y:470,t:0,s:'+2 combo!'})}floats.push({x:720+Math.random()*80,y:500,t:0,s:'+1'});clink();save()}
const today=()=>new Date().toISOString().slice(0,10);
const WHEEL=[['5 coins',5],['10 coins',10],['15 coins',15],['50 coins',50],['20 coins',20],['Golden capsule','gold'],['25 coins',25],['Double drop','dbl']];
function doSpin(){if(DEMO){if(window.demoEnd)window.demoEnd('The daily spin wheel is in the full game! Spin once a day for coins, double drops and even a golden capsule.');return}if(S.spinDay===today()&&!window.VM_FREESPIN){say('Come back tomorrow for another spin!');return}if(spin)return;S.spinDay=today();save();const i=Math.random()*WHEEL.length|0;spin={t:0,dur:3,target:i,a0:0,a1:Math.PI*2*5+(WHEEL.length-i-.5)*Math.PI*2/WHEEL.length};G.state='spin'}
function spinDone(){const w=WHEEL[spin.target];if(w[1]==='gold'){giveItem(pickProd('gold'),true)}else if(w[1]==='dbl'){S.dbl=true;say('Your next drop will be a DOUBLE DROP!',4)}else{S.coins+=w[1];say('+'+w[1]+' coins from the wheel!',3);clink()}save();spin=null;G.state='play'}
function demoOver(){if(window.demoEnd)window.demoEnd('Out of coins! You have tried the <b>Coffeebreak Fantasy Vending Machine</b> demo. The full game adds unlimited coin taps, a daily spin wheel, and a collection book of 35 treats across 5 rarity tiers, including ultra-rare golden items.')}
// wish input (DOM)
const wIn=document.createElement('input');wIn.maxLength=40;wIn.placeholder='Type your wish…';wIn.style.cssText='position:absolute;display:none;z-index:6;font:bold 18px Georgia;padding:8px 12px;border-radius:12px;border:2px solid #ffd24a;background:#2a0a1e;color:#ffe9a8;text-align:center';c.parentNode.style.position='relative';c.parentNode.appendChild(wIn);wIn.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')vendWish()});
function placeIn(show){if(!show){wIn.style.display='none';return}const r=c.getBoundingClientRect(),pr=c.parentNode.getBoundingClientRect(),sx=r.width/900,sy=r.height/600;wIn.style.display='block';wIn.style.left=(r.left-pr.left+250*sx)+'px';wIn.style.top=(r.top-pr.top+250*sy)+'px';wIn.style.width=(400*sx-28)+'px'}
function vendWish(){const w=wIn.value.trim();if(!w){say('Type a wish first ✨');return}if(S.coins<3){say('A wish costs 3 coins.');return}S.coins-=3;S.vended++;S.wishes.push({w,d:today()});save();wIn.value='';wishMode=false;placeIn(false);G.state='play';whirr();anim={code:'W',s:{p:{id:-1,n:w,e:'🥫',r:'wish',d:'Your wish, vended as a glowing can.'}},t:0,kind:'wish',y:0,vy:0,phase:'turn',x0:478,y0:466}}
// ---- input ----
bindInput({down(p){if(stuck&&p.x<560&&p.y<520)shakeIt()}});
addEventListener('keydown',e=>{if(G.state!=='play'||wishMode)return;const k=e.key.toUpperCase();if('ABCD12345'.includes(k)&&k.length===1)key(k);if(e.key==='Enter')key('OK');if(e.key==='Backspace'||e.key==='Escape')key('CLR')});
// ---- drawing ----
const GD='#ffd24a';let PK='#ff4f9a';const BODY=()=>BODIES[S.skin.b][1];
function neon(X,Y,w,h,r,col,lw){x.save();x.shadowColor=col;x.shadowBlur=18;x.strokeStyle=col;x.lineWidth=lw||3;rr(X,Y,w,h,r);x.stroke();x.restore()}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f||'bold ')+sz+'px Georgia';x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function bg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#1a0614');g.addColorStop(1,'#3a0f2c');x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,79,154,.06)';for(let i=0;i<14;i++)x.fillRect(i*70+(t*8%70),0,2,600)}
function capsule(p,X,Y,s,gl){const rc=p.r==='wish'?GD:RAR[RI[p.r]].c;if(p.r==='gold'||gl){x.save();x.shadowColor=GD;x.shadowBlur=20+Math.sin(t*5)*8;x.fillStyle='rgba(255,210,74,.35)';x.beginPath();x.arc(X,Y,26*s,0,7);x.fill();x.restore()}
 if(p.r==='wish'){x.save();x.shadowColor=GD;x.shadowBlur=25;const g=x.createLinearGradient(X-16*s,0,X+16*s,0);g.addColorStop(0,'#ffb02e');g.addColorStop(.5,'#fff2a8');g.addColorStop(1,'#ffb02e');x.fillStyle=g;rr(X-16*s,Y-26*s,32*s,52*s,6*s);x.fill();x.restore();x.fillStyle=PK;x.fillRect(X-16*s,Y-6*s,32*s,12*s);T('WISH',X,Y+4*s,9*s,'#fff','center');return}
 x.fillStyle=rc;x.beginPath();x.arc(X,Y,22*s,Math.PI,0);x.fill();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.arc(X,Y,22*s,0,Math.PI);x.fill();x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1.5;x.beginPath();x.arc(X,Y,22*s,0,7);x.stroke();emo(p.e,X,Y,22*s)}
function machine(){const sx=shake>0?Math.sin(t*80)*shake*18:0;x.save();x.translate(sx,0);
 x.fillStyle=BODY();rr(40,20,520,560,26);x.fill();neon(40,20,520,560,26,PK,4);neon(52,32,496,536,20,GD,1.5);
 x.fillStyle='#ffd24a';x.font='bold 22px Georgia';x.textAlign='center';x.save();x.shadowColor=PK;x.shadowBlur=14;x.fillText(SIGNS[S.skin.s],300,60);x.restore();
 x.fillStyle=GLASS[S.skin.g][1];rr(66,74,468,372,12);x.fill();x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=2;x.stroke();
 for(const r of ROWS)for(let cI=1;cI<=COLS;cI++){const cd=r+cI,s=slots[cd],P=slotXY(cd);
  // coil
  const turning=anim&&anim.code===cd&&anim.phase==='turn';const ra=turning?anim.t*Math.PI*2:0;x.strokeStyle='#c8c0d0';x.lineWidth=2;x.beginPath();for(let k=0;k<=40;k++){const a=k/40*Math.PI*6+ra,X=P.x-30+k*1.5,Y=P.y+20+Math.sin(a)*6;k?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();
  x.fillStyle='#4a1838';x.fillRect(P.x-36,P.y+30,72,6);
  if(!(anim&&anim.code===cd&&anim.phase!=='turn'))capsule(s.p,P.x+(turning?anim.t*14:0),P.y,1,false);
  x.fillStyle='#1a0614';rr(P.x-28,P.y+38,56,16,4);x.fill();T(cd+' · '+priceOf(s.p)+'¢',P.x,P.y+50,11,s.p.r==='gold'?GD:'#ffd6e8','center')}
 // tray
 x.fillStyle='#14040e';rr(90,462,300,80,12);x.fill();neon(90,462,300,80,12,PK,2);T('PUSH',240,560,12,'rgba(255,214,232,.6)','center');
 // wish slot
 x.fillStyle='#14040e';rr(420,462,116,80,12);x.fill();neon(420,462,116,80,12,GD,2);T('WISH SLOT',478,560,11,GD,'center');
 if(anim&&anim.phase==='fall'){const X=anim.code==='W'?478:anim.x0+14,Y=anim.code==='W'?anim.y0+anim.y*0.15:anim.y0+anim.y;if(Y<520||anim.code==='W')capsule(anim.s.p,X,Math.min(Y,505),1,anim.kind==='wish')}
 if(stuck){const P=slotXY(stuck);capsule(slots[stuck].p,P.x+16,P.y+6,1);T('STUCK!',P.x,P.y-28,16,'#ff6a6a','center')}
 x.restore()}
function side(){x.fillStyle='rgba(26,6,20,.85)';rr(580,20,300,560,20);x.fill();neon(580,20,300,560,20,GD,2);
 T('🪙 '+S.coins+' coins',730,58,24,GD,'center');
 x.fillStyle='#0a1a12';rr(610,74,240,44,8);x.fill();x.save();x.shadowColor='#5aff9a';x.shadowBlur=10;T(code?code+(code.length<2?'_':''):'--',730,106,28,'#7affb0','center');x.restore();
 const keys=['A','B','C','D','1','2','3','4','5','CLR','OK'];keys.forEach((k,i)=>{const X=610+(i%4)*62,Y=128+Math.floor(i/4)*48;button('k'+k,X,Y,k==='OK'?116:54,42,k,()=>key(k),{fs:k.length>1?14:20,bg:k==='OK'?PK:'#3a1028',fg:'#fff',ac:k==='OK'?'#fff':GD})});
 button('tap',610,282,240,58,DEMO?'🔒 Tap for coins':'🪙 Tap for coins (+1)',tapCoin,{fs:18,bg:'#5a3a08',fg:GD,ac:GD});
 button('spin',610,350,116,48,(DEMO?'🔒 ':'🎡 ')+'Daily spin',doSpin,{fs:13,bg:'#3a1028',fg:'#fff',ac:GD,dis:false});
 button('wish',734,350,116,48,'🥫 Wish (3¢)',()=>{if(anim||card)return;wishMode=true;G.state='wish'},{fs:13,bg:'#3a1028',fg:GD,ac:GD});
 button('book',610,406,116,48,(DEMO?'🔒 ':'📖 ')+'Book '+Object.keys(S.col).length+'/'+PROD.length,()=>{if(DEMO){if(window.demoEnd)window.demoEnd('The collection book is in the full game! Collect all 35 treats across Common, Rare, Epic, Legendary and ultra-rare Golden tiers, plus every wish you vend.');return}G.state='book'},{fs:13,bg:'#3a1028',fg:'#fff',ac:PK});
 button('cust',734,406,116,48,'🎨 Customise',()=>{if(anim||card)return;G.state='custom'},{fs:13,bg:'#3a1028',fg:'#fff',ac:PK});
 if(stuck)button('shake',610,462,240,52,'🫨 SHAKE IT! ('+shakes+'/5)',shakeIt,{fs:18,bg:'#e8304a',fg:'#fff',ac:'#fff'});
 else{x.fillStyle='#ffd6e8';x.font='13px Georgia';wrapT(msg,612,482,236,17)}
 T(S.vended+' vended · '+S.golds+' golden',730,566,12,'rgba(255,214,232,.6)','center')}
function drawCard(){const k=Math.min(1,card.t*3);x.fillStyle='rgba(10,2,8,'+(.6*k)+')';x.fillRect(0,0,900,600);x.save();x.translate(450,300);x.scale(.6+.4*k,.6+.4*k);
 const p=card.p,isW=p.r==='wish',rc=isW?GD:RAR[RI[p.r]].c;x.fillStyle='#2a0a20';rr(-220,-200,440,400,24);x.fill();neon(-220,-200,440,400,24,rc,4);
 if(p.r==='gold'||isW){for(let i=0;i<12;i++){const a=t*1.5+i*.52;emo('✨',Math.cos(a)*170,-60+Math.sin(a)*110,16)}}
 T(isW?'✨ WISH MANIFESTED ✨':(RAR[RI[p.r]].n.toUpperCase()+(card.isNew?' · NEW!':'')),0,-160,18,rc,'center');capsule(p,0,-70,2.4,isW);
 x.fillStyle='#fff';x.font='bold 22px Georgia';x.textAlign='center';wrapT(isW?'“'+p.n+'”':p.n,0,20,380,26);x.fillStyle='#ffd6e8';x.font='italic 15px Georgia';wrapT(p.d,0,isW?80:56,380,19);
 if(card.extra){T('+ bonus: '+card.extra.e+' '+card.extra.n,0,104,15,'#7fd8ff','center')}if(card.jack){T('🪙 JACKPOT +'+card.jack+' coins!',0,128,17,GD,'center')}if(card.af){x.fillStyle=GD;x.font='bold italic 15px Georgia';x.textAlign='center';wrapT('✨ '+card.af,0,card.jack?152:(card.extra?130:120),390,19)}x.restore();
 button('ok',375,440,150,48,isW?'💖 So be it':'✓ Collect',()=>{card=null;if(DEMO&&S.coins<1)setTimeout(demoOver,300)},{fs:18,bg:PK,fg:'#fff',ac:'#fff'})}
function drawBook(){bg();T('📖 Collection Book',450,48,30,GD,'center');const tabs=RAR.map(r=>r.n).concat(['Wishes']);tabs.forEach((n,i)=>button('tb'+i,60+i*132,64,124,36,n,()=>{book.tab=i},{sel:book.tab===i,fs:14,ac:i<5?RAR[i].c:GD}));
 const got=Object.keys(S.col).length;T(got+' / '+PROD.length+' treats found ('+Math.round(got/PROD.length*100)+'%)',450,124,15,'#ffd6e8','center','');
 if(book.tab<5){const L=PROD.filter(p=>p.r===RAR[book.tab].k);L.forEach((p,i)=>{const X=70+(i%4)*196,Y=140+Math.floor(i/4)*130,h=S.col[p.id];x.fillStyle='rgba(42,10,32,.9)';rr(X,Y,180,118,14);x.fill();neon(X,Y,180,118,14,h?RAR[book.tab].c:'#553344',h?2:1);
  if(h){capsule(p,X+90,Y+40,1.1);x.fillStyle='#fff';x.font='bold 13px Georgia';x.textAlign='center';wrapT(p.n,X+90,Y+84,168,15);T('×'+h,X+170,Y+18,12,GD,'right')}else{x.fillStyle='rgba(255,255,255,.08)';x.beginPath();x.arc(X+90,Y+40,24,0,7);x.fill();T('?',X+90,Y+48,24,'#886677','center');T('Not found yet',X+90,Y+96,12,'#886677','center','')}})}
 else{if(!S.wishes.length)T('No wishes vended yet. Try the 🥫 Wish slot!',450,200,16,'#ffd6e8','center','');S.wishes.slice(-12).reverse().forEach((w,i)=>{const X=70+(i%3)*262,Y=140+Math.floor(i/3)*100;x.fillStyle='rgba(42,10,32,.9)';rr(X,Y,246,88,14);x.fill();neon(X,Y,246,88,14,GD,1.5);capsule({r:'wish'},X+30,Y+44,.8);x.fillStyle='#ffe9a8';x.font='italic 14px Georgia';x.textAlign='left';wrapT('“'+w.w+'”',X+58,Y+34,178,17);T(w.d,X+58,Y+78,11,'#aa8899',null,'')})}
 button('back',375,536,150,46,'← Machine',()=>{G.state='play'},{fs:17})}
function drawSpin(){bg();T('🎡 Daily Spin',450,60,32,GD,'center');const k=Math.min(1,spin.t/spin.dur),e=1-Math.pow(1-k,3),a=spin.a0+(spin.a1-spin.a0)*e,n=WHEEL.length;
 x.save();x.translate(450,310);x.rotate(a);for(let i=0;i<n;i++){x.fillStyle=i%2?'#ff4f9a':'#3a1028';if(WHEEL[i][1]==='gold')x.fillStyle=GD;x.beginPath();x.moveTo(0,0);x.arc(0,0,200,i*2*Math.PI/n,(i+1)*2*Math.PI/n);x.fill();x.save();x.rotate((i+.5)*2*Math.PI/n);T(WHEEL[i][0],120,6,15,WHEEL[i][1]==='gold'?'#3a1028':'#fff','center');x.restore()}x.restore();neon(250,110,400,400,200,GD,4);
 x.fillStyle='#fff';x.beginPath();x.moveTo(650,310);x.lineTo(680,296);x.lineTo(680,324);x.fill()}
function drawCustom(){bg();T('🎨 Customise Your Machine',450,46,28,GD,'center');
 const row=(lbl,Y,arr,key,lab,col)=>{T(lbl,40,Y+28,16,'#ffd6e8','left');arr.forEach((a,i)=>{const lk=DEMO&&i>1;button('cu'+key+i,170+i*118,Y,110,42,(lk?'🔒 ':'')+lab(a),()=>{if(lk){if(window.demoEnd)window.demoEnd('Every neon colour, machine body, sign and glass tint is in the full game.');return}S.skin[key]=i;if(key==='n')PK=NEONS[i][1];save();beep()},{fs:12,sel:S.skin[key]===i,ac:col?col(a):PK})})};
 row('Neon lights',80,NEONS,'n',a=>a[0],a=>a[1]);row('Body colour',140,BODIES,'b',a=>a[0]);row('Glass tint',200,GLASS,'g',a=>a[0]);
 T('Sign',40,288,16,'#ffd6e8','left');SIGNS.forEach((sg,i)=>{const lk=DEMO&&i>1;button('cus'+i,170+(i%3)*236,262+Math.floor(i/3)*50,226,42,(lk?'🔒 ':'')+sg,()=>{if(lk){if(window.demoEnd)window.demoEnd('Every neon colour, machine body, sign and glass tint is in the full game.');return}S.skin.s=i;save();beep()},{fs:12,sel:S.skin.s===i})});
 x.save();x.translate(300,370);x.scale(.32,.32);x.translate(-40,-20);machine();x.restore();
 T('Preview',470,560,12,'rgba(255,214,232,.6)','center','');
 button('cdone',620,440,200,52,'✓ Done',()=>{G.state='play'},{fs:18,bg:PK,fg:'#fff',ac:'#fff'})}
function drawTitle(){bg();x.save();x.shadowColor=PK;x.shadowBlur=24;T('Coffeebreak',450,140,34,'#ffd6e8','center');T('Fantasy Vending Machine',450,200,50,GD,'center');x.restore();T('Punch a code. Hear the clunk. Collect the impossible.',450,244,18,'#ffd6e8','center','');
 for(let i=0;i<7;i++){const p=PROD[[0,13,20,26,30,14,33][i]];capsule(p,180+i*90,320+Math.sin(t*2+i)*8,1.1)}
 button('go',330,390,240,64,'🪙 Start vending',()=>{G.state='play';ac()},{fs:24,bg:PK,fg:'#fff',ac:'#fff'});
 T(DEMO?'Free demo: 10 coins to spend · collection book in the full game':'Tap for coins · daily spin · 35 treats · golden rarities · custom wishes · customise your machine',450,500,14,'#ffd6e8','center','');ent()}
function drawWish(){machine();side();x.fillStyle='rgba(10,2,8,.7)';x.fillRect(0,0,900,600);x.fillStyle='#2a0a20';rr(220,150,460,260,24);x.fill();neon(220,150,460,260,24,GD,3);T('🥫 The Custom-Desire Slot',450,196,24,GD,'center');T('Type any wish. It will be vended as a glowing can. (3 coins)',450,228,14,'#ffd6e8','center','');placeIn(true);
 button('vw',270,320,170,50,'✨ Vend my wish',vendWish,{fs:17,bg:PK,fg:'#fff',ac:'#fff'});button('cw',460,320,170,50,'Cancel',()=>{wishMode=false;placeIn(false);G.state='play'},{fs:17})}
function update(dt){if(msgT>0)msgT-=dt;if(shake>0)shake=Math.max(0,shake-dt);if(card)card.t+=dt;floats.forEach(f=>f.t+=dt);floats=floats.filter(f=>f.t<1);rain.forEach(r=>r.y+=r.v*dt);rain=rain.filter(r=>r.y<620);
 if(spin){spin.t+=dt;if(spin.t>=spin.dur+.6)spinDone()}
 if(anim){anim.t+=dt;if(anim.phase==='turn'&&anim.t>=1.1){if(anim.kind==='stuck'){stuck=anim.code;anim.phase='stuck';say('Oh no, it is STUCK! Shake the machine!',6)}else{anim.phase='fall';anim.vy=0}}
  if(anim&&anim.phase==='fall'){anim.vy+=1400*dt;anim.y+=anim.vy*dt;const floor=anim.code==='W'?260:505-anim.y0;if(anim.y>=floor){if(anim.kind==='wish'){clunk();giveWish(anim.s.p);anim=null}else land(anim)}}}
 if(G.state!=='wish')placeIn(false);upd()}
function giveWish(p){card={p,t:0,glow:true,af:'Said it, sealed it, vended it. It is already yours.'};fanfare()}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title'){drawTitle();return}if(G.state==='book'){drawBook();return}if(G.state==='spin'){drawSpin();return}if(G.state==='wish'){drawWish();return}if(G.state==='custom'){drawCustom();return}
 bg();machine();side();rain.forEach(r=>emo('🪙',r.x,r.y,20));floats.forEach(f=>T(f.s,f.x,f.y-f.t*40,18,GD,'center'));if(card)drawCard();x.textAlign='left'}
window.VM={G,S,slots,key,vend,shakeIt,tapCoin,doSpin,vendWish,wIn,PROD,get card(){return card},set card(v){card=v},get anim(){return anim},get stuck(){return stuck},save};
PK=NEONS[S.skin.n][1];upd();startLoop();
