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
// ===== Coffeebreak After Dark: Strip Poker (18+, suggestive only, no nudity) =====
const DEMO=!!window.DEMO,SK=DEMO?'pokerDemo':'pokerSave';
let S={unlocked:1,wins:0,losses:0,hands:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:localStorage.getItem('adGate18')==='1'?'title':'gate',score:0,level:0};window.G=G;
const CH=[
{n:'Scarlett Rose',tag:'Burlesque singer',f:1,skin:'#f1c7a8',hair:'#b3122e',long:1,ling:'#d4143c',items:[['boa','Feather boa','#ff6fa8'],['gloves','Satin gloves','#2a0a14'],['heels','Red heels','#c8102e'],['stockings','Silk stockings','rgba(30,10,20,.55)'],['dress','Sequin gown','#9e0f2a']],
 L:{hi:'Well hello, darling. Shall we make this interesting?',win:['Read you like sheet music, sweetie.','Mmm, lucky me.','Encore!'],lose:['Oh, you are good.','Beginner\'s luck, surely?','Hmm, I felt that one.'],strip:['Fine, the boa goes. You owe me a drink.','Gloves off. Literally.','There go my heels. Now I\'m your height.','Stockings? Oh, you cheeky thing.','The gown... alright. Eyes up here, gorgeous.'],end:'Down to my lace and out of chips. Well played, darling. Same time tomorrow? 💋'}},
{n:'Jax Rivers',tag:'Midnight bartender',f:0,skin:'#c68b5f',hair:'#1a1210',long:0,ling:'#1f1f2e',items:[['bowtie','Bow tie','#d4143c'],['waistcoat','Waistcoat','#2a2030'],['shoes','Dress shoes','#120a0a'],['shirt','Crisp shirt','#f4f0ea'],['trousers','Trousers','#1a1a24']],
 L:{hi:'What are we drinking? Oh, cards. Even better.',win:['House always wins, babe.','Shaken, not stirred.','Tip jar\'s over there.'],lose:['Alright, alright.','You\'re trouble, aren\'t you?','Pour me something strong.'],strip:['Bow tie\'s off. Things just got casual.','Waistcoat gone. Getting warm in here.','Shoes off. Comfy now.','There goes the shirt. Don\'t stare... okay, stare a little.','Trousers? You play dirty. I like it.'],end:'Boxers and an empty tip jar. You win. Next round\'s on me. 😉'}},
{n:'Luna Noir',tag:'Pink goth witch',f:1,skin:'#f6e2e6',hair:'#16101e',long:1,ling:'#ff5fa2',items:[['tophat','Top hat','#120a14'],['fishgloves','Fishnet gloves','rgba(20,10,20,.7)'],['boots','Platform boots','#1a0a14'],['skirt','Tutu skirt','#ff8fc0'],['corset','Corset top','#2a0a1e']],
 L:{hi:'The cards whispered you\'d come. Sit, mortal.',win:['The spirits favour me.','Hexed.','Mwah-ha-ha. Sorry. Mwah.'],lose:['Curses!','You\'ve bewitched the deck.','The moon was in the wrong house.'],strip:['My hat! My power!','Fishnets off. Less mysterious now.','Boots gone. I lose four inches.','The tutu goes. Sigh.','Corset off. Thank goodness, I can breathe.'],end:'Only my lace remains. You\'ve broken my spell. Come haunt me again. 🖤'}},
{n:'Blaze Carter',tag:'Off-duty firefighter',f:0,skin:'#e8b48e',hair:'#7a4a1a',long:0,ling:'#c8102e',items:[['helmet','Fire helmet','#e8c020'],['jacket','Turnout coat','#c8a040'],['boots','Work boots','#1a1410'],['tshirt','Tight T-shirt','#2a3a5a'],['trousers','Cargo pants','#3a3a2a']],
 L:{hi:'Heard things get hot at this table. I\'m qualified.',win:['Rescued that pot.','Too hot to handle?','Hose-ed you. Sorry.'],lose:['Ouch. Burn.','You\'re on fire tonight.','Call it in, I\'m down.'],strip:['Helmet off. Safety third.','Coat\'s gone. It\'s a sauna in here.','Boots off, toes out.','T-shirt? For you, sure.','Pants too?! Calendar shoot energy.'],end:'Down to my undies and no chips left. You put out my fire. 🔥'}}];
const ZZ={stockings:1,heels:2,shoes:2,boots:2,trousers:2,skirt:3,shirt:3,tshirt:3,dress:4,corset:4,waistcoat:5,jacket:6,gloves:7,fishgloves:7,boa:8,bowtie:8,tophat:9,helmet:9};
const PI=[['🧢','Cap'],['🧥','Jacket'],['👟','Sneakers'],['🧦','Socks'],['👕','Top'],['👖','Jeans']];
let opp=0,op=null,me=null,deck=[],pot=0,bet=0,toCall=0,sel=[],msg='',say='',sayT=0,raised=false,fade=null,showAI=false,demoHands=0;
const SUIT=['♠','♥','♦','♣'],RN={11:'J',12:'Q',13:'K',14:'A'};
function newDeck(){deck=[];for(let s=0;s<4;s++)for(let r=2;r<=15-1;r++)deck.push({r,s});for(let i=deck.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[deck[i],deck[j]]=[deck[j],deck[i]]}}
function ev(h){const rs=h.map(c=>c.r).sort((a,b)=>b-a),cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);const g=Object.entries(cnt).map(([r,n])=>[n,+r]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);const fl=h.every(c=>c.s===h[0].s),u=[...new Set(rs)];let st=0;if(u.length===5){if(u[0]-u[4]===4)st=u[0];else if(u.join()==='14,5,4,3,2')st=5}
 const k=g.map(z=>z[1]);if(st&&fl)return[8,st];if(g[0][0]===4)return[7,...k];if(g[0][0]===3&&g[1][0]===2)return[6,...k];if(fl)return[5,...rs];if(st)return[4,st];if(g[0][0]===3)return[3,...k];if(g[0][0]===2&&g[1][0]===2)return[2,...k];if(g[0][0]===2)return[1,...k];return[0,...rs]}
const HN=['High card','One pair','Two pair','Three of a kind','Straight','Flush','Full house','Four of a kind','Straight flush'];
const hname=h=>{const e=ev(h);return e[0]===8&&e[1]===14?'Royal flush!':HN[e[0]]};
function cmp(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return(a[i]||0)-(b[i]||0)}return 0}
function strength(h){const e=ev(h);if(e[0]===0)return(e[1]-2)/12*.25;if(e[0]===1)return .3+(e[1]-2)/12*.22;return Math.min(1,.55+e[0]*.06)}
function aiDiscard(h){const e=ev(h);if(e[0]>=4&&e[0]!==7)return[];const cnt={};h.forEach(c=>cnt[c.r]=(cnt[c.r]||0)+1);
 if(e[0]>=1){return h.map((c,i)=>cnt[c.r]>1?-1:i).filter(i=>i>=0).slice(0,3)}
 const sc=[0,0,0,0];h.forEach(c=>sc[c.s]++);const fs=sc.indexOf(4);if(fs>=0)return h.map((c,i)=>c.s!==fs?i:-1).filter(i=>i>=0);
 const ord=h.map((c,i)=>i).sort((a,b)=>h[b].r-h[a].r);if(h[ord[0]].r===14)return ord.slice(1);return ord.slice(2)}
function sayL(s){say=s;sayT=4.5}
function pick(a){return a[Math.random()*a.length|0]}
function startMatch(i){opp=i;const c=CH[i];op={c,chips:100,left:c.items.length};me={chips:100,left:6};sayL(c.L.hi);G.state='table';demoHands=0;newHand()}
function canAnte(p){return p.chips>=10}
function checkStrip(){for(const who of[me,op]){if(!canAnte(who)){if(who.left>0){who.left--;who.chips+=100;if(who===op){const idx=op.c.items.length-1-op.left;fade={k:op.c.items[idx][0],t:0};sayL(op.c.L.strip[idx]);G.level++;if(DEMO&&op.left<=3){setTimeout(()=>window.demoEnd&&window.demoEnd('Scarlett just lost her gloves... The full game lets you play the whole match against all 4 flirty opponents: Scarlett, Jax, Luna and Blaze.'),2500)}}else{msg='You take off your '+PI[5-me.left][1].toLowerCase()+'. +100 chips.'}}else{G.state=who===op?'win':'lose';if(who===op){S.wins++;S.unlocked=Math.max(S.unlocked,Math.min(4,opp+2));G.score+=100}else S.losses++;save();return true}}}return false}
function newHand(){if(checkStrip())return;if(DEMO&&++demoHands>10){window.demoEnd&&window.demoEnd('That was 10 hands of the free demo! The full game has the whole match and all 4 opponents.');return}
 newDeck();op.h=deck.splice(0,5);me.h=deck.splice(0,5);me.chips-=10;op.chips-=10;pot=20;sel=[];raised=false;showAI=false;toCall=0;S.hands++;save();G.state='table';G.phase='bet1';if(!msg)msg='Your move: check or bet.'}
function maxBet(){return Math.min(me.chips,op.chips)}
function aiRespond(b){const s=strength(op.h)+(Math.random()-.5)*.15,bl=Math.random()<.12;
 if(b===0){if(s>.5||bl){const a=Math.min(s>.7?50:20,maxBet());if(a>0){op.chips-=a;pot+=a;toCall=a;msg=op.c.n.split(' ')[0]+' bets '+a+'. Call or fold?';G.phase=G.phase==='bet1'?'call1':'call2';return}}msg=op.c.n.split(' ')[0]+' checks.';advance();return}
 if(s<.15+b/300&&!bl){msg=op.c.n.split(' ')[0]+' folds! You win '+pot+' chips.';me.chips+=pot;pot=0;sayL(pick(op.c.L.lose));endHand();return}
 op.chips-=b;pot+=b;if(!raised&&s>.62&&maxBet()>=20){raised=true;const a=Math.min(20,maxBet());op.chips-=a;pot+=a;toCall=a;msg=op.c.n.split(' ')[0]+' calls and raises '+a+'!';G.phase=G.phase==='bet1'?'call1':'call2';return}
 msg=op.c.n.split(' ')[0]+' calls.';advance()}
function pBet(b){if(b>maxBet())b=maxBet();me.chips-=b;pot+=b;aiRespond(b)}
function pCall(){const a=Math.min(toCall,me.chips);me.chips-=a;pot+=a;toCall=0;msg='You call.';advance()}
function pFold(){op.chips+=pot;pot=0;msg='You fold. '+op.c.n.split(' ')[0]+' takes the pot.';sayL(pick(op.c.L.win));endHand()}
function advance(){if(G.phase==='bet1'||G.phase==='call1'){G.phase='draw';msg+=' Tap cards to swap (up to 3, or 4 with an ace).'}else showdown()}
function doDraw(){sel.sort((a,b)=>a-b);sel.forEach(i=>me.h[i]=deck.pop());sel=[];const d=aiDiscard(op.h);d.forEach(i=>op.h[i]=deck.pop());msg=op.c.n.split(' ')[0]+' swaps '+(d.length||'no')+' card'+(d.length===1?'':'s')+'. Bet again?';G.phase='bet2';tone(600,.08,.05)}
function showdown(){showAI=true;const c=cmp(ev(me.h),ev(op.h));if(c>0){me.chips+=pot;msg='You win with '+hname(me.h)+'! +'+pot;sayL(pick(op.c.L.lose));fan()}else if(c<0){op.chips+=pot;msg=op.c.n.split(' ')[0]+' wins with '+hname(op.h)+'.';sayL(pick(op.c.L.win))}else{me.chips+=pot/2;op.chips+=pot/2;msg='Split pot!'}pot=0;endHand()}
function endHand(){G.phase='done';showAI=true}
let AC=null;function tone(f,d,v){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function fan(){[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.2,.06),i*100))}
// ---- drawing ----
function card(X,Y,w,h,c,up,hi){x.save();if(hi){x.shadowColor='#ff4f9a';x.shadowBlur=16}x.fillStyle=up?'#fffaf4':'#7a0f3a';rr(X,Y,w,h,8);x.fill();x.restore();x.strokeStyle=hi?'#ff4f9a':'#e8a0b0';x.lineWidth=2;rr(X,Y,w,h,8);x.stroke();
 if(!up){x.strokeStyle='rgba(255,180,210,.5)';rr(X+6,Y+6,w-12,h-12,5);x.stroke();T('CB',X+w/2,Y+h/2+7,w*.28,'#ffc6dc','center');return}
 const col=c.s===1||c.s===2?'#c8102e':'#1a1020',rn=RN[c.r]||c.r;T(rn,X+7,Y+w*.3,w*.25,col);T(SUIT[c.s],X+7,Y+w*.55,w*.2,col,'left','');T(SUIT[c.s],X+w/2,Y+h*.68,w*.5,col,'center','')}
function line(a,b,c2,d,w,col){x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.beginPath();x.moveTo(a,b);x.lineTo(c2,d);x.stroke()}
function poly(pts,col){x.fillStyle=col;x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill()}
function drawItem(k,col,f){switch(k){
 case'stockings':line(-22,250,-26,405,24,col);line(22,250,26,405,24,col);break;
 case'heels':case'shoes':case'boots':if(k==='boots'){line(-24,340,-26,405,30,col);line(24,340,26,405,30,col)}poly([[-44,404],[-12,404],[-12,424],[-46,424]],col);poly([[12,404],[44,404],[46,424],[12,424]],col);break;
 case'trousers':poly(f?[[-50,225],[50,225],[44,410],[6,410],[0,270],[-6,410],[-44,410]]:[[-44,215],[44,215],[46,410],[6,410],[0,270],[-6,410],[-46,410]],col);break;
 case'skirt':poly([[-34,205],[34,205],[80,300],[-80,300]],col);x.fillStyle='rgba(255,255,255,.25)';for(let i=-70;i<70;i+=14){x.beginPath();x.arc(i,296,8,0,7);x.fill()}break;
 case'shirt':case'tshirt':poly([[-58,92],[58,92],[44,232],[-44,232]],col);line(-56,100,-66,k==='shirt'?245:150,22,col);line(56,100,66,k==='shirt'?245:150,22,col);if(k==='shirt'){line(0,95,0,230,1.5,'#bbb')}break;
 case'dress':poly([[-40,98],[40,98],[34,190],[70,340],[-70,340],[-34,190]],col);x.fillStyle='rgba(255,220,230,.5)';for(let i=0;i<18;i++)x.fillRect(((i*37)%120)-60,110+(i*53)%220,3,3);break;
 case'corset':poly([[-44,108],[44,108],[34,212],[-34,212]],col);x.strokeStyle='#ff8fc0';x.lineWidth=1.5;for(let y=118;y<206;y+=12){x.beginPath();x.moveTo(-6,y);x.lineTo(6,y+8);x.moveTo(6,y);x.lineTo(-6,y+8);x.stroke()}break;
 case'waistcoat':poly([[-48,100],[-8,100],[0,150],[8,100],[48,100],[42,225],[-42,225]],col);break;
 case'jacket':poly([[-62,90],[62,90],[52,250],[8,250],[0,120],[-8,250],[-52,250]],col);line(-60,98,-70,245,26,col);line(60,98,70,245,26,col);break;
 case'gloves':case'fishgloves':line(-60,180,-66,250,17,col);line(60,180,66,250,17,col);break;
 case'boa':x.strokeStyle=col;x.lineWidth=16;x.setLineDash([4,3]);x.beginPath();x.ellipse(0,98,50,14,0,0,7);x.moveTo(-34,104);x.quadraticCurveTo(-44,150,-30,200);x.moveTo(34,104);x.quadraticCurveTo(44,150,30,200);x.stroke();x.setLineDash([]);break;
 case'bowtie':poly([[0,88],[-16,80],[-16,96]],col);poly([[0,88],[16,80],[16,96]],col);break;
 case'tophat':x.fillStyle=col;x.fillRect(-40,4,80,8);x.fillRect(-24,-40,48,46);x.fillStyle='#ff4f9a';x.fillRect(-24,-4,48,6);break;
 case'helmet':x.fillStyle=col;x.beginPath();x.ellipse(0,14,36,26,0,Math.PI,0);x.fill();x.fillRect(-46,12,92,8);break}}
function drawChar(ch,X,Y,s,left){const f=ch.f;x.save();x.translate(X,Y+Math.sin(t*1.6)*2);x.scale(s,s);
 if(ch.long){x.fillStyle=ch.hair;rr(-38,10,76,150,30);x.fill()}
 const sk=ch.skin;line(-22,235,-26,410,f?24:30,sk);line(22,235,26,410,f?24:30,sk);
 poly(f?[[-46,92],[46,92],[30,190],[50,240],[-50,240],[-30,190]]:[[-58,90],[58,90],[42,200],[42,240],[-42,240],[-42,200]],sk);
 line(f?-46:-56,98,f?-62:-66,250,f?14:18,sk);line(f?46:56,98,f?62:66,250,f?14:18,sk);x.fillStyle=sk;x.fillRect(-9,66,18,28);
 // lingerie base (always on)
 const lc=ch.ling;if(f){x.fillStyle=lc;x.beginPath();x.ellipse(-17,128,17,13,0,0,7);x.ellipse(17,128,17,13,0,0,7);x.fill();x.fillRect(-36,126,72,5);poly([[-46,220],[46,220],[14,252],[-14,252]],lc);x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1;x.setLineDash([2,2]);x.beginPath();x.moveTo(-34,128);x.lineTo(34,128);x.moveTo(-44,222);x.lineTo(44,222);x.stroke();x.setLineDash([])}
 else{poly([[-44,215],[44,215],[44,262],[4,262],[0,248],[-4,262],[-44,262]],lc);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(-44,215,88,5)}
 const n=ch.items.length,on=ch.items.slice(ch.items.length-left).map(a=>a);if(fade&&fade.t<1.2){const it=ch.items.find(a=>a[0]===fade.k);if(it)on.push([...it,1-fade.t/1.2])}
 on.sort((a,b)=>ZZ[a[0]]-ZZ[b[0]]).forEach(a=>{x.globalAlpha=a[3]===undefined?1:Math.max(0,a[3]);drawItem(a[0],a[2],f);x.globalAlpha=1});
 // head
 x.fillStyle=sk;x.beginPath();x.ellipse(0,40,30,36,0,0,7);x.fill();x.fillStyle=ch.hair;x.beginPath();x.ellipse(0,18,32,20,0,Math.PI,0);x.fill();if(!ch.long){x.fillRect(-30,14,8,18);x.fillRect(22,14,8,18)}
 const wk=sayT>0&&Math.sin(t*3)>.9;x.fillStyle='#1a0a10';x.beginPath();x.ellipse(-11,40,4,wk?1:5,0,0,7);x.ellipse(11,40,4,5,0,0,7);x.fill();if(f){line(-15,35,-18,32,2,'#1a0a10');line(15,35,18,32,2,'#1a0a10')}
 x.fillStyle='rgba(255,90,120,.35)';x.beginPath();x.arc(-18,52,6,0,7);x.arc(18,52,6,0,7);x.fill();x.strokeStyle=f?'#c8103e':'#7a3020';x.lineWidth=3;x.beginPath();x.arc(0,54,8,.2,Math.PI-.2);x.stroke();
 if(ch.items.some(a=>a[0]==='tophat'||a[0]==='helmet')){const it=ch.items.find(a=>a[0]==='tophat'||a[0]==='helmet');const idx=ch.items.indexOf(it);if(idx>=ch.items.length-left)drawItem(it[0],it[2])}
 x.restore()}
function stage(){const g=x.createLinearGradient(0,0,330,0);g.addColorStop(0,'#3a0618');g.addColorStop(1,'#5a0a26');x.fillStyle=g;x.fillRect(0,0,330,600);x.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<330;i+=22)x.fillRect(i,0,10,600);const r=x.createRadialGradient(165,300,20,165,300,260);r.addColorStop(0,'rgba(255,200,230,.25)');r.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=r;x.fillRect(0,0,330,600)}
function bgT(){const g=x.createRadialGradient(620,330,40,620,330,420);g.addColorStop(0,'#4a0d24');g.addColorStop(1,'#14040a');x.fillStyle=g;x.fillRect(330,0,570,600)}
function bubble(s){x.font='italic 15px Georgia';x.fillStyle='rgba(255,240,246,.95)';rr(340,18,380,78,16);x.fill();poly([[340,50],[318,64],[344,70]],'rgba(255,240,246,.95)');x.fillStyle='#4a0a24';x.textAlign='left';wrapT('“'+s+'”',354,44,352,19)}
function drawGate(){x.fillStyle='#0a0206';x.fillRect(0,0,900,600);x.save();x.shadowColor='#ff2a6a';x.shadowBlur=30;T('18+',450,150,90,'#ff4f9a','center');x.restore();T('Coffeebreak After Dark',450,210,30,'#ffd6e8','center');
 x.fillStyle='#ffd6e8';x.font='17px Georgia';x.textAlign='center';wrapT('This game has suggestive adult themes: flirty characters strip down to their lingerie. There is no nudity and no sexual content. You must be 18 or older to play.',450,262,600,24);
 button('yes',250,380,190,58,'I am 18+ · Enter',()=>{localStorage.setItem('adGate18','1');G.state='title'},{fs:18,bg:'#ff4f9a',fg:'#fff',ac:'#fff'});button('no',460,380,190,58,'I am under 18',()=>{G.state='denied'},{fs:18})}
function drawTitle(){bgT();x.fillStyle='#14040a';x.fillRect(0,0,900,600);x.save();x.shadowColor='#ff4f9a';x.shadowBlur=24;T('Coffeebreak After Dark',450,64,40,'#ff7ab0','center');x.restore();T('♠ ♥ Strip Poker ♦ ♣',450,98,22,'#ffd6e8','center');
 CH.forEach((c,i)=>{const X=30+i*215,lk=(DEMO&&i>0)||(!DEMO&&i>=S.unlocked);x.fillStyle='rgba(60,10,30,.9)';rr(X,120,200,380,16);x.fill();x.strokeStyle=lk?'#553344':'#ff4f9a';x.lineWidth=2;x.stroke();x.save();x.beginPath();x.rect(X,120,200,300);x.clip();drawChar(c,X+100,150,.6,c.items.length);x.restore();if(lk){x.fillStyle='rgba(10,2,6,.7)';x.fillRect(X,120,200,300);emo('🔒',X+100,260,46)}
  T(c.n,X+100,446,18,'#fff','center');T(c.tag,X+100,468,13,'#ffb0cc','center','');button('p'+i,X+30,476,140,32,lk?(DEMO?'Full game':'Beat previous'):'Play',()=>{if(lk){if(DEMO&&window.demoEnd)window.demoEnd('Jax, Luna and Blaze are waiting in the full game!');return}startMatch(i)},{fs:14,dis:false,bg:lk?'#2a0a18':'#ff4f9a',fg:'#fff'})});
 x.fillStyle='#ffd6e8';x.font='13px Georgia';x.textAlign='center';wrapT('Five-card draw. Ante 10. Run out of chips and you lose a piece of clothing for 100 more. Strip your opponent down to their lingerie to win and unlock the next player. Wins '+S.wins+' · Losses '+S.losses,450,540,820,18);x.textAlign='left'}
function drawTable(){stage();drawChar(op.c,165,96,1.08,op.left);bgT();x.fillStyle='rgba(20,4,10,.75)';rr(10,10,310,46,12);x.fill();T(op.c.n,22,38,18,'#fff');T('💰 '+op.chips,306,38,16,'#ffd24a','right');
 x.fillStyle='rgba(20,4,10,.75)';rr(10,530,310,32,10);x.fill();T('Wearing: '+op.left+' / '+op.c.items.length+' items + lingerie',165,551,13,'#ffd6e8','center','');
 if(sayT>0)bubble(say);
 for(let i=0;i<5;i++)card(400+i*68,110,60,86,op.h[i],showAI,false);if(showAI)T(hname(op.h),570,218,15,'#ffb0cc','center');
 T('POT  '+pot,620,248,22,'#ffd24a','center');x.fillStyle='#ffe9ef';x.font='15px Georgia';x.textAlign='center';wrapT(msg,620,272,520,18);x.textAlign='left';
 for(let i=0;i<5;i++){const s=sel.includes(i),Y=300-(s?18:0);card(372+i*100,Y,88,124,me.h[i],true,s);if(s)T('SWAP',416+i*100,Y-6,12,'#ff4f9a','center');BTN['c'+i]={x:372+i*100,y:Y,w:88,h:124,fn:()=>{if(G.phase!=='draw')return;const k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else{const ace=me.h.some((c,j)=>c.r===14&&!sel.includes(j)&&j!==i);if(sel.length<3||(sel.length<4&&ace))sel.push(i)}tone(800,.04,.04)}}}
 T(hname(me.h),620,456,16,'#ffd6e8','center');const ph=G.phase,mb=maxBet();
 if(ph==='bet1'||ph==='bet2'){button('chk',380,472,150,48,'Check',()=>aiRespond(0),{fs:17});button('b20',545,472,150,48,'Bet '+Math.min(20,mb),()=>pBet(20),{fs:17,dis:mb<1,bg:'#ff4f9a',fg:'#fff'});button('b50',710,472,150,48,'Bet '+Math.min(50,mb),()=>pBet(50),{fs:17,dis:mb<1,bg:'#c8102e',fg:'#fff'})}
 else if(ph==='call1'||ph==='call2'){button('call',430,472,190,48,'Call '+Math.min(toCall,me.chips),pCall,{fs:17,bg:'#ff4f9a',fg:'#fff'});button('fold',640,472,190,48,'Fold',pFold,{fs:17})}
 else if(ph==='draw'){button('drw',480,472,280,48,sel.length?'Swap '+sel.length+' card'+(sel.length>1?'s':''):'Keep all (stand pat)',doDraw,{fs:17,bg:'#ff4f9a',fg:'#fff'})}
 else if(ph==='done'){button('nx',480,472,280,48,'Next hand ▶',()=>{msg='';newHand()},{fs:18,bg:'#ff4f9a',fg:'#fff'})}
 x.fillStyle='rgba(20,4,10,.8)';rr(340,530,550,46,12);x.fill();T('You 💰 '+me.chips,356,559,17,'#ffd24a');PI.forEach((p,i)=>{x.globalAlpha=i<6-me.left?.2:1;emo(p[0],560+i*48,553,26);x.globalAlpha=1});
 button('q',830,110,60,30,'Quit',()=>{G.state='title'},{fs:12})}
function drawEnd(w){stage();drawChar(op.c,165,96,1.08,0);bgT();x.save();x.shadowColor='#ff4f9a';x.shadowBlur=24;T(w?'You win! 💋':'You lose!',620,140,46,w?'#ffd24a':'#ff7ab0','center');x.restore();
 x.fillStyle='#ffe9ef';x.font='italic 18px Georgia';x.textAlign='center';wrapT(w?'“'+op.c.L.end+'”':'You\'re down to your undies and out of chips. '+op.c.n.split(' ')[0]+' takes the night!',620,200,460,26);
 if(w&&opp<3&&!DEMO)T('🔓 '+CH[opp+1].n+' unlocked!',620,330,20,'#ffd24a','center');for(let i=0;i<10&&w;i++)emo('💖',360+((i*97+t*60)%520),560-((t*80+i*55)%420),20);
 button('again',450,400,160,52,'Rematch',()=>startMatch(opp),{fs:18,bg:'#ff4f9a',fg:'#fff'});button('menu',630,400,160,52,'Opponents',()=>{G.state='title'},{fs:18})}
function update(dt){if(sayT>0)sayT-=dt;if(fade){fade.t+=dt;if(fade.t>1.3)fade=null}}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='gate')drawGate();else if(s==='denied'){x.fillStyle='#0a0206';x.fillRect(0,0,900,600);T('Sorry! This one is for grown-ups only.',450,280,24,'#ffd6e8','center');T('Try the other Coffeebreak games at coffeebreaks.itch.io ❤️',450,320,17,'#ffb0cc','center','')}else if(s==='title')drawTitle();else if(s==='table')drawTable();else if(s==='win')drawEnd(1);else if(s==='lose')drawEnd(0);x.textAlign='left'}
bindInput({});window.PK={G,S,CH,startMatch,get op(){return op},get me(){return me},pBet,pCall,pFold,doDraw,newHand,ev,cmp,aiRespond,get sel(){return sel}};startLoop();
