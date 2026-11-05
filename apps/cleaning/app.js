const $=id=>document.getElementById(id);const S=window.CB_SERVICES;let sel=null;
const grp=id=>id.startsWith('reg')?'reg':id.startsWith('deep')?'deep':id.startsWith('eol')?'eol':id.startsWith('cp')?'cp':id.startsWith('w')?'w':'other';
$('list').innerHTML=S.map(s=>`<div class="card" id="c_${s.id}"><h3>${s.name}</h3><div class="small">${s.desc}</div><div class="price">${s.price?'$'+s.price.toFixed(2):'Quote on request'}</div>`+
 (s.price?`<button onclick="pick('${s.id}')">Book this</button>`:`<button onclick="location.href='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Cleaning quote: ${s.name}')">Request quote</button>`)+`</div>`).join('');
function pick(id){sel=S.find(s=>s.id==id);document.querySelectorAll('.card').forEach(c=>c.classList.remove('sel'));$('c_'+id).classList.add('sel');$('chosen').innerHTML='Selected: <b>'+sel.name+'</b> – $'+sel.price.toFixed(2)+' AUD';$('book').scrollIntoView({behavior:'smooth'})}
function body(no){const subs=(CB_SUBS[grp(sel.id)]||[]).concat(CB_SUBS.other);
 return ['COFFEEBREAK CLEANING BOOKING '+no,'','Service: '+sel.name,'Date: '+$('cDate').value+'  Time: '+$('cTime').value,'Address: '+$('cAddr').value,'Name: '+$('cName').value,'Phone: '+$('cPhone').value,'Email: '+$('cEmail').value,'Notes: '+$('cNotes').value,'',
 'Customer paid: $'+sel.price.toFixed(2),'Cleaner cost & profit: see private-suppliers/cleaning.json (service '+sel.id+')','','SUBCONTRACTOR OPTIONS (confirm price & insurance before booking):'].concat(subs.map(x=>' - '+x)).concat(['','CHECKLIST: 1. Confirm payment 2. Book cleaner for date/time 3. Confirm with customer. If no cleaner available: offer new time or refund.']).join('\n')}
CBPay.mount('pay',{store:'Coffeebreak Cleaning',getItems:()=>sel?[{name:sel.name+' ('+$('cDate').value+' '+$('cTime').value+')',amount:sel.price,qty:1}]:[],
 validate:()=>{for(const k of['cName','cPhone','cEmail','cAddr','cDate'])if(!$(k).value.trim()){alert('Please fill in '+k.slice(1));return false}return true},
 subject:no=>'Cleaning booking '+no+' – '+sel.name,body:body,email:()=>$('cEmail').value});
