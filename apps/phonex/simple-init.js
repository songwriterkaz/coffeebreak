/* Simple home for Coffeebreak Phone X. */
/* Compatibility: the bundled Trystero is the newer API (properties and action objects). The original app code uses the older function style. Wrap joinRoom so both work. */
(function(){var T=window.Trystero;if(!T||T.__cbcompat||typeof T.joinRoom!=='function')return;var j=T.joinRoom;
T.joinRoom=function(){var r=j.apply(T,arguments);if(!r||typeof r.onPeerJoin==='function')return r;
 return{leave:function(){return r.leave()},ping:r.ping,getPeers:r.getPeers,
  addStream:function(s,p){return r.addStream(s,p?{target:p}:{})},
  onPeerJoin:function(f){r.onPeerJoin=f},onPeerLeave:function(f){r.onPeerLeave=f},
  onPeerStream:function(f){r.onPeerStream=function(st,i){f(st,i&&i.peerId)}},
  makeAction:function(n){var a=r.makeAction(n);return[function(d,t){return a.send(d,t?{target:t}:undefined)},function(f){a.onReceive=function(d,i){f(d,i&&i.peerId)}}]}}};
T.__cbcompat=1})();
(function(){
function q(s){return document.querySelector(s)}
function poll(fn,ms,step){return new Promise(function(res){var t=0;(function f(){var v;try{v=fn()}catch(e){}if(v||t>=ms)return res(v);t+=step||250;setTimeout(f,step||250)})()})}
function code(){try{return localStorage.getItem('cbs_code')||''}catch(e){return ''}}
async function ensureCode(ctx,title){
 var c=code();if(c)return c;
 var v=await ctx.ask({title:title,placeholder:'Family code, for example kaz-family',hint:'Ask a grown-up to type this once. The other phone uses the same code.',bad:'Please type a code with at least 3 letters or numbers.',validate:function(s){s=String(s||'').trim();return /^[A-Za-z0-9._-]{3,40}$/.test(s)?s:null}});
 if(!v)return '';v=String(v).trim();try{localStorage.setItem('cbs_code',v)}catch(e){}return v}
function unlock(){var l=q('#lock');if(l&&l.style.display!=='none')l.click()}
var calling=false;
function hang(ctx){var b=q('#ch');if(b)b.click();calling=false;ctx.setButton('call',{label:'Call',icon:'call',color:'#1f7a52'});ctx.say('The call has ended.',{icon:'check'})}
async function call(ctx){
 if(calling){return hang(ctx)}
 var c=await ensureCode(ctx,'Who do you want to call');if(!c){ctx.say('Okay. No one was called.',{icon:'check'});return}
 unlock();window.pxOpen('phone');
 var cc=q('#cc'),ca=q('#ca');if(!cc||!ca){ctx.warn('The call did not start. Please try again.');return}
 cc.value=c;ctx.say('Calling. Please wait.',{icon:'call',sub:'If asked, tap Allow for the microphone.'});ca.click();
 calling=true;ctx.setButton('call',{label:'Hang up',icon:'stop',color:'#b3261e'});
 var s=await poll(function(){var t=q('#cs');return t&&/waiting|Needs Wi-Fi|allow/i.test(t.textContent)?t.textContent:''},6000);
 if(/Needs Wi-Fi/i.test(s||'')){calling=false;ctx.setButton('call',{label:'Call',icon:'call',color:'#1f7a52'});ctx.warn('There is no Wi-Fi. Check the Wi-Fi, then tap Call again.')}
 else if(/allow/i.test(s||'')){calling=false;ctx.setButton('call',{label:'Call',icon:'call',color:'#1f7a52'});ctx.warn('The microphone is off. Ask a grown-up to allow it, then tap Call again.')}
 else ctx.say('Ringing. Waiting for the other phone to join.',{icon:'call',sub:'Tap Hang up to stop.',silent:true})}
async function hello(ctx){
 var c=await ensureCode(ctx,'Who do you want to message');if(!c){ctx.say('Okay. Nothing was sent.',{icon:'check'});return}
 if(calling)hang(ctx);
 unlock();window.pxOpen('msg');
 var mc=q('#mc'),mj=q('#mj'),mt=q('#mt'),ms=q('#ms');if(!mc||!mj||!mt||!ms){ctx.warn('Messages did not open. Please try again.');return}
 if(!window.Trystero){ctx.warn('There is no Wi-Fi. Check the Wi-Fi, then tap Say hello again.');return}
 var bad=0;function onE(){bad=1}window.addEventListener('error',onE);mc.value=c;try{mj.click()}catch(e){bad=1}window.removeEventListener('error',onE);
 if(bad){ctx.warn('Could not connect. Check the Wi-Fi, then tap Say hello again.');return}
 mt.value='Hello from Coffeebreak';ms.click();
 ctx.say('Sent. Your hello is on its way.',{icon:'check',sub:'Your friend sees it when their phone is open.'})}
async function help(ctx){
 var y=await ctx.confirm({text:'Call 000 for an emergency now',sub:'Wi-Fi only phones may not be able to dial 000. Use any mobile phone or landline if needed.',yes:'Yes, call 000',no:'No, go back',icon:'call'});
 if(y){ctx.say('Opening your phone call screen.',{icon:'call',sub:'Press the green call button.'});ctx.go('tel:000')}
 else ctx.say('Okay. No call was made.',{icon:'check'})}
CBS.init({
 title:'Phone X',sub:'Coffeebreak',logo:'cb-logo.jpg',theme:{bg:'#eef1f8'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'Free Wi-Fi calls and messages between Coffeebreak Phone X users. Not a phone company SIM. Wi-Fi only phones may not be able to call 000.',
 hide:['#cbPhys','#aod'],
 overlays:[],
 css:'#aod{display:none!important}#cbPhys{display:none!important}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 onHome:function(){unlock()},
 buttons:[
  {id:'call',label:'Call',icon:'call',color:'#1f7a52',speak:'Call',run:call},
  {id:'hello',label:'Say hello',icon:'msg',color:'#1f4fa3',speak:'Say hello',run:hello},
  {id:'help',label:'Call 000',icon:'sos',color:'#7a1020',speak:'Emergency',run:help}
 ]
});
})();
