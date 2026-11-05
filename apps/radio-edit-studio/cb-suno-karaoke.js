/* Coffeebreak all-songs karaoke + player: every public Coffeebreak Suno song with its lyrics, plus play any song from your device */
(function(){
var me=document.currentScript,base=(me&&me.src||'').replace(/[^\/]*$/,'')+'suno/';
var title=(me&&me.getAttribute('data-title'))||'All Coffeebreak songs + lyrics';
var IDX=null,CH={},list=[],cur=-1,shuffle=false,upl=[];
var css='#cbsk-btn{position:fixed;left:12px;bottom:12px;z-index:99990;font:700 17px system-ui;padding:12px 16px;border-radius:24px;border:0;background:#c2185b;color:#fff;box-shadow:0 2px 8px #0005;cursor:pointer}'+
'#cbsk{position:fixed;inset:0;z-index:2147483000;background:#1b1020;color:#fff;font:18px/1.45 system-ui;display:none;flex-direction:column}'+
'#cbsk.on{display:flex}#cbsk header{display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px}'+
'#cbsk input[type=search]{flex:1;min-width:160px;font-size:18px;padding:10px;border-radius:10px;border:0}'+
'#cbsk button,#cbsk label.b{font:600 16px system-ui;padding:9px 12px;border-radius:10px;border:0;background:#f8bbd0;color:#3a0a20;cursor:pointer}'+
'#cbsk .body{flex:1;display:flex;min-height:0}#cbsk .songs{width:38%;overflow:auto;border-right:1px solid #fff3}'+
'#cbsk .songs div{padding:9px 12px;border-bottom:1px solid #fff1;cursor:pointer}#cbsk .songs div.cur{background:#c2185b}'+
'#cbsk .songs small{opacity:.7;display:block;font-size:13px}#cbsk .ly{flex:1;overflow:auto;padding:16px 20px;text-align:center}'+
'#cbsk .ly p{margin:4px 0;font-size:24px;opacity:.55;transition:.3s}#cbsk .ly p.tag{font-size:15px;opacity:.5;font-style:italic}#cbsk .ly p.now{opacity:1;color:#ffd54f;transform:scale(1.06)}'+
'#cbsk audio{width:100%}#cbsk .np{padding:6px 12px;font-weight:700}'+
'@media(max-width:760px){#cbsk .body{flex-direction:column}#cbsk .songs{width:auto;height:34%;border-right:0;border-bottom:1px solid #fff3}#cbsk .ly p{font-size:21px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var b=document.createElement('button');b.id='cbsk-btn';b.textContent='🎤 '+title;b.setAttribute('aria-label',title);
var P=document.createElement('div');P.id='cbsk';P.setAttribute('role','dialog');
P.innerHTML='<header><input type=search placeholder="Search songs or lyrics" aria-label="Search songs"><label class=b><input type=checkbox id=cbsk-clean> Clean only</label>'+
'<button id=cbsk-shuf>Shuffle: off</button><label class=b>Play my own song<input type=file accept="audio/*" multiple hidden id=cbsk-up></label><button id=cbsk-rec>⏺ Record me</button><a id=cbsk-dl class=b hidden download="my-coffeebreak-recording.webm">Save my recording</a><button id=cbsk-x>Close</button></header>'+
'<div class=np id=cbsk-np>Loading songs...</div><audio controls preload=none></audio><div class=body><div class=songs></div><div class=ly><p>Pick a song to see its lyrics.</p></div></div>';
function add(){document.body.appendChild(b);document.body.appendChild(P);}
if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
var q=P.querySelector('input[type=search]'),S=P.querySelector('.songs'),L=P.querySelector('.ly'),A=P.querySelector('audio'),NP=P.querySelector('#cbsk-np');
function load(){if(IDX)return Promise.resolve();return fetch(base+'index.json').then(function(r){return r.json()}).then(function(d){IDX=d;NP.textContent=d.length+' songs. Tap one to play and sing along.';render()}).catch(function(){NP.textContent='Songs need an internet connection. You can still play your own song.'})}
function render(){var t=q.value.trim().toLowerCase(),clean=P.querySelector('#cbsk-clean').checked;list=[];
 upl.forEach(function(u,i){list.push(['up'+i,u.t,u.a,0,'Your song',0,-1,0])});
 (IDX||[]).forEach(function(r){if(clean&&r[3])return;if(t&&r[1].toLowerCase().indexOf(t)<0&&r[4].toLowerCase().indexOf(t)<0)return;list.push(r)});
 var h='';list.slice(0,300).forEach(function(r,i){h+='<div data-i='+i+(r===list[cur]?' class=cur':'')+'>'+esc(r[1])+'<small>'+esc(r[4])+(r[3]?' · explicit':'')+(r[7]?' · lyrics':'')+'</small></div>'});
 if(list.length>300)h+='<div>Showing 300 of '+list.length+'. Type to search for more.</div>';S.innerHTML=h||'<div>No songs found.</div>'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function lyr(r){if(r[6]<0)return Promise.resolve(upl[+r[0].slice(2)].l||'');if(CH[r[6]])return Promise.resolve(CH[r[6]][r[0]]||'');
 return fetch(base+'l/'+('00'+r[6]).slice(-3)+'.json').then(function(x){return x.json()}).then(function(d){CH[r[6]]=d;return d[r[0]]||''}).catch(function(){return ''})}
function play(i){cur=i;var r=list[i];if(!r)return;A.src=(r[2]&&r[2].indexOf('forbidden')<0)?r[2]:'https://cdn1.suno.ai/'+r[0]+'.mp3';A.cbr=r;A.play().catch(function(){});NP.textContent='Now playing: '+r[1];render();
 try{localStorage.setItem('cbsk-last',r[0])}catch(e){}
 lyr(r).then(function(t){if(!t){L.innerHTML='<p>No lyrics saved for this song. Sing along with the music.</p>';return}
  L.innerHTML=t.split('\n').map(function(x){x=x.trim();if(!x)return '<p>&nbsp;</p>';return '<p'+(/^\[.*\]$/.test(x)?' class=tag':'')+'>'+esc(x)+'</p>'}).join('')})}
A.addEventListener('timeupdate',function(){if(!A.duration)return;var ps=[].slice.call(L.querySelectorAll('p:not(.tag)')).filter(function(p){return p.textContent.trim()});if(!ps.length)return;
 var k=Math.min(ps.length-1,Math.floor(A.currentTime/A.duration*ps.length));ps.forEach(function(p,j){p.classList.toggle('now',j===k)});if(ps[k]&&!ps[k].cbs){ps.forEach(function(p){p.cbs=0});ps[k].cbs=1;ps[k].scrollIntoView({block:'center',behavior:'smooth'})}});
A.addEventListener('error',function(){var r=A.cbr;if(!r||r[6]<0)return;NP.innerHTML='This song cannot play here right now. <a href="https://suno.com/song/'+r[0]+'" target=_blank rel=noopener>Listen on Suno</a> and sing along with the lyrics.'});
A.addEventListener('ended',function(){play(shuffle?Math.floor(Math.random()*list.length):cur+1)});
S.addEventListener('click',function(e){var d=e.target.closest('[data-i]');if(d)play(+d.getAttribute('data-i'))});
q.addEventListener('input',render);P.querySelector('#cbsk-clean').addEventListener('change',render);
P.querySelector('#cbsk-shuf').onclick=function(){shuffle=!shuffle;this.textContent='Shuffle: '+(shuffle?'on':'off')};
P.querySelector('#cbsk-up').addEventListener('change',function(){[].forEach.call(this.files,function(f){upl.push({t:f.name.replace(/\.[^.]+$/,''),a:URL.createObjectURL(f),l:''})});
 var l=prompt('Paste lyrics for your song (optional):','');if(l&&upl.length)upl[upl.length-1].l=l;q.value='';render();play(upl.length-1)});
(function(){var R=null,ch=[],btn=P.querySelector('#cbsk-rec'),dl=P.querySelector('#cbsk-dl');
btn.onclick=function(){if(R&&R.state=='recording'){R.stop();return}
 if(!navigator.mediaDevices||!window.MediaRecorder){alert('Recording is not available in this browser.');return}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){ch=[];R=new MediaRecorder(s);R.ondataavailable=function(e){if(e.data.size)ch.push(e.data)};
 R.onstop=function(){s.getTracks().forEach(function(t){t.stop()});dl.href=URL.createObjectURL(new Blob(ch,{type:R.mimeType||'audio/webm'}));dl.hidden=false;btn.textContent='⏺ Record me';NP.textContent='Recording ready. Press Save my recording to keep it.'};
 R.start();btn.textContent='⏹ Stop recording';NP.textContent='Recording. Sing along, then press Stop recording.'}).catch(function(){alert('Please allow the microphone to record.')})}})();
P.querySelector('#cbsk-x').onclick=function(){P.classList.remove('on');};
b.onclick=function(){P.classList.add('on');load()};
window.cbSunoKaraoke={open:function(){b.onclick()}};
})();
