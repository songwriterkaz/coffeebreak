(function(){
var TO='songwriterkaz@gmail.com';
function $(id){return document.getElementById(id);}
function val(id){return ($(id).value||'').trim();}
function mailto(subject,body){return 'mailto:'+TO+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);}
function copy(text,done){
  function fallback(){var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(t);done();}
  if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(done,fallback);}else{fallback();}
}
function reqText(){
  return 'Hamper request\n\nName: '+val('r-name')+'\nSuburb or postcode: '+val('r-suburb')+'\nHousehold size: '+val('r-size')+'\nContact: '+val('r-contact')+'\nDietary needs: '+(val('r-diet')||'None given')+'\n\nSent from Coffeebreak Community Food Hampers';
}
function checkReq(){
  var miss=[];
  if(val('r-name')==='')miss.push('name');
  if(val('r-suburb')==='')miss.push('suburb or postcode');
  if(val('r-size')==='')miss.push('household size');
  if(val('r-contact')==='')miss.push('contact');
  $('r-err').textContent=miss.length?('Please fill in: '+miss.join(', ')+'.'):'';
  return miss.length===0;
}
window.CB_lastMailto='';
$('reqForm').addEventListener('submit',function(e){
  e.preventDefault();
  if(checkReq()===false)return;
  var url=mailto('Food hamper request - '+val('r-suburb'),reqText());
  window.CB_lastMailto=url;
  $('r-ok').textContent='Your email app should open now. If it does not, tap Copy request and email it to '+TO+'.';
  $('r-ok').classList.remove('hidden');
  window.location.href=url;
});
$('r-copy').addEventListener('click',function(){
  if(checkReq()===false)return;
  var t='To: '+TO+'\n\n'+reqText();
  copy(t,function(){$('r-ok').textContent='Copied. Paste it into an email to '+TO+'.';$('r-ok').classList.remove('hidden');$('r-pre').textContent=t;$('r-pre').classList.remove('hidden');});
});
$('d-copy').addEventListener('click',function(){copy('darkokaz@gmx.com',function(){$('d-ok').textContent='PayID copied.';});});
$('volForm').addEventListener('submit',function(e){
  e.preventDefault();
  if(val('v-name')===''||val('v-contact')===''){$('v-err').textContent='Please add your name and a phone or email.';return;}
  $('v-err').textContent='';
  var body='Volunteer sign up\n\nName: '+val('v-name')+'\nContact: '+val('v-contact')+'\nHelp with: '+val('v-help')+'\nAvailability: '+(val('v-avail')||'Not given')+'\n\nSent from Coffeebreak Community Food Hampers';
  var url=mailto('Hamper volunteer - '+val('v-name'),body);
  window.CB_lastMailto=url;
  $('v-ok').textContent='Thank you. Your email app should open now.';$('v-ok').classList.remove('hidden');
  window.location.href=url;
});
})();
