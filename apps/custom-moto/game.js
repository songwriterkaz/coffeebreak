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
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#f5a623'):(o.bg||'#2b2118');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#f5a623';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#151515':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,240,215,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Custom Moto =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';const SK=D?'motoDemo':'motoSave';
const st=document.createElement('style');st.textContent=`
#mo{flex:1;width:100%;max-width:1180px;overflow:auto;padding:10px 12px 96px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#mo h1,#mo h2,#mo h3{color:#f5a623;margin:6px 0 8px}
#mo button{background:#2b2118;color:#ffe9c7;border:1px solid #f5a623;border-radius:10px;padding:7px 11px;font:14px Georgia;cursor:pointer;margin:2px}
#mo button.on,#mo button.primary{background:#f5a623;color:#151515;font-weight:bold}
#mo button.lock{opacity:.5}
#mo input,#mo textarea{background:#22101a;color:#ffe9c7;border:1px solid #f5a623;border-radius:8px;padding:6px 8px;font:14px Georgia;box-sizing:border-box;width:100%;margin:2px 0}
#mo .wrap{display:flex;gap:14px;flex-wrap:wrap}#mo .ctl{flex:1 1 360px}#mo .pv{flex:1 1 560px;text-align:center}
#mo canvas.prev{width:100%;max-width:680px;border-radius:14px;border:2px solid #f5a623;background:#fbeef2}
#mo .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:14px;padding:10px 12px;margin:8px 0}
#mo .note{font-size:13px;color:#d9b8c0;line-height:1.45}
#moMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#f5a623;color:#151515;padding:8px 14px;border-radius:10px;display:none;z-index:50;font:15px Georgia}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='mo';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='moMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
const O={
 style:[['cafe','Café racer'],['bobber','Bobber'],['scrambler','Scrambler'],['tracker','Street tracker'],['chopper','Chopper'],['brat','Brat'],['tourer','Classic tourer']],
 paint:[['#c9a0dc','Lilac'],['#111111','Gloss black'],['#f5f0e6','Cream'],['#8b1e3f','Burgundy'],['#5a7d6a','Sage'],['#c0c0c0','Silver'],['#2b4c7e','Navy']],
 finish:[['gloss','Gloss'],['matte','Matte'],['pearl','Pearl'],['metal','Metal flake']],
 seat:[['brown','Brown leather'],['black','Black leather'],['cream','Cream tuck-and-roll'],['solo','Solo sprung seat']],
 bars:[['clip','Clip-ons'],['drag','Drag bars'],['tracker','Tracker bars'],['ape','Ape hangers'],['beach','Beach bars']],
 wheels:[['spoke','Wire spokes'],['cast','Cast alloy'],['white','White-wall spokes'],['solid','Solid disc']],
 exhaust:[['upswept','Upswept'],['shorty','Shorty megaphone'],['twin','Twin straight'],['high','High scrambler'],['fishtail','Fishtail']],
 lights:[['round','Round 7" headlight'],['led','LED halo'],['twin','Twin pods'],['number','Number-board'],['bullet','Bullet']],
 theme:[['none','No theme'],['coffeebreak','Coffeebreak'],['karen','Karen Elizabeth']]};
const LBL={style:'Style',paint:'Paint',finish:'Finish',seat:'Seat',bars:'Handlebars',wheels:'Wheels',exhaust:'Exhaust',lights:'Lights',theme:'Theme'};
const DEMO_OK={style:['cafe','bobber'],theme:['none','coffeebreak']};
let S;try{S=JSON.parse(localStorage[SK]||'')}catch(e){}
S=S||{d:{style:'cafe',paint:'#8b1e3f',finish:'pearl',seat:'black',bars:'clip',wheels:'spoke',exhaust:'upswept',lights:'round',theme:'coffeebreak',base:'',name:'',email:'',phone:'',suburb:'',budget:'',notes:''},saved:[]};
const d=()=>S.d;function save(){localStorage[SK]=JSON.stringify(S)}
const nm=(k,v)=>(O[k].find(o=>o[0]===v)||[v,v])[1];
function bike(g,W2,H2){const s=d();g.save();g.fillStyle='#fbeef2';g.fillRect(0,0,W2,H2);g.scale(W2/680,H2/420);
 g.fillStyle='#e8c5cf';g.fillRect(0,350,680,70);
 const lift=s.style==='scrambler'?14:s.style==='chopper'?-6:0,fx=s.style==='chopper'?560:520,rx=160;const wy=300-lift,R=s.style==='bobber'||s.style==='chopper'?62:58;
 function wheel(cx){g.lineWidth=16;g.strokeStyle='#1b1b1b';g.beginPath();g.arc(cx,wy,R,0,7);g.stroke();if(s.wheels==='white'){g.lineWidth=6;g.strokeStyle='#fff';g.beginPath();g.arc(cx,wy,R-9,0,7);g.stroke()}
  if(s.wheels==='solid'){g.fillStyle=s.paint;g.beginPath();g.arc(cx,wy,R-12,0,7);g.fill()}else{g.lineWidth=s.wheels==='cast'?7:1.4;g.strokeStyle='#bbb';const n=s.wheels==='cast'?5:28;for(let i=0;i<n;i++){const a=i/n*6.283;g.beginPath();g.moveTo(cx,wy);g.lineTo(cx+Math.cos(a)*(R-10),wy+Math.sin(a)*(R-10));g.stroke()}}
  g.fillStyle='#777';g.beginPath();g.arc(cx,wy,9,0,7);g.fill()}
 wheel(rx);wheel(fx);
 g.strokeStyle='#2a2a2a';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(rx,wy);g.lineTo(300,250);g.lineTo(440,200);g.moveTo(rx,wy);g.lineTo(250,200);g.lineTo(440,200);g.stroke();
 g.strokeStyle='#999';g.lineWidth=8;g.beginPath();g.moveTo(fx,wy);g.lineTo(s.style==='chopper'?440:465,s.style==='chopper'?150:170);g.stroke();
 g.fillStyle='#555';g.fillRect(300,225,90,70);g.fillStyle='#777';for(let i=0;i<4;i++)g.fillRect(305,215-i*9,80,5);
 g.strokeStyle='#cfcfcf';g.lineWidth=11;g.beginPath();const ex=s.exhaust;
 if(ex==='high'){g.moveTo(340,230);g.lineTo(300,175);g.lineTo(150,180)}else if(ex==='upswept'){g.moveTo(340,290);g.lineTo(220,300);g.lineTo(120,250)}else if(ex==='shorty'){g.moveTo(340,290);g.lineTo(240,305)}else if(ex==='twin'){g.moveTo(340,290);g.lineTo(110,310);g.moveTo(345,300);g.lineTo(110,325)}else{g.moveTo(340,290);g.lineTo(150,300)}g.stroke();
 if(ex==='shorty'){g.fillStyle='#bbb';g.beginPath();g.moveTo(240,293);g.lineTo(190,286);g.lineTo(190,326);g.lineTo(240,317);g.fill()}if(ex==='fishtail'){g.fillStyle='#bbb';g.beginPath();g.moveTo(150,292);g.lineTo(105,282);g.lineTo(105,318);g.lineTo(150,308);g.fill()}
 let grd=g.createLinearGradient(330,150,470,210);grd.addColorStop(0,s.paint);grd.addColorStop(s.finish==='pearl'?.5:.9,s.finish==='matte'?s.paint:'#ffffff');grd.addColorStop(1,s.paint);
 g.fillStyle=s.finish==='gloss'||s.finish==='matte'?s.paint:grd;g.beginPath();g.ellipse(395,182,s.style==='chopper'?52:72,30,-.08,0,7);g.fill();
 if(s.finish==='gloss'){g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(380,168,40,7,-.08,0,7);g.fill()}
 if(s.finish==='metal'){g.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<60;i++){g.fillRect(335+Math.random()*120,160+Math.random()*44,2,2)}}
 const sc={brown:'#6b4226',black:'#1a1a1a',pink:'#f06292',cream:'#f3e6c8',solo:'#4a2c1a'}[s.seat];g.fillStyle=sc;
 if(s.style==='cafe'){g.beginPath();g.moveTo(320,190);g.lineTo(220,195);g.quadraticCurveTo(195,180,205,160);g.lineTo(225,175);g.lineTo(320,175);g.fill();g.fillStyle=s.paint;g.beginPath();g.moveTo(205,160);g.quadraticCurveTo(190,190,225,198);g.lineTo(240,180);g.fill()}
 else if(s.seat==='solo'||s.style==='bobber'||s.style==='chopper'){g.beginPath();g.ellipse(295,185,32,11,0,0,7);g.fill();g.strokeStyle='#999';g.lineWidth=3;g.beginPath();g.moveTo(285,196);g.lineTo(285,212);g.moveTo(305,196);g.lineTo(305,212);g.stroke()}
 else{rr2(g,200,170,125,22,9);g.fill()}
 if(s.seat==='pink'||s.seat==='cream'){g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1;for(let i=0;i<6;i++){g.beginPath();g.moveTo(215+i*16,172);g.lineTo(225+i*16,190);g.stroke()}}
 g.fillStyle=s.paint;g.beginPath();g.arc(rx,wy,R+8,3.4,4.9);g.lineTo(rx,wy);g.fill();
 const hy=s.style==='chopper'?150:170,hx=s.style==='chopper'?440:465;g.strokeStyle='#ccc';g.lineWidth=6;g.beginPath();
 const bb=s.bars;if(bb==='clip'){g.moveTo(hx,hy+12);g.lineTo(hx-45,hy+16)}else if(bb==='ape'){g.moveTo(hx,hy);g.lineTo(hx-5,hy-75);g.lineTo(hx-45,hy-80)}else if(bb==='tracker'){g.moveTo(hx,hy);g.lineTo(hx-10,hy-30);g.lineTo(hx-50,hy-34)}else if(bb==='beach'){g.moveTo(hx,hy);g.lineTo(hx-20,hy-20);g.lineTo(hx-70,hy-22)}else{g.moveTo(hx,hy);g.lineTo(hx-55,hy-4)}g.stroke();
 g.fillStyle='#fff8d0';const L=s.lights;if(L==='number'){g.fillStyle='#fff';rr2(g,hx+5,hy-15,40,48,8);g.fill();g.fillStyle='#e75480';g.font='bold 26px Georgia';g.textAlign='center';g.fillText('8',hx+25,hy+19)}else if(L==='twin'){g.beginPath();g.arc(hx+16,hy-4,11,0,7);g.arc(hx+16,hy+20,11,0,7);g.fill()}else{const r=L==='bullet'?11:18;g.strokeStyle='#999';g.lineWidth=4;g.beginPath();g.arc(hx+18,hy+6,r,0,7);g.fill();g.stroke();if(L==='led'){g.strokeStyle='#9ef';g.lineWidth=3;g.beginPath();g.arc(hx+18,hy+6,r-5,0,7);g.stroke()}}
 if(s.theme!=='none'){g.save();g.translate(395,183);g.rotate(-.08);g.fillStyle=s.theme==='karen'?'#fff':'#ffffff';g.font=(s.theme==='karen'?'italic ':'bold ')+'15px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(s.theme==='karen'?'Karen Elizabeth':'☕ Coffeebreak',0,0);g.restore();
  g.fillStyle='#e75480';g.font='22px serif';g.textAlign='center';['♥','✿','♥'].forEach((h,i)=>g.fillText(h,40+i*300,40+i%2*20));}
 g.fillStyle='#6d1f33';g.font='bold 20px Georgia';g.textAlign='left';g.fillText(nm('style',s.style)+' · '+nm('paint',s.paint)+' '+nm('finish',s.finish),16,400);
 g.restore()}
function rr2(g,X,Y,w,h,r){g.beginPath();g.roundRect(X,Y,w,h,r)}
function summary(){const s=d();return ['COFFEEBREAK CUSTOM MOTO — QUOTE REQUEST (not an order, no payment taken)',...Object.keys(LBL).map(k=>LBL[k]+': '+nm(k,s[k])),'Base bike / donor: '+(s.base||'(builder to suggest)'),'Name: '+s.name,'Email: '+s.email,'Phone: '+s.phone,'Suburb/State: '+s.suburb,'Budget (AUD): '+(s.budget||'not given'),'Notes: '+(s.notes||'-'),'','Please forward to the partner builder for a written quote. The builder quotes, builds, certifies/registers and delivers.'].join('\n')}
function orderLink(){const s=d();return 'mailto:songwriterkaz@gmail.com?subject='+encodeURIComponent('Custom Moto quote request — '+(s.name||'Coffeebreak'))+'&body='+encodeURIComponent(summary())}
function sheetCanvas(){const cv=document.createElement('canvas');cv.width=1600;cv.height=1000;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1600,1000);
 g.fillStyle='#e75480';g.font='bold 42px Georgia';g.fillText('Coffeebreak Custom Moto — Spec Sheet',40,64);const b=document.createElement('canvas');b.width=1020;b.height=630;bike(b.getContext('2d'),1020,630);g.drawImage(b,30,100);
 g.fillStyle='#222';g.font='20px Georgia';let y=130;summary().split('\n').slice(1,15).forEach(l=>{g.fillText(l.slice(0,48),1080,y);y+=34});
 g.fillStyle='#6d1f33';g.font='italic 18px Georgia';['Concept only. Final design, parts, price and timeline are set by the builder\'s written quote.','The builder builds, arranges certification/registration (ADR / VSCCS where needed) and delivers.','Coffeebreak passes your request on and does not sell or deliver motorcycles itself.'].forEach((l,i)=>g.fillText(l,40,800+i*34));
 g.fillStyle='#888';g.font='14px Georgia';g.fillText('Created '+new Date().toLocaleDateString()+' · coffeebreaks.itch.io',40,970);return cv}
function exportSheet(){if(D){window.demoEnd&&window.demoEnd('The spec sheet PNG is in the full <b>Coffeebreak Custom Moto</b>.');return}const a=document.createElement('a');a.download='coffeebreak-custom-moto-spec.png';a.href=sheetCanvas().toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();say('Spec sheet saved')}
function locked(k,v){return D&&DEMO_OK[k]&&!DEMO_OK[k].includes(v)}
function draw(){const s=d();
 R.innerHTML=`<h1>🏍️ Coffeebreak Custom Moto</h1><div class="wrap"><div class="ctl">${Object.keys(O).map(k=>`<div class="card"><h3>${LBL[k]}</h3>${O[k].map(o=>k==='paint'?`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''}" title="${o[1]}" style="background:${o[0]};width:30px;height:30px;border-radius:50%;padding:0"></button>`:`<button data-k="${k}" data-v="${o[0]}" class="${s[k]===o[0]?'on':''} ${locked(k,o[0])?'lock':''}">${esc(o[1])}${locked(k,o[0])?' 🔒':''}</button>`).join('')}</div>`).join('')}</div>
 <div class="pv"><canvas id="moC" class="prev" width="680" height="420"></canvas><div><button class="primary" id="moSheet">📄 Spec sheet PNG</button><button id="moSave">💾 Save design</button></div>
 <div class="card" style="text-align:left"><h3>Request a quote</h3><input id="f_base" placeholder="Base bike (optional, e.g. a bike you already own)" value="${esc(s.base)}"><input id="f_name" placeholder="Your name" value="${esc(s.name)}"><input id="f_email" placeholder="Email" value="${esc(s.email)}"><input id="f_phone" placeholder="Phone" value="${esc(s.phone)}"><input id="f_suburb" placeholder="Suburb / State" value="${esc(s.suburb)}"><input id="f_budget" placeholder="Rough budget (AUD)" value="${esc(s.budget)}"><textarea id="f_notes" placeholder="Anything else?">${esc(s.notes)}</textarea>
 <button class="primary" id="moOrder">✉️ Request a quote</button>
 <p class="note"><b>How it works, honestly:</b> this is a design tool and quote request, not a shop checkout. Your design goes to Coffeebreak, and we pass it to an independent licensed custom builder. <b>The builder gives you a written quote, builds the bike, handles certification and registration (ADR/VSCCS where needed) and delivers it to you.</b> You pay and contract with the builder directly. No price is shown here because every build is quoted individually.</p></div>
 ${S.saved.length?`<div class="card" style="text-align:left"><h3>Saved designs</h3>${S.saved.map((x,i)=>`<button data-load="${i}">${esc(x.label)}</button>`).join('')}</div>`:''}</div></div>`;
 bike(document.getElementById('moC').getContext('2d'),680,420);
 R.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k,v=b.dataset.v;if(locked(k,v)){window.demoEnd&&window.demoEnd('All 7 styles and the Karen Elizabeth theme are in the full <b>Coffeebreak Custom Moto</b>.');return}s[k]=v;save();draw()});
 ['base','name','email','phone','suburb','budget','notes'].forEach(f=>{const el=document.getElementById('f_'+f);el.oninput=()=>{s[f]=el.value;save()}});
 document.getElementById('moSheet').onclick=exportSheet;
 document.getElementById('moSave').onclick=()=>{if(D&&S.saved.length>=1){window.demoEnd&&window.demoEnd('Save unlimited designs in the full <b>Coffeebreak Custom Moto</b>.');return}S.saved.unshift({label:nm('style',s.style)+' '+nm('paint',s.paint),d:JSON.parse(JSON.stringify(s))});save();say('Design saved');draw()};
 R.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>{S.d=JSON.parse(JSON.stringify(S.saved[+b.dataset.load].d));save();draw()});
 document.getElementById('moOrder').onclick=()=>{if(!s.name||!s.email){say('Add your name and email first');return}const u=orderLink();window.__opened=u;window.open(u,'_blank');say('Opening your email app…')}}
window.MO={get S(){return S},draw,summary,orderLink,sheetCanvas};
save();draw();
})();
function update(){}function draw(){}
