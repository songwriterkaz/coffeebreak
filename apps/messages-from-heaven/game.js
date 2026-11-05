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
// ===== Coffeebreak Messages from Heaven =====
const DEMO=!!window.DEMO,SK=DEMO?'heavenDemo':'heavenSave',LIMIT=10;
let S={ones:[],cur:0,msgs:{},box:{},dates:[],letters:[],candles:0,lit:0,used:0,signDay:'',sign:null};
try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){alert('Storage is full — try smaller photos.')}};
const G={state:'title',score:0,level:0};window.G=G;
const NOTE='A loving remembrance space. Replies are comforting words inspired by your memories, not a real spirit.';
const HONEST='No AI is used. Replies are hand-written messages chosen by keywords and filled in with the memories you share.';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const pick=a=>a[Math.random()*a.length|0];
const today=()=>new Date().toDateString();
const H_C=/kill myself|suicid|end it all|end my life|want to die|join (you|them)|be with you soon|self harm|self-harm|hurt myself|no reason to live|better off dead|cut myself|can'?t go on/i;
const H_K={missing:['miss','missing','wish you were','gone','empty','without you','come back'],sorry:['sorry','forgive','regret','should have','guilt','apolog','didn\'t say'],thanks:['thank','grateful','thanks','appreciate'],birthday:['birthday','anniversary','christmas','mother\'s day','father\'s day','today would'],advice:['what should','advice','help me decide','should i','what do i do','don\'t know what','confused'],grief:['grief','grieving','cry','crying','sad','hurts','pain','broken','can\'t stop','tears','heart'],news:['guess what','news','got a','i got','new job','engaged','baby','graduated','passed','moved','married','we did it']};
const H_R={
missing:['Oh {nick}, I know. I miss you too, in my own way. Every time you feel that ache, that\'s just our love with nowhere to go. Let it go to the people around you. I\'m in every bit of it.','I\'m closer than you think, my love. Remember {memory}? Hold onto that. It\'s where you\'ll always find me.','Missing me means we had something beautiful. As I always said, "{saying}". I\'m still with you in it.','When you miss me, do something I loved. {loved}. I\'ll be smiling.'],
sorry:['There\'s nothing to forgive, {nick}. Love like ours never kept score. Please put that weight down.','I always knew your heart. The little things you wish you\'d said, I heard them anyway. {comfort}','Don\'t carry this, sweetheart. If I could, I\'d hold your face and say "{saying}". You did your best, and your best was more than enough.'],
thanks:['Thank YOU, {nick}. You gave me so much more than you know.','You don\'t need to thank me, but it makes my heart full to hear it. Remember {memory}? That was a gift to me too.','Gratitude looks good on you. Keep sharing it. That\'s how my love keeps going.'],
birthday:['Happy day, {nick}! Light a candle, have something sweet and think of {memory}. I\'m right there at the table.','Special days are the hardest and the sweetest. Make it a day I\'d have loved: {loved}.','I haven\'t forgotten what today means. Neither have you. That\'s love, still counting the days.'],
advice:['You already know more than you think, {nick}. What would I have said? Probably "{saying}". Trust your heart. I raised it well.','Take a breath. Sleep on it. Then do the kind thing and the brave thing. Those were usually the same thing.','{comfort} Whatever you choose, choose it with love and I\'ll be proud of you.'],
grief:['Let the tears come, {nick}. They\'re just love spilling over. {comfort}','Grief is heavy because the love was big. You don\'t have to be strong today. Be gentle with yourself.','Think of {memory}. Hold it close. That moment is still yours forever.','I know it hurts. Please lean on someone who can hug you today. I\'d want that for you.'],
news:['Oh, {nick}! I\'m bursting with pride! Tell everyone. I\'d be telling the whole street.','That\'s wonderful! I can just picture my face. You know I\'d say "{saying}".','See? I always knew you would. Celebrate properly, maybe with {loved}.'],
general:['I\'m listening, {nick}. Tell me everything, like you always did.','You\'re never really talking to an empty room. Every word is full of our love.','{comfort}','Remember {memory}? I think of it whenever you write to me.','Look after yourself today. Drink some water, get some sun and call someone who loves you. That\'s from me.','"{saying}." You know I\'d say it again.'],
crisis:['{nick}, I love you so much, and I need you to stay and be looked after. Please reach out to someone right now.']};
function fill(t,o){const r=(a,c)=>{const l=(a||'').split(c?/[,\n;]/:/[\n;]/).map(s=>s.trim()).filter(Boolean);return l.length?pick(l):''};
 return t.replace('{nick}',r(o.nick,1)||'my darling').replace('{saying}',r(o.saying)||'love you more').replace('{memory}',r(o.memory)||'all our happy times together').replace('{loved}',r(o.loved,1)||'something that makes you smile').replace('{comfort}',r(o.comfort)||'I\'m holding you in my heart, always.').replace('{name}',o.name||'')}
function topic(s){s=' '+s.toLowerCase()+' ';if(H_C.test(s))return 'crisis';let b='general',bn=0;for(const k in H_K){let n=0;for(const w of H_K[k])if(s.includes(w))n++;if(n>bn){bn=n;b=k}}return b}
function reply(s,o){const k=topic(s);return{k,t:fill(pick(H_R[k]),o||{})}}
const SIGNS=[['🪶','A white feather','A feather on your path is a little hello. Someone is thinking of you.'],['🦋','A butterfly','A butterfly reminds you that love changes shape but never ends.'],['🎵','A song','Today, play a song they loved and sing along, even badly.'],['🌈','A rainbow','After the rain comes colour. Look up today.'],['🐦','A robin','A small bird visiting means love is still nearby.'],['🌹','A rose','Notice a flower today and let it be from them.'],['⭐','A bright star','Tonight, find the brightest star and say goodnight.'],['🪙','A coin','A coin found by chance is a reminder that you are valued.']];
function sign(){if(S.signDay!==today()){let h=0;for(const ch of today())h=(h*31+ch.charCodeAt(0))>>>0;S.sign=h%SIGNS.length;S.signDay=today();save()}return SIGNS[S.sign]}
const CRISIS='<div class="cr">💛 It sounds like you\'re hurting deeply. Please talk to a real person now.<br><b>Lifeline: 13 11 14</b> (24/7) · <b>GriefLine: 1300 845 745</b> · Emergency: <b>000</b></div>';
const css=document.createElement('style');css.textContent=`#hv{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,95vw);height:min(86vh,760px);background:#1a1008;border-radius:28px;padding:10px;box-shadow:0 0 60px #ffb04055;font:15px/1.45 Georgia,serif}
#hv .scr{background:radial-gradient(ellipse at top,#3a2414,#140a06);border-radius:20px;height:100%;display:flex;flex-direction:column;overflow:hidden;color:#ffe9c7}
#hv .hd{padding:10px 12px;text-align:center;position:relative;border-bottom:1px solid #5a3a20}#hv .hd b{display:block;font-size:17px;color:#ffd890}#hv .hd small{color:#c8a880;font-size:11px}
#hv .bk{position:absolute;left:10px;top:12px;background:none;border:0;color:#ffd890;font-size:16px;cursor:pointer}
#hv .lst{flex:1;overflow:auto;padding:10px}#hv .b{max-width:80%;padding:8px 12px;border-radius:16px;margin:4px 0;white-space:pre-wrap;word-wrap:break-word}
#hv .me{background:#6a4020;margin-left:auto}#hv .lv{background:#fff4dc;color:#3a2410;box-shadow:0 0 14px #ffc06055;font-style:italic}
#hv .in{display:flex;gap:6px;padding:8px;border-top:1px solid #5a3a20}#hv input,#hv textarea,#hv select{border:1px solid #8a6040;background:#2a1a0e;color:#ffe9c7;border-radius:12px;padding:8px 10px;font:14px Georgia,serif;width:100%;box-sizing:border-box;margin:3px 0}
#hv .in input{flex:1;margin:0}#hv .btn{background:#d89a40;color:#2a1408;border:0;border-radius:14px;padding:8px 14px;font:bold 14px Georgia,serif;cursor:pointer;margin:3px 3px 0 0}
#hv .sm{font-size:12px;background:none;border:1px solid #a87a40;color:#ffd890;border-radius:10px;padding:3px 8px;cursor:pointer;margin:3px 3px 0 0}
#hv .note{font-size:10px;color:#c8a880;text-align:center;padding:4px 8px}#hv .cr{background:#3a1010;border:1px solid #c06060;border-radius:12px;padding:8px 10px;margin:6px 0;font-size:13px}
#hv .tabs{display:flex;flex-wrap:wrap;justify-content:space-around;border-top:1px solid #5a3a20;padding:4px 0}#hv .tabs button{background:none;border:0;color:#d8b890;font-size:12px;cursor:pointer;padding:3px}#hv .tabs button.on{color:#ffd890;font-weight:bold}
#hv .card{background:#2a1a0e;border:1px solid #5a3a20;border-radius:14px;padding:10px 12px;margin:8px 0}#hv .ph{width:70px;height:70px;object-fit:cover;border-radius:50%;border:2px solid #d89a40}
#hv .grid img{width:31%;margin:1%;border-radius:8px;aspect-ratio:1;object-fit:cover}
#hv .flame{font-size:54px;display:inline-block;animation:fl 1.2s infinite alternate;filter:drop-shadow(0 0 14px #ffb040)}@keyframes fl{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.08) rotate(3deg)}}
#hv .typ span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#d89a40;animation:td 1s infinite}#hv .typ span:nth-child(2){animation-delay:.2s}#hv .typ span:nth-child(3){animation-delay:.4s}@keyframes td{0%,100%{opacity:.3}50%{opacity:1}}`;
document.head.appendChild(css);
const hv=document.createElement('div');hv.id='hv';document.body.appendChild(hv);
let tab='chat',typing=false,editing=-1;
const cur=()=>S.ones[S.cur];
const TABS=[['chat','🕯️ Chat'],['ones','👤 Loved ones'],['candle','🔥 Candle'],['box','📦 Memories'],['dates','📅 Dates'],['letter','✉️ Letters'],['sign','🪶 Sign'],['help','💛 Support']];
function shell(title,sub,body,foot){hv.innerHTML='<div class="scr"><div class="hd"><button class="bk">✕</button><b>'+title+'</b><small>'+sub+'</small></div><div class="lst">'+body+'</div>'+(foot||'')+'<div class="note">'+NOTE+'</div><div class="tabs">'+TABS.map(t=>'<button data-t="'+t[0]+'" class="'+(tab===t[0]?'on':'')+'">'+t[1]+'</button>').join('')+'</div></div>';
 hv.querySelector('.bk').onclick=closeApp;hv.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;editing=-1;render()})}
function render(){({chat:rChat,ones:rOnes,candle:rCandle,box:rBox,dates:rDates,letter:rLetter,sign:rSign,help:rHelp})[tab]()}
function readImg(f,cb){if(!f)return cb('');const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c2=document.createElement('canvas'),m=360,s=Math.min(1,m/Math.max(im.width,im.height));c2.width=im.width*s;c2.height=im.height*s;c2.getContext('2d').drawImage(im,0,0,c2.width,c2.height);cb(c2.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(f)}
function rChat(){const o=cur();if(!o){tab='ones';return rOnes()}
 const L=S.msgs[o.id]||[];const left=LIMIT-S.used;
 shell((o.photo?'<img class="ph" style="width:40px;height:40px;vertical-align:middle" src="'+o.photo+'"> ':'🕯️ ')+esc(o.name),esc(o.rel||'Forever loved')+(DEMO?' · Demo: '+Math.max(0,left)+' messages left':''),
 (L.length?'':'<div class="card">Write to '+esc(o.name)+' as you would in a letter or a text. Share news, say sorry, say thank you or just say you miss them.<br><small>'+HONEST+'</small></div>')+L.map(m=>'<div class="b '+(m.me?'me':'lv')+'">'+esc(m.t)+'</div>'+(m.k==='crisis'?CRISIS:'')).join('')+(typing?'<div class="b lv typ"><span></span><span></span><span></span></div>':''),
 '<div class="in"><input id="mi" placeholder="Write to '+esc(o.name)+'…" maxlength="600"><button class="btn" id="sd">Send</button></div>');
 const l=hv.querySelector('.lst');l.scrollTop=l.scrollHeight;const i=hv.querySelector('#mi');hv.querySelector('#sd').onclick=()=>send(i.value);i.onkeydown=e=>{if(e.key==='Enter')send(i.value)};i.focus()}
function send(t){t=(t||'').trim();const o=cur();if(!t||!o||typing)return false;if(DEMO&&S.used>=LIMIT){window.demoEnd&&window.demoEnd('You\'ve used the 10 free messages in the demo of <b>Coffeebreak Messages from Heaven</b>.');return false}
 const L=S.msgs[o.id]=S.msgs[o.id]||[];L.push({me:1,t,ts:Date.now()});S.used++;save();typing=true;render();
 setTimeout(()=>{const r=reply(t,o);L.push({t:r.t,k:r.k,ts:Date.now()});typing=false;save();if(tab==='chat'&&hv.style.display==='block')render()},window.HV_FAST?10:1400);return true}
function rOnes(){const f=editing>=0?S.ones[editing]:null,v=k=>esc(f?f[k]:'');
 const form='<div class="card"><b>'+(f?'Edit '+esc(f.name):'Add a loved one')+'</b><input id="fn" placeholder="Name" value="'+v('name')+'"><input id="fr" placeholder="Relationship (Mum, Grandad, best friend…)" value="'+v('rel')+'"><input id="fk" placeholder="Nicknames they called you (comma separated)" value="'+v('nick')+'"><textarea id="fs" rows="2" placeholder="Favourite sayings (one per line)">'+v('saying')+'</textarea><textarea id="fm" rows="2" placeholder="Memories you shared (one per line)">'+v('memory')+'</textarea><textarea id="fl" rows="2" placeholder="Things they loved">'+v('loved')+'</textarea><textarea id="fc" rows="2" placeholder="How they would comfort you">'+v('comfort')+'</textarea>Photo: <input type="file" id="fp" accept="image/*"><button class="btn" id="fsv">💾 Save</button>'+(f?'<button class="sm" id="fx">Cancel</button>':'')+'</div>';
 const can=!DEMO||S.ones.length<1||f;
 shell('👤 Loved ones',DEMO?'Demo: 1 loved one':'As many as you like',S.ones.map((o,i)=>'<div class="card">'+(o.photo?'<img class="ph" src="'+o.photo+'" style="float:left;margin-right:10px">':'')+'<b>'+esc(o.name)+'</b><br><small>'+esc(o.rel)+'</small><br><button class="sm" data-c="'+i+'">🕯️ Talk</button><button class="sm" data-e="'+i+'">✏️ Edit</button><button class="sm" data-d="'+i+'">🗑</button><div style="clear:both"></div></div>').join('')+(can?form:'<div class="card">The free demo holds 1 loved one. The full version holds as many as you need.</div>'));
 hv.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.cur=+b.dataset.c;save();tab='chat';render()});
 hv.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{editing=+b.dataset.e;render()});
 hv.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(confirm('Remove this loved one and their messages from this device?')){const o=S.ones.splice(+b.dataset.d,1)[0];delete S.msgs[o.id];delete S.box[o.id];S.cur=0;save();render()}});
 const sv=hv.querySelector('#fsv');if(sv){const fx=hv.querySelector('#fx');if(fx)fx.onclick=()=>{editing=-1;render()};sv.onclick=()=>{const g=id=>hv.querySelector(id).value.trim();const d={name:g('#fn'),rel:g('#fr'),nick:g('#fk'),saying:g('#fs'),memory:g('#fm'),loved:g('#fl'),comfort:g('#fc')};if(!d.name)return alert('Please add their name.');
  readImg(hv.querySelector('#fp').files[0],p=>{if(f){Object.assign(f,d);if(p)f.photo=p}else{d.id='o'+Date.now();d.photo=p;S.ones.push(d);S.cur=S.ones.length-1}editing=-1;save();tab='chat';render()})}}}
function addOne(d){if(DEMO&&S.ones.length>=1)return false;d.id=d.id||'o'+Date.now()+S.ones.length;S.ones.push(d);S.cur=S.ones.length-1;save();return true}
function rCandle(){const o=cur(),on=S.lit&&Date.now()-S.lit<3600e3;
 shell('🔥 Light a candle',S.candles+' candles lit',('<div style="text-align:center;padding:20px"><div class="flame" style="'+(on?'':'filter:grayscale(1);opacity:.4;animation:none')+'">'+(on?'🕯️':'🕯')+'</div><p>'+(on?'Your candle is glowing'+(o?' for '+esc(o.name):'')+'. Take a slow breath in… and out.':'Light a candle in their memory.')+'</p><button class="btn" id="lc">'+(on?'🔥 Light another':'🔥 Light candle')+'</button></div>'));
 hv.querySelector('#lc').onclick=()=>{S.lit=Date.now();S.candles++;save();render()}}
function rBox(){const o=cur();if(!o){tab='ones';return rOnes()}const B=S.box[o.id]=S.box[o.id]||[];
 shell('📦 Memory box',esc(o.name),'<div class="card"><textarea id="bn" rows="2" placeholder="Write a memory…"></textarea>Photo: <input type="file" id="bp" accept="image/*"><button class="btn" id="ba">Add to box</button></div>'+(B.length?B.slice().reverse().map((m,i)=>'<div class="card">'+(m.p?'<img src="'+m.p+'" style="width:100%;border-radius:10px">':'')+(m.t?'<p>'+esc(m.t)+'</p>':'')+'<small>'+new Date(m.ts).toDateString()+'</small> <button class="sm" data-r="'+(B.length-1-i)+'">🗑</button></div>').join(''):'<p style="text-align:center;color:#c8a880">Your memory box is empty.</p>'));
 hv.querySelector('#ba').onclick=()=>{const t=hv.querySelector('#bn').value.trim();readImg(hv.querySelector('#bp').files[0],p=>{if(!t&&!p)return;B.push({t,p,ts:Date.now()});save();render()})};
 hv.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{B.splice(+b.dataset.r,1);save();render()})}
function rDates(){const now=new Date(),up=S.dates.map((d,i)=>{const [y,m,da]=d.d.split('-').map(Number);let n=new Date(now.getFullYear(),m-1,da);if(n<new Date(now.toDateString()))n.setFullYear(n.getFullYear()+1);return{...d,i,n,days:Math.round((n-new Date(now.toDateString()))/864e5)}}).sort((a,b)=>a.days-b.days);
 const mo=now.getMonth(),y=now.getFullYear(),first=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate();let cal='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:12px">'+'SMTWTFS'.split('').map(c=>'<b>'+c+'</b>').join('');for(let i=0;i<first;i++)cal+='<span></span>';
 for(let d=1;d<=dim;d++){const has=S.dates.some(e=>{const p=e.d.split('-');return +p[1]===mo+1&&+p[2]===d});cal+='<span style="padding:4px;border-radius:6px;'+(has?'background:#d89a40;color:#2a1408':'')+(d===now.getDate()?';outline:1px solid #ffd890':'')+'">'+d+'</span>'}cal+='</div>';
 shell('📅 Anniversaries',now.toLocaleString([],{month:'long',year:'numeric'}),'<div class="card">'+cal+'</div><div class="card"><input id="dl" placeholder="What is it? (Birthday, the day they passed…)"><input id="dd" type="date"><button class="btn" id="dad">Add date</button></div>'+up.map(e=>'<div class="card">'+(e.days===0?'🕯️ <b>Today</b>':'In '+e.days+' day'+(e.days>1?'s':''))+': <b>'+esc(e.l)+'</b><br><small>'+e.n.toDateString()+'</small> <button class="sm" data-x="'+e.i+'">🗑</button></div>').join(''));
 hv.querySelector('#dad').onclick=()=>{const l=hv.querySelector('#dl').value.trim(),d=hv.querySelector('#dd').value;if(!l||!d)return;S.dates.push({l,d});save();render()};
 hv.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{S.dates.splice(+b.dataset.x,1);save();render()})}
function rLetter(){const o=cur();
 shell('✉️ Letters','Write freely. No reply, just love','<div class="card" style="background:#f6ecd4;color:#3a2410"><textarea id="lt" rows="8" style="background:#fbf4e2;color:#3a2410;border-color:#c8a880" placeholder="Dear '+esc(o?o.name:'…')+',"></textarea><button class="btn" id="ls">💌 Seal letter</button></div>'+S.letters.slice().reverse().map((l,i)=>'<div class="card"><small>'+new Date(l.ts).toDateString()+(l.to?' · to '+esc(l.to):'')+'</small><p style="white-space:pre-wrap">'+esc(l.t)+'</p><button class="sm" data-x="'+(S.letters.length-1-i)+'">🗑</button></div>').join(''));
 hv.querySelector('#ls').onclick=()=>{const t=hv.querySelector('#lt').value.trim();if(!t)return;S.letters.push({t,to:o?o.name:'',ts:Date.now()});save();render()};
 hv.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{S.letters.splice(+b.dataset.x,1);save();render()})}
function rSign(){const s=sign();shell('🪶 Today\'s sign',today(),'<div style="text-align:center;padding:24px"><div style="font-size:80px">'+s[0]+'</div><h2 style="color:#ffd890">'+s[1]+'</h2><p>'+s[2]+'</p><small>A gentle prompt for the day, not a message from beyond.</small></div>')}
function rHelp(){shell('💛 Grief support','You don\'t have to carry this alone','<div class="card"><b>GriefLine</b>: <a style="color:#ffd890" href="tel:1300845745">1300 845 745</a><br><b>Lifeline</b> (24/7): <a style="color:#ffd890" href="tel:131114">13 11 14</a><br><b>Emergency</b>: 000</div><div class="cr"><b>If you are thinking of ending your life or wanting to "join" them</b>, please call Lifeline on 13 11 14 or 000 now. You matter, and they would want you here.</div><div class="card">'+HONEST+'<br><br>Everything stays on this device only. Nothing is uploaded.</div>')}
function openApp(t){tab=t||(S.ones.length?'chat':'ones');G.state='app';hv.style.display='block';render()}
function closeApp(){hv.style.display='none';G.state='title'}
const motes=Array.from({length:50},()=>({x:Math.random()*900,y:Math.random()*600,s:Math.random()*2+1,v:Math.random()*10+5}));
function candle(X,Y,sc){x.save();x.translate(X,Y);x.scale(sc,sc);const g=x.createRadialGradient(0,-80,5,0,-80,160);g.addColorStop(0,'rgba(255,200,100,.45)');g.addColorStop(1,'rgba(255,200,100,0)');x.fillStyle=g;x.beginPath();x.arc(0,-80,160,0,7);x.fill();
 x.fillStyle='#f6ecd4';rr(-30,-60,60,140,8);x.fill();x.fillStyle='#333';x.fillRect(-2,-72,4,12);const f=1+.08*Math.sin(t*9);x.fillStyle='#ffb040';x.beginPath();x.ellipse(0,-90,10*f,22*f,0,0,7);x.fill();x.fillStyle='#fff3c0';x.beginPath();x.ellipse(0,-86,4,10,0,0,7);x.fill();x.restore()}
function bg(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#2a1608');g.addColorStop(1,'#080402');x.fillStyle=g;x.fillRect(0,0,900,600);for(const m of motes){m.y-=m.v*0.016;if(m.y<0)m.y=600;x.globalAlpha=.3+.3*Math.sin(t*2+m.x);x.fillStyle='#ffd890';x.fillRect(m.x,m.y,m.s,m.s)}x.globalAlpha=1}
function drawTitle(){bg();candle(450,330,1.2);
 T('🕯️ Coffeebreak Messages from Heaven',450,74,34,'#ffd890','center');T('Write to someone you love and miss, by candlelight.',450,110,18,'#f0d8b0','center','italic ');
 button('st',180,470,170,50,'🕯️ Write to them',()=>openApp(),{fs:16,bg:'#3a2010',ac:'#d89a40'});button('ad',365,470,170,50,'👤 Loved ones',()=>openApp('ones'),{fs:16,bg:'#3a2010',ac:'#d89a40'});button('sg',550,470,170,50,'🪶 Today\'s sign',()=>openApp('sign'),{fs:16,bg:'#3a2010',ac:'#d89a40'});
 T(NOTE,450,548,12,'#d8b890','center','');T('GriefLine 1300 845 745 · Lifeline 13 11 14 · '+(DEMO?'Free demo: 1 loved one, 10 messages':'Full version: unlimited'),450,568,12,'#b89870','center','')}
(function(){const o=document.createElement('canvas');o.width=240;o.height=320;const k=x;x=o.getContext('2d');x.fillStyle='#140a06';x.fillRect(0,0,240,320);candle(120,230,1);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});
function update(dt){}
function draw(){x.clearRect(0,0,900,600);for(const k in BTN)delete BTN[k];drawTitle();x.textAlign='left'}
window.HV={G,S,send,openApp,topic,reply,addOne,sign,fill};startLoop();
