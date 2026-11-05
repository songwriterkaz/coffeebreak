let s;const G={title:'CB BBQ Master',how:'Tap snags to flip when golden, again to serve. Don\'t burn them',
start(l){s={l,items:[],served:0,burnt:0,goal:6+l*2,spawn:0}},
down(p){for(const it of s.items){if(Math.hypot(p.x-it.x,p.y-it.y)<40){if(it.c<.55){it.c+=0;it.pen=.5}else if(it.side===0){it.side=1;it.c=0}else{it.done=1;s.served+=it.c<1?1:0;if(it.c>=1)s.burnt++}return}}},
key(k){const i='123456'.indexOf(k);const it=s.items[i];if(it)G.down({x:it.x,y:it.y})},
update(dt){s.spawn-=dt;const slots=[[110,260],[200,260],[290,260],[110,380],[200,380],[290,380]];
 if(s.spawn<=0&&s.items.length<6){s.spawn=CB.R(1,2.2)-s.l*.08;const free=slots.find(sl=>!s.items.some(i=>i.x===sl[0]&&i.y===sl[1]));if(free)s.items.push({x:free[0],y:free[1],c:0,side:0})}
 s.items.forEach(i=>{i.c+=dt*(.16+s.l*.03);if(i.c>1.5){i.done=1;s.burnt++}});s.items=s.items.filter(i=>!i.done);
 if(s.burnt>=3)CB.lose('Burnt the snags');if(s.served>=s.goal)CB.win('The crowd is fed')},
draw(g){g.fillStyle='#3a2d25';g.fillRect(0,0,400,640);g.fillStyle='#222';g.fillRect(40,190,320,260);g.strokeStyle='#666';for(let x=50;x<360;x+=18){g.beginPath();g.moveTo(x,190);g.lineTo(x,450);g.stroke()}
 s.items.forEach((i,n)=>{const c=Math.min(1.5,i.c);const col=c<.55?'#e9a0a0':c<1?'#c87a32':'#2a1a10';g.fillStyle=col;g.beginPath();g.roundRect(i.x-38,i.y-12,76,24,12);g.fill();
  g.fillStyle='#000a';g.fillRect(i.x-30,i.y+18,60,6);g.fillStyle=c<.55?'#888':c<1?'#2c6':'#f33';g.fillRect(i.x-30,i.y+18,60*Math.min(1,c/1.5),6);CB.text(i.side?'serve':'flip',i.x,i.y-18,12,'#ddd')});
 CB.text('Served '+s.served+'/'+s.goal+'   Burnt '+s.burnt+'/3   Lvl '+s.l,200,100,17);CB.text('Green bar = ready',200,500,14,'#ccc')}};CB.game(G);
