(function(){
"use strict";
var KEY="cbManifest.v1";
var $=function(id){return document.getElementById(id);};
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function addDays(n){var d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function money(n){return "$"+Number(n||0).toLocaleString("en-AU",{minimumFractionDigits:0,maximumFractionDigits:2});}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function defaults(){return {goal:{amount:1000,date:addDays(7),earnings:[]},favs:[],own:[],actions:{date:today(),done:{}},customActions:[],vision:[],gratitude:[],scripts:[],speaker:{voice:"",rate:1,pitch:1},tab:"goal"};}
var S;
try{S=JSON.parse(localStorage.getItem(KEY))||defaults();}catch(e){S=defaults();}
var D=defaults();for(var k in D){if(S[k]===undefined)S[k]=D[k];}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));return true;}catch(e){toast("Storage is full. Remove a picture or save a backup.");return false;}}
var tt;function toast(m){var t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("show");},2200);}

/* Tabs */
function showTab(name){
  document.querySelectorAll(".tabs button").forEach(function(b){b.classList.toggle("active",b.dataset.tab===name);b.setAttribute("aria-selected",b.dataset.tab===name);});
  document.querySelectorAll(".panel").forEach(function(p){p.classList.toggle("active",p.id==="tab-"+name);});
  S.tab=name;save();
  var ab=document.querySelector(".tabs button.active");if(ab&&ab.scrollIntoView)ab.scrollIntoView({block:"nearest",inline:"center"});
}
document.querySelectorAll(".tabs button").forEach(function(b){b.addEventListener("click",function(){showTab(b.dataset.tab);var n=document.querySelector(".tabs");if(n.getBoundingClientRect().top<=0)window.scrollTo({top:n.offsetTop,behavior:"smooth"});});});

/* Goal */
function renderGoal(){
  var g=S.goal,total=g.earnings.reduce(function(a,e){return a+Number(e.amt||0);},0);
  var pct=g.amount>0?Math.min(100,total/g.amount*100):0;
  $("goalSummary").textContent=money(total)+" of "+money(g.amount);
  $("goalFill").style.width=pct+"%";$("goalPct").textContent=Math.floor(pct)+"%";
  var days=Math.ceil((new Date(g.date+"T23:59:59")-new Date())/86400000);
  var left=Math.max(0,g.amount-total);
  $("goalDays").textContent=g.date?(days>=0?(days===0?"Due today":days+" day"+(days===1?"":"s")+" to go")+" · "+money(left)+" left"+(days>0&&left>0?" · about "+money(Math.ceil(left/days))+" a day":""):"Goal date has passed · "+money(left)+" left"):"";
  var msg=pct>=100?"Goal reached. Celebrate, then set your next one.":pct>=75?"Nearly there. Keep going.":pct>=50?"Halfway. Your actions are working.":pct>=25?"Great start. Every dollar counts.":pct>0?"The first dollars are in. Momentum is building.":"Add your first dollar when it comes in. Pick an action from the Actions tab.";
  $("goalMsg").textContent=msg;
  $("goalAmt").value=g.amount;$("goalDate").value=g.date;
  var ul=$("earnList");ul.innerHTML="";
  g.earnings.slice().reverse().forEach(function(e){
    var li=document.createElement("li");li.innerHTML="<span><strong>"+money(e.amt)+"</strong> "+esc(e.note||"")+" <span class='muted small'>"+esc(e.date)+"</span></span>";
    var x=document.createElement("button");x.className="x";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=function(){if(confirm("Remove this entry?")){g.earnings=g.earnings.filter(function(z){return z.id!==e.id;});save();renderGoal();}};
    li.appendChild(x);ul.appendChild(li);
  });
}
$("earnAdd").onclick=function(){var a=parseFloat($("earnAmt").value);if(!(a>0)){toast("Enter an amount above 0");return;}
  S.goal.earnings.push({id:uid(),amt:Math.round(a*100)/100,note:$("earnNote").value.trim(),date:today()});$("earnAmt").value="";$("earnNote").value="";save();renderGoal();toast("Added "+money(a)+". Well done.");};
$("goalSave").onclick=function(){var a=parseFloat($("goalAmt").value);if(!(a>0)){toast("Enter a goal amount");return;}S.goal.amount=a;S.goal.date=$("goalDate").value||S.goal.date;save();renderGoal();toast("Goal saved");};
$("goalReset").onclick=function(){if(confirm("Start a new goal? This clears the money entries for this goal.")){S.goal={amount:1000,date:addDays(7),earnings:[]};save();renderGoal();}};

/* Affirmations */
var AFF=window.CB_AFFIRMATIONS||[];
function allAff(){return AFF.concat(S.own);}
var dayIdx=Math.floor(new Date(today()+"T00:00:00").getTime()/86400000);
var affI=dayIdx%AFF.length,first=true;
function renderAff(){var list=allAff();var t=list[affI%list.length];$("affText").textContent=t;$("affLabel").textContent=first?"Today's affirmation":"Affirmation "+((affI%list.length)+1)+" of "+list.length;
  var fav=S.favs.indexOf(t)>=0;$("affFav").textContent=fav?"♥ Saved":"♡ Save";
  var ul=$("affFavList");ul.innerHTML="";if(!S.favs.length){ul.innerHTML="<li class='muted'>Tap Save on any affirmation to keep it here.</li>";}
  S.favs.forEach(function(f){var li=document.createElement("li");li.innerHTML="<span>"+esc(f)+"</span>";var x=document.createElement("button");x.className="x";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=function(){S.favs=S.favs.filter(function(z){return z!==f;});save();renderAff();};li.appendChild(x);ul.appendChild(li);});
}
$("affNext").onclick=function(){first=false;var n=allAff().length;var j;do{j=Math.floor(Math.random()*n);}while(n>1&&j===affI%n);affI=j;renderAff();};
$("affFav").onclick=function(){var t=$("affText").textContent;var i=S.favs.indexOf(t);if(i>=0)S.favs.splice(i,1);else S.favs.push(t);save();renderAff();};
$("affSay").onclick=function(){speakList([$("affText").textContent],"Affirmation");};
$("affOwnAdd").onclick=function(){var v=$("affOwn").value.trim();if(!v)return;S.own.push(v);$("affOwn").value="";save();first=false;affI=allAff().length-1;renderAff();toast("Added your affirmation");};

/* Actions */
var ACT=window.CB_ACTIONS||[];
function renderActions(){
  if(S.actions.date!==today()){S.actions={date:today(),done:{}};save();}
  var ul=$("actList");ul.innerHTML="";var all=ACT.concat(S.customActions);var n=0;
  all.forEach(function(a){var done=!!S.actions.done[a.id];if(done)n++;
    var li=document.createElement("li");li.className=done?"done":"";
    var cb=document.createElement("input");cb.type="checkbox";cb.checked=done;cb.setAttribute("aria-label",a.t);
    var sp=document.createElement("span");sp.textContent=a.t;
    li.appendChild(cb);li.appendChild(sp);
    if(a.custom){var x=document.createElement("button");x.className="x";x.textContent="✕";x.style.cssText="margin-left:auto;background:none;border:0;font-size:1.2rem;color:#b8235f;min-width:40px";x.setAttribute("aria-label","Remove");x.onclick=function(ev){ev.stopPropagation();S.customActions=S.customActions.filter(function(z){return z.id!==a.id;});save();renderActions();};li.appendChild(x);}
    function toggle(){S.actions.done[a.id]=!S.actions.done[a.id];save();renderActions();if(S.actions.done[a.id])toast("Ticked. Nice work.");}
    cb.addEventListener("click",function(ev){ev.stopPropagation();toggle();});
    li.addEventListener("click",toggle);
    ul.appendChild(li);});
  $("actCount").textContent=n+" of "+all.length+" done today";
}
$("actOwnAdd").onclick=function(){var v=$("actOwn").value.trim();if(!v)return;S.customActions.push({id:"c"+uid(),t:v,custom:true});$("actOwn").value="";save();renderActions();};

/* Vision board */
function renderVision(){var b=$("visBoard");b.innerHTML="";
  if(!S.vision.length){b.innerHTML="<div class='card muted' style='grid-column:1/-1'>Your board is empty. Add words and pictures of the life you are creating.</div>";}
  S.vision.forEach(function(v){var d=document.createElement("div");d.className="tile"+(v.type==="text"?" word":"");
    if(v.type==="img"){var im=document.createElement("img");im.src=v.data;im.alt="Vision board picture";d.appendChild(im);}else{d.textContent=v.text;}
    var x=document.createElement("button");x.className="x";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=function(){if(confirm("Remove this from your board?")){S.vision=S.vision.filter(function(z){return z.id!==v.id;});save();renderVision();}};
    d.appendChild(x);b.appendChild(d);});
}
$("visTextAdd").onclick=function(){var v=$("visText").value.trim();if(!v)return;S.vision.push({id:uid(),type:"text",text:v});$("visText").value="";save();renderVision();};
$("visImg").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f)return;
  $("visMsg").textContent="Adding picture...";
  var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){
      var max=700,w=img.width,h=img.height,s=Math.min(1,max/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);var data=c.toDataURL("image/jpeg",0.72);
      var item={id:uid(),type:"img",data:data};S.vision.push(item);
      if(!save()){S.vision.pop();$("visMsg").textContent="Not enough space. Remove a picture first.";return;}
      $("visMsg").textContent="Picture added.";renderVision();};
    img.onerror=function(){$("visMsg").textContent="That file could not be read as a picture.";};img.src=r.result;};
  r.readAsDataURL(f);});

/* Gratitude */
function renderGr(){var ul=$("grList");ul.innerHTML="";
  S.gratitude.slice().reverse().forEach(function(g){var li=document.createElement("li");li.innerHTML="<strong>"+esc(g.date)+"</strong><br>"+g.items.map(function(i){return "🙏 "+esc(i);}).join("<br>");
    var x=document.createElement("button");x.className="x";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=function(){if(confirm("Delete this entry?")){S.gratitude=S.gratitude.filter(function(z){return z.id!==g.id;});save();renderGr();}};li.insertBefore(x,li.firstChild);ul.appendChild(li);});}
$("grSave").onclick=function(){var items=["gr1","gr2","gr3"].map(function(i){return $(i).value.trim();}).filter(Boolean);if(!items.length){toast("Write at least one thing");return;}
  S.gratitude.push({id:uid(),date:today(),items:items});["gr1","gr2","gr3"].forEach(function(i){$(i).value="";});save();renderGr();toast("Gratitude saved");};

/* Scripting */
var STARTERS=["I am so happy and grateful now that my $1,000 goal is reached. I am sitting with a warm coffee, looking at my balance and smiling because...","Today I opened my messages and saw three new orders. I felt...","I just finished a paid gig and the crowd sang along. Afterwards I...","My store is busy and customers keep sending lovely reviews. The best one said...","I paid every bill this week with ease, and I still had money left over for..."];
var stI=0;
$("scStarter").onclick=function(){var t=$("scText");t.value=STARTERS[stI%STARTERS.length]+" ";stI++;t.focus();};
function renderSc(){var ul=$("scList");ul.innerHTML="";S.scripts.slice().reverse().forEach(function(s){var li=document.createElement("li");li.innerHTML="<strong>"+esc(s.date)+"</strong><br>"+esc(s.text).replace(/\n/g,"<br>");
  var x=document.createElement("button");x.className="x";x.textContent="✕";x.setAttribute("aria-label","Remove");x.onclick=function(){if(confirm("Delete this script?")){S.scripts=S.scripts.filter(function(z){return z.id!==s.id;});save();renderSc();}};li.insertBefore(x,li.firstChild);ul.appendChild(li);});}
$("scSave").onclick=function(){var v=$("scText").value.trim();if(!v){toast("Write your script first");return;}S.scripts.push({id:uid(),date:today(),text:v});$("scText").value="";save();renderSc();toast("Script saved");};
$("scRead").onclick=function(){var v=$("scText").value.trim()||(S.scripts.length?S.scripts[S.scripts.length-1].text:"");if(!v){toast("Write your script first");return;}speakList(splitSentences(v),"Your script");};

/* Speaker */
var SCRIPTS=window.CB_SCRIPTS||[];
var synth=("speechSynthesis" in window)?window.speechSynthesis:null;
var queue=[],qi=0,playing=false,paused=false,label="",voices=[];
function splitSentences(t){return (t.match(/[^.?!]+[.?!]+["']?|[^.?!]+$/g)||[t]).map(function(s){return s.trim();}).filter(Boolean);}
var sel=$("spScript");SCRIPTS.forEach(function(s,i){var o=document.createElement("option");o.value=i;o.textContent=(i+1)+". "+s.title;sel.appendChild(o);});
sel.value=String(dayIdx%SCRIPTS.length);
function showScript(){var s=SCRIPTS[+sel.value];if(!s)return;var parts=splitSentences(s.text);$("spText").innerHTML="<h3>"+esc(s.title)+"</h3>"+parts.map(function(p,i){return "<span class='s' data-i='"+i+"'>"+esc(p)+"</span>";}).join(" ");}
sel.onchange=function(){stopSpeak();showScript();};
function loadVoices(){if(!synth)return;voices=synth.getVoices();var vs=$("spVoice");var cur=S.speaker.voice;vs.innerHTML="";
  var list=voices.slice().sort(function(a,b){var ea=/^en/i.test(a.lang)?0:1,eb=/^en/i.test(b.lang)?0:1;var au=/AU/i.test(a.lang)?0:1,bu=/AU/i.test(b.lang)?0:1;return ea-eb||au-bu||a.name.localeCompare(b.name);});
  var d=document.createElement("option");d.value="";d.textContent="Default voice";vs.appendChild(d);
  list.forEach(function(v){var o=document.createElement("option");o.value=v.name;o.textContent=v.name+" ("+v.lang+")";vs.appendChild(o);});
  vs.value=cur&&list.some(function(v){return v.name===cur;})?cur:"";}
if(synth){loadVoices();if("onvoiceschanged" in synth)synth.onvoiceschanged=loadVoices;}else{$("spNoVoice").hidden=false;["spPlay","spStop","spRandom","spAffirm","affSay","scRead"].forEach(function(i){$(i).disabled=true;$(i).style.opacity=.5;});}
$("spVoice").onchange=function(){S.speaker.voice=this.value;save();};
$("spRate").value=S.speaker.rate;$("spPitch").value=S.speaker.pitch;
function showRP(){$("spRateVal").textContent=Number($("spRate").value).toFixed(1)+"x";$("spPitchVal").textContent=Number($("spPitch").value).toFixed(1);}
showRP();
$("spRate").oninput=function(){S.speaker.rate=+this.value;showRP();save();};
$("spPitch").oninput=function(){S.speaker.pitch=+this.value;showRP();save();};
function mark(i){document.querySelectorAll("#spText .s").forEach(function(e){e.classList.toggle("now",+e.dataset.i===i);});}
function setBtn(){$("spPlay").textContent=playing&&!paused?"⏸ Pause":(paused?"▶ Resume":"▶ Play");}
function status(m){$("spStatus").textContent=m;}
var token=0;
function speakNext(){if(!synth||!playing||paused)return;
  if(qi>=queue.length){playing=false;mark(-1);setBtn();status("Finished. Now go take one inspired action.");return;}
  var u=new SpeechSynthesisUtterance(queue[qi]);var v=voices.filter(function(x){return x.name===S.speaker.voice;})[0];if(v){u.voice=v;u.lang=v.lang;}else{u.lang="en-AU";}
  u.rate=S.speaker.rate;u.pitch=S.speaker.pitch;var my=token;
  if(label==="script")mark(qi);
  u.onend=function(){if(my!==token)return;qi++;speakNext();};
  u.onerror=function(e){if(my!==token)return;if(e.error==="interrupted"||e.error==="canceled")return;qi++;speakNext();};
  status("Playing: "+(label==="script"?SCRIPTS[+sel.value].title:label)+" ("+(qi+1)+"/"+queue.length+")");
  synth.speak(u);}
function startQueue(list,lbl){if(!synth)return;token++;synth.cancel();queue=list;qi=0;label=lbl;playing=true;paused=false;setBtn();setTimeout(speakNext,60);}
function speakList(list,lbl){startQueue(list,lbl);}
function stopSpeak(){if(synth){token++;synth.cancel();}playing=false;paused=false;qi=0;mark(-1);setBtn();status("Stopped.");}
$("spPlay").onclick=function(){if(!synth)return;
  if(!playing){showScript();startQueue(splitSentences(SCRIPTS[+sel.value].text),"script");return;}
  if(!paused){paused=true;token++;synth.cancel();setBtn();status("Paused.");}
  else{paused=false;setBtn();speakNext();}};
$("spStop").onclick=stopSpeak;
$("spRandom").onclick=function(){sel.value=String(Math.floor(Math.random()*SCRIPTS.length));showScript();startQueue(splitSentences(SCRIPTS[+sel.value].text),"script");};
$("spAffirm").onclick=function(){var a=allAff().slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}var five=a.slice(0,5);
  $("spText").innerHTML="<h3>Five affirmations</h3>"+five.map(function(x){return "<p>✨ "+esc(x)+"</p>";}).join("");startQueue(["Here are five affirmations for you. Say them with me."].concat(five),"Five affirmations");};
window.addEventListener("pagehide",function(){if(synth)synth.cancel();});

/* Backup */
$("exportBtn").onclick=function(){var blob=new Blob([JSON.stringify(S)],{type:"application/json"});var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="coffeebreak-manifest-backup-"+today()+".json";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);};
$("importFile").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||!d.goal)throw 0;if(!confirm("Replace what is saved now with this backup?"))return;var df=defaults();for(var k in df){if(d[k]===undefined)d[k]=df[k];}S=d;save();renderAll();toast("Backup loaded");}catch(e){toast("That is not a Coffeebreak Manifest backup");}};r.readAsText(f);});

function renderAll(){renderGoal();renderAff();renderActions();renderVision();renderGr();renderSc();showScript();showTab(S.tab||"goal");}
renderAll();
window.CBManifest={state:function(){return S;}};
})();
