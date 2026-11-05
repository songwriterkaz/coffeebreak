(()=>{const C=document.getElementById('c'),X=C.getContext('2d'),W=1000,H=625,$=i=>document.getElementById(i);
const WEAP={cannon:{n:'Coffee Cannon',cd:.18,sp:520,dmg:1,col:'#6b3e1f',r:6},shotgun:{n:'Espresso Shotgun',cd:.6,sp:480,dmg:1,col:'#2b1608',r:5,pel:5},mug:{n:'Mug Boomerang',cd:.7,sp:420,dmg:3,col:'#e8e2d0',r:11,boom:1},latte:{n:'Latte Laser',cd:.05,sp:900,dmg:.35,col:'#d8b98a',r:3},bean:{n:'Bean Bomb',cd:.9,sp:300,dmg:4,col:'#3a2210',r:9,bomb:1}};
const MUTS=[['Double Shot','+30% fire rate',p=>p.rate*=1.3],['Oat Milk Armour','+2 max HP & heal',p=>{p.max+=2;p.hp=p.max}],['Turbo Beans','+20% speed',p=>p.spd*=1.2],['Extra Foam','Bigger shots +1 dmg',p=>p.dmg+=1],['Sugar Rush','Combo lasts longer',p=>p.ct+=1],['Mug Boomerang','Unlock weapon',p=>p.add('mug')],['Espresso Shotgun','Unlock weapon',p=>p.add('shotgun')],['Latte Laser','Unlock weapon',p=>p.add('latte')],['Bean Bomb','Unlock weapon',p=>p.add('bean')],['Crowd Pleaser','Hype fills 50% faster',p=>p.hy*=1.5],['Refill','Full heal',p=>p.hp=p.max],['Piercing Brew','Shots pass through 1 enemy',p=>p.pierce++]];
const VOTES=[['heal','Free refill (heal)',1],['boss','Spawn a BOSS',0],['speed','Speed everything up',0],['rain','Bean rain power-up',1],['shield','Foam shield',1],['swarm','Send a swarm',0]];
let S,keys={},mouse={x:W/2,y:H/2,d:0},sticks={},last=0,best=+localStorage.cbArenaBest||0;$('best').textContent=best;
function newGame(){S={p:{x:W/2,y:H/2,hp:6,max:6,spd:220,rate:1,dmg:0,ct:2,hy:1,pierce:0,w:['cannon'],wi:0,cd:0,inv:0,shield:0,add(w){if(!this.w.includes(w))this.w.push(w);this.wi=this.w.indexOf(w)}},
en:[],sh:[],fx:[],pu:[],wave:0,score:0,combo:0,ctime:0,maxc:0,hype:0,t:0,vote:$('vote').checked,vt:30,vs:null,speed:1,spawnLeft:0,st:'play',kills:0,muts:[]};nextWave()}
function nextWave(){S.wave++;S.spawnLeft=4+S.wave*3;S.sp=0;if(S.wave%5==0)spawn(1);banner('WAVE '+S.wave)}
function banner(t){S.fx.push({t:'txt',s:t,x:W/2,y:H/2-40,l:1.6,big:1})}
function spawn(boss){const a=Math.random()*6.28,x=W/2+Math.cos(a)*560,y=H/2+Math.sin(a)*400,k=boss?3:Math.random()<.2+S.wave*.03?(Math.random()<.5?1:2):0;
const T=[{n:'Sour Bean',hp:2,s:70,r:16,c:'#7a4b2a'},{n:'Hot Kettle',hp:4,s:55,r:20,c:'#8c9aa8'},{n:'Zippy Sugar',hp:1,s:140,r:11,c:'#f3efe6'},{n:'GRINDER BOSS',hp:40+S.wave*8,s:45,r:46,c:'#4a6b3a'}][k];
S.en.push({...T,k,x:Math.max(-40,Math.min(W+40,x)),y:Math.max(-40,Math.min(H+40,y)),mhp:T.hp*(1+S.wave*.1),hp:T.hp*(1+S.wave*.1),hit:0,wob:Math.random()*6})}
function fire(){const p=S.p,w=WEAP[p.w[p.wi]];if(p.cd>0)return;p.cd=w.cd/p.rate;const a=Math.atan2(mouse.y-p.y,mouse.x-p.x),n=w.pel||1;
for(let i=0;i<n;i++){const b=a+(n>1?(i-(n-1)/2)*.15:0);S.sh.push({x:p.x,y:p.y,vx:Math.cos(b)*w.sp,vy:Math.sin(b)*w.sp,w,dmg:w.dmg+p.dmg*.5,l:w.boom?1.4:1.2,pc:p.pierce,t:0,hitset:new Set()})}}
function boom(x,y,c,n=8){for(let i=0;i<n;i++)S.fx.push({t:'p',x,y,vx:(Math.random()-.5)*300,vy:(Math.random()-.5)*300,l:.5,c})}
function addHype(v){S.hype=Math.min(100,S.hype+v*S.p.hy);if(S.hype>=100){S.hype=0;S.score+=500;S.p.hp=Math.min(S.p.max,S.p.hp+1);banner('CROWD GOES WILD! +500');S.pu.push({x:100+Math.random()*800,y:100+Math.random()*400,k:'beans'})}}
function startVote(){const o=[...VOTES].sort(()=>Math.random()-.5),g=o.filter(v=>v[2])[0],b=o.filter(v=>!v[2])[0];S.vs={opts:[g,b],c:[0,0],t:10};window.CB_VOTE_OPTS=[g[1],b[1]]}
window.CB_VOTE=i=>{if(S&&S.vs&&(i==0||i==1))S.vs.c[i]++};
function resolveVote(){const v=S.vs,w=v.c[0]>=v.c[1]?0:1,k=v.opts[w][0];banner('CROWD CHOSE: '+v.opts[w][1]);S.vs=null;S.vt=30;
if(k=='heal')S.p.hp=S.p.max;if(k=='boss')spawn(1);if(k=='speed'){S.speed=1.4;setTimeout(()=>S.speed=1,10000)}if(k=='rain')for(let i=0;i<5;i++)S.pu.push({x:80+Math.random()*840,y:80+Math.random()*460,k:'beans'});if(k=='shield')S.p.shield=8;if(k=='swarm')for(let i=0;i<8;i++)spawn(0)}
function update(dt){if(S.st!='play')return;dt*=S.speed;S.t+=dt;const p=S.p;let mx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),my=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
if(sticks.m){mx=sticks.m.dx;my=sticks.m.dy}const ml=Math.hypot(mx,my);if(ml>1){mx/=ml;my/=ml}p.x=Math.max(20,Math.min(W-20,p.x+mx*p.spd*dt));p.y=Math.max(20,Math.min(H-20,p.y+my*p.spd*dt));
if(sticks.a&&Math.hypot(sticks.a.dx,sticks.a.dy)>.2){mouse.x=p.x+sticks.a.dx*100;mouse.y=p.y+sticks.a.dy*100;fire()}if(mouse.d||keys[' '])fire();
p.cd-=dt;p.inv-=dt;p.shield-=dt;S.ctime-=dt;if(S.ctime<=0)S.combo=0;
S.sp-=dt;if(S.spawnLeft>0&&S.sp<=0){spawn(0);S.spawnLeft--;S.sp=Math.max(.3,1.2-S.wave*.08)}
if(S.vote){if(S.vs){S.vs.t-=dt;if(Math.random()<dt*3)S.vs.c[Math.random()<.5?0:1]+=1+(Math.random()*3|0);if(S.vs.t<=0)resolveVote()}else{S.vt-=dt;if(S.vt<=0)startVote()}}
for(const b of S.sh){b.t+=dt;if(b.w.boom&&b.t>.6){const a=Math.atan2(p.y-b.y,p.x-b.x);b.vx+=Math.cos(a)*1400*dt;b.vy+=Math.sin(a)*1400*dt}b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;
for(const e of S.en){if(e.hp>0&&!b.hitset.has(e)&&Math.hypot(e.x-b.x,e.y-b.y)<e.r+b.w.r){b.hitset.add(e);hit(e,b.dmg);if(b.w.bomb){boom(b.x,b.y,'#f4b43c',16);for(const f of S.en)if(Math.hypot(f.x-b.x,f.y-b.y)<90&&f!=e)hit(f,b.dmg*.6);b.l=0}else if(!b.w.boom){if(b.pc--<=0)b.l=0}}}}
S.sh=S.sh.filter(b=>b.l>0&&b.x>-50&&b.x<W+50&&b.y>-50&&b.y<H+50);
for(const e of S.en){const a=Math.atan2(p.y-e.y,p.x-e.x);e.x+=Math.cos(a)*e.s*dt;e.y+=Math.sin(a)*e.s*dt;e.hit-=dt;e.wob+=dt*8;
if(Math.hypot(e.x-p.x,e.y-p.y)<e.r+16&&p.inv<=0){if(p.shield>0){e.hp-=5;boom(e.x,e.y,'#bfe3ff')}else{p.hp-=e.k==3?2:1;S.combo=0;S.hype=Math.max(0,S.hype-10);boom(p.x,p.y,'#fff',12)}p.inv=1}}
for(const e of S.en)if(e.hp<=0){S.kills++;S.combo++;S.maxc=Math.max(S.maxc,S.combo);S.ctime=p.ct;S.score+=Math.round((e.k==3?500:20)*(1+S.combo*.1));addHype(e.k==3?40:3+Math.min(S.combo,20)*.3);boom(e.x,e.y,e.c,e.k==3?40:10);
if(S.combo%10==0)S.fx.push({t:'txt',s:S.combo+' COMBO!',x:e.x,y:e.y,l:1});if(Math.random()<.08)S.pu.push({x:e.x,y:e.y,k:Math.random()<.5?'heart':'beans'})}
S.en=S.en.filter(e=>e.hp>0);
for(const u of S.pu)if(Math.hypot(u.x-p.x,u.y-p.y)<28){u.got=1;if(u.k=='heart')p.hp=Math.min(p.max,p.hp+1);else{S.score+=50;addHype(5)}}S.pu=S.pu.filter(u=>!u.got);
for(const f of S.fx){f.l-=dt;if(f.t=='p'){f.x+=f.vx*dt;f.y+=f.vy*dt}else f.y-=20*dt}S.fx=S.fx.filter(f=>f.l>0);
if(p.hp<=0)return end(false);if(S.spawnLeft==0&&S.en.length==0){if(S.wave>=10)return end(true);pick()}}
function hit(e,d){e.hp-=d;e.hit=.1;boom(e.x,e.y,'#c98a4b',3)}
function pick(){S.st='pick';const o=[...MUTS].sort(()=>Math.random()-.5).slice(0,3);$('pickT').textContent='Wave '+S.wave+' cleared! Pick a mutation';$('cards').innerHTML='';
o.forEach(m=>{const b=document.createElement('button');b.innerHTML='<b>'+m[0]+'</b><br><span class=small>'+m[1]+'</span>';b.onclick=()=>{m[2](S.p);S.muts.push(m[0]);$('pick').style.display='none';S.st='play';nextWave()};$('cards').appendChild(b)});$('pick').style.display='flex'}
function shareText(){return `☕ I scored ${S.score} in Brew Brawl Arena by Coffeebreak! Wave ${S.wave}, ${S.maxc}x combo, ${S.kills} critters brewed. Beat me! #Coffeebreak #BrewBrawl #indiegame #gaming`}
function end(win){S.st='end';if(S.score>best){best=S.score;localStorage.cbArenaBest=best;$('best').textContent=best}$('endT').textContent=win?'CHAMPION OF THE ARENA!':'KNOCKED OUT!';
$('res').textContent=`Score ${S.score}  ·  Best ${best}\nWave ${S.wave}  ·  Max combo ${S.maxc}x  ·  KOs ${S.kills}\nMutations: ${S.muts.join(', ')||'none'}`;$('end').style.display='flex';try{cbShowStreamEnd()}catch(e){}}
function draw(){X.fillStyle='#3b2a1c';X.fillRect(0,0,W,H);X.fillStyle='#4a3524';X.beginPath();X.ellipse(W/2,H/2,460,270,0,0,6.28);X.fill();X.strokeStyle='#f4b43c';X.lineWidth=6;X.stroke();
// crowd
const hy=S?S.hype:0;for(let i=0;i<50;i++){const x=i*20+10,j=Math.sin((S?S.t:0)*(4+hy/10)+i)*(2+hy/12);X.fillStyle=['#2f6fa8','#3f9a5a','#d9822b','#7b5fb0','#c9b458'][i%5];X.beginPath();X.arc(x,14+j,8,0,6.28);X.fill();X.beginPath();X.arc(x+10,H-12-j,8,0,6.28);X.fill()}
if(!S)return;const p=S.p;
for(const u of S.pu){X.font='22px sans-serif';X.textAlign='center';X.fillText(u.k=='heart'?'❤️':'🫘',u.x,u.y+8)}
for(const e of S.en){X.save();X.translate(e.x,e.y+Math.sin(e.wob)*2);X.fillStyle=e.hit>0?'#fff':e.c;X.beginPath();X.ellipse(0,0,e.r,e.r*.85,0,0,6.28);X.fill();X.fillStyle='#000';X.beginPath();X.arc(-e.r*.35,-e.r*.2,e.r*.15,0,6.28);X.arc(e.r*.35,-e.r*.2,e.r*.15,0,6.28);X.fill();
X.strokeStyle='#000';X.lineWidth=2;X.beginPath();X.moveTo(-e.r*.5,-e.r*.5);X.lineTo(-e.r*.15,-e.r*.35);X.moveTo(e.r*.5,-e.r*.5);X.lineTo(e.r*.15,-e.r*.35);X.stroke();
if(e.k==3){X.fillStyle='#222';X.fillRect(-e.r,-e.r-14,e.r*2,6);X.fillStyle='#f4b43c';X.fillRect(-e.r,-e.r-14,e.r*2*e.hp/e.mhp,6)}X.restore()}
for(const b of S.sh){X.fillStyle=b.w.col;X.beginPath();X.arc(b.x,b.y,b.w.r,0,6.28);X.fill();if(b.w.boom){X.strokeStyle='#6b3e1f';X.lineWidth=3;X.beginPath();X.arc(b.x+b.w.r,b.y,5,0,6.28);X.stroke()}}
// player: coffee cup hero
X.save();X.translate(p.x,p.y);if(p.inv>0&&(S.t*20|0)%2)X.globalAlpha=.4;if(p.shield>0){X.strokeStyle='#bfe3ff';X.lineWidth=4;X.beginPath();X.arc(0,0,28,0,6.28);X.stroke()}
X.fillStyle='#f3efe6';X.beginPath();X.moveTo(-15,-14);X.lineTo(15,-14);X.lineTo(11,16);X.lineTo(-11,16);X.fill();X.fillStyle='#f4b43c';X.fillRect(-15,-3,30,7);X.fillStyle='#6b3e1f';X.fillRect(-15,-18,30,5);
X.fillStyle='#000';X.beginPath();X.arc(-5,-8,2.5,0,6.28);X.arc(5,-8,2.5,0,6.28);X.fill();const a=Math.atan2(mouse.y-p.y,mouse.x-p.x);X.rotate(a);X.fillStyle='#333';X.fillRect(12,-4,16,8);X.restore();
for(const f of S.fx){X.globalAlpha=Math.max(0,Math.min(1,f.l*2));if(f.t=='p'){X.fillStyle=f.c;X.fillRect(f.x-3,f.y-3,6,6)}else{X.fillStyle='#f4b43c';X.font=(f.big?'bold 44px':'bold 22px')+' sans-serif';X.textAlign='center';X.strokeStyle='#000';X.lineWidth=4;X.strokeText(f.s,f.x,f.y);X.fillText(f.s,f.x,f.y)}}X.globalAlpha=1;
// HUD
X.textAlign='left';X.font='bold 18px sans-serif';X.fillStyle='#fff';X.fillText('Score '+S.score+'   Wave '+S.wave+'/10',16,52);X.fillText('❤️'.repeat(Math.max(0,p.hp))+'🤍'.repeat(Math.max(0,p.max-p.hp)),16,76);
X.fillText('🔫 '+WEAP[p.w[p.wi]].n+(p.w.length>1?' (Q / tap icon)':''),16,100);if(S.combo>1){X.fillStyle='#f4b43c';X.font='bold 28px sans-serif';X.fillText(S.combo+'x COMBO',16,134)}
X.fillStyle='#222';X.fillRect(W-226,38,200,16);X.fillStyle='#f4b43c';X.fillRect(W-226,38,2*S.hype,16);X.fillStyle='#fff';X.font='bold 13px sans-serif';X.fillText('CROWD HYPE',W-226,70);
if(S.vote){if(S.vs){const v=S.vs,t=v.c[0]+v.c[1]||1;X.fillStyle='rgba(0,0,0,.6)';X.fillRect(W/2-190,40,380,74);X.fillStyle='#fff';X.textAlign='center';X.font='bold 15px sans-serif';X.fillText('📣 AUDIENCE VOTE ('+Math.ceil(v.t)+'s)  type 1 or 2 in chat',W/2,58);
X.textAlign='left';[0,1].forEach(i=>{X.fillStyle=i?'#c0543c':'#3f9a5a';X.fillRect(W/2-180,66+i*22,360*v.c[i]/t,18);X.fillStyle='#fff';X.fillText((i+1)+'. '+v.opts[i][1]+' ('+v.c[i]+')',W/2-176,81+i*22)})}else{X.fillStyle='#fff';X.font='13px sans-serif';X.textAlign='right';X.fillText('Next vote in '+Math.ceil(S.vt)+'s',W-26,88)}}
if('ontouchstart'in window){X.globalAlpha=.25;X.fillStyle='#fff';for(const [x,y] of [[110,H-110],[W-110,H-110]]){X.beginPath();X.arc(x,y,60,0,6.28);X.fill()}X.globalAlpha=1}X.textAlign='left'}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(S)update(dt);draw();requestAnimationFrame(loop)}
function cp(e){const r=C.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;if(k=='q'&&S)S.p.wi=(S.p.wi+1)%S.p.w.length;if(k=='1'||k=='2')window.CB_VOTE(+k-1);if(k==' ')e.preventDefault()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
C.addEventListener('mousemove',e=>{Object.assign(mouse,cp(e))});C.addEventListener('mousedown',e=>{Object.assign(mouse,cp(e));mouse.d=1});addEventListener('mouseup',()=>mouse.d=0);
const touches={};C.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches){const q=cp(t);if(S&&q.x<200&&q.y>80&&q.y<110){S.p.wi=(S.p.wi+1)%S.p.w.length;continue}const s=q.x<W/2?'m':'a';touches[t.identifier]={s,ox:q.x,oy:q.y};sticks[s]={dx:0,dy:0}}},{passive:false});
C.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches){const o=touches[t.identifier];if(!o)continue;const q=cp(t);let dx=(q.x-o.ox)/60,dy=(q.y-o.oy)/60;const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l}sticks[o.s]={dx,dy}}},{passive:false});
C.addEventListener('touchend',e=>{for(const t of e.changedTouches){const o=touches[t.identifier];if(o){delete sticks[o.s];delete touches[t.identifier]}}});
$('go').onclick=()=>{$('start').style.display='none';newGame()};$('again').onclick=()=>{$('end').style.display='none';newGame()};
$('share').onclick=async()=>{const t=shareText();try{if(navigator.share)await navigator.share({text:t});else{await navigator.clipboard.writeText(t);$('msg').textContent='Copied! Paste it into your TikTok caption.'}}catch(e){$('msg').textContent=t}};
$('shot').onclick=()=>{draw();X.fillStyle='rgba(0,0,0,.7)';X.fillRect(W/2-260,H/2-60,520,120);X.fillStyle='#f4b43c';X.textAlign='center';X.font='bold 34px sans-serif';X.fillText('BREW BRAWL ARENA: '+S.score,W/2,H/2-8);X.fillStyle='#fff';X.font='18px sans-serif';X.fillText('Wave '+S.wave+' · '+S.maxc+'x combo · by Coffeebreak',W/2,H/2+28);
const a=document.createElement('a');a.download='brew-brawl-score.png';a.href=C.toDataURL();a.click();$('msg').textContent='Screenshot saved. Post it on TikTok!'};
// Optional YouTube live chat votes: add ?ytkey=YOUR_API_KEY&live=LIVE_CHAT_ID to the URL (see LIVECHAT.txt). Nothing is stored or hardcoded.
const qs=new URLSearchParams(location.search),yk=qs.get('ytkey'),lc=qs.get('live');if(yk&&lc){let tok='';const poll=async()=>{try{const r=await fetch(`https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${encodeURIComponent(lc)}&part=snippet&key=${encodeURIComponent(yk)}${tok?'&pageToken='+tok:''}`),j=await r.json();tok=j.nextPageToken||tok;
for(const m of j.items||[]){const s=(m.snippet.displayMessage||'').trim();if(s=='1'||s=='2')window.CB_VOTE(+s-1)}setTimeout(poll,Math.max(3000,j.pollingIntervalMillis||5000))}catch(e){setTimeout(poll,10000)}};poll()}
window.__arenaTest={newGame,get S(){return S},end,pick,startVote,resolveVote};requestAnimationFrame(loop)})();
