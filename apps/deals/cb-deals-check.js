/* Coffeebreak Deals code checker for Karen's shop pages. Free, no libraries.
   Usage: <script src="cb-deals-check.js"></script>
          <script>CBDeals.LIST=[...paste from Coffeebreak Deals...]; CBDeals.API='';</script>
          CBDeals.check('BEAN10', 50).then(r=>...)   // does not count a use
          CBDeals.redeem('BEAN10', 50, 'order123').then(r=>...)  // counts one use
   With CBDeals.API set (the Cloudflare Worker URL), limits are counted per person (hashed IP + device).
   Without it, codes are checked offline against a hashed list and limits are counted per device only.
   Honest note: the offline list is hashed so codes are not readable at a glance, but anyone who
   reads the page source can work around it. It is not tamper-proof without the server. */
(function(w){
var D=w.CBDeals=w.CBDeals||{};D.LIST=D.LIST||[];D.API=D.API||'';D.SALT='coffeebreak-deals-v1';
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){D._m=D._m||{};if(v===undefined)return D._m[k]||null;D._m[k]=v}}
D.deviceId=function(){var id=ls('cbdDevice');if(!id){id=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now());ls('cbdDevice',id)}return id};
D.norm=function(c){return String(c||'').trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'')};
D.hash=async function(s){var b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')};
function dec(s){try{return JSON.parse(decodeURIComponent(escape(atob(s))))}catch(e){return null}}
function disc(v,t){t=+t||0;if(v.type=='percent')return Math.round(t*v.value)/100;if(v.type=='dollar'||v.type=='firstorder'||v.type=='bundle')return Math.min(t||1e9,+v.value||0);return 0}
async function offline(code,total,commit){
  code=D.norm(code);if(!code)return{ok:false,reason:'No code entered'};
  var h=await D.hash(D.SALT+'|'+code),row=D.LIST.find(function(r){return r.h==h});
  if(!row)return{ok:false,reason:'Beanbot checked every cup. That code does not exist.'};
  var v=dec(row.d)||{},now=Date.now();
  if(v.starts&&now<Date.parse(v.starts))return{ok:false,reason:'This code is not brewing yet'};
  if(v.expires&&now>Date.parse(v.expires)+86399999)return{ok:false,reason:'This code has gone cold (expired)'};
  if(v.minOrder&&(+total||0)<v.minOrder)return{ok:false,reason:'Minimum order is AUD '+v.minOrder};
  var k='cbdUsed:'+h.slice(0,16),n=+ls(k)||0,lim=v.firstOrder||v.type=='firstorder'?1:v.maxPerPerson;
  if(lim&&n>=lim)return{ok:false,reason:'This device has already used this code '+n+' time(s). Limit is '+lim+'.'};
  if(commit)ls(k,String(n+1));
  return{ok:true,code:code,type:v.type,value:v.value,label:v.label||'',discount:disc(v,total),offline:true,redeemed:!!commit};
}
async function online(path,code,total,order){
  var r=await fetch(D.API.replace(/\/$/,'')+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:code,total:total,order:order||'',deviceId:D.deviceId()})});return r.json();
}
D.check=function(code,total){return D.API?online('/check',code,total).catch(function(){return offline(code,total,false)}):offline(code,total,false)};
D.redeem=function(code,total,order){return D.API?online('/redeem',code,total,order).catch(function(){return{ok:false,reason:'Could not reach the voucher server. Try again in a moment.'}}):offline(code,total,true)};
D.PRIVACY='Privacy: to stop vouchers being reused, we check your IP address in hashed (scrambled) form only, plus a random ID saved in your browser. We never store your actual IP address, and we do not share or sell this information. (Australian Privacy Principles)';
})(window);
