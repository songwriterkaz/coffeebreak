let s;const G={title:'CB Backyard Cricket',how:'Tap / Space as the ball reaches the bat. Chase the target',
start(l){s={l,runs:0,balls:0,max:12,target:14+l*4,wk:0,b:null,wait:1,msg:'',mt:0}},
bowl(){s.b={y:80,v:CB.R(330,420)+s.l*25,x:CB.R(185,215),swung:false,hit:null}},
swing(){const b=s.b;if(!b||b.swung)return;b.swung=true;const d=Math.abs(b.y-520);
 const r=d<12?6:d<25?4:d<40?2:d<60?1:-1;if(r<0){return}b.hit=r;s.runs+=r;s.msg=r===6?'SIX':r===4?'FOUR':r+' run'+(r>1?'s':'');s.mt=1;b.hx=CB.R(-1,1)},
down(){G.swing()},key(k){if(k===' ')G.swing()},
update(dt){s.mt-=dt;if(!s.b){s.wait-=dt;if(s.wait<=0)G.bowl();return}const b=s.b;
 if(b.hit!=null){b.y-=600*dt;b.x+=b.hx*500*dt;if(b.y<-20)G.end()}else{b.y+=b.v*dt;if(b.y>580){if(Math.abs(b.x-200)<20){s.wk++;s.msg='BOWLED';s.mt=1}else{s.msg='Dot ball';s.mt=1}G.end()}}},
end(){s.b=null;s.balls++;s.wait=.8;if(s.runs>=s.target)CB.win('Target chased');else if(s.wk>=3||s.balls>=s.max)CB.lose(s.wk>=3?'All out':'Fell short')},
draw(g){g.fillStyle='#4f8f3a';g.fillRect(0,0,400,640);g.fillStyle='#c9b27a';g.fillRect(160,60,80,520);g.fillStyle='#fff';
 [190,200,210].forEach(x=>{g.fillRect(x-2,530,4,40);g.fillRect(x-2,50,4,30)});g.fillStyle='#8b5a2b';g.fillRect(225,490,12,60);
 const b=s.b;if(b){g.fillStyle='#b00';g.beginPath();g.arc(b.x,b.y,8,0,7);g.fill()}g.strokeStyle='#ff08';g.strokeRect(160,500,80,40);
 CB.text('Runs '+s.runs+'/'+s.target+'  Balls '+s.balls+'/'+s.max+'  Wkts '+s.wk+'/3',200,620,15);CB.text('Lvl '+s.l,360,30,14);if(s.mt>0)CB.text(s.msg,200,320,38,'#ff0')}};CB.game(G);
