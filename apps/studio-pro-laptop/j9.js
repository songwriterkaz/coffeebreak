// Coffeebreak laptop keys: piano and drum pads anywhere in the app
(function(){var MODE=SS.get('cbKeysMode')||'off',DOWN={};
var b=document.createElement('button');b.id='cbKeysBtn';b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;background:#ff4fa3;color:#fff;border:3px solid #fff;border-radius:22px;padding:10px 14px;font-weight:800;box-shadow:0 4px 12px #0008';
var hint=document.createElement('div');hint.style.cssText='position:fixed;right:12px;bottom:62px;z-index:9999;background:#1a0a12ee;color:#ffd9ea;border-radius:10px;padding:8px 10px;font:13px system-ui;max-width:280px;display:none';
function lab(){b.textContent='⌨ Laptop keys: '+(MODE==='off'?'Off':MODE==='piano'?'Piano':'Drum pads');
 hint.innerHTML=MODE==='piano'?'Piano: A W S E D F T G Y H U J K O L P. Z and X change octave. Plays the selected track.':MODE==='drums'?'Drum pads: number pad 1 to 8, or top row 1 to 8. Kick, Snare, Clap, Closed Hat, Open Hat, Low Tom, Hi Tom, Rim.':'';hint.style.display=MODE==='off'?'none':'block'}
b.onclick=function(){MODE=MODE==='off'?'piano':MODE==='piano'?'drums':'off';SS.set('cbKeysMode',MODE);lab();msg('Laptop keys: '+b.textContent.split(': ')[1]);b.blur()};
document.body.appendChild(b);document.body.appendChild(hint);lab();
function drumTrack(){var t=P.tracks[SEL.t];if(t&&t.type==='drums')return SEL.t;for(var i=0;i<P.tracks.length;i++)if(P.tracks[i].type==='drums')return i;return -1}
function pad(e){var m=/^(?:Numpad|Digit)([1-8])$/.exec(e.code);return m?(+m[1]-1):-1}
function typing(e){var tg=e.target.tagName;return (tg==='INPUT'&&e.target.type!=='range')||tg==='SELECT'||tg==='TEXTAREA'}
window.addEventListener('keydown',function(e){if(MODE==='off'||typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;var k=e.key.toLowerCase();
 if(MODE==='piano'){if(k in KMAP){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!DOWN[k]){DOWN[k]=OCT*12+12+KMAP[k];noteOn(DOWN[k],0.8)}return}
  if(k==='z'||k==='x'){e.preventDefault();e.stopImmediatePropagation();OCT=k==='z'?Math.max(1,OCT-1):Math.min(7,OCT+1);msg('Octave '+OCT);return}}
 if(MODE==='drums'){var r=pad(e);if(r>=0){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;if(ac.state!=='running')ac.resume();var di=drumTrack();if(di<0){msg('Add a drum track first');return}drum(ac,G.tr[di].in,P.tracks[di].kit,r,ac.currentTime,0.9)}}},true);
window.addEventListener('keyup',function(e){var k=e.key.toLowerCase();if(DOWN[k]!=null){e.stopImmediatePropagation();noteOff(DOWN[k]);delete DOWN[k]}},true);
})();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});
