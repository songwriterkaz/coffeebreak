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
// ---- Coffeebreak Chess: coffee beans (white side) vs marshmallows (black side) ----
const DEMO=()=>!!window.DEMO;
const VAL={p:100,n:320,b:330,r:500,q:900,k:0};
const PST_P=[0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0];
const PST_N=[-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50];
let B,turn,cast,ep,half,hist;
function reset(){B=Array(64).fill(null);const back='rnbqkbnr';for(let i=0;i<8;i++){B[i]='b'+back[i];B[8+i]='bp';B[48+i]='wp';B[56+i]='w'+back[i]}turn='w';cast={wK:1,wQ:1,bK:1,bQ:1};ep=-1;half=0;hist=[]}
const rc=i=>[i>>3,i&7],ix=(r,c)=>r*8+c,on=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
function attacked(sq,by,b=B){const [r,c]=rc(sq);const pd=by==='w'?1:-1;for(const dc of[-1,1]){const rr2=r+pd,cc=c+dc;if(on(rr2,cc)&&b[ix(rr2,cc)]===by+'p')return true}
 for(const [dr,dc] of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]){const a=r+dr,b2=c+dc;if(on(a,b2)&&b[ix(a,b2)]===by+'n')return true}
 for(const [dr,dc] of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let a=r+dr,b2=c+dc,d=1;while(on(a,b2)){const p=b[ix(a,b2)];if(p){if(p[0]===by){const t2=p[1];if(t2==='q'||(t2==='k'&&d===1)||(t2==='r'&&(dr===0||dc===0))||(t2==='b'&&dr&&dc))return true}break}a+=dr;b2+=dc;d++}}return false}
function pseudo(side){const mv=[];for(let i=0;i<64;i++){const p=B[i];if(!p||p[0]!==side)continue;const t2=p[1],[r,c]=rc(i),en=side==='w'?'b':'w';
 const add=(j,f)=>mv.push({f:i,t:j,p,cap:B[j],...f});
 if(t2==='p'){const d=side==='w'?-1:1,st=side==='w'?6:1,pr=side==='w'?0:7;if(on(r+d,c)&&!B[ix(r+d,c)]){if(r+d===pr)add(ix(r+d,c),{pro:'q'});else add(ix(r+d,c));if(r===st&&!B[ix(r+2*d,c)])add(ix(r+2*d,c),{dbl:1})}
  for(const dc of[-1,1]){if(!on(r+d,c+dc))continue;const j=ix(r+d,c+dc);if(B[j]&&B[j][0]===en){if(r+d===pr)add(j,{pro:'q'});else add(j)}else if(j===ep)add(j,{ep:1})}}
 else if(t2==='n'||t2==='k'){const D=t2==='n'?[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];for(const [dr,dc] of D){if(on(r+dr,c+dc)){const j=ix(r+dr,c+dc);if(!B[j]||B[j][0]===en)add(j)}}
  if(t2==='k'){const row=side==='w'?7:0;if(i===ix(row,4)&&!attacked(i,en)){if(cast[side+'K']&&!B[ix(row,5)]&&!B[ix(row,6)]&&B[ix(row,7)]===side+'r'&&!attacked(ix(row,5),en)&&!attacked(ix(row,6),en))add(ix(row,6),{cs:'K'});
   if(cast[side+'Q']&&!B[ix(row,3)]&&!B[ix(row,2)]&&!B[ix(row,1)]&&B[ix(row,0)]===side+'r'&&!attacked(ix(row,3),en)&&!attacked(ix(row,2),en))add(ix(row,2),{cs:'Q'})}}}
 else{const D=t2==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:t2==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];for(const [dr,dc] of D){let a=r+dr,b2=c+dc;while(on(a,b2)){const j=ix(a,b2);if(B[j]){if(B[j][0]===en)add(j);break}add(j);a+=dr;b2+=dc}}}}return mv}
function make(m){hist.push({B:B.slice(),turn,cast:{...cast},ep,half});B[m.t]=m.pro?m.p[0]+m.pro:m.p;B[m.f]=null;if(m.ep)B[m.t+(m.p[0]==='w'?8:-8)]=null;
 if(m.cs){const row=m.p[0]==='w'?7:0;if(m.cs==='K'){B[ix(row,5)]=B[ix(row,7)];B[ix(row,7)]=null}else{B[ix(row,3)]=B[ix(row,0)];B[ix(row,0)]=null}}
 if(m.p[1]==='k'){cast[m.p[0]+'K']=0;cast[m.p[0]+'Q']=0}[[56,'wQ'],[63,'wK'],[0,'bQ'],[7,'bK']].forEach(([s,k])=>{if(m.f===s||m.t===s)cast[k]=0});
 ep=m.dbl?(m.f+m.t)/2:-1;half=(m.p[1]==='p'||m.cap)?0:half+1;turn=turn==='w'?'b':'w'}
function undo(){const h=hist.pop();B=h.B;turn=h.turn;cast=h.cast;ep=h.ep;half=h.half}
function legal(side=turn){return pseudo(side).filter(m=>{make(m);const k=B.indexOf(side+'k');const ok=!attacked(k,side==='w'?'b':'w');undo();return ok})}
function inCheck(side=turn){return attacked(B.indexOf(side+'k'),side==='w'?'b':'w')}
function evalB(){let s=0;for(let i=0;i<64;i++){const p=B[i];if(!p)continue;const w=p[0]==='w',j=w?i:63-i;let v=VAL[p[1]]+(p[1]==='p'?PST_P[j]:p[1]==='n'?PST_N[j]:p[1]==='b'?PST_N[j]/2:0);s+=w?v:-v}return s}
function search(d,a,b2,side){const ms=legal(side);if(!ms.length)return inCheck(side)?(side==='w'?-1e6:1e6):0;if(d===0)return evalB();ms.sort((p,q)=>(q.cap?VAL[q.cap[1]]:0)-(p.cap?VAL[p.cap[1]]:0));
 if(side==='w'){let v=-1e9;for(const m of ms){make(m);v=Math.max(v,search(d-1,a,b2,'b'));undo();a=Math.max(a,v);if(a>=b2)break}return v}let v=1e9;for(const m of ms){make(m);v=Math.min(v,search(d-1,a,b2,'w'));undo();b2=Math.min(b2,v);if(a>=b2)break}return v}
function aiMove(){const side=turn,ms=legal(side);if(!ms.length)return;const dep=G.diff;let best=null,bv=side==='w'?-1e9:1e9;ms.sort(()=>Math.random()-.5);
 for(const m of ms){make(m);const v=search(dep-1,-1e9,1e9,turn)+(Math.random()-.5)*(dep===1?60:10);undo();if(side==='w'?v>bv:v<bv){bv=v;best=m}}doMove(best)}
const G={state:'title',mode:'ai',diff:2,score:0,level:+localStorage.chessW||0,sel:-1,moves:[],last:null,res:null,flip:false,mv:0,capW:[],capB:[]};window.G=G;
function newGame(mode){startMusic();reset();G.mode=mode;G.sel=-1;G.moves=[];G.last=null;G.res=null;G.mv=0;G.capW=[];G.capB=[];G.state='play';G.aiT=0}
function doMove(m){if(m.cap||m.ep){(m.p[0]==='w'?G.capW:G.capB).push(m.ep?(m.p[0]==='w'?'bp':'wp'):m.cap)}make(m);G.last=m;G.mv++;G.score=G.mv;const ms=legal();
 if(!ms.length){if(inCheck()){G.res=(turn==='w'?'🍡 Marshmallows':'🫘 Coffee beans')+' win by checkmate!';if(G.mode==='ai'&&turn==='b'){localStorage.chessW=G.level=(+localStorage.chessW||0)+1}}else G.res='Stalemate: a draw.';G.state='over'}
 else if(half>=100){G.res='Draw by the 50-move rule.';G.state='over'}else if(insuff()){G.res='Draw: not enough pieces to checkmate.';G.state='over'}
 if(DEMO()&&G.mv>=30&&G.state==='play'){G.state='demo';setTimeout(()=>demoEnd('That is the end of the free demo of <b>Coffeebreak Chess</b>! Full games, 2-player mode and harder bots are in the full game.'),600)}
 if(G.state==='play'&&G.mode==='ai'&&turn==='b')G.aiT=.5}
function insuff(){const p=B.filter(Boolean).filter(q=>q[1]!=='k');return !p.length||(p.length===1&&'nb'.includes(p[0][1]))}
const BX=40,BY=40,SZ=65;
function sqAt(p){const c2=Math.floor((p.x-BX)/SZ),r=Math.floor((p.y-BY)/SZ);if(c2<0||c2>7||r<0||r>7)return -1;return G.flip?ix(7-r,7-c2):ix(r,c2)}
function sqXY(i){const [r,c2]=rc(i);return G.flip?[BX+(7-c2)*SZ,BY+(7-r)*SZ]:[BX+c2*SZ,BY+r*SZ]}
bindInput({down(p){if(G.state!=='play')return;if(G.mode==='ai'&&turn==='b')return;const s=sqAt(p);if(s<0)return;const m=G.moves.find(q=>q.t===s);if(m){doMove(m);G.sel=-1;G.moves=[];if(G.mode==='2p'&&G.autoFlip)G.flip=turn==='b';return}
 if(B[s]&&B[s][0]===turn){G.sel=s;G.moves=legal().filter(q=>q.f===s)}else{G.sel=-1;G.moves=[]}}});
function update(dt){if(G.state==='play'&&G.mode==='ai'&&turn==='b'&&G.aiT>0){G.aiT-=dt;if(G.aiT<=0)aiMove()}}
function piece(p,X,Y,s){const w=p[0]==='w',t2=p[1],sc=s/65;x.save();x.translate(X,Y);x.scale(sc,sc);const ht={p:.7,n:.85,b:.9,r:.85,q:1,k:1.05}[t2];
 x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(0,24,22,6,0,0,7);x.fill();
 if(w){const g=x.createRadialGradient(-6,-8,2,0,0,26);g.addColorStop(0,'#b07848');g.addColorStop(1,'#4a2410');x.fillStyle=g;x.beginPath();x.ellipse(0,4,17*ht+2,22*ht,0,0,7);x.fill();x.strokeStyle='#2a1006';x.lineWidth=3;x.beginPath();x.moveTo(0,4-20*ht);x.bezierCurveTo(-6,0,6,6,0,4+20*ht);x.stroke()}
 else{x.fillStyle='#fff8f6';rr(-16*ht-2,-16*ht+4,32*ht+4,40*ht,10);x.fill();x.fillStyle='#f0d8de';x.beginPath();x.ellipse(0,-16*ht+6,16*ht+2,6,0,0,7);x.fill();x.strokeStyle='#d8b0b8';x.lineWidth=1.5;rr(-16*ht-2,-16*ht+4,32*ht+4,40*ht,10);x.stroke()}
 x.fillStyle=w?'#ffe9c7':'#3a1424';x.font='bold 26px serif';x.textAlign='center';x.textBaseline='middle';x.fillText({p:'♟',n:'♞',b:'♝',r:'♜',q:'♛',k:'♚'}[t2],0,6);
 if(t2==='k'||t2==='q'){x.fillStyle='#ffcf6a';x.beginPath();x.moveTo(-12,-22*ht);for(let i=0;i<5;i++){x.lineTo(-12+i*6,-22*ht-(i%2?4:10));x.lineTo(-9+i*6,-22*ht)}x.lineTo(12,-22*ht);x.closePath();x.fill();if(t2==='k')skull(0,-22*ht-14,1);else rose(0,-22*ht-13,1.2)}
 x.textBaseline='alphabetic';x.restore()}
function draw(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#2a1424');g.addColorStop(1,'#12060c');x.fillStyle=g;x.fillRect(0,0,W,H);
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 50px Georgia';x.fillText('♛ Coffeebreak Chess',W/2,110);x.fillStyle='#ffe9c7';x.font='19px Georgia';x.fillText('Coffee beans vs marshmallows, with gothic kings and queens. Full chess rules.',W/2,150);
  piece('wk',W/2-150,260,110);piece('bq',W/2+150,260,110);piece('wn',W/2-60,280,70);piece('bp',W/2+60,285,60);
  button('ai',W/2-130,360,260,50,'🤖 Play the Marshmallow bot',()=>newGame('ai'));button('pp',W/2-130,420,260,50,DEMO()?'👥 2 players (full game)':'👥 2 players',()=>newGame('2p'),{dis:DEMO()});
  [['Easy',1],['Normal',2],['Hard',3]].forEach(([n,d],i)=>button('d'+d,W/2-165+i*112,486,104,36,n+((DEMO()&&d===3)?' 🔒':''),()=>{if(DEMO()&&d===3)return;G.diff=d},{sel:G.diff===d,fs:15}));
  x.fillStyle='#ffcf6a';x.font='14px Georgia';x.fillText('Wins vs bot: '+G.level+(DEMO()?'   ·   Demo: 30 moves vs the bot':''),W/2,550);return}
 for(let i=0;i<64;i++){const [X,Y]=sqXY(i),[r,c2]=rc(i);x.fillStyle=(r+c2)%2?'#8a4a5a':'#f6dde3';x.fillRect(X,Y,SZ,SZ);
  if(G.last&&(G.last.f===i||G.last.t===i)){x.fillStyle='rgba(255,207,106,.35)';x.fillRect(X,Y,SZ,SZ)}if(i===G.sel){x.fillStyle='rgba(122,200,140,.45)';x.fillRect(X,Y,SZ,SZ)}}
 const kc=B.indexOf(turn+'k');if(G.state!=='title'&&inCheck()){const [X,Y]=sqXY(kc);x.fillStyle='rgba(255,60,80,.5)';x.fillRect(X,Y,SZ,SZ)}
 x.fillStyle='#ffe9c7';x.font='11px Georgia';x.textAlign='center';for(let i=0;i<8;i++){x.fillText('abcdefgh'[G.flip?7-i:i],BX+i*SZ+SZ/2,BY+8*SZ+14);x.fillText(G.flip?i+1:8-i,BX-12,BY+i*SZ+SZ/2+4)}
 for(let i=0;i<64;i++)if(B[i]){const [X,Y]=sqXY(i);piece(B[i],X+SZ/2,Y+SZ/2,SZ)}
 G.moves.forEach(m=>{const [X,Y]=sqXY(m.t);x.fillStyle=m.cap?'rgba(255,90,110,.6)':'rgba(40,20,30,.4)';x.beginPath();x.arc(X+SZ/2,Y+SZ/2,m.cap?SZ*.42:10,0,7);m.cap?(x.lineWidth=4,x.strokeStyle='rgba(255,90,110,.8)',x.stroke()):x.fill()});
 x.strokeStyle='#e8a0b0';x.lineWidth=3;x.strokeRect(BX,BY,8*SZ,8*SZ);
 const px=600;x.fillStyle='#24101a';rr(px,40,280,520,14);x.fill();x.textAlign='left';x.fillStyle='#f6c6d2';x.font='bold 20px Georgia';x.fillText(G.mode==='ai'?'You vs Marshmallow bot':'2 players',px+16,74);
 x.fillStyle='#ffe9c7';x.font='17px Georgia';x.fillText((turn==='w'?'🫘 Coffee beans':'🍡 Marshmallows')+' to move'+(G.state==='play'&&inCheck()?'  CHECK!':''),px+16,106);
 if(G.mode==='ai'&&turn==='b'&&G.state==='play'){x.fillStyle='#ffcf6a';x.font='italic 15px Georgia';x.fillText('🍡 thinking…',px+16,130)}
 x.fillStyle='#ffe9c7';x.font='14px Georgia';x.fillText('Captured by beans:',px+16,170);G.capW.forEach((p,i)=>piece(p,px+28+(i%8)*31,195+(i>>3)*34,30));x.fillStyle='#ffe9c7';x.textAlign='left';x.font='14px Georgia';x.fillText('Captured by mallows:',px+16,270);G.capB.forEach((p,i)=>piece(p,px+28+(i%8)*31,295+(i>>3)*34,30));
 x.textAlign='left';x.fillStyle='#d8c0b0';x.font='13px Georgia';x.fillText('Move '+(Math.floor(G.mv/2)+1)+(DEMO()?'  ·  demo: '+Math.max(0,30-G.mv)+' plies left':''),px+16,370);
 button('undo',px+16,390,120,36,'↩ Undo',()=>{if(hist.length&&G.state==='play'){undo();if(G.mode==='ai'&&hist.length)undo();G.sel=-1;G.moves=[];G.last=null}},{fs:14});button('flip',px+146,390,120,36,'🔄 Flip board',()=>G.flip=!G.flip,{fs:14});
 if(G.mode==='2p')button('af',px+16,436,250,32,'Auto-flip each turn: '+(G.autoFlip?'on':'off'),()=>G.autoFlip=!G.autoFlip,{fs:13});button('menu',px+16,508,250,38,'☰ Menu',()=>G.state='title',{fs:15});
 if(G.state==='over'){x.fillStyle='rgba(18,6,12,.85)';rr(BX+40,BY+190,440,140,16);x.fill();x.textAlign='center';x.fillStyle='#ffcf6a';x.font='bold 26px Georgia';x.fillText(G.res,BX+260,BY+240);button('again',BX+160,BY+262,200,48,'↻ New game',()=>newGame(G.mode))}}
reset();startLoop();
