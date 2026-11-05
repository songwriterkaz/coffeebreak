(function(){
var TO='songwriterkaz@gmail.com';
var ADULT=['S','M','L','XL','2XL'];
var P=[
 {id:'cable-jumper',name:'Cable Knit Jumper',cat:'Jumpers',price:18900,img:'cable-jumper',weeks:'4 to 5',desc:'Classic chunky cable knit in soft merino blend.',sizes:ADULT,colours:['Cream','Oatmeal','Charcoal','Navy']},
 {id:'fisherman-jumper',name:'Fisherman Jumper',cat:'Jumpers',price:19900,img:'fisherman-jumper',weeks:'4 to 5',desc:'Textured fisherman stitch, warm and hard wearing.',sizes:ADULT,colours:['Navy','Cream','Forest green']},
 {id:'cardigan',name:'Button Cardigan',cat:'Cardigans',price:17500,img:'cardigan',weeks:'4',desc:'Relaxed cardigan with wooden buttons.',sizes:ADULT,colours:['Oatmeal','Grey','Rust']},
 {id:'beanie',name:'Ribbed Pom Pom Beanie',cat:'Beanies',price:4500,img:'beanie',weeks:'1 to 2',desc:'Deep rib with a fold up cuff and a fluffy pom pom.',sizes:['Child','Adult'],colours:['Mustard','Cream','Rust','Navy']},
 {id:'scarf',name:'Seed Stitch Scarf',cat:'Scarves',price:6500,img:'scarf',weeks:'2',desc:'Long, squishy seed stitch scarf with fringe.',sizes:['Standard (180 cm)','Extra long (220 cm)'],colours:['Forest green','Cream','Mustard','Charcoal']},
 {id:'socks',name:'Wool Bed Socks',cat:'Socks',price:3800,img:'socks',weeks:'1 to 2',desc:'Cosy hand knitted socks with contrast heel and toe.',sizes:['Women 6-8','Women 9-11','Men 7-9','Men 10-12'],colours:['Grey and rust','Cream and navy','Charcoal and mustard']},
 {id:'mittens',name:'Fingerless Mittens',cat:'Accessories',price:4200,img:'mittens',weeks:'1 to 2',desc:'Keep fingers free and wrists warm.',sizes:['S/M','L/XL'],colours:['Heather blue','Grey','Cream']},
 {id:'throw',name:'Chunky Throw Blanket',cat:'Blankets',price:22000,img:'throw',weeks:'3 to 4',desc:'Thick, heavy knit throw for the couch or bed end.',sizes:['Lap (100 x 130 cm)','Throw (130 x 170 cm)'],colours:['Rust','Cream','Sage','Charcoal']},
 {id:'baby-blanket',name:'Baby Blanket',cat:'Blankets',price:9500,img:'baby-blanket',weeks:'2 to 3',desc:'Soft, gentle merino baby blanket in pram size.',sizes:['Pram (75 x 90 cm)','Cot (100 x 120 cm)'],colours:['Blush pink','Cream','Sage','Baby blue']},
 {id:'set',name:'Beanie and Scarf Gift Set',cat:'Accessories',price:9900,img:'scarf',weeks:'2 to 3',desc:'Matching beanie and scarf, gift wrapped.',sizes:['Adult'],colours:['Forest green','Mustard','Cream']}
];
var SIZE_EXTRA={'Throw (130 x 170 cm)':6000,'Cot (100 x 120 cm)':3000,'Extra long (220 cm)':1500,'2XL':1000};
function $(id){return document.getElementById(id);}
function money(c){return 'A$'+(c/100).toFixed(2);}
function esc(s){return String(s).replace(/[&<>"]/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];});}
function unitPrice(p,size){return p.price+(SIZE_EXTRA[size]||0);}
var cart=[];try{cart=JSON.parse(localStorage.getItem('cbWoolCart')||'[]');}catch(e){cart=[];}
cart=cart.filter(function(l){return P.some(function(p){return p.id===l.id;})&&l.qty>0;});
function save(){try{localStorage.setItem('cbWoolCart',JSON.stringify(cart));}catch(e){}}
var cats=['All'].concat(P.map(function(p){return p.cat;}).filter(function(c,i,a){return a.indexOf(c)===i;}));
var cur='All';
function renderTabs(){$('tabs').innerHTML=cats.map(function(c){return '<button class="'+(c===cur?'on':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('');}
function renderGrid(){
  $('grid').innerHTML=P.filter(function(p){return cur==='All'||p.cat===cur;}).map(function(p){
    return '<article class="card" data-id="'+p.id+'"><img loading="lazy" src="img/'+p.img+'.webp" alt="'+esc(p.name)+'"><div class="b"><h3>'+esc(p.name)+'</h3><div class="price">from '+money(p.price)+'</div><div class="mto">Made to order, ships in '+p.weeks+' weeks</div><p>'+esc(p.desc)+'</p><div class="opts"><select class="sz" aria-label="Size">'+p.sizes.map(function(s){return '<option>'+esc(s)+'</option>';}).join('')+'</select><select class="col" aria-label="Colour">'+p.colours.map(function(s){return '<option>'+esc(s)+'</option>';}).join('')+'</select></div><button class="add">Add to cart</button></div></article>';
  }).join('');
}
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b){cur=b.getAttribute('data-cat');renderTabs();renderGrid();}});
$('grid').addEventListener('click',function(e){
  var b=e.target.closest('.add');if(b===null)return;
  var card=b.closest('.card');var id=card.getAttribute('data-id');
  var size=card.querySelector('.sz').value,colour=card.querySelector('.col').value;
  var key=id+'|'+size+'|'+colour;
  var ex=cart.filter(function(l){return l.key===key;})[0];
  if(ex)ex.qty+=1;else cart.push({key:key,id:id,size:size,colour:colour,qty:1});
  save();renderCart();
  b.textContent='Added';setTimeout(function(){b.textContent='Add to cart';},900);
});
function totals(){
  var sub=0;cart.forEach(function(l){var p=P.filter(function(x){return x.id===l.id;})[0];sub+=unitPrice(p,l.size)*l.qty;});
  var method=$('shipSel').value;var ship=0;
  if(cart.length){ship=method==='express'?2200:(sub>=15000?0:1250);}
  return {sub:sub,ship:ship,total:sub+ship,method:method};
}
window.CB_totals=totals;
function renderCart(){
  var count=cart.reduce(function(a,l){return a+l.qty;},0);
  $('cartCount').textContent=count;
  var ae=document.activeElement;if(ae&&$('lines').contains(ae))ae.blur();
  if(cart.length===0){$('lines').innerHTML='<p class="empty">Your cart is empty.</p>';}
  else $('lines').innerHTML=cart.map(function(l,i){var p=P.filter(function(x){return x.id===l.id;})[0];var u=unitPrice(p,l.size);
    return '<div class="line" data-i="'+i+'"><img src="img/'+p.img+'.webp" alt=""><div><b>'+esc(p.name)+'</b><br><small>'+esc(l.size)+', '+esc(l.colour)+' &middot; '+money(u)+' each</small><div class="qty"><button class="dec" aria-label="Decrease">-</button><input class="q" type="number" min="1" max="20" value="'+l.qty+'" aria-label="Quantity"><button class="inc" aria-label="Increase">+</button></div></div><div style="text-align:right"><b class="lt">'+money(u*l.qty)+'</b><br><button class="rm">Remove</button></div></div>';}).join('');
  var t=totals();
  $('tSub').textContent=money(t.sub);$('tShip').textContent=cart.length?(t.ship===0?'Free':money(t.ship)):money(0);$('tTotal').textContent=money(t.total);
  $('toCheckout').disabled=cart.length===0;
}
$('lines').addEventListener('click',function(e){
  var row=e.target.closest('.line');if(row===null)return;var i=+row.getAttribute('data-i');
  if(e.target.classList.contains('inc'))cart[i].qty=Math.min(20,cart[i].qty+1);
  else if(e.target.classList.contains('dec')){cart[i].qty-=1;if(cart[i].qty<1)cart.splice(i,1);}
  else if(e.target.classList.contains('rm'))cart.splice(i,1);
  else return;
  save();renderCart();
});
$('lines').addEventListener('change',function(e){
  if(e.target.classList.contains('q')===false)return;var i=+e.target.closest('.line').getAttribute('data-i');
  var v=parseInt(e.target.value,10);if(isNaN(v)||v<1){cart.splice(i,1);}else cart[i].qty=Math.min(20,v);
  save();renderCart();
});
$('shipSel').addEventListener('change',renderCart);
function show(v){['cartView','checkoutView','doneView'].forEach(function(x){$(x).classList.toggle('hidden',x!==v);});}
function open(){$('drawer').classList.add('open');$('drawer').setAttribute('aria-hidden','false');}
function close(){$('drawer').classList.remove('open');$('drawer').setAttribute('aria-hidden','true');if($('doneView').classList.contains('hidden')===false)show('cartView');}
$('cartBtn').addEventListener('click',function(){show('cartView');open();});
$('drawer').addEventListener('click',function(e){if(e.target.id==='drawer'||e.target.hasAttribute('data-close'))close();});
$('toCheckout').addEventListener('click',function(){if(cart.length)show('checkoutView');});
$('backToCart').addEventListener('click',function(){show('cartView');});
function makeRef(){var d=new Date();var p=function(n){return ('0'+n).slice(-2);};return 'CBW-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase();}
var lastMail='',lastText='';window.CB_lastMailto='';
$('coForm').addEventListener('submit',function(e){
  e.preventDefault();
  var name=$('c-name').value.trim(),email=$('c-email').value.trim(),addr=$('c-addr').value.trim();
  var errs=[];if(name==='')errs.push('your name');if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)===false)errs.push('a valid email');if(addr==='')errs.push('a delivery address');
  if(errs.length){$('c-err').textContent='Please add '+errs.join(', ')+'.';return;}
  $('c-err').textContent='';
  var t=totals();var ref=makeRef();
  var lines=cart.map(function(l){var p=P.filter(function(x){return x.id===l.id;})[0];var u=unitPrice(p,l.size);return l.qty+' x '+p.name+' ('+l.size+', '+l.colour+') @ '+money(u)+' = '+money(u*l.qty)+' [ships in '+p.weeks+' weeks]';});
  var summary=lines.join('\n')+'\n\nSubtotal: '+money(t.sub)+'\nShipping ('+(t.method==='express'?'Express':'Standard')+'): '+(t.ship===0?'Free':money(t.ship))+'\nTotal: '+money(t.total);
  lastText='Coffeebreak Wool order '+ref+'\n\n'+summary+'\n\nName: '+name+'\nEmail: '+email+'\nPhone: '+($('c-phone').value.trim()||'Not given')+'\nDeliver to: '+addr+'\nNotes: '+($('c-notes').value.trim()||'None')+'\n\nPayment: Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com\nPayment reference: '+ref;
  lastMail='mailto:'+TO+'?cc='+encodeURIComponent(email)+'&subject='+encodeURIComponent('Coffeebreak Wool order '+ref)+'&body='+encodeURIComponent(lastText);
  window.CB_lastMailto=lastMail;window.CB_lastOrder={ref:ref,total:t.total,text:lastText};
  $('oRef').textContent=ref;$('oRef2').textContent=ref;$('oSummary').textContent=summary;$('oAmt').textContent=money(t.total);
  $('oMsg').textContent='Your email app should open with your order. Press send so Coffeebreak receives it.';
  show('doneView');
  cart=[];save();renderCart();
  window.location.href=lastMail;
});
$('resend').addEventListener('click',function(){if(lastMail)window.location.href=lastMail;});
$('copyOrder').addEventListener('click',function(){
  var done=function(){$('oMsg').textContent='Order copied. Paste it into an email to '+TO+'.';};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText('To: '+TO+'\n\n'+lastText).then(done,done);else{var ta=document.createElement('textarea');ta.value=lastText;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(x){}ta.remove();done();}
});
renderTabs();renderGrid();renderCart();
})();
