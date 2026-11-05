/* Coffeebreak Oz Quiz online: invite link. Host picks the quiz; both get the same questions at the same time and
   answer on their own device. Scores are shown side by side. No chat, no names, no lobby. */
(function(){
const MP=window.MP={role:null,conn:null,cur:null,fa:null,fs:0,fr:0,force:null};const GAME='oz-quiz';
const INV=CBNet.invite();if(INV&&INV.game===GAME)MP.role='join';
const open=()=>!!(MP.conn&&MP.conn.open),on=()=>!!MP.role&&open();
function send(o){try{open()&&MP.conn.send(o)}catch(e){}}
const bar=document.createElement('div');bar.id='mpBar';bar.style.cssText='display:none;font-weight:700;color:#6b4226;margin:6px 0;padding:6px 10px;background:#f1e2c4;border-radius:10px';
$('play').insertBefore(bar,$('tbar'));
const note=document.createElement('p');note.id='mpNote';note.style.cssText='display:none;font-weight:700;color:#6b4226;background:#f1e2c4;border-radius:10px;padding:8px';
$('home').insertBefore(note,$('go'));
const wait=document.createElement('p');wait.id='mpWait';wait.style.cssText='display:none;font-weight:700;color:#6b4226';wait.textContent='Waiting for your friend to go on to the next question.';
$('play').appendChild(wait);
function ui(){const j=MP.role==='join'&&open(),h=MP.role==='host'&&open();
 note.style.display=j||h?'block':'none';note.textContent=j?'You are in your friend’s quiz. Waiting for your friend to start. You both get the same questions.':'Your friend is here. Press Start quiz and you both get the same questions.';
 $('go').style.display=j?'none':'';document.querySelectorAll('#cats input,#diff,#num').forEach(e=>e.disabled=j);
 bar.style.display=(j||h||MP.cur)&&$('play').style.display!=='none'?'block':'none';
 bar.textContent='You: '+score+'   ·   Your friend: '+MP.fs+(MP.fa===qi?'   ·   Your friend has answered':'   ·   Your friend is thinking');
 if(h&&$('play').style.display!=='none'&&$('next').textContent){const ready=MP.fa===qi||!open();$('next').disabled=!ready&&$('next').style.display!=='none';}
 if(j){if($('next').style.display!=='none'){$('next').style.display='none';wait.textContent=qi+1<Q.length?'Waiting for your friend to go on to the next question.':'Waiting for your friend to open the results.';wait.style.display='block'}}else wait.style.display='none'}
setInterval(ui,300);
const oShuf=shuf,oAsk=ask,oAnswer=answer,oFinish=finish;
window.shuf=function(a){if(MP.force){const f=MP.force;MP.force=null;return f.slice()}return oShuf(a)};
window.ask=function(){wait.style.display='none';if(MP.role==='join'&&open()){MP.force=MP.cur.opts;oAsk();return}
 oAsk();if(MP.role==='host'&&open()){if(qi===0){MP.fs=0;MP.fr=0}MP.fa=null;sendQ()}ui()};
function sendQ(){const opts=[...document.querySelectorAll('.opt')].map(b=>b.textContent);send({t:'q',qi,n:Q.length,q:Q[qi],opts,diff,fs:score,fr:right})}
window.answer=function(o){oAnswer(o);if(on())send({t:'a',qi,score,right});ui()};
window.finish=function(){if(MP.role==='host'&&open())send({t:'end'});oFinish();
 if(MP.role&&(open()||MP.cur)){const d=$('done'),p=document.createElement('p');p.style.cssText='font-size:1.2em;font-weight:700';
  const r=score>MP.fs?'You win this one.':score<MP.fs?'Your friend wins this one.':'It is a draw.';
  p.textContent='You: '+score+' points   ·   Your friend: '+MP.fs+' points. '+r;d.insertBefore(p,d.children[1]);
  if(MP.role==='join'){const a=$('again');a.textContent='Back to the start';}}
 bar.style.display='none';wait.style.display='none'};
$('next').addEventListener('click',e=>{if(MP.role==='join'&&open())e.stopImmediatePropagation()},true);
function onJoinMsg(m){if(!m)return;
 if(m.t==='q'){const q=m.q;if(!Array.isArray(q)||q.length<7||!Array.isArray(m.opts))return;MP.cur=m;
  if(m.qi===0||!Q.length){score=0;right=0;streak=0}
  if(isFinite(m.fs))MP.fs=m.fs;diff=DIFF[m.diff]?m.diff:'medium';Q=new Array(m.n).fill(null);Q[m.qi]=q.map(String);qi=m.qi;
  MP.fa=null;$('home').style.display='none';$('done').style.display='none';$('play').style.display='block';window.ask();return}
 if(m.t==='a'){MP.fa=m.qi;MP.fs=+m.score||0;MP.fr=+m.right||0;ui();return}
 if(m.t==='end'){if($('play').style.display!=='none'){if(!document.querySelector('.opt:disabled'))window.answer(null);window.finish()}}}
function onHostMsg(m){if(!m)return;if(m.t==='a'){MP.fa=m.qi;MP.fs=+m.score||0;MP.fr=+m.right||0;ui()}}
function attach(c2){MP.conn=c2;c2.on('data',onHostMsg);c2.on('close',()=>{if(MP.conn===c2)MP.conn=null;ui()});
 if($('play').style.display!=='none'&&Q.length){MP.fa=null;sendQ()}ui()} // friend came back mid quiz: send the current question
CBNet.panel({game:GAME,title:'Coffeebreak Oz Quiz',pos:'bottom:62px;right:8px;',
 onHost:H=>{MP.role='host';MP.H=H},onPeer:attach,
 onJoin:c2=>{MP.role='join';MP.conn=c2;c2.on('data',onJoinMsg);ui()},
 onHostGone:()=>{ui()}});
})();
