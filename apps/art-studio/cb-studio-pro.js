/* Coffeebreak Pro Studio - over 10,000 drawing tool combinations. Made by Coffeebreak. Free, works offline. */
(function(){if(window.CBSP)return;window.CBSP=1;
var W=1600,H=1200,NAME=(document.currentScript&&document.currentScript.dataset.name)||document.title||'Coffeebreak';
var css=`#cbsp-open{position:fixed;left:12px;bottom:76px;z-index:2147482000;font:700 16px system-ui;padding:12px 16px;border-radius:26px;border:0;background:#7a3cff;color:#fff;box-shadow:0 4px 14px #0005;cursor:pointer}
#cbsp{position:fixed;inset:0;z-index:2147483100;background:#1d1424;display:none;flex-direction:column;font:15px system-ui;color:#fff}
#cbsp.on{display:flex}#cbsp .bar{display:flex;flex-wrap:wrap;gap:5px;padding:6px;background:#2c1d38;align-items:center;max-height:38vh;overflow:auto}@media(max-width:700px){#cbsp .bar{max-height:26vh}#cbsp .lay{max-height:12vh;overflow:auto}#cbsp.min .bar,#cbsp.min .lay,#cbsp.min .pal{display:none}}#cbsp .mini{position:absolute;right:8px;top:8px;z-index:2}
#cbsp button,#cbsp select,#cbsp input[type=number]{min-height:42px;font-size:15px;border-radius:10px;border:1px solid #fff3;background:#fff;color:#222;padding:2px 8px;cursor:pointer}
#cbsp button.sel{outline:3px solid #ff5fa2}#cbsp label{display:inline-flex;align-items:center;gap:4px;font-size:14px}
#cbsp .stage{flex:1;position:relative;overflow:hidden;background:#555;touch-action:none}
#cbsp canvas.v{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:100%;max-height:100%;background:#fff;box-shadow:0 0 20px #0008;touch-action:none}
#cbsp .pal{display:flex;gap:2px;overflow-x:auto;padding:4px;background:#2c1d38;flex:0 0 auto}#cbsp .pal b{flex:0 0 26px;height:26px;border-radius:5px;cursor:pointer;border:1px solid #0003}
#cbsp .lay{display:flex;gap:4px;flex-wrap:wrap;padding:4px;background:#24182e}#cbsp .msg{position:absolute;left:50%;top:8px;transform:translateX(-50%);background:#000a;padding:6px 14px;border-radius:16px;pointer-events:none;display:none}
#cbsp .ttl{font-weight:800;margin-right:6px}`;
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
function el(t,p,k){var e=document.createElement(t);if(p)for(var a in p){if(a=='style')e.style.cssText=p[a];else if(a in e)e[a]=p[a];else e.setAttribute(a,p[a])}(k||[]).forEach(function(c){e.append(c)});return e}
var BR=['Pen','Pencil','Fine liner','Ink (pressure)','Marker','Felt tip','Highlighter','Crayon','Chalk','Charcoal','Watercolour','Airbrush','Spray can','Oil paint','Calligraphy','Flat brush','Fan brush','Dotted line','Dashed line','Neon glow','Rainbow','Sparkle','Star stamps','Heart stamps','Flower stamps','Leaf stamps','Fur','Hair strands','Grass','Scales','Stitch line','Chain','Zigzag','Wave','Ribbon','Smudge','Blur','Eraser','Soft eraser','Pixel','Confetti','Bubbles','Mirror ink','Shadow brush','Outline pen','Glitter','Stipple','Hatching','Cross hatch','Tattoo liner','Tattoo shader'];
var SH=['Line','Arrow','Rectangle','Rounded box','Ellipse','Circle','Triangle','Diamond','Star','Heart','Polygon','Speech bubble','Cloud','Lightning','Spiral','Grid','Banner','Moon','Cross','Ring'];
var FONTS=['system-ui','Georgia','Courier New','Impact','Comic Sans MS','Brush Script MT','Times New Roman','Trebuchet MS','Verdana','Papyrus','Copperplate','fantasy','cursive'];
var BL=['source-over','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
var SYM=[['off','No symmetry'],['x','Mirror left/right'],['y','Mirror top/bottom'],['xy','Four ways'],['r3','Mandala 3'],['r4','Mandala 4'],['r5','Mandala 5'],['r6','Mandala 6'],['r8','Mandala 8'],['r10','Mandala 10'],['r12','Mandala 12'],['r16','Mandala 16'],['r24','Mandala 24']];
var PAPER=['White','Cream','Black','Kraft','Grid','Dots','Lined','Transparent','Pastel pink','Sky blue'];
var FIL=['Greyscale','Sepia','Invert','Brighter','Darker','Posterise','Blur','Outline','Sketch','Warm','Cool','Sharpen'];
var COLS=[];for(var l=12;l<=92;l+=8)for(var h=0;h<360;h+=4)COLS.push('hsl('+h+',85%,'+l+'%)');for(var g=0;g<=100;g+=1.25)COLS.push('hsl(0,0%,'+g+'%)');
var COMBOS=BR.length*SH.length*COLS.length;
var S={tool:'brush',br:'Pen',sh:'Rectangle',fill:'outline',size:12,op:1,col:'#222222',bl:'source-over',sym:'off',font:'Georgia',poly:6,grad:'none',col2:'#ff5fa2'};
try{Object.assign(S,JSON.parse(localStorage.cbspS||'{}'))}catch(e){}
var root=el('div',{id:'cbsp'}),bar=el('div',{className:'bar'}),pal=el('div',{className:'pal'}),lay=el('div',{className:'lay'}),stage=el('div',{className:'stage'}),msg=el('div',{className:'msg'});
var view=el('canvas',{className:'v',width:W,height:H});stage.append(view,msg);root.append(bar,pal,lay,stage);
var V=view.getContext('2d');var mini=el('button',{className:'mini',textContent:'🧰 Hide/show tools'});mini.onclick=function(){root.classList.toggle('min')};stage.append(mini);
var L=[],cur=0,paper='White',UND=[],RED=[];
function newLayer(n){var c=el('canvas',{width:W,height:H});return{c:c,x:c.getContext('2d'),n:n||('Layer '+(L.length+1)),vis:true,op:1}}
L.push(newLayer('Layer 1'));
function say(t){msg.textContent=t;msg.style.display='block';clearTimeout(say.t);say.t=setTimeout(function(){msg.style.display='none'},1600)}
function sel(o,v,f){var s=el('select');o.forEach(function(x){var k=Array.isArray(x)?x[0]:x,n=Array.isArray(x)?x[1]:x;s.append(el('option',{value:k,textContent:n,selected:k==v}))});s.onchange=function(){f(s.value);save()};return s}
function btn(t,f,id){var b=el('button',{textContent:t});if(id)b.dataset.k=id;b.onclick=f;return b}
function lab(t,c){return el('label',{},[t,c])}
function save(){try{localStorage.cbspS=JSON.stringify(S)}catch(e){}}
var tb={};
function setTool(t){S.tool=t;for(var k in tb)tb[k].classList.toggle('sel',k==t);save()}
bar.append(el('span',{className:'ttl',textContent:'🎨 Pro Studio'}));
['brush','shape','fill','text','pick'].forEach(function(t){tb[t]=btn({brush:'🖌️ Brush',shape:'⬛ Shape',fill:'🪣 Fill',text:'🔤 Text',pick:'💧 Pick colour'}[t],function(){setTool(t)});bar.append(tb[t])});
bar.append(lab('Brush',sel(BR,S.br,function(v){S.br=v;setTool('brush')})),lab('Shape',sel(SH,S.sh,function(v){S.sh=v;setTool('shape')})),
 lab('Sides',(function(){var i=el('input',{type:'number',min:3,max:24,value:S.poly,style:'width:58px'});i.oninput=function(){S.poly=+i.value||6;save()};return i})()),
 lab('Fill',sel([['outline','Outline'],['fill','Filled'],['both','Filled + outline']],S.fill,function(v){S.fill=v})),
 lab('Gradient',sel([['none','None'],['lin','Straight'],['rad','Round']],S.grad,function(v){S.grad=v})),
 lab('Size',(function(){var i=el('input',{type:'range',min:1,max:200,value:S.size});i.oninput=function(){S.size=+i.value;save()};return i})()),
 lab('Opacity',(function(){var i=el('input',{type:'range',min:5,max:100,value:S.op*100});i.oninput=function(){S.op=i.value/100;save()};return i})()),
 lab('Colour',(function(){var i=el('input',{type:'color',value:S.col});i.oninput=function(){S.col=i.value;save()};tb.ci=i;return i})()),
 lab('Colour 2',(function(){var i=el('input',{type:'color',value:S.col2});i.oninput=function(){S.col2=i.value;save()};return i})()),
 lab('Blend',sel(BL,S.bl,function(v){S.bl=v})),lab('Symmetry',sel(SYM,S.sym,function(v){S.sym=v})),lab('Font',sel(FONTS,S.font,function(v){S.font=v})),
 lab('Paper',sel(PAPER,paper,function(v){paper=v;render()})),
 lab('Filter',(function(){var s=sel([['','Choose']].concat(FIL),'',function(v){if(v){snap();filter(v);s.value=''}});return s})()),
 btn('↶ Undo',undo),btn('↷ Redo',redo),btn('↔ Flip',function(){snap();xf('h')}),btn('↕ Flip',function(){snap();xf('v')}),btn('⟳ Rotate',function(){snap();xf('r')}),
 btn('🖼️ Add picture',function(){fi.click()}),btn('🧹 Clear layer',function(){snap();L[cur].x.clearRect(0,0,W,H);render()}),
 btn('💾 Save PNG',savePNG),btn('✖ Close',function(){root.classList.remove('on');autosave()}));
bar.append(el('span',{style:'font-size:12px;opacity:.8',textContent:BR.length+' brushes · '+SH.length+' shapes · '+COLS.length.toLocaleString('en-AU')+' colours · '+BL.length+' blends · '+SYM.length+' symmetry modes · '+FONTS.length+' fonts · '+FIL.length+' filters: over '+COMBOS.toLocaleString('en-AU')+' tool combinations'}));
var fi=el('input',{type:'file',accept:'image/*',style:'display:none'});root.append(fi);
fi.onchange=function(){var f=fi.files[0];if(!f)return;var im=new Image();im.onload=function(){snap();var s=Math.min(W/im.width,H/im.height,1);L[cur].x.drawImage(im,(W-im.width*s)/2,(H-im.height*s)/2,im.width*s,im.height*s);render()};im.src=URL.createObjectURL(f);fi.value=''};
var REC=[];function recent(c){REC=[c].concat(REC.filter(function(x){return x!=c})).slice(0,12)}
COLS.forEach(function(c){var b=el('b',{title:c});b.style.background=c;b.onclick=function(){S.col=toHex(c);tb.ci.value=S.col;recent(S.col);save();say('Colour picked')};pal.append(b)});
function toHex(c){var x=document.createElement('canvas').getContext('2d');x.fillStyle=c;return x.fillStyle}
function drawLayers(){lay.innerHTML='';lay.append(el('span',{textContent:'Layers:'}));L.forEach(function(l,i){var b=btn((l.vis?'👁 ':'🚫 ')+l.n,function(){cur=i;drawLayers()});if(i==cur)b.classList.add('sel');lay.append(b)});
 lay.append(btn('➕ Layer',function(){if(L.length>=10)return say('10 layers is the most');L.push(newLayer());cur=L.length-1;drawLayers()}),btn('Hide/show',function(){L[cur].vis=!L[cur].vis;drawLayers();render()}),
 btn('⬆ Up',function(){if(cur<L.length-1){var t=L[cur];L[cur]=L[cur+1];L[cur+1]=t;cur++;drawLayers();render()}}),btn('⬇ Down',function(){if(cur>0){var t=L[cur];L[cur]=L[cur-1];L[cur-1]=t;cur--;drawLayers();render()}}),
 btn('🗑 Delete layer',function(){if(L.length<2)return;L.splice(cur,1);cur=Math.max(0,cur-1);drawLayers();render()}),
 lab('Layer opacity',(function(){var i=el('input',{type:'range',min:0,max:100,value:L[cur].op*100});i.oninput=function(){L[cur].op=i.value/100;render()};return i})()))}
function paperFill(x){var p={White:'#fff',Cream:'#fff6e6',Black:'#111','Pastel pink':'#ffe4ef','Sky blue':'#e3f2ff',Kraft:'#c8a27a'}[paper];if(paper=='Transparent'){return}x.fillStyle=p||'#fff';x.fillRect(0,0,W,H);
 if(paper=='Grid'||paper=='Lined'||paper=='Dots'){x.strokeStyle='#9cc4';x.fillStyle='#89a';for(var i=0;i<W;i+=40)for(var j=0;j<H;j+=40){if(paper=='Dots')x.fillRect(i,j,3,3)}x.beginPath();if(paper=='Grid')for(var i2=0;i2<W;i2+=40){x.moveTo(i2,0);x.lineTo(i2,H)}if(paper!='Dots')for(var j2=0;j2<H;j2+=40){x.moveTo(0,j2);x.lineTo(W,j2)}x.stroke()}}
var prev=null;
function render(){V.globalAlpha=1;V.globalCompositeOperation='source-over';V.clearRect(0,0,W,H);paperFill(V);L.forEach(function(l){if(l.vis){V.globalAlpha=l.op;V.drawImage(l.c,0,0)}});V.globalAlpha=1;if(prev)prev()}
function snap(){UND.push({i:cur,d:L[cur].x.getImageData(0,0,W,H)});if(UND.length>30)UND.shift();RED.length=0}
function undo(){var u=UND.pop();if(!u)return say('Nothing to undo');var l=L[u.i]||L[0];RED.push({i:u.i,d:l.x.getImageData(0,0,W,H)});l.x.putImageData(u.d,0,0);render()}
function redo(){var u=RED.pop();if(!u)return;var l=L[u.i]||L[0];UND.push({i:u.i,d:l.x.getImageData(0,0,W,H)});l.x.putImageData(u.d,0,0);render()}
function xf(m){var l=L[cur],t=el('canvas',{width:W,height:H}),q=t.getContext('2d');q.drawImage(l.c,0,0);l.x.save();l.x.clearRect(0,0,W,H);if(m=='h'){l.x.translate(W,0);l.x.scale(-1,1)}else if(m=='v'){l.x.translate(0,H);l.x.scale(1,-1)}else{l.x.translate(W/2,H/2);l.x.rotate(Math.PI/2);l.x.scale(H/W,W/H);l.x.translate(-W/2,-H/2)}l.x.drawImage(t,0,0);l.x.restore();render()}
function filter(f){var x=L[cur].x;if(f=='Blur'||f=='Brighter'||f=='Darker'||f=='Sharpen'){var t=el('canvas',{width:W,height:H});t.getContext('2d').drawImage(L[cur].c,0,0);x.clearRect(0,0,W,H);x.filter={Blur:'blur(4px)',Brighter:'brightness(1.25)',Darker:'brightness(.8)',Sharpen:'contrast(1.4)'}[f];x.drawImage(t,0,0);x.filter='none';render();return}
 var d=x.getImageData(0,0,W,H),a=d.data,o=f=='Outline'||f=='Sketch'?new Uint8ClampedArray(a):null;
 for(var i=0;i<a.length;i+=4){var r=a[i],g=a[i+1],b=a[i+2],y=.3*r+.59*g+.11*b;
  if(f=='Greyscale')a[i]=a[i+1]=a[i+2]=y;else if(f=='Sepia'){a[i]=Math.min(255,y+40);a[i+1]=Math.min(255,y+20);a[i+2]=y*.8}else if(f=='Invert'){a[i]=255-r;a[i+1]=255-g;a[i+2]=255-b}
  else if(f=='Posterise'){a[i]=(r>>6)<<6;a[i+1]=(g>>6)<<6;a[i+2]=(b>>6)<<6}else if(f=='Warm'){a[i]=Math.min(255,r+25);a[i+2]=Math.max(0,b-20)}else if(f=='Cool'){a[i+2]=Math.min(255,b+25);a[i]=Math.max(0,r-20)}
  else if(o){var p=i/4,X=p%W;if(X<W-1&&i+4*W<a.length){var e=Math.abs(o[i]-o[i+4])+Math.abs(o[i]-o[i+4*W])+Math.abs(o[i+3]-o[i+7])+Math.abs(o[i+3]-o[i+3+4*W]);var v=e>40?0:255;a[i]=a[i+1]=a[i+2]=v;a[i+3]=f=='Sketch'?(v?0:255):(v?0:255)}}}
 x.putImageData(d,0,0);render()}
function syms(x,y){var o=[[x,y]],cx=W/2,cy=H/2;if(S.sym=='x'||S.sym=='xy')o.push([W-x,y]);if(S.sym=='y'||S.sym=='xy')o.push([x,H-y]);if(S.sym=='xy')o.push([W-x,H-y]);
 if(S.sym[0]=='r'){var n=+S.sym.slice(1);o=[];for(var k=0;k<n;k++){var a=k*2*Math.PI/n,dx=x-cx,dy=y-cy;o.push([cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)])}}return o}
function pos(e){var r=view.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,p:e.pointerType=='pen'||e.pressure>0&&e.pressure!=.5?Math.max(.1,e.pressure):1}}
var down=null,last=null,hue=0;
function stamp(x,ctx,X,Y,s,kind){x.save();x.translate(X,Y);x.rotate(Math.random()*6.28);x.font=s*2+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(kind,0,0);x.restore()}
function seg(a,b,pr){var x=L[cur].x,sz=S.size*pr,br=S.br;
 syms(a.x,a.y).forEach(function(A,i){var B=syms(b.x,b.y)[i];x.save();x.globalCompositeOperation=br.indexOf('raser')>0?'destination-out':S.bl;x.globalAlpha=S.op;x.strokeStyle=x.fillStyle=S.col;x.lineCap=x.lineJoin='round';x.lineWidth=sz;
  var dx=B[0]-A[0],dy=B[1]-A[1],d=Math.hypot(dx,dy)||1,R=Math.random;
  function line(){x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.stroke()}
  function dots(n,sp,r){for(var k=0;k<n;k++){var t=R();x.beginPath();x.arc(A[0]+dx*t+(R()-.5)*sp,A[1]+dy*t+(R()-.5)*sp,r,0,7);x.fill()}}
  switch(br){case 'Pencil':x.globalAlpha=S.op*.6;x.lineWidth=Math.max(1,sz/3);line();break;case 'Fine liner':x.lineWidth=Math.max(1,sz/4);line();break;case 'Ink (pressure)':case 'Tattoo liner':x.lineWidth=Math.max(1,sz*pr*(br=='Tattoo liner'?.6:1));line();break;
   case 'Marker':x.globalAlpha=S.op*.7;x.lineCap='square';line();break;case 'Felt tip':x.globalAlpha=S.op*.85;line();break;case 'Highlighter':x.globalAlpha=.3;x.globalCompositeOperation='multiply';x.lineCap='butt';x.lineWidth=sz*1.6;line();break;
   case 'Crayon':for(var k=0;k<3;k++){x.globalAlpha=S.op*.35;x.lineWidth=sz*(.5+R()*.5);x.beginPath();x.moveTo(A[0]+(R()-.5)*sz/2,A[1]+(R()-.5)*sz/2);x.lineTo(B[0]+(R()-.5)*sz/2,B[1]+(R()-.5)*sz/2);x.stroke()}break;
   case 'Chalk':x.globalAlpha=S.op*.5;dots(sz*2,sz,1.5);break;case 'Charcoal':x.globalAlpha=S.op*.25;dots(sz*3,sz*1.2,2);x.lineWidth=sz/3;line();break;
   case 'Watercolour':x.globalAlpha=S.op*.08;for(var k2=0;k2<4;k2++){x.lineWidth=sz*(1+R());line()}break;case 'Airbrush':x.globalAlpha=S.op*.05;x.shadowBlur=sz;x.shadowColor=S.col;line();break;
   case 'Spray can':x.globalAlpha=S.op*.6;for(var k3=0;k3<sz*1.5;k3++){var a3=R()*6.28,r3=R()*sz*1.2;x.fillRect(B[0]+Math.cos(a3)*r3,B[1]+Math.sin(a3)*r3,1.4,1.4)}break;
   case 'Oil paint':x.globalAlpha=S.op*.9;x.lineWidth=sz*1.2;line();x.globalAlpha=.2;x.strokeStyle='#fff';x.lineWidth=sz*.2;line();break;
   case 'Calligraphy':case 'Flat brush':for(var k4=-sz/2;k4<sz/2;k4+=1){x.globalAlpha=S.op*(br=='Flat brush'?.4:1);x.lineWidth=1.5;x.beginPath();x.moveTo(A[0]+k4*.7,A[1]-k4*.7);x.lineTo(B[0]+k4*.7,B[1]-k4*.7);x.stroke()}break;
   case 'Fan brush':for(var k5=0;k5<7;k5++){x.lineWidth=1;x.globalAlpha=S.op*.5;var o5=(k5-3)*sz/5;x.beginPath();x.moveTo(A[0]+o5,A[1]);x.lineTo(B[0]+o5*1.2,B[1]+Math.abs(o5)*.3);x.stroke()}break;
   case 'Dotted line':if(R()<.5){x.beginPath();x.arc(B[0],B[1],sz/2,0,7);x.fill()}break;case 'Dashed line':x.setLineDash([sz*2,sz*1.5]);x.lineCap='butt';line();break;
   case 'Neon glow':x.shadowBlur=sz*1.5;x.shadowColor=S.col;line();x.strokeStyle='#fff';x.lineWidth=sz/3;line();break;case 'Rainbow':hue=(hue+4)%360;x.strokeStyle='hsl('+hue+',90%,55%)';line();break;
   case 'Sparkle':case 'Glitter':x.globalAlpha=S.op;for(var k6=0;k6<(br=='Glitter'?6:2);k6++){x.fillStyle=br=='Glitter'?'hsl('+(R()*360)+',90%,70%)':S.col;var s6=R()*sz/2;x.fillRect(B[0]+(R()-.5)*sz*2,B[1]+(R()-.5)*sz*2,s6,s6)}break;
   case 'Star stamps':if(d>2&&R()<.3)stamp(x,0,B[0],B[1],sz,'★');break;case 'Heart stamps':if(R()<.3)stamp(x,0,B[0],B[1],sz,'♥');break;case 'Flower stamps':if(R()<.25)stamp(x,0,B[0],B[1],sz,'✿');break;case 'Leaf stamps':if(R()<.25)stamp(x,0,B[0],B[1],sz,'❦');break;
   case 'Fur':case 'Hair strands':case 'Grass':for(var k7=0;k7<5;k7++){x.lineWidth=1;x.globalAlpha=S.op*.7;var px=B[0]+(R()-.5)*sz,py=B[1]+(R()-.5)*sz;x.beginPath();x.moveTo(px,py);x.lineTo(px+(br=='Grass'?(R()-.5)*4:-dy/d*sz*(br=='Hair strands'?2:1)),py+(br=='Grass'?-sz*1.5:dx/d*sz));x.stroke()}break;
   case 'Scales':if(R()<.3){x.lineWidth=2;x.beginPath();x.arc(B[0],B[1],sz/2,Math.PI*.1,Math.PI*.9);x.stroke()}break;case 'Stitch line':x.setLineDash([sz,sz]);x.lineWidth=Math.max(2,sz/4);line();break;
   case 'Chain':if(R()<.3){x.lineWidth=Math.max(2,sz/5);x.beginPath();x.ellipse(B[0],B[1],sz/2,sz/4,Math.atan2(dy,dx),0,7);x.stroke()}break;
   case 'Zigzag':case 'Wave':var n=d/4|0;x.lineWidth=Math.max(1,sz/4);x.beginPath();x.moveTo(A[0],A[1]);for(var k8=1;k8<=Math.max(1,n);k8++){var t8=k8/Math.max(1,n),off=(br=='Zigzag'?(k8%2?1:-1):Math.sin((last.t=(last.t||0)+.5)))*sz/2;x.lineTo(A[0]+dx*t8-dy/d*off,A[1]+dy*t8+dx/d*off)}x.stroke();break;
   case 'Ribbon':x.globalAlpha=S.op*.6;x.beginPath();x.moveTo(A[0]-sz/2,A[1]-sz/2);x.lineTo(B[0]-sz/2,B[1]-sz/2);x.lineTo(B[0]+sz/2,B[1]+sz/2);x.lineTo(A[0]+sz/2,A[1]+sz/2);x.fill();break;
   case 'Smudge':case 'Blur':var s9=Math.max(4,sz|0);try{var im=x.getImageData(A[0]-s9/2,A[1]-s9/2,s9,s9);if(br=='Blur'){x.filter='blur(2px)'}x.globalAlpha=.5;var tc=el('canvas',{width:s9,height:s9});tc.getContext('2d').putImageData(im,0,0);x.drawImage(tc,B[0]-s9/2,B[1]-s9/2)}catch(e){}x.filter='none';break;
   case 'Eraser':line();break;case 'Soft eraser':x.globalAlpha=.25;x.shadowBlur=sz;x.shadowColor='#000';line();break;case 'Pixel':var q=Math.max(4,sz|0);x.fillRect(Math.floor(B[0]/q)*q,Math.floor(B[1]/q)*q,q,q);break;
   case 'Confetti':for(var k10=0;k10<3;k10++){x.fillStyle='hsl('+(R()*360)+',90%,60%)';x.fillRect(B[0]+(R()-.5)*sz*2,B[1]+(R()-.5)*sz*2,sz/3,sz/6)}break;
   case 'Bubbles':if(R()<.3){x.lineWidth=2;x.beginPath();x.arc(B[0]+(R()-.5)*sz,B[1]+(R()-.5)*sz,R()*sz/2+2,0,7);x.stroke()}break;
   case 'Mirror ink':line();x.globalAlpha=S.op*.4;x.beginPath();x.moveTo(W-A[0],A[1]);x.lineTo(W-B[0],B[1]);x.stroke();break;case 'Shadow brush':x.shadowBlur=8;x.shadowOffsetX=6;x.shadowOffsetY=6;x.shadowColor='#0006';line();break;
   case 'Outline pen':x.lineWidth=sz+4;x.strokeStyle='#000';line();x.lineWidth=sz;x.strokeStyle=S.col;line();break;case 'Stipple':case 'Tattoo shader':x.globalAlpha=S.op*(br=='Stipple'?1:.35);dots(br=='Stipple'?3:sz,sz,br=='Stipple'?1.5:sz/6);break;
   case 'Hatching':case 'Cross hatch':x.lineWidth=1;for(var k11=0;k11<3;k11++){var hx=B[0]+(R()-.5)*sz,hy=B[1]+(R()-.5)*sz;x.beginPath();x.moveTo(hx-sz/3,hy+sz/3);x.lineTo(hx+sz/3,hy-sz/3);if(br=='Cross hatch'){x.moveTo(hx-sz/3,hy-sz/3);x.lineTo(hx+sz/3,hy+sz/3)}x.stroke()}break;
   default:line()}
  x.restore()})}
function paintStyle(x,a,b){if(S.grad=='none')return S.col;var g=S.grad=='lin'?x.createLinearGradient(a.x,a.y,b.x,b.y):x.createRadialGradient(a.x,a.y,1,a.x,a.y,Math.max(2,Math.hypot(b.x-a.x,b.y-a.y)));g.addColorStop(0,S.col);g.addColorStop(1,S.col2);return g}
function shape(x,a,b){var w=b.x-a.x,h=b.y-a.y,cx=a.x+w/2,cy=a.y+h/2,rx=Math.abs(w)/2,ry=Math.abs(h)/2,R=Math.max(rx,ry);x.beginPath();
 switch(S.sh){case 'Line':x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);break;case 'Arrow':var an=Math.atan2(h,w),hs=Math.max(14,S.size*3);x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.lineTo(b.x-hs*Math.cos(an-.4),b.y-hs*Math.sin(an-.4));x.moveTo(b.x,b.y);x.lineTo(b.x-hs*Math.cos(an+.4),b.y-hs*Math.sin(an+.4));break;
  case 'Rectangle':x.rect(a.x,a.y,w,h);break;case 'Rounded box':x.roundRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(w),Math.abs(h),Math.min(rx,ry)/2);break;case 'Ellipse':x.ellipse(cx,cy,rx,ry,0,0,7);break;case 'Circle':x.arc(a.x,a.y,Math.hypot(w,h),0,7);break;
  case 'Triangle':x.moveTo(cx,a.y);x.lineTo(b.x,b.y);x.lineTo(a.x,b.y);x.closePath();break;case 'Diamond':x.moveTo(cx,a.y);x.lineTo(b.x,cy);x.lineTo(cx,b.y);x.lineTo(a.x,cy);x.closePath();break;
  case 'Star':for(var i=0;i<10;i++){var r=i%2?R*.45:R,t=i*Math.PI/5-Math.PI/2;x[i?'lineTo':'moveTo'](cx+Math.cos(t)*r,cy+Math.sin(t)*r)}x.closePath();break;
  case 'Heart':x.moveTo(cx,cy+ry);x.bezierCurveTo(cx-rx*2,cy-ry*.2,cx-rx*.6,cy-ry*1.4,cx,cy-ry*.4);x.bezierCurveTo(cx+rx*.6,cy-ry*1.4,cx+rx*2,cy-ry*.2,cx,cy+ry);break;
  case 'Polygon':for(var j=0;j<S.poly;j++){var t2=j*2*Math.PI/S.poly-Math.PI/2;x[j?'lineTo':'moveTo'](cx+Math.cos(t2)*rx,cy+Math.sin(t2)*ry)}x.closePath();break;
  case 'Speech bubble':x.ellipse(cx,cy,rx,ry*.8,0,0,7);x.moveTo(cx-rx*.3,cy+ry*.6);x.lineTo(cx-rx*.6,b.y);x.lineTo(cx,cy+ry*.75);break;
  case 'Cloud':[[-.5,.1,.45],[0,-.2,.55],[.5,.1,.45],[0,.3,.45]].forEach(function(c){x.moveTo(cx+c[0]*rx+c[2]*R,cy+c[1]*ry);x.arc(cx+c[0]*rx,cy+c[1]*ry,c[2]*R,0,7)});break;
  case 'Lightning':x.moveTo(cx+rx*.2,a.y);x.lineTo(a.x,cy+ry*.1);x.lineTo(cx,cy);x.lineTo(cx-rx*.2,b.y);x.lineTo(b.x,cy-ry*.1);x.lineTo(cx,cy);x.closePath();break;
  case 'Spiral':for(var k=0;k<200;k++){var t3=k/200*6*Math.PI;x[k?'lineTo':'moveTo'](cx+Math.cos(t3)*rx*k/200,cy+Math.sin(t3)*ry*k/200)}break;
  case 'Grid':for(var g=0;g<=6;g++){x.moveTo(a.x+w*g/6,a.y);x.lineTo(a.x+w*g/6,b.y);x.moveTo(a.x,a.y+h*g/6);x.lineTo(b.x,a.y+h*g/6)}break;
  case 'Banner':x.moveTo(a.x,a.y);x.lineTo(b.x,a.y);x.lineTo(b.x-rx*.2,cy);x.lineTo(b.x,b.y);x.lineTo(a.x,b.y);x.lineTo(a.x+rx*.2,cy);x.closePath();break;
  case 'Moon':x.arc(cx,cy,R,Math.PI*.3,Math.PI*1.7);x.arc(cx+R*.5,cy,R*.8,Math.PI*1.6,Math.PI*.4,true);x.closePath();break;
  case 'Cross':x.rect(cx-rx/3,a.y,rx*2/3,Math.abs(h));x.rect(a.x,cy-ry/3,Math.abs(w),ry*2/3);break;case 'Ring':x.arc(cx,cy,R,0,7);x.moveTo(cx+R*.6,cy);x.arc(cx,cy,R*.6,0,7,true);break}
 x.globalAlpha=S.op;x.globalCompositeOperation=S.bl;x.lineWidth=Math.max(1,S.size/3);x.lineJoin='round';x.strokeStyle=S.col;x.fillStyle=paintStyle(x,a,b);
 if(S.fill!='outline'&&!/Line|Arrow|Spiral|Grid/.test(S.sh))x.fill('evenodd');if(S.fill!='fill'||/Line|Arrow|Spiral|Grid/.test(S.sh)){if(S.fill=='both')x.strokeStyle='#000';x.stroke()}}
function flood(px,py){px|=0;py|=0;var x=L[cur].x,d=x.getImageData(0,0,W,H),a=d.data,i0=(py*W+px)*4,t=[a[i0],a[i0+1],a[i0+2],a[i0+3]];var c=toHex(S.col),r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b=parseInt(c.slice(5,7),16),al=Math.round(S.op*255);
 if(t[0]==r&&t[1]==g&&t[2]==b&&t[3]==al)return;var st=[px,py],m=function(i){return Math.abs(a[i]-t[0])+Math.abs(a[i+1]-t[1])+Math.abs(a[i+2]-t[2])+Math.abs(a[i+3]-t[3])<60},seen=new Uint8Array(W*H);
 while(st.length){var y=st.pop(),X=st.pop();if(X<0||y<0||X>=W||y>=H)continue;var p=y*W+X;if(seen[p])continue;seen[p]=1;var i=p*4;if(!m(i))continue;a[i]=r;a[i+1]=g;a[i+2]=b;a[i+3]=al;st.push(X+1,y,X-1,y,X,y+1,X,y-1)}x.putImageData(d,0,0)}
view.addEventListener('pointerdown',function(e){e.preventDefault();view.setPointerCapture(e.pointerId);var p=pos(e);
 if(S.tool=='pick'){var c=V.getImageData(p.x|0,p.y|0,1,1).data;S.col='#'+[c[0],c[1],c[2]].map(function(v){return(256+v).toString(16).slice(1)}).join('');tb.ci.value=S.col;say('Picked '+S.col);setTool('brush');return}
 snap();if(S.tool=='fill'){flood(p.x,p.y);render();return}
 if(S.tool=='text'){var t=prompt('Type your words');if(t){var x=L[cur].x;x.save();x.globalAlpha=S.op;x.globalCompositeOperation=S.bl;x.fillStyle=S.col;x.font=(S.size*3)+'px '+S.font;x.textBaseline='middle';syms(p.x,p.y).forEach(function(q){x.fillText(t,q[0],q[1])});x.restore();render()}return}
 down=p;last=p;if(S.tool=='brush'){seg(p,{x:p.x+.1,y:p.y+.1},p.p);render()}});
view.addEventListener('pointermove',function(e){if(!down)return;var p=pos(e);if(S.tool=='brush'){seg(last,p,p.p);last=p;render()}else if(S.tool=='shape'){prev=function(){V.save();shape(V,down,p);V.restore()};render()}});
function up(e){if(!down)return;var p=pos(e);if(S.tool=='shape'){var x=L[cur].x;syms(down.x,down.y).forEach(function(A,i){var B=syms(p.x,p.y)[i];x.save();shape(x,{x:A[0],y:A[1]},{x:B[0],y:B[1]});x.restore()})}prev=null;down=null;render();autosave()}
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
function composite(){var c=el('canvas',{width:W,height:H}),x=c.getContext('2d');paperFill(x);L.forEach(function(l){if(l.vis){x.globalAlpha=l.op;x.drawImage(l.c,0,0)}});x.globalAlpha=1;return c}
function savePNG(){var c=composite(),x=c.getContext('2d'),lg=new Image();function fin(){x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,H-44,W,44);x.fillStyle='#fff';x.font='bold 22px system-ui';x.fillText('Made with '+NAME+' · Coffeebreak · coffeebreaks.itch.io',16,H-15);var a=el('a',{download:'coffeebreak-pro-studio.png',href:c.toDataURL('image/png')});document.body.append(a);a.click();a.remove();say('Saved')}
 if(window.CBPlus||document.querySelector('script[src*="cb-plus"]')){fin();return}lg.onload=function(){x.drawImage(lg,W-120,H-164,110,110);fin()};lg.onerror=fin;lg.src='cb-logo.jpg'}
function autosave(){try{localStorage.cbspArt=composite().toDataURL('image/jpeg',.7)}catch(e){}}
function restore(){var d=localStorage.cbspArt;if(!d)return;var im=new Image();im.onload=function(){L[0].x.drawImage(im,0,0);render()};im.src=d}
document.addEventListener('keydown',function(e){if(!root.classList.contains('on'))return;if((e.ctrlKey||e.metaKey)&&e.key=='z'){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key=='y'){e.preventDefault();redo()}if(e.key=='Escape')root.classList.remove('on')});
var ob=el('button',{id:'cbsp-open',textContent:'🎨 Pro Studio',title:'Over 10,000 drawing tool combinations'});
ob.onclick=function(){root.classList.add('on');render()};
function mount(){if(root.parentNode)return;document.body.append(root,ob);setTool(S.tool);drawLayers();restore();render()}
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.CBStudioPro={open:ob.onclick,S:S,layers:L,savePNG:savePNG,combos:COMBOS};
})();
