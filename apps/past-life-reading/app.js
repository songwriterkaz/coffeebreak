const $=id=>document.getElementById(id),ans=Array(Q.length).fill(-1);
$('qs').innerHTML=Q.map((q,i)=>`<div class="q"><b>${i+1}. ${q[0]}</b><div class="opts">${q[1].map((o,j)=>`<button data-q="${i}" data-o="${j}">${o[0]}</button>`).join('')}</div></div>`).join('');
document.querySelectorAll('.opts button').forEach(b=>b.onclick=()=>{const i=+b.dataset.q;ans[i]=+b.dataset.o;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));$('prog').firstChild.style.width=ans.filter(a=>a>=0).length/Q.length*100+'%'});
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(nm,dob,bp){const w={};ans.forEach((a,i)=>Q[i][1][a][1].split(' ').forEach(t=>w[t]=(w[t]||0)+1));
 const seed=hash([nm.trim().toLowerCase(),dob,bp.trim().toLowerCase(),ans.join('')].join('|'));
 let best=-1,bi=0;A.forEach((a,i)=>{const s=a[3].reduce((t,g,k)=>t+(w[g]||0)*(k<2?1.6:1),0)+((hash(seed+':'+i)%1000)/1000)*0.9;if(s>best){best=s;bi=i}});
 const second=A.map((a,i)=>[a[3].reduce((t,g)=>t+(w[g]||0),0)+(hash(seed+'k'+i)%100)/100,i]).filter(x=>x[1]!=bi).sort((a,b)=>b[0]-a[0])[0][1];return{a:A[bi],seed,echo:A[second]}}
const NAMES=['Amara','Ines','Kenji','Leilani','Tariq','Saoirse','Mei','Kwame','Lucia','Ravi','Astrid','Yara','Mateo','Nalani','Farah','Elias'];
let R=null;
$('go').onclick=()=>{const nm=$('nm').value.trim(),dob=$('dob').value,bp=$('bp').value.trim();if(!nm||!dob||!bp){$('err').textContent='Please add your name, date of birth and birthplace.';return}
 if(ans.includes(-1)){$('err').textContent='Please answer all '+Q.length+' questions.';return}$('err').textContent='';
 const p=pick(nm,dob,bp);R={nm,dob,bp,...p,pname:NAMES[p.seed%NAMES.length]};$('form').style.display='none';$('reveal').style.display='block';scrollTo(0,0);
 const msgs=['Stirring the coffee of time...','Turning back the pages...','A face is coming into focus...','Your story is ready.'];msgs.forEach((m,i)=>setTimeout(()=>$('rmsg').textContent=m,i*900));setTimeout(show,3600)};
function show(){const a=R.a;$('reveal').style.display='none';const r=$('reading');r.style.display='block';
 const sec=[['Era and place',`${a[1]} . ${a[2]}`],['Who you were',`${R.nm}, in that life you may have been known as ${R.pname}, ${a[0].replace(/^The /,'the ')}. ${a[4]}`],['The lesson you carried here',a[5]],['Your gifts from that life',a[6]],['A karmic connection',a[7]+` You may also feel an echo of another life as ${R.echo[0].replace(/^The /,'the ')} in ${R.echo[2]}.`],['Your healing affirmation',`<div class="aff">${a[8]}</div>`]];
 r.innerHTML=`<h2>${a[0]}</h2><div class="sub">${R.nm} . born ${R.dob} in ${R.bp}</div>`+sec.map((s,i)=>`<section style="animation-delay:${i*0.45}s"><h3>${s[0]}</h3>${s[1]}</section>`).join('')+
 `<div style="text-align:center;margin-top:14px"><button class="btn" id="card">Download reading card</button><button class="btn g" id="print">Print</button><button class="btn g" id="share">Share</button><button class="btn g" id="again">Start again</button></div><textarea id="st" readonly></textarea><img id="cardimg" alt="Your past life reading card">`;
 $('st').value=`My Coffeebreak Past Life Reading: I was ${a[0].replace(/^The /,"the ")}, ${a[1]}, ${a[2]}. My affirmation: ${a[8]} Find yours at coffeebreaks.itch.io`;
 $('card').onclick=()=>card(c=>{c.toBlob(b=>{const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='coffeebreak_past_life_'+R.nm.replace(/\W+/g,'_')+'.png';l.click()})});
 $('print').onclick=()=>card(c=>{const w=open('');w.document.write(`<img src="${c.toDataURL()}" style="width:100%" onload="print()">`)});
 $('share').onclick=async()=>{try{if(navigator.share)await navigator.share({text:$('st').value});else{await navigator.clipboard.writeText($('st').value);$('share').textContent='Copied'}}catch(e){}};
 $('again').onclick=()=>location.reload();card(c=>{$('cardimg').src=c.toDataURL();$('cardimg').style.display='block'})}
const ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=s});
async function card(done){const a=R.a,[logo,girl,bg]=await Promise.all([ld('logo.jpg'),ld('girl.png'),ld('bg.png')]);const c=document.createElement('canvas');c.width=1080;c.height=1350;const x=c.getContext('2d');
 x.fillStyle='#f9c9dc';x.fillRect(0,0,1080,1350);if(bg){x.globalAlpha=.5;x.fillStyle=x.createPattern(bg,'repeat');x.fillRect(0,0,1080,1350);x.globalAlpha=1}
 x.fillStyle='#fff8fbee';x.strokeStyle='#ff4fa3';x.lineWidth=6;x.beginPath();x.roundRect(50,50,980,1250,40);x.fill();x.stroke();
 if(logo){x.save();x.beginPath();x.arc(540,150,70,0,7);x.clip();x.drawImage(logo,470,80,140,140*logo.height/logo.width);x.restore()}
 x.textAlign='center';x.fillStyle='#a3134f';x.font='bold 40px Georgia';x.fillText('Coffeebreak Past Life Reading',540,270);x.font='italic 26px Georgia';x.fillStyle='#8a1d55';x.fillText(`${R.nm} . ${R.bp}`,540,310);
 x.font='bold 54px Georgia';x.fillStyle='#c2185b';wrapT(x,a[0],540,395,900,60);x.font='italic 30px Georgia';x.fillStyle='#3a1f2a';x.fillText(`${a[1]} . ${a[2]}`,540,480);
 x.textAlign='left';let y=550;const blk=(h,t)=>{x.font='bold 24px Georgia';x.fillStyle='#c2185b';x.fillText(h.toUpperCase(),110,y);y+=34;x.font='24px Georgia';x.fillStyle='#3a1f2a';y=wrapT(x,t,110,y,600,32)+62};
 blk('Lesson',a[5]);blk('Gifts',a[6]);blk('Karmic connection',a[7]);
 if(girl){const gh=520,gw=gh*girl.width/girl.height;x.drawImage(girl,1000-gw,1140-gh,gw,gh)}
 x.textAlign='center';x.fillStyle='#ffe1ee';x.beginPath();x.roundRect(110,1150,860,90,30);x.fill();x.font='italic 30px Georgia';x.fillStyle='#a3134f';wrapT(x,a[8],540,1188,820,34);
 x.font='20px Georgia';x.fillStyle='#8a1d55';x.fillText('For reflection and entertainment . coffeebreaks.itch.io',540,1280);done(c)}
function wrapT(x,t,cx,y,mw,lh){const ws=t.split(' ');let l='';for(const w of ws){const s=l?l+' '+w:w;if(x.measureText(s).width>mw&&l){x.fillText(l,cx,y);y+=lh;l=w}else l=s}x.fillText(l,cx,y);return y}
