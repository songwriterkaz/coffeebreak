const $=id=>document.getElementById(id);
const STORE=document.body.dataset.store;
// Customers only see product, category and price. Supplier details are in supplier-config.js (order email only).
const ALL=(window.CB_PRODUCTS||[]).map(p=>Object.assign({},p,(window.CB_SUPPLY||{})[p.id]||{}));
const find=i=>ALL.find(p=>p.id==i);const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell?p.sell:null;
const KEY='cb_'+STORE.replace(/\W/g,'')+'_cart';
let cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||'[]').filter(l=>find(l.id))}catch(e){}
let cat='All',q='';
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}draw()}
function toast(m,near){const t=$('toast');t.textContent=m;if(near&&near.getBoundingClientRect){const r=near.getBoundingClientRect();t.style.position='absolute';t.style.bottom='auto';t.style.top=(r.top+window.scrollY-50)+'px'}t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',1800)}
function add(id,btn){const p=find(id);cart.push({id,opt:p.opt||''});save();
 const c=btn?document.querySelector('.card[data-id="'+id+'"]'):null;
 if(c){const b=c.querySelector('.addbtn');b.textContent='Added to cart ✓';b.classList.add('done');let m=c.querySelector('.added');if(!m){m=document.createElement('div');m.className='added';c.appendChild(m)}
  m.innerHTML='Added to cart. Cart ('+cart.length+') <button class="viewcart" onclick="openCart()">View cart</button>';setTimeout(()=>{b.textContent='Add to cart';b.classList.remove('done')},2500)}
 toast('Added to cart: '+p.t+' · Cart ('+cart.length+')',btn)}
function openCart(){const b=document.querySelector('nav button[data-t=cart]');b.click();try{$('cart').scrollIntoView({block:'start'})}catch(e){}}
function total(){return Math.round(cart.reduce((a,l)=>a+(sell(find(l.id))||0),0)*100)/100}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function summary(no){return CBOrder.text({store:STORE+' (AUD)',orderId:no||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'CHECK STOCK AND PRICE BEFORE ORDERING. Order as a guest on the supplier site and ship to the customer address above. Delivery shown is an allowance where the supplier quotes delivery at checkout. Profit shown is before the ~2.6% PayID fee.',
 items:cart.map(l=>{const p=find(l.id);return {title:p.t+(p.mto?' (MADE TO ORDER, allow 1-3 weeks)':'')+' ['+p.supplier+']',options:l.opt||'',supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function PayID(){if(pp)return;pp=true;CBPay.mount('PayID-buttons',{currency:'AUD',getItems:()=>cart.map(l=>{const p=find(l.id);return {name:p.t+(l.opt?' – '+l.opt:''),amount:sell(p),qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}
  if(cart.some(l=>find(l.id).opt&&!l.opt.trim())){alert('Please fill in the options box for each item in your cart.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>STORE+' order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card" data-id="${p.id}"><img src="${p.img}" alt="${esc(p.t)}" loading="lazy"><h3>${esc(p.t)}</h3><small>${esc(p.cat)}</small>${/sold/i.test(p.badge||'')?`<small class="sold" style="display:block;color:#b5462e;font-weight:600">${esc(p.badge)}</small>`:''}${p.d?`<p class="desc" style="font-size:13px;color:#555;margin:4px 0">${esc(p.d)}</p>`:''}${p.mto?`<small class="mto" style="display:block;background:#ffe3ee;color:#b0135f;border-radius:8px;padding:3px 8px;margin:4px 0;font-weight:700">Made to order · allow 1 to 3 weeks delivery</small>`:''}<p class="price">${sell(p)!=null?'$'+sell(p).toFixed(2):'Price coming soon'}</p>${sell(p)!=null?`<button type="button" class="addbtn" onclick="add('${p.id}',this)">Add to cart</button>`:'<button disabled>Price coming soon</button>'}</div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];
 $('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 $('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 const list=ALL.filter(p=>(cat=='All'||p.cat==cat)&&(!q||p.t.toLowerCase().includes(q)));
 $('grid').innerHTML=list.map(card).join('')||'<p>No matches.</p>';
 $('cc').textContent=cart.length;document.querySelectorAll('.cc2').forEach(e=>e.textContent=cart.length);
 $('lines').innerHTML=cart.map((l,n)=>{const p=find(l.id);return `<div><p><span>${esc(p.t)}</span><span>$${sell(p).toFixed(2)} <button onclick="cart.splice(${n},1);save()">✕</button></span></p>${p.opt?`<input class="optin" data-n="${n}" placeholder="${esc(p.opt)}" value="${esc(l.opt)}">`:''}</div>`}).join('')||'<p>Your cart is empty.</p>';
 $('lines').querySelectorAll('.optin').forEach(i=>i.oninput=()=>{cart[+i.dataset.n].opt=i.value;try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}});
 $('tot').textContent=total().toFixed(2);const mt=$('mtonote');if(mt)mt.hidden=!cart.some(l=>(find(l.id)||{}).mto)}
$('q').oninput=e=>{q=e.target.value.toLowerCase().trim();draw()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')PayID()});
draw();
