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
// ===== Coffeebreak Acting Role Play =====
const DEMO=!!window.DEMO,SK=DEMO?'actDemo':'actSave';
let S={fame:0,roles:[],best:{},shows:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:S.fame,level:0};window.G=G;
const EM=[['Happy','😄'],['Sad','😢'],['Angry','😠'],['Scared','😨'],['Surprised','😲'],['Calm','😌']];
const VO=['Whisper','Normal','Project'];
// scene: title, genre, role choices [name,emoji], partner, bg, lines: [who(0 you,1 partner), text, [alt lines], wantEmotion, wantVoice, subtext]
const SC=[
['The Lost Letter','Drama',[['Eleanor','👩'],['Arthur','👨']],['Postman','📮'],'#3a2a4a',[
 [1,'This came for you. It\'s… thirty years late.'],
 [0,'',['From my sister? She never wrote to me.','Who would write to me after all this time?','Thirty years? That\'s impossible.'],4,0,'Your character is stunned. Keep it small and quiet.'],
 [1,'The postmark says 1994. It was stuck behind the sorting machine.'],
 [0,'',['She says she was sorry. She was sorry the whole time.','All those years, I thought she hated me.','I wish I\'d known. I wish I\'d known.'],1,0,'Heartbreak, but held in. Less is more.'],
 [1,'Is there anyone you could tell?'],
 [0,'',['Her daughter. I\'ll call her daughter tonight.','Yes. It\'s not too late. It isn\'t.','I\'m going to write back. Right now.'],0,1,'A turn towards hope. Let it bloom.']]],
['Space Station Panic','Sci-Fi',[['Commander Vega','🧑‍🚀'],['Engineer Kip','👩‍🔧']],['Ship Computer','🤖'],'#0a1030',[
 [1,'Warning. Oxygen levels at forty percent.'],
 [0,'',['Everyone stay where you are!','Computer, seal the lower decks. Now!','Forty percent? That\'s not possible!'],3,2,'Rising alarm, but you\'re in command. Project!'],
 [1,'Leak located. Airlock three. Manual repair required.'],
 [0,'',['I\'ll go. Nobody else is risking it.','Then we fix it ourselves. Together.','Airlock three… of course it is.'],5,1,'Steady, brave, controlled.'],
 [1,'Repair successful. Oxygen stabilising.'],
 [0,'',['We did it! We actually did it!','Ha! Take that, airlock three!','Remind me never to do that again.'],0,2,'Release! Big, joyful relief.']]],
['The Bake-Off Disaster','Comedy',[['Chef Bertie','🧑‍🍳'],['Nan Dot','👵']],['Judge','🧐'],'#4a2a1a',[
 [1,'And what exactly… is this?'],
 [0,'',['It\'s a cake. Mostly. Spiritually, it\'s a cake.','A deconstructed sponge, obviously.','It was a cake when I put it in the oven!'],4,1,'Play it straight. Innocent surprise.'],
 [1,'It appears to be on fire.'],
 [0,'',['That\'s the flambé! Very fancy!','NOBODY PANIC.','Oh no. Oh no no no.'],3,2,'Comic panic. Go big!'],
 [1,'…It\'s actually delicious.'],
 [0,'',['I KNEW it! Genius!','I\'ve always been a visionary.','Could you put that in writing?'],0,2,'Triumph! Milk the moment.']]],
['The Detective\'s Hunch','Mystery',[['Inspector Moss','🕵️'],['Detective Ivy','🕵️‍♀️']],['Butler','🤵'],'#1a2a2a',[
 [1,'I was in the pantry all evening, Inspector.'],
 [0,'',['The pantry. How… convenient.','Then why is there mud on your shoes?','Of course you were.'],5,0,'Cool suspicion. Quiet power.'],
 [1,'I… I may have stepped into the garden. Briefly.'],
 [0,'',['The garden where the necklace was buried?','Briefly. Like you briefly forgot to mention it?','Go on.'],2,1,'Turn the screw. Controlled anger.'],
 [1,'Fine! I hid it — to protect the family!'],
 [0,'',['Protect them? From what?','Now we\'re getting somewhere.','Sit down. Tell me everything.'],4,1,'The twist surprises even you.']]],
['Grand Final Pep Talk','Sport',[['Coach Rae','🧢'],['Captain Jo','🏉']],['Team','👥'],'#1a3a1a',[
 [1,'Coach, we\'re down by twenty. It\'s over.'],
 [0,'',['Over? It\'s not over till the siren!','Look at me. Look at me!','Twenty points? I\'ve seen worse.'],2,2,'Fire them up. Fierce!'],
 [1,'But they\'re bigger, faster…'],
 [0,'',['But you\'ve got more heart than any team I\'ve coached.','Then we play smarter. Every single one of you.','I believe in you. Do you hear me?'],5,1,'Quiet conviction. Pull them in close.'],
 [1,'Let\'s do this!'],
 [0,'',['THAT\'S what I\'m talking about!','Go out there and make history!','Hands in! On three!'],0,2,'Euphoria! Lift the roof!']]],
['Royal Proposal','Romance',[['Princess Aria','👸'],['Prince Leo','🤴']],['Royal Guard','💂'],'#3a1a2a',[
 [1,'Your Highness, the gardener asked to see you. He\'s… nervous.'],
 [0,'',['Nervous? Sam is never nervous.','Send him in. Quickly!','The gardener? Now?'],4,1,'Curious, a little hopeful.'],
 [1,'He says he has grown a rose that has never existed before. And named it after you.'],
 [0,'',['He… named a rose after me?','No one has ever done anything like that.','Oh, Sam.'],0,0,'Soft. Touched. Let the audience lean in.'],
 [1,'Shall I tell the King?'],
 [0,'',['Tell the whole kingdom!','Tell him I\'ve made my choice.','Not yet. This moment is ours.'],0,2,'Joy! Full voice.']]]];
let sc=0,role=0,li=0,pick=null,perf=[],showT=0,res=null,face='Calm';
function startScene(i,r){if(DEMO&&i>0)return window.demoEnd&&window.demoEnd('The full version has all 6 scenes across drama, sci-fi, comedy, mystery, sport and romance, plus your career and fame.');sc=i;role=r||0;li=0;perf=[];pick={l:0,e:5,v:1};res=null;G.state='scene'}
function adv(){const L=SC[sc][5];while(li<L.length&&L[li][0]===1){li++;showT=0;return}if(li>=L.length)finish()}
function cur(){return SC[sc][5][li]}
function perform(){const L=cur();let p=0,notes=[];if(pick.e===L[3]){p+=60;notes.push('Perfect emotion!')}else{const near={0:[4],1:[5],2:[3],3:[2,4],4:[0,3],5:[1]}[L[3]];if(near.includes(pick.e)){p+=35;notes.push('Close: try '+EM[L[3]][0].toLowerCase()+'.')}else{p+=10;notes.push('The scene wanted '+EM[L[3]][0].toLowerCase()+'.')}}
 if(pick.v===L[4]){p+=30;notes.push('Great volume.')}else{p+=10;notes.push(VO[L[4]]+' would land better.')}p+=10;face=EM[pick.e][0];perf.push({line:L[2][pick.l],p,n:notes.join(' ')});voice(pick.v);li++;showT=0;pick={l:0,e:5,v:1};const LL=SC[sc][5];if(li<LL.length&&LL[li][0]===1){}else if(li>=LL.length)finish()}
function nextPartner(){li++;showT=0;if(li>=SC[sc][5].length)finish()}
function finish(){const tot=Math.round(perf.reduce((a,b)=>a+b.p,0)/perf.length);const k=sc+'-'+role;S.best[k]=Math.max(S.best[k]||0,tot);if(!S.roles.includes(k)&&tot>=60)S.roles.push(k);S.fame+=Math.round(tot/10);S.shows++;G.score=S.fame;G.level=S.roles.length;save();res={tot,stars:tot>=90?5:tot>=75?4:tot>=60?3:tot>=40?2:1};G.state='review';clap(res.stars);
 if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Bravo! The full version has all 6 scenes, 12 roles, every genre and your acting career.'),3000)}
function voice(v){try{window._AC=window._AC||new AudioContext();const A=window._AC,o=A.createOscillator(),g=A.createGain();o.type='triangle';o.frequency.value=[180,240,320][v];g.gain.setValueAtTime([.02,.04,.07][v],A.currentTime);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+.4);o.connect(g);g.connect(A.destination);o.start();o.stop(A.currentTime+.4)}catch(e){}}
function clap(n){try{const A=window._AC=window._AC||new AudioContext();for(let i=0;i<n*8;i++){const b=A.createBuffer(1,800,44100),d=b.getChannelData(0);for(let j=0;j<800;j++)d[j]=(Math.random()*2-1)*(1-j/800);const s=A.createBufferSource(),g=A.createGain();g.gain.value=.08;s.buffer=b;s.connect(g);g.connect(A.destination);s.start(A.currentTime+i*.07+Math.random()*.03)}}catch(e){}}
function stage(col){x.fillStyle='#0a0508';x.fillRect(0,0,900,600);const g=x.createLinearGradient(0,40,0,420);g.addColorStop(0,col);g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(60,40,780,380);x.fillStyle='#5a3a20';x.fillRect(40,400,820,40);x.fillStyle='#8a1020';x.fillRect(0,0,80,440);x.fillRect(820,0,80,440);x.fillRect(0,0,900,40);
 const sp=x.createRadialGradient(450,300,10,450,300,260);sp.addColorStop(0,'rgba(255,240,200,.25)');sp.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=sp;x.fillRect(150,40,600,400)}
function actor(X,e,em2,sz){emo(e,X,330,sz||90);if(em2)emo(em2,X+40,265,34)}
function drawScene(){const s=SC[sc];stage(s[4]);T(s[0]+' · '+s[1],450,28,18,'#ffd8a0','center');actor(330,s[2][role][1],li<s[5].length&&cur()[0]===0&&pick?EM[pick.e][1]:EM.find(m=>m[0]===face)[1]);actor(580,s[3][1]);T(s[2][role][0],330,395,15,'#fff','center');T(s[3][0],580,395,15,'#fff','center');
 if(li>=s[5].length)return;const L=cur();x.fillStyle='rgba(255,250,240,.96)';rr(40,450,820,140,14);x.fill();
 if(L[0]===1){T(s[3][0]+':',60,480,16,'#8a1020');x.font='italic 20px Georgia';x.fillStyle='#2a1a1a';x.textAlign='left';wrapT('“'+L[1]+'”',60,512,780,26);button('ok',700,540,140,40,'Your cue ▶',nextPartner,{bg:'#8a1020',ac:'#ffd8a0',fs:16});x.fillStyle='rgba(255,250,240,.9)';rr(500,58,330,40,10);x.fill();T('🎬 '+(perf.length+1)+'/3 your lines',665,84,15,'#5a2a1a','center');return}
 T('🎬 Director: '+L[5],60,474,15,'#8a1020','left','italic ');L[2].forEach((ln,i)=>button('l'+i,60,484+i*34,470,30,(pick.l===i?'▶ ':'')+ln,()=>{pick.l=i},{sel:pick.l===i,bg:'#fff',fg:'#2a1a1a',ac:'#c8a070',fs:13}));
 EM.forEach((m,i)=>button('e'+i,545+(i%3)*80,484+Math.floor(i/3)*34,76,30,m[1]+' '+m[0],()=>{pick.e=i},{sel:pick.e===i,bg:'#fff',fg:'#2a1a1a',ac:'#c8a070',fs:11}));
 VO.forEach((v,i)=>button('v'+i,545+i*80,552,76,30,v,()=>{pick.v=i},{sel:pick.v===i,bg:'#fff',fg:'#2a1a1a',ac:'#c8a070',fs:12}));button('go',790,484,60,98,'🎭',perform,{bg:'#8a1020',ac:'#ffd8a0',fs:26})}
function drawReview(){stage('#2a1a10');emo('🧐',150,200,90);T('Director\'s notes',450,80,30,'#ffd24a','center');T('⭐'.repeat(res.stars)+'☆'.repeat(5-res.stars)+'   '+res.tot+'/100',450,120,26,'#fff','center');
 perf.forEach((p,i)=>{x.fillStyle='rgba(255,250,240,.92)';rr(240,145+i*82,580,72,10);x.fill();T('“'+p.line+'”',256,172+i*82,15,'#2a1a1a','left','italic ');T(p.p+' pts. '+p.n,256,198+i*82,14,'#8a1020','left','')});
 T(res.tot>=75?'You got the part! 🎉':res.tot>=60?'Callback! Nice work.':'Keep rehearsing, the stage awaits.',450,415,22,'#ffd8a0','center');
 button('again',200,470,160,48,'🔁 Retake',()=>startScene(sc,role),{bg:'#8a1020',ac:'#ffd8a0'});button('cast',380,470,160,48,'🎭 Auditions',()=>{G.state='menu'},{bg:'#8a1020',ac:'#ffd8a0'});button('hm',560,470,140,48,'🏠',()=>{G.state='title'},{bg:'#8a1020',ac:'#ffd8a0'})}
function drawMenu(){x.fillStyle='#14080c';x.fillRect(0,0,900,600);T('Audition Board',450,52,32,'#ffd24a','center');T('Fame ⭐ '+S.fame+' · Roles won '+S.roles.length+'/12 · Shows '+S.shows,450,82,15,'#ffd8a0','center','');
 SC.forEach((s,i)=>{const X=50+(i%3)*275,Y=105+Math.floor(i/3)*215,lk=DEMO&&i>0;x.fillStyle='#fff6e6';rr(X,Y,255,200,12);x.fill();x.fillStyle='#8a1020';x.fillRect(X,Y,255,8);T((lk?'🔒 ':'')+s[0],X+128,Y+40,18,'#2a1a1a','center');T(s[1],X+128,Y+62,14,'#8a1020','center','');
  s[2].forEach((r,j)=>{const b=S.best[i+'-'+j];emo(r[1],X+64+j*128,Y+100,40);button('r'+i+j,X+14+j*128,Y+130,100,52,r[0].split(' ').pop(),()=>startScene(i,j),{bg:'#2a1a1a',ac:'#c8a070',fs:13});if(b)T('★'+b,X+64+j*128,Y+194,12,'#8a1020','center','')})});
 button('hm',780,20,90,36,'🏠',()=>{G.state='title'},{bg:'#2a1a1a',ac:'#c8a070'})}
function drawTitle(){stage('#4a1424');T('Coffeebreak',450,120,28,'#ffd8a0','center');T('Acting Role Play',450,190,62,'#fff','center');['🎭','🎬','🌟','🎤'].forEach((e,i)=>emo(e,270+i*120,280+Math.sin(t*2+i)*8,56));
 T('Pick a role. Choose your emotion. Deliver the line. Impress the director.',450,360,17,'#ffd8a0','center','italic ');button('go',350,470,200,56,'🎭 Audition',()=>{G.state='menu'},{bg:'#8a1020',ac:'#ffd8a0'})}
bindInput({});function update(dt){showT+=dt}
function draw(){x.clearRect(0,0,900,600);const s=G.state;if(s==='title')drawTitle();else if(s==='menu')drawMenu();else if(s==='scene')drawScene();else drawReview()}
window.AR={G,S,startScene,perform,nextPartner,get pick(){return pick},get li(){return li},cur};startLoop();
