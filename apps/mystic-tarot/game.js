const $=id=>document.getElementById(id);
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
// ===== Coffeebreak Mystic Tarot =====
const DEMO=!!window.DEMO,SK=DEMO?'mysticTarotDemo':'mysticTarotSave';window.HERO_SRC='assets/hero.png';
document.addEventListener('pointerdown',()=>startMusic(),{once:true});
let S={};try{S=JSON.parse(localStorage[SK]||'{}')}catch(e){}S.journal=S.journal||[];S.count=S.count||0;
function save(){try{localStorage[SK]=JSON.stringify(S)}catch(e){}}
window.G={state:'home',score:0,level:0};
const GOLD='#e8c070';
// ---- Major Arcana (original names kept as traditional tarot titles; meanings written fresh) ----
const MAJ=[
['The Fool','path','star','A clean page. Step out with curiosity and trust that you will learn the road by walking it.','Rushing without looking, or freezing at the edge. Pause, check your footing, then move.'],
['The Magician','infinity','wand','You already hold the tools you need. Focus your will and make the first real move.','Scattered energy or smoke and mirrors. Be honest about what is real and what is just talk.'],
['The High Priestess','moon','pillars','Quiet knowing. Listen to the still voice underneath the noise before you decide.','Ignoring your gut, or keeping secrets that weigh on you. Make room for silence.'],
['The Empress','heart','tree','Growth, comfort and creativity. Nurture what you love and let yourself receive care too.','Giving until you are empty, or neglecting your own needs. Refill your cup.'],
['The Emperor','crown','mountain','Structure and steady leadership. Set clear boundaries and build something that lasts.','Control that has turned rigid, or a lack of any order at all. Find a fair middle.'],
['The Hierophant','key','pillars','Tradition, teachers and shared values. There is wisdom in learning from those before you.','Questioning the rules. It may be time to find a path that fits your own beliefs.'],
['The Lovers','heart','sun','A meaningful bond or a choice made from the heart. Align your actions with your values.','Mixed signals or a choice that pulls against what you truly value. Seek honesty.'],
['The Chariot','wheel','star','Determination wins the day. Pull your competing drives into one direction and go.','Spinning wheels. Regain control of the reins before pushing harder.'],
['Strength','lion','infinity','Gentle courage. Patience and kindness tame what force never could.','Self-doubt or a short fuse. Be soft with yourself and you will find your power again.'],
['The Hermit','lantern','mountain','Step back and look within. Solitude now brings a light that guides others later.','Isolation that has gone on too long. Reach out; you do not need to walk alone.'],
['Wheel of Fortune','wheel','eye','The tide is turning. Ride the change and notice the patterns repeating in your life.','A stuck cycle or bad timing. Change what you can and let the rest roll by.'],
['Justice','scales','sword','Fairness and clear truth. Actions bring results, so choose with integrity.','Something feels unbalanced or dishonest. Own your part and seek a fair fix.'],
['The Hanged One','tree','eye','Pause and see from a new angle. Letting go of control reveals a hidden answer.','Stalling for the sake of it. Waiting is no longer wise; make the decision.'],
['Death','door','sun','An ending that clears space for something new. Transformation, not a literal death.','Clinging to what is already over. Releasing it will feel lighter than you fear.'],
['Temperance','cup','waves','Balance and blending. Moderation and patience bring a healing middle path.','Overdoing it or swinging between extremes. Gently bring things back to centre.'],
['The Shadow','chain','flame','Look honestly at habits or attachments that hold you. Awareness loosens the chain.','Breaking free. You are seeing a pattern clearly and choosing to step out of it.'],
['The Tower','tower','bolt','A sudden shake-up that topples what was built on shaky ground. Truth breaks through.','Resisting a needed change, or a crisis narrowly avoided. Rebuild on firmer footing.'],
['The Star','star','waves','Hope and renewal after a hard season. Trust that healing is happening.','Losing faith in yourself. Small acts of hope will relight the spark.'],
['The Moon','moon','waves','Things are unclear, and imagination runs wild. Move slowly and trust your intuition.','Confusion lifting. Fears are shrinking as you see what is really there.'],
['The Sun','sun','heart','Joy, warmth and success. Let yourself shine and enjoy the good that is here.','A cloud over the sun. The joy is still there; look for it in simple things.'],
['Awakening','wings','sun','A wake-up call. Reflect on the past, forgive, and answer a higher calling.','Doubting your calling or judging yourself harshly. Give yourself a second chance.'],
['The World','wreath','star','Completion and wholeness. A chapter ends well and you are ready for the next.','Almost there. Tie up loose ends before you celebrate.']];
const SUITS=[['Wands','wand','#7a2e14','#e0763a','drive, creativity and passion'],['Cups','cup','#0f4a52','#3fb0b0','feelings, love and connection'],['Swords','sword','#1d2a4a','#8fa8d8','thoughts, words and truth'],['Pentacles','pentacle','#1f3d1c','#8fc060','money, work, body and home']];
const RANKS=['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
const RU=['A fresh seed of %s appears. Say yes to the new opening.','A choice or partnership in %s. Weigh both sides and decide together.','Early growth in %s. Collaborate and celebrate small wins.','Stability in %s. Rest in what is secure, but do not grip too tightly.','A setback or friction around %s. Learn the lesson and keep going.','Harmony returns to %s. Give and receive generously.','A test of patience in %s. Hold your ground and choose wisely.','Movement and effort in %s. Steady work pays off.','Near fulfilment in %s. Trust yourself; you have come far.','A full cycle of %s completes. Share the harvest and get ready for what is next.','A curious message about %s. Be open to learning something new.','Bold action around %s. Move with purpose, but watch for haste.','Mature, caring mastery of %s. Lead with warmth and wisdom.','Confident authority over %s. Take responsibility and lead by example.'];
const RR=['A delayed start in %s. The seed needs more time or care.','Imbalance or indecision in %s. Be honest about what you want.','Growth stalls in %s. Check that everyone is pulling the same way.','Stuck or holding on too hard to %s. Loosen up a little.','Recovery from trouble in %s. The worst is behind you.','Uneven give and take in %s. Restore fairness.','Feeling overwhelmed in %s. Choose your battles.','Busy work without direction in %s. Refocus your effort.','Nearly there in %s, yet doubt creeps in. Keep faith.','Burden or loss in %s. Let go of what is too heavy.','Mixed messages about %s. Listen before you leap.','Restless or reckless energy in %s. Slow down.','Moody or smothering energy in %s. Care for yourself first.','Stubborn or controlling energy in %s. Lead with fairness.'];
const DECK=[];MAJ.forEach((m,i)=>DECK.push({id:'M'+i,n:m[0],maj:1,num:i,m1:m[1],m2:m[2],up:m[3],rv:m[4]}));
SUITS.forEach((s,si)=>RANKS.forEach((r,ri)=>DECK.push({id:s[0][0]+ri,n:r+' of '+s[0],maj:0,suit:si,rank:ri,up:RU[ri].replace('%s',s[4]),rv:RR[ri].replace('%s',s[4])})));
const ROM=['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
// ---- original art drawn in SVG ----
let uid=0;
function rnd(seed){let s=seed*9301+49297;return()=>((s=(s*9301+49297)%233280)/233280)}
function motif(k,x,y,r,col){col=col||GOLD;const st=`stroke="${col}" stroke-width="${Math.max(1,r/14)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;let o='';
 const pt=(a,rr)=>[x+Math.cos(a)*rr,y+Math.sin(a)*rr];
 switch(k){
 case'sun':o+=`<circle cx="${x}" cy="${y}" r="${r*.45}" fill="${col}" fill-opacity=".85"/>`;for(let i=0;i<12;i++){const a=i*Math.PI/6,p=pt(a,r*.6),q=pt(a,r*(i%2?.85:1));o+=`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${st}/>`}break;
 case'moon':o+=`<path d="M${x+r*.2},${y-r*.8} A${r*.8},${r*.8} 0 1 0 ${x+r*.2},${y+r*.8} A${r*.6},${r*.6} 0 1 1 ${x+r*.2},${y-r*.8}Z" fill="${col}" fill-opacity=".85"/>`;break;
 case'star':{let d='';for(let i=0;i<10;i++){const p=pt(-Math.PI/2+i*Math.PI/5,i%2?r*.4:r);d+=(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}o+=`<path d="${d}Z" fill="${col}" fill-opacity=".8" ${st}/>`;break}
 case'eye':o+=`<path d="M${x-r},${y} Q${x},${y-r*.9} ${x+r},${y} Q${x},${y+r*.9} ${x-r},${y}Z" ${st}/><circle cx="${x}" cy="${y}" r="${r*.28}" fill="${col}"/>`;break;
 case'wheel':o+=`<circle cx="${x}" cy="${y}" r="${r*.85}" ${st}/><circle cx="${x}" cy="${y}" r="${r*.2}" fill="${col}"/>`;for(let i=0;i<8;i++){const p=pt(i*Math.PI/4,r*.85);o+=`<line x1="${x}" y1="${y}" x2="${p[0]}" y2="${p[1]}" ${st}/>`}break;
 case'tower':o+=`<path d="M${x-r*.35},${y+r} L${x-r*.25},${y-r*.6} L${x+r*.25},${y-r*.6} L${x+r*.35},${y+r}Z" ${st}/><path d="M${x-r*.35},${y-r*.6} l${r*.2},-${r*.3} l${r*.15},${r*.15} l${r*.15},-${r*.2} l${r*.2},${r*.35}" ${st}/><rect x="${x-r*.08}" y="${y-r*.2}" width="${r*.16}" height="${r*.25}" fill="${col}"/>`;break;
 case'bolt':o+=`<path d="M${x+r*.2},${y-r} L${x-r*.3},${y+r*.1} L${x},${y+r*.1} L${x-r*.2},${y+r} L${x+r*.4},${y-r*.2} L${x+r*.05},${y-r*.2}Z" fill="${col}"/>`;break;
 case'heart':o+=`<path d="M${x},${y+r*.8} C${x-r*1.2},${y-r*.1} ${x-r*.5},${y-r} ${x},${y-r*.35} C${x+r*.5},${y-r} ${x+r*1.2},${y-r*.1} ${x},${y+r*.8}Z" fill="${col}" fill-opacity=".8" ${st}/>`;break;
 case'scales':o+=`<line x1="${x}" y1="${y-r}" x2="${x}" y2="${y+r}" ${st}/><line x1="${x-r*.8}" y1="${y-r*.6}" x2="${x+r*.8}" y2="${y-r*.6}" ${st}/><path d="M${x-r},${y} Q${x-r*.8},${y+r*.35} ${x-r*.6},${y} M${x+r*.6},${y} Q${x+r*.8},${y+r*.35} ${x+r},${y} M${x-r*.8},${y-r*.6} L${x-r},${y} M${x-r*.8},${y-r*.6} L${x-r*.6},${y} M${x+r*.8},${y-r*.6} L${x+r},${y} M${x+r*.8},${y-r*.6} L${x+r*.6},${y}" ${st}/>`;break;
 case'lantern':o+=`<path d="M${x-r*.4},${y-r*.5} h${r*.8} l-${r*.1},${r*1.1} h-${r*.6}Z" ${st}/><path d="M${x},${y-r*.5} v-${r*.4} m-${r*.2},0 h${r*.4}" ${st}/><circle cx="${x}" cy="${y+r*.05}" r="${r*.2}" fill="${col}"/>`;break;
 case'crown':o+=`<path d="M${x-r*.8},${y+r*.4} L${x-r*.8},${y-r*.4} L${x-r*.4},${y} L${x},${y-r*.6} L${x+r*.4},${y} L${x+r*.8},${y-r*.4} L${x+r*.8},${y+r*.4}Z" fill="${col}" fill-opacity=".8" ${st}/>`;break;
 case'infinity':o+=`<path d="M${x},${y} C${x-r*.4},${y-r*.6} ${x-r},${y-r*.4} ${x-r},${y} C${x-r},${y+r*.4} ${x-r*.4},${y+r*.6} ${x},${y} C${x+r*.4},${y-r*.6} ${x+r},${y-r*.4} ${x+r},${y} C${x+r},${y+r*.4} ${x+r*.4},${y+r*.6} ${x},${y}Z" ${st}/>`;break;
 case'mountain':o+=`<path d="M${x-r},${y+r*.6} L${x-r*.3},${y-r*.5} L${x},${y} L${x+r*.35},${y-r*.7} L${x+r},${y+r*.6}Z" fill="${col}" fill-opacity=".35" ${st}/>`;break;
 case'waves':for(let i=0;i<3;i++){const yy=y-r*.4+i*r*.4;o+=`<path d="M${x-r},${yy} q${r/4},-${r/4} ${r/2},0 t${r/2},0 t${r/2},0 t${r/2},0" ${st}/>`}break;
 case'flame':o+=`<path d="M${x},${y-r} C${x+r*.7},${y-r*.2} ${x+r*.5},${y+r*.7} ${x},${y+r*.7} C${x-r*.5},${y+r*.7} ${x-r*.7},${y-r*.2} ${x},${y-r}Z" fill="${col}" fill-opacity=".75"/>`;break;
 case'key':o+=`<circle cx="${x}" cy="${y-r*.55}" r="${r*.3}" ${st}/><path d="M${x},${y-r*.25} V${y+r} M${x},${y+r*.6} h${r*.3} M${x},${y+r*.85} h${r*.25}" ${st}/>`;break;
 case'lion':o+=`<circle cx="${x}" cy="${y}" r="${r*.75}" ${st} stroke-dasharray="${r/6} ${r/10}"/><circle cx="${x}" cy="${y}" r="${r*.45}" fill="${col}" fill-opacity=".6"/><circle cx="${x-r*.15}" cy="${y-r*.1}" r="${r*.06}" fill="#1a0f24"/><circle cx="${x+r*.15}" cy="${y-r*.1}" r="${r*.06}" fill="#1a0f24"/>`;break;
 case'path':o+=`<path d="M${x-r*.15},${y+r} Q${x-r*.6},${y} ${x},${y-r*.2} Q${x+r*.5},${y-r*.5} ${x+r*.6},${y-r}" ${st}/><path d="M${x+r*.35},${y+r} Q${x},${y+r*.1} ${x+r*.4},${y-r*.1}" ${st}/>`;break;
 case'pillars':o+=`<rect x="${x-r*.9}" y="${y-r}" width="${r*.35}" height="${r*2}" fill="${col}" fill-opacity=".3" ${st}/><rect x="${x+r*.55}" y="${y-r}" width="${r*.35}" height="${r*2}" fill="#1a0f24" ${st}/>`;break;
 case'tree':o+=`<line x1="${x}" y1="${y+r}" x2="${x}" y2="${y-r*.1}" ${st}/><circle cx="${x}" cy="${y-r*.4}" r="${r*.55}" fill="${col}" fill-opacity=".45" ${st}/>`;break;
 case'door':o+=`<path d="M${x-r*.5},${y+r} V${y-r*.3} A${r*.5},${r*.5} 0 0 1 ${x+r*.5},${y-r*.3} V${y+r}Z" ${st}/><path d="M${x-r*.5},${y+r} L${x},${y+r*.2} L${x+r*.5},${y+r}" fill="${col}" fill-opacity=".4"/>`;break;
 case'chain':for(let i=0;i<3;i++)o+=`<ellipse cx="${x}" cy="${y-r*.6+i*r*.6}" rx="${r*.25}" ry="${r*.38}" ${st}/>`;break;
 case'wings':o+=`<path d="M${x},${y} C${x-r*.4},${y-r} ${x-r},${y-r*.8} ${x-r},${y-r*.2} C${x-r*.7},${y} ${x-r*.4},${y+r*.2} ${x},${y}Z M${x},${y} C${x+r*.4},${y-r} ${x+r},${y-r*.8} ${x+r},${y-r*.2} C${x+r*.7},${y} ${x+r*.4},${y+r*.2} ${x},${y}Z" fill="${col}" fill-opacity=".5" ${st}/>`;break;
 case'wreath':o+=`<ellipse cx="${x}" cy="${y}" rx="${r*.65}" ry="${r*.9}" ${st} stroke-width="${r/6}" stroke-dasharray="${r/5} ${r/12}"/>`;break;
 case'cup':o+=`<path d="M${x-r*.55},${y-r*.6} h${r*1.1} Q${x+r*.5},${y+r*.2} ${x},${y+r*.25} Q${x-r*.5},${y+r*.2} ${x-r*.55},${y-r*.6}Z" fill="${col}" fill-opacity=".55" ${st}/><path d="M${x},${y+r*.25} V${y+r*.75} M${x-r*.35},${y+r*.8} h${r*.7}" ${st}/>`;break;
 case'sword':o+=`<path d="M${x},${y-r} L${x+r*.1},${y+r*.4} L${x-r*.1},${y+r*.4}Z" fill="${col}" fill-opacity=".7"/><path d="M${x-r*.35},${y+r*.45} h${r*.7} M${x},${y+r*.45} V${y+r}" ${st}/>`;break;
 case'wand':o+=`<line x1="${x-r*.5}" y1="${y+r}" x2="${x+r*.5}" y2="${y-r}" ${st} stroke-width="${r/7}"/><circle cx="${x+r*.2}" cy="${y-r*.4}" r="${r*.1}" fill="#9fd860"/><circle cx="${x-r*.15}" cy="${y+r*.3}" r="${r*.1}" fill="#9fd860"/>`;break;
 case'pentacle':{o+=`<circle cx="${x}" cy="${y}" r="${r*.8}" fill="${col}" fill-opacity=".25" ${st}/>`;let d='';for(let i=0;i<5;i++){const p=pt(-Math.PI/2+i*4*Math.PI/5,r*.65);d+=(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)}o+=`<path d="${d}Z" ${st}/>`;break}
 }return o.replace(/<\w+[^>]*>/g,t=>{const seen={};return t.replace(/\s([\w-]+)="[^"]*"/g,(m,a)=>seen[a]?'':(seen[a]=1,m))})}
function sky(seed,n){const R=rnd(seed);let o='';for(let i=0;i<n;i++)o+=`<circle cx="${(10+R()*100).toFixed(1)}" cy="${(14+R()*140).toFixed(1)}" r="${(R()*1.2+.3).toFixed(2)}" fill="#fff" fill-opacity="${(R()*.6+.2).toFixed(2)}"/>`;return o}
function frame(c1,c2,top,title){const g='g'+(++uid);return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}" stop-opacity=".55"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="#0b0614"/></linearGradient></defs><rect width="120" height="196" rx="8" fill="#0b0614"/><rect x="4" y="4" width="112" height="188" rx="6" fill="url(#${g})" stroke="${GOLD}" stroke-width="1.6"/><rect x="8" y="8" width="104" height="180" rx="4" fill="none" stroke="${GOLD}" stroke-width=".5" stroke-opacity=".7"/><text x="60" y="22" text-anchor="middle" font-family="Georgia" font-size="11" fill="${GOLD}">${top}</text><rect x="10" y="164" width="100" height="20" rx="3" fill="#0b0614" fill-opacity=".75" stroke="${GOLD}" stroke-width=".6"/><text x="60" y="178" text-anchor="middle" font-family="Georgia" font-size="${title.length>16?8:9.5}" fill="#f3e6c8">${title}</text>`}
const PIPS={1:[[60,92]],2:[[60,60],[60,124]],3:[[60,52],[60,92],[60,132]],4:[[38,62],[82,62],[38,122],[82,122]],5:[[38,58],[82,58],[60,92],[38,126],[82,126]],6:[[38,52],[82,52],[38,92],[82,92],[38,132],[82,132]],7:[[38,48],[82,48],[60,70],[38,96],[82,96],[38,134],[82,134]],8:[[38,46],[82,46],[38,76],[82,76],[38,106],[82,106],[38,136],[82,136]],9:[[38,46],[82,46],[38,76],[82,76],[60,92],[38,108],[82,108],[38,138],[82,138]],10:[[38,44],[82,44],[60,60],[38,78],[82,78],[38,106],[82,106],[60,124],[38,140],[82,140]]};
const COURT=['star','path','crown','crown'];
function cardSVG(c){let o;
 if(c.maj){o=frame('#2a1650','#7a4cc0',ROM[c.num],c.n)+sky(c.num+7,26)+`<circle cx="60" cy="90" r="40" fill="#0b0614" fill-opacity=".35" stroke="${GOLD}" stroke-width=".6" stroke-dasharray="2 3"/>`+motif(c.m1,60,90,30)+motif(c.m2,26,42,9,'#f3e6c8')+motif(c.m2,94,142,9,'#f3e6c8')}
 else{const s=SUITS[c.suit];o=frame(s[2],s[3],c.rank<10?(c.rank?c.rank+1:'Ace'):RANKS[c.rank],c.n)+sky(c.suit*20+c.rank,14);
  if(c.rank<10){const P=PIPS[c.rank+1],r=c.rank?(c.rank>5?10:13):30;P.forEach(p=>o+=motif(s[1],p[0],p[1],r))}
  else{o+=`<circle cx="60" cy="96" r="36" fill="#0b0614" fill-opacity=".4" stroke="${GOLD}" stroke-width=".6"/>`+motif(s[1],60,104,24)+motif(COURT[c.rank-10],60,58,14,'#f3e6c8')}}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 196">${o}</svg>`}
function backSVG(){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 196"><rect width="120" height="196" rx="8" fill="#1a0f2e"/><rect x="5" y="5" width="110" height="186" rx="6" fill="#2b1840" stroke="${GOLD}" stroke-width="1.6"/>${sky(3,30)}<circle cx="60" cy="98" r="34" fill="none" stroke="${GOLD}" stroke-width="1"/><circle cx="60" cy="98" r="26" fill="none" stroke="${GOLD}" stroke-width=".5" stroke-dasharray="2 2"/>${motif('eye',60,98,18)}${motif('moon',60,40,10)}${motif('star',60,158,9)}<text x="60" y="182" text-anchor="middle" font-family="Georgia" font-size="7" fill="${GOLD}">COFFEEBREAK</text></svg>`}
// ---- spreads (x,y as fractions of table) ----
const SPREADS={
daily:{n:'Daily Card',d:'One card for today’s message.',free:1,p:[['Today’s message',.5,.4]]},
three:{n:'Past · Present · Future',d:'Three cards along your timeline.',free:1,p:[['Past',.3,.4],['Present',.5,.4],['Future',.7,.4]]},
love:{n:'Love Spread',d:'Five cards on the heart and connection.',p:[['You',.3,.25],['Them / the other side',.7,.25],['The connection',.5,.45],['The challenge',.3,.72],['Where it is heading',.7,.72]]},
career:{n:'Career Path',d:'Five cards on work and purpose.',p:[['Where you stand',.14,.4],['Your strength',.32,.4],['The obstacle',.5,.4],['Hidden opportunity',.68,.4],['Next step',.86,.4]]},
yesno:{n:'Yes or No',d:'A playful one-card answer.',p:[['The answer',.5,.4]]},
celtic:{n:'Celtic Cross',d:'The classic ten-card deep dive.',sm:1,p:[['The present',.3,.42],['The crossing challenge',.3,.42],['Root of the matter',.3,.8],['The recent past',.13,.42],['What could be',.3,.05],['The near future',.47,.42],['Yourself',.75,.8],['Surroundings',.75,.55],['Hopes and fears',.75,.3],['Outcome',.75,.05]]},
moon:{n:'Moon Phases',d:'Six cards following the moon’s cycle.',p:[['New Moon: your intention',.12,.4],['Waxing: what to grow',.28,.25],['Full Moon: what is revealed',.5,.12],['Waning: what to release',.72,.25],['Dark Moon: rest',.88,.4],['Guidance',.5,.62]]}};
// ---- views ----
const M=$('main');let cur=null;
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('sel',x===b));view(b.dataset.v)});
function view(v){G.state=v;({home,deck:deckView,journal}[v])()}
function lockMsg(){alert('This spread is in the full Coffeebreak Mystic Tarot ($4.99): all 78 cards, Love, Career, Yes/No, Celtic Cross and Moon spreads, plus PNG saving. Get it at coffeebreaks.itch.io/coffeebreak-mystic-tarot')}
function home(){M.innerHTML=`<h2>Choose a spread</h2><p style="color:#cbb8e0;margin:2px">Hold a question in mind, shuffle, cut, then turn your cards.${DEMO?'<br><small>Free demo: Daily Card and Past · Present · Future with the 22 Major Arcana.</small>':''}</p><div class="spreads">${Object.keys(SPREADS).map(k=>{const s=SPREADS[k],lk=DEMO&&!s.free;return `<div class="sp${lk?' lock':''}" data-k="${k}"><b>${lk?'🔒 ':''}${s.n}</b><small>${s.d} (${s.p.length} card${s.p.length>1?'s':''})</small></div>`}).join('')}</div>`;
 M.querySelectorAll('.sp').forEach(e=>e.onclick=()=>{const k=e.dataset.k;if(DEMO&&!SPREADS[k].free)return lockMsg();begin(k)})}
function pool(){return DECK.filter(c=>!DEMO||c.maj)}
function begin(k){const sp=SPREADS[k];G.state='reading';cur={k,q:'',cards:[],flipped:0,date:new Date().toISOString()};
 M.innerHTML=`<h2>${sp.n}</h2><input id="q" placeholder="Your question (optional)" style="width:min(80vw,420px)"> <div style="margin:6px"><button id="bSh">🔀 Shuffle</button> <button id="bCut" disabled>✂️ Cut</button> <button id="bDeal" disabled>🂠 Deal</button> <button id="bAll" disabled>✨ Flip all</button> <button id="bBack">← Spreads</button></div><div id="table"></div><div id="out"></div>`;
 const T=$('table'),w=T.clientWidth,h=T.clientHeight,sc=Math.min(1,w/980)*(sp.sm?.72:1),cw=92*sc,ch=150*sc;
 let d=pool().slice();for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}
 const stack=[];for(let i=0;i<12;i++){const e=mk(null,cw,ch);e.style.left=(w/2-cw/2-i*.6)+'px';e.style.top=(h/2-ch/2-i*.6)+'px';T.appendChild(e);stack.push(e)}
 $('bBack').onclick=home;
 $('bSh').onclick=()=>{stack.forEach((e,i)=>{e.style.setProperty('--dx',(i%2?1:-1)*(40+i*4)*sc+'px');e.style.setProperty('--r',(i%2?8:-8)+'deg');e.classList.remove('shuf');void e.offsetWidth;e.classList.add('shuf')});
  for(let i=d.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[d[i],d[j]]=[d[j],d[i]]}$('bCut').disabled=false};
 $('bCut').onclick=()=>{stack.forEach((e,i)=>{e.style.left=(w/2-cw/2+((i%3)-1)*(cw+20))+'px'});setTimeout(()=>stack.forEach((e,i)=>{e.style.left=(w/2-cw/2-i*.6)+'px'}),750);
  const c=10+(Math.random()*(d.length-20)|0);d=d.slice(c).concat(d.slice(0,c));$('bDeal').disabled=false;$('bSh').disabled=true};
 $('bDeal').onclick=()=>{$('bDeal').disabled=true;$('bCut').disabled=true;cur.q=$('q').value.trim();
  sp.p.forEach((p,i)=>{const c=d[i],rev=Math.random()<.3;cur.cards.push({id:c.id,rev});const e=mk(c,cw,ch,rev,p[0]);e.style.left=(w/2-cw/2)+'px';e.style.top=(h/2-ch/2)+'px';T.appendChild(e);
   setTimeout(()=>{e.style.left=(p[1]*w-cw/2)+'px';e.style.top=(p[2]*h)+'px';if(k==='celtic'&&i===1)e.style.transform='rotate(90deg)'},120+i*220);
   e.onclick=()=>flip(e)});stack.forEach(e=>e.style.opacity=.25);setTimeout(()=>$('bAll').disabled=false,200+sp.p.length*220)};
 $('bAll').onclick=()=>T.querySelectorAll('.card[data-id]:not(.up)').forEach((e,i)=>setTimeout(()=>flip(e),i*250))}
function mk(c,cw,ch,rev,lbl){const e=document.createElement('div');e.className='card'+(rev?' rev':'');e.style.width=cw+'px';e.style.height=ch+'px';
 e.innerHTML=`<div class="in"><div class="b">${backSVG()}</div><div class="f">${c?cardSVG(c):''}</div></div>`+(lbl?`<div class="lbl" style="top:${ch+2}px">${lbl}</div>`:'');if(c)e.dataset.id=c.id;return e}
function flip(e){if(e.classList.contains('up'))return;e.classList.add('up');cur.flipped++;if(cur.flipped===cur.cards.length)setTimeout(summary,700)}
const byId=id=>DECK.find(c=>c.id===id);
function summarize(r){const sp=SPREADS[r.k];let h='',maj=0,rv=0,su=[0,0,0,0];
 r.cards.forEach((x,i)=>{const c=byId(x.id);if(c.maj)maj++;else su[c.suit]++;if(x.rev)rv++;h+=`<h3>${sp.p[i][0]}: ${c.n}${x.rev?' (reversed)':''}</h3><div>${x.rev?c.rv:c.up}</div>`});
 const n=r.cards.length,lines=[];
 if(r.k==='yesno'){const c=byId(r.cards[0].id),maybe=['M12','M18','M10','M2'].includes(c.id);lines.push(maybe?'The answer leans to <b>maybe</b>: the situation is still taking shape.':r.cards[0].rev?'The answer leans to <b>no</b>, or not yet.':'The answer leans to <b>yes</b>.')}
 if(n>1){if(maj/n>=.5)lines.push('Many Major Arcana cards appear, so this is a meaningful chapter with big lessons rather than everyday detail.');
  const mx=Math.max(...su);if(mx>=2){const s=su.indexOf(mx);lines.push(`${SUITS[s][0]} lead the reading, putting the focus on ${SUITS[s][4]}.`)}
  if(rv/n>.5)lines.push('Several cards are reversed, which suggests energy that is blocked or turned inward. Be patient and gentle with yourself.');else if(rv===0)lines.push('All cards are upright, so the energy here flows freely.')}
 const last=byId(r.cards[n-1].id);lines.push(`The closing card, ${last.n}, offers this thought to carry with you: ${(r.cards[n-1].rev?last.rv:last.up).split('. ')[0]}.`);
 return {html:h,sum:lines.join(' ')}}
function summary(){const s=summarize(cur);S.count++;G.score=S.count;save();
 $('out').innerHTML=`<div class="reading">${cur.q?`<p><i>“${esc(cur.q)}”</i></p>`:''}<h3>✨ Reading summary</h3><p>${s.sum}</p>${s.html}<p style="font-size:12px;color:#cbb8e0">For entertainment and reflection only.</p><div style="text-align:center"><button id="bSave">📔 Save to journal</button> <button id="bPng">🖼️ Save as PNG</button> <button id="bNew">🔮 New reading</button></div></div>`;
 $('bSave').onclick=()=>{S.journal.unshift(Object.assign({note:''},cur));save();$('bSave').textContent='✔ Saved';$('bSave').disabled=true};
 $('bPng').onclick=()=>png(cur);$('bNew').onclick=home;$('out').scrollIntoView({behavior:'smooth'})}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function img(svg){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
async function png(r){if(DEMO){lockMsg();return}const sp=SPREADS[r.k],s=summarize(r),W=1200,cv=document.createElement('canvas'),x=cv.getContext('2d');
 const n=r.cards.length,cw=Math.min(150,(W-80)/n-14),ch=cw*196/120;
 const txt=s.html.replace(/<h3>/g,'\n## ').replace(/<\/h3>/g,'\n').replace(/<[^>]+>/g,'');const all=('Summary: '+s.sum.replace(/<[^>]+>/g,'')+'\n'+txt).split('\n');
 x.font='20px Georgia';const L=[];all.forEach(p=>{if(!p.trim())return;const hd=p.startsWith('## ');let w='',words=p.replace('## ','').split(' ');words.forEach(t=>{if(x.measureText(w+t).width>W-100){L.push([w,hd]);w=''}w+=t+' '});L.push([w,hd])});
 cv.width=W;cv.height=200+ch+L.length*28+80;const g=x.createLinearGradient(0,0,0,cv.height);g.addColorStop(0,'#2a1640');g.addColorStop(1,'#0b0614');x.fillStyle=g;x.fillRect(0,0,W,cv.height);
 x.fillStyle=GOLD;x.textAlign='center';x.font='38px Georgia';x.fillText('Coffeebreak Mystic Tarot · '+sp.n,W/2,58);x.font='italic 20px Georgia';x.fillStyle='#f3e6c8';x.fillText((r.q?'“'+r.q+'”  ·  ':'')+new Date(r.date).toLocaleDateString('en-AU'),W/2,92);
 const x0=(W-n*(cw+14)+14)/2;for(let i=0;i<n;i++){const c=byId(r.cards[i].id),im=await img(cardSVG(c));const cx=x0+i*(cw+14);x.save();if(r.cards[i].rev){x.translate(cx+cw/2,120+ch/2);x.rotate(Math.PI);x.translate(-(cx+cw/2),-(120+ch/2))}if(im)x.drawImage(im,cx,120,cw,ch);x.restore()}
 x.textAlign='left';let y=150+ch;L.forEach(([t,hd])=>{x.font=hd?'bold 21px Georgia':'20px Georgia';x.fillStyle=hd?GOLD:'#f3e6c8';x.fillText(t,50,y);y+=28});
 x.font='14px Georgia';x.fillStyle='#cbb8e0';x.textAlign='center';x.fillText('For entertainment and reflection only · coffeebreaks.itch.io',W/2,cv.height-24);
 const a=document.createElement('a');a.download='mystic-tarot-'+r.k+'.png';a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();window.LAST_PNG=a.href.length}
function deckView(){const p=pool();M.innerHTML=`<h2>The Deck (${p.length} cards)</h2>${DEMO?'<p style="color:#cbb8e0">Demo shows the 22 Major Arcana. The full app has all 78.</p>':''}<div class="grid">${p.map(c=>`<div class="mini" data-id="${c.id}">${cardSVG(c)}<div>${c.n}</div></div>`).join('')}</div>`;
 M.querySelectorAll('.mini').forEach(e=>e.onclick=()=>{const c=byId(e.dataset.id),m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="box">${cardSVG(c)}<div style="flex:1;min-width:220px"><h2>${c.n}</h2><p><b style="color:${GOLD}">Upright:</b> ${c.up}</p><p><b style="color:${GOLD}">Reversed:</b> ${c.rv}</p><button>Close</button></div></div>`;m.onclick=ev=>{if(ev.target===m||ev.target.tagName==='BUTTON')m.remove()};document.body.appendChild(m)})}
function journal(){const J=S.journal;M.innerHTML=`<h2>📔 Reading Journal</h2><p style="color:#cbb8e0">Saved on this device only. ${J.length} reading${J.length===1?'':'s'}.</p>`+(J.length?'':'<p>No readings saved yet.</p>')+J.map((r,i)=>`<div class="jent"><b style="color:${GOLD}">${SPREADS[r.k].n}</b> · ${new Date(r.date).toLocaleString('en-AU')}${r.q?` · <i>“${esc(r.q)}”</i>`:''}<div>${r.cards.map((x,j)=>SPREADS[r.k].p[j][0]+': '+byId(x.id).n+(x.rev?' (rev)':'')).join(' · ')}</div><textarea data-i="${i}" rows="2" style="width:96%" placeholder="Your reflections...">${esc(r.note||'')}</textarea><div><button data-png="${i}">🖼️ PNG</button> <button data-del="${i}">🗑 Delete</button></div></div>`).join('');
 M.querySelectorAll('textarea').forEach(t=>t.onchange=()=>{J[t.dataset.i].note=t.value;save()});
 M.querySelectorAll('[data-png]').forEach(b=>b.onclick=()=>png(J[b.dataset.png]));
 M.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this reading?')){J.splice(b.dataset.del,1);save();journal()}})}
window.MT={DECK,SPREADS,begin,summarize,png,cardSVG};
home();
