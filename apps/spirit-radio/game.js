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
// ===== Coffeebreak Spirit Radio (ghost box for entertainment) =====
const DEMO=!!window.DEMO,SK=DEMO?'spiritDemo':'spiritSave',MAXS=3;const G={state:'title',score:0,level:0};window.G=G;
const NOTE='For entertainment. Words are randomly generated; this app cannot contact spirits.';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={sessions:[],used:0};try{Object.assign(S,JSON.parse(localStorage.getItem(SK)||'{}'))}catch(e){}const save=()=>{try{localStorage.setItem(SK,JSON.stringify(S))}catch(e){}};
const WORDS='hello,here,cold,light,home,leave,stay,mother,father,sister,brother,love,help,yes,no,maybe,door,stairs,listen,remember,sorry,forgive,peace,warm,dark,window,garden,tea,music,dance,laugh,smile,miss you,go,come,wait,soon,always,never,name,who,why,where,now,tomorrow,yesterday,river,rain,storm,bells,church,letter,photo,ring,key,clock,kitchen,bed,dream,sleep,awake,friend,thank you,goodbye,okay,safe,watch,follow,old,young,child,song,candle,smoke,mirror,blue,red,green,gold,seven,three,eleven,north,south,shh,cross,bridge,ocean,sand,flower,rose,lily,heart,promise,secret,laughing,hush,again,closer,beyond,between,whisper'.split(',');
const FR=['…','—','?','.','…?'];
const B={on:false,ac:null,nodes:null,freq:88.1,sweep:120,dir:1,words:[],cur:null,speak:true,rec:null,recs:[],session:null,tm:0,next:1.2,flash:0};window.SB=B;
function ac(){if(!B.ac)B.ac=new (window.AudioContext||window.webkitAudioContext)();B.ac.resume&&B.ac.resume();return B.ac}
function irBuf(a,sec){const b=a.createBuffer(2,a.sampleRate*sec|0,a.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}return b}
function startBox(){if(B.on)return;if(DEMO&&S.used>=MAXS){window.demoEnd&&demoEnd('The free demo includes 3 spirit-box sessions. The full version has unlimited sessions, EVP recordings and the full session log.');return}
 const a=ac(),n=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const src=a.createBufferSource();src.buffer=n;src.loop=true;const bp=a.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.value=1500;const g=a.createGain();g.gain.value=+(document.getElementById('vol')||{value:.25}).value;
 const rev=a.createConvolver();rev.buffer=irBuf(a,3);const rg=a.createGain();rg.gain.value=.35;src.connect(bp);bp.connect(g);g.connect(a.destination);g.connect(rev);rev.connect(rg);rg.connect(a.destination);src.start();
 B.nodes={src,bp,g,rev};B.on=true;S.used++;B.session={start:Date.now(),words:[]};S.sessions.unshift(B.session);S.sessions=S.sessions.slice(0,DEMO?3:100);save();render()}
function stopBox(){if(!B.on)return;try{B.nodes.src.stop()}catch(e){}B.on=false;B.cur=null;if(B.session)B.session.end=Date.now();save();render()}
function chirp(){const a=ac(),o=a.createOscillator(),g=a.createGain();o.type='sawtooth';o.frequency.setValueAtTime(300+Math.random()*900,a.currentTime);o.frequency.exponentialRampToValueAtTime(80+Math.random()*200,a.currentTime+.25);g.gain.setValueAtTime(.05,a.currentTime);g.gain.linearRampToValueAtTime(0,a.currentTime+.25);o.connect(g);g.connect(B.nodes.rev);g.connect(a.destination);o.start();o.stop(a.currentTime+.3)}
function fragment(){let w=WORDS[Math.random()*WORDS.length|0];if(Math.random()<.3)w=w.slice(0,Math.max(2,(w.length*.6)|0))+'…';return w+(Math.random()<.4?FR[Math.random()*FR.length|0]:'')}
function emit(){const w=fragment();B.cur={w,at:t,f:B.freq.toFixed(1)};B.flash=1;chirp();
 if(B.session){B.session.words.push({w,f:B.freq.toFixed(1),ts:Date.now()});save()}
 const L=document.getElementById('sLog');if(L)L.insertAdjacentHTML('afterbegin','<div>'+new Date().toLocaleTimeString()+' · '+B.freq.toFixed(1)+' FM · <b>'+esc(w)+'</b></div>');
 if(B.speak&&window.speechSynthesis){try{const u=new SpeechSynthesisUtterance(w.replace(/[…—?.]/g,''));u.rate=.6;u.pitch=.3;u.volume=.8;const v=speechSynthesis.getVoices();if(v.length)u.voice=v[Math.random()*v.length|0];speechSynthesis.speak(u);
  // reverb tail: speech can't be routed through Web Audio, so a reverb swell plays underneath
  const a=ac(),gg=a.createGain();gg.gain.setValueAtTime(0,a.currentTime);gg.gain.linearRampToValueAtTime(.6,a.currentTime+.15);gg.gain.linearRampToValueAtTime(0,a.currentTime+1.2);const o=a.createOscillator();o.frequency.value=180;o.connect(gg);gg.connect(B.nodes.rev);o.start();o.stop(a.currentTime+1.3)}catch(e){}}}
async function evp(){if(DEMO&&B.recs.length>=1){window.demoEnd&&demoEnd('The free demo includes 1 EVP recording. The full version has unlimited recordings.');return}
 if(B.rec){B.rec.stop();return}let s;try{s=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){alert('Microphone permission is needed for the EVP recorder.');return}
 const ch=[],mr=new MediaRecorder(s);B.rec=mr;mr.ondataavailable=e=>ch.push(e.data);mr.onstop=()=>{s.getTracks().forEach(t=>t.stop());const bl=new Blob(ch,{type:mr.mimeType||'audio/webm'});B.recs.unshift({url:URL.createObjectURL(bl),at:new Date().toLocaleTimeString()});B.rec=null;if(B.session){B.session.evp=(B.session.evp||0)+1;save()}render()};mr.start();render()}
function playEvp(u,slow){const a=ac(),el=new Audio(u);el.playbackRate=slow?.6:1;el.preservesPitch=false;const s=a.createMediaElementSource(el),r=a.createConvolver();r.buffer=irBuf(a,2.5);const dg=a.createGain(),wg=a.createGain();wg.gain.value=.6;s.connect(dg);s.connect(r);r.connect(wg);dg.connect(a.destination);wg.connect(a.destination);el.play()}
const css=document.createElement('style');css.textContent=`#ap{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,96vw);height:min(86vh,720px);background:linear-gradient(#10201c,#020605);border:2px solid #5affc8;border-radius:18px;color:#d8fff0;font:15px/1.4 system-ui,Arial,sans-serif;flex-direction:column;box-shadow:0 0 40px #0f86;overflow:auto;padding:10px 14px;box-sizing:border-box}
#ap h2{margin:2px 0;text-align:center;color:#8affd8;text-shadow:0 0 10px #0f8}#ap button{background:#0c3a2e;color:#d8fff0;border:1px solid #5affc8;border-radius:10px;padding:7px 12px;cursor:pointer;font-weight:bold;margin:3px}#ap .row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:center;margin:6px 0}
#ap .box{background:#000a;border-radius:10px;padding:8px;margin:6px 0;font-size:13px;max-height:180px;overflow:auto}#ap .x{position:absolute;right:10px;top:6px;background:none!important;border:0!important;font-size:20px}#ap .nt{font-size:12px;text-align:center;color:#9fd8c0;border:1px dashed #5affc8;border-radius:8px;padding:6px}`;document.head.appendChild(css);
const ap=document.createElement('div');ap.id='ap';document.body.appendChild(ap);
function openApp(){G.state='app';ap.style.display='flex';render()}function closeApp(){stopBox();ap.style.display='none';G.state='title'}
function render(){ap.innerHTML=`<button class="x">✕</button><h2>👻 Spirit Box</h2><div class="nt">⚠️ ${NOTE}</div>
 <div class="row"><button id="pw">${B.on?'⏹ Stop session':'▶ Start session'}</button><button id="sp">${B.speak?'🗣️ Voice: on':'🔇 Voice: off'}</button><button id="ev">${B.rec?'⏹ Stop EVP':'⏺ EVP record'}</button></div>
 <div class="row">Sweep speed <input id="spd" type="range" min="40" max="400" value="${B.sweep}"> Static <input id="vol" type="range" min="0" max="0.6" step="0.01" value="${B.nodes?B.nodes.g.gain.value:.25}"></div>
 ${DEMO?`<div style="text-align:center;font-size:13px">Free demo: ${Math.max(0,MAXS-S.used)} of 3 sessions left</div>`:''}
 <b>📜 This session</b><div class="box" id="sLog">${(B.session&&B.on?B.session.words.slice().reverse():[]).map(w=>'<div>'+new Date(w.ts).toLocaleTimeString()+' · '+w.f+' FM · <b>'+esc(w.w)+'</b></div>').join('')}</div>
 <b>🎙️ EVP recordings</b> <small>(kept until you close the page; download to keep)</small><div class="box">${B.recs.map((r,i)=>`<div>EVP ${B.recs.length-i} · ${r.at} <button data-p="${i}">▶</button><button data-sl="${i}">🐢 slow+reverb</button><a href="${r.url}" download="spirit-evp-${i+1}.webm" style="color:#8affd8">⬇ save</a></div>`).join('')||'No recordings yet.'}</div>
 <b>📖 Past sessions</b><div class="box">${S.sessions.map(s=>`<div>${new Date(s.start).toLocaleString()} · ${s.words.length} words${s.evp?' · '+s.evp+' EVP':''}: <i>${esc(s.words.slice(0,12).map(w=>w.w).join(' / '))}</i></div>`).join('')||'None yet.'}</div>
 <div class="row"><button id="clr">🗑 Clear log</button></div>`;
 ap.querySelector('.x').onclick=closeApp;document.getElementById('pw').onclick=()=>B.on?stopBox():startBox();document.getElementById('sp').onclick=()=>{B.speak=!B.speak;render()};document.getElementById('ev').onclick=evp;
 document.getElementById('spd').oninput=e=>B.sweep=+e.target.value;document.getElementById('vol').oninput=e=>{if(B.nodes)B.nodes.g.gain.value=+e.target.value};
 document.getElementById('clr').onclick=()=>{if(confirm('Clear the session log?')){S.sessions=B.on&&B.session?[B.session]:[];save();render()}};
 ap.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>playEvp(B.recs[+b.dataset.p].url,false));ap.querySelectorAll('[data-sl]').forEach(b=>b.onclick=()=>playEvp(B.recs[+b.dataset.sl].url,true))}
const motes=Array.from({length:60},(_,i)=>({x:Math.random()*900,y:Math.random()*600,v:.2+Math.random()*.6,r:1+Math.random()*2}));
function update(dt){if(B.on){B.freq+=B.dir*dt*B.sweep/60;if(B.freq>108){B.freq=108;B.dir=-1}if(B.freq<88){B.freq=88;B.dir=1}if(Math.random()<dt*8)B.freq=88+Math.random()*20;B.nodes.bp.frequency.value=600+Math.random()*3000;B.tm+=dt;if(B.tm>B.next){B.tm=0;B.next=1.2+Math.random()*3.5;emit()}}B.flash=Math.max(0,B.flash-dt)}
function draw(){x.clearRect(0,0,900,600);const g=x.createRadialGradient(450,300,40,450,300,520);g.addColorStop(0,'#0e2a22');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,900,600);
 for(const m of motes){m.y-=m.v;m.x+=Math.sin(t+m.y*.02)*.3;if(m.y<0)m.y=600;x.fillStyle='rgba(140,255,210,'+(.2+.2*Math.sin(t*3+m.x))+')';x.beginPath();x.arc(m.x,m.y,m.r,0,7);x.fill()}
 x.globalAlpha=.25+.2*Math.sin(t*.7);x.font='180px serif';x.textAlign='center';x.fillText('👻',450+Math.sin(t*.5)*60,330);x.globalAlpha=1;
 T('👻 Coffeebreak Spirit Radio',450,80,40,'#8affd8','center');
 x.fillStyle='#000c';rr(120,120,660,90,12);x.fill();x.strokeStyle='#5affc8';x.lineWidth=2;x.stroke();for(let f=88;f<=108;f+=2){const px=150+(f-88)*30;x.fillStyle='#5affc8';x.fillRect(px,190,2,12);T(String(f),px,180,11,'#5affc8','center','')}
 const nx=150+(B.freq-88)*30;x.fillStyle='#f44';x.fillRect(nx-2,128,4,74);T(B.freq.toFixed(1)+' FM',450,155,24,'#ff8a8a','center');
 x.strokeStyle='rgba(140,255,210,.8)';x.lineWidth=2;x.beginPath();for(let i=0;i<=600;i+=4){const amp=B.on?(18+B.flash*40)*Math.random():3*Math.sin(t*4+i*.05);x.lineTo(150+i,260+amp*(Math.random()-.5)*2)}x.stroke();
 if(B.cur&&t-B.cur.at<3){x.globalAlpha=Math.max(0,1-(t-B.cur.at)/3);x.shadowColor='#0f8';x.shadowBlur=30;T(B.cur.w,450,360,56,'#e8fff6','center');x.shadowBlur=0;x.globalAlpha=1}
 if(G.state==='title'){button('go',330,430,240,58,B.on?'👻 Open spirit box':'👻 Start ghost box',openApp,{fs:20,bg:'#0c3a2e',ac:'#5affc8'});T(DEMO?'Free demo: 3 sessions':'Full version: unlimited sessions & EVP recordings',450,515,14,'#9fd8c0','center','')}
 T(NOTE,450,560,13,'#9fd8c0','center','');if(Math.random()<.03){x.fillStyle='rgba(200,255,230,.06)';x.fillRect(0,0,900,600)}}
(function(){const o=document.createElement('canvas');o.width=320;o.height=320;const k=x;x=o.getContext('2d');x.font='220px serif';x.textAlign='center';x.fillText('👻',160,240);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});window.SR={B,S,startBox,stopBox,emit,openApp,render,evp};startLoop();
