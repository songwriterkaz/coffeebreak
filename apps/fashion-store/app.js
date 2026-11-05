const $=id=>document.getElementById(id);
const STORE=document.body.dataset.store;
const ALL=window.CB_PRODUCTS||[];const find=i=>ALL.find(p=>p.id==i);
const SIZES=['XS','S','M','L','XL','2XL','3XL'];
const KEY='cb_fashion_cart';
let cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||'[]').filter(l=>find(l.id))}catch(e){}
let cat='All';
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}draw()}
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',1800)}
function add(id){const p=find(id);let opt='';if(p.sizes){opt=$('sz-'+id).value;if(!opt){alert('Please choose a size.');return}opt='Size '+opt}cart.push({id,opt});save();toast('Added: '+p.t+(opt?' ('+opt+')':''))}
function total(){return cart.reduce((a,l)=>a+find(l.id).sell,0)}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function summary(no){return CBOrder.text({store:STORE+' (AUD)',orderId:no||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'MADE TO ORDER, ships in 2-3 weeks. Order each item from the supplier in SUPPLIERS.md after payment arrives and ship to the customer address above.',
 items:cart.map(l=>{const p=find(l.id);return {title:p.t,options:l.opt||'',supplierUrl:'Supplier: '+p.sup,salePrice:p.sell}}),total:total()})}
let pp=false;function pay(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(l=>{const p=find(l.id);return {name:p.t+(l.opt?' - '+l.opt:''),amount:p.sell,qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>STORE+' order '+no+' - '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card"><img src="${p.img}" alt="${esc(p.t)}" loading="lazy"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p><p class="price">$${p.sell.toFixed(2)} AUD</p><p class="mto">Made to order, ships in 2-3 weeks</p>${p.sizes?`<select id="sz-${p.id}" aria-label="Size"><option value="">Choose size</option>${SIZES.map(s=>`<option>${s}</option>`).join('')}</select>`:''}<button onclick="add('${p.id}')">Add to cart</button></div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];
 $('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 $('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 $('grid').innerHTML=ALL.filter(p=>cat=='All'||p.cat==cat).map(card).join('');
 $('cc').textContent=cart.length;
 $('lines').innerHTML=cart.map((l,n)=>{const p=find(l.id);return `<div><p><span>${esc(p.t)}${l.opt?' ('+esc(l.opt)+')':''}</span><span>$${p.sell.toFixed(2)} <button onclick="cart.splice(${n},1);save()">✕</button></span></p></div>`}).join('')||'<p>Your cart is empty.</p>';
 $('tot').textContent=total().toFixed(2)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')pay()});
draw();
