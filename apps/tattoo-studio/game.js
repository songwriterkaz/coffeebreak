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
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Tattoo Studio (all on-device) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const st=document.createElement('style');st.textContent=`#tt{flex:1;width:100%;max-width:1250px;overflow:auto;padding:8px 10px 90px;box-sizing:border-box;font-family:Georgia,serif;color:#ffe9c7}
#tt h2{color:#e8a0b0;margin:6px 0}#tt button{margin:2px;background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px 9px;font:14px Georgia;cursor:pointer}
#tt button.on{background:#e8a0b0;color:#1a0a10}#tt button:disabled{opacity:.4;cursor:not-allowed}#tt select,#tt input[type=text],#tt input[type=number]{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:6px;padding:4px;font:13px Georgia}
#tt .row{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}#tt .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:12px;padding:10px;margin:8px 0}
#tt label{font-size:13px;color:#d9b8c0;display:inline-block;margin:3px 6px 3px 0}#tt input[type=range]{vertical-align:middle;width:120px}
#tt .chk{background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/20px 20px;border-radius:8px;touch-action:none;max-width:100%}
#tt .stage{max-width:100%;border-radius:10px;touch-action:none;background:#000;display:block}
#tt .flash{display:flex;flex-wrap:wrap;gap:6px;max-height:330px;overflow:auto}#tt .fl{width:86px;text-align:center;font-size:11px;cursor:pointer;background:#fff;color:#222;border-radius:8px;padding:3px;position:relative}
#tt .fl canvas{width:80px;height:80px}#tt .fl.lock{opacity:.45}#tt .fl.lock:after{content:'🔒';position:absolute;top:2px;right:4px}
#tt .sw{display:inline-block;width:24px;height:24px;border-radius:50%;border:2px solid #555;margin:2px;cursor:pointer;vertical-align:middle}#tt .sw.on{border-color:#ffcf6a;box-shadow:0 0 0 2px #ffcf6a}
#tt .gal{display:flex;flex-wrap:wrap;gap:10px}#tt .gi{width:200px;background:#1e0b14;border:1px solid #5a2a3a;border-radius:10px;padding:6px;font-size:12px}#tt .gi img{width:100%;border-radius:6px}
#tt .note{font-size:12px;color:#d9b8c0}#ttMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e8a0b0;color:#1a0a10;padding:8px 14px;border-radius:10px;display:none;z-index:50}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='tt';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='ttMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>{try{startMusic()}catch(e){}},{once:true});
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
const mk=(w,h)=>{const k=document.createElement('canvas');k.width=w;k.height=h;return k};
// ---------- flash design drawers (original vector art, 600x600 box) ----------
const K='#111';
function stk(g,p,lw,fill){if(fill){g.fillStyle=fill;g.fill(p)}g.lineWidth=lw;g.strokeStyle=K;g.lineJoin=g.lineCap='round';g.stroke(p)}
function sp(d){return new Path2D(d)}
function leaf(g,x0,y0,a,l,col){g.save();g.translate(x0,y0);g.rotate(a);const p=sp(`M0 0 Q ${l*.5} ${-l*.35} ${l} 0 Q ${l*.5} ${l*.35} 0 0 Z`);stk(g,p,5,col);g.beginPath();g.moveTo(0,0);g.lineTo(l*.85,0);g.lineWidth=2.5;g.stroke();g.restore()}
function rose(g,cx,cy,r,col,leaves){if(leaves){leaf(g,cx-r*.6,cy+r*.5,2.5,r*1.1,leaves);leaf(g,cx+r*.6,cy+r*.5,.6,r*1.1,leaves)}
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.3,px=cx+Math.cos(a)*r*.55,py=cy+Math.sin(a)*r*.5;g.save();g.translate(px,py);g.rotate(a);stk(g,sp(`M ${-r*.45} 0 Q 0 ${-r*.7} ${r*.45} 0 Q 0 ${r*.35} ${-r*.45} 0 Z`),5,col);g.restore()}
 stk(g,sp(`M ${cx-r*.55} ${cy} A ${r*.55} ${r*.5} 0 1 1 ${cx+r*.55} ${cy} A ${r*.55} ${r*.5} 0 1 1 ${cx-r*.55} ${cy}`),5,col);
 g.beginPath();for(let k=0;k<60;k++){const a=k*.38,rr=r*.5*(1-k/64);const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr*.85;k?g.lineTo(px,py):g.moveTo(px,py)}g.lineWidth=4;g.strokeStyle=K;g.stroke()}
function heartP(s,ox,oy){s=s||1;ox=ox||0;oy=oy||0;const f=(x0,y0)=>(ox+300+(x0-300)*s)+' '+(oy+300+(y0-300)*s);return sp(`M ${f(300,520)} C ${f(100,380)} ${f(60,220)} ${f(170,160)} C ${f(240,120)} ${f(290,170)} ${f(300,210)} C ${f(310,170)} ${f(360,120)} ${f(430,160)} C ${f(540,220)} ${f(500,380)} ${f(300,520)} Z`)}
function banner(g,y0,txt,col,font){stk(g,sp(`M 70 ${y0+10} L 120 ${y0-20} L 110 ${y0+40} Z`),5,col?'#b23':'#666');stk(g,sp(`M 530 ${y0+10} L 480 ${y0-20} L 490 ${y0+40} Z`),5,col?'#b23':'#666');
 stk(g,sp(`M 110 ${y0-30} Q 300 ${y0-70} 490 ${y0-30} L 490 ${y0+30} Q 300 ${y0-10} 110 ${y0+30} Z`),6,col?'#f3e3c0':'#fff');
 g.fillStyle=K;g.font=(font||'italic bold 54px "Brush Script MT","Lucida Handwriting",cursive');g.textAlign='center';g.textBaseline='middle';g.fillText(txt,300,y0-8);g.textBaseline='alphabetic'}
function skull(g,col,eye){stk(g,sp('M 170 300 C 150 130 450 130 430 300 C 425 360 400 370 390 400 L 390 450 L 210 450 L 210 400 C 200 370 175 360 170 300 Z'),7,col);
 stk(g,sp('M 210 450 L 215 500 Q 300 530 385 500 L 390 450'),7,col);for(let i=0;i<6;i++){g.beginPath();g.moveTo(230+i*28,455);g.lineTo(232+i*28,505);g.lineWidth=4;g.stroke()}
 for(const ex of[240,360]){g.beginPath();g.ellipse(ex,320,42,38,0,0,7);g.fillStyle=K;g.fill();if(eye){g.beginPath();for(let k=0;k<8;k++){const a=k/8*7;g.moveTo(ex,320);g.lineTo(ex+Math.cos(a)*30,320+Math.sin(a)*28)}g.strokeStyle=eye;g.lineWidth=4;g.stroke();g.strokeStyle=K}}
 stk(g,sp('M 300 360 L 280 405 L 320 405 Z'),5,K);if(eye){for(const[a,b2]of[[300,200],[230,250],[370,250]]){g.beginPath();g.arc(a,b2,10,0,7);g.fillStyle=eye;g.fill();g.stroke()}}}
function butterfly(g,c1,c2,lw){lw=lw||6;for(const s of[1,-1]){g.save();g.translate(300,300);g.scale(s,1);stk(g,sp('M 0 -10 C 60 -170 240 -200 230 -60 C 225 0 120 20 0 10 Z'),lw,c1);stk(g,sp('M 0 15 C 120 20 210 60 170 160 C 140 220 40 150 0 40 Z'),lw,c2);
 if(c1){g.beginPath();g.arc(150,-80,22,0,7);g.fillStyle='#fff';g.fill();g.stroke()}g.restore()}stk(g,sp('M 300 220 Q 315 300 300 400 Q 285 300 300 220 Z'),lw,K);g.beginPath();g.moveTo(296,225);g.quadraticCurveTo(270,160,240,150);g.moveTo(304,225);g.quadraticCurveTo(330,160,360,150);g.lineWidth=lw*.6;g.stroke()}
function mandala(g,n,dot,col){g.save();g.translate(300,300);for(const[r,l,w]of[[60,70,22],[140,90,34],[220,70,26]]){for(let i=0;i<n;i++){g.save();g.rotate(i/n*Math.PI*2+(r==140?Math.PI/n:0));stk(g,sp(`M 0 ${-r+l*.1} Q ${w} ${-r-l*.4} 0 ${-r-l} Q ${-w} ${-r-l*.4} 0 ${-r+l*.1} Z`),3.5,col&&(r==140?col[1]:col[0]));if(dot){g.beginPath();g.arc(0,-r-l-14,5,0,7);g.fillStyle=K;g.fill()}g.restore()}}
 for(const r of[45,95,175]){g.beginPath();g.arc(0,0,r,0,7);g.lineWidth=3;g.strokeStyle=K;g.stroke()}if(dot)for(let i=0;i<n*3;i++){const a=i/(n*3)*7;g.beginPath();g.arc(Math.cos(a)*120,Math.sin(a)*120,3,0,7);g.fill()}g.beginPath();g.arc(0,0,18,0,7);g.fillStyle=col?col[0]:K;g.fill();g.stroke();g.restore()}
function tribal(g,n,curl,ring){g.save();g.translate(300,300);g.fillStyle=K;for(let i=0;i<n;i++){g.save();g.rotate(i/n*Math.PI*2);g.fill(sp(`M 0 -40 C ${60*curl} -90 ${40*curl} -200 ${120*curl} -250 C ${50*curl} -230 ${-10} -150 -30 -60 Z`));g.restore()}if(ring){g.lineWidth=18;g.strokeStyle=K;g.beginPath();g.arc(0,0,ring,0,7);g.stroke()}g.restore()}
function armband(g){g.fillStyle=K;g.fillRect(40,270,520,16);g.fillRect(40,330,520,16);for(let i=0;i<6;i++){const x0=60+i*85;g.fill(sp(`M ${x0} 286 Q ${x0+40} 300 ${x0+80} 286 Q ${x0+40} 330 ${x0} 330 Z`))}}
function twing(g){g.fillStyle=K;for(let i=0;i<6;i++)g.fill(sp(`M 120 ${380-i*10} C ${200+i*20} ${300-i*40} ${330+i*25} ${260-i*30} ${500-i*10} ${140+i*30} C ${380+i*10} ${300-i*20} ${260} ${350} 120 ${400-i*8} Z`))}
const L=(g,d,lw,f)=>stk(g,sp(d),lw||4,f);
const FINE={
 moon:(g,w,f)=>L(g,'M 360 120 A 190 190 0 1 0 360 480 A 150 150 0 1 1 360 120 Z',w,f),
 star:(g,w,f)=>L(g,'M 300 90 L 355 240 L 515 245 L 390 340 L 435 495 L 300 405 L 165 495 L 210 340 L 85 245 L 245 240 Z',w,f),
 wave:(g,w,f)=>{L(g,'M 80 420 C 120 250 250 150 360 200 C 450 240 430 340 360 330 C 300 320 320 260 360 270 M 80 420 L 520 420',w);if(f)L(g,'M 80 420 C 150 300 260 260 330 320 L 520 420 Z',1,f)},
 mountain:(g,w,f)=>{L(g,'M 60 450 L 220 200 L 300 320 L 390 160 L 540 450 Z',w,f);L(g,'M 190 250 L 220 270 L 250 245 M 360 205 L 390 230 L 420 205',w)},
 arrow:(g,w)=>{L(g,'M 80 300 L 500 300 M 500 300 L 450 270 M 500 300 L 450 330 M 80 300 L 120 270 M 80 300 L 120 330 M 110 300 L 150 270 M 110 300 L 150 330',w)},
 feather:(g,w,f)=>{L(g,'M 300 540 L 300 80 M 300 80 C 420 160 400 400 300 470 C 200 400 180 160 300 80 Z',w,f);for(let i=0;i<8;i++)L(g,`M 300 ${150+i*40} L ${360-i*3} ${130+i*40} M 300 ${150+i*40} L ${240+i*3} ${130+i*40}`,w*.6)},
 snake:(g,w,f)=>{L(g,'M 300 520 C 150 500 160 400 300 390 C 450 380 450 280 300 270 C 170 262 180 170 300 150 C 340 145 360 120 350 100 C 320 90 290 110 300 150',w*2.2,null);if(f){g.strokeStyle=f;g.lineWidth=w*1.2;g.stroke(sp('M 300 520 C 150 500 160 400 300 390 C 450 380 450 280 300 270 C 170 262 180 170 300 150'))}},
 dagger:(g,w,f)=>{L(g,'M 300 60 L 330 140 L 330 380 L 300 430 L 270 380 L 270 140 Z',w,f?'#ccd':null);L(g,'M 200 140 L 400 140 L 400 165 L 200 165 Z',w,f?'#c93':null);L(g,'M 285 165 L 315 165 L 315 520 L 285 520 Z',w,f?'#741':null)},
 swallow:(g,w,f)=>{L(g,'M 300 260 C 240 180 120 160 60 200 C 140 220 200 260 250 300 C 180 330 150 400 160 470 L 220 400 L 260 470 C 280 400 300 340 320 310 C 380 300 460 250 540 160 C 440 190 360 230 300 260 Z',w,f);if(f)L(g,'M 320 310 C 340 340 330 370 300 380 C 280 360 290 330 320 310 Z',w,'#c23')},
 anchor:(g,w,f)=>{L(g,'M 300 90 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0 M 300 120 L 300 500 M 210 180 L 390 180 M 120 380 C 150 480 250 510 300 500 C 350 510 450 480 480 380 M 120 380 L 100 420 M 120 380 L 160 400 M 480 380 L 500 420 M 480 380 L 440 400',f?w*1.6:w);if(f){g.strokeStyle=f;g.lineWidth=w*.6;g.stroke(sp('M 300 120 L 300 500'))}},
 lotus:(g,w,f)=>{for(const d of['M 300 460 C 230 360 240 240 300 160 C 360 240 370 360 300 460 Z','M 300 460 C 180 420 150 320 160 250 C 240 280 290 360 300 460 Z','M 300 460 C 420 420 450 320 440 250 C 360 280 310 360 300 460 Z','M 300 460 C 160 470 90 410 70 360 C 160 350 250 400 300 460 Z','M 300 460 C 440 470 510 410 530 360 C 440 350 350 400 300 460 Z'])L(g,d,w,f)},
 sun:(g,w,f)=>{L(g,'M 300 300 m -90 0 a 90 90 0 1 0 180 0 a 90 90 0 1 0 -180 0',w,f);for(let i=0;i<12;i++){const a=i/12*Math.PI*2,c1=Math.cos(a),s1=Math.sin(a);L(g,`M ${300+c1*110} ${300+s1*110} L ${300+Math.cos(a+.13)*200} ${300+Math.sin(a+.13)*200} L ${300+Math.cos(a+.26)*110} ${300+Math.sin(a+.26)*110}`,w,f)}},
 eye:(g,w,f)=>{L(g,'M 80 300 Q 300 120 520 300 Q 300 480 80 300 Z',w);L(g,'M 300 300 m -70 0 a 70 70 0 1 0 140 0 a 70 70 0 1 0 -140 0',w,f||'#fff');L(g,'M 300 300 m -28 0 a 28 28 0 1 0 56 0 a 28 28 0 1 0 -56 0',w,K);for(let i=0;i<7;i++)L(g,`M ${150+i*50} ${225-Math.sin(i/6*Math.PI)*30} L ${140+i*52} ${170-Math.sin(i/6*Math.PI)*40}`,w*.7)},
 infinity:(g,w)=>L(g,'M 300 300 C 380 180 520 200 520 300 C 520 400 380 420 300 300 C 220 180 80 200 80 300 C 80 400 220 420 300 300 Z',w),
 cross:(g,w,f)=>L(g,'M 270 80 L 330 80 L 330 200 L 440 200 L 440 260 L 330 260 L 330 520 L 270 520 L 270 260 L 160 260 L 160 200 L 270 200 Z',w,f),
 compass:(g,w,f)=>{L(g,'M 300 300 m -200 0 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0',w);L(g,'M 300 80 L 335 300 L 300 520 L 265 300 Z',w,f);L(g,'M 80 300 L 300 270 L 520 300 L 300 330 Z',w,f?'#fff':null);g.fillStyle=K;g.font='bold 40px Georgia';g.textAlign='center';g.fillText('N',300,70)},
 paw:(g,w,f)=>{L(g,'M 300 320 C 220 320 190 420 230 450 C 270 470 330 470 370 450 C 410 420 380 320 300 320 Z',w,f);for(const[a,b2]of[[200,260],[260,200],[340,200],[400,260]])L(g,`M ${a} ${b2} m -32 0 a 32 40 0 1 0 64 0 a 32 40 0 1 0 -64 0`,w,f)},
 note:(g,w,f)=>{L(g,'M 230 450 m -50 0 a 50 38 0 1 0 100 0 a 50 38 0 1 0 -100 0 M 280 450 L 280 140 L 440 110 L 440 400 M 440 400 m -50 0 a 50 38 0 1 0 100 0 a 50 38 0 1 0 -100 0 M 280 190 L 440 160',w,f)},
 coffee:(g,w,f)=>{L(g,'M 150 250 L 420 250 L 400 470 Q 285 500 170 470 Z',w,f);L(g,'M 418 290 C 500 290 500 400 405 400',w);L(g,'M 230 220 C 210 180 260 160 240 110 M 300 220 C 280 180 330 160 310 110 M 360 220 C 340 180 390 160 370 110',w)},
 bolt:(g,w,f)=>L(g,'M 340 70 L 180 330 L 290 330 L 240 530 L 420 250 L 310 250 Z',w,f),
 stem:(g,w,f)=>{L(g,'M 300 540 C 290 400 320 300 300 180',w);for(const[a,b2,s]of[[300,430,-1],[305,350,1],[300,270,-1]])L(g,`M ${a} ${b2} Q ${a+s*70} ${b2-60} ${a+s*110} ${b2-20} Q ${a+s*60} ${b2+10} ${a} ${b2} Z`,w,f?'#5a3':null);L(g,'M 300 180 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0',w,f)},
 bee:(g,w,f)=>{L(g,'M 300 300 m -70 0 a 70 100 0 1 0 140 0 a 70 100 0 1 0 -140 0',w,f);L(g,'M 235 270 L 365 270 M 232 320 L 368 320 M 245 365 L 355 365',w*1.6);L(g,'M 290 210 C 200 120 120 170 170 230 C 200 260 260 240 290 220 Z M 310 210 C 400 120 480 170 430 230 C 400 260 340 240 310 220 Z',w,f?'#def':null);L(g,'M 300 200 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0',w,K)},
 branch:(g,w,f)=>{L(g,'M 80 480 C 220 400 360 280 520 120',w);for(let i=0;i<7;i++){const tx=120+i*58,ty=455-i*48;L(g,`M ${tx} ${ty} q ${-10} ${-60} ${-55} ${-70} q ${15} ${50} ${55} ${70} Z M ${tx} ${ty} q ${60} ${10} ${70} ${55} q ${-50} ${-15} ${-70} ${-55} Z`,w*.8,f)}},
 dragonfly:(g,w,f)=>{L(g,'M 300 140 L 300 520',w*2.2);for(const[a,s]of[[180,1],[230,.85]])for(const d of[-1,1])L(g,`M 300 ${a} C ${300+d*120} ${a-60} ${300+d*230} ${a-20} ${300+d*230*s} ${a+10} C ${300+d*200} ${a+40} ${300+d*100} ${a+30} 300 ${a} Z`,w,f)}
};
const FL=[];const add=(n,cat,fn)=>FL.push({n,cat,fn});
add('Classic Red Rose','Roses',g=>rose(g,300,300,170,'#c8202f','#3a9a3a'));
add('Black & Grey Rose','Roses',g=>rose(g,300,300,170,'#8a8a8a','#5a5a5a'));
add('Rose Bud Pair','Roses',g=>{rose(g,210,330,105,'#d23a55','#3a9a3a');rose(g,400,260,90,'#d23a55',null)});
add('Rose & Dagger','Roses',g=>{FINE.dagger(g,6,1);rose(g,300,330,120,'#c8202f','#3a9a3a')});
add('Line Rose','Roses',g=>rose(g,300,300,170,null,null));
add('Traditional Skull','Skulls',g=>skull(g,'#f2ead6'));
add('Black & Grey Skull','Skulls',g=>skull(g,'#bbb'));
add('Sugar Skull','Skulls',g=>skull(g,'#fff','#e83a8a'));
add('Skull & Rose','Skulls',g=>{g.save();g.translate(0,-40);skull(g,'#eee');g.restore();rose(g,420,470,80,'#c8202f','#3a9a3a')});
add('Classic Heart','Hearts',g=>stk(g,heartP(),8,'#d81f3c'));
add('Heart "Mom" Banner','Hearts',g=>{stk(g,heartP(),8,'#d81f3c');banner(g,330,'Mom',1)});
add('Sacred Heart','Hearts',g=>{L(g,'M 300 200 C 260 140 330 110 300 50 C 360 100 340 160 300 200 Z',6,'#f8a01c');stk(g,heartP(.85,0,30),8,'#c8102e');L(g,'M 300 40 L 300 110 M 270 70 L 330 70',8)});
add('Broken Heart','Hearts',g=>{stk(g,heartP(),8,'#b4182c');L(g,'M 300 210 L 270 290 L 330 350 L 280 430 L 300 520',8)});
add('Heart & Dagger','Hearts',g=>{stk(g,heartP(.8),8,'#d81f3c');FINE.dagger(g,6,1)});
add('Fine-line Heart','Hearts',g=>stk(g,heartP(),3,null));
add('Monarch Butterfly','Butterflies',g=>butterfly(g,'#f08a1c','#e06a10'));
add('Blue Butterfly','Butterflies',g=>butterfly(g,'#3a8ae0','#6a5ae0'));
add('Black & Grey Butterfly','Butterflies',g=>butterfly(g,'#999','#777'));
add('Fine-line Butterfly','Butterflies',g=>butterfly(g,null,null,3));
for(const w of['Mom','Love','Faith','Forever','Blessed','Dad'])add('Banner "'+w+'"','Script',g=>banner(g,310,w,1));
add('Script "Hope"','Script',g=>{g.fillStyle=K;g.font='italic 150px "Brush Script MT","Lucida Handwriting",cursive';g.textAlign='center';g.fillText('Hope',300,350)});
for(const[n,dot,col]of[[6,0,null],[8,1,null],[10,0,null],[12,1,null],[16,1,null],[8,0,['#3ab0c0','#e85a8a']],[12,0,['#8a5ae0','#f0b030']]])add((col?'Colour ':dot?'Dotwork ':'')+'Mandala '+n,'Mandalas',g=>mandala(g,n,dot,col));
add('Tribal Sun','Tribal',g=>tribal(g,8,1,60));add('Tribal Swirl','Tribal',g=>tribal(g,5,1.4,0));add('Tribal Star','Tribal',g=>tribal(g,6,.6,40));add('Tribal Armband','Tribal',armband);add('Tribal Wing','Tribal',twing);
for(const k of Object.keys(FINE))add('Fine-line '+k[0].toUpperCase()+k.slice(1),'Fine-line',g=>FINE[k](g,3.5,null));
const TRAD={anchor:'#2a5ab0',swallow:'#2a5ab0',dagger:1,compass:'#c23',lotus:'#e070a0',snake:'#3a9a3a',moon:'#f0c030',sun:'#f0a020',star:'#f0c030',eye:'#3a8ae0'};
for(const k in TRAD)add('Traditional '+k[0].toUpperCase()+k.slice(1),'Traditional',g=>FINE[k](g,8,TRAD[k]));
function flashCanvas(i,sz){const k=mk(600,600),g=k.getContext('2d');FL[i].fn(g);if(!sz||sz==600)return k;const s=mk(sz,sz);s.getContext('2d').drawImage(k,0,0,sz,sz);return s}
const DEMO_N=10,canUse=i=>!D||i<DEMO_N;
// ---------- state ----------
const S={tab:'skin',tool:'pen',lw:6,ink:'#111111',inkMode:'bg',replace:true,cat:'All',
 txt:'Forever',font:0,fsz:90,arc:0,tcol:'#111111',
 x:0,y:0,s:.5,r:0,op:.9,blend:'multiply',look:'fresh',tone:'auto',stencil:false,ba:false,split:.5,warp:false,bend:0,wrap:0,mesh:null,mirror:false,pcm:8,
 photo:null,gal:[]};
const FONTS=[['Script','italic 1px "Brush Script MT","Lucida Handwriting",cursive'],['Blackletter','bold 1px "Old English Text MT","UnifrakturMaguntia","Luminari",fantasy'],['Bold Block','bold 1px Impact,"Arial Black",sans-serif'],['Typewriter','bold 1px "Courier New",monospace'],['Serif Italic','italic bold 1px Georgia,serif'],['Handwritten','1px "Segoe Print","Comic Sans MS",cursive'],['Fine Line','300 1px "Helvetica Neue",Arial,sans-serif']];
const INKS={bg:['#111111','#333333','#555555','#777777','#999999','#ffffff'],col:['#111111','#c8202f','#f08a1c','#f0c030','#3a9a3a','#20a0a0','#2a5ab0','#8a3ac0','#e83a8a','#7a4a20']};
const dc=mk(600,600),dg=dc.getContext('2d');const undo=[];
function pushU(){undo.push(dg.getImageData(0,0,600,600));if(undo.length>25)undo.shift()}
function setFlash(i){if(!canUse(i)){window.demoEnd&&demoEnd('The free demo includes '+DEMO_N+' flash designs. The full version has all '+FL.length+' designs, warp & bend, and all 38 Coffeebreak songs.');return false}pushU();if(S.replace)dg.clearRect(0,0,600,600);dg.drawImage(flashCanvas(i),0,0);say('Added '+FL[i].n);return true}
function stampText(){pushU();const f=FONTS[S.font][1].replace('1px',S.fsz+'px');dg.save();dg.fillStyle=S.tcol;dg.font=f;dg.textAlign='center';dg.textBaseline='middle';const t=S.txt||'';
 if(!+S.arc){dg.fillText(t,300,300)}else{const a=+S.arc/100*Math.PI,wd=dg.measureText(t).width,rad=Math.max(80,wd/Math.max(.2,a));let ang=-a/2*Math.sign(a)*Math.sign(a)-Math.PI/2;const cy=300+rad;let pos=-wd/2;for(const ch of t){const cw=dg.measureText(ch).width;const th=(pos+cw/2)/rad-Math.PI/2;dg.save();dg.translate(300+Math.cos(th)*rad,cy+Math.sin(th)*rad);dg.rotate(th+Math.PI/2);dg.fillText(ch,0,0);dg.restore();pos+=cw}}
 dg.restore();say('Lettering added')}
// ---------- default skin ----------
function demoSkin(tone){const k=mk(1000,700),g=k.getContext('2d');const bg=g.createLinearGradient(0,0,0,700);bg.addColorStop(0,'#2a2024');bg.addColorStop(1,'#140c10');g.fillStyle=bg;g.fillRect(0,0,1000,700);
 const T=['#f3d2bd','#e6b896','#c99169','#a8714b','#7e5134','#4f3122'][tone||1];const gr=g.createLinearGradient(0,170,0,560);gr.addColorStop(0,'rgba(0,0,0,.25)');gr.addColorStop(.35,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(0,0,0,.35)');
 const arm=sp('M -20 200 C 300 160 650 190 1020 250 L 1020 520 C 650 560 300 590 -20 560 Z');g.fillStyle=T;g.fill(arm);g.fillStyle=gr;g.fill(arm);
 const id=g.getImageData(0,0,1000,700),p=id.data;for(let i=0;i<p.length;i+=4){const n=(Math.random()-.5)*10;p[i]+=n;p[i+1]+=n;p[i+2]+=n}g.putImageData(id,0,0);return k}
S.photo=demoSkin(1);
function centerDesign(){const P=S.photo;S.x=P.width/2;S.y=P.height/2;S.s=Math.min(P.width,P.height)*.55/600;S.r=0;resetMesh()}
function resetMesh(){S.mesh=[];for(let j=0;j<=4;j++){const row=[];for(let i=0;i<=4;i++)row.push([i*150,j*150]);S.mesh.push(row)}}
centerDesign();
// ---------- rendering ----------
function lp(px,py){// local design coords -> output coords, with bend/wrap
 const u=px/600,v=py/600;let X=px,Y=py;if(S.warp){Y+= +S.bend*1.8*(1-Math.pow(2*u-1,2));const w=+S.wrap/100;if(w){const k=w*1.4+.001;X=300+Math.sin((u-.5)*k*Math.PI)/Math.sin(k*Math.PI/2)*300;}}
 X-=300;Y-=300;const c1=Math.cos(S.r),s1=Math.sin(S.r);return[S.x+(X*c1-Y*s1)*S.s,S.y+(X*s1+Y*c1)*S.s]}
function tri(g,img,s,d){const ux=s[1][0]-s[0][0],uy=s[1][1]-s[0][1],vx=s[2][0]-s[0][0],vy=s[2][1]-s[0][1];const det=ux*vy-vx*uy;if(!det)return;
 const px=d[1][0]-d[0][0],py=d[1][1]-d[0][1],qx=d[2][0]-d[0][0],qy=d[2][1]-d[0][1];
 const a=(px*vy-qx*uy)/det,cc=(-px*vx+qx*ux)/det,b=(py*vy-qy*uy)/det,dd=(-py*vx+qy*ux)/det;const e=d[0][0]-a*s[0][0]-cc*s[0][1],f=d[0][1]-b*s[0][0]-dd*s[0][1];
 const mx=(d[0][0]+d[1][0]+d[2][0])/3,my=(d[0][1]+d[1][1]+d[2][1])/3;g.save();g.beginPath();d.forEach((p,i)=>{const L2=Math.hypot(p[0]-mx,p[1]-my)||1,ex=p[0]+(p[0]-mx)/L2*1.2,ey=p[1]+(p[1]-my)/L2*1.2;i?g.lineTo(ex,ey):g.moveTo(ex,ey)});g.closePath();g.clip();g.transform(a,b,cc,dd,e,f);g.drawImage(img,0,0);g.restore()}
function meshWarped(){if(!S.warp)return false;if(+S.bend||+S.wrap)return true;for(let j=0;j<=4;j++)for(let i=0;i<=4;i++)if(S.mesh[j][i][0]!=i*150||S.mesh[j][i][1]!=j*150)return true;return false}
function drawDesign(g,src){src=src||dc;if(!meshWarped()){g.save();g.translate(S.x,S.y);g.rotate(S.r);g.scale(S.s,S.s);g.drawImage(src,-300,-300);g.restore();return}
 const N=12,Q=[];for(let j=0;j<=N;j++){const row=[];for(let i=0;i<=N;i++){const u=i/N*4,v=j/N*4,i0=Math.min(3,u|0),j0=Math.min(3,v|0),fu=u-i0,fv=v-j0,m=S.mesh;
  const P=(a,b2)=>m[b2][a];const lx=(P(i0,j0)[0]*(1-fu)+P(i0+1,j0)[0]*fu)*(1-fv)+(P(i0,j0+1)[0]*(1-fu)+P(i0+1,j0+1)[0]*fu)*fv,ly=(P(i0,j0)[1]*(1-fu)+P(i0+1,j0)[1]*fu)*(1-fv)+(P(i0,j0+1)[1]*(1-fu)+P(i0+1,j0+1)[1]*fu)*fv;row.push([[i/N*600,j/N*600],lp(lx,ly)])}Q.push(row)}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=Q[j][i],b2=Q[j][i+1],c2=Q[j+1][i],d2=Q[j+1][i+1];tri(g,src,[a[0],b2[0],c2[0]],[a[1],b2[1],c2[1]]);tri(g,src,[b2[0],d2[0],c2[0]],[b2[1],d2[1],c2[1]])}}
function stencilOf(src){const k=mk(src.width,src.height),g=k.getContext('2d');g.drawImage(src,0,0);const id=g.getImageData(0,0,k.width,k.height),p=id.data,w=k.width,h=k.height,A=new Uint8Array(w*h);
 for(let i=0;i<w*h;i++){const a=p[i*4+3],l=(p[i*4]+p[i*4+1]+p[i*4+2])/3;A[i]=a>60&&l<200?1:(a>60?2:0)}
 for(let y=0;y<h;y++)for(let x0=0;x0<w;x0++){const i=y*w+x0;let on=0;if(A[i]==1)on=1;else if(A[i]==2){if(x0>0&&!A[i-1]||x0<w-1&&!A[i+1]||y>0&&!A[i-w]||y<h-1&&!A[i+w])on=1}
  p[i*4]=70;p[i*4+1]=40;p[i*4+2]=140;p[i*4+3]=on?235:0}g.putImageData(id,0,0);return k}
function skinLum(P){try{const g=P.getContext?P.getContext('2d'):null;let k=P;if(!g){k=mk(P.videoWidth||P.width,P.videoHeight||P.height);k.getContext('2d').drawImage(P,0,0)}const r=Math.max(10,150*S.s),id=k.getContext('2d').getImageData(Math.max(0,S.x-r),Math.max(0,S.y-r),r*2,r*2).data;let s=0,n=0;for(let i=0;i<id.length;i+=16){s+=.299*id[i]+.587*id[i+1]+.114*id[i+2];n++}return n?s/n/255:.6}catch(e){return .6}}
const TONES={auto:-1,'I':.85,'II':.75,'III':.62,'IV':.5,'V':.36,'VI':.22};
function compose(g,P,W,H,opt){opt=opt||{};g.drawImage(P,0,0,W,H);const Lc=mk(W,H),lg=Lc.getContext('2d');
 if(S.stencil){drawDesign(lg,stencilOf(dc));g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.9;g.drawImage(Lc,0,0);g.restore()}
 else{drawDesign(lg);const lum=S.tone=='auto'?skinLum(opt.lumSrc||P):TONES[S.tone],dark=Math.max(0,.7-lum)/.7;
  let f={fresh:'saturate(1.15) contrast(1.05)',healed:'blur(0.5px) saturate(.92)',aged:'blur(1.4px) saturate(.6) sepia(.18) contrast(.85) brightness(1.06)'}[S.look];f=f.replace(/saturate\(([\d.]+)\)/,(m,v)=>'saturate('+(v*(1-.35*dark)).toFixed(2)+')');
  if(S.look=='fresh'){const rd=mk(W,H),rg=rd.getContext('2d');rg.filter='blur('+Math.max(4,8*S.s)+'px)';rg.drawImage(Lc,0,0);rg.filter='none';rg.globalCompositeOperation='source-in';rg.fillStyle='rgb(225,70,70)';rg.fillRect(0,0,W,H);g.save();g.globalCompositeOperation='multiply';g.globalAlpha=.35;g.drawImage(rd,0,0);g.restore()}
  g.save();g.globalCompositeOperation=S.blend;g.globalAlpha=+S.op*(S.look=='aged'?.85:1);g.filter=f;g.drawImage(Lc,0,0);g.restore();
  if(dark>.2&&S.blend=='multiply'){g.save();g.globalCompositeOperation='soft-light';g.globalAlpha=.25*dark*+S.op;g.drawImage(Lc,0,0);g.restore()}
  if(S.look=='fresh'){g.save();g.globalCompositeOperation='screen';g.globalAlpha=.06;g.drawImage(Lc,0,0);g.restore()}}
 if(S.ba&&!opt.clean){const sx=W*S.split;g.save();g.beginPath();g.rect(sx,0,W-sx,H);g.clip();g.drawImage(P,0,0,W,H);g.restore();g.fillStyle='#fff';g.fillRect(sx-2,0,4,H);g.font='bold 22px Georgia';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(8,8,90,32);g.fillRect(W-110,8,100,32);g.fillStyle='#fff';g.textAlign='left';g.fillText('After',18,32);g.fillText('Before',W-100,32)}
 if(opt.mesh&&S.warp&&!D){g.save();g.strokeStyle='rgba(255,207,106,.8)';g.lineWidth=1.5;for(let j=0;j<=4;j++){g.beginPath();for(let i=0;i<=4;i++){const p=lp(...S.mesh[j][i]);i?g.lineTo(...p):g.moveTo(...p)}g.stroke()}for(let i=0;i<=4;i++){g.beginPath();for(let j=0;j<=4;j++){const p=lp(...S.mesh[j][i]);j?g.lineTo(...p):g.moveTo(...p)}g.stroke()}g.fillStyle='#ffcf6a';for(const row of S.mesh)for(const q of row){const p=lp(...q);g.beginPath();g.arc(p[0],p[1],7,0,7);g.fill()}g.restore()}}
function finalPNG(){const P=S.photo,k=mk(P.width,P.height);compose(k.getContext('2d'),P,P.width,P.height,{clean:true});return k}
function stencilSheet(){const s=stencilOf(dc);const k=mk(600,600),g=k.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,600,600);if(S.mirror){g.translate(600,0);g.scale(-1,1)}g.drawImage(s,0,0);return k}
function dl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove()}
function printStencil(){const url=stencilSheet().toDataURL('image/png');const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);
 f.srcdoc=`<html><head><style>@page{margin:10mm}body{margin:0;text-align:center;font-family:Georgia}</style></head><body><img src="${url}" style="width:${+S.pcm}cm;height:${+S.pcm}cm"><p style="font-size:10px">Coffeebreak Tattoo Studio stencil · ${+S.pcm} cm${S.mirror?' · mirrored':''}</p></body></html>`;
 f.onload=()=>{setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){}setTimeout(()=>f.remove(),2000)},200)};say('Opening print…')}
// ---------- gallery (device only) ----------
try{S.gal=JSON.parse(localStorage.ttGal||'[]')}catch(e){S.gal=[]}
function saveGal(k,name){const s=Math.min(1,900/Math.max(k.width,k.height)),t=mk(k.width*s|0,k.height*s|0);t.getContext('2d').drawImage(k,0,0,t.width,t.height);S.gal.unshift({id:Date.now(),d:new Date().toLocaleString(),n:name||'Tattoo try-on',img:t.toDataURL('image/jpeg',.82)});
 for(;;){try{localStorage.ttGal=JSON.stringify(S.gal);break}catch(e){if(S.gal.length<=1){say('Device storage is full.');break}S.gal.pop()}}say('💾 Saved to your gallery')}
// ---------- camera ----------
let stream=null;const vid=document.createElement('video');vid.playsInline=true;vid.muted=true;vid.setAttribute('playsinline','');
async function camOn(){if(stream)return true;try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},audio:false});vid.srcObject=stream;await vid.play();return true}catch(e){say('Camera not available: '+(e.name||e));return false}}
function camOff(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
function grabFrame(){const k=mk(vid.videoWidth||640,vid.videoHeight||480);k.getContext('2d').drawImage(vid,0,0,k.width,k.height);return k}
function loadPhoto(file){const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,1400/Math.max(im.width,im.height)),k=mk(im.width*s|0,im.height*s|0);k.getContext('2d').drawImage(im,0,0,k.width,k.height);S.photo=k;centerDesign();S.tab='place';draw();say('📷 Photo loaded. Now place your design.')};im.src=fr.result};fr.readAsDataURL(file)}
// ---------- UI ----------
let raf=0;
function tabs(){return `<h2>🖋️ Coffeebreak Tattoo Studio${D?' <span class="note">(free demo)</span>':''}</h2><div>${[['skin','1 · Skin photo'],['design','2 · Design'],['place','3 · Place on skin'],['ar','📱 Live AR'],['gal','🖼️ Gallery'],['help','❔ Help']].map(([k,l])=>`<button data-tab="${k}" class="${S.tab==k?'on':''}">${l}</button>`).join('')}</div>`}
function rng(k,min,max,step,lab){return `<label>${lab} <input type="range" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${S[k]}"></label>`}
function draw(){cancelAnimationFrame(raf);if(S.tab!='ar'&&S.tab!='skin')camOff();let h=tabs();
 if(S.tab=='skin')h+=`<div class="card"><p>Take or upload a photo of the body part you want tattooed (arm, wrist, ankle, back, shoulder…). Good light and a straight-on angle work best. Your photo stays on this device.</p>
  <label><button data-a="up">📁 Upload a photo</button></label><input type="file" id="ttFile" accept="image/*" style="display:none"> <button data-a="camstart">📷 Use live camera</button> <button data-a="snap" ${stream?'':'disabled'}>📸 Capture photo</button> <button data-a="sample">✨ Use a sample arm</button>
  <select id="ttTone">${['Very light','Light','Medium','Tan','Brown','Deep'].map((t,i)=>`<option value="${i}">${t} sample skin</option>`).join('')}</select>
  <div class="row" style="margin-top:8px"><video id="ttVid" playsinline muted style="max-width:520px;width:100%;border-radius:10px;display:${stream?'block':'none'}"></video><canvas id="ttPrev" class="stage" style="max-width:520px;width:100%"></canvas></div></div>`;
 if(S.tab=='design'){const cats=['All',...new Set(FL.map(f=>f.cat))];
  h+=`<div class="row"><div class="card"><div>${[['pen','✒️ Pen'],['brush','🖌️ Brush'],['eraser','🧽 Eraser']].map(([k,l])=>`<button data-tool="${k}" class="${S.tool==k?'on':''}">${l}</button>`).join('')} <button data-a="undo">↶ Undo</button> <button data-a="clear">🗑️ Clear</button></div>
  <div>Line weight: ${[1,2,4,6,10,16,26].map(w=>`<button data-lw="${w}" class="${S.lw==w?'on':''}">${w}</button>`).join('')}</div>
  <div><button data-ink="bg" class="${S.inkMode=='bg'?'on':''}">Black & grey ink</button><button data-ink="col" class="${S.inkMode=='col'?'on':''}">Colour ink</button> ${INKS[S.inkMode].map(cl=>`<span class="sw ${S.ink==cl?'on':''}" data-sw="${cl}" style="background:${cl}"></span>`).join('')}</div>
  <canvas id="ttDraw" class="chk" width="600" height="600" style="width:440px;height:440px"></canvas></div>
  <div class="card" style="flex:1;min-width:300px"><b>Flash library</b> <span class="note">(${FL.length} original designs${D?', '+DEMO_N+' in the demo':''})</span> <label><input type="checkbox" id="ttRep" ${S.replace?'checked':''}> replace current design</label><div>${cats.map(k=>`<button data-cat="${k}" class="${S.cat==k?'on':''}">${k}</button>`).join('')}</div>
  <div class="flash">${FL.map((f,i)=>S.cat=='All'||f.cat==S.cat?`<div class="fl ${canUse(i)?'':'lock'}" data-fl="${i}"><canvas data-th="${i}" width="80" height="80"></canvas><br>${esc(f.n)}</div>`:'').join('')}</div>
  <hr><b>Lettering</b><br><input type="text" id="ttTxt" value="${esc(S.txt)}" maxlength="40"> <select id="ttFont">${FONTS.map((f,i)=>`<option value="${i}" ${S.font==i?'selected':''}>${f[0]}</option>`).join('')}</select>
  <label>Size <input type="number" id="ttFsz" value="${S.fsz}" min="20" max="250"></label> <label>Arc <input type="range" id="ttArc" min="-100" max="100" value="${S.arc}"></label> <input type="color" id="ttTcol" value="${S.tcol}"> <button data-a="text">➕ Add lettering</button>
  <p class="note">Fonts use the tattoo-style fonts installed on your device, with fallbacks.</p><button data-tab="place">Next: place on skin ➜</button></div></div>`}
 if(S.tab=='place')h+=`<div class="card">${placeCtl()}</div><canvas id="ttStage" class="stage"></canvas><div class="card"><button data-a="png">💾 Save PNG</button> <button data-a="gal">🖼️ Save to gallery</button> <button data-a="stpng">Download stencil PNG</button> <label>Stencil size <input type="number" id="ttPcm" value="${S.pcm}" min="2" max="30"> cm</label> <label><input type="checkbox" id="ttMir" ${S.mirror?'checked':''}> mirror</label> <button data-a="print">🖨️ Print stencil</button></div>`;
 if(S.tab=='ar')h+=`<div class="card"><p>Point your camera at the body part. Drag to move the design, and use the sliders to size and turn it. ${stream?'':'<button data-a="arstart">📷 Start camera</button>'} <button data-a="arsnap" ${stream?'':'disabled'}>📸 Snapshot</button> <button data-a="arfreeze" ${stream?'':'disabled'}>Use frame as skin photo</button></p>${rng('s',.1,2,.01,'Size')}${rng('r',-3.14,3.14,.01,'Rotate')}${rng('op',.2,1,.05,'Opacity')}</div><canvas id="ttAR" class="stage" width="960" height="540"></canvas>`;
 if(S.tab=='gal')h+=`<div class="card"><p>Your saved try-ons are stored on this device only.</p><div class="gal">${S.gal.length?S.gal.map((g,i)=>`<div class="gi"><img src="${g.img}"><br>${esc(g.n)}<br><span class="note">${esc(g.d)}</span><br><button data-gdl="${i}">⬇️</button><button data-gdel="${i}">🗑️</button></div>`).join(''):'<p class="note">Nothing saved yet.</p>'}</div></div>`;
 if(S.tab=='help')h+=`<div class="card"><h3>How it works</h3><ol><li><b>Skin photo:</b> upload a photo or capture one with your camera.</li><li><b>Design:</b> draw with the pen, brush and eraser, pick a flash design, or add lettering.</li><li><b>Place:</b> drag to move, use the sliders to scale and rotate, and turn on Warp to bend the design around curves (drag the yellow points).</li><li>Choose the ink look (fresh, healed or aged), the opacity and the skin tone, check the stencil view, and compare before and after.</li><li>Save a PNG, keep it in the gallery or print a stencil.</li></ol><p class="note">This is a visual preview for fun and planning. Real tattoos look different on real skin, so always talk to a licensed tattoo artist. Everything stays on your device: nothing is uploaded. All flash designs are original Coffeebreak art.</p></div>`;
 R.innerHTML=h;after()}
function placeCtl(){return `${rng('s',.05,3,.01,'Scale')}${rng('r',-3.14,3.14,.01,'Rotate')}${rng('op',.1,1,.05,'Opacity')}
 <label>Blend <select id="ttBlend"><option value="multiply" ${S.blend=='multiply'?'selected':''}>Multiply (realistic)</option><option value="source-over" ${S.blend=='source-over'?'selected':''}>Normal</option></select></label>
 <label>Look <select id="ttLook">${['fresh','healed','aged'].map(k=>`<option ${S.look==k?'selected':''} value="${k}">${k[0].toUpperCase()+k.slice(1)}</option>`).join('')}</select></label>
 <label>Skin tone <select id="ttSkin">${Object.keys(TONES).map(k=>`<option ${S.tone==k?'selected':''} value="${k}">${k=='auto'?'Auto-detect':'Type '+k}</option>`).join('')}</select></label>
 <button data-tg="stencil" class="${S.stencil?'on':''}">Stencil view</button><button data-tg="ba" class="${S.ba?'on':''}">Before / after</button> ${S.ba?rng('split',0,1,.01,'Split'):''}
 <br><button data-tg="warp" class="${S.warp?'on':''}" ${D?'disabled':''}>🌀 Warp / bend mesh</button>${D?' <span class="note">🔒 Warp is in the full version</span>':''} ${S.warp?rng('bend',-100,100,1,'Bend')+rng('wrap',0,100,1,'Wrap around')+'<button data-a="mreset">Reset mesh</button>':''} <button data-a="center">Re-centre</button>`}
function after(){const q=s=>R.querySelector(s);
 R.querySelectorAll('canvas[data-th]').forEach(k=>k.getContext('2d').drawImage(flashCanvas(+k.dataset.th),0,0,80,80));
 const dr=q('#ttDraw');if(dr){const g=dr.getContext('2d');const rd=()=>{g.clearRect(0,0,600,600);g.drawImage(dc,0,0)};rd();let down=0,lx=0,ly=0;
  const P=e=>{const r=dr.getBoundingClientRect();return[(e.clientX-r.left)*600/r.width,(e.clientY-r.top)*600/r.height]};
  dr.onpointerdown=e=>{down=1;dr.setPointerCapture(e.pointerId);pushU();[lx,ly]=P(e);seg(lx,ly,lx+.1,ly)};
  dr.onpointermove=e=>{if(!down)return;const[a,b2]=P(e);seg(lx,ly,a,b2);lx=a;ly=b2};dr.onpointerup=dr.onpointercancel=()=>down=0;
  function seg(a,b2,c2,d2){dg.save();dg.lineCap=dg.lineJoin='round';dg.lineWidth=S.lw;if(S.tool=='eraser'){dg.globalCompositeOperation='destination-out';dg.lineWidth=S.lw*2}else{dg.strokeStyle=S.ink;if(S.tool=='brush'){dg.globalAlpha=.55;dg.shadowColor=S.ink;dg.shadowBlur=S.lw;dg.lineWidth=S.lw*1.6}}dg.beginPath();dg.moveTo(a,b2);dg.lineTo(c2,d2);dg.stroke();dg.restore();rd()}}
 const st=q('#ttStage');if(st){const P=S.photo;st.width=P.width;st.height=P.height;const g=st.getContext('2d');const rr=()=>compose(g,P,P.width,P.height,{mesh:1});rr();S._rr=rr;
  let mode=null,off=[0,0],mi=null;const pt=e=>{const r=st.getBoundingClientRect();return[(e.clientX-r.left)*st.width/r.width,(e.clientY-r.top)*st.height/r.height]};
  st.onpointerdown=e=>{const p=pt(e);st.setPointerCapture(e.pointerId);if(S.ba&&Math.abs(p[0]-st.width*S.split)<20){mode='split';return}
   if(S.warp&&!D){let best=1e9;for(let j=0;j<=4;j++)for(let i=0;i<=4;i++){const m=lp(...S.mesh[j][i]),dd=Math.hypot(m[0]-p[0],m[1]-p[1]);if(dd<best){best=dd;mi=[j,i]}}if(best<30){mode='mesh';return}}mode='move';off=[p[0]-S.x,p[1]-S.y]};
  st.onpointermove=e=>{if(!mode)return;const p=pt(e);if(mode=='move'){S.x=p[0]-off[0];S.y=p[1]-off[1]}else if(mode=='split'){S.split=Math.max(0,Math.min(1,p[0]/st.width))}else{const c1=Math.cos(-S.r),s1=Math.sin(-S.r),dx=(p[0]-S.x)/S.s,dy=(p[1]-S.y)/S.s;S.mesh[mi[0]][mi[1]]=[dx*c1-dy*s1+300,dx*s1+dy*c1+300]}rr()};
  st.onpointerup=st.onpointercancel=()=>mode=null;st.onwheel=e=>{e.preventDefault();S.s=Math.max(.05,Math.min(3,S.s*(e.deltaY<0?1.06:.94)));rr();const r=q('[data-k=s]');if(r)r.value=S.s},{passive:false}}
 const ar=q('#ttAR');if(ar){const g=ar.getContext('2d');let mv=0,off=[0,0];const pt=e=>{const r=ar.getBoundingClientRect();return[(e.clientX-r.left)*ar.width/r.width,(e.clientY-r.top)*ar.height/r.height]};
  if(S.x>ar.width||S.y>ar.height){S.x=ar.width/2;S.y=ar.height/2}
  ar.onpointerdown=e=>{mv=1;const p=pt(e);off=[p[0]-S.x,p[1]-S.y]};ar.onpointermove=e=>{if(mv){const p=pt(e);S.x=p[0]-off[0];S.y=p[1]-off[1]}};ar.onpointerup=()=>mv=0;
  const loop=()=>{if(stream&&vid.videoWidth){if(ar.width!=vid.videoWidth){ar.width=vid.videoWidth;ar.height=vid.videoHeight}compose(g,vid,ar.width,ar.height,{clean:true})}else{g.fillStyle='#111';g.fillRect(0,0,ar.width,ar.height);g.fillStyle='#ffe9c7';g.font='24px Georgia';g.textAlign='center';g.fillText('Start the camera to try your tattoo on live',ar.width/2,ar.height/2);g.textAlign='left'}raf=requestAnimationFrame(loop)};loop()}
 const pv=q('#ttPrev');if(pv){pv.width=S.photo.width;pv.height=S.photo.height;pv.getContext('2d').drawImage(S.photo,0,0)}
 const v=q('#ttVid');if(v&&stream){v.srcObject=stream;v.play().catch(()=>{})}
 const fi=q('#ttFile');if(fi)fi.onchange=()=>fi.files[0]&&loadPhoto(fi.files[0]);
 R.querySelectorAll('input[type=range][data-k]').forEach(r=>r.oninput=()=>{S[r.dataset.k]=+r.value;S._rr&&q('#ttStage')&&S._rr()});
 const on=(id,fn,ev)=>{const e=q(id);if(e)e[ev||'onchange']=()=>{fn(e);if(q('#ttStage'))S._rr()}};
 on('#ttBlend',e=>S.blend=e.value);on('#ttLook',e=>S.look=e.value);on('#ttSkin',e=>S.tone=e.value);on('#ttPcm',e=>S.pcm=Math.max(2,Math.min(30,+e.value||8)));on('#ttMir',e=>S.mirror=e.checked);
 on('#ttRep',e=>S.replace=e.checked);on('#ttTxt',e=>S.txt=e.value,'oninput');on('#ttFont',e=>S.font=+e.value);on('#ttFsz',e=>S.fsz=+e.value||90);on('#ttArc',e=>S.arc=+e.value,'oninput');on('#ttTcol',e=>S.tcol=e.value,'oninput')}
R.addEventListener('click',async e=>{const t=e.target.closest('[data-tab],[data-a],[data-tool],[data-lw],[data-ink],[data-sw],[data-cat],[data-fl],[data-tg],[data-gdl],[data-gdel]');if(!t)return;const d=t.dataset;
 if(d.tab){S.tab=d.tab;if(d.tab=='place'&&(S.x>S.photo.width||S.y>S.photo.height))centerDesign();return draw()}
 if(d.tool){S.tool=d.tool}if(d.lw){S.lw=+d.lw}if(d.ink){S.inkMode=d.ink;S.ink=INKS[d.ink][d.ink=='bg'?0:1]}if(d.sw){S.ink=d.sw}if(d.cat){S.cat=d.cat}
 if(d.fl!==undefined){setFlash(+d.fl)}
 if(d.tg){if(d.tg=='warp'&&D)return;S[d.tg]=!S[d.tg]}
 if(d.gdl!==undefined){dl(S.gal[+d.gdl].img,'tattoo-'+S.gal[+d.gdl].id+'.jpg');return}
 if(d.gdel!==undefined){S.gal.splice(+d.gdel,1);localStorage.ttGal=JSON.stringify(S.gal)}
 const a=d.a;
 if(a=='up'){R.querySelector('#ttFile').click();return}
 if(a=='sample'){S.photo=demoSkin(+R.querySelector('#ttTone').value);centerDesign();say('Sample skin ready')}
 if(a=='camstart'||a=='arstart'){await camOn()}
 if(a=='snap'&&stream){S.photo=grabFrame();centerDesign();camOff();S.tab='place';say('📸 Captured!')}
 if(a=='arsnap'&&stream){const k=mk(vid.videoWidth,vid.videoHeight);compose(k.getContext('2d'),vid,k.width,k.height,{clean:true});saveGal(k,'Live AR snapshot');dl(k.toDataURL('image/png'),'tattoo-ar.png');return}
 if(a=='arfreeze'&&stream){const sx=S.x/(R.querySelector('#ttAR').width),sy=S.y/(R.querySelector('#ttAR').height);S.photo=grabFrame();S.x=sx*S.photo.width;S.y=sy*S.photo.height;camOff();S.tab='place'}
 if(a=='undo'&&undo.length)dg.putImageData(undo.pop(),0,0);if(a=='clear'){pushU();dg.clearRect(0,0,600,600)}if(a=='text')stampText();
 if(a=='mreset'){resetMesh();S.bend=0;S.wrap=0}if(a=='center')centerDesign();
 if(a=='png'){dl(finalPNG().toDataURL('image/png'),'coffeebreak-tattoo.png');say('💾 PNG saved');return}
 if(a=='gal'){saveGal(finalPNG());return}if(a=='stpng'){dl(stencilSheet().toDataURL('image/png'),'tattoo-stencil.png');return}if(a=='print'){printStencil();return}
 draw()});
setFlash(0);undo.length=0;draw();
window.TT={S,FL,setFlash,finalPNG,stencilSheet,compose,stampText,meshWarped,get dc(){return dc},redraw:draw};
})();
function update(){}function draw(){}
