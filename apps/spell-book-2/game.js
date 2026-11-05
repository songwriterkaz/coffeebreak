const $=id=>document.getElementById(id);
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
// ---- Coffeebreak Virtual Spell Book ----
const S=$('stage'),DEMO=!!window.DEMO,esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));window.HERO_SRC='assets/hero.png';
const CAT={love:['💖','Love'],money:['💰','Money'],luck:['🍀','Luck'],protection:['🛡️','Protection'],creativity:['🎨','Creativity'],calm:['🌙','Calm']};
const MOONS=['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'];
const SIGILS=['star','heart','moon','sun','rose','skull','spiral','eye'];
const BUILT=[
 {t:'Sweet Self-Love Spell',c:'love',m:'Full Moon',i:['1 pink candle','a handful of rose petals','a spoon of honey','a small mirror'],ch:'Heart of honey, heart of rose, love for me is how it grows.',st:['Light the pink candle.','Sprinkle rose petals around the mirror.','Look into the mirror and say three things you love about yourself.','Taste a little honey to seal the sweetness.'],s:'heart'},
 {t:'Coffee Cup Money Magnet',c:'money',m:'Waxing Crescent',i:['a fresh cup of coffee','3 shiny coins','a pinch of cinnamon','a green ribbon'],ch:'Brew and stir, the coins will flow, as this cup warms, my riches grow.',st:['Stack the three coins beside your cup.','Sprinkle cinnamon on top of the coffee.','Stir clockwise seven times while saying the chant.','Tie the ribbon around your wallet.'],s:'sun'},
 {t:'Lucky Star Wish',c:'luck',m:'Waxing Gibbous',i:['a silver star sticker','a clover or green leaf','a white candle'],ch:'Star so bright, luck tonight, every door is opening right.',st:['Light the white candle near a window.','Hold the leaf and make your wish.','Stick the star on something you carry every day.'],s:'star'},
 {t:'Cosy Protection Circle',c:'protection',m:'Full Moon',i:['a pinch of salt','a sprig of rosemary','a black ribbon','a blanket'],ch:'Circle round and safe and sound, only love may enter this ground.',st:['Wrap yourself in your blanket.','Sprinkle salt in a circle around you.','Hold the rosemary and picture a glowing shield.','Tie the ribbon on your door handle.'],s:'eye'},
 {t:'Muse Awakening Spell',c:'creativity',m:'First Quarter',i:['a purple candle','your favourite pen','a sprinkle of glitter','a song you love'],ch:'Muse of music, muse of art, pour your magic through my heart.',st:['Play your favourite song.','Light the purple candle.','Sprinkle a little glitter on a blank page.','Write or draw the first thing that comes to you.'],s:'spiral'},
 {t:'Moonlight Calm Bath',c:'calm',m:'Waning Gibbous',i:['lavender','chamomile tea','a blue candle','a moonlit window'],ch:'Moon so soft and silver-bright, wash my worries out tonight.',st:['Brew a cup of chamomile tea.','Light the blue candle by the window.','Breathe in for 4, hold for 4, out for 8, three times.','Sip slowly and let the moonlight hug you.'],s:'moon'},
 {t:'Rose Friendship Charm',c:'love',m:'Waxing Crescent',i:['a red rose','a pink ribbon','a photo of a friend'],ch:'Rose of red and ribbon pink, our friendship stronger than you think.',st:['Tie the ribbon around the rose stem.','Place it beside the photo.','Send your friend a kind message today.'],s:'rose'},
 {t:'Abundance Jar',c:'money',m:'New Moon',i:['a small jar','rice','a bay leaf','a gold coin','a written wish'],ch:'Jar of plenty, fill and flow, the more I give, the more I grow.',st:['Write your money wish on paper.','Fill the jar with rice, then add the bay leaf and coin.','Place the wish on top and close the lid.','Shake it gently every morning.'],s:'sun'},
 {t:'Black Cat Lucky Charm',c:'luck',m:'Full Moon',i:['a black button','a sprig of mint','a little pouch'],ch:'Whiskers, paws and lucky tail, with this charm I will not fail.',st:['Put the button and mint in the pouch.','Hold it and purr the chant three times (purring is optional!).','Keep it in your bag.'],s:'skull'},
 {t:'Sweet Dreams Shield',c:'protection',m:'Waning Crescent',i:['a dreamcatcher or feather','lavender','a glass of water'],ch:'Feather light and dreams so sweet, only good dreams I will meet.',st:['Hang the feather by your bed.','Sprinkle lavender on your pillow.','Place the glass of water on the windowsill.'],s:'moon'},
 {t:'Songwriter Spark',c:'creativity',m:'Full Moon',i:['a cup of hot cocoa','a notebook','a candle','a guitar or any instrument'],ch:'Notes and words, come out to play, a brand new song is born today.',st:['Light the candle and sip your cocoa.','Hum the first tune that comes into your head.','Write down three words that feel magical.','Turn them into your first line.'],s:'star'},
 {t:'Peaceful Tea Ritual',c:'calm',m:'New Moon',i:['your favourite tea','a sprig of mint','a quiet corner'],ch:'Steam and leaf and quiet light, all is well and all is right.',st:['Brew your tea slowly.','Add the mint and breathe the steam.','Name three things you are grateful for.'],s:'heart'}];
const MAXC=DEMO?1:999,BI=DEMO?BUILT.slice(0,3):BUILT;
let D=JSON.parse(localStorage.spellSave||'null')||{custom:[],cast:0};let page=-1;const G={state:'book',score:0,level:D.cast};window.G=G;window.D=D;
const save=()=>{localStorage.spellSave=JSON.stringify(D);G.level=D.cast};
const all=()=>BI.map(s=>({...s,b:1})).concat(D.custom.map((s,k)=>({...s,k})));
function moonNow(d=new Date()){const syn=29.530588853,age=((d.getTime()/864e5-10962.76)%syn+syn)%syn;return{age,frac:age/syn,name:MOONS[Math.floor((age/syn)*8+.5)%8],ill:Math.round((1-Math.cos(2*Math.PI*age/syn))/2*100)}}
function moonSVG(f,sz=60){const r=sz/2-2,k=Math.cos(2*Math.PI*f)*r,wax=f<.5;// lit part
 const d=`M${sz/2},2 A${r},${r} 0 0 ${wax?1:0} ${sz/2},${sz-2} A${Math.abs(k)},${r} 0 0 ${(wax?k>0:k<0)?0:1} ${sz/2},2`;return `<svg width="${sz}" height="${sz}"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="#2a2a40"/><path d="${d}" fill="#fff4c8"/></svg>`}
function sigil(s,sz=90){const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d'),m=sz/2;x.strokeStyle='#8a3a1a';x.fillStyle='#8a3a1a';x.lineWidth=3;x.beginPath();x.arc(m,m,m-4,0,7);x.stroke();x.beginPath();x.arc(m,m,m-10,0,7);x.lineWidth=1;x.stroke();x.lineWidth=3;x.beginPath();
 if(s==='star'){for(let i=0;i<=10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?m*.25:m*.6;x.lineTo(m+Math.cos(a)*r,m+Math.sin(a)*r)}x.stroke()}
 if(s==='heart'){x.moveTo(m,m+m*.45);x.bezierCurveTo(m-m*.9,m-m*.1,m-m*.35,m-m*.7,m,m-m*.25);x.bezierCurveTo(m+m*.35,m-m*.7,m+m*.9,m-m*.1,m,m+m*.45);x.stroke()}
 if(s==='moon'){x.arc(m,m,m*.5,.6,5.7);x.arc(m+m*.22,m,m*.38,5.4,.9,true);x.stroke()}
 if(s==='sun'){x.arc(m,m,m*.28,0,7);x.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;x.beginPath();x.moveTo(m+Math.cos(a)*m*.38,m+Math.sin(a)*m*.38);x.lineTo(m+Math.cos(a)*m*.62,m+Math.sin(a)*m*.62);x.stroke()}}
 if(s==='rose'){for(let i=0;i<3;i++){x.beginPath();x.arc(m,m-m*.1,m*(.15+i*.14),i,i+5);x.stroke()}x.beginPath();x.moveTo(m,m+m*.3);x.lineTo(m,m+m*.65);x.stroke()}
 if(s==='skull'){x.arc(m,m-m*.08,m*.42,Math.PI*.8,Math.PI*2.2);x.lineTo(m+m*.25,m+m*.5);x.lineTo(m-m*.25,m+m*.5);x.closePath();x.stroke();x.beginPath();x.arc(m-m*.17,m-m*.08,m*.1,0,7);x.arc(m+m*.17,m-m*.08,m*.1,0,7);x.fill()}
 if(s==='spiral'){for(let a=0;a<18;a+=.1){const r=a*m*.035;x.lineTo(m+Math.cos(a)*r,m+Math.sin(a)*r)}x.stroke()}
 if(s==='eye'){x.moveTo(m-m*.6,m);x.quadraticCurveTo(m,m-m*.6,m+m*.6,m);x.quadraticCurveTo(m,m+m*.6,m-m*.6,m);x.stroke();x.beginPath();x.arc(m,m,m*.18,0,7);x.fill()}
 [0,1,2,3].forEach(i=>{const a=i*Math.PI/2+Math.PI/4;x.beginPath();x.arc(m+Math.cos(a)*(m-7),m+Math.sin(a)*(m-7),2.5,0,7);x.fill()});return c}
function spellPage(sp){return `<h2>${CAT[sp.c][0]} ${esc(sp.t)}</h2><div style="display:flex;gap:10px;align-items:center"><span id="sgl"></span><div><b>Category:</b> ${CAT[sp.c][1]}<br><b>Moon phase:</b> 🌙 ${sp.m}<br>${sp.b?'<i>From the ancient Coffeebreak grimoire</i>':'<i>✍️ Written by you</i>'}</div></div>
 <h4>🌿 Ingredients</h4><ul>${sp.i.map(z=>'<li>'+esc(z)+'</li>').join('')}</ul>`}
function spellRight(sp){return `<h4>📜 Steps</h4><ol>${sp.st.map(z=>'<li>'+esc(z)+'</li>').join('')}</ol><h4>🗣️ Chant</h4><div class="chant">${esc(sp.ch)}</div>
 <p style="text-align:center"><button class="big" id="cast">🕯️ Cast this spell</button>${sp.b?'':` <button id="ed">✏️ Edit</button> <button id="dl">🗑️ Delete</button>`}</p>`}
function render(flip){const L=all(),mn=moonNow();let left,right;
 if(page===-1){left=`<div class="cover" style="background:radial-gradient(#6a2a1a,#2a0a06);margin:-16px -22px;height:calc(100% + 32px)"><div>📜</div>Coffeebreak<br>Spell Book<div style="font:16px Georgia;margin-top:10px">✦ fun, positive spells for all ✦</div></div>`;
  right=`<h2>🌙 Tonight's moon</h2><div style="display:flex;gap:12px;align-items:center">${moonSVG(mn.frac,80)}<div><b>${mn.name}</b><br>${mn.ill}% illuminated<br>Moon age ${mn.age.toFixed(1)} days</div></div>
  <h4>📑 Page index</h4><div class="ix">${L.map((s,i)=>`<p style="margin:3px 0">${CAT[s.c][0]} <a data-go="${i}">${esc(s.t)}</a> <small>${s.b?'':'(yours)'}${s.m===mn.name?' 🌟 perfect tonight!':''}</small></p>`).join('')}</div>
  <p><button id="add">✍️ Write a new spell (${D.custom.length}/${DEMO?MAXC:'∞'})</button></p>${DEMO?'<p style="font-size:12px">Demo: 3 spells + 1 custom spell. The full book has 12 spells and unlimited custom pages.</p>':''}<p style="font-size:11px;opacity:.7">For fun and entertainment only.</p>`}
 else{const sp=L[page];left=spellPage(sp);right=spellRight(sp)}
 S.innerHTML=`<div class="scr"><div class="tb"><button id="pv">◀ Turn back</button><button id="ix">📑 Index</button><button id="nx">Turn page ▶</button><button id="add2">✍️ New spell</button><span style="align-self:center">${moonSVG(mn.frac,26)} ${mn.name} · ✨ ${D.cast} spells cast</span></div>
 <div class="book ${flip?'flip':''}"><div class="pages"><div class="pg">${left}</div><div class="pg">${right}</div></div></div><div style="text-align:center;font-size:12px;opacity:.7">${page<0?'Cover':'Page '+(page+1)+' of '+L.length}</div></div>`;
 if(page>=0){$('sgl').appendChild(sigil(L[page].s));$('cast').onclick=()=>ritual(L[page]);if(!L[page].b){$('ed').onclick=()=>editor(L[page].k);$('dl').onclick=()=>{if(confirm('Delete this spell page?')){D.custom.splice(L[page].k,1);save();page=-1;render(1)}}}}
 S.querySelectorAll('[data-go]').forEach(a=>a.onclick=()=>{page=+a.dataset.go;render(1)});
 $('pv').onclick=()=>{if(page>-1){page--;render(1)}};$('nx').onclick=()=>{startMusic();if(page<L.length-1){page++;render(1)}};$('ix').onclick=()=>{page=-1;render(1)};
 const ad=()=>{startMusic();if(D.custom.length>=MAXC)return demoEnd('Your free demo has 1 custom spell slot. Unlimited custom spell pages and all 12 built-in spells are in the full game.');editor(null)};$('add2').onclick=ad;if($('add'))$('add').onclick=ad}
function editor(k){const sp=k!=null?D.custom[k]:{t:'',c:'love',m:moonNow().name,i:[],ch:'',st:[],s:'star'};let sg=sp.s;
 const o=document.createElement('div');o.className='ov';o.id='ov';o.innerHTML=`<h2>✍️ ${k!=null?'Edit':'Write'} your spell</h2>
 <p>Title<br><input id="et" maxlength="50" value="${esc(sp.t)}"></p><p>Category<br><select id="ec">${Object.keys(CAT).map(c=>`<option value="${c}" ${c===sp.c?'selected':''}>${CAT[c][0]} ${CAT[c][1]}</option>`).join('')}</select></p>
 <p>Moon phase<br><select id="em">${MOONS.map(m=>`<option ${m===sp.m?'selected':''}>${m}</option>`).join('')}</select></p>
 <p>Ingredients (one per line)<br><textarea id="ei" rows="3">${esc(sp.i.join('\n'))}</textarea></p><p>Steps (one per line)<br><textarea id="es" rows="4">${esc(sp.st.join('\n'))}</textarea></p>
 <p>Chant<br><textarea id="eh" rows="2">${esc(sp.ch)}</textarea></p><p>Sigil / decoration<br><span id="sgs"></span></p><p><button class="big" id="sv">💾 Save to my book</button> <button id="cx">Cancel</button></p>`;S.appendChild(o);
 SIGILS.forEach(s=>{const b=document.createElement('span');b.className='sg'+(s===sg?' on':'');b.dataset.s=s;b.appendChild(sigil(s,56));b.onclick=()=>{sg=s;o.querySelectorAll('.sg').forEach(e=>e.classList.toggle('on',e.dataset.s===s))};$('sgs').appendChild(b)});
 $('cx').onclick=()=>o.remove();$('sv').onclick=()=>{const t=$('et').value.trim();if(!t){alert('Give your spell a title ✨');return}const lines=id=>$(id).value.split('\n').map(z=>z.trim()).filter(Boolean);
  const n={t,c:$('ec').value,m:$('em').value,i:lines('ei'),st:lines('es'),ch:$('eh').value.trim()||'By moon and star, so mote it be.',s:sg};if(!n.i.length)n.i=['a sprinkle of imagination'];if(!n.st.length)n.st=['Close your eyes and picture it.'];
  if(k!=null)D.custom[k]=n;else D.custom.push(n);save();o.remove();page=BI.length+(k!=null?k:D.custom.length-1);render(1)}}
// ---- ritual ----
let R=null;
function ritual(sp){startMusic();const o=document.createElement('div');o.className='ov';o.id='ov';o.style.textAlign='center';o.innerHTML=`<h2>🕯️ Casting: ${esc(sp.t)}</h2><p id="rh">Step 1: tap each candle to light it.</p><canvas id="rc" width="760" height="380" style="max-width:100%;touch-action:none;border-radius:12px"></canvas><p id="rch" class="chant" style="color:#ffd78a;display:none">${esc(sp.ch)}</p><p><button id="rx">Close</button></p>`;S.appendChild(o);
 const c=$('rc'),x=c.getContext('2d');R={sp,step:0,lit:[0,0,0],herbs:0,stir:0,lastA:null,p:[],done:false,c,x,t:0};window.R=R;$('rx').onclick=()=>{R=null;o.remove()};
 const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)*760/r.width,(e.clientY-r.top)*380/r.height]};let down=false;
 c.onpointerdown=e=>{down=true;const[X,Y]=pos(e);rClick(X,Y)};c.onpointermove=e=>{if(down){const[X,Y]=pos(e);rMove(X,Y)}};c.onpointerup=()=>{down=false;R&&(R.lastA=null)};requestAnimationFrame(rLoop)}
const CAND=[[120,200],[640,200],[380,90]];
function spark(X,Y,n=20,col){for(let i=0;i<n;i++)R.p.push({x:X,y:Y,vx:(Math.random()-.5)*200,vy:(Math.random()-.9)*200,l:1+Math.random(),c:col||['#ffd75a','#ff9ac0','#c0a0ff'][i%3]})}
function rClick(X,Y){if(!R)return;if(R.step===0){CAND.forEach((p,i)=>{if(!R.lit[i]&&Math.hypot(X-p[0],Y-p[1]+30)<45){R.lit[i]=1;spark(p[0],p[1]-50,15,'#ffb040')}});if(R.lit.every(v=>v)){R.step=1;$('rh').textContent='Step 2: tap the herb jar to sprinkle herbs into the cauldron (5 times).'}}
 else if(R.step===1&&X>560&&Y>250){R.herbs++;for(let i=0;i<14;i++)R.p.push({x:600,y:280,vx:-160-Math.random()*80,vy:-120-Math.random()*60,l:1.4,c:'#6ac04a',herb:1});if(R.herbs>=5){R.step=2;$('rh').textContent='Step 3: stir the cauldron! Drag in circles around it.'}}}
function rMove(X,Y){if(!R||R.step!==2)return;const a=Math.atan2(Y-270,X-380);if(Math.hypot(X-380,Y-270)>140)return;if(R.lastA!=null){let d=a-R.lastA;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;R.stir+=Math.abs(d)}R.lastA=a;if(Math.random()<.3)spark(380,250,2);
 if(R.stir>Math.PI*2*3)finishCast()}
function finishCast(){R.step=3;R.done=true;$('rh').textContent='✨ The spell is cast! Say the chant out loud:';$('rch').style.display='block';for(let i=0;i<8;i++)setTimeout(()=>R&&spark(100+Math.random()*560,80+Math.random()*200,30),i*150);D.cast++;G.score=D.cast;save()}
function rLoop(){if(!R)return;const x=R.x;R.t+=1/60;x.fillStyle='#120610';x.fillRect(0,0,760,380);const gl=x.createRadialGradient(380,250,10,380,250,300);gl.addColorStop(0,R.step>=2?'rgba(120,255,140,.25)':'rgba(255,170,80,.12)');gl.addColorStop(1,'transparent');x.fillStyle=gl;x.fillRect(0,0,760,380);
 // cauldron
 const cg=x.createRadialGradient(380,280,20,380,280,200);cg.addColorStop(0,R.step>=2?'rgba(140,255,160,.35)':'rgba(255,180,90,.28)');cg.addColorStop(1,'transparent');x.fillStyle=cg;x.fillRect(150,120,460,260);x.fillStyle='#4a3a4a';[[300,355],[460,355]].forEach(([a,b])=>{x.fillRect(a-8,b-10,16,24)});const bd=x.createLinearGradient(260,240,500,240);bd.addColorStop(0,'#2a2230');bd.addColorStop(.35,'#6a5a72');bd.addColorStop(.6,'#3a3040');bd.addColorStop(1,'#1e1824');x.fillStyle=bd;x.beginPath();x.moveTo(260,240);x.lineTo(500,240);x.bezierCurveTo(520,330,450,362,380,362);x.bezierCurveTo(310,362,240,330,260,240);x.fill();x.strokeStyle='#d8a830';x.lineWidth=2.5;x.stroke();x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=4;x.beginPath();x.moveTo(300,262);x.quadraticCurveTo(300,320,340,345);x.stroke();x.fillStyle=R.herbs?`hsl(${120+R.stir*8},60%,${30+R.herbs*4}%)`:'#3a2a4a';x.beginPath();x.ellipse(380,242,112,20,0,0,7);x.fill();
 x.beginPath();x.ellipse(380,240,122,24,0,0,7);x.lineWidth=9;x.strokeStyle='#5a4a62';x.stroke();x.lineWidth=2;x.strokeStyle='#ffd78a';x.beginPath();x.ellipse(380,236,124,24,0,Math.PI*1.05,Math.PI*1.95);x.stroke();x.strokeStyle='#d8a830';x.beginPath();x.ellipse(380,240,127,27,0,0,7);x.stroke();
 for(let i=0;i<5;i++){const bx=330+((R.t*30+i*40)%100),by=240+Math.sin(R.t*3+i)*4;x.fillStyle='rgba(200,255,200,.5)';x.beginPath();x.arc(bx,by,4+Math.sin(R.t*4+i)*2,0,7);x.fill()}
 if(R.step===2){x.save();x.translate(380,245);x.rotate(R.stir);x.fillStyle='#8a5a2a';x.fillRect(-4,-90,8,100);x.restore()}
 // candles
 CAND.forEach((p,i)=>{x.fillStyle=['#ff9ac0','#c0a0ff','#fff3c8'][i];x.fillRect(p[0]-14,p[1]-30,28,70);x.fillStyle='#222';x.fillRect(p[0]-1,p[1]-38,2,8);if(R.lit[i]){const f=Math.sin(R.t*12+i)*2;x.fillStyle='rgba(255,180,60,.3)';x.beginPath();x.arc(p[0],p[1]-48,26,0,7);x.fill();x.fillStyle='#ffcf4a';x.beginPath();x.ellipse(p[0]+f*.5,p[1]-48,6,13+f,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(p[0],p[1]-44,2.5,5,0,0,7);x.fill()}else if(R.step===0){x.fillStyle='#ffd78a';x.font='13px Georgia';x.textAlign='center';x.fillText('tap',p[0],p[1]+56)}});
 // herb jar
 x.fillStyle='rgba(180,220,255,.5)';x.fillRect(570,270,60,80);x.fillStyle='#6ac04a';x.fillRect(574,300-R.herbs*0,52,46-R.herbs*6);x.fillStyle='#8a5a2a';x.fillRect(566,262,68,12);x.fillStyle='#ffe9c7';x.font='12px Georgia';x.textAlign='center';x.fillText('herbs',600,366);
 R.p.forEach(s=>{s.x+=s.vx/60;s.y+=s.vy/60;s.vy+=(s.herb?260:80)/60;s.l-=1/60;x.fillStyle=s.c;x.globalAlpha=Math.max(0,Math.min(1,s.l));x.beginPath();if(s.herb)x.ellipse(s.x,s.y,3,1.5,s.l*5,0,7);else{const r=3;x.moveTo(s.x,s.y-r*2);x.lineTo(s.x+r*.6,s.y);x.lineTo(s.x,s.y+r*2);x.lineTo(s.x-r*.6,s.y)}x.fill();x.globalAlpha=1});R.p=R.p.filter(s=>s.l>0);
 if(R.done){x.fillStyle='#ffd75a';x.font='bold 30px Georgia';x.textAlign='center';x.fillText('✨ Spell cast! ✨',380,40)}requestAnimationFrame(rLoop)}
render();
