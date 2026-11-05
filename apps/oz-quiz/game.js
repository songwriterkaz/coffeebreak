// Coffeebreak Oz Quiz
const $=id=>document.getElementById(id);
const CATS={history:'📜 History',geography:'🗺️ Geography',animals:'🦘 Animals',sport:'🏏 Sport',music:'🎸 Music',food:'🥧 Food',slang:'🗣️ Slang',newcastle:'⚓ Newcastle'};
const DIFF={easy:{t:25,mul:1},medium:{t:15,mul:2},hard:{t:8,mul:3}};
let Q=[],qi=0,score=0,right=0,timer=null,tleft=0,diff='medium',streak=0;
$('cats').innerHTML=Object.keys(CATS).map(c=>'<label><input type="checkbox" value="'+c+'" checked> '+CATS[c]+' <span class="small">('+QS.filter(q=>q[0]===c).length+')</span></label>').join('');
function shuf(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
function hs(){const h=JSON.parse(localStorage.cbOzHS||'[]');$('hs').innerHTML=h.length?'<table><tr><th>#</th><th>Name</th><th>Score</th><th>Level</th><th>Date</th></tr>'+h.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+x.n.replace(/</g,'')+'</td><td>'+x.s+'</td><td>'+x.d+'</td><td>'+x.t+'</td></tr>').join('')+'</table>':'<p class="small">No scores yet. Be the first!</p>';}
$('go').onclick=()=>{const cs=[...document.querySelectorAll('#cats input:checked')].map(e=>e.value);if(!cs.length)return alert('Pick at least one category');diff=$('diff').value;
 let pool=shuf(QS.filter(q=>cs.includes(q[0])));if(diff==='easy')pool.sort((a,b)=>a[1]-b[1]);if(diff==='hard')pool.sort((a,b)=>b[1]-a[1]);
 const n=Math.min(+$('num').value,pool.length);Q=shuf(pool.slice(0,n));qi=0;score=0;right=0;streak=0;$('home').style.display='none';$('done').style.display='none';$('play').style.display='block';ask();};
function ask(){const q=Q[qi];$('qn').textContent='Question '+(qi+1)+' of '+Q.length;$('cat').textContent=CATS[q[0]];$('sc').textContent='Score '+score;$('q').textContent=q[2];$('fb').textContent='';$('next').style.display='none';
 const opts=shuf([q[3],q[4],q[5],q[6]]);$('opts').innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.className='opt';b.textContent=o;b.onclick=()=>answer(o);$('opts').appendChild(b);});
 tleft=DIFF[diff].t;clearInterval(timer);const t0=Date.now();timer=setInterval(()=>{const l=DIFF[diff].t-(Date.now()-t0)/1000;tleft=l;$('tfill').style.width=Math.max(0,l/DIFF[diff].t*100)+'%';$('tfill').style.background=l<4?'#c0392b':'#2e8b57';if(l<=0)answer(null);},100);}
function answer(o){clearInterval(timer);const q=Q[qi];document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;if(b.textContent===q[3])b.classList.add('ok');else if(b.textContent===o)b.classList.add('no');});
 if(o===q[3]){right++;streak++;const pts=Math.round((100+Math.max(0,tleft)*10)*DIFF[diff].mul)+(streak>=3?50:0);score+=pts;$('fb').textContent='✅ Correct! +'+pts+(streak>=3?' (streak bonus 🔥)':'');}
 else{streak=0;if(diff!=='easy')score=Math.max(0,score-25*DIFF[diff].mul);$('fb').textContent=(o===null?'⏰ Time\'s up! ':'❌ Not quite. ')+'The answer is: '+q[3];}
 $('sc').textContent='Score '+score;$('next').style.display='inline-block';$('next').textContent=qi+1<Q.length?'Next ➡️':'See results 🏆';}
$('next').onclick=()=>{qi++;if(qi<Q.length)ask();else finish();};
function finish(){$('play').style.display='none';const d=$('done');d.style.display='block';const pct=Math.round(right/Q.length*100);
 const title=pct>=90?'Fair dinkum legend! 🏆':pct>=70?'Bonza effort! 🦘':pct>=50?'Not bad, mate ☕':'Better luck next time, ya galah 😄';
 d.innerHTML='<h2>'+title+'</h2><p style="font-size:1.2em">You got <b>'+right+' / '+Q.length+'</b> ('+pct+'%) and scored <b>'+score+'</b> points.</p><p>Your name for the high scores: <input id="nm" maxlength="16" value="'+(localStorage.cbOzName||'')+'"> <button class="b" id="save">Save score</button></p><button class="b" id="again">Play again</button>';
 $('save').onclick=()=>{const n=$('nm').value.trim()||'Anonymous';localStorage.cbOzName=n;const h=JSON.parse(localStorage.cbOzHS||'[]');h.push({n,s:score,d:diff,t:new Date().toLocaleDateString('en-AU')});h.sort((a,b)=>b.s-a.s);localStorage.cbOzHS=JSON.stringify(h.slice(0,10));$('save').disabled=true;$('save').textContent='Saved ✔';};
 $('again').onclick=()=>{d.style.display='none';$('home').style.display='block';hs();};}
hs();
