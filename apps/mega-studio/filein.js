/* Coffeebreak Mega Studio file import. (c) Coffeebreak (Karen O'Brien). All rights reserved. */
'use strict';
const NOAUDIO='This file has no playable audio';
const TEXT_EXT=/\.(txt|lrc|text|lyrics?)$/i, IMG_EXT=/\.(png|jpe?g|gif|webp|bmp|avif|svg|ico)$/i;
const MEDIA_EXT=/\.(aif|aiff|aifc|wma|amr|ape|wv|ac3|eac3|dts|mka|mkv|avi|wmv|asf|flv|3gp|3g2|caf|opus|au|snd|ra|rm|m4a|m4b|m4r|mov|mpg|mpeg|mp2|mpa|ts|mts|m2ts|tta|spx|voc|w64|aac|flac|ogg|oga|ogv|webm|mp3|mp4|m4v|wav|weba|gsm|dv|vob|xm|mod|s3m|it)$/i;
function fileKind(f){const t=(f.type||'').toLowerCase(),n=f.name||'';
 if(TEXT_EXT.test(n)||t.startsWith('text/'))return 'text';
 if(IMG_EXT.test(n)||t.startsWith('image/'))return 'image';
 return 'media'}
/* ffmpeg.wasm fallback, single-thread core so no SharedArrayBuffer or special headers are needed */
let FF=null;
function ffScript(){return new Promise((ok,no)=>{if(window.FFmpegWASM)return ok();const s=document.createElement('script');s.src='ffmpeg/ffmpeg.js';s.onload=()=>ok();s.onerror=()=>no(new Error('ffmpeg script failed'));document.head.append(s)})}
async function ffLoad(){if(FF)return FF;FF=(async()=>{await ffScript();const ff=new FFmpegWASM.FFmpeg();const base=new URL('ffmpeg/',location.href).href;
 await ff.load({coreURL:base+'ffmpeg-core.js',wasmURL:base+'ffmpeg-core.wasm'});return ff})();
 try{return await FF}catch(e){FF=null;throw e}}
async function ffToWav(bytes,name){const ff=await ffLoad();const ext=((name||'').match(/\.[a-z0-9]{1,5}$/i)||[''])[0];const inN='in'+ext;
 await ff.writeFile(inN,bytes);let ok=true;try{await ff.exec(['-i',inN,'-vn','-ac','2','-ar','44100','-c:a','pcm_s16le','-f','wav','out.wav'])}catch(e){ok=false}
 let out=null;try{out=await ff.readFile('out.wav')}catch(e){}try{await ff.deleteFile(inN)}catch(e){}try{await ff.deleteFile('out.wav')}catch(e){}
 if(!ok||!out||out.length<=44)throw new Error(NOAUDIO);return out}
/* replaces the old loadFile: native decode first, ffmpeg second, friendly error last */
async function decodeAny(f){const ab=await f.arrayBuffer();
 try{const b=await ctx.decodeAudioData(ab.slice(0));if(b&&b.length)return b}catch(e){}
 const t=(f.type||'').toLowerCase();
 if(!(t.startsWith('audio/')||t.startsWith('video/')||MEDIA_EXT.test(f.name||'')||!t))throw new Error(NOAUDIO);
 try{toast('Converting '+f.name+', this can take a moment the first time');const w=await ffToWav(new Uint8Array(ab),f.name);const b=await ctx.decodeAudioData(w.buffer.slice(w.byteOffset,w.byteOffset+w.byteLength));if(b&&b.length)return b}catch(e){}
 throw new Error(NOAUDIO)}
function fileMsg(m,where){toast(m);const o=where&&$(where);if(o){o.textContent=m}}
/* lyrics: .txt and .lrc */
function cleanLrc(txt){txt=txt.replace(/^\uFEFF/,'');const out=[];
 txt.split(/\r?\n/).forEach(l=>{if(/^\s*\[(ti|ar|al|au|by|re|ve|length|offset|la|id|#)\s*:[^\]]*\]\s*$/i.test(l))return;
  const st=[];let m,rest=l;while((m=rest.match(/^\s*\[(\d+):(\d+)(?:[.:](\d+))?\]/))){st.push([+m[1],+m[2],m[3]||'00']);rest=rest.slice(m[0].length)}
  rest=rest.replace(/<\d+:\d+(?:[.:]\d+)?>/g,'').trim();
  if(st.length)st.forEach(s=>out.push({t:s[0]*60+s[1]+ +('0.'+s[2]),x:'['+String(s[0]).padStart(2,'0')+':'+String(s[1]).padStart(2,'0')+'.'+String(s[2]).padEnd(2,'0').slice(0,2)+'] '+rest}));
  else out.push({t:null,x:l})});
 if(out.some(o=>o.t!=null)){const timed=out.filter(o=>o.t!=null).sort((a,b)=>a.t-b.t);return timed.map(o=>o.x).join('\n')}
 return out.map(o=>o.x).join('\n').trim()}
async function readText(f){const ab=await f.arrayBuffer();let s=new TextDecoder('utf-8').decode(ab);if(s.includes('\uFFFD'))s=new TextDecoder('windows-1252').decode(ab);return s}
async function importLyrics(f,dest){const t=cleanLrc(await readText(f));if(!t.trim()){fileMsg('That text file is empty');return}
 if(dest==='clean'){$('lcText').value=t;$('lcScan').click();toast('Lyrics loaded into the Lyric Cleaner')}
 else{$('lyrText').value=t;parseLyrics();toast('Lyrics loaded into karaoke from '+f.name)}}
/* cover art */
async function importCover(f){let bmp;try{bmp=await createImageBitmap(f)}catch(e){try{bmp=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)})}catch(e2){fileMsg('This image could not be opened');return}}
 const w=bmp.width||bmp.naturalWidth,h=bmp.height||bmp.naturalHeight,sc=Math.min(1,1400/Math.max(w,h)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(w*sc));cv.height=Math.max(1,Math.round(h*sc));
 const g=cv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.drawImage(bmp,0,0,cv.width,cv.height);
 const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',0.9));S.cover={blob,bytes:new Uint8Array(await blob.arrayBuffer()),url:URL.createObjectURL(blob),name:f.name};showCover();toast('Cover art added. It is saved inside your WAV exports.')}
function showCover(){const c=S.cover;document.querySelectorAll('.coverImg').forEach(i=>{i.style.display=c?'':'none';if(c)i.src=c.url});const n=$('coverInfo');if(n)n.textContent=c?'Cover: '+c.name+'. Saved inside WAV exports.':'No cover yet. Add a picture to use as cover art.'}
/* ID3 tag inside a WAV ("id3 " chunk) with title and cover picture, built synchronously for encodeWAV */
function wavCoverChunk(title){if(typeof S==='undefined'||!S.cover)return new Uint8Array(0);const enc=new TextEncoder(),fr=[];
 const frame=(id,body)=>{const h=new Uint8Array(10);h.set(enc.encode(id));const n=body.length;h[4]=n>>>24&255;h[5]=n>>>16&255;h[6]=n>>>8&255;h[7]=n&255;fr.push(h,body)};
 frame('TIT2',new Uint8Array([3,...enc.encode(title||'Coffeebreak song')]));frame('TPE1',new Uint8Array([3,...enc.encode('Coffeebreak')]));
 const pre=new Uint8Array([0,...enc.encode('image/jpeg'),0,3,0]);const pic=new Uint8Array(pre.length+S.cover.bytes.length);pic.set(pre);pic.set(S.cover.bytes,pre.length);frame('APIC',pic);
 const size=fr.reduce((a,x)=>a+x.length,0),len=10+size,pad=len%2,out=new Uint8Array(8+len+pad);out.set(enc.encode('id3 '));new DataView(out.buffer).setUint32(4,len,true);
 out.set(enc.encode('ID3'),8);out[11]=3;out[14]=size>>>21&127;out[15]=size>>>14&127;out[16]=size>>>7&127;out[17]=size&127;let p=18;fr.forEach(x=>{out.set(x,p);p+=x.length});return out}
/* one entry point for every picker and drop zone */
async function takeFile(f,onAudio,opt){opt=opt||{};const k=fileKind(f);
 if(k==='text'){if(opt.noText){fileMsg('Text files go to the Karaoke lyrics or the Lyric Cleaner',opt.out);return}return importLyrics(f,opt.lyrics)}
 if(k==='image')return importCover(f);
 if(!onAudio){fileMsg(NOAUDIO,opt.out);return}
 toast('Loading '+f.name);let b;try{b=await decodeAny(f)}catch(e){fileMsg(NOAUDIO+' ('+f.name+')',opt.out);return}
 await onAudio(b,f.name)}
function pick(input,onAudio,opt){input.removeAttribute('accept');input.onchange=async()=>{const f=input.files[0];input.value='';if(f)await takeFile(f,onAudio,opt)}}
/* drag and drop: any element with data-drop gets a handler stored in DROPS */
const DROPS={};
function dropZone(name,onAudio,opt){DROPS[name]={onAudio,opt}}
addEventListener('dragover',e=>{e.preventDefault();const z=e.target.closest&&e.target.closest('[data-drop]');document.querySelectorAll('.dropon').forEach(x=>x!==z&&x.classList.remove('dropon'));if(z)z.classList.add('dropon');e.dataTransfer.dropEffect=z?'copy':'none'});
addEventListener('dragleave',e=>{if(!e.relatedTarget)document.querySelectorAll('.dropon').forEach(x=>x.classList.remove('dropon'))});
addEventListener('drop',async e=>{e.preventDefault();document.querySelectorAll('.dropon').forEach(x=>x.classList.remove('dropon'));const z=e.target.closest&&e.target.closest('[data-drop]');
 const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])];if(!fs.length)return;if(!z||!DROPS[z.dataset.drop]){toast('Drop files onto a deck, a track, the karaoke cards, the master card or the Lyric Cleaner');return}
 const d=DROPS[z.dataset.drop];for(const f of fs)await takeFile(f,d.onAudio,d.opt)});
