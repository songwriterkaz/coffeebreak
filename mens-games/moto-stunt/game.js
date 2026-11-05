let s;const G={title:'CB Moto Stunts',how:'Tap / Space to jump the ramps. Hold in the air to backflip for bonus',
start(l){s={l,y:0,vy:0,rot:0,air:false,hold:false,d:0,sp:200+l*20,obs:[],next:300,score:0,goal:5+l*2,cleared:0,msg:'',mt:0}},
down(){G.jump();s.hold=true},up(){s.hold=false},key(k){if(k===' '){G.jump();s.hold=true}},keyup(k){if(k===' ')s.hold=false},
jump(){if(!s.air){s.air=true;s.vy=520;s.rot=0}},
update(dt){s.d+=s.sp*dt;s.mt-=dt;if(s.d>s.next){s.obs.push({x:440,w:CB.R(30,50+s.l*6)});s.next=s.d+CB.R(260,420)-s.l*10}
 s.obs.forEach(o=>o.x-=s.sp*dt);if(s.air){s.vy-=1300*dt;s.y+=s.vy*dt;if(s.hold)s.rot+=dt*7;if(s.y<=0){s.y=0;s.air=false;
   const r=((s.rot%(2*Math.PI))+2*Math.PI)%(2*Math.PI);if(s.rot>0.5&&r>0.9&&r<5.4)return CB.lose('Bailed the landing');if(s.rot>5){s.score+=(s.rot/6.2|0)*5;s.msg='BACKFLIP';s.mt=1}s.rot=0}}
 for(const o of s.obs){if(!o.c&&o.x<110&&o.x+o.w>80){if(s.y<30)return CB.lose('Crashed into the barrier')}if(!o.c&&o.x+o.w<80){o.c=1;s.cleared++;s.score++}}
 s.obs=s.obs.filter(o=>o.x>-80);if(s.cleared>=s.goal)CB.win('Stunt show done, '+s.score+' pts')},
draw(g){g.fillStyle='#ff9a5a';g.fillRect(0,0,400,640);g.fillStyle='#d9653a';g.fillRect(0,250,400,100);g.fillStyle='#5a3a2a';g.fillRect(0,450,400,190);
 s.obs.forEach(o=>{g.fillStyle='#ddd';g.fillRect(o.x,420,o.w,30);g.fillStyle='#e00';for(let i=0;i<o.w;i+=12)g.fillRect(o.x+i,420,6,30)});
 g.save();g.translate(95,430-s.y);g.rotate(-s.rot);g.fillStyle='#e0407b';g.fillRect(-25,-10,50,12);g.fillStyle='#111';g.beginPath();g.arc(-18,6,9,0,7);g.arc(18,6,9,0,7);g.fill();g.fillStyle='#fc0';g.fillRect(-6,-32,12,22);g.restore();
 CB.text('Jumps '+s.cleared+'/'+s.goal+'  Score '+s.score+'  Lvl '+s.l,200,40,16);if(s.mt>0)CB.text(s.msg,200,200,34,'#ff0')}};CB.game(G);
