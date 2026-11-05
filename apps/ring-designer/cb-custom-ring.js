/* Coffeebreak Ring Designer: Custom wedding ring, upload your design.
   Everything stays in this browser (localStorage). No uploads to any server, no paid services. */
(function(){
var KEY='cbCustomRing',PAYID='Pay by PayID (Teachers Mutual Bank): darkokaz@gmx.com',MAILTO='darkokaz@gmx.com';
var LOGO='cb-plus-logo.png',MAXIMG=3;
var METALS=['Sterling silver','Yellow gold','Rose gold','White gold','Platinum','Palladium','Titanium','Tungsten','Stainless steel','Black rhodium','Champagne gold','Two-tone (tell us in notes)','Not sure yet'];
var STONES=['No stone','Diamond','Lab-grown diamond','Moissanite','Ruby','Sapphire','Emerald','Amethyst','Morganite','Aquamarine','Black diamond','Pink sapphire','Birthstone (tell us in notes)','Not sure yet'];
var SHAPES=['Not sure yet','Round','Princess (square)','Oval','Emerald cut','Pear','Heart','Marquise','Cushion','Channel set band','Pavé (small stones all round)'];
var TYPES=['Wedding band','Engagement ring','Matching pair (two rings)','Eternity ring','Other (tell us in notes)'];
var SIZES=['Not sure, please help me measure'];'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(l,i){SIZES.push('AU '+l);if(i<25)SIZES.push('AU '+l+'½')});
function ld(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
var st=Object.assign({imgs:[],type:TYPES[0],metal:'Yellow gold',size:SIZES[0],size2:'',stone:STONES[0],shape:SHAPES[0],width:'',engr:'',notes:'',name:'',contact:'',ref:''},ld());
if(!st.ref)st.ref='CR-'+Date.now().toString(36).toUpperCase();
function sv(){try{localStorage.setItem(KEY,JSON.stringify(st));return true}catch(e){return false}}
function esc(s){return String(s==null?'':s).replace(/[&"<>]/g,function(m){return{'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[m]})}
function opts(a,v){return a.map(function(x){return'<option'+(x==v?' selected':'')+'>'+esc(x)+'</option>'}).join('')}
var css=document.createElement('style');css.textContent=
'#cbCrBtn{background:#e8cea0!important;color:#1a0a10!important;font-weight:bold}'+
'#cbCr{position:fixed;inset:0;z-index:2147483600;background:rgba(10,3,6,.86);overflow:auto;-webkit-overflow-scrolling:touch;display:none;touch-action:pan-y}'+
'#cbCr .cr{max-width:760px;margin:14px auto 60px;background:#1e0b14;color:#ffe9c7;border:2px solid #e8cea0;border-radius:16px;padding:16px 18px;font:15px/1.45 Georgia,serif;box-sizing:border-box}'+
'#cbCr h2{color:#e8cea0;margin:0 0 4px;font-size:22px}#cbCr .sub{color:#d9b8c0;font-size:14px;margin:0 0 10px}'+
'#cbCr .hd{display:flex;gap:12px;align-items:center}#cbCr .hd img{height:54px;border-radius:10px}'+
'#cbCr label{display:block;font-size:13px;color:#d9b8c0;margin:8px 0 2px}#cbCr select,#cbCr input[type=text],#cbCr textarea{width:100%;box-sizing:border-box;background:#22101a;color:#ffe9c7;border:1px solid #e8cea0;border-radius:8px;padding:8px;font:15px Georgia,serif}'+
'#cbCr .g2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}@media(max-width:560px){#cbCr .g2{grid-template-columns:1fr}#cbCr .cr{margin:6px;padding:12px}}'+
'#cbCr button{background:#3a1424;color:#ffe9c7;border:1.5px solid #e8cea0;border-radius:10px;padding:8px 12px;font:15px Georgia,serif;cursor:pointer;margin:4px 4px 0 0}#cbCr button.pri{background:#e8cea0;color:#1a0a10;font-weight:bold}'+
'#cbCr .drop{border:2px dashed #e8a0b0;border-radius:12px;padding:14px;text-align:center;background:#170810;cursor:pointer}#cbCr .drop.on{background:#3a1424}'+
'#cbCr .thumbs{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}#cbCr .th{position:relative}#cbCr .th img{height:120px;max-width:200px;object-fit:contain;border-radius:10px;border:1px solid #5a2a3a;background:#fff}#cbCr .th button{position:absolute;top:2px;right:2px;margin:0;padding:2px 7px;font-size:13px}'+
'#cbCr pre{white-space:pre-wrap;background:#140810;border:1px solid #5a2a3a;border-radius:10px;padding:10px;font:13px/1.45 Georgia,serif;color:#ffe9c7}'+
'#cbCr .pay{background:#2a0f1c;border:1px solid #e8a0b0;border-radius:10px;padding:8px 10px;margin:10px 0;font-weight:bold;color:#ffcf6a}'+
'#cbCr .note{font-size:12px;color:#c9a0aa}#cbCr .rights{font:12px/1.4 system-ui,sans-serif;color:#c9a0aa;text-align:center;margin-top:14px}#cbCr .rights img{height:34px;display:block;margin:0 auto 4px;border-radius:6px}';
document.head.appendChild(css);
var M=document.createElement('div');M.id='cbCr';M.setAttribute('role','dialog');M.setAttribute('aria-label','Custom wedding ring: upload your design');document.body.appendChild(M);
function summary(){var L=['Coffeebreak custom ring request '+st.ref,'Ring type: '+st.type,'Metal: '+st.metal,'Size: '+st.size+(st.size2?' / second ring: '+st.size2:''),'Stone: '+st.stone+(st.stone!='No stone'?', shape: '+st.shape:''),'Band width: '+(st.width||'not set'),'Engraving: '+(st.engr||'(none)'),'Notes: '+(st.notes||'(none)'),'My design: '+(st.imgs.length?st.imgs.length+' image'+(st.imgs.length>1?'s':'')+' (attached to this email)':'no image yet'),'Name: '+(st.name||'(not given)'),'Contact: '+(st.contact||'(not given)'),'','Payment: '+PAYID,'Use reference '+st.ref+' when you pay. Please wait for your quote before paying.'];return L.join('\n')}
function render(){
M.innerHTML='<div class="cr"><div class="hd"><img src="'+LOGO+'" alt="Coffeebreak logo" onerror="this.remove()"><div><h2>💍 Custom wedding ring: upload your design</h2><p class="sub">Have a photo or sketch of the ring you want? Upload it, choose your metal, size and stone, and send us your order request. We will reply with a quote.</p></div></div>'+
'<div class="drop" id="crDrop" tabindex="0">📷 <b>Upload a photo or sketch</b><br><span class="note">Tap to choose an image or drop it here. Up to '+MAXIMG+' images. Your images stay on this device only.</span><input type="file" id="crFile" accept="image/*" multiple hidden></div><div class="thumbs" id="crTh"></div><p class="note" id="crMsg"></p>'+
'<div class="g2"><div><label>Ring type<select id="crType">'+opts(TYPES,st.type)+'</select></label></div><div><label>Metal<select id="crMetal">'+opts(METALS,st.metal)+'</select></label></div>'+
'<div><label>Ring size<select id="crSize">'+opts(SIZES,st.size)+'</select></label></div><div><label>Second ring size (for a matching pair)<select id="crSize2"><option value="">Not needed</option>'+opts(SIZES,st.size2)+'</select></label></div>'+
'<div><label>Stone<select id="crStone">'+opts(STONES,st.stone)+'</select></label></div><div><label>Stone shape<select id="crShape">'+opts(SHAPES,st.shape)+'</select></label></div>'+
'<div><label>Band width (for example 4 mm)<input type="text" id="crWidth" maxlength="20" value="'+esc(st.width)+'"></label></div><div><label>Engraving<input type="text" id="crEngr" maxlength="40" value="'+esc(st.engr)+'"></label></div></div>'+
'<label>Notes (anything else about your design)<textarea id="crNotes" rows="3" maxlength="1500">'+esc(st.notes)+'</textarea></label>'+
'<div class="g2"><div><label>Your name<input type="text" id="crName" maxlength="80" autocomplete="name" value="'+esc(st.name)+'"></label></div><div><label>Email or phone<input type="text" id="crContact" maxlength="120" autocomplete="email" value="'+esc(st.contact)+'"></label></div></div>'+
'<div><button id="crFrom">💍 Copy settings from my 3D ring</button></div>'+
'<h3 style="color:#e8cea0;margin:14px 0 4px">Your order summary</h3><pre id="crSum"></pre>'+
'<div class="pay">'+esc(PAYID)+'</div><p class="note">Nothing is charged by this app. Every custom ring is made to order, so you will get a quote first. Pay only after you accept the quote.</p>'+
'<div><button class="pri" id="crMail">✉️ Email my order</button><button id="crCopy">📋 Copy summary</button><button id="crSheet">🖼️ Save order sheet (image)</button><button id="crNew">Start again</button><button id="crClose">Close</button></div>'+
'<p class="note">Email my order opens your own email app. Attach your photo or the saved order sheet before you send.</p>'+
'<div class="rights"><img src="'+LOGO+'" alt="Coffeebreak logo" onerror="this.remove()">© Karen O\'Brien (Coffeebreak). Karen O\'Brien keeps all rights to this app, its designs, name and logo. Buyers may resell the physical item they bought but may not copy it or make their own version.</div></div>';
var g=function(i){return M.querySelector('#'+i)};
thumbs();upd();
var map={crType:'type',crMetal:'metal',crSize:'size',crSize2:'size2',crStone:'stone',crShape:'shape',crWidth:'width',crEngr:'engr',crNotes:'notes',crName:'name',crContact:'contact'};
Object.keys(map).forEach(function(id){var e=g(id);['input','change'].forEach(function(ev){e.addEventListener(ev,function(){st[map[id]]=e.value;sv();upd()})})});
var f=g('crFile'),d=g('crDrop');d.onclick=function(){f.click()};d.onkeydown=function(e){if(e.key=='Enter'||e.key==' '){e.preventDefault();f.click()}};
f.onchange=function(){add(f.files);f.value=''};
d.ondragover=function(e){e.preventDefault();d.classList.add('on')};d.ondragleave=function(){d.classList.remove('on')};d.ondrop=function(e){e.preventDefault();d.classList.remove('on');add(e.dataTransfer.files)};
g('crFrom').onclick=fromRD;g('crClose').onclick=close;
g('crCopy').onclick=function(){var t=summary();try{navigator.clipboard.writeText(t)}catch(e){}g('crCopy').textContent='✅ Copied'};
g('crMail').onclick=function(){location.href='mailto:'+MAILTO+'?subject='+encodeURIComponent('Custom ring order request '+st.ref)+'&body='+encodeURIComponent(summary())};
g('crSheet').onclick=function(){sheet(function(u){var a=document.createElement('a');a.href=u;a.download='coffeebreak-custom-ring-'+st.ref+'.png';document.body.appendChild(a);a.click();a.remove()})};
g('crNew').onclick=function(){if(!confirm('Clear this custom ring request and its images?'))return;st={imgs:[],type:TYPES[0],metal:'Yellow gold',size:SIZES[0],size2:'',stone:STONES[0],shape:SHAPES[0],width:'',engr:'',notes:'',name:st.name,contact:st.contact,ref:'CR-'+Date.now().toString(36).toUpperCase()};sv();render()};
}
function msg(t){var e=M.querySelector('#crMsg');if(e)e.textContent=t||''}
function upd(){var e=M.querySelector('#crSum');if(e)e.textContent=summary();window.CB_CUSTOM_RING_SUMMARY=summary()}
function thumbs(){var e=M.querySelector('#crTh');if(!e)return;e.innerHTML=st.imgs.map(function(u,i){return'<div class="th"><img src="'+u+'" alt="My ring design '+(i+1)+'"><button data-i="'+i+'" title="Remove">✕</button></div>'}).join('');
[].forEach.call(e.querySelectorAll('button'),function(b){b.onclick=function(){st.imgs.splice(+b.dataset.i,1);sv();thumbs();upd()}})}
function add(files){var a=[].slice.call(files||[]).filter(function(x){return/^image\//.test(x.type)});if(!a.length){msg('Please choose an image file (photo or sketch).');return}
a.slice(0,Math.max(0,MAXIMG-st.imgs.length)).forEach(function(file){shrink(file,function(u){if(!u){msg('Sorry, that image could not be opened. Try a JPG or PNG.');return}st.imgs.push(u);if(!sv()){st.imgs.pop();msg('This device is out of space for more images. Remove one and try again.');}else msg('Image added. It is saved on this device only.');thumbs();upd()})});
if(st.imgs.length+a.length>MAXIMG)msg('Up to '+MAXIMG+' images. Remove one to add another.')}
function shrink(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=1000,w=im.width,h=im.height,k=Math.min(1,m/Math.max(w,h));var c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);var q=c.getContext('2d');q.fillStyle='#fff';q.fillRect(0,0,c.width,c.height);q.drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.82))};im.onerror=function(){cb(null)};im.src=r.result};r.onerror=function(){cb(null)};r.readAsDataURL(file)}
function fromRD(){var R=window.RD;if(!R||!R.S){msg('Open the 3D designer first.');return}var S=R.S,mm={silver:'Sterling silver',gold:'Yellow gold',rose:'Rose gold',white:'White gold',platinum:'Platinum',palladium:'Palladium',titanium:'Titanium',tungsten:'Tungsten',steel:'Stainless steel',black:'Black rhodium',champ:'Champagne gold'};
st.metal=mm[S.metal]||'Not sure yet';st.size='AU '+S.size;st.width=S.width+' mm';if(S.eOut||S.eIn)st.engr=[S.eOut,S.eIn].filter(Boolean).join(' / ');
if(S.gem&&S.gem!='none'){st.stone=STONES.indexOf(S.gcol)>=0?S.gcol:'Not sure yet'}
st.notes=(st.notes?st.notes+'\n':'')+'Based on my 3D design'+(R.text?' ('+(R.text().match(/Design ID: (\S+)/)||['',''])[1]+')':'')+'.';sv();render();msg('Copied your 3D ring settings.')}
function sheet(cb){var W=1400,H=900,c=document.createElement('canvas');c.width=W;c.height=H;var q=c.getContext('2d');q.fillStyle='#1a0a12';q.fillRect(0,0,W,H);
var lg=new Image();lg.onload=go;lg.onerror=go;lg.src=LOGO;var done=0;
function go(){if(done++)return;try{if(lg.width)q.drawImage(lg,W-130,20,100,100*lg.height/lg.width)}catch(e){}
q.fillStyle='#e8cea0';q.font='bold 40px Georgia';q.fillText('💍 Coffeebreak custom ring request',30,62);
var x=30,y=100,n=st.imgs.length,ims=st.imgs.map(function(u){var i=new Image();i.src=u;return i}),left=n;
function txt(){q.fillStyle='#ffe9c7';q.font='20px Georgia';var yy=110;summary().split('\n').forEach(function(l){wrap(l,760,yy,600,28).forEach(function(){});yy=wrap.y+6});
q.fillStyle='#c9a0aa';q.font='14px system-ui,sans-serif';q.fillText('© Karen O\'Brien (Coffeebreak). Karen O\'Brien keeps all rights to this app, its designs, name and logo.',30,H-20);cb(c.toDataURL('image/png'))}
function wrap(t,x0,y0,mw,lh){var w=t.split(' '),line='',yy=y0;w.forEach(function(s){var tt=line?line+' '+s:s;if(q.measureText(tt).width>mw&&line){q.fillText(line,x0,yy);yy+=lh;line=s}else line=tt});q.fillText(line,x0,yy);wrap.y=yy+lh;return[]}
if(!n){q.fillStyle='#c9a0aa';q.font='22px Georgia';q.fillText('No design image uploaded',60,300);return txt()}
ims.forEach(function(im,i){function dr(){var bw=700,bh=n==1?720:(720-(n-1)*10)/n,k=Math.min(bw/im.width,bh/im.height)||1,yy=y+i*(bh+10);q.fillStyle='#fff';q.fillRect(x,yy,bw,bh);try{q.drawImage(im,x+(bw-im.width*k)/2,yy+(bh-im.height*k)/2,im.width*k,im.height*k)}catch(e){}if(--left==0)txt()}if(im.complete&&im.naturalWidth)dr();else{im.onload=dr;im.onerror=function(){if(--left==0)txt()}}})}}
function open(){render();M.style.display='block';M.scrollTop=0;try{window.CB&&CB.trophy&&CB.trophy('customring','💍 Dream Ring – started a custom ring request')}catch(e){}}
function close(){M.style.display='none'}
M.addEventListener('click',function(e){if(e.target===M)close()});addEventListener('keydown',function(e){if(e.key=='Escape'&&M.style.display=='block')close()});
['pointerdown','touchstart','wheel','keydown'].forEach(function(ev){M.addEventListener(ev,function(e){e.stopPropagation()})});
window.CB_CUSTOM_RING={open:open,close:close,summary:summary,state:function(){return st}};
function mkBtn(){var b=document.createElement('button');b.textContent='💍 Custom ring: upload your design';b.className='cbCrOpen';b.onclick=open;return b}
function bar(){var B=document.getElementById('bar');if(B&&!document.getElementById('cbCrBtn')){var b=mkBtn();b.id='cbCrBtn';var t=B.querySelector('b');t&&t.nextSibling?B.insertBefore(b,t.nextSibling):B.appendChild(b)}}
function card(){var P=document.getElementById('rdP');if(!P)return;var cards=P.querySelectorAll('.card');var oc=null;[].forEach.call(cards,function(c){if(/Save & order/.test(c.textContent))oc=c});if(oc&&!oc.querySelector('.cbCrOpen')){var d=oc.querySelector('div');(d||oc).appendChild(mkBtn())}}
function init(){bar();card();var P=document.getElementById('rdP');if(P)new MutationObserver(card).observe(P,{childList:true});if(/[?#&]customring/.test(location.href))open()}
if(document.readyState=='loading')addEventListener('DOMContentLoaded',init);else init();setTimeout(init,800);
})();
