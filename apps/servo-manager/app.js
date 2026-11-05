/* Coffeebreak Servo & Pub Orders. © Karen O'Brien (Coffeebreak). */
(function(){
'use strict';
var KEY='cb_servopub_v1', PAYID='darkokaz@gmx.com';
var STEPS=['placed','accepted','preparing','ready','out','delivered'];
var LABEL={placed:'Placed',accepted:'Accepted',preparing:'Preparing',ready:'Ready',out:'On the way',delivered:'Done',cancelled:'Cancelled'};
var MODES={pickup:'Pickup',delivery:'Delivery',dinein:'Dine-in / table',counter:'Pay at counter'};
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function money(n){return '$'+(Math.round(n*100)/100).toFixed(2)}
function uid(p){return p+Date.now().toString(36).slice(-5)+Math.random().toString(36).slice(2,5)}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function dayOf(t){var d=new Date(t);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function tm(t){return new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove('show')},2600)}

/* ---------- storage with memory fallback ---------- */
var mem={};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}};
function it(id,name,price,cat,alc){return {id:id,name:name,price:price,cat:cat,alcohol:!!alc,available:true}}
function sample(){
 return [
 {id:'v-s1',sample:true,type:'servo',name:'Sample Servo: Harbour Road Fuel & Food',abn:'',address:'Sample address, Newcastle NSW',phone:'',email:'',hours:'24 hours',licence:'',delivery:true,dinein:false,
  menu:[it('s1a','Sausage roll','4.50','Hot food'),it('s1b','Meat pie','5.50','Hot food'),it('s1c','Toasted ham & cheese sandwich','7.00','Hot food'),it('s1d','Iced coffee 500 ml','4.80','Drinks'),it('s1e','Bottled water 600 ml','3.20','Drinks'),it('s1f','Energy drink 500 ml','4.90','Drinks'),it('s1g','Chocolate bar','2.80','Snacks'),it('s1h','Potato chips 175 g','4.60','Snacks'),it('s1i','Bag of ice 5 kg','5.50','Essentials'),it('s1j','Milk 2 L','3.90','Essentials'),it('s1k','Windscreen washer 2 L','6.50','Car care'),it('s1l','Pre-pay fuel voucher (pay at pump)','20.00','Fuel')]},
 {id:'v-s2',sample:true,type:'servo',name:'Sample Servo: Lakeside Express',abn:'',address:'Sample address, Lake Macquarie NSW',phone:'',email:'',hours:'5 am to 11 pm',licence:'',delivery:true,dinein:false,
  menu:[it('s2a','Hot dog','4.00','Hot food'),it('s2b','Chicken wrap','8.50','Hot food'),it('s2c','Barista flat white','4.70','Drinks'),it('s2d','Soft drink can','2.90','Drinks'),it('s2e','Lollies bag','3.50','Snacks'),it('s2f','Bread loaf','4.20','Essentials'),it('s2g','Phone charger cable','15.00','Essentials'),it('s2h','Gas bottle swap 9 kg','32.00','Essentials')]},
 {id:'v-p1',sample:true,type:'pub',name:'Sample Pub: The Coffeebreak Arms',abn:'',address:'Sample address, Newcastle NSW',phone:'',email:'',hours:'11 am to midnight',licence:'',delivery:true,dinein:true,
  menu:[it('p1a','Chicken schnitzel with chips & salad','24.00','Mains'),it('p1b','Beef burger with chips','22.00','Mains'),it('p1c','Fish & chips','23.00','Mains'),it('p1d','Chicken parmigiana','26.00','Mains'),it('p1e','Garlic bread','8.00','Sides'),it('p1f','Bowl of wedges','11.00','Sides'),it('p1g','Kids nuggets & chips','12.00','Kids'),it('p1h','Lemon lime & bitters','6.00','Drinks'),it('p1i','Schooner of house lager','8.50','Alcohol',1),it('p1j','Glass of house white wine','10.00','Alcohol',1),it('p1k','Six-pack takeaway lager','26.00','Alcohol',1)]},
 {id:'v-p2',sample:true,type:'pub',name:'Sample Pub: Beachside Hotel',abn:'',address:'Sample address, Merewether NSW',phone:'',email:'',hours:'10 am to 10 pm',licence:'',delivery:false,dinein:true,
  menu:[it('p2a','Steak sandwich','21.00','Mains'),it('p2b','Salt & pepper squid','19.00','Mains'),it('p2c','Veggie burger','20.00','Mains'),it('p2d','Hot chips','8.00','Sides'),it('p2e','Sticky date pudding','12.00','Dessert'),it('p2f','Sparkling water','5.00','Drinks'),it('p2g','Schooner of pale ale','9.00','Alcohol',1)]}
 ];
}
var D;
function load(){try{D=JSON.parse(store.get(KEY)||'null')}catch(e){D=null}
 if(!D||!D.venues){D={venues:sample(),orders:[],cart:{venueId:null,items:{}},myOrders:[],myVenue:null,driver:{name:''}}}
 D.cart=D.cart||{venueId:null,items:{}};D.myOrders=D.myOrders||[];D.driver=D.driver||{name:''};D.orders=D.orders||[]}
function save(){store.set(KEY,JSON.stringify(D))}
function venue(id){for(var i=0;i<D.venues.length;i++)if(D.venues[i].id===id)return D.venues[i];return null}
function order(id){for(var i=0;i<D.orders.length;i++)if(D.orders[i].id===id)return D.orders[i];return null}
function find(v,iid){for(var i=0;i<v.menu.length;i++)if(v.menu[i].id===iid)return v.menu[i];return null}
function cartLines(){var v=venue(D.cart.venueId),out=[];if(!v)return out;for(var k in D.cart.items){var m=find(v,k);if(m&&D.cart.items[k]>0)out.push({id:m.id,name:m.name,price:+m.price,qty:D.cart.items[k],alcohol:m.alcohol})}return out}
function total(lines){return lines.reduce(function(s,l){return s+l.price*l.qty},0)}
function updCart(){var n=0;for(var k in D.cart.items)n+=D.cart.items[k];$('#cartN').textContent=n}

/* ---------- routing ---------- */
var route={name:'home',arg:null};
function go(name,arg){route={name:name,arg:arg||null};try{history.replaceState(null,'','#'+name+(arg?'/'+arg:''))}catch(e){}render();try{window.scrollTo(0,0)}catch(e){}}
function render(){var V=$('#view'),r=route.name;
 [].forEach.call(document.querySelectorAll('#tabs button'),function(b){var g=b.getAttribute('data-go');b.classList.toggle('on',g===r||(g==='home'&&(r==='venue'||r==='cart'))||(g==='track'&&r==='order')||(g==='manage'&&r==='signup'))});
 var f=views[r]||views.home;V.innerHTML=f(route.arg);updCart();if(after[r])after[r](route.arg)}
var views={},after={};

/* ---------- customer ---------- */
var filter='all';
views.home=function(){
 var list=D.venues.filter(function(v){return filter==='all'||v.type===filter});
 var h='<h2>Order from a servo or pub</h2><div class="note">Venues marked <b>Sample</b> are example listings only, not real businesses or partners. Real venues appear here once they sign up in the Venue tab.</div>'+
 '<div class="row" style="margin:8px 0 12px"><button class="btn sm '+(filter==='all'?'':'alt')+'" data-filter="all">All</button><button class="btn sm '+(filter==='servo'?'':'alt')+'" data-filter="servo">Servos</button><button class="btn sm '+(filter==='pub'?'':'alt')+'" data-filter="pub">Pubs</button></div><div class="grid">';
 list.forEach(function(v){var modes=['Pickup','Pay at counter'];if(v.delivery)modes.push('Delivery');if(v.dinein)modes.push('Dine-in');
  h+='<div class="card venue" data-venue="'+esc(v.id)+'" role="button" tabindex="0"><div>'+(v.sample?'<span class="badge sample">Sample</span>':'<span class="badge live">Signed up</span>')+'<span class="badge '+v.type+'">'+(v.type==='servo'?'Servo':'Pub')+'</span></div><h3>'+esc(v.name)+'</h3><div class="muted">'+esc(v.address)+(v.hours?' · '+esc(v.hours):'')+'</div><div class="muted">'+modes.join(' · ')+' · '+v.menu.length+' items</div></div>'});
 if(!list.length)h+='<p>No venues yet.</p>';
 return h+'</div>'};
views.venue=function(id){var v=venue(id);if(!v)return '<p>Venue not found.</p>';
 var cats={},h='<button class="btn alt sm" data-go="home">Back</button><h2>'+esc(v.name)+'</h2><div class="muted">'+esc(v.address)+(v.hours?' · '+esc(v.hours):'')+'</div>';
 if(v.sample)h+='<div class="note">Sample listing. Prices and items are examples only.</div>';
 v.menu.forEach(function(m){if(m.available===false)return;(cats[m.cat||'Other']=cats[m.cat||'Other']||[]).push(m)});
 var hasAlc=v.menu.some(function(m){return m.alcohol});
 if(hasAlc)h+='<div class="note red">Alcohol is only sold to people 18 or over, and ID is checked on collection or delivery. Alcohol delivery is only offered when the venue holds a NSW liquor licence that allows it.</div>';
 h+='<div class="grid">';
 for(var c in cats){h+='<div class="card"><h3>'+esc(c)+'</h3>';cats[c].forEach(function(m){var q=D.cart.venueId===v.id?(D.cart.items[m.id]||0):0;
  h+='<div class="item"><div>'+esc(m.name)+(m.alcohol?' <span class="badge">18+</span>':'')+'<div class="price">'+money(+m.price)+'</div></div><div class="qty"><button data-dec="'+esc(m.id)+'" aria-label="Remove one">-</button><b>'+q+'</b><button data-add="'+esc(m.id)+'" data-v="'+esc(v.id)+'" aria-label="Add one">+</button></div></div>'});h+='</div>'}
 h+='</div><p><button class="btn go full" data-go="cart">View cart and order</button></p>';return h};
var form={mode:'pickup'};
views.cart=function(){var lines=cartLines(),v=venue(D.cart.venueId);
 if(!lines.length)return '<h2>Your cart</h2><p>Your cart is empty.</p><button class="btn" data-go="home">Browse venues</button>';
 var alc=lines.some(function(l){return l.alcohol});
 var modes=['pickup','counter'];if(v.delivery&&!(alc&&!v.licence))modes.push('delivery');if(v.dinein)modes.push('dinein');
 if(modes.indexOf(form.mode)<0)form.mode='pickup';
 var h='<h2>Your cart</h2><div class="card"><h3>'+esc(v.name)+'</h3>';
 lines.forEach(function(l){h+='<div class="item"><div>'+l.qty+' x '+esc(l.name)+'</div><div class="row" style="flex-wrap:nowrap"><span class="price">'+money(l.price*l.qty)+'</span><button class="btn alt sm" data-dec="'+esc(l.id)+'">-</button><button class="btn alt sm" data-add="'+esc(l.id)+'" data-v="'+esc(v.id)+'">+</button></div></div>'});
 var fee=form.mode==='delivery'?6:0;
 h+='<div class="item"><b>Subtotal</b><b>'+money(total(lines))+'</b></div>'+(fee?'<div class="item"><span>Delivery fee</span><span>'+money(fee)+'</span></div>':'')+'<div class="item"><b>Total</b><b id="tot">'+money(total(lines)+fee)+'</b></div></div>';
 h+='<div class="card" style="margin-top:12px"><h3>How do you want it</h3><div class="modes">';
 ['pickup','delivery','dinein','counter'].forEach(function(m){var ok=modes.indexOf(m)>=0;h+='<label class="'+(form.mode===m?'on':'')+'" style="'+(ok?'':'opacity:.4')+'"><input type="radio" name="mode" value="'+m+'" '+(form.mode===m?'checked':'')+(ok?'':' disabled')+'>'+MODES[m]+'</label>'});
 h+='</div>';
 if(alc&&v.delivery&&!v.licence)h+='<div class="note red">Delivery is not available for this order because it includes alcohol and this venue has not entered a NSW liquor licence that allows delivery.</div>';
 h+='<label for="cName">Your first name</label><input id="cName" maxlength="40" autocomplete="given-name" value="'+esc(form.name||'')+'">';
 h+='<label for="cPhone">Mobile (so the venue can reach you)</label><input id="cPhone" type="tel" maxlength="20" autocomplete="tel" value="'+esc(form.phone||'')+'">';
 if(form.mode==='delivery')h+='<label for="cAddr">Delivery address</label><textarea id="cAddr" rows="2" maxlength="160">'+esc(form.addr||'')+'</textarea>';
 if(form.mode==='dinein')h+='<label for="cTable">Table number</label><input id="cTable" maxlength="10" inputmode="numeric" value="'+esc(form.table||'')+'">';
 h+='<label for="cNote">Notes for the venue (optional)</label><input id="cNote" maxlength="140" value="'+esc(form.note||'')+'">';
 h+='<h3 style="margin-top:14px">Payment</h3><label class="chk"><input type="radio" name="pay" value="payid" '+(form.pay!=='person'?'checked':'')+'>Pay by PayID (Teachers Mutual Bank): '+PAYID+'</label><label class="chk"><input type="radio" name="pay" value="person" '+(form.pay==='person'?'checked':'')+'>Pay in person ('+(form.mode==='delivery'?'to the driver or venue':'at the counter')+')</label>';
 if(alc)h+='<div class="note red"><label class="chk" style="margin:0"><input type="checkbox" id="age18">I confirm I am 18 or over. I will show photo ID when I collect or receive this order. Alcohol is not sold to anyone under 18 or anyone who is intoxicated.</label></div>';
 h+='<p><button class="btn go full" id="place">Place order</button></p><div class="muted">Your order is saved on this device. After placing it you can send it to the venue by email or SMS.</div></div>';
 return h};
after.cart=function(){[].forEach.call(document.querySelectorAll('input[name=mode]'),function(r){r.onchange=function(){keep();form.mode=r.value;render()}});
 [].forEach.call(document.querySelectorAll('input[name=pay]'),function(r){r.onchange=function(){keep();form.pay=r.value;render()}});
 var p=$('#place');if(p)p.onclick=place};
function val(id){var e=$('#'+id);return e?e.value.trim():''}
function keep(){if($('#cName'))form.name=val('cName');if($('#cPhone'))form.phone=val('cPhone');if($('#cAddr'))form.addr=val('cAddr');if($('#cTable'))form.table=val('cTable');if($('#cNote'))form.note=val('cNote')}
function place(){keep();var lines=cartLines(),v=venue(D.cart.venueId);if(!lines.length)return;
 var alc=lines.some(function(l){return l.alcohol});
 if(!form.name)return toast('Please add your first name');
 if(!/^[0-9 +()-]{8,20}$/.test(form.phone||''))return toast('Please add a valid mobile number');
 if(form.mode==='delivery'&&(form.addr||'').length<6)return toast('Please add a delivery address');
 if(form.mode==='dinein'&&!form.table)return toast('Please add your table number');
 if(alc&&!($('#age18')&&$('#age18').checked))return toast('Please confirm you are 18 or over');
 var pay=(document.querySelector('input[name=pay]:checked')||{}).value||'payid';
 var fee=form.mode==='delivery'?6:0;
 var o={id:uid('CB'),venueId:v.id,venueName:v.name,items:lines,subtotal:total(lines),fee:fee,total:total(lines)+fee,mode:form.mode,name:form.name,phone:form.phone,addr:form.mode==='delivery'?form.addr:'',table:form.mode==='dinein'?form.table:'',note:form.note||'',pay:pay,paid:false,age18:alc,status:'placed',created:Date.now(),history:[{s:'placed',t:Date.now()}],driver:''};
 o.id=o.id.toUpperCase();D.orders.unshift(o);D.myOrders.unshift(o.id);D.cart={venueId:null,items:{}};form.note='';save();toast('Order placed');go('order',o.id)}
function orderText(o){var t='Coffeebreak order '+o.id+'\nVenue: '+o.venueName+'\nType: '+MODES[o.mode]+(o.table?' (table '+o.table+')':'')+'\n';
 o.items.forEach(function(l){t+=l.qty+' x '+l.name+' '+money(l.price*l.qty)+'\n'});
 t+=(o.fee?'Delivery fee '+money(o.fee)+'\n':'')+'Total '+money(o.total)+'\nPayment: '+(o.pay==='payid'?'PayID '+PAYID+' (reference '+o.id+')':'Pay in person')+'\nName: '+o.name+'\nMobile: '+o.phone+(o.addr?'\nDeliver to: '+o.addr:'')+(o.note?'\nNotes: '+o.note:'')+(o.age18?'\nIncludes alcohol: customer confirmed 18+, check ID':'');return t}
function steps(o){var list=o.mode==='delivery'?STEPS:['placed','accepted','preparing','ready','delivered'];var i=list.indexOf(o.status);
 if(o.status==='cancelled')return '<div class="note red">This order was cancelled.</div>';
 return '<div class="steps">'+list.map(function(s,j){return '<div class="'+(j<i?'done':j===i?'cur':'')+'">'+(s==='delivered'?(o.mode==='delivery'?'Delivered':'Collected'):LABEL[s])+'</div>'}).join('')+'</div>'}
views.order=function(id){var o=order(id);if(!o)return '<p>Order not found on this device.</p>';var v=venue(o.venueId)||{};
 var h='<button class="btn alt sm" data-go="track">All my orders</button><h2>Order '+esc(o.id)+'</h2><div class="card"><div class="row sp"><b>'+esc(o.venueName)+'</b><span class="badge">'+MODES[o.mode]+'</span></div>'+steps(o)+'<div class="stat" id="ostat">'+(o.status==='delivered'?(o.mode==='delivery'?'Delivered':'Collected'):LABEL[o.status])+'</div><div class="muted">Placed '+tm(o.created)+'. This screen updates when the venue or driver changes the status on this device, or when you import an update file.</div>';
 o.items.forEach(function(l){h+='<div class="item"><span>'+l.qty+' x '+esc(l.name)+'</span><span>'+money(l.price*l.qty)+'</span></div>'});
 h+='<div class="item"><b>Total</b><b>'+money(o.total)+'</b></div>';
 if(o.pay==='payid')h+='<div class="pay"><b>Pay by PayID (Teachers Mutual Bank): '+PAYID+'</b><br>Amount: '+money(o.total)+'<br>Reference: '+esc(o.id)+'<br><button class="btn sm alt" data-copy="'+PAYID+'">Copy PayID</button></div>';
 else h+='<div class="pay"><b>Pay in person</b><br>Pay '+money(o.total)+' '+(o.mode==='delivery'?'to the driver or venue on delivery':'at the counter')+'.</div>';
 h+='<h3>Send your order to the venue</h3>';
 if(v.sample)h+='<div class="note">This is a sample venue, so there is no real email or mobile to send to. Real venues show working buttons here.</div>';
 var body=encodeURIComponent(orderText(o));
 h+='<div class="row">'+(v.email?'<a class="btn" href="mailto:'+esc(v.email)+'?subject='+encodeURIComponent('Order '+o.id)+'&body='+body.replace(/%0A/g,'%0D%0A')+'">Email order</a>':'<button class="btn" disabled>Email order</button>')+
 (v.phone?'<a class="btn" href="sms:'+esc(v.phone.replace(/[^0-9+]/g,''))+'?&body='+body+'">SMS order</a>':'<button class="btn" disabled>SMS order</button>')+'<button class="btn alt" data-copy-order="'+esc(o.id)+'">Copy order</button></div>';
 if(o.status==='placed')h+='<p><button class="btn warn sm" data-cancel="'+esc(o.id)+'">Cancel order</button></p>';
 return h+'</div>'};
views.track=function(){var h='<h2>My orders</h2>';var list=D.myOrders.map(order).filter(Boolean);
 if(!list.length)return h+'<p>No orders yet on this device.</p><button class="btn" data-go="home">Start an order</button>';
 list.forEach(function(o){h+='<div class="card" style="margin-bottom:10px"><div class="row sp"><b>'+esc(o.id)+'</b><span>'+money(o.total)+'</span></div><div class="muted">'+esc(o.venueName)+' · '+MODES[o.mode]+' · '+tm(o.created)+'</div>'+steps(o)+'<button class="btn sm" data-go="order" data-arg="'+esc(o.id)+'">Track</button></div>'});return h};

/* ---------- venue / manage ---------- */
var mtab='queue';
function abnOk(a){a=String(a).replace(/\s/g,'');if(!/^\d{11}$/.test(a))return false;var w=[10,1,3,5,7,9,11,13,15,17,19],s=0;for(var i=0;i<11;i++){var d=+a[i];if(i===0)d-=1;s+=d*w[i]}return s%89===0}
views.manage=function(){var v=venue(D.myVenue);
 var h='<h2>Venue manager</h2><div class="row" style="margin-bottom:10px"><label for="pickV" style="margin:0">Managing</label><select id="pickV" style="max-width:340px"><option value="">Choose a venue</option>'+D.venues.map(function(x){return '<option value="'+esc(x.id)+'" '+(x.id===D.myVenue?'selected':'')+'>'+esc(x.name)+'</option>'}).join('')+'</select><button class="btn y sm" data-go="signup">Sign up a new venue</button></div>';
 if(!v)return h+'<div class="card"><p>Choose a venue above to see its orders, or sign up your servo or pub. Signing up is free.</p></div>'+dataBox();
 h+='<div class="row" style="margin-bottom:10px">'+['queue','menu','sales','details'].map(function(t){return '<button class="btn sm '+(mtab===t?'':'alt')+'" data-mtab="'+t+'">'+{queue:'Live orders',menu:'Menu editor',sales:'Daily sales',details:'Venue details'}[t]+'</button>'}).join('')+'</div>';
 if(v.sample)h+='<div class="note">This is a sample venue for trying the app. Sign up your own venue to take real orders.</div>';
 h+=({queue:queueView,menu:menuView,sales:salesView,details:detailsView})[mtab](v);
 return h+dataBox()};
after.manage=function(){var p=$('#pickV');if(p)p.onchange=function(){D.myVenue=p.value||null;save();render()};
 var s=$('#saveDet');if(s)s.onclick=function(){var v=venue(D.myVenue);var r=readVenueForm(v);if(r)toast('Details saved')};
 var a=$('#addItem');if(a)a.onclick=function(){var v=venue(D.myVenue),n=val('niName'),pr=parseFloat(val('niPrice'));if(!n||!(pr>=0))return toast('Add a name and price');v.menu.push({id:uid('i'),name:n,price:pr.toFixed(2),cat:val('niCat')||'Other',alcohol:$('#niAlc').checked,available:true});save();toast('Item added');render()};
 [].forEach.call(document.querySelectorAll('[data-edit]'),function(inp){inp.onchange=function(){var v=venue(D.myVenue),m=find(v,inp.getAttribute('data-edit')),f=inp.getAttribute('data-f');if(!m)return;
  if(f==='price'){var p=parseFloat(inp.value);if(!(p>=0))return toast('Price must be a number');m.price=p.toFixed(2)}else if(f==='alcohol'||f==='available')m[f]=inp.checked;else m[f]=inp.value.trim();save();toast('Saved')}});
 var im=$('#impFile');if(im)im.onchange=importFile};
function queueView(v){var list=D.orders.filter(function(o){return o.venueId===v.id&&o.status!=='delivered'&&o.status!=='cancelled'});
 var h='<h3>Live order queue ('+list.length+')</h3>';if(!list.length)h+='<div class="card">No open orders right now. New orders placed on this device show here straight away. Orders sent by email or SMS can be added with Import below.</div>';
 h+='<div class="grid">';
 list.forEach(function(o){h+='<div class="card" data-qorder="'+esc(o.id)+'"><div class="row sp"><b>'+esc(o.id)+'</b><span class="badge">'+MODES[o.mode]+'</span></div><div class="muted">'+tm(o.created)+' · '+esc(o.name)+' · '+esc(o.phone)+(o.table?' · Table '+esc(o.table):'')+'</div>'+(o.addr?'<div class="muted">Deliver to: '+esc(o.addr)+'</div>':'');
  o.items.forEach(function(l){h+='<div class="item"><span>'+l.qty+' x '+esc(l.name)+(l.alcohol?' <span class="badge">18+</span>':'')+'</span><span>'+money(l.price*l.qty)+'</span></div>'});
  h+='<div class="item"><b>'+money(o.total)+'</b><span>'+(o.pay==='payid'?'PayID':'In person')+(o.paid?' · paid':' · unpaid')+'</span></div>'+(o.note?'<div class="note">'+esc(o.note)+'</div>':'')+(o.age18?'<div class="note red">Alcohol: check photo ID, 18+ only.</div>':'');
  h+='<div class="stat" style="font-size:18px">'+LABEL[o.status]+(o.driver?' · driver '+esc(o.driver):'')+'</div><div class="row">';
  var nx={placed:['accepted','Accept'],accepted:['preparing','Preparing'],preparing:['ready','Ready']}[o.status];
  if(nx)h+='<button class="btn go" data-adv="'+esc(o.id)+'" data-to="'+nx[0]+'">'+nx[1]+'</button>';
  if(o.status==='ready'||o.status==='out')h+='<button class="btn go" data-adv="'+esc(o.id)+'" data-to="delivered">'+(o.mode==='delivery'?'Delivered':'Collected')+'</button>';
  if(o.status==='ready'&&o.mode==='delivery')h+='<span class="muted">Waiting for a driver, or deliver it yourself.</span>';
  h+='<button class="btn alt sm" data-paid="'+esc(o.id)+'">'+(o.paid?'Mark unpaid':'Mark paid')+'</button>';
  if(o.status==='placed')h+='<button class="btn warn sm" data-cancel="'+esc(o.id)+'">Decline</button>';
  h+='</div></div>'});
 return h+'</div>'}
function menuView(v){var h='<h3>Menu editor</h3><div class="card"><table><tr><th>Item</th><th>Price</th><th>Category</th><th>18+</th><th>On</th><th></th></tr>';
 v.menu.forEach(function(m){h+='<tr><td><input data-edit="'+esc(m.id)+'" data-f="name" value="'+esc(m.name)+'" aria-label="Name"></td><td style="width:90px"><input data-edit="'+esc(m.id)+'" data-f="price" inputmode="decimal" value="'+esc(m.price)+'" aria-label="Price"></td><td style="width:120px"><input data-edit="'+esc(m.id)+'" data-f="cat" value="'+esc(m.cat)+'" aria-label="Category"></td><td><input type="checkbox" data-edit="'+esc(m.id)+'" data-f="alcohol" '+(m.alcohol?'checked':'')+' aria-label="Alcohol"></td><td><input type="checkbox" data-edit="'+esc(m.id)+'" data-f="available" '+(m.available!==false?'checked':'')+' aria-label="Available"></td><td><button class="btn warn sm" data-del="'+esc(m.id)+'">Delete</button></td></tr>'});
 h+='</table></div><div class="card" style="margin-top:10px"><h3>Add an item</h3><div class="row"><input id="niName" placeholder="Item name" style="flex:2;min-width:160px"><input id="niPrice" placeholder="Price" inputmode="decimal" style="flex:1;min-width:80px"><input id="niCat" placeholder="Category" style="flex:1;min-width:100px"></div><label class="chk"><input type="checkbox" id="niAlc">Alcohol (18+)</label><button class="btn" id="addItem">Add item</button></div>';
 if(v.menu.some(function(m){return m.alcohol})&&!v.licence)h+='<div class="note red">Your menu has alcohol. Add your NSW liquor licence number in Venue details. Alcohol delivery stays switched off until you do, and you must follow your licence conditions and NSW responsible service of alcohol rules.</div>';
 return h}
function salesView(v){var td=today(),list=D.orders.filter(function(o){return o.venueId===v.id&&dayOf(o.created)===td});
 var done=list.filter(function(o){return o.status==='delivered'}),live=list.filter(function(o){return o.status!=='cancelled'});
 var sum=function(a){return a.reduce(function(s,o){return s+o.total},0)};var bym={};live.forEach(function(o){bym[o.mode]=(bym[o.mode]||0)+o.total});
 var items={};live.forEach(function(o){o.items.forEach(function(l){items[l.name]=(items[l.name]||0)+l.qty})});
 var h='<h3>Daily sales summary for '+td+'</h3><div class="grid"><div class="card"><div class="muted">Orders today</div><div class="stat">'+live.length+'</div></div><div class="card"><div class="muted">Sales (not cancelled)</div><div class="stat">'+money(sum(live))+'</div></div><div class="card"><div class="muted">Completed</div><div class="stat">'+done.length+' · '+money(sum(done))+'</div></div></div>';
 h+='<div class="card" style="margin-top:10px"><h3>By order type</h3>';for(var m in bym)h+='<div class="item"><span>'+MODES[m]+'</span><span>'+money(bym[m])+'</span></div>';
 h+='<div class="item"><span>Paid by PayID</span><span>'+money(sum(live.filter(function(o){return o.pay==='payid'})))+'</span></div><div class="item"><span>Paid in person</span><span>'+money(sum(live.filter(function(o){return o.pay!=='payid'})))+'</span></div><h3 style="margin-top:10px">Top items</h3>';
 Object.keys(items).sort(function(a,b){return items[b]-items[a]}).slice(0,8).forEach(function(k){h+='<div class="item"><span>'+esc(k)+'</span><span>'+items[k]+'</span></div>'});
 return h+'<p class="row"><button class="btn" data-csv="today">Export today as CSV</button><button class="btn alt" data-csv="all">Export all orders as CSV</button></p></div>'}
function venueFormHtml(v){v=v||{};return '<label for="fName">Venue name</label><input id="fName" maxlength="80" value="'+esc(v.name)+'">'+
 '<label for="fType">Type</label><select id="fType"><option value="servo" '+(v.type==='servo'?'selected':'')+'>Servo (service station)</option><option value="pub" '+(v.type==='pub'?'selected':'')+'>Pub or hotel</option></select>'+
 '<label for="fAbn">ABN (11 digits)</label><input id="fAbn" inputmode="numeric" maxlength="14" value="'+esc(v.abn)+'">'+
 '<label for="fAddr">Street address</label><input id="fAddr" maxlength="140" value="'+esc(v.address)+'">'+
 '<label for="fHours">Opening hours</label><input id="fHours" maxlength="60" value="'+esc(v.hours)+'">'+
 '<label for="fContact">Contact person</label><input id="fContact" maxlength="60" value="'+esc(v.contact)+'">'+
 '<label for="fPhone">Mobile for SMS orders</label><input id="fPhone" type="tel" maxlength="20" value="'+esc(v.phone)+'">'+
 '<label for="fEmail">Email for orders</label><input id="fEmail" type="email" maxlength="80" value="'+esc(v.email)+'">'+
 '<label for="fLic">NSW liquor licence number (pubs, optional)</label><input id="fLic" maxlength="30" value="'+esc(v.licence)+'">'+
 '<label class="chk"><input type="checkbox" id="fDel" '+(v.delivery?'checked':'')+'>We offer delivery</label><label class="chk"><input type="checkbox" id="fDine" '+(v.dinein?'checked':'')+'>We take dine-in and table orders</label>'}
function readVenueForm(v,isNew){var n=val('fName'),abn=val('fAbn').replace(/\s/g,''),ad=val('fAddr'),ph=val('fPhone'),em=val('fEmail');
 if(n.length<2)return toast('Please add the venue name'),null;
 if(!v||!v.sample){if(!abnOk(abn))return toast('Please check the ABN, it should be a valid 11 digit number'),null}
 if(ad.length<5)return toast('Please add the street address'),null;
 if(!ph&&!em)return toast('Please add a mobile or email so orders can reach you'),null;
 if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return toast('Please check the email'),null;
 v=v||{id:uid('v-'),sample:false,menu:[],created:Date.now()};
 v.name=n;v.type=val('fType');v.abn=abn;v.address=ad;v.hours=val('fHours');v.contact=val('fContact');v.phone=ph;v.email=em;v.licence=val('fLic');v.delivery=$('#fDel').checked;v.dinein=$('#fDine').checked;
 if(isNew)D.venues.unshift(v);save();return v}
function detailsView(v){return '<h3>Venue details</h3><div class="card">'+venueFormHtml(v)+'<p><button class="btn" id="saveDet">Save details</button> '+(v.sample?'':'<button class="btn warn sm" data-delvenue="'+esc(v.id)+'">Remove venue</button>')+'</p></div>'}
views.signup=function(){return '<button class="btn alt sm" data-go="manage">Back</button><h2>Sign up your servo or pub</h2><div class="card"><p class="muted">Free to join. Your details stay on this device and in any files you export. Customers see your venue name, address and hours. Your ABN is checked for the right format only.</p>'+venueFormHtml({type:'servo',delivery:false,dinein:false})+
 '<div class="note">If you sell alcohol you must hold a current NSW liquor licence, follow its conditions and responsible service of alcohol rules, and check ID. Alcohol delivery needs a licence that allows it, and delivery staff must follow NSW same-day delivery rules.</div><label class="chk"><input type="checkbox" id="fAgree">I am authorised to list this venue and the details are correct.</label><p><button class="btn go full" id="doSignup">Create venue</button></p></div>'};
after.signup=function(){$('#doSignup').onclick=function(){if(!$('#fAgree').checked)return toast('Please tick the box to confirm');var v=readVenueForm(null,true);if(v){D.myVenue=v.id;mtab='menu';save();toast('Venue created, now add your menu');go('manage')}}};
function dataBox(){return '<div class="card" style="margin-top:14px"><h3>Back up and share data</h3><p class="muted">Everything is saved on this device. Export a file to back up, or to share orders and menus with another device, then import it there.</p><div class="row"><button class="btn alt" data-json="1">Export JSON</button><label class="btn alt" style="margin:0">Import JSON<input type="file" id="impFile" accept=".json,application/json" class="hide"></label><button class="btn warn sm" data-reset="1">Reset to samples</button></div></div>'}

/* ---------- driver ---------- */
views.driver=function(){var h='<h2>Driver deliveries</h2><div class="card"><label for="drName">Your first name</label><div class="row"><input id="drName" maxlength="30" value="'+esc(D.driver.name)+'" style="flex:1"><button class="btn" id="drSave">Save</button></div><p class="muted">Drivers deliver as independent couriers for the venue. Alcohol can only be handed to someone 18 or over who shows photo ID and is not intoxicated, following NSW same-day delivery rules.</p></div>';
 var avail=D.orders.filter(function(o){return o.mode==='delivery'&&!o.driver&&['accepted','preparing','ready'].indexOf(o.status)>=0});
 var mine=D.orders.filter(function(o){return o.mode==='delivery'&&o.driver&&o.driver===D.driver.name&&o.status!=='delivered'&&o.status!=='cancelled'});
 function card(o,act){var v=venue(o.venueId)||{};var c='<div class="card" data-dorder="'+esc(o.id)+'"><div class="row sp"><b>'+esc(o.id)+'</b><span class="price">Fee '+money(o.fee)+'</span></div><div>From: '+esc(o.venueName)+'<div class="muted">'+esc(v.address||'')+'</div></div><div>To: '+esc(o.addr)+'</div><div class="muted">'+o.items.reduce(function(s,l){return s+l.qty},0)+' items · '+money(o.total)+' · '+(o.pay==='payid'?(o.paid?'PayID, paid':'PayID, check payment received'):'Collect payment in person')+' · Venue status: '+LABEL[o.status]+'</div>'+(o.age18?'<div class="note red">Contains alcohol: check photo ID, 18+ only.</div>':'')+'<div class="row">'+act+'</div></div>';return c}
 h+='<h3>My deliveries ('+mine.length+')</h3><div class="grid">';
 mine.forEach(function(o){var a='';if(o.status!=='out')a+='<button class="btn go" data-drv="'+esc(o.id)+'" data-to="out" '+(o.status!=='ready'?'disabled title="Wait until the venue marks it Ready"':'')+'>Picked up</button>';else a+='<button class="btn go" data-drv="'+esc(o.id)+'" data-to="delivered">Delivered</button>';a+='<button class="btn alt sm" data-drv="'+esc(o.id)+'" data-to="release">Release</button>';h+=card(o,a)});
 if(!mine.length)h+='<p class="muted">No deliveries taken yet.</p>';
 h+='</div><h3>Available deliveries ('+avail.length+')</h3><div class="grid">';
 avail.forEach(function(o){h+=card(o,'<button class="btn" data-drv="'+esc(o.id)+'" data-to="take">Take this delivery</button>')});
 if(!avail.length)h+='<p class="muted">No deliveries waiting. Delivery orders appear here once a venue accepts them.</p>';
 return h+'</div>'};
after.driver=function(){$('#drSave').onclick=function(){D.driver.name=val('drName');save();toast('Saved');render()}};

/* ---------- about ---------- */
views.about=function(){return '<h2>About</h2><div class="card"><p><b>Coffeebreak Servo &amp; Pub Orders</b> lets people order from local servos and pubs for pickup, delivery, dine-in table orders or paying at the counter, in person or online. Venues manage their menu and live orders, and drivers pick up deliveries.</p><p>It runs in your browser with no account and no paid services. Data is kept on your device. Orders reach a venue by email or SMS from your own phone, and data can be moved between devices with JSON export and import.</p><div class="note">The venues and menus marked Sample are example listings only. They are not real businesses and no brand shown is a partner of Coffeebreak. Real venues appear once they sign up.</div><div class="note red">Responsible service of alcohol: alcohol is only sold to people 18 or over. Alcohol delivery needs a NSW liquor licence held by the venue that allows delivery, and ID is checked on handover.</div><p>Payments: Pay by PayID (Teachers Mutual Bank): '+PAYID+', or pay in person.</p><p>Problems: tap the ? button to report a problem.</p><p>More Coffeebreak apps: <a href="https://coffeebreaks.itch.io" target="_blank" rel="noopener">coffeebreaks.itch.io</a></p><p class="muted">© Karen O\'Brien (Coffeebreak). Karen O\'Brien keeps all rights to this app, its design, name and logo. You may not copy it or make your own version. Any third-party brands named belong to their owners and are used only to describe items.</p></div>'};

/* ---------- actions ---------- */
function setStatus(o,s){o.status=s;o.history.push({s:s,t:Date.now()});save()}
function csv(rows){return rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);if(/^[=+\-@]/.test(c))c="'"+c;return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(',')}).join('\r\n')}
function download(name,text,type){try{var b=new Blob([text],{type:type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500);toast('Saved '+name)}catch(e){toast('Download not available here')}}
function importFile(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var j=JSON.parse(r.result);if(!j||!Array.isArray(j.venues)||!Array.isArray(j.orders))throw 0;
 j.venues.forEach(function(v){if(!v||!v.id||!Array.isArray(v.menu))return;var i=D.venues.findIndex(function(x){return x.id===v.id});if(i>=0)D.venues[i]=v;else D.venues.push(v)});
 j.orders.forEach(function(o){if(!o||!o.id||!Array.isArray(o.items))return;var i=D.orders.findIndex(function(x){return x.id===o.id});if(i>=0){if((o.history||[]).length>=(D.orders[i].history||[]).length)D.orders[i]=o}else D.orders.push(o)});
 D.orders.sort(function(a,b){return b.created-a.created});save();toast('Imported');render()}catch(x){toast('That file is not a Coffeebreak orders file')}};r.readAsText(f)}
document.addEventListener('click',function(e){var t=e.target.closest('[data-go],[data-venue],[data-add],[data-dec],[data-filter],[data-adv],[data-cancel],[data-paid],[data-mtab],[data-del],[data-delvenue],[data-csv],[data-json],[data-reset],[data-drv],[data-copy],[data-copy-order]');if(!t)return;
 var a=function(n){return t.getAttribute(n)};
 if(a('data-go')!=null){if(route.name==='cart')keep();return go(a('data-go'),a('data-arg'))}
 if(a('data-venue'))return go('venue',a('data-venue'));
 if(a('data-filter')){filter=a('data-filter');return render()}
 if(a('data-add')){var vid=a('data-v');if(D.cart.venueId&&D.cart.venueId!==vid){if(!confirm('Your cart has items from another venue. Start a new cart?'))return;D.cart={venueId:null,items:{}}}
  D.cart.venueId=vid;D.cart.items[a('data-add')]=(D.cart.items[a('data-add')]||0)+1;save();if(route.name==='cart')keep();return render()}
 if(a('data-dec')){var k=a('data-dec');if(D.cart.items[k]){D.cart.items[k]--;if(!D.cart.items[k])delete D.cart.items[k]}if(!Object.keys(D.cart.items).length)D.cart.venueId=null;save();if(route.name==='cart')keep();return render()}
 if(a('data-adv')){var o=order(a('data-adv'));if(o){setStatus(o,a('data-to'));toast('Order '+o.id+': '+LABEL[o.status])}return render()}
 if(a('data-cancel')){var o2=order(a('data-cancel'));if(o2&&o2.status==='placed'&&confirm('Cancel order '+o2.id+'?')){setStatus(o2,'cancelled')}return render()}
 if(a('data-paid')){var o3=order(a('data-paid'));if(o3){o3.paid=!o3.paid;save()}return render()}
 if(a('data-mtab')){mtab=a('data-mtab');return render()}
 if(a('data-del')){var v=venue(D.myVenue);if(v&&confirm('Delete this item from the menu?')){v.menu=v.menu.filter(function(m){return m.id!==a('data-del')});save()}return render()}
 if(a('data-delvenue')){if(confirm('Remove this venue from this device? Its orders stay in your exports.')){D.venues=D.venues.filter(function(x){return x.id!==a('data-delvenue')});D.myVenue=null;save()}return render()}
 if(a('data-csv')){var vv=venue(D.myVenue),td=today();var list=D.orders.filter(function(o){return o.venueId===vv.id&&(a('data-csv')==='all'||dayOf(o.created)===td)});
  var rows=[['Order ID','Date','Time','Venue','Type','Table','Customer','Mobile','Address','Items','Subtotal','Delivery fee','Total','Payment','Paid','Status','Driver','Notes']];
  list.forEach(function(o){rows.push([o.id,dayOf(o.created),tm(o.created),o.venueName,MODES[o.mode],o.table,o.name,o.phone,o.addr,o.items.map(function(l){return l.qty+' x '+l.name}).join('; '),o.subtotal.toFixed(2),o.fee.toFixed(2),o.total.toFixed(2),o.pay==='payid'?'PayID':'In person',o.paid?'Yes':'No',LABEL[o.status],o.driver,o.note])});
  return download('coffeebreak-orders-'+(a('data-csv')==='all'?'all':td)+'.csv',csv(rows),'text/csv')}
 if(a('data-json'))return download('coffeebreak-servo-pub-data-'+today()+'.json',JSON.stringify({app:'Coffeebreak Servo & Pub Orders',exported:new Date().toISOString(),venues:D.venues,orders:D.orders},null,1),'application/json');
 if(a('data-reset')){if(confirm('Reset all venues, menus and orders on this device back to the samples?')){try{localStorage.removeItem(KEY)}catch(x){}mem={};load();save();toast('Reset done')}return render()}
 if(a('data-drv')){var od=order(a('data-drv')),to=a('data-to');if(!od)return;
  if(to==='take'){if(!D.driver.name)return toast('Please add your first name first');od.driver=D.driver.name;od.history.push({s:'driver '+D.driver.name,t:Date.now()});save();toast('Delivery taken')}
  else if(to==='release'){od.driver='';if(od.status==='out')od.status='ready';save()}
  else{setStatus(od,to);toast(od.id+': '+LABEL[to])}return render()}
 if(a('data-copy')!=null||a('data-copy-order')){var txt=a('data-copy')||orderText(order(a('data-copy-order')));try{navigator.clipboard.writeText(txt).then(function(){toast('Copied')},function(){prompt('Copy this',txt)})}catch(x){prompt('Copy this',txt)}}
});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.hasAttribute&&e.target.hasAttribute('data-venue'))go('venue',e.target.getAttribute('data-venue'))});
window.addEventListener('storage',function(e){if(e.key===KEY){load();if(['manage','order','track','driver'].indexOf(route.name)>=0)render()}});

load();save();
var h=(location.hash||'').slice(1).split('/');if(views[h[0]])route={name:h[0],arg:h[1]||null};
render();
try{if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(function(){})}catch(e){}
window.__cbsp={data:function(){return D}};
})();
