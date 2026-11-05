// Tiny GIF89a encoder (web-safe 216 + 40 pink palette, LZW). Original code, free.
function encodeGIF(frames,w,h,delayCs){
 const pal=[];for(let r=0;r<6;r++)for(let g=0;g<6;g++)for(let b=0;b<6;b++)pal.push([r*51,g*51,b*51]);
 for(let i=0;i<40;i++){const t=i/39;pal.push([255,Math.round(150+t*100),Math.round(190+t*60)])}
 const out=[];const s=t=>{for(const c of t)out.push(c.charCodeAt(0))};const w16=v=>out.push(v&255,v>>8);
 s('GIF89a');w16(w);w16(h);out.push(0xF7,0,0);for(const p of pal)out.push(...p);
 out.push(0x21,0xFF,11);s('NETSCAPE2.0');out.push(3,1,0,0,0);
 const cache=new Map();
 const near=(r,g,b)=>{const k=(r>>2)<<12|(g>>2)<<6|(b>>2);let v=cache.get(k);if(v!==undefined)return v;let best=0,bd=1e9;for(let i=0;i<256;i++){const p=pal[i],d=(p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2;if(d<bd){bd=d;best=i}}cache.set(k,best);return best};
 for(const data of frames){
  out.push(0x21,0xF9,4,0,delayCs&255,delayCs>>8,0,0);out.push(0x2C);w16(0);w16(0);w16(w);w16(h);out.push(0);
  const px=new Uint8Array(w*h);for(let i=0;i<w*h;i++)px[i]=near(data[i*4],data[i*4+1],data[i*4+2]);
  out.push(8);const bytes=[];let cur=0,nb=0;const emit=(c,sz)=>{cur|=c<<nb;nb+=sz;while(nb>=8){bytes.push(cur&255);cur>>=8;nb-=8}};
  let dict=new Map(),size=9,next=258;emit(256,size);let prev=px[0];
  for(let i=1;i<px.length;i++){const k=px[i],key=prev*256+k;const f=dict.get(key);if(f!==undefined){prev=f;continue}
   emit(prev,size);if(next<4096){dict.set(key,next++);if(next>(1<<size)&&size<12)size++}else{emit(256,size);dict=new Map();size=9;next=258}prev=k}
  emit(prev,size);emit(257,size);if(nb>0)bytes.push(cur&255);
  for(let i=0;i<bytes.length;i+=255){const c=bytes.slice(i,i+255);out.push(c.length,...c)}out.push(0)}
 out.push(0x3B);return new Blob([new Uint8Array(out)],{type:'image/gif'})}
