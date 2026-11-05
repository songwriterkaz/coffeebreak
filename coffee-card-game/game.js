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
// ===== COFFEE: The Coffeebreak Card Game =====
const DEMO=()=>!!window.DEMO;
const ROAST=[['Latte','#f3dfbf','#b08850'],['Espresso','#7a4a2a','#3a1e0e'],['Matcha','#8cc46a','#3e6e2a'],['Strawberry','#f7a0bf','#c0406a']];
const ACT={spill:'Spill',refill:'Refill',dbl:'Double Shot',decaf:'Decaf',choice:"Barista's Choice",mega:'Mega Brew'};
const CHARS=[{n:'Bella the Barista',e:'👩‍🍳',col:'#e8a0b0',call:.95,catchP:.9,agg:.4,lines:['Order up.','Nice try, sweetie.','Fresh brew coming.']},{n:'Moe the Mocha Monster',e:'👹',col:'#a06a40',call:.8,catchP:.7,agg:.9,lines:['RAWR. Double shot.','Mwahaha, drink it.','More beans for Moe.']},{n:'Granny Biscotti',e:'👵',col:'#d8c8a8',call:.6,catchP:.5,agg:.2,lines:['Oh my, lovely.','In my day we used cups…','Have a biscuit, dear.']},{n:'Pip the Pup',e:'🐶',col:'#c8a878',call:.7,catchP:.6,agg:.6,lines:['Woof. ☕','*wags tail*','Arf arf.']}];
const SK='coffeeStats';let S={wins:0,losses:0,streak:0,best:0,rounds:0};try{Object.assign(S,JSON.parse(localStorage[SK]||'{}'))}catch(e){}
function saveS(){try{localStorage[SK]=JSON.stringify(S)}catch(e){}G.score=S.wins;G.level=S.best}
const G={state:'title',score:0,level:1,nOpp:1,P:[],deck:[],pile:[],cur:0,dir:1,roast:0,decaf:false,wait:0,drawn:null,msg:'',flys:[],bub:[],demoRounds:0,winner:-1,catchable:-1,sel:-1};
let uid=0;
function mkDeck(){const d=[];for(let r=0;r<4;r++){d.push({r,v:'0'});for(let k=0;k<2;k++){for(let n=1;n<=9;n++)d.push({r,v:''+n});for(const a of['spill','refill','dbl','decaf'])d.push({r,v:a})}}for(let k=0;k<4;k++){d.push({r:4,v:'choice'});d.push({r:4,v:'mega'})}d.forEach(c=>c.id=uid++);for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}return d}
const isAct=c=>isNaN(+c.v);const isWild=c=>c.r===4;
const topC=()=>G.pile[G.pile.length-1];
function draw1(){if(!G.deck.length){const t=G.pile.pop();G.deck=G.pile.map(c=>{if(isWild(c))delete c.cr;return c});G.pile=[t];for(let i=G.deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[G.deck[i],G.deck[j]]=[G.deck[j],G.deck[i]]}}return G.deck.pop()}
function give(i,n){const p=G.P[i];for(let k=0;k<n;k++){const c=draw1();if(!c)break;p.hand.push(c);const [sx,sy]=seat(i);fly(c,395,250,sx,sy,!p.ai,k*.08)}if(p.hand.length>1)p.called=false;sortHand()}
function sortHand(){const h=G.P[0]&&G.P[0].hand;if(h)h.sort((a,b)=>a.r-b.r||(''+a.v).localeCompare(''+b.v))}
function fly(c,x0,y0,x1,y1,face,delay){G.flys.push({c,x0,y0,x1,y1,t:-(delay||0),face})}
function seat(i){const n=G.P.length;if(i===0)return[450,470];const pos=n===2?[[450,90]]:n===3?[[110,240],[790,240]]:[[110,240],[450,90],[790,240]];return pos[i-1]}
function say(i,s){const [x0,y0]=seat(i);G.bub=G.bub.filter(b=>b.i!==i);G.bub.push({i,x:x0,y:i===0?400:y0+(G.P.length>2&&i!==2||G.P.length===2?90:90),s,l:2.2})}
function canPlay(c){if(G.decaf&&isAct(c))return false;if(isWild(c))return true;return c.r===G.roast||c.v===topC().v}
function newRound(){if(DEMO()&&G.demoRounds>=3)return demoEnd('The free demo is 3 rounds against Bella. Get the full game to play 1-3 café characters, unlimited rounds, win streaks and all 38 songs.');
 G.demoRounds++;G.deck=mkDeck();G.pile=[];const opp=[1,2,3].slice(0,G.nOpp);G.P=[{name:'You',ai:false,hand:[],called:false}].concat(opp.map(k=>({...CHARS[k===1?0:k===2?1:2],ai:true,hand:[],called:false})));
 if(G.nOpp===3)G.P[3]=Object.assign({},CHARS[3],{ai:true,hand:[],called:false});
 G.P.forEach(p=>p.name=p.name||p.n);for(let i=0;i<G.P.length;i++)for(let k=0;k<7;k++)G.P[i].hand.push(draw1());sortHand();
 let f;do{f=draw1();if(isAct(f)){G.deck.unshift(f);f=null}}while(!f);G.pile.push(f);G.roast=f.r;G.cur=0;G.dir=1;G.decaf=false;G.drawn=null;G.winner=-1;G.catchable=-1;G.flys=[];G.bub=[];G.state='play';G.msg='Your turn. Match the roast or the number.';
 G.P[0].hand.forEach((c,k)=>fly(c,395,250,450,470,true,k*.05));startMusic()}
function next(n){G.cur=(G.cur+G.dir*n+G.P.length*4)%G.P.length}
function nextIdx(){return(G.cur+G.dir+G.P.length)%G.P.length}
function play(i,c,chosen){const p=G.P[i];p.hand.splice(p.hand.indexOf(c),1);const [sx,sy]=seat(i);fly(c,sx,sy,505,250,true);G.pile.push(c);G.drawn=null;
 if(isWild(c)){c.cr=chosen;G.roast=chosen}else G.roast=c.r;
 const wasDecaf=G.decaf;G.decaf=false;
 // someone uncalled and another player plays -> catch window closes
 if(G.catchable>=0&&G.catchable!==i)G.catchable=-1;
 if(p.hand.length===1){if(p.ai){if(Math.random()<p.call){p.called=true;say(i,'COFFEE. ☕')}else{p.called=false;G.catchable=i}}else{if(!p.called){G.catchable=0}}}
 if(p.hand.length===0){G.winner=i;endRound();return}
 const N=G.P.length;let msg=p.name+' played '+cardName(c)+'.';
 if(c.v==='spill'){next(1);msg+=' '+G.P[G.cur].name+' is skipped.';next(1)}
 else if(c.v==='refill'){if(N===2){next(2);msg+=' Refill — '+p.name+' goes again.'}else{G.dir*=-1;next(1);msg+=' Direction reversed.'}}
 else if(c.v==='dbl'){next(1);give(G.cur,2);msg+=' '+G.P[G.cur].name+' draws 2.';next(1)}
 else if(c.v==='mega'){next(1);give(G.cur,4);msg+=' '+G.P[G.cur].name+' draws 4.';next(1)}
 else{if(c.v==='decaf'){G.decaf=true;msg+=' '+G.P[nextIdx()].name+' can\'t play actions.'}next(1)}
 if(isWild(c))msg+=' Roast: '+ROAST[chosen][0]+'.';G.msg=msg;turnStart()}
function cardName(c){return(isWild(c)?'':ROAST[c.r][0]+' ')+(ACT[c.v]||c.v)}
function turnStart(){const p=G.P[G.cur];G.wait=p.ai?.9+Math.random()*.7:0;if(!p.ai){G.msg+=(G.decaf?' ☕ Decaf: numbers only this turn.':'')+' Your turn.'}}
function aiTurn(){const i=G.cur,p=G.P[i];
 // AI catches you?
 if(G.catchable===0&&G.P[0].hand.length===1&&!G.P[0].called){if(Math.random()<p.catchP){give(0,2);say(i,'Caught you. No COFFEE. ☕');G.msg=p.name+' caught you not calling COFFEE. Draw 2.';}G.catchable=-1}
 let opts=p.hand.filter(canPlay);
 if(!opts.length){const c=draw1();p.hand.push(c);fly(c,395,250,...seat(i),false);p.called=false;if(canPlay(c))opts=[c];else{G.msg=p.name+' drew a card.';G.decaf=false;next(1);turnStart();return}}
 opts.sort((a,b)=>score(b,p)-score(a,p));const c=opts[0];let ch=c.r;
 if(isWild(c)){const cnt=[0,0,0,0];p.hand.forEach(h=>{if(h.r<4)cnt[h.r]++});ch=cnt.indexOf(Math.max(...cnt))}
 if(Math.random()<.25)say(i,p.lines[Math.random()*p.lines.length|0]);play(i,c,ch)}
function score(c,p){let s=Math.random()*.5;if(isWild(c))s+=p.agg>.5?2:-1+ (p.hand.length<3?4:0);else if(isAct(c))s+=p.agg*3;else s+=1;const nx=G.P[nextIdx()];if(nx.hand.length<=2&&(c.v==='dbl'||c.v==='mega'||c.v==='spill'))s+=5;return s}
function endRound(){S.rounds++;if(G.winner===0){S.wins++;S.streak++;S.best=Math.max(S.best,S.streak)}else{S.losses++;S.streak=0}saveS();G.state='end';G.endT=0}
function humanPlay(c){if(G.state!=='play'||G.cur!==0||G.flys.some(f=>f.t<0))return;if(!canPlay(c)){G.msg=G.decaf&&isAct(c)?'Decaf. You can only play number cups this turn.':'That doesn\'t match the '+ROAST[G.roast][0]+' roast or the '+(ACT[topC().v]||topC().v)+'.';return}
 if(G.drawn&&c!==G.drawn){G.msg='You can only play the card you just drew (or Pass).';return}
 if(isWild(c)){G.state='choose';G.pendingC=c;return}play(0,c,c.r)}
function humanDraw(){if(G.state!=='play'||G.cur!==0||G.drawn)return;const c=draw1();G.P[0].hand.push(c);G.P[0].called=false;fly(c,395,250,450,470,true);sortHand();if(canPlay(c)){G.drawn=c;G.msg='You drew '+cardName(c)+' — play it or Pass.'}else{G.msg='You drew '+cardName(c)+'. No luck.';G.decaf=false;next(1);turnStart()}}
function pass(){if(!G.drawn)return;G.drawn=null;G.decaf=false;next(1);turnStart()}
function callCoffee(){const p=G.P[0];if(p.hand.length<=2){p.called=true;if(G.catchable===0)G.catchable=-1;say(0,'COFFEE. ☕');G.msg='You called COFFEE. ☕'}}
function catchAI(){const i=G.catchable;if(i>0&&G.P[i].hand.length===1&&!G.P[i].called){give(i,2);say(i,'Oops. Forgot to call.');G.msg='You caught '+G.P[i].name+'! They draw 2.';G.catchable=-1}}
function update(dt){for(const f of G.flys)f.t+=dt/.35;G.flys=G.flys.filter(f=>f.t<1);for(const b of G.bub)b.l-=dt;G.bub=G.bub.filter(b=>b.l>0);
 if(G.state==='play'&&G.P[G.cur].ai){G.wait-=dt;if(G.wait<=0&&!G.flys.some(f=>f.t<.5))aiTurn()}
 if(G.state==='end')G.endT+=dt}
// ---------- drawing ----------
function cup(X,Y,s,col,face){x.save();x.translate(X,Y);x.scale(s,s);x.fillStyle='#fff';x.beginPath();x.moveTo(-16,-10);x.lineTo(16,-10);x.lineTo(12,16);x.quadraticCurveTo(0,20,-12,16);x.closePath();x.fill();x.strokeStyle='#5a3a2a';x.lineWidth=1.6;x.stroke();
 x.beginPath();x.arc(17,2,6,-1.3,1.3);x.stroke();x.fillStyle=col;x.beginPath();x.ellipse(0,-10,16,4,0,0,7);x.fill();x.stroke();
 if(face!==false){x.fillStyle='#3a1e0e';x.beginPath();x.arc(-5,2,1.8,0,7);x.arc(5,2,1.8,0,7);x.fill();x.strokeStyle='#3a1e0e';x.lineWidth=1.3;x.beginPath();x.arc(0,5,3,.2,Math.PI-.2);x.stroke();x.fillStyle='rgba(240,110,140,.55)';x.beginPath();x.arc(-9,6,2.2,0,7);x.arc(9,6,2.2,0,7);x.fill()}
 x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.5;for(const k of[-5,4]){x.beginPath();x.moveTo(k,-15);x.bezierCurveTo(k-4,-20,k+4,-23,k,-28);x.stroke()}x.restore()}
function card(c,X,Y,w,h,face,o={}){x.save();x.translate(X,Y);if(o.rot)x.rotate(o.rot);
 x.shadowColor='rgba(0,0,0,.4)';x.shadowBlur=6;x.shadowOffsetY=2;
 if(!face){x.fillStyle='#3a1424';rr(-w/2,-h/2,w,h,9);x.fill();x.shadowBlur=0;x.strokeStyle='#e8a0b0';x.lineWidth=2;rr(-w/2+4,-h/2+4,w-8,h-8,7);x.stroke();x.fillStyle='#e8a0b0';x.font='bold '+(w*.2)+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.save();x.rotate(-.5);x.fillText('COFFEE.',0,0);x.restore();x.textBaseline='alphabetic';x.restore();return}
 const wild=isWild(c),R=wild?null:ROAST[c.r];x.fillStyle='#fffaf2';rr(-w/2,-h/2,w,h,9);x.fill();x.shadowBlur=0;x.shadowOffsetY=0;
 if(wild){const cols=ROAST.map(r=>r[1]);x.save();rr(-w/2+4,-h/2+4,w-8,h-8,7);x.clip();for(let k=0;k<4;k++){x.fillStyle=cols[k];x.beginPath();x.moveTo(0,0);x.arc(0,0,w,k*Math.PI/2,(k+1)*Math.PI/2);x.fill()}x.restore();if(c.cr!=null){x.strokeStyle=ROAST[c.cr][2];x.lineWidth=5;rr(-w/2+2,-h/2+2,w-4,h-4,8);x.stroke()}}
 else{x.fillStyle=R[1];rr(-w/2+4,-h/2+4,w-8,h-8,7);x.fill()}
 x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(0,0,w*.36,h*.33,-.35,0,7);x.fill();
 const ink=wild?'#3a1e0e':R[2],cc=wild?'#c8905a':R[1];const s=w/70;
 if(!isAct(c)){cup(0,4*s,s*1.05,cc);x.fillStyle=ink;x.font='bold '+(30*s)+'px Georgia';x.textAlign='center';x.fillText(c.v,0,-18*s+ (c.v==='6'||c.v==='9'?0:0))}
 else if(c.v==='spill'){x.save();x.rotate(1.1);cup(0,0,s,cc,false);x.restore();x.fillStyle=cc;x.beginPath();x.ellipse(10*s,22*s,18*s,6*s,0,0,7);x.fill();x.strokeStyle=ink;x.lineWidth=3*s;x.beginPath();x.arc(0,0,26*s,0,7);x.moveTo(-18*s,-18*s);x.lineTo(18*s,18*s);x.stroke()}
 else if(c.v==='refill'){cup(0,6*s,s*.9,cc);x.strokeStyle=ink;x.lineWidth=3*s;x.beginPath();x.arc(0,0,27*s,-2.6,-.6);x.stroke();x.beginPath();x.arc(0,0,27*s,.55,2.55);x.stroke();x.fillStyle=ink;x.beginPath();x.moveTo(23*s,-15*s);x.lineTo(28*s,-4*s);x.lineTo(16*s,-9*s);x.fill();x.beginPath();x.moveTo(-23*s,15*s);x.lineTo(-28*s,4*s);x.lineTo(-16*s,9*s);x.fill()}
 else if(c.v==='dbl'){cup(-9*s,8*s,s*.75,cc);cup(10*s,10*s,s*.75,cc);x.fillStyle=ink;x.font='bold '+(22*s)+'px Georgia';x.textAlign='center';x.fillText('+2',0,-16*s)}
 else if(c.v==='decaf'){cup(0,8*s,s,cc,false);x.fillStyle='#3a1e0e';x.font=(10*s)+'px Georgia';x.textAlign='center';x.fillText('– –',0,12*s);x.fillStyle=ink;x.font='bold '+(16*s)+'px Georgia';x.fillText('z',14*s,-14*s);x.fillText('Z',22*s,-24*s)}
 else if(c.v==='choice'){cup(0,6*s,s*1.05,'#c8905a');x.fillStyle='#3a1e0e';x.font='bold '+(13*s)+'px Georgia';x.textAlign='center';x.fillText('✦ PICK ✦',0,-20*s)}
 else if(c.v==='mega'){x.fillStyle='#fff';x.strokeStyle='#5a3a2a';x.lineWidth=1.6;rr(-16*s,-10*s,32*s,34*s,6*s);x.fill();x.stroke();x.fillStyle='#3a1e0e';x.fillRect(-16*s,-4*s,32*s,6*s);x.font='bold '+(20*s)+'px Georgia';x.textAlign='center';x.fillText('+4',0,-16*s);cup(0,14*s,s*.5,'#c8905a')}
 x.fillStyle=wild?'#fff':ink;x.font='bold '+(11*s)+'px Georgia';x.textAlign='left';const lab=isAct(c)?({spill:'⊘',refill:'⇄',dbl:'+2',decaf:'Zz',choice:'★',mega:'+4'})[c.v]:c.v;x.fillText(lab,-w/2+7,-h/2+15*s);x.textAlign='right';x.fillText(lab,w/2-7,h/2-6*s);
 if(isAct(c)){x.textAlign='center';x.font='bold '+(8.5*s)+'px Georgia';x.fillStyle=wild?'#fff':ink;x.fillText(ACT[c.v].toUpperCase(),0,h/2-9*s)}
 if(o.glow){x.strokeStyle='#ffe08a';x.lineWidth=3;rr(-w/2-2,-h/2-2,w+4,h+4,10);x.stroke()}
 x.textAlign='left';x.restore()}
const CW=70,CH=100;
function handPos(i,n){const sp=Math.min(62,700/Math.max(1,n));return[450-(n-1)*sp/2+i*sp,480]}
function table(){const g=x.createRadialGradient(450,280,40,450,280,520);g.addColorStop(0,'#5a3424');g.addColorStop(1,'#1e0e08');x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle='rgba(232,160,176,.25)';x.lineWidth=3;x.beginPath();x.ellipse(450,270,380,190,0,0,7);x.stroke()}
function drawPlay(){table();
 // opponents
 for(let i=1;i<G.P.length;i++){const p=G.P[i],[sx,sy]=seat(i),n=p.hand.length;const act=G.cur===i&&G.state==='play';x.fillStyle=act?'rgba(255,224,138,.25)':'rgba(0,0,0,.3)';rr(sx-90,sy-62,180,40,12);x.fill();emo(p.e,sx-70,sy-42,26);x.fillStyle=act?'#ffe08a':'#ffe9c7';x.font='bold 13px Georgia';x.textAlign='left';x.fillText(p.n,sx-52,sy-46);x.font='12px Georgia';x.fillText(n+' card'+(n===1?'':'s')+(n===1&&p.called?' · ☕ called':''),sx-52,sy-30);
  for(let k=0;k<Math.min(n,12);k++)card(null,sx-(Math.min(n,12)-1)*7+k*14,sy+30,42,60,false,{rot:(k-n/2)*.03})}
 // piles
 card(null,395,250,CW,CH,false);x.fillStyle='#ffe9c7';x.font='12px Georgia';x.textAlign='center';x.fillText('Draw ('+G.deck.length+')',395,318);
 const t=topC();if(t)card(t,505,250,CW,CH,true);x.fillStyle=ROAST[G.roast][1];x.beginPath();x.arc(575,215,12,0,7);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#ffe9c7';x.font='12px Georgia';x.textAlign='left';x.fillText(ROAST[G.roast][0],592,219);
 x.fillText(G.dir>0?'↻ clockwise':'↺ reversed',575,245);if(G.decaf){x.fillStyle='#c8e8ff';x.fillText('💤 Decaf: no actions',575,270)}
 // your hand
 const h=G.P[0].hand,myTurn=G.cur===0&&G.state==='play';h.forEach((c,i)=>{const [hx,hy]=handPos(i,h.length);if(G.flys.some(f=>f.c===c&&f.t<1))return;const can=myTurn&&canPlay(c)&&(!G.drawn||c===G.drawn);card(c,hx,hy-(can?14:0)-(G.sel===i?6:0),CW,CH,true,{glow:can})});
 // flying cards
 for(const f of G.flys){if(f.t<0)continue;const e=1-Math.pow(1-f.t,3);card(f.c,f.x0+(f.x1-f.x0)*e,f.y0+(f.y1-f.y0)*e-Math.sin(e*Math.PI)*30,CW,CH,f.face,{rot:(1-e)*.6})}
 // bubbles
 for(const b of G.bub){x.globalAlpha=Math.min(1,b.l*2);x.font='bold 15px Georgia';const w=x.measureText(b.s).width+24;x.fillStyle='#fff';rr(b.x-w/2,b.y-16,w,30,14);x.fill();x.fillStyle='#3a1424';x.textAlign='center';x.fillText(b.s,b.x,b.y+5);x.globalAlpha=1}
 // message + controls
 x.fillStyle='rgba(0,0,0,.45)';rr(150,352,600,30,10);x.fill();x.fillStyle='#fff';x.font='14px Georgia';x.textAlign='center';x.fillText(G.msg.slice(0,95),450,372);
 if(myTurn&&!G.drawn)button('draw',20,330,110,40,'🂠 Draw',humanDraw,{fs:15});if(myTurn&&G.drawn)button('pass',20,330,110,40,'Pass ▶',pass,{fs:15});
 const me=G.P[0];if(me.hand.length<=2&&!me.called&&G.state==='play'){const pulse=1+Math.sin(t*8)*.05;x.save();x.translate(820,370);x.scale(pulse,pulse);x.restore();button('coffee',750,320,130,56,'☕ COFFEE.',callCoffee,{fs:20,bg:'#c0406a',ac:'#ffe08a',fg:'#fff'})}
 if(G.catchable>0&&G.P[G.catchable].hand.length===1&&!G.P[G.catchable].called)button('catch',750,260,130,44,'🫵 Catch.',catchAI,{fs:16,bg:'#3e6e2a',ac:'#ffe08a'});
 button('menu',20,280,110,32,'☰ Menu',()=>G.state='title',{fs:13});
 x.fillStyle='#ffd0a8';x.font='12px Georgia';x.textAlign='left';x.fillText('🏆 '+S.wins+' wins · 🔥 streak '+S.streak+(DEMO()?' · demo round '+G.demoRounds+'/3':''),20,26);
 if(G.state==='choose'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='bold 24px Georgia';x.textAlign='center';x.fillText('Pick a roast',450,200);ROAST.forEach((r,k)=>button('r'+k,210+k*125,230,115,70,r[0],()=>{G.state='play';play(0,G.pendingC,k)},{bg:r[1],fg:k===1?'#fff':'#3a1e0e',ac:r[2],fs:16}))}
 x.textAlign='left'}
function drawTitle(){table();x.textAlign='center';x.fillStyle='#ffe08a';x.font='bold 52px Georgia';x.fillText('☕ COFFEE.',450,90);x.fillStyle='#ffd0e8';x.font='20px Georgia';x.fillText('The Coffeebreak Card Game',450,122);
 const demoC=[{r:0,v:'7'},{r:1,v:'dbl'},{r:2,v:'refill'},{r:3,v:'spill'},{r:4,v:'mega'},{r:4,v:'choice'}];demoC.forEach((c,i)=>card(c,200+i*100,215+Math.sin(t*2+i)*5,70,100,true,{rot:(i-2.5)*.08}));
 x.fillStyle='#ffe9c7';x.font='16px Georgia';x.textAlign='center';x.fillText('Opponents:',450,312);[1,2,3].forEach(n=>button('o'+n,330+(n-1)*85,322,75,36,(DEMO()&&n>1?'🔒':'')+n+' AI',()=>{if(DEMO()&&n>1)return demoEnd('The demo is 1-on-1 vs Bella the Barista. Get the full game to play 2 or 3 café characters at once.');G.nOpp=n},{sel:G.nOpp===n,fs:14}));
 x.fillStyle='#ffe9c7';x.font='13px Georgia';x.fillText([1,2,3].slice(0,G.nOpp).map(k=>{const c=CHARS[k===1?0:k===2?1:k===3?2:3];return c.e+' '+c.n}).join('   ·   '),450,380);
 button('play',330,396,240,52,'▶ Deal the cards',()=>{if(DEMO())G.nOpp=1;newRound()},{fs:20});button('rules',330,458,115,38,'📜 Rules',()=>G.state='rules',{fs:14});button('st',455,458,115,38,'🏆 Stats',()=>G.state='stats',{fs:14});skull(60,540,2);rose(840,540,2);x.textAlign='left'}
const RULES=['Everyone gets 7 cards. Match the top card by ROAST (colour) or by NUMBER / ACTION.','Can\'t play? Draw 1. If it fits you may play it, otherwise your turn passes.','☕ When you\'re down to 1 card, tap the big COFFEE. button before the next player plays — or get caught and draw 2. You can catch café characters too.','⊘ Spill — the next player is skipped.   ⇄ Refill — reverse direction (with 2 players: go again).','+2 Double Shot — next player draws 2 and misses their turn.','Zz Decaf — the next player can only play number cups (no actions, no wilds).','★ Barista\'s Choice — wild, pick the roast.   +4 Mega Brew — wild, pick the roast, next player draws 4 and misses a turn.','First to empty their hand wins the round. Wins and win streaks are saved.'];
function drawRules(){table();x.fillStyle='#ffe08a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText('📜 How to play COFFEE.',450,50);x.textAlign='left';x.fillStyle='#ffe9c7';x.font='15px Georgia';let y=90;RULES.forEach(r=>{y=wrapT('• '+r,70,y,560,20)+6});
 [{r:1,v:'spill'},{r:2,v:'refill'},{r:3,v:'dbl'},{r:0,v:'decaf'},{r:4,v:'choice'},{r:4,v:'mega'}].forEach((c,i)=>card(c,690+(i%2)*90,110+Math.floor(i/2)*120,62,90,true));button('bk',360,520,180,40,'◀ Back',()=>G.state='title',{fs:15})}
function drawStats(){table();x.fillStyle='#ffe08a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText('🏆 Your café record',450,80);x.fillStyle='#ffe9c7';x.font='20px Georgia';['Wins: '+S.wins,'Losses: '+S.losses,'Rounds played: '+S.rounds,'Current win streak: 🔥 '+S.streak,'Best streak: '+S.best].forEach((s,i)=>x.fillText(s,450,150+i*42));button('bk',360,420,180,40,'◀ Back',()=>G.state='title',{fs:15});x.textAlign='left'}
function drawEnd(){drawPlay();x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,0,W,H);const win=G.winner===0;x.textAlign='center';x.fillStyle=win?'#ffe08a':'#ffd0e8';x.font='bold 40px Georgia';x.fillText(win?'☕ You win the round.':G.P[G.winner].n+' wins.',450,200);
 if(win)for(let i=0;i<14;i++)emo(['☕','💖','✨','🍩'][i%4],450+Math.cos(t*2+i)*220,260+Math.sin(t*3+i*1.7)*90,26);x.fillStyle='#fff';x.font='18px Georgia';x.fillText('Wins '+S.wins+' · Losses '+S.losses+' · Streak 🔥 '+S.streak+' · Best '+S.best,450,250);
 button('again',300,300,300,52,DEMO()&&G.demoRounds>=3?'Get the full game ☕':'▶ Next round',newRound,{fs:20});button('menu2',375,365,150,38,'☰ Menu',()=>G.state='title',{fs:14});x.textAlign='left'}
function draw(){x.clearRect(0,0,W,H);x.textAlign='left';if(G.state==='title')drawTitle();else if(G.state==='rules')drawRules();else if(G.state==='stats')drawStats();else if(G.state==='end')drawEnd();else drawPlay()}
bindInput({down(p){if(G.state!=='play'||G.cur!==0)return;const h=G.P[0].hand;for(let i=h.length-1;i>=0;i--){const [hx,hy]=handPos(i,h.length);const can=canPlay(h[i]);const yy=hy-(can?14:0);if(Math.abs(p.x-hx)<CW/2&&Math.abs(p.y-yy)<CH/2){humanPlay(h[i]);return}}if(Math.abs(p.x-395)<CW/2&&Math.abs(p.y-250)<CH/2)humanDraw()},move(p){G.sel=-1;if(G.state!=='play')return;const h=G.P[0].hand;for(let i=h.length-1;i>=0;i--){const [hx,hy]=handPos(i,h.length);if(Math.abs(p.x-hx)<CW/2&&Math.abs(p.y-hy)<CH/2){G.sel=i;return}}}});
addEventListener('keydown',e=>{if(e.code==='KeyC'&&G.state==='play')callCoffee();if(e.code==='KeyD')humanDraw()});
window.CF={G,S,newRound,play,humanPlay,humanDraw,pass,callCoffee,catchAI,canPlay,aiTurn,mkDeck};saveS();startLoop();
