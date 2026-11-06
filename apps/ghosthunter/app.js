(function(){
var $=function(i){return document.getElementById(i)};
var DEMO=false;
var MAX=12000;
var tabs=[
  ['emf','📟 EMF'],['box','📻 Spirit Box'],['evp','🎙 EVP'],['ouija','🔮 Word Board'],
  ['radar','📡 Radar'],['rem','🌡 REM Pod'],['nv','🟢 Night Vision'],['thermal','🔥 Thermal'],
  ['tools','🧰 12k Tools'],['log','📓 Evidence'],['places','🏚 Places']
];
var cur='emf';
tabs.forEach(function(t){var b=document.createElement('button');b.textContent=t[1];b.id='t_'+t[0];b.onclick=function(){show(t[0])};$('nav').appendChild(b)});
function show(id){cur=id;tabs.forEach(function(t){var s=$(t[0]); if(s) s.classList.toggle('on',t[0]==id); var b=$('t_'+t[0]); if(b) b.classList.toggle('on',t[0]==id)});if(id!='box')stopBox(); if(id=='thermal') thDraw(); if(id=='tools') toolsInit();}
function leds(el,n){var h='';for(var i=1;i<=5;i++)h+='<div class="led'+(i<=n?' l'+i:'')+'"></div>';$(el).innerHTML=h}

// Glow + fullscreen
$('glowBtn').onclick=function(){document.body.classList.toggle('glow'); this.classList.toggle('on', document.body.classList.contains('glow')); this.textContent=document.body.classList.contains('glow')?'Glow on':'Green glow'};
$('fsBtn').onclick=function(){try{if(window.cbFullscreen&&window.cbFullscreen.toggle)window.cbFullscreen.toggle(); else {var el=document.documentElement; (el.requestFullscreen||el.webkitRequestFullscreen||el.msRequestFullscreen).call(el)}}catch(e){}};

// EMF
var emf=0,target=0.3,sens=0;
function emfTick(){if(Math.random()<0.02)target=1+Math.random()*4;else if(Math.random()<0.05)target=Math.random()*0.8;
target+=sens;sens*=0.9;emf+=(target-emf)*0.08;var c=$('emfc'); if(!c) return; var x=c.getContext('2d');x.clearRect(0,0,400,230);
x.lineWidth=14;var cols=['#3f6','#9f3','#ff3','#f93','#f33'];for(var i=0;i<5;i++){x.strokeStyle=cols[i];x.beginPath();x.arc(200,210,160,Math.PI+i*Math.PI/5,Math.PI+(i+1)*Math.PI/5);x.stroke()}
var a=Math.PI+Math.min(emf,5)/5*Math.PI+Math.sin(Date.now()/90)*0.01;x.strokeStyle='#d8f5e0';x.lineWidth=3;x.beginPath();x.moveTo(200,210);x.lineTo(200+150*Math.cos(a),210+150*Math.sin(a));x.stroke();
x.fillStyle='#39ff6a';x.shadowColor='#39ff6a';x.shadowBlur=12;x.beginPath();x.arc(200,210,8,0,7);x.fill();x.shadowBlur=0;
$('emfv').textContent=(emf*10).toFixed(1)+' mG';leds('leds',Math.min(5,Math.ceil(emf)))}
$('emfSensor').onclick=function(){function on(){try{window.addEventListener('devicemotion',function(e){var g=e.accelerationIncludingGravity||{};var m=Math.abs(g.x||0)+Math.abs(g.y||0);sens=Math.min(1.5,sens+m*0.002)});$('emfs').textContent='Device motion connected (adds wobble, entertainment only).'}catch(e){}
try{if('Magnetometer' in window){var mg=new Magnetometer({frequency:10});mg.onreading=function(){sens=Math.min(2,Math.abs(Math.hypot(mg.x,mg.y,mg.z)-45)/20)};mg.start();$('emfs').textContent='Magnetometer connected (entertainment only).'}}catch(e){}}
try{if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(function(r){if(r=='granted')on();else $('emfs').textContent='Sensors not allowed, using simulation.'}).catch(function(){$('emfs').textContent='Sensors not available here, using simulation.'})}else on()}catch(e){$('emfs').textContent='Sensors not available, using simulation.'}};
if($('emfSave')) $('emfSave').onclick=function(){addEvidence('EMF spike','EMF reading '+$('emfv').textContent, $('emfs').textContent||'Simulated')};

// Spirit box
var words=['hello','leave','here','cold','help','who','behind','name','yes','no','home','dark','stay','go','mother','child','gaol','ship','fort','sea','run','light','why','soon','listen','coffee','door','stairs','friend','sorry','night','wait','under','bell','key','lost','find','hush','watch','old','glow','hunter'];
var actx=null,boxOn=false,boxT=null,noise=null,bp=null,lastCaught='';
function ac(){if(!actx){var C=window.AudioContext||window.webkitAudioContext;if(C)actx=new C()}return actx}
function startBox(){var a=ac();boxOn=true;$('boxBtn').textContent='■ Stop sweep';
if(a){try{a.resume();var len=a.sampleRate*2,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
noise=a.createBufferSource();noise.buffer=buf;noise.loop=true;bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=2;var g=a.createGain();g.gain.value=0.25;noise.connect(bp);bp.connect(g);g.connect(a.destination);noise.start()}catch(e){}}
var f=87.5;(function step(){if(!boxOn)return;f+=0.2;if(f>108)f=87.5;$('freq').textContent=f.toFixed(1)+' FM';
if(bp&&a)try{bp.frequency.setValueAtTime(300+Math.random()*3000,a.currentTime)}catch(e){}
if(Math.random()<0.08){lastCaught=words[Math.floor(Math.random()*words.length)].toUpperCase();$('word').textContent=lastCaught; if($('caught')){var row=document.createElement('div');row.textContent=new Date().toLocaleTimeString()+' · '+lastCaught;$('caught').prepend(row)}}
else if(Math.random()<0.3){$('word').textContent=''}
boxT=setTimeout(step,+$('spd').value||250)})()}
function stopBox(){boxOn=false;clearTimeout(boxT);try{noise&&noise.stop()}catch(e){}noise=null;if($('boxBtn'))$('boxBtn').textContent='▶ Start sweep'}
$('boxBtn').onclick=function(){boxOn?stopBox():startBox()};
if($('boxSave')) $('boxSave').onclick=function(){if(!lastCaught){alert('No caught word yet — start the sweep first.');return}addEvidence('Spirit box word',lastCaught,'Caught on spirit box')};

// EVP
var evpBuf=null;
function drawWave(b){var c=$('evpc'),x=c.getContext('2d');x.clearRect(0,0,400,120);if(!b)return;var d=b.getChannelData(0),s=Math.max(1,Math.floor(d.length/400));x.strokeStyle='#39ff6a';x.shadowColor='#39ff6a';x.shadowBlur=6;x.beginPath();for(var i=0;i<400;i++){var v=d[i*s]||0; if(i===0)x.moveTo(i,60-v*55); else x.lineTo(i,60-v*55)}x.stroke();x.shadowBlur=0}
function demo(){var a=ac();if(!a)return null;var n=a.sampleRate*4,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++){var t=i/a.sampleRate;d[i]=(Math.random()*2-1)*0.08+Math.sin(t*2*Math.PI*(180+40*Math.sin(t*3)))*0.25*Math.max(0,Math.sin(t*1.7))}return b}
$('rec').onclick=function(){var a=ac();if(!a){$('evps').textContent='Audio not supported.';return}a.resume();
var fail=function(){evpBuf=demo();drawWave(evpBuf);$('evps').textContent='Mic blocked here, so a demo clip was loaded. Try fullscreen for the mic.'};
try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder)return fail();
navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){var mime='';try{if(MediaRecorder.isTypeSupported('audio/webm'))mime='audio/webm'}catch(e){}
var r=mime?new MediaRecorder(st,{mimeType:mime}):new MediaRecorder(st),ch=[];r.ondataavailable=function(e){if(e.data&&e.data.size)ch.push(e.data)};
r.onstop=function(){st.getTracks().forEach(function(t){t.stop()});
var blob=new Blob(ch,{type:mime||'audio/webm'});
blob.arrayBuffer().then(function(ab){return a.decodeAudioData(ab.slice(0))}).then(function(b){evpBuf=b;drawWave(b);$('evps').textContent='Recorded. Try reversed or slowed.'}).catch(fail)};
r.start();$('evps').textContent='Recording… 10s';setTimeout(function(){try{if(r.state!='inactive')r.stop()}catch(e){}},10000)}).catch(fail)}catch(e){fail()}};
function play(mode){var a=ac();if(!a)return;if(!evpBuf){evpBuf=demo();drawWave(evpBuf)}a.resume();var b=evpBuf;
if(mode=='r'){b=a.createBuffer(evpBuf.numberOfChannels,evpBuf.length,evpBuf.sampleRate);for(var c=0;c<evpBuf.numberOfChannels;c++){var s=evpBuf.getChannelData(c),d=b.getChannelData(c);for(var i=0;i<s.length;i++)d[i]=s[s.length-1-i]}}
var src=a.createBufferSource();src.buffer=b;src.playbackRate.value=mode=='s'?0.6:1;src.connect(a.destination);src.start()}
$('pn').onclick=function(){play('n')};$('pr').onclick=function(){play('r')};$('ps').onclick=function(){play('s')};
if($('evpSave')) $('evpSave').onclick=function(){addEvidence('EVP',$('evps').textContent||'EVP session','Waveform played / recorded')};

// Ouija board
var pos={},B=$('board');function put(t,x,y){var s=document.createElement('span');s.textContent=t;s.style.left=x+'%';s.style.top=y+'%';B.appendChild(s);pos[t]=[x,y]}
put('YES',15,12);put('NO',85,12);put('GOODBYE',50,92);
'ABCDEFGHIJKLM'.split('').forEach(function(c,i){put(c,8+i*7,38+Math.abs(i-6)*-1.2+7)});'NOPQRSTUVWXYZ'.split('').forEach(function(c,i){put(c,8+i*7,58+Math.abs(i-6)*-1.2+7)});'1234567890'.split('').forEach(function(c,i){put(c,18+i*7.2,79)});
var P=$('plan');P.style.left='50%';P.style.top='50%';
var answers=['YES','NO','HELLO','COLD','HOME','WAIT','LEAVE','SOON','FRIEND','COFFEE','LISTEN','MAYBE','GLOW'],busy=false;
$('ask').onclick=function(){if(busy)return;busy=true;$('ans').textContent='';var a=answers[Math.floor(Math.random()*answers.length)];var seq=(a=='YES'||a=='NO')?[a]:a.split('');seq.push('GOODBYE');var i=0;
(function mv(){if(i>=seq.length){busy=false;return}var k=seq[i++];var p=pos[k]; if(!p){mv();return} P.style.left=p[0]+'%';P.style.top=p[1]+'%';setTimeout(function(){if(k!='GOODBYE')$('ans').textContent+=(k.length>1?k:k);mv()},900)})()};

// Radar
var ang=0,blips=[];function radar(){var c=$('radc'); if(!c) return; var x=c.getContext('2d');x.fillStyle='rgba(2,6,4,0.25)';x.fillRect(0,0,360,360);x.strokeStyle='#1c7a35';x.lineWidth=1;
for(var r=40;r<=160;r+=40){x.beginPath();x.arc(180,180,r,0,7);x.stroke()}x.beginPath();x.moveTo(20,180);x.lineTo(340,180);x.moveTo(180,20);x.lineTo(180,340);x.stroke();
ang+=0.04;x.strokeStyle='#39ff6a';x.shadowColor='#39ff6a';x.shadowBlur=8;x.lineWidth=2;x.beginPath();x.moveTo(180,180);x.lineTo(180+160*Math.cos(ang),180+160*Math.sin(ang));x.stroke();x.shadowBlur=0;
if(Math.random()<0.012){var d=30+Math.random()*125;blips.push({x:180+d*Math.cos(ang),y:180+d*Math.sin(ang),l:1});$('radw').textContent='Contact '+Math.round(d/16)+'m · '+Math.round(((ang*180/Math.PI)%360+360)%360)+'°'}
blips.forEach(function(b){b.l-=0.006;x.fillStyle='rgba(57,255,106,'+Math.max(0,b.l)+')';x.beginPath();x.arc(b.x,b.y,6,0,7);x.fill()});blips=blips.filter(function(b){return b.l>0})}

// REM pod
var temp=21,armed=false,remLvl=0;$('remBtn').onclick=function(){armed=!armed;this.textContent=armed?'Disarm REM Pod':'Arm REM Pod';$('rems').textContent=armed?'Armed. Watching for field changes…':''};
function remTick(){if(armed&&Math.random()<0.01){remLvl=1+Math.floor(Math.random()*5);temp-=1+Math.random()*4;$('rems').textContent=['','Faint disturbance','Something nearby','Strong reading!','Very strong!','MAXIMUM!'][remLvl];beep(300+remLvl*150)}
temp+=(21-temp)*0.01;remLvl=Math.max(0,remLvl-0.02);if($('temp')){$('temp').textContent=temp.toFixed(1)+' °C';$('temp').style.color=temp<18?'#7df':'#39ff6a'}if($('remleds'))leds('remleds',Math.ceil(remLvl))}
function beep(f){var a=actx;if(!a||a.state!='running')return;try{var o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=0.1;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.25)}catch(e){}}

// Night vision
var nvStream=null, nvRaf=0, nvSimOn=false;
function nvStop(){nvSimOn=false;cancelAnimationFrame(nvRaf);if(nvStream){nvStream.getTracks().forEach(function(t){t.stop()});nvStream=null}var v=$('nvVid'); if(v){v.srcObject=null;v.style.display='block'} if($('nvCanvas'))$('nvCanvas').style.display='none';document.body.classList.remove('nv');if($('nvs'))$('nvs').textContent='Camera / sim stopped.'}
function nvSimDraw(){if(!nvSimOn)return;var c=$('nvCanvas'); if(!c) return; var x=c.getContext('2d');c.width=480;c.height=360;c.style.display='block';if($('nvVid'))$('nvVid').style.display='none';
x.fillStyle='#020804';x.fillRect(0,0,480,360);
for(var i=0;i<80;i++){x.fillStyle='rgba(57,255,106,'+(0.05+Math.random()*0.25)+')';x.fillRect(Math.random()*480,Math.random()*360,2,2)}
var gx=120+Math.sin(Date.now()/900)*80, gy=160+Math.cos(Date.now()/1100)*50;
var g=x.createRadialGradient(gx,gy,4,gx,gy,70);g.addColorStop(0,'rgba(180,255,180,0.55)');g.addColorStop(1,'transparent');x.fillStyle=g;x.beginPath();x.arc(gx,gy,70,0,7);x.fill();
x.strokeStyle='#39ff6a55';for(var y=0;y<360;y+=4){x.beginPath();x.moveTo(0,y);x.lineTo(480,y);x.stroke()}
nvRaf=requestAnimationFrame(nvSimDraw)}
$('nvCam').onclick=function(){nvStop();document.body.classList.add('nv');$('nvWrap').classList.add('night');
var fail=function(){$('nvs').textContent='Camera blocked — running simulated green NV.';nvSimOn=true;nvSimDraw()};
try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return fail();
navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false}).then(function(st){
  nvStream=st; var v=$('nvVid'); v.srcObject=st; v.style.display='block'; if($('nvCanvas'))$('nvCanvas').style.display='none';
  var p=v.play(); if(p&&p.catch)p.catch(function(){});
  $('nvs').textContent='Green night-vision camera on (entertainment filter).';
}).catch(fail)}catch(e){fail()}};
$('nvSim').onclick=function(){nvStop();document.body.classList.add('nv');$('nvWrap').classList.add('night');nvSimOn=true;$('nvs').textContent='Simulated green night vision.';nvSimDraw()};
$('nvStop').onclick=nvStop;

// Thermal sim
var thLevel=12, thSpot=null;
function thDraw(){var c=$('thc'); if(!c) return; var x=c.getContext('2d'); x.fillStyle='#050808'; x.fillRect(0,0,480,320);
for(var i=0;i<18;i++){for(var j=0;j<12;j++){var v=(Math.sin(i/3+Date.now()/800)+Math.cos(j/2+Date.now()/900)+2)/4; var r=Math.floor(20+v*80),g=Math.floor(40+v*180),b=Math.floor(30+v*40); x.fillStyle='rgb('+r+','+g+','+b+')'; x.fillRect(i*28,j*28,26,26)}}
if(thSpot){var grd=x.createRadialGradient(thSpot.x,thSpot.y,4,thSpot.x,thSpot.y,60+thLevel);grd.addColorStop(0,'#fff6a0');grd.addColorStop(.4,'#39ff6a');grd.addColorStop(1,'transparent');x.fillStyle=grd;x.beginPath();x.arc(thSpot.x,thSpot.y,70,0,7);x.fill()}
if($('thNeedle'))$('thNeedle').style.width=Math.min(100,thLevel)+'%'}
$('thScan').onclick=function(){thLevel=Math.min(100,25+Math.random()*70);thSpot={x:60+Math.random()*360,y:40+Math.random()*220};var notes=['Warm bloom near the doorway.','Cold ribbon across the floor.','Soft heat spike by the window.','Room reads even — calm.'];var note=notes[Math.floor(Math.random()*notes.length)];var line=document.createElement('div');line.textContent=new Date().toLocaleTimeString()+' · Thermal · '+Math.round(thLevel)+' · '+note;$('thLog').prepend(line)};
$('thCalm').onclick=function(){thLevel=8;thSpot=null};

// Tools catalogue
var toolsReady=false, toffset=0, tlimit=40, tcurrent=null;

var activeToolApi=null;
function openActiveTool(t){
  tcurrent=t;
  var mount=$('tactive');
  if(!mount){ alert('Tool panel missing'); return; }
  if(!window.CBGhostToolEngine){
    mount.innerHTML='<b>'+t.name+'</b><br>'+t.blurb+'<p style="color:#f6a">Tool engine failed to load. Check tool-engine.js.</p>';
    return;
  }
  try{
    activeToolApi=CBGhostToolEngine.openTool(t, mount, {
      save:function(type, notes, place){
        if(typeof addEvidence==='function') addEvidence(type, notes, place||t.sku);
        else if(typeof alert==='function') alert(type+': '+notes);
      }
    });
  }catch(e){
    mount.innerHTML='<p style="color:#f6a">Could not open tool: '+(e&&e.message?e.message:e)+'</p>';
  }
}


function toolsInit(){if(!window.CBGhostTools){if($('tmeta'))$('tmeta').textContent='Tool catalogue failed to load.';return}
if(toolsReady){tload();return}toolsReady=true;
CBGhostTools.categories().forEach(function(c){var o=document.createElement('option');o.value=c.id;o.textContent=c.label;$('tcat').appendChild(o)});
if($('tgo')) $('tgo').onclick=function(){toffset=0;tload()};
if($('tprev')) $('tprev').onclick=function(){toffset=Math.max(0,toffset-tlimit);tload()};
if($('tnext')) $('tnext').onclick=function(){toffset=toffset+tlimit;tload()};
if($('tuse')) $('tuse').onclick=function(){ if(tcurrent) openActiveTool(tcurrent); };
if($('tq')) $('tq').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();toffset=0;tload()}});
tload()}
function tload(){if(!window.CBGhostTools)return;var q=($('tq').value||'').trim(), cat=$('tcat').value, res, ql=q.toLowerCase();
function withinMax(t){return t.id<=MAX}
if(cat){
  // page within MAX for this category
  var matched=[]; for(var i=0;i<MAX;i++){var t=CBGhostTools.toolAt(i); if(t.cat===cat && (!q || (t.name+' '+t.sku+' '+t.color+' '+t.catLabel).toLowerCase().indexOf(ql)>=0)) matched.push(t)}
  if(toffset>=matched.length && matched.length) toffset=Math.max(0, matched.length - (matched.length%tlimit||tlimit));
  if(toffset>=matched.length) toffset=0;
  res={items:matched.slice(toffset,toffset+tlimit), total:matched.length, offset:toffset, query:q||undefined};
} else if(!q){
  var total=Math.min(CBGhostTools.TOTAL, MAX);
  if(toffset>=total) toffset=Math.max(0, total - (total%tlimit||tlimit));
  if(toffset>=total) toffset=0;
  res=CBGhostTools.search('', tlimit, toffset);
  res.items=res.items.filter(withinMax);
  res.total=total;
} else {
  var matched=[]; for(var i=0;i<MAX;i++){var t=CBGhostTools.toolAt(i); var hay=(t.name+' '+t.catLabel+' '+t.series+' '+t.color+' '+t.sku+' '+t.rarity+' '+t.blurb).toLowerCase(); if(hay.indexOf(ql)>=0) matched.push(t)}
  if(toffset>=matched.length && matched.length) toffset=Math.max(0, matched.length - (matched.length%tlimit||tlimit));
  if(toffset>=matched.length) toffset=0;
  res={items:matched.slice(toffset,toffset+tlimit), total:matched.length, offset:toffset, query:q};
}
var list=$('tlist');list.innerHTML='';
if(!res.items.length){list.innerHTML='<div class="muted" style="padding:10px">No tools on this page. Try Prev or a different search.</div>'}
res.items.forEach(function(t){var row=document.createElement('div');row.className='tool-row';row.innerHTML='<div><b>'+t.name+'</b><br><span class="muted">'+t.sku+' · '+t.catLabel+' · '+t.rarity+' · power '+t.power+'</span><br><span class="muted">'+t.blurb+'</span></div><button type="button">Use</button>';row.onclick=function(){ openActiveTool(t); };list.appendChild(row)});
$('tmeta').textContent='Showing '+res.items.length+' of '+res.total.toLocaleString()+(res.query?' for "'+res.query+'"':'')+' · offset '+res.offset}

// Evidence log
var KEY='cb_ghost_evidence_log',mem=[];
function load(){try{var v=localStorage.getItem(KEY); if(v) return JSON.parse(v); // migrate old key
var old=localStorage.getItem('cb_ghost_log'); if(old){localStorage.setItem(KEY,old); return JSON.parse(old)} return mem}catch(e){return mem}}
function save(l){mem=l;try{localStorage.setItem(KEY,JSON.stringify(l))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function render(){var l=load();$('llist').innerHTML=l.length?l.slice().reverse().map(function(e){return '<div class="card"><b>'+esc(e.t)+'</b> · '+esc(e.p||'Unknown place')+'<br><small>'+esc(e.d)+'</small><div>'+esc(e.n)+'</div></div>'}).join(''):'<small>No evidence entries yet.</small>'}
function addEvidence(type, notes, place){var l=load();l.push({p:place||$('lp').value||'Field',t:type,n:notes||'',d:new Date().toLocaleString()});save(l);render(); try{if(window.CBGhostJournal&&CBGhostJournal.saveFromApp){CBGhostJournal.saveFromApp('Coffeebreak Ghost Hunter',type,notes||'',place||($('lp')&&$('lp').value)||'');}}catch(e){} if($('lt')){/* keep form */} }
$('ladd').onclick=function(){addEvidence($('lt').value,$('ln').value,$('lp').value);$('ln').value=''};
$('lclr').onclick=function(){if(confirm('Clear the whole evidence log?')){save([]);render()}};render();

// Places
var places=[
['Fort Scratchley, Newcastle NSW','Built from 1882 on Flagstaff Hill to defend Newcastle harbour. On 8 June 1942 its guns returned fire at a Japanese submarine shelling Newcastle, the only time an Australian land fort fired on an enemy warship. Its tunnels feature in local ghost tour stories.'],
['Newcastle East End & Christ Church Cathedral area','Newcastle began as a convict settlement in 1804. The old convict-era streets, Signal Hill and the cathedral hill are popular stops on local ghost walks.'],
['Maitland Gaol, East Maitland NSW','Opened in 1848 and operated until 1998, making it one of Australia\'s longest-running gaols. Sixteen men were hanged there. It now runs history and night ghost tours.'],
['Q Station (Quarantine Station), Manly NSW','North Head quarantine station operated from the 1830s to 1984, holding ship passengers suspected of carrying diseases such as smallpox. Hundreds are buried in its cemeteries. Now a hotel with ghost tours.'],
['Monte Cristo Homestead, Junee NSW','A late-Victorian homestead built by the Crawley family in 1884, often called Australia\'s most haunted house. Several deaths and tragedies are recorded in its history.'],
['Port Arthur Historic Site, Tasmania','A convict settlement from 1830 to 1877, now World Heritage listed. Its ghost tours have run for decades, and the Isle of the Dead holds over 1,000 burials.'],
['Old Melbourne Gaol, Victoria','Operated from 1845 to 1924, where 133 people were hanged, including Ned Kelly in 1880. Night tours run there today.'],
['Fremantle Prison, WA','Built by convicts in the 1850s and used as a prison until 1991. World Heritage listed, with torchlight tours.'],
['Old Adelaide Gaol, SA','Operated from 1841 to 1988. Executed prisoners were buried inside the walls.'],
['Boggo Road Gaol, Brisbane QLD','Brisbane\'s historic gaol, opened in 1883. The surviving 1903 cell block is heritage listed and hosts ghost tours.']];
$('plist').innerHTML=places.map(function(p){return '<div class="card"><b style="color:#39ff6a">'+p[0]+'</b><div>'+p[1]+'</div></div>'}).join('');

show('emf');
if(!window.CBGhostToolEngine) console.warn('CBGhostToolEngine missing');

(function loop(){try{if(cur=='emf')emfTick();if(cur=='radar')radar();if(cur=='thermal')thDraw();remTick()}catch(e){console.error(e)}requestAnimationFrame(loop)})();

})();
