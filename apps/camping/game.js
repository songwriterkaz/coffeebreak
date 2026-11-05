(function(){
const $=id=>document.getElementById(id),cv=$('cg'),x=cv.getContext('2d');
const SITES=[['Bush Creek','#5d7a3a','#8fb3d9',0,'Gentle bush camp by a creek'],['Beach Dunes','#d9c48a','#7fc6e0',150,'Windy, great fishing'],['Alpine Lake','#4f6b55','#a9c6e8',350,'Cold nights, huge stars'],['Red Centre','#b5562d','#e8b06a',600,'Hot days, freezing nights, best stargazing']];
const GEAR=[['tent','⛺ Better Tent','Rain can’t touch you',80],['bag','🛌 -5°C Sleeping Bag','Stay warm overnight',100],['rod','🎣 Pro Rod','Bigger catches',90],['perc','☕ Camp Percolator','Coffee gives double energy',70],['lamp','🔦 Lumos Lantern','Safer nights, +morale',60],['scope','🔭 Telescope','More star points',120]];
const STARS=[['The Billy',[[0,0],[1,0],[1,1],[0,1],[.5,-.6]]],['The Swag',[[0,0],[2,0],[2,.6],[0,.6]]],['The Kookaburra',[[0,0],[.7,-.5],[1.4,0],[2,.3],[1.4,.6]]],['The Coffee Pot',[[0,1],[0,0],[.6,-.4],[1.2,0],[1.2,1],[1.7,.3]]],['The Gum Tree',[[1,1.4],[1,.5],[.3,0],[1,-.4],[1.7,0]]]];
const K='cb_camping_v1';let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({pts:0,unl:[0],site:0,gear:{},best:0,stars:[],fish:0},S||{});const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let AC;function snd(f,d,t){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
let C;function newTrip(){C={day:1,hour:8,warm:80,energy:80,food:70,morale:70,wood:0,fish:0,tent:false,fire:0,weather:'Sunny',log:[],fishing:null,star:null,over:false};log('🚙 You arrive at '+SITES[S.site][0]+'. Pitch your tent before dark!');ui()}
const night=()=>C.hour>=19||C.hour<6;
function log(m){C.log.unshift(m);C.log=C.log.slice(0,8)}
function clamp(){['warm','energy','food','morale'].forEach(k=>C[k]=Math.max(0,Math.min(100,C[k])))}
function pass(h){for(let i=0;i<h;i++){C.hour++;if(C.hour>=24){C.hour=0;C.day++;S.pts+=15;log('🌅 Day '+C.day+' – +15 camp points');weather()}
 const cold=(S.site>=2?2:1)*(night()?1.6:.5);C.warm-=cold-(C.fire>0?2.2:0)-(C.tent&&night()?.5:0);C.food-=1.3;C.energy-=night()?1.4:.8;if(C.fire>0)C.fire--;
 if(C.weather=='Rain'){if(!C.tent||!S.gear.tent&&Math.random()<.15){C.morale-=3;C.warm-=1.5}if(C.fire>0&&Math.random()<.3){C.fire=0;log('🌧️ Rain put the fire out!')}}
 if(C.weather=='Windy'&&C.tent&&!S.gear.tent&&Math.random()<.06){C.tent=false;log('💨 Wind flattened your tent!')}}
 clamp();if(C.warm<=0||C.food<=0||C.energy<=0){C.over=true;S.best=Math.max(S.best,C.day);save();log(`🚑 Trip over on day ${C.day}. Best: ${S.best} days.`)}save()}
function weather(){const w=S.site==1?['Sunny','Windy','Windy','Rain']:S.site==3?['Sunny','Sunny','Hot','Windy']:['Sunny','Cloudy','Rain','Windy'];C.weather=w[Math.floor(Math.random()*w.length)];log('🌦️ Weather: '+C.weather)}
const A={
 pitch(){if(C.tent)return log('Tent is already up.');C.tent=true;C.energy-=8;pass(1);snd(300,.2);log('⛺ Tent pitched! Pegs in, fly on.')},
 wood(){C.wood+=3;C.energy-=7;pass(1);snd(200,.1,'square');log('🪵 Gathered 3 firewood ('+C.wood+')')},
 fire(){if(C.wood<2)return log('Need 2 firewood.');if(C.weather=='Rain'&&Math.random()<.5){C.wood-=1;pass(1);return log('🌧️ Too wet – the fire fizzled.')}C.wood-=2;C.fire+=5;C.morale+=6;pass(1);[200,260,330].forEach((f,i)=>setTimeout(()=>snd(f,.2,'sawtooth'),i*60));log('🔥 Campfire roaring!')},
 coffee(){if(C.fire<=0)return log('Light the fire to boil the billy.');const e=S.gear.perc?30:15;C.energy+=e;C.morale+=5;C.warm+=4;pass(1);[523,659,784].forEach((f,i)=>setTimeout(()=>snd(f,.2,'triangle'),i*90));S.pts+=3;log('☕ Campfire coffee! +'+e+' energy')},
 fish(){if(night())return log('Fish are asleep – try in the day.');C.fishing={p:0,d:1,t:Date.now()};$('mini').hidden=false;$('miniT').textContent='🎣 Tap REEL when the float is in the gold zone!';$('miniB').textContent='REEL!';$('miniB').onclick=reel},
 cook(){if(!C.fish)return log('No fish to cook.');if(C.fire<=0)return log('Need a fire.');C.fish--;C.food+=30;C.morale+=4;pass(1);log('🐟 Grilled fish on the coals. Yum!')},
 snack(){C.food+=12;C.morale-=2;pass(1);log('🥫 Tin of beans. It’ll do.')},
 stars(){if(!night())return log('Wait for dark to stargaze.');if(C.weather=='Rain'||C.weather=='Cloudy')return log('☁️ Too cloudy tonight.');const s=STARS[Math.floor(Math.random()*STARS.length)];C.star={s,hit:0,pts:s[1].map((p,i)=>({x:250+p[0]*110+Math.random()*10,y:110+p[1]*80,on:false,i}))};log('🌌 Tap the stars of '+s[0]+' in any order!');draw()},
 sleep(){if(!C.tent)log('😬 Sleeping without a tent…');const h=night()?8:3;C.energy+=h*(C.tent?7:3);C.warm+=S.gear.bag?10:(C.tent?0:-15);C.morale+=S.gear.lamp?4:0;pass(h);log('😴 Slept '+h+' hours.')}
};
function reel(){const f=C.fishing;$('mini').hidden=true;C.fishing=null;const good=f.p>.62&&f.p<.82;if(good){const big=S.gear.rod&&Math.random()<.5;const n=big?2:1;C.fish+=n;S.fish+=n;S.pts+=big?12:6;[700,900].forEach((q,i)=>setTimeout(()=>snd(q,.15,'triangle'),i*80));log(big?'🐠 Huge flathead! +2 fish':'🐟 Caught a bream!')}else{snd(150,.3,'sawtooth');log('💦 It got away…')}C.energy-=6;pass(2);ui()}
cv.addEventListener('click',e=>{if(!C||!C.star)return;const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)*cv.width/r.width,my=(e.clientY-r.top)*cv.height/r.height;const p=C.star.pts.find(p=>!p.on&&Math.hypot(p.x-mx,p.y-my)<28);if(!p)return;p.on=true;snd(900+C.star.hit*120,.15,'triangle');C.star.hit++;if(C.star.hit==C.star.pts.length){const nm=C.star.s[0];const gain=S.gear.scope?25:12;S.pts+=gain;C.morale+=12;if(!S.stars.includes(nm))S.stars.push(nm);log('✨ You found '+nm+'! +'+gain+' points');C.star=null;pass(1);ui()}draw()});
function draw(){const st=SITES[S.site],W=cv.width,H=cv.height,n=night();
 x.fillStyle=n?'#0d1530':C.weather=='Rain'||C.weather=='Cloudy'?'#8a96a3':st[2];x.fillRect(0,0,W,H);
 if(n){for(let i=0;i<90;i++){x.fillStyle='#fff8';x.fillRect((i*137)%W,(i*71)%(H*.6),2,2)}}else{x.fillStyle=C.weather=='Hot'?'#ff9a2a':'#ffd34d';x.beginPath();x.arc(W-90,70,34,0,7);x.fill()}
 x.fillStyle=n?'#1d2a1a':st[1];x.beginPath();x.moveTo(0,H*.62);for(let i=0;i<=W;i+=40)x.lineTo(i,H*.6-Math.sin(i/90+S.site)*25);x.lineTo(W,H);x.lineTo(0,H);x.fill();
 if(S.site!=3){x.fillStyle=n?'#18304a':'#3f7fb0';x.beginPath();x.ellipse(W*.78,H*.86,170,30,0,0,7);x.fill()}
 for(let t=0;t<4;t++){const tx=40+t*55+(t%2)*20,ty=H*.6;x.fillStyle='#4a3020';x.fillRect(tx,ty-60,8,60);x.fillStyle=n?'#203820':'#3f6a2a';x.beginPath();x.arc(tx+4,ty-70,26,0,7);x.fill()}
 if(C.tent){x.fillStyle=S.gear.tent?'#b8862f':'#c9a35a';x.beginPath();x.moveTo(300,H*.82);x.lineTo(370,H*.6);x.lineTo(440,H*.82);x.fill();x.fillStyle='#3b2618';x.beginPath();x.moveTo(360,H*.82);x.lineTo(370,H*.68);x.lineTo(380,H*.82);x.fill()}
 x.fillStyle='#5a3a22';x.fillRect(200,H*.88,50,8);if(C.fire>0){const fl=Date.now()/120;['#ff5a1f','#ffb020','#ffe070'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.ellipse(225,H*.86-i*6,16-i*4+Math.sin(fl+i)*2,22-i*5,0,0,7);x.fill()})}
 if(C.weather=='Rain'){x.strokeStyle='#cfe3ff88';for(let i=0;i<60;i++){const rx=(i*53+Date.now()/4)%W,ry=(i*97+Date.now()/2)%H;x.beginPath();x.moveTo(rx,ry);x.lineTo(rx-4,ry+12);x.stroke()}}
 if(C.star){x.strokeStyle='#e8c766';x.lineWidth=2;const on=C.star.pts.filter(p=>p.on);x.beginPath();on.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();C.star.pts.forEach(p=>{x.fillStyle=p.on?'#e8c766':'#fff';x.beginPath();x.arc(p.x,p.y,p.on?8:6+Math.sin(Date.now()/200+p.i)*2,0,7);x.fill()})}
 if(C.fishing){const f=C.fishing;f.p+=f.d*.018*(S.site==1?1.3:1);if(f.p>1||f.p<0)f.d*=-1;x.fillStyle='#0006';x.fillRect(150,H-40,400,18);x.fillStyle='#e8c766';x.fillRect(150+400*.62,H-40,400*.2,18);x.fillStyle='#e33';x.beginPath();x.arc(150+400*f.p,H-31,9,0,7);x.fill()}
 x.fillStyle='#fff';x.font='bold 18px system-ui';x.fillText(`${st[0]} • Day ${C.day} • ${String(C.hour).padStart(2,'0')}:00 • ${C.weather}`,14,26)}
function loop(){if(C)draw();requestAnimationFrame(loop)}
function bar(k,e){return`<label>${e}<i><b style="width:${C[k]}%;background:${C[k]<25?'#c0392b':'#b8862f'}"></b></i></label>`}
function ui(){$('bars').innerHTML=bar('warm','🌡️ Warmth')+bar('energy','⚡ Energy')+bar('food','🍽️ Food')+bar('morale','😊 Morale');$('inv').textContent=`🪵 ${C.wood} • 🐟 ${C.fish} • 🔥 ${C.fire?C.fire+'h':'out'} • ⭐ ${S.pts} camp points • 🏆 best ${S.best} days`;$('clog').innerHTML=C.log.map(l=>'<li>'+l+'</li>').join('');document.querySelectorAll('#acts button').forEach(b=>b.disabled=C.over);$('over').hidden=!C.over;
 $('sites').innerHTML=SITES.map((s,i)=>`<button class="${S.site==i?'on':''}" data-s="${i}">${s[0]}<small>${S.unl.includes(i)?s[4]:'🔒 '+s[3]+' pts'}</small></button>`).join('');
 $('gear').innerHTML=GEAR.map(g=>`<button data-g="${g[0]}" ${S.gear[g[0]]?'disabled':''}>${g[1]}<small>${g[2]} – ${S.gear[g[0]]?'Owned':g[3]+' pts'}</small></button>`).join('');
 $('stars').textContent=S.stars.length?'Found: '+S.stars.join(', ')+` (${S.stars.length}/${STARS.length})`:'None yet – stargaze on a clear night.';
 document.querySelectorAll('#sites button').forEach(b=>b.onclick=()=>{const i=+b.dataset.s;if(!S.unl.includes(i)){if(S.pts<SITES[i][3])return alert('Need more camp points');S.pts-=SITES[i][3];S.unl.push(i)}S.site=i;save();newTrip()});
 document.querySelectorAll('#gear button').forEach(b=>b.onclick=()=>{const g=GEAR.find(q=>q[0]==b.dataset.g);if(S.pts<g[3])return alert('Need more camp points');S.pts-=g[3];S.gear[g[0]]=1;save();ui()})}
document.querySelectorAll('#acts button').forEach(b=>b.onclick=()=>{if(C.over||C.fishing)return;A[b.dataset.a]();ui()});$('newtrip').onclick=newTrip;
newTrip();loop();
})();
