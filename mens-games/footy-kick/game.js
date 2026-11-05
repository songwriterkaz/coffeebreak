let s;const G={title:'CB Footy Goal Kicker',how:'Swipe up toward the posts. Score 3 of 5 kicks',
start(l){s={l,k:0,goals:0,b:null,wind:CB.R(-1,1)*l*12,msg:'',mt:0,px:CB.R(130,270)}},
up(p,w){if(s.b||w.dy>-30)return;const sp=Math.min(1.4,-w.dy/250);s.b={x:200,y:560,z:0,vx:w.dx*1.4,vy:-420*sp,vz:300*sp}},
key(k){if(!s.b&&k===' ')s.b={x:200,y:560,z:0,vx:(s.px-200)*.9,vy:-440,vz:310}},
update(dt){if(s.mt>0)s.mt-=dt;const b=s.b;if(!b)return;b.vx+=s.wind*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.vz-=500*dt;b.z+=b.vz*dt;
 if(b.y<=120){const gl=b.x>s.px-45&&b.x<s.px+45&&b.z>20;s.msg=gl?'GOAL':'Missed';s.mt=1;s.goals+=gl;s.k++;s.b=null;s.px=CB.R(130,270);s.wind=CB.R(-1,1)*s.l*12;
  if(s.goals>=3)CB.win('Match winner');else if(s.k-s.goals>2)CB.lose('Too many misses')}
 else if(b.z<0&&b.y>130){s.msg='Fell short';s.mt=1;s.k++;s.b=null;if(s.k-s.goals>2)CB.lose('Too many misses')}},
draw(g){g.fillStyle='#2f7a35';g.fillRect(0,0,400,640);g.fillStyle='#378a3e';for(let i=0;i<640;i+=80)g.fillRect(0,i,400,40);
 g.fillStyle='#fff';[-45,45].forEach(d=>g.fillRect(s.px+d-3,40,6,90));[-90,90].forEach(d=>g.fillRect(s.px+d-2,70,4,60));
 const b=s.b;if(b){g.fillStyle='#0005';g.beginPath();g.ellipse(b.x,b.y,10,5,0,0,7);g.fill();g.fillStyle='#b3261e';g.beginPath();g.ellipse(b.x,b.y-b.z*.3,9,13,0,0,7);g.fill()}
 else{g.fillStyle='#b3261e';g.beginPath();g.ellipse(200,560,9,13,0,0,7);g.fill()}
 CB.text('Goals '+s.goals+'  Kicks '+s.k+'/5   Lvl '+s.l,200,620,16);CB.text('Wind '+(s.wind>0?'→ ':'← ')+Math.abs(s.wind|0),200,165,15,'#cff');
 if(s.mt>0)CB.text(s.msg,200,330,36,s.msg==='GOAL'?'#ff0':'#fbb')}};CB.game(G);
