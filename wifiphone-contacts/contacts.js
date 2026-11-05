'use strict';
(function(){
const Q=s=>document.querySelector(s);
const st=document.createElement('style');st.textContent=`
#cbx .bar{display:flex;gap:6px;margin:6px 0}#cbx input,#cbp input,#cbp textarea{font-size:16px;padding:10px;border-radius:12px;border:2px solid #e8cdbd;width:100%}
#cbx .fl{display:flex;gap:6px;margin:6px 0}#cbx .fl button{flex:1;padding:10px;border-radius:14px;border:0;background:#f3dccd;color:var(--brown);font-weight:700}#cbx .fl button.on{background:var(--hot);color:#fff}
.cbav{width:48px;height:48px;border-radius:50%;object-fit:cover;background:var(--pink);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;flex:none}
.cbr{display:flex;align-items:center;gap:10px;padding:8px;border-radius:14px;background:#fff;margin:4px 0;cursor:pointer}.cbr b{display:block}.cbr span{font-size:12px;opacity:.75}
.cbl{font-weight:800;color:var(--hot);margin:10px 4px 2px}
#cbp{position:fixed;inset:0;max-width:480px;margin:auto;background:var(--cream);z-index:90;overflow:auto;padding:14px;display:none}#cbp.show{display:block}
#cbp .big{width:130px;height:130px;font-size:54px;display:flex;margin:6px auto}
#cbp .acts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}#cbp .acts button,#cbp .acts a{border:0;border-radius:18px;padding:14px 4px;background:var(--brown);color:#fff;font-size:26px;text-align:center;text-decoration:none}#cbp .acts small{display:block;font-size:12px}
#cbp .inf{background:#fff;border-radius:14px;padding:10px;margin:6px 0}#cbp .inf span{font-size:12px;opacity:.7;display:block}
#cbp .top{display:flex;align-items:center;gap:8px}#cbp .top h3{flex:1;margin:0}.cbstar{font-size:30px;background:none;border:0;color:#bbb}.cbstar.on{color:#f5b400}
#cbp .pb{display:block;width:100%;margin:6px 0}`;document.head.appendChild(st);

const P=()=>contacts; // shared global from app.js
const ini=c=>esc(((c.name||'?').trim()[0]||'?').toUpperCase());
const av=(c,cls='')=>c.photo?`<img class="cbav ${cls}" src="${c.photo}" alt="">`:`<span class="cbav ${cls}">${ini(c)}</span>`;
const isCB=n=>/^CB-/.test(n||'');
const cbOf=c=>isCB(c.num)?c.num:(c.cb||'');const telOf=c=>c.phone||(!isCB(c.num)?c.num:'');
let filt='all',q='';

// list UI
const box=document.createElement('div');box.id='cbx';
box.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><img src="logo.png" alt="Coffeebreak" style="height:30px"><b style="flex:1">My contacts</b><button class="btn" id="cbnew">＋ Add</button></div>
<div class="cbr" id="cbme"></div>
<div class="bar"><input id="cbq" placeholder="🔍 Search name, number, email"></div>
<div class="fl"><button data-f="all" class="on">A to Z</button><button data-f="fav">★ Favourites</button></div><div id="cbl"></div>`;
const clist=Q('#clist');clist.parentNode.insertBefore(box,clist);clist.style.display='none';
['#cname','#cnum','#cadd'].forEach(x=>{const e=Q(x);if(e)e.style.display='none'});{const f=Q('#cfav');if(f)f.closest('label').style.display='none';const h=Q('#cadd')&&Q('#cadd').parentNode;if(h)h.querySelectorAll(':scope>h4,:scope>br').forEach(e=>e.style.display='none')}
Q('#cbq').oninput=e=>{q=e.target.value.toLowerCase();draw()};
box.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filt=b.dataset.f;box.querySelectorAll('[data-f]').forEach(x=>x.classList.toggle('on',x===b));draw()});
Q('#cbnew').onclick=()=>edit(null);
function myP(){return LS.get('myprofile',{name:'Me',photo:''})}
function draw(){
 const m=myP();Q('#cbme').innerHTML=`${av(m)}<div style="flex:1"><b>${esc(m.name||'Me')} (My profile)</b><span>${esc(me)} · tap to share</span></div><span>›</span>`;
 let L=P().map((c,i)=>({c,i})).filter(o=>filt!=='fav'||o.c.fav).filter(o=>!q||[o.c.name,o.c.num,o.c.cb,o.c.phone,o.c.email].join(' ').toLowerCase().includes(q));
 L.sort((a,b)=>(a.c.name||'').localeCompare(b.c.name||'',undefined,{sensitivity:'base'}));
 let last='',h='';L.forEach(({c,i})=>{const l=((c.name||'#').trim()[0]||'#').toUpperCase();if(l!==last){last=l;h+=`<div class="cbl">${esc(/[A-Z]/.test(l)?l:'#')}</div>`}
  h+=`<div class="cbr" data-cbi="${i}">${av(c)}<div style="flex:1;min-width:0"><b>${esc(c.name||c.num)}${c.fav?' <span style="color:#f5b400">★</span>':''}</b><span>${esc(cbOf(c)||telOf(c))}</span></div>${cbOf(c)?`<button data-call="${esc(cbOf(c))}" title="Call">📞</button>`:`<a class="btn" style="padding:8px;text-decoration:none" href="tel:${esc(telOf(c))}">📞</a>`}</div>`});
 Q('#cbl').innerHTML=h||`<p>${filt==='fav'?'No favourites yet. Tap the star on a contact.':q?'No match':'No contacts yet. Tap Add.'}</p>`}
const oldR=window.render;window.render=render=function(){oldR();draw()};
box.addEventListener('click',e=>{if(e.target.closest('[data-call],a'))return;const r=e.target.closest('[data-cbi]');if(r)show(+r.dataset.cbi);else if(e.target.closest('#cbme'))mine()});

// profile overlay
const pv=document.createElement('div');pv.id='cbp';document.body.appendChild(pv);
const close=()=>pv.classList.remove('show');
function show(i){const c=P()[i];if(!c)return;const cb=cbOf(c),tel=telOf(c);
 pv.innerHTML=`<div class="top"><button class="btn" id="cbb">‹ Back</button><h3 style="text-align:center"><img src="logo.png" alt="Coffeebreak" style="height:34px"></h3><button class="cbstar ${c.fav?'on':''}" id="cbs" aria-label="Favourite">★</button></div>
 ${av(c,'big')}<h2 style="text-align:center;margin:4px">${esc(c.name||'')}</h2>
 <div class="acts">${cb?`<button data-pc="call">📞<small>Call</small></button><button data-pc="vid">🎥<small>Video</small></button><button data-pc="msg">💬<small>Message</small></button><button data-pc="wk">📻<small>Walkie</small></button>`:`<a href="tel:${esc(tel)}">📞<small>Call</small></a><button data-pc="novid">🎥<small>Video</small></button><a href="sms:${esc(tel)}">💬<small>Message</small></a><button data-pc="nowk">📻<small>Walkie</small></button>`}</div>
 ${cb?`<div class="inf"><span>Coffeebreak WiFi number</span>${esc(cb)}</div>`:''}
 ${tel?`<div class="inf"><span>Phone number</span><a href="tel:${esc(tel)}">${esc(tel)}</a></div>`:''}
 ${c.email?`<div class="inf"><span>Email</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>`:''}
 ${c.notes?`<div class="inf"><span>Notes</span>${esc(c.notes).replace(/\n/g,'<br>')}</div>`:''}
 ${window.cbSocial?window.cbSocial.profile(c):''}
 <button class="btn pb" id="cbe">✏️ Edit contact</button><button class="btn pb" id="cbd" style="background:#6b4226">🗑 Delete contact</button>`;
 pv.classList.add('show');Q('#cbb').onclick=close;
 Q('#cbs').onclick=()=>{c.fav=!c.fav;save();render();show(i)};
 Q('#cbe').onclick=()=>edit(i);
 Q('#cbd').onclick=()=>{if(confirm('Delete '+(c.name||'this contact')+'?')){P().splice(i,1);save();render();close()}};
 pv.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>{const a=b.dataset.pc;
  if(a==='call'){close();startCall(cb,false)}else if(a==='vid'){close();startCall(cb,true)}else if(a==='msg'){close();showChat(cb)}
  else if(a==='wk'){close();const t=document.querySelector('nav button[data-t=walkie]');if(t)t.click();const ch=Q('#wkch');if(ch){ch.value='cb-'+[me,cb].sort().join('-').replace(/CB-/g,'');const on=Q('#wkon');const lb=Q('#wkonl');if(on&&lb&&/off/i.test(lb.textContent))on.click();const j=Q('#wkjoin');if(j)j.click()}}
  else alert('Add their Coffeebreak WiFi number to use '+(a==='novid'?'video calls':'the walkie talkie'))})}

function photoPick(cb){const f=document.createElement('input');f.type='file';f.accept='image/*';f.onchange=()=>{const file=f.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=256,cv=document.createElement('canvas');cv.width=cv.height=s;const k=Math.max(s/im.width,s/im.height),w=im.width*k,h=im.height*k;cv.getContext('2d').drawImage(im,(s-w)/2,(s-h)/2,w,h);cb(cv.toDataURL('image/jpeg',.8))};im.src=r.result};r.readAsDataURL(file)};f.click()}

function edit(i){const c=i==null?{name:'',num:'',fav:false}:P()[i];let photo=c.photo||'';
 pv.innerHTML=`<div class="top"><button class="btn" id="cbb">‹ Back</button><h3>${i==null?'New contact':'Edit contact'}</h3></div>
 <div id="cbph" style="text-align:center"></div><div style="display:flex;gap:6px"><button class="btn" id="cbpu" style="flex:1">📷 Take or pick photo</button><button class="btn" id="cbpx" style="flex:1;background:#6b4226">Remove photo</button></div>
 <p>Name<input id="fn"></p><p>Coffeebreak WiFi number<input id="fc" placeholder="CB-1234-5678"></p><p>Phone number<input id="fp" type="tel" placeholder="0412 345 678"></p><p>Email<input id="fe" type="email"></p><p>Notes<textarea id="fo" rows="3"></textarea></p>
 ${window.cbSocial?window.cbSocial.fields(c):''}<label style="font-size:18px"><input type="checkbox" id="ff" style="width:auto"> ★ Favourite</label><button class="btn pb" id="cbsv" style="font-size:20px;padding:14px">Save</button>`;
 const ph=()=>Q('#cbph').innerHTML=av({name:Q('#fn').value||c.name,photo},'big');
 Q('#fn').value=c.name||'';Q('#fc').value=cbOf(c);Q('#fp').value=telOf(c);Q('#fe').value=c.email||'';Q('#fo').value=c.notes||'';Q('#ff').checked=!!c.fav;ph();Q('#fn').oninput=ph;
 Q('#cbpu').onclick=()=>photoPick(d=>{photo=d;ph()});Q('#cbpx').onclick=()=>{photo='';ph()};
 Q('#cbb').onclick=()=>i==null?close():show(i);
 Q('#cbsv').onclick=()=>{const name=Q('#fn').value.trim(),rawc=Q('#fc').value.trim(),cb=rawc?norm(rawc):'',tel=Q('#fp').value.replace(/[^\d+]/g,'');
  if(!name)return alert('Enter a name');if(rawc&&!cb)return alert('A Coffeebreak number has 8 digits');if(!cb&&!tel)return alert('Enter a Coffeebreak number or a phone number');
  const n={...c,name,num:cb||tel,cb:cb||'',phone:tel,email:Q('#fe').value.trim(),notes:Q('#fo').value.trim(),fav:Q('#ff').checked,photo,social:window.cbSocial?window.cbSocial.read():(c.social||{})};
  const L=P();if(i==null){const d=L.findIndex(x=>x.num===n.num);if(d>=0)L.splice(d,1);L.push(n)}else L[i]=n;save();render();show(L.indexOf(n))}
 pv.classList.add('show')}

function mine(){const m=myP();const link=((location.protocol.startsWith('http')&&!/itch\.zone|hwcdn|itch\.io|localhost/.test(location.host))?location.origin+location.pathname:'https://coffeebreaks.itch.io/coffeebreak-wifiphone')+'?add='+me;
 pv.innerHTML=`<div class="top"><button class="btn" id="cbb">‹ Back</button><h3>My profile</h3></div><div style="text-align:center"><img src="logo.png" alt="Coffeebreak" style="height:40px"></div>
 <div id="cbph">${av(m,'big')}</div><button class="btn pb" id="cbpu">📷 Change my photo</button><p>My name<input id="fn" value="${esc(m.name||'')}"></p>
 <div class="inf" style="text-align:center;font-size:22px"><span>My Coffeebreak WiFi number</span><b>${esc(me)}</b></div>
 <div id="cbqr" style="display:flex;justify-content:center;margin:10px"></div><p style="text-align:center;font-size:13px">Friends scan this to add you</p>
 <button class="btn pb" id="cbsh">📤 Share my number</button>`;
 pv.classList.add('show');Q('#cbb').onclick=()=>{close();draw()};
 new QRCode(Q('#cbqr'),{text:link,width:200,height:200,colorDark:'#3b2417'});
 Q('#fn').oninput=e=>{const p=myP();p.name=e.target.value;LS.set('myprofile',p)};
 Q('#cbpu').onclick=()=>photoPick(d=>{const p=myP();p.photo=d;LS.set('myprofile',p);Q('#cbph').innerHTML=av(p,'big')});
 Q('#cbsh').onclick=()=>{const t='Add me on Coffeebreak WifiPhone: '+me;if(navigator.share)navigator.share({title:'Coffeebreak WifiPhone',text:t,url:link}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(t+' '+link);alert('Copied')}}}
window.cbContacts={show,edit,mine,draw};
draw();
})();
