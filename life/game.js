/* Coffeebreak Life. (c) Karen Elizabeth O'Brien (Coffeebreak). All rights reserved. */
(function(){
'use strict';
var CH=window.CB_CHARS||[];
var KEY='cbLife.save.v1';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var app=$('#app');
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rnd(a){return a[Math.floor(Math.random()*a.length)]}
function charById(id){for(var i=0;i<CH.length;i++)if(CH[i].id===id)return CH[i];return CH[0]}

/* ---------- colour options ---------- */
var HAIR=[{id:'own',n:'Original'},{id:'#ffe27a',d:'#d9a93a',n:'Blonde'},{id:'#2b1f28',d:'#120b10',n:'Black'},{id:'#5a3a2a',d:'#2f1d14',n:'Brown'},{id:'#c0502a',d:'#7e2e14',n:'Copper'},{id:'#ff8fc4',d:'#d6338a',n:'Pink'},{id:'#b48cff',d:'#7a52c9',n:'Lilac'},{id:'#7fd6e8',d:'#3a98ad',n:'Aqua'},{id:'#f2eef5',d:'#b9aec4',n:'Silver'}];
var CLOTH=[{id:'own',n:'Coffeebreak pink',a:'#ff5c9a',b:'#d6336f'},{id:'berry',n:'Berry',a:'#c2185b',b:'#880e4f'},{id:'lilac',n:'Lilac',a:'#b07cff',b:'#7c4dd6'},{id:'mint',n:'Mint',a:'#4fd1a5',b:'#24a07a'},{id:'sky',n:'Sky',a:'#5aa9e6',b:'#2f78b8'},{id:'peach',n:'Peach',a:'#ff9a6b',b:'#e0663a'},{id:'noir',n:'Noir',a:'#4a3a48',b:'#241a22'}];
var SKIN=[{id:'own',n:'Original'},{id:'#ffe3d3',n:'Light'},{id:'#f6d3ba',n:'Fair'},{id:'#e2ae8a',n:'Tan'},{id:'#c68a62',n:'Golden'},{id:'#9a6440',n:'Brown'},{id:'#6e4428',n:'Deep'}];
var ACC=[{id:'none',n:'None'},{id:'bow',n:'Big bow'},{id:'star',n:'Star clip'},{id:'heart',n:'Heart clip'},{id:'flower',n:'Flower'},{id:'phones',n:'Headphones'}];
function accSvg(id){
  if(id==='bow')return '<g transform="translate(262,78)"><path d="M0,0 C-30,-24 -34,18 0,0 Z" fill="#ff5c9a" stroke="#3a2933" stroke-width="3"/><path d="M0,0 C30,-24 34,18 0,0 Z" fill="#ff5c9a" stroke="#3a2933" stroke-width="3"/><circle r="7" fill="#d6336f" stroke="#3a2933" stroke-width="3"/></g>';
  if(id==='star')return '<path transform="translate(258,82)" d="M0,-18 5,-6 18,-6 8,2 12,15 0,7 -12,15 -8,2 -18,-6 -5,-6Z" fill="#ffd98a" stroke="#3a2933" stroke-width="3"/>';
  if(id==='heart')return '<path transform="translate(256,84)" d="M0,14 C-22,-2 -12,-20 0,-9 C12,-20 22,-2 0,14Z" fill="#ff5c9a" stroke="#3a2933" stroke-width="3"/>';
  if(id==='flower')return '<g transform="translate(258,84)" stroke="#3a2933" stroke-width="2.5"><circle cx="0" cy="-11" r="8" fill="#fff3f8"/><circle cx="11" cy="-2" r="8" fill="#fff3f8"/><circle cx="7" cy="11" r="8" fill="#fff3f8"/><circle cx="-7" cy="11" r="8" fill="#fff3f8"/><circle cx="-11" cy="-2" r="8" fill="#fff3f8"/><circle r="6" fill="#ffd98a"/></g>';
  if(id==='phones')return '<g stroke="#3a2933" stroke-width="3"><path d="M146,128 C140,40 280,40 274,128" fill="none" stroke="#ff5c9a" stroke-width="10"/><rect x="134" y="112" width="24" height="40" rx="10" fill="#ff5c9a"/><rect x="262" y="112" width="24" height="40" rx="10" fill="#ff5c9a"/></g>';
  return '';
}
var cache={};
function look(L){
  var c=charById(L.ch); var o=L.outfit&&c.svg[L.outfit]?L.outfit:c.outfits[0].id;
  var k=[c.id,o,L.hair,L.cloth,L.skin,L.acc].join('|'); if(cache[k])return cache[k];
  var s=c.svg[o];
  function sw(a,b){s=s.split(a).join(b)}
  if(L.hair&&L.hair!=='own'){var h=HAIR.filter(function(x){return x.id===L.hair})[0];if(h){sw(c.hairdark,'@HD@');sw(c.hair,'@HA@');sw('@HD@',h.d);sw('@HA@',h.id)}}
  if(L.skin&&L.skin!=='own'){sw(c.skin,L.skin)}
  if(L.cloth&&L.cloth!=='own'){var cl=CLOTH.filter(function(x){return x.id===L.cloth})[0];if(cl){sw('#ff5c9a','@A@');sw('#d6336f','@B@');sw('@A@',cl.a);sw('@B@',cl.b)}}
  var a=accSvg(L.acc); if(a)s=s.replace(/<\/svg>\s*$/,a+'</svg>');
  return cache[k]='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
}

/* ---------- furniture ---------- */
var F={
 bed:{n:'Heart Bed',p:0,c:'Sleep',acts:[{n:'Sleep 8 hours',m:480,e:{energy:100,hygiene:-10},sleep:1},{n:'Power nap',m:60,e:{energy:22}}]},
 fridge:{n:'Pink Fridge',p:0,acts:[{n:'Grab a snack',m:20,e:{hunger:30}},{n:'Make a sandwich',m:40,e:{hunger:50,fun:3}}]},
 shower:{n:'Shower',p:0,acts:[{n:'Take a shower',m:20,e:{hygiene:75}}]},
 sofa:{n:'Comfy Sofa',p:0,acts:[{n:'Relax',m:30,e:{energy:12,fun:10}},{n:'Daydream',m:20,e:{fun:8}}]},
 phone:{n:'Pink Phone',p:0,acts:[{n:'Call a friend',m:30,e:{social:30},fr:3},{n:'Scroll the feed',m:20,e:{fun:12,social:6}}]},
 stove:{n:'Retro Stove',p:120,acts:[{n:'Cook a pink pasta',m:60,e:{hunger:75,fun:8}},{n:'Bake cupcakes',m:90,e:{hunger:45,fun:22}}]},
 coffee:{n:'Espresso Machine',p:140,sk:'barista',acts:[{n:'Brew a latte',m:15,e:{energy:20,hunger:6},skill:1},{n:'Practise latte art',m:45,e:{fun:12},skill:3}]},
 bath:{n:'Bubble Bath',p:220,acts:[{n:'Bubble bath',m:50,e:{hygiene:100,fun:18,energy:6}}]},
 vanity:{n:'Salon Mirror',p:130,sk:'stylist',acts:[{n:'Fix hair and makeup',m:20,e:{hygiene:15,fun:8}},{n:'Practise styling',m:45,e:{fun:10},skill:3}]},
 tv:{n:'Pink TV',p:150,acts:[{n:'Watch the Coffeebreak TV Series',m:60,e:{fun:35,energy:-3}}]},
 turntable:{n:'Vinyl Turntable',p:180,sk:'singer',acts:[{n:'Spin a pink record',m:40,e:{fun:38},skill:1},{n:'Sing along',m:45,e:{fun:25},skill:3}]},
 mic:{n:'Karaoke Mic',p:90,sk:'singer',acts:[{n:'Practise singing',m:45,e:{fun:20},skill:3},{n:'Write a song',m:60,e:{fun:25,energy:-5},skill:4}]},
 decks:{n:'DJ Decks',p:260,sk:'dj',acts:[{n:'Mix a set',m:45,e:{fun:30},skill:3},{n:'Throw a bedroom rave',m:60,e:{fun:40,social:10,energy:-8},skill:2}]},
 laptop:{n:'Pink Laptop',p:200,acts:[{n:'Video chat friends',m:40,e:{social:35,fun:10},fr:4},{n:'Play a game',m:45,e:{fun:32}}]},
 books:{n:'Bookshelf',p:110,acts:[{n:'Read a book',m:45,e:{fun:22,energy:-2}}]},
 plant:{n:'Potted Palm',p:40,decor:2,acts:[{n:'Water the plant',m:5,e:{fun:3}}]},
 rug:{n:'Heart Rug',p:60,decor:3,acts:[{n:'Stretch on the rug',m:15,e:{energy:6,fun:4}}]},
 lamp:{n:'Glow Lamp',p:70,decor:3,acts:[{n:'Admire the glow',m:5,e:{fun:4}}]},
 art:{n:'Heart Wall Art',p:80,decor:4,acts:[{n:'Admire the art',m:5,e:{fun:5}}]},
 disco:{n:'Disco Ball',p:150,decor:6,acts:[{n:'Dance under the lights',m:30,e:{fun:30,energy:-8,social:4}}]},
 table:{n:'Cafe Table',p:90,decor:2,acts:[{n:'Eat at the table',m:30,e:{hunger:20,fun:6}}]}
};
var FKEYS=Object.keys(F);
function fsvg(id){
 var o='stroke="#3a2933" stroke-width="3" stroke-linejoin="round"';var P='#ff5c9a',L='#ffa3c7',W='#fff3f8',D='#d6336f',K='#4d1c3e';
 var b={
 bed:'<rect x="10" y="40" width="80" height="34" rx="8" fill="'+L+'" '+o+'/><rect x="6" y="22" width="20" height="58" rx="6" fill="'+P+'" '+o+'/><rect x="28" y="38" width="22" height="12" rx="5" fill="'+W+'" '+o+'/><path d="M52 52 h38 v22 h-38z" fill="'+P+'" '+o+'/><path d="M71 58 c-6-6-12 0 0 9 c12-9 6-15 0-9z" fill="'+W+'"/>',
 fridge:'<rect x="26" y="8" width="48" height="84" rx="10" fill="'+L+'" '+o+'/><line x1="26" y1="40" x2="74" y2="40" '+o+'/><rect x="62" y="20" width="5" height="14" rx="2" fill="'+W+'" '+o+'/><rect x="62" y="48" width="5" height="18" rx="2" fill="'+W+'" '+o+'/>',
 shower:'<path d="M20 90 V14 h30" fill="none" '+o+' stroke-width="5"/><path d="M40 14 h22 l6 10 h-34z" fill="'+P+'" '+o+'/><g fill="#7fd6e8"><circle cx="44" cy="34" r="3"/><circle cx="54" cy="40" r="3"/><circle cx="62" cy="34" r="3"/><circle cx="48" cy="48" r="3"/><circle cx="58" cy="54" r="3"/></g><rect x="26" y="80" width="56" height="10" rx="4" fill="'+W+'" '+o+'/>',
 sofa:'<rect x="8" y="34" width="84" height="30" rx="12" fill="'+P+'" '+o+'/><rect x="4" y="48" width="92" height="26" rx="10" fill="'+L+'" '+o+'/><rect x="14" y="74" width="8" height="10" fill="'+K+'"/><rect x="78" y="74" width="8" height="10" fill="'+K+'"/>',
 phone:'<rect x="34" y="14" width="32" height="64" rx="8" fill="'+P+'" '+o+'/><rect x="39" y="22" width="22" height="42" rx="3" fill="'+W+'"/><circle cx="50" cy="71" r="3" fill="'+W+'"/><rect x="22" y="78" width="56" height="10" rx="4" fill="'+L+'" '+o+'/>',
 stove:'<rect x="14" y="22" width="72" height="68" rx="8" fill="'+W+'" '+o+'/><rect x="14" y="22" width="72" height="16" rx="6" fill="'+P+'" '+o+'/><circle cx="32" cy="30" r="4" fill="'+W+'"/><circle cx="68" cy="30" r="4" fill="'+W+'"/><rect x="24" y="48" width="52" height="32" rx="6" fill="'+L+'" '+o+'/>',
 coffee:'<rect x="22" y="12" width="56" height="20" rx="6" fill="'+P+'" '+o+'/><rect x="26" y="32" width="12" height="54" fill="'+L+'" '+o+'/><rect x="62" y="32" width="12" height="54" fill="'+L+'" '+o+'/><rect x="20" y="82" width="60" height="8" rx="3" fill="'+K+'"/><path d="M42 60 h16 v14 a8 8 0 0 1 -16 0z" fill="'+W+'" '+o+'/><path d="M50 34 v20" stroke="#8a5a3a" stroke-width="4"/>',
 bath:'<path d="M8 46 h84 v12 a24 24 0 0 1 -24 24 h-36 a24 24 0 0 1 -24 -24z" fill="'+W+'" '+o+'/><g fill="#fff" stroke="#ffa3c7" stroke-width="2"><circle cx="28" cy="40" r="9"/><circle cx="44" cy="34" r="11"/><circle cx="62" cy="40" r="9"/><circle cx="76" cy="36" r="7"/></g><rect x="18" y="82" width="8" height="8" fill="'+P+'"/><rect x="74" y="82" width="8" height="8" fill="'+P+'"/>',
 vanity:'<ellipse cx="50" cy="32" rx="26" ry="24" fill="#d8f3ff" '+o+'/><g fill="#ffd98a" '+o+' stroke-width="2"><circle cx="22" cy="20" r="4"/><circle cx="78" cy="20" r="4"/><circle cx="50" cy="6" r="4"/></g><rect x="14" y="58" width="72" height="14" rx="5" fill="'+P+'" '+o+'/><rect x="20" y="72" width="8" height="18" fill="'+L+'" '+o+'/><rect x="72" y="72" width="8" height="18" fill="'+L+'" '+o+'/>',
 tv:'<rect x="10" y="14" width="80" height="54" rx="10" fill="'+P+'" '+o+'/><rect x="18" y="21" width="64" height="40" rx="6" fill="#b9e6ff"/><path d="M44 31 l16 10 -16 10z" fill="'+D+'"/><path d="M36 68 l-8 20 M64 68 l8 20" '+o+'/>',
 turntable:'<rect x="8" y="34" width="84" height="48" rx="8" fill="'+L+'" '+o+'/><circle cx="44" cy="58" r="20" fill="rgba(255,92,154,.55)" '+o+'/><circle cx="44" cy="58" r="6" fill="'+W+'" '+o+'/><path d="M80 40 v20 l-14 10" fill="none" '+o+'/>',
 mic:'<path d="M50 52 v34 M34 88 h32" '+o+' stroke-width="4"/><rect x="38" y="10" width="24" height="40" rx="12" fill="'+P+'" '+o+'/><path d="M38 28 h24" stroke="'+W+'" stroke-width="3"/>',
 decks:'<rect x="6" y="40" width="88" height="40" rx="8" fill="'+K+'" '+o+'/><circle cx="30" cy="60" r="14" fill="'+P+'" '+o+'/><circle cx="70" cy="60" r="14" fill="'+P+'" '+o+'/><rect x="46" y="50" width="8" height="20" rx="2" fill="'+W+'"/>',
 laptop:'<rect x="20" y="20" width="60" height="42" rx="5" fill="'+P+'" '+o+'/><rect x="26" y="26" width="48" height="30" rx="3" fill="'+W+'"/><path d="M10 62 h80 l-6 14 h-68z" fill="'+L+'" '+o+'/><path d="M50 36 c-4-4-9 0 0 7 c9-7 4-11 0-7z" fill="'+P+'"/>',
 books:'<rect x="14" y="8" width="72" height="84" rx="6" fill="'+L+'" '+o+'/><line x1="14" y1="36" x2="86" y2="36" '+o+'/><line x1="14" y1="64" x2="86" y2="64" '+o+'/><g '+o+' stroke-width="2"><rect x="22" y="14" width="8" height="22" fill="'+P+'"/><rect x="32" y="16" width="8" height="20" fill="'+W+'"/><rect x="42" y="14" width="8" height="22" fill="'+D+'"/><rect x="58" y="42" width="8" height="22" fill="'+P+'"/><rect x="68" y="44" width="8" height="20" fill="'+W+'"/><rect x="24" y="70" width="8" height="22" fill="'+W+'"/><rect x="34" y="70" width="8" height="22" fill="'+P+'"/></g>',
 plant:'<path d="M34 64 h32 l-5 26 h-22z" fill="'+P+'" '+o+'/><g fill="#5fbf7f" '+o+' stroke-width="2"><path d="M50 64 C30 50 22 30 26 18 C40 30 46 44 50 64z"/><path d="M50 64 C70 50 78 30 74 18 C60 30 54 44 50 64z"/><path d="M50 64 C46 40 48 22 50 8 C52 22 54 40 50 64z"/></g>',
 rug:'<ellipse cx="50" cy="70" rx="44" ry="18" fill="'+L+'" '+o+'/><path d="M50 78 c-14-10-8-20 0-12 c8-8 14 2 0 12z" fill="'+P+'"/>',
 lamp:'<path d="M30 14 h40 l10 30 h-60z" fill="'+L+'" '+o+'/><path d="M50 44 v40 M34 88 h32" '+o+' stroke-width="4"/><circle cx="50" cy="30" r="22" fill="#fff6a8" opacity=".35"/>',
 art:'<rect x="16" y="10" width="68" height="56" rx="4" fill="'+W+'" '+o+' stroke-width="5"/><path d="M50 54 c-26-16-14-36 0-22 c14-14 26 6 0 22z" fill="'+P+'" '+o+'/>',
 disco:'<line x1="50" y1="0" x2="50" y2="18" '+o+'/><circle cx="50" cy="44" r="26" fill="#e9dcff" '+o+'/><g stroke="#b9a3e0" stroke-width="1.5"><line x1="24" y1="44" x2="76" y2="44"/><line x1="28" y1="32" x2="72" y2="32"/><line x1="28" y1="56" x2="72" y2="56"/><line x1="50" y1="18" x2="50" y2="70"/><line x1="38" y1="20" x2="38" y2="68"/><line x1="62" y1="20" x2="62" y2="68"/></g><g fill="#ff5c9a"><circle cx="16" cy="80" r="3"/><circle cx="84" cy="76" r="3"/><circle cx="50" cy="90" r="3"/></g>',
 table:'<ellipse cx="50" cy="44" rx="38" ry="12" fill="'+P+'" '+o+'/><path d="M50 56 v30 M34 90 h32" '+o+' stroke-width="4"/><path d="M44 30 h12 v8 a6 6 0 0 1 -12 0z" fill="'+W+'" '+o+' stroke-width="2"/>'
 };
 return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+(b[id]||'')+'</svg>';
}

/* ---------- rooms, jobs, friends ---------- */
var ROOMS=[
 {id:'living',n:'Living Room',wall:'#ffd6e6',wall2:'#ffc4dc',floor:'#f7c6a8',floor2:'#efb894'},
 {id:'kitchen',n:'Kitchen',wall:'#fff0f6',wall2:'#ffd6e6',floor:'#ffffff',floor2:'#ffd6e6'},
 {id:'bedroom',n:'Bedroom',wall:'#f3d6ff',wall2:'#ead0ff',floor:'#ffc2dc',floor2:'#ffb3d2'},
 {id:'bathroom',n:'Bathroom',wall:'#e3f6ff',wall2:'#d1efff',floor:'#ffffff',floor2:'#e3f6ff'},
 {id:'studio',n:'Music Studio',wall:'#4d1c3e',wall2:'#5e2650',floor:'#2b1f28',floor2:'#3a2933',lock:300}
];
var JOBS=[
 {id:'barista',n:'Barista',place:'Coffeebreak Cafe',from:6,to:14,pay:40,titles:['Cup Washer','Junior Barista','Barista','Head Barista','Cafe Manager','Coffee Legend'],lines:['You poured a perfect heart in the foam.','The morning rush was busy but sweet.','A regular said your latte made their day.','You learned a new pink milk recipe.']},
 {id:'stylist',n:'Hair Stylist',place:'Coffeebreak Salon',from:9,to:17,pay:55,titles:['Salon Helper','Junior Stylist','Stylist','Senior Stylist','Colour Expert','Salon Star'],lines:['You styled perfect pink curls.','A client loved her new fringe.','You swept up and restocked the bows.','You tried a glossy new blow-dry.']},
 {id:'singer',n:'Singer',place:'Coffeebreak Lounge',from:17,to:23,pay:70,titles:['Open Mic Singer','Lounge Singer','Headline Act','Touring Singer','Chart Singer','Coffeebreak Icon'],lines:['The crowd sang the chorus back to you.','You debuted a brand new song.','Someone filmed your set for their story.','You nailed the high note.']},
 {id:'dj',n:'DJ',place:'Pink Vinyl Club',from:20,to:4,pay:80,titles:['Warm-up DJ','Resident DJ','Club Favourite','Festival DJ','Super DJ','Pink Vinyl Legend'],lines:['The dance floor stayed full all night.','You dropped a pink vinyl remix.','The lights and the beat lined up perfectly.','You played a sweet sunrise set.']}
];
var LEVELS=[{min:0,n:'Stranger'},{min:15,n:'Acquaintance'},{min:35,n:'Friend'},{min:60,n:'Good Friend'},{min:85,n:'Best Friend'}];
var TALK={
 'coffeebreak-girl':{likes:'music',hi:['Hey sweetie, want to grab a coffee break?','I just wrote a new chorus, want to hear it?'],good:['You always make me smile.','Same time tomorrow?'],meh:['Hmm, okay.','I am a bit tired today.']},
 'coffeebreak-tv-star':{likes:'style',hi:['Darling, the cameras love your outfit.','I am filming a new episode later.'],good:['You would be great on the show.','Love that look on you.'],meh:['Maybe after my shoot.','Not now, I am learning lines.']},
 'bean':{likes:'jokes',hi:['Hey, nice to see you.','I found a new cafe with the best muffins.'],good:['Ha, you crack me up.','You are my favourite person to hang with.'],meh:['That one went over my beanie.','Hmm, if you say so.']},
 'queen':{likes:'compliments',hi:['Welcome, darling.','Do you like my new crown?'],good:['You may stay as long as you like.','A royal thank you.'],meh:['How unusual.','I shall think about it.']},
 'espresso':{likes:'coffee',hi:['Hey neighbour.','Want to shoot some hoops later?'],good:['You are the best neighbour.','Let us do this again soon.'],meh:['Uh, okay then.','Maybe another time.']}
};
var ACTS=[
 {id:'chat',n:'Chat',m:20,base:4},
 {id:'joke',n:'Tell a joke',m:15,base:3,tag:'jokes'},
 {id:'compliment',n:'Give a compliment',m:10,base:3,tag:'compliments'},
 {id:'music',n:'Talk about music',m:20,base:3,tag:'music'},
 {id:'style',n:'Swap style tips',m:20,base:3,tag:'style'},
 {id:'gift',n:'Buy them a coffee (10 coins)',m:20,base:7,cost:10,tag:'coffee'},
 {id:'invite',n:'Invite over (Friend level)',m:120,base:10,need:35}
];

/* ---------- state ---------- */
var S=null, speed=1, curTab='home', curRoom='living', editMode=false, placing=null, dirty=false;
function freshState(L,name){
  var others={};CH.forEach(function(c){if(c.id!==L.ch)others[c.id]={f:0,last:-1,outfit:c.outfits[Math.floor(Math.random()*c.outfits.length)].id}});
  return {v:1,name:name||charById(L.ch).name,look:L,t:8*60,day:1,coins:150,
   needs:{hunger:80,fun:70,energy:85,social:60,hygiene:80},
   job:null,jobs:{barista:{lvl:0,xp:0},stylist:{lvl:0,xp:0},singer:{lvl:0,xp:0},dj:{lvl:0,xp:0}},
   skills:{barista:0,stylist:0,singer:0,dj:0},
   friends:others,inv:[],studio:false,
   rooms:{living:[{f:'sofa',x:1,y:1},{f:'phone',x:4,y:0},{f:'plant',x:5,y:2}],kitchen:[{f:'fridge',x:0,y:0}],bedroom:[{f:'bed',x:1,y:1}],bathroom:[{f:'shower',x:0,y:0}],studio:[]},
   pos:{x:2,y:2},guest:null,log:[],created:Date.now()};
}
function save(){if(!S)return;try{localStorage.setItem(KEY,JSON.stringify(S));var e=$('#savedTxt');if(e)e.textContent='Autosaved, day '+S.day+' '+fmtTime(S.t)}catch(e){}dirty=false}
function load(){try{var s=localStorage.getItem(KEY);return s?JSON.parse(s):null}catch(e){return null}}
function fmtTime(t){t=((t%1440)+1440)%1440;var h=Math.floor(t/60),m=Math.floor(t%60);var ap=h<12?'am':'pm';var hh=h%12||12;return hh+':'+(m<10?'0':'')+m+' '+ap}
function hour(){return Math.floor((S.t%1440)/60)}
function isNight(){var h=hour();return h>=20||h<6}
function darkness(){var m=S.t%1440;if(m>=420&&m<=1080)return 0;if(m>1080&&m<1260)return (m-1080)/180*.48;if(m>=1260||m<300)return .48;return (420-m)/120*.48}
function toast(t){var e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(function(){e.classList.remove('show')},2400)}
function addLog(t){S.log.unshift('Day '+S.day+' '+fmtTime(S.t)+': '+t);S.log=S.log.slice(0,30)}
function decor(){var d=0;for(var r in S.rooms)S.rooms[r].forEach(function(i){d+=F[i.f].decor||0});return d}
var RATE={hunger:5,fun:4,energy:4,social:3,hygiene:3.2};
function decay(min,sleeping){
  var comfort=1-Math.min(.35,decor()*.015);
  for(var k in RATE){var r=RATE[k]/60*min;if(k==='fun')r*=comfort;if(sleeping){if(k==='energy')continue;r*=.4}S.needs[k]=clamp(S.needs[k]-r,0,100)}
}
function advance(min,sleeping){
  var before=S.day;S.t+=min;var d=Math.floor(S.t/1440)+1;
  if(d!==S.day){S.day=d;newDay()}
  decay(min,sleeping);
}
function newDay(){
  for(var id in S.friends){var fr=S.friends[id];if(fr.last<S.day-2&&fr.f>0)fr.f=Math.max(0,fr.f-2);fr.outfit=rnd(charById(id).outfits).id}
  addLog('A new day begins');
}
function mood(){var n=S.needs,a=(n.hunger+n.fun+n.energy+n.social+n.hygiene)/5;var low=Object.keys(n).filter(function(k){return n[k]<20});return {v:a,low:low,n:a>=75?'Glowing':a>=55?'Happy':a>=35?'Okay':a>=20?'Grumpy':'Miserable'}}

/* ---------- ticker ---------- */
var acc=0,last=0;
function tick(ts){
  if(S&&speed>0){if(!last)last=ts;var dt=(ts-last)/1000;acc+=dt*2*speed;/* 2 game min per real second */
   if(acc>=1){var m=Math.floor(acc);acc-=m;advance(m,false);dirty=true;updateHud();if(curTab==='home')updateRoomLight();if(Math.random()<.02)save()}}
  last=ts;requestAnimationFrame(tick);
}
setInterval(function(){if(dirty)save()},8000);
window.addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',function(){if(document.hidden)save();last=0});

/* ---------- hud ---------- */
var NEEDN={hunger:'Hunger',fun:'Fun',energy:'Energy',social:'Social',hygiene:'Hygiene'};
function needsHtml(){var h='<div class="needs">';for(var k in NEEDN){var v=Math.round(S.needs[k]);h+='<div class="need'+(v<25?' low':'')+'" data-need="'+k+'">'+NEEDN[k]+' <span class="nv">'+v+'</span><div class="bar"><i style="width:'+v+'%"></i></div></div>'}return h+'</div>'}
function updateHud(){
  if(!S)return;$('#clockTxt').textContent='Day '+S.day+', '+fmtTime(S.t);$('#sunmoon').className='sunmoon'+(isNight()?' moon':'');$('#coinTxt').textContent=Math.floor(S.coins);
  $$('.need').forEach(function(e){var k=e.getAttribute('data-need'),v=Math.round(S.needs[k]);e.querySelector('.nv').textContent=v;e.querySelector('i').style.width=v+'%';e.classList.toggle('low',v<25)});
  var md=$('#moodTxt');if(md){var m=mood();md.textContent='Mood: '+m.n+(m.low.length?', needs '+m.low.map(function(k){return NEEDN[k].toLowerCase()}).join(' and '):'')}
}

/* ---------- start screen ---------- */
var draft={ch:(CH[0]||{}).id,outfit:null,hair:'own',cloth:'own',skin:'own',acc:'none'};
function opts(list,key,swatch){return list.map(function(o){var c=draft[key]===o.id?' on':'';if(swatch){var col=o.a||o.id;if(o.id==='own')col=key==='hair'?charById(draft.ch).hair:key==='skin'?charById(draft.ch).skin:'#ff5c9a';return '<button class="sw'+c+'" title="'+esc(o.n)+'" aria-label="'+esc(o.n)+'" data-k="'+key+'" data-v="'+o.id+'" style="background:'+col+'"></button>'}return '<button class="'+c.trim()+'" data-k="'+key+'" data-v="'+o.id+'">'+esc(o.n)+'</button>'}).join('')}
function lookEditor(){
  var c=charById(draft.ch);if(!draft.outfit||!c.svg[draft.outfit])draft.outfit=c.outfits[0].id;
  return '<label class="lbl">Outfit</label><div class="opts">'+opts(c.outfits.map(function(o){return {id:o.id,n:o.label}}),'outfit')+'</div>'+
   '<label class="lbl">Hair colour</label><div class="opts">'+opts(HAIR,'hair',1)+'</div>'+
   '<label class="lbl">Outfit colour</label><div class="opts">'+opts(CLOTH,'cloth',1)+'</div>'+
   '<label class="lbl">Skin tone</label><div class="opts">'+opts(SKIN,'skin',1)+'</div>'+
   '<label class="lbl">Hair accessory</label><div class="opts">'+opts(ACC,'acc')+'</div>';
}
function bindLook(root,after){$$('[data-k]',root).forEach(function(b){b.onclick=function(){draft[b.getAttribute('data-k')]=b.getAttribute('data-v');after()}})}
function startScreen(){
  $('#hud').hidden=true;$('#tabs').hidden=true;
  var saved=load();var c=charById(draft.ch);
  app.innerHTML='<div class="card"><h1>Welcome to Coffeebreak Life</h1><p class="muted">Pick a Coffeebreak character, style them your way, then move into a pink home, get a job, make friends and live your sweetest life.</p>'+
   (saved?'<p><button class="btn" id="cont">Continue as '+esc(saved.name)+', day '+saved.day+'</button></p>':'')+
   '<h2>1. Pick your character</h2><div class="pick" id="pick">'+CH.map(function(x){return '<button data-ch="'+x.id+'" class="'+(x.id===draft.ch?'on':'')+'"><img alt="'+esc(x.name)+'" src="'+look({ch:x.id,outfit:x.outfits[0].id,hair:'own',cloth:'own',skin:'own',acc:'none'})+'"><span>'+esc(x.name)+'</span></button>'}).join('')+'</div></div>'+
   '<div class="grid2" style="margin-top:12px"><div class="card avatarBig"><img id="bigImg" alt="Your character" src="'+look(draft)+'"></div>'+
   '<div class="card"><h2>2. Style '+esc(c.name)+'</h2><p class="muted">'+esc(c.role)+'</p><div id="ed">'+lookEditor()+'</div>'+
   '<label class="lbl" for="nm">Your name in the game</label><br><input type="text" id="nm" maxlength="24" value="'+esc(c.name)+'"><p><button class="btn" id="go">Move in</button></p></div></div>';
  if(saved)$('#cont').onclick=function(){S=saved;migrate();enterGame()};
  $$('#pick [data-ch]').forEach(function(b){b.onclick=function(){draft.ch=b.getAttribute('data-ch');draft.outfit=null;startScreen()}});
  function re(){$('#ed').innerHTML=lookEditor();$('#bigImg').src=look(draft);bindLook($('#ed'),re)}
  bindLook($('#ed'),re);
  $('#go').onclick=function(){
    var nm=($('#nm').value||'').trim()||c.name;
    if(saved&&!confirm('Start a new life. This replaces your saved game.'))return;
    S=freshState(JSON.parse(JSON.stringify(draft)),nm);addLog(nm+' moved into the pink house');save();enterGame()};
}
function migrate(){S.inv=S.inv||[];S.log=S.log||[];S.rooms.studio=S.rooms.studio||[]}
function enterGame(){$('#hud').hidden=false;$('#tabs').hidden=false;curTab='home';render();updateHud()}

/* ---------- views ---------- */
function setTab(t){curTab=t;editMode=false;placing=null;$$('#tabs button').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-tab')===t)});render();window.scrollTo(0,0)}
function render(){
  if(!S)return startScreen();
  var v={home:homeView,work:workView,friends:friendsView,shop:shopView,style:styleView,about:aboutView}[curTab]||homeView;
  app.innerHTML='<div class="card" style="margin-bottom:10px">'+needsHtml()+'<div class="row" style="justify-content:space-between"><span class="mood" id="moodTxt"></span><span class="saved" id="savedTxt">Autosave on</span></div></div>'+v();
  bindView();updateHud();
}
function roomById(id){return ROOMS.filter(function(r){return r.id===id})[0]}
function homeView(){
  var r=roomById(curRoom);var locked=r.lock&&!S.studio;
  var h='<div class="card"><div class="rooms">'+ROOMS.map(function(x){return '<button data-room="'+x.id+'" class="'+(x.id===curRoom?'on':'')+'">'+esc(x.n)+(x.lock&&!S.studio?' (locked)':'')+'</button>'}).join('')+'</div>';
  if(locked){return h+'<h2>Music Studio</h2><p>Unlock a dark pink studio room for your mic, turntable and DJ decks.</p><button class="btn" id="unlock" '+(S.coins<r.lock?'disabled':'')+'>Unlock for '+r.lock+' coins</button></div>'}
  var items=S.rooms[curRoom];var grid={};items.forEach(function(i,n){grid[i.x+','+i.y]=n});
  h+='<div class="room'+(editMode?' edit':'')+'" id="room" style="--wall:'+r.wall+';--wall2:'+r.wall2+';--floor:'+r.floor+';--floor2:'+r.floor2+';--sky:'+sky()+';--dark:'+darkness().toFixed(2)+'"><div class="wall"></div><div class="floor"></div><div class="window"></div><div class="tiles">';
  for(var y=0;y<3;y++)for(var x=0;x<6;x++){var k=x+','+y;if(k in grid){var it=items[grid[k]];h+='<button class="tile has" data-x="'+x+'" data-y="'+y+'" data-i="'+grid[k]+'" aria-label="'+esc(F[it.f].n)+'">'+fsvg(it.f)+'<span class="nm">'+esc(F[it.f].n)+'</span></button>'}else h+='<button class="tile" data-x="'+x+'" data-y="'+y+'" aria-label="Empty spot"></button>'}
  h+='</div>'+meHtml()+guestHtml()+'<div class="night"></div></div>';
  h+='<div class="row" style="margin-top:8px;justify-content:space-between"><span class="muted">'+(editMode?(placing!==null?'Tap an empty spot to place '+esc(F[S.inv[placing]].n)+'.':'Decorate mode. Tap a stored item below, or tap furniture to store or sell it.'):'Tap furniture to use it. Time passes while you do things.')+'</span><button class="btn sm '+(editMode?'':'alt')+'" id="editBtn">'+(editMode?'Done decorating':'Decorate')+'</button></div>';
  if(editMode){h+='<h3 style="margin-top:10px">Stored furniture</h3>'+(S.inv.length?'<div class="inv">'+S.inv.map(function(f,i){return '<button data-inv="'+i+'" class="'+(placing===i?'on':'')+'">'+fsvg(f)+esc(F[f].n)+'</button>'}).join('')+'</div>':'<p class="muted">Nothing stored. Buy furniture in the Shop.</p>')}
  h+='<div class="log" id="log"><b>Diary</b>'+S.log.slice(0,8).map(function(l){return '<div>'+esc(l)+'</div>'}).join('')+'</div></div>';
  return h;
}
function sky(){var m=S.t%1440;if(m<300||m>=1260)return 'linear-gradient(#1c1240,#3d2a7a)';if(m<420)return 'linear-gradient(#ffb3c7,#ffe0a8)';if(m<1020)return 'linear-gradient(#8fd3ff,#d8f3ff)';return 'linear-gradient(#ff8fb8,#ffcf8a)'}
function meHtml(){return '<div class="me" id="me" style="left:'+(3+S.pos.x*15.6)+'%;bottom:'+(6+(2-S.pos.y)*12)+'%"><span class="bub" id="bub"></span><img alt="You" src="'+look(S.look)+'"></div>'}
function guestHtml(){if(!S.guest||S.guest.until<S.t)return '';var fr=S.friends[S.guest.id];return '<div class="guest"><img alt="'+esc(charById(S.guest.id).name)+'" src="'+look({ch:S.guest.id,outfit:fr.outfit})+'"></div>'}
function updateRoomLight(){var r=$('#room');if(r){r.style.setProperty('--dark',darkness().toFixed(2));r.style.setProperty('--sky',sky())}}
function workView(){
  var h='<div class="card"><h1>Work</h1><p class="muted">Pick a job, then go to your shift during opening hours. Practise at home on matching furniture to raise your skill and get promoted.</p><div class="list">';
  JOBS.forEach(function(j){var st=S.jobs[j.id],on=S.job===j.id,sk=S.skills[j.id];var pay=payFor(j);
    h+='<div class="job'+(on?' on':'')+'"><h3>'+esc(j.n)+'</h3><div class="muted">'+esc(j.place)+', '+fmtH(j.from)+' to '+fmtH(j.to)+'</div><div class="lvl">'+esc(j.titles[st.lvl])+' (level '+(st.lvl+1)+'), about '+pay+' coins a shift</div>'+
    '<div class="muted">Skill '+sk.toFixed(1)+' of 10</div><div class="skill"><i style="width:'+sk*10+'%"></i></div>'+
    '<div class="muted">Promotion progress</div><div class="skill"><i style="width:'+Math.min(100,st.xp/needXp(st.lvl)*100)+'%"></i></div>'+
    (on?'<button class="btn" data-shift="'+j.id+'" '+(open(j)?'':'disabled')+'>'+(open(j)?'Go to work, 4 hours':'Closed now')+'</button> <button class="btn sm alt" data-quit="'+j.id+'">Quit</button>':'<button class="btn alt" data-take="'+j.id+'">Take this job</button>')+'</div>'});
  return h+'</div></div>';
}
function fmtH(h){return fmtTime(h*60).replace(':00','')}
function open(j){var h=hour();return j.from<j.to?(h>=j.from&&h<j.to):(h>=j.from||h<j.to)}
function needXp(l){return 3+l*2}
function payFor(j){return Math.round(j.pay*(1+S.jobs[j.id].lvl*.3+S.skills[j.id]*.03))}
function friendsView(){
  var h='<div class="card"><h1>Friends</h1><p class="muted">Chat with the Coffeebreak crew. Each friend likes different things. Friendship fades a little if you do not talk for a few days.</p><div class="list">';
  for(var id in S.friends){var c=charById(id),fr=S.friends[id],lv=lvl(fr.f);
    h+='<div class="friend" data-fid="'+id+'"><img alt="'+esc(c.name)+'" src="'+look({ch:id,outfit:fr.outfit})+'"><div><b style="color:var(--p4)">'+esc(c.name)+'</b><div class="muted">'+esc(c.role)+'</div><div class="hearts">'+lv.n+', '+Math.round(fr.f)+' of 100</div><div class="fbar"><i style="width:'+fr.f+'%"></i></div><div class="chat" id="chat-'+id+'">'+esc(fr.said||rnd(TALK[id].hi))+'</div><div class="acts">'+
    ACTS.map(function(a){var dis=(a.cost&&S.coins<a.cost)||(a.need&&fr.f<a.need);return '<button class="btn sm alt" data-act="'+a.id+'" data-f="'+id+'" '+(dis?'disabled':'')+'>'+esc(a.n)+'</button>'}).join('')+'</div></div></div>'}
  return h+'</div></div>';
}
function lvl(f){var r=LEVELS[0];LEVELS.forEach(function(l){if(f>=l.min)r=l});return r}
function shopView(){
  var h='<div class="card"><h1>Coffeebreak Home Shop</h1><p class="muted">Buy furniture with your coins. New items go into storage, then place them from Home with Decorate. Decor makes fun last longer.</p><div class="list">';
  FKEYS.forEach(function(k){var f=F[k];var price=f.p||60;
    var eff=f.acts.map(function(a){return a.n}).join(', ');
    h+='<div class="item">'+fsvg(k)+'<div class="t"><b>'+esc(f.n)+'</b><small>'+esc(eff)+(f.decor?', decor +'+f.decor:'')+(f.sk?', trains '+jobName(f.sk):'')+'</small><button class="btn sm" data-buy="'+k+'" '+(S.coins<price?'disabled':'')+'>Buy for '+price+'</button></div></div>'});
  return h+'</div></div>';
}
function jobName(id){return JOBS.filter(function(j){return j.id===id})[0].n.toLowerCase()}
function styleView(){
  draft=JSON.parse(JSON.stringify(S.look));
  return '<div class="grid2"><div class="card avatarBig"><img id="bigImg" alt="Your character" src="'+look(draft)+'"></div><div class="card"><h1>Wardrobe</h1><p class="muted">Change your look any time. Your saved style shows at home and with friends.</p><div id="ed">'+lookEditor()+'</div><label class="lbl" for="nm">Name</label><br><input type="text" id="nm" maxlength="24" value="'+esc(S.name)+'"><p class="row"><button class="btn" id="saveLook">Save my look</button></p></div></div>';
}
function aboutView(){
  return '<div class="card"><h1>About Coffeebreak Life</h1><p>Coffeebreak Life is an original pink life game starring the Coffeebreak characters: Coffeebreak Girl, Coffeebreak TV Star, Bean, Queen and Espresso. Every character and outfit is Coffeebreak artwork.</p>'+
  '<h2>How to play</h2><ul><li>Keep your five need bars up: hunger, fun, energy, social and hygiene. They drop as time passes.</li><li>Tap furniture at home to eat, sleep, shower, relax and practise.</li><li>Work shifts earn coins. Each job has its own hours, so plan your day around the clock.</li><li>Spend coins in the Shop, then place furniture with Decorate.</li><li>Chat with friends to raise friendship from Stranger to Best Friend.</li><li>Use the speed buttons at the top to pause or speed up time. The game saves itself in this browser.</li></ul>'+
  '<h2>Your save</h2><p class="muted">Saved only in this browser on this device. Started '+new Date(S.created).toLocaleDateString()+'.</p><button class="btn alt" id="newLife">Start a new life</button>'+
  '<h2>Made by Coffeebreak</h2><p>Coffeebreak is Karen Elizabeth O\'Brien, a songwriter and creator from Newcastle NSW, making apps, games, stores and music. Find more at <a href="https://coffeebreaks.itch.io" target="_blank" rel="noopener">coffeebreaks.itch.io</a>.</p></div>';
}

/* ---------- actions ---------- */
function bindView(){
  $$('[data-room]').forEach(function(b){b.onclick=function(){curRoom=b.getAttribute('data-room');placing=null;render()}});
  var u=$('#unlock');if(u)u.onclick=function(){if(S.coins>=300){S.coins-=300;S.studio=true;addLog('Unlocked the Music Studio');toast('The Music Studio is yours');save();render()}};
  var eb=$('#editBtn');if(eb)eb.onclick=function(){editMode=!editMode;placing=null;render()};
  $$('[data-inv]').forEach(function(b){b.onclick=function(){placing=+b.getAttribute('data-inv');render()}});
  $$('.tile').forEach(function(t){t.onclick=function(){tileClick(+t.getAttribute('data-x'),+t.getAttribute('data-y'),t.hasAttribute('data-i')?+t.getAttribute('data-i'):null)}});
  $$('[data-take]').forEach(function(b){b.onclick=function(){var j=b.getAttribute('data-take');S.job=j;addLog('Started work as a '+jobName(j));toast('You are now a '+jobName(j));save();render()}});
  $$('[data-quit]').forEach(function(b){b.onclick=function(){S.job=null;addLog('Left your job');save();render()}});
  $$('[data-shift]').forEach(function(b){b.onclick=function(){shift(b.getAttribute('data-shift'))}});
  $$('[data-buy]').forEach(function(b){b.onclick=function(){buy(b.getAttribute('data-buy'))}});
  $$('[data-act]').forEach(function(b){b.onclick=function(){social(b.getAttribute('data-f'),b.getAttribute('data-act'))}});
  if(curTab==='style'){var re=function(){$('#ed').innerHTML=lookEditor();$('#bigImg').src=look(draft);bindLook($('#ed'),re)};bindLook($('#ed'),re);
    $('#saveLook').onclick=function(){S.look=JSON.parse(JSON.stringify(draft));S.name=($('#nm').value||'').trim()||S.name;addLog('Changed into a new look');save();toast('Look saved');render()}}
  var nl=$('#newLife');if(nl)nl.onclick=function(){if(confirm('Start a new life. This replaces your saved game.')){localStorage.removeItem(KEY);S=null;startScreen()}};
}
function tileClick(x,y,i){
  var items=S.rooms[curRoom];
  if(editMode){
    if(i===null&&placing!==null){var f=S.inv.splice(placing,1)[0];items.push({f:f,x:x,y:y});placing=null;addLog('Placed '+F[f].n+' in the '+roomById(curRoom).n);save();render();return}
    if(i!==null){var it=items[i],fd=F[it.f];sheet('<h2>'+esc(fd.n)+'</h2><div class="acts"><button class="btn" id="st">Move to storage</button><button class="btn alt" id="sl">Sell for '+Math.floor((fd.p||60)/2)+' coins</button><button class="btn alt" id="cx">Cancel</button></div>');
      $('#st').onclick=function(){items.splice(i,1);S.inv.push(it.f);closeSheet();save();render()};
      $('#sl').onclick=function(){items.splice(i,1);S.coins+=Math.floor((fd.p||60)/2);addLog('Sold '+fd.n);closeSheet();save();render()};
      $('#cx').onclick=closeSheet}
    return;
  }
  if(i===null){S.pos={x:x,y:y};var me=$('#me');if(me){me.style.left=(3+x*15.6)+'%';me.style.bottom=(6+(2-y)*12)+'%'}return}
  var it2=items[i],f2=F[it2.f];
  sheet('<h2>'+esc(f2.n)+'</h2><div class="acts">'+f2.acts.map(function(a,n){return '<button class="btn" data-use="'+n+'">'+esc(a.n)+' <small>('+dur(a.m)+')</small></button>'}).join('')+'<button class="btn alt" id="cx">Cancel</button></div>');
  $$('[data-use]').forEach(function(b){b.onclick=function(){closeSheet();useItem(it2,f2.acts[+b.getAttribute('data-use')])}});$('#cx').onclick=closeSheet;
}
function dur(m){return m>=60?(m/60)+(m===60?' hour':' hours'):m+' min'}
function useItem(it,a){
  S.pos={x:it.x,y:it.y};
  advance(a.m,!!a.sleep);
  for(var k in a.e){if(a.sleep&&k==='energy')S.needs.energy=100;else S.needs[k]=clamp(S.needs[k]+a.e[k],0,100)}
  var f=F[it.f];
  if(a.skill&&f.sk){S.skills[f.sk]=clamp(S.skills[f.sk]+a.skill*.15,0,10)}
  if(a.fr){var ids=Object.keys(S.friends);var id=rnd(ids);S.friends[id].f=clamp(S.friends[id].f+a.fr,0,100);S.friends[id].last=S.day}
  addLog(a.n);toast(a.n+' done');save();render();
  var b=$('#bub');if(b){b.textContent=a.n;setTimeout(function(){if(b)b.textContent=''},2500)}
}
function shift(id){
  var j=JOBS.filter(function(x){return x.id===id})[0];if(!open(j))return;
  var m=mood();var st=S.jobs[id];
  var perf=m.v>=60?'great':m.v>=35?'good':'rough';
  var pay=Math.round(payFor(j)*(perf==='great'?1.2:perf==='good'?1:.7));
  advance(240,false);
  S.needs.energy=clamp(S.needs.energy-22,0,100);S.needs.hunger=clamp(S.needs.hunger-15,0,100);S.needs.hygiene=clamp(S.needs.hygiene-12,0,100);S.needs.social=clamp(S.needs.social+12,0,100);S.needs.fun=clamp(S.needs.fun-6,0,100);
  S.coins+=pay;S.skills[id]=clamp(S.skills[id]+.2,0,10);
  st.xp+=perf==='great'?2:perf==='good'?1:0;var promo='';
  if(st.xp>=needXp(st.lvl)&&st.lvl<j.titles.length-1&&S.skills[id]>=st.lvl*1.5){st.xp=0;st.lvl++;promo='Promotion. You are now '+j.titles[st.lvl]+'.'}
  var line=rnd(j.lines);addLog('Worked a '+perf+' shift at '+j.place+', earned '+pay+' coins');
  sheet('<h2>Shift at '+esc(j.place)+'</h2><p>'+esc(line)+'</p><p>It was a '+perf+' shift. You earned <b>'+pay+' coins</b>.</p>'+(promo?'<p><b>'+esc(promo)+'</b></p>':'')+(perf==='rough'?'<p class="muted">Tip: a happier mood means better shifts and faster promotions.</p>':'')+'<div class="acts"><button class="btn" id="cx">Nice</button></div>');
  $('#cx').onclick=closeSheet;save();render();
}
function buy(k){var f=F[k],p=f.p||60;if(S.coins<p)return;S.coins-=p;S.inv.push(k);addLog('Bought '+f.n);toast(f.n+' is in storage. Place it with Decorate at home.');save();render()}
function social(id,act){
  var a=ACTS.filter(function(x){return x.id===act})[0],fr=S.friends[id],t=TALK[id],c=charById(id);
  if(a.cost){if(S.coins<a.cost)return;S.coins-=a.cost}
  if(a.need&&fr.f<a.need)return;
  var m=mood();var g=a.base+(a.tag&&a.tag===t.likes?5:0)+(m.v>50?2:0)+(Math.random()*4-1.5);
  if(act==='joke'&&Math.random()<.25&&t.likes!=='jokes')g=-2;
  if(fr.last===S.day&&fr.talks>=6)g=Math.min(g,1);
  fr.talks=fr.last===S.day?(fr.talks||0)+1:1;
  var before=lvl(fr.f).n;fr.f=clamp(fr.f+g,0,100);fr.last=S.day;
  advance(a.m,false);S.needs.social=clamp(S.needs.social+(act==='invite'?40:12),0,100);S.needs.fun=clamp(S.needs.fun+(act==='joke'?6:3),0,100);
  fr.said=g>=4?rnd(t.good):g>0?rnd(t.hi):rnd(t.meh);
  if(act==='invite'){S.guest={id:id,until:S.t+120};fr.said='I love your pink house.';}
  var after=lvl(fr.f).n;addLog(a.n.replace(/ \(.*\)/,'')+' with '+c.name);
  if(after!==before&&g>0)toast(c.name+' is now your '+after);else toast(c.name+': '+fr.said);
  save();render();
}
function sheet(h){$('#sheet').innerHTML=h;$('#modal').hidden=false}
function closeSheet(){$('#modal').hidden=true}
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')closeSheet()});
$$('#tabs button').forEach(function(b){b.onclick=function(){setTab(b.getAttribute('data-tab'))}});
$$('#speed button').forEach(function(b){b.onclick=function(){speed=+b.getAttribute('data-sp');$$('#speed button').forEach(function(x){x.classList.toggle('on',x===b)});toast(speed?'Speed '+speed+'x':'Paused')}});

/* test hooks */
window.CBLife={get state(){return S},save:save,advance:function(m){advance(m,false);updateHud()},render:render};
startScreen();requestAnimationFrame(tick);
})();
