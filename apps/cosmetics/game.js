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
// ===== Coffeebreak Cosmetics =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'cosDemo':'cosSave';
const PP_CLIENT_ID='AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-';const MARKUP=0.40;
const st=document.createElement('style');st.textContent=`
#cp{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 150px;box-sizing:border-box;font-family:Georgia,serif;color:#5a1a3a;background:#fff0f6;border-radius:16px}
#cp h1,#cp h3{color:#e75480;margin:6px 0}
#cp button{background:#ffe1ec;color:#5a1a3a;border:2px solid #f4a6c0;border-radius:14px;padding:7px 11px;font:14px Georgia;cursor:pointer;margin:2px}
#cp button.on,#cp button.primary{background:#e75480;color:#fff;font-weight:bold}#cp button.lock{opacity:.5}
#cp input,#cp textarea,#cp select{background:#fff;color:#5a1a3a;border:2px solid #f4a6c0;border-radius:10px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;width:100%;margin:2px 0}
#cp .wrap{display:flex;gap:14px;flex-wrap:wrap}#cp .ctl{flex:1 1 360px}#cp .pv{flex:1 1 520px;text-align:center}
#cp canvas.prev{width:100%;max-width:520px;border-radius:20px;border:3px solid #f4a6c0;background:#fff}
#cp .card{background:#fff;border:2px solid #ffd1dc;border-radius:16px;padding:10px 12px;margin:8px 0;text-align:left}
#cp{background:linear-gradient(#fff0f6,#f6e6da)!important}#cp .note{font-size:13px;color:#7a3a5a;line-height:1.45}
#cpMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e75480;color:#fff;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='cp';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='cpMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
// Suppliers: ONLY existing finished products held in AUSTRALIA by AU businesses (they are the importer/maker, so Coffeebreak needs no AICIS registration:
// https://www.industrialchemicals.gov.au/business/getting-started-registration-importing-and-manufacturing/what-registration-and-who-must-register/making-products-sell-using-imported-or-local-ingredients ).
// No prices are published for resellers, so every price is "Price on request". Overseas makers are listed but disabled.
const SUP=[
 {id:'frank',name:'frank body (Australian coffee scrub brand): affiliate via impact.com',url:'https://www.frankbody.com/',prices:{},cur:'AUD',ok:true,aff:true,
  note:'Preferred. The original Australian coffee scrub brand. Affiliate program on impact.com (program 17575, reported 5–11% commission). frank body sells and ships to the customer itself, and Coffeebreak earns commission. No ABN requirement found for impact.com, so Karen confirms this when she signs up.'},
 {id:'cf',name:'Commission Factory (AU affiliate network): no ABN needed to join',url:'https://help.commissionfactory.com/how-to-apply-to-commission-factory-as-an-affiliate',prices:{},cur:'AUD',ok:true,aff:true,
  note:'Preferred. Australian affiliate network. You can join without an ABN, but 47% of commissions are withheld for the ATO unless you have an ABN or an exemption. A$5 card pre-authorisation, refunded. The brand ships the order, and Karen picks AU skincare brands inside the network.'},
 {id:'mumma',name:"Mumma's Beans Coffee + Skincare (AU-made): wholesale via Faire, dropship not offered",url:'https://www.mummasbeans.com.au/pages/faq',prices:{},cur:'AUD',ok:true,
  note:'Existing Australian-made coffee lip scrub, lip balm, body oil and face oil. They only wholesale to store owners through Faire and have no affiliate program, so ask them directly. Price on request.'},
 {id:'dsz',name:'Dropshipzone: needs ABN',url:'https://www.dropshipzone.com.au/',prices:{},cur:'AUD',ok:false,
  note:'Australian dropship marketplace. Its FAQ says: "To get started, you’ll need an active ABN or ACN." Not available until Karen has an ABN.'},
 {id:'olieve',name:'Olieve & Olie (VIC): wholesale account, needs ABN (check)',url:'https://wholesale.olieveandolie.com.au/coffee-scrub',prices:{},cur:'AUD',ok:false,
  note:'Wholesale-only portal for trade customers. Dropship is not offered. Disabled.'},
 {id:'supliful',name:'Supliful (USA): requires AICIS registration',url:'https://supliful.com/catalog/peppermint-coffee-scrub',prices:{},cur:'USD',ok:false,note:'Ships from overseas, so Coffeebreak would be the importer. Not available.'},
 {id:'blanka',name:'Blanka (USA): requires AICIS registration',url:'https://blankabrand.com/pages/dropship-beauty-products',prices:{},cur:'USD',ok:false,note:'Ships from overseas, so Coffeebreak would be the importer. Not available.'}];
const O={prod:[['scrub','Coffee body scrub'],['lipscrub','Coffee lip scrub'],['balm','Coffee lip balm'],['duo','Lip scrub + balm duo'],['bodyoil','Coffee body oil'],['faceoil','Coffee face oil'],['cream','Coffee Cream (body or face moisturiser)']],
 pack:[['#f7c6d9','Blush pink'],['#e75480','Hot pink'],['#fff8ee','Cream'],['#6f4e37','Coffee brown'],['#222222','Black'],['#d4af37','Gold']]};
const AVAIL={frank:['scrub','lipscrub','balm','bodyoil','faceoil','cream'],cf:['scrub','lipscrub','balm','duo','bodyoil','faceoil','cream'],mumma:['lipscrub','balm','duo','bodyoil','faceoil']};
const PNOTE={cream:'Coffee Cream is a cosmetic moisturiser that helps skin feel soft and hydrated. Real products: <a href="https://www.frankbody.com/au/products/firming-body-cream" target="_blank" rel="noopener">frank body Firming Body Cream</a> (caffeine and shea butter, A$54 on frankbody.com) or frank body’s Caffeinated Face Moisturiser (<a href="https://www.frankbody.com/au/shop/caffeine-coffee/" target="_blank" rel="noopener">caffeine/coffee range</a>). Bought on frank body’s own site through the affiliate link, so no ABN is needed. Not a medicine or ointment.'};const LBL={prod:'Product (existing supplier product)',pack:'Gift card colour'};
const DEMO_OK={prod:['scrub','balm']};
let S;try{S=JSON.parse(localStorage[SK]||'')}catch(e){}
S=S||{d:{prod:'scrub',shade:'#6f4e37',pack:'#f7c6d9',accent:'#e75480',emb:'',sup:'frank',draw:'',name:'',email:'',phone:'',addr:'',notes:''},saved:[]};
const d=()=>S.d;function save(){try{localStorage[SK]=JSON.stringify(S)}catch(e){}}
const nmx=0;const nm=(k,v)=>(O[k].find(o=>o[0]===v)||[v,v])[1];const sup=()=>SUP.find(x=>x.id===d().sup&&x.ok)||SUP[0];window.__sup=sup;
const baseOf=(x,p)=>x.prices[p]==null?null:x.prices[p];
function price(){const b=baseOf(sup(),d().prod);return b==null?null:Math.round(b*(1+MARKUP)*100)/100}
function priceTxt(){const p=price();return p==null?'Price on request':(sup().cur+' $'+p.toFixed(2)+' + shipping')}
let drawImg=null;function loadDraw(){}
function plush(g,W,H){const s=d();g.save();g.fillStyle='#fff6fa';g.fillRect(0,0,W,H);g.scale(W/520,H/520);
 g.fillStyle='#e9d3c0';for(let i=0;i<14;i++){g.font='20px serif';g.fillText(i%2?'☕':'♥',(i*97)%500+5,(i*61)%500+20)}
 const P=s.pack,C=s.shade,p=s.prod;g.textAlign='center';
 const label=(y)=>{g.fillStyle='#fff';g.beginPath();g.roundRect(170,y,180,70,12);g.fill();g.fillStyle='#e75480';g.font='bold 18px Georgia';g.fillText('☕ Coffeebreak',260,y+26);g.fillStyle='#5a1a3a';g.font='italic 17px Georgia';g.fillText((s.emb||nm('prod',p)).slice(0,24),260,y+52)};
 if(p==='scrub'||p==='eye'||p==='cream'){const w=p==='eye'?170:p==='cream'?210:240,h=p==='eye'?110:p==='cream'?140:170,x=260-w/2,y=300-h/2;g.fillStyle=C;g.beginPath();g.roundRect(x+8,y-30,w-16,40,10);g.fill();
  g.fillStyle=P;g.beginPath();g.roundRect(x,y-50,w,34,10);g.fill();g.beginPath();g.roundRect(x,y,w,h,18);g.fill();if(p==='scrub'||p==='cream'){label(y+(p==='cream'?35:50))}else{g.fillStyle='#fff';g.font='bold 15px Georgia';g.fillText('Coffeebreak',260,y+50);g.font='italic 14px Georgia';g.fillText((s.emb||'').slice(0,24),260,y+72)}}
 else if(p==='bodyoil'||p==='faceoil'){g.fillStyle='#333';g.fillRect(240,100,40,60);g.fillStyle=P;g.beginPath();g.roundRect(250,150,20,30,4);g.fill();g.fillStyle='rgba(111,78,55,.85)';g.beginPath();g.roundRect(190,180,140,250,30);g.fill();label(260)}
 else if(p==='balm'||p==='lipscrub'||p==='duo'){g.fillStyle=C;g.beginPath();g.roundRect(225,110,70,90,20);g.fill();g.fillStyle=P;g.fillRect(215,195,90,230);g.fillStyle='#fff';g.fillRect(215,250,90,110);g.fillStyle='#e75480';g.font='bold 14px Georgia';g.fillText('Coffeebreak',260,290);g.fillStyle='#5a1a3a';g.font='italic 13px Georgia';g.fillText((s.emb||nm('prod',p)).slice(0,24),260,320)}
 else {g.fillStyle=P;g.beginPath();g.arc(260,290,150,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(260,290,128,0,7);g.fill();
  if(p==='shadow'){[[-55,-40],[55,-40],[-55,45],[55,45]].forEach((o,i)=>{g.fillStyle=i?shadeMix(C,i*.18):C;g.beginPath();g.arc(260+o[0],290+o[1],44,0,7);g.fill()})}else{g.fillStyle=C;g.beginPath();g.arc(260,290,112,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(225,250,40,20,-.6,0,7);g.fill()}
  g.fillStyle='#e75480';g.font='bold 18px Georgia';g.fillText('☕ Coffeebreak'+(s.emb?' · '+s.emb.slice(0,24):''),260,470)}
 g.restore();g.fillStyle='#e75480';g.font='bold 16px Georgia';g.textAlign='left';g.fillText('Coffeebreak Cosmetics · '+nm('prod',s.prod),12*W/520,505*H/520)}
function shadeMix(h,t){const n=parseInt(h.slice(1),16),r=n>>16,g2=n>>8&255,b=n&255,f=v=>Math.round(v+(255-v)*t);return 'rgb('+f(r)+','+f(g2)+','+f(b)+')'}
function paint(){const cv=document.getElementById('cpC');if(cv)plush(cv.getContext('2d'),520,520)}
function summary(id){const s=d(),p=sup();return [`COFFEEBREAK COSMETICS ORDER${id?' (PayPal SANDBOX '+id+')':' REQUEST'}`,'TEST MODE','',
 ...Object.keys(LBL).map(k=>LBL[k]+': '+nm(k,s[k])),'Gift card name: '+(s.emb||'-'),
 '','Supplier: '+p.name,'Supplier page: '+p.url,'Price: '+priceTxt()+(price()!=null?' (supplier base '+p.cur+' $'+baseOf(p,d().prod).toFixed(2)+' + 40% markup)':''),
 '','Customer: '+s.name,'Email: '+s.email,'Phone: '+s.phone,'Ship to: '+s.addr,'Notes: '+(s.notes||'-'),'',
 'ACTION: forward this order to the supplier for DROPSHIP. The supplier makes the product under the Coffeebreak label and ships it DIRECT to the customer address above. Coffeebreak holds no stock.'].join('\n')}
function mail(id){const u='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Cosmetics order'+(id?' '+id:' request')+' – '+(d().name||'Coffeebreak'))+'&body='+encodeURIComponent(summary(id));window.__opened=u;window.open(u,'_blank')}
function sheet(){const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1200,800);
 const b=document.createElement('canvas');b.width=b.height=700;plush(b.getContext('2d'),700,700);g.drawImage(b,20,60);g.fillStyle='#e75480';g.font='bold 36px Georgia';g.fillText('Coffeebreak Cosmetics — Design',30,46);
 g.fillStyle='#5a1a3a';g.font='20px Georgia';summary().split('\n').slice(3,12).forEach((l,i)=>g.fillText(l.slice(0,40),740,110+i*36));g.font='italic 16px Georgia';g.fillText('Preview only. Product ships in the supplier’s own packaging.',740,470);return cv}
function exportPng(){if(D){window.demoEnd&&window.demoEnd('Saving the design preview PNG is in the full <b>Coffeebreak Cosmetics</b>.');return}const a=document.createElement('a');a.download='[REDACTED]-cosmetics-design.png';a.href=sheet().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Design PNG saved')}
const locked=(k,v)=>D&&DEMO_OK[k]&&!DEMO_OK[k].includes(v);
let ppDone=false;function loadPP(){const box=document.getElementById('ppBox');if(sup().aff){box.innerHTML='<p class="note"><b>Affiliate supplier:</b> you buy on the brand’s own website, and they ship it to you. Karen earns a small commission. Her affiliate link goes in once she is approved.</p><a href="'+sup().url+'" target="_blank" rel="noopener"><button class="primary">🛍️ Shop at '+esc(sup().name.split(' (')[0].split(':')[0])+'</button></a>';return}if(price()==null){box.innerHTML='<p class="note">This supplier has no published price for this product, so use “Email order request” and Karen will reply with a price and a PayPal payment request.</p>';return}
 if(D){box.innerHTML='<p class="note">PayPal checkout is in the full app.</p>';return}
 box.innerHTML='<div id="paypal-buttons"></div><p class="note" id="ppStatus">PayPal TEST mode (sandbox) – no real money.</p>';
 const go=()=>{try{window.paypal.Buttons({createOrder:(x,a)=>a.order.create({purchase_units:[{amount:{value:price().toFixed(2),currency_code:'USD'},description:'Coffeebreak Cosmetics (TEST)'}]}),onApprove:(x,a)=>a.order.capture().then(o=>{document.getElementById('ppStatus').textContent='Sandbox payment complete: '+o.id;mail(o.id)}),onError:()=>{document.getElementById('ppStatus').textContent='PayPal error – use “Email order request”.'}}).render('#paypal-buttons')}catch(e){}};
 if(window.paypal){go();return}if(ppDone)return;ppDone=true;const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PP_CLIENT_ID)+'&currency=USD';s.onload=go;s.onerror=()=>{ppDone=false;const t=document.getElementById('ppStatus');if(t)t.textContent='PayPal could not load (offline?) – use “Email order request”.'};document.head.appendChild(s)}
function draw(){const s=d();
 R.innerHTML=`<h1>☕💄 Coffeebreak Cosmetics</h1><p class="note">Real natural coffee skincare from Australian brands. You buy from the brand and they ship it from Australia, while Coffeebreak earns a small commission. Plus a pink Coffeebreak gift card PNG.</p><div class="wrap"><div class="ctl">${Object.keys(O).map(k=>`<div class="card"><h3>${LBL[k]}</h3>${O[k].map(o=>k==='fur'?`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''}" title="${o[1]}" style="background:${o[0]};width:32px;height:32px;border-radius:50%;padding:0"></button>`:`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''} ${locked(k,o[0])?'lock':''}">${esc(o[1])}${locked(k,o[0])?' 🔒':''}</button>`).join('')}${k==='prod'&&PNOTE[s.prod]?'<p class="note">'+PNOTE[s.prod]+'</p>':''}</div>`).join('')}
 
 <div class="card"><h3>Gift message name (on the Coffeebreak gift card)</h3><input id="f_emb" maxlength="24" placeholder="e.g. Morning Latte Glow" value="${esc(s.emb)}"></div>

 <div class="card" style="font-size:12px"><b>Honest notes:</b> these are cosmetics, not medicines, so no therapeutic claims (they don’t treat or cure anything). Every product lists its ingredients in descending order, as required by the ACCC cosmetics labelling standard. Patch test first. Coffee products contain caffeine.</div></div>
 <div class="pv"><canvas id="cpC" class="prev" width="520" height="520"></canvas><div><button class="primary" id="cpPng">🖼️ Design preview PNG</button><button id="cpSave">💾 Save design</button></div>
 <div class="card"><h3>Choose the supplier</h3>${SUP.map(x=>{const can=x.ok&&(AVAIL[x.id]||[]).includes(s.prod);return `<label style="display:block;margin:6px 0;${can?'':'opacity:.45'}"><input type="radio" name="sup" value="${x.id}" ${s.sup===x.id?'checked':''} ${can?'':'disabled'} style="width:auto"> <b>${esc(x.name)}</b> — ${baseOf(x,s.prod)==null?'Price on request':x.cur+' $'+(Math.round(baseOf(x,s.prod)*(1+MARKUP)*100)/100).toFixed(2)+' + shipping'}<br><span class="note">${esc(x.note)} <a href="${x.url}" target="_blank" rel="noopener">Supplier page</a></span></label>`}).join('')}
 <h3 style="margin-top:10px">Your price: <span id="cpPrice">${priceTxt()}</span></h3></div>
 <div class="card"><h3>Order</h3><input id="f_name" placeholder="Your name" value="${esc(s.name)}"><input id="f_email" placeholder="Email" value="${esc(s.email)}"><input id="f_phone" placeholder="Phone" value="${esc(s.phone)}"><textarea id="f_addr" placeholder="Delivery address">${esc(s.addr)}</textarea><textarea id="f_notes" placeholder="Notes (skin type, allergies)">${esc(s.notes)}</textarea>
 <button class="primary" id="cpOrder">✉️ Email order request</button><div id="ppBox"></div>
 <p class="note"><b>How it works, honestly:</b> Coffeebreak keeps no stock and makes nothing. Preferred suppliers are affiliate programs: you buy on the Australian brand’s own site, they post it to you, and Coffeebreak earns a commission (no markup is added). For other suppliers, your request goes to Karen, who replies with a price (supplier cost plus 40%, plus shipping) and a PayPal request. Suppliers marked “needs ABN” can’t be used yet. Pictures are illustrations. PayPal is in TEST mode.</p></div>
 ${S.saved.length?`<div class="card"><h3>Saved designs</h3>${S.saved.map((x,i)=>`<button data-load="${i}">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
 paint();loadPP();
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(locked(k,v)){window.demoEnd&&window.demoEnd('All 6 products are in the full <b>Coffeebreak Cosmetics</b>.');return}s[k]=v;if(k==='prod'&&!(AVAIL[s.sup]||[]).includes(v))s.sup=Object.keys(AVAIL).find(i=>AVAIL[i].includes(v));save();draw()});
 R.querySelectorAll('[name=sup]').forEach(r=>r.onchange=()=>{s.sup=r.value;save();draw()});
 ['name','email','phone','addr','notes'].forEach(f=>{const el=document.getElementById('f_'+f);el.oninput=()=>{s[f]=el.value;save()}});
 document.getElementById('f_emb').oninput=e=>{s.emb=e.target.value;save();paint()};


 document.getElementById('cpPng').onclick=exportPng;
 document.getElementById('cpSave').onclick=()=>{if(D&&S.saved.length>=1){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Coffeebreak Cosmetics</b>.');return}S.saved.unshift({label:nm('animal',s.animal)+(s.emb?' “'+s.emb+'”':''),d:JSON.parse(JSON.stringify(s))});save();say('Design saved');draw()};
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.d=JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d));save();loadDraw();draw()});
 document.getElementById('cpOrder').onclick=()=>{if(!s.name||!s.email||!s.addr){say('Add your name, email and delivery address');return}mail();say('Opening your email app…')}}
window.CP={get S(){return S},draw,summary,price,priceTxt,sheet};
save();loadDraw();draw();
})();
function update(){}function draw(){}
