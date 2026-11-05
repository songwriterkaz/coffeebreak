const C={orderEmail:'songwriterkaz@gmail.com',currency:'AUD'};
const $=id=>document.getElementById(id);
// Only items with a verified supplier price are listed; anything without shows 'Price coming soon'.
const ALL=(window.KE_PRODUCTS||[]).map(p=>Object.assign({},p,(window.KE_SUPPLY||{})[p.id]||{}));
const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell?p.sell:null;
const ps=p=>sell(p)!=null?'$'+sell(p).toFixed(2)+' AUD':'Price coming soon';
const find=i=>ALL.find(p=>p.id==i);
let cart=JSON.parse((()=>{try{return localStorage.getItem('ked_cart2')}catch(e){return null}})()||'[]').filter(i=>sell(find(i))!=null);
let cat='All';
function save(){try{localStorage.setItem('ked_cart2',JSON.stringify(cart))}catch(e){}draw()}
function add(id){cart.push(id);save();$('reveal').innerHTML='💖 '+find(id).t+' added to your cart.'}
function total(){return Math.round(cart.reduce((a,i)=>a+(sell(find(i))||0),0)*100)/100}
const hasRing=()=>cart.some(i=>find(i).ring);
function summary(id){return CBOrder.text({store:'KAREN ELIZABETH DIAMONDS (AUD)',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:(hasRing()?'RING SIZE: '+$('cSize').value+'  <-- select this size on the supplier site\n':'')+'NOTE: if an item needs a ring size or engraving, it must be captured at checkout (no engraving offered). Profit shown is before the ~2.6% PayPal fee.',
 items:cart.map(i=>{const p=find(i);return {title:p.t+' ['+p.supplier+']',options:p.ring?'ring size '+$('cSize').value:'',supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(i=>{const p=find(i);return {name:p.t,amount:sell(p),qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}if(hasRing()&&!$('cSize').value.trim()){alert('Please enter your ring size.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>'KE Diamonds order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card"><img class="pimg" src="${p.img}" alt="${p.t}" loading="lazy"><h3>${p.t}</h3><small>${p.cat}${p.ring?' • choose your ring size at checkout':''}</small><p class="price">${ps(p)}</p>${sell(p)!=null?`<button onclick="add('${p.id}')">Add to cart</button>`:'<button disabled>Price coming soon</button>'}</div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];$('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" onclick="cat='${c}';draw()">${c}</button>`).join('');
$('grid').innerHTML=ALL.filter(p=>cat=='All'||p.cat==cat).map(card).join('');
$('cc').textContent=cart.length;$('lines').innerHTML=cart.map((i,n)=>`<p>${find(i).t} – ${ps(find(i))} <button onclick="cart.splice(${n},1);save()">x</button></p>`).join('')||'<p>Empty</p>';$('tot').textContent=total().toFixed(2);$('sizeBox').hidden=!hasRing()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t});if(b.dataset.t=='cart')paypal()});
draw();
(function(){const a=$('music'),L=window.PLAYLIST||[];let i=0,on=true;function play(){if(!L.length)return;a.src='assets/music/'+L[i].file;$('np').textContent='Now playing: '+L[i].title;a.play().catch(()=>{})}
a.onended=()=>{i=(i+1)%L.length;play()};$('skip').onclick=()=>{i=(i+1)%L.length;play()};$('mute').onclick=()=>{on=!on;a.muted=!on;$('mute').textContent=on?'🔊 Music':'🔇 Music';if(on&&a.paused)play()};
addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);if(a.paused)play()});if(L.length)$('np').textContent='Now playing: '+L[0].title})();
