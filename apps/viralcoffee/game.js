(()=>{const c=document.getElementById('c'),x=c.getContext('2d'),W=540,H=960,$=i=>document.getElementById(i);
const LINK='https://coffeebreaks.itch.io/coffee-rush';const logo=new Image();logo.src=window.CBLOGO||'cb-logo.jpg';
const day=new Date().toISOString().slice(0,10);let seed0=[...day].reduce((a,ch)=>a*31+ch.charCodeAt(0)>>>0,7);
let rs;const rnd=()=>{rs^=rs<<13;rs>>>=0;rs^=rs>>17;rs^=rs<<5;rs>>>=0;return rs/4294967296};
$('daily').textContent='Daily challenge '+day+' – everyone gets the same level today';
const h=location.hash.match(/s=(\d+)/);if(h)$('chal').textContent='A friend scored '+h[1]+'. Can you beat it?';
const TITLES=[[0,'Decaf Disappointment'],[50,'Lukewarm Larry'],[120,'Instant Coffee Intern'],[200,'Barista in Training'],[320,'Flat White Fiend'],[450,'Certified Caffeine Gremlin'],[600,'Espresso Overlord'],[800,'Bean Whisperer Supreme'],[1050,'Coffeebreak Legend ☕']];
let cup,items,score,combo,best,t0,last,run=false,parts,AC,rec,chunks,clipBlob;
function snd(f,d=.08){try{AC=AC||new AudioContext();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=.06;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.stop(AC.currentTime+d)}catch(e){}}
function startRec(){chunks=[];clipBlob=null;try{if(!c.captureStream||!window.MediaRecorder)return;const st=c.captureStream(30);const mt=['video/webm;codecs=vp9','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));if(!mt)return;rec=new MediaRecorder(st,{mimeType:mt});
rec.ondataavailable=e=>{if(e.data.size){chunks.push({t:performance.now(),d:e.data});}};rec.onstop=()=>{if(chunks.length){const k=chunks.slice(0,1).concat(chunks.slice(1).filter(q=>q.t>performance.now()-5600));clipBlob=new Blob(k.map(q=>q.d),{type:'video/webm'})}};rec.start(500)}catch(e){rec=null}}
function play(){rs=seed0||1;cup={x:W/2};items=[];parts=[];score=0;combo=0;best=0;t0=performance.now();last=t0;run=true;$('start').style.display='none';$('end').style.display='none';startRec();requestAnimationFrame(loop)}
function spawn(el){const r=rnd(),sp=3+el/6;const k=r<.68?'bean':r<.82?'spill':r<.92?'burnt':'gold';items.push({k,x:40+rnd()*(W-80),y:-30,v:sp*(.8+rnd()*.6)})}
let acc=0;function loop(now){if(!run)return;const dt=Math.min(50,now-last)/16.7;last=now;const el=(now-t0)/1000;if(el>=30){end();return}
acc+=dt*(0.045+el*0.004);while(acc>1){acc--;spawn(el)}
x.fillStyle='#2a1a10';x.fillRect(0,0,W,H);x.fillStyle='#3a2616';for(let i=0;i<8;i++)x.fillRect(0,i*130+(el*40%130),W,4);
items.forEach(o=>{o.y+=o.v*dt;x.font='44px serif';x.textAlign='center';x.fillText({bean:'🫘',spill:'💧',burnt:'🔥',gold:'⭐'}[o.k],o.x,o.y)});
const cy=H-110;x.font='80px serif';x.fillText('☕',cup.x,cy+30);
items=items.filter(o=>{if(o.y>cy-30&&o.y<cy+40&&Math.abs(o.x-cup.x)<60){if(o.k=='bean'||o.k=='gold'){combo++;best=Math.max(best,combo);const p=(o.k=='gold'?50:10)*(1+Math.floor(combo/5));score+=p;snd(500+combo*30);parts.push({x:o.x,y:o.y,t:30,s:'+'+p})}else{combo=0;score=Math.max(0,score-25);snd(120,.25);parts.push({x:o.x,y:o.y,t:30,s:'SPILL!'})}return false}if(o.y>H+40){if(o.k=='bean')combo=0;return false}return true});
parts=parts.filter(p=>{p.t-=dt;p.y-=2*dt;x.fillStyle='#f4b43c';x.font='bold 30px sans-serif';x.fillText(p.s,p.x,p.y);return p.t>0});
x.fillStyle='#f3efe6';x.font='bold 40px sans-serif';x.textAlign='left';x.fillText(score,20,55);x.textAlign='right';x.fillText(Math.ceil(30-el)+'s',W-20,55);
x.fillStyle='#5a3a20';x.fillRect(20,75,W-40,16);x.fillStyle='#f4b43c';x.fillRect(20,75,(W-40)*Math.min(1,(combo%5)/5),16);x.textAlign='center';x.font='bold 22px sans-serif';x.fillText('COMBO x'+(1+Math.floor(combo/5))+' ('+combo+')',W/2,120);
if(logo.complete)x.drawImage(logo,W/2-30,10,60,60*logo.height/logo.width||60);requestAnimationFrame(loop)}
function title(s){let t=TITLES[0][1];TITLES.forEach(([m,n])=>{if(s>=m)t=n});return t}
function card(){const k=document.createElement('canvas');k.width=1080;k.height=1920;const g=k.getContext('2d');const gr=g.createLinearGradient(0,0,0,1920);gr.addColorStop(0,'#3a2414');gr.addColorStop(1,'#120a05');g.fillStyle=gr;g.fillRect(0,0,1080,1920);
if(logo.complete&&logo.width){const w=420,hh=w*logo.height/logo.width;g.drawImage(logo,540-w/2,140,w,hh)}g.textAlign='center';g.fillStyle='#f3efe6';g.font='bold 70px sans-serif';g.fillText('COFFEE RUSH',540,760);
g.fillStyle='#f4b43c';g.font='bold 260px sans-serif';g.fillText(score,540,1060);g.fillStyle='#f3efe6';g.font='bold 60px sans-serif';g.fillText('I am a…',540,1210);g.fillStyle='#f4b43c';g.font='bold 74px sans-serif';
const t=title(score);t.length>20?(g.fillText(t.slice(0,t.lastIndexOf(' ',20)),540,1320),g.fillText(t.slice(t.lastIndexOf(' ',20)+1),540,1410)):g.fillText(t,540,1330);
g.fillStyle='#f3efe6';g.font='48px sans-serif';g.fillText('Best combo '+best+' · Daily '+day,540,1560);g.fillText('Beat me 👉 coffeebreaks.itch.io',540,1700);return k}
let cardBlob;function end(){run=false;if(rec&&rec.state=='recording')rec.stop();snd(300,.4);const k=card();$('card').src=k.toDataURL();k.toBlob(b=>cardBlob=b);
const fr=h&&+h[1];$('res').innerHTML='<h2 style="margin:4px;color:#f4b43c">'+score+'</h2><b>'+title(score)+'</b>'+(fr?'<p>'+(score>fr?'You beat your friend! 🎉':'Your friend still wins 😅')+'</p>':'');$('end').style.display='flex';$('clip').style.display=(window.MediaRecorder&&c.captureStream)?'':'none'}
async function share(blob,name,text){try{const f=new File([blob],name,{type:blob.type});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text:text+' '+LINK});return}}catch(e){if(e.name=='AbortError')return}
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();$('msg').textContent='Saved! Post it on TikTok with #CoffeeRush'}
$('share').onclick=()=>cardBlob&&share(cardBlob,'coffee-rush-'+score+'.png','I scored '+score+' in Coffee Rush – '+title(score)+'!');
$('clip').onclick=()=>clipBlob?share(clipBlob,'coffee-rush-clip.webm','My last 5 seconds of Coffee Rush 🔥'):$('msg').textContent='Clip not ready on this browser.';
$('friend').onclick=async()=>{const u=location.href.split('#')[0]+'#s='+score;try{if(navigator.share){await navigator.share({text:'Beat my '+score+' in Coffee Rush!',url:u});return}}catch(e){}try{await navigator.clipboard.writeText(u);$('msg').textContent='Challenge link copied!'}catch(e){$('msg').textContent=u}};
$('go').onclick=play;$('again').onclick=play;
const mv=e=>{const r=c.getBoundingClientRect();const px=(e.touches?e.touches[0].clientX:e.clientX);if(cup)cup.x=Math.max(40,Math.min(W-40,(px-r.left)/r.width*W))};
c.addEventListener('pointermove',mv);c.addEventListener('touchmove',e=>{e.preventDefault();mv(e)},{passive:false});
addEventListener('keydown',e=>{if(!cup)return;if(e.key=='ArrowLeft')cup.x=Math.max(40,cup.x-40);if(e.key=='ArrowRight')cup.x=Math.min(W-40,cup.x+40)});
window.CR={play,end,get score(){return score}};})();
