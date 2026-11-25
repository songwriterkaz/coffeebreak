/* Coffeebreak - Sing my songs karaoke. Plays Karen's own songs with full vocals and timed lyrics. */
(function(){
var C=window.CB_MYSONGS_CFG||{};var BASE=C.base||'assets/my-songs/';var LIMIT=C.limit||0;var BUY=C.buy||'';
var PAY='Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com';
var css="#cbms{position:fixed;inset:0;z-index:2147483646;background:linear-gradient(160deg,#ad1457,#e91e63 55%,#ff6fb5);color:#fff;font-family:system-ui,Segoe UI,Arial,sans-serif;display:none;flex-direction:column}"+
"#cbms.on{display:flex}#cbms *{box-sizing:border-box}#cbms header{display:flex;align-items:center;gap:10px;padding:8px 12px;background:rgba(0,0,0,.35)}#cbms header img{height:34px;border-radius:8px}#cbms header b{font-size:18px;flex:1}"+
"#cbms button{background:#ff4fa3;color:#fff;border:0;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;font-size:14px}#cbms button.g{background:rgba(255,255,255,.15)}#cbms button:disabled{opacity:.45}"+
"#cbmsMain{flex:1;display:flex;min-height:0}#cbmsList{width:300px;overflow:auto;background:rgba(0,0,0,.25);padding:6px}#cbmsList input{width:100%;padding:8px;border-radius:8px;border:0;margin-bottom:6px}"+
".cbmsI{padding:8px;border-radius:8px;cursor:pointer;display:flex;gap:6px;align-items:center;font-size:14px}.cbmsI:hover{background:rgba(255,79,163,.25)}.cbmsI.cur{background:#ff4fa3}.cbmsI small{opacity:.7;margin-left:auto}.cbmsI.lk{opacity:.55}"+
"#cbmsStage{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;min-width:0}#cbmsT{font-size:22px;font-weight:800;text-align:center}#cbmsSync{font-size:12px;opacity:.75;margin:2px 0 10px}"+
"#cbmsLy{width:100%;max-width:900px;flex:1;overflow:hidden;position:relative;text-align:center}#cbmsLyIn{position:absolute;left:0;right:0;transition:top .35s}"+
".cbmsL{font-size:22px;line-height:1.5;padding:4px 6px;opacity:.45;transition:opacity .2s,font-size .2s}.cbmsL.now{opacity:1;font-size:30px;font-weight:800;background-clip:text;-webkit-background-clip:text;color:transparent}.cbmsL.done{opacity:.3}"+
"#cbmsBar{width:100%;max-width:900px;height:10px;background:rgba(255,255,255,.2);border-radius:6px;cursor:pointer;margin:8px 0}#cbmsBar i{display:block;height:100%;width:0;background:#ff4fa3;border-radius:6px}"+
"#cbmsCtl{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;align-items:center}#cbmsMeter{width:90px;height:10px;background:rgba(255,255,255,.2);border-radius:6px;overflow:hidden}#cbmsMeter i{display:block;height:100%;width:0;background:#7CFFB2}"+
"#cbms footer{font-size:11px;padding:6px 10px;background:rgba(0,0,0,.4);text-align:center;line-height:1.5}#cbms footer a{color:#ffb3d9}#cbmsMsg{font-size:13px;min-height:18px;margin-top:6px;text-align:center}"+
"#cbmsOpen{position:fixed;left:12px;bottom:12px;z-index:99980;background:#ff4fa3;color:#fff;border:0;border-radius:24px;padding:12px 18px;font-weight:800;font-size:16px;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer}"+
"@media(max-width:700px){#cbmsMain{flex-direction:column}#cbmsList{width:100%;max-height:22vh}.cbmsL{font-size:17px}.cbmsL.now{font-size:22px}}";
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var logo=C.logo||(document.querySelector('img[src*="logo"]')||{}).src||'';
var R=document.createElement('div');R.id='cbms';R.innerHTML='<header>'+(logo?'<img src="'+logo+'" alt="Coffeebreak">':'')+'<b>Coffeebreak Karaoke - Sing my songs</b><button class="g" id="cbmsFs">Fullscreen</button><button class="g" id="cbmsX">Close</button></header>'+
'<div id="cbmsMain"><div id="cbmsList"><input id="cbmsQ" placeholder="Search songs"><div id="cbmsItems"></div></div><div id="cbmsStage"><div id="cbmsT">Pick a song</div><div id="cbmsSync"></div><div id="cbmsLy"><div id="cbmsLyIn"></div></div>'+
'<div id="cbmsBar"><i></i></div><div id="cbmsTime" style="font-size:12px;opacity:.8">0:00 / 0:00</div><div id="cbmsCtl"><button class="g" id="cbmsPrev">Prev</button><button id="cbmsPlay">Play</button><button class="g" id="cbmsNext">Next</button>'+
'<label style="font-size:13px">Song <input id="cbmsVol" type="range" min="0" max="1" step="0.05" value="0.9" style="width:80px"></label><button class="g" id="cbmsMic">Mic on</button><div id="cbmsMeter" title="Mic level"><i></i></div><button class="g" id="cbmsRec" disabled>Record</button></div><div id="cbmsMsg"></div></div></div>'+
'<footer>Songs written and owned by Coffeebreak. Karen keeps all rights. Buyers may resell this app but may not copy it. Third-party brands belong to their owners. '+PAY+'. Orders: songwriterkaz@gmail.com. <a href="https://www.tesla.com" target="_blank" rel="noopener">Tesla</a> | <a href="https://www.starlink.com" target="_blank" rel="noopener">Starlink</a></footer>';
function $(i){return document.getElementById(i)}
var A=new Audio();A.preload='auto';['timeupdate','seeked','play','loadedmetadata'].forEach(function(ev){A.addEventListener(ev,function(){try{draw()}catch(e){}})});A.crossOrigin='anonymous';var S=[],cur=-1,lines=[],ac,micStream,an,rec,chunks=[],mixDest,songNode,raf;
function fmt(t){t=Math.max(0,t|0);return (t/60|0)+':'+('0'+t%60).slice(-2)}
function msg(t){$('cbmsMsg').textContent=t||''}
function list(){var q=$('cbmsQ').value.toLowerCase(),h='';S.forEach(function(s,i){if(q&&s.title.toLowerCase().indexOf(q)<0)return;var lk=LIMIT&&i>=LIMIT&&!s.custom;h+='<div class="cbmsI'+(i==cur?' cur':'')+(lk?' lk':'')+'" data-i="'+i+'">'+(s.custom?'📁 ':'')+(lk?'🔒 ':'🎵 ')+s.title+'<small>'+fmt(s.dur)+'</small></div>'});$('cbmsItems').innerHTML=h||'<div style="opacity:.7;padding:8px">No songs match.</div>'}
function load(i,play){if(i<0||i>=S.length)return;var s=S[i];if(LIMIT&&i>=LIMIT&&!s.custom){msg('This song is in the full version. Buy for $5. '+PAY+'.');return}
cur=i;lines=s.lines||[];$('cbmsT').textContent=s.title;$('cbmsSync').textContent=s.sync=='tap'?'Tap Mark line while it plays to time each line':(s.sync=='instrumental'?'Instrumental - sing along your own way':(s.sync=='heard'?'Lyrics written down by ear from the recording':'Lyrics timed to the vocals'));
var h='';lines.forEach(function(l,j){h+='<div class="cbmsL" id="cbmsL'+j+'">'+esc(l.x)+'</div>'});$('cbmsLyIn').innerHTML=h||'<div class="cbmsL now" style="color:#fff">Instrumental</div>';$('cbmsLyIn').style.top='40%';
lastN=-2;if(s._url){try{URL.revokeObjectURL(s._url)}catch(e){}}
if(s.blob){s._url=URL.createObjectURL(s.blob);A.src=s._url}
else if(!s.file){A.removeAttribute('src');msg('This recording is not in the library.');list();return}
else A.src=BASE+s.file;
A.load();msg('Loading '+s.title);list();if(play)A.play().then(function(){msg('')}).catch(function(){msg('Press Play to start.')})}
function esc(t){return String(t).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
var lastN=-2;function tick(){draw();raf=requestAnimationFrame(tick)}
function draw(){var t=A.currentTime||0,d=A.duration||S[cur]&&S[cur].dur||0;$('cbmsBar').firstChild.style.width=(d?t/d*100:0)+'%';$('cbmsTime').textContent=fmt(t)+' / '+fmt(d);
var n=-1;for(var j=0;j<lines.length;j++){if(lines[j].t<=t)n=j;else break}
if(n!=lastN){for(var k=0;k<lines.length;k++){var e=$('cbmsL'+k);if(!e)continue;e.className='cbmsL'+(k==n?' now':(k<n?' done':''));if(k!=n)e.style.background=''}
var el=$('cbmsL'+(n<0?0:n));if(el){$('cbmsLyIn').style.top=($('cbmsLy').clientHeight*0.4-el.offsetTop)+'px'}lastN=n}
if(n>=0){var L=lines[n],e2=$('cbmsL'+n),p=Math.min(1,Math.max(0,(t-L.t)/Math.max(.3,(L.e||L.t+3)-L.t)))*100;if(e2)e2.style.background='linear-gradient(90deg,#ffe066 '+p+'%,#ffffff '+p+'%)';if(e2)e2.style.webkitBackgroundClip='text'}
if(an){var b=new Uint8Array(an.fftSize);an.getByteTimeDomainData(b);var m=0;for(var q=0;q<b.length;q++)m=Math.max(m,Math.abs(b[q]-128));$('cbmsMeter').firstChild.style.width=Math.min(100,m/1.28)+'%'}}
function ctx(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();mixDest=ac.createMediaStreamDestination();try{songNode=ac.createMediaElementSource(A);songNode.connect(ac.destination);songNode.connect(mixDest)}catch(e){}}if(ac.state=='suspended')ac.resume();return ac}
function mic(){if(micStream){micStream.getTracks().forEach(function(t){t.stop()});micStream=null;an=null;$('cbmsMic').textContent='Mic on';$('cbmsRec').disabled=true;$('cbmsMeter').firstChild.style.width='0';return}
if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){msg('This browser has no microphone access. You can still sing along.');return}
navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(s){micStream=s;var c=ctx();var src=c.createMediaStreamSource(s);an=c.createAnalyser();an.fftSize=1024;src.connect(an);src.connect(mixDest);$('cbmsMic').textContent='Mic off';$('cbmsRec').disabled=false;msg('Mic is on. Sing along, or press Record.')}).catch(function(){msg('Microphone was blocked. Allow it in your browser to record. You can still sing along.')})}
function record(){if(rec&&rec.state=='recording'){rec.stop();return}if(!window.MediaRecorder){msg('Recording is not supported in this browser.');return}ctx();chunks=[];try{rec=new MediaRecorder(mixDest.stream)}catch(e){msg('Recording is not supported in this browser.');return}
rec.ondataavailable=function(e){if(e.data.size)chunks.push(e.data)};rec.onstop=function(){$('cbmsRec').textContent='Record';var b=new Blob(chunks,{type:rec.mimeType||'audio/webm'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='my-coffeebreak-karaoke.webm';a.textContent='Download your recording';a.style.color='#fff';var m=$('cbmsMsg');m.innerHTML='';m.appendChild(a)};rec.start();$('cbmsRec').textContent='Stop recording';msg('Recording your voice with the song.');if(A.paused)A.play()}
function open(){R.classList.add('on');if(cur<0&&S.length)load(0,false)}
function init(){document.body.appendChild(R);var ob=document.createElement('button');ob.id='cbmsOpen';ob.textContent='🎤 Sing my songs';ob.onclick=open;document.body.appendChild(ob);
function fsEl(){return document.fullscreenElement||document.webkitFullscreenElement||null}
function exitFs(){var ex=document.exitFullscreen||document.webkitExitFullscreen;if(fsEl()&&ex)ex.call(document)}
function goFs(el){var d=el||R;var req=d.requestFullscreen||d.webkitRequestFullscreen;if(req){var p=req.call(d);if(p&&p.catch)p.catch(function(){})} }
$('cbmsX').onclick=function(e){if(e)e.stopPropagation();exitFs();R.classList.remove('on');A.pause()};
$('cbmsFs').onclick=function(e){if(e)e.stopPropagation();if(fsEl())exitFs();else goFs(R)};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&R.classList.contains('on')){$('cbmsX').click()}});
$('cbmsQ').oninput=list;$('cbmsItems').onclick=function(e){var it=e.target.closest('.cbmsI');if(it)load(+it.dataset.i,true)};
$('cbmsPlay').onclick=function(){ctx();if(cur<0)load(0,true);else if(A.paused)A.play().catch(function(){msg('Press Play again to start.')});else A.pause()};
$('cbmsPrev').onclick=function(){load(Math.max(0,cur-1),true)};$('cbmsNext').onclick=function(){var n=cur+1;if(LIMIT&&n>=LIMIT)n=0;load(n%S.length,true)};
$('cbmsVol').oninput=function(){A.volume=+this.value};$('cbmsMic').onclick=mic;$('cbmsRec').onclick=record;
$('cbmsBar').onclick=function(e){var r=this.getBoundingClientRect();if(A.duration)A.currentTime=(e.clientX-r.left)/r.width*A.duration};
A.onplay=function(){$('cbmsPlay').textContent='Pause'};A.onpause=function(){$('cbmsPlay').textContent='Play'};A.onended=function(){$('cbmsNext').onclick()};
A.onerror=function(){msg('This song could not load. Try another one.')};A.oncanplay=function(){if($('cbmsMsg').textContent.indexOf('Loading')==0)msg('')};
var up=document.createElement('div');up.style.cssText='padding:6px;font-size:13px';
up.innerHTML='<b>Your song</b><input id="cbmsFile" type="file" accept="audio/*" style="width:100%;margin:4px 0"><input id="cbmsTitle" placeholder="Song title" style="width:100%;padding:6px;border:0;border-radius:8px;margin-bottom:4px"><textarea id="cbmsWords" placeholder="One line of lyrics per line" style="width:100%;height:70px;border:0;border-radius:8px"></textarea><button type="button" id="cbmsAdd" class="g">Add this song</button> <button type="button" id="cbmsMark" class="g">Mark line</button>';
$('cbmsList').insertBefore(up,$('cbmsQ'));
var markAt=0;
function kdb(){return new Promise(function(res,rej){var r=indexedDB.open('cb-karaoke-mine',1);r.onupgradeneeded=function(){r.result.createObjectStore('songs',{keyPath:'id'})};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}})}
function saveMine(song){return kdb().then(function(db){return new Promise(function(res,rej){var t=db.transaction('songs','readwrite');t.objectStore('songs').put(song);t.oncomplete=function(){res()};t.onerror=function(){rej(t.error)}})})}
function loadMine(){return kdb().then(function(db){return new Promise(function(res,rej){var q=db.transaction('songs').objectStore('songs').getAll();q.onsuccess=function(){res(q.result||[])};q.onerror=function(){rej(q.error)}})})}
$('cbmsAdd').onclick=function(){var f=$('cbmsFile').files[0];var title=($('cbmsTitle').value||(f&&f.name)||'My song').replace(/\.[a-z0-9]+$/i,'');var words=$('cbmsWords').value.split(/\n/).map(function(x){return x.trim()}).filter(Boolean);
 if(!f){msg('Choose an audio file first.');return}
 var song={id:'up-'+Date.now(),title:title,custom:1,sync:'tap',dur:0,lines:words.map(function(x){return {t:0,x:x}}),blob:f};
 S.unshift(song);markAt=0;load(0,false);saveMine({id:song.id,title:song.title,lines:song.lines,blob:f}).then(function(){msg('Saved on this device. Press Play, then Mark line as each line starts.')}).catch(function(){msg('The song is loaded for this visit. This browser did not keep the file.')})}
$('cbmsMark').onclick=function(){var s=S[cur];if(!s||!s.custom){msg('Mark line is for a song you added.');return}
 if(!s.lines.length){msg('Add the words first, one line each.');return}
 if(markAt>=s.lines.length)markAt=0;
 s.lines[markAt].t=A.currentTime||0;if(markAt)s.lines[markAt-1].e=s.lines[markAt].t;
 markAt++;msg('Line '+markAt+' of '+s.lines.length+' timed.');
 saveMine({id:s.id,title:s.title,lines:s.lines,blob:s.blob}).catch(function(){})}
fetch(BASE+'songs.json').then(function(r){return r.json()}).then(function(j){return loadMine().catch(function(){return []}).then(function(mine){S=(j.songs||j).slice();mine.forEach(function(s){s.custom=1;s.sync='tap';S.unshift(s)});list();if(C.autoOpen!==false)open()})}).catch(function(){msg('Song list could not load.')});tick()}
window.CBMySongs={open:open,load:load,audio:A,songs:function(){return S},current:function(){return cur}};
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
