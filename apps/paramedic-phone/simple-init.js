(function(){
function q(s){return document.querySelector(s)}
var SOSDIS='SOS may not work. The Coffeebreak Phone is Wi-Fi only with no SIM, so it may not be able to call 000. In an emergency use a mobile phone with a SIM or a landline.';
var beat=false;
function med(){var b=q('#mMed');if(b&&!q('#mMed.on'))b.click()}
CBS.init({
 title:'Coffeebreak Paramedic Phone',sub:'First aid help',logo:'logo.jpg',theme:{bg:'#eef3f1'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'First aid information only. Not a medical device. In an emergency call 000. '+SOSDIS,
 overlays:['#pWhite:not([hidden])'],
 css:'#pWhite{color:#222!important;font-size:30px!important;font-weight:800;padding-bottom:40px!important}#cbs .cbs-foot .cbs-d{font-size:15px;font-weight:700;color:#1d2433}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 onHome:function(){},
 buttons:[
  {id:'sos',label:'Call 000',icon:'call',color:'#7a1020',speak:'Call 000',run:async function(ctx){
    var y=await ctx.confirm({text:'Call 000 for an emergency now',sub:SOSDIS,yes:'Yes, call 000',no:'No, go back',icon:'call'});
    if(y){ctx.say('Opening your phone call screen.',{icon:'call',sub:'Press the green call button.'});ctx.go('tel:000')}}},
  {id:'cpr',label:'CPR beat',icon:'pulse',color:'#b3261e',speak:'CPR beat',run:function(ctx){
    med();var m=q('#pMet');if(!m){ctx.warn('The CPR beat is not ready. Please reload this page.');return}
    m.click();var on=/Stop/i.test(m.textContent);beat=on;
    if(on){ctx.setButton('cpr',{label:'Stop the beat',icon:'stop',color:'#55607a'});ctx.say('The beat is on. Push hard and fast in the centre of the chest.',{icon:'pulse',sub:'30 pushes, then 2 breaths. Call 000 first.',silent:true})}
    else{ctx.setButton('cpr',{label:'CPR beat',icon:'pulse',color:'#b3261e'});ctx.say('The beat is off.',{icon:'check'})}}},
  {id:'torch',label:'Torch',icon:'torch',color:'#1f4fa3',speak:'Torch',run:async function(ctx){
    med();var t=q('#pTorch');if(!t){ctx.warn('The torch is not ready. Please reload this page.');return}
    t.click();await new Promise(function(r){setTimeout(r,900)});
    if(/off/i.test(t.textContent)){ctx.setButton('torch',{label:'Torch off',icon:'torch',color:'#55607a'});ctx.say('The torch is on.',{icon:'torch'})}
    else if(q('#pWhite:not([hidden])')){ctx.say('The screen is a bright white light. Tap it to turn it off.',{icon:'torch',silent:true})}
    else{ctx.setButton('torch',{label:'Torch',icon:'torch',color:'#1f4fa3'});ctx.say('The torch is off.',{icon:'check'})}}}
 ]
});
})();
