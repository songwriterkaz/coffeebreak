// Coffeebreak Card Games
const $=id=>document.getElementById(id),T=()=>$('table');
const SU=['♠','♥','♦','♣'],RK=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const red=c=>c.s===1||c.s===2;
function deck(n=1,suits=[0,1,2,3]){const d=[];for(let k=0;k<n;k++)for(const s of suits)for(let r=1;r<=13;r++)d.push({r,s,up:false});return d;}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function cardEl(c,cls){const e=document.createElement('div');e.className='cd'+(cls?' '+cls:'');if(!c.up){e.classList.add('back');return e;}
 if(red(c))e.classList.add('red');e.innerHTML=RK[c.r]+SU[c.s]+'<span class="big">'+SU[c.s]+'</span>';return e;}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let G='klondike',P=null,sel=null,moves=0;
function msg(t){let m=document.querySelector('#table .msg');if(m)m.textContent=t;}
// ============ PATIENCE ENGINE (Klondike/Spider/FreeCell) ============
const R={
klondike:{
 deal(){const d=shuf(deck());const p={stock:[],waste:[],f:[[],[],[],[]],t:[]};for(let i=0;i<7;i++){p.t.push(d.splice(0,i+1));p.t[i][i].up=true;}p.stock=d;return p;},
 canPick(z,i,j){if(z==='t'){const c=P.t[i];if(!c[j].up)return false;for(let k=j;k<c.length-1;k++)if(red(c[k])===red(c[k+1])||c[k].r!==c[k+1].r+1)return false;return true;}return z==='waste'||z==='f';},
 canDrop(cs,z,i){const a=cs[0];if(z==='f'){if(cs.length>1)return false;const f=P.f[i];return f.length?f[f.length-1].s===a.s&&f[f.length-1].r===a.r-1:a.r===1;}
  if(z==='t'){const c=P.t[i];if(!c.length)return a.r===13;const t=c[c.length-1];return t.up&&red(t)!==red(a)&&t.r===a.r+1;}return false;},
 after(){P.t.forEach(c=>{if(c.length)c[c.length-1].up=true;});},
 won(){return P.f.every(f=>f.length===13);},
 stock(){if(P.stock.length){const c=P.stock.pop();c.up=true;P.waste.push(c);}else{P.stock=P.waste.reverse().map(c=>({...c,up:false}));P.waste=[];}}},
spider:{
 deal(){const n=+(($('suits')||{}).value||1);const su=n===1?[0]:n===2?[0,1]:[0,1,2,3];const d=shuf(deck(8/su.length,su));const p={stock:[],f:0,t:[]};
  for(let i=0;i<10;i++){p.t.push(d.splice(0,i<4?6:5));p.t[i][p.t[i].length-1].up=true;}p.stock=d;return p;},
 canPick(z,i,j){if(z!=='t')return false;const c=P.t[i];if(!c[j].up)return false;for(let k=j;k<c.length-1;k++)if(c[k].s!==c[k+1].s||c[k].r!==c[k+1].r+1)return false;return true;},
 canDrop(cs,z,i){if(z!=='t')return false;const c=P.t[i];if(!c.length)return true;return c[c.length-1].r===cs[0].r+1;},
 after(){for(const c of P.t){if(c.length>=13){const s=c.slice(-13);if(s.every((x,k)=>x.up&&x.s===s[0].s&&x.r===13-k)){c.splice(-13);P.f++;}}if(c.length)c[c.length-1].up=true;}},
 won(){return P.f===8;},
 stock(){if(!P.stock.length)return;if(P.t.some(c=>!c.length)){msg('Fill every empty column before dealing.');return 'x';}for(const c of P.t){const x=P.stock.pop();x.up=true;c.push(x);}}},
freecell:{
 deal(){const d=shuf(deck());d.forEach(c=>c.up=true);const p={cells:[null,null,null,null],f:[[],[],[],[]],t:[[],[],[],[],[],[],[],[]]};d.forEach((c,k)=>p.t[k%8].push(c));return p;},
 canPick(z,i,j){if(z==='cell')return !!P.cells[i];if(z==='f')return false;const c=P.t[i];for(let k=j;k<c.length-1;k++)if(red(c[k])===red(c[k+1])||c[k].r!==c[k+1].r+1)return false;return true;},
 canDrop(cs,z,i){const a=cs[0];if(z==='cell')return cs.length===1&&!P.cells[i];
  if(z==='f'){if(cs.length>1)return false;const f=P.f[i];return f.length?f[f.length-1].s===a.s&&f[f.length-1].r===a.r-1:a.r===1;}
  const c=P.t[i];const fc=P.cells.filter(x=>!x).length,ec=P.t.filter((x,k)=>!x.length&&k!==i).length;if(cs.length>(fc+1)*Math.pow(2,ec))return false;
  if(!c.length)return true;const t=c[c.length-1];return red(t)!==red(a)&&t.r===a.r+1;},
 after(){},won(){return P.f.every(f=>f.length===13);}}};
function take(z,i,j){if(z==='t')return P.t[i].slice(j);if(z==='waste')return [P.waste[P.waste.length-1]];if(z==='f')return [P.f[i][P.f[i].length-1]];if(z==='cell')return [P.cells[i]];}
function remove(z,i,j){if(z==='t')P.t[i].splice(j);else if(z==='waste')P.waste.pop();else if(z==='f')P.f[i].pop();else if(z==='cell')P.cells[i]=null;}
function put(cs,z,i){if(z==='t')P.t[i].push(...cs);else if(z==='f')P.f[i].push(...cs);else if(z==='cell')P.cells[i]=cs[0];}
let undoStack=[];
function tryMove(from,z,i){const r=R[G],cs=take(from.z,from.i,from.j);if(!r.canDrop(cs,z,i))return false;undoStack.push(JSON.stringify(P));remove(from.z,from.i,from.j);put(cs,z,i);r.after();moves++;return true;}
function autoMove(from){const cs=take(from.z,from.i,from.j);const tg=[];if(P.f&&Array.isArray(P.f)&&cs.length===1)for(let i=0;i<4;i++)tg.push(['f',i]);
 const nonEmpty=[],empty=[];P.t.forEach((c,i)=>{if(from.z==='t'&&from.i===i)return;(c.length?nonEmpty:empty).push(['t',i]);});tg.push(...nonEmpty,...empty);
 if(G==='freecell'&&cs.length===1&&from.z==='t')P.cells.forEach((c,i)=>tg.push(['cell',i]));
 for(const[z,i]of tg)if(tryMove(from,z,i))return true;return false;}
function clickCard(z,i,j){const r=R[G];
 if(sel){if(sel.z===z&&sel.i===i&&sel.j===j){autoMove(sel);sel=null;return drawP();}
  if(tryMove(sel,z,i)){sel=null;return drawP();}}
 sel=r.canPick(z,i,j)?{z,i,j}:null;drawP();}
function clickEmpty(z,i){if(sel&&tryMove(sel,z,i)){sel=null;}else sel=null;drawP();}
function slot(z,i,cards,label){const p=document.createElement('div');p.className='pile';if(label&&!(cards&&cards.length))p.innerHTML='<div class="lbl" style="padding-top:35%">'+label+'</div>';
 p.onclick=e=>{if(e.target===p||e.target.className==='lbl')clickEmpty(z,i);};
 if(cards&&cards.length){const c=cards[cards.length-1];const e=cardEl(c,sel&&sel.z===z&&sel.i===i?'sel':'');e.onclick=ev=>{ev.stopPropagation();clickCard(z,i,cards.length-1);};p.appendChild(e);}return p;}
function drawP(){const t=T();t.innerHTML='';const top=document.createElement('div'),cols=document.createElement('div');
 const n=G==='spider'?10:G==='freecell'?8:7;top.className='row k'+n;cols.className='row k'+n;
 if(G==='klondike'){const st=slot('stock',0,P.stock,'↻');st.onclick=()=>{undoStack.push(JSON.stringify(P));R.klondike.stock();sel=null;drawP();};{const c=st.querySelector('.cd');if(c)c.onclick=null;}top.appendChild(st);top.appendChild(slot('waste',0,P.waste));{const sp=document.createElement('div');sp.className='pile';sp.style.border='0';top.appendChild(sp);}P.f.forEach((f,i)=>top.appendChild(slot('f',i,f,'A')));}
 if(G==='freecell'){P.cells.forEach((c,i)=>top.appendChild(slot('cell',i,c?[c]:[],'cell')));P.f.forEach((f,i)=>top.appendChild(slot('f',i,f,'A')));}
 if(G==='spider'){const st=slot('stock',0,P.stock.length?[{up:false}]:[],'');st.onclick=()=>{undoStack.push(JSON.stringify(P));if(R.spider.stock()==='x')undoStack.pop();else{R.spider.after();sel=null;drawP();}};{const c=st.querySelector('.cd');if(c)c.onclick=null;}top.appendChild(st);
  const info=document.createElement('div');info.style.cssText='flex:1;align-self:center;text-align:center';info.textContent='Deals left: '+(P.stock.length/10)+'  ·  Runs done: '+P.f+'/8';top.appendChild(info);}
 t.appendChild(top);
 P.t.forEach((c,i)=>{const p=document.createElement('div');p.className='pile col';p.style.border=c.length?'0':'';const step=G==='spider'?(c.length>12?14:20):22;
  p.style.height='calc('+(c.length?100:100)+'% )';p.onclick=e=>{if(e.target===p)clickEmpty('t',i);};
  c.forEach((x,j)=>{const e=cardEl(x,sel&&sel.z==='t'&&sel.i===i&&j>=sel.j?'sel':'');e.style.top=(j*step)+'px';e.onclick=ev=>{ev.stopPropagation();clickCard('t',i,j);};p.appendChild(e);});
  p.style.minHeight=(c.length*step+110)+'px';cols.appendChild(p);});
 t.appendChild(cols);const m=document.createElement('div');m.className='msg';m.textContent=R[G].won()?'🎉 You won in '+moves+' moves! Have a coffee ☕':'Moves: '+moves;t.appendChild(m);
 const u=document.createElement('button');u.className='b';u.textContent='Undo';u.onclick=()=>{if(undoStack.length){P=JSON.parse(undoStack.pop());sel=null;drawP();}};m.appendChild(document.createTextNode(' '));m.appendChild(u);}
function startP(){P=R[G].deal();sel=null;moves=0;undoStack=[];drawP();}
// ============ BLACKJACK (play money) ============
let BJ={bank:+(localStorage.cbBank||1000),bet:0,deck:[],p:[],d:[],live:false};
function bjVal(h){let v=0,a=0;for(const c of h){v+=Math.min(c.r,10);if(c.r===1)a++;}while(a--&&v+10<=21)v+=10;return v;}
function bjDraw(){if(BJ.deck.length<15)BJ.deck=shuf(deck(4));const c=BJ.deck.pop();c.up=true;return c;}
function bjRender(m){const t=T();localStorage.cbBank=BJ.bank;
 t.innerHTML='<div class="ctr"><b>Play-money chips: $'+BJ.bank+'</b> · Bet: $'+BJ.bet+'</div><div class="lbl">Dealer '+(BJ.live?'':'('+bjVal(BJ.d)+')')+'</div><div class="hand" id="dh"></div><div class="lbl">You ('+bjVal(BJ.p)+')</div><div class="hand" id="ph"></div><div class="msg">'+(m||'')+'</div><div class="ctr" id="bc"></div>';
 BJ.d.forEach((c,k)=>$('dh').appendChild(cardEl(BJ.live&&k===1?{...c,up:false}:c)));BJ.p.forEach(c=>$('ph').appendChild(cardEl(c)));
 const bc=$('bc');const btn=(l,f,dis)=>{const b=document.createElement('button');b.className='b';b.textContent=l;b.onclick=f;b.disabled=!!dis;bc.appendChild(b);};
 if(BJ.live){btn('Hit',bjHit);btn('Stand',bjStand);btn('Double',bjDouble,BJ.bank<BJ.bet||BJ.p.length>2);}
 else{[10,25,50,100].forEach(v=>btn('+$'+v,()=>{if(BJ.bank>=v){BJ.bank-=v;BJ.bet+=v;bjRender();}},BJ.bank<v));btn('Deal',bjDeal,!BJ.bet);if(BJ.bank<10&&!BJ.bet)btn('Refill play chips',()=>{BJ.bank=1000;bjRender();});}}
function bjDeal(){BJ.p=[bjDraw(),bjDraw()];BJ.d=[bjDraw(),bjDraw()];BJ.live=true;if(bjVal(BJ.p)===21||bjVal(BJ.d)===21)return bjEnd();bjRender();}
function bjHit(){BJ.p.push(bjDraw());if(bjVal(BJ.p)>21)return bjEnd();if(bjVal(BJ.p)===21)return bjStand();bjRender();}
function bjDouble(){BJ.bank-=BJ.bet;BJ.bet*=2;BJ.p.push(bjDraw());if(bjVal(BJ.p)>21)return bjEnd();bjStand();}
function bjStand(){while(bjVal(BJ.d)<17)BJ.d.push(bjDraw());bjEnd();}
function bjEnd(){BJ.live=false;const p=bjVal(BJ.p),d=bjVal(BJ.d),pb=p===21&&BJ.p.length===2,db=d===21&&BJ.d.length===2;let m;
 if(pb&&!db){BJ.bank+=Math.floor(BJ.bet*2.5);m='Blackjack! Pays 3 to 2 ☕';}else if(p>21)m='Bust. Dealer wins.';else if(db&&!pb)m='Dealer has blackjack.';
 else if(d>21||p>d){BJ.bank+=BJ.bet*2;m='You win!';}else if(p===d){BJ.bank+=BJ.bet;m='Push. Bet returned.';}else m='Dealer wins.';BJ.bet=0;bjRender(m);}
// ============ COFFEE EIGHTS ============
let E;function eStart(){const n=+(($('opp')||{}).value||2);const d=shuf(deck());d.forEach(c=>c.up=true);E={d,hands:[],pile:[],turn:0,suit:null,n:n+1,pen:0,over:false,log:''};
 for(let i=0;i<=n;i++)E.hands.push(d.splice(0,7));let c;do{c=d.pop();d.unshift(c);}while(c.r===8||c.r===2||c.r===12);d.shift();E.pile.push(c);E.suit=c.s;eRender('Match the suit or number. 8 is wild, 2 makes the next player pick up 2, Queen skips.');}
function eTop(){return E.pile[E.pile.length-1];}
function eOk(c){if(E.pen)return c.r===2;return c.r===8||c.s===E.suit||c.r===eTop().r;}
function eDraw(i,n){for(let k=0;k<n;k++){if(!E.d.length){const t=E.pile.pop();E.d=shuf(E.pile);E.pile=[t];}if(E.d.length)E.hands[i].push(E.d.pop());}}
function ePlay(i,k,suit){const c=E.hands[i].splice(k,1)[0];E.pile.push(c);E.suit=c.r===8?suit:c.s;let skip=c.r===12;if(c.r===2)E.pen+=2;
 const who=i?'Player '+(i+1):'You';E.log=who+' played '+RK[c.r]+SU[c.s]+(c.r===8?' and called '+SU[suit]:'');
 if(!E.hands[i].length){E.over=true;return eRender(i?who+' wins! Deal again?':'🎉 You win Coffee Eights!');}
 E.turn=(E.turn+(skip?2:1))%E.n;eNext();}
function eNext(){if(E.over)return;eRender(E.log);if(E.turn!==0)setTimeout(eAI,700);}
function ePass(i){if(E.pen){eDraw(i,E.pen);E.log=(i?'Player '+(i+1):'You')+' picked up '+E.pen;E.pen=0;}else E.log=(i?'Player '+(i+1):'You')+' picked up 1';E.turn=(E.turn+1)%E.n;eNext();}
function eAI(){const i=E.turn,h=E.hands[i];let k=h.findIndex(c=>eOk(c)&&c.r!==8);if(k<0)k=h.findIndex(eOk);
 if(k<0&&!E.pen){eDraw(i,1);const c=h[h.length-1];if(eOk(c))k=h.length-1;}
 if(k<0)return ePass(i);const cnt=[0,0,0,0];h.forEach(c=>c.r!==8&&cnt[c.s]++);ePlay(i,k,cnt.indexOf(Math.max(...cnt)));}
let eDrew=false;
function eRender(m){const t=T();t.innerHTML='<div class="ctr">'+E.hands.slice(1).map((h,i)=>'Player '+(i+2)+': '+h.length+' cards').join(' · ')+'</div><div class="hand" id="ep"></div><div class="lbl">Suit to match: <b style="font-size:1.4em">'+SU[E.suit]+'</b>'+(E.pen?' · Pick-up penalty: '+E.pen:'')+'</div><div class="msg">'+m+'</div><div class="lbl">Your hand'+(E.turn===0&&!E.over?' - your turn':'')+'</div><div class="hand" id="eh"></div><div class="ctr" id="ec"></div>';
 const st=cardEl({up:false});st.style.position='relative';st.style.width='62px';$('ep').appendChild(st);$('ep').appendChild(cardEl(eTop(),'')).style.cssText='position:relative;width:62px';
 E.hands[0].forEach((c,k)=>{const e=cardEl(c);if(E.turn===0&&!E.over&&eOk(c))e.style.boxShadow='0 0 0 3px #f1c76a';e.onclick=()=>{if(E.turn!==0||E.over||!eOk(c))return;eDrew=false;if(c.r===8)return eSuit(k);ePlay(0,k);};$('eh').appendChild(e);});
 if(E.turn===0&&!E.over){const b=document.createElement('button');b.className='b';const can=E.hands[0].some(eOk);
  if(E.pen){b.textContent='Pick up '+E.pen;b.onclick=()=>ePass(0);}else if(!eDrew){b.textContent='Draw a card';b.onclick=()=>{eDraw(0,1);eDrew=true;eRender('You drew a card.');};}else{b.textContent='Pass';b.onclick=()=>{eDrew=false;E.turn=1;E.log='You passed';eNext();};}$('ec').appendChild(b);}}
function eSuit(k){$('ec').innerHTML='Call a suit: ';SU.forEach((s,i)=>{const b=document.createElement('button');b.className='b';b.textContent=s;b.onclick=()=>ePlay(0,k,i);$('ec').appendChild(b);});}
// ============ SNAP ============
let N;function nStart(){const d=shuf(deck());d.forEach(c=>c.up=true);N={me:d.slice(0,26),ai:d.slice(26),pile:[],turn:0,over:false,tm:null};nRender('Take turns flipping. When the top two cards match, hit SNAP first!');}
function nRender(m){const t=T();t.innerHTML='<div class="ctr">Computer: '+N.ai.length+' cards</div><div class="hand" id="np"></div><div class="lbl">Pile: '+N.pile.length+'</div><div class="msg" id="nm">'+m+'</div><div class="ctr">You: '+N.me.length+' cards</div><div class="ctr"><button class="b" id="nf" style="font-size:1.2em">Flip</button> <button class="b" id="ns" style="font-size:1.4em;background:#c0392b">SNAP!</button></div>';
 N.pile.slice(-2).forEach(c=>{const e=cardEl(c);e.style.cssText='position:relative;width:80px';$('np').appendChild(e);});
 $('nf').disabled=N.turn!==0||N.over;$('nf').onclick=()=>nFlip(0);$('ns').onclick=()=>nSnap(0);}
function nMatch(){const p=N.pile;return p.length>1&&p[p.length-1].r===p[p.length-2].r;}
function nFlip(w){if(N.over)return;const src=w?N.ai:N.me;if(!src.length)return nEnd();N.pile.push(src.shift());N.turn=1-w;nRender(w?'Computer flipped.':'You flipped.');
 clearTimeout(N.tm);const lv=+(($('nlv')||{}).value||900);if(nMatch())N.tm=setTimeout(()=>nSnap(1),lv+Math.random()*400);else if(N.turn===1)N.tm=setTimeout(()=>nFlip(1),800);if(!N.me.length&&!N.ai.length)nEnd();}
function nSnap(w){if(N.over)return;clearTimeout(N.tm);if(nMatch()){(w?N.ai:N.me).push(...N.pile);N.pile=[];nRender(w?'Computer snapped first!':'SNAP! You win the pile ☕');}
 else if(!w){if(N.me.length){N.ai.push(N.me.shift());}nRender('No match! You give the computer a card.');}
 if(!N.me.length||!N.ai.length)return nEnd();if(N.turn===1)N.tm=setTimeout(()=>nFlip(1),900);}
function nEnd(){N.over=true;clearTimeout(N.tm);nRender(N.me.length>N.ai.length?'🎉 You win Snap!':'Computer wins this time. Deal again?');}
// ============ GO FISH ============
let F;function fStart(){const d=shuf(deck());d.forEach(c=>c.up=true);F={d,me:d.splice(0,7),ai:d.splice(0,7),mb:0,ab:0,turn:0,mem:[],over:false};fSort();fRender('Tap a card to ask the computer for that rank. Collect sets of 4!');}
function fSort(){F.me.sort((a,b)=>a.r-b.r);}
function fBooks(h){let n=0;for(let r=1;r<=13;r++){if(h.filter(c=>c.r===r).length===4){for(let i=h.length-1;i>=0;i--)if(h[i].r===r)h.splice(i,1);n++;}}return n;}
function fCheck(){F.mb+=fBooks(F.me);F.ab+=fBooks(F.ai);if(!F.me.length&&F.d.length)F.me.push(F.d.pop());if(!F.ai.length&&F.d.length)F.ai.push(F.d.pop());fSort();
 if(F.mb+F.ab===13||(!F.d.length&&(!F.me.length||!F.ai.length))){F.over=true;return true;}return false;}
function fAsk(r){if(F.turn!==0||F.over)return;F.mem.push(r);const got=F.ai.filter(c=>c.r===r);let m;
 if(got.length){F.ai=F.ai.filter(c=>c.r!==r);F.me.push(...got);m='Computer gave you '+got.length+' × '+RK[r]+'. Go again!';}
 else{m='Go fish! ';if(F.d.length){const c=F.d.pop();F.me.push(c);m+='You drew '+RK[c.r]+SU[c.s]+'.';if(c.r===r)m+=' Lucky catch - go again!';else F.turn=1;}else F.turn=1;}
 if(fCheck())return fEnd();fRender(m);if(F.turn===1)setTimeout(fAI,1100);}
function fAI(){if(F.over)return;if(!F.ai.length){F.turn=0;return fRender('Your turn.');}
 let r=F.mem.reverse().find(x=>F.ai.some(c=>c.r===x));F.mem.reverse();if(!r||Math.random()<.3)r=F.ai[Math.random()*F.ai.length|0].r;F.mem=F.mem.filter(x=>x!==r);
 const got=F.me.filter(c=>c.r===r);let m='Computer asks for '+RK[r]+'s. ';
 if(got.length){F.me=F.me.filter(c=>c.r!==r);F.ai.push(...got);m+='You hand over '+got.length+'.';if(fCheck())return fEnd();fRender(m);return setTimeout(fAI,1300);}
 m+='You say "Go fish!"';if(F.d.length)F.ai.push(F.d.pop());F.turn=0;if(fCheck())return fEnd();fRender(m+' Your turn.');}
function fRender(m){const t=T();t.innerHTML='<div class="ctr">Computer: '+F.ai.length+' cards · sets '+F.ab+'</div><div class="ctr" style="margin:10px">Pond: '+F.d.length+' cards</div><div class="msg">'+m+'</div><div class="ctr">Your sets: '+F.mb+'</div><div class="hand" id="fh"></div>';
 F.me.forEach(c=>{const e=cardEl(c);e.onclick=()=>fAsk(c.r);$('fh').appendChild(e);});}
function fEnd(){fRender(F.mb>F.ab?'🎉 You win Go Fish, '+F.mb+' sets to '+F.ab+'!':F.mb===F.ab?'Draw!':'Computer wins, '+F.ab+' sets to '+F.mb+'.');}
// ============ MENU ============
const OPTS={spider:'<select id="suits"><option value="1">1 suit (easy)</option><option value="2">2 suits</option><option value="4">4 suits (hard)</option></select>',
 eights:'<select id="opp"><option value="1">1 opponent</option><option value="2" selected>2 opponents</option><option value="3">3 opponents</option></select>',
 snap:'<select id="nlv"><option value="1400">Slow computer</option><option value="900" selected>Normal</option><option value="500">Fast</option></select>'};
const START={klondike:startP,spider:startP,freecell:startP,blackjack:()=>{BJ.p=[];BJ.d=[];BJ.live=false;bjRender('Place a bet with play chips, then Deal. Dealer stands on 17.');},eights:eStart,snap:()=>{if(N)clearTimeout(N.tm);nStart();},gofish:fStart};
function go(g){G=g;document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.g===g));$('opts').innerHTML=OPTS[g]||'';const o=$('opts').querySelector('select');if(o)o.onchange=()=>START[G]();START[g]();}
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.g));$('newg').onclick=()=>START[G]();
go(location.hash.slice(1)||'klondike');
