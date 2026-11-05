(function(){
var C=window.RAFFLE_CONFIG||{drawDate:'2026-11-30T20:00:00+11:00',drawLabel:'30 November 2026',entryEmail:'songwriterkaz@gmail.com'};
function $(id){return document.getElementById(id);}
var FLASH=[['coffee-heart','Coffee cup heart'],['rose','Red rose'],['swallow','Swallow'],['sacred-heart','Flaming heart'],['coffee-bean','Coffee bean'],['dagger-rose','Dagger and rose'],['anchor','Anchor'],['sun','Sun'],['lightning','Lightning and stars']];
$('flashGrid').innerHTML=FLASH.map(function(f){return '<figure><img loading="lazy" src="img/'+f[0]+'.webp" alt="'+f[1]+' flash design"><figcaption>'+f[1]+'</figcaption></figure>';}).join('');
$('drawText').textContent='Winners drawn after '+C.drawLabel+' (Sydney time).';
$('tcDate').textContent=C.drawLabel;
var target=new Date(C.drawDate).getTime();
window.CB_closed=false;
function tick(){
  var ms=Math.max(0,target-Date.now());
  var s=Math.floor(ms/1000);
  $('cd-d').textContent=Math.floor(s/86400);
  $('cd-h').textContent=Math.floor(s%86400/3600);
  $('cd-m').textContent=Math.floor(s%3600/60);
  $('cd-s').textContent=s%60;
  if(ms===0&&window.CB_closed===false){window.CB_closed=true;$('drawText').textContent='Entries have closed. Winners will be contacted by email.';}
}
tick();setInterval(tick,1000);
// Wheel (for show only)
var SEG=['Rose flash','Games pack','Swallow flash','Coffee cup flash','Games pack','Anchor flash'];
var wheel=$('wheel');
wheel.innerHTML=SEG.map(function(t,i){var a=i*60+30-90;return '<span style="transform:rotate('+a+'deg) translate(46px,-50%)">'+t+'</span>';}).join('');
var rot=0,spinning=false;
$('spinBtn').addEventListener('click',function(){
  if(spinning)return;spinning=true;$('wheelResult').textContent='Spinning...';
  var extra=1440+Math.floor(Math.random()*360);rot+=extra;
  wheel.style.transform='rotate('+rot+'deg)';
  setTimeout(function(){
    var a=(360-(rot%360))%360;var idx=Math.floor(a/60)%6;
    $('wheelResult').textContent='The wheel landed on '+SEG[idx]+'. Just for fun, the real draw is separate.';
    spinning=false;
  },4100);
});
// Entry
window.CB_lastMailto='';
$('entryForm').addEventListener('submit',function(e){
  e.preventDefault();
  var name=$('e-name').value.trim(),email=$('e-email').value.trim(),prize=$('e-prize').value;
  var errs=[];
  if(name==='')errs.push('your name');
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)===false)errs.push('a valid email');
  if(prize==='')errs.push('a prize preference');
  if($('e-age').checked===false)errs.push('the age confirmation');
  if($('e-au').checked===false)errs.push('the Australian resident confirmation');
  if($('e-terms').checked===false)errs.push('agreement to the terms');
  if(window.CB_closed){$('e-err').textContent='Entries have closed for this draw.';return;}
  if(errs.length){$('e-err').textContent='Please add '+errs.join(', ')+'.';return;}
  $('e-err').textContent='';
  var key='cbRaffleEntered:'+email.toLowerCase();
  var already=false;try{already=localStorage.getItem(key)==='1';localStorage.setItem(key,'1');}catch(x){}
  var body='Coffeebreak Free Raffle entry\n\nName: '+name+'\nEmail: '+email+'\nPrize preference: '+prize+'\nAge: 18 or over, or parent or guardian consent\nAustralian resident: yes\nAgreed to terms: yes\n\nDraw: '+C.drawLabel;
  var url='mailto:'+C.entryEmail+'?subject='+encodeURIComponent('Raffle entry - '+name)+'&body='+encodeURIComponent(body);
  window.CB_lastMailto=url;
  $('e-ok').textContent=already?'You have already entered from this device. Only one entry per person counts, so there is no need to send it again.':'Your email app should open now. Press send to lock in your free entry. Good luck.';
  $('e-ok').classList.remove('hidden');
  if(already===false)window.location.href=url;
});
})();
