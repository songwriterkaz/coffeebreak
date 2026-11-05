/* Coffeebreak online play: invite-link rooms.
   Same PeerJS build, shared ICE list (STUN + relay) and settings as the Coffeebreak phone apps,
   with the Trystero (nostr) fallback used by CB Radio and Confessions.
   No chat, no names, no lobby: only people holding the invite link can join. */
(function(){
'use strict';
var W=window;
var ICE_URL='https://songwriterkaz.github.io/coffeebreak-ice/ice.json';
var DEF=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302','stun:stun4.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:global.stun.twilio.com:3478'},{urls:'stun:stun.nextcloud.com:443'}];
var ICE={iceServers:DEF.slice(),iceTransportPolicy:'all',iceCandidatePoolSize:10};
function setIce(l){if(Array.isArray(l)&&l.length){ICE.iceServers.length=0;l.forEach(function(s){ICE.iceServers.push(s)})}}
try{var c=JSON.parse(localStorage.getItem('cb_ice')||'null');if(c&&c.iceServers)setIce(c.iceServers)}catch(e){}
var iceReady=fetch(ICE_URL+'?t='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){if(j&&Array.isArray(j.iceServers)&&j.iceServers.length){try{localStorage.setItem('cb_ice',JSON.stringify({iceServers:j.iceServers}))}catch(e){}setIce(j.iceServers)}}).catch(function(){});
function iceThen(f){var done=false;function go(){if(!done){done=true;f()}}iceReady.then(go);setTimeout(go,2500)}
var APP='coffeebreaks-itch-play-v1';
function rid(){var a='abcdefghjkmnpqrstuvwxyz23456789',b=new Uint32Array(12);crypto.getRandomValues(b);var s='';for(var i=0;i<12;i++)s+=a[b[i]%a.length];return s}
function Em(){this._h={}}
Em.prototype.on=function(e,f){(this._h[e]=this._h[e]||[]).push(f);return this};
Em.prototype.emit=function(e,a){(this._h[e]||[]).slice().forEach(function(f){try{f(a)}catch(x){console.error(x)}})};
function Conn(kind,sendFn,closeFn){Em.call(this);this.kind=kind;this.open=true;this._s=sendFn;this._c=closeFn}
Conn.prototype=Object.create(Em.prototype);
Conn.prototype.send=function(d){if(this.open){try{this._s(d)}catch(e){}}};
Conn.prototype.close=function(){if(!this.open)return;this.open=false;try{this._c&&this._c()}catch(e){}this.emit('close')};
Conn.prototype._gone=function(){if(!this.open)return;this.open=false;clearInterval(this._hb);this.emit('close')};
Conn.prototype._in=function(d){this._seen=Date.now();if(d&&d.__cb==='hb')return;this.emit('data',d)};
function arm(c){c._seen=Date.now();c._hb=setInterval(function(){if(!c.open){clearInterval(c._hb);return}c.send({__cb:'hb'});if(Date.now()-c._seen>10000)c._gone()},2000);c.on('close',function(){clearInterval(c._hb)});return c}
function wrapPeerConn(dc){var c=new Conn('p2p',function(d){dc.send(d)},function(){dc.close()});
 dc.on('data',function(d){c._in(d)});dc.on('close',function(){c._gone()});dc.on('error',function(){c._gone()});
 if(dc.peerConnection)dc.peerConnection.addEventListener('connectionstatechange',function(){var s=dc.peerConnection.connectionState;if(s==='failed'||s==='closed')c._gone()});
 return c}
function pid(game,room){return 'cbplay-'+game+'-'+room}
function tRoom(game,room){return W.Trystero.joinRoom({appId:APP,rtcConfig:{iceServers:ICE.iceServers}},game+'-'+room)}

/* ---- host: listen on PeerJS and Trystero at once ---- */
function host(game,opts){opts=opts||{};var H=new Em(),max=opts.max||1,conns=[];H.room=rid();H.ready=false;
 function add(c){conns.forEach(function(x){if(x.open&&x._seen&&Date.now()-x._seen>4500)x._gone()});if(conns.filter(function(x){return x.open}).length>=max){c.send({__cb:'full'});setTimeout(function(){c.close()},400);return}
  conns.push(c);c.on('close',function(){H.emit('leave',c)});H.emit('peer',c)}
 function ready(){if(!H.ready){H.ready=true;H.emit('ready',H.room)}}
 iceThen(function(){
  if(W.Peer){var tries=0;(function start(){var p;try{p=new W.Peer(pid(game,H.room),{config:ICE,debug:0,pingInterval:4000})}catch(e){return}H.peer=p;
   p.on('open',ready);
   p.on('connection',function(dc){dc.on('open',function(){add(arm(wrapPeerConn(dc)))})});
   p.on('disconnected',function(){setTimeout(function(){try{if(!p.destroyed)p.reconnect()}catch(e){}},1500)});
   p.on('error',function(e){if(e&&e.type==='unavailable-id'&&!H.shared&&tries++<3){p.destroy();H.room=rid();start()}})})()}
  if(W.Trystero){try{var r=H.troom=tRoom(game,H.room),a=r.makeAction('m'),tp={};
   a.onMessage=function(d,ctx){var id=ctx&&ctx.peerId;if(!d||!id)return;
    if(d.__cb==='hello'&&!tp[id]){var c=tp[id]=new Conn('relay',function(x){a.send({__cb:'d',d:x},{target:id})},function(){a.send({__cb:'bye'},{target:id})});
     c.on('close',function(){delete tp[id]});a.send({__cb:'welcome'},{target:id});add(arm(c))}
    else if(d.__cb==='d'&&tp[id])tp[id]._in(d.d);
    else if(d.__cb==='bye'&&tp[id])tp[id]._gone()};
   r.onPeerLeave=function(id){if(tp[id])tp[id]._gone()};
   setTimeout(ready,W.Peer?6000:300)}catch(e){}}
  if(!W.Peer&&!W.Trystero)H.emit('fail','no network scripts')});
 H.conns=function(){return conns.filter(function(c){return c.open})};
 H.broadcast=function(d){H.conns().forEach(function(c){c.send(d)})};
 H.link=function(){H.shared=true;return location.href.split('#')[0]+'#cbplay='+game+'.'+H.room};
 H.close=function(){conns.forEach(function(c){c.close()});try{H.peer&&H.peer.destroy()}catch(e){}try{H.troom&&H.troom.leave()}catch(e){}};
 return H}

/* ---- join: PeerJS first, Trystero if that does not connect ---- */
function join(game,room,opts){opts=opts||{};var J=new Em(),done=false,p2pWait=opts.p2pWait||9000;
 function win(c){if(done){c.close();return}done=true;var full=false;
  c.on('data',function(d){if(d&&d.__cb==='full'){full=true;J.emit('fail','full')}});J.conn=c;J.emit('open',c)}
 function relay(){if(done||J.relaying||!W.Trystero)return;J.relaying=true;J.emit('status','Trying another route…');
  try{var r=J.troom=tRoom(game,room),a=r.makeAction('m'),hostId=null,c=null;
   r.onPeerJoin=function(id){if(!hostId)a.send({__cb:'hello'},{target:id})};
   a.onMessage=function(d,ctx){var id=ctx&&ctx.peerId;if(!d)return;
    if(d.__cb==='welcome'&&!hostId&&!done){hostId=id;c=new Conn('relay',function(x){a.send({__cb:'d',d:x},{target:hostId})},function(){a.send({__cb:'bye'},{target:hostId});try{r.leave()}catch(e){}});win(arm(c))}
    else if(id===hostId&&c){if(d.__cb==='d')c._in(d.d);else if(d.__cb==='bye')c._gone()}};
   r.onPeerLeave=function(id){if(id===hostId&&c)c._gone()}}catch(e){}}
 iceThen(function(){
  if(W.Peer){try{var p=J.peer=new W.Peer(undefined,{config:ICE,debug:0,pingInterval:4000});
   p.on('open',function(){var dc=p.connect(pid(game,room),{reliable:true});dc.on('open',function(){if(!done)win(arm(wrapPeerConn(dc)));else dc.close()})});
   p.on('error',function(){relay()});p.on('disconnected',function(){if(!done)relay()})}catch(e){relay()}}
  setTimeout(relay,W.Peer?p2pWait:0);
  setTimeout(function(){if(!done)J.emit('fail','timeout')},(opts.timeout||35000))});
 J.close=function(){try{J.conn&&J.conn.close()}catch(e){}try{J.peer&&J.peer.destroy()}catch(e){}try{J.troom&&J.troom.leave()}catch(e){}};
 return J}

function invite(){var m=/[#&]cbplay=([a-z0-9-]+)\.([a-z0-9]{12})\b/.exec(location.hash||'');return m?{game:m[1],room:m[2]}:null}

/* ---- small shared panel: one Invite button, then the link to send ---- */
function panel(o){var css='position:fixed;z-index:9999;'+(o.pos||'top:8px;right:8px;')+'background:#12060c;border:2px solid #e8a0b0;border-radius:12px;padding:7px 9px;font:13px Georgia,serif;color:#ffe9c7;max-width:270px;box-shadow:0 4px 18px #0008';
 var b=document.createElement('div');b.id='cbPlay';b.style.cssText=css;
 b.innerHTML='<div style="display:flex;gap:6px;align-items:center"><button id="cbInv" style="font:bold 13px Georgia;background:#e8a0b0;color:#12060c;border:0;border-radius:9px;padding:6px 10px;cursor:pointer">🌐 '+(o.label||'Invite a friend')+'</button><button id="cbX" title="Hide" style="background:none;border:0;color:#e8a0b0;cursor:pointer;font-size:15px">✕</button></div><div id="cbSt" style="margin-top:5px;display:none"></div><div id="cbLk" style="display:none;margin-top:5px"><input id="cbUrl" readonly style="width:100%;box-sizing:border-box;font:11px monospace;background:#000;color:#ffe9c7;border:1px solid #e8a0b0;border-radius:6px;padding:4px"><div style="margin-top:4px;display:flex;gap:6px"><button id="cbSh" style="cursor:pointer">Share</button><button id="cbCp" style="cursor:pointer">Copy</button></div><div style="font-size:11px;opacity:.75;margin-top:4px">Send this link only to people you know. Whoever opens it joins your game. No chat, no names.</div></div>';
 (document.body||document.documentElement).appendChild(b);
 var $=function(i){return document.getElementById(i)},P={el:b,status:function(s){var e=$('cbSt');e.style.display=s?'block':'none';e.textContent=s||''}};
 $('cbX').onclick=function(){var s=b.dataset.min==='1';b.dataset.min=s?'0':'1';$('cbLk').style.display=(!s||!P.hostRef)?'none':'block';$('cbInv').style.display=s?'':'none';$('cbX').textContent=s?'✕':'🌐'};
 function showLink(u){$('cbLk').style.display='block';$('cbUrl').value=u;
  $('cbCp').onclick=function(){var i=$('cbUrl');i.select();var ok=false;try{navigator.clipboard.writeText(u).then(function(){P.status('Link copied. Send it to your friend.')},function(){ok=document.execCommand('copy');P.status(ok?'Link copied.':'Select the link above and copy it.')})}catch(e){try{ok=document.execCommand('copy')}catch(x){}P.status(ok?'Link copied.':'Select the link above and copy it.')}};
  $('cbSh').onclick=function(){if(navigator.share)navigator.share({title:o.title||'Play with me',text:'Tap to join my game',url:u}).catch(function(){$('cbCp').onclick()});else $('cbCp').onclick()}}
 $('cbInv').onclick=function(){if(location.protocol==='file:'){P.status('Online invites work in the browser version of this game on itch.io.');return}
  if(P.hostRef){showLink(P.hostRef.link());return}$('cbInv').disabled=true;P.status('Opening your game room…');
  var H=P.hostRef=host(o.game,{max:o.max||1});
  H.on('ready',function(){P.status(o.max>1?'Waiting for friends to open the link…':'Waiting for your friend to open the link…');showLink(H.link());$('cbInv').textContent='🌐 Invite link';$('cbInv').disabled=false});
  H.on('peer',function(c){P.status(o.max>1?'A friend joined.':'Your friend joined.');if(H.conns().length>=(o.max||1))setTimeout(function(){if(H.conns().length>=(o.max||1))$('cbLk').style.display='none'},2500);o.onPeer&&o.onPeer(c,H)});
  H.on('leave',function(c){if(!H.conns().length)P.status('Your friend left. The same link still works if they come back.');o.onLeave&&o.onLeave(c,H)});
  H.on('fail',function(){P.status('Online play could not start on this network.')});
  o.onHost&&o.onHost(H)};
 var inv=invite();
 if(inv&&inv.game===o.game){$('cbInv').style.display='none';var tries=0;
  (function go(){P.status(tries?'Reconnecting…':'Joining your friend\u2019s game…');var J=P.joinRef=join(inv.game,inv.room);
   J.on('status',function(s){P.status(s)});
   J.on('open',function(c){P.status('Connected. You are in your friend\u2019s game.');o.onJoin&&o.onJoin(c);
    c.on('close',function(){if(J._full)return;if(tries++<3){P.status('Connection dropped. Reconnecting…');setTimeout(go,1500)}else{P.status('Your friend\u2019s game has ended.');o.onHostGone&&o.onHostGone()}})});
   J.on('fail',function(r){if(r==='full'){J._full=true;P.status('That game is already full.')}else P.status('Could not reach your friend\u2019s game. Ask them for a new link.');o.onJoinFail&&o.onJoinFail(r)})})()}
 return P}

W.CBNet={host:host,join:join,invite:invite,panel:panel,ice:ICE};
})();
