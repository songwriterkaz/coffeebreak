let s;const A=[['Chop wood','wood',0],['Fetch water','water',1],['Fish creek','food',2],['Tend fire','fire',3]];
const G={title:'CB Bush Survival',how:'Tap jobs to keep fire, water & food up until rescue',
start(l){s={l,t:0,goal:40+l*10,m:{fire:.8,water:.8,food:.8},wood:2,cool:0,log:''}},
act(i){if(s.cool>0)return;s.cool=.6;const k=A[i][1];
 if(k==='wood'){s.wood++;s.log='+1 wood'}else if(k==='water'){s.m.water=Math.min(1,s.m.water+.25);s.log='Water up'}
 else if(k==='food'){if(Math.random()<.6){s.m.food=Math.min(1,s.m.food+.3);s.log='Caught a fish'}else s.log='Nothing biting'}
 else{if(s.wood>0){s.wood--;s.m.fire=Math.min(1,s.m.fire+.35);s.log='Fire roaring'}else s.log='Need wood'}},
down(p){A.forEach((a,i)=>{if(CB.hit(p,105+(i%2)*190,430+Math.floor(i/2)*80,180,66))G.act(i)})},
key(k){const i='1234'.indexOf(k);if(i>=0)G.act(i)},
update(dt){s.t+=dt;s.cool-=dt;const r=.035+s.l*.006,n=Math.sin(s.t*.3)>.6;
 s.m.fire-=dt*r*(n?2:1.2);s.m.water-=dt*r;s.m.food-=dt*r*.8;
 for(const k in s.m)if(s.m[k]<=0)return CB.lose('Ran out of '+k);if(s.t>=s.goal)CB.win('Rescue chopper arrived')},
draw(g){const night=Math.sin(s.t*.3)>.6;g.fillStyle=night?'#0c1430':'#6b8f4e';g.fillRect(0,0,400,640);
 g.fillStyle='#3b2a1a';g.fillRect(0,300,400,40);g.fillStyle='#f80';const f=s.m.fire;g.beginPath();g.moveTo(170,300);g.lineTo(200,300-80*f-Math.random()*10);g.lineTo(230,300);g.fill();
 ['fire','water','food'].forEach((k,i)=>{g.fillStyle='#0008';g.fillRect(30,40+i*40,340,22);g.fillStyle=['#f84','#4af','#ec4'][i];g.fillRect(30,40+i*40,340*Math.max(0,s.m[k]),22);CB.text(k.toUpperCase(),40,57+i*40,14,'#fff','left')});
 CB.text('Wood '+s.wood+'   Rescue in '+Math.max(0,s.goal-s.t|0)+'s   Lvl '+s.l,200,190,15);CB.text(s.log,200,380,18,'#ffe');if(night)CB.text('Cold night: fire burns fast',200,220,14,'#9cf');
 A.forEach((a,i)=>CB.btn(a[0]+' ('+(i+1)+')',105+(i%2)*190,430+Math.floor(i/2)*80,180,66,s.cool>0?'#555':'#a0522d'))}};CB.game(G);
