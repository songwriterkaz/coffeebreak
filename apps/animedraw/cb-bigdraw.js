/* Coffeebreak Big Studio - fullscreen drawing add-on. Made by Coffeebreak. */
(function(){
var CSS=`
#cbbs-open{position:fixed;right:12px;bottom:12px;z-index:99998;font:700 18px system-ui;padding:16px 22px;border-radius:30px;border:0;background:#ff5fa2;color:#fff;box-shadow:0 4px 14px #0005;cursor:pointer}
#cbbs{position:fixed;inset:0;z-index:99999;background:#fff8f2;display:none;flex-direction:column;font:16px system-ui;touch-action:none}
#cbbs.on{display:flex}
#cbbs .bar{display:flex;gap:8px;overflow-x:auto;padding:8px;background:#3b2418;color:#fff;align-items:center;flex:0 0 auto}
#cbbs .bar img{height:44px;border-radius:8px}
#cbbs button,#cbbs select{min-width:52px;min-height:52px;font-size:18px;border-radius:12px;border:2px solid #0002;background:#fff;color:#222;cursor:pointer;flex:0 0 auto;padding:4px 10px}
#cbbs button.sel{outline:4px solid #ff5fa2}
#cbbs .wrap{flex:1;position:relative;overflow:hidden}
#cbbs canvas{position:absolute;inset:0;width:100%;height:100%}
#cbbs .sw{width:52px;height:52px;border-radius:50%;padding:0}
#cbbs .tray{display:flex;gap:6px;overflow-x:auto;padding:6px;background:#f3e3d6;flex:0 0 auto}
#cbbs .logo{position:absolute;right:10px;bottom:10px;height:56px;opacity:.9;border-radius:10px;pointer-events:none}
#cbbs .msg{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#3b2418;color:#fff;padding:8px 16px;border-radius:20px;pointer-events:none}
button,.btn,[role=button],select{min-height:44px}
canvas#view,canvas#art{max-width:100vw}
@media (max-width:700px){#cbbs button{min-width:56px;min-height:56px}}
`;
var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
function h(t,a,c){var e=document.createElement(t);for(var k in a||{})e[k]=a[k];(c||[]).forEach(function(x){e.appendChild(typeof x=='string'?document.createTextNode(x):x)});return e}
var root=h('div',{id:'cbbs'});
var bar=h('div',{className:'bar'}),tray=h('div',{className:'tray'}),tray2=h('div',{className:'tray'}),wrap=h('div',{className:'wrap'});
var cv=h('canvas'),ln=h('canvas'),msg=h('div',{className:'msg'});
var logo=h('img',{className:'logo',src:'cb-logo.jpg',alt:'Coffeebreak'});
wrap.append(cv,ln,logo,msg);root.append(bar,tray,tray2,wrap);
var ob=h('button',{id:'cbbs-open',textContent:'Big Studio'});
document.addEventListener('DOMContentLoaded',function(){document.body.append(root,ob)});
if(document.readyState!='loading'){setTimeout(function(){if(!root.parentNode)document.body.append(root,ob)},0)}
var X=cv.getContext('2d'),L=ln.getContext('2d'),W=0,H=0,dpr=1;
function say(t){msg.textContent=t;msg.style.display='block';clearTimeout(say.t);say.t=setTimeout(function(){msg.style.display='none'},2200)}
function resize(){var r=wrap.getBoundingClientRect();if(!r.width)return;var old=W?cv.toDataURL():null;dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;[cv,ln].forEach(function(c){c.width=W*dpr;c.height=H*dpr});X.setTransform(dpr,0,0,dpr,0,0);L.setTransform(dpr,0,0,dpr,0,0);X.fillStyle='#fff';X.fillRect(0,0,W,H);if(old){var i=new Image();i.onload=function(){X.drawImage(i,0,0,W,H)};i.src=old}if(page>=0)drawPage(page)}
window.addEventListener('resize',resize);
// palette: 96 colours
var COLS=[];for(var hh=0;hh<360;hh+=24)[[90,50],[90,70],[70,35],[60,85],[40,60],[100,30]].forEach(function(p){COLS.push('hsl('+hh+','+p[0]+'%,'+p[1]+'%)')});
['#000','#333','#666','#999','#ccc','#fff','#6f4e37','#c69c6d'].forEach(function(c){COLS.push(c)});
var col='#ff5fa2',size=10,brush='pen',mode='free',sym=1,stamp=null,page=-1,hist=[];
var BR=['pen','marker','crayon','spray','calligraphy','neon','dots','rainbow','chalk','watercolour','glitter','hearts','stars','ribbon','eraser','fill'];
var STAMPS='☕🌸🌼🌻🌷🍒🍓🍋🍉🍩🧁🍰🍭🍬🎀💖💕💜⭐🌟✨🌙☀️🌈☁️⚡❄️🔥🐱🐶🐰🦊🐻🐼🐨🐸🐵🦄🐝🦋🐞🐢🐟🐬🐳🦀🐙🌵🌴🍀🍁🍄🌹🏠🏰⛺🚗🚀✈️⛵🎈🎁🎂🎨🖌️✏️📚🎵🎸🎹🥁👑💎🔮🧸🪐🌍🍕🍔🍟🍦🥐🫖💌🕯️'.match(/\p{Extended_Pictographic}\uFE0F?/gu);
var MODES={free:'Free draw',colour:'Colouring pages',mirror2:'Mirror x2',mirror4:'Mirror x4',mirror8:'Kaleido x8',dots:'Dot to dot',trace:'Trace levels',challenge:'Challenges'};
var CH=['Draw a coffee cup with a happy face','Draw your dream cafe','Draw a cat drinking tea','Draw a rainbow garden','Draw a cupcake castle','Draw a rocket made of donuts','Draw a pink bunny in space','Draw a sunflower field','Draw an underwater party','Draw your favourite snack','Draw a robot barista','Draw a cosy bedroom','Draw a monster that loves cake','Draw a beach at sunset','Draw a dragon made of clouds','Draw a cherry tree','Draw a magic potion shop','Draw a pizza planet','Draw a dancing bear','Draw a rainy day window','Draw a treehouse','Draw a hot air balloon race','Draw a candy shop','Draw a superhero bean','Draw a snail with a fancy shell','Draw a winter village','Draw a music stage','Draw a picnic','Draw a lighthouse','Draw a butterfly garden','Draw a train through mountains','Draw your pet as royalty','Draw a fairy bakery','Draw a mermaid cafe','Draw a jungle with hidden animals','Draw a city at night','Draw a tea party','Draw a giant strawberry house','Draw a skate park','Draw a flower crown','Draw an owl library','Draw a cactus wearing a hat','Draw a cloud with feelings','Draw a vintage car','Draw a bee hive town','Draw a crystal cave','Draw a farm','Draw a ghost who bakes','Draw a moon picnic','Draw yourself as a cartoon bean'];
// colouring pages: procedural line art, 120 pages
var PAGES=[];['Mandala','Flower','Coffee cup','Cupcake','House','Fish','Cat','Star burst','Heart tiles','Butterfly','Sun','Tree','Owl','Snail','Rocket','Castle','Donut','Balloon','Turtle','Geometric'].forEach(function(n){for(var v=1;v<=6;v++)PAGES.push([n,v])});
function rng(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function C(x,y,r){L.beginPath();L.arc(x,y,r,0,7);L.stroke()}
function R(x,y,w,hh){L.strokeRect(x,y,w,hh)}
function P(pts,close){L.beginPath();pts.forEach(function(p,i){i?L.lineTo(p[0],p[1]):L.moveTo(p[0],p[1])});if(close)L.closePath();L.stroke()}
function petals(cx,cy,n,r1,r2){for(var i=0;i<n;i++){var a=i*2*Math.PI/n;L.beginPath();L.ellipse(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1,r2,r2/2.2,a,0,7);L.stroke()}}
function drawPage(i){page=i;L.clearRect(0,0,W,H);L.strokeStyle='#111';L.lineWidth=4;L.lineJoin=L.lineCap='round';var p=PAGES[i],n=p[0],v=p[1],cx=W/2,cy=H/2,s=Math.min(W,H)*0.42,r=rng(i*77+3);
if(n=='Mandala'||n=='Star burst'||n=='Sun'){for(var k=1;k<=4+v;k++)C(cx,cy,s*k/(5+v));for(k=0;k<6+v*2;k++)petals(cx,cy,6+v*2,s*(0.3+k%3*0.2),s*0.12)}
else if(n=='Flower'){for(k=0;k<3;k++){var x=cx+(k-1)*s*0.6,y=cy-s*0.2+(k%2)*s*0.3;P([[x,y],[x,cy+s]]);petals(x,y,5+v,s*0.18,s*0.13);C(x,y,s*0.1)}}
else if(n=='Coffee cup'){R(cx-s*.5,cy-s*.3,s,s*.8);C(cx+s*.65,cy+s*.05,s*.18);P([[cx-s*.8,cy+s*.55],[cx+s*.8,cy+s*.55]]);for(k=0;k<3;k++)P([[cx-s*.3+k*s*.3,cy-s*.4],[cx-s*.2+k*s*.3,cy-s*.6],[cx-s*.3+k*s*.3,cy-s*.8]]);for(k=0;k<v;k++)C(cx-s*.3+k*s*.12,cy+s*.1,s*.05)}
else if(n=='Cupcake'){P([[cx-s*.5,cy],[cx-s*.35,cy+s*.7],[cx+s*.35,cy+s*.7],[cx+s*.5,cy]],1);for(k=0;k<4;k++)C(cx-s*.35+k*s*.23,cy-s*.1,s*.2);C(cx,cy-s*.45,s*.12);for(k=0;k<v+3;k++)P([[cx-s*.3+k*s*.12,cy+s*.1],[cx-s*.28+k*s*.12,cy+s*.6]])}
else if(n=='House'||n=='Castle'){R(cx-s*.6,cy-s*.1,s*1.2,s*.8);P([[cx-s*.7,cy-s*.1],[cx,cy-s*.7],[cx+s*.7,cy-s*.1]]);R(cx-s*.12,cy+s*.3,s*.24,s*.4);for(k=0;k<2;k++)R(cx-s*.5+k*s*.75,cy+s*.05,s*.25,s*.2);if(n=='Castle')for(k=0;k<7;k++)R(cx-s*.6+k*s*.18,cy-s*.2,s*.1,s*.1)}
else if(n=='Fish'||n=='Turtle'){L.beginPath();L.ellipse(cx,cy,s*.6,s*.35,0,0,7);L.stroke();P([[cx+s*.55,cy],[cx+s*.9,cy-s*.3],[cx+s*.9,cy+s*.3]],1);C(cx-s*.35,cy-s*.08,s*.06);for(k=0;k<5+v;k++)C(cx-s*.2+k*s*.1,cy+(k%2?.1:-.1)*s,s*.07)}
else if(n=='Cat'||n=='Owl'){C(cx,cy-s*.2,s*.4);P([[cx-s*.35,cy-s*.4],[cx-s*.3,cy-s*.8],[cx-s*.1,cy-s*.55]]);P([[cx+s*.35,cy-s*.4],[cx+s*.3,cy-s*.8],[cx+s*.1,cy-s*.55]]);C(cx-s*.15,cy-s*.25,s*.08);C(cx+s*.15,cy-s*.25,s*.08);L.beginPath();L.ellipse(cx,cy+s*.5,s*.4,s*.35,0,0,7);L.stroke()}
else if(n=='Heart tiles'||n=='Geometric'||n=='Donut'||n=='Balloon'){var g=3+v;for(var a=0;a<g;a++)for(var b=0;b<g;b++){var x=cx-s+(a+.5)*2*s/g,y=cy-s+(b+.5)*2*s/g,q=s/g*.8;if(n=='Geometric')P([[x,y-q],[x+q,y],[x,y+q],[x-q,y]],1);else{C(x,y,q*.8);if(n=='Donut')C(x,y,q*.3);if(n=='Heart tiles')C(x,y,q*.4);if(n=='Balloon')P([[x,y+q*.8],[x,y+q*1.2]])}}}
else if(n=='Butterfly'){for(k=-1;k<=1;k+=2){L.beginPath();L.ellipse(cx+k*s*.4,cy-s*.2,s*.38,s*.28,k*.4,0,7);L.stroke();L.beginPath();L.ellipse(cx+k*s*.3,cy+s*.3,s*.25,s*.2,-k*.4,0,7);L.stroke();for(var j=0;j<v;j++)C(cx+k*s*(.3+j*.05),cy-s*.2,s*.04*(j+1))}L.beginPath();L.ellipse(cx,cy,s*.06,s*.5,0,0,7);L.stroke()}
else if(n=='Tree'){R(cx-s*.1,cy+s*.1,s*.2,s*.8);for(k=0;k<5+v;k++)C(cx+(r()-.5)*s,cy-s*.2+(r()-.5)*s*.6,s*(.2+r()*.15))}
else if(n=='Snail'){for(k=1;k<6;k++)C(cx,cy,s*k*.08);C(cx,cy,s*.45);P([[cx-s*.9,cy+s*.45],[cx+s*.6,cy+s*.45]]);P([[cx-s*.6,cy+s*.45],[cx-s*.75,cy-s*.1],[cx-s*.85,cy-s*.3]])}
else if(n=='Rocket'){L.beginPath();L.ellipse(cx,cy,s*.25,s*.7,0,0,7);L.stroke();C(cx,cy-s*.2,s*.12);P([[cx-s*.25,cy+s*.3],[cx-s*.5,cy+s*.7],[cx-s*.2,cy+s*.55]]);P([[cx+s*.25,cy+s*.3],[cx+s*.5,cy+s*.7],[cx+s*.2,cy+s*.55]]);for(k=0;k<v*3;k++)C(r()*W,r()*H*.3,4)}
}
// dot to dot: 30 levels
function dotsLevel(lv){page=-1;L.clearRect(0,0,W,H);var n=6+lv*2,cx=W/2,cy=H/2,s=Math.min(W,H)*.4,r=rng(lv*13+1);L.fillStyle='#111';L.font='bold 16px system-ui';for(var i=0;i<n;i++){var a=i*2*Math.PI/n,rr=s*(lv%2?(i%2?.5:1):(.75+r()*.25));var x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;L.beginPath();L.arc(x,y,6,0,7);L.fill();L.fillText(i+1,x+9,y-9)}say('Level '+lv+' of 30: join the dots')}
function traceLevel(lv){page=-1;L.clearRect(0,0,W,H);L.setLineDash([10,10]);L.strokeStyle='#bbb';L.lineWidth=6;var cx=W/2,cy=H/2,s=Math.min(W,H)*.4;L.beginPath();for(var t=0;t<=6.3;t+=.02){var k=1+lv%7,rr=s*(.6+.4*Math.cos(k*t)),x=cx+rr*Math.cos(t),y=cy+rr*Math.sin(t);t?L.lineTo(x,y):L.moveTo(x,y)}L.stroke();L.setLineDash([]);say('Trace level '+lv+' of 30')}
// UI
function btn(t,f,parent,title){var b=h('button',{textContent:t,title:title||t});b.onclick=f;(parent||bar).appendChild(b);return b}
bar.appendChild(logo.cloneNode());
btn('Close',function(){root.classList.remove('on')});
var ms=h('select');for(var k in MODES)ms.appendChild(h('option',{value:k,textContent:MODES[k]}));bar.appendChild(ms);
var pg=h('select');PAGES.forEach(function(p,i){pg.appendChild(h('option',{value:i,textContent:p[0]+' '+p[1]}))});bar.appendChild(pg);
var lvs=h('select');for(var i=1;i<=30;i++)lvs.appendChild(h('option',{value:i,textContent:'Level '+i}));bar.appendChild(lvs);
function applyMode(){mode=ms.value;sym={mirror2:2,mirror4:4,mirror8:8}[mode]||1;pg.style.display=mode=='colour'?'':'none';lvs.style.display=(mode=='dots'||mode=='trace')?'':'none';L.clearRect(0,0,W,H);page=-1;if(mode=='colour'){drawPage(+pg.value);brush='fill';markB()}if(mode=='dots')dotsLevel(+lvs.value);if(mode=='trace')traceLevel(+lvs.value);if(mode=='challenge')say(CH[Math.floor(Math.random()*CH.length)])}
ms.onchange=applyMode;pg.onchange=function(){drawPage(+pg.value)};lvs.onchange=applyMode;
var sz=h('input',{type:'range',min:2,max:80,value:10});sz.style.minWidth='120px';sz.oninput=function(){size=+sz.value};bar.appendChild(sz);
btn('Undo',function(){var d=hist.pop();if(d)X.putImageData(d,0,0)});
btn('Clear',function(){save();X.setTransform(1,0,0,1,0,0);X.fillStyle='#fff';X.fillRect(0,0,cv.width,cv.height);X.setTransform(dpr,0,0,dpr,0,0)});
btn('New challenge',function(){ms.value='challenge';applyMode()});
btn('Save PNG',function(){var o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;var c=o.getContext('2d');c.drawImage(cv,0,0);c.drawImage(ln,0,0);c.drawImage(logo,o.width-130*dpr,o.height-70*dpr,120*dpr,60*dpr);var a=h('a',{download:'coffeebreak-art.png',href:o.toDataURL()});a.click()});
var bbtn={};BR.forEach(function(b){bbtn[b]=btn(b,function(){brush=b;stamp=null;markB()},tray)});
STAMPS.forEach(function(s){btn(s,function(){stamp=s;brush=null;markB()},tray)});
COLS.forEach(function(c){var b=btn('',function(){col=c},tray2);b.className='sw';b.style.background=c});
var pk=h('input',{type:'color',value:'#ff5fa2'});pk.style.minWidth='52px';pk.style.minHeight='52px';pk.oninput=function(){col=pk.value};tray2.appendChild(pk);
function markB(){for(var k in bbtn)bbtn[k].classList.toggle('sel',k==brush)}
ob.onclick=function(){root.classList.add('on');resize();applyMode();say('Coffeebreak Big Studio')};
function save(){hist.push(X.getImageData(0,0,cv.width,cv.height));if(hist.length>30)hist.shift()}
var hue=0,last=null;
function pts(x,y){var o=[],cx=W/2,cy=H/2;for(var i=0;i<sym;i++){var a=i*2*Math.PI/sym,dx=x-cx,dy=y-cy,rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);o.push([cx+rx,cy+ry]);if(sym>1)o.push([cx-rx,cy+ry])}return o}
function dab(x0,y0,x,y){X.save();X.lineCap=X.lineJoin='round';X.strokeStyle=X.fillStyle=col;X.lineWidth=size;X.globalAlpha=1;X.shadowBlur=0;X.globalCompositeOperation='source-over';
var b=brush;if(b=='eraser'){X.strokeStyle='#fff'}if(b=='marker')X.globalAlpha=.5;if(b=='neon'){X.shadowBlur=size;X.shadowColor=col}if(b=='rainbow'){hue=(hue+4)%360;X.strokeStyle='hsl('+hue+',90%,55%)'}if(b=='watercolour'){X.globalAlpha=.08;X.lineWidth=size*2}
if(b=='pen'||b=='marker'||b=='eraser'||b=='neon'||b=='rainbow'||b=='watercolour'){X.beginPath();X.moveTo(x0,y0);X.lineTo(x,y);X.stroke()}
else if(b=='calligraphy'){for(var i=-size/2;i<size/2;i++){X.lineWidth=1.5;X.beginPath();X.moveTo(x0+i*.7,y0-i*.7);X.lineTo(x+i*.7,y-i*.7);X.stroke()}}
else if(b=='ribbon'){X.lineWidth=1;X.beginPath();X.moveTo(x0,y0-size);X.lineTo(x,y+size);X.stroke()}
else{var n=b=='spray'?size*2:b=='chalk'||b=='crayon'?size:3;for(var j=0;j<n;j++){var rr=Math.random()*size,a=Math.random()*7,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;X.globalAlpha=b=='crayon'?.6:b=='chalk'?.35:1;
if(b=='glitter'){X.fillStyle='hsl('+Math.random()*360+',90%,60%)';X.fillRect(px,py,2,2)}else if(b=='dots'){X.beginPath();X.arc(x,y,size/3,0,7);X.fill();break}else if(b=='hearts'||b=='stars'){X.font=size*2+'px serif';X.fillText(b=='hearts'?'♥':'★',x-size/2,y+size/2);break}else X.fillRect(px,py,1.6,1.6)}}
X.restore()}
function flood(x,y){save();var w=cv.width,hh=cv.height,ix=Math.floor(x*dpr),iy=Math.floor(y*dpr),A=X.getImageData(0,0,w,hh),B=L.getImageData(0,0,w,hh).data,d=A.data,t=document.createElement('canvas').getContext('2d');t.fillStyle=col;t.fillRect(0,0,1,1);var c=t.getImageData(0,0,1,1).data,s0=(iy*w+ix)*4,sr=d[s0],sg=d[s0+1],sb=d[s0+2];if(Math.abs(sr-c[0])+Math.abs(sg-c[1])+Math.abs(sb-c[2])<10)return;var st=[ix,iy],seen=new Uint8Array(w*hh);while(st.length){var py=st.pop(),px=st.pop();if(px<0||py<0||px>=w||py>=hh)continue;var k=py*w+px;if(seen[k])continue;seen[k]=1;var o=k*4;if(B[o+3]>90)continue;if(Math.abs(d[o]-sr)+Math.abs(d[o+1]-sg)+Math.abs(d[o+2]-sb)>60)continue;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;st.push(px+1,py,px-1,py,px,py+1,px,py-1)}X.putImageData(A,0,0)}
function xy(e){var r=ln.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
ln.addEventListener('pointerdown',function(e){e.preventDefault();var p=xy(e);if(brush=='fill'){flood(p[0],p[1]);return}save();if(stamp){pts(p[0],p[1]).forEach(function(q){X.font=size*3+'px serif';X.textAlign='center';X.textBaseline='middle';X.fillText(stamp,q[0],q[1])});return}last=p;ln.setPointerCapture(e.pointerId)});
ln.addEventListener('pointermove',function(e){if(!last)return;var p=xy(e),a=pts(last[0],last[1]),b=pts(p[0],p[1]);for(var i=0;i<a.length;i++)dab(a[i][0],a[i][1],b[i][0],b[i][1]);last=p});
['pointerup','pointercancel'].forEach(function(n){ln.addEventListener(n,function(){last=null})});
window.CBBigStudio={open:function(){ob.onclick()},pages:PAGES.length,brushes:BR.length,stamps:STAMPS.length,colours:COLS.length,modes:Object.keys(MODES).length,levels:30,challenges:CH.length};
})();
