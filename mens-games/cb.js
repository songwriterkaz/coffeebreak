// Coffeebreak mini engine: fixed 400x640 logical canvas, scaled; unified pointer input
const CB={W:400,H:640,keys:{},ptr:{down:false,x:0,y:0,sx:0,sy:0,t0:0},handlers:{}};
(function(){
 const c=document.getElementById('c'),g=c.getContext('2d');CB.c=c;CB.g=g;
 function fit(){const box=document.getElementById('wrap');const w=Math.min(box.clientWidth,(window.innerHeight-150)*CB.W/CB.H,560);
  const dpr=window.devicePixelRatio||1;c.style.width=w+'px';c.style.height=(w*CB.H/CB.W)+'px';c.width=CB.W*dpr;c.height=CB.H*dpr;g.setTransform(dpr,0,0,dpr,0,0);}
 addEventListener('resize',fit);fit();
 function pos(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*CB.W/r.width,y:(e.clientY-r.top)*CB.H/r.height}}
 c.addEventListener('pointerdown',e=>{e.preventDefault();c.setPointerCapture(e.pointerId);const p=pos(e);Object.assign(CB.ptr,{down:true,x:p.x,y:p.y,sx:p.x,sy:p.y,t0:performance.now()});CB.handlers.down&&CB.handlers.down(p)});
 c.addEventListener('pointermove',e=>{const p=pos(e);CB.ptr.x=p.x;CB.ptr.y=p.y;CB.handlers.move&&CB.handlers.move(p)});
 c.addEventListener('pointerup',e=>{const p=pos(e);CB.ptr.down=false;CB.handlers.up&&CB.handlers.up(p,{dx:p.x-CB.ptr.sx,dy:p.y-CB.ptr.sy,dt:performance.now()-CB.ptr.t0})});
 addEventListener('keydown',e=>{if([' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(!CB.keys[e.key]){CB.keys[e.key]=true;CB.handlers.key&&CB.handlers.key(e.key)}});
 addEventListener('keyup',e=>{CB.keys[e.key]=false;CB.handlers.keyup&&CB.handlers.keyup(e.key)});
 let last=performance.now();function loop(t){const dt=Math.min(0.05,(t-last)/1000);last=t;CB.update&&CB.update(dt);CB.draw&&CB.draw(g);requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();
CB.full=()=>localStorage.getItem('cbfull-'+CB.slug)==='1'||new URLSearchParams(location.search).get('karen')==='free';
CB.DEMO=3; // free levels
CB.locked=lvl=>lvl>CB.DEMO&&!CB.full();
CB.text=(s,x,y,sz=20,col='#fff',al='center')=>{const g=CB.g;g.fillStyle=col;g.font='bold '+sz+'px system-ui,sans-serif';g.textAlign=al;g.fillText(s,x,y)};
CB.btn=(s,x,y,w,h,col='#e0407b')=>{const g=CB.g;g.fillStyle=col;g.beginPath();g.roundRect(x-w/2,y-h/2,w,h,12);g.fill();CB.text(s,x,y+7,20)};
CB.hit=(p,x,y,w,h)=>p.x>x-w/2&&p.x<x+w/2&&p.y>y-h/2&&p.y<y+h/2;
CB.paywall=()=>{document.getElementById('pay').style.display='flex'};
// level flow
CB.mode='menu';CB.level=1;CB.msg='';
CB.game=function(G){CB.G=G;
 CB.update=dt=>{if(CB.mode==='play')G.update(dt)};
 CB.draw=g=>{G.draw(g);if(CB.mode!=='play'){g.fillStyle='#000a';g.fillRect(0,0,CB.W,CB.H);
  if(CB.mode==='menu'){CB.text(G.title,200,220,30,'#ff8fc0');CB.text(G.how,200,260,15,'#ddd');CB.text('Level '+CB.level,200,300,18)}
  else CB.text(CB.msg,200,260,26,CB.mode==='win'?'#7fffa0':'#ff8080');
  CB.btn(CB.mode==='menu'?'PLAY':CB.mode==='win'?'NEXT LEVEL':'TRY AGAIN',200,360,200,56)}};
 const go=()=>{if(CB.mode==='win')CB.level++;if(CB.locked(CB.level)){CB.level=CB.DEMO;CB.mode='menu';CB.paywall();return}CB.mode='play';G.start(CB.level)};
 CB.handlers.down=p=>{if(CB.mode!=='play'){if(CB.hit(p,200,360,220,70))go();return}G.down&&G.down(p)};
 CB.handlers.move=p=>{CB.mode==='play'&&G.move&&G.move(p)};
 CB.handlers.up=(p,s)=>{CB.mode==='play'&&G.up&&G.up(p,s)};
 CB.handlers.key=k=>{if(CB.mode!=='play'){if(k===' '||k==='Enter')go();return}G.key&&G.key(k)};
 CB.handlers.keyup=k=>{CB.mode==='play'&&G.keyup&&G.keyup(k)};
 G.start(1);
};
CB.win=m=>{CB.mode='win';CB.msg=m||'Level cleared';};
CB.lose=m=>{CB.mode='lose';CB.msg=m||'Out of luck';};
CB.R=(a,b)=>a+Math.random()*(b-a);
