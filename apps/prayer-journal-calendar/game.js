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

const PC_V=[["Philippians 4:6-7 (WEB)", "In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus."], ["1 Thessalonians 5:16-18 (WEB)", "Rejoice always. Pray without ceasing. In everything give thanks, for this is the will of God in Christ Jesus toward you."], ["Psalms 145:18 (WEB)", "Yahweh is near to all those who call on him, to all who call on him in truth."], ["Jeremiah 29:12 (WEB)", "You shall call on me, and you shall go and pray to me, and I will listen to you."], ["Matthew 7:7 (WEB)", "“Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you."], ["James 5:16 (WEB)", "Confess your offenses to one another, and pray for one another, that you may be healed. The insistent prayer of a righteous person is powerfully effective."], ["1 John 5:14 (WEB)", "This is the boldness which we have toward him, that, if we ask anything according to his will, he listens to us."], ["Psalms 107:1 (WEB)", "Give thanks to Yahweh, for he is good, for his loving kindness endures forever."], ["Psalms 118:24 (WEB)", "This is the day that Yahweh has made. We will rejoice and be glad in it!"], ["Lamentations 3:22-23 (WEB)", "It is because of Yahweh’s loving kindnesses that we are not consumed, because his compassion doesn’t fail. They are new every morning. Great is your faithfulness."], ["Psalms 46:1 (WEB)", "God is our refuge and strength, a very present help in trouble."], ["Isaiah 41:10 (WEB)", "Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness."], ["Romans 12:12 (WEB)", "rejoicing in hope; enduring in troubles; continuing steadfastly in prayer;"], ["Colossians 4:2 (WEB)", "Continue steadfastly in prayer, watching therein with thanksgiving;"], ["Psalms 55:22 (WEB)", "Cast your burden on Yahweh, and he will sustain you. He will never allow the righteous to be moved."], ["Matthew 6:6 (WEB)", "But you, when you pray, enter into your inner room, and having shut your door, pray to your Father who is in secret, and your Father who sees in secret will reward you openly."], ["Mark 11:24 (WEB)", "Therefore I tell you, all things whatever you pray and ask for, believe that you have received them, and you shall have them."], ["Psalms 34:4 (WEB)", "I sought Yahweh, and he answered me, and delivered me from all my fears."], ["Psalms 100:4 (WEB)", "Enter into his gates with thanksgiving, into his courts with praise. Give thanks to him, and bless his name."], ["Ephesians 6:18 (WEB)", "with all prayer and requests, praying at all times in the Spirit, and being watchful to this end in all perseverance and requests for all the saints:"], ["Psalms 5:3 (WEB)", "Yahweh, in the morning you shall hear my voice. In the morning I will lay my requests before you, and will watch expectantly."], ["Psalms 17:6 (WEB)", "I have called on you, for you will answer me, God. Turn your ear to me. Hear my speech."], ["Isaiah 40:31 (WEB)", "But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint."], ["Proverbs 3:5-6 (WEB)", "Trust in Yahweh with all your heart, and don’t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight."], ["Psalms 23:1-3 (WEB)", "Yahweh is my shepherd: I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He guides me in the paths of righteousness for his name’s sake."], ["Romans 8:28 (WEB)", "We know that all things work together for good for those who love God, to those who are called according to his purpose."], ["1 Peter 5:7 (WEB)", "casting all your worries on him, because he cares for you."], ["Jeremiah 33:3 (WEB)", "‘Call to me, and I will answer you, and will show you great and difficult things, which you don’t know.’"], ["Psalms 66:19-20 (WEB)", "But most certainly, God has listened. He has heard the voice of my prayer. Blessed be God, who has not turned away my prayer, nor his loving kindness from me."], ["John 14:27 (WEB)", "Peace I leave with you. My peace I give to you; not as the world gives, give I to you. Don’t let your heart be troubled, neither let it be fearful."], ["Psalms 9:1 (WEB)", "I will give thanks to Yahweh with my whole heart. I will tell of all your marvelous works."]];
const DEMO=!!window.DEMO,SK=DEMO?'prayercalDemo':'prayercalSave',LIMIT=10;
let S={e:{},req:[],remind:'20:00',remOn:1,lastRem:''};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const MOODS=[['joyful','😊','#f5c542'],['grateful','🙏','#5cb85c'],['peaceful','🕊️','#5bc0de'],['hopeful','🌱','#9b7ad8'],['tired','😴','#a0a0a0'],['sad','😢','#4a78c8'],['anxious','😟','#e8813a'],['struggling','💔','#d9534f']];
const MC=Object.fromEntries(MOODS.map(m=>[m[0],m]));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const pad=n=>String(n).padStart(2,'0');const key=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const fromKey=k=>{const[a,b,c]=k.split('-').map(Number);return new Date(a,b-1,c)};
const nice=k=>fromKey(k).toLocaleDateString([],{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const now=new Date();let vy=now.getFullYear(),vm=now.getMonth(),tab='cal',sel=null,q='';
function verse(d){d=d||new Date();const st=new Date(d.getFullYear(),0,0);const doy=Math.floor((d-st)/864e5);return PC_V[doy%PC_V.length]}
function count(){return Object.keys(S.e).length}
function streak(){let n=0,d=new Date();if(!S.e[key(d)])d.setDate(d.getDate()-1);while(S.e[key(d)]){n++;d.setDate(d.getDate()-1)}return n}
function best(){const ks=Object.keys(S.e).sort();let b=0,c=0,p=null;for(const k of ks){const d=fromKey(k);c=(p&&(d-p)/864e5<1.5)?c+1:1;b=Math.max(b,c);p=d}return b}
const css=document.createElement('style');css.textContent=`#pc{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,96vw);height:min(86vh,760px);background:#fffaf2;border-radius:22px;box-shadow:0 10px 50px #000a;font:15px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#3a2a20;flex-direction:column;overflow:hidden}
#pc .hd{background:linear-gradient(#f7e3c8,#f2d4b0);padding:10px 14px;display:flex;align-items:center;gap:8px}#pc .hd b{flex:1;font:bold 19px Georgia,serif;color:#5a3020}
#pc button{font:inherit;cursor:pointer;border:1px solid #d8b890;background:#fff;color:#7a4a20;border-radius:12px;padding:5px 11px}#pc button.p{background:#b8683a;color:#fff;border-color:#b8683a}
#pc .bd{flex:1;overflow:auto;padding:12px 14px}#pc .tabs{display:flex;justify-content:space-around;border-top:1px solid #e8d4b8;background:#fbf0e0;padding:6px 2px;flex-wrap:wrap;gap:2px}#pc .tabs button{border:0;background:none}#pc .tabs button.on{font-weight:bold;color:#b8683a}
#pc .vs{background:#fff3d6;border-left:4px solid #d8a840;border-radius:8px;padding:8px 10px;font-style:italic;margin-bottom:10px}
#pc .grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}#pc .dw{text-align:center;font-size:12px;color:#a08060;font-weight:bold}
#pc .day{min-height:58px;background:#fff;border:1px solid #ecd8bc;border-radius:10px;padding:3px 5px;cursor:pointer;position:relative;font-size:13px}#pc .day.td{border:2px solid #b8683a}#pc .day.off{opacity:.25;cursor:default}#pc .day.lk{opacity:.45}
#pc .dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-top:4px}#pc .day .mo{position:absolute;right:4px;bottom:2px;font-size:16px}#pc .day .an{position:absolute;right:4px;top:2px;font-size:11px}
#pc .card{background:#fff;border:1px solid #ecd8bc;border-radius:12px;padding:9px 11px;margin:8px 0}
#pc textarea,#pc input[type=text],#pc input[type=search]{width:100%;box-sizing:border-box;border:1px solid #d8b890;border-radius:10px;padding:7px;font:inherit;margin:3px 0 8px;background:#fffdf8}#pc textarea{min-height:58px}
#pc label{font-weight:bold;color:#7a4a20;font-size:13px}#pc .mood{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0 10px}#pc .mood button.on{outline:3px solid #b8683a}
#pc .st{display:flex;gap:8px;flex-wrap:wrap}#pc .st div{flex:1;min-width:110px;background:#fff;border:1px solid #ecd8bc;border-radius:12px;padding:8px;text-align:center}#pc .st b{display:block;font-size:22px;color:#b8683a}
#pc .lock{background:#fff0e0;border:1px dashed #d8a070;border-radius:10px;padding:8px;margin:8px 0;font-size:13px}
#pcToast{position:fixed;z-index:95;left:50%;top:14px;transform:translateX(-50%);background:#fffaf2;color:#5a3020;border:2px solid #d8a840;border-radius:16px;padding:10px 14px;font:14px system-ui,sans-serif;box-shadow:0 4px 20px #0005;display:none;max-width:90vw}
#pcPrint{display:none}
@media print{body>*:not(#pcPrint){display:none!important}#pcPrint{display:block!important;font:12px Georgia,serif;color:#000}#pcPrint table{width:100%;border-collapse:collapse}#pcPrint td{border:1px solid #999;vertical-align:top;height:80px;width:14.28%;padding:3px;font-size:10px}#pcPrint th{font-size:11px}}`;document.head.appendChild(css);
const pc=document.createElement('div');pc.id='pc';document.body.appendChild(pc);
const toastEl=document.createElement('div');toastEl.id='pcToast';document.body.appendChild(toastEl);
const pr=document.createElement('div');pr.id='pcPrint';document.body.appendChild(pr);
function toast(h,ms){toastEl.innerHTML=h;toastEl.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>toastEl.style.display='none',ms||7000)}
function allowed(y,m){return !DEMO||(y===now.getFullYear()&&m===now.getMonth())}
function shell(title,body){pc.innerHTML='<div class="hd"><b>'+title+'</b><button id="cx">✕</button></div><div class="bd">'+body+'</div><div class="tabs">'+[['cal','📅 Calendar'],['req','🙏 Requests'],['rev','📊 Review'],['find','🔍 Search'],['set','🔔 Reminders']].map(t=>'<button data-t="'+t[0]+'" class="'+(tab===t[0]?'on':'')+'">'+t[1]+'</button>').join('')+'</div>';
 pc.querySelector('#cx').onclick=closeApp;pc.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;sel=null;render()});pc.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('keydown',e=>e.stopPropagation()))}
function render(){if(sel)return renderDay();({cal:renderCal,req:renderReq,rev:renderRev,find:renderFind,set:renderSet})[tab]()}
function upsell(m){return '<div class="lock">🔒 '+m+' <button class="p" data-up>Get the full app</button></div>'}
function wireUp(m){pc.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>window.demoEnd&&window.demoEnd(m||'The full <b>Coffeebreak Prayer Journal Calendar</b> has every month and unlimited entries.'))}
function renderCal(){const v=verse(),f=new Date(vy,vm,1),dim=new Date(vy,vm+1,0).getDate(),off=(f.getDay()+6)%7,tk=key(now);
 let g='<div class="vs">📖 <b>Verse of the day</b><br>“'+esc(v[1])+'”<br><small>— '+esc(v[0])+'</small></div>';
 g+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><button id="pv">◀</button><b style="flex:1;text-align:center;font:bold 18px Georgia">'+MN[vm]+' '+vy+'</b><button id="nx">▶</button></div>';
 if(!allowed(vy,vm))g+=upsell('The free demo shows the current month only.');
 g+='<div class="grid">'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>'<div class="dw">'+d+'</div>').join('');
 for(let i=0;i<off;i++)g+='<div></div>';
 for(let d=1;d<=dim;d++){const k=key(new Date(vy,vm,d)),e=S.e[k],m=e&&MC[e.mood],ans=S.req.some(r=>r.a===k);
  g+='<div class="day'+(k===tk?' td':'')+(allowed(vy,vm)?'':' lk')+'" data-k="'+k+'">'+d+(e?'<br><span class="dot" style="background:'+(m?m[2]:'#c8a070')+'"></span>':'')+(m?'<span class="mo">'+m[1]+'</span>':'')+(ans?'<span class="an">🙌</span>':'')+'</div>'}
 g+='</div><div class="st" style="margin-top:10px"><div><b>🔥 '+streak()+'</b>day streak</div><div><b>⭐ '+best()+'</b>best streak</div><div><b>📔 '+count()+(DEMO?' / '+LIMIT:'')+'</b>entries</div></div>';
 g+='<p style="font-size:12px;color:#a08060">'+MOODS.map(m=>'<span class="dot" style="background:'+m[2]+';width:9px;height:9px"></span> '+m[0]).join(' &nbsp; ')+'</p><button id="prt">🖨️ Print / save month as PDF</button> <button id="png">🖼️ Export month as PNG</button>';
 shell('📅 Prayer Journal Calendar',g);wireUp();
 pc.querySelector('#pv').onclick=()=>{vm--;if(vm<0){vm=11;vy--}render()};pc.querySelector('#nx').onclick=()=>{vm++;if(vm>11){vm=0;vy++}render()};
 pc.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{if(!allowed(vy,vm))return window.demoEnd&&window.demoEnd('The free demo shows the current month only.');sel=b.dataset.k;render()});
 pc.querySelector('#prt').onclick=()=>printMonth();pc.querySelector('#png').onclick=()=>pngMonth()}
function renderDay(){const k=sel,e=S.e[k]||{p:'',g:'',ppl:'',mood:''};let mood=e.mood;const isNew=!S.e[k],lock=DEMO&&isNew&&count()>=LIMIT;
 let b='<div style="font:bold 17px Georgia;margin-bottom:6px">'+nice(k)+'</div>';
 if(lock)b+=upsell('The free demo holds '+LIMIT+' journal entries. The full app is unlimited.');
 b+='<label>🙏 My prayer</label><textarea id="fp" maxlength="4000">'+esc(e.p)+'</textarea><label>💛 I\'m grateful for</label><textarea id="fg" maxlength="2000">'+esc(e.g)+'</textarea><label>👥 People I prayed for</label><input type="text" id="fl" maxlength="500" value="'+esc(e.ppl)+'" placeholder="Names, separated by commas"><label>Mood</label><div class="mood">'+MOODS.map(m=>'<button data-m="'+m[0]+'" class="'+(mood===m[0]?'on':'')+'" style="border-color:'+m[2]+'">'+m[1]+' '+m[0]+'</button>').join('')+'</div>';
 b+='<button class="p" id="sv"'+(lock?' disabled':'')+'>💾 Save entry</button> <button id="bk">◀ Back</button>'+(isNew?'':' <button id="dl">🗑 Delete</button>');
 const ans=S.req.filter(r=>r.a===k);if(ans.length)b+='<div class="card">🙌 <b>Answered this day:</b> '+ans.map(r=>esc(r.t)).join(', ')+'</div>';
 shell('📔 Journal entry',b);wireUp('The free demo holds '+LIMIT+' journal entries. The full <b>Coffeebreak Prayer Journal Calendar</b> is unlimited.');
 pc.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>{mood=mood===x.dataset.m?'':x.dataset.m;pc.querySelectorAll('[data-m]').forEach(y=>y.classList.toggle('on',y.dataset.m===mood))});
 pc.querySelector('#bk').onclick=()=>{sel=null;render()};
 const dl=pc.querySelector('#dl');if(dl)dl.onclick=()=>{if(confirm('Delete this entry?')){delete S.e[k];save();sel=null;render()}};
 pc.querySelector('#sv').onclick=()=>{if(lock)return;const n={p:pc.querySelector('#fp').value.trim(),g:pc.querySelector('#fg').value.trim(),ppl:pc.querySelector('#fl').value.trim(),mood};if(!n.p&&!n.g&&!n.ppl&&!n.mood)return toast('Write something first 💛',3000);S.e[k]=n;save();startMusic();sel=null;toast('Saved 💛 '+(streak()>1?'🔥 '+streak()+' day streak!':''),3000);render()}}
function saveEntry(k,n){if(DEMO&&!S.e[k]&&count()>=LIMIT)return false;S.e[k]=n;save();return true}
function renderReq(){let b='<div class="card"><label>New prayer request</label><input type="text" id="rt" maxlength="300" placeholder="What are you asking God for?"><button class="p" id="ra">➕ Add request</button></div>';
 const open=S.req.filter(r=>!r.a),done=S.req.filter(r=>r.a);
 b+='<h3 style="margin:8px 0 2px">Waiting ('+open.length+')</h3>'+(open.length?'':'<p style="color:#a08060">No open requests.</p>')+open.map(r=>'<div class="card"><b>'+esc(r.t)+'</b><br><small style="color:#a08060">Asked '+nice(r.d)+'</small><br><button class="p" data-a="'+r.id+'">🙌 Mark answered</button> <button data-x="'+r.id+'">🗑</button></div>').join('');
 b+='<h3 style="margin:12px 0 2px">Answered 🙌 ('+done.length+')</h3>'+done.map(r=>'<div class="card">🙌 <b style="color:#2a8a4a">'+esc(r.t)+'</b><br><small style="color:#a08060">Asked '+nice(r.d)+' · Answered '+nice(r.a)+'</small><br><button data-u="'+r.id+'">↩ Undo</button> <button data-x="'+r.id+'">🗑</button></div>').join('');
 shell('🙏 Prayer requests',b);
 pc.querySelector('#ra').onclick=()=>{const t=pc.querySelector('#rt').value.trim();if(t){addReq(t);render()}};
 pc.querySelectorAll('[data-a]').forEach(x=>x.onclick=()=>{answer(+x.dataset.a);toast('🙌 Praise God! Marked answered on '+nice(key(new Date())),4000);render()});
 pc.querySelectorAll('[data-u]').forEach(x=>x.onclick=()=>{S.req.find(r=>r.id==x.dataset.u).a='';save();render()});
 pc.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{if(confirm('Delete this request?')){S.req=S.req.filter(r=>r.id!=x.dataset.x);save();render()}})}
function addReq(t){S.req.push({id:Date.now()+Math.random(),t,d:key(new Date()),a:''});save()}
function answer(id){const r=S.req.find(r=>r.id==id);if(r){r.a=key(new Date());save()}}
function monthData(y,m){const p=y+'-'+pad(m+1)+'-';return Object.keys(S.e).filter(k=>k.startsWith(p)).sort().map(k=>[k,S.e[k]])}
function renderRev(){if(!allowed(vy,vm)){vy=now.getFullYear();vm=now.getMonth()}const L=monthData(vy,vm),dim=new Date(vy,vm+1,0).getDate(),p=vy+'-'+pad(vm+1)+'-';
 const mc={};L.forEach(([k,e])=>{if(e.mood)mc[e.mood]=(mc[e.mood]||0)+1});const ppl={};L.forEach(([k,e])=>(e.ppl||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(n=>ppl[n]=(ppl[n]||0)+1));
 const ans=S.req.filter(r=>r.a&&r.a.startsWith(p)),asked=S.req.filter(r=>r.d.startsWith(p));
 let b='<div style="display:flex;align-items:center;gap:8px"><button id="pv">◀</button><b style="flex:1;text-align:center;font:bold 18px Georgia">'+MN[vm]+' '+vy+' review</b><button id="nx">▶</button></div>';
 b+='<div class="st" style="margin:10px 0"><div><b>'+L.length+'/'+dim+'</b>days journalled</div><div><b>'+asked.length+'</b>requests made</div><div><b>🙌 '+ans.length+'</b>prayers answered</div></div>';
 b+='<div class="card"><b>Moods</b><br>'+(Object.keys(mc).length?Object.entries(mc).sort((a,b)=>b[1]-a[1]).map(([m,n])=>MC[m][1]+' '+m+' ×'+n).join(' · '):'No moods yet')+'</div>';
 b+='<div class="card"><b>👥 People you prayed for</b><br>'+(Object.keys(ppl).length?Object.entries(ppl).map(([n,c])=>esc(n)+(c>1?' ×'+c:'')).join(', '):'—')+'</div>';
 b+='<div class="card"><b>💛 Gratitude</b>'+(L.filter(x=>x[1].g).map(([k,e])=>'<div style="font-size:13px;margin-top:3px">'+fromKey(k).getDate()+': '+esc(e.g)+'</div>').join('')||'<br>—')+'</div>';
 b+='<div class="card"><b>🙌 Answered</b>'+(ans.map(r=>'<div style="font-size:13px">'+esc(r.t)+' ('+nice(r.a)+')</div>').join('')||'<br>—')+'</div>';
 shell('📊 Month review',b);pc.querySelector('#pv').onclick=()=>{if(!allowed(vm?vy:vy-1,vm?vm-1:11))return window.demoEnd&&window.demoEnd('The free demo shows the current month only.');vm--;if(vm<0){vm=11;vy--}render()};pc.querySelector('#nx').onclick=()=>{if(!allowed(vm<11?vy:vy+1,vm<11?vm+1:0))return window.demoEnd&&window.demoEnd('The free demo shows the current month only.');vm++;if(vm>11){vm=0;vy++}render()}}
function search(s){s=s.toLowerCase().trim();if(!s)return[];const R=[];for(const k of Object.keys(S.e).sort().reverse()){const e=S.e[k];if([e.p,e.g,e.ppl,e.mood].join(' ').toLowerCase().includes(s))R.push({k,e})}S.req.forEach(r=>{if(r.t.toLowerCase().includes(s))R.push({r})});return R}
function renderFind(){const R=search(q);let b='<input type="search" id="q" placeholder="Search prayers, gratitude, names, moods…" value="'+esc(q)+'"><div id="res">'+(q?(R.length?R.map(x=>x.r?'<div class="card">🙏 <b>'+esc(x.r.t)+'</b> '+(x.r.a?'🙌 answered '+nice(x.r.a):'(waiting)')+'</div>':'<div class="card" data-k="'+x.k+'" style="cursor:pointer"><b>'+nice(x.k)+'</b> '+(MC[x.e.mood]?MC[x.e.mood][1]:'')+'<br><small>'+esc((x.e.p||x.e.g||x.e.ppl).slice(0,160))+'</small></div>').join(''):'<p>No matches.</p>'):'<p style="color:#a08060">Type to search your journal.</p>')+'</div>';
 shell('🔍 Search',b);const i=pc.querySelector('#q');i.focus();i.setSelectionRange(q.length,q.length);i.oninput=()=>{q=i.value;render()};
 pc.querySelectorAll('[data-k]').forEach(x=>x.onclick=()=>{const d=fromKey(x.dataset.k);vy=d.getFullYear();vm=d.getMonth();sel=x.dataset.k;tab='cal';render()})}
function renderSet(){let b='<div class="card"><label><input type="checkbox" id="on" '+(S.remOn?'checked':'')+'> Gentle reminders while the app is open</label><br><br><label>Remind me at</label> <input type="time" id="tm" value="'+S.remind+'"><p style="font-size:13px;color:#a08060">If you haven\'t written today\'s entry, a soft note will appear at this time (and once when you open the app after it). Reminders only work while the app is open; nothing is sent anywhere.</p><button id="ts">Preview a reminder</button></div><div class="card" style="font-size:13px">🔒 Your journal is saved on this device only. Clearing your browser data will erase it.</div>';
 shell('🔔 Reminders',b);pc.querySelector('#on').onchange=e=>{S.remOn=e.target.checked?1:0;save()};pc.querySelector('#tm').onchange=e=>{S.remind=e.target.value||'20:00';S.lastRem='';save()};pc.querySelector('#ts').onclick=()=>remindNow(1)}
const REM=['A quiet moment with God is waiting for you 💛','How was your heart today? Your journal is ready 🙏','What are you grateful for today? 🌸','Take a breath. Who would you like to pray for today? 🕊️'];
function remindNow(force){const v=verse();toast('🔔 <b>'+REM[Math.random()*REM.length|0]+'</b><br><small>“'+esc(v[1].slice(0,120))+(v[1].length>120?'…':'')+'” — '+esc(v[0])+'</small> <button onclick="window.PC.write()" style="margin-left:6px">Write now</button>',10000)}
function checkRem(){if(!S.remOn)return;const d=new Date(),tk=key(d);if(S.e[tk]||S.lastRem===tk)return;const hm=pad(d.getHours())+':'+pad(d.getMinutes());if(hm>=S.remind){S.lastRem=tk;save();remindNow()}}
setInterval(checkRem,30000);setTimeout(checkRem,4000);
function monthHTML(){const f=new Date(vy,vm,1),dim=new Date(vy,vm+1,0).getDate(),off=(f.getDay()+6)%7;let h='<h2 style="text-align:center">'+MN[vm]+' '+vy+' · Coffeebreak Prayer Journal</h2><table><tr>'+['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>'<th>'+d+'</th>').join('')+'</tr><tr>';let c=0;
 for(;c<off;c++)h+='<td></td>';for(let d=1;d<=dim;d++,c++){if(c%7===0)h+='</tr><tr>';const k=key(new Date(vy,vm,d)),e=S.e[k];h+='<td><b>'+d+'</b> '+(e&&MC[e.mood]?MC[e.mood][1]:'')+(e?'<br>'+esc((e.p||'').slice(0,90))+(e.g?'<br>💛 '+esc(e.g.slice(0,60)):''):'')+'</td>'}h+='</tr></table>';
 const ans=S.req.filter(r=>r.a&&r.a.startsWith(vy+'-'+pad(vm+1)));if(ans.length)h+='<p>🙌 Answered: '+ans.map(r=>esc(r.t)).join(' · ')+'</p>';return h}
function printMonth(){pr.innerHTML=monthHTML();try{window.print()}catch(e){toast('Printing is not available here. Try the downloaded app.',4000)}}
function pngMonth(){const o=document.createElement('canvas');o.width=1400;o.height=1000;const k=x;x=o.getContext('2d');x.fillStyle='#fffaf2';x.fillRect(0,0,1400,1000);T(MN[vm]+' '+vy+' · Prayer Journal',700,60,40,'#5a3020','center');
 const f=new Date(vy,vm,1),dim=new Date(vy,vm+1,0).getDate(),off=(f.getDay()+6)%7,cw=190,ch=140;['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach((d,i)=>T(d,35+i*cw+cw/2,110,20,'#a08060','center'));
 for(let d=1;d<=dim;d++){const i=off+d-1,X=35+(i%7)*cw,Y=125+Math.floor(i/7)*ch,e=S.e[key(new Date(vy,vm,d))];x.fillStyle='#fff';rr(X+3,Y+3,cw-6,ch-6,12);x.fill();x.strokeStyle='#e0c8a8';x.lineWidth=2;x.stroke();T(String(d),X+14,Y+30,20,'#5a3020');
  if(e){const m=MC[e.mood];if(m){x.fillStyle=m[2];x.beginPath();x.arc(X+cw-24,Y+24,10,0,7);x.fill();emo(m[1],X+cw-26,Y+ch-26,26)}x.fillStyle='#3a2a20';x.font='14px Georgia';x.textAlign='left';wrapT((e.p||e.g||'').slice(0,70),X+12,Y+56,cw-30,17)}}
 const v=verse();T('“'+v[1].slice(0,110)+(v[1].length>110?'…':'')+'” — '+v[0],700,975,16,'#7a4a20','center','italic ');
 const url=o.toDataURL('image/png');x=k;const a=document.createElement('a');a.href=url;a.download='prayer-journal-'+vy+'-'+pad(vm+1)+'.png';document.body.appendChild(a);a.click();a.remove();toast('🖼️ Month saved as PNG',3000);return url}
function openApp(t){tab=t||'cal';sel=null;G.state='app';pc.style.display='flex';render()}
function closeApp(){pc.style.display='none';G.state='title'}
function write(){vy=now.getFullYear();vm=now.getMonth();openApp('cal');sel=key(new Date());render();toastEl.style.display='none'}
const pet=Array.from({length:40},()=>({x:Math.random()*900,y:Math.random()*600,s:Math.random()*3+2,v:Math.random()*20+10}));
function bg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#5a3a6a');g.addColorStop(1,'#1a0c18');x.fillStyle=g;x.fillRect(0,0,900,600);for(const p of pet){const y=(p.y+t*p.v)%620-10;x.globalAlpha=.35+.25*Math.sin(t+p.x);x.fillStyle='#ffd8a8';x.beginPath();x.arc(p.x+8*Math.sin(t+p.y),y,p.s,0,7);x.fill()}x.globalAlpha=1}
function cal(X,Y,sc){x.save();x.translate(X,Y);x.scale(sc,sc);x.fillStyle='#fffaf2';rr(-130,-100,260,210,18);x.fill();x.fillStyle='#b8683a';rr(-130,-100,260,44,18);x.fill();x.fillRect(-130,-70,260,14);
 x.fillStyle='#fff';x.font='bold 20px Georgia';x.textAlign='center';x.fillText(MN[now.getMonth()],0,-70);const cs=['#f5c542','#5cb85c','#5bc0de','#9b7ad8','#d9534f','#e8813a'];
 for(let i=0;i<35;i++){const cx=-117+(i%7)*34,cy=-40+Math.floor(i/7)*30;x.fillStyle="#f0e0c8";rr(cx,cy,30,25,5);x.fill();if((i*7)%5<2){x.fillStyle=cs[i%6];x.beginPath();x.arc(cx+15,cy+13,5,0,7);x.fill()}}x.textAlign='left';x.restore()}
function drawTitle(){bg();x.fillStyle='rgba(255,220,160,'+(.12+.06*Math.sin(t))+')';x.beginPath();x.arc(450,300,240,0,7);x.fill();cal(450,295,1.15);
 T('📅 Coffeebreak Prayer Journal Calendar',450,78,34,'#fff','center');T('Pray, give thanks, and watch God\'s faithfulness fill your calendar.',450,114,18,'#f0dcc8','center','italic ');
 button('st',240,480,200,52,'📔 Open my journal',()=>openApp('cal'),{fs:17,bg:'#6a3a2a',ac:'#ffc890'});button('rq',460,480,200,52,'🙏 Prayer requests',()=>openApp('req'),{fs:17,bg:'#6a3a2a',ac:'#ffc890'});
 T('🔥 '+streak()+' day streak · 📔 '+count()+' entries · saved on this device only',450,560,14,'#f0dcc8','center','');T(DEMO?'Free demo: this month only, '+LIMIT+' entries':'Full version: every month, unlimited entries',450,582,12,'#d0b8a8','center','')}
(function(){const o=document.createElement('canvas');o.width=300;o.height=240;const k=x;x=o.getContext('2d');cal(150,120,1);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);for(const k in BTN)delete BTN[k];if(G.state==='title'||G.state==='app')drawTitle();x.textAlign='left'}
window.PC={G,S,openApp,write,saveEntry,addReq,answer,search,streak,best,verse,monthHTML,pngMonth,remindNow,count};startLoop();
