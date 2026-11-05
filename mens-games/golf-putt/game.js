let s;const LV=l=>{const r=[];for(let i=0;i<Math.min(6,l);i++)r.push({x:CB.R(70,260),y:CB.R(180,440),w:CB.R(50,100),h:16});return r};
const G={title:'CB Golf Putting',how:'Drag back from the ball and release to putt. Par 3',
start(l){s={l,b:{x:200,y:560,vx:0,vy:0},hole:{x:CB.R(80,320),y:110},walls:LV(l),strokes:0,aim:null}},
down(p){const b=s.b;if(Math.hypot(b.vx,b.vy)<5&&Math.hypot(p.x-b.x,p.y-b.y)<80)s.aim=p},move(p){if(s.aim)s.aim=p},
up(p){if(!s.aim)return;const b=s.b;b.vx=(b.x-p.x)*4;b.vy=(b.y-p.y)*4;const m=Math.hypot(b.vx,b.vy);if(m>700){b.vx*=700/m;b.vy*=700/m}s.aim=null;s.strokes++},
key(k){const b=s.b;if(k===' '&&Math.hypot(b.vx,b.vy)<5){const a=Math.atan2(s.hole.y-b.y,s.hole.x-b.x);b.vx=Math.cos(a)*400;b.vy=Math.sin(a)*400;s.strokes++}},
update(dt){const b=s.b;b.x+=b.vx*dt;b.y+=b.vy*dt;const f=Math.pow(.22,dt);b.vx*=f;b.vy*=f;
 if(b.x<20||b.x>380){b.vx*=-1;b.x=Math.max(20,Math.min(380,b.x))}if(b.y<20||b.y>620){b.vy*=-1;b.y=Math.max(20,Math.min(620,b.y))}
 for(const w of s.walls)if(b.x>w.x-8&&b.x<w.x+w.w+8&&b.y>w.y-8&&b.y<w.y+w.h+8){if(b.y<w.y||b.y>w.y+w.h)b.vy*=-1;else b.vx*=-1;b.x+=b.vx*dt*2;b.y+=b.vy*dt*2}
 const sp=Math.hypot(b.vx,b.vy);if(Math.hypot(b.x-s.hole.x,b.y-s.hole.y)<14&&sp<450){CB.win(s.strokes<=1?'Hole in one':s.strokes<=3?'Sunk it, '+s.strokes+' putts':'In, but over par');if(s.strokes>3)CB.mode='lose'}
 else if(sp<5&&s.strokes>=3&&!s.aim){CB.lose('Over par')}},
draw(g){g.fillStyle='#2e8b3e';g.fillRect(0,0,400,640);g.fillStyle='#000';g.beginPath();g.arc(s.hole.x,s.hole.y,13,0,7);g.fill();g.fillStyle='#e0407b';g.fillRect(s.hole.x,s.hole.y-60,3,60);g.fillRect(s.hole.x+3,s.hole.y-60,24,14);
 g.fillStyle='#7a4a24';s.walls.forEach(w=>g.fillRect(w.x,w.y,w.w,w.h));const b=s.b;g.fillStyle='#fff';g.beginPath();g.arc(b.x,b.y,8,0,7);g.fill();
 if(s.aim){g.strokeStyle='#ff0';g.lineWidth=3;g.beginPath();g.moveTo(b.x,b.y);g.lineTo(b.x+(b.x-s.aim.x),b.y+(b.y-s.aim.y));g.stroke();g.lineWidth=1}
 CB.text('Strokes '+s.strokes+'/3   Lvl '+s.l,200,625,16)}};CB.game(G);
