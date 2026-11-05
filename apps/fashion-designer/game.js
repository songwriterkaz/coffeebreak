const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
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
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Fashion Designer =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'fashionDemo':'fashionSave';
const st=document.createElement('style');st.textContent=`
#fd{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#fd h1,#fd h2,#fd h3{color:#e8a0b0;margin:6px 0 8px}
#fd button{background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:10px;padding:7px 11px;font:14px Georgia;cursor:pointer;margin:2px}
#fd button.on,#fd button.primary{background:#e8a0b0;color:#1a0a10;font-weight:bold}
#fd button.lock{opacity:.5}
#fd input,#fd select,#fd textarea{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;max-width:100%}
#fd label{display:block;margin:8px 0 3px;color:#d9b8c0;font-size:13px}
#fd .wrap{display:flex;gap:14px;flex-wrap:wrap}#fd .ctl{flex:1 1 360px;min-width:300px}#fd .pv{flex:1 1 520px;text-align:center}
#fd canvas.prev{width:100%;max-width:600px;background:#f6efe9;border-radius:14px;border:2px solid #e8a0b0;touch-action:none}
#fd .sw{width:26px;height:26px;border-radius:50%;border:2px solid #555;cursor:pointer;padding:0;margin:2px}#fd .sw.on{border:3px solid #ffcf6a}
#fd .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:14px;padding:12px;margin:8px 0}
#fd .note{font-size:13px;color:#d9b8c0;line-height:1.45}
#fd .ni{background:#16303a;border-left:3px solid #7ec8e3;padding:8px 10px;border-radius:8px;font-size:13px;margin-top:8px}
#fd table{border-collapse:collapse;font-size:13px;width:100%}#fd td,#fd th{border-bottom:1px solid #5a2a3a;padding:4px}#fd th{color:#ffcf6a}
#fd textarea{width:100%;height:170px;font:12px monospace}
#fdMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e8a0b0;color:#1a0a10;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='fd';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='fdMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
// product: key,name,printW,printH,inches,aop
const PRODUCTS=[['tee','T-shirt',4500,5400,'12 × 18 in @300 dpi (front/back)'],['hoodie','Hoodie',4500,5400,'12 × 18 in @300 dpi (front/back)'],['dress','Dress (all-over)',4800,7200,'16 × 24 in panel @300 dpi'],['leggings','Leggings (all-over)',4800,7200,'16 × 24 in panel per leg @300 dpi'],['skirt','Skater skirt (all-over)',4800,4800,'16 × 16 in panel @300 dpi'],['tote','Tote bag',4500,4500,'15 × 15 in @300 dpi'],['socks','Socks (all-over)',2400,4800,'8 × 16 in per sock @300 dpi'],['cap','Cap (front)',1800,750,'6 × 2.5 in @300 dpi (embroidery/print)']];
const DEMO_P=['tee','tote'];
const COLOURS=['#ffffff','#111111','#f4e3c9','#e8a0b0','#b0303a','#f28c28','#f5d547','#5aa469','#2e6b4a','#7ec8e3','#2b4c8c','#1b2340','#8e5bb5','#c9b8e8','#8a8a8a','#6b4a32'];
const PATTERNS=[['none','No pattern'],['dots','Polka dots'],['stripes','Candy stripes'],['hearts','Hearts'],['checks','Picnic check'],['waves','Ocean waves'],['stars','Stars & moons'],['cups','Coffee cups'],['flowers','Daisy field'],['zigzag','Zigzag'],['confetti','Confetti'],['scales','Mermaid scales'],['upload','My image (tiled)']];
const DEMO_PAT=['none','dots','stripes','hearts'];
const FONTS=[['Georgia, serif','Classic serif'],['Arial Black, Arial, sans-serif','Bold block'],['"Brush Script MT", cursive','Brush script'],['"Courier New", monospace','Typewriter'],['Impact, sans-serif','Poster'],['"Comic Sans MS", cursive','Playful'],['"Trebuchet MS", sans-serif','Modern']];
const STICKERS=['☕','❤️','⭐','🌸','🦋','🌙','🔥','🌈','🎵','🍒','👑','🐾','🌻','💎','🍩','✨','🐚','🌊'];
const SIZES={tee:['XS','S','M','L','XL','2XL','3XL','4XL','5XL'],hoodie:['XS','S','M','L','XL','2XL','3XL','4XL','5XL'],dress:['XS','S','M','L','XL','2XL','3XL'],leggings:['XS','S','M','L','XL','2XL','3XL'],skirt:['XS','S','M','L','XL','2XL','3XL'],tote:['One size'],socks:['S (AU 2–5)','M (AU 6–9)','L (AU 10–13)'],cap:['Adjustable']};
const CHART={tee:[['Size','Chest (cm)','Length (cm)'],['XS','86','68'],['S','92','71'],['M','102','74'],['L','112','76'],['XL','122','79'],['2XL','132','81'],['3XL','142','84'],['4XL','152','86'],['5XL','162','89']],
 hoodie:[['Size','Chest (cm)','Length (cm)'],['XS','92','66'],['S','100','69'],['M','108','72'],['L','116','74'],['XL','124','77'],['2XL','132','79'],['3XL','140','81'],['4XL','148','83'],['5XL','156','85']],
 dress:[['Size','Bust (cm)','Waist (cm)','Hip (cm)'],['XS','78','62','86'],['S','84','68','92'],['M','90','74','98'],['L','98','82','106'],['XL','106','90','114'],['2XL','116','100','124'],['3XL','126','110','134']],
 leggings:[['Size','Waist (cm)','Hip (cm)','Inseam (cm)'],['XS','60','84','68'],['S','66','90','69'],['M','72','96','70'],['L','80','104','71'],['XL','88','112','72'],['2XL','98','122','72'],['3XL','108','132','72']],
 skirt:[['Size','Waist (cm)','Length (cm)'],['XS','60','43'],['S','66','44'],['M','72','45'],['L','80','46'],['XL','88','47'],['2XL','98','48'],['3XL','108','49']],
 tote:[['Size','Width (cm)','Height (cm)','Handle (cm)'],['One size','38','42','60']],socks:[['Size','AU shoe size'],['S','2–5'],['M','6–9'],['L','10–13']],cap:[['Size','Head (cm)'],['Adjustable','54–61']]};
const SUPPLIERS=[['S3','S3 (prints in Australia, 3–5 day delivery)','Tees, hoodies, totes and caps made locally in Australia; free plan.'],['S2','S2 (Brisbane & Melbourne partners + global AOP)','Biggest all-over print range: dresses, leggings, skirts, socks.'],['S4','S4 (The Print Bar, Brisbane + global providers)','Wide catalogue and AU-printed tees via local providers.']];
let S;try{S=JSON.parse(localStorage.getItem(SK)||'null')}catch(e){S=null}
if(!S)S={cur:newD(),saved:[],cfg:{email:'songwriterkaz@gmail.com'}};
function newD(){return{name:'My design',product:'tee',colour:'#ffffff',pattern:'none',patColour:'#e8a0b0',patScale:1,side:'front',text:{front:'',back:''},font:FONTS[0][0],textColour:'#1a0a10',textY:{front:.7,back:.3},textSize:{front:.09,back:.09},stickers:{front:[],back:[]},img:{front:null,back:null},imgPos:{front:{x:.5,y:.4,s:.5},back:{x:.5,y:.4,s:.5}},sel:'img',size:'M',qty:1,nio:false,supplier:'S3'}}
const d=()=>S.cur;
function save(){try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){say('Storage is full — try a smaller image.')}}
if(D&&!DEMO_P.includes(d().product))d().product='tee';
const imgCache={};function getImg(src){if(!src)return null;if(imgCache[src])return imgCache[src].complete?imgCache[src]:null;const im=new Image();im.onload=()=>draw();im.src=src;imgCache[src]=im;return null}
let upTile=null;
function patTile(key,col,base,sz){const t=document.createElement('canvas');t.width=t.height=sz;const x=t.getContext('2d');x.fillStyle=base;x.fillRect(0,0,sz,sz);x.fillStyle=col;x.strokeStyle=col;const u=sz/10;x.lineWidth=u*.6;
 const heart=(cx,cy,r)=>{x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.4,cy-r*.2,cx-r*.6,cy-r*1.2,cx,cy-r*.4);x.bezierCurveTo(cx+r*.6,cy-r*1.2,cx+r*1.4,cy-r*.2,cx,cy+r*.9);x.fill()};
 const star=(cx,cy,r)=>{x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()};
 switch(key){case'dots':[[2.5,2.5],[7.5,7.5]].forEach(p=>{x.beginPath();x.arc(p[0]*u,p[1]*u,u*1.4,0,7);x.fill()});break;
 case'stripes':for(let i=-10;i<20;i+=4){x.beginPath();x.moveTo(i*u,0);x.lineTo((i+10)*u,sz);x.lineWidth=u*1.4;x.stroke()}break;
 case'hearts':heart(2.5*u,2.8*u,u*1.6);heart(7.5*u,7.8*u,u*1.6);break;
 case'checks':x.globalAlpha=.5;x.fillRect(0,0,sz,sz/2);x.fillRect(0,0,sz/2,sz);x.globalAlpha=1;x.fillRect(0,0,sz/2,sz/2);break;
 case'waves':for(let r=1;r<10;r+=3){x.beginPath();for(let i=0;i<=10;i++)x.lineTo(i*u,r*u+Math.sin(i/10*Math.PI*2)*u);x.stroke()}break;
 case'stars':star(2.5*u,2.5*u,u*1.5);x.beginPath();x.arc(7.5*u,7*u,u*1.6,0,7);x.fill();x.fillStyle=base;x.beginPath();x.arc(8.2*u,6.4*u,u*1.4,0,7);x.fill();break;
 case'cups':[[2.5,3],[7.5,8]].forEach(p=>{const cx=p[0]*u,cy=p[1]*u;x.fillRect(cx-u*1.2,cy-u,u*2.4,u*2);x.beginPath();x.arc(cx+u*1.3,cy,u*.6,0,7);x.lineWidth=u*.4;x.stroke();x.beginPath();x.moveTo(cx-u*.5,cy-u*1.4);x.quadraticCurveTo(cx,cy-u*2.2,cx+u*.3,cy-u*1.4);x.stroke()});break;
 case'flowers':[[2.5,2.5],[7.5,7.5]].forEach(p=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;x.beginPath();x.ellipse(p[0]*u+Math.cos(a)*u,p[1]*u+Math.sin(a)*u,u*.8,u*.45,a,0,7);x.fill()}x.save();x.fillStyle='#f5d547';x.beginPath();x.arc(p[0]*u,p[1]*u,u*.5,0,7);x.fill();x.restore()});break;
 case'zigzag':for(let r=1;r<10;r+=3.3){x.beginPath();for(let i=0;i<=10;i++)x.lineTo(i*u,(r+(i%2?1:0))*u);x.stroke()}break;
 case'confetti':{let s=7;const rnd=()=>(s=(s*9301+49297)%233280)/233280;for(let i=0;i<14;i++){x.save();x.translate(rnd()*sz,rnd()*sz);x.rotate(rnd()*6);x.globalAlpha=.6+rnd()*.4;x.fillRect(-u*.6,-u*.2,u*1.2,u*.4);x.restore()}}break;
 case'scales':x.lineWidth=u*.4;for(let r=0;r<12;r+=2.5)for(let i=-1;i<12;i+=2.5){x.beginPath();x.arc((i+(r/2.5%2?1.25:0))*u,r*u,u*1.25,0,Math.PI);x.stroke()}break;
 case'upload':if(upTile)x.drawImage(upTile,0,0,sz,sz);break}
 return t}
// draw print art into rect (0..W,0..H)
function renderArt(x,W,H,side,o){const s=d();o=o||{};x.save();
 if(o.bg!==false){x.fillStyle=s.colour;x.fillRect(0,0,W,H)}
 if(s.pattern!=='none'&&(s.pattern!=='upload'||upTile)){const ts=Math.max(16,Math.round(W/6*s.patScale));const t=patTile(s.pattern,s.patColour,s.colour,ts);x.fillStyle=x.createPattern(t,'repeat');x.fillRect(0,0,W,H)}
 const ip=s.imgPos[side],im=getImg(s.img[side]);if(im){const w=W*ip.s,h=w*im.height/im.width;x.drawImage(im,ip.x*W-w/2,ip.y*H-h/2,w,h)}
 (s.stickers[side]||[]).forEach(k=>{x.font=Math.round(W*k.s)+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(k.e,k.x*W,k.y*H)});
 const t=s.text[side];if(t){x.font='bold '+Math.round(W*s.textSize[side])+'px '+s.font;x.fillStyle=s.textColour;x.textAlign='center';x.textBaseline='middle';t.split('\n').forEach((ln,i)=>x.fillText(ln,W/2,s.textY[side]*H+i*W*s.textSize[side]*1.15))}
 x.restore()}
const aop=k=>['dress','leggings','skirt','socks'].includes(k);
function garment(x,k,W,H){x.beginPath();const P=(a)=>{x.moveTo(a[0][0]*W,a[0][1]*H);a.slice(1).forEach(p=>x.lineTo(p[0]*W,p[1]*H));x.closePath()};
 if(k==='tee')P([[.32,.1],[.42,.08],[.5,.13],[.58,.08],[.68,.1],[.9,.25],[.82,.36],[.74,.31],[.74,.92],[.26,.92],[.26,.31],[.18,.36],[.1,.25]]);
 else if(k==='hoodie')P([[.36,.1],[.42,.03],[.58,.03],[.64,.1],[.88,.24],[.9,.82],[.8,.82],[.76,.36],[.76,.92],[.24,.92],[.24,.36],[.2,.82],[.1,.82],[.12,.24]]);
 else if(k==='dress')P([[.38,.06],[.46,.1],[.54,.1],[.62,.06],[.7,.12],[.64,.38],[.84,.94],[.16,.94],[.36,.38],[.3,.12]]);
 else if(k==='leggings')P([[.3,.06],[.7,.06],[.72,.3],[.66,.95],[.55,.95],[.5,.35],[.45,.95],[.34,.95],[.28,.3]]);
 else if(k==='skirt')P([[.34,.2],[.66,.2],[.88,.8],[.12,.8]]);
 else if(k==='tote'){P([[.2,.3],[.8,.3],[.8,.94],[.2,.94]])}
 else if(k==='socks'){P([[.38,.06],[.6,.06],[.6,.66],[.78,.8],[.76,.92],[.5,.92],[.38,.78]])}
 else if(k==='cap'){x.moveTo(.18*W,.62*H);x.quadraticCurveTo(.5*W,.05*H,.82*W,.62*H);x.lineTo(.95*W,.72*H);x.quadraticCurveTo(.5*W,.8*H,.18*W,.66*H);x.closePath()}}
// print box on garment preview (fraction rect)
function pbox(k){return{tee:[.32,.22,.36,.5],hoodie:[.32,.2,.36,.46],tote:[.27,.4,.46,.46],cap:[.3,.34,.4,.17]}[k]||[0,0,1,1]}
let cv,cx2;
function draw(){if(!cv)return;const s=d(),W=cv.width,H=cv.height,x=cx2;x.clearRect(0,0,W,H);x.fillStyle='#f6efe9';x.fillRect(0,0,W,H);
 x.save();garment(x,s.product,W,H);x.fillStyle=s.colour;x.fill();x.clip();
 if(aop(s.product)){renderArt(x,W,H,s.side)}else{const b=pbox(s.product);x.save();x.translate(b[0]*W,b[1]*H);renderArt(x,b[2]*W,b[3]*H,s.side,{bg:s.pattern!=='none'});x.restore();if(s.pattern!=='none'){/*AOP tee: whole garment*/}}
 x.restore();x.save();garment(x,s.product,W,H);x.lineWidth=3;x.strokeStyle='rgba(0,0,0,.35)';x.stroke();x.restore();
 if(s.product==='tote'){x.strokeStyle='#6b4a32';x.lineWidth=10;x.beginPath();x.arc(W*.5,H*.3,W*.17,Math.PI,0);x.stroke()}
 if(!aop(s.product)){const b=pbox(s.product);x.setLineDash([8,6]);x.strokeStyle='rgba(120,120,120,.6)';x.lineWidth=1.5;x.strokeRect(b[0]*W,b[1]*H,b[2]*W,b[3]*H);x.setLineDash([])}
 x.fillStyle='#5a2a3a';x.font='bold 18px Georgia';x.textAlign='left';x.fillText((s.side==='front'?'FRONT':'BACK')+' · '+PRODUCTS.find(p=>p[0]===s.product)[1],12,26);
 if(s.nio){x.fillStyle='#16303a';x.font='14px Georgia';x.fillText('🧩 No Inside Out: tagless · flat seams',12,H-12)}}
function opt(list,key,cur,lockf){return list.map(([k,n])=>`<button data-k="${key}" data-v="${esc(k)}" class="${k===cur?'on':''} ${lockf&&lockf(k)?'lock':''}">${esc(n)}${lockf&&lockf(k)?' 🔒':''}</button>`).join('')}
function sw(key,cur){return COLOURS.map(col=>`<button class="sw ${col===cur?'on':''}" data-c="${key}" data-v="${col}" style="background:${col}"></button>`).join('')}
let tab='design';
function ui(){const s=d(),sd=s.side;
 R.innerHTML=`<h1>👗 Coffeebreak Fashion Designer${D?' <span style="font-size:14px">(free demo)</span>':''}</h1>
 <div>${[['design','🎨 Design'],['size','📏 Size chart'],['order','🛒 Order'],['saved','💾 My designs'],['help','ℹ️ About']].map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')}</div>
 <div class="wrap"><div class="ctl" id="fdc"></div><div class="pv"><canvas class="prev" id="fdcv" width="600" height="660"></canvas>
 <div><button data-side="front" class="${sd==='front'?'on':''}">Front</button><button data-side="back" class="${sd==='back'?'on':''}">Back</button>
 <button id="fdMock">🖼️ Save mockup PNG</button><button id="fdPrint" class="${D?'lock':''}">🖨️ Print-ready PNG${D?' 🔒':''}</button></div>
 <p class="note">Drag on the preview to move the selected layer (${esc(s.sel)}).</p></div></div>`;
 const C=R.querySelector('#fdc');
 if(tab==='design')C.innerHTML=`<div class="card"><h3>1. Product</h3>${opt(PRODUCTS.map(p=>[p[0],p[1]]),'product',s.product,k=>D&&!DEMO_P.includes(k))}</div>
 <div class="card"><h3>2. Base colour</h3>${sw('colour',s.colour)}</div>
 <div class="card"><h3>3. All-over print pattern</h3>${opt(PATTERNS,'pattern',s.pattern,k=>D&&!DEMO_PAT.includes(k))}
 <label>Pattern colour</label>${sw('patColour',s.patColour)}<label>Pattern scale</label><input type="range" id="ps" min=".3" max="3" step=".1" value="${s.patScale}">
 <label>Upload a pattern tile image ${D?'🔒 full version':''}</label><input type="file" id="pu" accept="image/*" ${D?'disabled':''}></div>
 <div class="card"><h3>4. Your image (${sd})</h3><input type="file" id="iu" accept="image/*"> <button id="ir">Remove</button>
 <label>Scale</label><input type="range" id="is" min=".1" max="1.5" step=".02" value="${s.imgPos[sd].s}"></div>
 <div class="card"><h3>5. Text (${sd})</h3><textarea id="tx" style="height:60px;font:14px Georgia">${esc(s.text[sd])}</textarea>
 <label>Font</label><select id="tf">${FONTS.map(f=>`<option value='${esc(f[0])}' ${f[0]===s.font?'selected':''}>${f[1]}</option>`).join('')}</select>
 <label>Text colour</label>${sw('textColour',s.textColour)}<label>Size</label><input type="range" id="tsz" min=".03" max=".25" step=".005" value="${s.textSize[sd]}"></div>
 <div class="card"><h3>6. Stickers (${sd})</h3>${STICKERS.map(e=>`<button data-st="${e}">${e}</button>`).join('')}<br><button id="sc">Clear stickers</button>
 <label>Selected layer to move</label>${opt([['img','Image'],['text','Text'],['sticker','Last sticker']],'sel',s.sel)}</div>
 <div class="card"><h3>7. 🧩 No Inside Out</h3><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="nio" ${s.nio?'checked':''}> Sensory-friendly: tagless printed label, flat seams, soft fabric request</label>
 <p class="note">Coffeebreak's sensory-friendly option. It's written on your order so the supplier choice matches, where the product allows it.</p></div>`;
 else if(tab==='size'){const ch=CHART[s.product];C.innerHTML=`<div class="card"><h3>Size chart: ${esc(PRODUCTS.find(p=>p[0]===s.product)[1])}</h3><table>${ch.map((r,i)=>'<tr>'+r.map(v=>i?`<td>${v}</td>`:`<th>${v}</th>`).join('')+'</tr>').join('')}</table><p class="note">Guide only — measurements vary by supplier and blank brand. Karen confirms the exact chart with your quote.</p></div>`}
 else if(tab==='order')C.innerHTML=`<div class="card"><h3>Order this design</h3><label>Design name</label><input id="dn" value="${esc(s.name)}">
 <label>Size</label><select id="sz">${SIZES[s.product].map(z=>`<option ${z===s.size?'selected':''}>${z}</option>`).join('')}</select>
 <label>Quantity</label><input id="qt" type="number" min="1" max="99" value="${s.qty}">
 <label>Supplier</label>${SUPPLIERS.map(([k,n,dsc])=>`<label style="display:flex;gap:8px"><input type="radio" name="sup" value="${k}" ${s.supplier===k?'checked':''}><span><b>${n}</b><br><span class="note">${dsc}</span></span></label>`).join('')}
 <label>Your name</label><input id="cn" value="${esc(S.cfg.cust||'')}"><label>Your email</label><input id="ce" value="${esc(S.cfg.cemail||'')}">
 <label>Delivery address</label><input id="ca" value="${esc(S.cfg.addr||'')}" style="width:100%">
 <div id="fdPrice"></div><p><button class="primary" id="go">📧 Email order request</button><button id="cp">Copy summary</button></p>
 <div class="ni">Honest note: orders aren't automatic yet. This app doesn't take payment or make clothes. Your order is emailed to Coffeebreak (songwriterkaz@gmail.com) and <b>Karen replies with a price and a PayPal payment request</b>. Then she places it with the supplier you chose. Please attach your saved mockup${D?'':' and print-ready PNG'} to the email.</div>
 <textarea id="sum" readonly>${esc(summary())}</textarea></div>`;
 else if(tab==='saved')C.innerHTML=`<div class="card"><h3>My designs</h3><button id="sv" class="primary">💾 Save current</button><button id="nw">➕ New design</button>${D?'<p class="note">Demo keeps 2 designs.</p>':''}
 ${S.saved.map((x,i)=>`<div style="margin:6px 0">${esc(x.name)} · ${esc(x.product)} <button data-ld="${i}">Open</button><button data-dl="${i}">Delete</button></div>`).join('')||'<p class="note">Nothing saved yet.</p>'}</div>`;
 else C.innerHTML=`<div class="card"><h3>About</h3><p class="note">Design real clothing: pick a product, colour and an original all-over pattern, add your image, text and stickers on the front and back, then export a mockup${D?'':' and a print-ready PNG at supplier resolution'} and send an order request.</p>
 <table><tr><th>Product</th><th>Print file</th></tr>${PRODUCTS.map(p=>`<tr><td>${p[1]}</td><td>${p[2]}×${p[3]} px · ${p[4]}</td></tr>`).join('')}</table>
 <p class="note">Print sizes are typical starting templates; Karen checks your file against the chosen supplier's template before ordering. Only use images you own or have rights to.</p></div>`;
 cv=R.querySelector('#fdcv');cx2=cv.getContext('2d');draw();bind()}
const FDSUP={S3:'S3',S2:'S2',S4:'S4'};
function fdQuote(){if(!window.CBP)return null;const s=d(),p=PRODUCTS.find(q=>q[0]===s.product),L=[{label:p[1]+' ('+s.size+')',item:s.product,size:s.size}];
 const bk=(s.text&&s.text.back)||(s.stickers&&s.stickers.back&&s.stickers.back.length)||(s.img&&s.img.back);if(bk&&['tee','hoodie'].includes(s.product))L.push({label:'Back print',item:'back_print',size:'*'});
 L.push({label:'Shipping',item:'shipping',size:'*',once:true});return CBP.quote({supplier:FDSUP[s.supplier]||s.supplier,qty:s.qty,lines:L})}
function fdPrice(){const q=fdQuote(),el=document.getElementById('fdPrice');if(q&&el)CBP.mount(el,q,fdPrice)}
function summary(){const s=d(),p=PRODUCTS.find(q=>q[0]===s.product),sup=SUPPLIERS.find(q=>q[0]===s.supplier);
 return ['COFFEEBREAK FASHION ORDER REQUEST','Design: '+s.name,'Product: '+p[1],'Size: '+s.size+'  Qty: '+s.qty,'Base colour: '+s.colour,'Pattern: '+(PATTERNS.find(q=>q[0]===s.pattern)||[0,''])[1]+(s.pattern!=='none'?' ('+s.patColour+', scale '+s.patScale+')':''),
 'Front text: '+(s.text.front||'-'),'Back text: '+(s.text.back||'-'),'Font: '+s.font,'Front image: '+(s.img.front?'yes':'no')+'  Back image: '+(s.img.back?'yes':'no'),'Stickers: front '+s.stickers.front.map(k=>k.e).join('')+' / back '+s.stickers.back.map(k=>k.e).join(''),
 'No Inside Out (tagless, flat seams): '+(s.nio?'YES':'no'),'Supplier: '+sup[1],'Print file: '+p[2]+'×'+p[3]+' px','','Customer: '+(S.cfg.cust||''),'Email: '+(S.cfg.cemail||''),'Address: '+(S.cfg.addr||''),'','Karen will reply with a price and a PayPal payment request. Nothing is charged until you pay that request.'].join('\n')+(window.CBP?CBP.text(fdQuote()):'')}
function readImg(f,cb){if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const m=1400,k=Math.min(1,m/Math.max(im.width,im.height)),t=document.createElement('canvas');t.width=im.width*k;t.height=im.height*k;t.getContext('2d').drawImage(im,0,0,t.width,t.height);cb(t.toDataURL(/png/.test(f.type)?'image/png':'image/jpeg',.88))};im.src=r.result};r.readAsDataURL(f)}
function dl(canvas,name){canvas.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)},'image/png')}
function exportPrint(){const s=d(),p=PRODUCTS.find(q=>q[0]===s.product);const t=document.createElement('canvas');t.width=p[2];t.height=p[3];const x=t.getContext('2d');renderArt(x,t.width,t.height,s.side,{bg:aop(s.product)||s.pattern!=='none'});window.lastPrint={w:t.width,h:t.height};dl(t,(s.name||'design').replace(/\W+/g,'-')+'-'+s.product+'-'+s.side+'-print-'+p[2]+'x'+p[3]+'.png');say('Print file '+p[2]+'×'+p[3]+' px saved')}
function bind(){const s=d(),sd=s.side;const $=q=>R.querySelector(q);
 R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;ui()});
 R.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{s.side=b.dataset.side;save();ui()});
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;
  if(D&&((k==='product'&&!DEMO_P.includes(v))||(k==='pattern'&&!DEMO_PAT.includes(v)))){window.demoEnd&&window.demoEnd('All 8 products (hoodies, dresses, leggings, skirts, socks, caps), all 12 patterns, image tiles and print-ready files are in the full <b>Coffeebreak Fashion Designer</b>.');return}
  if(k==='pattern'&&v==='upload'&&!upTile){say('Upload a pattern tile first.');return}
  s[k]=v;if(k==='product')s.size=SIZES[v].includes(s.size)?s.size:SIZES[v][0];save();ui()});
 R.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{s[b.dataset.c]=b.dataset.v;save();ui()});
 R.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{s.stickers[sd].push({e:b.dataset.st,x:.3+Math.random()*.4,y:.3+Math.random()*.4,s:.14});s.sel='sticker';save();draw()});
 const on=(q,ev,f)=>{const e=$(q);if(e)e[ev]=f};
 on('#ps','oninput',e=>{s.patScale=+e.target.value;save();draw()});
 on('#is','oninput',e=>{s.imgPos[sd].s=+e.target.value;save();draw()});
 on('#tsz','oninput',e=>{s.textSize[sd]=+e.target.value;save();draw()});
 on('#tx','oninput',e=>{s.text[sd]=e.target.value;save();draw()});
 on('#tf','onchange',e=>{s.font=e.target.value;save();draw()});
 on('#nio','onchange',e=>{s.nio=e.target.checked;save();draw()});
 on('#sc','onclick',()=>{s.stickers[sd]=[];save();draw()});
 on('#ir','onclick',()=>{s.img[sd]=null;save();draw()});
 on('#iu','onchange',e=>readImg(e.target.files[0],u=>{s.img[sd]=u;s.sel='img';save();draw()}));
 on('#pu','onchange',e=>readImg(e.target.files[0],u=>{const im=new Image();im.onload=()=>{upTile=im;s.pattern='upload';s.upTile=u;save();ui()};im.src=u}));
 on('#fdMock','onclick',()=>{const t=document.createElement('canvas');t.width=1200;t.height=1320;const o=[cv,cx2];cv=t;cx2=t.getContext('2d');draw();dl(t,(s.name||'design').replace(/\W+/g,'-')+'-'+s.product+'-'+sd+'-mockup.png');[cv,cx2]=o;draw();say('Mockup saved')});
 on('#fdPrint','onclick',()=>{if(D){window.demoEnd&&window.demoEnd('Print-ready files at supplier resolution are in the full <b>Coffeebreak Fashion Designer</b>.');return}exportPrint()});
 const upd=()=>{const g=q=>$(q)&&$(q).value;if($('#dn'))s.name=g('#dn');if($('#sz'))s.size=g('#sz');if($('#qt'))s.qty=Math.max(1,+g('#qt')||1);const r=R.querySelector('input[name=sup]:checked');if(r)s.supplier=r.value;S.cfg.cust=g('#cn')||'';S.cfg.cemail=g('#ce')||'';S.cfg.addr=g('#ca')||'';save();if($('#sum'))$('#sum').value=summary();fdPrice()};
 R.querySelectorAll('#dn,#sz,#qt,input[name=sup],#cn,#ce,#ca').forEach(e=>{e.oninput=upd;e.onchange=upd});fdPrice();
 on('#go','onclick',()=>{upd();location.href='mailto:'+(S.cfg.email||'songwriterkaz@gmail.com')+'?subject='+encodeURIComponent('Fashion order request — '+s.name)+'&body='+encodeURIComponent(summary());say('Opening your email app…')});
 on('#cp','onclick',()=>{upd();try{navigator.clipboard.writeText(summary());say('Copied')}catch(e){say('Select the text to copy')}});
 on('#sv','onclick',()=>{if(D&&S.saved.length>=2){window.demoEnd&&window.demoEnd('Unlimited saved designs are in the full <b>Coffeebreak Fashion Designer</b>.');return}S.saved.push(JSON.parse(JSON.stringify(s)));save();ui();say('Saved')});
 on('#nw','onclick',()=>{S.cur=newD();save();ui()});
 R.querySelectorAll('[data-ld]').forEach(b=>b.onclick=()=>{S.cur=JSON.parse(JSON.stringify(S.saved[+b.dataset.ld]));save();tab='design';ui()});
 R.querySelectorAll('[data-dl]').forEach(b=>b.onclick=()=>{S.saved.splice(+b.dataset.dl,1);save();ui()});
 let drag=false;const mv=e=>{if(!drag)return;const r=cv.getBoundingClientRect();let fx=(e.clientX-r.left)/r.width,fy=(e.clientY-r.top)/r.height;if(!aop(s.product)){const b=pbox(s.product);fx=(fx-b[0])/b[2];fy=(fy-b[1])/b[3]}fx=Math.max(0,Math.min(1,fx));fy=Math.max(0,Math.min(1,fy));
  if(s.sel==='img'){s.imgPos[sd].x=fx;s.imgPos[sd].y=fy}else if(s.sel==='text'){s.textY[sd]=fy}else{const a=s.stickers[sd];if(a.length){a[a.length-1].x=fx;a[a.length-1].y=fy}}draw()};
 cv.onpointerdown=e=>{drag=true;mv(e)};cv.onpointermove=mv;window.onpointerup=()=>{if(drag){drag=false;save()}}}
if(S.cur.upTile){const im=new Image();im.onload=()=>{upTile=im;draw()};im.src=S.cur.upTile}
window.FD={S,summary,exportPrint,renderArt,PRODUCTS};
ui();
})();
