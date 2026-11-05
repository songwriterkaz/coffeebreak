// Coffeebreak Tattoo Gun Practice – practice game only. All flash designs are original, drawn in code.
(function(){const $=id=>document.getElementById(id),cv=$('cv'),x=cv.getContext('2d'),W=1000,H=700;
const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=H;return c};
const skin=mk(),ink=mk(),sten=mk(),mask=mk(),ik=ink.getContext('2d',{willReadFrequently:true});
const S={pr:1,redo:[],part:'arm',tone:'#e8b894',needle:'liner',speed:6,depth:5,ink:'#151515',mode:'lesson',pick:0,undo:[]};
const TONES=['#fbe6d6','#f6d7c0','#eec7a6','#e8b894','#d9a47c','#c68e64','#b07a52','#9a6644','#80543a','#6b4429','#54361f','#3f2a1d'];
const INKS=['#151515','#1f3b73','#1d6b3a','#b3261e','#e0a21b','#5a3d8c','#d81b60','#00897b','#f4511e','#ffffff','#6d4c41','#7f8c8d'];
function skinPath(c){c.beginPath();if(S.part=='photo'){c.rect(0,0,W,H);return}
 if(S.part=='hand'){c.moveTo(330,690);c.lineTo(340,420);c.quadraticCurveTo(300,330,330,250);c.lineTo(380,120);c.quadraticCurveTo(400,90,420,120);c.lineTo(420,240);c.lineTo(450,70);c.quadraticCurveTo(475,40,500,70);c.lineTo(495,230);c.lineTo(540,80);c.quadraticCurveTo(565,55,590,85);c.lineTo(565,250);c.lineTo(620,140);c.quadraticCurveTo(645,120,665,145);c.lineTo(610,330);c.quadraticCurveTo(700,300,730,330);c.quadraticCurveTo(640,420,620,470);c.lineTo(640,690);c.closePath();return}
 if(S.part=='chest'){c.moveTo(60,120);c.quadraticCurveTo(500,40,940,120);c.lineTo(960,690);c.lineTo(40,690);c.closePath();return}
 if(S.part=='neck'){c.moveTo(380,0);c.lineTo(620,0);c.quadraticCurveTo(630,260,700,380);c.quadraticCurveTo(900,430,980,520);c.lineTo(980,700);c.lineTo(20,700);c.lineTo(20,520);c.quadraticCurveTo(100,430,300,380);c.quadraticCurveTo(370,260,380,0);c.closePath();return}
 if(S.part=='shoulder'){c.moveTo(0,700);c.lineTo(0,330);c.quadraticCurveTo(150,120,480,90);c.quadraticCurveTo(820,100,960,330);c.lineTo(960,700);c.closePath();return}
 if(S.part=='ankle'){c.moveTo(380,0);c.lineTo(600,0);c.quadraticCurveTo(590,320,640,450);c.quadraticCurveTo(900,520,940,640);c.lineTo(940,700);c.lineTo(330,700);c.quadraticCurveTo(340,420,380,0);c.closePath();return}
 if(S.part=='arm'){c.moveTo(40,250);c.bezierCurveTo(300,190,700,180,960,230);c.lineTo(960,480);c.bezierCurveTo(700,530,300,520,40,460);c.closePath()}
 else if(S.part=='leg'){c.moveTo(380,20);c.bezierCurveTo(330,250,300,420,360,690);c.lineTo(640,690);c.bezierCurveTo(700,420,690,250,620,20);c.closePath()}
 else{c.moveTo(170,40);c.quadraticCurveTo(500,0,830,40);c.quadraticCurveTo(900,350,820,680);c.lineTo(180,680);c.quadraticCurveTo(100,350,170,40);c.closePath()}}
function drawSkin(){const c=skin.getContext('2d');c.clearRect(0,0,W,H);c.fillStyle='#232a2e';c.fillRect(0,0,W,H);if(S.part=='photo'&&S.photo){const im=S.photo,k=Math.max(W/im.width,H/im.height);c.drawImage(im,(W-im.width*k)/2,(H-im.height*k)/2,im.width*k,im.height*k);const m=mask.getContext('2d');m.clearRect(0,0,W,H);m.fillRect(0,0,W,H);return}skinPath(c);c.fillStyle=S.tone;c.fill();
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.18)');c.fillStyle=g;c.fill();
 c.save();skinPath(c);c.clip();c.globalAlpha=.06;for(let i=0;i<2500;i++){c.fillStyle=i%2?'#000':'#fff';c.fillRect(Math.random()*W,Math.random()*H,1.5,1.5)}c.restore();
 const m=mask.getContext('2d');m.clearRect(0,0,W,H);skinPath(m);m.fill()}
// ---- stencils: each returns stroke path list drawn into context, plus kind (line|fill)
const cx=500,cy=350;
const LESSONS=[
 {n:'1. Straight lines',tip:'Liner needle, depth 4–6. Pull lines smoothly in one motion.',d:c=>{for(let i=0;i<4;i++){c.moveTo(250,280+i*50);c.lineTo(750,280+i*50)}}},
 {n:'2. Circles',tip:'Turn your wrist, not your arm. Keep the speed steady.',d:c=>{[60,110].forEach(r=>{c.moveTo(cx+r,cy);c.arc(cx,cy,r,0,7)})}},
 {n:'3. Shading gradient',tip:'Shader or magnum. Pack the left side dark, fade out to the right.',fill:1,d:c=>{c.rect(300,290,400,120)}},
 {n:'4. Lettering',tip:'Liner. Trace each letter: COFFEE.',text:'COFFEE'},
 {n:'5. Waves & curves',tip:'Smooth S-curves – the stabiliser is your hand.',d:c=>{for(let k=0;k<2;k++){c.moveTo(250,310+k*80);for(let i=0;i<=500;i+=10)c.lineTo(250+i,310+k*80+Math.sin(i/40)*25)}}},
];
const FLASH=[
 {n:'Coffee cup',tip:'Line it first, then shade the coffee.',d:c=>{c.moveTo(420,300);c.lineTo(440,450);c.quadraticCurveTo(500,480,560,450);c.lineTo(580,300);c.closePath();c.moveTo(580,330);c.arc(600,370,35,-1.4,1.4);c.moveTo(440,300);c.quadraticCurveTo(500,320,560,300);c.moveTo(470,270);c.bezierCurveTo(450,240,490,220,470,190);c.moveTo(520,270);c.bezierCurveTo(500,240,540,220,520,190)}},
 {n:'Anchor',d:c=>{c.moveTo(cx,230);c.lineTo(cx,470);c.moveTo(cx+18,215);c.arc(cx,215,18,0,7);c.moveTo(450,290);c.lineTo(550,290);c.moveTo(410,400);c.quadraticCurveTo(430,480,cx,470);c.quadraticCurveTo(570,480,590,400);c.moveTo(395,415);c.lineTo(410,400);c.lineTo(425,418);c.moveTo(575,418);c.lineTo(590,400);c.lineTo(605,415)}},
 {n:'Dagger',d:c=>{c.moveTo(cx,180);c.lineTo(525,380);c.lineTo(475,380);c.closePath();c.moveTo(430,380);c.lineTo(570,380);c.lineTo(570,395);c.lineTo(430,395);c.closePath();c.rect(488,395,24,80);c.moveTo(512,495);c.arc(cx,495,12,0,7)}},
 {n:'Heart & banner',d:c=>{c.moveTo(cx,440);c.bezierCurveTo(380,360,400,250,cx,300);c.bezierCurveTo(600,250,620,360,cx,440);c.moveTo(360,350);c.lineTo(640,350);c.lineTo(620,390);c.lineTo(380,390);c.closePath()}},
 {n:'Star',d:c=>{for(let i=0;i<=10;i++){const r=i%2?55:130,a=-Math.PI/2+i*Math.PI/5;c[i?'lineTo':'moveTo'](cx+Math.cos(a)*r,cy+Math.sin(a)*r)}}},
 {n:'Lightning bolt',d:c=>{c.moveTo(540,180);c.lineTo(440,370);c.lineTo(510,370);c.lineTo(460,530);c.lineTo(580,320);c.lineTo(505,320);c.closePath()}},
 {n:'Swooping bird',d:c=>{c.moveTo(380,360);c.quadraticCurveTo(450,300,500,340);c.quadraticCurveTo(560,240,660,260);c.quadraticCurveTo(570,300,540,360);c.quadraticCurveTo(600,380,640,430);c.quadraticCurveTo(560,410,500,380);c.quadraticCurveTo(440,400,380,360)}},
 {n:'Mountain & sun',d:c=>{c.moveTo(360,450);c.lineTo(460,300);c.lineTo(520,380);c.lineTo(570,320);c.lineTo(650,450);c.closePath();c.moveTo(600,260);c.arc(570,260,30,0,7)}},
 {n:'Rose',tip:'Line the petals first, then shade from the centre out.',d:c=>{c.moveTo(cx+30,300);c.arc(cx,300,30,0,7);c.moveTo(cx+70,300);c.bezierCurveTo(cx+80,230,cx-80,230,cx-70,300);c.bezierCurveTo(cx-80,370,cx+80,370,cx+70,300);c.moveTo(cx+105,300);c.bezierCurveTo(cx+120,200,cx-120,200,cx-105,300);c.bezierCurveTo(cx-110,400,cx+110,400,cx+105,300);c.moveTo(cx,395);c.quadraticCurveTo(cx+10,480,cx-10,560);c.moveTo(cx+4,470);c.quadraticCurveTo(cx+70,430,cx+90,470);c.quadraticCurveTo(cx+50,500,cx+4,470)}},
 {n:'Skull',d:c=>{c.moveTo(cx-110,330);c.bezierCurveTo(cx-120,180,cx+120,180,cx+110,330);c.quadraticCurveTo(cx+110,390,cx+70,410);c.lineTo(cx+70,460);c.lineTo(cx-70,460);c.lineTo(cx-70,410);c.quadraticCurveTo(cx-110,390,cx-110,330);c.moveTo(cx-15,330);c.arc(cx-50,330,35,0,7);c.moveTo(cx+85,330);c.arc(cx+50,330,35,0,7);c.moveTo(cx,370);c.lineTo(cx-15,400);c.lineTo(cx+15,400);c.closePath();for(let i=-45;i<=45;i+=30){c.moveTo(cx+i,430);c.lineTo(cx+i,460)}}},
 {n:'Oyster & pearl',tip:'Line the shell ridges, then shade the pearl softly with the shader.',d:c=>{c.moveTo(cx-160,380);c.quadraticCurveTo(cx,520,cx+160,380);c.quadraticCurveTo(cx,440,cx-160,380);c.moveTo(cx-160,370);c.quadraticCurveTo(cx-120,200,cx,190);c.quadraticCurveTo(cx+120,200,cx+160,370);for(let i=-3;i<=3;i++){c.moveTo(cx,370);c.quadraticCurveTo(cx+i*30,280,cx+i*45,215)}c.moveTo(cx+38,385);c.arc(cx,385,38,0,7)}},
 {n:'Cherries',d:c=>{c.moveTo(cx-20,420);c.arc(cx-60,420,40,0,7);c.moveTo(cx+110,440);c.arc(cx+70,440,40,0,7);c.moveTo(cx-60,380);c.quadraticCurveTo(cx-40,280,cx+20,230);c.moveTo(cx+70,400);c.quadraticCurveTo(cx+60,300,cx+20,230);c.moveTo(cx+20,230);c.quadraticCurveTo(cx+90,190,cx+130,230);c.quadraticCurveTo(cx+70,250,cx+20,230)}},
 {n:'Butterfly',d:c=>{c.moveTo(cx,270);c.lineTo(cx,450);c.moveTo(cx,290);c.bezierCurveTo(cx-60,170,cx-220,200,cx-170,320);c.quadraticCurveTo(cx-140,360,cx,350);c.bezierCurveTo(cx-150,360,cx-170,480,cx-90,470);c.quadraticCurveTo(cx-30,460,cx,380);c.moveTo(cx,290);c.bezierCurveTo(cx+60,170,cx+220,200,cx+170,320);c.quadraticCurveTo(cx+140,360,cx,350);c.bezierCurveTo(cx+150,360,cx+170,480,cx+90,470);c.quadraticCurveTo(cx+30,460,cx,380);c.moveTo(cx,270);c.quadraticCurveTo(cx-20,220,cx-40,210);c.moveTo(cx,270);c.quadraticCurveTo(cx+20,220,cx+40,210)}},
 {n:'Cross with rays',tip:'Classic blue or red cross. Pick blue or red ink to colour it in.',d:c=>{c.rect(cx-22,190,44,330);c.rect(cx-100,265,200,44);for(let i=0;i<12;i++){const a=i*Math.PI/6;c.moveTo(cx+Math.cos(a)*130,287+Math.sin(a)*130);c.lineTo(cx+Math.cos(a)*170,287+Math.sin(a)*170)}}},
 {n:'Corset & ribbon',d:c=>{c.moveTo(cx-110,200);c.quadraticCurveTo(cx-70,340,cx-110,500);c.lineTo(cx+110,500);c.quadraticCurveTo(cx+70,340,cx+110,200);c.quadraticCurveTo(cx,230,cx-110,200);c.moveTo(cx-12,215);c.lineTo(cx-12,500);c.moveTo(cx+12,215);c.lineTo(cx+12,500);for(let y=240;y<=470;y+=38){c.moveTo(cx-12,y);c.lineTo(cx+12,y+19);c.moveTo(cx+12,y);c.lineTo(cx-12,y+19)}c.moveTo(cx,500);c.quadraticCurveTo(cx-60,560,cx-40,600);c.moveTo(cx,500);c.quadraticCurveTo(cx+60,560,cx+40,600)}},
 {n:'Swallow',d:c=>{c.moveTo(cx-170,300);c.quadraticCurveTo(cx-60,280,cx-20,330);c.quadraticCurveTo(cx+40,260,cx+80,280);c.quadraticCurveTo(cx+60,300,cx+70,320);c.quadraticCurveTo(cx+190,300,cx+220,250);c.quadraticCurveTo(cx+180,360,cx+60,370);c.lineTo(cx+120,470);c.lineTo(cx+50,400);c.lineTo(cx+20,480);c.quadraticCurveTo(cx,400,cx-20,370);c.quadraticCurveTo(cx-120,360,cx-170,300)}},
 {n:'Moon & stars',d:c=>{c.moveTo(cx+40,200);c.arc(cx,340,140,-1.3,1.3,true);c.quadraticCurveTo(cx-50,340,cx+40,200);[[cx+120,250,22],[cx+150,380,16],[cx+90,450,12]].forEach(([a,b,r])=>{for(let i=0;i<=10;i++){const q=r*(i%2?.45:1),t=-Math.PI/2+i*Math.PI/5;c[i?'lineTo':'moveTo'](a+Math.cos(t)*q,b+Math.sin(t)*q)}})}},
 {n:'Life drawing figure',tip:'Fine line figure. Use the liner at depth 4 and keep a steady pace.',d:c=>{c.moveTo(cx+28,190);c.arc(cx,190,28,0,7);c.moveTo(cx,218);c.quadraticCurveTo(cx-20,300,cx+5,360);c.quadraticCurveTo(cx+40,420,cx-10,470);c.lineTo(cx-60,600);c.moveTo(cx+5,360);c.quadraticCurveTo(cx+60,450,cx+60,600);c.moveTo(cx-5,250);c.quadraticCurveTo(cx-80,300,cx-90,380);c.moveTo(cx-2,250);c.quadraticCurveTo(cx+70,260,cx+60,180)}},
];
function cur(){return S.mode=='custom'?S.custom:S.mode=='lesson'?LESSONS[S.pick]:S.mode=='flash'?FLASH[S.pick]:null}
function tracePath(c,t){c.beginPath();if(t.text){c.font='bold 130px Georgia,serif';c.textAlign='center';c.textBaseline='middle';return 'text'}t.d(c);return 'path'}
function drawStencil(){const c=sten.getContext('2d');c.clearRect(0,0,W,H);const t=cur();if(!t)return;
 c.save();skinPath(c);c.clip();if(t.img){c.globalAlpha=.75;c.drawImage(tint(t.img),0,0);c.restore();return}c.strokeStyle='rgba(60,70,200,.75)';c.lineWidth=3;c.setLineDash(t.fill?[8,6]:[]);
 if(tracePath(c,t)=='text'){c.strokeText(t.text,cx,cy)}else c.stroke();c.restore()}
// target mask for scoring
function targetMask(){const c=mk(),g=c.getContext('2d');g.strokeStyle=g.fillStyle='#000';g.lineWidth=16;g.lineJoin=g.lineCap='round';const t=cur();if(t.img){g.drawImage(t.img,0,0);g.drawImage(t.img,2,0);g.drawImage(t.img,0,2);g.drawImage(t.img,-2,0);g.drawImage(t.img,0,-2);return g.getImageData(0,0,W,H).data}
 if(tracePath(g,t)=='text'){g.lineWidth=12;g.strokeText(t.text,cx,cy)}else if(t.fill)g.fill();else g.stroke();return g.getImageData(0,0,W,H).data}
function render(){x.drawImage(skin,0,0);if($('stc').checked)x.drawImage(sten,0,0);x.drawImage(ink,0,0)}
// ---- gun
let AC,osc,gain,down=false,last=null,lastT=0;
function buzz(on){if(!$('snd').checked){on=false}try{if(on){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(!osc){osc=AC.createOscillator();gain=AC.createGain();osc.type='sawtooth';osc.connect(gain);gain.connect(AC.destination);gain.gain.value=.04;osc.start()}osc.frequency.value=60+S.speed*14}else if(osc){osc.stop();osc=null}}catch(e){}
 if($('vib').checked&&navigator.vibrate){try{navigator.vibrate(on?[400,30,400,30,400,30,400]:0)}catch(e){}}}
function inSkin(px,py){return mask.getContext('2d').getImageData(px|0,py|0,1,1).data[3]>0}
function dot(px,py,handSpeed){if(!inSkin(px,py))return;const n=S.needle,d=S.depth,col=S.ink;
 const base=(n=='liner'?2.4:n=='shader'?5:8)*S.pr;let a=n=='liner'?.9:n=='shader'?.25:.18;
 const coverage=Math.min(1,S.speed/(handSpeed*0.9+1));// fast hand + slow machine = gaps
 if(d<=3){if(Math.random()>0.35+d*0.12)return;a*=.5}
 if(Math.random()>coverage)return;
 ik.globalAlpha=a*Math.min(1,0.6+d*0.08);ik.fillStyle=col;
 if(n=='magnum'){for(let i=0;i<5;i++){ik.beginPath();ik.arc(px+(i-2)*base*.6,py+(Math.random()-.5)*2,base*.45,0,7);ik.fill()}}
 else{ik.beginPath();ik.arc(px+(Math.random()-.5),py+(Math.random()-.5),base*(0.8+d*0.04),0,7);ik.fill()}
 if(d>=8){// blowout: ink spreads under the skin as a blurry halo
  const r=base*(2+(d-7)*1.6);const g=ik.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');ik.globalAlpha=.25*(d-7);ik.fillStyle=g;ik.beginPath();ik.arc(px,py,r,0,7);ik.fill()}
 ik.globalAlpha=1}
function pos(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}S.pr=e.pointerType=='pen'&&e.pressure>0?0.5+e.pressure:1;S.undo.push(ik.getImageData(0,0,W,H));if(S.undo.length>20)S.undo.shift();S.redo.length=0;down=true;last=pos(e);lastT=performance.now();buzz(true);dot(last.x,last.y,0);render()});
cv.addEventListener('pointermove',e=>{if(!down)return;if(e.pointerType=='pen'&&e.pressure>0)S.pr=0.5+e.pressure;const p=pos(e),now=performance.now(),dist=Math.hypot(p.x-last.x,p.y-last.y),hs=dist/Math.max(1,now-lastT)*10;
 const steps=Math.max(1,dist/1.2|0);for(let i=1;i<=steps;i++)dot(last.x+(p.x-last.x)*i/steps,last.y+(p.y-last.y)*i/steps,hs);
 $('status').textContent=hs>S.speed*1.3?'Slow down. Your hand is faster than the machine – lines go patchy.':'Nice steady pace.';last=p;lastT=now;render()});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{if(down){down=false;buzz(false);autosave()}}));
// ---- scoring
function score(){const t=cur(),d=ik.getImageData(0,0,W,H).data;
 if(!t){let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)n++;$('result').innerHTML=`Free draw – <b>${n}</b> pixels inked. Save it as PNG to show it off.`;return}
 const m=targetMask();let inkT=0,inkIn=0,tgt=0,hit=0;for(let i=3;i<d.length;i+=4){const a=d[i]>40,tm=m[i]>0;if(tm)tgt++;if(a){inkT++;if(tm)inkIn++}if(a&&tm)hit++}
 if(!inkT){$('result').innerHTML='No ink yet – hold down on the skin to tattoo.';return}
 const acc=Math.round(inkIn/inkT*100),cov=Math.round(hit/Math.max(1,tgt)*100),total=Math.round(acc*.55+cov*.45);
 const notes=[];if(S.depth>=8)notes.push('Too deep – blowouts blur your lines.');if(S.depth<=3)notes.push('Too shallow – ink is patchy and would fade.');if(acc<60)notes.push('Lots of ink outside the stencil.');if(cov<50)notes.push('Parts of the stencil are still bare.');
 const stars='★'.repeat(Math.max(1,Math.round(total/20)))+'☆'.repeat(5-Math.max(1,Math.round(total/20)));
 $('result').innerHTML=`<b>${stars} ${total}/100</b><br>Accuracy ${acc}% • Stencil covered ${cov}%<br>${notes.join(' ')||'Clean work.'}`;
 try{const k='cb_tattoo_best',b=JSON.parse(localStorage.getItem(k)||'{}'),id=S.mode+S.pick;if(!b[id]||total>b[id]){b[id]=total;localStorage.setItem(k,JSON.stringify(b))}}catch(e){}
 return total}
// ---- UI
function fillPick(){const p=$('pick'),L=S.mode=='lesson'?LESSONS:S.mode=='flash'?FLASH:[];p.innerHTML='';p.style.display=L.length?'':'none';L.forEach((t,i)=>p.add(new Option(t.n,i)));S.pick=0;upd()}
function upd(){S.undo.push(ik.getImageData(0,0,W,H));ik.clearRect(0,0,W,H);$('result').innerHTML='';const t=cur();$('tip').textContent=t?(t.tip||'Line the outline with the liner, then shade inside.'):'Free draw – tattoo anything you like on the skin.';drawStencil();render()}
$('pick').onchange=e=>{S.pick=+e.target.value;upd()};
[['mLesson','lesson'],['mFlash','flash'],['mFree','free']].forEach(([id,m])=>$(id).onclick=()=>{S.mode=m;['mLesson','mFlash','mFree'].forEach(b=>$(b).classList.toggle('on',b==id));fillPick()});
$('part').onchange=e=>{S.part=e.target.value;drawSkin();drawStencil();render()};
function sw(el,list,key){list.forEach((c,i)=>{const b=document.createElement('button');b.className='sw'+(S[key]==c?' on':'');b.style.background=c;b.title=c;b.onclick=()=>{S[key]=c;[...el.children].forEach(z=>z.classList.toggle('on',z==b));if(key=='tone'){drawSkin();drawStencil();render()}};el.appendChild(b)})}
sw($('tones'),TONES,'tone');sw($('inks'),INKS,'ink');
document.querySelectorAll('#needles button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#needles button').forEach(z=>z.classList.toggle('on',z==b));S.needle=b.dataset.n});
$('sp').oninput=e=>{S.speed=+e.target.value;$('spV').textContent=S.speed};
$('dp').oninput=e=>{S.depth=+e.target.value;$('dpV').textContent=S.depth;$('dpTip').textContent=S.depth>=8?'Too deep – blowout':S.depth<=3?'Too shallow – patchy':'Just right'};
$('stc').onchange=render;$('score').onclick=score;$('wipe').onclick=()=>{S.undo.push(ik.getImageData(0,0,W,H));ik.clearRect(0,0,W,H);$('result').innerHTML='';render();autosave()};
$('undo').onclick=()=>{const u=S.undo.pop();if(u){S.redo.push(ik.getImageData(0,0,W,H));ik.putImageData(u,0,0);render();autosave()}};
$('redo').onclick=()=>{const r=S.redo.pop();if(r){S.undo.push(ik.getImageData(0,0,W,H));ik.putImageData(r,0,0);render();autosave()}};
$('png').onclick=()=>{const c=mk();const g=c.getContext('2d');g.drawImage(cv,0,0);stampLogo(g,W,H);dl(c,'coffeebreak-tattoo-practice.png')};
// ---- Coffeebreak extras: logo on saves, transfer stencils, 1000 colours, your words, picture to stencil, skin photo, autosave
const LOGO=new Image();LOGO.src='cb-plus-logo.png';
function stampLogo(g,w,h){try{if(LOGO.complete&&LOGO.naturalWidth){const lw=w*.13,lh=lw*LOGO.naturalHeight/LOGO.naturalWidth;g.globalAlpha=.9;g.drawImage(LOGO,w-lw-w*.02,h-lh-w*.02,lw,lh);g.globalAlpha=1}g.fillStyle='rgba(0,0,0,.55)';g.font='14px system-ui,sans-serif';g.textAlign='left';g.fillText("\u00a9 Karen O'Brien (Coffeebreak)",12,h-12)}catch(e){}}
function dl(c,name){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=name;a.dataset.cbpDone=1;document.body.appendChild(a);a.click();a.remove()}
function outline(t,g,lw){g.save();g.strokeStyle=g.fillStyle='#000';g.lineWidth=lw||4;g.lineJoin=g.lineCap='round';
 if(t.img){g.drawImage(t.img,0,0)}else if(tracePath(g,t)=='text'){g.strokeText(t.text,cx,cy)}else g.stroke();g.restore()}
function inkCount(){const d=ik.getImageData(0,0,W,H).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]>40)n++;return n}
function stencilCanvas(mirror){const c=mk(),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);const t=cur();
 const tmp=mk(),tg=tmp.getContext('2d');
 if(inkCount()>50){const d=ik.getImageData(0,0,W,H),o=tg.createImageData(W,H);for(let i=0;i<d.data.length;i+=4){if(d.data[i+3]>40){o.data[i+3]=255}}tg.putImageData(o,0,0)}
 else if(t)outline(t,tg,4);else return null;
 g.save();if(mirror){g.translate(W,0);g.scale(-1,1)}g.drawImage(tmp,0,0);g.restore();
 g.fillStyle='#000';g.font='13px system-ui,sans-serif';g.textAlign='left';g.fillText((mirror?'Mirrored transfer stencil':'Transfer stencil')+' – Coffeebreak – '+(t?t.n:'Your design'),12,22);stampLogo(g,W,H);return c}
function stencilOut(mirror){const c=stencilCanvas(mirror);if(!c){$('result').textContent='Pick a stencil or ink a design first.';return}dl(c,'coffeebreak-transfer-stencil'+(mirror?'-mirrored':'')+'.png');$('result').textContent='Transfer stencil saved. Print it on stencil or thermal paper.'}
$('stencilPng').onclick=()=>stencilOut(false);$('stencilMir').onclick=()=>stencilOut(true);
$('flashSheet').onclick=()=>{const all=FLASH,cols=4,rows=Math.ceil(all.length/cols),cw=500,ch=350,c=document.createElement('canvas');c.width=cols*cw;c.height=rows*ch+60;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
 const mir=$('sheetMir').checked;all.forEach((t,i)=>{const tmp=mk(),tg=tmp.getContext('2d');outline(t,tg,6);g.save();g.translate((i%cols)*cw+(mir?cw:0),((i/cols)|0)*ch+40);if(mir)g.scale(-1,1);g.drawImage(tmp,0,0,cw,ch);g.restore();g.fillStyle='#000';g.font='16px system-ui';g.textAlign='left';g.fillText(t.n,(i%cols)*cw+10,((i/cols)|0)*ch+60)});
 g.font='bold 22px system-ui';g.fillText('Coffeebreak flash sheet – transfer ready'+(mir?' (mirrored)':''),12,28);stampLogo(g,c.width,c.height);dl(c,'coffeebreak-flash-sheet'+(mir?'-mirrored':'')+'.png')};
function setInk(c){S.ink=c;[...$('inks').children].forEach(z=>z.classList.toggle('on',z.title==c));$('inkPick').value=c;$('inkNow').style.background=c}
(function(){const P=$('pal1000');let html='';for(let h=0;h<40;h++)for(let k=0;k<25;k++){const sat=[100,80,60,40,20][k%5],li=[20,35,50,65,80][(k/5)|0];const c=hsl(h*9,sat,li);html+='<button class="p1k" style="background:'+c+'" title="'+c+'" data-c="'+c+'"></button>'}
 P.innerHTML=html;P.onclick=e=>{const c=e.target.dataset&&e.target.dataset.c;if(c)setInk(c)}})();
function hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));const x=v=>Math.round(v*255).toString(16).padStart(2,'0');return '#'+x(f(0))+x(f(8))+x(f(4))}
$('inkPick').oninput=e=>setInk(e.target.value);$('tonePick').oninput=e=>{S.tone=e.target.value;[...$('tones').children].forEach(z=>z.classList.remove('on'));drawSkin();drawStencil();render()};
$('wordsGo').onclick=()=>{const v=$('words').value.trim().slice(0,24);if(!v)return;S.custom={n:'Your words: '+v,text:v,tip:'Liner needle. Trace each letter slowly.'};S.mode='custom';['mLesson','mFlash','mFree'].forEach(b=>$(b).classList.remove('on'));$('pick').style.display='none';upd()};
$('picSten').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const c=mk(),g=c.getContext('2d'),k=Math.min(W*.8/im.width,H*.8/im.height),w=im.width*k,h=im.height*k;g.drawImage(im,(W-w)/2,(H-h)/2,w,h);
 const d=g.getImageData(0,0,W,H),o=g.createImageData(W,H),L=new Float32Array(W*H);for(let i=0;i<W*H;i++)L[i]=d.data[i*4]*.3+d.data[i*4+1]*.59+d.data[i*4+2]*.11;
 const th=+$('picDetail').value;for(let y=1;y<H-1;y++)for(let x0=1;x0<W-1;x0++){const i=y*W+x0;if(!d.data[i*4+3])continue;const gx=L[i+1]-L[i-1],gy=L[i+W]-L[i-W];if(Math.hypot(gx,gy)>th){o.data[i*4+3]=255}}
 g.clearRect(0,0,W,H);g.putImageData(o,0,0);S.custom={n:'Your picture',img:c,tip:'Your picture turned into a line stencil. Trace it with the liner.'};S.mode='custom';['mLesson','mFlash','mFree'].forEach(b=>$(b).classList.remove('on'));$('pick').style.display='none';upd();URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f)};
$('skinPhoto').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{S.photo=im;S.part='photo';let o=$('part').querySelector('option[value=photo]');if(!o){o=new Option('My skin photo','photo');$('part').add(o)}$('part').value='photo';drawSkin();drawStencil();render()};im.src=URL.createObjectURL(f)};
let asT;function autosave(){clearTimeout(asT);asT=setTimeout(()=>{try{localStorage.setItem('cb_tattoo_ink',ink.toDataURL('image/png'))}catch(e){}},300)}
function restore(){try{const v=localStorage.getItem('cb_tattoo_ink');if(!v)return;const im=new Image();im.onload=()=>{ik.drawImage(im,0,0);render();$('status').textContent='Your last design was restored. Wipe skin to start fresh.'};im.src=v}catch(e){}}
function tint(img){const c=mk(),g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle='rgb(60,70,200)';g.fillRect(0,0,W,H);return c}
drawSkin();fillPick();restore();
window.CBTattoo={S,score,render,LESSONS,FLASH,stencilCanvas,cur};
})();
