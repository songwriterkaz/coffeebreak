/* Coffeebreak full pink cart (options, qty, AU shipping, details form, order email). Free, no server. Saves in localStorage. */
(function(){
var PAYID="darkokaz@gmx.com",MAIL="songwriterkaz@gmail.com";
var SHIP=+((document.currentScript&&document.currentScript.dataset.ship)||10),FREE=+((document.currentScript&&document.currentScript.dataset.free)||0);
var KEY="cbcart:"+location.pathname, PREFIX=(document.currentScript&&document.currentScript.dataset.prefix)||"CB";
var cart=[];try{cart=JSON.parse(localStorage.getItem(KEY))||[]}catch(e){cart=[]}
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}render()}
function m(n){return "$"+Number(n).toFixed(2)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var css=document.createElement("style");css.textContent=
"#cbc-btn{position:fixed;right:16px;bottom:16px;z-index:9998;background:#e7458f;color:#fff;border:0;border-radius:999px;padding:12px 18px;font:700 16px system-ui;box-shadow:0 4px 14px #e7458f66;cursor:pointer}"+
"#cbc-btn b{background:#fff;color:#e7458f;border-radius:999px;padding:1px 8px;margin-left:6px}"+
"#cbc-ov{position:fixed;inset:0;background:#0005;z-index:9998;display:none}"+
"#cbc-d{position:fixed;top:0;right:0;height:100%;width:min(380px,92vw);background:#fff0f6;z-index:9999;transform:translateX(105%);transition:transform .25s;box-shadow:-4px 0 18px #0003;display:flex;flex-direction:column;font:15px system-ui;color:#5a1236}"+
"#cbc-d.on{transform:none}#cbc-d header{display:flex;align-items:center;gap:8px;padding:12px;background:#e7458f;color:#fff}"+
"#cbc-d header span{flex:1;font-weight:800;font-size:18px}#cbc-d .cb-logo{width:34px;height:34px;border-radius:50%;background:#fff;color:#e7458f;font-weight:900;display:flex;align-items:center;justify-content:center}"+
"#cbc-d .x{background:none;border:0;color:#fff;font-size:24px;cursor:pointer}#cbc-items{flex:1;overflow:auto;padding:10px}"+
".cbc-i{background:#fff;border-radius:12px;padding:10px;margin-bottom:8px;border:1px solid #f7c3da}.cbc-i .r{display:flex;align-items:center;gap:6px;margin-top:6px}"+
".cbc-i .r button{background:#ffd1e6;border:0;border-radius:8px;width:30px;height:30px;font-weight:800;color:#b0145a;cursor:pointer}.cbc-i .r .rm{width:auto;padding:0 10px;margin-left:auto}"+
"#cbc-f{padding:12px;border-top:2px solid #f7c3da;background:#fff}#cbc-f .t{font-weight:800;font-size:18px;margin-bottom:8px}"+
".cbc-b{display:block;width:100%;box-sizing:border-box;text-align:center;background:#e7458f;color:#fff;border:0;border-radius:12px;padding:11px;font-weight:800;text-decoration:none;margin:6px 0;cursor:pointer;font-size:15px}.cbc-b.alt{background:#ffd1e6;color:#b0145a}"+
"#cbc-co{font-size:14px;line-height:1.45}#cbc-co .on{font-weight:900;color:#b0145a}.cbc-add{background:#e7458f;color:#fff;border:0;border-radius:10px;padding:9px 14px;font-weight:800;cursor:pointer;margin:4px}"+
".cbc-note{font-size:11px;color:#8a3a60;margin-top:6px}";
document.head.appendChild(css);
var btn=document.createElement("button");btn.id="cbc-btn";btn.type="button";
var ov=document.createElement("div");ov.id="cbc-ov";
var d=document.createElement("aside");d.id="cbc-d";d.setAttribute("aria-label","Cart");
d.innerHTML='<header><div class="cb-logo">CB</div><span>Coffeebreak Cart</span><button class="x" type="button" aria-label="Close">×</button></header><div id="cbc-items"></div><div id="cbc-f"></div>';
function open(){d.classList.add("on");ov.style.display="block"}function close(){d.classList.remove("on");ov.style.display="none"}
btn.onclick=open;ov.onclick=close;d.querySelector(".x").onclick=close;
function total(){return cart.reduce(function(s,i){return s+i.price*i.qty},0)}
function ship(){return !cart.length?0:(FREE&&total()>=FREE?0:SHIP)}
function count(){return cart.reduce(function(s,i){return s+i.qty},0)}
function render(co){
 btn.innerHTML='Cart <b>'+count()+'</b>';
 var L=d.querySelector("#cbc-items"),F=d.querySelector("#cbc-f");
 if(!cart.length){L.innerHTML='<p style="text-align:center;margin-top:30px">Your cart is empty.</p>';F.innerHTML='<div class="t">Total $0.00 AUD</div>';return}
 L.innerHTML=cart.map(function(i,k){return '<div class="cbc-i"><b>'+esc(i.name)+'</b>'+(i.opt?'<div>'+esc(i.opt)+'</div>':'')+'<div>'+m(i.price)+' AUD each</div><div class="r"><button data-k="'+k+'" data-a="-1" aria-label="Less">−</button><span class="q">'+i.qty+'</span><button data-k="'+k+'" data-a="1" aria-label="More">+</button><button class="rm" data-k="'+k+'" data-a="rm">Remove</button></div></div>'}).join("");
 F.innerHTML='<div>Items '+m(total())+'<br>Shipping (Australia) '+m(ship())+'</div><div class="t">Total '+m(total()+ship())+' AUD</div><button class="cbc-b" id="cbc-go" type="button">Checkout</button><div id="cbc-co"></div>'+(cart.some(function(i){return i.itch})?'<div class="cbc-note">Card payments happen on itch.io. This shop never sees your card.</div>':'');
 F.querySelector("#cbc-go").onclick=checkout;
}
d.addEventListener("click",function(e){var b=e.target.closest("button[data-a]");if(!b)return;var k=+b.dataset.k,a=b.dataset.a;
 if(a=="rm")cart.splice(k,1);else{cart[k].qty+=+a;if(cart[k].qty<1)cart.splice(k,1)}save()});
function checkout(){
 var co=d.querySelector("#cbc-co");
 co.innerHTML='<form id="cbc-form"><input name="name" placeholder="Full name" required><input name="email" type="email" placeholder="Email" required><input name="phone" placeholder="Phone" required><textarea name="address" placeholder="Delivery address in Australia" required></textarea><button class="cbc-b" type="submit">Place order</button></form>';
 co.querySelectorAll("input,textarea").forEach(function(x){x.style.cssText="display:block;width:100%;box-sizing:border-box;margin:4px 0;padding:8px;border:1px solid #f7c3da;border-radius:8px;font:14px system-ui"});
 co.querySelector("form").onsubmit=function(e){e.preventDefault();var f=e.target;
  var n=PREFIX+"-"+Date.now().toString(36).toUpperCase().slice(-6)+Math.floor(Math.random()*90+10),t=m(total()+ship())+" AUD";
  var lines=cart.map(function(i){return i.qty+" x "+i.name+(i.opt?" ("+i.opt+")":"")+" | product "+i.id+(i.code?" | supplier code "+i.code:"")+" @ "+m(i.price)+" = "+m(i.price*i.qty)});
  var body="Order "+n+"\n\n"+lines.join("\n")+"\nShipping (Australia): "+m(ship())+"\nTotal: "+t+"\n\nName: "+f.name.value+"\nEmail: "+f.email.value+"\nPhone: "+f.phone.value+"\nAddress: "+f.address.value+"\nPaid by: PayID (Teachers Mutual Bank) "+PAYID+", reference "+n+"\nStore: "+location.href+"\n";
  var href="mailto:"+MAIL+"?subject="+encodeURIComponent("Coffeebreak order "+n)+"&body="+encodeURIComponent(body);
  try{fetch("https://formsubmit.co/ajax/"+MAIL,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:"Coffeebreak order "+n,order:n,_replyto:f.email.value,message:body})}).catch(function(){})}catch(x){}
  co.innerHTML='<p>Order number <span class="on">'+n+'</span></p><p>Total to pay: <b>'+t+'</b><br>Pay by PayID (Teachers Mutual Bank): <b>'+PAYID+'</b> and put <b>'+n+'</b> as the reference.</p><p>Your order has been sent. Karen ships once the transfer arrives.</p><a class="cbc-b alt" href="'+href+'">Also email my order</a>';
  try{localStorage.setItem(KEY+":last",n)}catch(x){}cart=[];try{localStorage.setItem(KEY,"[]")}catch(x){}btn.innerHTML='Cart <b>0</b>';
 }
}
window.CBCart={add:function(p){var o=p.opt||"",f=cart.filter(function(i){return i.id==p.id&&(i.opt||"")==o})[0];if(f)f.qty++;else cart.push({id:p.id,name:p.name,price:+p.price,code:p.code||"",opt:o,itch:p.itch||"",qty:1});save();open()},open:open,clear:function(){cart=[];save()}};
function boot(){document.body.appendChild(ov);document.body.appendChild(d);document.body.appendChild(btn);render()}
if(document.body)boot();else document.addEventListener("DOMContentLoaded",boot);
})();
/* Auto "Add to cart": any element with data-cb-id, data-cb-name, data-cb-price, optional data-cb-options="A|B" and data-cb-code */
(function(){function bind(){document.querySelectorAll("[data-cb-id]:not([data-cb-done])").forEach(function(el){el.setAttribute("data-cb-done","1");
 var w=document.createElement("div");w.style.margin="8px 0";var sel=null,ops=(el.dataset.cbOptions||"").split("|").filter(Boolean);
 if(ops.length){sel=document.createElement("select");sel.setAttribute("aria-label","Option");sel.style.cssText="padding:8px;border-radius:8px;border:1px solid #f7c3da;margin:4px";ops.forEach(function(o){var x=document.createElement("option");x.textContent=o;sel.appendChild(x)});w.appendChild(sel)}
 var b=document.createElement("button");b.type="button";b.className="cbc-add";b.textContent="Add to cart · $"+(+el.dataset.cbPrice).toFixed(2);
 b.onclick=function(){CBCart.add({id:el.dataset.cbId,name:el.dataset.cbName,price:el.dataset.cbPrice,code:el.dataset.cbCode||"",opt:sel?sel.value:""})};w.appendChild(b);el.appendChild(w)})}
 if(document.readyState!="loading")bind();else document.addEventListener("DOMContentLoaded",bind)})();
