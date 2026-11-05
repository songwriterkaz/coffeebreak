const C={orderEmail:'songwriterkaz@gmail.com',paypalClientId:'AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-',currency:'AUD'};
const $=id=>document.getElementById(id);
const TIERS=[{id:'s',t:'Pebble Pouch (Small)',d:'Small mystery box – surprise mix of pre-loved crystals',supplierUrl:'S2-L6b57f5',id:'s',salePrice:31.45,c:'#c8a2ff'},
{id:'m',t:'Geode Bag (Medium)',d:'Medium mystery box – bigger surprise crystal mix',supplierUrl:'S2-L6b57f5',id:'m',salePrice:41.95,c:'#ff7eb6'},
{id:'l',t:'Treasure Sack (Large)',d:'Large mystery box – large surprise crystal mix',supplierUrl:'S2-L6b57f5',id:'l',salePrice:52.45,c:'#7ee0ff'},
{id:'x',t:'Collector Crate (Jumbo)',d:'Jumbo mystery box – jumbo surprise crystal mix',supplierUrl:'S2-L6b57f5',id:'x',salePrice:72.95,c:'#ffd166'}];
const sell=p=>p&&p.salePrice!=null?p.salePrice:null;const lab=p=>sell(p)==null?'Price coming soon':'AUD $'+sell(p).toFixed(2);
let cart=JSON.parse(localStorage.getItem('rock_cart')||'[]').filter(i=>sell(TIERS.find(p=>p.id==i))!=null);
function save(){try{localStorage.setItem('rock_cart',JSON.stringify(cart))}catch(e){}draw()}
function add(id){cart.push(id);save();const t=TIERS.find(x=>x.id==id);$('reveal').innerHTML='✨ '+t.t+' added – your stones are a surprise until they arrive!'}
const find=i=>TIERS.find(p=>p.id==i);
function total(){return cart.reduce((a,i)=>a+(sell(find(i))||0),0)}
function summary(id){return CBOrder.text({store:'COFFEEBREAK ROCK LUCKY DIP',orderId:id||'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},items:cart.map(i=>{const p=find(i);return {title:p.t+' – '+p.d,supplierUrl:p.supplierUrl,supplierPrice:p.supplierPrice,supplierShipping:p.supplierShipping,salePrice:sell(p)}}),total:total()})}
function mail(id){const u='mailto:'+C.orderEmail+'?subject='+encodeURIComponent('Rock Lucky Dip order '+(id||'request')+' – '+$('cName').value)+'&body='+encodeURIComponent(summary(id));window.__lastMail=u;location.href=u}
let pp=false;function paypal(){if(pp)return;pp=true;CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>cart.map(i=>{const p=find(i);return {name:p.t,amount:sell(p),qty:1}}),validate:()=>{if(!$('cName').value||!$('cAddr').value||!$('cEmail').value){alert('Please add your name, email and delivery address.');return false}return true},email:()=>$('cEmail').value,subject:no=>'Rock Lucky Dip order '+no+' – '+$('cName').value,body:no=>summary(no),onDone:()=>{cart=[];save()}})}
function draw(){$('grid').innerHTML=TIERS.map(p=>`<div class="card"><div class="bag" style="--c:${p.c}">💎</div><h3>${p.t}</h3><small>${p.d}</small><p>${lab(p)}</p>${sell(p)==null?'<button disabled>Price coming soon</button>':`<button onclick="add('${p.id}')">Add to cart</button>`}</div>`).join('');
$('supList')&&($('supList').innerHTML='');
$('cc').textContent=cart.length;$('lines').innerHTML=cart.map((i,n)=>`<p>${find(i).t} – ${lab(find(i))} <button onclick="cart.splice(${n},1);save()">x</button></p>`).join('')||'<p>Empty</p>';$('tot').textContent=total().toFixed(2)}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{if($(t))$(t).hidden=t!=b.dataset.t});if($('sup'))$('sup').hidden=true;if(b.dataset.t=='cart')paypal()});
$('mailBtn').onclick=()=>mail();draw();
// music bar
(function(){const a=$('music'),L=window.PLAYLIST||[];let i=0,on=true;function play(){if(!L.length)return;a.src='assets/music/'+L[i].file;$('np').textContent='Now playing: '+L[i].title;a.play().catch(()=>{})}
a.onended=()=>{i=(i+1)%L.length;play()};$('skip').onclick=()=>{i=(i+1)%L.length;play()};$('mute').onclick=()=>{on=!on;a.muted=!on;$('mute').textContent=on?'🔊 Music':'🔇 Music';if(on&&a.paused)play()};
addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);if(a.paused)play()});if(L.length)$('np').textContent='Now playing: '+L[0].title})();
