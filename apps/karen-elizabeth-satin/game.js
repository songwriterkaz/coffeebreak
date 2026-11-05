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
// ===== Karen Elizabeth Satin =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'keDemo':'keSave';
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
// Real made-to-order suppliers that ship single items to the customer. Prices exactly as published (USD, before shipping); null = not published.
const SUP={
 robe:[{id:'kin',name:'Kincustom – Women’s Satin Robe',url:'https://www.kincustom.com/products/women/aop-tees-tops/womens-satin-robe-white',base:35.50,cur:'USD',note:'100% polyester satin, sublimation print, no minimum, made on demand (~3 business days) then shipped. Base price $35.50 published.'}],
 pj:[{id:'pea',name:'PeaPrint – Women Satin Pajama Set (all-over print)',url:'https://peaprint.com/products/detail/women-satin-pajama-set',base:11.96,cur:'USD',note:'120gsm satin PJ set, all-over print, no minimums. Published price $11.96 (bulk $10.76).'},
  {id:'pfy',name:'Printify – Women’s Satin Pajamas (AOP)',url:'https://printify.com/custom-pajamas/',base:null,retail:45,src:'Inkse custom satin PJ sets from A$45 https://www.inkse.com/custom-pyjamas',cur:'AUD',note:'95% satin polyester / 5% spandex, sizes XS/S–3XL/4XL, fulfilled in China, shipped to the customer. Base cost shows in the Printify app, so Price on request.'}],
 slip:[{id:'pful',name:'Printful – All-Over Print Slip Dress',url:'https://www.printful.com/custom/womens/dresses/all-over-print-slip-dress',supplierPrice:51.21,supplierShipping:11.91,profit:13,landed:'Printful US$35.65 + US$8.29 AU shipping, at 1 USD = 1.4365 AUD (12 Oct 2026)',base:35.65,cur:'USD',note:'Midi slip dress with tie straps, side slit, built-in bra, no minimums. Published price $35.65. Printful does not call it satin, so check the fabric on the product page.'},
  {id:'urs',name:'UR Silk – Custom Silk Dress',url:'https://ursilk.com/product/custom-silk-dress/',base:null,retail:159,src:'Bags of Love custom silk/satin long slip dress A$159 https://au.bagsoflove.com/long-slip-dress',cur:'AUD',note:'Real silk/silk-satin custom dress, no minimum, ships to the customer. Quoted per design.'}],
 scrun:[{id:'pfs',name:'Printful – All-Over Print Recycled Scrunchie',url:'https://www.printful.com/custom/accessories/all/all-over-print-recycled-scrunchie',base:8.86,cur:'USD',note:'All-over print scrunchie, no minimums, shipped to the customer. Published price $8.86. Recycled polyester, not true satin.'}],
 pillow:[{id:'con',name:'Contrado – Custom Silk Pillowcase',url:'https://au.contrado.com/custom-silk-pillowcase',base:84,cur:'AUD',note:'100% natural silk satin, handmade, printed one or both sides, delivered to Australia from $15.95. Contrado publishes A$84 per printed silk pillowcase (+40% markup).'},
  {id:'ck',name:'CustomKings (Bennetts Green, Newcastle) – Satin Pillowcase',url:'https://customkings.com.au/product/satin-pillowcase-with-printed-corporate-logo/',base:null,retail:39,cur:'AUD',note:'100% polyester satin in white, black or rose gold, logo DTF-printed, sent by tracked Australia Post. Local to Newcastle. Price is an estimate from comparable AU satin pillowcases (A$49 plain mulberry silk, silkpyjamas.com.au).'}]};
const O={item:[['robe','Satin robe'],['pj','Satin pyjamas'],['slip','Slip dress'],['scrun','Scrunchie'],['pillow','Pillowcase']],
 col:[['#f8c8d8','Blush'],['#f4a6c0','Rose'],['#ffd9e4','Ballet pink'],['#e75480','Hot pink'],['#f7b2a8','Peach pink'],['#d8a7c7','Mauve'],['#e8b4b8','Rose gold'],['#fff0f5','Pearl']],
 thread:[['#ffffff','White'],['#d4af37','Gold'],['#c0c0c0','Silver'],['#8b1c4a','Berry']],
 pos:[['chest','Left chest'],['back','Back / centre'],['hem','Hem / corner']],
 size:[['xs','XS'],['s','S'],['m','M'],['l','L'],['xl','XL'],['2xl','2XL']]};
const LBL={item:'Garment',col:'Satin shade',thread:'Logo thread colour',pos:'Logo position',size:'Size'};
const DEMO_OK={item:['robe','scrun']};
let S;try{S=JSON.parse(localStorage[SK]||'')}catch(e){}
S=S||{d:{item:'robe',col:'#f8c8d8',thread:'#ffffff',pos:'chest',size:'m',mono:'',sup:{},name:'',email:'',phone:'',addr:'',notes:''},saved:[]};
const d=()=>S.d;function save(){try{localStorage[SK]=JSON.stringify(S)}catch(e){}}
const nm=(k,v)=>(O[k].find(o=>o[0]===v)||[v,v])[1];
const sups=()=>SUP[d().item];const sup=()=>sups().find(x=>x.id===d().sup[d().item])||sups()[0];
const mk=b=>Math.round(b*(1+MARKUP)*100)/100;
function price(){const s=sup();if(s.supplierPrice!=null)return CBOrder.sale(s);return s.base==null?(s.retail??null):mk(s.base)}
function priceTxt(){const p=price();if(sup().supplierPrice!=null)return 'AUD $'+p.toFixed(2)+' incl. delivery';return p==null?'Price on request':(sup().cur+' $'+p.toFixed(2)+' + shipping'+(sup().base==null?' (est. retail – price may change, confirmed at order)':''))}
function shade(h,a){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r+a));g=Math.max(0,Math.min(255,g+a));b=Math.max(0,Math.min(255,b+a));return `rgb(${r},${g},${b})`}
function satin(g,x0,y0,x1,y1){const s=d().col,gr=g.createLinearGradient(x0,y0,x1,y1);[0,.25,.45,.55,.75,1].forEach((p,i)=>gr.addColorStop(p,shade(s,[-25,10,45,20,-15,5][i])));return gr}
function logo(g,x,y,sz){const t=d().thread;g.save();g.textAlign='center';g.font='italic bold '+sz+'px Georgia';g.lineWidth=Math.max(1,sz/9);g.setLineDash([sz/7,sz/12]);g.strokeStyle=shade(t,-60);g.strokeText('Karen Elizabeth',x,y);g.setLineDash([]);g.fillStyle=t;g.fillText('Karen Elizabeth',x,y);
 if(d().mono){g.font='italic '+(sz*.7)+'px Georgia';g.fillText(d().mono.slice(0,12),x,y+sz*1.05)}g.restore()}
function art(g,W,H){const s=d();g.save();const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#fff7fa');bg.addColorStop(1,'#fde4ee');g.fillStyle=bg;g.fillRect(0,0,W,H);g.scale(W/520,H/520);
 g.fillStyle='rgba(231,84,128,.12)';for(let i=0;i<16;i++){g.font='18px serif';g.fillText('♥',(i*97)%500+5,(i*61)%480+20)}
 g.translate(260,265);const it=s.item;let lp=[0,-40,22];g.strokeStyle='rgba(120,20,60,.35)';g.lineWidth=2;
 if(it==='robe'){g.fillStyle=satin(g,-170,0,170,0);g.beginPath();g.moveTo(-60,-200);g.lineTo(-170,-130);g.lineTo(-215,40);g.lineTo(-165,55);g.lineTo(-130,-40);g.lineTo(-135,215);g.lineTo(135,215);g.lineTo(130,-40);g.lineTo(165,55);g.lineTo(215,40);g.lineTo(170,-130);g.lineTo(60,-200);g.lineTo(0,-60);g.closePath();g.fill();g.stroke();
  g.fillStyle=shade(s.col,-30);g.fillRect(-135,10,270,18);g.beginPath();g.moveTo(20,28);g.lineTo(0,110);g.lineTo(18,112);g.lineTo(40,28);g.fill();lp={chest:[-70,-100,18],back:[60,120,20],hem:[85,195,14]}[s.pos]}
 else if(it==='pj'){g.fillStyle=satin(g,-160,0,160,0);g.beginPath();g.moveTo(-55,-205);g.lineTo(-150,-160);g.lineTo(-195,-40);g.lineTo(-150,-25);g.lineTo(-115,-100);g.lineTo(-115,20);g.lineTo(115,20);g.lineTo(115,-100);g.lineTo(150,-25);g.lineTo(195,-40);g.lineTo(150,-160);g.lineTo(55,-205);g.lineTo(0,-120);g.closePath();g.fill();g.stroke();
  g.beginPath();g.moveTo(-110,35);g.lineTo(110,35);g.lineTo(125,225);g.lineTo(15,225);g.lineTo(0,90);g.lineTo(-15,225);g.lineTo(-125,225);g.closePath();g.fill();g.stroke();g.fillStyle='#fff';[-80,-30].forEach(y=>{g.beginPath();g.arc(8,y,4,0,7);g.fill()});lp={chest:[-60,-120,17],back:[0,-20,18],hem:[-70,205,12]}[s.pos]}
 else if(it==='slip'){g.fillStyle=satin(g,-150,0,150,0);g.strokeStyle='rgba(120,20,60,.5)';g.beginPath();g.moveTo(-55,-215);g.lineTo(-70,-130);g.moveTo(55,-215);g.lineTo(70,-130);g.stroke();g.beginPath();g.moveTo(-70,-130);g.quadraticCurveTo(0,-95,70,-130);g.lineTo(85,-20);g.lineTo(150,225);g.lineTo(-150,225);g.lineTo(-85,-20);g.closePath();g.fill();g.stroke();lp={chest:[-30,-90,15],back:[0,40,20],hem:[80,205,13]}[s.pos]}
 else if(it==='scrun'){g.fillStyle=satin(g,-160,-160,160,160);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;g.beginPath();g.ellipse(Math.cos(a)*120,Math.sin(a)*120,62,48,a,0,7);g.fill();g.stroke()}g.fillStyle='#fde4ee';g.beginPath();g.arc(0,0,70,0,7);g.fill();lp=[0,215,22]}
 else{g.fillStyle=satin(g,-220,-140,220,140);g.beginPath();g.roundRect(-225,-140,450,280,30);g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(170,-140);g.lineTo(170,140);g.stroke();lp={chest:[-120,-90,22],back:[0,10,30],hem:[90,110,18]}[s.pos]}
 logo(g,lp[0],lp[1],lp[2]);g.restore();g.fillStyle='#c2185b';g.font='italic bold 18px Georgia';g.textAlign='left';g.fillText('Karen Elizabeth · '+nm('item',s.item)+' · '+nm('col',s.col)+(s.item==='robe'||s.item==='pj'||s.item==='slip'?' · '+nm('size',s.size):''),12*W/520,508*H/520)}
function paint(){const cv=document.getElementById('cpC');if(cv)art(cv.getContext('2d'),520,520)}
function summary(id){const s=d(),p=sup();return [`KAREN ELIZABETH SATIN ORDER${id?' '+id:' REQUEST'}`,'','',
 ...Object.keys(LBL).map(k=>LBL[k]+': '+nm(k,s[k])),'Shade hex: '+s.col,'Logo: embroidered-style "Karen Elizabeth"'+(s.mono?' + "'+s.mono+'"':''),
 '','Supplier: '+p.name,'Supplier page: '+p.url,'Price: '+priceTxt()+(p.supplierPrice!=null?' (supplier cost AUD $'+p.supplierPrice.toFixed(2)+' + AUD $'+p.supplierShipping.toFixed(2)+' shipping; '+p.landed+')':price()!=null&&p.base!=null?' (supplier base '+p.cur+' $'+p.base.toFixed(2)+' + 40% markup)':''),
 '','Customer: '+s.name,'Email: '+s.email,'Phone: '+s.phone,'Ship to: '+s.addr,'Notes: '+(s.notes||'-'),'',
 'ACTION: forward this order to the supplier for DROPSHIP. The supplier makes the item and ships it DIRECT to the customer address above. Karen Elizabeth holds no stock.'].join('\n')}
function mail(id){const u='mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Karen Elizabeth order'+(id?' '+id:' request')+' – '+(d().name||'customer'))+'&body='+encodeURIComponent(summary(id));window.__opened=u;window.open(u,'_blank')}
function sheet(){const cv=document.createElement('canvas');cv.width=1200;cv.height=800;const g=cv.getContext('2d');g.fillStyle='#fff7fa';g.fillRect(0,0,1200,800);
 const b=document.createElement('canvas');b.width=b.height=700;art(b.getContext('2d'),700,700);g.drawImage(b,20,60);g.fillStyle='#c2185b';g.font='italic bold 36px Georgia';g.fillText('Karen Elizabeth — Satin Design',30,46);
 g.fillStyle='#5a1a3a';g.font='20px Georgia';summary().split('\n').slice(3,13).forEach((l,i)=>g.fillText(l.slice(0,42),740,110+i*36));g.font='italic 16px Georgia';g.fillText('Preview only. The maker confirms the final look.',740,500);return cv}
function exportPng(){if(D){window.demoEnd&&window.demoEnd('Saving the design preview PNG is in the full <b>Karen Elizabeth Satin</b>.');return}const a=document.createElement('a');a.download='karen-elizabeth-satin-design.png';a.href=sheet().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Design PNG saved')}
const locked=(k,v)=>D&&DEMO_OK[k]&&!DEMO_OK[k].includes(v);
let ppDone=false;function loadPP(){const box=document.getElementById('ppBox');if(sup().supplierPrice==null){box.innerHTML='<p class="note">Use “Email order request” and Karen will reply with a quote and payment details.</p>';return}
 if(D){box.innerHTML='<p class="note">Checkout is in the full app.</p>';return}
 box.innerHTML='<div id="paypal-buttons"></div>';const g=id=>(document.getElementById(id)||{}).value||'';
 CBPay.mount('paypal-buttons',{currency:'AUD',getItems:()=>[{name:'Karen Elizabeth '+nm('item',d().item)+' ('+nm('col',d().col)+', '+nm('size',d().size)+')',amount:price(),qty:1}],validate:()=>{if(!g('f_name')||!g('f_email')||!g('f_addr')){alert('Please add your name, email and delivery address.');return false}return true},email:()=>g('f_email'),subject:no=>'Karen Elizabeth order '+no+' – '+(g('f_name')||'customer'),body:no=>summary(no),onDone:()=>{}})}
function draw(){const s=d();const sw=k=>k==='col'||k==='thread';
 R.innerHTML=`<h1>🎀 Karen Elizabeth · Pink Satin</h1><p class="note">Design your own pink satin piece with the Karen Elizabeth logo. Each one is made to order and shipped straight to you.</p><div class="wrap"><div class="ctl">${Object.keys(O).map(k=>`<div class="card"><h3>${LBL[k]}</h3>${O[k].map(o=>sw(k)?`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''}" title="${o[1]}" style="background:${o[0]};width:34px;height:34px;border-radius:50%;padding:0;${s[k]===o[0]?'outline:3px solid #c2185b':''}"></button>`:`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''} ${locked(k,o[0])?'lock':''}">${esc(o[1])}${locked(k,o[0])?' 🔒':''}</button>`).join('')}</div>`).join('')}
 <div class="card"><h3>Add a name under the logo (optional)</h3><input id="f_mono" maxlength="12" placeholder="e.g. Bride" value="${esc(s.mono)}"><p class="note">Print-on-demand makers print the logo in an embroidered look. Real stitched embroidery can be quoted by makers that offer it.</p></div></div>
 <div class="pv"><canvas id="cpC" class="prev" width="520" height="520"></canvas><div><button class="primary" id="cpPng">🖼️ Design preview PNG</button><button id="cpSave">💾 Save design</button></div>
 <div class="card" hidden><h3>Choose the maker (dropship)</h3>${sups().map(x=>`<label style="display:block;margin:6px 0"><input type="radio" name="sup" value="${x.id}" ${sup().id===x.id?'checked':''} style="width:auto"> <b>${esc(x.name)}</b> — ${x.supplierPrice!=null?'AUD $'+CBOrder.sale(x).toFixed(2)+' incl. delivery':x.base==null?(x.retail==null?'Price on request':x.cur+' $'+x.retail.toFixed(2)+' + shipping (est. retail – price may change, confirmed at order)'):x.cur+' $'+mk(x.base).toFixed(2)+' + shipping'}<br><span class="note">${esc(x.note)} <a href="${x.url}" target="_blank" rel="noopener">Supplier page</a></span></label>`).join('')}
 <h3 style="margin-top:10px">Your price: <span id="cpPrice">${priceTxt()}</span></h3></div>
 <div class="card"><h3>Order</h3><input id="f_name" placeholder="Your name" value="${esc(s.name)}"><input id="f_email" placeholder="Email" value="${esc(s.email)}"><input id="f_phone" placeholder="Phone" value="${esc(s.phone)}"><textarea id="f_addr" placeholder="Delivery address">${esc(s.addr)}</textarea><textarea id="f_notes" placeholder="Notes for the maker">${esc(s.notes)}</textarea>
 <button class="primary" id="cpOrder">✉️ Email order request</button><div id="ppBox"></div>
 <p class="note"><b>How it works, honestly:</b> Karen Elizabeth keeps no stock. Your order goes to Karen. Your piece is made to order and posted straight to you. Prices include a 40% markup, and shipping is extra. Makers that don’t publish prices are quoted individually. The slip dress is paid by live PayPal or PayID. Other pieces: send an order request and Karen replies with a quote.</p></div>
 ${S.saved.length?`<div class="card"><h3>Saved designs</h3>${S.saved.map((x,i)=>`<button data-load="${i}">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
 paint();loadPP();
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(locked(k,v)){window.demoEnd&&window.demoEnd('Pyjamas, slip dresses and pillowcases are in the full <b>Karen Elizabeth Satin</b>.');return}s[k]=v;save();draw()});
 R.querySelectorAll('[name=sup]').forEach(r=>r.onchange=()=>{s.sup[s.item]=r.value;save();draw()});
 ['name','email','phone','addr','notes'].forEach(f=>{const el=document.getElementById('f_'+f);el.oninput=()=>{s[f]=el.value;save()}});
 document.getElementById('f_mono').oninput=e=>{s.mono=e.target.value;save();paint()};
 document.getElementById('cpPng').onclick=exportPng;
 document.getElementById('cpSave').onclick=()=>{if(D&&S.saved.length>=1){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Karen Elizabeth Satin</b>.');return}S.saved.unshift({label:nm('item',s.item)+' · '+nm('col',s.col),d:JSON.parse(JSON.stringify(s))});save();say('Design saved');draw()};
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.d=JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d));save();draw()});
 document.getElementById('cpOrder').onclick=()=>{if(!s.name||!s.email||!s.addr){say('Add your name, email and delivery address');return}mail();say('Opening your email app…')}}
window.CP={get S(){return S},draw,summary,price,priceTxt,sheet};
save();draw();
})();
function update(){}function draw(){}
