window.POTION={key:'whitemagick',who:['young mum','shy student','new homeowner','gardener','retired teacher','lonely baker','healer','bride-to-be'],
ing:[['White Candle','🕯️','purifies',0],['Rose Petals','🌹','self-love',0],['Lavender','💜','calms',0],['Clear Quartz','💎','amplifies',0],['Honey','🍯','sweetens',0],['Sage','🌿','cleanses',40],['Citrine','🟡','abundance',60],['Moonstone','🌙','intuition',80],['Bay Leaf','🍃','wishes',100],['Spring Water','💧','renews',130]],
rec:[['Self-Love Bath',['Rose Petals','Honey','White Candle'],'💛','petals, sweetness, light',0,'Fall back in love with yourself.'],
['Calm Mind Mist',['Lavender','Clear Quartz','White Candle'],'😌','calm, amplify, light',1,'Soothes worry before bed.'],
['Lucky Charm',['Bay Leaf','Citrine','Honey'],'🍀','wish, gold stone, sweetness',0,'A little extra luck this week.'],
['Healing Light',['White Candle','Clear Quartz','Spring Water'],'✨','light, crystal, water',2,'A warm wish for recovery.'],
['Home Blessing',['Sage','Lavender','White Candle'],'🏡','two herbs and light',3,'Fresh, peaceful energy at home.'],
['Money Blessing Jar',['Citrine','Bay Leaf','Clear Quartz'],'💰','gold stone, wish, amplify',0,'Invites abundance (no guarantees!).'],
['Friendship Tea',['Honey','Lavender','Rose Petals'],'🫖','sweet, calm, petals',1,'Warmth between friends.'],
['Dream Sachet',['Moonstone','Lavender','Rose Petals'],'💤','moon stone, calm, petals',2,'Sweet, vivid dreams.'],
['Fresh Start Rinse',['Spring Water','Sage','Bay Leaf'],'🌅','water, cleanse, wish',3,'For new beginnings.'],
['Courage Candle',['White Candle','Citrine','Bay Leaf'],'🔥','light, gold stone, wish',0,'Find your brave.'],
['Intuition Oil',['Moonstone','Spring Water','Clear Quartz'],'🔮','moon stone, water, crystal',2,'Trust your gut.'],
['Full Moon Elixir',['Moonstone','Honey','Spring Water'],'🌕','moon, sweet, water – the rarest',2,'The final page of the White Grimoire.']]};
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
