(function(){
const $=s=>document.querySelector(s),ROOMS=['General','Music','Country','Stores','Off-topic'];
let B,room='General',unsub=null,lastSend=0,burst=[];
const blocked=new Set(JSON.parse(localStorage.getItem('cbchat-blocked')||'[]'));
let prev='gate';
function show(v){document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!==v);if(v==='admin')loadReports();}
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=b.dataset.v;if(v==='back')return show(prev);if(v==='rules'){prev=document.querySelector('.view:not([hidden])').id;}show(v)});
document.querySelectorAll('#rulesLink,.rl').forEach(a=>a.onclick=e=>{e.preventDefault();prev=document.querySelector('.view:not([hidden])').id;show('rules')});
function age(d){const b=new Date(d),n=new Date();let a=n.getFullYear()-b.getFullYear();const m=n.getMonth()-b.getMonth();if(m<0||(m===0&&n.getDate()<b.getDate()))a--;return a}
window.cbAge=age;
async function start(){B=window.CBBackend();try{await B.init()}catch(e){$('#gateErr').textContent='Chat server unavailable.';}
$('#mode').textContent=B.mode==='demo'?'DEMO (local only)':'';
if(localStorage.getItem('cbchat-under18'))return show('blocked');
const nm=localStorage.getItem('cbchat-name');if(nm&&localStorage.getItem('cbchat-ok'))enter(nm);}
$('#enter').onclick=()=>{const d=$('#dob').value,n=$('#nameIn').value.trim(),E=$('#gateErr');
if(!d)return E.textContent='Please enter your date of birth.';const a=age(d);
if(a<18){localStorage.setItem('cbchat-under18','1');return show('blocked')}
if(a>120)return E.textContent='Please enter a real date of birth.';
if(n.length<2)return E.textContent='Pick a display name (2+ characters).';
if(CBFilter.clean(n)!==n)return E.textContent='Please pick a different name.';
if(!$('#agree').checked)return E.textContent='Please agree to the rules.';
localStorage.setItem('cbchat-ok','1');localStorage.setItem('cbchat-name',n);enter(n)};
function enter(n){$('#adminBtn').hidden=!B.isAdmin;show('chat');rooms();join('General')}
function rooms(){$('#rooms').innerHTML='';ROOMS.forEach(r=>{const b=document.createElement('button');b.textContent='# '+r;b.className=r===room?'on':'';b.onclick=()=>join(r);$('#rooms').append(b)})}
function join(r){room=r;rooms();unsub&&unsub();unsub=B.listen(r,render)}
function render(ms){const box=$('#msgs');box.innerHTML='';ms.filter(m=>!blocked.has(m.uid)).forEach(m=>{
 const d=document.createElement('div');d.className='m';const t=new Date(m.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
 d.innerHTML=`<b></b> <small>${t}</small><p></p><span class="act"></span>`;d.querySelector('b').textContent=m.name;d.querySelector('p').textContent=CBFilter.clean(m.text);
 const act=d.querySelector('.act');const btn=(l,f)=>{const x=document.createElement('button');x.textContent=l;x.onclick=f;act.append(x)};
 if(m.uid!==B.uid){btn('Report',async()=>{const r=prompt('Why are you reporting this message?');if(r!==null){await B.report(m,r.slice(0,200));alert('Thanks, an admin will check it.')}});
  btn('Block',()=>{if(confirm('Hide all messages from '+m.name+'?')){blocked.add(m.uid);localStorage.setItem('cbchat-blocked',JSON.stringify([...blocked]));join(room)}})}
 if(B.isAdmin){btn('Delete',()=>B.del(m.id).catch(e=>alert(e.message)));if(m.uid!==B.uid)btn('Ban',()=>{if(confirm('Ban '+m.name+'?'))B.ban(m.uid).catch(e=>alert(e.message))})}
 box.append(d)});box.scrollTop=box.scrollHeight}
$('#f').onsubmit=async e=>{e.preventDefault();const E=$('#err');E.textContent='';let t=$('#t').value.trim();if(!t)return;
 const now=Date.now();burst=burst.filter(x=>now-x<30000);
 if(now-lastSend<3000||burst.length>=8)return E.textContent='Slow down a little — wait a few seconds.';
 if(B.isBanned())return E.textContent='You have been banned from this chat.';
 if(CBFilter.personalInfo(t))return E.textContent="Please don't share personal info (phone, email, address, bank/card numbers).";
 t=CBFilter.clean(t);
 try{await B.send(room,localStorage.getItem('cbchat-name'),t);lastSend=now;burst.push(now);$('#t').value=''}catch(x){E.textContent=/banned|permission/i.test(x.message)?'You can\'t post right now (banned or too fast).':'Send failed.'}};
async function loadReports(){const R=$('#reports');R.textContent='Loading…';try{const rs=await B.reports();R.innerHTML='';
 if(!rs.length)R.textContent='No reports.';rs.forEach(r=>{const d=document.createElement('div');d.className='m';d.textContent=`"${r.text}" — reason: ${r.reason||'(none)'}`;
 const b=document.createElement('button');b.textContent='Ban author';b.onclick=()=>B.ban(r.uid);const x=document.createElement('button');x.textContent='Delete message';x.onclick=()=>B.del(r.msgId);d.append(' ',x,b);R.append(d)})}catch(e){R.textContent='Could not load reports.'}}
start();
})();
