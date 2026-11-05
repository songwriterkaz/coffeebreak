/* Coffeebreak Lyric Cleaner engine. Rule-based, offline. (c) Coffeebreak */
(function(g){
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const norm=s=>s.replace(/[\u2018\u2019]/g,"'");
function find(line,list){const out=[];const L=norm(line).toLowerCase();(list||[]).forEach(w=>{const re=new RegExp('(^|[^a-z0-9\'])('+esc(w.toLowerCase())+')(?=$|[^a-z0-9])','g');let m;while((m=re.exec(L))){out.push({w:w,i:m.index+m[1].length,n:m[2].length})}});return out}
function keep(src,rep){if(src===src.toUpperCase()&&/[A-Z]/.test(src))return rep.toUpperCase();if(src[0]&&src[0]===src[0].toUpperCase()&&/[A-Z]/.test(src[0]))return rep[0].toUpperCase()+rep.slice(1);return rep}
function replaceHits(line,hits){hits=hits.slice().sort((a,b)=>b.i-a.i);const used=[];let s=line;hits.forEach(h=>{if(used.some(u=>h.i<u.i+u.n&&u.i<h.i+h.n))return;used.push(h);s=s.slice(0,h.i)+keep(line.substr(h.i,h.n),h.rep)+s.slice(h.i+h.n)});return s.replace(/\s{2,}/g,' ').trim()}
const pick=(m,w)=>Array.isArray(m)?m:(m&&(m[w]||m._default))||['grown'];
function scanLine(line,W,radio){
 const r={line:line,sev:'green',reasons:[],rewrites:[]};if(!line.trim())return r;
 const sex=find(line,W.sexual),rom=find(line,W.romantic),adult=find(line,W.adult_markers);
 const gro=find(line,W.grooming_phrases),gap=find(line,W.age_gap_phrases),age=find(line,W.ages_under_18);
 const ys=find(line,W.youth_strong),ya=find(line,W.youth_ambiguous).filter(a=>!ys.some(s=>a.i>=s.i&&a.i<s.i+s.n));
 const ctx=sex.length?'sexual or body words ('+sex.map(x=>x.w).join(', ')+')':rom.length?'romantic words ('+rom.map(x=>x.w).join(', ')+')':'';
 let lv=0;const up=(n,why)=>{lv=Math.max(lv,n);r.reasons.push(why)};
 const fix=[];
 if(gro.length){up(2,'Grooming-style phrase: "'+gro.map(x=>x.w).join('", "')+'". Secrecy or "mature for your age" lines are a known warning sign.');gro.forEach(h=>fix.push({h:h,opts:pick(W.grooming_swaps,h.w)}))}
 if(gap.length){up(sex.length?2:1,'Age-gap phrasing: "'+gap.map(x=>x.w).join('", "')+'"'+(ctx?' next to '+ctx:'')+'. Could suggest one person is under age.');gap.forEach(h=>fix.push({h:h,opts:pick(W.age_gap_swaps,h.w)}))}
 if(age.length&&(sex.length||rom.length)){up(sex.length?2:1,'Under-18 age ("'+age.map(x=>x.w).join('", "')+'") with '+ctx+'.');age.forEach(h=>fix.push({h:h,opts:W.age_swaps}))}
 if(ys.length&&(sex.length||rom.length)){up(sex.length?2:1,'Youth word ("'+ys.map(x=>x.w).join('", "')+'") with '+ctx+'.');ys.forEach(h=>fix.push({h:h,opts:(W.youth_strong_swaps||{})[h.w]||['grown','','grown-up']}))}
 if(ya.length&&sex.length){if(adult.length)r.reasons.push('Pet name ("'+ya.map(x=>x.w).join('", "')+'") is fine here because the line says adult ('+adult.map(x=>x.w).join(', ')+').');else{up(1,'Pet name ("'+ya.map(x=>x.w).join('", "')+'") in a sexual line could be misread as about a young person. Making the adult context clear removes doubt.');ya.forEach(h=>fix.push({h:h,opts:(W.pet_swaps||{})[h.w]||['darling','love','honey']}))}}
 if(radio){const sw=W.swears||{};const s=find(line,Object.keys(sw));const ex=find(line,W.explicit).filter(e=>!s.some(x=>x.i===e.i));
  if(s.length){up(1,'Radio/Suno: swearing ("'+s.map(x=>x.w).join('", "')+'").');s.forEach(h=>fix.push({h:h,opts:[sw[h.w][0],sw[h.w][1]||sw[h.w][0],sw[h.w][0]]}))}
  if(ex.length){up(1,'Radio/Suno: explicit word ("'+ex.map(x=>x.w).join('", "')+'").');ex.forEach(h=>fix.push({h:h,opts:['love','touch','heart']}))}}
 r.sev=['green','amber','red'][lv];
 if(fix.length){const seen={};for(let k=0;k<3;k++){const t=replaceHits(line,fix.map(f=>Object.assign({},f.h,{rep:f.opts[k%f.opts.length]||''})));if(t&&!seen[t]&&t!==line){seen[t]=1;r.rewrites.push(t)}}}
 if(lv&&!r.rewrites.length)r.rewrites.push('(Rewrite this line by hand to make it clearly about adults.)');
 return r}
function scan(text,W,radio){return text.split(/\r?\n/).map(l=>scanLine(l,W,radio))}
function applyAll(res){return res.map(r=>r.sev!=='green'&&r.rewrites[0]&&r.rewrites[0][0]!=='('?r.rewrites[0]:r.line).join('\n')}
g.LyricCleaner={scan,scanLine,applyAll};
if(typeof module!=='undefined')module.exports=g.LyricCleaner;
})(typeof window!=='undefined'?window:globalThis);
