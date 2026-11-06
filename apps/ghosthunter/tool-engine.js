/* Coffeebreak Ghost Hunter — in-app real-sensor tool engine */
(function(global){
  function header(root, tool){ var p=document.createElement('p'); p.className='muted'; p.textContent=tool.blurb; root.appendChild(p); }
  function big(root,id,t){ var d=document.createElement('div'); d.className='big'; d.id=id; d.textContent=t||'—'; root.appendChild(d); return d; }
  function meter(root,id){ var m=document.createElement('div'); m.className='meter'; m.innerHTML='<i id="'+id+'" style="width:0%"></i>'; root.appendChild(m); }
  function row(root){ var r=document.createElement('div'); r.className='row'; root.appendChild(r); return r; }
  function btn(parent,id,label){ var b=document.createElement('button'); b.type='button'; b.id=id; b.textContent=label; parent.appendChild(b); return b; }
  function note(root,text,ok){ var p=document.createElement('p'); p.className='muted'; p.style.color=ok?'#39ff6a':'#f6a'; p.textContent=text; root.appendChild(p); return p; }
  function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
  function ac(){ if(!global.__cbGHAC){ var C=global.AudioContext||global.webkitAudioContext; if(C) global.__cbGHAC=new C(); } return global.__cbGHAC; }
  function q(root,id){ return root.querySelector('#'+id); }

  function startMag(onOk, onFail){
    try{
      if('Magnetometer' in global){
        var mg=new Magnetometer({frequency:10});
        mg.onreading=function(){ onOk({mag:Math.hypot(mg.x,mg.y,mg.z), x:mg.x, y:mg.y, z:mg.z, source:'Magnetometer'}); };
        mg.onerror=function(){ onFail('Magnetometer error or permission denied.'); };
        mg.start(); return function(){ try{mg.stop();}catch(e){} };
      }
    }catch(e){}
    try{
      var handler=function(e){
        var h=(typeof e.webkitCompassHeading==='number')?e.webkitCompassHeading:(typeof e.alpha==='number'?(360-e.alpha):null);
        if(h==null){ onFail('No compass heading on this device.'); return; }
        onOk({heading:((h%360)+360)%360, source:'DeviceOrientation'});
      };
      if(typeof DeviceOrientationEvent!=='undefined' && DeviceOrientationEvent.requestPermission){
        DeviceOrientationEvent.requestPermission().then(function(s){ if(s==='granted') window.addEventListener('deviceorientation',handler,true); else onFail('Compass permission denied.'); }).catch(function(){ onFail('Compass permission unavailable.'); });
      } else window.addEventListener('deviceorientation',handler,true);
      return function(){ window.removeEventListener('deviceorientation',handler,true); };
    }catch(e){ onFail('No magnetometer or compass API.'); return function(){}; }
  }
  function startMotion(onOk, onFail){
    function bind(){ window.addEventListener('devicemotion', function(e){ var a=e.accelerationIncludingGravity||e.acceleration||{}; onOk({x:a.x||0,y:a.y||0,z:a.z||0, source:'DeviceMotion'}); }); }
    try{
      if(typeof DeviceMotionEvent!=='undefined' && DeviceMotionEvent.requestPermission){
        DeviceMotionEvent.requestPermission().then(function(s){ if(s==='granted') bind(); else onFail('Motion permission denied.'); }).catch(function(){ onFail('Motion permission unavailable.'); });
      } else bind();
      return function(){};
    }catch(e){ onFail('No DeviceMotion API.'); return function(){}; }
  }
  function openCam(c){ if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('Camera API not available')); return navigator.mediaDevices.getUserMedia(c); }
  function listCams(){ if(!navigator.mediaDevices||!navigator.mediaDevices.enumerateDevices) return Promise.resolve([]); return navigator.mediaDevices.enumerateDevices().then(function(l){ return l.filter(function(d){return d.kind==='videoinput';}); }).catch(function(){ return []; }); }
  function isThermal(label){ return /flir|seek|thermal|infrared|\bir\b|heat/i.test(label||''); }
  function heatPalette(v){ var t=v/255,r,g,b; if(t<0.25){r=0;g=0;b=Math.floor(t/0.25*180+40);} else if(t<0.5){r=Math.floor((t-0.25)/0.25*80);g=Math.floor((t-0.25)/0.25*180);b=220;} else if(t<0.75){r=Math.floor(80+(t-0.5)/0.25*175);g=Math.floor(180+(t-0.5)/0.25*75);b=Math.floor(220-(t-0.5)/0.25*220);} else {r=255;g=Math.floor(255-(t-0.75)/0.25*180);b=0;} return [r,g,b]; }

  var SENSOR_MAP={
    emf:'Magnetometer (µT) or DeviceOrientation compass',
    watch:'Magnetometer or DeviceOrientation',
    rempod:'Magnetometer',
    dowsing:'Magnetometer or DeviceOrientation',
    spiritbox:'Web Audio noise sweep + user-marked words',
    evp:'Microphone (MediaRecorder)',
    parab:'Microphone',
    infra:'Microphone',
    thermal:'Heat-style: real camera brightness palette (not °C). Real thermal: FLIR/Seek camera',
    fscam:'Camera',
    sls:'Camera',
    laser:'Camera',
    uv:'AmbientLightSensor or camera luma',
    ion:'AmbientLightSensor or camera luma',
    motion:'DeviceMotion',
    catball:'DeviceMotion',
    trigger:'DeviceMotion',
    radar:'DeviceMotion magnitude',
    temp:'Thermometer API if present',
    board:'Real clock + user notes'
  };

  var runners={};

  runners.emf=function(tool,root,api){
    header(root,tool); var val=big(root,'te_val','Waiting…'); meter(root,'te_m');
    var st=note(root,'Requesting magnetometer / compass…',false);
    var r=row(root); btn(r,'te_save','Save evidence');
    var stop=startMag(function(rd){
      if(rd.mag!=null){ val.textContent=rd.mag.toFixed(1)+' µT'; q(root,'te_m').style.width=clamp(Math.abs(rd.mag-45)/45*100,0,100)+'%'; st.textContent='Live · '+rd.source; st.style.color='#39ff6a'; }
      else if(rd.heading!=null){ val.textContent='Heading '+rd.heading.toFixed(0)+'°'; st.textContent='Compass only · '+rd.source; st.style.color='#39ff6a'; }
    }, function(err){ st.textContent=err; st.style.color='#f6a'; val.textContent='Sensor not available'; });
    q(root,'te_save').onclick=function(){ api.save('EMF spike', tool.name+': '+val.textContent, tool.sku); };
    api.onClose=stop;
  };
  runners.watch=runners.emf; runners.rempod=runners.emf; runners.dowsing=runners.emf;

  runners.spiritbox=function(tool,root,api){
    header(root,tool); var freq=big(root,'te_freq','87.5 FM'); var mark=big(root,'te_word','(mark a word you hear)');
    var st=note(root,'Sweeps band-pass noise only. No auto words — mark what you hear.',true);
    var inp=document.createElement('input'); inp.id='te_in'; inp.placeholder='Type a word you heard'; root.appendChild(inp);
    var r=row(root); btn(r,'te_go','Start sweep'); btn(r,'te_mark','Mark word'); btn(r,'te_save','Save marked');
    var on=false,t=null,noise=null,bp=null,last='', a=null;
    function stop(){ on=false; clearTimeout(t); try{noise&&noise.stop();}catch(e){} noise=null; var b=q(root,'te_go'); if(b) b.textContent='Start sweep'; }
    q(root,'te_go').onclick=function(){
      if(on){ stop(); return; } a=ac(); if(!a){ st.textContent='Web Audio not available.'; st.style.color='#f6a'; return; }
      on=true; this.textContent='Stop sweep';
      try{
        a.resume(); var len=a.sampleRate*2, buf=a.createBuffer(1,len,a.sampleRate), d=buf.getChannelData(0);
        for(var i=0;i<len;i++) d[i]=Math.random()*2-1;
        noise=a.createBufferSource(); noise.buffer=buf; noise.loop=true;
        bp=a.createBiquadFilter(); bp.type='bandpass'; bp.Q.value=4;
        var g=a.createGain(); g.gain.value=0.2; noise.connect(bp); bp.connect(g); g.connect(a.destination); noise.start();
        var f=87.5; (function step(){ if(!on) return; f+=0.2; if(f>108) f=87.5; freq.textContent=f.toFixed(1)+' FM'; try{ bp.frequency.setValueAtTime(300+((f-87.5)/(108-87.5))*4000,a.currentTime); }catch(e){} t=setTimeout(step,200); })();
        st.textContent='Sweeping. Mark words yourself.'; st.style.color='#39ff6a';
      }catch(e){ st.textContent='Audio sweep failed: '+e.message; st.style.color='#f6a'; on=false; }
    };
    q(root,'te_mark').onclick=function(){ var w=(q(root,'te_in').value||'').trim(); if(!w){ st.textContent='Type a word first.'; st.style.color='#f6a'; return; } last=w.toUpperCase(); mark.textContent=last; q(root,'te_in').value=''; };
    q(root,'te_save').onclick=function(){ if(!last){ st.textContent='Mark a word first.'; st.style.color='#f6a'; return; } api.save('Spirit box word', last+' (user-marked) via '+tool.name, tool.sku); };
    api.onClose=stop;
  };

  runners.evp=function(tool,root,api){
    header(root,tool); var cv=document.createElement('canvas'); cv.width=400; cv.height=100; cv.style.maxWidth='100%'; root.appendChild(cv);
    var st=note(root,'Uses the real microphone only.',true);
    var r=row(root); btn(r,'te_rec','Record 5s'); btn(r,'te_play','Play'); btn(r,'te_save','Save evidence');
    var buf=null;
    function wave(b){ var x=cv.getContext('2d'); x.clearRect(0,0,400,100); if(!b) return; var d=b.getChannelData(0), s=Math.max(1,Math.floor(d.length/400)); x.strokeStyle='#39ff6a'; x.beginPath(); for(var i=0;i<400;i++){ var v=d[i*s]||0; i?x.lineTo(i,50-v*45):x.moveTo(i,50-v*45);} x.stroke(); }
    q(root,'te_rec').onclick=function(){
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!global.MediaRecorder){ st.textContent='Microphone / MediaRecorder not available.'; st.style.color='#f6a'; return; }
      var a=ac(); if(!a){ st.textContent='Web Audio not available.'; st.style.color='#f6a'; return; }
      a.resume();
      navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
        var r=new MediaRecorder(stream), ch=[];
        r.ondataavailable=function(e){ if(e.data&&e.data.size) ch.push(e.data); };
        r.onstop=function(){ stream.getTracks().forEach(function(t){t.stop();}); new Blob(ch,{type:'audio/webm'}).arrayBuffer().then(function(ab){ return a.decodeAudioData(ab.slice(0)); }).then(function(b){ buf=b; wave(b); st.textContent='Recorded from mic.'; st.style.color='#39ff6a'; }).catch(function(e){ st.textContent='Decode failed: '+e.message; st.style.color='#f6a'; }); };
        r.start(); st.textContent='Recording 5s…'; setTimeout(function(){ try{ if(r.state!=='inactive') r.stop(); }catch(e){} },5000);
      }).catch(function(e){ st.textContent='Mic permission denied or unavailable: '+e.message; st.style.color='#f6a'; });
    };
    q(root,'te_play').onclick=function(){ var a=ac(); if(!a||!buf){ st.textContent='Nothing recorded yet.'; st.style.color='#f6a'; return; } a.resume(); var src=a.createBufferSource(); src.buffer=buf; src.connect(a.destination); src.start(); };
    q(root,'te_save').onclick=function(){ if(!buf){ st.textContent='Record first.'; st.style.color='#f6a'; return; } api.save('EVP', tool.name+' mic recording', tool.sku); };
  };
  runners.parab=runners.evp; runners.infra=runners.evp;

  runners.thermal=function(tool,root,api){
    header(root,tool);
    var label=document.createElement('p'); label.className='muted'; label.style.textAlign='center'; label.style.color='#39ff6a';
    label.textContent='Heat-style colour view — not a temperature reading. For real thermal, plug in a thermal camera (FLIR One, Seek).';
    root.appendChild(label);
    var st=note(root,'Choose a mode.',true);
    var cv=document.createElement('canvas'); cv.width=420; cv.height=280; cv.style.maxWidth='100%'; cv.style.border='1px solid #1c7a35'; cv.style.borderRadius='8px'; root.appendChild(cv);
    var sel=document.createElement('select'); sel.style.maxWidth='100%'; root.appendChild(sel);
    var r=row(root); btn(r,'te_heat','Heat-style colour view'); btn(r,'te_therm','Plug-in thermal camera'); btn(r,'te_stop','Stop'); btn(r,'te_save','Save evidence');
    var stream=null, mode=null, raf=0, vid=document.createElement('video'); vid.muted=true; vid.playsInline=true;
    function stop(){ cancelAnimationFrame(raf); mode=null; if(stream){ stream.getTracks().forEach(function(t){t.stop();}); stream=null; } vid.srcObject=null; }
    function fill(cb){ listCams().then(function(cams){ sel.innerHTML=''; cams.forEach(function(c,i){ var o=document.createElement('option'); o.value=c.deviceId; o.textContent=(c.label||('Camera '+i))+(isThermal(c.label)?' · thermal':''); sel.appendChild(o); }); cb(cams); }); }
    function loopHeat(){ if(mode!=='heat') return; if(vid.videoWidth){ var w=160,h=120,off=document.createElement('canvas'); off.width=w; off.height=h; var ox=off.getContext('2d'); ox.drawImage(vid,0,0,w,h); var img=ox.getImageData(0,0,w,h),d=img.data; for(var i=0;i<d.length;i+=4){ var y=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; var p=heatPalette(y); d[i]=p[0]; d[i+1]=p[1]; d[i+2]=p[2]; } ox.putImageData(img,0,0); var x=cv.getContext('2d'); x.imageSmoothingEnabled=false; x.drawImage(off,0,0,420,280); } raf=requestAnimationFrame(loopHeat); }
    function loopTherm(){ if(mode!=='thermal') return; if(vid.videoWidth) cv.getContext('2d').drawImage(vid,0,0,420,280); raf=requestAnimationFrame(loopTherm); }
    q(root,'te_heat').onclick=function(){ fill(function(){ var cons=sel.value?{video:{deviceId:{ideal:sel.value}},audio:false}:{video:{facingMode:{ideal:'environment'}},audio:false}; openCam(cons).then(function(stt){ stop(); stream=stt; vid.srcObject=stt; vid.play().catch(function(){}); mode='heat'; label.textContent='Heat-style colour view — not a temperature reading. For real thermal, plug in a thermal camera (FLIR One, Seek).'; st.textContent='Live camera brightness palette. Not temperature.'; st.style.color='#39ff6a'; loopHeat(); }).catch(function(e){ st.textContent='Camera not available: '+e.message; st.style.color='#f6a'; }); }); };
    q(root,'te_therm').onclick=function(){ fill(function(cams){ var th=cams.filter(function(c){return isThermal(c.label);}); if(!th.length){ st.textContent='No thermal-labelled camera (FLIR/Seek). Phone cameras cannot sense heat. Use Heat-style, or plug in a thermal camera.'; st.style.color='#f6a'; return; } openCam({video:{deviceId:{exact:th[0].deviceId}},audio:false}).then(function(stt){ stop(); stream=stt; vid.srcObject=stt; vid.play().catch(function(){}); mode='thermal'; label.textContent='Live plug-in thermal camera.'; st.textContent='Using '+(th[0].label||'thermal'); st.style.color='#39ff6a'; loopTherm(); }).catch(function(e){ st.textContent='Thermal camera open failed: '+e.message; st.style.color='#f6a'; }); }); };
    q(root,'te_stop').onclick=stop;
    q(root,'te_save').onclick=function(){ if(!stream){ st.textContent='Start a mode first.'; st.style.color='#f6a'; return; } api.save(mode==='thermal'?'Thermal bloom':'Other', tool.name+' '+mode, tool.sku); };
    api.onClose=stop;
  };

  runners.fscam=function(tool,root,api){
    header(root,tool); var st=note(root,'Real camera only.',true);
    var vid=document.createElement('video'); vid.playsInline=true; vid.muted=true; vid.autoplay=true; vid.style.maxWidth='100%'; vid.style.border='1px solid #1c7a35'; vid.style.borderRadius='8px'; root.appendChild(vid);
    var r=row(root); btn(r,'te_go','Start camera'); btn(r,'te_stop','Stop'); btn(r,'te_save','Save evidence');
    var stream=null;
    function stop(){ if(stream){ stream.getTracks().forEach(function(t){t.stop();}); stream=null; } vid.srcObject=null; }
    q(root,'te_go').onclick=function(){ openCam({video:{facingMode:{ideal:'environment'}},audio:false}).then(function(stt){ stream=stt; vid.srcObject=stt; vid.play().catch(function(){}); st.textContent='Live camera.'; st.style.color='#39ff6a'; }).catch(function(e){ st.textContent='Camera not available: '+e.message; st.style.color='#f6a'; }); };
    q(root,'te_stop').onclick=stop;
    q(root,'te_save').onclick=function(){ if(!stream){ st.textContent='Start camera first.'; st.style.color='#f6a'; return; } api.save('Other', tool.name+' camera', tool.sku); };
    api.onClose=stop;
  };
  runners.sls=runners.fscam; runners.laser=runners.fscam;

  runners.uv=function(tool,root,api){
    header(root,tool); var val=big(root,'te_val','—'); meter(root,'te_m'); var st=note(root,'AmbientLightSensor or camera brightness.',true);
    var r=row(root); btn(r,'te_als','Light sensor'); btn(r,'te_cam','Camera brightness'); btn(r,'te_stop','Stop'); btn(r,'te_save','Save evidence');
    var stream=null, raf=0, canvas=document.createElement('canvas');
    function stop(){ cancelAnimationFrame(raf); if(stream){ stream.getTracks().forEach(function(t){t.stop();}); stream=null; } }
    q(root,'te_als').onclick=function(){ stop(); try{ if(!('AmbientLightSensor' in global)){ st.textContent='AmbientLightSensor not available. Try Camera brightness.'; st.style.color='#f6a'; return; } var s=new AmbientLightSensor(); s.onreading=function(){ val.textContent=s.illuminance.toFixed(1)+' lux'; q(root,'te_m').style.width=clamp(s.illuminance/10,0,100)+'%'; st.textContent='Live AmbientLightSensor.'; st.style.color='#39ff6a'; }; s.onerror=function(){ st.textContent='Light sensor error / permission denied.'; st.style.color='#f6a'; }; s.start(); api.onClose=function(){ try{s.stop();}catch(e){} stop(); }; }catch(e){ st.textContent='Light sensor unavailable: '+e.message; st.style.color='#f6a'; } };
    q(root,'te_cam').onclick=function(){ stop(); openCam({video:true,audio:false}).then(function(stt){ stream=stt; var vid=document.createElement('video'); vid.muted=true; vid.playsInline=true; vid.srcObject=stt; vid.play().catch(function(){}); (function tick(){ if(!stream) return; if(vid.videoWidth){ canvas.width=120; canvas.height=90; var x=canvas.getContext('2d'); x.drawImage(vid,0,0,120,90); var d=x.getImageData(0,0,120,90).data,sum=0,n=120*90; for(var i=0;i<d.length;i+=4) sum+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; var luma=sum/n; val.textContent='Luma '+luma.toFixed(1)+'/255'; q(root,'te_m').style.width=(luma/255*100)+'%'; st.textContent='Live camera brightness (not UV).'; st.style.color='#39ff6a'; } raf=requestAnimationFrame(tick); })(); }).catch(function(e){ st.textContent='Camera not available: '+e.message; st.style.color='#f6a'; }); };
    q(root,'te_stop').onclick=stop;
    q(root,'te_save').onclick=function(){ api.save('Other', tool.name+': '+val.textContent, tool.sku); };
    api.onClose=stop;
  };
  runners.ion=runners.uv;

  runners.motion=function(tool,root,api){
    header(root,tool); var val=big(root,'te_val','Waiting…'); meter(root,'te_m'); var st=note(root,'Requesting DeviceMotion…',false);
    var r=row(root); btn(r,'te_save','Save evidence');
    startMotion(function(rd){ var m=Math.hypot(rd.x,rd.y,rd.z); val.textContent=m.toFixed(2)+' m/s²'; q(root,'te_m').style.width=clamp(m/20*100,0,100)+'%'; st.textContent='Live · '+rd.source; st.style.color='#39ff6a'; }, function(err){ st.textContent=err; st.style.color='#f6a'; val.textContent='Sensor not available'; });
    q(root,'te_save').onclick=function(){ api.save('Footsteps', tool.name+': '+val.textContent, tool.sku); };
  };
  runners.catball=runners.motion; runners.trigger=runners.motion; runners.radar=runners.motion;

  runners.temp=function(tool,root,api){
    header(root,tool); var val=big(root,'te_val','—'); var st=note(root,'Checking Thermometer API…',false);
    var r=row(root); btn(r,'te_go','Check'); btn(r,'te_save','Save evidence');
    q(root,'te_go').onclick=function(){ try{ if('Thermometer' in global){ var th=new Thermometer(); th.onreading=function(){ val.textContent=th.temperature.toFixed(1)+' °C'; st.textContent='Live Thermometer.'; st.style.color='#39ff6a'; }; th.onerror=function(){ st.textContent='Thermometer error.'; st.style.color='#f6a'; }; th.start(); return; } }catch(e){} st.textContent='No temperature sensor API on this device.'; st.style.color='#f6a'; val.textContent='Sensor not available'; };
    q(root,'te_save').onclick=function(){ if(val.textContent==='Sensor not available'||val.textContent==='—'){ st.textContent='No real reading to save.'; st.style.color='#f6a'; return; } api.save('Cold spot', tool.name+': '+val.textContent, tool.sku); };
    q(root,'te_go').click();
  };

  runners.board=function(tool,root,api){
    header(root,tool); var clock=big(root,'te_clock', new Date().toLocaleString());
    var st=note(root,'No automatic answers. Real clock + your notes.',true);
    var ta=document.createElement('textarea'); ta.rows=3; ta.placeholder='What did you observe?'; root.appendChild(ta);
    var r=row(root); btn(r,'te_save','Save evidence');
    var timer=setInterval(function(){ clock.textContent=new Date().toLocaleString(); },1000);
    q(root,'te_save').onclick=function(){ var n=(ta.value||'').trim(); if(!n){ st.textContent='Type a real observation first.'; st.style.color='#f6a'; return; } api.save('Other', tool.name+': '+n, tool.sku); };
    api.onClose=function(){ clearInterval(timer); };
  };

  // utilities for variety
  runners._timer=function(tool,root,api){ header(root,tool); var val=big(root,'te_val','0.00s'); var st=note(root,'Real clock timer.',true); var r=row(root); btn(r,'te_go','Start'); btn(r,'te_stop','Stop'); btn(r,'te_save','Save'); var t0=0,raf=0,run=false; function tick(){ if(!run) return; val.textContent=((performance.now()-t0)/1000).toFixed(2)+'s'; raf=requestAnimationFrame(tick); } q(root,'te_go').onclick=function(){ run=true; t0=performance.now(); tick(); }; q(root,'te_stop').onclick=function(){ run=false; cancelAnimationFrame(raf); }; q(root,'te_save').onclick=function(){ api.save('Other', tool.name+' '+val.textContent, tool.sku); }; api.onClose=function(){ run=false; cancelAnimationFrame(raf); }; };
  runners._calc=function(tool,root,api){ header(root,tool); var st=note(root,'Real calculator.',true); var r1=row(root); var a=document.createElement('input'); a.type='number'; a.value='1'; a.style.maxWidth='90px'; r1.appendChild(a); var op=document.createElement('select'); op.style.width='auto'; ['+','-','*','/'].forEach(function(o){ var x=document.createElement('option'); x.textContent=o; op.appendChild(x); }); r1.appendChild(op); var b=document.createElement('input'); b.type='number'; b.value='1'; b.style.maxWidth='90px'; r1.appendChild(b); var val=big(root,'te_val','= 2'); var r=row(root); btn(r,'te_go','Calculate'); btn(r,'te_save','Save'); q(root,'te_go').onclick=function(){ var x=+a.value,y=+b.value,o=op.value,res=o=='+'?x+y:o=='-'?x-y:o=='*'?x*y:(y?x/y:NaN); val.textContent='= '+(Number.isFinite(res)?res:'undefined'); }; q(root,'te_save').onclick=function(){ api.save('Other', tool.name+' '+val.textContent, tool.sku); }; };
  runners._noise=function(tool,root,api){ header(root,tool); var val=big(root,'te_val','—'); meter(root,'te_m'); var st=note(root,'Real microphone level.',true); var r=row(root); btn(r,'te_go','Listen'); btn(r,'te_stop','Stop'); btn(r,'te_save','Save'); var handle=null,raf=0; function stop(){ cancelAnimationFrame(raf); if(handle){ handle.getTracks().forEach(function(t){t.stop();}); handle=null; } } q(root,'te_go').onclick=function(){ stop(); if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ st.textContent='Microphone not available.'; st.style.color='#f6a'; return; } var a=ac(); if(!a){ st.textContent='Web Audio not available.'; st.style.color='#f6a'; return; } navigator.mediaDevices.getUserMedia({audio:true}).then(function(stt){ handle=stt; a.resume(); var src=a.createMediaStreamSource(stt); var an=a.createAnalyser(); an.fftSize=1024; src.connect(an); var data=new Uint8Array(an.frequencyBinCount); st.textContent='Live mic.'; st.style.color='#39ff6a'; (function tick(){ an.getByteFrequencyData(data); var sum=0; for(var i=0;i<data.length;i++) sum+=data[i]; var avg=sum/data.length; val.textContent=Math.round(avg)+' / 255'; q(root,'te_m').style.width=clamp(avg/255*100,0,100)+'%'; raf=requestAnimationFrame(tick); })(); }).catch(function(e){ st.textContent='Mic not available: '+e.message; st.style.color='#f6a'; }); }; q(root,'te_stop').onclick=stop; q(root,'te_save').onclick=function(){ api.save('Other', tool.name+' mic '+val.textContent, tool.sku); }; api.onClose=stop; };
  runners._compass=runners.emf; runners._log=runners.board; runners._check=runners.board; runners._timer2=runners._timer;

  var FALLBACK=['_timer','_calc','_noise','_compass','_log'];

  function openTool(tool, mountEl, api){
    if(api && api.onClose){ try{ api.onClose(); }catch(e){} }
    var fresh={ save:function(type,notes,place){ if(api&&api.save) api.save(type,notes,place||tool.sku); }, onClose:null };
    mountEl.innerHTML='';
    var panel=document.createElement('div'); panel.className='card'; panel.style.borderColor='#39ff6a88';
    panel.innerHTML='<div class="row" style="justify-content:space-between;align-items:center"><b style="color:#39ff6a">'+tool.name+'</b><button type="button" id="te_close">Close</button></div><div class="muted">'+tool.sku+' · '+tool.catLabel+' · '+(tool.rarity||'')+'</div><div class="muted">Sensor: '+(SENSOR_MAP[tool.cat]||'see panel')+'</div><div id="te_body"></div>';
    mountEl.appendChild(panel);
    var body=panel.querySelector('#te_body');
    var fn=runners[tool.cat];
    if(!fn){ var key=FALLBACK[(tool.id-1)%FALLBACK.length]; fn=runners[key]||runners._log; }
    try{ fn(tool, body, fresh); }
    catch(e){ body.innerHTML='<p style="color:#f6a">Could not open tool: '+(e&&e.message?e.message:e)+'</p>'; }
    panel.querySelector('#te_close').onclick=function(){ if(fresh.onClose) try{fresh.onClose();}catch(e){} mountEl.innerHTML='<div class="muted">Pick a tool to open its mini panel.</div>'; };
    // scroll into view
    try{ panel.scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(e){}
    return fresh;
  }

  global.CBGhostToolEngine={ openTool:openTool, runners:runners, sensorMap:SENSOR_MAP, categories:Object.keys(SENSOR_MAP) };
})(typeof window!=='undefined'?window:globalThis);
