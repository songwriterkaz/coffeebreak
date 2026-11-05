(function(){
var $=function(i){return document.getElementById(i)},W=1200,H=900;
var art=$('art'),lines=$('lines'),guide=$('guide'),A=art.getContext('2d'),L=lines.getContext('2d'),G=guide.getContext('2d');
[art,lines,guide].forEach(function(c){c.width=W;c.height=H});
A.fillStyle='#fff';A.fillRect(0,0,W,H);
var state={tool:'brush',color:'#2a6fdb',size:14,sticker:'⭐',stamp:'heart'},undo=[],mode='free';
var COLORS=['#000000','#6b4f3a','#e63b2e','#f28c28','#ffd400','#5cc85c','#1f8f5f','#3fb6e8','#2a6fdb','#7a4fd6','#ffffff','#9aa0a6','#f2c9a0','#8b5a2b'];
var CALM=['#4d4d4d','#8a7a6a','#b56a5c','#c99a62','#d8c27a','#8fb08a','#5f8f7a','#8fb7c4','#6f8fb5','#8f80aa','#ffffff','#b8b8b0','#e6cdb5','#a08060'];
var STICK=['⭐','🌈','🐶','🐱','🦕','🌸','🚗','☕','🦋','🐠','🍎','☀️','🌙','❤️','🦄','🐢'];
var STAMPS=['heart','star','circle','square','triangle','flower'];
function snap(){undo.push(A.getImageData(0,0,W,H));if(undo.length>25)undo.shift()}
function toolBar(){var calm=document.body.classList.contains('calm'),P=calm?CALM:COLORS;
 var T=[['brush','🖌️ Brush'],['crayon','🖍️ Crayon'],['marker','🖊️ Marker'],['spray','💨 Spray'],['fill','🪣 Fill'],['eraser','🧽 Eraser'],['sticker','⭐ Stickers'],['stamp','🔷 Stamps']];
 $('tools').innerHTML=T.map(function(t){return '<button class="tb'+(state.tool==t[0]?' on':'')+'" data-tool="'+t[0]+'">'+t[1]+'</button>'}).join('')+
 '<label class="tb">Size <input type="range" id="size" min="3" max="60" value="'+state.size+'"></label>'+
 P.map(function(c){return '<button class="sw'+(state.color==c?' on':'')+'" data-c="'+c+'" style="background:'+c+'" aria-label="colour '+c+'"></button>'}).join('')+
 '<label class="tb">🎨 <input type="color" id="pick" value="'+state.color+'"></label>'+
 '<button class="tb" id="undo">↩️ Undo</button><button class="tb" id="clear">🧹 New page</button><button class="tb" id="save">💾 Save picture</button>';
 $('tools').querySelectorAll('[data-tool]').forEach(function(b){b.onclick=function(){state.tool=b.dataset.tool;toolBar()}});
 $('tools').querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){state.color=b.dataset.c;if(state.tool=='eraser')state.tool='brush';toolBar()}});
 $('size').oninput=function(){state.size=+this.value};$('pick').oninput=function(){state.color=this.value};
 $('undo').onclick=function(){if(undo.length)A.putImageData(undo.pop(),0,0)};
 $('clear').onclick=function(){if(!confirm('Start a new blank page?'))return;snap();A.fillStyle='#fff';A.fillRect(0,0,W,H);L.clearRect(0,0,W,H);G.clearRect(0,0,W,H);setMode('free','')};
 $('save').onclick=savePic;
 var pk=$('picks');pk.innerHTML='';
 if(state.tool=='sticker')pk.innerHTML=STICK.map(function(s){return '<button class="tb'+(s==state.sticker?' on':'')+'" data-s="'+s+'">'+s+'</button>'}).join('');
 if(state.tool=='stamp')pk.innerHTML=STAMPS.map(function(s){return '<button class="tb'+(s==state.stamp?' on':'')+'" data-st="'+s+'">'+s+'</button>'}).join('');
 pk.querySelectorAll('[data-s]').forEach(function(b){b.onclick=function(){state.sticker=b.dataset.s;toolBar()}});
 pk.querySelectorAll('[data-st]').forEach(function(b){b.onclick=function(){state.stamp=b.dataset.st;toolBar()}});}
function savePic(){var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.drawImage(art,0,0);x.drawImage(lines,0,0);
 var a=document.createElement('a');a.download='my-coffeebreak-drawing.png';a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}
function pos(e){var r=art.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
var down=false,last=null;
function hexA(c,a){var n=parseInt(c.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'}
function seg(p,q){var t=state.tool,s=state.size;A.lineCap='round';A.lineJoin='round';
 if(t=='brush'||t=='eraser'){A.strokeStyle=t=='eraser'?'#fff':state.color;A.lineWidth=t=='eraser'?s*1.6:s;A.beginPath();A.moveTo(p.x,p.y);A.lineTo(q.x,q.y);A.stroke()}
 else if(t=='marker'){A.strokeStyle=hexA(state.color,.35);A.lineWidth=s*1.4;A.lineCap='square';A.beginPath();A.moveTo(p.x,p.y);A.lineTo(q.x,q.y);A.stroke()}
 else if(t=='crayon'){var d=Math.hypot(q.x-p.x,q.y-p.y),n=Math.max(1,d/2);A.fillStyle=hexA(state.color,.5);for(var i=0;i<n;i++){var x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;for(var k=0;k<s;k++){A.fillRect(x+(Math.random()-.5)*s,y+(Math.random()-.5)*s,1.6,1.6)}}}
 else if(t=='spray'){A.fillStyle=state.color;for(var k=0;k<s*2;k++){var a=Math.random()*6.283,r=Math.random()*s*1.5;A.fillRect(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r,1.5,1.5)}}}
function stamp(p){var s=state.size*2.5+20;A.fillStyle=state.color;A.beginPath();var k=state.stamp;
 if(k=='circle')A.arc(p.x,p.y,s/2,0,7);else if(k=='square')A.rect(p.x-s/2,p.y-s/2,s,s);
 else if(k=='triangle'){A.moveTo(p.x,p.y-s/2);A.lineTo(p.x+s/2,p.y+s/2);A.lineTo(p.x-s/2,p.y+s/2)}
 else if(k=='star'){for(var i=0;i<10;i++){var r=i%2?s/4:s/2,a=i*Math.PI/5-Math.PI/2;A.lineTo(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r)}}
 else if(k=='heart'){A.moveTo(p.x,p.y+s/2);A.bezierCurveTo(p.x-s,p.y-s/6,p.x-s/3,p.y-s*.8,p.x,p.y-s/5);A.bezierCurveTo(p.x+s/3,p.y-s*.8,p.x+s,p.y-s/6,p.x,p.y+s/2)}
 else {for(var i=0;i<6;i++){var a=i*Math.PI/3;A.moveTo(p.x,p.y);A.arc(p.x+Math.cos(a)*s/3,p.y+Math.sin(a)*s/3,s/4,0,7)}A.fill();A.beginPath();A.fillStyle='#ffd400';A.arc(p.x,p.y,s/6,0,7)}
 A.fill()}
function fill(p){var x0=p.x|0,y0=p.y|0,img=A.getImageData(0,0,W,H),d=img.data,ln=L.getImageData(0,0,W,H).data,i0=(y0*W+x0)*4;if(ln[i0+3]>100)return;
 var tr=d[i0],tg=d[i0+1],tb=d[i0+2],n=parseInt(state.color.slice(1),16),R=n>>16,Gc=n>>8&255,B=n&255;if(Math.abs(tr-R)+Math.abs(tg-Gc)+Math.abs(tb-B)<10)return;
 var st=[x0+y0*W],seen=new Uint8Array(W*H);
 function ok(j){var i=j*4;return !seen[j]&&ln[i+3]<100&&Math.abs(d[i]-tr)+Math.abs(d[i+1]-tg)+Math.abs(d[i+2]-tb)<90}
 while(st.length){var j=st.pop();if(!ok(j))continue;seen[j]=1;var i=j*4;d[i]=R;d[i+1]=Gc;d[i+2]=B;d[i+3]=255;var x=j%W;
  if(x>0)st.push(j-1);if(x<W-1)st.push(j+1);if(j>=W)st.push(j-W);if(j<W*H-W)st.push(j+W)}
 A.putImageData(img,0,0)}
art.addEventListener('pointerdown',function(e){e.preventDefault();art.setPointerCapture(e.pointerId);var p=pos(e);snap();
 if(state.tool=='fill'){fill(p);return}if(state.tool=='sticker'){A.font=(state.size*3+30)+'px sans-serif';A.textAlign='center';A.textBaseline='middle';A.fillText(state.sticker,p.x,p.y);return}
 if(state.tool=='stamp'){stamp(p);return}down=true;last=p;seg(p,p)});
art.addEventListener('pointermove',function(e){if(!down)return;var p=pos(e);seg(last,p);last=p});
['pointerup','pointercancel','pointerleave'].forEach(function(ev){art.addEventListener(ev,function(){down=false})});
/* line art (original) */
function ink(c){c.strokeStyle='#222';c.lineWidth=7;c.lineCap='round';c.lineJoin='round';c.fillStyle='#222'}
function E(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.stroke()}
function P(c,pts,close){c.beginPath();c.moveTo(pts[0],pts[1]);for(var i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);if(close)c.closePath();c.stroke()}
function dot(c,x,y,r){c.beginPath();c.arc(x,y,r||10,0,7);c.fill()}
function smile(c,x,y,r){c.beginPath();c.arc(x,y,r,.2*Math.PI,.8*Math.PI);c.stroke()}
var PAGES={
'Coffee cup mascot':function(c){P(c,[400,330,800,330,750,760,450,760],1);c.beginPath();c.arc(810,520,80,-1.2,1.2);c.stroke();E(c,600,800,280,40);dot(c,530,500,14);dot(c,670,500,14);smile(c,600,560,60);c.beginPath();c.moveTo(520,280);c.bezierCurveTo(480,230,560,200,520,150);c.moveTo(680,280);c.bezierCurveTo(640,230,720,200,680,150);c.stroke()},
'Cat':function(c){E(c,600,600,230,200);E(c,600,330,160,140);P(c,[470,260,480,150,550,215]);P(c,[730,260,720,150,650,215]);dot(c,545,320,12);dot(c,655,320,12);P(c,[585,370,615,370,600,385],1);smile(c,600,370,35);P(c,[460,370,360,350]);P(c,[460,390,360,400]);P(c,[740,370,840,350]);P(c,[740,390,840,400]);c.beginPath();c.moveTo(820,650);c.bezierCurveTo(1000,650,950,450,1050,430);c.stroke()},
'Fish':function(c){E(c,560,450,300,180);P(c,[850,450,1050,300,1050,600],1);dot(c,380,410,16);smile(c,330,470,30);c.beginPath();c.arc(560,450,120,-1.2,1.2);c.stroke();E(c,250,250,25,25);E(c,200,170,18,18)},
'Car':function(c){P(c,[200,600,200,480,350,470,450,330,780,330,880,470,1000,490,1000,600],1);P(c,[480,460,530,370,640,370,640,460],1);P(c,[680,460,680,370,760,370,820,460],1);E(c,360,620,80,80);E(c,840,620,80,80);E(c,360,620,30,30);E(c,840,620,30,30)},
'Flower':function(c){for(var i=0;i<8;i++){var a=i*Math.PI/4;c.beginPath();c.ellipse(600+Math.cos(a)*150,330+Math.sin(a)*150,90,55,a,0,7);c.stroke()}E(c,600,330,80,80);P(c,[600,480,600,850]);c.beginPath();c.ellipse(500,680,100,40,-.5,0,7);c.stroke();c.beginPath();c.ellipse(700,620,100,40,.5,0,7);c.stroke()},
'Dinosaur':function(c){c.beginPath();c.moveTo(250,600);c.bezierCurveTo(300,350,750,300,800,450);c.bezierCurveTo(850,300,900,180,1000,200);c.bezierCurveTo(1080,210,1080,290,1000,300);c.bezierCurveTo(950,320,920,450,880,600);c.bezierCurveTo(800,650,350,680,250,600);c.moveTo(250,600);c.lineTo(80,640);c.lineTo(270,650);c.stroke();P(c,[400,650,400,780,470,780,470,665]);P(c,[720,650,720,780,790,780,790,640]);dot(c,1010,240,10);for(var i=0;i<5;i++)P(c,[380+i*90,400-i*10,420+i*90,330-i*10,460+i*90,390-i*12])},
'Butterfly':function(c){E(c,600,450,30,200);c.beginPath();c.ellipse(430,330,170,130,-.4,0,7);c.stroke();c.beginPath();c.ellipse(770,330,170,130,.4,0,7);c.stroke();c.beginPath();c.ellipse(460,580,120,100,.4,0,7);c.stroke();c.beginPath();c.ellipse(740,580,120,100,-.4,0,7);c.stroke();E(c,430,330,50,40);E(c,770,330,50,40);P(c,[590,260,520,140]);P(c,[610,260,680,140])},
'House':function(c){P(c,[300,450,600,200,900,450],1);P(c,[350,450,350,800,850,800,850,450]);P(c,[540,800,540,620,660,620,660,800]);P(c,[400,500,500,500,500,590,400,590],1);P(c,[700,500,800,500,800,590,700,590],1);E(c,1050,150,70,70)},
'Turtle':function(c){c.beginPath();c.arc(600,550,260,Math.PI,0);c.closePath();c.stroke();E(c,930,500,80,60);dot(c,950,485,10);E(c,430,600,50,40);E(c,770,600,50,40);P(c,[480,420,600,330,720,420,600,500],1)}};
function mandala(n,ring){return function(c){var cx=600,cy=450;for(var r=1;r<=ring;r++){E(c,cx,cy,r*70,r*70);for(var i=0;i<n*(r%2+1);i++){var a=i*2*Math.PI/(n*(r%2+1));c.beginPath();c.ellipse(cx+Math.cos(a)*(r*70-35),cy+Math.sin(a)*(r*70-35),28,14,a,0,7);c.stroke()}}}}
var CALMPAGES={'Mandala 1':mandala(8,5),'Mandala 2':mandala(6,6),'Mandala 3':mandala(12,4),
'Waves':function(c){for(var y=120;y<900;y+=110){c.beginPath();for(var x=0;x<=1200;x+=10)c.lineTo(x,y+Math.sin(x/70)*35);c.stroke()}},
'Tiles':function(c){for(var x=0;x<1200;x+=150)for(var y=0;y<900;y+=150){c.strokeRect(x,y,150,150);E(c,x+75,y+75,50,50);P(c,[x,y,x+150,y+150]);P(c,[x+150,y,x,y+150])}}};
var tabsTo=function(t){document.querySelectorAll('nav button').forEach(function(b){b.classList.toggle('on',b.dataset.t==t)});document.querySelectorAll('.tab').forEach(function(s){s.classList.toggle('on',s.id==t)});window.scrollTo(0,0)};
document.querySelectorAll('nav button').forEach(function(b){b.onclick=function(){tabsTo(b.dataset.t)}});
function stopBreath(){clearInterval(stopBreath.h);$('breath').style.display='none';$('breathTxt').style.display='none'}
function setMode(m,prompt){mode=m;stopBreath();$('box').style.display='none';$('extra').innerHTML='';$('prompt').textContent=prompt||''}
function openPage(name,fn){snap();A.fillStyle='#fff';A.fillRect(0,0,W,H);L.clearRect(0,0,W,H);G.clearRect(0,0,W,H);ink(L);fn(L);setMode('colour','Colouring: '+name+'. Try the 🪣 Fill tool!');state.tool='fill';toolBar();tabsTo('draw')}
function thumbs(el,set){el.innerHTML='';Object.keys(set).forEach(function(k){var b=document.createElement('button');b.className='card';var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);ink(x);set[k](x);b.appendChild(c);b.appendChild(document.createTextNode(k));b.onclick=function(){openPage(k,set[k])};el.appendChild(b)})}
thumbs($('pages'),Object.assign({},PAGES,CALMPAGES));
/* learn to draw */
function arcS(x,y,r,a,b){return function(c){c.beginPath();c.arc(x,y,r,a,b);c.stroke()}}
var GUIDES={
'Coffee cup mascot':[function(c){P(c,[400,330,800,330,750,760,450,760],1)},arcS(810,520,80,-1.2,1.2),function(c){dot(c,530,500,14);dot(c,670,500,14)},function(c){smile(c,600,560,60)},function(c){c.beginPath();c.moveTo(520,280);c.bezierCurveTo(480,230,560,200,520,150);c.moveTo(680,280);c.bezierCurveTo(640,230,720,200,680,150);c.stroke()}],
'Cat':[function(c){E(c,600,330,160,140)},function(c){P(c,[470,260,480,150,550,215]);P(c,[730,260,720,150,650,215])},function(c){dot(c,545,320,12);dot(c,655,320,12);P(c,[585,370,615,370,600,385],1)},function(c){E(c,600,600,230,200)},function(c){c.beginPath();c.moveTo(820,650);c.bezierCurveTo(1000,650,950,450,1050,430);c.stroke()}],
'Fish':[function(c){E(c,560,450,300,180)},function(c){P(c,[850,450,1050,300,1050,600],1)},function(c){dot(c,380,410,16);smile(c,330,470,30)},arcS(560,450,120,-1.2,1.2)],
'Flower':[function(c){E(c,600,330,80,80)},function(c){for(var i=0;i<8;i+=2){var a=i*Math.PI/4;c.beginPath();c.ellipse(600+Math.cos(a)*150,330+Math.sin(a)*150,90,55,a,0,7);c.stroke()}},function(c){for(var i=1;i<8;i+=2){var a=i*Math.PI/4;c.beginPath();c.ellipse(600+Math.cos(a)*150,330+Math.sin(a)*150,90,55,a,0,7);c.stroke()}},function(c){P(c,[600,480,600,850]);c.beginPath();c.ellipse(500,680,100,40,-.5,0,7);c.stroke()}],
'Car':[function(c){P(c,[200,600,200,480,350,470,450,330,780,330,880,470,1000,490,1000,600],1)},function(c){P(c,[480,460,530,370,640,370,640,460],1);P(c,[680,460,680,370,760,370,820,460],1)},function(c){E(c,360,620,80,80);E(c,840,620,80,80)}],
'Dinosaur':[function(c){c.beginPath();c.moveTo(250,600);c.bezierCurveTo(300,350,750,300,800,450);c.bezierCurveTo(850,300,900,180,1000,200);c.bezierCurveTo(1080,210,1080,290,1000,300);c.bezierCurveTo(950,320,920,450,880,600);c.bezierCurveTo(800,650,350,680,250,600);c.stroke()},function(c){P(c,[250,600,80,640,270,650])},function(c){P(c,[400,650,400,780,470,780,470,665]);P(c,[720,650,720,780,790,780,790,640])},function(c){dot(c,1010,240,10);for(var i=0;i<5;i++)P(c,[380+i*90,400-i*10,420+i*90,330-i*10,460+i*90,390-i*12])}]};
var gName,gStep;
function drawGuide(){G.clearRect(0,0,W,H);var st=GUIDES[gName];for(var i=0;i<=gStep;i++){ink(G);G.strokeStyle=G.fillStyle=i==gStep?'rgba(42,111,219,.55)':'rgba(120,140,160,.3)';G.lineWidth=i==gStep?9:6;st[i](G)}
 $('prompt').textContent='Learn to draw a '+gName.toLowerCase()+': step '+(gStep+1)+' of '+st.length+'. Draw over the blue line.';
 $('extra').innerHTML='<button class="big" id="gB">◀ Back</button><button class="big" id="gN">'+(gStep==st.length-1?'Finish ✓':'Next step ▶')+'</button>';
 $('gB').onclick=function(){if(gStep>0){gStep--;drawGuide()}};$('gN').onclick=function(){if(gStep<st.length-1){gStep++;drawGuide()}else{G.clearRect(0,0,W,H);setMode('free','Well done! You drew a '+gName.toLowerCase()+'. 🌟')}}}
(function(){var el=$('guides');Object.keys(GUIDES).forEach(function(k){var b=document.createElement('button');b.className='card';var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,H);ink(x);GUIDES[k].forEach(function(f){f(x)});b.appendChild(c);b.appendChild(document.createTextNode(k));
 b.onclick=function(){snap();A.fillStyle='#fff';A.fillRect(0,0,W,H);L.clearRect(0,0,W,H);setMode('learn');gName=k;gStep=0;state.tool='brush';toolBar();tabsTo('draw');drawGuide()};el.appendChild(b)})})();
/* calm art */
var FEEL=[['😊','happy'],['😢','sad'],['😠','cross'],['😟','worried'],['😴','tired'],['😌','calm'],['🤩','excited'],['😕','confused']];
$('cFeel').onclick=function(){tabsTo('draw');setMode('feel','How do you feel today? Pick a face, then draw it any way you like. There is no right or wrong.');
 $('extra').innerHTML=FEEL.map(function(f){return '<button class="big" data-f="'+f[1]+'">'+f[0]+' '+f[1]+'</button>'}).join('');
 $('extra').querySelectorAll('[data-f]').forEach(function(b){b.onclick=function(){$('prompt').textContent='Feeling '+b.dataset.f+'. What colour is that feeling? What shape? Draw it slowly.';state.tool='crayon';toolBar()}})};
$('cMand').onclick=function(){tabsTo('colour');$('pages').lastChild.scrollIntoView()};
$('cBreath').onclick=function(){tabsTo('draw');snap();A.fillStyle='#fff';A.fillRect(0,0,W,H);L.clearRect(0,0,W,H);G.clearRect(0,0,W,H);setMode('breath','Breathing doodle: trace around the circle slowly. Breathe in as it grows, out as it shrinks. Go at your own pace.');
 ink(G);G.strokeStyle='rgba(124,198,164,.6)';G.setLineDash([18,18]);G.beginPath();G.arc(600,450,230,0,7);G.stroke();G.setLineDash([]);
 var b=$('breath'),t=$('breathTxt'),big=false;b.style.display=t.style.display='block';function step(){big=!big;b.style.transform='translate(-50%,-50%) scale('+(big?1.15:.6)+')';t.textContent=big?'Breathe in…':'Breathe out…'}step();stopBreath.h=setInterval(step,4500);
 $('extra').innerHTML='<button class="big" id="bStop">I\'m done</button>';$('bStop').onclick=function(){setMode('free','Lovely breathing. 🌿')};state.tool='marker';toolBar()};
$('cWorry').onclick=function(){tabsTo('draw');snap();A.fillStyle='#fff';A.fillRect(0,0,W,H);L.clearRect(0,0,W,H);G.clearRect(0,0,W,H);setMode('worry','Worry box: draw a worry. When you are ready, tap "Fold it away".');$('box').style.display='block';
 $('extra').innerHTML='<button class="big" id="wF">📦 Fold it away</button>';$('wF').onclick=function(){var snapC=document.createElement('canvas');snapC.width=W;snapC.height=H;snapC.getContext('2d').drawImage(art,0,0);var k=0,calm=document.body.classList.contains('calm');
  (function fr(){k+=calm?1:.05;A.fillStyle='#fff';A.fillRect(0,0,W,H);if(k<1){var s=1-k;A.drawImage(snapC,W*0.88-(W*s)*0.88,H*0.88-(H*s)*0.88,W*s,H*s*(1-k*0.5));requestAnimationFrame(fr)}else{undo=[];$('prompt').textContent='Your worry is folded away in the box. You can talk about it with a grown-up you trust any time. 💙'}})()};state.tool='crayon';toolBar()};
var MOOD=['😊','😌','😐','😟','😢','😠','😴','🤩'],mood='';
function jr(){var J=[];try{J=JSON.parse(localStorage.getItem('cbkd_journal')||'[]')}catch(e){}return J}
function jl(){var J=jr();$('journal').innerHTML=J.map(function(j,i){return '<li>'+j.d+' '+j.m+' '+j.n.replace(/[<>&]/g,'')+' <button data-i="'+i+'">✕</button></li>'}).reverse().join('')||'<li>No entries yet.</li>';
 $('journal').querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){var J=jr();J.splice(+b.dataset.i,1);localStorage.setItem('cbkd_journal',JSON.stringify(J));jl()}})}
$('cMood').onclick=function(){$('moodWrap').hidden=false;$('moodFaces').innerHTML=MOOD.map(function(m){return '<button class="tb" data-m="'+m+'" style="font-size:30px">'+m+'</button>'}).join('');
 $('moodFaces').querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){mood=b.dataset.m;$('moodFaces').querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x==b)})}});jl();$('moodWrap').scrollIntoView()};
$('moodSave').onclick=function(){if(!mood){alert('Pick a face first.');return}var J=jr();J.push({d:new Date().toLocaleDateString('en-AU'),m:mood,n:$('moodNote').value});try{localStorage.setItem('cbkd_journal',JSON.stringify(J))}catch(e){}$('moodNote').value='';mood='';jl()};
/* calm mode */
function setCalm(on){document.body.classList.toggle('calm',on);$('calmBtn').textContent=on?'🌙 Calm mode: on':'🌙 Calm mode: off';try{localStorage.setItem('cbkd_calm',on?'1':'')}catch(e){};toolBar()}
$('calmBtn').onclick=function(){setCalm(!document.body.classList.contains('calm'))};
var c0='';try{c0=localStorage.getItem('cbkd_calm')}catch(e){};setCalm(!!c0||matchMedia('(prefers-reduced-motion: reduce)').matches);
window.CBKD={pages:Object.keys(PAGES).length+Object.keys(CALMPAGES).length,guides:Object.keys(GUIDES).length,openPage:openPage,PAGES:PAGES,fill:fill};
function cbcp(c,w,h,bg){var t=document.createElement('canvas');t.width=c.width;t.height=c.height;t.getContext('2d').drawImage(c,0,0);var k=Math.min(1,w/c.width,h/c.height);c.width=w;c.height=h;var x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.drawImage(t,0,0,t.width*k,t.height*k)};window.CBResizeCanvas=function(w,h){w=Math.round(w);h=Math.round(h);if(w<50||h<50||(w==W&&h==H))return;cbcp(art,w,h,'#fff');cbcp(lines,w,h,null);cbcp(guide,w,h,null);W=w;H=h;var st=art.parentElement;if(st)st.style.aspectRatio=W+'/'+H;undo.length=0};
})();
