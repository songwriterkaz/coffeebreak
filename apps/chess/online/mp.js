/* Coffeebreak Chess online: invite link, host plays coffee beans (white), friend plays marshmallows.
   Host's device runs the game and sends the board; friend sends moves. No chat, no names, no lobby. */
(function(){
const MP=window.MP={role:null,conn:null,last:''};const GAME='chess';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const net=()=>G.mode==='net'&&!!MP.role,mine=()=>MP.role==='join'?'b':'w';
function send(o){try{MP.conn&&MP.conn.open&&MP.conn.send(o)}catch(e){}}
const oDo=doMove,oButton=button,oNew=newGame;
window.doMove=function(m){if(net()&&MP.role==='join'){send({t:'mv',f:m.f,t2:m.t});return}oDo(m);if(net()&&MP.role==='host')push(true)};
window.button=function(id,X,Y,w,h,label,fn,o){if(net()&&(id==='undo'||id==='af'))return;
 if(net()&&id==='menu')return oButton(id,X,Y,w,h,'Online game ('+(MP.role==='host'?'🫘 you':'🍡 you')+')',()=>{},o);
 if(net()&&id==='again'&&MP.role==='join')return oButton(id,X,Y,w,h,label,()=>send({t:'again'}),o);
 return oButton(id,X,Y,w,h,label,fn,o)};
window.newGame=function(mode){oNew(mode);if(mode==='net'){G.flip=MP.role==='join';push(true)}};
function block(e){if(!net())return;const st=G.state;if(st!=='play'||turn!==mine()){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;const X=(p.clientX-r.left)*W/r.width;if(X<600){e.stopImmediatePropagation();e.preventDefault()}}}
c.addEventListener('mousedown',block,true);c.addEventListener('touchstart',block,{capture:true,passive:false});
function snap(){return{t:'s',B:B.slice(),turn,cast:Object.assign({},cast),ep,half,state:G.state,res:G.res,last:G.last&&{f:G.last.f,t:G.last.t},mv:G.mv,capW:G.capW.slice(),capB:G.capB.slice()}}
function push(force){if(MP.role!=='host'||!MP.conn||!MP.conn.open||G.mode!=='net')return;const s=snap(),k=JSON.stringify(s);if(force||k!==MP.last){MP.last=k;send(s)}}
setInterval(()=>push(false),300);setInterval(()=>{MP.last=''},3000);
function onIntent(m){if(!m||G.mode!=='net')return;
 if(m.t==='again'){if(G.state==='over')newGame('net');return}
 if(m.t==='mv'&&G.state==='play'&&turn==='b'){const mv=legal().find(q=>q.f===m.f&&q.t===m.t2);if(mv){oDo(mv);G.sel=-1;G.moves=[];push(true)}}}
let shownDemo=false;
function apply(s){B=s.B;turn=s.turn;cast=s.cast;ep=s.ep;half=s.half;hist=[];G.mode='net';G.flip=true;
 const changed=!G.last!==!s.last||(G.last&&s.last&&(G.last.f!==s.last.f||G.last.t!==s.last.t))||G.mv!==s.mv;
 G.state=s.state;G.res=s.res;G.last=s.last;G.mv=s.mv;G.score=s.mv;G.capW=s.capW;G.capB=s.capB;if(changed){G.sel=-1;G.moves=[]}
 if(s.state==='demo'&&!shownDemo&&window.demoEnd){shownDemo=true;setTimeout(()=>demoEnd('That is the end of the free demo of <b>Coffeebreak Chess</b>. Full games, 2-player mode and harder bots are in the full game.'),600)}}
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',onIntent);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});
 if(G.mode==='net'&&(G.state==='play'||G.state==='over'||G.state==='demo')){push(true);return} // friend came back: carry on
 newGame('net')}
CBNet.panel({game:GAME,title:'Coffeebreak Chess',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;G.mode='net';G.flip=true;c2.on('data',m=>{if(m&&m.t==='s')apply(m)})},
 onHostGone:()=>{G.mode='2p';G.state='title'}});
})();
