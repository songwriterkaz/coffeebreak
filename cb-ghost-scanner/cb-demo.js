/* Coffeebreak free demo limits. The full version is $5 on itch.io. */
(function(){
if(window.__cbdemo)return;window.__cbdemo=1;window.CB_DEMO=true;
var me=document.currentScript,ds=(me&&me.dataset)||{},URL_=ds.url||'https://coffeebreaks.itch.io',MODE=ds.mode||'app',PLAYS=+ds.plays||3,MINS=+ds.minutes||0;
var NOTE='Free demo. Full version $5 on itch.io';var BARTXT=ds.nosave==='1'?'Free demo: nothing is kept after you leave. Full version $5 on itch.io':NOTE;
/* 1. Nothing is kept: storage lives in memory for this visit only */
if(ds.nosave==='1'){try{var mem={},M={getItem:function(k){k=String(k);return Object.prototype.hasOwnProperty.call(mem,k)?mem[k]:null},setItem:function(k,v){mem[String(k)]=String(v)},removeItem:function(k){delete mem[String(k)]},clear:function(){mem={}},key:function(i){return Object.keys(mem)[i]||null}};Object.defineProperty(M,'length',{get:function(){return Object.keys(mem).length}});Object.defineProperty(window,'localStorage',{configurable:true,get:function(){return M}})}catch(e){}}
function inert(el){return !!(el&&el.closest&&el.closest('[data-cbs-inert],#cbr-panel,#cbr-btn,[id^="cbp-"],#cbdemo-bar,#cbdemo-toast,#cbdemo-over,#cbdn-ov,#cbdn-btn,#cbassist-root,#cbassist-panel'))}
var toastT;function toast(msg){try{var t=document.getElementById('cbdemo-toast');if(!t){t=document.createElement('div');t.id='cbdemo-toast';t.setAttribute('role','status');t.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:2147483400;background:#1d120c;color:#fff;border:2px solid #ffd84d;border-radius:14px;padding:10px 14px;font:600 14px/1.35 system-ui,sans-serif;max-width:90vw;text-align:center;box-shadow:0 6px 20px #0008';document.body.appendChild(t)}t.innerHTML=(msg||'This is turned off in the free demo.')+'<br><a href="'+URL_+'" target="_blank" rel="noopener" style="color:#ffd84d">'+NOTE+'</a>';t.style.display='block';clearTimeout(toastT);toastT=setTimeout(function(){t.style.display='none'},4500)}catch(e){}}
window.CBDemo={toast:toast,url:URL_};
/* 2. Blocked actions */
var BLOCK={
 store:/(\bpay\b|payid|checkout|check out|send order|place order|send bid|buy now|i've paid|i have (sent|paid)|i've sent|send my|enquiry|make certificate|print|\bsend\b)/i,
 game:/(\bshare\b|copy)/i,
 app:/(save log|export|download|print|\bshare\b|record|copy|certificate)/i,
 safety:/(export|download|print)/i,
 timed:/(export|download|print|\bshare\b)/i
};
var RX=BLOCK[MODE]||BLOCK.app;
function label(el){return ((el.innerText||el.value||'')+' '+(el.getAttribute('aria-label')||'')+' '+(el.title||'')).replace(/\s+/g,' ').trim()}
document.addEventListener('click',function(e){var el=e.target&&e.target.closest&&e.target.closest('button,a,input[type=submit],input[type=button],[role=button]');if(!el||inert(el))return;
 var href=el.getAttribute&&el.getAttribute('href')||'';var txt=label(el);
 if(MODE==='safety'&&/^tel:/i.test(href))return;
 var bad=RX.test(txt)||el.hasAttribute('download')||(/^mailto:/i.test(href)&&MODE!=='safety');
 if(MODE==='game'&&/^(play|play again|start|restart|try again)$/i.test(txt)){var n=(+sessionStorage.getItem('cbdemoPlays')||0)+1;try{sessionStorage.setItem('cbdemoPlays',n)}catch(x){}if(n>PLAYS){bad=true;txt='plays'}}
 if(bad){e.preventDefault();e.stopImmediatePropagation();toast(txt==='plays'?'The free demo has '+PLAYS+' games per visit.':'"'+txt.slice(0,40)+'" is turned off in the free demo.')}},true);
document.addEventListener('submit',function(e){if(inert(e.target))return;if(MODE==='safety'||MODE==='game')return;e.preventDefault();e.stopImmediatePropagation();toast('Sending is turned off in the free demo.')},true);
try{window.print=function(){toast('Printing is turned off in the free demo.')}}catch(e){}
if(MODE!=='safety'){try{if(navigator.share)navigator.share=function(){toast('Sharing is turned off in the free demo.');return Promise.reject(new Error('demo'))}}catch(e){}}
try{var ac=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(!inert(this)&&(this.hasAttribute('download')||(MODE!=='safety'&&/^mailto:/i.test(this.getAttribute('href')||'')))){toast('Saving and sending are turned off in the free demo.');return}return ac.apply(this,arguments)}}catch(e){}
try{var of=window.fetch;if(of)window.fetch=function(u){if(/formsubmit\.co/i.test(String(u&&u.url||u))){toast('Sending is turned off in the free demo.');return Promise.reject(new Error('demo'))}return of.apply(this,arguments)}}catch(e){}
/* 3. Demo bar */
function bar(){if(document.getElementById('cbdemo-bar')||!document.body)return;var b=document.createElement('a');b.id='cbdemo-bar';b.href=URL_;b.target='_blank';b.rel='noopener';b.textContent=BARTXT;b.style.cssText='position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:2147483300;background:#ffd84d;color:#2a1a12;border-radius:999px;padding:4px 12px;font:700 12px system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 8px #0006;opacity:.92;white-space:nowrap';document.body.appendChild(b);
 if(MINS>0)setTimeout(function(){var o=document.createElement('div');o.id='cbdemo-over';o.style.cssText='position:fixed;inset:0;z-index:2147483000;background:rgba(20,10,6,.88);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;font:16px/1.5 system-ui,sans-serif';o.innerHTML='<div><h2 style="margin:0 0 8px;color:#ffd84d">Demo time is up</h2><p>The free demo runs for '+MINS+' minutes per visit.</p><p><a href="'+URL_+'" target="_blank" rel="noopener" style="color:#ffd84d;font-weight:700">'+NOTE+'</a></p><button type="button" style="margin-top:8px;padding:8px 18px;border-radius:999px;border:0;font:700 15px system-ui;cursor:pointer" onclick="location.reload()">Start again</button></div>';document.body.appendChild(o);try{document.querySelectorAll('audio,video').forEach(function(m){m.pause()})}catch(e){}},MINS*60000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bar);else bar();
})();
