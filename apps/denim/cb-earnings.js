// Coffeebreak earnings badge. Shows REAL profit from paid+fulfilled orders only.
// Source: window.CB_EARNINGS_URL (public JSON, optional) -> ./earnings.json (bundled) -> $0.
(function(){
var REMOTE=window.CB_EARNINGS_URL||'';
function money(n){n=+n||0;return '$'+n.toLocaleString('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2})}
function show(d){
 d=d||{};var el=document.getElementById('cb-earnings');
 if(!el){el=document.createElement('div');el.id='cb-earnings';
  el.style.cssText='font:12px/1.4 system-ui,sans-serif;text-align:center;padding:8px;opacity:.85;color:inherit';
  (document.querySelector('footer')||document.body).appendChild(el);}
 var n=+d.orders||0,u='';
 if(d.updated){var t=new Date(d.updated);if(!isNaN(t))u=', updated '+t.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});}
 el.textContent='Coffeebreak earnings: '+money(d.total_profit_aud)+' from '+n+' order'+(n==1?'':'s')+u;
}
function get(url){return fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){if(typeof j.total_profit_aud!=='number')throw 0;return j})}
function run(){show(null);
 (REMOTE?get(REMOTE).catch(function(){return get('earnings.json')}):get('earnings.json')).then(show).catch(function(){show(null)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
