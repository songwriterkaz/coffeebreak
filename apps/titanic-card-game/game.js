(function(){
const R=(n,f,t='Room')=>({t,n,f});
const ROOMS=[R('Boat Deck','The highest deck, holding the lifeboats, the gymnasium and the officers\' quarters.'),R('Grand Staircase','Oak panelling and a wrought-iron and glass dome lit the forward First Class staircase.'),R('Dining Saloon','On D Deck, the First Class Dining Saloon was the largest room afloat at the time, seating over 500.'),R('Café Parisien','A First Class café on B Deck styled like a Paris sidewalk café, with trellis walls.'),R('Swimming Bath','Titanic had one of the first swimming pools on an ocean liner, on F Deck.'),R('Turkish Bath','Decorated in an Arabian style with tiled walls and bronze lamps.'),R('Marconi Room','The wireless room sent distress calls CQD and SOS, reaching Carpathia about 58 miles away.'),R('Bridge','The ship was steered from the wheelhouse behind the open bridge on the Boat Deck.'),R('Boiler Rooms','29 boilers with 159 furnaces made steam for the engines.'),R('Third Class General Room','A pine-panelled common room on C Deck where Third Class passengers gathered and sang.')];
const CREW=[R('Captain Edward Smith','Commander of Titanic and White Star Line\'s senior captain. He went down with his ship.','Crew'),R('William Murdoch','First Officer, on watch at the collision. He ordered "hard a-starboard" and helped load boats until the end.','Crew'),R('Charles Lightoller','Second Officer. He loaded boats on the port side and was the most senior officer to survive.','Crew'),R('Herbert Pitman','Third Officer. He was placed in command of Lifeboat 5.','Crew'),R('Joseph Boxhall','Fourth Officer. He fired distress rockets and commanded Lifeboat 2.','Crew'),R('Harold Lowe','Fifth Officer. He took Lifeboat 14 back to search for survivors in the water.','Crew'),R('Jack Phillips','Senior wireless operator. He kept sending distress calls until power failed and did not survive.','Crew'),R('Frederick Fleet','Lookout in the crow\'s nest who spotted the iceberg and rang the bell three times.','Crew'),R('Thomas Andrews','Shipbuilder from Harland & Wolff who designed Titanic. He helped passengers to the boats.','Crew'),R('Wallace Hartley','Bandleader. The musicians played to keep people calm; none of the band survived.','Crew')];
const OFF=['Captain Edward Smith','William Murdoch','Charles Lightoller','Herbert Pitman','Joseph Boxhall','Harold Lowe'];
const PAS=[];
for(let i=0;i<7;i++)PAS.push(R('First Class passenger','About 324 First Class passengers were aboard. The most expensive suites cost over £800.','Passenger'));
for(let i=0;i<7;i++)PAS.push(R('Second Class passenger','About 284 Second Class passengers sailed, many of them teachers, clergy and tradespeople.','Passenger'));
for(let i=0;i<9;i++)PAS.push(R('Third Class passenger','About 709 people travelled Third Class, many emigrating to America from across Europe.','Passenger'));
PAS.push(Object.assign(R('Child passenger','The order "women and children first" was followed by officers loading the boats.','Passenger'),{child:1}),Object.assign(R('Child passenger','Around 109 children were on board.','Passenger'),{child:1}));
PAS.push(Object.assign(R('Millvina Dean','Third Class, aged 2 months, the youngest passenger. She survived and was the last living survivor until 2009.','Passenger'),{child:1}),R('Margaret "Molly" Brown','First Class. In Lifeboat 6 she urged the crew to go back for survivors.','Passenger'),R('Lawrence Beesley','Second Class science teacher who survived in Lifeboat 13 and wrote a book about the night.','Passenger'));
const BOATS=[];for(let i=0;i<12;i++)BOATS.push(R('Lifeboat '+[1,2,3,4,5,6,7,8,13,14,15,16][i],'Titanic carried 20 lifeboats with room for about 1,178 people, far fewer than the 2,200 aboard.','Lifeboat'));
const EV=[R('Iceberg warning','Titanic received several ice warnings by wireless on 14 April 1912. The clock moves forward 10 minutes.','Event'),R('Iceberg warning','The Californian\'s warning was cut off by a busy operator. The clock moves forward 10 minutes.','Event'),R('Distress rockets','Boxhall fired white rockets into the night. Draw 1 extra card.','Event'),R('CQD and SOS','Phillips and Bride called for help by wireless. Draw 1 extra card.','Event'),R('Carpathia turns','Captain Rostron raced Carpathia toward Titanic. Every player draws 1 card.','Event'),R('Lifeboat launch','The first lifeboat, No. 7, was lowered about 12:45 am. Draw a Lifeboat card if one is in the deck.','Event')];
let snapD=0,P,deck,disc,clock,turn,over,snap,log=[];
const $=id=>document.getElementById(id);
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
const time=c=>{let m=40+c*10,h=11+Math.floor(m/60);m%=60;return((h-1)%12+1)+':'+String(m).padStart(2,'0')+(h>=12?' am':' pm')};
function L(s){log.unshift(s);if(log.length>60)log.pop()}
function draw(p){if(!deck.length){deck=shuffle(disc);disc=[]}const c=deck.pop();if(!c)return;if(c.t==='Event'){disc.push(c);L(`${p.name} drew event <b>${c.n}</b>: ${c.f}`);ev(p,c)}else p.h.push(c)}
function ev(p,c){if(c.n==='Iceberg warning')clock++;else if(c.n==='Carpathia turns')P.forEach(q=>draw(q));else if(c.n==='Lifeboat launch'){const i=deck.findIndex(x=>x.t==='Lifeboat');if(i>=0)p.h.push(deck.splice(i,1)[0])}else draw(p)}
function start(){const n=+$('nai').value;P=[{name:'You',h:[],s:0,ai:0}];for(let i=0;i<n;i++)P.push({name:['Lightoller\'s Mate','Purser','Steward'][i],h:[],s:0,ai:1});
deck=shuffle([...ROOMS,...ROOMS.map(x=>({...x})),...CREW,...PAS,...BOATS,...EV].map(x=>({...x})));disc=[];clock=0;turn=0;over=0;log=[];
P.forEach(p=>{for(let i=0;i<5;i++){let c=deck.pop();while(c.t==='Event'){deck.unshift(c);c=deck.pop()}p.h.push(c)}});
$('setup').style.display='none';$('game').style.display='block';L('11:40 pm, 14 April 1912: Titanic strikes an iceberg in the North Atlantic.');begin()}
function begin(){const p=P[turn];if(clock>=16)return end();draw(p);draw(p);if(clock>=16)return end();if(p.ai){ui();setTimeout(()=>ai(p),700)}else{snap=JSON.stringify(P[0]);snapD=disc.length;ui()}}
function sel(){return P[0].h.filter(c=>c.sel)}
function canLaunch(cs){const b=cs.filter(c=>c.t==='Lifeboat'),o=cs.filter(c=>c.t==='Crew'&&OFF.includes(c.n)),ps=cs.filter(c=>c.t==='Passenger');return b.length===1&&o.length===1&&ps.length>=1&&ps.length<=4&&cs.length===2+ps.length}
function canSet(cs){return cs.length===3&&(cs.every(c=>c.t==='Room')||cs.every(c=>c.t==='Crew'))&&new Set(cs.map(c=>c.n)).size===3}
function doLaunch(p,cs){const ps=cs.filter(c=>c.t==='Passenger');const pts=ps.reduce((s,c)=>s+2+(c.child?1:0),0);p.s+=pts;rm(p,cs);const b=cs.find(c=>c.t==='Lifeboat'),o=cs.find(c=>c.t==='Crew');L(`${p.name} launched <b>${b.n}</b> with ${o.n}, saving ${ps.length} passenger${ps.length>1?'s':''} (+${pts}).`)}
function doSet(p,cs){p.s+=4;rm(p,cs);L(`${p.name} laid a set of ${cs[0].t==='Room'?'ship rooms':'crew'}: ${cs.map(c=>c.n).join(', ')} (+4).`)}
function rm(p,cs){p.h=p.h.filter(c=>!cs.includes(c));cs.forEach(c=>{delete c.sel;disc.push(c)})}
function finishTurn(p){while(p.h.length>8){const i=p.ai?p.h.findIndex(c=>c.t==='Room'):-1;const c=p.h.splice(i>=0?i:0,1)[0];delete c.sel;disc.push(c)}
turn=(turn+1)%P.length;if(turn===0)clock++;begin()}
function ai(p){if(over)return;let did=1;while(did){did=0;const b=p.h.find(c=>c.t==='Lifeboat'),o=p.h.find(c=>c.t==='Crew'&&OFF.includes(c.n)),ps=p.h.filter(c=>c.t==='Passenger').slice(0,4);
if(b&&o&&ps.length){doLaunch(p,[b,o,...ps]);did=1;continue}
const rs=[...new Map(p.h.filter(c=>c.t==='Room').map(c=>[c.n,c])).values()];if(rs.length>=3){doSet(p,rs.slice(0,3));did=1;continue}
const cr=[...new Map(p.h.filter(c=>c.t==='Crew'&&!OFF.includes(c.n)).map(c=>[c.n,c])).values()];if(cr.length>=3){doSet(p,cr.slice(0,3));did=1}}
finishTurn(p)}
function end(){over=1;const w=[...P].sort((a,b)=>b.s-a.s);L(`2:20 am, 15 April 1912: Titanic sank. Carpathia arrived about 4 am and rescued about 710 survivors. More than 1,500 people were lost.`);L(`<b>${w[0].name} ${w[0].name==='You'?'win':'wins'} with ${w[0].s} points.</b>`);ui();$('msg').innerHTML='Game over. <button class="b" onclick="location.reload()">Play again</button>'}
function ui(){$('clock').textContent='🕰 '+time(Math.min(clock,16))+(clock>=16?' (sunk)':'')+' · '+(over?'Game over':P[turn].name+"'s turn");$('dk').textContent=deck.length;
$('track').innerHTML=Array.from({length:16},(_,i)=>`<i class="${i<clock?'d':''}"></i>`).join('');
$('opp').innerHTML=P.slice(1).map(p=>`<div><b>${p.name}</b><br>Score ${p.s} · ${p.h.length} cards</div>`).join('');$('me').textContent=P[0].s;
const h=$('hand');h.innerHTML='';P[0].h.forEach(c=>{const d=document.createElement('div');d.className='tc '+c.t+(c.sel?' sel':'');d.innerHTML=`<span class="ty">${c.t}${c.t==='Crew'&&OFF.includes(c.n)?' · Officer':''}</span><b>${c.n}</b><div class="f">${c.f}</div>`;d.onclick=()=>{if(over||turn)return;c.sel=!c.sel;ui()};h.appendChild(d)});
const my=!over&&turn===0,cs=sel();$('launch').disabled=!(my&&canLaunch(cs));$('set').disabled=!(my&&canSet(cs));$('end').disabled=!my;$('undo').disabled=!my||JSON.stringify(P[0])===snap;
$('log').innerHTML=log.map(s=>'<div>'+s+'</div>').join('');if(my)$('msg').textContent='Select cards, then Launch or Lay set. Officers: Smith, Murdoch, Lightoller, Pitman, Boxhall, Lowe.'}
$('start').onclick=start;$('rulesb').onclick=$('rulesb2').onclick=()=>$('rules').style.display='block';$('rclose').onclick=()=>$('rules').style.display='none';
$('launch').onclick=()=>{doLaunch(P[0],sel());ui()};$('set').onclick=()=>{doSet(P[0],sel());ui()};
$('undo').onclick=()=>{const o=JSON.parse(snap);P[0].h=o.h;P[0].s=o.s;disc.length=snapD;log=log.filter(s=>!s.startsWith('You launched')&&!s.startsWith('You laid'));ui()};
$('end').onclick=()=>{P[0].h.forEach(c=>delete c.sel);finishTurn(P[0])};
window.CBTC={get P(){return P},get over(){return over},get clock(){return clock}};
})();
