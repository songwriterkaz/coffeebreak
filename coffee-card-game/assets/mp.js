/* Coffeebreak online 2-player mode (prototype). Free WebRTC peer-to-peer via PeerJS public signalling.
   Host runs the game; the friend's device sends moves. No chat, no free-text names: kid-safe by design. */
(function(){
const PFX='cbcoffee-card-v1-';const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'}]};
const MP=window.MP={role:null,conn:null,peer:null,code:'',status:'',last:''};
const HOSTN='Host ☕',FRN='Friend 💖';
const orig={newRound,play,humanDraw,pass,callCoffee,catchAI,turnStart};
function send(o){try{MP.conn&&MP.conn.open&&MP.conn.send(o)}catch(e){}}
function setStatus(s){MP.status=s;const el=document.getElementById('mpStatus');if(el)el.textContent=s}
function mkCode(){const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=a[Math.random()*a.length|0];return s}
// ---------- UI ----------
const box=document.createElement('div');box.id='mpBox';box.style.cssText='position:fixed;top:44px;right:8px;z-index:99;background:#12060c;border:2px solid #e8a0b0;border-radius:12px;padding:8px;font:14px Georgia;color:#ffe9c7;max-width:260px';
box.innerHTML='<b style="color:#e8a0b0">🌐 Play a friend online</b><div id="mpBtns" style="margin-top:6px"><button id="mpHost">Make a room</button> <button id="mpJoinB">Join</button></div><div id="mpJoin" style="display:none;margin-top:6px"><input id="mpCode" maxlength="6" placeholder="Room code" style="width:90px;font:16px monospace;text-transform:uppercase"> <button id="mpGo">Go</button></div><div id="mpStatus" style="margin-top:6px;font-size:13px"></div><div style="font-size:11px;opacity:.7;margin-top:4px">Only share your room code with people you know. No chat, no names, nothing stored.</div>';
document.body.appendChild(box);
document.getElementById('mpHost').onclick=()=>host();
document.getElementById('mpJoinB').onclick=()=>{document.getElementById('mpJoin').style.display='block'};
document.getElementById('mpGo').onclick=()=>join(document.getElementById('mpCode').value.trim().toUpperCase());
// ---------- host ----------
function host(code){MP.role='host';MP.code=code||mkCode();setStatus('Opening room…');
 const p=MP.peer=new (window.__MP_TEST_PEER||Peer)(PFX+MP.code,{config:ICE,debug:0});
 p.on('open',()=>setStatus('Room code: '+MP.code+' · waiting for your friend'));
 p.on('error',e=>{if(e.type==='unavailable-id'&&!code){p.destroy();host()}else setStatus('Connection problem: '+e.type)});
 p.on('connection',c=>{if(MP.conn&&MP.conn.open){c.on('open',()=>{c.send({t:'full'});setTimeout(()=>c.close(),300)});return}
  MP.conn=c;c.on('open',()=>{setStatus('Friend joined. Dealing…');G.nOpp=1;newRound();});
  c.on('data',onHostMsg);c.on('close',()=>{setStatus('Your friend left the room.');MP.conn=null;G.state='title'})})}
window.newRound=function(){orig.newRound();if(MP.role==='host'&&MP.conn){G.P[0].name=G.P[0].n=HOSTN;G.P[0].e='☕';G.P[1]=Object.assign(G.P[1],{name:FRN,n:FRN,e:'💖',ai:false,remote:true});G.msg='Your turn. Match the roast or the number.';}};
window.turnStart=function(){orig.turnStart();if(MP.role==='host'&&MP.conn&&G.cur===1)G.msg=G.msg.replace(' Your turn.',' '+FRN+'\'s turn.')};
window.play=function(i,c,ch){if(MP.role==='join'){send({t:'play',id:c.id,ch});G.state='play';return}orig.play(i,c,ch);fixCatch()};
function fixCatch(){if(MP.role==='host'&&G.P[1]&&G.P[1].remote&&G.catchable===0&&G.P[1].hand.length===1&&!G.P[1].called&&G.P[0].hand.length!==1)G.catchable=1}
function onHostMsg(m){const P1=G.P[1];if(!P1||!P1.remote)return;
 if(m.t==='again'){if(G.state==='end')newRound();return}
 if(G.state!=='play'&&G.state!=='choose')return;
 if(m.t==='play'){if(G.cur!==1)return;const c=P1.hand.find(h=>h.id===m.id);if(!c||!canPlay(c))return;if(G.drawn&&c!==G.drawn)return;const ch=isWild(c)?((m.ch|0)%4):c.r;window.play(1,c,ch)}
 else if(m.t==='draw'){if(G.cur!==1||G.drawn)return;const c=draw1();P1.hand.push(c);P1.called=false;if(canPlay(c)){G.drawn=c;G.msg=FRN+' drew a card.'}else{G.msg=FRN+' drew a card.';G.decaf=false;next(1);turnStart()}}
 else if(m.t==='pass'){if(G.cur===1&&G.drawn)orig.pass()}
 else if(m.t==='call'){if(P1.hand.length<=2){P1.called=true;if(G.catchable===1)G.catchable=-1;say(1,'COFFEE. ☕')}}
 else if(m.t==='catch'){const p0=G.P[0];if(G.catchable===0&&p0.hand.length===1&&!p0.called){give(0,2);say(0,'Oops. Forgot to call.');G.msg=FRN+' caught '+HOSTN+'! Draw 2.';G.catchable=-1}}}
function snap(){const N=G.P.length,r=i=>(i-1+N)%N;const P=new Array(N);
 G.P.forEach((p,i)=>{P[r(i)]={name:p.name,n:p.n||p.name,e:p.e||'☕',called:p.called,hand:i===1?p.hand.map(c=>({r:c.r,v:c.v,id:c.id,cr:c.cr})):p.hand.length}});
 const tp=G.pile[G.pile.length-1];
 return{t:'s',state:G.state==='choose'?'play':G.state,P,deck:G.deck.length,top:tp&&{r:tp.r,v:tp.v,id:tp.id,cr:tp.cr},roast:G.roast,dir:G.dir,decaf:G.decaf,cur:r(G.cur),winner:G.winner>=0?r(G.winner):-1,catchable:G.catchable>=0?r(G.catchable):-1,drawn:G.cur===1&&G.drawn?G.drawn.id:null,msg:G.msg,bub:G.bub.map(b=>({i:r(b.i),s:b.s,l:b.l}))}}
setInterval(()=>{if(MP.role!=='host'||!MP.conn||!MP.conn.open||!G.P.length)return;if(G.state!=='play'&&G.state!=='choose'&&G.state!=='end')return;const s=snap();const k=JSON.stringify(Object.assign({},s,{bub:s.bub.map(b=>b.s)}));if(k!==MP.last){MP.last=k;send(s)}},120);
// ---------- join ----------
function join(code){if(!/^[A-Z0-9]{6}$/.test(code)){setStatus('Room codes are 6 letters or numbers.');return}MP.role='join';MP.code=code;setStatus('Connecting…');
 const p=MP.peer=new (window.__MP_TEST_PEER||Peer)(undefined,{config:ICE,debug:0});
 p.on('error',e=>setStatus(e.type==='peer-unavailable'?'No room with that code.':'Connection problem: '+e.type));
 p.on('open',()=>{const c=MP.conn=p.connect(PFX+code,{reliable:true});
  c.on('open',()=>setStatus('Connected to room '+code));
  c.on('data',m=>{if(m.t==='full'){setStatus('That room is full.');return}if(m.t==='s')apply(m)});
  c.on('close',()=>{setStatus('The host left the room.');G.state='title'})})}
let lastEnd=false;
function apply(s){const prevChoose=G.state==='choose';
 G.P.length=0;s.P.forEach(p=>G.P.push({name:p.name,n:p.n,e:p.e,ai:false,called:p.called,hand:Array.isArray(p.hand)?p.hand:new Array(p.hand).fill(0)}));
 G.deck=new Array(s.deck).fill(0);G.pile=s.top?[s.top]:[];G.roast=s.roast;G.dir=s.dir;G.decaf=s.decaf;G.cur=s.cur;G.winner=s.winner;G.catchable=s.catchable;G.msg=s.msg;G.flys=[];
 G.drawn=s.drawn!=null?G.P[0].hand.find(c=>c.id===s.drawn):null;
 G.bub=s.bub.map(b=>{const [bx,by]=seat(b.i);return{i:b.i,x:bx,y:b.i===0?400:by+90,s:b.s,l:b.l}});
 G.state=(prevChoose&&s.state==='play'&&G.cur===0)?'choose':s.state;
 if(s.state==='end'&&!lastEnd){S.rounds++;if(G.winner===0){S.wins++;S.streak++;S.best=Math.max(S.best,S.streak)}else{S.losses++;S.streak=0}saveS();G.endT=0}lastEnd=s.state==='end';
 MP.applied=(MP.applied||0)+1}
// client overrides: moves go to the host
const J=f=>function(){return MP.role==='join'?f.apply(this,arguments):undefined};
const wrap=(name,jf)=>{const o=window[name];window[name]=function(){if(MP.role==='join')return jf.apply(this,arguments);return o.apply(this,arguments)}};
wrap('humanDraw',()=>{if(G.state==='play'&&G.cur===0&&!G.drawn)send({t:'draw'})});
wrap('pass',()=>{if(G.drawn)send({t:'pass'})});
wrap('callCoffee',()=>send({t:'call'}));
wrap('catchAI',()=>send({t:'catch'}));
wrap('newRound',()=>send({t:'again'}));
// auto start from URL for testing: ?mp=host&code=ABC234 or ?mp=join&code=ABC234
const q=new URLSearchParams(location.search);if(q.get('mp')==='host')host(q.get('code')||undefined);if(q.get('mp')==='join')setTimeout(()=>join((q.get('code')||'').toUpperCase()),300);
})();
