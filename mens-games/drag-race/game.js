let s;const G={title:'CB Muscle Drag',how:'Tap / Space to launch & shift in the green',
start(l){s={l,rpm:0,gear:0,v:0,x:0,ox:0,ov:0,t:0,go:false,cd:2,msg:'',flash:0}},
shift(){if(s.cd>0){return}if(!s.go){s.go=true;s.gear=1;s.rpm=.3;return}if(s.gear>=5)return;
 const q=s.rpm>.78&&s.rpm<.92?'PERFECT':s.rpm>.65&&s.rpm<.97?'GOOD':'BAD';s.msg=q;s.flash=.6;
 s.v+=q==='PERFECT'?3:q==='GOOD'?1:-4;s.gear++;s.rpm=.35},
down(){G.shift()},key(k){if(k===' ')G.shift()},
update(dt){if(s.cd>0){s.cd-=dt;return}s.t+=dt;s.flash-=dt;
 const oa=10+s.l*1.6;s.ov=Math.min(s.ov+oa*dt,40+s.l*4);s.ox+=s.ov*dt;
 if(s.go){s.rpm+=dt*(1.1-s.gear*.12);if(s.rpm>1){s.rpm=1;s.v-=8*dt}s.v=Math.max(0,s.v+dt*(14-s.gear)*(s.rpm>.3?1:.3));s.v=Math.min(s.v,30+s.gear*6);s.x+=s.v*dt}
 if(s.x>=400)CB.win('You won the quarter mile');else if(s.ox>=400)CB.lose('Beaten at the line')},
draw(g){g.fillStyle='#1b1b22';g.fillRect(0,0,400,640);g.fillStyle='#333';g.fillRect(40,0,320,640);
 g.strokeStyle='#ff8fc0';g.setLineDash([20,20]);g.beginPath();g.moveTo(200,0);g.lineTo(200,640);g.stroke();g.setLineDash([]);
 const py=v=>560-v*1.2;g.fillStyle='#fff';g.fillRect(40,py(400)-4,320,8);
 g.fillStyle='#e0407b';g.fillRect(100,py(s.x)-30,50,60);g.fillStyle='#4aa3ff';g.fillRect(250,py(s.ox)-30,50,60);
 g.fillStyle='#000';g.fillRect(60,580,280,24);g.fillStyle='#2c6';g.fillRect(60+280*.78,580,280*.14,24);g.fillStyle='#fc0';g.fillRect(60,580,280*s.rpm,8);
 CB.text('Gear '+s.gear+'  '+Math.round(s.v*3)+' km/h',200,625,16);CB.text('Lvl '+s.l,350,30,16);
 if(s.cd>0)CB.text(s.cd>1?'READY':'SET',200,300,40,'#fc0');else if(!s.go)CB.text('TAP TO GO',200,300,36,'#7f7');
 if(s.flash>0)CB.text(s.msg,200,340,30,s.msg==='BAD'?'#f66':'#7f7')}};CB.game(G);
