// Luna – Coffeebreak AI reader. On-device tarot generator (78 cards, no API, no server).
window.Reader=(function(){
const {DECK,SUITS}=window.TAROT,$=id=>document.getElementById(id);
const SYM=['☀','🌙','⭐','♾','👑','🗝','❤','⚔','🦁','🕯','☸','⚖','🙃','🦋','🏺','⛓','⚡','✨','🌕','🌞','📯','🌍'],SS=['🔥','🍷','🗡','🪙'];
const sym=c=>c.maj?SYM[c.num]:SS[c.suit];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TYPES={three:{n:'Tarot 3-card',p:['Past','Present','Future']},love:{n:'Love',p:['You','Them / your heart','Where it is heading']},career:{n:'Career',p:['Where you stand','What helps','Next step']},yesno:{n:'Yes / No',p:['Answer']},daily:{n:'Daily guidance',p:['Today']},
 deep:{n:'Deep Insight',p:['Situation','Challenge','Hidden influence','Advice','Outcome']},celtic:{n:'Celestial Celtic Cross',p:['Present','Challenge','Foundation','Recent past','Best outcome','Near future','Your approach','Surroundings','Hopes & fears','Outcome']}};
const FOCUS={love:'your heart and relationships',career:'your work, money and purpose',three:'the path you are on',yesno:'your question',daily:'the day ahead',deep:'your situation',celtic:'your journey'};
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%1e6)/1e6}}
function draw(n,r){r=r||Math.random;const d=DECK.slice();for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d.slice(0,n).map(c=>({c,rev:r()<.3}))}
const OPEN=['Luna shuffles the deck and lays out your cards…','The cards have settled. Here is what Luna sees.','Breathe in. Your cards are ready.'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
function interpret(k,q,cards){const T=TYPES[k],f=FOCUS[k];let h='',maj=0,rv=0,su=[0,0,0,0];
 cards.forEach((x,i)=>{const c=x.c;c.maj?maj++:su[c.suit]++;if(x.rev)rv++;h+=`<h3>${T.p[i]}: ${c.n}${x.rev?' (reversed)':''}</h3><p>${x.rev?c.rv:c.up}</p>`});
 const L=[pick(OPEN)];if(q)L.push(`You asked: <i>“${esc(q)}”</i>.`);
 if(k=='yesno'){const x=cards[0],m=['M12','M18','M10','M2'].includes(x.c.id);L.push(m?`${x.c.n} says <b>maybe</b>. Things are still moving, so give it a little time.`:x.rev?`${x.c.n} reversed leans towards <b>not yet / no</b>. Something needs to shift first.`:`${x.c.n} upright leans towards <b>yes</b>. The energy supports you.`)}
 else{const n=cards.length;L.push(`Your cards speak about ${f}.`);if(n==1)L.push(`${cards[0].c.n} is your card for today. Let its message travel with you.`);
  if(n>1&&maj/n>=.5)L.push('Many Major Arcana cards appear, so this is a big chapter with real lessons, not just everyday detail.');
  const mx=Math.max(...su);if(mx>=2)L.push(`${SUITS[su.indexOf(mx)][0]} lead the spread, putting the spotlight on ${SUITS[su.indexOf(mx)][4]}.`);
  if(n>1&&rv/n>.5)L.push('Several cards are reversed, which hints at energy that is blocked or turned inward. Be gentle and patient with yourself.');else if(n>1&&rv==0)L.push('Every card is upright, a sign of clear, flowing energy.');
  if(n>=3){const a=cards[0].c,b=cards[n-1].c;L.push(`The story moves from ${a.n} towards ${b.n}: ${(cards[n-1].rev?b.rv:b.up).split('. ')[0].toLowerCase()}.`)}}
 if(k=='love')L.push('In matters of love, Luna reminds you that the cards show energy, not fixed fate. Your choices shape what happens next.');
 if(k=='career')L.push('For your work life, pick one practical step from the advice above and take it this week.');
 if(k=='celtic'||k=='deep')L.push(`Luna's guidance: hold on to the message of ${cards[k=='deep'?3:6].c.n}, your advice card. ${(cards[k=='deep'?3:6].rev?cards[k=='deep'?3:6].c.rv:cards[k=='deep'?3:6].c.up)}`);
 return `<div class="tcards">${cards.map((x,i)=>`<div class="tc${x.rev?' rev':''}" style="animation-delay:${i*.15}s"><div class="sym">${sym(x.c)}</div><b>${x.c.n}</b><small>${T.p[i]}${x.rev?' · reversed':''}</small></div>`).join('')}</div><div class="reading"><p>${L.join(' ')}</p>${h}<p style="font-size:12px;color:#cbb8e0">Reading by Luna <span class="badge">AI reader</span> · For entertainment only.</p></div>`}
function daily(){const d=new Date(),k=d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate();let id='';try{id=localStorage.getItem('sp_uid')||'';if(!id){id=String(Math.random()).slice(2,9);localStorage.setItem('sp_uid',id)}}catch(e){}
 $('daily').innerHTML=interpret('daily','',draw(1,rng(k*31+(+id||7))))}
let type='three';
function types(){$('types').innerHTML=['three','love','career','yesno'].map(k=>`<button class="${k==type?'on':''}" data-k="${k}">${TYPES[k].n}</button>`).join('');$('types').querySelectorAll('button').forEach(b=>b.onclick=()=>{type=b.dataset.k;types()})}
const PRICE={deep:5.05,celtic:10.05};
function showDeep(o){$('deepOut').innerHTML='<h3 style="color:#e8c070">💫 Your '+TYPES[o.k].n+'</h3>'+interpret(o.k,o.q,draw(TYPES[o.k].p.length));$('deepOut').scrollIntoView({behavior:'smooth'})}
function init(){daily();types();$('draw').onclick=()=>{$('out').innerHTML=interpret(type,$('q').value.trim(),draw(TYPES[type].p.length))};
 let lastNo='';
 CBPay.mount('read-pay',{currency:'AUD',getItems:()=>[{name:'Luna AI reading – '+TYPES[$('dType').value].n,amount:PRICE[$('dType').value],qty:1}],
  validate:()=>{if(!$('dEmail').value){alert('Please add your email for your receipt.');return false}return true},email:()=>$('dEmail').value,
  subject:no=>{lastNo=no;try{localStorage.setItem('sp_read:'+no,JSON.stringify({k:$('dType').value,q:$('dQ').value.trim()}))}catch(e){}return 'Luna AI reading '+no+' – '+TYPES[$('dType').value].n},
  body:no=>'DIGITAL ITEM – AI tarot reading (no supplier, no shipping).\nType: '+TYPES[$('dType').value].n+' ($'+PRICE[$('dType').value]+' AUD)\nCustomer email: '+$('dEmail').value+'\nQuestion: '+$('dQ').value+'\nThe reading is generated in the customer\'s browser. If they report it did not appear, reply with a reading or refund.',
  onDone:()=>{setTimeout(()=>{const m=document.querySelector('#read-pay .cbpay-msg');if(m&&/^Thanks!/.test(m.textContent))showDeep({k:$('dType').value,q:$('dQ').value.trim()})},50)}});
 // back from PayPal: ?cbpaid=ORDER
 try{const no=new URLSearchParams(location.search).get('cbpaid'),o=no&&JSON.parse(localStorage.getItem('sp_read:'+no)||'null');
  if(o){document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t=='read'));['shop','read','cart'].forEach(s=>$(s).hidden=s!='read');
   if(!o.done){o.done=1;localStorage.setItem('sp_read:'+no,JSON.stringify(o))}showDeep(o)}}catch(e){}}
return {init,interpret,draw,TYPES};
})();
