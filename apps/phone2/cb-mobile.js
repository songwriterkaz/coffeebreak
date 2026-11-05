/* Coffeebreak mobile layer: works in itch iframe on iOS/Android + physical Coffeebreak Phone */
(function(){
var inFrame=false;try{inFrame=window.top!==window}catch(e){inFrame=true}
var isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
document.documentElement.classList.add(isTouch?'cb-touch':'cb-mouse');
// viewport: allow zoom for accessibility, safe areas
var vp=document.querySelector('meta[name=viewport]');if(!vp){vp=document.createElement('meta');vp.name='viewport';document.head.appendChild(vp)}
vp.content='width=device-width,initial-scale=1,viewport-fit=cover';
function sv(){document.documentElement.style.setProperty('--cbvh',window.innerHeight*0.01+'px')}sv();addEventListener('resize',sv);
// iOS audio unlock on first tap + lazy music
var unlocked=false;function unlock(){if(unlocked)return;unlocked=true;try{var C=window.AudioContext||window.webkitAudioContext;if(C){var c=new C();c.resume&&c.resume();var b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}}catch(e){}
 document.querySelectorAll('audio').forEach(function(a){a.setAttribute('playsinline','')})}
['touchend','pointerup','click','keydown'].forEach(function(t){addEventListener(t,unlock,{once:true,capture:true})});
function lazy(){document.querySelectorAll('audio,video').forEach(function(a){if(a.getAttribute('preload')!=='none'&&!a.autoplay)a.setAttribute('preload','none');a.setAttribute('playsinline','')})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',lazy):lazy();
// toast + safe dialogs (itch iframe can block alert/prompt)
function toast(m){var t=document.getElementById('cbToast');if(!t){t=document.createElement('div');t.id='cbToast';document.body.appendChild(t)}t.textContent=m;t.className='on';clearTimeout(t._h);t._h=setTimeout(function(){t.className=''},3500)}
window.cbToast=toast;
var _a=window.alert;window.alert=function(m){try{_a.call(window,m)}catch(e){toast(String(m))}};
var _p=window.prompt;window.prompt=function(m,d){if(d&&navigator.clipboard){navigator.clipboard.writeText(d).then(function(){toast('Copied ✔')},function(){})}try{return _p.call(window,m,d)}catch(e){toast(m+' '+(d||''));return d||null}};
// permission fallback: camera/mic/notifications blocked inside iframe -> offer full-screen tab
function openTab(){var u=location.href;var w=null;try{w=window.open(u,'_blank')}catch(e){}if(!w){var a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}}
window.cbOpenTab=openTab;
function needTab(what){var b=document.getElementById('cbPerm');if(!b){b=document.createElement('div');b.id='cbPerm';document.body.appendChild(b)}
 b.innerHTML='<b>'+what+' is blocked here.</b> Tap to open the Coffeebreak Phone full screen in a new tab, then allow it.<br><button type=button id=cbPermGo>Open full screen ↗</button> <button type=button id=cbPermX>✕</button>';b.className='on';
 document.getElementById('cbPermGo').onclick=openTab;document.getElementById('cbPermX').onclick=function(){b.className=''}}
window.cbNeedTab=needTab;
if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){var g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
 navigator.mediaDevices.getUserMedia=function(c){return g(c).catch(function(e){needTab(c&&c.video?'Camera':'Microphone');throw e})}}
else if(navigator.mediaDevices||true){try{navigator.mediaDevices=navigator.mediaDevices||{};navigator.mediaDevices.getUserMedia=function(c){needTab(c&&c.video?'Camera':'Microphone');return Promise.reject(new Error('Not available here — open full screen'))}}catch(e){}}
window.cbNotify=function(title,body){if(!('Notification' in window)){toast(title+': '+body);return}
 if(Notification.permission==='granted'){try{new Notification(title,{body:body})}catch(e){toast(body)}}
 else Notification.requestPermission().then(function(p){if(p==='granted')cbNotify(title,body);else{toast(body);if(inFrame)needTab('Notifications')}}).catch(function(){toast(body)})};
window.cbTorch=async function(on){try{var s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});var t=s.getVideoTracks()[0];var cap=t.getCapabilities?t.getCapabilities():{};if(!cap.torch){t.stop();document.body.classList.toggle('cb-screenlight',on);return 'screen'}await t.applyConstraints({advanced:[{torch:!!on}]});if(!on)t.stop();return 'torch'}catch(e){document.body.classList.toggle('cb-screenlight',on);return 'screen'}};
if(navigator.vibrate===undefined)navigator.vibrate=function(){return false};
// PWA
var base=(document.currentScript&&document.currentScript.src||'').replace(/cb-mobile\.js.*$/,'');
if(!document.querySelector('link[rel=manifest]')){var l=document.createElement('link');l.rel='manifest';l.href=base+'manifest.webmanifest';document.head.appendChild(l)}
if('serviceWorker' in navigator&&location.protocol==='https:'&&!inFrame){navigator.serviceWorker.register(base+'sw.js').catch(function(){})}
var dip=null;addEventListener('beforeinstallprompt',function(e){e.preventDefault();dip=e});
// Setup button
function addSetup(){if(document.getElementById('cbSetupBtn'))return;var a=document.createElement('a');a.id='cbSetupBtn';a.href=base+'setup.html';a.target='_blank';a.rel='noopener';a.textContent='📱';a.title=a.ariaLabel='Set up your Coffeebreak Phone / Add to Home Screen';
 a.onclick=function(ev){if(dip){ev.preventDefault();dip.prompt();dip=null}};document.body.appendChild(a)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',addSetup):addSetup();
addEventListener('error',function(e){if(window.__cbErrs)__cbErrs.push(String(e.message))});
})();
