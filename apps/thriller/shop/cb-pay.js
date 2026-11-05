/* Coffeebreak PayID checkout. Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com
   No card processing. The order is emailed to Karen, who checks her bank, then ships. */
(function(){
var PAYID='darkokaz@gmx.com',BANK='Teachers Mutual Bank',EMAIL='songwriterkaz@gmail.com';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ref(){var a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',s='CBT-';for(var i=0;i<6;i++)s+=a[Math.floor(Math.random()*a.length)];return s}
function qr(text){if(!window.qrcode)return'';var q=qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:4,margin:2})}
function copy(btn,t){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){btn.textContent='✓ Copied'},function(){btn.textContent=t})}
function mount(id,o){var el=document.getElementById(id);if(!el)return;
 el.innerHTML='<button type="button" class="cbpid-go" style="background:#7a4b2a;color:#fff;border:0;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer;margin:6px 0">Checkout with PayID</button><div class="cbpid-out"></div>';
 el.querySelector('.cbpid-go').onclick=function(){
  var items=o.getItems();if(!items.length){alert('Your cart is empty.');return}if(o.validate&&!o.validate())return;
  var no=ref(),tot=Math.round(items.reduce(function(a,i){return a+(+i.amount||0)*(i.qty||1)},0)*100)/100;
  var payText='PayID: '+PAYID+'\nAmount: AUD '+tot.toFixed(2)+'\nReference: '+no;
  var out=el.querySelector('.cbpid-out');
  out.innerHTML='<div style="background:#fff7ea;color:#2a1d14;border:2px solid #c8894a;border-radius:12px;padding:14px;margin-top:8px">'+
   '<h3 style="margin:0 0 6px">Order summary</h3><table style="width:100%;font-size:14px">'+items.map(function(i){return'<tr><td>'+esc(i.name)+(i.qty>1?' x'+i.qty:'')+'</td><td style="text-align:right">$'+((+i.amount)*(i.qty||1)).toFixed(2)+'</td></tr>'}).join('')+
   '<tr><td><b>Total (AUD, delivery included)</b></td><td style="text-align:right"><b>$'+tot.toFixed(2)+'</b></td></tr></table>'+
   '<p style="margin:10px 0 4px"><b>Pay by PayID ('+BANK+'): '+PAYID+'</b></p>'+
   '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center"><div class="cbpid-qr" style="background:#fff;padding:4px;border-radius:8px">'+qr(payText)+'</div><div>'+
   '<p>PayID: <b>'+PAYID+'</b> <button type="button" data-c="'+PAYID+'">Copy</button></p><p>Amount: <b>AUD '+tot.toFixed(2)+'</b> <button type="button" data-c="'+tot.toFixed(2)+'">Copy</button></p><p>Reference: <b class="cbpid-ref">'+no+'</b> <button type="button" data-c="'+no+'">Copy</button></p>'+
   '<p style="font-size:12px;opacity:.8">In your banking app choose Pay Anyone, then PayID, then enter the email above. Put the reference in the description. The QR code holds the same details to scan or save, since Australian banks do not share one PayID QR format.</p></div></div>'+
   '<button type="button" class="cbpid-sent" style="background:#c8894a;color:#1e140e;border:0;border-radius:10px;padding:10px 18px;font-weight:700;cursor:pointer">I have paid, send my order</button> <span class="cbpid-st"></span></div>';
  out.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){copy(b,b.dataset.c)}});
  out.querySelector('.cbpid-sent').onclick=function(){var b=this,st=out.querySelector('.cbpid-st');b.disabled=true;st.textContent='Sending your order…';
   var subj=o.subject(no),body='PAYID ORDER '+no+'\nPaid by PayID to '+PAYID+' (check the bank for reference '+no+' before shipping)\n\n'+o.body(no);
   fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:subj,_captcha:'false',_replyto:o.email(),order:no,message:body})})
   .then(function(r){return r.json()}).then(function(j){if(!(j&&(j.success===true||j.success==='true')))throw 0;st.textContent='Order '+no+' sent. Karen will email you once your payment shows in the bank.';o.onDone&&o.onDone(no)})
   .catch(function(){st.innerHTML='Could not send automatically. <a href="#" class="cbpid-mail">Email the order instead</a>';out.querySelector('.cbpid-mail').onclick=function(e){e.preventDefault();window.CBOrder?CBOrder.mail(subj,body):location.href='mailto:'+EMAIL+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body)};b.disabled=false})}
 }}
window.CBPay={mount:mount,PAYID:PAYID,EMAIL:EMAIL,ref:ref};
})();
