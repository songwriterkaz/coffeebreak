// Coffeebreak LIVE checkout: PayPal standard cart (live paypal.com, no API keys) + PayID bank transfer.
(function(){
var PAYPAL_URL='https://www.paypal.com/cgi-bin/webscr',BUSINESS='songwriterkaz@gmail.com',PAYID='darkokaz@gmx.com',PAYID_NAME='';
var SOON='Price coming soon';
function r2(n){return Math.round(n*100)/100}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function orderNo(){return 'CB'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*90+10)}
function base(){return location.href.split('#')[0].split('?')[0]}
// items: [{name,amount,qty}] ; returns form element (not submitted)
function buildForm(o){var f=document.createElement('form');f.method='post';f.action=PAYPAL_URL;f.target='_blank';
 function add(k,v){var i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;f.appendChild(i)}
 add('cmd','_cart');add('upload','1');add('business',BUSINESS);add('currency_code',o.currency||'AUD');add('charset','utf-8');
 add('invoice',o.orderNo);add('custom',o.orderNo);
 o.items.forEach(function(it,i){var n=i+1;add('item_name_'+n,String(it.name).slice(0,127));add('amount_'+n,(+it.amount).toFixed(2));add('quantity_'+n,String(it.qty||1));if(i===0&&o.shipping)add('shipping_'+n,(+o.shipping).toFixed(2))});
 add('return',base()+'?cbpaid='+o.orderNo+'#paid');add('cancel_return',base()+'?cbcancel='+o.orderNo+'#cancel');add('rm','1');
 if(o.email)add('email',o.email);return f}
function total(items,ship){return r2(items.reduce(function(a,it){return a+it.amount*(it.qty||1)},0)+(+ship||0))}
// opts: {store,currency,getItems(),shipping(),validate(),body(orderNo,methodLine),subject(orderNo),email(),onDone(),orderEmail}
function mount(el,opts){if(typeof el==='string')el=document.getElementById(el);if(!el)return;
 var cur=opts.currency||'AUD';
 el.innerHTML='<div class="cbpay" style="margin:10px 0"><button type="button" class="cbpay-pp" style="background:#ffc439;color:#111;border:0;border-radius:20px;padding:10px 18px;font-weight:700;cursor:pointer;margin:4px">Pay with PayPal</button> <button type="button" class="cbpay-id" style="background:#d4a017;color:#fff;border:0;border-radius:20px;padding:10px 18px;font-weight:700;cursor:pointer;margin:4px">Pay by PayID (bank transfer)</button><div class="cbpay-msg" style="font-size:13px;margin-top:6px"></div><div class="cbpay-panel" hidden style="background:#fff;border:2px solid #d4a017;border-radius:12px;padding:12px;margin-top:8px"></div></div>';
 var msg=el.querySelector('.cbpay-msg'),panel=el.querySelector('.cbpay-panel');
 function ready(){var it=opts.getItems();if(!it||!it.length){msg.textContent='Add a priced item first.';return null}
  if(it.some(function(x){return x.amount==null||!(x.amount>0)})){msg.textContent='Some items are "'+SOON+'" – remove them to pay.';return null}
  if(opts.validate&&!opts.validate())return null;return it}
 function send(no,line){CBOrder.mail(opts.subject(no),line+'\n\n'+opts.body(no),opts.orderEmail||CBOrder.EMAIL)}
 el.querySelector('.cbpay-pp').onclick=function(){var it=ready();if(!it)return;var no=orderNo(),sh=opts.shipping?+opts.shipping()||0:0;
  var line='PAYMENT: PayPal (live) – order '+no+'. Check PayPal shows the payment before ordering from supplier.';
  try{localStorage.setItem('cbPending:'+no,JSON.stringify({subject:opts.subject(no),body:line+'\n\n'+opts.body(no)}))}catch(e){}
  var f=buildForm({items:it,shipping:sh,currency:cur,orderNo:no,email:opts.email&&opts.email()});document.body.appendChild(f);f.submit();
  msg.innerHTML='PayPal opened in a new tab (order <b>'+esc(no)+'</b>). After paying, your order details email opens so Karen can ship it.';
  setTimeout(function(){send(no,line);opts.onDone&&opts.onDone()},800)};
 el.querySelector('.cbpay-id').onclick=function(){var it=ready();if(!it)return;var no=orderNo(),t=total(it,opts.shipping?opts.shipping():0);
  panel.hidden=false;panel.innerHTML='<b>Pay by PayID (bank transfer)</b><br>PayID: <b>'+PAYID+'</b><br>Account name: '+(PAYID_NAME?esc(PAYID_NAME):'&nbsp;')+'<br>Amount: <b>$'+t.toFixed(2)+' '+cur+'</b><br>Reference: <b>'+no+'</b><br><i>Use your order number as the reference.</i><br><button type="button" class="cbpay-sent" style="margin-top:8px">I\'ve paid – send my order</button>';
  panel.querySelector('.cbpay-sent').onclick=function(){send(no,'Paid by PayID – check bank before ordering from supplier.\nPayID: '+PAYID+' · Reference: '+no+' · Amount: $'+t.toFixed(2)+' '+cur);msg.textContent='Thanks! Order '+no+' sent. Karen ships once the transfer arrives.';opts.onDone&&opts.onDone()}}
}
// returning from PayPal
try{var q=new URLSearchParams(location.search);if(q.get('cbpaid')){document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('div');b.style.cssText='background:#d4f7dc;color:#145a2a;padding:10px;text-align:center;font-weight:700';b.textContent='Thank you! PayPal payment received for order '+q.get('cbpaid')+'.';document.body.insertBefore(b,document.body.firstChild)})}}catch(e){}
window.CBPay={mount:mount,buildForm:buildForm,SOON:SOON,PAYPAL_URL:PAYPAL_URL,BUSINESS:BUSINESS,PAYID:PAYID,label:function(n,cur){return n==null?SOON:'$'+(+n).toFixed(2)+' '+(cur||'AUD')}};
})();
