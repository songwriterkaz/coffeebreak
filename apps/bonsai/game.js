// Grow a Bonsai – canvas game. Saves to localStorage.
(function(){
const $=id=>document.getElementById(id);const cv=$('gc'),cx=cv.getContext('2d');const W=cv.width,H=cv.height;
const SP={juniper:{n:'Juniper',leaf:'needle',c:['#3f7a3a','#5d9a48'],thirst:18,grow:1.0,bark:'#7b5236',angle:.55},
elm:{n:'Chinese Elm',leaf:'small',c:['#4f8f35','#79b04a'],thirst:24,grow:1.25,bark:'#8a7a68',angle:.6,decid:1},
maple:{n:'Japanese Maple',leaf:'palm',c:['#5c9b3a','#8cc152'],autumn:['#c0392b','#e67e22'],thirst:28,grow:1.15,bark:'#6e6259',angle:.5,decid:1},
ficus:{n:'Ficus',leaf:'broad',c:['#2f6b2c','#4c8c3c'],thirst:22,grow:1.35,bark:'#9c8f80',angle:.7},
pine:{n:'Japanese Black Pine',leaf:'pine',c:['#2c5a34','#3f7444'],thirst:14,grow:.8,bark:'#4f3a2b',angle:.45}};
const SEAS=['Spring','Summer','Autumn','Winter'],POTS=['Nursery pot','Glazed oval pot','Handmade cream pot'];
const ACH={first:'🌱 First sprout',week:'📅 One week old',month:'🗓️ One month old',prune10:'✂️ 10 cuts',wire5:'🧵 Wired 5 branches',repot:'🪴 Repotted',beauty70:'🏆 Beauty 70+',beauty90:'👑 Master bonsai (90+)',healthy:'💚 Perfect health 7 days',year:'🎋 Survived a full year'};
const KEY='cb_bonsai_game_v2';let G=null,mode='prune';
function rnd(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
function newTree(sp){G={sp,day:1,water:70,food:60,health:90,beauty:20,pot:0,potDays:0,cuts:0,wires:0,goodDays:0,ach:{first:1},seed:(Math.random()*1e9|0)+1,br:[],next:1,log:['You planted a '+SP[sp].n+'. Water it and come back each day!']};
 G.br.push({id:0,p:-1,a:-Math.PI/2,l:70,w:16,d:0,wire:0});grow(2);save();draw();ui()}
function kids(id){return G.br.filter(b=>b.p==id)}
function tips(){return G.br.filter(b=>!kids(b.id).length&&!b.cut)}
function grow(n){const r=rnd(G.seed+G.day*7),s=SP[G.sp],maxD=5+G.pot;
 for(let k=0;k<n;k++)tips().forEach(t=>{if(t.d>=maxD){t.l=Math.min(t.l*1.04,t.l+3);return}
  const c=r()<.75?2:1;for(let i=0;i<c;i++){const sp=(c==1?0:(i?1:-1))*s.angle*(0.6+r()*.7);
   G.br.push({id:G.next++,p:t.id,a:t.a+sp+(r()-.5)*.35,l:t.l*(0.7+r()*.12),w:Math.max(1.5,t.w*.68),d:t.d+1,wire:0})}})}
function pos(){const P={};G.br.forEach(b=>{let x,y;if(b.p<0){x=W/2;y=H-110}else{const q=P[b.p];x=q.x2;y=q.y2}
 const a=b.wire?b.a*.6+(b.a<-Math.PI/2?-Math.PI*.82:-Math.PI*.18)*.4:b.a;P[b.id]={x1:x,y1:y,x2:x+Math.cos(a)*b.l*.9,y2:y+Math.sin(a)*b.l*.9,b,a}});return P}
function alive(b){let x=b;while(x){if(x.cut)return false;x=G.br.find(y=>y.id==x.p)}return true}
function season(){return SEAS[Math.floor((G.day-1)/7)%4]}
function draw(){const s=SP[G.sp],se=season();
 const sky=cx.createLinearGradient(0,0,0,H);sky.addColorStop(0,{Spring:'#dff0d8',Summer:'#cfe8f5',Autumn:'#f3e2c4',Winter:'#e6ebee'}[se]);sky.addColorStop(1,'#f8f3e6');cx.fillStyle=sky;cx.fillRect(0,0,W,H);
 cx.fillStyle='#ffffff55';for(let i=0;i<5;i++){cx.beginPath();cx.ellipse(80+i*170,60+(i%2)*30,60,18,0,0,7);cx.fill()}
 // shoji wall + bench
 cx.fillStyle='#6b4a2f';cx.fillRect(0,H-58,W,58);cx.fillStyle='#8a6240';cx.fillRect(0,H-62,W,10);
 for(let i=0;i<W;i+=40){cx.fillStyle='#5a3d26';cx.fillRect(i,H-52,3,52)}
 if(se=='Winter'){cx.fillStyle='#fff';const r=rnd(G.day);for(let i=0;i<60;i++){cx.beginPath();cx.arc(r()*W,r()*(H-70),1.5+r()*2,0,7);cx.fill()}}
 if(se=='Spring'){const r=rnd(G.day+3);cx.fillStyle='#fffbe8';for(let i=0;i<25;i++){cx.beginPath();cx.arc(r()*W,r()*(H-80),2.5,0,7);cx.fill()}}
 const P=pos();
 // branches
 G.br.forEach(b=>{if(!alive(b))return;const p=P[b.id];cx.strokeStyle=s.bark;cx.lineCap='round';cx.lineWidth=b.w;
  cx.beginPath();cx.moveTo(p.x1,p.y1);const mx=(p.x1+p.x2)/2+Math.sin(b.id)*b.l*.08,my=(p.y1+p.y2)/2;cx.quadraticCurveTo(mx,my,p.x2,p.y2);cx.stroke();
  if(b.w>5){cx.strokeStyle='#00000022';cx.lineWidth=b.w*.3;cx.beginPath();cx.moveTo(p.x1+b.w*.2,p.y1);cx.lineTo(p.x2+b.w*.15,p.y2);cx.stroke()}
  if(b.wire){cx.strokeStyle='#c27a3a';cx.lineWidth=1.6;const n=8;for(let i=0;i<n;i++){const t=i/n,x=p.x1+(p.x2-p.x1)*t,y=p.y1+(p.y2-p.y1)*t;cx.beginPath();cx.ellipse(x,y,b.w*.7+1,2,p.a+1.57,0,7);cx.stroke()}}});
 // foliage
 const bare=s.decid&&se=='Winter',cols=(se=='Autumn'&&s.autumn)?s.autumn:(se=='Autumn'&&s.decid?['#b8a03a','#d9b84a']:s.c);
 const hf=G.health/100;
 tips().filter(alive).forEach(t=>{const p=P[t.id],r=rnd(t.id*31+1),size=(10+t.d*1.5)*(0.6+hf*.5);
  if(bare){cx.fillStyle='#6e625966';cx.beginPath();cx.arc(p.x2,p.y2,2,0,7);cx.fill();return}
  for(let i=0;i<9;i++){const ox=(r()-.5)*size*2.2,oy=(r()-.7)*size*1.2;cx.fillStyle=cols[i%2];cx.globalAlpha=.55+hf*.4;
   if(s.leaf=='pine'||s.leaf=='needle'){cx.strokeStyle=cols[i%2];cx.lineWidth=1.3;for(let k=0;k<7;k++){const a=-Math.PI+k*Math.PI/6;cx.beginPath();cx.moveTo(p.x2+ox,p.y2+oy);cx.lineTo(p.x2+ox+Math.cos(a)*size*.6,p.y2+oy+Math.sin(a)*size*.45);cx.stroke()}}
   else if(s.leaf=='palm'){star(p.x2+ox,p.y2+oy,size*.42)}
   else{cx.beginPath();cx.ellipse(p.x2+ox,p.y2+oy,size*(s.leaf=='broad'?.5:.32),size*(s.leaf=='broad'?.3:.2),r()*3,0,7);cx.fill()}}
  cx.globalAlpha=1});
 // pot
 const px=W/2,py=H-110,pw=[150,190,210][G.pot],pc=[['#6b4a2f','#4f3522'],['#2f5d50','#21443a'],['#efe6cf','#cbbd98']][G.pot];
 cx.fillStyle='#4a3626';cx.beginPath();cx.ellipse(px,py,pw/2-6,10,0,0,7);cx.fill();
 const g=cx.createLinearGradient(px-pw/2,0,px+pw/2,0);g.addColorStop(0,pc[1]);g.addColorStop(.4,pc[0]);g.addColorStop(1,pc[1]);cx.fillStyle=g;
 cx.beginPath();cx.moveTo(px-pw/2,py);cx.lineTo(px+pw/2,py);cx.lineTo(px+pw/2-14,py+42);cx.lineTo(px-pw/2+14,py+42);cx.closePath();cx.fill();
 cx.fillStyle=pc[1];cx.fillRect(px-pw/2+18,py+42,14,8);cx.fillRect(px+pw/2-32,py+42,14,8);
 cx.fillStyle='#5b8f3c';for(let i=-3;i<=3;i++){cx.beginPath();cx.arc(px+i*16,py-3,6,Math.PI,0);cx.fill()}
 if(G.water<25){cx.fillStyle='#b5481a';cx.font='bold 18px system-ui';cx.textAlign='center';cx.fillText('💧 Thirsty!',px,40)}
 cx.fillStyle='#2b3a26';cx.font='bold 16px system-ui';cx.textAlign='left';cx.fillText(`Day ${G.day} • ${se} • ${SP[G.sp].n}`,14,24);
 function star(x,y,r){cx.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,rr=k%2?r*.45:r;cx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}cx.closePath();cx.fill()}}
function score(){const t=tips().filter(alive),P=pos();if(!t.length)return 0;
 const xs=t.map(b=>P[b.id].x2),ys=t.map(b=>P[b.id].y2),cxm=xs.reduce((a,b)=>a+b,0)/xs.length;
 const bal=1-Math.min(1,Math.abs(cxm-W/2)/120),spread=Math.min(1,(Math.max(...xs)-Math.min(...xs))/320),dens=Math.min(1,t.length/26),over=Math.max(0,t.length-60)/60,
 tall=Math.min(1,(H-110-Math.min(...ys))/300),wired=Math.min(1,G.br.filter(b=>b.wire&&alive(b)).length/6);
 return Math.round(Math.max(0,Math.min(100,(bal*22+spread*20+dens*18+tall*10+wired*15+G.pot*5+Math.min(G.cuts,12))*(G.health/100)*(1-over*.6))))}
function act(k){const s=SP[G.sp];
 if(k=='water'){if(G.water>90){G.health-=4;msg('Too much water – roots don’t like wet feet.')}G.water=Math.min(110,G.water+35);msg('💧 Watered.')}
 if(k=='feed'){if(season()=='Winter'){G.health-=3;msg('Trees rest in winter – fertiliser can burn the roots now.')}else if(G.food>85){G.health-=6;msg('Over-fertilised! Go easy.')}else msg('🌿 Fertilised.');G.food=Math.min(100,G.food+30)}
 if(k=='repot'){if(season()!='Spring'){msg('Repot in Spring for the best result.');G.health-=5}else{msg('🪴 Repotted into a '+POTS[Math.min(2,G.pot+1)]+'.');G.health-=8;G.ach.repot=1}G.pot=Math.min(2,G.pot+1);G.potDays=0}
 if(k=='day'){G.day++;G.potDays++;G.water-=s.thirst*(season()=='Summer'?1.4:season()=='Winter'?.6:1);G.food-=8;
  let dh=0;if(G.water<10)dh-=15;else if(G.water<30)dh-=5;else if(G.water>100)dh-=4;else dh+=3;if(G.food<15)dh-=4;else dh+=1;if(G.potDays>60)dh-=2;
  G.health=Math.max(0,Math.min(100,G.health+dh));const se=season();
  if(G.health>30&&se!='Winter')grow(s.grow*(se=='Spring'?1.2:1)>=1||Math.random()<s.grow?1:0);
  G.goodDays=G.health>=95?G.goodDays+1:0;if(G.health<=0){msg('🥀 Your tree died. Plant a new one?');}
  else msg('☀️ Day '+G.day+' ('+se+'). Water '+Math.max(0,G.water|0)+'%')}
 G.water=Math.max(0,G.water);G.food=Math.max(0,G.food);G.health=Math.max(0,Math.min(100,G.health));G.beauty=score();achieve();save();draw();ui()}
function achieve(){const a=G.ach;if(G.day>=7)a.week=1;if(G.day>=30)a.month=1;if(G.day>28)a.year=1;
 if(G.cuts>=10)a.prune10=1;if(G.wires>=5)a.wire5=1;if(G.beauty>=70)a.beauty70=1;if(G.beauty>=90)a.beauty90=1;if(G.goodDays>=7)a.healthy=1}
function msg(m){G.log.unshift(m);G.log=G.log.slice(0,6)}
cv.addEventListener('click',e=>{if(!G||G.health<=0)return;const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height,P=pos();
 let best=null,bd=14;G.br.forEach(b=>{if(!alive(b)||b.p<0)return;const p=P[b.id],dx=p.x2-p.x1,dy=p.y2-p.y1,t=Math.max(0,Math.min(1,((x-p.x1)*dx+(y-p.y1)*dy)/(dx*dx+dy*dy))),d=Math.hypot(x-p.x1-t*dx,y-p.y1-t*dy);if(d<bd){bd=d;best=b}});
 if(!best)return;if(mode=='prune'){if(best.d<=1&&!confirm('That’s a main branch – cut it anyway?'))return;best.cut=1;G.cuts++;G.health=Math.max(0,G.health-(best.d<=1?6:1));msg('✂️ Pruned a branch.')}
 else{if(best.w<2.2){msg('Too thin to wire.');}else{best.wire=best.wire?0:1;if(best.wire)G.wires++;msg(best.wire?'🧵 Wired a branch into shape.':'Wire removed.')}}
 G.beauty=score();achieve();save();draw();ui()});
function save(){try{localStorage.setItem(KEY,JSON.stringify(G))}catch(e){}}
function bar(id,v,c){$(id).style.width=Math.max(0,Math.min(100,v))+'%';$(id).style.background=c}
function ui(){$('pick').hidden=!!G;$('play').hidden=!G;if(!G)return;
 bar('bW',G.water,G.water<25?'#c0612b':'#3b82a6');bar('bF',G.food,'#7a9b3a');bar('bH',G.health,G.health<40?'#c0612b':'#3f7a3a');bar('bB',G.beauty,'#b8862f');
 $('nums').textContent=`Water ${G.water|0}% • Food ${G.food|0}% • Health ${G.health|0}% • Beauty ${G.beauty}`;
 $('log').innerHTML=G.log.map(l=>'<li>'+l+'</li>').join('');
 $('ach').innerHTML=Object.entries(ACH).map(([k,v])=>`<span class="${G.ach[k]?'got':''}">${v}</span>`).join('');
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode==mode));
 $('dead').hidden=G.health>0}
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>newTree(b.dataset.sp));
document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act));
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;ui()});
$('restart').onclick=$('restart2').onclick=()=>{if(!G||G.health<=0||confirm('Start a new tree? Your current one will be lost.')){G=null;save();try{localStorage.removeItem(KEY)}catch(e){}ui();preview()}};
function preview(){cx.fillStyle='#f8f3e6';cx.fillRect(0,0,W,H);const keep=G;newPreview();G=keep}
function newPreview(){G={sp:'juniper',day:1,water:70,food:60,health:100,pot:2,br:[{id:0,p:-1,a:-Math.PI/2,l:70,w:16,d:0}],next:1,seed:42,log:[],ach:{}};grow(4);draw();G=null}
try{G=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
if(G){G.beauty=score();draw()}else newPreview();ui();
})();
