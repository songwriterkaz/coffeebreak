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
// ===== Coffeebreak Kids shared helpers =====
window.FONT='"Comic Sans MS","Chalkboard SE","Comic Neue","Trebuchet MS",sans-serif';const KF=window.FONT;
const DEMO=!!window.DEMO;
const STK=['🦭','🌈','🦄','🐬','🍭','🌟','🐙','🦋','🍩','🐢','🚀','🌻','🐳','🧁','🦊','🐝','🎈','🐠','🍓','🦖','🪐','🐧','🎨','🏆'];
function kStore(key,def){let s=Object.assign({stars:0,stk:[]},def||{});try{Object.assign(s,JSON.parse(localStorage.getItem(key+(DEMO?'D':''))||'{}'))}catch(e){}s.save=()=>{try{localStorage.setItem(key+(DEMO?'D':''),JSON.stringify(Object.assign({},s,{save:undefined})))}catch(e){}};return s}
let CONF=[],POP=null;
function confetti(n){for(let i=0;i<(n||60);i++)CONF.push({x:450+(Math.random()-.5)*300,y:250,vx:(Math.random()-.5)*500,vy:-Math.random()*500-100,c:['#ff4f9a','#ffd24a','#40c8ff','#5ad870','#b06aff','#ff8a3d'][i%6],r:Math.random()*6,l:2})}
function kTone(f,d,v,tp){try{window._AC=window._AC||new AudioContext();const A=window._AC;if(A.state==='suspended')A.resume();const o=A.createOscillator(),g=A.createGain();o.type=tp||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.06,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+d);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+d)}catch(e){}}
function yay(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>kTone(f,.18,.06,'triangle'),i*90))}
function oops(){kTone(220,.25,.06,'triangle')}
function speak(s){try{const u=new SpeechSynthesisUtterance(s);u.lang='en-AU';u.rate=.9;u.pitch=1.2;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function reward(S,n,txt){S.stars+=n||1;let nw=null;while(S.stk.length<STK.length&&S.stars>=(S.stk.length+1)*5){nw=STK[S.stk.length];S.stk.push(nw)}S.save();confetti();yay();POP={t:0,txt:txt||'Great job!',stk:nw};if(G)G.score=S.stars}
function kbg(c1,c2){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,900,600);x.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<9;i++){x.beginPath();x.arc((i*137+t*12)%960-30,80+(i*97)%460,14+i%4*8,0,7);x.fill()}}
function kb(id,X,Y,w,h,label,fn,o={}){const col=o.bg||'#ff6fae';BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:(p)=>{kTone(660,.06,.04);fn(p)}};x.globalAlpha=o.dis?.45:1;x.fillStyle='rgba(0,0,0,.18)';rr(X,Y+5,w,h,h*.3);x.fill();x.fillStyle=o.sel&&label!==''?'#ffd24a':col;rr(X,Y,w,h,h*.3);x.fill();x.strokeStyle=o.sel&&label===''?'#2a3a5a':'#fff';x.lineWidth=o.sel?6:3;x.stroke();
 x.fillStyle=o.fg||'#fff';x.font='bold '+(o.fs||Math.min(26,h*.42))+'px '+KF;x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+2);x.textBaseline='alphabetic';x.textAlign='left';x.globalAlpha=1}
function seal(X,Y,s,mood){x.save();x.translate(X,Y+Math.sin(t*3)*3*s);x.scale(s,s);const b='#9aa8b8',d='#7a889a';
 x.fillStyle=d;x.beginPath();x.ellipse(-55,40,26,12,-.5,0,7);x.ellipse(-60,26,22,10,.6,0,7);x.fill();
 x.fillStyle=b;x.beginPath();x.ellipse(0,30,62,40,0,0,7);x.fill();x.beginPath();x.ellipse(28,-12,40,36,0,0,7);x.fill();x.fillStyle='#dfe6ee';x.beginPath();x.ellipse(10,42,38,20,0,0,7);x.fill();
 x.fillStyle=d;x.beginPath();x.ellipse(mood==='wave'?44:20,mood==='wave'?10+Math.sin(t*10)*6:48,10,22,mood==='wave'?-1+Math.sin(t*10)*.4:.6,0,7);x.fill();
 x.fillStyle='#1a1a24';x.beginPath();x.arc(14,-18,7,0,7);x.arc(44,-18,7,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(16,-21,2.5,0,7);x.arc(46,-21,2.5,0,7);x.fill();
 x.fillStyle='#3a2a30';x.beginPath();x.ellipse(30,-4,7,5,0,0,7);x.fill();x.strokeStyle='#3a2a30';x.lineWidth=2;x.beginPath();if(mood==='sad')x.arc(30,12,6,3.6,5.8);else x.arc(30,2,7,.3,Math.PI-.3);x.stroke();
 x.strokeStyle='rgba(60,60,70,.6)';x.lineWidth=1.2;[[-1,-3],[1,-3],[-1,2],[1,2]].forEach(([a,o])=>{x.beginPath();x.moveTo(30+a*8,o);x.lineTo(30+a*30,o+(o<0?-4:4));x.stroke()});
 x.fillStyle='rgba(255,120,150,.45)';x.beginPath();x.arc(6,-2,6,0,7);x.arc(54,-2,6,0,7);x.fill();x.restore()}
function bubbleK(s,X,Y,w){x.font='bold 18px '+KF;const lines=Math.ceil(x.measureText(s).width/(w-24))+0;x.fillStyle='#fff';rr(X,Y,w,22+lines*22,16);x.fill();x.strokeStyle='#4ab0e8';x.lineWidth=3;x.stroke();x.fillStyle='#2a3a5a';wrapT(s,X+12,Y+26,w-24,22)}
function kOverlay(dt){CONF.forEach(p=>{p.vy+=800*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;x.fillStyle=p.c;x.save();x.translate(p.x,p.y);x.rotate(p.r+=dt*8);x.fillRect(-5,-3,10,6);x.restore()});CONF=CONF.filter(p=>p.l>0&&p.y<620);
 if(POP){POP.t+=dt;const k=Math.min(1,POP.t*4),a=POP.t>1.8?Math.max(0,1-(POP.t-1.8)*3):1;x.globalAlpha=a;x.save();x.translate(450,90);x.scale(k,k);x.fillStyle='#fff';rr(-200,-40,400,POP.stk?110:70,24);x.fill();x.strokeStyle='#ffd24a';x.lineWidth=5;x.stroke();T('⭐ '+POP.txt,0,6,28,'#ff4f9a','center');if(POP.stk)T('New sticker! '+POP.stk,0,52,24,'#3a7ad8','center');x.restore();x.globalAlpha=1;if(POP.t>2.2)POP=null}}
function starBar(S){x.fillStyle='rgba(255,255,255,.85)';rr(14,10,190,40,20);x.fill();T('⭐ '+S.stars+'   🏷️ '+S.stk.length,30,38,20,'#ff7a00','left')}
function stickerBook(S,back){kbg('#fff3c4','#ffd6e8');T('My Sticker Book',450,60,38,'#ff4f9a','center');T('Earn a new sticker every 5 stars!',450,92,18,'#7a4a8a','center','');
 STK.forEach((s,i)=>{const X=95+(i%8)*92,Y=120+Math.floor(i/8)*120;x.fillStyle='#fff';rr(X-40,Y,80,100,16);x.fill();if(i<S.stk.length)emo(s,X,Y+50,52);else{x.globalAlpha=.25;emo('❔',X,Y+50,40);x.globalAlpha=1}});kb('sb',350,500,200,60,'⬅ Back',back,{bg:'#4ab0e8'})}
// ---- original kids music: rhythm-track sync ----
let RT=null;
function rhythmTrack(file,title,lead){RT={file,lead:lead||0};try{music.src='assets/music/'+file;$('np').textContent='Now playing: '+title;started=true;music.currentTime=0;music.play().catch(()=>{})}catch(e){}}
function rhythmTime(fb){try{if(RT&&music.src.indexOf(RT.file)>=0&&!music.paused&&music.currentTime>0)return music.currentTime-RT.lead}catch(e){}return fb}
function rhythmEnd(){if(!RT)return;RT=null;load();if(started&&!muted)music.play().catch(()=>{})}
// ===== Coffeebreak Safe Space Journal =====
// Free app. Everything is stored only in this browser (localStorage). No music by default.
const SK='safeSpaceV1';const G={state:'app',score:0,level:0};window.G=G;
let D={moods:[],journal:[],plan:{},reasons:[],hope:[],pin:'',pad:false};try{Object.assign(D,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(D))}catch(e){}};
const HELP=[['🚨','Emergency','000','tel:000','If you or someone else is in immediate danger, call 000 or go to your nearest hospital emergency department.'],
['📞','Lifeline (24/7)','13 11 14','tel:131114','Crisis support for anyone feeling overwhelmed or thinking about suicide.'],
['💬','Lifeline text (24/7)','0477 13 11 14','sms:0477131114','Prefer typing? Text a crisis supporter.'],
['🖥️','Lifeline online chat (24/7)','lifeline.org.au/crisis-chat','https://www.lifeline.org.au/crisis-chat','Chat one-to-one with a trained crisis supporter.'],
['📞','Suicide Call Back Service (24/7)','1300 659 467','tel:1300659467','Free professional counselling (ages 15+).'],
['📞','Beyond Blue (24/7)','1300 22 4636','tel:1300224636','Counselling for anxiety, depression and tough times.'],
['📞','13YARN (24/7)','13 92 76','tel:139276','Crisis support by Aboriginal and Torres Strait Islander people.'],
['📞','Kids Helpline (24/7, ages 5–25)','1800 55 1800','tel:1800551800','Free, private counselling for young people.'],
['🏳️‍🌈','QLife (3pm–9pm local time, every day)','1800 184 527','tel:1800184527','LGBTIQ+ peer support and referral.']];
const NOTE='Safe Space Journal is a self-help tool. It is not a crisis service, therapy or medical treatment, and nobody monitors what you write. If you are in danger, call 000.';
const CRISIS=/\b(kill(ing)? my ?self|end(ing)? it( all)?|end my life|suicid\w*|want(ed)? to die|wish i (was|were) dead|don'?t want to (be here|live|exist)|no (point|reason) (in )?living|better off without me|hurt(ing)? my ?self|self[- ]?harm|take my (own )?life)\b/i;
const PROMPTS=['What is weighing on you most right now? You can write it all out here.','What is one small thing that got you through today, even a tiny one?','Who or what makes you feel even a little bit safe?','Write a kind note to yourself, as if to a friend who is hurting.','What would you like tomorrow to look like? Just one small part.','What feelings are here right now? Name them without judging them.','What is something you\'re looking forward to, even a little?','What helped last time you felt like this?'];
const STEPS=[['warn','1. My warning signs','Thoughts, feelings, situations or behaviours that tell me a hard time might be starting.'],['cope','2. Things I can do on my own','Ways to calm or distract myself (e.g. a walk, a shower, music, breathing, a pet).'],['places','3. People and places that distract me','People I can be around and places I can go to feel a bit better.'],['people','4. People I can ask for help','Names and phone numbers of people I trust to talk to.'],['pros','5. Professionals and services','My GP, counsellor or psychologist, local mental health team, and the 24/7 lines above.'],['safe','6. Making my environment safer','Steps to put distance between me and anything I could use to hurt myself (ask someone you trust to help).'],['live','7. My reasons for living','The people, pets, hopes and things that matter to me.']];
// ---- UI shell ----
const css=document.createElement('style');css.textContent=`#ss{position:fixed;z-index:5;overflow:auto;box-sizing:border-box;padding:58px 22px 30px;background:linear-gradient(#f3f6fb,#e9eff8);color:#2c3a4a;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;border-radius:6px}
#ss h2{margin:6px 0;font-weight:600;color:#3b5a7a}#ss .nav{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}#ss .nav button{background:#fff;color:#3b5a7a;border:1px solid #c9d6e6;border-radius:18px;padding:6px 12px;font:14px system-ui;cursor:pointer}#ss .nav button.on{background:#3b5a7a;color:#fff}
#ss .card{background:#fff;border-radius:14px;padding:12px 16px;margin:10px 0;box-shadow:0 1px 4px #0001}#ss textarea,#ss input{width:100%;box-sizing:border-box;border:1px solid #c9d6e6;border-radius:10px;padding:8px;font:15px system-ui;background:#fbfdff}#ss textarea{min-height:90px}
#ss .b{background:#3b5a7a;color:#fff;border:0;border-radius:10px;padding:8px 16px;font:600 15px system-ui;cursor:pointer;margin:4px 6px 4px 0}#ss .b.l{background:#fff;color:#3b5a7a;border:1px solid #c9d6e6}#ss .muted{font-size:13px;color:#6a7a8a}
#ss .moods button{font-size:30px;background:#fff;border:2px solid #dbe4ef;border-radius:14px;margin:3px;padding:4px 10px;cursor:pointer}#ss .moods button.on{border-color:#3b5a7a}
#ssHelpBtn{position:fixed;z-index:60;background:#c0392b;color:#fff;border:0;border-radius:24px;padding:10px 18px;font:700 15px system-ui;box-shadow:0 2px 8px #0003;cursor:pointer}
#ssHelp{display:none;position:fixed;z-index:70;inset:4% 6%;background:#fff;border-radius:18px;box-shadow:0 10px 40px #0005;overflow:auto;padding:18px 22px;color:#2c3a4a;font:15px/1.45 system-ui}#ssHelp a.n{display:block;text-decoration:none;color:#2c3a4a;border:1px solid #dbe4ef;border-radius:12px;padding:8px 12px;margin:6px 0}#ssHelp a.n b{color:#1a5a9a}
#ssLock{display:none;position:fixed;z-index:65;inset:0;background:#e9eff8;align-items:center;justify-content:center;flex-direction:column;font:16px system-ui;color:#2c3a4a}
.breath{width:160px;height:160px;border-radius:50%;margin:20px auto;background:radial-gradient(#cfe3ff,#7fa8d8);animation:br 16s ease-in-out infinite}@keyframes br{0%{transform:scale(.55)}25%{transform:scale(1)}50%{transform:scale(1)}75%{transform:scale(.55)}100%{transform:scale(.55)}}
#mute,#skip,#np{display:none!important}
@media print{body *{visibility:hidden!important}#ssPrint,#ssPrint *{visibility:visible!important}#ssPrint{position:absolute;left:0;top:0;width:100%;display:block!important;font:13px Arial;color:#000}}`;document.head.appendChild(css);
['mute','skip','np'].forEach(i=>{const e=document.getElementById(i);if(e)e.style.display='none'});try{music.pause()}catch(e){}
const ui=document.createElement('div');ui.id='ss';document.body.appendChild(ui);
const hb=document.createElement('button');hb.id='ssHelpBtn';hb.textContent='🤍 Get help now';document.body.appendChild(hb);
const hp=document.createElement('div');hp.id='ssHelp';document.body.appendChild(hp);
const lk=document.createElement('div');lk.id='ssLock';document.body.appendChild(lk);
const pr=document.createElement('div');pr.id='ssPrint';pr.style.display='none';document.body.appendChild(pr);
const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function helpHTML(gentle){return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;color:#3b5a7a">${gentle?'You don\'t have to go through this alone 🤍':'Get help now 🤍'}</h2><button class="b" id="hpX" style="background:#3b5a7a;color:#fff;border:0;border-radius:10px;padding:8px 14px;font:600 15px system-ui">Close</button></div>
 ${gentle?'<p>It sounds like things are really hard right now. Thank you for writing it down. Talking to someone can help, and these services are free and there for you, any time.</p>':'<p>Reaching out is a strong thing to do. These services are free and confidential.</p>'}
 ${HELP.map(h=>`<a class="n" href="${h[3]}" ${h[3].startsWith('http')?'target="_blank" rel="noopener"':''}>${h[0]} <b>${h[1]}: ${h[2]}</b><br><span style="font-size:13px;color:#5a6a7a">${h[4]}</span></a>`).join('')}
 <p style="font-size:13px;color:#5a6a7a">Also: your GP, a trusted friend or family member, or your safety plan in this app. ${NOTE}</p>`}
function showHelp(gentle){hp.innerHTML=helpHTML(gentle);hp.style.display='block';hp.querySelector('#hpX').onclick=()=>{hp.style.display='none'}}
hb.onclick=()=>showHelp(false);
let tab='home',lastCrisis=0;
function crisisCheck(txt){if(CRISIS.test(txt)&&Date.now()-lastCrisis>60000){lastCrisis=Date.now();showHelp(true)}}
function place(){const r=c.getBoundingClientRect();Object.assign(ui.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});hb.style.left=(r.right-hb.offsetWidth-14)+'px';hb.style.top=(r.top+10)+'px'}
const today=()=>new Date().toLocaleDateString('en-AU');
function nav(){return '<div class="nav">'+[['home','🏠 Check-in'],['journal','📔 Journal'],['plan','🛟 Safety plan'],['calm','🫧 Breathe & ground'],['jar','🫙 Reasons to stay'],['hope','💌 Hope box'],['set','🔒 Privacy']].map(t=>`<button data-t="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')+'</div>'}
function view(){
 if(tab==='home'){const last=D.moods.slice(-7).reverse();return `<h2>🕊️ Safe Space Journal</h2><div class="card"><b>How are you feeling right now?</b><div class="moods">${['😞','🙁','😐','🙂','😊'].map((m,i)=>`<button data-m="${i}">${m}</button>`).join('')}</div><input id="mNote" placeholder="Anything you want to add? (optional)"><button class="b" id="mSave">Save check-in</button></div>
  <div class="card"><b>Recent check-ins</b><br>${last.length?last.map(m=>`${['😞','🙁','😐','🙂','😊'][m.v]} ${esc(m.d)} ${esc(m.n)}`).join('<br>'):'<span class="muted">None yet.</span>'}</div>
  <div class="card muted">${NOTE} Everything you write stays on this device only.</div>`}
 if(tab==='journal'){const p=PROMPTS[D.journal.length%PROMPTS.length];return `<h2>📔 Journal</h2><div class="card"><i>${p}</i><textarea id="jT" placeholder="Write whatever you need to..."></textarea><button class="b" id="jS">Save entry</button><button class="b l" id="jP">Another prompt</button></div>${D.journal.slice().reverse().map((e,i)=>`<div class="card"><span class="muted">${esc(e.d)} · ${esc(e.p)}</span><br>${esc(e.t).replace(/\n/g,'<br>')}<br><button class="b l" data-dj="${D.journal.length-1-i}">Delete</button></div>`).join('')}`}
 if(tab==='plan')return `<h2>🛟 My safety plan</h2><p class="muted">Fill this in when you feel calmer, so it's ready when things get hard. It's based on the widely used Stanley-Brown safety planning steps. You could make it with a counsellor or someone you trust.</p>${STEPS.map(s=>`<div class="card"><b>${s[1]}</b><br><span class="muted">${s[2]}</span><textarea data-p="${s[0]}">${esc(D.plan[s[0]])}</textarea></div>`).join('')}<div class="card"><b>24/7 help</b><br>Lifeline 13 11 14 · text 0477 13 11 14 · Suicide Call Back Service 1300 659 467 · Emergency 000</div><button class="b" id="pPr">🖨️ Print / save my plan</button>`;
 if(tab==='calm')return `<h2>🫧 Breathe & ground</h2><div class="card" style="text-align:center"><b>Box breathing</b><div class="breath"></div><div id="brT" style="font-size:20px;color:#3b5a7a">Breathe in… 4</div><span class="muted">In for 4 · hold for 4 · out for 4 · hold for 4</span><br><button class="b l" id="pad">${D.pad?'🔈 Soft ambient sound: ON':'🔇 Soft ambient sound: OFF'}</button></div>
  <div class="card"><b>5-4-3-2-1 grounding</b><div id="gr"></div><button class="b" id="grN">Next</button></div>`;
 if(tab==='jar')return `<h2>🫙 Reasons to stay</h2><div class="card"><input id="rT" placeholder="A reason, big or small (my dog, seeing the ocean again, my sister...)"><button class="b" id="rA">Add to jar</button><button class="b l" id="rD">✨ Pull out a reason</button><div id="rShow" style="font-size:22px;color:#3b5a7a;margin-top:8px"></div></div><div class="card">${D.reasons.length?D.reasons.map((r,i)=>`🫙 ${esc(r)} <a href="#" data-dr="${i}" class="muted">remove</a>`).join('<br>'):'<span class="muted">Your jar is empty. Add one small reason today.</span>'}</div>`;
 if(tab==='hope')return `<h2>💌 Hope box</h2><p class="muted">Keep things that lift you: kind messages, memories, quotes, songs, plans, links to photos.</p><div class="card"><textarea id="hT" placeholder="Something hopeful to keep..."></textarea><button class="b" id="hA">Keep it</button></div>${D.hope.slice().reverse().map((h,i)=>`<div class="card">💌 ${esc(h.t).replace(/\n/g,'<br>')}<br><span class="muted">${esc(h.d)}</span> <a href="#" data-dh="${D.hope.length-1-i}" class="muted">remove</a></div>`).join('')}`;
 if(tab==='set')return `<h2>🔒 Privacy</h2><div class="card">Everything is saved <b>only in this browser on this device</b>. Nothing is uploaded or sent anywhere. Clearing your browser data will also delete it.</div><div class="card"><b>PIN lock</b> ${D.pin?'(on)':'(off)'}<input id="pinI" inputmode="numeric" maxlength="8" placeholder="Choose a 4–8 digit PIN"><button class="b" id="pinS">${D.pin?'Change PIN':'Set PIN'}</button>${D.pin?'<button class="b l" id="pinO">Turn PIN off</button><button class="b l" id="lockNow">Lock now</button>':''}<p class="muted">A PIN keeps casual eyes out, but it is not strong security. If you forget it you can choose Clear all on the lock screen.</p></div><div class="card"><b>Clear all</b><br><button class="b" style="background:#a33" id="clr">🗑 Delete everything</button></div><div class="card muted">${NOTE}</div>`}
function render(){ui.innerHTML=nav()+view();ui.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;render();ui.scrollTop=0});const q=s=>ui.querySelector(s);let mv=null;
 ui.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mv=+b.dataset.m;ui.querySelectorAll('[data-m]').forEach(z=>z.classList.remove('on'));b.classList.add('on')});
 if(q('#mSave'))q('#mSave').onclick=()=>{if(mv===null){alert('Tap a face first');return}const n=q('#mNote').value;D.moods.push({v:mv,d:today(),n});save();crisisCheck(n);if(mv===0)showHelp(true);render()};
 if(q('#mNote'))q('#mNote').oninput=e=>crisisCheck(e.target.value);
 if(q('#jT')){q('#jT').oninput=e=>crisisCheck(e.target.value);q('#jS').onclick=()=>{const v=q('#jT').value.trim();if(!v)return;D.journal.push({d:today(),p:PROMPTS[D.journal.length%PROMPTS.length],t:v});save();crisisCheck(v);render()};q('#jP').onclick=()=>{D.journal.length;PROMPTS.push(PROMPTS.shift());render()}}
 ui.querySelectorAll('[data-dj]').forEach(b=>b.onclick=()=>{if(confirm('Delete this entry?')){D.journal.splice(+b.dataset.dj,1);save();render()}});
 ui.querySelectorAll('[data-p]').forEach(t=>t.oninput=()=>{D.plan[t.dataset.p]=t.value;save();crisisCheck(t.value)});
 if(q('#pPr'))q('#pPr').onclick=()=>{pr.innerHTML='<h2>My Safety Plan</h2>'+STEPS.map(s=>'<h3>'+s[1]+'</h3><p>'+esc(D.plan[s[0]]||'').replace(/\n/g,'<br>')+'</p>').join('')+'<h3>24/7 help</h3><p>'+HELP.map(h=>h[1]+': '+h[2]).join('<br>')+'</p><p style="font-size:11px">'+NOTE+'</p>';try{window.print()}catch(e){}};
 if(q('#pad'))q('#pad').onclick=()=>{D.pad=!D.pad;save();D.pad?padOn():padOff();render()};
 if(q('#grN')){let gi=0;const GR=['👀 Name 5 things you can see.','✋ Name 4 things you can touch or feel.','👂 Name 3 things you can hear.','👃 Name 2 things you can smell.','👅 Name 1 thing you can taste, or one good thing about you.','🤍 Well done. Notice your feet on the ground, and breathe slowly.'];const gr=q('#gr');gr.textContent=GR[0];q('#grN').onclick=()=>{gi=(gi+1)%GR.length;gr.textContent=GR[gi]}}
 if(q('#rA')){q('#rA').onclick=()=>{const v=q('#rT').value.trim();if(v){D.reasons.push(v);save();render()}};q('#rD').onclick=()=>{q('#rShow').textContent=D.reasons.length?'🤍 '+D.reasons[Math.floor(Math.random()*D.reasons.length)]:'Add a reason first, even a small one.'};q('#rT').oninput=e=>crisisCheck(e.target.value)}
 ui.querySelectorAll('[data-dr]').forEach(a=>a.onclick=e=>{e.preventDefault();D.reasons.splice(+a.dataset.dr,1);save();render()});
 if(q('#hA')){q('#hA').onclick=()=>{const v=q('#hT').value.trim();if(v){D.hope.push({t:v,d:today()});save();render()}};q('#hT').oninput=e=>crisisCheck(e.target.value)}
 ui.querySelectorAll('[data-dh]').forEach(a=>a.onclick=e=>{e.preventDefault();D.hope.splice(+a.dataset.dh,1);save();render()});
 if(q('#pinS'))q('#pinS').onclick=()=>{const v=q('#pinI').value.trim();if(!/^\d{4,8}$/.test(v)){alert('Use 4 to 8 digits');return}D.pin=hash(v);save();alert('PIN set');render()};
 if(q('#pinO'))q('#pinO').onclick=()=>{D.pin='';save();render()};if(q('#lockNow'))q('#lockNow').onclick=lock;
 if(q('#clr'))q('#clr').onclick=clearAll}
function hash(s){let h=5381;for(const ch of 'ss'+s)h=((h<<5)+h+ch.charCodeAt(0))|0;return 'h'+h}
function clearAll(){if(confirm('Delete ALL your check-ins, journal, safety plan, reasons and hope box from this device? This cannot be undone.')){try{localStorage.removeItem(SK)}catch(e){}D={moods:[],journal:[],plan:{},reasons:[],hope:[],pin:'',pad:false};lk.style.display='none';tab='home';render()}}
function lock(){lk.innerHTML='<div style="font-size:40px">🔒</div><p>Enter your PIN</p><input id="lkI" type="password" inputmode="numeric" style="font-size:22px;padding:8px;border-radius:10px;border:1px solid #c9d6e6;text-align:center;width:180px"><p><button id="lkB" style="background:#3b5a7a;color:#fff;border:0;border-radius:10px;padding:8px 18px;font:600 15px system-ui">Unlock</button></p><p><a href="#" id="lkC" style="font-size:13px;color:#a33">Forgot PIN? Clear all data</a></p><p style="font-size:13px">Need help now? Lifeline 13 11 14 · Emergency 000</p>';lk.style.display='flex';
 const go=()=>{if(hash(lk.querySelector('#lkI').value)===D.pin){lk.style.display='none';render()}else{lk.querySelector('#lkI').value='';lk.querySelector('p').textContent='Not quite. Try again.'}};lk.querySelector('#lkB').onclick=go;lk.querySelector('#lkI').onkeydown=e=>{if(e.key==='Enter')go()};lk.querySelector('#lkC').onclick=e=>{e.preventDefault();clearAll()}}
// breathing label
setInterval(()=>{const e=document.getElementById('brT');if(!e)return;const s=Math.floor(Date.now()/1000)%16;e.textContent=['Breathe in…','Hold…','Breathe out…','Hold…'][Math.floor(s/4)]+' '+(4-s%4)},250);
// ambient pad (optional)
let pad=null;function padOn(){if(pad)return;try{window._AC=window._AC||new AudioContext();const A=window._AC;A.resume();const g=A.createGain();g.gain.setValueAtTime(0,A.currentTime);g.gain.linearRampToValueAtTime(.05,A.currentTime+3);const lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;lp.connect(g);g.connect(A.destination);const os=[110,164.81,220,277.18].map((f,i)=>{const o=A.createOscillator();o.type='sine';o.frequency.value=f;o.detune.value=(i-1.5)*5;o.connect(lp);o.start();return o});pad={g,os}}catch(e){}}
function padOff(){if(!pad)return;try{const A=window._AC;pad.g.gain.linearRampToValueAtTime(0,A.currentTime+1.5);const p=pad;setTimeout(()=>p.os.forEach(o=>o.stop()),1700)}catch(e){}pad=null}
function update(){place()}function draw(){x.fillStyle='#e9eff8';x.fillRect(0,0,900,600)}
window.startMusic=function(){};bindInput({});render();if(D.pin)lock();addEventListener('resize',place);place();startLoop();
window.SS={D:()=>D,showHelp,crisisCheck,render,lock,clearAll,go:t=>{tab=t;render()},CRISIS};
