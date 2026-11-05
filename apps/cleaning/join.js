(function(){
function $(i){return document.getElementById(i)}
function abnValid(s){s=(s||'').replace(/\s/g,'');if(!/^\d{11}$/.test(s))return false;var w=[10,1,3,5,7,9,11,13,15,17,19],d=s.split('').map(Number);d[0]-=1;var t=0;for(var i=0;i<11;i++)t+=d[i]*w[i];return t%89===0}
window.abnValid=abnValid;
function today(){var d=new Date();d.setHours(0,0,0,0);return d}
function check(){var errs=[],warns=[];
 var a=$('abn').value;if(a){if(abnValid(a)){$('abnMsg').className='small ok';$('abnMsg').textContent='✓ ABN format valid'}else{$('abnMsg').className='small err';$('abnMsg').textContent='This ABN doesn\'t pass the checksum. Please check it.';errs.push('Invalid ABN')}}else $('abnMsg').textContent='';
 var pc=$('pcDate').value;$('pcMsg').textContent='';if(pc){var p=new Date(pc+'T00:00'),lim=today();lim.setFullYear(lim.getFullYear()-1);
  if(p>today()){$('pcMsg').className='small err';$('pcMsg').textContent='Date is in the future.';errs.push('Police check date in future')}
  else if(p<lim){$('pcMsg').className='small warn';$('pcMsg').textContent='⚠ Older than 12 months – please get a new check. Your application will be flagged.';warns.push('POLICE CHECK OLDER THAN 12 MONTHS ('+pc+')')}}
 var c=$('cover').value;$('coverMsg').textContent='';if(c==='Under $5M'){$('coverMsg').className='small err';$('coverMsg').textContent='Minimum cover is $5M ($10M recommended).';errs.push('Cover under $5M')}else if(c==='$5M'){$('coverMsg').className='small warn';$('coverMsg').textContent='Meets the minimum. $10M is recommended.'}
 var ie=$('insExp').value;$('insMsg').textContent='';if(ie){var e=new Date(ie+'T00:00');if(e<today()){$('insMsg').className='small err';$('insMsg').textContent='This insurance has lapsed. A current policy is required.';errs.push('Insurance lapsed')}else{var days=Math.round((e-today())/864e5);if(days<=30){$('insMsg').className='small warn';$('insMsg').textContent='⚠ Expires in '+days+' days.';warns.push('INSURANCE EXPIRES IN '+days+' DAYS ('+ie+')')}}}
 $('warnField').value=warns.length?warns.join('; '):'None';return errs}
['abn','pcDate','cover','insExp'].forEach(function(i){$(i).addEventListener('change',check);$(i).addEventListener('input',check)});
$('insExp').min=new Date().toISOString().slice(0,10);$('pcDate').max=new Date().toISOString().slice(0,10);
$('joinForm').addEventListener('submit',function(ev){var e=check();
 if(!document.querySelector('input[name="Services[]"]:checked'))e.push('Choose at least one service');
 if(e.length){ev.preventDefault();$('formMsg').textContent='Please fix: '+e.join(', ');window.__joinErrors=e;return}
 $('signedOn').value=new Date().toString();$('formMsg').textContent=''});
})();
