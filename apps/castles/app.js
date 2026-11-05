const $=id=>document.getElementById(id);
const STORE=document.body.dataset.store;
// Customers see castle, county, facts and asking price. Agent refs live in supplier-config.js (enquiry email only).
const ALL=(window.CB_PRODUCTS||[]).map(p=>Object.assign({},p,(window.CB_SUPPLY||{})[p.id]||{}));
const find=i=>ALL.find(p=>p.id==i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const eur=n=>'€'+n.toLocaleString('en-IE'),aud=n=>'A$'+n.toLocaleString('en-AU');
let cat='All',q='',sort='low',sel=null,mode='enq';
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)}
// ---- original code-drawn castle art (no photos) ----
function hash(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h}
function rnd(seed){let x=seed||1;return()=>((x=(x*1103515245+12345)>>>0)/4294967296)}
const WATER=['c3','c4','c6','c10','c20','c18','c15'];
function art(p){const r=rnd(hash(p.id+p.t)),W=320,H=200;
 const skies=[['#ffd6a5','#fdf0d5'],['#a8dadc','#f1faee'],['#cdb4db','#fde2e4'],['#ffcad4','#fff1e6'],['#bde0fe','#e9f5db']],sk=skies[Math.floor(r()*skies.length)];
 const stone=['#b9b1a3','#a39e93','#c8bfae','#9c9488','#d6cdbd'][Math.floor(r()*5)],dark='#6f685e',roof='#4a4f57';
 let g=`<defs><linearGradient id="s${p.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sk[0]}"/><stop offset="1" stop-color="${sk[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#s${p.id})"/>`;
 g+=`<circle cx="${40+r()*240}" cy="${30+r()*20}" r="16" fill="#fff6c9" opacity=".9"/>`;
 g+=`<path d="M0 ${130+r()*15} Q80 ${100+r()*20} 160 ${125+r()*10} T320 ${115+r()*20} V200 H0Z" fill="#7fb77e"/>`;
 g+=`<path d="M0 ${150+r()*10} Q100 ${135+r()*10} 200 ${150} T320 ${145} V200 H0Z" fill="#4f9a5a"/>`;
 const bat=(x,y,w)=>{let s='';for(let i=0;i<w;i+=10)s+=`<rect x="${x+i}" y="${y-7}" width="6" height="7" fill="${stone}"/>`;return s};
 const win=(x,y,h)=>`<rect x="${x}" y="${y}" width="6" height="${h||12}" rx="3" fill="${dark}"/>`;
 const base=150;
 if(p.cat.startsWith('Medieval')){ // tall tower house
  const x=120+r()*30,w=56,h=95+r()*20;g+=`<rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="${stone}"/>`+bat(x,base-h,w);
  g+=`<rect x="${x+w-6}" y="${base-h-18}" width="16" height="${h+18}" fill="${stone}"/>`+bat(x+w-6,base-h-18,16);
  for(let k=0;k<4;k++)g+=win(x+12+(k%2)*24,base-h+14+k*20);g+=`<path d="M${x+20} ${base} v-16 a8 8 0 0 1 16 0 v16z" fill="${dark}"/>`;
  if(p.id!=='c1'&&p.id!=='c3'){g+=`<rect x="${x-70}" y="${base-45}" width="70" height="45" fill="#efe6d2"/><path d="M${x-74} ${base-45} L${x-35} ${base-62} L${x+4} ${base-45}Z" fill="${roof}"/>`;for(let k=0;k<4;k++)g+=`<rect x="${x-64+k*16}" y="${base-36}" width="8" height="12" fill="#5d6b75"/>`}
 }else if(p.cat==='Castle estates'){ // castle with corner towers
  const x=80+r()*20,w=150,h=55;g+=`<rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="${stone}"/>`+bat(x,base-h,w);
  [x-14,x+w-8].forEach(tx=>{g+=`<rect x="${tx}" y="${base-h-30}" width="22" height="${h+30}" fill="${stone}"/><path d="M${tx-3} ${base-h-30} L${tx+11} ${base-h-55} L${tx+25} ${base-h-30}Z" fill="${roof}"/>`});
  for(let k=0;k<6;k++)g+=win(x+14+k*22,base-h+12,14);for(let k=0;k<6;k++)g+=win(x+14+k*22,base-h+34,10);
  g+=`<path d="M${x+w/2-10} ${base} v-18 a10 10 0 0 1 20 0 v18z" fill="${dark}"/><rect x="${x+w/2-3}" y="${base-h-24}" width="2" height="24" fill="#333"/><path d="M${x+w/2-1} ${base-h-24} h16 l-4 5 l4 5 h-16z" fill="#2f9e44"/>`;
 }else{ // Georgian country estate
  const x=70+r()*25,w=170,h=62;g+=`<rect x="${x}" y="${base-h}" width="${w}" height="${h}" fill="#efe6d2"/><path d="M${x-6} ${base-h} L${x+w/2} ${base-h-22} L${x+w+6} ${base-h}Z" fill="${roof}"/>`;
  for(let row=0;row<2;row++)for(let k=0;k<7;k++)g+=`<rect x="${x+10+k*23}" y="${base-h+10+row*24}" width="10" height="15" fill="#5d6b75"/>`;
  g+=`<rect x="${x+w/2-9}" y="${base-20}" width="18" height="20" fill="#2f3b44"/><rect x="${x+w/2-16}" y="${base-24}" width="32" height="4" fill="#fff"/>`;
  g+=`<rect x="${x+20}" y="${base-h-14}" width="8" height="14" fill="${dark}"/><rect x="${x+w-28}" y="${base-h-14}" width="8" height="14" fill="${dark}"/>`;
 }
 for(let k=0;k<5;k++){const tx=r()*W,ty=145+r()*20,s=10+r()*10;g+=`<rect x="${tx-1}" y="${ty}" width="3" height="${s*.6}" fill="#5a3d26"/><circle cx="${tx}" cy="${ty-2}" r="${s/1.6}" fill="#2e7d32" opacity=".95"/>`}
 if(WATER.includes(p.id))g+=`<path d="M0 178 Q40 172 80 178 T160 178 T240 178 T320 178 V200 H0Z" fill="#5fa8d3"/><path d="M20 186 h30 M120 190 h40 M230 186 h30" stroke="#fff" stroke-width="2" opacity=".7"/>`;
 g+=`<g transform="translate(286 ${H-30})"><path d="M0 0h18v14a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6z" fill="#fff"/><path d="M18 3a5 5 0 0 1 0 10" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M9 10c-3-2-4-4-2-5 1-.6 2 0 2 1 0-1 1-1.6 2-1 2 1 1 3-2 5z" fill="#e64980"/></g>`;
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Illustration of ${esc(p.t)}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`}
// ---- cards ----
const card=p=>`<div class="card"><div class="pic">${art(p)}</div><h3>${esc(p.t)}</h3><div class="where">📍 Co. ${esc(p.county)}, Ireland · ${esc(p.cat)}</div>
<div class="facts"><span>🛏 ${p.beds} bed</span><span>🌿 ${p.acres} acres</span><span>🏰 ${esc(p.built)}</span></div><p class="d">${esc(p.d)}</p>
<div class="price">${eur(p.eur)}</div><div class="aud">≈ ${aud(p.aud)} (approx.) · asking price</div>
<div class="btns"><button onclick="openEnq('${p.id}','enq')">🏰 Enquire / request viewing</button><button class="gold" onclick="openEnq('${p.id}','dep')">💳 Email me a payment link for a holding deposit</button></div></div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];
 $('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 $('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 let list=ALL.filter(p=>(cat=='All'||p.cat==cat)&&(!q||(p.t+' '+p.county).toLowerCase().includes(q)));
 list.sort((a,b)=>sort=='low'?a.eur-b.eur:sort=='high'?b.eur-a.eur:b.acres-a.acres);
 $('grid').innerHTML=list.map(card).join('')||'<p>No matches.</p>'}
$('q').oninput=e=>{q=e.target.value.toLowerCase().trim();draw()};$('sort').onchange=e=>{sort=e.target.value;draw()};
// ---- enquiry / deposit-link request ----
function openEnq(id,m){sel=find(id);mode=m;$('enq').hidden=false;$('eTitle').textContent=(m=='dep'?'Holding deposit payment link: ':'Enquire / request viewing: ')+sel.t;
 $('eInfo').innerHTML=`<b>${esc(sel.t)}</b>, Co. ${esc(sel.county)}. Asking price <b>${eur(sel.eur)}</b> (≈ ${aud(sel.aud)}). ${m=='dep'?'We\'ll confirm the property is still available and email you a secure payment link for the holding deposit agreed with the selling agent. Nothing is charged until you pay that link.':'We\'ll confirm availability with the selling agent and arrange a viewing (in person or video tour).'}`;
 $('send').textContent=m=='dep'?'📩 Email me a deposit payment link':'📩 Send enquiry';$('enq').scrollIntoView({behavior:'smooth'})}
window.openEnq=openEnq;
function country(){return window.CBIntl?CBIntl.country():'Australia'}
function body(no){return CBOrder.text({store:STORE+' (EUR / AUD)',orderId:no,customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:(mode=='dep'?'HOLDING DEPOSIT PAYMENT LINK REQUESTED. ':'PROPERTY ENQUIRY / VIEWING REQUEST. ')+'No payment taken yet. Property is sold through the listing agent: look up the ref in private-suppliers/castles.json, confirm availability and price with the agent, and agree any holding deposit with them BEFORE sending the buyer a payment link. No markup on property: asking price only. Overseas buyers: PayID needs an Australian bank account, so email darkokaz@gmx.com first (PayID is AU bank accounts only).\nAsking price: '+eur(sel.eur)+' (approx '+aud(sel.aud)+')\nBuyer type: '+$('cBuy').value+'\nPreferred viewing: '+$('cView').value+'\nMessage: '+$('cMsg').value,
 items:[{title:sel.t+', Co. '+sel.county+' ['+sel.supplier+']',supplierUrl:sel.supplierUrl,supplierPrice:null,salePrice:sel.aud}],total:sel.aud})}
$('send').onclick=()=>{if(!sel){alert('Please choose a castle first.');return}if(!$('cName').value||!$('cEmail').value||!$('cPhone').value){alert('Please add your name, email and phone.');return}
 const no=(mode=='dep'?'CBD':'CBE')+Date.now().toString(36).toUpperCase(),c=country();
 CBOrder.mail(STORE+(mode=='dep'?' deposit link request ':' enquiry ')+no+' – '+sel.t+' – '+$('cName').value+(c=='Australia'?'':' ['+c+']'),body(no));
 toast(mode=='dep'?'Request '+no+' opened in your email. Send it and we\'ll reply with your payment link.':'Enquiry '+no+' opened in your email. Send it and we\'ll be in touch within 1–2 business days.')};
draw();
// country selector (shared Coffeebreak intl box) – relabel for property buyers
setTimeout(function(){var l=document.querySelector('#cbIntl label');if(l)l.textContent='🌏 Your country (buyers worldwide welcome)'},50);
