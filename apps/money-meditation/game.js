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
// ===== Coffeebreak Money Manifest Meditation =====
const DEMO=!!window.DEMO,SK=DEMO?'mmDemo':'mmSave';
let S={mins:0,sessions:0,streak:0,last:'',journal:[],fav:[]};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:S.sessions,level:0};window.G=G;
const MED=[['Abundance Breath','🌊',['Settle into a comfortable position. Let your shoulders drop.','Breathe in slowly… and let the breath go.','Imagine a warm golden light at the centre of your chest.','With every inhale, the light grows a little brighter.','Silently say: "There is enough. I am enough."','Notice what you already have: a breath, a heartbeat, this moment.','Let gratitude spread from your chest to your fingertips.','When you are ready, gently open your eyes.']],
['Releasing Money Worry','🍃',['Let your body be heavy and supported.','Bring to mind a money worry. Just notice it, without judging.','Picture writing the worry on a leaf.','Place the leaf on a gentle stream and watch it float away.','You can come back to practical steps later. Right now, you rest.','Breathe in calm. Breathe out tension.','Say: "I can handle what comes, one step at a time."','Return slowly, feeling lighter.']],
['The Golden Future','✨',['Close your eyes and take three deep breaths.','Imagine yourself one year from now, feeling secure and calm.','Where are you? What does your home look like?','See yourself making a wise choice with money, easily.','Feel the pride and peace of that future you.','What is one small step that future you thanks you for today?','Hold that step in your mind like a seed.','Breathe, and bring that seed back with you.']],
['Gratitude Inventory','🙏',['Breathe gently through your nose.','Think of three things you own that make life easier.','Think of a person who has been generous to you.','Think of a skill you have that others value.','Let each one fill you with quiet appreciation.','Wealth is more than money: health, time, love, knowledge.','Say: "I notice abundance everywhere."','Smile softly and come back.']],
['Worthy of Wealth','💎',['Sit tall, like a mountain.','Breathe in for four… hold for four… out for four.','Notice any belief that says you are not worthy.','Thank it for trying to protect you, then set it down.','Say: "I am worthy of security, comfort and joy."','Imagine opportunities flowing towards you like a river.','You are open, ready and calm.','Take one more deep breath and return.']],
['Two-Minute Reset','⏱️',['Breathe in deeply.','Breathe out completely.','Feel your feet on the ground.','Say: "I am safe. I am resourceful."','Breathe in possibility.','Breathe out doubt.','Ready. Calm. Clear.','Done. Go gently.']]];
const AFF=['Money flows to me in expected and unexpected ways.','I am a magnet for opportunity.','I make wise, calm decisions with money.','I deserve abundance and I share it generously.','My income grows as I grow.','I release fear and welcome prosperity.','I am grateful for everything I have right now.','Every day I take one small step toward my goals.','There is more than enough for me and for others.','I am open to receiving good things.','My worth is not my net worth, and I am still allowed to thrive.','I trust myself with abundance.','Saving feels good. Spending wisely feels good.','I celebrate other people\'s success; it shows me what\'s possible.','Wealth begins with a peaceful mind.'];
const BR=[['Calm 4-6',[4,0,6,0]],['Box 4-4-4-4',[4,4,4,4]],['Relax 4-7-8',[4,7,8,0]]];
let med=0,step=0,stepT=0,len=5,run=0,el=0,bm=0,aff=0,ta=null,jview=0,stars=[];for(let i=0;i<80;i++)stars.push([Math.random()*900,Math.random()*600,Math.random()*7]);
const STEP=()=>len*60/8;
function startMed(i){if(DEMO&&i>1)return window.demoEnd&&window.demoEnd('The full version has all 6 guided meditations, 3 breathing patterns, every affirmation and your saved journal.');med=i;step=0;stepT=0;el=0;run=1;G.state='med'}
function finishMed(){run=0;S.sessions++;S.mins+=Math.round(el/60*10)/10;const d=new Date().toDateString();if(S.last!==d){const y=new Date(Date.now()-864e5).toDateString();S.streak=S.last===y?S.streak+1:1;S.last=d}G.score=S.sessions;save();G.state='after';bell();
 if(DEMO&&S.sessions>=1)setTimeout(()=>window.demoEnd&&window.demoEnd('Beautifully done. The full version has all 6 meditations, every breathing pattern and affirmation, and your saved journal.'),4000)}
function bell(){try{const A=window._AC=window._AC||new AudioContext();[528,792,1056].forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.setValueAtTime(.05/(i+1),A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+4);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+4)})}catch(e){}}
function breath(){const p=BR[bm][1],tot=p.reduce((a,b)=>a+b),k=(t%tot);let a=0,ph='Breathe in',r;if(k<p[0]){r=k/p[0]}else if(k<p[0]+p[1]){r=1;ph='Hold'}else if(k<p[0]+p[1]+p[2]){r=1-(k-p[0]-p[1])/p[2];ph='Breathe out'}else{r=0;ph='Hold'}return [r,ph]}
function sky(){const g=x.createRadialGradient(450,300,40,450,300,650);g.addColorStop(0,'#2a2050');g.addColorStop(1,'#0a0818');x.fillStyle=g;x.fillRect(0,0,900,600);stars.forEach(s=>{x.fillStyle='rgba(255,230,170,'+(.2+.3*Math.sin(t+s[2]))+')';x.fillRect(s[0],s[1],1.6,1.6)})}
function orb(X,Y,r){const g=x.createRadialGradient(X,Y,r*.1,X,Y,r*1.6);g.addColorStop(0,'rgba(255,215,120,.95)');g.addColorStop(.5,'rgba(255,190,80,.35)');g.addColorStop(1,'rgba(255,190,80,0)');x.fillStyle=g;x.beginPath();x.arc(X,Y,r*1.6,0,7);x.fill();x.strokeStyle='rgba(255,230,170,.6)';x.lineWidth=2;x.beginPath();x.arc(X,Y,r,0,7);x.stroke()}
function drawMed(){sky();const [r,ph]=breath();orb(450,230,70+r*70);T(ph,450,238,22,'#2a1a08','center');const m=MED[med];T(m[1]+' '+m[0],450,50,22,'#ffd88a','center');
 x.fillStyle='rgba(255,255,255,'+Math.min(1,stepT*1.5)+')';x.font='italic 24px Georgia';x.textAlign='center';wrapT(m[2][step],450,420,700,32);x.textAlign='left';
 const left=Math.max(0,len*60-el);x.fillStyle='rgba(255,255,255,.15)';rr(250,480,400,8,4);x.fill();x.fillStyle='#ffd88a';rr(250,480,400*Math.min(1,el/(len*60)),8,4);x.fill();T(Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0'),450,512,16,'#ffd88a','center','');
 button('pp',290,530,100,40,run?'⏸ Pause':'▶ Play',()=>{run=!run},{bg:'#1a1430',ac:'#ffd88a',fs:15});button('sk',400,530,100,40,'⏭ Next',()=>{step++;stepT=0;if(step>=8)finishMed()},{bg:'#1a1430',ac:'#ffd88a',fs:15});button('ex',510,530,100,40,'✖ End',()=>{run=0;G.state='home'},{bg:'#1a1430',ac:'#ffd88a',fs:15})}
function drawHome(){sky();T('Choose your meditation',450,52,28,'#ffd88a','center');T('🧘 '+S.sessions+' sessions · '+S.mins+' min · 🔥 '+S.streak+' day streak',450,80,15,'#cfc0ff','center','');
 MED.forEach((m,i)=>{const lk=DEMO&&i>1;button('m'+i,60+(i%3)*265,100+Math.floor(i/3)*70,250,58,(lk?'🔒 ':m[1]+' ')+m[0],()=>startMed(i),{bg:'#1a1430',ac:'#ffd88a',fs:16})});
 T('Length',60,270,16,'#cfc0ff');[2,5,10,15].forEach((n,i)=>button('l'+n,130+i*80,250,70,32,n+' min',()=>{if(DEMO&&n>5)return window.demoEnd&&window.demoEnd('Longer sessions are in the full version!');len=n},{sel:len===n,bg:'#1a1430',ac:'#ffd88a',fs:14}));
 T('Breathing',470,270,16,'#cfc0ff');BR.forEach((b,i)=>button('b'+i,560+(i%2)*150,250+Math.floor(i/2)*38,140,32,b[0],()=>{if(DEMO&&i)return window.demoEnd&&window.demoEnd('All breathing patterns are in the full version!');bm=i},{sel:bm===i,bg:'#1a1430',ac:'#9ad8ff',fs:13}));
 const [r,ph]=breath();orb(170,420,30+r*28);T(ph,170,500,15,'#ffd88a','center','');x.fillStyle='rgba(255,255,255,.06)';rr(300,340,540,140,16);x.fill();T('Today\'s affirmation',570,368,15,'#cfc0ff','center','');x.font='italic 22px Georgia';x.fillStyle='#fff';x.textAlign='center';wrapT('“'+AFF[aff]+'”',570,408,500,30);x.textAlign='left';
 button('na',320,490,170,40,'🔀 New affirmation',()=>{aff=(aff+1)%(DEMO?4:AFF.length)},{bg:'#1a1430',ac:'#ffd88a',fs:14});button('fv',500,490,150,40,S.fav.includes(aff)?'💛 Saved':'🤍 Save it',()=>{if(!S.fav.includes(aff)){S.fav.push(aff);save()}},{bg:'#1a1430',ac:'#ffd88a',fs:14});button('jr',660,490,170,40,'📓 Journal',()=>{G.state='journal'},{bg:'#1a1430',ac:'#ffd88a',fs:14});
 T('For relaxation and reflection only. Not financial advice.',450,580,12,'rgba(220,210,255,.5)','center','')}
function mkTa(){if(ta)return;ta=document.createElement('textarea');Object.assign(ta.style,{position:'fixed',zIndex:50,font:'17px Georgia',padding:'12px',border:'1px solid #ffd88a',borderRadius:'10px',background:'#1a1430',color:'#fff',display:'none',resize:'none',boxSizing:'border-box'});ta.placeholder='What abundance did I notice today? What one step will I take?';document.body.appendChild(ta)}
function placeTa(on){if(!ta)return;ta.style.display=on?'block':'none';if(on){const r=c.getBoundingClientRect(),k=r.width/900;Object.assign(ta.style,{left:(r.left+60*k)+'px',top:(r.top+110*k)+'px',width:(780*k)+'px',height:(170*k)+'px'})}}
function saveJ(){const v=ta.value.trim();if(!v)return;if(DEMO&&S.journal.length>=2)return window.demoEnd&&window.demoEnd('Keep an unlimited journal in the full version!');S.journal.unshift({d:new Date().toLocaleDateString('en-AU'),v});ta.value='';save()}
function drawJournal(){sky();T('Abundance Journal',450,56,30,'#ffd88a','center');T('Prompt: '+['Three things I\'m grateful for…','One money win this week…','A belief I\'m ready to release…','My next small step is…'][Math.floor(t/8)%4],450,90,16,'#cfc0ff','center','italic ');
 button('sv',60,292,160,40,'💾 Save entry',saveJ,{bg:'#1a1430',ac:'#ffd88a',fs:15});button('bk',680,292,160,40,'⬅ Back',()=>{G.state='home'},{bg:'#1a1430',ac:'#ffd88a',fs:15});
 S.journal.slice(0,5).forEach((j,i)=>{x.fillStyle='rgba(255,255,255,.06)';rr(60,345+i*46,780,40,8);x.fill();T(j.d,74,370+i*46,13,'#ffd88a');T(j.v.length>80?j.v.slice(0,80)+'…':j.v,170,370+i*46,14,'#fff','left','')});if(!S.journal.length)T('Your saved entries will appear here.',450,380,16,'#cfc0ff','center','')}
function drawAfter(){sky();orb(450,200,80);T('🙏',450,214,40,'#fff','center');T('Session complete',450,340,34,'#ffd88a','center');T('“'+AFF[(S.sessions*3)%AFF.length]+'”',450,385,20,'#fff','center','italic ');
 button('j',240,440,200,48,'📓 Journal it',()=>{G.state='journal'},{bg:'#1a1430',ac:'#ffd88a'});button('h',460,440,200,48,'🌙 Home',()=>{G.state='home'},{bg:'#1a1430',ac:'#ffd88a'})}
function drawTitle(){sky();const [r]=breath();orb(450,250,60+r*40);T('Coffeebreak',450,90,26,'#ffd88a','center');T('Money Manifest Meditation',450,140,46,'#fff','center');T('Breathe. Believe. Receive.',450,410,22,'#ffd88a','center','italic ');button('go',350,450,200,54,'🧘 Begin',()=>{G.state='home'},{bg:'#1a1430',ac:'#ffd88a',fs:20})}
bindInput({});mkTa();function update(dt){if(G.state==='med'&&run){el+=dt;stepT+=dt;if(stepT>=STEP()){step++;stepT=0;if(step>=8)finishMed()}}placeTa(G.state==='journal')}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='home')drawHome();else if(s==='med')drawMed();else if(s==='journal')drawJournal();else drawAfter()}
window.MM={G,S,startMed,finishMed,saveJ,get ta(){return ta}};startLoop();
