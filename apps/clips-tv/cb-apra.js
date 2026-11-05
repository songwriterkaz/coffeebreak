/* Coffeebreak APRA play counter v1 - plays on this device only, nothing is sent anywhere */
(function(){
if(window.__cbApra)return;window.__cbApra=1;
var APP=(window.cbApraApp||document.title||'app').toString().toLowerCase().replace(/^coffeebreak[\s-]*/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24)||'app';
var WRITER="Karen O'Brien (Coffeebreak)";
var LK='cbApraLog1',W=null,wLoading=0,cur=null,pillT=0;
function norm(t){return (t||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function fnv(s){var h=0x811c9dc5;s=unescape(encodeURIComponent(s));for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h.toString(36)}
function loadWorks(){if(W||wLoading)return;wLoading=1;if(window.CB_APRA_WORKS){W=window.CB_APRA_WORKS;return}
 var s=document.createElement('script');s.src=(window.cbApraBase||'')+'cb-apra-works.js';s.onload=function(){W=window.CB_APRA_WORKS||{gw:{},reg:[]};if(W.reg&&!W.regS){W.regS={};W.reg.forEach(function(h){W.regS[h]=1})}render()};s.onerror=function(){W={gw:{},reg:[],regS:{}}};document.head.appendChild(s)}
function work(title){if(!W)return 'checking...';if(W.reg&&!W.regS){W.regS={};W.reg.forEach(function(h){W.regS[h]=1})}
 var c=[title,title.replace(/\(.*?\)/g,''),title.replace(/\b(vocals?|v\d+|remaster(ed)?|demo)\b/ig,''),title.replace(/^coffee ?break\s*[-–:]\s*/i,'')];
 for(var i=0;i<c.length;i++){var n=norm(c[i]);if(!n)continue;var h=fnv(n);if(W.gw[h])return 'GW'+W.gw[h]}
 for(i=0;i<c.length;i++){n=norm(c[i]);if(n&&W.regS[fnv(n)])return 'Registered (work no. not on file)'}
 return 'Registration pending'}
function getLog(){try{return JSON.parse(localStorage.getItem(LK)||'[]')}catch(e){return []}}
function setLog(l){try{localStorage.setItem(LK,JSON.stringify(l.slice(-5000)))}catch(e){}}
var mem=[];function log(){var l=getLog();return l.length?l:mem}
function pretty(u){try{u=decodeURIComponent((u||'').split(/[?#]/)[0].split('/').pop()).replace(/\.(mp3|m4a|ogg|wav|aac|flac|webm|mp4)$/i,'')}catch(e){u=''}
 if(/^[0-9a-f-]{8,}$/i.test(u)||/^\d{1,3}$/.test(u)||/^track ?\d+$/i.test(u))return '';
 return u.replace(/^suno[-_]/i,'').replace(/[-_]v\d+$/i,'').replace(/[-_]+/g,' ').replace(/\b\w/g,function(m){return m.toUpperCase()}).trim()}
function lists(){var o=[];function g(f){try{var v=f();if(Array.isArray(v)&&v.length&&o.indexOf(v)<0)o.push(v)}catch(e){}}
 g(function(){return SONGS});g(function(){return PL});g(function(){return PLAYLIST});g(function(){return TRACKS});g(function(){return songs});g(function(){return tracks});g(function(){return playlist});g(function(){return window.SONGS||window.PLAYLIST||window.TRACKS});return o}
function fromLists(src){var b=decodeURIComponent((src||'').split(/[?#]/)[0].split('/').pop()||''),bn=b.replace(/\.[a-z0-9]+$/i,'');if(!b)return '';
 var L=lists();for(var i=0;i<L.length;i++){var a=L[i];for(var j=0;j<a.length&&j<3000;j++){var e=a[j];if(!e)continue;
  if(Array.isArray(e)){var hit=e.some(function(x){return typeof x=='string'&&(x==b||x==bn||x.split('/').pop()==b||x.indexOf(bn)>=0&&bn.length>5)});if(hit){var t=e.filter(function(x){return typeof x=='string'&&/[ A-Z]/.test(x)&&x.indexOf('/')<0&&x!=b&&x!=bn})[0];if(t)return t}}
  else if(typeof e=='object'){var f=e.file||e.src||e.url||e.f||e.id||'';if(f&&(String(f).split('/').pop()==b||String(f)==bn||String(f).indexOf(bn)>=0&&bn.length>5)){var tt=e.title||e.t||e.name||e.n;if(tt)return String(tt)}}}}
 return ''}
function npText(){var q=document.querySelectorAll('#np,#cbsk-np,#nowPlaying,#now-playing,#nowplaying,.now-playing,.nowplaying,#title,#songTitle,#trackTitle');for(var i=0;i<q.length;i++){var t=(q[i].textContent||'').replace(/^\s*(now playing|playing)\s*[:\-–]?\s*/i,'').trim();if(t&&t.length<120&&!/loading|no music/i.test(t))return t}return ''}
function titleFor(el,src){var t=(el&&(el.dataset&&(el.dataset.title||el.dataset.song)||el.title))||'';
 if(!t&&el&&el.cbr&&el.cbr[1])t=el.cbr[1];
 if(!t&&typeof window.cbApraTitle=='function'){try{t=window.cbApraTitle(el,src)}catch(e){}}
 if(!t)t=fromLists(src);if(!t)t=pretty(src);if(!t)t=npText();
 if(!t){var b=(src||'').split(/[?#]/)[0].split('/').pop().replace(/\.[a-z0-9]+$/i,'');t='Coffeebreak song '+(b||'');}
 return t.replace(/\s+/g,' ').trim().slice(0,100)}
function ymd(d){return d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)}
function fmt(s){s=Math.round(s||0);return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
function count(S){S.counted=1;var d=new Date(),l=getLog(),day=ymd(d),n=1;for(var i=0;i<l.length;i++)if(l[i].r&&l[i].r.indexOf('CB-'+day+'-')==0)n++;
 var e={d:d.getFullYear()+'-'+day.slice(4,6)+'-'+day.slice(6),t:d.toTimeString().slice(0,8),a:APP,ti:S.title,w:work(S.title),r:'CB-'+day+'-'+APP+'-'+n,s:Math.round(S.heard),len:Math.round(S.dur||0)};
 l.push(e);setLog(l);if(!getLog().length)mem.push(e);S.ref=e.r;S.work=e.w;render();pill(S)}
var active=[];
function track(S){if(active.indexOf(S)<0)active.push(S);loadWorks();cur=S;render();pill(S)}
setInterval(function(){for(var i=0;i<active.length;i++){var S=active[i];if(!S.playing())continue;var t=S.time();var d=t-S.last;if(d>0&&d<3)S.heard+=d;S.last=t;var du=S.duration();if(du)S.dur=du;
 if(!S.counted&&S.heard>=30)count(S);if(cur===S)upd()}},1000);
function endS(S){var du=S.duration()||S.dur;if(!S.counted&&du>=10&&S.heard>=du*0.8)count(S)}
function isMusic(el){var s=el.currentSrc||el.src||'';if(!s&&el.srcObject)return false;if(/^(blob:|data:|mediastream:)/i.test(s))return false;if(el.muted)return false;if(el.dataset&&el.dataset.noApra!=null)return false;return !!s}
function hook(el){if(!el||el.__cbAH)return;el.__cbAH=1;el.addEventListener('playing',function(){onPlay(el)});el.addEventListener('ended',function(){if(el.__cbS)endS(el.__cbS)})}
function onPlay(el){if(!isMusic(el))return;var src=el.currentSrc||el.src;var S=el.__cbS;
 if(!S||S.src!==src||S.done){S=el.__cbS={src:src,heard:0,counted:0,last:el.currentTime||0,dur:el.duration||0,title:titleFor(el,src),
  playing:function(){return !el.paused&&!el.ended&&!el.muted&&el.volume>0},time:function(){return el.currentTime||0},duration:function(){return isFinite(el.duration)?el.duration:0}};
  var i=active.indexOf(el.__old);if(i>=0)active.splice(i,1);el.__old=S}
 setTimeout(function(){var t2=titleFor(el,src);if(t2&&t2!==S.title&&/^Coffeebreak song/.test(S.title)){S.title=t2;render()}},800);
 track(S)}
document.addEventListener('playing',function(e){var el=e.target;if(el&&(el.tagName=='AUDIO'||el.tagName=='VIDEO')){hook(el);onPlay(el)}},true);
document.addEventListener('ended',function(e){var el=e.target;if(el&&el.__cbS)endS(el.__cbS)},true);
try{var P=HTMLMediaElement.prototype,op=P.play;P.play=function(){hook(this);return op.apply(this,arguments)}}catch(e){}
/* YouTube clips (Clips TV) */
function wrapYT(){try{if(!window.YT||!YT.Player||YT.Player.__cb)return;var O=YT.Player;var Wp=function(a,b){var p=new O(a,b);try{p.addEventListener('onStateChange',function(ev){yt(p,ev.data)})}catch(e){}return p};Wp.prototype=O.prototype;Wp.__cb=1;YT.Player=Wp}catch(e){}}
var oR=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){wrapYT();if(oR)return oR.apply(this,arguments)};
try{var _r=window.onYouTubeIframeAPIReady;Object.defineProperty(window,'onYouTubeIframeAPIReady',{configurable:true,get:function(){return _r},set:function(f){oR=f}})}catch(e){}
var ytI=setInterval(function(){wrapYT();if(window.YT&&YT.Player&&YT.Player.__cb)clearInterval(ytI)},300);setTimeout(function(){clearInterval(ytI)},60000);
function yt(p,st){var vd={};try{vd=p.getVideoData()||{}}catch(e){}var id=vd.video_id||'';var S=p.__cbS;
 if(st===1){if(!S||S.id!==id||S.done){S=p.__cbS={id:id,src:'yt:'+id,heard:0,counted:0,last:0,dur:0,title:(vd.title||'Coffeebreak TV Series clip').slice(0,100),
  playing:function(){try{return p.getPlayerState()===1&&!p.isMuted()}catch(e){return false}},time:function(){try{return p.getCurrentTime()}catch(e){return 0}},duration:function(){try{return p.getDuration()}catch(e){return 0}}};S.last=S.time()}track(S)}
 if(st===0&&S){endS(S);S.done=1}}
/* UI */
var css='#cbApra{display:block;clear:both;position:static;box-sizing:border-box;width:100%;max-width:640px;margin:18px auto 6px;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#ff4f9a,#ff8cc6);color:#fff;font:13px/1.4 system-ui,-apple-system,Segoe UI,sans-serif;text-align:left;box-shadow:0 2px 10px rgba(255,79,154,.35)}#cbApra *{box-sizing:border-box}#cbApra b{font-weight:700}#cbApra .h{font-weight:800;font-size:14px;margin-bottom:4px}#cbApra .np{font-size:16px;font-weight:800;margin:4px 0;word-break:break-word}#cbApra .g{display:grid;grid-template-columns:auto 1fr;gap:2px 10px}#cbApra .k{opacity:.85}#cbApra button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:7px 12px;margin:8px 6px 0 0;background:#fff;color:#d6246e;cursor:pointer}#cbApra .n{font-size:11px;opacity:.9;margin-top:6px}#cbApra textarea{width:100%;height:110px;margin-top:6px;font:11px monospace;color:#333;border-radius:8px;border:0}'+
 '#cbApraPill{position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:2147483000;max-width:92vw;padding:4px 12px;border-radius:999px;background:rgba(255,79,154,.92);color:#fff;font:600 12px/1.3 system-ui,-apple-system,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none;opacity:0;transition:opacity .4s}#cbApraPill.on{opacity:1}';
var box,pl;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mount(){if(document.getElementById('cbApra'))return;var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 box=document.createElement('div');box.id='cbApra';var foot=document.getElementById('cbYtFoot');
 if(foot&&foot.parentNode)foot.parentNode.insertBefore(box,foot);else document.body.appendChild(box);
 pl=document.createElement('div');pl.id='cbApraPill';document.body.appendChild(pl);render()}
function stats(){var l=log(),tot=0,song=0,today=0,day=ymd(new Date());for(var i=0;i<l.length;i++){tot++;if(cur&&l[i].ti===cur.title)song++;if(l[i].r&&l[i].r.indexOf('CB-'+day)==0)today++}return{tot:tot,song:song,today:today}}
function render(){if(!box)return;var s=stats();var c=cur;
 box.innerHTML='<div class="h">&#127925; APRA AMCOS play counter &middot; plays on this device</div>'+
 (c?'<div class="np">Now playing: '+esc(c.title)+'</div>':'<div class="np">Play a Coffeebreak song to start counting</div>')+
 '<div class="g"><span class="k">Writer</span><span>'+esc(WRITER)+'</span>'+
 (c?'<span class="k">APRA AMCOS work no.</span><span>'+esc(work(c.title))+'</span><span class="k">Plays of this song</span><span id="cbApraSC">'+s.song+'</span><span class="k">Play reference</span><span id="cbApraRef">'+esc(c.ref||(c.counted?'':'counts after 30s ('+fmt(c.heard)+')'))+'</span>':'')+
 (function(){var l=log(),e=l[l.length-1];return e?'<span class="k">Last counted play</span><span>'+esc(e.r)+' &middot; '+esc(e.ti)+' &middot; '+esc(/^GW/.test(e.w)?e.w:work(e.ti))+'</span>':''})()+'<span class="k">Plays today</span><span>'+s.today+'</span><span class="k">All plays logged</span><span>'+s.tot+'</span></div>'+
 '<button type="button" id="cbApraDl">Download APRA play log (CSV)</button><button type="button" id="cbApraCp">Copy log</button>'+
 '<div class="n">A play counts after 30 seconds or a full play. This counter only sees plays on this device and browser; nothing is sent anywhere. Use the log as a reference for your APRA AMCOS performance reports.</div><div id="cbApraTa"></div>';
 document.getElementById('cbApraDl').onclick=dl;document.getElementById('cbApraCp').onclick=cp}
function upd(){var r=document.getElementById('cbApraRef');if(r&&cur&&!cur.counted)r.textContent='counts after 30s ('+fmt(cur.heard)+')'}
function pill(S){if(!pl)return;pl.textContent='\u266B '+S.title+' \u00B7 '+work(S.title)+(S.ref?' \u00B7 '+S.ref:'');pl.className='on';clearTimeout(pillT);pillT=setTimeout(function(){pl.className=''},6000)}
function csv(){var q=function(v){v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
 var rows=[['date','time','app','title','writer','work_number','reference','duration','seconds_listened']];
 log().forEach(function(e){rows.push([e.d,e.t,e.a,e.ti,WRITER,/^GW/.test(e.w)?e.w:(W?work(e.ti):e.w),e.r,fmt(e.len),e.s])});
 return rows.map(function(r){return r.map(q).join(',')}).join('\r\n')}
function dl(){loadWorks();setTimeout(function(){var t=csv();try{var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download='coffeebreak-apra-play-log-'+ymd(new Date())+'.csv';document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}catch(e){}show(t)},W?0:600)}
function show(t){var d=document.getElementById('cbApraTa');if(d)d.innerHTML='<div class="n">If the download did not start, copy this:</div><textarea readonly>'+esc(t)+'</textarea>'}
function cp(){loadWorks();setTimeout(function(){var t=csv();try{navigator.clipboard.writeText(t).then(function(){var b=document.getElementById('cbApraCp');if(b)b.textContent='Copied'},function(){show(t)})}catch(e){show(t)}},W?0:600)}
window.cbApra={log:log,csv:csv,work:function(t){loadWorks();return work(t)},app:APP};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
setTimeout(function(){var b=document.getElementById('cbApra'),f=document.getElementById('cbYtFoot');if(b&&f&&b.nextElementSibling!==f&&f.parentNode)f.parentNode.insertBefore(b,f)},3000);
})();
