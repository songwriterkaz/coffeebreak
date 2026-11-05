function q(s){return document.querySelector(s)}
function openCover(){var c=q('#cover');if(c&&!c.classList.contains('open'))c.click()}
CBS.init({
 title:'Coffeebreak Bible Phone',sub:'Holy Bible and radio',logo:'logo.jpg',theme:{bg:'#f3ead8'},
 hello:'Tap a big button.',resume:'All done. Tap a big button to go again.',
 disclaimer:'The Bible text is the King James Version, in the public domain. The radio is free Wi-Fi only and cannot call 000.',
 overlays:['#radio'],
 css:'#radio button#rClose{top:auto!important;bottom:8px!important;left:8px!important;right:8px!important;min-height:96px!important;font-size:26px!important;border-radius:22px!important}body.cbs-simple #radio iframe{height:calc(100% - 112px)!important}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
 buttons:[
  {id:'verse',label:'Verse for today',icon:'book',color:'#1f4fa3',speak:'Verse for today',run:function(ctx){
    openCover();var t=q('#tDay');if(!t){ctx.warn('The verse is not ready. Please reload this page.');return}t.click();
    var i=q('#page .card i'),b=q('#page .card b');
    if(!i){ctx.warn('Could not find today\u2019s verse. Please try again.');return}
    var v=i.textContent.trim(),r=b?b.textContent.trim():'';
    ctx.say(v,{icon:'book',sub:r,silent:true,actions:[{label:'Read the whole chapter',run:function(){var o=q('#dGo');if(o)o.click();ctx.handoff()}}]});
    ctx.speak(v+'. '+r)}},
  {id:'read',label:'Read the Bible',icon:'note',color:'#1f7a52',speak:'Read the Bible',run:function(ctx){openCover();var t=q('#tRead');if(t)t.click();ctx.handoff()}},
  {id:'talk',label:'Talk on the radio',icon:'radio',color:'#a8431a',speak:'Talk on the radio',run:function(ctx){openCover();var t=q('#tPhone');if(!t){ctx.warn('The radio is not ready. Please reload this page.');return}ctx.say('Opening the radio. Please wait.',{icon:'radio'});t.click()}}
 ]
});
