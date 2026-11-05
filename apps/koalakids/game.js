(function(){
var S={stars:0,stickers:[],muted:false};
try{var r=localStorage.getItem('cbKoala');if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
function save(){try{localStorage.setItem('cbKoala',JSON.stringify(S))}catch(e){}}
var $=function(id){return document.getElementById(id)};
var STK=['🐨','🦘','🌿','🦉','🐢','⭐','🌈','🦋','🐝','🌻','🥥','🐧'];
function hud(){$('stars').textContent='⭐ '+S.stars;$('mute').textContent=S.muted?'🔇 Sound off':'🔊 Sound on';$('mute').setAttribute('aria-pressed',S.muted)}
var AC=null;function beep(f){if(S.muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f||520;o.type='sine';g.gain.setValueAtTime(0.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.08,AC.currentTime+0.05);g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+0.4);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+0.45)}catch(e){}}
function say(t){if(S.muted)return;try{var s=window.speechSynthesis;if(!s)return;s.cancel();var u=new SpeechSynthesisUtterance(t);u.lang='en-AU';u.rate=0.85;var v=s.getVoices().filter(function(x){return x.lang==='en-AU'})[0];if(v)u.voice=v;s.speak(u)}catch(e){}}
function reward(n,msg){S.stars+=n;var st=STK[Math.floor(Math.random()*STK.length)];if(S.stickers.indexOf(st)<0)S.stickers.push(st);save();hud();beep(660);msgBox((msg||'Well done!')+' +'+n+' ⭐  New sticker: '+st)}
function msgBox(m){var b=$('msg');b.textContent=m;b.hidden=false;clearTimeout(b._t);b._t=setTimeout(function(){b.hidden=true},3500)}
window.koalaSVG=function(acc){acc=acc||{};return '<svg viewBox="0 0 200 200" class="koala" role="img" aria-label="Koala"><circle cx="45" cy="60" r="38" fill="#8e9aa3"/><circle cx="45" cy="60" r="22" fill="#e8e2d6"/><circle cx="155" cy="60" r="38" fill="#8e9aa3"/><circle cx="155" cy="60" r="22" fill="#e8e2d6"/><ellipse cx="100" cy="110" rx="70" ry="65" fill="#a3aeb6"/><circle cx="75" cy="100" r="8" fill="#2a1d14"/><circle cx="125" cy="100" r="8" fill="#2a1d14"/><circle cx="77" cy="97" r="2.5" fill="#fff"/><circle cx="127" cy="97" r="2.5" fill="#fff"/><ellipse cx="100" cy="125" rx="17" ry="22" fill="#3b2a20"/><path d="M85 152 Q100 162 115 152" stroke="#2a1d14" stroke-width="4" fill="none" stroke-linecap="round"/>'+(acc.hat?'<path d="M50 52 Q100 0 150 52 Z" fill="'+acc.hat+'"/><rect x="40" y="48" width="120" height="10" rx="5" fill="'+acc.hat+'"/>':'')+(acc.glasses?'<g fill="none" stroke="#2a1d14" stroke-width="4"><circle cx="75" cy="100" r="16"/><circle cx="125" cy="100" r="16"/><path d="M91 100h18"/></g>':'')+(acc.bow?'<path d="M80 172 L100 182 L80 192 Z M120 172 L100 182 L120 192 Z" fill="'+acc.bow+'"/><circle cx="100" cy="182" r="5" fill="'+acc.bow+'"/>':'')+(acc.leaf?'<ellipse cx="160" cy="150" rx="10" ry="24" transform="rotate(30 160 150)" fill="#5b8c5a"/>':'')+'</svg>'};
var cleanup=null;
function show(id){if(cleanup){try{cleanup()}catch(e){}cleanup=null}document.querySelectorAll('.screen').forEach(function(s){s.hidden=s.id!==id});document.body.scrollTop=0;if(G[id])cleanup=G[id]()||null}
var G={};
// Gum Leaf Catch
G.catch=function(){var c=$('catchC'),x=c.getContext('2d'),W=c.width,H=c.height,kx=W/2,leaves=[],score=0,run=true,t=0;
function mv(e){var r=c.getBoundingClientRect();var p=e.touches?e.touches[0]:e;kx=(p.clientX-r.left)/r.width*W}
c.onpointermove=mv;c.onpointerdown=mv;c.ontouchmove=function(e){mv(e);e.preventDefault()};
function loop(){if(!run)return;t++;x.fillStyle='#f5efe3';x.fillRect(0,0,W,H);if(t%50===0)leaves.push({x:30+Math.random()*(W-60),y:-20});
leaves.forEach(function(l){l.y+=1.6;x.fillStyle='#5b8c5a';x.beginPath();x.ellipse(l.x,l.y,9,18,0.5,0,7);x.fill()});
leaves=leaves.filter(function(l){if(l.y>H-60&&Math.abs(l.x-kx)<50){score++;beep(500+score*10);$('catchS').textContent='Leaves: '+score+' / 10';if(score>=10){reward(3,'You caught 10 gum leaves!');score=0}return false}return l.y<H+20});
x.fillStyle='#a3aeb6';x.beginPath();x.arc(kx,H-35,32,0,7);x.fill();x.fillStyle='#8e9aa3';x.beginPath();x.arc(kx-30,H-58,15,0,7);x.arc(kx+30,H-58,15,0,7);x.fill();x.fillStyle='#3b2a20';x.beginPath();x.ellipse(kx,H-30,7,10,0,0,7);x.fill();x.fillStyle='#2a1d14';x.beginPath();x.arc(kx-12,H-42,4,0,7);x.arc(kx+12,H-42,4,0,7);x.fill();
requestAnimationFrame(loop)}loop();return function(){run=false}};
// Memory
G.memory=function(){var A=['🐨','🦘','🦉','🐢','🐧','🦎'],d=A.concat(A).sort(function(){return Math.random()-.5}),open=[],done=0,g=$('memG');g.innerHTML='';
d.forEach(function(a){var b=document.createElement('button');b.className='card';b.textContent='🌿';b.setAttribute('aria-label','Card');b.onclick=function(){if(b.dataset.m||open.length===2||open[0]===b)return;b.textContent=a;b.classList.add('up');open.push(b);beep(440);if(open.length===2){setTimeout(function(){if(open[0].textContent===open[1].textContent){open.forEach(function(o){o.dataset.m=1;o.classList.add('ok')});done++;if(done===6)reward(3,'All pairs matched!')}else open.forEach(function(o){o.textContent='🌿';o.classList.remove('up')});open=[]},900)}};g.appendChild(b)})};
// Climb
G.climb=function(){var c=$('climbC'),x=c.getContext('2d'),W=c.width,H=c.height,h=0,ph=0,run=true;
function tap(){var good=Math.abs(Math.sin(ph))>0.8;if(good){h++;beep(400+h*30);if(h>=8){reward(3,'You reached the top of the tree!');h=0}}else msgBox('Wait for the green glow, then tap!');$('climbS').textContent='Height: '+h+' / 8'}
c.onclick=tap;$('climbB').onclick=tap;
function loop(){if(!run)return;ph+=0.025;x.fillStyle='#f5efe3';x.fillRect(0,0,W,H);x.fillStyle='#7a5a43';x.fillRect(W/2-22,0,44,H);x.fillStyle='#5b8c5a';for(var i=0;i<6;i++){x.beginPath();x.ellipse(W/2+(i%2?50:-50),30+i*55,30,12,i%2?0.4:-0.4,0,7);x.fill()}
var y=H-40-h*(H-70)/8,g=Math.abs(Math.sin(ph))>0.8;x.fillStyle=g?'#9cc59a':'#e8e2d6';x.beginPath();x.arc(W/2,y,34,0,7);x.fill();x.fillStyle='#a3aeb6';x.beginPath();x.arc(W/2,y,24,0,7);x.fill();x.fillStyle='#3b2a20';x.beginPath();x.ellipse(W/2,y+4,5,7,0,0,7);x.fill();requestAnimationFrame(loop)}loop();return function(){run=false}};
// Dress
G.dress=function(){var acc={};function r(){$('dressK').innerHTML=koalaSVG(acc)}r();document.querySelectorAll('[data-acc]').forEach(function(b){b.onclick=function(){var k=b.dataset.acc,v=b.dataset.v||true;acc[k]=acc[k]===v?null:v;beep(520);r();if(Object.keys(acc).filter(function(k){return acc[k]}).length===4)reward(1,'Looking fancy!')}})};
// Counting
G.count=function(){var n=1;function r(){$('cntN').textContent=n;$('cntJ').innerHTML=new Array(n+1).join('<span class="joey">🦘</span>');say(String(n))}r();$('cntNext').onclick=function(){n++;if(n>10){reward(2,'You counted to 10!');say('Ten! Great counting!');n=1}r()};$('cntPrev').onclick=function(){if(n>1)n--;r()};$('cntSay').onclick=function(){say(String(n))}};
// Colour
G.colour=function(){var c=$('colC'),x=c.getContext('2d'),col='#8e9aa3',draw=false;x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#2a1d14';x.lineWidth=4;
function o(cx,cy,rx,ry){x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.stroke()}o(80,80,45,45);o(220,80,45,45);o(150,150,95,85);o(120,135,10,10);o(180,135,10,10);o(150,170,20,26);o(150,290,80,50);
function p(e){var r=c.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*c.width,y:(e.clientY-r.top)/r.height*c.height}}
c.onpointerdown=function(e){draw=true;var q=p(e);x.beginPath();x.moveTo(q.x,q.y)};c.onpointermove=function(e){if(!draw)return;var q=p(e);x.strokeStyle=col;x.lineWidth=14;x.lineCap='round';x.lineTo(q.x,q.y);x.stroke()};c.onpointerup=c.onpointerleave=function(){draw=false};
document.querySelectorAll('[data-col]').forEach(function(b){b.style.background=b.dataset.col;b.onclick=function(){col=b.dataset.col;document.querySelectorAll('[data-col]').forEach(function(z){z.classList.remove('sel')});b.classList.add('sel')}});
$('colDone').onclick=function(){reward(1,'Beautiful colouring!')};$('colClear').onclick=function(){G.colour()}};
// Facts
var F=['Koalas live in Australia.','Koalas eat gum leaves, also called eucalyptus leaves.','Koalas sleep for up to 20 hours a day.','A baby koala is called a joey.','A koala joey lives in its mum\'s pouch for about six months.','Koalas are not bears. They are marsupials.','Koalas have fingerprints, just like people.','Koalas rarely drink water. They get most of it from leaves.','Koalas have two thumbs on each front paw to help them grip.','Koalas live in eucalyptus forests and woodlands.'];
G.facts=function(){var i=0,seen={};function r(){$('factT').textContent=F[i];$('factN').textContent='Fact '+(i+1)+' of '+F.length;say(F[i]);seen[i]=1;if(Object.keys(seen).length===F.length){reward(2,'You learned all the koala facts!');seen={}}}r();$('factNext').onclick=function(){i=(i+1)%F.length;r()};$('factSay').onclick=function(){say(F[i])}};
G.stickers=function(){$('stkG').innerHTML=S.stickers.length?S.stickers.map(function(s){return '<span class="stk">'+s+'</span>'}).join(''):'<p>Play games to earn stickers!</p>'};
document.addEventListener('DOMContentLoaded',function(){$('homeK').innerHTML=koalaSVG({leaf:1});hud();
$('mute').onclick=function(){S.muted=!S.muted;save();hud();try{if(S.muted&&window.speechSynthesis)speechSynthesis.cancel()}catch(e){}};
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){show(b.dataset.go)}});show('home')});
})();
