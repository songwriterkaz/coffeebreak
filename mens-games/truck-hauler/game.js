let s;const LX=[110,200,290];
const G={title:'CB Truck Hauler',how:'Tap left/right side or arrow keys to change lanes',
start(l){s={l,lane:1,x:200,d:0,goal:1500+l*500,sp:220+l*25,cars:[],spawn:0,fuel:1,cans:[],hits:0}},
mv(d){s.lane=Math.max(0,Math.min(2,s.lane+d))},down(p){G.mv(p.x<200?-1:1)},key(k){if(k==='ArrowLeft')G.mv(-1);if(k==='ArrowRight')G.mv(1)},
update(dt){s.x+=(LX[s.lane]-s.x)*Math.min(1,dt*12);s.d+=s.sp*dt*.5;s.fuel-=dt*.03;s.spawn-=dt;
 if(s.spawn<=0){s.spawn=Math.max(.45,1.3-s.l*.1);const ln=Math.random()*3|0;(Math.random()<.18?s.cans:s.cars).push({x:LX[ln],y:-60})}
 for(const c of s.cars){c.y+=s.sp*.75*dt;if(Math.abs(c.x-s.x)<45&&Math.abs(c.y-520)<70){c.y=999;s.hits++;s.fuel-=.2}}
 for(const c of s.cans){c.y+=s.sp*dt;if(Math.abs(c.x-s.x)<45&&Math.abs(c.y-520)<60){c.y=999;s.fuel=Math.min(1,s.fuel+.3)}}
 s.cars=s.cars.filter(c=>c.y<700);s.cans=s.cans.filter(c=>c.y<700);
 if(s.fuel<=0)CB.lose(s.hits>2?'Rig wrecked':'Out of diesel');if(s.d>=s.goal)CB.win('Load delivered')},
draw(g){g.fillStyle='#c2a36b';g.fillRect(0,0,400,640);g.fillStyle='#444';g.fillRect(60,0,280,640);g.fillStyle='#fd0';
 const o=(s.d*2)%80;for(let y=-80+o;y<640;y+=80){g.fillRect(153,y,4,40);g.fillRect(243,y,4,40)}
 s.cars.forEach(c=>{g.fillStyle='#4af';g.fillRect(c.x-22,c.y-35,44,70)});s.cans.forEach(c=>{g.fillStyle='#2c6';g.fillRect(c.x-14,c.y-18,28,36);CB.text('D',c.x,c.y+7,16)});
 g.fillStyle='#e0407b';g.fillRect(s.x-26,470,52,40);g.fillStyle='#ddd';g.fillRect(s.x-28,510,56,90);CB.text('CB',s.x,560,18,'#e0407b');
 g.fillStyle='#000a';g.fillRect(20,20,360,20);g.fillStyle='#2c6';g.fillRect(20,20,360*Math.max(0,s.fuel),20);
 CB.text('Fuel',30,36,13,'#fff','left');CB.text(Math.max(0,(s.goal-s.d)/100|0)/10+' km to go  Lvl '+s.l,200,62,15)}};CB.game(G);
