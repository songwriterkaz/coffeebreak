/* Simple home for Coffeebreak WifiPhone Kids (and the iPhone edition). */
(function(){
var K='cbk_';
function jget(k){try{var v=localStorage.getItem(K+k);return v===null?null:JSON.parse(v)}catch(e){return null}}
var mum=function(){return jget('mum')};
var isCB=function(s){return /CB-?\d{4}-?\d{4}/i.test(String(s||''))};
function poll(fn,ms,step){return new Promise(function(res){var t=0;(function f(){var v;try{v=fn()}catch(e){}if(v||t>=ms)return res(v);t+=step||250;setTimeout(f,step||250)})()})}
function q(s){return document.querySelector(s)}
var seq=0;
function validMum(v){v=String(v||'').trim();var t=v.replace(/[\s()-]/g,'');return (/CB-?\d{4}-?\d{4}/i.test(v)||/^\+?\d{3,15}$/.test(t))?v:null}
async function ensureMum(ctx){
 if(mum())return true;
 if(jget('pin')){ctx.click('#help');ctx.warn('A grown-up needs to pick Mum first.',{sub:'Use the Grown-ups button at the top.'});return false}
 var v=await ctx.ask({title:'Who is Mum',placeholder:'CB number or phone number',hint:'Ask a grown-up to type this once. A CB number looks like CB-1234-5678.',bad:'That is not a CB number or a phone number. Please check it.',validate:validMum});
 if(!v){ctx.say('Okay. No one was called.',{icon:'check'});return false}
 q('#mumin').value=v;ctx.click('#mumsave');
 if(!mum()){ctx.warn('Mum was not saved. Please try again.');return false}
 return true}
async function callMum(ctx){
 if(!await ensureMum(ctx))return;
 var m=mum();
 if(!isCB(m)){ctx.click('#help');ctx.say('Opening the phone call screen.',{icon:'call',sub:'Press the green button to call Mum.'});return}
 ctx.say('Calling Mum. Please wait.',{icon:'call'});
 ctx.click('#help');
 var shown=await poll(function(){return q('#call.show')},3000);
 if(!shown)ctx.warn('The call did not start. Check the Wi-Fi, then tap Call Mum again.')}
async function sendMsg(ctx,sel,okText,loc){
 if(!await ensureMum(ctx))return false;
 var m=mum(),my=++seq;
 ctx.say(loc?'Sending. Finding where you are.':'Sending.',{icon:'msg',silent:true});
 var before=document.querySelectorAll('#msgs .m.me').length;
 ctx.click(sel);
 if(!isCB(m)){ctx.say('Your messages app is opening.',{icon:'msg',sub:'Press send to tell Mum.'});return false}
 var ok=await poll(function(){return document.querySelectorAll('#msgs .m.me').length>before},loc?9000:2500);
 if(my!==seq)return false;
 if(!ok){ctx.warn('That did not send. Tap the button again.');return false}
 var off=/Not connected/i.test((q('#log')||{}).textContent||'');
 ctx.say(off?'Saved. It will send when there is Wi-Fi.':okText,{icon:'check'});
 poll(function(){var l=document.querySelectorAll('#msgs .m.me'),x=l[l.length-1];return x&&/Mum got it/.test(x.textContent)},25000,500).then(function(g){if(g&&my===seq&&!document.querySelector('#cbs-st .cbs-act'))ctx.say('Mum got your message.',{icon:'heart'})});
 return true}
function e000On(){try{return localStorage.getItem('cbk_e000')==='on'}catch(e){return false}}
CBS.init({
 title:'WifiPhone Kids',sub:'Coffeebreak',logo:'logo.png',theme:{bg:'#f4eefb'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'Free Wi-Fi calls and messages between Coffeebreak WifiPhone users. Not a phone company SIM. For Emergency 000, ask a grown-up.',
 hide:['#cbopen'],
 onA2hs:function(){var a=document.getElementById('a2hs');if(!a)throw 0;a.classList.add('show')},
 overlays:['.ov.show','#cbc.on'],
 css:'#sov{animation:none!important;background:#7a1020!important}'
  +'#call .b,#call button{min-height:120px}#ans,#dec,#hang{min-height:120px!important;font-size:32px!important;border-radius:30px!important}#cwho{font-size:40px!important}#cstate{font-size:24px!important}'
  +'@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 buttons:[
  {id:'call',label:'Call Mum',icon:'call',color:'#1f7a52',speak:'Call Mum',run:callMum},
  {id:'ok',label:"I'm OK",icon:'heart',color:'#1f4fa3',speak:"I'm OK",run:function(c){return sendMsg(c,'#ok','Sent. Mum knows you are OK.',false)}},
  {id:'help',label:'I need help',icon:'help',color:'#a8431a',speak:'I need help',run:async function(c){
    var sent=await sendMsg(c,'#need','Sent. Mum knows you need help.',true);
    if(!sent)return;
    var acts=[{label:'Loud siren',icon:'sos',color:'#7a1020',run:function(cc){cc.click('#siren');cc.say('The siren is on. Tap Stop to turn it off.',{icon:'help',warn:true})}}];
    if(e000On())acts.push({label:'Call 000',icon:'call',color:'#b3261e',run:function(cc){cc.click('#e000')}});
    var last=document.querySelector('#cbs-st .cbs-tx');
    c.say(last?last.firstChild.textContent:'Sent. Mum knows you need help.',{icon:'check',silent:true,actions:acts})}}
 ]
});
if(window.cbcall&&window.cbcall.show)try{window.cbcall.show(false)}catch(e){}
})();
