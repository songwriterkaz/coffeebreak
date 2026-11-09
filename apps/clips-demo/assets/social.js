// ===== Coffeebreak Social (real live network on Supabase: auth, feed, uploads, likes, comments, follows, DMs, chat, Go Live, badges, reports, prizes) =====
(function(){
if(!window.supabase||!window.SB_URL||!/^eyJ|^sb_publishable_/.test(window.SB_KEY||'')){(function addBtn(){const t=document.getElementById('cbTop');if(!t)return setTimeout(addBtn,400);if(document.getElementById('sbOpen'))return;const b=document.createElement('button');b.id='sbOpen';b.textContent='🌐 Social';b.onclick=()=>alert('Coffeebreak Social is coming very soon ❤️');t.appendChild(b)})();return}
const sb=window.supabase.createClient(window.SB_URL,window.SB_KEY,{auth:{persistSession:!window.CB_NO_STORAGE,detectSessionInUrl:true}});window.CB_SB=sb;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BAD=['fuck','shit','cunt','bitch','slut','whore','nigger','faggot','retard','kys','kill yourself'];
const filt=t=>{let s=String(t);BAD.forEach(w=>{s=s.replace(new RegExp(w.replace(/ /g,'\\s*'),'gi'),m=>'*'.repeat(m.length))});return s};
const ago=d=>{const s=(Date.now()-new Date(d))/1000;return s<60?'now':s<3600?(s/60|0)+'m':s<86400?(s/3600|0)+'h':(s/86400|0)+'d'};
const PRAYER='Dear Lord, wrap this person in Your peace. Thank You for their courage in speaking up. Bring healing, safety and kindness to everyone involved. Amen. 🙏';
const SAFE='If anyone is in danger call <b>000</b>. For crisis support call <b>Lifeline 13 11 14</b>.';
const RULES='<b>Official rules.</b> Promoter: Karen O\'Brien (Coffeebreak). Prizes are free to enter. No purchase necessary. Open to registered Coffeebreak users. Entries are posts made during the contest period; ranking is by likes ×10 plus views, and the promoter reviews the top entries and picks winners, whose decision is final. Fake accounts, bought likes/views, or content breaking the community rules are disqualified. Winners are notified in-app and must give a payout email within 14 days or a new winner may be chosen. Prizes (Amazon AU gift card or cash) are as stated, not transferable, and paid after approval. Void where prohibited. Not sponsored or endorsed by Amazon or PayID.';
let gen=0,me=null,prof=null,tab='foryou',blocked=new Set(),chatCh=null,liveCh=null,pcs={},localStream=null;
const css=document.createElement('style');css.textContent=`#sbO{position:fixed;inset:0;z-index:200;background:#12060c;color:#ffe9c7;font-family:Georgia,serif;display:none;flex-direction:column}
#sbO .tb{display:flex;gap:4px;flex-wrap:wrap;padding:6px;background:#2a160e;align-items:center}#sbO .tb button.sel{background:#e8a0b0;color:#1a0a10}
#sbB{flex:1;overflow:auto;padding:10px;max-width:760px;margin:0 auto;width:100%;box-sizing:border-box}
#sbO input,#sbO textarea,#sbO select{background:#2a1018;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:6px;font:15px Georgia;box-sizing:border-box}
.sbP{background:#24101a;border-radius:12px;padding:10px;margin:0 0 12px}.sbP video,.sbP img.m{max-width:100%;max-height:60vh;border-radius:10px;display:block;margin:6px 0}
.sbV{color:#4ad0e0}.sbS{font-size:13px;opacity:.8}.sbN{background:#3a1f12;padding:8px;border-radius:10px;margin:6px 0;font-size:13px}`;document.head.appendChild(css);
const O=document.createElement('div');O.id='sbO';O.innerHTML='<div class="tb"><b>🌐 Coffeebreak Social</b><span id="sbTabs"></span><span style="flex:1"></span><span id="sbWho" class="sbS"></span><button id="sbX">✖️</button></div><div id="sbB"></div>';document.body.appendChild(O);
const B=O.querySelector('#sbB'),$=s=>O.querySelector(s);
function open(){O.style.display='flex';render()}window.CB_SOCIAL_OPEN=open;
$('#sbX').onclick=()=>{O.style.display='none';stopLive()};
(function addBtn(){const t=document.getElementById('cbTop');if(!t)return setTimeout(addBtn,400);if(document.getElementById('sbOpen'))return;const b=document.createElement('button');b.id='sbOpen';b.textContent='🌐 Social';b.onclick=open;t.appendChild(b)})();
const vb=p=>p&&p.verified?' <span class="sbV" title="Verified">✔️</span>':'';
async function loadMe(){const {data}=await sb.auth.getUser();me=data&&data.user||null;prof=null;blocked=new Set();
 if(me){const r=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();prof=r.data;const b=await sb.from('blocks').select('blocked').eq('blocker',me.id);(b.data||[]).forEach(x=>blocked.add(x.blocked))}}
sb.auth.onAuthStateChange(()=>{loadMe().then(()=>{if(O.style.display==='flex')render()})});
function tabs(){const T=[['foryou','🏠 For You'],['following','👥 Following'],['post','＋ Post'],['chat','💬 Chat'],['dms','✉️ DMs'],['live','🔴 Live'],['prizes','🏆 Prizes'],['me','👤 Me']];if(prof&&prof.is_admin)T.push(['admin','🛡️ Admin']);
 $('#sbTabs').innerHTML=T.map(t=>`<button data-t="${t[0]}" class="${t[0]===tab?'sel':''}">${t[1]}</button>`).join(' ');$('#sbTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;render()});
 $('#sbWho').innerHTML=prof?'@'+esc(prof.handle)+vb(prof):me?esc(me.email):'Not signed in'}
async function render(){gen++;if(chatCh&&tab!=='chat'){sb.removeChannel(chatCh);chatCh=null}if(tab!=='live')stopLive();tabs();
 if(!me&&!['foryou','prizes'].includes(tab))return authView();if(me&&!prof&&tab!=='foryou'&&tab!=='prizes')return profileView(true);
 ({foryou:()=>feed(false),following:()=>feed(true),post:postView,chat:chatView,dms:dmView,live:liveView,prizes:prizesView,me:()=>profileView(false),admin:adminView})[tab]()}
// ---------- auth ----------
function authView(){B.innerHTML=`<h2>Sign in to Coffeebreak</h2><p><input id="ae" type="email" placeholder="Email" style="width:100%"></p><p><input id="ap" type="password" placeholder="Password (6+ characters)" style="width:100%"></p>
<p><button id="ali">Log in</button> <button id="asu">Sign up</button> <button id="aml">✉️ Email me a magic link</button></p><p id="am" class="sbS"></p><p class="sbS">By joining you agree to be kind. No bullying, hate, nudity or illegal content.</p>`;
 const m=t=>$('#am').innerHTML=esc(t),e=()=>$('#ae').value.trim(),p=()=>$('#ap').value;
 $('#ali').onclick=async()=>{m('Logging in…');const r=await sb.auth.signInWithPassword({email:e(),password:p()});m(r.error?r.error.message:'Welcome back ❤️')};
 $('#asu').onclick=async()=>{m('Creating account…');const r=await sb.auth.signUp({email:e(),password:p(),options:{emailRedirectTo:location.href.split('#')[0]}});m(r.error?r.error.message:(r.data.session?'Account created ❤️':'Check your email to confirm your account ❤️'))};
 $('#aml').onclick=async()=>{m('Sending…');const r=await sb.auth.signInWithOtp({email:e(),options:{emailRedirectTo:location.href.split('#')[0]}});m(r.error?r.error.message:'Magic link sent. Check your email ❤️')}}
// ---------- profile ----------
async function profileView(isNew){const g=gen;const p=prof||{handle:'',bio:''};B.innerHTML=`<h2>${isNew?'Create your profile':'My profile'}</h2>${p.avatar?`<img src="${esc(p.avatar)}" style="width:90px;height:90px;border-radius:50%;object-fit:cover">`:''}
<p>Handle <input id="ph" value="${esc(p.handle)}" placeholder="coffee_queen"></p><p><textarea id="pb" rows="3" style="width:100%" placeholder="Bio">${esc(p.bio||'')}</textarea></p><p>Avatar <input id="pa" type="file" accept="image/*"></p>
<p><button id="ps">Save</button> ${prof&&!prof.verified?`<button id="pv">${prof.verify_requested?'✔️ Verification requested':'✔️ Request verified badge'}</button>`:''} <button id="po">Log out</button></p><p id="pm" class="sbS"></p><div id="myp"></div><div id="myPr"></div>`;
 $('#po').onclick=()=>sb.auth.signOut();
 if($('#pv'))$('#pv').onclick=async()=>{await sb.from('profiles').update({verify_requested:true}).eq('id',me.id);await loadMe();render()};
 $('#ps').onclick=async()=>{const h=$('#ph').value.trim();if(!/^[A-Za-z0-9_.]{3,24}$/.test(h))return $('#pm').textContent='Handle: 3-24 letters, numbers, _ or .';
  if(filt(h)!==h)return $('#pm').textContent='Please choose a kinder handle.';let av=p.avatar||null;const f=$('#pa').files[0];
  if(f){const bl=await shrinkImg(f,400);const path=me.id+'/avatar-'+Date.now()+'.jpg';const u=await sb.storage.from('media').upload(path,bl,{contentType:'image/jpeg',upsert:true});if(u.error)return $('#pm').textContent=u.error.message;av=sb.storage.from('media').getPublicUrl(path).data.publicUrl}
  const r=await sb.from('profiles').upsert({id:me.id,handle:h,bio:filt($('#pb').value).slice(0,300),avatar:av});$('#pm').textContent=r.error?(/duplicate|unique/.test(r.error.message)?'That handle is taken':r.error.message):'Saved ❤️';await loadMe();tabs()};
 if(prof){const r=await sb.from('posts').select('*').eq('user_id',me.id).order('created_at',{ascending:false}).limit(30);if(g!==gen)return;$('#myp').innerHTML='<h3>My posts</h3>';(r.data||[]).forEach(x=>$('#myp').appendChild(postEl(x,prof)));
  const z=await sb.from('prizes').select('*').eq('winner',me.id);if(z.data&&z.data.length){$('#myPr').innerHTML='<h3>🏆 My prizes</h3>'+z.data.map(q=>`<div class="sbN">${q.type==='cash'?'💵 Cash':'🎁 Amazon AU gift card'} $${q.amount} ${q.currency}: <b>${q.status}</b><br>Payout email <input data-z="${q.id}" value="${esc(q.payout_email||'')}" placeholder="${q.type==='cash'?'PayID email':'Email for gift card'}"> <button data-zs="${q.id}">Save</button></div>`).join('');
   $('#myPr').querySelectorAll('[data-zs]').forEach(b=>b.onclick=async()=>{const v=$('#myPr').querySelector(`[data-z="${b.dataset.zs}"]`).value.trim();const r=await sb.from('prizes').update({payout_email:v}).eq('id',b.dataset.zs);b.textContent=r.error?'Error':'Saved ❤️'})}}}
// ---------- media compression ----------
function shrinkImg(f,max){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,max/Math.max(i.width,i.height));const c=document.createElement('canvas');c.width=i.width*k|0;c.height=i.height*k|0;c.getContext('2d').drawImage(i,0,0,c.width,c.height);c.toBlob(b=>res(b),'image/jpeg',0.82)};i.onerror=rej;i.src=URL.createObjectURL(f)})}
const VMAX=50*1024*1024,VSOFT=12*1024*1024,VSEC=180;
function shrinkVid(f,msg){return new Promise((res)=>{const v=document.createElement('video');v.muted=true;v.playsInline=true;v.src=URL.createObjectURL(f);v.onloadedmetadata=async()=>{
 if(v.duration>VSEC+1)return res({err:'Videos can be up to 3 minutes'});if(f.size<=VSOFT)return res({blob:f});
 try{const k=Math.min(1,720/Math.max(v.videoWidth,v.videoHeight));const c=document.createElement('canvas');c.width=(v.videoWidth*k)&~1;c.height=(v.videoHeight*k)&~1;const g=c.getContext('2d');
  const st=c.captureStream(30);try{const ac=new AudioContext(),src=ac.createMediaElementSource(v),d=ac.createMediaStreamDestination();src.connect(d);d.stream.getAudioTracks().forEach(t=>st.addTrack(t));v.muted=false}catch(e){}
  const rec=new MediaRecorder(st,{mimeType:MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm',videoBitsPerSecond:1500000});const ch=[];rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
  rec.onstop=()=>res({blob:new Blob(ch,{type:'video/webm'})});let raf;const draw=()=>{g.drawImage(v,0,0,c.width,c.height);msg('Compressing… '+Math.round(v.currentTime/v.duration*100)+'%');raf=requestAnimationFrame(draw)};
  v.onended=()=>{cancelAnimationFrame(raf);rec.stop()};rec.start(500);await v.play();draw()}catch(e){res(f.size<=VMAX?{blob:f}:{err:'Video too big (max 50 MB)'})}};v.onerror=()=>res({err:'Could not read that video'})})}
// ---------- post ----------
function postView(){B.innerHTML=`<h2>New post</h2><p><input id="nf" type="file" accept="image/*,video/*"></p><p><textarea id="nc" rows="3" style="width:100%" placeholder="Caption #hashtags"></textarea></p><p><button id="ns">Post ❤️</button> <button id="nm">🎬 Use my last Make My Movie</button></p><p id="nm2" class="sbS">Photos are resized to 1600px. Videos up to 3 minutes, compressed to under 50 MB.</p>`;
 const msg=t=>$('#nm2').textContent=t;$('#nm').style.display=window.__movieBlob?'':'none';let movie=null;$('#nm').onclick=()=>{movie=window.__movieBlob;msg('Your movie is attached ('+(movie.size/1048576).toFixed(1)+' MB)')};
 $('#ns').onclick=async()=>{const f=movie||$('#nf').files[0];const cap=filt($('#nc').value).slice(0,1000);let kind='text',url=null;$('#ns').disabled=true;
  try{if(f){let blob,ext,type;if((f.type||'').startsWith('image')){blob=await shrinkImg(f,1600);ext='jpg';type='image/jpeg';kind='photo'}else{const r=await shrinkVid(f,msg);if(r.err){msg(r.err);return}blob=r.blob;type=blob.type||'video/webm';ext=type.includes('mp4')?'mp4':'webm';kind='video'}
    if(blob.size>VMAX){msg('Still too big after compressing (max 50 MB)');return}msg('Uploading…');const path=me.id+'/'+Date.now()+'.'+ext;const u=await sb.storage.from('media').upload(path,blob,{contentType:type});if(u.error){msg(u.error.message);return}url=sb.storage.from('media').getPublicUrl(path).data.publicUrl}
   else if(!cap.trim()){msg('Add a photo, video or some words');return}
   const r=await sb.from('posts').insert({user_id:me.id,kind,caption:cap,media_url:url});msg(r.error?r.error.message:'Posted ❤️');if(!r.error){tab='foryou';render()}}finally{const b=$('#ns');if(b)b.disabled=false}}}
// ---------- feed ----------
async function feed(following){const g=gen;B.innerHTML='<p class="sbS">Loading…</p>';let q=sb.from('posts').select('*,profiles(id,handle,avatar,verified),likes(count),comments(count)').order('created_at',{ascending:false}).limit(40);
 if(following){const f=await sb.from('follows').select('following').eq('follower',me.id);const ids=(f.data||[]).map(x=>x.following);if(!ids.length){B.innerHTML='<p>Follow people from For You to fill this feed ❤️</p>';return}q=q.in('user_id',ids)}
 const r=await q;if(g!==gen)return;if(r.error){B.innerHTML='<p>Could not load the feed: '+esc(r.error.message)+'</p>';return}B.innerHTML=me?'':'<p class="sbN">👋 Sign in from 👤 Me to like, comment and post.</p>';
 const rows=(r.data||[]).filter(p=>!blocked.has(p.user_id));if(!rows.length)B.innerHTML+='<p>No posts yet. Be the first! ❤️</p>';rows.forEach(p=>{B.appendChild(postEl(p,p.profiles));sb.rpc('add_view',{p:p.id})})}
function postEl(p,u){u=u||{};const d=document.createElement('div');d.className='sbP';const lc=p.likes?p.likes[0].count:0,cc=p.comments?p.comments[0].count:0;
 d.innerHTML=`<div>${u.avatar?`<img src="${esc(u.avatar)}" style="width:28px;height:28px;border-radius:50%;vertical-align:middle;object-fit:cover"> `:''}<b>@${esc(u.handle||'?')}</b>${vb(u)} <span class="sbS">${ago(p.created_at)} · 👁️ ${p.views||0}</span></div>
 ${p.kind==='video'?`<video src="${esc(p.media_url)}" controls playsinline loop preload="metadata"></video>`:p.kind==='photo'?`<img class="m" src="${esc(p.media_url)}">`:''}<div>${esc(filt(p.caption))}</div>
 <div style="margin-top:6px"><button class="lk">❤️ ${lc}</button> <button class="cm">💬 ${cc}</button> ${me&&u.id&&u.id!==me.id?'<button class="fo">➕ Follow</button> <button class="dm">✉️</button> <button class="bl">🚫 Block</button> ':''}${me?'<button class="rp">🚩 Report</button> ':''}${me&&(p.user_id===me.id||(prof&&prof.is_admin))?'<button class="del">🗑️ Delete</button>':''}</div><div class="cmb"></div>`;
 const q=s=>d.querySelector(s);
 q('.lk').onclick=async()=>{if(!me)return;const r=await sb.from('likes').insert({user_id:me.id,post_id:p.id});if(r.error&&/duplicate/.test(r.error.message)){await sb.from('likes').delete().eq('user_id',me.id).eq('post_id',p.id)}const c=await sb.from('likes').select('*',{count:'exact',head:true}).eq('post_id',p.id);q('.lk').textContent='❤️ '+(c.count||0)};
 q('.cm').onclick=async()=>{const box=q('.cmb');const r=await sb.from('comments').select('*,profiles(handle,verified)').eq('post_id',p.id).order('created_at').limit(100);
  box.innerHTML=(r.data||[]).filter(c=>!blocked.has(c.user_id)).map(c=>`<div class="sbS"><b>@${esc(c.profiles&&c.profiles.handle)}</b>${vb(c.profiles)} ${esc(filt(c.body))}${me&&c.user_id===me.id?` <a href="#" data-dc="${c.id}">🗑️</a>`:''}</div>`).join('')+(me?'<input class="ci" placeholder="Add a comment" style="width:75%"> <button class="cs">Send</button>':'');
  box.querySelectorAll('[data-dc]').forEach(a=>a.onclick=async e=>{e.preventDefault();await sb.from('comments').delete().eq('id',a.dataset.dc);q('.cm').click()});
  if(me)box.querySelector('.cs').onclick=async()=>{const v=filt(box.querySelector('.ci').value.trim()).slice(0,500);if(!v)return;await sb.from('comments').insert({post_id:p.id,user_id:me.id,body:v});q('.cm').click()}};
 if(q('.fo')){sb.from('follows').select('*',{count:'exact',head:true}).eq('follower',me.id).eq('following',u.id).then(r=>{if(r.count)q('.fo').textContent='✔️ Following'});
  q('.fo').onclick=async()=>{if(q('.fo').textContent.includes('Following')){await sb.from('follows').delete().eq('follower',me.id).eq('following',u.id);q('.fo').textContent='➕ Follow'}else{await sb.from('follows').insert({follower:me.id,following:u.id});q('.fo').textContent='✔️ Following'}}}
 if(q('.dm'))q('.dm').onclick=()=>{dmWith=u;tab='dms';render()};
 if(q('.bl'))q('.bl').onclick=async()=>{if(!confirm('Block @'+u.handle+'? You won\'t see their posts or messages.'))return;await sb.from('blocks').insert({blocker:me.id,blocked:u.id});blocked.add(u.id);d.remove()};
 if(q('.rp'))q('.rp').onclick=()=>reportView({target_user:u.id||null,target_post:p.id},'@'+u.handle+"'s post");
 if(q('.del'))q('.del').onclick=async()=>{if(!confirm('Delete this post?'))return;const r=await sb.from('posts').delete().eq('id',p.id);if(!r.error){if(p.media_url&&p.user_id===me.id){const path=p.media_url.split('/media/')[1];if(path)sb.storage.from('media').remove([decodeURIComponent(path)])}d.remove()}};
 return d}
// ---------- reports ----------
function reportView(t,label){B.innerHTML=`<h2>🚩 Report ${esc(label)}</h2><p class="sbN">${SAFE}</p><p><textarea id="rr" rows="4" style="width:100%" placeholder="What happened?"></textarea></p><p><button id="rs">Send report privately</button> <button id="rb">Back</button></p><div id="rm"></div>`;
 $('#rb').onclick=render;$('#rs').onclick=async()=>{const v=$('#rr').value.trim();if(!v)return;const r=await sb.from('reports').insert(Object.assign({reporter:me.id,reason:v.slice(0,2000)},t));
  $('#rm').innerHTML=r.error?esc(r.error.message):`<p>Thank you. Your report went privately to Coffeebreak ❤️</p><div class="sbN"><b>A prayer for you</b><p style="font-style:italic">${PRAYER}</p></div><p class="sbN">${SAFE}</p>`}}
// ---------- chatroom (Realtime) ----------
let room='Lobby';
async function chatView(){const g=gen;B.innerHTML=`<h2>💬 Live chatroom</h2><p>${['Lobby','Music','Movies','Prayer'].map(r=>`<button data-r="${r}" class="${r===room?'sel':''}">${r}</button>`).join(' ')} <input id="rc" placeholder="Room code" style="width:110px"> <button id="rj">Join</button></p>
<div id="cl" style="height:52vh;overflow:auto;background:#1a0a10;border-radius:10px;padding:8px"></div><p><input id="ct" style="width:78%" placeholder="Say something kind" maxlength="500"> <button id="cs">Send</button></p><p class="sbS">${SAFE}</p>`;
 O.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{room=b.dataset.r;chatView()});$('#rj').onclick=()=>{const v=$('#rc').value.trim().slice(0,40);if(v){room=v;chatView()}};
 const cl=$('#cl'),hc={};const add=async m=>{if(blocked.has(m.user_id))return;let h=hc[m.user_id];if(!h){const r=await sb.from('profiles').select('handle,verified').eq('id',m.user_id).maybeSingle();h=hc[m.user_id]=r.data||{handle:'?'}}
  const e=document.createElement('div');e.innerHTML=`<b>@${esc(h.handle)}</b>${vb(h)} ${esc(filt(m.body))} <span class="sbS">${ago(m.created_at)}</span>`;cl.appendChild(e);cl.scrollTop=1e9};
 const r=await sb.from('chat_messages').select('*').eq('room',room).order('created_at',{ascending:false}).limit(50);if(g!==gen)return;for(const m of (r.data||[]).reverse())await add(m);if(g!==gen)return;
 if(chatCh)sb.removeChannel(chatCh);chatCh=sb.channel('chat-'+room).on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages',filter:'room=eq.'+room},p=>add(p.new)).subscribe();
 const send=async()=>{const v=filt($('#ct').value.trim()).slice(0,500);if(!v)return;$('#ct').value='';await sb.from('chat_messages').insert({room,user_id:me.id,body:v})};$('#cs').onclick=send;$('#ct').onkeydown=e=>{if(e.key==='Enter')send()}}
// ---------- DMs ----------
let dmWith=null,dmCh=null;
async function dmView(){const g=gen;if(dmCh){sb.removeChannel(dmCh);dmCh=null}
 if(!dmWith){const r=await sb.from('dms').select('sender,recipient,body,created_at').or(`sender.eq.${me.id},recipient.eq.${me.id}`).order('created_at',{ascending:false}).limit(200);const ids=[...new Set((r.data||[]).map(m=>m.sender===me.id?m.recipient:m.sender))].filter(i=>!blocked.has(i));
  const ps=ids.length?(await sb.from('profiles').select('id,handle,avatar,verified').in('id',ids)).data||[]:[];if(g!==gen)return;
  B.innerHTML=`<h2>✉️ Messages</h2><p><input id="dh" placeholder="@handle"> <button id="dg">Message</button></p>`+ps.map(p=>`<div class="sbP" data-u="${p.id}" style="cursor:pointer"><b>@${esc(p.handle)}</b>${vb(p)}</div>`).join('')+(ps.length?'':'<p class="sbS">No messages yet.</p>');
  O.querySelectorAll('[data-u]').forEach(e=>e.onclick=()=>{dmWith=ps.find(p=>p.id===e.dataset.u);dmView()});
  $('#dg').onclick=async()=>{const h=$('#dh').value.replace('@','').trim();const r=await sb.from('profiles').select('id,handle,avatar,verified').eq('handle',h).maybeSingle();if(r.data){dmWith=r.data;dmView()}else alert('No one with that handle')};return}
 const u=dmWith;B.innerHTML=`<h2><button id="db">←</button> @${esc(u.handle)}${vb(u)}</h2><div id="dl" style="height:55vh;overflow:auto;background:#1a0a10;border-radius:10px;padding:8px"></div><p><input id="dt" style="width:78%" maxlength="2000"> <button id="ds">Send</button></p>`;
 $('#db').onclick=()=>{dmWith=null;dmView()};const dl=$('#dl');const add=m=>{const e=document.createElement('div');e.style.textAlign=m.sender===me.id?'right':'left';e.innerHTML=`<span class="sbN" style="display:inline-block">${esc(filt(m.body))}</span>`;dl.appendChild(e);dl.scrollTop=1e9};
 const r=await sb.from('dms').select('*').or(`and(sender.eq.${me.id},recipient.eq.${u.id}),and(sender.eq.${u.id},recipient.eq.${me.id})`).order('created_at').limit(200);(r.data||[]).forEach(add);
 dmCh=sb.channel('dm-'+me.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'dms',filter:'recipient=eq.'+me.id},p=>{if(p.new.sender===u.id)add(p.new)}).subscribe();
 const send=async()=>{const v=filt($('#dt').value.trim()).slice(0,2000);if(!v)return;$('#dt').value='';const r=await sb.from('dms').insert({sender:me.id,recipient:u.id,body:v}).select().single();if(r.data)add(r.data);else alert(r.error?r.error.message:'Not sent')};$('#ds').onclick=send;$('#dt').onkeydown=e=>{if(e.key==='Enter')send()}}
// ---------- Go Live (WebRTC, signalling + live comments over Realtime broadcast) ----------
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}]};let liveRow=null;
function stopLive(){Object.values(pcs).forEach(p=>{try{p.close()}catch(e){}});pcs={};if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null}if(liveCh){sb.removeChannel(liveCh);liveCh=null}if(liveRow){sb.from('live_streams').update({is_live:false,ended_at:new Date().toISOString()}).eq('id',liveRow.id);liveRow=null}}
async function liveView(){const g=gen;const r=await sb.from('live_streams').select('*,profiles(handle,verified)').eq('is_live',true).order('started_at',{ascending:false}).limit(30);if(g!==gen)return;
 B.innerHTML=`<h2>🔴 Live now</h2><p><input id="lt" placeholder="Stream title" maxlength="120"> <button id="lg">🔴 Go Live</button></p><p class="sbS">Best for up to about 20 viewers per stream.</p>`+((r.data||[]).filter(s=>!blocked.has(s.user_id)).map(s=>`<div class="sbP" data-s="${s.id}" style="cursor:pointer">🔴 <b>@${esc(s.profiles&&s.profiles.handle)}</b>${vb(s.profiles)} ${esc(filt(s.title))} <span class="sbS">${ago(s.started_at)}</span></div>`).join('')||'<p>No one is live right now.</p>');
 O.querySelectorAll('[data-s]').forEach(e=>e.onclick=()=>watch((r.data||[]).find(s=>s.id===e.dataset.s)));$('#lg').onclick=goLive}
function liveUI(title){B.innerHTML=`<h2>🔴 ${esc(title)}</h2><video id="lv" autoplay playsinline style="width:100%;max-height:55vh;background:#000;border-radius:10px"></video><p id="ls" class="sbS"></p><div id="lc" style="height:20vh;overflow:auto"></div><p><input id="lci" style="width:70%" placeholder="Comment" maxlength="300"> <button id="lcs">Send</button> <button id="lx">Leave</button></p>`;
 $('#lx').onclick=()=>{stopLive();liveView()};const addC=m=>{const e=document.createElement('div');e.innerHTML=`<b>@${esc(m.h)}</b> ${esc(filt(m.t))}`;$('#lc').appendChild(e);$('#lc').scrollTop=1e9};
 const send=()=>{const v=filt($('#lci').value.trim()).slice(0,300);if(!v||!liveCh)return;$('#lci').value='';const m={h:prof.handle,t:v};liveCh.send({type:'broadcast',event:'cmt',payload:m});addC(m)};$('#lcs').onclick=send;$('#lci').onkeydown=e=>{if(e.key==='Enter')send()};return addC}
async function goLive(){const title=filt($('#lt').value.trim()||'Live on Coffeebreak');try{localStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true})}catch(e){alert('Camera/mic not allowed');return}
 const ins=await sb.from('live_streams').insert({user_id:me.id,title}).select().single();if(ins.error){alert(ins.error.message);localStream.getTracks().forEach(t=>t.stop());return}liveRow=ins.data;
 const addC=liveUI(title);const v=$('#lv');v.srcObject=localStream;v.muted=true;const cnt=()=>{const s=$('#ls');if(s)s.textContent='👀 '+Object.keys(pcs).length+' watching'};cnt();
 liveCh=sb.channel('live-'+liveRow.id,{config:{broadcast:{self:false}}});
 liveCh.on('broadcast',{event:'cmt'},({payload})=>addC(payload))
 .on('broadcast',{event:'join'},async({payload})=>{const id=payload.from;if(pcs[id])pcs[id].close();const pc=pcs[id]=new RTCPeerConnection(ICE);localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
   pc.onicecandidate=e=>e.candidate&&liveCh.send({type:'broadcast',event:'ice',payload:{to:id,from:'host',c:e.candidate}});pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState)){delete pcs[id];cnt()}};
   const o=await pc.createOffer();await pc.setLocalDescription(o);liveCh.send({type:'broadcast',event:'offer',payload:{to:id,sdp:pc.localDescription}});cnt()})
 .on('broadcast',{event:'answer'},({payload})=>{const pc=pcs[payload.from];if(pc)pc.setRemoteDescription(payload.sdp)})
 .on('broadcast',{event:'ice'},({payload})=>{if(payload.to==='host'){const pc=pcs[payload.from];if(pc)pc.addIceCandidate(payload.c).catch(()=>{})}}).subscribe()}
function watch(s){if(!s)return;const myId=(me.id+'-'+Math.random().toString(36).slice(2,7));const addC=liveUI((s.profiles&&'@'+s.profiles.handle+': ')+s.title);let pc=null;$('#ls').textContent='Connecting…';
 liveCh=sb.channel('live-'+s.id,{config:{broadcast:{self:false}}});
 liveCh.on('broadcast',{event:'cmt'},({payload})=>addC(payload))
 .on('broadcast',{event:'offer'},async({payload})=>{if(payload.to!==myId)return;pc=pcs.host=new RTCPeerConnection(ICE);pc.ontrack=e=>{$('#lv').srcObject=e.streams[0];$('#ls').textContent='🔴 Live'};
   pc.onicecandidate=e=>e.candidate&&liveCh.send({type:'broadcast',event:'ice',payload:{to:'host',from:myId,c:e.candidate}});await pc.setRemoteDescription(payload.sdp);const a=await pc.createAnswer();await pc.setLocalDescription(a);liveCh.send({type:'broadcast',event:'answer',payload:{from:myId,sdp:pc.localDescription}})})
 .on('broadcast',{event:'ice'},({payload})=>{if(payload.to===myId&&pc)pc.addIceCandidate(payload.c).catch(()=>{})})
 .subscribe(st=>{if(st==='SUBSCRIBED')liveCh.send({type:'broadcast',event:'join',payload:{from:myId}})})}
// ---------- prizes ----------
async function prizesView(){const g=gen;const r=await sb.from('contests').select('*').order('ends_at',{ascending:false}).limit(10);if(g!==gen)return;const cs=r.data||[];const now=Date.now();
 B.innerHTML=`<h2>🏆 Prizes</h2><p class="sbN"><b>Prizes are free to enter. No purchase necessary.</b></p>`+(cs.length?'':'<p>No contests yet. Check back soon ❤️</p>');
 for(const c of cs){const live=new Date(c.ends_at)>now&&new Date(c.starts_at)<now;const d=document.createElement('div');d.className='sbP';d.innerHTML=`<h3>${esc(c.title)} ${live?'🟢 Open':'⏹️ Ended'}</h3><p>${esc(c.description)}</p><p class="sbS">${new Date(c.starts_at).toLocaleDateString()} to ${new Date(c.ends_at).toLocaleDateString()}. Post during this time to enter.</p><div class="lb sbS">Loading leaderboard…</div>`;B.appendChild(d);
  const lb=await sb.rpc('leaderboard',{since:c.starts_at,until:c.ends_at});if(g!==gen)return;d.querySelector('.lb').innerHTML=lbTable(lb.data)}
 if(g===gen)B.insertAdjacentHTML('beforeend',`<div class="sbN">${RULES}</div>`)}
const lbTable=rows=>rows&&rows.length?'<table style="width:100%"><tr><th>#</th><th>Creator</th><th>❤️</th><th>👁️</th><th>Score</th></tr>'+rows.map((x,i)=>`<tr><td>${i+1}</td><td>@${esc(x.handle)}${vb(x)}</td><td>${x.likes}</td><td>${x.views}</td><td>${x.score}</td></tr>`).join('')+'</table>':'No entries yet.';
// ---------- admin (only shown when profiles.is_admin; RLS enforces it server-side) ----------
async function adminView(){const g=gen;if(!prof||!prof.is_admin){B.innerHTML='Admins only.';return}
 const [rp,vr,cs,pz]=await Promise.all([sb.from('reports').select('*').order('created_at',{ascending:false}).limit(100),sb.from('profiles').select('id,handle,bio,avatar').eq('verify_requested',true).eq('verified',false),sb.from('contests').select('*').order('ends_at',{ascending:false}).limit(20),sb.from('prizes').select('*,profiles(handle)').order('created_at',{ascending:false}).limit(100)]);if(g!==gen)return;
 B.innerHTML=`<h2>🛡️ Admin</h2><h3>✔️ Badge requests</h3>${(vr.data||[]).map(p=>`<div class="sbP">@${esc(p.handle)} ${esc(p.bio)} <button data-va="${p.id}">Approve ✔️</button> <button data-vd="${p.id}">Decline</button></div>`).join('')||'<p class="sbS">None.</p>'}
 <p>Give a badge by handle: <input id="vh" placeholder="handle"> <button id="vg">Verify</button> <button id="vu">Remove badge</button></p>
 <h3>🚩 Reports</h3>${(rp.data||[]).map(x=>`<div class="sbP"><span class="sbS">${ago(x.created_at)} · ${x.status}</span><br>${esc(x.reason)}<br><span class="sbS">user ${esc(x.target_user||'-')} · post ${esc(x.target_post||'-')}</span><br><button data-rs="${x.id}" data-st="reviewed">Reviewed</button> <button data-rs="${x.id}" data-st="closed">Close</button>${x.target_post?` <button data-rdp="${x.target_post}">Delete post</button>`:''}</div>`).join('')||'<p class="sbS">No reports.</p>'}
 <h3>🏆 Contests</h3><p><input id="kt" placeholder="Title"> <input id="kd" placeholder="Description"> Start <input id="ks" type="date"> End <input id="ke" type="date"> <button id="kc">Create</button></p><div id="kl"></div>
 <h3>🎁 Prizes</h3>${(pz.data||[]).map(q=>`<div class="sbP">${q.type==='cash'?'💵 Cash':'🎁 Amazon AU'} $${q.amount} → @${esc(q.profiles&&q.profiles.handle)} · <b>${q.status}</b> · ${esc(q.payout_email||'no payout email yet')} ${q.status==='pending'?`<button data-pa="${q.id}">Approve</button>`:''}${q.status==='approved'?`<button data-pp="${q.id}">Mark paid</button>`:''}</div>`).join('')||'<p class="sbS">No prizes yet.</p>'}
 <p class="sbS">Cash payouts: press “Export payouts CSV”, then run the admin PayID payout script on your own computer (the PayID Secret is never in this app). Amazon AU gift cards are sent by you. Press “Mark paid” afterwards.</p><p><button id="pcsv">⬇️ Export payouts CSV</button></p>`;
 const A=(s,f)=>O.querySelectorAll(s).forEach(b=>b.onclick=()=>f(b).then(adminView));
 A('[data-va]',b=>sb.from('profiles').update({verified:true,verify_requested:false}).eq('id',b.dataset.va));A('[data-vd]',b=>sb.from('profiles').update({verify_requested:false}).eq('id',b.dataset.vd));
 A('#vg',()=>sb.from('profiles').update({verified:true,verify_requested:false}).eq('handle',$('#vh').value.replace('@','').trim()));A('#vu',()=>sb.from('profiles').update({verified:false}).eq('handle',$('#vh').value.replace('@','').trim()));
 A('[data-rs]',b=>sb.from('reports').update({status:b.dataset.st}).eq('id',b.dataset.rs));A('[data-rdp]',b=>sb.from('posts').delete().eq('id',b.dataset.rdp));
 A('#kc',()=>sb.from('contests').insert({title:$('#kt').value||'Coffeebreak Contest',description:$('#kd').value,starts_at:new Date($('#ks').value||Date.now()).toISOString(),ends_at:new Date($('#ke').value||Date.now()+7*864e5).toISOString()}));
 $('#pcsv').onclick=()=>{const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const rows=(pz.data||[]).filter(x=>x.type==='cash'&&x.status==='approved'&&x.payout_email);const csv='email,amount,currency,note,id\n'+rows.map(x=>[x.payout_email,(+x.amount).toFixed(2),x.currency||'AUD','Coffeebreak prize/royalties ❤️',x.id].map(q).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='coffeebreak-payouts.csv';a.click()};
 A('[data-pa]',b=>sb.from('prizes').update({status:'approved'}).eq('id',b.dataset.pa));A('[data-pp]',b=>sb.from('prizes').update({status:'paid'}).eq('id',b.dataset.pp));
 for(const c of (cs.data||[])){const d=document.createElement('div');d.className='sbP';d.innerHTML=`<b>${esc(c.title)}</b> <span class="sbS">${new Date(c.ends_at).toLocaleDateString()}</span><div class="lb"></div>`;$('#kl').appendChild(d);
  const lb=await sb.rpc('leaderboard',{since:c.starts_at,until:c.ends_at});d.querySelector('.lb').innerHTML=(lb.data||[]).slice(0,10).map((x,i)=>`<div>${i+1}. @${esc(x.handle)} (score ${x.score}) <select data-pt><option value="amazon_giftcard">Amazon AU gift card</option><option value="cash">Cash</option></select> $<input data-pm value="50" style="width:60px"> <button data-pw="${x.user_id}">Pick as winner</button></div>`).join('')||'No entries.';
  d.querySelectorAll('[data-pw]').forEach(b=>b.onclick=async()=>{const row=b.parentElement;await sb.from('prizes').insert({contest_id:c.id,winner:b.dataset.pw,type:row.querySelector('[data-pt]').value,amount:+row.querySelector('[data-pm]').value||50});adminView()})}}
loadMe();
})();
