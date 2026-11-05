/* Coffeebreak spell core – original text, generated in the browser (no server). Shared by every store + the Video Readings site. */
(function(){
if(window.CBSpellCore)return;
var SITE='https://coffeebreaks.itch.io/coffeebreak-video-readings';
function hash(s){s=String(s||'');var h=1779033703^s.length;for(var i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^=h>>>16)>>>0}}
function rng(seed){var a=hash(seed)();return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function pick(r,a){return a[Math.floor(r()*a.length)]}
function cap(s){s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)}
function cleanName(n){n=String(n||'').replace(/[<>{}\[\]\\\/"`]/g,'').replace(/\s+/g,' ').trim();n=n.split(' ')[0]||'';return n.slice(0,24)||'Friend'}
var THEMES={
 love:{k:/love|heart|lingerie|ring|wedding|rose|kiss|perfume|knot|valentine|romance|boudoir|bride|lace|satin|couple/i,word:'love and sweet connection',colour:['pink','rose-red','soft pink'],gems:['rose quartz','a pink ribbon','dried rose petals','a pinch of cinnamon','a drop of vanilla'],goal:['your heart feels full','love finds its way to your door','kindness comes back to you twice over','the right people pull up a chair']},
 money:{k:/gold|silver|bullion|coin|diamond|opal|jade|gem|money|pawn|bargain|cash|card|collect|antique|mining|rough|lego|stock|invest/i,word:'abundance and good fortune',colour:['gold','green','emerald'],gems:['a shiny coin','three coffee beans','a bay leaf','a sprig of mint','a green ribbon'],goal:['money flows in like fresh coffee','every door you knock on opens','your bargains turn to treasure','your hard work is paid in full']},
 joy:{k:/toy|kid|plush|beanie|candy|sweet|treat|fairy|floss|marshmallow|ice ?cream|yoghurt|dessert|game|lucky|dip|theme ?park|rps|draw|whiteboard|camp|koala|emu|donkey|porcupine|critter|cat|dog|pet/i,word:'joy and giggles',colour:['sky blue','sunny yellow','bubblegum pink'],gems:['a sprinkle of sugar','a bright button','a feather','a smiley drawing','a ribbon bow'],goal:['every day has a little sparkle','laughter follows you around','fun finds you when you need it','your smile lights up the room']},
 protect:{k:/ghost|haunt|ouija|spirit|black ?magick|murder|thriller|survival|snake|spider|skull|crystal|witch|spell|magick|voodoo|horror|detector/i,word:'protection and calm',colour:['black','deep purple','silver'],gems:['a pinch of sea salt','a black stone','a sprig of rosemary','a silver pin','a clove of garlic'],goal:['only good energy gets through','worries melt away like sugar','you walk safe and steady','your home stays calm and bright']},
 confidence:{k:/dress|outfit|jacket|leather|denim|wig|hat|cosplay|fashion|wear|gym|street|ray ?ban|sunglass|shoe|formal|anime|furry|salon|hair|spa|beauty|pinup|merch/i,word:'confidence and sparkle',colour:['red','hot pink','gold'],gems:['a dab of glitter','a mirror','a red ribbon','a sprig of lavender','a drop of rosewater'],goal:['you walk in and own the room','your style speaks before you do','you feel brave and beautiful','people remember your shine']},
 inspire:{k:/music|record|mic|studio|guitar|amp|radio|song|book|art|paint|craft|sketch|print|projector|vision|camera|laptop|iphone|phone|nintendo|gaming/i,word:'inspiration and big ideas',colour:['purple','turquoise','silver'],gems:['a pencil','a guitar pick','a sprig of rosemary','a star sticker','a few drops of lemon'],goal:['ideas pour out like coffee','your talent gets noticed','the words and tunes come easy','you finish what you start']},
 home:{k:/coffee|tea|bakery|cake|pie|pizza|pasta|burger|hot ?dog|chocolate|honey|caramel|food|cuisine|garden|bonsai|flower|homeware|candle|kitchen|boat|camping|astronomy|geology|telescope|travel|cruise|moto|car/i,word:'warmth and home comforts',colour:['warm orange','cream','honey gold'],gems:['a cinnamon stick','a spoonful of honey','a sprig of thyme','a few coffee beans','a slice of orange'],goal:['your home smells like happiness','every meal is shared with love','you feel cosy and safe','good things grow around you']},
 luck:{k:/./,word:'luck and happy surprises',colour:['green','gold','white'],gems:['a four-leaf clover drawing','three coffee beans','a shiny coin','a sprig of basil','a white ribbon'],goal:['luck walks beside you','happy surprises land in your lap','the stars line up for you','things just go your way']}
};
var ORDER=['love','money','protect','joy','confidence','inspire','home','luck'];
function theme(items){var s=(items||[]).join(' ');for(var i=0;i<ORDER.length;i++){if(THEMES[ORDER[i]].k.test(s))return ORDER[i]}return 'luck'}
var WHEN=['on the next full moon','on a Friday night','at sunrise with your first coffee','on the next new moon','just before bed tonight','on any quiet evening this week','when the kettle starts to sing','at 3 o\'clock on a sunny afternoon'];
var BREW=['a flat white','a strong black coffee','a hot chocolate','a mug of chai','a cappuccino with extra froth','a cup of sweet tea','an iced latte','a caramel latte'];
var STEPS=[
 'Stir your cup clockwise three times and picture the moment {goal}.',
 'Hold {gem} in your left hand and breathe in slowly.',
 'Write your first name on a scrap of paper and fold it towards you.',
 'Place {gem} beside the candle and watch the flame dance.',
 'Blow gently across your cup so the steam carries your wish away.',
 'Tap the table three times: once for today, once for tomorrow, once for you.',
 'Smile at yourself in the mirror and say your own name out loud.',
 'Let the candle burn safely while you finish your drink, then snuff it out (never leave a flame alone).'];
var CHANTS={
 love:[['Sugar in the cup, a candle burning bright,','bring me love and laughter, morning, noon and night.'],['Heart to heart and hand to hand,','sweetest love, come take my hand.'],['Pink flame glowing, warm and true,','send the love I give back through.']],
 money:[['Bean by bean and coin by coin,','let good fortune come and join.'],['Golden flame and golden brew,','bring abundance pouring through.'],['Pennies, pounds and dollars too,','come to me in all I do.']],
 joy:[['Sprinkles, bubbles, giggles, glee,','bring the happy days to me.'],['Twinkle, twinkle, candle light,','make my days all fun and bright.'],['Spin around and touch the sky,','let my smile stay big and high.']],
 protect:[['Salt and smoke and silver bright,','keep me safe by day and night.'],['Circle round and circle tight,','nothing passes but the light.'],['Candle black and candle tall,','guard my home and guard my all.']],
 confidence:[['Mirror, mirror, see me shine,','every step I take is mine.'],['Red flame burning, head held high,','I am fabulous – that\'s why.'],['Glitter, gold and something new,','let the world see what I do.']],
 inspire:[['Pencil, string and starlight beam,','come and fill me with a dream.'],['Purple flame and coffee steam,','wake the music, wake the dream.'],['One more line and one more tune,','ideas come like rising moon.']],
 home:[['Honey, spice and kettle song,','keep my home warm all year long.'],['Bread and butter, beans and brew,','bless my home and those I do.'],['Little flame by window glass,','let the cosy moments last.']],
 luck:[['Clover green and coffee black,','luck is here and won\'t look back.'],['Lucky stars and lucky bean,','bring the best I\'ve ever seen.'],['Turn the cup and make a wish,','luck is served up on a dish.']]
};
var OPEN=['A little magic brewed just for you, {name}.','{name}, the candle is lit and the coffee is hot – this one is yours.','Pull up a chair, {name}. Coffeebreak has written you a spell.','For {name}, with love from the Coffeebreak table.','{name}, every cup tells a story – here is yours.'];
var CLOSE=['So brewed, so blessed, so mote it be. ☕','And so it is – sip slowly and smile.','The spell is cast. Keep your cup close and your heart open.','Done and dusted with sugar on top. ✨','May it be as sweet as the last sip.'];
function fill(s,o){return s.replace(/\{(\w+)\}/g,function(_,k){return o[k]!=null?o[k]:''})}
function shortItem(t){t=String(t||'').replace(/\s*[–—-]\s*\$.*$/,'').replace(/\s+x\d+$/,'').replace(/\(.*?\)/g,'').replace(/\s+/g,' ').trim();return t.length>48?t.slice(0,46).replace(/\s+\S*$/,'')+'…':t}
/* make({name, items:[titles], seed, intention}) -> {name,title,theme,lines[],text} */
function make(o){o=o||{};var name=cleanName(o.name),items=(o.items||[]).map(shortItem).filter(Boolean).slice(0,6);
 var th=o.intention?theme([o.intention]):theme(items),T=THEMES[th],r=rng([name,items.join('|'),o.seed||'',o.intention||''].join('#'));
 var gem1=pick(r,T.gems),gem2=pick(r,T.gems.filter(function(g){return g!==gem1})),goal=pick(r,T.goal),col=pick(r,T.colour);
 var what=o.intention?'for '+String(o.intention).replace(/^for\s+/i,'').slice(0,80):(items.length?'for your '+(items.length>1?items.slice(0,-1).join(', ')+' and '+items[items.length-1]:items[0]):'for you');
 var steps=STEPS.slice();var st=[];for(var i=0;i<3;i++){st.push(steps.splice(Math.floor(r()*(steps.length-1)),1)[0])}st.push(STEPS[STEPS.length-1]);
 var ch=pick(r,CHANTS[th]),f={name:name,goal:goal,gem:gem1};
 var L=[fill(pick(r,OPEN),f),
  'This is a spell of '+T.word+' '+what+'.',
  'Light a '+col+' candle '+pick(r,WHEN)+'.',
  'Gather '+gem1+', '+gem2+' and '+pick(r,BREW)+'.'];
 st.forEach(function(s){L.push(fill(s,{goal:goal,gem:pick(r,[gem1,gem2])}))});
 L.push('Say it three times: “'+ch[0]+' '+ch[1]+'”');
 L.push('By the next new moon, '+goal+'.');
 L.push(pick(r,CLOSE));
 var title='A Coffeebreak Spell for '+name;
 return {name:name,title:title,theme:th,lines:L,text:title+'\n\n'+L.join('\n')+'\n\n(For fun and entertainment only.)'}}
function link(name,text){return SITE+'?mode=spell&name='+encodeURIComponent(cleanName(name))+'&spell='+encodeURIComponent(String(text||'').slice(0,1400))}
window.CBSpellCore={make:make,link:link,rng:rng,hash:hash,pick:pick,cap:cap,cleanName:cleanName,theme:theme,THEMES:THEMES,SITE:SITE};
})();
/* Coffeebreak: free personalised spell on every purchase (shared snippet, no server).
   - adds the buyer's spell + a spell-video link to the order email the store already builds
   - shows the spell on the order confirmation screen with a candle, the Coffeebreak girl and read-aloud */
(function(){
if(window.CBSpell)return;
var C=window.CBSpellCore,MARK='COFFEEBREAK SPELL',last=null;
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function field(){var sel=['#cName','#name','#custName','#customerName','input[name=name]','input[autocomplete=name]','input[id*=name i]:not([type=hidden])'];for(var i=0;i<sel.length;i++){try{var e=document.querySelector(sel[i]);if(e&&e.value&&e.value.trim())return e.value.trim()}catch(x){}}return ''}
function parse(body,subject){body=String(body||'');var m=body.match(/^\s*(?:customer\s+)?(?:full\s+)?name[ \t]*[:\-][ \t]*(\S.*)$/im),name=(m&&m[1].trim())||field();
 var items=[],re=/^\s*\d+[.)]\s+(.+)$/gm,x;while((x=re.exec(body))&&items.length<6){var t=x[1].replace(/\s+x\d+\b.*$/,'').replace(/\s+[–—-]\s+\$.*$/,'').replace(/\s*\$\d.*$/,'').trim();if(t&&!/^(look up|add to cart|ship|pay|email)/i.test(t))items.push(t)}
 if(!items.length){var re2=/^\s*[-•*]\s+(.+)$/gm;while((x=re2.exec(body))&&items.length<6)items.push(x[1].replace(/\s*\$\d.*$/,'').trim())}
 if(!items.length){var tt=(document.title||'').replace(/coffeebreak/ig,'').replace(/[–—|-]+/g,' ').trim();items.push(tt||'Coffeebreak treasure')}
 var o=(String(subject||'')+' '+body).match(/\b(CB[A-Z0-9]{6,})\b/);return {name:name,items:items,order:o?o[1]:''}}
function shortLink(sp,p){return C.SITE+'?mode=order&name='+encodeURIComponent(sp.name)+'&items='+encodeURIComponent(p.items.join('|'))+(p.order?'&o='+p.order:'')}
function spellFor(body,subject){var p=parse(body,subject);p.items=p.items.slice(0,3).map(function(t){return t.slice(0,40)});var sp=C.make({name:p.name,items:p.items,seed:p.order});sp.link=C.link(sp.name,sp.text);sp.short=shortLink(sp,p);sp.order=p.order;return sp}
function addToBody(body,subject,show){body=String(body||'');if(body.indexOf(MARK)>=0)return body;var sp=spellFor(body,subject);last=sp;try{localStorage.setItem('cbSpell:last',JSON.stringify({text:sp.text,link:sp.link,name:sp.name}))}catch(e){}
 if(show)setTimeout(function(){panel(sp)},300);
 return body+'\n\n────────────\n✨ CUSTOMER\'S FREE '+MARK+' ✨\n(Included with every purchase – the customer sees this on their confirmation screen. Send it to them again with their tracking.)\n\n'+sp.text+'\n\n▶ Spell video (candle + the Coffeebreak girl reads it aloud): '+sp.short+'\nIf the page doesn\'t load the spell by itself, tap "Got a spell link?" and paste the link.'}
function url(u,silent){u=String(u||'');if(!/^mailto:/i.test(u))return u;var i=u.indexOf('?');if(i<0)return u;var q=u.slice(i+1).split('&'),sub='',bi=-1,body='';
 q.forEach(function(kv,j){var k=kv.split('=')[0].toLowerCase(),v='';try{v=decodeURIComponent(kv.slice(kv.indexOf('=')+1).replace(/\+/g,' '))}catch(e){}if(k==='subject')sub=v;if(k==='body'){bi=j;body=v}});
 if(bi<0||body.length<30||body.indexOf(MARK)>=0)return u;q[bi]='body='+encodeURIComponent(addToBody(body,sub,!silent));return u.slice(0,i+1)+q.join('&')}
function hookOrder(){var O=window.CBOrder;if(!O||O.__cbspell||typeof O.mail!=='function')return!!(O&&O.__cbspell);var orig=O.mail;O.mail=function(subject,body,email){return orig.call(this,subject,addToBody(body,subject,true),email)};O.__cbspell=true;return true}
var tries=0,iv=setInterval(function(){if(hookOrder()||++tries>40)clearInterval(iv)},250);hookOrder();
document.addEventListener('DOMContentLoaded',hookOrder);window.addEventListener('load',hookOrder);
document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href^="mailto:"]');if(!a)return;var h=a.getAttribute('href')||'';if(h.indexOf('body=')<0||!/subject=[^&]*(order|quote|request|purchase|booking|buy)/i.test(decodeURIComponent(h)))return;var n=url(h,false);if(n!==h)a.setAttribute('href',n)},true);
/* ---------- confirmation-screen spell player ---------- */
var CSS='#cbsp-ov{position:fixed;inset:0;background:rgba(20,8,18,.72);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:12px;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}'+
'#cbsp{background:linear-gradient(160deg,#4a1d3c,#1b0f1a);color:#fbeef3;border:3px solid #ff8fc0;border-radius:20px;max-width:760px;width:100%;max-height:94vh;overflow:auto;box-shadow:0 20px 60px #000c;display:grid;grid-template-columns:190px 1fr;gap:4px 16px;padding:16px;position:relative}'+
'#cbsp h3{grid-column:1/-1;margin:0;font:700 22px Georgia,serif;color:#ffd3e6;padding-right:30px}#cbsp .cbsp-sub{grid-column:1/-1;margin:0 0 6px;font-size:13px;opacity:.85}'+
'#cbsp .cbsp-stage{position:relative;height:260px}#cbsp .cbsp-girl{position:absolute;left:0;bottom:0;height:230px;animation:cbspSway 3.6s ease-in-out infinite;transform-origin:50% 100%}#cbsp.talk .cbsp-girl{animation:cbspTalk .3s ease-in-out infinite alternate}'+
'#cbsp .cbsp-candle{position:absolute;right:6px;bottom:0;width:34px;height:90px;background:linear-gradient(90deg,#e98bb0,#ffc6dc,#c9628c);border-radius:4px 4px 6px 6px}#cbsp .cbsp-candle:before{content:"";position:absolute;left:16px;top:-12px;width:2px;height:12px;background:#222}'+
'#cbsp .cbsp-flame{position:absolute;left:7px;top:-46px;width:20px;height:36px;background:radial-gradient(ellipse at 50% 75%,#fffbe0 0 20%,#ffd24a 40%,#ff7a1a 70%,transparent 72%);border-radius:50% 50% 45% 45%/65% 65% 35% 35%;animation:cbspFl .16s ease-in-out infinite alternate;filter:drop-shadow(0 0 12px #ffb347);transform-origin:50% 100%}'+
'#cbsp .cbsp-glow{position:absolute;right:-50px;bottom:20px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(255,190,90,.35),transparent 70%);animation:cbspGl 2.4s ease-in-out infinite}'+
'#cbsp .cbsp-txt p{margin:0 0 6px;opacity:0;transition:opacity .5s}#cbsp .cbsp-txt p.on{opacity:1}#cbsp .cbsp-txt p.now{color:#ffd36b}#cbsp .cbsp-txt p.t{font-weight:700;color:#ff9cc8}'+
'#cbsp .cbsp-btns{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}#cbsp button,#cbsp a.cbsp-b{font:600 14px system-ui,sans-serif;cursor:pointer;border-radius:999px;border:2px solid #ff8fc0;background:#3a1630;color:#ffe3ef;padding:8px 14px;text-decoration:none;display:inline-block}'+
'#cbsp .cbsp-main{background:linear-gradient(90deg,#ff5fa2,#ff9a6b)!important;border:0!important;color:#fff!important}#cbsp .cbsp-x{position:absolute;right:10px;top:8px;padding:2px 10px!important}'+
'#cbsp .cbsp-note{grid-column:1/-1;font-size:11px;opacity:.75;margin:6px 0 0}#cbsp .cbsp-logo{height:34px;width:34px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;border:2px solid #ffd3e6}'+
'@keyframes cbspSway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1.2deg) translateY(-3px)}}@keyframes cbspTalk{from{transform:scaleY(1)}to{transform:scaleY(1.015) translateY(-3px)}}'+
'@keyframes cbspFl{0%{transform:scale(1,1) rotate(-3deg)}50%{transform:scale(.92,1.08) rotate(2deg)}100%{transform:scale(1.05,.95) rotate(0)}}@keyframes cbspGl{50%{opacity:.6;transform:scale(1.08)}}'+
'@media(max-width:600px){#cbsp{grid-template-columns:1fr}#cbsp .cbsp-stage{height:200px}#cbsp .cbsp-girl{height:180px;left:20%}}';
function base(){var s=document.currentScript||document.querySelector('script[src*="cb-spell.js"]');var src=s&&s.getAttribute('src')||'cb-spell.js';return src.replace(/cb-spell\.js.*$/,'')}
var BASE=base();
function logoSrc(){var i=document.querySelector('#cb-logo,img[alt*="Coffeebreak" i][src*="logo"],img[src*="cb-logo"],img[src*="logo"]');return i?i.getAttribute('src'):''}
var tok=0;
function stopTalk(){tok++;try{speechSynthesis.cancel()}catch(e){}var b=document.getElementById('cbsp');b&&b.classList.remove('talk')}
function readAloud(sp){var my=++tok,box=document.getElementById('cbsp');if(!box)return;var ps=box.querySelectorAll('.cbsp-txt p'),i=0;box.classList.add('talk');
 function next(){if(my!==tok)return;ps.forEach(function(p){p.classList.remove('now')});if(i>=ps.length){box.classList.remove('talk');return}var p=ps[i++];p.classList.add('on','now');p.scrollIntoView&&p.scrollIntoView({block:'nearest'});
  var t=p.textContent,ms=Math.max(1800,t.length*60),done=false,go=function(){if(!done){done=true;setTimeout(next,250)}};
  try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance){var u=new SpeechSynthesisUtterance(t);u.lang='en-AU';u.rate=.95;u.pitch=1.15;var vs=speechSynthesis.getVoices().filter(function(v){return /^en/i.test(v.lang)});var v=vs.find(function(v){return /en-AU/i.test(v.lang)})||vs[0];if(v)u.voice=v;u.onend=go;u.onerror=go;speechSynthesis.speak(u);setTimeout(go,ms*2.6+4000);return}}catch(e){}
  setTimeout(go,ms)}
 next()}
function panel(sp){if(!sp||!document.body)return;try{if(!document.getElementById('cbsp-css')){var st=document.createElement('style');st.id='cbsp-css';st.textContent=CSS;document.head.appendChild(st)}}catch(e){}
 var old=document.getElementById('cbsp-ov');old&&old.remove();var lg=logoSrc();
 var ov=document.createElement('div');ov.id='cbsp-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Your free Coffeebreak spell');
 var mail='mailto:?subject='+encodeURIComponent(sp.title)+'&body='+encodeURIComponent(sp.text+'\n\nWatch it: '+sp.short);
 ov.innerHTML='<div id="cbsp"><button type="button" class="cbsp-x" aria-label="Close">✕</button><h3>'+(lg?'<img class="cbsp-logo" src="'+esc(lg)+'" alt="Coffeebreak logo">':'')+'✨ Your free Coffeebreak spell ✨</h3><p class="cbsp-sub">Thank you for your order'+(sp.order?' '+esc(sp.order):'')+'! Every purchase comes with a spell written just for you.</p>'+
  '<div class="cbsp-stage"><div class="cbsp-glow"></div><img class="cbsp-girl" src="'+BASE+'cb-spell-girl.webp" alt="The Coffeebreak girl"><div class="cbsp-candle"><div class="cbsp-flame"></div></div></div>'+
  '<div class="cbsp-txt"><p class="t on">'+esc(sp.title)+'</p>'+sp.lines.map(function(l){return '<p class="on">'+esc(l)+'</p>'}).join('')+'</div>'+
  '<div class="cbsp-btns"><button type="button" class="cbsp-main cbsp-read">▶ Read it to me</button><a class="cbsp-b" href="'+esc(sp.link)+'" target="_blank" rel="noopener">🎬 Watch my spell video</a><button type="button" class="cbsp-copy">📋 Copy spell</button><a class="cbsp-b" href="'+esc(mail)+'">✉️ Email it to me</a><button type="button" class="cbsp-close">Close</button></div>'+
  '<p class="cbsp-note">For fun and entertainment only. Never leave a candle burning alone (kids – ask a grown-up). Your spell is also in your order email.</p></div>';
 document.body.appendChild(ov);
 function close(){stopTalk();ov.remove()}
 ov.querySelector('.cbsp-x').onclick=close;ov.querySelector('.cbsp-close').onclick=close;ov.addEventListener('click',function(e){if(e.target===ov)close()});
 ov.querySelector('.cbsp-read').onclick=function(){ov.querySelectorAll('.cbsp-txt p:not(.t)').forEach(function(p){p.classList.remove('on')});readAloud(sp)};
 ov.querySelector('.cbsp-copy').onclick=function(){var b=this,t=sp.text+'\n\n'+sp.link;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='✓ Copied'},function(){b.textContent='Select the text to copy'})}}
/* back from PayPal: show the same spell (seeded by order number) */
try{var q=new URLSearchParams(location.search),no=q.get('cbpaid');if(no){var pend=null;try{pend=JSON.parse(localStorage.getItem('cbPending:'+no)||'null')}catch(e){}var showIt=function(){var sp=spellFor(pend?pend.body:'Order '+no,pend?pend.subject:no);panel(sp)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(showIt,600)});else setTimeout(showIt,600)}}catch(e){}
window.CBSpell={addToBody:addToBody,url:url,spellFor:spellFor,show:panel,parse:parse,last:function(){return last}};
})();
/* Coffeebreak: 'Support Coffeebreak' donation button (shared snippet). AU: PayID or PayPal. Overseas: PayPal only (same PayPal cart checkout as the store). */
(function(){
if(window.CBDonate)return;
var PAYID='darkokaz@gmx.com',PAYPAL_URL='https://www.paypal.com/cgi-bin/webscr',BUSINESS='songwriterkaz@gmail.com';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function inAU(){try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';if(/^Australia\//.test(tz))return true;if(tz)return false}catch(e){}return /-AU$/i.test(navigator.language||'')}
function no(){return 'CBD'+Date.now().toString(36).toUpperCase()+Math.floor(Math.random()*90+10)}
function paypal(amount,ref){var P=window.CBPay;var it=[{name:'Support Coffeebreak – donation',amount:amount,qty:1}],f;
 if(P&&P.buildForm)f=P.buildForm({items:it,currency:'AUD',orderNo:ref});
 else{f=document.createElement('form');f.method='post';f.action=PAYPAL_URL;f.target='_blank';[['cmd','_cart'],['upload','1'],['business',BUSINESS],['currency_code','AUD'],['charset','utf-8'],['invoice',ref],['custom',ref],['item_name_1',it[0].name],['amount_1',amount.toFixed(2)],['quantity_1','1']].forEach(function(p){var i=document.createElement('input');i.type='hidden';i.name=p[0];i.value=p[1];f.appendChild(i)})}
 document.body.appendChild(f);f.submit();setTimeout(function(){f.remove()},2000)}
var CSS='#cbdn-btn{display:inline-flex;align-items:center;gap:4px;font:700 13px system-ui,sans-serif;background:#ff5fa2;color:#fff;border:0;border-radius:999px;padding:6px 12px;cursor:pointer;box-shadow:0 2px 8px #0003;margin:6px}#cbdn-btn.fix{position:fixed;left:12px;bottom:12px;z-index:2147482000}'+
'#cbdn-ov{position:fixed;inset:0;background:rgba(20,8,18,.7);z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:12px;font:15px/1.45 system-ui,sans-serif}'+
'#cbdn{background:linear-gradient(160deg,#4a1d3c,#1b0f1a);color:#fbeef3;border:3px solid #ff8fc0;border-radius:20px;max-width:440px;width:100%;max-height:94vh;overflow:auto;padding:16px 18px;position:relative;box-shadow:0 20px 60px #000c}'+
'#cbdn h3{margin:0 0 4px;font:700 21px Georgia,serif;color:#ffd3e6}#cbdn p{margin:6px 0}#cbdn .am{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}'+
'#cbdn button{font:600 14px system-ui,sans-serif;cursor:pointer;border-radius:999px;border:2px solid #ff8fc0;background:#3a1630;color:#ffe3ef;padding:7px 14px}#cbdn .am button.on{background:#ff5fa2;color:#fff}'+
'#cbdn input{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:10px;border:2px solid #7a3a62;background:#1b0f1a;color:#fff;font:inherit;margin-top:3px}#cbdn label{display:block;margin:6px 0;font-size:13px;font-weight:600}'+
'#cbdn .main{background:linear-gradient(90deg,#ff5fa2,#ff9a6b);border:0;color:#fff}#cbdn .pp{background:#ffc439;color:#111;border:0}#cbdn .x{position:absolute;right:10px;top:8px;padding:2px 10px}'+
'#cbdn .box{background:#fff;color:#3a1630;border-radius:12px;padding:10px;margin-top:8px}#cbdn .msg{color:#a6f5c0;font-size:13px;min-height:18px}#cbdn .seg{display:flex;gap:6px;margin:6px 0}#cbdn .seg button.on{background:#ffd3e6;color:#3a1630}#cbdn small{opacity:.75}';
function css(){if(document.getElementById('cbdn-css'))return;var s=document.createElement('style');s.id='cbdn-css';s.textContent=CSS;document.head.appendChild(s)}
function thanks(ov,name,amt,ref,how){var sp=window.CBSpell?CBSpell.spellFor('Name: '+name+'\n1. Support Coffeebreak','Donation '+ref):null;
 var b=ov.querySelector('.body');b.innerHTML='<h3>💗 Thank you'+(name?', '+esc(name):'')+'!</h3><p>Your $'+amt.toFixed(2)+' AUD support means the world – it keeps the coffee brewing, the music playing and the Coffeebreak girl dancing. ☕</p><p><small>'+esc(how)+' · Ref '+esc(ref)+'</small></p>'+
  (sp?'<p><b>Here\'s a spell, just for you:</b></p><div class="box">'+esc(sp.lines.slice(0,3).join(' '))+'…</div><div class="am"><a href="'+esc(sp.link)+'" target="_blank" rel="noopener"><button type="button" class="main">🎬 Watch my spell video</button></a><button type="button" class="full">📜 Read my full spell</button></div>':'')+
  '<button type="button" class="cl">Close</button>';
 b.querySelector('.cl').onclick=function(){ov.remove()};var f=b.querySelector('.full');if(f)f.onclick=function(){ov.remove();CBSpell.show(sp)}}
function open(){css();var old=document.getElementById('cbdn-ov');old&&old.remove();var au=inAU(),amt=10;
 var ov=document.createElement('div');ov.id='cbdn-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Support Coffeebreak');
 ov.innerHTML='<div id="cbdn"><button type="button" class="x" aria-label="Close">✕</button><div class="body"><h3>💗 Support Coffeebreak</h3><p>Love what Karen makes? Shout her a coffee. Every supporter gets a free spell video. 🕯️</p>'+
  '<div class="am">'+[5,10,20,50].map(function(v){return '<button type="button" data-v="'+v+'"'+(v===10?' class="on"':'')+'>$'+v+'</button>'}).join('')+'<button type="button" data-v="c">Custom</button></div>'+
  '<label class="cu" hidden>Custom amount (AUD)<input type="number" min="2" max="5000" step="1" inputmode="decimal" placeholder="e.g. 15"></label>'+
  '<label>Your first name (for your spell)<input class="nm" maxlength="24" placeholder="optional"></label>'+
  '<div class="seg" role="group" aria-label="Where are you?"><button type="button" data-w="au">🇦🇺 In Australia</button><button type="button" data-w="os">🌏 Overseas</button></div>'+
  '<div class="am pay"></div><div class="pid"></div><p class="msg" role="status"></p><p><small>Donations are voluntary gifts to support Coffeebreak; you don\'t receive goods for them. Amounts in AUD.</small></p></div></div>';
 document.body.appendChild(ov);
 var q=function(s){return ov.querySelector(s)},msg=q('.msg');
 q('.x').onclick=function(){ov.remove()};ov.addEventListener('click',function(e){if(e.target===ov)ov.remove()});
 ov.querySelectorAll('.am button[data-v]').forEach(function(b){b.onclick=function(){ov.querySelectorAll('.am button[data-v]').forEach(function(x){x.classList.remove('on')});b.classList.add('on');if(b.dataset.v==='c'){q('.cu').hidden=false;q('.cu input').focus()}else{q('.cu').hidden=true;amt=+b.dataset.v}}});
 function amount(){if(!q('.cu').hidden){var v=Math.round(parseFloat(q('.cu input').value)*100)/100;if(!(v>=2&&v<=5000)){msg.textContent='Please enter an amount between $2 and $5000.';return 0}return v}return amt}
 function setWhere(w){au=w==='au';ov.querySelectorAll('.seg button').forEach(function(b){b.classList.toggle('on',b.dataset.w===w)});q('.pid').innerHTML='';
  q('.pay').innerHTML='<button type="button" class="pp">Donate with PayPal</button>'+(au?'<button type="button" class="main pidb">Donate by PayID</button>':'');
  q('.pp').onclick=function(){var a=amount();if(!a)return;var ref=no();paypal(a,ref);thanks(ov,(q('.nm').value||'').trim(),a,ref,'PayPal opened in a new tab')};
  var pb=q('.pidb');if(pb)pb.onclick=function(){var a=amount();if(!a)return;var ref=no();q('.pid').innerHTML='<div class="box"><b>Pay by PayID (bank transfer)</b><br>PayID: <b>'+PAYID+'</b><br>Amount: <b>$'+a.toFixed(2)+' AUD</b><br>Reference: <b>'+ref+'</b><br><button type="button" class="main sent" style="margin-top:8px">I\'ve sent it 💗</button></div>';q('.sent').onclick=function(){thanks(ov,(q('.nm').value||'').trim(),a,ref,'PayID transfer')}}}
 ov.querySelectorAll('.seg button').forEach(function(b){b.onclick=function(){setWhere(b.dataset.w)}});setWhere(au?'au':'os')}
function mount(){if(document.getElementById('cbdn-btn')||!document.body)return;css();var b=document.createElement('button');b.type='button';b.id='cbdn-btn';b.innerHTML='💗 Support Coffeebreak';b.title='Support Coffeebreak';b.onclick=open;
 var h=document.querySelector('header'),f=document.querySelector('footer');if(h)h.appendChild(b);else if(f)f.appendChild(b);else{b.classList.add('fix');document.body.appendChild(b)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.CBDonate={open:open,mount:mount};
})();
