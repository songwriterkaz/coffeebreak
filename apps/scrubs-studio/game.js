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
// ===== Coffeebreak Scrubs Studio =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'scrubsDemo':'scrubsSave';
const st=document.createElement('style');st.textContent=`
#sc{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#sc h1,#sc h2,#sc h3{color:#e8a0b0;margin:6px 0 8px}
#sc .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
#sc button{background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:10px;padding:7px 11px;font:14px Georgia;cursor:pointer}
#sc button.on,#sc button.primary{background:#e8a0b0;color:#1a0a10;font-weight:bold}
#sc .lock{opacity:.55}
#sc input,#sc select{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;max-width:100%}
#sc label{display:block;margin:8px 0 3px;color:#d9b8c0;font-size:13px}
#sc .wrap{display:flex;gap:14px;flex-wrap:wrap}
#sc .ctl{flex:1 1 360px;min-width:300px}
#sc .pv{flex:1 1 560px;text-align:center}
#sc canvas.prev{width:100%;max-width:640px;background:#f6efe9;border-radius:14px;border:2px solid #e8a0b0}
#sc .opts{display:flex;flex-wrap:wrap;gap:5px}
#sc .sw{width:28px;height:28px;border-radius:50%;border:2px solid #555;cursor:pointer;padding:0}
#sc .sw.on{border:3px solid #ffcf6a}
#sc .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:14px;padding:12px;margin:8px 0}
#sc .note{font-size:13px;color:#d9b8c0;line-height:1.45}
#sc .ni{background:#16303a;border-left:3px solid #7ec8e3;padding:8px 10px;border-radius:8px;font-size:13px;margin-top:8px}
#sc table{border-collapse:collapse;font-size:13px;width:100%}#sc td,#sc th{border-bottom:1px solid #5a2a3a;padding:5px}#sc th{color:#ffcf6a}
#sc textarea{width:100%;height:170px;background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;font:13px monospace}
#scMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e8a0b0;color:#1a0a10;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='sc';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='scMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
const TOPS=[['vneck','Classic V-neck'],['mockwrap','Mock wrap'],['round','Round neck'],['mandarin','Mandarin collar'],['jogtop','Jogger-set top (zip)'],['tunic','Long tunic']];
const PANTS=[['straight','Straight leg'],['jogger','Jogger (cuffed)'],['flare','Flare / bootcut'],['cargo','Cargo (6 pockets)'],['skinny','Slim / tapered'],['wide','Wide leg']];
const COLS=[['Navy','#1f2d54'],['Ceil blue','#8db3d9'],['Royal','#2f55b8'],['Hunter green','#2f5e3e'],['Teal','#178a8a'],['Seafoam','#9fd8c8'],['Wine','#6d1f33'],['Pink','#f2a7bf'],['Lavender','#b9a6dd'],['Black','#1b1b1f'],['Pewter','#7a7f86'],['White','#f4f4f2'],['Caribbean','#2bb0c9'],['Coffee','#6b4a35']];
const PRINTS=[['none','Solid colour'],['hearts','Hearts'],['florals','Florals'],['cups','Cartoon coffee cups'],['steth','Stethoscopes'],['paws','Paw prints (vets)'],['stars','Stars & moons'],['dots','Polka dots'],['upload','My uploaded pattern']];
const DEMO_PRINTS=['none','hearts','cups','paws'];
const POCK=[['chest','Chest pocket'],['patch','2 patch pockets'],['cargo','Side cargo pocket'],['pen','Pen slot'],['badge','Badge loop']];
const SLV=[['short','Short sleeve'],['three','3/4 sleeve'],['long','Long sleeve']];
const SUPP=[['printed','Printed — Printibly (Australia)'],['embroidered','Embroidered — Medshop (Australia)'],['aop','All-over print — Merchize (overseas)']];
const SIZES=['XXS','XS','S','M','L','XL','2XL','3XL','4XL','5XL'];
const CHART=[[76,62,84],[81,66,89],[86,71,94],[91,76,99],[99,84,107],[107,91,114],[117,102,124],[127,112,135],[137,122,145],[147,132,155]];
function blank(){return {top:'vneck',pants:'jogger',col:'#1f2d54',pantCol:'',print:'hearts',pcol:'#f2a7bf',pscale:1,printOn:'top',pockets:['chest','patch','pen'],sleeve:'short',name:'',title:'',dept:'',thread:'#ffffff',font:'Georgia',sizeTop:'M',sizePants:'M',length:'Regular',qty:1,sensory:true,upload:'',supplier:'printed'}}
let S={cur:blank(),saved:[],cfg:{url:'',email:''}};
try{const o=JSON.parse(localStorage.getItem(SK)||'{}');if(o.saved)S.saved=o.saved;if(o.cfg)S.cfg=o.cfg;if(o.cur)S.cur=Object.assign(blank(),o.cur)}catch(e){}
function save(){try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){say('Storage full — delete an old design.')}G.score=S.saved.length}
let tab='design';const d=()=>S.cur;
// ---------- pattern tiles ----------
const tileCache={};let upImg=null;
function tile(kind,bg,fg,sc){const k=[kind,bg,fg,sc,kind==='upload'?(d().upload||'').length:0].join();if(tileCache[k])return tileCache[k];
 const n=Math.round(64*sc),t=document.createElement('canvas');t.width=t.height=n;const g=t.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,n,n);g.save();g.scale(sc,sc);g.fillStyle=fg;g.strokeStyle=fg;g.lineWidth=3;g.lineCap='round';
 const heart=(x,y,s)=>{g.beginPath();g.moveTo(x,y+s*.3);g.bezierCurveTo(x,y-s*.2,x-s,y-s*.2,x-s,y+s*.25);g.bezierCurveTo(x-s,y+s*.7,x,y+s,x,y+s*1.2);g.bezierCurveTo(x,y+s,x+s,y+s*.7,x+s,y+s*.25);g.bezierCurveTo(x+s,y-s*.2,x,y-s*.2,x,y+s*.3);g.fill()};
 const flower=(x,y,r,c2)=>{for(let i=0;i<5;i++){const a=i*1.2566;g.beginPath();g.ellipse(x+Math.cos(a)*r,y+Math.sin(a)*r,r*.8,r*.55,a,0,7);g.fill()}g.fillStyle=c2;g.beginPath();g.arc(x,y,r*.5,0,7);g.fill();g.fillStyle=fg};
 const paw=(x,y,s)=>{g.beginPath();g.ellipse(x,y+s*.5,s*.6,s*.5,0,0,7);g.fill();[[-.7,-.2],[-.25,-.6],[.25,-.6],[.7,-.2]].forEach(p=>{g.beginPath();g.ellipse(x+p[0]*s,y+p[1]*s,s*.22,s*.28,0,0,7);g.fill()})};
 const cup=(x,y)=>{g.beginPath();g.roundRect(x-9,y-6,18,16,4);g.fill();g.beginPath();g.arc(x+10,y+2,5,-1.4,1.4);g.stroke();g.fillStyle=bg;g.beginPath();g.arc(x-3,y+1,1.6,0,7);g.arc(x+3,y+1,1.6,0,7);g.fill();g.strokeStyle=bg;g.lineWidth=1.5;g.beginPath();g.arc(x,y+3,3,.3,2.8);g.stroke();g.strokeStyle=fg;g.lineWidth=2;g.beginPath();g.moveTo(x-3,y-9);g.quadraticCurveTo(x-6,y-13,x-3,y-17);g.moveTo(x+3,y-9);g.quadraticCurveTo(x,y-13,x+3,y-17);g.stroke();g.fillStyle=fg;g.lineWidth=3};
 const steth=(x,y)=>{g.beginPath();g.moveTo(x-8,y-12);g.quadraticCurveTo(x-10,y+6,x,y+6);g.quadraticCurveTo(x+10,y+6,x+8,y-12);g.stroke();g.beginPath();g.moveTo(x,y+6);g.quadraticCurveTo(x+2,y+14,x+10,y+14);g.stroke();g.beginPath();g.arc(x+13,y+14,4,0,7);g.fill()};
 if(kind==='hearts'){heart(16,12,7);heart(48,40,7)}
 else if(kind==='florals'){flower(16,16,6,'#ffe27a');g.fillStyle=fg;flower(48,46,6,'#ffffff');g.globalAlpha=.6;g.beginPath();g.ellipse(44,14,6,3,.6,0,7);g.ellipse(18,48,6,3,-.6,0,7);g.fill();g.globalAlpha=1}
 else if(kind==='cups'){cup(18,20);cup(48,50)}
 else if(kind==='steth'){steth(18,18);heart(48,44,4)}
 else if(kind==='paws'){paw(16,18,7);paw(48,46,7)}
 else if(kind==='stars'){const star=(x,y,r)=>{g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.fill()};star(16,16,8);g.beginPath();g.arc(48,46,8,0,7);g.fill();g.fillStyle=bg;g.beginPath();g.arc(52,43,7,0,7);g.fill()}
 else if(kind==='dots'){[[16,16],[48,48],[48,16],[16,48]].forEach((p,i)=>{if(i<2){g.beginPath();g.arc(p[0],p[1],5,0,7);g.fill()}})}
 else if(kind==='upload'&&upImg&&upImg.complete){g.restore();g.drawImage(upImg,0,0,n,n);return tileCache[k]=t}
 g.restore();return tileCache[k]=t}
function setUpImg(){if(d().upload){upImg=new Image();upImg.onload=()=>render();upImg.src=d().upload}else upImg=null}
// ---------- garment drawing ----------
function fillFor(g,part){const s=d(),base=part==='pants'?(s.pantCol||s.col):s.col;
 const on=s.printOn==='both'||s.printOn===part;if(s.print==='none'||!on)return base;return g.createPattern(tile(s.print,base,s.pcol,s.pscale),'repeat')}
function drawTop(g,cx,cy,back){const s=d();const sl={short:58,three:118,long:168}[s.sleeve];const L=s.top==='tunic'?250:205;
 g.save();g.translate(cx,cy);g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle='#2a1a20';g.fillStyle=fillFor(g,'top');
 // sleeves
 for(const sg of[-1,1]){g.beginPath();g.moveTo(sg*70,0);g.lineTo(sg*(70+sl*.55),sl*.85);g.lineTo(sg*(70+sl*.55-34),sl*.85+18);g.lineTo(sg*68,62);g.closePath();g.fill();g.stroke();
  if(s.top==='jogtop'||s.sleeve==='long'){g.save();g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.moveTo(sg*(70+sl*.55),sl*.85);g.lineTo(sg*(70+sl*.55-34),sl*.85+18);g.lineTo(sg*(70+sl*.55-40),sl*.85+6);g.lineTo(sg*(70+sl*.55-6),sl*.85-10);g.fill();g.restore()}}
 // body
 g.beginPath();g.moveTo(-70,0);g.lineTo(-30,-12);g.lineTo(30,-12);g.lineTo(70,0);g.lineTo(76,L);g.lineTo(-76,L);g.closePath();g.fill();g.stroke();
 // neck
 g.fillStyle='#f6efe9';g.beginPath();
 if(back){g.ellipse(0,-10,30,9,0,0,Math.PI)}else if(s.top==='vneck'||s.top==='tunic'){g.moveTo(-30,-12);g.lineTo(0,46);g.lineTo(30,-12)}else if(s.top==='mockwrap'){g.moveTo(-30,-12);g.lineTo(18,64);g.lineTo(30,-12)}else if(s.top==='mandarin'){g.ellipse(0,-12,26,8,0,0,Math.PI)}else if(s.top==='jogtop'){g.ellipse(0,-12,26,8,0,0,Math.PI)}else{g.ellipse(0,-10,30,18,0,0,Math.PI)}
 g.closePath();g.fill();g.stroke();
 if(!back&&s.top==='mockwrap'){g.beginPath();g.moveTo(30,-12);g.lineTo(-76,150);g.stroke()}
 if(!back&&s.top==='mandarin'){g.strokeRect(-26,-18,52,8)}
 if(!back&&s.top==='jogtop'){g.setLineDash([4,3]);g.beginPath();g.moveTo(0,-4);g.lineTo(0,L);g.stroke();g.setLineDash([]);g.fillStyle='#ccc';g.fillRect(-3,-4,6,10)}
 if(!back){const P=s.pockets;g.setLineDash([5,3]);g.lineWidth=1.6;
  if(P.includes('chest')){g.strokeRect(-56,58,32,30);if(P.includes('pen')){g.beginPath();g.moveTo(-46,58);g.lineTo(-46,88);g.stroke()}}
  if(P.includes('patch')){g.strokeRect(-62,L-82,44,48);g.strokeRect(18,L-82,44,48)}
  if(P.includes('cargo')){g.strokeRect(-80,30,14,40)}
  g.setLineDash([]);if(P.includes('badge')){g.lineWidth=2;g.beginPath();g.arc(45,40,6,0,7);g.stroke()}
  // embroidery
  if(s.name||s.title||s.dept){g.fillStyle=s.thread;g.textAlign='center';g.font='bold 15px '+s.font;g.fillText(s.name.slice(0,18),40,74);g.font='12px '+s.font;g.fillText(s.title.slice(0,22),40,90);g.fillText(s.dept.slice(0,22),40,104)}}
 else{g.lineWidth=1.5;g.beginPath();g.moveTo(-40,40);g.quadraticCurveTo(0,52,40,40);g.stroke();if(s.sensory){g.fillStyle='#2a1a20';g.font='10px Georgia';g.textAlign='center';g.fillText('tagless · printed label',0,18)}}
 g.restore()}
function drawPants(g,cx,cy,back){const s=d();g.save();g.translate(cx,cy);g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle='#2a1a20';g.fillStyle=fillFor(g,'pants');
 const L=250,hw=70,bot={straight:34,jogger:26,flare:46,cargo:34,skinny:24,wide:52}[s.pants];
 for(const sg of[-1,1]){g.beginPath();g.moveTo(0,22);g.lineTo(sg*hw,0);g.lineTo(sg*(hw+(bot>40?bot-36:-2)),L);g.lineTo(sg*(hw+(bot>40?bot-36:-2)-bot*2),L);g.lineTo(sg*4,40);g.closePath();g.fill();g.stroke();
  if(s.pants==='jogger'){g.save();g.fillStyle='rgba(0,0,0,.2)';g.fillRect(sg>0?hw-2-bot*2:-(hw-2),L-14,bot*2,14);g.restore()}
  if(!back&&(s.pants==='cargo')){g.setLineDash([5,3]);g.strokeRect(sg>0?hw-34:-hw+8,100,26,34);g.setLineDash([])}}
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-hw,0,hw*2,14);g.beginPath();g.moveTo(-hw,0);g.lineTo(hw,0);g.stroke();
 if(!back){g.strokeStyle='#eee';g.lineWidth=1.5;g.beginPath();g.moveTo(-6,14);g.lineTo(-10,30);g.moveTo(6,14);g.lineTo(10,30);g.stroke()}
 else{g.strokeStyle='#2a1a20';g.setLineDash([5,3]);g.lineWidth=1.5;g.strokeRect(-55,30,36,32);g.strokeRect(19,30,36,32);g.setLineDash([])}
 g.restore()}
function drawOutfit(g,ox,back,lab){g.fillStyle='#4a3038';g.font='bold 18px Georgia';g.textAlign='center';g.fillText(lab,ox,24);drawTop(g,ox,50,back);drawPants(g,ox,d().top==='tunic'?320:280,back)}
function render(){const cv=document.getElementById('scPrev');if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.fillStyle='#f6efe9';g.fillRect(0,0,cv.width,cv.height);drawOutfit(g,170,false,'Front');drawOutfit(g,470,true,'Back');
 if(d().sensory){g.fillStyle='#16707a';g.font='bold 13px Georgia';g.textAlign='center';g.fillText('🧩 No Inside Out: tagless · flat seams · soft fabric',320,cv.height-10)}}
// ---------- UI ----------
function opt(list,key,cur,lockFn){return '<div class="opts">'+list.map(([k,l])=>{const lk=lockFn&&lockFn(k);return `<button data-k="${key}" data-v="${k}" class="${cur===k?'on':''} ${lk?'lock':''}">${esc(l)}${lk?' 🔒':''}</button>`}).join('')+'</div>'}
function swatches(key,cur){return '<div class="opts">'+COLS.map(([n,h])=>`<button class="sw ${cur===h?'on':''}" title="${n}" data-k="${key}" data-v="${h}" style="background:${h}"></button>`).join('')+'</div>'}
function summary(){const s=d(),f=(l,k)=>(l.find(x=>x[0]===k)||[k,k])[1],cn=h=>(COLS.find(x=>x[1]===h)||['custom '+h])[0];
 return ['COFFEEBREAK SCRUBS STUDIO — ORDER REQUEST','Top: '+f(TOPS,s.top)+', '+f(SLV,s.sleeve),'Pants: '+f(PANTS,s.pants)+' ('+s.length+' length)','Colour: '+cn(s.col)+(s.pantCol?' / pants '+cn(s.pantCol):''),'Print: '+f(PRINTS,s.print)+(s.print!=='none'?' in '+cn(s.pcol)+' on '+s.printOn+', scale '+s.pscale:''),'Pockets: '+(s.pockets.map(p=>f(POCK,p)).join(', ')||'none'),'Embroidery: '+([s.name,s.title,s.dept].filter(Boolean).join(' | ')||'none')+(s.name?' (thread '+s.thread+', '+s.font+')':''),'Size: top '+s.sizeTop+', pants '+s.sizePants,'Quantity: '+s.qty+' set(s)','Maker: '+f(SUPP,s.supplier),'No Inside Out sensory-friendly: '+(s.sensory?'YES — tagless, flat seams, soft fabric':'no'),'Design sheet PNG: attach the exported file'].join('\n')}
function draw(){const s=d();let h=`<h1>🩺 Coffeebreak Scrubs Studio</h1><div class="tabs">${[['design','Design'],['size','Size chart'],['saved','My designs ('+S.saved.length+')'],['order','Order these scrubs']].map(([k,l])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`;
 if(tab==='design'){h+=`<div class="wrap"><div class="ctl">
 <div class="card"><h3>Top style</h3>${opt(TOPS,'top',s.top)}<label>Sleeve length</label>${opt(SLV,'sleeve',s.sleeve)}</div>
 <div class="card"><h3>Pants style</h3>${opt(PANTS,'pants',s.pants)}<label>Leg length</label><select id="scLen">${['Petite','Regular','Tall'].map(x=>`<option ${s.length===x?'selected':''}>${x}</option>`).join('')}</select></div>
 <div class="card"><h3>Colour</h3>${swatches('col',s.col)}<label>Pants colour (blank = match)</label><div class="opts"><button data-k="pantCol" data-v="" class="${s.pantCol?'':'on'}">Match top</button></div>${swatches('pantCol',s.pantCol)}</div>
 <div class="card"><h3>All-over print</h3>${opt(PRINTS,'print',s.print,k=>D&&!DEMO_PRINTS.includes(k))}
 <label>Print colour</label>${swatches('pcol',s.pcol)}<label>Print on</label>${opt([['top','Top only'],['pants','Pants only'],['both','Both']],'printOn',s.printOn)}
 <label>Pattern size</label><input type="range" id="scScale" min="0.6" max="2" step="0.1" value="${s.pscale}">
 <label>Upload your own pattern tile (PNG/JPG, stays on this device)</label><input type="file" id="scUp" accept="image/*" ${D?'disabled':''}>${D?'<div class="note">Uploads are in the full version.</div>':''}</div>
 <div class="card"><h3>Pockets</h3><div class="opts">${POCK.map(([k,l])=>`<button data-pk="${k}" class="${s.pockets.includes(k)?'on':''}">${l}</button>`).join('')}</div></div>
 <div class="card"><h3>Embroidery</h3><label>Name</label><input id="scName" maxlength="18" value="${esc(s.name)}" placeholder="e.g. Karen O."><label>Title</label><input id="scTitle" maxlength="22" value="${esc(s.title)}" placeholder="e.g. RN"><label>Department</label><input id="scDept" maxlength="22" value="${esc(s.dept)}" placeholder="e.g. Paediatrics">
 <label>Thread</label><div class="opts">${['#ffffff','#1b1b1f','#ffcf6a','#f2a7bf','#8db3d9','#c0c0c0'].map(c2=>`<button class="sw ${s.thread===c2?'on':''}" data-k="thread" data-v="${c2}" style="background:${c2}"></button>`).join('')}</div>
 <label>Font</label><select id="scFont">${['Georgia','Arial','Courier New','Brush Script MT','Trebuchet MS'].map(f=>`<option ${s.font===f?'selected':''}>${f}</option>`).join('')}</select></div>
 <div class="card"><h3>🧩 No Inside Out</h3><label><input type="checkbox" id="scSens" ${s.sensory?'checked':''}> Sensory-friendly: tagless (printed label), flat seams, soft brushed fabric</label><div class="ni">Coffeebreak's No Inside Out touch, for people who feel every seam and tag. Your order notes ask the maker for these options; final availability depends on the supplier's garment.</div></div>
 </div><div class="pv"><canvas id="scPrev" class="prev" width="640" height="${s.top==='tunic'?600:560}"></canvas>
 <div class="opts" style="justify-content:center;margin-top:8px"><button class="primary" id="scSave">💾 Save design</button><button id="scPng">🖨️ Export design sheet PNG</button><button id="scNew">✨ New design</button><button class="primary" data-tab="order">🛒 Order these scrubs</button></div></div></div>`}
 else if(tab==='size'){h+=`<div class="card"><h3>Size chart (cm, body measurements)</h3><table><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hips</th></tr>${SIZES.map((z,i)=>`<tr><td>${z}</td><td>${CHART[i][0]}</td><td>${CHART[i][1]}</td><td>${CHART[i][2]}</td></tr>`).join('')}</table>
 <p class="note">Leg inseam: Petite 71 cm · Regular 79 cm · Tall 86 cm. This is a general guide; always check the chosen supplier's own size chart before ordering.</p>
 <label>Top size</label><select id="scSzT">${SIZES.map(z=>`<option ${s.sizeTop===z?'selected':''}>${z}</option>`).join('')}</select><label>Pants size</label><select id="scSzP">${SIZES.map(z=>`<option ${s.sizePants===z?'selected':''}>${z}</option>`).join('')}</select></div>`}
 else if(tab==='saved'){h+=S.saved.length?S.saved.map((x,i)=>`<div class="card"><b>${esc(x.label)}</b> <span class="note">${esc(x.when)}</span><br><button data-load="${i}">Open</button> <button data-del="${i}">Delete</button></div>`).join(''):'<p class="note">No saved designs yet. Saved designs stay on this device.</p>'}
 else{h+=`<div class="card"><h3>🛒 Order these scrubs</h3><label>Top size</label><select id="scSzT">${SIZES.map(z=>`<option ${s.sizeTop===z?'selected':''}>${z}</option>`).join('')}</select> <label>Pants size</label><select id="scSzP">${SIZES.map(z=>`<option ${s.sizePants===z?'selected':''}>${z}</option>`).join('')}</select>
 <label>How should they be made?</label>${opt(SUPP,'supplier',s.supplier)}<label>Quantity (sets)</label><input type="number" id="scQty" min="1" max="99" value="${s.qty}"><h3>Order summary</h3><textarea id="scSum" readonly>${esc(summary())}</textarea>
 <div class="opts" style="margin-top:8px"><button class="primary" id="scOrder">Send order request</button><button id="scCopy">Copy summary</button><button id="scPng2">Download design sheet PNG</button></div>
 <div class="ni">Honest note: this app doesn't take payment or make scrubs itself. Orders go through the Coffeebreak scrubs store once it's set up. Until then, “Send order request” emails your summary to Coffeebreak, and you attach the design sheet PNG.</div><div class="ni">💌 Karen will reply with a price and a PayPal payment request. Nothing is charged until you pay that request.</div></div>
 <div class="card"><h3>Store settings (for Coffeebreak)</h3><label>Order link (Shopify/Etsy/PayPal page; ?order= is added)</label><input id="scUrl" style="width:100%" value="${esc(S.cfg.url)}" placeholder="https://..."><label>Or order email</label><input id="scMail" style="width:100%" value="${esc(S.cfg.email)}" placeholder="songwriterkaz@gmail.com"><button id="scCfg" style="margin-top:6px">Save settings</button></div>`}
 R.innerHTML=h;bind();render()}
function bind(){const s=d();const on=(id,ev,fn)=>{const e=document.getElementById(id);if(e)e[ev]=fn};
 R.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;draw()});
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(k==='print'&&D&&!DEMO_PRINTS.includes(v)){window.demoEnd&&window.demoEnd('All 9 prints, uploads and the design sheet are in the full <b>Coffeebreak Scrubs Studio</b>.');return}if(k==='print'&&v==='upload'&&!s.upload){say('Upload a pattern image first.');return}s[k]=v;save();draw()});
 R.querySelectorAll('[data-pk]').forEach(b=>b.onclick=()=>{const k=b.dataset.pk,i=s.pockets.indexOf(k);i<0?s.pockets.push(k):s.pockets.splice(i,1);save();draw()});
 const tx=(id,k)=>on(id,'oninput',e=>{s[k]=e.target.value;save();render()});tx('scName','name');tx('scTitle','title');tx('scDept','dept');
 on('scFont','onchange',e=>{s.font=e.target.value;save();render()});on('scLen','onchange',e=>{s.length=e.target.value;save()});
 on('scScale','oninput',e=>{s.pscale=+e.target.value;save();render()});on('scSens','onchange',e=>{s.sensory=e.target.checked;save();render()});
 on('scSzT','onchange',e=>{s.sizeTop=e.target.value;save();upd()});on('scSzP','onchange',e=>{s.sizePants=e.target.value;save();upd()});on('scQty','oninput',e=>{s.qty=Math.max(1,Math.min(99,+e.target.value||1));save();upd()});
 on('scUp','onchange',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const t=document.createElement('canvas');t.width=t.height=128;t.getContext('2d').drawImage(im,0,0,128,128);s.upload=t.toDataURL('image/png');s.print='upload';save();setUpImg();draw();say('Pattern uploaded')};im.src=r.result};r.readAsDataURL(f)});
 on('scSave','onclick',()=>{if(D&&S.saved.length>=2){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Coffeebreak Scrubs Studio</b>.');return}const f=(l,k)=>(l.find(x=>x[0]===k)||[k,k])[1];S.saved.unshift({label:(s.name||'My scrubs')+' — '+f(TOPS,s.top)+' + '+f(PANTS,s.pants)+', '+f(PRINTS,s.print),when:new Date().toLocaleString(),d:JSON.parse(JSON.stringify(s))});save();say('Design saved on this device');draw()});
 on('scNew','onclick',()=>{S.cur=blank();save();setUpImg();draw()});
 on('scPng','onclick',exportSheet);on('scPng2','onclick',exportSheet);
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.cur=Object.assign(blank(),JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d)));save();setUpImg();tab='design';draw()});
 R.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.saved.splice(+b.dataset.del,1);save();draw()});
 on('scCfg','onclick',()=>{S.cfg.url=document.getElementById('scUrl').value.trim();S.cfg.email=document.getElementById('scMail').value.trim();save();say('Store settings saved')});
 on('scCopy','onclick',()=>{try{navigator.clipboard.writeText(summary());say('Copied')}catch(e){say('Select the text and copy')}});
 on('scOrder','onclick',()=>{const u=orderLink();window.lastOrderLink=u;try{window.open(u,'_blank')}catch(e){}say('Order request opened')});}
function upd(){const t=document.getElementById('scSum');if(t)t.value=summary()}
function orderLink(){const sm=summary();if(S.cfg.url){return S.cfg.url+(S.cfg.url.includes('?')?'&':'?')+'order='+encodeURIComponent(sm)}const em=S.cfg.email||'songwriterkaz@gmail.com';return 'mailto:'+em+'?subject='+encodeURIComponent('Scrubs order request — '+(d().name||'Coffeebreak Scrubs'))+'&body='+encodeURIComponent(sm)}
function sheetCanvas(){const W2=1600,H2=1100,cv=document.createElement('canvas');cv.width=W2;cv.height=H2;const g=cv.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,W2,H2);
 g.fillStyle='#6d1f33';g.font='bold 40px Georgia';g.fillText('Coffeebreak Scrubs Studio — Design Sheet',40,60);g.save();g.translate(30,90);g.scale(1.45,1.45);g.fillStyle='#f6efe9';g.fillRect(0,0,640,600);drawOutfit(g,170,false,'Front');drawOutfit(g,470,true,'Back');g.restore();
 const s=d();if(s.print!=='none'){g.fillStyle='#333';g.font='bold 20px Georgia';g.fillText('Print tile (repeat):',1010,110);const tl=tile(s.print,s.col,s.pcol,3);g.drawImage(tl,1010,125,192,192);g.strokeRect(1010,125,192,192)}
 g.fillStyle='#222';g.font='18px Georgia';let y=360;summary().split('\n').slice(1).forEach(l=>{y=(function(){const w=l.split(' ');let line='';for(const z of w){if(g.measureText(line+z).width>560&&line){g.fillText(line,1000,y);y+=26;line=''}line+=z+' '}g.fillText(line,1000,y);return y+30})()});
 g.fillStyle='#888';g.font='14px Georgia';g.fillText('Created '+new Date().toLocaleDateString()+' · coffeebreaks.itch.io · Original Coffeebreak patterns',40,H2-20);return cv}
function exportSheet(){if(D){window.demoEnd&&window.demoEnd('The print-ready design sheet is in the full <b>Coffeebreak Scrubs Studio</b>.');return}const cv=sheetCanvas();const a=document.createElement('a');a.download='coffeebreak-scrubs-design.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Design sheet saved')}
window.SC={get S(){return S},draw,summary,orderLink,sheetCanvas,setTab(t){tab=t;draw()}};
setUpImg();save();draw();
})();
function update(){}function draw(){}
