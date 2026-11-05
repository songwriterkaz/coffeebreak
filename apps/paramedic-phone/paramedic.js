(function(){
var $=function(i){return document.getElementById(i)};
var LS=function(k,d){try{var v=JSON.parse(localStorage.getItem('cbm_'+k));return v==null?d:v}catch(e){return d}},SV=function(k,v){localStorage.setItem('cbm_'+k,JSON.stringify(v))};
function esc(s){return String(s).replace(/[&<>"]/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
var G=[
['DRSABCD (start here)',['D - Danger: check for danger to you, bystanders and the person. Only go in if it is safe.','R - Response: talk and gently squeeze their shoulders. Can they open their eyes, obey a command, answer you?','S - Send for help: call 000 (or 112 on a mobile). Put the phone on speaker.','A - Airway: open the mouth. If there is something in it, roll them onto their side and clear it.','B - Breathing: tilt the head back, lift the chin. Look, listen and feel for normal breathing for 10 seconds.','C - CPR: if they are not breathing normally, start CPR (see CPR).','D - Defibrillation: send someone for an AED (defibrillator). Turn it on and follow its voice.','If they are breathing: put them on their side (recovery position) and keep watching them.']],
['CPR',['Lay them on their back on a firm surface.','Hands in the centre of the chest, on the lower half of the breastbone.','Push down hard, about one third of the chest depth, 30 times at 100 to 120 a minute. Use the metronome above.','Then give 2 breaths: tilt head, lift chin, pinch nose, seal your mouth over theirs, blow until the chest rises.','Keep going 30 pushes to 2 breaths. If you cannot give breaths, just keep pushing.','Do not stop until they start breathing, an AED tells you to, paramedics take over, or you are exhausted. Swap with someone every 2 minutes if you can.']],
['Choking',['If they can cough, tell them to keep coughing hard.','If the cough is not working: call 000.','Give up to 5 firm back blows between the shoulder blades with the heel of your hand.','Check if it has cleared. If not, give up to 5 chest thrusts (like CPR pushes but slower and sharper).','Keep swapping 5 back blows and 5 chest thrusts until it clears or help arrives.','If they become unconscious, start CPR.']],
['Bleeding',['Put on gloves if you have them.','Press firmly on the wound with a pad or clean cloth. Keep pressing.','Bandage the pad on firmly. If blood comes through, add another pad on top, do not remove the first.','Raise the injured part if you can, and keep them lying down and still.','Call 000 for heavy bleeding. For life-threatening bleeding from an arm or leg, a tourniquet may be used if you are trained.','Do not pull out anything stuck in the wound. Pad around it.']],
['Burns',['Cool the burn under cool running water for 20 minutes. Do this even if some time has passed (up to 3 hours).','Remove rings, watches and tight clothing near the burn, unless stuck.','Do not use ice, butter, creams or toothpaste.','Cover loosely with a non-stick dressing or cling wrap.','Call 000 if the burn is large, deep, on the face, hands, groin or airway, or from electricity or chemicals. Keep them warm.']],
['Snake bite (pressure immobilisation)',['Call 000. Keep the person still and calm. Lie them down.','Do not wash the bite, do not cut it, do not suck it, no tourniquet.','Put a broad elastic pressure bandage over the bite, firm like a sprained ankle bandage.','Then bandage the whole limb, starting at the fingers or toes and working up as high as you can.','Splint the limb so it cannot bend. Keep them completely still until help arrives.','Mark the bite site on the bandage with a pen. The same method is used for funnel-web spider bites.']],
['Asthma (4 x 4 x 4)',['Sit them upright and stay calm with them.','Give 4 separate puffs of a blue/grey reliever puffer, through a spacer if available. 1 puff, then 4 breaths, repeat 4 times.','Wait 4 minutes.','If no better, give 4 more puffs.','If still no better, call 000 and keep giving 4 puffs every 4 minutes until help arrives.','Call 000 straight away if they cannot talk, are going blue, or are getting worse quickly.']],
['Anaphylaxis (severe allergy)',['Signs: swelling of face, lips or tongue, hard to breathe, wheeze, throat tightness, pale and floppy, collapse.','Lay them flat. Do not let them stand or walk. If breathing is hard, let them sit with legs out.','Give an adrenaline autoinjector (EpiPen or Anapen) into the outer thigh. Note the time.','Call 000.','If no better after 5 minutes, give another adrenaline autoinjector if there is one.','If unsure whether it is asthma or anaphylaxis, give adrenaline first, then asthma reliever.','Start CPR if they stop breathing normally.']],
['Seizures',['Stay calm. Time the seizure.','Protect them from injury: move hard or sharp things away, cushion the head.','Do not hold them down. Do not put anything in their mouth.','When the jerking stops, roll them onto their side and check breathing.','Call 000 if it lasts over 5 minutes, another one starts, it is their first seizure, they are injured, in water, pregnant or have diabetes, or they do not wake up.']],
['Heat stroke',['Signs: very hot skin, confusion, headache, vomiting, collapse, may stop sweating.','Call 000.','Move them to shade or a cool place. Lie them down and loosen clothes.','Cool them fast: wet the skin and fan them. Cold packs to the neck, armpits and groin.','If they are awake and can swallow, give small sips of cool water.']],
['Low blood sugar (hypo)',['Signs: shaky, sweaty, pale, confused, hungry, acting strangely.','If they can swallow: give 15g of fast sugar, eg 150ml juice or soft drink (not diet) or 6 jelly beans.','Wait 15 minutes and recheck. Repeat if still low, then give a snack.','If they are drowsy or unconscious: nothing by mouth, roll them on their side, call 000.']]];
var h='';G.forEach(function(g,i){h+='<details class="fa"><summary>'+g[0]+'</summary><ol>'+g[1].map(function(s){return '<li>'+s+'</li>'}).join('')+'</ol></details>'});$('pGuide').innerHTML=h;
// metronome
var AC=null,met=null,cnt=0;
function beep(f,d){AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(0.4,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.start();o.stop(AC.currentTime+d)}
function bpm(){return +$('pBpm').value}
$('pBpm').oninput=function(){$('pBpmV').textContent=bpm()+' per minute';if(met){stopM();startM()}};
function startM(){cnt=0;met=setInterval(function(){cnt++;beep(cnt===30?1320:880,0.07);$('pCount').textContent=cnt;$('pCount').style.transform='scale(1.15)';setTimeout(function(){$('pCount').style.transform=''},80);
 if(cnt>=30){clearInterval(met);$('pCount').textContent='2 breaths';setTimeout(function(){if(met){startM()}},4000)}},60000/bpm());$('pMet').textContent='Stop CPR beat';$('pMet').classList.add('on')}
function stopM(){clearInterval(met);met=null;$('pMet').textContent='Start CPR beat';$('pMet').classList.remove('on');$('pCount').textContent='0'}
$('pMet').onclick=function(){met?stopM():startM()};
// temperature
var T=LS('tset',{u:'C'});function cv(c){return T.u==='F'?(c*9/5+32).toFixed(1):(+c).toFixed(1)}
function band(c){return c<35?['Low, keep warm','#3a7bff']:c<37.5?['Normal range','#2bb24c']:c<38?['Slightly raised','#e0b000']:c<39.5?['Fever','#ff8a00']:['High fever','#e01010']}
function trender(){var L=LS('temps',[]);$('tUnit').textContent='°'+T.u;$('tIn').placeholder='Temperature in °'+T.u;
 $('tLog').innerHTML=L.slice(-20).reverse().map(function(e){var b=band(e.c);return '<div style="border-left:6px solid '+b[1]+';padding:2px 6px;margin:2px 0">'+new Date(e.ts).toLocaleString('en-AU',{dateStyle:'short',timeStyle:'short'})+' · <b>'+cv(e.c)+' °'+T.u+'</b> '+b[0]+(e.n?' · '+esc(e.n):'')+'</div>'}).join('')||'No temperatures yet.';
 var c=$('tChart'),x=c.getContext('2d'),W=c.width,H=c.height,d=L.slice(-30),lo=34,hi=42,y=function(v){return H-(Math.max(lo,Math.min(hi,v))-lo)/(hi-lo)*H};x.clearRect(0,0,W,H);
 [[34,35,'#3a7bff33'],[35,37.5,'#2bb24c22'],[37.5,38,'#e0b00033'],[38,39.5,'#ff8a0033'],[39.5,42,'#e0101033']].forEach(function(b){x.fillStyle=b[2];x.fillRect(0,y(b[1]),W,y(b[0])-y(b[1]))});
 if(d.length){x.strokeStyle='#b00020';x.lineWidth=3;x.beginPath();d.forEach(function(e,i){var px=d.length<2?W/2:5+i*(W-10)/(d.length-1);i?x.lineTo(px,y(e.c)):x.moveTo(px,y(e.c))});x.stroke()}}
function addT(v,n){v=parseFloat(v);if(!v)return;var c=T.u==='F'?(v-32)*5/9:v;if(c<25||c>45){alert('That does not look like a body temperature. Check the number.');return}var L=LS('temps',[]);L.push({ts:Date.now(),c:+c.toFixed(2),n:n});SV('temps',L);trender()}
$('tAdd').onclick=function(){addT($('tIn').value,$('tNote').value.trim());$('tIn').value='';$('tNote').value=''};
$('tUnitB').onclick=function(){T.u=T.u==='C'?'F':'C';SV('tset',T);trender()};
$('tCsv').onclick=function(){var s='time,temp_c,temp_f,note\n';LS('temps',[]).forEach(function(e){s+=new Date(e.ts).toISOString()+','+e.c+','+(e.c*9/5+32).toFixed(1)+',"'+String(e.n||'').replace(/"/g,"'")+'"\n'});dl(s,'coffeebreak-temperatures.csv')};
function dl(s,f){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/plain'}));a.download=f;a.click()}
var cam=null,worker=null;
function load(src){return new Promise(function(r,j){var s=document.createElement('script');s.src=src;s.onload=r;s.onerror=function(){j(new Error('offline'))};document.head.appendChild(s)})}
$('tCam').onclick=function(){navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(st){cam=st;var v=$('tVid');v.srcObject=st;v.hidden=false;v.play();$('tSnap').hidden=false;$('tMsg').textContent='Fill the frame with the temperature on the screen, then tap Read.'}).catch(function(e){$('tMsg').textContent='Camera not available: '+e.message})};
$('tSnap').onclick=function(){var v=$('tVid'),c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0,c.width,c.height);cam&&cam.getTracks().forEach(function(t){t.stop()});v.hidden=true;this.hidden=true;$('tMsg').textContent='Reading the numbers...';
 (worker?Promise.resolve():load('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js').then(function(){return Tesseract.createWorker('eng')}).then(function(w){worker=w;return w.setParameters({tessedit_char_whitelist:'0123456789.,'})}))
 .then(function(){return worker.recognize(c)}).then(function(r){var n=(r.data.text.replace(/,/g,'.').match(/\d{2,3}(\.\d)?/g)||[]).map(Number).filter(function(x){return(x>=30&&x<=45)||(x>=86&&x<=113)})[0];
  if(n==null){$('tMsg').textContent='Could not read a temperature. Type it in.';return}if(n>=86&&T.u==='C'){T.u='F';SV('tset',T);trender()}else if(n<=45&&T.u==='F'){T.u='C';SV('tset',T);trender()}
  $('tIn').value=n;$('tMsg').textContent='Read '+n+' °'+T.u+'. Check it matches the screen, then tap Log.'}).catch(function(){$('tMsg').textContent='Reading needs internet the first time. Type it in.'})};
// medical ID
var F=['name','dob','blood','allergies','meds','conditions','contact1','contact2','doctor'];
function mid(){var M=LS('mid',{});F.forEach(function(f){$('m_'+f).value=M[f]||''});$('midCard').innerHTML='<b>'+esc(M.name||'Name not set')+'</b>'+(M.dob?' · born '+esc(M.dob):'')+(M.blood?' · blood '+esc(M.blood):'')+'<br><b>Allergies:</b> '+esc(M.allergies||'none listed')+'<br><b>Medicines:</b> '+esc(M.meds||'none listed')+'<br><b>Conditions:</b> '+esc(M.conditions||'none listed')+'<br><b>Emergency contacts:</b> '+esc(M.contact1||'')+(M.contact2?' · '+esc(M.contact2):'')+(M.doctor?'<br><b>Doctor:</b> '+esc(M.doctor):'')}
$('midSave').onclick=function(){var M={};F.forEach(function(f){M[f]=$('m_'+f).value.trim()});SV('mid',M);mid()};
// torch
var tor=null;
$('pTorch').onclick=function(){var b=this;if(tor){tor.getTracks().forEach(function(t){t.stop()});tor=null;b.textContent='Torch on';$('pWhite').hidden=true;return}
 navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(st){var tr=st.getVideoTracks()[0],cap=tr.getCapabilities?tr.getCapabilities():{};
  if(cap.torch){tr.applyConstraints({advanced:[{torch:true}]});tor=st;b.textContent='Torch off'}else{st.getTracks().forEach(function(t){t.stop()});$('pWhite').hidden=false}}).catch(function(){$('pWhite').hidden=false})};
$('pWhite').onclick=function(){this.hidden=true};
// checklist
var K=['Gloves (2 pairs)','CPR face shield','Snake bite bandages (2)','Triangular bandage','Non-stick dressings','Adhesive strips','Wound pads','Antiseptic','Cold pack','Scissors and tweezers','Emergency blanket','Asthma reliever and spacer (if prescribed)','Adrenaline autoinjector (if prescribed)','Torch / phone charged','Pen and notepad'];
function kit(){var D=LS('kit',{});$('kitL').innerHTML=K.map(function(k,i){return '<label style="display:block"><input type="checkbox" data-i="'+i+'"'+(D[i]?' checked':'')+'> '+k+'</label>'}).join('');
 [].forEach.call($('kitL').querySelectorAll('input'),function(c){c.onchange=function(){var D=LS('kit',{});D[c.dataset.i]=c.checked;SV('kit',D)}})}
$('kitR').onclick=function(){SV('kit',{});kit()};
// incident
var I=LS('inc',null),tick=null;
function fmt(ms){var s=Math.floor(ms/1000);return ('0'+Math.floor(s/60)).slice(-2)+':'+('0'+s%60).slice(-2)}
function irender(){$('iTime').textContent=I?fmt(Date.now()-I.start):'00:00';$('iStart').textContent=I?'End incident':'Start incident';
 $('iNotes').innerHTML=I?I.notes.map(function(n){return '<div>'+fmt(n.t)+' · '+esc(n.x)+'</div>'}).join(''):'Start the timer, then add notes like "CPR started" or "Ambulance arrived".'}
$('iStart').onclick=function(){if(I){var s='Coffeebreak incident notes\nStarted: '+new Date(I.start).toLocaleString('en-AU')+'\n'+I.notes.map(function(n){return fmt(n.t)+' '+n.x}).join('\n');var H=LS('incH',[]);H.push(s);SV('incH',H);if(confirm('Incident ended. Download the notes?'))dl(s,'coffeebreak-incident.txt');I=null;SV('inc',null);clearInterval(tick)}else{I={start:Date.now(),notes:[]};SV('inc',I);tick=setInterval(irender,1000)}irender()};
function note(x){if(!I){I={start:Date.now(),notes:[]};tick=setInterval(irender,1000)}I.notes.push({t:Date.now()-I.start,x:x});SV('inc',I);irender()}
$('iAdd').onclick=function(){var x=$('iIn').value.trim();if(x){note(x);$('iIn').value=''}};
[].forEach.call(document.querySelectorAll('[data-q]'),function(b){b.onclick=function(){note(b.dataset.q)}});
if(I)tick=setInterval(irender,1000);
// tabs
function show(d){$('medUI').hidden=!d;$('mMed').classList.toggle('on',d);if(d){$('radioUI').hidden=true;$('ghostUI').hidden=true;$('mRadio').classList.remove('on');$('mGhost').classList.remove('on')}}
$('mMed').onclick=function(){show(true)};$('mRadio').addEventListener('click',function(){show(false)});$('mGhost').addEventListener('click',function(){show(false)});
trender();mid();kit();irender();show(true);
})();
