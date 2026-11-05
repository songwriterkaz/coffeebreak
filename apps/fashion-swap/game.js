const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
document.addEventListener('pointerdown',startMusic,{once:true});
// ---- state ----
var G={state:'play',score:0,level:1};
var DEMO=!!window.DEMO;
var cv=$('cv'),cx=cv.getContext('2d');
function P(id){return {img:null,pts:null,outfit:{},zoom:1}}
var photos=[P(),null],cur=0,showB=true;
var PT=['head','sL','sR','hL','hR','aL','aR'],PTN={head:'Head top',sL:'L shoulder',sR:'R shoulder',hL:'L hip',hR:'R hip',aL:'L ankle',aR:'R ankle'};
function defPts(x,y,w,h){return {head:[x+w*.5,y+h*.04],sL:[x+w*.30,y+h*.20],sR:[x+w*.70,y+h*.20],hL:[x+w*.36,y+h*.50],hR:[x+w*.64,y+h*.50],aL:[x+w*.40,y+h*.94],aR:[x+w*.60,y+h*.94]}}
// ---- body map: u in [-1,1] across, v: -1 head top, 0 shoulders, 1 hips, 2 ankles ----
function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
function mapper(pts,fw){fw=fw||1;return function(u,v){var L,R;
 if(v<0){var mid=lerp(pts.sL,pts.sR,.5),c=lerp(mid,pts.head,-v),hw=(pts.sR[0]-pts.sL[0])*.5;var dx=(pts.sR[0]-pts.sL[0]),dy=(pts.sR[1]-pts.sL[1]),n=Math.hypot(dx,dy)||1;return [c[0]+u*hw*fw*dx/n,c[1]+u*hw*fw*dy/n]}
 if(v<=1){L=lerp(pts.sL,pts.hL,v);R=lerp(pts.sR,pts.hR,v)}else{var t=v-1;L=lerp(pts.hL,pts.aL,t);R=lerp(pts.hR,pts.aR,t)}
 var m=lerp(L,R,.5);return [m[0]+(R[0]-m[0])*u*fw,m[1]+(R[1]-m[1])*u*fw]}}
// leg mapper: each leg own column; side -1 left, 1 right; u in [-1,1] across that leg
function legMap(pts,fw){fw=fw||1;return function(side,u,v){var hip=side<0?pts.hL:pts.hR,an=side<0?pts.aL:pts.aR,hm=lerp(pts.hL,pts.hR,.5);var top=lerp(hm,hip,.5+.5*0),c=lerp(lerp(hm,hip,.55),an,v);var hw=Math.hypot(pts.hR[0]-pts.hL[0],pts.hR[1]-pts.hL[1])*.26*fw*(1-.35*v);return [c[0]+u*hw,c[1]]}}
// ---- patterns & fabrics ----
var PATS=['Solid','Stripes','Polka dots','Check','Tartan','Florals','Gothic skulls & roses','Leopard','Hearts','Stars','Lace','Tie-dye'];
var FABS=['Cotton','Denim','Knit','Leather','Silk','Velvet','Linen','Sequins','Fleece (soft)','Bamboo (soft)'];
var patCache={};
function hex2(c,a){var n=parseInt(c.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function rnd(s){return function(){s=(s*16807)%2147483647;return s/2147483647}}
function skull(g,x,y,s,c){g.fillStyle=c;g.beginPath();g.arc(x,y,s,0,7);g.fill();g.fillRect(x-s*.55,y+s*.5,s*1.1,s*.7);g.fillStyle='rgba(0,0,0,.85)';g.beginPath();g.arc(x-s*.38,y,s*.27,0,7);g.arc(x+s*.38,y,s*.27,0,7);g.fill();g.beginPath();g.moveTo(x,y+s*.2);g.lineTo(x-s*.12,y+s*.45);g.lineTo(x+s*.12,y+s*.45);g.fill()}
function rose(g,x,y,s,c){g.fillStyle=c;for(var i=0;i<5;i++){var a=i*1.256;g.beginPath();g.arc(x+Math.cos(a)*s*.45,y+Math.sin(a)*s*.45,s*.5,0,7);g.fill()}g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.2;g.beginPath();for(var t=0;t<12;t+=.3)g.lineTo(x+Math.cos(t)*t*s*.05,y+Math.sin(t)*t*s*.05);g.stroke();g.fillStyle='#2f6b34';g.beginPath();g.ellipse(x+s*.9,y+s*.6,s*.45,s*.2,.6,0,7);g.fill()}
function heart(g,x,y,s,c){g.fillStyle=c;g.beginPath();g.moveTo(x,y+s*.9);g.bezierCurveTo(x-s*1.4,y-s*.2,x-s*.5,y-s*1.1,x,y-s*.3);g.bezierCurveTo(x+s*.5,y-s*1.1,x+s*1.4,y-s*.2,x,y+s*.9);g.fill()}
function star(g,x,y,s,c){g.fillStyle=c;g.beginPath();for(var i=0;i<10;i++){var r=i%2?s*.45:s,a=i*Math.PI/5-Math.PI/2;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.fill()}
function makeTile(st){var key=JSON.stringify(st);if(patCache[key])return patCache[key];var S=Math.round(64*(st.scale||1)),t=document.createElement('canvas');t.width=t.height=S;var g=t.getContext('2d'),c1=st.color,c2=st.color2,r=rnd(7);g.fillStyle=c1;g.fillRect(0,0,S,S);var k=S/64;
 switch(st.pattern){case 'Stripes':g.fillStyle=c2;for(var i=0;i<S;i+=16*k)g.fillRect(i,0,7*k,S);break;
 case 'Polka dots':g.fillStyle=c2;[[16,16],[48,48]].forEach(function(p){g.beginPath();g.arc(p[0]*k,p[1]*k,7*k,0,7);g.fill()});break;
 case 'Check':g.fillStyle=c2;g.fillRect(0,0,32*k,32*k);g.fillRect(32*k,32*k,32*k,32*k);break;
 case 'Tartan':g.fillStyle=hex2(c2,.55);g.fillRect(0,20*k,S,14*k);g.fillRect(20*k,0,14*k,S);g.fillStyle=hex2(c2,.9);g.fillRect(0,50*k,S,3*k);g.fillRect(50*k,0,3*k,S);break;
 case 'Florals':for(var i=0;i<4;i++){var x=(i%2)*32*k+16*k+(i>1?8*k:0),y=(i>>1)*32*k+16*k;g.fillStyle=c2;for(var j=0;j<5;j++){var a=j*1.256;g.beginPath();g.arc(x+Math.cos(a)*5*k,y+Math.sin(a)*5*k,4*k,0,7);g.fill()}g.fillStyle='#ffd84a';g.beginPath();g.arc(x,y,2.5*k,0,7);g.fill()}break;
 case 'Gothic skulls & roses':skull(g,18*k,18*k,8*k,'#f1ead8');rose(g,46*k,46*k,9*k,c2);rose(g,50*k,12*k,5*k,c2);skull(g,14*k,50*k,5*k,'#f1ead8');break;
 case 'Leopard':for(var i=0;i<9;i++){var x=r()*S,y=r()*S,s=(4+r()*4)*k;g.fillStyle=c2;g.beginPath();g.ellipse(x,y,s,s*.75,r()*3,0,7);g.fill();g.fillStyle=c1;g.beginPath();g.ellipse(x,y,s*.5,s*.35,0,0,7);g.fill()}break;
 case 'Hearts':heart(g,16*k,18*k,7*k,c2);heart(g,48*k,50*k,7*k,c2);break;
 case 'Stars':star(g,16*k,16*k,8*k,c2);star(g,48*k,48*k,8*k,c2);break;
 case 'Lace':g.strokeStyle=hex2(c2,.9);g.lineWidth=1.3*k;for(var i=0;i<3;i++)for(var j=0;j<3;j++){g.beginPath();g.arc(i*32*k,j*32*k,12*k,0,7);g.stroke();g.beginPath();g.arc(i*32*k,j*32*k,5*k,0,7);g.stroke()}break;
 case 'Tie-dye':for(var i=8;i>0;i--){g.fillStyle=i%2?c2:c1;g.globalAlpha=.6;g.beginPath();g.arc(32*k,32*k,i*5*k,0,7);g.fill()}g.globalAlpha=1;break}
 // fabric texture
 var f=st.fabric;g.globalAlpha=1;
 if(f=='Denim'){g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;for(var i=-S;i<S;i+=3){g.beginPath();g.moveTo(i,0);g.lineTo(i+S,S);g.stroke()}}
 else if(f=='Knit'){g.strokeStyle='rgba(0,0,0,.18)';for(var y=0;y<S;y+=6)for(var x=0;x<S;x+=6){g.beginPath();g.moveTo(x,y);g.lineTo(x+3,y+5);g.lineTo(x+6,y);g.stroke()}}
 else if(f=='Leather'){for(var i=0;i<60;i++){g.fillStyle='rgba(0,0,0,'+(r()*.12)+')';g.fillRect(r()*S,r()*S,2,2)}var gr=g.createLinearGradient(0,0,S,S);gr.addColorStop(0,'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
 else if(f=='Silk'){var gr=g.createLinearGradient(0,0,S,0);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(255,255,255,.22)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
 else if(f=='Velvet'){var gr=g.createRadialGradient(S/2,S/2,2,S/2,S/2,S*.7);gr.addColorStop(0,'rgba(255,255,255,.1)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fillRect(0,0,S,S)}
 else if(f=='Linen'){g.fillStyle='rgba(255,255,255,.08)';for(var i=0;i<S;i+=2){g.fillRect(0,i,S,1)}g.fillStyle='rgba(0,0,0,.06)';for(var i=0;i<S;i+=3)g.fillRect(i,0,1,S)}
 else if(f=='Sequins'){for(var y=0;y<S;y+=6)for(var x=(y/6%2)*3;x<S;x+=6){g.fillStyle='rgba(255,255,255,'+(.15+r()*.45)+')';g.beginPath();g.arc(x,y,2.2,0,7);g.fill()}}
 else if(f.indexOf('soft')>0){for(var i=0;i<120;i++){g.fillStyle='rgba(255,255,255,'+(r()*.08)+')';g.beginPath();g.arc(r()*S,r()*S,1.5+r()*2,0,7);g.fill()}}
 else{for(var i=0;i<80;i++){g.fillStyle='rgba(0,0,0,'+(r()*.06)+')';g.fillRect(r()*S,r()*S,1,1)}}
 return patCache[key]=t}
// ---- wardrobe ----
// shapes are lists of [u,v] in body space; 'legs' shapes use per-leg mapping
function T(u1,u2,v2,sl){return [[-1.05,0],[-.35,-.08],[0,.02],[.35,-.08],[1.05,0]].concat(sl?[[1.05+sl*.35,sl*.9],[.8+sl*.2,sl*.95],[.9,.25]]:[[.95,.25]]).concat([[u2,v2],[-u2,v2]]).concat(sl?[[-.9,.25],[-.8-sl*.2,sl*.95],[-1.05-sl*.35,sl*.9]]:[[-.95,.25]])}
var ITEMS=[
{id:'tee',n:'T-shirt',c:'Tops',sh:T(1,.98,.9,.35),col:'#ffffff'},
{id:'tank',n:'Tank top',c:'Tops',sh:[[-.6,0],[-.3,.05],[0,.15],[.3,.05],[.6,0],[.85,.3],[.95,.88],[-.95,.88],[-.85,.3]],col:'#222222'},
{id:'crop',n:'Pink crop top',c:'Tops',sh:T(1,.95,.5,.25),col:'#ff8fc0'},
{id:'blouse',n:'Puff-sleeve blouse',c:'Tops',sh:T(1,1,.92,.55),col:'#f6efe2',puff:1},
{id:'hoodie',n:'Hoodie',c:'Tops',sh:T(1,1.05,1.05,.95),col:'#7a5cff',hood:1},
{id:'corset',n:'Corset top',c:'Tops',sh:[[-.85,.05],[-.4,.12],[0,.2],[.4,.12],[.85,.05],[.75,.55],[.9,.98],[0,1.05],[-.9,.98],[-.75,.55]],col:'#1a0a10',lace:1},
{id:'jeans',n:'Skinny jeans',c:'Bottoms',legs:1,top:.95,len:.97,wid:1.0,col:'#3a5a9a',fab:'Denim'},
{id:'wide',n:'Wide-leg trousers',c:'Bottoms',legs:1,top:.95,len:.99,wid:1.6,flare:1,col:'#c9a27a',fab:'Linen'},
{id:'shorts',n:'Denim shorts',c:'Bottoms',legs:1,top:.95,len:.28,wid:1.3,col:'#6d8fc9',fab:'Denim'},
{id:'leggings',n:'Leggings',c:'Bottoms',legs:1,top:.92,len:.96,wid:.85,col:'#111111',fab:'Knit'},
{id:'mini',n:'Mini skirt',c:'Bottoms',sh:[[-.95,.92],[.95,.92],[1.25,1.38],[-1.25,1.38]],col:'#c0102a'},
{id:'midi',n:'Pleated midi skirt',c:'Bottoms',sh:[[-.95,.92],[.95,.92],[1.6,1.65],[-1.6,1.65]],col:'#e8c9a0',pleat:1},
{id:'slip',n:'Slip dress',c:'Dresses',sh:[[-.7,.02],[-.3,.1],[0,.18],[.3,.1],[.7,.02],[.8,.5],[.95,1],[1.35,1.6],[-1.35,1.6],[-.95,1],[-.8,.5]],col:'#e8a0b0',fab:'Silk'},
{id:'maxi',n:'Floral maxi dress',c:'Dresses',sh:T(1,.95,.55,.3).slice(0,-2).concat([[1.0,1],[1.7,1.95],[-1.7,1.95],[-1.0,1]]).concat(T(1,.95,.55,.3).slice(-3)),col:'#f6d6e0',pat:'Florals',col2:'#c0306a'},
{id:'gown',n:'Ball gown',c:'Dresses',sh:[[-.9,.05],[0,.22],[.9,.05],[.8,.55],[.95,.95],[2.2,1.98],[-2.2,1.98],[-.95,.95],[-.8,.55]],col:'#6a1a8a',fab:'Velvet'},
{id:'party',n:'Sequin party dress',c:'Dresses',sh:[[-1,0],[0,.12],[1,0],[.85,.5],[1,1],[1.2,1.35],[-1.2,1.35],[-1,1],[-.85,.5]],col:'#d4af37',fab:'Sequins'},
{id:'denimj',n:'Denim jacket',c:'Jackets',sh:T(1,1.1,.95,.95),col:'#4a6fa5',fab:'Denim',open:1},
{id:'leather',n:'Leather biker jacket',c:'Jackets',sh:T(1,1.1,.85,.95),col:'#161616',fab:'Leather',open:1},
{id:'blazer',n:'Blazer',c:'Jackets',sh:T(1,1.1,1.1,.95),col:'#2a2a3a',open:1},
{id:'trench',n:'Trench coat',c:'Jackets',sh:T(1,1.1,1.1,.95).slice(0,7).concat([[1.4,1.7],[-1.4,1.7]]).concat(T(1,1.1,1.1,.95).slice(-3)),col:'#b8925a',open:1},
{id:'sneak',n:'Sneakers',c:'Shoes',shoe:'sneak',col:'#ffffff'},
{id:'boots',n:'Platform boots',c:'Shoes',shoe:'boot',col:'#111111',fab:'Leather'},
{id:'heels',n:'Heels',c:'Shoes',shoe:'heel',col:'#c0102a'},
{id:'beanie',n:'Beanie',c:'Hats',hat:'beanie',col:'#e8a0b0',fab:'Knit'},
{id:'cap',n:'Baseball cap',c:'Hats',hat:'cap',col:'#222266'},
{id:'sunhat',n:'Sun hat',c:'Hats',hat:'sun',col:'#e8d3a0',fab:'Linen'},
{id:'witch',n:'Witchy hat',c:'Hats',hat:'witch',col:'#1a0a10',fab:'Velvet'},
{id:'bag',n:'Silver bag',c:'Accessories',acc:'bag',col:'#c8ccd4',fab:'Leather'},
{id:'scarf',n:'Scarf',c:'Accessories',acc:'scarf',col:'#c0102a',pat:'Tartan',col2:'#1a3a2a'},
{id:'neck',n:'Pearl necklace',c:'Accessories',acc:'neck',col:'#f6f1e6'},
{id:'shades',n:'Sunglasses',c:'Accessories',acc:'shades',col:'#111111'},
{id:'belt',n:'Belt',c:'Accessories',acc:'belt',col:'#5a3a1a',fab:'Leather'},
{id:'clips',n:'Butterfly clips',c:'Accessories',acc:'clips',col:'#9ad8ff'},
// No Inside Out sensory-friendly collection
{id:'nio_tee',n:'Seamless tee',c:'Tops',nio:1,sh:T(1,1.02,.95,.35),col:'#b9d8c8',fab:'Bamboo (soft)',note:'Seamless knit, no side seams, tagless print label.'},
{id:'nio_hood',n:'Soft cloud hoodie',c:'Tops',nio:1,sh:T(1,1.1,1.05,.95),col:'#cdbdf0',fab:'Fleece (soft)',hood:1,note:'Brushed inside, flat seams, tagless, no drawstrings.'},
{id:'nio_card',n:'Cosy wrap cardigan',c:'Jackets',nio:1,sh:T(1,1.15,1.2,.95),col:'#f0d9c0',fab:'Knit',open:1,note:'Loose, soft, no buttons or zips.'},
{id:'nio_jog',n:'Tagless soft joggers',c:'Bottoms',nio:1,legs:1,top:.95,len:.95,wid:1.2,col:'#8a9ab0',fab:'Fleece (soft)',note:'Soft wide waistband, no tags, no scratchy seams.'},
{id:'nio_leg',n:'Seamless leggings',c:'Bottoms',nio:1,legs:1,top:.92,len:.96,wid:.85,col:'#3a3a5a',fab:'Bamboo (soft)',note:'Seamless, high-rise, tagless.'},
{id:'nio_dress',n:'Comfy jersey dress',c:'Dresses',nio:1,sh:T(1,1,.6,.3).slice(0,-2).concat([[1.05,1],[1.3,1.6],[-1.3,1.6],[-1.05,1]]).concat(T(1,1,.6,.3).slice(-3)),col:'#e8b4b8',fab:'Bamboo (soft)',note:'Stretchy jersey, no zips, tagless.'},
{id:'nio_shoe',n:'Seamless slip-ons',c:'Shoes',nio:1,shoe:'sneak',col:'#d0c8e8',fab:'Knit',note:'No laces, seamless sock-style upper.'}
];
var DEMO_IDS=['tee','crop','jeans','mini','slip','denimj','sneak','beanie','bag','nio_tee'];
ITEMS.forEach(function(it){it.lock=DEMO&&DEMO_IDS.indexOf(it.id)<0});
var CATS=['Tops','Bottoms','Dresses','Jackets','Shoes','Hats','Accessories'];
var LAYER={Bottoms:1,Dresses:2,Tops:3,Jackets:4,Shoes:5,Accessories:6,Hats:7};
function byId(id){for(var i=0;i<ITEMS.length;i++)if(ITEMS[i].id==id)return ITEMS[i]}
function defStyle(it){return {color:it.col,color2:it.col2||'#e8a0b0',pattern:it.pat||'Solid',fabric:it.fab||'Cotton',scale:1}}
// ---- drawing ----
function fillPath(st,m,shade){cx.save();var pat=cx.createPattern(makeTile(st),'repeat');cx.fillStyle=pat;cx.fill();if(shade!==false){var b=m.bb;var gr=cx.createLinearGradient(b[0],0,b[2],0);gr.addColorStop(0,'rgba(0,0,0,.28)');gr.addColorStop(.3,'rgba(255,255,255,.06)');gr.addColorStop(.7,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.3)');cx.fillStyle=gr;cx.fill()}cx.strokeStyle='rgba(0,0,0,.45)';cx.lineWidth=1.5;cx.stroke();cx.restore()}
function polyPath(pts,M,steps){// subdivide edges so warp bends shapes
 cx.beginPath();var bb=[1e9,1e9,-1e9,-1e9];for(var i=0;i<pts.length;i++){var a=pts[i],b=pts[(i+1)%pts.length];for(var s=0;s<steps;s++){var t=s/steps,p=M(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);if(!i&&!s)cx.moveTo(p[0],p[1]);else cx.lineTo(p[0],p[1]);bb[0]=Math.min(bb[0],p[0]);bb[2]=Math.max(bb[2],p[0])}}cx.closePath();return {bb:bb}}
function line(M,pts,w,c){cx.beginPath();pts.forEach(function(q,i){var p=M(q[0],q[1]);i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])});cx.strokeStyle=c;cx.lineWidth=w;cx.stroke()}
function drawItem(it,st,ph){var pts=ph.pts,fw=(ph.fitW||1),M=mapper(pts,fw),sw=Math.hypot(pts.sR[0]-pts.sL[0],pts.sR[1]-pts.sL[1]);
 if(it.sh){var m=polyPath(it.sh,M,6);fillPath(st,m);
  if(it.open){line(M,[[0,.05],[0,1.1]],2,'rgba(0,0,0,.5)');line(M,[[-.35,-.05],[-.15,.4],[0,.45]],2,'rgba(0,0,0,.4)');line(M,[[.35,-.05],[.15,.4],[0,.45]],2,'rgba(0,0,0,.4)')}
  if(it.hood){var m2=polyPath([[-.6,0],[-.55,-.35],[0,-.25],[.55,-.35],[.6,0],[0,.12]],M,4);fillPath(st,m2)}
  if(it.pleat)for(var u=-1.2;u<=1.2;u+=.3)line(M,[[u*.75,.95],[u,1.62]],1.2,'rgba(0,0,0,.25)');
  if(it.lace)for(var v=.25;v<.95;v+=.12){line(M,[[-.12,v],[.12,v+.06]],1.5,'#e8a0b0');line(M,[[.12,v],[-.12,v+.06]],1.5,'#e8a0b0')}
  if(it.puff){[-1,1].forEach(function(s){var p=M(s*1.15,.15);cx.beginPath();cx.ellipse(p[0],p[1],sw*.13,sw*.11,0,0,7);fillPath(st,{bb:[p[0]-sw*.13,0,p[0]+sw*.13,0]})})}
  if(it.nio){cx.save();var p=M(0,.12);cx.fillStyle='rgba(255,255,255,.75)';cx.font='bold '+Math.max(8,sw*.07)+'px Georgia';cx.textAlign='center';cx.fillText('No Inside Out',p[0],p[1]);cx.restore()}
  return}
 if(it.legs){var LM=legMap(pts,fw*it.wid);var top=it.top,len=it.len;
  // waist band region
  var m=polyPath([[-.98,top],[.98,top],[1,1.08],[-1,1.08]],M,4);fillPath(st,m);
  [-1,1].forEach(function(s){cx.beginPath();var seq=[];for(var i=0;i<=8;i++)seq.push([-1,i/8*len]);for(var i=8;i>=0;i--)seq.push([1,i/8*len]);var bb=[1e9,0,-1e9,0];seq.forEach(function(q,i){var fl=it.flare?1+q[1]*.6:1,p=LM(s,q[0]*fl*1.15,q[1]+.0);if(q[1]<.05){p=LM(s,q[0]*1.25,.02)}i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]);bb[0]=Math.min(bb[0],p[0]);bb[2]=Math.max(bb[2],p[0])});cx.closePath();fillPath(st,{bb:bb})});return}
 if(it.shoe){[-1,1].forEach(function(s){var a=s<0?pts.aL:pts.aR,w=sw*.17,h=w*(it.shoe=='boot'?1.6:.6);cx.beginPath();if(it.shoe=='heel'){cx.moveTo(a[0]-w*.5,a[1]-h*.4);cx.quadraticCurveTo(a[0]+w*s*.2,a[1]-h*.6,a[0]+w*.6*s,a[1]+h*.5);cx.lineTo(a[0]-w*.5*s,a[1]+h*.5);cx.closePath()}else{cx.moveTo(a[0]-w*.55,a[1]-h);cx.lineTo(a[0]+w*.55,a[1]-h);cx.lineTo(a[0]+w*.6+w*.4*s,a[1]+w*.35);cx.lineTo(a[0]-w*.6+w*.4*s,a[1]+w*.35);cx.closePath()}fillPath(st,{bb:[a[0]-w,0,a[0]+w,0]});if(it.shoe!='heel'){cx.fillStyle=it.shoe=='boot'?'#222':'#eee';cx.fillRect(a[0]-w*.6+w*.4*s,a[1]+w*.25,w*1.2,w*(it.shoe=='boot'?.35:.15))}});return}
 if(it.hat){var hd=pts.head,w=sw*.42;cx.beginPath();
  if(it.hat=='beanie'){cx.ellipse(hd[0],hd[1]+w*.25,w*.62,w*.5,0,Math.PI,0);cx.lineTo(hd[0]+w*.64,hd[1]+w*.4);cx.lineTo(hd[0]-w*.64,hd[1]+w*.4);cx.closePath();fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]});cx.beginPath();cx.arc(hd[0],hd[1]-w*.28,w*.14,0,7);fillPath(st,{bb:[0,0,0,0]},false)}
  else if(it.hat=='cap'){cx.ellipse(hd[0],hd[1]+w*.3,w*.6,w*.45,0,Math.PI,0);cx.closePath();fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]});cx.beginPath();cx.ellipse(hd[0]+w*.35,hd[1]+w*.32,w*.55,w*.1,0,0,7);fillPath(st,{bb:[0,0,0,0]},false)}
  else if(it.hat=='sun'){cx.ellipse(hd[0],hd[1]+w*.32,w*1.2,w*.22,0,0,7);fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]});cx.beginPath();cx.ellipse(hd[0],hd[1]+w*.25,w*.55,w*.42,0,Math.PI,0);cx.closePath();fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]})}
  else{cx.ellipse(hd[0],hd[1]+w*.3,w*1.05,w*.2,0,0,7);fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]});cx.beginPath();cx.moveTo(hd[0]-w*.5,hd[1]+w*.28);cx.lineTo(hd[0]+w*.3,hd[1]-w*1.4);cx.lineTo(hd[0]+w*.5,hd[1]+w*.28);cx.closePath();fillPath(st,{bb:[hd[0]-w,0,hd[0]+w,0]})}return}
 if(it.acc){var hd=pts.head,sm=lerp(pts.sL,pts.sR,.5),hy=lerp(hd,sm,.5);
  if(it.acc=='bag'){var p=M(1.25,.85),w=sw*.32;cx.beginPath();cx.arc(p[0],p[1]-w*.35,w*.35,Math.PI,0);cx.strokeStyle=st.color;cx.lineWidth=4;cx.stroke();cx.beginPath();cx.roundRect?cx.roundRect(p[0]-w*.5,p[1]-w*.35,w,w*.7,8):cx.rect(p[0]-w*.5,p[1]-w*.35,w,w*.7);fillPath(st,{bb:[p[0]-w*.5,0,p[0]+w*.5,0]})}
  else if(it.acc=='scarf'){var m=polyPath([[-.55,-.12],[.55,-.12],[.6,.1],[.3,.12],[.35,.75],[.12,.75],[.05,.15],[-.55,.1]],M,4);fillPath(st,m)}
  else if(it.acc=='neck'){for(var t=0;t<=1;t+=.06){var p=M(-.38+t*.76,.08+Math.sin(t*Math.PI)*.12);cx.beginPath();cx.arc(p[0],p[1],sw*.022,0,7);fillPath(st,{bb:[p[0]-3,0,p[0]+3,0]},false)}}
  else if(it.acc=='shades'){var e=lerp(hd,sm,.4),w=sw*.12;[-1,1].forEach(function(s){cx.beginPath();cx.ellipse(e[0]+s*w*1.05,e[1],w,w*.65,0,0,7);fillPath(st,{bb:[0,0,0,0]},false)});line(function(u,v){return [e[0]+u,e[1]]},[[-w*.1,0],[w*.1,0]],3,st.color)}
  else if(it.acc=='belt'){var m=polyPath([[-1,.88],[1,.88],[1,.96],[-1,.96]],M,6);fillPath(st,m);var p=M(0,.92);cx.strokeStyle='#d4af37';cx.lineWidth=3;cx.strokeRect(p[0]-sw*.05,p[1]-sw*.04,sw*.1,sw*.08)}
  else if(it.acc=='clips'){var w=sw*.07;[[-.5,-.1],[.45,-.25],[-.2,-.35]].forEach(function(o){var x=hd[0]+o[0]*sw*.4,y=hd[1]+sw*.25+o[1]*sw*.4;[-1,1].forEach(function(s){cx.beginPath();cx.ellipse(x+s*w*.5,y,w*.5,w*.35,s*.5,0,7);fillPath(st,{bb:[0,0,0,0]},false)})})}}}
function drawMannequin(x,y,w,h){cx.save();cx.fillStyle='#d8b8a8';var pts=defPts(x,y,w,h);var M=mapper(pts);cx.beginPath();var hd=pts.head,sw=pts.sR[0]-pts.sL[0];cx.ellipse(hd[0],hd[1]+sw*.33,sw*.24,sw*.3,0,0,7);cx.fill();polyPath([[-.18,-.15],[.18,-.15],[.2,0],[1,.02],[1.1,.4],[1.25,.95],[1.1,.98],[.95,.45],[.85,.6],[.95,1],[.2,1.05],[0,1.1],[-.2,1.05],[-.95,1],[-.85,.6],[-.95,.45],[-1.1,.98],[-1.25,.95],[-1.1,.4],[-1,.02],[-.2,0]],M,4);cx.fill();var LM=legMap(pts);[-1,1].forEach(function(s){cx.beginPath();for(var i=0;i<=8;i++){var p=LM(s,-1.05,i/8);i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1])}for(var i=8;i>=0;i--){var p=LM(s,1.05,i/8);cx.lineTo(p[0],p[1])}cx.fill()});cx.restore()}
function layout(ph,i,n){var W=cv.width/n,H=cv.height,x0=i*W;if(ph.img){var s=Math.min(W/ph.img.width,H/ph.img.height)*ph.zoom,w=ph.img.width*s,h=ph.img.height*s;return [x0+(W-w)/2,(H-h)/2,w,h]}var h=H*.92*ph.zoom,w=h*.42;return [x0+(W-w)/2,(H-h)/2,w,h]}
function render(){cx.fillStyle='#24101a';cx.fillRect(0,0,cv.width,cv.height);var list=photos.filter(function(p,i){return p&&(i==0||showB)}),n=list.length;
 list.forEach(function(ph,i){var r=layout(ph,i,n);ph.rect=r;if(!ph.npts)ph.npts=defPts(0,0,1,1);ph.pts={};PT.forEach(function(k){ph.pts[k]=[r[0]+ph.npts[k][0]*r[2],r[1]+ph.npts[k][1]*r[3]]});if(ph.img)cx.drawImage(ph.img,r[0],r[1],r[2],r[3]);else drawMannequin.apply(null,r);
  var ids=Object.keys(ph.outfit).sort(function(a,b){return LAYER[byId(a).c]-LAYER[byId(b).c]});ids.forEach(function(id){try{drawItem(byId(id),ph.outfit[id],ph)}catch(e){console.warn(e)}});
  if($('showPts').checked&&!G.exporting&&photos.indexOf(ph)==cur){PT.forEach(function(k){var p=ph.pts[k];cx.beginPath();cx.arc(p[0],p[1],9,0,7);cx.fillStyle='rgba(232,160,176,.85)';cx.fill();cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke()})}
  if(n>1){cx.fillStyle='#e8a0b0';cx.font='bold 26px Georgia';cx.fillText(photos.indexOf(ph)?'B':'A',i*cv.width/n+14,36)}});
 if(G.exporting){cx.fillStyle='rgba(18,6,12,.6)';cx.fillRect(0,cv.height-34,cv.width,34);cx.fillStyle='#ffe9c7';cx.font='18px Georgia';cx.fillText('👗 Made with Coffeebreak Fashion Swap · coffeebreaks.itch.io',12,cv.height-11)}}
// ---- point dragging ----
var drag=null;function cpos(e){var b=cv.getBoundingClientRect();return [(e.clientX-b.left)*cv.width/b.width,(e.clientY-b.top)*cv.height/b.height]}
cv.addEventListener('pointerdown',function(e){var p=cpos(e),ph=photos[cur];if(!ph||!ph.pts||!ph.rect)return;var best=null,bd=30;PT.forEach(function(k){var d=Math.hypot(ph.pts[k][0]-p[0],ph.pts[k][1]-p[1]);if(d<bd){bd=d;best=k}});if(best){drag=best;cv.setPointerCapture(e.pointerId)}});
cv.addEventListener('pointermove',function(e){if(!drag)return;var p=cpos(e);var r=photos[cur].rect;photos[cur].npts[drag]=[(p[0]-r[0])/r[2],(p[1]-r[1])/r[3]];render()});
cv.addEventListener('pointerup',function(){drag=null});
// ---- photos ----
function loadFile(f,idx){if(!f)return;var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var c=document.createElement('canvas'),s=Math.min(1,1600/Math.max(im.width,im.height));c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);var ph=photos[idx]||P();ph.img=c;ph.npts=null;photos[idx]=ph;render();autoFit(idx,true)};im.src=r.result};r.readAsDataURL(f)}
$('upA').onclick=function(){$('fileA').click()};$('fileA').onchange=function(e){loadFile(e.target.files[0],0)};
$('mannequin').onclick=function(){photos[0].img=null;photos[0].npts=null;render()};
$('upB').onclick=function(){if(DEMO)return demoEnd('The free demo uses <b>1 photo</b>. Swap mode with a second or friend\'s photo is in the full version.');$('fileB').click()};
$('fileB').onchange=function(e){loadFile(e.target.files[0],1);selectP(1)};
$('manB').onclick=function(){if(DEMO)return demoEnd('The free demo uses <b>1 photo</b>. Swap mode with a second or friend\'s photo is in the full version.');photos[1]=photos[1]||P();photos[1].img=null;photos[1].npts=null;showB=true;selectP(1);render()};
$('zoom').oninput=function(){photos[cur].zoom=this.value/100;photos[cur].npts=null;render()};
$('showPts').onchange=render;
// auto-place: silhouette from difference to border colour
function autoFit(idx,quiet){var ph=photos[idx];if(!ph||!ph.img){if(!quiet)alert('Auto-place needs a photo. The mannequin is already fitted.');return}var r=ph.rect;if(!r){render();r=ph.rect}var c=ph.img,W=80,H=Math.round(80*c.height/c.width),t=document.createElement('canvas');t.width=W;t.height=H;var g=t.getContext('2d');g.drawImage(c,0,0,W,H);var d=g.getImageData(0,0,W,H).data;
 var bg=[0,0,0],nb=0;for(var x=0;x<W;x++)[0,H-1].forEach(function(y){}),0;for(var y=0;y<H;y++)[0,W-1].forEach(function(x){var i=(y*W+x)*4;bg[0]+=d[i];bg[1]+=d[i+1];bg[2]+=d[i+2];nb++});bg=bg.map(function(v){return v/nb});
 var rows=[];for(var y=0;y<H;y++){var l=-1,rr=-1;for(var x=0;x<W;x++){var i=(y*W+x)*4,df=Math.abs(d[i]-bg[0])+Math.abs(d[i+1]-bg[1])+Math.abs(d[i+2]-bg[2]);if(df>90){if(l<0)l=x;rr=x}}rows.push(l<0?null:[l,rr])}
 var top=-1,bot=-1;for(var y=0;y<H;y++)if(rows[y]&&rows[y][1]-rows[y][0]>2){if(top<0)top=y;bot=y}
 if(top<0||bot-top<H*.3){if(!quiet)alert('Could not find the outline. Please drag the dots by hand.');return}
 var hgt=bot-top,sx=r[2]/W,sy=r[3]/H,row=function(f){var y=Math.round(top+hgt*f),q=rows[y]||[W*.4,W*.6];return [q,y]};
 var cxm=row(.3)[0],cen=(cxm[0]+cxm[1])/2,sh=row(.19),hp=row(.5),an=row(.95);var shw=Math.max(4,(sh[0][1]-sh[0][0])*.36),hpw=Math.max(4,(hp[0][1]-hp[0][0])*.3);
 function P2(x,y){return [r[0]+x*sx,r[1]+y*sy]}
 var ab={head:P2(cen,top),sL:P2(cen-shw,sh[1]),sR:P2(cen+shw,sh[1]),hL:P2(cen-hpw,hp[1]),hR:P2(cen+hpw,hp[1]),aL:P2(cen-hpw*.7,an[1]),aR:P2(cen+hpw*.7,an[1])};ph.npts={};PT.forEach(function(k){ph.npts[k]=[(ab[k][0]-r[0])/r[2],(ab[k][1]-r[1])/r[3]]});render()}
$('autofit').onclick=function(){autoFit(cur,false)};
// ---- wardrobe UI ----
CATS.forEach(function(c){var o=document.createElement('option');o.textContent=c;$('cat').appendChild(o)});
function wear(id){var it=byId(id),o=photos[cur].outfit;if(it.lock)return demoEnd('The free demo has <b>10 items</b>. The full version has all '+ITEMS.length+' items, including the whole No Inside Out sensory-friendly collection.');
 if(o[id]){delete o[id]}else{if(it.c!='Accessories')Object.keys(o).forEach(function(k){var c=byId(k).c;if(c==it.c||(it.c=='Dresses'&&(c=='Tops'||c=='Bottoms'))||((it.c=='Tops'||it.c=='Bottoms')&&c=='Dresses'))delete o[k]});o[id]=defStyle(it);if(it.note)$('itemNote').textContent='🧦 '+it.n+': '+it.note}
 G.score=Object.keys(o).length;listItems();designList();render()}
function listItems(){var box=$('items');box.innerHTML='';var o=photos[cur].outfit;ITEMS.filter(function(it){return $('nioOnly').checked?it.nio:it.c==$('cat').value}).forEach(function(it){var d=document.createElement('div');d.textContent=(it.nio?'🧦 ':'')+it.n+(it.lock?' 🔒':'');d.className=(o[it.id]?'on ':'')+(it.lock?'lock':'');d.onclick=function(){wear(it.id)};box.appendChild(d)})}
$('cat').onchange=listItems;$('nioOnly').onchange=listItems;
$('fitW').oninput=function(){photos[cur].fitW=this.value/100;render()};
$('clearAll').onclick=function(){photos[cur].outfit={};listItems();designList();render()};
// ---- design ----
PATS.forEach(function(p){var o=document.createElement('option');o.textContent=p;$('dPat').appendChild(o)});FABS.forEach(function(p){var o=document.createElement('option');o.textContent=p;$('dFab').appendChild(o)});
function designList(){var s=$('dItem'),v=s.value;s.innerHTML='';Object.keys(photos[cur].outfit).forEach(function(id){var o=document.createElement('option');o.value=id;o.textContent=byId(id).n;s.appendChild(o)});if(photos[cur].outfit[v])s.value=v;loadDesign()}
function loadDesign(){var st=photos[cur].outfit[$('dItem').value];if(!st)return;$('dCol').value=st.color;$('dCol2').value=st.color2;$('dPat').value=st.pattern;$('dFab').value=st.fabric;$('dScale').value=st.scale*100}
$('dItem').onchange=loadDesign;
['dCol','dCol2','dPat','dFab','dScale'].forEach(function(k){$(k).oninput=$(k).onchange=function(){var st=photos[cur].outfit[$('dItem').value];if(!st)return;st.color=$('dCol').value;st.color2=$('dCol2').value;st.pattern=$('dPat').value;st.fabric=$('dFab').value;st.scale=$('dScale').value/100;render()}});
// ---- smart style suggestions ----
function hsl(h,s,l){l/=100;var a=s*Math.min(l,1-l)/100,f=function(n){var k=(n+h/30)%12,c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)}
var VIBES={Goth:{pal:function(){return ['#111111','#1a0a10',hsl(345,70,30),'#3a1a4a']},pats:['Gothic skulls & roses','Lace','Solid','Solid','Tartan'],fabs:['Velvet','Leather','Lace','Cotton'],prefer:['corset','leather','boots','witch','slip','gown','leggings','mini']},
 Casual:{pal:function(h){return [hsl(h,40,55),'#ffffff',hsl(h+180,35,45),'#3a5a9a']},pats:['Solid','Stripes','Solid','Check'],fabs:['Cotton','Denim','Knit'],prefer:['tee','jeans','sneak','hoodie','denimj','cap','shorts']},
 Party:{pal:function(h){return [hsl(h,85,55),'#d4af37','#111111',hsl(h+30,90,60)]},pats:['Solid','Leopard','Stars','Solid'],fabs:['Sequins','Silk','Velvet'],prefer:['party','heels','crop','mini','slip','clips','leather']},
 Office:{pal:function(h){return ['#2a2a3a','#f6efe2',hsl(h,25,40),'#b8925a']},pats:['Solid','Check','Solid','Stripes'],fabs:['Cotton','Linen','Silk'],prefer:['blazer','blouse','wide','midi','heels','neck','trench','bag']},
 Beach:{pal:function(h){return [hsl(h,70,70),'#ffffff',hsl(h+40,70,65),'#e8d3a0']},pats:['Solid','Florals','Tie-dye','Stripes'],fabs:['Linen','Cotton','Silk'],prefer:['tank','shorts','sunhat','shades','maxi','sneak','slip']},
 'Sensory comfort':{pal:function(h){return [hsl(h,30,80),hsl(h+40,25,75),hsl(h+180,20,70),'#f0d9c0']},pats:['Solid','Solid','Stripes'],fabs:['Bamboo (soft)','Fleece (soft)','Knit'],prefer:['nio_tee','nio_hood','nio_card','nio_jog','nio_leg','nio_dress','nio_shoe']}};
function pick(a){return a[Math.random()*a.length|0]}
$('suggest').onclick=function(){var vn=$('vibe').value;if(vn=='Any')vn=pick(Object.keys(VIBES));var V=VIBES[vn],pal=V.pal(Math.random()*360|0),avail=ITEMS.filter(function(it){return !it.lock});
 function pool(c){var p=avail.filter(function(it){return it.c==c&&V.prefer.indexOf(it.id)>=0});if(!p.length)p=avail.filter(function(it){return it.c==c});return p}
 var o={},cats=Math.random()<.35&&pool('Dresses').length?['Dresses']:['Tops','Bottoms'];if(Math.random()<.55)cats.push('Jackets');cats.push('Shoes');if(Math.random()<.5)cats.push('Hats');if(Math.random()<.7)cats.push('Accessories');
 var used=0,names=[];cats.forEach(function(c){var p=pool(c);if(!p.length)return;var it=pick(p);var st=defStyle(it);st.color=pal[used%pal.length];st.color2=pal[(used+1)%pal.length];st.pattern=used==0?pick(V.pats):(Math.random()<.25?pick(V.pats):'Solid');st.fabric=it.fab||pick(V.fabs);o[it.id]=st;used++;names.push(it.n)});
 photos[cur].outfit=o;G.score=used;listItems();designList();render();$('sugNote').style.display='block';$('sugNote').innerHTML='<b>'+vn+' look:</b> '+names.join(', ')+'. Palette: '+pal.map(function(c){return '<span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:'+c+'"></span>'}).join(' ')}
// ---- swap ----
function selectP(i){if(!photos[i])return;cur=i;$('selA').className=i?'':'sel';$('selB').className=i?'sel':'';listItems();designList();render()}
$('selA').onclick=function(){selectP(0)};$('selB').onclick=function(){if(!photos[1])return alert('Add a second photo or mannequin first.');selectP(1)};
function clone(o){return JSON.parse(JSON.stringify(o))}
$('doSwap').onclick=function(){if(DEMO||!photos[1])return DEMO?demoEnd('Swap mode with two photos is in the full version.'):alert('Add a second photo or mannequin first.');var t=photos[0].outfit;photos[0].outfit=photos[1].outfit;photos[1].outfit=t;listItems();designList();render()};
$('copyAB').onclick=function(){if(DEMO||!photos[1])return DEMO?demoEnd('Swap mode with two photos is in the full version.'):alert('Add a second photo or mannequin first.');photos[1].outfit=clone(photos[0].outfit);render()};
$('soloView').onclick=function(){showB=!showB;this.textContent=showB?'Hide photo B':'Show photo B';if(!showB)selectP(0);render()};
// ---- lookbook (IndexedDB) ----
var db=null,memLooks=[];
try{var rq=indexedDB.open('cbFashionSwap',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('looks',{keyPath:'id'})};rq.onsuccess=function(){db=rq.result;showLooks()};rq.onerror=function(){db=null}}catch(e){db=null}
function allLooks(cb){if(!db)return cb(memLooks.slice());var out=[],tx=db.transaction('looks','readonly').objectStore('looks').openCursor();tx.onsuccess=function(e){var c=e.target.result;if(c){out.push(c.value);c.continue()}else cb(out)}}
function putLook(l,cb){if(!db){memLooks.push(l);return cb()}var tx=db.transaction('looks','readwrite');tx.objectStore('looks').put(l);tx.oncomplete=cb}
function delLook(id,cb){if(!db){memLooks=memLooks.filter(function(l){return l.id!=id});return cb()}var tx=db.transaction('looks','readwrite');tx.objectStore('looks').delete(id);tx.oncomplete=cb}
function snapshot(sc){G.exporting=1;render();var c=document.createElement('canvas');c.width=cv.width*sc;c.height=cv.height*sc;c.getContext('2d').drawImage(cv,0,0,c.width,c.height);G.exporting=0;render();return c}
$('saveLook').onclick=function(){var l={id:Date.now(),name:$('lookName').value||'Look '+new Date().toLocaleDateString(),outfit:clone(photos[cur].outfit),thumb:snapshot(.2).toDataURL('image/jpeg',.8)};putLook(l,function(){G.level++;showLooks()})};
function showLooks(){allLooks(function(ls){var b=$('looks');b.innerHTML=ls.length?'':'<i>No saved looks yet.</i>';ls.sort(function(a,b){return b.id-a.id}).forEach(function(l){var d=document.createElement('div'),im=new Image();im.src=l.thumb;im.title='Wear this look';im.onclick=function(){var o={};Object.keys(l.outfit).forEach(function(k){var it=byId(k);if(it&&!it.lock)o[k]=l.outfit[k]});photos[cur].outfit=o;listItems();designList();render()};var x=document.createElement('button');x.textContent='🗑';x.style.padding='0 5px';x.onclick=function(){delLook(l.id,showLooks)};d.appendChild(im);d.appendChild(document.createElement('br'));d.appendChild(document.createTextNode(l.name+' '));d.appendChild(x);b.appendChild(d)})})}
$('exportPng').onclick=function(){var c=snapshot(1),a=document.createElement('a');a.download='coffeebreak-look.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()};
// ---- tabs ----
document.querySelectorAll('.tb').forEach(function(b){b.onclick=function(){document.querySelectorAll('.tb').forEach(function(x){x.classList.toggle('sel',x==b)});document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('on',t.id=='t-'+b.dataset.t)});if(b.dataset.t=='design')designList()}});
window.HERO_SRC='assets/hero.png';
listItems();designList();render();
