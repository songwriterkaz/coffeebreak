/* Coffeebreak Café Property Game online: invite link. Host is Player 1 and runs the game; the friend is Player 2
   and sends their moves (roll, buy, skip, add a cup, end turn). Any other seats stay bots. No chat, no names, no lobby. */
(function(){
const MP=window.MP={role:null,conn:null,last:''};const GAME='cafe-property';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const open=()=>!!(MP.conn&&MP.conn.open),host=()=>MP.role==='host',join=()=>MP.role==='join';
function send(o){try{open()&&MP.conn.send(o)}catch(e){}}
const ACT={roll:1,buy:1,skip:1,end:1,bld:1};
const oButton=button,oNew=newGame,oUpdate=update,oDraw=draw;
function friendTurn(){return G.net&&G.state==='play'&&G.cur===1}
function note(s,X,Y){x.fillStyle='#ffcf6a';x.font='italic 15px Georgia';x.textAlign='left';x.fillText(s,X,Y)}
window.button=function(id,X,Y,w,h,label,fn,o){
 if(host()&&G.net){
  if(id==='b1'&&G.state==='title')return oButton(id,X,Y,w,h,'P2: 🌐 Your friend',()=>{},o);
  if(ACT[id]&&friendTurn()){if(id!=='bld'&&id!=='skip')note('🌐 Your friend’s turn…',X,Y+28);return}
  if(id==='again')return oButton(id,X,Y,w,h,label,()=>{G.state='title'},o);
  return oButton(id,X,Y,w,h,label,fn,o)}
 if(join()&&G.net){
  if(ACT[id]){if(!friendTurn())return;const i=G.info;return oButton(id,X,Y,w,h,label,()=>send({t:'act',a:id,i}),o)}
  if(id==='again')return;
  return oButton(id,X,Y,w,h,label,fn,o)}
 return oButton(id,X,Y,w,h,label,fn,o)};
window.newGame=function(){if(host()&&open()){G.bots[1]=false;G.net=true}else if(host())G.net=false;oNew();if(G.net)push(true)};
window.update=function(dt){if(join()&&G.net){if(G.rollT>0)G.rollT-=dt;if(G.cardT>0)G.cardT-=dt;return}oUpdate(dt)};
window.draw=function(){
 if(join()&&G.net&&G.state==='title'){x.fillStyle='#12060c';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#f6c6d2';x.font='bold 44px Georgia';x.fillText('☕ Coffeebreak',W/2,140);
  x.fillStyle='#ffe9c7';x.font='20px Georgia';x.fillText('You are in your friend’s game. You are Player 2 ☕.',W/2,230);x.fillText('Waiting for your friend to start.',W/2,264);x.textAlign='left';return}
 oDraw();
 if(G.net&&G.state!=='title'){x.fillStyle='#ffcf6a';x.font='bold 12px Georgia';x.textAlign='left';x.fillText(host()?'Online game · You are Player 1 🍡':'Online game · You are Player 2 ☕',BX,BY-6)}
 if(host()&&open()&&G.state==='title'){x.fillStyle='#7fd88a';x.font='bold 16px Georgia';x.textAlign='center';x.fillText('🌐 Your friend is here and will be Player 2. Press Start game.',W/2,480);x.textAlign='left'}};
function snap(){return{t:'s',st:G.state,np:G.np,ps:G.ps,own:G.own,cur:G.cur,phase:G.phase,dice:G.dice,log:G.log,dbl:G.dbl,turns:G.turns,card:G.card,cs:G.cardT>0,win:G.winner?G.winner.id:-1}}
function push(force){if(!host()||!open()||!G.net)return;const s=snap(),k=JSON.stringify(s);if(force||k!==MP.last){MP.last=k;send(s)}}
setInterval(()=>push(false),250);setInterval(()=>{MP.last=''},3000);
function onIntent(m){if(!m||m.t!=='act'||!friendTurn())return;const p=cp();
 if(m.a==='roll'&&G.phase==='roll')roll();else if(m.a==='buy'&&G.phase==='buy')buy();else if(m.a==='skip'&&G.phase==='buy')skip();
 else if(m.a==='end'&&G.phase==='end')endTurn();else if(m.a==='bld'&&Number.isInteger(m.i)&&m.i>=0&&m.i<N&&canBuild(p,m.i))build(m.i);push(true)}
let shownDemo=false;
function apply(s){G.net=true;const was=G.dice.join();G.state=s.st;G.np=s.np;G.ps=s.ps;G.own=s.own;G.cur=s.cur;G.phase=s.phase;G.dice=s.dice;G.log=s.log;G.dbl=s.dbl;G.turns=s.turns;
 if(G.dice.join()!==was)G.rollT=.5;if(s.cs&&!(G.cardT>0)){G.card=s.card;G.cardT=3}else if(!s.cs)G.cardT=0;G.winner=s.win>=0?G.ps[s.win]:null;
 if(s.st==='demo'&&!shownDemo&&window.demoEnd){shownDemo=true;demoEnd('That is the end of the free demo of <b>Coffeebreak</b>. Up to 4 players, unlimited turns and the full Newcastle board are in the full game.')}}
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',onIntent);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});
 if(G.net&&G.state!=='title'){push(true);return} // friend came back: carry on
 if(G.state==='play'){G.state='title'}G.bots[1]=false;G.net=true}
CBNet.panel({game:GAME,title:'Coffeebreak Café Property Game',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;G.net=true;c2.on('data',m=>{if(m&&m.t==='s')apply(m)})},
 onHostGone:()=>{G.net=false;G.state='title'}});
if(MP.role==='join'){G.net=true}
})();
