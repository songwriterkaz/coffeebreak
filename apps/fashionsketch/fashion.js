(function(){const K=CBSketch,S=K.S,$=id=>document.getElementById(id),W=K.W,H=K.H;
// Inclusive croquis: proportions are [shoulder, bust, waist, hip, thigh, calf, heightScale, armW]
const BODIES={'Slim (tall)':[95,80,58,82,40,24,1.04,16],'Average':[100,88,72,96,46,27,1,18],'Curvy':[102,104,74,122,56,30,.98,20],'Plus-size':[118,128,118,138,64,36,.98,25],'Petite':[88,78,62,86,40,24,.86,15],'Athletic broad':[128,104,86,94,50,30,1.02,24],'Masculine plus-size':[132,130,126,124,62,36,1,27],'Kids (age 8)':[72,62,60,66,30,20,.72,13]};
function drawBody(ctx,b){const [sh,bu,wa,hi,th,ca,hs,aw]=b,cx=W/2,top=40,Ht=(H-80)*hs,u=Ht/8;ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(0,(H-80-Ht)*0.9);
 ctx.strokeStyle='#9aa7b3';ctx.lineWidth=3;ctx.fillStyle='#f5efe8';const y=k=>top+k*u;
 ctx.beginPath();ctx.ellipse(cx,y(.5),u*.36,u*.48,0,0,7);ctx.fill();ctx.stroke();
 const p=new Path2D();p.moveTo(cx-u*.14,y(.95));p.lineTo(cx-u*.14,y(1.15));p.quadraticCurveTo(cx-sh/2,y(1.2),cx-sh,y(1.4));p.lineTo(cx-bu,y(2));p.quadraticCurveTo(cx-wa*1.02,y(2.6),cx-wa,y(3));p.quadraticCurveTo(cx-hi*1.05,y(3.5),cx-hi,y(4));
 p.lineTo(cx-th*1.9,y(5));p.lineTo(cx-ca*2.2,y(6.2));p.lineTo(cx-ca*1.6,y(7.6));p.lineTo(cx-ca*2.4,y(7.9));p.lineTo(cx-12,y(7.85));p.lineTo(cx-th*.4,y(6.2));p.lineTo(cx-8,y(4.3));
 p.lineTo(cx+8,y(4.3));p.lineTo(cx+th*.4,y(6.2));p.lineTo(cx+12,y(7.85));p.lineTo(cx+ca*2.4,y(7.9));p.lineTo(cx+ca*1.6,y(7.6));p.lineTo(cx+ca*2.2,y(6.2));p.lineTo(cx+th*1.9,y(5));
 p.lineTo(cx+hi,y(4));p.quadraticCurveTo(cx+hi*1.05,y(3.5),cx+wa,y(3));p.quadraticCurveTo(cx+wa*1.02,y(2.6),cx+bu,y(2));p.lineTo(cx+sh,y(1.4));p.quadraticCurveTo(cx+sh/2,y(1.2),cx+u*.14,y(1.15));p.lineTo(cx+u*.14,y(.95));p.closePath();ctx.fill(p);ctx.stroke(p);
 [-1,1].forEach(s=>{const a=new Path2D();a.moveTo(cx+s*sh,y(1.4));a.quadraticCurveTo(cx+s*(sh+aw*2.2),y(2.4),cx+s*(sh+aw*1.6),y(3.4));a.lineTo(cx+s*(sh+aw*1.5),y(4.1));a.lineTo(cx+s*(sh+aw*.4),y(4.1));a.lineTo(cx+s*(sh+aw*.2),y(3.3));a.quadraticCurveTo(cx+s*(sh-aw*.4),y(2.4),cx+s*(bu-aw*.2),y(1.9));ctx.fill(a);ctx.stroke(a)});
 ctx.setLineDash([6,8]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,y(1.1));ctx.lineTo(cx,y(4.2));ctx.stroke();ctx.restore();ctx.setLineDash([])}
// fabric patterns
function tile(n,f){const c=document.createElement('canvas');c.width=c.height=n;f(c.getContext('2d'),n);return c}
const PATS={
 Denim:tile(24,(x,n)=>{x.fillStyle='#3b5b86';x.fillRect(0,0,n,n);x.strokeStyle='#5a7aa6';x.lineWidth=2;for(let i=-n;i<n*2;i+=5){x.beginPath();x.moveTo(i,0);x.lineTo(i+n,n);x.stroke()}x.fillStyle='#ffffff22';for(let i=0;i<30;i++)x.fillRect(Math.random()*n,Math.random()*n,1,1)}),
 Plaid:tile(48,(x,n)=>{x.fillStyle='#8c1c13';x.fillRect(0,0,n,n);x.fillStyle='#1d3557aa';x.fillRect(0,16,n,14);x.fillRect(16,0,14,n);x.fillStyle='#fcbf4988';x.fillRect(0,38,n,3);x.fillRect(38,0,3,n)}),
 Floral:tile(60,(x,n)=>{x.fillStyle='#f3efe0';x.fillRect(0,0,n,n);[[15,15,'#d62828'],[45,42,'#457b9d']].forEach(([a,b,c])=>{x.fillStyle=c;for(let k=0;k<5;k++){x.beginPath();x.ellipse(a+Math.cos(k*1.26)*6,b+Math.sin(k*1.26)*6,5,5,0,0,7);x.fill()}x.fillStyle='#fcbf49';x.beginPath();x.arc(a,b,3,0,7);x.fill()});x.fillStyle='#2b9348';x.beginPath();x.ellipse(32,22,6,3,.6,0,7);x.fill()}),
 Leather:tile(64,(x,n)=>{x.fillStyle='#3b2416';x.fillRect(0,0,n,n);for(let i=0;i<220;i++){x.fillStyle=Math.random()<.5?'#00000022':'#ffffff10';x.beginPath();x.arc(Math.random()*n,Math.random()*n,Math.random()*3,0,7);x.fill()}}),
 Stripes:tile(20,(x,n)=>{x.fillStyle='#ffffff';x.fillRect(0,0,n,n);x.fillStyle='#1d3557';x.fillRect(0,0,n,8)}),
 'Polka dot':tile(30,(x,n)=>{x.fillStyle='#1a1a1a';x.fillRect(0,0,n,n);x.fillStyle='#fff';x.beginPath();x.arc(8,8,4,0,7);x.arc(23,23,4,0,7);x.fill()}),
 Houndstooth:tile(16,(x,n)=>{x.fillStyle='#fff';x.fillRect(0,0,n,n);x.fillStyle='#111';x.fillRect(0,0,8,8);x.beginPath();x.moveTo(8,0);x.lineTo(16,8);x.lineTo(16,4);x.lineTo(12,0);x.fill();x.beginPath();x.moveTo(0,8);x.lineTo(8,16);x.lineTo(4,16);x.lineTo(0,12);x.fill()}),
 Leopard:tile(70,(x,n)=>{x.fillStyle='#d9a441';x.fillRect(0,0,n,n);for(let i=0;i<10;i++){const a=Math.random()*n,b=Math.random()*n;x.strokeStyle='#2b1a0e';x.lineWidth=3;x.beginPath();x.arc(a,b,5,0,4.5);x.stroke();x.fillStyle='#8a5a2b';x.beginPath();x.arc(a,b,2.5,0,7);x.fill()}}),
 Camo:tile(80,(x,n)=>{x.fillStyle='#5b6b3a';x.fillRect(0,0,n,n);['#3d4a26','#8a7b52','#2b2b1f'].forEach(c=>{x.fillStyle=c;for(let i=0;i<5;i++){x.beginPath();x.ellipse(Math.random()*n,Math.random()*n,12+Math.random()*10,6+Math.random()*6,Math.random()*3,0,7);x.fill()}})}),
 Lace:tile(28,(x,n)=>{x.fillStyle='#ffffff';x.fillRect(0,0,n,n);x.strokeStyle='#999';x.lineWidth=1;x.beginPath();x.arc(14,14,8,0,7);x.arc(0,0,6,0,7);x.arc(28,28,6,0,7);x.stroke()}),
 Knit:tile(16,(x,n)=>{x.fillStyle='#b5651d';x.fillRect(0,0,n,n);x.strokeStyle='#8b4513';x.lineWidth=2;x.beginPath();x.moveTo(0,0);x.lineTo(8,16);x.lineTo(16,0);x.stroke()}),
 Satin:tile(40,(x,n)=>{const g=x.createLinearGradient(0,0,n,n);g.addColorStop(0,'#6a4c93');g.addColorStop(.5,'#b9a3d6');g.addColorStop(1,'#6a4c93');x.fillStyle=g;x.fillRect(0,0,n,n)})};
// garment stamps (Path2D strings, centred on 0,0)
const ST={'T-shirt':'M-60,-60 L-25,-70 Q0,-55 25,-70 L60,-60 L85,-25 L60,-15 L55,-30 L55,70 L-55,70 L-55,-30 L-60,-15 L-85,-25 Z',
 'Dress':'M-30,-80 L30,-80 L35,-30 Q30,-15 28,-5 L80,90 L-80,90 L-28,-5 Q-30,-15 -35,-30 Z',
 'A-line skirt':'M-35,-50 L35,-50 L70,60 L-70,60 Z','Pencil skirt':'M-38,-50 L38,-50 L42,0 L34,60 L-34,60 L-42,0 Z',
 'Trousers':'M-45,-80 L45,-80 L52,90 L12,90 L0,-20 L-12,90 L-52,90 Z','Shorts':'M-45,-40 L45,-40 L55,30 L8,30 L0,0 L-8,30 L-55,30 Z',
 'Jacket':'M-60,-75 L-15,-80 L0,-20 L15,-80 L60,-75 L90,60 L65,62 L58,-10 L58,75 L5,75 L0,-20 L-5,75 L-58,75 L-58,-10 L-65,62 L-90,60 Z',
 'Hoodie':'M-25,-90 Q0,-115 25,-90 L60,-65 L90,55 L65,58 L58,-5 L58,70 L-58,70 L-58,-5 L-65,58 L-90,55 L-60,-65 Z',
 'Coat':'M-60,-80 L-15,-85 L0,-25 L15,-85 L60,-80 L95,80 L70,82 L65,0 L70,120 L-70,120 L-65,0 L-70,82 L-95,80 Z',
 'Top (singlet)':'M-30,-70 L-20,-70 Q0,-45 20,-70 L30,-70 Q40,-30 45,0 L45,55 L-45,55 L-45,0 Q-40,-30 -30,-70 Z',
 'Gown':'M-30,-90 L30,-90 L32,-20 Q25,0 25,10 L110,130 L-110,130 L-25,10 Q-25,0 -32,-20 Z',
 'Boots':'M-50,-50 L-20,-50 L-20,40 L-5,50 L-5,60 L-55,60 Z M20,-50 L50,-50 L55,60 L5,60 L5,50 L20,40 Z',
 'Heels':'M-50,0 L-15,0 L-10,25 L-55,25 Z M15,0 L50,0 L55,25 L10,25 Z','Hat':'M-80,10 Q0,25 80,10 L80,0 Q40,0 40,-10 L35,-50 L-35,-50 L-40,-10 Q-40,0 -80,0 Z',
 'Handbag':'M-45,-10 L45,-10 L55,50 L-55,50 Z M-25,-10 Q0,-50 25,-10'};
let model='Average',baseLayer=null;
function init(){K.addLayer('Model (croquis)');baseLayer=S.layers[0];K.addLayer('Outfit');S.cur=1;
 const sel=$('body');Object.keys(BODIES).forEach(k=>{const o=document.createElement('option');o.textContent=k;o.selected=k==model;sel.appendChild(o)});
 sel.onchange=()=>{model=sel.value;drawBody(baseLayer.ctx,BODIES[model]);K.render()};drawBody(baseLayer.ctx,BODIES[model]);
 $('hideBody').onclick=()=>{baseLayer.vis=!baseLayer.vis;$('hideBody').textContent=baseLayer.vis?'Hide model':'Show model';K.drawLayers();K.render()};
 $('newD').onclick=()=>{if(!confirm('Start a new design? (Save first if you want to keep this one)'))return;S.layers.splice(1);S.undo=[];S.redo=[];K.addLayer('Outfit');K.render()};
 const pe=$('pats');const none=document.createElement('button');none.textContent='Plain';none.onclick=()=>{S.pattern=null;pe.querySelectorAll('.pat').forEach(x=>x.classList.remove('on'))};pe.appendChild(none);
 Object.entries(PATS).forEach(([n,c])=>{const b=document.createElement('button');b.className='pat';b.title=n;b.style.backgroundImage=`url(${c.toDataURL()})`;b.style.backgroundSize='auto';
  b.onclick=()=>{S.pattern=K.render&&document.getElementById('view').getContext('2d').createPattern(c,'repeat');pe.querySelectorAll('.pat').forEach(x=>x.classList.toggle('on',x==b));if(!['fill','stamp','brush','marker'].includes(S.tool))document.querySelector('#tools [data-t=fill]').click()};pe.appendChild(b)});
 const se=$('stamps');Object.entries(ST).forEach(([n,d])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>{S.stamp=d;document.querySelector('#tools [data-t=stamp]').click();se.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b))};se.appendChild(b)});
 S.stamp=ST['T-shirt'];
 // layer tools: pattern from view ctx works on any ctx
}
window.CBFashion={init,BODIES,PATS,ST,drawBody};})();
