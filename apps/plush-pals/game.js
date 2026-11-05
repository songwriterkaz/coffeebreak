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
// ===== Coffeebreak Plush Pals =====
const DEMO=!!window.DEMO,SK=DEMO?'plushDemo':'plushSave';
const G={state:'title',score:0,level:0};window.G=G;
const BASES=[
  ['Bear','🐻','#c48a5a',.95],['Bunny','🐰','#f2d9e8',.9],['Cat','🐱','#f0c27a',.92],
  ['Unicorn','🦄','#f6e8ff',1],['Dino','🦕','#8fd6a4',1.05],['Puppy','🐶','#d9b07c',.93],
  ['Fox','🦊','#e8894a',.9],['Panda','🐼','#f4f4f4',1],['Owl','🦉','#c9a06a',.88],['Pig','🐷','#f7b6c2',.9]
];
const NBASE=DEMO?3:BASES.length;
const FABRICS=[
  ['Blush Pink','#f4a7c0'],['Cotton Candy','#ffd1e8'],['Lavender','#c9b6f0'],['Sky','#a8d8f0'],
  ['Mint','#b8e8d0'],['Butter','#ffe9a8'],['Peach','#ffc9a8'],['Cream','#fff4e6'],
  ['Cocoa','#a07050'],['Charcoal','#5a5a68'],['Rose Red','#e85a7a'],['Lilac Mist','#e8d4f0']
];
const PATS=[['Solid',null],['Hearts','♥'],['Stars','★'],['Dots','•'],['Stripes','='],['Checks','▣'],['Sparkles','✦'],['Flowers','❀']];
const EYES=[['Round','●'],['Button','◉'],['Sparkle','✦'],['Sleepy','—'],['Heart','♥'],['Wink','◕']];
const NOSES=[['Triangle','▲'],['Oval','●'],['Heart','♥'],['Stitch','×']];
const STITCH=[['Pink','#e85a9a'],['White','#fff'],['Brown','#6b3e22'],['Gold','#e2b53c'],['Mint','#6fd6ab']];
const OUTFITS=[
  ['None',null],['Bow','🎀'],['Scarf','🧣'],['Hoodie','🧥'],['Tiara','👑'],['Hat','🎩'],
  ['Overalls','👖'],['Cape','🦸'],['Flower crown','🌼'],['Glasses','👓']
];
const ACCS=[['None',null],['Heart','💖'],['Star','⭐'],['Coffee','☕'],['Flower','🌸'],['Balloon','🎈'],['Cookie','🍪'],['Book','📖']];
const WISHES=['Always be kind','Hug me when sad','Dream big','Be brave','Stay soft','Love forever','Share smiles','Believe'];
const SEW_NOTES=['C','D','E','F','G','A','B'];
const SEW_FREQ=[261.6,293.7,329.6,349.2,392,440,493.9];

let pals=[];try{pals=JSON.parse(localStorage.getItem(SK)||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(pals));G.score=pals.length}catch(e){toast('Storage full')}};
G.score=pals.length;
let msg='',msgT=0;function toast(m){msg=m;msgT=2.4}
function lock(m){window.demoEnd&&window.demoEnd(m||'The full game has every animal base, the claw machine, more outfits and all 38 Coffeebreak songs.')}

// ---- draft plush being built ----
function fresh(){return{base:0,fab:0,pat:1,eye:0,nose:0,stuff:.55,stitch:0,outfit:0,acc:0,wish:0,name:'',id:Date.now()+Math.random()}}
let draft=fresh(),sel=-1,careAct='cuddle',careT=0,squish=0,heartPop=0;
let sew={notes:[],i:0,score:0,combo:0,t:0,hit:0,miss:0,run:false,flash:0};
let claw={x:450,tx:450,y:80,drop:0,grab:-1,prizes:[],won:null,pulling:0,tickets:0};
try{claw.tickets=+localStorage.getItem(SK+'Tix')||0}catch(e){}
const saveTix=()=>{try{localStorage.setItem(SK+'Tix',String(claw.tickets))}catch(e){}};

// ---- sound ----
let AC=null;
function beep(f,d,ty,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.1,n);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(AC.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
function click(){beep(880,.04,'triangle',.07)}
function soft(){beep(320,.12,'sine',.08);beep(480,.18,'sine',.05)}
function ding(){beep(660,.12,'sine',.1);beep(990,.22,'triangle',.08)}
function sewHit(){beep(520,.06,'square',.06);beep(780,.1,'sine',.08)}
function sewMiss(){beep(140,.15,'sawtooth',.06)}

// ---- draw a plush ----
function bodyCol(p){return FABRICS[p.fab][1]}
function drawPlush(p,cx,cy,sc,opt={}){
  const B=BASES[Math.min(p.base,BASES.length-1)];
  const stuff=Math.max(.25,Math.min(1.15,(p.stuff||.55)+(opt.squish||0)));
  const w=72*sc*stuff,h=86*sc*(2-stuff*.35);
  const col=bodyCol(p),st=STITCH[p.stitch][1];
  x.save();x.translate(cx,cy);
  if(opt.sway)x.rotate(Math.sin(t*2.2+p.id)*.04);
  // shadow
  x.fillStyle='rgba(90,40,70,.18)';x.beginPath();x.ellipse(0,h*.52,w*.55,10*sc,0,0,7);x.fill();
  // ears / horns / snout extras by base
  const bi=p.base;
  if(bi===0||bi===7){ // bear / panda ears
    x.fillStyle=col;x.beginPath();x.arc(-w*.42,-h*.42,16*sc,0,7);x.arc(w*.42,-h*.42,16*sc,0,7);x.fill();
    x.fillStyle=bi===7?'#222':'#e8a090';x.beginPath();x.arc(-w*.42,-h*.42,8*sc,0,7);x.arc(w*.42,-h*.42,8*sc,0,7);x.fill();
  }else if(bi===1){ // bunny long ears
    x.fillStyle=col;rr(-w*.38,-h*.95,18*sc,48*sc,9*sc);x.fill();rr(w*.2,-h*.95,18*sc,48*sc,9*sc);x.fill();
    x.fillStyle='#ffc0d4';rr(-w*.34,-h*.88,10*sc,36*sc,6*sc);x.fill();rr(w*.24,-h*.88,10*sc,36*sc,6*sc);x.fill();
  }else if(bi===2||bi===5||bi===6){ // cat / puppy / fox pointed
    x.fillStyle=col;x.beginPath();x.moveTo(-w*.55,-h*.2);x.lineTo(-w*.25,-h*.62);x.lineTo(-w*.05,-h*.18);x.fill();
    x.beginPath();x.moveTo(w*.55,-h*.2);x.lineTo(w*.25,-h*.62);x.lineTo(w*.05,-h*.18);x.fill();
    if(bi===2){x.fillStyle='#ffb0c8';x.beginPath();x.moveTo(-w*.45,-h*.22);x.lineTo(-w*.28,-h*.5);x.lineTo(-w*.14,-h*.2);x.fill();x.beginPath();x.moveTo(w*.45,-h*.22);x.lineTo(w*.28,-h*.5);x.lineTo(w*.14,-h*.2);x.fill()}
  }else if(bi===3){ // unicorn horn + ears
    x.fillStyle='#ffe9a0';x.beginPath();x.moveTo(0,-h*.95);x.lineTo(-7*sc,-h*.45);x.lineTo(7*sc,-h*.45);x.fill();
    x.strokeStyle='#e2b53c';x.lineWidth=1.5;x.beginPath();x.moveTo(0,-h*.9);x.lineTo(0,-h*.5);x.stroke();
    x.fillStyle=col;x.beginPath();x.arc(-w*.4,-h*.35,12*sc,0,7);x.arc(w*.4,-h*.35,12*sc,0,7);x.fill();
  }else if(bi===4){ // dino crest
    x.fillStyle='#6fc98a';for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(i*12*sc,-h*.55);x.lineTo(i*12*sc-8*sc,-h*.2);x.lineTo(i*12*sc+8*sc,-h*.2);x.fill()}
  }else if(bi===8){ // owl tufts
    x.fillStyle=col;x.beginPath();x.moveTo(-w*.4,-h*.35);x.lineTo(-w*.55,-h*.7);x.lineTo(-w*.15,-h*.4);x.fill();
    x.beginPath();x.moveTo(w*.4,-h*.35);x.lineTo(w*.55,-h*.7);x.lineTo(w*.15,-h*.4);x.fill();
  }else if(bi===9){ // pig ears
    x.fillStyle='#f090a8';x.beginPath();x.ellipse(-w*.42,-h*.4,12*sc,16*sc, -.4,0,7);x.fill();x.beginPath();x.ellipse(w*.42,-h*.4,12*sc,16*sc,.4,0,7);x.fill();
  }
  // body
  const g=x.createRadialGradient(-w*.2,-h*.2,4,0,0,w);g.addColorStop(0,shade(col,1.15));g.addColorStop(1,shade(col,.85));
  x.fillStyle=g;x.beginPath();x.ellipse(0,0,w*.55,h*.52,0,0,7);x.fill();
  // head
  x.beginPath();x.ellipse(0,-h*.28,w*.48,h*.38,0,0,7);x.fill();
  // belly patch
  x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(0,h*.08,w*.28,h*.22,0,0,7);x.fill();
  // pattern overlay
  const pat=PATS[p.pat];
  if(pat[1]){x.fillStyle='rgba(255,255,255,.55)';x.font=(11*sc)+'px serif';x.textAlign='center';
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){if((i+j)%2===0||pat[0]==='Dots'||pat[0]==='Hearts')x.fillText(pat[1],i*16*sc,j*14*sc-h*.1)}}
  // stitching
  x.strokeStyle=st;x.lineWidth=Math.max(1,1.5*sc);x.setLineDash([3*sc,3*sc]);
  x.beginPath();x.ellipse(0,-h*.28,w*.48,h*.38,0,0,7);x.stroke();
  x.beginPath();x.ellipse(0,0,w*.55,h*.52,0,0,7);x.stroke();x.setLineDash([]);
  // arms
  x.fillStyle=col;x.beginPath();x.ellipse(-w*.55,h*.05,14*sc,22*sc,.5,0,7);x.fill();
  x.beginPath();x.ellipse(w*.55,h*.05,14*sc,22*sc,-.5,0,7);x.fill();
  // feet
  x.beginPath();x.ellipse(-w*.28,h*.48,18*sc,12*sc,0,0,7);x.fill();
  x.beginPath();x.ellipse(w*.28,h*.48,18*sc,12*sc,0,0,7);x.fill();
  // face
  const ey=EYES[p.eye][1],ns=NOSES[p.nose][1];
  x.fillStyle='#2a1a20';x.font='bold '+(16*sc)+'px serif';x.textAlign='center';x.textBaseline='middle';
  if(bi===7){ // panda eye patches
    x.fillStyle='#222';x.beginPath();x.ellipse(-14*sc,-h*.32,12*sc,10*sc,0,0,7);x.ellipse(14*sc,-h*.32,12*sc,10*sc,0,0,7);x.fill();
    x.fillStyle='#fff';x.font='bold '+(14*sc)+'px serif';
  }
  x.fillStyle=bi===7?'#fff':'#2a1a20';
  x.fillText(ey,-14*sc,-h*.32);x.fillText(p.eye===5?'●':ey,14*sc,-h*.32);
  x.fillStyle='#e85a7a';x.font='bold '+(12*sc)+'px serif';x.fillText(ns,0,-h*.2);
  // blush
  x.fillStyle='rgba(255,140,170,.45)';x.beginPath();x.ellipse(-22*sc,-h*.18,8*sc,5*sc,0,0,7);x.ellipse(22*sc,-h*.18,8*sc,5*sc,0,0,7);x.fill();
  // mouth
  x.strokeStyle='#2a1a20';x.lineWidth=1.5*sc;x.beginPath();x.arc(0,-h*.12,6*sc,.15,Math.PI-.15);x.stroke();
  // outfit
  const out=OUTFITS[p.outfit];
  if(out[1]){x.font=(22*sc)+'px serif';x.fillText(out[1],0,-h*.55)}
  // accessory
  const ac=ACCS[p.acc];
  if(ac[1]){x.font=(18*sc)+'px serif';x.fillText(ac[1],w*.55,h*.15)}
  // heart wish flash
  if(opt.heart){x.globalAlpha=.7+.3*Math.sin(t*8);x.font=(28*sc)+'px serif';x.fillText('💖',0,0);x.globalAlpha=1}
  x.textBaseline='alphabetic';x.restore();
}
function shade(hex,m){const n=parseInt(hex.slice(1),16);let r=(n>>16)&255,g=(n>>8)&255,b=n&255;r=Math.min(255,r*m)|0;g=Math.min(255,g*m)|0;b=Math.min(255,b*m)|0;return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}

// ---- birth certificate ----
function printCert(p){
  const B=BASES[p.base],name=p.name||'Little Pal';
  const html=`<!DOCTYPE html><html><head><title>Birth Certificate — ${name}</title>
<style>body{font-family:Georgia,serif;background:#fff4f8;color:#5a2a44;margin:0;padding:24px}
.card{max-width:640px;margin:0 auto;background:#fff;border:3px double #e8a0b0;border-radius:18px;padding:28px 36px;box-shadow:0 8px 24px rgba(180,80,120,.15)}
h1{color:#d0408a;text-align:center;margin:0 0 4px;font-size:28px}h2{text-align:center;color:#e8a0b0;font-weight:normal;margin:0 0 20px;font-size:16px}
.row{display:flex;justify-content:space-between;margin:10px 0;border-bottom:1px dashed #f0c0d0;padding-bottom:8px}
.wish{background:#fff0f5;border-radius:12px;padding:14px;margin-top:16px;text-align:center;font-style:italic}
.foot{text-align:center;margin-top:22px;font-size:12px;color:#a07088}
.seal{text-align:center;font-size:42px;margin:8px}</style></head><body>
<div class="card"><div class="seal">🧸☕</div>
<h1>Official Plush Birth Certificate</h1><h2>Coffeebreak Plush Pals</h2>
<div class="row"><span>Name</span><b>${esc(name)}</b></div>
<div class="row"><span>Species</span><b>${B[0]} ${B[1]}</b></div>
<div class="row"><span>Fabric</span><b>${FABRICS[p.fab][0]} · ${PATS[p.pat][0]}</b></div>
<div class="row"><span>Eyes / Nose</span><b>${EYES[p.eye][0]} / ${NOSES[p.nose][0]}</b></div>
<div class="row"><span>Stuffing</span><b>${Math.round(p.stuff*100)}% snuggly</b></div>
<div class="row"><span>Born</span><b>${new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})}</b></div>
<div class="wish">💖 Heart wish: “${esc(WISHES[p.wish])}”</div>
<div class="foot">Made with love in Coffeebreak Plush Pals · For keeps · Print &amp; keep forever</div>
</div><script>setTimeout(()=>print(),400)</script></body></html>`;
  const fr=document.createElement('iframe');fr.style.cssText='position:fixed;width:0;height:0;border:0';document.body.appendChild(fr);
  fr.contentDocument.open();fr.contentDocument.write(html);fr.contentDocument.close();
  setTimeout(()=>fr.remove(),60000);toast('Opening birth certificate…');
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

// ---- sewing mini-game ----
function startSew(){
  sew={notes:[],i:0,score:0,combo:0,t:0,hit:0,miss:0,run:true,flash:0};
  for(let i=0;i<24;i++)sew.notes.push({n:Math.random()*7|0,x:920+i*70,hit:0});
  G.state='sew';G.level=1;saySew('Sew on the beat!');
}
function saySew(s){msg=s;msgT=1.6}
function sewTap(lane){
  if(!sew.run)return;
  const target=sew.notes.find(n=>!n.hit&&n.n===lane&&Math.abs(n.x-140)<48);
  if(target){const d=Math.abs(target.x-140);target.hit=d<18?2:1;sew.hit++;sew.combo++;sew.score+=d<18?100:50;sew.score+=Math.min(5,sew.combo)*5;sew.flash=.15;sewHit();beep(SEW_FREQ[lane],.1,'triangle',.1);if(target.hit===2)toast('Perfect stitch!')}
  else{sew.miss++;sew.combo=0;sewMiss()}
}
function endSew(){
  sew.run=false;const stars=sew.score>1800?3:sew.score>1000?2:sew.score>400?1:0;
  claw.tickets+=5+stars*3;saveTix();G.score=pals.length;
  if(stars>=2){const p=fresh();p.base=Math.random()*NBASE|0;p.fab=Math.random()*FABRICS.length|0;p.pat=Math.random()*PATS.length|0;p.name='Sewn Pal';pals.unshift(p);save();toast('You sewed a new plush! +'+(5+stars*3)+' tickets')}
  else toast('Nice sewing! +'+(5+stars*3)+' tickets');
  G.state='shelf';
}

// ---- claw machine ----
function startClaw(){
  if(DEMO)return lock('The claw machine is in the full game. Win mystery plush pals and spend tickets!');
  claw.x=450;claw.tx=450;claw.y=80;claw.drop=0;claw.grab=-1;claw.won=null;claw.pulling=0;
  claw.prizes=[];
  for(let i=0;i<8;i++){
    const p=fresh();p.base=Math.random()*BASES.length|0;p.fab=Math.random()*FABRICS.length|0;p.pat=1+Math.random()*4|0;
    p.outfit=Math.random()*OUTFITS.length|0;p.x=220+i*70+(Math.random()*20);p.y=420+Math.random()*40;p.vx=(Math.random()-.5)*20;
    claw.prizes.push(p);
  }
  G.state='claw';
}
function dropClaw(){
  if(claw.drop||claw.pulling||claw.won)return;
  if(claw.tickets<5){toast('Need 5 tickets (sew to earn!)');return}
  claw.tickets-=5;saveTix();claw.drop=1;soft();
}

// ---- care ----
function doCare(act){
  if(sel<0||!pals[sel])return;
  careAct=act;careT=1.6;squish=0;heartPop=0;
  if(act==='cuddle'){squish=.25;heartPop=1;soft();toast('Squeeeze! '+ (pals[sel].name||'Pal')+' feels loved')}
  else if(act==='tea'){ding();toast('Tea party! Sip sip ☕')}
  else if(act==='photo'){takePhoto();return}
  else if(act==='dress'){G.state='dress';return}
  else if(act==='wish'){heartPop=1;soft();toast('💖 '+WISHES[pals[sel].wish])}
}
function takePhoto(){
  const p=pals[sel];if(!p)return;
  const cv=document.createElement('canvas');cv.width=640;cv.height=640;const ox=x;x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,640);g.addColorStop(0,'#ffe4f0');g.addColorStop(1,'#e8d4f8');x.fillStyle=g;x.fillRect(0,0,640,640);
  // polaroid frame
  x.fillStyle='#fff';rr(40,30,560,540,12);x.fill();
  drawPlush(p,320,300,2.4,{sway:false});
  x.fillStyle='#d0408a';x.font='bold 28px Georgia';x.textAlign='center';x.fillText(p.name||'My Plush Pal',320,530);
  x.fillStyle='#a07088';x.font='16px Georgia';x.fillText('Coffeebreak Plush Pals · '+new Date().toLocaleDateString('en-AU'),320,560);
  x=ox;
  const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=(p.name||'plush-pal')+'.png';document.body.appendChild(a);a.click();a.remove();
  toast('Photo saved!');ding();
}

// ---- workshop helpers ----
function cycle(arr,i,dir){return(i+(dir||1)+arr.length)%arr.length}
function finishDraft(){
  if(!draft.name.trim()){toast('Give your plush a name first');return}
  if(DEMO&&pals.length>=3)return lock('The demo shelf holds 3 pals. The full game has every animal, the claw machine, unlimited saves and all 38 songs.');
  pals.unshift(Object.assign({},draft,{id:Date.now()}));save();sel=0;ding();
  G.state='certificate';toast(draft.name+' is born!');
}
function namePrompt(){
  const n=prompt('Name your plush pal:',draft.name||BASES[draft.base][0]+'ie');
  if(n!==null){draft.name=n.slice(0,20);click()}
}

// ---- input ----
bindInput({
  down(p){
    if(G.state==='claw'&&p.y>60&&p.y<520){claw.tx=Math.max(180,Math.min(780,p.x));if(!claw.drop&&!claw.pulling)claw.x=claw.tx}
    if(G.state==='sew'&&sew.run){
      const lane=Math.floor((p.y-140)/55);if(lane>=0&&lane<7)sewTap(lane);
    }
    if(G.state==='care'&&sel>=0&&Math.hypot(p.x-W/2,p.y-280)<100){squish=.3;soft()}
    if(G.state==='workshop'&&p.x>200&&p.x<500&&p.y>120&&p.y<480){squish=.2;soft()}
  },
  move(p){if(G.state==='claw'&&!claw.drop&&!claw.pulling){claw.tx=Math.max(180,Math.min(780,p.x));claw.x=claw.tx}},
  up(){}
});
addEventListener('keydown',e=>{
  if(G.state==='sew'&&sew.run){const k='asdfghj'.indexOf(e.key.toLowerCase());if(k>=0){e.preventDefault();sewTap(k)}}
  if(G.state==='claw'&&(e.key===' '||e.key==='Enter')){e.preventDefault();dropClaw()}
});

// ---- update ----
function update(dt){
  if(msgT>0)msgT-=dt;
  if(squish>0)squish=Math.max(0,squish-dt*.8);
  if(heartPop>0)heartPop=Math.max(0,heartPop-dt);
  if(careT>0)careT-=dt;
  if(G.state==='sew'&&sew.run){
    sew.t+=dt;sew.flash=Math.max(0,sew.flash-dt);
    sew.notes.forEach(n=>{if(!n.hit)n.x-=220*dt});
    sew.notes.forEach(n=>{if(!n.hit&&n.x<70){n.hit=-1;sew.miss++;sew.combo=0}});
    if(sew.notes.every(n=>n.hit))endSew();
  }
  if(G.state==='claw'){
    claw.prizes.forEach(p=>{p.x+=p.vx*dt;if(p.x<200||p.x>780)p.vx*=-1;p.x=Math.max(200,Math.min(780,p.x))});
    if(claw.drop===1){claw.y+=180*dt;if(claw.y>400){claw.drop=2;
      // grab nearest
      let best=-1,bd=40;claw.prizes.forEach((p,i)=>{const d=Math.hypot(p.x-claw.x,p.y-claw.y);if(d<bd){bd=d;best=i}});
      claw.grab=best;if(best>=0&&Math.random()<.72){claw.pulling=1}else{claw.grab=-1;claw.pulling=2;toast('Almost! Try again');sewMiss()}
    }}
    if(claw.pulling===1){claw.y-=160*dt;const p=claw.prizes[claw.grab];if(p){p.x=claw.x;p.y=claw.y+40}
      if(claw.y<=80){const won=claw.prizes.splice(claw.grab,1)[0];won.name=won.name||BASES[won.base][0]+' Prize';pals.unshift(won);save();claw.won=won;claw.pulling=0;claw.drop=0;claw.grab=-1;ding();toast('You won a '+BASES[won.base][0]+'!')}
    }
    if(claw.pulling===2){claw.y-=200*dt;if(claw.y<=80){claw.pulling=0;claw.drop=0}}
  }
}

// ---- UI helpers ----
const PINK={bg:'#fff',fg:'#6a2a4a',ac:'#d0408a'};
function B(id,X,Y,w,h,l,fn,o){button(id,X,Y,w,h,l,fn,Object.assign({},PINK,o||{}))}
function bg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ffe4f0');g.addColorStop(.55,'#f8d4ec');g.addColorStop(1,'#e8d0f4');x.fillStyle=g;x.fillRect(0,0,W,H);
  // soft dots
  x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<40;i++){const px=(i*97+40)%W,py=(i*53+t*12)%H;x.beginPath();x.arc(px,py,2+(i%3),0,7);x.fill()}}
function topBar(title){x.fillStyle='rgba(255,255,255,.65)';x.fillRect(0,0,W,48);T(title,16,32,22,'#7a2a5a')}
function toastDraw(){if(msgT<=0)return;x.globalAlpha=Math.min(1,msgT);const w=Math.min(700,x.measureText?0:0);x.font='15px Georgia';const tw=x.measureText(msg).width+28;x.fillStyle='rgba(80,30,60,.9)';rr(W/2-tw/2,552,tw,34,17);x.fill();T(msg,W/2,574,15,'#fff','center','');x.globalAlpha=1}
function chip(label,X,Y,w,sel,fn,id){B(id,X,Y,w,32,label,fn,{sel,fs:13})}

// ---- draw screens ----
function draw(){
  bg();const st=G.state;
  if(st==='title'){
    // floating pals
    for(let i=0;i<Math.min(6,NBASE);i++){const p={base:i,fab:i%FABRICS.length,pat:1+(i%4),eye:i%3,nose:i%3,stuff:.5+i*.05,stitch:0,outfit:0,acc:0,wish:0,id:i};
      drawPlush(p,90+i*140,120+Math.sin(t*1.5+i)*10,.7,{sway:true})}
    x.fillStyle='rgba(255,255,255,.88)';rr(160,200,580,280,26);x.fill();
    T('🧸 Coffeebreak Plush Pals',W/2,255,40,'#d0408a','center');
    T('Build, name, cuddle and collect your softest friends.',W/2,295,17,'#6a2a4a','center','');
    T(pals.length? (pals.length+' pal'+(pals.length>1?'s':'')+' on your shelf') : 'Your shelf is waiting…',W/2,325,14,'#a07088','center','');
    B('go',270,350,170,52,'✂️ Build one',()=>{draft=fresh();G.state='workshop';click()},{fs:20});
    B('sh',460,350,170,52,'🏠 My shelf',()=>{G.state='shelf';click()},{fs:20});
    B('sw',270,415,170,44,'🧵 Sew game',()=>startSew(),{fs:16});
    B('cl',460,415,170,44,'🕹️ Claw'+(DEMO?' 🔒':''),()=>startClaw(),{fs:16});
    if(hero.complete&&hero.naturalWidth)x.drawImage(hero,30,470,100,100*hero.naturalHeight/hero.naturalWidth);
    ent();toastDraw();return;
  }

  if(st==='workshop'){
    topBar('✂️ Build-a-Plush Studio');B('home',780,8,100,34,'🏠 Home',()=>G.state='title',{fs:14});
    // preview
    x.fillStyle='rgba(255,255,255,.55)';rr(40,60,420,480,20);x.fill();
    drawPlush(draft,250,280,2.1,{squish:-squish*.4,heart:heartPop>0,sway:true});
    T(draft.name||'Name me!',250,500,18,'#7a2a5a','center');
    T(BASES[draft.base][0]+' · '+Math.round(draft.stuff*100)+'% stuffed',250,525,13,'#a07088','center','');
    // panels
    const PX=480;T('Animal base',PX,72,14,'#7a2a5a');
    for(let i=0;i<BASES.length;i++){const lk=i>=NBASE,X=PX+(i%5)*78,Y=82+(i/5|0)*40;
      if(lk){x.globalAlpha=.35;B('b'+i,X,Y,72,34,BASES[i][1]+'🔒',()=>lock('More animal bases are in the full game!'),{fs:14,sel:false});x.globalAlpha=1}
      else B('b'+i,X,Y,72,34,BASES[i][1]+' '+BASES[i][0].slice(0,4),()=>{draft.base=i;click()},{sel:draft.base===i,fs:12})}
    T('Fabric colour',PX,172,14,'#7a2a5a');
    FABRICS.forEach((f,i)=>{const X=PX+(i%6)*66,Y=184+(i/6|0)*36;x.fillStyle=f[1];rr(X,Y,60,30,8);x.fill();
      if(draft.fab===i){x.strokeStyle='#d0408a';x.lineWidth=3;rr(X,Y,60,30,8);x.stroke()}
      BTN['f'+i]={x:X,y:Y,w:60,h:30,fn:()=>{draft.fab=i;click()}}});
    T('Pattern',PX,268,14,'#7a2a5a');
    PATS.forEach((p,i)=>chip(p[0],PX+(i%4)*100,280,94,draft.pat===i,()=>{draft.pat=i;click()},'p'+i));
    T('Eyes',PX,328,14,'#7a2a5a');
    EYES.forEach((e,i)=>chip(e[1]+' '+e[0],PX+(i%3)*132,340,126,draft.eye===i,()=>{draft.eye=i;click()},'e'+i));
    T('Nose',PX,388,14,'#7a2a5a');
    NOSES.forEach((n,i)=>chip(n[1]+' '+n[0],PX+(i%4)*100,400,94,draft.nose===i,()=>{draft.nose=i;click()},'n'+i));
    T('Stuffing  '+Math.round(draft.stuff*100)+'%',PX,448,14,'#7a2a5a');
    B('stu',PX,458,60,30,'−',()=>{draft.stuff=Math.max(.25,+(draft.stuff-.05).toFixed(2));squish=.15;soft()},{fs:16});
    B('st+',PX+70,458,60,30,'+',()=>{draft.stuff=Math.min(1.1,+(draft.stuff+.05).toFixed(2));squish=.15;soft()},{fs:16});
    T('← squishier    fluffier →',PX+145,478,12,'#a07088','left','');
    T('Stitch',PX,502,14,'#7a2a5a');
    STITCH.forEach((s,i)=>{const X=PX+i*66;x.fillStyle=s[1];rr(X,512,58,28,8);x.fill();x.strokeStyle=draft.stitch===i?'#d0408a':'#ccc';x.lineWidth=draft.stitch===i?3:1;rr(X,512,58,28,8);x.stroke();BTN['st'+i]={x:X,y:512,w:58,h:28,fn:()=>{draft.stitch=i;click()}}});
    // bottom actions
    B('nm',40,555,120,36,'✏️ Name',namePrompt,{fs:14});
    B('out',170,555,110,36,'👗 '+OUTFITS[draft.outfit][0],()=>{draft.outfit=cycle(OUTFITS,draft.outfit);click()},{fs:13});
    B('ac',290,555,100,36,'✨ '+ACCS[draft.acc][0],()=>{draft.acc=cycle(ACCS,draft.acc);click()},{fs:13});
    B('wi',400,555,160,36,'💖 '+WISHES[draft.wish].slice(0,12),()=>{draft.wish=cycle(WISHES,draft.wish);heartPop=1;soft()},{fs:12});
    B('born',570,555,140,36,'Born! 👶',finishDraft,{fs:16,bg:'#f6c6d2'});
    B('rst',720,555,80,36,'Reset',()=>{draft=fresh();click()},{fs:13});
    toastDraw();return;
  }

  if(st==='certificate'){
    topBar('📜 Birth Certificate');B('home',780,8,100,34,'🏠 Shelf',()=>G.state='shelf',{fs:14});
    const p=pals[0]||draft;
    x.fillStyle='rgba(255,255,255,.92)';rr(120,70,660,460,20);x.fill();
    x.strokeStyle='#e8a0b0';x.lineWidth=4;rr(120,70,660,460,20);x.stroke();
    T('☕ Official Plush Birth Certificate',W/2,110,26,'#d0408a','center');
    drawPlush(p,280,300,1.6,{heart:true});
    T(p.name||'Little Pal',560,180,28,'#7a2a5a','center');
    T(BASES[p.base][0]+' '+BASES[p.base][1],560,215,18,'#a07088','center','');
    T('Fabric: '+FABRICS[p.fab][0]+' · '+PATS[p.pat][0],560,255,15,'#6a2a4a','center','');
    T('Eyes: '+EYES[p.eye][0]+' · Nose: '+NOSES[p.nose][0],560,280,15,'#6a2a4a','center','');
    T('Stuffing: '+Math.round(p.stuff*100)+'% snuggly',560,305,15,'#6a2a4a','center','');
    T('💖 Wish: “'+WISHES[p.wish]+'”',560,350,16,'#d0408a','center','');
    T(new Date().toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'}),560,390,14,'#a07088','center','');
    B('prt',300,480,140,44,'🖨️ Print',()=>printCert(p),{fs:16});
    B('care',460,480,140,44,'💗 Care',()=>{sel=0;G.state='care'},{fs:16});
    toastDraw();return;
  }

  if(st==='shelf'){
    topBar('🏠 My Plush Shelf  ·  '+pals.length+' pal'+(pals.length!==1?'s':''));B('home',780,8,100,34,'🏠 Home',()=>G.state='title',{fs:14});
    B('new',660,8,110,34,'✂️ New',()=>{draft=fresh();G.state='workshop'},{fs:14});
    if(!pals.length){T('No pals yet — tap Build one!',W/2,300,20,'#7a2a5a','center');toastDraw();return}
    pals.slice(0,12).forEach((p,i)=>{
      const X=40+(i%4)*215,Y=70+(i/4|0)*170;
      x.fillStyle='rgba(255,255,255,.75)';rr(X,Y,200,155,14);x.fill();
      drawPlush(p,X+100,Y+70,1,{sway:true});
      T(p.name||'Pal',X+100,Y+130,14,'#7a2a5a','center');
      B('op'+i,X+10,Y+135,85,28,'💗 Play',()=>{sel=i;G.state='care';click()},{fs:12});
      B('de'+i,X+105,Y+135,85,28,'🗑️',()=>{if(confirm('Say goodbye to '+(p.name||'this pal')+'?')){pals.splice(i,1);save();soft()}},{fs:12});
    });
    T('Tickets: '+claw.tickets+(DEMO?'':'  ·  Sew or claw to earn more'),W/2,575,14,'#a07088','center','');
    toastDraw();return;
  }

  if(st==='care'){
    const p=pals[sel];if(!p){G.state='shelf';return}
    topBar('💗 Caring for '+(p.name||'Pal'));B('bk',780,8,100,34,'← Shelf',()=>G.state='shelf',{fs:14});
    x.fillStyle='rgba(255,255,255,.5)';rr(200,70,500,360,24);x.fill();
    // room decor
    T('☕',240,120,28,'#c48');T('🌸',640,110,24,'#c48');T('📚',660,380,22,'#c48');
    drawPlush(p,W/2,260,2.3,{squish:-squish*.5,heart:heartPop>0||careAct==='wish',sway:true});
    if(careAct==='tea'&&careT>0){T('☕',W/2+60,300,36,'#c48');T('🫖',W/2-80,280,32,'#c48')}
    if(careAct==='cuddle'&&careT>0){for(let i=0;i<5;i++)T('💕',W/2-80+i*40,160+Math.sin(t*6+i)*8,20,'#e8a')}
    const acts=[['cuddle','🤗 Cuddle'],['dress','👗 Dress up'],['tea','☕ Tea party'],['photo','📷 Photo'],['wish','💖 Wish']];
    acts.forEach(([k,l],i)=>B('ca'+i,80+i*155,460,145,44,l,()=>doCare(k),{fs:14,sel:careAct===k&&careT>0}));
    B('cert',300,520,140,40,'📜 Certificate',()=>printCert(p),{fs:14});
    B('ren',460,520,140,40,'✏️ Rename',()=>{const n=prompt('New name:',p.name||'');if(n!==null){p.name=n.slice(0,20);save();click()}},{fs:14});
    toastDraw();return;
  }

  if(st==='dress'){
    const p=pals[sel];if(!p){G.state='shelf';return}
    topBar('👗 Dress-up · '+(p.name||'Pal'));B('bk',780,8,100,34,'← Care',()=>G.state='care',{fs:14});
    drawPlush(p,220,300,2,{sway:true});
    T('Outfits',420,80,16,'#7a2a5a');
    OUTFITS.forEach((o,i)=>B('o'+i,420+(i%2)*200,100+(i/2|0)*42,190,36,(o[1]||'·')+' '+o[0],()=>{p.outfit=i;save();click()},{sel:p.outfit===i,fs:13}));
    T('Accessories',420,340,16,'#7a2a5a');
    ACCS.forEach((a,i)=>B('a'+i,420+(i%4)*110,360,100,36,(a[1]||'·')+' '+a[0],()=>{p.acc=i;save();click()},{sel:p.acc===i,fs:12}));
    toastDraw();return;
  }

  if(st==='sew'){
    topBar('🧵 Sewing Rhythm  ·  Score '+sew.score+'  ·  Combo x'+sew.combo);B('quit',780,8,100,34,'Quit',()=>{sew.run=false;G.state='title'},{fs:14});
    // machine
    x.fillStyle='rgba(255,255,255,.7)';rr(40,60,820,480,18);x.fill();
    // hit line
    x.strokeStyle='#d0408a';x.lineWidth=3;x.beginPath();x.moveTo(140,80);x.lineTo(140,520);x.stroke();
    T('SEW',140,70,12,'#d0408a','center','');
    const keys='ASDFGHJ';
    for(let lane=0;lane<7;lane++){
      const Y=140+lane*55;
      x.fillStyle=sew.flash&&sew.notes.some(n=>n.hit>0&&n.n===lane&&n.x>100&&n.x<180)?'rgba(208,64,138,.25)':'rgba(255,200,220,.35)';
      rr(60,Y,780,48,8);x.fill();
      T(keys[lane]+' · '+SEW_NOTES[lane],90,Y+30,14,'#7a2a5a','center');
      BTN['lane'+lane]={x:60,y:Y,w:780,h:48,fn:()=>sewTap(lane)};
    }
    sew.notes.forEach(n=>{
      if(n.hit===-1)return;
      const Y=140+n.n*55+24;
      if(n.hit>0){x.globalAlpha=.35}
      x.fillStyle=n.hit===2?'#6fd6ab':n.hit===1?'#f6c6d2':'#d0408a';
      x.beginPath();x.arc(n.x,Y,16,0,7);x.fill();
      x.fillStyle='#fff';x.font='bold 12px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText('🪡',n.x,Y);x.textBaseline='alphabetic';
      x.globalAlpha=1;
    });
    T('Tap a lane (or press A S D F G H J) when the needle hits the pink line',W/2,560,14,'#7a2a5a','center','');
    if(!sew.run){T('Finished! Score '+sew.score,W/2,300,28,'#d0408a','center');B('done',360,340,180,48,'🏠 Shelf',()=>G.state='shelf',{fs:18})}
    toastDraw();return;
  }

  if(st==='claw'){
    topBar('🕹️ Claw Machine  ·  '+claw.tickets+' tickets (5 per play)');B('home',780,8,100,34,'🏠 Home',()=>G.state='title',{fs:14});
    // cabinet
    x.fillStyle='#6ec3f0';rr(160,60,640,480,16);x.fill();
    x.fillStyle='rgba(255,255,255,.35)';rr(180,80,600,400,12);x.fill();
    // prizes
    claw.prizes.forEach(p=>drawPlush(p,p.x,p.y,.55,{sway:true}));
    // claw
    x.strokeStyle='#888';x.lineWidth=3;x.beginPath();x.moveTo(claw.x,80);x.lineTo(claw.x,claw.y);x.stroke();
    x.fillStyle='#ddd';x.beginPath();x.moveTo(claw.x-22,claw.y);x.lineTo(claw.x-8,claw.y+28);x.lineTo(claw.x+8,claw.y+28);x.lineTo(claw.x+22,claw.y);x.closePath();x.fill();
    x.strokeStyle='#aaa';x.stroke();
    T('Drag to move · Drop claw (or Space)',W/2,555,14,'#7a2a5a','center','');
    B('drop',360,500,180,44,claw.drop||claw.pulling?'…':'⬇️ Drop (5🎫)',dropClaw,{fs:16,dis:!!(claw.drop||claw.pulling)});
    if(claw.won){x.fillStyle='rgba(255,255,255,.92)';rr(250,180,400,200,20);x.fill();T('You won!',W/2,220,28,'#d0408a','center');drawPlush(claw.won,W/2,300,1.1);B('keep',320,350,120,40,'🏠 Shelf',()=>{claw.won=null;G.state='shelf'},{fs:14});B('again',480,350,120,40,'Again!',()=>{claw.won=null;startClaw()},{fs:14})}
    toastDraw();return;
  }
}

startLoop();
window.PLUSH={get pals(){return pals},get draft(){return draft},BASES,get NBASE(){return NBASE},DEMO,startSew,startClaw,printCert,fresh,setSel(i){sel=i},getSel(){return sel},go(st){G.state=st}};
