(()=>{const $=i=>document.getElementById(i),KEY='cbTycoon1';
const def={coins:20,served:0,lv:{},staff:{},decor:{},menu:['long','flat','cap'],loc:0,goals:[],t:Date.now(),mute:false,total:0};
let S=Object.assign({},def,JSON.parse(localStorage.getItem(KEY)||'{}'));['lv','staff','decor'].forEach(k=>S[k]=S[k]||{});
const L=k=>S.lv[k]||0,ST=k=>S.staff[k]||0,cost=(b,l)=>Math.ceil(b*Math.pow(1.6,l));
const fmt=n=>n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':Math.floor(n).toLocaleString();
const rep=()=>DECOR.reduce((a,d)=>a+(S.decor[d.id]?d.rep:0),0);
const mult=()=>LOCS[S.loc].m*(1+.2*ST('roaster'))*(1+rep()/100);
let AC;function snd(f,d=.1,ty='sine'){if(S.mute)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;g.gain.value=.07;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
const ching=()=>{snd(880,.12,'triangle');setTimeout(()=>snd(1320,.18,'triangle'),70)};
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,1800)}
function earn(v,flt){v=v;S.coins+=v;S.total+=v;if(flt){const f=document.createElement('div');f.className='float';f.textContent='+'+fmt(v);f.style.left=(30+Math.random()*60)+'%';f.style.top='40%';$('scene').appendChild(f);setTimeout(()=>f.remove(),1000)}}
// offline
(function(){const dt=Math.min(8*3600,(Date.now()-S.t)/1000);const rate=passive()*(ST('manager')?1:.5);if(dt>60&&rate>0){const g=rate*dt;earn(g);$('wtext').textContent='Your café earned '+fmt(g)+' coins while you were away ('+Math.round(dt/60)+' min).';$('welcome').style.display='flex'}})();
function passive(){return(ST('cashier')*0.6+ST('barista')*(menuAvg()/Math.max(2,8-ST('barista')*.5)))*mult()}
function menuAvg(){const m=S.menu.map(id=>DRINKS.find(d=>d.id==id).p);return m.reduce((a,b)=>a+b,0)/m.length}
let queue=[],cur=null,cup=[];
function spawn(){if(queue.length<5){const d=DRINKS.find(x=>x.id==S.menu[Math.floor(Math.random()*S.menu.length)]);queue.push({e:CUST[Math.floor(Math.random()*CUST.length)],d,pat:1});if(!cur)next();renderQ()}}
function next(){cur=queue[0]||null;cup=[];renderOrder()}
function renderQ(){$('queue').innerHTML=queue.map(c=>'<span>'+c.e+'</span>').join('');$('counter').innerHTML=DECOR.filter(d=>S.decor[d.id]).map(d=>d.e).join('')||'☕'}
function renderOrder(){if(!cur){$('cust').textContent='Waiting for customers…';$('recipe').textContent='';$('cupv').textContent='';$('ings').innerHTML='';return}
$('cust').innerHTML=cur.e+' wants a <b>'+cur.d.n+'</b> ('+fmt(price(cur.d))+'🪙)<div class="pat"><i id="pb" style="width:'+cur.pat*100+'%"></i></div>';
$('recipe').innerHTML='Recipe: '+cur.d.r.map(i=>ING[i]).join(' → ');$('cupv').textContent=cup.length?'Cup: '+cup.map(i=>ING[i]).join(' + '):'Cup: (empty) – tap ingredients in order';
const need=[...new Set(DRINKS.filter(d=>S.menu.includes(d.id)).flatMap(d=>d.r))];$('ings').innerHTML=need.map(i=>'<button class="alt" data-i="'+i+'">'+ING[i]+'</button>').join('');
$('ings').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(cup.length<6){cup.push(b.dataset.i);snd(300+cup.length*80,.06);renderOrder()}})}
const price=d=>d.p*(1+.15*L('machine'))*mult()+L('register');
function serve(auto){if(!cur)return;const ok=auto||cup.join()==cur.d.r.join();if(ok){const tip=auto?0:price(cur.d)*cur.pat*.3*(1+.1*L('grinder'));earn(price(cur.d)+tip,true);S.served++;ching();if(!auto&&cur.pat>.7)toast('Perfect! +tip ⭐')}else{snd(140,.3,'sawtooth');toast('Wrong recipe – they left 😕')}queue.shift();next();renderQ();checkGoals();ui()}
$('serve').onclick=()=>serve(false);$('bin').onclick=()=>{cup=[];renderOrder()};
let tab='machines';document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));panel()});
function row(t,s,c,can,fn,lbl){return{h:'<div class="it"><div><b>'+t+'</b><small>'+s+'</small></div><button '+(can?'':'disabled')+'>'+(lbl||fmt(c)+'🪙')+'</button></div>',fn}}
function buy(c){if(S.coins<c)return false;S.coins-=c;ching();return true}
function panel(){let R=[];if(tab=='machines')R=MACH.map(m=>{const c=cost(m.b,L(m.id));return row(m.n+' Lv'+L(m.id),m.d,c,S.coins>=c,()=>{if(buy(c)){S.lv[m.id]=L(m.id)+1}})});
if(tab=='menu')R=DRINKS.map(d=>S.menu.includes(d.id)?row(d.n,d.r.map(i=>ING[i]).join(', '),0,false,null,'On menu'):row(d.n,'Sells for '+d.p+'🪙 base',d.u,S.coins>=d.u,()=>{if(buy(d.u)){S.menu.push(d.id);toast(d.n+' added!')}}));
if(tab=='staff')R=STAFF.map(s=>{const c=cost(s.b,ST(s.id)),mx=s.max&&ST(s.id)>=s.max;return row(s.n+(ST(s.id)?' Lv'+ST(s.id):''),s.d,c,!mx&&S.coins>=c,()=>{if(!mx&&buy(c))S.staff[s.id]=ST(s.id)+1},mx?'Hired':null)});
if(tab=='decor')R=DECOR.map(d=>S.decor[d.id]?row(d.e+' '+d.n,'+'+d.rep+'% income',0,false,null,'Owned'):row(d.e+' '+d.n,'+'+d.rep+'% income',d.c,S.coins>=d.c,()=>{if(buy(d.c)){S.decor[d.id]=1;renderQ()}}));
if(tab=='locs')R=LOCS.map((l,i)=>i<=S.loc?row(l.n,'x'+l.m+' income',0,false,null,i==S.loc?'Here':'Done'):row(l.n,'x'+l.m+' income – a whole new café!',l.c,i==S.loc+1&&S.coins>=l.c,()=>{if(buy(l.c)){S.loc=i;toast('Welcome to '+l.n+'! 🎉');ui()}}));
if(tab=='goals')R=GOALS.map(([n,t,rw],i)=>row(t,'Reward '+fmt(rw)+'🪙 · '+Math.min(S.served,n)+'/'+n,0,false,null,S.goals.includes(i)?'✔':'…'));
$('panel').innerHTML=R.map(r=>r.h).join('');$('panel').querySelectorAll('.it button').forEach((b,i)=>b.onclick=()=>{R[i].fn&&R[i].fn();save();ui()})}
function checkGoals(){GOALS.forEach(([n,t,rw],i)=>{if(S.served>=n&&!S.goals.includes(i)){S.goals.push(i);earn(rw);toast('Goal: '+t+' +'+fmt(rw))}})}
function ui(){$('coins').textContent='🪙 '+fmt(S.coins);$('rep').textContent='⭐ '+rep();$('loc').textContent=LOCS[S.loc].n+' · '+S.served+' served';$('scene').style.background=LOCS[S.loc].bg;panel()}
function save(){S.t=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}
$('mute').onclick=()=>{S.mute=!S.mute;$('mute').textContent=S.mute?'🔇':'🔊'};$('reset').onclick=()=>{if(confirm('Reset your café?')){localStorage.removeItem(KEY);location.reload()}};
let lastP=performance.now(),spT=0,bT=0,pT=0;
setInterval(()=>{const now=performance.now(),dt=(now-lastP)/1000;lastP=now;spT+=dt;bT+=dt;pT+=dt;
const gap=Math.max(1.5,5-L('sign')*.4-rep()/40);if(spT>gap){spT=0;spawn()}
queue.forEach(c=>c.pat-=dt/(25*(1+.1*L('steamer'))));if(queue.length&&queue[0].pat<=0){queue.shift();toast('A customer got tired of waiting');next();renderQ()}
const pb=$('pb');if(pb&&cur)pb.style.width=Math.max(0,cur.pat*100)+'%';
if(ST('barista')&&bT>Math.max(2,8-ST('barista')*.5)&&cur){bT=0;serve(true)}
if(pT>1){pT=0;if(ST('cashier'))earn(ST('cashier')*.6*mult());$('coins').textContent='🪙 '+fmt(S.coins);save();if(tab!='goals')panel()}},200);
window.CT={S,save,earn};spawn();renderQ();renderOrder();ui();})();
