(function(){
function ok(u){return u&&u.indexOf('PASTE_')!==0}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
var port='All';
function enquire(t){document.getElementById('eItem').value=t;show('enq')}
window.cbEnq=enquire;
function drawDeals(){var g=document.getElementById('grid');g.innerHTML='';
 DEALS.filter(d=>port==='All'||d.port.indexOf(port)===0).sort((a,b)=>a.fromAUD-b.fromAUD).forEach(function(d){
  var link=(CB_AFF.cruiseLines[d.line])||CB_AFF.general,t=d.ship+' - '+d.name+' - '+d.date;
  g.insertAdjacentHTML('beforeend','<div class="card"><div class="ico">🚢</div><small>'+esc(d.line)+' • '+esc(d.ship)+'</small><h3>'+esc(d.name)+'</h3><small>Departs '+esc(d.port)+' • '+esc(d.date)+' • '+d.nights+' nights</small><div class="price">from $'+d.fromAUD.toLocaleString()+' pp</div><small>Checked '+esc(d.checked)+'. Prices change, check at booking.</small>'+(ok(link)?'<a class="btn" target="_blank" rel="sponsored noopener" href="'+esc(link)+'">See deal</a>':'')+'<button onclick="cbEnq(\''+esc(t).replace(/'/g,"")+'\')">Enquire</button></div>')})}
function drawShips(){var g=document.getElementById('sgrid'),m=window.SHIP_MARGIN_AUD||1000;g.innerHTML='';
 S3.forEach(function(s){var p=s.asking==='POA'?'Price on application':esc(s.asking)+' + A$'+m.toLocaleString();
  g.insertAdjacentHTML('beforeend','<div class="card"><div class="ico">⚓</div><h3>'+esc(s.title)+'</h3><small>Built '+esc(s.built)+' • '+esc(s.length)+' • '+esc(s.pax)+'</small><div class="price">'+p+'</div><small>Brokered sale. Listing checked '+esc(s.checked)+'.</small><button onclick="cbEnq(\''+esc(s.title+' ('+s.built+', '+s.length+')').replace(/'/g,"")+' - ship for sale\')">Enquire</button></div>')})}
function show(t){['deals','S3','enq'].forEach(x=>document.getElementById(x).hidden=x!==t);document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t))}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>show(b.dataset.t));
var f=document.getElementById('filters');['All','Sydney','Brisbane'].forEach(function(p){var b=document.createElement('button');b.textContent=p;if(p===port)b.className='on';b.onclick=function(){port=p;f.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));drawDeals()};f.appendChild(b)});
drawDeals();drawShips();})();
