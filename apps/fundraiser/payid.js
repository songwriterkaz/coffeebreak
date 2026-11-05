/* Coffeebreak PayID helper: copy buttons + reference */
window.cbCopy=function(t,btn){function done(ok){if(btn){var o=btn.textContent;btn.textContent=ok?'Copied':'Copy failed, select it';setTimeout(function(){btn.textContent=o},1800)}}
try{navigator.clipboard.writeText(t).then(function(){done(true)},function(){fb()})}catch(e){fb()}
function fb(){try{var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();var ok=document.execCommand('copy');a.remove();done(ok)}catch(e){done(false)}}};
window.cbRef=function(p){var c='ABCDEFGHJKMNPQRSTUVWXYZ23456789',s='';for(var i=0;i<5;i++)s+=c[Math.floor(Math.random()*c.length)];return p+'-'+s};
