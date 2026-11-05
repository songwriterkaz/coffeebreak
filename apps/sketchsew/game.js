const C=document.getElementById('c'),X=C.getContext('2d'),P=document.getElementById('p');
const W=440,H=560;
// ---- sound (calm, mutable)
let muted=localStorage.getItem('ss_mute')==='1',AC=null;
function beep(f=520,d=.15,v=.05){if(muted)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const mb=document.getElementById('mute');function mt(){mb.textContent=muted?'🔇 Sound off':'🔊 Sound on'}mt();mb.onclick=()=>{muted=!muted;localStorage.setItem('ss_mute',muted?'1':'0');mt()};
// ---- data
const BODIES={Petite:{s:.85,w:.9,m:'Bust 82 · Waist 64 · Hip 88 · Height 155 cm'},Classic:{s:1,w:1,m:'Bust 90 · Waist 72 · Hip 96 · Height 168 cm'},Curvy:{s:1,w:1.22,m:'Bust 106 · Waist 88 · Hip 116 · Height 165 cm'},Tall:{s:1.08,w:.95,m:'Bust 88 · Waist 70 · Hip 94 · Height 180 cm'},Plus:{s:1,w:1.4,m:'Bust 120 · Waist 106 · Hip 128 · Height 166 cm'},Broad:{s:1.05,w:1.18,m:'Chest 108 · Waist 92 · Hip 102 · Height 178 cm'}};
// garment polygons in unit coords (x -1..1 around centre, y 0..1 from shoulder to knee-ish)
const G={Tee:[[-.5,0],[-.9,.12],[-.75,.28],[-.48,.2],[-.45,.62],[.45,.62],[.48,.2],[.75,.28],[.9,.12],[.5,0],[.2,0],[0,.08],[-.2,0]],
Dress:[[-.42,0],[-.4,.3],[-.32,.42],[-.7,1],[.7,1],[.32,.42],[.4,.3],[.42,0],[.18,0],[0,.12],[-.18,0]],
Skirt:[[-.36,.4],[-.62,.85],[.62,.85],[.36,.4]],
Pants:[[-.38,.4],[-.5,1.15],[-.18,1.15],[0,.6],[.18,1.15],[.5,1.15],[.38,.4]],
Jacket:[[-.52,0],[-.95,.14],[-.82,.62],[-.6,.6],[-.5,.32],[-.5,.66],[-.04,.66],[0,.18],[.04,.66],[.5,.66],[.5,.32],[.6,.6],[.82,.62],[.95,.14],[.52,0],[.2,0],[0,.18],[-.2,0]],
Hoodie:[[-.52,0],[-.95,.14],[-.8,.64],[-.6,.62],[-.48,.3],[-.48,.66],[.48,.66],[.48,.3],[.6,.62],[.8,.64],[.95,.14],[.52,0],[.3,-.05],[.22,-.14],[0,-.18],[-.22,-.14],[-.3,-.05]]};
const COLS=['#3b2416','#6b4a33','#c8a27a','#f3e6d3','#1f3a5f','#2f6b4f','#a33a2a','#e0b062','#5b3a6b','#111111','#ffffff','#4f7fa8'];
const PATS=['Plain','Stripes','Polka','Check','Floral','Denim'];
let S={body:'Classic',gar:'Dress',strokes:[],fab:'#2f6b4f',pat:'Plain',pat2:'#f3e6d3',path:null,scores:{},mat:'PLA',stage:'sketch'};
let tool={c:'#3b2416',w:6,er:false};
let gal=[];try{gal=JSON.parse(localStorage.getItem('ss_gal')||'[]')}catch(e){}
// geometry
function gpoly(g=S.gar){const b=BODIES[S.body],cx=W/2,top=130,sx=110*b.w,sy=330*b.s;return G[g].map(p=>[cx+p[0]*sx,top+p[1]*sy])}
function pathOf(pts){const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0],q[1]):p.moveTo(q[0],q[1]));p.closePath();return p}
function patFill(ctx,sc=1){const t=document.createElement('canvas');t.width=t.height=24*sc;const k=t.getContext('2d');k.scale(sc,sc);k.fillStyle=S.fab;k.fillRect(0,0,24,24);k.fillStyle=k.strokeStyle=S.pat2;k.lineWidth=3;
 if(S.pat=='Stripes')k.fillRect(0,0,24,6);if(S.pat=='Polka'){k.beginPath();k.arc(6,6,3,0,7);k.arc(18,18,3,0,7);k.fill()}
 if(S.pat=='Check'){k.globalAlpha=.5;k.fillRect(0,0,12,24);k.fillRect(0,0,24,12)}
 if(S.pat=='Floral'){for(let a=0;a<5;a++){k.beginPath();k.arc(12+5*Math.cos(a*1.26),12+5*Math.sin(a*1.26),3,0,7);k.fill()}k.fillStyle='#e0b062';k.beginPath();k.arc(12,12,2.5,0,7);k.fill()}
 if(S.pat=='Denim'){k.globalAlpha=.25;for(let i=-24;i<24;i+=4){k.beginPath();k.moveTo(i,0);k.lineTo(i+24,24);k.stroke()}}
 return ctx.createPattern(t,'repeat')}
function drawBody(ctx){const b=BODIES[S.body],cx=W/2,s=b.s,w=b.w;ctx.save();ctx.strokeStyle='#9c8068';ctx.fillStyle='#e8d6bf';ctx.lineWidth=2;ctx.setLineDash([5,4]);
 ctx.beginPath();ctx.ellipse(cx,80,26,32,0,0,7);ctx.fill();ctx.stroke();
 ctx.beginPath();const y0=118,sh=62*w,ws=40*w,hp=56*w;ctx.moveTo(cx-10,y0-6);ctx.lineTo(cx-sh,y0+14);ctx.lineTo(cx-sh-10,y0+180*s);ctx.lineTo(cx-sh+4,y0+182*s);ctx.lineTo(cx-ws,y0+120*s);ctx.lineTo(cx-ws,y0+150*s);ctx.lineTo(cx-hp,y0+200*s);
 ctx.lineTo(cx-hp+10,y0+420*s);ctx.lineTo(cx-8,y0+420*s);ctx.lineTo(cx,y0+230*s);ctx.lineTo(cx+8,y0+420*s);ctx.lineTo(cx+hp-10,y0+420*s);ctx.lineTo(cx+hp,y0+200*s);ctx.lineTo(cx+ws,y0+150*s);ctx.lineTo(cx+ws,y0+120*s);ctx.lineTo(cx+sh-4,y0+182*s);ctx.lineTo(cx+sh+10,y0+180*s);ctx.lineTo(cx+sh,y0+14);ctx.lineTo(cx+10,y0-6);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
function drawGarment(ctx,opt={}){const pts=gpoly(),p=pathOf(pts);ctx.save();if(opt.only==null||opt.only==='base'){ctx.fillStyle=opt.flat?S.fab:patFill(ctx);ctx.fill(p);ctx.strokeStyle='#3b2416';ctx.lineWidth=2.5;ctx.stroke(p)}
 if(opt.only!=='base'){ctx.clip(p);S.strokes.forEach(st=>{if(opt.only&&opt.only!==st.c)return;ctx.globalCompositeOperation=st.er?'destination-out':'source-over';ctx.strokeStyle=st.c;ctx.lineWidth=st.w;ctx.lineCap=ctx.lineJoin='round';ctx.beginPath();st.p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke()})}ctx.restore()}
function scene(o={}){X.clearRect(0,0,W,H);X.fillStyle='#f3e6d3';X.fillRect(0,0,W,H);if(!o.nobody)drawBody(X);if(!o.nogar)drawGarment(X)}
// steps bar
const FLOW={sew:['Sketch','Fabric','Pin','Cut','Thread','Seams','Buttons & zips','Hem','Runway'],print3d:['Sketch','Material','Slice','Print','Runway'],screen:['Sketch','Separate','Emulsion','Expose','Wash out','Squeegee','Cure','Runway']};
function bar(i){const f=FLOW[S.path||'sew'];document.getElementById('steps').innerHTML=f.map((n,k)=>`<span class="${k==i?'on':''}">${k+1}. ${n}</span>`).join('')}
// input
let down=false,handler=null;function pos(e){const r=C.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return[(t.clientX-r.left)*W/r.width,(t.clientY-r.top)*H/r.height]}
['mousedown','touchstart'].forEach(ev=>C.addEventListener(ev,e=>{e.preventDefault();down=true;handler&&handler.down&&handler.down(pos(e))},{passive:false}));
['mousemove','touchmove'].forEach(ev=>C.addEventListener(ev,e=>{if(!down)return;e.preventDefault();handler&&handler.move&&handler.move(pos(e))},{passive:false}));
['mouseup','touchend','mouseleave'].forEach(ev=>C.addEventListener(ev,e=>{if(!down)return;down=false;handler&&handler.up&&handler.up()}));
const btn=(t,f,on)=>`<button class="${on?'on':''}" onclick="${f}">${t}</button>`;
function swatches(sel,fn){return COLS.map(c=>`<span class="sw ${c==sel?'on':''}" style="background:${c}" onclick="${fn}('${c}')"></span>`).join('')}
// ---------- SKETCH
function sketch(){S.path=null;bar(0);scene();handler={down(p){S.strokes.push({c:tool.c,w:tool.w,er:tool.er,p:[p]})},move(p){S.strokes[S.strokes.length-1].p.push(p);scene()},up(){beep(660,.08,.03)}};
 P.innerHTML=`<h2>1. Sketch</h2><div>Body shape:<br>${Object.keys(BODIES).map(b=>btn(b,`S.body='${b}';sketch()`,b==S.body)).join('')}</div>
 <div>Garment template:<br>${Object.keys(G).map(g=>btn(g,`S.gar='${g}';sketch()`,g==S.gar)).join('')}</div>
 <div>Draw on it:<br>${btn('🖌 Brush',"tool.er=false;sketch()",!tool.er)}${btn('🧽 Eraser',"tool.er=true;sketch()",tool.er)}${btn('↶ Undo',"S.strokes.pop();sketch()")}${btn('Clear',"S.strokes=[];sketch()")}
 <br>Size ${[3,6,12,20].map(w=>btn(w,`tool.w=${w};sketch()`,w==tool.w)).join('')}<br>${swatches(tool.c,'setInk')}</div>
 <h2>Make it:</h2>${btn('🧵 Sew it',"S.path='sew';fabric()")}${btn('🖨 3D Print it',"S.path='print3d';material()")}${btn('🎨 Screen Print it',"S.path='screen';separate()")}`}
function setInk(c){tool.c=c;tool.er=false;sketch()}
// ---------- FABRIC
function fabric(){bar(1);scene();handler=null;P.innerHTML=`<h2>2. Fabric</h2>Pattern:<br>${PATS.map(p=>btn(p,`S.pat='${p}';fabric()`,p==S.pat)).join('')}<br>Main colour:<br>${swatches(S.fab,'setFab')}<br>Pattern colour:<br>${swatches(S.pat2,'setPat2')}<br><br>${btn('Next: pin the pattern ➜','pin()')}`}
function setFab(c){S.fab=c;S.path=='print3d'?material():fabric()}function setPat2(c){S.pat2=c;fabric()}
// generic msg panel
function panel(t,txt,extra=''){P.innerHTML=`<h2>${t}</h2><div id="msg">${txt}</div>${extra}`}
function msg(t){const m=document.getElementById('msg');if(m)m.innerHTML=t}
function rate(a){return a>.85?3:a>.6?2:1}
// ---------- PIN (tap pins)
function pin(){bar(2);const pts=gpoly();const spots=pts.filter((_,i)=>i%2==0).map(p=>[p[0]+(W/2-p[0])*.12,p[1]+(250-p[1])*.06]);let done=[];
 function draw(){scene({nobody:true});spots.forEach((s,i)=>{X.beginPath();X.arc(s[0],s[1],done.includes(i)?6:12,0,7);X.fillStyle=done.includes(i)?'#a33a2a':'rgba(224,176,98,.6)';X.fill();if(done.includes(i)){X.strokeStyle='#888';X.beginPath();X.moveTo(s[0],s[1]);X.lineTo(s[0]+14,s[1]-14);X.stroke()}})}
 draw();panel('3. Pin the pattern','Tap each glowing spot to pin your pattern to the fabric. Take your time.');
 handler={down(p){spots.forEach((s,i)=>{if(!done.includes(i)&&Math.hypot(p[0]-s[0],p[1]-s[1])<22){done.push(i);beep(400+done.length*40);draw()}});if(done.length==spots.length){S.scores.pin=3;msg('All pinned! ⭐⭐⭐');setTimeout(cut,700)}}}}
// ---------- trace game (cut / seams / hem)
function trace(title,txt,line,dash,col,key,next,w=14){let hits=new Set(),n=line.length;
 function draw(){scene({nobody:true});X.save();X.setLineDash(dash);X.strokeStyle=col;X.lineWidth=3;X.beginPath();line.forEach((q,i)=>i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1]));X.stroke();X.restore();
  X.fillStyle='#2f6b4f';hits.forEach(i=>{X.beginPath();X.arc(line[i][0],line[i][1],3,0,7);X.fill()})}
 draw();panel(title,txt,btn('I\'m done ➜',`window._fin()`));let off=0,tot=0;
 handler={move(p){let best=1e9,bi=-1;line.forEach((q,i)=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);if(d<best){best=d;bi=i}});tot++;if(best<w){if(!hits.has(bi)){hits.add(bi);if(hits.size%6==0)beep(500+hits.size*3,.05,.02)}}else off++;draw();X.beginPath();X.arc(p[0],p[1],6,0,7);X.fillStyle='#3b2416';X.fill();
  const cov=hits.size/n;msg(`Covered ${Math.round(cov*100)}% · on the line ${tot?Math.round((1-off/tot)*100):100}%`);if(cov>.97)window._fin()}};
 window._fin=()=>{const cov=hits.size/n,acc=tot?1-off/tot:1;S.scores[key]=rate(cov*.6+acc*.4);beep(880,.3);handler=null;msg('Lovely work '+'⭐'.repeat(S.scores[key]));setTimeout(next,800)}}
function densify(pts,closed,step=6){const o=[];const L=closed?pts.concat([pts[0]]):pts;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<d;t+=step)o.push([a[0]+(b[0]-a[0])*t/d,a[1]+(b[1]-a[1])*t/d])}return o}
function cut(){bar(3);const pts=gpoly().map(p=>[W/2+(p[0]-W/2)*1.08,250+(p[1]-250)*1.06]);trace('4. Cut along the dotted line','Trace the dotted line with your finger or mouse. No rush.',densify(pts,true),[6,6],'#3b2416','cut',thread)}
function thread(){bar(4);X.clearRect(0,0,W,H);const g=[[90,120],[200,90],[330,130],[300,250],[220,300],[220,420]];let k=0;
 function draw(){X.fillStyle='#f3e6d3';X.fillRect(0,0,W,H);X.fillStyle='#c8a27a';X.fillRect(60,70,320,60);X.fillRect(300,70,70,380);X.fillRect(40,440,360,40);X.fillStyle='#3b2416';X.font='bold 18px system-ui';X.fillText('Coffeebreak Sew-Matic',90,105);
  X.strokeStyle='#a33a2a';X.lineWidth=3;X.beginPath();g.slice(0,k).forEach((q,i)=>i?X.lineTo(q[0],q[1]):X.moveTo(q[0],q[1]));X.stroke();
  g.forEach((q,i)=>{X.beginPath();X.arc(q[0],q[1],16,0,7);X.fillStyle=i<k?'#2f6b4f':i==k?'#e0b062':'#6b4a33';X.fill();X.fillStyle='#fff';X.fillText(i+1,q[0]-5,q[1]+6)})}
 draw();panel('5. Thread the machine','Tap the numbered guides in order: spool → tension → take-up → needle.');
 handler={down(p){const q=g[k];if(Math.hypot(p[0]-q[0],p[1]-q[1])<26){k++;beep(450+k*60);draw();if(k==g.length){S.scores.thread=3;msg('Threaded! ⭐⭐⭐');handler=null;setTimeout(seams,700)}}else msg('Try the glowing number '+(k+1)+' 🙂')}}}
function seams(){bar(5);const pts=gpoly();const a=pts[0],L=[];const n=pts.length;// side seams: left & right edges
 const left=densify(pts.slice(0,Math.ceil(n/2)),false);trace('6. Sew the seams','Keep the needle on the stitch line as you guide the fabric.',left,[2,4],'#a33a2a','seams',buttons,12)}
function buttons(){bar(6);const pts=gpoly(),ys=pts.map(p=>p[1]),t=Math.min(...ys),b=Math.max(...ys);const spots=[0,1,2,3].map(i=>[W/2,t+40+i*(b-t-80)/3]);let d=[];let mode=S.gar=='Hoodie'||S.gar=='Pants'?'zip':'btn';
 function draw(){scene({nobody:true});if(mode=='zip'&&d.length){X.strokeStyle='#c0c0c0';X.lineWidth=5;X.setLineDash([3,3]);X.beginPath();X.moveTo(W/2,t+30);X.lineTo(W/2,spots[d.length-1][1]);X.stroke();X.setLineDash([])}
  spots.forEach((s,i)=>{X.beginPath();X.arc(s[0],s[1],d.includes(i)?8:13,0,7);X.fillStyle=d.includes(i)?(mode=='zip'?'#c0c0c0':'#e0b062'):'rgba(255,255,255,.5)';X.fill();X.strokeStyle='#3b2416';X.lineWidth=1.5;X.stroke()})}
 draw();panel('7. Buttons & zips',`Choose ${btn('Buttons',"window._m('btn')")}${btn('Zip',"window._m('zip')")} then tap each spot from top to bottom.`);window._m=m=>{mode=m;d=[];draw()};
 handler={down(p){spots.forEach((s,i)=>{if(i==d.length&&Math.hypot(p[0]-s[0],p[1]-s[1])<24){d.push(i);beep(700-i*50);draw()}});if(d.length==4){S.scores.buttons=3;S.closure=mode;msg('Fastened! ⭐⭐⭐');handler=null;setTimeout(hem,700)}}}}
function hem(){bar(7);const pts=gpoly(),b=Math.max(...pts.map(p=>p[1]));const bot=pts.filter(p=>p[1]>b-3).sort((a,c)=>a[0]-c[0]);const L=densify([[bot[0][0]+6,b-8],[bot[bot.length-1][0]-6,b-8]],false);
 trace('8. Hem','Fold and stitch along the hem line.',L,[2,4],'#a33a2a','hem',runway,12)}
// ---------- 3D PRINT
const MATS={PLA:'Rigid PLA – great for display pieces & jewellery',TPU:'TPU flexible – bendy, wearable, good for chainmail-style fashion',Resin:'Resin – ultra-smooth detail, small statement pieces'};
function material(){bar(1);S.pat='Plain';scene();handler=null;P.innerHTML=`<h2>Material</h2>${Object.keys(MATS).map(m=>btn(m,`S.mat='${m}';material()`,m==S.mat)).join('')}<p>${MATS[S.mat]}</p>Colour:<br>${swatches(S.fab,'setFab')}<br><br>${btn('Slice it ➜','slice()')}`}
function slice(){bar(2);const pts=gpoly(),p=pathOf(pts),ys=pts.map(q=>q[1]),t=Math.min(...ys),b=Math.max(...ys);X.fillStyle='#1e140e';X.fillRect(0,0,W,H);X.save();X.clip(p);for(let y=t;y<b;y+=4){X.fillStyle=`hsl(${200-(y-t)/(b-t)*200},70%,55%)`;X.fillRect(0,y,W,3)}X.restore();X.strokeStyle='#e0b062';X.stroke(p);
 const layers=Math.round((b-t)/0.2*0.5);panel('3. Slicer preview',`Layer height 0.2 mm · ${layers} layers · infill 15% · est. ${Math.round(layers*0.6)} min. Colours show layer order (bottom = red).`,btn('Start print ➜','printAnim()'))}
function printAnim(){bar(3);const pts=gpoly(),p=pathOf(pts),ys=pts.map(q=>q[1]),t=Math.min(...ys),b=Math.max(...ys);let y=b;panel('4. Printing…','Watch it build layer by layer. Relax ☕');
 (function f(){X.fillStyle='#2e2018';X.fillRect(0,0,W,H);X.fillStyle='#555';X.fillRect(40,b+4,W-80,10);X.save();X.beginPath();X.rect(0,y,W,H);X.clip();X.fillStyle=S.fab;X.fill(p);X.globalAlpha=.25;for(let k=y;k<b;k+=3){X.fillStyle='#000';X.fillRect(0,k,W,1)}X.restore();
  X.fillStyle='#c0c0c0';X.fillRect(W/2-40+Math.sin(y)*120,y-30,40,26);X.fillStyle='#e0b062';X.fillRect(W/2-24+Math.sin(y)*120,y-6,8,6);y-=2;if(y%20==0)beep(300,.03,.01);
  if(y>t-2)requestAnimationFrame(f);else{S.scores.print=3;msg('Print finished! ⭐⭐⭐');setTimeout(runway,800)}})()}
// ---------- SCREEN PRINT
function inks(){return[...new Set(S.strokes.filter(s=>!s.er).map(s=>s.c))]}
function separate(){bar(1);handler=null;const ink=inks();X.fillStyle='#f3e6d3';X.fillRect(0,0,W,H);const all=['base'].concat(ink);const cw=W/Math.min(all.length,3),sc=.45;
 all.forEach((c,i)=>{X.save();X.translate((i%3)*cw+(cw-W*sc)/2,Math.floor(i/3)*H*sc*.95+10);X.scale(sc,sc);X.fillStyle='#fff';X.fillRect(40,0,W-80,H);X.globalAlpha=1;drawGarment(X,{only:c,flat:true});X.restore()});
 panel('2. Colour separations',`Your design splits into ${all.length} screen${all.length>1?'s':''}: base colour + ${ink.length} ink colour(s). Each colour gets its own screen.`,
 `Print on: ${['Tee','Hoodie','Tote'].map(g=>btn(g,`S.blank='${g}';separate()`,(S.blank||'Tee')==g)).join('')}<br>${btn('⬇ Download print-ready separations (PNG)','exportSeps()')}<br>${btn('Next: coat with emulsion ➜','emulsion()')}`)}
function frame(fill){X.fillStyle='#f3e6d3';X.fillRect(0,0,W,H);X.fillStyle='#8a6a4f';X.fillRect(40,60,360,440);X.fillStyle=fill;X.fillRect(60,80,320,400)}
function rubGame(title,txt,col,key,next,under){let cells=new Set();const N=8*10;function draw(){under();X.fillStyle=col;for(let i=0;i<N;i++)if(!cells.has(i))X.fillRect(60+(i%8)*40,80+Math.floor(i/8)*40,40,40)}
 draw();panel(title,txt);handler={move(p){const cx=Math.floor((p[0]-60)/40),cy=Math.floor((p[1]-80)/40);if(cx>=0&&cx<8&&cy>=0&&cy<10){const i=cy*8+cx;if(!cells.has(i)){cells.add(i);if(cells.size%5==0)beep(350+cells.size*4,.05,.02)}}draw();msg(Math.round(cells.size/N*100)+'%');if(cells.size>=N*.95){handler=null;S.scores[key]=3;beep(880,.3);msg('Done ⭐⭐⭐');setTimeout(next,700)}}}}
function emulsion(){bar(2);rubGame('3. Coat the screen','Swipe the scoop coater over the whole mesh to spread emulsion.','#d8d8d8','emul',expose,()=>frame('#2f6b4f'))}
function expose(){bar(3);frame('#2f6b4f');panel('4. Expose','Place your film and switch on the UV light.',btn('💡 Turn on UV','window._uv()'));handler=null;
 window._uv=()=>{let k=0;(function f(){frame('#2f6b4f');X.save();X.translate(60,80);X.scale(320/W,400/H);X.globalAlpha=.6;drawGarment(X,{flat:true});X.restore();X.fillStyle=`rgba(120,80,255,${.15+.1*Math.sin(k/4)})`;X.fillRect(0,0,W,H);k++;if(k%15==0)beep(250,.1,.02);msg('Exposing… '+Math.min(100,Math.round(k/0.9))+'%');if(k<90)requestAnimationFrame(f);else{S.scores.expose=3;setTimeout(washout,300)}})()}}
function washout(){bar(4);rubGame('5. Wash out','Rinse the screen — scrub to reveal your stencil.','rgba(60,120,160,.85)','wash',squeegee,()=>{frame('#2f6b4f');X.save();X.translate(60,80);X.scale(320/W,400/H);X.globalCompositeOperation='destination-out';drawGarment(X,{flat:true});X.restore()})}
function blank(){const g=S.blank||'Tee';const old=S.gar;S.gar=g=='Tote'?'Skirt':g;const pts=gpoly();S.gar=old;return pts}
function squeegee(){bar(5);const cols=['base'].concat(inks());let ci=0,y=0;const bl=pathOf(blank());
 function draw(){X.fillStyle='#f3e6d3';X.fillRect(0,0,W,H);X.fillStyle='#ffffff';X.fill(bl);X.strokeStyle='#999';X.stroke(bl);
  for(let i=0;i<cols.length;i++){if(i>ci)break;X.save();if(i==ci){X.beginPath();X.rect(0,0,W,y);X.clip()}X.translate(W*.2,H*.2);X.scale(.6,.6);drawGarment(X,{only:cols[i],flat:true});X.restore()}
  X.fillStyle='#3b2416';X.fillRect(40,y-8,W-80,14)}
 draw();panel('6. Ink & squeegee',`Colour 1 of ${cols.length}. Drag the squeegee down from top to bottom.`);
 handler={move(p){y=Math.max(y,p[1]);if(Math.random()<.2)beep(200,.04,.01);draw();if(y>H-20){ci++;y=0;beep(700,.2);if(ci>=cols.length){handler=null;S.scores.squeegee=3;msg('All colours printed ⭐⭐⭐');setTimeout(cure,700)}else{msg(`Colour ${ci+1} of ${cols.length}. Squeegee again!`);draw()}}}}}
function cure(){bar(6);panel('7. Cure','Into the heat tunnel to set the ink.');handler=null;let k=0;(function f(){X.fillStyle=`rgb(${120+Math.sin(k/6)*30},60,30)`;X.fillRect(0,0,W,H);X.save();X.translate(-W+k*4,0);X.fillStyle='#fff';X.fill(pathOf(blank()));X.restore();k++;if(k<(W*2)/4)requestAnimationFrame(f);else{S.scores.cure=3;beep(900,.4);runway()}})()}
// ---------- RUNWAY
function runway(){const f=FLOW[S.path||'sew'];bar(f.length-1);handler=null;const sc=Object.values(S.scores),st=sc.length?Math.round(sc.reduce((a,b)=>a+b)/sc.length*5/3):5;S.stars=st;let k=0;
 (function f2(){X.fillStyle='#1e140e';X.fillRect(0,0,W,H);for(let i=0;i<8;i++){X.fillStyle=`rgba(224,176,98,${.08+.05*Math.sin(k/10+i)})`;X.beginPath();X.moveTo(W/2,0);X.lineTo(i*60,H);X.lineTo(i*60+40,H);X.fill()}
  X.save();const s=.6+Math.min(k,60)/150;X.translate(W/2,H*.95);X.scale(s,s);X.translate(-W/2,-H*.95);
  if(S.path=='screen'){X.fillStyle='#fff';X.fill(pathOf(blank()));X.translate(W*.2,H*.2);X.scale(.6,.6);drawGarment(X,{flat:true})}else{drawBody(X);drawGarment(X,{flat:S.path=='print3d'})}X.restore();
  X.fillStyle='#e0b062';X.font='34px system-ui';X.fillText('★'.repeat(st)+'☆'.repeat(5-st),W/2-90,40);k++;if(k<90)requestAnimationFrame(f2)})();beep(523,.2);setTimeout(()=>beep(659,.2),200);setTimeout(()=>beep(784,.4),400);
 P.innerHTML=`<h2>Runway reveal!</h2><div class="stars">${'★'.repeat(st)}${'☆'.repeat(5-st)}</div><p>Your ${S.pat} ${S.gar} ${S.path=='print3d'?'printed in '+S.mat:S.path=='screen'?'screen printed on a '+(S.blank||'Tee'):'sewn'} — gorgeous.</p>
 ${btn('💾 Save to gallery','saveGal()')}${btn('⬇ Download PNG','dl(C.toDataURL(),"coffeebreak-design.png")')}<br>${btn('⬇ Tech sheet PNG','techSheet()')}${btn('⬇ STL for 3D printing','exportSTL()')}${btn('⬇ Screen print separations','exportSeps()')}<br>${btn('🏭 Get it made for real','go("real")')}${btn('✏ New design',"S.strokes=[];S.scores={};sketch()")}`}
// ---------- exports
function dl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
function render(scale,fn){const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;const k=c.getContext('2d');k.scale(scale,scale);fn(k);return c}
function exportSeps(){const ink=inks();const sc=4;// 1760x2240 px ≈ 300dpi at ~15x19cm
 const comb=render(sc,k=>drawGarment(k,{flat:true}));dl(comb.toDataURL(),'coffeebreak-print-combined.png');
 ['base'].concat(ink).forEach((c,i)=>setTimeout(()=>dl(render(sc,k=>drawGarment(k,{only:c,flat:true})).toDataURL(),`coffeebreak-sep-${i+1}-${c=='base'?'base-'+S.fab.slice(1):c.slice(1)}.png`),300*(i+1)));beep(700)}
function techSheet(){const c=document.createElement('canvas');c.width=1240;c.height=1754;const k=c.getContext('2d');k.fillStyle='#fff';k.fillRect(0,0,1240,1754);const lg=document.querySelector('header img');try{k.drawImage(lg,60,40,140,140*lg.naturalHeight/lg.naturalWidth)}catch(e){}
 k.fillStyle='#3b2416';k.font='bold 48px system-ui';k.fillText('Coffeebreak Tech Sheet',240,110);k.font='28px system-ui';
 const lines=[`Garment: ${S.gar}`,`Body block: ${S.body} — ${BODIES[S.body].m}`,`Fabric: ${S.pat}, main ${S.fab}, pattern ${S.pat2}`,`Make method: ${S.path||'sew'}${S.path=='print3d'?' ('+S.mat+')':''}${S.path=='screen'?' on '+(S.blank||'Tee'):''}`,`Closure: ${S.closure||'—'}`,`Ink colours: ${inks().join(', ')||'none'}`,`Seam allowance: 1.5 cm · Hem: 3 cm double-fold`];
 lines.forEach((l,i)=>k.fillText(l,60,240+i*44));k.save();k.translate(120,580);k.scale(2,2);k.fillStyle='#f3e6d3';k.fillRect(0,0,W,H);drawBody(k);drawGarment(k);k.restore();
 const pts=gpoly(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);k.fillStyle='#a33a2a';k.font='24px system-ui';k.fillText(`Sketch width ≈ ${Math.round((Math.max(...xs)-Math.min(...xs))*.25)} cm · length ≈ ${Math.round((Math.max(...ys)-Math.min(...ys))*.25)} cm`,60,1730);
 dl(c.toDataURL(),'coffeebreak-tech-sheet.png')}
function earclip(pts){const v=pts.map((p,i)=>i),tri=[];let area=0;pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];area+=p[0]*q[1]-q[0]*p[1]});if(area<0)v.reverse();
 const cr=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);let guard=0;
 while(v.length>3&&guard++<5000){for(let i=0;i<v.length;i++){const a=pts[v[(i+v.length-1)%v.length]],b=pts[v[i]],c=pts[v[(i+1)%v.length]];if(cr(a,b,c)<=0)continue;
  if(v.some(j=>{const p=pts[j];if(p===a||p===b||p===c)return false;return cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0}))continue;tri.push([v[(i+v.length-1)%v.length],v[i],v[(i+1)%v.length]]);v.splice(i,1);break}}
 if(v.length==3)tri.push(v.slice());return tri}
function exportSTL(){const s=.4,pts=gpoly().map(p=>[p[0]*s,(H-p[1])*s]),hgt=3,t=earclip(pts);let o='solid coffeebreak\n';
 const f=(a,b,c)=>{o+=`facet normal 0 0 0\n outer loop\n${[a,b,c].map(p=>`  vertex ${p[0].toFixed(3)} ${p[1].toFixed(3)} ${p[2].toFixed(3)}`).join('\n')}\n endloop\nendfacet\n`};
 const tp=p=>[p[0],p[1],hgt],bt=p=>[p[0],p[1],0];let area=0;pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];area+=p[0]*q[1]-q[0]*p[1]});
 t.forEach(([a,b,c])=>{const A=pts[a],B=pts[b],Cc=pts[c];if(area>0){f(tp(A),tp(B),tp(Cc));f(bt(A),bt(Cc),bt(B))}else{f(tp(A),tp(Cc),tp(B));f(bt(A),bt(B),bt(Cc))}});
 pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];if(area>0){f(bt(p),bt(q),tp(q));f(bt(p),tp(q),tp(p))}else{f(bt(p),tp(q),bt(q));f(bt(p),tp(p),tp(q))}});o+='endsolid coffeebreak\n';
 dl(URL.createObjectURL(new Blob([o],{type:'model/stl'})),`coffeebreak-${S.gar.toLowerCase()}.stl`);beep(700)}
// ---------- gallery
function saveGal(){gal.unshift({img:render(.4,k=>{k.fillStyle='#f3e6d3';k.fillRect(0,0,W,H);drawBody(k);drawGarment(k)}).toDataURL('image/jpeg',.7),name:S.pat+' '+S.gar,stars:S.stars||0});gal=gal.slice(0,24);try{localStorage.setItem('ss_gal',JSON.stringify(gal))}catch(e){}beep(880);msgOr('Saved to gallery ✔')}
function msgOr(t){P.insertAdjacentHTML('beforeend',`<p>${t}</p>`)}
function go(w){handler=null;if(w=='gallery'){P.innerHTML=`<h2>Gallery</h2><div class="gal">${gal.map(g=>`<div><img src="${g.img}"><br><small>${g.name} ${'★'.repeat(g.stars)}</small></div>`).join('')||'No designs yet — make one!'}</div>${btn('✏ Back to sketch','sketch()')}`}
 if(w=='real'){const L=(n,u,d)=>`<li><a href="${u}" target="_blank" rel="noopener">${n}</a> — ${d}</li>`;P.innerHTML=`<h2>Get it made for real</h2><p>Download your STL, tech sheet or print separations from the runway, then take them to:</p>
 <b>🖨 3D printing</b><ul>${L('Craftcloud','S1-Ldafd85','upload STL, compare quotes worldwide')}${L('JLC3DP','S2-Ld1239a','instant online quote')}${L('Shapeways','S3-L29dfe6','upload & print')}</ul>
 <b>🧵 Dressmaking (Newcastle)</b><ul>${L('Stitches Dressmaking, Mayfield','S4-L270355','bring a sketch for custom design')}${L('Design By B, Newcastle','S5-L975572','custom fashion & alterations')}${L('AltEm Stitches, Newcastle','S6-L0d1016','alterations & repairs')}</ul>
 <b>🎨 Screen printing</b><ul>${L('T-Shirt Printing Australia, Newcastle','S7-Ldb71a3','no minimum, screen & DTG')}${L('Onya Visuals, Warners Bay','S8-L3a43e6','in-house screen printing')}${L('Mitch Revs Gallery, Maryville','S9-L970b55','screen print 50+, DTG one-offs')}${L('PS Apparel','S10-L7d1ee5','tees, hoodies, totes')}</ul>${btn('✏ Back to sketch','sketch()')}`}}
// demo seed so first view isn't empty
S.strokes=[{c:'#e0b062',w:12,p:[[160,260],[220,240],[280,260]]},{c:'#a33a2a',w:6,p:[[170,330],[220,310],[270,330]]}];
sketch();
