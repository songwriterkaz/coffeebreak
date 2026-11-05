const C=window.PAWN_CONFIG,$=i=>document.getElementById(i),ON=C.licensed===true;
$('banner').textContent=ON?'Pawn loans now open'+(C.licenceNumber?' — NSW pawnbroker licence '+C.licenceNumber:''):'Pawn loans open soon — licence pending';
$('lic').textContent=ON&&C.licenceNumber?'NSW pawnbroker licence '+C.licenceNumber:'Not yet licensed as a pawnbroker (licence pending). No loans are offered until licensed.';
const ph=v=>ON?v:'<span class="ph">'+v+'</span>';
$('howBox').innerHTML=(ON?'':'<p><b>Pawn loans are not available yet.</b> This is how they will work once licensed:</p>')+
'<ol><li>Bring your item and photo ID.</li><li>We value it and offer a loan secured only by the item.</li><li>You sign a pawn agreement and get a pawn ticket showing the loan, interest, fees and dates.</li><li>Repay the loan plus interest within the redemption period (at least '+C.redemptionMonths+' months) to collect your item. You can choose to pay interest monthly.</li><li>If not redeemed, the item may be sold; any surplus over what is owed can be claimed by you.</li><li>You will never owe more than the item — our only recourse is the pawned item.</li></ol>';
$('termsBox').innerHTML='<p>Interest rate: '+ph(C.interestRate)+'</p><p>Equivalent annual rate: '+ph(C.equivAnnualRate)+'</p><p>Fees: '+ph(C.fees)+'</p><p>Redemption period: minimum '+C.redemptionMonths+' months.</p>'+(ON?'':'<p class="ph">All rates and fees: set once licensed.</p>');
$('vSend').onclick=()=>{if(!$('vName').value||!$('vEmail').value||!$('vDesc').value){$('vMsg').textContent='Please add name, email and description.';return}
 CBOrder.mail('Coffeebreak Pawn Shop valuation request – '+$('vName').value,'VALUATION REQUEST (not a loan'+(ON?'':' – licence pending, no loans offered')+')\nName: '+$('vName').value+'\nEmail: '+$('vEmail').value+'\nPhone: '+$('vPhone').value+'\nCategory: '+$('vCat').value+'\n\n'+$('vDesc').value,C.orderEmail);$('vMsg').textContent='Your email app has opened — press send.'};
const ITEMS=window.PAWN_ITEMS||[],find=i=>ITEMS.find(p=>p.id==i);let cart=[];
function draw(){$('grid').innerHTML=ITEMS.length?ITEMS.map(p=>`<div class="box"><img src="${p.img}" alt="" style="width:100%"><h3>${p.t}</h3><p>${CBPay.label(p.price)}</p><button onclick="cart.push('${p.id}');draw()">Add to cart</button></div>`).join(''):'<p class="box">New pre-owned stock coming soon.</p>';
 $('cartBox').hidden=!ITEMS.length;$('lines').textContent=cart.map(i=>find(i).t).join(', ')||'Empty';$('tot').textContent=cart.reduce((a,i)=>a+find(i).price,0).toFixed(2)}
draw();
CBPay.mount('pay',{currency:'AUD',getItems:()=>cart.map(i=>({name:find(i).t,amount:find(i).price,qty:1})),
 validate:()=>{if(!$('cName').value||!$('cEmail').value||!$('cAddr').value){alert('Please add name, email and address.');return false}return true},email:()=>$('cEmail').value,
 subject:no=>'Coffeebreak Pawn Shop order '+no+' – '+$('cName').value,
 body:no=>CBOrder.text({store:'COFFEEBREAK PAWN SHOP (AUD)',orderId:no,customer:{name:$('cName').value,address:$('cAddr').value,phone:$('cPhone').value,email:$('cEmail').value},items:cart.map(i=>({title:find(i).t,supplierPrice:null,salePrice:find(i).price}))}),
 onDone:()=>{cart=[];draw()}});
