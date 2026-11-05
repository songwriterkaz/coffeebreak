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
// ===== Coffeebreak Healing Prayers =====
const DEMO=!!window.DEMO,SK=DEMO?'prayersDemo':'prayersSave';
let S={fav:[],journal:[],candles:0,name:''};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const NOTE='Prayer is a comfort, not a replacement for medical or professional care. If you are in crisis, please call Lifeline 13 11 14 (Australia), or 000 in an emergency.';
// {N}=name (or "me"), {P}=possessive (or "my")
const CATS=[
{k:'hiv',n:'Living with HIV',e:'🎗️',free:1,v:['Jeremiah 30:17, part (KJV)','For I will restore health unto thee, and I will heal thee of thy wounds, saith the LORD.'],p:[
['Strength and dignity','Loving God, I lift up {N} to you today. Give {N} strength in body, peace in mind and comfort in heart. Bless every tablet, every appointment and every test result with your care. Where there is fear, bring hope. Where there is shame, remind {N} that you have never once looked away in judgement. You call {N} beloved. Amen.'],
['For good people around them','Faithful God, surround {N} with people who love without conditions: friends who stay, family who listen and doctors who treat with kindness and respect. Silence every unkind word and every stigma. Let {N} be seen fully, known fully and loved fully, as you see and know and love. Amen.'],
['On a hard day','Lord Jesus, today feels heavy. Sit with {N} in the tiredness and the worry. Ease side effects, quiet anxious thoughts and give good rest tonight. Thank you that a diagnosis does not define {N}. You do. Hold {N} close until morning comes. Amen.']]},
{k:'cancer',n:'Cancer',e:'🌷',free:1,v:['Isaiah 41:10 (KJV)','Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.'],p:[
['During treatment','Healing God, be with {N} through every scan, every treatment and every long wait. Guide the hands and minds of the doctors and nurses. Let the medicine do its good work, and protect {P} body from harm. When {N} is weary, be strength. When {N} is afraid, be near. Amen.'],
['Waiting for results','Lord, waiting is so hard. Calm {P} racing heart. Fill these hours with your peace that passes understanding. Whatever the news, remind {N} that you are already there, and that {N} will not face one moment of it alone. Amen.'],
['Hope and courage','God of all hope, plant courage deep in {N} today. Give good days to treasure, laughter in unexpected places and people who show up with love. Heal what can be healed, comfort what aches, and keep {P} spirit bright. Amen.']]},
{k:'chronic',n:'Chronic Illness & Pain',e:'🌿',v:['2 Corinthians 12:9, part (KJV)','My grace is sufficient for thee: for my strength is made perfect in weakness.'],p:[
['For relief','Compassionate God, you see the pain that others cannot see. Bring relief to {P} body today. Ease the aching, soften the flare, and grant real, deep rest. Thank you that you never ask {N} to prove how much it hurts. You simply know. Amen.'],
['When nobody understands','Lord, chronic illness can be so lonely. When {N} is doubted or misunderstood, be the One who believes. Send people who listen without fixing and stay without tiring. Remind {N} that rest is not laziness and that worth was never measured in productivity. Amen.'],
['Grace for today','Gracious God, I do not ask for tomorrow\'s strength, only today\'s. Give {N} enough energy for what truly matters, and permission to let the rest go. Be gentle with {N}, and help {N} be gentle with {P} own body. Amen.']]},
{k:'anxiety',n:'Mental Health & Anxiety',e:'🕊️',free:1,v:['Philippians 4:6-7 (KJV)','Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.'],p:[
['When my mind races','Prince of Peace, quiet the storm in {P} mind. Slow the racing thoughts and steady the breath. Breathe in... you are here. Breathe out... you are holding {N}. Let your peace settle like still water, one breath at a time. Amen.'],
['Panic and fear','Lord, when panic rises, be the ground beneath {P} feet. Remind {N} that feelings are not facts and that this wave will pass. Hold {N} until the shaking stops. You are not disappointed; you are close. Amen.'],
['For good help','Loving God, thank you for counsellors, doctors and medicines that help minds heal. Lead {N} to the right support and give courage to reach out. Taking care of {P} mind is not a lack of faith. It is a gift you gave. Amen.']]},
{k:'depression',n:'Depression',e:'🌅',v:['Psalm 34:18 (KJV)','The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.'],p:[
['In the dark','God who sees in the dark, be with {N} where light feels far away. When getting out of bed is a victory, celebrate it with {N}. When hope is thin, hold it on {P} behalf. You are not far off. You are near to the brokenhearted. Amen.'],
['Small steps','Gentle Lord, help {N} take one small step today: a glass of water, some fresh air, a message to a friend. Let each little step count. Lift the heaviness bit by bit, and remind {N} that {P} life is precious to you and to others. Amen.'],
['Not alone','Father, whisper to {N} the truth: you are loved, you are wanted, you are not a burden. Send kind people close. Bring good help, good sleep and, in time, the return of joy. Until then, carry {N}. Amen.']]},
{k:'nd',n:'Autism & ADHD Families',e:'🧩',v:['Psalm 139:14 (KJV)','I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.'],p:[
['Wonderfully made','Creator God, thank you for the beautiful way you made {N}: every interest, every sensitivity, every bright and unusual gift. Help the world make room for who {N} truly is. Let {N} grow up knowing deep down that nothing about {P} brain is a mistake. Amen.'],
['For the parents','Lord, strengthen the parents and carers who love {N}. On days of meltdowns, appointments, forms and fights for support, give patience, rest and allies. Let them feel your pride in how fiercely they love. Amen.'],
['School and friends','Faithful God, go with {N} into classrooms and playgrounds. Give teachers understanding and classmates kindness. Bring true friends who enjoy {N} just as {N} is, and protect {P} heart from unkind words. Amen.']]},
{k:'carers',n:'Carers',e:'🤲',v:['Galatians 6:2 (KJV)','Bear ye one another\'s burdens, and so fulfil the law of Christ.'],p:[
['Strength for the carer','Lord Jesus, you came to serve, so you understand. Strengthen {N}, who gives so much care to others. Refill what has been poured out. Give real rest, unbroken sleep and moments of joy that are just for {N}. Amen.'],
['When it is too much','God of compassion, when {N} feels stretched thin, resentful, tired or guilty, meet {N} with grace and not shame. Bring practical help, respite and people who notice. Remind {N} that asking for help is wise. Amen.'],
['Thank you','Thank you, Father, for every unseen act of love that {N} does: the meals, the medications, the late nights, the patience. You see it all. Bless {N} back a hundredfold. Amen.']]},
{k:'grief',n:'Grief',e:'🕯️',free:1,v:['Matthew 5:4 (KJV)','Blessed are they that mourn: for they shall be comforted.'],p:[
['Fresh grief','God of all comfort, {P} heart is broken. Hold {N} in the waves of tears and the strange, quiet emptiness. There are no right words, so just stay close. Let grief come as it needs to, and let your love be the arms around it. Amen.'],
['Memories','Lord, thank you for the life we are missing, for every laugh, every story and every ordinary day together. Let precious memories become a comfort to {N} and not only a pain. Keep our loved one safe in your love. Amen.'],
['The long road','Faithful God, grief has no timetable. On anniversaries, birthdays and unexpected moments, be near to {N}. Let {N} carry love forward and live fully again, without guilt, in time. Amen.']]},
{k:'surgery',n:'Surgery & Hospital Stays',e:'🏥',v:['Psalm 46:1 (KJV)','God is our refuge and strength, a very present help in trouble.'],p:[
['Before surgery','Lord, I place {N} in your hands before surgery. Guide the surgeons, anaesthetists and nurses with skill and care. Calm {P} nerves. Keep {N} safe throughout and bring {N} gently back to waking, with healing already begun. Amen.'],
['A long hospital stay','God who never sleeps, be with {N} in the beeping machines, the long nights and the strange food. Ease pain, speed healing and bring kind staff to every shift. Let visitors bring laughter and let home come soon. Amen.'],
['Recovery','Healing God, bless {P} recovery. Knit together what needs mending. Give patience with slow progress, and joy in every small milestone. Thank you for each day of getting stronger. Amen.']]},
{k:'addiction',n:'Addiction Recovery',e:'🌱',v:['2 Corinthians 5:17 (KJV)','Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.'],p:[
['One day at a time','Lord, give {N} strength for just today. When cravings come, be stronger. When old places call, open a better door. Thank you for every sober hour. Each one is a miracle and you are proud of it. Amen.'],
['After a slip','Merciful God, if {N} has stumbled, lift {N} up without shame. Your mercies are new every morning. Remind {N} that recovery is not ruined by one hard day. Start again with {N}, right now. Amen.'],
['Healing relationships','Father, heal what addiction has hurt: trust, families and friendships. Give courage to make amends, and grace to receive forgiveness. Surround {N} with sponsors, groups and people who believe in new beginnings. Amen.']]},
{k:'disability',n:'Disability',e:'♿',v:['1 Samuel 16:7, part (KJV)','For the LORD seeth not as man seeth; for man looketh on the outward appearance, but the LORD looketh on the heart.'],p:[
['Fully worthy','God who sees the heart, thank you that {N} is fully made in your image and fully worthy. Break down every barrier: physical, social and attitudinal. Let {N} be welcomed, included and celebrated everywhere. Amen.'],
['Strength and access','Lord, on frustrating days of steps without ramps, forms without help and people without patience, give {N} strength and fair treatment. Open doors, change hearts and bring good advocates alongside. Amen.'],
['Joy and purpose','Father, fill {P} life with joy, friendship and purpose. Let {N} know that {P} gifts are needed in your world. Bless every day with good things. Amen.']]},
{k:'far',n:'Loved Ones Far Away',e:'✈️',v:['Genesis 31:49, part (KJV)','The LORD watch between me and thee, when we are absent one from another.'],p:[
['Watch over them','Lord, I cannot be with {N}, but you can. Watch over {N} where I cannot reach. Keep {N} safe, healthy and well. Wrap {N} in love tonight, and let {N} feel how much they are missed. Amen.'],
['Across the miles','God of every place, distance cannot separate us from your love. Bridge the miles between me and {N}. Bless our calls and messages, and bring a joyful reunion in your good time. Amen.'],
['Travelling mercies','Faithful God, go with {N} on every road, flight and journey. Protect from harm, give rest along the way and bring {N} safely to where they are going. Amen.']]}
];
const showName=()=>S.name.trim()||'';
const TP={nd:1,carers:1,far:1};
function fill(t,k){const n=showName();if(n)return t.replace(/\{N\}/g,n).replace(/\{P\}/g,n+"'s");if(TP[k])return t.replace(/\{N\}/g,'my loved one').replace(/\{P\}/g,"my loved one's");
 return t.replace('I lift up {N}','I lift myself up').replace('I place {N}','I place myself').replace(/\{N\} truly is/g,'I truly am').replace(/as \{N\} is/g,'as I am').replace(/\{N\} is/g,'I am').replace(/\{N\} feels/g,'I feel').replace(/\{N\} will/g,'I will').replace(/\{N\} does/g,'I do').replace(/\{N\} has/g,'I have').replace(/\{N\}/g,'me').replace(/\{P\}/g,'my')}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
// ---- DOM panel ----
const pn=document.createElement('div');pn.id='prPanel';pn.style.cssText='display:none;position:fixed;inset:4% 8% 9% 8%;z-index:90;background:rgba(255,250,240,.97);color:#3a2a1a;border-radius:18px;padding:18px 22px;overflow:auto;font:16px/1.5 Georgia,serif;box-shadow:0 10px 40px #0008';document.body.appendChild(pn);
const BS='background:#8a5a2a;color:#fff;border:0;border-radius:10px;padding:8px 14px;margin:3px;font:bold 15px Georgia;cursor:pointer';
const BS2='background:#fff;color:#5a3a1a;border:2px solid #d8b080;border-radius:10px;padding:7px 13px;margin:3px;font:15px Georgia;cursor:pointer';
function closeP(){pn.style.display='none';G.state='menu'}
function nameBox(){return '<div style="background:#fff3dc;border-radius:12px;padding:8px 12px;margin:6px 0">🙏 <b>Pray for someone:</b> <input id="pnm" value="'+esc(S.name)+'" placeholder="type a name (or leave blank for me)" style="font:15px Georgia;padding:5px 8px;border:1px solid #d8b080;border-radius:8px;width:240px"> <button id="pnmb" style="'+BS2+'">Use name</button></div>'}
function bindName(re){const b=pn.querySelector('#pnmb');if(b)b.onclick=()=>{S.name=pn.querySelector('#pnm').value.slice(0,40);save();re()}}
function openCats(){G.state='panel';pn.innerHTML='<h2 style="margin:0;color:#8a5a2a">✝️ Healing Prayers</h2>'+nameBox()+'<div style="display:flex;flex-wrap:wrap">'+CATS.map((c,i)=>{const lk=DEMO&&!c.free;return '<button data-i="'+i+'" style="'+BS2+';width:31%;min-width:180px;text-align:left'+(lk?';opacity:.55':'')+'">'+c.e+' '+c.n+(lk?' 🔒':'')+'</button>'}).join('')+'</div><p><button id="pc" style="'+BS+'">⬅ Back</button></p><p style="font-size:12px;opacity:.7">'+NOTE+'</p>';pn.style.display='block';
 pn.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const c=CATS[+b.dataset.i];if(DEMO&&!c.free){window.demoEnd&&window.demoEnd('The full app has all 12 prayer categories, including chronic illness, depression, carers, surgery, addiction recovery, disability and more.');return}openCat(+b.dataset.i)});bindName(openCats);pn.querySelector('#pc').onclick=closeP}
function prayerHTML(ci,pi){const c=CATS[ci],p=c.p[pi],id=c.k+pi,f=S.fav.includes(id);return '<div style="border-top:1px solid #ecd8b8;padding:10px 0"><b style="color:#8a5a2a">'+esc(p[0])+'</b><p style="margin:6px 0;font-size:17px"><i>'+esc(fill(p[1],c.k))+'</i></p><button data-f="'+id+'" style="'+BS2+'">'+(f?'❤️ Saved':'🤍 Favourite')+'</button><button data-s="'+ci+','+pi+'" style="'+BS2+'">🗣️ Read aloud</button></div>'}
function bindPrayers(re){pn.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const id=b.dataset.f,i=S.fav.indexOf(id);if(i<0)S.fav.push(id);else S.fav.splice(i,1);save();re()});pn.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{const [a,q]=b.dataset.s.split(',').map(Number);try{const u=new SpeechSynthesisUtterance(fill(CATS[a].p[q][1],CATS[a].k));u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}})}
function openCat(ci){G.state='panel';const c=CATS[ci];pn.innerHTML='<h2 style="margin:0;color:#8a5a2a">'+c.e+' '+c.n+'</h2><blockquote style="margin:8px 0;padding:8px 14px;background:#fff3dc;border-left:4px solid #d8a050;border-radius:8px">“'+esc(c.v[1])+'”<br><small>— '+c.v[0]+'</small></blockquote>'+nameBox()+c.p.map((_,i)=>prayerHTML(ci,i)).join('')+'<p><button id="pb" style="'+BS+'">⬅ Categories</button><button id="pk" style="'+BS2+'">🕯️ Light a candle</button></p>';pn.style.display='block';
 bindPrayers(()=>openCat(ci));bindName(()=>openCat(ci));pn.querySelector('#pb').onclick=openCats;pn.querySelector('#pk').onclick=()=>{pn.style.display='none';G.state='candle'}}
function openFavs(){G.state='panel';const L=[];CATS.forEach((c,ci)=>c.p.forEach((p,pi)=>{if(S.fav.includes(c.k+pi))L.push([ci,pi])}));pn.innerHTML='<h2 style="margin:0;color:#8a5a2a">❤️ Favourite prayers</h2>'+nameBox()+(L.length?L.map(([a,b])=>'<small>'+CATS[a].e+' '+CATS[a].n+'</small>'+prayerHTML(a,b)).join(''):'<p>No favourites yet. Tap 🤍 on any prayer to keep it here.</p>')+'<p><button id="pc" style="'+BS+'">⬅ Back</button></p>';pn.style.display='block';bindPrayers(openFavs);bindName(openFavs);pn.querySelector('#pc').onclick=closeP}
function openJournal(){G.state='panel';pn.innerHTML='<h2 style="margin:0;color:#8a5a2a">📔 My prayer journal</h2><p><i>Write your own prayer, a request, or something you are thankful for.</i></p><input id="jw" placeholder="Who or what is this for? (optional)" style="width:100%;box-sizing:border-box;font:15px Georgia;padding:6px;border:1px solid #d8b080;border-radius:8px;margin-bottom:6px"><textarea id="jt" style="width:100%;height:110px;font:15px Georgia;border:1px solid #d8b080;border-radius:10px;padding:8px;box-sizing:border-box"></textarea><p><button id="js" style="'+BS+'">Save prayer</button> <button id="jc" style="'+BS2+'">Close</button></p><p style="font-size:12px;opacity:.7">Saved on this device only. Nothing is uploaded.</p>'+S.journal.map((e,i)=>({e,i})).reverse().map(({e,i})=>'<div style="border-top:1px solid #ecd8b8;padding:6px 0"><b>'+esc(e.d)+'</b>'+(e.w?' · for <i>'+esc(e.w)+'</i>':'')+(e.a?' · 🙌 Answered':'')+'<br>'+esc(e.t).replace(/\n/g,'<br>')+'<br><button data-a="'+i+'" style="'+BS2+';font-size:12px;padding:3px 8px">'+(e.a?'↩ Not yet':'🙌 Mark answered')+'</button><button data-d="'+i+'" style="'+BS2+';font-size:12px;padding:3px 8px">🗑 Delete</button></div>').join('');pn.style.display='block';
 pn.querySelector('#js').onclick=()=>{const v=pn.querySelector('#jt').value.trim();if(v){S.journal.push({d:new Date().toLocaleDateString('en-AU'),w:pn.querySelector('#jw').value.trim().slice(0,60),t:v,a:false});save();openJournal()}};pn.querySelector('#jc').onclick=closeP;
 pn.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const e=S.journal[+b.dataset.a];e.a=!e.a;save();openJournal()});pn.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(confirm('Delete this prayer?')){S.journal.splice(+b.dataset.d,1);save();openJournal()}})}
// ---- canvas scenes ----
let lit=false,litT=0;const motes=[];for(let i=0;i<40;i++)motes.push({x:Math.random()*900,y:Math.random()*600,s:Math.random()*2+1,v:Math.random()*10+5});
function bg(a,b){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,220,150,.35)';for(const m of motes){x.beginPath();x.arc(m.x,m.y,m.s,0,7);x.fill()}}
function candle(X,Y,on,sc){sc=sc||1;x.save();x.translate(X,Y);x.scale(sc,sc);if(on){const gl=x.createRadialGradient(0,-150,5,0,-150,220);gl.addColorStop(0,'rgba(255,200,100,.55)');gl.addColorStop(1,'rgba(255,200,100,0)');x.fillStyle=gl;x.fillRect(-240,-380,480,480)}
 const g=x.createLinearGradient(-45,0,45,0);g.addColorStop(0,'#e8dcc0');g.addColorStop(.5,'#fff8e8');g.addColorStop(1,'#d8c8a8');x.fillStyle=g;rr(-45,-120,90,200,10);x.fill();x.fillStyle='#3a2a1a';x.fillRect(-2,-138,4,20);
 if(on){const f=Math.sin(t*9)*3+Math.sin(t*23)*1.5,h=48+Math.sin(t*5)*5;x.fillStyle='#ffb030';x.beginPath();x.moveTo(0,-128);x.quadraticCurveTo(-18,-150,f,-128-h);x.quadraticCurveTo(18,-150,0,-128);x.fill();x.fillStyle='#fff4b0';x.beginPath();x.moveTo(0,-130);x.quadraticCurveTo(-8,-145,f*.6,-130-h*.55);x.quadraticCurveTo(8,-145,0,-130);x.fill()}
 x.fillStyle='#8a6a3a';x.beginPath();x.ellipse(0,82,80,16,0,0,7);x.fill();x.restore()}
function drawTitle(){bg('#2a1a3a','#0a0610');candle(450,420,true,.8);T('✝️ Coffeebreak Healing Prayers',450,110,40,'#ffe9c7','center');T('Gentle prayers for healing, hope and comfort',450,150,20,'#ffd8a0','center','italic ');
 button('st',350,500,200,56,'🙏 Begin',()=>{G.state='menu'},{fs:20})}
function drawMenu(){bg('#3a2414','#0e0806');T('Where would you like to begin?',450,80,30,'#ffe9c7','center');const n=showName();if(n)T('Praying for '+n+' 💛',450,115,18,'#ffd8a0','center','italic ');
 const B=[['pr','📖 Prayers',openCats],['pf','🙏 Pray for someone',()=>{openCats();setTimeout(()=>{const i=pn.querySelector('#pnm');i&&i.focus()},50)}],['fv','❤️ Favourites',openFavs],['jn','📔 My journal',openJournal],['cd','🕯️ Light a candle',()=>{G.state='candle'}]];
 B.forEach((b,i)=>button(b[0],300,150+i*72,300,58,b[1],b[2],{fs:19}));T(DEMO?'Free demo: 4 of 12 prayer categories':'All 12 categories, '+CATS.reduce((a,c)=>a+c.p.length,0)+' prayers',450,540,14,'#c8a878','center','')}
function drawCandle(){bg('#1a0e08','#000');candle(450,430,lit,1.1);
 if(!lit){T('Take a moment. When you are ready,',450,90,22,'#ffe9c7','center','');T('tap the candle to light it.',450,122,22,'#ffe9c7','center','');BTN.cdl={x:380,y:250,w:140,h:300,fn:()=>{lit=true;S.candles++;save()}}}
 else{x.globalAlpha=Math.min(1,litT/2);T('Your light is shining'+(showName()?' for '+showName():'')+'.',450,80,24,'#ffe9c7','center','italic ');T('Breathe slowly. You are held. You are loved.',450,112,18,'#ffd8a0','center','');x.globalAlpha=1;
  T('🕯️ Candles lit: '+S.candles,450,575,14,'#c8a878','center','')}
 button('cb',30,540,120,40,'⬅ Back',()=>{lit=false;litT=0;delete BTN.cdl;G.state='menu'},{fs:15});if(lit)button('cr',750,540,120,40,'🙏 Pray',()=>{delete BTN.cdl;openCats()},{fs:15})}
function drawPanel(){bg('#3a2414','#0e0806')}
(function(){const o=document.createElement('canvas');o.width=240;o.height=300;const k=x;x=o.getContext('2d');candle(120,230,true,.8);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){for(const m of motes){m.y-=m.v*dt;if(m.y<0)m.y=600}if(lit)litT+=dt}
function draw(){x.clearRect(0,0,900,600);for(const k in BTN)delete BTN[k];({title:drawTitle,menu:drawMenu,candle:drawCandle,panel:drawPanel})[G.state]();x.textAlign='left'}
window.PR={G,S,CATS,fill,openCats,openCat,openFavs,openJournal};startLoop();
