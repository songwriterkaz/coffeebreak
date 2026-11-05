'use strict';
/* Coffeebreak connection and hotspot helper. Plain words, a big Try again button, and clear steps for joining a hotspot.
   A web app cannot switch a phone onto wifi or turn a hotspot on. This file explains that and shows what to do instead. */
(function(){
var $=function(s){return document.querySelector(s)};
var inFrame=false;try{inFrame=window.top!==window}catch(e){inFrame=true}
var ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),and=/Android/.test(ua);
var HELP={joinAndroid:'https://support.google.com/android/answer/9075847',joinIos:'https://support.apple.com/en-au/HT204023',hotAndroid:'https://support.google.com/android/answer/9059108'};
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* 1. connection panel under the Ready bar */
var since=0;
function panel(){var r=$('#readybar');if(!r||$('#cbnet'))return;
 var d=document.createElement('div');d.id='cbnet';d.style.cssText='display:none;margin:-2px 0 8px;text-align:center';
 d.innerHTML='<div id="cbnettxt" role="status" aria-live="polite" style="font-size:15px;font-weight:700;padding:10px;border-radius:10px;background:#ffe0b2;color:#3b2417;margin-bottom:6px"></div><button type="button" class="btn" id="cbnetretry" style="display:none;width:100%;min-height:56px;font-size:20px;font-weight:800;background:#2e7d32">Try again</button><div id="cbnetmore" style="font-size:12px;margin-top:6px"></div>';
 r.parentNode.insertBefore(d,r.nextSibling);
 var b=$('#cbnetretry');b.onclick=function(){b.disabled=true;b.textContent='Trying again...';since=Date.now();try{window.__cbNet.retry()}catch(e){}setTimeout(function(){b.disabled=false;b.textContent='Try again';upd()},3000);upd()}}
function show(msg,btn,more){var p=$('#cbnet');if(!p)return;p.style.display='block';$('#cbnettxt').textContent=msg;$('#cbnetretry').style.display=btn?'block':'none';$('#cbnetmore').textContent=more||''}
function upd(){var n=window.__cbNet,p=$('#cbnet');if(!n||!p)return;var i=n.info();
 if(i.ready){since=0;p.style.display='none';return}
 if(!since)since=Date.now();var waited=Date.now()-since;
 if(!i.online){show('No internet right now. Turn on wifi or mobile data, then tap Try again.',true,'Pairing two phones on your own wifi still works without internet. See Your own wifi under My SIM.');return}
 if(i.taken){show('This number looks open in another tab or window. Close the other one, then tap Try again.',true,'');return}
 if(waited<8000){show('Connecting... this can take a few seconds.',false,'');return}
 var svc=/network|socket|server/.test(i.err||'');
 show('Not connected yet. Tap Try again.',true,(svc?'The free calling service could not be reached. ':'')+'If you joined a hotspot, make sure the phone sharing it has mobile data on. If it is public wifi, you may need to sign in first. The app also retries by itself every few seconds.')}
/* 2. hotspot join card */
function joinHelp(){return ios?'<a href="'+HELP.joinIos+'" target="_blank" rel="noopener">How to join a hotspot on iPhone</a>':'<a href="'+HELP.joinAndroid+'" target="_blank" rel="noopener">How to join wifi on Android</a> · <a href="'+HELP.hotAndroid+'" target="_blank" rel="noopener">How to turn a hotspot on</a>'}
function copyTxt(t,btn){var ok=function(){btn.textContent='Copied';setTimeout(function(){btn.textContent=btn.dataset.l},1800)};
 var fail=function(){if(window.cbAsk)window.cbAsk('Press and hold to copy','copy',t)};
 try{if(window.CBQL&&CBQL.copy){CBQL.copy(t).then(function(o){o?ok():fail()});return}}catch(e){}
 try{navigator.clipboard.writeText(t).then(ok,fail)}catch(e){fail()}}
function renderJoin(){var n=($('#hsname')||{}).value,p=($('#hspass')||{}).value;n=String(n||'').trim();var box=$('#hsjoin');
 if(!n){if(box)box.style.display='none';return}
 if(!box){box=document.createElement('div');box.id='hsjoin';box.className='note';box.style.cssText='font-size:14px;margin:8px 0';var a=$('#hsqrbox');a.parentNode.insertBefore(box,a.nextSibling)}
 box.style.display='block';
 box.innerHTML='<b>How the other phone joins</b><div style="margin:6px 0">Network name: <b>'+esc(n)+'</b> <button type="button" class="btn" data-copy="n" data-l="Copy name" style="padding:6px 10px;font-size:13px">Copy name</button></div>'+
  (p?'<div style="margin:6px 0">Password: <b>'+esc(p)+'</b> <button type="button" class="btn" data-copy="p" data-l="Copy password" style="padding:6px 10px;font-size:13px">Copy password</button></div>':'<div style="margin:6px 0">No password set.</div>')+
  '<ol style="margin:6px 0 6px 18px;padding:0"><li>Turn your hotspot on first.</li><li>On the other phone open its Wi-Fi settings.</li><li>Pick the network named above and type the password.</li></ol>'+
  'Or scan the code above with the other phone camera. Most phones then offer to join.<br><span style="font-size:12px">This app cannot join the network for the other phone. Phones only allow that in their own settings.</span><br>'+joinHelp()+
  (inFrame?'':'<div style="margin-top:6px"><a class="btn" id="hsopenwifi" style="text-decoration:none;padding:8px 12px;font-size:14px" href="'+(and?'intent:#Intent;action=android.settings.WIFI_SETTINGS;end':ios?'App-Prefs:root=WIFI':'#')+'">Open Wi-Fi settings</a> <span style="font-size:12px">If nothing opens, use the steps above.</span></div>');
 Array.prototype.forEach.call(box.querySelectorAll('[data-copy]'),function(b){b.onclick=function(){copyTxt(b.dataset.copy==='n'?n:p,b)}})}
function fixOpen(){var o=$('#hsopen');if(!o)return;
 if(inFrame){/* a deep link to phone settings cannot work from inside another web page */
  o.style.display='none';var s=$('#hssteps');if(s&&!$('#hshelpfr')){var d=document.createElement('div');d.id='hshelpfr';d.style.cssText='font-size:13px;margin-top:6px';d.innerHTML='This page cannot open your phone settings for you, so use the steps above. '+joinHelp();s.parentNode.insertBefore(d,s.nextSibling)}}
 var nt=document.querySelector('#hotspot + .note');if(nt)nt.textContent='The app cannot switch your hotspot on or join a network by itself. Phones only allow that in their own settings. Follow the steps below.'}
function init(){panel();fixOpen();
 var q=$('#hsqr');if(q)q.addEventListener('click',function(){setTimeout(renderJoin,80)});
 renderJoin();upd();setInterval(upd,1500)}
if(document.readyState==='complete')setTimeout(init,50);else window.addEventListener('load',function(){setTimeout(init,50)});
})();
