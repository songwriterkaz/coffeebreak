'use strict';
/* Coffeebreak WiFi Phone Social: opens and shares to other apps. Not affiliated with any of them. */
(function(){
const $=s=>document.querySelector(s),E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),U=encodeURIComponent;
const clean=h=>String(h||'').trim().replace(/^@/,'');
const digits=h=>String(h||'').replace(/[^\d]/g,'');
// k:key, n:name, l:letters, c:colour, web:open url, app:app scheme, prof:(h)=>profile/message url, ph:handle placeholder, sh:(t,u)=>share url
const A=[
{k:'telegram',n:'Telegram',l:'Tg',c:'#2a8bc4',web:'https://web.telegram.org/',app:'tg://',prof:h=>/^\+?\d{6,}$/.test(h)?'https://t.me/+'+digits(h):'https://t.me/'+U(clean(h)),ph:'username or +61 number',sh:(t,u)=>'https://t.me/share/url?url='+U(u||t)+(u?'&text='+U(t):'')},
{k:'whatsapp',n:'WhatsApp',l:'Wa',c:'#1f9e55',web:'https://web.whatsapp.com/',app:'whatsapp://',prof:h=>'https://wa.me/'+digits(h),ph:'number with country code, 61412345678',sh:(t,u)=>'https://wa.me/?text='+U((t+' '+(u||'')).trim())},
{k:'messenger',n:'Messenger',l:'Ms',c:'#6a4cd6',web:'https://www.messenger.com/',app:'fb-messenger://',prof:h=>'https://m.me/'+U(clean(h)),ph:'Facebook username'},
{k:'facebook',n:'Facebook',l:'Fb',c:'#3b5a9a',web:'https://www.facebook.com/',app:'fb://',prof:h=>'https://www.facebook.com/'+U(clean(h)),ph:'username',sh:(t,u)=>u?'https://www.facebook.com/sharer/sharer.php?u='+U(u):''},
{k:'instagram',n:'Instagram',l:'Ig',c:'#c1356b',web:'https://www.instagram.com/',app:'instagram://',prof:h=>'https://www.instagram.com/'+U(clean(h))+'/',ph:'username'},
{k:'tiktok',n:'TikTok',l:'Tt',c:'#222',web:'https://www.tiktok.com/',app:'snssdk1233://',prof:h=>'https://www.tiktok.com/@'+U(clean(h)),ph:'username'},
{k:'youtube',n:'YouTube',l:'Yt',c:'#c4302b',web:'https://www.youtube.com/',app:'youtube://',prof:h=>/^https?:/.test(h)?h:'https://www.youtube.com/@'+U(clean(h)),ph:'channel handle'},
{k:'x',n:'X',l:'X',c:'#111',web:'https://x.com/',app:'twitter://',prof:h=>'https://x.com/'+U(clean(h)),ph:'username',sh:(t,u)=>'https://x.com/intent/post?text='+U(t)+(u?'&url='+U(u):'')},
{k:'threads',n:'Threads',l:'Th',c:'#333',web:'https://www.threads.net/',app:'barcelona://',prof:h=>'https://www.threads.net/@'+U(clean(h)),ph:'username',sh:(t,u)=>'https://www.threads.net/intent/post?text='+U((t+' '+(u||'')).trim())},
{k:'snapchat',n:'Snapchat',l:'Sc',c:'#d4b800',web:'https://web.snapchat.com/',app:'snapchat://',prof:h=>'https://www.snapchat.com/add/'+U(clean(h)),ph:'username'},
{k:'discord',n:'Discord',l:'Dc',c:'#5865c8',web:'https://discord.com/app',app:'discord://',prof:h=>/^https?:/.test(h)?h:'https://discord.com/app',ph:'username or invite link'},
{k:'signal',n:'Signal',l:'Sg',c:'#3a76f0',web:'https://signal.org/',app:'sgnl://',prof:h=>'https://signal.me/#p/+'+digits(h),ph:'number with country code'},
{k:'viber',n:'Viber',l:'Vb',c:'#7360f2',web:'https://www.viber.com/',app:'viber://',prof:h=>'viber://chat?number=%2B'+digits(h),ph:'number with country code',sh:(t,u)=>'viber://forward?text='+U((t+' '+(u||'')).trim())},
{k:'gchat',n:'Google Chat',l:'GC',c:'#188038',web:'https://chat.google.com/',app:'',prof:h=>'https://chat.google.com/',ph:'Google email'},
{k:'gmail',n:'Gmail',l:'Gm',c:'#b23121',web:'https://mail.google.com/',app:'googlegmail://',prof:h=>'mailto:'+String(h).trim(),ph:'email address',sh:(t,u)=>'mailto:?subject='+U('From my Coffeebreak phone')+'&body='+U((t+' '+(u||'')).trim())},
{k:'meet',n:'Google Meet',l:'GM',c:'#00796b',web:'https://meet.google.com/',app:'',prof:h=>/^https?:/.test(h)?h:'https://meet.google.com/',ph:'meeting link'},
{k:'zoom',n:'Zoom',l:'Zm',c:'#2d8cff',web:'https://app.zoom.us/wc',app:'zoomus://',prof:h=>/^https?:/.test(h)?h:'https://zoom.us/join',ph:'meeting link'},
{k:'teams',n:'Teams',l:'Tm',c:'#5059c9',web:'https://teams.microsoft.com/',app:'msteams://',prof:h=>'https://teams.microsoft.com/l/chat/0/0?users='+U(String(h).trim()),ph:'work email'},
{k:'skype',n:'Skype (now Teams)',l:'Sk',c:'#00aff0',web:'https://teams.live.com/',app:'',prof:h=>'https://teams.live.com/',ph:'Teams email'},
{k:'linkedin',n:'LinkedIn',l:'in',c:'#0a66c2',web:'https://www.linkedin.com/',app:'linkedin://',prof:h=>'https://www.linkedin.com/in/'+U(clean(h)),ph:'profile name',sh:(t,u)=>u?'https://www.linkedin.com/sharing/share-offsite/?url='+U(u):''},
{k:'pinterest',n:'Pinterest',l:'Pi',c:'#bd081c',web:'https://www.pinterest.com/',app:'pinterest://',prof:h=>'https://www.pinterest.com/'+U(clean(h))+'/',ph:'username',sh:(t,u)=>u?'https://www.pinterest.com/pin/create/button/?url='+U(u)+'&description='+U(t):''},
{k:'reddit',n:'Reddit',l:'Rd',c:'#d84315',web:'https://www.reddit.com/',app:'reddit://',prof:h=>'https://www.reddit.com/user/'+U(clean(h).replace(/^u\//,'')),ph:'username',sh:(t,u)=>'https://www.reddit.com/submit?title='+U(t)+(u?'&url='+U(u):'')},
{k:'twitch',n:'Twitch',l:'Tw',c:'#7d4cd8',web:'https://www.twitch.tv/',app:'twitch://',prof:h=>'https://www.twitch.tv/'+U(clean(h)),ph:'channel'},
{k:'spotify',n:'Spotify',l:'Sp',c:'#1a9e4b',web:'https://open.spotify.com/',app:'spotify://',prof:h=>/^https?:/.test(h)?h:'https://open.spotify.com/user/'+U(clean(h)),ph:'profile link or user id'},
{k:'bluesky',n:'Bluesky',l:'Bs',c:'#1185fe',web:'https://bsky.app/',app:'',prof:h=>'https://bsky.app/profile/'+U(clean(h)),ph:'handle.bsky.social',sh:(t,u)=>'https://bsky.app/intent/compose?text='+U((t+' '+(u||'')).trim())},
{k:'sms',n:'Text SMS',l:'SMS',c:'#6b4226',web:'',app:'sms:',prof:h=>'sms:'+String(h).replace(/[^\d+]/g,''),ph:'mobile number',sh:(t,u)=>'sms:?&body='+U((t+' '+(u||'')).trim())},
{k:'email',n:'Email',l:'@',c:'#8a5a3b',web:'',app:'mailto:',prof:h=>'mailto:'+String(h).trim(),ph:'email',sh:(t,u)=>'mailto:?body='+U((t+' '+(u||'')).trim())},
{k:'itch',n:'itch.io',l:'it',c:'#e0505a',web:'https://itch.io/',app:'',prof:h=>/^https?:/.test(h)?h:'https://'+U(clean(h))+'.itch.io/',ph:'creator name'}
];
const MINE={youtube:'https://www.youtube.com/@coffeebreakTVSERIES',tiktok:'https://www.tiktok.com/@kobcountrymusic',x:'https://x.com/kobcountrymusic',itch:'https://coffeebreaks.itch.io'};
const byK=k=>A.find(a=>a.k===k);
const LSg=(k,d)=>{try{return JSON.parse(localStorage.getItem('cb_'+k))??d}catch(e){return d}},LSs=(k,v)=>localStorage.setItem('cb_'+k,JSON.stringify(v));
const favs=()=>LSg('socialfavs',['whatsapp','telegram','messenger','facebook','instagram','tiktok','youtube','x','gmail','gchat','zoom','spotify']).filter(byK);
const ico=a=>`<span class="sic" style="background:${a.c}">${E(a.l)}</span>`;
const NOTE='<div class="snote"><b>How this works.</b> Coffeebreak Social opens other apps, or their websites, and shares to them. It cannot read, show or send messages from inside other apps, so their messages and notifications stay in those apps. The app must be installed on your phone, or you use its website and sign in there. Coffeebreak is not affiliated with, endorsed or sponsored by any of these companies, and their names belong to their owners. App icons here are simple letters, not their logos.</div>';
const st=document.createElement('style');st.textContent=`
#cbsoc{position:fixed;inset:0;max-width:480px;margin:auto;background:var(--cream,#fff6ef);z-index:31;overflow:auto;padding:14px;display:none}#cbsoc.show{display:block}
.sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:8px 0}.sgrid a,.sgrid button{display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;color:var(--brown,#3b2417);font-size:12px;font-weight:700;background:none;border:0;padding:4px 0;text-align:center}
.sic{width:56px;height:56px;border-radius:16px;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:19px;flex:none}
.snote{background:#fff;border:2px dashed #e8cdbd;border-radius:14px;padding:10px;font-size:12px;margin:10px 0}
.stabs{display:flex;gap:6px;margin:8px 0}.stabs button{flex:1;padding:10px 4px;border-radius:14px;border:0;background:#f3dccd;color:var(--brown,#3b2417);font-weight:700;font-size:14px}.stabs button.on{background:var(--hot,#d94f7a);color:#fff}
.srow{display:flex;align-items:center;gap:8px;background:#fff;border-radius:14px;padding:6px;margin:4px 0}.srow .sic{width:40px;height:40px;font-size:15px;border-radius:12px}.srow b{flex:1}.srow button{border:0;border-radius:10px;padding:8px 10px;background:#f3dccd;font-size:16px}
.sbtn{display:block;width:100%;padding:14px;border:0;border-radius:16px;background:var(--brown,#3b2417);color:#fff;font-size:18px;font-weight:700;margin:6px 0;text-align:center;text-decoration:none}
#cbsoc textarea,#cbsoc input{font-size:16px;padding:10px;border-radius:12px;border:2px solid #e8cdbd;width:100%;box-sizing:border-box}
#cbsocfab{position:fixed;right:12px;bottom:84px;z-index:20;border:0;border-radius:30px;padding:12px 16px;background:var(--hot,#d94f7a);color:#fff;font-weight:800;font-size:16px;box-shadow:0 3px 10px #0003}
.cbsocp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.cbsocp a{display:flex;align-items:center;gap:6px;background:#fff;border-radius:14px;padding:8px;text-decoration:none;color:var(--brown,#3b2417);font-size:13px;font-weight:700}.cbsocp .sic{width:34px;height:34px;font-size:13px;border-radius:10px}`;
document.head.appendChild(st);
const pv=document.createElement('div');pv.id='cbsoc';document.body.appendChild(pv);
let tab='apps',edit=false,shareData={text:'',url:'',file:null};
const head=t=>`<div style="display:flex;align-items:center;gap:8px"><button class="btn" id="sback">‹ Back</button><img src="logo.png" alt="Coffeebreak" style="height:32px"><b style="flex:1;font-size:18px">${t}</b></div>
<div class="stabs"><button data-st="apps" class="${tab==='apps'?'on':''}">Apps</button><button data-st="share" class="${tab==='share'?'on':''}">Share</button><button data-st="mine" class="${tab==='mine'?'on':''}">My socials</button><button data-st="notes" class="${tab==='notes'?'on':''}">Alerts</button></div>`;
function draw(){
 let h=head('Social');
 if(tab==='apps'){const F=favs();
  h+=`<p style="font-size:14px;margin:4px">Tap an app to open it. ${edit?'Use the arrows to move, ✕ to remove, ＋ to add.':''}</p>`;
  if(!edit)h+='<div class="sgrid">'+F.map(k=>{const a=byK(k);return`<a href="${E(a.web||a.app)}" target="_blank" rel="noopener" data-k="${a.k}">${ico(a)}${E(a.n)}</a>`}).join('')+'</div>';
  else h+=F.map((k,i)=>{const a=byK(k);return`<div class="srow">${ico(a)}<b>${E(a.n)}</b><button data-up="${i}">▲</button><button data-dn="${i}">▼</button><button data-rm="${i}">✕</button></div>`}).join('');
  h+=`<button class="sbtn" id="sedit">${edit?'Done':'✏️ Edit and reorder favourites'}</button><h4 style="margin:12px 4px 4px">All apps</h4><div class="sgrid">`+A.filter(a=>!F.includes(a.k)).map(a=>edit?`<button data-add="${a.k}">${ico(a)}＋ ${E(a.n)}</button>`:`<a href="${E(a.web||a.app)}" target="_blank" rel="noopener" data-k="${a.k}">${ico(a)}${E(a.n)}</a>`).join('')+'</div>';
  h+='<p style="font-size:12px">Tip: if an app is installed, its link usually opens the app. If not, the website opens instead.</p>';
 }else if(tab==='share'){
  h+=`<p style="font-size:14px">Share words, a link, a photo or a song to any app.</p><textarea id="stx" rows="3" placeholder="Type a message">${E(shareData.text)}</textarea><input id="surl" placeholder="Link (optional)" value="${E(shareData.url)}" style="margin-top:6px">
  <button class="sbtn" id="spick" style="background:#8a5a3b">📎 Add a photo or song</button><div id="sfile" style="font-size:13px">${shareData.file?'Attached: '+E(shareData.file.name):''}</div>
  <button class="sbtn" id="snative" style="background:var(--hot,#d94f7a)">📤 Share to any app</button><p style="font-size:12px">This opens your phone's own share list, so you can pick any installed app. Photos and songs share this way.</p><h4 style="margin:8px 4px">Or share straight to</h4><div class="sgrid">`+
  A.filter(a=>a.sh).map(a=>`<button data-sh="${a.k}">${ico(a)}${E(a.n)}</button>`).join('')+'</div><p style="font-size:12px">These send words and links only. For a photo or song, use Share to any app.</p>';
 }else if(tab==='mine'){const m=LSg('mysocials',MINE);
  h+=`<div style="background:#fff;border-radius:18px;padding:12px;text-align:center"><img src="logo.png" alt="Coffeebreak" style="height:44px"><h3 style="margin:4px">Coffeebreak socials</h3><div class="cbsocp" style="text-align:left">`+Object.keys(m).filter(k=>m[k]&&byK(k)).map(k=>`<a href="${E(m[k])}" target="_blank" rel="noopener">${ico(byK(k))}${E(byK(k).n)}</a>`).join('')+`</div><div id="sqr" style="display:flex;justify-content:center;margin:8px"></div><p style="font-size:12px">Scan to see all my links</p></div>
  <button class="sbtn" id="sshm">📤 Share my socials</button><details><summary style="font-size:14px;padding:6px">✏️ Edit my links</summary>`+A.filter(a=>/^https?:/.test(a.web)).map(a=>`<p style="margin:4px 0;font-size:13px">${E(a.n)}<input data-my="${a.k}" value="${E(m[a.k]||'')}" placeholder="https://"></p>`).join('')+`<button class="sbtn" id="smysave">Save my links</button></details>`;
 }else{
  h+=`<h4>Alerts from other apps</h4><p style="font-size:14px">Messages and alerts from WhatsApp, TikTok, YouTube and the rest come from those apps, not from Coffeebreak. To see them all in one place, use your phone's own notification panel.</p><ul style="font-size:14px"><li>Android: Settings, Notifications, then turn on each app you want.</li><li>iPhone: Settings, Notifications, then pick each app.</li></ul><p style="font-size:14px">Coffeebreak calls, messages and walkie talkie still show their own alerts here.</p><button class="sbtn" id="salerts">Turn on Coffeebreak alerts</button>`;
 }
 h+=NOTE+'<p style="text-align:center;font-size:12px"><a href="#" id="sdisc">Disclaimer and rights</a></p>';
 pv.innerHTML=h;wire()}
function wire(){
 $('#sback').onclick=()=>pv.classList.remove('show');
 pv.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{tab=b.dataset.st;edit=false;draw()});
 $('#sdisc').onclick=e=>{e.preventDefault();pv.classList.remove('show');const t=document.querySelector('nav button[data-t=me]');if(t)t.click();const d=$('#cbdiscfull');if(d){d.style.display='block';d.scrollIntoView()}};
 const se=$('#sedit');if(se)se.onclick=()=>{edit=!edit;draw()};
 const mv=(i,d)=>{const F=favs(),j=i+d;if(j<0||j>=F.length)return;[F[i],F[j]]=[F[j],F[i]];LSs('socialfavs',F);draw()};
 pv.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>mv(+b.dataset.up,-1));pv.querySelectorAll('[data-dn]').forEach(b=>b.onclick=()=>mv(+b.dataset.dn,1));
 pv.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const F=favs();F.splice(+b.dataset.rm,1);LSs('socialfavs',F);draw()});
 pv.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const F=favs();F.push(b.dataset.add);LSs('socialfavs',F);draw()});
 const tx=$('#stx');if(tx){tx.oninput=()=>shareData.text=tx.value;$('#surl').oninput=e=>shareData.url=e.target.value.trim();
  $('#spick').onclick=()=>{const f=document.createElement('input');f.type='file';f.accept='image/*,audio/*,video/*';f.onchange=()=>{shareData.file=f.files[0]||null;draw()};f.click()};
  $('#snative').onclick=()=>nativeShare(shareData.text,shareData.url,shareData.file);
  pv.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{const a=byK(b.dataset.sh),u=a.sh(shareData.text||'From my Coffeebreak phone',shareData.url);if(!u)return alert(a.n+' needs a link to share. Add one in the Link box.');window.open(u,'_blank','noopener')})}
 const q=$('#sqr');if(q&&window.QRCode){const m=LSg('mysocials',MINE);new QRCode(q,{text:Object.keys(m).filter(k=>m[k]).map(k=>m[k]).join('\n'),width:190,height:190,colorDark:'#3b2417'})}
 const sm=$('#sshm');if(sm)sm.onclick=()=>{const m=LSg('mysocials',MINE);nativeShare('Find Coffeebreak here:\n'+Object.keys(m).filter(k=>m[k]).map(k=>byK(k).n+': '+m[k]).join('\n'),'')};
 const sv=$('#smysave');if(sv)sv.onclick=()=>{const m={};pv.querySelectorAll('[data-my]').forEach(i=>{const v=i.value.trim();if(v&&/^https?:\/\//.test(v))m[i.dataset.my]=v});LSs('mysocials',m);draw()};
 const al=$('#salerts');if(al)al.onclick=()=>{if('Notification'in window)Notification.requestPermission().then(p=>alert(p==='granted'?'Coffeebreak alerts are on':'Alerts are off. You can change this in your phone settings.'));else alert('This browser does not support alerts')};
}
async function nativeShare(text,url,file){const d={title:'Coffeebreak',text:text||''};if(url)d.url=url;
 try{if(file&&navigator.canShare&&navigator.canShare({files:[file]}))d.files=[file];if(navigator.share){await navigator.share(d);return}}catch(e){if(e&&e.name==='AbortError')return}
 if(file){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;a.click();alert('This browser cannot share files directly, so the file was saved. Attach it inside the app you want.');return}
 try{await navigator.clipboard.writeText(((text||'')+' '+(url||'')).trim());alert('Copied. Open any app and paste it.')}catch(e){prompt('Copy this:',((text||'')+' '+(url||'')).trim())}}
function open(t){tab=t||'apps';edit=false;draw();pv.classList.add('show');pv.scrollTop=0}
// entry points
const fab=document.createElement('button');fab.id='cbsocfab';fab.textContent='🌐 Social';fab.onclick=()=>open('apps');document.body.appendChild(fab);
const tp=$('#t-phone');if(tp){const c=document.createElement('button');c.className='sbtn';c.style.background='var(--hot,#d94f7a)';c.textContent='🌐 Social apps: Telegram, TikTok, YouTube and more';c.onclick=()=>open('apps');tp.insertBefore(c,tp.firstChild)}
// contact profile helpers
window.cbSocial={apps:A,open,share:nativeShare,
 profile(c){const s=c.social||{};const ks=Object.keys(s).filter(k=>s[k]&&byK(k));if(!ks.length)return '<div class="inf"><span>Social apps</span>No social apps yet. Tap Edit contact to add them.</div>';
  return '<div class="inf"><span>Message on their apps</span><div class="cbsocp">'+ks.map(k=>{const a=byK(k);return`<a href="${E(a.prof(s[k]))}" target="_blank" rel="noopener">${ico(a)}${E(a.n)}</a>`}).join('')+'</div><span>Opens the app or its website. Needs that app installed or signed in on the web.</span></div>'},
 fields(c){const s=c.social||{};return '<details'+(Object.keys(s).length?' open':'')+'><summary style="font-size:16px;font-weight:700;padding:8px 0">🌐 Social apps</summary>'+A.filter(a=>!['sms','email','itch'].includes(a.k)).map(a=>`<p style="margin:4px 0;display:flex;align-items:center;gap:6px">${ico(a).replace('style="','style="width:34px;height:34px;font-size:12px;border-radius:10px;')}<input data-soc="${a.k}" value="${E(s[a.k]||'')}" placeholder="${E(a.n+': '+a.ph)}"></p>`).join('')+'</details>'},
 read(){const o={};document.querySelectorAll('#cbp [data-soc]').forEach(i=>{const v=i.value.trim();if(v)o[i.dataset.soc]=v});return o}};
})();
