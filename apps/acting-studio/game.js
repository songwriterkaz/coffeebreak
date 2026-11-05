const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Acting Studio (template-based script writer; no cloud AI) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const st=document.createElement('style');st.textContent=`#as{flex:1;width:100%;max-width:1100px;overflow:auto;padding:8px 12px 90px;box-sizing:border-box;font-family:Georgia,serif}
#as h2{color:#e8a0b0;margin:6px 0}#as .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}#as .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:12px;padding:10px;margin:8px 0}
#as select,#as input,#as textarea{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px;font:14px Georgia}#as .note{font-size:12px;color:#d9b8c0}
#as .ln{padding:6px 8px;margin:3px 0;border-radius:8px}#as .ln.me{background:#3a1424;border-left:4px solid #e8a0b0}#as .ln.cur{outline:2px solid #ffcf6a}#as .dir{font-style:italic;color:#c9a0d8}
#as .tp{font-size:30px;line-height:1.4;text-align:center;padding:20px;min-height:160px;background:#000;border-radius:12px}#as .who{color:#e8a0b0;font-size:16px}
#as .hid{background:#5a2a3a;color:transparent;border-radius:4px;cursor:pointer}#as video{width:100%;max-width:560px;border-radius:12px;background:#000}#as .ed{width:100%;box-sizing:border-box}`;
document.head.appendChild(st);const R=document.createElement('div');R.id='as';c.parentNode.insertBefore(R,c.nextSibling);
document.addEventListener('pointerdown',()=>startMusic(),{once:true});
function rng(s){s=(s>>>0)||1;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,s=(s^s+Math.imul(s^s>>>7,61|s))^s,((s^s>>>14)>>>0)/4294967296))}
function hash(str){let h=2166136261;for(const ch of String(str))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
const pick=(r,a)=>a[Math.floor(r()*a.length)];const esc=s=>String(s).replace(/[&<>"]/g,z=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[z]));
const NAMES=['Maggie','Dean','Rosa','Theo','Lena','Marcus','Ivy','Jonah','Delphine','Ray','Sadie','Cole','Nina','Felix','June','Arlo','Bree','Victor','Pearl','Wes'];
const GENRES={
drama:{set:['a hospital corridor at 3 a.m.','a kitchen after the funeral','a rainy bus stop','a farmhouse porch'],conf:['a secret kept for years','a choice that split the family','a letter that was never sent'],
 lines:{open:['You came back. I didn\'t think you would.','We need to talk about what happened.','Sit down. Please.'],push:['You don\'t get to decide that for me.','I carried this alone for {n} years.','Look at me when I\'m talking to you.','Why didn\'t you tell me about {c}?'],
 turn:['Because I was scared of losing you.','I thought I was protecting you.','Maybe I was wrong. Maybe I\'m still wrong.'],end:['So where does that leave us?','We start again. Slowly.','I\'m not ready to forgive you. But I\'m here.']},dir:['(quietly)','(voice breaking)','(turns away)','(long pause)','(steps closer)']},
comedy:{set:['a cooking class gone wrong','a wedding rehearsal','a tiny caravan on holiday','a talent show backstage'],conf:['a goat that got loose','the wrong cake being delivered','a lie about being a professional dancer'],
 lines:{open:['Okay, nobody panic.','Why is everything sticky?','Before you say anything, I can explain.'],push:['You told them WHAT?','That is not how you spell {c}.','I specifically said NO surprises.','Is that… my good shoe?'],
 turn:['In my defence, it seemed like a great idea at the time.','Technically, that\'s not a lie. It\'s a creative truth.','Fine. FINE. I can\'t dance.'],end:['We are never speaking of this again.','Same time next week?','Somebody please find the goat.']},dir:['(beat)','(deadpan)','(hides something behind back)','(trips over a chair)','(whispers loudly)']},
romance:{set:['a lantern-lit pier','a bookshop at closing time','a train platform in the snow','a rooftop garden'],conf:['a goodbye neither wants to say','a confession on the last night','a second chance after years apart'],
 lines:{open:['I almost didn\'t come tonight.','You still read with your glasses on your head.','Is this seat taken?'],push:['Why do you always leave right when it matters?','I kept every one of your letters.','Tell me to stay and I\'ll stay.','Was it ever real, {c}?'],
 turn:['It was the realest thing I\'ve ever known.','I was afraid you\'d say no.','I\'m not leaving. Not this time.'],end:['Then stay. Here. With me.','Ask me again tomorrow.','(they laugh) Okay. Okay.']},dir:['(softly)','(smiles despite themselves)','(reaches for their hand)','(looks at the floor)','(a slow breath)']},
horror:{set:['an abandoned summer camp','a lighthouse with no keeper','a basement after a storm','a motel with one light on'],conf:['a voice on an old tape','footsteps that stop when you do','a door that was locked yesterday'],
 lines:{open:['Did you hear that?','The power\'s been out since we got here.','Don\'t go down there alone.'],push:['That door was closed. I closed it.','Who else knows we\'re here?','Stop joking. This isn\'t funny anymore.','The tape said our names. Both of them. And {c}.'],
 turn:['I don\'t think we\'re alone.','Whatever it is, it wants us to stay.','Run. Don\'t look back. Just run.'],end:['(silence, then a knock)','It\'s over. Isn\'t it?','Keep the lights on. All night.']},dir:['(freezes)','(whispering)','(backs away slowly)','(a flicker of light)','(listens)']},
soap:{set:['a glamorous engagement party','a hospital waiting room','a family vineyard','a penthouse at midnight'],conf:['a long-lost twin','a stolen inheritance','a paternity secret'],
 lines:{open:['How dare you show your face here.','I have something to say, and everyone\'s going to hear it.','Darling, you look… surprised.'],push:['You stole the vineyard right out from under me!','He\'s not who you think he is.','I know about {c}. I know everything.','Put down the champagne. Now.'],
 turn:['I\'m your sister. Your twin.','The will was a fake. I wrote it myself.','I did it all for this family!'],end:['(slaps the table) This isn\'t over.','Then let the lawyers decide.','(dramatic music swells)']},dir:['(gasps)','(throws drink)','(turns dramatically)','(a single tear)','(clutches pearls)']},
crime:{set:['an interrogation room','a rain-soaked alley','a pawn shop after hours','a precinct break room'],conf:['a missing diamond','an alibi that doesn\'t add up','a witness who saw too much'],
 lines:{open:['Take a seat. This won\'t take long.','You were seen near the docks at midnight.','Coffee? You\'ll want it.'],push:['Your story changed three times.','Where were you between ten and eleven?','We found {c} in your car.','Somebody\'s lying, and it isn\'t the camera.'],
 turn:['Okay. I was there. But I didn\'t do it.','You\'re asking the wrong questions, detective.','Check the security footage again. Second camera.'],end:['Don\'t leave town.','You\'re free to go. For now.','(slides a file across the table) Then explain this.']},dir:['(leans back)','(taps the table)','(stares)','(lights flicker)','(slow smile)']}};
const MONOS=[{t:'The Lighthouse Keeper\'s Daughter',g:'drama',txt:'Every night I climbed those ninety-two steps. Ninety-two. I counted them so I wouldn\'t count the hours he was gone. People think a light is for ships. It isn\'t. It\'s for whoever is waiting. It says: I\'m still here. I haven\'t given up. And tonight, for the first time, I don\'t want to climb. (pause) Is that what letting go feels like?'},
{t:'Wrong Order',g:'comedy',txt:'I ordered one coffee. One. Small. Oat milk. What I received was a seven-layer cake, a balloon shaped like a dolphin and a man with a violin who will not stop following me. I have been to three shops. He knows a song for every mood. (beat) Honestly? He\'s quite good.'},
{t:'Platform Nine',g:'romance',txt:'You don\'t remember me. That\'s okay. Platform nine, two winters ago, you gave me half your scarf because the train was late and I was shivering. You said, "Strangers are just friends who haven\'t missed a train together." I\'ve caught this train every day since. (smiles) I brought your scarf back.'},
{t:'The Tape',g:'horror',txt:'Don\'t press play. I\'m serious. The first time, it was just static. The second time, there was breathing. The third time, it said my name. (whispers) And then it said yours. So whatever you do… (a knock) Did you lock the door?'},
{t:'The Will',g:'soap',txt:'You all came for the reading, didn\'t you? Dressed in black, crying into silk handkerchiefs. Well, here\'s a surprise. Mother left everything to me. The house, the vineyard, the horses. (beat) And a letter. Shall I read it? Out loud? Every. Single. Secret.'},
{t:'Second Camera',g:'crime',txt:'Thirty years on the job teaches you one thing: everybody lies, but cameras don\'t blink. You said you were home. Your phone says you were home. But camera two, the one nobody remembers, saw a red umbrella at eleven-oh-four. Funny thing. It wasn\'t raining.'},
{t:'First Audition',g:'audition',txt:'Hi. I\'m… nervous. Sorry. They said be yourself, which is hard when your knees are doing a little dance. I\'ve wanted this since I was seven, acting out every part in the living room for an audience of two cats. (laughs) The cats loved it. So. Here goes nothing. Or everything.'},
{t:'Start Again',g:'audition',txt:'I failed. Out loud, in front of everyone. And you know what? The sky didn\'t fall. Nobody ran away. Somebody even clapped. So I\'m standing here again, and this time I\'m not asking to be perfect. I\'m asking to be brave. That I can do.'}];
const CASTING=[['Small-Town Sheriff','Lead in a cosy crime web series. Warm, sharp, secretly loves baking.','crime'],['Ghost in the Attic','Feature horror. Must whisper convincingly and stand very still.','horror'],
['Rival Florist','Comedy short. Over-the-top competitive about tulips.','comedy'],['Long-Lost Twin','Prime-time soap. Big entrances, bigger secrets.','soap'],['The One Who Left','Indie romance. Returns home after ten years with a suitcase and an apology.','romance'],
['Night Nurse','Hospital drama. Calm in a crisis, carries a quiet heartbreak.','drama'],['Detective\'s Partner','Buddy cop comedy-drama. Talks too much, notices everything.','crime'],['Camp Counsellor','Summer horror. Tells the campfire story that comes true.','horror'],
['Wedding Planner','Rom-com. Plans everyone\'s wedding but her own.','romance'],['Vineyard Heir','Soap. Charming, ruthless, terrible at poker.','soap']];
const COACH={Joy:['Let it start in the eyes before the mouth.','Lift your energy on the key word of the line.','Real joy often surprises the character too.'],Anger:['Anger is usually protecting a hurt. Find the hurt.','Get quieter, not louder, for real menace.','Pick one word to hit hard.'],
Grief:['Fight the tears; audiences cry when characters try not to.','Slow your breath and let pauses do the work.','Hold onto one specific memory.'],Fear:['Breathe high in the chest, short and shallow.','Listen with your whole body before you speak.','Fear makes us freeze; resist big gestures.'],
Love:['Talk to one person, not to the room.','Soften your voice, but keep your eyes steady.','Let them see you are taking a risk.'],Comedy:['Play it truthfully; the situation is funny, not you.','Land the punchline and then stop.','Timing: a beat of silence before the button.']};
const DIRS={Beat:'A short pause where a thought changes.','Aside:':'Spoken to the audience or camera; other characters don\'t hear.',Cheat:'Turn slightly toward the camera while still playing to your partner.','Off-book':'You know your lines without the script.',Sides:'The pages of a script used for an audition.',Slate:'Saying your name (and role) to camera at the start of a self-tape.',Button:'The final beat or line that ends a scene.'};
let LIB=JSON.parse(localStorage.asLib||'[]'),cur=LIB[0]||null,tab='write',me=null,rehIdx=0,rehRun=false,hideLvl=0,revealed={},takes=[],msg='';let made=+localStorage.asMade||0;
function saveLib(){localStorage.asLib=JSON.stringify(LIB)}
function gen(genre,idea){const seed=hash(genre+idea+Date.now());const r=rng(seed);if(genre==='audition'){const m=pick(r,MONOS.filter(z=>z.g==='audition'));return mono(m)}
 const g=GENRES[genre];const n=[...NAMES].sort(()=>r()-.5);const cast=[n[0],n[1]].concat(r()<.4?[n[2]]:[]);const conf=idea||pick(r,g.conf);const set=pick(r,g.set);
 const fill=s=>s.replace('{n}',2+Math.floor(r()*12)).replace('{c}',conf);const L=[];let w=0;const say=(arr)=>{L.push({who:cast[w%cast.length],text:fill(pick(r,arr)),dir:r()<.5?pick(r,g.dir):''});w++};
 L.push({who:'',text:`${set.toUpperCase()}. ${cast.join(' and ')} — ${conf}.`,dir:'SCENE'});say(g.lines.open);say(g.lines.open);for(let i=0;i<4;i++)say(g.lines.push);if(cast[2])say(g.lines.push);say(g.lines.turn);say(g.lines.turn);say(g.lines.end);say(g.lines.end);
 return{id:seed,title:(idea?idea.slice(0,30):conf.replace(/^a |^an |^the /,'')).replace(/^./,z=>z.toUpperCase())+' ('+genre+')',genre,cast,lines:L}}
function mono(m){const r=rng(hash(m.t));const who=pick(r,NAMES);return{id:hash(m.t+Date.now()),title:m.t+' (monologue)',genre:m.g,cast:[who],lines:[{who:'',text:'MONOLOGUE.',dir:'SCENE'}].concat(m.txt.match(/[^.!?]+[.!?)]+/g).map(s=>({who,text:s.trim(),dir:''})))}}
function addScript(s){if(D&&made>=3){window.demoEnd&&demoEnd('The demo includes 3 scripts. The full <b>Coffeebreak Acting Studio</b> has unlimited scripts and self-tapes.');return false}made++;localStorage.asMade=made;LIB.unshift(s);cur=s;me=s.cast[0];saveLib();G.score=LIB.length;return true}
// ----- voices -----
let VO=[];function loadV(){VO=(window.speechSynthesis&&speechSynthesis.getVoices())||[]}loadV();if(window.speechSynthesis)speechSynthesis.onvoiceschanged=loadV;
function speak(text,who,done){if(!window.speechSynthesis){setTimeout(done,1200);return}const i=cur.cast.indexOf(who);const u=new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g,''));
 const en=VO.filter(v=>/^en/i.test(v.lang));if(en.length)u.voice=en[(i*3)%en.length];u.pitch=[1.3,.7,1,1.6][i%4];u.rate=[1,.92,1.05,1][i%4];u.onend=done;u.onerror=done;try{speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){done()}}
function stepReh(){if(!rehRun||!cur)return;const L=cur.lines;while(rehIdx<L.length&&!L[rehIdx].who)rehIdx++;if(rehIdx>=L.length){rehRun=false;say('🎬 Scene complete! Run it again or try self-tape.');draw();return}
 const l=L[rehIdx];draw();if(l.who!==me)speak(l.text,l.who,()=>{if(rehRun){rehIdx++;stepReh()}})}
function myTurnNext(){if(!cur)return;if(cur.lines[rehIdx]&&cur.lines[rehIdx].who===me){rehIdx++;stepReh()}}
document.addEventListener('keydown',e=>{if(tab==='rehearse'&&e.code==='Space'&&rehRun&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();myTurnNext()}});
// ----- memorise -----
function hideWords(text,key){const r=rng(hash(key));return text.split(' ').map((w,i)=>{const id=key+'_'+i;return (r()<hideLvl*.25&&!revealed[id])?`<span class="hid" data-rv="${id}">${esc(w)}</span>`:esc(w)}).join(' ')}
// ----- self tape -----
let stream=null,mr=null,cv2=null,vid=null,raf=0,slateOn=false;
function idb(){return new Promise((res)=>{try{const q=indexedDB.open('asTakes',1);q.onupgradeneeded=()=>q.result.createObjectStore('t',{keyPath:'id'});q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)}catch(e){res(null)}})}
async function loadTakes(){const db=await idb();if(!db)return;const tx=db.transaction('t').objectStore('t').getAll();tx.onsuccess=()=>{takes=tx.result.sort((a,b)=>b.id-a.id);if(tab==='tape')draw()}}
async function storeTake(t){const db=await idb();if(db)db.transaction('t','readwrite').objectStore('t').put(t)}
async function delTake(id){const db=await idb();if(db)db.transaction('t','readwrite').objectStore('t').delete(id);takes=takes.filter(t=>t.id!==id);draw()}
async function camOn(){if(stream)return true;if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){say('Camera not supported in this browser.');return false}
 try{stream=await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:true})}catch(e){say('Camera/mic blocked. Allow access (or try the downloaded version).');return false}draw();return true}
async function recTake(){if(mr){mr.stop();return}if(D&&takes.length>=1){window.demoEnd&&demoEnd('The demo saves 1 self-tape. The full version saves unlimited takes.');return}if(!await camOn())return;
 vid=document.getElementById('asVid');cv2=document.createElement('canvas');cv2.width=1280;cv2.height=720;const g=cv2.getContext('2d');const name=(document.getElementById('asName')||{}).value||'Actor';const role=me||'Role';const tn=takes.length+1;
 slateOn=true;setTimeout(()=>slateOn=false,3000);music.pause();
 (function loop(){g.drawImage(vid,0,0,1280,720);if(slateOn){g.fillStyle='rgba(0,0,0,.75)';g.fillRect(340,220,600,280);g.fillStyle='#fff';g.font='bold 44px Georgia';g.textAlign='center';g.fillText(name,640,300);g.font='32px Georgia';g.fillText('Role: '+role,640,360);g.fillText((cur?cur.title:'')+' · Take '+tn,640,420);g.fillText(new Date().toLocaleDateString(),640,470)}raf=requestAnimationFrame(loop)})();
 const out=new MediaStream([...cv2.captureStream(30).getVideoTracks(),...stream.getAudioTracks()]);const ch=[];mr=new MediaRecorder(out,{mimeType:MediaRecorder.isTypeSupported('video/webm')?'video/webm':''});mr.ondataavailable=e=>e.data.size&&ch.push(e.data);
 mr.onstop=async()=>{cancelAnimationFrame(raf);mr=null;const blob=new Blob(ch,{type:'video/webm'});const t={id:Date.now(),title:(cur?cur.title:'Self-tape')+' · Take '+tn,blob};takes.unshift(t);await storeTake(t);say('🎞️ Take saved on this device.');draw()};
 mr.start(500);say('🔴 Recording, slate first…');draw()}
function camOff(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
// ----- UI -----
function say(m){msg=m;const e=document.getElementById('asMsg');if(e)e.textContent=m}
function draw(){const tabs=[['write','✍️ Write'],['script','📜 Script'],['rehearse','🎭 Rehearse'],['memo','🧠 Memorise'],['tape','🎥 Self-tape'],['coach','💡 Coach'],['monos','📖 Monologues'],['casting','📋 Casting'],['youtube','📺 YouTube'],['about','ℹ️ About']];
 if(tab!=='tape'&&tab!=='youtube'&&stream&&!mr&&!ymr)camOff();
 let h=`<h2>🎭 Coffeebreak Acting Studio${D?' (Demo)':''}</h2><div>${tabs.map(([k,l])=>`<button data-tab="${k}" class="${tab==k?'sel':''}">${l}</button>`).join(' ')}</div><div id="asMsg" class="note">${esc(msg)}</div>`;
 const pickScript=pickScriptHTML();const _ps=`<div class="row"><label>Script <select id="asCur">${LIB.map((s,i)=>`<option value="${i}" ${s===cur?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label>${cur?`<label>You play <select id="asMe">${cur.cast.map(n=>`<option ${n===me?'selected':''}>${n}</option>`).join('')}</select></label>`:''}</div>`;
 if(!cur&&['script','rehearse','memo'].includes(tab))h+='<div class="card">No script yet. Write one in ✍️ Write or open a monologue.</div>';
 else if(tab==='write')h+=`<div class="card"><div class="row"><label>Genre <select id="asGen">${['drama','comedy','romance','horror','soap','crime','audition'].map(g=>`<option>${g}</option>`).join('')}</select></label>
  <input id="asIdea" placeholder="Scene idea (optional), e.g. a secret recipe" style="width:300px"><button data-a="gen">✨ Write script</button></div>
  <p class="note">The script writer builds an original scene from templates, character names and your idea. It works on your device and doesn't use cloud AI. ${D?`Demo: ${Math.max(0,3-made)} of 3 scripts left.`:''}</p></div>`;
 else if(tab==='script')h+=pickScript+`<div class="card"><input class="ed" id="asTitle" value="${esc(cur.title)}">${cur.lines.map((l,i)=>`<div class="ln ${l.who===me?'me':''}"><b>${l.who?esc(l.who):'🎬'}</b> <input value="${esc(l.dir)}" data-dir="${i}" placeholder="(direction)" style="width:150px"><br><textarea class="ed" rows="2" data-line="${i}">${esc(l.text)}</textarea></div>`).join('')}
  <button data-a="addl">➕ Add line</button> <button data-a="dels">🗑️ Delete script</button></div>`;
 else if(tab==='rehearse'){const l=cur.lines[rehIdx]||{};h+=pickScript+`<div class="card"><div class="tp">${rehRun?(l.who===me?`<div class="who">YOUR LINE (${esc(me)}) ${esc(l.dir)}</div><b style="color:#ffcf6a">${esc(l.text)}</b><div class="note">Say it, then press Next or Space</div>`:`<div class="who">${esc(l.who||'')} ${esc(l.dir||'')}</div>${esc(l.text||'')}`):'Press ▶ Start. Your cue partner reads the other parts aloud with different voices.'}</div>
  <div class="row"><button data-a="rstart">▶ Start from top</button><button data-a="rnext">⏭ Next (my line done)</button><button data-a="rstop">⏹ Stop</button></div>
  ${cur.lines.map((z,i)=>`<div class="ln ${z.who===me?'me':''} ${rehRun&&i===rehIdx?'cur':''}"><b>${esc(z.who||'🎬')}</b> <span class="dir">${esc(z.dir)}</span> ${esc(z.text)}</div>`).join('')}</div>`}
 else if(tab==='memo')h+=pickScript+`<div class="card"><div class="row">Hide level: ${[0,1,2,3,4].map(k=>`<button data-hl="${k}" class="${hideLvl==k?'sel':''}">${['All words','25%','50%','75%','Off-book'][k]}</button>`).join('')}</div><p class="note">Tap a hidden word to peek. Raise the level as you learn.</p>
  ${cur.lines.map((z,i)=>`<div class="ln ${z.who===me?'me':''}"><b>${esc(z.who||'🎬')}</b> ${z.who===me?hideWords(z.text,cur.id+'_'+i):esc(z.text)}</div>`).join('')}</div>`;
 else if(tab==='tape')h+=pickScript+`<div class="card"><div class="row"><label>Your name for the slate <input id="asName" value="${esc(localStorage.asName||'')}"></label></div><video id="asVid" autoplay muted playsinline></video>
  <div class="row"><button data-a="cam">${stream?'📷 Camera on':'📷 Turn on camera'}</button><button data-a="rec">${mr?'⏹ Stop take':'🔴 Record take (with slate)'}</button></div>${D?'<p class="note">Demo: 1 saved take.</p>':''}
  <b>Takes (saved on this device)</b>${takes.map(t=>`<div class="row">🎞️ ${esc(t.title)} <button data-play="${t.id}">▶</button><button data-dl="${t.id}">⬇️ webm</button><button data-dt="${t.id}">🗑️</button></div>`).join('')||'<p class="note">No takes yet.</p>'}<video id="asPb" controls style="display:none"></video></div>`;
 else if(tab==='coach')h+=`<div class="card">${Object.entries(COACH).map(([k,v])=>`<p><b>${k}</b><br>${v.map(z=>'• '+esc(z)).join('<br>')}</p>`).join('')}</div><div class="card"><b>Direction glossary</b>${Object.entries(DIRS).map(([k,v])=>`<p><b>${esc(k)}</b>: ${esc(v)}</p>`).join('')}</div>`;
 else if(tab==='monos')h+=MONOS.map((m,i)=>`<div class="card"><b>${esc(m.t)}</b> <span class="note">${m.g}</span><p>${esc(m.txt)}</p><button data-mono="${i}">🎭 Rehearse this</button></div>`).join('');
 else if(tab==='casting')h+='<p class="note">Made-up casting calls for practice. These are not real auditions.</p>'+CASTING.map((c2,i)=>`<div class="card"><b>📋 ${esc(c2[0])}</b><p>${esc(c2[1])}</p><button data-cast="${i}">Prepare sides</button></div>`).join('');
 else if(tab==='youtube')h+=ytHTML();
 else if(tab==='about')h+=`<div class="card"><p>Acting Studio runs on your device. YouTube mode records HD or Shorts videos with captions; posting to YouTube signs in with Google and uploads only when you press Post. The "AI-style" script writer uses templates and randomness, not cloud AI. The cue partner uses your browser's built-in voices, so it sounds robotic.</p><p>Scripts and self-tapes stay on this device. Nothing is uploaded.</p></div>`;
 R.innerHTML=h;if(tab==='tape'&&stream){const v=document.getElementById('asVid');v.srcObject=stream;vid=v}if(tab==='youtube')ytAfterDraw()}
function pickScriptHTML(){return `<div class="row"><label>Script <select id="asCur">${LIB.map((s,i)=>`<option value="${i}" ${s===cur?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label>${cur?`<label>You play <select id="asMe">${cur.cast.map(n=>`<option ${n===me?'selected':''}>${n}</option>`).join('')}</select></label>`:''}</div>`}
R.addEventListener('input',e=>{const t=e.target;if(t.dataset.line){cur.lines[+t.dataset.line].text=t.value;saveLib()}if(t.dataset.dir){cur.lines[+t.dataset.dir].dir=t.value;saveLib()}if(t.id==='asTitle'){cur.title=t.value;saveLib()}if(t.id==='asName')localStorage.asName=t.value});
R.addEventListener('change',e=>{const t=e.target;if(t.id==='asCur'){cur=LIB[+t.value];me=cur.cast[0];rehIdx=0;rehRun=false;draw()}if(t.id==='asMe'){me=t.value;draw()}});
R.addEventListener('click',e=>{const t=e.target.closest('button,[data-rv]');if(!t)return;const d=t.dataset,a=d.a;
 if(d.tab){tab=d.tab;rehRun=false;if(window.speechSynthesis)speechSynthesis.cancel();if(tab==='tape')loadTakes();draw();return}
 if(d.rv){revealed[d.rv]=1;draw();return}if(d.hl!==undefined){hideLvl=+d.hl;revealed={};draw();return}
 if(d.mono!==undefined){if(addScript(mono(MONOS[+d.mono]))){tab='rehearse';draw()}return}
 if(d.cast!==undefined){const c2=CASTING[+d.cast];const s=gen(c2[2],'');s.title='Sides: '+c2[0];if(addScript(s)){tab='script';say('Sides ready for '+c2[0]+'.');draw()}return}
 if(d.play){const tk=takes.find(z=>z.id==d.play),v=document.getElementById('asPb');v.style.display='block';v.src=URL.createObjectURL(tk.blob);v.play();return}
 if(d.dl){const tk=takes.find(z=>z.id==d.dl),A=document.createElement('a');A.href=URL.createObjectURL(tk.blob);A.download=tk.title.replace(/[^\w\- ]/g,'')+'.webm';document.body.appendChild(A);A.click();A.remove();return}
 if(d.dt){delTake(+d.dt);return}
 if(a==='gen'){const s=gen(document.getElementById('asGen').value,document.getElementById('asIdea').value.trim());if(addScript(s)){tab='script';say('✨ New script written. Edit any line below.');draw()}}
 if(a==='addl'){cur.lines.push({who:me,text:'New line',dir:''});saveLib();draw()}if(a==='dels'){LIB=LIB.filter(z=>z!==cur);cur=LIB[0]||null;me=cur&&cur.cast[0];saveLib();draw()}
 if(a==='rstart'){rehIdx=0;rehRun=true;music.pause();stepReh()}if(a==='rnext')myTurnNext();if(a==='rstop'){rehRun=false;if(window.speechSynthesis)speechSynthesis.cancel();draw()}
 if(a==='cam')camOn();if(a==='rec')recTake()});
// ===== YouTube mode =====
const YT={fmt:'16:9',music:true,song:0,title:'',name:localStorage.asName||'',priv:'private',meta:null,blob:null,ext:'webm',thumb:null,prog:-1,status:''};
let ycv=null,yctx=null,yvid=null,ymr=null,yraf=0,yphase='',yT0=0,yCap=-1,yCues=[],yAC=null,yMusic=null,yMusicGain=null,yAn=null,yAnBuf=null,yOutroAt=0;
const YT_EXP=()=>+localStorage.asYtExports||0;
function ytDims(){const hd=!D;return YT.fmt==='16:9'?(hd?[1920,1080]:[1280,720]):(hd?[1080,1920]:[720,1280])}
function ytMime(){const c=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];for(const m of c)if(window.MediaRecorder&&MediaRecorder.isTypeSupported(m))return m;return ''}
function ytLines(){return cur?cur.lines.filter(l=>l.who):[]}
function fitText(g,s,maxW,y,size,col,stroke){g.font=`bold ${size}px Georgia`;g.textAlign='center';const words=String(s).split(' ');const L=[];let l='';for(const w of words){if(g.measureText(l+w).width>maxW&&l){L.push(l.trim());l=''}l+=w+' '}L.push(l.trim());
 L.forEach((q,i)=>{const yy=y+i*size*1.2;if(stroke){g.lineWidth=size/7;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(q,g.canvas.width/2,yy)}g.fillStyle=col;g.fillText(q,g.canvas.width/2,yy)});return L.length}
function ytFrame(){const g=yctx,W2=ycv.width,H2=ycv.height,u=Math.min(W2,H2)/1080,now=(performance.now()-yT0)/1000;
 if(yphase==='intro'||yphase==='outro'){const p=yphase==='intro'?now:(performance.now()-yOutroAt)/1000;const gr=g.createRadialGradient(W2/2,H2/2,10,W2/2,H2/2,Math.max(W2,H2)*.7);gr.addColorStop(0,'#4a2030');gr.addColorStop(1,'#0d0508');g.fillStyle=gr;g.fillRect(0,0,W2,H2);
  for(let i=0;i<30;i++){const a=i/30*6.283+p;g.fillStyle=`hsla(${330+i*3},80%,70%,.5)`;g.beginPath();g.arc(W2/2+Math.cos(a)*(200+60*Math.sin(p*2+i))*u*1.4,H2/2+Math.sin(a)*(200+60*Math.sin(p*2+i))*u*1.4,8*u,0,7);g.fill()}
  const s=Math.min(1,p*1.5);g.globalAlpha=s;g.font=`${160*u*s}px serif`;g.textAlign='center';g.fillText('🎭',W2/2,H2/2-40*u);fitText(g,'Coffeebreak Acting Studio',W2*.85,H2/2+90*u,64*u,'#ffe9c7');
  if(yphase==='outro'){fitText(g,'Thanks for watching!',W2*.85,H2/2+190*u,50*u,'#e8a0b0');fitText(g,'Like & subscribe ❤️',W2*.85,H2/2+260*u,44*u,'#ffcf6a')}g.globalAlpha=1;
  if(yphase==='intro'&&now>2){yphase='title';yT0=performance.now()}if(yphase==='outro'&&p>3){yphase='done';ymr&&ymr.state!=='inactive'&&ymr.stop()}}
 else{// camera cover-fit
  if(yvid&&yvid.videoWidth){const vr=yvid.videoWidth/yvid.videoHeight,cr=W2/H2;let sw=yvid.videoWidth,sh=yvid.videoHeight,sx=0,sy=0;if(vr>cr){sw=sh*cr;sx=(yvid.videoWidth-sw)/2}else{sh=sw/cr;sy=(yvid.videoHeight-sh)/2}g.drawImage(yvid,sx,sy,sw,sh,0,0,W2,H2)}else{g.fillStyle='#111';g.fillRect(0,0,W2,H2)}
  if(yphase==='title'){const a=Math.min(1,now/.6),out=now>2.4?Math.max(0,1-(now-2.4)/.6):1;g.globalAlpha=a*out;g.fillStyle='rgba(13,5,8,.7)';g.fillRect(0,0,W2,H2);const sl=(1-a)*W2*.3;g.save();g.translate(sl,0);
   fitText(g,YT.title||(cur?cur.title:'My Scene'),W2*.85,H2/2-20*u,90*u,'#ffe9c7',true);fitText(g,(YT.name?'starring '+YT.name:'')+'',W2*.85,H2/2+80*u,46*u,'#e8a0b0',true);g.restore();g.globalAlpha=1;if(now>3){yphase='main';yT0=performance.now();yCap=-1}}
  else if(yphase==='main'){const L=ytLines(),l=L[yCap];if(l){// lower third
    const lt=Math.min(1,(performance.now()-yCapAt)/1000*3),bx=-400*u*(1-lt)+40*u,by=YT.fmt==='9:16'?H2*.62:H2*.66;g.fillStyle='#e8a0b0';g.fillRect(bx,by,12*u,90*u);g.fillStyle='rgba(18,6,12,.85)';g.fillRect(bx+12*u,by,440*u,90*u);
    g.textAlign='left';g.fillStyle='#ffe9c7';g.font=`bold ${44*u}px Georgia`;g.fillText(l.who,bx+32*u,by+50*u);g.font=`${24*u}px Georgia`;g.fillStyle='#e8a0b0';g.fillText(l.who===me?'(me)':'cue partner',bx+32*u,by+80*u);
    g.fillStyle='rgba(0,0,0,.55)';const cy=YT.fmt==='9:16'?H2*.78:H2*.84;g.fillRect(0,cy-58*u,W2,(YT.fmt==='9:16'?220:150)*u);fitText(g,l.text,W2*.9,cy,(YT.fmt==='9:16'?54:48)*u,'#fff',true)}
   else{fitText(g,'Press ⏭ Next line to show the first caption',W2*.9,H2*.9,36*u,'#ffcf6a',true)}}}
 // music ducking under speech
 if(yAn&&yMusicGain){yAn.getFloatTimeDomainData(yAnBuf);let s=0;for(const v of yAnBuf)s+=v*v;const rms=Math.sqrt(s/yAnBuf.length);const speaking=rms>.02||(window.speechSynthesis&&speechSynthesis.speaking);
  const tgt=(yphase==='intro'||yphase==='outro')?.8:(speaking?.12:.45);yMusicGain.gain.setTargetAtTime(tgt,yAC.currentTime,.15)}
 if(yphase!=='done')yraf=requestAnimationFrame(ytFrame)}
let yCapAt=0;
function ytNext(){if(!ymr||yphase!=='main'){say('Start recording first; captions advance once the title card has finished.');return}const L=ytLines();if(yCap<L.length-1){yCap++;yCapAt=performance.now();yCues.push({t:(performance.now()-yT0)/1000,i:yCap});const l=L[yCap];if(l.who!==me)speak(l.text,l.who,()=>{})}else ytStop()}
async function ytRecord(){if(ymr){ytStop();return}if(D&&YT_EXP()>=1){window.demoEnd&&demoEnd('The demo includes 1 YouTube-mode export at 720p. The full version records 1080p and Shorts, unlimited exports, and can post straight to YouTube.');return}
 if(!cur){say('Write or pick a script first.');return}if(!await camOn())return;const [W2,H2]=ytDims();ycv=document.createElement('canvas');ycv.width=W2;ycv.height=H2;yctx=ycv.getContext('2d');
 yvid=document.createElement('video');yvid.muted=true;yvid.playsInline=true;yvid.srcObject=stream;await yvid.play().catch(()=>{});
 yAC=new (window.AudioContext||window.webkitAudioContext)();const dest=yAC.createMediaStreamDestination();const mic=yAC.createMediaStreamSource(stream);mic.connect(dest);yAn=yAC.createAnalyser();yAn.fftSize=1024;yAnBuf=new Float32Array(1024);mic.connect(yAn);
 music.pause();if(YT.music&&(window.PLAYLIST||[]).length){yMusic=new Audio('assets/music/'+PLAYLIST[YT.song%PLAYLIST.length].file);yMusic.loop=true;const src=yAC.createMediaElementSource(yMusic);yMusicGain=yAC.createGain();yMusicGain.gain.value=.8;src.connect(yMusicGain);yMusicGain.connect(dest);yMusicGain.connect(yAC.destination);yMusic.play().catch(()=>{})}else{yMusicGain=null}
 const out=new MediaStream([...ycv.captureStream(30).getVideoTracks(),...dest.stream.getAudioTracks()]);const mime=ytMime();YT.ext=mime.includes('mp4')?'mp4':'webm';
 const ch=[];ymr=new MediaRecorder(out,{mimeType:mime||undefined,videoBitsPerSecond:D?4e6:12e6,audioBitsPerSecond:192000});ymr.ondataavailable=e=>e.data.size&&ch.push(e.data);
 ymr.onstop=()=>{cancelAnimationFrame(yraf);ymr=null;yMusic&&yMusic.pause();yMusic=null;try{yAC.close()}catch(e){}YT.blob=new Blob(ch,{type:mime.split(';')[0]||'video/webm'});localStorage.asYtExports=YT_EXP()+1;YT.meta=YT.meta||ytMeta();say('🎬 YouTube video ready ('+(YT.blob.size/1048576).toFixed(1)+' MB, '+YT.ext+'). Preview, download or post below.');draw()};
 yCues=[];yCap=-1;yphase='intro';yT0=performance.now();ymr.start(1000);ytFrame();say('🔴 Recording YouTube video: intro → title card → your scene. Press ⏭ Next line for each caption, ⏹ to finish with the outro.');draw()}
function ytStop(){if(!ymr)return;if(yphase==='outro')return;yphase='outro';yOutroAt=performance.now();if(window.speechSynthesis)speechSynthesis.cancel()}
function ytMeta(){const s=cur||{title:'My Scene',genre:'drama',cast:[]};const t=(YT.title||s.title).slice(0,90);const tags=['acting','self tape','scene',s.genre,'acting practice','Coffeebreak Acting Studio',YT.fmt==='9:16'?'shorts':'short film'];
 return{title:t+(YT.fmt==='9:16'?' #shorts':''),desc:`${t}\n\nAn original ${s.genre} scene${YT.name?' performed by '+YT.name:''}${s.cast.length?', with the characters '+s.cast.join(', '):''}.\nScript written and rehearsed in Coffeebreak Acting Studio: https://coffeebreaks.itch.io/coffeebreak-acting-studio\n\n#acting #selftape #${s.genre}`,tags:tags.join(', ')}}
function ytThumb(){const cv=document.createElement('canvas');cv.width=1280;cv.height=720;const g=cv.getContext('2d');const src=(stream&&yvid&&yvid.videoWidth)?yvid:(stream?document.getElementById('asVid'):null);
 if(src&&src.videoWidth){const vr=src.videoWidth/src.videoHeight;let sw=src.videoWidth,sh=src.videoHeight,sx=0,sy=0;if(vr>16/9){sw=sh*16/9;sx=(src.videoWidth-sw)/2}else{sh=sw*9/16;sy=(src.videoHeight-sh)/2}g.drawImage(src,sx,sy,sw,sh,0,0,1280,720)}
 else{const gr=g.createLinearGradient(0,0,1280,720);gr.addColorStop(0,'#7a2040');gr.addColorStop(1,'#12060c');g.fillStyle=gr;g.fillRect(0,0,1280,720);g.font='300px serif';g.textAlign='center';g.fillText('🎭',940,480)}
 const gr2=g.createLinearGradient(0,0,800,0);gr2.addColorStop(0,'rgba(0,0,0,.8)');gr2.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr2;g.fillRect(0,0,1280,720);
 const txt=(document.getElementById('ytThT')||{}).value||YT.title||(cur?cur.title:'MY SCENE');const col=(document.getElementById('ytThC')||{}).value||'#ffcf6a';g.textAlign='left';g.font='bold 96px Impact, Arial Black, sans-serif';g.lineWidth=14;g.strokeStyle='#000';
 const words=txt.toUpperCase().split(' ');const L=[];let l='';for(const w of words){if(g.measureText(l+w).width>700&&l){L.push(l.trim());l=''}l+=w+' '}L.push(l.trim());L.slice(0,3).forEach((q,i)=>{const y=200+i*110;g.strokeText(q,50,y);g.fillStyle=i===0?col:'#fff';g.fillText(q,50,y)});
 g.fillStyle='#e8a0b0';g.fillRect(50,600,300,60);g.fillStyle='#1a0a10';g.font='bold 34px Georgia';g.fillText('🎭 Acting Studio',62,642);
 cv.toBlob(b=>{YT.thumb=b;const im=document.getElementById('ytThImg');if(im)im.src=URL.createObjectURL(b);say('🖼️ Thumbnail made (1280×720 PNG).')},'image/png')}
function dl(blob,name){const A=document.createElement('a');A.href=URL.createObjectURL(blob);A.download=name;document.body.appendChild(A);A.click();A.remove()}
function ytConfigured(){const id=window.YT_CLIENT_ID;return !!id&&id!=='YOUR_CLIENT_ID'}
function loadGIS(){return new Promise((res,rej)=>{if(window.google&&google.accounts&&google.accounts.oauth2)return res();const s=document.createElement('script');s.src='img/xfe5b252fb6.jpg';s.onload=()=>res();s.onerror=()=>rej(new Error('Could not load Google sign-in'));document.head.appendChild(s)})}
async function ytPost(){if(D){say('Posting straight to YouTube is in the full version. Download your video and upload it in YouTube Studio.');YT.soon=true;draw();return}
 if(!ytConfigured()){YT.soon=true;draw();return}if(!YT.blob){say('Record a YouTube video first.');return}
 try{await loadGIS()}catch(e){say('Could not reach Google sign-in. Check your connection.');return}
 const tc=google.accounts.oauth2.initTokenClient({client_id:window.YT_CLIENT_ID,scope:'https://www.googleapis.com/auth/youtube.upload',callback:r=>{if(r.error){say('Google sign-in cancelled: '+r.error);return}ytUpload(r.access_token)}});tc.requestAccessToken()}
async function ytUpload(tok){const m=YT.meta||ytMeta();YT.prog=0;YT.status='Starting upload…';draw();
 try{const init=await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',{method:'POST',headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':YT.blob.type,'X-Upload-Content-Length':String(YT.blob.size)},
  body:JSON.stringify({snippet:{title:m.title.slice(0,100),description:m.desc.slice(0,4900),tags:m.tags.split(',').map(z=>z.trim()).filter(Boolean),categoryId:'24'},status:{privacyStatus:YT.priv,selfDeclaredMadeForKids:false}})});
  if(!init.ok)throw new Error('YouTube said '+init.status+': '+(await init.text()).slice(0,200));const loc=init.headers.get('Location');if(!loc)throw new Error('No upload URL returned');
  const vid=await new Promise((res,rej)=>{const x2=new XMLHttpRequest();x2.open('PUT',loc);x2.setRequestHeader('Content-Type',YT.blob.type);x2.upload.onprogress=e=>{if(e.lengthComputable){YT.prog=e.loaded/e.total;const b=document.getElementById('ytBar');if(b)b.style.width=(YT.prog*100).toFixed(1)+'%';const p=document.getElementById('ytPct');if(p)p.textContent=Math.round(YT.prog*100)+'%'}};
   x2.onload=()=>{if(x2.status<300){try{res(JSON.parse(x2.responseText).id)}catch(e){rej(e)}}else rej(new Error('Upload failed '+x2.status+': '+x2.responseText.slice(0,200)))};x2.onerror=()=>rej(new Error('Network error during upload'));x2.send(YT.blob)});
  YT.prog=1;YT.status='✅ Uploaded! Video ID '+vid;YT.vid=vid;
  if(YT.thumb){const t=await fetch('https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId='+vid,{method:'POST',headers:{Authorization:'Bearer '+tok,'Content-Type':'image/png'},body:YT.thumb});YT.status+=t.ok?' · thumbnail set':' · thumbnail not set (custom thumbnails need a verified YouTube channel)'}
 }catch(e){YT.status='❌ '+e.message;YT.prog=-1}draw()}
function ytHTML(){const M=YT.meta||ytMeta();const songs=(window.PLAYLIST||[]);const [W2,H2]=ytDims();
 return `<div class="card"><b>📺 YouTube mode</b> <span class="note">${D?'Demo: 720p, 1 export, no direct upload.':'1080p HD or Shorts, intro/outro, captions, lower-thirds and music bed.'}</span>
 <div class="row"><label>Format <select id="ytFmt"><option value="16:9" ${YT.fmt==='16:9'?'selected':''}>16:9 YouTube (${D?'1280×720':'1920×1080'})</option><option value="9:16" ${YT.fmt==='9:16'?'selected':''}>9:16 Shorts (${D?'720×1280':'1080×1920'})</option></select></label>
 <label>Video title <input id="ytTitle" value="${esc(YT.title||(cur?cur.title:''))}"></label><label>Your name <input id="ytName" value="${esc(YT.name)}"></label></div>
 <div class="row"><label><input type="checkbox" id="ytMus" ${YT.music?'checked':''}> 🎵 Music bed (ducks under speech)</label><select id="ytSong">${songs.map((s,i)=>`<option value="${i}" ${i==YT.song?'selected':''}>${esc(s.title)}</option>`).join('')}</select></div>
 ${pickScriptHTML()}<div id="ytPrev" style="max-width:${YT.fmt==='9:16'?260:560}px"></div>
 <div class="row"><button data-yt="cam">📷 Camera</button><button data-yt="rec">${ymr?'⏹ Finish (outro)':'🔴 Record YouTube video'}</button><button data-yt="next">⏭ Next line (caption)</button></div>
 <p class="note">Recording plays: intro bumper → animated title card → your scene with burned-in captions and name lower-thirds (press Next for each line; the cue partner reads other characters) → outro bumper. ${W2}×${H2}, ${ytMime().includes('mp4')?'MP4':'WebM'}.</p></div>
 ${YT.blob?`<div class="card"><b>🎬 Your video</b><br><video id="ytOut" controls style="max-width:${YT.fmt==='9:16'?260:560}px"></video><div class="row"><button data-yt="dl">⬇️ Download ${YT.ext}</button></div></div>`:''}
 <div class="card"><b>🖼️ Thumbnail maker</b> <span class="note">1280×720 PNG; grabs a camera frame if the camera is on.</span><div class="row"><input id="ytThT" placeholder="Big thumbnail text" value="${esc(YT.title||(cur?cur.title:''))}"><input type="color" id="ytThC" value="#ffcf6a"><button data-yt="thumb">🖼️ Make thumbnail</button><button data-yt="thdl">⬇️ PNG</button></div><img id="ytThImg" style="max-width:320px;border-radius:8px"></div>
 <div class="card"><b>📝 Title, description & tags</b><div class="row"><input id="ytMT" class="ed" value="${esc(M.title)}"><button data-copy="ytMT">📋 Copy</button></div><div class="row"><textarea id="ytMD" class="ed" rows="5">${esc(M.desc)}</textarea><button data-copy="ytMD">📋 Copy</button></div><div class="row"><input id="ytMG" class="ed" value="${esc(M.tags)}"><button data-copy="ytMG">📋 Copy</button></div></div>
 <div class="card"><b>📤 Post to YouTube</b><div class="row"><label>Privacy <select id="ytPriv">${['private','unlisted','public'].map(p=>`<option ${p===YT.priv?'selected':''}>${p}</option>`).join('')}</select></label><button data-yt="post" style="background:#d42a4a;color:#fff;border-color:#fff">▶ POST TO YOUTUBE</button></div>
 ${YT.prog>=0?`<div style="background:#3a1424;border-radius:8px;height:18px;overflow:hidden"><div id="ytBar" style="height:100%;width:${YT.prog*100}%;background:#e8a0b0"></div></div><span id="ytPct">${Math.round(YT.prog*100)}%</span>`:''}<div class="note">${esc(YT.status)}${YT.vid?` <a href="https://studio.youtube.com/video/${YT.vid}/edit" target="_blank" rel="noopener" style="color:#ffcf6a">Open in YouTube Studio</a>`:''}</div>
 ${YT.soon?`<div class="card" id="ytSoon">🚧 <b>Direct posting is coming soon.</b> ${D?'It\'s part of the full version.':'It switches on once Coffeebreak\'s YouTube connection is set up.'} For now: download your video, then upload it on YouTube Studio's upload page.<div class="row">${YT.blob?`<button data-yt="dl">⬇️ Download video</button>`:''}<a href="https://studio.youtube.com/channel/UC/videos/upload?d=ud" target="_blank" rel="noopener" style="color:#ffcf6a">Open YouTube Studio upload ↗</a></div></div>`:''}
 <p class="note">Signs in with Google only when you press Post, and uploads straight from this device to your own YouTube channel. Uploads default to private.</p></div>`}
function ytAfterDraw(){const p=document.getElementById('ytPrev');if(p&&ycv&&ymr){ycv.style.width='100%';ycv.style.borderRadius='12px';p.appendChild(ycv)}else if(p&&stream){const v=document.createElement('video');v.muted=true;v.autoplay=true;v.playsInline=true;v.srcObject=stream;v.style.width='100%';p.appendChild(v);vid=v}
 const o=document.getElementById('ytOut');if(o&&YT.blob)o.src=URL.createObjectURL(YT.blob);const im=document.getElementById('ytThImg');if(im&&YT.thumb)im.src=URL.createObjectURL(YT.thumb)}
R.addEventListener('input',e=>{const t=e.target;if(t.id==='ytTitle'){YT.title=t.value;YT.meta=null}if(t.id==='ytName'){YT.name=t.value;YT.meta=null}if(['ytMT','ytMD','ytMG'].includes(t.id)){YT.meta=YT.meta||ytMeta();YT.meta[{ytMT:'title',ytMD:'desc',ytMG:'tags'}[t.id]]=t.value}});
R.addEventListener('change',e=>{const t=e.target;if(t.id==='ytFmt'&&!ymr){YT.fmt=t.value;YT.meta=null;draw()}if(t.id==='ytMus')YT.music=t.checked;if(t.id==='ytSong')YT.song=+t.value;if(t.id==='ytPriv')YT.priv=t.value});
R.addEventListener('click',e=>{const t=e.target.closest('[data-yt],[data-copy]');if(!t)return;if(t.dataset.copy){const el=document.getElementById(t.dataset.copy);(navigator.clipboard?navigator.clipboard.writeText(el.value):Promise.reject()).then(()=>say('📋 Copied.')).catch(()=>{el.select();document.execCommand('copy');say('📋 Copied.')});return}
 const a=t.dataset.yt;if(a==='cam')camOn();if(a==='rec')ytRecord();if(a==='next')ytNext();if(a==='thumb')ytThumb();if(a==='thdl'){if(YT.thumb)dl(YT.thumb,'thumbnail-1280x720.png');else say('Make a thumbnail first.')}
 if(a==='dl'&&YT.blob)dl(YT.blob,(YT.title||'acting-studio').replace(/[^\w\- ]/g,'')+'.'+YT.ext);if(a==='post')ytPost()});
document.addEventListener('keydown',e=>{if(tab==='youtube'&&ymr&&(e.code==='Space'||e.code==='ArrowRight')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();ytNext()}});
window.ASYT={YT,ytRecord,ytNext,ytStop,ytThumb,ytPost,ytMeta,get phase(){return yphase},get rec(){return !!ymr}};

if(cur)me=cur.cast[0];window.AS={gen,addScript,get cur(){return cur},get takes(){return takes},setTab:k=>{tab=k;draw()}};loadTakes();draw();
})();
function update(){}function draw(){}
