(function(){
var C=window.CB_GAME||{},K='cbStats_'+(C.key||'game'),YT='https://www.youtube.com/@coffeebreakTVSERIES?sub_confirmation=1',TIP='https://songwriterkaz.github.io/coffeebreak/apps/clips/';
function load(){try{return Object.assign(def(),JSON.parse(localStorage.getItem(K)||'{}'))}catch(e){return def()}}
function def(){return {played:0,best:null,last:null,time:0,level:0,songs:0}}
var S=load();function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
window.CB_STATS={get:function(){return S},key:K};
// songs heard: count each new track started
var lastSrc=null,op=HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play=function(){try{var s=this.currentSrc||this.src||'';if(this.tagName!=='VIDEO'&&/assets\/music\//.test(s)&&s!==lastSrc){lastSrc=s;S.songs++;save();}}catch(e){}return op.apply(this,arguments)};
var st={state:'title'},prev='title',tick=Date.now();
function rd(){try{return C.read()||{}}catch(e){return {}}}
setInterval(function(){
  var r=rd(),s=r.state||'title',now=Date.now();
  if(s==='play'&&!document.hidden)S.time+=(now-tick)/1000;
  tick=now;
  if(r.level&&r.level>S.level)S.level=r.level;
  if(s==='play'&&prev!=='play'&&!(C.resumeStates||[]).includes(prev))S.played++;
  if(typeof r.score==='number'){if(s==='play'||s==='over'){if(S.best===null||r.score>S.best)S.best=r.score}}
  if(s==='over'&&prev!=='over')S.last=r.score;
  if(s==='play'&&typeof r.score==='number')S.cur=r.score;
  if(prev==='play'&&s!=='play'&&s!=='over'&&s!==undefined&&S.cur!=null&&!(C.resumeStates||[]).includes(s))S.last=S.cur;
  prev=s;save();
  var show=(s==='title'||s==='over');bar.style.display='none';
  if(panel.style.display!=='none')fill();
},500);
function fmt(t){t=Math.round(t);var h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return (h?h+'h ':'')+m+'m '+x+'s'}
var css='.cbx{border:0;border-radius:10px;font:bold 13px sans-serif;cursor:pointer;padding:6px 10px;text-decoration:none;display:inline-block;color:#1a0a10}';
var stl=document.createElement('style');stl.textContent=css+'.cbx:focus{outline:none}';document.head.appendChild(stl);
function btn(txt,bg,fg,href){var b=document.createElement(href?'a':'button');b.className='cbx';b.textContent=txt;b.tabIndex=-1;b.style.background=bg;if(fg)b.style.color=fg;if(href){b.href=href;b.target='_blank';b.rel='noopener'}
 b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('keydown',function(e){e.preventDefault()});b.addEventListener('click',function(e){e.stopPropagation();b.blur()});return b}
function statsBtn(t){var b=btn(t,'#ffe9c7');b.addEventListener('click',function(){panel.style.display=panel.style.display==='none'?'block':'none';fill()});return b}
// corner
var cor=document.createElement('div');cor.id='cbCorner';cor.style.cssText='position:fixed;right:8px;bottom:8px;z-index:98;display:flex;gap:5px';
cor.appendChild(statsBtn('📊'));cor.appendChild(btn('☕ Tip','#ffcf6a',null,TIP));cor.appendChild(btn('▶ Subscribe','#e62117','#fff',YT));
// title/over bar
var bar=document.createElement('div');bar.id='cbBar';bar.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:52px;z-index:97;display:flex;flex-direction:column;align-items:center;gap:6px;background:rgba(26,10,16,.85);border:2px solid #e8a0b0;border-radius:14px;padding:8px 12px;color:#ffe9c7;font:13px Georgia,serif;text-align:center;max-width:92vw';
var row=document.createElement('div');row.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center';
row.appendChild(statsBtn('📊 Stats'));row.appendChild(btn('☕ Tip Coffeebreak','#ffcf6a',null,TIP));row.appendChild(btn('▶ Subscribe on YouTube','#e62117','#fff',YT));
bar.innerHTML='<div>Enjoying it? Tips help Coffeebreak make more games ♥</div><div>Subscribe to Coffeebreak TV Series!</div>';bar.insertBefore(row,bar.firstChild);
// panel
var panel=document.createElement('div');panel.id='cbStatsPanel';panel.style.cssText='display:none;position:fixed;right:8px;bottom:48px;z-index:99;width:260px;background:#1a0a10;border:2px solid #e8a0b0;border-radius:12px;padding:10px;color:#ffe9c7;font:14px Georgia,serif';
function fill(){panel.innerHTML='<b style="color:#e8a0b0">📊 '+(C.name||'Your')+' stats</b><table style="width:100%;margin-top:6px">'+
 [['Games played',S.played],['Best score',S.best==null?'–':S.best],['Last score',S.last==null?'–':S.last],['Total time played',fmt(S.time)],[C.levelLabel||'Highest level',S.level||'–'],['Songs heard',S.songs]].map(function(r){return '<tr><td>'+r[0]+'</td><td style="text-align:right">'+r[1]+'</td></tr>'}).join('')+'</table>';
 var rs=btn('Reset stats','#e8a0b0');rs.style.marginTop='6px';rs.addEventListener('click',function(){if(confirm('Reset all stats for this game?')){S=def();save();fill()}});
 var cl=btn('Close','#ffe9c7');cl.style.margin='6px 0 0 6px';cl.addEventListener('click',function(){panel.style.display='none'});panel.appendChild(rs);panel.appendChild(cl)}
function mount(){document.body.appendChild(cor);document.body.appendChild(bar);document.body.appendChild(panel)}
if(document.body)mount();else addEventListener('DOMContentLoaded',mount);
})();
(function(){
var C=window.CB_GAME||{},KEY='cbUI_'+(C.key||'game'),SH=34,MH=14;
var st;try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){st={}}
function sv(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
var css=document.createElement('style');css.textContent=
'html body #cbStrip{position:fixed;left:0;right:0;bottom:0;height:'+SH+'px;z-index:98;background:#fff;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-evenly;gap:12px;padding:0 10px;box-sizing:border-box;overflow-x:auto;overflow-y:hidden}'+
'html body #cbStrip>*{display:inline-block;background:transparent!important;border:0!important;box-shadow:none!important;font:300 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;color:#9a9a9a!important;padding:6px 8px!important;margin:0!important;opacity:1!important;white-space:nowrap;cursor:pointer;text-decoration:none!important;border-radius:8px}'+
'html body #cbStrip>*:hover,html body #cbStrip>*:active{color:#333!important}'+
'html body #cbStrip .cbx[href*="youtube"]{background:rgba(230,33,23,.08)!important;color:#d9534f!important}html body #cbStrip .cbx[href*="youtube"]:hover{color:#b31b1b!important}'+
'html body #cbStrip.cbMinS{height:'+MH+'px;justify-content:flex-end;padding:0 6px}html body #cbStrip.cbMinS>*:not(#cbMinT){display:none!important}html body #cbStrip.cbMinS #cbMinT{padding:0 8px!important;font-size:10px!important;line-height:'+MH+'px}'+
'html body #sunoPanel,html body #applePanel,html body #cbStatsPanel{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:var(--cbsh,40px)!important;transform:translateX(-50%);z-index:99!important;margin:0!important}'+
'html body #cbStatsPanel button{opacity:1!important}'+
'html body #cbBar{background:transparent!important;border:0!important;box-shadow:none!important;font-size:11px!important;font-weight:300!important;opacity:.45;padding:2px 8px!important;pointer-events:none}'+
'@media (max-width:640px){html body #cbStrip{justify-content:flex-start;gap:4px}html body #cbStrip>*{font-size:10px!important;padding:4px 5px!important}}';
document.head.appendChild(css);
function noF(b){b.tabIndex=-1;b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('keydown',function(e){e.preventDefault()})}
function mk(id,t){var b=document.createElement('button');b.id=id;b.className='cbx';b.textContent=t;noF(b);return b}
window.CB_H=function(){var s=document.getElementById('cbStrip');return s?s.getBoundingClientRect().height:0};
function init(){
 var bar=document.createElement('div');bar.id='cbStrip';
 var mt=mk('cbMinT','–');var fs=mk('cbFS','⛶ Fullscreen');
 var grp=document.getElementById('appleToggle');grp=grp&&grp.parentNode;
var ob0=document.getElementById('cbBar');if(ob0)ob0.style.display='none';
 var items=[];['sunoToggle','appleToggle','sunoBtn'].forEach(function(i){var e=document.getElementById(i);if(e){e.removeAttribute('style');items.push(e)}});
 ['sunoPanel','applePanel'].forEach(function(i){var e=document.getElementById(i);if(e)document.body.appendChild(e)});
 if(grp&&grp!==document.body&&!grp.querySelector('a,button,iframe'))grp.style.display='none';
 var a=document.getElementById('appleToggle');if(a)a.textContent='Apple Music · Billionaire';
 var cor=document.getElementById('cbCorner');
 if(cor){var k=[].slice.call(cor.children);k[0].textContent='📊 Stats';k[1].textContent='☕ Tip Coffeebreak';k[2].textContent='▶ Subscribe on YouTube';items=items.concat(k);cor.remove()}
 var ob=document.getElementById('cbBar');if(ob&&ob.firstChild&&ob.firstChild.querySelector&&ob.firstChild.querySelector('button,a'))ob.firstChild.remove();
 items.forEach(function(e){bar.appendChild(e)});bar.appendChild(fs);bar.appendChild(mt);
 document.body.appendChild(bar);
 fs.onclick=function(e){e.stopPropagation();fs.blur();var d=document,el=d.documentElement;if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d)}else{var f=el.requestFullscreen||el.webkitRequestFullscreen;if(f){var p=f.call(el);if(p&&p.catch)p.catch(function(){})}}};
 function ap(){bar.classList.toggle('cbMinS',!!st.min);mt.textContent=st.min?'🎵':'–';mt.title=st.min?'Show links':'Hide links';
  if(st.min)['sunoPanel','applePanel','cbStatsPanel'].forEach(function(i){var e=document.getElementById(i);if(e)e.style.display='none'});
  var h=st.min?MH:SH;document.documentElement.style.setProperty('--cbsh',(h+8)+'px');document.documentElement.style.setProperty('--cbh',h+'px');
  document.body.style.paddingBottom=h+'px';var w=document.getElementById('wrap');if(w&&C.key==='heart')w.style.height='calc(100vh - '+h+'px)';
  var mm=document.getElementById('cbMusic');if(mm)mm.style.bottom=(h+8)+'px';
  setTimeout(window.CB_FIT||function(){},0)}
 mt.onclick=function(e){e.stopPropagation();st.min=st.min?0:1;sv();ap();mt.blur()};ap();
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',init);else setTimeout(init,0);
})();
(function(){
function fit(){var c=document.getElementById('c'),k=(window.CB_GAME||{}).key;if(!c||k==='heart'||k==='midwife')return;
 c.style.maxWidth='none';c.style.maxHeight='none';c.style.imageRendering='auto';
 var sh=window.CB_H?window.CB_H():0,cur=c.getBoundingClientRect().height;
 var other=Math.max(0,document.body.scrollHeight-(parseFloat(document.body.style.paddingBottom)||0)-cur);
 if(k==='honey')other=0;
 var aw=innerWidth-8,ah=innerHeight-sh-Math.min(other,innerHeight*.45)-6,r=c.width/c.height;
 var w=Math.max(200,Math.min(aw,ah*r));c.style.width=Math.floor(w)+'px';c.style.height=Math.floor(w/r)+'px';}
window.CB_FIT=fit;
addEventListener('resize',fit);document.addEventListener('fullscreenchange',function(){setTimeout(fit,100)});
function go(){fit();setTimeout(fit,400);setTimeout(fit,1500)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(go,20)});else setTimeout(go,20);
})();
(function(){
var C=window.CB_GAME||{},mw=/^midwife/.test(C.key||'');
var css=document.createElement('style');css.textContent=
'html body #cbTune{position:fixed;z-index:97;display:flex;flex-direction:column;align-items:flex-end;gap:2px;pointer-events:none}'+
'html body #cbTune .cbTr{display:flex;gap:4px;pointer-events:auto}'+
'html body #cbTune button{all:unset;box-sizing:border-box;cursor:pointer;font:300 12px/1 system-ui,sans-serif;padding:4px 7px;border-radius:7px;background:rgba(0,0,0,.25);color:var(--cbtc,#fff);border:1px solid var(--cbtc,#fff);opacity:.45;transition:opacity .2s;height:auto!important;width:auto!important}'+
'html body #cbTune button:hover,html body #cbTune button:active,html body #cbTune.cbTap button{opacity:1}'+
'html body #cbTune .cbNpL{font:300 10px/1.2 system-ui,sans-serif!important;color:var(--cbtc,#fff)!important;opacity:.55;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right;pointer-events:none;background:none!important;padding:0!important;margin:0!important;position:static!important}';
document.head.appendChild(css);
var box,canvas;
function place(){if(!box)return;
 if(mw){box.style.top='64px';box.style.right='12px';box.style.left='auto';return}
 var r=canvas.getBoundingClientRect(),ar=canvas.width/canvas.height,w=r.width,h=r.height,ox=0,oy=0;
 if(w/h>ar+0.01){var nw=h*ar;ox=(w-nw)/2;w=nw}else if(w/h<ar-0.01){var nh=w/ar;oy=(h-nh)/2;h=nh}
 box.style.top=Math.round(r.top+oy+6)+'px';box.style.left='auto';box.style.right=Math.round(innerWidth-(r.left+ox+w)+6)+'px';}
function init(){
 canvas=document.getElementById('c');if(!mw&&!canvas)return;
 var ids=mw?['cbMute','cbSkip']:['mute','skip','shuf'],npid=mw?'cbNp':'np';
 var btns=ids.map(function(i){return document.getElementById(i)}).filter(Boolean);if(!btns.length)return;
 var acc=getComputedStyle(btns[0]).color;document.documentElement.style.setProperty('--cbtc',acc);
 box=document.createElement('div');box.id='cbTune';var row=document.createElement('div');row.className='cbTr';box.appendChild(row);
 btns.forEach(function(b){b.removeAttribute('style');b.tabIndex=-1;b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('keydown',function(e){e.preventDefault()});b.addEventListener('click',function(){b.blur()});row.appendChild(b)});
 var np=document.getElementById(npid);if(np){np.removeAttribute('style');np.classList.add('cbNpL');box.appendChild(np)}
 document.body.appendChild(box);
 if(mw){var m=document.getElementById('cbMusic');if(m&&!m.querySelector('button,span'))m.style.display='none'}
 addEventListener('touchstart',function(e){box.classList.toggle('cbTap',!!(e.target.closest&&e.target.closest('#cbTune')))},{passive:true});
 place();setInterval(place,500);addEventListener('resize',function(){setTimeout(place,50)});
}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',function(){setTimeout(init,30)});else setTimeout(init,30);
})();
(function(){if((window.CB_GAME||{}).key!=='honey')return;var s=document.createElement('style');s.textContent='html body #ui{bottom:var(--cbh,34px)!important}';document.head.appendChild(s)})();
