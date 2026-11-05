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
function skull(X,Y,s,col){x.fillStyle=col||'#ffe9ef';x.beginPath();x.arc(X,Y,6*s,0,7);x.fill();x.fillRect(X-3.5*s,Y+3*s,7*s,4*s);x.fillStyle='#12060c';x.beginPath();x.arc(X-2.3*s,Y,1.6*s,0,7);x.arc(X+2.3*s,Y,1.6*s,0,7);x.fill()}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}x.fillStyle='#8a1030';x.beginPath();x.arc(X,Y,2.2*s,0,7);x.fill()}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ---- Coffeebreak Blockbuster: movie studio tycoon ----
const DEMO=()=>!!window.DEMO;
const GEN=[['Action','💥'],['Comedy','😂'],['Horror','👻'],['Romance','💘'],['Sci-Fi','🚀'],['Fantasy','🐉'],['Musical','🎤'],['Western','🤠'],['Drama','🎭'],['Animation','🐰']];
const TOP=[['Coffee','☕'],['Vampires','🧛'],['Aliens','👽'],['Robots','🤖'],['Pirates','🏴‍☠️'],['Dogs','🐶'],['Time travel','⏳'],['Weddings','💍'],['Heists','💰'],['Ghosts','👻'],['Dinosaurs','🦖'],['Space','🪐'],['Zombies','🧟'],['Witches','🧙'],['Bakery','🧁'],['Pop stars','🌟'],['Ninjas','🥷'],['Surfing','🏄']];
const GREAT={'Horror:Vampires':3,'Horror:Ghosts':3,'Horror:Zombies':3,'Sci-Fi:Aliens':3,'Sci-Fi:Robots':3,'Sci-Fi:Space':3,'Sci-Fi:Time travel':3,'Action:Heists':3,'Action:Ninjas':3,'Action:Pirates':2,'Romance:Weddings':3,'Romance:Coffee':3,'Romance:Bakery':2,'Comedy:Dogs':3,'Comedy:Weddings':2,'Comedy:Zombies':2,'Fantasy:Witches':3,'Fantasy:Dinosaurs':2,'Fantasy:Pirates':2,'Musical:Pop stars':3,'Musical:Coffee':2,'Western:Aliens':2,'Western:Heists':2,'Drama:Coffee':2,'Drama:Surfing':2,'Animation:Dogs':3,'Animation:Dinosaurs':3,'Animation:Bakery':2,'Action:Surfing':2};
const BAD={'Romance:Zombies':-2,'Musical:Zombies':-1,'Drama:Ninjas':-1,'Horror:Bakery':-1,'Animation:Zombies':-2,'Western:Space':-1};
const ACT=[['Rosie Latte','💁‍♀️',90,['Romance','Comedy','Musical'],120],['Chip Barista','🧔',70,['Action','Western'],60],['Mocha Moon','👩‍🎤',85,['Musical','Fantasy','Drama'],100],['Bean Diesel','💪',75,['Action','Sci-Fi'],80],['Marsha Mallow','👩‍🦰',60,['Comedy','Animation','Romance'],30],['Count Crumble','🧛',65,['Horror','Comedy'],40],['Sprinkles McGee','🤡',50,['Comedy','Animation'],15],['Dame Velvet Brew','👵',95,['Drama','Fantasy','Horror'],160],['Kid Cortado','🧒',55,['Animation','Sci-Fi','Comedy'],20],['Luna Frappé','👩‍🚀',80,['Sci-Fi','Horror','Drama'],90]];
const DIR=[['Stanley Steamer',85,['Sci-Fi','Horror','Drama'],90],['Penny Pourover',75,['Romance','Comedy','Musical'],60],['Rex Ristretto',70,['Action','Western'],50],['Ava Affogato',80,['Fantasy','Animation','Musical'],70],['Newbie Nate',45,[],10]];
const LVL=[['Garage studio',0,'🏚️'],['Backyard lot',150,'🏡'],['Indie studio',600,'🏢'],['Big studio',2500,'🏙️'],['Mega studio lot',10000,'🌟']];
const UPG=[['writers','✍️ Writers room','+script quality',80],['stage','🎥 Sound stage','+shoot quality',120],['fx','✨ Effects lab','effects go further',150],['mkt','📣 Marketing office','marketing goes further',100],['screen','🍿 Screening room','fewer flops',200]];
let S=JSON.parse(localStorage.bbSave||'null')||{money:200,fame:0,films:[],up:{},awards:0,lvl:0};// money in $K
const G={state:'title',score:0,level:S.films.length};window.G=G;window.S=S;
let F=null,anim=0,toast='',toastT=0;
function save(){localStorage.bbSave=JSON.stringify(S);G.level=S.films.length;G.score=Math.round(S.money)}
const up=k=>S.up[k]||0,money=v=>v>=1000?'$'+(v/1000).toFixed(2)+'M':'$'+Math.round(v)+'K';
function lvlOf(){let l=0;LVL.forEach((q,i)=>{if(S.films.reduce((a,f)=>a+f.gross,0)>=q[1])l=i});return l}
function newFilm(){if(DEMO()&&S.films.length>=3)return demoEnd('You made your first 3 films in the free demo of <b>Coffeebreak Blockbuster</b>! Unlimited films, awards nights, studio upgrades and the mega studio lot are in the full game.');startMusic();F={g:null,t:[],a:null,d:null,fx:20,mk:20,title:''};G.state='genre'}
function titleGen(){const g=F.g,[a,b]=F.t;const P=['The Last','Return of the','Attack of the','My Big','Love in the Time of','Night of the','Revenge of the','Planet of the','Mission:','The Secret','Hot','Wild'],Q={Coffee:['Latte','Espresso','Bean'],Vampires:['Fangs','Night Bite'],Aliens:['Martians','Saucers'],Robots:['Toasters','Circuits'],Pirates:['Buccaneers','High Seas'],Dogs:['Puppies','Good Boys'],'Time travel':['Tomorrow','Yesterday'],Weddings:['Bride','Vows'],Heists:['Vault','Job'],Ghosts:['Spooks','Phantoms'],Dinosaurs:['Raptors','Jurassic Snacks'],Space:['Galaxy','Stars'],Zombies:['Undead','Brains'],Witches:['Coven','Cauldron'],Bakery:['Cupcakes','Croissants'],'Pop stars':['Superstar','Encore'],Ninjas:['Shadows','Shuriken'],Surfing:['Waves','Merewether']};
 const pk=a=>a[Math.random()*a.length|0];F.title=pk(P)+' '+pk(Q[a]||[a])+(Math.random()<.5?' '+pk(['2','Forever','Unleashed','in Newcastle','After Dark','Reloaded','','']):' & the '+pk(Q[b]||[b]));F.title=F.title.replace(/\s+/g,' ').trim()}
function fit(){let s=0;F.t.forEach(t=>s+=(GREAT[F.g+':'+t]||0)+(BAD[F.g+':'+t]||0));if(F.t[0]&&F.t[1]&&F.t.includes('Coffee'))s+=.5;return s}// -4..6
function cost(){return ACT[F.a][4]+DIR[F.d][3]+F.fx+F.mk+20}
function shoot(){S.money-=cost();F.shoot=0;F.events=[];G.state='shoot';anim=0;const EV=['🎬 The lead nailed it in one take!','☕ Catering ran out of coffee. Morale -1','🌧️ A storm delayed filming a day','🐶 A stray dog wandered on set and stole the scene','🎤 The cast improvised a hilarious scene','🔥 The effects team built an amazing set piece','😴 The director fell asleep in the chair','🌹 A surprise cameo from a famous goth singer!','💥 An explosion went perfectly (and safely)','🍩 Somebody ate the prop donuts'];
 const r=()=>EV[Math.random()*EV.length|0];F.events=[r(),r(),r()].filter((v,i,a)=>a.indexOf(v)===i);save()}
function release(){const A=ACT[F.a],D=DIR[F.d],af=A[3].includes(F.g)?1:0,df=D[2].includes(F.g)?1:0;
 let q=15+fit()*5+A[2]*.12+af*6+D[1]*.12+df*5+Math.sqrt(F.fx)*1.3*(1+up('fx')*.15)+up('writers')*2+up('stage')*2+(Math.random()-.5)*(24-up('screen')*4);
 F.events.forEach(e=>{if(/nailed|hilarious|amazing|cameo|perfectly/.test(e))q+=3;if(/ran out|delayed|asleep|ate/.test(e))q-=2});q=Math.max(5,Math.min(99,Math.round(q)));
 const hype=10+Math.sqrt(F.mk)*4*(1+up('mkt')*.15)+A[2]*.2+S.fame*.4;const weeks=[];let w=hype*(.6+q/100)*(1+lvlOf()*.25)*1.4;for(let i=0;i<8;i++){weeks.push(Math.round(w));w*=.45+q/250}
 const gross=weeks.reduce((a,b)=>a+b,0),fans=Math.max(1,Math.min(5,Math.round((q*.6+hype*.4)/20))),profit=gross-cost();
 const CR=q>85?['A masterpiece. Bring tissues and popcorn.','Instant classic!','The best film of the year.']:q>65?['Thoroughly charming.','Solid fun with a strong cast.','Worth the ticket.']:q>45?['Uneven, but has its moments.','A bit of a mixed bag.','Fine for a rainy day.']:['A cinematic burnt toast.','We walked out to get coffee and did not return.','Oh dear.'];
 const FN=fans>=4?['OMG I watched it 5 times!!','The soundtrack slaps 🔥','Ten out of ten, no notes']:fans>=3?['Pretty good, loved the lead','Fun night out']:['Meh. The trailer was better','I fell asleep 😴'];
 const rec={title:F.title,g:F.g,t:F.t.slice(),a:A[0],d:D[0],q,fans,gross,profit,weeks,cr:CR[Math.random()*CR.length|0],fan:FN[Math.random()*FN.length|0],no:S.films.length+1,award:null};
 S.money+=gross;S.fame+=Math.round(q/20+fans);S.films.push(rec);const nl=lvlOf();if(nl>S.lvl){S.lvl=nl;toast='🎉 Studio upgraded to '+LVL[nl][2]+' '+LVL[nl][0]+'!';toastT=4}save();F.rec=rec;G.state='release';anim=0}
function awards(){const last=S.films.slice(-4);const best=last.reduce((a,b)=>b.q>a.q?b:a);const cats=[['Best Picture',best,best.q>=70],['Best Lead Performance',last.reduce((a,b)=>b.fans>a.fans?b:a),Math.random()<.6],['Best Visual Effects',last[Math.random()*last.length|0],Math.random()<.5]];
 F={aw:cats.map(([c,f,w])=>({c,f:f.title,w,who:c==='Best Lead Performance'?f.a:''}))};F.aw.forEach(a=>{if(a.w){S.awards++;S.fame+=5;const rf=S.films.find(z=>z.title===a.f);if(rf)rf.award=(rf.award?rf.award+', ':'')+a.c}});save();G.state='awards';anim=0}
bindInput({down(){},move(){},up(){}});
function update(dt){anim+=dt;if(toastT>0)toastT-=dt;if(G.state==='shoot'&&anim>6.5)release()}
function bg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0a24');g.addColorStop(1,'#3a1424');x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<30;i++){x.fillStyle='rgba(255,215,90,'+(.2+.2*Math.sin(t*2+i))+')';x.fillRect((i*131)%W,(i*67)%200,2,2)}}
function hdr(s){x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 30px Georgia';x.fillText(s,W/2,48);x.textAlign='left';x.fillStyle='#ffe9c7';x.font='14px Georgia';x.fillText('💰 '+money(S.money)+'  ⭐ Fame '+S.fame+'  🏆 '+S.awards+'  '+LVL[S.lvl][2]+' '+LVL[S.lvl][0],12,22)}
function grid(list,sel,fn,cols,X0,Y0,w,h,lab){list.forEach((v,i)=>button('g'+i,X0+(i%cols)*(w+8),Y0+Math.floor(i/cols)*(h+8),w,h,lab(v,i),()=>fn(i),{sel:sel(i),fs:14}))}
function draw(){bg();const st=G.state;
 if(st==='title'){x.textAlign='center';x.fillStyle='#ffd75a';x.font='bold 54px Georgia';x.fillText('🎬 Coffeebreak Blockbuster',W/2,140);x.fillStyle='#ffe9c7';x.font='18px Georgia';x.fillText('Run your own movie studio, from a garage to a glittering mega studio lot!',W/2,185);
  x.font='70px serif';x.fillText(LVL[S.lvl][2],W/2,280);x.font='16px Georgia';x.fillText(LVL[S.lvl][0]+' · '+S.films.length+' films · '+money(S.money),W/2,320);
  button('n',W/2-330,360,210,52,'🎬 Make a film',newFilm);button('u',W/2-105,360,210,52,'🏗️ Studio upgrades',()=>G.state='upg');button('h',W/2+120,360,210,52,'📼 Film archive',()=>G.state='arch');
  if(DEMO()){x.fillStyle='#ffcf6a';x.font='14px Georgia';x.fillText('Demo: your first 3 films. The full game has unlimited films, awards nights and every studio upgrade.',W/2,450)}
  if(S.money<60)button('loan',W/2-110,470,220,40,'🏦 Borrow from Nan ($150K)',()=>{S.money+=150;S.fame=Math.max(0,S.fame-2);save()},{fs:13});return}
 hdr({genre:'1. Pick a genre',topic:'2. Pick two topics',cast:'3. Cast your lead',dir:'4. Hire a director',budget:'5. Set the budget',upg:'🏗️ Studio upgrades',arch:'📼 Film history archive',shoot:'🎬 On set: '+(F&&F.title),release:'🍿 Box office',awards:'🏆 Coffeebreak Awards Night'}[st]||'');
 if(st==='genre'){grid(GEN,i=>F.g===GEN[i][0],i=>{F.g=GEN[i][0];G.state='topic'},5,40,90,158,90,v=>v[1]+' '+v[0]);x.fillStyle='#ffe9c7';x.textAlign='center';x.font='15px Georgia';x.fillText('Tip: some genres and topics are a match made in movie heaven…',W/2,330)}
 if(st==='topic'){grid(TOP,i=>F.t.includes(TOP[i][0]),i=>{const k=TOP[i][0];if(F.t.includes(k))F.t=F.t.filter(z=>z!==k);else if(F.t.length<2)F.t.push(k)},6,30,80,135,56,v=>v[1]+' '+v[0]);
  const f=fit();x.textAlign='center';x.fillStyle='#ffe9c7';x.font='16px Georgia';x.fillText(F.g+' + '+(F.t.join(' + ')||'…'),W/2,300);if(F.t.length===2){x.fillStyle=f>=4?'#7fff9a':f>=1?'#ffcf6a':'#ff7a8a';x.fillText(f>=4?'🔥 Writers are excited!':f>=1?'👍 This could work.':'🤔 Hmm, a risky combo…',W/2,326)}
  button('nx',W/2-100,360,200,48,'Next ▶',()=>{titleGen();G.state='cast'},{dis:F.t.length<2})}
 if(st==='cast'){x.textAlign='center';x.fillStyle='#ffcf6a';x.font='italic 22px Georgia';x.fillText('“'+F.title+'”',W/2,80);button('rt',W/2+240,60,110,28,'🎲 New title',titleGen,{fs:12});
  ACT.forEach((a,i)=>{const X=30+(i%5)*170,Y=100+Math.floor(i/5)*150,good=a[3].includes(F.g);button('a'+i,X,Y,160,140,'',()=>{F.a=i},{sel:F.a===i});x.textAlign='center';x.font='40px serif';x.fillText(a[1],X+80,Y+46);x.fillStyle=F.a===i?'#1a0a10':'#ffe9c7';x.font='bold 14px Georgia';x.fillText(a[0],X+80,Y+80);x.font='12px Georgia';x.fillText('⭐ '+a[2]+' · '+money(a[4]),X+80,Y+98);x.fillStyle=good?(F.a===i?'#2a6a2a':'#7fff9a'):(F.a===i?'#5a3a3a':'#b090a0');x.fillText(good?'✔ great at '+F.g:a[3].join(', '),X+80,Y+118)});
  button('nx',W/2-100,420,200,48,'Next ▶',()=>G.state='dir',{dis:F.a==null})}
 if(st==='dir'){DIR.forEach((d,i)=>{const good=d[2].includes(F.g),Y=90+i*62;button('d'+i,120,Y,660,54,'',()=>{F.d=i},{sel:F.d===i});x.textAlign='left';x.fillStyle=F.d===i?'#1a0a10':'#ffe9c7';x.font='bold 17px Georgia';x.fillText('🎬 '+d[0],140,Y+24);x.font='13px Georgia';x.fillText('Skill '+d[1]+' · '+money(d[3])+' · '+(d[2].length?'loves '+d[2].join(', '):'eager to learn!')+(good?'  ✔ perfect for '+F.g:''),140,Y+44)});button('nx',W/2-100,420,200,48,'Next ▶',()=>G.state='budget',{dis:F.d==null})}
 if(st==='budget'){[['✨ Effects','fx'],['📣 Marketing','mk']].forEach(([n,k],i)=>{const Y=110+i*90;x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 20px Georgia';x.fillText(n+': '+money(F[k]),200,Y+30);button(k+'-',520,Y,60,44,'−',()=>{F[k]=Math.max(0,F[k]-10)});button(k+'+',590,Y,60,44,'+',()=>{F[k]+=10})});
  x.textAlign='center';x.fillStyle='#ffcf6a';x.font='bold 20px Georgia';x.fillText('Total cost: '+money(cost())+'  (you have '+money(S.money)+')',W/2,320);
  button('go',W/2-120,360,240,56,'🎬 Lights, camera, action!',shoot,{dis:cost()>S.money,fs:16});if(cost()>S.money){x.fillStyle='#ff7a8a';x.font='14px Georgia';x.fillText('Too expensive! Lower the budget or pick cheaper talent.',W/2,440)}button('bk',20,540,120,36,'⬅ Back',()=>G.state='dir',{fs:13})}
 if(st==='shoot'){const sc=Math.floor(anim/1.6),scenes=['🎬','🎥','💡','🎞️'];x.fillStyle='#000';rr(150,90,600,300,12);x.fill();
  const G2=GEN.find(g=>g[0]===F.g),T1=TOP.find(z=>z[0]===F.t[0]),T2=TOP.find(z=>z[0]===F.t[1]);x.textAlign='center';x.font='80px serif';x.fillText([ACT[F.a][1],T1[1],G2[1],T2[1]][sc%4],W/2+Math.sin(anim*3)*60,260);
  // clapper
  x.save();x.translate(220,140);x.rotate(Math.max(0,Math.sin(anim*5))*-.4);x.fillStyle='#fff';x.fillRect(0,-12,90,12);x.fillStyle='#000';for(let i=0;i<90;i+=18)x.fillRect(i,-12,9,12);x.restore();x.fillStyle='#222';x.fillRect(220,140,90,50);x.fillStyle='#fff';x.font='11px monospace';x.fillText('SCENE '+(sc+1),265,165);x.fillText('TAKE '+(1+Math.floor(anim*2)%4),265,180);
  x.fillStyle='#ffe9c7';x.font='17px Georgia';F.events.slice(0,Math.min(F.events.length,sc+1)).forEach((e,i)=>x.fillText(e,W/2,420+i*28));x.fillStyle='#3a1424';rr(250,520,400,16,8);x.fill();x.fillStyle='#ffd75a';rr(250,520,400*Math.min(1,anim/6.5),16,8);x.fill()}
 if(st==='release'){const r=F.rec,k=Math.min(1,anim/3),mx=Math.max(...r.weeks);x.textAlign='center';x.fillStyle='#ffcf6a';x.font='italic 22px Georgia';x.fillText('“'+r.title+'”',W/2,80);
  r.weeks.forEach((w,i)=>{const h=200*w/mx*Math.min(1,Math.max(0,k*8-i));x.fillStyle='#ff5a9a';x.fillRect(90+i*50,330-h,38,h);x.fillStyle='#ffe9c7';x.font='11px Georgia';x.fillText('Wk'+(i+1),109+i*50,346);if(k>=1)x.fillText(money(w),109+i*50,326-h)});
  if(k>=1){x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText('Total box office: '+money(r.gross),520,130);x.fillStyle=r.profit>=0?'#7fff9a':'#ff7a8a';x.fillText((r.profit>=0?'Profit: ':'Loss: ')+money(Math.abs(r.profit)),520,158);
   x.fillStyle='#ffe9c7';x.font='16px Georgia';x.fillText('🍅 Critics: '+r.q+'%',520,196);x.font='italic 14px Georgia';wrapT('“'+r.cr+'”',520,218,330,18);x.font='16px Georgia';x.fillText('🍿 Fans: '+'⭐'.repeat(r.fans),520,272);x.font='italic 14px Georgia';wrapT('“'+r.fan+'”',520,294,330,18);
   const aw=S.films.length%4===0;button('nx',W/2-130,420,260,52,aw?'🏆 Go to Awards Night!':'🎬 Back to the studio',()=>{aw?awards():G.state='title'})}}
 if(st==='awards'){x.textAlign='center';F.aw.forEach((a,i)=>{if(anim<1+i*1.4)return;const Y=110+i*120;x.fillStyle='rgba(255,215,90,.12)';rr(140,Y,620,100,14);x.fill();x.fillStyle='#ffd75a';x.font='bold 20px Georgia';x.fillText(a.c,W/2,Y+32);x.fillStyle='#ffe9c7';x.font='17px Georgia';x.fillText('Nominee: “'+a.f+'”'+(a.who?' ('+a.who+')':''),W/2,Y+60);
   if(anim>1.7+i*1.4){x.font='bold 18px Georgia';x.fillStyle=a.w?'#7fff9a':'#b090a0';x.fillText(a.w?'🏆 AND THE WINNER IS… YOU!':'Not this time. Next year!',W/2,Y+88)}});if(anim>6)button('bk',W/2-110,480,220,48,'🎬 Back to the studio',()=>G.state='title')}
 if(st==='upg'){UPG.forEach((u,i)=>{const L=up(u[0]),c=Math.round(u[3]*Math.pow(1.8,L)),Y=80+i*72;button('u'+i,120,Y,660,62,'',()=>{if(L>=3)return;if(DEMO()&&i>1)return demoEnd('Every studio upgrade is in the full game.');if(S.money<c){toast='Not enough money!';toastT=2;return}S.money-=c;S.up[u[0]]=L+1;save()},{dis:L>=3});x.textAlign='left';x.fillStyle='#ffe9c7';x.font='bold 18px Georgia';x.fillText(u[1]+'  '+'★'.repeat(L)+'☆'.repeat(3-L),140,Y+26);x.font='13px Georgia';x.fillText(u[2]+(L>=3?' · MAX':' · upgrade '+money(c))+(DEMO()&&i>1?' · 🔒 full game':''),140,Y+48)});
  x.textAlign='center';x.fillStyle='#ffe9c7';x.font='14px Georgia';x.fillText('Your lot grows as your films earn: '+LVL.map(l=>l[2]+' '+money(l[1]*1)).join('  →  '),W/2,460);button('bk',W/2-80,490,160,40,'⬅ Back',()=>G.state='title')}
 if(st==='arch'){x.textAlign='left';x.font='13px Georgia';const L=S.films.slice(-14).reverse();if(!L.length){x.fillStyle='#ffe9c7';x.textAlign='center';x.fillText('No films yet. Go make some movie magic!',W/2,200)}
  L.forEach((f,i)=>{const Y=82+i*30;x.fillStyle=i%2?'rgba(255,255,255,.04)':'rgba(255,255,255,.08)';x.fillRect(40,Y-18,820,28);x.fillStyle='#ffe9c7';x.fillText('#'+f.no+'  “'+f.title+'”  · '+f.g+' · '+f.a+' · 🍅'+f.q+'% · '+money(f.gross)+(f.award?'  🏆 '+f.award:''),52,Y)});button('bk',W/2-80,540,160,40,'⬅ Back',()=>G.state='title')}
 if(toastT>0){x.fillStyle='rgba(26,10,16,.9)';rr(W/2-230,500,460,36,10);x.fill();x.fillStyle='#ffd75a';x.font='bold 15px Georgia';x.textAlign='center';x.fillText(toast,W/2,523)}}
startLoop();
