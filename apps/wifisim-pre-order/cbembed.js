/* Coffeebreak embed safety: works inside sandboxed iframes (itch.io and similar).
   Storage falls back to memory when blocked. alert, prompt and confirm become on-screen messages. */
(function(){
 function mem(){var m={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(m,k)?m[k]:null},setItem:function(k,v){m[k]=String(v)},removeItem:function(k){delete m[k]},clear:function(){m={}},key:function(i){return Object.keys(m)[i]||null},get length(){return Object.keys(m).length}}}
 ['localStorage','sessionStorage'].forEach(function(n){var ok=true;try{var s=window[n];s.setItem('cbprobe','1');s.removeItem('cbprobe')}catch(e){ok=false}
  if(!ok){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(e2){}}});
 window.cbEmbedStorage=(function(){try{localStorage.setItem('cbprobe','1');localStorage.removeItem('cbprobe');return 'real'}catch(e){return 'memory'}})();
 function ready(f){if(document.body)f();else document.addEventListener('DOMContentLoaded',f)}
 var tt=null;
 window.cbToast=function(msg){ready(function(){var d=document.getElementById('cbtoast');if(!d){d=document.createElement('div');d.id='cbtoast';d.setAttribute('role','status');d.style.cssText='position:fixed;left:12px;right:12px;bottom:84px;max-width:420px;margin:auto;background:#3b2417;color:#fff;border:2px solid #f48fb1;border-radius:14px;padding:12px 14px;font:15px system-ui,sans-serif;text-align:center;z-index:99999;display:none';document.body.appendChild(d)}
  d.textContent=String(msg);d.style.display='block';clearTimeout(tt);tt=setTimeout(function(){d.style.display='none'},4500)})};
 window.alert=function(m){window.cbToast(m)};
 /* on-screen ask: kind is 'text', 'copy' or 'confirm'. Returns a Promise */
 window.cbAsk=function(msg,kind,val){return new Promise(function(res){ready(function(){
  var o=document.createElement('div');o.style.cssText='position:fixed;inset:0;background:#000a;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px';
  var b=document.createElement('div');b.style.cssText='background:#fff4ec;color:#3b2417;border-radius:16px;padding:16px;max-width:380px;width:100%;font:15px system-ui,sans-serif;text-align:center';
  var p=document.createElement('p');p.textContent=msg;p.style.margin='0 0 10px';b.appendChild(p);
  var i=null;if(kind!=='confirm'){i=document.createElement('input');i.value=val||'';i.style.cssText='width:100%;padding:10px;font-size:16px;border:1px solid #6b4226;border-radius:10px;box-sizing:border-box;margin-bottom:10px';if(kind==='copy')i.readOnly=true;b.appendChild(i)}
  function done(v){o.remove();res(v)}
  function btn(t,bg,v){var x=document.createElement('button');x.textContent=t;x.style.cssText='border:0;border-radius:20px;padding:10px 18px;margin:0 4px;font-size:15px;color:#fff;background:'+bg;x.onclick=function(){done(typeof v==='function'?v():v)};b.appendChild(x);return x}
  if(kind==='confirm'){btn('Yes','#e91e63',true);btn('No','#6b4226',false)}
  else if(kind==='copy'){btn('Copy','#e91e63',function(){try{i.select();navigator.clipboard&&navigator.clipboard.writeText(i.value)}catch(e){}return true});btn('Close','#6b4226',null)}
  else{btn('OK','#e91e63',function(){return i.value});btn('Cancel','#6b4226',null)}
  o.appendChild(b);document.body.appendChild(o);if(i){i.focus();if(kind==='copy')i.select()}})})};
})();
