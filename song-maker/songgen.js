/* Coffeebreak song generator: lyrics writer, style presets, backing + melody builder. All offline. */
(function(){
const G={};window.CBG=G;
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
G.hash=hash;G.rng=rng;
G.STYLES=['Country','Rock','Pop','Rockabilly','Gothic','Lullaby','Hip hop','Ballad','Kids','Christmas'];
G.MOODS=['Happy','Sad','Dreamy','Fun','Romantic','Dark'];
G.TEMPOS=['Slow','Medium','Fast'];
/* drum patterns, 16 steps; chars x = hit, o = soft */
const D={
 country:{k:'x.....x.x.......',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},
 rock:{k:'x.....x.x.x...x.',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.',c:'x...............'},
 pop:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.',o:'..x...x...x...x.'},
 rocka:{k:'x...x...x...x...',s:'....x..o....x..o',h:'x.x.x.x.x.x.x.x.'},
 goth:{k:'x.......x.x.....',s:'............x...',h:'x.x.x.x.x.x.x.x.',t:'..............x.'},
 lull:{k:'x...............',s:'',h:'x...x...x...x...'},
 hip:{k:'x.....x...x.x...',s:'....x.......x...',h:'x.xxx.xxx.xxx.x.'},
 ballad:{k:'x.......x.......',s:'....x.......x...',h:'x...x...x...x...'},
 kids:{k:'x...x...x...x...',s:'..x...x...x...x.',h:'x.x.x.x.x.x.x.x.'},
 xmas:{k:'x.......x.......',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'}};
/* style config. prog: chord progression [offset,type]. */
const S={
 'Country':{bpm:100,dr:D.country,comp:'boomchick',ci:'guitar',li:'guitar',bi:'bass',maj:[[[0,'maj'],[5,'maj'],[7,'maj'],[0,'maj']],[[0,'maj'],[0,'maj'],[5,'maj'],[7,'maj']],[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']]],min:[[[0,'min'],[8,'maj'],[10,'maj'],[0,'min']]],bpl:1,pitch:.95,rate:1},
 'Rock':{bpm:124,dr:D.rock,comp:'power',ci:'guitar',li:'synth',bi:'bass',maj:[[[0,'maj'],[10,'maj'],[5,'maj'],[0,'maj']],[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']]],min:[[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']],[[0,'min'],[10,'maj'],[8,'maj'],[7,'maj']]],bpl:1,pitch:.85,rate:1.05},
 'Pop':{bpm:112,dr:D.pop,comp:'stab',ci:'piano',li:'synth',bi:'bass',maj:[[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']],[[9,'min'],[5,'maj'],[0,'maj'],[7,'maj']]],min:[[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']],[[0,'min'],[5,'min'],[8,'maj'],[7,'maj']]],bpl:1,pitch:1.1,rate:1},
 'Rockabilly':{bpm:150,dr:D.rocka,comp:'boomchick',ci:'guitar',li:'guitar',bi:'bass',maj:[[[0,'7'],[0,'7'],[5,'7'],[0,'7'],[7,'7'],[5,'7'],[0,'7'],[7,'7']]],min:[[[0,'min'],[5,'min'],[7,'7'],[0,'min']]],bpl:1,pitch:.9,rate:1.1},
 'Gothic':{bpm:84,dr:D.goth,comp:'arp',ci:'organ',li:'bells',bi:'bass',maj:[[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']]],min:[[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']],[[0,'min'],[5,'min'],[8,'maj'],[7,'maj']]],bpl:2,pitch:.7,rate:.85,forceMinor:true},
 'Lullaby':{bpm:70,dr:D.lull,comp:'arp',ci:'piano',li:'bells',bi:'strings',maj:[[[0,'maj'],[5,'maj'],[0,'maj'],[7,'maj']],[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']]],min:[[[0,'min'],[8,'maj'],[5,'min'],[7,'maj']]],bpl:2,pitch:1.2,rate:.8},
 'Hip hop':{bpm:92,dr:D.hip,comp:'sparse',ci:'synth',li:'synth',bi:'808',maj:[[[9,'min'],[5,'maj'],[0,'maj'],[7,'maj']]],min:[[[0,'min'],[8,'maj'],[3,'maj'],[10,'maj']],[[0,'min'],[0,'min'],[8,'maj'],[7,'maj']]],bpl:1,pitch:.8,rate:1.2},
 'Ballad':{bpm:76,dr:D.ballad,comp:'arp',ci:'piano',li:'strings',bi:'strings',maj:[[[0,'maj'],[7,'maj'],[9,'min'],[5,'maj']],[[0,'maj'],[5,'maj'],[9,'min'],[7,'maj']]],min:[[[0,'min'],[10,'maj'],[8,'maj'],[7,'maj']],[[9,'min'],[5,'maj'],[0,'maj'],[7,'maj']]],bpl:2,pitch:1,rate:.85},
 'Kids':{bpm:118,dr:D.kids,comp:'oompah',ci:'piano',li:'bells',bi:'bass',maj:[[[0,'maj'],[5,'maj'],[0,'maj'],[7,'maj']],[[0,'maj'],[0,'maj'],[5,'maj'],[7,'maj']]],min:[[[0,'min'],[5,'min'],[7,'maj'],[0,'min']]],bpl:1,pitch:1.3,rate:1,forceMajor:true},
 'Christmas':{bpm:104,dr:D.xmas,comp:'oompah',ci:'piano',li:'bells',bi:'bass',maj:[[[0,'maj'],[5,'maj'],[0,'maj'],[7,'maj']],[[0,'maj'],[9,'min'],[5,'maj'],[7,'maj']]],min:[[[0,'min'],[5,'min'],[7,'maj'],[0,'min']]],bpl:1,pitch:1.1,rate:.95,forceMajor:true}};
G.CFG=S;
const KEYS={Happy:{m:0,mode:'maj',k:[60,55,62]},Sad:{m:1,mode:'min',k:[57,52,59]},Dreamy:{m:0,mode:'maj',k:[65,60]},Fun:{m:0,mode:'maj',k:[62,67,64]},Romantic:{m:0,mode:'maj',k:[58,60]},Dark:{m:1,mode:'min',k:[52,57,55]}};
const TEMPO={Slow:.8,Medium:1,Fast:1.25};
/* syllables */
G.syl=function(line){const w=(line.toLowerCase().match(/[a-z']+/g)||[]);let n=0;w.forEach(x=>{x=x.replace(/'/g,'');let c=(x.replace(/e$/,'').replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').match(/[aeiouy]{1,2}/g)||[]).length;if(c<1)c=1;n+=c;});return Math.max(1,n);};
/* parse lyrics into sections */
G.parse=function(txt){const secs=[];let cur=null;
 (txt||'').split(/\r?\n/).forEach(raw=>{const l=raw.trim();if(!l){cur=null;return;}
  const h=l.match(/^\[(.+?)\]$/);if(h){cur={type:h[1].toLowerCase().replace(/\s*\d+$/,''),name:h[1],lines:[]};secs.push(cur);return;}
  if(!cur){cur={type:'verse',name:'Verse',lines:[]};secs.push(cur);}cur.lines.push(l.replace(/!/g,'.'));});
 return secs.filter(s=>s.lines.length);};
/* lyrics writer */
const IM={Country:['dirt road','old truck','porch light','sunset','river bend','fence line','county fair','starry sky'],Rock:['thunder','highway','neon lights','electric night','engine roar','city sky','broken chains','burning sun'],Pop:['dancing lights','summer rain','radio','golden hour','city night','open window','sparkle','shining star'],Rockabilly:['jukebox','blue suede','chrome and steel','Saturday night','diner light','hot rod','dance floor','pink Cadillac'],Gothic:['candlelight','midnight rain','velvet shadows','old grey stone','the raven','silver moon','ivy gate','lace and thorn'],Lullaby:['the moon','little stars','soft pillow','gentle breeze','sleepy eyes','quiet night','warm blanket','dreamland'],'Hip hop':['city streets','late night','the beat','neon signs','concrete','the grind','the mic','tall towers'],Ballad:['candlelight','empty rooms','falling rain','old photographs','the shore','winter sky','quiet hours','the last train'],Kids:['sunny day','big red bus','little duck','the garden','rainbow','playground','puddle splash','teddy bear'],Christmas:['snowy night','silver bells','the fire','candle glow','sleigh ride','winter star','mistletoe','warm cocoa']};
G.writeLyrics=function(topic,style,title){
 topic=(topic||'coffee').trim().replace(/[!]/g,'')||'coffee';style=style||'Country';const r=rng(hash(topic+style+(title||'')+Date.now()%7));
 const im=(IM[style]||IM.Pop).map(x=>x.replace(/^the /,'').replace(/^Saturday night$/,'Saturday night'));const pick=a=>a[Math.floor(r()*a.length)];const T=topic;
 const couplets=[
  ['I think about '+T+' every day','And it never goes away'],
  ['There is something about '+T,'That I cannot do without'],
  ['Every little thing about '+T,'Keeps me dreaming, sets me roam'],
  ['Under the {a} I called out your name','And nothing was the same'],
  ['We sang along to the {a} tonight','And everything felt right'],
  ['Walking past the {a}, I hear it call','And I am ready to give my all'],
  ['Take me where the '+T+' goes','Where the quiet feeling grows'],
  ['Some days feel heavy, some days feel light','But '+T+' makes it alright'],
  ['I found '+T+' by the {a}','And it changed my world for me'],
  ['Hold on to '+T+', hold on tight','We will carry on tonight'],
  ['A whisper of '+T+' on the breeze','Brings me back with perfect ease'],
  ['Sing a little song about '+T,'Sing it loud and sing it proud'],
  ['The {a} and '+T+' in the air','Nothing here can compare'],
  ['Wake me up when the morning comes','With '+T+' and the sound of drums']];
 const used=new Set();const cp=()=>{let i,n=0;do{i=Math.floor(r()*couplets.length);n++;}while(used.has(i)&&n<40);used.add(i);return couplets[i].map(l=>l.replace(/\{a\}/g,()=>pick(im)));};
 const cap=T.charAt(0).toUpperCase()+T.slice(1);
 const v1=[].concat(cp(),cp()),v2=[].concat(cp(),cp()),br=cp();
 const chorus=['Oh '+T+', '+T+', take me home',"Oh "+T+', I am never alone',cap+' in the morning, '+T+' at night',cap+' is the reason it feels so right'];
 const out=['[Verse]'].concat(v1,['','[Chorus]'],chorus);
 if(style==='Lullaby'||style==='Kids'){out.push('','[Verse]',...v2,'','[Chorus]',...chorus);}
 else out.push('','[Verse]',...v2,'','[Chorus]',...chorus,'','[Bridge]',...br,'','[Chorus]',...chorus);
 return out.join('\n');};
G.SAMPLES={
 'Coffeebreak morning (original)':'[Verse]\nThe kettle sings at the break of day\nSunlight spills on the floor\nA little cup and a little time\nIs all I am waiting for\n\n[Chorus]\nTake a coffeebreak, take it slow\nLet the quiet feeling grow\nTake a coffeebreak, hold it near\nEverything is warm in here',
 'Twinkle twinkle little star':'[Verse]\nTwinkle twinkle little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky\nTwinkle twinkle little star\nHow I wonder what you are',
 'Row row row your boat':'[Verse]\nRow row row your boat\nGently down the stream\nMerrily merrily merrily merrily\nLife is but a dream',
 'Rock a bye baby':'[Verse]\nRock a bye baby on the treetop\nWhen the wind blows the cradle will rock\nWhen the bough breaks the cradle will fall\nAnd down will come baby cradle and all',
 'Jingle bells':'[Verse]\nDashing through the snow\nIn a one horse open sleigh\nO er the fields we go\nLaughing all the way\n\n[Chorus]\nJingle bells jingle bells\nJingle all the way\nOh what fun it is to ride\nIn a one horse open sleigh',
 'Oh my darling Clementine':'[Verse]\nIn a cavern in a canyon\nExcavating for a mine\nDwelt a miner forty niner\nAnd his daughter Clementine\n\n[Chorus]\nOh my darling oh my darling\nOh my darling Clementine\nYou are lost and gone forever\nDreadful sorry Clementine',
 'Amazing grace':'[Verse]\nAmazing grace how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind but now I see',
 'Little rain song (original)':'[Verse]\nRain on the window, rain on the street\nPuddles are dancing under my feet\nGrey sky above me, warm light inside\nThere is a song that I cannot hide\n\n[Chorus]\nSing it again, sing it with me\nRain is the sweetest melody'};
/* build a project from lyrics */
G.build=function(o){
 const style=o.style||'Country',cfg=S[style],mood=KEYS[o.mood||'Happy'],tempo=TEMPO[o.tempo||'Medium']||1;
 let mode=mood.mode;if(cfg.forceMinor)mode='min';if(cfg.forceMajor)mode='maj';
 const seed=hash((o.title||'')+(o.lyrics||'')+style+(o.mood||''));const r=rng(seed);
 const keyList=mood.k;const key=keyList[seed%keyList.length]-(mode==='min'&&cfg.forceMinor&&mood.mode==='maj'?3:0);
 const secs=G.parse(o.lyrics);if(!secs.length)return null;
 const progs=mode==='min'?cfg.min:cfg.maj;const prog=progs[seed%progs.length];
 const bpm=Math.round(cfg.bpm*tempo);const bpl=cfg.bpl;
 const total=secs.reduce((a,s)=>a+s.lines.length,0)*bpl;const intro=2,outro=2;const bars=intro+total+outro;
 const scale=(mode==='min'?CBA.MIN:CBA.MAJ);
 const tracks={chords:{name:'Chords',type:'inst',inst:cfg.ci,vol:.65,notes:[]},bass:{name:'Bass',type:'inst',inst:cfg.bi,vol:.7,notes:[]},melody:{name:'Melody',type:'inst',inst:cfg.li,vol:.75,notes:[]},drums:{name:'Drums',type:'drums',vol:.8,notes:[]}};
 const chordAt=b=>{const c=prog[b%prog.length];const root=key+c[0];return {root,tones:CBA.CH[c[1]].map(x=>root+x),type:c[1]};};
 const add=(tk,s,l,m,v)=>tracks[tk].notes.push({s,l,m,v:v==null?.8:v});
 const voic=ch=>{const t=ch.tones.slice(0,3).map(x=>{while(x>key+9)x-=12;while(x<key-3)x+=12;return x;});return t;};
 for(let b=0;b<bars;b++){const ch=chordAt(b),base=b*16,v=voic(ch),bass=ch.root-24+(ch.root-24<28?12:0);const last=b===bars-1;
  const sec=b>=intro&&b<bars-outro;
  // drums
  const pat=cfg.dr;const dm={k:0,s:1,h:3,o:4,c:6,t:5};const light=(b<intro&&style!=='Lullaby');
  Object.keys(pat).forEach(k=>{if(!pat[k])return;if(light&&k!=='h'&&k!=='k')return;for(let i=0;i<16;i++){const ch2=pat[k][i];if(ch2==='x'||ch2==='o')add('drums',base+i,1,dm[k],ch2==='o'?.4:(k==='h'?.6:.85));}});
  if(!last&&(b+1)%4===0&&b>=intro&&style!=='Lullaby'&&pat.s)for(let i=12;i<16;i++)add('drums',base+i,1,1,.5+i*.03);
  if(last)add('drums',base,1,6,.8);
  // chords
  const A=cfg.comp;
  if(A==='boomchick'){for(let i=0;i<4;i++){const st=base+i*4;if(i%2===0)add('bass',st,3,i===2?ch.root-24+7:ch.root-24+0,.85);else v.forEach((m,j)=>add('chords',st,2,m,.5-j*.04));if(i%2===0)add('chords',st,1,v[0]-12,.4);}
   for(let i=0;i<2;i++)v.forEach((m,j)=>add('chords',base+i*8+4+(style==='Rockabilly'?0:0),2,m,.6-j*.05));}
  else if(A==='power'){for(let i=0;i<8;i++){const st=base+i*2;add('chords',st,2,ch.root-12,.7);add('chords',st,2,ch.root-5,.65);add('bass',st,2,ch.root-24,.8);}}
  else if(A==='stab'){v.forEach((m,j)=>{add('chords',base,6,m,.55);add('chords',base+6,2,m,.5);add('chords',base+10,2,m,.5);});add('bass',base,4,ch.root-24,.85);add('bass',base+6,2,ch.root-24,.7);add('bass',base+10,2,ch.root-24+7,.7);add('bass',base+14,2,ch.root-24,.7);}
  else if(A==='arp'){const seq=[v[0],v[1],v[2],v[1]+12,v[2],v[1],v[0]+12,v[1]];for(let i=0;i<8;i++)add('chords',base+i*2,3,seq[i]-(style==='Gothic'?12:0),.5);add('bass',base,16,ch.root-24,.55);}
  else if(A==='sparse'){v.forEach(m=>add('chords',base,8,m,.4));add('bass',base,6,ch.root-24,.9);add('bass',base+8,3,ch.root-24,.8);add('bass',base+11,4,ch.root-24+(r()<.5?7:3),.8);}
  else if(A==='oompah'){for(let i=0;i<4;i++){const st=base+i*4;if(i%2===0){add('bass',st,3,i===2?ch.root-24+7:ch.root-24,.85);}else v.forEach((m,j)=>add('chords',st,3,m,.5));}}
  if(last)v.forEach(m=>add('chords',base,16,m,.5));
 }
 // melody + line timing
 const lineInfo=[];let bar=intro;const used={};
 secs.forEach((sc,si)=>{sc.lines.forEach((line,li)=>{
  const key2=sc.type+'|'+li+'|'+(sc.type==='verse'?'':'');const rr=rng(hash(key2+seed));const L=16*bpl;const n=G.syl(line);
  const ch0=chordAt(bar);const lo=key-2,hi=key+14;let deg=0;const sc7=[];for(let o=-1;o<3;o++)scale.forEach(x=>sc7.push(key+x+12*o));
  const near=m=>{let b=0,bd=99;sc7.forEach((x,i)=>{const d=Math.abs(x-m);if(d<bd){bd=d;b=i;}});return b;};
  let idx=near(ch0.tones[0]+12*(ch0.tones[0]<key?1:0));const slots=[];const maxn=Math.min(n,L-1);
  const per=(L-2)/maxn;const start=2;
  for(let i=0;i<maxn;i++){const st=Math.round(start+i*per);const nx=i<maxn-1?Math.round(start+(i+1)*per):L-1;slots.push([st,Math.max(1,nx-st)]);}
  if(n>maxn){}
  slots.forEach((sl,i)=>{
   const sb=Math.floor(sl[0]/16),cc=chordAt(bar+sb);
   const lastN=i===maxn-1;
   if(lastN){const tgt=cc.tones;let best=0,bd=99;sc7.forEach((x,k)=>{if(x<lo||x>hi)return;tgt.forEach(t=>{const d=Math.abs(((x-t)%12+12)%12);if(d===0&&Math.abs(k-idx)<bd){bd=Math.abs(k-idx);best=k;}});});idx=best;}
   else{const st=[-2,-1,-1,0,1,1,2][Math.floor(rr()*7)];idx=Math.max(0,Math.min(sc7.length-1,idx+st));while(sc7[idx]>hi)idx--;while(sc7[idx]<lo)idx++;}
   const len=lastN?Math.max(sl[1],Math.min(8,L-sl[0]-1)):Math.max(1,sl[1]-(sl[1]>2?1:0));
   add('melody',bar*16+sl[0],len,sc7[idx],.8);});
  lineInfo.push({bar,bars:bpl,text:line,sec:sc.name,n,si,li});bar+=bpl;});});
 const proj={bpm,bars,tracks:[tracks.drums,tracks.bass,tracks.chords,tracks.melody].map((t,i)=>Object.assign({id:'t'+i,pan:0,rev:t.name==='Melody'?.25:.1,dly:0},t)),meta:{style,mood:o.mood,key,mode,intro,outro,lines:lineInfo,pitch:cfg.pitch,rate:cfg.rate}};
 return proj;};
})();
