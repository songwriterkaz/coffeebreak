(function(){
var $=function(i){return document.getElementById(i)};
function fmt(s){s=Math.max(0,s||0);var m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x}
function dlb(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(a.href)},4000)}
function wav(buf){if(window.CB&&window.CB.wavBlob)return window.CB.wavBlob(buf);var nc=buf.numberOfChannels,n=buf.length,sr=buf.sampleRate,ab=new ArrayBuffer(44+n*nc*2),v=new DataView(ab);function ws(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))}ws(0,'RIFF');v.setUint32(4,36+n*nc*2,true);ws(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,sr,true);v.setUint32(28,sr*nc*2,true);v.setUint16(32,nc*2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,n*nc*2,true);var o=44,ch=[];for(var c=0;c<nc;c++)ch.push(buf.getChannelData(c));for(var i=0;i<n;i++)for(c=0;c<nc;c++){var s=Math.max(-1,Math.min(1,ch[c][i]));v.setInt16(o,s<0?s*32768:s*32767,true);o+=2}return new Blob([ab],{type:'audio/wav'})}
function M(t){var e=document.getElementById('msg');if(e)e.textContent=t}
var A=window.ac||new (window.AudioContext||window.webkitAudioContext)();
/* ---------- IndexedDB song store ---------- */
var DBN='cb-karaoke',db=null;
function openDB(){return new Promise(function(res,rej){if(db)return res(db);if(!window.indexedDB)return rej(new Error('No storage'));var r=indexedDB.open(DBN,1);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('songs'))d.createObjectStore('songs',{keyPath:'id'})};r.onsuccess=function(){db=r.result;res(db)};r.onerror=function(){rej(r.error)}})}
function tx(mode,fn){return openDB().then(function(d){return new Promise(function(res,rej){var t=d.transaction('songs',mode),s=t.objectStore('songs'),out=fn(s);t.oncomplete=function(){res(out&&out.result!==undefined?out.result:out)};t.onerror=function(){rej(t.error)}})})}
function allSongs(){return tx('readonly',function(s){return s.getAll()})}
function putSong(o){return tx('readwrite',function(s){s.put(o)})}
function delSong(id){return tx('readwrite',function(s){s.delete(id)})}
/* ---------- UI ---------- */
var css=document.createElement('style');css.textContent=
'#kbtn,#savetake{background:linear-gradient(135deg,#ff2d95,#ff7bbd);color:#fff;border:0;border-radius:8px;padding:6px 12px;font-weight:700;cursor:pointer}'+
'#kara{position:fixed;inset:0;z-index:9999;background:radial-gradient(circle at 50% 0,#3a0f2b,#0d0d12 70%);color:#e8e6f0;display:none;flex-direction:column;font-family:system-ui,sans-serif;overflow:auto}'+
'#kara.on{display:flex}#kara header{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #33334a;position:sticky;top:0;background:#16161ee6;z-index:2}'+
'#kara header img{width:40px;height:40px;border-radius:10px}#kara header b{color:#ff7bbd;font-size:18px;flex:1}'+
'#kara .kb{background:#2a2a38;color:#fff;border:1px solid #ff2d95;border-radius:10px;padding:9px 14px;font-weight:600;cursor:pointer;min-height:42px}#kara .kb.pk{background:linear-gradient(135deg,#ff2d95,#ff7bbd);border:0}#kara .kb.on{background:#ff4d4d;border-color:#ff4d4d}'+
'#kara .kw{display:grid;grid-template-columns:minmax(220px,320px) 1fr;gap:12px;padding:12px;flex:1;min-height:0}@media(max-width:760px){#kara .kw{grid-template-columns:1fr}}'+
'#kara .pn{background:#16161ecc;border:1px solid #33334a;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px}'+
'#kara h3{margin:0;color:#ff7bbd;font-size:15px}#kara small{color:#8d8aa3}#kara textarea{width:100%;min-height:90px;background:#0d0d12;color:#fff;border:1px solid #33334a;border-radius:8px;padding:8px;box-sizing:border-box}'+
'#ksongs{list-style:none;margin:0;padding:0;max-height:240px;overflow:auto}#ksongs li{display:flex;gap:6px;align-items:center;padding:7px;border-radius:8px;cursor:pointer;border:1px solid transparent}#ksongs li.sel{border-color:#ff2d95;background:#2a0d20}#ksongs li span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ksongs li button{background:none;border:0;color:#8d8aa3;cursor:pointer;font-size:16px}'+
'#klyr{flex:1;min-height:260px;max-height:60vh;overflow:auto;text-align:center;padding:30vh 10px;scroll-behavior:smooth;mask-image:linear-gradient(transparent,#000 20%,#000 80%,transparent);-webkit-mask-image:linear-gradient(transparent,#000 20%,#000 80%,transparent)}'+
'#klyr p{font-size:clamp(22px,4.5vw,40px);font-weight:800;margin:.35em 0;color:#5a5770;transition:color .2s,transform .2s}#klyr p.cur{color:#fff;text-shadow:0 0 18px #ff2d95;transform:scale(1.06)}#klyr p.past{color:#a77897}'+
'#kara .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}#kara input[type=range]{accent-color:#ff2d95;flex:1;min-width:100px}#kmsg{color:#ffd166;min-height:1.2em}#ktime{font:600 14px ui-monospace,monospace;color:#3ddc97}#kara label{font-size:14px}';
document.head.appendChild(css);
var logo=(document.querySelector('header img')||{}).src||'logo.jpg';
var ov=document.createElement('div');ov.id='kara';ov.innerHTML=
'<header><img src="'+logo+'" alt="Coffeebreak logo"><b>Coffeebreak Karaoke</b><button class="kb" id="kclose">Back to studio</button></header>'+
'<div class="kw"><div class="pn">'+
'<h3>Your songs</h3><button class="kb pk" id="kup">Upload songs</button><input type="file" id="kfile" accept="audio/*,.mp3,.wav,.m4a,.ogg" multiple hidden>'+
'<small>MP3, WAV, M4A or OGG. Songs stay saved on this device.</small><ul id="ksongs"></ul>'+
'<h3>Lyrics</h3><textarea id="ktext" placeholder="Paste lyrics here, plain text or .lrc with [00:12.00] times"></textarea>'+
'<div class="row"><button class="kb" id="klup">Upload lyrics file</button><button class="kb" id="ksavel">Save lyrics to song</button></div><input type="file" id="klfile" accept=".txt,.lrc,text/plain" hidden>'+
'</div><div class="pn">'+
'<div class="row"><button class="kb pk" id="kplay">Play</button><button class="kb" id="kstop">Stop</button><button class="kb" id="kmic">Turn on mic</button><button class="kb" id="krec">Record performance</button><span id="ktime">0:00 / 0:00</span></div>'+
'<input type="range" id="kseek" min="0" max="1000" value="0" aria-label="Song position">'+
'<div id="klyr"><p>Upload a song, pick it, add lyrics and press Play</p></div>'+
'<div class="row"><label>Music</label><input type="range" id="kmv" min="0" max="150" value="100"><label>Mic monitor</label><input type="range" id="kmon" min="0" max="150" value="0"></div>'+
'<div class="row"><label><input type="checkbox" id="kvr"> Vocal reducer</label><small>Works best on some songs, mostly ones with the voice in the middle</small></div>'+
'<small>Use headphones when the mic monitor is up so the speakers do not echo.</small>'+
'<div id="kmsg"></div><div class="row" id="kdl"></div></div></div>';
document.body.appendChild(ov);
function say(t){$('kmsg').textContent=t}
/* graph: song -> [normal | vocal reducer] -> musicGain -> out + recDest; mic -> monGain -> out ; mic -> recMic -> recDest */
var songs=[],cur=null,buf=null,src=null,t0=0,off=0,playing=false,mic=null,micSrc=null;
var music=A.createGain(),dry=A.createGain(),wet=A.createGain(),mon=A.createGain(),micRec=A.createGain(),dest=A.createMediaStreamDestination?A.createMediaStreamDestination():null,inG=A.createGain();
mon.gain.value=0;wet.gain.value=0;
// vocal reducer: L-R into both channels
var spl=A.createChannelSplitter(2),inv=A.createGain();inv.gain.value=-1;var sum=A.createGain(),mrg=A.createChannelMerger(2);
inG.connect(dry);inG.connect(spl);spl.connect(sum,0);spl.connect(inv,1);inv.connect(sum);sum.connect(mrg,0,0);sum.connect(mrg,0,1);mrg.connect(wet);
dry.connect(music);wet.connect(music);music.connect(A.destination);if(dest)music.connect(dest);
mon.connect(A.destination);if(dest)micRec.connect(dest);
$('kvr').onchange=function(){var on=this.checked;dry.gain.value=on?0:1;wet.gain.value=on?1:0;say(on?'Vocal reducer on. It works best on some songs.':'Vocal reducer off')};
$('kmv').oninput=function(){music.gain.value=this.value/100};$('kmon').oninput=function(){mon.gain.value=this.value/100};
function render(){var ul=$('ksongs');ul.innerHTML='';if(!songs.length){ul.innerHTML='<li><span>No songs yet</span></li>'}songs.forEach(function(s){var li=document.createElement('li');if(cur&&cur.id===s.id)li.className='sel';li.innerHTML='<span></span><button title="Delete song">&#10005;</button>';li.firstChild.textContent=s.name;li.onclick=function(e){if(e.target.tagName==='BUTTON'){if(confirm('Remove '+s.name+' from your songs?')){delSong(s.id).then(load);if(cur&&cur.id===s.id){stop();cur=null;buf=null}}return}pick(s)};ul.appendChild(li)})}
function load(){return allSongs().then(function(a){songs=(a||[]).sort(function(x,y){return x.added-y.added});render()}).catch(function(e){say('Could not open song storage: '+e.message)})}
$('kup').onclick=function(){$('kfile').click()};
$('kfile').onchange=function(){var fs=[].slice.call(this.files);this.value='';var p=Promise.resolve();fs.forEach(function(f){p=p.then(function(){return putSong({id:'s'+Date.now()+Math.random().toString(36).slice(2,6),name:f.name.replace(/\.[^.]+$/,''),type:f.type,blob:f,lyrics:'',added:Date.now()})})});p.then(load).then(function(){say(fs.length+' song'+(fs.length===1?'':'s')+' added')}).catch(function(e){say('Upload failed: '+e.message)})};
$('klup').onclick=function(){$('klfile').click()};
$('klfile').onchange=function(){var f=this.files[0];this.value='';if(!f)return;f.text().then(function(t){$('ktext').value=t;parseLyrics();if(cur){cur.lyrics=t;putSong(cur)}say('Lyrics loaded')})};
$('ksavel').onclick=function(){if(!cur){say('Pick a song first');return}cur.lyrics=$('ktext').value;putSong(cur).then(function(){say('Lyrics saved with '+cur.name)});parseLyrics()};
$('ktext').oninput=function(){parseLyrics()};
var lines=[],timed=false;
function parseLyrics(){var t=$('ktext').value||'';lines=[];timed=false;t.split(/\r?\n/).forEach(function(l){var re=/\[(\d+):(\d+(?:\.\d+)?)\]/g,m,ts=[];while((m=re.exec(l)))ts.push(+m[1]*60+ +m[2]);var txt=l.replace(/\[[^\]]*\]/g,'').trim();if(ts.length){timed=true;ts.forEach(function(x){lines.push({t:x,s:txt||'...'})})}else if(txt&&!/^\[/.test(l))lines.push({t:-1,s:txt})});if(timed){lines=lines.filter(function(l){return l.t>=0}).sort(function(a,b){return a.t-b.t})}var box=$('klyr');box.innerHTML='';if(!lines.length){box.innerHTML='<p>'+(cur?'No lyrics yet. Paste some on the left, or just sing along':'Upload a song, pick it, add lyrics and press Play')+'</p>';return}lines.forEach(function(l){var p=document.createElement('p');p.textContent=l.s;box.appendChild(p)})}
function pick(s){stop();cur=s;off=0;buf=null;$('ktext').value=s.lyrics||'';parseLyrics();render();say('Loading '+s.name+'...');s.blob.arrayBuffer().then(function(ab){return new Promise(function(res,rej){var r=A.decodeAudioData(ab,res,rej);if(r&&r.then)r.then(res,rej)})}).then(function(b){if(cur!==s)return;buf=b;tick();say(s.name+' is ready. Press Play')}).catch(function(){say('This browser cannot play that file. Try MP3 or WAV')})}
function now(){return playing?A.currentTime-t0:off}
function play(){if(!buf){say(cur?'Still loading the song':'Pick a song first');return Promise.resolve(false)}return (A.state!=='running'?A.resume():Promise.resolve()).then(function(){if(playing)return true;src=A.createBufferSource();src.buffer=buf;src.connect(inG);if(off>=buf.duration)off=0;t0=A.currentTime-off;src.start(0,off);playing=true;var me=src;src.onended=function(){if(src===me&&playing&&now()>=buf.duration-0.1){playing=false;off=0;$('kplay').textContent='Play';if(R)stopRec()}};$('kplay').textContent='Pause';return true})}
function pause(){if(!playing)return;off=now();try{src.stop()}catch(e){}playing=false;$('kplay').textContent='Play'}
function stop(){if(playing){try{src.stop()}catch(e){}}playing=false;off=0;$('kplay').textContent='Play';if(R)stopRec();tick()}
$('kplay').onclick=function(){playing?pause():play()};$('kstop').onclick=stop;
$('kseek').oninput=function(){if(!buf)return;var w=playing;if(w)pause();off=this.value/1000*buf.duration;if(w)play();tick()};
var lastIdx=-2;
function tick(){var d=buf?buf.duration:0,n=Math.min(now(),d);$('ktime').textContent=fmt(n)+' / '+fmt(d);if(d&&document.activeElement!==$('kseek'))$('kseek').value=Math.round(n/d*1000);var ps=$('klyr').children;if(lines.length&&ps.length===lines.length){var idx;if(timed){idx=-1;for(var i=0;i<lines.length;i++)if(lines[i].t<=n+0.15)idx=i}else idx=d?Math.floor(n/d*lines.length):-1;if(idx!==lastIdx){lastIdx=idx;for(i=0;i<ps.length;i++)ps[i].className=i===idx?'cur':(i<idx?'past':'');var el=ps[Math.max(0,idx)];if(el){var box=$('klyr');box.scrollTop=el.offsetTop-box.clientHeight/2+el.clientHeight/2}}}}
setInterval(function(){if(ov.classList.contains('on'))tick()},120);
function micOn(){if(mic)return Promise.resolve(true);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){say('This browser cannot use the mic here. Try the fullscreen button on itch, or open the game in its own tab');return Promise.resolve(false)}return (A.state!=='running'?A.resume():Promise.resolve()).then(function(){return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:false}})}).then(function(s){mic=s;micSrc=A.createMediaStreamSource(s);micSrc.connect(mon);micSrc.connect(micRec);$('kmic').textContent='Mic on';$('kmic').classList.add('pk');say('Mic is on. Raise Mic monitor to hear yourself, with headphones');return true}).catch(function(e){say('The mic is blocked. On itch, press the fullscreen button and try again, or allow the microphone in your browser settings ('+(e&&e.name||'error')+')');return false})}
$('kmic').onclick=function(){micOn()};
/* recording: MediaRecorder (webm/ogg/mp4) with WAV fallback */
var R=null;
function recType(){if(!window.MediaRecorder)return null;var t=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'];for(var i=0;i<t.length;i++)if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t[i]))return t[i];return ''}
function startRec(){return micOn().then(function(ok){if(!ok&&!buf){return}var mt=recType(),name=(cur?cur.name:'karaoke')+' coffeebreak karaoke';if(mt!==null&&dest){var mr=new MediaRecorder(dest.stream,mt?{mimeType:mt}:{}),ch=[];mr.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};mr.onstop=function(){var ty=mr.mimeType||mt||'audio/webm',ext=ty.indexOf('ogg')>=0?'ogg':ty.indexOf('mp4')>=0?'m4a':'webm';offer(new Blob(ch,{type:ty}),name+'.'+ext)};mr.start(500);R={mr:mr}}else{var sp=A.createScriptProcessor(4096,2,2),L=[],Rr=[];var mix=A.createGain();music.connect(mix);micRec.connect(mix);mix.connect(sp);sp.connect(A.destination);sp.onaudioprocess=function(e){L.push(new Float32Array(e.inputBuffer.getChannelData(0)));Rr.push(new Float32Array(e.inputBuffer.getChannelData(1)));e.outputBuffer.getChannelData(0).fill(0);e.outputBuffer.getChannelData(1).fill(0)};R={sp:sp,mix:mix,L:L,R:Rr,name:name}}$('krec').textContent='Stop recording';$('krec').classList.add('on');if(buf&&!playing)play();say('Recording your performance')})}
function stopRec(){var r=R;R=null;$('krec').textContent='Record performance';$('krec').classList.remove('on');if(!r)return;if(r.mr){r.mr.stop()}else{r.sp.disconnect();r.mix.disconnect();try{music.disconnect(r.mix);micRec.disconnect(r.mix)}catch(e){}var n=0;r.L.forEach(function(a){n+=a.length});if(!n){say('Nothing was recorded');return}var b=A.createBuffer(2,n,A.sampleRate),o=0;r.L.forEach(function(a,i){b.getChannelData(0).set(a,o);b.getChannelData(1).set(r.R[i],o);o+=a.length});offer(wav(b),r.name+'.wav')}}
function offer(blob,name){var d=$('kdl');var b=document.createElement('button');b.className='kb pk';b.textContent='Download '+name;b.onclick=function(){dlb(blob,name)};var a=document.createElement('audio');a.controls=true;a.src=URL.createObjectURL(blob);a.style.maxWidth='100%';d.prepend(a);d.prepend(b);say('Recording ready. Press Download to save it')}
$('krec').onclick=function(){R?(stopRec(),pause()):startRec()};
$('kclose').onclick=function(){pause();ov.classList.remove('on')};
function openK(){ov.classList.add('on');try{if(window.CB&&window.CB.PLAY.on)window.CB.stop()}catch(e){}load()}
/* header buttons */
var tp=document.querySelector('header .tp')||document.body;var kb=document.createElement('button');kb.id='kbtn';kb.textContent='Karaoke';kb.title='Karaoke mode';kb.onclick=openK;tp.appendChild(kb);
/* download studio takes */
var sv=document.createElement('button');sv.id='savetake';sv.textContent='Save take';sv.title='Download the selected or last recorded take as WAV';tp.appendChild(sv);
function BF(){return (window.CB&&window.CB.BUFS)||{}}
function newestBuf(){var k=Object.keys(BF());return k.length?k[k.length-1]:null}
sv.onclick=function(){var id=null;try{var P=window.CB.P,S=window.CB.SEL;if(S&&S.c!=null){P.tracks.forEach(function(t){t.clips.forEach(function(c){if(c.id===S.c&&c.kind==='audio')id=c.buf})})}}catch(e){}id=id||newestBuf();if(!id||!BF()[id]){M('Record a take first, or select an audio clip');return}dlb(wav(BF()[id]),'coffeebreak take '+(function(d){function z(n){return(n<10?'0':'')+n}return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())})(new Date())+'.wav');M('Take saved as WAV')};
window.CBK={open:openK,load:load,play:play,stop:stop,startRec:startRec,stopRec:stopRec,parse:parseLyrics,get lines(){return lines},get timed(){return timed},pick:function(i){pick(songs[i])},get songs(){return songs},get buf(){return buf}};
})();
