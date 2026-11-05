// Coffeebreak Records.
(function(){
var FEE=0.026,FIX=0.30,MIN=10;
var F=[{k:'7',n:'7" record',price:113.05,max:600,url:'S1-0'},
{k:'10',n:'10" record',price:190.05,max:1440,url:'S1-1'},
{k:'12',n:'12" LP',price:267.05,max:2040,url:'S1-2'},
{k:'2LP',n:'12" Double LP',price:370.05,max:4080,url:'S1-3'}];
var $=function(i){return document.getElementById(i)},esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return'&#'+c.charCodeAt(0)+';'})};
var all=[],shown=0,PAGE=48,list=[],fmt=F[0],meta;
function mmss(s){return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function clean(t){t=String(t);var m=t.match(/^\s*["“]([^"”]{2,80})["”]/);if(m)t=m[1];t=t.replace(/[*#_`]+/g,'').replace(/^[\s"'“”]+|[\s"'“”,]+$/g,'').replace(/\s+/g,' ').trim();return t||'Untitled'}
function img(id){return 'https://cdn2.suno.ai/image_'+id+'.jpeg'}
function mp3(id){return 'https://suno.com/song/'+id}
function used(){return list.reduce(function(a,s){return a+s[2]},0)}
function filt(){var q=$('sQ').value.toLowerCase().trim(),a=$('s18').checked;return all.filter(function(s){return (a||!s[3])&&(!q||s[1].toLowerCase().indexOf(q)>=0)})}
function render(reset){var r=filt();if(reset){shown=0;$('sGrid').innerHTML=''}
 var part=r.slice(shown,shown+PAGE);shown+=part.length;
 $('sGrid').insertAdjacentHTML('beforeend',part.map(function(s){return '<div class="card"><img class="cv" loading="lazy" src="'+img(s[0])+'" alt="" onerror="this.onerror=null;this.src=\'cb-logo.jpg\'"><img class="cbl" src="cb-logo.jpg" alt="Coffeebreak logo">'+(s[3]?'<span class="b18">18+</span>':'')+'<h3>'+esc(s[1])+'</h3><small>'+mmss(s[2])+'</small><div class="acts"><button data-play="'+s[0]+'">▶ Listen</button><button data-id="'+s[0]+'">Add to my record</button></div></div>'}).join(''));
 $('sCount').textContent=r.length+' songs'+(all.length<meta.count?' (loading...)':'');$('sMore').hidden=shown>=r.length}
function title(){return ($('sTitle').value.trim()||'Coffeebreak')}
function sleeve(){var t=esc(title()),tl=list.map(function(s,i){return '<li>'+esc(s[1])+' <small>'+mmss(s[2])+'</small></li>'}).join('')||'<li><i>Add songs to build your tracklist</i></li>';$('sSleeve').innerHTML='<div class="slv"><img src="cb-logo.jpg" class="slogo" alt="Coffeebreak logo"><h3>'+t+'</h3><p>Coffeebreak Records • '+esc(fmt.n)+'</p><ol>'+tl+'</ol></div><div class="vin"><div class="lbl"><b>'+t+'</b><small>Coffeebreak</small></div></div>'}
function draw(){$('sFmtName').textContent=fmt.n;sleeve();$('sMax').textContent=mmss(fmt.max)+' (fits '+Math.floor(fmt.max/60)+' min)';$('sMin').textContent=mmss(used());$('sPrice').textContent=fmt.price.toFixed(2);
 $('sList').innerHTML=list.map(function(s,i){return '<li>'+esc(s[1])+' ('+mmss(s[2])+')'+(s[3]?' [18+]':'')+' <button data-rm="'+i+'">x</button></li>'}).join('')||'<li>No songs yet. Add one above.</li>';
 $('sFmt').innerHTML=F.map(function(f){return '<button data-f="'+f.k+'" class="'+(f==fmt?'on':'')+'">'+f.n+' – up to '+Math.floor(f.max/60)+' min – $'+f.price.toFixed(2)+'</button>'}).join('')}
function fit(){while(used()>fmt.max){var n=F[F.indexOf(fmt)+1];if(!n)return false;fmt=n}return true}
function add(id){var s=all.find(function(x){return x[0]==id});if(!s||list.indexOf(s)>=0)return;list.push(s);if(!fit()){list.pop();alert('That would be over 68 minutes, the most that fits on a Double LP. Order a second record for more songs.')}draw()}
function body(no){var c=CBOrder,t='COFFEEBREAK RECORDS – SUNO COLLECTION ORDER '+no+'\nCustomer: '+$('sName').value+' | '+$('sEmail').value+' | '+$('sPhone').value+'\nShip to: '+$('sAddr').value+'\n\nRECORD TITLE (print on label AND sleeve): '+title()+'\nSleeve/label must show the full tracklist below.\nFormat: S1 '+fmt.n+'\nSupplier link: '+fmt.url+'\nSupplier cost: see private file (ref '+fmt.url+')\nSale price: $'+fmt.price.toFixed(2)+'\nProfit: see private file'+'\n\nTRACKLIST ('+mmss(used())+' of '+mmss(fmt.max)+'):\n';
 list.forEach(function(s,i){t+=(i+1)+'. '+s[1]+' ('+mmss(s[2])+')'+(s[3]?' [18+]':'')+'\n   Song id: '+s[0]+'\n   Suno: https://suno.com/song/'+s[0]+'\n   Audio: download from the Suno page above (signed in)'+'\n   Cover: '+img(s[0])+'\n'});
 return t+'\nCHECKLIST: 1) Confirm payment arrived. 2) Download MP3s/cover. 3) Order on S1, record title on label + sleeve, full tracklist on the back with the customer\'s address; paste a shared download link to the audio + artwork, tracklist in the notes. 4) Email the customer their tracking.'}
function load(i){fetch('catalog/c'+i+'.json').then(function(r){return r.json()}).then(function(c){c.forEach(function(s){s[1]=clean(s[1])});all=all.concat(c);if(i==0)render(true);else{var r=filt();$('sCount').textContent=r.length+' songs'+(all.length<meta.count?' (loading...)':'');$('sMore').hidden=shown>=r.length}if(i+1<meta.chunks)load(i+1)}).catch(function(){$('sCount').textContent='Some songs could not load. Refresh to try again.'})}
var started=false;function start(){if(started)return;started=true;fetch('catalog/meta.json').then(function(r){return r.json()}).then(function(m){meta=m;load(0)})}
document.addEventListener('DOMContentLoaded',function(){
 start();
 $('sTitle').oninput=sleeve;var tq;$('sQ').oninput=function(){clearTimeout(tq);tq=setTimeout(function(){render(true)},200)};$('s18').onchange=function(){render(true)};
 $('sMore').onclick=function(){render(false)};
 $('sGrid').onclick=function(e){var id=e.target.dataset.id,pl=e.target.dataset.play;if(pl&&window.cbPlay){var s=all.find(function(x){return x[0]==pl});window.cbPlay(pl,s?s[1]:'')}if(id){add(id);e.target.textContent='✓ Added'}};
 $('sList').onclick=function(e){var i=e.target.dataset.rm;if(i!=null){list.splice(+i,1);draw()}};
 $('sFmt').onclick=function(e){var k=e.target.dataset.f;if(!k)return;var f=F.find(function(x){return x.k==k});if(used()>f.max){alert('Your songs are too long for that size. Remove some first.');return}fmt=f;draw()};
 draw();
 CBPay.mount('sPay',{store:'Coffeebreak Records',currency:'AUD',getItems:function(){return list.length?[{name:title()+' – '+fmt.n+': '+list.map(function(s){return s[1]}).join(', '),amount:fmt.price,qty:1}]:[]},
  validate:function(){if(!$('sName').value||!$('sEmail').value||!$('sAddr').value){alert('Please fill in your name, email and shipping address.');return false}return true},
  email:function(){return $('sEmail').value},subject:function(no){return 'Coffeebreak Records order '+no+' – custom '+fmt.n},body:body,orderEmail:'songwriterkaz@gmail.com',onDone:function(){}});

});
window.CBSuno={F:F};
})();
