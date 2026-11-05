(function(){
const $=id=>document.getElementById(id),cv=$('wb'),x=cv.getContext('2d'),W=cv.width,H=cv.height;
const bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
const K='cb_kidswb_v1';let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({stars:0,age:1,done:{},badges:[]},S||{});const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let col='#1f4fd1',size=8,erase=false,drawing=false,last=null,Q=null,subj='maths',act=null;
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)],shuf=a=>a.slice().sort(()=>Math.random()-.5);
function say(t){try{const u=new SpeechSynthesisUtterance(t);u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function ding(ok){try{const A=new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain();o.frequency.value=ok?880:200;o.type='triangle';g.gain.setValueAtTime(.1,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+.3);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.3)}catch(e){}}
// ---- whiteboard ----
function P(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
cv.addEventListener('pointerdown',e=>{drawing=true;last=P(e);cv.setPointerCapture(e.pointerId);dot(last)});
cv.addEventListener('pointermove',e=>{if(!drawing)return;const p=P(e);x.globalCompositeOperation=erase?'destination-out':'source-over';x.strokeStyle=col;x.lineWidth=erase?40:size;x.lineCap='round';x.beginPath();x.moveTo(last.x,last.y);x.lineTo(p.x,p.y);x.stroke();last=p});
cv.addEventListener('pointerup',()=>{drawing=false;if(act=='trace')$('wbCheck').hidden=false});
function dot(p){x.globalCompositeOperation=erase?'destination-out':'source-over';x.fillStyle=col;x.beginPath();x.arc(p.x,p.y,(erase?40:size)/2,0,7);x.fill()}
function wipe(){x.clearRect(0,0,W,H)}
document.querySelectorAll('.mk').forEach(m=>m.onclick=()=>{col=m.dataset.c;erase=false;document.querySelectorAll('.mk').forEach(z=>z.classList.toggle('on',z===m));$('erBtn').classList.remove('on')});
$('erBtn').onclick=()=>{erase=!erase;$('erBtn').classList.toggle('on',erase)};$('clrBtn').onclick=wipe;$('szBtn').onclick=()=>{size=size==8?16:size==16?4:8;$('szBtn').textContent='✏️ '+(size==4?'Thin':size==8?'Medium':'Thick')};
function bgClear(){b.clearRect(0,0,W,H)}
function bgText(t,y,sz,c){b.fillStyle=c||'#333';b.font=`bold ${sz}px Comic Sans MS, Chalkboard, system-ui`;b.textAlign='center';b.textBaseline='middle';b.fillText(t,W/2,y)}
function render(){$('wbBg').style.backgroundImage='url('+bg.toDataURL()+')'}
// ---- question banks ----
const AGE=['5-6','7-8','9-10','11-12'];
const M={
 sums(){const a=S.age,mx=[10,20,100,1000][a-1];let p=rnd(1,mx/2),q=rnd(1,mx/2),op=a>1&&Math.random()<.5?'-':'+';if(op=='-'&&q>p)[p,q]=[q,p];const ans=op=='+'?p+q:p-q;return{q:`${p} ${op} ${q} = ?`,say:`What is ${p} ${op=='+'?'plus':'minus'} ${q}?`,big:`${p} ${op} ${q} =`,ans,ch:nums(ans)}},
 times(){const n=[2,5,rnd(2,10),rnd(2,12)][S.age-1],m=rnd(1,[5,10,12,12][S.age-1]);return{q:`${n} × ${m} = ?`,say:`What is ${n} times ${m}?`,big:`${n} × ${m} =`,ans:n*m,ch:nums(n*m)}},
 count(){const e=pick(['🍎','⭐','🐞','🐟','🦘','🌸','🚗','🧁']),n=rnd(2,[10,20,30,40][S.age-1]);return{q:`How many ${e}?`,say:'Count them! You can tick each one on the board.',draw(){b.font='38px serif';for(let i=0;i<n;i++)b.fillText(e,70+(i%10)*80,120+Math.floor(i/10)*70)},ans:n,ch:nums(n)}},
 shapes(){const sh=[['circle',0],['square',4],['triangle',3],['rectangle',4],['pentagon',5],['hexagon',6],['octagon',8]].slice(0,[4,5,6,7][S.age-1]);const s=pick(sh);const ask=S.age>2&&s[1]?'sides':'name';return{q:ask=='name'?'What shape is this?':`How many sides does a ${s[0]} have?`,say:ask=='name'?'What shape is this? Try drawing one next to it!':`How many sides does a ${s[0]} have?`,draw(){poly(s[0])},ans:ask=='name'?s[0]:s[1],ch:ask=='name'?shuf([s[0],...shuf(sh.filter(z=>z!==s).map(z=>z[0])).slice(0,3)]):nums(s[1]||1)}}
};
function poly(n){b.strokeStyle='#1f4fd1';b.lineWidth=8;b.beginPath();const cx=W/2,cy=H/2,r=150;if(n=='circle')b.arc(cx,cy,r,0,7);else if(n=='rectangle')b.rect(cx-200,cy-110,400,220);else{const k={square:4,triangle:3,pentagon:5,hexagon:6,octagon:8}[n];for(let i=0;i<=k;i++){const a=-Math.PI/2+i*2*Math.PI/k+(k==4?Math.PI/4:0);b.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))}}b.stroke()}
function nums(a){const s=new Set([a]);while(s.size<4){const d=a+rnd(-5,5);if(d>=0)s.add(d)}return shuf([...s])}
const WORDS=[['cat','🐱'],['dog','🐶'],['sun','☀️'],['bus','🚌'],['hat','🎩'],['fish','🐟'],['frog','🐸'],['tree','🌳'],['star','⭐'],['cake','🎂'],['koala','🐨'],['apple','🍎'],['train','🚂'],['house','🏠'],['rocket','🚀'],['banana','🍌'],['kangaroo','🦘'],['elephant','🐘'],['butterfly','🦋'],['umbrella','☂️']];
const SIGHT=[['the','and','is','it','to','a','I','we','go','see'],['said','have','come','they','was','you','what','here','some','like'],['because','friend','could','would','should','people','water','through','again','thought'],['necessary','believe','separate','definitely','environment','government','beautiful','different','experience','immediately']];
const E={
 trace(){const a=S.age;const t=a==1?pick('ABCDEFGHIJKLMNOPQRSTUVWXYZ'):a==2?pick('abcdefghijklmnopqrstuvwxyz'):pick(WORDS.slice(0,10))[0];return{trace:t,q:`Trace: ${t}`,say:`Trace the ${t.length>1?'word':'letter'} ${t}`}},
 spell(){const w=pick(WORDS.filter(z=>z[0].length<=[3,5,6,9][S.age-1]));return{spell:w[0],q:`Spell the word for ${w[1]}`,say:`Spell ${w[0]}`,draw(){b.font='160px serif';b.textAlign='center';b.fillText(w[1],W/2,H/2)}}},
 sight(){const L=SIGHT[S.age-1],w=pick(L);return{q:'Listen 🔊 and tap the word you hear',say:w,ans:w,ch:shuf([w,...shuf(L.filter(z=>z!==w)).slice(0,3)]),replay:1}},
 phonics(){const w=pick(WORDS);return{q:`What sound does ${w[1]} start with?`,say:`${w[0]}. What sound does it start with?`,draw(){b.font='170px serif';b.textAlign='center';b.fillText(w[1],W/2,H/2)},ans:w[0][0],ch:shuf([w[0][0],...shuf([...'bcdfghjklmnprstw'].filter(z=>z!==w[0][0])).slice(0,3)])}}
};
const LAB={plant:[['🌸','flower','makes seeds'],['🍃','leaf','makes food from sunlight'],['🌿','stem','carries water up'],['🟫','roots','soak up water']],body:[['🧠','brain','thinks'],['❤️','heart','pumps blood'],['🫁','lungs','breathe air'],['🦴','bones','hold you up'],['💪','muscles','help you move']],space:[['☀️','Sun','a star'],['🌍','Earth','our home planet'],['🔴','Mars','the red planet'],['🪐','Saturn','has big rings'],['🌕','Moon','orbits Earth'],['🟠','Jupiter','the biggest planet']]};
const SORT=[['Living or non-living?',['Living','Non-living'],[['🐶',0],['🌳',0],['🪨',1],['🚗',1],['🐟',0],['🧸',1],['🌻',0],['☁️',1]]],['Does it float or sink?',['Float','Sink'],[['🪵',0],['🪨',1],['🦆',0],['🔑',1],['🎈',0],['🪙',1],['🍎',0],['⚓',1]]],['Is it magnetic?',['Magnetic','Not magnetic'],[['📎',0],['🧲',0],['🔩',0],['🥄',0],['🧻',1],['🍌',1],['🪵',1],['🧦',1]]]];
const EXP=[['If you put ice in the sun, what happens?','It melts',['It melts','It grows','It turns blue','Nothing']],['What do plants need to grow?','Water and sunlight',['Water and sunlight','Only chocolate','Darkness','Nothing']],['Mix red and yellow paint – what colour?','Orange',['Orange','Green','Purple','Blue']],['What makes a shadow?','Blocking light',['Blocking light','Wind','Rain','Music']],['Water turns to steam when it is…','Heated',['Heated','Frozen','Shaken','Painted']],['Which is a gas?','Steam',['Steam','Ice','Wood','Rock']],['A ball rolls down a ramp because of…','Gravity',['Gravity','Magnets','Light','Sound']],['Vinegar + bicarb soda makes…','Fizzy bubbles',['Fizzy bubbles','Ice','Gold','Nothing']]];
const SC={
 label(){const k=pick(['plant','body','space'].slice(0,S.age>1?3:1)),L=LAB[k],t=pick(L);return{q:`Which one is the ${t[1]}? (${t[2]})`,say:`Which one is the ${t[1]}?`,draw(){b.font='90px serif';b.textAlign='center';L.forEach((z,i)=>b.fillText(z[0],W*(i+1)/(L.length+1),H/2))},ans:t[0],ch:shuf(L.map(z=>z[0]))}},
 sort(){const s=pick(SORT),it=pick(s[2]);return{q:s[0],say:s[0],draw(){b.font='170px serif';b.textAlign='center';b.fillText(it[0],W/2,H/2)},ans:s[1][it[1]],ch:s[1]}},
 quiz(){const e=pick(EXP);return{q:e[0],say:e[0],ans:e[1],ch:shuf(e[2])}}
};
const SUBJ={maths:[['sums','➕ Sums',M],['times','✖️ Times tables',M],['count','🔢 Counting',M],['shapes','🔷 Shapes',M]],english:[['trace','✍️ Letter tracing',E],['spell','🔤 Spelling',E],['sight','👀 Sight words',E],['phonics','🔊 Phonics',E]],science:[['label','🏷️ Label it',SC],['sort','🗂️ Sorting',SC],['quiz','🧪 Experiments',SC]]};
function menu(){$('subjTabs').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.s==subj));$('acts').innerHTML=SUBJ[subj].map(a=>`<button data-a="${a[0]}" class="${act==a[0]?'on':''}">${a[1]}<small>⭐ ${S.done[a[0]]||0}</small></button>`).join('');document.querySelectorAll('#acts button').forEach(b=>b.onclick=()=>{act=b.dataset.a;menu();newQ()});
 $('ages').innerHTML=AGE.map((g,i)=>`<button class="${S.age==i+1?'on':''}" data-g="${i+1}">Age ${g}</button>`).join('');document.querySelectorAll('#ages button').forEach(b=>b.onclick=()=>{S.age=+b.dataset.g;save();menu();if(act)newQ()});
 $('stars').innerHTML=`⭐ ${S.stars} stars • 🏅 ${S.badges.join(' ')||'no badges yet'}`}
function newQ(){wipe();bgClear();$('wbCheck').hidden=true;$('fb').textContent='';const bank=SUBJ[subj].find(a=>a[0]==act)[2];Q=bank[act]();
 $('qq').textContent=Q.q;if(Q.big)bgText(Q.big,90,90,'#1f4fd1');if(Q.draw){b.textBaseline='middle';Q.draw()}
 if(Q.trace){b.setLineDash([14,12]);b.lineWidth=6;b.strokeStyle='#9aa7c7';b.font=`bold ${Q.trace.length>1?200:340}px Comic Sans MS, Chalkboard, system-ui`;b.textAlign='center';b.textBaseline='middle';b.strokeText(Q.trace,W/2,H/2+10);b.setLineDash([]);$('ch').innerHTML='';$('wbCheck').hidden=false}
 else if(Q.spell){let got='';const L=shuf([...Q.spell,...shuf([...'aeiourstln']).slice(0,3)]);$('ch').innerHTML=`<div id="spOut" class="spOut">_</div>`+L.map((c,i)=>`<button class="tile" data-i="${i}">${c}</button>`).join('')+'<button class="tile undo">⌫</button>';document.querySelectorAll('.tile').forEach(t=>t.onclick=()=>{if(t.classList.contains('undo')){got=got.slice(0,-1);document.querySelectorAll('.tile.used').forEach((u,i,a)=>{if(i==a.length-1)u.classList.remove('used')})}else{if(t.classList.contains('used'))return;got+=t.textContent;t.classList.add('used')}$('spOut').textContent=got||'_';if(got.length==Q.spell.length)mark(got==Q.spell)})}
 else $('ch').innerHTML=Q.ch.map(c=>`<button class="ans">${c}</button>`).join('')+(Q.replay?'<button class="ans rep">🔊 Again</button>':'');
 document.querySelectorAll('.ans').forEach(a=>a.onclick=()=>{if(a.classList.contains('rep'))return say(Q.say);mark(String(a.textContent)==String(Q.ans),a)});
 render();say(Q.say)}
function checkTrace(){const d=x.getImageData(0,0,W,H).data,g=b.getImageData(0,0,W,H).data;let t=0,hit=0;for(let i=3;i<d.length;i+=16){if(g[i]>0){t++;let near=false;if(d[i]>0)near=true;if(near)hit++}}const pct=t?hit/t:0;const st=pct>.45?3:pct>.25?2:pct>.1?1:0;st?award(st,`${'⭐'.repeat(st)} Great tracing!`):($('fb').textContent='Try following the dotted lines! ✏️')}
function mark(ok,el){ding(ok);if(ok){el&&el.classList.add('good');award(S.age>2?2:1,'✅ Correct! '+pick(['Awesome!','Brilliant!','Super star!','You got it!']));}else{el&&el.classList.add('bad');$('fb').textContent='❌ Not quite – the answer was '+(Q.ans??Q.spell);say('Good try!');setTimeout(newQ,1800)}}
function award(n,m){S.stars+=n;S.done[act]=(S.done[act]||0)+n;const B=[[10,'🌟 Rising Star'],[50,'🧮 Maths Whiz'],[100,'📚 Super Reader'],[200,'🔬 Little Scientist'],[400,'🏆 Whiteboard Champion']];B.forEach(([k,b])=>{if(S.stars>=k&&!S.badges.includes(b)){S.badges.push(b);m+=' 🏅 New badge: '+b}});save();$('fb').textContent=m;say(m.replace(/[^\w !']/g,''));confetti();menu();setTimeout(newQ,1800)}
function confetti(){for(let i=0;i<24;i++){const c=document.createElement('i');c.className='cf';c.style.left=Math.random()*100+'%';c.style.background=pick(['#1f4fd1','#22a35a','#f2b705','#f26b1d','#7a3ff2']);c.style.animationDelay=Math.random()*.3+'s';$('wbWrap').appendChild(c);setTimeout(()=>c.remove(),1500)}}
$('wbCheck').onclick=checkTrace;$('nextQ').onclick=()=>act&&newQ();$('sayQ').onclick=()=>Q&&say(Q.say);
$('subjTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{subj=b.dataset.s;act=SUBJ[subj][0][0];menu();newQ()});
act='sums';menu();newQ();
})();
