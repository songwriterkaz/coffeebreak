/* Coffeebreak After Dark online: heads-up five-card draw between two people with an invite link.
   Both players pass the 18+ gate first. The host deals and checks every move; the friend only ever sees their own cards
   until showdown. Run out of chips and you take off one item (emoji outfit) for 100 more chips. No chat, no names. */
(function(){
const MP=window.MP={role:null,conn:null,last:'',sel:[],V:null};const GAME='after-dark-poker';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const open=()=>!!(MP.conn&&MP.conn.open),host=()=>MP.role==='host',join=()=>MP.role==='join';
function send(o){try{open()&&MP.conn.send(o)}catch(e){}}
let NM=null;// host-side match
function nDeck(){const d=[];for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}return d}
function startNet(){NM={chips:[100,100],left:[6,6],h:[[],[]],pot:0,phase:'done',toAct:0,toCall:0,raised:false,checks:0,drew:[false,false],show:false,msg:'',first:1,hands:0,over:-1,deck:[]};G.state='net';nHand();push(true)}
const other=p=>1-p,mb=()=>Math.min(NM.chips[0],NM.chips[1]);
function strip(){for(const p of[0,1]){if(NM.chips[p]<10){if(NM.left[p]>0){NM.left[p]--;NM.chips[p]+=100;NM.msg+=' {'+p+'} took off the '+PI[5-NM.left[p]][1].toLowerCase()+'. +100 chips.'}else{NM.over=other(p);NM.phase='over';NM.show=true;return true}}}return false}
function nHand(){NM.msg='';if(strip())return;
 if(window.DEMO&&++NM.hands>10){NM.phase='demo';return}
 NM.deck=nDeck();NM.h=[NM.deck.splice(0,5),NM.deck.splice(0,5)];NM.chips[0]-=10;NM.chips[1]-=10;NM.pot=20;NM.first=other(NM.first);NM.toAct=NM.first;NM.phase='bet1';NM.checks=0;NM.raised=false;NM.toCall=0;NM.drew=[false,false];NM.show=false;NM.msg=(NM.msg?NM.msg.trim()+' ':'')+'New hand. {'+NM.first+'} to act first.'}
function adv(){NM.checks=0;NM.raised=false;NM.toCall=0;if(NM.phase==='bet1'||NM.phase==='call1'){NM.phase='draw';NM.drew=[false,false];NM.msg+=' Both players swap cards now.'}else showdown()}
function showdown(){NM.show=true;const c=cmp(ev(NM.h[0]),ev(NM.h[1]));if(c===0){NM.chips[0]+=NM.pot/2;NM.chips[1]+=NM.pot/2;NM.msg='Split pot.'}else{const w=c>0?0:1;NM.chips[w]+=NM.pot;NM.msg='{'+w+'} won with '+hname(NM.h[w]).replace('!','')+'. +'+NM.pot}NM.pot=0;NM.phase='done'}
function act(p,m){if(!NM)return;const a=m.a,ph=NM.phase,o=other(p);
 if(a==='next'){if(ph==='done'){nHand();tone(600,.08,.05)}return}
 if(a==='rematch'){if(ph==='over'&&p===0)startNet();return}
 if(a==='draw'){if(ph!=='draw'||NM.drew[p]||!Array.isArray(m.sel))return;const s=[...new Set(m.sel)].filter(i=>Number.isInteger(i)&&i>=0&&i<5);const ace=NM.h[p].some((c,j)=>c.r===14&&!s.includes(j));if(s.length>3&&!(s.length===4&&ace))return;
  s.forEach(i=>NM.h[p][i]=NM.deck.pop());NM.drew[p]=true;NM.msg='{'+p+'} swapped '+(s.length||'no')+' card'+(s.length===1?'':'s')+'.';if(NM.drew[0]&&NM.drew[1]){NM.phase='bet2';NM.toAct=NM.first;NM.msg+=' Second round of betting. {'+NM.first+'} to act.'}return}
 if(NM.toAct!==p)return;
 if(ph==='bet1'||ph==='bet2'){
  if(a==='check'){NM.msg='{'+p+'} checked.';if(++NM.checks>=2)adv();else NM.toAct=o;return}
  if(a==='bet'){const b=Math.min(m.b===50?50:20,mb());if(b<1)return;NM.chips[p]-=b;NM.pot+=b;NM.toCall=b;NM.phase=ph==='bet1'?'call1':'call2';NM.toAct=o;NM.msg='{'+p+'} bet '+b+'.';return}}
 if(ph==='call1'||ph==='call2'){
  if(a==='call'){const c=Math.min(NM.toCall,NM.chips[p]);NM.chips[p]-=c;NM.pot+=c;NM.msg='{'+p+'} called.';adv();return}
  if(a==='fold'){NM.chips[o]+=NM.pot;NM.pot=0;NM.msg='{'+p+'} folded. {'+o+'} takes the pot.';NM.phase='done';return}
  if(a==='raise'&&!NM.raised){const c=Math.min(NM.toCall,NM.chips[p]);NM.chips[p]-=c;NM.pot+=c;const r=Math.min(20,mb());if(r<1){NM.msg='{'+p+'} called.';adv();return}NM.chips[p]-=r;NM.pot+=r;NM.toCall=r;NM.raised=true;NM.toAct=o;NM.msg='{'+p+'} called and raised '+r+'.';return}}}
function fmt(s,p){return s.replace(/\{(\d)\}/g,(_,k)=>+k===p?'You':'Your friend').replace(/^Your friend|(\. )Your friend/g,(m)=>m)}
function view(p){const o=other(p);return{t:'v',ch:[NM.chips[p],NM.chips[o]],left:[NM.left[p],NM.left[o]],my:NM.h[p],op:NM.show?NM.h[o]:null,pot:NM.pot,ph:NM.phase,turn:NM.toAct===p,toCall:NM.toCall,raised:NM.raised,drew:NM.drew[p],odrew:NM.drew[o],msg:fmt(NM.msg,p),over:NM.over<0?-1:(NM.over===p?1:0),mb:mb()}}
function push(force){if(!host()||!NM)return;MP.V=view(0);if(!open())return;const v=view(1),k=JSON.stringify(v);if(force||k!==MP.last){MP.last=k;send(v)}}
setInterval(()=>push(false),250);setInterval(()=>{MP.last=''},3000);
function doAct(m){if(host()){act(0,m);push(true)}else send(Object.assign({t:'act'},m))}
let shownDemo=false;
function drawNet(V){stage();bgT();
 x.fillStyle='rgba(20,4,10,.75)';rr(10,10,310,46,12);x.fill();T('🌐 Your friend',22,38,18,'#fff');T('💰 '+V.ch[1],306,38,16,'#ffd24a','right');
 PI.forEach((q,i)=>{x.globalAlpha=i<6-V.left[1]?.18:1;emo(q[0],70+(i%3)*95,170+Math.floor(i/3)*110,62);x.globalAlpha=1});
 x.fillStyle='rgba(20,4,10,.75)';rr(10,530,310,32,10);x.fill();T('Wearing: '+V.left[1]+' / 6 items',165,551,13,'#ffd6e8','center','');
 T('Online game · heads-up',165,440,15,'#ffb0cc','center','');
 for(let i=0;i<5;i++)card(400+i*68,110,60,86,V.op?V.op[i]:{r:2,s:0},!!V.op,false);if(V.op)T(hname(V.op).replace('!',''),570,218,15,'#ffb0cc','center');
 T('POT  '+V.pot,620,248,22,'#ffd24a','center');x.fillStyle='#ffe9ef';x.font='15px Georgia';x.textAlign='center';wrapT(V.msg,620,272,520,18);x.textAlign='left';
 const sel=MP.sel;for(let i=0;i<5;i++){if(!V.my[i])continue;const s=sel.includes(i),Y=300-(s?18:0);card(372+i*100,Y,88,124,V.my[i],true,s);if(s)T('SWAP',416+i*100,Y-6,12,'#ff4f9a','center');
  BTN['c'+i]={x:372+i*100,y:Y,w:88,h:124,fn:()=>{if(V.ph!=='draw'||V.drew)return;const k=sel.indexOf(i);if(k>=0)sel.splice(k,1);else{const ace=V.my.some((c,j)=>c.r===14&&!sel.includes(j)&&j!==i);if(sel.length<3||(sel.length<4&&ace))sel.push(i)}tone(800,.04,.04)}}}
 if(V.my.length)T(hname(V.my).replace('!',''),620,456,16,'#ffd6e8','center');const ph=V.ph,wait=s=>T(s,620,500,17,'#ffb0cc','center','italic ');
 if(ph==='bet1'||ph==='bet2'){if(V.turn){button('chk',380,472,150,48,'Check',()=>doAct({a:'check'}),{fs:17});button('b20',545,472,150,48,'Bet '+Math.min(20,V.mb),()=>doAct({a:'bet',b:20}),{fs:17,dis:V.mb<1,bg:'#ff4f9a',fg:'#fff'});button('b50',710,472,150,48,'Bet '+Math.min(50,V.mb),()=>doAct({a:'bet',b:50}),{fs:17,dis:V.mb<1,bg:'#c8102e',fg:'#fff'})}else wait('Your friend’s move…')}
 else if(ph==='call1'||ph==='call2'){if(V.turn){button('call',380,472,150,48,'Call '+Math.min(V.toCall,V.ch[0]),()=>doAct({a:'call'}),{fs:17,bg:'#ff4f9a',fg:'#fff'});button('rse',545,472,150,48,'Raise 20',()=>doAct({a:'raise'}),{fs:17,dis:V.raised||V.mb<V.toCall+1});button('fold',710,472,150,48,'Fold',()=>doAct({a:'fold'}),{fs:17})}else wait('Your friend’s move…')}
 else if(ph==='draw'){if(!V.drew)button('drw',480,472,280,48,sel.length?'Swap '+sel.length+' card'+(sel.length>1?'s':''):'Keep all (stand pat)',()=>{doAct({a:'draw',sel:sel.slice()});MP.sel=[]},{fs:17,bg:'#ff4f9a',fg:'#fff'});else wait('Waiting for your friend to swap…')}
 else if(ph==='done')button('nx',480,472,280,48,'Next hand ▶',()=>{MP.sel=[];doAct({a:'next'})},{fs:18,bg:'#ff4f9a',fg:'#fff'});
 else if(ph==='over'){x.fillStyle='rgba(20,4,10,.85)';rr(360,250,520,200,16);x.fill();T(V.over?'You win the match 💋':'Your friend wins the match',620,310,30,'#ffd24a','center');T(V.over?'Your friend is out of chips and clothes.':'You are out of chips and clothes.',620,350,17,'#ffe9ef','center','');
  if(host())button('rm',520,380,200,48,'Rematch',()=>doAct({a:'rematch'}),{fs:18,bg:'#ff4f9a',fg:'#fff'});else wait('Waiting for your friend to start a rematch…')}
 else if(ph==='demo'){T('End of the free demo',620,500,18,'#ffd24a','center');if(!shownDemo&&window.demoEnd){shownDemo=true;demoEnd('That was 10 hands of the free demo. The full game has the whole match and all 4 opponents.')}}
 x.fillStyle='rgba(20,4,10,.8)';rr(340,530,550,46,12);x.fill();T('You 💰 '+V.ch[0],356,559,17,'#ffd24a');PI.forEach((q,i)=>{x.globalAlpha=i<6-V.left[0]?.2:1;emo(q[0],560+i*48,553,26);x.globalAlpha=1})}
function waitScreen(s){x.fillStyle='#14040a';x.fillRect(0,0,900,600);x.save();x.shadowColor='#ff4f9a';x.shadowBlur=24;T('Coffeebreak After Dark',450,200,40,'#ff7ab0','center');x.restore();T(s,450,280,20,'#ffd6e8','center','')}
const oDraw=draw,oUpdate=update;
window.draw=function(){
 if(G.state==='gate'||G.state==='denied')return oDraw();
 if(join()){x.clearRect(0,0,900,600);if(MP.V&&open()||MP.V&&MP.V.ph==='demo')drawNet(MP.V);else waitScreen(open()?'Connected. Waiting for your friend to deal…':'Joining your friend’s table…');return}
 if(host()&&NM&&G.state==='net'){x.clearRect(0,0,900,600);drawNet(MP.V||view(0));if(!open()){x.fillStyle='rgba(20,4,10,.85)';rr(360,60,520,40,10);x.fill();T('Your friend has stepped away. The same link still works.',620,86,14,'#ffd6e8','center','')}return}
 oDraw();
 if(host()&&open()&&G.state==='title'){T('🌐 Your friend is here. Dealing an online hand…',450,520,15,'#7fd88a','center')}};
window.update=function(dt){oUpdate(dt);if(host()&&open()&&!NM&&G.state!=='gate'&&G.state!=='denied')startNet()};
function attach(c2){MP.conn=c2;MP.last='';c2.on('data',m=>{if(m&&m.t==='act'&&NM){act(1,m);push(true)}});c2.on('close',()=>{if(MP.conn===c2)MP.conn=null});if(NM)push(true)}
CBNet.panel({game:GAME,title:'Coffeebreak After Dark (18+)',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;c2.on('data',m=>{if(m&&m.t==='v'){if(MP.V&&MP.V.ph!=='draw'&&m.ph==='draw')MP.sel=[];MP.V=m}})},
 onHostGone:()=>{MP.V=null;MP.role=null;if(G.state!=='gate'&&G.state!=='denied')G.state='title'}});
window.MPdbg={get NM(){return NM},act};
})();
