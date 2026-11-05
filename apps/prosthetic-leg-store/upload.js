// Coffeebreak upload-your-own leg designer. Everything runs in the browser; no image leaves the device.
const PRICES={w:21,p:169},PAYID='darkokaz@gmx.com',EMAIL='songwriterkaz@gmail.com';// placeholder prices, AUD
const $=id=>document.getElementById(id),W=1831,H=2421,BL=30,DPMM=W/310;// 150 dpi, 310 x 410 mm incl 5 mm bleed
const L=[];let sel=-1;const ld=s=>{const i=new Image();i.src=s;return i};
const LOGO=ld('legmaker/logo.jpg'),BEE=ld('bee.png'),GIRL=ld('girlflash/girl-heart-mirror-peek.png');
$('file').onchange=e=>{[...e.target.files].forEach(f=>{if(!/^image\/(jpeg|png|webp)$/.test(f.type))return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{L.push({im,name:f.name,mode:'feature',sc:80,rot:0,px:50,py:50});sel=L.length-1;ui();draw()};im.src=u});e.target.value=''};
function ui(){$('layers').innerHTML=L.length?L.map((l,i)=>`<div data-i="${i}" class="${i==sel?'on':''}"><span>${i+1}. ${l.name.slice(0,30)}</span><small>${l.im.naturalWidth} x ${l.im.naturalHeight} px</small></div>`).join(''):'<div class="note">No pictures yet.</div>';
 document.querySelectorAll('#layers div[data-i]').forEach(d=>d.onclick=()=>{sel=+d.dataset.i;ui()});const l=L[sel];
 if(l)['mode','sc','rot','px','py'].forEach(k=>$(k).value=l[k]);
 const low=L.filter(l=>Math.max(l.im.naturalWidth,l.im.naturalHeight)<1500);$('warn').style.display=low.length?'block':'none';
 $('warn').textContent=low.length?`Low resolution: ${low.map(l=>l.name).join(', ')} is under 1500 px, so it may print soft or blurry at 30 x 40 cm. A larger picture will look sharper.`:''}
['mode','sc','rot','px','py'].forEach(k=>$(k).oninput=()=>{const l=L[sel];if(!l)return;l[k]=k=='mode'?$(k).value:+$(k).value;draw()});
['bg','ov','girl','bee'].forEach(k=>$(k).oninput=draw);
$('up').onclick=()=>{if(sel<0||sel>=L.length-1)return;[L[sel],L[sel+1]]=[L[sel+1],L[sel]];sel++;ui();draw()};
$('del').onclick=()=>{if(sel<0)return;L.splice(sel,1);sel=L.length-1;ui();draw()};
function ink(){return $('bg').value=='#1a1013'?'#ffd6ea':'#1a1013'}
function wrap(c,guides){c.save();c.fillStyle=$('bg').value;c.fillRect(0,0,W,H);
 for(const l of L){const iw=l.im.naturalWidth,ih=l.im.naturalHeight,w=W*l.sc/100,h=w*ih/iw;
  if(l.mode=='tiled'){const tw=w/3,th=h/3;c.save();c.translate(W*l.px/100,H*l.py/100);c.rotate(l.rot*Math.PI/180);const R=Math.hypot(W,H);for(let x=-R;x<R;x+=tw)for(let y=-R;y<R;y+=th)c.drawImage(l.im,x,y,tw,th);c.restore()}
  else{c.save();c.translate(W*l.px/100,H*l.py/100);c.rotate(l.rot*Math.PI/180);c.drawImage(l.im,-w/2,-h/2,w,h);c.restore()}}
 const ov=$('ov').value;if(ov=='fishnet'||ov=='pbfishnet'){const s=70;c.lineWidth=9;c.strokeStyle=ov=='pbfishnet'?'#1a1013':'#ff4fa3';for(let x=-H;x<W+H;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x+H,H);c.moveTo(x,0);c.lineTo(x-H,H);c.stroke()}
  if(ov=='pbfishnet'){c.lineWidth=4;c.strokeStyle='#ff4fa3';for(let x=-H;x<W+H;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x+H,H);c.moveTo(x,0);c.lineTo(x-H,H);c.stroke()}}}
 if(ov=='lace'){c.lineWidth=4;for(const x0 of[38,W-38])for(let y=60;y<H;y+=62){c.fillStyle='#fff';c.strokeStyle='#ff4fa3';c.beginPath();c.arc(x0,y,34,0,7);c.fill();c.stroke();c.fillStyle='#ff4fa3';c.beginPath();c.arc(x0,y,10,0,7);c.fill()}
  for(let x=40;x<W;x+=62)for(const y0 of[60,H-60]){c.fillStyle='#fff';c.beginPath();c.arc(x,y0,30,0,7);c.fill();c.stroke()}}
 if($('girl').checked&&GIRL.naturalWidth){const gh=H*0.34,gw=gh*GIRL.naturalWidth/GIRL.naturalHeight;c.drawImage(GIRL,BL+60,H-BL-120-gh,gw,gh)}
 if($('bee').checked&&BEE.naturalWidth){const b=220;c.drawImage(BEE,W-BL-80-b,H-BL-140-b,b,b*BEE.naturalHeight/BEE.naturalWidth)}
 if(LOGO.naturalWidth){const lw=200,lh=lw*LOGO.naturalHeight/LOGO.naturalWidth;c.fillStyle='#fff';c.fillRect(W/2-lw/2-10,BL+50,lw+20,lh+20);c.drawImage(LOGO,W/2-lw/2,BL+60,lw,lh)}
 if(guides){const b=5*DPMM,sf=15*DPMM;c.setLineDash([24,14]);c.lineWidth=4;c.strokeStyle='#00b7d4';c.strokeRect(b,b,W-2*b,H-2*b);c.setLineDash([6,10]);c.strokeStyle='#20b020';c.strokeRect(sf,sf,W-2*sf,H-2*sf);c.setLineDash([]);
  c.strokeStyle='#000';c.lineWidth=3;for(const[x,y]of[[b,b],[W-b,b],[b,H-b],[W-b,H-b]]){c.beginPath();c.moveTo(x-28,y);c.lineTo(x+28,y);c.moveTo(x,y-28);c.lineTo(x,y+28);c.stroke()}
  c.fillStyle='#fff';c.fillRect(0,H-26,1250,26);c.fillStyle='#000';c.font='18px sans-serif';c.fillText('Cyan dashed: cut line 30 x 40 cm . Outside it: 5 mm bleed . Green dotted: safe area, keep faces and text inside . Print at 100 percent, 150 dpi',8,H-7)}
 c.restore()}
const flat=$('flat'),fc=flat.getContext('2d'),leg=$('leg'),lc=leg.getContext('2d'),buf=document.createElement('canvas');buf.width=W;buf.height=H;
function legShot(c,w,h){c.fillStyle='#f3e3e8';c.fillRect(0,0,w,h);const t=h*0.06,b=h*0.80,tw=w*0.36,bw=w*0.19,cx=w/2;c.save();c.beginPath();c.moveTo(cx-tw,t);c.lineTo(cx+tw,t);c.lineTo(cx+bw,b);c.quadraticCurveTo(cx,b+h*0.015,cx-bw,b);c.closePath();c.clip();
 const strips=60;for(let i=0;i<strips;i++){const u=i/strips,sx=W*u,sw=W/strips;for(let r=0;r<40;r++){const v=r/40,y0=t+(b-t)*v,y1=t+(b-t)*(v+1/40),half=tw+(bw-tw)*v,x=cx-half+2*half*u;c.drawImage(buf,sx,BL+(H-2*BL)*v,sw,(H-2*BL)/40,x,y0,2*half/strips+1,y1-y0+1)}}
 const g=c.createLinearGradient(cx-tw,0,cx+tw,0);g.addColorStop(0,'#0007');g.addColorStop(.28,'#fff3');g.addColorStop(.5,'#0000');g.addColorStop(1,'#0008');c.fillStyle=g;c.fillRect(0,0,w,h);c.restore();
 c.fillStyle='#222';c.fillRect(cx-tw*1.05,t-h*0.03,tw*2.1,h*0.035);c.fillStyle='#b8bcc4';c.fillRect(cx-w*0.035,b,w*0.07,h*0.12);c.fillStyle='#e9c9b8';c.beginPath();c.moveTo(cx-w*0.08,b+h*0.12);c.lineTo(cx+w*0.08,b+h*0.12);c.lineTo(cx+w*0.3,b+h*0.18);c.lineTo(cx+w*0.3,b+h*0.2);c.lineTo(cx-w*0.1,b+h*0.2);c.closePath();c.fill()}
function draw(){wrap(fc,true);wrap(buf.getContext('2d'),false);legShot(lc,leg.width,leg.height)}
// drag to move on flat wrap
let drag=null;flat.onpointerdown=e=>{if(!L[sel])return;flat.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY,L[sel].px,L[sel].py]};
flat.onpointermove=e=>{if(!drag)return;const r=flat.getBoundingClientRect(),l=L[sel];l.px=Math.max(-50,Math.min(150,drag[2]+(e.clientX-drag[0])/r.width*100));l.py=Math.max(-50,Math.min(150,drag[3]+(e.clientY-drag[1])/r.height*100));$('px').value=l.px;$('py').value=l.py;draw()};flat.onpointerup=()=>drag=null;
// magnifier on the leg preview
const lens=$('lens');function showLens(x,y){const r=leg.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom){lens.style.display='none';return}const d=180,z=3;lens.width=lens.height=d*2;lens.style.width=lens.style.height=d+'px';lens.style.display='block';
 const k=leg.width/r.width,sx=(x-r.left)*k,sy=(y-r.top)*k,src=d/z*k;const c=lens.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,d*2,d*2);c.drawImage(leg,sx-src/2,sy-src/2,src,src,0,0,d*2,d*2);lens.style.left=(x-r.left-d/2)+'px';lens.style.top=(y-r.top-d/2)+'px'}
leg.onpointermove=leg.onpointerdown=e=>showLens(e.clientX,e.clientY);leg.onpointerleave=()=>lens.style.display='none';
// downloads
const save=(blob,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
$('dl').onclick=()=>leg.toBlob(b=>save(b,'coffeebreak_my_leg_design.png'),'image/png');
$('wrap').onclick=()=>flat.toBlob(b=>save(b,'coffeebreak_my_leg_print_wrap_30x40cm_150dpi.png'),'image/png');
$('pdf').onclick=()=>flat.toBlob(async b=>{const jpg=new Uint8Array(await b.arrayBuffer()),pw=310*72/25.4,ph=410*72/25.4,enc=new TextEncoder(),parts=[],offs=[];let len=0;const push=x=>{const u=typeof x=='string'?enc.encode(x):x;parts.push(u);len+=u.length};
 const obj=(n,s,stream)=>{offs[n]=len;push(`${n} 0 obj\n${s}\n`);if(stream){push('stream\n');push(stream);push('\nendstream\n')}push('endobj\n')};
 const cs=`q ${pw.toFixed(2)} 0 0 ${ph.toFixed(2)} 0 0 cm /Im0 Do Q`;push('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw.toFixed(2)} ${ph.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
 obj(4,`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>`,jpg);obj(5,`<< /Length ${cs.length} >>`,enc.encode(cs));
 const x=len;push(`xref\n0 6\n0000000000 65535 f \n`+[1,2,3,4,5].map(n=>String(offs[n]).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`);save(new Blob(parts,{type:'application/pdf'}),'coffeebreak_my_leg_print_wrap_30x40cm.pdf')},'image/jpeg',0.9);
$('order').onclick=()=>{if(!L.length){$('msg').textContent='Please upload a picture first.';return}if(!$('rights').checked){$('msg').textContent='Please confirm you own the rights to your pictures before ordering.';return}
 const k=$('kind').value,cart=JSON.parse(localStorage.getItem('cblegcart2')||'[]'),id='UPLOAD-'+Date.now().toString(36).toUpperCase();
 cart.push({id,name:`Your own picture leg design ${id} (${k=='w'?'printable wrap download':'made-to-order printed cover'}, ${L.length} picture${L.length>1?'s':''}${$('ov').value?', '+$('ov').selectedOptions[0].text+' overlay':''}). Customer confirms they own the rights to the pictures. Please email your downloaded print wrap to ${EMAIL} with your order code.`,price:PRICES[k],q:1});
 localStorage.setItem('cblegcart2',JSON.stringify(cart));$('msg').innerHTML=`Added to your order request. Pay by PayID to ${PAYID} and email your print wrap to ${EMAIL}. <a href="index.html#cart">Open your cart in the store</a>`};
draw();[LOGO,BEE,GIRL].forEach(i=>i.onload=draw);
