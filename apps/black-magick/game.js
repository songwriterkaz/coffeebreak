window.POTION={key:'blackmagick',who:['night-shift nurse','wary landlord','grieving widow','nervous bride','old sailor','tired mum','travelling witch','raven keeper'],
ing:[['Black Salt','🧂','protects',0],['Obsidian','🖤','grounds',0],['Rosemary','🌿','cleanses',0],['Black Candle','🕯️','absorbs',0],['Mugwort','🍃','reveals',0],['Iron Nail','📍','shields',40],['Myrrh','🟤','banishes',60],['Raven Feather','🪶','carries messages',80],['Graveyard Dirt','⚱️','endings',110],['Moon Water','🌙','amplifies',140]],
rec:[['Protection Ward',['Black Salt','Obsidian','Rosemary'],'🛡️','salt, stone and a cleansing herb',0,'A ring of safety around your home.'],
['Banishing Brew',['Black Candle','Myrrh','Black Salt'],'🚪','burn away, resin, salt',3,'Sends bad habits and bad energy packing.'],
['Hex-Breaker Draught',['Rosemary','Iron Nail','Black Candle'],'⛓️','herb, metal, flame',0,'Snaps any lingering bad luck.'],
['Uncrossing Oil',['Rosemary','Mugwort','Moon Water'],'🔓','two herbs and the moon',1,'Clears blocked roads.'],
['Cord-Cutting Elixir',['Black Candle','Iron Nail','Graveyard Dirt'],'✂️','flame, metal, endings',3,'Gently cuts ties that drain you.'],
['Cleansing Smoke',['Rosemary','Mugwort','Black Salt'],'💨','two herbs and salt',2,'Freshens a room after an argument.'],
['Shadow Sight Tonic',['Mugwort','Obsidian','Raven Feather'],'👁️','reveal, ground, a messenger',2,'For honest shadow work.'],
['Mirror Shield',['Obsidian','Iron Nail','Moon Water'],'🪞','stone, metal, moon',1,'Reflects negativity back into the void.'],
['Restful Night Potion',['Moon Water','Rosemary','Obsidian'],'😴','moon, herb, stone',0,'Peaceful, nightmare-free sleep.'],
['Raven’s Message',['Raven Feather','Black Candle','Moon Water'],'🐦‍⬛','feather, flame, moon',1,'Sends a wish into the night.'],
['Threshold Guard',['Iron Nail','Black Salt','Graveyard Dirt'],'🚪','metal, salt, earth',3,'Nothing unwelcome crosses your door.'],
['Midnight Elixir',['Myrrh','Raven Feather','Graveyard Dirt'],'🌌','resin, feather, earth – the rarest',2,'The final page of the Black Grimoire.']]};
(function(){
const C=window.POTION,$=id=>document.getElementById(id);
const K='cb_'+C.key+'_v1';let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({coins:0,known:[],ing:C.ing.filter(i=>!i[3]).map(i=>i[0]),lvl:1,served:0,day:0},S||{});const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let AC;function snd(f,d,t){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const MOON=['🌑 New Moon','🌒 Waxing','🌓 First Quarter','🌔 Gibbous','🌕 Full Moon','🌖 Waning','🌗 Last Quarter','🌘 Balsamic'];
let pot=[],req=null,stir=0;
const key=a=>a.slice().sort().join('+');const R={};C.rec.forEach(r=>R[key(r[1])]=r);
function newReq(){const avail=C.rec.filter(r=>r[1].every(i=>S.ing.includes(i)));const r=avail[Math.floor(Math.random()*avail.length)];req={r,who:C.who[Math.floor(Math.random()*C.who.length)]};draw()}
function add(i){if(pot.length>=3)return msg('The cauldron holds 3 ingredients – stir or empty it.');pot.push(i);stir=0;snd(300+pot.length*120,.15,'triangle');bubble();draw()}
function bubble(){const c=$('pcCaul');c.classList.remove('bub');void c.offsetWidth;c.classList.add('bub')}
function brew(){if(pot.length<3)return msg('Add 3 ingredients first.');const r=R[key(pot)];const moon=S.day%8,bonus=r&&r[4]==moon%4?2:1;
 if(!r){snd(120,.4,'sawtooth');msg('💨 The brew fizzles into grey smoke… no recipe matches. Try another mix!');pot=[];return draw()}
 const isNew=!S.known.includes(r[0]);if(isNew){S.known.push(r[0]);S.coins+=15;[523,659,784,1047].forEach((f,i)=>setTimeout(()=>snd(f,.3,'triangle'),i*110))}else snd(700,.2,'triangle');
 let m=`${r[2]} You brewed <b>${r[0]}</b>!${isNew?' ✨ New grimoire page! +15🪙':''}`;
 if(req&&req.r[0]==r[0]){const c=(10+r[1].length*4)*bonus*(1+S.lvl*.1)|0;S.coins+=c;S.served++;if(S.served%4==0){S.lvl++;m+=' ⬆️ Level '+S.lvl}m+=` The ${req.who} is delighted: +${c}🪙${bonus>1?' (moon bonus x2!)':''}`;S.day++;setTimeout(newReq,1400)}
 msg(m);pot=[];save();draw()}
function msg(m){$('pcMsg').innerHTML=m}
function draw(){const moon=S.day%8;
 $('pcHud').innerHTML=`${MOON[moon]} • Level ${S.lvl} • 🪙 ${S.coins} • 📖 ${S.known.length}/${C.rec.length} recipes`;
 $('pcReq').innerHTML=req?`<b>${req.who}</b> asks for <b>${req.r[2]} ${req.r[0]}</b><br><small>${S.known.includes(req.r[0])?'Recipe: '+req.r[1].map(i=>C.ing.find(x=>x[0]==i)[1]+' '+i).join(' + '):'Hint: '+req.r[3]}</small>`:'';
 $('pcPot').innerHTML=pot.map(i=>`<span>${C.ing.find(x=>x[0]==i)[1]}</span>`).join('')||'<small>empty</small>';
 $('pcIng').innerHTML=C.ing.map(i=>{const own=S.ing.includes(i[0]);return`<button class="pcI${own?'':' lock'}" data-i="${i[0]}">${i[1]}<b>${i[0]}</b><small>${own?i[2]:'🔒 '+i[3]+'🪙'}</small></button>`}).join('');
 $('pcBook').innerHTML=C.rec.map(r=>S.known.includes(r[0])?`<li>${r[2]} <b>${r[0]}</b> – ${r[1].map(i=>C.ing.find(x=>x[0]==i)[1]).join(' ')}<br><small>${r[5]}</small></li>`:`<li class="unk">❔ <i>Unknown page</i> – <small>${r[3]}</small></li>`).join('');
 document.querySelectorAll('.pcI').forEach(b=>b.onclick=()=>{const n=b.dataset.i;if(!S.ing.includes(n)){const c=C.ing.find(x=>x[0]==n)[3];if(S.coins<c)return msg('Need '+c+' coins to unlock '+n);S.coins-=c;S.ing.push(n);save();snd(900,.3,'triangle');return draw()}add(n)})}
$('pcBrew').onclick=brew;$('pcEmpty').onclick=()=>{pot=[];draw()};$('pcSkip').onclick=()=>{S.day++;save();newReq()};
newReq();})();
