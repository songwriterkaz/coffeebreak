(function(){
const C=window.CB_CONFIG;let P=[],D={},cart=JSON.parse(localStorage.cbTreatCart||'[]'),cat='All',mode='local';
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=p=>p.salePrice??null;
const fmt=(n,p)=>n==null?'Price coming soon':'$'+n.toFixed(2)+' AUD';
const icon={'Bubble Tea':'🧋','Sushi Kits':'🍣','Desserts':'🍡','Ice Cream':'🍨','Pizza':'🍕','Fruit & Veg':'🍓','Chinese Food':'🥡','Lollies':'🍬'};
fetch('products.json').then(r=>r.json()).then(d=>{if(d.markup!=null)C.markup=d.markup;P=d.products;D=d.delivery;window.__P=P;cart=cart.filter(s=>{const p=P.find(x=>x.sku===s);return p&&price(p)!=null});
$('cSlot').innerHTML=D.slots.map(s=>`<option>${s}</option>`).join('');modes();cats();grid();render()}).catch(()=>{$('grid').textContent='Could not load products.json'});
function modes(){$('modes').querySelectorAll('button').forEach(b=>{b.className=b.dataset.m===mode?'primary':'';b.onclick=()=>{mode=b.dataset.m;cart=cart.filter(s=>(P.find(p=>p.sku===s)||{}).mode===mode);modes();grid();save()}})}
function cats(){const cs=['All','Bubble Tea','Sushi Kits','Desserts','Ice Cream','Pizza','Fruit & Veg','Chinese Food','Lollies'];$('cats').innerHTML=cs.map(c=>`<button data-c="${c}" class="${c===cat?'primary':''}">${(icon[c]||'✿')+' '+c}</button>`).join('');$('cats').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;cats();grid()})}
function grid(){$('grid').innerHTML=P.filter(p=>p.mode===mode&&(cat==='All'||p.category===cat)).map(p=>`<div class="card"><span class="tag">${p.proposed?'S4':'EXAMPLE ITEM'}</span><div class="ph">${icon[p.category]}</div><h3>${esc(p.title)}</h3><div class="meta"><b>${esc(p.ships_from)}</b><br></div><p class="alg">⚠️ Allergens: ${p.allergens.length?esc(p.allergens.join(', ')):'None listed'} <i>(check the label before eating)</i></p><div class="price">${fmt(price(p),p)}</div>${price(p)==null?'<button disabled>Price coming soon</button>':`<button class="primary" data-add="${esc(p.sku)}">Add to basket</button>`}</div>`).join('')||'<p>No items here yet.</p>';
$('grid').querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{if(!cart.includes(b.dataset.add))cart.push(b.dataset.add);save()})}
function save(){localStorage.cbTreatCart=JSON.stringify(cart);render()}
const items=()=>cart.map(s=>P.find(p=>p.sku===s)).filter(Boolean);
const priced=()=>items().every(p=>price(p)!=null);
const fee=()=>mode==='local'?D.fee_aud:0;
const total=()=>Math.round((items().reduce((a,p)=>a+(price(p)||0),0)+fee())*100)/100;
function render(){const it=items();$('localBox').style.display=mode==='local'?'block':'none';$('feeNote').textContent=`Delivery fee: $${(D.fee_aud||0).toFixed(2)} (${D.fee_note||''}). Area: ${D.area||''}.`;
if(!it.length){$('lines').textContent='Empty';$('checkout').style.display='none';return}
$('lines').innerHTML=it.map(p=>`<div>${esc(p.title)} — ${fmt(price(p),p)} <button data-rm="${esc(p.sku)}">✕</button></div>`).join('')+(mode==='local'?`<div>🛵 Local delivery fee — $${D.fee_aud.toFixed(2)}</div>`:'<div class="meta">Postage confirmed by email before dispatch.</div>')+(priced()?`<p class="price">Total: $${total().toFixed(2)} AUD</p>`:`<p class="meta"><b>Some items are "Price on request"</b> – send an email order request and we'll reply with a price and PayPal payment link.</p>`);
$('lines').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{cart=cart.filter(s=>s!==b.dataset.rm);save()});$('checkout').style.display='block';$('paypal-buttons').style.display=priced()?'block':'none';if(priced())paypal()}
function summary(id){return CBOrder.text({store:'COFFEEBREAK SWEET TREATS',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone')?$('cPhone').value:'',email:$('cEmail').value},extra:'Mode: '+(mode==='local'?'LOCAL DELIVERY (Time slot: '+$('cSlot').value+', delivery fee $'+D.fee_aud.toFixed(2)+')':'POSTED')+'\nAllergen info acknowledged: '+($('allergyOk').checked?'YES':'NO'),items:items().map(p=>({title:p.title,supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:price(p)})),total:priced()?total():null})}
function mail(id){const u='mailto:'+C.orderEmail+'?subject='+encodeURIComponent('Sweet Treats order'+(id?' '+id:' request')+' – '+$('cName').value)+'&body='+encodeURIComponent(summary(id));window.__lastMail=u;location.href=(window.CBSpell?CBSpell.url:String)(u)}
const ok=()=>{if(!$('cName').value||!$('cAddr').value){alert('Please add your name and delivery address.');return false}if(!$('allergyOk').checked){alert('Please confirm you have read the allergen information.');return false}return true};
$('emailOrder').onclick=()=>{if(ok())mail()};
let ppM=false;function paypal(){if(ppM)return;ppM=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>items().map(p=>({name:p.title,amount:price(p),qty:1})),shipping:()=>fee(),validate:()=>{if(!$('cEmail').value){alert('Please add your email.');return false}return ok()},email:()=>$('cEmail').value,subject:no=>'Sweet Treats order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
window.__price=price;window.__summary=summary;window.__setCost=(sku,c)=>{P.find(p=>p.sku===sku).supplier_cost_aud=c;grid();render()};})();
