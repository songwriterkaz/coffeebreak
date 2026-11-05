(function(){
const $=id=>document.getElementById(id);const K='cbTransferHistory';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hist=()=>{try{return JSON.parse(localStorage.getItem(K))||{sent:[],recv:[]}}catch(e){return{sent:[],recv:[]}}};
const save=h=>localStorage.setItem(K,JSON.stringify(h));
function tab(t){document.querySelectorAll('.tab').forEach(s=>s.hidden=s.id!==t);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));if(t==='hist')drawHist();}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
function validPayID(p){p=p.trim();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p))return true;const d=p.replace(/[\s\-()]/g,'');return /^(\+?61|0)4\d{8}$/.test(d)||/^\+?\d{8,15}$/.test(d);}
function copy(t,btn){const done=()=>{const o=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=o,1200)};
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,()=>fb());else fb();
 function fb(){const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();try{document.execCommand('copy')}catch(e){}x.remove();done();}}
function card(r){return `<div class="card"><div class="top"><img src="logo.png" alt="CB"><div><b>Coffeebreak Transfer</b><br><small>PayID request</small></div></div>
<div class="amt">$${Number(r.a).toFixed(2)} AUD</div><div>To: <b>${esc(r.n)}</b></div>${r.o?`<div>For: ${esc(r.o)}</div>`:''}
<div class="fld"><span>PayID: <b>${esc(r.p)}</b></span><button data-c="p">Copy PayID</button></div>
<div class="fld"><span>Amount: <b>${Number(r.a).toFixed(2)}</b></span><button data-c="a">Copy amount</button></div></div>`;}
function bind(el,r){el.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>copy(b.dataset.c==='p'?r.p:Number(r.a).toFixed(2),b));}
function linkFor(r){const u=new URL(location.hostname.endsWith('github.io')?location.href.split('#')[0].split('?')[0]:'https://songwriterkaz.github.io/coffeebreak-transfer/');u.searchParams.set('n',r.n);u.searchParams.set('p',r.p);u.searchParams.set('a',Number(r.a).toFixed(2));if(r.o)u.searchParams.set('o',r.o);return u.toString();}
let cur=null;
$('f').onsubmit=e=>{e.preventDefault();const r={n:$('n').value.trim(),p:$('p').value.trim(),a:parseFloat($('a').value),o:$('o').value.trim()};
 if(!validPayID(r.p)){$('err').textContent='Please enter a valid PayID email or phone number.';return}
 if(!(r.a>0)||r.a>1e6){$('err').textContent='Please enter an amount above $0.';return}$('err').textContent='';
 cur=r;const L=linkFor(r);$('card1').innerHTML=card(r);bind($('card1'),r);$('link').value=L;$('out').hidden=false;
 $('qr').innerHTML='';new QRCode($('qr'),{text:L,width:220,height:220,colorDark:'#c2187a',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
 const h=hist();h.sent.unshift({...r,link:L,t:Date.now()});h.sent=h.sent.slice(0,50);save(h);};
$('cpl').onclick=e=>copy($('link').value,e.target);
$('shr').onclick=e=>{if(navigator.share)navigator.share({title:'Coffeebreak Transfer request',text:'PayID request from '+cur.n,url:$('link').value}).catch(()=>{});else copy($('link').value,e.target);};
const q=new URLSearchParams(location.search);
if(q.get('p')&&q.get('a')){const r={n:q.get('n')||'',p:q.get('p'),a:parseFloat(q.get('a'))||0,o:q.get('o')||''};
 $('card2').innerHTML=card(r)+'<p class="note">Always check the name your bank shows before you pay. Coffeebreak Transfer never handles money.</p>';bind($('card2'),r);
 const L=linkFor(r);const h=hist();let it=h.recv.find(x=>x.link===L);if(!it){it={...r,link:L,t:Date.now(),paid:false};h.recv.unshift(it);h.recv=h.recv.slice(0,50);save(h);}
 $('paid').hidden=false;const showPaid=()=>{$('paid').textContent='Paid';$('paid').disabled=true;$('paidmsg').textContent='Marked as paid on this device.';};
 if(it.paid)showPaid();$('paid').onclick=()=>{const h=hist();const x=h.recv.find(y=>y.link===L);if(x){x.paid=true;x.pt=Date.now();save(h);}showPaid();};tab('pay');}
function drawHist(){const h=hist();const li=x=>`<li>$${Number(x.a).toFixed(2)} ${esc(x.n)} (${esc(x.p)}) ${x.o?'- '+esc(x.o):''} <small>${new Date(x.t).toLocaleString()}</small>${x.paid?' <b>Paid</b>':''} <a href="${esc(x.link)}">open</a></li>`;
 $('hs').innerHTML=h.sent.map(li).join('')||'<li>None yet</li>';$('hr').innerHTML=h.recv.map(li).join('')||'<li>None yet</li>';}
})();
