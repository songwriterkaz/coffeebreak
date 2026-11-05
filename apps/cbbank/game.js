// Coffeebreak Bank - a PRETEND MONEY GAME. Not a real bank. No real names, cards or accounts.
(function(){
'use strict';
var KEY='cbbank-save-v2',PFX='CBBANK2-',GFX='CBGIFT-';
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var f=function(c){return '$'+(c/100).toFixed(2)};
var clean=function(s,n){return String(s||'').replace(/[^\p{L}\p{N} \-'.,&]/gu,'').replace(/!/g,'').trim().slice(0,n||20)};
var parse=function(s){var n=parseFloat(String(s||'').replace(/[^0-9.]/g,''));return isFinite(n)?Math.round(n*100):0};
function b64e(s){return btoa(unescape(encodeURIComponent(s)))}
function b64d(s){return decodeURIComponent(escape(atob(s)))}
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%1000003;return h}

/* ---------- storage: always guarded, with an in-memory fallback ---------- */
var mem={},storeOK=false;
function sGet(k){try{var v=window.localStorage.getItem(k);if(v!==null)return v}catch(e){}return mem[k]===undefined?null:mem[k]}
function sSet(k,v){mem[k]=v;try{window.localStorage.setItem(k,v);storeOK=true}catch(e){storeOK=false}}
function sDel(k){delete mem[k];try{window.localStorage.removeItem(k)}catch(e){}}

/* ---------- state (all money in cents) ---------- */
function fresh(){return{v:2,open:0,name:'',day:1,bal:0,sav:0,goals:[],tx:[],owned:{},up:{},chore:{},cups:0,cartEarn:0,
 card:{c:0,num:''},rate:100,rateDay:1,loan:null,lastPocket:-9,mgr:[],tipI:0,tips:{},ach:{},used:[],sent:[],rm:0,nid:1,intTot:0,goalsDone:0,choresDone:0}}
var S=fresh();
function load(){var r=sGet(KEY);if(r){try{S=norm(JSON.parse(r))}catch(e){S=fresh()}}
 try{if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!r)S.rm=1}catch(e){}}
function norm(o){var d=fresh();if(!o||typeof o!=='object'||o.v!==2)throw 0;var n=['day','bal','sav','cups','cartEarn','rate','rateDay','lastPocket','tipI','nid','intTot','goalsDone','choresDone'];
 for(var i=0;i<n.length;i++){var v=Number(o[n[i]]);if(isFinite(v))d[n[i]]=Math.round(v)}
 d.open=o.open?1:0;d.rm=o.rm?1:0;d.name=clean(o.name,16);d.day=Math.max(1,d.day);d.bal=Math.max(0,d.bal);d.sav=Math.max(0,d.sav);d.rate=Math.min(300,Math.max(25,d.rate));
 d.goals=(Array.isArray(o.goals)?o.goals:[]).slice(0,12).map(function(g){return{id:+g.id||0,n:clean(g.n,24),t:Math.max(100,Math.round(+g.t||100)),s:Math.max(0,Math.round(+g.s||0)),e:String(g.e||'').slice(0,4)}});
 d.tx=(Array.isArray(o.tx)?o.tx:[]).slice(0,200).map(function(t){return{d:+t.d||1,t:t.t==='in'?'in':'out',a:Math.max(0,Math.round(+t.a||0)),l:clean(t.l,40),c:clean(t.c,12)}});
 ['owned','up','chore','tips','ach'].forEach(function(k){var s=o[k]&&typeof o[k]==='object'?o[k]:{},t={};Object.keys(s).slice(0,60).forEach(function(q){var v=Number(s[q]);if(isFinite(v))t[clean(q,20)]=v});d[k]=t});
 d.card={c:Math.min(5,Math.max(0,+(o.card&&o.card.c)||0)),num:String((o.card&&o.card.num)||'').replace(/[^0-9 ]/g,'').slice(0,19)};
 if(o.loan&&typeof o.loan==='object'){d.loan={p:Math.max(0,Math.round(+o.loan.p||0)),owe:Math.max(0,Math.round(+o.loan.owe||0)),r:Math.min(400,Math.max(0,Math.round(+o.loan.r||0)))}}
 d.mgr=(Array.isArray(o.mgr)?o.mgr:[]).slice(0,8).map(function(m){return{d:+m.d||1,k:m.k==='yes'?'yes':'no',t:clean(m.t,40),m:clean(m.m,260)}});
 d.used=(Array.isArray(o.used)?o.used:[]).slice(0,100).map(function(x){return String(x).slice(0,30)});d.sent=(Array.isArray(o.sent)?o.sent:[]).slice(0,100).map(function(x){return String(x).slice(0,30)});return d}
function save(){try{sSet(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- data ---------- */
var MGR='Ms Penny Mocha';
var CHORES=[{id:'toys',n:'Tidy the toys',e:'🧸',taps:3,p:300},{id:'plants',n:'Water the plants',e:'🪴',taps:3,p:200},{id:'cups',n:'Wash the cups',e:'🍵',taps:4,p:400},{id:'recy',n:'Sort the recycling',e:'♻️',taps:4,p:400},{id:'walk',n:'Walk the neighbour dog',e:'🐕',taps:5,p:500}];
var DRINKS=['Latte','Flat white','Mocha','Iced coffee','Hot chocolate'];
var ITEMS=[{id:'mug',n:'Coffee mug',e:'☕',p:600},{id:'plant',n:'Little plant',e:'🪴',p:800},{id:'bear',n:'Teddy bear',e:'🧸',p:1200},{id:'art',n:'Art set',e:'🎨',p:1400},{id:'ball',n:'Football',e:'⚽',p:1500},{id:'game',n:'Board game',e:'🎲',p:1800},{id:'blank',n:'Soft blanket',e:'🧣',p:2000},{id:'phones',n:'Headphones',e:'🎧',p:2500},{id:'skate',n:'Skateboard',e:'🛹',p:4000},{id:'bike',n:'Bike',e:'🚲',p:12000}];
var UPS=[{id:'booster',n:'Savings booster',e:'🚀',p:5000,d:'Adds half a percent to your daily savings interest.'},{id:'tools',n:'Tool kit',e:'🧰',p:3500,d:'Every chore pays $1 more.'},{id:'piggy',n:'Big piggy bank',e:'🐷',p:4000,d:'Pocket money is $5 bigger.'}];
var COLS=[['#b8346c','#f08aa9'],['#6b4429','#c08a5e'],['#2f7a5a','#78c3a0'],['#5a4fb0','#a79df0'],['#c2570c','#f2a65a'],['#33415c','#7f8fb5']];
var TIPS=[
['Pay yourself first','When money comes in, move some into savings straight away. Even a small amount adds up.'],
['Needs and wants','A need is something you must have. A want is nice to have. Cover needs first, then enjoy wants.'],
['Interest is a reward','A bank pays you interest for keeping money in savings. The longer it stays, the more it grows.'],
['Borrowing costs extra','When you borrow, you pay back more than you took. The extra is interest. Borrow only when you must.'],
['Make a goal','Pick something you want and a target. Watching the ring fill makes saving feel good.'],
['Wait a day','Before buying a want, wait a day. If you still love it tomorrow, it may be worth it.'],
['Compare first','The same thing can cost different amounts. Look before you buy.'],
['Earn it','Money comes from work. Chores and jobs are how coins arrive in this game.'],
['Keep a safety jar','Keep a little spare in savings for surprises, so a surprise does not wipe you out.'],
['Never share secrets','In real life, never share bank passwords, card numbers or codes with anyone. In this game, never type them either.'],
['Track your money','Look at where your money goes. A simple chart shows what you spend the most on.'],
['Small steps win','Saving five coins a day beats waiting for one big amount.']];
var BADGES=[['chore','First chore'],['goal','Goal reached'],['sav50','Saved 50'],['gift','Sent a gift code'],['buy','First purchase'],['week','Played 7 days'],['repaid','Loan paid back'],['learn','Read 5 tips']];

/* ---------- helpers ---------- */
var tab='home',sub='menu',filt='all',showN=8,cartCust='',custKey=0,sendCode='',confirmReset=0,prog={},lastSavShown=0,pickLoan=50*100,toastT;
function toast(t){var e=$('#toast');e.textContent=t;e.className='show';clearTimeout(toastT);toastT=setTimeout(function(){e.className=''},2600)}
function tx(t,a,l,c){S.tx.unshift({d:S.day,t:t,a:a,l:l,c:c||''});S.tx=S.tx.slice(0,200)}
function award(k,msg){if(!S.ach[k]){S.ach[k]=1;toast('Badge earned: '+msg)}}
function total(){return S.bal+S.sav}
function checks(){if(S.sav>=5000)award('sav50','Saved 50');if(S.day>=7)award('week','Played 7 days');if(Object.keys(S.tips).length>=5)award('learn','Read 5 tips')}
function chorePay(){return S.up.tools?100:0}
function savRate(){return S.rate+(S.up.booster?50:0)}
function loanLimit(){return Math.min(30000,4000+2000*S.day)}
function mgrNote(k,t,m){S.mgr.unshift({d:S.day,k:k,t:t,m:m});S.mgr=S.mgr.slice(0,8);return{k:k,t:t,m:m}}
var lastMsg=null;
function clip(text){var ok=false;try{var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.cssText='position:fixed;opacity:0;top:0;left:0';document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(e){ok=false}
 if(ok)return toast('Copied');
 try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast('Copied')},function(){toast('Press and hold the code to copy it')});return}}catch(e){}
 toast('Press and hold the code to copy it')}

/* ---------- Bank Manager avatar (made-up character, simple illustration) ---------- */
function mgrSvg(sz,mood){var m=mood==='think'?'<path d="M44 66 q6 3 12 0" stroke="#7a2e2e" stroke-width="2.6" fill="none" stroke-linecap="round"/>':'<path d="M42 64 q8 9 16 0" stroke="#7a2e2e" stroke-width="2.8" fill="#fff" stroke-linecap="round"/>';
 return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 100 100" role="img" aria-label="Ms Penny Mocha, the pretend bank manager"><circle cx="50" cy="50" r="50" fill="#ffe0ea"/>'+
 '<path d="M14 100 q2-26 36-26 q34 0 36 26z" fill="#e0568f"/><path d="M38 76 l12 14 l12-14 l-6-3 h-12z" fill="#fff"/><path d="M50 90 l-4 10 h8z" fill="#b8346c"/>'+
 '<rect x="62" y="84" width="22" height="11" rx="3" fill="#d4af37"/><rect x="65" y="87" width="16" height="2" fill="#6b4429"/><rect x="65" y="90.5" width="11" height="2" fill="#6b4429"/>'+
 '<rect x="43" y="64" width="14" height="12" rx="4" fill="#f1c19c"/>'+
 '<path d="M22 54 q-6-40 28-40 q34 0 28 40 q-2 14-8 18 q4-22-20-26 q-24 4-20 26 q-6-4-8-18z" fill="#5a3320"/>'+
 '<ellipse cx="50" cy="52" rx="22" ry="25" fill="#f6cfaa"/>'+
 '<path d="M28 46 q4-22 24-22 q16 0 20 20 q-12-12-26-12 q-12 2-18 14z" fill="#5a3320"/>'+
 '<circle cx="41" cy="52" r="3" fill="#3d2415"/><circle cx="59" cy="52" r="3" fill="#3d2415"/><circle cx="42" cy="51" r="1" fill="#fff"/><circle cx="60" cy="51" r="1" fill="#fff"/>'+
 '<circle cx="41" cy="52" r="8.5" fill="none" stroke="#b8346c" stroke-width="2.2"/><circle cx="59" cy="52" r="8.5" fill="none" stroke="#b8346c" stroke-width="2.2"/><path d="M49.5 52 h1" stroke="#b8346c" stroke-width="2.2"/>'+
 '<circle cx="35" cy="62" r="4" fill="#f4a3a8" opacity=".55"/><circle cx="65" cy="62" r="4" fill="#f4a3a8" opacity=".55"/>'+m+'</svg>'}

function greet(){var n=esc(S.name||'friend');
 if(!S.open)return 'Hello and welcome to Coffeebreak Bank. I am '+MGR+', the pretend bank manager. Come and open your pretend account.';
 if(S.loan)return 'Hello '+n+'. You still owe '+f(S.loan.owe)+' on your pretend loan. Pay a little when you can and it will shrink.';
 var near=S.goals.filter(function(g){return g.s>=g.t});if(near.length)return 'Hello '+n+'. Your goal "'+esc(near[0].n)+'" is full. Visit the Save page to claim it.';
 if(S.day-S.lastPocket>=3)return 'Hello '+n+'. Your pocket money is ready to ask for. Pop into my office any time.';
 if(S.sav===0&&S.bal>=500)return 'Hello '+n+'. Why not move a little into savings today. It earns interest every game day.';
 return 'Hello '+n+'. Lovely to see you. Your savings interest today is '+(savRate()/100).toFixed(2)+' percent.'}

/* ---------- manager decisions ---------- */
function askPocket(){var amt=1000+(S.up.piggy?500:0),next=S.lastPocket+3;
 if(S.day<next)return mgrNote('no','Pocket money not yet','Thank you for asking. Pocket money comes every 3 game days, so please come back on day '+next+'. In the meantime a chore or the coffee cart can earn you some coins.');
 if(total()>=15000)return mgrNote('no','Pocket money not needed','You already have '+f(total())+' in your accounts, which is lovely. I will save the pocket money for when you need it. Try a savings goal with some of it.');
 S.lastPocket=S.day;S.bal+=amt;tx('in',amt,'Pocket money from the bank','pocket');return mgrNote('yes','Pocket money approved','Of course. Here is '+f(amt)+' of pretend pocket money. A good idea is to put some straight into savings.')}
function askLoan(a){
 if(S.loan)return mgrNote('no','Loan not approved','Let us finish your current loan first. One at a time keeps things simple. You owe '+f(S.loan.owe)+'.');
 if(S.day<2)return mgrNote('no','Loan not approved yet','You are new here, so I would like to get to know you first. Come back tomorrow, after you press Next day, and we can talk about it.');
 if(a>loanLimit())return mgrNote('no','Loan too big for now','That is a bit more than I can lend you today. Your limit is '+f(loanLimit())+' and it grows as you keep playing. Try a smaller amount.');
 if(S.bal>=a*2)return mgrNote('no','Loan not needed','You already have '+f(S.bal)+' in spending. Borrowing costs extra, so it is smarter to use your own coins first.');
 var lr=S.rate+100;S.loan={p:a,owe:a,r:lr};S.bal+=a;tx('in',a,'Pretend loan','loan');
 return mgrNote('yes','Loan approved','Approved. I have added '+f(a)+' to your spending account. The loan grows by '+(lr/100).toFixed(2)+' percent every game day, so paying it back early costs less.')}
function reviewRate(auto){var r=S.sav/Math.max(1,total()),nr=r>=.5?150:r>=.25?100:75,old=S.rate;S.rate=nr;S.rateDay=S.day;
 var why=nr===150?'You keep at least half of your money in savings, so I am giving you our best rate.':nr===100?'You keep a good share in savings, so you get our standard rate.':'You keep only a small share in savings right now. Save a little more and your rate will go up at the next review.';
 return mgrNote('yes',(auto?'Weekly rate review: ':'Rate review: ')+(nr/100).toFixed(2)+' percent a day',why+(nr===old?' It stays the same as before.':''))}
function askRate(){if(S.day-S.rateDay<3)return mgrNote('no','Rate review too soon','I reviewed your rate on day '+S.rateDay+'. Please ask again on day '+(S.rateDay+3)+', once your savings have had time to change.');return reviewRate(false)}
function nextTip(){var t=TIPS[S.tipI%TIPS.length];S.tipI++;return mgrNote('yes','Tip: '+t[0],t[1])}

/* ---------- game actions ---------- */
function nextDay(){S.day++;S.chore={};S.cups=0;var old=S.sav,msg='';
 if(S.sav>0){var i=Math.round(S.sav*savRate()/10000);if(i<1)i=1;S.sav+=i;S.intTot+=i;tx('in',i,'Savings interest','interest');msg='Interest +'+f(i)}
 if(S.loan){var li=Math.round(S.loan.owe*S.loan.r/10000);if(li<1)li=1;S.loan.owe+=li}
 if(S.day%7===1){reviewRate(true)}
 checks();save();lastSavShown=old;render(true);toast('Day '+S.day+(msg?'. '+msg:''))}
function move(dir,a){a=a||parse(($('#mv')||{}).value);if(a<=0)return toast('Type an amount first');
 if(dir==='sv'){if(a>S.bal)return toast('Not enough in spending');S.bal-=a;S.sav+=a;toast('Moved '+f(a)+' to savings')}
 else{if(a>S.sav)return toast('Not enough in savings');S.sav-=a;S.bal+=a;toast('Moved '+f(a)+' to spending')}
 checks();save();render()}
function addGoal(){var n=clean($('#gn').value,24),t=parse($('#gt').value);if(!n)return toast('Give your goal a name');if(t<100)return toast('Pick a target of at least $1');if(S.goals.length>=8)return toast('That is plenty of goals for now');
 var em=['⭐','🎯','🌈','🏆','🎁'][S.goals.length%5];S.goals.push({id:S.nid++,n:n,t:t,s:0,e:em});save();render();toast('Goal added')}
function fundGoal(id,a){var g=S.goals.filter(function(x){return x.id===id})[0];if(!g)return;var room=g.t-g.s;if(a==='rest')a=room;a=Math.min(a,room);if(a<=0)return toast('That goal is full');if(a>S.sav)return toast('Not enough in savings. Move some over first');
 S.sav-=a;g.s+=a;if(g.s>=g.t)toast('Goal is full. Claim it');else toast('Added '+f(a));save();render()}
function claimGoal(id){var i=S.goals.findIndex(function(x){return x.id===id}),g=S.goals[i];if(!g||g.s<g.t)return;S.goals.splice(i,1);S.goalsDone++;tx('out',g.t,'Goal reached: '+g.n,'goal');award('goal','Goal reached');save();render();toast('You reached "'+g.n+'". Well done')}
function buy(id,isUp){var list=isUp?UPS:ITEMS,it=list.filter(function(x){return x.id===id})[0];if(!it)return;if(isUp&&S.up[id])return;if(it.p>S.bal)return toast('Not enough in spending. Earn some coins first');
 S.bal-=it.p;if(isUp)S.up[id]=1;else S.owned[id]=(S.owned[id]||0)+1;tx('out',it.p,'Bought '+it.n,'shop');award('buy','First purchase');save();render();toast('You bought '+it.n)}
function tapChore(id){var c=CHORES.filter(function(x){return x.id===id})[0];if(!c||S.chore[id])return;prog[id]=(prog[id]||0)+1;
 if(prog[id]>=c.taps){prog[id]=0;S.chore[id]=1;var p=c.p+chorePay();S.bal+=p;S.choresDone++;tx('in',p,c.n,'job');award('chore','First chore');toast('Chore done. You earned '+f(p))}
 save();render()}
function newCust(){custKey=Math.floor(Math.random()*DRINKS.length);cartCust=DRINKS[custKey]}
function serve(d){if(S.cups>=10)return toast('The cart is closed for today. Press Next day');S.cups++;
 if(d===cartCust){S.bal+=200;S.cartEarn+=200;tx('in',200,'Coffee cart: '+d,'job');toast('Correct. You earned $2.00')}else toast('Not quite. That customer wanted a '+cartCust.toLowerCase());
 newCust();save();render()}
function repay(a){if(!S.loan)return;if(a==='all')a=S.loan.owe;a=Math.min(a,S.loan.owe);if(a>S.bal)return toast('Not enough in spending');if(a<=0)return;S.bal-=a;S.loan.owe-=a;tx('out',a,'Loan repayment','loan');
 if(S.loan.owe<=0){S.loan=null;award('repaid','Loan paid back');lastMsg=mgrNote('yes','Loan paid back','Wonderful. You paid back your pretend loan in full. Paying back is a great money habit.')}
 else toast('Paid '+f(a));save();render()}
function fakeNum(){var d='0000 0000 ',x;do{x='';for(var i=0;i<8;i++)x+=Math.floor(Math.random()*10)}while(luhn('00000000'+x));return d+x.slice(0,4)+' '+x.slice(4)}
function luhn(s){var t=0,a=false;for(var i=s.length-1;i>=0;i--){var n=+s[i];if(a){n*=2;if(n>9)n-=9}t+=n;a=!a}return t%10===0}
function sendGift(){var a=parse($('#sa').value),to=clean($('#sn').value,16);if(a<=0)return toast('Type an amount');if(a>S.bal)return toast('Not enough in spending');if(a>5000)return toast('Gift codes are up to $50 each');
 var id='G'+S.nid++ +'x'+Math.floor(Math.random()*9999),from=S.name||'Friend',body={i:id,f:from,a:a};body.c=hash(id+from+a);S.bal-=a;S.sent.push(id);tx('out',a,'Gift code'+(to?' for '+to:''),'gift');award('gift','Sent a gift code');
 sendCode=GFX+b64e(JSON.stringify(body));save();render();toast('Gift code made. Copy it and share it')}
function redeem(){var raw=($('#rc').value||'').trim();try{if(raw.indexOf(GFX)!==0)throw 0;var b=JSON.parse(b64d(raw.slice(GFX.length)));if(!b||typeof b.i!=='string'||b.c!==hash(b.i+b.f+b.a)||!(b.a>0&&b.a<=5000))throw 0;
 if(S.used.indexOf(b.i)>=0)return toast('That gift code was already used');if(S.sent.indexOf(b.i)>=0)return toast('You cannot use your own gift code');
 S.used.push(b.i);S.bal+=b.a;tx('in',b.a,'Gift from '+clean(b.f,16),'gift');save();render();toast('You received '+f(b.a))}catch(e){toast('That code does not look right. Check it and try again')}}
function exportCode(){return PFX+b64e(JSON.stringify(S))}
function importCode(){var raw=($('#ic').value||'').trim();try{if(raw.indexOf(PFX)!==0)throw 0;S=norm(JSON.parse(b64d(raw.slice(PFX.length))));lastMsg=null;sendCode='';save();tab='home';render();toast('Save code loaded')}catch(e){toast('That save code does not look right')}}

/* ---------- views ---------- */
function ring(p,txt){var r=34,c=2*Math.PI*r;return '<div class="ring"><svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle class="bg" cx="42" cy="42" r="'+r+'"/><circle class="fg" cx="42" cy="42" r="'+r+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-Math.min(1,p))).toFixed(1)+'"/></svg><div class="t">'+txt+'</div></div>'}
function chart(){var days=[],i,d;for(i=6;i>=0;i--)days.push(S.day-i);var data=days.map(function(dd){var a=0,b=0;S.tx.forEach(function(t){if(t.d===dd){if(t.t==='in')a+=t.a;else b+=t.a}});return{d:dd,i:a,o:b}});
 var mx=Math.max(100,Math.max.apply(null,data.map(function(x){return Math.max(x.i,x.o)}))),h=100,s='';
 data.forEach(function(x,k){var X=14+k*44,hi=Math.round(x.i/mx*h),ho=Math.round(x.o/mx*h);s+='<rect x="'+X+'" y="'+(110-hi)+'" width="17" height="'+hi+'" rx="3" fill="#2f7a5a"/><rect x="'+(X+18)+'" y="'+(110-ho)+'" width="17" height="'+ho+'" rx="3" fill="#b8346c"/><text x="'+(X+17)+'" y="128" font-size="11" text-anchor="middle" fill="#6b4429">'+(x.d>0?'D'+x.d:'')+'</text>'});
 var desc='Coins in and out for the last 7 game days: '+data.map(function(x){return 'day '+x.d+' in '+f(x.i)+' out '+f(x.o)}).join(', ');
 return '<svg viewBox="0 0 322 134" width="100%" role="img" aria-label="'+esc(desc)+'"><line x1="8" y1="110.5" x2="314" y2="110.5" stroke="#ecd3c4"/>'+s+'</svg><div class="row small muted" style="justify-content:center;gap:18px"><span><b style="color:#2f7a5a">&#9632;</b> Coins in</span><span><b style="color:#b8346c">&#9632;</b> Coins out</span></div>'}
function catBars(){var m={},tot=0;S.tx.forEach(function(t){if(t.t==='out'){m[t.c||'other']=(m[t.c||'other']||0)+t.a;tot+=t.a}});var k=Object.keys(m).sort(function(a,b){return m[b]-m[a]});
 if(!k.length)return '<p class="muted">Nothing spent yet. Visit the shop or set a goal.</p>';var nm={shop:'Shop',goal:'Goals',gift:'Gifts',loan:'Loan repayments',other:'Other'};
 return k.map(function(c){var p=Math.round(m[c]/tot*100);return '<div style="margin:8px 0"><div class="row" style="margin:0"><span>'+esc(nm[c]||c)+'</span><b style="text-align:right">'+f(m[c])+'</b></div><div class="bar" role="img" aria-label="'+p+' percent"><i style="width:'+p+'%"></i></div></div>'}).join('')}
function mgrCard(msg,mood){return '<div class="mgr"><div class="av">'+mgrSvg(78,mood)+'</div><div class="bubble"><b>'+MGR+'</b><br>'+msg+'</div></div>'}
function decision(m){if(!m)return '';return '<div class="card" role="status" style="border:3px solid '+(m.k==='yes'?'#2e7d4f':'#c98a1b')+'"><div class="mgr"><div class="av">'+mgrSvg(66,m.k==='yes'?'smile':'think')+'</div><div class="bubble"><span class="badge '+m.k+'">'+(m.k==='yes'?'Approved':'Not this time')+'</span><br><b>'+esc(m.t)+'</b><br>'+esc(m.m)+'</div></div></div>'}

var V={};
V.open=function(){return '<div class="gamebanner"><b>THIS IS A GAME</b><span>Pretend money only. Not a real bank. No real money, cards or accounts.</span></div><div class="card">'+mgrCard(greet())+'</div><div class="card"><h2>Open your pretend account</h2><p class="muted">You start with $20.00 of pretend coins. Pick a nickname. Please do not type your real name, address or any card or account numbers.</p><label for="nm">Nickname</label><input type="text" id="nm" maxlength="16" autocomplete="off" placeholder="For example Star Baker"><div class="row"><button class="big" data-a="open">Open my pretend account</button></div></div>'};
V.home=function(){var tt=S.tx.filter(function(t){return filt==='all'||t.t===filt}),list=tt.slice(0,showN).map(function(t){return '<div class="tx"><div>'+esc(t.l)+'<small>Day '+t.d+'</small></div><div class="amt '+t.t+'">'+(t.t==='in'?'+':'-')+f(t.a)+'</div></div>'}).join('')||'<p class="muted">No transactions yet.</p>';
 return '<div class="gamebanner"><b>THIS IS A GAME</b><span>Pretend money only. Not a real bank. Never type real names, card or account numbers.</span></div>'+
 '<div class="card">'+mgrCard(greet())+'<div class="row"><button class="alt" data-a="tab:office">Visit the manager</button></div></div>'+
 '<div class="hero"><div class="row" style="margin:0"><span class="pill">Day '+S.day+'</span><span class="lbl" style="text-align:right">Hi '+esc(S.name)+'</span></div><div class="lbl" style="margin-top:8px">All your pretend coins</div><div class="num" id="tot">'+f(total())+'</div>'+(S.loan?'<div class="lbl">Loan owing '+f(S.loan.owe)+'</div>':'')+'<div class="row"><button class="big" style="background:#fff;color:var(--coffeed)" data-a="next">Next day (savings earn interest)</button></div></div>'+
 '<div class="grid2" style="margin-bottom:14px"><div class="acct sp"><div class="l">Spending account</div><div class="n">'+f(S.bal)+'</div></div><div class="acct sv"><div class="l">Saving account</div><div class="n" id="sv1">'+f(S.sav)+'</div><div class="l">'+(savRate()/100).toFixed(2)+' percent a day</div></div></div>'+
 '<div class="card"><h2>Move money</h2><label for="mv">Amount</label><input type="text" id="mv" inputmode="decimal" placeholder="For example 5.00" autocomplete="off"><div class="grid2" style="margin-top:8px"><button data-a="mv:sv">To savings</button><button class="coffee" data-a="mv:sp">To spending</button></div></div>'+
 '<div class="card"><h2>Last 7 game days</h2>'+chart()+'<h3>Where your coins went</h3>'+catBars()+'</div>'+
 '<div class="card"><h2>Transaction history</h2><div class="chips" role="group" aria-label="Filter">'+['all','in','out'].map(function(k){return '<button class="alt'+(filt===k?' on':'')+'" data-a="filt:'+k+'" aria-pressed="'+(filt===k)+'">'+{all:'All',in:'Coins in',out:'Coins out'}[k]+'</button>'}).join('')+'</div>'+list+(tt.length>showN?'<div class="row"><button class="alt" data-a="more">Show more</button></div>':'')+'</div>'};
V.earn=function(){if(!cartCust)newCust();
 return '<div class="card"><h2>Pocket money</h2><p class="muted">Ask the bank manager. She decides if pocket money is right for today.</p><button class="big" data-a="pocket">Ask for pocket money</button></div>'+(lastMsg&&lastMsg.t.indexOf('Pocket')===0?decision(lastMsg):'')+
 '<div class="card"><h2>Chores</h2><p class="muted">Tap to work. Each chore can be done once a game day. '+(chorePay()?'Your tool kit adds $1.00 to each one.':'')+'</p>'+CHORES.map(function(c){var d=S.chore[c.id],p=prog[c.id]||0;return '<div class="ringwrap">'+ring(d?1:p/c.taps,d?'Done':p+'/'+c.taps)+'<div style="flex:1"><b>'+c.e+' '+c.n+'</b><div class="muted small">Earns '+f(c.p+chorePay())+'</div><button style="margin-top:6px" data-a="chore:'+c.id+'"'+(d?' disabled':'')+'>'+(d?'Finished today':'Work on it')+'</button></div></div>'}).join('')+'</div>'+
 '<div class="card"><h2>Coffee cart job</h2><p class="muted">Serve the drink the customer asks for. Each right drink earns $2.00. Cups left today: <b>'+(10-S.cups)+'</b></p><div class="tip" style="border-left-color:var(--coffee)"><b>Customer says:</b> "A '+cartCust.toLowerCase()+', please."</div><div class="chips">'+DRINKS.map(function(d){return '<button class="alt" data-a="serve:'+esc(d)+'">'+d+'</button>'}).join('')+'</div><p class="muted small">Total earned at the cart: '+f(S.cartEarn)+'</p></div>'};
V.save=function(){var g=S.goals.map(function(g){var p=g.s/g.t;return '<div class="ringwrap">'+ring(p,Math.round(p*100)+'%')+'<div style="flex:1"><b>'+g.e+' '+esc(g.n)+'</b><div class="muted small">'+f(g.s)+' of '+f(g.t)+'</div>'+(g.s>=g.t?'<button style="margin-top:6px" data-a="claim:'+g.id+'">Claim your goal</button>':'<div class="chips" style="margin-top:6px"><button class="alt" data-a="fund:'+g.id+':500">+$5</button><button class="alt" data-a="fund:'+g.id+':1000">+$10</button><button class="alt" data-a="fund:'+g.id+':rest">Fill it</button></div>')+'</div></div>'}).join('')||'<p class="muted">No goals yet. Add one below.</p>';
 var proj='',v=S.sav,k;if(S.sav>0){var pv=[];for(k=0;k<=10;k++){pv.push(v);v=v+Math.max(1,Math.round(v*savRate()/10000))}var mx=pv[10],bars='';pv.forEach(function(x,i){var h=Math.round(x/mx*80);bars+='<rect x="'+(8+i*28)+'" y="'+(90-h)+'" width="20" height="'+h+'" rx="3" fill="'+(i?'#78c3a0':'#2f7a5a')+'"/>'});
  proj='<svg viewBox="0 0 320 100" width="100%" role="img" aria-label="If you add nothing, your savings of '+f(S.sav)+' would grow to '+f(pv[10])+' in 10 game days">'+bars+'</svg><p class="muted small">If you add nothing more, '+f(S.sav)+' grows to about <b>'+f(pv[10])+'</b> in 10 game days.</p>'}
 else proj='<p class="muted">Move some coins into savings to see them grow.</p>';
 return '<div class="hero" style="background:linear-gradient(135deg,#2f7a5a,#4c9a78)"><div class="lbl">Saving account</div><div class="num" id="sv2">'+f(S.sav)+'</div><div class="lbl">Interest rate '+(savRate()/100).toFixed(2)+' percent every game day, set by '+MGR+'</div><div class="lbl">Interest earned so far: <b>'+f(S.intTot)+'</b></div><div class="row"><button class="big" style="background:#fff;color:var(--coffeed)" data-a="next">Next day and watch it grow</button></div></div>'+
 '<div class="card"><h2>How your savings grow</h2>'+proj+'</div><div class="card"><h2>Savings goals</h2>'+g+'</div>'+
 '<div class="card"><h2>New goal</h2><label for="gn">What are you saving for</label><input type="text" id="gn" maxlength="24" autocomplete="off" placeholder="For example New bike"><label for="gt">Target amount</label><input type="text" id="gt" inputmode="decimal" autocomplete="off" placeholder="For example 50.00"><div class="row"><button data-a="goal">Add goal</button></div><p class="muted small">Money you add to a goal comes out of your saving account.</p></div>'};
V.shop=function(){var own=ITEMS.filter(function(i){return S.owned[i.id]}).map(function(i){return '<span style="font-size:34px" title="'+i.n+'" aria-label="'+i.n+'">'+i.e+(S.owned[i.id]>1?'<small style="font-size:13px">x'+S.owned[i.id]+'</small>':'')+'</span>'}).join(' ')||'<span class="muted">Nothing yet. Buy something and it appears here.</span>';
 return '<div class="card"><h2>Your pretend room</h2><div class="row" style="gap:14px">'+own+'</div><p class="muted small">Spending account: <b>'+f(S.bal)+'</b></p></div>'+
 '<div class="card"><h2>Upgrades</h2>'+UPS.map(function(u){return '<div class="ringwrap"><div style="font-size:36px">'+u.e+'</div><div style="flex:1"><b>'+u.n+'</b> <span class="muted">'+f(u.p)+'</span><div class="muted small">'+u.d+'</div><button style="margin-top:6px" data-a="up:'+u.id+'"'+(S.up[u.id]?' disabled':'')+'>'+(S.up[u.id]?'You have it':'Buy')+'</button></div></div>'}).join('')+'</div>'+
 '<div class="card"><h2>Pretend shop</h2><p class="muted">Think first. Is it a need or a want.</p><div class="shopg">'+ITEMS.map(function(i){return '<div class="item"><div class="e">'+i.e+'</div><div>'+i.n+'</div><div class="p">'+f(i.p)+'</div><button data-a="buy:'+i.id+'">Buy</button></div>'}).join('')+'</div></div>'};
V.office=function(){var lim=loanLimit(),amts=[2500,5000,10000,20000].filter(function(a){return a<=30000});
 var notes=S.mgr.map(function(m){return '<div class="tx"><div><span class="badge '+m.k+'">'+(m.k==='yes'?'Yes':'Not now')+'</span> '+esc(m.t)+'<small>Day '+m.d+'. '+esc(m.m)+'</small></div></div>'}).join('')||'<p class="muted">No decisions yet.</p>';
 return '<div class="office"><div>'+mgrSvg(120,'smile')+'</div><div class="plate">'+MGR+' - Bank Manager</div></div>'+
 (lastMsg?decision(lastMsg):'<div class="card">'+mgrCard('Welcome to my office, '+esc(S.name)+'. I can help with pocket money, a pretend loan, your interest rate and savings tips. Everything here is pretend, so no worries.')+'</div>')+
 '<div class="card"><h2>Ask the manager</h2><div class="row"><button data-a="m:pocket">Pocket money</button><button data-a="m:rate">Review my interest rate</button><button class="coffee" data-a="m:tip">Give me a savings tip</button></div></div>'+
 '<div class="card"><h2>Pretend loan</h2>'+(S.loan?'<p>You owe <b>'+f(S.loan.owe)+'</b> (borrowed '+f(S.loan.p)+'). It grows by '+(S.loan.r/100).toFixed(2)+' percent every game day.</p><div class="chips"><button class="alt" data-a="repay:1000">Pay $10</button><button class="alt" data-a="repay:2500">Pay $25</button><button data-a="repay:all">Pay it all</button></div>'
  :'<p class="muted">Your limit today is '+f(lim)+'. A loan grows by '+((S.rate+100)/100).toFixed(2)+' percent every game day, so you pay back more than you borrow. I decide if it is a good idea.</p><div class="chips" role="group" aria-label="Loan amount">'+amts.map(function(a){return '<button class="alt'+(pickLoan===a?' on':'')+'" data-a="pick:'+a+'" aria-pressed="'+(pickLoan===a)+'">'+f(a)+'</button>'}).join('')+'</div><div class="row"><button class="big" data-a="m:loan">Ask for a '+f(pickLoan)+' loan</button></div>')+'</div>'+
 '<div class="card"><h2>Interest rate board</h2><div class="grid2"><div class="item"><div class="muted small">Savings pay</div><div class="p">'+(savRate()/100).toFixed(2)+'%</div><div class="muted small">a game day</div></div><div class="item"><div class="muted small">Loans cost</div><div class="p">'+((S.rate+100)/100).toFixed(2)+'%</div><div class="muted small">a game day</div></div></div><p class="muted small">I set the rate for you on day '+S.rateDay+'. I review it every 7 game days, or you can ask. A bigger share in savings earns a better rate.'+(S.up.booster?' Your booster adds 0.50 percent.':'')+'</p></div>'+
 '<div class="card"><h2>My notes about you</h2>'+notes+'</div>'};
V.more=function(){var h='';
 if(sub==='menu')h='<div class="menu">'+[['cards','💳','Pretend card and PayID'],['send','🎁','Send to a friend, gift codes'],['learn','📚','Learn about money'],['badges','🏅','Badges'],['code','💾','Save code, export and import'],['set','⚙️','Settings and about']].map(function(m){return '<button data-a="sub:'+m[0]+'"><span class="ic">'+m[1]+'</span><span>'+m[2]+'</span></button>'}).join('')+'</div>';
 else{h='<div class="row"><button class="alt" data-a="sub:menu">Back to More</button></div>';
  if(sub==='cards'){var c=COLS[S.card.c],slug=(S.name||'friend').toLowerCase().replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'')||'friend';
   h+='<div class="card"><h2>Your pretend card</h2><div class="dc" style="background:linear-gradient(135deg,'+c[0]+','+c[1]+')"><div class="b">Coffeebreak Bank</div><div class="f">PRETEND CARD</div><div class="chip"></div><div class="nu">'+esc(S.card.num)+'</div><div class="nm">'+esc(S.name)+'</div><img src="cb-logo.jpg" alt=""></div><div class="chips" role="group" aria-label="Card colour">'+COLS.map(function(x,i){return '<button class="sw'+(i===S.card.c?' on':'')+'" style="background:linear-gradient(135deg,'+x[0]+','+x[1]+')" data-a="col:'+i+'" aria-label="Card colour '+(i+1)+'" aria-pressed="'+(i===S.card.c)+'"></button>'}).join('')+'</div><div class="row"><button class="alt" data-a="num">Make a new pretend number</button></div><p class="muted small">This card cannot buy anything. The number always starts with 0000 and is not a real card number.</p></div>'+
   '<div class="card"><h2>Your pretend PayID</h2><div class="tip"><b>'+esc(slug)+'@pretend.pay</b></div><p class="muted small">A made-up address for the game only. It is not a real PayID. Friends can send you a gift code, see Send to a friend.</p></div>'}
  if(sub==='send')h+='<div class="card"><h2>Send a gift code</h2><p class="muted">There is no internet bank here, so you send pretend coins with a code. Make a code, copy it, and give it to your friend to paste in their game.</p><label for="sn">Friend nickname (optional)</label><input type="text" id="sn" maxlength="16" autocomplete="off"><label for="sa">Amount, up to $50.00</label><input type="text" id="sa" inputmode="decimal" autocomplete="off"><div class="row"><button class="big" data-a="send">Make gift code</button></div>'+(sendCode?'<label for="sc">Your gift code</label><textarea id="sc" readonly>'+esc(sendCode)+'</textarea><div class="row"><button class="coffee" data-a="copy:sc">Copy code</button></div><p class="muted small">Each code works once.</p>':'')+'</div><div class="card"><h2>Got a gift code</h2><label for="rc">Paste it here</label><textarea id="rc" placeholder="CBGIFT-..."></textarea><div class="row"><button class="big" data-a="redeem">Add to my spending account</button></div></div>';
  if(sub==='learn')h+='<div class="card">'+mgrCard('Here are my favourite money tips. Tap "I learned this" on each to earn $1.00 once.')+'</div>'+TIPS.map(function(t,i){var got=S.tips[i];return '<div class="tip"><b>'+t[0]+'</b><div>'+t[1]+'</div><div class="row"><button class="alt" data-a="tip:'+i+'"'+(got?' disabled':'')+'>'+(got?'Learned':'I learned this (+$1.00)')+'</button></div></div>'}).join('');
  if(sub==='badges')h+='<div class="card"><h2>Badges</h2><div class="badges">'+BADGES.map(function(b){return '<div class="bdg'+(S.ach[b[0]]?' got':'')+'">'+(S.ach[b[0]]?'🏅 ':'🔒 ')+b[1]+'</div>'}).join('')+'</div></div>';
  if(sub==='code')h+='<div class="card"><h2>Save code</h2><p class="muted">'+(storeOK?'Your game also saves on this device.':'This page may not be able to save by itself, so use a save code to keep your game.')+' Copy your code and keep it somewhere safe. Paste it later to carry on.</p><label for="ec">Your save code</label><textarea id="ec" readonly>'+esc(exportCode())+'</textarea><div class="row"><button data-a="copy:ec">Copy save code</button></div></div><div class="card"><h2>Load a save code</h2><textarea id="ic" placeholder="CBBANK2-..."></textarea><div class="row"><button class="coffee" data-a="import">Load save code</button></div><p class="muted small">Loading replaces the game you see now.</p></div>';
  if(sub==='set')h+='<div class="card"><h2>Settings</h2><div class="switch"><div><b>Reduce motion</b><div class="muted small">Turns off sliding, filling and counting. Nothing in this game flashes.</div></div><button data-a="rm" aria-pressed="'+(!!S.rm)+'">'+(S.rm?'On':'Off')+'</button></div></div><div class="card"><h2>About this game</h2><p>Coffeebreak Bank is a pretend money game. It is not a real bank and it never asks for real names, cards, accounts or payments. '+MGR+' is a made-up character.</p></div><div class="card"><h2>Start over</h2><p class="muted">This clears your pretend game. Make a save code first if you want to keep it.</p>'+(confirmReset?'<div class="row"><button class="coffee" data-a="reset2">Yes, clear my game</button><button class="alt" data-a="reset0">No, keep it</button></div>':'<button class="alt" data-a="reset1">Start over</button>')+'</div>'}
 return h};

var TABS=[['home','🏠','Home'],['earn','💪','Earn'],['save','🐷','Save'],['shop','🛍️','Shop'],['office','🧑‍💼','Office'],['more','☰','More']];
function render(anim){document.documentElement.classList.toggle('rm',!!S.rm);
 $('#tabbar').innerHTML=S.open?TABS.map(function(t){return '<button data-a="tab:'+t[0]+'" class="'+(tab===t[0]?'on':'')+'" aria-current="'+(tab===t[0]?'page':'false')+'"><span class="ic" aria-hidden="true">'+t[1]+'</span>'+t[2]+'</button>'}).join(''):'';
 $('#tabbar').style.display=S.open?'flex':'none';
 var v=S.open?(V[tab]||V.home):V.open;$('#main').innerHTML=v();
 if(anim&&!S.rm){['sv1','sv2'].forEach(function(id){var el=document.getElementById(id);if(el&&lastSavShown!==S.sav)count(el,lastSavShown,S.sav)})}}
function count(el,a,b){var t0=null;function st(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/1400);el.textContent=f(Math.round(a+(b-a)*p));if(p<1)requestAnimationFrame(st)}requestAnimationFrame(st)}

document.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b||b.disabled)return;var a=b.getAttribute('data-a'),p=a.split(':');
 switch(p[0]){
 case 'open':{var n=clean($('#nm').value,16);if(!n)return toast('Pick a nickname first');S.name=n;S.open=1;S.bal=2000;S.card.num=fakeNum();S.day=1;tx('in',2000,'Welcome coins from the bank','pocket');lastMsg=mgrNote('yes','Welcome','Welcome to Coffeebreak Bank, '+n+'. Here are $20.00 of pretend coins to start. Have a look around, and visit me any time.');save();tab='home';render();toast('Account opened. This is a pretend game');break}
 case 'tab':tab=p[1];sub='menu';render();try{window.scrollTo(0,0);document.body.scrollTop=0}catch(x){}break;
 case 'sub':sub=p[1];render();try{document.body.scrollTop=0}catch(x){}break;
 case 'next':nextDay();break;
 case 'mv':move(p[1]);break;
 case 'filt':filt=p[1];showN=8;render();break;
 case 'more':showN+=10;render();break;
 case 'goal':addGoal();break;
 case 'fund':fundGoal(+p[1],p[2]==='rest'?'rest':+p[2]);break;
 case 'claim':claimGoal(+p[1]);break;
 case 'buy':buy(p[1],false);break;
 case 'up':buy(p[1],true);break;
 case 'chore':tapChore(p[1]);break;
 case 'serve':serve(p.slice(1).join(':'));break;
 case 'pocket':lastMsg=askPocket();save();render();toast(lastMsg.k==='yes'?'Pocket money approved':'The manager has an answer');break;
 case 'm':if(p[1]==='pocket')lastMsg=askPocket();if(p[1]==='loan')lastMsg=askLoan(pickLoan);if(p[1]==='rate')lastMsg=askRate();if(p[1]==='tip')lastMsg=nextTip();save();render();try{document.body.scrollTop=0}catch(x){}break;
 case 'pick':pickLoan=+p[1];render();break;
 case 'repay':repay(p[1]==='all'?'all':+p[1]);break;
 case 'col':S.card.c=+p[1];save();render();break;
 case 'num':S.card.num=fakeNum();save();render();break;
 case 'send':sendGift();break;
 case 'redeem':redeem();break;
 case 'copy':clip(($('#'+p[1])||{}).value||'');break;
 case 'import':importCode();break;
 case 'tip':{var i=+p[1];if(!S.tips[i]){S.tips[i]=1;S.bal+=100;tx('in',100,'Learned: '+TIPS[i][0],'learn');checks();save();render();toast('You earned $1.00')}break}
 case 'rm':S.rm=S.rm?0:1;save();render();break;
 case 'reset1':confirmReset=1;render();break;
 case 'reset0':confirmReset=0;render();break;
 case 'reset2':{var rm=S.rm;S=fresh();S.rm=rm;confirmReset=0;lastMsg=null;sendCode='';prog={};sDel(KEY);tab='home';sub='menu';render();toast('Game cleared');break}
 }});

window.CBBANK={get state(){return S},luhn:luhn,fakeNum:fakeNum};
load();render();
})();
