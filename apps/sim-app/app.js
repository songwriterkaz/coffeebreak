/* Coffeebreak SIM app. Coffeebreak, Newcastle NSW. */
/* LINKS: one outbound URL per provider. Swap in affiliate links later by changing only these URLs. */
var LINKS = {
  aussiebroadband: "https://www.aussiebroadband.com.au/",
  lyca: "https://www.lycamobile.com.au/",
  boost: "https://www.boost.com.au/",
  amaysim: "https://www.amaysim.com.au/",
  vodafone: "https://www.vodafone.com.au/",
  airalo: "https://www.airalo.com/",
  helloroam: "https://www.helloroam.com/"
};
var PROVIDERS = [
  {k:"aussiebroadband",n:"Aussie Broadband",cat:"home",tag:"Everyday mobile plans",d:"Residential mobile plans from an Australian internet provider. Listed at about A$30 to A$60 a month."},
  {k:"lyca",n:"Lyca Mobile",cat:"prepaid",tag:"Prepaid SIM",d:"Prepaid SIM only plans. Bring your own phone."},
  {k:"boost",n:"Boost Mobile",cat:"prepaid",tag:"Telstra network",d:"Prepaid plans on the Telstra network."},
  {k:"amaysim",n:"amaysim",cat:"home",tag:"Australian provider",d:"Australian mobile plans. Check its site for current plans."},
  {k:"vodafone",n:"Vodafone Australia",cat:"home",tag:"Prepaid and postpaid",d:"Prepaid and postpaid mobile plans."},
  {k:"airalo",n:"Airalo",cat:"travel",tag:"Travel data eSIM",d:"Travel data eSIMs you buy online for trips away."},
  {k:"helloroam",n:"HelloRoam",cat:"travel",tag:"Travel eSIM",d:"Travel eSIMs for staying connected overseas."}
];
var DISCLAIMER = "Coffeebreak keeps all rights to its products, designs, apps, name and logo. Buyers and fans may resell the physical products and phones they bought, but may not copy them or make their own versions.";
var EMERGENCY = "Emergency: Coffeebreak calls go over the internet and cannot reach 000. For an ambulance, fire or police, call 000 from any mobile or landline. The 000 button opens your phone's own dialer and needs a working phone plan or mobile signal. If you have no credit or SIM, most mobiles can still call 112 in Australia. If you're deaf or have a speech impairment, use the National Relay Service. Coffeebreak is not an emergency service and is not responsible for calls that do not connect.";
var PREFIX = "coffeebreak-sim-";

/* ---------- pure helpers (tested) ---------- */
function makeNumber(rnd){rnd=rnd||Math.random;var d="";for(var i=0;i<8;i++)d+=Math.floor(rnd()*10);return "CB-"+d.slice(0,4)+"-"+d.slice(4);}
function normNumber(s){var d=String(s||"").replace(/\D/g,"");return d.length===8?"CB-"+d.slice(0,4)+"-"+d.slice(4):null;}
function peerIdFor(num){return PREFIX+num.toLowerCase();}
function numFromPeer(id){return normNumber(String(id).replace(PREFIX,""));}
function pairPeerId(code){return PREFIX+"pair-"+code;}
function makePairCode(rnd){rnd=rnd||Math.random;return String(1000+Math.floor(rnd()*9000));}
function usagePct(used,allow){if(!(allow>0))return 0;return Math.min(100,Math.max(0,Math.round(used/allow*100)));}
function daysUntil(dateStr,now){now=now||new Date();var t=new Date(dateStr+"T00:00:00");var n=new Date(now.getFullYear(),now.getMonth(),now.getDate());return Math.round((t-n)/864e5);}
function filterProviders(cat){return PROVIDERS.filter(function(p){return cat==="all"||p.cat===cat;});}
if(typeof module!=="undefined")module.exports={makeNumber:makeNumber,normNumber:normNumber,peerIdFor:peerIdFor,numFromPeer:numFromPeer,pairPeerId:pairPeerId,makePairCode:makePairCode,usagePct:usagePct,daysUntil:daysUntil,filterProviders:filterProviders,LINKS:LINKS,PROVIDERS:PROVIDERS,DISCLAIMER:DISCLAIMER,EMERGENCY:EMERGENCY};

if(typeof document!=="undefined")(function(){
var $=function(id){return document.getElementById(id);};
var S={get:function(k,d){try{var v=localStorage.getItem("cbsim."+k);return v?JSON.parse(v):d;}catch(e){return d;}},set:function(k,v){localStorage.setItem("cbsim."+k,JSON.stringify(v));}};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return "&#"+c.charCodeAt(0)+";";});}
var Q=new URLSearchParams(location.search);
var peerOpts={config:{iceServers:[{urls:"stun:stun.l.google.com:19302"}]}};
if(Q.get("peerhost")){peerOpts.host=Q.get("peerhost");peerOpts.port=+Q.get("peerport")||9000;peerOpts.path=Q.get("peerpath")||"/";peerOpts.secure=false;}

var tabs=[["t-net","Calls"],["t-near","Nearby"],["t-msgs","Messages"],["t-contacts","Contacts"],["t-history","History"],["t-sim","SIM"],["t-usage","Usage"],["t-help","Help"],["t-apps","Apps"],["t-about","About"]];
$("nav").innerHTML=tabs.map(function(t){return '<button data-t="'+t[0]+'" id="nav-'+t[0]+'">'+t[1]+'</button>';}).join("");
function show(id){document.querySelectorAll("section").forEach(function(s){s.classList.toggle("on",s.id===id);});document.querySelectorAll("nav button").forEach(function(b){b.classList.toggle("on",b.dataset.t===id);});if(id==="t-msgs")renderMsgs();}
$("nav").onclick=function(e){if(e.target.dataset.t)show(e.target.dataset.t);};show("t-net");
document.querySelectorAll(".disc").forEach(function(p){p.textContent=DISCLAIMER;});$("aboutEmg").textContent=EMERGENCY;

function overlay(html){$("ovc").innerHTML=html;$("overlay").classList.add("on");}
function closeOv(){$("overlay").classList.remove("on");}
if(!S.get("emgOk",false)){overlay('<h2>Before you start</h2><p class="warn">'+esc(EMERGENCY)+'</p><div class="emg"><a class="btn" href="tel:000">Call 000</a><a class="btn" href="tel:112">Call 112</a></div><button class="wide" id="bUnderstand">I understand</button>');$("bUnderstand").onclick=function(){S.set("emgOk",true);closeOv();};}

/* ---------- number and peer ---------- */
var me=S.get("number",null);if(!me){me=makeNumber();S.set("number",me);}
$("mynum").textContent=me;
var contacts=S.get("contacts",[]),msgs=S.get("msgs",{}),hist=S.get("hist",[]);
function nameOf(n){var c=contacts.find(function(c){return c.num===n;});return c?c.name:n;}
function addContact(name,num,paired){num=normNumber(num);if(!num||num===me)return false;var c=contacts.find(function(c){return c.num===num;});if(c){if(name)c.name=name;if(paired)c.paired=true;}else contacts.push({name:name||num,num:num,paired:!!paired});S.set("contacts",contacts);renderContacts();return true;}
var peer,conns={},call=null,callT0=0;
function status(t){$("netstat").textContent=t;}
function startPeer(){
  if(typeof Peer==="undefined"){status("Offline. Calls need WiFi or mobile data.");return;}
  peer=new Peer(peerIdFor(me),peerOpts);window.cbPeer=peer;
  peer.on("open",function(){status("Online on the Coffeebreak Network");document.body.dataset.online="1";});
  peer.on("disconnected",function(){status("Reconnecting...");setTimeout(function(){try{peer.reconnect();}catch(e){}},2000);});
  peer.on("error",function(e){if(e.type==="peer-unavailable")toast("That Coffeebreak number is not online right now.");else if(e.type==="network"||e.type==="server-error")status("Offline. Calls need WiFi or mobile data.");});
  peer.on("connection",wireConn);
  peer.on("call",incoming);
}
function toast(t){var d=document.createElement("div");d.className="card";d.style.cssText="position:fixed;top:70px;left:10px;right:10px;z-index:30";d.textContent=t;document.body.appendChild(d);setTimeout(function(){d.remove();},4000);}
function wireConn(c){var n=numFromPeer(c.peer);if(!n)return;conns[n]=c;c.on("data",function(m){onData(n,m);});c.on("close",function(){if(conns[n]===c)delete conns[n];});}
function getConn(n,cb){var c=conns[n];if(c&&c.open)return cb(c);c=peer.connect(peerIdFor(n),{reliable:true});wireConn(c);c.on("open",function(){cb(c);});}
function addMsg(n,from,body){(msgs[n]=msgs[n]||[]).push({from:from,body:body,ts:Date.now()});S.set("msgs",msgs);renderMsgs();}
function sendText(n,body){if(!body)return;getConn(n,function(c){c.send({t:"text",body:body});});addMsg(n,"me",body);}
var pendingOut={},incomingFiles={};
function onData(n,m){
  if(!m||!m.t)return;
  if(m.t==="text"){addMsg(n,"them",String(m.body));if(!contacts.find(function(c){return c.num===n;}))addContact(n,n);ring("beep",1);toast("New message from "+nameOf(n));}
  else if(m.t==="hello"){addContact(m.name||n,n,true);}
  else if(m.t==="offer-file"){incomingFiles[m.id]=m;var row=document.createElement("div");row.id="in-"+m.id;row.innerHTML=esc(nameOf(n))+" wants to send <b>"+esc(m.name)+"</b> ("+Math.ceil(m.size/1024)+" KB) <button class='grn' data-acc>Accept</button><button class='red' data-dec>Decline</button>";$("recvList").prepend(row);row.querySelector("[data-acc]").onclick=function(){getConn(n,function(c){c.send({t:"accept",id:m.id});});row.textContent="Receiving "+m.name+"...";};row.querySelector("[data-dec]").onclick=function(){getConn(n,function(c){c.send({t:"decline",id:m.id});});row.textContent="Declined "+m.name;};ring("beep",1);toast(nameOf(n)+" wants to send you a file");show("t-near");}
  else if(m.t==="accept"){var f=pendingOut[m.id];if(f)f.file.arrayBuffer().then(function(buf){getConn(n,function(c){c.send({t:"file",id:m.id,name:f.file.name,type:f.file.type,data:buf});});toast("Sent "+f.file.name);});}
  else if(m.t==="decline"){toast(nameOf(n)+" declined the file");delete pendingOut[m.id];}
  else if(m.t==="file"){var blob=new Blob([m.data],{type:m.type||"application/octet-stream"});var url=URL.createObjectURL(blob);var r=$("in-"+m.id)||document.createElement("div");r.innerHTML="Got <a download='"+esc(m.name)+"' href='"+url+"'>"+esc(m.name)+"</a>"+(/^image\//.test(m.type)?"<br><img style='max-width:100%' src='"+url+"'>":"");document.body.dataset.gotfile=m.name;}
}

/* ---------- calls ---------- */
function logCall(n,dir,kind,secs){hist.unshift({num:n,dir:dir,kind:kind,secs:secs,ts:Date.now()});hist=hist.slice(0,200);S.set("hist",hist);renderHist();}
function media(video){return navigator.mediaDevices.getUserMedia({audio:true,video:video});}
function showCall(n,video,stream){$("callbox").style.display="block";$("callwho").textContent=(video?"Video call with ":"Call with ")+nameOf(n);$("lv").style.display=video?"block":"none";$("lv").srcObject=stream||null;show("t-net");}
function wireCall(c,n,video,dir){call={c:c,n:n,video:video,dir:dir};c.on("stream",function(rs){$("rv").srcObject=rs;callT0=Date.now();document.body.dataset.incall="1";});c.on("close",endCall);c.on("error",endCall);}
function placeCall(n,video){n=normNumber(n);if(!n){toast("Type a Coffeebreak number like CB-1234-5678");return;}media(video).then(function(st){var c=peer.call(peerIdFor(n),st,{metadata:{video:video}});showCall(n,video,st);wireCall(c,n,video,"out");}).catch(function(){toast("Please allow the microphone and camera to make calls.");});}
var ringing=null;
function incoming(c){var n=numFromPeer(c.peer),video=!!(c.metadata&&c.metadata.video),answered=false;
  ringing=ring(S.get("ring","classic"),20);
  overlay("<h2>Incoming "+(video?"video ":"")+"call</h2><p class='num'>"+esc(nameOf(n))+"</p><p class='muted'>"+esc(n)+"</p><button class='grn wide' id='bAns'>Answer</button><button class='red wide' id='bDecl'>Decline</button>");
  function stopR(){if(ringing){ringing();ringing=null;}}
  $("bAns").onclick=function(){answered=true;stopR();closeOv();media(video).then(function(st){c.answer(st);showCall(n,video,st);wireCall(c,n,video,"in");}).catch(function(){toast("Please allow the microphone to answer.");c.close();});};
  $("bDecl").onclick=function(){answered=true;stopR();closeOv();c.close();logCall(n,"declined",video?"video":"voice",0);};
  c.on("close",function(){if(!answered){stopR();closeOv();logCall(n,"missed",video?"video":"voice",0);toast("Missed call from "+nameOf(n));updateMissed();}});
  setTimeout(function(){if(!answered){stopR();closeOv();c.close();}},30000);
}
function endCall(){if(!call)return;var x=call;call=null;var secs=callT0?Math.round((Date.now()-callT0)/1000):0;callT0=0;try{x.c.close();}catch(e){}var ls=$("lv").srcObject;if(ls)ls.getTracks().forEach(function(t){t.stop();});$("callbox").style.display="none";document.body.dataset.incall="";logCall(x.n,x.dir,x.video?"video":"voice",secs);}
$("bHang").onclick=endCall;
setInterval(function(){if(call&&callT0)$("ctimer").textContent=Math.round((Date.now()-callT0)/1000)+" seconds";},1000);
function updateMissed(){var m=hist.filter(function(h){return h.dir==="missed"&&!h.seen;}).length;$("nav-t-history").textContent=m?"History ("+m+" missed)":"History";}

/* ---------- ringtones (Web Audio, no files) ---------- */
var AC;function ring(kind,times){if(kind==="off")return function(){};try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return function(){};}
  var pat={classic:[[440,.4],[480,.4]],soft:[[660,.3],[880,.5]],beep:[[1000,.15]]}[kind]||[[440,.4]];var stop=false,i=0;
  (function play(){if(stop||i++>=times)return;var t=AC.currentTime;pat.forEach(function(p){var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=p[0];g.gain.value=.15;o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+p[1]);t+=p[1]+.05;});setTimeout(play,1500);})();
  return function(){stop=true;};}
$("ring").value=S.get("ring","classic");$("ring").onchange=function(){S.set("ring",this.value);};$("bRingTest").onclick=function(){ring($("ring").value,1);};

/* ---------- dialer buttons ---------- */
$("bVoice").onclick=function(){placeCall($("dial").value,false);};
$("bVideo").onclick=function(){placeCall($("dial").value,true);};
$("bText").onclick=function(){var n=normNumber($("dial").value);if(!n)return toast("Type a Coffeebreak number like CB-1234-5678");addContact(null,n);curThread=n;show("t-msgs");};
$("bSave").onclick=function(){var n=$("dial").value;$("cNum").value=n;show("t-contacts");};
$("bPair").onclick=function(){show("t-near");};

/* ---------- contacts ---------- */
function renderContacts(){$("clist").innerHTML=contacts.length?contacts.map(function(c,i){return "<div><b>"+esc(c.name)+"</b> "+esc(c.num)+(c.paired?" <span class='muted'>(paired nearby)</span>":"")+"<div class='row'><button class='grn' data-call='"+i+"'>Call</button><button class='grn' data-vid='"+i+"'>Video</button><button class='alt' data-txt='"+i+"'>Text</button><button class='alt' data-del='"+i+"'>Remove</button></div></div>";}).join(""):"<p class='muted'>No contacts yet. Add one or pair a phone nearby.</p>";
  $("sendTo").innerHTML=contacts.map(function(c){return "<option value='"+c.num+"'>"+esc(c.name)+" "+c.num+"</option>";}).join("");renderThreads();}
$("clist").onclick=function(e){var d=e.target.dataset,c;if(d.call)placeCall(contacts[d.call].num,false);if(d.vid)placeCall(contacts[d.vid].num,true);if(d.txt){curThread=contacts[d.txt].num;show("t-msgs");}if(d.del&&confirm("Remove this contact?")){contacts.splice(d.del,1);S.set("contacts",contacts);renderContacts();}};
$("bAddC").onclick=function(){if(addContact($("cName").value.trim(),$("cNum").value,false)){$("cName").value="";$("cNum").value="";}else toast("Type a Coffeebreak number like CB-1234-5678");};

/* ---------- messages ---------- */
var curThread=null;
function renderThreads(){var ks=contacts.map(function(c){return c.num;});Object.keys(msgs).forEach(function(k){if(ks.indexOf(k)<0)ks.push(k);});$("thread").innerHTML=ks.map(function(k){return "<option value='"+k+"'>"+esc(nameOf(k))+"</option>";}).join("");if(curThread)$("thread").value=curThread;}
function renderMsgs(){renderThreads();curThread=$("thread").value||curThread;var l=msgs[curThread]||[];$("msglist").innerHTML=l.length?l.map(function(m){return "<div class='msg "+(m.from==="me"?"me":"them")+"'>"+esc(m.body)+"</div>";}).join(""):"<p class='muted'>No messages yet.</p>";}
$("thread").onchange=function(){curThread=this.value;renderMsgs();};
$("bSend").onclick=function(){if(!curThread)return toast("Add a contact first");sendText(curThread,$("mtext").value.trim());$("mtext").value="";};

/* ---------- history ---------- */
function renderHist(){$("hlist").innerHTML=hist.length?hist.map(function(h){var label={out:"Outgoing",in:"Incoming",missed:"Missed",declined:"Declined"}[h.dir];return "<div><b>"+label+"</b> "+h.kind+" call, "+esc(nameOf(h.num))+"<br><span class='muted'>"+new Date(h.ts).toLocaleString("en-AU")+(h.secs?", "+h.secs+" seconds":"")+"</span></div>";}).join(""):"<p class='muted'>No calls yet.</p>";updateMissed();}
$("nav-t-history").addEventListener("click",function(){hist.forEach(function(h){h.seen=true;});S.set("hist",hist);updateMissed();});
$("bClearH").onclick=function(){if(confirm("Clear call history?")){hist=[];S.set("hist",hist);renderHist();}};

/* ---------- nearby pairing ---------- */
var pairPeer=null;
function hello(c){c.send({t:"hello",num:me,name:S.get("myname","Coffeebreak friend")});}
function finishPair(c,code){c.on("data",function(m){if(m&&m.t==="hello"){var n=normNumber(m.num);if(n){addContact(m.name&&m.name!=="Coffeebreak friend"?m.name:n,n,true);$("pairbox").innerHTML="<p class='num'>Paired with "+esc(n)+"</p>";document.body.dataset.paired=n;toast("Paired with "+n);}setTimeout(function(){try{c.close();}catch(e){}if(pairPeer){pairPeer.destroy();pairPeer=null;}},1500);}});}
$("bShowCode").onclick=function(){if(typeof Peer==="undefined")return toast("Pairing needs WiFi or a hotspot.");var code=makePairCode();if(pairPeer)pairPeer.destroy();pairPeer=new Peer(pairPeerId(code),peerOpts);
  pairPeer.on("connection",function(c){c.on("open",function(){hello(c);});finishPair(c,code);});
  pairPeer.on("error",function(e){if(e.type==="unavailable-id")$("bShowCode").click();});
  var qr=qrcode(0,"M");qr.addData("CBPAIR:"+code+":"+me);qr.make();
  $("pairbox").innerHTML="<p>On the other phone, tap Type a 4-digit code and enter</p><div class='big' id='paircode'>"+code+"</div><div id='qr' style='text-align:center'>"+qr.createSvgTag(5)+"</div><p class='muted'>Or scan this QR code. Your number is "+me+".</p>";};
function joinCode(code){if(!/^\d{4}$/.test(code))return toast("Type the 4 numbers shown on the other phone");var tmp=new Peer(peerOpts);tmp.on("open",function(){var c=tmp.connect(pairPeerId(code),{reliable:true});c.on("open",function(){hello(c);});finishPair(c,code);c.on("close",function(){setTimeout(function(){tmp.destroy();},500);});});tmp.on("error",function(e){if(e.type==="peer-unavailable")toast("No phone is showing that code. Check the code and try again.");});}
window.cbJoinCode=joinCode;
$("bEnterCode").onclick=function(){$("pairbox").innerHTML="<input id='codeIn' inputmode='numeric' maxlength='4' class='big' placeholder='0000'><button class='wide' id='bJoin'>Pair</button>";$("bJoin").onclick=function(){joinCode($("codeIn").value.trim());};};
$("bScan").onclick=function(){if(!("BarcodeDetector" in window)){$("pairbox").innerHTML="<p class='muted'>This browser cannot scan QR codes. Use your camera app to read the code, or tap Type a 4-digit code instead.</p>";return;}
  var det=new BarcodeDetector({formats:["qr_code"]});$("pairbox").innerHTML="<video id='scanv' autoplay playsinline muted></video><button class='alt wide' id='bStopScan'>Stop</button>";var v=$("scanv"),st,stop=false;
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){st=s;v.srcObject=s;(function loop(){if(stop)return;det.detect(v).then(function(r){var m=r[0]&&/^CBPAIR:(\d{4}):/.exec(r[0].rawValue);if(m){stop=true;st.getTracks().forEach(function(t){t.stop();});joinCode(m[1]);}else setTimeout(loop,300);}).catch(function(){setTimeout(loop,500);});})();}).catch(function(){toast("Please allow the camera to scan.");});
  $("bStopScan").onclick=function(){stop=true;if(st)st.getTracks().forEach(function(t){t.stop();});$("pairbox").innerHTML="";};};
$("bBt").onclick=function(){if(!(navigator.bluetooth&&navigator.bluetooth.requestDevice)){$("btMsg").textContent="Bluetooth finding is not supported in this browser. iPhone browsers do not support it. Use the 4-digit code or QR code instead, it works just as well on the same WiFi or hotspot.";return;}
  navigator.bluetooth.requestDevice({acceptAllDevices:true}).then(function(d){$("btMsg").textContent="Found "+(d.name||"a nearby device")+". Now tap Show my pairing code on that phone and type the code here to finish pairing.";$("bEnterCode").click();}).catch(function(){$("btMsg").textContent="No device chosen. You can pair with the 4-digit code instead.";});};

/* ---------- send to nearby ---------- */
$("bSendFile").onclick=function(){var n=$("sendTo").value,f=$("sendFile").files[0];if(!n)return toast("Pair a phone or add a contact first");if(!f)return toast("Choose a photo or file first");if(f.size>50*1024*1024)return toast("Please choose a file under 50 MB");var id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);pendingOut[id]={file:f,n:n};getConn(n,function(c){c.send({t:"offer-file",id:id,name:f.name,size:f.size,type:f.type});});toast("Waiting for "+nameOf(n)+" to accept");};

/* ---------- SIM, waitlist, plans ---------- */
$("bWait").onclick=function(){var e=$("wEmail").value.trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){$("wMsg").textContent="Please type a valid email.";return;}var w=S.get("waitlist",[]);w.push({name:$("wName").value.trim(),email:e,ts:Date.now()});S.set("waitlist",w);if($("wName").value.trim())S.set("myname",$("wName").value.trim());$("wMsg").textContent="Thanks, you are on the waitlist. It is saved on this phone.";};
function renderPlans(){$("plist").innerHTML=filterProviders($("pFilter").value).map(function(p){return "<div class='card'><h3>"+p.n+"</h3><div class='muted'>"+p.tag+"</div><p>"+p.d+"</p><a class='btn wide' target='_blank' rel='noopener sponsored' href='"+LINKS[p.k]+"'>See "+p.n+" plans</a></div>";}).join("");}
$("pFilter").onchange=renderPlans;renderPlans();

/* ---------- usage and reminders ---------- */
var u=S.get("usage",{});$("uAllow").value=u.allow||"";$("uUsed").value=u.used||"";$("uRenew").value=u.renew||"";
function renderUsage(){var p=usagePct(+u.used,+u.allow);$("ubar").style.width=p+"%";$("uText").textContent=u.allow?("You have used "+(u.used||0)+" GB of "+u.allow+" GB ("+p+" percent)."+(u.renew?" Renews in "+daysUntil(u.renew)+" days.":"")+(p>=80?" You are close to your limit.":"")):"";}
$("bUsage").onclick=function(){u={allow:$("uAllow").value,used:$("uUsed").value,renew:$("uRenew").value};S.set("usage",u);renderUsage();};renderUsage();
var rems=S.get("rems",[]);
function renderRems(){rems.sort(function(a,b){return a.date<b.date?-1:1;});$("rlist").innerHTML=rems.map(function(r,i){var d=daysUntil(r.date);return "<div><b>"+esc(r.name)+"</b> A$"+esc(r.amt||"0")+" due "+r.date+" <span class='muted'>("+(d<0?"overdue":d===0?"due today":"in "+d+" days")+")</span> <button class='alt' data-rd='"+i+"'>Done</button></div>";}).join("");}
$("rlist").onclick=function(e){if(e.target.dataset.rd){rems.splice(e.target.dataset.rd,1);S.set("rems",rems);renderRems();}};
$("bRem").onclick=function(){if(!$("rName").value||!$("rDate").value)return toast("Add a bill name and a date");rems.push({name:$("rName").value,amt:$("rAmt").value,date:$("rDate").value});S.set("rems",rems);renderRems();if("Notification" in window&&Notification.permission==="default")Notification.requestPermission();};
renderRems();
(function remind(){var due=rems.filter(function(r){var d=daysUntil(r.date);return d>=0&&d<=2;});if(due.length)toast("Bill reminder: "+due.map(function(r){return r.name+" due "+r.date;}).join(", "));})();

$("bNewNum").onclick=function(){if(confirm("Get a new Coffeebreak number? Friends will need your new number.")){S.set("number",makeNumber());location.reload();}};

renderContacts();renderHist();startPeer();
if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").catch(function(){});
})();
