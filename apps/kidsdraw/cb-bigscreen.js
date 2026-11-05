/* Coffeebreak big screen: max canvas, Big Studio default, fullscreen. Made by Coffeebreak. */
(function(){
var s=document.createElement('style');s.textContent=`
body.cbmax>*:not(#cbbs):not(#cbmini):not(.cbkeep){visibility:hidden}
body.cbmax{overflow:hidden}
.cbmaxel{position:fixed!important;z-index:9000!important;visibility:visible!important;margin:0!important;max-width:none!important;max-height:none!important;aspect-ratio:auto!important;border-radius:0!important}
.cbmaxel *{visibility:visible}
div.cbmaxel>canvas#view{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:auto!important}
#cbmini{position:fixed;top:6px;left:6px;z-index:99990;display:none;gap:6px}
body.cbmax #cbmini{display:flex}
#cbmini button,#cbbs .cbx{min-height:44px;min-width:44px;font:600 15px system-ui;border-radius:10px;border:0;background:#3b2418;color:#fff;padding:4px 10px;opacity:.85}
#cbmini img{height:44px;border-radius:8px}`;document.head.appendChild(s);
var el=null,mini;
function mainCanvas(){var best=null,ba=0;document.querySelectorAll('canvas').forEach(function(c){if(c.closest('#cbbs')||c.closest('.card'))return;var a=c.width*c.height;if(a>ba){ba=a;best=c}});return best}
function target(c){var st=document.getElementById('stage');if(st&&st.contains(c))return st;var p=c.parentElement;if(p&&p.querySelectorAll('canvas').length>1&&getComputedStyle(c).position=='absolute')return p;return c}
var rt;function fit(){if(!el)return;var vw=innerWidth,vh=innerHeight,c=mainCanvas(),w=vw,h=vh;if(!window.CBResizeCanvas&&c&&c.width&&c.height){var r=c.width/c.height;w=Math.min(vw,vh*r);h=w/r}el.style.setProperty('width',w+'px','important');el.style.setProperty('height',h+'px','important');el.style.left=(vw-w)/2+'px';el.style.top=(vh-h)/2+'px';if(window.CBResizeCanvas){clearTimeout(rt);rt=setTimeout(function(){var b=el.getBoundingClientRect();CBResizeCanvas(b.width,b.height)},120)}}
function keepUp(n){var x=n;while(x&&x.parentElement&&x.parentElement!==document.body)x=x.parentElement;if(x&&x!==n)x.classList.add('cbkeep');}
function max(on){var c=mainCanvas();if(!c)return;if(on){el=target(c);el.classList.add('cbmaxel');keepUp(el);document.body.classList.add('cbmax');fit()}else if(el){el.classList.remove('cbmaxel');['width','height','left','top'].forEach(function(p){el.style.removeProperty(p)});document.body.classList.remove('cbmax');document.querySelectorAll('.cbkeep').forEach(function(k){k.classList.remove('cbkeep')});el=null}dispatchEvent(new Event('resize'))}
addEventListener('resize',function(){if(el)fit()});
function fs(){if(document.fullscreenElement)document.exitFullscreen();else (document.documentElement.requestFullscreen||function(){}).call(document.documentElement).catch&&document.documentElement.requestFullscreen().catch(function(){})}
function init(){
mini=document.createElement('div');mini.id='cbmini';
[['Tools',function(){max(false)}],['Big Studio',function(){max(false);CBBigStudio.open()}],['Full screen',fs]].forEach(function(b){var x=document.createElement('button');x.textContent=b[0];x.onclick=b[1];mini.appendChild(x)});
var lg=document.createElement('img');lg.src='cb-logo.jpg';lg.alt='Coffeebreak';mini.appendChild(lg);document.body.appendChild(mini);
var bar=document.querySelector('#cbbs .bar');if(bar){[['Classic tools',function(){document.getElementById('cbbs').classList.remove('on');max(true)}],['Full screen',fs]].forEach(function(b){var x=document.createElement('button');x.className='cbx';if(b[0]=='Classic tools')x.id='cbclassic';x.textContent=b[0];x.onclick=b[1];bar.insertBefore(x,bar.children[2])})}
var ob=document.getElementById('cbbs-open');if(ob){ob.textContent='Big Studio';ob.addEventListener('click',function(){if(el)max(false)})}
var mb=document.createElement('button');mb.id='cbmax-open';mb.textContent='Big canvas';mb.style.cssText='position:fixed;right:150px;bottom:12px;z-index:99997;font:700 16px system-ui;padding:14px 18px;border-radius:30px;border:0;background:#3b2418;color:#fff';mb.onclick=function(){max(true)};document.body.appendChild(mb);
if(window.CBBigStudio)CBBigStudio.open();
window.CBBigScreen={max:max,fs:fs};}
if(document.readyState=='complete')setTimeout(init,50);else addEventListener('load',function(){setTimeout(init,50)});
})();
