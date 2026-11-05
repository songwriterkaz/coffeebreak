(function(){
const $=id=>document.getElementById(id);
const CHOC=[['Dark','#3b1f10',0],['Milk','#7b4a2a',0],['White','#f3e6c8',0],['Gold (caramelised)','#c58a3a',120],['Mocha','#5a3218',200]];
const MOULD=[['Heart','❤',0],['Square','■',0],['Shell','🐚',0],['Dome','●',60],['Star','★',90],['Koala','🐨',180]];
const FILL=[['Salted Caramel','🧂',0],['Hazelnut','🌰',0],['Coffee','☕',0],['Raspberry','🍓',70],['Macadamia','🥜',100],['Wattleseed','🌾',150],['Passionfruit','🟡',190],['Chilli','🌶️',240]];
const TOP=[['Gold Leaf','✨',0],['Sea Salt','🧂',0],['Cocoa Dust','🟤',0],['Nuts','🥜',50],['Drizzle','〰️',80],['Sprinkles','🎉',120]];
const WHO=['A wedding planner','A cafe owner','A grandma','A footy coach','A nurse on night shift','A birthday kid','A florist','A pilot'];
const TEMP={Dark:[31,32],Milk:[29,30],White:[27,28],'Gold (caramelised)':[28,29],'Mocha':[30,31]};
const K='cb_chocolatier_v1';let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({coins:0,lvl:1,made:0,best:0,own:{}},S||{});const own=(t,n,c)=>c==0||S.own[t+n];const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let AC;function snd(f,d,t){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
let O,B,step,temp,heat,tq,iv;
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function avail(L,t){return L.filter(x=>own(t,x[0],x[2]))}
function order(){O={who:rnd(WHO),c:rnd(avail(CHOC,'c'))[0],m:rnd(avail(MOULD,'m'))[0],f:rnd(avail(FILL,'f'))[0],t:rnd(avail(TOP,'t'))[0],n:Math.min(6,2+Math.floor(S.lvl/2))};B={};step=0;tq=0;draw()}
const STEPS=['🍫 Choose chocolate','🌡️ Temper it','🧁 Pick a mould','💧 Fill','✨ Decorate','📦 Box it'];
function choose(t,v){if(step==0&&t=='c'){B.c=v;step=1;startTemper()}else if(step==2&&t=='m'){B.m=v;step=3}else if(step==3&&t=='f'){B.f=v;step=4}else if(step==4&&t=='t'){B.t=v;step=5;finish()}snd(500+step*80,.12,'triangle');draw()}
function startTemper(){temp=45;heat=-1;clearInterval(iv);let t0=Date.now(),inZone=0;iv=setInterval(()=>{temp+=heat*0.22*(1+S.lvl*.05)+(Math.random()-.5)*.15;temp=Math.max(20,Math.min(50,temp));const[a,b]=TEMP[B.c];if(temp>=a-.5&&temp<=b+.5)inZone++;$('tmpN').style.left=((temp-20)/30*100)+'%';$('tmpV').textContent=temp.toFixed(1)+'°C';if(Date.now()-t0>7000){clearInterval(iv);tq=Math.min(100,Math.round(inZone/70*100*1.4));msg(tq>70?'✨ Glossy snap! Temper '+tq+'%':tq>35?'👍 Decent temper '+tq+'%':'😬 Streaky bloom… temper '+tq+'%');step=2;draw()}},50)}
function flip(){heat=-heat;snd(heat>0?400:250,.08,'square');$('tmpBtn').textContent=heat>0?'❄️ Cool (now heating)':'🔥 Heat (now cooling)'}
function finish(){let s=tq*.4;['c','m','f','t'].forEach(k=>{if(B[k]==O[k])s+=15});s=Math.round(s);const c=Math.round(s/4*O.n/2*(1+S.lvl*.1));S.coins+=c;S.made++;S.best=Math.max(S.best,s);if(S.made%3==0)S.lvl++;save();
 if(s>=75)[523,659,784,1047].forEach((f,i)=>setTimeout(()=>snd(f,.25,'triangle'),i*110));else snd(220,.3,'sawtooth');
 msg(`${s>=75?'🏆':'🍫'} ${O.who} gives it ${s}/100! +${c}🪙${S.made%3==0?' ⬆️ Level '+S.lvl:''}`);$('box').classList.add('pop');setTimeout(()=>{$('box').classList.remove('pop');order()},2200)}
function msg(m){$('chMsg').innerHTML=m}
function grid(L,t,sel){return L.map(x=>{const o=own(t,x[0],x[2]);return`<button class="chB${o?'':' lock'}${sel==x[0]?' on':''}" data-t="${t}" data-v="${x[0]}" ${t=='c'?`style="--sw:${x[1]}"`:''}>${t=='c'?'<i></i>':x[1]}<b>${x[0]}</b>${o?'':`<small>🔒 ${x[2]}🪙</small>`}</button>`}).join('')}
function draw(){
 $('chHud').innerHTML=`Level ${S.lvl} • 🪙 ${S.coins} • 🍫 ${S.made} made • 🏆 best ${S.best}`;
 $('chOrd').innerHTML=`<b>${O.who}</b> orders ${O.n} × <b>${O.c}</b> ${O.m.toLowerCase()}s filled with <b>${O.f}</b>, topped with <b>${O.t}</b>`;
 $('chSteps').innerHTML=STEPS.map((s,i)=>`<span class="${i==step?'on':i<step?'done':''}">${s}</span>`).join('');
 const cc=B.c?CHOC.find(x=>x[0]==B.c)[1]:'#ddd',mm=B.m?MOULD.find(x=>x[0]==B.m)[1]:'?';
 $('box').innerHTML=Array.from({length:O.n},()=>`<div class="pc" style="color:${cc}">${mm}<small>${B.t?TOP.find(x=>x[0]==B.t)[1]:''}</small></div>`).join('');
 $('tmp').hidden=step!=1;if(step==1){const[a,b]=TEMP[B.c];$('tmpZ').style.left=((a-.5-20)/30*100)+'%';$('tmpZ').style.width=((b-a+1)/30*100)+'%'}
 $('pick').innerHTML=step==0?grid(CHOC,'c',B.c):step==2?grid(MOULD,'m'):step==3?grid(FILL,'f'):step==4?grid(TOP,'t'):'';
 document.querySelectorAll('.chB').forEach(b=>b.onclick=()=>{const t=b.dataset.t,v=b.dataset.v,L={c:CHOC,m:MOULD,f:FILL,t:TOP}[t],it=L.find(x=>x[0]==v);if(!own(t,v,it[2])){if(S.coins<it[2])return msg('Need '+it[2]+' coins to unlock '+v);S.coins-=it[2];S.own[t+v]=1;save();snd(900,.3,'triangle');return draw()}choose(t,v)});
 $('shopU').innerHTML='Unlock new chocolates, moulds, fillings and toppings by tapping 🔒 items while you make orders.'}
$('tmpBtn').onclick=flip;$('chSkip').onclick=()=>{clearInterval(iv);msg('');order()};
order();})();
