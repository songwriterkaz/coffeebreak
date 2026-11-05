const $=id=>document.getElementById(id);
const STORE=document.body.dataset.store;
// Customers only see product, category and price. Supplier details are in supplier-config.js (order email only).
const ALL=(window.CB_PRODUCTS||[]).map(p=>Object.assign({},p,(window.CB_SUPPLY||{})[p.id]||{}));
const find=i=>ALL.find(p=>p.id==i);const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell?p.sell:null;
const KEY='cb_'+STORE.replace(/\W/g,'')+'_cart';
let cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||'[]').filter(l=>find(l.id))}catch(e){}
let cat='All',q='';
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}draw()}
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',1800)}
function add(id){cart.push({id,opt:''});save();toast('✨ Added: '+find(id).t)}
function total(){return Math.round(cart.reduce((a,l)=>a+(sell(find(l.id))||0),0)*100)/100}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function summary(no){return CBOrder.text({store:STORE+' (AUD)',orderId:no||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'CHECK STOCK AND PRICE BEFORE ORDERING. Order as a guest on the supplier site and ship to the customer address above. Delivery shown is an allowance where the supplier quotes delivery at checkout. Profit shown is before the ~2.6% PayPal fee.',
 items:cart.map(l=>{const p=find(l.id);return {title:p.t+(p.supplier?' ['+p.supplier+']':''),options:l.opt||'',supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(l=>{const p=find(l.id);return {name:p.t+(l.opt?' – '+l.opt:''),amount:sell(p),qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}
  if(cart.some(l=>find(l.id).opt&&!l.opt.trim())){alert('Please choose a colour for each phone in your cart.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>STORE+' order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card"><img src="${p.img}" alt="${esc(p.t)}" loading="lazy"><h3>${esc(p.t)}</h3><small>${esc(p.cat)}</small><p class="price">${sell(p)!=null?'$'+sell(p).toFixed(2):'Price coming soon'}</p>${sell(p)!=null?`<button onclick="add('${p.id}')">Add to cart</button>`:'<button disabled>Price coming soon</button>'}</div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];
 $('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 $('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 const list=ALL.filter(p=>(cat=='All'||p.cat==cat)&&(!q||p.t.toLowerCase().includes(q)));
 $('grid').innerHTML=list.map(card).join('')||'<p>No matches.</p>';
 $('cc').textContent=cart.length;
 $('lines').innerHTML=cart.map((l,n)=>{const p=find(l.id);return `<div><p><span>${esc(p.t)}</span><span>$${sell(p).toFixed(2)} <button onclick="cart.splice(${n},1);save()">✕</button></span></p>${p.opt?`<input class="optin" data-n="${n}" placeholder="${esc(p.opt)}" value="${esc(l.opt)}">`:''}</div>`}).join('')||'<p>Your cart is empty.</p>';
 $('lines').querySelectorAll('.optin').forEach(i=>i.oninput=()=>{cart[+i.dataset.n].opt=i.value;try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}});
 $('tot').textContent=total().toFixed(2)}
$('q').oninput=e=>{q=e.target.value.toLowerCase().trim();draw()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')paypal()});
draw();
