const $=id=>document.getElementById(id);
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
// ---- Duet Script Studio ----
window.HERO_SRC='assets/hero.png';
const S=$('stage'),esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const GENRES=[
 {id:'comedy',name:'☕ Café Comedy',need:0,mood:'silly',open:['Did you just put marshmallows in my espresso?','I have a confession… I ate the last croissant.','Why is there a skull-shaped latte with my name on it?'],
  lines:['That is the funniest thing I have heard all week!','Okay, but hear me out…','You did WHAT with the cappuccino?','I am not laughing. I am simply… vibrating.','This is a disaster. A delicious disaster.','Let us pretend this never happened.','Plot twist: I love it.','Can we start over? Like, from Tuesday?']},
 {id:'mystery',name:'🕯️ Cosy Mystery',need:40,mood:'curious',open:['The roses in the window… someone moved them.','Who left this note under the sugar bowl?','The clock stopped at exactly midnight.'],
  lines:['That does not add up.','Look closer. What do you see?','Someone in this room knows the truth.','I found a clue!','You are hiding something, aren’t you?','The footprints lead to the garden.','It was never about the cake.','Then who has the key?']},
 {id:'romance',name:'🌹 Sweet Romance',need:90,mood:'tender',open:['I saved you the window seat. Again.','You remembered how I take my coffee.','I wrote you a song, but it is very bad.'],
  lines:['I have been meaning to tell you something.','You make the ordinary feel special.','Do not laugh, okay?','I think I always knew.','Stay a little longer?','That is the kindest thing anyone has said to me.','Are you blushing?','Same time tomorrow?']},
 {id:'spooky',name:'💀 Spooky Gothic',need:150,mood:'eerie',open:['Did you hear that? From the attic?','The candles relit themselves.','This mansion is not on any map.'],
  lines:['Stay close to me.','It is only the wind… right?','The portrait just blinked.','We should not have come here.','Whatever you do, do not open that door.','I am not scared. You are scared.','Listen… footsteps.','Run!']},
 {id:'adventure',name:'🗺️ Big Adventure',need:220,mood:'bold',open:['The map says the treasure is under the volcano.','Our boat has a tiny leak. A big tiny leak.','Pack snacks. We leave at dawn.'],
  lines:['We can do this together!','Hold on tight!','That bridge does not look safe.','Left or right? Choose!','I always wanted to say this: follow me!','We made it! Wait… where are we?','Trust me on this one.','This is the best day ever!']},
 {id:'drama',name:'🎭 Big Drama',need:300,mood:'intense',open:['After ten years, you just walk back in?','I read the letter. All of it.','Tonight, everything changes.'],
  lines:['You never listened to me!','I did it for you.','How could you keep this from me?','I am not the same person anymore.','Say something. Anything.','Then this is goodbye.','I forgive you.','We start again. Together.']}];
const PERS=['Bubbly','Grumpy','Shy','Dramatic','Clever','Sneaky','Kind','Brave','Nervous','Bossy'];
const SETTINGS=['Midnight coffee shop','Rose-garden greenhouse','Haunted bakery','Rooftop at sunset','Train to nowhere','Backstage at the theatre','Marshmallow factory','Gothic library'];
const EMOS=['','😊 happy','😢 sad','😠 angry','😲 shocked','😏 sly','😨 scared','🥰 loving','🤭 giggling','😤 determined','🤫 whispering'];
const DIRS=['(pauses)','(sips coffee)','(crosses the stage)','(sighs dramatically)','(turns away)','(laughs)','(gasps)','(takes their hand)','(looks out the window)','(drops a spoon)'];
const PROMPTS=['Reveal a secret','Ask a question','Change the subject','Disagree!','Make a joke','Raise the stakes','Show a feeling','Callback to an earlier line'];
const DEMO=!!window.DEMO,MAXL=DEMO?6:40;
const PK=DEMO?'duetDemo':'duetFull';
let P=JSON.parse(localStorage.getItem(PK)||'{"total":0,"scenes":0,"best":0}');function saveP(){localStorage.setItem(PK,JSON.stringify(P))}
const G={state:'title',score:0,level:P.scenes,genre:null,a:{name:'Mallow',p:'Bubbly'},b:{name:'Rosie',p:'Grumpy'},setting:SETTINGS[0],lines:[],who:0,emo:'',dir:'',sug:[],prompt:''};window.G=G;window.DUET=G;
const unlocked=g=>DEMO?g.id==='comedy':P.total>=g.need;
function title(){G.state='title';S.innerHTML=`<div class="scr" style="text-align:center"><img id="hero" src="assets/hero.png"><h1>Coffeebreak Duet Script Studio</h1>
<p>Write a two-person scene line by line, then rehearse it with a friend — or let the computer read the other part!</p>
<p><button class="big" id="go">✍️ New Scene</button></p><p style="color:#e8a0b0">Scenes written: ${P.scenes} · Creativity points: ${P.total} · Best scene: ${P.best}</p>
${DEMO?'<p style="color:#ffcf6a">Free demo: Café Comedy only, scenes up to 6 lines.</p>':''}</div>`;$('go').onclick=()=>{startMusic();setup()}}
function setup(){G.state='setup';S.innerHTML=`<div class="scr"><h2>1. Pick a genre</h2><div class="row" id="gs">${GENRES.map((g,i)=>`<div class="card ${unlocked(g)?'':'lock'}" data-i="${i}"><b>${g.name}</b><br><small>${unlocked(g)?'mood: '+g.mood:(DEMO?'🔒 full game':'🔒 '+g.need+' pts to unlock')}</small></div>`).join('')}</div>
<h2>2. Your two characters</h2>${['a','b'].map(k=>`<div class="row"><b>${k==='a'?'🎭 A':'🎭 B'}</b><input id="n${k}" maxlength="18" value="${esc(G[k].name)}"><select id="p${k}">${PERS.map(p=>`<option ${p===G[k].p?'selected':''}>${p}</option>`).join('')}</select></div>`).join('')}
<h2>3. Setting</h2><div class="row"><select id="set">${SETTINGS.map(s=>`<option ${s===G.setting?'selected':''}>${s}</option>`).join('')}</select></div>
<p><button class="big" id="go" disabled>Start writing ➜</button></p></div>`;
 S.querySelectorAll('#gs .card').forEach(c=>c.onclick=()=>{const g=GENRES[+c.dataset.i];if(!unlocked(g))return;G.genre=g;S.querySelectorAll('#gs .card').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');$('go').disabled=false});
 if(G.genre){const i=GENRES.indexOf(G.genre);S.querySelector(`#gs .card[data-i="${i}"]`).classList.add('sel');$('go').disabled=false}
 $('go').onclick=()=>{for(const k of['a','b']){G[k]={name:$('n'+k).value.trim()||(k==='a'?'Mallow':'Rosie'),p:$('p'+k).value}}G.setting=$('set').value;G.lines=[];G.who=0;write()}}
const cur=()=>G.who?G.b:G.a;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function persLine(p){return{Bubbly:'Ooh, this is SO exciting!',Grumpy:'Hmph. Fine. Whatever.',Shy:'Um… if that is okay with you…',Dramatic:'This is the most important moment of my LIFE!',Clever:'Actually, I have a theory.',Sneaky:'I may have… borrowed something.',Kind:'Hey, are you alright?',Brave:'Leave it to me.',Nervous:'Oh no oh no oh no.',Bossy:'Right. Here is the plan.'}[p]}
function newSug(){const g=G.genre,src=G.lines.length?g.lines:g.open,used=new Set(G.lines.map(l=>l.text));G.sug=shuffle(src.filter(t=>!used.has(t))).slice(0,3);const pl=persLine(cur().p);if(!used.has(pl))G.sug.push(pl);G.prompt=PROMPTS[Math.random()*PROMPTS.length|0]}
function renderScript(el,hi){el.innerHTML=`<div class="dir">${esc(G.genre.name)} — ${esc(G.setting)}. ${esc(G.a.name)} (${G.a.p}) and ${esc(G.b.name)} (${G.b.p}).</div>`+G.lines.map((l,i)=>`<div class="ln" id="ln${i}" style="${hi===i?'background:#ffe0ea':''}"><span class="who">${esc(l.who?G.b.name:G.a.name)}</span>${l.emo?' <span class="dir">['+esc(l.emo)+']</span>':''}${l.dir?' <span class="dir">'+esc(l.dir)+'</span>':''}: ${esc(l.text)}</div>`).join('')||'';el.scrollTop=1e6}
function write(){G.state='play';newSug();drawWrite()}
function drawWrite(){const c=cur();S.innerHTML=`<div class="scr"><div class="row"><h3 style="margin:0">Line ${G.lines.length+1}/${MAXL} · ${esc(c.name)} speaks <small>(${c.p})</small></h3><button id="swap">🔄 Switch speaker</button><span style="margin-left:auto">Score: <b id="sc">${calc().total}</b></span></div>
<div id="script"></div><p style="color:#ffcf6a;margin:6px 0">💡 Prompt: <b>${G.prompt}</b></p>
<div class="row">${G.sug.map((t,i)=>`<div class="card sug" data-i="${i}">${esc(t)}</div>`).join('')}<button id="more">🎲 New cards</button></div>
<div class="row"><input id="typed" maxlength="140" placeholder="…or type your own line" style="flex:1;min-width:220px"><button id="add">➕ Add line</button></div>
<div class="row">Emotion: <select id="emo">${EMOS.map(e=>`<option ${e===G.emo?'selected':''} value="${e}">${e||'— none —'}</option>`).join('')}</select> Stage direction: <select id="dir"><option value="">— none —</option>${DIRS.map(d=>`<option ${d===G.dir?'selected':''}>${d}</option>`).join('')}</select></div>
<div class="row"><button id="undo">↩ Undo</button><button id="fin" ${G.lines.length<2?'disabled':''}>🎬 Finish scene</button><button id="back">⬅ Setup</button></div></div>`;
 renderScript($('script'));
 const add=t=>{t=t.trim();if(!t)return;G.lines.push({who:G.who,text:t,emo:$('emo').value,dir:$('dir').value,own:!G.sug.includes(t)});G.emo='';G.dir='';G.who^=1;if(G.lines.length>=MAXL)return finish();newSug();drawWrite()};
 S.querySelectorAll('.sug').forEach(e=>e.onclick=()=>add(G.sug[+e.dataset.i]));
 $('add').onclick=()=>add($('typed').value);$('typed').onkeydown=e=>{if(e.key==='Enter')add(e.target.value)};
 $('emo').onchange=e=>G.emo=e.target.value;$('dir').onchange=e=>G.dir=e.target.value;
 $('swap').onclick=()=>{G.who^=1;newSug();drawWrite()};$('more').onclick=()=>{newSug();drawWrite()};
 $('undo').onclick=()=>{const l=G.lines.pop();if(l)G.who=l.who;newSug();drawWrite()};$('fin').onclick=finish;$('back').onclick=setup}
function calc(){const L=G.lines,own=L.filter(l=>l.own).length,emos=new Set(L.map(l=>l.emo).filter(Boolean)).size,dirs=new Set(L.map(l=>l.dir).filter(Boolean)).size;
 let turns=0;for(let i=1;i<L.length;i++)if(L[i].who!==L[i-1].who)turns++;const words=new Set(L.flatMap(l=>l.text.toLowerCase().match(/[a-z']+/g)||[])).size;
 const parts={'Lines':L.length*3,'Your own words':own*8,'Emotion variety':emos*5,'Stage directions':dirs*4,'Back-and-forth':turns*2,'Vocabulary':Math.min(40,words)};
 return{parts,total:Object.values(parts).reduce((a,b)=>a+b,0)}}
function finish(){const r=calc();G.score=r.total;G.state='over';P.scenes++;G.level=P.scenes;const before=P.total;P.total+=r.total;P.best=Math.max(P.best,r.total);saveP();
 const nu=GENRES.filter(g=>!DEMO&&before<g.need&&P.total>=g.need);const stars=r.total>=150?'⭐⭐⭐':r.total>=70?'⭐⭐':'⭐';
 S.innerHTML=`<div class="scr"><h2>🎬 Scene complete! ${stars}</h2><div class="row">${Object.entries(r.parts).map(([k,v])=>`<div class="card">${k}<br><b>+${v}</b></div>`).join('')}</div><h3>Creativity score: ${r.total}</h3>
 ${nu.length?`<p style="color:#ffcf6a">🔓 Unlocked: ${nu.map(g=>g.name).join(', ')}!</p>`:''}<div id="script"></div>
 <div class="row"><button class="big" id="reh">🎤 Rehearsal mode</button><button id="exp">📜 Print / Copy script</button><button id="edit">✍️ Keep editing</button><button id="new">✨ New scene</button></div></div>`;
 renderScript($('script'));$('reh').onclick=rehearseSetup;$('exp').onclick=exportS;$('edit').onclick=()=>{P.scenes--;P.total-=r.total;saveP();write()};$('new').onclick=()=>{if(DEMO&&P.scenes>=2)return demoEnd('You wrote your demo scenes! Six more genres, scenes up to 40 lines and the full Coffeebreak playlist are in the full game.');setup()}}
const TTS='speechSynthesis'in window;
function rehearseSetup(){G.state='rehearse';S.innerHTML=`<div class="scr"><h2>🎤 Rehearsal mode</h2><p>Who is performing?</p>
<div class="row"><label><input type="radio" name="m" value="2" checked> Two players (pass the device)</label></div>
<div class="row"><label><input type="radio" name="m" value="a"> I play ${esc(G.a.name)}${TTS?', computer reads '+esc(G.b.name):''}</label></div>
<div class="row"><label><input type="radio" name="m" value="b"> I play ${esc(G.b.name)}${TTS?', computer reads '+esc(G.a.name):''}</label></div>
<div class="row">Speed: <select id="spd"><option value="1.3">Relaxed</option><option value="1" selected>Normal</option><option value="0.75">Fast</option></select></div>
<button class="big" id="go">▶ Start</button> <button id="bk">⬅ Back</button></div>`;
 $('bk').onclick=()=>{G.state='over';finishView()};$('go').onclick=()=>rehearse(S.querySelector('input[name=m]:checked').value,+$('spd').value)}
function finishView(){S.innerHTML='<div class="scr"><div id="script"></div><div class="row"><button class="big" id="reh">🎤 Rehearse again</button><button id="exp">📜 Print / Copy script</button><button id="new">✨ New scene</button></div></div>';renderScript($('script'));$('reh').onclick=rehearseSetup;$('exp').onclick=exportS;$('new').onclick=()=>{if(DEMO&&P.scenes>=2)return demoEnd();setup()}}
let rtimer=null;
function rehearse(mode,spd){let i=0,hits=0;G.state='rehearse';
 S.innerHTML=`<div class="scr"><div class="row"><h3 id="rw" style="margin:0"></h3><span style="margin-left:auto" id="rc"></span></div><div class="prog"><i id="pb"></i></div><div class="kar" id="kar"></div>
 <div class="row" style="justify-content:center"><button class="big" id="nx">✅ Said it! Next</button><button id="st">⏹ Stop</button></div><div id="script"></div></div>`;
 const stop=()=>{clearInterval(rtimer);if(TTS)speechSynthesis.cancel()};
 $('st').onclick=()=>{stop();G.state='over';finishView()};
 function show(){stop();renderScript($('script'),i);if(i>=G.lines.length){S.querySelector('.scr').innerHTML=`<h2>👏 Bravo! Curtain call!</h2><p>You hit ${hits} of ${G.lines.filter(l=>mode==='2'||(mode==='a'?l.who===0:l.who===1)).length} cues on time.</p><div class="row"><button class="big" id="ag">🎤 Again</button><button id="exp">📜 Print / Copy script</button><button id="dn">✨ Done</button></div>`;
   $('ag').onclick=rehearseSetup;$('exp').onclick=exportS;$('dn').onclick=()=>{G.state='over';finishView();if(DEMO)demoEnd('Great performance! Unlock six more genres, longer scenes and every Coffeebreak song in the full game.')};return}
  const l=G.lines[i],nm=l.who?G.b.name:G.a.name,comp=TTS&&mode!=='2'&&((mode==='a'&&l.who===1)||(mode==='b'&&l.who===0));
  $('rw').textContent=`${comp?'🤖':'🎭'} ${nm}${l.emo?' — '+l.emo:''} ${l.dir||''}`;$('rc').textContent=`Line ${i+1}/${G.lines.length}`;
  const w=l.text.split(' '),dur=(1200+w.length*380)*spd,t0=Date.now();let k=0;
  const draw=()=>{$('kar').innerHTML=w.map((x,j)=>`<span class="${j<k?'done':'todo'}">${esc(x)}</span>`).join(' ')};draw();
  $('nx').style.visibility=comp?'hidden':'visible';
  if(comp){const u=new SpeechSynthesisUtterance(l.text);u.rate=1/spd;u.pitch=l.who?1.3:0.9;u.onboundary=()=>{k=Math.min(w.length,k+1);draw()};u.onend=()=>{i++;setTimeout(show,400)};speechSynthesis.speak(u)}
  rtimer=setInterval(()=>{const f=(Date.now()-t0)/dur;$('pb').style.width=Math.min(100,f*100)+'%';if(!comp){k=Math.min(w.length,Math.floor(f*w.length*1.05));draw()}
   if(comp&&f>2.5){i++;show()}},80);
  $('nx').onclick=()=>{if(comp)return;const f=(Date.now()-t0)/dur;if(f>=0.6&&f<=1.6)hits++;i++;show()}}
 show()}
function scriptText(){const L=[`COFFEEBREAK DUET SCRIPT STUDIO`,`${G.genre.name.replace(/^\S+\s/,'')} — ${G.setting}`,'',`CHARACTERS`,`  ${G.a.name.toUpperCase()} — ${G.a.p}`,`  ${G.b.name.toUpperCase()} — ${G.b.p}`,'',`SETTING: ${G.setting}.`,''];
 G.lines.forEach(l=>{L.push((l.who?G.b.name:G.a.name).toUpperCase()+(l.emo?' ['+l.emo.replace(/^\S+\s/,'')+']':''));if(l.dir)L.push('    '+l.dir);L.push('    '+l.text,'')});L.push('THE END','',`Creativity score: ${calc().total}`,'Made with Coffeebreak Duet Script Studio — coffeebreaks.itch.io');return L.join('\n')}
function exportS(){const t=scriptText();G.state='over';S.innerHTML=`<div class="scr"><h2>📜 Your script</h2><textarea id="tx" style="width:100%;height:45vh;font:14px 'Courier New';background:#fff8ee;color:#2a1018;border-radius:10px">${esc(t)}</textarea>
<div class="row"><button id="dl">⬇ Download .txt</button><button id="cp">📋 Copy</button><button id="pr">🖨 Print</button><button id="bk">⬅ Back</button><span id="msg"></span></div></div>`;
 $('dl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.download=(G.a.name+'-and-'+G.b.name+'-script.txt').replace(/[^\w.-]+/g,'_');a.click()};
 $('cp').onclick=()=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>$('msg').textContent='Copied!').catch(()=>{$('tx').select();document.execCommand('copy');$('msg').textContent='Copied!'})};
 $('pr').onclick=()=>{const w=window.open('','_blank');if(!w)return;w.document.write('<pre style="font:15px Courier New;white-space:pre-wrap">'+esc(t)+'</pre>');w.document.close();w.print()};$('bk').onclick=finishView}
title();
