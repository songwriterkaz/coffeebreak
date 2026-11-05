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
// ===== Perfume Scent Studio =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'pfDemo':'pfSave';
const PP_CLIENT_ID='AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-';const MARKUP=0.40;
const st=document.createElement('style');st.textContent=`
#cp{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#5a1a3a;background:linear-gradient(135deg,#fff5f9,#fde2ec 45%,#fff5f9 55%,#f9d3e1);border-radius:16px}
#cp h1{color:#c2185b;margin:6px 0;font-style:italic;letter-spacing:1px}#cp h3{color:#d0457a;margin:6px 0}
#cp button{background:linear-gradient(#fff,#ffe1ec);color:#5a1a3a;border:1.5px solid #e8a0b8;border-radius:20px;padding:7px 12px;font:14px Georgia;cursor:pointer;margin:2px;box-shadow:0 1px 3px rgba(194,24,91,.15)}
#cp button.on,#cp button.primary{background:linear-gradient(#f06292,#c2185b);color:#fff;font-weight:bold}#cp button.lock{opacity:.5}
#cp input,#cp textarea{background:#fff;color:#5a1a3a;border:1.5px solid #e8a0b8;border-radius:10px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;width:100%;margin:2px 0}
#cp .wrap{display:flex;gap:14px;flex-wrap:wrap}#cp .ctl{flex:1 1 360px}#cp .pv{flex:1 1 520px;text-align:center}
#cp canvas.prev{width:100%;max-width:520px;border-radius:20px;border:2px solid #e8a0b8;background:#fff}
#cp .card{background:rgba(255,255,255,.85);border:1.5px solid #f5c2d4;border-radius:16px;padding:10px 12px;margin:8px 0;text-align:left}
#cp .note{font-size:13px;color:#7a3a5a;line-height:1.45}
#cpMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#c2185b;color:#fff;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='cp';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='cpMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
// Australian makers only (AU-made = Karen is not the importer, so no AICIS registration for her). Prices as published.
const SUP={
 roll:[{id:'mia',name:'Miakara (Epping VIC) – Perfume Roll-On 10ml',url:'https://miakara.com.au/product/perfume-roll-on/',base:18.95,cur:'AUD',note:'Australian-made, alcohol-free roll-on (caprylic/capric triglyceride + your chosen fragrance oil from 300+). No ABN and no minimum needed. Published 1-unit price $18.95. Made to order in 4–6 weeks. Ask Miakara to post each order to the customer’s address.'},
  {id:'flo',name:'Flovera (Melbourne) – White-label perfume oil / roll-on',url:'https://flovera.com.au/white-label/',base:null,cur:'AUD',note:'Australian-made EDP, perfume oils, body mists and roll-ons with low MOQs. Ships finished stock to you (not a single-unit dropshipper). Price on request.'}],
 edp:[{id:'flo2',name:'Flovera (Melbourne) – White-label Eau de Parfum',url:'https://flovera.com.au/white-label/',base:null,cur:'AUD',note:'Australian-made EDP with your bottle and label. Low MOQs (not stated as 1), quoted per order. Price on request.'},
  {id:'mia2',name:'Miakara – Custom signature scent',url:'https://miakara.com.au/formulation/',base:null,cur:'AUD',note:'Their chemists develop a custom scent from $300 per fragrance (one-off), then it’s made to order with no minimums. Price on request.'}]};
const NOTES={top:[['berg','Bergamot'],['lemon','Lemon'],['pear','Pear'],['pinkpep','Pink pepper'],['berry','Raspberry']],
 heart:[['rose','Rose'],['jas','Jasmine'],['peony','Peony'],['coffee','Coffee'],['orange','Orange blossom']],
 base:[['van','Vanilla'],['musk','White musk'],['sandal','Sandalwood'],['amber','Amber'],['tonka','Tonka']]};
const O={kind:[['roll','Perfume roll-on oil'],['edp','Eau de parfum spray']],top:NOTES.top,heart:NOTES.heart,base:NOTES.base,
 brand:[['cb','Coffeebreak'],['ke','Karen Elizabeth']],shape:[['round','Round'],['square','Square'],['heart','Heart'],['tall','Tall slim']],
 glass:[['#ffd6e4','Blush glass'],['#f8f8ff','Clear'],['#e8b4b8','Rose gold'],['#c9a0dc','Lilac'],['#e75480','Hot pink']],
 cap:[['#d4af37','Gold'],['#c0c0c0','Silver'],['#111111','Black'],['#ffffff','Pearl']]};
const LBL={kind:'Product',top:'Top note',heart:'Heart note',base:'Base note',brand:'Brand',shape:'Bottle shape',glass:'Glass colour',cap:'Cap'};
const DEMO_OK={kind:['roll'],shape:['round','square']};
let S;try{S=JSON.parse(localStorage[SK]||'')}catch(e){}
S=S||{d:{kind:'roll',top:'berg',heart:'rose',base:'van',brand:'ke',shape:'heart',glass:'#ffd6e4',cap:'#d4af37',mono:'',col:'#ffd6e4',sup:{},name:'',email:'',phone:'',addr:'',notes:''},saved:[]};
const d=()=>S.d;function save(){try{localStorage[SK]=JSON.stringify(S)}catch(e){}}
const nm=(k,v)=>(O[k].find(o=>o[0]===v)||[v,v])[1];
const sups=()=>SUP[d().kind];const sup=()=>sups().find(x=>x.id===d().sup[d().kind])||sups()[0];
const mk=b=>Math.round(b*(1+MARKUP)*100)/100;
function price(){const s=sup();return s.base==null?null:mk(s.base)}
function priceTxt(){const p=price();return p==null?'Price on request':(sup().cur+' $'+p.toFixed(2)+' + shipping')}
function shade(h,a){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r+a));g=Math.max(0,Math.min(255,g+a));b=Math.max(0,Math.min(255,b+a));return `rgb(${r},${g},${b})`}
function art(g,W,H){const s=d();g.save();const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#fff7fa');bg.addColorStop(1,'#fde4ee');g.fillStyle=bg;g.fillRect(0,0,W,H);g.scale(W/520,H/520);
 g.fillStyle='rgba(231,84,128,.12)';for(let i=0;i<16;i++){g.font='18px serif';g.fillText(i%2?'✿':'♥',(i*97)%500+5,(i*61)%480+20)}
 g.translate(260,290);const gl=s.glass,roll=s.kind==='roll';const gr=g.createLinearGradient(-130,0,130,0);gr.addColorStop(0,gl);gr.addColorStop(.3,'#ffffff');gr.addColorStop(.45,gl);gr.addColorStop(1,gl);
 g.fillStyle=gr;g.strokeStyle='rgba(120,20,60,.45)';g.lineWidth=3;g.globalAlpha=.92;g.beginPath();
 const sh=roll&&s.shape!=='heart'?'tall':s.shape;
 if(sh==='round')g.arc(0,40,140,0,7);else if(sh==='square')g.roundRect(-130,-90,260,260,24);else if(sh==='tall')g.roundRect(-70,-130,140,320,30);
 else{g.moveTo(0,190);g.bezierCurveTo(-210,60,-170,-140,0,-60);g.bezierCurveTo(170,-140,210,60,0,190)}
 g.fill();g.stroke();g.globalAlpha=1;const top=sh==='round'?-100:sh==='square'?-90:sh==='tall'?-130:-75;
 g.fillStyle='#e9e2d0';g.fillRect(-22,top-30,44,32);g.fillStyle=s.cap;g.beginPath();roll?g.roundRect(-30,top-120,60,92,14):g.roundRect(-48,top-110,96,82,12);g.fill();g.stroke();
 g.fillStyle='rgba(255,255,255,.88)';g.beginPath();g.roundRect(-100,0,200,90,14);g.fill();g.strokeStyle=s.cap;g.lineWidth=2.5;g.stroke();
 g.fillStyle='#c2185b';g.textAlign='center';g.font='italic bold 24px Georgia';g.fillText(s.brand==='ke'?'Karen Elizabeth':'☕ Coffeebreak',0,32);
 g.font='italic 17px Georgia';g.fillStyle='#5a1a3a';g.fillText(s.mono?s.mono.slice(0,16):nm('heart',s.heart)+' & '+nm('base',s.base),0,58);g.font='12px Georgia';g.fillText(roll?'perfume oil · 10 ml':'eau de parfum',0,78);
 g.restore();g.fillStyle='#c2185b';g.font='italic bold 17px Georgia';g.textAlign='left';g.fillText('Scent: '+nm('top',s.top)+' · '+nm('heart',s.heart)+' · '+nm('base',s.base),12*W/520,508*H/520)}
function paint(){const cv=document.getElementById('cpC');if(cv)art(cv.getContext('2d'),520,520)}
function summary(id){const s=d(),p=sup();return [`PERFUME SCENT STUDIO ORDER${id?' (PayPal SANDBOX '+id+')':' REQUEST'}`,'TEST MODE','',
 ...Object.keys(LBL).map(k=>LBL[k]+': '+nm(k,s[k])),'Label name: '+(s.mono||'-'),'Glass hex: '+s.glass,
 '','Supplier: '+p.name,'Supplier page: '+p.url,'Price: '+priceTxt()+(price()!=null?' (supplier base '+p.cur+' $'+p.base.toFixed(2)+' + 40% markup)':''),
 '','Customer: '+s.name,'Email: '+s.email,'Phone: '+s.phone,'Ship to: '+s.addr,'Notes: '+(s.notes||'-'),'',
 'ACTION: forward this order to the supplier for DROPSHIP. The supplier makes the perfume and ships it DIRECT to the customer address above. Coffeebreak / Karen Elizabeth holds no stock.'].join('\n')}
function mail(id){const u='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Perfume order'+(id?' '+id:' request')+' – '+(d().name||'customer'))+'&body='+encodeURIComponent(summary(id));window.__opened=u;window.open(u,'_blank')}
function sheet(){const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle='#fff7fa';g.fillRect(0,0,1200,800);
 const b=document.createElement('canvas');b.width=b.height=700;art(b.getContext('2d'),700,700);g.drawImage(b,20,60);g.fillStyle='#c2185b';g.font='italic bold 36px Georgia';g.fillText('Perfume Scent Studio — Design',30,46);
 g.fillStyle='#5a1a3a';g.font='20px Georgia';summary().split('\n').slice(3,13).forEach((l,i)=>g.fillText(l.slice(0,42),740,110+i*36));g.font='italic 16px Georgia';g.fillText('Preview only. The maker confirms the final look.',740,500);return cv}
function exportPng(){if(D){window.demoEnd&&window.demoEnd('Saving the design preview PNG is in the full <b>Perfume Scent Studio</b>.');return}const a=document.createElement('a');a.download='perfume-scent-studio-design.png';a.href=sheet().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Design PNG saved')}
const locked=(k,v)=>D&&DEMO_OK[k]&&!DEMO_OK[k].includes(v);
let ppDone=false;function loadPP(){const box=document.getElementById('ppBox');if(price()==null){box.innerHTML='<p class="note">This maker doesn’t publish a price, so use “Email order request” and Karen will reply with a quote and a PayPal payment request.</p>';return}
 if(D){box.innerHTML='<p class="note">PayPal checkout is in the full app.</p>';return}
 box.innerHTML='<div id="paypal-buttons"></div><p class="note" id="ppStatus">PayPal TEST mode (sandbox) – no real money.</p>';
 const go=()=>{try{window.paypal.Buttons({createOrder:(x,a)=>a.order.create({purchase_units:[{amount:{value:price().toFixed(2),currency_code:sup().cur},description:'Perfume Scent Studio '+nm('kind',d().kind)+' (TEST)'}]}),onApprove:(x,a)=>a.order.capture().then(o=>{document.getElementById('ppStatus').textContent='Sandbox payment complete: '+o.id;mail(o.id)}),onError:()=>{document.getElementById('ppStatus').textContent='PayPal error – use “Email order request”.'}}).render('#paypal-buttons')}catch(e){}};
 if(window.paypal){go();return}if(ppDone)return;ppDone=true;const s=document.createElement('script');s.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(PP_CLIENT_ID)+'&currency='+sup().cur;s.onload=go;s.onerror=()=>{ppDone=false;const t=document.getElementById('ppStatus');if(t)t.textContent='PayPal could not load (offline?) – use “Email order request”.'};document.head.appendChild(s)}
function draw(){const s=d();const sw=k=>k==='glass'||k==='cap';
 R.innerHTML=`<h1>🌸 Perfume Scent Studio</h1><p class="note">By Coffeebreak &amp; Karen Elizabeth. Build your scent, design your bottle, and an Australian perfume maker makes it to order.</p><div class="wrap"><div class="ctl">${Object.keys(O).map(k=>`<div class="card"><h3>${LBL[k]}</h3>${O[k].map(o=>sw(k)?`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''}" title="${o[1]}" style="background:${o[0]};width:34px;height:34px;border-radius:50%;padding:0;${s[k]===o[0]?'outline:3px solid #c2185b':''}"></button>`:`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''} ${locked(k,o[0])?'lock':''}">${esc(o[1])}${locked(k,o[0])?' 🔒':''}</button>`).join('')}</div>`).join('')}
 <div class="card"><h3>Name your perfume</h3><input id="f_mono" maxlength="16" placeholder="e.g. Midnight Latte" value="${esc(s.mono)}"><p class="note">Your notes are a scent brief. The maker matches them from its own Australian-made fragrance range and confirms before making. The bottle is a concept, and the final bottle and label follow the maker’s packaging and Australian labelling rules.</p></div></div>
 <div class="pv"><canvas id="cpC" class="prev" width="520" height="520"></canvas><div><button class="primary" id="cpPng">🖼️ Design preview PNG</button><button id="cpSave">💾 Save design</button></div>
 <div class="card"><h3>Choose the Australian maker</h3>${sups().map(x=>`<label style="display:block;margin:6px 0"><input type="radio" name="sup" value="${x.id}" ${sup().id===x.id?'checked':''} style="width:auto"> <b>${esc(x.name)}</b> — ${x.base==null?'Price on request':x.cur+' $'+mk(x.base).toFixed(2)+' + shipping'}<br><span class="note">${esc(x.note)} <a href="${x.url}" target="_blank" rel="noopener">Supplier page</a></span></label>`).join('')}
 <h3 style="margin-top:10px">Your price: <span id="cpPrice">${priceTxt()}</span></h3></div>
 <div class="card"><h3>Order</h3><input id="f_name" placeholder="Your name" value="${esc(s.name)}"><input id="f_email" placeholder="Email" value="${esc(s.email)}"><input id="f_phone" placeholder="Phone" value="${esc(s.phone)}"><textarea id="f_addr" placeholder="Delivery address">${esc(s.addr)}</textarea><textarea id="f_notes" placeholder="Notes for the maker">${esc(s.notes)}</textarea>
 <button class="primary" id="cpOrder">✉️ Email order request</button><div id="ppBox"></div>
 <p class="note"><b>How it works, honestly:</b> Coffeebreak keeps no stock. Your order goes to Karen, who passes it to the maker you chose. They make your perfume and post it straight to you. Prices are the maker’s published price plus a 40% markup, and shipping is extra. Makers that don’t publish prices are quoted individually. Payments are in PayPal TEST mode for now. Patch test first. Fragrance is a cosmetic, with no therapeutic claims.</p></div>
 ${S.saved.length?`<div class="card"><h3>Saved designs</h3>${S.saved.map((x,i)=>`<button data-load="${i}">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
 paint();loadPP();
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(locked(k,v)){window.demoEnd&&window.demoEnd('Eau de parfum and every bottle shape are in the full <b>Perfume Scent Studio</b>.');return}s[k]=v;save();draw()});
 R.querySelectorAll('[name=sup]').forEach(r=>r.onchange=()=>{s.sup[s.kind]=r.value;save();draw()});
 ['name','email','phone','addr','notes'].forEach(f=>{const el=document.getElementById('f_'+f);el.oninput=()=>{s[f]=el.value;save()}});
 document.getElementById('f_mono').oninput=e=>{s.mono=e.target.value;save();paint()};
 document.getElementById('cpPng').onclick=exportPng;
 document.getElementById('cpSave').onclick=()=>{if(D&&S.saved.length>=1){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Perfume Scent Studio</b>.');return}S.saved.unshift({label:(s.mono||nm('heart',s.heart))+' · '+nm('kind',s.kind),d:JSON.parse(JSON.stringify(s))});save();say('Design saved');draw()};
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.d=JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d));save();draw()});
 document.getElementById('cpOrder').onclick=()=>{if(!s.name||!s.email||!s.addr){say('Add your name, email and delivery address');return}mail();say('Opening your email app…')}}
window.CP={get S(){return S},draw,summary,price,priceTxt,sheet};
save();draw();
})();
function update(){}function draw(){}
