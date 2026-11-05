<script>
(function(){
'use strict';
var KEY='coffeebreak_date_night_auction_v1';
var NOTICE_TXT="Coffeebreak Date Night Auction holds and takes no money. A bid is a pledge only. Payment goes straight from the winner to the charity or the organiser, outside the app. Organisers must check local fundraising and charity rules (in NSW an authority to fundraise from NSW Fair Trading may be needed) and that the charity is registered on the ACNC Charity Register. Coffeebreak is not a party to any auction, sale, pledge or payment. Not legal advice. Karen O'Brien (Coffeebreak) keeps all rights to the app, design, name and logo. You may use it to run your own fundraiser. You may not copy it or make your own versions of the app. https://coffeebreaks.itch.io";
var LOGO=document.getElementById('hlogo').src;
function $(id){return document.getElementById(id);}
function el(tag,attrs,kids){var e=document.createElement(tag);if(attrs){for(var k in attrs){if(!Object.prototype.hasOwnProperty.call(attrs,k))continue;var v=attrs[k];if(k==='text')e.textContent=v;else if(k==='class')e.className=v;else if(v!==false&&v!==null&&v!==undefined)e.setAttribute(k,v===true?'':v);}}
 if(kids){for(var i=0;i<kids.length;i++){if(kids[i]!=null)e.appendChild(typeof kids[i]==='string'?document.createTextNode(kids[i]):kids[i]);}}return e;}
function clear(n){while(n.firstChild)n.removeChild(n.firstChild);return n;}
function pad(n){return (n<10?'0':'')+n;}
function rid(n){var s='',a='abcdefghijklmnopqrstuvwxyz0123456789';if(window.crypto&&crypto.getRandomValues){var u=new Uint8Array(n);crypto.getRandomValues(u);for(var i=0;i<n;i++)s+=a[u[i]%36];}else{for(var j=0;j<n;j++)s+=a[Math.floor(Math.random()*36)];}return s;}
function str(v,n){return typeof v==='string'?v.replace(/[\u0000-\u001f\u007f\u2028\u2029]/g,' ').replace(/\s+/g,' ').trim().slice(0,n):'';}
function toInt(v){if(typeof v==='number')return isFinite(v)&&Math.floor(v)===v?v:NaN;if(typeof v!=='string')return NaN;var t=v.replace(/[\s,$]/g,'');return /^\d{1,7}$/.test(t)?parseInt(t,10):NaN;}
function money(n){return '$'+Number(n).toLocaleString('en-AU');}
var ID_RE=/^(?!__)[A-Za-z0-9_-]{1,16}$/;
function fmtDT(ms,tz){if(!isFinite(ms))return '-';var o={weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'};
 try{if(tz){o.timeZone=tz;o.timeZoneName='short';}return new Date(ms).toLocaleString('en-AU',o);}catch(e){delete o.timeZone;return new Date(ms).toLocaleString('en-AU',o);}}
function fmtDate(iso){var p=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');if(!p)return '';return new Date(Date.UTC(+p[1],+p[2]-1,+p[3])).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});}
function fmtTime(t){var p=/^(\d{2}):(\d{2})$/.exec(t||'');if(!p)return '';var h=+p[1];return (h%12||12)+':'+p[2]+' '+(h<12?'am':'pm');}
function myTZ(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){return '';}}

/* ---------- sanitizers ---------- */
function cleanItem(o){if(!o||typeof o!=='object')return null;var t=str(o.title,80);if(!t)return null;
 var v=toInt(o.value);return {id:ID_RE.test(o.id||'')?o.id:rid(6),title:t,desc:str(o.desc,400),value:isNaN(v)?0:Math.min(v,1000000),donor:str(o.donor,60),terms:str(o.terms,300),ex:o.ex===true};}
function cleanBid(o){if(!o||typeof o!=='object')return null;var a=toInt(o.amt),ts=o.ts;
 if(!ID_RE.test(o.id||'')||!ID_RE.test(o.item||'')||isNaN(a)||a<1||a>1000000)return null;
 if(typeof ts!=='number'||!isFinite(ts)||ts<9.5e11||ts>4.2e12)return null;var n=str(o.name,30);if(!n)return null;
 return {id:o.id,item:o.item,amt:a,name:n,ts:Math.floor(ts),src:o.src==='pasted'?'pasted':'here'};}
function cleanPhone(v){var s=str(v,20);return /^[+0-9 ()-]{3,20}$/.test(s)?s:'';}
function cleanEmail(v){var s=str(v,80);return /^[^\s@<>"'`,;:\\]+@[^\s@<>"'`,;:\\]+\.[^\s@<>"'`,;:\\]+$/.test(s)?s:'';}

/* ---------- starter examples ---------- */
function starter(){var L=[
 ['Dinner for two','A three course dinner for two with a drink each at a local restaurant.',180,'Example Bistro','Valid for 6 months from the auction. Book at least 3 days ahead directly with the donor. Not valid on public holidays.'],
 ['Sunset picnic','A picnic hamper for two with a rug and a spot picked out for you at a local park.',90,'Example Picnic Hampers','Valid for 3 months. Book 48 hours ahead directly with the donor. Weather dependent, the donor will rebook.'],
 ['Movie night','Two cinema tickets with a popcorn and drink combo to share.',60,'Example Cinema','Valid for 6 months, standard sessions only. Show the voucher at the counter.'],
 ['Dance lesson for two','A private one hour beginner lesson for two. Swing or salsa, your choice.',120,'Example Dance Studio','Valid for 6 months. Book directly with the donor. Comfortable shoes needed.'],
 ['Live music night','Entry and a table for two at a live music night, with one drink each.',100,'Example Live Music Venue','Valid for 6 months on selected nights. Book ahead directly with the donor.'],
 ['Coffee date','Two coffees and a slice of cake to share at a local cafe.',40,'Example Cafe','Valid for 3 months, no booking needed. Not valid on public holidays.']];
 return L.map(function(r,i){return {id:'ex'+(i+1),title:r[0],desc:r[1],value:r[2],donor:r[3],terms:r[4],ex:true};});}

/* ---------- state ---------- */
var storeOK=true;
function blank(){return {v:1,id:rid(8),event:{name:'',by:'',charity:'',acnc:false,rules:false,close:'',min:20,step:5,sms:'',email:'',pay:'',base:''},items:starter(),bids:[],confirmed:null,when:{},paid:{},share:{high:true},step:1,saved:''};}
var S=blank();
function mergeState(o){if(!o||typeof o!=='object')return;
 if(ID_RE.test(o.id||''))S.id=o.id;
 var e=o.event||{};var E=S.event;
 ['name:80','by:60','charity:80','pay:300','base:300'].forEach(function(p){var q=p.split(':');if(typeof e[q[0]]==='string')E[q[0]]=str(e[q[0]],+q[1]);});
 E.acnc=e.acnc===true;E.rules=e.rules===true;
 E.close=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(e.close||'')?e.close:'';
 var mn=toInt(e.min),st=toInt(e.step);if(!isNaN(mn)&&mn>=1)E.min=Math.min(mn,100000);if(!isNaN(st)&&st>=1)E.step=Math.min(st,100000);
 E.sms=cleanPhone(e.sms);E.email=cleanEmail(e.email);
 if(Array.isArray(o.items)){S.items=o.items.slice(0,30).map(cleanItem).filter(Boolean);}
 if(Array.isArray(o.bids)){S.bids=o.bids.slice(0,3000).map(cleanBid).filter(Boolean);}
 S.confirmed=(typeof o.confirmed==='number'&&isFinite(o.confirmed))?o.confirmed:null;
 if(o.when&&typeof o.when==='object'){S.when={};Object.keys(o.when).slice(0,40).forEach(function(k){if(!ID_RE.test(k))return;var w=o.when[k]||{};S.when[k]={date:/^\d{4}-\d{2}-\d{2}$/.test(w.date||'')?w.date:'',time:/^\d{2}:\d{2}$/.test(w.time||'')?w.time:'',dur:[1,2,3,4].indexOf(+w.dur)>=0?+w.dur:2,place:str(w.place,100)};});}
 if(o.paid&&typeof o.paid==='object'){S.paid={};Object.keys(o.paid).slice(0,40).forEach(function(k){if(ID_RE.test(k)&&o.paid[k]===true)S.paid[k]=true;});}
 if(o.share&&typeof o.share==='object')S.share.high=o.share.high!==false;
 var sp=toInt(o.step);if(!isNaN(sp)&&sp>=1&&sp<=6)S.step=sp;
 S.saved=typeof o.saved==='string'?o.saved.slice(0,40):'';}
function load(){try{var r=window.localStorage.getItem(KEY);if(r)mergeState(JSON.parse(r));}catch(e){storeOK=false;}}
function save(){S.saved=new Date().toISOString();try{window.localStorage.setItem(KEY,JSON.stringify(S));storeOK=true;}catch(e){storeOK=false;}
 var s=$('saved');if(s&&!document.body.getAttribute('data-guest'))s.textContent=storeOK?('Saved on this device at '+new Date().toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})):'Could not save in this browser';
 $('storeWarn').className=storeOK?'warnbox hidden':'warnbox';}
function getp(o,k){var p=k.split('.');for(var i=0;i<p.length;i++){if(o==null)return '';o=o[p[i]];}return o;}
function setp(o,k,v){var p=k.split('.');for(var i=0;i<p.length-1;i++)o=o[p[i]];o[p[p.length-1]]=v;}

function ev0(){var E=S.event;return {name:str(E.name,80),by:str(E.by,60),charity:str(E.charity,80),pay:str(E.pay,300),sms:cleanPhone(E.sms),email:cleanEmail(E.email)};}
/* ---------- auction rules ---------- */
function cfg(){var E=S.event,mn=toInt(E.min),st=toInt(E.step);return {min:(isNaN(mn)||mn<1)?1:mn,step:(isNaN(st)||st<1)?1:st};}
function closeMsOrg(){var c=S.event.close;if(!c)return NaN;var t=new Date(c).getTime();return isFinite(t)?t:NaN;}
function onGrid(min,step,a){return a>=min&&(a-min)%step===0;}
function nextGrid(min,step,high){if(high==null||high<min)return min;return min+step*(Math.floor((high-min)/step)+1);}
function standing(bids,closeMs){var valid=[],late=[];bids.forEach(function(b){if(isFinite(closeMs)&&b.ts>closeMs)late.push(b);else valid.push(b);});
 valid.sort(function(a,b){return b.amt-a.amt||a.ts-b.ts||(a.id<b.id?-1:(a.id>b.id?1:0));});return {valid:valid,late:late,lead:valid[0]||null};}
function checkAmount(min,step,high,raw){var a=toInt(raw);
 if(isNaN(a))return {err:'Enter a whole number of dollars, for example '+min+'.'};
 if(a<min)return {err:'The minimum bid is '+money(min)+'.'};
 if(!onGrid(min,step,a))return {err:'Bids go up in steps of '+money(step)+' from the minimum of '+money(min)+'. Try '+money(nextGrid(min,step,a))+'.'};
 var nx=nextGrid(min,step,high);if(a<nx)return {err:'Your bid must be at least '+money(nx)+', one step above the current highest bid.'};
 if(a>1000000)return {err:'That amount is too large for this app.'};
 return {amt:a};}
function bidsFor(itemId){return S.bids.filter(function(b){return b.item===itemId;});}
function leadFor(itemId){return standing(bidsFor(itemId),closeMsOrg()).lead;}
function itemById(id){for(var i=0;i<S.items.length;i++)if(S.items[i].id===id)return S.items[i];return null;}
function isClosedOrg(){var c=closeMsOrg();return isFinite(c)&&Date.now()>=c;}

/* ---------- messages and links ---------- */
function bidCode(aid,b){return 'DNA1|'+aid+'|'+b.item+'|'+b.amt+'|'+encodeURIComponent(b.name)+'|'+b.ts+'|'+b.id;}
function bidMessage(ev,item,b){return ['Pledged bid for '+ev.name,'Experience: '+item.title+(item.donor?' (donated by '+item.donor+')':''),'Nickname: '+b.name,'Pledge: '+money(b.amt),'This is a pledge only. If my bid wins I will pay the charity or the organiser directly, outside the app.','Bid code: '+bidCode(ev.aid,b)].join('\n');}
function smsHref(num,body){return 'sms:'+(num?num.replace(/[^+0-9]/g,''):'')+'?&body='+encodeURIComponent(body);}
function mailHref(to,subj,body){return 'mailto:'+(to||'')+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);}
function toast(m){var t=$('toast');t.textContent=m;t.className='';clearTimeout(toast.h);toast.h=setTimeout(function(){t.className='hidden';},2600);}
function copyText(txt){function fb(){var ta=el('textarea',{style:'position:fixed;left:-999px;top:0'});ta.value=txt;document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(e){}document.body.removeChild(ta);return ok;}
 if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(txt).then(function(){return true;},function(){return fb();});}return Promise.resolve(fb());}
function copyBtn(label,txt,done){var b=el('button',{class:'btn small',type:'button',text:label});b.addEventListener('click',function(){copyText(txt).then(function(ok){toast(ok?(done||'Copied'):'Could not copy. Select the text and copy it yourself.');});});return b;}
function download(name,type,text){var b=new Blob([text],{type:type});var u=URL.createObjectURL(b);var a=el('a',{href:u,download:name});document.body.appendChild(a);a.click();setTimeout(function(){document.body.removeChild(a);URL.revokeObjectURL(u);},800);}

/* link packing: JSON, UTF-8, optional deflate, base64url */
function b64uEnc(u8){var s='';for(var i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function b64uDec(t){if(!/^[A-Za-z0-9_-]+$/.test(t))throw new Error('chars');t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';var s=atob(t),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;}
function streamBytes(u8,Cls,fmt){var cs=new Cls(fmt);var w=cs.writable.getWriter();w.write(u8);w.close();return new Response(cs.readable).arrayBuffer().then(function(b){return new Uint8Array(b);});}
function pack(obj){var u8=new TextEncoder().encode(JSON.stringify(obj));
 if(typeof CompressionStream==='function'){return streamBytes(u8,CompressionStream,'deflate-raw').then(function(z){return 'z'+b64uEnc(z);},function(){return 'j'+b64uEnc(u8);});}
 return Promise.resolve('j'+b64uEnc(u8));}
var MAXHASH=24000;
function unpack(t){return new Promise(function(res,rej){
 if(typeof t!=='string'||t.length<2||t.length>MAXHASH)return rej(new Error('size'));
 var kind=t.charAt(0),u8;try{u8=b64uDec(t.slice(1));}catch(e){return rej(e);}
 function fin(b){if(b.length>200000)return rej(new Error('big'));try{res(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b)));}catch(e){rej(e);}}
 if(kind==='j')return fin(u8);
 if(kind==='z'){if(typeof DecompressionStream!=='function')return rej(new Error('nodecomp'));
  var cs=new DecompressionStream('deflate-raw');var w=cs.writable.getWriter();w.write(u8).catch(function(){});w.close().catch(function(){});
  var rd=cs.readable.getReader(),chunks=[],tot=0;
  (function pump(){rd.read().then(function(r){if(r.done){var all=new Uint8Array(tot),o=0;chunks.forEach(function(c){all.set(c,o);o+=c.length;});return fin(all);}
   tot+=r.value.length;if(tot>200000){rd.cancel();return rej(new Error('big'));}chunks.push(r.value);pump();},rej);})();return;}
 rej(new Error('kind'));});}
function linkPayload(){var E=S.event,c=cfg(),cl=closeMsOrg(),h={};
 if(S.share.high!==false){S.items.forEach(function(it){var l=leadFor(it.id);if(l)h[it.id]=[l.amt,l.name];});}
 var e0=ev0();return {v:1,id:S.id,n:e0.name,o:e0.by,c:e0.charity,tz:myTZ(),ct:cl,mn:c.min,st:c.step,pn:e0.pay,sms:e0.sms,em:e0.email,
  i:S.items.map(function(it){return {i:it.id,t:it.title,d:it.desc,v:it.value,dn:it.donor,tm:it.terms,x:it.ex?1:0};}),h:h};}
function fromLink(o){if(!o||typeof o!=='object'||Array.isArray(o)||o.v!==1)return null;
 var id=ID_RE.test(o.id||'')?o.id:null;if(!id)return null;
 var ct=o.ct;if(typeof ct!=='number'||!isFinite(ct)||ct<9.5e11||ct>4.2e12)return null;
 var mn=toInt(o.mn),st=toInt(o.st);if(isNaN(mn)||mn<1||mn>100000||isNaN(st)||st<1||st>100000)return null;
 if(!Array.isArray(o.i)||o.i.length<1)return null;
 var seen=Object.create(null),items=[];o.i.slice(0,30).forEach(function(r){if(!r||typeof r!=='object')return;var it=cleanItem({id:r.i,title:r.t,desc:r.d,value:r.v,donor:r.dn,terms:r.tm,ex:r.x===1});if(it&&!seen[it.id]){seen[it.id]=1;items.push(it);}});
 if(!items.length)return null;
 var tz=str(o.tz,60);if(tz){try{new Intl.DateTimeFormat('en-AU',{timeZone:tz});}catch(e){tz='';}}
 var hi=Object.create(null);if(o.h&&typeof o.h==='object'&&!Array.isArray(o.h)){Object.keys(o.h).slice(0,40).forEach(function(k){var r=o.h[k];if(!seen[k]||!Array.isArray(r))return;var a=toInt(r[0]),n=str(r[1],30);if(!isNaN(a)&&a>=1&&a<=1000000&&n)hi[k]={amt:a,name:n};});}
 return {aid:id,name:str(o.n,80)||'Date night auction',by:str(o.o,60),charity:str(o.c,80),tz:tz,closeMs:ct,min:mn,step:st,pay:str(o.pn,300),sms:cleanPhone(o.sms),email:cleanEmail(o.em),items:items,hi:hi};}
function baseUrl(){var b=S.event.base;if(/^https?:\/\//i.test(b))return b.replace(/#.*$/,'');return location.href.replace(/#.*$/,'');}
function shareText(ev,link){return 'You are invited to '+ev.name+', a charity date night auction raising money for '+ev.charity+'. Open the link, choose an experience such as dinner for two, and send your pledged bid by message. Bidding closes '+fmtDT(ev.closeMs,ev.tz)+'. The app holds and takes no money. '+link;}
