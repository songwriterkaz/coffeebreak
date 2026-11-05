const $=id=>document.getElementById(id);const STORE=document.body.dataset.store;const FEE=window.CB_FEE||5000;
const ALL=(window.CB_PRODUCTS||[]).map(p=>Object.assign({},p,(window.CB_SUPPLY||{})[p.id]||{}));const find=i=>ALL.find(p=>p.id==i);
const KEY='cb_printhomes_enq';let cart=[];try{cart=JSON.parse(localStorage.getItem(KEY)||'[]').filter(find)}catch(e){}let cat='All';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'$'+n.toLocaleString('en-AU');
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}draw()}
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2200)}
function add(id){if(!cart.includes(id))cart.push(id);save();toast('Added to enquiry: '+find(id).t)}
const priceTxt=p=>p.est?`<p class="price">from ~${money(p.est)}*</p><small>+ Coffeebreak matching fee ${money(FEE)}, only if you sign with the builder</small>`:`<p class="price">Price by quote</p><small>+ Coffeebreak matching fee ${money(FEE)}, only if you sign with the builder</small>`;
const card=p=>`<div class="card"><div class="boatpic">${p.emo}</div><h3>${esc(p.t)}</h3><small>${esc(p.cat)}</small><p>${esc(p.desc)}</p>${priceTxt(p)}<br><button onclick="add('${p.id}')">Enquire free</button></div>`;
function draw(){const cats=['All',...new Set(ALL.map(p=>p.cat))];
 $('filters').innerHTML=cats.map(c=>`<button class="${c==cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
 $('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.dataset.c;draw()});
 $('grid').innerHTML=ALL.filter(p=>cat=='All'||p.cat==cat).map(card).join('')+'<p style="grid-column:1/-1;color:#fff"><small>* Indicative build estimate excluding land, not a quote.</small></p>';
 $('cc').textContent=cart.length;
 $('lines').innerHTML=cart.map((id,n)=>{const p=find(id);return `<p><span>${esc(p.t)}</span><span>${p.est?'~'+money(p.est):'quote'} <button onclick="cart.splice(${n},1);save()">✕</button></span></p>`}).join('')||'<p>No home chosen yet.</p>'}
function summary(){return CBOrder.text({store:STORE+' (AUD)',orderId:'',customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},
 extra:'3D PRINTED HOME ENQUIRY – REFERRAL ONLY. Do NOT take any money. Introduce the customer to the licensed builder; the customer signs and pays deposits DIRECTLY to the builder. Coffeebreak matching fee $5,000 per home: agree in writing with the builder as a referral fee (or invoice the customer only after they sign). Never say Coffeebreak will build. Prices are estimates.',
 items:cart.map(id=>{const p=find(id);return {title:p.t+' ['+p.supplier+'] ('+p.basis+')',options:'',supplierUrl:p.supplierUrl,supplierPrice:p.est||0,supplierShipping:0,salePrice:p.est||0}}),total:0})}
$('enq').onclick=()=>{if(!cart.length||!$('cName').value||!$('cEmail').value||!$('cPhone').value){alert('Please choose a home and add your name, email and phone.');return}CBOrder.mail(STORE+' enquiry – '+$('cName').value,summary());toast('Enquiry email opened – we will reply within 1–2 business days.')};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x==b));['shop','cart'].forEach(t=>{$(t).hidden=t!=b.dataset.t})});
draw();
