
/* ---------- navigation ---------- */
var LABELS=['Setup','Experiences','Board and share','Collect and win','Winner packs','Results'];
function buildNav(){var n=clear($('nav'));LABELS.forEach(function(l,i){var b=el('button',{type:'button','data-step':String(i+1)},[el('span',{class:'n',text:String(i+1)}),l]);b.addEventListener('click',function(){go(i+1);});n.appendChild(b);});}
function renderScreen(n){if(n===1)renderSetup();else if(n===2)renderItems();else if(n===3){renderBoard($('boardRoot'),ctxOrg());renderShare();}else if(n===4)renderCollect();else if(n===5)renderPacks();else if(n===6)renderResults();}
function go(n){cur=n;S.step=n;for(var i=1;i<=6;i++){$('screen'+i).className='screen'+(i===n?' on':'');}
 var bs=$('nav').querySelectorAll('button');for(var j=0;j<bs.length;j++){if(+bs[j].getAttribute('data-step')===n)bs[j].setAttribute('aria-current','step');else bs[j].removeAttribute('aria-current');}
 $('firstNotice').className=n===1?'notice':'notice hidden';
 $('prev').style.visibility=n===1?'hidden':'visible';$('next').style.visibility=n===6?'hidden':'visible';
 renderScreen(n);window.scrollTo(0,0);save();}
function refresh(){if(document.body.getAttribute('data-guest'))renderGuest();else renderScreen(cur);}

/* ---------- guest ---------- */
function renderGuest(){var ev=GUEST.ev,root=clear($('guestRoot'));
 root.appendChild(el('h2',{id:'gEvent',text:ev.name}));
 if(ev.by)root.appendChild(el('p',{id:'gBy',text:'Run by '+ev.by}));
 root.appendChild(el('p',{id:'gCharity'},['Winning bids go to: ',el('b',{text:ev.charity||'the charity the organiser chooses'}),'. ',el('a',{href:'https://www.acnc.gov.au/charity',target:'_blank',rel:'noopener noreferrer',text:'Check a charity on the ACNC Charity Register'})]));
 if(ev.items.some(function(i){return i.ex;}))root.appendChild(el('p',{class:'notice',text:'Some experiences in this auction are marked Example data. They are made up for demonstration.'}));
 var how=el('div',{class:'card'},[el('h3',{text:'How it works',style:'margin-top:0'}),el('ol',null,[el('li',{text:'Choose an experience for you and a friend or partner and make a pledged bid. It must be at least the next bid shown.'}),el('li',{text:'The app writes a message. Send it to the organiser yourself by text or email, or copy it.'}),el('li',{text:'At the closing time the organiser merges the bids. The highest pledge wins that experience.'}),el('li',{text:'A winner pays the charity or the organiser directly, outside the app. The app holds and takes no money.'})])]);
 root.appendChild(how);
 var bd=el('div',{id:'boardG'});root.appendChild(bd);renderBoard(bd,ctxGuest());
 if(ev.pay)root.appendChild(el('div',{class:'card',id:'gPay'},[el('h3',{text:'How winners pay',style:'margin-top:0'}),el('p',{text:ev.pay})]));
 var own=el('button',{class:'btn',type:'button',id:'runOwn',text:'Run my own fundraiser with this app'});own.addEventListener('click',function(){location.hash='';});
 root.appendChild(el('div',{class:'btns'},[own]));}
function show(id){['screen1','screen2','screen3','screen4','screen5','screen6','guest','bad'].forEach(function(x){$(x).className='screen'+(x===id?' on':'');});}
function startGuest(ev){document.body.setAttribute('data-mode','guest');document.body.setAttribute('data-guest','1');
 $('guestBar').className='';$('nav').className='steps hidden';$('pager').className='pager hidden';$('firstNotice').className='notice';$('saved').textContent='';$('installBtn').className=$('installBtn').className;
 GUEST={ev:ev,bids:[],name:'',last:Object.create(null)};guestLoad();show('guest');renderGuest();window.scrollTo(0,0);}
function showBad(why){document.body.setAttribute('data-mode','guest');document.body.setAttribute('data-guest','1');$('guestBar').className='hidden';$('nav').className='steps hidden';$('pager').className='pager hidden';$('firstNotice').className='notice';$('saved').textContent='';
 var r=clear($('badRoot'));r.appendChild(el('p',{class:'warnbox',id:'badMsg',role:'alert',text:'The link may have been cut off when it was shared, or it may not come from this app. Nothing from it was loaded. Ask the organiser to send the link again.'}));
 var b=el('button',{class:'btn primary',type:'button',id:'badGo',text:'Open the organiser tools instead'});b.addEventListener('click',function(){location.hash='';});r.appendChild(el('div',{class:'btns'},[b]));show('bad');GUEST=null;}
function startOrg(){document.body.setAttribute('data-mode','org');document.body.removeAttribute('data-guest');$('guestBar').className='hidden';$('nav').className='steps';$('pager').className='pager';GUEST=null;
 var h=/^#step-(\d)$/.exec(location.hash||'');var n=h&&+h[1]>=1&&+h[1]<=6?+h[1]:(S.step||1);go(n);
 $('storeWarn').className=storeOK?'warnbox hidden':'warnbox';if(S.saved)$('saved').textContent='Loaded your saved event from this device';}
var routeTok=0;
function route(){var tok=++routeTok,m=/^#a=(.*)$/.exec(location.hash||'');
 if(!m){startOrg();return;}
 unpack(m[1]).then(function(o){if(tok!==routeTok)return;var ev=fromLink(o);if(!ev)throw new Error('shape');startGuest(ev);},function(){if(tok===routeTok)showBad();}).catch(function(){if(tok===routeTok)showBad();});}

/* ---------- events ---------- */
function populate(){var els=document.querySelectorAll('[data-k]');for(var i=0;i<els.length;i++){var t=els[i],v=getp(S,t.getAttribute('data-k'));if(t.type==='checkbox')t.checked=v===true;else t.value=v==null?'':v;}}
function contactHint(){var E=S.event,m=[];if(E.sms&&!cleanPhone(E.sms))m.push('That number will be left out of the link. Use digits, spaces, plus and brackets only.');if(E.email&&!cleanEmail(E.email))m.push('That email address will be left out of the link.');$('contactHint').textContent=m.join(' ');}
document.addEventListener('input',function(e){var t=e.target;if(document.body.getAttribute('data-guest'))return;var k=t.getAttribute&&t.getAttribute('data-k');if(!k)return;
 var v=t.type==='checkbox'?t.checked:t.value;
 if(k==='event.min'||k==='event.step'){var n=toInt(v);v=isNaN(n)?v:n;}
 setp(S,k,v);if(k==='event.close'||k==='event.min'||k==='event.step')S.confirmed=null;
 if(cur===1){renderSetup();contactHint();}save();});
document.addEventListener('change',function(e){var t=e.target;if(document.body.getAttribute('data-guest'))return;if(t.getAttribute&&t.getAttribute('data-k')&&t.type==='checkbox'){setp(S,t.getAttribute('data-k'),t.checked);save();}});
function onId(id,fn){$(id).addEventListener('click',fn);}
onId('prev',function(){if(cur>1)go(cur-1);});onId('next',function(){if(cur<6)go(cur+1);});
onId('i_save',saveItem);onId('i_cancel',function(){endEdit();$('i_err').className='warnbox hidden';});
(function(){var old=$('rmEx');var nb=armBtn('Remove all examples','Confirm remove all examples',function(){var ids={};S.items.forEach(function(i){if(i.ex)ids[i.id]=1;});S.items=S.items.filter(function(i){return !i.ex;});S.bids=S.bids.filter(function(b){return !ids[b.item];});S.confirmed=null;save();refresh();toast('Examples removed');});nb.id='rmEx';old.parentNode.replaceChild(nb,old);})();
onId('addEx',function(){var have={};S.items.forEach(function(i){have[i.id]=1;});var add=starter().filter(function(i){return !have[i.id];});if(!add.length){toast('All the examples are already there');return;}add.forEach(function(i){if(S.items.length<30)S.items.push(i);});S.confirmed=null;save();refresh();});
onId('mergeBtn',function(){showMerge(mergePasted($('paste').value));renderCollect();});
onId('pasteClear',function(){$('paste').value='';clear($('mergeRep'));});
onId('printSum',function(){doPrint('summary');});
onId('copySum',function(){copyText(sumText()).then(function(ok){$('sumMsg').textContent=ok?'Results copied.':'Could not copy. Use the CSV download instead.';});});
onId('csvRes',function(){download('date-night-auction-results.csv','text/csv;charset=utf-8',resultsCSV());$('sumMsg').textContent='Downloaded date-night-auction-results.csv.';});
onId('csvBids',function(){download('date-night-auction-bids.csv','text/csv;charset=utf-8',bidsCSV());$('sumMsg').textContent='Downloaded date-night-auction-bids.csv.';});
onId('jsonAll',function(){download('date-night-auction.json','application/json',JSON.stringify({app:'Coffeebreak Date Night Auction',exported:new Date().toISOString(),notice:NOTICE_TXT,data:S},null,2));$('sumMsg').textContent='Downloaded date-night-auction.json.';});
onId('reset1',function(){$('reset1').className='btn danger hidden';$('reset2').className='btn danger';$('reset3').className='btn small';});
onId('reset3',function(){$('reset1').className='btn danger';$('reset2').className='btn danger hidden';$('reset3').className='btn small hidden';});
onId('reset2',function(){try{window.localStorage.removeItem(KEY);}catch(e){}S=blank();lastLink='';endEdit();populate();$('paste').value='';clear($('mergeRep'));go(1);toast('Everything has been cleared');$('reset1').className='btn danger';$('reset2').className='btn danger hidden';$('reset3').className='btn small hidden';$('saved').textContent='Nothing saved yet';});
var deferred=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;$('installBtn').className='btn small';});
onId('installBtn',function(){if(deferred){deferred.prompt();deferred=null;$('installBtn').className='btn small hidden';}});
window.addEventListener('hashchange',route);

buildNav();load();populate();contactHint();
setInterval(tick,1000);
route();
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});}
window.DNA={state:function(){return S;},standing:standing,checkAmount:checkAmount,bidCode:bidCode,mergePasted:mergePasted,resultsCSV:resultsCSV,bidsCSV:bidsCSV,sumText:sumText,buildICS:buildICS,orgEv:orgEv,unpack:unpack,fromLink:fromLink};
})();
</script>
</body></html>
