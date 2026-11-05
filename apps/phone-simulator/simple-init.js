/* Simple home for Coffeebreak Phone (the Wi-Fi calling phone with CB numbers). */
(function(){
function poll(fn,ms,step){return new Promise(function(res){var t=0;(function f(){var v;try{v=fn()}catch(e){}if(v||t>=ms)return res(v);t+=step||250;setTimeout(f,step||250)})()})}
function P(){return window.PHONE}
function pretty(n){n=String(n);return n.length===10?n.slice(0,4)+' '+n.slice(4,7)+' '+n.slice(7):n}
async function friend(ctx,why){
 var p=P();if(!p){ctx.warn('The phone is not ready. Please wait a moment and try again.');return null}
 var c=(p.contacts||[]).filter(function(x){return x&&/^\d{10}$/.test(String(x.num))})[0];
 if(c)return c;
 var v=await ctx.ask({title:why,placeholder:'Their 10 digit CB number',hint:'Ask a grown-up to type this once. It looks like 0420 123 456.',bad:'That is not a 10 digit CB number. Please check it.',validate:function(s){var d=String(s||'').replace(/\D/g,'');return /^\d{10}$/.test(d)?d:null}});
 if(!v){ctx.say('Okay. No one was called.',{icon:'check'});return null}
 var n=String(v).replace(/\D/g,'');
 if(n===String(MYNUM)){ctx.warn('That is your own number. Please ask a grown-up to type your friend\u2019s number.');return null}
 c={name:'My friend',num:n};p.contacts.push(c);try{LS.set('contacts',p.contacts)}catch(e){}return c}
async function call(ctx){
 var p=P();if(p&&p.call){ctx.say('A call is already happening.',{icon:'call'});return}
 var c=await friend(ctx,'Who do you want to call');if(!c)return;
 ctx.say('Calling '+c.name+'. Please wait.',{icon:'call',sub:'If asked, tap Allow for the microphone.',silent:true});
 try{placeCall(c.num,false)}catch(e){ctx.warn('The call did not start. Please try again.');return}
 var started=await poll(function(){return p.call},4000);
 if(!started){ctx.warn(p.status&&!/Ready|Connecting/i.test(p.status)?'The call did not start. '+p.status.replace(/[^\w .,'-]/g,''):'The call did not start. Check the Wi-Fi, then tap Call again.');return}
 poll(function(){return !p.call},600000,1000).then(function(){var h=(p.hist||[])[0];ctx.say('The call has ended.',{icon:'check',sub:/microphone|camera/i.test(p.status||'')?'The microphone is off. Ask a grown-up to allow it.':''})})}
async function hello(ctx){
 var p=P();var c=await friend(ctx,'Who do you want to message');if(!c)return;
 ctx.say('Sending your hello.',{icon:'msg',silent:true});
 try{sendMsg(c.num,'Hello from Coffeebreak')}catch(e){ctx.warn('The message did not send. Please try again.');return}
 var list=(p.msgs&&p.msgs[c.num])||[],m=list[list.length-1];
 var r=await poll(function(){return m&&m.st&&m.st!=='sending'?m.st:''},32000,500);
 if(r==='delivered')ctx.say('Sent. '+c.name+' got your hello.',{icon:'check'});
 else ctx.warn(c.name+' is not online right now. Try again later.')}
function mine(ctx){ctx.say('Your number is CB '+pretty(MYNUM)+'.',{icon:'help',sub:'Tell your friends this number so they can call you.'})}
CBS.init({
 title:'Coffeebreak Phone',sub:'Free Wi-Fi calls',logo:'assets/hero.png',theme:{bg:'#fdf1f4'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'CB numbers are Coffeebreak app numbers, not real mobile numbers. This phone only calls other people using the Coffeebreak Phone app over Wi-Fi or the internet. It cannot call normal phone numbers or emergency services. In an emergency call 000 from a real phone.',
 hide:['#cb2b-fab','#cbfs-btn','#cbStrip','#cb2b-ov'],
 overlays:['#callScr'],
 css:'#callScr button{min-height:96px!important;min-width:96px;font-size:26px!important;padding:0 26px!important;border-radius:30px!important}#callScr{gap:18px}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 buttons:[
  {id:'call',label:'Call a friend',icon:'call',color:'#1f7a52',speak:'Call a friend',run:call},
  {id:'hello',label:'Say hello',icon:'msg',color:'#1f4fa3',speak:'Say hello',run:hello},
  {id:'mine',label:'My number',icon:'help',color:'#7a4fa3',speak:'My number',run:mine}
 ]
});
})();
