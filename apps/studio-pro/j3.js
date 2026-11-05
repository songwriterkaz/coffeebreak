function mtof(p){return 440*Math.pow(2,(p-69)/12)}
function synthNote(ctx,out,inst,p,v,t,d,L){var f=mtof(p),g=ctx.createGain(),oscs=[],rel=0.25,end=d==null?null:t+d;g.connect(out);var A=g.gain;v=v==null?0.8:v;
 function osc(type,fr,gain,det){var o=ctx.createOscillator();o.type=type;o.frequency.value=fr;if(det)o.detune.value=det;var og=ctx.createGain();og.gain.value=gain;o.connect(og);oscs.push(o);return og}
 var flt=ctx.createBiquadFilter();flt.type='lowpass';flt.connect(g);
 if(inst==='Piano'){osc('triangle',f,0.6).connect(flt);osc('sine',f*2,0.25).connect(flt);osc('sine',f*3.01,0.08).connect(flt);flt.frequency.setValueAtTime(Math.min(12000,f*8),t);flt.frequency.exponentialRampToValueAtTime(Math.max(200,f*2),t+1.5);var dec=Math.min(4,1.2+(90-p)*0.04);A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.5*v,t+0.004);A.setTargetAtTime(0.18*v,t+0.004,0.25);A.setTargetAtTime(0.0001,t+0.3,dec/3);rel=0.18}
 else if(inst==='Electric Piano'){var car=ctx.createOscillator(),mod=ctx.createOscillator(),mg=ctx.createGain();car.frequency.value=f;mod.frequency.value=f;mg.gain.setValueAtTime(f*2.5,t);mg.gain.exponentialRampToValueAtTime(f*0.2+1,t+0.8);mod.connect(mg);mg.connect(car.frequency);var cg=ctx.createGain();cg.gain.value=0.5;car.connect(cg);cg.connect(flt);oscs.push(car,mod);flt.frequency.value=6000;A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.55*v,t+0.003);A.setTargetAtTime(0.0001,t+0.01,1.2);rel=0.2}
 else if(inst==='Organ'){[1,2,3,4,6].forEach(function(h,i){osc('sine',f*h,[0.4,0.3,0.15,0.1,0.06][i]).connect(flt)});flt.frequency.value=7000;A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.4*v,t+0.01);rel=0.06}
 else if(inst==='Pad'){osc('sawtooth',f,0.25,-8).connect(flt);osc('sawtooth',f,0.25,8).connect(flt);osc('sawtooth',f/2,0.15,3).connect(flt);flt.frequency.setValueAtTime(400,t);flt.frequency.linearRampToValueAtTime(2200,t+0.8);flt.Q.value=1;A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.35*v,t+0.45);rel=0.9}
 else if(inst==='Bass'){osc('square',f,0.35).connect(flt);osc('sine',f/2,0.6).connect(flt);flt.frequency.setValueAtTime(1600,t);flt.frequency.exponentialRampToValueAtTime(350,t+0.25);flt.Q.value=4;A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.6*v,t+0.005);A.setTargetAtTime(0.35*v,t+0.01,0.2);rel=0.08}
 else if(inst==='Lead'){osc('sawtooth',f,0.35,-5).connect(flt);osc('square',f,0.15,5).connect(flt);flt.frequency.value=3200;flt.Q.value=2;A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.4*v,t+0.01);A.setTargetAtTime(0.3*v,t+0.02,0.1);rel=0.15}
 else {osc('sawtooth',f,0.5).connect(flt);flt.frequency.setValueAtTime(Math.min(15000,f*14),t);flt.frequency.exponentialRampToValueAtTime(Math.max(120,f),t+0.3);A.setValueAtTime(0,t);A.linearRampToValueAtTime(0.5*v,t+0.002);A.setTargetAtTime(0.0001,t+0.003,0.25);rel=0.1}
 if(end!=null){A.cancelScheduledValues(Math.max(end,t+0.011));A.setTargetAtTime(0,Math.max(end,t+0.011),rel/3)}
 oscs.forEach(function(o){o.start(t);if(end!=null)o.stop(Math.max(end,t+0.011)+rel*3+0.05)});if(L)L.push.apply(L,oscs);
 return{release:function(when){A.cancelScheduledValues(when);A.setValueAtTime(A.value,when);A.setTargetAtTime(0,when,rel/3);oscs.forEach(function(o){try{o.stop(when+rel*3+0.05)}catch(e){}})}}}
var KIT={'808':{kf:55,kd:0.9,sn:1,hh:1,tone:0},'Acoustic':{kf:70,kd:0.35,sn:1.3,hh:0.8,tone:1},'Electro':{kf:62,kd:0.5,sn:0.8,hh:1.3,tone:2},'Lo-Fi':{kf:50,kd:0.6,sn:0.9,hh:0.6,tone:3}};
function drum(ctx,out,kit,row,t,v,L){var K=KIT[kit]||KIT['808'];v=v||1;var g=ctx.createGain();g.connect(out);var A=g.gain;
 function nz(type,fr,q){var s=ctx.createBufferSource();s.buffer=noise(ctx);var f=ctx.createBiquadFilter();f.type=type;f.frequency.value=fr;if(q)f.Q.value=q;s.connect(f);f.connect(g);if(L)L.push(s);return s}
 function os(type,f0,f1,dur){var o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);o.connect(g);if(L)L.push(o);return o}
 var s,o,d;
 switch(row){
 case 0:o=os('sine',K.kf*3,K.kf,0.12);d=K.kd;A.setValueAtTime(v,t);A.exponentialRampToValueAtTime(0.001,t+d);o.start(t);o.stop(t+d+0.05);if(K.tone===1){s=nz('lowpass',1500);s.start(t);s.stop(t+0.02)}break;
 case 1:s=nz('highpass',1200*K.sn);o=os('triangle',190,160,0.1);d=0.18*K.sn;A.setValueAtTime(0.7*v,t);A.exponentialRampToValueAtTime(0.001,t+d);s.start(t);s.stop(t+d+0.05);o.start(t);o.stop(t+0.12);break;
 case 2:s=nz('bandpass',1100,1.5);A.setValueAtTime(0.001,t);[0,0.01,0.02].forEach(function(x){A.setValueAtTime(0.8*v,t+x);A.exponentialRampToValueAtTime(0.1,t+x+0.009)});A.setValueAtTime(0.6*v,t+0.03);A.exponentialRampToValueAtTime(0.001,t+0.22);s.start(t);s.stop(t+0.25);break;
 case 3:s=nz('highpass',7000*K.hh);A.setValueAtTime(0.4*v,t);A.exponentialRampToValueAtTime(0.001,t+0.05);s.start(t);s.stop(t+0.07);break;
 case 4:s=nz('highpass',6500*K.hh);A.setValueAtTime(0.35*v,t);A.exponentialRampToValueAtTime(0.001,t+0.35);s.start(t);s.stop(t+0.4);break;
 case 5:o=os('sine',140,85,0.25);A.setValueAtTime(0.7*v,t);A.exponentialRampToValueAtTime(0.001,t+0.4);o.start(t);o.stop(t+0.45);break;
 case 6:o=os('sine',230,150,0.2);A.setValueAtTime(0.6*v,t);A.exponentialRampToValueAtTime(0.001,t+0.3);o.start(t);o.stop(t+0.35);break;
 default:o=os('square',800,null);s=nz('bandpass',1800,4);A.setValueAtTime(0.35*v,t);A.exponentialRampToValueAtTime(0.001,t+0.04);o.start(t);o.stop(t+0.05);s.start(t);s.stop(t+0.05)}}
function scheduleRange(ctx,GG,from,t0,to,L,metro,metroFrom){var S=spb();
 P.tracks.forEach(function(t,i){var tin=GG.tr[i].in;t.clips.forEach(function(c){var cs=c.start,ce=c.start+c.len;if(ce<=from||cs>=to)return;
  if(c.kind==='audio'){var b=BUFS[c.buf];if(!b)return;var pf=Math.max(from,cs),pt=Math.min(ce,to),when=t0+(pf-from)*S,off=c.off+(pf-cs)*S,dur=(pt-pf)*S;if(off>=b.duration||dur<=0)return;var src=ctx.createBufferSource();src.buffer=b;var g=ctx.createGain();src.connect(g);g.connect(tin);var ts=t0+(cs-from)*S,te=t0+(ce-from)*S,G0=c.gain==null?1:c.gain,fi=c.fi||0,fo=c.fo||0;
   var gv=function(x){var k=G0;if(fi>0)k*=Math.max(0,Math.min(1,(x-ts)/fi));if(fo>0)k*=Math.max(0,Math.min(1,(te-x)/fo));return k};
   g.gain.setValueAtTime(gv(when),when);if(fi>0&&ts+fi>when)g.gain.linearRampToValueAtTime(G0,ts+fi);if(fo>0){var fs=Math.max(when,ts+fi,te-fo);g.gain.setValueAtTime(gv(fs),fs);g.gain.linearRampToValueAtTime(0,te)}
   src.start(Math.max(when,ctx.currentTime),off,dur);L.push(src)}
  else if(c.kind==='midi'){c.notes.forEach(function(n){if(n.t>=c.len)return;var nb=cs+n.t;if(nb<from||nb>=to)return;synthNote(ctx,tin,t.inst,n.p,n.v,t0+(nb-from)*S,Math.min(n.d,c.len-n.t)*S,L)})}
  else if(c.kind==='drums'){var st=bpb()/16;for(var k=0;k*st<c.len-1e-6;k++){var b2=cs+k*st;if(b2<from-1e-6||b2>=to)continue;var col=k%16;for(var r=0;r<8;r++)if(c.steps[r][col])drum(ctx,tin,t.kit,r,t0+(b2-from)*S,c.steps[r][col]>1?1:0.75,L)}}})});
 if(metro){var mf=metroFrom==null?from:metroFrom;var bp=bpb(),first=Math.ceil(mf-1e-6);for(var b3=first;b3<to&&b3<first+2000;b3++){var tt=t0+(b3-from)*S;if(!P.met&&b3>=from)break;if(tt<ctx.currentTime)continue;var o=ctx.createOscillator(),g2=ctx.createGain(),acc=((b3%bp)+bp)%bp===0;o.frequency.value=acc?1760:1100;g2.gain.setValueAtTime(0.35,tt);g2.gain.exponentialRampToValueAtTime(0.001,tt+0.05);o.connect(g2);g2.connect(ctx.destination);o.start(tt);o.stop(tt+0.06);L.push(o)}}}
var PLAY={on:false,t0:0,from:0,L:[]},POS=0;
function pos(){return PLAY.on?PLAY.from+(ac.currentTime-PLAY.t0)/spb():POS}
function stopSources(){PLAY.L.forEach(function(s){try{s.stop()}catch(e){}try{s.disconnect()}catch(e){}});PLAY.L=[]}
function startSources(from,t0,metroFrom){PLAY.from=from;PLAY.t0=t0;var to;if(REC.on)to=from+2000;else if(P.loop.on&&from<P.loop.e)to=P.loop.e;else to=Math.max(songEnd(),from+0.001);if(!REC.on&&P.met&&!P.loop.on)to=Math.max(to,from+bpb()*8);scheduleRange(ac,G,from,t0,to,PLAY.L,P.met||metroFrom!=null,metroFrom)}
function setPlayBtn(on){$('play').classList.toggle('on',on);$('play').innerHTML=on?'&#9632; Stop':'&#9654; Play'}
function play(from,lead){if(ac.state!=='running')ac.resume();if(PLAY.on)stopSources();PLAY.on=true;if(from==null)from=POS;LU.sum=0;LU.n=0;startSources(from,ac.currentTime+0.05+(lead||0),lead?from-lead/spb():null);setPlayBtn(true)}
function stop(){if(REC.on){stopRec();return}if(!PLAY.on){POS=0;drawPH();upLCD();return}POS=pos();PLAY.on=false;stopSources();setPlayBtn(false);drawPH();upLCD()}
