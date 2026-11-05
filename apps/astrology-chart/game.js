const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function skull(X,Y,s,col){x.fillStyle=col||'#ffe9ef';x.beginPath();x.arc(X,Y,6*s,0,7);x.fill();x.fillRect(X-3.5*s,Y+3*s,7*s,4*s);x.fillStyle='#12060c';x.beginPath();x.arc(X-2.3*s,Y,1.6*s,0,7);x.arc(X+2.3*s,Y,1.6*s,0,7);x.fill()}
function rose(X,Y,s){x.fillStyle='#c2264a';for(let i=0;i<5;i++){x.beginPath();x.arc(X+Math.cos(i*1.26)*3*s,Y+Math.sin(i*1.26)*3*s,3.4*s,0,7);x.fill()}x.fillStyle='#8a1030';x.beginPath();x.arc(X,Y,2.2*s,0,7);x.fill()}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k in BTN)if(inB(p,BTN[k])){BTN[k].fn();return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ---- Coffeebreak Astrology Chart Maker ----
const DEMO=()=>!!window.DEMO,R=Math.PI/180;
const CITIES=[['Newcastle NSW',-32.93,151.78,'Australia/Sydney'],['Sydney',-33.87,151.21,'Australia/Sydney'],['Melbourne',-37.81,144.96,'Australia/Melbourne'],['Brisbane',-27.47,153.03,'Australia/Brisbane'],['Perth',-31.95,115.86,'Australia/Perth'],['Adelaide',-34.93,138.6,'Australia/Adelaide'],['Hobart',-42.88,147.33,'Australia/Hobart'],['Darwin',-12.46,130.84,'Australia/Darwin'],['Canberra',-35.28,149.13,'Australia/Sydney'],['Auckland',-36.85,174.76,'Pacific/Auckland'],['London',51.51,-0.13,'Europe/London'],['Dublin',53.35,-6.26,'Europe/Dublin'],['Paris',48.86,2.35,'Europe/Paris'],['Berlin',52.52,13.4,'Europe/Berlin'],['Rome',41.9,12.5,'Europe/Rome'],['Madrid',40.42,-3.7,'Europe/Madrid'],['Athens',37.98,23.73,'Europe/Athens'],['Moscow',55.76,37.62,'Europe/Moscow'],['Cairo',30.04,31.24,'Africa/Cairo'],['Johannesburg',-26.2,28.05,'Africa/Johannesburg'],['Lagos',6.52,3.38,'Africa/Lagos'],['Dubai',25.2,55.27,'Asia/Dubai'],['Mumbai',19.08,72.88,'Asia/Kolkata'],['Delhi',28.61,77.21,'Asia/Kolkata'],['Bangkok',13.76,100.5,'Asia/Bangkok'],['Singapore',1.35,103.82,'Asia/Singapore'],['Manila',14.6,120.98,'Asia/Manila'],['Hong Kong',22.32,114.17,'Asia/Hong_Kong'],['Beijing',39.9,116.4,'Asia/Shanghai'],['Seoul',37.57,126.98,'Asia/Seoul'],['Tokyo',35.68,139.69,'Asia/Tokyo'],['Honolulu',21.31,-157.86,'Pacific/Honolulu'],['Los Angeles',34.05,-118.24,'America/Los_Angeles'],['Vancouver',49.28,-123.12,'America/Vancouver'],['Denver',39.74,-104.99,'America/Denver'],['Chicago',41.88,-87.63,'America/Chicago'],['Dallas',32.78,-96.8,'America/Chicago'],['Nashville',36.16,-86.78,'America/Chicago'],['Toronto',43.65,-79.38,'America/Toronto'],['New York',40.71,-74.01,'America/New_York'],['Miami',25.76,-80.19,'America/New_York'],['Mexico City',19.43,-99.13,'America/Mexico_City'],['São Paulo',-23.55,-46.63,'America/Sao_Paulo'],['Buenos Aires',-34.6,-58.38,'America/Argentina/Buenos_Aires'],['Lima',-12.05,-77.04,'America/Lima']];
const SIGNS=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],GLY='♈♉♊♋♌♍♎♏♐♑♒♓';
const TR=['bold, brave and fiery, always first to leap','steady, sensual and loyal, loving comfort and beauty','curious, witty and chatty, with a mind that sparkles','tender, protective and intuitive, guided by the heart','radiant, generous and dramatic, born to shine','thoughtful, helpful and detail-loving, a quiet healer','charming, fair and romantic, seeking harmony','intense, magnetic and deep, a keeper of secrets','adventurous, honest and free, always chasing horizons','ambitious, patient and wise, building empires','original, rebellious and kind-hearted, ahead of the times','dreamy, artistic and compassionate, swimming in feelings'];
const PLN=[['Sun','☉','Your core self and life force is'],['Moon','☽','Your emotions and inner needs are'],['Mercury','☿','Your mind and the way you talk are'],['Venus','♀','In love and beauty you are'],['Mars','♂','Your drive and passion are'],['Jupiter','♃','Your luck and growth come by being'],['Saturn','♄','Your lessons ask you to become'],['Uranus','♅','Your spark of change is'],['Neptune','♆','Your dreams and spirituality are'],['Pluto','♇','Your power to transform is'],['Node','☊','Your soul path calls you to be']];
const EL={Mercury:[.38709927,.20563593,7.00497902,252.2503235,77.45779628,48.33076593,.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081],Venus:[.72333566,.00677672,3.39467605,181.9790995,131.60246718,76.67984255,.0000039,-.00004107,-.0007889,58517.81538729,.00268329,-.27769418],Earth:[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0,.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0],Mars:[1.52371034,.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343],Jupiter:[5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909,-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106],Saturn:[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448,-.0012506,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794],Uranus:[19.18916464,.04725744,.77263783,313.23810451,170.9542763,74.01692503,-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589],Neptune:[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664],Pluto:[39.48211675,.2488273,17.14001206,238.92903833,224.06891629,110.30393684,-.00031596,.0000517,.00004818,145.20780515,-.04062942,-.01183482]};
const n360=a=>((a%360)+360)%360;
function helio(k,T){const e0=EL[k],a=e0[0]+e0[6]*T,e=e0[1]+e0[7]*T,I=(e0[2]+e0[8]*T)*R,L=e0[3]+e0[9]*T,w=e0[4]+e0[10]*T,O=e0[5]+e0[11]*T;let M=n360(L-w)*R,E=M;for(let i=0;i<8;i++)E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
 const xp=a*(Math.cos(E)-e),yp=a*Math.sqrt(1-e*e)*Math.sin(E),om=(w-O)*R,Or=O*R;const co=Math.cos(om),so=Math.sin(om),cO=Math.cos(Or),sO=Math.sin(Or),cI=Math.cos(I),sI=Math.sin(I);
 return[(co*cO-so*sO*cI)*xp+(-so*cO-co*sO*cI)*yp,(co*sO+so*cO*cI)*xp+(-so*sO+co*cO*cI)*yp]}
function positions(jd){const T=(jd-2451545)/36525,d=jd-2451545,prec=1.3969*T,E=helio('Earth',T),out={};
 out.Sun=n360(Math.atan2(-E[1],-E[0])/R+prec);
 for(const k of['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']){const p=helio(k,T);out[k]=n360(Math.atan2(p[1]-E[1],p[0]-E[0])/R+prec)}
 const L0=218.316+13.176396*d,M=(134.963+13.064993*d)*R,F=(93.272+13.22935*d)*R,D=(297.85+12.190749*d)*R,Ms=(357.529+.98560028*d)*R;
 out.Moon=n360(L0+6.289*Math.sin(M)+1.274*Math.sin(2*D-M)+.658*Math.sin(2*D)+.214*Math.sin(2*M)-.186*Math.sin(Ms)-.114*Math.sin(2*F));
 out.Node=n360(125.045-.0529538*d);return out}
function ascMc(jd,lat,lon){const T=(jd-2451545)/36525,eps=(23.4393-.013*T)*R,g=n360(280.46061837+360.98564736629*(jd-2451545)+lon),th=g*R,f=lat*R;
 return{asc:n360(Math.atan2(Math.cos(th),-(Math.sin(th)*Math.cos(eps)+Math.tan(f)*Math.sin(eps)))/R),mc:n360(Math.atan2(Math.sin(th),Math.cos(th)*Math.cos(eps))/R)}}
function tzOffset(tz,y,m,dd,hh,mi){const guess=Date.UTC(y,m-1,dd,hh,mi);const fmt=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
 let u=guess;for(let i=0;i<2;i++){const p=Object.fromEntries(fmt.formatToParts(new Date(u)).map(q=>[q.type,q.value]));const asUTC=Date.UTC(+p.year,p.month-1,+p.day,+p.hour,+p.minute);u=u-(asUTC-guess)}return u}
function cast(nm,date,time,ci){const[y,m,dd]=date.split('-').map(Number),[hh,mi]=time.split(':').map(Number),c=CITIES[ci],ms=tzOffset(c[3],y,m,dd,hh,mi),jd=ms/86400000+2440587.5;
 const P=positions(jd),A=ascMc(jd,c[1],c[2]);return{nm,date,time,city:c[0],P,asc:A.asc,mc:A.mc}}
const sg=l=>Math.floor(n360(l)/30),deg=l=>Math.floor(n360(l)%30)+'°';
function house(ch,l){return(sg(l)-sg(ch.asc)+12)%12+1}
const HM=['self and first impressions','money and values','talk and siblings','home and family','romance and creativity','work and health','partnerships','transformation and intimacy','travel and wisdom','career and reputation','friends and dreams','the hidden and spiritual'];
function readings(ch){const L=[['Rising',ch.asc,'Others first see you as']].concat(PLN.map(p=>[p[0],ch.P[p[0]],p[2]]));
 return L.map(([k,l,pre],i)=>{const s=sg(l);const lock=DEMO()&&i>2;return{k,s,txt:lock?'🔒 Unlock this reading in the full game.':pre+' '+TR[s]+'.'+(k!=='Rising'?' It sits in your house '+house(ch,l)+', the house of '+HM[house(ch,l)-1]+'.':''),l,lock}})}
const G={state:'title',score:0,level:+localStorage.astroN||0,ch:null,scroll:0};window.G=G;
const sel=$('city');CITIES.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.textContent=c[0];sel.appendChild(o)});
$('go').onclick=()=>{startMusic();G.ch=cast($('nm').value||'Sweet soul',$('bd').value,$('bt').value,+sel.value);G.state='chart';G.scroll=0;G.level=+localStorage.astroN+1||1;localStorage.astroN=G.level;G.score=G.level};
$('png').onclick=()=>{if(!G.ch)return;const a=document.createElement('a');a.download='coffeebreak-natal-chart.png';a.href=c.toDataURL('image/png');a.click()};
c.addEventListener('wheel',e=>{G.scroll=Math.max(0,Math.min(400,G.scroll+e.deltaY*.5));e.preventDefault()},{passive:false});
bindInput({down(p){G.drag=p.y},move(p){if(G.drag!=null){G.scroll=Math.max(0,Math.min(400,G.scroll-(p.y-G.drag)));G.drag=p.y}},up(){G.drag=null}});
function update(){}
function wheel(ch,CX,CY,Ro){const rot=l=>(180+l-ch.asc)*R;// asc on left
 x.lineWidth=1.5;x.strokeStyle='#e8a0b0';[Ro,Ro-34,Ro*.55,Ro*.25].forEach(r=>{x.beginPath();x.arc(CX,CY,r,0,7);x.stroke()});
 for(let i=0;i<12;i++){const a=rot(i*30);x.strokeStyle='#8a5ab0';x.beginPath();x.moveTo(CX+Math.cos(a)*Ro*.25,CY-Math.sin(a)*Ro*.25);x.lineTo(CX+Math.cos(a)*Ro,CY-Math.sin(a)*Ro);x.stroke();
  const m=rot(i*30+15);x.fillStyle=['#ff7a5a','#7fd88a','#ffd75a','#7ab0ff'][i%4];x.font='22px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(GLY[i],CX+Math.cos(m)*(Ro-17),CY-Math.sin(m)*(Ro-17));
  const hs=rot((sg(ch.asc)+i)*30+15);x.fillStyle='#b090c0';x.font='12px Georgia';x.fillText(i+1,CX+Math.cos(hs)*Ro*.32,CY-Math.sin(hs)*Ro*.32)}
 const keys=Object.keys(ch.P),used=[];keys.forEach(k=>{const l=ch.P[k];let r=Ro-58;while(used.some(u=>Math.abs(n360(u.l-l+180)-180)<7&&u.r===r))r-=26;used.push({l,r});const a=rot(l),p=PLN.find(q=>q[0]===k);
  x.strokeStyle='rgba(255,233,239,.4)';x.beginPath();x.moveTo(CX+Math.cos(a)*(Ro-34),CY-Math.sin(a)*(Ro-34));x.lineTo(CX+Math.cos(a)*(r+12),CY-Math.sin(a)*(r+12));x.stroke();x.fillStyle='#ffe9c7';x.font='bold 20px serif';x.fillText(p[1],CX+Math.cos(a)*r,CY-Math.sin(a)*r)});
 // aspects
 for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const d=Math.abs(n360(ch.P[keys[i]]-ch.P[keys[j]]+180)-180);const asp=[[0,'#ffcf6a'],[60,'#7ab0ff'],[90,'#ff5a7a'],[120,'#7fd88a'],[180,'#ff5a7a']].find(q=>Math.abs(d-q[0])<5&&q[0]>0);if(asp){const a1=rot(ch.P[keys[i]]),a2=rot(ch.P[keys[j]]),r=Ro*.55;x.strokeStyle=asp[1];x.globalAlpha=.55;x.beginPath();x.moveTo(CX+Math.cos(a1)*r,CY-Math.sin(a1)*r);x.lineTo(CX+Math.cos(a2)*r,CY-Math.sin(a2)*r);x.stroke();x.globalAlpha=1}}
 x.fillStyle='#ffcf6a';x.font='bold 13px Georgia';x.fillText('ASC',CX-Ro-18,CY);const mm=rot(ch.mc);x.fillText('MC',CX+Math.cos(mm)*(Ro+16),CY-Math.sin(mm)*(Ro+16));x.textBaseline='alphabetic';
 skull(CX,CY-4,2.2);rose(CX+16,CY+14,1.3)}
function draw(){const g=x.createRadialGradient(W/2,H/2,50,W/2,H/2,600);g.addColorStop(0,'#2a1036');g.addColorStop(1,'#0a0410');x.fillStyle=g;x.fillRect(0,0,W,H);
 for(let i=0;i<90;i++){x.fillStyle='rgba(255,240,255,'+(.3+.3*Math.sin(t+i))+')';x.fillRect((i*137)%W,(i*71)%H,2,2)}
 if(G.state==='title'){x.textAlign='center';x.fillStyle='#f0c0e0';x.font='bold 44px Georgia';x.fillText('✨ Coffeebreak Astrology Chart Maker',W/2,150);x.fillStyle='#ffe9c7';x.font='18px Georgia';
  ['Enter your birth date, time and city above,','then press ✨ Cast my chart.','Your natal wheel shows your Sun, Moon, planets and Rising sign,','with a reading for every placement. Save it as a PNG to share!'].forEach((s,i)=>x.fillText(s,W/2,230+i*30));
  if(DEMO()){x.fillStyle='#ffcf6a';x.fillText('Demo: Rising, Sun and Moon readings. The full game unlocks every planet and saves charts without a watermark.',W/2,400)}skull(W/2-40,480,4);rose(W/2+40,480,3);ent();return}
 const ch=G.ch;wheel(ch,300,300,260);
 x.save();x.beginPath();x.rect(580,8,312,584);x.clip();x.fillStyle='rgba(26,10,30,.85)';rr(580,8,312,584,12);x.fill();
 let y=36-G.scroll;x.textAlign='left';x.fillStyle='#f0c0e0';x.font='bold 18px Georgia';x.fillText(ch.nm+"'s natal chart",592,y);y+=20;x.fillStyle='#b090c0';x.font='12px Georgia';x.fillText(ch.date+' '+ch.time+' · '+ch.city,592,y);y+=24;
 for(const r of readings(ch)){x.fillStyle='#ffcf6a';x.font='bold 15px Georgia';x.fillText(r.k+' in '+SIGNS[r.s]+' '+GLY[r.s]+'  '+deg(r.l),592,y);y+=18;x.fillStyle=r.lock?'#9a8aa0':'#ffe9c7';x.font='13px Georgia';y=wrapT(r.txt,592,y,288,16)+8}
 x.restore();if(G.scroll<5){x.fillStyle='#b090c0';x.font='11px Georgia';x.textAlign='right';x.fillText('scroll for more ↓',884,586)}
 if(DEMO()){x.save();x.globalAlpha=.35;x.fillStyle='#fff';x.font='bold 30px Georgia';x.textAlign='center';x.translate(300,300);x.rotate(-.5);x.fillText('DEMO · Coffeebreak',0,0);x.restore()}
 ent()}
startLoop();
