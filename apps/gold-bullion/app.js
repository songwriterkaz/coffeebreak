const $=id=>document.getElementById(id);
const ALL=(window.KE_PRODUCTS||[]).map(p=>Object.assign({},p,(window.KE_SUPPLY||{})[p.id]||{}));
const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell?p.sell:null;
const ps=p=>sell(p)!=null?'$'+sell(p).toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2})+' AUD':'Price coming soon';
const find=i=>ALL.find(p=>p.id==i);
let cart=JSON.parse((()=>{try{return localStorage.getItem('cbb_cart')}catch(e){return null}})()||'[]').filter(i=>sell(find(i))!=null);
let cat='All';
function save(){try{localStorage.setItem('cbb_cart',JSON.stringify(cart))}catch(e){}draw()}
function add(id){cart.push(id);save();$('reveal').textContent='✨ '+find(id).t+' added to your cart.'}
function total(){return Math.round(cart.reduce((a,i)=>a+(sell(find(i))||0),0)*100)/100}
function supCost(){return cart.reduce((a,i)=>a+find(i).supplierPrice,0)}
function summary(id){const big=supCost()>=5000;
 return CBOrder.text({store:'COFFEEBREAK GOLD BULLION (AUD)',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'\n*** RE-CHECK LIVE SUPPLIER PRICE BEFORE ORDERING; if cost rose above the buffer, contact the customer. ***\n'+
 'Prices on site were set '+window.CB_UPDATED+' with a 3% price-move buffer (shown per item below).\n'+
 'Supplier shipping is a flat $40 minimum per S1 order (gold $1.95/oz, silver from $4.18/kg), insured. Several items in ONE S1 order = one $40 charge (extra profit). NO parcel lockers - street address, signature on delivery.\n'+
 'Use S1 "Zero Deposit Lock-In" to lock the price, then pay by PayID/bank transfer or card (no surcharge) by close of next business day.\n'+
 (big?'AML/ID: this order is $5,000+ at the supplier. S1 needs one-off ID verification (registration form + online biometric ID check) before it will release the order: S1-Lc515d2\n':'AML/ID: supplier orders of $5,000+ need one-off S1 ID verification.\n')+
 'Profit shown is before the ~2.6% PayPal fee and includes the 3% buffer.',
 items:cart.map(i=>{const p=find(i);return {title:p.t+' ['+p.supplier+'] ('+(p.stock||'')+')',supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(i=>{const p=find(i);return {name:p.t,amount:sell(p),qty:1}}),
 validate:()=>{if(!cart.length){alert('Your cart is empty.');return false}if(!$('cName').value||!$('cAddr').value||!$('cEmail').value||!$('cPhone').value){alert('Please add your name, email, phone and street delivery address.');return false}if(!$('cAgree').checked){alert('Please tick to confirm you understand prices move with the gold market.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>'Gold Bullion order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card"><img class="pimg" src="${p.img}" alt="${p.t}" loading="lazy"><small class="cat">${p.cat}</small><h3>${p.t}</h3>${p.delay?'<small class="delay">Ships in approx. 1–2 weeks</small>':''}<p class="price">${ps(p)}</p><button onclick="add('${p.id}')">Add to cart</button></div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];$('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" onclick="cat='${c}';draw()">${c}</button>`).join('');
$('grid').innerHTML=ALL.filter(p=>cat=='All'||p.cat==cat).map(card).join('');
$('cc').textContent=cart.length;$('lines').innerHTML=cart.map((i,n)=>`<p>${find(i).t} – ${ps(find(i))} <button class="x" onclick="cart.splice(${n},1);save()">✕</button></p>`).join('')||'<p>Your cart is empty.</p>';$('tot').textContent=total().toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2})}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')paypal()});
document.querySelectorAll('.upd').forEach(e=>e.textContent=window.CB_UPDATED);
draw();
(function(){const a=$('music'),L=window.PLAYLIST||[];let i=0,on=true;function play(){if(!L.length)return;a.src='assets/music/'+L[i].file;$('np').textContent='Now playing: '+L[i].title;a.play().catch(()=>{})}
a.onended=()=>{i=(i+1)%L.length;play()};$('skip').onclick=()=>{i=(i+1)%L.length;play()};$('mute').onclick=()=>{on=!on;a.muted=!on;$('mute').textContent=on?'🔊 Music':'🔇 Music';if(on&&a.paused)play()};
addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);if(a.paused)play()});if(L.length)$('np').textContent='Now playing: '+L[0].title})();
