const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Newsletter Maker (all in-browser; no cloud AI) =====
const G={state:'menu',score:0,level:0};window.G=G;
(function(){
const D=!!window.DEMO;c.style.display='none';
const st=document.createElement('style');st.textContent=`#nl{flex:1;width:100%;max-width:1250px;overflow:auto;padding:8px 10px 90px;box-sizing:border-box;font-family:Georgia,serif}
#nl h2{color:#e8a0b0;margin:6px 0}#nl .tabs button,#nl button{margin:2px;background:#3a1424;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:8px;padding:5px 9px;font:14px Georgia;cursor:pointer}
#nl button.on{background:#e8a0b0;color:#1a0a10}#nl select,#nl input,#nl textarea{background:#22101a;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:6px;padding:4px;font:13px Georgia;box-sizing:border-box}
#nl textarea{width:100%;height:80px}#nl .ed{display:grid;grid-template-columns:150px 1fr 280px;gap:10px}#nl .pal div{margin:4px 0;padding:6px;border-radius:8px;background:#3a1424;border:1px dashed #e8a0b0;cursor:grab;font-size:13px}
#nl .canvas{background:#2a1520;border-radius:10px;padding:10px;min-height:400px}#nl .blk{position:relative;border:2px solid transparent;border-radius:6px;cursor:pointer}#nl .blk.sel{border-color:#ffcf6a}#nl .blk.over{border-top:4px solid #ffcf6a}
#nl .blk .tools{position:absolute;right:2px;top:2px;display:none;z-index:2}#nl .blk:hover .tools,#nl .blk.sel .tools{display:block}#nl .blk .tools button{padding:1px 5px;font-size:12px}
#nl .insp label{display:block;font-size:12px;margin-top:6px;color:#d9b8c0}#nl .insp input,#nl .insp select{width:100%}#nl .card{background:#1e0b14;border:1px solid #5a2a3a;border-radius:12px;padding:10px;margin:8px 0}
#nl .grid{display:flex;flex-wrap:wrap;gap:10px}#nl .tpl{width:180px;border-radius:10px;overflow:hidden;background:#1e0b14;border:1px solid #5a2a3a;cursor:pointer;font-size:13px;text-align:center}#nl .tpl .sw{height:90px;display:flex;align-items:center;justify-content:center;font-size:34px}
#nl .tpl.lock{opacity:.55}#nl .note{font-size:12px;color:#d9b8c0}#nl .chip{display:inline-block;margin:2px;padding:4px 8px;border-radius:12px;background:#3a1424;cursor:pointer;font-size:13px}
#nl iframe{border:0;background:#fff;border-radius:8px;display:block;margin:auto}#nlMsg{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);background:#e8a0b0;color:#1a0a10;padding:8px 14px;border-radius:10px;display:none;z-index:50}
@media(max-width:900px){#nl .ed{grid-template-columns:1fr}}`;
document.head.appendChild(st);
const R=document.createElement('div');R.id='nl';c.parentNode.insertBefore(R,c.nextSibling);
const M=document.createElement('div');M.id='nlMsg';document.body.appendChild(M);
document.addEventListener('pointerdown',()=>startMusic(),{once:true});
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function say(t){M.textContent=t;M.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>M.style.display='none',2600)}
const FONTS={'Georgia':'Georgia,serif','Arial':'Arial,Helvetica,sans-serif','Verdana':'Verdana,Geneva,sans-serif','Trebuchet':'"Trebuchet MS",sans-serif','Times':'"Times New Roman",Times,serif','Courier':'"Courier New",monospace','Tahoma':'Tahoma,sans-serif','Palatino':'"Palatino Linotype",Palatino,serif'};
const THEMES={Latte:{bg:'#f4ece1',paper:'#ffffff',accent:'#8a5a3c',text:'#3a2a20',font:'Georgia'},Rose:{bg:'#fbe9ee',paper:'#ffffff',accent:'#c2456e',text:'#3a1a26',font:'Georgia'},Ocean:{bg:'#e3f1f8',paper:'#ffffff',accent:'#1f6f9f',text:'#16303f',font:'Arial'},
Forest:{bg:'#e8f0e3',paper:'#ffffff',accent:'#3f7a3a',text:'#1f2f1c',font:'Verdana'},Midnight:{bg:'#14141f',paper:'#20202e',accent:'#ffcf6a',text:'#f0ecdf',font:'Trebuchet'},Sunshine:{bg:'#fff6d6',paper:'#ffffff',accent:'#e08a00',text:'#3a2c00',font:'Trebuchet'},
Lavender:{bg:'#efe8f8',paper:'#ffffff',accent:'#7a4fb3',text:'#2a1d3d',font:'Palatino'},Festive:{bg:'#f6e6e6',paper:'#fffdf8',accent:'#b3202a',text:'#2d1a10',font:'Times'},Mono:{bg:'#eeeeee',paper:'#ffffff',accent:'#222222',text:'#222222',font:'Courier'},Candy:{bg:'#ffe6f6',paper:'#ffffff',accent:'#ff5fa2',text:'#3a1030',font:'Tahoma'}};
// placeholder art (generated, original)
function art(emoji,c1,c2,w,h){const cv=document.createElement('canvas');cv.width=w||600;cv.height=h||300;const g=cv.getContext('2d');const gr=g.createLinearGradient(0,0,cv.width,cv.height);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,cv.width,cv.height);
 g.globalAlpha=.18;g.fillStyle='#fff';for(let i=0;i<14;i++){g.beginPath();g.arc((i*97)%cv.width,(i*53)%cv.height,20+(i*13)%50,0,7);g.fill()}g.globalAlpha=1;g.font=Math.round(cv.height*.45)+'px serif';g.textAlign='center';g.textBaseline='middle';g.fillText(emoji,cv.width/2,cv.height/2);return cv.toDataURL('image/jpeg',.8)}
const B={header:()=>({t:'header',title:'Our Newsletter',sub:'Issue 1 · '+new Date().toLocaleDateString('en-AU',{month:'long',year:'numeric'}),img:'',align:'center'}),
text:()=>({t:'text',title:'A note from us',body:'Write your news here. Share what happened, what is coming up and say thank you to the people who make it special.',align:'left'}),
image:()=>({t:'image',src:'',cap:'Add a caption',w:100,link:''}),
two:()=>({t:'two',l:{title:'Left column',body:'Short news item.',img:''},r:{title:'Right column',body:'Another short item.',img:''}}),
button:()=>({t:'button',label:'Find out more',url:'https://example.com',align:'center'}),
divider:()=>({t:'divider',style:'solid',emoji:''}),
events:()=>({t:'events',title:'Coming up',items:[{d:'Sat 14 Nov',n:'Morning tea',w:'10am · Hall'},{d:'Fri 27 Nov',n:'End of term party',w:'6pm · Park'}]}),
quote:()=>({t:'quote',q:'Alone we can do so little; together we can do so much.',by:'Helen Keller'}),
gallery:()=>({t:'gallery',imgs:[],cols:3}),
social:()=>({t:'social',links:[{n:'Facebook',u:'https://facebook.com'},{n:'Instagram',u:'https://instagram.com'},{n:'Website',u:'https://example.com'}]}),
footer:()=>({t:'footer',text:'You are receiving this because you are part of our community.',addr:'123 Example St, Sydney NSW',unsub:'Reply STOP to unsubscribe'})};
const BL={header:'🏷️ Header',text:'📝 Text',image:'🖼️ Image',two:'◫ Two columns',button:'🔘 Button',divider:'➖ Divider',events:'📅 Events',quote:'❝ Quote',gallery:'🖼️ Gallery',social:'🔗 Social links',footer:'🦶 Footer'};
function mk(t,o){return Object.assign(B[t](),o||{})}
const TPL=[
['Family News','👨‍👩‍👧','Latte','#c99b6d','#8a5a3c',[['header',{title:'The Family Gazette',sub:'Love, laughs and news from home'}],['image',{cap:'Our year in one photo'}],['text',{title:'Hello from all of us',body:'What a year it has been! Here is everything the family has been up to.'}],['two',{l:{title:'Birthdays',body:'Grandma turned 80 with a cake bigger than the table.'},r:{title:'New arrivals',body:'Say hello to Biscuit, our new puppy.'}}],['events',{title:'Family dates'}],['footer',{text:'With love from our family to yours.'}]]],
['Church Bulletin','⛪','Lavender','#b9a3df','#7a4fb3',[['header',{title:'Sunday Bulletin',sub:'Grace, fellowship and community'}],['quote',{q:'This is the day the Lord has made; let us rejoice and be glad in it.',by:'Psalm 118:24'}],['text',{title:'From the pastor',body:'Thank you for being part of our church family. All are welcome at our services this month.'}],['events',{title:'Services & gatherings',items:[{d:'Sun',n:'Morning worship',w:'9:30am'},{d:'Wed',n:'Bible study',w:'7pm'},{d:'Sat',n:'Youth group',w:'4pm'}]}],['button',{label:'Prayer requests'}],['footer',{}]]],
['School Newsletter','🏫','Sunshine','#ffd36b','#e08a00',[['header',{title:'School News',sub:'Term 4 · Week 2'}],['text',{title:"Principal's message",body:'Our students have done amazing work this term. Thank you to all our families.'}],['two',{l:{title:'Sport',body:'Athletics carnival this Friday.'},r:{title:'Library',body:'Book week dress-up is coming!'}}],['events',{title:'Key dates'}],['gallery',{}],['footer',{}]]],
['Club Update','🏆','Forest','#8cc084','#3f7a3a',[['header',{title:'Club Update',sub:'Members news'}],['text',{title:'Season wrap-up',body:'A huge season for the club. Thanks to every volunteer and player.'}],['events',{title:'Fixtures'}],['button',{label:'Renew membership'}],['social',{}],['footer',{}]]],
['Business News','💼','Ocean','#7fb9d9','#1f6f9f',[['header',{title:'Business Briefing',sub:'News, offers and updates'}],['image',{cap:'New season, new range'}],['text',{title:'What is new',body:'We have been busy making things better for you. Here is what has changed this month.'}],['button',{label:'Shop now'}],['quote',{q:'Fantastic service, would recommend to anyone!',by:'Happy customer'}],['social',{}],['footer',{}]]],
['Band & Artist','🎸','Midnight','#3a2a5a','#ffcf6a',[['header',{title:'On Tour',sub:'New music, shows and backstage news'}],['image',{cap:'Live last weekend'}],['text',{title:'New single out now',body:'Our brand new song is streaming everywhere. Turn it up loud!'}],['events',{title:'Tour dates',items:[{d:'Fri 20 Nov',n:'Sydney',w:'The Basement'},{d:'Sat 28 Nov',n:'Brisbane',w:'The Tivoli'}]}],['button',{label:'Listen now'}],['social',{}],['footer',{}]]],
['Community','🏘️','Forest','#a7d39a','#3f7a3a',[['header',{title:'Neighbourhood News',sub:'Your local community update'}],['text',{title:'Welcome, neighbours',body:'Lots happening on our street this month, from the garden working bee to the market.'}],['two',{l:{title:'Lost & found',body:'A blue bike was found near the park.'},r:{title:'Shout-out',body:'Thank you to everyone who helped clean up.'}}],['events',{}],['footer',{}]]],
['Kids Club','🧸','Candy','#ffb3d9','#ff5fa2',[['header',{title:'Kids Club Fun',sub:'Games, crafts and giggles'}],['image',{cap:'Craft day creations'}],['text',{title:'This week',body:'We made paper planes, played treasure hunt and had fruit for snacks!'}],['quote',{q:'Be a rainbow in someone else\u2019s cloud.',by:'Maya Angelou'}],['events',{title:'Fun days'}],['footer',{}]]],
['Holiday Greetings','🎄','Festive','#e88a8a','#b3202a',[['header',{title:'Season\u2019s Greetings',sub:'Warm wishes for the holidays'}],['image',{cap:'From our home to yours'}],['text',{title:'Merry everything!',body:'Wishing you peace, joy and plenty of pudding this holiday season.'}],['divider',{emoji:'⭐'}],['gallery',{}],['footer',{text:'Happy holidays!'}]]],
['Wedding News','💍','Rose','#f2b6c8','#c2456e',[['header',{title:'We\u2019re Getting Married!',sub:'Save the date'}],['image',{cap:'The happy couple'}],['text',{title:'Our story',body:'We met over coffee and the rest is history. We would love you to celebrate with us.'}],['events',{title:'The big day',items:[{d:'Sat 6 Mar',n:'Ceremony',w:'3pm · The Garden'},{d:'Sat 6 Mar',n:'Reception',w:'6pm · The Hall'}]}],['button',{label:'RSVP'}],['footer',{}]]],
['Charity Appeal','💛','Sunshine','#ffe08a','#e08a00',[['header',{title:'Together We Help',sub:'Our appeal update'}],['text',{title:'Thank you!',body:'Because of you, we raised enough to help more families this year.'}],['quote',{q:'No act of kindness, no matter how small, is ever wasted.',by:'Aesop'}],['button',{label:'Donate'}],['events',{title:'Fundraisers'}],['footer',{}]]],
['Monthly Digest','📰','Mono','#bbbbbb','#222222',[['header',{title:'The Monthly Digest',sub:'Everything worth knowing'}],['text',{title:'Top story',body:'A short summary of the biggest news this month.'}],['two',{l:{title:'In brief',body:'Quick updates.'},r:{title:'Tip of the month',body:'One handy tip.'}}],['divider',{}],['quote',{}],['social',{}],['footer',{}]]]];
const DEMO_TPL=3;
function fromTpl(i){const [name,emo,th,c1,c2,bl]=TPL[i];const iss={id:Date.now()+'',name:name+' issue',tpl:name,theme:Object.assign({},THEMES[th]),blocks:bl.map(([t,o])=>mk(t,JSON.parse(JSON.stringify(o))))};
 iss.blocks.forEach(b=>{if(b.t==='image'&&!b.src)b.src=art(emo,c1,c2);if(b.t==='gallery'&&!b.imgs.length)b.imgs=[art(emo,c2,c1,300,300),art('✨',c1,c2,300,300),art('❤️',c2,c1,300,300)]});return iss}
let LIB=[];try{LIB=JSON.parse(localStorage.nlLib||'[]')}catch(e){}
let cur=null;try{cur=JSON.parse(localStorage.nlCur||'null')}catch(e){}if(!cur)cur=fromTpl(0);
let tab='tpl',sel=-1,pv='desktop';
function saveCur(){try{localStorage.nlCur=JSON.stringify(cur)}catch(e){}}
// ---------- email-ready HTML (tables + inline CSS) ----------
function emailHTML(iss,opt){const T=iss.theme,F=FONTS[T.font]||'Georgia,serif',A=T.accent,X=T.text,P=T.paper;opt=opt||{};
 const td=(s,st)=>`<tr><td style="padding:${st||'14px 28px'};font-family:${F};color:${X};">${s}</td></tr>`;
 const h2=t=>t?`<h2 style="margin:0 0 8px;font-family:${F};font-size:22px;line-height:1.25;color:${A};">${esc(t)}</h2>`:'';
 const p=(t,al)=>`<p style="margin:0;font-family:${F};font-size:16px;line-height:1.55;color:${X};text-align:${al||'left'};">${esc(t).replace(/\n/g,'<br>')}</p>`;
 const img=(s,w,alt)=>s?`<img src="${s}" width="${w}" alt="${esc(alt||'')}" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;border-radius:6px;">`:'';
 const R={header:b=>`<tr><td align="${b.align}" style="background:${A};padding:30px 28px;font-family:${F};text-align:${b.align};">${b.img?img(b.img,544,b.title)+'<br>':''}<h1 style="margin:0;font-family:${F};font-size:34px;line-height:1.15;color:${P};">${esc(b.title)}</h1><p style="margin:6px 0 0;font-family:${F};font-size:15px;color:${P};opacity:.9;">${esc(b.sub)}</p></td></tr>`,
 text:b=>td(h2(b.title)+p(b.body,b.align)),
 image:b=>b.src?td(`<div align="center">${b.link?`<a href="${esc(b.link)}">`:''}${img(b.src,Math.round(544*b.w/100),b.cap)}${b.link?'</a>':''}</div>${b.cap?`<p style="margin:6px 0 0;font-family:${F};font-size:13px;color:${X};opacity:.75;text-align:center;font-style:italic;">${esc(b.cap)}</p>`:''}`):'',
 two:b=>td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${[b.l,b.r].map(s=>`<td width="50%" valign="top" style="padding:0 8px;font-family:${F};">${s.img?img(s.img,256,s.title)+'<div style="height:8px"></div>':''}${h2(s.title)}${p(s.body)}</td>`).join('')}</tr></table>`),
 button:b=>td(`<table role="presentation" align="${b.align}" cellpadding="0" cellspacing="0" border="0" style="margin:${b.align==='center'?'0 auto':'0'};"><tr><td style="background:${A};border-radius:8px;"><a href="${esc(b.url)}" style="display:inline-block;padding:13px 26px;font-family:${F};font-size:16px;font-weight:bold;color:${P};text-decoration:none;">${esc(b.label)}</a></td></tr></table>`),
 divider:b=>b.emoji?td(`<p style="margin:0;text-align:center;font-size:20px;color:${A};">${esc(b.emoji)} ${esc(b.emoji)} ${esc(b.emoji)}</p>`,'8px 28px'):td(`<div style="border-top:2px ${b.style} ${A};height:0;line-height:0;font-size:0;">&nbsp;</div>`,'8px 28px'),
 events:b=>td(h2(b.title)+`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${b.items.map(e=>`<tr><td width="110" valign="top" style="padding:6px 0;font-family:${F};font-size:14px;font-weight:bold;color:${A};">${esc(e.d)}</td><td valign="top" style="padding:6px 0;font-family:${F};font-size:15px;color:${X};"><b>${esc(e.n)}</b><br><span style="font-size:13px;opacity:.8;">${esc(e.w)}</span></td></tr>`).join('')}</table>`),
 quote:b=>td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-left:4px solid ${A};padding:6px 16px;font-family:${F};"><p style="margin:0;font-family:${F};font-size:19px;font-style:italic;line-height:1.45;color:${X};">\u201c${esc(b.q)}\u201d</p><p style="margin:6px 0 0;font-family:${F};font-size:14px;color:${A};">\u2014 ${esc(b.by)}</p></td></tr></table>`),
 gallery:b=>b.imgs.length?td(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${chunk(b.imgs,b.cols).map(r=>`<tr>${r.map(s=>`<td width="${Math.floor(100/b.cols)}%" style="padding:4px;">${img(s,Math.floor(536/b.cols),'')}</td>`).join('')}</tr>`).join('')}</table>`):'',
 social:b=>td(`<p style="margin:0;text-align:center;font-family:${F};font-size:15px;">${b.links.map(l=>`<a href="${esc(l.u)}" style="display:inline-block;margin:3px;padding:7px 13px;border:1px solid ${A};border-radius:16px;color:${A};text-decoration:none;font-family:${F};">${esc(l.n)}</a>`).join(' ')}</p>`),
 footer:b=>`<tr><td style="background:${T.bg};padding:20px 28px;font-family:${F};font-size:12px;line-height:1.5;color:${X};text-align:center;opacity:.85;">${esc(b.text)}<br>${esc(b.addr)}<br>${esc(b.unsub)}</td></tr>`};
 const rows=iss.blocks.map(b=>R[b.t]?R[b.t](b):'').join('\n');
 if(opt.rowsOnly)return iss.blocks.map(b=>R[b.t]?R[b.t](b):'');
 return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(iss.name)}</title></head>\n<body style="margin:0;padding:0;background:${T.bg};">\n<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${T.bg};"><tr><td align="center" style="padding:20px 8px;">\n<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${P};border-radius:10px;overflow:hidden;">\n${rows}\n</table>\n</td></tr></table>\n</body></html>`}
function chunk(a,n){const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o}
// ---------- writing helper ----------
const HW={topic:['news','update','celebration','season','journey','community','family','team','term','month'],adj:['Big','Bright','Happy','Busy','Wonderful','Exciting','Cosy','Bold','Joyful','Fresh']};
function pick(a){return a[(Math.random()*a.length)|0]}
function headlines(topic,tone){topic=(topic||'our news').trim();const T=topic.replace(/^\w/,ch=>ch.toUpperCase());const P={Friendly:[`${pick(HW.adj)} News: ${T}`,`What\u2019s New With ${T}`,`${T}: Here\u2019s the Latest`,`Catch Up on ${T}`,`A Little Note About ${T}`],
 Exciting:[`Big News! ${T} Is Here`,`You Won\u2019t Believe ${T}!`,`${T}: The Moment We\u2019ve Waited For`,`Get Ready for ${T}`,`It\u2019s Happening: ${T}`],
 Warm:[`With Love: ${T}`,`From Our Hearts: ${T}`,`Grateful for ${T}`,`${T}, Together`,`A Season of ${T}`],
 Professional:[`${T}: Key Updates`,`Your ${T} Briefing`,`${T} at a Glance`,`Inside ${T}`,`${T}: What You Need to Know`],
 Faith:[`Blessed by ${T}`,`${T}: Walking in Grace`,`Giving Thanks for ${T}`,`${T} and the Joy of Fellowship`,`Faith, Hope and ${T}`]};
 return (P[tone]||P.Friendly).sort(()=>Math.random()-.5)}
function intros(topic,tone,aud){topic=(topic||'our news').trim();aud=(aud||'friends').trim();const P={Friendly:[`Hi ${aud}! We\u2019ve got lots to share about ${topic} this time, so grab a cuppa and settle in.`,`Hello ${aud}, welcome to the latest issue. Here\u2019s a quick catch-up on ${topic} and what\u2019s coming next.`],
 Exciting:[`Hold on to your hats, ${aud}! ${topic.replace(/^\w/,ch=>ch.toUpperCase())} is bigger than ever and we can\u2019t wait to tell you all about it.`,`It\u2019s finally here, ${aud}: everything you need to know about ${topic}, in one place.`],
 Warm:[`Dear ${aud}, thank you for being part of ${topic}. This issue is full of the moments that made us smile.`,`To all our ${aud}: ${topic} wouldn\u2019t be the same without you. Here\u2019s what we\u2019ve been up to.`],
 Professional:[`Dear ${aud}, this issue covers the latest on ${topic}, including key dates and next steps.`,`Welcome to this edition. Below you\u2019ll find a summary of ${topic} and the actions that matter to ${aud}.`],
 Faith:[`Dear ${aud}, we give thanks for ${topic} and for each of you. May this issue bring you encouragement.`,`Grace and peace to you, ${aud}. Here is our news on ${topic}, with hearts full of thanks.`]};return P[tone]||P.Friendly}
// ---------- image crop/resize ----------
let cropCB=null,cropImg=null;
function pickImage(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{cropImg=im;cropCB=cb;tab0=tab;tab='crop';draw()};im.src=r.result};r.readAsDataURL(f)};i.click()}
let tab0='edit',CR={ratio:'free',zoom:1,x:.5,y:.5,w:800};
function cropRender(prev){const im=cropImg;if(!im)return null;const rs={free:im.width/im.height,'1:1':1,'16:9':16/9,'4:3':4/3,'3:2':1.5,'2:1':2};const ar=rs[CR.ratio];
 let sw=im.width/CR.zoom,sh=sw/ar;if(sh>im.height/CR.zoom){sh=im.height/CR.zoom;sw=sh*ar}const sx=(im.width-sw)*CR.x,sy=(im.height-sh)*CR.y;const W=prev?400:Math.max(50,Math.min(2000,CR.w|0)),H=Math.round(W/ar);
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,W,H);return cv}
window.NL_cropTest=(src,cb)=>{const im=new Image();im.onload=()=>{cropImg=im;cropCB=cb;tab0=tab;tab='crop';draw()};im.src=src};
// ---------- exports ----------
function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const fname=()=>(cur.name||'newsletter').replace(/[^\w-]+/g,'-').toLowerCase();
function lockHTML(){if(D){window.demoEnd('Email-ready HTML export and copy-to-clipboard are in the full version of <b>Coffeebreak Newsletter Maker</b>, along with all 12 templates. The demo can still export PDF and PNG.');return true}}
function exportHTML(){if(lockHTML())return;dl(fname()+'.html',new Blob([emailHTML(cur)],{type:'text/html'}));say('📧 Email-ready HTML downloaded.')}
async function copyHTML(){if(lockHTML())return;const h=emailHTML(cur);try{await navigator.clipboard.writeText(h);say('📋 HTML copied to clipboard.')}catch(e){const t=document.createElement('textarea');t.value=h;document.body.appendChild(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();say(ok?'📋 HTML copied to clipboard.':'Copy blocked by the browser. Use Download HTML instead.')}}
function exportPDF(){const f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(emailHTML(cur).replace('</head>','<style>@page{margin:10mm}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head>'));d.close();
 setTimeout(()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){}say('🖨️ Choose "Save as PDF" in the print dialog.');setTimeout(()=>f.remove(),60000)},400)}
async function renderPNG(){const W=640;const host=document.createElement('iframe');host.style.cssText='position:fixed;left:-9999px;top:0;width:'+W+'px;height:600px;border:0';document.body.appendChild(host);const d=host.contentDocument;d.open();d.write(emailHTML(cur));d.close();
 await new Promise(r=>setTimeout(r,250));await Promise.all([...d.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));const H=Math.ceil(d.documentElement.scrollHeight);
 const xml=new XMLSerializer().serializeToString(d.body);host.remove();
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px">${xml.replace(/^<body[^>]*>|<\/body>$/g,'')}</div></foreignObject></svg>`;
 const im=new Image();await new Promise((r,j)=>{im.onload=r;im.onerror=j;im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)});
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;const g=cv.getContext('2d');g.scale(2,2);g.fillStyle=cur.theme.bg;g.fillRect(0,0,W,H);g.drawImage(im,0,0);return cv}
async function exportPNG(){try{const cv=await renderPNG();cv.toBlob(b=>{dl(fname()+'.png',b);say('🖼️ PNG downloaded.')},'image/png')}catch(e){say('PNG export failed: '+e.message)}}
// ---------- library ----------
function saveLib(){const copy=JSON.parse(JSON.stringify(cur));copy.saved=Date.now();LIB=LIB.filter(x=>x.id!==cur.id);LIB.unshift(copy);try{localStorage.nlLib=JSON.stringify(LIB);say('💾 Saved "'+cur.name+'" to your library.')}catch(e){LIB.shift();say('Storage is full. Try smaller images or delete old issues.')}G.score=LIB.length}
// ---------- UI ----------
function field(path,label,val,type){if(type==='area')return `<label>${label}</label><textarea data-f="${path}">${esc(val)}</textarea>`;if(type==='range')return `<label>${label} (${val}%)</label><input type="range" min="20" max="100" data-f="${path}" value="${val}">`;
 if(Array.isArray(type))return `<label>${label}</label><select data-f="${path}">${type.map(o=>`<option${o==val?' selected':''}>${o}</option>`).join('')}</select>`;return `<label>${label}</label><input data-f="${path}" value="${esc(val)}">`}
function inspector(){if(sel<0||!cur.blocks[sel])return `<h3>Theme</h3>${field('theme.font','Font',cur.theme.font,Object.keys(FONTS))}<label>Theme preset</label><select id="nlTheme"><option>— pick —</option>${Object.keys(THEMES).map(k=>`<option>${k}</option>`).join('')}</select>
 ${['bg','paper','accent','text'].map(k=>`<label>${{bg:'Background',paper:'Paper',accent:'Accent',text:'Text'}[k]} colour</label><input type="color" data-f="theme.${k}" value="${cur.theme[k]}">`).join('')}<p class="note">Click a block to edit it. Drag blocks from the left, or drag blocks to reorder.</p>`;
 const b=cur.blocks[sel],P='b.';let h=`<h3>${BL[b.t]}</h3>`;
 if(b.t==='header')h+=field(P+'title','Title',b.title)+field(P+'sub','Subtitle',b.sub)+field(P+'align','Align',b.align,['left','center','right'])+`<label>Banner image</label><button data-a="img" data-k="img">📷 Upload & crop</button>${b.img?'<button data-a="noimg" data-k="img">✖ Remove</button>':''}`;
 if(b.t==='text')h+=field(P+'title','Heading',b.title)+field(P+'body','Text',b.body,'area')+field(P+'align','Align',b.align,['left','center','right'])+`<button data-a="tohelp">✨ Writing helper</button>`;
 if(b.t==='image')h+=`<button data-a="img" data-k="src">📷 Upload & crop</button>`+field(P+'w','Width',b.w,'range')+field(P+'cap','Caption',b.cap)+field(P+'link','Link (optional)',b.link);
 if(b.t==='two')h+=['l','r'].map(s=>`<b>${s==='l'?'Left':'Right'}</b>`+field(P+s+'.title','Heading',b[s].title)+field(P+s+'.body','Text',b[s].body,'area')+`<button data-a="img" data-k="${s}.img">📷 Image</button>`).join('');
 if(b.t==='button')h+=field(P+'label','Label',b.label)+field(P+'url','Link',b.url)+field(P+'align','Align',b.align,['left','center','right']);
 if(b.t==='divider')h+=field(P+'style','Line',b.style,['solid','dashed','dotted','double'])+field(P+'emoji','Or emoji row (leave blank for line)',b.emoji);
 if(b.t==='events')h+=field(P+'title','Heading',b.title)+b.items.map((e,i)=>`<div class="card">${field(P+'items.'+i+'.d','Date',e.d)+field(P+'items.'+i+'.n','Event',e.n)+field(P+'items.'+i+'.w','Time & place',e.w)}<button data-a="delitem" data-i="${i}">✖</button></div>`).join('')+`<button data-a="additem">➕ Add event</button>`;
 if(b.t==='quote')h+=field(P+'q','Quote',b.q,'area')+field(P+'by','By',b.by);
 if(b.t==='gallery')h+=field(P+'cols','Columns',b.cols,[2,3,4])+`<button data-a="gimg">📷 Add photo</button><div>${b.imgs.map((s,i)=>`<img src="${s}" style="width:60px;height:60px;object-fit:cover;margin:2px;border-radius:4px"><button data-a="gdel" data-i="${i}">✖</button>`).join('')}</div>`;
 if(b.t==='social')h+=b.links.map((l,i)=>`<div class="card">${field(P+'links.'+i+'.n','Name',l.n)+field(P+'links.'+i+'.u','Link',l.u)}<button data-a="dellink" data-i="${i}">✖</button></div>`).join('')+`<button data-a="addlink">➕ Add link</button>`;
 if(b.t==='footer')h+=field(P+'text','Message',b.text,'area')+field(P+'addr','Address',b.addr)+field(P+'unsub','Unsubscribe line',b.unsub);
 return h+`<p><button data-a="desel">← Theme settings</button></p>`}
function editor(){const rows=emailHTML(cur,{rowsOnly:true});const T=cur.theme;
 return `<div class="row"><label>Issue name <input id="nlName" value="${esc(cur.name)}"></label> <button data-a="save">💾 Save to library</button> <button data-a="new">🆕 New from template</button></div>
 <div class="ed"><div class="pal"><b>Blocks</b><p class="note">Drag onto the page or tap to add</p>${Object.keys(B).map(k=>`<div draggable="true" data-add="${k}">${BL[k]}</div>`).join('')}</div>
 <div class="canvas" id="nlCanvas" style="background:${T.bg}"><div style="max-width:600px;margin:auto;background:${T.paper};border-radius:10px;overflow:hidden">${cur.blocks.map((b,i)=>`<div class="blk${i===sel?' sel':''}" draggable="true" data-i="${i}"><div class="tools"><button data-a="up" data-i="${i}">▲</button><button data-a="down" data-i="${i}">▼</button><button data-a="dup" data-i="${i}">⧉</button><button data-a="del" data-i="${i}">🗑</button></div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows[i]||'<tr><td style="padding:14px;color:#999;font-family:Georgia;text-align:center">'+BL[b.t]+' (empty: add an image)</td></tr>'}</table></div>`).join('')}<div class="blk" data-i="${cur.blocks.length}" style="min-height:40px;text-align:center;color:#999;padding:10px;font-size:13px">Drop blocks here</div></div></div>
 <div class="insp card">${inspector()}</div></div>`}
function templates(){return `<h2>Pick a template</h2><p class="note">12 original designs. Everything is editable.${D?' The demo includes the first 3 templates.':''}</p><div class="grid">${TPL.map((t,i)=>{const th=THEMES[t[2]];const lk=D&&i>=DEMO_TPL;return `<div class="tpl${lk?' lock':''}" data-tpl="${i}"><div class="sw" style="background:linear-gradient(135deg,${t[3]},${t[4]})">${t[1]}</div><div style="padding:6px"><b>${t[0]}</b>${lk?' 🔒':''}<br><span class="note">${t[2]} theme · ${t[5].length} blocks</span></div></div>`}).join('')}</div>`}
function helper(){return `<h2>✨ Writing helper</h2><p class="note">Idea generators made from built-in templates. No cloud AI, nothing leaves your device.</p><div class="card"><div class="row"><label>Topic <input id="hTopic" value="${esc(helper.topic||'our spring fair')}"></label> <label>Readers <input id="hAud" value="${esc(helper.aud||'friends')}"></label> <label>Tone <select id="hTone">${['Friendly','Exciting','Warm','Professional','Faith'].map(t=>`<option${t===helper.tone?' selected':''}>${t}</option>`).join('')}</select></label></div>
 <button data-a="hl">🎲 Headline ideas</button> <button data-a="in">🎲 Intro ideas</button><div id="hOut">${helper.out||''}</div><p class="note">Tap an idea to use it: headlines go into the header, intros into the first text block.</p></div>`}
function preview(){return `<h2>Preview</h2><div class="row"><button data-pv="desktop" class="${pv==='desktop'?'on':''}">🖥️ Desktop</button><button data-pv="mobile" class="${pv==='mobile'?'on':''}">📱 Mobile</button></div><iframe id="nlPv" style="width:${pv==='mobile'?375:760}px;height:640px;max-width:100%"></iframe>`}
function exportTab(){return `<h2>Export</h2><div class="card"><button data-a="html">📧 Download email-ready HTML${D?' 🔒':''}</button> <button data-a="copy">📋 Copy HTML${D?' 🔒':''}</button><p class="note">Table layout with inline CSS that works in Gmail, Outlook and Apple Mail. Paste it into your email tool's "HTML" or "code" option. Images you upload are embedded in the file, and some email services block embedded images, so for big lists host your images online and swap in the links.</p></div>
 <div class="card"><button data-a="pdf">🖨️ PDF (print dialog)</button> <button data-a="png">🖼️ Download PNG</button><p class="note">For PDF, pick "Save as PDF" as the printer.</p></div>`}
function library(){return `<h2>📚 Your issues</h2><p class="note">Saved on this device only.</p><button data-a="save">💾 Save current issue</button><div class="grid">${LIB.map((x,i)=>`<div class="tpl"><div class="sw" style="background:${x.theme.accent};color:${x.theme.paper};font-size:18px;padding:6px">${esc(x.name)}</div><div style="padding:6px"><span class="note">${x.tpl||''} · ${new Date(x.saved).toLocaleDateString('en-AU')}</span><br><button data-open="${i}">Open</button><button data-dupl="${i}">⧉</button><button data-dell="${i}">🗑</button></div></div>`).join('')||'<p>No saved issues yet.</p>'}</div>`}
function cropTab(){return `<h2>✂️ Crop & resize</h2><div class="row"><label>Shape <select data-c="ratio">${['free','1:1','16:9','4:3','3:2','2:1'].map(r=>`<option${r===CR.ratio?' selected':''}>${r}</option>`).join('')}</select></label><label>Zoom <input type="range" min="1" max="4" step=".05" data-c="zoom" value="${CR.zoom}"></label><label>Left/right <input type="range" min="0" max="1" step=".01" data-c="x" value="${CR.x}"></label><label>Up/down <input type="range" min="0" max="1" step=".01" data-c="y" value="${CR.y}"></label><label>Output width (px) <input type="number" min="50" max="2000" data-c="w" value="${CR.w}" style="width:80px"></label></div><div id="crPv"></div><button data-a="cropok">✅ Use image</button> <button data-a="cropno">Cancel</button>`}
function draw(){const tabs=[['tpl','🗂️ Templates'],['edit','✏️ Editor'],['help','✨ Writing helper'],['pv','👀 Preview'],['exp','📤 Export'],['lib','📚 Library']];
 R.innerHTML=`<h2>📰 Coffeebreak Newsletter Maker${D?' <small>(Demo)</small>':''}</h2><div class="tabs">${tabs.map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')}</div>`+({tpl:templates,edit:editor,help:helper,pv:preview,exp:exportTab,lib:library,crop:cropTab}[tab])();
 if(tab==='pv')document.getElementById('nlPv').srcdoc=emailHTML(cur);if(tab==='crop'){const cv=cropRender(true);if(cv){cv.style.maxWidth='100%';document.getElementById('crPv').appendChild(cv)}}saveCur()}
function setPath(o,p,v){const k=p.split('.');let t=o;for(let i=0;i<k.length-1;i++)t=t[k[i]];const last=k[k.length-1];t[last]=typeof t[last]==='number'?+v:v}
R.addEventListener('input',e=>{const t=e.target;if(t.dataset.f){const p=t.dataset.f;if(p.startsWith('b.'))setPath(cur.blocks[sel],p.slice(2),t.value);else setPath(cur,p,t.value);saveCur();if(t.tagName!=='TEXTAREA'&&t.type!=='text'&&t.tagName!=='INPUT'||t.type==='color'||t.type==='range'){draw()}else{clearTimeout(draw.t);draw.t=setTimeout(()=>{const a=document.activeElement,f=a&&a.dataset.f,s=a&&a.selectionStart;draw();const n=f&&R.querySelector(`[data-f="${f}"]`);if(n){n.focus();try{n.setSelectionRange(s,s)}catch(_){}}},500)}}
 if(t.id==='nlName'){cur.name=t.value;saveCur()}if(t.dataset.c){CR[t.dataset.c]=t.dataset.c==='ratio'?t.value:+t.value;const pvv=document.getElementById('crPv');pvv.innerHTML='';const cv=cropRender(true);cv.style.maxWidth='100%';pvv.appendChild(cv)}});
R.addEventListener('change',e=>{const t=e.target;if(t.id==='nlTheme'&&THEMES[t.value]){cur.theme=Object.assign({},THEMES[t.value]);draw()}if(t.tagName==='SELECT'&&t.dataset.f)draw()});
let dragAdd=null,dragFrom=-1;
R.addEventListener('dragstart',e=>{const t=e.target;if(t.dataset.add){dragAdd=t.dataset.add;dragFrom=-1}else if(t.classList&&t.classList.contains('blk')){dragFrom=+t.dataset.i;dragAdd=null}try{e.dataTransfer.setData('text/plain','x')}catch(_){}});
R.addEventListener('dragover',e=>{const b=e.target.closest&&e.target.closest('.blk');if(b){e.preventDefault();R.querySelectorAll('.over').forEach(x=>x.classList.remove('over'));b.classList.add('over')}});
R.addEventListener('drop',e=>{const b=e.target.closest&&e.target.closest('.blk');if(!b)return;e.preventDefault();let to=+b.dataset.i;if(dragAdd){cur.blocks.splice(to,0,mk(dragAdd));sel=to}else if(dragFrom>=0){const [m]=cur.blocks.splice(dragFrom,1);if(to>dragFrom)to--;cur.blocks.splice(to,0,m);sel=to}dragAdd=null;dragFrom=-1;draw()});
window.NL_move=(from,to)=>{const [m]=cur.blocks.splice(from,1);cur.blocks.splice(to,0,m);draw()};
R.addEventListener('click',e=>{const t=e.target.closest('[data-tab],[data-a],[data-tpl],[data-add],[data-pv],[data-open],[data-dupl],[data-dell],.chip,.blk');if(!t)return;
 if(t.dataset.tab){tab=t.dataset.tab;draw();return}if(t.dataset.pv){pv=t.dataset.pv;draw();return}
 if(t.dataset.tpl!==undefined){const i=+t.dataset.tpl;if(D&&i>=DEMO_TPL){window.demoEnd('All 12 templates are in the full version of <b>Coffeebreak Newsletter Maker</b>, plus email-ready HTML export.');return}cur=fromTpl(i);sel=-1;tab='edit';say('Started a new '+TPL[i][0]+' issue.');draw();return}
 if(t.dataset.add&&!t.dataset.a){cur.blocks.splice(Math.max(0,cur.blocks.length-(cur.blocks.at(-1)&&cur.blocks.at(-1).t==='footer'?1:0)),0,mk(t.dataset.add));sel=cur.blocks.findIndex(b=>b.t===t.dataset.add&&b===cur.blocks.filter(x=>x.t===t.dataset.add).at(-1));draw();return}
 if(t.dataset.open!==undefined){cur=JSON.parse(JSON.stringify(LIB[+t.dataset.open]));sel=-1;tab='edit';draw();return}
 if(t.dataset.dupl!==undefined){const x=JSON.parse(JSON.stringify(LIB[+t.dataset.dupl]));x.id=Date.now()+'';x.name+=' (copy)';x.saved=Date.now();LIB.unshift(x);try{localStorage.nlLib=JSON.stringify(LIB)}catch(_){}draw();return}
 if(t.dataset.dell!==undefined){if(!confirm('Delete this issue from your library?'))return;LIB.splice(+t.dataset.dell,1);localStorage.nlLib=JSON.stringify(LIB);draw();return}
 if(t.classList.contains('chip')){const v=t.textContent;if(t.dataset.k==='hl'){const h=cur.blocks.find(b=>b.t==='header');if(h)h.title=v;else cur.blocks.unshift(mk('header',{title:v}))}else{const x=cur.blocks.find(b=>b.t==='text');if(x)x.body=v;else cur.blocks.splice(1,0,mk('text',{body:v}))}say('✅ Added to your newsletter.');return}
 const a=t.dataset.a,i=+t.dataset.i;
 if(!a&&t.classList.contains('blk')){const n=+t.dataset.i;if(n<cur.blocks.length){sel=n;draw()}return}
 const b=cur.blocks[sel];
 if(a==='up'&&i>0){[cur.blocks[i-1],cur.blocks[i]]=[cur.blocks[i],cur.blocks[i-1]];sel=i-1}
 if(a==='down'&&i<cur.blocks.length-1){[cur.blocks[i+1],cur.blocks[i]]=[cur.blocks[i],cur.blocks[i+1]];sel=i+1}
 if(a==='dup'){cur.blocks.splice(i+1,0,JSON.parse(JSON.stringify(cur.blocks[i])));sel=i+1}
 if(a==='del'){cur.blocks.splice(i,1);sel=-1}if(a==='desel')sel=-1;
 if(a==='additem')b.items.push({d:'Date',n:'Event',w:'Time · Place'});if(a==='delitem')b.items.splice(i,1);
 if(a==='addlink')b.links.push({n:'Link',u:'https://'});if(a==='dellink')b.links.splice(i,1);if(a==='gdel')b.imgs.splice(i,1);
 if(a==='img'){const k=t.dataset.k,blk=b;CR.ratio=blk.t==='image'||blk.t==='header'?'16:9':'4:3';pickImage(u=>setPath(blk,k,u));return}
 if(a==='noimg'){setPath(b,t.dataset.k,'')}
 if(a==='gimg'){const blk=b;CR.ratio='1:1';CR.w=500;pickImage(u=>blk.imgs.push(u));return}
 if(a==='cropok'){const cv=cropRender(false);if(cv&&cropCB)cropCB(cv.toDataURL('image/jpeg',.85));cropCB=null;tab='edit';say('🖼️ Image added.')}
 if(a==='cropno'){cropCB=null;tab='edit'}
 if(a==='tohelp'){tab='help'}
 if(a==='save'){saveLib()}if(a==='new'){tab='tpl'}
 if(a==='hl'||a==='in'){helper.topic=document.getElementById('hTopic').value;helper.aud=document.getElementById('hAud').value;helper.tone=document.getElementById('hTone').value;const L=a==='hl'?headlines(helper.topic,helper.tone):intros(helper.topic,helper.tone,helper.aud);helper.out=`<p>${L.map(s=>`<span class="chip" data-k="${a}">${esc(s)}</span>`).join(a==='hl'?' ':'<br>')}</p>`}
 if(a==='html'){exportHTML();return}if(a==='copy'){copyHTML();return}if(a==='pdf'){exportPDF();return}if(a==='png'){exportPNG();return}
 draw()});
window.NL={emailHTML:()=>emailHTML(cur),renderPNG,get cur(){return cur},get LIB(){return LIB},TPL,headlines,intros};
draw();
})();
function update(){}function draw(){}
