(function(){
var $=function(i){return document.getElementById(i)},R=CBR;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return'&#'+c.charCodeAt(0)+';'})}
var q=new URLSearchParams(location.search);if(q.get('ref'))localStorage.setItem('cbMoviesRef',q.get('ref'));
function code(){return 'CB'+Math.random().toString(36).slice(2,8).toUpperCase()}
function subscribed(a){return a&&(a.paidMonths||[]).indexOf(R.month())>=0}
// return from PayPal subscription
if(q.get('cbsub')){R.upd(function(a){var m=R.month();if(a.paidMonths.indexOf(m)<0)a.paidMonths.push(m);a.subRef=q.get('cbsub')});R.log('subscribed',{ref:q.get('cbsub'),method:'PayPal'})}
function acct(){var a=R.me(),el=$('acct');
 if(!a){el.innerHTML='<h3>Create your account</h3><input id="n" placeholder="Your name"><input id="e" type="email" placeholder="Email"><input id="pp" type="email" placeholder="PayPal email for rewards"><input id="rf" placeholder="Friend\'s invite code (optional)" value="'+esc(localStorage.getItem('cbMoviesRef')||'')+'"><br><button id="mk">Create account</button><span id="am" class="small"></span>';
  $('mk').onclick=function(){var n=$('n').value.trim(),e=$('e').value.trim();if(!n||!/@/.test(e)){$('am').textContent=' Name and email please.';return}
   var d=R.db(),c=code();d.accounts[c]={code:c,name:n,email:e,paypal:$('pp').value.trim(),referredBy:$('rf').value.trim().toUpperCase(),created:new Date().toISOString(),paidMonths:[],watches:[],referrals:[]};d.current=c;R.save(d);R.log('signup');render()};return}
 el.innerHTML='<h3>Hi '+esc(a.name)+'</h3><div class="small">Email: '+esc(a.email)+' · Invite code: <b>'+a.code+'</b></div><div>PayPal email for rewards: <input id="pp" type="email" value="'+esc(a.paypal||'')+'"><button id="spp">Save</button></div>'+
 (subscribed(a)?'<p>✅ Subscribed for '+R.month()+'. Enjoy!</p>':'<p><b>Subscribe – $10 AUD/month</b> to unlock every movie.</p><button id="sub" style="background:#ffc439">Subscribe with PayPal</button><button id="pid">Pay by PayID</button><div id="pidp" class="small"></div>')+'<button id="out" style="background:#555;color:#fff">Log out</button>';
 $('spp').onclick=function(){R.upd(function(x){x.paypal=$('pp').value.trim()});R.log('paypal-updated');render()};
 $('out').onclick=function(){var d=R.db();d.current=null;R.save(d);render()};
 if($('sub'))$('sub').onclick=function(){var f=document.createElement('form');f.method='post';f.action=CBPay.PAYPAL_URL;f.target='_blank';
  var base=location.href.split('#')[0].split('?')[0],no='SUB-'+a.code+'-'+R.month();
  [['cmd','_xclick-subscriptions'],['business',CBPay.BUSINESS],['item_name','Coffeebreak monthly subscription'],['a3','10.00'],['p3','1'],['t3','M'],['src','1'],['sra','1'],['no_note','1'],['currency_code','AUD'],['custom',no],['invoice',no+'-'+Date.now()],['return',base+'?cbsub='+no],['cancel_return',base]].forEach(function(p){var i=document.createElement('input');i.type='hidden';i.name=p[0];i.value=p[1];f.appendChild(i)});
  document.body.appendChild(f);f.submit();R.log('subscribe-started',{ref:no,method:'PayPal'})};
 if($('pid'))$('pid').onclick=function(){var no='SUB-'+a.code+'-'+R.month();$('pidp').innerHTML='PayID: <b>'+CBPay.PAYID+'</b> · Amount: <b>$10.00 AUD</b> · Reference: <b>'+no+'</b><br><button id="pidok">I\'ve paid</button>';
  $('pidok').onclick=function(){R.upd(function(x){if(x.paidMonths.indexOf(R.month())<0)x.paidMonths.push(R.month())});R.log('subscribed',{ref:no,method:'PayID – check bank'});render()}}}
function rw(){var a=R.me(),el=$('rw');if(!a){el.innerHTML='<h3>Your rewards</h3><p class="small">Create an account to earn cashback points.</p>';return}
 var r=R.rewards(a);el.innerHTML='<h3>Your rewards – '+r.month+'</h3><div class="big">$'+r.total.toFixed(2)+'</div><div>'+r.watched+' movies watched in full · '+r.points+' points · watch cashback $'+r.cashback.toFixed(2)+' of $'+R.CAP.toFixed(2)+' max'+(r.referral?' · friend bonus $'+r.referral.toFixed(2):'')+'</div>'+(r.pending?'<div class="small">$'+r.pending.toFixed(2)+' waiting – it unlocks once this month is paid.</div>':'')+'<div class="small">Cashback on your own subscription, capped at 20% of your fee. Not income.</div>'}
var cur=null,seen=0,last=0,pickedId=null;
function grid(){var a=R.me(),sub=subscribed(a),m=R.month(),done={};(a&&a.watches||[]).forEach(function(w){if(w.m===m)done[w.id]=1});
 $('grid').innerHTML=CB_MOVIES.map(function(v){return '<div class="mv'+(done[v.id]?' done':'')+(pickedId===v.id?' picked':'')+(sub||v.link?'':' lock')+'" data-id="'+v.id+'"><img src="'+v.img+'" alt=""><div><span class="k">'+esc(v.k)+(done[v.id]?' · ✓ watched':'')+(sub||v.link?'':' · 🔒')+'</span><br>'+esc(v.t)+'</div></div>'}).join('');
 [].forEach.call(document.querySelectorAll('.mv'),function(n){n.onclick=function(){play(n.dataset.id)}})}
function play(id){var v=CB_MOVIES.filter(function(x){return x.id===id})[0],a=R.me();if(!v)return;
 if(v.link){window.open(v.link,'_blank');return}
 if(!subscribed(a)){alert(a?'Subscribe to watch ($10/month).':'Create an account and subscribe to watch.');return}
 cur=v;seen=0;last=0;$('player').hidden=false;$('ptitle').textContent=v.t;$('vid').src=v.v;$('pnote').textContent='Watch to the end without skipping to earn '+R.PTS_PER_WATCH+' points.';$('vid').play().catch(function(){});$('player').scrollIntoView({behavior:'smooth'})}
var vid=$('vid');vid.addEventListener('timeupdate',function(){var t=vid.currentTime,d=t-last;if(d>0&&d<1.5)seen+=d;last=t});vid.addEventListener('seeked',function(){last=vid.currentTime});
vid.addEventListener('ended',function(){if(!cur)return;var full=seen>=vid.duration*0.9,m=R.month(),a=R.me();
 if(!full){$('pnote').textContent='Skipped parts – no points this time.';return}
 if(a.watches.some(function(w){return w.id===cur.id&&w.m===m})){$('pnote').textContent='Already counted this month.';return}
 R.upd(function(x){x.watches.push({id:cur.id,m:m,at:new Date().toISOString()})});R.log('watched',{movie:cur.id});$('pnote').textContent='+'+R.PTS_PER_WATCH+' points!';render()});
function ref(){var a=R.me();$('refbox').innerHTML=a?'Share your link: <input readonly value="'+esc(location.href.split('?')[0]+'?ref='+a.code)+'" style="min-width:320px"><br>When a friend you invite pays their first month, you get a one-off $2.00. Only direct friends count – nothing from their invites.':'Create an account to get your invite link.'}

/* --- Dice: theme + roll --- */
var THEMES=[
 {name:'Midnight espresso',bg:'#1b1410',bg2:'#3a2418',accent:'#ebbf73',mv:'#2a1d14',text:'#f3ece4',dice:'#ebbf73'},
 {name:'Horror night',bg:'#0d0610',bg2:'#2a0a18',accent:'#ff4d6d',mv:'#1a0c14',text:'#ffe8ee',dice:'#ff6b8a'},
 {name:'Irish pub',bg:'#0c1a10',bg2:'#1a3a24',accent:'#5dffa0',mv:'#14301c',text:'#e8fff0',dice:'#7dffb0'},
 {name:'Rockabilly red',bg:'#1a0808',bg2:'#4a1010',accent:'#ff5555',mv:'#2a1010',text:'#ffe8e8',dice:'#ff7777'},
 {name:'Ocean blue',bg:'#061018',bg2:'#0a2a44',accent:'#5ec8ff',mv:'#0c2030',text:'#e8f6ff',dice:'#7ad4ff'},
 {name:'Titanic gold',bg:'#120e06',bg2:'#3a2a10',accent:'#ffd56a',mv:'#241c0c',text:'#fff6e0',dice:'#ffe08a'},
 {name:'Space violet',bg:'#0c0618',bg2:'#24104a',accent:'#c89bff',mv:'#180c30',text:'#f4eaff',dice:'#d4b0ff'},
 {name:'Beach sunset',bg:'#1a1008',bg2:'#4a2810',accent:'#ff9a4a',mv:'#2a1810',text:'#fff0e4',dice:'#ffb06a'},
 {name:'Pink tutu',bg:'#1a0c14',bg2:'#4a1830',accent:'#ff8ec8',mv:'#2a1420',text:'#ffeaf4',dice:'#ffA8d4'},
 {name:'Wartime khaki',bg:'#14160c',bg2:'#2e3418',accent:'#c8c07a',mv:'#222618',text:'#f4f0d8',dice:'#d8d08a'}
];
function applyTheme(th){
 document.documentElement.style.setProperty('--cb-bg',th.bg);
 document.documentElement.style.setProperty('--cb-bg2',th.bg2);
 document.documentElement.style.setProperty('--cb-accent',th.accent);
 document.documentElement.style.setProperty('--cb-mv',th.mv);
 document.documentElement.style.setProperty('--cb-text',th.text);
 document.documentElement.style.setProperty('--cb-dice',th.dice);
 document.documentElement.style.setProperty('--cb-card','color-mix(in srgb,'+th.accent+' 10%,transparent)');
}
function playDiceRattle(){
 try{
  var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  var ctx=new AC(),t0=ctx.currentTime;
  for(var i=0;i<14;i++){
   var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
   o.type='square';o.frequency.value=180+Math.random()*420+i*18;
   f.type='bandpass';f.frequency.value=900+Math.random()*1400;f.Q.value=4;
   g.gain.setValueAtTime(0.0001,t0+i*0.07);
   g.gain.exponentialRampToValueAtTime(0.09+Math.random()*0.06,t0+i*0.07+0.01);
   g.gain.exponentialRampToValueAtTime(0.0001,t0+i*0.07+0.05+Math.random()*0.04);
   o.connect(f);f.connect(g);g.connect(ctx.destination);
   o.start(t0+i*0.07);o.stop(t0+i*0.07+0.12);
  }
  // final soft thud
  var n=ctx.createBufferSource(),buf=ctx.createBuffer(1,ctx.sampleRate*0.12,ctx.sampleRate),d=buf.getChannelData(0);
  for(var j=0;j<d.length;j++)d[j]=(Math.random()*2-1)*Math.exp(-j/(ctx.sampleRate*0.03));
  n.buffer=buf;var ng=ctx.createGain();ng.gain.value=0.18;n.connect(ng);ng.connect(ctx.destination);
  n.start(t0+1.0);
 }catch(e){}
}
function unwatchedPool(){
 var a=R.me(),m=R.month(),done={};
 (a&&a.watches||[]).forEach(function(w){if(w.m===m)done[w.id]=1});
 // Prefer playable movies (not external-link-only) that aren't watched yet
 var playable=CB_MOVIES.filter(function(v){return v.v});
 var pool=playable.filter(function(v){return !done[v.id]});
 if(!pool.length)pool=playable.length?playable:CB_MOVIES.slice();
 return pool;
}
var rolling=false;
function rollDice(){
 if(rolling)return;
 var a=R.me();
 if(!subscribed(a)){alert(a?'Subscribe to watch ($10/month) before rolling.':'Create an account and subscribe to roll the dice.');return}
 rolling=true;
 var btn=$('dicebtn'),cube=$('dicecube'),res=$('diceresult');
 btn.disabled=true;res.hidden=true;res.textContent='';
 pickedId=null;grid();
 var th=THEMES[Math.floor(Math.random()*THEMES.length)];
 applyTheme(th);
 playDiceRattle();
 cube.classList.remove('rolling');void cube.offsetWidth;cube.classList.add('rolling');
 setTimeout(function(){
  var pool=unwatchedPool();
  var pick=pool[Math.floor(Math.random()*pool.length)];
  pickedId=pick.id;
  res.hidden=false;
  res.textContent='🎲 '+th.name+' → '+pick.t;
  grid();
  var el=document.querySelector('.mv.picked');
  if(el)el.scrollIntoView({behavior:'smooth',block:'center'});
  setTimeout(function(){play(pick.id);rolling=false;btn.disabled=false;cube.classList.remove('rolling')},450);
 },1180);
}
function wireDice(){var b=$('dicebtn');if(b)b.onclick=rollDice}
function render(){acct();rw();grid();ref();wireDice()}render();
window.CBMoviesDice={roll:rollDice,themes:THEMES,applyTheme:applyTheme};
})();
