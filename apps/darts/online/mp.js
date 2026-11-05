/* Coffeebreak Darts online: invite link. Host's device runs the match and sends it; friend sends throws and aim.
   No chat, no names, no lobby. */
(function(){
const MP=window.MP={role:null,conn:null,last:'',raim:null};const GAME='darts';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const net=()=>G.vs==='net'&&!!MP.role,me=()=>MP.role==='join'?1:0,myTurn=()=>G.state==='play'&&G.cur===me();
function send(o){try{MP.conn&&MP.conn.open&&MP.conn.send(o)}catch(e){}}
function names(){if(!G.ps||G.ps.length<2)return;G.ps[me()].n='You';G.ps[1-me()].n='Your friend';G.ps.forEach(p=>p.bot=false)}
const oNew=newGame,oThrow=throwAt,oButton=button,oUpdate=update,oMsg=msg;
window.msg=function(s){oMsg(net()?String(s).replace(/!/g,'.'):s)};
window.newGame=function(mode,vs){if(MP.role==='host'&&MP.conn&&MP.conn.open)vs='net';oNew(mode,vs);if(vs==='net'){names();msg((mode==='501'?'501, double to finish. ':'Around the Clock: 1 to 20, then the bull. ')+'You throw first.');push(true)}};
window.throwAt=function(px,py,remote){if(!net())return oThrow(px,py);
 if(MP.role==='join'){if(myTurn()&&!G.fly&&G.thrown.length<3)send({t:'th',x:px,y:py});return}
 if(G.cur===1&&!remote)return;oThrow(px,py);push(true)};
window.button=function(id,X,Y,w,h,label,fn,o){if(!net()&&!(MP.role==='host'&&MP.conn&&MP.conn.open&&G.state==='title'))return oButton(id,X,Y,w,h,label,fn,o);
 o=o||{};
 if(G.state==='title'){if(MP.role==='join'){if(id==='a')oButton(id,X,Y,w+280,h,'Waiting for your friend to pick a game',()=>{},{fs:15});return}
  if(id==='a')return oButton(id,X,Y,w,h,'🎯 501 online',()=>newGame('501','net'),o);
  if(id==='b')return oButton(id,X,Y,w,h,'🕐 Around the Clock online',()=>newGame('atc','net'),o);
  return}
 if(MP.role==='join'){if(id==='again')return oButton(id,X,Y,w,h,label,()=>send({t:'again'}),o);if(id==='menu'||id==='m2')return oButton(id,X,Y,w,h,'Online game',()=>{},o)}
 return oButton(id,X,Y,w,h,label,fn,o)};
window.update=function(dt){if(!net())return oUpdate(dt);
 if(MP.role==='host'){oUpdate(dt);if(G.state==='play'&&G.cur===1&&MP.raim){G.aim.x=MP.raim.x;G.aim.y=MP.raim.y;G.hold=MP.raim.h;G.steady=MP.raim.s}return}
 if(G.msgT>0)G.msgT-=dt;
 if(G.fly){G.fly.t=Math.min(.98,G.fly.t+dt*3.2);return}
 if(myTurn()&&G.thrown.length<3){const m=G.mouse||{x:CX,y:CY};if(G.hold)G.steady=Math.max(0,G.steady-dt*.45);else G.steady=Math.min(1,G.steady+dt*.3);
  const amp=(G.hold?8+28*(1-G.steady)*(1-G.steady)*3:30)+(G.steady<.15?40:0);G.aim.x=m.x+Math.sin(t*2.1)*amp+Math.sin(t*5.3)*amp*.3;G.aim.y=m.y+Math.cos(t*1.7)*amp+Math.sin(t*4.1)*amp*.3}
 else if(MP.raim){G.aim.x=MP.raim.x;G.aim.y=MP.raim.y;G.hold=MP.raim.h;G.steady=MP.raim.s}};
function block(e){if(!net()||G.state!=='play'||myTurn())return;const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;if((p.clientX-r.left)*W/r.width<640){e.stopImmediatePropagation();e.preventDefault()}}
c.addEventListener('mousedown',block,true);c.addEventListener('touchstart',block,{capture:true,passive:false});
setInterval(()=>{if(net()&&myTurn()&&!G.fly)send({t:'aim',x:Math.round(G.aim.x),y:Math.round(G.aim.y),h:!!G.hold,s:+G.steady.toFixed(2)})},120);
function snap(){return{t:'s',state:G.state,mode:G.mode,cur:G.cur,turn:G.turn,ps:G.ps.map(p=>({left:p.left,next:p.next})),thrown:G.thrown.map(d=>({x:d.x,y:d.y,s:d.s})),
 msg:G.msg,msgT:Math.round(G.msgT*10)/10,fly:G.fly&&{x0:G.fly.x0,y0:G.fly.y0,tx:G.fly.tx,ty:G.fly.ty,t:G.fly.t},win:G.winner?G.ps.indexOf(G.winner):-1}}
function push(force){if(MP.role!=='host'||!MP.conn||!MP.conn.open||!net())return;const s=snap(),k=JSON.stringify(Object.assign({},s,{msgT:0,fly:!!s.fly}));if(force||k!==MP.last){MP.last=k;send(s)}}
setInterval(()=>push(false),250);setInterval(()=>{MP.last=''},3000);
function onIntent(m){if(!m||!net())return;
 if(m.t==='aim'){MP.raim=m;return}
 if(m.t==='again'){if(G.state==='over')newGame(G.mode,'net');return}
 if(m.t==='th'&&G.state==='play'&&G.cur===1&&!G.fly&&G.thrown.length<3&&isFinite(m.x)&&isFinite(m.y)){window.throwAt(Math.max(0,Math.min(W,+m.x)),Math.max(0,Math.min(H,+m.y)),true)}}
let shownDemo=false,lastMsg='';
function apply(s){G.vs='net';const was=G.state;G.state=s.state;G.mode=s.mode;G.cur=s.cur;G.turn=s.turn;
 if(!G.ps||G.ps.length!==2)G.ps=[{},{}];s.ps.forEach((p,i)=>{G.ps[i]=Object.assign(G.ps[i]||{},{left:p.left,next:p.next,hist:[]})});names();
 G.thrown=s.thrown;if(s.msg!==lastMsg||s.msgT>G.msgT+.5){G.msg=s.msg;G.msgT=s.msgT;lastMsg=s.msg}
 if(s.fly){if(!G.fly||G.fly.tx!==s.fly.tx||G.fly.ty!==s.fly.ty)G.fly=Object.assign({},s.fly)}else G.fly=null;
 G.winner=s.win>=0?G.ps[s.win]:null;if(s.state==='play'&&was!=='play'){G.steady=1;G.hold=false}
 if(s.state==='demo'&&!shownDemo&&window.demoEnd){shownDemo=true;setTimeout(()=>demoEnd('That is the end of the free demo of <b>Coffeebreak Darts</b>. Full matches, 2-player mode and Around the Clock are in the full game.'),600)}}
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',onIntent);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});
 if(net()&&G.state!=='title'){push(true);return} // friend came back: carry on
 newGame(G.mode||'501','net')}
CBNet.panel({game:GAME,title:'Coffeebreak Darts',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;G.vs='net';c2.on('data',m=>{if(m&&m.t==='s')apply(m);else if(m&&m.t==='aim')MP.raim=m})},
 onHostGone:()=>{G.vs='bot';G.state='title'}});
// host also shares its aim so the friend can watch the throw
setInterval(()=>{if(MP.role==='host'&&net()&&G.state==='play'&&G.cur===0&&!G.fly)send({t:'aim',x:Math.round(G.aim.x),y:Math.round(G.aim.y),h:!!G.hold,s:+G.steady.toFixed(2)})},120);
})();
