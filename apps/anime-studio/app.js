const $=id=>document.getElementById(id),W=640,H=480,st=$('stage'),cx=st.getContext('2d');
let P,cur=0,curLayer=0,tool='brush',playing=null,pendingBubble=null,cache={};
function blank(){return{char:{face:0,eyes:0,hair:0,mouth:0,outfit:0,skin:'#ffe0cf',hairc:'#ff6fae',eyec:'#7a4cff',outc:'#2b2d6e'},bg:'sakura',show:true,layers:['Ink','Colour'],frames:[newFrame(2)],fps:8}}
function newFrame(n){return{layers:Array(n).fill(null),key:null,fx:{},bubbles:[]}}
try{P=JSON.parse(localStorage.getItem('cbAnime'))}catch(e){}
if(!P||!P.frames)P=blank();if(!P.frames[0].key)P.frames[0].key={x:0,y:0,s:100,t:0,a:0,b:0};
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('cbAnime',JSON.stringify(P))}catch(e){}},400)}
// layer canvases cache
function lc(f,l){const k=f+':'+l;if(!cache[k]){const c=document.createElement('canvas');c.width=W;c.height=H;const d=P.frames[f].layers[l];if(d){const im=new Image();im.onload=()=>{c.getContext('2d').drawImage(im,0,0);render()};im.src=d}cache[k]=c}return cache[k]}
function commit(){P.frames[cur].layers[curLayer]=lc(cur,curLayer).toDataURL();save()}
function resetCache(){cache={}}
// tween
function pose(f){let a=null,b=null;for(let i=f;i>=0;i--)if(P.frames[i].key){a=i;break}for(let i=f;i<P.frames.length;i++)if(P.frames[i].key){b=i;break}
 if(a===null)a=b;if(b===null)b=a;const A=P.frames[a].key,B=P.frames[b].key;if(a===b)return A;const t=(f-a)/(b-a),e=t*t*(3-2*t),o={};for(const k in A)o[k]=A[k]+(B[k]-A[k])*e;return o}
// backgrounds
function drawBG(c,type){const g=c.createLinearGradient(0,0,0,H);
 if(type==='none'){c.fillStyle='#fff';c.fillRect(0,0,W,H);return}
 if(type==='city'){g.addColorStop(0,'#1a1040');g.addColorStop(1,'#a0307a');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#fff';for(let i=0;i<40;i++)c.fillRect((i*137)%W,(i*71)%200,2,2);
  for(let i=0;i<12;i++){const bw=40+(i*29)%40,bh=120+(i*53)%180,x=i*55;c.fillStyle='#24183f';c.fillRect(x,H-bh,bw,bh);c.fillStyle='#ffd86b';for(let y=H-bh+10;y<H-10;y+=18)for(let wx=x+6;wx<x+bw-8;wx+=12)if((wx+y)%3)c.fillRect(wx,y,5,8)}return}
 g.addColorStop(0,'#7fd0ff');g.addColorStop(1,type==='sakura'?'#ffe0f0':'#dff4ff');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='#fff';for(const[x,y,r]of[[100,80,30],[140,70,40],[180,85,28],[460,110,34],[500,100,44],[540,115,30]]){c.beginPath();c.arc(x,y,r,0,7);c.fill()}
 if(type==='school'){c.fillStyle='#e8d2b8';c.fillRect(60,200,520,240);c.fillStyle='#b55';c.fillRect(40,180,560,30);c.fillStyle='#8fc8ff';for(let r=0;r<2;r++)for(let i=0;i<7;i++)c.fillRect(85+i*72,235+r*80,46,50);c.fillStyle='#fff';c.beginPath();c.arc(320,195,22,0,7);c.fill();c.strokeStyle='#333';c.beginPath();c.moveTo(320,195);c.lineTo(320,180);c.moveTo(320,195);c.lineTo(331,195);c.stroke();c.fillStyle='#8c6';c.fillRect(0,440,W,40)}
 else if(type==='sakura'){c.fillStyle='#9ad48a';c.fillRect(0,400,W,80);for(const tx of[90,540]){c.fillStyle='#6b3b2a';c.fillRect(tx-10,250,20,160);c.fillStyle='#ffb7d5';for(let i=0;i<9;i++){c.beginPath();c.arc(tx+Math.cos(i)*60,230+Math.sin(i*2)*40,40,0,7);c.fill()}}
  c.fillStyle='#ff8fc0';for(let i=0;i<40;i++){c.beginPath();c.ellipse((i*97)%W,(i*53)%H,5,3,i,0,7);c.fill()}}
 else{c.fillStyle='#9ad48a';c.fillRect(0,420,W,60)}}
// character (original vector parts)
function drawChar(c,ch,p){c.save();c.translate(W/2+p.x,300+p.y);c.scale(p.s/100,p.s/100);c.lineWidth=3;c.strokeStyle='#3a1a2a';c.lineJoin='round';
 const sk=ch.skin,hc=ch.hairc,oc=ch.outc;const shade=(col,a)=>{c.fillStyle=col;c.globalAlpha=a;c.fill();c.globalAlpha=1};
 // back hair
 c.fillStyle=hc;if(ch.hair==2){c.beginPath();c.moveTo(-85,-120);c.quadraticCurveTo(-110,60,-70,150);c.lineTo(70,150);c.quadraticCurveTo(110,60,85,-120);c.fill();c.stroke()}
 if(ch.hair==0)for(const s of[-1,1]){c.beginPath();c.moveTo(s*80,-110);c.quadraticCurveTo(s*170,-40,s*120,110);c.quadraticCurveTo(s*110,0,s*70,-80);c.fill();c.stroke()}
 // body/outfit
 c.fillStyle=sk;c.fillRect(-12,-20,24,30);c.strokeRect(-12,-20,24,30);
 c.beginPath();c.moveTo(-50,10);c.lineTo(50,10);c.lineTo(ch.outfit==2?90:60,170);c.lineTo(ch.outfit==2?-90:-60,170);c.closePath();c.fillStyle=oc;c.fill();c.stroke();
 c.beginPath();c.moveTo(0,10);c.lineTo(50,10);c.lineTo(60,170);c.lineTo(0,170);shade('#000',.15);
 if(ch.outfit==0){c.fillStyle='#fff';c.beginPath();c.moveTo(-40,10);c.lineTo(0,55);c.lineTo(40,10);c.fill();c.stroke();c.fillStyle='#ff3b7f';c.beginPath();c.moveTo(0,50);c.lineTo(-18,70);c.lineTo(18,70);c.fill()}
 if(ch.outfit==1){c.fillStyle='#fff';c.beginPath();c.arc(0,95,20,0,Math.PI);c.fill();c.stroke()}
 if(ch.outfit==2){c.fillStyle='#ffd6ea';for(let i=-3;i<=3;i++){c.beginPath();c.arc(i*25,165,14,0,Math.PI);c.fill()}c.fillStyle='#ffe066';c.beginPath();c.arc(0,40,10,0,7);c.fill()}
 if(ch.outfit==3){c.fillStyle='#8a4b2a';c.beginPath();c.ellipse(0,-205,110,18,0,0,7);c.fill();c.stroke();c.fillRect(-55,-260,110,55);c.strokeRect(-55,-260,110,55);c.fillStyle='#ff6fae';c.fillRect(-55,-222,110,10)}
 // arms
 const arm=(s,ang)=>{c.save();c.translate(s*48,20);c.rotate(s*(-ang*Math.PI/180));c.fillStyle=oc;c.fillRect(-10,0,20,80);c.strokeRect(-10,0,20,80);c.fillStyle=sk;c.beginPath();c.arc(0,88,11,0,7);c.fill();c.stroke();c.restore()};
 arm(-1,p.a);arm(1,0);
 // head
 c.save();c.translate(0,-100);c.rotate(p.t*Math.PI/180);c.fillStyle=sk;c.beginPath();
 if(ch.face==0){c.ellipse(0,0,80,92,0,0,7)}else if(ch.face==1){c.arc(0,0,88,0,7)}else{c.moveTo(-80,-40);c.quadraticCurveTo(-80,-95,0,-95);c.quadraticCurveTo(80,-95,80,-40);c.quadraticCurveTo(80,ch.face==2?20:40,ch.face==2?0:30,92);if(ch.face==3)c.lineTo(-30,92);c.quadraticCurveTo(-80,ch.face==2?20:40,-80,-40)}
 c.fill();c.stroke();c.fillStyle='#ff9ec4';c.globalAlpha=.5;c.beginPath();c.ellipse(-48,30,16,8,0,0,7);c.ellipse(48,30,16,8,0,0,7);c.fill();c.globalAlpha=1;
 // eyes
 const bl=p.b/100;for(const s of[-1,1]){c.save();c.translate(s*35,0);
  if(ch.eyes==2||bl>.85){c.beginPath();c.arc(0,8,16,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  else{c.scale(1,1-bl);const ew=ch.eyes==1?20:24,eh=ch.eyes==1?22:32;c.fillStyle='#fff';c.beginPath();c.ellipse(0,0,ew,eh,0,0,7);c.fill();c.stroke();
   const g=c.createLinearGradient(0,-eh,0,eh);g.addColorStop(0,'#1b0b2e');g.addColorStop(1,ch.eyec);c.fillStyle=g;c.beginPath();c.ellipse(0,4,ew*.8,eh*.85,0,0,7);c.fill();
   c.fillStyle='#fff';c.beginPath();c.arc(-6,-10,7,0,7);c.arc(7,10,3,0,7);c.fill();
   if(ch.eyes==3){c.fillStyle='#ffe066';star(c,0,6,7)}c.lineWidth=5;c.beginPath();c.moveTo(-ew-4,-eh+4);c.quadraticCurveTo(0,-eh-10,ew+4,-eh+4);c.stroke();c.lineWidth=3}
  c.restore()}
 // mouth
 c.beginPath();const m=ch.mouth;if(m==0){c.arc(0,45,10,.2,Math.PI-.2);c.stroke()}else if(m==1){c.fillStyle='#c0285a';c.moveTo(-14,42);c.quadraticCurveTo(0,72,14,42);c.closePath();c.fill();c.stroke()}
 else if(m==2){c.moveTo(-8,50);c.quadraticCurveTo(0,42,8,50);c.stroke()}else if(m==3){c.fillStyle='#c0285a';c.ellipse(0,50,7,10,0,0,7);c.fill();c.stroke()}else{c.moveTo(-12,45);c.quadraticCurveTo(-6,53,0,45);c.quadraticCurveTo(6,53,12,45);c.stroke()}
 // front hair
 c.fillStyle=hc;c.beginPath();c.moveTo(-90,10);c.quadraticCurveTo(-100,-110,0,-108);c.quadraticCurveTo(100,-110,90,10);
 const sp=ch.hair==3?7:5;for(let i=sp;i>=0;i--){const x=-80+i*160/sp;c.lineTo(x+(ch.hair==3?10:0),-40+(i%2?(ch.hair==3?-30:-10):(ch.hair==1?-20:0)))}c.closePath();c.fill();c.stroke();
 c.beginPath();c.ellipse(-30,-80,25,8,-.4,0,7);c.fillStyle='rgba(255,255,255,.4)';c.fill();
 if(ch.hair==4){c.fillStyle=hc;c.beginPath();c.arc(0,-115,32,0,7);c.fill();c.stroke()}
 if(ch.hair==0){c.fillStyle='#ff3b7f';for(const s of[-1,1]){c.beginPath();c.arc(s*82,-95,10,0,7);c.fill()}}
 c.restore();c.restore()}
function star(c,x,y,r){c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.fill()}
function drawFX(c,fx,p){if(fx.speed){c.strokeStyle='rgba(0,0,0,.55)';for(let i=0;i<70;i++){const a=i*2.4,r1=200+(i*37)%60;c.lineWidth=1+(i%3);c.beginPath();c.moveTo(W/2+Math.cos(a)*r1,H/2+Math.sin(a)*r1);c.lineTo(W/2+Math.cos(a)*500,H/2+Math.sin(a)*500);c.stroke()}}
 if(fx.spark){c.fillStyle='#fff6a8';for(let i=0;i<14;i++)star(c,(i*151)%W,(i*89)%H,8+(i%3)*5)}
 if(fx.sweat){const x=W/2+p.x+70*p.s/100,y=200+p.y;c.fillStyle='#9fdcff';c.strokeStyle='#2a6fa8';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+16,y+26,x,y+30);c.quadraticCurveTo(x-16,y+26,x,y);c.fill();c.stroke()}}
function drawBubble(c,b){c.font='bold 22px Comic Sans MS, sans-serif';const tw=c.measureText(b.text).width+30,th=50;c.fillStyle='#fff';c.strokeStyle='#222';c.lineWidth=3;c.beginPath();
 if(b.style==='shout'){for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?1:1.25;c.lineTo(b.x+Math.cos(a)*tw/1.7*r,b.y+Math.sin(a)*th/1.4*r)}c.closePath()}else c.ellipse(b.x,b.y,tw/1.7,th/1.4,0,0,7);c.fill();c.stroke();
 if(b.style==='think'){for(const[i,r]of[[1,8],[2,5]]){c.beginPath();c.arc(b.x-20*i,b.y+th/1.4+12*i,r,0,7);c.fill();c.stroke()}}else if(b.style==='speech'){c.beginPath();c.moveTo(b.x-10,b.y+th/1.5);c.lineTo(b.x-30,b.y+th);c.lineTo(b.x+8,b.y+th/1.5);c.fill();c.stroke()}
 c.fillStyle='#222';c.textAlign='center';c.textBaseline='middle';c.fillText(b.text,b.x,b.y)}
function compose(c,f,onion){const fr=P.frames[f];drawBG(c,P.bg);
 if(onion){c.globalAlpha=.25;for(const o of[f-1,f+1])if(o>=0&&o<P.frames.length)P.layers.forEach((_,l)=>c.drawImage(lc(o,l),0,0));c.globalAlpha=1}
 const p=pose(f);if(P.show)drawChar(c,P.char,p);P.layers.forEach((_,l)=>c.drawImage(lc(f,l),0,0));drawFX(c,fr.fx,p);fr.bubbles.forEach(b=>drawBubble(c,b))}
function render(){compose(cx,cur,$('onion').checked&&!playing);ui()}
function ui(){const fd=$('frames');fd.innerHTML='';P.frames.forEach((f,i)=>{const d=document.createElement('div');d.className='fr'+(i===cur?' on':'');d.textContent=(i+1)+(f.key?' ◆':'');d.onclick=()=>{cur=i;loadUI();render()};fd.appendChild(d)});
 const ld=$('layers');ld.innerHTML='';P.layers.forEach((n,i)=>{const d=document.createElement('div');d.className='lay'+(i===curLayer?' on':'');d.textContent='▤ '+n;d.onclick=()=>{curLayer=i;ui()};ld.appendChild(d)})}
function loadUI(){const ch=P.char;for(const k of['face','eyes','hair','mouth','outfit','skin','hairc','eyec','outc'])$(k).value=ch[k];const p=pose(cur);$('px').value=p.x;$('py').value=p.y;$('ps').value=p.s;$('pt').value=p.t;$('pa').value=p.a;$('pb').value=p.b;
 const fx=P.frames[cur].fx;$('fxspeed').checked=!!fx.speed;$('fxspark').checked=!!fx.spark;$('fxsweat').checked=!!fx.sweat;$('bg').value=P.bg;$('fps').value=P.fps;$('showchar').checked=P.show}
for(const k of['face','eyes','hair','mouth','outfit','skin','hairc','eyec','outc'])$(k).oninput=()=>{P.char[k]=isNaN(+$(k).value)?$(k).value:+$(k).value;save();render()};
const readPose=()=>({x:+$('px').value,y:+$('py').value,s:+$('ps').value,t:+$('pt').value,a:+$('pa').value,b:+$('pb').value});
for(const k of['px','py','ps','pt','pa','pb'])$(k).oninput=()=>{P.frames[cur].key=readPose();save();render()};
$('setkey').onclick=()=>{P.frames[cur].key=readPose();save();render()};$('delkey').onclick=()=>{if(cur>0)P.frames[cur].key=null;save();loadUI();render()};
$('showchar').onchange=e=>{P.show=e.target.checked;save();render()};$('bg').onchange=e=>{P.bg=e.target.value;save();render()};
for(const[id,k]of[['fxspeed','speed'],['fxspark','spark'],['fxsweat','sweat']])$(id).onchange=e=>{P.frames[cur].fx[k]=e.target.checked;save();render()};
$('addb').onclick=()=>{pendingBubble={text:$('btext').value||'Kawaii!',style:$('bstyle').value};$('addb').textContent='Tap stage…'};$('clrb').onclick=()=>{P.frames[cur].bubbles=[];save();render()};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('#panel section').forEach(s=>s.hidden=s.id!=='t-'+b.dataset.tab);const m=b.dataset.tab==='manga';$('page').hidden=!m;st.hidden=m;$('timeline').hidden=m});
document.querySelectorAll('#tools button').forEach(b=>b.onclick=()=>{tool=b.dataset.t;document.querySelectorAll('#tools button').forEach(x=>x.classList.toggle('on',x===b))});
$('addlayer').onclick=()=>{P.layers.push('Layer '+(P.layers.length+1));P.frames.forEach(f=>f.layers.push(null));curLayer=P.layers.length-1;save();render()};
// frames
$('addf').onclick=()=>{P.frames.splice(cur+1,0,newFrame(P.layers.length));cur++;resetCache();save();loadUI();render()};
$('dupf').onclick=()=>{const f=JSON.parse(JSON.stringify(P.frames[cur]));P.frames.splice(cur+1,0,f);cur++;resetCache();save();render()};
$('delf').onclick=()=>{if(P.frames.length<2)return;P.frames.splice(cur,1);if(!P.frames[0].key)P.frames[0].key=pose(0);cur=Math.max(0,cur-1);resetCache();save();loadUI();render()};
$('fps').onchange=()=>{P.fps=Math.max(1,Math.min(30,+$('fps').value||8));save()};
$('play').onclick=()=>{if(playing){clearInterval(playing);playing=null;$('play').textContent='▶ Play';render();return}$('play').textContent='■ Stop';
 playing=setInterval(()=>{if(cur+1>=P.frames.length&&!$('loop').checked){$('play').click();return}cur=(cur+1)%P.frames.length;render()},1000/P.fps)};
// drawing
let down=false,last=null,start=null,snap=null;
const pt=e=>{const r=st.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}};
function stroke(c,a,b){c.lineCap='round';c.lineWidth=+$('size').value;c.globalCompositeOperation=tool==='erase'?'destination-out':'source-over';c.strokeStyle=tool==='shade'?'rgba(80,30,90,.35)':$('col').value;if(tool==='shade')c.lineWidth*=3;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.globalCompositeOperation='source-over'}
function fill(c,x,y){x|=0;y|=0;const im=c.getImageData(0,0,W,H),d=im.data,i0=(y*W+x)*4,t=[d[i0],d[i0+1],d[i0+2],d[i0+3]],h=$('col').value,fc=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16),255];
 if(t.every((v,i)=>v===fc[i]))return;const s=[x,y];while(s.length){const py=s.pop(),px=s.pop();if(px<0||py<0||px>=W||py>=H)continue;const i=(py*W+px)*4;if(Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])+Math.abs(d[i+3]-t[3])>40)continue;d[i]=fc[0];d[i+1]=fc[1];d[i+2]=fc[2];d[i+3]=255;s.push(px+1,py,px-1,py,px,py+1,px,py-1)}c.putImageData(im,0,0)}
st.onpointerdown=e=>{const p=pt(e);if(pendingBubble){P.frames[cur].bubbles.push({...pendingBubble,...p});pendingBubble=null;$('addb').textContent='Add bubble (tap stage to place)';save();render();return}
 const c=lc(cur,curLayer).getContext('2d');if(tool==='fill'){fill(c,p.x,p.y);commit();render();return}down=true;last=start=p;if(tool==='line')snap=c.getImageData(0,0,W,H);st.setPointerCapture(e.pointerId)};
st.onpointermove=e=>{if(!down)return;const p=pt(e),c=lc(cur,curLayer).getContext('2d');if(tool==='line'){c.putImageData(snap,0,0);stroke(c,start,p)}else stroke(c,last,p);last=p;render()};
st.onpointerup=()=>{if(down){down=false;commit()}};
// manga page
function buildPage(){const pc=$('page'),c=pc.getContext('2d'),n=+$('layout').value;c.fillStyle='#fff';c.fillRect(0,0,640,900);const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;const tc=tmp.getContext('2d');
 const rows=n===3?3:n/2,cols=n===3?1:2,m=16,pw=(640-m*(cols+1))/cols,ph=(860-m*(rows+1))/rows;
 for(let i=0;i<n;i++){const r=Math.floor(i/cols),cl=i%cols,x=m+cl*(pw+m),y=m+r*(ph+m);if(i<P.frames.length){compose(tc,i,false);const sc=Math.max(pw/W,ph/H);c.save();c.beginPath();c.rect(x,y,pw,ph);c.clip();c.drawImage(tmp,x+(pw-W*sc)/2,y+(ph-H*sc)/2,W*sc,H*sc);c.restore()}c.lineWidth=5;c.strokeStyle='#111';c.strokeRect(x,y,pw,ph)}
 const lg=new Image();lg.onload=()=>{c.drawImage(lg,640-60,862,34,34)};lg.src='cb-logo.jpg';c.fillStyle='#d0237a';c.font='bold 18px sans-serif';c.fillText('Coffeebreak Anime Studio',16,885)}
$('mkpage').onclick=buildPage;$('savepage').onclick=()=>{buildPage();setTimeout(()=>dl($('page').toDataURL(),'coffeebreak-manga-page.png'),200)};
// export
function dl(u,n){const a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove()}
const off=document.createElement('canvas');off.width=W;off.height=H;const oc=off.getContext('2d');
$('expng').onclick=async()=>{for(let i=0;i<P.frames.length;i++){compose(oc,i,false);dl(off.toDataURL(),'frame-'+String(i+1).padStart(3,'0')+'.png');await new Promise(r=>setTimeout(r,250))}$('exstat').textContent='PNG frames saved'};
$('exgif').onclick=()=>{$('exstat').textContent='Making GIF…';setTimeout(()=>{const s=document.createElement('canvas');s.width=320;s.height=240;const sc=s.getContext('2d'),fr=[];
 for(let i=0;i<P.frames.length;i++){compose(oc,i,false);sc.drawImage(off,0,0,320,240);fr.push(sc.getImageData(0,0,320,240).data)}const b=encodeGIF(fr,320,240,Math.round(100/P.fps));dl(URL.createObjectURL(b),'coffeebreak-anime.gif');$('exstat').textContent='GIF saved ('+Math.round(b.size/1024)+' KB)'},30)};
$('exwebm').onclick=()=>{if(!window.MediaRecorder||!off.captureStream){$('exstat').textContent='WebM not supported in this browser';return}const rec=new MediaRecorder(off.captureStream(P.fps),{mimeType:MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm'}),ch=[];
 rec.ondataavailable=e=>ch.push(e.data);rec.onstop=()=>{dl(URL.createObjectURL(new Blob(ch,{type:'video/webm'})),'coffeebreak-anime.webm');$('exstat').textContent='WebM saved'};rec.start();$('exstat').textContent='Recording…';let i=0;
 const t=setInterval(()=>{if(i>=P.frames.length*2){clearInterval(t);rec.stop();return}compose(oc,i%P.frames.length,false);i++},1000/P.fps)};
$('newp').onclick=()=>{if(confirm('Start a new project?')){P=blank();P.frames[0].key={x:0,y:0,s:100,t:0,a:0,b:0};cur=0;resetCache();save();loadUI();render()}};
loadUI();render();
