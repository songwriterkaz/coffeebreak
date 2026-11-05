/* Coffeebreak Tattoo Supplies checklist */
(function(){
var s=document.currentScript||{},d=(s.dataset||{}),
A=d.accent||'#ff5fa2',B=d.bg||'#1a0a10',F=d.fg||'#ffe9c7',P=d.panel||'#2a1520',FONT=d.font||'system-ui,sans-serif',LOGO=d.logo||'';
var T="https://www.tommyssupplies.com/collections/";
var C=[
{id:'core',t:'Core equipment',shop:[['Rotary machines','rotary-machines'],['Coil machines','coil-machines'],['Power supplies','power-supplies']],i:[
['Rotary machine','Smooth and quiet, handles both lining and shading'],
['Coil machine','The classic choice for traditional work and crisp lines'],
['Wireless machine','Battery powered, no cord to drag around the client'],
['Pen machine','Rotary pen style, handy for realism and fine detail'],
['Digital power supply','Steady, exact voltage so every session runs the same'],
['Charging station','Keeps wireless batteries topped up'],
['Backup power unit','A spare in case your main supply fails mid session'],
['Cords and adapters','Clip cords and plugs that fit all your machines']]},
{id:'grips',t:'Grips, tubes and tips',shop:[['Grips, tips and tubes','grips-tips-tubes']],i:[
['Disposable grips','Single use, quick to swap and very hygienic'],
['Stainless steel tubes','Hard wearing and safe to autoclave'],
['Silicone grips','Soft and cushioned for long sittings'],
['Matching tips','Pair each tip with its needle for even ink flow']]},
{id:'needles',t:'Needles and cartridges',shop:[['Tattoo needles','tattoo-needles']],i:[
['3RL round liner','Fine, delicate lines'],
['5RL round liner','Everyday medium lines'],
['7RL round liner','Bold outlines'],
['7M magnum','Soft shading'],
['11M magnum','Filling and packing large colour areas'],
['5RS round shader','Shading small areas'],
['9RS round shader','Smooth gradients over bigger areas']]},
{id:'inks',t:'Inks and pigments',shop:[['Tattoo inks','tattoo-inks']],i:[
['Lining black','Sharp, clean outlines'],
['Tribal black','Dense, solid blackwork'],
['Grey wash set','Diluted blacks for black and grey shading'],
['Primary and secondary colours','The core palette for colour work'],
['UV and metallic shades','Special effect colours for something different'],
['Highlighting white','Pops of contrast and shine'],
['Mixing white','Lightens colours to build custom tones']]},
{id:'safety',t:'Sanitation and safety',shop:[],i:[
['Medical grade gloves','A fresh pair for every client and every break'],
['Machine bags','Cover the machine so it stays clean'],
['Clip cord sleeves','Wrap cords to stop cross contamination'],
['Surface barriers','Film over trays, chairs and lamps'],
['Autoclave','Sterilises reusable tools'],
['Ultrasonic cleaner','Pre cleans gear before it goes in the autoclave'],
['Sterilisation pouches','Keep sterilised tools sealed until use'],
['Medical grade disinfectant','For benches, chairs and equipment'],
['Hand sanitiser','Within reach at the station'],
['Equipment wipes','Fast clean down between clients']]},
{id:'after',t:'Aftercare',shop:[['Tattoo aftercare','tattoo-aftercare']],i:[
['Fragrance free healing balm','Gentle moisture while the skin heals'],
['Antibacterial soap','For the first washes at home'],
['Second skin bandages','Breathable film that protects fresh work'],
['Non stick pads','Cover without sticking to the tattoo'],
['Wrap film','Quick protective wrap for the trip home']]},
{id:'furn',t:'Studio furniture',shop:[['Shop equipment','shop-equipment']],i:[
['Adjustable client chair','Comfort for the client, good angles for you'],
['Workstation or trolley','Keeps supplies sorted and in reach'],
['Adjustable lighting','Bright, even light for precise work']]},
{id:'tips',t:'Inventory and storage tips',shop:[],i:[
['Keep a supply tracker','Note what you use each week'],
['Set reorder points','Reorder before an item runs out'],
['Buy high use items in bulk','Lower cost per unit'],
['Hold backup stock','Covers you if a delivery is late'],
['Watch the temperature','Store inks away from heat and sunlight'],
['First in, first out','Label stock and use the oldest first'],
['Inspect every shipment','Check seals and dates before use']]}];
var K='cb-tattoo-supplies-v1',st={};try{st=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(st))}catch(e){}}
var css='#cbSupBtn{position:fixed;left:10px;bottom:10px;z-index:99990;background:'+A+';color:'+B+';border:0;border-radius:20px;padding:8px 14px;font:700 13px '+FONT+';cursor:pointer;box-shadow:0 2px 8px #0006}'+
'#cbSup{position:fixed;inset:0;z-index:99995;background:#000a;display:none;align-items:center;justify-content:center;font-family:'+FONT+'}'+
'#cbSup.on{display:flex}#cbSup .w{background:'+P+';color:'+F+';width:min(680px,94vw);max-height:90vh;overflow:auto;border-radius:14px;padding:16px;border:2px solid '+A+'}'+
'#cbSup .hd{display:flex;align-items:center;gap:10px}#cbSup .hd img{width:44px;height:44px;border-radius:8px;object-fit:cover}#cbSup h2{margin:0;flex:1;font-size:20px;color:'+A+'}'+
'#cbSup .x{background:none;border:1px solid '+A+';color:'+F+';border-radius:8px;padding:4px 10px;cursor:pointer}'+
'#cbSup details{margin:8px 0;background:'+B+';border-radius:10px;padding:8px 10px}#cbSup summary{cursor:pointer;font-weight:700}#cbSup summary span{opacity:.7;font-weight:400;font-size:12px}'+
'#cbSup label{display:flex;gap:8px;align-items:flex-start;padding:4px 0;font-size:14px}#cbSup label input{accent-color:'+A+';margin-top:3px}#cbSup label small{display:block;opacity:.75}'+
'#cbSup a.shop{display:inline-block;margin:6px 6px 0 0;background:'+A+';color:'+B+';text-decoration:none;border-radius:8px;padding:5px 10px;font-size:13px;font-weight:700}'+
'#cbSup .bar{height:6px;background:'+B+';border-radius:3px;margin:8px 0}#cbSup .bar i{display:block;height:100%;background:'+A+';border-radius:3px}#cbSup .ft{font-size:12px;opacity:.7;margin-top:8px}';
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
var o=document.createElement('div');o.id='cbSup';
var h='<div class="w"><div class="hd">'+(LOGO?'<img src="'+LOGO+'" alt="Coffeebreak" onerror="this.remove()">':'')+'<h2>☕ Coffeebreak Tattoo Supplies</h2><button class="x" id="cbSupX">Close</button></div>'+
'<div style="font-size:13px;opacity:.85">Tick off what your studio has. Your ticks stay saved on this device.</div><div class="bar"><i id="cbSupBar"></i></div><div id="cbSupCount" style="font-size:12px"></div>';
C.forEach(function(c){h+='<details data-cat="'+c.id+'"><summary>'+c.t+' <span id="cbSupN-'+c.id+'"></span></summary>';
c.i.forEach(function(it,n){var k=c.id+'-'+n;h+='<label><input type="checkbox" data-k="'+k+'"'+(st[k]?' checked':'')+'><span>'+it[0]+'<small>'+it[1]+'</small></span></label>'});
c.shop.forEach(function(s){h+='<a class="shop" target="_blank" rel="noopener" href="'+T+s[1]+'">Shop at Tommy\'s Supplies: '+s[0]+'</a>'});h+='</details>'});
h+='<div class="ft">Coffeebreak. Supply links go to Tommy\'s Supplies.</div></div>';o.innerHTML=h;
function upd(){var t=0,n=0;C.forEach(function(c){var m=0;c.i.forEach(function(_,j){if(st[c.id+'-'+j])m++});t+=c.i.length;n+=m;var e=document.getElementById('cbSupN-'+c.id);if(e)e.textContent=m+'/'+c.i.length});
document.getElementById('cbSupBar').style.width=(t?n*100/t:0)+'%';document.getElementById('cbSupCount').textContent=n+' of '+t+' ready'}
function init(){document.body.appendChild(o);var b=document.createElement('button');b.id='cbSupBtn';b.textContent='☕ Tattoo Supplies';document.body.appendChild(b);
b.onclick=function(){o.classList.add('on')};document.getElementById('cbSupX').onclick=function(){o.classList.remove('on')};
o.addEventListener('click',function(e){if(e.target===o)o.classList.remove('on')});
o.addEventListener('change',function(e){var k=e.target.getAttribute('data-k');if(!k)return;if(e.target.checked)st[k]=1;else delete st[k];save();upd()});upd()}
if(document.body)init();else document.addEventListener('DOMContentLoaded',init);
window.CBSupplies={open:function(){o.classList.add('on')}};
})();
