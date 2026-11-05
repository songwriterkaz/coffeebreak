// Coffeebreak leg viewer with magnifying lens. Usage: cbView(design) where design={id,name,col,lay,n}
(function(){
const css=`#cbv{position:fixed;inset:0;background:#1a1013e6;z-index:50;display:none;align-items:center;justify-content:center;font-family:Georgia,serif}#cbv.on{display:flex}
#cbv .box{background:#fff4f8;border:3px solid #1a1013;border-radius:16px;padding:12px;max-width:96vw;max-height:96vh;display:flex;flex-direction:column;align-items:center;gap:8px}
#cbv .stage{position:relative;touch-action:none;cursor:none;line-height:0}#cbv canvas.main{max-height:72vh;max-width:90vw;border-radius:10px;background:#f3e3e8}
#cbv canvas.lens{position:absolute;pointer-events:none;border-radius:50%;border:4px solid #1a1013;box-shadow:0 0 0 3px #ff4fa3,0 8px 20px #0007;display:none}
#cbv .tb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center}#cbv button{background:#ff4fa3;color:#fff;border:2px solid #1a1013;border-radius:20px;padding:7px 13px;font-weight:700;cursor:pointer}#cbv button.g{background:#fff;color:#1a1013}#cbv small{color:#8a1d55}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const v=document.createElement('div');v.id='cbv';v.innerHTML=`<div class="box"><div class="tb"><b id="cbvt"></b></div><div class="stage"><canvas class="main"></canvas><canvas class="lens"></canvas></div>
<div class="tb"><button class="g" id="cbvm">Zoom -</button><span id="cbvz"></span><button class="g" id="cbvp">Zoom +</button><button id="cbvf">View flash picture</button><button class="g" id="cbvx">Close</button></div><small>Move your mouse or finger over the picture to magnify it</small></div>`;
document.body.appendChild(v);
const $=s=>v.querySelector(s),main=$('canvas.main'),lens=$('canvas.lens');let zoom=3,full=false,cur=null,big=null,art=null;
const W=480,H=720,S=3; // display size, hi-res factor
const PAL={feature:['#f5ead6','#c8102e','#111'],tiled:['#fff4e6','#6b3e26','#1a1013'],fishnet:['#ffd6ea','#ff4fa3','#1a1013']};
function girlAt(c,x,bottom,gw,maxh){if(!cur||cur.col=='Coffeebreak Girl Flash')return;const GIRL=POSES[cur.pose!=null?cur.pose:(parseInt(cur.id.replace(/\D/g,''))||0)%POSES.length];if(!GIRL.naturalWidth)return;maxh*=0.78;const sc=Math.min(gw/GIRL.naturalWidth,maxh/GIRL.naturalHeight);gw=GIRL.naturalWidth*sc;const gh=GIRL.naturalHeight*sc;c.drawImage(GIRL,x,bottom-gh,gw,gh);if(BEE.naturalWidth){const bs=c.canvas.width*0.06;c.drawImage(BEE,x+gw-bs/2,bottom-gh-bs*0.78,bs,bs*BEE.naturalHeight/BEE.naturalWidth)}}
function legPath(c,w,h){const t=h*0.08,b=h*0.78,tw=w*0.36,bw=w*0.19,cx=w/2;c.beginPath();c.moveTo(cx-tw,t);c.lineTo(cx+tw,t);c.lineTo(cx+bw,b);c.quadraticCurveTo(cx,b+h*0.015,cx-bw,b);c.closePath();return{t,b,tw,bw,cx}}
function heart(c,x,y,r,f,k){c.fillStyle=f;c.strokeStyle=k;c.lineWidth=r*0.18;c.beginPath();c.moveTo(x,y+r*0.9);c.bezierCurveTo(x-r*1.6,y-r*0.2,x-r*0.6,y-r*1.3,x,y-r*0.4);c.bezierCurveTo(x+r*0.6,y-r*1.3,x+r*1.6,y-r*0.2,x,y+r*0.9);c.fill();c.stroke()}
function rose(c,x,y,r,k){c.fillStyle='#2f8f3a';c.strokeStyle=k;c.lineWidth=r*0.12;c.beginPath();c.ellipse(x-r*1.1,y+r*0.5,r*0.7,r*0.32,0.5,0,7);c.fill();c.stroke();c.beginPath();c.ellipse(x+r*1.1,y+r*0.5,r*0.7,r*0.32,-0.5,0,7);c.fill();c.stroke();c.fillStyle='#d81b4a';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.stroke();c.lineWidth=r*0.1;for(let i=1;i<4;i++){c.beginPath();c.arc(x+r*0.08*i,y-r*0.05*i,r*(1-i*0.22),0.6*i,0.6*i+4);c.stroke()}}
function accents(c,w,h,g,ink){const a=cur.acc;if(a==null)return;const top=g.t+h*0.065;
 if(a==2){c.fillStyle='#f7b928';c.strokeStyle='#b8730a';c.lineWidth=w*0.003;c.fillRect(0,top,w,h*0.012);for(let i=0;i<14;i++){const x=w*(0.04+i*0.07),L=h*(0.02+((i*37)%5)*0.012);c.beginPath();c.moveTo(x-w*0.012,top);c.lineTo(x-w*0.012,top+L);c.arc(x,top+L,w*0.012,Math.PI,0,true);c.lineTo(x+w*0.012,top);c.fill();c.fillStyle='#fff8';c.beginPath();c.arc(x-w*0.004,top+L,w*0.003,0,7);c.fill();c.fillStyle='#f7b928'}}
 const pts=[[0.5,0.73],[0.27,0.16],[0.73,0.16],[0.38,0.72],[0.62,0.72]];
 pts.forEach(([px,py],i)=>{const x=g.cx+(px-0.5)*2*g.tw*(1-py*0.6),y=h*py,r=w*0.022;if(a==0||(a==3&&i%2==0))heart(c,x,y,r,'#ff4fa3',ink);else if(a==1||a==3)rose(c,x,y,r,ink);else if(a==2&&i==0&&BEE.naturalWidth)c.drawImage(BEE,x-r*1.5,y-r*1.5,r*3,r*3)})}
function lace(c,w,h,g,ink,acc){const r=w*0.016;c.strokeStyle=ink;c.lineWidth=w*0.002;for(const side of[-1,1])for(let y=g.t+h*0.07;y<g.b;y+=r*1.6){const t=(y-g.t)/(g.b-g.t),x=g.cx+side*(g.tw+(g.bw-g.tw)*t)-side*r*0.9;c.fillStyle='#fff';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.stroke();c.fillStyle=acc;c.beginPath();c.arc(x,y,r*0.3,0,7);c.fill()}}
function drawLeg(c,w,h){let lay=cur.lay||'feature',[bg,acc,ink]=cur.cw!=null&&window.CB50&&lay!='fishnet'&&lay!='pbfishnet'?CB50.COLOURWAYS[cur.cw].slice(1):(PAL[lay]||PAL.feature);const pb=lay=='pbfishnet';if(pb){bg='#1a1013';acc='#ff4fa3';ink='#000000';lay='fishnet'}const isLace=lay=='lace';if(isLace){lay='feature';if(cur.cw==null)[bg,acc,ink]=PAL.fishnet}c.fillStyle='#f3e3e8';c.fillRect(0,0,w,h);
 const g=legPath(c,w,h);c.save();c.clip();c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(lay=='fishnet'){c.lineWidth=w*0.006;c.strokeStyle=pb?acc:ink;const s=w*0.05;for(let x=-h;x<w+h;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x+h,h);c.moveTo(x,0);c.lineTo(x-h,h);c.stroke()}c.strokeStyle=pb?'#ffd6ea':acc;c.lineWidth=w*0.003;for(let x=-h;x<w+h;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x+h,h);c.moveTo(x,0);c.lineTo(x-h,h);c.stroke()}
  c.fillStyle='#fff';c.fillRect(0,g.t,w,h*0.07);c.fillStyle=acc;c.fillRect(0,g.t+h*0.07,w,h*0.008);
  c.fillStyle=acc;c.strokeStyle=ink;c.lineWidth=w*0.004;const bx=g.cx,by=g.t+h*0.075,bs=w*0.06;c.beginPath();c.moveTo(bx,by);c.lineTo(bx-bs,by-bs*0.6);c.lineTo(bx-bs,by+bs*0.6);c.closePath();c.moveTo(bx,by);c.lineTo(bx+bs,by-bs*0.6);c.lineTo(bx+bs,by+bs*0.6);c.closePath();c.fill();c.stroke();
  const ry=g.t+h*0.36,rw0=(g.tw+g.bw)/2*0.9,gw=rw0*2*0.30,rw=rw0-gw/2,ex=g.cx+gw/2;c.fillStyle='#fff';c.beginPath();c.ellipse(ex,ry,rw,h*0.24,0,0,7);c.fill();c.lineWidth=w*0.008;c.strokeStyle=ink;c.stroke();
  const a=Math.min(rw*1.3,h*0.34);c.drawImage(art,ex-a/2,ry-a/2,a,a);girlAt(c,g.cx-rw0,ry+h*0.24,gw,h*0.4)}
 else{for(let x=0;x<w;x+=w*0.035)for(let y=0;y<h;y+=w*0.035)if(((x/(w*0.035)|0)+(y/(w*0.035)|0))%2==0){c.fillStyle=acc;c.beginPath();c.arc(x,y,w*0.004,0,7);c.fill()}
  c.fillStyle=ink;c.fillRect(0,g.t,w,h*0.06);c.fillStyle=bg;c.font=`bold ${w*0.04}px Georgia`;c.textAlign='center';c.fillText('COFFEEBREAK',g.cx,g.t+h*0.042);
  const top=g.t+h*0.08,bot=g.b-h*0.08,mw0=(g.tw+g.bw)*0.85,gw=mw0*0.30,mw=mw0-gw,gl=g.cx-mw0/2;
  if(lay=='tiled'){const cw=mw/3,ch=(bot-top)/4;for(let i=0;i<12;i++){const x=gl+gw+(i%3)*cw,y=top+(i/3|0)*ch;c.fillStyle='#fff';c.fillRect(x+3,y+3,cw-6,ch-6);c.strokeStyle=ink;c.lineWidth=w*0.003;c.strokeRect(x+3,y+3,cw-6,ch-6);const a=Math.min(cw,ch)-12;c.drawImage(art,x+(cw-a)/2,y+(ch-a)/2,a,a)}}
  else{c.fillStyle='#fff';c.fillRect(gl+gw,top,mw,bot-top);c.lineWidth=w*0.008;c.strokeStyle=ink;c.strokeRect(gl+gw,top,mw,bot-top);const a=Math.min(mw,bot-top)-w*0.03;c.drawImage(art,gl+gw+(mw-a)/2,top+(bot-top-a)/2,a,a)}
  girlAt(c,gl,bot,gw,(bot-top)*0.8)
  c.fillStyle=ink;c.fillRect(0,g.b-h*0.06,w,h*0.07);if(isLace)lace(c,w,h,g,ink,acc)}
 accents(c,w,h,g,ink);
 // cylinder shading
 const sh=c.createLinearGradient(g.cx-g.tw,0,g.cx+g.tw,0);sh.addColorStop(0,'#0007');sh.addColorStop(.25,'#fff3');sh.addColorStop(.5,'#0000');sh.addColorStop(1,'#0008');c.fillStyle=sh;c.fillRect(0,0,w,h);c.restore();
 c.fillStyle='#222';c.fillRect(g.cx-g.tw*1.05,g.t-h*0.03,g.tw*2.1,h*0.035);c.fillStyle='#b8bcc4';c.fillRect(g.cx-w*0.035,g.b,w*0.07,h*0.12);
 c.fillStyle='#e9c9b8';c.beginPath();c.moveTo(g.cx-w*0.08,g.b+h*0.12);c.lineTo(g.cx+w*0.08,g.b+h*0.12);c.lineTo(g.cx+w*0.3,g.b+h*0.19);c.lineTo(g.cx+w*0.3,g.b+h*0.21);c.lineTo(g.cx-w*0.1,g.b+h*0.21);c.closePath();c.fill()}
function paint(){const w=full?W:W,h=full?W:H;big=document.createElement('canvas');big.width=w*S;big.height=h*S;const b=big.getContext('2d');
 if(full){b.fillStyle='#fff';b.fillRect(0,0,big.width,big.height);b.imageSmoothingQuality='high';b.drawImage(art,0,0,big.width,big.height)}else drawLeg(b,big.width,big.height);
 main.width=w*2;main.height=h*2;main.getContext('2d').drawImage(big,0,0,main.width,main.height);$('#cbvf').textContent=full?'View on the leg':'View flash picture';$('#cbvz').textContent=zoom.toFixed(1)+'x'}
function showLens(x,y){const r=main.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom){lens.style.display='none';return}
 const d=Math.min(220,r.width*0.55);lens.width=lens.height=d*devicePixelRatio;lens.style.width=lens.style.height=d+'px';lens.style.display='block';
 const sx=(x-r.left)/r.width*big.width,sy=(y-r.top)/r.height*big.height;const k=big.width/r.width;const src=d/zoom*k;
 const c=lens.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,lens.width,lens.height);c.imageSmoothingQuality='high';c.drawImage(big,sx-src/2,sy-src/2,src,src,0,0,lens.width,lens.height);
 const pr=main.parentElement.getBoundingClientRect();lens.style.left=(x-pr.left-d/2)+'px';lens.style.top=(y-pr.top-d/2)+'px'}
const stage=$('.stage');let last=null;
stage.addEventListener('pointermove',e=>{last=[e.clientX,e.clientY];showLens(e.clientX,e.clientY)});stage.addEventListener('pointerdown',e=>{last=[e.clientX,e.clientY];showLens(e.clientX,e.clientY)});
stage.addEventListener('pointerleave',()=>lens.style.display='none');
$('#cbvp').onclick=()=>{zoom=Math.min(4,zoom+0.5);$('#cbvz').textContent=zoom.toFixed(1)+'x';last&&showLens(...last)};$('#cbvm').onclick=()=>{zoom=Math.max(2.5,zoom-0.5);$('#cbvz').textContent=zoom.toFixed(1)+'x';last&&showLens(...last)};
$('#cbvf').onclick=()=>{full=!full;paint()};$('#cbvx').onclick=()=>v.classList.remove('on');v.onclick=e=>{if(e.target==v)v.classList.remove('on')};addEventListener('keydown',e=>{if(e.key=='Escape')v.classList.remove('on')});
const POSES=['girl-heart-mirror-peek','girl-vanity-lipstick','girl-satin-dress-back','girl-coffee-cup-bath','girl-chaise-robe','girl-corset-stockings'].map(p=>{const i=new Image();i.src='girlflash/'+p+'.png';return i});const BEE=new Image();BEE.src='bee.png';
const cache={};function sheet(i){return cache[i]||(cache[i]=new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=no;im.src='hires/h'+String(i).padStart(3,'0')+'.webp'}))}
async function artFor(d){const im=await sheet(Math.floor(d.n/16)),k=d.n%16,a=document.createElement('canvas');a.width=a.height=480;a.getContext('2d').drawImage(im,(k%4)*480,(k/4|0)*480,480,480,0,0,480,480);return a}
window.cbThumb=async function(cv,d){const a=await artFor(d);await Promise.all([BEE,...POSES].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));const sc=cur,sa=art;cur=d;art=a;try{drawLeg(cv.getContext('2d'),cv.width,cv.height)}finally{cur=sc;art=sa}};
window.cbView=async function(d){cur=d;full=false;$('#cbvt').textContent=`${d.name} . ${d.id} . ${d.col}${d.layName?' . '+d.layName+' . '+d.cwName:''}`;v.classList.add('on');
 const im=await sheet(Math.floor(d.n/16)),k=d.n%16;art=document.createElement('canvas');art.width=art.height=480;art.getContext('2d').drawImage(im,(k%4)*480,(k/4|0)*480,480,480,0,0,480,480);paint()};
})();
