(function(){
const C=window.CB_CONFIG;let P=[],cart=JSON.parse(localStorage.cbAntCart||'[]'),cat='All';
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const price=p=>p.salePrice??null;const fmt=n=>'$'+n.toFixed(2)+' AUD';
const icon={Furniture:'🪑',Glass:'🍶',Ceramics:'🏺',Mirrors:'🪞','Silver & Metalware':'🫖','Fashion & Accessories':'👛'};
function load(){const ov=localStorage.cbAntProducts;if(ov){init(JSON.parse(ov));return}fetch('products.json').then(r=>r.json()).then(init).catch(()=>{$('grid').textContent='Could not load products.json (open via a web server).'})}
function init(d){if(d.markup!=null)C.markup=d.markup;if(d.flat_markup_aud!=null)C.flat=d.flat_markup_aud;P=d.products;window.__P=P;cats();grid();render()}
function cats(){const cs=['All',...new Set(P.map(p=>p.category))];$('cats').innerHTML=cs.map(c=>`<button data-c="${esc(c)}" class="${c===cat?'primary':''}">${esc(c)}</button>`).join('');$('cats').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;cats();grid()})}
function grid(){$('grid').innerHTML=P.filter(p=>cat==='All'||p.category===cat).map(p=>`<div class="card">${p.example?'<span class="tag">EXAMPLE ITEM</span>':''}<div class="ph">${p.image?`<img src="${esc(p.image)}" alt="">`:(icon[p.category]||'🕰️')}</div><h3>${esc(p.title)}</h3><div class="meta"><b>Era:</b> ${esc(p.era)}<br><b>Condition:</b> ${esc(p.condition)}<br><b>Ships:</b> Insured Australia-wide (overseas shipping added at checkout), posted to you</div><div class="price">${fmt(price(p))}</div>${p.soldout?'<button disabled>Sold out</button>':`<button class="primary" data-add="${esc(p.sku)}">Add to basket</button>`}</div>`).join('');$('grid').querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{if(!cart.includes(b.dataset.add))cart.push(b.dataset.add);save()})}
function save(){localStorage.cbAntCart=JSON.stringify(cart);render()}
function items(){return cart.map(s=>P.find(p=>p.sku===s)).filter(Boolean)}
function total(){return Math.round(items().reduce((a,p)=>a+price(p),0)*100)/100}
function render(){const it=items();if(!it.length){$('lines').textContent='Empty';$('checkout').style.display='none';return}
$('lines').innerHTML=it.map(p=>`<div>${esc(p.title)} — ${fmt(price(p))} <button data-rm="${esc(p.sku)}">✕</button></div>`).join('')+`<p class="price">Total: ${fmt(total())}</p><p class="meta">Shipping is quoted per item and confirmed before dispatch.</p>`;
$('lines').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{cart=cart.filter(s=>s!==b.dataset.rm);save()});$('checkout').style.display='block';paypal()}
function summary(id){return CBOrder.text({store:'COFFEEBREAK ANTIQUES',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone')?$('cPhone').value:'',email:$('cEmail').value},items:items().map(p=>({title:p.title,supplierUrl:p.supplierUrl||p.url,supplierPrice:p.supplierPrice??p.supplier_cost_aud,supplierShipping:p.supplierShipping,salePrice:price(p)})),total:total()})}
function mail(id){const u='mailto:'+C.orderEmail+'?subject='+encodeURIComponent('Antiques order'+(id?' '+id:' request')+' – '+$('cName').value)+'&body='+encodeURIComponent(summary(id));window.__lastMail=u;location.href=(window.CBSpell?CBSpell.url:String)(u)}
$('emailOrder').onclick=()=>{if(!$('cName').value||!$('cAddr').value){alert('Please add your name and delivery address.');return}mail()};
let ppM=false;function paypal(){if(ppM)return;ppM=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>items().map(p=>({name:p.title,amount:price(p),qty:1})),validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},email:()=>$('cEmail').value,subject:no=>'Antiques order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
window.__price=price;load()})();
