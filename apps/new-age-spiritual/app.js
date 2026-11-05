const $=id=>document.getElementById(id);
const ALL=(window.SP_PRODUCTS||[]).map(p=>Object.assign({},p,(window.SP_SUPPLY||{})[p.id]||{}));
const sell=p=>p&&(p.priced||p.supplierPrice!=null)&&p.sell?p.sell:null;
const ps=p=>sell(p)!=null?'$'+sell(p).toFixed(2)+' AUD':'Price coming soon';
const find=i=>ALL.find(p=>p.id==i);
let cart=JSON.parse((()=>{try{return localStorage.getItem('sp_cart')}catch(e){return null}})()||'[]').filter(i=>sell(find(i))!=null),cat='All';
function save(){try{localStorage.setItem('sp_cart',JSON.stringify(cart))}catch(e){}draw()}
function add(id){cart.push(id);save();$('reveal').textContent='✨ '+find(id).t+' added to your cart.'}
function total(){return Math.round(cart.reduce((a,i)=>a+(sell(find(i))||0),0)*100)/100}
function summary(no){return CBOrder.text({store:'COFFEEBREAK NEW AGE SPIRITUAL (AUD)',orderId:no||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'NOTE: Profit shown is before the ~2.6% PayPal fee. Supplier shipping is per order; combine items from the same supplier to save.',
 items:cart.map(i=>{const p=find(i);return {title:p.t+' ['+p.supplier+']',options:p.supplierVariant?'select: '+p.supplierVariant:'',supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(i=>{const p=find(i);return {name:p.t,amount:sell(p),qty:1}}),
 validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},
 email:()=>$('cEmail').value,subject:no=>'Spiritual Store order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
const card=p=>`<div class="card"><img class="pimg" src="${p.img}" alt="${p.t}" loading="lazy"><h3>${p.t}</h3><small>${p.cat}</small><p class="price">${ps(p)}</p>${sell(p)!=null?`<button onclick="add('${p.id}')">Add to cart</button>`:'<button disabled>Price coming soon</button>'}</div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];$('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" onclick="cat='${c}';draw()">${c}</button>`).join('');
 $('grid').innerHTML=ALL.filter(p=>cat=='All'||p.cat==cat).map(card).join('');$('cc').textContent=cart.length;
 $('lines').innerHTML=cart.map((i,n)=>`<p>${find(i).t} – ${ps(find(i))} <button onclick="cart.splice(${n},1);save()">x</button></p>`).join('')||'<p>Your cart is empty</p>';$('tot').textContent=total().toFixed(2)}
function tab(t){document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x.dataset.t==t));['shop','read','cart'].forEach(s=>$(s).hidden=s!=t);if(t=='cart')paypal()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.t));
draw();
// starry sky
(function(){const s=$('sky');for(let i=0;i<120;i++){const e=document.createElement('div');e.className='star';const z=Math.random()*2.5+.5;e.style.cssText=`width:${z}px;height:${z}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s`;s.appendChild(e)}
for(let i=0;i<3;i++){const e=document.createElement('div');e.className='shoot';e.style.cssText=`left:${60+Math.random()*40}%;top:${Math.random()*40}%;animation-delay:${i*2.2}s`;s.appendChild(e)}})();
Reader.init();
