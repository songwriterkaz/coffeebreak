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
// ===== Coffeebreak Write My Life Story =====
const DEMO=!!window.DEMO,SK=DEMO?'lifeDemo':'lifeSave';
let S={title:'My Life Story',author:'',ch:{},words:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
const CH=[['Where It All Began','🍼',['Where and when were you born? What was happening in the world?','What is your earliest memory?','Describe the home you grew up in, including the smells, sounds and rooms.']],
['My Family','👨‍👩‍👧',['Who raised you? Describe them as people, not just as parents.','What family traditions do you remember?','Tell a funny story that your family still talks about.']],
['School Days','🎒',['Who was a teacher who made a difference?','Who were your friends, and what did you get up to?','What did you dream of becoming?']],
['Growing Up','🌱',['What was the hardest thing about being a teenager?','What music, films or fashion defined those years?','When did you first feel like a grown-up?']],
['Work & Purpose','💼',['What was your first job, and what did you learn from it?','What work have you been proudest of?','If you could do any job for a year, what would it be?']],
['Love & Friendship','💞',['Tell the story of someone you have loved.','Who has been your truest friend?','What have relationships taught you?']],
['Places I\'ve Been','🧭',['Which place feels most like home, and why?','What trip or move changed you?','Describe a place you want to see before you die.']],
['Storms I Weathered','⛈️',['What is the hardest thing you have lived through?','Who or what helped you get through it?','How did it change you?']],
['Proud Moments','🏆',['What are you most proud of?','When were you braver than you expected?','What small win still makes you smile?']],
['Lessons & Wisdom','🦉',['What do you know now that you wish you had known at 20?','What do you believe in most strongly?','What would you tell your younger self?']],
['Letter to the Future','✉️',['Write a letter to someone who will read this in 50 years.','How do you hope to be remembered?','What are you still looking forward to?']]];
let cur=0,pi=0,ta=null,nameEl=null,toast='',toastT=0;
const wc=s=>(s||'').trim().split(/\s+/).filter(Boolean).length;
function key(){return cur+'-'+pi}
function mkDom(){if(ta)return;ta=document.createElement('textarea');nameEl=document.createElement('input');[ta,nameEl].forEach(e=>{Object.assign(e.style,{position:'fixed',zIndex:50,font:'18px Georgia',lineHeight:'1.5',padding:'12px',border:'1px solid #c8b090',borderRadius:'8px',background:'#fffdf6',color:'#2a2018',display:'none',resize:'none',boxSizing:'border-box'});document.body.appendChild(e)});
 ta.placeholder='Start writing… there is no wrong way to tell your story.';ta.addEventListener('input',()=>{S.ch[key()]=ta.value;S.words=Object.values(S.ch).reduce((a,v)=>a+wc(v),0);G.score=S.words;save()});nameEl.addEventListener('input',()=>{S.author=nameEl.value;save()});nameEl.placeholder='Your name'}
function place(e,X,Y,w,h){const r=c.getBoundingClientRect(),k=r.width/900;Object.assign(e.style,{display:'block',left:(r.left+X*k)+'px',top:(r.top+Y*k)+'px',width:(w*k)+'px',height:(h*k)+'px',fontSize:Math.max(12,18*k)+'px'})}
function openCh(i,p){if(DEMO&&i>1)return window.demoEnd&&window.demoEnd('The full version unlocks all 11 chapters with 33 prompts, unlimited writing and export of your whole book.');cur=i;pi=p||0;G.state='write';mkDom();ta.value=S.ch[key()]||'';G.level=i}
function setP(p){pi=p;ta.value=S.ch[key()]||''}
function bookText(){let s=S.title.toUpperCase()+'\n'+(S.author?'by '+S.author+'\n':'')+'\n';CH.forEach((c,i)=>{const parts=c[2].map((q,j)=>S.ch[i+'-'+j]).filter(v=>v&&v.trim());if(!parts.length)return;s+='\n\nChapter '+(i+1)+': '+c[0]+'\n'+'-'.repeat(30)+'\n\n'+parts.join('\n\n')});return s}
function exportTxt(){const b=new Blob([bookText()],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(S.title||'life-story').replace(/[^\w]+/g,'-')+'.txt';document.body.appendChild(a);a.click();a.remove();toast='📄 Exported your book as a text file';toastT=3}
function paper(){x.fillStyle='#3a2a20';x.fillRect(0,0,900,600);const g=x.createLinearGradient(0,0,900,0);g.addColorStop(0,'#efe3c8');g.addColorStop(.5,'#fbf3e0');g.addColorStop(1,'#efe3c8');x.fillStyle=g;rr(30,20,840,560,12);x.fill();x.strokeStyle='rgba(120,90,60,.15)';for(let y=80;y<570;y+=28){x.beginPath();x.moveTo(50,y);x.lineTo(850,y);x.stroke()}}
function done(i){return CH[i][2].filter((q,j)=>wc(S.ch[i+'-'+j])>0).length}
function drawToc(){paper();T(S.title,450,72,36,'#4a2a18','center');T((S.author?'by '+S.author+' · ':'')+S.words+' words written',450,100,16,'#8a6a4a','center','italic ');
 CH.forEach((c,i)=>{const X=60+(i%2)*400,Y=120+Math.floor(i/2)*66,lk=DEMO&&i>1;BTN['c'+i]={x:X,y:Y,w:380,h:58,fn:()=>openCh(i)};x.fillStyle=lk?'rgba(0,0,0,.05)':'rgba(255,255,255,.6)';rr(X,Y,380,58,10);x.fill();x.strokeStyle='#c8a880';x.lineWidth=1.5;x.stroke();
  emo(c[1],X+30,Y+29,28);T((lk?'🔒 ':'')+'Ch. '+(i+1)+'  '+c[0],X+56,Y+26,17,'#4a2a18');const d=done(i);T('✒️'.repeat(d)+'  '+d+'/3 prompts',X+56,Y+48,13,'#8a6a4a','left','')});
 button('ex',560,520,150,44,'📄 Export .txt',exportTxt,{bg:'#4a2a18',ac:'#c8a880',fs:15});button('hm',720,520,120,44,'🏠 Home',()=>{G.state='title'},{bg:'#4a2a18',ac:'#c8a880',fs:15})}
function drawWrite(){paper();const c2=CH[cur];emo(c2[1],80,70,36);T('Chapter '+(cur+1)+': '+c2[0],110,80,26,'#4a2a18');
 c2[2].forEach((q,j)=>button('p'+j,60+j*262,104,252,34,'Prompt '+(j+1)+(wc(S.ch[cur+'-'+j])?' ✓':''),()=>setP(j),{sel:pi===j,bg:'#fbf3e0',fg:'#4a2a18',ac:'#a8784a',fs:14}));
 x.font='italic 19px Georgia';x.fillStyle='#6a3a1a';x.textAlign='left';wrapT('“'+c2[2][pi]+'”',60,166,780,24);
 place(ta,60,200,780,300);T(wc(ta.value)+' words',60,528,14,'#8a6a4a','left','');
 button('pv',340,510,120,44,'◀ Prompt',()=>setP((pi+2)%3),{bg:'#4a2a18',ac:'#c8a880',fs:15});button('nx',470,510,120,44,'Prompt ▶',()=>{if(pi<2)setP(pi+1);else openCh(Math.min(10,cur+1))},{bg:'#4a2a18',ac:'#c8a880',fs:15});button('toc',600,510,240,44,'📖 Save & contents',()=>{save();G.state='toc';toast='✒️ Chapter saved';toastT=2},{bg:'#7a3a1a',ac:'#ffd8a0',fs:15})}
function drawTitle(){paper();x.fillStyle='#6a2a1a';rr(300,80,300,380,8);x.fill();x.strokeStyle='#d8b060';x.lineWidth=3;x.strokeRect(318,98,264,344);T('Coffeebreak',450,150,18,'#d8b060','center');T('Write My',450,230,38,'#fbf3e0','center');T('Life Story',450,280,42,'#fbf3e0','center');emo('🖋️',450,360,50);
 T('A guided memoir, one gentle prompt at a time.',450,500,18,'#6a3a1a','center','italic ');T('Name on the cover:',300,535,15,'#6a3a1a','left','');place(nameEl,450,514,150,32);nameEl.value=S.author;
 button('go',620,512,190,40,'📖 Open my book',()=>{G.state='toc'},{bg:'#6a2a1a',ac:'#d8b060',fs:16})}
bindInput({});mkDom();function update(dt){toastT-=dt;ta.style.display=G.state==='write'?'block':'none';nameEl.style.display=G.state==='title'?'block':'none'}
function draw(){x.clearRect(0,0,900,600);if(G.state==='title')drawTitle();else if(G.state==='toc')drawToc();else drawWrite();if(toastT>0){x.fillStyle='rgba(40,25,10,.88)';rr(300,560,300,32,10);x.fill();T(toast,450,582,14,'#fff','center')}}
window.LS={G,S,openCh,exportTxt,bookText,get ta(){return ta}};startLoop();
