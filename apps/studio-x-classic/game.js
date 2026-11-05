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
// ===== Coffeebreak Song Studio (all in-browser; no cloud AI) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const st=document.createElement('style');st.textContent=`#ss{flex:1;width:100%;max-width:1100px;overflow:auto;padding:8px 12px 90px;box-sizing:border-box;font-family:Georgia,serif}
#ss h2{color:#e8a0b0;margin:6px 0}#ss .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}
#ss select,#ss input,#ss textarea{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px;font:14px Georgia}
#ss textarea{width:100%;height:190px;box-sizing:border-box}#ss .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:12px;padding:10px;margin:8px 0}
#ss .tabs button{margin:2px}#ss .sec{display:inline-block;margin:3px;padding:5px 8px;border-radius:8px;background:#3a1424;border:1px solid #e8a0b0}
#ss .sec.on{background:#e8a0b0;color:#1a0a10}#ss .note{font-size:12px;color:#d9b8c0}#ss .lib{display:flex;gap:10px;flex-wrap:wrap}
#ss .lib div{width:150px;text-align:center;font-size:13px}#ss .lib canvas{width:150px;height:150px;border-radius:10px;display:block;margin-bottom:4px}
#ss .chip{display:inline-block;margin:2px;padding:3px 7px;border-radius:12px;background:#3a1424;cursor:pointer;font-size:13px}#ss label{font-size:13px}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='ss';c.parentNode.insertBefore(R,c.nextSibling);
document.addEventListener('pointerdown',()=>startMusic(),{once:true});
// ---------- data ----------
const NOTES=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const GEN={Country:{bpm:[88,110],prog:[[0,3,4,0],[0,4,5,3],[0,0,3,4]],drum:'country',lead:'triangle',bassStyle:'rootfifth',swing:0},
Pop:{bpm:[100,124],prog:[[0,4,5,3],[5,3,0,4],[0,5,3,4]],drum:'pop',lead:'square',bassStyle:'eighths',swing:0},
Rock:{bpm:[110,140],prog:[[0,6,3,0],[0,3,4,4],[5,3,0,4]],drum:'rock',lead:'sawtooth',bassStyle:'eighths',swing:0},
Ballad:{bpm:[66,80],prog:[[0,5,3,4],[0,2,5,3],[3,4,0,5]],drum:'ballad',lead:'sine',bassStyle:'whole',swing:0},
Gospel:{bpm:[72,96],prog:[[0,3,0,4],[3,4,2,5],[0,1,4,0]],drum:'gospel',lead:'triangle',bassStyle:'walk',swing:.15},
'Hip-hop':{bpm:[84,96],prog:[[5,3,0,4],[0,0,5,5],[5,4,3,4]],drum:'hiphop',lead:'square',bassStyle:'808',swing:.12},
'Lo-fi':{bpm:[70,85],prog:[[1,4,0,5],[3,2,1,4],[0,5,1,4]],drum:'lofi',lead:'sine',bassStyle:'whole',swing:.18},
EDM:{bpm:[122,128],prog:[[5,3,0,4],[0,4,5,3],[5,5,3,4]],drum:'edm',lead:'sawtooth',bassStyle:'offbeat',swing:0}};
const GENRES=D?['Pop','Country']:Object.keys(GEN);
const DR={// 16 steps: k s h
country:['k...h.h.k.h.s.h.','....s.......s...'],pop:['k.h.k.h.k.h.k.h.','....s.......s...'],rock:['k.h.k.hkk.h.k.h.','....s.......s...'],
ballad:['k.......k.......','........s.......'],gospel:['k..hk.h.k..hk.h.','....s.......s..s'],hiphop:['k..h..k.h.k..h..','....s.......s...'],
lofi:['k..h..h.k.hh..h.','....s.......s...'],edm:['k.h.k.h.k.h.k.h.','....s.......s...']};
const MOODS={Happy:{minor:0,pitch:1.2},Hopeful:{minor:0,pitch:1.05},Romantic:{minor:0,pitch:1},Sad:{minor:1,pitch:.85},Moody:{minor:1,pitch:.9},Fierce:{minor:1,pitch:1}};
const WORDS={love:['heart','flame','touch','kiss','forever','golden','sweet','honey','moonlight','promise'],road:['highway','dust','wheels','horizon','gravel','neon','motel','miles'],
hope:['sunrise','wings','grace','light','morning','brave','rising','shine'],night:['stars','midnight','shadows','city','glow','echo','dream','velvet'],
heartbreak:['tears','rain','goodbye','ashes','empty','cold','storm','broken'],faith:['praise','mercy','river','glory','amen','blessed','Sunday','hallelujah'],party:['dance','lights','bass','summer','crowd','fire','tonight','wild']};
const RHY=[['heart','apart','start','part','art','chart','dart','smart'],['night','light','bright','fight','right','flight','tight','sight','white'],['love','above','of','glove','dove','shove'],['rain','pain','again','lane','chain','train','remain','flame'],
['fire','higher','desire','wire','choir','tire','inspire'],['day','way','stay','away','play','say','grey','pray','okay'],['me','free','be','see','sea','key','tree','three'],['go','slow','know','show','glow','grow','road','home'],
['time','shine','mine','line','fine','sign','divine','wine'],['true','you','blue','through','new','do','too','view'],['dream','stream','seem','gleam','team','beam','cream'],['hand','stand','band','land','sand','plan','grand'],
['soul','whole','gold','hold','cold','told','roll','control'],['sky','fly','high','why','try','cry','goodbye','by'],['town','down','crown','around','sound','ground','found'],['grace','place','face','space','embrace','race','chase']];
const TPL=['I keep a little {w} in my {w2}','Every {w} reminds me of the {w2}','We were {w} under the {w2}','Hold on to the {w}, it brings me {r}','Tell me why the {w} feels so {r}','Out here with the {w} and the {w2}',
'Running through the {w} till the {r}','You and me and the {w} tonight','Singing to the {w}, singing to the {w2}','Nothing like the {w} when you come {r}','I found my {w} on a {w2} road','Light it up, let the {w} take {r}'];
function rhymesOf(w){w=(w||'').toLowerCase().replace(/[^a-z]/g,'');const out=new Set();for(const f of RHY)if(f.includes(w))f.forEach(z=>z!==w&&out.add(z));
 if(!out.size){const end=w.slice(-2);for(const f of RHY)for(const z of f)if(z.endsWith(end)&&z!==w)out.add(z)}return [...out]}
// seeded rng
function rng(s){s=(s>>>0)||1;return()=>((s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,s=(s^s+Math.imul(s^s>>>7,61|s))^s,((s^s>>>14)>>>0)/4294967296))}
function hash(str){let h=2166136261;for(const ch of String(str))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
function pick(r,a){return a[Math.floor(r()*a.length)]}
function ideaLyrics(theme,seed){const r=rng(seed),wb=WORDS[theme]||WORDS.love,all=Object.values(WORDS).flat();
 const line=(end)=>{let s=pick(r,TPL).replace('{w}',pick(r,wb)).replace('{w2}',pick(r,all));if(s.includes('{r}'))s=s.replace('{r}',end||pick(r,['home','free','alive','true']));return s};
 const coup=()=>{const fam=pick(r,RHY);const a=pick(r,fam),b=pick(r,fam.filter(z=>z!==a));return[line(a),line(b)]};
 const v=()=>[...coup(),...coup()].join('\n'),ch=coup();const ch2=[ch[0],ch[1],ch[0],line()].join('\n');
 return `[Verse]\n${v()}\n\n[Chorus]\n${ch2}\n\n[Verse]\n${v()}\n\n[Chorus]\n${ch2}\n\n[Bridge]\n${coup().join('\n')}\n\n[Chorus]\n${ch2}`}
// ---------- state ----------
let S=JSON.parse(localStorage.ssCur||'null')||{title:'My First Song',genre:'Pop',mood:'Happy',key:'C',bpm:110,theme:'love',seed:12345,lyrics:'',secSeeds:{},singer:true,ooh:true};
if(!GENRES.includes(S.genre))S.genre='Pop';if(!S.lyrics)S.lyrics=ideaLyrics(S.theme,S.seed);
let MIX=JSON.parse(localStorage.ssMix||'null')||{drums:.8,bass:.7,chords:.5,lead:.35,ooh:.3,vocal:1,echo:.25,reverb:.3,master:.8};
let LIB=JSON.parse(localStorage.ssLib||'[]');let tab='write',song=null,AC=null,playing=null,vocalBuf=null,vocalOffset=0,rec=null,msg='';
function save(){localStorage.ssCur=JSON.stringify(S);localStorage.ssMix=JSON.stringify(MIX)}
// ---------- composition ----------
function sylls(w){w=w.toLowerCase().replace(/[^a-z]/g,'');if(!w)return 0;if(w.length<=3)return 1;w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');const m=w.match(/[aeiouy]{1,2}/g);return Math.max(1,m?m.length:1)}
function parseLyrics(t){const secs=[];let cur=null;for(let l of t.split('\n')){l=l.trim();const m=l.match(/^\[(.+)\]$/);if(m){cur={name:m[1],lines:[]};secs.push(cur);continue}if(!l)continue;if(!cur){cur={name:'Verse',lines:[]};secs.push(cur)}cur.lines.push(l)}
 return secs.filter(s=>s.lines.length)}
function compose(){const g=GEN[S.genre],mood=MOODS[S.mood],minor=mood.minor,root=48+NOTES.indexOf(S.key);
 const scale=minor?[0,2,3,5,7,8,10]:[0,2,4,5,7,9,11];const spb=60/S.bpm,bar=4*spb;
 let secs=[{name:'Intro',lines:[]},...parseLyrics(S.lyrics),{name:'Outro',lines:[]}];
 const out={secs:[],bpm:S.bpm,spb,root,scale,len:0,title:S.title};let t=0;const maxLen=D?60:600;
 secs.forEach((s,i)=>{const key=s.name+'#'+i,sd=hash(S.seed+':'+(S.secSeeds[key]||0)+':'+s.name),r=rng(sd);
  const bars=s.lines.length?s.lines.length*2:4;if(t+bars*bar>maxLen&&i>0){return}
  const prog=s.name.match(/chorus/i)?g.prog[0]:pick(r,g.prog);
  const sec={name:s.name,key,start:t,bars,chords:[],notes:[],lines:[],fill:r()<.6};
  for(let b=0;b<bars;b++){const deg=prog[b%4];const tri=[0,2,4].map(k=>{const d=deg+k;return root+scale[d%7]+12*Math.floor(d/7)});sec.chords.push({t:t+b*bar,deg,tri,name:NOTES[(root+scale[deg])%12]+(([0,3,4].includes(deg)!==!!minor)?'':'m')})}
  // melody fitted to syllables: each line spans 2 bars (8 beats)
  s.lines.forEach((ln,li)=>{const words=ln.split(/\s+/).filter(Boolean);const syl=[];words.forEach(w=>{const n=sylls(w)||1;for(let k=0;k<n;k++)syl.push(k?'-':w)});
   const lt=t+li*2*bar,avail=7*spb;const n=Math.max(1,syl.length);const step=Math.min(spb,avail/n);let deg=pick(r,[2,4,7,4]);const lineNotes=[];
   syl.forEach((sy,k)=>{const ch=sec.chords[li*2+(k*step>=4*spb?1:0)];const strong=k%2===0;if(strong){const tones=[ch.deg,ch.deg+2,ch.deg+4].map(z=>z%7);let best=deg,bd=99;for(const tn of tones)for(const o of[0,7]){const d=Math.abs(tn+o-deg);if(d<bd){bd=d;best=tn+o}}deg=best}else deg+=pick(r,[-1,1,1,-2,2]);
    deg=Math.max(0,Math.min(11,deg));lineNotes.push({t:lt+k*step,dur:step*.9,midi:root+12+scale[deg%7]+12*Math.floor(deg/7),syl:sy})});
   if(lineNotes.length)lineNotes[lineNotes.length-1].dur=Math.max(lineNotes[lineNotes.length-1].dur,spb*1.5);
   sec.notes.push(...lineNotes);sec.lines.push({t:lt,dur:2*bar-spb,text:ln})});
  out.secs.push(sec);t+=bars*bar});
 out.len=Math.min(t,maxLen);return out}
// ---------- synthesis (works for live and offline contexts) ----------
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function noiseBuf(ctx){const b=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b}
function irBuf(ctx){const L=ctx.sampleRate*2,b=ctx.createBuffer(2,L,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,3)}return b}
function render(ctx,dest,sg,t0,from){const g=GEN[S.genre],nb=noiseBuf(ctx);from=from||0;
 const bus={};['drums','bass','chords','lead','ooh','vocal'].forEach(k=>{bus[k]=ctx.createGain();bus[k].gain.value=MIX[k];bus[k].connect(dest)});
 const T=x=>t0+x-from,ok=x=>x>=from-0.01&&x<sg.len;
 function env(gn,at,a,peak,d){gn.gain.setValueAtTime(0.0001,at);gn.gain.linearRampToValueAtTime(peak,at+a);gn.gain.exponentialRampToValueAtTime(0.0001,at+a+d)}
 function kick(at){const o=ctx.createOscillator(),gn=ctx.createGain();o.frequency.setValueAtTime(150,at);o.frequency.exponentialRampToValueAtTime(40,at+.15);env(gn,at,.002,1,.3);o.connect(gn);gn.connect(bus.drums);o.start(at);o.stop(at+.35)}
 function nz(at,f,type,dur,vol){const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),gn=ctx.createGain();s.buffer=nb;fl.type=type;fl.frequency.value=f;env(gn,at,.001,vol,dur);s.connect(fl);fl.connect(gn);gn.connect(bus.drums);s.start(at);s.stop(at+dur+.05)}
 function tone(at,f,dur,type,vol,b,cut){const o=ctx.createOscillator(),gn=ctx.createGain();o.type=type;o.frequency.value=f;let n=o;if(cut){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;o.connect(fl);n=fl}
  gn.gain.setValueAtTime(0.0001,at);gn.gain.linearRampToValueAtTime(vol,at+.02);gn.gain.setValueAtTime(vol,at+Math.max(.03,dur-.06));gn.gain.linearRampToValueAtTime(0.0001,at+dur);n.connect(gn);gn.connect(b);o.start(at);o.stop(at+dur+.02)}
 const pat=DR[g.drum],sixt=sg.spb/4;
 sg.secs.forEach(sec=>{const intro=sec.name==='Intro',outro=sec.name==='Outro';
  for(let b=0;b<sec.bars;b++){const bt=sec.start+b*4*sg.spb;const fillBar=sec.fill&&b===sec.bars-1;
   for(let s=0;s<16;s++){let at=bt+s*sixt+(s%2?g.swing*sixt:0);if(!ok(at))continue;const A=T(at);
    if(intro&&b<2&&pat[0][s]!=='h')continue;
    if(pat[0][s]==='k')kick(A);if(pat[0][s]==='h'||(s%2===0&&g.drum!=='ballad'))nz(A,8000,'highpass',.05,.25);
    if(pat[1][s]==='s'||(fillBar&&s>=12))nz(A,1800,'bandpass',.18,fillBar&&s>=12?.5:.8)}
   const ch=sec.chords[b];if(!ch)continue;
   // chords
   if(ok(bt))ch.tri.forEach(m=>tone(T(bt),mtof(m),4*sg.spb,g.lead==='sawtooth'?'sawtooth':'triangle',.08,bus.chords,2200));
   // bass
   const bm=ch.tri[0]-12,bs=g.bassStyle;const beats=bs==='whole'?[[0,4]]:bs==='rootfifth'?[[0,1],[2,1]]:bs==='eighths'?[0,.5,1,1.5,2,2.5,3,3.5].map(z=>[z,.45]):bs==='offbeat'?[.5,1.5,2.5,3.5].map(z=>[z,.4]):bs==='808'?[[0,1.5],[2.5,1]]:[[0,1],[1,1],[2,1],[3,1]];
   beats.forEach(([z,d],i)=>{const at=bt+z*sg.spb;if(!ok(at))return;let m=bm;if(bs==='rootfifth'&&i)m=bm+7;if(bs==='walk')m=bm+[0,4,7,5][i];tone(T(at),mtof(m),d*sg.spb,bs==='808'?'sine':'sawtooth',bs==='808'?.5:.22,bus.bass,bs==='808'?400:900)});
   if((intro||outro)&&ok(bt))[0,1,2,3].forEach(k=>{const at=bt+k*sg.spb;tone(T(at),mtof(ch.tri[k%3]+12),sg.spb*.9,g.lead,.06,bus.lead,3000)})}
  sec.notes.forEach(n=>{if(!ok(n.t))return;tone(T(n.t),mtof(n.midi),n.dur,g.lead,.07,bus.lead,2600);
   if(S.ooh){const o=ctx.createOscillator(),f1=ctx.createBiquadFilter(),f2=ctx.createBiquadFilter(),gn=ctx.createGain(),A=T(n.t);o.type='sawtooth';o.frequency.value=mtof(n.midi);
    f1.type='bandpass';f1.frequency.value=350;f1.Q.value=6;f2.type='bandpass';f2.frequency.value=800;f2.Q.value=8;o.connect(f1);o.connect(f2);f1.connect(gn);f2.connect(gn);
    gn.gain.setValueAtTime(0.0001,A);gn.gain.linearRampToValueAtTime(.35,A+.08);gn.gain.linearRampToValueAtTime(0.0001,A+n.dur+.1);gn.connect(bus.ooh);o.start(A);o.stop(A+n.dur+.15)}})});
 // recorded vocal with echo + reverb
 if(vocalBuf){const s=ctx.createBufferSource();s.buffer=vocalBuf;const dry=ctx.createGain(),dl=ctx.createDelay(1),fb=ctx.createGain(),ew=ctx.createGain(),cv=ctx.createConvolver(),rw=ctx.createGain();
  dl.delayTime.value=.3;fb.gain.value=.35;ew.gain.value=MIX.echo;cv.buffer=irBuf(ctx);rw.gain.value=MIX.reverb;s.connect(dry);dry.connect(bus.vocal);s.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(ew);ew.connect(bus.vocal);s.connect(cv);cv.connect(rw);rw.connect(bus.vocal);
  const off=from-vocalOffset;if(off<vocalBuf.duration){if(off>=0)s.start(t0,off);else s.start(t0-off)}}
 return bus}
// ---------- singer (speechSynthesis) ----------
let sayTimers=[];
function singerSchedule(sg,from){sayTimers.forEach(clearTimeout);sayTimers=[];if(!S.singer||!window.speechSynthesis)return;speechSynthesis.cancel();
 const mood=MOODS[S.mood];sg.secs.forEach(sec=>sec.lines.forEach(l=>{if(l.t<from||l.t>=sg.len)return;sayTimers.push(setTimeout(()=>{const u=new SpeechSynthesisUtterance(l.text);
  const w=l.text.split(/\s+/).length;u.rate=Math.max(.6,Math.min(1.6,(w*0.42)/(l.dur*0.85)));u.pitch=mood.pitch;u.volume=Math.min(1,MIX.vocal);try{speechSynthesis.speak(u)}catch(e){}},(l.t-from)*1000))}))}
// ---------- playback ----------
function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function stop(){if(playing){try{playing.master.disconnect()}catch(e){}clearInterval(playing.iv);playing=null}sayTimers.forEach(clearTimeout);if(window.speechSynthesis)speechSynthesis.cancel();if(!muted&&music.paused&&started)music.play().catch(()=>{});draw()}
function play(from){stop();song=compose();const ctx=ac();music.pause();const m=ctx.createGain();m.gain.value=MIX.master;m.connect(ctx.destination);const t0=ctx.currentTime+.15;render(ctx,m,song,t0,from||0);singerSchedule(song,from||0);
 playing={master:m,t0,from:from||0,iv:setInterval(()=>{const p=ctx.currentTime-t0+playing.from;if(p>song.len+.5){stop();return}updPos(p)},100)};G.state='playing';return m}
function updPos(p){const e=document.getElementById('ssPos');if(!e||!song)return;let cur='',ln='';for(const s of song.secs){if(p>=s.start)cur=s.name;for(const l of s.lines)if(p>=l.t&&p<l.t+l.dur)ln=l.text}e.textContent=`▶ ${fmt(p)} / ${fmt(song.len)} · ${cur}  ${ln?'🎤 '+ln:''}`}
function fmt(s){s=Math.max(0,s|0);return (s/60|0)+':'+String(s%60).padStart(2,'0')}
// ---------- mic recording ----------
async function recVocal(){if(rec){rec.stop();return}if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){say('No microphone support in this browser.');return}
 let ms;try{ms=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){say('Microphone blocked. Allow mic access (or try the downloaded version).');return}
 const chunks=[];rec=new MediaRecorder(ms);rec.ondataavailable=e=>chunks.push(e.data);const sing=S.singer;S.singer=false;play(0);const startAt=performance.now();
 rec.onstop=async()=>{ms.getTracks().forEach(t=>t.stop());rec=null;S.singer=sing;stop();try{const ab=await new Blob(chunks).arrayBuffer();vocalBuf=await ac().decodeAudioData(ab);vocalOffset=0.15;say('🎙️ Vocal recorded ('+fmt(vocalBuf.duration)+'). Use the mixer to set echo and reverb.')}catch(e){say('Could not read the recording.')}};
 rec.start();say('🔴 Recording… sing along (headphones help!). Press Stop recording when done.');draw()}
// ---------- WAV export ----------
async function renderOffline(){const sg=compose(),sr=44100,len=Math.ceil((sg.len+2.5)*sr);const oc=new OfflineAudioContext(2,len,sr);const m=oc.createGain();m.gain.value=MIX.master;m.connect(oc.destination);render(oc,m,sg,0,0);return await oc.startRendering()}
function wav(buf){const ch=buf.numberOfChannels,n=buf.length,dv=new DataView(new ArrayBuffer(44+n*ch*2));const w=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i))};
 w(0,'RIFF');dv.setUint32(4,36+n*ch*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,ch,true);dv.setUint32(24,buf.sampleRate,true);dv.setUint32(28,buf.sampleRate*ch*2,true);dv.setUint16(32,ch*2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*ch*2,true);
 const d=[...Array(ch)].map((_,i)=>buf.getChannelData(i));let peak=0;for(let i=0;i<n;i++)for(let k=0;k<ch;k++)peak=Math.max(peak,Math.abs(d[k][i]));const sc=peak>1?1/peak:1;
 let o=44;for(let i=0;i<n;i++)for(let k=0;k<ch;k++){const v=Math.max(-1,Math.min(1,d[k][i]*sc));dv.setInt16(o,v<0?v*32768:v*32767,true);o+=2}return new Blob([dv],{type:'audio/wav'})}
async function exportWav(){if(D){window.demoEnd&&demoEnd('WAV export is in the full version of <b>Coffeebreak Song Studio</b>, along with all 8 genres and full-length songs.');return}
 say('⏳ Rendering WAV…');const buf=await renderOffline();const b=wav(buf);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(S.title||'song').replace(/[^\w\- ]/g,'')+'.wav';document.body.appendChild(a);a.click();a.remove();
 say('💾 WAV saved ('+fmt(buf.duration)+'). Note: the robot Singer voice is not in the WAV (browsers can\'t capture it). Record your own vocal to include singing.')}
// ---------- cover art ----------
function cover(cv,s){const g=cv.getContext('2d'),W2=cv.width,r=rng(hash(s.title+s.seed+s.genre));const hue=r()*360;const gr=g.createLinearGradient(0,0,W2,W2);gr.addColorStop(0,`hsl(${hue},70%,45%)`);gr.addColorStop(1,`hsl(${(hue+80)%360},60%,15%)`);g.fillStyle=gr;g.fillRect(0,0,W2,W2);
 for(let i=0;i<14;i++){g.globalAlpha=.15+r()*.3;g.fillStyle=`hsl(${(hue+r()*120)%360},80%,${50+r()*30}%)`;g.beginPath();if(r()<.5)g.arc(r()*W2,r()*W2,r()*W2*.3,0,7);else g.rect(r()*W2,r()*W2,r()*W2*.4,r()*W2*.05);g.fill()}
 g.globalAlpha=1;g.fillStyle='#fff';g.font=`bold ${W2*.1}px Georgia`;g.textAlign='center';const wds=s.title.split(' ');let l='',y=W2*.72;const lines=[];for(const z of wds){if(g.measureText(l+z).width>W2*.86&&l){lines.push(l);l=''}l+=z+' '}lines.push(l);lines.slice(-2).forEach((q,i)=>g.fillText(q.trim(),W2/2,y+i*W2*.11));
 g.font=`${W2*.065}px Georgia`;g.fillStyle='#ffe9c7';g.fillText(s.genre+' · '+s.mood,W2/2,W2*.93)}
// ---------- UI ----------
function say(m){msg=m;const e=document.getElementById('ssMsg');if(e)e.textContent=m}
function opt(a,v){return a.map(z=>`<option ${z==v?'selected':''}>${z}</option>`).join('')}
function draw(){const g=GEN[S.genre];const tabs=[['write','✍️ Write'],['make','🎛️ Make'],['mix','🎚️ Mix & Record'],['lib','📚 Library'],['about','ℹ️ About']];
 let h=`<h2>🎶 Coffeebreak Song Studio${D?' (Demo)':''}</h2><div class="tabs">${tabs.map(([k,l])=>`<button data-tab="${k}" class="${tab==k?'sel':''}">${l}</button>`).join('')}</div>
 <div class="row"><input id="ssTitle" value="${esc(S.title)}" style="width:220px"> <button data-a="play">▶ Play song</button><button data-a="stop">⏹ Stop</button><span id="ssPos" class="note"></span></div><div id="ssMsg" class="note">${esc(msg)}</div>`;
 if(tab==='write'){h+=`<div class="card"><div class="row"><label>Theme <select id="ssTheme">${opt(Object.keys(WORDS),S.theme)}</select></label><button data-a="idea">💡 Lyric idea generator</button>
  <label>Rhyme helper <input id="ssRw" placeholder="type a word" style="width:120px"></label><button data-a="rhyme">🔎 Rhymes</button></div><div id="ssRh"></div>
  <div class="note">Word bank (tap to add): ${(WORDS[S.theme]||[]).map(w=>`<span class="chip" data-w="${w}">${w}</span>`).join('')}</div>
  <p class="note">Type your own lyrics. Use [Verse], [Chorus], [Bridge] tags. Each line becomes 2 bars of melody.</p><textarea id="ssLy">${esc(S.lyrics)}</textarea></div>`}
 if(tab==='make'){song=compose();h+=`<div class="card"><div class="row"><label>Genre <select id="ssGenre">${opt(GENRES,S.genre)}</select></label><label>Mood <select id="ssMood">${opt(Object.keys(MOODS),S.mood)}</select></label>
  <label>Key <select id="ssKey">${opt(NOTES,S.key)}</select></label><label>Tempo <input id="ssBpm" type="range" min="60" max="150" value="${S.bpm}"> <b id="ssBpmV">${S.bpm}</b> BPM</label><button data-a="gen">🎲 Generate new song</button></div>
  ${D?'<p class="note">Demo: Pop and Country only, songs up to 1 minute. Full version: 8 genres, full-length songs and WAV export.</p>':''}
  <p><b>Structure</b> (${fmt(song.len)}). Tap a section to play it, 🔁 to regenerate just that section:</p>${song.secs.map(s=>`<span class="sec">${s.name} <small>${s.bars} bars</small> <a href="#" data-from="${s.start}">▶</a> <a href="#" data-regen="${esc(s.key)}">🔁</a></span>`).join('')}
  <p><b>Chords</b></p>${song.secs.map(s=>`<div class="note"><b>${s.name}:</b> ${s.chords.map(c=>c.name).join(' · ')}</div>`).join('')}
  <div class="row"><label><input type="checkbox" id="ssSinger" ${S.singer?'checked':''}> 🤖 Singer (robotic computer voice from your browser)</label><label><input type="checkbox" id="ssOoh" ${S.ooh?'checked':''}> "Ooh" vocal pad</label></div></div>`}
 if(tab==='mix'){h+=`<div class="card"><b>Mixer</b>${Object.keys(MIX).map(k=>`<div class="row"><label style="width:90px">${k}</label><input type="range" min="0" max="1.5" step=".05" value="${MIX[k]}" data-mix="${k}"></div>`).join('')}</div>
  <div class="card"><b>🎙️ Your vocal</b><p class="note">Press record: the backing track plays and your mic records you singing. Headphones stop the music leaking into the mic. Echo and reverb are set above.</p>
  <div class="row"><button data-a="rec">${rec?'⏹ Stop recording':'🔴 Record vocal'}</button>${vocalBuf?`<span class="note">Vocal take: ${fmt(vocalBuf.duration)}</span> <button data-a="delv">🗑️ Remove vocal</button>`:''}</div></div>
  <div class="card"><button data-a="wav">💾 Export WAV${D?' (full version)':''}</button> <span class="note">Renders the whole song offline into a WAV file.</span></div>`}
 if(tab==='lib'){h+=`<div class="card"><button data-a="save">💾 Save to library</button> <span class="note">Saved on this device only.</span><div class="lib" style="margin-top:8px">${LIB.map((s,i)=>`<div><canvas width="300" height="300" data-cv="${i}"></canvas><b>${esc(s.title)}</b><br><button data-load="${i}">Open</button><button data-del="${i}">🗑️</button></div>`).join('')||'<p class="note">No songs saved yet.</p>'}</div></div>`}
 if(tab==='about')h+=`<div class="card"><p>Song Studio runs entirely in your browser. It does <b>not</b> use cloud AI. Lyric ideas come from templates, rhymes and a word bank; chords, melody and drums come from music rules for each genre, with a bit of randomness.</p>
  <p>The Singer is your browser's built-in text-to-speech voice. It sounds robotic, and it can't truly hold notes. For real singing, record your own vocal. The Singer voice isn't included in WAV exports.</p><p>Songs, settings and your library stay on your device.</p></div>`;
 R.innerHTML=h;R.querySelectorAll('canvas[data-cv]').forEach(cv=>cover(cv,LIB[+cv.dataset.cv]))}
function esc(s){return String(s).replace(/[&<>"]/g,z=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[z]))}
R.addEventListener('input',e=>{const t=e.target;if(t.id==='ssLy')S.lyrics=t.value;if(t.id==='ssTitle')S.title=t.value;if(t.id==='ssBpm'){S.bpm=+t.value;document.getElementById('ssBpmV').textContent=S.bpm}if(t.dataset.mix){MIX[t.dataset.mix]=+t.value;if(playing&&t.dataset.mix==='master')playing.master.gain.value=MIX.master}save()});
R.addEventListener('change',e=>{const t=e.target;const m={ssTheme:'theme',ssGenre:'genre',ssMood:'mood',ssKey:'key'};if(m[t.id]){S[m[t.id]]=t.value;if(t.id==='ssGenre'){const b=GEN[S.genre].bpm;S.bpm=Math.round((b[0]+b[1])/2)}save();draw()}if(t.id==='ssSinger')S.singer=t.checked;if(t.id==='ssOoh')S.ooh=t.checked;if(t.id==='ssBpm')draw();save()});
R.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-a],[data-w],[data-from],[data-regen],[data-load],[data-del]');if(!t)return;e.preventDefault();const a=t.dataset.a;
 if(t.dataset.tab){tab=t.dataset.tab;draw();return}if(t.dataset.w){S.lyrics+=(S.lyrics.endsWith(' ')||S.lyrics.endsWith('\n')?'':' ')+t.dataset.w;save();draw();return}
 if(t.dataset.from!==undefined){play(+t.dataset.from);return}if(t.dataset.regen){S.secSeeds[t.dataset.regen]=(S.secSeeds[t.dataset.regen]||0)+1;save();say('🔁 Regenerated '+t.dataset.regen.split('#')[0]);draw();return}
 if(t.dataset.load){S=JSON.parse(JSON.stringify(LIB[+t.dataset.load]));if(!GENRES.includes(S.genre))S.genre='Pop';save();tab='make';draw();return}if(t.dataset.del){LIB.splice(+t.dataset.del,1);localStorage.ssLib=JSON.stringify(LIB);draw();return}
 if(a==='play')play(0);if(a==='stop')stop();if(a==='idea'){S.seed=(Math.random()*1e9)|0;S.lyrics=ideaLyrics(S.theme,S.seed);save();draw()}
 if(a==='rhyme'){const w=document.getElementById('ssRw').value,r=rhymesOf(w);document.getElementById('ssRh').innerHTML=r.length?'Rhymes: '+r.map(z=>`<span class="chip" data-w="${z}">${z}</span>`).join(''):'<span class="note">No rhymes found in the bank. Try a shorter word.</span>'}
 if(a==='gen'){S.seed=(Math.random()*1e9)|0;S.secSeeds={};const b=GEN[S.genre].bpm;S.bpm=b[0]+((Math.random()*(b[1]-b[0]))|0);save();say('🎲 New arrangement generated.');draw()}
 if(a==='rec')recVocal();if(a==='delv'){vocalBuf=null;draw()}if(a==='wav')exportWav();
 if(a==='save'){LIB=LIB.filter(s=>s.title!==S.title);LIB.unshift(JSON.parse(JSON.stringify(S)));localStorage.ssLib=JSON.stringify(LIB);G.score=LIB.length;say('Saved "'+S.title+'" to your library.');draw()}});
window.SS={compose,renderOffline,wav,setTab:k=>{tab=k;draw()},get S(){return S},getVocal:()=>vocalBuf,setVocal:b=>{vocalBuf=b;vocalOffset=0;draw()}};
draw();
})();
function update(){}function draw(){}
