(function(){
var D=window.DOLLS,$=function(i){return document.getElementById(i)};
var S=JSON.parse(localStorage.getItem('hdSave')||'{"un":1,"done":{}}');function save(){localStorage.setItem('hdSave',JSON.stringify(S))}
var AC;function ac(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();return AC}
function noise(d,v,f){try{var a=ac(),b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),x=b.getChannelData(0);for(var i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/x.length);var s=a.createBufferSource();s.buffer=b;var fl=a.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f||1200;fl.Q.value=.7;var g=a.createGain();g.gain.value=v||.15;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start()}catch(e){}}
function beep(f,d){try{var a=ac(),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+(d||.08))}catch(e){}}
function whisper(w){noise(1.2,.12,900);try{if(window.speechSynthesis){var u=new SpeechSynthesisUtterance(w.toLowerCase());u.rate=.6;u.pitch=.3;u.volume=.35;speechSynthesis.speak(u)}}catch(e){}}
// draw an original porcelain doll
function drawDoll(c,x,y,sc,d,st){c.save();c.translate(x,y);c.scale(sc,sc);c.rotate(st.tilt||0);
 c.fillStyle=d.col;c.beginPath();c.moveTo(-38,10);c.lineTo(38,10);c.lineTo(55,110);c.lineTo(-55,110);c.closePath();c.fill();
 c.fillStyle='#e9e0d2';c.fillRect(-46,108,14,26);c.fillRect(32,108,14,26);c.fillRect(-52,18,12,46);c.fillRect(40,18,12,46);
 c.fillStyle='rgba(255,255,255,.25)';for(var i=-30;i<40;i+=16){c.fillRect(i,40,6,6)}
 c.save();c.rotate(st.head||0);c.fillStyle='#f1e8dc';c.beginPath();c.arc(0,-22,32,0,7);c.fill();c.fillStyle='#3b2a1e';c.beginPath();c.arc(0,-30,34,Math.PI,0);c.fill();
 c.fillStyle='#111';if(st.eyes){c.beginPath();c.arc(-12,-22,5,0,7);c.arc(12,-22,5,0,7);c.fill();c.fillStyle=st.glow?'#c00':'#9ab';c.beginPath();c.arc(-12,-22,2,0,7);c.arc(12,-22,2,0,7);c.fill()}else{c.fillRect(-17,-22,10,2);c.fillRect(7,-22,10,2)}
 c.fillStyle='#a33';c.fillRect(-5,-8,10,3);c.fillStyle='rgba(200,80,80,.25)';c.beginPath();c.arc(-18,-12,5,0,7);c.arc(18,-12,5,0,7);c.fill();
 if(st.crack){c.strokeStyle='#555';c.beginPath();c.moveTo(10,-48);c.lineTo(4,-36);c.lineTo(12,-28);c.stroke()}c.restore();c.restore()}
window.HD_drawDoll=drawDoll;
var cv=$('room'),cx=cv&&cv.getContext('2d'),G=null;
var SPOTS=[[120,300,'chair'],[300,250,'shelf'],[480,310,'floor'],[620,260,'window sill'],[380,330,'rug']];
function room(dark){var c=cx,w=cv.width,h=cv.height;c.fillStyle='#2a2320';c.fillRect(0,0,w,h);c.fillStyle='#3a302a';for(var i=0;i<w;i+=40)c.fillRect(i,0,2,250);c.fillStyle='#1d1714';c.fillRect(0,250,w,h-250);
 c.fillStyle='#0f1a2a';c.fillRect(580,60,110,130);c.strokeStyle='#5a4a3a';c.lineWidth=6;c.strokeRect(580,60,110,130);c.beginPath();c.moveTo(635,60);c.lineTo(635,190);c.moveTo(580,125);c.lineTo(690,125);c.stroke();
 c.fillStyle='#4a3324';c.fillRect(230,180,150,12);c.fillRect(80,250,80,10);c.fillRect(90,260,8,70);c.fillRect(142,260,8,70);c.fillRect(85,180,6,75);
 c.fillStyle='#3a1f22';c.beginPath();c.ellipse(380,345,120,28,0,0,7);c.fill();
 if(G&&G.journal>=0&&!G.jfound){c.fillStyle='#d8c9a0';c.fillRect(G.jx,G.jy,26,18)}}
function render(){if(!G)return;room();var p=SPOTS[G.pos];drawDoll(cx,p[0],p[1]-110*.8,.8,G.d,G.st);
 if(G.night){var im=cx.getImageData(0,0,cv.width,cv.height),a=im.data;for(var i=0;i<a.length;i+=4){var l=(a[i]+a[i+1]+a[i+2])/3*1.6+Math.random()*30;a[i]=l*.25;a[i+1]=l;a[i+2]=l*.3}cx.putImageData(im,0,0)}
 cx.fillStyle='rgba(255,255,255,.8)';cx.font='14px monospace';cx.fillText((G.night?'NIGHT CAM ':'CAM ')+'CHECK '+G.checks+'/12  '+new Date().toLocaleTimeString(),10,20)}
function dark(){cx.fillStyle='#000';cx.fillRect(0,0,cv.width,cv.height);cx.fillStyle='#555';cx.font='16px monospace';cx.fillText('Camera off… the room is dark. Something might move.',60,200)}
function ev(t,pts){G.ev.push(t);G.score+=pts||1;var li=document.createElement('li');li.textContent=new Date().toLocaleTimeString()+' – '+t;$('hdLog').prepend(li);$('hdEv').textContent=G.score;if(G.score>=G.need)win()}
function start(i){var d=D[i];G={d:d,i:i,pos:0,st:{eyes:true,head:0,tilt:0},checks:0,ev:[],score:0,need:6+Math.min(i,4),night:false,emf:0,journal:Math.floor(Math.random()*3),jfound:false,jx:150+Math.random()*450,jy:300+Math.random()*40,lines:0};
 $('hdPick').hidden=true;$('hdPlay').hidden=false;$('hdLog').innerHTML='';$('hdName').textContent=d.name;$('hdEv').textContent=0;$('hdNeed').textContent=G.need;$('hdMsg').textContent='Take a camera check. Look away, then check again – has she moved?';dark()}
function check(){if(!G||G.over)return;G.checks++;beep(1800,.05);var r=Math.random(),ch=[];
 if(G.checks>1){if(r<.35){var o=G.pos;G.pos=(G.pos+1+Math.floor(Math.random()*4))%5;ch.push('moved from the '+SPOTS[o][2]+' to the '+SPOTS[G.pos][2])}
 else if(r<.6){G.st.head=G.st.head?0:(Math.random()<.5?-.5:.5);ch.push('head turned')}else if(r<.8){G.st.eyes=!G.st.eyes;ch.push(G.st.eyes?'eyes are OPEN':'eyes closed by themselves')}else if(r<.88){G.st.glow=1;ch.push('eyes reflected red')}}
 render();if(ch.length){ev(G.d.name.split(' ')[0]+' '+ch.join(', '),G.night?2:1);$('hdMsg').textContent='📸 Change detected: '+ch.join(', ')+(G.night?' (night cam bonus)':'');noise(.4,.08,300)}else $('hdMsg').textContent='📸 Nothing… yet.';G.st.glow=0;
 setTimeout(function(){if(G&&!G.over)dark()},1600);if(G.checks>=12&&!G.over)lose()}
function emf(){if(!G)return;var v=Math.random()*(G.checks?5:2);v=v>4.2?5:v;var n=Math.max(1,Math.round(v));for(var i=0;i<5;i++)$('hdLed').children[i].className=i<n?'on':'';$('hdEmf').textContent=v.toFixed(1)+' mG';beep(300+n*200,.1);if(n>=5)ev('EMF spike LEVEL 5 near the '+SPOTS[G.pos][2],1)}
function evp(){if(!G)return;$('hdMsg').textContent='⏺ Listening… ask: "Is someone here?"';setTimeout(function(){if(Math.random()<.55){var w=G.d.words[G.lines++%G.d.words.length];whisper(w);$('hdMsg').textContent='🎧 Whisper captured: "'+w+'"';ev('EVP whisper: "'+w+'"',2)}else{noise(.8,.06,2000);$('hdMsg').textContent='🎧 Static only.'}},1500)}
function search(){if(!G)return;if(!G.jfound&&Math.random()<.45){G.jfound=1;var s=G.d.story.split('. ');$('hdJ').innerHTML+='<p>📓 <i>'+s.slice(0,Math.ceil(s.length/2)).join('. ')+'…</i></p>';ev('Found a journal page',2);$('hdMsg').textContent='📓 You found a torn journal page under the floorboards.'}else $('hdMsg').textContent='🔦 You search the room… dust and silence.';noise(.3,.05,600)}
function win(){G.over=1;S.done[G.d.id]=1;S.un=Math.max(S.un,Math.min(D.length,G.i+2));save();$('hdMsg').innerHTML='🏆 <b>Case closed!</b> '+G.score+' evidence points in '+G.checks+' checks. <b>Full story:</b> '+G.d.story+(G.i+1<D.length?' <br>🔓 New doll unlocked: '+D[G.i+1].name:'');render()}
function lose(){G.over=1;$('hdMsg').textContent='🕯️ Out of camera checks. The doll is still watching… try again.'}
function picker(){var h='';D.forEach(function(d,i){var L=i>=S.un;h+='<button class="hdCard'+(L?' lock':'')+'" '+(L?'disabled':'')+' data-i="'+i+'"><canvas width="120" height="150" data-d="'+i+'"></canvas><b>'+d.name+'</b><small>'+(S.done[d.id]?'✅ solved':L?'🔒 solve the previous case':d.era)+'</small></button>'});$('hdDolls').innerHTML=h;
 [].forEach.call(document.querySelectorAll('#hdDolls canvas'),function(c){var d=D[+c.dataset.d],x=c.getContext('2d');x.fillStyle='#1d1714';x.fillRect(0,0,120,150);drawDoll(x,60,55,.55,d,{eyes:true})});
 [].forEach.call(document.querySelectorAll('.hdCard'),function(b){b.onclick=function(){start(+b.dataset.i)}})}
if(cv){$('hdCheck').onclick=check;$('hdEmfB').onclick=emf;$('hdEvp').onclick=evp;$('hdSearch').onclick=search;$('hdNight').onclick=function(){if(G){G.night=!G.night;this.textContent=G.night?'🌙 Night cam ON':'🌙 Night cam'}};$('hdBack').onclick=function(){G=null;$('hdPlay').hidden=true;$('hdPick').hidden=false;picker()};picker()}
// companion pages
function comp(id){var d=D.filter(function(x){return x.id==id.toLowerCase().trim()})[0];if(!d){$('hdCMsg').textContent='Unknown doll code. Check your QR card.';return}
 $('hdComp').hidden=false;$('hdCName').textContent=d.name;$('hdCStory').textContent=d.story;$('hdCCert').textContent='Certificate No. CB-HD-'+String(d.vid).slice(-4)+' • '+d.era;var c=$('hdCCv').getContext('2d');c.fillStyle='#1d1714';c.fillRect(0,0,200,240);drawDoll(c,100,90,.9,d,{eyes:true});$('hdComp').scrollIntoView({behavior:'smooth'});$('hdCAsk').onclick=function(){var q=$('hdCQ').value.trim();$('hdCA').textContent='📻 …scanning…';noise(1.5,.08,1500);setTimeout(function(){var w=Math.random()<.7?d.words[Math.floor(Math.random()*d.words.length)]:'…';$('hdCA').textContent='📻 "'+w+'"';if(w!='…')whisper(w)},1600)};
 $('hdCEmf').onclick=function(){var v=(Math.random()*5).toFixed(1);$('hdCEv').textContent='EMF '+v+' mG';beep(300+v*150,.15)}}
$('hdCGo').onclick=function(){comp($('hdCode').value)};
var m=(location.hash+location.search).match(/doll=([a-z]+)/i);if(m){setTimeout(function(){comp(m[1])},300)}
})();
