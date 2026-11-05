(function(){
const NAMES=["Espresso Express","Latte Lightning","Pink Bee Bolt","Mocha Magic","Lullaby Lass","Rockabilly Rose","Flat White Flyer","Sugar Rush Sal","Honey Dipper","Cappuccino Queen","Fishnet Fancy","Strawberry Custard","Coffeebreak Girl","Velvet Crema","Marshmallow Mist","Thriller Thunder","Gold Lace Lady","Newcastle Nightcap"];
const SILK=[["#ff4fa3","#ffd54a"],["#111","#ff7ac0"],["#ffd54a","#ff4fa3"],["#7a3b1d","#ffc0dc"],["#c9a4ff","#fff"],["#e0115f","#111"],["#fff","#ff4fa3"],["#ff9ac8","#7a3b1d"],["#f4b400","#111"],["#b8860b","#ffe4f0"],["#000","#ff1493"],["#ff6f91","#fff3b0"]];
const LS="cbCupDay_v1";
let st=JSON.parse(localStorage.getItem(LS)||'{"board":[],"best":0}');
const $=s=>document.querySelector(s);
const root=$("#cbgame");
root.innerHTML=`<div class="g-top"><img src="img/girl-vanity-lipstick.jpg" class="caller" alt="Coffeebreak girl race caller"><div><b>Your caller: the Coffeebreak girl</b><div id="g-call" class="call">Welcome to Cup Day. Pick your horse to begin the series.</div></div><img src="img/logo.jpg" class="glogo" alt="Coffeebreak logo"></div>
<div class="g-info">Race <span id="g-rn">1</span> of 5 &middot; Points <b id="g-pts">0</b> &middot; Picked: <b id="g-pick">none</b> <label><input type="checkbox" id="g-snd"> Sound</label></div>
<canvas id="g-cv" width="900" height="420"></canvas>
<div id="g-field" class="field"></div>
<div class="g-btns"><button id="g-go">Start race</button> <button id="g-new">New series</button></div>
<div id="g-res"></div>
<h3>Cup Day leaderboard</h3><ol id="g-board"></ol><p class="fine">Just for fun. Points only. No money, no betting, no prizes.</p>`;
const cv=$("#g-cv"),cx=cv.getContext("2d");
let race=1,pts=0,pick=-1,field=[],running=false,callerT=0;
function shuffle(a){return a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);}
function newField(){field=shuffle(NAMES.map((n,i)=>i)).slice(0,10).map((ni,k)=>({name:NAMES[ni],silk:SILK[k%SILK.length],num:k+1,form:0.85+Math.random()*0.3,x:0,done:0,phase:Math.random()*6}));
 field.forEach(h=>h.odds=Math.max(2,Math.round(14/(h.form*h.form)-8)));pick=-1;$("#g-pick").textContent="none";drawField();draw();}
function drawField(){$("#g-field").innerHTML=field.map((h,i)=>`<button class="hz ${i==pick?'on':''}" data-i="${i}"><span class="silk" style="background:linear-gradient(90deg,${h.silk[0]} 50%,${h.silk[1]} 50%)"></span>${h.num}. ${h.name}<small>${h.odds} pts if they win</small></button>`).join("");
 document.querySelectorAll(".hz").forEach(b=>b.onclick=()=>{if(running)return;pick=+b.dataset.i;$("#g-pick").textContent=field[pick].name;say(`${field[pick].name}, lovely choice. Press start when you're ready.`);drawField();});}
function say(t){$("#g-call").textContent=t;}
let actx;function beep(f,d){if(!$("#g-snd").checked)return;actx=actx||new AudioContext();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+d);}
const FIN=780,START=60;
function draw(t=0){const W=cv.width,H=cv.height,L=field.length,lh=(H-60)/L;
 cx.fillStyle="#7cc96b";cx.fillRect(0,0,W,H);cx.fillStyle="#ffe4f0";cx.fillRect(0,0,W,40);
 cx.fillStyle="#d4006a";cx.font="bold 20px Georgia";cx.fillText("Coffeebreak Race Day  ·  Cup Day 3200m",14,27);
 for(let i=0;i<L;i++){cx.fillStyle=i%2?"#6dbd5d":"#82d071";cx.fillRect(0,40+i*lh,W,lh);}
 cx.fillStyle="#fff";cx.fillRect(START+20,40,3,H-60);cx.fillStyle="#ffd54a";for(let y=40;y<H-20;y+=10){cx.fillRect(FIN+20,y,6,5);}
 cx.fillStyle="#ff4fa3";cx.fillRect(0,H-20,W,20);cx.fillStyle="#fff";cx.font="12px sans-serif";cx.fillText("Pink rail  ·  Coffeebreak  ·  just for fun",10,H-6);
 field.forEach((h,i)=>{const y=40+i*lh+lh/2,x=START+h.x;const g=Math.sin(t/60+h.phase)*(running&&!h.done?4:0);
  cx.save();cx.translate(x,y);
  cx.fillStyle="#6b3a1e";cx.beginPath();cx.ellipse(0,0,22,9,0,0,7);cx.fill();// body
  cx.beginPath();cx.ellipse(22,-8+g/2,9,6,-.6,0,7);cx.fill();// head
  cx.strokeStyle="#4a2410";cx.lineWidth=3;[-14,-8,10,16].forEach((lx,k)=>{cx.beginPath();cx.moveTo(lx,6);cx.lineTo(lx+(k%2?g:-g),17);cx.stroke();});
  cx.strokeStyle="#2a1208";cx.beginPath();cx.moveTo(-22,-2);cx.lineTo(-32,4+g);cx.stroke();
  cx.fillStyle=h.silk[0];cx.fillRect(-6,-20,12,12);cx.fillStyle=h.silk[1];cx.fillRect(0,-20,6,12);cx.beginPath();cx.arc(0,-24,5,0,7);cx.fill();
  cx.restore();cx.fillStyle=i==pick?"#d4006a":"#111";cx.font=(i==pick?"bold ":"")+"11px sans-serif";cx.fillText(h.num+" "+h.name+(i==pick?"  (yours)":""),x+36,y+4);});}
function lines(order){const a=order[0],b=order[1],c=order[order.length-1];return [`They're off and racing on Cup Day.`,`${a.name} shows early speed with ${b.name} sitting handy.`,`${c.name} is settling at the back of the field.`,`Into the straight, ${a.name} leads, ${b.name} is coming hard.`];}
function go(){if(running)return;if(pick<0){say("Pick a horse first, darling.");return;}if(race>5){say("Series finished. Start a new series.");return;}
 running=true;field.forEach(h=>{h.x=0;h.done=0;h.v=0;});let place=[],last=performance.now(),ci=0,start=last;beep(880,.3);
 function step(now){const dt=Math.min(40,now-last)/16;last=now;
  field.forEach(h=>{if(h.done)return;h.v=h.form*(1.6+Math.random()*1.4)+(Math.random()<.02?2:0);h.x+=h.v*dt*0.9;if(h.x>=FIN-START){h.x=FIN-START;h.done=1;place.push(h);beep(440+place.length*40,.08);}});
  const order=[...field].sort((p,q)=>q.x-p.x),el=now-start,ls=lines(order);if(el>ci*1600&&ci<ls.length){say(ls[ci]);ci++;}
  draw(now);if(place.length<field.length)requestAnimationFrame(step);else finish(place);}
 requestAnimationFrame(step);}
function finish(place){running=false;const me=field[pick],pos=place.indexOf(me)+1;let got=0;
 if(pos==1)got=me.odds*10;else if(pos==2)got=me.odds*4;else if(pos==3)got=me.odds*2;else got=1;pts+=got;$("#g-pts").textContent=pts;
 say(pos==1?`${me.name} wins it. Pop the bubbly, you've earned ${got} point${got==1?"":"s"}.`:`${place[0].name} wins. Your ${me.name} ran ${ord(pos)}, ${got} point${got==1?"":"s"}.`);
 $("#g-res").innerHTML=`<h3>Race ${race} result</h3><ol>`+place.slice(0,4).map(h=>`<li>${h.name}${h===me?" (yours)":""}</li>`).join("")+`</ol>`;
 race++;if(race>5){trophy();}else{$("#g-rn").textContent=race;setTimeout(()=>{newField();say(`Race ${race} field is out. Pick your horse.`)},2500);} }
function ord(n){return n+(["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n]||"th");}
function trophy(){const nm=(prompt("Series done. Your name for the leaderboard:","Coffeebreak fan")||"Guest").slice(0,20);
 st.board.push({n:nm,p:pts,d:new Date().toLocaleDateString()});st.board.sort((a,b)=>b.p-a.p);st.board=st.board.slice(0,10);localStorage.setItem(LS,JSON.stringify(st));board();
 $("#g-res").innerHTML+=`<div class="trophy"><img src="img/girl-satin-dress-back.jpg" alt="Coffeebreak girl presenter"><div><h3>Cup Day presentation</h3><p>The Coffeebreak girl presents the golden coffee cup to <b>${nm}</b> with ${pts} points. Thanks for racing with Coffeebreak.</p></div></div>`;}
function board(){$("#g-board").innerHTML=st.board.map(e=>`<li>${e.n} - ${e.p} pts <small>${e.d}</small></li>`).join("")||"<li>No series run yet</li>";}
$("#g-go").onclick=go;$("#g-new").onclick=()=>{if(running)return;race=1;pts=0;$("#g-pts").textContent=0;$("#g-rn").textContent=1;$("#g-res").innerHTML="";newField();say("New Cup Day series. Pick your horse.");};
newField();board();
})();
