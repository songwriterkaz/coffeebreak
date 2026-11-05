/* Coffeebreak Mega Studio preset engine. Presets are generated on demand from an index, so nothing heavy runs at load. (c) Coffeebreak */
(function(g){
const GEN=['Pop','Rock','Hip Hop','Trap','R&B','Country','EDM','House','Techno','Trance','Drum and Bass','Dubstep','Lo-fi','Jazz','Blues','Soul','Funk','Disco','Reggae','Metal','Punk','Indie','Folk','Gospel','Ambient','Synthwave','K-pop','Afrobeats','Latin','Reggaeton','Ballad','Acoustic','Orchestral','Cinematic','Grunge','Thriller','Halloween','Christmas','Musical','Kids Party'];
const SRC=['Lead vocal','Backing vocal','Rap vocal','Karaoke mic','Podcast voice','Choir','Kick','Snare','Hats','Percussion','808','Bass','Sub bass','Electric guitar','Acoustic guitar','Piano','Organ','Synth lead','Pads','Strings','Brass','DJ deck','Sample','FX riser','Full mix'];
const STY=['Clean','Warm','Bright','Punchy','Wide','Vintage','Dark','Airy','Aggressive','Lo-fi','Spacey'];
const PLAT=[['Spotify',-14],['YouTube',-14],['Apple Music',-16],['Radio',-9],['Suno',-12],['Club',-7],['Podcast',-16]];
const INT=['Gentle','Balanced','Loud'];
const FX=['echo','reverb','flanger','phaser','bitcrush','gate','distortion','tremolo','autopan','sweep','chorus','lofi','telephone','robot'];
const AMT=['Touch','Light','Medium','Heavy','Wild','Build','Drop','Breakdown'];
const RATE=['1/16','1/8','1/4','1/2','1 bar'];
const VOI=['Natural','Pop star','Rock belter','Soul diva','Country','Rapper','Robot tune','Hard tune','Soft tune','Ballad','Choir','Radio host','Stadium','Telephone','Lo-fi','Dreamy','Thriller','Spooky','Duet','Crooner'];
const ROOM=['Dry','Bedroom','Studio booth','Club','Hall','Church','Arena','Plate','Spring','Cave','Bathroom','Space'];
const N={chain:GEN.length*SRC.length*STY.length,master:PLAT.length*GEN.length*INT.length,djfx:FX.length*AMT.length*RATE.length,voice:VOI.length*ROOM.length};
const TOTAL=N.chain+N.master+N.djfx+N.voice;
function rnd(seed){let s=seed*2654435761>>>0;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
const r1=v=>Math.round(v*10)/10;
const SB={ 'Lead vocal':[-2,2,3,90],'Backing vocal':[-4,0,2,140],'Rap vocal':[-1,3,2,80],'Karaoke mic':[-2,2,2,100],'Podcast voice':[-1,2,1,80],'Choir':[-3,0,3,120],'Kick':[4,-3,1,30],'Snare':[0,2,3,90],'Hats':[-8,-1,4,300],'Percussion':[-4,1,3,150],'808':[5,-2,-3,25],'Bass':[4,-1,-2,35],'Sub bass':[6,-4,-6,20],'Electric guitar':[-2,2,1,90],'Acoustic guitar':[-3,1,3,80],'Piano':[0,0,1,50],'Organ':[1,0,-1,60],'Synth lead':[-1,2,2,100],'Pads':[0,-2,1,80],'Strings':[-1,0,2,60],'Brass':[-1,2,1,90],'DJ deck':[1,0,1,25],'Sample':[0,0,0,40],'FX riser':[-4,0,4,150],'Full mix':[1,0,1,25]};
const SM={Clean:[0,0,0,0,0],Warm:[2,0,-2,0,0],Bright:[-1,0,3,0,0],Punchy:[1,2,1,1,0],Wide:[0,-1,1,0,1],Vintage:[1,1,-3,0,0],Dark:[1,0,-4,0,0],Airy:[-1,-1,4,0,1],Aggressive:[1,3,2,2,0],'Lo-fi':[0,2,-5,1,0],Spacey:[0,-1,2,0,2]};
function chain(i){const st=i%STY.length,sr=Math.floor(i/STY.length)%SRC.length,gn=Math.floor(i/(STY.length*SRC.length));
 const R=rnd(i+11),b=SB[SRC[sr]],m=SM[STY[st]],sty=STY[st];const gfx=gn%7;
 const fxT=sty==='Lo-fi'?'lofi':sty==='Spacey'?'chorus':sty==='Vintage'?'phaser':sty==='Aggressive'?'distortion':['none','none','chorus','echo','none','phaser','none'][gfx];
 return{id:'c'+i,kind:'chain',name:GEN[gn]+' '+SRC[sr]+' '+sty,s:{eq:[r1(b[0]+m[0]+R()*2-1),r1(b[1]+m[1]+R()*2-1),r1(b[2]+m[2]+R()*2-1)],hpf:Math.round(b[3]*(0.8+R()*0.4)),
 comp:{th:Math.round(-14-m[3]*6-R()*10),ratio:r1(2+m[3]*2+R()*3),att:Math.round((0.003+R()*0.02)*1000)/1000,rel:r1(0.1+R()*0.3)},fx:{type:fxT,wet:r1(0.1+R()*0.3),p:r1(R())},rev:r1(0.05+m[4]*0.2+R()*0.2),dly:r1(m[4]*0.1+R()*0.15),pan:0,gain:0}}}
function master(i){const it=i%3,gn=Math.floor(i/3)%GEN.length,pl=Math.floor(i/(3*GEN.length));const R=rnd(i+777),P=PLAT[pl];
 const club=P[0]==='Club',drive=it;
 return{id:'m'+i,kind:'master',name:P[0]+' '+GEN[gn]+' master '+INT[it]+' ('+P[1]+' LUFS)',s:{eq5:[r1((club?2:0.5)+R()*1.5),r1(-R()*1.5),r1(R()-0.5),r1(R()*1.5),r1(0.5+R()*2)],
 mb:[[Math.round(-20-drive*4-R()*4),r1(2+drive),r1(1+drive*0.5)],[Math.round(-18-drive*4-R()*4),r1(1.5+drive*0.8),r1(0.5+drive*0.5)],[Math.round(-20-drive*3-R()*4),r1(2+drive*0.7),r1(0.5+drive*0.5)]],
 glue:{th:Math.round(-10-drive*4),ratio:r1(1.5+drive*0.5)},width:r1(club?1:1.1+R()*0.3),ceil:P[0]==='Spotify'||P[0]==='Apple Music'?-1:-0.3,target:P[1]}}}
function djfx(i){const rt=i%RATE.length,am=Math.floor(i/RATE.length)%AMT.length,fx=Math.floor(i/(RATE.length*AMT.length));
 return{id:'d'+i,kind:'djfx',name:FX[fx]+' '+AMT[am]+' '+RATE[rt],s:{fx:{type:FX[fx],wet:r1(0.15+am*0.1),p:r1([0.1,0.25,0.45,0.7,0.95][rt])},filter:AMT[am]==='Build'?0.3:AMT[am]==='Breakdown'?-0.4:0}}}
function voice(i){const rm=i%ROOM.length,vo=Math.floor(i/ROOM.length);const R=rnd(i+999),v=VOI[vo];
 const at=/Hard tune|Robot/.test(v)?1:/Soft tune|Pop star/.test(v)?0.5:/Natural|Rapper|Radio/.test(v)?0:0.25;
 return{id:'v'+i,kind:'voice',name:v+' voice in '+ROOM[rm],s:{rev:r1(Math.min(1,rm*0.08+R()*0.1)),echo:r1(/Stadium|Dreamy|Spooky/.test(v)?0.4:R()*0.2),at:at,eq:[r1(-2+R()*2),r1(1+R()*2),r1(1+R()*3)],fx:{type:v==='Telephone'?'telephone':v==='Lo-fi'?'lofi':v==='Robot tune'?'robot':v==='Spooky'?'flanger':'none',wet:0.4,p:0.5}}}}
function get(n){if(n<N.chain)return chain(n);n-=N.chain;if(n<N.master)return master(n);n-=N.master;if(n<N.djfx)return djfx(n);n-=N.djfx;return voice(n)}
function byId(id){const k=id[0],n=+id.slice(1);return k==='c'?chain(n):k==='m'?master(n):k==='d'?djfx(n):voice(n)}
function name(n){return get(n).name}
function search(q,cat,favs,limit){q=(q||'').toLowerCase().split(/\s+/).filter(Boolean);const out=[];let hits=0;
 for(let n=0;n<TOTAL;n++){const p=get(n);if(cat==='fav'){if(!favs[p.id])continue}else if(cat&&p.kind!==cat)continue;const nm=p.name.toLowerCase();if(q.every(w=>nm.includes(w))){hits++;if(out.length<limit)out.push(p)}}
 return{hits,list:out}}
g.CBPresets={TOTAL,N,get,byId,search,FX,PLAT};
})(typeof window!=="undefined"?window:globalThis);
