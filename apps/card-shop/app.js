const $=id=>document.getElementById(id);
const SUP=window.CS_SUPPLY||{};
const ALL=(window.CS_PRODUCTS||[]).map(p=>Object.assign({},p,SUP[p.id]||{}));
const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell&&!p.soldOut?p.sell:null;
const ps=p=>p.soldOut?'Sold out':sell(p)!=null?'$'+sell(p).toFixed(2)+' AUD':'Price coming soon';
const find=i=>ALL.find(p=>p.id==i);
let cart=JSON.parse((()=>{try{return localStorage.getItem('cbcards_cart')}catch(e){return null}})()||'[]').filter(i=>sell(find(i))!=null);
let cat='All',q='';
function save(){try{localStorage.setItem('cbcards_cart',JSON.stringify(cart))}catch(e){}draw()}
function add(id){cart.push(id);save();$('reveal').textContent='⚡ '+find(id).t+' added to your cart!'}
function total(){return Math.round(cart.reduce((a,i)=>a+(sell(find(i))||0),0)*100)/100}
function summary(no){return CBOrder.text({store:'COFFEEBREAK CARD SHOP (AUD)',orderId:no||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'IMPORTANT: check stock and buy-limit before ordering. Pre-order items ship on release. Profit shown is before the ~2.6% PayPal fee.',
 items:cart.map(i=>{const p=find(i);return {title:p.t+' ['+p.supplier+']'+(p.tag?' ('+p.tag+')':''),supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(i=>{const p=find(i);return {name:p.t,amount:sell(p),qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>'Coffeebreak Card Shop order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card">${p.tag?`<span class="tag ${p.tag}">${p.tag=='Pre-order'?'⏳ Pre-order':'🔥 Limited'}</span>`:''}<img class="pimg" src="${p.img}" alt="${p.t}" loading="lazy"><h3>${p.t}</h3><small>${p.cat=='ETBs'?'Elite Trainer Box':p.cat}</small><p class="price">${ps(p)}</p>${sell(p)!=null?`<button onclick="add('${p.id}')">Add to cart</button>`:`<button disabled>${ps(p)}</button>`}</div>`;
function draw(){const cats=['All','Packs','Boxes','ETBs','Tins','Japanese'];$('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" onclick="cat='${c}';draw()">${c}</button>`).join('');
const L=ALL.filter(p=>(cat=='All'||p.cat==cat)&&p.t.toLowerCase().includes(q)).sort((a,b)=>(a.sell||0)-(b.sell||0));
$('grid').innerHTML=L.map(card).join('')||'<p>No matches.</p>';
$('cc').textContent=cart.length;$('lines').innerHTML=cart.map((i,n)=>`<p>${find(i).t} – ${ps(find(i))} <button onclick="cart.splice(${n},1);save()">x</button></p>`).join('')||'<p>Empty</p>';$('tot').textContent=total().toFixed(2)}
$('search').oninput=e=>{q=e.target.value.toLowerCase();draw()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')paypal()});
draw();
