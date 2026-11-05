window.CB_STORE_KEY=window.CB_STORE_KEY||'nintendo';
// Coffeebreak manual-order helper. Customer pays this store; Karen then buys the item on the
// supplier's public website and ships it to the customer's address.
// sale price = supplierPrice + supplierShipping (if known) + profit (minimum $10).
(function(){
var MIN=10;
function r2(n){return Math.round(n*100)/100}
function sale(p){if(!p||p.supplierPrice==null)return null;return r2(+p.supplierPrice+(+p.supplierShipping||0)+Math.max(+p.profit||0,MIN))}
function money(n){return n==null?'n/a':'$'+(+n).toFixed(2)}
function text(o){LAST=o;
 var c=o.customer||{},L=[];
 L.push((o.store||'COFFEEBREAK')+' ORDER'+(o.orderId?' '+o.orderId:' REQUEST (not paid yet)'));
 L.push('');L.push('CUSTOMER (ship to this address)');
 L.push('Name: '+(c.name||''));L.push('Delivery address: '+(c.address||''));L.push('Phone: '+(c.phone||''));L.push('Email: '+(c.email||''));
 if(o.extra)L.push(o.extra);
 L.push('');L.push('ITEMS');
 var tp=0,tc=0,miss=0;
 (o.items||[]).forEach(function(it,i){var q=it.qty||1,sp=it.supplierPrice,sh=+it.supplierShipping||0,s=it.salePrice;
  L.push((i+1)+'. '+it.title+(q>1?' x'+q:'')+(it.options?' ('+it.options+')':''));
  if(it.supplierUrl&&/^https?:/.test(it.supplierUrl))L.push('   Order here: '+it.supplierUrl);else if(it.supplierUrl)L.push('   Supplier ref: '+it.supplierUrl+(it.id?' | product '+it.id:'')+' (S1/'+(window.CB_STORE_KEY||'store')+'.json)');else{L.push('   Order here: NO SUPPLIER LINK YET - find it before ordering');miss++}
  if(sp==null&&it.supplierUrl&&!/^https?:/.test(it.supplierUrl)){L.push('   Cost & profit: look up ref in private file');L.push('   Sale price: '+(s==null?'price on request':money(s*q)));if(s!=null)tc+=s*q;return}
  L.push('   Supplier price: '+(sp==null?'unknown':money(sp*q))+(sh?' + supplier shipping '+money(sh*q):''));
  L.push('   Sale price: '+(s==null?'price on request':money(s*q)));
  if(sp!=null&&s!=null){var pr=r2((s-sp-sh)*q);tp+=pr;L.push('   Profit: '+money(pr))}else L.push('   Profit: unknown');
  if(s!=null)tc+=s*q;});
 L.push('');L.push('Customer total: '+money(r2(o.total!=null?o.total:tc)));L.push('Your profit (known items): '+money(r2(tp)));
 if(miss)L.push('WARNING: '+miss+' item(s) have no supplier link.');
 L.push('');L.push('CHECKLIST');L.push('1. Look up supplier ref (private file) 2. Add to cart 3. Ship to customer address above 4. Pay 5. Email customer tracking');
 return L.join('\n');}
var LAST=null;
function box(html,txt){var b=document.getElementById('cb-order-status');if(!b){b=document.createElement('div');b.id='cb-order-status';b.style.cssText='background:#fff;color:#222;border:2px solid #ff5fa2;border-radius:12px;padding:12px;margin:10px 0;white-space:pre-wrap;font-size:14px';var a=document.getElementById('PayID-buttons')||document.querySelector('main')||document.body;a.parentNode?a.parentNode.insertBefore(b,a.nextSibling):document.body.appendChild(b)}b.innerHTML=html;if(txt){var pr=document.createElement('pre');pr.style.cssText='white-space:pre-wrap;font-size:12px;background:#fff5fa;padding:8px;border-radius:8px';pr.textContent=txt;b.appendChild(pr)}try{b.scrollIntoView({behavior:'smooth',block:'center'})}catch(e){}return b}
function val(id){var e=document.getElementById(id);return e?e.value:''}
function mailto(subject,body,email){var u='mailto:'+(email||'songwriterkaz@gmail.com')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);window.__lastMail=u;(window.__cbNav?window.__cbNav(u):location.href=u)}
function mail(subject,body,email){var o=LAST||{},c=o.customer||{},to=email||'songwriterkaz@gmail.com',store=o.store||document.body.dataset.store||'Coffeebreak store';
 var items=(o.items||[]).map(function(it){return (it.title||'')+(it.qty>1?' x'+it.qty:'')+(it.options?' ('+it.options+')':'')+' - '+money(it.salePrice==null?null:it.salePrice*(it.qty||1))}).join('\n');
 var d={_subject:'Coffeebreak order - '+store,_captcha:'false',_template:'box',order_subject:subject,store:store,items:items,total:money(o.total),
  name:c.name||val('cName'),email:c.email||val('cEmail'),phone:c.phone||val('cPhone'),address:c.address||val('cAddr'),
  payment:'Pay by PayID to darkokaz@gmx.com using the order number as the reference',full_order:body};
 if(d.email)d._replyto=d.email;window.__lastOrderPost=d;
 box('Sending your order...');
 var done=false;function fail(){if(done)return;done=true;box('Your order could not be sent automatically. Your email app should open now, please press Send. If it does not open, email this to '+to+':',subject+'\n\n'+body);mailto(subject,body,to)}
 var t=setTimeout(fail,15000);
 try{fetch('https://formsubmit.co/ajax/'+to,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(j){if(done)return;if(j&&(j.success===true||j.success==='true')){done=true;clearTimeout(t);box('Order sent. Pay by PayID to darkokaz@gmx.com and your order will be on its way.')}else{clearTimeout(t);fail()}}).catch(function(){clearTimeout(t);fail()})}catch(e){clearTimeout(t);fail()}}
function logo(){try{if(document.getElementById('cb-logo'))return;var h=document.querySelector('header');if(!h||h.querySelector('img[alt*="Coffeebreak"]'))return;var i=document.createElement('img');i.id='cb-logo';i.src='cb-logo.jpg';i.alt='Coffeebreak logo';i.style.cssText='height:64px;width:64px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 6px';h.insertBefore(i,h.firstChild)}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',logo);else logo();
window.CBOrder={EMAIL:'songwriterkaz@gmail.com',MIN_PROFIT:MIN,sale:sale,text:text,mail:mail,mailto:mailto,money:money};
})();
