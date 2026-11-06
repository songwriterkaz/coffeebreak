(function(){
  'use strict';
  var $=function(id){return document.getElementById(id);};
  var canvas=$('stage'), ctx=canvas.getContext('2d');
  var W=520,H=520;
  var state={x:W*0.5,y:H*0.62,tx:W*0.5,ty:H*0.62,dragging:false,particles:[],beta:null,gamma:null,sensors:false,rooms:0,session:[],timer:null,left:0};
  function log(line){state.session.push({t:new Date().toISOString(),line:line});var d=document.createElement('div');d.textContent=new Date().toLocaleTimeString()+' · '+line;$('sessionLog').prepend(d);}
  function setStatus(ok,msg){var el=$('sensorStatus');el.className='status '+(ok?'ok':'bad');el.textContent=msg;}
  function onOrient(e){if(e.beta==null&&e.gamma==null)return;state.beta=e.beta;state.gamma=e.gamma;if(!state.dragging){state.tx=W*0.5+(e.gamma||0)*3;state.ty=H*0.55+((e.beta||0)-45)*2;}}
  $('btnEnable').onclick=function(){
    function go(){window.addEventListener('deviceorientation',onOrient,true);state.sensors=true;setStatus(true,'Tilt on. Wave by tilting or dragging.');log('Tilt sensors enabled');}
    if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
      DeviceOrientationEvent.requestPermission().then(function(s){if(s==='granted')go();else setStatus(false,'Tilt permission denied.');}).catch(function(){setStatus(false,'Tilt unavailable.');});
    } else if(typeof DeviceOrientationEvent!=='undefined'){go();} else setStatus(false,'No orientation sensor on this device. Drag works anyway.');
  };
  function pointer(e){var r=canvas.getBoundingClientRect();var cx=(e.clientX||(e.touches&&e.touches[0].clientX))-r.left;var cy=(e.clientY||(e.touches&&e.touches[0].clientY))-r.top;return{x:cx*(W/r.width),y:cy*(H/r.height)};}
  canvas.addEventListener('pointerdown',function(e){state.dragging=true;var p=pointer(e);state.tx=p.x;state.ty=p.y;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',function(e){if(!state.dragging)return;var p=pointer(e);state.tx=p.x;state.ty=p.y;});
  canvas.addEventListener('pointerup',function(){state.dragging=false;});
  $('btnClearSmoke').onclick=function(){state.particles=[];};
  function tick(){
    state.x+=(state.tx-state.x)*0.18;state.y+=(state.ty-state.y)*0.18;
    var speed=Math.hypot(state.tx-state.x,state.ty-state.y);
    if(speed>0.4||state.dragging){
      for(var i=0;i<3;i++){state.particles.push({x:state.x+(Math.random()-0.5)*8,y:state.y-40,vx:(Math.random()-0.5)*0.6,vy:-0.8-Math.random()*1.2,life:1,r:4+Math.random()*10});}
    }
    ctx.clearRect(0,0,W,H);
    // floor glow
    var g=ctx.createRadialGradient(W/2,H*0.85,10,W/2,H*0.85,180);g.addColorStop(0,'#1c7a3533');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // stick
    ctx.save();ctx.translate(state.x,state.y);ctx.rotate((state.gamma||0)*Math.PI/180*0.15);
    ctx.fillStyle='#5a3a18';ctx.fillRect(-5,-70,10,90);ctx.fillStyle='#2d6a3a';ctx.beginPath();ctx.ellipse(0,-78,14,22,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
    // smoke
    for(var j=state.particles.length-1;j>=0;j--){
      var p=state.particles[j];p.x+=p.vx;p.y+=p.vy;p.life-=0.012;p.r+=0.08;
      if(p.life<=0){state.particles.splice(j,1);continue;}
      ctx.beginPath();ctx.fillStyle='rgba(200,230,210,'+(p.life*0.35)+')';ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    }
    $('readout').textContent='Drag to wave · rooms cleansed: '+state.rooms+(state.sensors&&state.beta!=null?(' · β '+state.beta.toFixed(0)+'° γ '+(state.gamma||0).toFixed(0)+'°'):'');
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  function stopTimer(){if(state.timer){clearInterval(state.timer);state.timer=null;}}
  $('btnStart').onclick=function(){
    var room=($('room').value||'').trim();if(!room){ $('timerOut').textContent='Name a room first.'; return; }
    stopTimer();state.left=parseInt($('mins').value,10)*60;log('Cleanse started: '+room+' ('+$('mins').value+' min)');
    state.timer=setInterval(function(){
      state.left--;var m=Math.floor(state.left/60),s=state.left%60;
      $('timerOut').textContent=room+': '+m+':'+String(s).padStart(2,'0')+' left';
      if(state.left<=0){stopTimer();state.rooms++;$('timerOut').textContent='Done — '+room+' timer finished.';log('Cleanse finished: '+room);$('readout').textContent='Drag to wave · rooms cleansed: '+state.rooms;}
    },1000);
  };
  $('btnStop').onclick=function(){stopTimer();$('timerOut').textContent='Timer stopped.';log('Cleanse stopped');};
  $('btnSave').onclick=function(){
    var entry={app:'Smudge Stick',when:new Date().toISOString(),location:($('room').value||'').trim(),notes:'Rooms cleansed: '+state.rooms+'. Session lines: '+state.session.map(function(x){return x.line;}).join(' | '),sensors:state.sensors?'tilt optional':'drag only'};
    try{
      if(window.CBGhostJournal&&typeof CBGhostJournal.save==='function'){CBGhostJournal.save(entry);$('saveStatus').textContent='Saved to Ghost Journal on this device.';}
      else{
        var key='cb_ghost_journal';var all=[];try{all=JSON.parse(localStorage.getItem(key)||'[]');}catch(e){}
        all.unshift(entry);localStorage.setItem(key,JSON.stringify(all.slice(0,200)));
        $('saveStatus').textContent='Saved to Ghost Journal (localStorage).';
      }
      log('Saved session');
    }catch(e){$('saveStatus').textContent='Could not save: '+e.message;}
  };
})();
