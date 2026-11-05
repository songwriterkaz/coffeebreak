/* Coffeebreak Radio Scanner: search, seek and scan public internet radio stations.
   Directory: Radio Browser (https only). Presets live in localStorage. */
(function(){
'use strict';
var SERVERS=['https://de1.api.radio-browser.info','https://de2.api.radio-browser.info','https://fi1.api.radio-browser.info','https://at1.api.radio-browser.info'];
var KEY='cbradio:presets:v1', KEYF='cbradio:filters:v1', KEYV='cbradio:vol:v1';
var COUNTRIES=[['AU','Australia'],['NZ','New Zealand'],['US','United States'],['GB','United Kingdom'],['CA','Canada'],['IE','Ireland'],['DE','Germany'],['FR','France'],['ES','Spain'],['IT','Italy'],['NL','Netherlands'],['SE','Sweden'],['NO','Norway'],['FI','Finland'],['PT','Portugal'],['BR','Brazil'],['MX','Mexico'],['AR','Argentina'],['JP','Japan'],['KR','South Korea'],['IN','India'],['ZA','South Africa'],['GR','Greece'],['PL','Poland'],['AT','Austria'],['CH','Switzerland']];
var GENRES=['pop','rock','jazz','classical','country','folk','blues','soul','reggae','electronic','ambient','chillout','lounge','news','talk','80s','90s','oldies','acoustic','indie'];
var PERCOUNT=50;
var $=function(i){return document.getElementById(i)};
var store=(function(){try{var t=window.localStorage;t.setItem('__t','1');t.removeItem('__t');return t}catch(e){var d={};return {getItem:function(k){return d[k]===undefined?null:d[k]},setItem:function(k,v){d[k]=String(v)}}}})();
function jget(k,def){try{var v=JSON.parse(store.getItem(k));return v==null?def:v}catch(e){return def}}
function jset(k,v){try{store.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

var state={results:[],idx:-1,cur:null,scanning:false,scanTimer:null,serverIdx:0,presets:null,playing:false,mode:'idle'};
var presets=jget(KEY,[]);if(!Array.isArray(presets))presets=[];
while(presets.length<10)presets.push(null);presets.length=10;presets[0]=null; /* slot 1 is always Coffeebreak Radio */
function savePresets(){jset(KEY,presets)}

/* ---------- Radio Browser API ---------- */
function api(path){
  var tries=0, n=SERVERS.length;
  function go(){
    if(tries>=n)return Promise.reject(new Error('unreachable'));
    var base=SERVERS[(state.serverIdx+tries)%n];
    var ctl=('AbortController' in window)?new AbortController():null;
    var to=setTimeout(function(){if(ctl)ctl.abort()},9000);
    return fetch(base+path,{headers:{'Accept':'application/json'},signal:ctl?ctl.signal:undefined}).then(function(r){
      clearTimeout(to);
      if(!r.ok)throw new Error('http '+r.status);
      state.serverIdx=(state.serverIdx+tries)%n;
      return r.json();
    }).catch(function(){clearTimeout(to);tries++;return go()});
  }
  return go();
}
function isHttps(u){return typeof u==='string'&&/^https:\/\//i.test(u)}
function clean(list){
  var seen={},out=[];
  (list||[]).forEach(function(s){
    var url=isHttps(s.url_resolved)?s.url_resolved:(isHttps(s.url)?s.url:null);
    if(!url||!s.name||/\.m3u8(\?|$)/i.test(url)||+s.hls===1)return; /* HLS is not playable in every browser */
    var nm=String(s.name).trim();if(!nm)return;
    var k=nm.toLowerCase()+'|'+(s.countrycode||'');
    if(seen[k])return;seen[k]=1;
    out.push({id:s.stationuuid||url,name:nm,url:url,country:s.country||'',cc:s.countrycode||'',tags:String(s.tags||'').split(',').slice(0,4).join(', '),codec:s.codec||'',bitrate:s.bitrate||0,home:isHttps(s.homepage)?s.homepage:''});
  });
  return out;
}
function search(){
  var name=$('scQ').value.trim(), cc=$('scCountry').value, tag=$('scGenre').value;
  jset(KEYF,{q:name,cc:cc,tag:tag});
  var p='/json/stations/search?hidebroken=true&order=votes&reverse=true&limit=150&is_https=true&hls=false';
  if(name)p+='&name='+encodeURIComponent(name);
  if(cc)p+='&countrycode='+encodeURIComponent(cc);
  if(tag)p+='&tag='+encodeURIComponent(tag);
  say('Searching the directory...');
  $('scGo').disabled=true;
  return api(p).then(function(j){
    var r=clean(j).slice(0,PERCOUNT);
    state.results=r;state.idx=-1;renderList();
    say(r.length?(r.length+' stations found. Tap one, or use Seek and Scan.'):'No stations match. Try fewer filters.');
    return r;
  }).catch(function(){
    say('Cannot reach the radio directory right now. Check your connection and try again. Coffeebreak Radio and your presets still work.');
    return [];
  }).then(function(r){$('scGo').disabled=false;return r});
}

/* ---------- audio ---------- */
var A=document.createElement('audio');A.id='scAudio';A.preload='none';A.setAttribute('playsinline','');
A.volume=Math.max(0,Math.min(1,+jget(KEYV,0.8)));
document.body.appendChild(A);
var music=function(){return $('music')};
function pauseLocal(){var m=music();if(m&&!m.paused)m.pause()}
function stopStation(){clearTimeout(state.scanTimer);try{A.pause()}catch(e){}A.removeAttribute('src');try{A.load()}catch(e){}state.playing=false;state.cur=null}
function say(t){var e=$('scStat');if(e)e.textContent=t}
function now(name,meta){$('scName').textContent=name;$('scMeta').textContent=meta||''}
function setMedia(title){try{if('mediaSession' in navigator&&window.MediaMetadata){navigator.mediaSession.metadata=new MediaMetadata({title:title,artist:'Coffeebreak Radio Scanner'});}}catch(e){}}

function playStation(st,opts){
  opts=opts||{};
  pauseLocal();
  clearTimeout(state.scanTimer);
  state.cur=st;state.mode='station';
  A.src=st.url;
  now(st.name,[st.country,st.tags,(st.codec?st.codec:'')+(st.bitrate?' '+st.bitrate+'k':'')].filter(Boolean).join(' · '));
  say('Tuning...');setMedia(st.name);
  var pr=A.play();
  if(pr&&pr.catch)pr.catch(function(){});
  markCur();updatePresets();
  var token=++tuneToken;
  if(state.scanning)armScanTimeout(token);
}
var tuneToken=0;
function armScanTimeout(token){
  /* if the station does not start within 8 seconds, skip it */
  clearTimeout(state.scanTimer);
  state.scanTimer=setTimeout(function(){if(token===tuneToken&&state.scanning&&!state.playing)stepScan(1)},8000);
}
A.addEventListener('playing',function(){
  state.playing=true;
  if(state.mode==='station'){say(state.scanning?'Scanning. Tap Hold to keep this station.':'Playing');}
  if(state.scanning){var token=tuneToken;clearTimeout(state.scanTimer);state.scanTimer=setTimeout(function(){if(token===tuneToken&&state.scanning)stepScan(1)},(+$('scDwell').value||6)*1000)}
});
A.addEventListener('waiting',function(){if(state.mode==='station'&&!state.scanning)say('Buffering...')});
A.addEventListener('error',function(){
  if(state.mode!=='station'||!A.getAttribute('src'))return;
  state.playing=false;
  if(state.scanning){say('Station would not play. Moving on...');clearTimeout(state.scanTimer);state.scanTimer=setTimeout(function(){stepScan(1)},600)}
  else say('This station would not play. It may be offline. Try another.');
});

function playLocal(){
  stopScan(true);
  stopStation();
  state.mode='local';
  var m=music();
  now('Coffeebreak Radio','Songs from the Coffeebreak playlist');
  say('Playing');setMedia('Coffeebreak Radio');
  try{
    var mute=$('mute');
    if(m&&m.muted&&mute)mute.click(); /* page toggles its own muted state and starts music */
    var live=false;try{live=!!(typeof R!=='undefined'&&R.on)}catch(e){}
    if(!live&&typeof window.goLive==='function'){window.goLive()} /* the page's own rotation: pick up the live playlist */
    else if(m){var pr=m.play();if(pr&&pr.catch)pr.catch(function(){say('Tap Skip on the main page to start the playlist.')})}
  }catch(e){}
  markCur();updatePresets();
}
function stopAll(){
  stopScan(true);stopStation();pauseLocal();state.mode='idle';
  now('Stopped','');say('');markCur();updatePresets();
}

/* ---------- seek and scan ---------- */
function ensureResults(){
  if(state.results.length)return Promise.resolve(state.results);
  return search();
}
function stepScan(dir){
  ensureResults().then(function(r){
    if(!r.length){stopScan(true);return}
    var i=state.idx;
    i=(i<0)?(dir>0?0:r.length-1):((i+dir+r.length)%r.length);
    state.idx=i;playStation(r[i]);scrollToCur();
  });
}
function seek(dir){stopScan(true);stepScan(dir)}
function startScan(){
  ensureResults().then(function(r){
    if(!r.length)return;
    state.scanning=true;$('scScan').textContent='Hold';$('scScan').classList.add('on');
    say('Scanning...');stepScan(1);
  });
}
function stopScan(quiet){
  state.scanning=false;clearTimeout(state.scanTimer);
  var b=$('scScan');if(b){b.textContent='Scan';b.classList.remove('on')}
  if(!quiet&&state.playing)say('Playing');
}

/* ---------- presets ---------- */
function updatePresets(){
  var h='';
  for(var i=0;i<10;i++){
    var p=i===0?{name:'Coffeebreak Radio',country:'Our playlist'}:presets[i];
    var on=(i===0&&state.mode==='local')||(i>0&&p&&state.cur&&state.cur.id===p.id&&state.mode==='station');
    h+='<button type="button" data-p="'+i+'" class="'+(on?'sel':'')+'"'+(!p?' disabled':'')+' aria-label="Preset '+(i+1)+'">'+(i+1)+'. '+esc(p?p.name:'Empty')+(p?'<small>'+esc(p.country||'')+'</small>':'')+'</button>';
  }
  $('scPre').innerHTML=h;
  var slot=$('scSlot');if(slot&&!slot._f){slot._f=1;var o='';for(var j=2;j<=10;j++)o+='<option value="'+(j-1)+'">Preset '+j+'</option>';slot.innerHTML=o}
}
function saveToPreset(){
  if(state.mode!=='station'||!state.cur){say('Tune to a station first, then save it.');return}
  var i=+$('scSlot').value;if(!(i>=1&&i<=9))return;
  presets[i]=state.cur;savePresets();updatePresets();
  say('Saved '+state.cur.name+' to preset '+(i+1)+'.');
}
function tunePreset(i){
  if(i===0){playLocal();return}
  var p=presets[i];if(!p)return;
  stopScan(true);playStation(p);
  var k=state.results.findIndex(function(r){return r.id===p.id});state.idx=k;markCur();
}

/* ---------- list ---------- */
function renderList(){
  var h='';
  state.results.forEach(function(s,i){
    h+='<li><button type="button" data-i="'+i+'">'+esc(s.name)+'<small>'+esc([s.country,s.tags,s.bitrate?s.bitrate+'k':''].filter(Boolean).join(' · '))+'</small></button></li>';
  });
  $('scList').innerHTML=h;markCur();
}
function markCur(){
  var bs=$('scList').querySelectorAll('button');
  for(var i=0;i<bs.length;i++)bs[i].classList.toggle('cur',state.mode==='station'&&state.cur&&state.results[i]&&state.results[i].id===state.cur.id);
}
function scrollToCur(){var c=$('scList').querySelector('button.cur');if(c&&c.scrollIntoView){try{c.scrollIntoView({block:'nearest'})}catch(e){}}}

/* ---------- lists for filters ---------- */
function fillCountries(list){
  var sel=$('scCountry'),v=sel.value;
  sel.innerHTML='<option value="">Any country</option>'+list.map(function(c){return '<option value="'+esc(c[0])+'">'+esc(c[1])+'</option>'}).join('');
  sel.value=v;
}
function fillGenres(list){
  var sel=$('scGenre'),v=sel.value;
  sel.innerHTML='<option value="">Any genre</option>'+list.map(function(g){return '<option value="'+esc(g)+'">'+esc(g)+'</option>'}).join('');
  sel.value=v;
}
function loadFilters(){
  api('/json/countries?order=name&hidebroken=true').then(function(j){
    var l=j.filter(function(c){return c.iso_3166_1&&c.stationcount>=5}).map(function(c){return [c.iso_3166_1,c.name]});
    if(l.length>10){fillCountries(l);var f=jget(KEYF,{});if(f.cc)$('scCountry').value=f.cc}
  }).catch(function(){});
  api('/json/tags?order=stationcount&reverse=true&limit=60&hidebroken=true').then(function(j){
    var l=j.map(function(t){return t.name}).filter(function(n){return /^[a-z0-9 &'\-]{2,24}$/i.test(n)}).slice(0,40);
    l.sort();
    if(l.length>10){fillGenres(l);var f=jget(KEYF,{});if(f.tag)$('scGenre').value=f.tag}
  }).catch(function(){});
}

/* ---------- build UI ---------- */
function build(){
  var css=document.createElement('link');css.rel='stylesheet';css.href='scan.css';document.head.appendChild(css);
  var bar=$('bar');
  var b=document.createElement('button');b.id='scBtn';b.type='button';b.textContent='📡 Scanner';
  if(bar){bar.insertBefore(b,$('skip')?$('skip').nextSibling:null)}else document.body.appendChild(b);
  var ov=document.createElement('div');ov.id='scOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Radio Scanner');
  ov.innerHTML=
   '<div id="scIn">'+
   '<div id="scHead"><div class="t"><img src="logo.png" alt="Coffeebreak logo"><h1>Radio Scanner</h1></div><button type="button" id="scClose">Close</button></div>'+
   '<h2>Now tuned</h2><div id="scNow"><div id="scName">Stopped</div><div id="scMeta"></div><div id="scStat" role="status" aria-live="polite"></div>'+
     '<div class="scRow"><button type="button" id="scPrev" aria-label="Seek previous station">◀ Seek</button><button type="button" id="scScan">Scan</button><button type="button" id="scNext" aria-label="Seek next station">Seek ▶</button><button type="button" id="scStop">Stop</button></div>'+
     '<div class="scRow"><label for="scDwell">Scan stays</label><select id="scDwell"><option value="4">4 s</option><option value="6" selected>6 s</option><option value="10">10 s</option></select><label for="scVol">Volume</label><input type="range" id="scVol" min="0" max="1" step="0.05" style="flex:1;min-width:90px"></div>'+
   '</div>'+
   '<h2>Presets</h2><div id="scPre"></div>'+
   '<div class="scRow"><select id="scSlot" aria-label="Preset slot"></select><button type="button" id="scSave">Save current station here</button></div>'+
   '<h2>Find stations</h2>'+
   '<div class="scRow"><input id="scQ" type="search" placeholder="Station name" style="flex:1;min-width:140px" aria-label="Station name"><button type="button" id="scGo">Search</button></div>'+
   '<div class="scRow"><select id="scCountry" aria-label="Country"></select><select id="scGenre" aria-label="Genre"></select></div>'+
   '<ul id="scList"></ul>'+
   '<p class="scDisc">Coffeebreak keeps all rights to its products, designs, apps, name and logo. Buyers and fans may resell the physical products and phones they bought, but may not copy them or make their own versions.</p>'+
   '<p class="scDisc" style="margin-top:6px;border:0;padding-top:0">Other stations belong to their owners; streamed via the public Radio Browser directory.</p>'+
   '</div>';
  document.body.appendChild(ov);
  fillCountries(COUNTRIES);fillGenres(GENRES);
  var f=jget(KEYF,{});$('scQ').value=f.q||'';$('scCountry').value=f.cc||'';$('scGenre').value=f.tag||'';
  $('scVol').value=A.volume;
  updatePresets();
  b.addEventListener('click',function(e){e.stopPropagation();open()});
  $('scClose').onclick=close;
  $('scGo').onclick=function(){stopScan(true);search()};
  $('scQ').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('scGo').click()}});
  $('scPrev').onclick=function(){seek(-1)};
  $('scNext').onclick=function(){seek(1)};
  $('scScan').onclick=function(){state.scanning?stopScan(false):startScan()};
  $('scStop').onclick=stopAll;
  $('scSave').onclick=saveToPreset;
  $('scVol').oninput=function(){A.volume=+this.value;jset(KEYV,A.volume)};
  $('scPre').onclick=function(e){var t=e.target.closest('button[data-p]');if(t&&!t.disabled)tunePreset(+t.getAttribute('data-p'))};
  $('scList').onclick=function(e){var t=e.target.closest('button[data-i]');if(!t)return;stopScan(true);state.idx=+t.getAttribute('data-i');playStation(state.results[state.idx])};
  ov.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
  ov.addEventListener('touchstart',function(e){e.stopPropagation()},{passive:true});
  var loaded=false;
  function open(){ov.classList.add('on');if(!loaded){loaded=true;loadFilters()}try{$('scClose').focus()}catch(e){}}
  function close(){ov.classList.remove('on');try{b.focus()}catch(e){}}
  /* keep the page's own music and the scanner from playing together */
  var m=music();if(m)m.addEventListener('play',function(){if(state.mode==='station'){stopScan(true);stopStation();state.mode='local';now('Coffeebreak Radio','Songs from the Coffeebreak playlist');say('Playing');markCur();updatePresets()}});
  window.CBScan={state:state,search:search,seek:seek,startScan:startScan,stopScan:stopScan,tunePreset:tunePreset,presets:function(){return presets},open:open,close:close,audio:A};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
