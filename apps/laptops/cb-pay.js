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
 el.innerHTML='<div class="cbpay" style="margin:10px 0"><button type="button" class="cbpay-pp" style="background:#ffc439;color:#111;border:0;border-radius:20px;padding:10px 18px;font-weight:700;cursor:pointer;margin:4px">Pay with PayPal</button> <button type="button" class="cbpay-id" style="background:#ff5fa2;color:#fff;border:0;border-radius:20px;padding:10px 18px;font-weight:700;cursor:pointer;margin:4px">Pay by PayID (bank transfer)</button><div class="cbpay-msg" style="font-size:13px;margin-top:6px"></div><div class="cbpay-panel" hidden style="background:#fff;border:2px solid #ff5fa2;border-radius:12px;padding:12px;margin-top:8px"></div></div>';
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
window.CB_INTL_CFG={"mode": "quote", "nz": 0, "row": 0, "why": "laptops with batteries need courier shipping"};
// ==CB-INTL== Coffeebreak international checkout (Australia + overseas). Appended to cb-pay.js.
(function(){
var CFG=window.CB_INTL_CFG||{mode:'ship',nz:20,row:35};
var FX={USD:0.69,GBP:0.52,EUR:0.62,NZD:1.23},SYM={USD:'US$',GBP:'£',EUR:'€',NZD:'NZ$'};
var C='Australia|New Zealand|United States|United Kingdom|Canada|Ireland|Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cambodia|Cameroon|Cape Verde|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Cook Islands|Costa Rica|Croatia|Cuba|Cyprus|Czech Republic|Denmark|Djibouti|Dominica|Dominican Republic|DR Congo|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|French Polynesia|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hong Kong|Hungary|Iceland|India|Indonesia|Iran|Iraq|Israel|Italy|Ivory Coast|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Macau|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Caledonia|Nicaragua|Niger|Nigeria|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|Sao Tome and Principe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Turkey|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe|Other'.split('|');
function $q(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function country(){var s=$q('#cbCountry');return s?s.value:'Australia'}
function zone(c){c=c||country();return c==='Australia'?'AU':c==='New Zealand'?'NZ':'ROW'}
function extra(){var z=zone();return z==='AU'?0:z==='NZ'?(+CFG.nz||0):(+CFG.row||0)}
var ITEMS=window.CB_INTL_ITEMS||{},curGet=null;
// per-item flags (no supplier info): L = Australia only, A = payment link for all overseas, N = normal for NZ, payment link elsewhere
function flagged(){var out=[],it=[];try{it=(curGet&&curGet())||[]}catch(e){}var keys=Object.keys(ITEMS);if(!keys.length)return out;
 it.forEach(function(x){var n=String(x.name||''),best='';keys.forEach(function(k){if(k.length>best.length&&n.indexOf(k)>=0)best=k});if(best)out.push({name:n,f:ITEMS[best]})});return out}
function itemLocal(){if(zone()==='AU')return [];return flagged().filter(function(x){return x.f==='L'})}
function itemLink(){var z=zone();if(z==='AU')return [];return flagged().filter(function(x){return x.f==='A'||(x.f==='N'&&z==='ROW')})}
function blocked(){return zone()!=='AU'&&(CFG.mode==='local'||itemLocal().length>0)}
function quote(){return zone()!=='AU'&&!blocked()&&(CFG.mode==='quote'||itemLink().length>0)}
function names(l){return l.map(function(x){return x.name}).join(', ')}
function fx(a){return ['USD','GBP','EUR'].concat(zone()==='NZ'?['NZD']:[]).map(function(k){return SYM[k]+(a*FX[k]).toFixed(2)}).join(' · ')}
function val(id){var e=document.getElementById(id);return e?e.value.trim():''}
function addrLine(){var p=[val('cbRegion'),val('cbPostcode')].filter(Boolean).join(' ');return (p?p+', ':'')+country()}
var AUTXT={'AU':'Australia','NZ':'New Zealand','ROW':'International'};
function info(){return 'COUNTRY: '+country()+'\nSHIPPING ZONE: '+AUTXT[zone()]+(extra()?' (international shipping +$'+extra().toFixed(2)+' AUD added)':'')+'\nState/Region: '+(val('cbRegion')||'-')+' · Postcode/ZIP: '+(val('cbPostcode')||'-')}
function findAddr(){var a=document.getElementById('cAddr');if(a)return a;var all=document.querySelectorAll('textarea,input');for(var i=0;i<all.length;i++){var e=all[i],k=((e.id||'')+' '+(e.name||'')+' '+(e.placeholder||'')).toLowerCase();if(/addr|address/.test(k))return e}return null}
var boxes=[];
function ui(anchor){
 if(document.getElementById('cbCountry'))return;
 var w=document.createElement('div');w.id='cbIntl';w.style.cssText='margin:8px 0;padding:8px;border:1px dashed #ff5fa2;border-radius:10px;font-size:14px;color:inherit';
 w.innerHTML='<label style="display:block;font-weight:700;margin-bottom:4px">🌏 Ship to country</label><select id="cbCountry" style="width:100%;padding:6px;margin-bottom:6px">'+C.map(function(c){return '<option'+(c==='Australia'?' selected':'')+'>'+esc(c)+'</option>'}).join('')+'</select>'+
  '<input id="cbRegion" placeholder="State / Province / Region (optional)" style="width:100%;padding:6px;margin-bottom:6px;box-sizing:border-box"><input id="cbPostcode" placeholder="Postcode / ZIP (if your country uses one)" style="width:100%;padding:6px;box-sizing:border-box"><div id="cbIntlNote" style="font-size:12px;margin-top:6px"></div>';
 var addr=findAddr();
 if(addr){if(/state|postcode/i.test(addr.placeholder||''))addr.placeholder='Delivery address (street, suburb / city)';addr.parentNode.insertBefore(w,addr.nextSibling)}
 else if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(w,anchor);
 else return;
 document.getElementById('cbCountry').addEventListener('change',refresh);
 refresh();
}
function rateTxt(){return CFG.mode==='local'?'':'Shipping: Australia standard'+(CFG.nz||CFG.row?' · New Zealand +$'+(+CFG.nz).toFixed(0)+' · Rest of world +$'+(+CFG.row).toFixed(0)+' AUD':'')}
function refresh(){
 var n=document.getElementById('cbIntlNote');if(n){var z=zone();
  n.innerHTML=z==='AU'?'Australian delivery. Pay by PayPal or PayID. '+esc(rateTxt()):
   blocked()?(CFG.mode==='local'?'<b>Sorry – '+esc(CFG.why||'these items')+' can only be delivered within Australia.</b>':'<b>Sorry – '+esc(names(itemLocal()))+' can only be sent within Australia (export rules). Remove it to order from overseas.</b>'):
   quote()?'<b>Overseas order:</b> '+esc(CFG.mode==='quote'?(CFG.why||'shipping for these items is quoted per order'):'some items in your cart ('+names(itemLink())+') are sent from Australia only, so overseas shipping is quoted')+'. Send your order request and we\'ll email you a PayPal payment link/invoice with the exact shipping to '+esc(country())+'.':
   '<b>International order to '+esc(country())+'</b>: +$'+extra().toFixed(2)+' AUD shipping. Pay securely with PayPal (card or PayPal balance, any country). PayID is for Australian bank accounts only. Import duties/taxes in your country may apply.'+(CFG.note?' '+esc(CFG.note):'')}
 boxes.forEach(function(b){try{b()}catch(e){}})
}
function wrapOrder(){var O=window.CBOrder;if(!O||O.__intl)return;O.__intl=1;var t=O.text;O.text=function(o){o=o||{};try{if(o.customer){o.customer=Object.assign({},o.customer);o.customer.address=(o.customer.address||'')+(o.customer.address?', ':'')+addrLine()}}catch(e){}var s=t.call(this,o);return s.indexOf('COUNTRY: ')>=0?s:s.replace(/\n\nITEMS/,'\n'+info()+'\n\nITEMS')}}
var P=window.CBPay;if(!P||P.__intl)return;P.__intl=1;var mount0=P.mount;
P.mount=function(el,opts){
 if(typeof el==='string')el=document.getElementById(el);if(!el)return;opts=opts||{};curGet=opts.getItems||null;wrapOrder();ui(el);
 var o=Object.assign({},opts),sh0=opts.shipping,va0=opts.validate,bo0=opts.body,su0=opts.subject;
 o.shipping=function(){return (sh0?(+sh0()||0):0)+extra()};
 o.validate=function(){if(blocked()){alert(CFG.mode==='local'?'Sorry – '+(CFG.why||'these items')+' can only be delivered within Australia.':'Sorry – '+names(itemLocal())+' can only be sent within Australia. Please remove it to order from overseas.');return false}return va0?va0():true};
 o.body=function(no){var b=bo0?bo0(no):'';return b.indexOf('COUNTRY: ')>=0?b:info()+'\nShip-to region line: '+addrLine()+'\n\n'+b};
 o.subject=function(no){return (su0?su0(no):'Coffeebreak order '+no)+(zone()==='AU'?'':' ['+country()+']')};
 mount0(el,o);
 var pp=el.querySelector('.cbpay-pp'),id=el.querySelector('.cbpay-id'),msg=el.querySelector('.cbpay-msg');
 var q=document.createElement('button');q.type='button';q.className='cbpay-quote';q.textContent='Overseas order – email me a payment link';q.style.cssText='background:#6c5ce7;color:#fff;border:0;border-radius:20px;padding:10px 18px;font-weight:700;cursor:pointer;margin:4px;display:none';
 if(pp&&pp.parentNode)pp.parentNode.insertBefore(q,id?id.nextSibling:pp.nextSibling);
 q.onclick=function(){curGet=opts.getItems||curGet;var it=opts.getItems&&opts.getItems();if(!it||!it.length){msg.textContent='Add an item first.';return}if(va0&&!va0())return;var no='CBQ'+Date.now().toString(36).toUpperCase();
  var fl=itemLink();var body='OVERSEAS ORDER REQUEST (not paid yet) – reply with a PayPal payment link/invoice including shipping.\n'+(fl.length?'AU-SUPPLIER-ONLY ITEMS (supplier ships within Australia only – buy to your address and repost, quote shipping): '+names(fl)+'\n':'')+info()+'\nShip-to region line: '+addrLine()+'\n\n'+(bo0?bo0(no):it.map(function(x){return x.name+' x'+(x.qty||1)+' $'+(+x.amount||0).toFixed(2)}).join('\n'));
  window.CBOrder&&CBOrder.mail((su0?su0(no):'Coffeebreak order '+no)+' [OVERSEAS QUOTE – '+country()+']',body,opts.orderEmail||CBOrder.EMAIL);
  msg.textContent='Thanks! Request '+no+' sent. We\'ll email you a payment link with exact shipping to '+country()+'.'};
 var tot=document.createElement('div');tot.className='cbintl-total';tot.style.cssText='font-size:13px;margin:4px 0';el.insertBefore(tot,el.firstChild);
 function upd(){curGet=opts.getItems||curGet;var z=zone(),it=[];try{it=(opts.getItems&&opts.getItems())||[]}catch(e){}
  var sub=it.reduce(function(a,x){return a+(+x.amount||0)*(x.qty||1)},0),s=o.shipping(),t=Math.round((sub+s)*100)/100;
  if(pp)pp.style.display=(blocked()||quote())?'none':'';if(id)id.style.display=z==='AU'?'':'none';q.style.display=quote()?'':'none';
  tot.innerHTML=blocked()?'':(sub>0?'Total: <b>$'+t.toFixed(2)+' AUD</b>'+(s?' (incl. $'+s.toFixed(2)+' shipping)':'')+(quote()?' + shipping (quoted)':'')+' <span style="opacity:.75">≈ '+fx(t)+'</span>':'<span style="opacity:.75">Prices in AUD (A$100 ≈ '+fx(100)+')</span>')}
 upd.el=tot;boxes=boxes.filter(function(b){return !b.el||b.el.isConnected});boxes.push(upd);upd();
 if(!P.__lis){P.__lis=1;var tm;function r(){clearTimeout(tm);tm=setTimeout(refresh,80)}document.addEventListener('click',r);document.addEventListener('input',r);document.addEventListener('change',r)}
};
function boot(){wrapOrder();var a=findAddr();if(a)ui(null)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.CBIntl={country:country,zone:zone,extra:extra,info:info,FX:FX};
})();
