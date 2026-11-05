/* Critter Chess online: invite link. Host plays the light critters, friend plays the dark critters.
   Host's device keeps the board and sends it; friend sends moves. No chat, no names, no lobby. */
(function(){
const MP=window.MP={role:null,conn:null,net:false,last:'',win:null};const GAME='critterchess';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const mine=()=>MP.role==='join'?'b':'w';
function send(o){try{MP.conn&&MP.conn.open&&MP.conn.send(o)}catch(e){}}
const oDraw=draw,oInit=init;
function label(){if(MP.win)return MP.win===mine()?'🏆 You win.':'Your friend wins this one.';if(turn==='x')return'';return turn===mine()?'Your move ('+(mine()==='w'?'light':'dark')+' critters)':'Friend\u2019s move…'}
function netMove(r1,c1,r2,c2){const cap=B[r2][c2],mover=B[r1][c1].s;B[r2][c2]=B[r1][c1];B[r1][c1]=null;if(B[r2][c2].t==='P'&&(r2===0||r2===7))B[r2][c2].t='Q';
 msg='';if(cap){msg=`${P[B[r2][c2].t]} pounces on ${P[cap.t]}.`;$('fx').textContent=P[B[r2][c2].t]+'💥';setTimeout(()=>$('fx').textContent='',800);if(cap.t==='K'){MP.win=mover;turn='x';draw();push(true);return}}
 turn=turn==='w'?'b':'w';draw();push(true)}
window.draw=function(){if(!MP.net)return oDraw();const bd=$('board');bd.innerHTML='';const flip=MP.role==='join';
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){const r=flip?7-i:i,c=flip?7-j:j;const d=document.createElement('div');d.className='sq '+((r+c)%2?'dk':'lt')+(sel&&sel[0]===r&&sel[1]===c?' sel':'');const p=B[r][c];
  if(p){d.textContent=P[p.t];d.style.filter=p.s==='b'?'grayscale(.7) brightness(.7)':''}
  d.onclick=()=>{if(turn!==mine())return;if(sel&&legal(sel[0],sel[1],r,c)){const s=sel;sel=null;if(MP.role==='host')netMove(s[0],s[1],r,c);else{send({t:'mv',m:[s[0],s[1],r,c]});draw()}}else if(p&&p.s===mine()){sel=[r,c];draw()}};bd.appendChild(d)}
 $('msg').textContent=(msg?msg+' ':'')+label()};
function newNet(){MP.win=null;msg='';sel=null;oInit();push(true)}
$('new').onclick=()=>{if(MP.net){if(MP.role==='host')newNet();else send({t:'new'});return}msg='';init()};
function snap(){return{t:'s',B:B.map(r=>r.map(p=>p&&{t:p.t,s:p.s})),turn,msg,win:MP.win}}
function push(force){if(MP.role!=='host'||!MP.net||!MP.conn||!MP.conn.open)return;const s=snap(),k=JSON.stringify(s);if(force||k!==MP.last){MP.last=k;send(s)}}
setInterval(()=>push(false),300);setInterval(()=>{MP.last=''},3000);
function onIntent(m){if(!m||!MP.net)return;
 if(m.t==='new'){if(turn==='x')newNet();return}
 if(m.t==='mv'&&turn==='b'&&Array.isArray(m.m)){const[a,b,c2,d]=m.m.map(Number);if([a,b,c2,d].every(v=>v>=0&&v<8)&&B[a][b]&&B[a][b].s==='b'&&legal(a,b,c2,d))netMove(a,b,c2,d)}}
function apply(s){const moved=JSON.stringify(s.B)!==JSON.stringify(B)||s.turn!==turn;B=s.B;turn=s.turn;msg=s.msg||'';MP.win=s.win||null;MP.net=true;if(moved)sel=null;draw()}
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',onIntent);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});
 if(MP.net){push(true);return} // friend came back: carry on
 MP.net=true;newNet()}
CBNet.panel({game:GAME,title:'Critter Chess',pos:'bottom:12px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;MP.net=true;msg='';c2.on('data',m=>{if(m&&m.t==='s')apply(m)})},
 onHostGone:()=>{MP.net=false;msg='';init()}});
})();
