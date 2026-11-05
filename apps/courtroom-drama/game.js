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
// ===== Coffeebreak Courtroom Drama =====
const DEMO=!!window.DEMO,SK=DEMO?'courtDemo':'courtSave';
let S={won:0,lost:0,done:[],love:{theo:0,mari:0,jas:0},partner:null,rep:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const G={state:'title',score:0,level:0};window.G=G;
let AC=null;const ac=()=>{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC};
function os(f,d,v,tp,f2){try{const a=ac(),o=a.createOscillator(),g=a.createGain();o.type=tp||'sine';o.frequency.setValueAtTime(f,a.currentTime);if(f2)o.frequency.exponentialRampToValueAtTime(f2,a.currentTime+d);g.gain.setValueAtTime(v,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d+.05)}catch(e){}}
const SFX={gavel:()=>{os(140,.15,.5,'square',60);setTimeout(()=>os(140,.15,.5,'square',60),220)},ding:()=>{os(880,.4,.12);setTimeout(()=>os(1320,.5,.1),120)},buzz:()=>os(160,.4,.15,'sawtooth',90),dream:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>os(f,.6,.08,'triangle'),i*120)),heart:()=>[0,1].forEach(i=>setTimeout(()=>os(660+i*220,.3,.1,'sine'),i*150)),gasp:()=>os(500,.3,.08,'triangle',900)};
// ---- people (all original) ----
const FIRM='Fizzwick, Marlowe & Pinch';
const P={boss:['Desmond Fizzwick','👨‍💼','Senior partner. Talks to his bonsai.'],rival:['Priya Holt','👩‍💼','Ambitious associate. Colour-coded everything.'],gus:['Gus Tamberlane','🧔','Associate. Brings a ukulele to depositions.'],nell:['Nell','👩‍🦰','Assistant. Knows every secret in the building.'],
 theo:['Theo Vance','🧑‍⚖️','Charming public defender with terrible ties.'],mari:['Marisol Cruz','👩‍⚖️','Fierce prosecutor. Never loses a staring contest.'],jas:['Jasper Quill','🧑‍🍳','The barista downstairs. Writes poems on cups.'],
 judge:['Judge Harriet Bloom','👩‍⚖️','Stern, fair, secretly loves puns.'],rex:['Rex Pemberton','🤵','Opposing counsel. Very shiny shoes.'],lou:['Velvet Lou','🎤','The bar singer. Knows exactly what song you need.']};
// ---- cases ----
// interview:[q,[ans,fact?]] evidence:[[name,emoji,good]] trial:[[statement,[[choice,pts,reply]]]] closing:[[text,pts]]
const CASES=[
{t:'The People v. Mr Whiskers',c:'Doreen Puddle',e:'👵',charge:'Her cat allegedly stole 47 garden gnomes from the neighbours.',
 iv:[['Where were you on the night of the gnome-napping?',[['"Knitting. Mr Whiskers was asleep on my feet all night."',1],['"Out. Somewhere. Who can say?"',0]]],['Does Mr Whiskers have a motive?',[['"He hates gnomes. But he is far too lazy to carry one."',1],['"He has expensive taste in garden ornaments."',0]]],['Anyone else who might want gnomes?',[['"The neighbour\'s teenage son just opened a \'vintage gnome\' online shop..."',2],['"No idea, dear."',0]]]],
 ev:[['Cat weighs 9 kg, sleeps 20 hrs/day','🐈',1],['Online shop receipts: 47 gnomes sold','🧾',1],['Muddy paw print (size: dog)','🐾',1],['A suspicious ball of yarn','🧶',0],['Doreen\'s shopping list','📝',0]],
 tr:[['"Your Honour, everyone KNOWS cats are criminals."',[['🙋 Objection! Speculation!',2,'Sustained. Cats are innocent until proven guilty.'],['🙋 Objection! I find that hurtful!',0,'Overruled. Feelings are not a legal ground, counsel.'],['🤐 Say nothing',0,'Rex smirks. The jury nods along.']]],
  ['"The neighbour\'s son is a fine young man. He told me so himself."',[['🙋 Objection! Hearsay!',2,'Sustained. The jury will disregard.'],['🙋 Objection! Leading!',0,'Overruled. He is not even questioning anyone.'],['😴 Pretend to sneeze',0,'Gesundheit. Nothing changes.']]],
  ['"Mr Whiskers, isn\'t it TRUE you were seen near the gnomes?"',[['🙋 Objection! Badgering the witness... the witness is a cat!',2,'Sustained, and frankly, everyone is confused.'],['🙋 Objection! Relevance!',1,'Sustained, reluctantly.'],['🐈 Let the cat answer',0,'Mr Whiskers coughs up a hairball. Not great.']]]],
 cl:[['"Ladies and gentlemen: a 9 kg cat who sleeps 20 hours a day did not haul 47 gnomes. But someone selling 47 gnomes online did."',3],['"Look at his little face. Could THIS face steal?"',1],['"Gnomes are creepy anyway. Who cares?"',0]]},
{t:'Flapjack v. The Happy Hen Café',c:'Barry Flapjack',e:'🧑‍🍳',charge:'Barry sues a café for calling its pancakes "the world\'s fluffiest". He says his are fluffier.',
 iv:[['How do you measure fluffiness?',[['"With my patented Fluff-O-Meter. It\'s certified!"',1],['"I just... know."',0]]],['Did you try their pancakes?',[['"Yes, under oath I swear they were dense as a doorstop."',1],['"No, I\'m boycotting."',0]]],['What do you actually want?',[['"An apology and for them to say \'second fluffiest\'."',2],['"Ten million dollars and a pony."',0]]]],
 ev:[['Fluff-O-Meter certificate','📏',1],['Side-by-side pancake photos','📸',1],['Café menu: "world\'s fluffiest"','📜',1],['A single blueberry','🫐',0],['Barry\'s horoscope','🔮',0]],
 tr:[['"My client\'s pancakes are fluffy because the Pancake Gods said so."',[['🙋 Objection! Lacks foundation!',2,'Sustained. The Pancake Gods are not on the witness list.'],['🙋 Objection! Delicious!',0,'Overruled, but noted.'],['🥞 Ask for a sample',1,'Judge Bloom allows it. She takes a bite. Hmm.']]],
  ['"Isn\'t it true, Mr Flapjack, that you are just JEALOUS?"',[['🙋 Objection! Argumentative!',2,'Sustained.'],['🙋 Objection! Correct, but rude!',0,'Overruled. And please never say that again.'],['😢 Let Barry cry',0,'Barry weeps into a napkin. The jury is moved... to lunch.']]],
  ['"The café has a 5-star online review from \'TotallyNotTheOwner99\'."',[['🙋 Objection! Authentication!',2,'Sustained. Nobody can verify that account.'],['🙋 Objection! Typo in the username!',0,'Overruled.'],['📱 Leave a review yourself',0,'Contempt warning. Phone away, counsel.']]]],
 cl:[['"The certified Fluff-O-Meter does not lie. Barry only asks for honesty, and maybe a smaller font."',3],['"Pancakes are life. Rule for Barry."',1],['"I\'m hungry. Can we wrap this up?"',0]]},
{t:'In re: The Haunted Timeshare',c:'Gloria Fenwick',e:'👩',charge:'Gloria wants her money back. The timeshare came with a ghost who critiques her cooking.',
 iv:[['Did they tell you about the ghost?',[['"The brochure said \'lively atmosphere\'. Lively! It\'s DEAD!"',1],['"I didn\'t read the brochure."',0]]],['What does the ghost do?',[['"Rearranges my spices alphabetically and moans \'too much salt\'."',1],['"Nothing really, it\'s quite nice."',0]]],['Any witnesses?',[['"Three previous owners. All left within a week."',2],['"My goldfish saw it."',1]]]],
 ev:[['Brochure: "lively atmosphere"','📰',1],['Spice rack, alphabetised overnight','🧂',1],['3 previous owners\' statements','📑',1],['Ghost-hunting app screenshot','📱',0],['A suspicious sheet with eyeholes','👻',0]],
 tr:[['"Ghosts aren\'t real, so there is nothing to disclose."',[['🙋 Objection! Then explain the spices!',1,'Overruled, but the jury looks thoughtful.'],['📑 Present the 3 owner statements',2,'The jury gasps. Three owners, one ghost, zero refunds.'],['👻 Say "BOO" loudly',0,'Judge Bloom jumps. Contempt warning.']]],
  ['"Mrs Fenwick, perhaps YOU are the one moaning about salt?"',[['🙋 Objection! Argumentative!',2,'Sustained.'],['🙋 Objection! She uses no salt at all!',1,'Overruled, but the jury chuckles.'],['🧂 Pass the salt',0,'Not now, counsel.']]],
  ['"The ghost is a selling point! Free cooking lessons!"',[['🙋 Objection! Non-responsive!',2,'Sustained. Answer the question, Mr Pemberton.'],['🙋 Objection! The ghost is a terrible cook!',0,'Overruled. Hearsay from a ghost.'],['🍝 Agree, invite the ghost to dinner',0,'The ghost RSVPs. Awkward.']]]],
 cl:[['"\'Lively atmosphere\' is not \'unlicensed spectral food critic\'. Disclose your ghosts, refund the money."',3],['"Who you gonna call? Your lawyer."',1],['"I also saw a ghost once."',0]]},
{t:'Divorce of the Dancing Duo',c:'Rico & Lana Starr',e:'💃',charge:'A ballroom couple splitting up. Both want custody of the sequinned tango shoes.',
 iv:[['Who bought the shoes?',[['"Lana did, with her prize money from the 2019 Glitter Cup."',2],['"We found them in a dumpster, honestly."',0]]],['Who wears them more?',[['"Lana. Rico has two left feet. Literally, he wears them backwards."',1],['"Both of us, on alternate Tuesdays."',0]]],['Can they share?',[['"Lana\'s size 6. Rico is a size 12."',1],['"We\'ll stretch them."',0]]]],
 ev:[['2019 Glitter Cup prize receipt','🏆',1],['Shoe size measurements','👠',1],['Dance video: Rico trips 14 times','🎞️',1],['A rose from their wedding','🌹',0],['Rico\'s fake moustache','🥸',0]],
 tr:[['"These shoes were a GIFT from Rico\'s heart!"',[['🏆 Show the prize receipt',2,'The receipt is in Lana\'s name. Rico\'s heart is out of pocket.'],['🙋 Objection! Too dramatic!',0,'Overruled. This is a dance case, drama is expected.'],['💃 Demonstrate a tango',1,'Impressive footwork. Still overruled.']]],
  ['"Mrs Starr, do you even LIKE tango?"',[['🙋 Objection! Relevance!',2,'Sustained.'],['🙋 Objection! She loves it!',0,'Overruled.'],['🕺 Dip the witness',0,'Please do not dip the witness.']]],
  ['"My client could squeeze into a size 6. With effort."',[['👠 Present the size measurements',2,'A size 12 foot. A size 6 shoe. Physics wins.'],['🙋 Objection! Cinderella precedent!',1,'Sustained, surprisingly. Judge Bloom loves a fairy tale.'],['😂 Laugh',0,'Contempt warning.']]]],
 cl:[['"She won them, she fits them, she dances in them. The shoes belong with Lana."',3],['"Shoes are for walking. Divorce is for... walking away."',1],['"Can I keep the shoes?"',0]]},
{t:'The Talking Parrot Defamation Suit',c:'Captain Bellamy',e:'🦜',charge:'A mayor sues because the Captain\'s parrot told a TV crew the mayor "smells like old cheese".',
 iv:[['Did you teach the parrot that?',[['"Never! He learned it from the mayor\'s OWN campaign manager."',2],['"Maybe once. Or forty times."',0]]],['Is it true?',[['"Truth is a defence, and I have the cheese receipts."',1],['"No comment."',0]]],['Can the parrot be trusted?',[['"He also says \'pretty bird\' and \'pass the crackers\'. So... mostly."',1],['"He\'s a compulsive liar."',0]]]],
 ev:[['Campaign manager\'s voicemail','📞',1],['Mayor\'s weekly cheese order','🧀',1],['Parrot vocabulary list (32 words)','📋',1],['A cracker','🍘',0],['Pirate hat','🏴‍☠️',0]],
 tr:[['"A parrot cannot repeat what it never heard."',[['📞 Play the campaign manager voicemail',2,'"He smells like old cheese," says the voicemail. The parrot nods.'],['🙋 Objection! The parrot is a professional!',0,'Overruled.'],['🦜 Ask the parrot',1,'"PRETTY BIRD." Not helpful, but adorable.']]],
  ['"This statement damaged the mayor\'s reputation!"',[['🙋 Objection! Assumes facts not in evidence!',2,'Sustained. His poll numbers went UP.'],['🧀 Present the cheese order',1,'Twelve kilos of brie a week. The jury sniffs thoughtfully.'],['👃 Sniff the mayor',0,'Absolutely not, counsel.']]],
  ['"Captain, did you or did you NOT buy that parrot a tiny microphone?"',[['🙋 Objection! Compound question!',1,'Sustained, sort of.'],['🙋 Objection! Irrelevant, the mic was a toy!',2,'Sustained. It was a toy.'],['🎤 Sing into it',0,'Very nice voice. Still contempt.']]]],
 cl:[['"A parrot repeated what a human said. If anyone owes an apology, it\'s the campaign manager, and maybe the brie."',3],['"Polly wants a verdict!"',1],['"Birds can\'t be sued. I checked. Kind of."',0]]}];
// ---- gossip, dreams, romance ----
const GOSSIP=[['nell','Psst. Desmond paid for his bonsai\'s therapy. Out of the petty cash.'],['gus','I wrote a ukulele song about the copier. It jams too. We have a lot in common.'],['rival','I\'m not hiding in here. I\'m... rehearsing. Mirror cross-examination is valid.'],['nell','Theo from the PD\'s office asked if you were single. I said "ask them yourself". Then I told everyone.'],['boss','The secret to winning? Never let them see you sweat. I wear two undershirts.'],['gus','Priya alphabetised my snacks. I can\'t find the chips. They\'re under P for "potato".'],['nell','Marisol Cruz smiled at you in the lift. Marisol does NOT smile.'],['rival','Fine. You were good today. Don\'t let it go to your hair.'],['boss','Unisex bathroom rule #1: whatever is said by the hand dryer, stays by the hand dryer.'],['nell','Jasper downstairs wrote your name on a cup with a little heart. Just saying.']];
const DREAMS=[['The judge\'s gavel turns into a giant cupcake and the jury starts a conga line.','🧁'],['A tiny dancing baby in a nappy boogies across the courtroom. Nobody else sees it.','👶'],['You win so hard that confetti cannons fire and Judge Bloom crowd-surfs.','🎉'],['Rex Pemberton\'s shiny shoes reflect sunlight straight into his own eyes. Justice!','✨'],['Your heart literally floats out of your chest towards the public defender\'s desk.','💗'],['The witness stand becomes a karaoke booth. Everyone sings the closing argument.','🎤'],['You are a superhero lawyer. Your cape says "OBJECTION".','🦸'],['A unicorn delivers the verdict in a tiny envelope.','🦄']];
const LOVE={theo:[['Share your lunch on the courthouse steps','He offers you the better half of his sandwich. And his worst tie.',2],['Argue about the best legal drama ever','You disagree completely. It\'s the best conversation you\'ve had all year.',2],['Accidentally call him "Your Honour"','He grins. "I\'ll take it."',1]],
 mari:[['Challenge her to a staring contest','You blink first. She laughs, and it\'s like sunshine.',2],['Bring her a coffee before court','"How did you know oat milk?" Nell told you, obviously.',2],['Object to her outfit','"Overruled," she says, and walks off smiling.',1]],
 jas:[['Read today\'s poem on your cup','"Your objections, sustained / in my heart, a verdict: you." Oh no. Oh YES.',2],['Help close up the café','You dance with a mop to the radio. He joins in.',2],['Order something complicated','Triple-shot half-caf caramel with a smile. He nails it.',1]]};
const LKEY=['theo','mari','jas'];
// ---- state ----
let ci=0,cs=null,step=0,msg='',msgT=0,dream=null,dreamT=0,gIdx=0,romTarget=null,romMsg='',barT=0,bubbles=[];
const pickCase=()=>{for(let i=0;i<CASES.length;i++)if(!S.done.includes(i))return i;return Math.floor(Math.random()*CASES.length)};
function newCase(){ci=DEMO?0:pickCase();cs={pts:0,facts:0,ev:[],obj:0,tr:0,iv:0,ans:null,closing:null};G.state='brief';msg=''}
function toast(m){msg=m;msgT=3}
function maybeDream(){if(Math.random()<.28)daydream()}
function daydream(){dream=DREAMS[Math.floor(Math.random()*DREAMS.length)];dreamT=4.5;SFX.dream()}
function verdict(){const C=CASES[ci];const score=cs.pts;const win=score>=9;cs.win=win;SFX.gavel();if(win){S.won++;S.rep+=3}else{S.lost++;S.rep+=1}if(!S.done.includes(ci))S.done.push(ci);G.score=S.won;G.level=S.done.length;save();G.state='verdict';
 if(DEMO)setTimeout(()=>window.demoEnd&&window.demoEnd('Case closed! The full game has 5 wacky cases, the unisex bathroom gossip, the bar with Velvet Lou, daydreams, and three romance routes.'),5000)}
// ---- drawing ----
function bg(top,bot){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,top);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,900,600)}
function office(){bg('#f6dfe6','#c88a9a');x.fillStyle='#8a4a5a';x.fillRect(0,420,900,180);x.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<4;i++){x.fillRect(60+i*220,60,160,120)}x.fillStyle='#5a2a3a';for(let i=0;i<4;i++){x.fillRect(138+i*220,60,4,120);x.fillRect(60+i*220,118,160,4)}}
function courtroom(){bg('#3a1424','#1a0a10');x.fillStyle='#6a3a1a';x.fillRect(300,170,300,140);x.fillStyle='#8a5a2a';x.fillRect(290,160,320,20);emo('⚖️',450,120,50);emo(P.judge[1],450,215,60);x.fillStyle='#4a2a10';x.fillRect(0,440,900,160);T(P.judge[0],450,300,15,'#ffe9c7','center')}
function panel(X,Y,w,h){x.fillStyle='rgba(20,6,12,.82)';rr(X,Y,w,h,16);x.fill();x.strokeStyle='#e8a0b0';x.lineWidth=2;x.stroke()}
function person(k,X,Y,s){emo(P[k][1],X,Y+Math.sin(t*2+X)*3,s||70);T(P[k][0],X,Y+(s||70)*.75,14,'#fff','center')}
function drawTitle(){bg('#2a0a18','#7a2a44');for(let i=0;i<12;i++){x.fillStyle='rgba(255,200,220,'+(.05+.04*Math.sin(t+i))+')';x.beginPath();x.arc((i*97+t*15)%960-30,80+(i*53)%420,30+i%4*12,0,7);x.fill()}
 x.save();x.shadowColor='#ff8ab0';x.shadowBlur=25;T('Coffeebreak',450,140,30,'#ffb0d0','center');T('Courtroom Drama',450,210,62,'#fff','center');x.restore();T('Objections. Gossip. Romance. Daydreams.',450,250,19,'#ffd24a','center','');
 ['⚖️','👩‍⚖️','💼','💗','🎤'].forEach((e,i)=>emo(e,250+i*100,320+Math.sin(t*2+i)*10,54));
 button('go',330,380,240,60,'💼 Start work',()=>{ac();G.state='hub'},{fs:20,bg:'#8a1030',fg:'#fff'});T('Cases won: '+S.won+' · Reputation: '+S.rep,450,475,15,'#ffb0d0','center','');T('A young lawyer at '+FIRM,450,500,14,'#ffe9c7','center','')}
function drawHub(){office();T(FIRM,450,40,26,'#5a1a2a','center');person('boss',150,330);person('rival',350,330);person('gus',550,330);person('nell',750,330);
 const C=DEMO&&S.done.includes(0);
 button('case',60,455,250,54,C?'📁 More cases in full game':'📁 Take a new case',()=>{if(C){window.demoEnd&&window.demoEnd();return}newCase()},{fs:16,bg:'#8a1030',fg:'#fff'});
 button('wc',325,455,250,54,'🚻 Unisex bathroom',()=>{if(DEMO&&!S.done.includes(0)){toast('Finish your first case first!');return}gIdx=Math.floor(Math.random()*GOSSIP.length);G.state='bath'},{fs:16});
 button('bar',590,455,250,54,'🍸 The bar after work',()=>{if(DEMO&&!S.done.includes(0)){toast('Finish your first case first!');return}barT=0;G.state='bar'},{fs:16});
 button('love',60,520,250,50,'💗 Romance',()=>{if(DEMO){toast('Romance routes are in the full game 💗');return}romTarget=null;romMsg='';G.state='love'},{fs:16});
 button('dream',325,520,250,50,'☁️ Daydream',daydream,{fs:16});
 button('st',590,520,250,50,'📊 Won '+S.won+' · Lost '+S.lost,()=>{},{fs:15});
 T('Rep '+S.rep,850,40,15,'#5a1a2a','right')}
function drawBrief(){office();const C=CASES[ci];panel(80,60,740,420);emo(C.e,160,150,80);T('NEW CASE',260,110,16,'#ffd24a');T(C.t,260,145,28,'#fff');x.fillStyle='#ffe9c7';x.font='18px Georgia';wrapT('Client: '+C.c,260,180,520,24);wrapT(C.charge,120,250,660,28);
 T('Opposing counsel: '+P.rex[0]+' '+P.rex[1],120,360,17,'#ffb0d0','left','');T('Presiding: '+P.judge[0],120,390,17,'#ffb0d0','left','');
 button('go',330,420,240,50,'🗣️ Interview the client',()=>{cs.iv=0;cs.ans=null;G.state='iv'},{fs:17,bg:'#8a1030',fg:'#fff'})}
function drawIV(){office();const C=CASES[ci];emo(C.e,180,260,110);T(C.c,180,340,16,'#5a1a2a','center');panel(330,60,520,380);T('Client interview '+(cs.iv+1)+'/3',350,95,15,'#ffd24a');x.fillStyle='#fff';x.font='bold 21px Georgia';wrapT(C.iv[cs.iv][0],350,130,480,26);
 if(cs.ans===null){C.iv[cs.iv][1].forEach((a,i)=>button('a'+i,350,200+i*90,480,76,'',()=>{cs.ans=i;cs.facts+=a[1];cs.pts+=a[1]?1:0;a[1]?SFX.ding():SFX.buzz()},{fs:14}));C.iv[cs.iv][1].forEach((a,i)=>{x.fillStyle='#ffe9c7';x.font='16px Georgia';wrapT('Probe: '+(i?'maybe skip this':'press for detail'),370,228+i*90,440,20)})}
 else{const a=C.iv[cs.iv][1][cs.ans];x.fillStyle='#ffe9c7';x.font='italic 19px Georgia';wrapT(a[0],350,210,480,26);T(a[1]?'📝 Useful fact noted!':'🤷 Not much help.',350,330,17,a[1]?'#8aff9a':'#ffb0b0');
  button('nx',520,370,300,50,cs.iv<2?'Next question ▶':'🔍 Pick evidence ▶',()=>{if(cs.iv<2){cs.iv++;cs.ans=null}else G.state='ev'},{fs:16})}}
function drawEv(){office();const C=CASES[ci];panel(60,40,780,470);T('Pick 3 pieces of evidence to bring to court',450,80,22,'#fff','center');
 C.ev.forEach((e,i)=>{const sel=cs.ev.includes(i);button('e'+i,100,105+i*66,700,56,e[1]+'  '+e[0],()=>{if(sel)cs.ev=cs.ev.filter(z=>z!==i);else if(cs.ev.length<3)cs.ev.push(i)},{sel,fs:17})});
 button('go',300,450,300,48,'⚖️ To court! ('+cs.ev.length+'/3)',()=>{cs.ev.forEach(i=>cs.pts+=C.ev[i][2]);cs.tr=0;cs.obj=null;G.state='trial';SFX.gavel();maybeDream()},{dis:cs.ev.length<3,fs:17,bg:'#8a1030',fg:'#fff'})}
function drawTrial(){courtroom();const C=CASES[ci];emo(P.rex[1],170,400,80);T(P.rex[0],170,470,14,'#fff','center');emo('🧑‍💼',730,400,80);T('You',730,470,14,'#fff','center');
 const st=C.tr[cs.tr];panel(40,20,820,110);T('Trial · '+C.t,60,48,15,'#ffd24a');x.fillStyle='#fff';x.font='italic 20px Georgia';wrapT(P.rex[0]+': '+st[0],60,80,780,24);
 if(cs.obj===null){st[1].forEach((o,i)=>button('o'+i,250,330+i*62,400,52,o[0],()=>{cs.obj=i;cs.pts+=o[1];o[1]>=2?(SFX.gavel(),G.flashOK=1):SFX.buzz()},{fs:15}))}
 else{const o=st[1][cs.obj];panel(230,330,440,160);T(P.judge[0]+':',250,360,15,'#ffd24a');x.fillStyle='#fff';x.font='19px Georgia';wrapT(o[2],250,392,400,24);
  button('nx',330,445,240,40,cs.tr<2?'Continue ▶':'🎙️ Closing argument ▶',()=>{if(cs.tr<2){cs.tr++;cs.obj=null;maybeDream()}else G.state='close'},{fs:15})}}
function drawClose(){courtroom();const C=CASES[ci];panel(40,20,820,80);T('Your closing argument. Make it count.',450,68,24,'#fff','center');
 if(cs.closing===null)C.cl.forEach((o,i)=>{button('c'+i,60,330+i*86,780,76,'',()=>{cs.closing=i;cs.pts+=o[1];SFX.gasp()},{fs:14});x.fillStyle='#ffe9c7';x.font='17px Georgia';wrapT(o[0],80,360+i*86,740,22)});
 else{panel(60,330,780,160);x.fillStyle='#fff';x.font='italic 20px Georgia';wrapT(C.cl[cs.closing][0],80,370,740,26);button('v',330,445,240,40,'🔨 Hear the verdict',verdict,{fs:15,bg:'#8a1030',fg:'#fff'})}}
function drawVerdict(){courtroom();const w=cs.win;panel(150,330,600,200);T(w?'NOT LIABLE / CASE WON! 🎉':'Case lost... this time.',450,380,30,w?'#8aff9a':'#ffb0b0','center');x.fillStyle='#fff';x.font='18px Georgia';x.textAlign='center';
 wrapT(w?'Judge Bloom: "Counsel, that was a delight. Also, I loved the bit about the '+(['cat','pancakes','ghost','shoes','parrot'][ci])+'."':'Judge Bloom: "Good effort. More evidence next time, and fewer sneezes."',450,420,540,24);x.textAlign='left';T('Case score: '+cs.pts+' / 18',450,480,15,'#ffd24a','center','');
 if(w)for(let i=0;i<20;i++)emo(['🎉','✨','💗'][i%3],(i*47+t*80)%900,(i*91+t*120)%600,24);
 button('h',330,540,240,46,'💼 Back to the office',()=>{G.state='hub';if(!DEMO&&Math.random()<.5)daydream()},{fs:16})}
function drawBath(){bg('#e8f4f8','#a8c8d8');x.fillStyle='#fff';x.fillRect(80,90,220,300);x.fillStyle='#d0e4ec';x.fillRect(100,110,180,180);emo('🚻',190,60,40);emo('🪞',190,200,90);x.fillStyle='#c0d8e0';for(let i=0;i<3;i++)x.fillRect(420+i*150,80,120,330);
 const g=GOSSIP[gIdx];person(g[0],230,460,80);panel(380,430,480,140);T(P[g[0]][0]+' (by the hand dryer):',400,460,15,'#ffd24a');x.fillStyle='#fff';x.font='italic 18px Georgia';wrapT('"'+g[1]+'"',400,490,440,23);
 button('m',380,20,230,44,'🫧 More gossip',()=>{gIdx=(gIdx+1)%GOSSIP.length;SFX.gasp()},{fs:15});button('h',630,20,230,44,'💼 Back to work',()=>G.state='hub',{fs:15})}
function drawBar(){bg('#1a0820','#3a1030');for(let i=0;i<14;i++){x.fillStyle='hsla('+(i*30+t*40)%360+',80%,70%,.25)';x.beginPath();x.arc(60+i*60,40+Math.sin(t+i)*10,8,0,7);x.fill()}
 x.fillStyle='#4a1a2a';x.fillRect(0,420,900,180);x.fillStyle='#ffb0d0';x.beginPath();x.ellipse(450,300,160,30,0,0,7);x.fill();emo(P.lou[1],450,230+Math.sin(t*3)*4,90);T(P.lou[0],450,330,16,'#1a0820','center');
 ['🎵','🎶'].forEach((n,i)=>emo(n,350+i*200+Math.sin(t*2+i)*20,170-((t*30+i*60)%100),30));
 const lines=['"This one goes out to the lawyer in the corner who argued a parrot case today."','"Sing your heart out, honey. Tomorrow you object again."','"Every verdict deserves a little ballad."'];
 panel(80,440,740,70);x.fillStyle='#fff';x.font='italic 18px Georgia';wrapT(lines[Math.floor(t/6)%3],100,470,700,24);
 emo('🍸',120,380,46);emo(P.gus[1],780,380,60);
 button('s',80,525,240,50,'🎤 Request a song',()=>{try{document.getElementById('skip').click()}catch(e){}toast('Velvet Lou nods and starts your song 🎶');SFX.ding()},{fs:15});
 button('d',335,525,230,50,'🍸 Order a drink',()=>{toast(['Jasper\'s cousin makes you a "Sustained Spritz".','A "Hung Jury" mocktail. Delightfully undecided.','"Closing Argument" martini. Strong finish.'][Math.floor(Math.random()*3)]);SFX.ding()},{fs:15});
 button('h',580,525,240,50,'💼 Back to work',()=>G.state='hub',{fs:15})}
function drawLove(){bg('#ffe0ea','#e890b0');T('💗 Romance',450,60,34,'#7a1030','center');
 LKEY.forEach((k,i)=>{const X=150+i*300;person(k,X,170,90);x.fillStyle='#7a1030';x.font='14px Georgia';x.textAlign='center';wrapT(P[k][2],X,265,240,18);x.textAlign='left';
  for(let h=0;h<5;h++)emo(S.love[k]>h*2?'❤️':'🤍',X-60+h*30,320,20);
  button('l'+k,X-110,345,220,44,S.partner===k?'💞 Dating!':'Spend time',()=>{romTarget=k;romMsg=''},{fs:15,sel:romTarget===k})});
 if(romTarget){panel(60,400,780,180);if(!romMsg){LOVE[romTarget].forEach((o,i)=>button('r'+i,80,415+i*52,740,44,o[0],()=>{romMsg=o[1];S.love[romTarget]+=o[2];if(S.love[romTarget]>=10&&!S.partner){S.partner=romTarget;romMsg+='  💞 You\'re officially dating '+P[romTarget][0]+'!'}save();SFX.heart()},{fs:15}))}
  else{x.fillStyle='#fff';x.font='italic 19px Georgia';wrapT(romMsg,80,445,740,26);button('ok',330,530,240,40,'💗 Lovely',()=>{romMsg='';romTarget=null},{fs:15})}}
 button('h',20,20,160,40,'💼 Back',()=>G.state='hub',{fs:15})}
function drawDream(){if(dreamT<=0)return;const a=Math.min(1,dreamT,4.5-dreamT+.3);x.globalAlpha=a*.92;const g=x.createRadialGradient(450,300,50,450,300,500);g.addColorStop(0,'#fff0f8');g.addColorStop(1,'#c8a0ff');x.fillStyle=g;x.fillRect(0,0,900,600);
 for(let i=0;i<10;i++){x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc((i*110+t*30)%1000-50,80+(i%3)*30,40,0,7);x.fill()}x.globalAlpha=a;
 emo(dream[1],450+Math.sin(t*4)*60,260+Math.cos(t*3)*20,140);T('☁️ Daydream…',450,90,24,'#7a3090','center');x.fillStyle='#4a1a5a';x.font='italic 22px Georgia';x.textAlign='center';wrapT(dream[0],450,420,700,30);x.textAlign='left';x.globalAlpha=1;
 button('wake',380,500,140,40,'Snap out of it',()=>{dreamT=0},{fs:14})}
bindInput({});
function update(dt){if(msgT>0)msgT-=dt;if(dreamT>0)dreamT-=dt;barT+=dt}
function draw(){x.clearRect(0,0,900,600);const s=G.state;({title:drawTitle,hub:drawHub,brief:drawBrief,iv:drawIV,ev:drawEv,trial:drawTrial,close:drawClose,verdict:drawVerdict,bath:drawBath,bar:drawBar,love:drawLove})[s]();
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);panel(200,10,500,44);T(msg,450,38,16,'#fff','center','');x.globalAlpha=1}drawDream();x.textAlign='left'}
window.CT={G,S,CASES,newCase,verdict,daydream,get cs(){return cs}};startLoop();
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic';x.textAlign='left'}
const _btn=button;button=function(){_btn.apply(null,arguments);x.textAlign='left'};
