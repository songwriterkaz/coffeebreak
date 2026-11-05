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
// ===== Coffeebreak Glass Studio =====
const DEMO=!!window.DEMO,SK=DEMO?'glassDemo':'glassSave';
let S={coins:30,gal:[],own:{vase:1,bowl:1,marble:1},cols:{0:1,1:1,2:1},made:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const FORMS=[{k:'vase',n:'Vase',p:0,base:18,tgt:.75},{k:'bowl',n:'Bowl',p:0,base:14,tgt:.6},{k:'marble',n:'Marble',p:0,base:8,tgt:.35},{k:'bauble',n:'Bauble',p:40,base:22,tgt:.55},{k:'paperweight',n:'Paperweight',p:60,base:26,tgt:.45},{k:'seal',n:'Seal figurine',p:120,base:45,tgt:.5},{k:'heart',n:'Heart',p:80,base:30,tgt:.5}];
const COLS=[['Clear','#d8f2ff',0],['Ruby','#e0204a',0],['Cobalt','#2050d8',0],['Emerald','#20b060',25],['Amber','#f0a020',25],['Amethyst','#9a40e0',35],['Ruby red','#c0203a',35],['Aqua','#30d8d0',35],['Gold ruby','#ff3a6a',60],['Black','#20141c',40]];
const FRIT=['None','Speckles','Confetti','Gold flakes'],SW=['Plain','Swirl','Stripes','Spiral'];
let P=null,msg='',msgT=0,sparks=[];
const say=(m,s)=>{msg=m;msgT=s||3};
function newPiece(f){P={f,step:0,gath:0,gHold:false,gDone:false,col:0,col2:1,frit:0,sw:0,size:0,blow:false,shape:.5,heat:1,cold:0,ann:0,annOn:false,q:0};G.state='make'}
const STEPS=['Gather','Colour','Blow & shape','Anneal'];
const fm=()=>FORMS.find(z=>z.k===P.f);
function finish(){const F=fm();const g=1-Math.min(1,Math.abs(P.gath-.7)/.5),sz=1-Math.min(1,Math.abs(P.size-F.tgt)/.5),h=Math.max(0,1-P.cold/6);const q=Math.round((g*.3+sz*.4+h*.3)*100);P.q=q;const price=Math.round(F.base*(.4+q/100)*(P.frit?1.15:1)*(P.sw?1.15:1));P.price=price;
 S.gal.unshift({f:P.f,col:P.col,col2:P.col2,frit:P.frit,sw:P.sw,size:P.size,shape:P.shape,q,price,sold:false});S.gal=S.gal.slice(0,40);S.made++;save();G.level=S.made;G.score+=q;P.step=4;fan();if(DEMO&&S.made>=2)setTimeout(()=>window.demoEnd&&window.demoEnd('You made 2 glass pieces! The full game unlocks baubles, paperweights, hearts and seal figurines, 10 glass colours, frit, swirls, selling and your full gallery.'),2500)}
let AC=null;function tone(f,d,v,tp){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type=tp||'sine';o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function fan(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.2,.06,'triangle'),i*100))}
// --- glass drawing ---
function glassPath(f,s,k){const r=20+s*90;x.beginPath();
 if(f==='vase'){const w=r*.55,h=r*1.6;x.moveTo(-w*.35,-h);x.bezierCurveTo(-w*.3,-h*.5,-w*(1+k*.6),-h*.3,-w*(.9+k*.5),h*.2);x.bezierCurveTo(-w*.9,h*.55,-w*.5,h*.6,0,h*.6);x.bezierCurveTo(w*.5,h*.6,w*.9,h*.55,w*(.9+k*.5),h*.2);x.bezierCurveTo(w*(1+k*.6),-h*.3,w*.3,-h*.5,w*.35,-h);x.closePath()}
 else if(f==='bowl'){const w=r*(.9+k*.4),h=r*(.7-k*.2);x.moveTo(-w,-h*.4);x.quadraticCurveTo(-w*.95,h,0,h);x.quadraticCurveTo(w*.95,h,w,-h*.4);x.quadraticCurveTo(0,-h*.2,-w,-h*.4)}
 else if(f==='heart'){const a=r*.8;x.moveTo(0,a*.9);x.bezierCurveTo(-a*1.6,-a*.1,-a*.7,-a*1.3,0,-a*.4);x.bezierCurveTo(a*.7,-a*1.3,a*1.6,-a*.1,0,a*.9)}
 else if(f==='seal'){const a=r*.8;x.ellipse(0,a*.2,a*1.1,a*.6,0,0,7);x.moveTo(a*.7,-a*.2);x.ellipse(a*.75,-a*.35,a*.42,a*.38,0,0,7)}
 else if(f==='paperweight'){const a=r*.75;x.moveTo(-a,a*.5);x.bezierCurveTo(-a,-a*1.1,a,-a*1.1,a,a*.5);x.closePath()}
 else{x.arc(0,0,f==='marble'?r*.6:r*.85,0,7)}}
function drawGlass(g,X,Y,sc,glow){const c1=COLS[g.col][1],c2=COLS[g.col2][1],f=g.f;x.save();x.translate(X,Y);x.scale(sc,sc);
 if(f==='bauble'){const r=(20+g.size*90)*.85;x.fillStyle='#d8b040';x.fillRect(-8,-r-12,16,14)}
 glassPath(f,g.size,g.shape);x.save();x.clip();const gr=x.createRadialGradient(-20,-25,5,0,0,140);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.25,c1+'d0');gr.addColorStop(1,c1+'70');x.fillStyle=gr;x.fillRect(-200,-200,400,400);
 if(g.sw){x.strokeStyle=c2+'b0';x.lineWidth=g.sw===2?10:6;for(let i=-8;i<8;i++){x.beginPath();if(g.sw===1){for(let a=0;a<12;a+=.2)x.lineTo(Math.cos(a+i)*a*10,Math.sin(a+i)*a*10)}else if(g.sw===2){x.moveTo(i*24,-200);x.lineTo(i*24,200)}else{x.moveTo(i*24-100,-200);x.lineTo(i*24+100,200)}x.stroke()}}
 if(g.frit){const fc=g.frit===3?['#ffd24a','#fff1a0']:g.frit===2?['#ff4f9a','#ffd24a','#30d8d0','#9a40e0','#fff']:['#fff',c2];for(let i=0;i<70;i++){x.fillStyle=fc[i%fc.length];const a=i*2.39,rd=(i*13%140);x.fillRect(Math.cos(a)*rd,Math.sin(a)*rd,g.frit===3?4:3,g.frit===3?2:3)}}
 if(glow){x.fillStyle='rgba(255,120,20,'+(glow*.55)+')';x.fillRect(-200,-200,400,400)}x.restore();
 glassPath(f,g.size,g.shape);x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=2/sc;x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(-14,-18,6,14,.5,0,7);x.fill();
 if(f==='seal'){const a=(20+g.size*90)*.8;x.fillStyle='#111';x.beginPath();x.arc(a*.85,-a*.42,4,0,7);x.arc(a*.62,-a*.42,4,0,7);x.fill()}x.restore()}
function studioBg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#2a1410');g.addColorStop(1,'#120806');x.fillStyle=g;x.fillRect(0,0,900,600);
 // furnace
 x.fillStyle='#4a3028';rr(30,120,190,240,20);x.fill();const fl=.7+Math.sin(t*9)*.1;const fg=x.createRadialGradient(125,250,5,125,250,70);fg.addColorStop(0,'rgba(255,240,180,'+fl+')');fg.addColorStop(.5,'rgba(255,140,30,'+fl+')');fg.addColorStop(1,'rgba(160,30,0,.8)');x.fillStyle=fg;x.beginPath();x.arc(125,250,62,Math.PI,0);x.lineTo(187,300);x.lineTo(63,300);x.fill();T('FURNACE 1130°C',125,148,13,'#ffcf8a','center');
 x.fillStyle='#3a2a24';rr(30,380,190,110,14);x.fill();T('ANNEALER',125,404,13,'#ffcf8a','center');x.fillStyle='rgba(255,120,40,.25)';rr(50,414,150,60,8);x.fill();
 x.fillStyle='#5a3a20';x.fillRect(240,470,620,16);sparks.forEach(s=>{x.fillStyle='rgba(255,'+(160+s.l*90|0)+',60,'+s.l+')';x.fillRect(s.x,s.y,3,3)})}
function pipe(){x.strokeStyle='#9a9aa8';x.lineWidth=8;x.beginPath();x.moveTo(230,300);x.lineTo(380,300);x.stroke()}
function bar(X,Y,w,v,col,lbl,tg){x.fillStyle='#000a';rr(X,Y,w,18,9);x.fill();x.fillStyle=col;rr(X,Y,Math.max(2,w*Math.min(1,v)),18,9);x.fill();if(tg!==undefined){x.fillStyle='rgba(120,255,140,.35)';x.fillRect(X+w*(tg-.08),Y,w*.16,18)}T(lbl,X,Y-5,13,'#ffe0c0')}
function drawMake(){studioBg();const F=fm();T('Making: '+F.n,560,40,24,'#ffcf8a','center');STEPS.forEach((s,i)=>{x.fillStyle=i===P.step?'#ff8a3d':i<P.step?'#6a4a30':'#2a1a14';rr(250+i*155,56,145,30,8);x.fill();T((i+1)+'. '+s,322+i*155,76,14,'#fff','center')});
 const glow=P.step<3?Math.max(0,P.heat):0;
 if(P.step===0){pipe();if(P.gath>0)drawGlass({f:'marble',col:0,col2:0,frit:0,sw:0,size:P.gath*.7,shape:.5},480,300,1,1);bar(560,160,300,P.gath,'#ff8a3d','Gather (aim for the green zone)',.7);
  x.fillStyle='#ffe0c0';x.font='15px Georgia';wrapT('Hold the button to dip the pipe in the furnace and wind on molten glass. Let go in the green zone.',560,215,300,20);
  button('gat',560,280,300,60,P.gHold?'🔥 Gathering…':'Hold to gather',()=>{},{fs:20,bg:'#ff8a3d',fg:'#1a0a04',ac:'#ffcf8a'});if(P.gath>0&&!P.gHold)button('gn',560,360,300,50,'Next: colour ▶',()=>{P.step=1},{fs:18})}
 else if(P.step===1){pipe();drawGlass({f:'marble',col:P.col,col2:P.col2,frit:P.frit,sw:P.sw,size:P.gath*.7,shape:.5},480,300,1,.5);T('Glass colour',540,130,15,'#ffcf8a');
  COLS.forEach((c,i)=>{const own=S.cols[i]||(!DEMO&&false);button('c'+i,540+(i%5)*70,140+Math.floor(i/5)*44,64,38,own?'':'🔒'+c[2],()=>{if(!own){if(DEMO){window.demoEnd&&window.demoEnd('More glass colours are in the full game!');return}if(S.coins>=c[2]){S.coins-=c[2];S.cols[i]=1;save();say('Unlocked '+c[0]+'!')}else say('Need '+c[2]+' coins');return}P.col=i},{bg:own?c[1]:'#2a1a14',sel:P.col===i,ac:'#fff',fs:12})});
  T('Second colour (frit & swirls)',540,250,15,'#ffcf8a');COLS.forEach((c,i)=>{if(S.cols[i])button('d'+i,540+(i%5)*70,258+Math.floor(i/5)*40,64,34,'',()=>{P.col2=i},{bg:c[1],sel:P.col2===i,ac:'#fff'})});
  T('Frit',540,358,15,'#ffcf8a');FRIT.forEach((n,i)=>button('f'+i,580+i*75,340,70,30,n,()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('Confetti and gold-flake frit are in the full game!');return}P.frit=i},{sel:P.frit===i,fs:11}));
  T('Pattern',540,400,15,'#ffcf8a');SW.forEach((n,i)=>button('s'+i,600+i*68,382,64,30,n,()=>{if(DEMO&&i>1){window.demoEnd&&window.demoEnd('Stripes and spiral patterns are in the full game!');return}P.sw=i},{sel:P.sw===i,fs:11}));
  button('cn',600,420,220,44,'Next: blow & shape ▶',()=>{P.step=2;P.size=.15},{fs:16,bg:'#ff8a3d',fg:'#1a0a04'})}
 else if(P.step===2){pipe();drawGlass(Object.assign({},P),400,300,.75,glow*.6);bar(560,130,300,P.size,'#7fd8ff','Size (target green)',F.tgt);bar(560,180,300,P.heat,P.heat<.25?'#ff3030':'#ff8a3d','Heat '+(P.heat<.25?'— TOO COLD! Reheat!':''));
  T('Shape',560,232,13,'#ffe0c0');x.fillStyle='#000a';rr(560,238,300,14,7);x.fill();x.fillStyle='#ffcf8a';x.beginPath();x.arc(560+P.shape*300,245,11,0,7);x.fill();BTN.sh={x:550,y:228,w:320,h:34,fn:p=>{P.drag=1;P.shape=Math.max(0,Math.min(1,(p.x-560)/300))}};
  button('blow',560,280,145,58,P.blow?'💨 Blowing…':'Hold to blow',()=>{},{fs:16,bg:'#7fd8ff',fg:'#04121a',ac:'#fff'});button('heat',715,280,145,58,'🔥 Reheat',()=>{P.heat=Math.min(1,P.heat+.35);tone(120,.3,.06,'sawtooth');for(let i=0;i<20;i++)sparks.push({x:180+Math.random()*40,y:240+Math.random()*30,vx:Math.random()*60-30,vy:-Math.random()*80,l:1})},{fs:16,bg:'#ff8a3d',fg:'#1a0a04'});
  x.fillStyle='#ffe0c0';x.font='14px Georgia';wrapT('Hold Blow to inflate, drag Shape to form it, and keep it hot. Working cold glass risks cracks.',560,365,300,18);button('bn',600,410,220,44,'Next: anneal ▶',()=>{P.step=3;P.annOn=true},{fs:16,bg:'#ff8a3d',fg:'#1a0a04'})}
 else if(P.step===3){drawGlass(Object.assign({},P),125,444,.32,0);bar(560,160,300,P.ann,'#ffcf8a','Annealing: cooling slowly so it won\'t crack');T(Math.round(510-480*P.ann)+'°C',710,220,30,'#ffcf8a','center');button('ff',600,260,220,46,'⏩ Fast forward',()=>{P.ann=Math.min(1,P.ann+.25)},{fs:16})}
 else{drawGlass(Object.assign({},P),360,300,1.3,0);T('Finished!',680,150,34,'#ffcf8a','center');T('Quality '+P.q+'%',680,200,24,P.q>75?'#7fffa0':'#ffe0c0','center');T('Value: '+P.price+' coins',680,240,20,'#ffd24a','center');T(['','⭐','⭐⭐','⭐⭐⭐'][P.q>80?3:P.q>55?2:1],680,280,30,'#fff','center');
  button('sell',590,320,180,50,'💰 Sell now',()=>{const g=S.gal[0];if(g&&!g.sold){g.sold=true;S.coins+=g.price;save();tone(1200,.1,.06)}G.state='studio'},{fs:18,bg:'#ffd24a',fg:'#1a0a04'});button('keep',590,380,180,50,'🖼 Keep in gallery',()=>{G.state='studio'},{fs:16})}
 T('🪙 '+S.coins,250,40,18,'#ffd24a','left');button('qq',250,520,110,40,'← Studio',()=>{G.state='studio'},{fs:14})}
function drawStudio(){studioBg();T('Choose what to make',560,60,28,'#ffcf8a','center');T('🪙 '+S.coins+' coins',560,92,18,'#ffd24a','center');
 FORMS.forEach((F,i)=>{const X=260+(i%4)*152,Y=115+Math.floor(i/4)*175,own=S.own[F.k];x.fillStyle='rgba(60,30,20,.85)';rr(X,Y,142,160,14);x.fill();drawGlass({f:F.k,col:[1,2,7,6,4,0,8][i],col2:3,frit:0,sw:0,size:F.tgt*.8,shape:.5},X+71,Y+65,.45,0);T(F.n,X+71,Y+122,15,'#fff','center');
  button('fm'+i,X+16,Y+128,110,26,own?'Make':(DEMO?'🔒 Full':'🔒 '+F.p+' coins'),()=>{if(!own){if(DEMO){window.demoEnd&&window.demoEnd('Baubles, paperweights, hearts and seal figurines are in the full game!');return}if(S.coins>=F.p){S.coins-=F.p;S.own[F.k]=1;save();say('Unlocked '+F.n+'!')}else say('Need '+F.p+' coins: sell more glass!');return}newPiece(F.k)},{fs:12,bg:own?'#ff8a3d':'#2a1a14',fg:own?'#1a0a04':'#fff'})});
 button('gal',300,480,200,50,'🖼 Gallery ('+S.gal.length+')',()=>{G.state='gallery'},{fs:17});button('home',520,480,200,50,'🏠 Title',()=>{G.state='title'},{fs:17})}
function drawGallery(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#f6eee6');g.addColorStop(1,'#d8c8b8');x.fillStyle=g;x.fillRect(0,0,900,600);T('🖼 Your Glass Gallery',450,50,30,'#5a3020','center');
 if(!S.gal.length)T('Nothing here yet. Make your first piece!',450,280,18,'#5a3020','center','');S.gal.slice(0,12).forEach((p,i)=>{const X=60+(i%6)*135,Y=80+Math.floor(i/6)*210;x.fillStyle='#fff';rr(X,Y,125,190,10);x.fill();x.fillStyle='#e8dcd0';x.fillRect(X+10,Y+150,105,8);drawGlass(p,X+62,Y+90,.5,0);T(FORMS.find(f=>f.k===p.f).n,X+62,Y+176,13,'#5a3020','center');T(p.sold?'Sold ✓':'Q '+p.q+'% · '+p.price+'🪙',X+62,Y+20,11,'#8a6040','center','');
  if(!p.sold)button('sg'+i,X+22,Y+156,80,0.1,'',()=>{})});
 button('bk',350,520,200,48,'← Studio',()=>{G.state='studio'},{fs:17,bg:'#5a3020',fg:'#fff'})}
function drawTitle(){studioBg();x.save();x.shadowColor='#ff8a3d';x.shadowBlur=30;T('Coffeebreak',560,140,30,'#ffcf8a','center');T('Glass Studio',560,200,58,'#fff1d8','center');x.restore();
 [0,1,2].forEach(i=>drawGlass({f:['vase','bauble','heart'][i],col:[6,7,1][i],col2:4,frit:i,sw:i?1:2,size:.5,shape:.5},420+i*140,320+Math.sin(t*2+i)*6,.6,0));
 button('go',440,420,240,60,'🔥 Fire up the furnace',()=>{G.state='studio'},{fs:19,bg:'#ff8a3d',fg:'#1a0a04'});T(DEMO?'Free demo: make 2 pieces':'Gather · colour · blow · shape · anneal · sell · collect',560,512,14,'#ffcf8a','center','')}
let down=false;bindInput({down(p){down=true},move(p){if(down&&P&&P.drag)P.shape=Math.max(0,Math.min(1,(p.x-560)/300))},up(){down=false;if(P){P.drag=0;P.gHold=false;P.blow=false}}});
c.addEventListener('mousedown',e=>holdChk(pos(e)));c.addEventListener('touchstart',e=>holdChk(pos(e)));
function holdChk(p){if(G.state!=='make'||!P)return;if(P.step===0&&inB(p,{x:560,y:280,w:300,h:60}))P.gHold=true;if(P.step===2&&inB(p,{x:560,y:280,w:145,h:58}))P.blow=true}
function update(dt){if(msgT>0)msgT-=dt;sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt});sparks=sparks.filter(s=>s.l>0);
 if(G.state==='make'&&P){if(P.step===0&&P.gHold){P.gath=Math.min(1,P.gath+dt*.4);if(Math.random()<.3)sparks.push({x:150+Math.random()*50,y:260,vx:Math.random()*80,vy:-Math.random()*60,l:1})}
  if(P.step===2){P.heat=Math.max(0,P.heat-dt*.09);if(P.heat<.25&&(P.blow||P.drag))P.cold+=dt;if(P.blow&&P.heat>0)P.size=Math.min(1,P.size+dt*.18*(.4+P.heat))}
  if(P.step===3&&P.annOn){P.ann=Math.min(1,P.ann+dt*.12);if(P.ann>=1){P.annOn=false;finish()}}}}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')drawTitle();else if(G.state==='studio')drawStudio();else if(G.state==='make')drawMake();else if(G.state==='gallery')drawGallery();if(msgT>0){x.font='bold 16px Georgia';const w=x.measureText(msg).width+30;x.fillStyle='rgba(0,0,0,.8)';rr(560-w/2,440,w,34,10);x.fill();T(msg,560,463,16,'#fff','center')}x.textAlign='left'}
window.GL={G,S,P:()=>P,newPiece,finish};startLoop();
