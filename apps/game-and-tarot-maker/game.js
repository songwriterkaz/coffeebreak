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
// ===== Coffeebreak Game & Tarot Maker (on-device designer, dropship order) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const CFG={paypalClientId:"AeNu47WcydcDLElIey76JK3GzTuiRntC6M9CZDoClmQuVYaL5bVqCoZGq0UDOOCjHDbW6xwsDdfTxhR-",orderEmail:"songwriterkaz@gmail.com",markup:0.40,currency:"USD"};
const st=document.createElement('style');st.textContent=`#gt{flex:1;width:100%;max-width:1250px;padding:8px 10px 90px;box-sizing:border-box;font-family:Georgia,serif;color:#5a1838}
#gt h2{color:#d6336c;margin:6px 0}#gt h3{color:#c2255c;margin:6px 0}#gt button{margin:2px;background:#ffe0ec;color:#7a1f45;border:1px solid #f06595;border-radius:10px;padding:5px 10px;font:14px Georgia;cursor:pointer}
#gt button.on{background:#f06595;color:#fff}#gt select,#gt input,#gt textarea{background:#fff5f9;color:#5a1838;border:1px solid #f06595;border-radius:6px;padding:4px;font:13px Georgia}
#gt .row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}#gt .card{background:#fff0f6;border:1px solid #fcc2d7;border-radius:14px;padding:10px;margin:6px 0}
#gt label{font-size:13px;display:block;margin:4px 0}#gt .note{font-size:12px;color:#a64d79}#gt canvas.v{border-radius:14px;background:#fff;max-width:100%;box-shadow:0 2px 12px #f0659555}
#gt table{border-collapse:collapse;font-size:13px}#gt td,#gt th{border-bottom:1px solid #fcc2d7;padding:4px 6px;text-align:left}`;
document.head.appendChild(st);document.body.style.background='#ffe3ee';
const R=document.createElement('div');R.id='gt';c.parentNode.insertBefore(R,c.nextSibling);
// Only suppliers that print each single unit and ship it straight to the end customer. Prices are the supplier's own published USD figures; null = Price on request.
const SUP=[
 {k:'qpmn',n:'QPMN (QP Market Network)',url:'https://www.qpmarketnetwork.com/',wl:'Yes, white-label',tarot:null,board:null,ship:'Worldwide incl. Australia (quoted at checkout)',how:'Free account, connect store or API, order a sample'},
 {k:'tgc',n:'The Game Crafter',url:'https://help.thegamecrafter.com/article/367-selling-your-game',wl:'Ships as The Game Crafter (not white-label)',tarot:null,board:null,ship:'International incl. Australia (UPS/USPS, by weight)',how:'Free designer account, buy a proof, then Publish'},
 {k:'mpc',n:'MakePlayingCards (fulfilment service)',url:'https://www.makeplayingcards.com/mpc-fulfillment-services.aspx',wl:'Plain parcel to your customer',tarot:21.95,board:null,ship:'Worldwide; price shown at checkout',how:'Free account; use split shipment / fulfilment at checkout',pn:'78-card tarot, S30 stock, 1 deck, before packaging & shipping'},
 {k:'dtc',n:'DriveThruCards',url:'https://www.drivethrucards.com/joinchoice.php',wl:'Sold & shipped via DriveThruCards marketplace',tarot:null,board:null,ship:'Printed in Kansas City, ships international',how:'Publisher account, upload print PDF, approve proof'}];
const BACKS=['Moon & stars','Rose lattice','Coffee swirl','Sun burst','Heart mandala','Celestial eye'],BOXES=['Tuck box','Rigid lift-lid box','Velvet bag','Magnetic box'];
const THEMES={Candyland:['#ffd6e7','#f783ac'],Ocean:['#d0ebff','#4dabf7'],Forest:['#d3f9d8','#51cf66'],Space:['#e5dbff','#7950f2'],Cafe:['#fff4e6','#d9480f'],Midnight:['#343a40','#f06595']};
const MAJ=['The Fool','The Magician','The High Priestess','The Empress','The Emperor','The Hierophant','The Lovers','The Chariot','Strength','The Hermit','Wheel of Fortune','Justice','The Hanged Man','Death','Temperance','The Devil','The Tower','The Star','The Moon','The Sun','Judgement','The World'];
const MIN=[];['Wands','Cups','Swords','Pentacles'].forEach(s=>['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'].forEach(r=>MIN.push(r+' of '+s)));
const S=Object.assign({mode:'tarot',deck:22,back:0,bcol:'#f06595',box:0,title:'Karen Elizabeth Tarot',face:0,theme:'Candyland',tiles:24,tokens:4,gcards:30,booklet:8,gbox:'Rigid lift-lid box',gname:'Coffee Quest',rules:'Roll, move, collect beans. First to 10 wins.',sup:'qpmn',qty:1,names:{}},JSON.parse(localStorage.gtS||'{}'));
if(D)S.deck=22;
const IMG={};const save=()=>{localStorage.gtS=JSON.stringify(S)};
const names=()=>MAJ.concat(S.deck==78?MIN:[]);
const sup=()=>SUP.find(s=>s.k==S.sup)||SUP[0];
const price=()=>{const s=sup(),b=S.mode=='tarot'?s.tarot:s.board;return b==null?null:{base:b,sell:Math.round(b*(1+CFG.markup)*100)/100}};
const cv=document.createElement('canvas');cv.width=900;cv.height=600;cv.className='v';
function rr(q,x,y,w,h,r){q.beginPath();q.roundRect?q.roundRect(x,y,w,h,r):q.rect(x,y,w,h)}
function back(q,x,y,w,h){q.fillStyle=S.bcol;rr(q,x,y,w,h,10);q.fill();q.strokeStyle='#fff';q.lineWidth=3;rr(q,x+6,y+6,w-12,h-12,8);q.stroke();q.fillStyle='#fff';q.textAlign='center';q.font=Math.round(w*.35)+'px serif';q.fillText(['🌙','🌹','☕','☀️','💗','👁️'][S.back],x+w/2,y+h/2+w*.12);q.font='11px Georgia';q.fillText(BACKS[S.back],x+w/2,y+h-14)}
function face(q,x,y,w,h,i){const n=names()[i];q.fillStyle='#fffafc';rr(q,x,y,w,h,10);q.fill();q.strokeStyle=S.bcol;q.lineWidth=3;q.stroke();
 if(IMG[i])q.drawImage(IMG[i],x+8,y+8,w-16,h-46);else{q.fillStyle='#ffe3ee';q.fillRect(x+8,y+8,w-16,h-46);q.fillStyle=S.bcol;q.font=Math.round(w*.4)+'px serif';q.textAlign='center';q.fillText('✦',x+w/2,y+h/2)}
 q.fillStyle='#7a1f45';q.font='bold 12px Georgia';q.textAlign='center';q.fillText((S.names[i]||n).slice(0,22),x+w/2,y+h-22)}
function draw2(){const q=cv.getContext('2d');q.clearRect(0,0,900,600);const g=q.createLinearGradient(0,0,900,600);g.addColorStop(0,'#fff0f6');g.addColorStop(1,'#ffdeeb');q.fillStyle=g;q.fillRect(0,0,900,600);
 q.fillStyle='#c2255c';q.font='bold 26px Georgia';q.textAlign='left';
 if(S.mode=='tarot'){q.fillText(S.title,24,40);q.font='14px Georgia';q.fillText(S.deck+'-card deck · '+BOXES[S.box],24,62);
  back(q,30,90,180,300);face(q,240,90,180,300,S.face);face(q,450,110,160,270,(S.face+1)%names().length);face(q,640,130,140,240,(S.face+2)%names().length);
  q.fillStyle=S.bcol;rr(q,60,420,230,150,14);q.fill();q.fillStyle='#fff';q.font='bold 18px Georgia';q.textAlign='center';q.fillText(S.title.slice(0,22),175,490);q.font='13px Georgia';q.fillText(BOXES[S.box],175,515);
 }else{const [l,d]=THEMES[S.theme];q.fillText(S.gname,24,40);q.font='14px Georgia';q.fillText(S.theme+' board · '+S.tiles+' tiles · '+S.tokens+' tokens · '+S.gcards+' cards · '+S.booklet+'-page rules · '+S.gbox,24,62);
  q.fillStyle=l;q.fillRect(30,80,440,440);const n=S.tiles,per=Math.ceil(n/4),sz=400/per;for(let i=0;i<n;i++){const s=Math.floor(i/per),k=i%per;let x,y;if(s==0){x=50+k*sz;y=100}else if(s==1){x=450-sz;y=100+k*sz}else if(s==2){x=450-sz-k*sz;y=500-sz}else{x=50;y=500-sz-k*sz}q.fillStyle=i%2?d:'#fff';q.fillRect(x+1,y+1,sz-2,sz-2)}
  q.fillStyle=d;q.font='bold 22px Georgia';q.textAlign='center';q.fillText(S.gname,250,300);
  const tc=['#e64980','#4dabf7','#fab005','#40c057','#7950f2','#fd7e14'];for(let i=0;i<S.tokens;i++){q.fillStyle=tc[i];q.beginPath();q.arc(520+i*45,130,16,0,7);q.fill()}
  for(let i=0;i<3;i++){q.fillStyle='#fff';rr(q,510+i*20,180+i*10,110,160,8);q.fill();q.strokeStyle=d;q.stroke()}q.fillStyle=d;q.font='12px Georgia';q.fillText(S.gcards+' cards',580,370);
  q.fillStyle='#fff';q.fillRect(700,180,160,190);q.fillStyle='#7a1f45';q.textAlign='left';q.font='bold 13px Georgia';q.fillText('Rules ('+S.booklet+' pp)',712,204);q.font='11px Georgia';(S.rules.match(/.{1,24}(\s|$)/g)||[]).slice(0,10).forEach((t,i)=>q.fillText(t,712,224+i*14));
  q.fillStyle=d;rr(q,540,410,300,150,14);q.fill();q.fillStyle='#fff';q.textAlign='center';q.font='bold 22px Georgia';q.fillText(S.gname,690,480);q.font='13px Georgia';q.fillText(S.gbox,690,505)}
 q.fillStyle='#a64d79';q.font='12px Georgia';q.textAlign='right';q.fillText('Coffeebreak Game & Tarot Maker',880,590)}
function esc(t){return String(t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function panel(){const p=price(),s=sup();const P=document.getElementById('gtP');
 const pick=SUP.map(x=>`<option value="${x.k}" ${x.k==S.sup?'selected':''}>${esc(x.n)}</option>`).join('');
 let h=`<div class="card"><button data-m="tarot" class="${S.mode=='tarot'?'on':''}">🔮 Tarot deck</button><button data-m="board" class="${S.mode=='board'?'on':''}">🎲 Board game</button></div>`;
 if(S.mode=='tarot')h+=`<div class="card"><h3>Tarot deck</h3><label>Deck name <input id="tT" value="${esc(S.title)}"></label>
 <label>Deck size <button data-d="22" class="${S.deck==22?'on':''}">22 Major Arcana</button><button data-d="78" class="${S.deck==78?'on':''}">78 full deck${D?' 🔒':''}</button></label>
 <label>Card back ${BACKS.map((b,i)=>`<button data-b="${i}" class="${S.back==i?'on':''}">${b}${D&&i>2?' 🔒':''}</button>`).join('')}</label>
 <label>Back colour <input type="color" id="tC" value="${S.bcol}"></label><label>Box ${BOXES.map((b,i)=>`<button data-x="${i}" class="${S.box==i?'on':''}">${b}</button>`).join('')}</label>
 <label>Card face <select id="tF">${names().map((n,i)=>`<option value="${i}" ${i==S.face?'selected':''}>${i+1}. ${esc(n)}</option>`).join('')}</select></label>
 <label>Card text <input id="tN" value="${esc(S.names[S.face]||names()[S.face])}"></label><label>Upload art for this card <input type="file" id="tU" accept="image/*"></label></div>`;
 else h+=`<div class="card"><h3>Board game</h3><label>Game name <input id="bN" value="${esc(S.gname)}"></label><label>Board theme ${Object.keys(THEMES).map(t=>`<button data-t="${t}" class="${S.theme==t?'on':''}">${t}</button>`).join('')}</label>
 <label>Tiles <input type="range" id="bT" min="12" max="40" step="4" value="${S.tiles}"> ${S.tiles}</label><label>Tokens <input type="range" id="bK" min="2" max="6" value="${S.tokens}"> ${S.tokens}</label>
 <label>Cards <input type="range" id="bC" min="0" max="108" step="6" value="${S.gcards}"> ${S.gcards}</label><label>Rules booklet pages <input type="range" id="bB" min="4" max="24" step="4" value="${S.booklet}"> ${S.booklet}</label>
 <label>Rules <textarea id="bR" rows="3" cols="34">${esc(S.rules)}</textarea></label><label>Box <select id="bX">${BOXES.slice(0,2).concat(['Magnetic box']).map(b=>`<option ${b==S.gbox?'selected':''}>${b}</option>`).join('')}</select></label></div>`;
 h+=`<div class="card"><h3>📦 Dropship supplier</h3><select id="sP">${pick}</select><div class="note">${esc(s.wl)} · ${esc(s.ship)} · Sign up: ${esc(s.how)} · <a href="${s.url}" target="_blank" rel="noopener">${esc(s.url.replace('https://',''))}</a></div>
 <p><b>${p?'US$'+p.sell.toFixed(2)+' each':'Price on request'}</b>${p?` <span class="note">(supplier published US$${p.base.toFixed(2)} ${esc(s.pn||'')} + 40% markup; shipping extra)</span>`:' <span class="note">(no published single-unit price for this item, Karen will quote)</span>'}</p>
 <label>Quantity <input type="number" id="sQ" min="1" max="20" value="${S.qty}" style="width:60px"></label>
 <button data-a="png">🖼️ Save preview PNG</button><button data-a="order">💌 Order (dropship)</button><div id="pp"></div></div>`;
 P.innerHTML=h;draw2();
 const on=(id,ev,f)=>{const e=document.getElementById(id);if(e)e[ev]=f};
 on('tT','oninput',e=>{S.title=e.target.value;save();draw2()});on('tC','oninput',e=>{S.bcol=e.target.value;save();draw2()});
 on('tF','onchange',e=>{S.face=+e.target.value;save();panel()});on('tN','oninput',e=>{S.names[S.face]=e.target.value;save();draw2()});
 on('tU','onchange',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{IMG[S.face]=im;draw2()};im.src=r.result};r.readAsDataURL(f)});
 on('bN','oninput',e=>{S.gname=e.target.value;save();draw2()});on('bR','oninput',e=>{S.rules=e.target.value;save();draw2()});on('bX','onchange',e=>{S.gbox=e.target.value;save();draw2()});
 [['bT','tiles'],['bK','tokens'],['bC','gcards'],['bB','booklet']].forEach(([i,k])=>on(i,'onchange',e=>{S[k]=+e.target.value;save();panel()}));
 on('sP','onchange',e=>{S.sup=e.target.value;save();panel()});on('sQ','onchange',e=>{S.qty=Math.max(1,Math.min(20,+e.target.value||1));save();panel()})}
function text(){const p=price(),s=sup();const L=['Coffeebreak Game & Tarot Maker order','Product: '+(S.mode=='tarot'?'Tarot deck "'+S.title+'", '+S.deck+' cards, back '+BACKS[S.back]+' '+S.bcol+', '+BOXES[S.box]:'Board game "'+S.gname+'", '+S.theme+' board, '+S.tiles+' tiles, '+S.tokens+' tokens, '+S.gcards+' cards, '+S.booklet+'-page rules, '+S.gbox),
 'Quantity: '+S.qty,'Supplier (dropship): '+s.n+' '+s.url,'Price: '+(p?'US$'+(p.sell*S.qty).toFixed(2)+' + shipping':'Price on request'),'',
 'This order is forwarded to the supplier, who prints it and ships it directly to the customer. Karen will reply with the final price incl. shipping and a PayPal payment request if not paid below.','Ship to (name, address, phone): ','Card face text / art: please attach your uploaded images to this email.'];return L.join('\n')}
function order(){if(D){window.demoEnd&&demoEnd('Ordering real printed decks and games is in the full version, with the 78-card deck, all card backs and all 38 Coffeebreak songs.');return}
 const b=text();window.GT_LAST_ORDER=b;const p=price();
 const M=document.createElement('div');M.style.cssText='position:fixed;inset:0;z-index:90;background:rgba(90,24,56,.6);display:flex;align-items:center;justify-content:center';
 M.innerHTML=`<div style="max-width:580px;background:#fff0f6;color:#5a1838;border:2px solid #f06595;border-radius:14px;padding:16px;font-family:Georgia"><h3 style="color:#d6336c;margin-top:0">💌 Dropship order</h3><pre style="white-space:pre-wrap;font-size:13px">${esc(b)}</pre>
 <button id="oE">✉️ Email order to Coffeebreak</button><button id="oX">Close</button><div id="ppb" style="margin-top:8px"></div><p style="font-size:11px">PayPal is in TEST (sandbox) mode until live codes are added.</p></div>`;document.body.appendChild(M);
 M.querySelector('#oX').onclick=()=>M.remove();M.querySelector('#oE').onclick=()=>{location.href='mailto:'+CFG.orderEmail+'?subject='+encodeURIComponent('Dropship order: '+(S.mode=='tarot'?S.title:S.gname))+'&body='+encodeURIComponent(b)};
 if(p&&navigator.onLine){const sc=document.createElement('script');sc.src='https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(CFG.paypalClientId)+'&currency='+CFG.currency;sc.onload=()=>{try{paypal.Buttons({createOrder:(d,a)=>a.order.create({purchase_units:[{description:'Coffeebreak custom '+S.mode,amount:{value:(p.sell*S.qty).toFixed(2)}}]}),onApprove:(d,a)=>a.order.capture().then(()=>{M.querySelector('#ppb').innerHTML='✅ Paid. Now tap Email order so Karen can forward it.'})}).render(M.querySelector('#ppb'))}catch(e){}};document.head.appendChild(sc)}}
R.innerHTML=`<h2>🔮🎲 Coffeebreak Game & Tarot Maker</h2><div class="row"><div id="gtV"></div><div id="gtP" style="flex:1;min-width:320px"></div></div>
<div class="card note">Real printed products are made on demand by the supplier you pick and shipped straight to the customer. Use only artwork you own or have rights to. Prices are suppliers' published prices plus 40%; shipping and any GST/import charges are confirmed by email.</div>`;
document.getElementById('gtV').appendChild(cv);
R.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;window.startMusic&&startMusic();
 if(t.dataset.m){S.mode=t.dataset.m}else if(t.dataset.d){if(D&&t.dataset.d=='78'){window.demoEnd&&demoEnd('The full 78-card deck is in the full version.');return}S.deck=+t.dataset.d;S.face=Math.min(S.face,names().length-1)}
 else if(t.dataset.b){if(D&&+t.dataset.b>2){window.demoEnd&&demoEnd('All 6 card backs are in the full version.');return}S.back=+t.dataset.b}else if(t.dataset.x)S.box=+t.dataset.x;else if(t.dataset.t)S.theme=t.dataset.t;
 else if(t.dataset.a=='png'){const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download='coffeebreak-'+S.mode+'-preview.png';a.click();return}else if(t.dataset.a=='order'){order();return}else return;save();panel()});
panel();window.GT={S,panel,text,price,SUP,cv};
})();
function update(){}function draw(){}
