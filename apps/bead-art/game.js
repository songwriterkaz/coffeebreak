const c=document.getElementById('c');let x=c.getContext('2d');const $=id=>document.getElementById(id);
// ---- music playlist (shuffle, mute, skip, now playing) ----
const music=$('music');let muted=localStorage.hsMuted==='1',musicOK=true,PL=(window.PLAYLIST||[]).slice(),ti=0,bad=0;
for(let i=PL.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[PL[i],PL[j]]=[PL[j],PL[i]]}
function load(){if(!PL.length){musicOK=false;$('np').textContent='No music in playlist';return}const t=PL[ti%PL.length];music.src='assets/music/'+t.file;$('np').textContent='Now playing: '+t.title}
function next(){ti=(ti+1)%Math.max(1,PL.length);load();if(started&&!muted)music.play().catch(()=>{})}
let started=false;load();
music.addEventListener('ended',next);music.addEventListener('playing',()=>bad=0);
music.addEventListener('error',()=>{if(++bad>=PL.length){musicOK=false;$('np').textContent='Music file missing'}else next()});
$('skip').onclick=e=>{e.stopPropagation();started=true;next()};
function startMusic(){started=true;if(musicOK&&!muted&&music.paused)music.play().catch(()=>{})}
$('mute').onclick=e=>{e.stopPropagation();muted=!muted;localStorage.hsMuted=muted?'1':'0';music.muted=muted;$('mute').textContent=muted?'🔇 Muted':'🔊 Music';if(!muted)startMusic()};
music.muted=muted;if(muted)$('mute').textContent='🔇 Muted';
// ---- shared canvas helpers ----
const W=900,H=600;window.HERO_SRC='assets/hero.png';const hero=new Image();hero.src='assets/hero.png';
const BTN={};let t=0;
function pos(e){const r=c.getBoundingClientRect(),p=e.touches?e.touches[0]||e.changedTouches[0]:e;return{x:(p.clientX-r.left)*W/r.width,y:(p.clientY-r.top)*H/r.height}}
function inB(p,b){return b&&p.x>b.x&&p.x<b.x+b.w&&p.y>b.y&&p.y<b.y+b.h}
function rr(X,Y,w,h,r){x.beginPath();x.roundRect(X,Y,w,h,r)}
function button(id,X,Y,w,h,label,fn,o={}){BTN[id]={x:X,y:Y,w,h,fn:o.dis?()=>{}:fn};x.globalAlpha=o.dis?.4:1;x.fillStyle=o.sel?(o.ac||'#e8a0b0'):(o.bg||'#3a1424');rr(X,Y,w,h,10);x.fill();x.strokeStyle=o.ac||'#e8a0b0';x.lineWidth=2;x.stroke();
 x.fillStyle=o.sel?'#1a0a10':(o.fg||'#ffe9c7');x.font='bold '+(o.fs||Math.min(19,h*.42))+'px Georgia';x.textAlign='center';x.textBaseline='middle';x.fillText(label,X+w/2,Y+h/2+1);x.textBaseline='alphabetic';x.globalAlpha=1}
function wrapT(s,X,Y,mw,lh){const w=String(s).split(' ');let l='';for(const z of w){if(x.measureText(l+z).width>mw&&l){x.fillText(l.trim(),X,Y);Y+=lh;l=''}l+=z+' '}x.fillText(l.trim(),X,Y);return Y+lh}
function emo(e,X,Y,sz){x.font=sz+'px serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,X,Y);x.textBaseline='alphabetic'}
function bindInput(o){c.addEventListener('mousedown',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)});
 addEventListener('mousemove',e=>{o.move&&o.move(pos(e))});addEventListener('mouseup',e=>{o.up&&o.up(pos(e))});
 c.addEventListener('touchstart',e=>{e.preventDefault();startMusic();const p=pos(e);for(const k of Object.keys(BTN).reverse())if(inB(p,BTN[k])){BTN[k].fn(p);return}o.down&&o.down(p)},{passive:false});
 c.addEventListener('touchmove',e=>{e.preventDefault();o.move&&o.move(pos(e))},{passive:false});addEventListener('touchend',e=>{o.up&&o.up(pos(e))})}
function startLoop(){let last=performance.now();function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;t+=dt;for(const k in BTN)delete BTN[k];update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop)}
function T(s,X,Y,sz,col,al,f){x.fillStyle=col||'#fff';x.font=(f===undefined?'bold ':f)+sz+'px '+(window.FONT||'Georgia');x.textAlign=al||'left';x.fillText(s,X,Y);x.textAlign='left'}
function ent(){x.fillStyle='rgba(255,233,239,.45)';x.font='11px Georgia';x.textAlign='center';x.fillText('For entertainment only.',W/2,594)}
// ===== Coffeebreak Bead Art =====
const DEMO=!!window.DEMO,SK=DEMO?'beadartDemo':'beadartSave';
const G={state:'title',score:0,level:0};window.G=G;
const PAL=[['White','#f6f6f2'],['Black','#1c1c1f'],['Cherry Red','#d42a2a'],['Tangerine','#f47a1f'],['Sunny Yellow','#f9d71c'],['Leaf Green','#3aa845'],['Sky Blue','#6ec3f0'],['Royal Blue','#2350c4'],['Grape Purple','#7b3fb0'],['Bubblegum Pink','#f48cc0'],['Cocoa Brown','#6b3e22'],['Peach Skin','#f6c9a4'],['Stone Grey','#8d8f94'],['Mint','#9fe3c4'],['Lilac','#c9a8ec'],['Cream','#f6e8c0'],
['Rose','#e85a7a'],['Coral','#ff7f6a'],['Mustard','#d6a11a'],['Lime','#a6dc2e'],['Forest','#1f6b34'],['Teal','#13908f'],['Turquoise','#2fd1d1'],['Navy','#1a2860'],['Plum','#5e2350'],['Magenta','#d0219a'],['Hot Pink','#ff4fa3'],['Blush','#f9c6d3'],['Caramel','#c47d34'],['Tan','#d9b07c'],['Charcoal','#3f4046'],['Silver Grey','#c3c6cc'],['Butter','#fff09a'],['Seafoam','#6fd6ab'],
['Glitter Gold','#e2b53c','g'],['Glitter Silver','#cfd3da','g'],['Glitter Pink','#f07cb8','g'],['Glitter Blue','#4f86e8','g'],['Glitter Purple','#9a5ad8','g'],
['Glow Green','#c8f5a0','w'],['Glow Moon','#eef3d2','w'],['Glow Pink','#ffc2e4','w'],['Glow Blue','#b8e8ff','w'],
['Pearl White','#f2eee6','p'],['Pearl Pink','#f3cfd8','p'],['Pearl Blue','#cfe0f2','p'],['Pearl Lilac','#ddd0f0','p'],['Pearl Gold','#ecd9a8','p']];
const NCOL=DEMO?16:48,CODE='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv';
const SHAPES=DEMO?['Square','Heart']:['Square','Circle','Heart','Star','Hexagon'];
const SIZES=[['Mini',15],['Small',22],['Medium',29],['Large',36]];
const PM={w:0,k:1,r:2,o:3,y:4,g:5,b:6,B:7,p:8,P:9,n:10,s:11,e:12,m:13,l:14,c:15,G:34,Z:39};
const H8=['.xx...xx.','xxxx.xxxx','xxxxxxxxx','xxxxxxxxx','.xxxxxxx.','..xxxxx..','...xxx...','....x....'];
const PATS=[
['Classic Heart','Hearts',H8.map(r=>r.replace(/x/g,'r'))],
['Rainbow Heart','Hearts',H8.map((r,i)=>r.replace(/x/g,'roygbpPP'[i]))],
['Bubblegum Heart','Hearts',['.PP...PP.','PwPP.PPPP','PPPPPPPPP','PPPPPPPPP','.PPPPPPP.','..PPPPP..','...PPP...','....P....']],
['Mended Heart','Hearts',['.rr...rr.','rrrr.rrrr','rrrrrkrrr','rrrkrkrrr','.rrrkrrr.','..rrkrr..','...rrr...','....r....']],
['Heart in Heart','Hearts',['.rr...rr.','rPPr.rPPr','rPPPrPPPr','rPPPPPPPr','.rPPPPPr.','..rPPPr..','...rPr...','....r....']],
['Love Letter','Hearts',['wwwwwwwwwww','wkwwwwwwwkw','wwkwwwwwkww','wwwkwwwkwww','wwwwkrkwwww','wwwwwrwwwww','wwwwwwwwwww']],
['Kitty','Animals',['k.......k','kk.....kk','kkkkkkkkk','kgkkkkkgk','kkkkkkkkk','kkkkPkkkk','.kkkkkkk.','..kkkkk..']],
['Froggy','Animals',['.ww...ww.','gwkg.gwkg','ggggggggg','gg.....gg','ggrrrrrgg','ggggggggg','.ggggggg.']],
['Piglet','Animals',['P.......P','PP.....PP','PPPPPPPPP','PkPPPPPkP','PPP999PPP','PPP9P9PPP','PPP999PPP','.PPPPPPP.'].map(r=>r.replace(/9/g,'r'))],
['Bunny','Animals',['.w...w.','.wP.wP.','.wP.wP.','wwwwwww','wkwwwkw','wwwPwww','wwwwwww','.wwwww.']],
['Puppy','Animals',['nn.....nn','nnsssssnn','nnsksksnn','.nsssssn.','..sskss..','..ssrss..','...sss...']],
['Bear Cub','Animals',['nn.....nn','nnnnnnnnn','nnknnnknn','nnnsssnnn','nnnskSnnn','.nnnnnnn.'].map(r=>r.replace('S','s'))],
['Goldfish','Animals',['...ooo.....','..ooooo..o.','.okooooooo.','ooooooooo..','.ooooooooo.','..ooooo..o.','...ooo.....']],
['Ladybug','Animals',['...kkk...','..kkkkk..','.rrrkrrr.','rkrrkrrkr','rrrrkrrrr','rrkrkrkrr','.rrrkrrr.','..rrkrr..']],
['Bumble Bee','Animals',['..ww.ww..','..wwwww..','.kyykyyk.','kyykyyky.','.kyykyyk.','..kkkkk..']],
['Penguin','Animals',['..kkkkk..','.kkkkkkk.','.kwkwkwk.','.kwwowwk.','kkwwwwwkk','kkwwwwwkk','.kwwwwwk.','..oo.oo..']],
['Owl','Animals',['n.......n','nnnnnnnnn','nwwnnnwwn','nwknnnkwn','nnnnonnnn','nccccccn.','nccccccn.','.nnnnnn..']],
['Turtle','Animals',['....ss.....','...ssss....','.gGgGgGg...','gGgGgGgGgs.','.gGgGgGgss.','..s.....s..'].map(r=>r.replace(/G/g,'5'===''?'':'m'))],
['Butterfly','Animals',['pp.....pp','ppl.k.lpp','plll.k.llp','plllkkllp','.lp.k.pl.','.pp.k.pp.']],
['Snail','Animals',['......nnn..','k.k..nccnn.','sks.nccncn.','sss.nnccnn.','ssssssnnnsss']],
['Strawberry','Food',['...g.g...','..ggggg..','.rrrrrrr.','rrwrrrwrr','rrrrrrrrr','.rrwrrrr.','..rrrrr..','...rrr...']],
['Ice Cream','Food',['..PPP..','.PPPPP.','PPrPPPP','PPPPPPP','.ccccc.','..ncn..','..cnc..','...n...']],
['Donut','Food',['..nnnnn..','.PPPPPPP.','PPyPPPbPP','PPP...PPP','PbP...PyP','.PPPPPPP.','..nnnnn..']],
['Avocado','Food',['...ggg...','..gmmmg..','.gmmmmmg.','.gmnnnmg.','gmmnnnmmg','gmmmmmmmg','.ggggggg.']],
['Watermelon','Food',['rrrrrrrrrrr','rkrrrkrrrkr','.rrrrrrrrr.','..ggggggg..','...ggggg...']],
['Cupcake','Food',['....r....','..PPPPP..','.PPPPPPP.','PPPPPPPPP','.nnnnnnn.','.ncncncn.','..nnnnn..']],
['Slice of Pizza','Food',['nnnnnnnnn','yyryyyryy','.yyyyyyy.','.yryyyyy.','..yyyry..','...yyy...','....y....']],
['Hot Coffee','Food',['..e..e...','...e..e..','wwwwwww..','wnnnnnwww','wwwwwww.w','wwwwwwwww','.wwwww...']],
['Cherries','Food',['....g.....','...gg.....','..g..g....','.g....g...','rr...rr...','rrr..rrr..','.r....r...']],
['Sunny Egg','Food',['..www..','.wwwww.','wwyyyww','wwyyyww','wwwyyww','.wwwww.','..www..']],
['Smiley','Fun',['..yyyyy..','.yyyyyyy.','yykyyykyy','yyyyyyyyy','ykyyyyyky','yykkkkkyy','.yyyyyyy.','..yyyyy..']],
['Star','Fun',['....y....','...yyy...','yyyyyyyyy','.yyyyyyy.','..yyyyy..','.yyy.yyy.','yy.....yy']],
['Rainbow','Fun',['..rrrrr..','.rooooor.','royyyyyor','oyg...gyo','yg.....gy','g.......g']],
['Mushroom','Fun',['..rrrrr..','.rrwrrrr.','rrrrrwrrr','rwrrrrrwr','..cwwwc..','..cwwwc..','..ccccc..']],
['Flower','Fun',['.PP.PP.','PPPPPPP','.PPyPP.','PPPPPPP','.PP.PP.','...g...','.ggg...','...g...']],
['Rocket','Fun',['...e...','..eee..','..ebe..','..eee..','.reeer.','rreeerr','..oyo..','...o...']],
['Ghostie','Fun',['..www..','.wwwww.','wwkwkww','wwwwwww','wwwkwww','wwwwwww','w.w.w.w']],
['Rainbow Sparkle','Fun',['G...r...G','..roooor.','.royyyyor','roy.G.yor','oy.....yo']],
['Moon & Star','Fun',['..ZZZ...y','.ZZ.....','ZZ......y','ZZ...y...','ZZ.......','.ZZ.....','..ZZZ...']],
['Diamond','Fun',['...bbb...','..bwbbb..','.bbbbbbb.','bbbbbbbbb','.bbbbbbb.','..bbbbb..','...bbb...','....b....']]];
const NPAT=DEMO?8:40;
// ---- state ----
let S={shape:0,size:0,cells:[],fused:0,name:''},mask=[],N=15,col=2,tool='place',mirror=0,zoom=1,panX=0,panY=0,undo=[],ghost=null,dark=false;
let gal=[];try{gal=JSON.parse(localStorage.getItem(SK)||'[]')}catch(e){}
const saveGal=()=>{try{localStorage.setItem(SK,JSON.stringify(gal))}catch(e){toast('Storage full, delete some designs')}};
let msg='',msgT=0;function toast(m){msg=m;msgT=3}
function inMask(i,j,sh,n){const R=n/2,dx=i-(n-1)/2,dy=j-(n-1)/2;switch(SHAPES[sh]){case'Circle':return dx*dx+dy*dy<=R*R*.98;
 case'Heart':{const u=dx/R*1.25,v=-dy/R*1.25+.3,a=u*u+v*v-1;return a*a*a-u*u*v*v*v<=0}
 case'Star':{const r=Math.hypot(dx,dy),a=Math.atan2(dx,-dy);return r<=R*(.42+.58*Math.pow(Math.abs(Math.cos(2.5*a)),3))||r<R*.45}
 case'Hexagon':{const ax=Math.abs(dx)/R,ay=Math.abs(dy)/R;return ax<=.98&&ay<=.866&&.866*ax+.5*ay<=.866}}return true}
function newBoard(keep){N=SIZES[S.size][1];mask=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++)mask.push(inMask(i,j,S.shape,N));if(!keep)S.cells=new Array(N*N).fill(-1);S.fused=0;zoom=1;panX=panY=0;undo=[];ghost=null}
newBoard();
// ---- sound ----
let AC=null;function snd(f,d,type,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.value=f;g.gain.setValueAtTime(v||.12,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function click(){snd(1800+Math.random()*900,.035,'square',.06);snd(420+Math.random()*80,.05,'sine',.1)}
function pop(){snd(900,.06,'sine',.08)}
// ---- geometry ----
const BX=10,BY=56,BW=600,BH=536;
function cs(){return Math.min(BW,BH)/N*zoom}
function org(){const s=cs();return{ox:BX+BW/2-N*s/2+panX,oy:BY+BH/2-N*s/2+panY,s}}
function cellAt(p){const{ox,oy,s}=org();const i=Math.floor((p.x-ox)/s),j=Math.floor((p.y-oy)/s);if(p.x<BX||p.x>BX+BW||p.y<BY||p.y>BY+BH||i<0||j<0||i>=N||j>=N)return -1;return j*N+i}
function pushU(){undo.push(S.cells.slice());if(undo.length>40)undo.shift()}
function mirrorsOf(k){const i=k%N,j=k/N|0,L=[k];if(mirror&1)L.push(j*N+(N-1-i));if(mirror&2)L.push((N-1-j)*N+i);if(mirror==3)L.push((N-1-j)*N+(N-1-i));return L}
function setC(k,v){let ch=false;for(const q of mirrorsOf(k))if(mask[q]&&S.cells[q]!==v){S.cells[q]=v;ch=true}if(ch){S.fused=0;v<0?pop():click()}}
function fill(k){if(!mask[k])return;const from=S.cells[k];if(from===col)return;const st=[k],seen=new Set();while(st.length){const q=st.pop();if(seen.has(q)||!mask[q]||S.cells[q]!==from)continue;seen.add(q);S.cells[q]=col;const i=q%N,j=q/N|0;if(i>0)st.push(q-1);if(i<N-1)st.push(q+1);if(j>0)st.push(q-N);if(j<N-1)st.push(q+N)}S.fused=0;click();setTimeout(click,40);setTimeout(click,80)}
function lineCells(a,b){const L=[];let x0=a%N,y0=a/N|0,x1=b%N,y1=b/N|0;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let s=0;s<=n;s++)L.push(Math.round(y0+(y1-y0)*s/n)*N+Math.round(x0+(x1-x0)*s/n));return L}
// ---- bead drawing ----
function bead(cx,cy,r,ci,f,dk){const P=PAL[ci],t=P[2];let c0=P[1];if(t==='w'&&dk){x.save();x.shadowColor=c0;x.shadowBlur=r*2.2}
 x.fillStyle=(t==='w'&&!dk)?c0:c0;if(f>0){rr(cx-r*(1+.12*f),cy-r*(1+.12*f),2*r*(1+.12*f),2*r*(1+.12*f),r*(1-.55*f));x.fill()}else{x.beginPath();x.arc(cx,cy,r*.92,0,7);x.fill()}
 if(t==='w'&&dk)x.restore();
 if(t==='p'){const g=x.createLinearGradient(cx-r,cy-r,cx+r,cy+r);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(180,200,255,.35)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*.9,0,7);x.fill()}
 if(t==='g'){x.fillStyle='rgba(255,255,255,.9)';for(let q=0;q<3;q++){const a=(ci*7+q*2.1+cx*.13+cy*.07)%6.28,d=r*.55,tw=.5+.5*Math.sin(t0*5+q+cx);x.globalAlpha=tw;x.fillRect(cx+Math.cos(a)*d-1,cy+Math.sin(a)*d-1,2,2)}x.globalAlpha=1}
 if(f<1&&r>3){x.fillStyle=dk?'#0a0a14':'rgba(40,20,30,.85)';x.beginPath();x.arc(cx,cy,r*.38*(1-f),0,7);x.fill()}
 if(r>4&&f<1){x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=Math.max(1,r*.12);x.beginPath();x.arc(cx,cy,r*.68,3.6,4.8);x.stroke()}}
let t0=0;
function drawBoard(ox,oy,s,cells,f,opt={}){const dk=opt.dark;
 if(!opt.noPeg){x.fillStyle=dk?'#141428':'rgba(255,255,255,.55)';for(let k=0;k<N*N;k++)if(mask[k]){const i=k%N,j=k/N|0;x.beginPath();x.arc(ox+(i+.5)*s,oy+(j+.5)*s,s*.48,0,7);x.fill()}
  x.fillStyle=dk?'#2a2a48':'#c9b8c8';for(let k=0;k<N*N;k++)if(mask[k]&&cells[k]<0){const i=k%N,j=k/N|0;x.beginPath();x.arc(ox+(i+.5)*s,oy+(j+.5)*s,Math.max(1,s*.13),0,7);x.fill()}}
 if(opt.ghost)for(let k=0;k<N*N;k++)if(opt.ghost[k]>=0&&cells[k]<0){const i=k%N,j=k/N|0;x.globalAlpha=.3;x.fillStyle=PAL[opt.ghost[k]][1];x.beginPath();x.arc(ox+(i+.5)*s,oy+(j+.5)*s,s*.4,0,7);x.fill();x.globalAlpha=1}
 for(let k=0;k<N*N;k++)if(cells[k]>=0){const i=k%N,j=k/N|0;bead(ox+(i+.5)*s,oy+(j+.5)*s,s/2,cells[k],f,dk)}}
function bbox(cells){let a=N,b=N,c=-1,d=-1;for(let k=0;k<N*N;k++)if(cells[k]>=0){const i=k%N,j=k/N|0;a=Math.min(a,i);b=Math.min(b,j);c=Math.max(c,i);d=Math.max(d,j)}return c<0?null:{a,b,c,d}}
function counts(cells){const m={};for(const v of cells)if(v>=0)m[v]=(m[v]||0)+1;return Object.entries(m).map(([k,v])=>[+k,v]).sort((p,q)=>q[1]-p[1])}
// ---- render to image ----
function renderImg(sz,f,bg){const bb=bbox(S.cells)||{a:0,b:0,c:N-1,d:N-1},w=bb.c-bb.a+1,h=bb.d-bb.b+1,cv=document.createElement('canvas');cv.width=w*sz+sz;cv.height=h*sz+sz;const ox_=x;x=cv.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,cv.width,cv.height)}
 const cl=S.cells.slice();drawBoard(sz/2-bb.a*sz,sz/2-bb.b*sz,sz,cl,f,{noPeg:true});x=ox_;return cv}
function download(cv,name){const a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=name;document.body.appendChild(a);a.click();a.remove()}
function savePNG(){if(!bbox(S.cells))return toast('Place some beads first');download(renderImg(32,S.fused,null),'coffeebreak-bead-art.png');toast('PNG saved')}
function printGrid(){if(!bbox(S.cells))return toast('Place some beads first');const cn=counts(S.cells);let h='<html><head><title>Bead pattern</title><style>body{font-family:Arial;margin:16px}table{border-collapse:collapse}td{width:18px;height:18px;border:1px solid #999;font-size:9px;text-align:center}td.o{border:none}</style></head><body><h2>Coffeebreak Bead Art: '+SHAPES[S.shape]+' '+SIZES[S.size][0]+' ('+N+'×'+N+')</h2><table>';
 for(let j=0;j<N;j++){h+='<tr>';for(let i=0;i<N;i++){const k=j*N+i,v=S.cells[k];h+=mask[k]?'<td style="background:'+(v>=0?PAL[v][1]:'#fff')+'">'+(v>=0?CODE[v]:'')+'</td>':'<td class="o"></td>'}h+='</tr>'}
 h+='</table><h3>Shopping list</h3><ul>'+cn.map(([k,v])=>'<li><b>'+CODE[k]+'</b> '+PAL[k][0]+': '+v+' beads</li>').join('')+'</ul><p>Total: '+cn.reduce((a,b)=>a+b[1],0)+' beads</p></body></html>';
 const fr=document.createElement('iframe');fr.style.cssText='position:fixed;width:0;height:0;border:0';document.body.appendChild(fr);fr.contentDocument.open();fr.contentDocument.write(h);fr.contentDocument.close();setTimeout(()=>{try{fr.contentWindow.print()}catch(e){}setTimeout(()=>fr.remove(),60000)},300);toast('Opening print dialog')}
// ---- gallery ----
function enc(){return S.cells.map(v=>v<0?'.':CODE[v]).join('')}
function saveToGal(){if(!bbox(S.cells))return toast('Place some beads first');if(DEMO&&gal.length>=3)return window.demoEnd&&window.demoEnd('The demo gallery holds 3 designs. The full game has unlimited gallery saves, all 5 boards, 48 colours with glitter, glow and pearl, and Photo to Beads.');
 gal.unshift({n:'Design '+(gal.length+1),sh:S.shape,sz:S.size,c:enc(),f:S.fused,d:Date.now()});saveGal();G.score=gal.length;toast('Saved to your gallery')}
function loadGal(g){S.shape=Math.min(g.sh,SHAPES.length-1);S.size=g.sz;newBoard();S.cells=[...g.c].map(ch=>ch==='.'?-1:CODE.indexOf(ch));S.fused=g.f||0;G.state='edit'}
let galPage=0;
// ---- patterns ----
function patCells(p){const rows=p[2],h=rows.length,w=Math.max(...rows.map(r=>r.length));if(w>N||h>N)return null;const out=new Array(N*N).fill(-1),x0=(N-w)>>1,y0=(N-h)>>1;rows.forEach((r,j)=>[...r].forEach((ch,i)=>{const k=(y0+j)*N+x0+i;if(ch in PM&&mask[k])out[k]=PM[ch]<NCOL?PM[ch]:PM[ch]%16}));return out}
let patPage=0;
// ---- photo ----
let photoRes=null;const fileIn=document.createElement('input');fileIn.type='file';fileIn.accept='image/*';fileIn.style.display='none';document.body.appendChild(fileIn);
fileIn.onchange=()=>{const f=fileIn.files[0];if(!f)return;const im=new Image();im.onload=()=>{photoToBeads(im);URL.revokeObjectURL(im.src)};im.src=URL.createObjectURL(f);fileIn.value=''};
function hexRGB(h){return[1,3,5].map(i=>parseInt(h.substr(i,2),16))}const RGB=PAL.map(p=>hexRGB(p[1]));
function nearest(r,g,b){let best=0,bd=1e9;for(let k=0;k<NCOL;k++){if(PAL[k][2]==='w'||PAL[k][2]==='g')continue;const q=RGB[k],rm=(r+q[0])/2,dr=r-q[0],dg=g-q[1],db=b-q[2],d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;best=k}}return best}
function photoToBeads(im){pushU();const cv=document.createElement('canvas');cv.width=cv.height=N;const cx=cv.getContext('2d');const sc=Math.max(N/im.width,N/im.height),w=im.width*sc,h=im.height*sc;cx.drawImage(im,(N-w)/2,(N-h)/2,w,h);const d=cx.getImageData(0,0,N,N).data;
 for(let k=0;k<N*N;k++){if(!mask[k]){S.cells[k]=-1;continue}const a=d[k*4+3];S.cells[k]=a<60?-1:nearest(d[k*4],d[k*4+1],d[k*4+2])}S.fused=0;photoRes=counts(S.cells);G.state='shop';click();setTimeout(click,60)}
window.BA={photoToBeads,S,get N(){return N},counts};
// ---- iron / 3d / mock ----
let ironP=0,yaw=.5,pitch=.9,drag3=null,mockMode=0;
// ---- input ----
let down=false,lineA=-1,lineB=-1,panS=null;
bindInput({down(p){if(G.state!=='edit'){if(G.state==='tilt')drag3={x:p.x,y:p.y,yaw,pitch};return}const k=cellAt(p);if(tool==='pan'||k<0){if(p.x<BX+BW)panS={x:p.x,y:p.y,px:panX,py:panY};return}
 down=true;pushU();if(tool==='place')setC(k,col);else if(tool==='erase')setC(k,-1);else if(tool==='fill'){fill(k);down=false}else if(tool==='line'){lineA=lineB=k}},
 move(p){if(drag3){yaw=drag3.yaw+(p.x-drag3.x)*.01;pitch=Math.max(.15,Math.min(1.45,drag3.pitch+(p.y-drag3.y)*.01));return}if(panS){panX=panS.px+p.x-panS.x;panY=panS.py+p.y-panS.y;return}if(!down)return;const k=cellAt(p);if(k<0)return;if(tool==='place')setC(k,col);else if(tool==='erase')setC(k,-1);else if(tool==='line')lineB=k},
 up(){drag3=null;panS=null;if(down&&tool==='line'&&lineA>=0){lineCells(lineA,lineB).forEach((k,n)=>setTimeout(()=>setC(k,col),n*18))}down=false;lineA=lineB=-1}});
c.addEventListener('wheel',e=>{if(G.state!=='edit')return;e.preventDefault();zoom=Math.max(.6,Math.min(4,zoom*(e.deltaY<0?1.15:1/1.15)))},{passive:false});
addEventListener('keydown',e=>{if(G.state!=='edit')return;if((e.ctrlKey||e.metaKey)&&e.key==='z'&&undo.length){S.cells=undo.pop()}});
function lock(m){window.demoEnd&&window.demoEnd(m||'This is in the full game: all 5 board shapes, 48 colours including glitter, glow and pearl, Photo to Beads with a shopping list, all 40 patterns and unlimited gallery saves.')}
// ---- update/draw ----
function update(dt){t0+=dt;if(msgT>0)msgT-=dt;if(G.state==='iron'&&ironP<1){ironP=Math.min(1,ironP+dt/3);if(Math.random()<.3)snd(120+Math.random()*60,.08,'sawtooth',.02);if(ironP>=1){S.fused=1;snd(660,.2,'sine',.1);setTimeout(()=>snd(990,.3,'sine',.1),150)}}if(G.state==='tilt'&&!drag3)yaw+=dt*.25}
function bg(){const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,dark?'#0b0b1a':'#fde4ec');g.addColorStop(1,dark?'#1a1030':'#e9d8f6');x.fillStyle=g;x.fillRect(0,0,W,H)}
function topBar(title){x.fillStyle=dark?'rgba(255,255,255,.06)':'rgba(255,255,255,.6)';x.fillRect(0,0,W,48);T(title,16,32,22,dark?'#ffd6ec':'#7a2a5a');}
const TXT=()=>dark?'#ffe9f4':'#4a1a3a';
const OPT={bg:'#ffffff',fg:'#5a1a44',ac:'#d0408a'};
function B(id,X,Y,w,h,l,fn,o){button(id,X,Y,w,h,l,fn,Object.assign({},OPT,o||{}))}
function draw(){bg();const st=G.state;
 if(st==='title'){for(let k=0;k<160;k++){const i=k%20,j=k/20|0;bead(40+i*43+(j%2)*20,80+j*58+Math.sin(t0+k)*3,15,(k*7)%NCOL,0,false)}
  x.fillStyle='rgba(255,255,255,.82)';rr(170,150,560,300,26);x.fill();T('🟣 Coffeebreak Bead Art',W/2,225,44,'#7a2a5a','center');T('Click tiny fuse beads onto pegboards, iron them, keep them forever.',W/2,268,17,'#5a2a4a','center','');
  B('go',300,300,300,60,'Start beading ✨',()=>{G.state='edit';click()},{fs:24});B('gl',300,375,140,44,'🖼️ Gallery',()=>G.state='gallery');B('pt',460,375,140,44,'📖 Patterns',()=>G.state='patterns');if(hero.complete&&hero.naturalWidth)x.drawImage(hero,30,470,120,120*hero.naturalHeight/hero.naturalWidth);ent();return}
 if(st==='edit'){topBar('Coffeebreak Bead Art');T(SHAPES[S.shape]+' · '+SIZES[S.size][0]+' '+N+'×'+N+' · '+S.cells.filter(v=>v>=0).length+' beads'+(S.fused?' · ironed':''),300,31,14,TXT(),'left','');
  B('home',780,8,100,34,'🏠 Home',()=>G.state='title',{fs:14});B('dk',670,8,100,34,dark?'☀️ Light':'🌙 Glow',()=>dark=!dark,{fs:14});
  x.fillStyle=dark?'rgba(255,255,255,.04)':'rgba(255,255,255,.35)';rr(BX,BY,BW,BH,16);x.fill();x.save();rr(BX,BY,BW,BH,16);x.clip();const{ox,oy,s}=org();drawBoard(ox,oy,s,S.cells,S.fused,{ghost,dark});
  if(lineA>=0){x.globalAlpha=.55;for(const k of lineCells(lineA,lineB)){const i=k%N,j=k/N|0;if(mask[k])bead(ox+(i+.5)*s,oy+(j+.5)*s,s/2,col,0,dark)}x.globalAlpha=1}
  if(mirror){x.strokeStyle='rgba(208,64,138,.5)';x.setLineDash([6,6]);x.lineWidth=2;x.beginPath();if(mirror&1){x.moveTo(ox+N*s/2,oy);x.lineTo(ox+N*s/2,oy+N*s)}if(mirror&2){x.moveTo(ox,oy+N*s/2);x.lineTo(ox+N*s,oy+N*s/2)}x.stroke();x.setLineDash([])}x.restore();
  const PX=620;[['place','✋ Place'],['fill','🪣 Fill'],['erase','🧽 Erase'],['line','📏 Line']].forEach(([k,l],n)=>B('t'+k,PX+n*68,56,64,32,l,()=>tool=k,{sel:tool===k,fs:12}));
  B('mir',PX,94,96,32,['Mirror off','Mirror ↔','Mirror ↕','Mirror ✚'][mirror],()=>mirror=(mirror+1)%4,{sel:mirror>0,fs:12});B('pan',PX+100,94,58,32,'✥ Pan',()=>tool='pan',{sel:tool==='pan',fs:12});
  B('zo',PX+162,94,34,32,'−',()=>zoom=Math.max(.6,zoom/1.25));B('zi',PX+200,94,34,32,'+',()=>zoom=Math.min(4,zoom*1.25));B('z0',PX+238,94,32,32,'⟲',()=>{zoom=1;panX=panY=0},{fs:13});
  for(let k=0;k<48;k++){const i=k%8,j=k/8|0,X=PX+i*34,Y=134+j*32;if(k<NCOL){bead(X+16,Y+15,14,k,0,dark);BTN['c'+k]={x:X,y:Y,w:32,h:30,fn:()=>{col=k;if(tool==='erase'||tool==='pan')tool='place';click()}};if(k===col){x.strokeStyle='#d0408a';x.lineWidth=3;x.beginPath();x.arc(X+16,Y+15,16,0,7);x.stroke()}}else{x.globalAlpha=.25;bead(X+16,Y+15,14,k,0,dark);x.globalAlpha=1;T('🔒',X+16,Y+21,12,'#000','center','');BTN['c'+k]={x:X,y:Y,w:32,h:30,fn:()=>lock()}}}
  const tp={g:' ✨ glitter',w:' 🌙 glow-in-the-dark',p:' 🫧 pearl'}[PAL[col][2]]||'';T(PAL[col][0]+tp,PX,342,14,TXT(),'left','');
  B('shp',PX,352,130,32,'⬡ '+SHAPES[S.shape],()=>{if(DEMO&&S.shape===1&&false)return;S.shape=(S.shape+1)%SHAPES.length;newBoard();toast(DEMO?'Demo has Square and Heart boards':'New '+SHAPES[S.shape]+' board')},{fs:13});
  B('siz',PX+134,352,86,32,SIZES[S.size][0],()=>{S.size=(S.size+1)%4;newBoard()},{fs:13});B('clr',PX+224,352,46,32,'🗑️',()=>{pushU();S.cells=S.cells.map(()=>-1);S.fused=0;ghost=null;pop()},{fs:14});
  B('pat',PX,390,88,34,'📖 Patterns',()=>G.state='patterns',{fs:12});B('pho',PX+91,390,88,34,'📷 Photo'+(DEMO?' 🔒':''),()=>{if(DEMO)return lock('Photo to Beads is in the full game. It turns any picture into a bead pattern using the bead colours and gives you a shopping list.');fileIn.click()},{fs:12});B('iro',PX+182,390,88,34,'♨️ Iron it',()=>{if(!bbox(S.cells))return toast('Place some beads first');ironP=0;S.fused=0;G.state='iron'},{fs:12});
  B('t3d',PX,428,88,34,'🧊 3D tilt',()=>G.state='tilt',{fs:12});B('moc',PX+91,428,88,34,'🔑 Mockups',()=>{if(!bbox(S.cells))return toast('Place some beads first');G.state='mock'},{fs:12});B('gal',PX+182,428,88,34,'🖼️ Gallery',()=>G.state='gallery',{fs:12});
  B('png',PX,466,88,34,'💾 PNG',savePNG,{fs:12});B('prt',PX+91,466,88,34,'🖨️ Print',printGrid,{fs:12});B('sav',PX+182,466,88,34,'⭐ Save',saveToGal,{fs:12});
  B('und',PX,504,88,34,'↶ Undo',()=>{if(undo.length){S.cells=undo.pop();pop()}},{fs:12});B('shop',PX+91,504,88,34,'🛒 Count',()=>{photoRes=counts(S.cells);G.state='shop'},{fs:12});B('gh',PX+182,504,88,34,'👻 Guide',()=>{if(!ghost)return toast('Pick a pattern to copy first');pushU();ghost.forEach((v,k)=>{if(v>=0)S.cells[k]=v});ghost=null;click()},{fs:12,dis:!ghost});
  T('Tip: drag to place many, wheel to zoom.',PX,560,12,TXT(),'left','');}
 if(st==='patterns'){topBar('📖 Patterns to copy');B('bk',780,8,100,34,'← Board',()=>G.state='edit',{fs:14});const per=10,pg=Math.ceil(40/per);
  for(let n=0;n<per;n++){const id=patPage*per+n,p=PATS[id];if(!p)break;const X=30+(n%5)*172,Y=70+(n/5|0)*250,lk=id>=NPAT;x.fillStyle='rgba(255,255,255,.7)';rr(X,Y,160,232,14);x.fill();const rows=p[2],w=Math.max(...rows.map(r=>r.length)),s=Math.min(140/w,140/rows.length);
   if(lk)x.globalAlpha=.35;rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch in PM){const ci=PM[ch];bead(X+80-w*s/2+(i+.5)*s,Y+80-rows.length*s/2+(j+.5)*s,s/2,DEMO&&ci>=16?ci%16:ci,0,false)}}));x.globalAlpha=1;
   T(p[0],X+80,Y+176,15,'#5a1a44','center');T(p[1],X+80,Y+194,12,'#8a5a7a','center','');B('pp'+n,X+20,Y+200,120,26,lk?'🔒 Full game':'Copy it',()=>{if(lk)return lock();const g=patCells(p);if(!g){S.size=Math.min(3,S.size+1);newBoard()}ghost=patCells(p);S.fused=0;G.state='edit';toast('Faint beads show the pattern. Place over them or tap 👻 Guide')},{fs:13})}
  B('pv',300,575-20,120,34,'◀ Prev',()=>patPage=(patPage+pg-1)%pg);T((patPage+1)+' / '+pg,W/2,578,16,TXT(),'center');B('nx',480,555,120,34,'Next ▶',()=>patPage=(patPage+1)%pg)}
 if(st==='shop'){topBar(photoRes&&photoRes.length?'🛒 Bead shopping list':'🛒 Shopping list');B('bk',780,8,100,34,'← Board',()=>G.state='edit',{fs:14});const L=photoRes||[];let tot=L.reduce((a,b)=>a+b[1],0);
  T(tot+' beads in '+L.length+' colours',30,80,18,TXT());L.slice(0,36).forEach(([k,v],n)=>{const X=30+(n/12|0)*290,Y=110+(n%12)*38;bead(X+14,Y+12,13,k,0,dark);T(PAL[k][0],X+36,Y+18,15,TXT(),'left','');T(v+'',X+250,Y+18,15,TXT(),'right')});if(!L.length)T('No beads yet.',30,130,16,TXT())}
 if(st==='iron'){topBar('♨️ Iron it');const{s}=org();const ss=Math.min(BW,BH)/N,ox=BX+BW/2-N*ss/2+150,oy=BY+BH/2-N*ss/2;x.fillStyle='#fff7e8';rr(ox-10,oy-10,N*ss+20,N*ss+20,10);x.fill();drawBoard(ox,oy,ss,S.cells,ironP<1?Math.max(0,ironP*1.1-.1):1,{noPeg:true});
  x.fillStyle='rgba(255,240,200,.5)';x.fillRect(ox-10,oy-10,N*ss+20,N*ss+20);
  if(ironP<1){const ix=ox+ironP*N*ss,iy=oy+N*ss/2+Math.sin(t0*8)*N*ss*.35;x.fillStyle='#d8dde6';x.beginPath();x.moveTo(ix-60,iy+30);x.lineTo(ix+70,iy+30);x.quadraticCurveTo(ix+70,iy-30,ix-10,iy-34);x.lineTo(ix-60,iy-10);x.closePath();x.fill();x.fillStyle='#d0408a';rr(ix-40,iy-60,80,22,10);x.fill();T('〰️',ix,iy-70,18,'#c88','center');T('Ironing… '+Math.round(ironP*100)+'%',ox+N*ss/2,oy+N*ss+40,18,TXT(),'center')}
  else{T('Fused! ✨',ox+N*ss/2,oy+N*ss+40,22,TXT(),'center')}
  T('Unfused',130,80,16,TXT(),'center');const ms=Math.min(220/N,9);drawBoard(130-N*ms/2,95,ms,S.cells,0,{noPeg:true});T('Fused',130,340,16,TXT(),'center');drawBoard(130-N*ms/2,355,ms,S.cells,ironP>=1?1:0,{noPeg:true});
  B('bk',780,8,100,34,'← Board',()=>G.state='edit',{fs:14});B('ag',660,8,110,34,'↻ Again',()=>{ironP=0;S.fused=0},{fs:14})}
 if(st==='tilt'){topBar('🧊 3D tilt view (drag to turn)');B('bk',780,8,100,34,'← Board',()=>G.state='edit',{fs:14});const L=[],s=Math.min(460/N,24),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),hgt=s*.6*Math.sin(pitch);
  for(let k=0;k<N*N;k++)if(S.cells[k]>=0){const u=(k%N-(N-1)/2)*s,v=((k/N|0)-(N-1)/2)*s,rx=u*cy-v*sy,ry=(u*sy+v*cy)*cp;L.push([rx,ry,k])}L.sort((a,b)=>a[1]-b[1]);
  for(const[rx,ry,k]of L){const X=W/2+rx,Y=H/2+20+ry,c0=PAL[S.cells[k]][1];x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(X+4,Y+hgt+6,s*.5,s*.5*cp,0,0,7);x.fill();x.fillStyle=c0;x.fillRect(X-s*.48,Y,s*.96,hgt);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(X-s*.48,Y,s*.96,hgt);x.fillStyle=c0;x.beginPath();x.ellipse(X,Y+hgt,s*.48,s*.48*cp,0,0,7);x.fill();x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(X,Y+hgt,s*.48,s*.48*cp,0,0,7);x.fill();
   x.fillStyle=c0;x.beginPath();x.ellipse(X,Y,s*(S.fused?.56:.48),s*(S.fused?.56:.48)*cp,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.ellipse(X-s*.12,Y-s*.1*cp,s*.18,s*.1*cp,0,0,7);x.fill();if(!S.fused){x.fillStyle='rgba(30,10,20,.75)';x.beginPath();x.ellipse(X,Y,s*.18,s*.18*cp,0,0,7);x.fill()}}
  if(!L.length)T('Place some beads first',W/2,H/2,20,TXT(),'center')}
 if(st==='mock'){topBar('🔑 Keychain & magnet mockups');B('bk',780,8,100,34,'← Board',()=>G.state='edit',{fs:14});B('km',520,8,120,34,mockMode?'🔑 Keychain':'🧲 Magnet',()=>mockMode^=1,{fs:14});B('dl',650,8,120,34,'💾 Download',()=>download(c,'bead-mockup.png'),{fs:14});
  const im=renderImg(16,1,null),sc=Math.min(320/im.width,320/im.height),w=im.width*sc,h=im.height*sc,X=W/2-w/2,Y=mockMode?150:180;
  if(mockMode){x.fillStyle='#eef1f4';x.fillRect(0,48,W,H);x.fillStyle='#dde2e8';for(let i=0;i<W;i+=6)x.fillRect(i,48,1,H);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(W/2+10,Y+h+18,w*.45,10,0,0,7);x.fill();x.save();x.shadowColor='rgba(0,0,0,.35)';x.shadowBlur=18;x.shadowOffsetY=8;x.drawImage(im,X,Y,w,h);x.restore();T('🧲 Fridge magnet',W/2,560,20,'#555','center')}
  else{x.fillStyle='#f6efe6';x.fillRect(0,48,W,H);const sw=Math.sin(t0*1.5)*.06;x.save();x.translate(W/2,90);x.rotate(sw);x.strokeStyle='#b8bcc4';x.lineWidth=7;x.beginPath();x.arc(0,0,34,0,7);x.stroke();x.strokeStyle='#9aa0a8';x.lineWidth=4;for(let i=0;i<3;i++){x.beginPath();x.ellipse(0,42+i*16,5,9,i%2?1.57:0,0,7);x.stroke()}x.lineWidth=3;x.beginPath();x.arc(0,Y-90-6,6,0,7);x.stroke();x.save();x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=14;x.shadowOffsetY=6;x.drawImage(im,-w/2,Y-90,w,h);x.restore();x.restore();T('🔑 Keychain charm',W/2,560,20,'#555','center')}}
 if(st==='gallery'){topBar('🖼️ My gallery (saved on this device)');B('bk',780,8,100,34,'← Back',()=>G.state=bbox(S.cells)||true?'edit':'title',{fs:14});const per=8,pg=Math.max(1,Math.ceil(gal.length/per));galPage=Math.min(galPage,pg-1);
  if(!gal.length)T('No saved designs yet. Tap ⭐ Save on the board.',W/2,300,18,TXT(),'center');
  gal.slice(galPage*per,galPage*per+per).forEach((g,n)=>{const X=40+(n%4)*212,Y=70+(n/4|0)*240;x.fillStyle='rgba(255,255,255,.75)';rr(X,Y,196,224,14);x.fill();const gn=SIZES[g.sz][1],s=150/gn;for(let k=0;k<g.c.length;k++){const ch=g.c[k];if(ch!=='.')bead(X+23+(k%gn+.5)*s,Y+10+((k/gn|0)+.5)*s,s/2,CODE.indexOf(ch),g.f||0,false)}
   T(g.n,X+98,Y+178,14,'#5a1a44','center');B('go'+n,X+12,Y+188,110,28,'Open',()=>{loadGal(g);click()},{fs:13});B('de'+n,X+130,Y+188,54,28,'🗑️',()=>{gal.splice(gal.indexOf(g),1);saveGal();pop()},{fs:13})});
  if(pg>1){B('pv',300,555,120,34,'◀ Prev',()=>galPage=(galPage+pg-1)%pg);T((galPage+1)+' / '+pg,W/2,578,16,TXT(),'center');B('nx',480,555,120,34,'Next ▶',()=>galPage=(galPage+1)%pg)}}
 if(msgT>0){x.globalAlpha=Math.min(1,msgT);x.fillStyle='rgba(60,20,50,.9)';x.font='15px Georgia';const w=x.measureText(msg).width+30;rr(W/2-w/2-150*(G.state==='edit'),540,w,34,17);x.fill();T(msg,W/2-150*(G.state==='edit'),562,15,'#fff','center','');x.globalAlpha=1}}
startLoop();
