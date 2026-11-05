/* Coffeebreak Thriller spooky animations. Free, no libraries. */
(function(){
var d=document,LS=window.localStorage,get=function(k,v){try{var x=LS.getItem(k);return x===null?v:x}catch(e){return v}},set=function(k,v){try{LS.setItem(k,v)}catch(e){}};
var sysRM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var rm=get('cbtRM',sysRM?'1':'0')=='1',snd=get('cbtSnd','0')=='1';
var css=d.createElement('style');css.textContent=`
@keyframes cbtFlick{0%,19%,21%,23%,55%,57%,100%{opacity:1}20%,22%,56%{opacity:.35}}
@keyframes cbtIn{from{opacity:0;transform:translateY(14px) scale(.98);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@keyframes cbtPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,137,74,.0)}50%{box-shadow:0 0 14px 2px rgba(200,137,74,.45)}}
@keyframes cbtShake{0%,100%{transform:none}25%{transform:translate(-3px,1px) rotate(-.6deg)}75%{transform:translate(3px,-1px) rotate(.6deg)}}
@keyframes cbtEye{0%{opacity:0;transform:scale(.4)}30%{opacity:1;transform:scale(1.15)}100%{opacity:0;transform:scale(1.6)}}
@keyframes cbtTitle{0%{letter-spacing:.6em;opacity:0}60%{opacity:1}100%{letter-spacing:.08em;opacity:1}}
#cbtFog{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.55}
.wrap,header.top,footer,#cb-contact{position:relative;z-index:1}
#cbtVig{position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.65) 100%)}
.cbt-anim header.top h1{animation:cbtFlick 6s infinite}
.cbt-anim #cbtVig{animation:cbtFlick 9s infinite}
.cbt-anim .card,.cbt-anim .pane{animation:cbtIn .55s ease both}
.cbt-anim #desc.cbtNew{animation:cbtIn .6s ease both}
.cbt-anim button{transition:transform .18s,box-shadow .25s,background .25s}
.cbt-anim button:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 0 16px rgba(200,137,74,.6)}
.cbt-anim button:active{transform:scale(.95)}
.cbt-anim button.big,.cbt-anim .tabs button.on{animation:cbtPulse 2.4s infinite}
.cbt-anim #desc.cbtFear{animation:cbtShake .35s 2}
#scare{background:radial-gradient(circle,rgba(40,0,0,.85),#000 70%)!important}
.cbt-anim #scare>span{animation:cbtEye .6s ease-out both;display:inline-block}
#cbtIntro{position:fixed;inset:0;z-index:2147483000;background:#0a0604;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f4e8d8;text-align:center;transition:opacity .8s}
#cbtIntro img{width:120px;border-radius:14px;margin-bottom:12px}
#cbtIntro h1{font:700 34px Georgia,serif;color:#c8894a;margin:0}
.cbt-anim #cbtIntro img{animation:cbtFlick 2.2s infinite}
.cbt-anim #cbtIntro h1{animation:cbtTitle 1.8s ease both}
#cbtIntro p{opacity:.8;max-width:420px}
#cbtCtl{position:fixed;top:8px;right:8px;z-index:99990;display:flex;gap:6px}
#cbtCtl button{font-size:13px;padding:5px 9px;border-radius:16px;background:rgba(46,32,24,.9)}
#cbtRights{max-width:760px;margin:8px auto 0;font-size:12px;opacity:.75;text-align:center;padding:0 12px}
`;d.head.appendChild(css);
function apply(){d.documentElement.classList.toggle('cbt-anim',!rm);ctlTxt()}
/* fog */
var fc=d.createElement('canvas');fc.id='cbtFog';var vg=d.createElement('div');vg.id='cbtVig';
var P=[];function fit(){fc.width=innerWidth;fc.height=innerHeight}
for(var i=0;i<26;i++)P.push({x:Math.random(),y:Math.random(),r:60+Math.random()*140,v:.0002+Math.random()*.0005,a:.04+Math.random()*.06});
var sp=[];for(i=0;i<40;i++)sp.push({x:Math.random(),y:Math.random(),v:.0006+Math.random()*.001});
function draw(){var c=fc.getContext('2d'),w=fc.width,h=fc.height;c.clearRect(0,0,w,h);
P.forEach(function(p){if(!rm)p.x+=p.v;if(p.x>1.2)p.x=-.2;var g=c.createRadialGradient(p.x*w,p.y*h,0,p.x*w,p.y*h,p.r);g.addColorStop(0,'rgba(200,190,180,'+p.a+')');g.addColorStop(1,'rgba(200,190,180,0)');c.fillStyle=g;c.fillRect(p.x*w-p.r,p.y*h-p.r,p.r*2,p.r*2)});
c.fillStyle='rgba(255,200,140,.5)';sp.forEach(function(s){if(!rm){s.y-=s.v;if(s.y<0)s.y=1}c.fillRect(s.x*w,s.y*h,1.5,1.5)});
requestAnimationFrame(draw)}
/* sound (off by default) */
var ac=null,drone=null;function tone(f,t,type,vol){if(!snd)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.value=vol||.05;g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+t);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+t)}catch(e){}}
function startDrone(){if(!snd||drone)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();var o=ac.createOscillator(),g=ac.createGain();o.frequency.value=55;g.gain.value=.02;o.connect(g).connect(ac.destination);o.start();drone=o}catch(e){}}
function stopDrone(){if(drone){try{drone.stop()}catch(e){}drone=null}}
/* controls */
var ctl=d.createElement('div');ctl.id='cbtCtl';ctl.innerHTML='<button id="cbtMot" type="button"></button><button id="cbtSndB" type="button"></button>';
function ctlTxt(){var a=d.getElementById('cbtMot'),b=d.getElementById('cbtSndB');if(a)a.textContent=rm?'🧊 Motion: reduced':'🌫 Motion: on';if(b)b.textContent=snd?'🔊 Sound: on':'🔇 Sound: off'}
function boot(){
d.body.prepend(vg);d.body.prepend(fc);fit();addEventListener('resize',fit);draw();d.body.appendChild(ctl);
d.getElementById('cbtMot').onclick=function(){rm=!rm;set('cbtRM',rm?'1':'0');apply()};
d.getElementById('cbtSndB').onclick=function(){snd=!snd;set('cbtSnd',snd?'1':'0');snd?startDrone():stopDrone();tone(440,.2);ctlTxt()};
var ft=d.querySelector('footer');if(ft){var r=d.createElement('div');r.id='cbtRights';r.innerHTML='<img src="cb-logo.png" alt="Coffeebreak logo" style="height:40px;vertical-align:middle;border-radius:6px"> Karen keeps all rights to Coffeebreak Thriller. Please do not copy it or make your own versions. Free to play. Support by PayID (Teachers Mutual Bank): darkokaz@gmx.com';ft.appendChild(r)}
/* room transitions + fear shake */
var desc=d.getElementById('desc'),lastFear=0;if(desc)new MutationObserver(function(){desc.classList.remove('cbtNew','cbtFear');void desc.offsetWidth;desc.classList.add('cbtNew');var m=(d.getElementById('hud')||{}).textContent||'';var f=+((m.match(/Fear (\d+)/)||[])[1]||0);if(f>=6&&f>lastFear)desc.classList.add('cbtFear');lastFear=f;tone(90+Math.random()*40,.4,'triangle',.04)}).observe(desc,{childList:true});
/* jump-scare-lite: soften the eye reveal */
var sc=d.getElementById('scare');if(sc){sc.innerHTML='<span>👁️</span>';new MutationObserver(function(){if(sc.style.display=='flex'){var s=sc.firstChild;s.style.animation='none';void s.offsetWidth;s.style.animation='';tone(220,.5,'sawtooth',.03)}}).observe(sc,{attributes:true,attributeFilter:['style']})}
/* intro */
var it=d.createElement('div');it.id='cbtIntro';it.innerHTML='<img src="cb-logo.png" alt="Coffeebreak logo"><h1>COFFEEBREAK THRILLER</h1><p>The lights are out. Find the torch, the key and the fuse box before dawn.</p><button type="button" class="big" id="cbtGo">🕯 Enter if you dare</button><p style="font-size:12px">Sound is off. Turn it on with the button at the top right.</p>';
d.body.appendChild(it);var gone=false;function go(){if(gone)return;gone=true;it.style.opacity=0;startDrone();setTimeout(function(){it.remove()},rm?0:800)}
d.getElementById('cbtGo').onclick=go;
apply()}
if(d.readyState=='loading')d.addEventListener('DOMContentLoaded',boot);else boot();
})();
