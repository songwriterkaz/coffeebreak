(function(){
const cv=document.getElementById('cv'),cx=cv.getContext('2d'),cap=document.getElementById('cap');
const playBtn=document.getElementById('play');let ep=0,beats=[],bi=0,playing=false,timer=null,t0=0,raf=0;
function buildBeats(e){const b=[{k:'title',text:'Episode '+e.n+': '+e.title,sub:SERIES.title,dur:4500},{k:'text',who:'COLD OPEN',text:e.cold_open,dur:7000}];
 e.acts.forEach((a,i)=>b.push({k:'text',who:'ACT '+(i+1),text:a,dur:6000}));
 e.scene.forEach(s=>{if(s[1]==='')b.push({k:'slug',text:s[0],dur:3000});else b.push({k:'line',who:s[0],text:s[1],dur:4200});});
 b.push({k:'title',text:'Next time',sub:e.tag,dur:6000});return b;}
function draw(now){const b=beats[bi];if(b===undefined)return;const t=(now-t0)/1000,W=1280,H=720;
 const g=cx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#04121c');g.addColorStop(1,b.k==='title'?'#14435f':'#0b2233');cx.fillStyle=g;cx.fillRect(0,0,W,H);
 for(let i=0;i<40;i++){const x=(i*97+t*60*(1+i%3))%W,y=(i*53)%H;cx.strokeStyle='rgba(160,200,230,.15)';cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-6,y+28);cx.stroke();}
 const sweep=(Math.sin(t*0.8)+1)/2;cx.fillStyle='rgba(240,166,64,'+(0.08+0.08*sweep)+')';cx.beginPath();cx.moveTo(W*0.85,0);cx.lineTo(W*0.3+sweep*300,H);cx.lineTo(W*0.5+sweep*300,H);cx.closePath();cx.fill();
 cx.fillStyle='rgba(30,80,255,'+(0.15*(Math.sin(t*6)>0?1:0))+')';cx.fillRect(0,0,W,8);cx.fillStyle='rgba(255,40,60,'+(0.15*(Math.sin(t*6)>0?0:1))+')';cx.fillRect(0,H-8,W,8);
 cx.textAlign='center';
 if(b.k==='title'){const a=Math.min(1,t/1.2);cx.globalAlpha=a;cx.fillStyle='#f0a640';cx.font='bold 30px Arial';cx.fillText(b.sub.length>70?SERIES.title:b.sub,W/2,250);
  cx.fillStyle='#fff';cx.font='bold 64px Georgia';cx.fillText(b.text,W/2,340);if(b.sub.length>70){cx.font='italic 28px Georgia';wrap(b.sub,W/2,420,1000,38);}cx.globalAlpha=1;}
 else if(b.k==='slug'){cx.fillStyle='#fff';cx.font='bold 46px Courier New';cx.fillText(b.text,W/2,H/2);}
 else{cx.fillStyle='rgba(255,255,255,.08)';cx.font='bold 200px Arial';cx.fillText(b.who||'',W/2,H/2+60);}
 const pct=Math.min(1,(now-t0)/b.dur);cx.fillStyle='#f0a640';cx.fillRect(0,H-14,W*((bi+pct)/beats.length),6);
 raf=requestAnimationFrame(draw);}
function wrap(s,x,y,mw,lh){const w=s.split(' ');let line='';for(const word of w){const tst=line+word+' ';if(cx.measureText(tst).width>mw&&line){cx.fillText(line,x,y);line=word+' ';y+=lh;}else line=tst;}cx.fillText(line,x,y);}
function show(){cancelAnimationFrame(raf);clearTimeout(timer);const b=beats[bi];t0=performance.now();
 cap.innerHTML='';if(b.k==='text'||b.k==='line'){const w=document.createElement('span');w.className='who';w.textContent=b.who;cap.appendChild(w);cap.appendChild(document.createTextNode(b.text));}
 raf=requestAnimationFrame(draw);speak(b);if(playing)timer=setTimeout(adv,b.dur);}
function speak(b){if(document.getElementById('voice').checked&&'speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance((b.k==='title'?b.text+'. '+b.sub:b.text));u.rate=1;speechSynthesis.speak(u);}}
function adv(){if(bi<beats.length-1){bi++;show();}else{if(ep<SERIES.episodes.length-1){load(ep+1);}else{playing=false;playBtn.textContent='Play';}}}
function load(i){ep=i;beats=buildBeats(SERIES.episodes[i]);bi=0;document.querySelectorAll('.ep').forEach((b,j)=>b.classList.toggle('on',j===i));show();}
playBtn.onclick=()=>{playing=playing===false;playBtn.textContent=playing?'Pause':'Play';if(playing)show();else{clearTimeout(timer);if('speechSynthesis' in window)speechSynthesis.cancel();}};
document.getElementById('next').onclick=()=>{if(bi<beats.length-1){bi++;show();}else if(ep<SERIES.episodes.length-1)load(ep+1);};
document.getElementById('prev').onclick=()=>{if(bi>0){bi--;show();}else if(ep>0)load(ep-1);};
document.getElementById('fs').onclick=()=>{const s=document.getElementById('stage');if(document.fullscreenElement)document.exitFullscreen();else if(s.requestFullscreen)s.requestFullscreen();};
document.querySelectorAll('.ep').forEach(b=>b.onclick=()=>load(+b.dataset.i));
document.querySelectorAll('nav button[data-t]').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.id===b.dataset.t));});
document.getElementById('printbtn').onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.id==='scripts'));window.print();};
load(0);
})();