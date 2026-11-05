(function(){
'use strict';
var $=function(i){return document.getElementById(i)};
var MEM={};var SS={get:function(k){try{var v=window.localStorage.getItem(k);return v==null?(MEM[k]||null):v}catch(e){return MEM[k]||null}},set:function(k,v){MEM[k]=v;try{window.localStorage.setItem(k,v);return true}catch(e){return false}}};
var IDB=null;function idbOpen(){return new Promise(function(res){try{var r=indexedDB.open('cb-rsp',1);r.onupgradeneeded=function(){r.result.createObjectStore('b')};r.onsuccess=function(){IDB=r.result;res(IDB)};r.onerror=function(){res(null)}}catch(e){res(null)}})}
function idbPut(k,v){return new Promise(function(res){try{if(!IDB)return res(false);var t=IDB.transaction('b','readwrite');t.objectStore('b').put(v,k);t.oncomplete=function(){res(true)};t.onerror=function(){res(false)}}catch(e){res(false)}})}
function idbGet(k){return new Promise(function(res){try{if(!IDB)return res(null);var q=IDB.transaction('b').objectStore('b').get(k);q.onsuccess=function(){res(q.result||null)};q.onerror=function(){res(null)}}catch(e){res(null)}})}
function msg(t){$('msg').textContent=t||'';clearTimeout(msg.t);if(t)msg.t=setTimeout(function(){$('msg').textContent=''},6000)}
var COLORS=['#ff2d95','#ff7bbd','#c86bff','#7b8cff','#4dc3ff','#3ddc97','#a6e22e','#ffd166','#ff9f43','#ff6b6b','#e056fd','#00d2d3','#54a0ff','#5f27cd','#1dd1a1','#feca57'];
var INST=['Piano','Electric Piano','Organ','Pad','Bass','Lead','Pluck'];
var DRUMS=['Kick','Snare','Clap','Closed Hat','Open Hat','Low Tom','Hi Tom','Rim'];
function defFx(){return{eq:{on:false,b:[{f:100,g:0,q:0.7},{f:500,g:0,q:1},{f:2500,g:0,q:1},{f:8000,g:0,q:0.7}]},gate:{on:false,th:-50},comp:{on:false,th:-20,ra:4,at:0.01,re:0.2,mk:0},dist:{on:false,amt:20,mix:0.5},chorus:{on:false,rate:1.2,depth:0.004,mix:0.5},delay:{on:false,time:0.375,fb:0.35,mix:0.3},reverb:{on:false,size:2.2,mix:0.3},tune:{on:false,amt:1,speed:0.5}}}
function newTrack(i){var type=i<8?'audio':i<12?'synth':i<14?'drums':'audio';var names={8:'Piano',9:'Bass',10:'Pad',11:'Lead',12:'Drums',13:'Drums 2'};
 return{id:'t'+i+'_'+Date.now().toString(36),name:names[i]||('Audio '+(i<8?i+1:i-5)),type:type,inst:{8:'Piano',9:'Bass',10:'Pad',11:'Lead'}[i]||'Piano',kit:'808',vol:0.8,pan:0,mute:false,solo:false,arm:false,mon:false,input:'',sa:0,sb:0,color:COLORS[i%16],fx:defFx(),clips:[]}}
function newProject(){var t=[];for(var i=0;i<16;i++)t.push(newTrack(i));return{v:1,name:'Untitled',bpm:120,ts:[4,4],met:false,ci:1,loop:{on:false,s:0,e:16},punch:{on:false,s:4,e:8},tracks:t,busA:{vol:0.8,size:3},busB:{vol:0.7,time:0.5,fb:0.4},master:{vol:1,eq:{on:true,lo:0,mid:0,hi:0},mb:{on:true,th:-18,ra:3},lim:{on:true,ceil:-1,gain:0}}}}
var P=newProject(),BUFS={},PEAKS={},SEL={t:0,c:null},UNDO=[],REDO=[];
var uid=function(){return Math.random().toString(36).slice(2,9)};
function bpb(){return P.ts[0]*4/P.ts[1]}
function spb(){return 60/P.bpm}
function commit(){UNDO.push(JSON.stringify(P));if(UNDO.length>100)UNDO.shift();REDO.length=0;dirty()}
function undo(){if(!UNDO.length)return;REDO.push(JSON.stringify(P));P=JSON.parse(UNDO.pop());afterLoad();msg('Undone')}
function redo(){if(!REDO.length)return;UNDO.push(JSON.stringify(P));P=JSON.parse(REDO.pop());afterLoad();msg('Redone')}
function selClip(){var t=P.tracks[SEL.t];if(!t)return null;for(var i=0;i<t.clips.length;i++)if(t.clips[i].id===SEL.c)return t.clips[i];return null}
function songEnd(){var e=0;P.tracks.forEach(function(t){t.clips.forEach(function(c){e=Math.max(e,c.start+c.len)})});return e}
var AC=window.AudioContext||window.webkitAudioContext;var ac=new AC({latencyHint:'interactive'});
