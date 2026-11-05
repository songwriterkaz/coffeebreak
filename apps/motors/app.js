const $=i=>document.getElementById(i);const ld=s=>{const i=new Image();i.src=s;return i};const logo=ld('img/logo.jpg'),bee=ld('img/bee.png'),girl=ld('img/girl.png');
function card(it,buy){const pic=it.img?`<img src="${it.img}" alt="${it.name}" data-v="${it.img}" data-n="${it.name}">`:`<div class="ph">${it.ph||'Placeholder, art coming soon'}</div>`;
 return `<div class="card">${pic}<b>${it.name}</b>${it.desc?`<div>${it.desc}</div>`:''}${it.price?`<div class="price">${it.price} <small>(placeholder price)</small></div>`:''}${buy?`<button data-add="${it.id}">Add to order request</button>`:''}</div>`;}
$('cars').innerHTML=CARS.map(c=>card(c)).join('');['flash','wraps','legs'].forEach(k=>$(k).innerHTML=SHOP[k].map(i=>card(i,1)).join(''));
// viewer
let ry=0,zm=1,drag=null,auto=null;const vi=$('vimg');function vt(){vi.style.transform=`rotateY(${ry}deg) scale(${zm})`+(Math.cos(ry*Math.PI/180)<0?' scaleX(-1)':'');}
document.addEventListener('click',e=>{const v=e.target.dataset&&e.target.dataset.v;if(v){vi.src=v;$('vt').textContent=e.target.dataset.n;ry=0;zm=1;vt();$('viewer').style.display='flex';}});
const st=$('stage');st.onpointerdown=e=>{drag=e.clientX;st.setPointerCapture(e.pointerId)};st.onpointermove=e=>{if(drag!=null){ry+=(e.clientX-drag)*.6;drag=e.clientX;vt();}};st.onpointerup=()=>drag=null;
st.onwheel=e=>{e.preventDefault();zm=Math.min(4,Math.max(.5,zm-e.deltaY*.001));vt();};$('zin').onclick=()=>{zm=Math.min(4,zm+.3);vt()};$('zout').onclick=()=>{zm=Math.max(.5,zm-.3);vt()};
$('spin').onclick=()=>{if(auto){clearInterval(auto);auto=null}else auto=setInterval(()=>{ry+=2;vt()},30)};$('vclose').onclick=()=>{$('viewer').style.display='none';clearInterval(auto);auto=null};
// configurator
function shade(h,a){let n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,v+a));return `rgb(${f(r)},${f(g)},${f(b)})`;}
function drawCar(x,col,o,ox,oy,s){x.save();x.translate(ox,oy);x.scale(s,s);const ev=o.body=='ev';
 x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(0,92,330,18,0,0,7);x.fill();
 const g=x.createLinearGradient(0,-60,0,80);g.addColorStop(0,shade(col,60));g.addColorStop(.5,col);g.addColorStop(1,shade(col,-60));x.fillStyle=g;x.beginPath();
 if(ev){x.moveTo(-290,60);x.lineTo(-290,0);x.quadraticCurveTo(-280,-30,-200,-40);x.quadraticCurveTo(-120,-120,20,-120);x.quadraticCurveTo(160,-120,220,-40);x.quadraticCurveTo(300,-30,300,10);x.lineTo(300,60);}
 else{x.moveTo(-320,60);x.lineTo(-320,10);x.quadraticCurveTo(-310,-20,-230,-28);x.quadraticCurveTo(-120,-105,10,-105);x.quadraticCurveTo(120,-100,190,-30);x.quadraticCurveTo(320,-20,330,20);x.lineTo(330,60);}
 x.closePath();x.fill();x.fillStyle='rgba(60,20,50,.75)';x.beginPath();
 if(ev){x.moveTo(-180,-42);x.quadraticCurveTo(-110,-108,15,-108);x.quadraticCurveTo(140,-108,195,-42);}else{x.moveTo(-205,-30);x.quadraticCurveTo(-115,-92,10,-92);x.quadraticCurveTo(110,-90,165,-30);}x.closePath();x.fill();
 x.strokeStyle=shade(col,-40);x.lineWidth=3;x.beginPath();x.moveTo(ev?10:-10,-100);x.lineTo(ev?10:-10,50);x.stroke();
 x.fillStyle='#fff8c0';x.beginPath();x.ellipse(ev?285:315,10,14,8,0,0,7);x.fill();x.fillStyle='#ff2050';x.fillRect(ev?-292:-322,0,10,18);
 [-190,200].forEach(wx=>{const w=o.wh;x.fillStyle='#1a1a1a';x.beginPath();x.arc(wx,60,48,0,7);x.fill();if(w=='white'){x.fillStyle='#fff';x.beginPath();x.arc(wx,60,36,0,7);x.fill();x.fillStyle='#1a1a1a';x.beginPath();x.arc(wx,60,26,0,7);x.fill();}
  const rim={gold:'#e8b730',chrome:'#d8dde3',black:'#222',white:'#ccc'}[w];x.fillStyle=rim;x.beginPath();x.arc(wx,60,w=='white'?22:32,0,7);x.fill();x.strokeStyle=w=='black'?'#ff4fa3':'#fff';x.lineWidth=3;for(let a=0;a<6;a++){x.beginPath();x.moveTo(wx,60);x.lineTo(wx+Math.cos(a)*30,60+Math.sin(a)*30);x.stroke();}});
 x.fillStyle='#fff';x.fillRect(250,30,70,24);x.strokeStyle='#e0117a';x.lineWidth=2;x.strokeRect(250,30,70,24);x.fillStyle='#e0117a';x.font='bold 15px sans-serif';x.textAlign='center';x.fillText((o.plate||'').toUpperCase(),285,48);
 if(o.bee&&bee.complete)x.drawImage(bee,-110,-10,60,60);if(logo.complete){x.save();x.beginPath();x.arc(60,15,24,0,7);x.clip();x.drawImage(logo,36,-9,48,48);x.restore();}x.restore();}
function cfg(){const c=$('cfg'),x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,420);g.addColorStop(0,'#fff0f7');g.addColorStop(1,'#ffc0dc');x.fillStyle=g;x.fillRect(0,0,900,420);x.fillStyle='#ff9ac8';x.fillRect(0,350,900,70);
 drawCar(x,$('cCol').value,{body:$('cBody').value,wh:$('cWh').value,plate:$('cPlate').value,bee:$('cBee').checked},430,250,1);
 if($('cGirl').checked&&girl.complete)x.drawImage(girl,770,180,110,110*girl.height/girl.width);x.fillStyle='#e0117a';x.font='bold 26px Georgia';x.textAlign='left';x.fillText('My Coffeebreak Car',20,40);x.font='italic 13px Georgia';x.fillText('Coffeebreak Motors',20,62);}
['cBody','cCol','cWh','cPlate','cBee','cGirl'].forEach(i=>$(i).oninput=cfg);[logo,bee,girl].forEach(i=>i.onload=cfg);cfg();
$('cDl').onclick=()=>{const a=document.createElement('a');a.download='my-coffeebreak-car.png';a.href=$('cfg').toDataURL();a.click();};
// order
let cart=[];const all=[...SHOP.flash,...SHOP.wraps,...SHOP.legs];document.addEventListener('click',e=>{const id=e.target.dataset&&e.target.dataset.add;if(id){cart.push(all.find(i=>i.id==id));showCart();}});
const code='CBM-'+Math.random().toString(36).slice(2,7).toUpperCase();
function showCart(){$('cart').innerHTML=cart.length?`<p>Order code <b>${code}</b></p><ul>`+cart.map(i=>`<li>${i.id} ${i.name} - ${i.price} (placeholder)</li>`).join('')+'</ul>':'<p><small>No items picked yet.</small></p>';}showCart();
$('mail').onclick=()=>{const b=`Hi Karen,\n\nI would like to request:\n${cart.map(i=>i.id+' '+i.name).join('\n')||'(please list items)'}\n\nOrder code: ${code}\nI understand prices are to be confirmed and payment is by PayID to darkokaz@gmx.com.\n\nName:\nPhone:\n`;location.href='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Coffeebreak Motors order request '+code)+'&body='+encodeURIComponent(b);};
// test drive
const rc=$('road'),rx=rc.getContext('2d');let D=null,best=+localStorage.getItem('cbm_best')||0;$('dBest').textContent=best;const keys={};
addEventListener('keydown',e=>{keys[e.key]=1;if(D&&D.on&&e.key.startsWith('Arrow'))e.preventDefault();});addEventListener('keyup',e=>keys[e.key]=0);
let tdir=0;rc.addEventListener('pointerdown',e=>{const r=rc.getBoundingClientRect();tdir=(e.clientX-r.left)<r.width/2?-1:1;});addEventListener('pointerup',()=>tdir=0);
function dstart(){D={on:1,x:210,sp:4,off:0,items:[],cups:0,t:0};$('dCups').textContent=0;requestAnimationFrame(dloop);}
function dloop(){if(!D.on)return;D.t++;D.off=(D.off+D.sp)%60;D.sp=4+D.t/900;const d=(keys.ArrowLeft||keys.a?-1:0)+(keys.ArrowRight||keys.d?1:0)+tdir;D.x=Math.max(90,Math.min(330,D.x+d*6));
 if(D.t%40==0)D.items.push({x:90+Math.random()*240,y:-30,k:Math.random()<.7?'cup':'cone'});D.items.forEach(i=>i.y+=D.sp);
 for(const i of D.items){if(!i.hit&&Math.abs(i.x-D.x)<34&&Math.abs(i.y-500)<50){i.hit=1;if(i.k=='cup'){D.cups++;$('dCups').textContent=D.cups;}else{D.on=0;}}}D.items=D.items.filter(i=>i.y<640&&!(i.hit&&i.k=='cup'));
 rx.fillStyle='#ffd1e8';rx.fillRect(0,0,420,600);rx.fillStyle='#ff9ac8';rx.fillRect(60,0,300,600);rx.fillStyle='#fff';for(let y=-60+D.off;y<600;y+=60)rx.fillRect(207,y,6,30);
 rx.fillStyle='#e0117a';rx.fillRect(56,0,6,600);rx.fillRect(358,0,6,600);
 D.items.forEach(i=>{if(i.k=='cup'){rx.fillStyle='#fff';rx.beginPath();rx.moveTo(i.x-12,i.y-14);rx.lineTo(i.x+12,i.y-14);rx.lineTo(i.x+9,i.y+14);rx.lineTo(i.x-9,i.y+14);rx.fill();rx.fillStyle='#7a3b1d';rx.fillRect(i.x-12,i.y-18,24,6);rx.strokeStyle='#fff';rx.lineWidth=3;rx.beginPath();rx.arc(i.x+14,i.y,6,-1.5,1.5);rx.stroke();}else{rx.fillStyle='#ff7a00';rx.beginPath();rx.moveTo(i.x,i.y-18);rx.lineTo(i.x+14,i.y+16);rx.lineTo(i.x-14,i.y+16);rx.fill();rx.fillStyle='#fff';rx.fillRect(i.x-8,i.y,16,4);}});
 rx.save();rx.translate(D.x,500);rx.rotate(-Math.PI/2);drawCar(rx,'#ff4fa3',{body:'coupe',wh:'gold',plate:'',bee:1},0,-10,.18);rx.restore();
 rx.save();rx.globalAlpha=.85;rx.beginPath();rx.arc(390,30,22,0,7);rx.clip();if(logo.complete)rx.drawImage(logo,368,8,44,44);rx.restore();
 if(!D.on){if(D.cups>best){best=D.cups;localStorage.setItem('cbm_best',best);$('dBest').textContent=best;}rx.fillStyle='rgba(255,255,255,.85)';rx.fillRect(40,240,340,110);rx.fillStyle='#e0117a';rx.font='bold 24px Georgia';rx.textAlign='center';rx.fillText('Test drive over',210,285);rx.font='18px Georgia';rx.fillText(D.cups+' coffee cups collected',210,320);rx.textAlign='left';return;}
 requestAnimationFrame(dloop);}
$('dGo').onclick=dstart;rx.fillStyle='#ff9ac8';rx.fillRect(0,0,420,600);rx.fillStyle='#fff';rx.font='bold 22px Georgia';rx.textAlign='center';rx.fillText('Press start to drive',210,300);rx.textAlign='left';
