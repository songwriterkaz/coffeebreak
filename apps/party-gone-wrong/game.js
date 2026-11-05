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
// ===== Coffeebreak Party Gone Wrong =====
const DEMO=!!window.DEMO,SK=DEMO?'pgwD':'pgw';let S={endings:[],best:0,solved:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}
const sv=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};const G={state:'menu',score:0,level:0};window.G=G;
const SUS=[
 {n:'Dougie Pickles',e:'🤵',col:'#7ec8ff',job:'wedding DJ',trait:'glitter',item:'a bent DJ headphone',alibi:'"I was fixing the speakers! Ask the speakers!"',quirk:'talks about his 2009 mixtape non-stop'},
 {n:'Auntie Marjorie Fluff',e:'👵',col:'#ffb3da',job:'retired cake judge',trait:'lavender perfume',item:'a cake fork',alibi:'"I was in the loo, darling. For a while. The punch, you see."',quirk:'rates everything out of ten'},
 {n:'Brayden Sockett',e:'🧢',col:'#9be29b',job:'crypto "entrepreneur"',trait:'energy-drink stickiness',item:'a hardware wallet',alibi:'"I was on a call with Singapore. Very important. Very rich."',quirk:'tries to sell you a coin'},
 {n:'Professor Ingrid Vole',e:'🧐',col:'#ffd27a',job:'amateur magician',trait:'stage-smoke powder',item:'a trick wand',alibi:'"A magician never reveals where she was."',quirk:'pulls coins out of your ear'},
 {n:'Chef Rocco Brine',e:'👨‍🍳',col:'#ff9a7a',job:'caterer who made the punch',trait:'pickle juice',item:'a ladle',alibi:'"I was mopping up sick! SO much sick!"',quirk:'insists the punch was "artisanal"'},
 {n:'Tilly Grimshaw',e:'🦇',col:'#c9a0ff',job:'goth poet next door',trait:'black candle wax',item:'a quill pen',alibi:'"I was in the garden, communing with a slug."',quirk:'answers everything in rhyme'}];
const VIC=['Uncle Barry','Host Gemma Plinth','Neighbour Kev','Party clown Mr Wobbles','Cousin Dee'];
const ROOMS=[['kitchen','🍳 Kitchen'],['lounge','🛋️ Lounge'],['bathroom','🚽 Bathroom (gross)'],['garden','🌳 Garden'],['garage','🚗 Garage'],['attic','🕸️ Attic']];
let R={},cur='start',clues=[],acts=0,dead=[],vom=[],typed=0,shake=0;
function sfx(f,d,ty,v){try{const A=window._AC=window._AC||new (window.AudioContext||window.webkitAudioContext)(),o=A.createOscillator(),g=A.createGain(),n=A.currentTime;o.type=ty||'sine';o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.4),n+d);g.gain.setValueAtTime(v||.15,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.02)}catch(e){}}
function blurgh(){sfx(220,.5,'sawtooth',.18);sfx(90,.7,'square',.12);shake=.4;for(let i=0;i<20;i++)vom.push({x:300+Math.random()*500,y:330,vx:(Math.random()-.5)*200,vy:-Math.random()*200,l:1.5})}
function newGame(){const sh=[...SUS.keys()].sort(()=>Math.random()-.5);R={k:sh[0],red:sh[1],weapon:['the candelabra','a frozen trout','a disco ball','the punch ladle','a garden gnome'][Math.random()*5|0],room:ROOMS[Math.random()*ROOMS.length|0][0]};
 clues=[];acts=0;dead=[VIC[0]];G.score=0;G.state='play';go('start')}
function K(){return SUS[R.k]}
function addClue(c){if(!clues.includes(c)){clues.push(c);G.score+=40;sfx(880,.3,'sine',.12)}}
function tick(){acts++;if(acts%5===0&&dead.length<VIC.length){dead.push(VIC[dead.length]);shake=.6;sfx(120,1,'sawtooth',.25);return 'A scream from upstairs! '+dead[dead.length-1]+' has been found... very, very still. The killer struck again. Hurry up, detective!'}return ''}
function scene(k){const s=K(),d=SUS[R.red];
 const T={
 start:['🎉','Act 1 · The Party','It\'s Gemma Plinth\'s 40th birthday bash. Fairy lights, a dodgy karaoke machine, and an enormous punch bowl that Chef Rocco calls "artisanal". It is fizzing. It is green. It should not be fizzing.',[['Try the punch','punch'],['Politely avoid the punch','avoid'],['Mingle with the guests','mingle']]],
 punch:['🤢','Act 1 · The Punch','You take one sip. It tastes like pickles and regret. Across the room Uncle Barry downs three glasses and turns the colour of a frog.',[['Uh oh...','vomit']]],
 avoid:['🧃','Act 1 · Smart Move','You stick to tap water. Smug. Very smug. Then Uncle Barry downs three glasses of punch and turns the colour of a frog.',[['Uh oh...','vomit']]],
 mingle:['🥳','Act 1 · Mingling','You meet the guests: '+SUS.map(z=>z.e+' '+z.n+' ('+z.job+')').join(', ')+'. Everyone is drinking the punch. Everyone.',[['Watch the punch bowl','vomit']]],
 vomit:['🤮','Act 1 · Chaos','BLURRRGH! Uncle Barry goes off like a fire hose. Then Auntie Marjorie. Then the DJ. Someone slips in it and does the splits. The karaoke machine is now playing "My Heart Will Go On" by itself. It\'s a cartoon chain reaction of sick.',[['Grab a mop','mop'],['Hide behind the sofa','sofa']]],
 mop:['🧹','Act 1 · Mopping','You mop heroically. Chef Rocco mops beside you, muttering "it was ARTISANAL". You notice the punch bottle label: someone added "extra fizz" with a marker pen.',[['Keep mopping...','blackout']]],
 sofa:['🛋️','Act 1 · Behind the Sofa','You find a crisp, a sock and a lost earring. Safe from the splash zone. Then...',[['...the lights flicker','blackout']]],
 blackout:['🌑','Act 1 · Lights Out','CLICK. Total darkness. Somebody screams. Somebody else is sick in the dark (you hear it). When the lights snap back on, Uncle Barry is lying in the hallway... and he is not just sleeping off the punch. Barry has been murdered!',[['Investigate ▶','hub']]],
 hub:['🔍','Act 2 · Investigation','Barry is dead, the doors are locked by a storm, and the killer is one of six guests. Talk to suspects, search rooms, and then accuse. Every few moves the killer may strike again. Victims: '+dead.join(', ')+'.',[['🗣️ Talk to a suspect','talk'],['🚪 Search a room','search'],['🕵️ Examine the body','body'],['☝️ Make an accusation','accuse']]],
 body:['🕵️','Act 2 · The Body','Barry was hit with '+R.weapon+'. On his collar there\'s a smear of '+s.trait+'. Also a lot of punch. So much punch.',[['Back','hub']],()=>addClue('Smear of '+s.trait+' on the body')],
 talk:['🗣️','Act 2 · Suspects','Who do you want to grill?',SUS.map((z,i)=>[z.e+' '+z.n,'s'+i]).concat([['Back','hub']])],
 search:['🚪','Act 2 · Rooms','Which room?',ROOMS.map(r=>[r[1],'r_'+r[0]]).concat([['Back','hub']])],
 accuse:['☝️','Act 3 · The Accusation','Everyone gathers in the lounge, damp and smelling of punch. Who did it?',SUS.map((z,i)=>[z.e+' '+z.n,'a'+i]).concat([['Not yet','hub']])],
 end_right:['🏆','ENDING: Case Closed','"It was '+s.n+'!" You lay out the clues. '+s.n+' bursts into tears, then is sick one last time. Barry had found out the truth about '+s.item+'. The police arrive and slip in the punch. You are a legend.',[]],
 end_perfect:['👑','PERFECT ENDING: Master Detective','You nail '+s.n+' with only Barry lost. Gemma says it\'s the best 40th ever, apart from the murder and the sick. You get a slice of cake. It is not artisanal.',[]],
 end_wrong:['😬','ENDING: Wrong Guess','You accuse the wrong guest! While everyone argues, the real killer, '+s.n+', sneaks out the cat flap. Next week you get a postcard: "Thanks for the party. xx"',[]],
 end_massacre:['💀','ENDING: Last One Standing','You took too long. One by one the guests drop. Finally only you and '+s.n+' are left, holding '+R.weapon+'. "Should have been quicker," they grin. Lights out. (Cartoon fade to black.)',[]]};
 SUS.forEach((z,i)=>{const guilty=i===R.k,sus=i===R.red;T['s'+i]=[z.e,'Act 2 · '+z.n,z.n+', the '+z.job+', '+z.quirk+'. '+z.alibi+(guilty?' They keep wiping their hands, and you smell '+z.trait+'.':sus?' They look very shifty, but their hands are clean.':' Their story checks out with another guest.'),[['Ask about Barry','q'+i],['Back','talk']]];
  T['q'+i]=[z.e,'Act 2 · '+z.n,guilty?'"Barry? Never liked him. He knew things." They hide '+z.item+' behind their back.':sus?'"Barry owed me money! But I didn\'t do it, honest." (Red herring?)':'"Barry was a sweetheart. Sick on my shoes, mind you."',[['Back','talk']],()=>guilty&&addClue(z.n+' hid '+z.item)]});
 ROOMS.forEach(r=>{const hit=r[0]===R.room;T['r_'+r[0]]=['🚪','Act 2 · '+r[1],hit?'Jackpot. Behind a bin you find '+R.weapon+', smeared with '+s.trait+'. Next to it: '+s.item+'.':r[0]==='bathroom'?'You open the door. You close the door. Some things are better left unseen. (Just sick. So much sick.)':'Nothing but party poppers and a suspicious amount of '+d.trait+'. Hmm. Or is that a red herring?',[['Back','search']],()=>{if(hit){addClue('Weapon in the '+r[0]);addClue(s.item+' by the weapon')}}]});
 return T[k]}
let msg='';
function go(k){if(DEMO&&k==='hub'){window.demoEnd&&window.demoEnd('Uncle Barry has been murdered! The full game has the whole investigation: 6 quirky suspects, 6 rooms to search, more victims if you\'re slow, a randomised killer every replay and 4 endings.');return}
 if(k[0]==='a'&&/^a\d$/.test(k)){const i=+k[1];k=i===R.k?(dead.length===1?'end_perfect':'end_right'):'end_wrong'}
 msg='';const inv=['hub','body','talk','search','accuse'].includes(k)||/^[sq]\d|^r_/.test(k);
 if(inv&&!['hub','talk','search','accuse'].includes(k)){msg=tick();if(dead.length>=4){k='end_massacre';msg=''}}
 cur=k;typed=0;const sc=scene(k);if(sc[4])sc[4]();if(k==='vomit')blurgh();if(k==='blackout'){shake=.8;sfx(60,1.2,'square',.2)}G.score+=5;
 if(k.startsWith('end')){if(k==='end_right'||k==='end_perfect'){G.score+=300-acts*5;S.solved++}if(!S.endings.includes(k))S.endings.push(k);S.best=Math.max(S.best,G.score);sv()}}
function update(dt){typed+=dt*70;if(shake>0)shake-=dt;vom=vom.filter(p=>(p.l-=dt)>0);vom.forEach(p=>{p.vy+=500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt})}
function draw(){const sc=G.state==='menu'?null:scene(cur);const dark=cur==='blackout'||cur.startsWith('end_mass');
 x.save();if(shake>0)x.translate((Math.random()-.5)*12,(Math.random()-.5)*12);
 const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dark?'#0a0610':'#3a1a4a');g.addColorStop(1,dark?'#000':'#140818');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<14;i++){x.fillStyle=['#ff5fb0','#ffe066','#7ec8ff','#9be29b'][i%4];x.globalAlpha=dark?.15:.5+.5*Math.sin(t*3+i);x.beginPath();x.arc(30+i*65,22+Math.sin(i)*6,6,0,7);x.fill()}x.globalAlpha=1;
 SUS.forEach((z,i)=>{const X=60+i*48,Y=560;x.globalAlpha=dark?.3:1;emo(z.e,X,Y+Math.sin(t*2+i)*3,34)});x.globalAlpha=1;emo('🥣',820,540,50);
 x.fillStyle='#7fd34e';vom.forEach(p=>{x.beginPath();x.arc(p.x,p.y,6,0,7);x.fill()});
 if(G.state==='menu'){T('Coffeebreak Party Gone Wrong',450,120,40,'#ffe066','center');T('A dark-comedy murder mystery',450,160,22,'#ff8fc8','center','italic ');
  T('Endings: '+S.endings.length+'/4 · Cases solved: '+S.solved+' · Best '+S.best,450,200,16,'#fff','center','');x.fillStyle='#ddd';x.font='16px Georgia';x.textAlign='center';wrapT('The punch was dodgy. The guests are being sick. The lights went out. Now someone is dead, and the killer is different every time you play. Spooky and silly, not gory. Contains cartoon vomit and murder themes.',450,250,620,24);x.textAlign='left';
  button('ng',330,360,240,58,'🎉 Start the party',newGame);x.restore();ent();return}
 x.fillStyle='#000c';rr(40,40,820,330,14);x.fill();x.strokeStyle='#ff8fc855';x.lineWidth=2;x.stroke();
 emo(sc[0],820,80,40);T(sc[1],60,72,17,'#ff8fc8','left','');x.fillStyle='#eee';x.font='17px Georgia';const full=(msg?msg+'  ':'')+sc[2];wrapT(full.slice(0,Math.floor(typed)),60,104,720,25);
 const ch=sc[3],cols=ch.length>4?2:1,bw=cols==2?400:600;ch.forEach((c,i)=>{const cx=cols==2?50+(i%2)*410:150,cy=380+(cols==2?(i/2|0):i)*(cols==2?40:44);button('c'+i,cx,cy,bw,cols==2?34:38,c[0],()=>{typed=999;go(c[1])},{fs:15})});
 if(!ch.length){T('Endings found: '+S.endings.length+'/4',450,400,18,'#ffe066','center');button('again',320,415,260,46,'↺ New party (new killer)',newGame,{fs:15});button('menu',320,470,260,40,'🏠 Menu',()=>{G.state='menu'},{fs:15})}
 if(cur!=='start'&&!cur.startsWith('end'))T('🗝️ '+(clues.join(' · ')||'no clues yet'),50,32,12,'#ffe066','left','');T('💀 '+dead.length+'  Score '+G.score,860,590,13,'#fff','right','');
 x.restore();ent()}
bindInput({down:()=>{typed=999}});startLoop();window.PG={go,newGame,R:()=>R,get cur(){return cur},clues:()=>clues,dead:()=>dead};
