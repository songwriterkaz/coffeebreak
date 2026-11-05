let s;function rack(){const p=[];for(let r=0;r<4;r++)for(let i=0;i<=r;i++)p.push({x:200+(i-r/2)*34,y:150-r*30,vx:0,vy:0,down:false});return p}
const G={title:'CB Ten Pin Bowling',how:'Swipe up to bowl (sideways swipe = curve). Score target in 3 frames',
start(l){s={l,frame:1,roll:1,score:0,target:12+l*3,pins:rack(),ball:null,aimx:200,dir:1,t:0}},
up(p,w){if(s.ball||w.dy>-30)return;const sp=Math.min(900,-w.dy/w.dt*700);s.ball={x:s.aimx,y:580,vx:w.dx*.3,vy:-Math.max(350,sp)}},
key(k){if(k===' '&&!s.ball)s.ball={x:s.aimx,y:580,vx:0,vy:-650}},
update(dt){s.t+=dt;if(!s.ball){s.aimx=200+Math.sin(s.t*(1.5+s.l*.2))*120;return}const b=s.ball;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<85||b.x>315){b.vx=0;b.x=Math.max(85,Math.min(315,b.x))}
 for(const p of s.pins){if(!p.down&&Math.hypot(p.x-b.x,p.y-b.y)<26){p.down=true;p.vx=(p.x-b.x)*8;p.vy=b.vy*.5}}
 for(const p of s.pins)if(p.down){p.x+=p.vx*dt;p.y+=p.vy*dt;for(const q of s.pins)if(!q.down&&Math.hypot(p.x-q.x,p.y-q.y)<22){q.down=true;q.vx=p.vx*.8+CB.R(-60,60);q.vy=p.vy*.8}}
 if(b.y<-30){s.ball=null;const n=s.pins.filter(p=>p.down&&!p.cnt).length;s.pins.forEach(p=>{if(p.down)p.cnt=1});s.score+=n;
  const all=s.pins.every(p=>p.down);if(all&&s.roll===1)s.score+=5;if(s.roll===1&&!all)s.roll=2;else{s.roll=1;s.frame++;s.pins=rack()}
  if(s.score>=s.target)CB.win('Score '+s.score);else if(s.frame>3)CB.lose('Scored '+s.score+', needed '+s.target)}},
draw(g){g.fillStyle='#1a1020';g.fillRect(0,0,400,640);g.fillStyle='#d8b07a';g.fillRect(80,0,240,640);g.fillStyle='#222';g.fillRect(60,0,20,640);g.fillRect(320,0,20,640);
 s.pins.forEach(p=>{if(p.down&&p.cnt)return;g.fillStyle=p.down?'#aaa':'#fff';g.beginPath();g.arc(p.x,p.y,10,0,7);g.fill();g.fillStyle='#e00';g.fillRect(p.x-6,p.y-2,12,3)});
 const b=s.ball||{x:s.aimx,y:580};g.fillStyle='#e0407b';g.beginPath();g.arc(b.x,b.y,16,0,7);g.fill();
 CB.text('Frame '+Math.min(3,s.frame)+'/3 Roll '+s.roll+'  Score '+s.score+'/'+s.target+'  Lvl '+s.l,200,625,15)}};CB.game(G);
