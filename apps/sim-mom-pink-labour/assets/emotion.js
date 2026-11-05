/* SIM-MOM: Pink Labour - mother emotion & pain system */
(function(){
var css=`#emo{position:fixed;left:min(410px,40vw);top:70px;z-index:9000;width:210px;background:rgba(255,240,247,.96);border:2px solid #ff8fc4;border-radius:18px;box-shadow:0 6px 20px rgba(214,51,132,.25);font:600 12px/1.25 system-ui,sans-serif;color:#7a1f4f;padding:8px;user-select:none}
#emo.min #emoBody{display:none}#emo h4{margin:0 0 4px;font-size:13px;display:flex;justify-content:space-between;align-items:center}
#emo h4 button{border:0;background:#ffd1e6;color:#a3215f;border-radius:8px;cursor:pointer;font-weight:700}
#emoFace{display:block;margin:0 auto;width:150px;height:150px}
#emoMood{text-align:center;font-size:13px;margin:2px 0}
#emoMeter{height:12px;border-radius:7px;background:#ffe0ef;border:1px solid #f5a3c9;overflow:hidden;margin:4px 0}
#emoMeter i{display:block;height:100%;width:20%;background:linear-gradient(90deg,#ffb3d6,#ff5fa2,#d6006b);transition:width .3s}
#emoBtns{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}#emoBtns button{flex:1 1 45%;border:1px solid #ff9cc9;background:#fff;color:#a3215f;border-radius:10px;padding:5px 3px;font:700 11px system-ui;cursor:pointer}
#emoBtns button:disabled{opacity:.45;cursor:default}#emoBtns button:hover:not(:disabled){background:#ffe3f0}
#emoBub{position:absolute;left:150px;top:10px;background:#fff;border:2px solid #ff8fc4;border-radius:14px;padding:5px 9px;font-size:13px;white-space:nowrap;opacity:0;transform:scale(.8);transition:.25s;pointer-events:none}
#emoBub.show{opacity:1;transform:scale(1)}`;
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var d=document.createElement('div');d.id='emo';
d.innerHTML='<h4><span>💗 Emma</span><button id="emoMin" title="Minimise">–</button></h4><div id="emoBody"><svg id="emoFace" viewBox="0 0 150 150"></svg><div id="emoMood">Calm</div><div style="display:flex;justify-content:space-between"><span>Pain</span><span id="emoPct">10%</span></div><div id="emoMeter"><i></i></div><div id="emoBtns"><button data-a="breathe">🌬 Coach breathing</button><button data-a="comfort">🤲 Comfort</button><button data-a="relief">💊 Gas &amp; air</button><button data-a="cheer">💖 Encourage</button></div></div><div id="emoBub"></div>';
function mount(){document.body.appendChild(d);
 document.getElementById('emoMin').onclick=function(){d.classList.toggle('min');this.textContent=d.classList.contains('min')?'+':'–'};
 d.querySelectorAll('#emoBtns button').forEach(function(b){b.onclick=function(){act(b.dataset.a,b)}});}
var E={pain:10,relief:0,born:0,bornT:0,face:'',lastBub:0};window.EMO=E;
var cd={breathe:4000,comfort:5000,relief:20000,cheer:6000},used={};
var bub=function(t){var b=document.getElementById('emoBub');if(!b)return;b.textContent=t;b.classList.add('show');E.lastBub=performance.now();clearTimeout(bub.t);bub.t=setTimeout(function(){b.classList.remove('show')},2200)};
E.bubble=bub;
function act(a,btn){var n=performance.now();if(used[a]&&n-used[a]<cd[a])return;used[a]=n;btn.disabled=true;setTimeout(function(){btn.disabled=false},cd[a]);
 if(E.born){bub(a==='cheer'?'Thank you so much!':'I feel so much better 💗');return}
 if(a==='breathe'){E.pain-=12;bub('Breathe... in... and out...')}
 if(a==='comfort'){E.pain-=9;bub('Thank you, that helps')}
 if(a==='relief'){E.relief=14;E.pain-=15;bub('Ahh... that takes the edge off')}
 if(a==='cheer'){E.pain-=6;bub('I can do this!')}
 E.pain=Math.max(0,E.pain)}
E.act=act;
function stage(){try{var s=SIM.steps[SIM.idx];return s?s.stage:0}catch(e){return 0}}
function bell(){try{return P.bell||0}catch(e){return 0}}
function pushing(){try{return !!P.pushing||!!E.keyPush}catch(e){return false}}
addEventListener('keydown',function(e){if(e.code==='Space')E.keyPush=true});addEventListener('keyup',function(e){if(e.code==='Space')E.keyPush=false});
// mistakes / good care from the sim feedback
window.EMO_FB=function(kind){if(E.born)return;if(kind==='ok'){E.pain-=6;if(Math.random()<.6)bub('Okay... okay, I can do this!')}else if(kind==='bad'){E.pain+=14;bub('Ow! That really hurts!')}else if(kind==='warn'){E.pain+=8;bub('Ow... ow...')}E.pain=Math.max(0,Math.min(100,E.pain))};
var pp=0;
function tick(){var s=stage(),b=bell(),deb=document.getElementById('debriefOv'),done=deb&&deb.classList.contains('show');
 var born=false;try{born=!!SIM.born||s>=3||done}catch(e){}
 if(born&&!E.born){E.born=1;E.bornT=performance.now();bub('My baby! 😭💗')}
 if(!born&&E.born){E.born=0}
 if(!E.born){var base=[14,34,55][Math.min(s,2)]+(s===2?10:0),con=b*(s===0?30:s===1?45:45);
  if(E.relief>0){E.relief-=.1;con*=.55}
  var target=base+con;E.pain+=(target-E.pain)*.04;if(pushing()&&s===2)E.pain+=.25;E.pain=Math.max(0,Math.min(100,E.pain));
  var n=performance.now();if(n-E.lastBub>5000){if(b>.7&&E.pain>45)bub(E.pain>75?'Owwww!':'Ow! Here comes one...');else if(b<.05&&s>0&&Math.random()<.02)bub(s===2?'I can do this!':'Breathe...')}
 }else{E.pain+=(4-E.pain)*.15}
 var f;if(E.born){f=(performance.now()-E.bornT<3500&&!done)?'exhausted':'joyful'}
 else if(s===2&&pushing())f='pushing';else if(E.pain<20)f='calm';else if(E.pain<40)f='uncomf';else if(E.pain<62)f='wince';else f='cry';
 var mood={calm:'Calm 😊',uncomf:'Uncomfortable 😣',wince:'Wincing 😖',cry:'Crying out 😭',pushing:'Pushing hard! 💪',exhausted:'Exhausted 😮‍💨',joyful:'Relieved & joyful 🥰'}[f];
 var m=d.querySelector('#emoMeter i');if(m){m.style.width=E.pain.toFixed(0)+'%';document.getElementById('emoPct').textContent=E.pain.toFixed(0)+'%';document.getElementById('emoMood').textContent=mood}
 pp+=.15;if(f!==E.face||f==='cry'||f==='pushing'){E.face=f;draw(f)}
 E.state=f;}
function draw(f){var g=document.getElementById('emoFace');if(!g)return;var shake=(f==='pushing'||f==='cry')?Math.sin(pp*6)*1.5:0;
 var s='<defs><radialGradient id="ck"><stop offset="0" stop-color="#ff7fb5" stop-opacity=".8"/><stop offset="1" stop-color="#ff7fb5" stop-opacity="0"/></radialGradient></defs>';
 s+='<g transform="translate('+shake+',0)">';
 s+='<path d="M28 70 Q24 20 75 18 Q126 20 122 70 L126 118 Q75 128 24 118Z" fill="#c2185b"/>'; // hair
 s+='<path d="M40 128 Q75 108 110 128 L118 150 L32 150Z" fill="#ff8fc4"/>'; // pink gown
 var red=(f==='pushing')?'#ff9cc2':'#ffd3e6';
 s+='<ellipse cx="75" cy="72" rx="40" ry="44" fill="'+red+'" stroke="#e98ab5" stroke-width="2"/>';
 s+='<path d="M38 50 Q75 22 112 50 Q100 34 75 32 Q50 34 38 50Z" fill="#c2185b"/>';
 s+='<circle cx="104" cy="40" r="8" fill="#ff5fa2"/><circle cx="114" cy="46" r="6" fill="#ff5fa2"/>'; // bow
 s+='<ellipse cx="52" cy="86" rx="10" ry="6" fill="url(#ck)"/><ellipse cx="98" cy="86" rx="10" ry="6" fill="url(#ck)"/>';
 var K='stroke="#5a1236" stroke-width="3" fill="none" stroke-linecap="round"';
 var eyes={calm:'<path d="M50 70 Q58 64 66 70" '+K+'/><path d="M84 70 Q92 64 100 70" '+K+'/>',
  uncomf:'<circle cx="58" cy="70" r="4" fill="#5a1236"/><circle cx="92" cy="70" r="4" fill="#5a1236"/>',
  wince:'<path d="M50 66 L64 71 L50 75" '+K+'/><path d="M100 66 L86 71 L100 75" '+K+'/>',
  cry:'<path d="M50 66 L64 71 L50 75" '+K+'/><path d="M100 66 L86 71 L100 75" '+K+'/><path d="M54 78 q-4 10 0 16 q4 -6 0 -16" fill="#7fd3ff"/><path d="M96 78 q-4 10 0 16 q4 -6 0 -16" fill="#7fd3ff"/>',
  pushing:'<path d="M48 70 L66 70" '+K+'/><path d="M84 70 L102 70" '+K+'/>',
  exhausted:'<path d="M50 72 Q58 76 66 72" '+K+'/><path d="M84 72 Q92 76 100 72" '+K+'/><path d="M108 56 q4 6 0 10 q-4 -4 0 -10" fill="#7fd3ff"/>',
  joyful:'<path d="M50 72 Q58 62 66 72" '+K+'/><path d="M84 72 Q92 62 100 72" '+K+'/><path d="M50 82 q-2 6 1 9" stroke="#7fd3ff" stroke-width="3" fill="none"/>'}[f];
 var brows={calm:'',uncomf:'<path d="M50 58 L64 60" '+K+'/><path d="M100 58 L86 60" '+K+'/>',wince:'<path d="M50 56 L65 62" '+K+'/><path d="M100 56 L85 62" '+K+'/>',cry:'<path d="M50 60 L64 54" '+K+'/><path d="M100 60 L86 54" '+K+'/>',pushing:'<path d="M48 58 L66 64" '+K+'/><path d="M102 58 L84 64" '+K+'/>',exhausted:'<path d="M50 62 L64 60" '+K+'/><path d="M100 62 L86 60" '+K+'/>',joyful:''}[f];
 var mouth={calm:'<path d="M64 94 Q75 102 86 94" '+K+'/>',uncomf:'<path d="M64 98 Q75 94 86 98" '+K+'/>',wince:'<path d="M62 96 L70 92 L75 97 L80 92 L88 96" '+K+'/>',
  cry:'<ellipse cx="75" cy="98" rx="11" ry="9" fill="#8a1a4a"/><ellipse cx="75" cy="103" rx="6" ry="3" fill="#ff7fa8"/>',
  pushing:'<rect x="62" y="92" width="26" height="10" rx="4" fill="#fff" stroke="#5a1236" stroke-width="2.5"/><path d="M62 97 H88" stroke="#5a1236" stroke-width="1.5"/>',
  exhausted:'<ellipse cx="75" cy="97" rx="6" ry="4" fill="#8a1a4a"/>',joyful:'<path d="M62 92 Q75 108 88 92 Z" fill="#8a1a4a"/>'}[f];
 s+=eyes+brows+mouth;
 if(f==='pushing')s+='<path d="M30 40 l6 6 M120 40 l-6 6 M26 60 l8 2 M124 60 l-8 2" stroke="#ff5fa2" stroke-width="3" stroke-linecap="round"/>';
 if(f==='joyful'||f==='exhausted')s+='<g><ellipse cx="75" cy="134" rx="30" ry="13" fill="#fff6fb" stroke="#ff9cc9" stroke-width="2"/><circle cx="62" cy="128" r="10" fill="#ffe0cc" stroke="#e9a98a" stroke-width="1.5"/><path d="M57 128 q2 -2 4 0 M64 128 q2 -2 4 0" stroke="#5a1236" stroke-width="1.5" fill="none"/><path d="M52 124 Q62 112 72 124" fill="#ffb3d6"/></g>';
 if(f==='joyful')s+='<text x="118" y="30" font-size="16">💗</text><text x="16" y="34" font-size="12">✨</text>';
 s+='</g>';g.innerHTML=s}
function start(){mount();draw('calm');setInterval(tick,100)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();
})();
