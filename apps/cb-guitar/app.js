
(function(){
const $=s=>document.querySelector(s),stage=$('#stage'),extra=$('#extra');
CB.toast=m=>{const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(()=>t.style.display='none',4000)};
if(DEMO)CB.recorder.limit=20;
const voices={};
function on(id,v){CB.audio();const I=CB.inst[instFor(id)];voices[id]&&I.stop(voices[id]);voices[id]=I.start(noteFor(id),v||0.85);CB.recorder.log('on',id,v);vis(id,true);}
function off(id){const I=CB.inst[instFor(id)];I.stop(voices[id]);delete voices[id];CB.recorder.log('off',id);vis(id,false);}
let instFor=()=>SLUG,noteFor=id=>id,vis=()=>{};
function bindHold(el,id){el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture&&el.releasePointerCapture(e.pointerId);on(id,0.6+0.4*Math.min(1,(e.pressure||0.5)*1.5));});
 ['pointerup','pointerleave','pointercancel'].forEach(t=>el.addEventListener(t,()=>{if(voices[id]!==undefined)off(id)}));
 el.addEventListener('pointerenter',e=>{if(e.buttons)on(id,0.8)});}
const keyMap={};
document.addEventListener('keydown',e=>{if(e.repeat||e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();if(keyMap[k]){e.preventDefault();keyMap[k].down();}});
document.addEventListener('keyup',e=>{const k=e.key.toLowerCase();keyMap[k]&&keyMap[k].up&&keyMap[k].up();});
const PK='awsedftgyhujkolp;'.split('');
function keyboard(base,count,showKeys){ // white/black piano layout
 const kb=document.createElement('div');kb.className='kb';stage.appendChild(kb);const blackOff=[1,3,6,8,10];let w=0;const whites=[];
 for(let m=base;m<base+count;m++)if(!blackOff.includes(m%12))whites.push(m);
 whites.forEach(m=>{const d=document.createElement('div');d.className='wk';d.dataset.n=m;d.textContent=m%12===0?CB.noteName(m):'';kb.appendChild(d);bindHold(d,m);});
 for(let m=base;m<base+count;m++)if(blackOff.includes(m%12)){const idx=whites.indexOf(m-1)+1;const d=document.createElement('div');d.className='bk';d.dataset.n=m;d.style.left=(idx/whites.length*100)+'%';kb.appendChild(d);bindHold(d,m);}
 vis=(id,s)=>{const el=kb.querySelector('[data-n="'+id+'"]');el&&el.classList.toggle('dn',s)};
 return kb;}
let oct=0;function mapKeys(base){Object.keys(keyMap).forEach(k=>delete keyMap[k]);PK.forEach((k,i)=>keyMap[k]={down:()=>on(base+oct*12+i,0.85),up:()=>off(base+oct*12+i)});
 keyMap['z']={down:()=>{oct=Math.max(-2,oct-1);CB.toast('Octave '+oct)}};keyMap['x']={down:()=>{oct=Math.min(2,oct+1);CB.toast('Octave '+oct)}};}
const wide=innerWidth>700;
if(SLUG==='piano'||SLUG==='synth'){
 const base=wide?48:60,count=wide?37:13;keyboard(base,count);mapKeys(60);
 $('#keys').textContent='Keys: A W S E D F T G Y H U J K O L P ; play notes from middle C. Z / X shift octave.'+(SLUG==='piano'?' Space = sustain pedal.':'');
 if(SLUG==='piano'){const b=document.createElement('button');b.textContent='Sustain pedal';extra.appendChild(b);const set=s=>{CB.sustain=s;b.classList.toggle('on',s)};b.onclick=()=>set(!CB.sustain);keyMap[' ']={down:()=>set(true),up:()=>set(false)};}
 else{CB.synthP={wave:'sawtooth',cut:2400,res:6,atk:0.01,rel:0.4};extra.innerHTML='<select id="wv"><option>sawtooth</option><option>square</option><option>triangle</option><option>sine</option></select> Cutoff <input id="cut" type="range" min="200" max="8000" value="2400"> Res <input id="res" type="range" min="0" max="20" value="6"> Release <input id="rl" type="range" min="0.05" max="3" step="0.05" value="0.4">';
  $('#wv').onchange=e=>CB.synthP.wave=e.target.value;$('#cut').oninput=e=>CB.synthP.cut=+e.target.value;$('#res').oninput=e=>CB.synthP.res=+e.target.value;$('#rl').oninput=e=>CB.synthP.rel=+e.target.value;}
}
if(SLUG==='guitar'||SLUG==='ukulele'){
 const isU=SLUG==='ukulele',open=isU?[67,60,64,69]:[40,45,50,55,59,64];
 const CH=isU?{C:[0,0,0,3],G:[0,2,3,2],D:[2,2,2,0],Am:[2,0,0,0],Em:[0,4,3,2],F:[2,0,1,0],A:[2,1,0,0],Dm:[2,2,1,0],E7:[1,2,0,2]}
  :{C:[-1,3,2,0,1,0],G:[3,2,0,0,0,3],D:[-1,-1,0,2,3,2],Am:[-1,0,2,2,1,0],Em:[0,2,2,0,0,0],F:[1,3,3,2,1,1],A:[-1,0,2,2,2,0],E:[0,2,2,1,0,0],Dm:[-1,-1,0,2,3,1]};
 let cur='C';const neck=document.createElement('div');neck.className='neck';neck.innerHTML='<div class="hole"></div>';stage.appendChild(neck);
 const strs=open.map((o,i)=>{const s=document.createElement('div');s.className='str';s.style.top=(12+i*(76/(open.length-1)))+'%';s.style.height=(isU?3:(6-i)*0.6+1.5)+'px';neck.appendChild(s);return s;});
 noteFor=id=>{const f=CH[cur][id];return f<0?null:open[id]+f;};
 CB.inst[SLUG]._s=CB.inst[SLUG].start;const base=CB.inst[SLUG]._s.bind(CB.inst[SLUG]);CB.inst[SLUG].start=(m,v)=>m==null?null:base(m,v);
 vis=(id,s)=>{if(s){const e=strs[id];e.classList.remove('vib');void e.offsetWidth;e.classList.add('vib');}};
 const pluck=(i,v)=>{on(i,v);};
 function strum(down,v=0.8){const order=open.map((_,i)=>i);if(!down)order.reverse();order.forEach((i,k)=>setTimeout(()=>pluck(i,v*(0.85+Math.random()*0.15)),k*14));}
 let lastY=null,lastStr=null;
 neck.addEventListener('pointerdown',e=>{CB.audio();const r=neck.getBoundingClientRect();lastY=e.clientY;const i=Math.round(((e.clientY-r.top)/r.height*100-12)/(76/(open.length-1)));lastStr=i;if(i>=0&&i<open.length)pluck(i,0.85);neck.setPointerCapture(e.pointerId);});
 neck.addEventListener('pointermove',e=>{if(lastY==null)return;const r=neck.getBoundingClientRect();const i=Math.round(((e.clientY-r.top)/r.height*100-12)/(76/(open.length-1)));if(i!==lastStr&&i>=0&&i<open.length){pluck(i,0.75);lastStr=i;}});
 neck.addEventListener('pointerup',()=>{lastY=null});
 const cd=document.createElement('div');cd.className='chords';stage.appendChild(cd);
 const btns={};Object.keys(CH).forEach((c,k)=>{const b=document.createElement('button');b.textContent=c;b.onclick=()=>setC(c);cd.appendChild(b);btns[c]=b;keyMap[String(k+1)]={down:()=>setC(c)};});
 function setC(c){cur=c;Object.values(btns).forEach(b=>b.classList.remove('on'));btns[c].classList.add('on');CB.recorder.log('chord',c);}setC('C');
 const sd=document.createElement('button');sd.textContent='Strum ↓';sd.onclick=()=>{CB.audio();strum(true)};const su=document.createElement('button');su.textContent='Strum ↑';su.onclick=()=>{CB.audio();strum(false)};cd.append(sd,su);
 keyMap[' ']={down:()=>{CB.audio();strum(true)}};keyMap['enter']={down:()=>{CB.audio();strum(false)}};
 'qwertyu'.split('').slice(0,open.length).forEach((k,i)=>keyMap[k]={down:()=>{CB.audio();pluck(i,0.85)}});
 CB._chord=setC;$('#keys').textContent='Keys: 1-9 pick a chord, Space strums down, Enter strums up, '+'QWERTYU'.slice(0,open.length)+' pluck single strings. Swipe across the strings to strum.';
}
if(SLUG==='violin'){
 const open=[55,62,69,76],vb=document.createElement('div');vb.className='vb';stage.appendChild(vb);
 [3,2,1,0].forEach(s=>{const row=document.createElement('div');row.className='vrow';vb.appendChild(row);for(let p=0;p<8;p++){const m=open[s]+[0,2,4,5,7,9,11,12][p];const d=document.createElement('div');d.dataset.n=m;d.textContent=CB.noteName(m);row.appendChild(d);bindHold(d,m);}});
 vis=(id,s)=>vb.querySelectorAll('[data-n="'+id+'"]').forEach(e=>e.classList.toggle('dn',s));mapKeys(55);
 $('#keys').textContent='Hold a note to bow it. Keys: A W S E D F T G Y H U J K O L P ; from G3. Z / X shift octave.';
}
if(SLUG==='drums'){
 const P=[['crash','Crash','1',1],['tom1','Tom 1','2',0],['tom2','Tom 2','3',0],['ride','Ride','4',1],['openhat','Open hat','5',1],['hihat','Hi-hat','q',1],['snare','Snare','w',0],['kick','Kick','space',0],['floortom','Floor tom','e',0],['clap','Clap','r',0]];
 const kit=document.createElement('div');kit.className='kit';stage.appendChild(kit);noteFor=id=>id;const els={};
 P.forEach(([id,n,k,c])=>{const d=document.createElement('div');d.className='pad'+(c?' cym':'');d.innerHTML=n+'<small>'+k+'</small>';kit.appendChild(d);els[id]=d;
  d.addEventListener('pointerdown',e=>{e.preventDefault();hit(id,0.7+0.3*((e.pressure||0.5)))});keyMap[k==='space'?' ':k]={down:()=>hit(id,0.9)};});
 function hit(id,v){CB.audio();CB.inst.drums.start(id,v);CB.recorder.log('on',id,v);const d=els[id];d.classList.add('dn');setTimeout(()=>d.classList.remove('dn'),90);}
 window._hit=hit;$('#keys').textContent='Keys are shown on each pad. Tap pads with several fingers at once.';
}
// recording + playback
const rec=$('#rec'),play=$('#play'),dl=$('#dl');
rec.onclick=()=>{if(CB.recorder.on){CB.recorder.stop();}else{CB.recorder.start();rec.classList.add('on');rec.textContent='■ Stop';play.disabled=true;}};
const _stop=CB.recorder.stop.bind(CB.recorder);CB.recorder.stop=function(){_stop();rec.classList.remove('on');rec.textContent='● Record';play.disabled=!this.events.length;};
CB.onRecReady=()=>{dl.disabled=false;};
dl.onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(CB.recorder.blob);a.download='coffeebreak-'+SLUG+'-recording.webm';a.click();};
play.onclick=()=>{CB.audio();CB.recorder.stopPlay();CB.recorder.play((t,a,b)=>{if(SLUG==='drums'){t==='on'&&window._hit(a,b);return;}if(t==='chord')CB._chord(a);else if(t==='on')on(a,b);else off(a);});};
// metronome
const met=$('#met'),bpm=$('#bpm'),beats=[...document.querySelectorAll('.beat')];
bpm.oninput=()=>{CB.metro.bpm=+bpm.value;$('#bpmv').textContent=bpm.value+' BPM';};
met.onclick=()=>{if(CB.metro.on){CB.metro.stop();met.classList.remove('on');}else{CB.metro.start();met.classList.add('on');}};
CB.onBeat=b=>beats.forEach((e,i)=>e.classList.toggle('hit',i===b%4));
// keep record log guard: CB.recorder.log is wrapped inside on/off; drums log explicitly
})();