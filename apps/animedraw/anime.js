// Coffeebreak Anime Draw – original templates & stamps (all art drawn in code, no copyrighted characters)
(function(){const $=id=>document.getElementById(id),K=CBSketch,S=K.S,W=K.W,H=K.H;
const G='#5fa8d3';
function L(c,f){c.save();c.strokeStyle=G;c.lineWidth=3;c.lineCap='round';c.setLineDash([]);f(c);c.restore()}
function el(c,x,y,rx,ry,r){c.beginPath();c.ellipse(x,y,rx,ry,r||0,0,7);c.stroke()}
function ln(c,a){c.beginPath();c.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)c.lineTo(a[i],a[i+1]);c.stroke()}
const TPL={
 'Head – front':c=>L(c,c=>{el(c,600,400,170,190);ln(c,[430,420,500,600,600,650,700,600,770,420]);ln(c,[600,210,600,650]);ln(c,[430,430,770,430]);ln(c,[470,520,730,520]);el(c,520,440,45,35);el(c,680,440,45,35);ln(c,[560,600,640,600]);ln(c,[560,650,540,780]);ln(c,[640,650,660,780])}),
 'Head – 3/4':c=>L(c,c=>{el(c,600,400,165,185);ln(c,[450,430,520,610,640,650,730,560,760,420]);c.beginPath();c.ellipse(650,400,90,185,0,0,7);c.stroke();ln(c,[435,430,765,430]);el(c,560,445,40,33);el(c,710,445,28,33);ln(c,[610,610,670,600]);ln(c,[560,650,560,790])}),
 'Head – side':c=>L(c,c=>{el(c,580,390,170,185);ln(c,[740,420,770,480,745,500,760,560,700,640,600,660]);ln(c,[420,430,760,430]);el(c,700,445,22,32);el(c,520,470,30,45);ln(c,[620,650,600,790]);ln(c,[520,600,500,790])}),
};
function body(c,sc,wd,pose){L(c,c=>{const cx=600,t=110,h=sc;el(c,cx,t+60*h,50*h,60*h);const sh=t+130*h,hp=t+330*h;
 ln(c,[cx,t+120*h,cx,hp]);ln(c,[cx-80*wd,sh,cx+80*wd,sh]);ln(c,[cx-60*wd,hp,cx+60*wd,hp]);ln(c,[cx-60*wd,sh+20,cx-45*wd,hp,cx-60*wd,sh+20]);ln(c,[cx+60*wd,sh+20,cx+45*wd,hp]);
 const a=pose=='wave'?[cx+80*wd,sh,cx+150*wd,sh-90*h,cx+170*wd,sh-200*h]:pose=='hips'?[cx+80*wd,sh,cx+140*wd,sh+100*h,cx+60*wd,hp-10]:[cx+80*wd,sh,cx+100*wd,sh+120*h,cx+110*wd,sh+230*h];
 ln(c,a);ln(c,[cx-80*wd,sh,cx-100*wd,sh+120*h,cx-110*wd,sh+230*h]);
 const lg=pose=='run'?[[cx-40*wd,hp,cx-120*wd,hp+170*h,cx-90*wd,hp+330*h],[cx+40*wd,hp,cx+90*wd,hp+150*h,cx+200*wd,hp+230*h]]:[[cx-40*wd,hp,cx-50*wd,hp+170*h,cx-55*wd,hp+340*h],[cx+40*wd,hp,cx+50*wd,hp+170*h,cx+55*wd,hp+340*h]];
 lg.forEach(l=>ln(c,l));[[...a.slice(-2)]].forEach(p=>el(c,p[0],p[1],12,12))})}
const POSES={'Body – slim standing':c=>body(c,1.15,.8,'stand'),'Body – average wave':c=>body(c,1.1,1,'wave'),'Body – curvy hands on hips':c=>body(c,1.1,1.25,'hips'),'Body – broad/strong':c=>body(c,1.1,1.5,'stand'),'Body – chibi':c=>body(c,.65,1.1,'stand'),'Body – running':c=>body(c,1.1,1,'run')};
Object.assign(TPL,POSES);
// stamps: draw at origin, ~100px
const ST={
 'Eyes – big sparkle':c=>{[-1,1].forEach(s=>{c.save();c.translate(s*70,0);c.fillStyle='#fff';c.beginPath();c.ellipse(0,0,40,50,0,0,7);c.fill();c.fillStyle=S.color;c.beginPath();c.ellipse(0,8,28,40,0,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.ellipse(0,10,14,22,0,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(-10,-10,9,0,7);c.arc(10,22,4,0,7);c.fill();c.lineWidth=7;c.strokeStyle='#111';c.beginPath();c.ellipse(0,0,42,52,0,3.5,6);c.stroke();c.restore()})},
 'Eyes – sharp cool':c=>{[-1,1].forEach(s=>{c.save();c.translate(s*70,0);c.scale(s,1);c.fillStyle='#fff';c.beginPath();c.moveTo(-45,0);c.quadraticCurveTo(0,-30,45,-10);c.quadraticCurveTo(10,20,-45,0);c.fill();c.fillStyle=S.color;c.beginPath();c.arc(5,-5,16,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(5,-5,7,0,7);c.fill();c.strokeStyle='#111';c.lineWidth=6;c.beginPath();c.moveTo(-48,2);c.quadraticCurveTo(0,-34,48,-12);c.stroke();c.restore()})},
 'Eyes – happy closed':c=>{c.strokeStyle='#111';c.lineWidth=7;[-1,1].forEach(s=>{c.beginPath();c.arc(s*70,10,30,3.4,6);c.stroke()})},
 'Mouth – smile':c=>{c.strokeStyle='#111';c.lineWidth=5;c.beginPath();c.arc(0,-10,25,.4,2.7);c.stroke()},
 'Mouth – open shout':c=>{c.fillStyle='#7a1f1f';c.beginPath();c.moveTo(-25,0);c.quadraticCurveTo(0,50,25,0);c.closePath();c.fill();c.strokeStyle='#111';c.lineWidth=4;c.stroke()},
 'Mouth – cat smile':c=>{c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.arc(-12,0,12,0,3.1);c.arc(12,0,12,0,3.1);c.stroke()},
 'Blush':c=>{c.fillStyle='rgba(230,110,90,.45)';[-1,1].forEach(s=>{c.beginPath();c.ellipse(s*90,0,35,14,0,0,7);c.fill()});c.strokeStyle='rgba(200,70,60,.7)';c.lineWidth=3;[-1,1].forEach(s=>{for(let i=-1;i<2;i++){c.beginPath();c.moveTo(s*90+i*14-5,8);c.lineTo(s*90+i*14+5,-8);c.stroke()}})},
 'Sparkle highlight':c=>{c.fillStyle='#fff';c.strokeStyle='#ffd34d';c.lineWidth=2;c.beginPath();for(let i=0;i<8;i++){const r=i%2?10:40,a=i*Math.PI/4;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.closePath();c.fill();c.stroke()},
 'Hair – spiky':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-150,40);const p=[-170,-60,-110,-20,-120,-140,-50,-50,-20,-170,20,-60,80,-160,90,-40,170,-90,140,20,160,40];for(let i=0;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.quadraticCurveTo(0,-40,-150,40);c.fill();c.stroke()},
 'Hair – long straight':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-160,300);c.quadraticCurveTo(-200,-160,0,-160);c.quadraticCurveTo(200,-160,160,300);c.lineTo(110,300);c.quadraticCurveTo(130,0,60,-60);c.lineTo(20,20);c.lineTo(-10,-60);c.lineTo(-60,10);c.quadraticCurveTo(-130,40,-110,300);c.closePath();c.fill();c.stroke()},
 'Hair – bob':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-160,90);c.quadraticCurveTo(-190,-160,0,-160);c.quadraticCurveTo(190,-160,160,90);c.lineTo(120,90);c.lineTo(110,-30);c.lineTo(40,-60);c.lineTo(0,-10);c.lineTo(-40,-60);c.lineTo(-110,-30);c.lineTo(-120,90);c.closePath();c.fill();c.stroke()},
 'Hair – twin buns':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;[-1,1].forEach(s=>{c.beginPath();c.arc(s*140,-140,50,0,7);c.fill();c.stroke()});ST['Hair – bob'](c)},
 'Hair – ponytail':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(150,-80);c.quadraticCurveTo(300,0,220,260);c.quadraticCurveTo(230,40,140,-20);c.fill();c.stroke();ST['Hair – spiky'](c)},
 'Clothing – school-style collar':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-120,0);c.lineTo(0,90);c.lineTo(120,0);c.lineTo(110,70);c.lineTo(0,140);c.lineTo(-110,70);c.closePath();c.fill();c.stroke();c.fillStyle='#c0392b';c.beginPath();c.moveTo(0,100);c.lineTo(-30,170);c.lineTo(30,170);c.closePath();c.fill();c.stroke()},
 'Clothing – hoodie':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-90,0);c.lineTo(-170,40);c.lineTo(-200,260);c.lineTo(200,260);c.lineTo(170,40);c.lineTo(90,0);c.quadraticCurveTo(0,70,-90,0);c.fill();c.stroke();c.strokeRect(-70,160,140,60);ln2(c,[-20,40,-25,110]);ln2(c,[20,40,25,110])},
 'Clothing – jacket':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-80,0);c.lineTo(-180,40);c.lineTo(-190,280);c.lineTo(-10,280);c.lineTo(-10,90);c.closePath();c.moveTo(80,0);c.lineTo(180,40);c.lineTo(190,280);c.lineTo(10,280);c.lineTo(10,90);c.closePath();c.fill();c.stroke()},
 'Clothing – pleated skirt':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(-90,0);c.lineTo(90,0);c.lineTo(150,160);c.lineTo(-150,160);c.closePath();c.fill();c.stroke();for(let i=-4;i<=4;i++)ln2(c,[i*20,0,i*35,160])},
 'Clothing – sneakers':c=>{c.fillStyle=S.color;c.strokeStyle='#111';c.lineWidth=4;[-1,1].forEach(s=>{c.beginPath();c.moveTo(s*30,-40);c.lineTo(s*30,10);c.lineTo(s*130,20);c.quadraticCurveTo(s*140,-20,s*80,-30);c.lineTo(s*70,-40);c.closePath();c.fill();c.stroke()})},
 'Sweat drop':c=>{c.fillStyle='#9ed8f5';c.strokeStyle='#2b6f99';c.lineWidth=3;c.beginPath();c.moveTo(0,-40);c.quadraticCurveTo(30,10,0,30);c.quadraticCurveTo(-30,10,0,-40);c.fill();c.stroke()},
 'Anger mark':c=>{c.strokeStyle='#c0392b';c.lineWidth=7;for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.beginPath();c.moveTo(8,-25);c.quadraticCurveTo(8,-8,25,-8);c.stroke();c.restore()}},
};
function ln2(c,a){c.beginPath();c.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)c.lineTo(a[i],a[i+1]);c.stroke()}
const PAL={'Classic skin & hair':['#ffe3cf','#f6c7a3','#d79a6b','#8d5524','#4a2c1a','#111111','#f3d36b','#c0392b','#2e86de','#1d3557'],
 'Sunset sky':['#ffd166','#f4a261','#e76f51','#9b2226','#3d405b','#264653','#81b29a','#f2cc8f','#e07a5f','#ffffff'],
 'Ocean magic':['#caf0f8','#90e0ef','#00b4d8','#0077b6','#03045e','#48cae4','#2a9d8f','#e9c46a','#264653','#111111'],
 'Forest spirit':['#d8f3dc','#95d5b2','#52b788','#2d6a4f','#081c15','#bc6c25','#dda15e','#fefae0','#606c38','#283618'],
 'Neon night':['#0b0c10','#1f2833','#66fcf1','#45a29e','#c5c6c7','#f9c80e','#ff4500','#7b2cbf','#3a86ff','#ffffff']};
const tsel=$('tpl'),ssel=$('stp'),psel=$('pal');
Object.keys(TPL).forEach(k=>tsel.add(new Option(k,k)));Object.keys(ST).forEach(k=>ssel.add(new Option(k,k)));Object.keys(PAL).forEach(k=>psel.add(new Option(k,k)));
function showPal(){const el=$('palsw');el.innerHTML='';PAL[psel.value].forEach(c=>{const b=document.createElement('button');b.className='sw';b.style.background=c;b.title=c;b.onclick=()=>{S.color=c;S.pattern=null;$('col').value=c};el.appendChild(b)})}
psel.onchange=showPal;showPal();
function layerNamed(n,blend,op){let i=S.layers.findIndex(l=>l.name==n);if(i<0){K.addLayer(n);i=S.layers.length-1;S.layers[i].blend=blend;if(op)S.layers[i].op=op}return i}
$('addTpl').onclick=()=>{const keep=S.cur;const i=layerNamed('Template guide',null,.6);S.cur=i;K.snap();S.layers[i].ctx.clearRect(0,0,W,H);TPL[tsel.value](S.layers[i].ctx);S.cur=keep>=i?keep:keep;K.drawLayers();K.render()};
$('stab').oninput=e=>{S.stab=+e.target.value;$('stabV').textContent=e.target.value};
function pick(t){document.querySelectorAll('#tools button').forEach(x=>x.classList.toggle('on',x.dataset.t==t));S.tool=t}
$('useStamp').onclick=()=>pick('astamp');$('useBubble').onclick=()=>pick('bubble');$('useCel').onclick=()=>pick('cel');$('useShade').onclick=()=>{const i=layerNamed('Shadow (multiply)','multiply');S.cur=i;K.drawLayers();S.color=$('shc').value;pick('pen')};
S.onTool=p=>{const t=S.tool;if(t=='astamp'){const c=S.layers[S.cur].ctx;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=S.opacity;c.translate(p.x,p.y);const s=S.size/12;c.scale(s,s);ST[ssel.value](c);c.restore();K.render();return true}
 if(t=='bubble'){const txt=$('btxt').value||'...';const c=S.layers[S.cur].ctx;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=1;c.font='bold 30px "Trebuchet MS",sans-serif';const w=Math.max(120,c.measureText(txt).width+60),h=90,kind=$('bkind').value;
  c.fillStyle='#fff';c.strokeStyle='#111';c.lineWidth=4;c.beginPath();
  if(kind=='shout'){for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?1:1.25;c.lineTo(p.x+Math.cos(a)*w/2*r,p.y+Math.sin(a)*h/2*r)}c.closePath()}else{c.ellipse(p.x,p.y,w/2,h/2,0,0,7)}
  c.fill();if(kind=='think')c.setLineDash([10,8]);c.stroke();c.setLineDash([]);
  if(kind=='think'){[[30,60,14],[50,85,8]].forEach(q=>{c.beginPath();c.arc(p.x-w/4-q[0],p.y+q[1],q[2],0,7);c.fill();c.stroke()})}else if(kind=='talk'){c.beginPath();c.moveTo(p.x-w/6,p.y+h/2-6);c.lineTo(p.x-w/3,p.y+h/2+40);c.lineTo(p.x-w/12,p.y+h/2-4);c.fill();c.stroke()}
  c.fillStyle='#111';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,p.x,p.y);c.restore();K.render();return true}
 if(t=='cel'){K.fill(p.x,p.y);const base=S.color,n=parseInt(base.slice(1),16),d=x=>Math.max(0,Math.round(x*.7)).toString(16).padStart(2,'0');
  const i=layerNamed('Shadow (multiply)','multiply');$('shc').value='#'+d(n>>16&255)+d(n>>8&255)+d(n&255);K.drawLayers();return true}
 return false};
window.CBAnime={TPL,ST,PAL};
})();
