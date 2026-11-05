(function(){
var $=function(i){return document.getElementById(i)};
var FOODS=[
['banana','Banana, medium',118,27,14,['banana']],['apple','Apple, medium',182,25,19,['granny smith','apple']],
['orange','Orange, medium',131,15,12,['orange']],['lemon','Lemon',58,5,1.5,['lemon']],
['pineapple','Pineapple, 1 cup',165,22,16,['pineapple']],['strawberry','Strawberries, 1 cup',152,12,7,['strawberry']],
['grapes','Grapes, 1 cup',151,27,23,['grape']],['watermelon','Watermelon, 1 cup',152,12,9,['watermelon']],
['mango','Mango, 1 cup',165,25,23,['mango']],['pomegranate','Pomegranate, half',140,26,19,['pomegranate']],
['fig','Figs, 2 medium',100,19,16,['fig']],['pizza','Pizza, 1 slice',107,36,4,['pizza']],
['burger','Cheeseburger',150,32,7,['cheeseburger','hamburger']],['hotdog','Hot dog in bun',100,24,4,['hotdog','hot dog']],
['bagel','Bagel',105,56,6,['bagel']],['pretzel','Pretzel',60,48,2,['pretzel']],
['bread','Bread, 2 slices',60,29,3,['french loaf','loaf','bread']],['icecream','Ice cream, half cup',66,16,14,['ice cream','icecream']],
['trifle','Trifle / dessert, 1 cup',150,40,30,['trifle']],['burrito','Burrito',220,50,3,['burrito']],
['mash','Mashed potato, 1 cup',210,35,3,['mashed potato']],['chips','Hot chips, medium',117,48,0.3,['french fries']],
['broccoli','Broccoli, 1 cup',91,6,1.5,['broccoli']],['cauli','Cauliflower, 1 cup',107,5,2,['cauliflower']],
['cucumber','Cucumber, 1 cup',104,4,2,['cucumber']],['capsicum','Capsicum, 1 cup',149,9,6,['bell pepper']],
['mushroom','Mushrooms, 1 cup',70,2,1,['mushroom']],['corn','Corn cob',103,19,6,['corn','ear,']],
['cabbage','Cabbage, 1 cup',89,5,3,['cabbage']],['zucchini','Zucchini, 1 cup',124,4,3,['zucchini']],
['pumpkin','Butternut pumpkin, 1 cup',205,22,4,['butternut','acorn squash','spaghetti squash']],
['pasta','Pasta carbonara, 1 cup',200,40,2,['carbonara']],['soup','Clear soup, 1 cup',240,2,1,['consomme']],
['hotpot','Hot pot / stew, 1 bowl',300,20,4,['hot pot','hotpot']],['meatloaf','Meatloaf, 1 slice',115,9,3,['meat loaf']],
['pie','Pot pie',220,43,5,['potpie']],['guac','Guacamole, quarter cup',60,5,0.4,['guacamole']],
['espresso','Espresso, short black',30,0,0,['espresso']],['latte','Latte / flat white, 250ml',250,12,12,['cup','coffee mug']],
['eggnog','Eggnog, 1 cup',250,34,21,['eggnog']],['wine','Red wine, 150ml',150,4,1,['red wine']],
['chocolate','Milk chocolate, 45g',45,26,23,['chocolate']],['donut','Glazed donut',60,31,13,['doughnut','donut']],
['muffin','Blueberry muffin',113,54,30,['muffin']],['rice','Rice, cooked 1 cup',158,45,0.1,[]],
['oats','Porridge, 1 cup',234,28,1,[]],['cereal','Cornflakes, 1 cup',28,24,3,[]],['milk','Milk, 250ml',250,12,12,[]],
['yoghurt','Flavoured yoghurt, 170g',170,25,22,[]],['cola','Cola, 375ml can',375,40,40,['pop bottle']],
['juice','Orange juice, 250ml',250,26,21,[]],['sushi','Sushi roll, 6 pieces',180,38,7,[]],
['sandwich','Sandwich',150,35,5,[]],['honey','Honey, 1 tbsp',21,17,17,[]],['biscuit','Biscuits, 2',30,20,10,[]],
['jellybeans','Jelly beans, 6 (hypo treat)',15,14,10,[]]];
var LS=function(k,d){try{return JSON.parse(localStorage.getItem('cbd_'+k))||d}catch(e){return d}};
var SV=function(k,v){localStorage.setItem('cbd_'+k,JSON.stringify(v))};
var S=LS('set',{unit:'mmol',low:4.0,high:10.0});
function toU(m){return S.unit==='mg'?Math.round(m*18):(+m).toFixed(1)}
function fromU(v){return S.unit==='mg'?v/18:v}
function uName(){return S.unit==='mg'?'mg/dL':'mmol/L'}
function load(src){return new Promise(function(r,j){var s=document.createElement('script');s.src=src;s.onload=r;s.onerror=function(){j(new Error('needs internet'))};document.head.appendChild(s)})}
var cam=null;
function startCam(v){return navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(st){cam=st;v.srcObject=st;v.hidden=false;return v.play()})}
function snap(v){var c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0,c.width,c.height);return c}
function stopCam(){if(cam){cam.getTracks().forEach(function(t){t.stop()});cam=null}}
// food
var sel=$('dFood');FOODS.forEach(function(f,i){var o=document.createElement('option');o.value=i;o.textContent=f[1];sel.appendChild(o)});
function showFood(){var f=FOODS[sel.value],p=+$('dPortion').value||1;$('dPortV').textContent=p+'x';
 $('dFoodOut').innerHTML='<b>'+f[1]+'</b> x'+p+' ('+Math.round(f[2]*p)+' g)<br>Est. carbs <b>'+(f[3]*p).toFixed(1)+' g</b> · Est. sugar <b>'+(f[4]*p).toFixed(1)+' g</b>'}
sel.onchange=showFood;$('dPortion').oninput=showFood;showFood();
var net=null;
$('dFoodCam').onclick=function(){startCam($('dVid')).then(function(){$('dFoodSnap').hidden=false;$('dFoodMsg').textContent='Point at the food, then tap Snap.'}).catch(function(e){$('dFoodMsg').textContent='Camera not available: '+e.message})};
$('dFoodSnap').onclick=function(){var c=snap($('dVid'));stopCam();$('dVid').hidden=true;$('dFoodSnap').hidden=true;$('dFoodMsg').textContent='Recognising on your phone...';
 (net?Promise.resolve():load('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js').then(function(){return load('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js')}).then(function(){return mobilenet.load()}).then(function(m){net=m}))
 .then(function(){return net.classify(c,5)}).then(function(r){var hit=-1,lab=r.map(function(x){return x.className}).join(', ');
  for(var k=0;k<r.length&&hit<0;k++){var n=r[k].className.toLowerCase();FOODS.forEach(function(f,i){if(hit<0)f[5].forEach(function(w){if(n.indexOf(w)>=0)hit=i})})}
  if(hit>=0){sel.value=hit;showFood();$('dFoodMsg').textContent='Looks like: '+FOODS[hit][1]+'. Check it and adjust the portion.'}
  else $('dFoodMsg').textContent='Not sure what that is ('+lab+'). Pick the food from the list.'})
 .catch(function(e){$('dFoodMsg').textContent='Recognition needs internet the first time ('+e.message+'). Pick the food from the list.'})};
$('dFoodLog').onclick=function(){var f=FOODS[sel.value],p=+$('dPortion').value||1;addLog({t:'carbs',v:+(f[3]*p).toFixed(1),n:f[1]+' x'+p})};
// barcode
function off(code){$('dBarOut').textContent='Looking up '+code+'...';
 fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'.json?fields=product_name,nutriments,serving_size').then(function(r){return r.json()}).then(function(j){
  if(!j.product){$('dBarOut').textContent='Not found in Open Food Facts.';return}var n=j.product.nutriments||{};
  $('dBarOut').innerHTML='<b>'+(j.product.product_name||code)+'</b><br>Per 100g: carbs '+(n.carbohydrates_100g!=null?n.carbohydrates_100g:'?')+' g, sugar '+(n.sugars_100g!=null?n.sugars_100g:'?')+' g'+(j.product.serving_size?'<br>Serving: '+j.product.serving_size:'')}).catch(function(){$('dBarOut').textContent='Barcode lookup needs internet.'})}
$('dBarGo').onclick=function(){var c=$('dBarIn').value.replace(/\D/g,'');if(c)off(c)};
$('dBarCam').onclick=function(){if(!('BarcodeDetector' in window)){$('dBarOut').textContent='Barcode camera not supported on this browser. Type the barcode numbers instead.';return}
 var bd=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']}),v=$('dBarVid');startCam(v).then(function(){var tries=0;(function loop(){bd.detect(v).then(function(b){if(b.length){stopCam();v.hidden=true;$('dBarIn').value=b[0].rawValue;off(b[0].rawValue)}else if(++tries<200)setTimeout(loop,150);else{stopCam();v.hidden=true}}).catch(function(){})})()}).catch(function(e){$('dBarOut').textContent='Camera not available: '+e.message})};
// OCR meter / CGM screen
var worker=null;
function ocr(vid,out,inp){var c=snap($(vid));stopCam();$(vid).hidden=true;$(out).textContent='Reading the numbers...';
 (worker?Promise.resolve():load('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js').then(function(){return Tesseract.createWorker('eng')}).then(function(w){worker=w;return w.setParameters({tessedit_char_whitelist:'0123456789.,'})}))
 .then(function(){return worker.recognize(c)}).then(function(r){var nums=(r.data.text.replace(/,/g,'.').match(/\d+(\.\d)?/g)||[]).map(Number),pick=null;
  nums.forEach(function(n){if(pick==null&&((n>=1&&n<=35&&String(n).indexOf('.')>0)||(n>=20&&n<=600)))pick=n});
  if(pick==null){$(out).textContent='Could not read a number. Type it in.';return}
  var mm=pick>=20?pick/18:pick;$(inp).value=toU(mm);$(out).textContent='Read '+pick+(pick>=20?' mg/dL':' mmol/L')+'. Check it matches the screen, then tap Log.'})
 .catch(function(e){$(out).textContent='Reading needs internet the first time. Type it in.'})}
function camBtn(b,vid,snapB,out){$(b).onclick=function(){startCam($(vid)).then(function(){$(snapB).hidden=false;$(out).textContent='Fill the frame with the screen, then tap Read.'}).catch(function(e){$(out).textContent='Camera not available: '+e.message})}}
camBtn('dMCam','dMVid','dMSnap','dMOut');$('dMSnap').onclick=function(){this.hidden=true;ocr('dMVid','dMOut','dMIn')};
camBtn('dPCam','dPVid','dPSnap','dPOut');$('dPSnap').onclick=function(){this.hidden=true;ocr('dPVid','dPOut','dPIn')};
camBtn('dSCam','dSVid','dSSnap','dSOut');$('dSSnap').onclick=function(){this.hidden=true;ocr('dSVid','dSOut','dSIn')};
function logBG(inp,src){var v=parseFloat($(inp).value);if(!v)return;addLog({t:'bg',v:+fromU(v).toFixed(2),n:src});$(inp).value=''}
$('dMLog').onclick=function(){logBG('dMIn','meter')};$('dPLog').onclick=function(){logBG('dPIn','plug-in meter')};$('dSLog').onclick=function(){logBG('dSIn','arm sensor app')};
$('dILog').onclick=function(){var v=$('dIIn').value.trim();if(v){addLog({t:'insulin',v:0,n:v});$('dIIn').value=''}};
// log + chart
function addLog(e){var L=LS('log',[]);e.ts=Date.now();L.push(e);SV('log',L);render()}
function render(){var L=LS('log',[]),h='';L.slice(-30).reverse().forEach(function(e){var d=new Date(e.ts).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'});
 var col=e.t==='bg'?(e.v<S.low?'#3a7bff':e.v>S.high?'#ff8a00':'#2bb24c'):'#8c3cc8';
 h+='<div style="border-left:6px solid '+col+';padding:2px 6px;margin:2px 0">'+d+' · '+(e.t==='bg'?'<b>'+toU(e.v)+' '+uName()+'</b> ('+e.n+')':e.t==='carbs'?'<b>'+e.v+' g carbs</b> '+e.n:'Insulin/meds: '+e.n)+'</div>'});
 $('dLog').innerHTML=h||'No entries yet.';$('dUnit').textContent=uName();$('dLow').value=toU(S.low);$('dHigh').value=toU(S.high);
 ['dMIn','dPIn','dSIn'].forEach(function(i){$(i).placeholder='Reading in '+uName()});draw(L)}
function draw(L){var c=$('dChart'),x=c.getContext('2d'),W=c.width,H=c.height,b=L.filter(function(e){return e.t==='bg'}).slice(-40),mx=20;
 x.clearRect(0,0,W,H);var y=function(v){return H-(Math.min(v,mx)/mx)*H};
 x.fillStyle='#3a7bff33';x.fillRect(0,y(S.low),W,H-y(S.low));x.fillStyle='#ff8a0033';x.fillRect(0,0,W,y(S.high));x.fillStyle='#2bb24c22';x.fillRect(0,y(S.high),W,y(S.low)-y(S.high));
 if(!b.length)return;x.strokeStyle='#c2185b';x.lineWidth=3;x.beginPath();b.forEach(function(e,i){var px=b.length<2?W/2:i*(W-10)/(b.length-1)+5;i?x.lineTo(px,y(e.v)):x.moveTo(px,y(e.v))});x.stroke();
 b.forEach(function(e,i){var px=b.length<2?W/2:i*(W-10)/(b.length-1)+5;x.fillStyle=e.v<S.low?'#3a7bff':e.v>S.high?'#ff8a00':'#2bb24c';x.beginPath();x.arc(px,y(e.v),5,0,7);x.fill()})}
$('dUnitT').onclick=function(){S.unit=S.unit==='mg'?'mmol':'mg';SV('set',S);render()};
$('dBands').onclick=function(){var l=fromU(parseFloat($('dLow').value)),h=fromU(parseFloat($('dHigh').value));if(l>0&&h>l){S.low=l;S.high=h;SV('set',S);render()}};
$('dCsv').onclick=function(){var L=LS('log',[]),s='time,type,value_mmol_or_carbs_g,note\n';L.forEach(function(e){s+=new Date(e.ts).toISOString()+','+e.t+','+e.v+',"'+String(e.n).replace(/"/g,"'")+'"\n'});
 var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv'}));a.download='coffeebreak-diabetes-log.csv';a.click()};
$('dClear').onclick=function(){if(confirm('Clear the whole log?')){SV('log',[]);render()}};
// reminders
function rem(){var R=LS('rem',[]);$('dRemList').innerHTML=R.map(function(r,i){return '<div>'+r.time+' · '+r.what+' <button data-i="'+i+'" style="padding:2px 8px;font-size:13px">x</button></div>'}).join('')||'No reminders.';
 [].forEach.call($('dRemList').querySelectorAll('button'),function(b){b.onclick=function(){R.splice(+b.dataset.i,1);SV('rem',R);rem()}})}
$('dRemAdd').onclick=function(){var t=$('dRemT').value,w=$('dRemW').value.trim()||'Check glucose';if(!t)return;var R=LS('rem',[]);R.push({time:t,what:w});SV('rem',R);rem();if(window.Notification&&Notification.permission==='default')Notification.requestPermission()};
var fired={};setInterval(function(){var n=new Date(),t=('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2);LS('rem',[]).forEach(function(r){var k=r.time+r.what+n.toDateString();if(r.time===t&&!fired[k]){fired[k]=1;
 if(window.Notification&&Notification.permission==='granted')new Notification('Coffeebreak reminder',{body:r.what,icon:'icon-192.png'});else alert('Coffeebreak reminder: '+r.what)}})},20000);
render();rem();
// tab switching
function show(d){$('diabUI').hidden=!d;$('mDiab').classList.toggle('on',d);if(d){$('radioUI').hidden=true;$('ghostUI').hidden=true;$('mRadio').classList.remove('on');$('mGhost').classList.remove('on')}}
$('mDiab').onclick=function(){show(true)};$('mRadio').addEventListener('click',function(){show(false)});$('mGhost').addEventListener('click',function(){show(false)});
})();
