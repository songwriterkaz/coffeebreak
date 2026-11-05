'use strict';
// Coffeebreak WifiPhone Kids for iPhone: iOS helpers
(function(){
const d=document,root=d.documentElement,q=s=>d.querySelector(s);
const standalone=()=>window.navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
const ua=navigator.userAgent,isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
root.classList.toggle('standalone',standalone());
// first-open screen: Safari, not installed
const a2=q('#a2hs');
function showA2(){if(!standalone())a2.classList.add('show')}
if(!standalone()&&!sessionStorage.getItem('cbk_a2hs_seen'))showA2();
q('#a2hsx').onclick=()=>{sessionStorage.setItem('cbk_a2hs_seen','1');a2.classList.remove('show')};
const mq=matchMedia('(display-mode: standalone)');mq.addEventListener&&mq.addEventListener('change',()=>{root.classList.toggle('standalone',standalone());if(standalone())a2.classList.remove('show')});
const gb=q('#getappbtn');if(gb){if(standalone())q('#getapp').style.display='none';gb.onclick=()=>{if(isIOS)showA2();else window.open('https://coffeebreaks.itch.io/coffeebreak-wifiphone-kids-apple','_blank')}}
// vibration: iOS has none, hide gracefully
const canVib='vibrate' in navigator;if(!canVib)root.classList.add('novib');
// siren audio element fallback (plays even when Web Audio is muted by the silent switch)
const au=new Audio('siren.wav');au.loop=true;au.preload='auto';au.setAttribute('playsinline','');au.id='sirenaudio';d.body.appendChild(au);
let unlocked=false;
function unlock(){if(unlocked)return;unlocked=true;
 try{const C=window.AudioContext||window.webkitAudioContext;if(C){const a=new C();const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0);a.resume();setTimeout(()=>a.close&&a.close(),500)}}catch(e){}
 try{au.muted=true;const p=au.play();p&&p.then(()=>{au.pause();au.currentTime=0;au.muted=false}).catch(()=>{au.muted=false})}catch(e){}}
['touchend','pointerdown','click','keydown'].forEach(ev=>d.addEventListener(ev,unlock,{capture:true,passive:true}));
window.__iosSirenOn=function(sir){au.muted=false;au.currentTime=0;au.volume=1;const p=au.play();
 if(p)p.then(()=>{window.__sirenAudio='playing';try{sir.g.gain.value=0.0001}catch(e){}}).catch(()=>{window.__sirenAudio='blocked'});wake(true,'siren')};
window.__iosSirenOff=function(){try{au.pause();au.currentTime=0}catch(e){}window.__sirenAudio='stopped';wake(false,'siren')};
// screen on: Wake Lock (iOS 16.4+)
let lock=null;const want=new Set();
async function wake(on,why){why=why||'call';on?want.add(why):want.delete(why);
 if(!('wakeLock' in navigator))return;
 try{if(want.size&&!lock){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null})}else if(!want.size&&lock){await lock.release();lock=null}}catch(e){lock=null}}
window.__wake=on=>wake(on,'call');
d.addEventListener('visibilitychange',()=>{if(!d.hidden&&want.size&&!lock)wake(true,[...want][0])});
// location: only asked on tap
const ms=q('#mumstate');if(ms&&!q('#locnote')){const p=d.createElement('p');p.id='locnote';p.className='note';p.textContent='Location is only asked for when the siren or a message button is tapped. Tap Allow so Mum can see where you are.';ms.after(p)}
window.__ios={standalone,isIOS,canVib,au,wake,hasWakeLock:'wakeLock' in navigator};
})();
