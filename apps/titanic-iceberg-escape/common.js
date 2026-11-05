// Coffeebreak shared input: keyboard + touch joystick
window.CB={keys:{},joy:{x:0,y:0},look:{dx:0,dy:0}};
addEventListener('keydown',e=>CB.keys[e.code]=true);addEventListener('keyup',e=>CB.keys[e.code]=false);
CB.axis=function(){let x=CB.joy.x,y=CB.joy.y,k=CB.keys;
 if(k.KeyA||k.ArrowLeft)x-=1;if(k.KeyD||k.ArrowRight)x+=1;if(k.KeyW||k.ArrowUp)y-=1;if(k.KeyS||k.ArrowDown)y+=1;
 return{x:Math.max(-1,Math.min(1,x)),y:Math.max(-1,Math.min(1,y))}};
CB.initJoy=function(){const j=document.getElementById('joy'),kn=document.getElementById('knob');if(!j)return;let id=null;
 const mv=t=>{const r=j.getBoundingClientRect();let x=(t.clientX-r.left-60)/50,y=(t.clientY-r.top-60)/50;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}
  CB.joy.x=x;CB.joy.y=y;kn.style.left=35+x*40+'px';kn.style.top=35+y*40+'px'};
 j.addEventListener('touchstart',e=>{e.preventDefault();id=e.changedTouches[0].identifier;mv(e.changedTouches[0])},{passive:false});
 addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===id)mv(t)},{passive:false});
 addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===id){id=null;CB.joy.x=CB.joy.y=0;kn.style.left=kn.style.top='35px'}});
 if(!('ontouchstart' in window))j.style.display='none'};
CB.initLook=function(el){let id=null,lx=0,ly=0;
 el.addEventListener('touchstart',e=>{const t=e.changedTouches[0];if(id===null){id=t.identifier;lx=t.clientX;ly=t.clientY}},{passive:true});
 el.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===id){CB.look.dx+=t.clientX-lx;CB.look.dy+=t.clientY-ly;lx=t.clientX;ly=t.clientY}},{passive:true});
 el.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===id)id=null});
 el.addEventListener('mousemove',e=>{if(document.pointerLockElement===el||e.buttons){CB.look.dx+=e.movementX;CB.look.dy+=e.movementY}})};
CB.hold=function(btn,code){const on=e=>{e.preventDefault();CB.keys[code]=true},off=e=>{e.preventDefault();CB.keys[code]=false};
 btn.addEventListener('touchstart',on,{passive:false});btn.addEventListener('touchend',off);btn.addEventListener('mousedown',on);btn.addEventListener('mouseup',off)};
