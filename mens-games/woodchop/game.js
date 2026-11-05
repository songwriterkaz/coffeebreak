let s;const G={title:'CB Axe Woodchop',how:'Tap / Space when the marker is in the gold zone. Chop logs before the timer',
start(l){s={l,m:0,dir:1,sp:1.2+l*.35,zone:CB.R(.25,.65),zw:.18-l*.012,hp:5,logs:0,goal:3+l,time:20+l*2,msg:'',mt:0,shake:0}},
chop(){const c=s.zone+s.zw/2,d=Math.abs(s.m-c);s.mt=.5;if(d<s.zw*.2){s.hp-=2;s.msg='CRACK';s.shake=.2}else if(d<s.zw/2){s.hp-=1;s.msg='Chop'}else{s.msg='Glanced';s.time-=1}
 if(s.hp<=0){s.logs++;s.hp=5;if(s.logs>=s.goal)CB.win('Woodpile stacked')}s.zone=CB.R(.1,.9-s.zw)},
down(){G.chop()},key(k){if(k===' ')G.chop()},
update(dt){s.m+=s.dir*s.sp*dt;if(s.m>1){s.m=1;s.dir=-1}if(s.m<0){s.m=0;s.dir=1}s.time-=dt;s.mt-=dt;s.shake-=dt;if(s.time<=0)CB.lose('Out of time')},
draw(g){g.fillStyle='#24331f';g.fillRect(0,0,400,640);const sx=s.shake>0?CB.R(-4,4):0;g.fillStyle='#8a5a32';g.fillRect(130+sx,300,140,140);g.fillStyle='#d6a96a';g.beginPath();g.ellipse(200+sx,300,70,22,0,0,7);g.fill();
 g.fillStyle='#ccc';g.fillRect(190,180,20,110);g.fillStyle='#e0407b';g.fillRect(170,170,60,30);
 g.fillStyle='#000';g.fillRect(40,500,320,30);g.fillStyle='#fc0';g.fillRect(40+320*s.zone,500,320*s.zw,30);g.fillStyle='#fff';g.fillRect(40+320*s.m-3,494,6,42);
 g.fillStyle='#0008';g.fillRect(130,460,140,12);g.fillStyle='#e44';g.fillRect(130,460,140*s.hp/5,12);
 CB.text('Logs '+s.logs+'/'+s.goal+'  Time '+Math.max(0,s.time|0)+'s  Lvl '+s.l,200,600,16);if(s.mt>0)CB.text(s.msg,200,130,34,'#ff0')}};CB.game(G);
