/* shared radio helpers for the CB radio pages (talk, say hello, call a friend) */
var CBR=(function(){
function q(s){return document.querySelector(s)}
function poll(fn,ms,step){return new Promise(function(res){var t=0;(function f(){var v;try{v=fn()}catch(e){}if(v||t>=ms)return res(v);t+=step||250;setTimeout(f,step||250)})()})}
var talking=false;
function onAir(){return /On air/i.test((q('#st')||{}).textContent||'')}
async function join(ctx){
 if(onAir())return true;
 if(!window.CB){ctx.warn('The radio is not ready. Please reload this page.');return false}
 try{if(CB.on&&CB.tuneOut)CB.tuneOut()}catch(e){}
 ctx.say('Joining the radio. Please wait.',{icon:'radio'});
 try{q('#tune').click()}catch(e){try{CB.tuneIn()}catch(x){}}
 var ok=await poll(onAir,14000,300);
 if(!ok){ctx.warn('Could not join the radio. Check the internet, then tap the button again.');return false}
 var mic=await poll(function(){return CB.mic},4000,300);
 if(!mic){ctx.warn('The microphone is off. Please allow the microphone, then tap the button again.',{sub:'You can still say hello.'});return true}
 return true}
async function talk(ctx){
 if(talking){CB.txEnd();talking=false;ctx.setButton('talk',{label:'Talk',icon:'mic',color:'#1f7a52'});ctx.say('Done. Others can answer now.',{icon:'check'});return}
 var ok=await join(ctx);if(!ok)return;if(!CB.mic)return;
 CB.txStart();talking=true;ctx.setButton('talk',{label:'Stop talking',icon:'stop',color:'#b3261e'});ctx.say('You are talking. Tap again when you are done.',{icon:'mic'})}
async function hello(ctx,text){
 if(talking){CB.txEnd();talking=false;ctx.setButton('talk',{label:'Talk',icon:'mic',color:'#1f7a52'})}
 var ok=await join(ctx);if(!ok)return;
 CB.sendMsg(text||'Hello from Coffeebreak');
 var last=(q('#log')||{}).textContent||'';
 ctx.say(/nobody else/i.test(last.slice(0,300))?'Sent. No one else is listening yet.':'Sent. Your hello is on the radio.',{icon:'check'})}
async function friend(ctx){
 var id=null;try{id=localStorage.getItem('cbs_friend')}catch(e){}
 if(!id||!/^\d{6}$/.test(id)){
  var v=await ctx.ask({title:'Who do you want to call',placeholder:'6 digit phone ID',hint:'Ask a grown-up. Your friend finds their 6 digit phone ID under Grown-ups, then App call.',bad:'The phone ID is 6 numbers. Please check it.',validate:function(x){x=String(x||'').replace(/\D/g,'');return x.length===6?x:null}});
  if(!v){ctx.say('Okay. No one was called.',{icon:'check'});return}
  id=v;try{localStorage.setItem('cbs_friend',id)}catch(e){}}
 if(!window.cbcall){ctx.warn('Calling is not ready. Please reload this page.');return}
 ctx.say('Calling your friend. Please wait.',{icon:'call'});
 cbcall.show(true);cbcall.call(id,false);
 var st=await poll(function(){return cbcall.state().inCall},3000);
 if(!st){ctx.say('The call did not start. Check the answer on screen.',{icon:'call',warn:true})}}
return {talk:talk,hello:hello,friend:friend,onAir:onAir,reset:function(){talking=false}}
})();
CBS.init({
 title:'Coffeebreak Phone',sub:'Radio and calls',logo:'logo.jpg',theme:{bg:'#eaf1f7'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'Free Wi-Fi radio and calls between Coffeebreak phones. Not a phone company SIM. It cannot call 000.',
 overlays:['#cbc.on'],
 onHome:function(){CBR.reset()},
 css:'@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 buttons:[
  {id:'talk',label:'Talk',icon:'mic',color:'#1f7a52',speak:'Talk',run:CBR.talk},
  {id:'hello',label:'Say hello',icon:'msg',color:'#1f4fa3',speak:'Say hello',run:function(c){return CBR.hello(c,'Hello from Coffeebreak')}},
  {id:'call',label:'Call a friend',icon:'call',color:'#a8431a',speak:'Call a friend',run:CBR.friend}
 ]
});
