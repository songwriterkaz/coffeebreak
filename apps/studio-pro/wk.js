class R extends AudioWorkletProcessor{process(i){var c=i[0]&&i[0][0];if(c)this.port.postMessage({t:currentTime,d:c.slice(0)});return true}}
registerProcessor("cb-rec",R);
class G extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:"th",defaultValue:-50}]}
constructor(){super();this.e=0;this.g=0}
process(i,o,p){var I=i[0],O=o[0];if(!I||!I.length)return true;var th=Math.pow(10,p.th[0]/20),n=I[0].length;
for(var k=0;k<n;k++){var a=0;for(var c=0;c<I.length;c++)a=Math.max(a,Math.abs(I[c][k]));this.e=a>this.e?a:this.e*0.9995;var tg=this.e>th?1:0;this.g+=(tg-this.g)*(tg>this.g?0.02:0.0015);for(var c2=0;c2<O.length;c2++)O[c2][k]=(I[c2]||I[0])[k]*this.g}return true}}
registerProcessor("cb-gate",G);
class T extends AudioWorkletProcessor{static get parameterDescriptors(){return[{name:"amt",defaultValue:1},{name:"speed",defaultValue:0.5}]}
constructor(){super();this.N=8192;this.b=new Float32Array(this.N);this.w=0;this.ph=0;this.r=1;this.tr=1;this.cnt=0;this.W=1536}
detect(){var N=this.N,L=1024,x=new Float32Array(512),i,s=0;for(i=0;i<512;i++){var j=(this.w-L+i*2+N)%N;x[i]=this.b[j];s+=x[i]*x[i]}if(s/512<1e-5)return 0;
var sr=sampleRate/2,mn=Math.floor(sr/1000),mx=Math.floor(sr/70),best=0,bl=0;for(var l=mn;l<mx&&l<400;l++){var c=0;for(i=0;i<512-l;i++)c+=x[i]*x[i+l];c/=s;if(c>best){best=c;bl=l}}if(best<0.5||!bl)return 0;return sr/bl}
process(i,o,p){var I=i[0],O=o[0];if(!I||!I.length)return true;var n=I[0].length,N=this.N,W=this.W,amt=p.amt[0],sp=p.speed[0];
for(var k=0;k<n;k++){var v=0;for(var c=0;c<I.length;c++)v+=I[c][k];v/=I.length;this.b[this.w]=v;this.w=(this.w+1)%N;
if(++this.cnt>=1024){this.cnt=0;var f=this.detect();if(f>0){var m=69+12*Math.log2(f/440),t=Math.round(m),tf=440*Math.pow(2,(t-69)/12);this.tr=1+(tf/f-1)*amt}else this.tr=1}
this.r+=(this.tr-this.r)*(0.0002+sp*0.004);this.ph+=(1-this.r)/W;this.ph-=Math.floor(this.ph);
var p2=(this.ph+0.5)%1,d1=this.ph*W+64,d2=p2*W+64,g1=1-Math.abs(2*this.ph-1),g2=1-Math.abs(2*p2-1);
var r1=(this.w-d1+N)%N,r2=(this.w-d2+N)%N,i1=Math.floor(r1),i2=Math.floor(r2),f1=r1-i1,f2=r2-i2;
var s1=this.b[i1]*(1-f1)+this.b[(i1+1)%N]*f1,s2=this.b[i2]*(1-f2)+this.b[(i2+1)%N]*f2;var y=s1*g1+s2*g2;for(var c3=0;c3<O.length;c3++)O[c3][k]=y}return true}}
registerProcessor("cb-tune",T);
