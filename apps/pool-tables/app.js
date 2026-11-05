const C=window.CFG,$=id=>document.getElementById(id);let P=[],M=0.4,cart=[];
const price=p=>p.salePrice??null;
const fmt=p=>price(p)==null?'Price coming soon':'$'+price(p).toFixed(2)+' AUD';
fetch('products.json').then(r=>r.json()).then(d=>{M=d.markup;P=d.products;window.__P=P;grid()}).catch(()=>$('grid').textContent='Could not load products.json');
function grid(){$('grid').innerHTML=P.map((p,i)=>`<div class="card">${p.image?`<img class="pimg" src="${p.image}" alt="" loading="lazy">`:""}${p.example?'<span class="tag">EXAMPLE</span>':''}<h3>${p.title}</h3><p>Size: ${p.size}</p>
<label>Finish<select id="f${i}">${p.finish_options.map(o=>`<option>${o}</option>`).join('')}</select></label>
<label>Felt<select id="c${i}">${p.felt_options.map(o=>`<option>${o}</option>`).join('')}</select></label>
<p class="price">${fmt(p)}</p><small>${p.delivery}</small><br>${price(p)==null?'<button disabled>Price coming soon</button>':`<button data-i="${i}">Add to order</button>`}</div>`).join('');
document.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const i=b.dataset.i;cart.push({p:P[i],finish:$('f'+i).value,felt:$('c'+i).value});render()})}
const total=()=>cart.reduce((s,c)=>s+(price(c.p)||0),0),allPriced=()=>cart.length&&cart.every(c=>price(c.p)!=null);
function render(){$('lines').innerHTML=cart.map((c,j)=>`<div>${c.p.title} – ${c.finish}, ${c.felt} felt – ${fmt(c.p)} <button data-rm="${j}">✕</button></div>`).join('')||'Nothing yet.';
$('tot').textContent=cart.length?(allPriced()?'Total: $'+total().toFixed(2)+' AUD':'Some tables are Price coming soon – remove them to pay.'):'';
document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{cart.splice(b.dataset.rm,1);render()});if(allPriced())paypal()}
function summary(id){return CBOrder.text({store:'COFFEEBREAK POOL TABLES',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone')?$('cPhone').value:'',email:$('cEmail').value},items:cart.map(c=>({title:c.p.title,options:'Finish: '+c.finish+', Felt: '+c.felt,supplierUrl:c.p.supplierUrl,supplierPrice:c.p.supplierPrice,supplierShipping:c.p.supplierShipping,deliveryQuote:c.p.deliveryQuote,feePct:c.p.feePct,profit:c.p.profit,salePrice:price(c.p)})),total:allPriced()?total():null})}
function mail(id){location.href=(window.CBSpell?CBSpell.url:String)('mailto:'+C.orderEmail+'?subject='+encodeURIComponent('Pool table order'+(id?' '+id:''))+'&body='+encodeURIComponent(summary(id)))}
$('mailBtn').onclick=()=>mail();window.__summary=summary;
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(c=>({name:c.p.title+' ('+c.finish+', '+c.felt+' felt)',amount:price(c.p),qty:1})),validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},email:()=>$('cEmail').value,subject:no=>'Pool table order '+no,body:no=>summary(no),onDone:()=>{cart=[];render()}})}
