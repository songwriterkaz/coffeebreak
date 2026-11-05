(function(){
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var tab='gen',$=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function list(){return tab==='slang'?SLANG:tab==='music'?MUSIC:[]}
function speak(t){try{var u=new SpeechSynthesisUtterance(t);u.lang=tab==='slang'?'en-AU':'en-GB';speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){alert('Speech is not supported on this device.')}}
function favs(){return LS.get('cbd_fav',[])}
function isFav(w,t){return favs().some(function(f){return f.w===w&&f.t===t})}
function toggleFav(w,t){var f=favs(),i=f.findIndex(function(x){return x.w===w&&x.t===t});if(i>=0)f.splice(i,1);else f.push({w:w,t:t});LS.set('cbd_fav',f);render()}
function addRecent(w){var r=LS.get('cbd_recent',[]).filter(function(x){return x!==w});r.unshift(w);LS.set('cbd_recent',r.slice(0,10));showRecent()}
function showRecent(){var r=LS.get('cbd_recent',[]);$('recent').innerHTML=r.length?'Recent: '+r.map(function(w){return '<span data-w="'+esc(w)+'">'+esc(w)+'</span>'}).join(''):''}
function btns(w,t){return '<button class="sm" data-speak="'+esc(w)+'">🔊 Speak</button><button class="sm" data-fav="'+esc(w)+'" data-ft="'+t+'">'+(isFav(w,t)?'★ Saved':'☆ Save')+'</button>'}
function localCard(e,t){return '<div class="card"><h2>'+esc(e.w)+btns(e.w,t)+'</h2>'+(e.c?'<span class="tag">'+esc(e.c)+'</span>':'')+'<p>'+esc(e.d)+'</p>'+(e.e?'<p class="ex">“'+esc(e.e)+'”</p>':'')+'</div>'}
var last=null;
function lookup(w){w=(w||'').trim();if(!w)return;$('ac').innerHTML='';addRecent(w);
 if(tab==='slang'||tab==='music'){var L=list(),lw=w.toLowerCase();var r=L.filter(function(e){return e.w.toLowerCase().indexOf(lw)>=0||e.d.toLowerCase().indexOf(lw)>=0});last={type:'local',r:r};render();return}
 if(tab==='fav'){tab='gen';setTabs()}
 $('out').innerHTML='<div class="msg">Looking up “'+esc(w)+'”…</div>';
 if(!navigator.onLine){$('out').innerHTML='<div class="msg">☕ You look to be offline. The English dictionary needs internet, but Aussie Slang and Music Terms work offline.</div>';return}
 fetch('S1-L3ffbd1'+encodeURIComponent(w)).then(function(res){if(res.status===404)throw 'nf';if(!res.ok)throw 'err';return res.json()}).then(function(d){last={type:'api',d:d};render()}).catch(function(e){$('out').innerHTML='<div class="msg">'+(e==='nf'?'☕ Sorry, no definition found for “'+esc(w)+'”. Check the spelling, or try Aussie Slang.':'☕ Couldn\'t reach the dictionary right now. Check your connection and try again. Aussie Slang and Music Terms still work offline.')+'</div>'})}
function renderApi(d){return d.map(function(en){var ph=(en.phonetics||[]).find(function(p){return p.audio})||{};var txt=en.phonetic||((en.phonetics||[]).find(function(p){return p.text})||{}).text||'';
 var h='<div class="card"><h2>'+esc(en.word)+btns(en.word,'gen')+'</h2>'+(txt?'<div>'+esc(txt)+'</div>':'')+(ph.audio?'<audio controls preload="none" src="'+esc(ph.audio)+'"></audio>':'');
 (en.meanings||[]).forEach(function(m){h+='<p class="pos">'+esc(m.partOfSpeech)+'</p><ol>';m.definitions.slice(0,5).forEach(function(df){h+='<li>'+esc(df.definition)+(df.example?'<div class="ex">“'+esc(df.example)+'”</div>':'')+'</li>'});h+='</ol>';var syn=(m.synonyms||[]).slice(0,8);if(syn.length)h+='<p><b>Synonyms:</b> '+syn.map(esc).join(', ')+'</p>'});return h+'</div>'}).join('')}
function render(){var o=$('out');
 if(tab==='fav'){var f=favs();o.innerHTML=f.length?f.map(function(x){var src=x.t==='slang'?SLANG:x.t==='music'?MUSIC:null;var e=src&&src.find(function(s){return s.w===x.w});return e?localCard(e,x.t):'<div class="card"><h2>'+esc(x.w)+btns(x.w,'gen')+'</h2><button class="sm" data-look="'+esc(x.w)+'">Look up</button></div>'}).join(''):'<div class="msg">No favourites yet. Tap ☆ Save on any word.</div>';return}
 if(!last){if(tab!=='gen')o.innerHTML='<p>'+list().length+' entries. Browse below or search above.</p>'+list().map(function(e){return localCard(e,tab)}).join('');else o.innerHTML='<div class="msg">Type any English word above to see its meaning, pronunciation, examples and synonyms.</div>';return}
 if(last.type==='api')o.innerHTML=renderApi(last.d);else o.innerHTML=last.r.length?last.r.map(function(e){return localCard(e,tab)}).join(''):'<div class="msg">No matches in this section.</div>'}
function wotd(){var all=SLANG.map(function(e){return [e,'slang']}).concat(MUSIC.map(function(e){return [e,'music']}));var day=Math.floor(Date.now()/864e5);var p=all[day%all.length];$('wotd').innerHTML='<b>☕ Word of the Day</b> <span class="tag">'+(p[1]==='slang'?'Aussie Slang':'Music')+'</span><h2>'+esc(p[0].w)+'</h2><p>'+esc(p[0].d)+'</p>'+(p[0].e?'<p class="ex">“'+esc(p[0].e)+'”</p>':'')+'<button class="sm" data-speak="'+esc(p[0].w)+'">🔊 Speak</button>'}
function setTabs(){[].forEach.call(document.querySelectorAll('#tabs button'),function(b){b.classList.toggle('on',b.dataset.t===tab)});$('q').placeholder=tab==='gen'?'Search any English word…':tab==='slang'?'Search Aussie slang…':tab==='music'?'Search music terms…':'Search any English word…'}
document.addEventListener('click',function(ev){var t=ev.target;
 if(t.dataset.t){tab=t.dataset.t;last=null;setTabs();render();$('ac').innerHTML=''}
 else if(t.dataset.speak)speak(t.dataset.speak);
 else if(t.dataset.fav)toggleFav(t.dataset.fav,t.dataset.ft);
 else if(t.dataset.look){tab='gen';setTabs();lookup(t.dataset.look)}
 else if(t.dataset.w&&t.closest('#recent')){$('q').value=t.dataset.w;lookup(t.dataset.w)}
 else if(t.dataset.ac){$('q').value=t.dataset.ac;lookup(t.dataset.ac)}
 else if(t.id==='go')lookup($('q').value);
 else if(!t.closest('.searchwrap'))$('ac').innerHTML=''});
$('q').addEventListener('keydown',function(e){if(e.key==='Enter')lookup(this.value)});
$('q').addEventListener('input',function(){var v=this.value.toLowerCase().trim();if(!v){$('ac').innerHTML='';return}
 var pool=tab==='slang'?SLANG:tab==='music'?MUSIC:SLANG.concat(MUSIC);var words=LS.get('cbd_recent',[]).map(function(w){return{w:w}}).concat(pool);var seen={};
 var m=words.filter(function(e){var k=e.w.toLowerCase();if(seen[k]||k.indexOf(v)!==0)return false;return seen[k]=1}).slice(0,8);
 $('ac').innerHTML=m.map(function(e){return '<li data-ac="'+esc(e.w)+'">'+esc(e.w)+'</li>'}).join('')});
wotd();showRecent();setTabs();render();
})();
