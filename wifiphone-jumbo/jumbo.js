'use strict';
/* Coffeebreak Jumbo WiFi Phone: huge text and buttons, text size bar under the header, high contrast, landscape sidebar, One Button back button above the menu. */
(function(){
const O=s=>document.querySelector(s);
const K={g:(k,d)=>{try{const v=JSON.parse(localStorage.getItem('cbjb_'+k));return v==null?d:v}catch(e){return d}},s:(k,v)=>{try{localStorage.setItem('cbjb_'+k,JSON.stringify(v))}catch(e){}}};
const STEPS=[1,1.15,1.3,1.5,1.75];
const css=document.createElement('style');css.id='jbcss';css.textContent=`
:root{--z:1.3}
html{font-size:calc(16px*var(--z))}
body{max-width:960px;font-size:calc(20px*var(--z));line-height:1.35}
header{padding:12px 18px}header img{height:calc(48px*var(--z))}header .n{font-size:calc(22px*var(--z))}header small{font-size:calc(14px*var(--z))}
#st{font-size:calc(16px*var(--z));padding:6px 14px;border-radius:16px}
nav button{font-size:calc(20px*var(--z));padding:calc(16px*var(--z)) 4px calc(20px*var(--z));min-height:calc(64px*var(--z))}
.badge{font-size:calc(16px*var(--z));padding:2px 9px}
.sub{gap:10px;flex-wrap:wrap}.sub button{font-size:calc(20px*var(--z));padding:calc(14px*var(--z)) 10px;border-radius:26px;min-height:calc(56px*var(--z));border-width:2px}
.btn{font-size:calc(22px*var(--z))!important;padding:calc(16px*var(--z)) calc(22px*var(--z))!important;border-radius:30px;min-height:calc(60px*var(--z))}
.pad{max-width:calc(520px*var(--z));gap:calc(18px*var(--z))}.pad button{height:calc(100px*var(--z));font-size:calc(44px*var(--z))}
#dial{font-size:calc(44px*var(--z));min-height:calc(64px*var(--z))}
.round{width:calc(96px*var(--z));height:calc(96px*var(--z));font-size:calc(40px*var(--z))}
.row{padding:calc(16px*var(--z));gap:16px;border-radius:18px}.row .who span{font-size:calc(16px*var(--z))}.row button{width:calc(64px*var(--z));height:calc(64px*var(--z));font-size:calc(28px*var(--z))}
input,textarea,select{font-size:calc(22px*var(--z))!important;padding:calc(14px*var(--z))!important;border-width:2px}
.note{font-size:calc(17px*var(--z));padding:14px;border-left-width:8px}
.m{font-size:calc(22px*var(--z));max-width:85%}.m i{font-size:calc(14px*var(--z))}
#chat .top button{font-size:calc(34px*var(--z))}
.kp{grid-template-columns:repeat(3,calc(110px*var(--z)))}.kp button{height:calc(110px*var(--z));font-size:calc(46px*var(--z))}
#cbx .bar input,#cbp input,#cbp textarea{font-size:calc(22px*var(--z))}
#cbx .fl button{font-size:calc(20px*var(--z));padding:calc(16px*var(--z))}
.cbav{width:calc(76px*var(--z));height:calc(76px*var(--z));font-size:calc(32px*var(--z))}
.cbr{padding:calc(14px*var(--z));gap:16px;font-size:calc(22px*var(--z))}.cbr span{font-size:calc(16px*var(--z))}
#cbp .big{width:calc(190px*var(--z));height:calc(190px*var(--z));font-size:calc(80px*var(--z))}
#cbp .acts button,#cbp .acts a{font-size:calc(40px*var(--z));padding:calc(20px*var(--z)) 4px}#cbp .acts small{font-size:calc(17px*var(--z))}
#cbp .inf{font-size:calc(22px*var(--z));padding:16px}#cbp .inf span{font-size:calc(16px*var(--z))}
#cbp,#chat,#call,#guest,#connect,#lock,#obset{max-width:960px}
#ob #obwho{font-size:calc(34px*var(--z))}#ob #obst{font-size:calc(56px*var(--z))}#obhint{font-size:calc(26px*var(--z))!important}#obnote{font-size:calc(16px*var(--z))!important;max-width:760px!important}
#obmore{font-size:calc(22px*var(--z));padding:calc(12px*var(--z)) calc(24px*var(--z))}
.obx{width:calc(120px*var(--z));height:calc(120px*var(--z));font-size:calc(44px*var(--z))}.obxl{font-size:calc(18px*var(--z));max-width:calc(120px*var(--z))}
#obset button.big{font-size:calc(28px*var(--z));padding:calc(18px*var(--z))}.obpick{font-size:calc(26px*var(--z))}.obpick img,.obpick span.i{width:calc(76px*var(--z));height:calc(76px*var(--z))}
#obback{font-size:calc(22px*var(--z))!important;padding:calc(14px*var(--z)) calc(22px*var(--z))!important;bottom:calc(var(--navh,80px) + 12px)!important;left:calc(var(--navw,0px) + 14px)!important}
.rpcard{font-size:calc(18px*var(--z))}
#jb{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 18px;background:#fff0f5;border-bottom:3px solid var(--hot);position:relative;z-index:40}
#jb button{font-family:inherit;font-weight:800;border:3px solid var(--brown);background:#fff;color:var(--brown);border-radius:30px;min-width:calc(64px*var(--z));min-height:calc(56px*var(--z));font-size:calc(22px*var(--z));padding:0 calc(18px*var(--z))}
#jb button[aria-pressed=true]{background:var(--brown);color:#fff}
#jb .lab{font-weight:800;font-size:calc(20px*var(--z))}
#jbfold{position:fixed;z-index:41;right:14px;top:calc(var(--hh,60px) + 8px);border:3px solid var(--brown);background:#fff0f5;color:var(--brown);border-radius:30px;font-weight:800;font-size:calc(20px*var(--z));padding:calc(8px*var(--z)) calc(18px*var(--z));display:none}
body.jbfolded #jb{display:none}body.jbfolded #jbfold{display:block}
/* high contrast */
body.jbhc{--cream:#fff;--brown:#000;--mid:#000;--pink:#ffe600;--hot:#b00020;background:#fff;color:#000}
body.jbhc header{background:#000}body.jbhc header .n{color:#ffe600}
body.jbhc nav{background:#000}body.jbhc nav button{color:#fff}body.jbhc nav button.act{color:#000;background:#ffe600}
body.jbhc .sub button,body.jbhc .row,body.jbhc .m,body.jbhc .cbr,body.jbhc #cbp .inf{border:3px solid #000;background:#fff;color:#000}
body.jbhc .sub button.act{background:#ffe600;color:#000}
body.jbhc .m.me{background:#ffe600}body.jbhc .note{background:#fff;border:3px solid #000;border-left-width:10px;color:#000}
body.jbhc .row .who span,body.jbhc .cbr span,body.jbhc small{color:#000;opacity:1}
body.jbhc input{border:3px solid #000;background:#fff;color:#000}
body.jbhc #ob{background:#fff;color:#000}body.jbhc #obbtn{background-color:#ffe600;border-color:#000}
body.jbhc #jb{background:#ffe600;border-bottom-color:#000}body.jbhc #jbfold{background:#ffe600}
body.jbhc button:focus-visible,body.jbhc a:focus-visible{outline:5px solid #b00020}
/* landscape tablets and TVs: menu on the side, contacts in a grid */
@media (orientation:landscape) and (min-width:760px){
 body{max-width:none;display:grid;grid-template-columns:calc(250px*var(--z)) 1fr;grid-template-rows:auto auto auto auto auto minmax(0,1fr);box-shadow:none}
 header{grid-column:1/-1;grid-row:1}#jb{grid-column:1/-1;grid-row:2}#errbar{grid-column:1/-1;grid-row:3}#fullbar{grid-column:1/-1;grid-row:4}#portal{grid-column:1/-1;grid-row:5}
 nav{grid-column:1;grid-row:6;flex-direction:column;justify-content:flex-start;gap:8px;padding:12px 8px;overflow:auto}
 nav button{flex:none;text-align:left;padding:calc(18px*var(--z)) 16px;border-radius:18px;min-height:calc(72px*var(--z))}
 nav button.act{background:rgba(255,255,255,.14)}body.jbhc nav button.act{background:#ffe600}
 main{grid-column:2;grid-row:6;padding-bottom:40px}
 #cbp,#chat,#call,#guest,#connect,#lock,#obset{max-width:none}
 #cbx #cbl{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(340px*var(--z)),1fr));gap:10px}
 #cbx #cbl .cbl{grid-column:1/-1}
 #jbfold{top:calc(var(--hh,60px) + 8px)}
}
`;
document.head.appendChild(css);
document.documentElement.style.setProperty('--z',String(K.g('z',1.3)));
/* bar under the header */
const bar=document.createElement('div');bar.id='jb';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Text size and contrast');
bar.innerHTML='<span class="lab">Aa Text size</span><button id="jbm" aria-label="Smaller text">A−</button><button id="jbp" aria-label="Bigger text">A+</button><button id="jbhc" aria-pressed="false">High contrast</button><button id="jbx" aria-label="Fold this bar away">Fold ▲</button>';
const hd=O('header');hd.after(bar);
const fold=document.createElement('button');fold.id='jbfold';fold.textContent='Aa';fold.setAttribute('aria-label','Show text size bar');document.body.appendChild(fold);
function setZ(z){z=Math.max(STEPS[0],Math.min(STEPS[STEPS.length-1],z));K.s('z',z);document.documentElement.style.setProperty('--z',String(z));measure()}
function idx(){const z=K.g('z',1.3);let b=0;STEPS.forEach((s,i)=>{if(Math.abs(s-z)<Math.abs(STEPS[b]-z))b=i});return b}
O('#jbm').onclick=()=>setZ(STEPS[Math.max(0,idx()-1)]);
O('#jbp').onclick=()=>setZ(STEPS[Math.min(STEPS.length-1,idx()+1)]);
function setHC(on){K.s('hc',!!on);document.body.classList.toggle('jbhc',!!on);O('#jbhc').setAttribute('aria-pressed',on?'true':'false')}
O('#jbhc').onclick=()=>setHC(!K.g('hc',false));
function setFold(f){K.s('fold',!!f);document.body.classList.toggle('jbfolded',!!f);measure()}
O('#jbx').onclick=()=>setFold(true);fold.onclick=()=>setFold(false);
setHC(K.g('hc',false));setFold(K.g('fold',false));
/* keep the One Button back button above the menu: measure the menu */
function measure(){const n=O('nav'),h=O('header');if(!n)return;const r=n.getBoundingClientRect(),land=r.width<window.innerWidth*0.6&&r.height>r.width;
 const rs=document.documentElement.style;
 rs.setProperty('--navh',land?'0px':Math.round(window.innerHeight-r.top)+'px');
 rs.setProperty('--navw',land?Math.round(r.right)+'px':'0px');
 rs.setProperty('--hh',Math.round(h.getBoundingClientRect().bottom)+'px')}
window.addEventListener('resize',measure);window.addEventListener('orientationchange',()=>setTimeout(measure,200));
if(window.ResizeObserver){const ro=new ResizeObserver(measure);ro.observe(O('nav'));ro.observe(document.body)}
setInterval(measure,1500);setTimeout(measure,100);
const ob=O('#ob');if(ob){const q=document.createElement('div');q.id='jbq';q.style.cssText='position:absolute;top:10px;left:12px;display:flex;gap:8px;z-index:2';q.innerHTML='<button id="jbq1" aria-label="Smaller text" style="font-weight:800;font-size:22px;border:3px solid #3b2417;background:#fff;border-radius:26px;padding:8px 16px;color:#3b2417">A−</button><button id="jbq2" aria-label="Bigger text" style="font-weight:800;font-size:22px;border:3px solid #3b2417;background:#fff;border-radius:26px;padding:8px 16px;color:#3b2417">A+</button>';ob.appendChild(q);O('#jbq1').onclick=()=>O('#jbm').click();O('#jbq2').onclick=()=>O('#jbp').click()}
window.cbJumbo={setZ,setHC,setFold,measure};
})();
