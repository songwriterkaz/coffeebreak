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
// ===== Coffeebreak Who Did It? Decider =====
const DEMO=!!window.DEMO,SK=DEMO?'deciderDemo':'deciderSave';
let S={names:['Mum','Dad','Sam','Ella'],hist:[],spins:0,fair:1};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:S.spins,level:0};window.G=G;
const MODES=[['🧹','Chores','Who does it?',['washing up','taking out the bin','vacuuming','feeding the pet','folding laundry','making dinner','tidying the lounge','walking the dog']],
['🕵️','Who Did It?','The culprit is…',['ate the last biscuit','left the lights on','hid the remote','used all the hot water','forgot to close the fridge','tracked mud inside','finished the milk','made that smell']],
['🎲','Whose Turn?','It\'s the turn of…',['picking the movie','choosing dinner','going first','the front seat','the game controller','choosing music']],
['🎯','Anything','The winner is…',['']]];
const COL=['#ff6f91','#ffc75f','#4ad6a0','#4ab0ff','#b06aff','#ff9671','#00c9a7','#f9f871','#d65db1','#845ec2','#2c73d2','#c34a36'];
let mode=0,task='',ang=0,vel=0,spinning=0,res=null,inp=null,shuffleMode='wheel',drum=0;
function pickTask(){const l=MODES[mode][3];task=l[Math.floor(Math.random()*l.length)]}
function weights(){if(!S.fair)return S.names.map(()=>1);const rc=S.hist.slice(0,S.names.length);return S.names.map(n=>rc.filter(h=>h.who===n&&h.mode===mode).length?.4:1)}
function spin(){if(spinning||S.names.length<2)return;if(DEMO&&S.spins>=5)return window.demoEnd&&window.demoEnd('The full version has unlimited spins, up to 12 names, all 4 modes, Fair mode and your full history.');
 const w=weights(),tot=w.reduce((a,b)=>a+b);let r=Math.random()*tot,k=0;while(r>w[k]){r-=w[k];k++}
 const seg=Math.PI*2/S.names.length,target=-Math.PI/2-(k+.2+Math.random()*.6)*seg;let d=((target-ang)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);spinning={from:ang,to:ang+d+Math.PI*2*(5+Math.floor(Math.random()*3)),t:0,k};res=null}
function finish(k){const who=S.names[k];res={who,task};S.spins++;G.score=S.spins;S.hist.unshift({who,task,mode,d:new Date().toLocaleDateString('en-AU')});S.hist=S.hist.slice(0,40);save();[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f),i*110))}
function tone(f){try{window._AC=window._AC||new AudioContext();const A=window._AC,o=A.createOscillator(),g=A.createGain();o.frequency.value=f;g.gain.setValueAtTime(.05,A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+.15);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.15)}catch(e){}}
function showInput(on){if(on&&!inp){inp=document.createElement('input');inp.placeholder='Type a name, press Enter';inp.maxLength=14;Object.assign(inp.style,{position:'fixed',zIndex:50,font:'20px Georgia',padding:'8px 12px',borderRadius:'10px',border:'2px solid #ffc75f'});document.body.appendChild(inp);inp.addEventListener('keydown',e=>{if(e.key==='Enter')addName()})}
 if(inp){inp.style.display=on?'block':'none';if(on){const r=c.getBoundingClientRect();inp.style.left=(r.left+r.width*120/900)+'px';inp.style.top=(r.top+r.height*96/600)+'px';inp.style.width=(r.width*400/900)+'px'}}}
function addName(){const v=(inp&&inp.value||'').trim();if(!v)return;const max=DEMO?4:12;if(S.names.length>=max){if(DEMO)window.demoEnd&&window.demoEnd('Add up to 12 names in the full version!');return}S.names.push(v);inp.value='';save()}
function wheel(cx,cy,R){const n=S.names.length,seg=Math.PI*2/n;S.names.forEach((nm,i)=>{x.fillStyle=COL[i%12];x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,ang+i*seg,ang+(i+1)*seg);x.fill();x.save();x.translate(cx,cy);x.rotate(ang+(i+.5)*seg);T(nm,R-16,7,Math.min(22,260/n+6),'#1a1a2a','right');x.restore()});
 x.strokeStyle='#fff';x.lineWidth=6;x.beginPath();x.arc(cx,cy,R,0,7);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(cx,cy,30,0,7);x.fill();emo(MODES[mode][0],cx,cy,30);
 x.fillStyle='#ff3a5a';x.beginPath();x.moveTo(cx-18,cy-R-26);x.lineTo(cx+18,cy-R-26);x.lineTo(cx,cy-R+8);x.fill()}
function bgD(){const g=x.createRadialGradient(450,300,50,450,300,600);g.addColorStop(0,'#3a2a6a');g.addColorStop(1,'#120a28');x.fillStyle=g;x.fillRect(0,0,900,600)}
function drawPlay(){bgD();wheel(300,320,230);T(MODES[mode][1],640,60,30,'#ffc75f');if(MODES[mode][3][0])T('for: '+task,640,92,18,'#fff','left','');button('nt',640,104,150,32,'🔀 New task',pickTask,{fs:14,bg:'#2a1a4a',ac:'#ffc75f',dis:!MODES[mode][3][0]});
 MODES.forEach((m,i)=>button('m'+i,640+(i%2)*120,150+Math.floor(i/2)*44,112,38,m[0]+' '+m[1],()=>{mode=i;pickTask();res=null},{sel:mode===i,bg:'#2a1a4a',ac:'#ffc75f',fs:13}));
 button('spin',640,250,232,64,spinning?'Spinning…':'🎡 SPIN!',spin,{bg:'#ff3a5a',ac:'#fff',fs:26,dis:spinning||S.names.length<2});
 button('fair',640,326,232,36,(S.fair?'✅':'⬜')+' Fair mode (fewer repeats)',()=>{S.fair=!S.fair;save()},{bg:'#2a1a4a',ac:'#4ad6a0',fs:13});
 button('nm',640,372,112,40,'✏️ Names',()=>{G.state='names'},{bg:'#2a1a4a',ac:'#4ab0ff',fs:15});button('hs',760,372,112,40,'📜 History',()=>{G.state='hist'},{bg:'#2a1a4a',ac:'#4ab0ff',fs:15});
 if(res){x.fillStyle='rgba(255,255,255,.96)';rr(600,430,290,140,18);x.fill();T(MODES[mode][2],745,465,18,'#5a3a8a','center','');T(res.who+'!',745,515,40,'#ff3a5a','center');if(res.task)T(res.task,745,548,17,'#333','center','')}}
function drawNames(){bgD();T('Who\'s playing?',450,70,34,'#ffc75f','center');button('add',540,92,120,40,'➕ Add',addName,{bg:'#2a1a4a',ac:'#4ad6a0'});
 S.names.forEach((n,i)=>{const X=120+(i%3)*230,Y=170+Math.floor(i/3)*70;x.fillStyle=COL[i%12];rr(X,Y,210,56,14);x.fill();T(n,X+16,Y+36,22,'#1a1a2a');button('d'+i,X+166,Y+10,36,36,'✖',()=>{S.names.splice(i,1);save()},{bg:'#fff',fg:'#c0304a',ac:'#c0304a',fs:16})});
 T(S.names.length+' / '+(DEMO?4:12)+' names',450,470,18,'#fff','center','');button('back',350,500,200,52,'🎡 Back to wheel',()=>{G.state='play'},{bg:'#ff3a5a',ac:'#fff'})}
function drawHist(){bgD();T('History',450,60,34,'#ffc75f','center');const cnt={};S.hist.forEach(h=>cnt[h.who]=(cnt[h.who]||0)+1);T('Tally: '+Object.keys(cnt).map(k=>k+' '+cnt[k]).join(' · '),450,92,16,'#4ad6a0','center','');
 S.hist.slice(0,10).forEach((h,i)=>T(MODES[h.mode][0]+'  '+h.who+(h.task?' — '+h.task:'')+'   ('+h.d+')',140,130+i*34,18,'#fff','left',''));if(!S.hist.length)T('No spins yet.',450,250,20,'#fff','center','');
 button('clr',230,500,200,50,'🗑️ Clear',()=>{S.hist=[];save()},{bg:'#2a1a4a',ac:'#ff6f91'});button('back',470,500,200,50,'🎡 Back',()=>{G.state='play'},{bg:'#ff3a5a',ac:'#fff'})}
function drawTitle(){bgD();ang+=.005;wheel(450,330,150);T('Coffeebreak',450,80,28,'#ffc75f','center');T('Who Did It? Decider',450,140,54,'#fff','center');T('Chores · Culprits · Turns. Spin to settle it.',450,520,20,'#ffc75f','center','');button('go',350,540,200,48,'🎡 Let\'s spin',()=>{G.state='play';pickTask()},{bg:'#ff3a5a',ac:'#fff'})}
bindInput({});function update(dt){if(spinning){spinning.t+=dt/4;const k=Math.min(1,spinning.t),e=1-Math.pow(1-k,3),pa=ang;ang=spinning.from+(spinning.to-spinning.from)*e;const seg=Math.PI*2/S.names.length;if(Math.floor(pa/seg)!==Math.floor(ang/seg))tone(900);if(k>=1){const kk=spinning.k;spinning=0;finish(kk)}}showInput(G.state==='names')}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='play')drawPlay();else if(s==='names')drawNames();else drawHist()}
window.DD={G,S,spin,get res(){return res},get spinning(){return spinning}};startLoop();
