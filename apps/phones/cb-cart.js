/* Coffeebreak shared pink cart. Free, no server. Saves in localStorage. */
(function(){
var PAYID="darkokaz@gmx.com",MAIL="songwriterkaz@gmail.com";
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
function count(){return cart.reduce(function(s,i){return s+i.qty},0)}
function render(co){
 btn.innerHTML='Cart <b>'+count()+'</b>';
 var L=d.querySelector("#cbc-items"),F=d.querySelector("#cbc-f");
 if(!cart.length){L.innerHTML='<p style="text-align:center;margin-top:30px">Your cart is empty.</p>';F.innerHTML='<div class="t">Total $0.00 AUD</div>';return}
 L.innerHTML=cart.map(function(i,k){return '<div class="cbc-i"><b>'+esc(i.name)+'</b><div>'+m(i.price)+' AUD each</div><div class="r"><button data-k="'+k+'" data-a="-1" aria-label="Less">−</button><span class="q">'+i.qty+'</span><button data-k="'+k+'" data-a="1" aria-label="More">+</button><button class="rm" data-k="'+k+'" data-a="rm">Remove</button></div></div>'}).join("");
 F.innerHTML='<div class="t">Total '+m(total())+' AUD</div><button class="cbc-b" id="cbc-go" type="button">Checkout</button><div id="cbc-co"></div>'+(cart.some(function(i){return i.itch})?'<div class="cbc-note">Card payments happen on itch.io. This shop never sees your card.</div>':'');
 F.querySelector("#cbc-go").onclick=checkout;
}
d.addEventListener("click",function(e){var b=e.target.closest("button[data-a]");if(!b)return;var k=+b.dataset.k,a=b.dataset.a;
 if(a=="rm")cart.splice(k,1);else{cart[k].qty+=+a;if(cart[k].qty<1)cart.splice(k,1)}save()});
function checkout(){
 var n=PREFIX+"-"+Date.now().toString(36).toUpperCase().slice(-6)+Math.floor(Math.random()*90+10),t=m(total())+" AUD";
 var lines=cart.map(function(i){return i.qty+" x "+i.name+" @ "+m(i.price)+" = "+m(i.price*i.qty)});
 var body="Order "+n+"\n\n"+lines.join("\n")+"\n\nTotal: "+t+"\n\nName:\nPostal address:\nPhone or email:\nPaid by: PayID / card on itch (delete one)\n";
 var href="mailto:"+MAIL+"?subject="+encodeURIComponent("Coffeebreak order "+n)+"&body="+encodeURIComponent(body);
 var cards=cart.filter(function(i){return i.itch}).map(function(i){return '<a class="cbc-b alt" target="_blank" rel="noopener" href="'+esc(i.itch)+'">Pay by card: '+esc(i.name)+'</a>'}).join("");
 d.querySelector("#cbc-co").innerHTML='<p>Order number <span class="on">'+n+'</span></p><p>Total to pay: <b>'+t+'</b><br>Pay by PayID (Teachers Mutual Bank): <b>'+PAYID+'</b> and put <b>'+n+'</b> as the reference.</p><a class="cbc-b" id="cbc-mail" href="'+href+'">Email my order</a>'+cards;
 try{localStorage.setItem(KEY+":last",n)}catch(e){}
}
window.CBCart={add:function(p){var f=cart.filter(function(i){return i.id==p.id})[0];if(f)f.qty++;else cart.push({id:p.id,name:p.name,price:+p.price,itch:p.itch||"",qty:1});save();open()},open:open,clear:function(){cart=[];save()}};
function boot(){document.body.appendChild(ov);document.body.appendChild(d);document.body.appendChild(btn);render()}
if(document.body)boot();else document.addEventListener("DOMContentLoaded",boot);
})();
