(function(){
const $=s=>document.querySelector(s),G=CBG;
let style='Country',cur=null,timer=null,spoken=0,playing=false,sched=null;
const S=CBA.store;
G.STYLES.forEach(s=>{const b=document.createElement('button');b.className='chip'+(s===style?' on':'');b.textContent=s;b.dataset.s=s;b.type='button';b.onclick=()=>{style=s;document.querySelectorAll('#styles .chip').forEach(x=>x.classList.toggle('on',x.dataset.s===s));S.set('sm_style',s);};$('#styles').appendChild(b);});
G.TEMPOS.forEach(t=>$('#tempo').add(new Option(t,t,false,t==='Medium')));G.MOODS.forEach(m=>$('#mood').add(new Option(m,m)));
Object.keys(G.SAMPLES).forEach(k=>$('#pick').add(new Option(k,k)));
$('#pick').onchange=e=>{const k=e.target.value;if(!k)return;$('#lyrics').value=G.SAMPLES[k];$('#title').value=k.replace(/ \(original\)/,'');if(/Lullaby|Rock a bye|Twinkle/.test(k)){setStyle('Lullaby');}if(/Jingle/.test(k))setStyle('Christmas');};
function setStyle(s){document.querySelector('#styles .chip[data-s="'+s+'"]').click();}
$('#write').onclick=()=>{const t=$('#about').value.trim()||'coffee';$('#lyrics').value=G.writeLyrics(t,style,$('#title').value);if(!$('#title').value)$('#title').value=t.charAt(0).toUpperCase()+t.slice(1);stopAll();render();msg('Lyrics written. Change anything you like, then press Play.');};
/* voices */
let voices=[];function loadVoices(){if(!('speechSynthesis' in window))return;voices=speechSynthesis.getVoices();const sel=$('#voice'),keep=sel.value;sel.innerHTML='';sel.add(new Option(voices.length?'Phone voice (default)':'Melody only',''));voices.forEach((v,i)=>sel.add(new Option(v.name+' ('+v.lang+')',i)));sel.value=keep;
 $('#vnote').textContent=voices.length?'Using the voice on your phone. No data leaves your phone.':'No phone voice found on this device, so the melody plays on its own.';}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}else{$('#vnote').textContent='This browser has no phone voice, so the melody plays on its own.';$('#oVoice').checked=false;$('#oVoice').disabled=true;}
function msg(t){$('#msg').textContent=t;}
function project(){const lyrics=$('#lyrics').value;if(!lyrics.trim()){msg('Type some lyrics, pick some, or tap Write lyrics for me.');return null;}
 return G.build({title:$('#title').value,lyrics,style,mood:$('#mood').value,tempo:$('#tempo').value});}
function render(){const secs=G.parse($('#lyrics').value);const st=$('#stage');st.innerHTML='';let i=0;secs.forEach(s=>{const h=document.createElement('div');h.className='hd';h.textContent=s.name;st.appendChild(h);s.lines.forEach(l=>{const d=document.createElement('div');d.className='ln';d.dataset.i=i++;d.textContent=l;st.appendChild(d);});});}
$('#lyrics').addEventListener('input',()=>{if(!playing)render();});
function stopAll(){playing=false;clearInterval(timer);if(sched){sched.stop();sched=null;}
 if('speechSynthesis' in window)speechSynthesis.cancel();document.querySelectorAll('#stage .ln.cur').forEach(x=>x.classList.remove('cur'));$('#prog i').style.width='0';$('#play').textContent='Play my song';}
function say(text,rate,pitch){if(!('speechSynthesis' in window)||!$('#oVoice').checked)return;const u=new SpeechSynthesisUtterance(text);u.rate=rate;u.pitch=pitch;const v=$('#voice').value;if(v!==''&&voices[+v])u.voice=voices[+v];u.volume=1;speechSynthesis.speak(u);}
function play(){stopAll();const p=project();if(!p)return;cur=p;render();const c=CBA.resume();
 const q=JSON.parse(JSON.stringify(p));q.tracks.forEach(t=>{if(t.name==='Melody')t.mute=!$('#oMel').checked;else t.mute=!$('#oBack').checked;});
 const t0=c.currentTime+.2;sched=CBA.schedule(c,CBA.out.in,q,t0);playing=true;spoken=0;$('#play').textContent='Playing';
 const m=p.meta,ss=CBA.stepSec(p),barSec=ss*16;const lines=document.querySelectorAll('#stage .ln');
 $('#info').textContent=m.style+', '+p.bpm+' beats a minute, key of '+CBA.NN[((m.key%12)+12)%12]+(m.mode==='min'?' minor':' major')+', '+Math.round(p.bars*barSec)+' seconds';
 timer=setInterval(()=>{const now=c.currentTime-t0;$('#prog i').style.width=Math.min(100,Math.max(0,now/(p.bars*barSec)*100))+'%';
  while(spoken<m.lines.length&&now>=m.lines[spoken].bar*barSec-.05){const L=m.lines[spoken];lines.forEach(x=>x.classList.toggle('cur',+x.dataset.i===spoken));const cu=lines[spoken];if(cu&&cu.scrollIntoView)cu.scrollIntoView({block:'nearest'});
   const rate=Math.max(.6,Math.min(1.7,L.n/(barSec*L.bars*.85*3.6)));say(L.text,rate,m.pitch);spoken++;}
  if(now>p.bars*barSec+1.2){stopAll();}},40);}
$('#play').onclick=()=>{if(playing){stopAll();return;}play();};
$('#stop').onclick=stopAll;
$('#wav').onclick=async()=>{const p=project();if(!p)return;msg('Making your WAV file...');try{const q=JSON.parse(JSON.stringify(p));q.tracks.forEach(t=>{if(t.name==='Melody')t.mute=!$('#oMel').checked;else t.mute=!$('#oBack').checked;});const b=await CBA.render(q);CBA.download(CBA.wav(b),(($('#title').value||'song').replace(/[^\w ]+/g,'').trim()||'song')+'.wav');msg('WAV saved. It has the music only, not the phone voice.');}catch(e){msg('Could not make the WAV file on this device.');}};
$('#share').onclick=async()=>{const t=($('#title').value||'My song')+'\n\n'+$('#lyrics').value+'\n\nMade with Coffeebreak Song Maker';try{if(navigator.share){await navigator.share({title:$('#title').value||'My song',text:t});}else{await navigator.clipboard.writeText(t);msg('Lyrics copied.');}}catch(e){msg('Sharing was cancelled.');}};
/* saved songs */
function songs(){return S.get('cb_songs',[]);}
function drawMine(){const a=songs(),box=$('#mine');box.innerHTML='';if(!a.length){box.innerHTML='<span class="note">Nothing saved yet.</span>';return;}
 a.forEach((s,i)=>{const r=document.createElement('div');r.className='songrow';r.innerHTML='<b></b><button data-a="open">Open</button><button class="dark" data-a="del">Delete</button>';r.querySelector('b').textContent=s.title+' ('+s.style+')';
  r.querySelector('[data-a=open]').onclick=()=>{$('#title').value=s.title;$('#lyrics').value=s.lyrics;$('#mood').value=s.mood;$('#tempo').value=s.tempo;setStyle(s.style);stopAll();render();msg('Opened '+s.title+'.');window.scrollTo(0,0);};
  r.querySelector('[data-a=del]').onclick=()=>{const b=songs();b.splice(i,1);S.set('cb_songs',b);drawMine();};box.appendChild(r);});}
$('#save').onclick=()=>{if(!$('#lyrics').value.trim()){msg('Nothing to save yet.');return;}const a=songs();const t=$('#title').value.trim()||'My song';const o={title:t,lyrics:$('#lyrics').value,style,mood:$('#mood').value,tempo:$('#tempo').value,saved:Date.now()};const k=a.findIndex(x=>x.title===t);if(k>=0)a[k]=o;else a.unshift(o);
 msg(S.set('cb_songs',a)?'Saved on this phone.':'Could not save on this device.');drawMine();};
const st=S.get('sm_style','Country');setStyle(st);drawMine();render();
window.cbSM={build:project};
})();
