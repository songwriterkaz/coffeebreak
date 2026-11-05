(function(){
var A=[
{n:"Newcastle",c:[-32.9283,151.7817],r:9000,col:"#0ea5a4",s:["Newcastle","Newcastle East","Cooks Hill","The Hill","Bar Beach","Merewether","The Junction","Hamilton","Islington","Wickham","Carrington","Mayfield","Waratah","Lambton","New Lambton","Adamstown","Kotara","Charlestown","Jesmond","Wallsend","Shortland","Birmingham Gardens","Elermore Vale","Stockton"]},
{n:"Lake Macquarie",c:[-33.0500,151.6200],r:15000,col:"#38bdf8",s:["Belmont","Swansea","Warners Bay","Speers Point","Toronto","Cardiff","Glendale","Edgeworth","Valentine","Eleebana","Redhead","Dudley","Whitebridge","Mount Hutton","Windale","Morisset","Bonnells Bay","Teralba","Boolaroo","Caves Beach"]},
{n:"Maitland",c:[-32.7330,151.5590],r:11000,col:"#0b7a79",s:["Maitland","East Maitland","Rutherford","Thornton","Telarah","Lorn","Bolwarra","Morpeth","Tenambit","Metford","Chisholm","Aberglasslyn","Gillieston Heights","Woodberry","Largs"]},
{n:"Port Stephens",c:[-32.7180,152.0500],r:16000,col:"#22c55e",s:["Nelson Bay","Shoal Bay","Corlette","Salamander Bay","Soldiers Point","Anna Bay","Fingal Bay","Medowie","Raymond Terrace","Williamtown","Lemon Tree Passage","Tanilba Bay","Karuah"]},
{n:"Hunter",c:[-32.8350,151.3550],r:17000,col:"#a16207",s:["Cessnock","Kurri Kurri","Weston","Abermain","Kearsley","Pokolbin","Branxton","Greta","Singleton","Dungog","Paterson","Clarence Town"]}];
var all=[];A.forEach(function(a){a.s.forEach(function(x){all.push([x,a.n])})});
var SL=document.getElementById("sublist");
SL.innerHTML=A.map(function(a){return "<p><b>"+a.n+":</b> "+a.s.join(", ")+"</p>"}).join("");
var q=document.getElementById("subq"),r=document.getElementById("subres");
q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();if(!v){r.textContent="";return}
var m=all.filter(function(x){return x[0].toLowerCase().indexOf(v)===0});
r.innerHTML=m.length?"✅ Yes! We clean "+m.slice(0,5).map(function(x){return x[0]+" ("+x[1]+")"}).join(", "):"🤔 Not on our list yet — put your address in the booking form and we'll check if a cleaner can reach you.";});
if(!window.L)return;var LF=window.L;
var map=LF.map("map",{scrollWheelZoom:false}).setView([-32.90,151.70],9);
LF.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
var g=[];A.forEach(function(a){var c=LF.circle(a.c,{radius:a.r,color:a.col,fillColor:a.col,fillOpacity:.25}).addTo(map);
var mk=LF.circleMarker(a.c,{radius:9,color:"#fff",weight:3,fillColor:a.col,fillOpacity:1}).addTo(map).bindPopup("<b>"+a.n+"</b><br>Coffeebreak Cleaning covers this area<br><small>"+a.s.slice(0,6).join(", ")+"…</small>");g.push(c)});
map.fitBounds(LF.featureGroup(g).getBounds(),{padding:[10,10]});
})();
