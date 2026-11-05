/* Coffeebreak Studio Espresso - Radio Pitch. Builds pitch emails and one-sheets. Never sends anything; the user sends it. Station links verified 21 Oct 2026. */
(function(){
const ST=[
 {id:'unearthed',n:'triple j Unearthed',r:'National, AU',t:'Indie, all genres',u:'https://www.abc.net.au/triplejunearthed',note:'Free artist profile and track upload, heard by triple j, Double J and ABC programmers'},
 {id:'amrap',n:'Amrap AirIt (community radio)',r:'National, AU',t:'Community radio, all genres',u:'https://amrap.org.au/airit',note:'Free for Australian musicians, sends your music to community radio stations nationwide'},
 {id:'abccountry',n:'ABC Country',r:'National, AU',t:'Country',u:'https://www.abc.net.au/listen/country/contact-us',note:'Digital submission via the form on the contact page, WAV or FLAC, cover art and a media release'},
 {id:'2nur',n:'2NURFM 103.7 Newcastle',r:'Newcastle, NSW',t:'Community radio',u:'https://www.2nurfm.com.au/contact/',note:'Use the contact form and ask for the music department'},
 {id:'fbi',n:'FBi Radio 94.5 Sydney',r:'Sydney, NSW',t:'Independent, local music',e:'music@fbiradio.com',u:'https://www.fbi.radio/contact',note:'Music submissions by email'},
 {id:'rrr',n:'Triple R 102.7 Melbourne',r:'Melbourne, VIC',t:'Independent, all genres',e:'music@rrr.org.au',u:'https://www.rrr.org.au/get-involved/submit-music',note:'Email streaming and download links plus a bio'},
 {id:'4zzz',n:'4ZZZ 102.1 Brisbane',r:'Brisbane, QLD',t:'Community, independent',u:'https://4zzz.org.au/music-submissions',note:'Online music submission form'},
 {id:'kexp',n:'KEXP 90.3 Seattle',r:'International, USA',t:'Indie, eclectic',e:'md@kexp.org',u:'https://www.kexp.org/contact/',note:'Email the Music Department for rotation consideration'}
];
const DEMO=!!window.CB_DEMO, MAXD=3;
const q=s=>document.querySelector(s), esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const F=['artist','song','genre','mood','bio','spotify','youtube','itch'];
function val(){const o={};F.forEach(k=>o[k]=(q('#rp_'+k).value||'').trim().replace(/!/g,'.'));return o}
function picked(){return ST.filter(s=>{const c=q('#rp_s_'+s.id);return c&&c.checked})}
function links(v){return [['Spotify',v.spotify],['YouTube',v.youtube],['itch',v.itch]].filter(x=>x[1])}
function pitch(v,s){
 const subj=`Music submission: ${v.artist||'Artist'} - ${v.song||'New single'}${v.genre?' ('+v.genre+')':''}`;
 const L=links(v).map(x=>`${x[0]}: ${x[1]}`).join('\n');
 const body=`Hello ${s?s.n+' music team':'music team'},

I would love for you to consider "${v.song||'my new single'}" by ${v.artist||'me'} for airplay${s?' on '+s.n:''}.

Genre: ${v.genre||'-'}
Mood: ${v.mood||'-'}

About the artist
${v.bio||'-'}

Listen
${L||'-'}

A broadcast quality WAV, cover art and a one-sheet are available on request. Thank you for your time and for supporting independent music.

Kind regards,
${v.artist||''}`;
 return {subj,body};
}
function render(){
 const v=val(), s=picked(), p=pitch(v,s[0]);
 q('#rp_subj').value=p.subj; q('#rp_body').value=p.body;
 q('#rp_list').innerHTML=s.map(x=>`<div class="panel row" style="margin:4px 0"><b style="flex:1">${esc(x.n)}</b><span class="hint">${esc(x.note)}</span>
 ${x.e?`<button data-m="${x.id}">Open in email</button>`:''}<button data-u="${x.id}">Open submission page</button></div>`).join('')||'<p class="hint">Pick at least one station.</p>';
 q('#rp_list').querySelectorAll('button[data-m]').forEach(b=>b.onclick=()=>{const st=ST.find(z=>z.id===b.dataset.m),pp=pitch(val(),st);location.href=`mailto:${st.e}?subject=${encodeURIComponent(pp.subj)}&body=${encodeURIComponent(pp.body)}`});
 q('#rp_list').querySelectorAll('button[data-u]').forEach(b=>b.onclick=()=>window.open(ST.find(z=>z.id===b.dataset.u).u,'_blank','noopener'));
}
function sheet(){
 const v=val(), L=links(v);
 return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(v.artist)} - ${esc(v.song)} one-sheet</title><style>
body{font-family:system-ui,Segoe UI,Roboto,sans-serif;color:#5a2840;max-width:760px;margin:24px auto;padding:0 20px;position:relative}
header{display:flex;align-items:center;gap:14px;border-bottom:4px solid #e75b9a;padding-bottom:10px}header img{height:70px;border-radius:12px}
h1{margin:0}h2{color:#e75b9a;margin:18px 0 6px}.meta{display:flex;gap:10px;flex-wrap:wrap}.meta span{background:#ffd6e8;border-radius:10px;padding:4px 10px}
footer{margin-top:30px;font-size:.8rem;opacity:.7;text-align:center}a{color:#b0306a}
${DEMO?'.wm{position:fixed;top:40%;left:0;right:0;text-align:center;font-size:56px;font-weight:800;color:#e75b9a33;transform:rotate(-25deg);pointer-events:none}':''}
@media print{button{display:none}}</style></head><body>${DEMO?'<div class="wm">Coffeebreak Studio Espresso demo</div>':''}
<header><img src="${LOGO}" alt="Coffeebreak"><div><h1>${esc(v.artist||'Artist')}</h1><div style="font-size:1.3rem">${esc(v.song||'New single')}</div></div></header>
<div class="meta" style="margin-top:12px">${v.genre?`<span>Genre: ${esc(v.genre)}</span>`:''}${v.mood?`<span>Mood: ${esc(v.mood)}</span>`:''}</div>
<h2>About</h2><p>${esc(v.bio||'').replace(/\n/g,'<br>')}</p>
<h2>Listen</h2><ul>${L.map(x=>`<li>${x[0]}: <a href="${esc(x[1])}">${esc(x[1])}</a></li>`).join('')}</ul>
<button onclick="print()">Print or save as PDF</button>
<footer>One-sheet made with Coffeebreak Studio Espresso</footer></body></html>`;
}
let LOGO='logo.jpg';
function loadLogo(){fetch('logo.jpg').then(r=>r.blob()).then(b=>{const fr=new FileReader();fr.onload=()=>LOGO=fr.result;fr.readAsDataURL(b)}).catch(()=>{})}
function toastM(m){const t=q('#toast');if(!t)return;t.textContent=m;t.classList.remove('hidden');clearTimeout(toastM.h);toastM.h=setTimeout(()=>t.classList.add('hidden'),2200)}
function build(){
 const nav=q('#tabs'), main=q('#main'); if(!nav||!main||q('#t-radio'))return;
 const b=document.createElement('button'); b.dataset.t='radio'; b.textContent='Radio Pitch'; b.onclick=()=>showTab('radio'); nav.appendChild(b);
 const sec=document.createElement('section'); sec.className='tab'; sec.id='t-radio';
 sec.innerHTML=`<div class="panel"><div class="row"><img src="logo.jpg" alt="Coffeebreak" style="height:40px;border-radius:8px"><h3 style="margin:0">Radio Pitch</h3><span class="hint">Write a professional pitch and one-sheet, then send it yourself. Nothing is sent automatically.</span></div>
 ${DEMO?`<div class="banner" style="border-radius:10px">Demo: pick up to ${MAXD} stations, one-sheets carry a watermark. The full version removes both limits.</div>`:''}
 <div class="grid">${[['artist','Artist name'],['song','Song title'],['genre','Genre'],['mood','Mood'],['spotify','Spotify link'],['youtube','YouTube link'],['itch','itch link']].map(([k,n])=>`<label>${n}<input type="text" id="rp_${k}"></label>`).join('')}</div>
 <label class="hint">Short bio</label><textarea id="rp_bio" style="min-height:80px"></textarea></div>
 <div class="panel"><h3>Stations</h3><div class="grid">${ST.map(s=>`<label style="flex-direction:row;gap:6px;align-items:flex-start"><input type="checkbox" id="rp_s_${s.id}"><span><b>${esc(s.n)}</b><br>${esc(s.r)}, ${esc(s.t)}</span></label>`).join('')}</div>
 <p class="hint">All routes are free. Links checked 21 Oct 2026. Read each station's own guidelines before you send.</p></div>
 <div class="panel"><h3>Your pitch</h3><label class="hint">Subject</label><input type="text" id="rp_subj" style="width:100%">
 <label class="hint">Email</label><textarea id="rp_body"></textarea>
 <div class="row"><button id="rp_copy">Copy pitch</button><button id="rp_sheet">Download one-sheet</button><button id="rp_print">Print one-sheet or save as PDF</button></div>
 <div id="rp_list"></div></div>`;
 main.appendChild(sec);
 sec.querySelectorAll('input[type=text]:not(#rp_subj),textarea#rp_bio').forEach(i=>i.oninput=render);
 ST.forEach(s=>q('#rp_s_'+s.id).onchange=e=>{ if(DEMO&&picked().length>MAXD){e.target.checked=false;toastM(`The demo allows ${MAXD} stations.`)} render(); });
 q('#rp_copy').onclick=()=>{const t=q('#rp_subj').value+'\n\n'+q('#rp_body').value;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toastM('Pitch copied.')).catch(()=>{q('#rp_body').select();document.execCommand('copy');toastM('Pitch copied.')})};
 q('#rp_sheet').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([sheet()],{type:'text/html'}));a.download=((val().artist||'artist')+'-'+(val().song||'song')).replace(/[^\w-]+/g,'_')+'-one-sheet.html';a.click()};
 q('#rp_print').onclick=()=>{const w=window.open('','_blank');if(w){w.document.write(sheet());w.document.close();setTimeout(()=>w.print(),400)}};
 loadLogo(); render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
window.CB_RADIO={ST,build};
})();
