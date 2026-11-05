// Coffeebreak Aussie Property - original property trading game
const $=id=>document.getElementById(id);
const COL={br:'#8b5a2b',sk:'#5fb3e0',pu:'#6a3d9a',or:'#e08a1e',re:'#c0392b',ye:'#e6c229',gr:'#2e8b57',nv:'#1f3a7a'};
const S=(n,g,p,b,hc)=>({t:'st',n,g,p,hc,rent:[b,b*5,b*15,b*40,b*50,b*62]});
const B=[{t:'start',n:'START\nPay Day +$200'},S('Cessnock Main Rd','br',60,2,50),{t:'bt',n:'Bush Telegraph'},S('Maitland High St','br',60,4,50),{t:'tax',n:'ATO Bill',a:200},{t:'air',n:'Newcastle Airport',p:200},
S('Hunter St, Newcastle','sk',100,6,50),{t:'fg',n:'Fair Go'},S('Darby St, Newcastle','sk',100,6,50),S('Beaumont St, Hamilton','sk',120,8,50),
{t:'jail',n:'THE LOCKUP\n(just popping in)'},S('Merewether Beach','pu',140,10,100),{t:'ut',n:'Power Co',p:150},S('Bar Beach','pu',140,10,100),S('Nobbys Beach','pu',160,12,100),{t:'air',n:'Brisbane Airport',p:200},
S('Cairns Esplanade','or',180,14,100),{t:'bt',n:'Bush Telegraph'},S('The Strand, Townsville','or',180,14,100),S('Surfers Paradise','or',200,16,100),
{t:'free',n:'BEACH DAY\nTake a break'},S('Rundle Mall, Adelaide','re',220,18,150),{t:'fg',n:'Fair Go'},S('Glenelg Jetty','re',220,18,150),S('Fremantle Markets','re',240,20,150),{t:'air',n:'Melbourne Airport',p:200},
S('Queen St Mall, Brisbane','ye',260,22,150),S('South Bank, Brisbane','ye',260,22,150),{t:'ut',n:'Water Board',p:150},S('Fortitude Valley','ye',280,24,150),
{t:'gojail',n:'NICKED!\nOff to the Lockup'},S('Flinders St, Melbourne','gr',300,26,200),S('Lygon St, Carlton','gr',300,26,200),{t:'bt',n:'Bush Telegraph'},S('St Kilda Esplanade','gr',320,28,200),{t:'air',n:'Sydney Airport',p:200},
{t:'fg',n:'Fair Go'},S('Circular Quay, Sydney','nv',350,35,200),{t:'tax',n:'Council Rates',a:100},S('Bondi Beach','nv',400,50,200)];
B[39].rent=[50,200,600,1400,1700,2000];B[37].rent=[35,175,500,1100,1300,1500];
const FG=[['Tax refund from the ATO. Collect $100',p=>gain(p,100)],['Speeding fine on the M1. Pay $80',p=>pay(p,80)],['Head straight to START and collect Pay Day',p=>moveTo(p,0)],
 ['Grab a cheap flight: go to the nearest airport',p=>{let x=p.pos;do x=(x+1)%40;while(B[x].t!=='air');moveTo(p,x);}],['Day trip to Bondi Beach',p=>moveTo(p,39)],['Go back 3 spaces',p=>{p.pos=(p.pos+37)%40;land(p);}],
 ['Caught fare-dodging on the light rail. Off to the Lockup!',p=>toJail(p)],['Bail-out pass: keep this to leave the Lockup free',p=>{p.passes++;}],['Storm damage: pay $40 per house and $115 per resort',p=>{let t=0;own(p).forEach(i=>{const h=O[i].h;t+=h===5?115:h*40;});pay(p,t);}],
 ['Won the meat tray at the pub raffle. Collect $50',p=>gain(p,50)],['Footy tipping champion! Collect $150',p=>gain(p,150)],['You shout everyone at the barbie: pay each player $50',p=>live().forEach(q=>q!==p&&pay(p,50,q))],['Road trip to Hunter St, Newcastle',p=>moveTo(p,6)]];
const BT=[['Sold your old ute. Collect $200',p=>gain(p,200)],['Vet bill for the kelpie. Pay $100',p=>pay(p,100)],['It\'s your birthday! Every player gives you $10',p=>live().forEach(q=>q!==p&&pay(q,10,p))],['Medicare rebate. Collect $20',p=>gain(p,20)],
 ['Your nan left you $100',p=>gain(p,100)],['School excursion fees. Pay $50',p=>pay(p,50)],['Busking on Darby St went off. Collect $25',p=>gain(p,25)],['Head straight to START and collect Pay Day',p=>moveTo(p,0)],
 ['Bail-out pass: keep this to leave the Lockup free',p=>{p.passes++;}],['Dobbed in for an unpaid fine. Off to the Lockup!',p=>toJail(p)],['Rego and green slip due. Pay $150',p=>pay(p,150)],['Cashback from your super fund. Collect $50',p=>gain(p,50)]];
const TOK=['☕','🦘','🐨','🏄','🦈','🚐'],PC=['#6b4226','#e08a1e','#2e8b57','#1f3a7a','#c0392b','#7a7a7a'];
let P=[],O={},cur=0,phase='roll',dbl=0,round=1,maxR=0,lastRoll=0,decks={fg:[],bt:[]},over=false;
const live=()=>P.filter(p=>!p.out),own=p=>Object.keys(O).map(Number).filter(i=>O[i].o===P.indexOf(p));
function log(t){const l=$('log');l.innerHTML='<div>'+t+'</div>'+l.innerHTML;}
const money=n=>'$'+n.toLocaleString('en-AU');
function gain(p,a){p.cash+=a;log(p.tok+' '+p.name+' gets '+money(a));}
function pay(p,a,to){if(a<=0)return;p.cash-=a;if(to){to.cash+=a;}log(p.tok+' '+p.name+' pays '+money(a)+(to?' to '+to.name:''));if(p.cash<0)raise(p,to);}
function worth(p){return p.cash+own(p).reduce((s,i)=>s+(O[i].m?0:B[i].p/2)+(O[i].h*(B[i].hc||0))/2,0);}
function raise(p,cred){// sell houses then mortgage to cover debt
 const props=own(p).sort((a,b)=>B[a].p-B[b].p);
 for(const i of props.slice().reverse())while(p.cash<0&&O[i].h>0){O[i].h--;p.cash+=B[i].hc/2;log(p.name+' sells a building on '+B[i].n+' for '+money(B[i].hc/2));}
 for(const i of props)if(p.cash<0&&!O[i].m&&!groupBuilt(i)){O[i].m=1;p.cash+=B[i].p/2;log(p.name+' mortgages '+B[i].n+' for '+money(B[i].p/2));}
 if(p.cash<0){log('💥 '+p.name+' is broke and out of the game!');if(cred){cred.cash+=p.cash;}props.forEach(i=>{if(cred){O[i].o=P.indexOf(cred);O[i].h=0;}else delete O[i];});p.cash=0;p.out=true;checkWin();}}
function group(g){return B.map((b,i)=>b.g===g?i:-1).filter(i=>i>=0);}
function groupBuilt(i){return B[i].g&&group(B[i].g).some(j=>O[j]&&O[j].h>0);}
function hasGroup(pi,g){return group(g).every(j=>O[j]&&O[j].o===pi);}
function rent(i){const o=O[i],b=B[i];if(!o||o.m)return 0;const pi=o.o;
 if(b.t==='st'){if(o.h)return b.rent[o.h];return b.rent[0]*(hasGroup(pi,b.g)?2:1);}
 if(b.t==='air'){const n=B.filter((x,j)=>x.t==='air'&&O[j]&&O[j].o===pi).length;return 25*Math.pow(2,n-1);}
 if(b.t==='ut'){const n=B.filter((x,j)=>x.t==='ut'&&O[j]&&O[j].o===pi).length;return lastRoll*(n===2?10:4);}return 0;}
function draw(k){if(!decks[k].length)decks[k]=(k==='fg'?FG:BT).map((c,i)=>i).sort(()=>Math.random()-.5);return (k==='fg'?FG:BT)[decks[k].pop()];}
function toJail(p){p.pos=10;p.jail=1;dbl=0;log('🚓 '+p.name+' goes to the Lockup');phase='end';render();}
function moveTo(p,x){if(x<p.pos||x===0&&p.pos!==0){p.cash+=200;log(p.name+' passes START: Pay Day $200');}p.pos=x;land(p);}
function land(p){const b=B[p.pos],o=O[p.pos];log(p.tok+' '+p.name+' lands on '+b.n.replace('\n',' '));
 if(['st','air','ut'].includes(b.t)){if(!o){phase='buy';return;}if(o.o!==P.indexOf(p)&&!P[o.o].out){const r=rent(p.pos);if(r)pay(p,r,P[o.o]);}}
 else if(b.t==='tax')pay(p,b.a);else if(b.t==='gojail')return toJail(p);
 else if(b.t==='fg'||b.t==='bt'){const c=draw(b.t);modalMsg((b.t==='fg'?'🎲 Fair Go':'📻 Bush Telegraph')+': '+c[0]);log('“'+c[0]+'”');const pos=p.pos;c[1](p);if(p.jail||p.pos!==pos)return;}
 if(phase!=='buy'&&phase!=='end')phase=dbl&&!p.jail?'roll':'end';}
function roll(){const p=P[cur];const a=1+Math.random()*6|0,b=1+Math.random()*6|0;lastRoll=a+b;$('dice').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][a]+['','⚀','⚁','⚂','⚃','⚄','⚅'][b];log(p.tok+' '+p.name+' rolls '+a+' + '+b);
 if(p.jail){if(a===b){p.jail=0;log('Doubles! Out of the Lockup');dbl=0;}else{p.jail++;if(p.jail>3){log('Third try: pays $50 bail');p.jail=0;pay(p,50);}else{phase='end';return render();}}phase='move';const n=p.pos+lastRoll;if(n>=40){p.cash+=200;log('Pay Day $200');}p.pos=n%40;phase='end';land(p);if(phase==='roll')phase='end';return render();}
 if(a===b){dbl++;if(dbl===3){log('Three doubles in a row - nicked for speeding!');return toJail(p);}}else dbl=0;
 const n=p.pos+lastRoll;if(n>=40){p.cash+=200;log('Pay Day: '+p.name+' collects $200');}p.pos=n%40;phase=a===b?'roll':'end';land(p);if(phase!=='buy'&&!p.jail)phase=dbl?'roll':'end';render();}
function buy(){const p=P[cur],b=B[p.pos];if(p.cash>=b.p){p.cash-=b.p;O[p.pos]={o:cur,h:0,m:0};log('🏠 '+p.name+' buys '+b.n+' for '+money(b.p));}afterBuy();}
function afterBuy(){phase=dbl&&!P[cur].jail?'roll':'end';render();}
function canBuild(pi,i){const b=B[i],o=O[i];if(b.t!=='st'||!o||o.o!==pi||o.m||o.h>=5||!hasGroup(pi,b.g))return false;const g=group(b.g);if(g.some(j=>O[j].m))return false;return o.h<=Math.min(...g.map(j=>O[j].h))&&P[pi].cash>=b.hc;}
function build(i){const p=P[cur];O[i].h++;p.cash-=B[i].hc;log('🔨 '+p.name+' builds on '+B[i].n+(O[i].h===5?' (resort!)':' ('+O[i].h+' houses)'));render();}
function endTurn(){if(over)return;const p=P[cur];if(p.cash<0&&!p.out)raise(p);if(over)return render();dbl=0;let n=cur;do{n=(n+1)%P.length;if(n===0)round++;}while(P[n].out);cur=n;phase='roll';
 if(maxR&&round>maxR){over=true;const w=live().sort((a,b)=>worth(b)-worth(a))[0];modalMsg('🏆 Time\'s up! '+w.tok+' '+w.name+' is the richest with '+money(worth(w))+'!');}render();}
function checkWin(){const l=live();if(l.length===1&&!over){over=true;modalMsg('🏆 '+l[0].tok+' '+l[0].name+' wins Coffeebreak Aussie Property!');}}
// ---------- AI ----------
function aiStep(){if(over)return;const p=P[cur];if(p.out){endTurn();return;}if(!p.ai)return;
 if(phase==='roll'){if(p.jail&&p.passes){p.passes--;p.jail=0;log(p.name+' uses a Bail-out pass');}else if(p.jail&&p.cash>400){p.jail=0;pay(p,50);log(p.name+' pays bail');}roll();}
 else if(phase==='buy'){const b=B[p.pos];if(p.cash-b.p>=(round<6?60:150))buy();else{log(p.name+' passes on '+b.n);afterBuy();}}
 else if(phase==='end'){for(let k=0;k<20;k++){const c=B.map((b,i)=>i).filter(i=>canBuild(cur,i)&&p.cash-B[i].hc>250);if(!c.length)break;build(c[0]);}
  own(p).forEach(i=>{if(O[i].m&&p.cash>B[i].p*0.55+400){O[i].m=0;p.cash-=Math.ceil(B[i].p*0.55);log(p.name+' pays off the mortgage on '+B[i].n);}});
  if(Math.random()<.15)aiTrade(p);endTurn();}
 render();}
function aiTrade(p){// try to buy a street that completes a group
 const pi=P.indexOf(p);for(const g in COL){const gs=group(g);const mine=gs.filter(j=>O[j]&&O[j].o===pi);const need=gs.filter(j=>!O[j]||O[j].o!==pi);
  if(need.length===1&&mine.length&&O[need[0]]&&!O[need[0]].h){const j=need[0],q=P[O[j].o];const offer=Math.round(B[j].p*1.6);if(p.cash>offer+150){
   if(q.ai){if(!hasNear(O[j].o,g)){O[j].o=pi;p.cash-=offer;q.cash+=offer;log('🤝 '+p.name+' buys '+B[j].n+' from '+q.name+' for '+money(offer));}}
   else offerToHuman(p,q,j,offer);return;}}}}
function hasNear(pi,g){return group(g).filter(j=>O[j]&&O[j].o===pi).length>=group(g).length-1;}
function offerToHuman(p,q,j,offer){modal('<h3>🤝 Trade offer</h3><p>'+p.tok+' '+p.name+' offers <b>'+money(offer)+'</b> for your <b>'+B[j].n+'</b>.</p><p class="small">For '+q.name+'</p>',[['Accept',()=>{O[j].o=P.indexOf(p);p.cash-=offer;q.cash+=offer;log('🤝 '+q.name+' sells '+B[j].n+' to '+p.name+' for '+money(offer));render();}],['No thanks',()=>log(q.name+' says no to the trade')]]);}
// ---------- human trade ----------
function tradeUI(){const p=P[cur],pi=cur;const others=live().filter(q=>q!==p);if(!others.length)return;
 let h='<h3>🤝 Make a trade</h3><label>With: <select id="tw">'+others.map(q=>'<option value="'+P.indexOf(q)+'">'+q.tok+' '+q.name+'</option>').join('')+'</select></label><div id="tbody"></div>';
 modal(h,[['Propose',()=>{const qi=+$('tw').value,q=P[qi];const give=[...document.querySelectorAll('.tg:checked')].map(e=>+e.value),get=[...document.querySelectorAll('.tt:checked')].map(e=>+e.value);
  const cg=Math.max(0,+$('tcg').value||0),ct=Math.max(0,+$('tct').value||0);if(cg>p.cash||ct>q.cash){modalMsg('Not enough cash for that deal.');return;}
  const val=x=>x.reduce((s,i)=>s+B[i].p*(O[i].m?.5:1)+(O[i].h*B[i].hc),0);
  const doIt=()=>{give.forEach(i=>O[i].o=qi);get.forEach(i=>O[i].o=pi);p.cash+=ct-cg;q.cash+=cg-ct;log('🤝 Trade done between '+p.name+' and '+q.name);render();};
  if(q.ai){let gain=val(give)+cg-val(get)-ct;get.forEach(i=>{if(B[i].g&&hasNear(qi,B[i].g))gain-=400;});give.forEach(i=>{if(B[i].g&&hasNear(qi,B[i].g))gain+=200;});
   if(gain>=40){doIt();modalMsg(q.name+' accepts the deal! 🤝');}else modalMsg(q.name+' says: "Nah, not a fair go for me."');}
  else setTimeout(()=>modal('<h3>'+q.tok+' '+q.name+', do you accept?</h3><p>'+p.name+' gives: '+(give.map(i=>B[i].n).join(', ')||'nothing')+(cg?' + '+money(cg):'')+'<br>'+p.name+' gets: '+(get.map(i=>B[i].n).join(', ')||'nothing')+(ct?' + '+money(ct):'')+'</p>',[['Accept',doIt],['Decline',()=>log(q.name+' declines the trade')]]),50);}],['Cancel',()=>{}]]);
 const fill=()=>{const qi=+$('tw').value;const li=(pi2,cls)=>B.map((b,i)=>i).filter(i=>O[i]&&O[i].o===pi2&&!groupBuilt(i)).map(i=>'<label style="display:block"><input type="checkbox" class="'+cls+'" value="'+i+'"> '+B[i].n+(O[i].m?' (mortgaged)':'')+'</label>').join('')||'<i>none</i>';
  $('tbody').innerHTML='<b>You give:</b>'+li(pi,'tg')+'+ cash $<input id="tcg" type="number" min="0" value="0" style="width:90px"><br><b>You get:</b>'+li(qi,'tt')+'+ cash $<input id="tct" type="number" min="0" value="0" style="width:90px">';};
 $('tw').onchange=fill;fill();}
function manageUI(){const p=P[cur];const props=own(p);if(!props.length)return modalMsg('You don\'t own any property yet.');
 let h='<h3>🏘️ Your property</h3><p class="small">Mortgage for half the price. Paying it off costs 10% extra. Build evenly across a full colour group. 5th building = resort.</p>';
 h+=props.map(i=>{const o=O[i],b=B[i];let btn='';if(canBuild(cur,i))btn+='<button class="b" data-a="b" data-i="'+i+'">Build '+money(b.hc)+'</button>';
  if(o.h>0)btn+='<button class="b" data-a="s" data-i="'+i+'">Sell building +'+money(b.hc/2)+'</button>';
  if(!o.m&&!groupBuilt(i))btn+='<button class="b" data-a="m" data-i="'+i+'">Mortgage +'+money(b.p/2)+'</button>';
  if(o.m)btn+='<button class="b" data-a="u" data-i="'+i+'">Pay off '+money(Math.ceil(b.p*.55))+'</button>';
  return '<div style="border-left:6px solid '+(COL[b.g]||'#999')+';padding:4px;margin:4px 0"><b>'+b.n+'</b> '+(o.h?(o.h===5?'🏨':'🏠'.repeat(o.h)):'')+(o.m?' (mortgaged)':'')+'<br>'+btn+'</div>';}).join('');
 modal(h,[['Done',()=>{}]]);document.querySelectorAll('#mbox [data-a]').forEach(e=>e.onclick=()=>{const i=+e.dataset.i,b=B[i],o=O[i];
  if(e.dataset.a==='b')build(i);if(e.dataset.a==='s'){o.h--;p.cash+=b.hc/2;}if(e.dataset.a==='m'){o.m=1;p.cash+=b.p/2;}if(e.dataset.a==='u'){const c=Math.ceil(b.p*.55);if(p.cash>=c){o.m=0;p.cash-=c;}}render();manageUI();});}
// ---------- render ----------
function modal(h,btns){$('mbox').innerHTML=h+'<div style="margin-top:10px" id="mb"></div>';btns.forEach(([l,f])=>{const b=document.createElement('button');b.className='b';b.textContent=l;b.onclick=()=>{$('modal').style.display='none';f();render();};$('mb').appendChild(b);});$('modal').style.display='flex';}
let msgQ=[];function modalMsg(t){if($('modal').style.display==='flex'&&!P[cur].ai){msgQ.push(t);return;}if(P[cur]&&P[cur].ai&&!over){log('<b>'+t+'</b>');return;}modal('<p style="font-size:1.1em">'+t+'</p>',[['OK',()=>{if(msgQ.length)setTimeout(()=>modalMsg(msgQ.shift()),10);}]]);}
function pos(i){if(i<=10)return[11,11-i];if(i<=20)return[11-(i-10),1];if(i<=30)return[1,1+(i-20)];return[1+(i-30),11];}
function render(){const bd=$('board');bd.innerHTML='<div id="center"><img src="cb-logo.jpg" alt="Coffeebreak logo"><h2>Coffeebreak<br>Aussie Property</h2><div id="dice">'+(window._d||'🎲🎲')+'</div><div class="small">Round '+round+(maxR?' of '+maxR:'')+'</div></div>';
 B.forEach((b,i)=>{const[r,c]=pos(i);const d=document.createElement('div');d.className='cell'+([0,10,20,30].includes(i)?' corner':'')+(O[i]&&O[i].m?' mort':'');d.style.gridRow=r;d.style.gridColumn=c;
  let h='';if(b.g)h+='<div class="bar" style="background:'+COL[b.g]+'"></div>';h+='<div class="nm">'+b.n.replace('\n','<br>')+(b.t==='air'?' ✈️':b.t==='ut'?(i===12?' ⚡':' 💧'):'')+'</div>';if(b.p&&!O[i])h+='<div class="pr">'+money(b.p)+'</div>';
  if(O[i]){h+='<div class="own" style="background:'+PC[O[i].o]+'"></div>';if(O[i].h)h+='<div class="hs">'+(O[i].h===5?'🏨':'■'.repeat(O[i].h))+'</div>';}
  const here=P.filter(p=>!p.out&&p.pos===i).map(p=>p.tok).join('');if(here)h+='<div class="tok">'+here+'</div>';d.innerHTML=h;d.onclick=()=>info(i);bd.appendChild(d);});
 $('plist').innerHTML=P.map((p,i)=>'<div class="'+(i===cur?'cur':'')+'" style="border-left:6px solid '+PC[i]+(p.out?';opacity:.4;text-decoration:line-through':'')+'">'+p.tok+' <b>'+p.name+'</b>'+(p.ai?' 🤖':'')+' · '+money(p.cash)+(p.jail?' · 🚓 in Lockup':'')+(p.passes?' · 🎟️'+p.passes:'')+'</div>').join('');
 const a=$('acts');a.innerHTML='';const p=P[cur];if(over){btn(a,'New game',()=>location.reload());return;}
 if(p.out){btn(a,'End turn ➡️',endTurn);return;}if(p.ai){a.innerHTML='<i>'+p.name+' is thinking…</i>';clearTimeout(window._ai);window._ai=setTimeout(aiStep,650);return;}
 if(phase==='roll'){if(p.jail){btn(a,'Pay $50 bail',()=>{p.jail=0;pay(p,50);render();});if(p.passes)btn(a,'Use Bail-out pass',()=>{p.passes--;p.jail=0;render();});btn(a,'🎲 Roll for doubles',()=>{roll();window._d=$('dice').textContent;render();});}
  else btn(a,'🎲 Roll',()=>{roll();window._d=$('dice').textContent;render();});}
 if(phase==='buy'){const b=B[p.pos];btn(a,'Buy '+b.n+' for '+money(b.p),buy,p.cash<b.p);btn(a,'Skip',()=>{log(p.name+' passes');afterBuy();});}
 if(phase==='end')btn(a,'End turn ➡️',endTurn);
 if(phase!=='buy'){btn(a,'🏘️ My property',manageUI);btn(a,'🤝 Trade',tradeUI);}}
function btn(a,l,f,dis){const b=document.createElement('button');b.className='b';b.textContent=l;b.onclick=f;b.disabled=!!dis;a.appendChild(b);}
function info(i){const b=B[i],o=O[i];if(!b.p)return modalMsg(b.n.replace('\n',' '));let h='<h3 style="border-bottom:6px solid '+(COL[b.g]||'#999')+'">'+b.n+'</h3>Price '+money(b.p)+'<br>';
 if(b.t==='st')h+='Rent '+money(b.rent[0])+' (double with full colour group)<br>'+[1,2,3,4].map(k=>k+' house'+(k>1?'s':'')+': '+money(b.rent[k])).join('<br>')+'<br>Resort: '+money(b.rent[5])+'<br>Each building '+money(b.hc);
 if(b.t==='air')h+='Rent $25 / $50 / $100 / $200 for 1-4 airports';if(b.t==='ut')h+='Rent 4× dice roll, or 10× if you own both';
 h+='<br>Owner: '+(o?P[o.o].name:'nobody yet');modal(h,[['OK',()=>{}]]);}
// ---------- setup ----------
const setup=[{name:'Karen',ai:0},{name:'Bazza Bot',ai:1},{name:'Shazza Bot',ai:1}];
function drawSetup(){$('pls').innerHTML=setup.map((s,i)=>'<div class="pl">'+TOK[i]+' <input value="'+s.name+'" data-i="'+i+'" style="width:130px"> <select data-i="'+i+'"><option value="0"'+(s.ai?'':' selected')+'>Person</option><option value="1"'+(s.ai?' selected':'')+'>Computer</option></select>'+(setup.length>2?' <button class="b" data-x="'+i+'">✕</button>':'')+'</div>').join('');
 document.querySelectorAll('#pls input').forEach(e=>e.oninput=()=>setup[e.dataset.i].name=e.value);document.querySelectorAll('#pls select').forEach(e=>e.onchange=()=>setup[e.dataset.i].ai=+e.value);
 document.querySelectorAll('#pls [data-x]').forEach(e=>e.onclick=()=>{setup.splice(+e.dataset.x,1);drawSetup();});$('addp').disabled=setup.length>=6;}
$('addp').onclick=()=>{if(setup.length<6){setup.push({name:['Dazza','Kylie','Robbo','Macca'][setup.length-2]+' Bot',ai:1});drawSetup();}};
$('start').onclick=()=>{P=setup.map((s,i)=>({name:s.name||('Player '+(i+1)),ai:s.ai,tok:TOK[i],cash:1500,pos:0,jail:0,passes:0,out:false}));maxR=+$('rounds').value;$('setup').style.display='none';$('game').style.display='flex';log('G\'day! Everyone starts with $1,500. Roll to begin.');render();};
drawSetup();
window.CBProp={get P(){return P},get O(){return O},get phase(){return phase},get round(){return round},get over(){return over}};
