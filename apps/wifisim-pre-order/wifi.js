'use strict';
/* Coffeebreak Free Wifi finder. Works inside sandboxed frames (itch.io): storage is guarded, no pop-ups,
   every failure ends in a plain message, a Try again button, a typed-place search and a built-in list. */
(function(){
var $=function(s){return document.querySelector(s)};
var map=null,layer=null,busy=false,mem={},lastPlace=null,tilesOk=0,tilesBad=0;
var SERVERS=['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://lz4.overpass-api.de/api/interpreter'];
var HELP={android:'https://support.google.com/android/answer/9075847',ios:'https://support.apple.com/en-au/HT204023',hotspotAndroid:'https://support.google.com/android/answer/9059108'};
/* built into the app, so there is always something useful even with no internet or no location */
var BUILTIN=[
 {n:'Public library',t:'Most public libraries have free wifi for visitors. Ask at the desk for the network name and password.',q:'public library'},
 {n:'Shopping centre',t:'Many shopping centres offer a free guest wifi network. Look for a sign near the information desk or food court.',q:'shopping centre'},
 {n:'Cafe or fast food restaurant',t:'Many cafes and fast food restaurants offer free wifi to customers. Ask staff for the network name.',q:'cafe free wifi'},
 {n:'Community centre or council office',t:'Some community centres and council offices have a free guest network. Ask at reception.',q:'community centre'},
 {n:'Another phone hotspot',t:'A family member can turn on their phone hotspot and share the name and password with you. See Make a hotspot under My SIM.',hot:1}];
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function sget(k){try{var v=localStorage.getItem(k);return v==null?(mem[k]||null):v}catch(e){return mem[k]||null}}
function sset(k,v){mem[k]=v;try{localStorage.setItem(k,v)}catch(e){}}
function jget(k){try{return JSON.parse(sget(k)||'null')}catch(e){return null}}
function dist(a,b,c,d){var R=6371e3,r=Math.PI/180,x=Math.pow(Math.sin((c-a)*r/2),2)+Math.cos(a*r)*Math.cos(c*r)*Math.pow(Math.sin((d-b)*r/2),2);return 2*R*Math.asin(Math.sqrt(x))}
function fmt(m){return m<1000?Math.round(m)+' m':(m/1000).toFixed(1)+' km'}
function isIos(){var u=navigator.userAgent;return /iPhone|iPad|iPod/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function say(t,bad){var s=$('#wstat');if(!s)return;s.textContent=t;s.style.cssText='display:block;font-size:15px;font-weight:700;margin:8px 0;padding:10px;border-radius:10px;background:'+(bad?'#ffe0b2':'#e8f5e9')+';color:#3b2417'}
function showTry(on){var b=$('#wtry');if(b)b.style.display=on?'block':'none'}
function showPlace(on){var b=$('#wplacebox');if(b)b.style.display=on?'block':'none'}
function build(){
 var f=$('#wfind');if(!f||$('#wtry'))return;
 f.style.cssText='display:block;width:100%;min-height:54px;font-size:18px;font-weight:700';
 var st=$('#wstat');if(st){st.setAttribute('role','status');st.setAttribute('aria-live','polite')}
 var t=document.createElement('button');t.type='button';t.id='wtry';t.className='btn';t.textContent='Try again';t.style.cssText='display:none;width:100%;min-height:54px;font-size:20px;font-weight:800;margin:8px 0;background:#2e7d32';t.onclick=find;
 st.parentNode.insertBefore(t,st.nextSibling);
 var p=document.createElement('div');p.id='wplacebox';p.style.cssText='display:none;margin:8px 0';
 p.innerHTML='<label style="font-size:14px;font-weight:700" for="wplace">Or type your town or suburb</label><input id="wplace" placeholder="For example Newcastle NSW" autocomplete="off" style="font-size:16px"><button type="button" class="btn" id="wplacego" style="width:100%;min-height:48px;font-size:17px">Search this place</button>';
 t.parentNode.insertBefore(p,t.nextSibling);
 $('#wplacego').onclick=function(){place($('#wplace').value)};
 $('#wplace').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();place($('#wplace').value)}});
 var m=$('#wmap');if(m)m.style.display='none';
 var j=document.createElement('div');j.id='wjoin';j.className='note';j.style.cssText='font-size:14px';
 var how=isIos()?'<a href="'+HELP.ios+'" target="_blank" rel="noopener">How to join a Wi-Fi network on iPhone</a>':'<a href="'+HELP.android+'" target="_blank" rel="noopener">How to join a Wi-Fi network on Android</a>';
 j.innerHTML='<b>How to join a wifi spot</b><br>This app cannot connect your phone to wifi by itself. Phones only allow that in their own Wi-Fi settings. Open your phone Wi-Fi settings, pick the network name, and type the password if it has one. '+how+'. If the network asks you to sign in, open any web page and a sign in screen will appear.';
 var l=$('#wlist');l.parentNode.insertBefore(j,l.nextSibling);
 var n=document.querySelector('#t-wifi .note');if(n&&n!==j)n.textContent='This finds free public wifi near you, like libraries and cafes. The app cannot create wifi or switch your phone onto it. You join in your phone Wi-Fi settings.';
 showList(null,null,true)}
function ensureMap(lat,lon){
 try{if(!window.L||!$('#wmap'))return;$('#wmap').style.display='block';
  if(!map){map=L.map('wmap').setView([lat,lon],15);
   var tl=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
   tl.on('tileload',function(){tilesOk++});tl.on('tileerror',function(){tilesBad++;if(tilesBad>=4&&!tilesOk){var m=$('#wmap');if(m)m.style.display='none'}});
   tl.addTo(map);layer=L.layerGroup().addTo(map)}else map.setView([lat,lon],15);
  setTimeout(function(){try{map.invalidateSize()}catch(e){}},150)}catch(e){}}
function dirLink(p){return 'https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lon}
function builtinHtml(head){
 var near=lastPlace?'':'';
 return '<h4 style="margin:12px 0 6px">'+head+'</h4>'+BUILTIN.map(function(b){
  var a=b.hot?'<button type="button" class="btn wb-hot" style="padding:8px 12px;font-size:14px">Make a hotspot</button>':'<a class="btn" style="padding:8px 12px;font-size:14px;text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/maps/search/'+encodeURIComponent(b.q+' near me')+'">Find on a map</a>';
  return '<div class="row"><div class="who"><b>'+esc(b.n)+'</b><span style="white-space:normal">'+esc(b.t)+'</span></div>'+a+'</div>'}).join('')}
function showList(d,cachedNote,onlyBuiltin){
 var box=$('#wlist');if(!box)return;var html='';
 if(d&&d.items&&d.items.length){
  ensureMap(d.lat,d.lon);
  if(layer){try{layer.clearLayers();L.circleMarker([d.lat,d.lon],{radius:8,color:'#e91e63'}).addTo(layer).bindPopup('You')}catch(e){}}
  html+=d.items.map(function(p){
   try{if(layer)L.marker([p.lat,p.lon]).addTo(layer).bindPopup(esc(p.name))}catch(e){}
   return '<div class="row"><div class="who"><b>'+esc(p.name)+'</b><span>'+fmt(p.d)+' · '+esc(p.kind)+'</span></div><a class="btn" style="padding:8px 12px;font-size:14px;text-decoration:none" href="'+dirLink(p)+'" target="_blank" rel="noopener">Directions</a></div>'}).join('');
  html+='<p style="font-size:12px">Spots come from OpenStreetMap volunteers and may be out of date. Some need you to be a customer. '+(cachedNote||'')+'</p>'}
 else if(d){ensureMap(d.lat,d.lon);html+='<p>No free wifi spots were listed near this place in OpenStreetMap.</p>'}
 html+=builtinHtml(onlyBuiltin||!(d&&d.items&&d.items.length)?'Places that usually have free wifi':'Other places to try');
 box.innerHTML=html;
 Array.prototype.forEach.call(box.querySelectorAll('.wb-hot'),function(b){b.onclick=function(){var g=$('#ghot');if(g)g.click()}})}
function withTimeout(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){rej(new Error('timeout'))},ms);p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)})})}
function one(u,q){var c=typeof AbortController==='function'?new AbortController():null;var to=c&&setTimeout(function(){c.abort()},16000);
 return fetch(u,{method:'POST',body:'data='+encodeURIComponent(q),signal:c?c.signal:undefined}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(function(j){if(!j||!j.elements)throw new Error('empty');return j.elements}).finally(function(){clearTimeout(to)})}
/* ask every server at once and take the first good answer */
function overpass(lat,lon){
 var q='[out:json][timeout:15];(nwr["internet_access"~"^(wlan|yes|wifi)$"]["internet_access:fee"!~"^(yes|customers)$"]["fee"!="yes"](around:3000,'+lat+','+lon+');nwr["amenity"="library"](around:3000,'+lat+','+lon+'););out center 80;';
 var ps=SERVERS.map(function(u){return one(u,q)});
 if(Promise.any)return Promise.any(ps);
 return new Promise(function(res,rej){var n=0;ps.forEach(function(p){p.then(res,function(){if(++n===ps.length)rej(new Error('all failed'))})})})}
function toItems(el,lat,lon){return el.map(function(e){var la=e.lat!=null?e.lat:(e.center&&e.center.lat),lo=e.lon!=null?e.lon:(e.center&&e.center.lon),t=e.tags||{};if(!la||!lo)return null;
 return{name:t.name||t.brand||(t.amenity==='library'?'Library':'Free wifi spot'),kind:t.amenity==='library'?'library'+(t.internet_access?' · wifi':''):String(t.amenity||t.shop||t.tourism||'wifi').replace(/_/g,' '),lat:la,lon:lo,d:dist(lat,lon,la,lo)}}).filter(Boolean).sort(function(a,b){return a.d-b.d}).slice(0,60)}
function search(lat,lon,label){
 lastPlace={lat:lat,lon:lon,label:label};ensureMap(lat,lon);
 say('Looking for free wifi'+(label?' near '+label:' near you')+'. This can take up to 20 seconds.');showTry(false);
 return overpass(lat,lon).then(function(el){
  var d={lat:lat,lon:lon,items:toItems(el,lat,lon),t:Date.now()};sset('cb_wifi',JSON.stringify(d));
  showList(d);say(d.items.length?'Found '+d.items.length+' spots. Updated '+new Date(d.t).toLocaleTimeString()+'.':'No free wifi spots were listed here. Try another town below, or use the ideas under the list.');showPlace(true);showTry(!d.items.length)
 }).catch(function(){
  var c=jget('cb_wifi');
  if(c&&c.items&&c.items.length){showList(c,'These are your last saved results from '+new Date(c.t).toLocaleString()+'.');say('Not connected to the free map service right now. Showing your last saved list. Tap Try again.',true)}
  else{showList({lat:lat,lon:lon,items:[]});say('Not connected to the free map service right now, so no live list yet. Tap Try again. Meanwhile here are places that usually have free wifi.',true)}
  showPlace(true);showTry(true)})}
function getPos(){return new Promise(function(res,rej){
 if(!navigator.geolocation)return rej({code:0});
 var done=false,t=setTimeout(function(){if(!done){done=true;rej({code:3})}},14000);
 try{navigator.geolocation.getCurrentPosition(function(p){if(done)return;done=true;clearTimeout(t);res(p)},function(e){if(done)return;done=true;clearTimeout(t);rej(e||{code:1})},{enableHighAccuracy:false,timeout:12000,maximumAge:120000})}
 catch(e){if(!done){done=true;clearTimeout(t);rej({code:0})}}})}
function noPos(e){
 var c=jget('cb_wifi');
 var why=e&&e.code===1?'This page is not allowed to see your location. You can allow location in your browser settings and tap Try again, or type your town below.':e&&e.code===3?'Your phone took too long to find where you are. Tap Try again, or type your town below.':'Your location is not available here. Type your town or suburb below.';
 if(c&&c.items&&c.items.length){showList(c,'These are your last saved results from '+new Date(c.t).toLocaleString()+'.');say(why+' Showing your last saved list.',true)}
 else{showList(null,null,true);say(why,true)}
 showPlace(true);showTry(true)}
function find(){
 if(busy)return;busy=true;build();showTry(false);say('Finding where you are...');
 getPos().then(function(p){return search(p.coords.latitude,p.coords.longitude,null)},noPos).then(function(){busy=false},function(){busy=false})}
function place(q){
 q=String(q||'').trim();if(!q){say('Type a town or suburb first.',true);return}
 if(busy)return;busy=true;say('Looking up '+q+'...');showTry(false);
 withTimeout(fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(q)).then(function(r){if(!r.ok)throw new Error('http');return r.json()}),12000).then(function(a){
  if(!a||!a.length){say('That place was not found. Check the spelling and try again.',true);showPlace(true);return}
  return search(parseFloat(a[0].lat),parseFloat(a[0].lon),String(a[0].display_name||q).split(',')[0])},
  function(){say('The free place lookup is not reachable right now. Tap Try again in a moment.',true);showPlace(true);showTry(true)}).then(function(){busy=false},function(){busy=false})}
window.addEventListener('load',function(){build();var f=$('#wfind');if(f)f.onclick=find;
 var c=jget('cb_wifi');var tab=document.querySelector('nav button[data-t="wifi"]');
 if(tab)tab.addEventListener('click',function(){build();if(c&&c.items&&c.items.length&&!map){showList(c,'These are your last saved results from '+new Date(c.t).toLocaleString()+'.');say('Showing your last saved list. Tap Find free wifi near me for a fresh one.')}else if(map)setTimeout(function(){try{map.invalidateSize()}catch(e){}},150)})});
window.__wifiFind=find;window.__wifiPlace=place;
})();
