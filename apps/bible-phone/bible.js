(function(){
var $=function(i){return document.getElementById(i)},B=window.KJV;
var LS=function(k,d){try{var v=JSON.parse(localStorage.getItem('cbb_'+k));return v==null?d:v}catch(e){return d}},SV=function(k,v){localStorage.setItem('cbb_'+k,JSON.stringify(v))};
var pos=LS('pos',{b:0,c:0}),view='read',WALLS=['wall0.jpg','wall1.jpg','wall4.jpg','wall10.jpg'];
var flat=[];B.forEach(function(b,bi){b[1].forEach(function(c,ci){flat.push([bi,ci])})});
function fi(){for(var i=0;i<flat.length;i++)if(flat[i][0]==pos.b&&flat[i][1]==pos.c)return i;return 0}
function ref(b,c,v){return B[b][0]+' '+(c+1)+(v!=null?':'+(v+1):'')}
function esc(s){return String(s).replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
// sound
var AC=null;function flipSound(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();var n=AC.sampleRate*0.35,buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);
 for(var i=0;i<n;i++){var t=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-t,2)*(0.4+0.6*Math.sin(t*Math.PI))}
 var s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();f.type='bandpass';f.frequency.value=2200;f.Q.value=0.6;g.gain.value=0.5;s.buffer=buf;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
// page curl
var busy=false;
function turn(dir,after){if(busy)return;busy=true;flipSound();var t=$('turner');t.style.transition='none';t.style.display='block';
 if(dir>0){t.style.transform='rotateY(0deg)';t.firstChild.style.opacity=0}else{t.style.transform='rotateY(-178deg)';t.firstChild.style.opacity=1}
 t.offsetWidth;t.style.transition='';
 if(dir>0){after();t.style.transform='rotateY(-178deg)';t.firstChild.style.opacity=1}else{t.style.transform='rotateY(0deg)';t.firstChild.style.opacity=0}
 setTimeout(function(){if(dir<0)after();t.style.display='none';busy=false},720)}
function go(dir){if(view!=='read'){show('read');return}var i=fi()+dir;if(i<0||i>=flat.length)return;turn(dir,function(){pos={b:flat[i][0],c:flat[i][1]};SV('pos',pos);render()})}
$('hr').onclick=function(){go(1)};$('hl').onclick=function(){go(-1)};
var sx=null;$('page').addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
$('page').addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>60)go(dx<0?1:-1)});
document.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});
// cover
$('cover').onclick=function(){this.classList.add('open');flipSound();setTimeout(function(){$('cover').style.pointerEvents='none'},1100)};
$('tClose').onclick=function(){speechSynthesis&&speechSynthesis.cancel();$('cover').style.pointerEvents='';$('cover').classList.remove('open')};
// read
function nav(){var h='<div class="row"><select id="sB">'+B.map(function(b,i){return '<option value="'+i+'"'+(i==pos.b?' selected':'')+'>'+b[0]+'</option>'}).join('')+'</select><select id="sC">'+B[pos.b][1].map(function(c,i){return '<option value="'+i+'"'+(i==pos.c?' selected':'')+'>'+(i+1)+'</option>'}).join('')+'</select><button id="sAloud">🔊 Read aloud</button></div>';return h}
function render(){view='read';var hl=LS('hl',{}),nt=LS('nt',{}),ch=B[pos.b][1][pos.c];
 var h=nav()+'<h1>'+B[pos.b][0]+'</h1><h2>Chapter '+(pos.c+1)+'</h2>';
 ch.forEach(function(v,i){var k=pos.b+'.'+pos.c+'.'+i;h+='<span class="v'+(hl[k]?' hl':'')+(nt[k]?' nt':'')+'" data-k="'+k+'"><sup>'+(i+1)+'</sup>'+esc(v)+' </span>'});
 h+='<p style="text-align:center;font-size:12px;color:#8a5a20">King James Version (public domain). Tap a verse to highlight, note or bookmark. Swipe or tap the page edge to turn.</p>';
 var p=$('page');p.innerHTML=h;p.scrollTop=0;
 $('sB').onchange=function(){pos={b:+this.value,c:0};SV('pos',pos);turn(1,render)};$('sC').onchange=function(){pos.c=+this.value;SV('pos',pos);turn(1,render)};
 $('sAloud').onclick=aloud;
 [].forEach.call(p.querySelectorAll('.v'),function(el){el.onclick=function(){verseMenu(el.dataset.k)}})}
function verseMenu(k){var a=k.split('.').map(Number),r=ref(a[0],a[1],a[2]),c=prompt(r+'\nType 1 to highlight, 2 to bookmark, 3 to add a note, or type a note directly.','1');if(c==null)return;
 if(c==='1'){var hl=LS('hl',{});if(hl[k])delete hl[k];else hl[k]=1;SV('hl',hl)}
 else if(c==='2'){var bm=LS('bm',[]);if(bm.indexOf(k)<0)bm.push(k);SV('bm',bm)}
 else{var t=c==='3'?prompt('Note for '+r):c;if(t){var nt=LS('nt',{});nt[k]=t;SV('nt',nt)}}render()}
function aloud(){if(!window.speechSynthesis){alert('Read aloud is not supported on this browser.');return}if(speechSynthesis.speaking){speechSynthesis.cancel();return}
 var u=new SpeechSynthesisUtterance(B[pos.b][0]+' chapter '+(pos.c+1)+'. '+B[pos.b][1][pos.c].join(' '));u.lang='en-AU';u.rate=0.95;speechSynthesis.speak(u)}
function page(h){$('page').innerHTML=h;$('page').scrollTop=0}
function show(v){view=v;if(v==='read')return render();({find:find,marks:marks,day:day,pray:pray,plan:plan,church:church,wall:wall})[v]()}
function find(){page('<h1>Search</h1><div class="row"><input id="q" placeholder="Word or phrase, eg faith hope"><button id="qg">Search</button></div><div id="qr"></div>');
 $('qg').onclick=function(){var q=$('q').value.trim().toLowerCase();if(q.length<2)return;var out=[],n=0;
  B.forEach(function(b,bi){b[1].forEach(function(c,ci){c.forEach(function(v,vi){if(v.toLowerCase().indexOf(q)>=0){n++;if(out.length<150)out.push('<div class="card" data-b="'+bi+'" data-c="'+ci+'"><b>'+ref(bi,ci,vi)+'</b> '+esc(v)+'</div>')}})})});
  $('qr').innerHTML='<p>'+n+' verses found'+(n>150?', showing 150':'')+'.</p>'+out.join('');
  [].forEach.call($('qr').querySelectorAll('.card'),function(e){e.onclick=function(){pos={b:+e.dataset.b,c:+e.dataset.c};SV('pos',pos);turn(1,render)}})};
 $('q').onkeydown=function(e){if(e.key==='Enter')$('qg').click()}}
function vtext(k){var a=k.split('.').map(Number);return B[a[0]][1][a[1]][a[2]]}
function marks(){var bm=LS('bm',[]),nt=LS('nt',{}),hl=LS('hl',{}),h='<h1>Bookmarks and notes</h1>';
 function item(k,extra){var a=k.split('.').map(Number);return '<div class="card" data-k="'+k+'"><b>'+ref(a[0],a[1],a[2])+'</b> '+esc(vtext(k))+(extra?'<br><i>'+esc(extra)+'</i>':'')+'</div>'}
 h+='<h2>Bookmarks</h2>'+(bm.map(function(k){return item(k)}).join('')||'<p>None yet.</p>');
 h+='<h2>Notes</h2>'+(Object.keys(nt).map(function(k){return item(k,nt[k])}).join('')||'<p>None yet.</p>');
 h+='<h2>Highlights</h2>'+(Object.keys(hl).map(function(k){return item(k)}).join('')||'<p>None yet.</p>');
 h+='<div class="row"><button id="mClr">Clear bookmarks</button></div>';page(h);
 $('mClr').onclick=function(){if(confirm('Clear all bookmarks?')){SV('bm',[]);marks()}};
 [].forEach.call($('page').querySelectorAll('.card'),function(e){e.onclick=function(){var a=e.dataset.k.split('.').map(Number);pos={b:a[0],c:a[1]};SV('pos',pos);turn(1,render)}})}
$('ribbon').onclick=function(){var bm=LS('bm',[]);if(!bm.length){marks();return}var a=bm[bm.length-1].split('.').map(Number);pos={b:a[0],c:a[1]};SV('pos',pos);turn(1,render)};
var VOD=[[18,22,0],[42,2,15],[44,7,27],[49,3,12],[23,28,10],[19,2,4],[22,39,30],[39,10,27],[45,12,3],[18,45,0],[5,0,8],[42,13,26],[57,10,0],[49,3,5],[39,5,32],[18,118,104],[22,40,9],[47,4,21],[61,3,7],[39,6,6],[19,16,21],[18,26,0],[42,15,32],[44,11,1],[58,0,4],[39,22,36],[3,5,23],[45,15,13],[18,90,0],[42,10,24],[65,20,3]];
function vodRef(){var d=Math.floor((Date.now()+11*36e5)/864e5),r=VOD[d%VOD.length];if(!B[r[0]]||!B[r[0]][1][r[1]]||!B[r[0]][1][r[1]][r[2]])r=[18,22,0];return r}
function day(){var r=vodRef(),w=WALLS[Math.floor(Date.now()/864e5)%WALLS.length];
 page('<h1>Verse of the day</h1><img class="wall" src="'+w+'" alt="Coffeebreak flash art"><div class="card" style="font-size:20px;text-align:center"><i>'+esc(B[r[0]][1][r[1]][r[2]])+'</i><br><b>'+ref(r[0],r[1],r[2])+'</b></div><div class="row"><button id="dGo">Open chapter</button><button id="dSay">🔊 Read aloud</button></div>'+
 '<div class="card"><b>Daily prayer reminder</b><div class="row"><input type="time" id="pT" value="'+LS('prayT','')+'"><button id="pSet">Set</button></div><small id="pMsg">'+(LS('prayT','')?'Reminder set for '+LS('prayT','')+' while the app is open.':'No reminder set.')+'</small></div>');
 $('dGo').onclick=function(){pos={b:r[0],c:r[1]};SV('pos',pos);turn(1,render)};
 $('dSay').onclick=function(){if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(B[r[0]][1][r[1]][r[2]]+'. '+ref(r[0],r[1],r[2]));u.lang='en-AU';speechSynthesis.speak(u)}};
 $('pSet').onclick=function(){SV('prayT',$('pT').value);$('pMsg').textContent='Reminder set for '+$('pT').value+' while the app is open.';if(window.Notification&&Notification.permission==='default')Notification.requestPermission()}}
var fired='';setInterval(function(){var t=LS('prayT',''),n=new Date(),hm=('0'+n.getHours()).slice(-2)+':'+('0'+n.getMinutes()).slice(-2),k=n.toDateString();
 if(t&&t===hm&&fired!==k){fired=k;var r=vodRef(),m='Time to pray. '+ref(r[0],r[1],r[2]);if(window.Notification&&Notification.permission==='granted')new Notification('Coffeebreak Bible Phone',{body:m,icon:'icon-192.png'});else alert(m)}},20000);
var PR={'Our Father':'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
'Hail Mary':'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
'Glory Be':'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.'};
function pray(){var st=LS('ros',{d:0,n:0}),h='<h1>Rosary and prayers</h1><img class="wall" src="wall10.jpg" alt="Coffeebreak rosary flash"><div class="card" style="text-align:center"><b>Decade '+(st.d+1)+' of 5</b><br>';
 for(var i=0;i<10;i++)h+='<span class="bead'+(i<st.n?' on':'')+'"></span>';
 h+='<br>'+st.n+' of 10 Hail Marys<div class="row"><button id="rB" class="b2">Next bead</button><button id="rR">Reset</button></div><small>Each decade: Our Father, 10 Hail Marys, Glory Be. Total today: '+LS('rosTot',0)+'</small></div>';
 Object.keys(PR).forEach(function(k){h+='<div class="card"><b>'+k+'</b><br>'+PR[k]+'<br><button data-p="'+k+'">🔊 Pray aloud</button></div>'});page(h);
 $('rB').onclick=function(){st.n++;SV('rosTot',LS('rosTot',0)+1);if(st.n>=10){st.n=0;st.d=(st.d+1)%5;flipSound()}SV('ros',st);pray()};$('rR').onclick=function(){SV('ros',{d:0,n:0});pray()};
 [].forEach.call($('page').querySelectorAll('[data-p]'),function(b){b.onclick=function(){if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(PR[b.dataset.p]);u.lang='en-AU';u.rate=0.9;speechSynthesis.speak(u)}}})}
function planDay(d){var per=flat.length/365,a=Math.floor(d*per),b=Math.floor((d+1)*per);return flat.slice(a,b)}
function plan(){var done=LS('plan',{}),start=LS('planStart',0);if(!start){start=Date.now();SV('planStart',start)}
 var today=Math.min(364,Math.floor((Date.now()-start)/864e5)),n=Object.keys(done).length,h='<h1>Bible in a year</h1><h2>Day '+(today+1)+' of 365 · '+n+' days done</h2>';
 for(var d=Math.max(0,today-3);d<Math.min(365,today+7);d++){var cs=planDay(d);h+='<div class="card"'+(d===today?' style="border:2px solid #8a0f1f"':'')+'><label><input type="checkbox" data-d="'+d+'"'+(done[d]?' checked':'')+'> <b>Day '+(d+1)+'</b></label> '+cs.map(function(x){return '<a href="#" data-b="'+x[0]+'" data-c="'+x[1]+'">'+ref(x[0],x[1])+'</a>'}).join(', ')+'</div>'}
 h+='<div class="row"><button id="pRe">Restart plan from today</button></div>';page(h);
 [].forEach.call($('page').querySelectorAll('input[data-d]'),function(c){c.onchange=function(){var dn=LS('plan',{});if(c.checked)dn[c.dataset.d]=1;else delete dn[c.dataset.d];SV('plan',dn)}});
 [].forEach.call($('page').querySelectorAll('a[data-b]'),function(a){a.onclick=function(e){e.preventDefault();pos={b:+a.dataset.b,c:+a.dataset.c};SV('pos',pos);turn(1,render)}});
 $('pRe').onclick=function(){if(confirm('Restart the plan from today?')){SV('planStart',Date.now());SV('plan',{});plan()}}}
function openRadio(room){$('rFrame').src='radio.html'+(room?'#room='+room:'');$('radio').style.display='block'}
$('rClose').onclick=function(){$('radio').style.display='none';$('rFrame').src='about:blank'};
function church(){page('<h1>Church and prayer group</h1><img class="wall" src="wall4.jpg" alt="Coffeebreak praise flash"><div class="card">Push-to-talk over Wi-Fi with your church or prayer group. Everyone types the same group code, then holds to talk.<div class="row"><input id="gC" placeholder="Group code, eg stmarys" value="'+esc(LS('grp',''))+'"><button id="gGo" class="b2">Join channel</button></div><small>Free, no SIM, works on any Wi-Fi.</small></div>');
 $('gGo').onclick=function(){var c=$('gC').value.toLowerCase().replace(/[^a-z0-9]/g,'');if(!c)return;SV('grp',c);openRadio('church'+c)}}
function wall(){var cur=LS('wall','');page('<h1>Wallpapers</h1><p style="text-align:center">Tap one to set it on the cover.</p>'+WALLS.map(function(w){return '<img class="wall" src="'+w+'" data-w="'+w+'" style="margin:6px 0'+(w===cur?';outline:4px solid #8a0f1f':'')+'">'}).join('')+'<div class="row"><button id="wN">Plain leather</button></div>');
 [].forEach.call($('page').querySelectorAll('[data-w]'),function(i){i.onclick=function(){SV('wall',i.dataset.w);setWall();wall()}});$('wN').onclick=function(){SV('wall','');setWall();wall()}}
function setWall(){var w=LS('wall',''),c=$('cover');c.style.backgroundImage=w?'linear-gradient(#3b1f12cc,#2a1208dd),url('+w+')':'';c.style.backgroundSize='cover';c.style.backgroundPosition='center'}
function tb(id,v){$(id).onclick=function(){if(v==='read')turn(1,render);else turn(1,function(){show(v)})}}
tb('tRead','read');tb('tFind','find');tb('tMarks','marks');tb('tDay','day');tb('tPray','pray');tb('tPlan','plan');tb('tChurch','church');tb('tWall','wall');
$('tPhone').onclick=function(){openRadio('')};
setWall();render();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});
})();
