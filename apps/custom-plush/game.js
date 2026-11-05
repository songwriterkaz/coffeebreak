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
// ===== Coffeebreak Custom Plush =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'cplDemo':'cplSave';
const PP_CLIENT_ID='AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-';const MARKUP=0.40;
const st=document.createElement('style');st.textContent=`
#cp{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#5a1a3a;background:#fff0f6;border-radius:16px}
#cp h1,#cp h3{color:#e75480;margin:6px 0}
#cp button{background:#ffe1ec;color:#5a1a3a;border:2px solid #f4a6c0;border-radius:14px;padding:7px 11px;font:14px Georgia;cursor:pointer;margin:2px}
#cp button.on,#cp button.primary{background:#e75480;color:#fff;font-weight:bold}#cp button.lock{opacity:.5}
#cp input,#cp textarea,#cp select{background:#fff;color:#5a1a3a;border:2px solid #f4a6c0;border-radius:10px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;width:100%;margin:2px 0}
#cp .wrap{display:flex;gap:14px;flex-wrap:wrap}#cp .ctl{flex:1 1 360px}#cp .pv{flex:1 1 520px;text-align:center}
#cp canvas.prev{width:100%;max-width:520px;border-radius:20px;border:3px solid #f4a6c0;background:#fff}
#cp .card{background:#fff;border:2px solid #ffd1dc;border-radius:16px;padding:10px 12px;margin:8px 0;text-align:left}
#cp .note{font-size:13px;color:#7a3a5a;line-height:1.45}
#cpMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e75480;color:#fff;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='cp';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='cpMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
// Suppliers: ONLY makers that produce single units and ship direct to the customer. Prices as published; no invented prices.
const SUP=[
 {id:'printify',name:'Printify (stuffed animal with printed mini-shirt)',url:'https://printify.com/custom-stuffed-animals/',base:13.21,cur:'USD',
  note:'Blank plush animal (bear, bunny, panda, lion, sheep, jaguar, elephant) with YOUR design printed on its little shirt. No minimum, printed and shipped straight to your customer, white-label. Base price "from $13.21" as published by Printify (USD, before shipping).',fully:false},
 {id:'vanapure',name:'Vanapure Custom Plush Lab (fully custom sewn)',url:'https://vanapure.com/custom-plush-lab/',base:null,cur:'USD',
  note:'Fully custom plush sewn from your design or drawing. MOQ 1, quote within 24 hours, ships worldwide with tracking straight to the customer. Each design is quoted individually.',fully:true}];
const O={animal:[['bear','Teddy bear'],['bunny','Bunny'],['cat','Kitty'],['pup','Puppy'],['panda','Panda'],['uni','Unicorn'],['ele','Elephant']],
 fur:[['#f7c6d9','Blush pink'],['#ffe9f2','Cream pink'],['#c9a0dc','Lilac'],['#fff8ee','Vanilla'],['#b98b6e','Mocha'],['#a8d8ea','Baby blue'],['#e75480','Hot pink'],['#ffffff','Snow white']],
 eyes:[['emb','Embroidered (safe for babies)'],['sleepy','Sleepy embroidered'],['heart','Heart eyes (embroidered)'],['button','Safety eyes (3+ only)']],
 outfit:[['none','No outfit'],['tee','Printed tee'],['bow','Satin bow'],['tutu','Tutu'],['hoodie','Hoodie'],['crown','Crown & cape']],
 size:[['s','Small ~20 cm'],['m','Medium ~30 cm'],['l','Large ~45 cm']]};
const LBL={animal:'Base animal',fur:'Fur colour',eyes:'Eyes',outfit:'Outfit',size:'Size'};
const DEMO_OK={animal:['bear','bunny'],outfit:['none','tee']};
let S;try{S=JSON.parse(localStorage[SK]||'')}catch(e){}
S=S||{d:{animal:'bear',fur:'#f7c6d9',eyes:'emb',outfit:'bow',size:'m',accent:'#e75480',emb:'',sup:'printify',draw:'',name:'',email:'',phone:'',addr:'',notes:''},saved:[]};
const d=()=>S.d;function save(){try{localStorage[SK]=JSON.stringify(S)}catch(e){say('Drawing too big to save – try a smaller image')}}
const nm=(k,v)=>(O[k].find(o=>o[0]===v)||[v,v])[1];const sup=()=>SUP.find(x=>x.id===d().sup)||SUP[0];
function price(){const s=sup();return s.base==null?null:Math.round(s.base*(1+MARKUP)*100)/100}
function priceTxt(){const p=price();return p==null?'Price on request':(sup().cur+' $'+p.toFixed(2)+' + shipping')}
let drawImg=null;function loadDraw(){drawImg=null;if(d().draw){const i=new Image();i.onload=()=>{drawImg=i;paint()};i.src=d().draw}}
function plush(g,W,H){const s=d();g.save();g.fillStyle='#fff6fa';g.fillRect(0,0,W,H);g.scale(W/520,H/520);
 g.fillStyle='#ffd1dc';for(let i=0;i<14;i++){g.font='20px serif';g.fillText('♥',(i*97)%500+5,(i*61)%500+20)}
 const f=s.fur,sc={s:.8,m:.92,l:1.04}[s.size];g.translate(260,290);g.scale(sc,sc);
 const ear=(x,y,rx,ry,r)=>{g.fillStyle=f;g.beginPath();g.ellipse(x,y,rx,ry,r,0,7);g.fill();g.fillStyle='#ffb3c9';g.beginPath();g.ellipse(x,y,rx*.55,ry*.55,r,0,7);g.fill()};
 const a=s.animal;
 if(a==='bunny')[-1,1].forEach(k=>ear(k*45,-235,26,70,k*.15));
 else if(a==='cat')[-1,1].forEach(k=>{g.fillStyle=f;g.beginPath();g.moveTo(k*95,-150);g.lineTo(k*80,-235);g.lineTo(k*30,-185);g.fill()});
 else if(a==='pup')[-1,1].forEach(k=>{g.fillStyle='#8a6a5a';g.beginPath();g.ellipse(k*100,-120,30,62,k*.3,0,7);g.fill()});
 else if(a==='ele')[-1,1].forEach(k=>ear(k*115,-110,55,70,0));
 else [-1,1].forEach(k=>{ear(k*80,-195,32,32,0);if(a==='panda'){g.fillStyle='#222';g.beginPath();g.arc(k*80,-195,32,0,7);g.fill()}});
 g.fillStyle=f;g.beginPath();g.ellipse(0,95,105,115,0,0,7);g.fill();
 [-1,1].forEach(k=>{g.beginPath();g.ellipse(k*105,75,30,52,k*-.5,0,7);g.fill();g.beginPath();g.ellipse(k*55,200,40,30,0,0,7);g.fill()});
 // outfit
 const ac=s.accent;g.fillStyle=ac;
 if(s.outfit==='tee'||s.outfit==='hoodie'){g.beginPath();g.ellipse(0,85,100,80,0,0,7);g.fill();if(s.outfit==='hoodie'){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(-45,100,90,40)}
  if(drawImg){g.save();g.beginPath();g.ellipse(0,80,58,48,0,0,7);g.clip();g.drawImage(drawImg,-58,32,116,96);g.restore()}}
 if(s.outfit==='tutu'){for(let i=-5;i<=5;i++){g.beginPath();g.ellipse(i*20,150,26,20,0,0,7);g.fill()}}
 if(s.outfit==='crown'){g.beginPath();g.moveTo(-110,20);g.lineTo(110,20);g.lineTo(150,200);g.lineTo(-150,200);g.globalAlpha=.85;g.fill();g.globalAlpha=1}
 // head
 g.fillStyle=f;g.beginPath();g.ellipse(0,-110,120,105,0,0,7);g.fill();
 if(a==='uni'){g.fillStyle='#ffd86a';g.beginPath();g.moveTo(-18,-200);g.lineTo(18,-200);g.lineTo(0,-280);g.fill();g.fillStyle='#c9a0dc';g.beginPath();g.ellipse(-70,-190,30,22,.5,0,7);g.fill()}
 if(a==='panda'){g.fillStyle='#222';[-1,1].forEach(k=>{g.beginPath();g.ellipse(k*42,-115,26,32,k*.4,0,7);g.fill()})}
 if(a==='ele'){g.fillStyle=f;g.beginPath();g.ellipse(0,-50,24,50,0,0,7);g.fill()}
 g.fillStyle='#fff3f7';g.beginPath();g.ellipse(0,-70,48,34,0,0,7);g.fill();
 const ey=s.eyes,eyc=a==='panda'?'#fff':'#3a1a2a';g.strokeStyle=eyc;g.fillStyle=ey==='heart'?'#e75480':eyc;g.lineWidth=5;
 [-1,1].forEach(k=>{const x=k*42,y=-118;if(ey==='sleepy'){g.beginPath();g.arc(x,y-4,13,.2,2.9);g.stroke()}else if(ey==='heart'){g.font='34px serif';g.textAlign='center';g.fillText('♥',x,y+12)}else{g.beginPath();g.arc(x,y,ey==='button'?15:11,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+4,y-4,4,0,7);g.fill();g.fillStyle=eyc}});
 g.fillStyle='#e75480';g.beginPath();g.ellipse(0,-82,12,8,0,0,7);g.fill();g.strokeStyle='#5a1a3a';g.lineWidth=3;g.beginPath();g.arc(-10,-70,10,.2,2.6);g.arc(10,-70,10,.5,2.9);g.stroke();
 g.fillStyle='rgba(255,120,160,.35)';[-1,1].forEach(k=>{g.beginPath();g.ellipse(k*75,-85,18,11,0,0,7);g.fill()});
 if(s.outfit==='bow'){g.fillStyle=ac;[-1,1].forEach(k=>{g.beginPath();g.moveTo(0,-15);g.lineTo(k*45,-40);g.lineTo(k*45,10);g.fill()});g.beginPath();g.arc(0,-15,12,0,7);g.fill()}
 if(s.outfit==='crown'){g.fillStyle='#ffd86a';g.beginPath();g.moveTo(-50,-195);g.lineTo(-50,-235);g.lineTo(-25,-212);g.lineTo(0,-245);g.lineTo(25,-212);g.lineTo(50,-235);g.lineTo(50,-195);g.fill()}
 if(s.emb){g.fillStyle='#fff';g.strokeStyle=ac;g.lineWidth=3;g.beginPath();g.roundRect(-70,165,140,34,14);g.fill();g.stroke();g.fillStyle=ac;g.font='italic bold 20px Georgia';g.textAlign='center';g.fillText(s.emb.slice(0,14),0,189)}
 g.restore();g.fillStyle='#e75480';g.font='bold 18px Georgia';g.textAlign='left';g.fillText('☕ Coffeebreak Custom Plush · '+nm('animal',s.animal)+' · '+nm('size',s.size),12*W/520,505*H/520)}
function paint(){const cv=document.getElementById('cpC');if(cv)plush(cv.getContext('2d'),520,520)}
function summary(id){const s=d(),p=sup();return [`COFFEEBREAK CUSTOM PLUSH ORDER${id?' (PayPal SANDBOX '+id+')':' REQUEST'}`,'TEST MODE','',
 ...Object.keys(LBL).map(k=>LBL[k]+': '+nm(k,s[k])),'Outfit/accent colour: '+s.accent,'Embroidered name: '+(s.emb||'-'),'Drawing uploaded: '+(s.draw?'yes (customer will attach the design PNG)':'no'),
 '','Supplier: '+p.name,'Supplier page: '+p.url,'Price: '+priceTxt()+(price()!=null?' (supplier base '+p.cur+' $'+p.base.toFixed(2)+' + 40% markup)':''),
 '','Customer: '+s.name,'Email: '+s.email,'Phone: '+s.phone,'Ship to: '+s.addr,'Notes: '+(s.notes||'-'),'',
 'ACTION: forward this order to the supplier for DROPSHIP. The supplier makes the plush and ships it DIRECT to the customer address above. Coffeebreak holds no stock.'].join('\n')}
function mail(id){const u='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Custom Plush order'+(id?' '+id:' request')+' – '+(d().name||'Coffeebreak'))+'&body='+encodeURIComponent(summary(id));window.__opened=u;window.open(u,'_blank')}
function sheet(){const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1200,800);
 const b=document.createElement('canvas');b.width=b.height=700;plush(b.getContext('2d'),700,700);g.drawImage(b,20,60);g.fillStyle='#e75480';g.font='bold 36px Georgia';g.fillText('Coffeebreak Custom Plush — Design',30,46);
 g.fillStyle='#5a1a3a';g.font='20px Georgia';summary().split('\n').slice(3,12).forEach((l,i)=>g.fillText(l.slice(0,40),740,110+i*36));g.font='italic 16px Georgia';g.fillText('Preview only. The maker confirms the final look.',740,470);return cv}
function exportPng(){if(D){window.demoEnd&&window.demoEnd('Saving the design preview PNG is in the full <b>Coffeebreak Custom Plush</b>.');return}const a=document.createElement('a');a.download='[REDACTED]-custom-plush-design.png';a.href=sheet().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Design PNG saved')}
const locked=(k,v)=>D&&DEMO_OK[k]&&!DEMO_OK[k].includes(v);
let ppDone=false;function loadPP(){const box=document.getElementById('ppBox');if(price()==null){box.innerHTML='<p class="note">This maker quotes each plush individually, so use “Email order request” and Karen will reply with a price and a PayPal payment request.</p>';return}
 if(D){box.innerHTML='<p class="note">PayPal checkout is in the full app.</p>';return}
 box.innerHTML='<div id="paypal-buttons"></div><p class="note" id="ppStatus">PayPal TEST mode (sandbox) – no real money.</p>';
 const go=()=>{try{window.paypal.Buttons({createOrder:(x,a)=>a.order.create({purchase_units:[{amount:{value:price().toFixed(2),currency_code:'USD'},description:'Coffeebreak Custom Plush (TEST)'}]}),onApprove:(x,a)=>a.order.capture().then(o=>{document.getElementById('ppStatus').textContent='Sandbox payment complete: '+o.id;mail(o.id)}),onError:()=>{document.getElementById('ppStatus').textContent='PayPal error – use “Email order request”.'}}).render('#paypal-buttons')}catch(e){}};
 if(window.paypal){go();return}if(ppDone)return;ppDone=true;const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PP_CLIENT_ID)+'&currency=USD';s.onload=go;s.onerror=()=>{ppDone=false;const t=document.getElementById('ppStatus');if(t)t.textContent='PayPal could not load (offline?) – use “Email order request”.'};document.head.appendChild(s)}
function draw(){const s=d();
 R.innerHTML=`<h1>🧸 Coffeebreak Custom Plush</h1><p class="note">Design a real, made-to-order plushie. It’s made by our partner maker and shipped straight to you.</p><div class="wrap"><div class="ctl">${Object.keys(O).map(k=>`<div class="card"><h3>${LBL[k]}</h3>${O[k].map(o=>k==='fur'?`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''}" title="${o[1]}" style="background:${o[0]};width:32px;height:32px;border-radius:50%;padding:0"></button>`:`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''} ${locked(k,o[0])?'lock':''}">${esc(o[1])}${locked(k,o[0])?' 🔒':''}</button>`).join('')}</div>`).join('')}
 <div class="card"><h3>Outfit colour</h3><input type="color" id="f_accent" value="${s.accent}" style="height:40px"></div>
 <div class="card"><h3>Embroidered name</h3><input id="f_emb" maxlength="14" placeholder="e.g. Dakota" value="${esc(s.emb)}"></div>
 <div class="card"><h3>Upload a drawing</h3><input type="file" id="f_draw" accept="image/*"><p class="note">Shows on the plush’s tee or hoodie. Printify prints it on the shirt. Vanapure can sew the whole plush from a drawing.</p>${s.draw?'<button id="clrDraw">Remove drawing</button>':''}</div>
 <div class="card" style="font-size:12px"><b>Safety:</b> plush for babies and toddlers (0–36 months) must meet Australia’s mandatory small-parts standard. Choose embroidered eyes for little ones. Safety eyes are for ages 3+.</div></div>
 <div class="pv"><canvas id="cpC" class="prev" width="520" height="520"></canvas><div><button class="primary" id="cpPng">🖼️ Design preview PNG</button><button id="cpSave">💾 Save design</button></div>
 <div class="card"><h3>Choose the maker (dropship)</h3>${SUP.map(x=>`<label style="display:block;margin:6px 0"><input type="radio" name="sup" value="${x.id}" ${s.sup===x.id?'checked':''} style="width:auto"> <b>${esc(x.name)}</b> — ${x.base==null?'Price on request':x.cur+' $'+(Math.round(x.base*(1+MARKUP)*100)/100).toFixed(2)+' + shipping'}<br><span class="note">${esc(x.note)} <a href="${x.url}" target="_blank" rel="noopener">Supplier page</a></span></label>`).join('')}
 <h3 style="margin-top:10px">Your price: <span id="cpPrice">${priceTxt()}</span></h3></div>
 <div class="card"><h3>Order</h3><input id="f_name" placeholder="Your name" value="${esc(s.name)}"><input id="f_email" placeholder="Email" value="${esc(s.email)}"><input id="f_phone" placeholder="Phone" value="${esc(s.phone)}"><textarea id="f_addr" placeholder="Delivery address">${esc(s.addr)}</textarea><textarea id="f_notes" placeholder="Notes for the maker">${esc(s.notes)}</textarea>
 <button class="primary" id="cpOrder">✉️ Email order request</button><div id="ppBox"></div>
 <p class="note"><b>How it works, honestly:</b> Coffeebreak doesn’t keep stock. Your order goes to Karen, who forwards it to the maker you chose. They make your plush and post it straight to you. Prices are the maker’s published price plus Coffeebreak’s 40% markup. Shipping is extra. Fully custom plush is quoted individually. Payments are in PayPal TEST mode for now.</p></div>
 ${S.saved.length?`<div class="card"><h3>Saved designs</h3>${S.saved.map((x,i)=>`<button data-load="${i}">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
 paint();loadPP();
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(locked(k,v)){window.demoEnd&&window.demoEnd('All 7 animals and every outfit are in the full <b>Coffeebreak Custom Plush</b>.');return}s[k]=v;save();draw()});
 R.querySelectorAll('[name=sup]').forEach(r=>r.onchange=()=>{s.sup=r.value;save();draw()});
 ['name','email','phone','addr','notes'].forEach(f=>{const el=document.getElementById('f_'+f);el.oninput=()=>{s[f]=el.value;save()}});
 document.getElementById('f_emb').oninput=e=>{s.emb=e.target.value;save();paint()};document.getElementById('f_accent').oninput=e=>{s.accent=e.target.value;save();paint()};
 document.getElementById('f_draw').onchange=e=>{const fl=e.target.files[0];if(!fl)return;const rd=new FileReader();rd.onload=()=>{const i=new Image();i.onload=()=>{const cv=document.createElement('canvas');const k=Math.min(1,400/Math.max(i.width,i.height));cv.width=i.width*k;cv.height=i.height*k;cv.getContext('2d').drawImage(i,0,0,cv.width,cv.height);s.draw=cv.toDataURL('image/png');if(s.outfit!=='tee'&&s.outfit!=='hoodie')s.outfit='tee';save();draw();loadDraw()};i.src=rd.result};rd.readAsDataURL(fl)};
 const cd=document.getElementById('clrDraw');if(cd)cd.onclick=()=>{s.draw='';save();loadDraw();draw()};
 document.getElementById('cpPng').onclick=exportPng;
 document.getElementById('cpSave').onclick=()=>{if(D&&S.saved.length>=1){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Coffeebreak Custom Plush</b>.');return}S.saved.unshift({label:nm('animal',s.animal)+(s.emb?' “'+s.emb+'”':''),d:JSON.parse(JSON.stringify(s))});save();say('Design saved');draw()};
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.d=JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d));save();loadDraw();draw()});
 document.getElementById('cpOrder').onclick=()=>{if(!s.name||!s.email||!s.addr){say('Add your name, email and delivery address');return}mail();say('Opening your email app…')}}
window.CP={get S(){return S},draw,summary,price,priceTxt,sheet};
save();loadDraw();draw();
})();
function update(){}function draw(){}
