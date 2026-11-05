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
// ===== Coffeebreak CB Radio (standalone; P2P voice via Trystero/nostr, logic adapted from clips-cbradio.js) =====
const DEMO=!!window.DEMO,MAXCH=DEMO?5:40;const G={state:'title',score:0,level:0};window.G=G;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TEN=[['10-1','Receiving poorly'],['10-2','Receiving well'],['10-4','Message received / OK'],['10-7','Going off air'],['10-8','In service'],['10-9','Repeat message'],['10-10','Standing by'],['10-13','Weather / road report'],['10-20','What is your location?'],['10-21','Call by telephone'],['10-33','Emergency traffic'],['10-36','Correct time?'],['10-41','Tune to channel…'],['10-100','Comfort break'],['10-200','Police needed'],['Breaker','Asking to join the channel'],['Good buddy','A friend on air'],['Rubber Duck','Lead vehicle in a convoy'],['Smokey','Police'],['Handle','Your on-air nickname'],['Over','Done talking, your turn'],['Roger','Understood']];
const R={room:null,ch:null,handle:(()=>{try{return localStorage.getItem('cbHandle')||''}catch(e){return ''}})(),peers:{},mic:null,tx:false,talking:{},ac:null,els:{},log:[],sig:0};window.CB=R;
function ac(){if(!R.ac)R.ac=new (window.AudioContext||window.webkitAudioContext)();R.ac.resume&&R.ac.resume();return R.ac}
function noise(sec,vol){const a=ac(),n=a.createBuffer(1,Math.max(1,a.sampleRate*sec|0),a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(Math.random()<.02?1:.35);const s=a.createBufferSource();s.buffer=n;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.7;const g=a.createGain();g.gain.value=vol;g.gain.setValueAtTime(vol,a.currentTime+sec*.7);g.gain.linearRampToValueAtTime(0,a.currentTime+sec);s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
function beep(){const a=ac(),t0=a.currentTime;[[1200,0],[900,.09]].forEach(([fr,d])=>{const o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.value=fr;g.gain.setValueAtTime(.08,t0+d);g.gain.setValueAtTime(0,t0+d+.08);o.connect(g);g.connect(a.destination);o.start(t0+d);o.stop(t0+d+.1)})}
function squelch(){noise(.25,.25)}
let hum=null;function staticBed(on){if(on&&!hum){const a=ac(),n=a.createBuffer(1,a.sampleRate*2,a.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=n;s.loop=true;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=2500;const g=a.createGain();g.gain.value=+$v('stv',.03);s.connect(f);f.connect(g);g.connect(a.destination);s.start();hum={s,g}}if(!on&&hum){hum.s.stop();hum=null}}
function $v(id,d){const e=document.getElementById(id);return e?e.value:d}
function log(m){R.log.unshift(new Date().toLocaleTimeString()+'  '+m);R.log=R.log.slice(0,40);const L=document.getElementById('cbLog');if(L)L.innerHTML=R.log.map(esc).join('<br>')}
function list(){const L=document.getElementById('rbL');if(!L)return;L.innerHTML=`<div>📻 <b>${esc(R.handle)}</b> (you)${R.tx?' 🔴 TX':''}</div>`+Object.entries(R.peers).map(([p,h])=>`<div>📻 ${esc(h)}${R.talking[p]?' 🔊 talking…':''}</div>`).join('');const n=document.getElementById('rbN');if(n)n.textContent=(1+Object.keys(R.peers).length)+' on channel'}
async function leave(){if(R.room)try{await R.room.leave()}catch(e){}R.room=null;R.peers={};R.talking={};Object.values(R.els).forEach(e=>{e.srcObject=null;e.remove()});R.els={};if(R.mic)R.mic.getTracks().forEach(t=>t.stop());R.mic=null;staticBed(false)}
async function join(ch){await leave();R.ch=ch;
 try{R.mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}catch(e){R.mic=null;log('Mic not available: listen-only')}
 if(!window.Trystero){log('Radio network script missing');return}
 let r;try{r=Trystero.joinRoom({appId:'coffeebreaks-itch-cbradio-v1'},'ch'+ch)}catch(e){log('Could not reach the airwaves: '+e.message);return}R.room=r;
 const hi=r.makeAction('hi'),ptt=r.makeAction('ptt');R.ptt=ptt;R.hi=hi;
 hi.onMessage=(d,c)=>{const nw=!R.peers[c.peerId]||R.peers[c.peerId]==='Breaker';R.peers[c.peerId]=String(d&&d.h||'Breaker').slice(0,20);if(nw)log(R.peers[c.peerId]+' is on channel '+ch);list()};
 ptt.onMessage=(d,c)=>{const on=!!(d&&d.on);R.talking[c.peerId]=on;if(on){squelch();log((R.peers[c.peerId]||'Breaker')+' keyed up')}else{beep();setTimeout(()=>noise(.15,.15),200)}const e=R.els[c.peerId];if(e)e.muted=!on;list()};
 r.onPeerJoin=p=>{R.peers[p]=R.peers[p]||'Breaker';hi.send({h:R.handle},{target:p});if(R.mic)r.addStream(R.mic,{target:p});list()};
 r.onPeerLeave=p=>{log((R.peers[p]||'Breaker')+' went 10-7');delete R.peers[p];delete R.talking[p];if(R.els[p]){R.els[p].remove();delete R.els[p]}list()};
 r.onPeerStream=(s,p)=>{let e=R.els[p];if(!e){e=document.createElement('audio');e.autoplay=true;e.muted=true;document.body.appendChild(e);R.els[p]=e}e.srcObject=s;e.play().catch(()=>{});log('Voice link up with '+(R.peers[p]||'Breaker'))};
 if(R.mic)R.mic.getAudioTracks().forEach(t=>t.enabled=false);staticBed(true);log('Tuned to channel '+ch+' as '+R.handle)}
function setTx(on){if(!R.room)return;if(on&&!R.mic){alert('Microphone permission is needed to talk. You can still listen.');return}if(R.tx===on)return;R.tx=on;if(R.mic)R.mic.getAudioTracks().forEach(t=>t.enabled=on);try{R.ptt.send({on})}catch(e){}if(on)squelch();else beep();const k=document.getElementById('rbP');if(k){k.textContent=on?'🔴 ON AIR… release':'🎙️ HOLD TO TALK';k.style.background=on?'#d42a4a':''}list()}
const css=document.createElement('style');css.textContent=`#ap{display:none;position:fixed;z-index:90;left:50%;top:50%;transform:translate(-50%,-50%);width:min(780px,96vw);height:min(86vh,720px);background:linear-gradient(#3a2a1a,#140c06);border:3px solid #c8a060;border-radius:18px;color:#ffe9c7;font:15px/1.4 system-ui,Arial,sans-serif;flex-direction:column;box-shadow:0 10px 50px #000a;overflow:auto;padding:10px 14px;box-sizing:border-box}
#ap h2{margin:2px 0;color:#ffcf6a;text-align:center}#ap input,#ap select{background:#1a0e06;color:#ffcf6a;border:1px solid #c8a060;border-radius:8px;padding:7px;font-size:15px}#ap button{background:#5a3a1a;color:#ffe9c7;border:1px solid #c8a060;border-radius:10px;padding:7px 12px;cursor:pointer;font-weight:bold}
#ap .row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0}#ap .box{background:#0c0703;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}#ap .x{position:absolute;right:10px;top:6px;background:none;border:0;font-size:20px}#ap .lcd{font:bold 40px monospace;color:#ff5a2a;text-shadow:0 0 12px #f40;background:#200;border-radius:8px;padding:4px 14px;display:inline-block}
#rbP{font-size:22px;padding:30px 28px;border-radius:50%!important;user-select:none;touch-action:none;display:block;margin:8px auto}#ap table{width:100%;font-size:13px}#ap td{padding:2px 6px;border-bottom:1px solid #3a2a1a}`;document.head.appendChild(css);
const ap=document.createElement('div');ap.id='ap';document.body.appendChild(ap);
function openApp(){G.state='app';ap.style.display='flex';render()}
function closeApp(){ap.style.display='none';G.state='title'}
function render(){const chs=Array.from({length:40},(_,i)=>`<option ${R.ch==i+1?'selected':''} ${i>=MAXCH?'disabled':''} value="${i+1}">Channel ${i+1}${i+1===9?' (Help)':i+1===19?' (Road chat)':''}${i>=MAXCH?' 🔒':''}</option>`).join('');
 ap.innerHTML=`<button class="x">✕</button><h2>📻 Coffeebreak CB Radio</h2>
 <div class="row"><input id="rbH" maxlength="20" placeholder="Your handle, e.g. Coffee Queen" value="${esc(R.handle)}"><select id="rbC">${chs}</select><button id="rbJ">${R.room?'Change channel':'Tune in'}</button>${R.room?'<button id="rbX">10-7 Off</button>':''}</div>
 <div class="row" style="font-size:13px">Static <input id="stv" type="range" min="0" max="0.12" step="0.005" value="0.03" style="width:120px;padding:0"></div>
 ${R.room?`<div style="text-align:center"><span class="lcd">CH ${String(R.ch).padStart(2,'0')}</span> <span id="rbN"></span></div><button id="rbP">🎙️ HOLD TO TALK</button><div style="text-align:center;font-size:12px">or hold the Space bar · release for the roger beep</div><div id="rbL" class="box"></div>`:'<p style="text-align:center">Pick a handle and a channel, then tune in.'+(DEMO?' Free demo: channels 1–5.':'')+'</p>'}
 <div class="box" id="cbLog">${R.log.map(esc).join('<br>')}</div>
 <div class="box">🆘 <b>Channel 9 is the help channel.</b> This is a fun hobby radio, not an emergency service: in a real emergency call <b>000</b> (Australia), 911 (US) or 112 (EU).</div>
 <details class="box"><summary><b>📖 10-codes &amp; CB slang</b></summary><table>${TEN.map(t=>`<tr><td><b>${t[0]}</b></td><td>${t[1]}</td></tr>`).join('')}</table></details>
 <div style="font-size:12px;text-align:center">💗 Be kind on air. Voice is live device-to-device: nothing is recorded or stored, and anyone on the channel can hear you. Don't share personal details. Some work or school networks block live voice.</div>`;
 ap.querySelector('.x').onclick=closeApp;ap.querySelectorAll('input').forEach(i=>i.onkeydown=e=>e.stopPropagation());
 document.getElementById('stv').oninput=e=>{if(hum)hum.g.gain.value=+e.target.value};
 document.getElementById('rbC').onchange=e=>{if(+e.target.value>MAXCH&&window.demoEnd)demoEnd('The free demo has channels 1–5. The full radio has all 40 channels.')};
 document.getElementById('rbJ').onclick=async()=>{const h=document.getElementById('rbH').value.trim().slice(0,20);if(!h){alert('Pick a handle first');return}const ch=+document.getElementById('rbC').value;if(ch>MAXCH){window.demoEnd&&demoEnd();return}R.handle=h;try{localStorage.setItem('cbHandle',h)}catch(e){}squelch();await join(ch);render()};
 const xb=document.getElementById('rbX');if(xb)xb.onclick=async()=>{await leave();log('10-7, off air');R.ch=null;render()};
 const p=document.getElementById('rbP');if(p){p.onpointerdown=e=>{e.preventDefault();try{p.setPointerCapture(e.pointerId)}catch(_){}setTx(true)};p.onpointerup=p.onpointercancel=()=>setTx(false);list()}}
addEventListener('keydown',e=>{if(e.code==='Space'&&G.state==='app'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();setTx(true)}});addEventListener('keyup',e=>{if(e.code==='Space')setTx(false)});
function faceplate(X,Y,w,h){const g=x.createLinearGradient(0,Y,0,Y+h);g.addColorStop(0,'#5a4a3a');g.addColorStop(1,'#2a1e14');x.fillStyle=g;rr(X,Y,w,h,18);x.fill();x.strokeStyle='#c8a060';x.lineWidth=4;x.stroke();
 for(const sx of [X+14,X+w-14])for(const sy of [Y+14,Y+h-14]){x.fillStyle='#999';x.beginPath();x.arc(sx,sy,5,0,7);x.fill()}
 x.fillStyle='#200';rr(X+30,Y+30,170,80,8);x.fill();x.fillStyle='#ff5a2a';x.shadowColor='#f40';x.shadowBlur=14;x.font='bold 64px monospace';x.textAlign='center';x.fillText(String(R.ch||((t*2|0)%40+1)).padStart(2,'0'),X+115,Y+95);x.shadowBlur=0;
 x.fillStyle='#eee8d0';rr(X+230,Y+30,260,80,8);x.fill();x.strokeStyle='#333';x.lineWidth=2;for(let i=0;i<=10;i++){const a=Math.PI*(1.15+.7*i/10);x.beginPath();x.moveTo(X+360+Math.cos(a)*62,Y+112+Math.sin(a)*62);x.lineTo(X+360+Math.cos(a)*72,Y+112+Math.sin(a)*72);x.stroke()}
 const tk=Object.values(R.talking).some(v=>v)||R.tx;R.sig+=((tk?.8+.2*Math.random():.15*Math.random())-R.sig)*.15;const a=Math.PI*(1.15+.7*R.sig);x.strokeStyle='#c00';x.lineWidth=3;x.beginPath();x.moveTo(X+360,Y+112);x.lineTo(X+360+Math.cos(a)*70,Y+112+Math.sin(a)*70);x.stroke();T('S-METER',X+360,Y+48,12,'#333','center');
 for(const [i,l] of ['VOL','SQ','RF'].entries()){const cx=X+540+i*80,cy=Y+70;x.fillStyle='#1a1a1a';x.beginPath();x.arc(cx,cy,26,0,7);x.fill();x.strokeStyle='#c8a060';x.stroke();x.save();x.translate(cx,cy);x.rotate(Math.sin(t*.3+i)*1.5);x.fillStyle='#fff';x.fillRect(-2,-24,4,12);x.restore();T(l,cx,cy+44,12,'#ffe9c7','center')}
 x.fillStyle=R.tx?'#f22':'#400';x.beginPath();x.arc(X+w-40,Y+40,9,0,7);x.fill();T('TX',X+w-40,Y+66,11,'#ffe9c7','center');x.fillStyle=tk&&!R.tx?'#2f2':'#030';x.beginPath();x.arc(X+w-40,Y+90,9,0,7);x.fill();T('RX',X+w-40,Y+116,11,'#ffe9c7','center')}
function drawTitle(){const g=x.createLinearGradient(0,0,0,600);g.addColorStop(0,'#2a1a10');g.addColorStop(1,'#080402');x.fillStyle=g;x.fillRect(0,0,900,600);
 for(let i=0;i<5;i++){x.strokeStyle='rgba(255,180,80,'+(.25-.04*i)+')';x.lineWidth=2;x.beginPath();x.arc(450,40,30+((t*60+i*40)%200),.2,Math.PI-.2);x.stroke()}
 T('📻 Coffeebreak CB Radio',450,110,42,'#ffcf6a','center');T('Breaker breaker! Pick a handle, grab a channel and talk live.',450,145,18,'#ffe9c7','center','italic ');
 faceplate(80,180,740,150);button('go',330,380,240,60,'🎙️ Tune in',openApp,{fs:22,bg:'#5a3a1a',ac:'#ffcf6a'});
 T(DEMO?'Free demo: channels 1–5':'Full radio: all 40 channels',450,470,15,'#c8a060','center','');T('Live voice between real people · no account · nothing recorded',450,495,14,'#c8a060','center','');ent()}
(function(){const o=document.createElement('canvas');o.width=320;o.height=320;const k=x;x=o.getContext('2d');x.font='200px serif';x.textAlign='center';x.fillText('📻',160,230);x=k;window.HERO_SRC=o.toDataURL()})();
bindInput({});function update(dt){}function draw(){x.clearRect(0,0,900,600);drawTitle()}
window.CBR={R,join,leave,setTx,openApp,render};startLoop();
