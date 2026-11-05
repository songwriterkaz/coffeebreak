window.CB_STORE_KEY=window.CB_STORE_KEY||'pooltables';
// Coffeebreak manual-order helper. Customer pays this store; Karen then buys the item on the
// supplier's public website and ships it to the customer's address.
// Tables: sell = (supplierPrice + supplierShipping + 500) / (1 - feePct). Accessories: min $10 profit.
(function(){
var MIN=10, TABLE=500;
function r2(n){return Math.round(n*100)/100}
function profitOf(p){if(p&&p.accessory)return Math.max(+p.profit||0,MIN);if(p&&p.profit!=null)return +p.profit;return TABLE}
function sale(p){if(!p||p.supplierPrice==null)return null;var b=+p.supplierPrice+(+p.supplierShipping||0)+profitOf(p);if(p.feePct)b=b/(1-p.feePct);return r2(b)}
function money(n){return n==null?'n/a':'$'+(+n).toFixed(2)}
function text(o){
 var c=o.customer||{},L=[];
 L.push((o.store||'COFFEEBREAK')+' ORDER'+(o.orderId?' '+o.orderId:' REQUEST (not paid yet)'));
 L.push('');L.push('CUSTOMER (ship to this address)');
 L.push('Name: '+(c.name||''));L.push('Delivery address: '+(c.address||''));L.push('Phone: '+(c.phone||''));L.push('Email: '+(c.email||''));
 if(o.extra)L.push(o.extra);
 L.push('');L.push('ITEMS');
 var tp=0,tc=0,miss=0;
 (o.items||[]).forEach(function(it,i){var q=it.qty||1,sp=it.supplierPrice,sh=+it.supplierShipping||0,s=it.salePrice,fee=+it.feePct||0;
  L.push((i+1)+'. '+it.title+(q>1?' x'+q:'')+(it.options?' ('+it.options+')':''));
  if(it.supplierUrl&&/^https?:/.test(it.supplierUrl))L.push('   Order here: '+it.supplierUrl);else if(it.supplierUrl)L.push('   Supplier ref: '+it.supplierUrl+(it.id?' | product '+it.id:'')+' (look up in private-suppliers/'+(window.CB_STORE_KEY||'store')+'.json)');else{L.push('   Order here: NO SUPPLIER LINK YET - find it before ordering');miss++}
  if(sp==null&&it.supplierUrl&&!/^https?:/.test(it.supplierUrl)){L.push('   Cost & profit: look up ref in private file');L.push('   Sale price: '+(s==null?'price on request':money(s*q)));if(s!=null)tc+=s*q;return}
  L.push('   Supplier price: '+(sp==null?'unknown':money(sp*q))+(sh?' + supplier shipping '+money(sh*q):''));
  if(it.deliveryQuote)L.push('   ** DELIVERY NOT INCLUDED: get S5 delivery quote for customer postcode before buying **');
  L.push('   Sale price: '+(s==null?'price on request':money(s*q)));
  if(sp!=null&&s!=null){var pr=r2((s*(1-fee)-sp-sh)*q);tp+=pr;L.push('   Profit (after PayPal fee, target $500/table): '+money(pr))}else L.push('   Profit: unknown (enter supplier price; tables use $500 profit)');
  if(s!=null)tc+=s*q;});
 L.push('');L.push('Customer total: '+money(r2(o.total!=null?o.total:tc)));L.push('Your profit after PayPal fee (known items): '+money(r2(tp)));
 if(miss)L.push('WARNING: '+miss+' item(s) have no supplier link.');
 L.push('');L.push('CHECKLIST');L.push('1. Look up supplier ref (private file) 2. Add to cart 3. Ship to customer address above 4. Pay 5. Email customer tracking');
 return L.join('\n');}
function mail(subject,body,email){var u='mailto:'+(email||'songwriterkaz@gmail.com')+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);window.__lastMail=u;(window.__cbNav?window.__cbNav(u):location.href=u)}
function logo(){try{if(document.getElementById('cb-logo'))return;var h=document.querySelector('header');if(!h||h.querySelector('img[alt*="Coffeebreak"]'))return;var i=document.createElement('img');i.id='cb-logo';i.src='cb-logo.jpg';i.alt='Coffeebreak logo';i.style.cssText='height:40px;width:40px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 6px';h.insertBefore(i,h.firstChild)}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',logo);else logo();
window.CBOrder={EMAIL:'songwriterkaz@gmail.com',MIN_PROFIT:MIN,TABLE_PROFIT:TABLE,sale:sale,text:text,mail:mail,money:money};
})();
