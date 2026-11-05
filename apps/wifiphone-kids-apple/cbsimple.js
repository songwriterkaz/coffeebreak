/* Coffeebreak Simple Home. One to three giant buttons, spoken and visual feedback, grown-up area behind a 2 second hold.
   Works over the top of an existing Coffeebreak phone app. Free. No tracking. Everything stays on the device. */
(function(){
'use strict';
if(window.CBS)return;
var W=window,D=document,LS;try{LS=W.localStorage;LS.getItem('x')}catch(e){LS={getItem:function(){return null},setItem:function(){}}}
var cfg=null,L=null,ST=null,BAR=null,btnsEl=null,mode='home',soundOn=LS.getItem('cbs_sound')!=='0',ac=null,deferred=null,busy=false,lastErr=0,inerted=[];
var RM=!!(W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches);
function noBang(s){return String(s==null?'':s).replace(/!/g,'.')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var P={
call:'<path d="M6.6 3.5l3 .6.9 4-2 1.4a12 12 0 0 0 5.9 5.9l1.4-2 4 .9.6 3c.2 1-.5 2-1.600 2.100A17 17 0 0 1 4.500 5.100C4.600 4 5.600 3.300 6.600 3.500z"/>',
heart:'<path d="M12 20.500S3.500 15 3.500 9a4.500 4.500 0 0 1 8.500-2 4.500 4.500 0 0 1 8.500 2c0 6-8.500 11.500-8.500 11.500z"/>',
help:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.600"/><path d="M5.600 5.600l3.900 3.900M14.500 14.500l3.900 3.900M18.400 5.600l-3.900 3.900M9.500 14.500l-3.900 3.900"/>',
msg:'<path d="M4 5h16v11H9l-5 4z"/>',
check:'<path d="M4.500 12.500l5 5 10-11"/>',
lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
sos:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.500 11a6.500 6.500 0 0 0 13 0M12 17.500V21"/>',
torch:'<path d="M8 3h8l-1.500 5h-5zM9.500 8h5v13h-5zM12 12v3"/>',
book:'<path d="M4 5.500C7 4 10 4.200 12 6c2-1.800 5-2 8-.5V19c-3-1.500-6-1.300-8 .5-2-1.800-5-2-8-.5zM12 6v13.500"/>',
radio:'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M7 8L17 3M8 14h4M16 14h.01M16 17h.01"/>',
music:'<path d="M9 18V6l10-2v12"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="16.500" cy="16" r="2.500"/>',
note:'<path d="M6 3h9l3 3v15H6zM9 11h6M9 15h6"/>',
sound:'<path d="M4 9v6h4l5 4V5L8 9zM16.500 8.500a5 5 0 0 1 0 7"/>',
mute:'<path d="M4 9v6h4l5 4V5L8 9zM16 9l5 6M21 9l-5 6"/>',
pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',
drop:'<path d="M12 3s6 6.500 6 11a6 6 0 0 1-12 0c0-4.500 6-11 6-11z"/>',
home:'<path d="M4 11l8-7 8 7v9H4z"/>',
stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>'};
function svg(n,s){return '<svg viewBox="0 0 24 24" width="'+(s||64)+'" height="'+(s||64)+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[n]||P.check)+'</svg>'}
var CSS='#cbs{position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;gap:12px;padding:calc(10px + env(safe-area-inset-top)) 12px calc(8px + env(safe-area-inset-bottom));box-sizing:border-box;background:#f3f1ee;color:#1c2431;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;overflow-x:hidden;overflow-y:auto;-webkit-tap-highlight-color:transparent}'
+'#cbs *{box-sizing:border-box}#cbs.cbs-yield{visibility:hidden;pointer-events:none}'
+'#cbs .cbs-top{display:flex;align-items:center;gap:10px;min-height:56px}#cbs .cbs-top img{width:52px;height:52px;border-radius:14px;object-fit:cover;background:#fff}'
+'#cbs .cbs-ttl{flex:1;line-height:1.15;min-width:0}#cbs .cbs-ttl b{display:block;font-size:19px}#cbs .cbs-ttl span{font-size:14px;color:#33405a}'
+'#cbs .cbs-gu{width:64px;min-height:56px;border:3px solid #55607a;background:#fff;color:#33405a;border-radius:16px;font:700 11px/1.1 system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;position:relative;overflow:hidden;touch-action:none;-webkit-user-select:none;user-select:none;cursor:pointer}'
+'#cbs .cbs-gu svg{width:22px;height:22px}#cbs .cbs-gu:after{content:"";position:absolute;left:0;bottom:0;height:6px;width:0;background:#1f7a52}#cbs .cbs-gu.go:after{width:100%;transition:width 1.700s linear}'
+'#cbs>*{flex-shrink:0}#cbs .cbs-btns{flex:1 0 auto;display:flex;flex-direction:column;gap:14px;min-height:0}'
+'#cbs .cbs-b{flex:1 0 110px;min-height:96px;border:0;border-radius:32px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:800 clamp(30px,9vw,44px)/1.05 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;cursor:pointer;box-shadow:0 8px 0 rgba(0,0,0,.22);touch-action:manipulation;-webkit-user-select:none;user-select:none;padding:8px}'
+'#cbs .cbs-b svg{width:clamp(56px,18vw,84px);height:clamp(56px,18vw,84px)}#cbs.one .cbs-b svg{width:clamp(96px,32vw,160px);height:clamp(96px,32vw,160px)}#cbs.one .cbs-b{font-size:clamp(40px,12vw,64px)}'
+'#cbs .cbs-b:active{transform:translateY(4px);box-shadow:0 4px 0 rgba(0,0,0,.22)}#cbs .cbs-b[disabled]{opacity:.85}'
+'#cbs button:focus-visible,#cbs a:focus-visible,#cbs input:focus-visible,#cbbar button:focus-visible{outline:6px solid #ffbf00;outline-offset:3px}'
+'#cbs .cbs-pop{animation:cbspop .5s ease-out}@keyframes cbspop{0%{transform:scale(1)}35%{transform:scale(.94)}70%{transform:scale(1.04)}100%{transform:scale(1)}}'
+'#cbs .cbs-st{background:#fff;border:4px solid #55607a;border-radius:26px;padding:12px 14px;display:flex;flex-wrap:wrap;align-items:center;gap:12px;min-height:96px;font-size:24px;font-weight:800;line-height:1.15;color:#1c2431}'
+'#cbs .cbs-st .cbs-si{flex:0 0 48px;width:48px;height:48px;border-radius:50%;background:#1f7a52;color:#fff;display:flex;align-items:center;justify-content:center}#cbs .cbs-st .cbs-si svg{width:30px;height:30px}'
+'#cbs .cbs-st.warn{border-color:#a8431a}#cbs .cbs-st.warn .cbs-si{background:#a8431a}'
+'#cbs .cbs-tx{flex:1;min-width:0}#cbs .cbs-sub{display:block;font-size:17px;font-weight:600;color:#33405a;margin-top:4px}'
+'#cbs .cbs-act{display:flex;gap:10px;width:100%}'
+'#cbs .cbs-act button,#cbs .cbs-pp button{flex:1;min-height:96px;border:0;border-radius:24px;color:#fff;font:800 26px/1.1 system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer;touch-action:manipulation;padding:6px}'
+'#cbs .cbs-act svg,#cbs .cbs-pp svg{width:44px;height:44px}'
+'#cbs .cbs-pp{background:#fff;border:4px solid #55607a;border-radius:26px;padding:16px;display:flex;flex-direction:column;gap:12px;font-size:26px;font-weight:700}'
+'#cbs .cbs-pp input{font:600 30px/1.2 system-ui,sans-serif;min-height:80px;border:4px solid #55607a;border-radius:18px;padding:8px 14px;width:100%;color:#1c2431;background:#fff}'
+'#cbs .cbs-pp .r{display:flex;gap:10px}#cbs .cbs-pp small{font-size:17px;font-weight:500;color:#33405a}'
+'#cbs .cbs-foot{text-align:center;font-size:13px;line-height:1.3;color:#33405a}#cbs .cbs-foot p{margin:2px 0}'
+'#cbs .cbs-a2{background:none;border:0;color:#33405a;text-decoration:underline;font:500 12px system-ui,sans-serif;min-height:24px;cursor:pointer}'
+'#cbbar{position:fixed;left:0;right:0;bottom:0;z-index:99990;display:flex;gap:8px;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:#1c2431;box-sizing:border-box}'
+'#cbbar button{min-height:96px;border:0;border-radius:22px;color:#fff;font:800 24px system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px}'
+'#cbbar .bk{flex:1;background:#1f7a52}#cbbar .sn{width:96px;background:#55607a;font-size:13px;flex-direction:column;gap:4px}#cbbar svg{width:34px;height:34px}'
+'body.cbs-grown{padding-bottom:116px}'
+'body.cbs-simple #cbopen,body.cbs-simple .cbs-hide{display:none!important}'
+'#cbc #cbin,#cbc #cbinc{max-width:440px!important}#cbc #cbin .row,#cbc #cbinc .row{flex-direction:column;max-width:440px}'
+'#cbc #cbans,#cbc #cbdec,#cbc #cbhang{min-height:120px;font-size:34px;border-radius:30px;font-weight:800}#cbc #cbwho{font-size:34px!important}#cbc #cbst{font-size:24px}'
+'#cbc #cbmute,#cbc #cbspk,#cbc #cbfile{min-height:96px;font-size:22px}#cbc .pad button{min-height:78px}#cbc #cbcall,#cbc #cbvid{min-height:96px}'
+'body.cbs-simple #cbc #cbdial,body.cbs-simple #cbc #cbshare,body.cbs-simple #cbc #cbfull,body.cbs-simple #cbc #cbextra,body.cbs-simple #cbc #cbme,body.cbs-simple #cbc #cbproj,body.cbs-simple #cbc #cbqr,body.cbs-simple #cbc img.lg,body.cbs-simple #cbc .sm:not(#cbst){display:none!important}body.cbs-simple #cbc #cbx{min-height:96px;font-size:28px}body.cbs-simple #cbc .row{max-width:440px}'
+'@media (max-height:620px){#cbs .cbs-b{min-height:96px}#cbs .cbs-st{min-height:80px}}'
+'@media (prefers-reduced-motion:reduce){#cbs *,#cbbar *{animation:none!important;transition:none!important}}';
function addCss(t,id){var s=D.createElement('style');if(id)s.id=id;s.textContent=t;(D.head||D.documentElement).appendChild(s)}
/* ---------- sound, voice, buzz ---------- */
function actx(){try{ac=ac||new(W.AudioContext||W.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){ac=null}return ac}
function chime(kind){if(!soundOn)return;var a=actx();if(!a)return;try{var f=kind==='oops'?[330,262]:kind==='sent'?[523,659,784]:[523,659];var t=a.currentTime;f.forEach(function(hz,i){var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t+i*.11);g.gain.linearRampToValueAtTime(.18,t+i*.11+.02);g.gain.exponentialRampToValueAtTime(.001,t+i*.11+.28);o.connect(g);g.connect(a.destination);o.start(t+i*.11);o.stop(t+i*.11+.3)})}catch(e){}}
function speak(t){if(!soundOn||!W.speechSynthesis||!t)return;try{var s=W.speechSynthesis;s.cancel();var u=new SpeechSynthesisUtterance(noBang(t));u.lang='en-AU';u.rate=.9;u.volume=1;s.speak(u)}catch(e){}}
function buzz(){try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}}
function feedback(el,kind){if(el&&!RM){el.classList.remove('cbs-pop');void el.offsetWidth;el.classList.add('cbs-pop')}chime(kind);buzz()}
/* ---------- status card ---------- */
function status(text,o){o=o||{};if(!ST)return;text=noBang(text);ST.className='cbs-st'+(o.warn?' warn':'');
 ST.innerHTML='<span class="cbs-si">'+svg(o.icon||(o.warn?'help':'check'),30)+'</span><span class="cbs-tx"></span>';
 var tx=ST.querySelector('.cbs-tx');tx.textContent=text;if(o.sub){var sb=D.createElement('span');sb.className='cbs-sub';sb.textContent=noBang(o.sub);tx.appendChild(sb)}
 if(o.actions&&o.actions.length){var row=D.createElement('div');row.className='cbs-act';o.actions.forEach(function(a){var b=D.createElement('button');b.type='button';b.style.background=a.color||'#55607a';b.innerHTML=svg(a.icon||'check',44)+'<span>'+esc(noBang(a.label))+'</span>';b.onclick=function(){feedback(b);try{a.run&&a.run(ctx)}catch(e){fail()}};row.appendChild(b)});ST.appendChild(row)}
 try{ST.scrollIntoView({block:'nearest'})}catch(e){}
 if(!o.silent){chime(o.warn?'oops':'sent');speak(text)}}
function fail(){if(Date.now()-lastErr<1500)return;lastErr=Date.now();if(mode==='home')status('Something did not work. Please tap the button again, or ask a grown-up.',{warn:true})}
/* ---------- questions (shown inside the layer) ---------- */
function ask(p){return new Promise(function(res){
 var box=D.createElement('div');box.className='cbs-pp';box.setAttribute('role','dialog');box.setAttribute('aria-label',p.title);
 box.innerHTML='<div>'+esc(noBang(p.title))+'</div><input id="cbs-pin" type="tel" inputmode="tel" autocomplete="off" placeholder="'+esc(p.placeholder||'')+'" aria-label="'+esc(p.title)+'"><small>'+esc(noBang(p.hint||'Ask a grown-up to type this once.'))+'</small><div class="r"><button type="button" data-s style="background:#1f7a52">'+svg('check',44)+'<span>Save</span></button><button type="button" data-c style="background:#55607a"><span>Not now</span></button></div>';
 ST.replaceWith(box);if(btnsEl)btnsEl.style.display='none';var inp=box.querySelector('input');try{inp.focus()}catch(e){}
 speak(p.title);
 function back(){box.replaceWith(ST);if(btnsEl)btnsEl.style.display=''}
 function ok(){var v=p.validate?p.validate(inp.value):inp.value.trim();if(!v){var sm=box.querySelector('small');sm.textContent=noBang(p.bad||'That does not look right. Please check it and try again.');sm.style.color='#a8431a';sm.style.fontWeight='700';chime('oops');speak(sm.textContent);try{inp.focus()}catch(e){}return}back();res(v)}
 box.querySelector('[data-s]').onclick=function(){feedback(this);ok()};
 box.querySelector('[data-c]').onclick=function(){feedback(this);back();res(null)};
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();ok()}});
})}
function confirm(o){return new Promise(function(res){
 var box=D.createElement('div');box.className='cbs-pp';box.setAttribute('role','alertdialog');box.setAttribute('aria-label',o.text);
 box.innerHTML='<div>'+esc(noBang(o.text))+'</div>'+(o.sub?'<small>'+esc(noBang(o.sub))+'</small>':'')+'<div class="r"><button type="button" data-y style="background:'+(o.yesColor||'#b3261e')+'">'+svg(o.icon||'check',44)+'<span>'+esc(noBang(o.yes||'Yes'))+'</span></button><button type="button" data-no style="background:#1f7a52"><span>'+esc(noBang(o.no||'No, go back'))+'</span></button></div>';
 ST.replaceWith(box);if(btnsEl)btnsEl.style.display='none';speak(o.text);
 function back(){box.replaceWith(ST);if(btnsEl)btnsEl.style.display=''}
 box.querySelector('[data-y]').onclick=function(){feedback(this);back();res(true)};
 box.querySelector('[data-no]').onclick=function(){feedback(this);back();status('Okay. Nothing was done.',{icon:'check'});res(false)};
 try{box.querySelector('[data-no]').focus()}catch(e){}
})}
/* ---------- helpers for adapters ---------- */
function q(s){return D.querySelector(s)}
function click(sel){var e=typeof sel==='string'?q(sel):sel;if(!e)throw new Error('missing '+sel);e.click()}
function go(url){try{W.location.href=url}catch(e){}}
function setButton(id,o){var e=D.getElementById('cbs-b-'+id);if(!e)return;var b=cfg.buttons.filter(function(x){return x.id===id})[0]||{};if(o.label!=null){b.label=o.label;b.speak=o.speak||o.label}if(o.icon)b.icon=o.icon;if(o.color)b.color=o.color;e.style.background=b.color||'#1f7a52';e.innerHTML=svg(b.icon||'call')+'<span>'+esc(noBang(b.label))+'</span>';e.setAttribute('aria-label',noBang(b.speak||b.label))}
var ctx={setButton:setButton,say:function(t,o){status(t,o)},warn:function(t,o){o=o||{};o.warn=true;status(t,o)},ask:ask,confirm:confirm,click:click,go:go,handoff:handoff,status:status,speak:speak,q:q};
function telNum(v){var t=String(v||'').replace(/[\s().-]/g,'');return /^\+?\d{3,15}$/.test(t)?t:null}
function cbId(v){var m=String(v||'').match(/CB-?(\d{4})-?(\d{4})/i);return m?'CB-'+m[1]+'-'+m[2]:null}
/* ---------- inert / yield ---------- */
function setInert(on){if(on){inerted=[];Array.prototype.forEach.call(D.body.children,function(e){if(e===L||e===BAR||e.tagName==='SCRIPT'||e.tagName==='STYLE'||e.tagName==='NOSCRIPT'||e.hasAttribute('data-cbs-inert'))return;e.setAttribute('data-cbs-inert','1');e.setAttribute('aria-hidden','true');try{e.inert=true}catch(x){}inerted.push(e)})}
 else{Array.prototype.forEach.call(D.querySelectorAll('[data-cbs-inert]'),function(e){e.removeAttribute('data-cbs-inert');e.removeAttribute('aria-hidden');try{e.inert=false}catch(x){}});inerted=[]}}
function visible(e){var r=e.getClientRects();if(!r.length)return false;var cs=W.getComputedStyle(e);return cs.visibility!=='hidden'&&cs.display!=='none'}
function yieldTo(){var s=cfg.overlays||[];for(var i=0;i<s.length;i++){var l=D.querySelectorAll(s[i]);for(var j=0;j<l.length;j++)if(visible(l[j]))return true}return false}
function unzoom(){try{var z=parseFloat(D.documentElement.style.zoom)||1,v=Math.abs(z-1)<.02?'':String(1/z);if(L&&L.style.zoom!==v)L.style.zoom=v;if(BAR&&BAR.style.zoom!==v)BAR.style.zoom=v}catch(e){}}
function tick(){unzoom();if(mode!=='home'||!L)return;var y=yieldTo();if(y!==L.classList.contains('cbs-yield')){L.classList.toggle('cbs-yield',y);setInert(!y);
 if(!y){try{W.scrollTo(0,0)}catch(e){}status(cfg.resume||'All done. Tap a big button to go again.',{icon:'heart',silent:true});if(cfg.onResume)try{cfg.onResume()}catch(e){}}}}
/* ---------- modes ---------- */
function enterApp(){mode='app';setInert(false);L.style.display='none';D.body.classList.remove('cbs-simple');D.body.classList.add('cbs-grown');BAR.style.display='flex';if(cfg.onApp)try{cfg.onApp()}catch(e){}try{W.scrollTo(0,0)}catch(e){}}
function handoff(){enterApp()}
function enterHome(){mode='home';BAR.style.display='none';D.body.classList.remove('cbs-grown');D.body.classList.add('cbs-simple');L.style.display='flex';L.classList.remove('cbs-yield');setInert(true);try{W.scrollTo(0,0)}catch(e){}
 status(cfg.hello||'Tap a big button.',{icon:'heart',silent:true});if(cfg.onHome)try{cfg.onHome()}catch(e){}}
function wireGU(g){var t=null;
 function start(e){if(e&&e.type==='keydown'){if(e.key!=='Enter'&&e.key!==' ')return;if(e.repeat)return}if(e&&e.cancelable&&e.type!=='keydown')e.preventDefault();if(t)return;g.classList.add('go');if(RM)g.classList.remove('go');
  status('Keep holding for two seconds. This is for grown-ups.',{icon:'lock',silent:true});t=setTimeout(function(){t=null;g.classList.remove('go');chime('sent');enterApp()},1700)}
 function stop(){if(t){clearTimeout(t);t=null}g.classList.remove('go')}
 g.addEventListener('pointerdown',start);['pointerup','pointercancel','pointerleave','blur'].forEach(function(n){g.addEventListener(n,stop)});g.addEventListener('keydown',start);g.addEventListener('keyup',stop);g.addEventListener('contextmenu',function(e){e.preventDefault()})}
function a2hs(){if(cfg.onA2hs){try{cfg.onA2hs();return}catch(e){}}if(deferred){deferred.prompt();deferred=null;return}
 status('To keep this on your home screen, ask a grown-up to use the Share or Menu button, then Add to Home Screen.',{icon:'home'})}
/* ---------- build ---------- */
function build(){
 addCss(CSS,'cbs-css');if(cfg.css)addCss(cfg.css,'cbs-css2');
 if(cfg.hide&&cfg.hide.length)addCss('body.cbs-simple '+cfg.hide.join(',body.cbs-simple ')+'{display:none!important}','cbs-hide');
 L=D.createElement('div');L.id='cbs';L.setAttribute('role','main');L.setAttribute('aria-label',cfg.title||'Phone');if(cfg.buttons.length===1)L.className='one';
 if(cfg.theme&&cfg.theme.bg)L.style.background=cfg.theme.bg;
 var logo=cfg.logo?'<img src="'+esc(cfg.logo)+'" alt="Coffeebreak logo" onerror="this.style.visibility=\'hidden\'">':'';
 L.innerHTML='<div class="cbs-top">'+logo+'<div class="cbs-ttl"><b>'+esc(noBang(cfg.title||''))+'</b><span>'+esc(noBang(cfg.sub||'Coffeebreak'))+'</span></div><button type="button" class="cbs-gu" aria-label="Grown-ups. Press and hold for two seconds.">'+svg('lock',22)+'<span>Grown-ups</span></button></div><div class="cbs-btns"></div><div class="cbs-st" id="cbs-st" aria-live="polite" role="status"></div><div class="cbs-foot"><p class="cbs-d"></p><p class="cbs-r"></p><button type="button" class="cbs-a2" id="cbs-a2">Keep on home screen (optional)</button></div>';
 btnsEl=L.querySelector('.cbs-btns');ST=L.querySelector('#cbs-st');
 L.querySelector('.cbs-d').textContent=noBang(cfg.disclaimer||'');L.querySelector('.cbs-r').textContent=noBang(cfg.rights||'Coffeebreak. All rights kept by Karen O\u2019Brien.');
 cfg.buttons.forEach(function(b,i){var e=D.createElement('button');e.type='button';e.className='cbs-b';e.id='cbs-b-'+b.id;e.style.background=b.color||'#1f7a52';e.innerHTML=svg(b.icon||'call')+'<span>'+esc(noBang(b.label))+'</span>';e.setAttribute('aria-label',noBang(b.speak||b.label));e.setAttribute('data-n',i+1);
  e.onclick=async function(){if(busy)return;busy=true;e.setAttribute('aria-busy','true');feedback(e);speak(b.speak||b.label);try{await b.run(ctx)}catch(err){fail()}finally{setTimeout(function(){busy=false;e.removeAttribute('aria-busy')},500)}};
  btnsEl.appendChild(e)});
 BAR=D.createElement('div');BAR.id='cbbar';BAR.style.display='none';BAR.innerHTML='<button type="button" class="bk">'+svg('home',34)+'<span>Back to the big buttons</span></button><button type="button" class="sn" aria-label="Sound on or off"></button>';
 function snd(){var b=BAR.querySelector('.sn');b.innerHTML=svg(soundOn?'sound':'mute',34)+'<span>'+(soundOn?'Sound on':'Sound off')+'</span>'}
 BAR.querySelector('.bk').onclick=function(){chime('sent');enterHome()};
 BAR.querySelector('.sn').onclick=function(){soundOn=!soundOn;LS.setItem('cbs_sound',soundOn?'1':'0');snd();if(soundOn)chime('sent');else try{W.speechSynthesis&&W.speechSynthesis.cancel()}catch(e){}};snd();
 D.body.appendChild(L);D.body.appendChild(BAR);wireGU(L.querySelector('.cbs-gu'));L.querySelector('#cbs-a2').onclick=a2hs;
 if(W.matchMedia&&W.matchMedia('(display-mode: standalone)').matches||navigator.standalone)L.querySelector('#cbs-a2').style.display='none';
 W.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e});
 D.addEventListener('keydown',function(e){if(mode!=='home'||L.classList.contains('cbs-yield')||e.ctrlKey||e.metaKey||e.altKey)return;var tg=e.target;if(tg&&/INPUT|TEXTAREA|SELECT/.test(tg.tagName))return;var n=parseInt(e.key,10);if(n>=1&&n<=cfg.buttons.length){e.preventDefault();var bb=L.querySelector('[data-n="'+n+'"]');bb&&bb.click()}});
 W.addEventListener('error',function(){fail()});W.addEventListener('unhandledrejection',function(){fail()});
 setInterval(tick,250);enterHome();
}
function init(c){cfg=c;cfg.buttons=cfg.buttons||[];
 function go(){try{build()}catch(e){try{var d=D.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:900;background:#fff;color:#1c2431;font:700 26px system-ui,sans-serif;padding:30px;text-align:center';d.innerHTML='<p>The phone is getting ready. Please wait a moment.</p><p><button style="min-height:96px;font-size:28px;padding:0 30px;border-radius:24px;border:0;background:#1f7a52;color:#fff" onclick="location.reload()">Try again</button></p>';D.body.appendChild(d)}catch(x){}}}
 if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',go);else go()}
W.CBS={init:init,telNum:telNum,cbId:cbId,ctx:ctx,version:'1'};
})();
