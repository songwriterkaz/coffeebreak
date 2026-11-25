// Pure helpers (shared by app and tests)
(function(root){
const clamp=(v,a=0,b=255)=>v<a?a:v>b?b:v;
const PRESETS={
 none:{},
 silk:{exposure:8,contrast:-8,warmth:6,saturation:-6,fade:10,glow:30,smooth:20},
 champagne:{exposure:6,contrast:4,warmth:22,saturation:-4,fade:8,glow:15,vignette:15},
 noir:{bw:1,contrast:28,exposure:-2,grain:18,vignette:35},
 vintage:{warmth:15,saturation:-20,fade:25,grain:22,vignette:25,contrast:-6},
 rosegold:{warmth:12,tint:14,saturation:6,glow:20,fade:6},
 cbwarm:{warmth:26,contrast:10,saturation:8,vignette:20,exposure:4}
};
const PRO=['champagne','noir','vintage','rosegold','cbwarm'];
const DEF={exposure:0,contrast:0,warmth:0,tint:0,saturation:0,fade:0,grain:0,vignette:0,glow:0,smooth:0,bw:0};
// per-pixel tone adjustment; arrays are RGBA
function adjust(d,w,h,p){
 p=Object.assign({},DEF,p);
 const ex=Math.pow(2,p.exposure/50),ct=(100+p.contrast)/100,sat=1+p.saturation/100,fd=p.fade/100*60;
 const cx=w/2,cy=h/2,md=Math.hypot(cx,cy),vg=p.vignette/100,gr=p.grain*0.9;
 for(let y=0,i=0;y<h;y++)for(let x=0;x<w;x++,i+=4){
  let r=d[i]*ex,g=d[i+1]*ex,b=d[i+2]*ex;
  r+=p.warmth*0.6;b-=p.warmth*0.6;r+=p.tint*0.3;g-=p.tint*0.4;b+=p.tint*0.2;
  r=(r-128)*ct+128;g=(g-128)*ct+128;b=(b-128)*ct+128;
  const l=0.299*r+0.587*g+0.114*b;
  if(p.bw){r=g=b=l}else{r=l+(r-l)*sat;g=l+(g-l)*sat;b=l+(b-l)*sat}
  r=r+(fd)*(1-r/255);g=g+fd*(1-g/255);b=b+fd*(1-b/255);
  if(vg){const k=1-vg*Math.pow(Math.hypot(x-cx,y-cy)/md,2);r*=k;g*=k;b*=k}
  if(gr){const n=(Math.random()-0.5)*gr;r+=n;g+=n;b+=n}
  d[i]=clamp(r);d[i+1]=clamp(g);d[i+2]=clamp(b);
 }
 return d;
}
function blend(a,b,t){for(let i=0;i<a.length;i+=4){a[i]=a[i]*(1-t)+b[i]*t;a[i+1]=a[i+1]*(1-t)+b[i+1]*t;a[i+2]=a[i+2]*(1-t)+b[i+2]*t}return a}
function screen(a,b,t){for(let i=0;i<a.length;i+=4)for(let c=0;c<3;c++){const s=255-(255-a[i+c])*(255-b[i+c])/255;a[i+c]=a[i+c]*(1-t)+s*t}return a}
function aspectCrop(w,h,ar){ // ar like '4:5' -> centred crop rect
 const [a,b]=ar.split(':').map(Number),t=a/b;let cw=w,ch=w/t;if(ch>h){ch=h;cw=h*t}
 return{x:Math.round((w-cw)/2),y:Math.round((h-ch)/2),w:Math.round(cw),h:Math.round(ch)}}
function normCode(s){return String(s||'').trim().toUpperCase().replace(/\s+/g,'')}
async function sha256hex(s){
 if(root.crypto&&root.crypto.subtle){const b=await root.crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
 return require('crypto').createHash('sha256').update(s).digest('hex')}
async function checkCode(code,hashes){return hashes.includes(await sha256hex('cbbs:'+normCode(code)))}
async function hashPin(pin){return sha256hex('cbbs-pin:'+pin)}
const validPin=p=>/^\d{4}$/.test(p);
function consentValid(f){ // returns list of problems
 const e=[];if(!f.model)e.push('Model name');if(!f.photographer)e.push('Photographer name');
 if(!f.adult)e.push('18+ confirmation');if(!f.uses||!Object.values(f.uses).some(Boolean))e.push('At least one use ticked');
 if(!f.modelSig)e.push('Model signature');if(!f.photogSig)e.push('Photographer signature');return e}
// Minimal single-page PDF wrapping a JPEG (bytes as Uint8Array)
function jpegToPdf(jpg,w,h){
 const pw=595,ph=Math.round(595*h/w),enc=s=>new TextEncoder().encode(s);const parts=[],offs=[];let len=0;
 const push=u=>{parts.push(u);len+=u.length};push(enc('%PDF-1.4\n'));
 const obj=(n,body,stream)=>{offs[n]=len;push(enc(n+' 0 obj\n'+body+(stream?'\nstream\n':'\nendobj\n')));if(stream){push(stream);push(enc('\nendstream\nendobj\n'))}};
 obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[3 0 R]/Count 1>>');
 obj(3,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${pw} ${ph}]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>`);
 obj(4,`<</Type/XObject/Subtype/Image/Width ${w}/Height ${h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>`,jpg);
 const c=enc(`q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`);obj(5,`<</Length ${c.length}>>`,c);
 const x=len;let t='xref\n0 6\n0000000000 65535 f \n';for(let n=1;n<=5;n++)t+=String(offs[n]).padStart(10,'0')+' 00000 n \n';
 push(enc(t+'trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n'+x+'\n%%EOF'));
 const out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
const API={clamp,PRESETS,PRO,DEF,adjust,blend,screen,aspectCrop,normCode,sha256hex,checkCode,hashPin,validPin,consentValid,jpegToPdf};
if(typeof module!=='undefined')module.exports=API;else root.CB=API;
})(typeof window!=='undefined'?window:globalThis);
