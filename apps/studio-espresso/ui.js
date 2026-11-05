/* Coffeebreak Studio Espresso - main UI: state, transport, arrange, recording, MIDI */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m,ms=2600){ const t=$('#toast'); t.textContent=m; t.classList.remove('hidden'); clearTimeout(toast.h); toast.h=setTimeout(()=>t.classList.add('hidden'),ms); }
function dl(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),60000); }
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function newProject(){ return{name:'My song',bpm:120,sig:4,tempo:[],tracks:[],markers:[],loop:{on:false,s:0,e:16},punch:false,lyrics:'',
 returns:[{id:'rA',name:'Reverb return',vol:0.8,pan:0,fx:[fxNew('hall',{mix:1})]},{id:'rB',name:'Delay return',vol:0.7,pan:0,fx:[fxNew('pingpong',{mix:1})]}],
 master:{vol:0.9,on:true,live:false,makeup:1,p:{l:0.5,m:0,h:1,c:0.5,w:1.05,t:-14}}}; }
let P=newProject(); const SEL={t:null,c:null}; let Z=28; let prefs=LS.get('cbx-prefs',{theme:0,metro:true,count:false,lat:0,keys:false});
const selTrack=()=>trackOf(SEL.t), selClip=()=>{const t=selTrack();return t&&t.clips.find(c=>c.id===SEL.c)};
const COLORS=['#e75b9a','#ff8fb8','#c86bd6','#f2a65a','#5ab4e7','#6fd19a','#e7d25a','#ff6b6b'];
/* ---------- undo / redo ---------- */
const HIST=[],FUT=[];
function snap(){ HIST.push(JSON.stringify(P)); if(HIST.length>80)HIST.shift(); FUT.length=0; }
function undo(){ if(!HIST.length)return toast('Nothing to undo'); FUT.push(JSON.stringify(P)); P=JSON.parse(HIST.pop()); refreshAll(); toast('Undo'); }
function redo(){ if(!FUT.length)return toast('Nothing to redo'); HIST.push(JSON.stringify(P)); P=JSON.parse(FUT.pop()); refreshAll(); toast('Redo'); }
/* ---------- tracks and clips ---------- */
function realTracks(){ return P.tracks.filter(t=>t.kind!=='bus'); }
function addTrack(kind,instType,name){ if(DEMO&&kind!=='bus'&&realTracks().length>=DEMO_TRACKS){toast('The free demo allows 2 tracks. The full version has unlimited tracks.');return null}
 const n=P.tracks.length; const t={id:nid('t'),name:name||(kind==='bus'?'Group bus ':kind==='audio'?'Audio ':'Synth ')+(n+1),kind,vol:0.8,pan:0,mute:false,solo:false,arm:false,mon:false,input:'',out:'',sendA:0,sendB:0,fx:[],auto:{},lane:'',clips:[],color:COLORS[n%8]};
 if(kind==='midi'){ t.inst=instType?(INST_PRESETS[instType]?applyInstPreset(instType):instNew(instType)):instNew('sub'); if(t.inst.type==='drums'&&!name)t.name='Drums '+(n+1); t.mfx={}; }
 P.tracks.push(t); SEL.t=t.id; return t; }
function newClip(t,start,len,extra){ const c=Object.assign({id:nid('c'),name:t.kind==='audio'?'Audio':'Pattern',start,len,gain:1,fadeIn:0,fadeOut:0,offset:0,takes:[],take:0,notes:[]},extra||{}); t.clips.push(c); SEL.c=c.id; SEL.t=t.id; return c; }
function audioClip(t,buf,start,name){ const id=addBuf(buf); return newClip(t,start,s2b(b2s(start)+buf.duration)-start,{name:name||'Audio',takes:[id]}); }
const snapB=b=>{ const g=+$('#iSnap').value; return g?Math.round(b/g)*g:b; };
function splitClip(t,c,at){ if(at<=c.start||at>=c.start+c.len)return toast('Put the playhead inside the clip to split it'); snap();
 const L=at-c.start, n=JSON.parse(JSON.stringify(c)); n.id=nid('c'); n.start=at; n.len=c.len-L; n.fadeIn=0; c.fadeOut=0;
 if(t.kind==='audio')n.offset=(c.offset||0)+b2s(at)-b2s(c.start); else{ n.notes=c.notes.filter(x=>x.s>=L).map(x=>Object.assign({},x,{s:x.s-L})); c.notes=c.notes.filter(x=>x.s<L); }
 c.len=L; t.clips.push(n); refreshAll(); }
function dupClip(t,c){ snap(); const n=JSON.parse(JSON.stringify(c)); n.id=nid('c'); n.start=c.start+c.len; t.clips.push(n); SEL.c=n.id; refreshAll(); }
function delClip(){ const t=selTrack(),c=selClip(); if(!c)return; snap(); t.clips=t.clips.filter(x=>x!==c); SEL.c=null; refreshAll(); }
function autoCrossfade(t){ snap(); const cs=t.clips.slice().sort((a,b)=>a.start-b.start); let n=0; for(let i=1;i<cs.length;i++){const a=cs[i-1],b=cs[i],ov=a.start+a.len-b.start; if(ov>0){const s=b2s(a.start+a.len)-b2s(b.start);a.fadeOut=s;b.fadeIn=s;n++}} refreshAll(); toast(n?`Crossfaded ${n} overlap${n>1?'s':''}`:'No overlapping clips on this track'); }
let CLIPBOARD=null;
/* ---------- transport ---------- */
const T={playing:false,pos:0,t0:0,startBeat:0,G:null,timer:null,rec:null,nextClick:0};
function curBeat(){ if(!T.playing)return T.pos; return Math.max(T.startBeat,s2b(b2s(T.startBeat)+(ctx.currentTime-T.t0))); }
function fmtPos(b){ const sig=P.sig,bar=Math.floor(b/sig)+1,beat=Math.floor(b%sig)+1,tk=Math.floor((b%1)*100); return bar+'.'+beat+'.'+String(tk).padStart(2,'0'); }
function click(c,t,acc){ const o=c.createOscillator(),g=c.createGain(); o.frequency.value=acc?1600:1000; g.gain.setValueAtTime(0.35,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.05); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+0.06); }
async function play(opts={}){ if(T.playing){ stop(); return; } const c=AC(); await ensureWorklet(c); const countB=opts.count?P.sig:0;
 T.startBeat=T.pos; T.t0=c.currentTime+0.12+countB*60/P.bpm; for(let i=0;i<countB;i++)click(c,T.t0-(countB-i)*60/P.bpm,i===0);
 T.G=await buildSong(c,T.startBeat,T.t0,{live:true}); if(refAB.on)T.G.mOut.gain.value=0; T.playing=true; T.nextClick=Math.ceil(T.startBeat-1e-9);
 const tick=()=>{ const G=T.G; if(!G)return; while(G.events.length&&G.events[0].t<c.currentTime+0.25)G.events.shift().fn();
  if(prefs.metro){ while(T.t0+b2s(T.nextClick)-b2s(T.startBeat)<c.currentTime+0.2){ const at=T.t0+b2s(T.nextClick)-b2s(T.startBeat); if(at>=c.currentTime-0.01)click(c,at,T.nextClick%P.sig===0); T.nextClick++; } } };
 tick(); T.timer=setInterval(tick,25); $('#bPlay').textContent='Pause'; $('#bPlay').classList.add('on'); if(refAB.buf)refStart(); }
function stop(){ if(!T.playing)return; T.pos=curBeat(); clearInterval(T.timer); const G=T.G; T.G=null; T.playing=false; try{G.mOut.disconnect()}catch(e){} (G.srcs||[]).forEach(s=>{try{s.stop()}catch(e){}}); refStop(); $('#bPlay').textContent='Play'; $('#bPlay').classList.remove('on'); }
function goStart(){ const was=T.playing; stop(); T.pos=0; drawTL(); if(was)play(); }
function seek(b){ const was=T.playing; stop(); T.pos=Math.max(0,b); drawTL(); if(was)play(); }
function frame(){ if(T.playing){ const b=curBeat(); $('#pos').textContent=fmtPos(b);
  if(P.loop.on&&!T.rec&&b>=P.loop.e){ stop(); T.pos=P.loop.s; play(); }
  else if(!T.rec&&!P.loop.on&&b>songEndBeats()+4&&!refAB.buf){ stop(); }
  drawTL(); meters(); } else $('#pos').textContent=fmtPos(T.pos); requestAnimationFrame(frame); }
/* ---------- recording ---------- */
const STREAMS={};
async function getStream(dev){ const k=dev||'default'; if(STREAMS[k]&&STREAMS[k].active)return STREAMS[k];
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('This browser does not allow microphone access here');
 const a={echoCancellation:false,noiseSuppression:false,autoGainControl:false,channelCount:{ideal:2}}; if(dev)a.deviceId={exact:dev};
 return STREAMS[k]=await navigator.mediaDevices.getUserMedia({audio:a}); }
async function record(){ if(T.rec)return stopRec(); const c=AC(); await ensureWorklet(c); const armed=P.tracks.filter(t=>t.arm);
 if(!armed.length){ const t=selTrack(); if(t&&t.kind!=='bus'){t.arm=true;armed.push(t)} else return toast('Arm a track first (R on the track)'); }
 if(T.playing)stop(); const items=[];
 try{ for(const t of armed.filter(t=>t.kind==='audio')){ const st=await getStream(t.input); const src=c.createMediaStreamSource(st); const node=new AudioWorkletNode(c,'cbx-rec'); const z=c.createGain(); z.gain.value=0; src.connect(node); node.connect(z); z.connect(c.destination);
   const it={t,node,src,chunks:[[],[]]}; node.port.onmessage=e=>{it.chunks[0].push(e.data[0]);it.chunks[1].push(e.data[1])}; if(t.mon){const mg=c.createGain();mg.gain.value=0.9;src.connect(mg);mg.connect(c.destination);it.mon=mg} items.push(it); } }
 catch(e){ return toast('Microphone not available: '+e.message+'. Inside itch, tap Rec again after allowing the microphone.',5000); }
 if(P.punch&&P.loop.on&&T.pos>P.loop.s)T.pos=Math.max(0,P.loop.s-P.sig);
 T.rec={items,recT:c.currentTime,midi:[],held:{},midiTracks:armed.filter(t=>t.kind==='midi')}; $('#bRec').classList.add('on'); renderHeads(); await play({count:prefs.count}); }
async function stopRec(){ const R=T.rec; if(!R)return; const endB=curBeat(); T.rec=null; stop(); $('#bRec').classList.remove('on'); const c=ctx,sr=c.sampleRate;
 R.items.forEach(it=>it.node.port.postMessage('flush')); await new Promise(r=>setTimeout(r,200)); snap();
 const lat=(prefs.lat||0)/1000+(c.baseLatency||0)+(c.outputLatency||0);
 for(const it of R.items){ it.src.disconnect(); it.node.disconnect(); if(it.mon)it.mon.disconnect(); const n=it.chunks[0].reduce((a,x)=>a+x.length,0); if(!n)continue;
  const full=newBuf(2,n,sr); let o=0; it.chunks[0].forEach((x,i)=>{full.getChannelData(0).set(x,o);full.getChannelData(1).set(it.chunks[1][i],o);o+=x.length});
  let s0=Math.max(0,Math.round((T.t0-R.recT+lat)*sr)),st=T.startBeat,e0=full.length;
  if(P.punch&&P.loop.on){ const a=b2s(P.loop.s)-b2s(T.startBeat),b=b2s(P.loop.e)-b2s(T.startBeat); if(a>0){s0+=Math.round(a*sr);st=P.loop.s} e0=Math.min(e0,Math.round((T.t0-R.recT+lat+b)*sr)); }
  if(e0-s0<sr*0.05)continue; const buf=sliceBuf(full,s0,e0),id=addBuf(buf),len=s2b(b2s(st)+buf.duration)-st;
  const ex=it.t.clips.find(cl=>Math.abs(cl.start-st)<0.05); if(ex){ ex.takes.push(id); ex.take=ex.takes.length-1; ex.len=Math.max(ex.len,len); SEL.c=ex.id; toast('Take '+ex.takes.length+' added to the clip. Pick a take in the clip panel.'); }
  else { newClip(it.t,st,len,{name:'Rec',takes:[id]}); } }
 for(const t of R.midiTracks){ Object.keys(R.held).forEach(p=>midiOff(+p,endB)); const ns=R.midi.filter(n=>n.t===t); if(!ns.length)continue; const st=Math.floor(Math.min(...ns.map(n=>n.s))/P.sig)*P.sig,end=Math.ceil(Math.max(...ns.map(n=>n.s+n.l))/P.sig)*P.sig;
  newClip(t,st,Math.max(P.sig,end-st),{name:'MIDI take',notes:ns.map(n=>({p:n.p,s:n.s-st,l:Math.max(0.05,n.l),v:n.v}))}); }
 refreshAll(); }
/* ---------- live notes (MIDI keyboard, on-screen keys, computer keys) ---------- */
const LIVE={}; let prevCh=null,prevKey='';
function liveDest(t){ const c=AC(); if(T.playing&&T.G&&T.G.ch[t.id])return T.G.ch[t.id].inp; const k=t.id+JSON.stringify(t.fx)+t.vol+t.pan; if(prevKey!==k){ if(prevCh)try{prevCh.mute.disconnect()}catch(e){} WL_OK.set(c,WL_OK.get(c)); prevCh=buildChannel(c,t,c.destination,null,false); prevKey=k; } return prevCh.inp; }
function liveTrack(){ return P.tracks.find(t=>t.arm&&t.kind==='midi')||(selTrack()&&selTrack().kind==='midi'?selTrack():P.tracks.find(t=>t.kind==='midi')); }
function midiOn(p,v){ const t=liveTrack(); if(!t)return; const c=AC(); if(LIVE[p])LIVE[p].stop(c.currentTime); LIVE[p]=playNote(c,liveDest(t),t.inst,p,c.currentTime,null,v);
 if(T.rec&&T.rec.midiTracks.includes(t)){ const n={t,p,s:curBeat(),l:0.25,v}; T.rec.midi.push(n); T.rec.held[p]=n; } keyVis(p,true); }
function midiOff(p,atB){ const c=ctx; if(LIVE[p]){LIVE[p].stop(c.currentTime);delete LIVE[p]} if(T.rec&&T.rec.held[p]){ const n=T.rec.held[p]; n.l=(atB||curBeat())-n.s; delete T.rec.held[p]; } keyVis(p,false); }
function keyVis(p,on){ const k=document.querySelector('.keys div[data-p="'+p+'"]'); if(k)k.classList.toggle('dn',on); }
let MIDI_IN=[];
async function connectMIDI(){ if(!navigator.requestMIDIAccess)return toast('Web MIDI is not supported in this browser. Chrome and Edge support it.');
 try{ const acc=await navigator.requestMIDIAccess(); const hook=()=>{MIDI_IN=[];acc.inputs.forEach(i=>{MIDI_IN.push(i.name);i.onmidimessage=e=>{const[s,d1,d2]=e.data,cmd=s&0xf0;if(cmd===0x90&&d2>0)midiOn(d1,d2/127);else if(cmd===0x80||(cmd===0x90&&d2===0))midiOff(d1)}}); const el=$('#midiStat'); if(el)el.textContent=MIDI_IN.length?'Connected: '+MIDI_IN.join(', '):'No MIDI keyboard found. Plug one in and press Connect again.'};
  hook(); acc.onstatechange=hook; toast(MIDI_IN.length?'MIDI connected':'No MIDI device found'); }catch(e){ toast('MIDI access was blocked'); } }
const CKEYS='zsxdcvgbhnjmq2w3er5t6y7ui9o0p';
/* ---------- arrange view ---------- */
const ROW=74,LANE=46,RUL=24;
function rowH(t){ return ROW+(t.lane?LANE:0); }
function renderHeads(){ const h=$('#heads'); if(!h)return; const ins=DEV_IN||[]; h.innerHTML=P.tracks.map(t=>{ const buses=P.tracks.filter(b=>b.kind==='bus'&&b!==t);
 const lanes=[['','Automation: off'],['vol','Auto: Volume'],['pan','Auto: Pan']].concat((t.fx||[]).flatMap(f=>Object.keys(FXDEF[f.type].b?FXDEF[f.type].p:{}).map(k=>['fx:'+f.id+':'+k,'Auto: '+FXDEF[f.type].n+' '+FXDEF[f.type].p[k][3]])));
 return `<div class="th${t.id===SEL.t?' sel':''}" data-id="${t.id}" style="height:${rowH(t)}px;border-left:5px solid ${t.color}">
 <div class="r"><input type="text" value="${esc(t.name)}" data-k="name"><span class="tag">${t.kind==='bus'?'Bus':t.kind==='audio'?'Audio':INSTDEF[t.inst.type].n.split(' ')[0]}</span></div>
 <div class="r"><button data-k="mute" class="${t.mute?'on':''}" title="Mute">M</button><button data-k="solo" class="${t.solo?'on':''}" title="Solo">S</button>${t.kind!=='bus'?`<button data-k="arm" class="${t.arm?'armed':''}" title="Arm for recording">R</button>`:''}${t.kind==='audio'?`<button data-k="mon" class="${t.mon?'on':''}" title="Hear the input while recording">Mon</button>`:''}
 <select data-k="out" title="Output">${['<option value="">Master</option>'].concat(buses.map(b=>`<option value="${b.id}"${t.out===b.id?' selected':''}>${esc(b.name)}</option>`)).join('')}</select><button data-k="del" title="Delete track">x</button></div>
 <div class="r">${t.kind==='audio'?`<select data-k="input" title="Input">${['<option value="">Default input</option>'].concat(ins.map(d=>`<option value="${d.deviceId}"${t.input===d.deviceId?' selected':''}>${esc(d.label||'Input')}</option>`)).join('')}</select>`:''}<select data-k="lane">${lanes.map(([v,n])=>`<option value="${v}"${t.lane===v?' selected':''}>${esc(n)}</option>`).join('')}</select></div></div>`; }).join('');
 $$('#heads .th').forEach(el=>{ const t=trackOf(el.dataset.id); el.onpointerdown=e=>{ if(SEL.t!==t.id){SEL.t=t.id;SEL.c=null;$$('#heads .th').forEach(x=>x.classList.toggle('sel',x===el));drawTL();renderInspector();} };
  el.querySelectorAll('[data-k]').forEach(c=>{ const k=c.dataset.k; if(c.tagName==='BUTTON')c.onclick=()=>{ if(k==='del'){ if(!confirm('Delete '+t.name+'?'))return; snap(); P.tracks=P.tracks.filter(x=>x!==t); P.tracks.forEach(x=>{if(x.out===t.id)x.out=''}); } else { snap(); t[k]=!t[k]; if(T.playing&&T.G&&T.G.ch[t.id]&&k==='mute')T.G.ch[t.id].mute.gain.value=t.mute?0:1; } refreshAll(); };
   else c.onchange=()=>{ snap(); t[k]=c.value; if(k==='lane'&&c.value&&!t.auto[c.value]){ const r=laneRange(t,c.value),v=c.value==='vol'?t.vol:c.value==='pan'?t.pan:(()=>{const m=c.value.split(':');const f=t.fx.find(x=>x.id===m[1]);return f.p[m[2]]})(); t.auto[c.value]=[]; } refreshAll(); }; }); }); }
const peakCache={};
function peaksOf(id){ if(peakCache[id])return peakCache[id]; const b=BUFS[id]; if(!b)return null; const d=b.getChannelData(0),n=Math.min(4000,Math.ceil(b.duration*100)),st=d.length/n,pk=new Float32Array(n); for(let i=0;i<n;i++){let m=0;for(let j=Math.floor(i*st);j<Math.floor((i+1)*st);j+=4)m=Math.max(m,Math.abs(d[j]));pk[i]=m} return peakCache[id]=pk; }
function drawTL(){ const cv=$('#tl'); if(!cv||!$('#t-arrange').classList.contains('on'))return; const endB=Math.max(songEndBeats()+P.sig*8,P.sig*32),W=Math.ceil(endB*Z),H=RUL+P.tracks.reduce((a,t)=>a+rowH(t),0)+30,dpr=Math.min(2,devicePixelRatio||1);
 if(cv.width!==W*dpr||cv.height!==H*dpr){cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px'} const g=cv.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#2e1422'; g.fillRect(0,0,W,H);
 const wrap=$('#tlWrap'),x0=wrap.scrollLeft-50,x1=x0+wrap.clientWidth+100;
 for(let b=0;b<endB;b++){ const x=b*Z; if(x<x0||x>x1)continue; g.fillStyle=b%P.sig===0?'#ffffff30':'#ffffff10'; g.fillRect(x,RUL,1,H); if(b%P.sig===0){g.fillStyle='#ffd6e8';g.font='11px sans-serif';g.fillText(b/P.sig+1,x+3,15)} }
 (P.tempo||[]).forEach(([b,bpm])=>{g.fillStyle='#f2a65a';g.fillText(bpm+' BPM',b*Z+3,22)});
 if(P.loop.e>P.loop.s){ g.fillStyle=P.loop.on?'#e75b9a88':'#e75b9a33'; g.fillRect(P.loop.s*Z,0,(P.loop.e-P.loop.s)*Z,RUL-4); if(P.loop.on){g.fillStyle='#e75b9a14';g.fillRect(P.loop.s*Z,RUL,(P.loop.e-P.loop.s)*Z,H)} }
 P.markers.forEach(m=>{ g.fillStyle='#6fd19a'; g.fillRect(m.b*Z,0,2,H); g.fillText(m.name,m.b*Z+4,RUL-2) });
 let y=RUL; for(const t of P.tracks){ const h=rowH(t); g.fillStyle=t.id===SEL.t?'#ffffff0d':'transparent'; g.fillRect(0,y,W,h); g.fillStyle='#ffffff18'; g.fillRect(0,y+h-1,W,1);
  for(const c of t.clips){ const x=c.start*Z,w=c.len*Z; if(x+w<x0||x>x1)continue; const sel=c.id===SEL.c; g.fillStyle=t.color+(sel?'':'bb'); g.fillRect(x,y+3,w,ROW-6); g.strokeStyle=sel?'#fff':'#0006'; g.lineWidth=sel?2:1; g.strokeRect(x+0.5,y+3.5,w-1,ROW-7);
   g.save(); g.beginPath(); g.rect(x,y+3,w,ROW-6); g.clip(); g.fillStyle='#2e1422cc';
   if(t.kind==='audio'){ const id=c.takes[c.take],pk=peaksOf(id),b=BUFS[id]; if(pk){ const mid=y+ROW/2+5,hh=(ROW-22)/2,secPerPx=(b2s(c.start+c.len)-b2s(c.start))/w; for(let px=0;px<w;px+=1){ const s=(c.offset||0)+px*secPerPx,i=Math.floor(s*100); if(i>=pk.length)break; const v=pk[i]*hh*(c.gain||1); g.fillRect(x+px,mid-v,1,v*2+1); } }
    if(c.fadeIn){const fw=(s2b(b2s(c.start)+c.fadeIn)-c.start)*Z;g.fillStyle='#fff6';g.beginPath();g.moveTo(x,y+3);g.lineTo(x+fw,y+3);g.lineTo(x,y+ROW-3);g.fill()}
    if(c.fadeOut){const fw=(c.start+c.len-s2b(b2s(c.start+c.len)-c.fadeOut))*Z;g.fillStyle='#fff6';g.beginPath();g.moveTo(x+w,y+3);g.lineTo(x+w-fw,y+3);g.lineTo(x+w,y+ROW-3);g.fill()} }
   else if(c.notes.length){ const ps=c.notes.map(n=>n.p),lo=Math.min(...ps),hi=Math.max(...ps)+1,sc=(ROW-22)/Math.max(12,hi-lo); for(const n of c.notes){ if(n.s>=c.len)continue; g.fillRect(x+n.s*Z,y+ROW-6-(n.p-lo+1)*sc,Math.max(2,n.l*Z-1),Math.max(2,sc-1)); } }
   g.fillStyle='#fff'; g.font='bold 11px sans-serif'; g.fillText(c.name+(c.takes&&c.takes.length>1?`  take ${c.take+1}/${c.takes.length}`:''),x+4,y+15); g.restore(); }
  if(t.lane){ const ly=y+ROW,pts=t.auto[t.lane]||[],[mn,mx]=laneRange(t,t.lane); g.fillStyle='#0003'; g.fillRect(0,ly,W,LANE-2); g.strokeStyle='#ffd6e8'; g.lineWidth=1.5; g.beginPath(); const Y=v=>ly+LANE-4-(v-mn)/(mx-mn)*(LANE-8);
   if(pts.length){ g.moveTo(0,Y(pts[0][1])); pts.forEach(([b,v])=>g.lineTo(b*Z,Y(v))); g.lineTo(W,Y(pts[pts.length-1][1])); g.stroke(); g.fillStyle='#fff'; pts.forEach(([b,v])=>g.fillRect(b*Z-3,Y(v)-3,6,6)); } else { g.fillStyle='#ffd6e8'; g.font='11px sans-serif'; g.fillText('Click to add automation points. Double-click a point to remove it.',8,ly+26); } }
  y+=h; }
 const ph=curBeat()*Z; g.fillStyle='#fff'; g.fillRect(ph,0,2,H);
 if(T.playing&&prefs.follow!==false){ if(ph>wrap.scrollLeft+wrap.clientWidth-40||ph<wrap.scrollLeft)wrap.scrollLeft=ph-40; } }
function hitTL(e){ const r=$('#tl').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,b=x/Z; if(y<RUL)return{zone:'ruler',b,x,y}; let yy=RUL;
 for(const t of P.tracks){ const h=rowH(t); if(y<yy+h){ if(t.lane&&y>=yy+ROW)return{zone:'lane',t,b,x,y,ly:yy+ROW}; const c=t.clips.slice().reverse().find(c=>b>=c.start&&b<=c.start+c.len); return{zone:c?'clip':'empty',t,c,b,x,y,top:yy}; } yy+=h; } return{zone:'none',b,x,y}; }
let DRAG=null;
function initArrange(){ const cv=$('#tl');
 cv.addEventListener('pointerdown',e=>{ const h=hitTL(e); cv.setPointerCapture(e.pointerId);
  if(h.zone==='ruler'){ if(e.shiftKey||ARR_MODE==='loop'){ snap(); DRAG={k:'loop',b0:snapB(h.b)}; P.loop.s=P.loop.e=DRAG.b0; } else seek(snapB(h.b)); return; }
  if(h.t&&SEL.t!==h.t.id){SEL.t=h.t.id; renderHeads();}
  if(h.zone==='lane'){ const t=h.t,[mn,mx]=laneRange(t,t.lane),pts=t.auto[t.lane]||(t.auto[t.lane]=[]); const v=mn+(1-(h.y-h.ly-4)/(LANE-8))*(mx-mn); snap();
   let i=pts.findIndex(p=>Math.abs(p[0]*Z-h.x)<7); if(i<0){ pts.push([snapB(h.b),Math.max(mn,Math.min(mx,v))]); pts.sort((a,b)=>a[0]-b[0]); i=pts.findIndex(p=>Math.abs(p[0]-snapB(h.b))<1e-6); } DRAG={k:'auto',t,pt:pts[i],mn,mx,ly:h.ly}; drawTL(); return; }
  if(h.zone==='clip'){ SEL.c=h.c.id; snap(); const edge=(h.c.start+h.c.len)*Z-h.x<9; if(ARR_MODE==='split'){ HIST.pop(); splitClip(h.t,h.c,snapB(h.b)); return; }
   DRAG={k:edge?'resize':'move',t:h.t,c:h.c,b0:h.b,s0:h.c.start,l0:h.c.len,o0:h.c.offset||0,alt:e.altKey}; if(e.altKey){ const n=JSON.parse(JSON.stringify(h.c)); n.id=nid('c'); h.t.clips.push(n); DRAG.c=n; SEL.c=n.id; } renderInspector(); drawTL(); return; }
  if(h.zone==='empty'){ SEL.c=null; if(ARR_MODE==='draw'&&h.t.kind==='midi'){ snap(); newClip(h.t,Math.floor(h.b/P.sig)*P.sig,P.sig); refreshAll(); return; } renderInspector(); drawTL(); } });
 cv.addEventListener('pointermove',e=>{ if(!DRAG)return; const h=hitTL(e);
  if(DRAG.k==='loop'){ const b=snapB(h.b); P.loop.s=Math.max(0,Math.min(DRAG.b0,b)); P.loop.e=Math.max(DRAG.b0,b); P.loop.on=P.loop.e>P.loop.s; $('#bLoop').classList.toggle('on',P.loop.on); }
  else if(DRAG.k==='auto'){ const r=$('#tl').getBoundingClientRect(),y=e.clientY-r.top; DRAG.pt[0]=Math.max(0,snapB(h.b)); DRAG.pt[1]=Math.max(DRAG.mn,Math.min(DRAG.mx,DRAG.mn+(1-(y-DRAG.ly-4)/(LANE-8))*(DRAG.mx-DRAG.mn))); DRAG.t.auto[DRAG.t.lane].sort((a,b)=>a[0]-b[0]); }
  else if(DRAG.k==='move'){ DRAG.c.start=Math.max(0,snapB(DRAG.s0+h.b-DRAG.b0)); if(h.t&&h.t!==DRAG.t&&h.t.kind===DRAG.t.kind){ DRAG.t.clips=DRAG.t.clips.filter(x=>x!==DRAG.c); h.t.clips.push(DRAG.c); DRAG.t=h.t; SEL.t=h.t.id; } }
  else if(DRAG.k==='resize'){ DRAG.c.len=Math.max(0.25,snapB(DRAG.s0+DRAG.l0+h.b-DRAG.b0)-DRAG.s0); }
  drawTL(); });
 const end=()=>{ if(DRAG){ DRAG=null; refreshAll(); } }; cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
 cv.addEventListener('dblclick',e=>{ const h=hitTL(e); if(h.zone==='lane'){ const pts=h.t.auto[h.t.lane]||[],i=pts.findIndex(p=>Math.abs(p[0]*Z-h.x)<8); if(i>=0){snap();pts.splice(i,1);drawTL()} }
  else if(h.zone==='empty'&&h.t.kind==='midi'){ snap(); newClip(h.t,Math.floor(h.b/P.sig)*P.sig,P.sig); refreshAll(); } else if(h.zone==='clip'){ showTab(h.t.kind==='audio'?'editor':(h.t.inst.type==='drums'?'drums':'piano')); } else if(h.zone==='empty'&&h.t.kind==='audio'){ T.pos=snapB(h.b); $('#impFile').click(); } });
 $('#tlWrap').addEventListener('scroll',()=>{ if(!T.playing)drawTL(); });
 $('#impFile').onchange=e=>{ const fs=[...e.target.files]; e.target.value=''; if(window.CBG&&CBG.ready)CBG.handleFiles(fs); else toast('The file loader is not ready yet. Try again in a moment.'); };
}
let ARR_MODE='select';
function renderInspector(){ const box=$('#insp'); if(!box)return; const t=selTrack(),c=selClip(); if(!c){ box.innerHTML=t?`<span class="hint">Track: ${esc(t.name)}. Select a clip to edit it, or double-click an empty spot on a synth track to make a pattern.</span>
  ${t.kind!=='bus'?'<button id="iFreeze">Freeze / bounce track to audio</button>':''}${t.kind==='audio'?'<button id="iXf">Auto crossfade overlaps</button>':''}`:'<span class="hint">Add a track to get started.</span>';
  if($('#iFreeze'))$('#iFreeze').onclick=()=>freezeTrack(t); if($('#iXf'))$('#iXf').onclick=()=>autoCrossfade(t); return; }
 box.innerHTML=`<b>${esc(c.name)}</b> <label class="mini">Name <input type="text" id="cName" value="${esc(c.name)}" style="width:110px"></label>
 <label class="mini">Start <input type="number" id="cStart" step="0.25" value="${+c.start.toFixed(3)}"></label><label class="mini">Length <input type="number" id="cLen" step="0.25" value="${+c.len.toFixed(3)}"></label>
 ${t.kind==='audio'?`<label class="mini">Gain <input type="number" id="cGain" step="0.05" value="${c.gain}"></label><label class="mini">Fade in s <input type="number" id="cFi" step="0.05" value="${+(c.fadeIn||0).toFixed(3)}"></label><label class="mini">Fade out s <input type="number" id="cFo" step="0.05" value="${+(c.fadeOut||0).toFixed(3)}"></label>
 <label class="mini">Take <select id="cTake">${c.takes.map((x,i)=>`<option value="${i}"${i===c.take?' selected':''}>Take ${i+1}</option>`).join('')}</select></label>${c.takes.length>1?'<button id="cDelTake">Remove this take</button>':''}`:''}
 <button id="cSplit">Split at playhead (S)</button><button id="cDup">Duplicate (Ctrl+D)</button><button id="cDel">Delete</button><button id="cOpen">Open in ${t.kind==='audio'?'editor':'piano roll'}</button>`;
 const num=(id,k,f)=>$(id).onchange=()=>{snap();c[k]=f?f(+$(id).value):+$(id).value;refreshAll()};
 $('#cName').onchange=()=>{snap();c.name=$('#cName').value;drawTL()}; num('#cStart','start',v=>Math.max(0,v)); num('#cLen','len',v=>Math.max(0.1,v));
 if($('#cGain')){ num('#cGain','gain'); num('#cFi','fadeIn',v=>Math.max(0,v)); num('#cFo','fadeOut',v=>Math.max(0,v)); $('#cTake').onchange=()=>{snap();c.take=+$('#cTake').value;refreshAll()}; if($('#cDelTake'))$('#cDelTake').onclick=()=>{snap();c.takes.splice(c.take,1);c.take=Math.max(0,c.take-1);refreshAll()}; }
 $('#cSplit').onclick=()=>splitClip(t,c,T.pos); $('#cDup').onclick=()=>dupClip(t,c); $('#cDel').onclick=delClip; $('#cOpen').onclick=()=>showTab(t.kind==='audio'?'editor':(t.inst.type==='drums'?'drums':'piano')); }
async function freezeTrack(t){ toast('Bouncing '+t.name+'...'); try{ const b=await renderSong({only:t.id,tail:2}); snap(); const n=addTrack('audio',null,t.name+' (frozen)'); if(!n)return; audioClip(n,b,0,t.name+' bounce'); t.mute=true; refreshAll(); toast(t.name+' bounced to audio. The original is muted.'); }catch(e){ toast(e.message); } }
let DEV_IN=[];
async function refreshDevices(){ try{ const ds=await navigator.mediaDevices.enumerateDevices(); DEV_IN=ds.filter(d=>d.kind==='audioinput'); }catch(e){} }
