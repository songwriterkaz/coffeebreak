/* Coffeebreak Shed Pool online: invite link. Host's device runs the table and sends it; friend sends shots and aim.
   No chat, no names, no lobby. Host is Player 1, friend is Player 2. */
(function(){
const MP=window.MP={role:null,conn:null,last:'',raim:null,lastPush:0};const GAME='shed-pool';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const net=()=>!!G.net&&!!MP.role,me=()=>MP.role==='join'?1:0,myTurn=()=>G.state==='play'&&G.turn===me()&&!moving;
const open=()=>!!(MP.conn&&MP.conn.open);
function send(o){try{open()&&MP.conn.send(o)}catch(e){}}
// show names from each player's side, and keep added copy free of exclamation marks
function persp(s){const a='Player '+(me()+1),b='Player '+(2-me());s=s.split(a).join('\u0001').split(b).join('\u0002');
 return s.replace(/\u0001 is /g,'You are ').replace(/\u0001 wins/g,'You win').replace(/\u0001 breaks/g,'You break').replace(/\u0001/g,'You').replace(/\u0002/g,'Your friend').replace(/!/g,'.')}
const oFill=x.fillText.bind(x);x.fillText=function(s,...a){return oFill(net()&&typeof s==='string'?persp(s):s,...a)};
const oDemoEnd=window.demoEnd;window.demoEnd=function(m){if(net()&&m)m=String(m).replace(/!/g,'.');return oDemoEnd(m)};
const oStart=start,oShoot=shoot,oButton=button,oUpdate=update,oEnd=endShot,oDraw=draw;
function startNet(){G.net=true;oStart('2p');push(true)}
window.start=function(mode){if(net()&&mode==='2p'&&MP.role==='host'){oStart('2p');push(true);return}G.net=false;oStart(mode)};
window.shoot=function(ux,uy,pw,remote){if(!net())return oShoot(ux,uy,pw);
 if(MP.role==='join'){if(myTurn())send({t:'sh',ux,uy,pw});return}
 if(G.turn===1&&!remote)return;oShoot(ux,uy,pw);push(true)};
window.endShot=function(){oEnd();if(net())push(true)};
window.button=function(id,X,Y,w,h,label,fn,dis){const conn=MP.role==='host'&&open();
 if(G.state==='title'&&(conn||MP.role==='join'&&open())){
  if(MP.role==='join'){if(id==='ai')oButton(id,X-90,Y,w+180,h,'Waiting for your friend to start',()=>{});return}
  if(id==='ai')return oButton(id,X,Y,w,h,'🎱 Frame with your friend',startNet);return}
 if(!net())return oButton(id,X,Y,w,h,label,fn,dis);
 if(MP.role==='join'){if(id==='again')return oButton(id,X,Y,w,h,label,()=>send({t:'again'}));if(id==='menu'||id==='menu2')return oButton(id,X,Y,w,h,'Online',()=>{})}
 return oButton(id,X,Y,w,h,label,fn,dis)};
window.update=function(dt){if(!net())return oUpdate(dt);
 if(!myTurn()){aim=null;hover=null}
 if(MP.role==='host')return oUpdate(dt);
 t+=dt;if(G.msgT>0)G.msgT-=dt;if(G.state!=='play')return;
 if(moving&&!physics(dt))balls.forEach(b=>{b.vx=b.vy=0})};
window.draw=function(){oDraw();const r=MP.raim;if(!net()||!r||Date.now()-r.at>500||G.state!=='play'||moving||G.turn===me()||!balls[0]||balls[0].in)return;
 const cb=balls[0];x.setLineDash([6,6]);x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=1.5;x.beginPath();x.moveTo(cb.x,cb.y);x.lineTo(cb.x+r.ux*520,cb.y+r.uy*520);x.stroke();x.setLineDash([]);
 const back=22+r.pw*70;x.strokeStyle='#c8945a';x.lineWidth=6;x.lineCap='round';x.beginPath();x.moveTo(cb.x-r.ux*back,cb.y-r.uy*back);x.lineTo(cb.x-r.ux*(back+260),cb.y-r.uy*(back+260));x.stroke();x.lineCap='butt'};
function block(e){if(!net()||G.state!=='play'||myTurn())return;const p=pos(e);for(const k in BTN)if(inB(p,BTN[k]))return;e.stopImmediatePropagation();e.preventDefault()}
c.addEventListener('mousedown',block,true);c.addEventListener('touchstart',block,{capture:true,passive:false});
setInterval(()=>{if(net()&&myTurn()&&aim){const a=aimVec();send({t:'aim',ux:+a.ux.toFixed(3),uy:+a.uy.toFixed(3),pw:+a.pw.toFixed(2)})}},100);
const rd=v=>Math.round(v*10)/10;
function snap(){return{t:'s',state:G.state,turn:G.turn,groups:G.groups,msg:G.msg,msgT:rd(G.msgT),winner:G.winner,moving,
 b:balls.map(b=>moving?[b.n,rd(b.x),rd(b.y),rd(b.vx),rd(b.vy),b.in?1:0]:[b.n,b.x,b.y,0,0,b.in?1:0])}}
function push(force){if(MP.role!=='host'||!open()||!net())return;const now=Date.now();if(!force&&now-MP.lastPush<80)return;
 const s=snap(),k=JSON.stringify(Object.assign({},s,{msgT:0}));if(force||k!==MP.last){MP.last=k;MP.lastPush=now;send(s)}}
setInterval(()=>push(false),90);setInterval(()=>{MP.last=''},3000);
function onIntent(m){if(!m||!net())return;
 if(m.t==='aim'){MP.raim=Object.assign({at:Date.now()},m);return}
 if(m.t==='again'){if(G.state==='over')window.start('2p');return}
 if(m.t==='sh'&&G.state==='play'&&G.turn===1&&!moving){let ux=+m.ux,uy=+m.uy,pw=+m.pw;const d=Math.hypot(ux,uy);if(!isFinite(d)||d<.01||!isFinite(pw))return;
  MP.raim=null;window.shoot(ux/d,uy/d,Math.max(0,Math.min(1,pw)),true)}}
let shownDemo=false,lastMsg='';
function apply(s){G.net=true;G.mode='2p';G.state=s.state;G.turn=s.turn;G.groups=s.groups;G.winner=s.winner;moving=s.moving;
 if(s.msg!==lastMsg||s.msgT>G.msgT+.5){G.msg=s.msg;G.msgT=s.msgT;lastMsg=s.msg}
 if(s.state!=='title')balls=s.b.map(([n,x0,y0,vx,vy,i])=>({n,x:x0,y:y0,vx,vy,in:!!i}));
 if(s.state==='over'&&window.DEMO&&!shownDemo){shownDemo=true;setTimeout(()=>window.demoEnd('That is the end of the free demo of <b>Coffeebreak Shed Pool</b>. Unlimited matches, 2-player mode and all 5 trick shots are in the full game.'),2500)}}
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',onIntent);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});
 if(net()&&G.state!=='title'){push(true);return} // friend came back: carry on
 startNet()}
CBNet.panel({game:GAME,title:'Coffeebreak Shed Pool',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;G.net=true;c2.on('data',m=>{if(m&&m.t==='s')apply(m);else if(m&&m.t==='aim')MP.raim=Object.assign({at:Date.now()},m)})},
 onHostGone:()=>{G.net=false;G.state='title';moving=false}});
})();
