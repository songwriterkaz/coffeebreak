/* Simple home for Keep It Simple Susan (phone-app version). Calls and texts open the device's own apps. */
(function(){
function favs(){try{return JSON.parse(localStorage.getItem('susan_favs')||'null')||[]}catch(e){return[]}}
function first(){var f=favs().filter(function(x){return x&&x.n&&x.t});return f[0]||null}
async function who(ctx,title){
 var f=first();if(f)return f;
 var v=await ctx.ask({title:title,placeholder:'Phone number',hint:'Ask a grown-up to type this once. It is only saved on this device.',bad:'That does not look like a phone number. Please check it.',validate:CBS.telNum});
 if(!v){ctx.say('Okay. Nothing was sent.',{icon:'check'});return null}
 var t=CBS.telNum(v),a=favs();while(a.length<4)a.push({n:'',t:''});a[0]={n:'my person',t:t};
 localStorage.setItem('susan_favs',JSON.stringify(a));try{F[0].n='my person';F[0].t=t;fav()}catch(e){}
 return a[0]}
function dial(t){return String(t).replace(/[^0-9+]/g,'')}
CBS.init({
 title:'Keep It Simple Susan',sub:'a Coffeebreak phone',logo:'img/logo.jpg',theme:{bg:'#fff5f9'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:"Calls and texts open your device's own phone and messages apps, so they work on a phone with a SIM or calling plan. Emergency 000 only works where your device can call 000. This is a free app, not a phone service.",
 rights:"All Coffeebreak products, designs, apps, the Coffeebreak name and logo belong to Karen O'Brien, who keeps all rights.",
 hide:['#cbopen'],overlays:['#cbc.on'],
 buttons:[
  {id:'call',label:'Call',icon:'call',color:'#1f7a52',speak:'Call',run:async function(c){var f=await who(c,'Who do you want to call');if(!f)return;c.say('Opening your phone to call '+f.n+'.',{icon:'call',sub:'Press the green call button.'});setTimeout(function(){c.go('tel:'+dial(f.t))},700)}},
  {id:'text',label:'Text',icon:'msg',color:'#1f4fa3',speak:'Text. I am OK',run:async function(c){var f=await who(c,'Who should get your texts');if(!f)return;c.say('Opening your messages. It says I am OK.',{icon:'msg',sub:'Press send.'});setTimeout(function(){c.go('sms:'+dial(f.t)+'?&body='+encodeURIComponent('I am OK'))},700)}},
  {id:'sos',label:'Emergency 000',icon:'sos',color:'#b3261e',speak:'Emergency 000',run:async function(c){
    var y=await c.confirm({text:'Call 000 for an emergency now',sub:'This opens your phone call screen. Only continue if you need the police, fire or an ambulance.',yes:'Yes, call 000',icon:'call',no:'No, go back'});
    if(y){c.say('Opening your phone to call 000.',{icon:'call',warn:true});setTimeout(function(){c.go('tel:000')},500)}}}
 ]
});
if(window.cbcall&&window.cbcall.show)try{window.cbcall.show(false)}catch(e){}
})();
