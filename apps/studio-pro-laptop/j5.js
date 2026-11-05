var TL=$('tl'),TX=TL.getContext('2d'),RH=64,RUL=24,TOOL='sel';
function pxb(){return +$('zoom').value}
function snapB(b){var s=+$('snap').value;if(!s)return b;var q=s===4?bpb():s;return Math.round(b/q)*q}
function tlBeats(){return Math.min(Math.floor(30000/pxb()),Math.max(songEnd()+bpb()*16,bpb()*64,P.loop.e+8))}
function peaks(id){if(PEAKS[id])return PEAKS[id];var b=BUFS[id];if(!b)return null;var d=b.getChannelData(0),d2=b.numberOfChannels>1?b.getChannelData(1):d,step=256,n=Math.ceil(d.length/step),pk=new Float32Array(n);for(var i=0;i<n;i++){var m=0,e=Math.min(d.length,(i+1)*step);for(var j=i*step;j<e;j++){var a=Math.max(Math.abs(d[j]),Math.abs(d2[j]));if(a>m)m=a}pk[i]=m}PEAKS[id]={pk:pk,step:step,sr:b.sampleRate};return PEAKS[id]}
function drawTL(){var W=Math.ceil(tlBeats()*pxb()),H=RUL+RH*P.tracks.length;if(TL.width!==W)TL.width=W;if(TL.height!==H)TL.height=H;var x=TX,pb=pxb(),bp=bpb();x.fillStyle='#0d0d12';x.fillRect(0,0,W,H);
 P.tracks.forEach(function(t,i){x.fillStyle=i===SEL.t?'#191922':i%2?'#121219':'#101016';x.fillRect(0,RUL+i*RH,W,RH);x.fillStyle='#22222e';x.fillRect(0,RUL+(i+1)*RH-1,W,1)});
 for(var b=0;b<W/pb;b++){var bar=b%bp===0;x.fillStyle=bar?'#2c2c3c':'#1a1a24';if(pb>14||bar)x.fillRect(Math.round(b*pb),RUL,1,H)}
 x.fillStyle='#16161e';x.fillRect(0,0,W,RUL);x.fillStyle='#8d8aa3';x.font='11px system-ui';for(var b2=0;b2<W/pb;b2+=bp){var bn=b2/bp+1;if(pb*bp<40&&bn%4!==1)continue;x.fillText(String(bn),b2*pb+3,15);x.fillRect(b2*pb,14,1,10)}
 if(P.loop.e>P.loop.s){x.fillStyle=P.loop.on?'rgba(255,45,149,0.5)':'rgba(255,45,149,0.15)';x.fillRect(P.loop.s*pb,0,(P.loop.e-P.loop.s)*pb,8);if(P.loop.on){x.fillStyle='rgba(255,45,149,0.05)';x.fillRect(P.loop.s*pb,RUL,(P.loop.e-P.loop.s)*pb,H)}}
 if(P.punch.e>P.punch.s){x.fillStyle=P.punch.on?'rgba(255,77,77,0.65)':'rgba(255,77,77,0.18)';x.fillRect(P.punch.s*pb,19,(P.punch.e-P.punch.s)*pb,5);if(P.punch.on){x.fillStyle='rgba(255,77,77,0.05)';x.fillRect(P.punch.s*pb,RUL,(P.punch.e-P.punch.s)*pb,H)}}
 P.tracks.forEach(function(t,i){t.clips.forEach(function(c){var cx=c.start*pb,cw=Math.max(2,c.len*pb),cy=RUL+i*RH+3,ch=RH-7,sel=c.id===SEL.c&&i===SEL.t;x.fillStyle=t.color+'40';x.fillRect(cx,cy,cw,ch);x.strokeStyle=sel?'#fff':t.color;x.lineWidth=sel?2:1;x.strokeRect(cx+0.5,cy+0.5,cw-1,ch-1);x.fillStyle=t.color;x.fillRect(cx,cy,cw,12);x.save();x.beginPath();x.rect(cx,cy,cw,ch);x.clip();x.fillStyle='#0d0d12';x.font='10px system-ui';x.fillText(c.name||c.kind,cx+3,cy+9);
  var my=cy+12+(ch-12)/2,hh=(ch-14)/2;x.fillStyle=t.color;
  if(c.kind==='audio'){var pk=peaks(c.buf);if(pk){var S=spb();for(var px=0;px<cw;px++){var i0=Math.floor((c.off+(px/pb)*S)*pk.sr/pk.step),i1=Math.max(i0+1,Math.floor((c.off+((px+1)/pb)*S)*pk.sr/pk.step)),m=0;for(var q=i0;q<i1&&q<pk.pk.length;q++)if(pk.pk[q]>m)m=pk.pk[q];m=Math.min(1,m*(c.gain==null?1:c.gain));x.fillRect(cx+px,my-m*hh,1,Math.max(1,m*hh*2))}}
   x.strokeStyle='#ffffffaa';if(c.fi){x.beginPath();x.moveTo(cx,cy+ch);x.lineTo(cx+c.fi/spb()*pb,cy+12);x.stroke()}if(c.fo){x.beginPath();x.moveTo(cx+cw,cy+ch);x.lineTo(cx+cw-c.fo/spb()*pb,cy+12);x.stroke()}}
  else if(c.kind==='midi'){var lo=127,hi=0;c.notes.forEach(function(n){lo=Math.min(lo,n.p);hi=Math.max(hi,n.p)});var rng=Math.max(12,hi-lo+1);c.notes.forEach(function(n){if(n.t>=c.len)return;x.fillRect(cx+n.t*pb,cy+ch-3-((n.p-lo+1)/rng)*(ch-17),Math.max(2,n.d*pb-1),3)})}
  else if(c.kind==='drums'){var st=bpb()/16,rh=(ch-16)/8;for(var k=0;k*st<c.len;k++)for(var r=0;r<8;r++)if(c.steps[r][k%16])x.fillRect(cx+k*st*pb,cy+14+r*rh,Math.max(2,st*pb-1),Math.max(2,rh-1))}
  x.restore()})});
 drawPH()}
function drawPH(){var ph=$('ph');ph.style.left=(pos()*pxb())+'px';ph.style.height=TL.height+'px'}
function hit(ev){var r=TL.getBoundingClientRect(),mx=ev.clientX-r.left,my=ev.clientY-r.top,b=mx/pxb(),ti=Math.floor((my-RUL)/RH);var res={mx:mx,my:my,b:b,ti:ti,ruler:my<RUL};if(ti>=0&&ti<P.tracks.length){var t=P.tracks[ti];for(var i=t.clips.length-1;i>=0;i--){var c=t.clips[i];if(b>=c.start&&b<=c.start+c.len){res.c=c;var ex=(c.start+c.len)*pxb()-mx,sx=mx-c.start*pxb();res.edge=ex<7?'r':sx<7?'l':null;break}}}return res}
var DRAG=null;
TL.addEventListener('mousedown',function(ev){var h=hit(ev);if(h.ruler){if(ev.shiftKey||ev.altKey){ev.preventDefault();DRAG={k:ev.altKey?'punch':'loop',a:snapB(h.b)}}else{DRAG={k:'seek'};seek(Math.max(0,h.b))}return}
 if(h.ti<0||h.ti>=P.tracks.length)return;SEL.t=h.ti;var t=P.tracks[h.ti];
 if(TOOL==='split'&&h.c){commit();splitClip(h.ti,h.c,snapB(h.b));renderAll();return}
 if(TOOL==='draw'&&!h.c){if(t.type==='audio'){msg('Draw makes MIDI or drum clips. Use a synth or drum track.');return}commit();var st=Math.floor(h.b/bpb())*bpb();var c=t.type==='drums'?{id:uid(),kind:'drums',start:st,len:bpb(),steps:basicBeat(),name:'Beat'}:{id:uid(),kind:'midi',start:st,len:bpb()*2,notes:[],name:'MIDI'};t.clips.push(c);SEL.c=c.id;renderAll();openEditor();return}
 if(h.c){SEL.c=h.c.id;DRAG={k:h.edge?'trim'+h.edge:'move',c:h.c,ti:h.ti,b0:h.b,s0:h.c.start,l0:h.c.len,o0:h.c.off||0,snap:JSON.stringify(P),moved:false}}else SEL.c=null;renderHeads();syncClipUI();drawTL();renderFx();openEditorQuiet()});
TL.addEventListener('dblclick',function(ev){var h=hit(ev);if(h.c)openEditor()});
window.addEventListener('mousemove',function(ev){if(!DRAG)return;var r=TL.getBoundingClientRect(),b=Math.max(0,(ev.clientX-r.left)/pxb());
 if(DRAG.k==='seek'){seek(b);return}if(DRAG.k==='loop'||DRAG.k==='punch'){var e=snapB(b),o=P[DRAG.k];o.s=Math.min(DRAG.a,e);o.e=Math.max(DRAG.a,e);o.on=o.e>o.s;syncBtns();drawTL();return}
 var c=DRAG.c,d=b-DRAG.b0;if(Math.abs(d*pxb())>2)DRAG.moved=true;if(!DRAG.moved)return;
 if(DRAG.k==='move'){c.start=Math.max(0,snapB(DRAG.s0+d));var ti=Math.floor((ev.clientY-r.top-RUL)/RH);if(ti>=0&&ti<P.tracks.length&&ti!==DRAG.ti&&P.tracks[ti].type===P.tracks[DRAG.ti].type){var src=P.tracks[DRAG.ti].clips;src.splice(src.indexOf(c),1);P.tracks[ti].clips.push(c);DRAG.ti=ti;SEL.t=ti}}
 else if(DRAG.k==='trimr'){var nl=Math.max(0.1,snapB(DRAG.s0+DRAG.l0+d)-c.start);if(c.kind==='audio'){nl=Math.min(nl,(BUFS[c.buf].duration-c.off)/spb())}c.len=nl}
 else if(DRAG.k==='triml'){var ns=snapB(DRAG.s0+d),end=DRAG.s0+DRAG.l0;ns=Math.max(0,Math.min(ns,end-0.1));if(c.kind==='audio'){ns=Math.max(ns,DRAG.s0-DRAG.o0/spb());c.off=DRAG.o0+(ns-DRAG.s0)*spb()}else if(c.kind==='midi'){var sh=ns-c.start;c.notes.forEach(function(n){n.t-=sh});c.notes=c.notes.filter(function(n){return n.t>=0})}c.start=ns;c.len=end-ns}
 drawTL()});
window.addEventListener('mouseup',function(){if(DRAG&&DRAG.c&&DRAG.moved){UNDO.push(DRAG.snap);REDO.length=0;renderAll()}if(DRAG&&(DRAG.k==='loop'||DRAG.k==='punch'))dirty();DRAG=null});
function seek(b){b=Math.max(0,b);if(PLAY.on&&!REC.on){stopSources();startSources(b,ac.currentTime+0.03)}else if(!REC.on)POS=b;drawPH();upLCD()}
function splitClip(ti,c,b){var t=P.tracks[ti];if(b<=c.start+0.01||b>=c.start+c.len-0.01)return false;var r=JSON.parse(JSON.stringify(c)),cut=b-c.start;r.id=uid();r.start=b;r.len=c.len-cut;c.len=cut;if(c.kind==='audio'){r.off=c.off+cut*spb();c.fo=0;r.fi=0}else if(c.kind==='midi'){r.notes=c.notes.filter(function(n){return n.t>=cut}).map(function(n){return{t:n.t-cut,d:n.d,p:n.p,v:n.v}});c.notes=c.notes.filter(function(n){return n.t<cut})}else if(c.kind==='drums'){var st=bpb()/16,ks=Math.round(cut/st)%16;r.steps=r.steps.map(function(row){return row.slice(ks).concat(row.slice(0,ks))})}t.clips.push(r);SEL.c=r.id;return true}
function dupClip(){var c=selClip();if(!c)return;commit();var d=JSON.parse(JSON.stringify(c));d.id=uid();d.start=c.start+c.len;P.tracks[SEL.t].clips.push(d);SEL.c=d.id;renderAll()}
function delClip(){var c=selClip();if(!c)return;commit();var a=P.tracks[SEL.t].clips;a.splice(a.indexOf(c),1);SEL.c=null;renderAll()}
function syncClipUI(){var c=selClip();$('cgain').value=c&&c.gain!=null?c.gain:1;$('cfi').value=c?c.fi||0:0;$('cfo').value=c?c.fo||0:0}
function esc(s){return String(s).replace(/[<>"&]/g,'')}
function renderHeads(){var h=$('heads');h.innerHTML='';P.tracks.forEach(function(t,i){var d=document.createElement('div');d.className='th'+(i===SEL.t?' sel':'');
 var sel3=t.type==='audio'?'<select class="inp" title="Input"><option value="">Default mic</option>'+INPUTS.map(function(x,k){return '<option value="'+esc(x.deviceId)+'"'+(x.deviceId===t.input?' selected':'')+'>'+esc(x.label||('Input '+(k+1)))+'</option>'}).join('')+'</select>':t.type==='synth'?'<select class="ins">'+INST.map(function(n){return '<option'+(n===t.inst?' selected':'')+'>'+n+'</option>'}).join('')+'</select>':'<select class="kt">'+Object.keys(KIT).map(function(n){return '<option'+(n===t.kit?' selected':'')+'>'+n+'</option>'}).join('')+'</select>';
 d.innerHTML='<div class="col" style="background:'+t.color+'"></div><div><div class="r1"><input class="nm" type="text" value="'+esc(t.name)+'"><button class="arm'+(t.arm?' on':'')+'" title="Record arm">R</button><button class="mon'+(t.mon?' on':'')+'" title="Input monitoring">I</button><button class="mut'+(t.mute?' on':'')+'" title="Mute">M</button><button class="sol'+(t.solo?' on':'')+'" title="Solo">S</button></div><div class="r2" style="margin-top:4px"><select class="ty"><option value="audio"'+(t.type==='audio'?' selected':'')+'>Audio</option><option value="synth"'+(t.type==='synth'?' selected':'')+'>Synth</option><option value="drums"'+(t.type==='drums'?' selected':'')+'>Drums</option></select>'+sel3+'</div></div>';
 d.onmousedown=function(){if(SEL.t!==i){SEL.t=i;SEL.c=null;[].forEach.call(h.children,function(x,k){x.classList.toggle('sel',k===i)});drawTL();renderFx();drawRoll();renderDrum()}};
 d.querySelector('.nm').onchange=function(){commit();t.name=this.value;renderStrips()};
 d.querySelector('.arm').onclick=function(){t.arm=!t.arm;this.classList.toggle('on',t.arm);if(t.arm&&t.type==='audio'&&!INPUTS.length)listInputs()};
 d.querySelector('.mon').onclick=function(){t.mon=!t.mon;this.classList.toggle('on',t.mon);dirty()};
 d.querySelector('.mut').onclick=function(){t.mute=!t.mute;this.classList.toggle('on',t.mute);updMix();renderStrips();dirty()};
 d.querySelector('.sol').onclick=function(){t.solo=!t.solo;this.classList.toggle('on',t.solo);updMix();renderStrips();dirty()};
 d.querySelector('.ty').onchange=function(){if(t.clips.length&&!confirm('Changing the track type removes its clips. Continue?')){this.value=t.type;return}commit();t.type=this.value;t.clips=[];renderAll()};
 d.querySelector('.inp,.ins,.kt').onchange=function(){commit();if(t.type==='audio')t.input=this.value;else if(t.type==='synth')t.inst=this.value;else t.kit=this.value;renderDrum()};
 h.appendChild(d)})}
