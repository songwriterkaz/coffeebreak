(function(){
  'use strict';
  var KEY='cb_autism_planner_v1';
  var demo=!!window.CB_DEMO;
  var $=function(id){return document.getElementById(id);};
  var samples={
    Morning:['Wake up','Toilet','Brush teeth','Get dressed','Breakfast','Bag / shoes','Leave'],
    'After school':['Arrive home','Snack','Quiet time 20 min','Homework or reading','Free choice','Dinner prep help','Shower','Bed wind-down']
  };
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
  function save(data){localStorage.setItem(KEY,JSON.stringify(data));}
  var data=load()||{name:'Morning',steps:samples.Morning.slice(),index:0,done:{}};
  if(demo){
    data.steps=data.steps.slice(0,4);
    $('demoNote').textContent='Free demo shows up to 4 steps. Full version saves longer routines.';
  } else {$('demoNote').textContent='Full version — routines save on this device only.';}
  function paint(){
    var steps=data.steps||[];
    var i=Math.min(data.index||0,steps.length);
    var now=steps[i]||'All done for now';
    var next=steps[i+1]||'—';
    $('nowTitle').textContent=now;
    $('nextTitle').textContent=next;
    $('nowMeta').textContent=steps.length?(('Step '+(Math.min(i+1,steps.length))+' of '+steps.length)):'Add steps below';
    $('nextMeta').textContent=next==='—'?'':'Up next';
    var list=$('stepList');list.innerHTML='';
    steps.forEach(function(s,idx){
      var li=document.createElement('li');
      if(idx<i)li.className='done';
      li.innerHTML='<span class="dot">'+(idx+1)+'</span><span>'+s.replace(/[<>&]/g,'')+'</span>';
      list.appendChild(li);
    });
    $('routineName').value=data.name||'';
    $('stepsIn').value=steps.join('\n');
  }
  function advance(){data.index=Math.min((data.index||0)+1,(data.steps||[]).length);save(data);paint();}
  $('btnDone').onclick=advance;
  $('btnSkip').onclick=advance;
  $('btnSaveRoutine').onclick=function(){
    var name=($('routineName').value||'Routine').trim();
    var steps=$('stepsIn').value.split(/\n+/).map(function(s){return s.trim();}).filter(Boolean);
    if(demo)steps=steps.slice(0,4);
    if(!steps.length){$('editStatus').textContent='Add at least one step.';return;}
    data={name:name,steps:steps,index:0,done:{}};save(data);$('editStatus').textContent='Saved “‘+name+'” ('+steps.length+' steps).';paint();
  };
  $('btnLoadMorning').onclick=function(){$('routineName').value='Morning';$('stepsIn').value=samples.Morning.join('\n');};
  $('btnLoadSchool').onclick=function(){$('routineName').value='After school';$('stepsIn').value=samples['After school'].join('\n');};
  $('btnBig').onclick=function(){document.documentElement.style.fontSize='20px';};
  $('btnResetText').onclick=function(){document.documentElement.style.fontSize='';};
  paint();
})();