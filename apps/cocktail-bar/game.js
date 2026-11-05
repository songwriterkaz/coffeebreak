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
// ===== Coffeebreak Cocktail Bar =====
const DEMO=!!window.DEMO,SK=DEMO?'cocktailDemo':'cocktailSave';
let S={coins:0,served:0,mine:[],mock:false,best:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
// k:[name,unit,colour,category,alcoholic]
const ING={vodka:['Vodka','ml','#e8f4ff','Spirits',1],gin:['Gin','ml','#eaf6ff','Spirits',1],rum:['White rum','ml','#f4f8ff','Spirits',1],tequila:['Tequila','ml','#f6f0d0','Spirits',1],bourbon:['Bourbon','ml','#c06a20','Spirits',1],citron:['Citrus vodka','ml','#f4f8d8','Spirits',1],
 orangeliq:['Orange liqueur','ml','#ffe8c0','Liqueurs',1],coffeeliq:['Coffee liqueur','ml','#3a1a08','Liqueurs',1],redbitter:['Red bitter aperitif','ml','#d0102a','Liqueurs',1],orangeapero:['Orange aperitif','ml','#ff6a10','Liqueurs',1],sweetverm:['Sweet vermouth','ml','#7a1a10','Liqueurs',1],dryverm:['Dry vermouth','ml','#f0ecd0','Liqueurs',1],prosecco:['Prosecco','ml','#f6e8a0','Liqueurs',1],
 lime:['Lime juice','ml','#d8f0a0','Juices',0],lemon:['Lemon juice','ml','#fff2a0','Juices',0],cran:['Cranberry juice','ml','#c8103a','Juices',0],pine:['Pineapple juice','ml','#ffe060','Juices',0],orange:['Orange juice','ml','#ffa020','Juices',0],tomato:['Tomato juice','ml','#c82010','Juices',0],
 syrup:['Sugar syrup','ml','#fffaf0','Syrups',0],grenadine:['Grenadine','ml','#e0103a','Syrups',0],coconut:['Coconut cream','ml','#fffcf4','Syrups',0],espresso:['Espresso','ml','#2a1408','Syrups',0],bitters:['Aromatic bitters','dash','#6a1a10','Syrups',0],
 soda:['Soda water','ml','#f0faff','Mixers',0],tonic:['Tonic water','ml','#f0faff','Mixers',0],gbeer:['Ginger beer','ml','#f0d890','Mixers',0],gale:['Ginger ale','ml','#f0e0a0','Mixers',0],lemonade:['Lemonade','ml','#f8f8e0','Mixers',0],
 mint:['Mint leaves','leaves','#3ac060','Other',0],sugarcube:['Sugar cube','cube','#ffffff','Other',0],worc:['Worcestershire sauce','dash','#3a1a10','Other',0],hot:['Hot sauce','dash','#e02010','Other',0]};
const GLS={coupe:'Coupe',martini:'Martini glass',rocks:'Rocks glass',highball:'Highball',hurricane:'Hurricane',mug:'Copper mug',wine:'Wine glass',margarita:'Margarita glass'};
const GAR={lime:'🍋‍🟩 Lime wheel',lemon:'🍋 Lemon slice',orange:'🍊 Orange twist',mint:'🌿 Mint sprig',cherry:'🍒 Cherry',olive:'🫒 Olive',pineapple:'🍍 Pineapple wedge',beans:'☕ 3 coffee beans',celery:'🥬 Celery stick',salt:'🧂 Salt rim',umbrella:'⛱️ Umbrella',strawberry:'🍓 Strawberry'};
const METH={shake:'Shake with ice, strain',stir:'Stir with ice, strain',build:'Build over ice',blend:'Blend with ice',muddle:'Muddle, then build over ice'};
// [name, {ing:amt}, method, glass, garnish, note, mocktail?]
const REC=[
['Margarita',{tequila:50,orangeliq:20,lime:15},'shake','margarita','salt','Rim half the glass with salt first.'],
['Mojito',{rum:45,lime:20,syrup:15,mint:6,soda:60},'muddle','highball','mint','Gently press the mint with lime and syrup; top with soda.'],
['Cosmopolitan',{citron:40,orangeliq:15,lime:15,cran:30},'shake','martini','orange','Flame the orange twist if you are fancy.'],
['Old Fashioned',{bourbon:45,sugarcube:1,bitters:2},'stir','rocks','orange','Dissolve the cube with bitters and a splash of water, then stir over a big ice cube.'],
['Negroni',{gin:30,redbitter:30,sweetverm:30},'stir','rocks','orange','Equal parts, stirred over ice.'],
['Daiquiri',{rum:60,lime:20,syrup:10},'shake','coupe','lime','The classic: rum, lime, sugar.'],
['Espresso Martini',{vodka:50,coffeeliq:30,espresso:30,syrup:10},'shake','coupe','beans','Shake hard for a silky crema.'],
['Piña Colada',{rum:50,coconut:30,pine:50},'blend','hurricane','pineapple','Blend until smooth.'],
['Moscow Mule',{vodka:45,lime:10,gbeer:120},'build','mug','lime','Serve ice-cold in a copper mug.'],
['Spritz',{prosecco:90,orangeapero:60,soda:30},'build','wine','orange','Prosecco first, then aperitif, then a splash of soda.'],
['Whiskey Sour',{bourbon:45,lemon:25,syrup:20},'shake','rocks','cherry','Optional: add egg white and dry-shake first.'],
['Bloody Mary',{vodka:45,tomato:90,lemon:15,worc:2,hot:2},'build','highball','celery','Season with celery salt and black pepper.'],
['Tom Collins',{gin:45,lemon:30,syrup:15,soda:60},'build','highball','lemon','Top with soda and stir gently.'],
['Dry Martini',{gin:60,dryverm:10},'stir','martini','olive','Stir until very cold. Olive or lemon twist.'],
['Gin & Tonic',{gin:50,tonic:150},'build','highball','lime','Lots of ice, then gin, then tonic.'],
['Virgin Mojito',{lime:20,syrup:15,mint:6,soda:120},'muddle','highball','mint','All the freshness, no rum.',1],
['Shirley Temple',{gale:150,grenadine:15},'build','highball','cherry','Ginger ale and grenadine with a cherry on top.',1],
['Virgin Colada',{coconut:30,pine:90},'blend','hurricane','pineapple','Blend with ice until frothy.',1],
['Sunrise Mocktail',{orange:120,grenadine:15},'build','highball','orange','Pour grenadine last so it sinks into a sunrise.',1],
['Pink Lemonade Fizz',{lemonade:120,cran:30,lime:10},'build','highball','strawberry','Pretty in pink.',1],
['Ginger Lime Cooler',{gbeer:120,lime:20,syrup:10,mint:4},'muddle','mug','mint','Spicy, zingy, refreshing.',1]].map(r=>({n:r[0],ing:r[1],m:r[2],g:r[3],gar:r[4],note:r[5],mock:!!r[6]}));
const isMock=r=>r.mock||Object.keys(r.ing).every(k=>!ING[k][4]);
const avail=()=>{let L=REC.concat(S.mine.map(m=>Object.assign({mineR:1},m))).filter(r=>S.mock?isMock(r):!r.mock);if(DEMO)L=L.filter((r,i)=>i<5||r.mineR);return L};
let mx=null,cust=null,bk={i:0,page:0},cm=null,cat='Spirits',step=15,msg='',msgT=0,res=null;const say=(m,s)=>{msg=m;msgT=s||3};
const NAMES=['Kaz','Dakota','Mia','Leo','Ruby','Sam','Zoe','Ollie','Jess','Max','Ivy','Noah','Billie','Archie'],FACES=['👩','👨','👩‍🦰','🧔','👱‍♀️','👩‍🦱','🧑','👵','🧑‍🎤','👸'];
function newMix(){mx={ing:{},m:null,g:null,gar:null}}
function newCust(){const L=avail().filter(r=>!r.mineR||S.mine.length);const r=L[Math.random()*L.length|0];cust={name:NAMES[Math.random()*NAMES.length|0],face:FACES[Math.random()*FACES.length|0],r,pat:1};newMix();res=null}
function addIng(k){const u=ING[k][1];mx.ing[k]=(mx.ing[k]||0)+(u==='ml'?step:1);tone(500+Math.random()*200,.08,.04)}
function score(r,m){let pts=0,max=0;for(const k in r.ing){max+=10;const a=m.ing[k]||0,w=r.ing[k],tol=ING[k][1]==='ml'?Math.max(5,w*.12):0;const d=Math.abs(a-w);pts+=d<=tol?10:d<=tol*2+ (ING[k][1]==='ml'?10:1)?5:0}
 for(const k in m.ing)if(!(k in r.ing)){max+=5}
 max+=30;if(m.m===r.m)pts+=10;if(m.g===r.g)pts+=10;if(m.gar===r.gar)pts+=10;return Math.round(pts/max*100)}
function serve(){if(!mx.m||!mx.g){say('Pick a method and a glass first!');return}const sc=score(cust.r,mx);const tip=Math.round(sc/10)+(sc>=90?5:0);S.coins+=tip;S.served++;S.best=Math.max(S.best,sc);G.score+=sc;G.level=S.served;save();res={sc,tip};sc>=80?fan():tone(300,.3,.06);
 if(DEMO&&S.served>=3)setTimeout(()=>window.demoEnd&&window.demoEnd('You served 3 customers! The full game has all 21 classic cocktails and mocktails, endless customers, and unlimited saves in your own custom recipe book.'),2200)}
let AC=null;function tone(f,d,v){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function fan(){[659,784,988,1319].forEach((f,i)=>setTimeout(()=>tone(f,.18,.05),i*90))}
function mixCol(ing){let r=0,g=0,b=0,n=0;for(const k in ing){const c=ING[k][2],w=ING[k][1]==='ml'?ing[k]:3;r+=parseInt(c.slice(1,3),16)*w;g+=parseInt(c.slice(3,5),16)*w;b+=parseInt(c.slice(5,7),16)*w;n+=w}return n?'rgb('+(r/n|0)+','+(g/n|0)+','+(b/n|0)+')':'rgba(0,0,0,0)'}
function vol(ing){let v=0;for(const k in ing)v+=ING[k][1]==='ml'?ing[k]:2;return v}
function glassShape(g){x.beginPath();switch(g){case'coupe':x.moveTo(-50,-40);x.quadraticCurveTo(-48,10,0,12);x.quadraticCurveTo(48,10,50,-40);break;case'martini':case'margarita':x.moveTo(-55,-45);x.lineTo(0,g==='martini'?20:5);x.lineTo(55,-45);break;case'rocks':x.moveTo(-38,-30);x.lineTo(-34,40);x.lineTo(34,40);x.lineTo(38,-30);break;case'highball':x.moveTo(-28,-70);x.lineTo(-26,50);x.lineTo(26,50);x.lineTo(28,-70);break;case'hurricane':x.moveTo(-30,-70);x.bezierCurveTo(-50,-20,-10,0,-22,30);x.lineTo(-18,45);x.lineTo(18,45);x.lineTo(22,30);x.bezierCurveTo(10,0,50,-20,30,-70);break;case'mug':x.moveTo(-34,-40);x.lineTo(-34,40);x.lineTo(34,40);x.lineTo(34,-40);break;case'wine':x.moveTo(-34,-55);x.bezierCurveTo(-44,10,-10,20,0,20);x.bezierCurveTo(10,20,44,10,34,-55);break}}
function drawGlass(g,ing,X,Y,s,gar,col){if(!g)return;x.save();x.translate(X,Y);x.scale(s,s);const top={coupe:-40,martini:-45,margarita:-45,rocks:-30,highball:-70,hurricane:-70,mug:-40,wine:-55}[g],bot={coupe:12,martini:20,margarita:5,rocks:40,highball:50,hurricane:45,mug:40,wine:20}[g];
 const v=Math.min(1,vol(ing)/({coupe:110,martini:100,margarita:110,rocks:120,highball:260,hurricane:200,mug:220,wine:220}[g]));
 x.save();glassShape(g);x.closePath();x.clip();x.fillStyle=col||mixCol(ing);x.globalAlpha=.85;const ly=bot-(bot-top)*v*.92;x.fillRect(-80,ly,160,200);x.globalAlpha=1;
 if(['rocks','highball','mug','hurricane'].includes(g)&&v>0){x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<4;i++){rr(-20+(i%2)*16,ly+6+i*14,16,14,3);x.fill()}}x.restore();
 if(g==='mug'){x.fillStyle='#c87a3a';glassShape(g);x.closePath();x.globalAlpha=v>0?.55:1;x.fill();x.globalAlpha=1;x.strokeStyle='#c87a3a';x.lineWidth=6;x.beginPath();x.arc(40,0,16,-1.4,1.4);x.stroke()}
 glassShape(g);x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=2.5;x.stroke();
 if(['coupe','martini','margarita','wine'].includes(g)){x.fillStyle='rgba(255,255,255,.8)';x.fillRect(-2,bot,4,40);x.fillRect(-24,bot+40,48,4)}
 if(gar==='salt'){x.fillStyle='#fff';for(let i=-50;i<0;i+=4)x.fillRect(i,top-3,3,3)}else if(gar){emo(GAR[gar].split(' ')[0],30,top-6,26)}x.restore()}
function bg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#1a0a24');g.addColorStop(1,'#0a0612');x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,79,154,.07)';for(let i=0;i<6;i++){x.beginPath();x.arc(80+i*160,40,30,0,7);x.fill()}}
function tabsIng(X,Y,w,onPick){const cats=['Spirits','Liqueurs','Juices','Syrups','Mixers','Other'];cats.forEach((c2,i)=>button('ct'+i,X+i*(w/6),Y,w/6-4,28,c2,()=>{cat=c2},{fs:11,sel:cat===c2}));
 const L=Object.keys(ING).filter(k=>ING[k][3]===cat&&(!S.mock||!ING[k][4]));L.forEach((k,i)=>{const bx=X+(i%4)*(w/4),by=Y+36+Math.floor(i/4)*50;x.fillStyle=ING[k][2];rr(bx,by,14,42,4);x.fill();button('i'+k,bx+18,by,w/4-24,42,ING[k][0],()=>onPick(k),{fs:11})});if(S.mock&&cat==='Spirits'||S.mock&&cat==='Liqueurs')T('Mocktail mode: no alcohol 🌸',X+w/2,Y+80,15,'#ffb0d8','center','')}
function station(onServe,label){T('Mixing tin',140,120,15,'#ffd6e8','center');drawGlass(mx.g||'highball',mx.ing,140,260,1.6,mx.gar);if(!mx.g){x.globalAlpha=.25;T('(pick a glass)',140,380,13,'#fff','center','');x.globalAlpha=1}
 let y=410;x.font='13px Georgia';for(const k in mx.ing){T(mx.ing[k]+' '+ING[k][1]+' '+ING[k][0],30,y,13,'#ffe9ef','left','');y+=17}
 tabsIng(280,110,600,addIng);T('Pour:',290,300,13,'#ffd6e8','left','');[5,10,15,30,60].forEach((v,i)=>button('st'+v,330+i*58,284,52,26,v+'ml',()=>{step=v},{fs:11,sel:step===v}));
 T('Method',290,334,13,'#ffd6e8','left','');Object.keys(METH).forEach((m,i)=>button('m'+m,350+i*104,318,98,28,m[0].toUpperCase()+m.slice(1),()=>{mx.m=m;tone(200,.2,.05)},{fs:12,sel:mx.m===m}));
 T('Glass',290,368,13,'#ffd6e8','left','');Object.keys(GLS).forEach((g,i)=>button('g'+g,350+(i%4)*130,352+Math.floor(i/4)*32,124,28,GLS[g],()=>{mx.g=g},{fs:11,sel:mx.g===g}));
 T('Garnish',290,436,13,'#ffd6e8','left','');Object.keys(GAR).forEach((g,i)=>button('r'+g,350+(i%6)*88,420+Math.floor(i/6)*32,84,28,GAR[g],()=>{mx.gar=mx.gar===g?null:g},{fs:10,sel:mx.gar===g}));
 button('clr',350,494,120,40,'🗑 Tip out',newMix,{fs:14});button('sv',490,494,220,40,label,onServe,{fs:16,bg:'#ff4f9a',fg:'#fff',ac:'#fff'})}
function drawBar(){bg();if(!cust)newCust();x.fillStyle='rgba(60,20,50,.85)';rr(20,10,860,90,14);x.fill();emo(cust.face,60,55,44);T(cust.name+':',100,42,16,'#ffd6e8');T('“One '+cust.r.n+', please!”',100,70,20,'#fff');T('🪙 '+S.coins+'  ·  served '+S.served,600,42,14,'#ffd24a','left','');
 button('peek',600,54,130,34,'📖 Peek recipe',()=>{cust.peek=!cust.peek},{fs:12,sel:cust.peek});button('home',740,54,110,34,'🏠 Menu',()=>{G.state='title'},{fs:12});
 if(res){drawGlass(mx.g,mx.ing,140,260,1.6,mx.gar);x.fillStyle='rgba(20,6,20,.92)';rr(260,150,520,280,18);x.fill();T(res.sc>=90?'Perfect pour! 🤩':res.sc>=70?'Delicious! 😋':res.sc>=45?'Not bad… 🙂':'Hmm, that\'s… different 😅',520,210,28,'#fff','center');T('Accuracy '+res.sc+'%  ·  Tip +'+res.tip+' 🪙',520,252,18,'#ffd24a','center');
  const r=cust.r;let y=290;x.font='13px Georgia';T('The recipe: '+Object.keys(r.ing).map(k=>r.ing[k]+(ING[k][1]==='ml'?'ml ':' '+ING[k][1]+' ')+ING[k][0]).join(', '),520,y,12,'#ffe9ef','center','');T(METH[r.m]+' · '+GLS[r.g]+' · '+GAR[r.gar],520,y+22,12,'#ffb0d8','center','');
  button('nx',420,360,200,48,'Next customer ▶',newCust,{fs:16,bg:'#ff4f9a',fg:'#fff'});return}
 station(serve,'🍸 Serve '+cust.r.n);
 if(cust.peek){const r=cust.r;x.fillStyle='rgba(20,6,20,.95)';rr(14,104,262,200,10);x.fill();let y=126;for(const k in r.ing){T(r.ing[k]+' '+ING[k][1]+' '+ING[k][0],26,y,13,'#fff','left','');y+=17}x.fillStyle='#ffb0d8';x.font='12px Georgia';wrapT(METH[r.m]+' · '+GLS[r.g]+' · '+GAR[r.gar],26,y+4,240,15);}}
function drawBook(){bg();const L=avail();T('📖 Recipe Book'+(S.mock?' · Mocktails':''),450,40,26,'#ffd6e8','center');button('mk',30,20,150,32,S.mock?'🌸 Mocktails ON':'🍸 Cocktails',()=>{S.mock=!S.mock;bk.i=0;save()},{fs:12,sel:S.mock});
 L.slice(bk.page*12,bk.page*12+12).forEach((r,i)=>button('b'+i,20,64+i*38,230,34,(r.mineR?'⭐ ':'')+r.n,()=>{bk.i=bk.page*12+i},{fs:13,sel:bk.i===bk.page*12+i}));if(L.length>12)button('pg',20,526,230,30,'More ▶',()=>{bk.page=(bk.page+1)%Math.ceil(L.length/12)},{fs:12});
 const r=L[bk.i]||L[0];if(r){x.fillStyle='rgba(60,20,50,.85)';rr(270,64,610,460,16);x.fill();drawGlass(r.g,r.ing,780,260,1.6,r.gar,r.col);T(r.n,300,108,30,'#fff');if(r.mineR)T('Your own creation',300,130,13,'#ffd24a','left','');
  let y=168;T('Ingredients',300,y,16,'#ffb0d8');y+=26;for(const k in r.ing){x.fillStyle=ING[k][2];rr(300,y-12,12,14,3);x.fill();T(r.ing[k]+' '+ING[k][1]+'  '+ING[k][0],320,y,15,'#fff','left','');y+=22}
  y+=12;T('Method',300,y,16,'#ffb0d8');T(METH[r.m],300,y+22,15,'#fff','left','');T('Glass',300,y+56,16,'#ffb0d8');T(GLS[r.g],300,y+78,15,'#fff','left','');T('Garnish',300,y+112,16,'#ffb0d8');T(GAR[r.gar]||'None',300,y+134,15,'#fff','left','');
  x.fillStyle='#ffe9ef';x.font='italic 14px Georgia';wrapT(r.note||'',300,y+170,540,18);
  button('mkit',640,470,220,40,'🍸 Make this one',()=>{cust={name:'You',face:'😎',r,pat:1};newMix();res=null;G.state='bar'},{fs:15,bg:'#ff4f9a',fg:'#fff'})}
 button('bk',20,560,120,32,'← Menu',()=>{G.state='title'},{fs:13});T('Please drink responsibly. 18+ for alcoholic drinks.',580,585,11,'rgba(255,214,232,.6)','center','')}
const nameIn=document.createElement('input');nameIn.maxLength=28;nameIn.placeholder='Name your drink…';nameIn.style.cssText='position:absolute;display:none;z-index:6;font:bold 16px Georgia;padding:6px 10px;border-radius:10px;border:2px solid #ff4f9a;background:#2a0a1e;color:#fff';c.parentNode.style.position='relative';c.parentNode.appendChild(nameIn);nameIn.addEventListener('keydown',e=>e.stopPropagation());
function placeIn(show){if(!show){nameIn.style.display='none';return}const r=c.getBoundingClientRect(),pr=c.parentNode.getBoundingClientRect(),sx=r.width/900,sy=r.height/600;nameIn.style.display='block';nameIn.style.left=(r.left-pr.left+20*sx)+'px';nameIn.style.top=(r.top-pr.top+52*sy)+'px';nameIn.style.width=(240*sx-24)+'px'}
const TINTS=[null,'#ff4f9a','#40c8ff','#9a40e0','#30d870','#ffd24a','#ff6a10','#1a1020'];let tint=0;
function saveMine(){const n=nameIn.value.trim();if(!n){say('Give your drink a name first ✨');return}if(!Object.keys(mx.ing).length||!mx.g){say('Add ingredients and pick a glass!');return}if(DEMO&&S.mine.length>=1){window.demoEnd&&window.demoEnd('The demo saves 1 custom drink. The full game gives you an unlimited recipe book of your own creations!');return}
 S.mine.push({n,ing:Object.assign({},mx.ing),m:mx.m||'build',g:mx.g,gar:mx.gar,col:TINTS[tint],note:'Created at the Coffeebreak Cocktail Bar.',mock:Object.keys(mx.ing).every(k=>!ING[k][4])});save();say('Saved “'+n+'” to your recipe book! 📖',3);nameIn.value='';fan()}
function drawCustom(){if(!mx)newMix();bg();T('✨ Custom Drink Maker',140,40,20,'#ffd6e8','center');placeIn(true);if(mx.g)drawGlass(mx.g,mx.ing,140,260,1.6,mx.gar,TINTS[tint]);T('Colour tint',20,500,13,'#ffd6e8','left','');
 TINTS.forEach((c2,i)=>button('tn'+i,20+i*30,508,26,24,i?'':'auto',()=>{tint=i},{bg:c2||'#3a1424',fs:9,sel:tint===i,ac:'#fff'}));
 station(saveMine,'💾 Save to my recipes');button('bk',20,560,120,32,'← Menu',()=>{placeIn(false);G.state='title'},{fs:13});T('My recipes: '+S.mine.length,160,580,12,'#ffd24a','left','')}
function drawTitle(){bg();x.save();x.shadowColor='#ff4f9a';x.shadowBlur=24;T('Coffeebreak',450,120,30,'#ffd6e8','center');T('Cocktail Bar',450,180,58,'#fff','center');x.restore();
 const showR=REC.filter(r=>S.mock?r.mock:!r.mock).slice(0,5);showR.forEach((r,i)=>drawGlass(r.g,r.ing,250+i*100,280+Math.sin(t*2+i)*5,.8,r.gar));
 button('bar',190,370,250,54,'🍸 Serve customers',()=>{cust=null;G.state='bar'},{fs:18,bg:'#ff4f9a',fg:'#fff'});button('bk',460,370,250,54,'📖 Recipe book',()=>{G.state='book'},{fs:18});
 button('cu',190,436,250,54,'✨ Custom drink maker',()=>{newMix();G.state='custom'},{fs:18});button('mk',460,436,250,54,S.mock?'🌸 Mocktails: ON':'🍹 Mocktails: OFF',()=>{S.mock=!S.mock;save()},{fs:18,sel:S.mock});
 T(DEMO?'Free demo: 5 recipes · 3 customers · 1 custom save':S.mock?'Alcohol-free mode: every drink is a mocktail 🌸':'21 classic recipes with real measures · 18+ for alcoholic drinks',450,520,14,'#ffd6e8','center','')}
function update(dt){if(msgT>0)msgT-=dt;if(G.state!=='custom')placeIn(false)}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='bar')drawBar();else if(s==='book')drawBook();else if(s==='custom')drawCustom();if(msgT>0){x.font='bold 16px Georgia';const w=x.measureText(msg).width+30;x.fillStyle='rgba(0,0,0,.85)';rr(580-w/2,546,w,34,10);x.fill();T(msg,580,569,16,'#fff','center')}x.textAlign='left'}
bindInput({});window.CK={G,S,REC,ING,get mx(){return mx},get cust(){return cust},newCust,serve,addIng,score,saveMine,nameIn};startLoop();
